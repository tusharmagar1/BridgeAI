import { useState, useEffect } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // Import default dark theme style

interface CodeBlockProps {
  language: string
  value: string
}

export function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')

  // Determine if code is long enough to be collapsible (e.g., > 15 lines)
  const lines = value.split('\n')
  const isLong = lines.length > 20

  useEffect(() => {
    try {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
      const highlighted = hljs.highlight(value, { language: validLanguage }).value
      setHighlightedCode(highlighted)
    } catch {
      setHighlightedCode(value)
    }
  }, [language, value])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-lg font-mono text-xs text-zinc-200">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2 text-zinc-400">
          <Terminal className="w-4 h-4 text-bridge-500" />
          <span className="font-semibold text-[10px] uppercase tracking-wider">
            {language || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isLong && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
              title={collapsed ? 'Expand code' : 'Collapse code'}
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors text-[10px] font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div
        className={cn(
          'relative overflow-x-auto p-4 transition-all duration-300',
          collapsed ? 'max-h-24 overflow-hidden' : 'max-h-[500px]'
        )}
      >
        <pre className="m-0 leading-relaxed">
          <code
            className="hljs"
            dangerouslySetInnerHTML={{ __html: highlightedCode || value }}
          />
        </pre>

        {collapsed && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent flex items-end justify-center pb-2">
            <button
              onClick={() => setCollapsed(false)}
              className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-bridge-500 hover:text-bridge-600 transition-colors shadow-md"
            >
              Show More ({lines.length - 5} lines)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
