import 'server-only';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

// Shared pieces for the generated share images (app/opengraph-image.tsx and
// app/projects/[slug]/opengraph-image.tsx), drawn in the site's dark theme.
export const shareImageSize = { width: 1200, height: 630 };

export const shareColors = {
  background: '#101210',
  text: '#f3f4ee',
  muted: '#9ca299',
  accent: '#b6a6ff',
  lime: '#d8ff63',
  ink: '#182016',
};

const fontDirectory = join(process.cwd(), 'assets', 'fonts');
const [regularFont, boldFont, siteIcon] = await Promise.all([
  readFile(join(fontDirectory, 'Geist-Regular.ttf')),
  readFile(join(fontDirectory, 'Geist-Bold.ttf')),
  readFile(join(process.cwd(), 'public', 'icon.svg')),
]);
// The site logo, the same file the header and browser tab use.
const brandIcon = `data:image/svg+xml;base64,${siteIcon.toString('base64')}`;

export const shareImageFonts = [
  { name: 'Geist', data: regularFont, weight: 400 as const, style: 'normal' as const },
  { name: 'Geist', data: boldFont, weight: 700 as const, style: 'normal' as const },
];

const localImageTypes: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };

// Returns the image as a data URL, or nothing if it can't be loaded, so a slow or missing
// thumbnail draws the card without it instead of failing the build.
export async function loadShareImage(path: string | undefined): Promise<string | undefined> {
  if (!path) return undefined;
  try {
    if (/^https?:\/\//.test(path)) {
      const response = await fetch(path, { signal: AbortSignal.timeout(10_000) });
      const type = response.headers.get('content-type') ?? '';
      if (!response.ok || !/^image\/(jpeg|png)$/.test(type)) return undefined;
      return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
    }
    const type = localImageTypes[extname(path).toLowerCase()];
    if (!type) return undefined;
    return `data:${type};base64,${(await readFile(join(process.cwd(), 'public', path))).toString('base64')}`;
  } catch {
    return undefined;
  }
}

// The header's logo and wordmark.
export function shareBrand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <img src={brandIcon} alt="" width={46} height={46} />
      <div style={{ display: 'flex', flexDirection: 'column', color: shareColors.text }}>
        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.6 }}>MADE WITH</div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.1 }}>Hyperframes</div>
      </div>
    </div>
  );
}
