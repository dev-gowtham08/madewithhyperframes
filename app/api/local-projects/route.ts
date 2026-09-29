import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Project } from '@/lib/projects';

export const runtime = 'nodejs';

const projectsFile = join(process.cwd(), 'data', 'projects.json');
const tools = new Set<Project['tool']>(['Hyperframes', 'Opus', 'Both']);
let writeQueue = Promise.resolve();

function text(value: unknown, maximum: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maximum) : '';
}

function webUrl(value: unknown, required = false): string | undefined {
  const candidate = text(value, 2048);
  if (!candidate) return required ? undefined : undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function slugify(value: string): string {
  const base = value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 54);
  return `${base || 'project'}-${randomUUID().slice(0, 6)}`;
}

async function appendProject(project: Project): Promise<void> {
  await mkdir(dirname(projectsFile), { recursive: true });
  let current: Project[] = [];
  try {
    const parsed: unknown = JSON.parse(await readFile(projectsFile, 'utf8'));
    if (Array.isArray(parsed)) current = parsed as Project[];
  } catch {
    // A missing local file starts as an empty directory.
  }

  const temporaryFile = `${projectsFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify([...current, project], null, 2)}\n`, 'utf8');
  await rename(temporaryFile, projectsFile);
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Local JSON submissions are disabled in production.' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'The submitted form could not be read.' }, { status: 400 });
  }

  const title = text(body.title, 120);
  const creator = text(body.creator, 100);
  const description = text(body.description, 600);
  const category = text(body.category, 80);
  const tool = text(body.tool, 20) as Project['tool'];
  const videoUrl = webUrl(body.videoUrl, true);
  const thumbnailUrl = webUrl(body.thumbnailUrl);
  const creatorUrl = webUrl(body.creatorUrl);

  if (!title || !creator || !description || !category || !tools.has(tool) || !videoUrl || body.permission !== true) {
    return Response.json({ error: 'Complete every required field and use a valid public URL.' }, { status: 400 });
  }
  if (text(body.thumbnailUrl, 2048) && !thumbnailUrl) {
    return Response.json({ error: 'Enter a valid thumbnail URL or leave it empty.' }, { status: 400 });
  }
  if (text(body.creatorUrl, 2048) && !creatorUrl) {
    return Response.json({ error: 'Enter a valid creator URL or leave it empty.' }, { status: 400 });
  }

  const project: Project = {
    slug: slugify(title),
    title,
    creator,
    description,
    category,
    tool,
    videoUrl,
    submittedAt: new Date().toISOString(),
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(creatorUrl ? { creatorUrl } : {})
  };

  try {
    const operation = writeQueue.then(() => appendProject(project));
    writeQueue = operation.catch(() => undefined);
    await operation;
    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json({ error: 'The project could not be saved to the local JSON file.' }, { status: 500 });
  }
}
