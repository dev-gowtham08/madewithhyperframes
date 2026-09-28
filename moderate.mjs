import { openStore } from './store.mjs';
const db=openStore();
const [action,id]=process.argv.slice(2);
if(action==='list') console.table(db.prepare("SELECT id,title,creator,email,video,status FROM entries WHERE status='pending'").all());
else if(['approve','reject'].includes(action)&&id){
 const result=db.prepare("UPDATE entries SET status=? WHERE id=? AND status='pending'").run(action==='approve'?'approved':'rejected',id);
 console.log(result.changes?'Submission updated.':'Pending submission not found.');
} else {console.error('Usage: node moderate.mjs list | approve <id> | reject <id>');process.exitCode=1;}
db.close();
