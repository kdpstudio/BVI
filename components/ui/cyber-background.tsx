'use client'

import { useEffect, useRef } from 'react'

export function CyberBackground() {
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
    }
    window.addEventListener('resize', resize)

    // Particles
    const PARTICLE_COUNT = 60
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    // Scan line
    let scanY = 0

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      // Grid
      ctx.strokeStyle = 'rgba(0,200,255,0.03)'
      ctx.lineWidth = 1
      const gridSize = 60
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      // Particles + connections
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,200,255,${p.opacity})`
        ctx.fill()

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,200,255,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      // Scan line
      scanY = (scanY + 0.5) % h
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      scanGrad.addColorStop(0, 'rgba(0,200,255,0)')
      scanGrad.addColorStop(0.5, 'rgba(0,200,255,0.04)')
      scanGrad.addColorStop(1, 'rgba(0,200,255,0)')
      ctx.fillStyle = scanGrad
      ctx.fillRect(0, scanY - 20, w, 40)

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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
