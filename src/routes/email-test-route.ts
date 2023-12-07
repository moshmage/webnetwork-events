import {Router} from "express";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import db from "../db";

const router = Router();

router.get(`/test-email/:name/:task`, async (req, res) => {
  const {name, task} = req.params;

  const bounty = await db.issues.findOne({where: {id: +task}});

  if (!bounty)
    return res.status(400);

  await Push.event(+bounty?.fundingAmount! > 0 ? AnalyticEventName.FUNDING_REQUEST_CREATED : AnalyticEventName.BOUNTY_CREATED, {
    currency: bounty.transactionalToken?.symbol,
    reward: bounty.rewardToken?.symbol,
    bountyId: bounty.id,
    bountyChainId: bounty.id,
    title: bounty.title,
  })
})