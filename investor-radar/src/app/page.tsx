'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [geography, setGeography] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !geography.trim()) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetGeography', geography);
    try {
      const res = await fetch('/api/startup/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: await res.text() }));
        throw new Error(err.error || 'Analysis failed');
      }
      const { startupId } = await res.json();
      router.push(`/startup/${startupId}/confirm`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Investor Radar</h1>
        <p className="text-slate-600 mb-6">
          Upload your pitch deck and target geography to discover & score matching investors with AI.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pitch document (PDF preferred)</label>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target geography</label>
            <input
              type="text"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              placeholder="e.g. Southeast Asia, California, UK & Ireland, New York"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing document…' : 'Analyze & Find Investors'}
          </button>
        </form>
        <p className="mt-6 text-xs text-slate-400">
          Powered by Apollo (search + email), Firecrawl (research), OpenAI (analysis). All paid results are cached.
        </p>
      </div>
    </main>
  );
}
