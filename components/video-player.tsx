'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';
import type { Project } from '@/lib/projects';

type Playback = { kind: 'video' | 'embed' | 'hls'; src: string } | { kind: 'x-video'; id: string };

function CardOverlay({ title, href, duration }: { title: string; href: string; duration?: string }) {
  return <>
    <Link className="video-card-link" href={href} aria-label={`Watch ${title}`}><span className="card-watch">Watch video <span aria-hidden="true">↗</span></span></Link>
    {duration && <span className="video-duration" aria-label={`Duration ${duration}`}>{duration}</span>}
  </>;
}

function PlayableVideo({ project, src, kind, variant, href, onFailure }: { project: Project; src: string; kind: 'video' | 'hls'; variant: 'card' | 'detail'; href: string; onFailure: (src: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackIntent = useRef<boolean | null>(null);
  const syncPlayback = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(project.duration ?? '');
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let disposed = false;
    let initialized = false;
    let visible = false;
    let automaticPlay = false;
    let automaticPause = false;
    let player: Hls | undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    video.muted = true;

    function initialize() {
      if (initialized || disposed) return;
      initialized = true;
      if (kind === 'video') {
        video!.src = src;
        return;
      }
      void import('hls.js').then(({ default: Hls, FetchLoader }) => {
        if (disposed) return;
        if (Hls.isSupported()) {
          player = new Hls({
            autoStartLoad: false,
            capLevelToPlayerSize: true,
            maxBufferLength: variant === 'card' ? 10 : 30,
            maxMaxBufferLength: variant === 'card' ? 20 : 600,
            backBufferLength: variant === 'card' ? 10 : 30,
            loader: FetchLoader,
            // X rejects playlist requests that include this site's Referer.
            fetchSetup: (context, init) => new Request(context.url, { ...init, referrerPolicy: 'no-referrer' }),
          });
          player.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!player || disposed) return;
            // Start near the displayed resolution, then let bandwidth adaptation take over.
            const width = Math.min(variant === 'card' ? 1280 : 1920, video!.clientWidth * window.devicePixelRatio);
            const level = player.levels.findIndex((candidate) => candidate.width >= width);
            player.startLevel = level < 0 ? player.levels.length - 1 : level;
            sync();
          });
          player.on(Hls.Events.ERROR, (_, error) => {
            if (!disposed && error.fatal) onFailure(src);
          });
          player.loadSource(src);
          player.attachMedia(video!);
        } else if (video!.canPlayType('application/vnd.apple.mpegurl')) {
          video!.src = src;
          sync();
        } else {
          onFailure(src);
        }
      }).catch(() => {
        if (!disposed) onFailure(src);
      });
    }

    function sync() {
      if (disposed) return;
      if (visible && document.visibilityState === 'visible') initialize();
      const wantsPlayback = playbackIntent.current ?? !reducedMotion.matches;
      if (visible && document.visibilityState === 'visible' && wantsPlayback) {
        player?.startLoad();
        if (video!.paused) {
          automaticPlay = true;
          void video!.play().catch(() => { automaticPlay = false; });
        }
      } else {
        if (!video!.paused) {
          automaticPause = true;
          video!.pause();
        }
        player?.stopLoad();
      }
    }

    // A user's pause remains in effect when the card comes back into view.
    syncPlayback.current = sync;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.1;
      sync();
    }, { threshold: [0, 0.1] });
    observer.observe(video);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);

    const onNativePlay = () => {
      if (variant === 'detail' && !automaticPlay) {
        playbackIntent.current = true;
        player?.startLoad();
      }
      automaticPlay = false;
    };
    const onNativePause = () => {
      if (variant === 'detail' && !automaticPause) {
        playbackIntent.current = false;
        player?.stopLoad();
      }
      automaticPause = false;
    };
    video.addEventListener('play', onNativePlay);
    video.addEventListener('pause', onNativePause);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      video.removeEventListener('play', onNativePlay);
      video.removeEventListener('pause', onNativePause);
      syncPlayback.current = null;
      video.pause();
      player?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [src, kind, variant, onFailure]);

  function togglePreview() {
    playbackIntent.current = videoRef.current?.paused ?? true;
    syncPlayback.current?.();
  }

  return (
    <div className={`${variant === 'card' ? 'card-image' : 'detail-media'} video-surface is-playing${variant === 'detail' && isPortrait ? ' is-portrait' : ''}`}>
      <video ref={videoRef} className="video-element" poster={project.thumbnailUrl} controls={variant === 'detail'} muted loop={variant === 'card'} playsInline preload="metadata" aria-label={project.title} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onLoadedMetadata={(event) => {
        setIsPortrait(event.currentTarget.videoHeight > event.currentTarget.videoWidth);
        if (!project.duration && Number.isFinite(event.currentTarget.duration)) setDuration(formatDuration(event.currentTarget.duration));
      }} onError={() => onFailure(src)} />
      {variant === 'card' && <>
        <CardOverlay title={project.title} href={href} duration={duration} />
        <button type="button" className="preview-toggle" onClick={togglePreview} aria-label={`${isPlaying ? 'Pause' : 'Play'} preview of ${project.title}`} title={isPlaying ? 'Pause preview' : 'Play preview'}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{isPlaying ? <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></> : <path d="M8 5v14l11-7z" />}</svg>
        </button>
      </>}
    </div>
  );
}

function XVideoEmbed({ project, id, variant, href }: { project: Project; id: string; variant: 'card' | 'detail'; href: string }) {
  return (
    <div className={`${variant === 'card' ? 'card-image' : 'detail-media'} x-video-surface`}>
      <iframe className="video-frame" src={`https://twitter.com/i/videos/tweet/${id}`} title={`Play ${project.title} on X`} loading={variant === 'card' ? 'lazy' : 'eager'} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      {variant === 'card' && <Link className="x-video-details" href={href} aria-label={`Watch ${project.title}`}>Watch video <span aria-hidden="true">↗</span></Link>}
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
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : null;
    }
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
      const id = url.searchParams.get('v') ?? (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : '');
      return id ? { kind: 'embed', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` } : null;
    }
    if (url.hostname === 'vimeo.com' || url.hostname === 'www.vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? { kind: 'embed', src: `https://player.vimeo.com/video/${id}` } : null;
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

export function VideoPlayer({ project, variant, priority = false, href = `/projects/${project.slug}` }: { project: Project; variant: 'card' | 'detail'; priority?: boolean; href?: string }) {
  const playback = playbackFor(project.playbackUrl ?? project.videoUrl);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const onFailure = useCallback((src: string) => {
    setFailedSources((current) => current.includes(src) ? current : [...current, src]);
  }, []);
  const activePlayback = [playback, playbackFor(project.videoUrl)].find((source) => source && (source.kind === 'x-video' || !failedSources.includes(source.src)));
  const className = `${variant === 'card' ? 'card-image' : 'detail-media'} video-surface`;

  if (activePlayback?.kind === 'hls' || activePlayback?.kind === 'video') return <PlayableVideo key={activePlayback.src} project={project} src={activePlayback.src} kind={activePlayback.kind} variant={variant} href={href} onFailure={onFailure} />;
  if (activePlayback?.kind === 'x-video') return <XVideoEmbed project={project} id={activePlayback.id} variant={variant} href={href} />;

  if (activePlayback) {
    return (
      <div className={`${className} is-playing`}>
        <iframe className="video-frame" src={activePlayback.src} title={`Play ${project.title}`} loading={variant === 'card' ? 'lazy' : 'eager'} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        {variant === 'card' && <Link className="x-video-details" href={href} aria-label={`Watch ${project.title}`}>Watch video <span aria-hidden="true">↗</span></Link>}
      </div>
    );
  }

  return variant === 'card'
    ? <div className={className}><Poster project={project} priority={priority} /><CardOverlay title={project.title} href={href} duration={project.duration} /></div>
    : <div className={className}><a className="video-poster" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} on the original site (opens in a new tab)`}><Poster project={project} priority={priority} /><span className="media-play" aria-hidden="true"><i /></span><span className="media-caption">OPEN ORIGINAL PROJECT <span aria-hidden="true">↗</span></span></a></div>;
}
