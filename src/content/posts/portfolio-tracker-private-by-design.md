---
title: "Portfolio Tracker, Private by Design"
date: "2026-06-02"
excerpt: "A private holdings tracker for stocks and ETFs, designed around local data, controlled exports, live quotes, and the simple rule that personal finances should not end up in a repository."
description: "Designing a browser-first portfolio tracker around privacy, refusal, readable financial state, and an implementation model where AI helped turn the product brief into a working tool."
cover: "/images/coding/portfolio.png"
coverAlt: "Portfolio tracker interface with market value cards, allocation panel and transaction tables"
tags:
  - "Tools"
  - "Product Design"
  - "Privacy"
  - "UX Architecture"
topic: "tools"
draft: false
writingKind: "technical"
---

## The problem

Every portfolio tracker wants an account. That's the business model: you hand over your holdings, they hand back a dashboard, and your position in every stock you own is now a row in someone else's database. For a spreadsheet's worth of functionality that's a bad trade, and it's a trade you can't reverse once you've made it.

I wanted the dashboard without the account. Transactions in, holdings and unrealised gain out, live prices when there's a connection, and nothing about my finances leaving the machine.

The product shape is intentionally small: a browser interface, local storage, import and export, and one server-side layer whose only job is to fetch live prices without turning the app into an account-based service.

I was less interested in making a finance app than in deciding what the app should refuse to do. No account. No hosted portfolio database. No sync by default. No place where private holdings quietly become infrastructure I have to trust later.

That was my main role in the project: not pretending to be a finance-platform engineer, but defining the product boundaries, the privacy model, the interaction flow, and the failure cases clearly enough that AI-assisted implementation could stay inside the right rails.

## The privacy model comes first

The interesting design decision here is that the data has nowhere to go.

Transactions live in browser storage. Export and import are JSON files you handle yourself. There is no sync, no account, no server that ever sees a holding. And the repository is configured so that a moment of carelessness doesn't undo it:

> Portfolio data is personal, so it is **not** in this repo: `.gitignore` excludes `portfolio-*.json`. Transactions live in browser storage and are exported and imported as JSON from the app itself. If you fork this, keep it that way: once real holdings land in git history they're very hard to remove.

That last sentence is the whole point. Git doesn't forget. A JSON file with your positions committed once and deleted in the next commit is still in the history, still in every clone, and still on GitHub after you push the deletion. Getting it out means rewriting history and force-pushing, and if anyone has forked or the repo was ever public, it means assuming it's gone regardless.

So the export filename pattern and the gitignore rule were written before the feature that produces the files. It's a five-line precaution that's worth more than any amount of careful behaviour later.

## Live prices without changing the privacy contract

Live quotes are useful, but they are also where a private tool can quietly become something else. A tracker that sends every holding to a third-party dashboard has already lost the plot. So the question was not just "how do I get prices?" It was "how do I add prices without changing the trust model?"

The answer is a very small quote layer. The browser can ask for current prices, but the holdings still live locally. There is no hosted portfolio, no account, and no central database of positions. The app only needs enough server-side behaviour to avoid exposing an API key or depending on a random public proxy.

The UX requirement shaped the architecture more than the code did. A refresh should feel calm: current prices where available, stale but readable values where a symbol fails, and no dramatic collapse because one ticker is unavailable after hours. A bad row should be a row-level problem, not a whole-dashboard problem.

That is also where AI was useful. I could describe the intended failure model, "fetch these symbols, cache politely, fail individually, never turn one bad response into `NaN` across the whole interface", then inspect the implementation against that behaviour. The important human decision was the product rule: the dashboard should degrade locally and visibly, not fail globally and mysteriously.

## What it computes

Transactions are the source of truth: buys and sells per ticker, with fees. Everything else derives: holdings, average cost, market value, unrealised gain and loss. Nothing is stored that can be calculated, which means there's no state to get out of sync when you correct a transaction you entered wrong three weeks ago.

The interface is a sortable holdings table, a transaction table, an allocation doughnut, and dark and light themes. Every number is monospaced, one accent colour means active or selected, and a separate danger colour is reserved for losses and destructive actions, so red always means the same thing whether it's a negative return or a delete button.

That sounds cosmetic until you use the thing. Financial interfaces can become noisy very quickly. If every percentage, gain, loss, button, tag and warning fights for attention, you stop reading the state of the portfolio and start decoding the interface. The design system is intentionally restrained so the actual question stays visible: what do I own, what changed, and what needs attention?

## The shape of it

The parts that could have been a service are intentionally small. The part that would have been a database is your own machine.

That's the decision worth taking from this one: *where does this data live* is a design question you answer first, not a feature you bolt on once the thing works.
