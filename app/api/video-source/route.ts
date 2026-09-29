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
  const source = new URL(request.url).searchParams.get('url');
  const sessionId = source ? sessionIdFrom(source) : undefined;
  if (!sessionId) return new Response('Invalid video source', { status: 400 });

  try {
    const sessionResponse = await fetch(`https://www.hyperframes.dev/api/sessions/${sessionId}`, { cache: 'no-store' });
    if (!sessionResponse.ok) return new Response('Session not found', { status: 404 });
    const session = await sessionResponse.json() as { projectId?: string };
    if (!session.projectId) return new Response('Session has no project', { status: 404 });

    const rendersResponse = await fetch(`https://www.hyperframes.dev/api/projects/${encodeURIComponent(session.projectId)}/renders?sessionId=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
    if (!rendersResponse.ok) return new Response('No render available', { status: 404 });
    const payload = await rendersResponse.json() as { renders?: Array<{ status?: string; createdAt?: number; url?: string }> };
    const render = [...(payload.renders ?? [])]
      .filter((entry) => entry.status === 'complete' && entry.url)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
    if (!render?.url) return new Response('No playable render available', { status: 404 });
    return Response.redirect(render.url, 307);
  } catch {
    return new Response('Video source unavailable', { status: 502 });
  }
}
