# Founder’s Edge Weekly Pipeline

Production-grade, local, provider-agnostic multi-agent pipeline that builds a weekly founder newsletter, blocks low-quality or near-duplicate issues, creates Beehiiv draft, and waits for manual approval before scheduling publish.

## Folder Structure

```text
.
├── .env.example
├── docker-compose.yml
├── package.json
├── pipeline_config.json
├── prisma
│   ├── migrations
│   │   └── enable_pgvector.sql
│   └── schema.prisma
├── src
│   ├── agents
│   │   ├── analyst.agent.ts
│   │   ├── evaluator.agent.ts
│   │   ├── helpers.ts
│   │   ├── scout.agent.ts
│   │   └── voice.agent.ts
│   ├── ai
│   │   ├── claude.provider.ts
│   │   ├── gemini.provider.ts
│   │   ├── openai.provider.ts
│   │   ├── provider-factory.ts
│   │   └── provider.interface.ts
│   ├── cli.ts
│   ├── config
│   │   ├── env.ts
│   │   └── pipeline-config.ts
│   ├── db
│   │   └── prisma.ts
│   ├── index.ts
│   ├── ingestion
│   │   ├── github.ts
│   │   ├── hackernews.ts
│   │   ├── index.ts
│   │   ├── indiehackers.ts
│   │   ├── producthunt.ts
│   │   └── reddit.ts
│   ├── services
│   │   ├── beehiiv.service.ts
│   │   ├── pipeline.service.ts
│   │   ├── telegram.service.ts
│   │   └── vector.service.ts
│   ├── types
│   │   └── schemas.ts
│   └── utils
│       └── logger.ts
└── tsconfig.json
```

## Step-by-step Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start PostgreSQL with pgvector**
   ```bash
   docker compose up -d
   ```
3. **Create env file**
   ```bash
   cp .env.example .env
   ```
4. **Set API keys in `.env`**
5. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```
6. **Create DB schema**
   ```bash
   npm run prisma:migrate -- --name init
   ```
7. **Enable pgvector + pgcrypto**
   ```bash
   psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
   psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
   ```

## Required Environment Variables

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `CLAUDE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`
- `LOG_LEVEL`

## Telegram Bot Setup

1. Open Telegram, chat with `@BotFather`.
2. Run `/newbot` and copy the bot token.
3. Start a chat with your bot and send a message.
4. Get your chat id:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"
   ```
5. Put token and chat id in `.env`.

## Beehiiv Setup

1. Create Beehiiv API key in Beehiiv settings.
2. Retrieve publication id from Beehiiv dashboard/API.
3. Fill `.env` keys.
4. Pipeline creates draft first, then approval command schedules publish.

## Runtime Commands

- Run pipeline now:
  ```bash
  npm run pipeline
  ```
- Approve and schedule latest pending issue:
  ```bash
  npm run approve
  ```
- Manual override force publish:
  ```bash
  npm run force-publish
  ```
- Start scheduler daemon:
  ```bash
  npm run cron
  ```

## Cron Setup (System Crontab)

Use if you want OS-level restart of scheduler process:

```bash
crontab -e
```

Add:

```cron
@reboot cd /workspace/PIPE_LINE && /usr/bin/npm run cron >> /tmp/founders-edge-cron.log 2>&1
```

The internal cron is fixed to Tuesday 10:30 PM IST (`Asia/Kolkata`).

## Testing & Validation Flow

1. **Simulate Tuesday run**: `npm run pipeline`
2. **Test approval flow**: `npm run approve`
3. **Verify Beehiiv scheduling**: check Beehiiv post status is `scheduled`.
4. **Test Telegram alerts**:
   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
     -H "Content-Type: application/json" \
     -d '{"chat_id":"'$TELEGRAM_CHAT_ID'","text":"Founder Edge test alert"}'
   ```

## Troubleshooting

- **Prisma vector errors**: ensure `vector` extension exists.
- **UUID insertion error in vector table**: ensure `pgcrypto` extension exists.
- **Beehiiv 401/403**: check API key and publication id.
- **Telegram silent failure**: validate chat id via `getUpdates`.
- **AI provider auth issues**: ensure selected provider key is set and `pipeline_config.json` provider matches.
