'use client';

import ReactDOM from 'react-dom';
import { useEffect } from 'react';

declare global {
  interface Window {
    Tally?: { loadEmbeds?: () => void };
  }
}

export function TallyPreconnect() {
  ReactDOM.preconnect('https://tally.so');
  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      window.Tally?.loadEmbeds?.();
      attempts += 1;
      if (window.Tally?.loadEmbeds || attempts >= 30) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
