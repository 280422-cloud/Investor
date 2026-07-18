'use client';

interface Props {
  open: boolean;
  investorName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RevealModal({ open, investorName, onConfirm, onCancel, loading }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold mb-2">Reveal Email?</h3>
        <p className="text-slate-600 text-sm mb-4">
          Revealing the email for <strong>{investorName}</strong> uses <strong>1 Apollo credit</strong> and cannot be undone. The result is cached permanently.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg disabled:opacity-50" disabled={loading}>
            {loading ? 'Revealing…' : 'Confirm & Reveal'}
          </button>
        </div>
      </div>
    </div>
  );
}
