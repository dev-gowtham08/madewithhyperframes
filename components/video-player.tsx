'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Project } from '@/lib/projects';

type Playback = { kind: 'video' | 'embed' | 'hls'; src: string } | { kind: 'x-video'; id: string };

function HlsVideo({ project, src, variant, onFailure }: { project: Project; src: string; variant: 'card' | 'detail'; onFailure: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let disposed = false;
    let destroyPlayer: (() => void) | undefined;
    const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    video.muted = true;
    video.autoplay = autoplay;

    void import('hls.js').then(({ default: Hls, FetchLoader }) => {
      if (disposed) return;
      if (Hls.isSupported()) {
        const player = new Hls({
          capLevelToPlayerSize: true,
          loader: FetchLoader,
          // X rejects playlist requests that include this site's Referer.
          fetchSetup: (context, init) => new Request(context.url, { ...init, referrerPolicy: 'no-referrer' }),
        });
        destroyPlayer = () => player.destroy();
        player.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoplay) void video.play().catch(() => {});
        });
        player.on(Hls.Events.ERROR, (_, error) => {
          if (error.fatal) onFailure(src);
        });
        player.loadSource(src);
        player.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        if (autoplay) void video.play().catch(() => {});
      } else {
        onFailure(src);
      }
    }).catch(() => {
      if (!disposed) onFailure(src);
    });

    return () => {
      disposed = true;
      destroyPlayer?.();
    };
  }, [src, onFailure]);

  return (
    <div className={`${variant === 'card' ? 'card-image' : 'detail-media'} video-surface is-playing`}>
      <video ref={videoRef} className="video-element" poster={project.thumbnailUrl} controls={variant === 'detail'} muted loop={variant === 'card'} playsInline preload="metadata" aria-label={`Playing ${project.title}`} onError={() => onFailure(src)} />
      {variant === 'card' && <>
        {project.duration && <span className="video-duration" aria-label={`Duration ${project.duration}`}>{project.duration}</span>}
        <span className="card-media-mark" aria-hidden="true">▶</span>
        <Link className="video-card-link" href={`/projects/${project.slug}`} aria-label={`Open ${project.title} details`} />
      </>}
    </div>
  );
}

function XVideoEmbed({ project, id, variant }: { project: Project; id: string; variant: 'card' | 'detail' }) {
  return (
    <div className={`${variant === 'card' ? 'card-image' : 'detail-media'} x-video-surface`}>
      <iframe className="video-frame" src={`https://twitter.com/i/videos/tweet/${id}`} title={`Play ${project.title} on X`} loading={variant === 'card' ? 'lazy' : 'eager'} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      {variant === 'card' && <Link className="x-video-details" href={`/projects/${project.slug}`} aria-label={`Open details for ${project.title}`}>Details <span aria-hidden="true">↗</span></Link>}
    </div>
  );
}

function playbackFor(value: string): Playback | null {
  try {
    const url = new URL(value);
    if (/\.(mp4|webm|ogg|mov)$/i.test(url.pathname)) return { kind: 'video', src: url.toString() };
    if (/\.m3u8$/i.test(url.pathname)) return { kind: 'hls', src: url.toString() };

    if (url.hostname === 'x.com' || url.hostname === 'www.x.com' || url.hostname === 'twitter.com' || url.hostname === 'www.twitter.com') {
      const match = url.pathname.match(/^\/[A-Za-z0-9_]+\/status\/(\d+)(?:\/video\/\d+)?\/?$/);
      return match ? { kind: 'x-video', id: match[1] } : null;
    }

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0` } : null;
    }
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const id = url.searchParams.get('v') ?? (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : '');
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&rel=0` } : null;
    }
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? { kind: 'embed', src: `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1` } : null;
    }
    if ((url.hostname === 'hyperframes.dev' || url.hostname === 'www.hyperframes.dev') && url.pathname.startsWith('/session/')) {
      return { kind: 'video', src: `/api/video-source?url=${encodeURIComponent(url.toString())}` };
    }
  } catch {
    return null;
  }
  return null;
}

function formatDuration(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainder = String(rounded % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function Poster({ project, priority = false }: { project: Project; priority?: boolean }) {
  return project.thumbnailUrl
    ? <Image src={project.thumbnailUrl} alt={`Video preview for ${project.title}`} fill priority={priority} unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" />
    : <span className="thumbnail-fallback"><span className="fallback-top">VIDEO / MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>;
}

export function VideoPlayer({ project, variant, priority = false }: { project: Project; variant: 'card' | 'detail'; priority?: boolean }) {
  const playback = playbackFor(project.playbackUrl ?? project.videoUrl);
  const [duration, setDuration] = useState(project.duration ?? '');
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const activePlayback = playback && playback.kind !== 'x-video' && playback.src === failedSrc
    ? (project.playbackUrl ? playbackFor(project.videoUrl) : null)
    : playback;
  const className = `${variant === 'card' ? 'card-image' : 'detail-media'} video-surface${variant === 'detail' && isPortrait ? ' is-portrait' : ''}`;

  if (activePlayback?.kind === 'hls') return <HlsVideo project={project} src={activePlayback.src} variant={variant} onFailure={setFailedSrc} />;
  if (activePlayback?.kind === 'x-video') return <XVideoEmbed project={project} id={activePlayback.id} variant={variant} />;

  if (activePlayback) {
    return (
      <div className={`${className} is-playing`}>
        {activePlayback.kind === 'video'
          ? <video className="video-element" src={activePlayback.src} poster={project.thumbnailUrl} controls={variant === 'detail'} autoPlay muted loop={variant === 'card'} playsInline preload={variant === 'card' ? 'metadata' : 'auto'} aria-label={`Playing ${project.title}`} onLoadedMetadata={(event) => {
            if (variant === 'detail') setIsPortrait(event.currentTarget.videoHeight > event.currentTarget.videoWidth);
            if (!project.duration && Number.isFinite(event.currentTarget.duration)) {
              setDuration(formatDuration(event.currentTarget.duration));
            }
          }} onError={() => setFailedSrc(activePlayback.src)} />
          : <iframe className="video-frame" src={activePlayback.src} title={`Playing ${project.title}`} loading={variant === 'card' ? 'lazy' : 'eager'} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
        {variant === 'card' && duration && <span className="video-duration" aria-label={`Duration ${duration}`}>{duration}</span>}
        {variant === 'card' && <><span className="card-media-mark" aria-hidden="true">▶</span><Link className="video-card-link" href={`/projects/${project.slug}`} aria-label={`Open ${project.title} details`} /></>}
      </div>
    );
  }

  const content = <><Poster project={project} priority={priority} />{variant === 'card' ? <><span className="card-media-mark" aria-hidden="true">▶</span><span className="card-hover-link" aria-hidden="true"><i /><b>View project</b></span></> : <><span className="media-play" aria-hidden="true"><i /></span><span className="media-caption">OPEN ORIGINAL PROJECT <span aria-hidden="true">↗</span></span></>}</>;

  return variant === 'card'
    ? <div className={className}><Link className="video-poster" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>{content}</Link></div>
    : <div className={className}><a className="video-poster" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} on the original site (opens in a new tab)`}>{content}</a></div>;
}
