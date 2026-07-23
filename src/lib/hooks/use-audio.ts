'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

let currentAudio: HTMLAudioElement | null = null

export function useAudio(src?: string) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audio.preload = 'metadata'
    audioRef.current = audio

    const onMeta = () => setDuration(audio.duration)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnd = () => {
      setPlaying(false)
      setCurrentTime(0)
    }
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnd)

    return () => {
      if (currentAudio === audio) currentAudio = null
      audio.pause()
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnd)
      audioRef.current = null
    }
  }, [src])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume
  }, [volume, muted])

  const play = useCallback(() => {
    if (!audioRef.current) return
    if (currentAudio && currentAudio !== audioRef.current) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    audioRef.current.play()
    currentAudio = audioRef.current
    setPlaying(true)
  }, [])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    if (currentAudio === audioRef.current) currentAudio = null
    setPlaying(false)
  }, [])

  const toggle = useCallback(() => {
    if (playing) pause()
    else play()
  }, [playing, play, pause])

  const seek = useCallback((t: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = t
  }, [])

  return { playing, muted, volume, duration, currentTime, toggle, play, pause, setMuted, setVolume, seek }
}
