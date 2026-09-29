# Made With Hyperframes

A video directory for work made with Hyperframes and Opus. Built with Next.js App Router and TypeScript. The directory reads `data/projects.json` in both local development and production. There is no public upload form, database, account system, or submission API.

## Run locally

Requires Node.js 24.

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. The site includes light and dark modes.

## Add or edit a video

Edit [`data/projects.json`](data/projects.json). Each entry needs a unique `slug`, `title`, `creator`, `tool` (`Hyperframes`, `Opus`, or `Both`), `category`, `description`, and public `videoUrl`. Optional fields include `thumbnailUrl`, `creatorUrl`, `duration`, `prompt`, `submittedAt` (ISO 8601 timestamp), and `featured`.

The JSON file stores video **details and URLs**, not the video files themselves. A `videoUrl` can point to a public video file or a supported Hyperframes session. A `thumbnailUrl` can point to an image in `public/` or an allowed remote source. Give each new entry a unique slug so its `/projects/[slug]` detail page works.

Local development reads the file on request. To update production, commit and push the JSON change, then deploy the new revision to Vercel. Files inside a deployed Vercel build are not writable permanent storage, so production visitors cannot add entries directly. The old `/submit` URL redirects to the directory.

## Verify

```sh
npx tsc --noEmit
npm run build
```
