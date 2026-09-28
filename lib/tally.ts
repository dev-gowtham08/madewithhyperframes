export function getTallyForm(url: string | undefined): { formUrl: string; embedUrl: string } | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/^\/(?:r|embed)\/([A-Za-z0-9]+)\/?$/);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'tally.so' || !match) return null;
    const id = match[1];
    return {
      formUrl: `https://tally.so/r/${id}`,
      embedUrl: `https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1`
    };
  } catch {
    return null;
  }
}
