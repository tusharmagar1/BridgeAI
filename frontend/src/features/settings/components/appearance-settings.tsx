import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settings-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  Sparkles, Palette, Layers, Eye, Gauge, Columns, LayoutGrid, Type, 
  Paintbrush, Compass, Wallpaper, Save, RefreshCw, Download, Upload, Check,
  Sunset, Shield, Waves, Landmark, Anchor, Sailboat, Cloud, EyeOff, Sparkle, RefreshCwIcon,
  Sun, Moon, Trash2, Star, Sliders, Accessibility
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { hexToHSL, hslToHex } from '@/lib/color-generator'

const fonts = {
  sans: ['Inter', 'Geist', 'Manrope', 'Outfit', 'DM Sans', 'Plus Jakarta Sans', 'General Sans', 'Satoshi', 'Poppins', 'Urbanist', 'Nunito Sans', 'Work Sans', 'IBM Plex Sans', 'Public Sans', 'Source Sans 3', 'Rubik', 'Mulish', 'Onest', 'Cabinet Grotesk', 'Space Grotesk'],
  serif: ['Merriweather', 'Lora', 'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville', 'Crimson Pro', 'Bitter', 'Source Serif 4', 'Noto Serif', 'EB Garamond'],
  mono: ['JetBrains Mono', 'Fira Code', 'IBM Plex Mono', 'Cascadia Code', 'Source Code Pro', 'Victor Mono', 'Space Mono', 'Ubuntu Mono', 'Inconsolata', 'Roboto Mono'],
  display: ['Syne', 'Sora', 'Clash Display', 'Fraunces', 'Archivo Black', 'Bricolage Grotesque', 'Unbounded', 'Lexend', 'Exo 2', 'Righteous']
}

interface HueWheelProps {
  value: string
  onChange: (hex: string) => void
  size?: number
  label: string
  isDark: boolean
}

function HueWheel({ value, onChange, size = 130, label, isDark }: HueWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDragging = useRef(false)

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const r = w / 2 - 8
    const innerR = r * 0.65

    ctx.clearRect(0, 0, w, h)

    // Draw HSL Hue Ring
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 0.5) * Math.PI / 180
      const endAngle = (angle + 1.5) * Math.PI / 180
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = `hsl(${angle}, 100%, 50%)`
      ctx.fill()
    }

    // Clear center
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'

    // Draw Grayscale Center Target
    ctx.beginPath()
    ctx.arc(cx, cy, 12, 0, Math.PI * 2)
    const centerGrad = ctx.createLinearGradient(cx - 8, cy - 8, cx + 8, cy + 8)
    centerGrad.addColorStop(0, '#000000')
    centerGrad.addColorStop(1, '#ffffff')
    ctx.fillStyle = centerGrad
    ctx.strokeStyle = isDark ? '#3f3f46' : '#e4e4e7'
    ctx.lineWidth = 1.5
    ctx.fill()
    ctx.stroke()

    // Determine indicator position
    const hsl = hexToHSL(value)
    const valClean = value.toLowerCase()
    const isMonochrome = valClean === '#ffffff' || valClean === '#000000' || valClean === '#fff' || valClean === '#000' || valClean === '#a1a1aa' || valClean === '#52525b'
    
    let ix = cx
    let iy = cy

    if (!isMonochrome) {
      const angleRad = (hsl.h * Math.PI) / 180
      const ringR = (r + innerR) / 2
      ix = cx + Math.cos(angleRad) * ringR
      iy = cy + Math.sin(angleRad) * ringR
    }

    // Draw indicator dot
    ctx.beginPath()
    ctx.arc(ix, iy, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
    ctx.shadowBlur = 3
    ctx.fill()

    ctx.beginPath()
    ctx.arc(ix, iy, 5, 0, Math.PI * 2)
    ctx.fillStyle = value
    ctx.shadowBlur = 0
    ctx.fill()
  }

  useEffect(() => {
    draw()
  }, [value, isDark])

  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    const distance = Math.sqrt(x * x + y * y)
    const maxR = rect.width / 2

    if (distance < maxR * 0.3) {
      // Select monochrome
      onChange(isDark ? '#ffffff' : '#000000')
      return
    }

    let angle = Math.atan2(y, x) * (180 / Math.PI)
    if (angle < 0) angle += 360
    const hue = Math.round(angle)
    const hex = hslToHex(hue, 100, 50)
    onChange(hex)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = true
    canvasRef.current?.setPointerCapture(e.pointerId)
    handlePointer(e.clientX, e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return
    handlePointer(e.clientX, e.clientY)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDragging.current = false
    canvasRef.current?.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="flex flex-col items-center gap-1.5 select-none animate-fade-in">
      <span className="text-[11px] font-extrabold text-[var(--color-text-secondary)]">{label}</span>
      <div className="relative p-1 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-subtle)] shadow-xs hover:scale-[1.02] transition-transform duration-300">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="cursor-crosshair touch-none"
        />
      </div>
      <span className="text-[9px] font-mono font-bold bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 rounded border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
        {value.toUpperCase()}
      </span>
    </div>
  )
}

interface PreviewProps {
  primary: string
  secondary: string
  isDark: boolean
  customWallpaper?: string
}

function LiveThemePreview({ primary, secondary, isDark, customWallpaper }: PreviewProps) {
  return (
    <div 
      className={cn(
        "w-full rounded-2xl p-3 border border-[var(--color-border-default)] shadow-inner transition-all duration-500 flex flex-col gap-2.5 h-[380px] relative overflow-hidden",
        isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
      )}
    >
      {/* Background Wallpaper in Live Preview */}
      {customWallpaper && (
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-normal pointer-events-none">
          <MiniCanvasWallpaper type={customWallpaper} />
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full gap-2.5">
        <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Live Preview</span>
        
        <div className="flex-1 border border-[var(--color-border-subtle)] rounded-xl overflow-hidden flex bg-[var(--color-surface-primary)]/85 backdrop-blur-md shadow-xs">
          {/* Sidebar */}
          <div 
            className={cn(
              "w-24 border-r border-[var(--color-border-subtle)] p-2 flex flex-col gap-2 transition-colors duration-500",
              isDark ? "bg-slate-900/90" : "bg-slate-100/90"
            )}
          >
            <div className="flex items-center gap-1.5 px-1 pb-1 border-b border-[var(--color-border-subtle)]">
              <div className="w-3 h-3 rounded-full bg-current transition-colors duration-500" style={{ color: primary }} />
              <span className="text-[8px] font-black tracking-tight text-[var(--color-text-primary)]">BridgeAI</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 px-1.5 py-1 rounded text-[8px] font-bold transition-all duration-500" style={{ backgroundColor: toRGBA(primary, 0.12), color: primary }}>
                <Compass className="w-2.5 h-2.5" /> Dashboard
              </div>
              <div className="flex items-center gap-1 px-1.5 py-1 text-[8px] font-medium text-[var(--color-text-secondary)]">
                <Paintbrush className="w-2.5 h-2.5" /> Themes
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-[var(--color-surface-secondary)]/70">
            {/* Header */}
            <div className="h-6 border-b border-[var(--color-border-subtle)] px-2 flex items-center justify-between bg-[var(--color-surface-primary)]/90">
              <div className="w-8 h-2 rounded-full bg-[var(--color-surface-tertiary)]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[var(--color-surface-tertiary)]" />
            </div>

            {/* Chat Feed */}
            <div className="flex-1 p-2.5 flex flex-col gap-1.5 justify-end">
              {/* AI Message */}
              <div className="flex gap-1 items-start max-w-[85%]">
                <div className="w-3 h-3 rounded-full bg-[var(--color-surface-tertiary)] shrink-0" />
                <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border-subtle)] rounded-lg p-1.5 shadow-2xs">
                  <p className="text-[7px] leading-snug transition-colors duration-500 font-medium" style={{ color: secondary }}>
                    Hello! How can I assist you?
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-1 items-start max-w-[85%] self-end">
                <div className="rounded-lg p-1.5 text-white shadow-2xs transition-all duration-500" style={{ backgroundColor: primary }}>
                  <p className="text-[7px] leading-snug">
                    Show me the new theme!
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-1.5 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-primary)]/90 flex gap-1.5">
              <div className="flex-1 h-4 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface-secondary)]" />
              <div className="w-4 h-4 rounded flex items-center justify-center text-white transition-all duration-500" style={{ backgroundColor: primary }}>
                <span className="text-[8px]">→</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const premiumWallpapers = [
  { id: 'foggy-serenity', name: 'Foggy Serenity', desc: 'Soft pastel mist and slow drifting fog' },
  { id: 'glacial-fracture', name: 'Glacial Fracture', desc: 'Icy blue rotating geometric shards' },
  { id: 'solar-flare', name: 'Solar Flare', desc: 'Warm amber waves and soft yellow glow' },
  { id: 'neon-gridline', name: 'Neon Gridline', desc: 'Purple wireframe scrolling perspective grid' },
  { id: 'industrial-grit', name: 'Industrial Grit', desc: 'Brushed steel with slow-moving reflections' },
  { id: 'aurora-bloom', name: 'Aurora Bloom', desc: 'Soft flowing aurora ribbons and organic waves' },
  { id: 'crystal-flow', name: 'Crystal Flow', desc: 'Floating translucent crystal shards with soft reflections' },
  { id: 'particle-galaxy', name: 'Particle Galaxy', desc: 'Constellations of drifting, connecting star particles' },
  { id: 'silk-motion', name: 'Silk Motion', desc: 'Flowing silk fabric folds with elegant motion' },
  { id: 'liquid-aurora', name: 'Liquid Aurora', desc: 'Organic fluid blobs drifting and merging smoothly' },
]

const radiusOptions = [
  { id: 'square', name: 'Square (0px)' },
  { id: 'crisp', name: 'Crisp (4px)' },
  { id: 'soft', name: 'Soft (8px)' },
  { id: 'comfortable', name: 'Comfortable (12px)' },
  { id: 'rounded', name: 'Rounded (16px)' },
  { id: 'modern', name: 'Modern (20px)' },
  { id: 'organic', name: 'Organic (28px)' },
  { id: 'capsule', name: 'Capsule (999px)' },
]

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

/**
 * High-performance, lightweight Canvas renderer for wallpaper thumbnail previews.
 */
function MiniCanvasWallpaper({ type }: { type: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { themeCustomizer, theme } = useSettingsStore()

  const isDarkTheme = theme === 'dark'
  const primaryColor = themeCustomizer?.primaryColor || (isDarkTheme ? '#ffffff' : '#000000')
  const secondaryColor = themeCustomizer?.secondaryColor || (isDarkTheme ? '#a1a1aa' : '#52525b')

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
    const width = (canvas.width = 150)
    const height = (canvas.height = 90)
    const isDark = theme === 'dark'

    // 1. Foggy Serenity
    const fog: Array<{ x: number; y: number; r: number; vx: number; vy: number }> = []
    if (type === 'foggy-serenity') {
      for (let i = 0; i < 3; i++) {
        fog.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 20 + 25,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        })
      }
    }

    // 2. Glacial Fracture
    const shardList: Array<{ x: number; y: number; size: number; angle: number; spin: number; vx: number; vy: number }> = []
    if (type === 'glacial-fracture') {
      for (let i = 0; i < 6; i++) {
        shardList.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 10 + 12,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.008,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15
        })
      }
    }

    // 5. Industrial Grit
    const metalShadows: Array<{ x: number; y: number; r: number; vx: number; vy: number }> = []
    if (type === 'industrial-grit') {
      for (let i = 0; i < 2; i++) {
        metalShadows.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 35 + 25,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        })
      }
    }

    // 6. Aurora Bloom
    const auroraWaves = [
      { y: height * 0.35, length: 0.015, amplitude: 12, speed: 0.001 },
      { y: height * 0.5, length: 0.012, amplitude: 15, speed: -0.0008 }
    ]

    // 7. Crystal Flow
    const crystals: Array<{ x: number; y: number; vx: number; vy: number; angle: number; spin: number; size: number }> = []
    if (type === 'crystal-flow') {
      for (let i = 0; i < 4; i++) {
        crystals.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.01,
          size: Math.random() * 15 + 15
        })
      }
    }

    // 8. Particle Galaxy
    const stars: Array<{ x: number; y: number; vx: number; vy: number }> = []
    if (type === 'particle-galaxy') {
      for (let i = 0; i < 20; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4
        })
      }
    }

    // 9. Silk Motion
    const silkBands = 3

    // 10. Liquid Aurora
    const blobs: Array<{ x: number; y: number; vx: number; vy: number; r: number; colorType: 'p' | 's' }> = []
    if (type === 'liquid-aurora') {
      for (let i = 0; i < 4; i++) {
        blobs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 30 + 35,
          colorType: i % 2 === 0 ? 'p' : 's'
        })
      }
    }

    const draw = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, width, height)
      const time = Date.now()

      // Read dynamic colors from refs
      const pColor = primaryColorRef.current
      const sColor = secondaryColorRef.current

      if (type === 'foggy-serenity') {
        for (let i = 0; i < fog.length; i++) {
          const b = fog[i]
          b.x += b.vx
          b.y += b.vy
          if (b.x - b.r > width) b.x = -b.r
          if (b.x + b.r < 0) b.x = width + b.r
          if (b.y - b.r > height) b.y = -b.r
          if (b.y + b.r < 0) b.y = height + b.r
          
          const color = i % 2 === 0 ? pColor : sColor
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
          grad.addColorStop(0, toRGBA(color, 0.4))
          grad.addColorStop(0.5, toRGBA(color, 0.15))
          grad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (type === 'glacial-fracture') {
        for (let i = 0; i < shardList.length; i++) {
          const s = shardList[i]
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
          ctx.moveTo(-s.size/2, -s.size/2)
          ctx.lineTo(s.size/2, -s.size/3)
          ctx.lineTo(s.size/3, s.size/2)
          ctx.closePath()

          const grad = ctx.createLinearGradient(-s.size / 2, -s.size / 2, s.size / 2, s.size / 2)
          grad.addColorStop(0, toRGBA(pColor, 0.25))
          grad.addColorStop(1, toRGBA(sColor, 0.08))
          
          ctx.fillStyle = grad
          ctx.strokeStyle = toRGBA(sColor, 0.5)
          ctx.lineWidth = 1
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
      } else if (type === 'solar-flare') {
        const pulse = Math.sin(time * 0.0015) * 6
        const grad = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, 35 + pulse)
        grad.addColorStop(0, toRGBA(sColor, 0.45))
        grad.addColorStop(0.6, toRGBA(pColor, 0.15))
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        ctx.strokeStyle = toRGBA(sColor, 0.35)
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = 0; x <= width; x += 10) {
          const y = height - 25 + Math.sin(x * 0.05 + time * 0.003) * 6
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      } else if (type === 'neon-gridline') {
        const horizon = height * 0.5
        
        const horizonGlow = ctx.createLinearGradient(0, horizon - 15, 0, horizon + 5)
        horizonGlow.addColorStop(0, 'rgba(0, 0, 0, 0)')
        horizonGlow.addColorStop(0.5, toRGBA(sColor, 0.3))
        horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = horizonGlow
        ctx.fillRect(0, horizon - 15, width, 20)

        const gridGrad = ctx.createLinearGradient(0, horizon, 0, height)
        gridGrad.addColorStop(0, toRGBA(pColor, 0.0))
        gridGrad.addColorStop(0.2, toRGBA(pColor, 0.35))
        gridGrad.addColorStop(1, toRGBA(sColor, 0.75))
        ctx.strokeStyle = gridGrad
        ctx.lineWidth = 1
        
        for (let i = 0; i <= 10; i++) {
          ctx.beginPath()
          ctx.moveTo(width / 2, horizon)
          ctx.lineTo((width / 10) * i, height)
          ctx.stroke()
        }
        
        const offset = (time * 0.03) % 12
        for (let i = 0; i < 6; i++) {
          const ratio = i / 6
          const y = horizon + (height - horizon) * Math.pow(ratio, 2) + offset * (i / 6)
          if (y > height) continue
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
      } else if (type === 'industrial-grit') {
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.02)'
        ctx.lineWidth = 1
        for (let y = 0; y < height; y += 4) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }
        for (let i = 0; i < metalShadows.length; i++) {
          const s = metalShadows[i]
          s.x += s.vx
          s.y += s.vy
          if (s.x - s.r > width) s.x = -s.r
          if (s.x + s.r < 0) s.x = width + s.r
          
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r)
          if (isDark) {
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.4)')
            grad.addColorStop(0.5, toRGBA(pColor, 0.08))
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          } else {
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.65)')
            grad.addColorStop(0.5, toRGBA(pColor, 0.08))
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
          }
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      // 6. AURORA BLOOM
      else if (type === 'aurora-bloom') {
        ctx.globalCompositeOperation = 'screen'
        auroraWaves.forEach((w, idx) => {
          const grad = ctx.createLinearGradient(0, 0, width, 0)
          grad.addColorStop(0, toRGBA(pColor, 0))
          grad.addColorStop(0.5, toRGBA(idx % 2 === 0 ? pColor : sColor, isDark ? 0.2 : 0.3))
          grad.addColorStop(1, toRGBA(sColor, 0))
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(0, height)
          for (let x = 0; x <= width; x += 5) {
            const y = w.y + Math.sin(x * w.length + time * w.speed) * w.amplitude
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fill()
        })
        ctx.globalCompositeOperation = 'source-over'
      }
      // 7. CRYSTAL FLOW
      else if (type === 'crystal-flow') {
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
          
          ctx.beginPath()
          ctx.moveTo(0, -c.size/2)
          ctx.lineTo(c.size/3, 0)
          ctx.lineTo(0, c.size/2)
          ctx.closePath()
          let grad = ctx.createLinearGradient(0, -c.size/2, 0, c.size/2)
          grad.addColorStop(0, toRGBA(pColor, isDark ? 0.15 : 0.25))
          grad.addColorStop(1, toRGBA(sColor, 0.02))
          ctx.fillStyle = grad
          ctx.strokeStyle = toRGBA(sColor, isDark ? 0.25 : 0.4)
          ctx.fill()
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(0, -c.size/2)
          ctx.lineTo(-c.size/3, 0)
          ctx.lineTo(0, c.size/2)
          ctx.closePath()
          grad = ctx.createLinearGradient(0, -c.size/2, 0, c.size/2)
          grad.addColorStop(0, toRGBA(sColor, isDark ? 0.12 : 0.2))
          grad.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = grad
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        })
      }
      // 8. PARTICLE GALAXY
      else if (type === 'particle-galaxy') {
        stars.forEach(s => {
          s.x += s.vx
          s.y += s.vy
          if (s.x < 0) s.x = width
          if (s.x > width) s.x = 0
          if (s.y < 0) s.y = height
          if (s.y > height) s.y = 0
          ctx.beginPath()
          ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = toRGBA(pColor, 0.7)
          ctx.fill()
        })
        for (let i = 0; i < stars.length; i++) {
          for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x
            const dy = stars[i].y - stars[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 40) {
              ctx.strokeStyle = toRGBA(sColor, (1 - dist / 40) * 0.25)
              ctx.beginPath()
              ctx.moveTo(stars[i].x, stars[i].y)
              ctx.lineTo(stars[j].x, stars[j].y)
              ctx.stroke()
            }
          }
        }
      }
      // 9. SILK MOTION
      else if (type === 'silk-motion') {
        ctx.globalCompositeOperation = 'screen'
        for (let i = 0; i < silkBands; i++) {
          const grad = ctx.createLinearGradient(0, 0, width, height)
          grad.addColorStop(0, toRGBA(pColor, isDark ? 0.1 : 0.15))
          grad.addColorStop(0.5, toRGBA(sColor, isDark ? 0.05 : 0.1))
          grad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = grad
          ctx.beginPath()
          ctx.moveTo(0, height)
          for (let x = 0; x <= width; x += 10) {
            const y = height * 0.3 + (i * 15) + Math.sin(x * 0.015 + time * 0.001 + i) * 12
            ctx.lineTo(x, y)
          }
          ctx.lineTo(width, height)
          ctx.closePath()
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }
      // 10. LIQUID AURORA
      else if (type === 'liquid-aurora') {
        blobs.forEach(b => {
          b.x += b.vx
          b.y += b.vy
          if (b.x - b.r > width) b.x = -b.r
          if (b.x + b.r < 0) b.x = width + b.r
          if (b.y - b.r > height) b.y = -b.r
          if (b.y + b.r < 0) b.y = height + b.r
          const color = b.colorType === 'p' ? pColor : sColor
          const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
          grad.addColorStop(0, toRGBA(color, isDark ? 0.25 : 0.35))
          grad.addColorStop(0.7, toRGBA(color, 0.05))
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
      cancelAnimationFrame(animationFrameId)
    }
  }, [type, theme])

  return <canvas ref={canvasRef} className={cn("w-full h-full rounded-lg transition-all duration-500", type === 'foggy-serenity' && "[filter:blur(6px)]", type === 'solar-flare' && "[filter:blur(2px)]", type === 'aurora-bloom' && "[filter:blur(4px)]", type === 'silk-motion' && "[filter:blur(3px)]", type === 'liquid-aurora' && "[filter:blur(7px)]")} />
}

export function AppearanceSettings() {
  const { t } = useTranslation()
  const { 
    themeCustomizer, 
    updateThemeCustomizer, 
    theme,
    setTheme, 
    resetSettings,
    savedThemes = [],
    saveTheme,
    loadTheme,
    toggleFavoriteTheme,
    deleteTheme,
    resetThemeCustomizer
  } = useSettingsStore()
  
  const [themeName, setThemeName] = useState('')
  const [fontSearch, setFontSearch] = useState('')
  const [activeFontTab, setActiveFontTab] = useState<'sans' | 'serif' | 'mono' | 'display'>('sans')

  // Accessibility States (UI-Only, managed locally for high fidelity)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [focusIndicators, setFocusIndicators] = useState(true)

  const customizer = themeCustomizer || {}
  const isDark = theme === 'dark'
  const primary = customizer.primaryColor || (isDark ? '#ffffff' : '#000000')
  const secondary = customizer.secondaryColor || (isDark ? '#a1a1aa' : '#52525b')

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customizer, null, 2))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "bridgeai-appearance.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        updateThemeCustomizer(json)
      } catch (err) {
        alert("Invalid theme file.")
      }
    }
    reader.readAsText(file)
  }

  const renderLivePreview = (wpId: string) => {
    return (
      <div className="absolute inset-0 bg-slate-950 overflow-hidden rounded-lg">
        <MiniCanvasWallpaper type={wpId} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Left Column: Config Cards (7 cols on Desktop) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4 order-2 sm:order-1 lg:order-1">
        
        {/* Top Action Bar - Compact */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-bridge-500/5 px-3 py-2 rounded-xl border border-bridge-500/10 shadow-2xs">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-bridge-500" />
            <div>
              <h3 className="font-bold text-[11px] text-[var(--color-text-primary)]">Customization Engine</h3>
              <p className="text-[9px] text-[var(--color-text-secondary)]">Instantly preview and apply professional themes.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={resetSettings} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg hover:bg-[var(--color-surface-secondary)] border border-transparent hover:border-[var(--color-border-default)] transition-all cursor-pointer">
              <RefreshCw className="w-3 h-3" /> Reset All
            </button>
            <label className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg hover:bg-[var(--color-surface-secondary)] border border-transparent hover:border-[var(--color-border-default)] transition-all cursor-pointer">
              <Upload className="w-3 h-3" /> Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={handleExport} className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-bridge-500 text-white shadow-xs hover:bg-bridge-600 transition-all cursor-pointer">
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        {/* Card 1: Theme & Accent Colors (Grouped & Side-by-side Wheels) */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 md:p-4 pb-2 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Theme & Accents
              </CardTitle>
              <CardDescription className="text-[10px]">
                Configure theme mode and accent wheel colors.
              </CardDescription>
            </div>
            {/* Theme Mode Toggle */}
            <div className="flex bg-[var(--color-surface-tertiary)] p-0.5 rounded-lg border border-[var(--color-border-subtle)]">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                  !isDark 
                    ? "bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] shadow-xs" 
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Sun className="w-3 h-3 text-amber-500" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer",
                  isDark 
                    ? "bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] shadow-xs" 
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <Moon className="w-3 h-3 text-indigo-400" /> Dark
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-4">
            {/* Hue Wheels Side by Side */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
              <HueWheel
                label="Primary Accent"
                value={primary}
                onChange={(hex) => updateThemeCustomizer({ primaryColor: hex })}
                size={120}
                isDark={isDark}
              />
              <HueWheel
                label="Secondary Accent"
                value={secondary}
                onChange={(hex) => updateThemeCustomizer({ secondaryColor: hex })}
                size={120}
                isDark={isDark}
              />
            </div>

            {/* Save Theme Sub-section */}
            <div className="border-t border-[var(--color-border-subtle)] pt-3 flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Custom Theme Name..."
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="flex-1 h-7 px-2.5 rounded-lg bg-[var(--color-surface-tertiary)] text-[10px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none focus:ring-1 focus:ring-bridge-500 border border-[var(--color-border-subtle)]"
                />
                <button 
                  onClick={() => {
                    if (!themeName.trim()) return
                    saveTheme(themeName.trim())
                    setThemeName('')
                  }}
                  className="h-7 flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-bridge-500 text-white shadow-xs hover:bg-bridge-600 transition-all cursor-pointer"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
              </div>
              <button 
                onClick={resetThemeCustomizer}
                className="h-7 flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset Accent
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Saved Themes (If any) */}
        {savedThemes.length > 0 && (
          <Card className="border border-[var(--color-border-default)] shadow-xs">
            <CardHeader className="p-3 md:p-4 pb-1">
              <CardTitle className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Saved Custom Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedThemes.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 hover:bg-[var(--color-surface-secondary)]/60 transition-all">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <button onClick={() => toggleFavoriteTheme(t.id)} className="text-amber-500 hover:scale-105 transition-transform">
                        <Star className={cn("w-3.5 h-3.5", t.isFavorite ? "fill-current text-amber-500" : "opacity-30 text-[var(--color-text-tertiary)]")} />
                      </button>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold truncate text-[var(--color-text-primary)]">{t.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[8px] uppercase font-bold text-[var(--color-text-tertiary)]">{t.theme}</span>
                          <div className="w-2 h-2 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: t.primaryColor }} />
                          <div className="w-2 h-2 rounded-full border border-black/10 dark:border-white/10" style={{ backgroundColor: t.secondaryColor }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={() => loadTheme(t.id)}
                        className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-bridge-500 text-white hover:bg-bridge-600 transition-colors cursor-pointer"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => deleteTheme(t.id)}
                        className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Canvas Wallpapers (Compact Swatch Grid) */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 md:p-4 pb-2 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30">
            <CardTitle className="text-xs font-black flex items-center gap-1.5">
              <Wallpaper className="w-3.5 h-3.5 text-purple-500" /> Canvas Wallpapers
            </CardTitle>
            <CardDescription className="text-[10px]">
              Select a GPU-accelerated background pattern.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {premiumWallpapers.map(wp => (
                <button
                  key={wp.id}
                  onClick={() => updateThemeCustomizer({ customWallpaper: wp.id })}
                  className={cn(
                    'group flex flex-col items-center gap-1 p-1 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer',
                    customizer.customWallpaper === wp.id ? 'border-bridge-500 bg-bridge-500/5' : 'border-transparent hover:border-[var(--color-border-default)]'
                  )}
                >
                  <div className="w-full aspect-video rounded border border-black/10 dark:border-white/10 shadow-2xs relative overflow-hidden bg-neutral-950">
                    {renderLivePreview(wp.id)}
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight mt-0.5 truncate w-full">{wp.name}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Typography Library (Fixed Tabs, Internal Scroll, Compact Grid) */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 md:p-4 pb-2 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-black flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-500" /> Typography Library
              </CardTitle>
              <CardDescription className="text-[10px]">
                Browse and apply 40+ Google Fonts.
              </CardDescription>
            </div>
            <input 
              type="text" 
              placeholder="Search fonts..." 
              value={fontSearch}
              onChange={(e) => setFontSearch(e.target.value)}
              className="text-[10px] px-2 py-1 bg-[var(--color-surface-primary)] border border-[var(--color-border-default)] rounded-md focus:outline-none focus:border-bridge-500 w-28 sm:w-36"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/10">
              {['sans', 'serif', 'mono', 'display'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveFontTab(tab as any)}
                  className={cn(
                    'flex-1 py-1.5 text-[10px] font-bold border-b-2 capitalize transition-all',
                    activeFontTab === tab ? 'border-indigo-500 text-indigo-500 bg-indigo-500/5' : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-3 max-h-[145px] overflow-y-auto scrollbar-none">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {fonts[activeFontTab].filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())).map(font => (
                  <button
                    key={font}
                    onClick={() => updateThemeCustomizer({ fontFamily: font })}
                    className={cn(
                      'py-1.5 px-2 rounded-lg border text-left transition-all cursor-pointer group hover:border-indigo-300',
                      customizer.fontFamily === font ? 'border-indigo-500 bg-indigo-500/5 shadow-2xs' : 'border-[var(--color-border-default)] bg-[var(--color-surface-primary)]'
                    )}
                  >
                    <p className="text-[11px] font-medium truncate" style={{ fontFamily: `"${font}", sans-serif` }}>{font}</p>
                    <p className="text-[8px] text-[var(--color-text-tertiary)] group-hover:text-indigo-500 truncate">The quick brown fox</p>
                  </button>
                ))}
                {fonts[activeFontTab].filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-4 text-center text-[10px] text-[var(--color-text-tertiary)]">
                    No fonts found matching "{fontSearch}"
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grouped Card 5: Motion & Style (Corner Radius, Blur, Animation Speed) */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 md:p-4 pb-2 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30">
            <CardTitle className="text-xs font-black flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-500" /> Motion & Style Customizer
            </CardTitle>
            <CardDescription className="text-[10px]">
              Grouped corner radius, blur depth, and micro-animation speeds.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 space-y-3.5">
            {/* Corner Radius Options */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold flex items-center gap-1"><Compass className="w-3 h-3" /> Corner Radius</label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                {radiusOptions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => updateThemeCustomizer({ borderRadius: r.id })}
                    className={cn(
                      'flex items-center justify-center min-h-[26px] px-1 text-[9px] font-semibold border transition-all cursor-pointer text-center w-full rounded',
                      customizer.borderRadius === r.id 
                        ? 'border-bridge-500 bg-bridge-500 text-white shadow-xs' 
                        : 'border-[var(--color-border-default)] bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] hover:border-bridge-400',
                      r.id === 'square' ? 'rounded-none' : r.id === 'crisp' ? 'rounded-sm' : r.id === 'soft' ? 'rounded-md' : r.id === 'comfortable' ? 'rounded-lg' : r.id === 'rounded' ? 'rounded-xl' : r.id === 'modern' ? 'rounded-2xl' : r.id === 'organic' ? 'rounded-3xl' : 'rounded-full'
                    )}
                  >
                    <span className="truncate block w-full px-0.5">{r.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Blur & Speed in a 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold flex items-center gap-1"><Eye className="w-3 h-3" /> Blur Depth</label>
                <div className="flex bg-[var(--color-surface-secondary)] p-0.5 rounded-lg w-full h-[28px] border border-[var(--color-border-subtle)]">
                  {['none', 'low', 'medium', 'high', 'ultra'].map((val) => (
                    <button 
                      key={val} 
                      onClick={() => updateThemeCustomizer({ backgroundBlur: val })} 
                      className={cn(
                        'flex-1 min-w-0 flex items-center justify-center text-[9px] font-bold rounded capitalize transition-all cursor-pointer', 
                        customizer.backgroundBlur === val 
                          ? 'bg-[var(--color-surface-primary)] shadow-2xs text-[var(--color-text-primary)]' 
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                      )}
                    >
                      <span className="truncate px-0.5">{val}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold flex items-center gap-1"><Gauge className="w-3 h-3" /> Animation Speed</label>
                <div className="flex bg-[var(--color-surface-secondary)] p-0.5 rounded-lg w-full h-[28px] border border-[var(--color-border-subtle)]">
                  {['instant', 'fast', 'normal', 'slow', 'relaxed'].map((val) => (
                    <button 
                      key={val} 
                      onClick={() => updateThemeCustomizer({ animationSpeed: val })} 
                      className={cn(
                        'flex-1 min-w-0 flex items-center justify-center text-[9px] font-bold rounded capitalize transition-all cursor-pointer', 
                        customizer.animationSpeed === val 
                          ? 'bg-[var(--color-surface-primary)] shadow-2xs text-[var(--color-text-primary)]' 
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
                      )}
                    >
                      <span className="truncate px-0.5">{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Accessibility (Toggles for High Contrast, Reduced Motion, Focus Indicators) */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 md:p-4 pb-2 border-b border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]/30">
            <CardTitle className="text-xs font-black flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-emerald-500" /> Accessibility Settings
            </CardTitle>
            <CardDescription className="text-[10px]">
              Customize accessibility preferences for focus, motion, and contrast.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-secondary)]/20 border border-[var(--color-border-subtle)]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">High Contrast</span>
                <span className="text-[8px] text-[var(--color-text-secondary)]">Increase UI text contrast</span>
              </div>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-secondary)]/20 border border-[var(--color-border-subtle)]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Reduced Motion</span>
                <span className="text-[8px] text-[var(--color-text-secondary)]">Disable transition animations</span>
              </div>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-secondary)]/20 border border-[var(--color-border-subtle)]">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Focus Indicators</span>
                <span className="text-[8px] text-[var(--color-text-secondary)]">Show strong keyboard focus outline</span>
              </div>
              <Switch checked={focusIndicators} onCheckedChange={setFocusIndicators} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Column: Sticky Live Preview (5 cols on Desktop) */}
      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4 h-fit space-y-4 order-1 sm:order-2 lg:order-2">
        <LiveThemePreview
          primary={primary}
          secondary={secondary}
          isDark={isDark}
          customWallpaper={customizer.customWallpaper}
        />

        {/* Quick Summary Card */}
        <Card className="border border-[var(--color-border-default)] shadow-xs">
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
              Theme Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-secondary)]">Active Font:</span>
              <span className="font-bold text-[var(--color-text-primary)]" style={{ fontFamily: `"${customizer.fontFamily}", sans-serif` }}>
                {customizer.fontFamily || 'Default'}
              </span>
            </div>
            <div className="flex justify-between border-b border-[var(--color-border-subtle)] pb-1.5">
              <span className="text-[var(--color-text-secondary)]">Corner Radius:</span>
              <span className="font-bold text-[var(--color-text-primary)] capitalize">
                {customizer.borderRadius || 'Comfortable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Active Wallpaper:</span>
              <span className="font-bold text-[var(--color-text-primary)] truncate max-w-[140px]">
                {premiumWallpapers.find(w => w.id === customizer.customWallpaper)?.name || 'None'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
