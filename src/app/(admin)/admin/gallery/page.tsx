'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassButton } from '@/components/ui/glass-button'
import {
  Users, Plus, TrashSimple, X, MagnifyingGlass, Funnel,
  Tag, MapPin, PlusCircle, BookOpenText, Globe, UploadSimple,
  ArrowsClockwise, Question,
} from '@phosphor-icons/react'

interface CharacterStats {
  strength: number
  agility: number
  intelligence: number
  charisma: number
  wisdom: number
  vitality: number
}

interface CharacterRelationship {
  type: 'ally' | 'enemy' | 'lover'
  targetId: string
  targetName: string
}

interface Character {
  id: string
  name: string
  title: string
  role: string
  faction: string
  city: string
  imageUrl: string
  description: string
  lore: string
  stats: CharacterStats
  tags: string[]
  relationships?: CharacterRelationship[]
}

const emptyStats: CharacterStats = { strength: 10, agility: 10, intelligence: 10, charisma: 10, wisdom: 10, vitality: 10 }
const emptyChar: Character = {
  id: '', name: '', title: '', role: '', faction: '', city: '', imageUrl: '',
  description: '', lore: '', stats: { ...emptyStats }, tags: [], relationships: [],
}

const factions = ['Order of the Crimson Flame', 'The Hollow Court', 'Unaligned']
const statKeys: (keyof CharacterStats)[] = ['strength', 'agility', 'intelligence', 'charisma', 'wisdom', 'vitality']
const statLabels: Record<string, string> = {
  strength: 'STR', agility: 'AGI', intelligence: 'INT', charisma: 'CHA', wisdom: 'WIS', vitality: 'VIT',
}

export default function GalleryPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [factionFilter, setFactionFilter] = useState('')
  const [editing, setEditing] = useState<Character | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    loadCharacters()
  }, [])

  async function loadCharacters() {
    const res = await fetch('/api/characters')
    const data = await res.json()
    setCharacters(Array.isArray(data) ? data : [])
    setLoaded(true)
  }

  const filtered = characters.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)
    const matchFaction = !factionFilter || c.faction === factionFilter
    return matchSearch && matchFaction
  })

  const handleSave = async () => {
    if (!editing || !editing.name.trim()) return
    setSaving(true)
    const payload = {
      ...editing,
      id: editing.id || `char-${Date.now()}`,
      tags: typeof editing.tags === 'string'
        ? (editing.tags as unknown as string).split(',').map((t) => t.trim()).filter(Boolean)
        : editing.tags,
    }
    await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    setEditing(null)
    loadCharacters()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/characters?id=${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    setEditing(null)
    loadCharacters()
  }

  const updateField = (field: string, value: unknown) => {
    if (!editing) return
    setEditing({ ...editing, [field]: value })
  }

  const updateStat = (stat: keyof CharacterStats, value: number) => {
    if (!editing) return
    setEditing({ ...editing, stats: { ...editing.stats, [stat]: value } })
  }

  const addTag = (tag: string) => {
    if (!editing || !tag.trim()) return
    setEditing({ ...editing, tags: [...editing.tags, tag.trim()] })
    setNewTag('')
  }

  const removeTag = (i: number) => {
    if (!editing) return
    setEditing({ ...editing, tags: editing.tags.filter((_, idx) => idx !== i) })
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      updateField('imageUrl', url)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-3">
          <Users size={28} className="text-moonstone-blue" weight="light" />
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">Galeri Karakter</h1>
        </div>
        <GlassButton glow="moonstone" size="sm" showIcon onClick={() => setEditing({ ...emptyChar, id: `char-${Date.now()}` })}>
          <Plus size={16} weight="light" /> Tambah Karakter
        </GlassButton>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" weight="light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karakter..."
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:ring-moonstone-blue/40 transition-all duration-500"
          />
        </div>
        <div className="flex gap-1.5 items-center">
          <Funnel size={14} className="text-white/30" weight="light" />
          {['', ...factions].map((f) => (
            <button
              key={f}
              onClick={() => setFactionFilter(factionFilter === f ? '' : f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-500 ${
                factionFilter === f
                  ? 'bg-moonstone-blue/20 ring-1 ring-moonstone-blue/40 text-moonstone-blue'
                  : 'bg-white/5 ring-1 ring-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {!loaded ? (
        <div className="text-center py-20">
          <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.25em]">Loading...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Users size={48} className="mx-auto text-white/10 mb-4" weight="light" />
          <p className="font-display text-xl text-white/40">Belum ada karakter</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
            >
              <button
                onClick={() => setEditing(char)}
                className="w-full text-left group"
              >
                <div className="glass overflow-hidden transition-all duration-500 hover:border-moonstone-blue/30 hover:-translate-y-1">
                  <div className="aspect-[3/2] bg-gradient-to-br from-moonstone-blue/[0.06] to-black flex items-center justify-center relative">
                      {char.imageUrl ? (
                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; ((e.target as HTMLImageElement).nextElementSibling as HTMLElement)?.classList.remove('hidden') }}
                        />
                      ) : null}
                      <div className={`${char.imageUrl ? 'hidden' : ''} flex flex-col items-center`}>
                        <div className="w-14 h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
                          <span className="font-display text-2xl text-moonstone-blue/60">{char.name[0]}</span>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                        <span className="bg-black/60 backdrop-blur-xl px-2 py-0.5 rounded-full text-[8px] font-mono ring-1 ring-white/10 text-white/60 uppercase tracking-wider">
                          Edit
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-display text-sm tracking-tight text-white/90 truncate group-hover:text-moonstone-blue transition-all duration-500">
                        {char.name}
                      </h3>
                      <p className="font-mono text-[8px] text-white/30 uppercase tracking-wider mt-0.5 truncate">
                        {char.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-mono text-white/30 ring-1 ring-white/10">
                          {char.faction.includes(' ') ? char.faction.split(' ').pop() : char.faction}
                        </span>
                        {char.role && (
                          <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[8px] font-mono text-white/30 ring-1 ring-white/10">
                            {char.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* EDITOR MODAL */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="max-w-5xl mx-auto mt-16 mb-8 bg-gradient-to-b from-slate-900/60 to-slate-950/70 backdrop-blur-2xl border border-white/15 text-slate-100 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-20 w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER ACTIONS */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                    <Users size={12} /> Karakter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                    <Question size={14} /> Tutorial
                  </button>
                  <button className="text-xs text-slate-300 hover:text-white transition-all p-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                    <ArrowsClockwise size={14} />
                  </button>
                  <button className="text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                    <ArrowsClockwise size={14} /> History
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="text-xs text-slate-300 hover:text-white transition-all p-2 rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* TWO-COLUMN LAYOUT */}
              <div className="grid grid-cols-12 gap-8">
                {/* LEFT COLUMN — Form Editor */}
                <div className="col-span-12 md:col-span-8 flex flex-col gap-6">

                  {/* Name */}
                  <input
                    value={editing.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Nama Karakter"
                    className="text-3xl font-serif font-bold bg-transparent text-white focus:outline-none placeholder:text-slate-500 w-full mb-2"
                  />

                  {/* Aliases / Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Tag size={12} /> Aliases
                      </span>
                      <button
                        onClick={() => addTag(newTag)}
                        className="text-xs text-slate-400 hover:text-teal-400 transition-all flex items-center gap-1 px-2 py-1 rounded-full border border-white/10 hover:border-teal-500/30"
                      >
                        <Plus size={10} /> Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {editing.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 backdrop-blur-md text-[11px]">
                          {tag}
                          <button onClick={() => removeTag(i)} className="text-slate-500 hover:text-red-400 transition-colors ml-0.5">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addTag(newTag)
                        }}
                        placeholder="Tambah tag..."
                        className="bg-transparent text-xs text-slate-400 placeholder:text-slate-600 outline-none w-24"
                      />
                    </div>
                  </div>

                  {/* Metadata Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <Users size={12} /> Karakter
                      </label>
                      <input
                        value={editing.role}
                        onChange={(e) => updateField('role', e.target.value)}
                        placeholder="Role / Tipe Karakter"
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 text-slate-200 placeholder:text-slate-400 rounded-xl px-4 py-2 text-sm transition-all outline-none focus:border-teal-400/50 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <MapPin size={12} /> Kota
                      </label>
                      <input
                        value={editing.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Kota Origin"
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 text-slate-200 placeholder:text-slate-400 rounded-xl px-4 py-2 text-sm transition-all outline-none focus:border-teal-400/50 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <BookOpenText size={12} /> Judul
                      </label>
                      <input
                        value={editing.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="Title / Gelar"
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 text-slate-200 placeholder:text-slate-400 rounded-xl px-4 py-2 text-sm transition-all outline-none focus:border-teal-400/50 backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                        <Globe size={12} /> Faksi
                      </label>
                      <select
                        value={editing.faction}
                        onChange={(e) => updateField('faction', e.target.value)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl px-4 py-2 text-sm transition-all outline-none focus:border-teal-400/50 backdrop-blur-sm appearance-none"
                      >
                        <option value="">Pilih Faksi</option>
                        {factions.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <button className="text-xs text-slate-400 hover:text-teal-400 transition-all flex items-center gap-1 mt-2 cursor-pointer">
                    <PlusCircle size={12} /> Tambah Properti
                  </button>

                  {/* Rich Text Editor Section */}
                  <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
                    <span className="text-xs font-semibold text-slate-400 block">Teks</span>

                    <textarea
                      value={editing.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Mulai menulis, ketik '/' untuk perintah, atau '@' untuk menyebut kartu..."
                      rows={6}
                      className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 font-serif text-sm focus:outline-none resize-none leading-relaxed"
                    />

                    <div className="pt-4 border-t border-white/10">
                      <textarea
                        value={editing.lore}
                        onChange={(e) => updateField('lore', e.target.value)}
                        placeholder="Lore / Latar Belakang..."
                        rows={4}
                        className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 font-serif text-sm focus:outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <span className="text-xs font-semibold text-slate-400 block mb-3">Stats</span>
                    <div className="grid grid-cols-3 gap-3">
                      {statKeys.map((k) => (
                        <div key={k}>
                          <label className="font-mono text-[10px] text-slate-500 block mb-1">{statLabels[k]}</label>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={editing.stats[k]}
                            onChange={(e) => updateStat(k, Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-xl px-3 py-1.5 text-sm outline-none focus:border-teal-400/50 backdrop-blur-sm transition-all text-center"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN — Artwork Preview */}
                <div className="col-span-12 md:col-span-4">
                  <div
                    className={`w-full h-[320px] rounded-2xl overflow-hidden border border-dashed border-white/20 shadow-lg relative group bg-white/5 hover:border-teal-400/50 backdrop-blur-sm flex flex-col justify-center items-center transition-all ${
                      dragOver ? 'border-teal-500/50 bg-teal-500/10' : ''
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleImageDrop}
                  >
                    {editing.imageUrl ? (
                      <>
                        <img src={editing.imageUrl} alt="" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center gap-2">
                            <UploadSimple size={24} className="text-white/70" />
                            <span className="text-xs text-white/70">Ganti Image Artwork / Drop File</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <UploadSimple size={32} className="text-slate-500 mb-3" />
                        <p className="text-xs text-slate-500 text-center px-4">
                          Drop image here or click to upload
                        </p>
                        <input
                          type="text"
                          value={editing.imageUrl}
                          onChange={(e) => updateField('imageUrl', e.target.value)}
                          placeholder="https://..."
                          className="mt-3 w-[90%] bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-teal-400/50 backdrop-blur-sm transition-all text-center"
                        />
                      </>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Image URL</label>
                    <input
                      type="text"
                      value={editing.imageUrl}
                      onChange={(e) => updateField('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 placeholder:text-slate-400 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-teal-400/50 backdrop-blur-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTIONS */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <div>
                  {confirmDelete === editing.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(editing.id)}
                        className="px-4 py-2 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-red-400 text-xs font-mono uppercase tracking-wider hover:bg-red-500/30 transition-all"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-white/50 text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    editing.id && (
                      <button
                        onClick={() => setConfirmDelete(editing.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-white/40 hover:text-red-400 hover:ring-red-500/40 text-xs font-mono uppercase tracking-wider transition-all"
                      >
                        <TrashSimple size={12} /> Delete
                      </button>
                    )
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-5 py-2 rounded-full text-xs text-slate-400 hover:text-white transition-all border border-white/10 hover:border-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editing.name.trim() || saving}
                    className="px-6 py-2 rounded-full text-xs font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
