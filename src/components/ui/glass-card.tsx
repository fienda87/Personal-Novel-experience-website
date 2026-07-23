'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={cn('glass p-6', className)}
    >
      {children}
    </motion.div>
  )
}
