'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';
import { registerCardPreview, toggleCardPreview } from '@/lib/card-previews';
import type { Project } from '@/lib/projects';

type Playback = { kind: 'video' | 'embed' | 'hls'; src: string } | { kind: 'x-video'; id: string };

function CardOverlay({ title, href, duration }: { title: string; href: string; duration?: string }) {
  return <>
    <Link className="video-card-link" href={href} aria-label={`Watch ${title}`}><span className="card-watch">Watch video <span aria-hidden="true">↗</span></span></Link>
    {duration && <span className="video-duration" aria-label={`Duration ${duration}`}>{duration}</span>}
  </>;
}

function PlayableVideo({ project, src, kind, variant, onFailure, onDuration }: { project: Project; src: string; kind: 'video' | 'hls'; variant: 'card' | 'detail'; onFailure: (src: string) => void; onDuration?: (duration: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackIntent = useRef<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
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
    const sourceRequest = new AbortController();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    video.muted = true;

    function initialize() {
      if (initialized || disposed) return;
      initialized = true;
      if (kind === 'video') {
        if (src.startsWith('/api/video-source?')) {
          void fetch(`${src}&format=json`, { signal: sourceRequest.signal, cache: 'no-store' })
            .then(async (response) => {
              if (!response.ok) throw new Error('Video source unavailable');
              const result = await response.json() as { url?: string | null };
              if (disposed) return;
              if (!result.url) { onFailure(src); return; }
              video!.src = result.url;
              sync();
            })
            .catch(() => { if (!disposed) onFailure(src); });
        } else {
          video!.src = src;
        }
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
      // A card mounts its video only while it previews. On the detail page, a viewer's pause
      // remains in effect when the video comes back into view.
      const wantsPlayback = variant === 'card' || (playbackIntent.current ?? !reducedMotion.matches);
      if (visible && document.visibilityState === 'visible' && wantsPlayback) {
        player?.startLoad();
        if (video!.paused && video!.getAttribute('src')) {
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
      sourceRequest.abort();
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reducedMotion.removeEventListener('change', sync);
      video.removeEventListener('play', onNativePlay);
      video.removeEventListener('pause', onNativePause);
      video.pause();
      player?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [src, kind, variant, onFailure]);

  const video = <video ref={videoRef} className={`video-element${isReady ? ' is-ready' : ''}`} poster={variant === 'detail' ? project.thumbnailUrl : undefined} controls={variant === 'detail'} muted loop={variant === 'card'} playsInline preload="metadata" aria-label={project.title} onPlaying={() => setIsReady(true)} onLoadedMetadata={(event) => {
    setIsPortrait(event.currentTarget.videoHeight > event.currentTarget.videoWidth);
    if (!project.duration && Number.isFinite(event.currentTarget.duration)) onDuration?.(formatDuration(event.currentTarget.duration));
  }} onError={() => onFailure(src)} />;

  // A card supplies its own surface, poster, and controls around the video.
  return variant === 'card' ? video : <div className={`detail-media video-surface is-playing${isPortrait ? ' is-portrait' : ''}`}>{video}</div>;
}

// Cards show their thumbnail and create a video only while previewing, so a card that is not
// previewing downloads nothing. lib/card-previews decides which single card previews.
function CardPreview({ project, src, kind, href, onFailure }: { project: Project; src: string; kind: 'video' | 'hls'; href: string; onFailure: (src: string) => void }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [duration, setDuration] = useState(project.duration ?? '');

  useEffect(() => registerCardPreview(surfaceRef.current!, setIsPreviewing), []);

  return (
    <div ref={surfaceRef} className="card-image video-surface is-playing">
      <Poster project={project} />
      {isPreviewing && <PlayableVideo project={project} src={src} kind={kind} variant="card" onFailure={onFailure} onDuration={setDuration} />}
      <CardOverlay title={project.title} href={href} duration={duration} />
      <button type="button" className="preview-toggle" onClick={() => toggleCardPreview(surfaceRef.current!)} aria-label={`${isPreviewing ? 'Pause' : 'Play'} preview of ${project.title}`} title={isPreviewing ? 'Pause preview' : 'Play preview'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{isPreviewing ? <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></> : <path d="M8 5v14l11-7z" />}</svg>
      </button>
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
  if (/^\/videos\/[a-z0-9/_-]+\.(mp4|webm|ogg)$/i.test(value)) return { kind: 'video', src: value };
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
    ? <Image src={project.thumbnailUrl} alt={`Video preview for ${project.title}`} fill loading={priority ? 'eager' : 'lazy'} unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" />
    : <span className="thumbnail-fallback"><span className="fallback-top">VIDEO / MADE WITH {project.stack.join(' + ').toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>;
}

export function VideoPlayer({ project, variant, priority = false, href = `/projects/${project.slug}` }: { project: Project; variant: 'card' | 'detail'; priority?: boolean; href?: string }) {
  const playback = playbackFor(project.playbackUrl ?? project.videoUrl);
  const [failedSources, setFailedSources] = useState<string[]>([]);
  const onFailure = useCallback((src: string) => {
    setFailedSources((current) => current.includes(src) ? current : [...current, src]);
  }, []);
  const activePlayback = [playback, playbackFor(project.videoUrl)].find((source) => source && (source.kind === 'x-video' || !failedSources.includes(source.src)));
  const className = `${variant === 'card' ? 'card-image' : 'detail-media'} video-surface`;

  if (activePlayback?.kind === 'hls' || activePlayback?.kind === 'video') return variant === 'card'
    ? <CardPreview key={activePlayback.src} project={project} src={activePlayback.src} kind={activePlayback.kind} href={href} onFailure={onFailure} />
    : <PlayableVideo key={activePlayback.src} project={project} src={activePlayback.src} kind={activePlayback.kind} variant="detail" onFailure={onFailure} />;
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
    ? <div className={className}><Poster project={project} priority={priority || failedSources.length > 0} />{failedSources.length > 0 && <span className="video-unavailable">Preview unavailable</span>}<CardOverlay title={project.title} href={href} duration={project.duration} /></div>
    : <div className={className}><a className="video-poster" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} on the original site (opens in a new tab)`}><Poster project={project} priority={priority} />{failedSources.length > 0 ? <span className="video-unavailable detail-unavailable">Video preview unavailable. Open the original project <span aria-hidden="true">↗</span></span> : <><span className="media-play" aria-hidden="true"><i /></span><span className="media-caption">OPEN ORIGINAL PROJECT <span aria-hidden="true">↗</span></span></>}</a></div>;
}
