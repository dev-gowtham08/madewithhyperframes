import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { openStore, validate } from './store.mjs';
import { publicEntries } from './curated.mjs';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const db = openStore();
const attempts = new Map();
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.png':'image/png'};
const send = (res, status, data) => { res.writeHead(status, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)); };
const server = http.createServer(async (req,res) => {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://static.heygen.ai; media-src 'self' https:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/config') return send(res,200,{submissionsEnabled:true});
    if (req.method === 'GET' && url.pathname === '/api/entries') {
      res.setHeader('Cache-Control','no-store');
      return send(res,200,publicEntries(db));
    }
    if (req.method === 'POST' && url.pathname === '/api/submissions') {
      if (req.headers.origin) {
        let origin; try { origin = new URL(req.headers.origin); } catch { return send(res,403,{error:'Invalid origin.'}); }
        if (origin.host !== req.headers.host) return send(res,403,{error:'Invalid origin.'});
      }
      if (!(req.headers['content-type'] || '').includes('application/json')) return send(res,415,{error:'JSON required.'});
      const now=Date.now(), ip=req.socket.remoteAddress;
      for (const [key,value] of attempts) if(now-value.start>3600000) attempts.delete(key);
      const count=attempts.get(ip)||{start:now,count:0};
      if(count.count>=10) return send(res,429,{error:'Too many submissions. Please try again in an hour.'});
      count.count++; attempts.set(ip,count);
      let body='';
      for await (const chunk of req) { body+=chunk; if(Buffer.byteLength(body)>12000) return send(res,413,{error:'Submission too large.'}); }
      let input; try { input=JSON.parse(body); } catch { return send(res,400,{error:'Invalid submission.'}); }
      if (!input || typeof input !== 'object' || Array.isArray(input)) return send(res,400,{error:'Invalid submission.'});
      let entry; try { entry=validate(input); } catch(e) { return send(res,400,{error:e.message}); }
      const id=randomUUID();
      db.prepare('INSERT INTO entries (id,title,creator,email,description,video,product,category,tools) VALUES (?,?,?,?,?,?,?,?,?)').run(id,...['title','creator','email','description','video','product','category','tools'].map(key=>entry[key]));
      return send(res,201,{id,message:'Your video is in the review queue. Thanks for sharing your work!'});
    }
    if(url.pathname.startsWith('/api/')) return send(res,404,{error:'Not found.'});
    if(!['GET','HEAD'].includes(req.method)) return send(res,405,{error:'Method not allowed.'});
    const route=url.pathname==='/' || /^\/(showcase\/[^/]+|submit|about)\/?$/.test(url.pathname);
    const path=resolve(root,route?'index.html':'.'+decodeURIComponent(url.pathname));
    if(!path.startsWith(root.endsWith(sep)?root:root+sep)) return send(res,403,{error:'Forbidden.'});
    let info; try {info=await stat(path);} catch {return send(res,404,{error:'Not found.'});}
    if(!info.isFile()) return send(res,404,{error:'Not found.'});
    const headers={'Content-Type':mime[extname(path)]||'application/octet-stream','Accept-Ranges':'bytes'};
    let start=0,end=info.size-1,status=200;
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match || (!match[1]&&!match[2])) {res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));
      end=match[1]&&match[2]?Math.min(Number(match[2]),end):end;
      if(start>end || start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});return res.end();}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length']=end-start+1;res.writeHead(status,headers);
    if(req.method==='HEAD') return res.end();
    const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
  } catch(e) { console.error(e); if(!res.headersSent) send(res,500,{error:'Something went wrong. Please try again.'}); else res.destroy(); }
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log(`Made with HyperFrames: http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||3000}`));
