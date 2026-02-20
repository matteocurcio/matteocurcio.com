import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const MIGRATED = path.join(ROOT, 'public', 'migrated');
const SRC = path.join(ROOT, 'src');
const FALLBACK_IMAGE = '/migrated/wp-content/uploads/borouge_day2_1000.jpg';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function isLikelyHtml(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(256);
  const n = fs.readSync(fd, buf, 0, 256, 0);
  fs.closeSync(fd);
  const s = buf.slice(0, n).toString('utf8').toLowerCase();
  return s.includes('<!doctype html') || s.includes('<html');
}

const allMigrated = fs.existsSync(MIGRATED) ? walk(MIGRATED) : [];
const invalid = [];
for (const file of allMigrated) {
  try {
    if (isLikelyHtml(file)) {
      const rel = '/' + path.relative(path.join(ROOT, 'public'), file).replace(/\\/g, '/');
      invalid.push(rel);
    }
  } catch {}
}

const textFiles = walk(SRC).filter((f) => /\.(md|mdx|astro|ts|tsx|js|jsx|json)$/i.test(f));
let replaced = 0;
for (const file of textFiles) {
  let txt = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const bad of invalid) {
    if (txt.includes(bad)) {
      txt = txt.split(bad).join(FALLBACK_IMAGE);
      replaced++;
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, txt);
}

fs.writeFileSync(path.join(ROOT, 'research', 'invalid-migrated-assets.json'), JSON.stringify({ invalidCount: invalid.length, replaced, invalid }, null, 2));
console.log(JSON.stringify({ invalidCount: invalid.length, replaced }, null, 2));
