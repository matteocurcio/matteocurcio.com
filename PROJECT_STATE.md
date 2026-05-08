# Project State

Persistent handoff for the Astro site so the working state does not depend on Codex desktop history.

## Repo

- Path: `/Users/matteo/Library/Mobile Documents/com~apple~CloudDocs/Projects/50-Web/matteocurcio.com`
- Project memory name: `website`
- Primary remote: `git@github.com:matteocurcio/matteocurcio.com.git`
- Stack: Astro static site

## Current Focus

- Maintain and polish the Astro portfolio as the live source of truth for `matteocurcio.com`
- Keep the editorial homepage, About narrative, Services, Tutoring, and Security microsite aligned
- Preserve the current light/dark theme system, mobile nav behavior, and OG/social preview setup
- Keep the contact/enquiry flow working through the current static-site-friendly submission setup
- Treat bilingual Italian support as a future enhancement, not an active implementation

## Working Files

- `src/components/HomePageContent.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/about.astro`
- `src/pages/security.astro`
- `src/pages/services.astro`
- `src/pages/tutoring.astro`
- `src/config/site.ts`
- `src/styles/global.css`
- `public/favicon.svg`
- `public/images/og/`
- `public/images/about/`
- `public/icons/apps/`
- `public/icons/social/substack.svg`

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
- The current site includes a dedicated `/security` microsite, an OG image, a static-form submission flow for Services, and a mobile-only nav toggle with external theme switcher.
- The About page image intentionally uses the Dubai camera photo under `public/images/about/matteo-curcio-dubai-camera.jpg`.
- If future work touches localization, prefer a proper `/it` route structure with a language switcher rather than geo-only redirection.
