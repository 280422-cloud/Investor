import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const startupId = req.nextUrl.searchParams.get('startupId');
    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 });
    }

    const investors = await prisma.investor.findMany({
      where: { startupId, isRealInvestor: true },
      include: {
        score: true,
        emailReveal: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const mapped = investors.map((inv) => {
      let rationale: Record<string, string> = {};
      if (inv.score?.rationale) {
        try {
          rationale = JSON.parse(inv.score.rationale);
        } catch {}
      }
      return {
        id: inv.id,
        startupId: inv.startupId,
        apolloPersonId: inv.apolloPersonId,
        name: inv.name,
        title: inv.title,
        firmName: inv.firmName,
        firmWebsite: inv.firmWebsite,
        linkedinUrl: inv.linkedinUrl,
        isRealInvestor: inv.isRealInvestor,
        dropReason: inv.dropReason,
        score: inv.score
          ? {
              sectorFit: inv.score.sectorFit,
              expertise: inv.score.expertise,
              stageFit: inv.score.stageFit,
              checkMatch: inv.score.checkMatch,
              attainability: inv.score.attainability,
              credibility: inv.score.credibility,
              geography: inv.score.geography,
              rationale,
            }
          : null,
        email: inv.emailReveal?.email ?? null,
        emailRevealed: !!inv.emailReveal?.creditSpent,
      };
    });

    return NextResponse.json(mapped);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
