import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings-store'

export function useFontLoader() {
  const { themeCustomizer } = useSettingsStore()
  const fontFamily = themeCustomizer?.fontFamily || 'Inter'

  useEffect(() => {
    if (!fontFamily) return

    // Skip default system fonts
    if (fontFamily === 'sans' || fontFamily === 'mono' || fontFamily === 'serif') return

    const linkId = `google-font-${fontFamily.replace(/\s+/g, '-')}`
    
    // Check if already loaded
    if (document.getElementById(linkId)) {
      applyFont(fontFamily)
      return
    }

    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`
    
    document.head.appendChild(link)

    // Apply the font
    applyFont(fontFamily)

  }, [fontFamily])

  const applyFont = (font: string) => {
    // Set a global CSS variable for the sans font
    document.documentElement.style.setProperty('--font-sans', `"${font}", ui-sans-serif, system-ui, sans-serif`)
  }
}
