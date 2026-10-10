---
title: "Walking a Low-Poly Fitzroy"
date: "2026-10-10"
excerpt: "A first-person, low-poly walk through Melbourne's first suburb, built from the City of Yarra's 3D building survey and OpenStreetMap streets, shaped in Blender and running in the browser."
description: "A first-person, low-poly walk through Melbourne's first suburb, built from the City of Yarra's 3D building survey and OpenStreetMap streets, shaped in Blender and running in the browser."
cover: "/images/blog/walking-a-low-poly-fitzroy/fitzroy.png"
coverAlt: "Fitzroy browser walk start screen over a low-poly Brunswick Street scene at dusk"
coverCaption: "The start screen on Brunswick Street. Council building data and OpenStreetMap streets provide the model’s proportions."
ogImage: "/images/blog/walking-a-low-poly-fitzroy/fitzroy.png"
ogImageAlt: "Fitzroy browser walk start screen over a low-poly Brunswick Street scene at dusk"
tags: ["Blender", "three.js", "Open Data"]
draft: false
writingKind: "technical"
---


## The idea

I live in Fitzroy and I walk it most days. At some point I wanted to walk it from my desk as well: not as a photoreal digital twin, but as something closer to a model railway. Plain shapes, the right street widths, the right heights, the right corners. A place you recognise by its proportions rather than its detail.

It also turned into a good excuse to learn a pipeline I had only touched at the edges: real geographic data in, Blender in the middle, a game-like scene in a browser out.

## Real data, not a sketch

The buildings come from the City of Yarra's 3D building survey, published as open data. The streets come from OpenStreetMap. Both arrive in their own coordinate systems and their own idea of what a building is, so the first job was to put them on one origin, in metres, with north pointing the same way.

The streets keep their OpenStreetMap categories, from main roads down to service lanes, footpaths, cycleways and steps. That matters more than it sounds. Category decides the width, the kerb and the surface, and Fitzroy's character is in exactly that contrast between wide arterials and narrow bluestone lanes. The model covers a walkable area of roughly 1.2 by 1.9 kilometres, with named streets retained for navigation.

Blender is where the data becomes a place. Footprints are extruded to their surveyed heights, streets become road, kerb and footpath surfaces, and ground materials come from Poly Haven. The result is exported as a single compressed glTF file that the browser loads in one go.

## A model you can walk into

The scene runs in the browser with three.js. You start on Brunswick Street, facing north, with the street name and heading in the corner.

Movement is deliberately not a game controller. Tapping a direction starts walking and tapping it again doubles the pace, several times over, so crossing the suburb takes moments rather than minutes. Space stops. That works better than holding keys when the point is to look around rather than to aim. You can also fly up for an overview, press R to land, and open a full map to see where you are.

Collision is real, not decorative. The building outlines become wall segments, partitioned for nearby collision checks, so you walk along the footpath and down the lanes rather than through someone's terrace.

The URL keeps your position and heading. Copy it and you can send someone to a specific corner.

## Day and night

Fitzroy is a different place after dark, so N switches between day and night. At night the sky, fog and lighting change together, the fog closes in, and warm lamp light comes on. It is a small touch, but it is the one that makes people stay a little longer.

## Facades, one photo at a time

Low-poly does not have to mean blank. Every wall that faces a street or a lane is its own facade, sized in metres and stored with its position and orientation. There are about thirteen thousand of them, split into 128 metre tiles that load as you approach and unload behind you.

C opens capture mode. I stand in front of a building, select the facade in the model, and attach a photo. The upload carries the facade, the building, my position in the scene and the phone's GPS accuracy, so the photo can be matched to the right wall later. Each facade then moves from untouched, to raw photo, to processed texture. Master textures are prepared at a hundred pixels per metre; the walking view uses lighter versions at 48 pixels per metre.

That turns the project into something slow and pleasant: a walk with a phone, filling in the suburb a few buildings at a time. Capture is gated behind a personal token, so anyone can walk the model but only I can add to it. Buildings can also carry a name and a category, which is how Fitzroy Town Hall gets labelled as a town hall rather than another box.

## The judgement calls

The main one is level of detail. The survey is from 2015, and some of the street has changed since. I would rather have honest proportions with known gaps than invented detail that looks convincing and is wrong. Photos fix that over time, building by building, from the real thing.

The second is weight. The whole model is one compressed file plus small tile files and textures, and only the tiles near you are loaded. It should open on a laptop without a gaming card, and on a phone, where an on-screen stick replaces the keyboard.

## What it does

A walkable low-poly model of Fitzroy in the browser, built from City of Yarra buildings and OpenStreetMap streets in Blender. Tap-to-walk movement with speed steps, fly and land, a full map, street names and a compass heading, and positions you can share by URL. Day and night lighting. Wall collision against the surveyed footprints. Streamed facade tiles with a capture mode for photographing real buildings onto the model, one facade at a time.

Streets © OpenStreetMap contributors. Buildings: City of Yarra 3D buildings (2015), CC BY 4.0. Ground textures: Poly Haven, CC0.


[Start walking through Fitzroy](https://fitzroy.matteocurcio.com/). Building data is available from the [City of Yarra dataset](https://data.gov.au/data/dataset/yarra-3d-buildings); street data is credited to [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
