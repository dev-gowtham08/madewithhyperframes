# Made With Hyperframes

A public directory for projects made with Hyperframes and Opus. Built with Next.js App Router and TypeScript. The MVP uses a local JSON file for published projects and Tally for collecting submissions; it has no database, accounts, or admin dashboard.

## Run locally

Requires Node.js 24.

```sh
npm install
npm run dev
```

Open <http://localhost:3000>. The site includes light and dark modes.

## Add a project

Add an object to [`data/projects.json`](data/projects.json). Each project needs a unique `slug`, `title`, `creator`, `tool` (`Hyperframes`, `Opus`, or `Both`), `category`, `description`, and public `videoUrl`. A `thumbnailUrl` can point to an image in `public/` or another supported image source. `creatorUrl` and `featured` are optional. The directory and detail pages read this file at build time, so redeploy after changing it.

Poultry Path is the first entry. Its thumbnail is an original illustration for this directory; the original Hyperframes session opens from its detail page.

## Connect the Tally form

1. Create a form at [Tally](https://tally.so/). Include: creator name, project/video title, description, video URL, optional thumbnail URL, tool used (Hyperframes, Opus, Both), category, and optional creator/project URL. Make the key fields required and publish the form.
2. Copy its public share URL, such as `https://tally.so/r/abc123`.
3. Set `TALLY_FORM_URL` in `.env.local` for local development, and in the hosting provider's environment settings for deployment. Restart or redeploy after setting it.

```sh
TALLY_FORM_URL=https://tally.so/r/abc123
```

The `/submit` page embeds the form and includes a direct link if the embed fails. Until a valid Tally URL is configured, the page shows a clear “opening soon” state. Submissions are stored in your Tally account. Review them there and manually add selected projects to `data/projects.json` before redeploying.

## Verify

```sh
npm run build
npx tsc --noEmit
```
