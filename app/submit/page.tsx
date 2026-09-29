import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { DEFAULT_TALLY_FORM_URL, getTallyForm } from '@/lib/tally';

export const metadata: Metadata = { title: 'Submit your video', description: 'Share your Hyperframes or Opus project with the Made With Hyperframes directory.' };

const fields = ['Creator name', 'Project or video title', 'Description', 'Video URL', 'Thumbnail URL (optional)', 'Tool used: Hyperframes, Opus, or Both', 'Category', 'Creator or project URL (optional)'];

export default function SubmitPage() {
  const form = getTallyForm(process.env.TALLY_FORM_URL || DEFAULT_TALLY_FORM_URL);

  return (
    <div className="submit-page shell"><Link className="back-link" href="/">← Back to directory</Link><div className="submit-layout"><div className="submit-intro"><span className="eyebrow"><span className="eyebrow-dot" />Open for submissions</span><h1>Share what<br />you <em>made.</em></h1><p>Have a video or project made with Hyperframes or Opus? Share the details and a public link, and the project will appear in the directory.</p><div className="submit-steps"><div><span>01</span><p>Tell us about your project</p></div><div><span>02</span><p>Share the public video link</p></div><div><span>03</span><p>Your project appears in the directory</p></div></div></div><div className="form-panel"><div className="form-panel-top"><span className="eyebrow">Project submission</span><h2>Submit your video</h2><p>Complete the form below. Only public project information appears in the directory.</p></div>{form ? <><iframe className="tally-frame" data-tally-src={form.embedUrl} title="Submit your project to Made With Hyperframes" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" /><div className="form-panel-bottom">Form not loading? <a href={form.formUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab ↗</a></div></> : null}</div></div><div className="submit-guide"><span className="eyebrow">What to prepare</span><h2>A few details about your work</h2><div className="field-list">{fields.map((field, index) => <div key={field}><span>{String(index + 1).padStart(2, '0')}</span><p>{field}</p></div>)}</div></div></div>
  );
}
