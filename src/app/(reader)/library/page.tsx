'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from '@phosphor-icons/react'
import type { Chapter } from '@/lib/types'

const ease = [0.32, 0.72, 0, 1] as [number, number, number, number]

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

function chapterWords(content: { text: string }[]): number {
  return content.reduce((sum, p) => sum + wordCount(p.text), 0)
}

export default function LibraryPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chapters')
      .then((r) => r.json())
      .then((data) => {
        setChapters(Array.isArray(data) ? data : [])
        setLoading(false)
      })
  }, [])

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
    <div className="mx-auto max-w-5xl px-4 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease }}
        className="mb-16"
      >
        <span className="font-mono text-[10px] text-moonstone-blue tracking-[0.25em] uppercase mb-3 block">
          Library
        </span>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight mb-4">
          All Chronicles
        </h1>
        <p className="text-on-surface-variant text-base max-w-lg leading-relaxed">
          Select a chapter to continue your journey through the realms of ETHÉREA.
        </p>
      </motion.div>

      <div className="space-y-4 md:space-y-6">
        {chapters.length === 0 && (
          <div className="glass p-12 text-center">
            <p className="font-display text-xl text-on-surface-variant mb-2">No chapters yet</p>
            <p className="font-mono text-[10px] text-on-surface-variant tracking-[0.2em] uppercase">
              Write your first chapter in the admin panel
            </p>
          </div>
        )}

        {chapters.toReversed().map((chapter, i) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, delay: 0.1 * i, ease }}
          >
            <Link
              href={`/chapter/${chapter.id}`}
              className="group block glass overflow-hidden transition-all duration-700 hover:border-moonstone-blue/30"
            >
              <div className="p-6 md:p-8 transition-all duration-700">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[10px] text-moonstone-blue tracking-[0.2em] uppercase bg-moonstone-blue/10 rounded-full px-3 py-1">
                        Chapter {chapter.number}
                      </span>
                      <span className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase flex items-center gap-1.5">
                        <Clock size={10} weight="light" />
                        {chapterWords(chapter.content)} words
                      </span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl tracking-tight text-on-surface group-hover:text-moonstone-blue transition-all duration-500">
                      {chapter.title}
                    </h2>
                    <p className="text-on-surface-variant text-sm mt-2 line-clamp-2 leading-relaxed">
                      {chapter.content[0]?.text}
                    </p>
                  </div>
                  <div className="hidden md:flex w-12 h-12 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10 items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-moonstone-blue/10 group-hover:ring-moonstone-blue/30 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                    <ArrowRight size={18} weight="light" className="text-on-surface-variant group-hover:text-moonstone-blue transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
