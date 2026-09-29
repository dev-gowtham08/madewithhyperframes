export const DEFAULT_TALLY_FORM_URL = 'https://tally.so/r/EkyqX4';
export const DEFAULT_TALLY_FORM_ID = 'EkyqX4';

export function getTallyForm(url: string | undefined): { formUrl: string; embedUrl: string } | null {
  const value = url || DEFAULT_TALLY_FORM_URL;
  try {
    const parsed = new URL(value);
    const match = parsed.pathname.match(/^\/(?:r|embed)\/([A-Za-z0-9]+)\/?$/);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'tally.so' || !match) return null;
    const id = match[1];
    return {
      formUrl: `https://tally.so/r/${id}`,
      embedUrl: `https://tally.so/embed/${id}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`
    };
  } catch {
    return null;
  }
}
