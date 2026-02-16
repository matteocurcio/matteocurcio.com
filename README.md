# Matteo Curcio Portfolio (Astro)

Static-first portfolio rebuild designed to replace a heavy WordPress stack.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content updates

Projects are content files in:

- `src/content/projects/*.md`

Each file controls title, service, client, year, cover image, and copy.

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
