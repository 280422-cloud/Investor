import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchPeople } from '@/lib/apollo';
import { selectTopInvestors } from '@/lib/hard-filter';
import { buildApolloQuery } from '@/lib/llm';

const TOP_N = 25;

export async function POST(req: NextRequest) {
  try {
    const { startupId } = await req.json();
    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    }

    // Stage 2: Build Apollo query via LLM
    const apolloQuery = await buildApolloQuery({
      sector: startup.sector,
      subVertical: startup.subVertical,
      stage: startup.stage,
      targetGeography: startup.targetGeography,
    });

    // Stage 3: Apollo search (up to 2 pages, free)
    let allPeople: any[] = [];
    for (let page = 1; page <= 2; page++) {
      const result = await searchPeople({
        ...apolloQuery,
        page,
        per_page: 100,
      });
      const people = result.people || [];
      allPeople = allPeople.concat(people);
      if (people.length < 100) break;
    }

    // Stage 4: Hard-drop + rank, keep ~25
    const ranked = selectTopInvestors(allPeople, TOP_N);

    // Persist
    const created = [];
    for (const p of ranked) {
      const name =
        p.name ||
        `${p.first_name || ''} ${p.last_name || p.last_name_obfuscated || ''}`.trim() ||
        'Unknown';
      const inv = await prisma.investor.create({
        data: {
          startupId,
          apolloPersonId: p.id,
          name,
          title: p.title || '',
          firmName: p.organization?.name || 'Unknown',
          firmWebsite:
            p.organization?.website_url ||
            p.organization?.primary_domain ||
            null,
          linkedinUrl: p.linkedin_url || null,
          apolloRaw: JSON.stringify(p),
          isRealInvestor: true,
        },
      });
      created.push(inv);
    }

    return NextResponse.json({ count: created.length, investors: created });
  } catch (e: any) {
    console.error('Search error', e);
    return NextResponse.json({ error: e.message || 'Search failed' }, { status: 500 });
  }
}
