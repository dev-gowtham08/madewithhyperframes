import { readFileSync } from "node:fs";

const projects = JSON.parse(
  readFileSync(new URL("../data/projects.json", import.meta.url), "utf8"),
);

function sourceKeys(value, field) {
  if (typeof value !== "string" || !value.trim()) return [];

  const url = new URL(value, "https://local.invalid");
  const host = url.hostname.toLowerCase();
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const keys = [];

  if (field === "slug") return [`slug:${value}`];

  if (host === "x.com" || host === "twitter.com") {
    const status = path.match(/\/status\/(\d+)/i);
    if (status) keys.push(`x-status:${status[1]}`);
  }

  if (host === "video.twimg.com" || host === "pbs.twimg.com") {
    const media = path.match(/\/(?:amplify_video|amplify_video_thumb|ext_tw_video|ext_tw_video_thumb)\/(\d+)/i);
    if (media) keys.push(`x-media:${media[1]}`);
  }

  if (host === "reddit.com" || host === "www.reddit.com" || host === "old.reddit.com") {
    const post = path.match(/\/comments\/(\w+)/i);
    const video = path.match(/^\/video\/(\w+)/i);
    if (post) keys.push(`reddit-post:${post[1].toLowerCase()}`);
    if (video) keys.push(`reddit-media:${video[1].toLowerCase()}`);
  }

  if (host === "v.redd.it") {
    const media = path.match(/^\/(\w+)/);
    if (media) keys.push(`reddit-media:${media[1].toLowerCase()}`);
  }

  if (host === "hyperframes.dev" || host === "www.hyperframes.dev") {
    const session = path.match(/^\/session\/([\w-]+)/i);
    if (session) keys.push(`hyperframes-session:${session[1].toLowerCase()}`);
  }

  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    const video = url.searchParams.get("v") || path.match(/^\/shorts\/([^/]+)/)?.[1];
    if (video) keys.push(`youtube-video:${video}`);
  }
  if (host === "youtu.be") {
    const video = path.slice(1).split("/")[0];
    if (video) keys.push(`youtube-video:${video}`);
  }

  // Direct files and ordinary source pages: query strings often contain tracking or expiring tokens.
  keys.push(`url:${host}${path}`);
  return keys;
}

const seen = new Map();
const errors = [];

for (const [index, project] of projects.entries()) {
  const slug = project.slug || `entry ${index + 1}`;
  const keys = new Set([
    `slug:${slug}`,
    ...sourceKeys(project.videoUrl, "videoUrl"),
    ...sourceKeys(project.playbackUrl, "playbackUrl"),
    // X's thumbnail path carries the same video media ID as its stream.
    ...sourceKeys(project.thumbnailUrl, "thumbnailUrl").filter((key) => key.startsWith("x-media:")),
  ]);

  for (const key of keys) {
    const previous = seen.get(key);
    if (previous) errors.push(`${slug} repeats ${previous} (${key})`);
    else seen.set(key, slug);
  }
}

if (errors.length) {
  console.error(`Found ${errors.length} duplicate project source(s):\n${errors.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${projects.length} projects: no duplicate slugs, posts, media IDs, sessions, or URLs.`);
}
