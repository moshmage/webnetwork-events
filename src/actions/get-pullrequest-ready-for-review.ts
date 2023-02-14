import db from "src/db";
import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery, } from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyPullRequestReadyForReviewEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import {sendMessageEnvChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import {dbBountyUrl} from "../utils/db-bounty-url";

export const name = "getBountyPullRequestReadyForReviewEvents";
export const schedule = "*/12 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyPullRequestReadyForReviewEvent> = async (block, network) => {
    const {bountyId, pullRequestId} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(bountyId);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where:{ issueId: bounty.cid, contractId: bountyId, network_id: network.id}})
    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    const pullRequest = bounty.pullRequests[pullRequestId];

    const dbPullRequest = await db.pull_requests.findOne({
      where: {issueId: dbBounty.id, githubId: pullRequest.cid.toString(), status: "draft", network_id: network?.id}})

    if (!dbPullRequest)
      return logger.warn(`${name} No pull request found with "draft" and id ${pullRequest.cid}, maybe it was already parsed?`);

    if (!["closed", "merged"].includes(dbPullRequest.status!.toString())) {
      dbPullRequest.status =
        pullRequest.canceled ? "canceled" : pullRequest?.ready ? "ready" : "draft";

      await dbPullRequest.save();
    }

    if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
      dbBounty.state = "ready";
      await dbBounty.save();
      sendMessageEnvChannels(BOUNTY_STATE_CHANGED(dbBountyUrl(dbBounty), `ready`));
    }

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);


  return eventsProcessed;
}
