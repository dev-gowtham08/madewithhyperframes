import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

const categories = ['All videos', 'Product demo', 'Launch video', 'Motion design', 'Explainer', 'Experiment'];

function Preview({ entry, featured = false }) {
  return <a className={`preview ${entry.poster ? 'has-poster' : 'abstract'}`} href={`/showcase/${encodeURIComponent(entry.id)}`} aria-label={`Watch ${entry.title}`}>
    {entry.poster ? <img src={entry.poster} alt={`${entry.title} video preview`} /> : <div className="abstract-title">{entry.title}</div>}
    <span className="preview-label">{featured ? 'FEATURED INSPIRATION' : entry.credit || entry.category.toUpperCase()}</span><span className="play">▶</span>
    <span className="preview-bottom">{entry.title}<span>WATCH FILM ↗</span></span>
  </a>;
}

function Home({ entries }) {
  const [active, setActive] = useState('All videos');
  const [query, setQuery] = useState('');
  useEffect(() => { document.title = 'Made with HyperFrames — A community showcase'; if (location.hash === '#gallery') document.querySelector('#gallery')?.scrollIntoView(); }, []);
  const shown = entries.filter(e => (active === 'All videos' || e.category === active) && `${e.title} ${e.creator} ${e.description} ${e.tools}`.toLowerCase().includes(query.toLowerCase()));
  const featured = entries.find(e => e.id === 'hyperframes-launch') || entries[0];
  return <>
    <section className="hero"><div className="eyebrow"><span className="dot" /> THE COMMUNITY SHOWCASE</div><h1>A little code.<br />A lot of <span className="motion">motion<svg viewBox="0 0 430 25" aria-hidden="true"><path d="M4 17Q190 -5 425 10" /></svg></span><span className="period">.</span></h1><div className="hero-bottom"><p>A collection of films, demos, and experiments<br className="desktop" /> made with HyperFrames. By people like you.</p><a className="text-link" href="#gallery">Find your inspiration <span>↓</span></a></div><div className="hero-stamp" aria-hidden="true"><span>IDEAS INTO</span><b>▶</b><span>MOVING PICTURES</span></div></section>
    <section className="featured">{featured ? <Preview entry={featured} featured /> : <div className="empty">The first film is on its way.</div>}<div className="feature-copy"><div className="eyebrow">FROM THE WEB</div><h2>See what code<br />can set in motion.</h2><p>Start with {featured?.title || 'a film'} from {featured?.creator || 'the community'}: an inspiring example of what people can make with HyperFrames.</p>{featured && <a className="text-link" href={`/showcase/${encodeURIComponent(featured.id)}`}>Watch the featured film <span>↗</span></a>}<div className="creator"><span className="avatar">{featured?.creator?.[0] || 'H'}</span><div>{featured?.creator || 'HyperFrames'}<small>{featured?.credit || 'Featured creator'}</small></div><span className="tag">{featured?.tools || 'HyperFrames'}</span></div></div></section>
    <section id="gallery" className="gallery"><div className="section-heading"><div className="eyebrow">THE GOOD STUFF</div><h2>Explore the collection<span id="count">({entries.length})</span></h2><label className="search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a little inspiration…" aria-label="Search videos" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="filters" aria-label="Filter by category">{categories.map(c => <button key={c} type="button" aria-pressed={c === active} className={`filter ${c === active ? 'selected' : ''}`} onClick={() => setActive(c)}>{c === 'All videos' ? '✳   ' : ''}{c}</button>)}</div><div className="cards" aria-live="polite">{shown.length ? <>{shown.map(e => <article className="card" key={e.id}><Preview entry={e} /><div className="card-meta"><div><h3><a href={`/showcase/${encodeURIComponent(e.id)}`}>{e.title}</a></h3><p>By {e.creator}</p></div><span className="tag">{e.category}</span></div></article>)}{!query && active === 'All videos' && <a className="submit-card" href="/submit"><span className="plus">+</span><h3>This could be your next film.</h3><p>The collection is just getting started.<br />Help us make it something special.</p><span className="text-link">Submit your video ↗</span></a>}</> : <div className="empty"><h3>No videos here yet.</h3><p>Try another search or be the first to share a video in this category.</p><a className="text-link" href="/submit">Submit a video ↗</a></div>}</div></section>
    <section className="invitation"><div><div className="eyebrow">YOUR NEXT FRAME BELONGS HERE</div><h2>Make something worth<br />pressing play on.</h2><p>Your first experiment. Your latest launch. We’d love to see it.</p></div><a className="button" href="/submit">Share your creation <span>↗</span></a></section>
  </>;
}

function Player({ entry }) {
  if (entry.video.startsWith('/media/')) return <video controls playsInline preload="metadata" poster={entry.poster} src={entry.video} />;
  let url;
  try { url = new URL(entry.video); } catch { return null; }
  let embed = '';
  if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.split('/').pop();
    if (/^[\w-]{11}$/.test(id)) embed = `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (['vimeo.com', 'www.vimeo.com'].includes(url.hostname)) {
    const id = url.pathname.split('/').pop();
    if (/^\d+$/.test(id)) embed = `https://player.vimeo.com/video/${id}`;
  }
  if (embed) return <iframe src={embed} title={entry.title} allow="fullscreen; picture-in-picture" allowFullScreen />;
  if (/\.(mp4|webm)$/i.test(url.pathname)) return <video controls playsInline preload="metadata" poster={entry.poster} src={entry.video} />;
  return <div className="empty"><a className="button" href={entry.video} target="_blank" rel="noopener noreferrer">Watch on the video site ↗</a></div>;
}

function Detail({ entry }) {
  const [shareStatus, setShareStatus] = useState('');
  useEffect(() => { document.title = entry ? `${entry.title} — Made with HyperFrames` : 'Film not found — Made with HyperFrames'; }, [entry]);
  if (!entry) return <section className="page"><h1>Film not found.</h1><p>This video may still be in review.</p><a className="text-link" href="/">Back to the collection ↗</a></section>;
  async function share() { try { await navigator.clipboard.writeText(location.href); setShareStatus('Link copied.'); } catch { setShareStatus('Copy the URL from your address bar to share.'); } }
  return <section className="page detail"><a className="text-link" href="/#gallery">← Back to the collection</a><div className="detail-heading"><div><div className="eyebrow">{entry.credit || entry.category.toUpperCase()}</div><h1>{entry.title}</h1></div><span className="tag">Made with {entry.tools}</span></div><div className="player"><Player entry={entry} /></div><div className="detail-description"><div><h2>Behind the frames</h2><p>{entry.description}</p></div><aside><small>CREATED BY</small><h3>{entry.creator}</h3>{entry.product && <a className="text-link" href={entry.product} target="_blank" rel="noopener noreferrer">{entry.credit ? 'Explore the source' : 'Visit the product'} ↗</a>}<button className="filter" onClick={share}>Copy showcase link ↗</button><p role="status">{shareStatus}</p></aside></div></section>;
}

function Submission() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  useEffect(() => { document.title = 'Submit your video — Made with HyperFrames'; }, []);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = Object.fromEntries(new FormData(form));
    input.permission = form.elements.permission.checked;
    input.hyperframes = form.elements.hyperframes.checked;
    setSending(true); setStatus('Sending your creation…');
    try {
      const response = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      setSuccess(true);
    } catch (error) { setStatus(error.message || 'Could not submit. Please try again.'); setSending(false); }
  }
  return <section className="page submission"><div className="eyebrow">MAKE YOURSELF SEEN</div><h1>Your work.<br />Our next favorite.</h1><p>Made a video with HyperFrames? Give it a home here.<br />Every submission is reviewed before it joins the collection.</p><form onSubmit={submit}>{success ? <div className="success"><span>✓</span><h2>You’re in the review queue.</h2><p>Thanks for sharing your work. Your video will appear in the collection once it is approved.</p><a className="text-link" href="/">Explore the collection ↗</a></div> : <><div className="form-grid"><label>Video title<input name="title" maxLength="100" required placeholder="Give your creation a name" /></label><label>Your name<input name="creator" maxLength="80" required autoComplete="name" placeholder="How should we credit you?" /></label><label>Email address<input name="email" type="email" maxLength="254" required autoComplete="email" placeholder="you@example.com" /><small>Private. Only used for questions about your submission.</small></label><label>Category<select name="category">{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></label></div><label>Video link<input name="video" type="url" maxLength="1000" required placeholder="https://youtube.com/watch?v=…" /><small>Public HyperFrames session, YouTube, Vimeo, or an HTTPS MP4/WebM link. Session links open on HyperFrames; other supported videos play here.</small></label><label>About the video<textarea name="description" maxLength="1500" rows="4" required placeholder="What did you make, and what inspired it?" /></label><div className="form-grid"><label>Tools used<input name="tools" maxLength="120" defaultValue="HyperFrames" required placeholder="HyperFrames, Claude Opus…" /></label><label>Product or project link (optional)<input name="product" type="url" maxLength="1000" placeholder="https://your-project.com" /></label></div><label className="check"><input name="hyperframes" type="checkbox" required />This video was made with HyperFrames.</label><label className="check"><input name="permission" type="checkbox" required />I own this work or have permission to share it, and agree to its public display with creator credit.</label><p className="privacy">Your name, video, description, tools, and project link will be public if approved. Your email will not be published.</p><button className="button" type="submit" disabled={sending}>Send for review <span>↗</span></button><p role="status" aria-live="polite">{status}</p></>}</form></section>;
}

function About() { return <section className="page about"><div className="eyebrow">A HOME FOR WHAT YOU MAKE</div><h1>Good work deserves<br />an audience.</h1><p>This is an independent collection of videos created with HyperFrames: product demos, launch films, motion experiments, and everything in between.</p><h2>Small beginnings. Open doors.</h2><p>We start with a public film from the official HyperFrames examples for inspiration, with credit and a link to its source. The gallery is an invitation to other makers. You don’t need a big following or a perfect reel. Just something you made and want to share.</p><h2>HyperFrames required. Your process is yours.</h2><p>Whether you work with Claude Opus, another model, or write the code yourself, your HyperFrames creation belongs here. Tell us which tools you used so others can learn.</p><a className="button" href="/submit">Share your creation ↗</a><p className="privacy">This community site is not affiliated with or endorsed by HyperFrames or Anthropic.</p></section>; }

function Shell({ children }) { return <><header className="header"><a className="brand" href="/" aria-label="Made with HyperFrames home"><span className="brand-icon">h<span>f</span></span><span>made with<br /><strong>hyperframes</strong></span></a><nav aria-label="Main navigation"><a href="/#gallery">Explore</a><a href="/about">About</a><a className="button small" href="/submit">Submit a video <span>↗</span></a></nav></header><main>{children}</main><footer><a className="footer-brand" href="/">made with hyperframes<span>↗</span></a><p>An independent community showcase.<br />Not affiliated with HyperFrames or Anthropic.</p><a href="/submit">Made something? Share it ↗</a></footer></>; }

function App() {
  const path = location.pathname;
  const [entries, setEntries] = useState(null);
  const [enabled, setEnabled] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (path === '/about') return;
    const endpoint = path === '/submit' ? '/api/config' : '/api/entries';
    fetch(endpoint).then(response => { if (!response.ok) throw Error('Unavailable'); return response.json(); }).then(data => path === '/submit' ? setEnabled(data.submissionsEnabled) : setEntries(data)).catch(() => setError(true));
  }, [path]);
  let content;
  if (path === '/about') content = <About />;
  else if (error) content = <section className="page"><h1>{path === '/submit' ? 'Submissions are unavailable.' : 'The gallery couldn’t load.'}</h1><p>Please try again in a moment.</p><a className="button" href="/">Back to the collection ↗</a></section>;
  else if (path === '/submit') content = enabled === null ? <p className="loading">Loading…</p> : enabled ? <Submission /> : <section className="page about"><div className="eyebrow">PREVIEW EDITION</div><h1>Your work belongs here.</h1><p>We’re getting the collection ready. Creator submissions will open when our review system is connected.</p><p>For now, explore the first film and take a look around.</p><a className="button" href="/">Explore the collection ↗</a></section>;
  else if (!entries) content = <p className="loading">Loading the showcase…</p>;
  else if (path.startsWith('/showcase/')) content = <Detail entry={entries.find(e => e.id === decodeURIComponent(path.split('/')[2]))} />;
  else content = <Home entries={entries} />;
  return <Shell>{content}</Shell>;
}

createRoot(document.getElementById('app')).render(<App />);
