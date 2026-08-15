/**
 * dsh-pet-evolve evolution engine.
 *
 * Pure functions only: XP ledger, level/stage computation, and stage traits.
 * The pet grows from real agent signals (verified rules, completed sessions,
 * tool calls, compactions) - no randomness, no hidden state.
 *
 * @module dsh-pet-evolve/engine
 */

export const STAGES = [
  { id: 'egg', name: 'Egg', nameZh: '蛋', minXp: 0, color: '#f4d9c0' },
  { id: 'baby', name: 'Baby', nameZh: '幼崽', minXp: 300, color: '#ffd166' },
  { id: 'teen', name: 'Teen', nameZh: '少年', minXp: 800, color: '#ef8354' },
  { id: 'adult', name: 'Adult', nameZh: '成年', minXp: 1600, color: '#4f9cf9' },
  { id: 'legend', name: 'Legend', nameZh: '传说', minXp: 3000, color: '#9b5de5' },
]

export const XP_EVENTS = {
  rule_verified: 25,
  session_completed: 10,
  tool_call: 1,
  compaction: 5,
  day_streak: 50,
  manual_feed: 2,
  manual_play: 3,
  focus_complete: 5,
  evolution_round: 5,
}

export const XP_PER_LEVEL = 100

export function levelOf(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function stageOf(xp) {
  let current = STAGES[0]
  for (const stage of STAGES) {
    if (xp >= stage.minXp) current = stage
  }
  return current
}

export function stageIndex(xp) {
  return STAGES.findIndex(stage => stage.id === stageOf(xp).id)
}

export function applyEvent(state, event) {
  if (!event || typeof event.type !== 'string') {
    throw new TypeError('event.type must be a string')
  }
  const gain = XP_EVENTS[event.type]
  if (gain === undefined) {
    throw new TypeError(`unknown XP event type: ${event.type}`)
  }
  const xp = state.xp + gain
  return {
    ...state,
    xp,
    level: levelOf(xp),
    stage: stageOf(xp).id,
    events: [...(state.events ?? []), { ...event, gain, at: Date.now() }],
  }
}

export function initialState() {
  return {
    xp: 0,
    level: 1,
    stage: 'egg',
    events: [],
  }
}

export function nextStageXp(xp) {
  const index = stageIndex(xp)
  const next = STAGES[index + 1]
  return next === undefined ? null : next.minXp
}

export function summarize(state) {
  const stage = stageOf(state.xp)
  const next = nextStageXp(state.xp)
  return {
    xp: state.xp,
    level: levelOf(state.xp),
    stage: stage.id,
    stageName: stage.name,
    stageNameZh: stage.nameZh,
    stageColor: stage.color,
    nextStageXp: next,
    xpToNext: next === null ? 0 : next - state.xp,
    eventCount: (state.events ?? []).length,
  }
}
