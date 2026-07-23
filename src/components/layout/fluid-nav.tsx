'use client'

import { useEffect, startTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, BookOpenText, Users, Cube, Gear, ImageSquare, X } from '@phosphor-icons/react'
import { useNav } from './nav-context'

const navItems = [
  { href: '/', label: 'Home', icon: Compass },
  { href: '/library', label: 'Read', icon: BookOpenText },
  { href: '/wiki', label: 'Characters', icon: Users },
  { href: '/admin/canvas', label: 'World', icon: Cube },
  { href: '/admin/chapters', label: 'Chapters', icon: Gear },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageSquare },
]

const stagger = 0.08

export function FluidNav() {
  const pathname = usePathname()
  const { isMenuOpen, setMenuOpen } = useNav()

  useEffect(() => {
    startTransition(() => {
      setMenuOpen(false)
    })
  }, [pathname])

  return (
    <>
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div
          className={`pointer-events-auto mt-4 md:mt-6 flex items-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isMenuOpen
              ? 'w-[calc(100%-32px)] md:w-[calc(100%-64px)] max-w-7xl bg-black/80 backdrop-blur-3xl rounded-[2rem] px-6 py-3 justify-between'
              : 'w-max bg-black/60 backdrop-blur-2xl rounded-full px-3 md:px-6 py-2.5 md:py-3 justify-center'
          }`}
        >
          {!isMenuOpen && (
            <div className="w-8" aria-hidden="true" />
          )}
          <Link href="/" className="flex items-center pointer-events-auto">
            <span className="font-serif text-base md:text-lg tracking-tight text-on-surface">
              God Of College
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/library"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-on-surface-variant hover:text-on-surface transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <BookOpenText size={16} weight="light" />
              <span>Read</span>
            </Link>

            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="relative w-8 h-8 flex items-center justify-center pointer-events-auto"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className={`absolute h-[1.5px] w-5 bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMenuOpen ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-[1.5px] w-5 bg-current rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  isMenuOpen ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-10"
              aria-label="Close menu"
            >
              <X size={18} weight="bold" />
            </button>

            <nav className="flex flex-col items-center gap-6 md:gap-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                  transition={{
                    duration: 0.6,
                    delay: i * stagger,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-center gap-0 md:gap-4 text-4xl md:text-6xl font-display tracking-tight transition-all duration-500 ${
                      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        ? 'text-moonstone-blue'
                        : 'text-on-surface/40 hover:text-on-surface'
                    }`}
                  >
                    <item.icon
                      size={32}
                      weight="light"
                      className="hidden md:block opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
