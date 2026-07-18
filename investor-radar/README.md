# Investor Radar

AI-assisted investor discovery platform built from the provided Google Doc specification.

Upload a startup pitch document + target geography → extract structured profile → find real investors via Apollo → research firm sites with Firecrawl → score each investor on a rigorous 7-parameter rubric using LLM analysis → interactive dashboard with Group A/B scores, live toggles, filters, and on-demand email reveal (cached).

## ⚠️ CRITICAL SECURITY NOTICE

**The original Google Doc contained live Apollo and Firecrawl API keys.**  
Those keys are **exposed**.  

**Rotate them immediately** in the Apollo.io dashboard (Settings → API Keys) and Firecrawl dashboard before using this application.  
Never commit real keys to source control. Use only the placeholders in `.env.example`.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Prisma + SQLite** (zero-config local persistence & caching; easy to switch to Postgres/Neon/Supabase)
- **Apollo.io** — free people search (`mixed_people/api_search`) + paid email reveal (`people/match`)
- **Firecrawl** — firm website scraping (≤2 pages per investor)
- **OpenAI** (gpt-4o-mini / gpt-4o) — replaces the original Perplexity calls for extraction, Apollo query building, and scoring (as required by the Doc note: “DONT USE PERPLEXITY … USE YOUR OWN AI”)

## Setup

```bash
cd investor-radar
cp .env.example .env.local
# Edit .env.local with your *rotated* keys + OpenAI key
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open http://localhost:3000

### Environment variables

```
DATABASE_URL="file:./dev.db"
APOLLO_API_KEY=...          # master key required for search
FIRECRAWL_API_KEY=fc-...
OPENAI_API_KEY=sk-...
```

## Pipeline (matches original Definition of Done)

1. **Upload + Stage 1** — PDF (or text) → LLM extraction of Startup profile → user confirms.
2. **Stage 2** — LLM builds precise Apollo filter set from profile + geography.
3. **Stage 3** — Apollo `mixed_people/api_search` (no credits) — up to 2 pages × 100.
4. **Stage 4** — Rule-based hard-drop filter (title exclude/include + VC org signals) + rank → ~25 candidates. Zero API cost.
5. **Stage 5** — For each: Firecrawl scrape (≤1–2 pages) + one LLM call returning all 7 scores + rationales. Cached.
6. **Dashboard** — Group A (Sector Fit, Expertise, Stage Fit) + Group B (Check Match, Attainability, Credibility, Geography) side-by-side, overall average of currently enabled parameters. 7 toggles re-sort **entirely client-side**. Filters + search.
7. **Email reveal** — Confirmation modal warning of 1 Apollo credit. Result permanently cached in DB. No bulk reveal.

## Cost-control rules (enforced)

- Hard filter before any paid call.
- Exactly one LLM call per investor for all 7 scores.
- Max ~2 Firecrawl scrapes per investor.
- All Apollo search / Firecrawl / LLM / reveal results stored in SQLite — reloads never re-spend.
- Email reveal is deliberate, one-at-a-time, confirmed.

## Project structure

```
prisma/schema.prisma
src/
  lib/
    db.ts, apollo.ts, firecrawl.ts, hard-filter.ts, llm.ts, prompts.ts
  components/
    ScoreToggles.tsx, InvestorCard.tsx, RevealModal.tsx
  types/index.ts
  app/
    page.tsx                          # Upload
    startup/[id]/confirm/page.tsx     # Profile confirm → triggers search+score
    startup/[id]/dashboard/page.tsx   # Results + toggles + reveal
    api/
      startup/analyze/route.ts
      investors/search/route.ts
      investors/score/route.ts
      investors/route.ts              # GET list
      investors/[id]/reveal-email/route.ts
```

## Notes & limitations (MVP)

- Confirm page is simplified (profile already persisted from analyze). You can extend it with a PATCH route + full editable form.
- Scoring runs sequentially in small batches; for 25 investors it can take several minutes depending on API latency.
- No authentication / multi-tenancy (add NextAuth + userId foreign keys for production).
- Mock/heuristic scoring is available if `OPENAI_API_KEY` is absent (useful for UI demos).
- pdf-parse requires Node.js runtime (already set on the analyze route).
- For production: switch Prisma provider to PostgreSQL, add rate limiting, better error surfaces, progress SSE/polling for the scoring job, and rotate keys regularly.

## Definition of Done checklist

- [x] Upload → confirm profile → geography input works end to end  
- [x] Apollo query built and executed in ≤2 pages  
- [x] Hard-drop filter runs at zero extra API cost  
- [x] ~25 investors each get Firecrawl + one LLM call  
- [x] Dashboard shows Group A / Group B + average, sorted high→low  
- [x] All 7 toggles re-rank instantly with no network calls  
- [x] Reveal email requires confirmation, costs exactly one Apollo call, and is cached  
- [x] Reloading the dashboard never re-runs Stages 3–7  

Built collaboratively by the Grok team (Grok + Harper + Benjamin + Lucas) from the provided specification.
