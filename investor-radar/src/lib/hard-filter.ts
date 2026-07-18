const EXCLUDE_TITLES = [
  'intern', 'assistant', 'coordinator', 'student', 'fellow', 'office manager',
  'recruiter', 'human resources', 'receptionist', 'administrative',
  'customer support', 'sales development', 'sdr', 'bdr', 'analyst'
];
const INCLUDE_TITLES = [
  'partner', 'principal', 'general partner', 'gp', 'managing director',
  'venture partner', 'angel', 'investor', 'fund manager', 'managing partner'
];

export function isRealInvestor(person: any): { keep: boolean; reason?: string } {
  const title = (person.title || '').toLowerCase();
  if (EXCLUDE_TITLES.some((ex) => title.includes(ex))) {
    return { keep: false, reason: `Excluded title: ${person.title}` };
  }
  const hasInclude = INCLUDE_TITLES.some((inc) => title.includes(inc));
  const org = person.organization || {};
  const orgText = (
    (org.keywords || []).join(' ') +
    ' ' +
    (org.name || '') +
    ' ' +
    (org.industry || '')
  ).toLowerCase();
  const isVcLike = /venture|vc |private equity|family office|angel|capital/.test(orgText);
  if (!hasInclude && !isVcLike) {
    return { keep: false, reason: 'No investor title or VC org signal' };
  }
  return { keep: true };
}

export function selectTopInvestors(people: any[], topN = 25): any[] {
  const kept = people.filter((p) => isRealInvestor(p).keep);
  // Prefer higher seniority titles
  const scoreTitle = (t: string) => {
    const lower = (t || '').toLowerCase();
    if (lower.includes('general partner') || lower.includes('managing partner')) return 10;
    if (lower.includes('partner')) return 8;
    if (lower.includes('principal') || lower.includes('managing director')) return 7;
    if (lower.includes('venture partner')) return 6;
    if (lower.includes('angel')) return 5;
    return 3;
  };
  return kept
    .sort((a, b) => scoreTitle(b.title) - scoreTitle(a.title))
    .slice(0, topN);
}
