// Plays at most one card preview at a time, so browsing the directory never streams several
// videos at once. With a mouse, the hovered card previews. On touch screens, the card nearest
// the middle of the screen previews once scrolling pauses. A card's play button overrides both,
// and its pause button keeps that card still.

type PreviewCard = { element: HTMLElement; setActive: (active: boolean) => void; userPaused: boolean };

const cards = new Map<HTMLElement, PreviewCard>();
let activeCard: PreviewCard | undefined;
let startedByUser = false;
let hoverQuery: MediaQueryList | undefined;
let reducedMotionQuery: MediaQueryList | undefined;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;
let settleTimer: ReturnType<typeof setTimeout> | undefined;

function activate(card: PreviewCard | undefined, byUser = false) {
  if (card === activeCard) return;
  activeCard?.setActive(false);
  activeCard = card;
  startedByUser = byUser;
  card?.setActive(true);
}

// Share of the card inside the viewport, from 0 (off screen) to 1 (fully visible).
function visibleShare(rect: DOMRect) {
  const width = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
  const height = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return width > 0 && height > 0 ? Math.min(width / rect.width, height / rect.height) : 0;
}

function settle() {
  if (activeCard && visibleShare(activeCard.element.getBoundingClientRect()) < 0.2) activate(undefined);
  if (hoverQuery?.matches || reducedMotionQuery?.matches || (activeCard && startedByUser)) return;
  let nearest: PreviewCard | undefined;
  let nearestDistance = Infinity;
  for (const card of cards.values()) {
    const rect = card.element.getBoundingClientRect();
    if (visibleShare(rect) < 0.6) continue;
    const distance = Math.hypot(rect.left + rect.width / 2 - window.innerWidth / 2, rect.top + rect.height / 2 - window.innerHeight / 2);
    if (distance < nearestDistance) {
      nearest = card;
      nearestDistance = distance;
    }
  }
  activate(nearest?.userPaused ? undefined : nearest);
}

function scheduleSettle() {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(settle, 250);
}

function resetPreviews() {
  activate(undefined);
  scheduleSettle();
}

function listen() {
  hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  hoverQuery.addEventListener('change', resetPreviews);
  reducedMotionQuery.addEventListener('change', resetPreviews);
  window.addEventListener('scroll', scheduleSettle, { passive: true });
  window.addEventListener('resize', scheduleSettle);
}

function unlisten() {
  hoverQuery?.removeEventListener('change', resetPreviews);
  reducedMotionQuery?.removeEventListener('change', resetPreviews);
  window.removeEventListener('scroll', scheduleSettle);
  window.removeEventListener('resize', scheduleSettle);
  clearTimeout(hoverTimer);
  clearTimeout(settleTimer);
}

export function registerCardPreview(element: HTMLElement, setActive: (active: boolean) => void) {
  const card: PreviewCard = { element, setActive, userPaused: false };
  function onPointerEnter(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || !hoverQuery?.matches || reducedMotionQuery?.matches || card.userPaused) return;
    clearTimeout(hoverTimer);
    // The delay keeps cards the pointer only passes over from starting a download.
    hoverTimer = setTimeout(() => { if (cards.get(element) === card && !card.userPaused) activate(card); }, 150);
  }
  function onPointerLeave(event: PointerEvent) {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(hoverTimer);
    if (activeCard === card && !startedByUser) activate(undefined);
  }

  if (cards.size === 0) listen();
  cards.set(element, card);
  element.addEventListener('pointerenter', onPointerEnter);
  element.addEventListener('pointerleave', onPointerLeave);
  scheduleSettle();
  return () => {
    element.removeEventListener('pointerenter', onPointerEnter);
    element.removeEventListener('pointerleave', onPointerLeave);
    cards.delete(element);
    if (activeCard === card) activeCard = undefined;
    if (cards.size === 0) unlisten();
  };
}

export function toggleCardPreview(element: HTMLElement) {
  const card = cards.get(element);
  if (!card) return;
  if (activeCard === card) {
    card.userPaused = true;
    activate(undefined);
  } else {
    card.userPaused = false;
    activate(card, true);
  }
}
