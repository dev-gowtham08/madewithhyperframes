import { ImageResponse } from 'next/og';
import { createHash } from 'node:crypto';
import { getProjects } from '@/lib/projects';
import { loadShareImage, shareBrand, shareColors as c, shareImageFonts, shareImageSize } from '@/lib/share-image';

export const alt = 'Made With Hyperframes, a directory of videos made with Hyperframes and Opus';
export const size = shareImageSize;
export const contentType = 'image/png';

// Give the card a new URL whenever its source data changes, so social platforms
// do not keep showing an older image from their link-preview cache.
export async function generateImageMetadata() {
  const projects = await getProjects();
  const id = createHash('sha256').update(JSON.stringify(projects)).digest('hex').slice(0, 12);
  return [{ id, alt, size, contentType }];
}

// The directory's share card: the headline, live counts, and six thumbnails. Featured videos
// come first, then the newest, so marking entries `featured` chooses what the card shows.
export default async function Image() {
  const projects = await getProjects();
  const picks = [...projects].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || (Date.parse(b.submittedAt ?? '') || 0) - (Date.parse(a.submittedAt ?? '') || 0));
  const thumbnails = (await Promise.all(picks.slice(0, 10).map((project) => loadShareImage(project.thumbnailUrl)))).filter(Boolean).slice(0, 6);
  const stats: Array<[number, string]> = [
    [projects.length, 'videos'],
    [projects.filter((project) => !project.prompt_partial).length, 'full prompts'],
    [new Set(projects.map((project) => (project.creatorUrl ?? project.creator).toLowerCase())).size, 'creators'],
  ];

  return new ImageResponse(
    (
      <div style={{ display: 'flex', position: 'relative', width: '100%', height: '100%', background: c.background, color: c.text, fontFamily: 'Geist' }}>
        <div style={{ position: 'absolute', right: 56, top: 77, width: 542, display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {thumbnails.map((src, index) => <img key={index} src={src} alt="" style={{ width: 264, height: 149, borderRadius: 14, objectFit: 'cover' }} />)}
        </div>
        <div style={{ position: 'absolute', left: 64, top: 56, width: 500, height: 518, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {shareBrand()}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 66, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>
              <div style={{ display: 'flex', gap: 12 }}><span>Hyperframes</span><span style={{ color: c.accent }}>&amp;</span></div>
              <div style={{ display: 'flex' }}>Opus videos</div>
            </div>
            <div style={{ marginTop: 22, fontSize: 25, lineHeight: 1.35, color: c.muted }}>Videos made with Hyperframes and Opus, with the prompts behind them.</div>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            {stats.map(([value, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 40, fontWeight: 700, color: c.lime, letterSpacing: -1 }}>{value.toLocaleString('en-US')}</div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1.4, color: c.muted }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: shareImageFonts },
  );
}
