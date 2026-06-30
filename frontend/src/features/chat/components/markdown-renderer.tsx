import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { CodeBlock } from './code-block'
import 'katex/dist/katex.min.css' // Import math styles

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-[var(--color-text-primary)] prose-p:text-[var(--color-text-primary)] prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-code:text-bridge-500 prose-code:font-mono prose-code:bg-[var(--color-surface-secondary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-a:text-bridge-500 prose-a:font-semibold prose-a:hover:underline prose-blockquote:border-l-4 prose-blockquote:border-bridge-500/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[var(--color-text-secondary)] prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-1 prose-table:border-collapse prose-table:w-full prose-th:border-b prose-th:border-[var(--color-border-default)] prose-th:p-2 prose-th:text-left prose-th:font-bold prose-td:border-b prose-td:border-[var(--color-border-default)] prose-td:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !String(children).includes('\n')
            
            return !isInline ? (
              <CodeBlock
                language={match ? match[1] : 'plaintext'}
                value={String(children).replace(/\n$/, '')}
              />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-[var(--color-border-default)]">
                <table className="min-w-full divide-y divide-[var(--color-border-default)] text-sm">
                  {children}
                </table>
              </div>
            )
          },
          thead({ children }) {
            return <thead className="bg-[var(--color-surface-secondary)]/50">{children}</thead>
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="px-4 py-3 text-sm text-[var(--color-text-primary)] border-t border-[var(--color-border-default)]">{children}</td>
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-bridge-500 hover:text-bridge-600 underline font-medium transition-colors"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
