import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();
const srcRoot = path.join(repo, 'src');
const publicRoot = path.join(repo, 'public');

function slugify(v) {
  return (v || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function toFs(web) {
  return path.join(publicRoot, web.replace(/^\//, ''));
}

const files = [];
(function walk(d){
  for (const n of fs.readdirSync(d)) {
    const full = path.join(d,n);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full);
    else if (/\.(astro|ts|js|json|md|css)$/i.test(n)) files.push(full);
  }
})(srcRoot);

const refs = new Set();
for (const f of files) {
  const txt = fs.readFileSync(f,'utf8');
  const m = txt.match(/\/assets\/[^"'`\n)]+/g) || [];
  m.forEach((x)=>refs.add(x));
}

const mapping = new Map();

const BAD_PLACEHOLDER = '/assets/projects/Books - Upcycling/thumbnail_ikea_temporary_store_duplicate.jpg';
const GOOD_PLACEHOLDER = '/assets/services/common/thumbnail_placeholder.jpg';
if (refs.has(BAD_PLACEHOLDER)) mapping.set(BAD_PLACEHOLDER, GOOD_PLACEHOLDER);

for (const web of refs) {
  if (!web.startsWith('/assets/')) continue;
  const parts = web.split('/'); // ['', 'assets', section, folder..., file]
  if (parts.length < 4) continue;
  const section = parts[2];
  if (!['projects','reels','services'].includes(section)) continue;

  if (section === 'services') {
    // keep /assets/services/common/... as-is, slugify any unexpected intermediate segments
    if (parts.length > 4) {
      const fixed = ['','assets','services', ...parts.slice(3,-1).map(slugify), parts.at(-1)].join('/');
      if (fixed !== web) mapping.set(web, fixed);
    }
    continue;
  }

  if (parts.length >= 5) {
    const folder = parts[3];
    const file = parts.at(-1);
    const fixed = ['', 'assets', section, slugify(folder), file].join('/');
    if (fixed !== web) mapping.set(web, fixed);
  }
}

// move/copy files for mapped paths
for (const [oldWeb,newWeb] of mapping.entries()) {
  const oldFs = toFs(oldWeb);
  const newFs = toFs(newWeb);
  if (fs.existsSync(oldFs)) {
    fs.mkdirSync(path.dirname(newFs), {recursive:true});
    if (!fs.existsSync(newFs)) fs.copyFileSync(oldFs,newFs);
  }
}

// ensure placeholder target exists
const placeholderFs = toFs(GOOD_PLACEHOLDER);
if (!fs.existsSync(placeholderFs)) {
  const src = toFs(BAD_PLACEHOLDER);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(placeholderFs), {recursive:true});
    fs.copyFileSync(src, placeholderFs);
  }
}

// relink
for (const f of files) {
  let txt = fs.readFileSync(f,'utf8');
  let changed = false;
  for (const [oldWeb,newWeb] of mapping.entries()) {
    if (txt.includes(oldWeb)) {
      txt = txt.split(oldWeb).join(newWeb);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(f,txt);
}

// verify
const missing = [];
for (const f of files) {
  const txt = fs.readFileSync(f,'utf8');
  const m = txt.match(/\/assets\/[^"'`\n)]+/g) || [];
  for (const web of m) {
    const fsPath = toFs(web);
    if (!fs.existsSync(fsPath)) missing.push({file:path.relative(repo,f), web});
  }
}

console.log(JSON.stringify({
  mappings: mapping.size,
  missing: missing.length,
  sampleMissing: missing.slice(0,40)
}, null, 2));
