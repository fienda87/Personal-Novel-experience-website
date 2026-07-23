import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'strong'
}

export function GlassPanel({ children, className, variant = 'default' }: GlassPanelProps) {
  return (
    <div className={cn(variant === 'strong' ? 'glass-strong' : 'glass', 'p-6', className)}>
      {children}
    </div>
  )
}
