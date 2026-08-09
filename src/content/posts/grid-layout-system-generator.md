---
title: "Grid: Rebuilding InDesign's Layout Dialog as a Browser Tool"
date: "2026-08-03"
excerpt: "A static browser tool that builds print and screen layout grids the way InDesign's New Document and Create Guides dialogs do, and exports them as SVG, PNG or JPG."
description: "Building a layout grid generator with no framework and no build step: one renderer for preview and export, facing-page geometry, and a Cloudflare caching bug that broke two releases."
cover: "/images/coding/grid.png"
coverAlt: "Grid layout generator interface showing page settings and a generated print grid preview"
tags:
  - "Coding"
  - "Design"
  - "JavaScript"
  - "Cloudflare"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

I kept rebuilding the same thing by hand. A layout grid — page size, margins, bleed, columns, rows, a baseline — is the first thing you set up in any print or screen document, and every tool makes you set it up again from scratch. InDesign has a good dialog for it. Figma has a different, worse one. Illustrator wants you to draw guides. And none of them will hand you the grid as a file you can drop into something else.

What I wanted was small: describe the grid once, see it, and export it as SVG for Illustrator, PNG for a mockup, or CSS for the web. No account, no install, no document to manage.

So [grid.matteocurcio.com](https://grid.matteocurcio.com) is a static page. No framework, no build step, no dependencies — six files and a stylesheet. `python3 -m http.server` is a complete development environment.

## One renderer, three formats

The design decision the whole tool rests on is that there is exactly one piece of code that draws a grid. The preview you see on screen and all three export formats come out of the same function in `js/render.js`, which returns an SVG string.

That sounds obvious and it is, but it is easy to get wrong. The tempting shape is a canvas preview for speed and a separate SVG writer for export, and then you spend the rest of the project chasing the ways they disagree — a half-pixel here, a rounded margin there, a baseline that starts one increment late in the file but not on screen.

Rasterising falls out of it almost for free. PNG and JPG are produced by drawing that same SVG onto a canvas:

```js
function rasterBlob(s, mime, quality) {
  return new Promise(function (resolve, reject) {
    var size = rasterSize(s);
    var markup = Render.build(s, { sizing: { w: size.w, h: size.h } });
    var url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = size.w; cv.height = size.h;
      var ctx = cv.getContext('2d');
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size.w, size.h);
      }
      ctx.drawImage(img, 0, 0, size.w, size.h);
      URL.revokeObjectURL(url);
      cv.toBlob(function (b) {
        b ? resolve(b) : reject(new Error('Could not encode ' + mime));
      }, mime, quality);
    };
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not rasterise the grid')); };
    img.src = url;
  });
}
```

The JPG white fill is there because canvas starts transparent and JPEG has no alpha channel — without it, every transparent pixel encodes as black. PNG keeps the transparency, which is what you want when the grid goes over artwork.

There's a hard ceiling worth knowing about. Browsers refuse to allocate canvases beyond roughly 10,000 pixels on the long edge, and they don't fail loudly — you get a blank image. So the raster size is clamped, and the interface says so rather than handing you an empty file:

```js
var MAX_DIM = 10000; /* browsers refuse much larger canvases */

var biggest = Math.max(w, h);
if (biggest > MAX_DIM) {
  var k = MAX_DIM / biggest;
  w *= k; h *= k; clamped = true;
}
```

## Units, and not degrading the document

Everything converts through millimetres. That part is dull. The interesting bit is what the conversion function deliberately does *not* do:

```js
/* Deliberately unrounded: pixels display to whole numbers, so rounding here
   would degrade the document every time the unit changed (210 mm → 794 px →
   210.08 mm). Callers round for display via format(), or explicitly. */
function convert(v, from, to) {
  if (from === to) return v;
  return fromMM(toMM(v, from), to);
}
```

This is the kind of bug that only shows up when someone flips the unit dropdown a few times. A4 is 210 mm. At the CSS reference of 96 px per inch that's 793.7 px, which displays as 794. Round at conversion time and switching back gives you 210.08 mm. Do it four more times and your A4 page isn't A4 any more. Rounding belongs at the display layer, never in the model.

The parser accepts a trailing unit so you can type past the dropdown:

```js
/* Accepts "210", "210mm", "8.5 in" — a trailing unit overrides the current one. */
function parse(str, unit) {
  if (typeof str === 'number') return str;
  var s = String(str).trim().toLowerCase().replace(',', '.');
  var m = s.match(/^(-?[\d.]+)\s*(mm|cm|in|pt|px|")?$/);
  if (!m) return null;
  var v = parseFloat(m[1]);
  if (!isFinite(v)) return null;
  var u = m[2] === '"' ? 'in' : m[2];
  return u && u !== unit ? convert(v, u, unit) : v;
}
```

The `"` alias exists because nobody types `8.5 in` when they mean `8.5"`.

## Facing pages are not two pages

The spread mode was the part that needed real thought. A facing-page document isn't two documents side by side — it's one canvas with mirrored geometry. The inside margin sits at the spine on both pages, so left and right mirror each other. A binding allowance widens both inside margins to cover what the bind swallows. And bleed applies to the two outer edges only, because nothing bleeds at the spine.

Each page still carries its own columns, rows and baseline, so a 6-column spread is 6 columns *per page*, not 6 across the pair. That matches how InDesign counts and how anyone laying out a magazine thinks about it.

## Measuring text properly

The printed-measurement band annotates every dimension along both axes. Fitting that text was where an approximation quietly failed:

```js
/* Estimating a monospace advance at 0.6 em is close but not exact — the "·"
   and "×" separators fall back to a proportional glyph, which pushed the run
   past the right margin. Measure it for real, falling back to the estimate
   only if there is no canvas to measure with. */
function textWidth(text, fs, weight) {
  try {
    if (!_ctx) _ctx = document.createElement('canvas').getContext('2d');
    _ctx.font = (weight || 400) + ' ' + fs + 'px ' + FONT;
    var w = _ctx.measureText(text).width;
    if (w > 0) return w;
  } catch (e) {}
  return text.length * fs * 0.6;
}
```

Monospace fonts are monospace right up until you use a glyph they don't have. The `·` and `×` separators fall through to a proportional fallback font, so the 0.6 em estimate under-measured and the label ran past the margin. Measuring with a canvas context costs almost nothing and is simply correct.

Then, because text width scales linearly with font size, measuring once at size 100 gives a factor that converts an available length directly into a font size:

```js
/* Width scales linearly with size, so measuring once at 100 gives a factor
   that turns an available length straight into a font size. */
function widthPerSize(items) {
  var w = 0;
  for (var i = 0; i < items.length; i++) {
    if (i) w += textWidth(GAP, 100);
    w += textWidth(items[i].l, 100, 600);
    w += textWidth(' ' + items[i].v, 100);
  }
  return (w / 100) * 1.01; /* a hair of slack against rounding */
}
```

No iterative fitting loop, no binary search on font size. One measurement and a division.

## The deploy bug that cost two releases

The site is on Cloudflare Pages, connected to a GitHub repo, so deploying is `git push`. Assets originally carried `max-age=3600`. HTML is served uncached. That combination is quietly lethal: a redeploy ships new markup against an hour-old stylesheet and an hour-old script. It doesn't fail cleanly — it renders as a half-updated page. Switches drawn as bare dashes. New defaults silently ignored. It looks like a bug in the release rather than a caching problem, which is why it got through twice.

The standard fix is a version query on the asset URLs, so I added `?v=` and bumped it per release. That fixed the browser half. It did not fix the deploy, and the reason is worth stating plainly:

**Cloudflare's edge caches by path and ignores the query string.** A `?v=` bump does not reach the CDN. I verified it by fetching a unique `?cb=` value that had never existed before and still getting the old file back.

So the assets are now `max-age=0, must-revalidate`. Bumping `?v=` on release is still worth doing for browser caches, but it is not what makes a deploy safe.

There's a second layer underneath that. On the custom domain, the zone overrides `_headers` entirely — `grid.matteocurcio.com` returns `max-age=14400` on `.js` and `.css` regardless of what the file says, because the zone's Browser Cache TTL applies to cacheable file types. Meanwhile `pages.dev` honours `max-age=0`. The two hosts disagree about the same deploy. On the custom domain, the `?v=` bump is what saves you: a new query string is a new URL, so the four-hour cache on the old one never gets consulted. Ship without bumping and returning visitors can hold stale assets for four hours.

The clean answer is content-hashed filenames, which needs a build step — the one thing this project doesn't have. For now the rev badge in the `<h1>` and the panel footer is how you tell a deployed build apart on refresh, and the `?v=` moves with it.

## What it does now

Page presets cover ISO A0–A7 and B2–B5, US sizes, other print formats down to business cards and record sleeves, and screen sizes from desktop to social. Grid presets are grouped by how they get used rather than by number — editorial 6 and 12 column, Swiss 4 × 8, Müller-Brockmann 6 × 6, magazine 6 × 9, newspaper 5, then landscape and web sets.

Margins, bleed and baseline switch on and off as whole features. A disabled section keeps its values but contributes nothing to the geometry, so turning bleed off gives you a canvas at exactly trim size rather than a canvas with zeroes in it.

Exported SVG carries real physical units — `width="216mm"` — and named layer groups, so it opens cleanly in Illustrator or Affinity with the structure intact rather than as a soup of paths. And there's a Copy CSS Grid button that emits the same grid as `grid-template-columns`, `gap` and `padding`, because half the time the grid was going to end up on the web anyway.

Settings persist in `localStorage`, so it reopens where you left it.

## Use it

No account, no install, nothing stored anywhere but your own browser. It's free and it's at [grid.matteocurcio.com](https://grid.matteocurcio.com).
