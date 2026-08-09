---
title: "A Browser Teleprompter for Production Work"
date: "2026-06-11"
excerpt: "A local-network teleprompter designed for production work, where an iPad in the glass and an iPhone remote stay in sync without depending on the cloud."
description: "Designing a LAN teleprompter around production reliability: content-based synchronisation, independent displays, approval, eyeline behaviour, script management, and no internet dependency."
cover: "/images/coding/teleprompter.png"
coverAlt: "Sanitized teleprompter interface concept showing display, remote, library and device controls"
tags:
  - "Tools"
  - "Product Design"
  - "Local Network"
  - "Production"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Teleprompter software is either a five-figure hardware ecosystem or a phone app that mirrors text and hopes. The middle ground — a reliable prompter running on hardware you already own, controlled from a second device, with a script library that isn't a text field — barely exists.

The specific shape I needed: a Mac holding the scripts, an iPad in the teleprompter glass, an iPhone in someone's hand as the remote. Nothing depending on the internet, because the internet is the thing that fails on location.

So the first design principles got written down and then defended:

> 1. **Local first** — no cloud services; internet optional, local server mandatory.
> 2. **Content-based synchronization** — devices sync to content position, never pixels.
> 3. **Independent displays** — different font sizes, margins, mirroring, screen sizes, all synchronized to the same script point.
> 4. **Reliability first** — prompting reliability over features.

The excluded list is longer than the included one, and deliberately so: no Google Docs, no cloud sync, no native apps, no accounts, no subscriptions, no speech tracking, no AI features, no recording. Every one of those is a thing that can fail while someone is standing in front of a camera.

## Never share pixels

This is the product decision the whole system rests on, and it matters more than the specific tools used to implement it.

The obvious way to sync two prompter displays is to share a scroll position. It works perfectly until the two displays differ in any way at all — and they always do. The iPad in the glass runs 60pt text with wide margins because the talent needs it. The Mac shows the same script at 18pt to fit the operator's window. "Scrolled 1,400 pixels" means two completely different places in the script.

So pixels are never transmitted:

```ts
characterOffset: number  // integer UTF-16 index into content, range 0..content.length
```

- **Pixel positions are never shared between devices.**
- Progress is derived **for UI display only**: `progress = characterOffset / content.length`
- Progress is never transmitted over WebSocket.

A character index means the same thing on every device regardless of typography. Each display converts it into its own pixel position using its own layout. Progress percentage is banned from the wire for the same reason a float is a lossy way to address a specific word — it exists only to draw a progress bar.

## The eyeline

A prompter has one meaningful position on screen: where the presenter's eyes rest. Not the top of the viewport, not the centre — a fixed line, usually about a third down, chosen so the read looks like eye contact with the lens.

Once that exists, it has to be defined precisely or the whole sync model is ambiguous:

```ts
eyelinePosition: number  // fraction of viewport height from top
                         // range 0.20–0.50, default 0.33, per-device
```

**`characterOffset` always means: the character currently aligned to the eyeline.**
Not top of viewport, not centre, not raw scroll position.

It's per-device, because the iPad in the glass and the operator's laptop want different ones. And it forces a consequence that's easy to miss until you hit it:

```ts
topPadding    = eyelinePosition * viewportHeight;
bottomPadding = (1 - eyelinePosition) * viewportHeight;
```

Without that padding, the first character can never *reach* the eyeline — it starts at the top of the container, a third of a screen above where it needs to be. And the last line can't reach it either without scrolling off the bottom of the display. Two computed paddings, and jump-to-top and jump-to-end both land correctly.

## Reading speed, from the script itself

Prompter speed is set in words per minute, because that's how humans think about reading. The scroll engine needs characters per second. Converting between them requires knowing something about the script, so the server computes metrics once and every client uses the same numbers:

```ts
charactersPerSecond =
  (readingSpeedWpm / 60) * script.metrics.averageCharactersPerWord;
```

Deriving average characters per word from the actual script — rather than assuming the standard five — matters because scripts aren't uniform. Technical copy full of long nouns runs slower per word than conversational dialogue. Using the real average means 140 WPM is 140 WPM in both.

The metrics function is small enough that its tests read as a specification:

```ts
it("averageCharactersPerWord = characterCount / wordCount", () => {
  const m = computeMetrics("Hello world");
  expect(m.averageCharactersPerWord).toBeCloseTo(11 / 2);
});

it("handles empty content without dividing by zero", () => {
  const m = computeMetrics("");
  expect(m.wordCount).toBe(0);
  expect(m.averageCharactersPerWord).toBe(0);
  expect(m.charactersPerSecondAt100Wpm).toBe(0);
});
```

The empty-content case is the one that matters in practice. A new script starts empty, and a division by zero at that moment produces `NaN` characters per second, which propagates into a scroll position of `NaN`, which renders as a blank display with no error.

## Drift correction without clock sync

Clients animate locally at 60fps — they have to, because a position update every few hundred milliseconds would look like stuttering rather than scrolling. But local animation drifts from the server's canonical position, so the two have to be reconciled continuously:

- Server broadcasts canonical `session-state` every **5 seconds**.
- While playing, the server's canonical offset is itself extrapolated with the same formula (`lastEventOffset + cps × elapsed`) — never a stale value.
- Clients treat received state as true **at the moment of receipt**. No clock synchronization. No NTP-style correction.
- Correction: error **< 200 characters** → ease over **500 ms**; error **≥ 200 characters** → snap immediately.

The refusal to synchronise clocks is the elegant part. Full clock sync is a genuinely hard problem, and on a LAN with sub-millisecond latency it would buy nothing. Treating a received state as true *on arrival* is accurate to within the network delay, which is far below the threshold at which anyone reading could perceive an error.

The two-tier correction is the other half. Small errors ease over half a second, invisible to the presenter. Large errors — the ones produced by someone jumping to a new position, or a display reconnecting after a dropout — snap. Easing a 5,000-character correction would send the text flying past at an unreadable speed for several seconds; snapping is instantly correct and looks intentional.

The rendering constraints are stated as requirements rather than suggestions, because on iPad Safari the difference is visible:

- Scrolling: `transform: translateY(...)` — **never** `scrollTop` animation.
- Animation: `requestAnimationFrame`.
- Required hint: `will-change: transform;`

`scrollTop` animation is laid out and painted on the main thread; a transform can be composited on the GPU. At prompter speeds the first one judders.

## Devices identify themselves and wait to be approved

The server tracks devices as first-class objects with persistent identity:

```ts
type Device = {
  id: string;
  name: string;
  role: "display" | "remote" | "editor" | "admin";
  connected: boolean;
  approved: boolean;
  lastSeenAt: string;
  settings: DeviceSettings;
};
```

Each device generates an ID into `localStorage` that survives page refresh, browser restart, WebSocket reconnect and server restart. That last one is the demanding case — an iPad in the glass should rejoin with its font size, margins, mirroring and eyeline intact after the Mac restarts, without anyone touching it.

New connections identify and then wait:

```ts
function handleEvent(client: Client, event: ClientEvent): void {
  if (event.type === "identify") {
    const device = devices.ensureDevice(
      event.deviceId, event.name, event.role, client.isLocalhost
    );
    client.deviceId = device.id;
    devices.registerConnection(device.id);

    if (!device.approved) {
      sendTo(client.ws, { type: "approval-required", deviceId: device.id, name: device.name });
      broadcastDeviceList();
```

The `isLocalhost` flag is how the Mac running the server trusts itself without a prompt. Everything else on the network has to be approved from the admin device — which matters, because a prompter server on a venue's shared wifi is otherwise controllable by anyone who guesses the address. Approval is the whole security model, and on a LAN with a known device list, it's proportionate.

The JSON parse is wrapped because a malformed frame should be an error message, not a crashed server mid-take:

```ts
ws.on("message", (raw) => {
  let event: ClientEvent;
  try {
    event = JSON.parse(raw.toString());
  } catch {
    sendTo(ws, { type: "error", message: "Invalid JSON" });
    return;
  }
  handleEvent(client, event);
});
```

## Where it stands

The stack is less important than the shape: a local server, browser-based displays, persistent scripts, approved devices, and DOCX import so a script can arrive as the Word file it usually is.

The spec is at revision 0.4, marked *Frozen Development Baseline*, and the revision history is mostly things being pinned down rather than added: WPM conversion, character-based sync, eyeline padding, device approval, and drift thresholds.

The protocol and the server are tested; the interface is still moving. It runs entirely on a local network, which is the whole design goal — nothing to log into, nothing to lose when the venue wifi drops.
