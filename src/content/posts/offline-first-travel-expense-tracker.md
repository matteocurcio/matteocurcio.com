---
title: "An Offline-First Travel Expense Tracker"
date: "2026-06-04"
excerpt: "A travel expense tracker designed around the reality of travelling: no signal, quick entry, local-first logging, cached rates, GPS capture, and sync that waits its turn."
description: "An offline-first travel expense tracker shaped around quick entry, recoverable sync, location memory and cached exchange rates."
cover: "/images/coding/travel.png"
coverAlt: "Travel tracker log view showing a Bangkok trip total in three currencies, a trip-wide flight and per-night accommodation splits"
tags:
  - "Tools"
  - "Product Design"
  - "PWA"
  - "Offline"
  - "UX Architecture"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Every expense app assumes a connection. Which is a strange assumption for one you use while travelling, because travelling is precisely where you don't have one, you're in a market in Bangkok with no roaming, or on a train through the Apennines, or in the one part of the hotel where the wifi doesn't reach. And expense logging only works if you do it *at the moment of spending*. Anything you defer to the evening is a guess, and anything you defer to the next day is fiction.

So the design constraint came first: everything has to work with the network entirely absent. Not degrade gracefully, work. Logging, editing, viewing, GPS capture, reports. Sync is a bonus that happens later, not a prerequisite.

## Local first means the user never waits for the network

The architectural decision is simple: the local device is the source of the immediate experience. The remote database is downstream of that, not something the user has to wait for while standing at a counter.

The sync model follows from that product decision. An entry appears immediately because the phone owns the moment. If the server has not caught up yet, the interface can mark that state quietly and resolve it later.

This matters because travel logging is interruption-heavy. You open the app, enter a coffee, lose signal, get distracted, lock the phone. The architecture has to assume that half-finished moments are normal, not exceptional.

This is where AI-assisted development was useful, but only after the behaviour was clear. The brief was not "make a sync layer." It was "make an interface that never blocks the person at the counter, survives airplane mode, and does not punish partial attention." The code then had something specific to serve.

## Deletes, and the one that would have been a disaster

Deletion in a synced system can't be treated as a casual disappearance. If a row simply vanishes locally, the next pull from the server can bring it straight back, because the server has no idea anything happened. So deletes need to behave more like decisions than erasures.

The hard case is deleting a trip that contains hundreds of expenses. From the user's point of view, that is one action: remove this trip from the app. From the system's point of view, it could become hundreds of remote changes, any one of which can fail halfway through a bad connection.

The product decision was to make the trip deletion the thing that propagates, while the expenses become locally hidden because the trip they belong to is gone. That keeps the action understandable, avoids flooding the sync queue, and leaves the underlying rows recoverable if the delete turns out to have been a mistake.

That is not a clever programming detail so much as a UX safety rail. The interface presents one human action. The architecture makes sure it remains one human action even when the network returns later.

## GPS doesn't need a signal

GPS is a receive-only satellite system. It has nothing to do with your data connection. A phone in airplane mode in a foreign country still knows exactly where it is.

So every transaction captures coordinates at the moment you log it, offline, reliably. What *doesn't* work offline is turning those coordinates into a place name, reverse geocoding is an API call. So the coordinates are the stored truth and the name is a cached decoration, resolved when there's a connection and overridable by hand when the automatic answer is wrong.

The map tab draws every pinned expense, and pins can be dragged to correct erratic GPS, the sort you get in a dense city or a covered market. Dragging re-resolves the place name from the corrected position rather than keeping a name that no longer matches the pin.

## Exchange rates, cached by day

Multi-currency is unavoidable on a trip. You enter in the local currency and want AUD and EUR everywhere. That needs rates, and rates need a network, so they get the same treatment as everything else: fetch when possible, cache by day, never block logging.

The important judgement call is precision. This is a travel budget, not a settlement system. Chasing the mid-market rate to four decimals would add network calls and interface complexity to produce a number that's still not the exact rate your card issuer used. Good enough, cached, and clearly presented is the right product behaviour.

The whole feature is designed so a rate failure is a warning, not a broken app. Nothing about logging an expense should depend on a currency API being up.

## What it does

Projects are trips, BKK 2026, Italy 2026, with their own local currency and locked rates, and dates that may overlap because travel days belong to both. Expenses come in three shapes: a single spend, a *stay* that auto-splits its cost across the nights, and a *trip-wide* cost like flights that counts toward the total but is excluded from daily averages. That last distinction is the one that makes the per-day number mean anything.

Reports give trip total, per-day average with and without accommodation, per-category bars, a per-day breakdown, and CSV export.

It installs to the iPhone home screen as a PWA, and viewed map areas stay cached, so the map still works in the market with no signal.
