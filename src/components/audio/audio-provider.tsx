'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { tracks, Track } from './playlist'

interface AudioContextType {
  currentTrack: Track
  isPlaying: boolean
  autoplayBlocked: boolean
  volume: number
  isMuted: boolean
  shuffle: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  next: () => void
  prev: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  selectTrack: (id: string) => void
}

const AudioCtx = createContext<AudioContextType | null>(null)

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be inside AudioProvider')
  return ctx
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [volume, setVolumeState] = useState(0.4)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)

  const currentTrack = tracks[currentIndex]

  const nextRef = useRef<() => void>(() => {})

  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume
    audio.preload = 'auto'
    audioRef.current = audio

    audio.src = currentTrack.src
    audio.load()

    const tryPlay = () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setAutoplayBlocked(true)
          const resume = () => {
            audio.play().then(() => {
              setIsPlaying(true)
              setAutoplayBlocked(false)
            }).catch(() => {})
            document.removeEventListener('click', resume)
          }
          document.addEventListener('click', resume, { once: true })
        })
    }
    tryPlay()

    const onEnded = () => nextRef.current()
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', () => {
      console.warn('Audio file not found:', audio.src)
    })

    return () => {
      audio.pause()
      audio.src = ''
      audio.load()
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = currentTrack.src
    audio.load()
    if (isPlaying) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [currentIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = isMuted
  }, [isMuted])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (shuffle) return Math.floor(Math.random() * tracks.length)
      return (prev + 1) % tracks.length
    })
  }, [shuffle])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => {
      if (shuffle) return Math.floor(Math.random() * tracks.length)
      return (prev - 1 + tracks.length) % tracks.length
    })
  }, [shuffle])

  nextRef.current = goNext

  const play = useCallback(() => {
    audioRef.current?.play()
      .then(() => setIsPlaying(true))
      .catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)))
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev)
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev)
  }, [])

  const selectTrack = useCallback((id: string) => {
    const idx = tracks.findIndex(t => t.id === id)
    if (idx >= 0) setCurrentIndex(idx)
  }, [])

  return (
    <AudioCtx.Provider
      value={{
        currentTrack,
        isPlaying,
        autoplayBlocked,
        volume,
        isMuted,
        shuffle,
        play,
        pause,
        toggle,
        next: goNext,
        prev: goPrev,
        setVolume,
        toggleMute,
        toggleShuffle,
        selectTrack,
      }}
    >
      {children}
    </AudioCtx.Provider>
  )
}
