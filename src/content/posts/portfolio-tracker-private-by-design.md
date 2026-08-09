---
title: "Portfolio Tracker, Private by Design"
date: "2026-06-02"
excerpt: "A private holdings tracker for stocks and ETFs, designed around local data, controlled exports, live quotes, and the simple rule that personal finances should not end up in a repository."
description: "Designing a browser-first portfolio tracker: local storage for private holdings, a small quote-fetching layer, and a data model shaped around privacy before features."
cover: "/images/coding/portfolio.png"
coverAlt: "Portfolio tracker interface with market value cards, allocation panel and transaction tables"
tags:
  - "Tools"
  - "Product Design"
  - "Privacy"
  - "Privacy"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Every portfolio tracker wants an account. That's the business model — you hand over your holdings, they hand back a dashboard, and your position in every stock you own is now a row in someone else's database. For a spreadsheet's worth of functionality that's a bad trade, and it's a trade you can't reverse once you've made it.

I wanted the dashboard without the account. Transactions in, holdings and unrealised gain out, live prices when there's a connection, and nothing about my finances leaving the machine.

The product shape is intentionally small: a browser interface, local storage, import and export, and one server-side layer whose only job is to fetch live prices without exposing an API key or turning the app into an account-based service.

I was less interested in making a finance app than in deciding what the app should refuse to do. No account. No hosted portfolio database. No sync by default. No place where private holdings quietly become infrastructure I have to trust later.

## The privacy model comes first

The interesting design decision here is that the data has nowhere to go.

Transactions live in browser storage. Export and import are JSON files you handle yourself. There is no sync, no account, no server that ever sees a holding. And the repository is configured so that a moment of carelessness doesn't undo it:

> Portfolio data is personal, so it is **not** in this repo — `.gitignore` excludes `portfolio-*.json`. Transactions live in browser storage and are exported and imported as JSON from the app itself. If you fork this, keep it that way: once real holdings land in git history they're very hard to remove.

That last sentence is the whole point. Git doesn't forget. A JSON file with your positions committed once and deleted in the next commit is still in the history, still in every clone, and still on GitHub after you push the deletion. Getting it out means rewriting history and force-pushing, and if anyone has forked or the repo was ever public, it means assuming it's gone regardless.

So the export filename pattern and the gitignore rule were written before the feature that produces the files. It's a five-line precaution that's worth more than any amount of careful behaviour later.

## Getting past CORS without a proxy

Live quotes need a price source, and price sources don't send CORS headers. The browser refuses the request. The usual workarounds are all bad: a public CORS proxy (which now sees every symbol you look up, and disappears without notice), a paid API with a key you'd have to embed in a client-side file, or giving up on live prices.

A small server-side quote layer solves it cleanly. Server-side fetches have no CORS restriction, and the response can be served from the same origin as the app:

```js
const YF = "https://query1.finance.yahoo.com/v8/finance/chart/";
const CACHE_SECONDS = 60; // be gentle on Yahoo; quotes are fine 1 min stale

async function getQuote(symbol) {
  const url = YF + encodeURIComponent(symbol) + "?interval=1d&range=1d";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" },
    cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
  });
  if (!res.ok) throw new Error("yahoo " + res.status);
  const j = await res.json();
  const m = j?.chart?.result?.[0]?.meta;
  const price = m?.regularMarketPrice ?? m?.previousClose;
  if (typeof price !== "number" || !isFinite(price)) throw new Error("no price");
  return { symbol, price, currency: m.currency || null, time: m.regularMarketTime || null };
}
```

Two details there matter more than they look. The `cf: { cacheTtl }` option pushes caching to Cloudflare's edge rather than doing it in the Worker, so repeated lookups of the same symbol across sessions don't re-hit the upstream at all. And `regularMarketPrice ?? previousClose` is the fallback that keeps the app useful outside market hours — an ETF at 3am has no regular market price, and showing yesterday's close is far better than showing an error.

The `isFinite` check exists because the failure mode without it is worse than an exception. A malformed response can yield `NaN`, `NaN` propagates silently through every downstream calculation, and you end up with a portfolio page reporting `NaN` for total value with no indication of which symbol caused it.

## Quote refreshes without making the whole tool fragile

Refreshing a portfolio means asking for every symbol at once. The important behaviour is not the implementation language; it is the failure model. One bad ticker should not make the whole portfolio blank.

```js
const multi = searchParams.get("symbols");
if (multi) {
  const syms = multi.split(",").map(s => s.trim()).filter(Boolean).slice(0, 50);
  const quotes = {};
  await Promise.all(syms.map(async s => {
    try { quotes[s] = await getQuote(s); }
    catch (e) { quotes[s] = { symbol: s, error: String(e.message || e) }; }
  }));
  return json({ quotes });
}
```

The endpoint therefore fails per symbol rather than per refresh. A delisted or temporarily unavailable ticker comes back as an error in its own slot, the app can show a stale price for that row, and everything else updates normally.

The batch is capped as a matter of product hygiene. Even a private tool should have limits at its edges.

The response is locked to the app's own origin:

```js
headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://portfolio.matteocurcio.com",
  "Cache-Control": "public, max-age=" + CACHE_SECONDS,
}
```

An open `*` would have turned a private tool into a public quote API attached to my Cloudflare account.

## What it computes

Transactions are the source of truth — buys and sells per ticker, with fees. Everything else derives: holdings, average cost, market value, unrealised gain and loss. Nothing is stored that can be calculated, which means there's no state to get out of sync when you correct a transaction you entered wrong three weeks ago.

The interface is a sortable holdings table, a transaction table, an allocation doughnut, and dark and light themes. Every number is monospaced, one accent colour means active or selected, and a separate danger colour is reserved for losses and destructive actions — so red always means the same thing whether it's a negative return or a delete button.

## The shape of it

The parts that could have been a service are a static file and a 70-line Worker. The part that would have been a database is your own machine.

That's the decision worth taking from this one: *where does this data live* is a design question you answer first, not a feature you bolt on once the thing works.
