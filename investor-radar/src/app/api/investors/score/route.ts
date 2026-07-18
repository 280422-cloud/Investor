import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scrapeUrl } from '@/lib/firecrawl';
import { scoreInvestor } from '@/lib/llm';

const CONCURRENCY = 3;

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

    const investors = await prisma.investor.findMany({
      where: { startupId, isRealInvestor: true, score: null },
      take: 30,
    });

    let processed = 0;
    for (let i = 0; i < investors.length; i += CONCURRENCY) {
      const batch = investors.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async (inv) => {
          try {
            let content: string | null = null;
            if (inv.firmWebsite) {
              content = await scrapeUrl(inv.firmWebsite);
            }

            await prisma.investorResearch.upsert({
              where: { investorId: inv.id },
              create: { investorId: inv.id, firecrawlContent: content },
              update: { firecrawlContent: content },
            });

            const scores = await scoreInvestor(
              startup,
              inv,
              content,
              startup.targetGeography
            );

            const rationale: Record<string, string> = {};
            const data: any = {};
            const fields = [
              'sectorFit',
              'expertise',
              'stageFit',
              'checkMatch',
              'attainability',
              'credibility',
              'geography',
            ] as const;
            for (const f of fields) {
              data[f] = scores[f]?.score ?? 5;
              rationale[f] = scores[f]?.rationale || '';
            }

            await prisma.investorScore.create({
              data: {
                investorId: inv.id,
                ...data,
                rationale: JSON.stringify(rationale),
              },
            });
            processed++;
          } catch (err) {
            console.error(`Failed scoring investor ${inv.id}`, err);
            // Leave unscored for later retry
          }
        })
      );
    }

    return NextResponse.json({ ok: true, processed });
  } catch (e: any) {
    console.error('Score error', e);
    return NextResponse.json({ error: e.message || 'Scoring failed' }, { status: 500 });
  }
}
