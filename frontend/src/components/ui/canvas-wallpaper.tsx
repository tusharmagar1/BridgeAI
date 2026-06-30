import { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { cn } from '@/lib/utils'

// Helper to convert any hex or rgb color to rgba with specific alpha
const toRGBA = (color: string, alpha: number) => {
  if (!color) return `rgba(0, 0, 0, ${alpha})`
  const trimmed = color.trim()
  
  if (trimmed.startsWith('rgb')) {
    return trimmed.replace(/rgb(a)?\(([^)]+)\)/, (_, __, rgb) => {
      const parts = rgb.split(',').map((p: string) => p.trim())
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`
    })
  }
  
  let hex = trimmed.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(s => s + s).join('')
  }
  const r = parseInt(hex.slice(0, 2), 16) || 0
  const g = parseInt(hex.slice(2, 4), 16) || 0
  const b = parseInt(hex.slice(4, 6), 16) || 0
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function CanvasWallpaper() {
  const { themeCustomizer, theme } = useSettingsStore()
  const wallpaper = themeCustomizer?.customWallpaper || 'solar-flare'
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const isDarkTheme = theme === 'dark'
  const primaryColor = themeCustomizer?.primaryColor || (isDarkTheme ? '#ffffff' : '#000000')
  const secondaryColor = themeCustomizer?.secondaryColor || (isDarkTheme ? '#a1a1aa' : '#52525b')

  // Keep colors in refs so the animation loop can access them without re-triggering the useEffect
  const primaryColorRef = useRef(primaryColor)
  const secondaryColorRef = useRef(secondaryColor)

  useEffect(() => {
    primaryColorRef.current = primaryColor
    secondaryColorRef.current = secondaryColor
  }, [primaryColor, secondaryColor])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    const isDark = theme === 'dark'

    // --- SETUP VARIABLES FOR WALLPAPERS ---

    // 1. Foggy Serenity
    const fogBlobs: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = []
    for (let i = 0; i < 5; i++) {
      fogBlobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 250 + 250
      })
    }

    // 2. Glacial Fracture
    const shards: Array<{
      x: number; y: number; vx: number; vy: number;
      angle: number; spin: number; size: number;
      points: Array<{ x: number; y: number }>
    }> = []
    for (let i = 0; i < 18; i++) {
      const size = Math.random() * 50 + 30
      shards.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.004,
        size,
        points: [
          { x: -size / 2, y: -size / 2 },
          { x: size / 2, y: -size / 3 },
          { x: size / 3, y: size / 2 },
          { x: -size / 3, y: size / 3 }
        ]
      })
    }

    // 4. Neon Gridline
    const gridSpeed = 0.05

    // 5. Industrial Grit
    const metalShadows: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = []
    for (let i = 0; i < 4; i++) {
      metalShadows.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 350 + 250
      })
    }

    // 6. Aurora Bloom
    const auroraWaves = [
      { y: height * 0.35, length: 0.002, amplitude: 60, speed: 0.0004 },
      { y: height * 0.45, length: 0.0015, amplitude: 80, speed: -0.0003 },
      { y: height * 0.55, length: 0.001, amplitude: 100, speed: 0.0002 }
    ]

    // 7. Crystal Flow
    const crystals: Array<{
      x: number; y: number; vx: number; vy: number;
      angle: number; spin: number; size: number;
      facets: Array<Array<{x: number; y: number}>>
    }> = []
    for (let i = 0; i < 12; i++) {
      const size = Math.random() * 60 + 40
      const facets = [
        [{ x: 0, y: -size/2 }, { x: size/3, y: size/6 }, { x: -size/3, y: size/6 }],
        [{ x: 0, y: -size/2 }, { x: size/3, y: size/6 }, { x: 0, y: size/3 }],
        [{ x: 0, y: -size/2 }, { x: -size/3, y: size/6 }, { x: 0, y: size/3 }]
      ]
      crystals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.003,
        size,
        facets
      })
    }

    // 8. Particle Galaxy
    const stars: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = []
    const starCount = Math.min(80, Math.floor((width * height) / 15000))
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 1
      })
    }

    // 9. Silk Motion
    const silkBands = 4

    // 10. Liquid Aurora
    const blobs: Array<{ x: number; y: number; vx: number; vy: number; r: number; colorType: 'p' | 's' }> = []
    for (let i = 0; i < 6; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 120 + 130,
        colorType: i % 2 === 0 ? 'p' : 's'
      })
    }

    const draw = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (document.hidden || prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)
      const time = Date.now()

      // Read dynamic colors from refs
      const pColor = primaryColorRef.current
      const sColor = secondaryColorRef.current

      // 1. FOGGY SERENITY
      if (wallpaper === 'foggy-serenity') {
        for (let i = 0; i < fogBlobs.length; i++) {
          const b = fogBlobs[i]
          b.x += b.vx
          b.y += b.vy

          if (b.x - b.radius > width) b.x = -b.radius
          if (b.x + b.radius < 0) b.x = width + b.radius
          if (b.y - b.radius > height) b.y = -b.radius
          if (b.y + b.radius < 0) b.y = height + b.radius

          const color = i % 2 === 0 ? pColor : sColor
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius)
          grad.addColorStop(0, toRGBA(color, isDark ? 0.16 : 0.24))
          grad.addColorStop(0.5, toRGBA(color, isDark ? 0.05 : 0.09))
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
          ctx.fill()
        }
      } 
      // 2. GLACIAL FRACTURE
      else if (wallpaper === 'glacial-fracture') {
        for (let i = 0; i < shards.length; i++) {
          const s = shards[i]
          s.x += s.vx
          s.y += s.vy
          s.angle += s.spin

          if (s.x < -s.size) s.x = width + s.size
          if (s.x > width + s.size) s.x = -s.size
          if (s.y < -s.size) s.y = height + s.size
          if (s.y > height + s.size) s.y = -s.size

          ctx.save()
          ctx.translate(s.x, s.y)
          ctx.rotate(s.angle)
          
          ctx.beginPath()
          ctx.moveTo(s.points[0].x, s.points[0].y)
          for (let j = 1; j < s.points.length; j++) {
            ctx.lineTo(s.points[j].x, s.points[j].y)
          }
          ctx.closePath()

          const grad = ctx.createLinearGradient(-s.size / 2, -s.size / 2, s.size / 2, s.size / 2)
          grad.addColorStop(0, toRGBA(pColor, isDark ? 0.08 : 0.14))
          grad.addColorStop(1, toRGBA(sColor, isDark ? 0.02 : 0.04))
          
          ctx.fillStyle = grad
          ctx.strokeStyle = toRGBA(sColor, isDark ? 0.22 : 0.35)
          ctx.lineWidth = 1
          
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
      } 
      // 3. SOLAR FLARE
      else if (wallpaper === 'solar-flare') {
        const pulse = Math.sin(time * 0.001) * 35
        const glowGrad = ctx.createRadialGradient(
          width * 0.75, 
          height * 0.25, 
          0, 
          width * 0.75, 
          height * 0.25, 
          250 + pulse
        )
        glowGrad.addColorStop(0, toRGBA(sColor, isDark ? 0.22 : 0.32))
        glowGrad.addColorStop(0.5, toRGBA(pColor, isDark ? 0.06 : 0.12))
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        
        ctx.fillStyle = glowGrad
        ctx.fillRect(0, 0, width, height)

        ctx.strokeStyle = toRGBA(sColor, isDark ? 0.16 : 0.26)
        ctx.lineWidth = 1.5
        for (let w = 0; w < 3; w++) {
          ctx.beginPath()
          for (let x = 0; x <= width; x += 15) {
            const waveY = height - 120 - w * 40 +
              Math.sin(x * 0.0015 + time * 0.0008 + w * 2) * 25 +
              Math.cos(x * 0.003 - time * 0.0004) * 15
            if (x === 0) ctx.moveTo(x, waveY)
            else ctx.lineTo(x, waveY)
          }
          ctx.stroke()
        }
      } 
      // 4. NEON GRIDLINE
      else if (wallpaper === 'neon-gridline') {
        const horizon = height * 0.55

        const horizonGlow = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 20)
        horizonGlow.addColorStop(0, 'rgba(0, 0, 0, 0)')
        horizonGlow.addColorStop(0.5, toRGBA(sColor, isDark ? 0.14 : 0.22))
        horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = horizonGlow
        ctx.fillRect(0, horizon - 50, width, 70)

        const gridGrad = ctx.createLinearGradient(0, horizon, 0, height)
        gridGrad.addColorStop(0, toRGBA(pColor, 0.0))
        gridGrad.addColorStop(0.2, toRGBA(pColor, isDark ? 0.18 : 0.28))
        gridGrad.addColorStop(1, toRGBA(sColor, isDark ? 0.48 : 0.68))
        ctx.strokeStyle = gridGrad
        ctx.lineWidth = 1.2

        const lines = 24
        for (let i = 0; i <= lines; i++) {
          const xPos = (width / lines) * i
          ctx.beginPath()
          ctx.moveTo(width / 2, horizon)
          ctx.lineTo(xPos, height)
          ctx.stroke()
        }

        const offset = (time * gridSpeed) % 40
        for (let i = 0; i < 12; i++) {
          const ratio = i / 12
          const y = horizon + (height - horizon) * Math.pow(ratio, 2) + offset * (i / 12)
          if (y > height) continue
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
      } 
      // 5. INDUSTRIAL GRIT
      else if (wallpaper === 'industrial-grit') {
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.012)'
        ctx.lineWidth = 1
        for (let y = 0; y < height; y += 5) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        for (let i = 0; i < metalShadows.length; i++) {
          const s = metalShadows[i]
          s.x += s.vx
          s.y += s.vy

          if (s.x - s.radius > width) s.x = -s.radius
          if (s.x + s.radius < 0) s.x = width + s.radius
          if (s.y - s.radius > height) s.y = -s.radius
          if (s.y + s.radius < 0) s.y = height + s.radius

          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius)
          if (isDark) {
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.22)')
            grad.addColorStop(0.5, toRGBA(pColor, 0.04))
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          } else {
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.45)')
            grad.addColorStop(0.5, toRGBA(pColor, 0.04))
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
          }

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // 6. AURORA BLOOM
      else if (wallpaper === 'aurora-bloom') {
        ctx.globalCompositeOperation = 'screen'
        auroraWaves.forEach((w, idx) => {
          const grad = ctx.createLinearGradient(0, 0, width, 0)
          grad.addColorStop(0, toRGBA(pColor, 0))
          grad.addColorStop(0.3, toRGBA(idx % 2 === 0 ? pColor : sColor, isDark ? 0.15 : 0.22))
          grad.addColorStop(0.7, toRGBA(idx % 2 === 0 ? sColor : pColor, isDark ? 0.15 : 0.22))
          grad.addColorStop(1, toRGBA(sColor, 0))
          
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(0, height)
          for (let x = 0; x <= width; x += 10) {
            const y = w.y + Math.sin(x * w.length + time * w.speed) * w.amplitude + Math.cos(x * 0.002 - time * 0.0001) * 20
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fill()
        })
        ctx.globalCompositeOperation = 'source-over'
      }
      // 7. CRYSTAL FLOW
      else if (wallpaper === 'crystal-flow') {
        crystals.forEach(c => {
          c.x += c.vx
          c.y += c.vy
          c.angle += c.spin

          if (c.x < -c.size) c.x = width + c.size
          if (c.x > width + c.size) c.x = -c.size
          if (c.y < -c.size) c.y = height + c.size
          if (c.y > height + c.size) c.y = -c.size

          ctx.save()
          ctx.translate(c.x, c.y)
          ctx.rotate(c.angle)

          c.facets.forEach((f, fIdx) => {
            ctx.beginPath()
            ctx.moveTo(f[0].x, f[0].y)
            ctx.lineTo(f[1].x, f[1].y)
            ctx.lineTo(f[2].x, f[2].y)
            ctx.closePath()

            const grad = ctx.createLinearGradient(0, -c.size/2, 0, c.size/2)
            if (fIdx === 0) {
              grad.addColorStop(0, toRGBA(pColor, isDark ? 0.12 : 0.18))
              grad.addColorStop(1, toRGBA(sColor, isDark ? 0.03 : 0.06))
            } else if (fIdx === 1) {
              grad.addColorStop(0, toRGBA(sColor, isDark ? 0.10 : 0.15))
              grad.addColorStop(1, toRGBA(pColor, isDark ? 0.02 : 0.04))
            } else {
              grad.addColorStop(0, toRGBA(pColor, isDark ? 0.06 : 0.10))
              grad.addColorStop(1, 'rgba(255, 255, 255, 0.01)')
            }
            ctx.fillStyle = grad
            ctx.strokeStyle = toRGBA(sColor, isDark ? 0.15 : 0.28)
            ctx.lineWidth = 0.8
            ctx.fill()
            ctx.stroke()
          })
          ctx.restore()
        })
      }
      // 8. PARTICLE GALAXY
      else if (wallpaper === 'particle-galaxy') {
        stars.forEach(s => {
          s.x += s.vx
          s.y += s.vy

          if (s.x < 0) s.x = width
          if (s.x > width) s.x = 0
          if (s.y < 0) s.y = height
          if (s.y > height) s.y = 0

          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fillStyle = toRGBA(pColor, isDark ? 0.6 : 0.8)
          ctx.fill()
        })

        ctx.lineWidth = 0.5
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x
            const dy = stars[i].y - stars[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 110) {
              const alpha = (1 - dist / 110) * (isDark ? 0.15 : 0.25)
              ctx.strokeStyle = toRGBA(sColor, alpha)
              ctx.beginPath()
              ctx.moveTo(stars[i].x, stars[i].y)
              ctx.lineTo(stars[j].x, stars[j].y)
              ctx.stroke()
            }
          }
        }
      }
      // 9. SILK MOTION
      else if (wallpaper === 'silk-motion') {
        ctx.globalCompositeOperation = 'screen'
        for (let i = 0; i < silkBands; i++) {
          const grad = ctx.createLinearGradient(0, 0, width, height)
          grad.addColorStop(0, toRGBA(pColor, isDark ? 0.08 : 0.12))
          grad.addColorStop(0.5, toRGBA(sColor, isDark ? 0.05 : 0.08))
          grad.addColorStop(1, toRGBA(pColor, 0))

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(0, height)
          for (let x = 0; x <= width; x += 15) {
            const y = height * 0.4 + (i * 45) +
              Math.sin(x * 0.001 + time * 0.0003 + i) * 70 +
              Math.cos(x * 0.002 - time * 0.0001) * 30
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }
      // 10. LIQUID AURORA
      else if (wallpaper === 'liquid-aurora') {
        blobs.forEach(b => {
          b.x += b.vx
          b.y += b.vy

          if (b.x - b.r > width) b.x = -b.r
          if (b.x + b.r < 0) b.x = width + b.r
          if (b.y - b.r > height) b.y = -b.r
          if (b.y + b.r < 0) b.y = height + b.r

          const color = b.colorType === 'p' ? pColor : sColor
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
          grad.addColorStop(0, toRGBA(color, isDark ? 0.20 : 0.28))
          grad.addColorStop(0.6, toRGBA(color, isDark ? 0.06 : 0.10))
          grad.addColorStop(1, 'rgba(0,0,0,0)')

          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [wallpaper, theme])

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none w-full h-full select-none bg-[var(--color-surface-secondary)]">
      <canvas 
        ref={canvasRef} 
        className={cn(
          "absolute inset-0 w-full h-full transition-all duration-1000",
          wallpaper === 'foggy-serenity' && "[filter:blur(30px)] opacity-100",
          wallpaper === 'glacial-fracture' && "opacity-100",
          wallpaper === 'solar-flare' && "[filter:blur(10px)] opacity-100",
          wallpaper === 'neon-gridline' && "opacity-100",
          wallpaper === 'industrial-grit' && "opacity-100",
          wallpaper === 'aurora-bloom' && "[filter:blur(20px)] opacity-100",
          wallpaper === 'crystal-flow' && "opacity-100",
          wallpaper === 'particle-galaxy' && "opacity-100",
          wallpaper === 'silk-motion' && "[filter:blur(15px)] opacity-100",
          wallpaper === 'liquid-aurora' && "[filter:blur(35px)] opacity-100"
        )} 
      />
    </div>
  )
}
