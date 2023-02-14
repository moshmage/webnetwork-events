import {Telegraf} from "telegraf";
import {Logger} from "../../utils/logger-handler";

export default (() => {
  if (!process.env.TELEGRAM_CHANNELS) {
    Logger.debug(`TelegramBot`,`trying to use but missing process.env.TELEGRAM_CHANNELS`)
    return null;
  }

  return new Telegraf(process.env.TELEGRAM_TOKEN!)
})();