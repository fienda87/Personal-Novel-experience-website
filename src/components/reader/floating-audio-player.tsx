'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudio } from '@/lib/hooks/use-audio'

export function FloatingAudioPlayer() {
  const [expanded, setExpanded] = useState(false)
  const { playing, muted, volume, toggle, setMuted, setVolume } = useAudio('/audio/ambient.mp3')

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={cn(
        'glass-panel fixed bottom-28 right-6 z-40 flex items-center gap-3',
        expanded ? 'p-4 pr-6' : 'p-3'
      )}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-3 overflow-hidden"
          >
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-moonstone-blue/20 text-moonstone-blue transition-colors hover:bg-moonstone-blue/30"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-medium text-on-surface">Ambient Music</span>
              <span className="text-[10px] text-on-surface-variant">Whispers of the Realm</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMuted(!muted)}
                className="rounded p-1 text-on-surface-variant transition-colors hover:text-on-surface"
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setMuted(false)
                }}
                className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/10 accent-moonstone-blue"
              />
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(true)}
            className="flex items-center justify-center text-moonstone-blue"
          >
            <Music size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="rounded p-0.5 text-on-surface-variant transition-colors hover:text-on-surface"
      >
        {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </motion.div>
  )
}
