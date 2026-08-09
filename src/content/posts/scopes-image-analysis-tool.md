---
title: "Scopes as a Small Image Analysis Tool"
date: "2026-04-26"
excerpt: "A small image-analysis workflow for generating waveform, RGB parade and vectorscope visuals from stills, built for teaching, writing, and explaining colour decisions."
description: "Designing a scopes tool for colour education: portable waveform, RGB parade and vectorscope renders, Resolve-style conventions, and visuals that can live outside a grading suite."
cover: "/images/coding/scopes.png"
coverAlt: "Scope Tools interface composite showing waveform, RGB parade and vectorscope output panels"
tags:
  - "Tools"
  - "Colour"
  - "Teaching"
  - "Image Processing"
topic: "craft"
draft: false
writingKind: "technical"
---

## Why this exists

Scopes are the best way to teach what an image is actually doing. A student can argue with you about whether a shot looks warm. They cannot argue with a vectorscope trace sitting off the red axis.

The problem is that scopes live inside grading software. That's fine in a suite and useless everywhere else — when you're building course material, writing a post, comparing two stills side by side, or trying to show someone why their skin tones drift, and opening Resolve to screenshot a panel is more friction than the explanation is worth.

So `scopetools` is a small analysis workflow: point it at an image, get scope renders out as files that can be dropped into a slide, a blog post, or a teaching deck.

```bash
# All three scopes (defaults)
python scopetools.py frame.png

# Waveform only, 12-bit scale, colorised
python scopetools.py frame.tiff --scopes waveform --wf-scale 12bit --wf-colorize

# Vectorscope: hue vectors style, 75%+100% targets
python scopetools.py frame.jpg --scopes vectorscope --vs-style hue_vectors --vs-targets 75+100

# RGB Parade, percentage scale
python scopetools.py frame.png --scopes parade --rp-scale percentage
```

The important choice is that there is no GUI. The output is the interface. For teaching, that is exactly the point: generate the evidence, place it next to the image, and keep the explanation moving.

## The axis convention nearly everyone gets wrong

This is the detail that took longest to get right.

A vectorscope plots chroma on two axes. The intuitive assumption — the one you'll find repeated across forums and more than one tutorial — is X = Cr, Y = Cb. It's wrong, at least if you want to match what Resolve draws.

```python
"""
modules/vectorscope.py — Cb/Cr vectorscope renderer, DaVinci Resolve style.

Axis convention (verified against DR EBU colour bars):
  X = Cb   (Cb+ → right,  matches B/Cy on right side)
  Y = Cr   (Cr+ → up,     matches R/Mg in upper half)

This is opposite to the common assumption of X=Cr,Y=Cb.
"""
```

The way to settle it is not to reason about it. It's to feed EBU colour bars through both conventions and see which one puts the targets where Resolve puts them. Blue and cyan belong on the right; red and magenta belong in the upper half. Only X = Cb, Y = Cr does that.

Once the axes are settled, the SMPTE target positions can be stated as literal coordinates rather than derived from a formula that might carry the same error:

```python
# SMPTE target positions in (Cb, Cr) — verified against DR EBU colour bars
# X=Cb (horizontal), Y=Cr (vertical, Cr+=up)
TARGETS_75 = {
    "R":  (-0.106,  0.461),   # left, up
    "Ye": (-0.461,  0.042),   # far left, ~centre
    "G":  (-0.355, -0.419),   # left, down
    "Cy": ( 0.106, -0.461),   # slightly right, far down
    "B":  ( 0.461, -0.042),   # far right, ~centre
    "Mg": ( 0.355,  0.419),   # right, up
}
TARGETS_100 = {k: (v[0]*(100/75), v[1]*(100/75)) for k, v in TARGETS_75.items()}
```

The 100% targets derive from the 75% set by a single scale factor, which is the one relationship that genuinely is arithmetic.

## The architecture follows the explanation

The core of a vectorscope is less exotic than it looks. Every pixel becomes a point in Cb/Cr space, and what you need to show is the density of those points. The tool is organised around making that idea visible rather than around becoming a full application.

```python
step  = max(1, quality_to_step(args.vs_quality, img_w))
Cb_s  = Cb.ravel()[::step]
Cr_s  = Cr.ravel()[::step]

h2d, _, _ = np.histogram2d(
    Cb_s, Cr_s,                           # ← Cb on X-axis, Cr on Y-axis
    bins=bins,
    range=[[-vs_range, vs_range], [-vs_range, vs_range]],
)
h2d = h2d.T   # rows=Cr (Y), cols=Cb (X)
```

Two things earn their place here. The `[::step]` stride is the quality control — a 4K frame is 8.8 million pixels, and sampling every fourth or sixteenth one produces a visually identical trace in a fraction of the time, with the step derived from image width so the setting means the same thing regardless of source resolution. And the `.T` transpose is the bridge between two conventions that disagree: `histogram2d` returns rows indexed by the first argument, images want rows to be Y.

## Making it look like a scope

A raw density histogram looks like a scatter plot, not a scope. Real scopes glow — the bright core of a trace bleeds into a halo, and that halo is most of what makes the shape readable at a glance.

The glow is four Gaussian blurs at different radii, summed with different weights:

```python
bk      = np.clip(getattr(args, "vs_bloom", 0.65), 0.0, 1.0)
density = np.log1p(h2d);  density /= density.max() + 1e-9

hotspot  = gaussian_filter(density, sigma=0.40 + bk * 0.50)
core     = gaussian_filter(density, sigma=1.00 + bk * 1.30)
midglow  = gaussian_filter(density, sigma=10.0)
wideglow = gaussian_filter(density, sigma=23.0 + bk * 8.0)

combined = np.clip(
    hotspot  * 1.20
  + core     * 0.60
  + midglow  * (0.58 + bk * 0.07)
  + wideglow * (0.26 + bk * 0.04),
    0.0, 1.0,
)
```

The `log1p` before any of that is doing quiet but essential work. Pixel density in a real frame is wildly non-uniform — a shot with a lot of sky puts an enormous count in one small region and single-digit counts everywhere else. Plot that linearly and you get one white blob and nothing else. A log curve compresses the peak so the sparse detail survives, and `log1p` handles the zeros without a special case.

The four-layer stack is the difference between "blurred" and "glowing". A single blur either keeps the core tight and gives you no halo, or gives you a halo and destroys the core. Stacking a 0.4-sigma hotspot against a 23-sigma wide glow lets both exist at once, and the `bk` bloom parameter scales the radii together so the look stays coherent as you dial it.

## Where it fits

I use this for course material, for explaining a grade in writing, and for quick analysis when I want to look at an image properly without opening a project. It sits in the same family as the colour teaching work — not just making images look better, but giving people a way to see what an image is doing.

There's no GUI — the output is the interface, and that suits how it gets used: run it over a frame, drop the result into a slide or a post, move on.
