import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { collectSignals, readEvolutionRounds, readSessionState, readRuleStats } from './dsh-state.js'

function tempProfile() {
  return mkdtempSync(join(tmpdir(), 'dsh-pet-evolve-'))
}

test('readSessionState detects a working turn from the latest event', () => {
  const dir = tempProfile()
  try {
    const sessions = join(dir, 'sessions')
    mkdirSync(sessions, { recursive: true })
    writeFileSync(
      join(sessions, 'a.jsonl'),
      [
        JSON.stringify({ type: 'turn/start', turn: 1 }),
        JSON.stringify({ type: 'tool/call', name: 'bash' }),
      ].join('\n'),
    )
    const state = readSessionState(dir)
    assert.equal(state.agentState, 'working')
    assert.equal(state.toolCalls, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('readSessionState counts completed sessions and compactions', () => {
  const dir = tempProfile()
  try {
    const sessions = join(dir, 'sessions')
    mkdirSync(sessions, { recursive: true })
    writeFileSync(
      join(sessions, 'a.jsonl'),
      [
        JSON.stringify({ type: 'turn/start' }),
        JSON.stringify({ type: 'tool/call', name: 'bash' }),
        JSON.stringify({ type: 'compaction/summary' }),
        JSON.stringify({ type: 'turn/end' }),
      ].join('\n'),
    )
    const state = readSessionState(dir)
    assert.equal(state.agentState, 'done')
    assert.equal(state.sessionsCompleted, 1)
    assert.equal(state.compactions, 1)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('readRuleStats counts verified rule files', () => {
  const dir = tempProfile()
  try {
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'one.md'), '---\nname: one\nverified: true\n---\n')
    writeFileSync(join(dir, 'two.md'), '---\nname: two\nverified: false\n---\n')
    const stats = readRuleStats(dir)
    assert.equal(stats.rulesVerified, 1)
    assert.equal(stats.ruleFiles, 2)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('collectSignals degrades to zeros when paths are missing', () => {
  const dir = tempProfile()
  try {
    const signals = collectSignals(dir)
    assert.equal(signals.agentState, 'idle')
    assert.equal(signals.toolCalls, 0)
    assert.equal(signals.rulesVerified, 0)
    assert.deepEqual(signals.xpEvents, [])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('readEvolutionRounds counts Round headings in an EVOLUTION.md', () => {
  const dir = tempProfile()
  try {
    writeFileSync(
      join(dir, 'EVOLUTION.md'),
      '# Round 1\n- New rules: 3\n- Verified: yes\n\n## Round 2\n- New rules: 2\n- Verified: yes\n',
    )
    assert.equal(readEvolutionRounds(join(dir, 'EVOLUTION.md')), 2)
    assert.equal(readEvolutionRounds(join(dir, 'missing.md')), 0)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
