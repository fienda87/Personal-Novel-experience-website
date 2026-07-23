'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight, MagnifyingGlass, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import type { Chapter } from '@/lib/types'

const ease = [0.32, 0.72, 0, 1] as [number, number, number, number]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

function chapterWords(content: { text: string }[]): number {
  return content.reduce((sum, p) => sum + wordCount(p.text), 0)
}

function chapterReadTime(content: { text: string }[]): number {
  return Math.max(1, Math.ceil(chapterWords(content) / 200))
}

const PER_PAGE = 10

export default function LibraryPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ascending, setAscending] = useState(false)
  const [page, setPage] = useState(0)
  const [showCount, setShowCount] = useState(PER_PAGE)

  useEffect(() => {
    fetch('/api/chapters')
      .then((r) => r.json())
      .then((data) => {
        setChapters(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    let list = [...chapters]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (ch) => ch.title.toLowerCase().includes(q) || String(ch.number).includes(q)
      )
    }
    list.sort((a, b) => (ascending ? a.number - b.number : b.number - a.number))
    return list
  }, [chapters, search, ascending])

  const visible = filtered.slice(0, showCount)
  const hasMore = showCount < filtered.length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="flex gap-1.5">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="w-2 h-2 rounded-full bg-moonstone-blue animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.3em] animate-pulse">
          Loading the archives...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease }}
        className="mb-10"
      >
        <span className="font-mono text-[10px] text-moonstone-blue tracking-[0.25em] uppercase mb-3 block">
          Library
        </span>
        <h1 className="font-display text-4xl md:text-6xl tracking-tight mb-3">
          All Chronicles
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base max-w-lg leading-relaxed">
          {filtered.length} chapter{filtered.length !== 1 ? 's' : ''} &mdash; find where you left off.
        </p>
      </motion.div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlass size={14} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowCount(PER_PAGE); setPage(0) }}
            placeholder="Search by title or number..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-white/25 outline-none focus:border-moonstone-blue/40 transition font-mono"
          />
        </div>
        <button
          onClick={() => { setAscending((a) => !a); setShowCount(PER_PAGE); setPage(0) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white hover:border-white/20 transition-all shrink-0"
        >
          {ascending ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
          {ascending ? 'Terlama' : 'Terbaru'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-1">
        {visible.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-on-surface-variant">No chapters found</p>
            <p className="font-mono text-[10px] text-on-surface-variant tracking-[0.2em] uppercase mt-2">
              {search ? 'Try a different search term' : 'Write your first chapter in the admin panel'}
            </p>
          </div>
        )}

        {visible.map((chapter, i) => {
          const words = chapterWords(chapter.content)
          const readTime = chapterReadTime(chapter.content)
          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.4, delay: i * 0.04, ease }}
            >
              <Link
                href={`/chapter/${chapter.id}`}
                className="group flex items-center gap-3 md:gap-4 rounded-xl px-3 py-3 md:px-4 md:py-3.5 transition-all hover:bg-white/[0.04] hover:border-emerald-500/20 border border-transparent"
              >
                <span className="shrink-0 font-mono text-[10px] md:text-[11px] text-emerald-400 tracking-[0.15em] uppercase min-w-[88px] md:min-w-[100px]">
                  Ch. {String(chapter.number).padStart(2, '0')}
                </span>

                <span className="flex-1 min-w-0 font-serif text-sm md:text-base font-semibold text-on-surface group-hover:text-white transition-colors truncate">
                  {chapter.title}
                </span>

                <span className="hidden sm:flex items-center gap-1.5 shrink-0 font-mono text-[10px] text-on-surface-variant/60">
                  <Clock size={10} weight="light" />
                  {words.toLocaleString()} &middot; {readTime}m
                </span>

                <span className="shrink-0 grid w-8 h-8 place-items-center rounded-full bg-white/[0.04] border border-white/10 text-white/30 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-all">
                  <ArrowRight size={12} weight="bold" />
                </span>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowCount((c) => Math.min(c + PER_PAGE, filtered.length))}
            className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70 transition-colors px-6 py-3 rounded-xl border border-white/10 hover:border-white/20"
          >
            Load {Math.min(PER_PAGE, filtered.length - showCount)} More
          </button>
        </div>
      )}
    </div>
  )
}
