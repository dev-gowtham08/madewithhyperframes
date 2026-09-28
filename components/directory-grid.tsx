'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/projects';
import { ProjectCard } from './project-card';

export function DirectoryGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tool, setTool] = useState('All tools');
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesText = !search || [project.title, project.creator, project.description, project.category, project.tool].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = category === 'All' || project.category === category;
      const matchesTool = tool === 'All tools' || project.tool === tool || project.tool === 'Both';
      return matchesText && matchesCategory && matchesTool;
    });
  }, [projects, query, category, tool]);

  return (
    <section id="explore" className="explore-section shell" aria-labelledby="explore-title">
      <div className="section-top"><div><span className="eyebrow">The directory</span><h2 id="explore-title">Explore the work<span className="heading-period">.</span></h2><p>Good ideas, brought to life in motion.</p></div><span className="count-label">{filtered.length.toString().padStart(2, '0')} PROJECT{filtered.length === 1 ? '' : 'S'}</span></div>
      <div className="toolbar">
        <label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search projects</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, creators, or tools" /></label>
        <label className="tool-select"><span className="sr-only">Filter by tool</span><select value={tool} onChange={(event) => setTool(event.target.value)}><option>All tools</option><option>Hyperframes</option><option>Opus</option></select></label>
      </div>
      <div className="category-list" role="group" aria-label="Filter by category">
        {['All', ...categories].map((value) => <button key={value} type="button" className={`category-pill${category === value ? ' active' : ''}`} onClick={() => setCategory(value)} aria-pressed={category === value}>{value}</button>)}
      </div>
      {filtered.length > 0 ? (
        <div className="project-grid">{filtered.map((project) => <ProjectCard key={project.slug} project={project} />)}<Link className="invite-card" href="/submit"><span className="invite-icon" aria-hidden="true">↗</span><span className="eyebrow">Your turn</span><strong>Made something worth sharing?</strong><span>Put your project in front of the community.</span><span className="invite-link">Submit your video <span aria-hidden="true">→</span></span></Link></div>
      ) : (
        <div className="empty-state"><span aria-hidden="true">⌕</span><h3>No projects found</h3><p>Try a different search or filter.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); setTool('All tools'); }}>Clear filters</button></div>
      )}
    </section>
  );
}
