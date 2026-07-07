'use client'

import { useEffect, useRef } from 'react'

export function LandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight

    canvas.width = w
    canvas.height = h

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
      initAll()
    }
    window.addEventListener('resize', resize)

    // ── Matrix rain ──────────────────────────────────────────────────────────
    const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ⬡◈▦◎⊡∑∇∞≈≡∫⌬⎔⏣⌚ABCDEF0123456789'
    const COL_W = 18
    let cols: { x: number; drops: number[]; speeds: number[] }[] = []

    function initRain() {
      cols = []
      const numCols = Math.floor(w / COL_W)
      for (let i = 0; i < numCols; i++) {
        const numDrops = Math.floor(Math.random() * 3) + 1
        cols.push({
          x: i * COL_W,
          drops: Array.from({ length: numDrops }, () => Math.random() * -h),
          speeds: Array.from({ length: numDrops }, () => 0.4 + Math.random() * 1.2),
        })
      }
    }

    // ── Circuit traces ────────────────────────────────────────────────────────
    interface Trace {
      x: number; y: number
      dx: number; dy: number
      len: number; maxLen: number
      life: number; maxLife: number
      color: string; width: number
      trail: { x: number; y: number }[]
    }

    const GRID = 40
    const TRACE_COLORS = [
      'rgba(0,200,255,', 'rgba(0,255,136,', 'rgba(123,47,255,',
    ]
    let traces: Trace[] = []

    function newTrace(): Trace {
      const gx = Math.floor(Math.random() * (w / GRID)) * GRID
      const gy = Math.floor(Math.random() * (h / GRID)) * GRID
      const dirs = [[GRID, 0], [-GRID, 0], [0, GRID], [0, -GRID]]
      const [dx, dy] = dirs[Math.floor(Math.random() * 4)]
      const color = TRACE_COLORS[Math.floor(Math.random() * TRACE_COLORS.length)]
      return {
        x: gx, y: gy, dx, dy,
        len: 0, maxLen: (Math.floor(Math.random() * 8) + 4) * GRID,
        life: 0, maxLife: 80 + Math.random() * 60,
        color, width: Math.random() < 0.15 ? 1.5 : 0.5,
        trail: [{ x: gx, y: gy }],
      }
    }

    function initTraces() {
      traces = Array.from({ length: 30 }, newTrace)
    }

    // ── Nodes (intersection pulses) ───────────────────────────────────────────
    interface Node {
      x: number; y: number
      r: number; maxR: number; life: number; color: string
    }
    const nodes: Node[] = []

    function spawnNode(x: number, y: number, color: string) {
      nodes.push({ x, y, r: 0, maxR: 10 + Math.random() * 10, life: 1, color })
    }

    // ── Particles ─────────────────────────────────────────────────────────────
    const PARTICLES = Array.from({ length: 60 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.05,
    }))

    function initAll() {
      initRain()
      initTraces()
    }
    initAll()

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(0,200,255,0.025)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += GRID) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += GRID) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // ── Matrix rain ────────────────────────────────────────────────────────
      ctx.font = `12px 'Share Tech Mono', monospace`
      for (const col of cols) {
        for (let d = 0; d < col.drops.length; d++) {
          const y = col.drops[d]
          const trailLen = 14

          // Draw trail
          for (let t = 0; t < trailLen; t++) {
            const ty = y - t * 16
            if (ty < 0 || ty > h) continue
            const alpha = t === 0 ? 0.9 : (1 - t / trailLen) * 0.15
            const char = CHARS[Math.floor(Math.random() * CHARS.length)]
            if (t === 0) {
              ctx.fillStyle = `rgba(200,255,255,${alpha})`
            } else if (t < 3) {
              ctx.fillStyle = `rgba(0,200,255,${alpha})`
            } else {
              ctx.fillStyle = `rgba(0,200,255,${alpha * 0.5})`
            }
            ctx.fillText(char, col.x, ty)
          }

          col.drops[d] += col.speeds[d] * 16
          if (col.drops[d] > h + 50) col.drops[d] = -Math.random() * h * 0.5
        }
      }

      // ── Circuit traces ─────────────────────────────────────────────────────
      for (let i = traces.length - 1; i >= 0; i--) {
        const t = traces[i]
        t.life++

        const progress = t.life / t.maxLife
        const alpha = progress < 0.2 ? progress / 0.2 : progress > 0.7 ? (1 - progress) / 0.3 : 1

        // Advance position
        if (t.len < t.maxLen) {
          const step = 2
          t.x += t.dx > 0 ? step : t.dx < 0 ? -step : 0
          t.y += t.dy > 0 ? step : t.dy < 0 ? -step : 0
          t.len += step
          t.trail.push({ x: t.x, y: t.y })

          // Occasionally change direction
          if (t.len % GRID === 0 && Math.random() < 0.35) {
            const dirs = [[GRID, 0], [-GRID, 0], [0, GRID], [0, -GRID]]
            const [ndx, ndy] = dirs[Math.floor(Math.random() * dirs.length)]
            t.dx = ndx; t.dy = ndy

            // Spawn node at turn
            if (Math.random() < 0.4) spawnNode(t.x, t.y, t.color)
          }

          // Wrap
          if (t.x < 0) t.x = 0
          if (t.x > w) t.x = w
          if (t.y < 0) t.y = 0
          if (t.y > h) t.y = h
        }

        // Draw trace trail
        if (t.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(t.trail[0].x, t.trail[0].y)
          for (const pt of t.trail) ctx.lineTo(pt.x, pt.y)
          ctx.strokeStyle = `${t.color}${(alpha * 0.6).toFixed(2)})`
          ctx.lineWidth = t.width
          ctx.stroke()

          // Bright head
          ctx.beginPath()
          ctx.arc(t.x, t.y, t.width + 1, 0, Math.PI * 2)
          ctx.fillStyle = `${t.color}${Math.min(alpha * 0.9, 0.8).toFixed(2)})`
          ctx.fill()
        }

        if (t.life > t.maxLife) traces[i] = newTrace()
      }

      // Spawn more traces
      if (frame % 8 === 0 && traces.length < 50) traces.push(newTrace())

      // ── Node pulses ────────────────────────────────────────────────────────
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        n.r += 0.4
        n.life -= 0.025
        if (n.life <= 0) { nodes.splice(i, 1); continue }

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.strokeStyle = `${n.color}${(n.life * 0.5).toFixed(2)})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // ── Particles ──────────────────────────────────────────────────────────
      for (let i = 0; i < PARTICLES.length; i++) {
        const p = PARTICLES[i]
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,200,255,${p.opacity})`
        ctx.fill()

        for (let j = i + 1; j < PARTICLES.length; j++) {
          const q = PARTICLES[j]
          const dx = q.x - p.x, dy = q.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(0,200,255,${0.05 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // ── Scan line ──────────────────────────────────────────────────────────
      const scanY = (frame * 0.4) % h
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
      grad.addColorStop(0, 'rgba(0,200,255,0)')
      grad.addColorStop(0.5, 'rgba(0,200,255,0.03)')
      grad.addColorStop(1, 'rgba(0,200,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 30, w, 60)

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.55 }}
    />
  )
}
