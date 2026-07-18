'use client';
import { useState } from 'react';

const PARAMS = [
  { key: 'sectorFit', label: 'Sector Fit', group: 'A' },
  { key: 'expertise', label: 'Expertise', group: 'A' },
  { key: 'stageFit', label: 'Stage Fit', group: 'A' },
  { key: 'checkMatch', label: 'Check Match', group: 'B' },
  { key: 'attainability', label: 'Attainability', group: 'B' },
  { key: 'credibility', label: 'Credibility', group: 'B' },
  { key: 'geography', label: 'Geography', group: 'B' },
] as const;

export type ScoreKey = typeof PARAMS[number]['key'];

interface Props {
  enabled: Record<ScoreKey, boolean>;
  onChange: (enabled: Record<ScoreKey, boolean>) => void;
}

export function ScoreToggles({ enabled, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg border">
      <span className="text-sm font-medium text-slate-600 w-full">Toggle score parameters (affects average & sort):</span>
      {PARAMS.map(p => (
        <label key={p.key} className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled[p.key]}
            onChange={e => onChange({ ...enabled, [p.key]: e.target.checked })}
            className="rounded border-slate-300"
          />
          <span className="text-sm">{p.label} <span className="text-xs text-slate-400">({p.group})</span></span>
        </label>
      ))}
    </div>
  );
}
