import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DEST_ROOT = path.join(PUBLIC_DIR, 'migrated');

const TEXT_EXTS = new Set(['.md', '.mdx', '.astro', '.ts', '.tsx', '.js', '.jsx', '.json']);
const URL_RE = /https?:\/\/matteocurcio\.com\/[^\s"'`<>\])]+/g;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function isTextFile(file) {
  return TEXT_EXTS.has(path.extname(file).toLowerCase());
}

function normalizeAssetPath(url) {
  try {
    const u = new URL(url);
    let p = u.pathname;
    if (p.startsWith('/wp/wp-content/uploads/')) p = p.replace('/wp/wp-content/uploads/', '/wp-content/uploads/');
    return p;
  } catch {
    return null;
  }
}

async function fetchWithRetry(url, retries = 2) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return buf;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

const files = walk(SRC_DIR).filter(isTextFile);
const allText = files.map((f) => fs.readFileSync(f, 'utf8'));
const urls = new Set();
for (const t of allText) {
  for (const m of t.matchAll(URL_RE)) {
    const url = m[0];
    if (url.includes('/wp-content/uploads/')) urls.add(url);
  }
}

fs.mkdirSync(DEST_ROOT, { recursive: true });

const map = new Map();
const failures = [];
for (const url of urls) {
  const p = normalizeAssetPath(url);
  if (!p || !p.startsWith('/wp-content/uploads/')) continue;
  const localUrl = `/migrated${p}`;
  const outPath = path.join(PUBLIC_DIR, localUrl.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  if (!fs.existsSync(outPath)) {
    try {
      const buf = await fetchWithRetry(url, 2);
      fs.writeFileSync(outPath, buf);
      console.log('downloaded', url, '->', localUrl, `(${buf.length} bytes)`);
    } catch (err) {
      failures.push({ url, error: String(err) });
      console.error('FAILED', url, String(err));
      continue;
    }
  }

  map.set(url, localUrl);

  const wpVariant = url.replace('/wp-content/uploads/', '/wp/wp-content/uploads/');
  map.set(wpVariant, localUrl);
}

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [from, to] of map) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, content);
}

const report = {
  scannedFiles: files.length,
  candidateUrls: urls.size,
  mappedUrls: map.size,
  failures,
};
fs.writeFileSync(path.join(ROOT, 'research', 'asset-migration-report.json'), JSON.stringify(report, null, 2));
console.log('\nREPORT', JSON.stringify(report, null, 2));
