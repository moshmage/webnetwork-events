import Scribal from "./scribal";

export function GlobalCatcher() {
  process
    .on('unhandledRejection', (reason, p) => {
      Scribal.e(reason, `Unhandled Rejection at Promise`, p)
    })
    .on('uncaughtException', err => {
      Scribal.e(err, `Uncaught Exception thrown`)
    });
}