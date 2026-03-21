# Project State

Persistent handoff for the Astro site so the working state does not depend on Codex desktop history.

## Repo

- Path: `/Users/matteo/Library/Mobile Documents/com~apple~CloudDocs/Code/matteocurcio.com`
- Primary remote: `git@github.com:matteocurcio/matteocurcio.com.git`
- Stack: Astro static site

## Current Focus

- Add a secure client file portal entry page at `/client`
- Add supporting research for QNAP + Cloudflare tunnel/access setup
- Scaffold a small QNAP admin backend under `tools/qnap-admin`
- Update site chrome with favicon support and Substack social link
- Expand the about page with randomized intro paragraphs

## Working Files

- `src/pages/client.astro`
- `research/client-portal-setup.md`
- `research/qnap-cloudflare-project-handover.yaml`
- `tools/qnap-admin/`
- `src/pages/about.astro`
- `src/layouts/BaseLayout.astro`
- `src/config/site.ts`
- `public/favicon.svg`
- `public/icons/social/substack.svg`

## Resume Workflow

1. Open the repo path above.
2. Run `git fetch origin --prune`.
3. List checkpoint branches with `git branch -r | rg 'origin/codex/checkpoint'`.
4. Check out the latest checkpoint branch you want to resume from.
5. Run `npm install` if dependencies are missing.
6. Run `npm run dev` for local work or `npm run build` to validate the site.

## Checkpoint Workflow

- Use `./tools/checkpoint-wip.sh "short message"` to create a dated checkpoint branch, commit all current repo changes, and push the checkpoint to GitHub.
- Use `./sync-to-github.sh "message"` only when you intentionally want to commit and push the current branch as-is.

## Notes

- The durable source of truth is the git repo plus GitHub remote, not the Codex app sidebar/history.
- Keep secrets out of git. Local env files under `tools/**/.env` are ignored.
