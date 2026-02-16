import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URLS_TSV = path.join(ROOT, 'research', 'urls_with_source.tsv');
const OUT_DIR = path.join(ROOT, 'src', 'content', 'posts');

function slugFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : 'index';
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1] : '';
}

function isoDateFromHtml(html) {
  const m = html.match(/"datePublished"\s*:\s*"(\d{4}-\d{2}-\d{2})/i);
  if (m) return m[1];
  const m2 = html.match(/<meta\s+property=["']article:modified_time["']\s+content=["'](\d{4}-\d{2}-\d{2})/i);
  if (m2) return m2[1];
  return '2025-01-01';
}

function ogImage(html) {
  const m =
    html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
  return m ? m[1] : '';
}

function metaDescription(html) {
  const m =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  return m ? m[1] : '';
}

function h1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripTags(m[1]) : '';
}

function titleTag(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]).replace(/\s*\|\s*Matteo Curcio\s*$/i, '').trim() : '';
}

function frontmatter(obj) {
  const lines = ['---'];
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      lines.push(v.length ? `${k}:\n${v.map((x) => `  - "${String(x).replace(/"/g, '\\"')}"`).join('\n')}` : `${k}: []`);
      continue;
    }
    if (typeof v === 'string') {
      lines.push(`${k}: "${v.replace(/\r?\n/g, ' ').replace(/"/g, '\\"')}"`);
      continue;
    }
    lines.push(`${k}: ${v}`);
  }
  lines.push('---');
  return lines.join('\n');
}

async function readPostUrls() {
  const raw = await fs.readFile(URLS_TSV, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const urls = [];
  for (const line of lines) {
    const [url, source] = line.split('\t');
    if (source !== 'post') continue;
    if (url.endsWith('/blog')) continue; // index page
    urls.push(url);
  }
  return urls;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const urls = await readPostUrls();

  for (const url of urls) {
    const html = await fetch(url).then((r) => r.text());
    const slug = slugFromUrl(url);

    const title = titleTag(html) || h1(html) || slug;
    const date = isoDateFromHtml(html);
    const cover = ogImage(html) || undefined;
    const excerpt = (metaDescription(html) || pick(html, /<p[^>]*>([\s\S]{60,260}?)<\/p>/i)).trim();

    const fm = {
      title,
      date,
      excerpt: stripTags(excerpt).slice(0, 220),
      cover,
      coverAlt: title,
      tags: [],
      draft: false,
      originalUrl: url
    };

    const md = `${frontmatter(fm)}\n\n${stripTags(pick(html, /<article[\s\S]*?<\/article>/i))}\n`;
    await fs.writeFile(path.join(OUT_DIR, `${slug}.md`), md, 'utf8');
  }

  console.log(`Migrated posts: ${urls.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
