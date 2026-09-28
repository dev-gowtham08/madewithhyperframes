import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function openStore(directory = process.env.DATA_DIR || './data') {
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(join(directory, 'showcase.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, creator TEXT NOT NULL, email TEXT NOT NULL,
    description TEXT NOT NULL, video TEXT NOT NULL, product TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL, tools TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
    created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  return db;
}
export const categories = ['Product demo', 'Launch video', 'Motion design', 'Explainer', 'Experiment'];
export function validate(input) {
  const out = {};
  for (const [key, max] of Object.entries({title:100,creator:80,email:254,description:1500,video:1000,product:1000,category:40,tools:120})) {
    const value = input[key];
    if (typeof value !== 'string' || value.trim().length > max || (!value.trim() && key !== 'product')) throw new Error(`Please check ${key}.`);
    out[key] = value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new Error('Enter a valid email address.');
  if (!categories.includes(out.category)) throw new Error('Select a category.');
  for (const key of ['video','product']) {
    if (!out[key]) continue;
    let url; try { url = new URL(out[key]); } catch { throw new Error(`Enter a valid ${key} URL.`); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Use an HTTPS ${key} URL without credentials.`);
  }
  const u = new URL(out.video);
  const session=['hyperframes.dev','www.hyperframes.dev'].includes(u.hostname) && /^\/session\/[a-f0-9-]+\/?$/i.test(u.pathname);
  if (!session && !['youtube.com','www.youtube.com','youtu.be','vimeo.com','www.vimeo.com'].includes(u.hostname) && !/\.(mp4|webm)$/i.test(u.pathname)) throw new Error('Use a HyperFrames session, YouTube, Vimeo, MP4, or WebM link.');
  if (input.permission !== true || input.hyperframes !== true) throw new Error('Please confirm the submission requirements.');
  return out;
}
