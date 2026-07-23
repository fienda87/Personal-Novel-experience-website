'use client'

import { usePathname } from 'next/navigation'

const backgrounds: Record<string, string> = {
  '/admin/canvas': '/bg-world.jpg',
  '/chapter/': '/bg-read.jpg',
  '/wiki/': '/bg-wiki.jpg',
}

export function SiteBackground() {
  const pathname = usePathname()
  const src = Object.entries(backgrounds).find(([key]) =>
    pathname.includes(key),
  )?.[1]

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0a0f1d]">
      <img
        src={src ?? '/background.jpg'}
        alt=""
        className="w-full h-full object-cover scale-105"
        style={{ filter: 'blur(20px)' }}
      />
      <div className="absolute inset-0 bg-slate-950/40" />
    </div>
  )
}
