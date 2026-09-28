import type { Metadata } from 'next';
import Link from 'next/link';
import { getTallyForm } from '@/lib/tally';

export const metadata: Metadata = { title: 'Submit your video', description: 'Share your Hyperframes or Opus project with the Made With Hyperframes directory.' };

const fields = ['Creator name', 'Project or video title', 'Description', 'Video URL', 'Thumbnail URL (optional)', 'Tool used: Hyperframes, Opus, or Both', 'Category', 'Creator or project URL (optional)'];

export default function SubmitPage() {
  const form = getTallyForm(process.env.TALLY_FORM_URL);

  return (
    <div className="submit-page shell"><Link className="back-link" href="/">← Back to directory</Link><div className="submit-layout"><div className="submit-intro"><span className="eyebrow"><span className="eyebrow-dot" />{form ? "Open for submissions" : "Submissions coming soon"}</span><h1>Share what<br />you <em>made.</em></h1><p>Have a video or project made with Hyperframes or Opus? We&apos;d love to see it. Send us the details and a link to the published work.</p><div className="submit-steps"><div><span>01</span><p>Tell us about your project</p></div><div><span>02</span><p>Share the public video link</p></div><div><span>03</span><p>We&apos;ll review it for the directory</p></div></div></div><div className="form-panel"><div className="form-panel-top"><span className="eyebrow">Project submission</span><h2>Submit your video</h2><p>We collect submissions through Tally. A public link to your video is all you need.</p></div>{form ? <><iframe className="tally-frame" src={form.embedUrl} title="Submit your project to Made With Hyperframes" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" /><div className="form-panel-bottom">Form not loading? <a href={form.formUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab ↗</a></div></> : <div className="form-pending"><span className="pending-icon" aria-hidden="true">✳</span><h3>Submissions are opening soon</h3><p>Our Tally form is being set up. Please check back shortly to share your work.</p></div>}</div></div><div className="submit-guide"><span className="eyebrow">What to prepare</span><h2>A few details about your work</h2><div className="field-list">{fields.map((field, index) => <div key={field}><span>{String(index + 1).padStart(2, '0')}</span><p>{field}</p></div>)}</div></div></div>
  );
}
