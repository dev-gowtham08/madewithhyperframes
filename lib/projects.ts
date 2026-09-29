import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_TALLY_FORM_ID } from '@/lib/tally';

export type Project = {
  slug: string;
  title: string;
  creator: string;
  tool: 'Hyperframes' | 'Opus' | 'Both';
  category: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  creatorUrl?: string;
  submittedAt?: string;
  featured?: boolean;
};

const projectsFile = join(process.cwd(), 'data', 'projects.json');

async function getJsonProjects(): Promise<Project[]> {
  try {
    const contents = await readFile(projectsFile, 'utf8');
    const value: unknown = JSON.parse(contents);
    return Array.isArray(value) ? value as Project[] : [];
  } catch {
    return [];
  }
}

type TallyQuestion = { id?: string; uuid?: string; key?: string; title?: string; label?: string };
type TallyResponse = {
  questionId?: string;
  key?: string;
  label?: string;
  answer?: unknown;
  formattedAnswer?: unknown;
  value?: unknown;
  question?: TallyQuestion;
  options?: Array<{ id?: string; text?: string }>;
};
type TallySubmission = {
  id?: string;
  submissionId?: string;
  submittedAt?: string;
  responses?: TallyResponse[];
  fields?: TallyResponse[];
};

function textValue(response: TallyResponse): string {
  const raw = response.formattedAnswer ?? response.answer ?? response.value;
  if (Array.isArray(raw)) {
    const optionNames = raw.map((value) => response.options?.find((option) => option.id === value)?.text ?? String(value));
    return optionNames.join(', ');
  }
  if (raw && typeof raw === 'object') return '';
  return raw == null ? '' : String(raw).trim();
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function answerFor(responses: TallyResponse[], labels: string[], questions: Map<string, string>): string {
  const wanted = new Set(labels.map(normalizeLabel));
  const response = responses.find((item) => {
    const questionId = item.questionId ?? item.key ?? item.question?.id ?? item.question?.key ?? '';
    const label = item.label ?? item.question?.label ?? item.question?.title ?? questions.get(questionId) ?? '';
    return wanted.has(normalizeLabel(label));
  });
  return response ? textValue(response) : '';
}

function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 54) || 'project';
}

async function getTallyProjects(): Promise<Project[]> {
  const apiKey = process.env.TALLY_API_KEY;
  const formId = process.env.TALLY_FORM_ID || DEFAULT_TALLY_FORM_ID;
  if (!apiKey) return [];

  try {
    const submissions: TallySubmission[] = [];
    let questions: TallyQuestion[] = [];
    let page = 1;

    while (true) {
      const response = await fetch(`https://api.tally.so/forms/${encodeURIComponent(formId)}/submissions?filter=completed&limit=500&page=${page}`, {
        headers: { Authorization: `Bearer ${apiKey}`, 'tally-version': '2025-02-01' },
        cache: 'no-store'
      });
      if (!response.ok) return [];

      const payload = await response.json() as {
        questions?: TallyQuestion[];
        submissions?: TallySubmission[];
        hasMore?: boolean;
      };
      questions = payload.questions ?? questions;
      const batch = payload.submissions ?? [];
      submissions.push(...batch);
      if (!payload.hasMore || batch.length === 0) break;
      page += 1;
    }

    const questionLabels = new Map(questions.flatMap((question) => {
      const id = question.id ?? question.uuid ?? question.key;
      const label = question.label ?? question.title;
      return id && label ? [[id, label] as const] : [];
    }));

    return submissions.flatMap((submission) => {
      const responses = submission.responses ?? submission.fields ?? [];
      const id = submission.id ?? submission.submissionId ?? '';
      const title = answerFor(responses, ['Project or video title', 'Project title', 'Video title'], questionLabels);
      const creator = answerFor(responses, ['Creator name'], questionLabels);
      const description = answerFor(responses, ['Description'], questionLabels);
      const videoUrl = safeUrl(answerFor(responses, ['Video or project URL', 'Video URL', 'Project URL'], questionLabels));
      if (!id || !title || !creator || !description || !videoUrl) return [];

      const toolAnswer = answerFor(responses, ['Tool used'], questionLabels).toLowerCase();
      const tool: Project['tool'] = toolAnswer.includes('both') ? 'Both' : toolAnswer.includes('opus') ? 'Opus' : 'Hyperframes';
      const category = answerFor(responses, ['Category'], questionLabels) || 'Other';
      const thumbnailUrl = safeUrl(answerFor(responses, ['Thumbnail URL', 'Thumbnail URL (optional)'], questionLabels));
      const submittedCreatorUrl = safeUrl(answerFor(responses, ['Creator or project website', 'Creator or project website (optional)', 'Creator or project URL'], questionLabels));
      // This submitted Gumroad product page is gone; the creator's profile remains available.
      const creatorUrl = submittedCreatorUrl === 'https://sidheart.gumroad.com/l/yudd'
        ? 'https://sidheart.gumroad.com/'
        : submittedCreatorUrl;

      return [{
        slug: `${slugify(title)}-${id.slice(-6).toLowerCase()}`,
        title,
        creator,
        tool,
        category,
        description,
        videoUrl,
        ...(submission.submittedAt ? { submittedAt: submission.submittedAt } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ...(creatorUrl ? { creatorUrl } : {})
      } satisfies Project];
    }).sort((a, b) => {
      const first = Date.parse(a.submittedAt ?? '') || Number.MAX_SAFE_INTEGER;
      const second = Date.parse(b.submittedAt ?? '') || Number.MAX_SAFE_INTEGER;
      return first - second;
    });
  } catch {
    return [];
  }
}

export async function getProjects(): Promise<Project[]> {
  const jsonProjects = await getJsonProjects();
  if (process.env.NODE_ENV !== 'production') return jsonProjects;

  const tallyProjects = await getTallyProjects();
  return [...tallyProjects, ...jsonProjects];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((project) => project.slug === slug);
}

export function getCategories(projectList: Project[]): string[] {
  return [...new Set(projectList.map((project) => project.category))].sort();
}
