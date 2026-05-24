import fs from 'fs';

const app = fs.readFileSync('src/App.tsx', 'utf-8');
const t1 = fs.readFileSync('target1.txt', 'utf-8');
const r1 = fs.readFileSync('repl1.txt', 'utf-8');
const t2 = fs.readFileSync('target2.txt', 'utf-8');
const r2 = fs.readFileSync('repl2.txt', 'utf-8');
const t3 = fs.readFileSync('target3.txt', 'utf-8');
const r3 = fs.readFileSync('repl3.txt', 'utf-8');

let content = app.replace(t1, r1);
content = content.replace(t2, r2);
content = content.replace(t3, r3);

fs.writeFileSync('src/App.tsx', content);

console.log('Done!');
