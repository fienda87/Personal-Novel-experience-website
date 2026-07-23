'use client'

import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { EntityMention, Entity } from '@/lib/types'

interface InteractiveTextProps {
  text: string
  mentions?: EntityMention[]
}

export function InteractiveText({ text, mentions }: InteractiveTextProps) {
  const [hoveredEntity, setHoveredEntity] = useState<Entity | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const cacheRef = useRef<Map<string, Entity>>(new Map())
  const ignoreNextLeaveRef = useRef(false)

  const fetchEntity = useCallback(async (mention: EntityMention) => {
    const cached = cacheRef.current.get(mention.entityId)
    if (cached) return cached

    try {
      const res = await fetch(`/api/entities?id=${mention.entityId}`)
      if (res.ok) {
        const data = await res.json() as Entity
        cacheRef.current.set(mention.entityId, data)
        return data
      }
    } catch { /* fall through */ }

    const minimal: Entity = {
      id: mention.entityId,
      name: mention.entityName,
      type: mention.entityType,
      imageUrl: '',
      snippet: '',
      tags: [],
    }
    cacheRef.current.set(mention.entityId, minimal)
    return minimal
  }, [])

  const showEntity = useCallback(async (mention: EntityMention) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const entity = await fetchEntity(mention)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setHoveredEntity(entity)
  }, [fetchEntity])

  const handleMouseEnter = useCallback((mention: EntityMention, e: React.MouseEvent) => {
    ignoreNextLeaveRef.current = false
    setTooltipPos({ x: e.clientX, y: e.clientY })
    showEntity(mention)
  }, [showEntity])

  const handleMouseLeave = useCallback(() => {
    if (ignoreNextLeaveRef.current) {
      ignoreNextLeaveRef.current = false
      return
    }
    timeoutRef.current = setTimeout(() => setHoveredEntity(null), 150)
  }, [])

  const handleTap = useCallback((mention: EntityMention) => {
    console.log('handleTap called:', mention.entityName)
    ignoreNextLeaveRef.current = true
    showEntity(mention)
  }, [showEntity])

  const handleDismiss = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setHoveredEntity(null)
  }, [])

  if (!mentions || mentions.length === 0) {
    return <span>{text}</span>
  }

  const parts: { text: string; mention?: EntityMention }[] = []
  let lastIndex = 0

  const sortedMentions = [...mentions].sort((a, b) => a.startIndex - b.startIndex)

  sortedMentions.forEach((mention) => {
    if (mention.startIndex > lastIndex) {
      parts.push({ text: text.slice(lastIndex, mention.startIndex) })
    }
    parts.push({ text: text.slice(mention.startIndex, mention.endIndex), mention })
    lastIndex = mention.endIndex
  })

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) })
  }

  return (
    <>
      <span>
        {parts.map((part, i) =>
          part.mention ? (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('MOBILE TAP SUCCESS:', part.mention!.entityName)
                handleTap(part.mention!)
              }}
              onMouseEnter={(e) => handleMouseEnter(part.mention!, e)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'inline-flex items-center px-1 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold underline decoration-dotted',
                'active:scale-95 touch-manipulation cursor-pointer z-20',
                'transition-all duration-200'
              )}
            >
              @{part.text}
            </button>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>

      {/* Desktop floating tooltip */}
      <AnimatePresence>
        {hoveredEntity && (
          <motion.div
            key="desktop-tooltip"
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 10,
            }}
            className="hidden md:block pointer-events-none fixed z-50 w-72 -translate-x-1/2 -translate-y-full p-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl"
            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-moonstone-blue to-ethereal-teal text-lg font-bold text-white">
                {hoveredEntity.name[0]}
              </div>
              <div>
                <div className="font-serif text-sm font-semibold text-on-surface">
                  {hoveredEntity.name}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-moonstone-blue">
                  {hoveredEntity.type}
                </div>
              </div>
            </div>
            {hoveredEntity.snippet && (
              <div className="text-sm leading-relaxed text-on-surface-variant font-sans">
                {hoveredEntity.snippet}
              </div>
            )}
            {hoveredEntity.tags && hoveredEntity.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hoveredEntity.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet — portal to body root */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {hoveredEntity && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block md:hidden fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
                onClick={handleDismiss}
              />
              {/* Sheet */}
              <motion.div
                key="mobile-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="block md:hidden fixed inset-x-0 bottom-0 z-[999] pointer-events-auto flex flex-col justify-end"
              >
                <div className="w-full max-w-lg mx-auto bg-slate-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-5 shadow-2xl">
                  <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-moonstone-blue to-ethereal-teal text-lg font-bold text-white">
                        {hoveredEntity.name[0]}
                      </div>
                      <div>
                        <div className="font-serif text-sm font-semibold text-on-surface">
                          {hoveredEntity.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-moonstone-blue">
                          {hoveredEntity.type}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                    >
                      <X size={14} weight="bold" />
                    </button>
                  </div>
                  {hoveredEntity.snippet && (
                    <div className="text-sm leading-relaxed text-on-surface-variant font-sans mb-3">
                      {hoveredEntity.snippet}
                    </div>
                  )}
                  {hoveredEntity.tags && hoveredEntity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {hoveredEntity.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-[10px] text-on-surface-variant uppercase tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
