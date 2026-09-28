(() => {
  let saved;
  try { saved = localStorage.getItem('showcase-theme'); } catch { /* Use system preference. */ }
  const theme = saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111917' : '#f7f8f3');
})();
