import { DEFAULT_TALLY_FORM_ID } from '@/lib/tally';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.TALLY_API_KEY;
  const formId = process.env.TALLY_FORM_ID || DEFAULT_TALLY_FORM_ID;

  if (!apiKey) {
    return Response.json({ connected: false, reason: 'TALLY_API_KEY is not configured' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  try {
    const response = await fetch(`https://api.tally.so/forms/${encodeURIComponent(formId)}/submissions?filter=completed&limit=1`, {
      headers: { Authorization: `Bearer ${apiKey}`, 'tally-version': '2025-02-01' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return Response.json({ connected: false, reason: `Tally returned HTTP ${response.status}` }, {
        status: 502,
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    const payload = await response.json() as { submissions?: unknown[] };

    return Response.json({
      connected: true,
      formId,
      completedSubmissions: payload.submissions?.length ?? 0
    }, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch {
    return Response.json({ connected: false, reason: 'Tally could not be reached' }, {
      status: 502,
      headers: { 'Cache-Control': 'no-store' }
    });
  }
}
