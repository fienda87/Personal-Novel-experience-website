'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowUpRight } from '@phosphor-icons/react'

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  glow?: 'moonstone' | 'teal' | 'silver' | 'none'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  disabled?: boolean
}

export function GlassButton({ children, onClick, className, glow = 'none', size = 'md', showIcon = false, disabled }: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'group relative inline-flex items-center gap-3 rounded-full font-medium tracking-tight transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
        'bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20',
        glow === 'moonstone' && 'ring-moonstone-blue/30 hover:ring-moonstone-blue/50 hover:shadow-[0_0_30px_rgba(148,187,233,0.15)]',
        disabled && 'opacity-40 pointer-events-none',
        sizeClasses[size],
        className
      )}
    >
      <span className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[-2px]">
        {children}
      </span>
      {showIcon && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-[2px] group-hover:-translate-y-[1px] group-hover:scale-105">
          <ArrowUpRight size={14} weight="bold" className="text-current" />
        </span>
      )}
    </motion.button>
  )
}
