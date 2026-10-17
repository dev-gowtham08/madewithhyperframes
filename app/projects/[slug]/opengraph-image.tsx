import { ImageResponse } from 'next/og';
import { getProject, getProjects } from '@/lib/projects';
import { loadShareImage, shareBrand, shareColors as c, shareImageFonts, shareImageSize } from '@/lib/share-image';

export const alt = 'Video card from Made With Hyperframes';
export const size = shareImageSize;
export const contentType = 'image/png';
// Every video's card is drawn at build time; other slugs return 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

// X shows only this image for a shared link, so it carries the title and creator itself.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = await getProject((await params).slug);
  if (!project) return new Response('Not found', { status: 404 });
  const thumbnail = await loadShareImage(project.thumbnailUrl);
  const titleSize = project.title.length <= 22 ? 64 : project.title.length <= 32 ? 58 : 52;
  // The bundled font draws Latin text. A name in another script would need a font download during
  // the build, which can time out, so the card shows the creator's X handle instead.
  const handle = project.creatorUrl?.match(/x\.com\/([^/?#]+)/)?.[1];
  const byline = /^[\u0000-ɏ -⁯]*$/.test(project.creator) || !handle ? project.creator : `@${handle}`;

  return new ImageResponse(
    (
      <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', background: c.background, color: c.text, fontFamily: 'Geist' }}>
        {thumbnail && <img src={thumbnail} alt="" style={{ position: 'absolute', top: 0, right: 0, width: 660, height: 630, objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', top: 0, left: 540, width: 280, height: 630, display: 'flex', backgroundImage: `linear-gradient(90deg, ${c.background}, rgba(16,18,16,0))` }} />
        {thumbnail && (
          <div style={{ position: 'absolute', left: 874, top: 269, width: 92, height: 92, borderRadius: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.94)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill={c.background} /></svg>
          </div>
        )}
        {project.duration && <div style={{ position: 'absolute', right: 32, bottom: 32, display: 'flex', padding: '8px 12px', borderRadius: 8, background: 'rgba(9,10,9,0.82)', color: '#ffffff', fontSize: 22, fontWeight: 700 }}>{project.duration}</div>}
        <div style={{ position: 'absolute', left: 64, top: 56, width: 520, height: 518, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {shareBrand()}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 1.6, color: c.accent }}>{`${project.category} / ${project.stack.join(' + ')}`.toUpperCase()}</div>
            <div style={{ marginTop: 18, fontSize: titleSize, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.5 }}>{project.title}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, fontSize: 28, color: c.muted }}><span>By</span><span style={{ color: c.text, fontWeight: 700 }}>{byline}</span></div>
          </div>
          <div style={{ display: 'flex' }}>
            {!project.prompt_partial && <div style={{ display: 'flex', padding: '9px 14px', borderRadius: 6, background: c.lime, color: c.ink, fontSize: 18, fontWeight: 700, letterSpacing: 1.4 }}>FULL PROMPT</div>}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: shareImageFonts },
  );
}
