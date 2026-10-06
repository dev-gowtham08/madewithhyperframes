export const runtime = 'nodejs';

function sessionIdFrom(value: string): string | undefined {
  try {
    const url = new URL(value);
    if ((url.hostname !== 'hyperframes.dev' && url.hostname !== 'www.hyperframes.dev') || !url.pathname.startsWith('/session/')) return undefined;
    const id = url.pathname.split('/').filter(Boolean)[1];
    return id && /^[a-z0-9-]+$/i.test(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const source = params.get('url');
  const wantsJson = params.get('format') === 'json';
  const headers = { 'Cache-Control': 'no-store' };
  function unavailable(message: string, status: number) {
    // The player asks for availability before assigning a URL to its video element.
    return wantsJson
      ? Response.json({ url: null, reason: message }, { status, headers })
      : new Response(message, { status, headers });
  }
  const sessionId = source ? sessionIdFrom(source) : undefined;
  if (!sessionId) return new Response('Invalid video source', { status: 400, headers });

  try {
    const sessionResponse = await fetch(`https://www.hyperframes.dev/api/sessions/${sessionId}`, { cache: 'no-store' });
    if (!sessionResponse.ok) return unavailable('Session not found', 404);
    const session = await sessionResponse.json() as { projectId?: string };
    if (!session.projectId) return unavailable('Session has no project', 404);

    const rendersResponse = await fetch(`https://www.hyperframes.dev/api/projects/${encodeURIComponent(session.projectId)}/renders?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
    if (!rendersResponse.ok) return unavailable('No render available', 404);
    const payload = await rendersResponse.json() as { renders?: Array<{ status?: string; createdAt?: number; url?: string }> };
    const render = [...(payload.renders ?? [])]
      .filter((entry) => entry.status === 'complete' && entry.url)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
    if (!render?.url) return unavailable('No playable render available', 404);
    const mediaUrl = new URL(render.url);
    if (mediaUrl.protocol !== 'https:') return unavailable('Invalid media URL', 502);
    const expires = mediaUrl.searchParams.get('Expires');
    if (expires && Number.isFinite(Number(expires)) && Number(expires) <= Date.now() / 1000 + 30) {
      return unavailable('The original video link has expired', 410);
    }
    return wantsJson
      ? Response.json({ url: mediaUrl.toString() }, { headers })
      : new Response(null, { status: 307, headers: { ...headers, Location: mediaUrl.toString() } });
  } catch {
    return unavailable('Video source unavailable', 502);
  }
}
