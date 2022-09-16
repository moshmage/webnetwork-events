import cors, {CorsOptions} from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { readFileSync } from "fs";
import { createServer } from "https";
import { router } from "src/routes";
import loggerHandler from "./utils/logger-handler";
dotenv.config();

const app: Express = express();
const port = process.env.WEB_EVENTS_PORT || 3334;
const useSSL = process.env.SSL_ENABLED === "true";

const corsOptions: CorsOptions = {
  origin: process.env.WEBAPP_URL || "http://localhost:3334",
  optionsSuccessStatus: 200,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
};

app.use(express.json());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(router);

const listen = () => {
  loggerHandler.warn(`API Listening on ${port} over HTTP${useSSL ? "S" : ""}`);
  loggerHandler.info(`API corsOptions`, corsOptions);
}

if (useSSL) {
  const keyPath = process.env.SSL_PRIVATE_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    throw Error("Missing SSLKeyPath or SSLCertPath");
  }

  createServer({key: readFileSync(keyPath, "utf8"), cert: readFileSync(certPath, "utf8"),}, app)
    .listen(port, listen);
} else {
  app.listen(port, listen);
}
