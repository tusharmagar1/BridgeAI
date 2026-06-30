// Helper to convert hex to HSL
export interface HSL {
  h: number
  s: number
  l: number
}

export function hexToHSL(hex: string): HSL {
  let r = 0, g = 0, b = 0
  const cleanHex = hex.trim().replace('#', '')

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  }

  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x
  }

  const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0')
  const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0')
  const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0')

  return `#${rHex}${gHex}${bHex}`
}

// Generate a scale of shades from a base color
export function generateScale(baseHex: string): Record<number, string> {
  const hsl = hexToHSL(baseHex)
  
  // Custom lightness mappings for HSL scale
  const lightnessMap: Record<number, number> = {
    50: 96,
    100: 90,
    200: 80,
    300: 70,
    400: 60,
    500: hsl.l, // Keep original lightness for the base color
    600: Math.max(10, hsl.l - 10),
    700: Math.max(8, hsl.l - 20),
    800: Math.max(6, hsl.l - 30),
    900: Math.max(4, hsl.l - 40),
    950: Math.max(2, hsl.l - 45),
  }

  const scale: Record<number, string> = {}
  Object.entries(lightnessMap).forEach(([shade, lValue]) => {
    scale[Number(shade)] = hslToHex(hsl.h, hsl.s, lValue)
  })

  return scale
}

export interface ColorThemeVariables {
  [key: string]: string
}

export function generateColorTheme(
  primaryColor: string,
  secondaryColor: string,
  isDark: boolean
): ColorThemeVariables {
  const variables: ColorThemeVariables = {}

  const pColor = primaryColor.toLowerCase()
  const isMonochrome = pColor === '#ffffff' || pColor === '#000000' || pColor === '#fff' || pColor === '#000'

  if (isMonochrome) {
    if (isDark) {
      // Premium Matte Black/White theme for Dark Mode
      variables['--color-bridge-50'] = 'rgba(255, 255, 255, 0.03)'
      variables['--color-bridge-100'] = 'rgba(255, 255, 255, 0.07)'
      variables['--color-bridge-200'] = 'rgba(255, 255, 255, 0.15)'
      variables['--color-bridge-300'] = 'rgba(255, 255, 255, 0.3)'
      variables['--color-bridge-400'] = 'rgba(255, 255, 255, 0.5)'
      variables['--color-bridge-500'] = '#ffffff' // Accent is White
      variables['--color-bridge-600'] = '#18181b' // Matte Black button background
      variables['--color-bridge-700'] = '#27272a' // Matte Black button hover
      variables['--color-bridge-800'] = '#3f3f46'
      variables['--color-bridge-900'] = '#52525b'
      variables['--color-bridge-950'] = '#09090b'

      variables['--color-active-bg'] = 'rgba(255, 255, 255, 0.1)'
      variables['--color-active-text'] = '#ffffff'
      variables['--color-active-border'] = '#ffffff'
      variables['--color-active-icon'] = '#ffffff'
      variables['--color-hover-bg'] = 'rgba(255, 255, 255, 0.05)'
      variables['--color-focus-ring'] = 'rgba(255, 255, 255, 0.35)'
      variables['--logo-filter'] = 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))'
    } else {
      // Clean Apple-style Black/White theme for Light Mode
      variables['--color-bridge-50'] = 'rgba(0, 0, 0, 0.02)'
      variables['--color-bridge-100'] = 'rgba(0, 0, 0, 0.05)'
      variables['--color-bridge-200'] = 'rgba(0, 0, 0, 0.1)'
      variables['--color-bridge-300'] = 'rgba(0, 0, 0, 0.2)'
      variables['--color-bridge-400'] = 'rgba(0, 0, 0, 0.4)'
      variables['--color-bridge-500'] = '#000000' // Accent is Black
      variables['--color-bridge-600'] = '#f4f4f5' // Clean light gray button
      variables['--color-bridge-700'] = '#e4e4e7' // Button hover
      variables['--color-bridge-800'] = '#d4d4d8'
      variables['--color-bridge-900'] = '#a1a1aa'
      variables['--color-bridge-950'] = '#ffffff'

      variables['--color-active-bg'] = 'rgba(0, 0, 0, 0.06)'
      variables['--color-active-text'] = '#000000'
      variables['--color-active-border'] = '#000000'
      variables['--color-active-icon'] = '#000000'
      variables['--color-hover-bg'] = 'rgba(0, 0, 0, 0.03)'
      variables['--color-focus-ring'] = 'rgba(0, 0, 0, 0.35)'
      variables['--logo-filter'] = 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15))'
    }
  } else {
    // Custom Accent Color Mode
    const primaryScale = generateScale(primaryColor)
    
    // Generate primary scale variables
    Object.entries(primaryScale).forEach(([shade, hex]) => {
      variables[`--color-bridge-${shade}`] = hex
    })

    // Hover/Active states matching the custom primary accent
    variables['--color-active-bg'] = toRGBA(primaryColor, 0.14)
    variables['--color-active-text'] = primaryScale[isDark ? 400 : 600]
    variables['--color-active-border'] = primaryColor
    variables['--color-active-icon'] = primaryColor
    variables['--color-hover-bg'] = toRGBA(primaryColor, 0.08)
    variables['--color-focus-ring'] = toRGBA(primaryColor, 0.4)
    variables['--logo-filter'] = `drop-shadow(0 0 8px ${toRGBA(primaryColor, 0.5)})`
  }

  // Handle Secondary Accent Color
  const sColor = secondaryColor.toLowerCase()
  const isSecMonochrome = sColor === '#ffffff' || sColor === '#000000' || sColor === '#fff' || sColor === '#000' || sColor === '#a1a1aa' || sColor === '#52525b'

  if (isSecMonochrome) {
    variables['--color-text-secondary'] = isDark ? '#94a3b8' : '#475569'
  } else {
    const secondaryScale = generateScale(secondaryColor)
    variables['--color-text-secondary'] = secondaryScale[isDark ? 400 : 600]
    
    // Custom secondary color variables for elements like user bubbles or progress bars
    Object.entries(secondaryScale).forEach(([shade, hex]) => {
      variables[`--color-secondary-${shade}`] = hex
    })
  }

  return variables
}

// Utility to convert hex to rgba string
function toRGBA(hex: string, alpha: number): string {
  const cleanHex = hex.trim().replace('#', '')
  let r = 0, g = 0, b = 0
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
