'use client'

import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudio } from '@/lib/hooks/use-audio'

interface AudioTriggerProps {
  audioUrl?: string
  paragraphId: string
}

export function AudioTrigger({ audioUrl, paragraphId }: AudioTriggerProps) {
  const { playing, toggle } = useAudio(audioUrl)

  if (!audioUrl) return null

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all',
        playing
          ? 'text-amber-300'
          : 'text-amber-300/60 hover:text-amber-300'
      )}
      title={playing ? 'Mute' : 'Play audio'}
    >
      {playing ? <Volume2 size={14} /> : <VolumeX size={14} />}
    </motion.button>
  )
}
