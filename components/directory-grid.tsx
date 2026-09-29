'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/projects';
import { ProjectCard } from './project-card';

export function DirectoryGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [tool, setTool] = useState('All');
  const [sort, setSort] = useState<'Latest' | 'Oldest' | 'Featured'>('Latest');
  const categoryOptions = ['All', 'Product Demo', 'SaaS', 'AI', 'Creative', 'Marketing', 'Education', 'Other', ...categories.filter((value) => !['Product Demo', 'SaaS', 'AI', 'Creative', 'Marketing', 'Education', 'Other'].includes(value))];
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const ordered = [...projects].sort((a, b) => {
      const first = Date.parse(a.submittedAt ?? '') || 0;
      const second = Date.parse(b.submittedAt ?? '') || 0;
      if (sort === 'Featured') return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || second - first;
      return sort === 'Latest' ? second - first : first - second;
    });
    return ordered.filter((project) => {
      const matchesText = !search || [project.title, project.creator, project.description, project.category, project.tool].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = category === 'All' || project.category === category;
      const matchesTool = tool === 'All' || project.tool === tool || project.tool === 'Both';
      return matchesText && matchesCategory && matchesTool;
    });
  }, [projects, query, category, tool, sort]);

  return (
    <section id="explore" className="explore-section shell" aria-labelledby="explore-title">
      <div className="section-top"><div><span className="eyebrow"><span className="eyebrow-dot" /> The collection</span><h2 id="explore-title">Explore the directory<span>.</span></h2><p>Discover what the community has been making.</p></div><div className="section-count"><strong>{String(projects.length).padStart(2, '0')}</strong><span>PROJECTS<br />AND COUNTING</span></div></div>
      <div className="toolbar">
        <label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search projects</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, creators..." /></label>
        <div className="tool-tabs" role="group" aria-label="Filter by tool">{['All', 'Hyperframes', 'Opus'].map((value) => <button key={value} type="button" className={tool === value ? 'active' : ''} onClick={() => setTool(value)} aria-pressed={tool === value}>{value}</button>)}</div>
      </div>
      <div className="filter-bottom">
        <div className="category-list" role="group" aria-label="Filter by category">
          {categoryOptions.map((value) => <button key={value} type="button" className={`category-pill${category === value ? ' active' : ''}`} onClick={() => setCategory(value)} aria-pressed={category === value}>{value}</button>)}
        </div>
        <label className="sort-control"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort projects"><option>Latest</option><option>Oldest</option><option>Featured</option></select><span aria-hidden="true">⌄</span></label>
      </div>
      {filtered.length > 0 ? (
        <div className="project-grid">{filtered.map((project, index) => <ProjectCard key={project.slug} project={project} index={index + 1} />)}</div>
      ) : (
        projects.length === 0 ? <div className="empty-state"><span className="empty-icon" aria-hidden="true">✳</span><span className="eyebrow">A blank canvas</span><h3>The first project could be yours.</h3><p>Share a project made with Hyperframes or Opus and start the directory.</p><Link className="button button-dark" href="/submit">Submit your project <span aria-hidden="true">↗</span></Link></div> :
        <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌕</span><h3>No projects match your search.</h3><p>Try another search or clear the filters to see everything.</p><button type="button" onClick={() => { setQuery(''); setCategory('All'); setTool('All'); setSort('Latest'); }}>Clear filters <span aria-hidden="true">↗</span></button></div>
      )}
      {filtered.length > 0 && <p className="result-count">Showing {filtered.length} of {projects.length} projects</p>}
    </section>
  );
}
