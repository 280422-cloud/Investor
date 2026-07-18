const APOLLO_BASE = 'https://api.apollo.io/api/v1';

export async function searchPeople(query: {
  person_titles?: string[];
  person_seniorities?: string[];
  person_locations?: string[];
  q_organization_keyword_tags?: string[];
  page?: number;
  per_page?: number;
}) {
  const params = new URLSearchParams();
  query.person_titles?.forEach((t) => params.append('person_titles[]', t));
  query.person_seniorities?.forEach((s) => params.append('person_seniorities[]', s));
  query.person_locations?.forEach((l) => params.append('person_locations[]', l));
  query.q_organization_keyword_tags?.forEach((k) =>
    params.append('q_organization_keyword_tags[]', k)
  );
  params.set('page', String(query.page ?? 1));
  params.set('per_page', String(query.per_page ?? 100));

  const res = await fetch(`${APOLLO_BASE}/mixed_people/api_search?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': process.env.APOLLO_API_KEY!,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apollo search failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function revealEmail(apolloPersonId: string) {
  const params = new URLSearchParams({
    id: apolloPersonId,
    reveal_personal_emails: 'true',
  });
  const res = await fetch(`${APOLLO_BASE}/people/match?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': process.env.APOLLO_API_KEY!,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apollo match/reveal failed: ${res.status} ${text}`);
  }
  return res.json();
}
