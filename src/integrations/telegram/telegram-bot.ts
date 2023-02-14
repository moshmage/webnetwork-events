import {Telegraf} from "telegraf";
import {Logger} from "../../utils/logger-handler";

export default (() => {
  if (!process.env.TELEGRAM_TOKEN) {
    Logger.debug(`TelegramBot`,`trying to use but missing process.env.TELEGRAM_TOKEN`)
    return null;
  }

  return new Telegraf(process.env.TELEGRAM_TOKEN)
})();