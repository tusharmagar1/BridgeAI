import React, { ReactNode } from 'react';

interface CompactCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Reusable card component with reduced padding and glassmorphism styling.
 * Consistent with the premium visual language of BridgeAI.
 */
export default function CompactCard({ title, children, className }: CompactCardProps) {
  return (
    <div
      className={`
        rounded-xl
        bg-[var(--color-surface-primary)]/30
        backdrop-blur-lg
        border border-[var(--color-border-default)]
        shadow-md
        p-3
        ${className ?? ''}
      `}
    >
      {title && (
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
