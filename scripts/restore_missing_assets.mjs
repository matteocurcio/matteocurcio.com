#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname)), '..');
const manifest = process.argv[2] || path.join(repo, 'research', 'missing-assets-manifest.csv');
const backupDirs = process.argv.slice(3);

if (backupDirs.length === 0) {
  console.error('Usage: node scripts/restore_missing_assets.mjs <manifest.csv> <backupDir1> [backupDir2 ...]');
  process.exit(1);
}

if (!fs.existsSync(manifest)) {
  console.error(`Manifest not found: ${manifest}`);
  process.exit(1);
}

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function scoreCandidate(filePath) {
  const p = filePath.replace(/\\/g, '/').toLowerCase();
  if (p.includes('/backup/')) return 8;
  if (p.includes('/wp/wp-content/uploads/')) return 0;
  if (p.includes('/color/wp-content/uploads/')) return 1;
  if (p.includes('/wp-content/uploads/')) return 2;
  if (p.includes('/uploads/')) return 3;
  return 9;
}

function chooseBestMatch(matches) {
  if (matches.length <= 1) return { chosen: matches[0], tie: false };
  const ranked = matches
    .map((file) => ({ file, score: scoreCandidate(file) }))
    .sort((a, b) => a.score - b.score || a.file.localeCompare(b.file));

  const best = ranked[0];
  const sameRank = ranked.filter((item) => item.score === best.score);

  if (sameRank.length === 1) {
    return { chosen: best.file, tie: false };
  }

  // If tied but byte size differs, prefer larger file (more likely real media than placeholder).
  const withSize = sameRank.map((item) => {
    let size = 0;
    try {
      size = fs.statSync(item.file).size;
    } catch {
      size = 0;
    }
    return { ...item, size };
  }).sort((a, b) => b.size - a.size || a.file.localeCompare(b.file));

  if (withSize.length > 1 && withSize[0].size !== withSize[1].size) {
    return { chosen: withSize[0].file, tie: false };
  }

  return { chosen: withSize[0]?.file, tie: true };
}

const allBackupFiles = backupDirs.flatMap((d) => walk(path.resolve(d)));
const byName = new Map();
for (const f of allBackupFiles) {
  const name = path.basename(f).toLowerCase();
  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(f);
}

const lines = fs.readFileSync(manifest, 'utf8').split(/\r?\n/).filter(Boolean);
const rows = lines.slice(1).map((line) => {
  const parts = line.split(',');
  return {
    status: parts[0],
    siteReference: parts[1],
    destinationAbsolute: parts[2],
    filename: parts[3]
  };
});

const copied = [];
const unresolved = [];
const ambiguous = [];
const autoResolvedAmbiguous = [];

for (const row of rows) {
  const matches = byName.get((row.filename || '').toLowerCase()) || [];
  if (matches.length === 0) {
    unresolved.push(row);
    continue;
  }

  const { chosen, tie } = chooseBestMatch(matches);
  if (!chosen || tie) {
    ambiguous.push({ row, matches });
    continue;
  }

  if (matches.length > 1) {
    autoResolvedAmbiguous.push({ row, chosen, candidates: matches });
  }

  const dst = row.destinationAbsolute;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(chosen, dst);
  copied.push({ src: chosen, dst });
}

const report = {
  manifest,
  backupDirs,
  total: rows.length,
  copied: copied.length,
  unresolved: unresolved.length,
  ambiguous: ambiguous.length,
  autoResolvedAmbiguous: autoResolvedAmbiguous.length,
  unresolvedItems: unresolved,
  ambiguousItems: ambiguous,
  autoResolvedAmbiguousItems: autoResolvedAmbiguous
};

const outPath = path.join(repo, 'research', 'restore-missing-assets-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Copied: ${copied.length}`);
console.log(`Unresolved: ${unresolved.length}`);
console.log(`Ambiguous: ${ambiguous.length}`);
console.log(`Auto-resolved ambiguous: ${autoResolvedAmbiguous.length}`);
console.log(`Report: ${outPath}`);
