'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { RichTextEditor } from '@/components/editor/rich-text-editor'
import { GlassCard } from '@/components/ui/glass-card'
import { GlassButton } from '@/components/ui/glass-button'
import { ImageCropperModal } from '@/components/ui/image-cropper-modal'
import { DEFAULT_CHAPTER_BANNER_URL } from '@/lib/chapter-banner'
import { paragraphsFromEditorHtml } from '@/lib/chapter-content'
import { FloppyDisk, Eye, Sparkle, UploadSimple, LinkSimple, X } from '@phosphor-icons/react'
import type { Chapter } from '@/lib/types'

export default function WriterPage() {
  const searchParams = useSearchParams()
  const editingId = searchParams.get('id')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(editingId))
  const [chapterNumber, setChapterNumber] = useState(1)
  const [createdAt, setCreatedAt] = useState('')
  const [saved, setSaved] = useState(false)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)
  const [pendingCropUrl, setPendingCropUrl] = useState('')

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreview('')
      return
    }

    const objectUrl = URL.createObjectURL(bannerFile)
    setBannerPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [bannerFile])

  useEffect(() => {
    if (!editingId) {
      fetch('/api/chapters')
        .then((r) => r.json())
        .then((list) => {
          const arr = Array.isArray(list) ? list : Object.values(list)
          const max = (arr as Chapter[]).reduce((m, ch) => Math.max(m, ch.number), 0)
          setChapterNumber(max + 1)
        })
        .catch(() => {})
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadChapter() {
      setIsLoading(true)
      const response = await fetch(`/api/chapters?id=${editingId}`)
      if (!response.ok) {
        setIsLoading(false)
        return
      }

      const chapter = await response.json() as Chapter
      if (cancelled) return

      setTitle(chapter.title)
      setBannerUrl(chapter.bannerUrl ?? '')
      setChapterNumber(chapter.number)
      setCreatedAt(chapter.createdAt)
      setContent(chapter.content.map((paragraph) => `<p>${paragraph.text}</p>`).join(''))
      setIsLoading(false)
    }

    loadChapter()

    return () => {
      cancelled = true
    }
  }, [editingId])

  const selectBannerFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    setPendingCropFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPendingCropUrl(objectUrl)
  }

  const handleCropComplete = (blob: Blob, fileName: string) => {
    const croppedFile = new File([blob], fileName, { type: 'image/jpeg' })
    setBannerFile(croppedFile)
    setPendingCropFile(null)
    URL.revokeObjectURL(pendingCropUrl)
    setPendingCropUrl('')
  }

  const handleCancelCrop = () => {
    setPendingCropFile(null)
    URL.revokeObjectURL(pendingCropUrl)
    setPendingCropUrl('')
  }

  const uploadBannerFile = async () => {
    if (!bannerFile) return bannerUrl.trim()

    const formData = new FormData()
    formData.append('file', bannerFile)

    const response = await fetch('/api/uploads/chapter-banner', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload banner image')
    }

    const data = await response.json()
    return data.url as string
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const savedBannerUrl = await uploadBannerFile()

      await fetch('/api/chapters', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId ?? Date.now().toString(),
          title: title || 'Untitled',
          number: chapterNumber,
          bannerUrl: savedBannerUrl,
          content: paragraphsFromEditorHtml(content),
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })
      setBannerUrl(savedBannerUrl)
      setBannerFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error(error)
      alert('Failed to save chapter banner. Please try another image or use a direct URL.')
    } finally {
      setIsSaving(false)
    }
  }

  const previewUrl = bannerPreview || bannerUrl.trim() || DEFAULT_CHAPTER_BANNER_URL

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Sparkle size={24} className="text-moonstone-blue" weight="light" />
          <h1 className="font-display text-3xl text-on-surface tracking-tight">Writer</h1>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton
            glow="none"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest"
          >
            <Eye size={14} weight="light" /> Preview
          </GlassButton>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="liquid-mercury-btn px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm disabled:opacity-60"
          >
            <FloppyDisk size={16} weight="light" />
            {isSaving ? 'Saving...' : saved ? 'Saved!' : editingId ? 'Update' : 'Save'}
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="glass-panel-light rounded-2xl p-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">
          Loading chapter...
        </div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <GlassCard glow="none" hover={false} className="glass-panel-strong overflow-hidden rounded-3xl p-0 mercury-border">
          <div className="grid gap-4 border-b border-white/10 p-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <label className="block flex-1 min-w-0">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                    Chapter Title
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Chapter Title..."
                    className="w-full bg-transparent font-display text-2xl text-on-surface placeholder:text-on-surface-variant outline-none"
                  />
                </label>
                <label className="block w-24 shrink-0">
                  <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                    No.
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-800/60 border border-white/10 rounded-xl px-3 py-2 text-center font-mono text-lg text-on-surface outline-none focus:border-moonstone-blue/40 transition"
                  />
                </label>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-slate-200">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm tracking-tight text-white/90">Hero Banner Image</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">PNG, JPG, or WebP</p>
                  </div>
                  {bannerFile && (
                    <button
                      type="button"
                      onClick={() => setBannerFile(null)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:bg-white/10 hover:text-white"
                      title="Clear selected file"
                    >
                      <X size={14} weight="light" />
                    </button>
                  )}
                </div>

                <label
                  onDragOver={(event) => {
                    event.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setIsDragging(false)
                    selectBannerFile(event.dataTransfer.files[0])
                  }}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 transition ${
                    isDragging
                      ? 'border-moonstone-blue/70 bg-moonstone-blue/10'
                      : 'border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
                    <UploadSimple size={18} className="text-moonstone-blue" weight="light" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white/80">
                      {bannerFile ? bannerFile.name : 'Drop image here or click to upload'}
                    </span>
                    <span className="block font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                      File upload
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => selectBannerFile(event.target.files?.[0])}
                  />
                </label>

                <label className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <LinkSimple size={16} className="shrink-0 text-white/35" weight="light" />
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(event) => setBannerUrl(event.target.value)}
                    placeholder="https://example.com/banner.webp"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 placeholder:text-white/25 outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-slate-200">
              <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Live Preview</p>
              <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <img
                  src={previewUrl}
                  alt="Hero banner preview"
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const image = event.currentTarget
                    if (image.src.endsWith(DEFAULT_CHAPTER_BANNER_URL)) return
                    image.src = DEFAULT_CHAPTER_BANNER_URL
                  }}
                />
              </div>
            </div>
          </div>
          <RichTextEditor content={content} onChange={setContent} />
        </GlassCard>
      </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="glass-panel-light rounded-2xl p-5 space-y-2"
      >
        <h3 className="font-display text-sm text-on-surface tracking-tight">Tips</h3>
        <ul className="space-y-1 font-mono text-[11px] text-on-surface-variant">
          <li>• Type <kbd className="glass-panel rounded px-1.5 py-0.5 text-moonstone-blue">/</kbd> to open the command menu and insert audio blocks or dividers</li>
          <li>• Type <kbd className="glass-panel rounded px-1.5 py-0.5 text-moonstone-blue">@</kbd> followed by a character name to link an entity from your world</li>
          <li>• Use the toolbar to format text, add headings, lists, and quotes</li>
        </ul>
      </motion.div>

      <ImageCropperModal
        open={Boolean(pendingCropFile)}
        imageSrc={pendingCropUrl}
        fileName={pendingCropFile?.name || 'banner.jpg'}
        onCrop={handleCropComplete}
        onCancel={handleCancelCrop}
      />
    </div>
  )
}
