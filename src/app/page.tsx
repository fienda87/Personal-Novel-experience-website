'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

interface Chapter {
  id: string
  title: string
  number: number
  content: { text: string }[]
}

interface CharacterData {
  id: string
  name: string
  faction: string
  title: string
}

const revealProps = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: '-50px' as const },
  transition: { duration: 0.6, ease: 'easeOut' as const },
}

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [loaded, setLoaded] = useState(false)
  const { scrollY } = useScroll()
  const glowY = useTransform(scrollY, [0, 1000], [0, 200])
  const glowOpacity = useTransform(scrollY, [0, 800], [0.15, 0.05])

  useEffect(() => {
    Promise.all([
      fetch('/api/chapters').then((r) => r.json()),
      fetch('/api/characters').then((r) => r.json()),
    ]).then(([ch, chars]) => {
      const chList: Chapter[] = Array.isArray(ch) ? ch : Object.values(ch)
      const charList: CharacterData[] = Array.isArray(chars) ? chars : Object.values(chars)
      setChapters(chList)
      setCharacters(charList)
      setLoaded(true)
    })
  }, [])

  const sorted = [...chapters].sort((a, b) => a.number - b.number)
  const firstChapter = sorted[0]
  const latestChapter = sorted[sorted.length - 1]
  const factions = new Set(characters.map((c) => c.faction))

  return (
    <main className="relative min-h-screen overflow-x-hidden max-w-full">
      {/* Parallax floating glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 will-change-transform"
        style={{ y: glowY, opacity: glowOpacity }}
      >
        <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-moonstone-blue/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-ethereal-teal/8 blur-[100px]" />
      </motion.div>

      <div className="relative z-10">
        <section className="relative w-full min-h-[85vh] grid grid-cols-1 md:grid-cols-12 border-b border-white/15 pt-24 md:pt-28 pb-12 px-6 md:px-12 items-end bg-transparent overflow-x-clip">
          <div className="md:col-span-8 flex flex-col justify-end pb-8 md:pb-16 relative z-10">
            <span className="text-xs font-mono tracking-[0.2em] text-slate-300 font-normal mb-6 flex items-center gap-2">
              A206 STUDIO // CREATED BY FI THE CREATOR // ISSUE 2026
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight text-white leading-[1.1] max-w-3xl mb-6">
              Crafting Epic Worlds & Unforgettable Chronicles.
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-sans max-w-lg leading-relaxed mb-8">
              Halo! Saya Fi, creator di balik A206 Studio. Di sini kamu bisa membaca karya web novel saya, menjelajahi peta dunia, serta menyelami kisah Baydar dalam petualangannya di God of College.
            </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {firstChapter && (
                  <Link
                    href={`/chapter/${firstChapter.id}`}
                    className="inline-flex items-center justify-center gap-3 bg-slate-100 text-slate-950 font-mono text-xs font-bold uppercase tracking-widest px-6 py-4 min-h-[44px] rounded-none border border-slate-100 hover:bg-transparent hover:text-white transition-all cursor-pointer pointer-events-auto"
                  >
                    <span>[ 01 ]</span>
                    EXPLORE GOD OF COLLEGE
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                )}
                <Link
                  href="/wiki"
                  className="inline-flex items-center justify-center gap-2 bg-transparent text-slate-300 font-mono text-xs tracking-widest px-6 py-4 min-h-[44px] rounded-none border border-white/20 hover:border-white transition-all pointer-events-auto"
                >
                  INDEX OF WORKS [ 04 ]
                </Link>
              </div>
            </div>

            {/* RIGHT — Spec Sheet — Desktop */}
            <div className="md:col-span-4 border-l border-white/10 pl-8 hidden md:flex flex-col justify-between h-full py-4 relative">
              <div className="space-y-8 relative z-10">
                <div>
                  <span className="text-xs font-mono text-slate-400 tracking-wider font-normal block mb-1">
                    CURRENT PROJECT
                  </span>
                  <span className="text-sm font-mono text-slate-200 tracking-wide">
                    GOD OF COLLEGE (ONGOING)
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-400 tracking-wider font-normal block mb-1">
                    WORDS PUBLISHED
                  </span>
                  <span className="text-sm font-mono text-slate-200 tracking-wide">
                    {chapters.reduce((sum, ch) => sum + (ch.content || []).reduce((s, p) => s + p.text.split(/\s+/).length, 0), 0).toLocaleString()}+
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-400 tracking-wider font-normal block mb-1">
                    CATALOGUE
                  </span>
                  <span className="text-sm font-mono text-slate-200 tracking-wide">
                    {chapters.length} STORIES
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 z-0 pointer-events-none select-none flex justify-end items-end">
                <span className="font-serif font-bold text-white/10 text-6xl sm:text-7xl lg:text-[140px] xl:text-[170px] leading-none tracking-tight">
                  A206
                </span>
              </div>
            </div>

        </section>

        {/* Mobile Spec Sheet */}
        <div className="grid grid-cols-2 gap-4 px-4 sm:px-6 py-6 border-b border-white/15 md:hidden font-mono">
          <div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-1">Current Project</p>
            <p className="text-xs text-slate-200">God Of College</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-1">Words Published</p>
            <p className="text-xs text-slate-200">{chapters.reduce((sum, ch) => sum + (ch.content || []).reduce((s, p) => s + p.text.split(/\s+/).length, 0), 0).toLocaleString()}+</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-1">Catalogue</p>
            <p className="text-xs text-slate-200">{chapters.length} Stories</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-1">Status</p>
            <p className="text-xs text-slate-200">Ongoing</p>
          </div>
        </div>

        {loaded && (
          <>
            {/* FLAGSHIP NOVEL SHOWCASE */}
            <motion.section {...revealProps} className="w-full border-t border-white/15 bg-transparent">
              <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 md:border-r border-white/10 overflow-hidden">
                  <img
                    src="/1001172099.jpg"
                    alt="God of College poster"
                    className="w-full max-w-[280px] sm:max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-2xl my-6 md:my-0 md:min-h-[70vh] aspect-[3/4] object-cover"
                  />
                </div>
                <div className="md:col-span-7 flex flex-col justify-center px-4 sm:px-6 md:px-16 py-8 md:py-12 pb-10">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 font-normal mb-3 md:mb-4">
                    [ FEATURED NOVEL 01 ]
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl tracking-tight text-white mb-3 md:mb-4">
                    God Of College
                  </h2>
                  <span className="text-[10px] md:text-[11px] font-mono text-slate-400 mb-4 md:mb-6">
                    {chapters.reduce((sum, ch) => sum + (ch.content || []).reduce((s, p) => s + p.text.split(/\s+/).length, 0), 0).toLocaleString()}K Words | Ongoing | Fantasy-Academy
                  </span>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-lg border-l-2 border-white/20 pl-3 md:pl-4 mb-6 md:mb-8">
                    Baydar tersedot ke dunia paralel melalui portal misterius, menjadi mahasiswa ITK dan menemukan SSS+ Skill yang belum pernah dia ketahui. Kini dia harus melawan organisasi PAUD dan mengungkap identitas sejatinya.
                  </p>
                  <Link
                    href={latestChapter ? `/chapter/${latestChapter.id}` : '#'}
                    className="inline-flex items-center justify-center gap-3 bg-slate-100 text-slate-950 font-mono text-xs font-bold uppercase tracking-widest px-6 py-4 min-h-[44px] border border-slate-100 hover:bg-transparent hover:text-white transition-all w-fit mb-4 relative z-10"
                  >
                    LANJUT BACA BAB {latestChapter?.number || 'X'} →
                  </Link>
                </div>
              </div>
            </motion.section>

            {/* CATALOGUE / OTHER WORKS */}
            <motion.section {...revealProps} className="w-full border-t border-white/15 bg-transparent">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-12">
                <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-slate-400 block mb-6 md:mb-8">
                  Katalog Karya A206 Studio
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/15 py-6 md:py-8">
                  {[
                    { num: '01', title: 'God Of College', status: 'Ongoing' },
                  ].map((work) => (
                    <div key={work.num} className="px-0 md:px-6 py-4 md:py-0 group cursor-pointer">
                      <span className="text-sm font-mono text-slate-200 group-hover:text-white transition-colors">
                        {work.num}. {work.title}
                      </span>
                      <p className="text-[11px] font-mono text-slate-500 mt-1 tracking-wide">
                        {work.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* STATS BAR */}
            <motion.section {...revealProps} className="w-full border-t border-white/15 bg-transparent">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12">
                  <div className="flex justify-between items-center py-5 md:py-6 border-b border-white/15 text-center font-mono">
                  <span className="text-[10px] md:text-xs text-slate-300 tracking-wide">
                    {String(chapters.length).padStart(2, '0')} BAB
                  </span>
                  <span className="w-px h-3 md:h-4 bg-white/20" />
                  <span className="text-[10px] md:text-xs text-slate-300 tracking-wide">
                    {String(characters.length).padStart(2, '0')} KARAKTER
                  </span>
                  <span className="w-px h-3 md:h-4 bg-white/20" />
                  <span className="text-[10px] md:text-xs text-slate-300 tracking-wide">
                    {String(factions.size).padStart(2, '0')} FAKSI
                  </span>
                  <span className="w-px h-3 md:h-4 bg-white/20" />
                  <span className="text-[10px] md:text-xs text-slate-300 tracking-wide">
                    {chapters.reduce((sum, ch) => sum + (ch.content || []).reduce((s, p) => s + p.text.split(/\s+/).length, 0), 0).toLocaleString()} TOTAL
                  </span>
                </div>
              </div>
            </motion.section>

            {/* LATEST CHAPTERS FEED */}
            <motion.section {...revealProps} className="w-full border-t border-white/15 bg-transparent">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-16">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                  <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
                    Latest Releases
                  </span>
                  <Link href="/library" className="text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-slate-200 transition-all">
                    Lihat Semua →
                  </Link>
                </div>
                <div className="divide-y divide-white/10">
                  {[...sorted].reverse().map((ch, i) => {
                    const wordCount = (ch.content || []).reduce((s, p) => s + p.text.split(/\s+/).length, 0)
                    const readTime = Math.max(1, Math.ceil(wordCount / 200))
                    return (
                      <Link key={ch.id} href={`/chapter/${ch.id}`}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, margin: '-30px' }}
                          transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                          className="group flex flex-col md:grid md:grid-cols-12 gap-1 md:gap-4 items-start md:items-center py-4 md:py-5"
                        >
                          <div className="flex items-center gap-3 md:gap-4 md:col-span-6 w-full">
                            <span className="text-xs font-mono text-slate-500 w-6 md:w-8 shrink-0">
                              {String(ch.number).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="text-sm md:text-base font-serif font-semibold text-white group-hover:text-white transition-colors">
                                {ch.title}
                              </h3>
                              <span className="text-[10px] md:text-[11px] font-mono text-slate-400">
                                Bab {ch.number}
                                {i === 0 && (
                                  <span className="text-slate-500 ml-2 md:ml-3">— Terbaru</span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 md:gap-5 md:justify-end text-[10px] md:text-[11px] font-mono text-slate-400 md:col-span-6 ml-9 md:ml-0">
                            <span>{wordCount.toLocaleString()} kata</span>
                            <span>{readTime} mnt</span>
                            <span className="text-slate-500 group-hover:text-slate-300 transition-colors ml-auto md:ml-0">→</span>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.section>

          </>
        )}

        {/* FOOTER */}
        <motion.footer {...revealProps} className="border-t border-white/15 py-6 md:py-8 px-4 sm:px-6 md:px-12 bg-transparent">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between text-[10px] md:text-xs font-mono text-slate-400 gap-2 md:gap-0">
            <span>A206 STUDIO © 2026 // CREATED BY FI THE CREATOR</span>
            <span className="hidden md:block">GOD OF COLLEGE OFFICIAL WIKI</span>
          </div>
        </motion.footer>
      </div>
    </main>
  )
}
