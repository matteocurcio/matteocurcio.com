---
title: "Capture & Craft Workshop: Camera to Post"
date: "2024-04-20"
excerpt: "A condensed reflection on camera-to-post colour pipelines, from scene and sensor mechanics to transforms, skin tones, and delivery stability."
cover: "/images/blog/workshop_slides/capture-craft-007.jpeg"
coverAlt: "Capture & Craft workshop slide"
tags:
  - "Workshop"
  - "Color"
  - "Pipeline"
  - "Post Production"
draft: false
originalUrl: "https://matteocurcio.com/capture-craft-workshop"
---

## Reflections from a Workshop with Hootan Haghshenas, CSI

Recently, Hootan and I ran a workshop titled "From Camera to Post: A Deep Dive into Cinema Cameras and Colour Grading Pipelines."

It was a dense session. Technical. Structural. Occasionally philosophical.

What follows is not the full presentation. It is a condensed reflection on why we structured it the way we did and why I believe understanding the colour pipeline is one of the most empowering shifts a filmmaker or colourist can make.

---

## Why We Started with the Pipeline, Not the Look

![Slide 07 - Pipeline diagram](/images/blog/workshop_slides/capture-craft-007.jpeg)


When people attend a colour workshop, they often expect LUTs, contrast tricks, cinematic grades.

Instead, we started with a diagram.

Scene -> Sensor -> Encoding -> Camera File -> Processing -> Display.

I have learned over the years that most grading frustrations are not aesthetic problems. They are structural ones. If you do not understand where your image sits in that chain, you are effectively grading blind.

Hootan and I wanted to dismantle that ambiguity.

---

## The Scene: Where Colour Actually Begins

![Slide 10 - Scene foundations](/images/blog/workshop_slides/capture-craft-010.jpeg)


We opened with a painting.

Not a camera chart. Not a waveform. A painting.

Because before codecs and gamuts, there is light interacting with matter. Colour does not exist inside objects. It exists in the interpretation of reflected wavelengths by the human visual system.

![Slide 12 - Human visual adaptation](/images/blog/workshop_slides/capture-craft-012.jpeg)


The human eye adapts across roughly 10-14 stops at any given moment. But what fascinates me is not the number. It is the nonlinearity.

Double the light does not look twice as bright.

We compress highlights naturally. We adapt locally. We mentally reconstruct dynamic range by shifting attention between foreground and background.

Cameras do none of this.

The tension between physical light and perceptual light is the entire reason colour science exists.

---

## The Sensor: Brutally Honest

![Slide 16 - Sensor mechanics](/images/blog/workshop_slides/capture-craft-016.jpeg)


Hootan took the room through sensor mechanics.

Sensors are linear devices. They respond proportionally to light intensity.

Mathematically elegant. Creatively unforgiving.

![Slide 17 - Linear response](/images/blog/workshop_slides/capture-craft-017.jpeg)


If you double the photons, you double the signal.

There is no perceptual compression built in. No aesthetic smoothing. Just physics.

We discussed shot noise, dark noise, and signal-to-noise ratio.

![Slide 20 - Saturation and clipping](/images/blog/workshop_slides/capture-craft-020.jpeg)


And then saturation.

Clipped highlights are not a stylistic choice. They are an irreversible loss of information. Once the bucket overflows, the data is gone.

That moment usually shifts the room's posture, because it reframes exposure not as taste, but as engineering.

---

## Why Log Looks "Flat"

![Slide 24 - Log encoding](/images/blog/workshop_slides/capture-craft-024.jpeg)


I often hear: "Why does log look so washed out?"

Because it is doing something intelligent.

We used the 1024 candles analogy. Linear encoding wastes precision in highlights. Log redistributes tonal information more efficiently across stops.

Log is not aesthetic. It is structural compression.

Once people understand that, they stop trying to "fix" log prematurely. They begin respecting it as a container.

---

## Gamma, Gamut, and the Illusion of RGB

![Slide 30 - Color space context](/images/blog/workshop_slides/capture-craft-030.jpeg)


One of the most persistent misconceptions in post-production is that RGB values are absolute.

They are not.

The same numerical coordinates mean entirely different colours depending on the colour space.

White point matters. Gamut matters. Transfer functions matter.

This is where I often see even experienced creatives pause, because it means colour is contextual. There is no universal red. Only red within a defined space.

And if that space is misinterpreted, the entire image shifts.

---

## Scene-Referred vs Display-Referred: The Turning Point

![Slide 37 - Scene vs display referred](/images/blog/workshop_slides/capture-craft-037.jpeg)


This was, for me, the most important section of the workshop.

Display-referred workflows are comfortable, immediate, and visually pleasing out of the gate.

Scene-referred workflows are more demanding. They require trust in transforms.

But scene-referred workflows preserve intent. They allow you to re-target delivery without rebuilding the grade. They maintain fidelity to captured light.

I have increasingly moved toward structured colour management for this reason. It creates stability. And stability liberates creativity.

---

## LUTs Are Not Magic

![Slide 43 - LUTs vs transforms](/images/blog/workshop_slides/capture-craft-043.jpeg)


We spent time clarifying LUTs versus colour space transforms.

A LUT is a lookup table. It approximates.

A CST is a mathematical conversion.

This distinction matters.

I have seen countless images collapse under stacked LUTs applied without understanding the domain in which they operate.

The issue is not LUTs themselves. It is misplaced trust in shortcuts.

---

## Colour Management as Creative Infrastructure

![Slide 48 - Managed workflows](/images/blog/workshop_slides/capture-craft-048.jpeg)


We compared RED IPP2, ARRI Reveal, Resolve Colour Managed, and ACES.

Different systems. Same principle: define your transforms explicitly.

When the pipeline is defined:

- Skin tones behave predictably.
- Highlight rolloff is consistent.
- Multi-format delivery becomes controlled rather than reactive.

Colour management does not remove artistry. It removes instability.

---

## Skin Tones: Where Taste Meets Physics

![Slide 67 - Skin tone control](/images/blog/workshop_slides/capture-craft-067.jpeg)


Skin tone is where colour science becomes human.

Different ethnicities vary in luminance and saturation, but hue alignment sits along a consistent vector.

The goal is not homogenisation. It is coherence.

Evening skin tone is about refinement, not correction. I often remind myself to step back before pushing further. Over-grading erodes authenticity.

---

## Output: The Final Translation

![Slide 75 - Output transforms](/images/blog/workshop_slides/capture-craft-075.jpeg)


The Output Device Transform translates scene values into display constraints.

Rec.709. P3. HDR.

HDR is not simply brighter SDR. It changes how dynamic range is perceived and mapped.

Displays are not neutral endpoints. They interpret electrical signals according to their transfer functions.

If the upstream pipeline is unstable, the display reveals it immediately.

---

## Why This Matters to Me

I have worked across projects where colour drifted between departments, where LUTs were stacked without context, and where highlight rolloff changed unpredictably from one delivery to another.

Almost always, the issue was structural.

This workshop was not about teaching a look.

It was about giving people a mental model.

When you understand the pipeline:

- Log stops feeling wrong.
- LUTs stop feeling magical.
- Exposure becomes intentional.
- Grading becomes layered, not reactive.

And most importantly, creative decisions become deliberate.

That is why Hootan and I framed the session the way we did.

Because colour is not an effect. It is a translation of light through systems. If you respect those systems, the image rewards you.
