import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { extractStartupProfile } from '@/lib/llm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetGeography = (formData.get('targetGeography') as string) || '';

    if (!file || !targetGeography.trim()) {
      return NextResponse.json({ error: 'Missing file or target geography' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Dynamic import for pdf-parse compatibility
      const pdf = (await import('pdf-parse')).default;
      const data = await pdf(buffer);
      text = data.text || '';
    } else {
      text = buffer.toString('utf-8');
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'Could not extract text from document. Try a different PDF or paste text.' },
        { status: 400 }
      );
    }

    const profile = await extractStartupProfile(text);

    const startup = await prisma.startup.create({
      data: {
        rawDocText: text.slice(0, 100000),
        name: profile.name || 'Untitled Startup',
        oneLiner: profile.oneLiner || '',
        sector: profile.sector || '',
        subVertical: profile.subVertical || '',
        stage: profile.stage || '',
        roundSizeTarget: profile.roundSizeTarget ?? null,
        checkSizeSoughtMin: Array.isArray(profile.checkSizeSought)
          ? profile.checkSizeSought[0]
          : null,
        checkSizeSoughtMax: Array.isArray(profile.checkSizeSought)
          ? profile.checkSizeSought[1]
          : null,
        hqLocation: profile.hqLocation || '',
        teamSummary: profile.teamSummary || '',
        tractionSummary: profile.tractionSummary || '',
        targetGeography: targetGeography.trim(),
      },
    });

    return NextResponse.json({
      startupId: startup.id,
      profile: {
        ...profile,
        targetGeography: targetGeography.trim(),
        id: startup.id,
      },
    });
  } catch (e: any) {
    console.error('Analyze error', e);
    return NextResponse.json({ error: e.message || 'Analysis failed' }, { status: 500 });
  }
}
