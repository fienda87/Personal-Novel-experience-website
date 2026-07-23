'use client'

import { useState, useRef, useEffect } from 'react'
import { useAudio } from './audio-provider'
import { tracks } from './playlist'
import {
  SpeakerHigh,
  SpeakerNone,
  Power,
  Shuffle,
  SkipForward,
  CaretLeft,
  CaretRight,
  MusicNote,
} from '@phosphor-icons/react'

const BAR_COUNT = 20

function FrequencyVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[2px] h-14 px-2">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-moonstone-blue/30 to-moonstone-blue origin-bottom"
          style={{
            height: '30%',
            animation: isPlaying
              ? `freq-bar ${0.35 + (i % 5) * 0.08}s ease-in-out infinite`
              : 'none',
            animationDelay: isPlaying ? `${i * 0.05}s` : '0s',
            opacity: isPlaying ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  )
}

function VolumeSlider({
  volume,
  onChange,
}: {
  volume: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <SpeakerNone size={12} weight="fill" className="text-white/40 shrink-0" />
      <input
        type="range"
        min={0}
        max={1}
        step={0.02}
        value={volume}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none rounded-full bg-white/10 cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-moonstone-blue
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-moonstone-blue/30
          [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-moonstone-blue [&::-moz-range-thumb]:border-0"
      />
      <SpeakerHigh size={12} weight="fill" className="text-white/40 shrink-0" />
    </div>
  )
}

export function RadioPlayer() {
  const {
    currentTrack,
    isPlaying,
    autoplayBlocked,
    volume,
    isMuted,
    shuffle,
    toggle,
    next: goNext,
    setVolume,
    toggleShuffle,
    selectTrack,
  } = useAudio()

  const [open, setOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const presetsRowRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const scrollPresets = (dir: number) => {
    if (presetsRowRef.current) {
      presetsRowRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed top-20 right-4 md:top-24 md:right-6 z-40 flex flex-col items-end">
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
          ${isPlaying
            ? 'bg-moonstone-blue/20 text-moonstone-blue ring-1 ring-moonstone-blue/40 shadow-moonstone-blue/10'
            : autoplayBlocked
              ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 animate-pulse'
              : 'bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/10 hover:text-white'
          }`}
        aria-label="Radio player"
      >
        {autoplayBlocked && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
        )}
        <MusicNote size={18} weight={isPlaying ? 'fill' : 'regular'} />
      </button>

      {open && (
        <div
          ref={cardRef}
          className="mt-3 w-[300px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40 animate-in"
        >
          {/* Presets */}
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() => scrollPresets(-1)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <CaretLeft size={12} weight="bold" />
            </button>
            <div
              ref={presetsRowRef}
              className="flex gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tracks.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTrack(t.id)}
                  className={`shrink-0 snap-start px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 whitespace-nowrap
                    ${currentTrack.id === t.id
                      ? 'bg-moonstone-blue/15 text-moonstone-blue ring-1 ring-moonstone-blue/30'
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 ring-1 ring-white/10'
                    }`}
                >
                  {t.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollPresets(1)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <CaretRight size={12} weight="bold" />
            </button>
          </div>

          {/* Frequency Visualizer */}
          <div className="mb-3 bg-white/[0.02] rounded-xl py-3 px-1 ring-1 ring-white/5">
            <FrequencyVisualizer isPlaying={isPlaying} />
          </div>

          {/* Display Info */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-mono text-xs text-moonstone-blue/80 tracking-widest">
              {currentTrack.freq}
            </span>
            <span className="text-xs text-white/70 truncate ml-2 text-right font-mono tracking-wide">
              {currentTrack.title}
            </span>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${isPlaying
                  ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30'
                  : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:text-white'
                }`}
              title={isPlaying ? 'Mute' : 'Power On'}
            >
              <Power size={14} weight={isPlaying ? 'fill' : 'regular'} />
            </button>

            <VolumeSlider volume={isMuted ? 0 : volume} onChange={setVolume} />

            <button
              onClick={toggleShuffle}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${shuffle
                  ? 'bg-moonstone-blue/15 text-moonstone-blue ring-1 ring-moonstone-blue/30'
                  : 'bg-white/5 text-white/40 ring-1 ring-white/10 hover:text-white'
                }`}
              title="Shuffle"
            >
              <Shuffle size={13} weight={shuffle ? 'fill' : 'regular'} />
            </button>

            <button
              onClick={goNext}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/50 ring-1 ring-white/10 hover:text-white hover:bg-white/10 transition-all"
              title="Next"
            >
              <SkipForward size={14} weight="fill" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
