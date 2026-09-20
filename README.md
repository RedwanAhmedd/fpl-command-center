# FPL Command Center

Read-only FPL state bridge for entry **1169933**. Its first job is boring but critical: establish the real public squad state before any recommendation is made.

## What it does

- Reads official FPL public JSON endpoints.
- Resolves player IDs to current names, prices, flags and news.
- Returns latest published squad, XI/bench, captain/vice, chips and transfer history.
- Exposes upcoming fixtures for downstream analysis.
- Marks information that the public API cannot safely establish as **UNKNOWN** instead of guessing.

## Run

Requires Node 20+.

```bash
npm test
npm run snapshot
npm start
# GET http://localhost:3000/snapshot
```

## Source-of-truth rule

1. Fresh official FPL public API state
2. Confirmed transaction/current user evidence for private or not-yet-published state
3. Older stored ledger
4. Never silently resurrect a sold player from an old prompt

The public API does **not** expose every authenticated `my-team` field. In particular, live free-transfer state is returned as `UNKNOWN_PUBLIC_API` unless a future authenticated adapter is deliberately added. No FPL password/session cookie belongs in this repository.

## Safety

Read-only. No credentials. No transfers. No captain changes. No guessing.
