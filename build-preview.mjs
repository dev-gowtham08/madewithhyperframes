import { cp, mkdir, writeFile } from 'node:fs/promises';
import { openStore } from './store.mjs';
import { publicEntries } from './curated.mjs';

// Only approved public fields are exported. No emails or pending submissions.
const db = openStore();
const entries = publicEntries(db);
db.close();
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await mkdir('dist/api', { recursive: true });
await writeFile('dist/api/entries.json', JSON.stringify(entries));
await writeFile('dist/api/config.json', JSON.stringify({ submissionsEnabled: false }));
console.log(`Built Vercel preview with ${entries.length} approved showcase(s). Submissions disabled.`);
