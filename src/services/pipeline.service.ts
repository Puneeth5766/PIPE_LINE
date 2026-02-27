import { IssueStatus } from "@prisma/client";
import { getProvider } from "../ai/provider-factory";
import { runAnalystAgent } from "../agents/analyst.agent";
import { runEvaluatorAgent } from "../agents/evaluator.agent";
import { runScoutAgent } from "../agents/scout.agent";
import { runVoiceAgent } from "../agents/voice.agent";
import { loadPipelineConfig } from "../config/pipeline-config";
import { prisma } from "../db/prisma";
import { ingestAllSources } from "../ingestion";
import { SourceItemInput } from "../types/schemas";
import { logger } from "../utils/logger";
import { createBeehiivDraft, scheduleBeehiivPost } from "./beehiiv.service";
import { sendTelegramAlert } from "./telegram.service";
import { calculateMaxSimilarity, upsertIssueEmbedding } from "./vector.service";

const findItem = (items: SourceItemInput[], sourceItemId: string): SourceItemInput => {
  const found = items.find((item) => item.externalId === sourceItemId || item.title === sourceItemId);
  if (!found) {
    throw new Error(`Source item not found for selector: ${sourceItemId}`);
  }
  return found;
};

export const runPipeline = async (): Promise<string> => {
  const config = loadPipelineConfig();
  const provider = getProvider(config);

  const sourceItems = await ingestAllSources();
  const issue = await prisma.issue.create({
    data: {
      issueDate: new Date(),
      title: "Founder’s Edge Weekly",
      markdown: "",
      status: IssueStatus.DRAFT,
      sourceSnapshot: sourceItems as object,
      metadata: {}
    }
  });

  try {
    const scout = await runScoutAgent(issue.id, provider, sourceItems);
    const selectedTool = findItem(sourceItems, scout.selectedTool.sourceItemId);
    const analyst = await runAnalystAgent(issue.id, provider, selectedTool);
    let voice = await runVoiceAgent(issue.id, provider, scout, analyst, sourceItems);
    let evaluator = await runEvaluatorAgent(issue.id, provider, voice.markdown);

    if (evaluator.overall < config.evaluation_min_score && config.regeneration_limit > 0) {
      logger.warn({ score: evaluator.overall }, "Evaluator below threshold, regenerating once");
      voice = await runVoiceAgent(issue.id, provider, scout, analyst, sourceItems);
      evaluator = await runEvaluatorAgent(issue.id, provider, voice.markdown);
    }

    if (evaluator.overall < config.evaluation_min_score) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: { status: IssueStatus.BLOCKED, evaluatorScore: evaluator.overall, markdown: voice.markdown, title: voice.title }
      });
      await sendTelegramAlert(`❌ Founder’s Edge pipeline blocked. Evaluator score: ${evaluator.overall}`);
      return issue.id;
    }

    const embedding = await provider.embed(voice.markdown, config.embedding_model);
    const similarity = await calculateMaxSimilarity(embedding);

    if (similarity >= config.similarity_threshold) {
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          status: IssueStatus.BLOCKED,
          evaluatorScore: evaluator.overall,
          similarityScore: similarity,
          markdown: voice.markdown,
          title: voice.title
        }
      });
      await sendTelegramAlert(`❌ Founder’s Edge blocked for similarity (${similarity.toFixed(3)}).`);
      return issue.id;
    }

    const draftId = await createBeehiivDraft(voice.title, voice.markdown);
    await prisma.issue.update({
      where: { id: issue.id },
      data: {
        title: voice.title,
        markdown: voice.markdown,
        status: IssueStatus.PENDING_APPROVAL,
        evaluatorScore: evaluator.overall,
        similarityScore: similarity,
        beehiivDraftId: draftId,
        metadata: {
          scout,
          analyst,
          evaluator,
          draftId
        }
      }
    });

    await upsertIssueEmbedding(issue.id, voice.markdown, embedding);
    await sendTelegramAlert(`✅ Founder’s Edge issue ready for approval. Issue ID: ${issue.id}`);
    return issue.id;
  } catch (error) {
    await prisma.issue.update({
      where: { id: issue.id },
      data: { status: IssueStatus.FAILED, metadata: { error: String(error) } }
    });
    await sendTelegramAlert(`❌ Founder’s Edge pipeline failed. Issue ID: ${issue.id}`);
    throw error;
  }
};

export const approveLatestIssue = async (): Promise<void> => {
  const issue = await prisma.issue.findFirst({ where: { status: IssueStatus.PENDING_APPROVAL }, orderBy: { createdAt: "desc" } });
  if (!issue?.beehiivDraftId) {
    throw new Error("No pending issue with Beehiiv draft found.");
  }

  const now = new Date();
  const scheduledAt = new Date(now);
  const day = scheduledAt.getDay();
  const diff = (3 - day + 7) % 7;
  scheduledAt.setDate(scheduledAt.getDate() + (diff === 0 ? 7 : diff));
  scheduledAt.setHours(8, 0, 0, 0);

  await scheduleBeehiivPost(issue.beehiivDraftId, scheduledAt.toISOString());
  await prisma.issue.update({
    where: { id: issue.id },
    data: { status: IssueStatus.SCHEDULED, approvedAt: now, scheduledAt }
  });
  await sendTelegramAlert(`📨 Founder’s Edge scheduled for ${scheduledAt.toISOString()} (Issue: ${issue.id})`);
};

export const forcePublishBypass = async (): Promise<void> => {
  const issue = await prisma.issue.findFirst({
    where: {
      status: { in: [IssueStatus.BLOCKED, IssueStatus.PENDING_APPROVAL] },
      beehiivDraftId: { not: null }
    },
    orderBy: { createdAt: "desc" }
  });
  if (!issue?.beehiivDraftId) {
    throw new Error("No issue available for force publish.");
  }
  await scheduleBeehiivPost(issue.beehiivDraftId, new Date(Date.now() + 10 * 60 * 1000).toISOString());
  await prisma.issue.update({ where: { id: issue.id }, data: { status: IssueStatus.SCHEDULED, approvedAt: new Date() } });
  await sendTelegramAlert(`⚠️ Manual override force-publish executed for Issue: ${issue.id}`);
};
