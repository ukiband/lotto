import { useRef, useState, useCallback, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

const BGM_FILES = ['new_bgm.mp3']
const BGM_MAX_VOLUME = 0.4
const FADE_IN_DURATION = 5000 // 5초 fade in

let audioCtx: AudioContext | null = null
function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function createAudio(src: string, loop = false): HTMLAudioElement {
  const audio = new Audio(`${BASE}sounds/${src}`)
  audio.loop = loop
  audio.preload = 'auto'
  return audio
}

export function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('lotto-muted') === 'true'
  })
  const mutedRef = useRef(muted)

  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const bgmGainRef = useRef<GainNode | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const revealRef = useRef<HTMLAudioElement | null>(null)
  const fanfareRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    revealRef.current = createAudio('reveal.wav')
    fanfareRef.current = createAudio('fanfare.wav')

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
    // mute 시 GainNode로 볼륨 제어
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.value = muted ? 0 : BGM_MAX_VOLUME
    }
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  const startBgm = useCallback(() => {
    if (mutedRef.current) return
    // 이전 BGM 정리
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current.src = ''
    }
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current)

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const randomFile = BGM_FILES[Math.floor(Math.random() * BGM_FILES.length)]
    const audio = createAudio(randomFile, true)
    bgmRef.current = audio

    // Web Audio API GainNode로 볼륨 제어 (iOS에서 audio.volume 무시되므로)
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 0 // 시작은 무음
    source.connect(gain)
    gain.connect(ctx.destination)
    bgmGainRef.current = gain

    audio.play().catch(() => {})

    // 5초 fade in: GainNode gain 0 → BGM_MAX_VOLUME
    const steps = 50
    const interval = FADE_IN_DURATION / steps
    const volumeStep = BGM_MAX_VOLUME / steps
    let step = 0
    fadeTimerRef.current = setInterval(() => {
      step++
      gain.gain.value = Math.min(volumeStep * step, BGM_MAX_VOLUME)
      if (step >= steps) {
        clearInterval(fadeTimerRef.current!)
        fadeTimerRef.current = null
      }
    }, interval)
  }, [])

  const stopBgm = useCallback(() => {
    if (fadeTimerRef.current) {
      clearInterval(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
    if (bgmGainRef.current) {
      bgmGainRef.current.gain.value = 0
      bgmGainRef.current = null
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
