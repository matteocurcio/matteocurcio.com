# matteocurcio.com migration inventory (2026-02-15)

## Crawl coverage
- Public URLs discovered from Yoast sitemaps: **107**
- Inventory rows (including header): **108**
- HTTP status: all discovered URLs returned **200** at crawl time.

## URL type counts
- `project`: 56
- `post_tag`: 23
- `category`: 11
- `post`: 6
- `page`: 6
- `semplice_folder`: 4
- `footer`: 1

## Important findings
- WordPress REST content endpoints are blocked by Solid Security (`401`), so content extraction must use sitemap + HTML scraping.
- Meta descriptions are missing on **80** URLs.
- One duplicate project page title appears twice: `Dubai Motor Show | Matteo Curcio`.
- Current static navigation pages discovered:
  - `/`
  - `/about`
  - `/faq`
  - `/motion`
  - `/photography`
  - `/reels`

## Output files
- Full URL list with sitemap source:
  - `/Users/matteo/Documents/New project/research/urls_with_source.tsv`
- Full metadata inventory (source, URL, status, title, description, canonical, og:image, first h1):
  - `/Users/matteo/Documents/New project/research/site_inventory.tsv`

## Notes for migration
- The project library is significantly larger than the initial scaffold (56 live work entries).
- If you want high-fidelity migration, the next step is to map each `/work/*` URL to a markdown entry and import title/description/cover image into the new Astro content collection.
