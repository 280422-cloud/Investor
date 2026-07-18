'use client';
import { Investor, InvestorScore } from '@/types';
import { ScoreKey } from './ScoreToggles';

interface Props {
  investor: Investor;
  enabledScores: Record<ScoreKey, boolean>;
  onReveal: (id: string) => void;
}

function avg(score: InvestorScore | null | undefined, enabled: Record<ScoreKey, boolean>): number | null {
  if (!score) return null;
  const vals = (Object.keys(enabled) as ScoreKey[])
    .filter(k => enabled[k] && typeof (score as any)[k] === 'number')
    .map(k => (score as any)[k] as number);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export function InvestorCard({ investor, enabledScores, onReveal }: Props) {
  const s = investor.score;
  const overall = avg(s, enabledScores);

  return (
    <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{investor.name}</h3>
          <p className="text-sm text-slate-600">{investor.title} · {investor.firmName}</p>
          {investor.firmWebsite && (
            <a href={investor.firmWebsite} target="_blank" rel="noreferrer" className="text-xs text-blue-600">
              {investor.firmWebsite}
            </a>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{overall ?? '—'}</div>
          <div className="text-xs text-slate-500">Overall</div>
        </div>
      </div>

      {s && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-slate-700 mb-1">Group A — Startup Fit</div>
            <ul className="space-y-0.5 text-slate-600">
              <li>Sector Fit: <b>{s.sectorFit}</b></li>
              <li>Expertise: <b>{s.expertise}</b></li>
              <li>Stage Fit: <b>{s.stageFit}</b></li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-slate-700 mb-1">Group B — Deal Practicality</div>
            <ul className="space-y-0.5 text-slate-600">
              <li>Check Match: <b>{s.checkMatch}</b></li>
              <li>Attainability: <b>{s.attainability}</b></li>
              <li>Credibility: <b>{s.credibility}</b></li>
              <li>Geography: <b>{s.geography}</b></li>
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          {investor.emailRevealed && investor.email ? (
            <span className="font-mono text-green-700">{investor.email}</span>
          ) : (
            <span className="text-slate-400 blur-sm select-none">email@hidden.com</span>
          )}
        </div>
        {!investor.emailRevealed && (
          <button
            onClick={() => onReveal(investor.id)}
            className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Reveal Email
          </button>
        )}
      </div>
    </div>
  );
}
