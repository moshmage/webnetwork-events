import {LoggerPlugin} from "@taikai/scribal/dist/lib/types";
import {Client} from "@elastic/elasticsearch";

const {
  NEXT_ELASTIC_SEARCH_URL: node,
  NEXT_ELASTIC_SEARCH_USERNAME: username,
  NEXT_ELASTIC_SEARCH_PASSWORD: password,
  LOG_APP_NAME: index = "bepro-events"
} = process.env;

export const elasticLoggerMaker = (): LoggerPlugin => ({
  log(level, contents) {
    if (!node || !username || !password) {
      console.debug(`\n\tTrying to use elastic-search indexer but missing env-vars\n`);
      return;
    }

    new Client({node, auth: {username, password}})
      .index({
        index,
        document: {
          level,
          message: contents,
          timestamp: new Date().toISOString(),
        }
      })
      .catch(e => {
        console.error(`Failed to log on elastic`, e);
      });

  }
})