'use client';

import { useMemo, useState } from 'react';
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
      <div className="section-top"><div><span className="eyebrow">Project index</span><h2 id="explore-title">Browse the directory</h2></div><span className="count-label">Showing {filtered.length} of {projects.length}</span></div>
      <div className="toolbar">
        <label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search projects</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by project, creator, or category" /></label>
        <div className="tool-tabs" role="group" aria-label="Filter by tool">{['All tools', 'Hyperframes', 'Opus'].map((value) => <button key={value} type="button" className={tool === value ? 'active' : ''} onClick={() => setTool(value)} aria-pressed={tool === value}>{value}</button>)}</div>
      </div>
      <div className="category-list" role="group" aria-label="Filter by category">
        {['All', ...categories].map((value) => <button key={value} type="button" className={`category-pill${category === value ? ' active' : ''}`} onClick={() => setCategory(value)} aria-pressed={category === value}>{value}</button>)}
      </div>
      {filtered.length > 0 ? (
        <div className="project-grid">{filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index + 1} />)}</div>
      ) : (
        <div className="empty-state"><span aria-hidden="true">⌕</span><h3>No projects found</h3><p>Try a different search or filter.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); setTool('All tools'); }}>Clear filters</button></div>
      )}
    </section>
  );
}
