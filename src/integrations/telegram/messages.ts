import {AMOUNT_AND_SYMBOL, NEW_BOUNTY} from "./messages-templates";

const _url = (s) => `\n${process.env.WEBAPP_URL}${s}\n`;

const dbBountyUrl = (dbBounty: any) =>
  `/${dbBounty.network.name}/${dbBounty.githubId}/${dbBounty.repository_id}`;

const dbBountyPRUrl = (dbBounty: any, pr: any, prId) =>
  `/${dbBounty.network.name}/pull-request?id=${prId}&repoId=${dbBounty.repository_id}&prId=${pr.githubId}`;

const dbBountyProposalUrl = (dbBounty: any, proposal: any, proposalId: any) =>
  `/${dbBounty.network.name}/proposal?id=${dbBounty.githubId}&repoId=${dbBounty.repository_id}&proposalId=${proposalId}`;

const getAmountAndSymbol = (dbBounty: any) =>
  AMOUNT_AND_SYMBOL({amount: dbBounty.amount, symbol: dbBounty.token.symbol})

export const NEW_BOUNTY_OPEN = (dbBounty: any) =>
  NEW_BOUNTY({dbBounty, url: _url(dbBountyUrl(dbBounty))});
export const BOUNTY_STATE_CHANGED = (url: string, newState: string) => `Bounty changed to ${newState}${_url(url)}`;
export const BOUNTY_AMOUNT_UPDATED = (url: string, newPrice: string) => `Bounty had its price changed to ${newPrice}${_url(url)}`;
export const PULL_REQUEST_OPEN = (url: string) => `Bounty has a new PR${_url(url)}`;
export const PULL_REQUEST_CANCELED = (url: string) => `Bounty had its PR canceled${_url(url)}`;
export const PROPOSAL_CREATED = (url: string) => `New proposal created${_url(url)}`;
export const PROPOSAL_DISPUTED = (url: string, value: string) => `Proposal was appealed with ${value} votes${_url(url)}`;
export const PROPOSAL_DISPUTED_COMPLETE = (url: string) => `Proposal was disputed${_url(url)}`;
export const PROPOSAL_READY = (url: string) => `Proposal is ready to be closed${_url(url)}`;
export const BOUNTY_CLOSED = (url: string) => `Bounty finished${_url(url)}`;
export const BOUNTY_FUNDED = (url: string, funded: string, total: string) => `Funding bounty for ${funded} (of ${total})${_url(url)}`;