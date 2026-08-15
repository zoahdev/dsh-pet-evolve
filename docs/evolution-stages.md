# Evolution stages

The pet evolves through five stages as the agent accumulates verified XP:

| Stage | Min XP | Theme |
| --- | --- | --- |
| Egg | 0 | speckled shell, cracks at the top |
| Baby | 300 | round blob with ears |
| Teen | 800 | ears + tail, faster bounce |
| Adult | 1600 | crown, calm presence |
| Legend | 3000 | aura + wings |

## XP events

| Event | XP | Source |
| --- | --- | --- |
| `rule_verified` | 25 | dsh-rule-evolve rule library |
| `session_completed` | 10 | completed DSH session |
| `tool_call` | 1 (capped 100/refresh) | session tool events |
| `compaction` | 5 | compaction summaries |
| `day_streak` | 50 | reserved |
| `manual_feed` / `manual_play` | 2 / 3 | local interaction |
| `focus_complete` | 5 | completed focus-timer session |
| `evolution_round` | 5 | dsh-rule-evolve EVOLUTION.md round |

Levels: 1 level per 100 XP. Stage transitions are irreversible forward-only.
