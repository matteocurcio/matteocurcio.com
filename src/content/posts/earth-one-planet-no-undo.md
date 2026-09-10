---
title: "Earth: One Planet. No Undo Button."
metaTitle: "Earth: Satellite Imagery for Creative Tools | Matteo Curcio"
date: "2026-09-10"
excerpt: "A changing planet should be easier to see. Why I’m building a satellite-image API for creative work, with complete maps, honest timestamps, and a very clear climate perspective."
description: "Earth turns NASA GIBS satellite imagery into portable world textures for installations, education and creative tools, with dated gap fill and transparent source information."
cover: "/images/coding/earth.png"
coverAlt: "Earth satellite mosaic combining recent observations with a static geographic background"
tags:
  - "Tools"
  - "Climate"
  - "Creative Coding"
  - "Open Data"
writingKind: "technical"
draft: false
---

## We do not get a replacement planet

I spend much of my working life helping people decide what deserves attention in an image. Earth starts with a fairly large subject: the only place we know how to live.

Climate change is not an abstract interest for me. It is the context in which everything else happens. The work, the travel, the music, the ordinary expectation that a place will still be habitable and recognisable in a few decades. A beautiful image of the planet should make that relationship harder to forget.

I find it increasingly difficult to accept political decisions that treat more drilling and longer dependence on fossil fuels as common sense, while treating the consequences as someone else’s future problem. The profit arrives on one balance sheet. The heat, damaged ecosystems and costs of adaptation arrive everywhere else. The atmosphere is notoriously uninterested in quarterly earnings.

The science is not waiting for better branding. The [IPCC’s synthesis of climate research](https://report.ipcc.ch/ar6syr/headline.html) identifies human activity, principally greenhouse-gas emissions, as the cause of global warming and explains why rapid, sustained emissions reductions matter. My opinion is that our political and creative attention should reflect the scale of that responsibility.

Earth is a small contribution from the tools I know: imagery, colour, systems and software. I want it to be easy to bring a changing view of our shared home into the places where people look.

## A planet you can actually use

The idea is an Earth texture that updates as imagery becomes available, with a simple address you can use in your own work. A browser view lets you inspect the flat map or spin a globe. The useful part continues after you close the page: an API returns the image in a standard format and resolution.

That could become a slowly changing backdrop in a gallery installation, a globe in a classroom, a museum display, a documentary graphic, or a desktop reminder that the weather outside belongs to a much larger system. A performance could use the image as material rather than stock decoration. An exhibition about climate could place it alongside properly sourced temperature or emissions records.

Those are different kinds of evidence. Today’s cloud pattern is weather. It cannot, by itself, establish a climate trend. Earth is a visual entry point, not a climate model, a sea-ice monitoring product or an emergency information service.

## Public science made portable

The imagery comes through [NASA’s Global Imagery Browse Services, GIBS](https://nasa-gibs.github.io/gibs-api-docs/). The present implementation combines GOES East and West GeoColor imagery with daily NOAA-20 VIIRS and Terra MODIS products. NASA Blue Marble provides the static surface background, combined with its archived 2002 cloud composite. The GOES GeoColor contribution is credited to NOAA and CIRA; a NASA delivery service does not make every underlying product NASA-owned.

Worldview is a useful reference for discovering what GIBS offers. Earth is independently implemented against the documented services; it is not a fork of Worldview and does not incorporate its application code.

There is a distinction worth making about NASA’s changing website. [Earthdata is consolidating NASA Earth-science sites](https://www.earthdata.nasa.gov/home), but a redesigned portal is not what invented this possibility. NASA was already documenting geostationary imagery in its [2019 Worldview guide](https://earthdata.nasa.gov/s3fs-public/imported/2019_Worldview_4Pager_RevNov2019.pdf). The important development is the availability of frequently updated imagery through documented, reusable services. That is what lets a small independent tool do useful work without scraping a website.

## A complete picture, with honest gaps in time

A satellite mosaic is not one photograph taken everywhere at once. Different satellites cover different regions, at different times and viewing angles. Visible-light products have a night side. Daily products have swath boundaries. Polar coverage is a particular challenge.

A black wedge in a texture is an implementation problem for the artist using it. Pretending that every filled pixel is a fresh observation would be a different, more serious problem.

Earth uses the newest available selected imagery first, dated recent observations underneath it, and a clearly labelled static illustration beneath the remaining gaps. The local history is bounded to seven days. Source masks remove known dark fill, and feathered transitions reduce the hard edges between coverage areas. Conservative colour gains match daily imagery to valid GOES daylight overlaps, without forcing different cloud patterns into a false match. The polar background combines relief and bathymetry with [NASA’s archived Blue Marble cloud composite](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-2181/). That cloud map is from the 2002 collection, not today. A broad polar transition is applied once to the finished observation stack, so overlapping swaths cannot accumulate into a sharp dark edge. This is illustrative fill, not current polar weather or current sea ice.

Daylight mode uses the sun position at each GOES observation time to soften away the night contribution and reveal the enabled fallback layers. The alternative retains the observed GeoColor day/night appearance. Both are composites; neither is a simultaneous daylight photograph of the entire world.

The age guide makes those compromises inspectable. Turn it on in either preview and see which source dominates a location, its product date, or whether the visible geography is static. Metadata travels separately from the image so the texture can remain clean without losing its provenance.

The goal is visual continuity and clear disclosure together. A static patch should never acquire a fresh timestamp just because the surrounding map was regenerated.

## Why an API, rather than another walled garden

I work across applications. The planet should not need a different bespoke integration for each one.

An equirectangular image has a familiar two-to-one shape and maps naturally onto a sphere. JPEG and PNG can be consumed by an enormous range of software. An HTTP API lets the caller describe the view with a few choices:

```text
/v1/image?width=4096&layers=modis,viirs,goes-west,goes-east&appearance=daylight&gap_fill=recent&max_age_hours=168&basemap=blue-marble&format=png
```

The same service exposes `/v1/metadata` for observation times and provenance, and `/v1/latest/master` for the default master image. Consumers can pin a generation when they need a repeatable output.

TouchDesigner can use a file bridge or an HTTP request that updates a texture. Blender can reload the resulting image into a material. Notch can reload it through a Dynamic Image Loader. The same pattern extends to Unity, Unreal Engine, a Three.js website, a projection-mapping system or a video-production workflow that reads a periodically refreshed image. These are integration patterns, not a claim that every application has the same native URL support.

The supplied bridge keeps a stable local file and retains the last valid image when a request fails. That matters in an installation: a network hiccup should not turn a planet into a missing-media warning.

## Keep the infrastructure proportionate

An image that changes every few minutes does not need a request every animation frame. One producer checks the upstream services; viewers share the results. Requests are spaced, cached and budgeted. Rate-limit responses trigger a cooldown. Activity pauses when the site is idle.

The prototype works from a 4096-pixel-wide source grid. Larger exports are available, but increasing the dimensions does not create additional satellite detail. “Near real time” also needs qualification: GOES products may have a ten-minute cadence, while delivery can lag and the fallback imagery can be days old. A static background has no observation age at all.

That is why the dates are part of the product, rather than a footnote hidden behind the picture.

## Where it stands

Earth is currently a local working prototype, being prepared for **earth.matteocurcio.com**. The public API is not launched yet. Source-specific redistribution, attribution and caching terms remain part of the commercial launch review. I would rather state those limits than pretend that a compelling preview is already a production service.

The reason for building it is already settled. We have one planet. Making it easier to see, understand and include in our work feels like a worthwhile use of these skills. It will not substitute for emissions cuts or political accountability. It can make the subject a little harder to push out of frame.

If you use the project and want to help keep it alive, [buy me a coffee](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=matteo.curcio%40gmail.com&item_name=Keep%20Earth%20alive). That supports my work and the project’s running costs; it is separate from the IPCC and is not a climate-charity donation.
