'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Project } from '@/lib/projects';
import { ProjectCard } from './project-card';

export function DirectoryGrid({ projects, categories }: { projects: Project[]; categories: string[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const category = categories.includes(searchParams.get('category') ?? '') ? searchParams.get('category')! : 'All';
  const tool = ['Hyperframes', 'Opus'].includes(searchParams.get('tool') ?? '') ? searchParams.get('tool')! : 'All';
  const categoryOptions = ['All', ...categories];
  const categoryCounts = useMemo(() => new Map(categories.map((value) => [value, projects.filter((project) => project.category === value).length])), [categories, projects]);
  const hasFeatured = projects.some((project) => project.featured);
  const sort = searchParams.get('sort') === 'Oldest' ? 'Oldest' : searchParams.get('sort') === 'Featured' && hasFeatured ? 'Featured' : 'Latest';
  const hasActiveFilters = category !== 'All' || tool !== 'All' || query.length > 0;
  const directoryParams = new URLSearchParams();
  if (query) directoryParams.set('q', query);
  if (category !== 'All') directoryParams.set('category', category);
  if (tool !== 'All') directoryParams.set('tool', tool);
  if (sort !== 'Latest') directoryParams.set('sort', sort);
  const directoryQuery = directoryParams.toString();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(window.location.search);
    if (!value || value === 'All' || (key === 'sort' && value === 'Latest')) params.delete(key);
    else params.set(key, value);
    const next = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`);
  }

  function clearFilters() {
    window.history.replaceState(null, '', `/${window.location.hash}`);
  }
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const ordered = [...projects].sort((a, b) => {
      const first = Date.parse(a.submittedAt ?? '') || 0;
      const second = Date.parse(b.submittedAt ?? '') || 0;
      if (sort === 'Featured') return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || second - first;
      return sort === 'Latest' ? second - first : first - second;
    });
    return ordered.filter((project) => {
      const matchesText = !search || [project.title, project.creator, project.prompt, project.category, project.tool].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = category === 'All' || project.category === category;
      const matchesTool = tool === 'All' || project.tool === tool || project.tool === 'Both';
      return matchesText && matchesCategory && matchesTool;
    });
  }, [projects, query, category, tool, sort]);

  return (
    <section id="explore" className="explore-section shell" aria-labelledby="explore-title">
      <h2 className="sr-only" id="explore-title">Video directory</h2>
      <div className="toolbar">
        <label className="search-field"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 5 5"/></svg><span className="sr-only">Search videos, creators, prompts, and categories</span><input type="search" value={query} onChange={(event) => updateFilter('q', event.target.value)} placeholder="Search videos, creators, prompts..." /></label>
        <div className="tool-tabs" role="group" aria-label="Filter videos by tool">{['All', 'Hyperframes', 'Opus'].map((value) => <button key={value} type="button" className={tool === value ? 'active' : ''} onClick={() => updateFilter('tool', value)} aria-pressed={tool === value}>{value === 'All' ? 'All tools' : value}</button>)}</div>
        <label className="sort-control"><span>Sort</span><select value={sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Sort videos"><option>Latest</option><option>Oldest</option>{hasFeatured && <option>Featured</option>}</select><span aria-hidden="true">⌄</span></label>
      </div>
      <div className="filter-bottom">
        <div className="category-list" role="group" aria-label="Filter by category">
          {categoryOptions.map((value) => <button key={value} type="button" className={`category-pill${category === value ? ' active' : ''}`} onClick={() => updateFilter('category', value)} aria-pressed={category === value}><span>{value === 'All' ? 'All videos' : value}</span><small>{value === 'All' ? projects.length : categoryCounts.get(value)}</small></button>)}
        </div>
        <label className="mobile-category"><span>Category</span><select value={category} onChange={(event) => updateFilter('category', event.target.value)}>{categoryOptions.map((value) => <option key={value} value={value}>{value === 'All' ? 'All videos' : value} ({value === 'All' ? projects.length : categoryCounts.get(value)})</option>)}</select></label>
        <div className="directory-results"><p role="status">{filtered.length} {filtered.length === 1 ? 'video' : 'videos'}{hasActiveFilters ? ` of ${projects.length}` : ''}</p>{hasActiveFilters && <button type="button" onClick={clearFilters}>Clear filters <span aria-hidden="true">×</span></button>}</div>
      </div>
      {filtered.length > 0 ? (
        <div className={`project-grid${filtered.length <= 6 ? ' project-grid-small' : ''}`}>{filtered.map((project) => <ProjectCard key={project.slug} project={project} directoryQuery={directoryQuery} />)}</div>
      ) : (
        projects.length === 0 ? <div className="empty-state"><span className="empty-icon" aria-hidden="true">▶</span><span className="eyebrow">The collection starts here</span><h3>No videos in the directory yet.</h3><p>The collection is being curated.</p></div> :
        <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌕</span><h3>No videos match your selection.</h3><p>Try another search or clear the filters to see all videos.</p><button type="button" onClick={clearFilters}>Clear filters <span aria-hidden="true">↗</span></button></div>
      )}
    </section>
  );
}
