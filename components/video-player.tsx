'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Project } from '@/lib/projects';

type Playback = { kind: 'video' | 'embed'; src: string };

function playbackFor(value: string): Playback | null {
  try {
    const url = new URL(value);
    if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname)) return { kind: 'video', src: url.toString() };

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` } : null;
    }
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const id = url.searchParams.get('v') ?? (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : '');
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` } : null;
    }
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? { kind: 'embed', src: `https://player.vimeo.com/video/${id}?autoplay=1` } : null;
    }
    if ((url.hostname === 'hyperframes.dev' || url.hostname === 'www.hyperframes.dev') && url.pathname.startsWith('/session/')) {
      return { kind: 'embed', src: url.toString() };
    }
  } catch {
    return null;
  }
  return null;
}

function Poster({ project, priority = false }: { project: Project; priority?: boolean }) {
  return project.thumbnailUrl
    ? <Image src={project.thumbnailUrl} alt={`Video preview for ${project.title}`} fill priority={priority} unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" />
    : <span className="thumbnail-fallback"><span className="fallback-top">VIDEO / MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>;
}

export function VideoPlayer({ project, variant, index, priority = false }: { project: Project; variant: 'card' | 'detail'; index?: number; priority?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const playback = playbackFor(project.videoUrl);
  const className = `${variant === 'card' ? 'card-image' : 'detail-media'} video-surface`;

  if (playing && playback) {
    return (
      <div className={`${className} is-playing`}>
        {playback.kind === 'video'
          ? <video className="video-element" src={playback.src} controls autoPlay playsInline preload="metadata" />
          : <iframe className="video-frame" src={playback.src} title={`Playing ${project.title}`} loading="eager" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        <button className="video-close" type="button" onClick={() => setPlaying(false)} aria-label={`Close ${project.title} player`}>×</button>
      </div>
    );
  }

  const content = <><Poster project={project} priority={priority} />{variant === 'card' ? <><span className="card-number">{String(index ?? 1).padStart(2, '0')}</span><span className="card-hover-link" aria-hidden="true"><i /><b>{playback ? 'Play video' : 'View project'}</b></span></> : <><span className="media-play" aria-hidden="true"><i /></span><span className="media-caption">{playback ? 'PLAY VIDEO' : 'OPEN ORIGINAL PROJECT'} <span aria-hidden="true">↗</span></span></>}</>;

  if (playback) {
    return <div className={className}><button className="video-poster" type="button" onClick={() => setPlaying(true)} aria-label={`Play ${project.title}`}>{content}</button></div>;
  }

  return variant === 'card'
    ? <div className={className}><Link className="video-poster" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>{content}</Link></div>
    : <div className={className}><a className="video-poster" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} on the original site (opens in a new tab)`}>{content}</a></div>;
}
