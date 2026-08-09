# Matteo Curcio Portfolio (Astro)

Static-first portfolio rebuild designed to replace a heavy WordPress stack.

## What the site includes

- Editorial homepage with hero video, featured work, writing, and service lanes
- About page with long-form personal narrative and pathways into key sections
- Projects and Reels archives
- Services and Tutoring pages with card-based layout
- Dedicated `/security` microsite for recruiters and infrastructure/security-minded visitors
- Light/dark mode toggle, OG preview image, and mobile nav support

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Main areas to know

- `src/components/HomePageContent.astro`
  Homepage structure and featured work/service lane selections.
- `src/layouts/BaseLayout.astro`
  Shared page shell, nav, footer, metadata, OG tags, and theme toggle logic.
- `src/pages/about.astro`
  Main narrative/about page.
- `src/pages/services.astro`
  Service cards plus the enquiry form.
- `src/pages/tutoring.astro`
  Tutoring cards, availability, and testimonials.
- `src/pages/security.astro`
  Standalone security landing page.
- `src/styles/global.css`
  Shared visual system and responsive behavior.
- `DESIGN-SYSTEM.md`
  Pointer to the canonical website design system in `/Users/matteo/Documents/Projects/01-Design Systems/Website`.
- `public/images/og/`
  Social preview assets.
- `public/images/about/`
  About-page media assets.
- `public/icons/apps/`
  Tutoring/software icons.

## Persistent checkpoints

Codex app updates should not matter if the repo state is committed and pushed.

Create a remote checkpoint branch at any time with:

```bash
./tools/checkpoint-wip.sh "short message"
```

That script will:

1. Create a dated `codex/checkpoint-*` branch
2. Commit the current repo state
3. Push the checkpoint to GitHub

To resume later:

```bash
git fetch origin --prune
git branch -r | rg 'origin/codex/checkpoint'
git checkout -b resume-work --track origin/codex/checkpoint-YYYYMMDD-HHMMSS
```

## Documentation mirror

Project documentation is also mirrored outside the repo in HomeLab.

```bash
./tools/sync-docs-to-homelab.sh
```

That copies the repo markdown docs to:

`~/Library/Mobile Documents/com~apple~CloudDocs/HomeLab/Website/matteocurcio.com`

## Content updates

Projects are content files in:

- `src/content/projects/*.md`

Posts are content files in:

- `src/content/posts/*.md`

Each file controls title, service, client, year, cover image, and copy.

## Form handling

The Services enquiry form is currently implemented as an AJAX submission flow suitable for a static Astro site. If it stops delivering correctly, check the form logic in:

- `src/pages/services.astro`

and verify the third-party endpoint or account status used there.

## Deploy to Cloudflare Pages (free)

1. Push this repo to GitHub.
2. In Cloudflare Pages, create a new project from the repo.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Environment variable: `NODE_VERSION=20`
6. Connect `matteocurcio.com` as custom domain.

## WordPress migration checklist

1. Export project copy and metadata from WordPress.
2. Export optimized cover images (WebP/AVIF where possible).
3. Create one markdown file per project under `src/content/projects`.
4. Keep current WP live while validating this build on a preview URL.
5. Switch DNS only after SEO metadata and redirects are verified.

## Current maintenance notes

- The live production flow is GitHub `main` -> Cloudflare Pages
- The site now has a dedicated security microsite and social preview image
- Italian localization is a future enhancement; if implemented, prefer proper `/it` routes and a language switcher rather than geo-only routing
