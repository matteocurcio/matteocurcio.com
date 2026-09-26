# studio-world

Source for the isometric studio on the homepage and `/world/`. Moved here on 2026-09-26 from
`Projects/10 Code/matteocurcio.com-landing` (and `curcio_tower.blend` from Downloads).

Only this README and the Blender scripts are in git. The scenes, textures, props and PNG renders
are git-ignored (see `.gitignore`), so back them up with the rest of the SeaDrive library.

## What's live

`blender/curcio_tower.blend` is the current scene. It has two scenes:
- **Curcio Tower**: portrait, for phones and upright tablets → `public/world/mobile/`
- **Curcio Studio**: the same rooms two by two, landscape, for desktops → `public/world/`

Render and publish both sets from the repo:

    cd studio-world/blender
    blender -b curcio_tower.blend --python export_tower_web.py                               # tower
    TOWER_SCENE="Curcio Studio" blender -b curcio_tower.blend --python export_tower_web.py   # studio

PNG masters go to `web/assets/mobile/` and `web/assets/studio/`. WebP copies, the ID and room maps
and `hotspots.json` go straight into `public/world/`. `web/assets/hotspots_all.json` is the master
hotspot list (index, slug, label, page). Hotspots without a `page` stay grey and inert on the site.

## Layout

    blender/
      curcio_tower.blend        current scene (tower + studio)
      props/                    .glb props imported into the tower
      textures/                 screen, poster and album textures used by the scenes
      export_tower_web.py       renders the live passes from curcio_tower.blend
      world_blockout.blend      v1 desktop studio (Sept 22), superseded by the tower
      build_blockout.py         built the v1 blockout
      export_web.py             v1 render script; writes into public/world only with WORLD_WRITE_SITE=1
      world_pass_*.blend        throwaway pass files export_web.py regenerates
      world_blockout_codex.blend + codex_lookdev/   illustrated look study (not used on the site)
      archive/                  earlier experiments
      reviews/                  preview and review renders
    web/
      index.html                the original standalone prototype
      assets/studio, mobile     PNG masters of the live renders
      assets/v1-desktop-2026-09-22/   renders from the v1 desktop studio

## After the move

`curcio_tower.blend` linked its textures by a path relative to Downloads. The first time you open it,
use File › External Data › Find Missing Files and pick `blender/textures`, then save. The scenes in
`archive/` point at `//textures` one level up, so do the same if you ever reopen one.
