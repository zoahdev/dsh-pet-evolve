/**
 * Real-signal adapter: reads a DSH profile's session logs and a rule library
 * (dsh-rule-evolve style) to drive the pet's XP and agent state.
 *
 * Everything is read-only and local. If a path is missing, the adapter
 * degrades to zeros instead of throwing - the pet must never crash the agent.
 *
 * @module dsh-pet-evolve/adapter
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export function defaultPaths(profileDir) {
  return {
    sessionsDir: join(profileDir, 'sessions'),
    ruleDir: join(profileDir, 'rules'),
    evolutionFile: join(profileDir, 'EVOLUTION.md'),
  }
}

function listFiles(dir) {
  try {
    return readdirSync(dir).filter(name => name.endsWith('.jsonl') || name.endsWith('.md'))
  } catch {
    return []
  }
}

function readTail(file, maxBytes = 512 * 1024) {
  try {
    const stat = statSync(file)
    const size = Math.min(stat.size, maxBytes)
    const fd = readFileSync(file)
    const start = fd.length - size
    return fd.subarray(Math.max(0, start)).toString('utf8')
  } catch {
    return ''
  }
}

function classifyLine(line) {
  try {
    const event = JSON.parse(line)
    const type = typeof event.type === 'string' ? event.type : ''
    if (type === 'turn/start' || type === 'step/start') return 'working'
    if (type === 'turn/end' || type === 'step/end') return 'done'
    if (type === 'tool/call' || type === 'tool-call') return 'working'
    if (type === 'turn/error' || type === 'step/error' || type === 'session/error') return 'failed'
    if (type === 'compaction/summary' || type === 'compaction/start') return 'idle'
  } catch {
    // Non-JSON tail bytes are ignored.
  }
  return null
}

export function readSessionState(profileDir, paths = defaultPaths(profileDir)) {
  const files = listFiles(paths.sessionsDir).filter(name => name.endsWith('.jsonl'))
  let state = 'idle'
  let toolCalls = 0
  let sessionsCompleted = 0
  let compactions = 0
  for (const name of files) {
    const text = readTail(join(paths.sessionsDir, name))
    let sessionDone = false
    for (const line of text.split(/\r?\n/u)) {
      if (line.trim() === '') continue
      const kind = classifyLine(line)
      if (kind !== null) state = kind
      if (kind === 'done') sessionDone = true
      if (line.includes('"tool/call"') || line.includes('"tool-call"')) toolCalls += 1
      if (line.includes('"compaction/summary"')) compactions += 1
    }
    if (sessionDone) sessionsCompleted += 1
  }
  return { agentState: state, toolCalls, sessionsCompleted, compactions }
}

export function readRuleStats(ruleDir) {
  const files = listFiles(ruleDir).filter(name => name.endsWith('.md'))
  let verified = 0
  for (const name of files) {
    try {
      const text = readFileSync(join(ruleDir, name), 'utf8')
      if (/verified\s*:\s*true/i.test(text) || /##\s*Verified/i.test(text)) verified += 1
    } catch {
      // Unreadable rule files are skipped.
    }
  }
  return { rulesVerified: verified, ruleFiles: files.length }
}

/** Count evolution rounds in a dsh-rule-evolve EVOLUTION.md log. */
export function readEvolutionRounds(evolutionFile) {
  try {
    const text = readFileSync(evolutionFile, 'utf8')
    return (text.match(/^#+ Round \d+/gmu) ?? []).length
  } catch {
    return 0
  }
}

export function collectSignals(profileDir, paths = defaultPaths(profileDir)) {
  const session = readSessionState(profileDir, paths)
  const rules = readRuleStats(paths.ruleDir)
  const rounds = readEvolutionRounds(paths.evolutionFile)
  const xpEvents = []
  for (let i = 0; i < rules.rulesVerified; i += 1) xpEvents.push({ type: 'rule_verified' })
  for (let i = 0; i < session.sessionsCompleted; i += 1) xpEvents.push({ type: 'session_completed' })
  if (session.toolCalls > 0) xpEvents.push({ type: 'tool_call', count: session.toolCalls })
  for (let i = 0; i < session.compactions; i += 1) xpEvents.push({ type: 'compaction' })
  for (let i = 0; i < rounds; i += 1) xpEvents.push({ type: 'evolution_round' })
  return {
    ...session,
    ...rules,
    rounds,
    xpEvents,
  }
}
