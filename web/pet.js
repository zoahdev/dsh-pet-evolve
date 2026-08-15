import { applyEvent, initialState, stageOf, summarize, XP_PER_LEVEL } from '../engine/evolution.js'

const canvas = document.querySelector('#pet')
const ctx = canvas.getContext('2d')
const $ = id => document.querySelector(`#${id}`)

const STORE_KEY = 'dsh-pet-evolve:state'
const FALLBACK_STAGES = {
  egg: { color: '#f4d9c0', name: 'Egg', nameZh: '蛋' },
  baby: { color: '#ffd166', name: 'Baby', nameZh: '幼崽' },
  teen: { color: '#ef8354', name: 'Teen', nameZh: '少年' },
  adult: { color: '#4f9cf9', name: 'Adult', nameZh: '成年' },
  legend: { color: '#9b5de5', name: 'Legend', nameZh: '传说' },
}

let state = load()
let agentState = 'idle'
let rulesVerified = 0
let bounce = 0
let mood = 'idle'
let confetti = []

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch { /* fresh state */ }
  return initialState()
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ xp: state.xp, events: state.events ?? [] }))
}

function addEvent(type) {
  state = applyEvent(state, { type })
  save()
  renderStats()
  mood = type === 'manual_feed' ? 'happy' : 'playful'
  bounce = 14
}

function renderStats() {
  const summary = summarize(state)
  const stage = stageOf(state.xp)
  const next = summary.nextStageXp
  $('stage').textContent = stage.name
  $('level').textContent = summary.level
  $('xp').textContent = summary.xp
  $('rules').textContent = rulesVerified
  $('stateBadge').textContent = agentState
  $('xpFill').style.width = next === null
    ? '100%'
    : `${Math.min(100, (state.xp / next) * 100)}%`
  $('xpHint').textContent = next === null
    ? 'Max stage reached'
    : `${summary.xpToNext} XP to ${FALLBACK_STAGES[stage.id].name}`
}

function draw() {
  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const stage = stageOf(state.xp).id
  const color = FALLBACK_STAGES[stage].color
  const bob = Math.sin(Date.now() / 240) * (agentState === 'working' ? 7 : 3)
  const cx = w / 2
  const cy = h / 2 + bob - bounce

  if (mood === 'sad') {
    drawSad(cx, cy)
  }
  if (stage === 'legend') drawAura(cx, cy)

  ctx.save()
  ctx.translate(cx, cy)
  switch (stage) {
    case 'egg':
      drawEgg(color)
      break
    case 'baby':
      drawBaby(color)
      break
    case 'teen':
      drawTeen(color)
      break
    case 'adult':
      drawAdult(color)
      break
    case 'legend':
      drawLegend(color)
      break
  }
  ctx.restore()

  if (agentState === 'working') drawGear(cx + 90, cy - 90)
  if (mood === 'happy' || agentState === 'done') updateConfetti()
  requestAnimationFrame(draw)
}

function round(x, y, r) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

function drawEgg(color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(0, 20, 52, 66, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#c9a37f'
  round(-18, -8, 5)
  round(14, 6, 4)
  round(-6, 28, 3)
  ctx.strokeStyle = '#8a6a4a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-8, -46)
  ctx.lineTo(-2, -38)
  ctx.lineTo(-10, -30)
  ctx.stroke()
}

function drawBaby(color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(-22, -34, 14, 0, Math.PI * 2)
  ctx.arc(22, -34, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(0, 18, 56, 58, 0, 0, Math.PI * 2)
  ctx.fill()
  drawFace()
}

function drawTeen(color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, -78)
  ctx.lineTo(38, -52)
  ctx.lineTo(26, -26)
  ctx.lineTo(0, -38)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(0, 10, 62, 56, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(52, 18)
  ctx.quadraticCurveTo(86, 26, 70, 56)
  ctx.stroke()
  drawFace()
}

function drawAdult(color) {
  ctx.fillStyle = '#ffd700'
  ctx.beginPath()
  ctx.moveTo(0, -84)
  ctx.lineTo(18, -66)
  ctx.lineTo(38, -78)
  ctx.lineTo(30, -54)
  ctx.lineTo(50, -44)
  ctx.lineTo(26, -42)
  ctx.lineTo(18, -20)
  ctx.lineTo(0, -30)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(0, 16, 64, 58, 0, 0, Math.PI * 2)
  ctx.fill()
  drawFace()
}

function drawLegend(color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(0, 12, 60, 54, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(-66, -12)
  ctx.quadraticCurveTo(-30, -66, 6, -30)
  ctx.quadraticCurveTo(34, -62, 66, -12)
  ctx.quadraticCurveTo(30, 0, 6, 6)
  ctx.quadraticCurveTo(-30, 0, -66, -12)
  ctx.fill()
  drawFace()
}

function drawFace() {
  ctx.fillStyle = '#1c1c28'
  round(-18, -4, 5)
  round(18, -4, 5)
  ctx.strokeStyle = '#1c1c28'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 8, 12, 0.15 * Math.PI, 0.85 * Math.PI)
  ctx.stroke()
}

function drawAura(cx, cy) {
  const t = Date.now() / 900
  ctx.strokeStyle = 'rgba(155, 93, 229, 0.45)'
  ctx.lineWidth = 6
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath()
    ctx.arc(cx, cy, 118 + i * 18 + Math.sin(t + i) * 6, 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawGear(x, y) {
  const t = Date.now() / 200
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(t)
  ctx.fillStyle = '#8b93b8'
  for (let i = 0; i < 8; i += 1) {
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-4, -22, 8, 12)
  }
  ctx.beginPath()
  ctx.arc(0, 0, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSad(cx, cy) {
  ctx.strokeStyle = '#7fd4ff'
  ctx.lineWidth = 3
  for (const dx of [-18, 18]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx - 3, cy - 30)
    ctx.lineTo(cx + dx + 3, cy - 22)
    ctx.stroke()
  }
}

function updateConfetti() {
  if (confetti.length < 30 && Math.random() < 0.35) {
    confetti.push({ x: Math.random() * canvas.width, y: -10, c: `hsl(${Math.random() * 360} 80% 60%)`, v: 2 + Math.random() * 3 })
  }
  ctx.save()
  confetti = confetti.filter(p => p.y < canvas.height)
  for (const p of confetti) {
    p.y += p.v
    p.x += Math.sin(p.y / 12)
    ctx.fillStyle = p.c
    ctx.fillRect(p.x, p.y, 6, 10)
  }
  ctx.restore()
}

function exportShareCard() {
  const card = document.createElement('canvas')
  card.width = 1200
  card.height = 630
  const c = card.getContext('2d')
  c.fillStyle = '#0f1220'
  c.fillRect(0, 0, 1200, 630)
  c.fillStyle = '#1a1f35'
  c.fillRect(0, 470, 1200, 160)
  const summary = summarize(state)
  const stage = stageOf(state.xp)
  c.drawImage(canvas, 420, 40, 360, 360)
  c.fillStyle = '#eef1ff'
  c.font = '700 52px -apple-system, "Segoe UI", sans-serif'
  c.fillText('My agent pet reached', 60, 90)
  c.fillStyle = FALLBACK_STAGES[stage.id].color
  c.fillText(`${stage.name}`, 60, 165)
  c.fillStyle = '#8b93b8'
  c.font = '30px -apple-system, "Segoe UI", sans-serif'
  c.fillText(`Level ${summary.level} · ${summary.xp} XP · ${rulesVerified} rules verified`, 60, 225)
  c.fillText('https://github.com/zoahdev/dsh-pet-evolve', 60, 580)
  const url = card.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'agent-pet-growth.png'
  a.click()
}

async function refreshSignals() {
  try {
    const response = await fetch('/api/state')
    if (!response.ok) return
    const signals = await response.json()
    agentState = signals.agentState ?? 'idle'
    rulesVerified = signals.rulesVerified ?? 0
    let newState = { ...state }
    for (const event of signals.xpEvents ?? []) {
      const count = Math.min(event.count ?? 1, 100)
      for (let i = 0; i < count; i += 1) {
        newState = applyEvent(newState, { type: event.type })
      }
    }
    if (newState.xp !== state.xp) {
      state = newState
      save()
    }
    $('signalNote').textContent = `Bound to DSH profile: ${signals.agentState} · ${signals.toolCalls} tool calls · ${signals.compactions} compactions`
    renderStats()
  } catch {
    // Standalone mode: keep local signals only.
  }
}

document.querySelector('#feed').addEventListener('click', () => addEvent('manual_feed'))
document.querySelector('#play').addEventListener('click', () => addEvent('manual_play'))
document.querySelector('#share').addEventListener('click', exportShareCard)
canvas.addEventListener('click', () => { bounce = 18; mood = 'playful' })

renderStats()
draw()
refreshSignals()
setInterval(refreshSignals, 8000)
