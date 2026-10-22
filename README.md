# Made With Hyperframes

[Explore the community video directory](https://www.madewithhyperframes.com/) for Hyperframes and Opus examples, creator credits, and prompts when shared.

A video directory for work made with Hyperframes and Opus. Built with Next.js App Router and TypeScript. The directory reads `data/projects.json` in both local development and production. There is no public upload form, database, account system, or submission API.

## Run locally

Requires Node.js 24.

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. The site includes light and dark modes.

## Project structure

```text
app/                     Pages, shared layout, styles, share image, robots.txt, and sitemap
  api/video-source/      Resolves Hyperframes sessions to playable videos
  projects/[slug]/       Video detail pages and their share images
assets/fonts/            Geist fonts for the share images (SIL Open Font License, see OFL.txt)
components/              Directory, cards, player, navigation, and theme controls
data/projects.json       Directory entries for local and production use
lib/                     Project loading, types, categories, site address, and share-image helpers
public/                  Site icon, video posters, and local videos
```

Next.js generates `.next/` when running or building the app. `node_modules/` contains installed dependencies. Both are ignored by Git. There is no separate `src/`, root `api/`, or `dist/` application; `/submit` redirects through `next.config.ts` and needs no page folder.

## Add or edit a video

Edit [`data/projects.json`](data/projects.json). Each entry needs a unique `slug`, `title`, `creator`, `stack`, `category`, `prompt`, `prompt_partial`, and public `videoUrl`. `stack` lists every tool the video was made with, from `Hyperframes`, `Opus`, and `Remotion`, for example `["Hyperframes", "Opus"]`. Only list a tool that the creator's post or prompt names. The Hyperframes and Opus tabs filter on this list. Optional fields include `playbackUrl`, `thumbnailUrl`, `creatorUrl`, `duration`, `submittedAt` (ISO 8601 timestamp), and `featured`.

Set `prompt` to the creator's actual prompt and `prompt_partial` to `false` when a complete prompt is available. If the full prompt is unavailable, put a concise, source-based video summary or prompt excerpt in `prompt` and set `prompt_partial` to `true`. The detail page labels this as incomplete context. Do not present a post summary as a verbatim prompt. Entries with `prompt_partial: false` get a Full prompt badge and appear under the directory's Full prompt filter. Project entries no longer use a separate `description` field.

Publish distinct, real work with its actual creator and matching video. List videos made with HyperFrames or Opus, and leave out screen recordings of apps, websites, games, 3D models, or simulations that Opus built, since those aren't videos it made. Keep stock-footage test entries out of this file, and avoid listing the same Hyperframes session under different project names. Categories and counts come from the entries in this file. Set `submittedAt` to the date the video was posted, so Latest/Oldest sorting follows when the work was published. For an X post, use the post's own timestamp, as the existing entries do.

The retired sample entries are available in Git history. Their old detail URLs redirect to the directory through `next.config.ts`.

The JSON file stores video **details and URLs**, not the video files themselves. A `videoUrl` can point to a public video file or a supported Hyperframes session. A `thumbnailUrl` can point to an image in `public/` or an allowed remote source. Give each new entry a unique slug so its `/projects/[slug]` detail page works.

Directory cards show `thumbnailUrl` and play one muted preview at a time: the hovered card with a mouse, or the card nearest the middle of the screen on touch screens. A card that is not previewing downloads no video.

For an X post, keep the original post in `videoUrl`. To enable muted previews, add a verified direct media URL in `playbackUrl` (MP4 or HLS `.m3u8`); `thumbnailUrl` must be an actual image URL. A post page is not a playable stream or an image. The player falls back to the X embed if its separate playback source fails.

For a Reddit video, keep the original post permalink in `videoUrl` (or Reddit's `/video/<media-id>` link when the permalink is unavailable). Use a verified `https://v.redd.it/<media-id>/HLSPlaylist.m3u8` in `playbackUrl`; this playlist includes the audio track, while separate video-only MP4 files may not. Use the original Reddit thumbnail URL when it loads in the browser and clearly represents the video. If it is unavailable, blank, or too dark to identify the video, save a clear real frame in `public/posters/` instead. Do not store expiring signed `packaged-media.redd.it` download links. If the media is blocked or unavailable, verify a working source before adding the entry. Only include `submittedAt` when the original publication date is known.

[vxReddit](https://github.com/dylanpdx/vxReddit) can help retrieve thumbnail and stream metadata from an original Reddit post permalink when Reddit's JSON response is unavailable. Its embed metadata requires a social-preview crawler user agent, such as `Discordbot/2.0`; media-only `/video/<id>` links are unsupported. Verify every returned image and stream in the browser, and store the direct Reddit CDN URLs so visitors do not depend on the helper service. Read the video ID from the actual stream URL; an ID encoded in a thumbnail URL may identify a different asset.

Before adding an entry or creating its poster, compare the original post ID and media ID against existing entries, including alternate URL forms and reposted media. Running an import again must not create duplicate entries or assets.

Local development reads the file on request. To update production, commit and push the JSON change, then deploy the new revision to Vercel. Files inside a deployed Vercel build are not writable permanent storage, so production visitors cannot add entries directly. The old `/submit` URL redirects to the directory.

## Sharing and search

These are built from `data/projects.json`, so a new entry gets them automatically on the next deploy:

- **Share images.** Each video page has a 1200×630 card with its title, creator, tools, length, and thumbnail, drawn at build time. X shows only this image for a shared link. The directory's card shows live counts and six thumbnails: entries with `featured: true` first, then the newest.
- **Search basics.** `/robots.txt`, `/sitemap.xml` (listing each page's video), a canonical URL on every page that ignores directory filters, and schema.org `VideoObject` data on each video page.

They all use the production address in `lib/site.ts`. Change it there if the site moves to its own domain.

## Verify

```sh
npx tsc --noEmit
npm run build
```
