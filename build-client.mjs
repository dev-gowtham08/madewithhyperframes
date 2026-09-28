import { build, context } from 'esbuild';

const options = { entryPoints: ['src/app.jsx'], outfile: 'public/app.js', bundle: true, minify: true, target: 'es2022', platform: 'browser' };
if (process.argv.includes('--watch')) {
  const ctx = await context(options);
  await ctx.watch();
  await import('./server.mjs');
  console.log('Watching React source.');
} else {
  await build(options);
  console.log('Built React client.');
}
