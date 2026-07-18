export interface Startup {
  id: string;
  rawDocText: string;
  name: string;
  oneLiner: string;
  sector: string;
  subVertical: string;
  stage: string;
  roundSizeTarget: number | null;
  checkSizeSoughtMin: number | null;
  checkSizeSoughtMax: number | null;
  hqLocation: string;
  teamSummary: string;
  tractionSummary: string;
  targetGeography: string;
  createdAt: string;
}

export interface InvestorScore {
  sectorFit: number;
  expertise: number;
  stageFit: number;
  checkMatch: number;
  attainability: number;
  credibility: number;
  geography: number;
  rationale: Record<string, string>;
}

export interface Investor {
  id: string;
  startupId: string;
  apolloPersonId: string;
  name: string;
  title: string;
  firmName: string;
  firmWebsite?: string | null;
  linkedinUrl?: string | null;
  isRealInvestor: boolean;
  dropReason?: string;
  score?: InvestorScore | null;
  email?: string | null;
  emailRevealed: boolean;
}
