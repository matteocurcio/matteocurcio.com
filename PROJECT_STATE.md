# Project State

Persistent handoff for the Astro site so the working state does not depend on Codex desktop history.

## Repo

- Path: `/Users/matteo/Library/CloudStorage/SeaDrive-matteo.curcio(10.0.10.15)/My Libraries/Projects/50 Web/matteocurcio.com` (SeaDrive). Any iCloud copy under `Mobile Documents/.../50-Web` is stale; build and commit here.
- Project memory name: `website`
- Primary remote: `git@github.com:matteocurcio/matteocurcio.com.git`
- Stack: Astro static site

## Current Focus

- Maintain and polish the Astro portfolio as the live source of truth for `matteocurcio.com`
- Keep the studio-world homepage, About narrative, Services and Training pages aligned
- Preserve the current light/dark theme system, mobile nav behavior, and OG/social preview setup
- Keep the contact/enquiry flow working through the current static-site-friendly submission setup
- Treat bilingual Italian support as a future enhancement, not an active implementation

## Working Files

- `src/components/HomePageContent.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/about.astro`
- `src/pages/services.astro`
- `src/pages/training.astro`
- `src/pages/world.astro` (homepage studio; source in `studio-world/`)
- `src/config/site.ts`
- `src/styles/global.css`
- `public/favicon.svg`
- `public/images/og/`
- `public/images/about/`
- `public/icons/apps/`
- `public/icons/social/substack.svg`

## Folder Layout

- `src/`, `public/`: the site. `public/` holds only files a page actually uses.
- `studio-world/`: Blender source and render pipeline for the homepage studio (see its README; mostly git-ignored).
- `archive/`: git-ignored. Unused assets moved out of `public/` (listed in `archive/MANIFEST.txt`) and the Capture & Craft source slides.
- `research/`: migration reports and audit notes. `docs/`, `tools/`: how-tos and helper scripts. `functions/`: Cloudflare Pages functions.
- `_to_delete/`: git-ignored. Things set aside for deletion; empty it when you're happy.

## Resume Workflow

1. Open the repo path above.
2. Run `git fetch origin --prune`.
3. Check `git log --oneline -5` to confirm the latest live-facing commits.
4. Run `npm install` if dependencies are missing.
5. Run `npm run dev` for local work or `npm run build` to validate the site.
6. If needed, open Cloudflare Pages and verify production picked up the latest `main` commit.

## Checkpoint Workflow

- Use `./tools/checkpoint-wip.sh "short message"` to create a dated checkpoint branch, commit all current repo changes, and push the checkpoint to GitHub.
- Use `./sync-to-github.sh "message"` only when you intentionally want to commit and push the current branch as-is.
- Use `./tools/sync-docs-to-homelab.sh` to mirror the markdown documentation to `~/Library/Mobile Documents/com~apple~CloudDocs/HomeLab/Website/matteocurcio.com`.

## Notes

- The durable source of truth is the git repo plus GitHub remote, not the Codex app sidebar/history.
- Documentation also has a second copy in `HomeLab/Website/matteocurcio.com`.
- Keep secrets out of git. Local env files under `tools/**/.env` are ignored.
- `/security` now redirects to `/workflow/`. The site includes an OG image, a static-form submission flow for Services, and a mobile-only nav toggle with external theme switcher.
- The About page image intentionally uses the Dubai camera photo under `public/images/about/matteo-curcio-dubai-camera.jpg`.
- If future work touches localization, prefer a proper `/it` route structure with a language switcher rather than geo-only redirection.
