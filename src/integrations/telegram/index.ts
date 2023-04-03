import TelegramBot from "./telegram-bot";
import Logger from "../../utils/logger-handler";

export function sendMessageToTelegramChannels(message: string, moreChannels: string[] = []) {
  try {
    if (!process.env.TELEGRAM_CHANNELS) {
      Logger.debug(`TelegramBot`, `trying to use but missing process.env.TELEGRAM_CHANNELS`)
      return;
    }

    for (const channel of JSON.parse(process.env.TELEGRAM_CHANNELS).concat(moreChannels)) {
      Logger.debug(`TelegramBot`, `Sending message to ${channel}`, message);
      TelegramBot?.telegram
        .sendMessage(channel, message, {parse_mode: `HTML`})
        .then(m => {
          Logger.info(`TelegramBot Sent message to ${channel} id:${m.message_id} message:${m.text}`);
        })
        .catch(e => {
          Logger.error(`TelegramBot Failed to send message to ${channel}`, message, e.stack);
        });
    }
  } catch (e: any) {
    Logger.error(`TelegramBot`, e?.message, e.stack)
  }
}