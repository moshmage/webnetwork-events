import { Router } from "express";

import { eventsRouter } from "./events.routes";
import { seoRoutes } from "./seo.routes";
import {sendMessageEnvChannels} from "../integrations/telegram";
import {NEW_BOUNTY_OPEN} from "../integrations/telegram/messages";

const router = Router();

router.use("/seo", seoRoutes);

router.use("/past-events", eventsRouter);

router.use("/", async (req, res) => {
  // sendMessageEnvChannels(`${NEW_BOUNTY_OPEN('19BEPRO', '/bepro/bounty?id=77&repoId=2')}`);
  return res.status(200).json("::");
});

export { router };
