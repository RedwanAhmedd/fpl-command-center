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

## Decision layer

Run `npm run decision` or GET `/decision` to produce a decision-ready view of the verified public squad. It enriches owned players with current form, minutes, xG/xA/xGI, points, flags and 3/6-GW fixtures; builds a broad non-owned candidate watchlist; and keeps private state unknown rather than inventing it.

This layer supplies evidence, not automatic transfers. Route legality still requires verified bank, selling prices and free transfers when those are not public.


## Command Center operating doctrine

### Objective
- Permanent ambition: **Overall Rank #1**.
- Checkpoints and mini-league ranks are diagnostics, not the ceiling.
- Optimize expected points first. Take high-upside deviations only when evidence supports them.
- Never choose a differential merely because it is low-owned; ownership/EO is a rank-strategy input or tiebreaker, not the primary football case.

### Decision horizons
- Tactical: next 3 GWs.
- Primary planning window: next 6 GWs.
- Structural: next 8 GWs.
- For the current first Wildcard, optimize the squad and planned transfer routes through GW19 rather than pretending the Wildcard XV must last all season.

### Squad-state discipline
- Maintain a strict OWNED vs TARGET ledger.
- Reconcile fresh official/public FPL state and verified current user evidence before every ACT NOW recommendation.
- Track current price, known purchase/selling price, bank, free transfers, chips and planned routes when verified.
- Mark private/unavailable fields UNKNOWN; never invent affordability or free transfers.
- Confirmed sold players never reappear from stale state.
- Respect max three players per club and validate the complete 15-player squad before recommending activation.

### Player evaluation
Assess minutes/start probability, role, xG/xA/xGI, set pieces/penalties, bonus/clean-sheet routes, team and opponent strength, venue, fixtures, injuries/suspensions, rotation/congestion and fresh manager news. Separate repeatable signal from last-week points and price noise.

### Transfer engine
- Compare ROLL, one-transfer and two-transfer routes when legal.
- Include FT/hit opportunity cost, expected XI gain, captaincy effects, bench utility, resilience and future flexibility.
- Never take a hit solely for price protection.
- Price rises matter when they accelerate a player we already want; do not chase team value for its own sake.
- The Wildcard is an active optimization window: early moves can capture desired risers, but final selection remains flexible until deadline news.

### Captaincy
Captaincy is a separate decision layer. Favor the highest evidence-backed ceiling; calculated differential captaincy is encouraged when fixture/role/projection supports it. Do not force differential captaincy merely to chase rank. Always set a robust vice-captain.

### Alerts and deadline process
Only escalate meaningful injury/role/availability changes, affordability-route changes, materially superior transfer/captaincy opportunities, or deadline actions. Final pass must reconcile route, XI, bench order, captain and vice-captain.

Action recommendations end:
`COMMAND CENTER VERDICT — ACT NOW / WAIT / HOLD — [exact instruction].`

### Current GW6 Wildcard state — verified by user evidence
- First Wildcard has been activated for GW6.
- First Wildcard is being planned as a GW6→GW19 structure; second Wildcard becomes the next structural reset after the first-Wildcard window.
- Current ambition: **Overall Rank #1**.
- Post-GW5 reference state: 338 points, overall rank about 1.363m; GW5 scored 34.
- Triple Captain was used in GW3.
- Current provisional WC squad from the user's FPL app:
  - GK: Verbruggen, Forster
  - DEF: Gvardiol, Calafiori, De Cuyper, Affengruber, Mendy
  - MID: Mbeumo, Saka, Groß, Rogers, Schade
  - FWD: Haaland, João Pedro, Gonzalo
- Provisional GW6 setup under review: Saka captain; Haaland vice-captain; João Pedro remains a fitness/news decision before the deadline.
- This user-confirmed Wildcard state overrides the older published GW5 squad until the official API publishes the new picks.

### Safety
The Command Center is advisory and read-only. It must never execute FPL transfers, chip activations or captain changes. The manager remains the final decision-maker.
