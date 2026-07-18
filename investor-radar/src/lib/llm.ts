import OpenAI from 'openai';
import { EXTRACTION_PROMPT, STAGE2_PROMPT, SCORING_RUBRIC_PROMPT } from './prompts';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function clampScore(n: any): number {
  const v = Math.round(Number(n) || 5);
  return Math.max(1, Math.min(10, v));
}

export async function extractStartupProfile(docText: string) {
  if (!openai) {
    // Mock for demo without key
    return {
      name: 'Demo Startup',
      oneLiner: 'AI-powered solution extracted from document',
      sector: 'Technology',
      subVertical: 'AI / SaaS',
      stage: 'Seed',
      roundSizeTarget: 2000000,
      checkSizeSought: [250000, 750000],
      hqLocation: 'San Francisco',
      teamSummary: 'Experienced founding team with prior exits.',
      tractionSummary: 'Early revenue and growing user base.',
    };
  }
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: docText.slice(0, 80000) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });
  return JSON.parse(res.choices[0].message.content || '{}');
}

export async function buildApolloQuery(startup: {
  sector: string;
  subVertical: string;
  stage: string;
  targetGeography: string;
}) {
  if (!openai) {
    return {
      person_titles: [
        'Partner',
        'General Partner',
        'Principal',
        'Managing Director',
        'Venture Partner',
        'Angel Investor',
      ],
      person_seniorities: ['partner', 'founder', 'c_suite'],
      person_locations: [startup.targetGeography],
      q_organization_keyword_tags: ['venture capital', startup.sector.toLowerCase()],
    };
  }
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: STAGE2_PROMPT },
      { role: 'user', content: JSON.stringify(startup) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });
  return JSON.parse(res.choices[0].message.content || '{}');
}

export async function scoreInvestor(
  startup: any,
  investor: any,
  firecrawlContent: string | null,
  targetGeography: string
) {
  if (!openai) {
    // Heuristic mock scores
    const title = (investor.title || '').toLowerCase();
    const base = title.includes('partner') ? 7 : 5;
    return {
      sectorFit: { score: base, rationale: 'Mock score based on title' },
      expertise: { score: base - 1, rationale: 'Mock' },
      stageFit: { score: base, rationale: 'Mock' },
      checkMatch: { score: 6, rationale: 'Mock' },
      attainability: { score: title.includes('principal') ? 8 : 5, rationale: 'Mock' },
      credibility: { score: 6, rationale: 'Mock' },
      geography: { score: 7, rationale: 'Mock' },
    };
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SCORING_RUBRIC_PROMPT },
      {
        role: 'user',
        content: JSON.stringify({
          startup: {
            name: startup.name,
            sector: startup.sector,
            subVertical: startup.subVertical,
            stage: startup.stage,
            roundSizeTarget: startup.roundSizeTarget,
            checkSizeSoughtMin: startup.checkSizeSoughtMin,
            checkSizeSoughtMax: startup.checkSizeSoughtMax,
            hqLocation: startup.hqLocation,
            teamSummary: startup.teamSummary,
            tractionSummary: startup.tractionSummary,
          },
          investor: {
            name: investor.name,
            title: investor.title,
            firmName: investor.firmName,
            firmWebsite: investor.firmWebsite,
          },
          firecrawlContent: (firecrawlContent || '').slice(0, 12000),
          targetGeography,
        }),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  const parsed = JSON.parse(res.choices[0].message.content || '{}');
  // Normalize
  const fields = [
    'sectorFit',
    'expertise',
    'stageFit',
    'checkMatch',
    'attainability',
    'credibility',
    'geography',
  ] as const;
  const result: any = {};
  for (const f of fields) {
    result[f] = {
      score: clampScore(parsed[f]?.score),
      rationale: parsed[f]?.rationale || '',
    };
  }
  return result;
}
