export const EXTRACTION_PROMPT = `Extract a structured startup profile from the provided pitch document text. Output ONLY valid JSON with these fields:
{
  "name": string,
  "oneLiner": string,
  "sector": string,
  "subVertical": string,
  "stage": string (e.g. "pre-seed", "seed", "Series A"),
  "roundSizeTarget": number or null (USD),
  "checkSizeSought": [min, max] or null,
  "hqLocation": string,
  "teamSummary": string (2-3 sentences),
  "tractionSummary": string (2-3 sentences)
}
Be precise; if info is missing use null or best inference from context. No extra text.`;

export const STAGE2_PROMPT = `Given this startup profile and target geography, produce a precise Apollo people search filter object. Output ONLY valid JSON of this shape:
{
  "person_titles": ["Partner", "General Partner", "Principal", "Managing Director", "Angel Investor", "Venture Partner"],
  "person_seniorities": ["founder", "partner", "owner", "c_suite"],
  "person_locations": ["City, Country", ...],
  "q_organization_keyword_tags": ["venture capital", "fintech", ...]
}
Expand the targetGeography into 3-10 concrete Apollo-friendly location strings. Include relevant investor titles and sector-related tags + "venture capital". Prefer precision. No extra text.`;

export const SCORING_RUBRIC_PROMPT = `You are an expert venture capital analyst. Score the given investor against the startup on exactly these 7 parameters, each an integer from 1 to 10. Provide a one-sentence rationale for each score based only on the provided data (startup profile, investor info, and any scraped firm content). Do not invent facts.

**Group A — Startup Fit**

1. Sector Fit — how closely the investor's demonstrated focus matches the startup's specific sector and sub-vertical. Look at: fund thesis language, portfolio company list, sector tags.
- 1–2: no relevant sector history, portfolio concentrated elsewhere.
- 3–4: only tangential overlap — one loosely related portfolio company.
- 5–6: invests in the broad category but no track record in this specific sub-vertical.
- 7–8: one or more direct investments in the same sub-vertical, or it's a named focus area.
- 9–10: sub-vertical is a stated core thesis with 3+ direct portfolio investments in the same space.

2. Expertise That Could Benefit the Startup — hands-on knowledge, network, or operating experience beyond capital. Look at: prior operating roles, technical background, board seats, published writing/talks.
- 1–2: purely financial background, no relevant operating experience.
- 3–4: general startup experience, nothing specific to this domain.
- 5–6: standard generalist value-add (intros, fundraising guidance) without domain depth.
- 7–8: relevant operating background or strong network in an adjacent space.
- 9–10: deep, directly relevant expertise (founded/ran a company in the same space, recognized domain authority) with a visible pattern of hands-on founder support.

3. Stage Fit — how well the investor's typical stage matches this round. Look at: stated stage focus, stage of their 3-5 most recent investments.
- 1–2: clear mismatch (e.g. growth-only fund evaluating a pre-seed round).
- 3–4: this stage is at the extreme edge of their range, no precedent found.
- 5–6: broad mandate technically includes this stage but it isn't a focus.
- 7–8: adjacent-stage focus with some recent deals at this exact stage.
- 9–10: this exact stage is their primary, stated focus with multiple recent deals there.

**Group B — Deal Practicality**

4. Check Match — how well their typical check size fits the round/allocation sought. Look at: stated check range, size of recent rounds they've joined, lead vs. follow-on behavior.
- 1–2: no realistic overlap.
- 3–4: significant gap, would require a big deviation from their norm.
- 5–6: some overlap but atypical for them.
- 7–8: within range, toward one edge.
- 9–10: squarely in their typical range, recent checks of a similar size.

5. Attainability — can this founder realistically get a meeting? Look at: seniority/title, public accessibility (application forms, social responsiveness), inbound-volume signals, visible warm-intro paths.
- 1–2: effectively closed off — extremely senior/high-profile, explicit no-cold-outreach signals.
- 3–4: hard to reach — senior partner at a well-known fund, minimal public accessibility.
- 5–6: possible with effort — high inbound but not fully closed, responds to strong intros.
- 7–8: reasonably accessible — mid-level check-writer or open submission process.
- 9–10: highly accessible — actively solicits founders, responsive online presence, or a direct contact path.

6. Credibility — track record and standing in the investing community. Look at: notable exits/portfolio companies, years active, fund size/vintage, press coverage.
- 1–2: no verifiable track record, or can't confirm active-investor status.
- 3–4: new fund/investor, sparse portfolio, little public reputation.
- 5–6: moderate track record, limited notable outcomes so far.
- 7–8: established, respected track record with some notable portfolio companies.
- 9–10: widely recognized, strong track record including notable exits/breakout companies.

7. Geography — does their actual investing footprint (not just home base) match the target geography? Look at: portfolio company locations, stated regional strategy, local office presence, recent in-region deals.
- 1–2: no footprint in the target geography, explicitly focused elsewhere.
- 3–4: primary focus elsewhere, only incidental presence in the region.
- 5–6: invests globally/regionally without excluding the target geography, but little direct evidence there.
- 7–8: demonstrated investments or a dedicated strategy for the target geography, though based elsewhere.
- 9–10: based in and explicitly focused on the target geography, with multiple portfolio companies there.

Output ONLY valid JSON matching this exact schema (no markdown, no extra text):
{
  "sectorFit": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "expertise": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "stageFit": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "checkMatch": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "attainability": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "credibility": { "score": <int 1-10>, "rationale": "<one sentence>" },
  "geography": { "score": <int 1-10>, "rationale": "<one sentence>" }
}`;
