'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAudio } from '@/components/audio/audio-provider'
import { tracks } from '@/components/audio/playlist'
import { useNav } from './nav-context'
import {
  MusicNote,
  Power,
  Shuffle,
  SkipForward,
  SpeakerHigh,
  SpeakerNone,
  CaretLeft,
  CaretRight,
  Smiley,
} from '@phosphor-icons/react'

const BAR_COUNT = 20

function FrequencyVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[2px] h-12">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-teal-500/30 to-teal-400 origin-bottom"
          style={{
            height: '30%',
            animation: isPlaying
              ? `freq-bar ${0.35 + (i % 5) * 0.08}s ease-in-out ${i * 0.05}s infinite`
              : 'none',
            opacity: isPlaying ? 1 : 0.15,
          }}
        />
      ))}
    </div>
  )
}

export function TopRightWidget() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    shuffle,
    autoplayBlocked,
    toggle,
    next: goNext,
    setVolume,
    toggleShuffle,
    selectTrack,
  } = useAudio()

  const { isMenuOpen } = useNav()

  const [radioOpen, setRadioOpen] = useState(false)
  const [time, setTime] = useState('')
  const widgetRef = useRef<HTMLDivElement>(null)
  const presetsRowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
      }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!radioOpen) return
    const handler = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setRadioOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [radioOpen])

  const scrollPresets = useCallback((dir: number) => {
    presetsRowRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' })
  }, [])

  const overlay = isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'

  return (
    <>
      {/* Top-right pill: Feedback + Clock — desktop only */}
      <div className={`hidden md:flex fixed top-3 right-3 z-50 items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-white shadow-lg transition-all duration-500 ${overlay}`}>
        <button className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 px-1.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-xs font-medium flex items-center gap-1 transition-all whitespace-nowrap">
          <Smiley size={12} weight="fill" />
          <span className="hidden sm:inline">Berikan Masukan</span>
        </button>
        <span className="text-[10px] sm:text-xs font-serif font-bold text-slate-100 px-1.5 tracking-wide min-w-[40px] text-right tabular-nums">
          {time}
        </span>
      </div>

      {/* Bottom-right floating radio button */}
      <div ref={widgetRef} className={`fixed bottom-5 right-5 z-50 transition-all duration-500 ${overlay}`}>
        <button
          onClick={() => setRadioOpen(!radioOpen)}
          className={`flex items-center justify-center w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all active:scale-95 opacity-80 hover:opacity-100 ${
            isPlaying ? 'ring-1 ring-teal-500/40' : ''
          }`}
          aria-label="Radio player"
        >
          {autoplayBlocked && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
          )}
          <MusicNote size={18} weight={isPlaying ? 'fill' : 'regular'} />
        </button>

        {radioOpen && (
          <div className="absolute bottom-full right-0 mb-3 w-[340px] bg-slate-900/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40 text-slate-200">
            <div className="flex items-center gap-1 mb-3">
              <button
                onClick={() => scrollPresets(-1)}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <CaretLeft size={10} weight="bold" />
              </button>
              <div
                ref={presetsRowRef}
                className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tracks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => selectTrack(t.id)}
                    className={`shrink-0 snap-start px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all duration-300 whitespace-nowrap border
                      ${currentTrack.id === t.id
                        ? 'bg-teal-500/10 text-teal-300 border-teal-500/40'
                        : 'bg-white/5 text-white/50 hover:text-white border-white/10'
                      }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
              <button
                onClick={() => scrollPresets(1)}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <CaretRight size={10} weight="bold" />
              </button>
            </div>

            <div className="mb-3 bg-black/20 rounded-xl py-2 px-1 ring-1 ring-white/5">
              <FrequencyVisualizer isPlaying={isPlaying} />
            </div>

            <div className="flex items-baseline justify-between mb-3 px-1">
              <span className="text-2xl font-serif font-bold text-white tracking-tight">
                {currentTrack.freq}
              </span>
              <span className="text-xs text-white/60 truncate ml-3 text-right font-mono tracking-wide">
                {currentTrack.title}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/5">
              <button
                onClick={toggle}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-white/5 text-white/40 hover:text-white'
                }`}
                title={isPlaying ? 'Power Off' : 'Power On'}
              >
                <Power size={12} weight={isPlaying ? 'fill' : 'regular'} />
              </button>

              <div className="flex items-center gap-1.5 flex-1">
                <SpeakerNone size={10} weight="fill" className="text-white/30 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-1 appearance-none rounded-full bg-white/10 cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-teal-400/30
                    [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-teal-400 [&::-moz-range-thumb]:border-0"
                />
                <SpeakerHigh size={10} weight="fill" className="text-white/30 shrink-0" />
              </div>

              <button
                onClick={toggleShuffle}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  shuffle
                    ? 'bg-teal-500/10 text-teal-300'
                    : 'bg-white/5 text-white/40 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle size={11} weight={shuffle ? 'fill' : 'regular'} />
              </button>

              <button
                onClick={goNext}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                title="Next"
              >
                <SkipForward size={11} weight="fill" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
