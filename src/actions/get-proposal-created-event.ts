import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyProposalCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {validateProposal} from "../modules/proposal-validate-state";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import { updateLeaderboardProposals } from "src/modules/leaderboard";
import {sendMessageEnvChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED, PROPOSAL_CREATED} from "../integrations/telegram/messages";
import {dbBountyProposalUrl, dbBountyUrl} from "../utils/db-bounty-url";

export const name = "getBountyProposalCreatedEvents";
export const schedule = "*/13 * * * *";
export const description = "Sync proposal created events";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyProposalCreatedEvent> = async (block, network) => {
    const {bountyId, prId, proposalId} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(bountyId);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

    const values = await validateProposal(bounty, prId, proposalId, network.id, false);
    if (!values?.proposal || !values?.dbBounty || !values?.dbPullRequest)
      return;

    const {proposal, dbBounty, dbUser, dbPullRequest} = values;

    const dbIssue = await db.issues.findOne({where: {issueId: bounty.cid, network_id: network.id}});
    if (!dbIssue)
      return logger.warn(`${name} Issue ${bounty.cid} not found`);

    const dbProposal = await db.merge_proposals.findOne({where: {contractId: proposal.id, issueId: dbIssue?.id, network_id: network?.id}});
    
    if (dbProposal)
      return logger.warn(`${name} Proposal with id ${proposalId} was already parsed`);

   const createProposal = await db.merge_proposals.create({
      refusedByBountyOwner: proposal.refusedByBountyOwner,
      disputeWeight: new BigNumber(proposal.disputeWeight).toFixed(),
      contractCreationDate: proposal.creationDate.toString(),
      issueId: dbBounty.id,
      pullRequestId: dbPullRequest.id,
      githubLogin: dbUser?.githubLogin,
      creator: proposal.creator,
      isDisputed: false,
      contractId: proposal.id,
      network_id: network?.id
    });

    if (createProposal) {
      await Promise.all(proposal.details.map(async (detail) =>
        db.proposal_distributions.create({
          address: detail.recipient,
          percentage: detail.percentage,
          proposalId: createProposal.id,
        })
      ))
    }

    if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
      dbBounty.state = "proposal";
      await dbBounty.save();
      sendMessageEnvChannels(BOUNTY_STATE_CHANGED(dbBountyUrl(dbBounty), dbBounty.state))
      sendMessageEnvChannels(PROPOSAL_CREATED(dbBountyProposalUrl(dbBounty, dbProposal, proposalId)))
    }

    await updateLeaderboardProposals();

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

  }

  await service._processEvents(processor);

  return eventsProcessed;
}
