'use client'

import { useEffect, useState, startTransition } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassButton } from '@/components/ui/glass-button'
import { DEFAULT_CHAPTER_BANNER_URL, getChapterBannerUrl } from '@/lib/chapter-banner'
import {
  Plus, TrashSimple, BookOpenText,
  CaretRight, Warning, PencilSimple,
} from '@phosphor-icons/react'

interface Chapter {
  id: string
  title: string
  number: number
  bannerUrl?: string
  createdAt: string
  updatedAt: string
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loaded, setLoaded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/chapters')
      const data = await res.json()
      const sorted = Array.isArray(data) ? data.sort((a: Chapter, b: Chapter) => a.number - b.number) : []
      startTransition(() => { setChapters(sorted); setLoaded(true) })
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/chapters?id=${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    async function reload() {
      const res = await fetch('/api/chapters')
      const data = await res.json()
      const sorted = Array.isArray(data) ? data.sort((a: Chapter, b: Chapter) => a.number - b.number) : []
      startTransition(() => { setChapters(sorted); setLoaded(true) })
    }
    reload()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex items-center justify-between mb-10"
      >
        <div className="flex items-center gap-3">
          <BookOpenText size={28} className="text-moonstone-blue" weight="light" />
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Chapters</h1>
        </div>
        <Link href="/admin/writer">
          <GlassButton glow="moonstone" size="sm" showIcon>
            <Plus size={16} weight="light" /> New Chapter
          </GlassButton>
        </Link>
      </motion.div>

      {!loaded ? (
        <div className="text-center py-20">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.25em]">Loading...</p>
        </div>
      ) : chapters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <BookOpenText size={48} className="mx-auto text-white/10 mb-4" weight="light" />
          <p className="font-display text-xl text-white/40 mb-6">No chapters yet</p>
          <Link href="/admin/writer">
            <GlassButton glow="moonstone" showIcon>Write Your First Chapter</GlassButton>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch, i) => (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="glass p-4 md:p-5 transition-all duration-500 hover:border-moonstone-blue/30">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <img
                        src={getChapterBannerUrl(ch.bannerUrl)}
                        alt={`${ch.title} banner`}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          const image = event.currentTarget
                          if (image.src.endsWith(DEFAULT_CHAPTER_BANNER_URL)) return
                          image.src = DEFAULT_CHAPTER_BANNER_URL
                        }}
                      />
                      <div className="absolute left-2 top-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/10 flex items-center justify-center">
                        <span className="font-display text-xs text-moonstone-blue/90">{ch.number}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base md:text-lg tracking-tight text-white/90 truncate">{ch.title}</h3>
                      <p className="font-mono text-[9px] text-white/30 uppercase tracking-wider mt-0.5">
                        Updated {new Date(ch.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/writer?id=${ch.id}`}
                        className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 hover:ring-moonstone-blue/30 transition-all duration-500"
                        title="Edit chapter"
                      >
                        <PencilSimple size={14} className="text-white/50" weight="light" />
                      </Link>
                      <Link
                        href={`/chapter/${ch.id}`}
                        className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 hover:ring-moonstone-blue/30 transition-all duration-500"
                        title="Read chapter"
                      >
                        <BookOpenText size={14} className="text-white/50" weight="light" />
                      </Link>
                      {confirmDelete === ch.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(ch.id)}
                            className="w-9 h-9 rounded-full bg-red-500/20 ring-1 ring-red-500/40 flex items-center justify-center hover:bg-red-500/30 transition-all duration-500"
                          >
                            <Warning size={14} className="text-red-400" weight="fill" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-500"
                          >
                            <CaretRight size={14} className="text-white/50" weight="light" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(ch.id)}
                          className="w-9 h-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-red-500/20 hover:ring-red-500/40 transition-all duration-500"
                        >
                          <TrashSimple size={14} className="text-white/50 group-hover:text-red-400" weight="light" />
                        </button>
                      )}
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
