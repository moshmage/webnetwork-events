import {Client} from "@elastic/elasticsearch";
import {format} from "date-fns";
import {isObject} from "util";

enum LogLevel {
  none, error, warn, info, trace, log, debug
}

const consoleMethods = {
  none: '',
  log: 'log',
  info: 'info',
  error: 'error',
  DEBUG: 'debug',
  warn: 'warn',
  debug: 'debug',
  trace: 'info'
};

const {
  NEXT_ELASTIC_SEARCH_URL: node,
  NEXT_ELASTIC_SEARCH_USERNAME: username,
  NEXT_ELASTIC_SEARCH_PASSWORD: password,
  INDEX_STACK_TRACE,
  WEBAPP_URL
} = process.env;

const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL, 10) : LogLevel.log;

export const output = (_level: LogLevel, message, ...rest) => { // eslint-disable-line
  const level = LogLevel[_level];
  const method = consoleMethods[level];

  if (!(LOG_LEVEL && LOG_LEVEL >= _level))
    return;

  const string = `(${level.toUpperCase()}) (${format(new Date(), `dd/MM HH:mm:ss`)}) ${message}`;

  console[method](string, ...rest); // eslint-disable-line

  if (node && username && password) {
    if (!INDEX_STACK_TRACE && _level === LogLevel.trace)
      return; // optionally disable indexing stack traces

    const client = new Client({node, auth: {username, password} })

    const info = Array.isArray(rest) || rest !== null && typeof rest === "object" ? rest : {info: {rest: rest || ''}};

    client?.index({ index: "web-network-events", document: {level, timestamp: new Date(), message, info, webAppUrl: WEBAPP_URL}})
      // .catch(e => console.log(e))
  }
}
/* eslint-disable */
export const info = (message, ...rest) => output(LogLevel.info, message, ...rest);
export const error = (message, ...rest) => output(LogLevel.error, message, ...rest);
export const log = (message, ...rest) => output(LogLevel.log, message, ...rest);
export const warn = (message, ...rest) => output(LogLevel.warn, message, ...rest);
export const debug = (message, ...rest) => output(LogLevel.debug, message, ...rest);
export const trace = (message, ...rest) => output(LogLevel.trace, message, ...rest);


export class Logger {
  static action: string = ``;
  static changeActionName(action: string) { this.action = action; }

  static _args(...v): [string?, ...any[]] {
    return [
      ... Logger.action ? [Logger.action] : [],
      ...v
    ]
  }

  static info(..._args) { info(...this._args(..._args)) }
  static log(..._args) { log(...this._args(..._args)) }
  static warn(..._args) { warn(...this._args(..._args)) }
  static debug(..._args) { debug(...this._args(..._args)) }
  static trace(..._args) { trace(...this._args(..._args)) }
  static error(e: Error, ..._args) {
    error(...this._args(...[e?.toString(), ..._args]))
    trace(...this._args(...[`Code: ${(e as any).code || `NO_OPCODE`}\n`, e.stack || `NO_STACK_TRACE`, ..._args]));
  }
}

export default {error, info, warn, log, debug, trace}