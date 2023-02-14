import TelegramBot from "./telegram-bot";
import {Logger} from "../../utils/logger-handler";

export function sendMessageToTelegramChannels(message: string, moreChannels: string[] = []) {
  if (!process.env.TELEGRAM_CHANNELS) {
    Logger.debug(`TelegramBot`, `trying to use but missing process.env.TELEGRAM_CHANNELS`)
    return;
  }

  for (const channel of JSON.parse(process.env.TELEGRAM_CHANNELS).concat(moreChannels)) {
    Logger.debug(`TelegramBot`, `Sending message to ${channel}`, message);
    TelegramBot?.telegram
      .sendMessage(channel, message)
      .then(m => {
        Logger.info(`TelegramBot`, `Sent message to ${channel}`, m.message_id, m.text);
      })
      .catch(e => {
        Logger.error(e, `TelegramBot`, `Failed to send message to ${channel}`, message);
      });
  }
}