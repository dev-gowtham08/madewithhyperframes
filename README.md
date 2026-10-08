# Made With Hyperframes

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
app/                     Pages, shared layout, and styles
  api/video-source/      Resolves Hyperframes sessions to playable videos
  projects/[slug]/       Video detail pages
components/              Directory, cards, player, navigation, and theme controls
data/projects.json       Directory entries for local and production use
lib/                     Project loading, types, and category definitions
public/                  Site icon, theme initialization, and video posters
```

Next.js generates `.next/` when running or building the app. `node_modules/` contains installed dependencies. Both are ignored by Git. There is no separate `src/`, root `api/`, or `dist/` application; `/submit` redirects through `next.config.ts` and needs no page folder.

## Add or edit a video

Edit [`data/projects.json`](data/projects.json). Each entry needs a unique `slug`, `title`, `creator`, `tool` (`Hyperframes`, `Opus`, or `Both`), `category`, `description`, and public `videoUrl`. Optional fields include `playbackUrl`, `thumbnailUrl`, `creatorUrl`, `duration`, `submittedAt` (ISO 8601 timestamp), and `featured`.

Set `prompt` to the creator's actual prompt when available and `prompt_partial` to `false` for a complete prompt or `true` for an excerpt. If the original source contains no prompt, use `"prompt": null` and `"prompt_partial": false`; write a concise, source-based summary in `description`. The detail page shows that description and makes clear that no prompt was provided. Do not present a post summary as a verbatim prompt.

Publish distinct, real work with its actual creator and matching video. Keep stock-footage test entries out of this file, and avoid listing the same Hyperframes session under different project names. Categories and counts come from the entries in this file. Set `submittedAt` to the date the entry was added to the directory so Latest/Oldest sorting works.

The retired sample entries are available in Git history. Their old detail URLs redirect to the directory through `next.config.ts`.

The JSON file stores video **details and URLs**, not the video files themselves. A `videoUrl` can point to a public video file or a supported Hyperframes session. A `thumbnailUrl` can point to an image in `public/` or an allowed remote source. Give each new entry a unique slug so its `/projects/[slug]` detail page works.

For an X post, keep the original post in `videoUrl`. To enable muted autoplay, add a verified direct media URL in `playbackUrl` (MP4 or HLS `.m3u8`); `thumbnailUrl` must be an actual image URL. A post page is not a playable stream or an image. The player falls back to the X embed if its separate playback source fails.

Local development reads the file on request. To update production, commit and push the JSON change, then deploy the new revision to Vercel. Files inside a deployed Vercel build are not writable permanent storage, so production visitors cannot add entries directly. The old `/submit` URL redirects to the directory.

## Verify

```sh
npx tsc --noEmit
npm run build
```
