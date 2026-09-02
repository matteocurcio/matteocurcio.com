import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Pages that exist only to forward an old URL, or that aren't for the public.
// Astro already marks the generated redirect stubs noindex; this keeps them
// (and the dev-only preview) out of the sitemap as well.
const EXCLUDE = [
  "/coding", "/making", "/problem-solving", "/tools", "/security",
  "/for-studios", "/training", "/work", "/contact",
  "/dark-preview", "/client", "/color",
  "/blog/life-cost-tracker",
  "/blog/recurring-expenses-tracker",
  "/blog/teaching-the-why-behind-colour-decisions",
  // These essays remain live for direct links, but they are not part of the
  // technical blog/search strategy for the portfolio site.
  "/blog/the-bunker-logic",
  "/blog/the-mainstream-machine"
];

// Every reel also renders under /projects/<slug>, and those copies already
// canonicalise to /reels/<slug>. A sitemap should only advertise canonical
// URLs, so the duplicates are dropped here too.
const REEL_SLUGS = [
  "advertising", "ar", "beauty-retouch", "corporate", "dataviz", "fashion",
  "finishing", "food", "immersive", "in-store", "mapping", "music",
  "online-editing", "presentology", "realestate", "royaltyfree", "sport",
  "sync", "video-games-advertising"
];

export default defineConfig({
  site: "https://matteocurcio.com",
  output: "static",
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, "");
        if (EXCLUDE.includes(path)) return false;
        const reelTwin = path.startsWith("/projects/") &&
          REEL_SLUGS.includes(path.slice("/projects/".length));
        return !reelTwin;
      }
    }),
    {
      name: "sitemap-legacy-alias",
      hooks: {
        "astro:build:done": ({ dir }) => {
          const indexPath = fileURLToPath(new URL("sitemap-index.xml", dir));
          const legacyPath = fileURLToPath(new URL("sitemap.xml", dir));
          if (existsSync(indexPath)) {
            copyFileSync(indexPath, legacyPath);
          }
        }
      }
    }
  ],
  redirects: {
    "/coding": "/workflow",
    "/making": "/workflow",
    "/problem-solving": "/workflow",
    "/tools": "/workflow",
    "/security": "/workflow",
    // Legacy pages that were only a sentence telling you where to go instead.
    // As real redirects they stop being thin indexable pages of their own.
    "/for-studios": "/services",
    "/training": "/tutoring",
    "/work": "/works",
    "/contact": "/about",
    "/color": "/colour-grading/",
    // The listing duplicated /works, which is the one in the nav.
    "/projects": "/works"
  }
});
