import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { LocalSubmissionForm } from '@/components/local-submission-form';
import { TallyPreconnect } from '@/components/tally-preconnect';
import { DEFAULT_TALLY_FORM_URL, getTallyForm } from '@/lib/tally';

export const metadata: Metadata = {
  title: 'Submit your project',
  description: 'Share a project made with Hyperframes or Opus with the Made With Hyperframes directory.'
};

export default function SubmitPage() {
  const isLocalJsonMode = process.env.NODE_ENV !== 'production';
  const form = getTallyForm(process.env.TALLY_FORM_URL || DEFAULT_TALLY_FORM_URL);

  return (
    <div className="submit-page shell">
      {!isLocalJsonMode && form && <TallyPreconnect />}
      <div className="submit-topline">
        <Link className="back-link" href="/#explore"><span aria-hidden="true">←</span> Back to directory</Link>
        <span>THE CREATOR DIRECTORY / SUBMISSIONS</span>
      </div>

      <header className="submit-hero">
        <div className="submit-hero-copy">
          <span className="hero-badge"><span aria-hidden="true" /> Open for submissions</span>
          <h1>There&apos;s room<br />for <em>your work.</em></h1>
          <p>Made something with Hyperframes or Opus? Share your public project link and let the community discover it.</p>
          <a className="button button-white" href="#submission-form">Start your submission <span aria-hidden="true">↘</span></a>
        </div>
        <div className="submit-hero-art" aria-hidden="true">
          <div className="submit-art-orbit" />
          <div className="submit-art-card"><span>THE NEXT GREAT PROJECT</span><strong>✳</strong><span>COULD BE YOURS ↗</span></div>
        </div>
      </header>

      <div className="submit-main">
        <section className="form-panel" id="submission-form" aria-labelledby="form-title">
          <div className="form-panel-top">
            <span className="form-index">01 <span>/</span> PROJECT DETAILS</span>
            <h2 id="form-title">Submit your project<span>.</span></h2>
            <p>Complete the form below. Your public project details will appear in the directory.</p>
          </div>
          {isLocalJsonMode ? (
            <LocalSubmissionForm />
          ) : form ? (
            <>
              <div className="tally-wrap">
                <iframe
                  className="tally-frame"
                  data-tally-src={form.embedUrl}
                  title="Submit your project to Made With Hyperframes"
                  loading="eager"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" />
              <div className="form-panel-bottom">Having trouble with the form? <a href={form.formUrl} target="_blank" rel="noopener noreferrer">Open it in a new tab <span aria-hidden="true">↗</span></a></div>
            </>
          ) : (
            <div className="form-unavailable">The submission form is temporarily unavailable.</div>
          )}
        </section>

        <aside className="submit-sidebar" aria-label="Submission guide">
          <div className="sidebar-card sidebar-intro">
            <span className="eyebrow"><span className="eyebrow-dot" /> A quick guide</span>
            <h2>Make your project easy to discover.</h2>
            <p>A few thoughtful details help people understand what you made before they open it.</p>
            <div className="sidebar-steps">
              <div><span>01</span><p><strong>Name your project</strong><small>Use the title people will recognise.</small></p></div>
              <div><span>02</span><p><strong>Share a public link</strong><small>Check that anyone can open your video or project.</small></p></div>
              <div><span>03</span><p><strong>Add a thumbnail</strong><small>Optional, but it helps your card stand out.</small></p></div>
            </div>
          </div>
          <div className="sidebar-card sidebar-note">
            <span className="sidebar-note-symbol" aria-hidden="true">✳</span>
            <h3>What happens next?</h3>
            <p>{isLocalJsonMode ? 'Local submissions are saved to data/projects.json and appear in the directory immediately.' : 'Once you submit, your project joins the directory. Newest submissions appear first.'}</p>
            <Link href="/#explore">Explore the directory <span aria-hidden="true">↗</span></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
