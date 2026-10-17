// Where a case study's work came from, so visitors don't assume every study was an Oakheart client project.
export type Origin = 'employee' | 'own' | 'contract';

export const originShort: Record<Origin, string> = {
  employee: 'Earlier role',
  own: 'My own business',
  contract: 'Contract work',
};

export const originLong: Record<Origin, string> = {
  employee: 'Work from my earlier career as a software engineer, before I founded Oakheart.',
  own: 'The business I own and run.',
  contract: 'Contract work for a confidential client.',
};
