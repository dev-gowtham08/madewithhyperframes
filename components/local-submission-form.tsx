'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { VIDEO_CATEGORIES } from '@/lib/video-categories';

type SavedProject = { slug: string; title: string };

export function LocalSubmissionForm() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [savedProject, setSavedProject] = useState<SavedProject | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('saving');
    setMessage('');
    setSavedProject(null);

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/local-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, permission: values.permission === 'on' })
      });
      const result = await response.json() as { project?: SavedProject; error?: string };

      if (!response.ok || !result.project) {
        setStatus('error');
        setMessage(result.error || 'The project could not be saved.');
        return;
      }

      form.reset();
      setSavedProject(result.project);
      setStatus('saved');
      setMessage(`${result.project.title} was saved to data/projects.json.`);
      router.refresh();
    } catch {
      setStatus('error');
      setMessage('The local server could not be reached. Please try again.');
    }
  }

  return (
    <form className="local-form" onSubmit={submit}>
      <div className="local-mode-note"><strong>Local JSON mode</strong><span>This form writes public project fields to <code>data/projects.json</code>.</span></div>
      <div className="local-form-grid">
        <label><span>Creator name <b>*</b></span><input name="creator" type="text" required maxLength={100} placeholder="Your name or studio" /></label>
        <label><span>Project or video title <b>*</b></span><input name="title" type="text" required maxLength={120} placeholder="A clear, memorable title" /></label>
        <label className="local-field-wide"><span>Description <b>*</b></span><textarea name="description" required maxLength={600} rows={5} placeholder="What did you make, and what should viewers know?" /></label>
        <label className="local-field-wide"><span>Video or project URL <b>*</b></span><input name="videoUrl" type="url" required placeholder="https://..." /></label>
        <label className="local-field-wide"><span>Thumbnail URL <small>Optional</small></span><input name="thumbnailUrl" type="url" placeholder="https://.../thumbnail.jpg" /><small>Leave this empty to use the directory&apos;s generated artwork.</small></label>
        <label><span>Tool used <b>*</b></span><select name="tool" required defaultValue=""><option value="" disabled>Select a tool</option><option>Hyperframes</option><option>Opus</option><option>Both</option></select></label>
        <label><span>Category <b>*</b></span><select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{VIDEO_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="local-field-wide"><span>Creator or project website <small>Optional</small></span><input name="creatorUrl" type="url" placeholder="https://..." /></label>
      </div>
      <label className="local-permission"><input name="permission" type="checkbox" required /><span>I confirm this project can be published in the directory.</span></label>
      <div className="local-form-actions">
        <button className="button button-dark" type="submit" disabled={status === 'saving'}>{status === 'saving' ? 'Saving…' : 'Save project locally'} <span aria-hidden="true">↗</span></button>
        <span className={`local-form-status ${status}`} role="status" aria-live="polite">{message}</span>
      </div>
      {savedProject && <div className="local-saved-links"><Link href={`/#explore`}>View in directory</Link><Link href={`/projects/${savedProject.slug}`}>Open project page</Link></div>}
    </form>
  );
}
