import Scribal from "./scribal";

/* eslint-disable */
export const info = (message: string, ...rest) => Scribal.i(message, ...rest);
export const error = (message: string, ...rest) => Scribal.e(message, ...rest);
export const log = (message: string, ...rest) => Scribal.d(message, ...rest);
export const warn = (message: string, ...rest) => Scribal.w(message, ...rest);
export const debug = (message: string, ...rest) => Scribal.d(message, ...rest);
export const trace = (message: string, ...rest) => Scribal.d(message, ...rest);

export class Logger {
  constructor(readonly name: string) {
  }

  info(message, ...contents) {
    Scribal.i(message, ...contents, {name: this.name});
  }

  warn(message, ...contents) {
    Scribal.w(message, ...contents, {name: this.name});
  }

  error(message, ...contents) {
    Scribal.e(message, ...contents, {name: this.name});
  }

  debug(message, ...contents) {
    Scribal.d(message, ...contents, {name: this.name});
  }
}

export default {error, info, warn, log, debug, trace}