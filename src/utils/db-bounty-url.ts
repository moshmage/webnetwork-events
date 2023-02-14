export const dbBountyUrl = (dbBounty: any) =>
  `/${dbBounty.network.name}/${dbBounty.githubId}/${dbBounty.repository_id}`;

export const dbBountyPRUrl = (dbBounty: any, pr: any, prId) =>
  `/${dbBounty.network.name}/pull-request?id=${prId}&repoId=${dbBounty.repository_id}&prId=${pr.githubId}`;

export const dbBountyProposalUrl = (dbBounty: any, proposal: any, proposalId: any) =>
  `/${dbBounty.network.name}/proposal?id=${dbBounty.githubId}&repoId=${dbBounty.repository_id}&proposalId=${proposalId}`