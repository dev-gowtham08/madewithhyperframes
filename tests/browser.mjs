import { chromium } from '/home/gowtham/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.locator('.card').waitFor();
 await page.getByRole('button',{name:'Motion design',exact:true}).click();
 await page.getByText('No videos here yet.').waitFor();
 await page.getByRole('button',{name:/All videos/}).click();
 await page.getByRole('searchbox').fill('not-a-real-title');
 await page.getByText('No videos here yet.').waitFor();
 await page.getByRole('searchbox').fill('Website');
 assert.equal(await page.locator('.card').count(),1);
 await page.goto(base+'/showcase/website-to-video');
 await page.locator('video').waitFor();
 assert.match(await page.locator('video').getAttribute('src'),/static\.heygen\.ai\/.*\.mp4$/);
 assert.equal(await page.getByRole('link',{name:'Explore the source'}).getAttribute('href'),'https://github.com/heygen-com/hyperframes-launches/tree/main/website-to-hyperframes');
 await page.goto(base+'/submit');
 await page.getByLabel('Video title').fill('Browser test submission');
 await page.getByLabel('Your name').fill('Test Creator');
 await page.getByLabel('Email address').fill('test@example.com');
 await page.getByLabel('Video link').fill('https://www.hyperframes.dev/session/ea136626-42d0-4614-836f-c65ed60f4390');
 await page.getByLabel('About the video').fill('Automated browser test, not a public showcase.');
 await page.getByLabel('This video was made with HyperFrames.').check();
 await page.getByLabel('I own this work',{exact:false}).check();
 const pending=page.waitForResponse(r=>r.url().endsWith('/api/submissions')&&r.request().method()==='POST');
 await page.getByRole('button',{name:'Send for review'}).click();
 const result=await pending;assert.equal(result.status(),201);const submitted=await result.json();console.log('TEST_SUBMISSION_ID='+submitted.id);
 await page.getByText('You’re in the review queue.').waitFor();
 const published=await (await page.request.get(base+'/api/entries')).json();
 assert.ok(!published.some(e=>e.id===submitted.id));assert.ok(published.every(e=>!('email'in e)));
 await page.setViewportSize({width:375,height:812});
 for(const route of ['/','/submit','/about','/showcase/website-to-video']){
  await page.goto(base+route);await page.locator('h1').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow');
 }
 await page.goto(base);await page.locator('.card').waitFor();
 await page.screenshot({path:'/tmp/hyperframes-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: filters, search, official playback and source link, submission persistence/privacy, and four mobile routes.');
}finally{await browser.close();}
