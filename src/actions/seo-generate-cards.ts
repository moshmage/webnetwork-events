import {Op} from "sequelize";
import db from "src/db";
import generateCard from "src/modules/generate-bounty-cards";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";
import {getChainsRegistryAndNetworks} from "../utils/block-process";
import {subMinutes} from "date-fns";
import { isIpfsEnvs } from "src/utils/ipfs-envs-verify";
import { getDeveloperAmount } from "src/modules/calculate-distributed-amounts";

export const name = "seo-generate-cards";
export const schedule = "*/10 * * * *";
export const description = "Try generate SeoCards for all updated or new bounties";
export const author = "clarkjoao";

export async function action(params) {
  const bountiesProcessed: any[] = [];

  if (!isIpfsEnvs) {
    logger.warn(`${name} Missing id, secret or baseURL, for IPFService`);
    return bountiesProcessed;
  }

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, { chainId: chain_id }] of entries) {
    try {
      logger.info(`${name} start`);

      const dbEvent =
        await db.chain_events
          .findOrCreate({where: {name, chain_id}, defaults: {name, chain_id}})
          .then(([event,]) => event);

      const where = {
        chain_id,
        ...params?.issueId
          ? {issueId: {[Op.iLike]: params?.issueId}}
          : {
            [Op.or]: [
              {seoImage: null},
              {updatedAt: {[Op.gt]: subMinutes(dbEvent.updatedAt || new Date(), 1)}}
            ]
          }
      }

      const include = [
        {association: "developers"},
        {association: "merge_proposals"},
        {association: "deliverables"},
        {association: "network"},
        {association: "transactionalToken"},
      ];

      const bounties = await db.issues.findAll({where, include});

      if (!bounties.length) {
        logger.info(`${name} No bounties to be updated`);
        return;
      }

      logger.info(`${name} ${bounties.length} bounties to be updated`);

      for (const bounty of bounties) {
        try {
          logger.debug(`${name} Creating card to bounty ${bounty.id}`);
          const workerAmount = await getDeveloperAmount(bounty, web3Host);
          const card = await generateCard({
            issue: {
              ...bounty.toJSON(),
              amount: workerAmount
            }
          });

          const {hash} = await ipfsService.add(card);
          if (!hash) {
            logger.warn(`${name} Failed to get hash from IPFS for ${bounty.id}`);
            continue;
          }

          await bounty.update({seoImage: hash});

          bountiesProcessed.push({issueId: bounty.id, hash});

          logger.debug(`${name} Bounty card for ${bounty.id} has been updated`);
        } catch (error: any) {
          logger.error(`${name} Error generating card for ${bounty.id}`, error);
          continue;
        }
      }

      if (dbEvent?.lastBlock) {
        dbEvent.lastBlock += 1;
        await dbEvent.save();
      }

    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }

  }

  return bountiesProcessed;
}
