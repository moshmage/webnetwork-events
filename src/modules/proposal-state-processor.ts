import {Network_v2} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import logger from "../utils/logger-handler";
import {NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import validateProposalState, {validateProposal} from "./proposal-validate-state";
import {name} from "../actions/get-bounty-funded-updated-event";
import {EventService} from "../services/event-service";
import db from "src/db";
import BigNumber from "bignumber.js";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {PROPOSAL_DISPUTED, PROPOSAL_DISPUTED_COMPLETE} from "../integrations/telegram/messages";
import {dbBountyProposalUrl} from "../utils/db-bounty-url";

export async function proposalStateProcessor(block: BountyProposalDisputedEvent, network, _service, eventsProcessed, isProposalRequired = true) {
  const {bountyId, prId, proposalId,} = block.returnValues;

  const bounty = await ((_service as EventService).Actor as Network_v2).getBounty(bountyId);
  if (!bounty)
    return logger.error(NETWORK_BOUNTY_NOT_FOUND('proposal-state-processor', bountyId, network.networkAddress));

  const values = await validateProposal(bounty, prId, proposalId, network.id, isProposalRequired);
  if (!values?.dbBounty)
    return;

  const {dbBounty, proposal} = values;

  const dbProposal = await db.merge_proposals.findOne({where: {contractId: proposal.id, issueId: dbBounty?.id, network_id: network?.id}});

  if (!dbProposal) return logger.warn(`${name} Proposal ${proposal.id} not found on database`);

  const isDisputed = await ((_service as EventService).Actor as Network_v2).isProposalDisputed(bountyId, proposal.id); 


  const oldWeight = dbProposal.disputeWeight || 0;
  dbProposal.isDisputed = isDisputed
  dbProposal.disputeWeight = new BigNumber(proposal.disputeWeight).toFixed()
  dbProposal.refusedByBountyOwner = proposal.refusedByBountyOwner

  await dbProposal.save()

  if (!["canceled", "closed"].includes(dbBounty.state!))
    dbBounty.state =
      await validateProposalState(dbBounty.state!, bounty, _service.Actor as Network_v2);

  await dbBounty.save();

  if (!isDisputed)
    sendMessageToTelegramChannels(PROPOSAL_DISPUTED(dbBountyProposalUrl(dbBounty, dbProposal, proposalId), (+dbProposal.disputeWeight - +oldWeight).toString()))
  else
    sendMessageToTelegramChannels(PROPOSAL_DISPUTED_COMPLETE(dbBountyProposalUrl(dbBounty, dbProposal, proposalId)));

  eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

  return eventsProcessed;
}