'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Eye, Trash, X } from '@phosphor-icons/react'
import type { Character } from '@/lib/types'

export function CharacterContent() {
  const params = useParams()
  const router = useRouter()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params?.id
    if (id) {
      fetch(`/api/characters?id=${id}`)
        .then((r) => r.json())
        .then((data) => {
          setCharacter(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params?.id])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose()
  }

  if (loading) return null
  if (!character) return null

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-black/70 backdrop-blur-sm pt-16 md:pt-6 px-4 md:px-8 pb-20 flex items-start justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" onClick={handleBackdropClick}>
      <div className="relative w-full max-w-6xl bg-[#fbf9f5] rounded-2xl shadow-2xl border border-black/5">
        <div className="sticky top-0 z-10 bg-[#fbf9f5] pt-4 pb-3 px-6 md:px-8 flex items-center justify-between border-b border-black/5 rounded-t-2xl">
          <button onClick={handleClose} className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
            <X size={14} weight="bold" />
            Back to Gallery
          </button>
        </div>
        <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">

            {/* LEFT — Artwork */}
            <div className="md:col-span-5 relative w-full h-48 sm:h-64 md:h-full rounded-xl overflow-hidden mb-4 md:mb-0 shadow-md">
              {character.imageUrl ? (
                <img src={character.imageUrl} alt={character.name} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-white/60 flex items-center justify-center mb-4">
                      <span className="font-display text-6xl text-slate-600">{character.name[0]}</span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                      Character Portrait
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono uppercase tracking-widest text-white/90">
                  God of College
                </span>
                <span className="px-3 py-1 rounded-full bg-moonstone-blue/80 backdrop-blur-sm text-[10px] font-mono uppercase tracking-widest text-white">
                  Character
                </span>
              </div>
            </div>

            {/* RIGHT — Content & Properties */}
            <div className="md:col-span-7 flex flex-col justify-between gap-6">

              {/* Header + Actions */}
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-serif font-bold text-slate-900">{character.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-[#e8e4d8]/60 px-3 py-1.5 rounded-full">
                    <Eye size={14} />
                    Terlihat
                  </span>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-2.5 md:gap-4 my-4">
                <div className="bg-[#e8e4d8]/60 border border-transparent rounded-xl p-3">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Karakter
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{character.name}</p>
                </div>
                <div className="bg-[#e8e4d8]/60 border border-transparent rounded-xl p-3">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Kota Origin
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{character.city || '—'}</p>
                </div>
                <div className="bg-[#e8e4d8]/60 border border-transparent rounded-xl p-3">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Judul
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{character.title || '—'}</p>
                </div>
                <div className="bg-[#e8e4d8]/60 border border-transparent rounded-xl p-3">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Faksi
                  </label>
                  <p className="text-sm font-semibold text-slate-800">{character.faction || '—'}</p>
                </div>
                <button className="border border-dashed border-slate-400/50 rounded-xl p-2.5 text-center text-xs text-slate-600 hover:bg-[#e8e4d8]/30 transition-colors">
                  + Add Property
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-4 pb-12 md:pb-4">
                <h2 className="font-serif font-semibold text-xl text-slate-800">Deskripsi</h2>
                <p className="font-serif text-slate-600 leading-relaxed">
                  {character.description}
                </p>
                <div className="pt-4 border-t border-slate-200/60">
                  <p className="font-serif text-slate-600 leading-relaxed italic border-l-2 border-moonstone-blue/30 pl-4">
                    &ldquo;{character.lore}&rdquo;
                  </p>
                </div>
              </div>

          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
