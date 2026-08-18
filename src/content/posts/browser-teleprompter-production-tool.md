---
title: "A Browser Teleprompter for Production Work"
date: "2026-06-11"
excerpt: "A local-network teleprompter designed for production work, where an iPad in the glass and an iPhone remote stay in sync without depending on the cloud."
description: "A LAN teleprompter designed around production reliability, synced displays, approval, eyeline behaviour and script control."
cover: "/images/coding/teleprompter.png"
coverAlt: "Sanitized teleprompter interface concept showing display, remote, library and device controls"
tags:
  - "Tools"
  - "Product Design"
  - "Local Network"
  - "Production"
  - "UX Architecture"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Teleprompter software is either a five-figure hardware ecosystem or a phone app that mirrors text and hopes. The middle ground, a reliable prompter running on hardware you already own, controlled from a second device, with a script library that isn't a text field, barely exists.

The specific shape I needed: a Mac holding the scripts, an iPad in the teleprompter glass, an iPhone in someone's hand as the remote. Nothing depending on the internet, because the internet is the thing that fails on location.

So the first design principles got written down and then defended:

> 1. **Local first**: no cloud services; internet optional, local server mandatory.
> 2. **Content-based synchronization**: devices sync to content position, never pixels.
> 3. **Independent displays**: different font sizes, margins, mirroring, screen sizes, all synchronized to the same script point.
> 4. **Reliability first**: prompting reliability over features.

The excluded list is longer than the included one, and deliberately so: no Google Docs, no cloud sync, no native apps, no accounts, no subscriptions, no speech tracking, no AI features, no recording. Every one of those is a thing that can fail while someone is standing in front of a camera.

AI helped turn the specification into working software, but the useful work was defining the operational brief. On a shoot, "mostly works" is not a feature. The product has to be boring in exactly the right ways.

## Never share pixels

This is the product decision the whole system rests on, and it matters more than the specific tools used to implement it.

The obvious way to sync two prompter displays is to share a scroll position. It works perfectly until the two displays differ in any way at all, and they always do. The iPad in the glass runs 60pt text with wide margins because the talent needs it. The Mac shows the same script at 18pt to fit the operator's window. "Scrolled 1,400 pixels" means two completely different places in the script.

So the system syncs to the content, not the screen. The shared state is the current position inside the script. Each device then translates that into its own layout, typography, mirroring, margins, and viewport.

That distinction is the product. It means a remote can control a display without knowing anything about the display. It means an operator can use a compact view while the talent gets a large, readable prompt. It also means progress bars stay decorative: useful for orientation, never trusted as the address of a word.

## The eyeline

A prompter has one meaningful position on screen: where the presenter's eyes rest. Not the top of the viewport, not the centre, a fixed line, usually about a third down, chosen so the read looks like eye contact with the lens.

Once that exists, it has to be defined precisely or the whole sync model is ambiguous. The current script position means: the character currently aligned to the eyeline. Not top of viewport, not centre, not raw scroll position.

It's per-device, because the iPad in the glass and the operator's laptop want different ones. And it forces a consequence that's easy to miss until you hit it:

Without dedicated breathing room above and below the script, the first character can never *reach* the eyeline, it starts at the top of the container, a third of a screen above where it needs to be. And the last line can't reach it either without scrolling off the bottom of the display. The visual rule becomes an architectural rule: the script needs enough padding to let the first and last lines land where a human actually reads.

## Reading speed, from the script itself

Prompter speed is set in words per minute, because that's how humans think about reading. The actual movement has to account for the script itself. A technical script full of long nouns behaves differently from conversational copy, even if both are set to 140 WPM.

So speed is derived from the actual text rather than a generic assumption. Empty scripts are treated as a real state, not a bug. That sounds small, but it matters in the interface: a new script should show as empty and ready, not collapse into a blank display because a calculation produced nonsense before the first word was pasted.

## Drift correction without clock sync

Devices animate locally because a prompter has to feel smooth. If position updates arrive every few hundred milliseconds and the text visibly steps between them, the system is technically synchronized and practically unusable.

The UX rule is simple: small drift should disappear gently, large jumps should correct immediately. If a display is a few words out, ease it back without the presenter noticing. If someone jumps to a new paragraph, or a display reconnects after a dropout, snap to the right place. Easing a huge correction would make the text fly for several seconds; snapping looks intentional.

The same logic guided the rendering behaviour on iPad Safari. Smooth prompting is not an embellishment. It is the job. Anything that made the text judder was treated as a product bug, not an engineering curiosity.

## Devices identify themselves and wait to be approved

Devices are treated as named production objects, not anonymous browser tabs. The iPad in the glass, the iPhone remote, the editor view, and the admin device all have different jobs. They also need to survive refreshes, reconnects, and a server restart without someone having to rebuild the setup while the room waits.

That led to a simple approval model. The Mac running the server can trust itself. Other devices on the network have to be approved before they control anything. On a LAN with a known device list, that is proportionate: enough protection to stop someone on shared venue wifi from poking the prompter, without turning a local production tool into enterprise login theatre.

The debugging philosophy follows the same line. Bad messages, reconnects, empty scripts, and device dropouts should become visible states, not silent crashes. A production tool earns trust by failing in ways the operator can understand.

## Where it stands

The stack is less important than the shape: a local server, browser-based displays, persistent scripts, approved devices, and DOCX import so a script can arrive as the Word file it usually is.

The spec is at revision 0.4, marked *Frozen Development Baseline*, and the revision history is mostly things being pinned down rather than added: WPM conversion, character-based sync, eyeline padding, device approval, and drift thresholds.

The protocol and the server are tested; the interface is still moving. It runs entirely on a local network, which is the whole design goal: nothing to log into, nothing to lose when the venue wifi drops.
