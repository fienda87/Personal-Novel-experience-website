'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, SpeakerHigh, Bookmark, ShareNetwork } from '@phosphor-icons/react'
import { InteractiveText } from '@/components/reader/interactive-text'
import { AudioTrigger } from '@/components/reader/audio-trigger'
import { ReadingControls } from '@/components/reader/reading-controls'
import { DEFAULT_CHAPTER_BANNER_URL, getChapterBannerUrl } from '@/lib/chapter-banner'
import { normalizeParagraphs } from '@/lib/chapter-content'
import { cn } from '@/lib/utils'
import type { Chapter, Paragraph } from '@/lib/types'

export function ChapterContent() {
  const params = useParams<{ id: string }>()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [allChapters, setAllChapters] = useState<Chapter[]>([])
  const [fontSize, setFontSize] = useState(18)
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif')
  const [distractionFree, setDistractionFree] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const bannerScale = useTransform(scrollY, [0, 600], [1.05, 1.15])
  const bannerOpacity = useTransform(scrollY, [0, 500], [1, 0.4])
  const gradientOpacity = useTransform(scrollY, [0, 500], [1, 0.6])

  useEffect(() => {
    if (!params.id) return

    fetch(`/api/chapters?id=${params.id}`)
      .then((r) => r.json())
      .then(setChapter)

    fetch('/api/chapters')
      .then((r) => r.json())
      .then((list) => { if (Array.isArray(list)) setAllChapters(list) })
      .catch(() => {})
  }, [params.id])

  const sortedChapters = useMemo(
    () => [...allChapters].sort((a, b) => a.number - b.number),
    [allChapters]
  )

  const currentIndex = useMemo(
    () => sortedChapters.findIndex((c) => c.id === params.id),
    [sortedChapters, params.id]
  )

  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
  const nextChapter = currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      setScrollProgress((winScroll / height) * 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!chapter) return null

  const paragraphs = normalizeParagraphs(chapter.content)
  const totalWords = paragraphs.reduce((sum, p) => sum + p.text.split(/\s+/).filter(Boolean).length, 0)
  const readTime = Math.max(1, Math.round(totalWords / 200))
  const bannerUrl = getChapterBannerUrl(chapter.bannerUrl)

  return (
    <div className="min-h-screen relative">
      <div className="fixed top-16 left-0 w-full z-40 h-0.5 bg-white/5">
        <div className="h-full bg-teal-400/60 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className={cn('mx-auto px-4 pb-32 pt-28', distractionFree ? 'max-w-2xl' : 'max-w-4xl')}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div ref={bannerRef} className="relative w-full overflow-hidden will-change-transform">
            <motion.img
              src={bannerUrl}
              alt={`${chapter.title} hero banner`}
              style={{ scale: bannerScale, opacity: bannerOpacity }}
              className="w-full h-56 md:h-72 object-cover block rounded-t-3xl"
              onError={(event) => {
                const image = event.currentTarget
                if (image.src.endsWith(DEFAULT_CHAPTER_BANNER_URL)) return
                image.src = DEFAULT_CHAPTER_BANNER_URL
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]/60"
              style={{ opacity: gradientOpacity }}
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm font-serif italic text-teal-300 mb-2">
                  <span>{readTime} min read</span>
                  <span className="opacity-40">·</span>
                  <span>{totalWords} words</span>
                  <span className="opacity-40">·</span>
                  <span>{paragraphs.length} paragraphs</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">
                  {chapter.title}
                </h1>
              </div>

              <div className="flex items-center gap-2 shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-2 py-1">
                <ReadingControls
                  fontSize={fontSize}
                  onFontSizeChange={setFontSize}
                  fontFamily={fontFamily}
                  onFontFamilyChange={setFontFamily}
                  distractionFree={distractionFree}
                  onDistractionFreeChange={setDistractionFree}
                  dark
                />
              </div>
            </div>

            <div className="border-b border-white/10 mb-8" />

            <div className="flex gap-8">
              <div className="hidden md:flex flex-col gap-48 mt-2 pointer-events-none">
                <div className="flex flex-col items-center gap-2 text-teal-300/40">
                  <SpeakerHigh size={18} weight="light" />
                  <div className="w-px h-24 bg-gradient-to-b from-current to-transparent" />
                </div>
              </div>

              <article className="flex-1 min-w-0">
                {paragraphs.map((paragraph: Paragraph, i: number) => {
                  const isAudioBlock = !paragraph.text && paragraph.audioUrl
                  return (
                  <motion.div
                    key={paragraph.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * i }}
                    className={cn('group relative', isAudioBlock ? 'mb-6' : 'mb-10')}
                  >
                    {isAudioBlock ? (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <audio controls src={paragraph.audioUrl} className="w-full" />
                      </div>
                    ) : (
                      <>
                    <div
                      className="tracking-wide leading-[1.9]"
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: fontFamily === 'serif'
                          ? 'Georgia, "Lora", "Merriweather", serif'
                          : 'Inter, "Plus Jakarta Sans", sans-serif',
                        color: '#f1f5f9',
                      }}
                    >
                      <InteractiveText
                        text={paragraph.text}
                        mentions={paragraph.mentions}
                      />
                    </div>
                    {paragraph.audioUrl && (
                      <div className="absolute -left-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-amber-500/20 text-amber-300 p-2 rounded-xl backdrop-blur-md">
                          <AudioTrigger audioUrl={paragraph.audioUrl} paragraphId={paragraph.id} />
                        </div>
                      </div>
                    )}
                    </>
                    )}
                  </motion.div>
                  )
                })}

                <div className="my-16 border-y border-white/10 py-8 flex flex-col items-center text-center italic text-slate-500">
                  <span className="text-3xl mb-4 opacity-30">✦</span>
                  <p className="max-w-md text-lg font-serif text-slate-400">
                    &ldquo;The gears of fate do not grind for the righteous, Scion. They grind for the persistent.&rdquo;
                  </p>
                </div>

                <div className="flex justify-between items-center mt-20 pt-10 border-t border-white/10">
                  {prevChapter ? (
                    <Link href={`/chapter/${prevChapter.id}`} className="group flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Previous Chapter</span>
                      <span className="flex items-center gap-1 font-sans font-semibold text-slate-200 transition-colors group-hover:text-teal-300">
                        <ArrowLeft size={14} weight="light" />
                        {prevChapter.title}
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextChapter ? (
                    <Link href={`/chapter/${nextChapter.id}`} className="group flex flex-col items-end">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Next Chapter</span>
                      <span className="flex items-center gap-1 font-sans font-semibold text-slate-200 transition-colors group-hover:text-teal-300">
                        {nextChapter.title}
                        <ArrowRight size={14} weight="light" />
                      </span>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </article>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="hidden xl:flex flex-col gap-4 fixed right-8 top-32">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex flex-col gap-4 shadow-lg">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-teal-300" title="Bookmark">
            <Bookmark size={18} weight="light" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-300" title="Audio Mode">
            <SpeakerHigh size={18} weight="light" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-slate-300" title="Share">
            <ShareNetwork size={18} weight="light" />
          </button>
        </div>
      </div>
    </div>
  )
}
