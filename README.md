# dsh-pet-evolve

> The pet that **grows with your DeepSeek Harness agent**. Not a static sprite - a living companion that levels up from real agent signals, mirrors your agent's state, and mints shareable growth cards.

Zero dependencies · all data stays on your machine · works standalone or inside DSH.

## Why this is different

Pet galleries show you sprites. This is the opposite: your pet's body is **earned**.

| | petdex / whale-girl style | dsh-pet-evolve |
| --- | --- | --- |
| Sprites | static gallery | 5 evolution stages, drawn live on canvas |
| Agent awareness | none | mirrors working / done / failed / idle from real session events |
| Growth source | nothing | verified rules (dsh-rule-evolve), completed sessions, tool calls, compactions |
| Share | screenshots | one-click 1200×630 growth card PNG |
| Data | varies | 100% local, zero telemetry |

## Quick start

```sh
# standalone (no install)
npx dsh-pet-evolve
# open http://127.0.0.1:4173

# bind real DSH signals from a profile
npx dsh-pet-evolve --profile ~/.dsh/profiles/web

# also count dsh-rule-evolve evolution rounds (+5 XP each)
npx dsh-pet-evolve --profile ~/.dsh/profiles/web --evolution ~/.dsh/profiles/web/EVOLUTION.md

# headless growth report
npx dsh-pet-evolve --report
```

Feed and play with the pet directly; when bound to a profile, it also earns XP from:

- `rule_verified` — rules in the profile rule library (dsh-rule-evolve compatible)
- `session_completed` — finished sessions in the profile
- `tool_call` — tool activity in session logs
- `compaction` — compaction summaries

## DSH plugin mode

```sh
dsh plugin --profile web add github:zoahdev/dsh-pet-evolve
```

The host plugin starts the pet server bound to the profile (port 4173 by default). The `lib/` entry is committed, so no build step is needed at install time.

## Evolution

Egg → Baby → Teen → Adult → Legend. One level per 100 XP; stage thresholds at 300 / 800 / 1600 / 3000. See [docs/evolution-stages.md](./docs/evolution-stages.md).

## Development

```sh
node --test engine adapter   # engine + adapter tests
node scripts/build-check.mjs # artifact integrity
node scripts/pet.mjs         # local pet
```

## Privacy

The pet reads local files only (session logs and rule files you point it at) and never sends anything anywhere. The share card is generated in your browser.

## Roadmap

- [x] Evolution engine + tests
- [x] DSH session/rule adapter + tests
- [x] Canvas pet + interactions + share card
- [x] CLI + zero-dependency server + DSH plugin wrapper
- [x] Multi-pet skins (whale / cat / robot / ghost)
- [x] Focus-timer productivity mode (+5 XP on completion)
- [x] Awesome list entry + marketplace listing (PR #623)
- [ ] Live demo page (waiting on a dedicated demo domain)
- [x] Sync with dsh-rule-evolve evolution logs (+5 XP per round)

## License

MIT
