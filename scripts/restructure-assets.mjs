import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'src');
const publicRoot = path.join(repoRoot, 'public');
const legacyUploadPrefix = '/migrated/wp-content/uploads/';

const PLACEHOLDERS = new Set([
  '/migrated/wp-content/uploads/borouge_day2_1000.jpg',
  '/migrated/wp-content/uploads/thumbnail.webp'
]);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, data) {
  fs.writeFileSync(file, data);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFolderPart(input, fallback = 'Untitled') {
  const cleaned = (input || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^A-Za-z0-9 _\-.&]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

function slugToken(slug) {
  return slug.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase();
}

function extnameFromWebPath(p) {
  const ext = path.extname(p);
  return ext || '.jpg';
}

function toFsFromWeb(webPath) {
  return path.join(publicRoot, webPath.replace(/^\//, ''));
}

function isLocalUploadPath(p) {
  return typeof p === 'string' && p.startsWith(legacyUploadPrefix);
}

function collectProjectMeta() {
  const dir = path.join(srcRoot, 'content', 'projects');
  const out = new Map();
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.md')) continue;
    const slug = file.replace(/\.md$/, '');
    const content = read(path.join(dir, file));
    const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
    let title = slug;
    let client = 'Project';
    let cover = undefined;
    if (frontmatter) {
      for (const line of frontmatter[1].split('\n')) {
        const m = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
        if (!m) continue;
        const key = m[1];
        const rawVal = m[2].trim();
        const val = rawVal.replace(/^"|"$/g, '');
        if (key === 'title') title = val;
        if (key === 'client') client = val;
        if (key === 'cover') cover = val;
      }
    }
    out.set(slug, { slug, title, client, cover });
  }
  return out;
}

function collectReelSlugs() {
  const file = path.join(srcRoot, 'data', 'legacyPortfolio.ts');
  const text = read(file);
  const block = text.match(/export const LEGACY_REELS:[\s\S]*?=\s*\[([\s\S]*?)\];/);
  const slugs = new Set();
  if (!block) return slugs;
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1])) !== null) slugs.add(m[1]);
  return slugs;
}

function parseObjectArrayEntries(text) {
  const out = [];
  const re = /\{\s*slug:\s*"([^"]+)"([\s\S]*?)\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const slug = m[1];
    const body = m[2];
    const image = body.match(/image:\s*"([^"]+)"/)?.[1];
    const video = body.match(/video:\s*"([^"]+)"/)?.[1];
    out.push({ slug, image, video });
  }
  return out;
}

function parseQuotedMapBySlug(file, varName) {
  const text = read(file);
  const start = text.indexOf(`const ${varName}`);
  if (start < 0) return {};
  const sub = text.slice(start);
  const block = sub.match(/\{([\s\S]*?)\};/);
  if (!block) return {};
  const out = {};
  const re = /"([^"]+)":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1])) !== null) {
    out[m[1]] = m[2];
  }
  return out;
}

function parseHeroSlidesBySlug() {
  const file = path.join(srcRoot, 'pages', 'projects', '[slug].astro');
  const text = read(file);
  const match = text.match(/const HERO_SLIDE_OVERRIDES:[\s\S]*?=\s*\{([\s\S]*?)\};/);
  const out = {};
  if (!match) return out;
  const entryRe = /"([^"]+)":\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = entryRe.exec(match[1])) !== null) {
    const slug = m[1];
    const arr = [];
    const pRe = /"([^"]+)"/g;
    let p;
    while ((p = pRe.exec(m[2])) !== null) arr.push(p[1]);
    out[slug] = arr;
  }
  return out;
}

function collectAllReferencedUploadPaths() {
  const files = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(astro|ts|js|json|md|css)$/i.test(name)) files.push(full);
    }
  }
  walk(srcRoot);
  const refs = new Set();
  const rx = /\/migrated\/wp-content\/uploads\/[A-Za-z0-9._%\-/@()]+/g;
  for (const file of files) {
    const txt = read(file);
    const matches = txt.match(rx) || [];
    for (const m of matches) refs.add(m);
  }
  return refs;
}

const projectMeta = collectProjectMeta();
const reelSlugs = collectReelSlugs();
const wpContent = JSON.parse(read(path.join(srcRoot, 'data', 'wpProjectContent.json')));
const legacyEntries = parseObjectArrayEntries(read(path.join(srcRoot, 'data', 'legacyPortfolio.ts')));
const worksThumb = parseQuotedMapBySlug(path.join(srcRoot, 'pages', 'works.astro'), 'WORK_THUMB_OVERRIDES');
const worksVideo = parseQuotedMapBySlug(path.join(srcRoot, 'pages', 'works.astro'), 'WORK_VIDEO_OVERRIDES');
const nonCompareThumb = parseQuotedMapBySlug(path.join(srcRoot, 'data', 'nonCompareProjectOverrides.ts'), 'NON_COMPARE_THUMBNAILS');
const heroSlides = parseHeroSlidesBySlug();

const slugAssets = new Map();
function addSlugAsset(slug, role, p) {
  if (!slug || !isLocalUploadPath(p)) return;
  if (!slugAssets.has(slug)) slugAssets.set(slug, { thumbnailImage: [], thumbnailVideo: [], slides: [] });
  const bag = slugAssets.get(slug);
  if (!bag[role].includes(p)) bag[role].push(p);
}

for (const [slug, data] of Object.entries(wpContent)) {
  for (const p of data.images || []) addSlugAsset(slug, 'slides', p);
}

for (const [slug, meta] of projectMeta.entries()) {
  if (isLocalUploadPath(meta.cover)) addSlugAsset(slug, 'thumbnailImage', meta.cover);
}

for (const entry of legacyEntries) {
  if (isLocalUploadPath(entry.image)) addSlugAsset(entry.slug, 'thumbnailImage', entry.image);
  if (isLocalUploadPath(entry.video)) addSlugAsset(entry.slug, 'thumbnailVideo', entry.video);
}

for (const [slug, p] of Object.entries(worksThumb)) addSlugAsset(slug, 'thumbnailImage', p);
for (const [slug, p] of Object.entries(worksVideo)) addSlugAsset(slug, 'thumbnailVideo', p);
for (const [slug, p] of Object.entries(nonCompareThumb)) addSlugAsset(slug, 'thumbnailImage', p);
for (const [slug, arr] of Object.entries(heroSlides)) for (const p of arr) addSlugAsset(slug, 'slides', p);

const oldToNew = new Map();
const report = { moved: 0, copied: 0, missing: [], unresolved: [] };

function assign(oldPath, newPath) {
  if (!isLocalUploadPath(oldPath)) return;
  if (!oldToNew.has(oldPath)) oldToNew.set(oldPath, newPath);
}

for (const [slug, bag] of slugAssets.entries()) {
  const meta = projectMeta.get(slug) || { client: reelSlugs.has(slug) ? 'Reels' : 'Project', title: slug };
  const section = reelSlugs.has(slug) ? 'reels' : 'projects';
  const folderName = `${sanitizeFolderPart(meta.client, 'Client')} - ${sanitizeFolderPart(meta.title, slug)}`;
  const baseWeb = `/assets/${section}/${folderName}`;
  const token = slugToken(slug);

  const thumbImage = bag.thumbnailImage.find((p) => !PLACEHOLDERS.has(p)) || bag.thumbnailImage[0];
  if (thumbImage) {
    assign(thumbImage, `${baseWeb}/thumbnail_${token}${extnameFromWebPath(thumbImage)}`);
  }

  const thumbVideo = bag.thumbnailVideo.find((p) => !PLACEHOLDERS.has(p)) || bag.thumbnailVideo[0];
  if (thumbVideo) {
    assign(thumbVideo, `${baseWeb}/thumbnail_${token}${extnameFromWebPath(thumbVideo)}`);
  }

  const slideSet = [];
  for (const p of bag.slides) {
    if (PLACEHOLDERS.has(p)) continue;
    if (p === thumbImage || p === thumbVideo) continue;
    if (!slideSet.includes(p)) slideSet.push(p);
  }
  slideSet.forEach((p, i) => {
    const num = String(i + 1).padStart(2, '0');
    assign(p, `${baseWeb}/slide_${num}_${token}${extnameFromWebPath(p)}`);
  });
}

// map placeholders and other shared/unresolved migrated refs into services/common
const allReferenced = collectAllReferencedUploadPaths();
for (const oldPath of allReferenced) {
  if (oldToNew.has(oldPath)) continue;
  const base = path.basename(oldPath);
  const ext = extnameFromWebPath(oldPath);
  const safeBase = base.replace(/[^A-Za-z0-9._-]/g, '_');
  const target = `/assets/services/common/${safeBase || `asset${ext}`}`;
  assign(oldPath, target);
}

// perform copies
for (const [oldWeb, newWeb] of oldToNew.entries()) {
  const srcFs = toFsFromWeb(oldWeb);
  const dstFs = toFsFromWeb(newWeb);
  if (!fs.existsSync(srcFs)) {
    report.missing.push({ oldWeb, newWeb });
    continue;
  }
  ensureDir(path.dirname(dstFs));
  if (!fs.existsSync(dstFs)) {
    fs.copyFileSync(srcFs, dstFs);
    report.copied += 1;
  }
}

// relink in source files
const textFiles = [];
function walkText(d) {
  for (const name of fs.readdirSync(d)) {
    const full = path.join(d, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walkText(full);
    else if (/\.(astro|ts|js|json|md|css)$/i.test(name)) textFiles.push(full);
  }
}
walkText(srcRoot);

for (const file of textFiles) {
  let txt = read(file);
  let changed = false;
  for (const [oldWeb, newWeb] of oldToNew.entries()) {
    if (!txt.includes(oldWeb)) continue;
    txt = txt.split(oldWeb).join(newWeb);
    changed = true;
  }
  if (changed) write(file, txt);
}

// verification data
const stillLegacyRefs = [];
for (const file of textFiles) {
  const txt = read(file);
  if (txt.includes('/migrated/wp-content/uploads/')) stillLegacyRefs.push(path.relative(repoRoot, file));
}

const missingAfterRelink = [];
for (const file of textFiles) {
  const txt = read(file);
  const matches = txt.match(/\/assets\/[A-Za-z0-9._%\-/@()]+/g) || [];
  for (const web of matches) {
    const fsPath = toFsFromWeb(web);
    if (!fs.existsSync(fsPath)) missingAfterRelink.push({ file: path.relative(repoRoot, file), web });
  }
}

console.log(JSON.stringify({
  copied: report.copied,
  mappings: oldToNew.size,
  missingSourceCount: report.missing.length,
  missingSource: report.missing.slice(0, 80),
  stillLegacyRefs,
  missingAfterRelinkCount: missingAfterRelink.length,
  missingAfterRelink: missingAfterRelink.slice(0, 120)
}, null, 2));
