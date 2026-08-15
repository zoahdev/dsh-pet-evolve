import test from 'node:test'
import assert from 'node:assert/strict'
import {
  applyEvent,
  initialState,
  levelOf,
  nextStageXp,
  stageOf,
  summarize,
  XP_EVENTS,
} from './evolution.js'

test('initial state is an egg at level 1', () => {
  const state = initialState()
  assert.equal(state.stage, 'egg')
  assert.equal(state.level, 1)
  assert.equal(state.xp, 0)
})

test('rule_verified grants 25 XP and bumps level at 100 XP', () => {
  let state = initialState()
  state = applyEvent(state, { type: 'rule_verified' })
  assert.equal(state.xp, XP_EVENTS.rule_verified)
  assert.equal(state.level, 1)
  for (let i = 0; i < 3; i += 1) state = applyEvent(state, { type: 'rule_verified' })
  assert.equal(state.xp, 100)
  assert.equal(state.level, 2)
})

test('stage transitions happen at documented XP thresholds', () => {
  assert.equal(stageOf(0).id, 'egg')
  assert.equal(stageOf(299).id, 'egg')
  assert.equal(stageOf(300).id, 'baby')
  assert.equal(stageOf(799).id, 'baby')
  assert.equal(stageOf(800).id, 'teen')
  assert.equal(stageOf(1599).id, 'teen')
  assert.equal(stageOf(1600).id, 'adult')
  assert.equal(stageOf(2999).id, 'adult')
  assert.equal(stageOf(3000).id, 'legend')
})

test('nextStageXp reports the next threshold or null at max', () => {
  assert.equal(nextStageXp(0), 300)
  assert.equal(nextStageXp(299), 300)
  assert.equal(nextStageXp(3000), null)
})

test('summarize exposes the share-card fields', () => {
  let state = initialState()
  state = applyEvent(state, { type: 'rule_verified' })
  const summary = summarize(state)
  assert.equal(summary.xp, 25)
  assert.equal(summary.stage, 'egg')
  assert.equal(summary.nextStageXp, 300)
  assert.equal(summary.xpToNext, 275)
  assert.equal(summary.eventCount, 1)
})

test('unknown event types are rejected loudly', () => {
  assert.throws(() => applyEvent(initialState(), { type: 'nope' }), /unknown XP event type/)
})
