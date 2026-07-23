'use client'

import { useState, useRef, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MagnifyingGlassMinus, MagnifyingGlassPlus } from '@phosphor-icons/react'

function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(null); return }
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
      )
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92)
    }
    image.onerror = () => resolve(null)
    image.src = imageSrc
  })
}

type ImageCropperModalProps = {
  open: boolean
  imageSrc: string
  fileName: string
  onCrop: (blob: Blob, fileName: string) => void
  onCancel: () => void
}

export function ImageCropperModal({ open, imageSrc, fileName, onCrop, onCancel }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const zoomRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels)
      if (!blob) { alert('Failed to crop image'); setIsProcessing(false); return }
      const ext = fileName.match(/\.\w+$/)?.[0]?.toLowerCase() || '.jpg'
      const croppedName = fileName.replace(/\.[^/.]+$/, '') + '-cropped' + ext
      onCrop(blob, croppedName)
    } catch {
      alert('Failed to crop image')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="font-display text-lg text-white/90">Crop Banner Image</h2>
              <button
                onClick={onCancel}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            <div className="relative w-full bg-black/40" style={{ height: 420 }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                restrictPosition
                objectFit="cover"
              />
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <MagnifyingGlassMinus size={16} className="text-white/40" weight="light" />
                <input
                  ref={zoomRef}
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-moonstone-blue
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-moonstone-blue [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <MagnifyingGlassPlus size={16} className="text-white/40" weight="light" />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-full text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="liquid-mercury-btn px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {isProcessing ? 'Processing...' : 'Potong & Simpan'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
