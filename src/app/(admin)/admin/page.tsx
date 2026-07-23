'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassPanel } from '@/components/ui/glass-panel'
import type { Icon } from '@phosphor-icons/react'
import {
  BookOpenText, Users, ImageSquare, Globe, PencilLine, ArrowRight,
  BookOpen, Sword, Sparkle,
} from '@phosphor-icons/react'

const easeInOutExpo: [number, number, number, number] = [0.32, 0.72, 0, 1]

interface Stat {
  icon: Icon
  label: string
  value: number | string
  href: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/chapters').then((r) => r.json()),
      fetch('/api/characters').then((r) => r.json()),
      fetch('/api/gallery').then((r) => r.json()),
      fetch('/api/canvas').then((r) => r.json()),
    ]).then(([ch, chars, gallery, canvas]) => {
      const chapters = Array.isArray(ch) ? ch : []
      const characters = Array.isArray(chars) ? chars : []
      const galleryItems = Array.isArray(gallery) ? gallery : []
      const canvasData = canvas as { nodes?: unknown[] } | undefined
      setStats([
        { icon: BookOpenText, label: 'Chapters', value: chapters.length, href: '/admin/chapters' },
        { icon: Users, label: 'Characters', value: characters.length, href: '/wiki' },
        { icon: ImageSquare, label: 'Gallery', value: galleryItems.length, href: '/admin/gallery' },
        { icon: Globe, label: 'Canvas Nodes', value: canvasData?.nodes?.length ?? 0, href: '/admin/canvas' },
        { icon: Sword, label: 'Factions', value: new Set(characters.map((c: { faction: string }) => c.faction)).size, href: '/wiki' },
        { icon: BookOpen, label: 'Total Chapters', value: chapters.length, href: '/admin/chapters' },
      ])
      setLoaded(true)
    })
  }, [])

  const adminLinks: { icon: Icon; label: string; desc: string; href: string }[] = [
    { icon: PencilLine, label: 'Writer', desc: 'Write new chapters', href: '/admin/writer' },
    { icon: BookOpenText, label: 'Chapters', desc: 'Manage all chapters', href: '/admin/chapters' },
    { icon: Users, label: 'Characters', desc: 'Manage all characters', href: '/admin/characters' },
    { icon: ImageSquare, label: 'Gallery', desc: 'Manage gallery images', href: '/admin/gallery' },
    { icon: Globe, label: 'Canvas', desc: 'World node graph editor', href: '/admin/canvas' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: easeInOutExpo }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkle size={28} className="text-moonstone-blue" weight="light" />
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">Admin</h1>
        </div>
        <p className="text-white/50 text-sm md:text-base max-w-xl">
          Manage your world — chapters, gallery, canvas, and characters.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.06, ease: easeInOutExpo }}
          >
            <Link href={s.href}>
              <GlassPanel className="text-center py-6 px-3 cursor-pointer hover:ring-moonstone-blue/30 transition-all duration-500">
                <s.icon size={24} className="mx-auto text-moonstone-blue/70 mb-2" weight="light" />
                <p className="font-display text-2xl md:text-3xl tracking-tight mb-0.5">{s.value}</p>
                <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em]">{s.label}</p>
              </GlassPanel>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminLinks.map((link, i) => (
          <motion.div
            key={link.label}
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.08, ease: easeInOutExpo }}
          >
            <Link href={link.href} className="block group">
              <div className="glass p-6 md:p-8 flex items-center gap-5 transition-all duration-700 hover:border-moonstone-blue/30">
                  <div className="w-12 h-12 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center shrink-0 group-hover:ring-moonstone-blue/30 group-hover:bg-moonstone-blue/10 transition-all duration-500">
                    <link.icon size={22} className="text-moonstone-blue/70" weight="light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg tracking-tight text-white/80 group-hover:text-moonstone-blue transition-all duration-500">
                      {link.label}
                    </h3>
                    <p className="text-white/40 text-sm mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight size={18} weight="light" className="text-white/20 group-hover:text-moonstone-blue/50 transition-all duration-500 shrink-0" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
