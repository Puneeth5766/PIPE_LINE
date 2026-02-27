import axios from "axios";
import { env } from "../config/env";

export const sendTelegramAlert = async (message: string): Promise<void> => {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown"
  });
};
