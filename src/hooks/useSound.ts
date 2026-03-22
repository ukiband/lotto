import { useRef, useState, useCallback, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

const BGM_FILES = ['new_bgm.mp3']
const BGM_MAX_VOLUME = 0.4
const FADE_IN_DURATION = 5000 // 5초 fade in

function createAudio(src: string, loop = false, volume = 1.0): HTMLAudioElement {
  const audio = new Audio(`${BASE}sounds/${src}`)
  audio.loop = loop
  audio.volume = volume
  audio.preload = 'auto'
  return audio
}

function fadeIn(audio: HTMLAudioElement, maxVolume: number, duration: number) {
  audio.volume = 0
  audio.play().catch(() => {})
  const steps = 20
  const interval = duration / steps
  const volumeStep = maxVolume / steps
  let step = 0
  const timer = setInterval(() => {
    step++
    audio.volume = Math.min(volumeStep * step, maxVolume)
    if (step >= steps) clearInterval(timer)
  }, interval)
  return timer
}

export function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('lotto-muted') === 'true'
  })
  const mutedRef = useRef(muted)

  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealRef = useRef<HTMLAudioElement | null>(null)
  const fanfareRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    revealRef.current = createAudio('reveal.wav', false, 0.6)
    fanfareRef.current = createAudio('fanfare.wav', false, 0.7)

    return () => {
      [bgmRef, revealRef, fanfareRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current.src = ''
          ref.current = null
        }
      })
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    localStorage.setItem('lotto-muted', String(muted))
    if (bgmRef.current) bgmRef.current.muted = muted
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  const startBgm = useCallback(() => {
    if (mutedRef.current) return
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current.src = ''
    }
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)

    const randomFile = BGM_FILES[Math.floor(Math.random() * BGM_FILES.length)]
    bgmRef.current = createAudio(randomFile, true, 0)
    bgmRef.current.muted = mutedRef.current

    fadeTimerRef.current = fadeIn(bgmRef.current, BGM_MAX_VOLUME, FADE_IN_DURATION)
  }, [])

  const stopBgm = useCallback(() => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
    if (!bgmRef.current) return
    bgmRef.current.pause()
    bgmRef.current.currentTime = 0
  }, [])

  const playReveal = useCallback(() => {
    if (!revealRef.current || mutedRef.current) return
    revealRef.current.currentTime = 0
    revealRef.current.play().catch(() => {})
  }, [])

  const playFanfare = useCallback(() => {
    if (!fanfareRef.current || mutedRef.current) return
    fanfareRef.current.currentTime = 0
    fanfareRef.current.play().catch(() => {})
  }, [])

  return {
    muted,
    toggleMute,
    startBgm,
    stopBgm,
    playReveal,
    playFanfare,
  }
}
