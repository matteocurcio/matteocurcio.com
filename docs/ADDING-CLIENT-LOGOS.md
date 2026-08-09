# Adding a client logo to the parade

The "Selected clients" row on the homepage shows a logo where there's a file for
one, and the client's name set in type where there isn't. This is how to turn a
text entry into a logo.

Everything lives in two places:

| What | Where |
| --- | --- |
| The list of clients | `src/components/ClientMarquee.astro` |
| The logo files | `public/images/clients/` |
| The processing script | `tools/add-client-logo.py` |

---

## The short version

```bash
python3 tools/add-client-logo.py ~/Desktop/yamaha.svg yamaha
```

It prints two lines. Paste them into `src/components/ClientMarquee.astro`, save,
done. The dev server picks it up on reload.

---

## Step 1 — get the file

Best to worst source:

1. **SVG** — sharpest, any size. Usually on the brand's press or media kit page.
2. **PNG with transparency** — fine at 400px tall or more.
3. **PNG or JPEG on a white background** — also fine; the script removes the white.
4. **Illustrator `.ai` or `.eps`** — can't be read by the script. Open it, export
   an SVG or a PNG at 400px tall, then use that.

Two things that won't work:

- **Anything under about 200px tall.** It'll look soft. Find a bigger one.
- **A light logo on a dark background.** The script keeps the dark parts and
  throws away the light ones, so a white logo on black comes out empty. Invert
  it first, or find a version on white.

## Step 2 — run the script

```bash
python3 tools/add-client-logo.py <file> <slug>
```

The slug is the filename it writes and how you'll refer to it. Lowercase, hyphens,
no spaces — `football-australia`, `2xu`, `fisher-price`.

Leave the slug off and it guesses from the filename:

```bash
python3 tools/add-client-logo.py ~/Desktop/logos/*.png
```

Needs Pillow once:

```bash
pip3 install Pillow
```

## Step 3 — paste the two lines

The script prints exactly what to add. For example, after processing Yamaha:

**First**, into the `DIMS` map near the top of `ClientMarquee.astro` — keep it
alphabetical:

```ts
"yamaha": [520, 160],
```

**Second**, find the client in the `clients` list and give it a `logo`. It's
currently in the "Awaiting a logo file" group at the bottom:

```ts
{ name: "Yamaha", href: P + "yamaha/" },
```

Add the logo and move it up into the group above:

```ts
{ name: "Yamaha", logo: L + "yamaha.png", href: P + "yamaha/" },
```

**Keep the `href` if it has one.** That's the link to the project done for that
client, and it's the reason the marquee pauses when you hover it.

## Step 4 — look at it

```bash
npm run dev
```

Then open http://localhost:4321 — note **localhost**, not `127.0.0.1`; Vite binds
to IPv6 and `127.0.0.1` will refuse the connection.

Check it in **both themes** using the toggle in the header. A logo that looks
right in light and wrong in dark almost always means the source was a light logo
on a dark background — see Step 1.

---

## What the script does, and why

It converts each logo to a **black-on-transparent silhouette** at 160px tall.

That's not a stylistic whim. The site has a light theme and a dark theme. A black
wordmark vanishes on dark; a white one vanishes on light. Keeping full colour
means either shipping two files per client or having half the row disappear
depending on the theme. A silhouette solves it with one file — the dark theme
inverts it in CSS.

It also **trims to the ink**. The marquee uses a single gap value between items,
so any transparent padding baked into a file would show up as an uneven gap.

160px tall is 2× the ~80px the row displays at, so it stays sharp on a retina
screen.

### One thing to be aware of

Reducing a logo to a single colour is a modification. It's standard practice for
a client wall and most brand guidelines allow single-colour usage — but a few
brands are strict about it. If a client is, either leave them as text or ask.

---

## Troubleshooting

**"nothing left after removing the background"**
The logo is light on a dark background. Invert it, or get a version on white.

**The logo comes out as a solid blob**
It has a dark filled background inside the artwork. Crop or cut the background
out before running the script.

**Fine lines disappeared**
The mark is too light for the cutoff. Open `tools/add-client-logo.py` and lower
`WHITE_CUTOFF` from `26` to about `12`, then re-run.

**It's much wider than everything else**
Wordmarks like Oracle run near 8:1. The marquee caps image width at `9rem`, so it
scales down rather than dominating. The script warns you when a mark is over 6:1.

**I want to remove a logo and go back to text**
Delete the `logo:` key from that client. The file and its `DIMS` entry can stay —
they're just unused.

---

## Still missing

Clients currently shown as text, with no logo file:

Yamaha · Makita · MYOB · Jetstar · AMP · Sophos · Fisher Price · Kikkoman ·
Football Australia · 2XU · Politix · Gigabyte · MotorOne Group · Ecco Safety ·
Nature's Way · MoveActive · Cowra Tourism · Sharjah Book Authority

**Sophos** is the one worth chasing — it's named repeatedly in the site's own
project data with work going back years, and there's no image asset anywhere on
the drives.

**Prisme** has files (`brands_prisme.ai` / `.pdf`) that need an SVG or PNG export
before the script can use them.
