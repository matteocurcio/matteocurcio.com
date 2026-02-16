import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URLS_TSV = path.join(ROOT, 'research', 'urls_with_source.tsv');
const OUT_DIR = path.join(ROOT, 'src', 'content', 'projects');

const SITE = 'https://matteocurcio.com';
const API = `${SITE}/wp-json/semplice/v1/frontend/posts/`;

function slugFromWorkUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'work') return parts[1];
  return null;
}

function cleanTitle(t) {
  return (t || '').replace(/\s*\|\s*Matteo Curcio\s*$/i, '').trim();
}

function ymdToYear(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-/);
  return m ? Number(m[1]) : null;
}

function uniq(xs) {
  return [...new Set(xs.filter(Boolean))];
}

function findFirstImageUrl(node) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const v of node) {
      const found = findFirstImageUrl(v);
      if (found) return found;
    }
    return null;
  }
  if (typeof node === 'object') {
    if (typeof node.url === 'string' && node.url.startsWith('http')) return node.url;
    for (const v of Object.values(node)) {
      const found = findFirstImageUrl(v);
      if (found) return found;
    }
  }
  return null;
}

function extractTextSnippets(node, out = []) {
  if (!node) return out;
  if (typeof node === 'string') {
    const s = node.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (s.length >= 40 && !s.startsWith('http')) out.push(s);
    return out;
  }
  if (Array.isArray(node)) {
    for (const v of node) extractTextSnippets(v, out);
    return out;
  }
  if (typeof node === 'object') {
    for (const v of Object.values(node)) extractTextSnippets(v, out);
    return out;
  }
  return out;
}

async function readWorkUrls() {
  const raw = await fs.readFile(URLS_TSV, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const urls = [];
  for (const line of lines) {
    const [url, source] = line.split('\t');
    if (source !== 'project') continue;
    const slug = slugFromWorkUrl(url);
    if (!slug) continue;
    urls.push({ url, slug });
  }
  const seen = new Set();
  return urls.filter((x) => (seen.has(x.slug) ? false : (seen.add(x.slug), true)));
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
        continue;
      }
      lines.push(`${k}:`);
      for (const item of v) {
        const s = String(item).replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
        // Quote array items so YAML doesn't reinterpret numeric-looking strings.
        lines.push(`  - "${s}"`);
      }
      continue;
    }
    if (typeof v === 'string') {
      const safe = v.replace(/\r?\n/g, ' ').replace(/"/g, '\\"');
      lines.push(`${k}: "${safe}"`);
      continue;
    }
    lines.push(`${k}: ${v}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function guessServiceFromSlug(slug) {
  if (/(reel|grade|color)/i.test(slug)) return 'color';
  if (/(edit|cut|offline|online)/i.test(slug)) return 'editing';
  if (/(motion|title|gfx|graphics)/i.test(slug)) return 'motion';
  return 'motion';
}

function escapeRe(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function pickOgImageFromHtml(html) {
  const m =
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  return m ? m[1] : null;
}

function yearFromHtml(html) {
  const m =
    html.match(/"datePublished"\s*:\s*"(\d{4})-\d{2}-\d{2}/i) ||
    html.match(/<meta\s+property=["']article:modified_time["']\s+content=["'](\d{4})-\d{2}-\d{2}/i);
  return m ? Number(m[1]) : null;
}

async function discoverWpIdFromHtml(url, slug) {
  const html = await fetch(url).then((r) => r.text());
  // Semplice embeds a big JSON-ish object `semplice = {..., post_ids:{...}};`.
  const re = new RegExp(`\\"${escapeRe(slug)}\\"\\s*:\\s*\\"(\\d+)\\"`);
  const m = html.match(re);
  if (!m) return null;
  return Number(m[1]);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const work = await readWorkUrls();
  const results = [];

  for (const { url, slug } of work) {
    const html = await fetch(url).then((r) => r.text());
    // Avoid double-fetching by doing ID discovery against the already-downloaded HTML.
    const id = (() => {
      const re = new RegExp(`\\"${escapeRe(slug)}\\"\\s*:\\s*\\"(\\d+)\\"`);
      const m = html.match(re);
      return m ? Number(m[1]) : null;
    })();
    if (!id) {
      results.push({ slug, url, status: 'no_id' });
      continue;
    }

    const data = await fetchJson(`${API}${id}`);

    const title = cleanTitle(data.title);
    const cover =
      pickOgImageFromHtml(html) ||
      findFirstImageUrl(data.content) ||
      null;
    const year = yearFromHtml(html) || ymdToYear(data.post_settings?.modified_time) || null;
    const textSnips = extractTextSnippets(data.content);
    const excerpt = (textSnips[0] || '').slice(0, 200);

    const wpCategoryIds = (Array.isArray(data.post_settings?.meta?.categories) ? data.post_settings.meta.categories : []).map(
      (x) => String(x)
    );
    const tags = [];
    const client = (data.post_settings?.meta?.project_type && String(data.post_settings.meta.project_type).trim()) || 'Unknown';

    const fm = {
      title,
      service: guessServiceFromSlug(slug),
      client,
      year: year ?? 2025,
      excerpt: excerpt || `Migrated from ${url}`,
      cover: cover || '/images/project-01.svg',
      coverAlt: title,
      featured: false,
      tags,
      order: 100,
      originalUrl: url,
      wpId: id,
      wpCategoryIds
    };

    const bodyLines = [];
    bodyLines.push(`Original: ${url}`);
    bodyLines.push('');
    bodyLines.push('Notes:');
    bodyLines.push('- Auto-migrated from Semplice frontend API.');
    bodyLines.push('- Replace `client`, `service`, and `year` as needed.');

    const md = `${frontmatter(fm)}\n\n${bodyLines.join('\n')}\n`;
    const outPath = path.join(OUT_DIR, `${slug}.md`);
    await fs.writeFile(outPath, md, 'utf8');

    results.push({ slug, url, id, status: 'ok' });
  }

  const summaryPath = path.join(ROOT, 'research', 'migrate-semplice-results.json');
  await fs.writeFile(summaryPath, JSON.stringify(results, null, 2), 'utf8');

  const ok = results.filter((r) => r.status === 'ok').length;
  const noId = results.filter((r) => r.status === 'no_id').length;
  console.log(`Migrated: ${ok}, missing id: ${noId}, total: ${results.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
