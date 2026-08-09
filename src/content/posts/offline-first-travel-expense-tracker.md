---
title: "An Offline-First Travel Expense Tracker"
date: "2026-06-04"
excerpt: "A travel expense tracker designed around the reality of travelling: no signal, quick entry, local-first logging, cached rates, GPS capture, and sync that waits its turn."
description: "Designing an offline-first travel expense tracker: local-first data, recoverable sync, location capture, rate caching, and a model shaped around actual travel behaviour."
cover: "/images/coding/travel.png"
coverAlt: "Travel tracker log view showing a Bangkok trip total in three currencies, a trip-wide flight and per-night accommodation splits"
tags:
  - "Tools"
  - "Product Design"
  - "PWA"
  - "Offline"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Every expense app assumes a connection. Which is a strange assumption for one you use while travelling, because travelling is precisely where you don't have one — you're in a market in Bangkok with no roaming, or on a train through the Apennines, or in the one part of the hotel where the wifi doesn't reach. And expense logging only works if you do it *at the moment of spending*. Anything you defer to the evening is a guess, and anything you defer to the next day is fiction.

So the design constraint came first: everything has to work with the network entirely absent. Not degrade gracefully — work. Logging, editing, viewing, GPS capture, reports. Sync is a bonus that happens later, not a prerequisite.

## Local first means the user never waits for the network

The architectural decision is simple: the local device is the source of the immediate experience. The remote database is downstream of that, not something the user has to wait for while standing at a counter.

```js
// ════════════════════════════════════════════════════════════════
//  Local-first data layer.
//  Everything writes to IndexedDB FIRST (instant, works offline).
//  A dirty flag marks rows that still need to reach Supabase.
//  sync.js drains the queue whenever we're online.
// ════════════════════════════════════════════════════════════════

const dbp = openDB(DB, VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("projects")) {
      const p = db.createObjectStore("projects", { keyPath: "id" });
      p.createIndex("dirty", "_dirty");
    }
    if (!db.objectStoreNames.contains("expenses")) {
      const e = db.createObjectStore("expenses", { keyPath: "id" });
      e.createIndex("project_id", "project_id");
      e.createIndex("dirty", "_dirty");
    }
    if (!db.objectStoreNames.contains("meta")) {
      db.createObjectStore("meta", { keyPath: "k" });
    }
  }
});
```

The sync model follows from that product decision. A row that has not reached the server is marked as needing sync, and the app clears that flag only after the remote copy catches up.

This matters because travel logging is interruption-heavy. You open the app, enter a coffee, lose signal, get distracted, lock the phone. The architecture has to assume that half-finished moments are normal, not exceptional.

Writes stamp the flag and a timestamp together:

```js
export async function putProject(proj, { dirty = true } = {}) {
  const db = await dbp;
  const row = { ...proj, updated_at: now(), _dirty: dirty ? 1 : 0, _deleted: proj._deleted ? 1 : 0 };
  await db.put("projects", row);
  return row;
}
```

Server-originated rows come back in as already clean. Without that distinction, every pull would generate a push and two devices would keep handing the same change back to each other.

## Deletes, and the one that would have been a disaster

Deletion in a synced system can't be deletion. If a row simply disappears locally, the next pull from the server brings it straight back, because the server has no idea anything happened. So deletes are tombstones — the row stays, flagged `_deleted`, and the flag propagates.

The hard case is deleting a *project* that contains two hundred expenses:

```js
export async function deleteProject(id) {
  const db = await dbp;
  const existing = await db.get("projects", id);
  if (existing) await db.put("projects", { ...existing, _deleted: 1, _dirty: 1, updated_at: now() });
  // Soft-delete this project's expenses LOCALLY only (_dirty: 0) so we don't
  // push a flood of expense tombstones to the server. The project tombstone
  // is what propagates; other devices hide the expenses because the project
  // is gone. This prevents a single project delete from mass-deleting
  // expense rows server-side.
  const exps = await db.getAllFromIndex("expenses", "project_id", id);
  const tx = db.transaction("expenses", "readwrite");
  for (const e of exps) tx.store.put({ ...e, _deleted: 1, _dirty: 0, updated_at: now() });
  await tx.done;
}
```

The asymmetry is deliberate and it's the most consequential line of the file. The project tombstone is dirty and propagates. The two hundred expense tombstones are *not* dirty — they're local-only.

If they were dirty, deleting one trip on a phone with a flaky connection would queue two hundred and one writes, and the first thing it would do on reconnect is race through them mass-deleting expense rows server-side. Any partial failure leaves the server in a state no device agrees with. Instead, one tombstone travels, and other devices hide those expenses because the project they belong to is gone. The expense rows stay on the server, inert, recoverable if the delete turns out to have been a mistake.

## GPS doesn't need a signal

GPS is a receive-only satellite system. It has nothing to do with your data connection. A phone in airplane mode in a foreign country still knows exactly where it is.

So every transaction captures coordinates at the moment you log it, offline, reliably. What *doesn't* work offline is turning those coordinates into a place name — reverse geocoding is an API call. So the coordinates are the stored truth and the name is a cached decoration, resolved when there's a connection and overridable by hand when the automatic answer is wrong.

The map tab draws every pinned expense, and pins can be dragged to correct erratic GPS — the sort you get in a dense city or a covered market. Dragging re-resolves the place name from the corrected position rather than keeping a name that no longer matches the pin.

## Exchange rates, cached by day

Multi-currency is unavoidable on a trip. You enter in the local currency and want AUD and EUR everywhere. That needs rates, and rates need a network, so they get the same treatment as everything else — fetch when possible, cache aggressively, never block:

```js
// Auto-refresh exchange rates (local currency → AUD, EUR) from the
// free Frankfurter ECB API. Minor intra-trip drift is acceptable.
// Rates are cached per-currency for the day to avoid redundant calls.
async function refreshRates() {
  if (!isOnline()) return;
  try {
    const projects = (await getProjects()).filter((p) => !p._deleted);
    const currencies = [...new Set(projects.map((p) => p.local).filter(Boolean))];
    const today = new Date().toISOString().slice(0, 10);
    for (const base of currencies) {
      const cacheKey = `rates:${base}:${today}`;
      let rates = await getMeta(cacheKey);
      if (!rates) {
        rates = await fetchRates(base);
        if (!rates) continue;
        await setMeta(cacheKey, rates);
      }
      // ...
    }
  } catch (e) {
    console.warn("rate refresh failed", e);
  }
}
```

The cache key includes the date, so the expiry logic is just the key changing at midnight — no TTL arithmetic, no stale-check. And the comment is doing honest work: **minor intra-trip drift is acceptable**. This is a travel budget, not a settlement system. Chasing the mid-market rate to four decimals would cost network calls and complexity to produce a number that's still wrong, because the rate you actually got was whatever your card issuer decided.

The whole function is wrapped so a rate failure warns and moves on. Nothing about logging an expense should depend on a currency API being up.

## What it does

Projects are trips — BKK 2026, Italy 2026 — with their own local currency and locked rates, and dates that may overlap because travel days belong to both. Expenses come in three shapes: a single spend, a *stay* that auto-splits its cost across the nights, and a *trip-wide* cost like flights that counts toward the total but is excluded from daily averages. That last distinction is the one that makes the per-day number mean anything.

Reports give trip total, per-day average with and without accommodation, per-category bars, a per-day breakdown, and CSV export.

It installs to the iPhone home screen as a PWA, and viewed map areas stay cached, so the map still works in the market with no signal.
