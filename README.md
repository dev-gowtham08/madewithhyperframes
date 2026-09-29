# Made With Hyperframes

A public directory for projects made with Hyperframes and Opus. Built with Next.js App Router and TypeScript. Poultry Path is kept in a local JSON file, and new projects are read from completed Tally submissions through Tally's JSON API. It has no separate database, accounts, or admin dashboard.

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

## Connect the Tally form and submissions

1. Create a form at [Tally](https://tally.so/). Include: creator name, project/video title, description, video URL, optional thumbnail URL, tool used (Hyperframes, Opus, Both), category, and optional creator/project URL. Make the key fields required and publish the form.
2. The public form `https://tally.so/r/EkyqX4` is already embedded on `/submit`.
3. In Tally, open **Settings → API keys**, create a key named `Made With Hyperframes`, and copy it. Tally only shows the full key once.
4. In Vercel, add the server-only environment variables below for Production, then redeploy.

```sh
TALLY_FORM_URL=https://tally.so/r/EkyqX4
TALLY_FORM_ID=EkyqX4
TALLY_API_KEY=your_private_tally_api_key
```

The `/submit` page embeds the form and includes a direct link if the embed fails. Once `TALLY_API_KEY` is configured, completed submissions are fetched as JSON and displayed automatically. The integration maps fields by their Tally labels, so keep these labels: `Creator name`, `Project or video title`, `Description`, `Video or project URL`, `Thumbnail URL (optional)`, `Tool used`, `Category`, and `Creator or project website (optional)`. Contact email and any other form fields are not exposed publicly.

## Verify

```sh
npm run build
npx tsc --noEmit
```
