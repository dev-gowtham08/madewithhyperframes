'use client';

import { useState } from 'react';

export function CopyPromptButton({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return (
    <button className="prompt-copy" type="button" onClick={copyText}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
      <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'error' ? 'Try again' : label}</span>
    </button>
  );
}
