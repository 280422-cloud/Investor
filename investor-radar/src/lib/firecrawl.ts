export async function scrapeUrl(url: string): Promise<string | null> {
  if (!url || !process.env.FIRECRAWL_API_KEY) return null;
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });
    if (!res.ok) {
      console.error('Firecrawl failed', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.data?.markdown ?? data.markdown ?? null;
  } catch (e) {
    console.error('Firecrawl error', e);
    return null;
  }
}
