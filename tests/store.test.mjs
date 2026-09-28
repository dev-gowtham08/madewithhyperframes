import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openStore, validate } from '../store.mjs';
const good={title:'Test film',creator:'Maker',email:'maker@example.com',description:'A test',video:'https://youtu.be/dQw4w9WgXcQ',product:'',category:'Experiment',tools:'HyperFrames',permission:true,hyperframes:true};
test('validates supported links and rejects unsafe inputs',()=>{assert.equal(validate(good).title,'Test film');for(const changes of [{video:'javascript:alert(1)'},{product:'http://example.com'},{email:'nope'},{permission:false},{hyperframes:false},{title:'a'.repeat(101)},{video:'https://example.com/not-video'}])assert.throws(()=>validate({...good,...changes}));});
test('pending entries stay private; approval persists on reopening',()=>{const dir=mkdtempSync(join(tmpdir(),'showcase-test-'));let db;try{db=openStore(dir);db.prepare('INSERT INTO entries (id,title,creator,email,description,video,category,tools) VALUES (?,?,?,?,?,?,?,?)').run('test','Title','Maker','private@example.com','Description',good.video,'Experiment','HyperFrames');assert.equal(db.prepare("SELECT count(*) AS n FROM entries WHERE status='approved'").get().n,1);db.prepare("UPDATE entries SET status='approved' WHERE id='test'").run();db.close();db=openStore(dir);assert.equal(db.prepare("SELECT count(*) AS n FROM entries WHERE status='approved'").get().n,2);}finally{db?.close();rmSync(dir,{recursive:true,force:true});}});
