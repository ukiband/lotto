import { useRef, useState, useCallback, useEffect } from 'react'

const BASE = import.meta.env.BASE_URL

function createAudio(src: string, loop = false, volume = 1.0): HTMLAudioElement {
  const audio = new Audio(`${BASE}sounds/${src}`)
  audio.loop = loop
  audio.volume = volume
  audio.preload = 'auto'
  return audio
}

export function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('lotto-muted') === 'true'
  })
  const mutedRef = useRef(muted)

  // Audio 요소 refs
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const scratchRef = useRef<HTMLAudioElement | null>(null)
  const revealRef = useRef<HTMLAudioElement | null>(null)
  const fanfareRef = useRef<HTMLAudioElement | null>(null)

  // 초기화: Audio 요소 생성
  useEffect(() => {
    bgmRef.current = createAudio('bgm.wav', true, 0.4)
    scratchRef.current = createAudio('scratch.wav', true, 0.5)
    revealRef.current = createAudio('reveal.wav', false, 0.6)
    fanfareRef.current = createAudio('fanfare.wav', false, 0.7)

    return () => {
      [bgmRef, scratchRef, revealRef, fanfareRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause()
          ref.current.src = ''
          ref.current = null
        }
      })
    }
  }, [])

  useEffect(() => {
    mutedRef.current = muted
    localStorage.setItem('lotto-muted', String(muted))
    // mute 변경 시 현재 재생 중인 오디오에 반영
    if (bgmRef.current) bgmRef.current.muted = muted
    if (scratchRef.current) scratchRef.current.muted = muted
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  const startBgm = useCallback(() => {
    if (!bgmRef.current || mutedRef.current) return
    bgmRef.current.currentTime = 0
    bgmRef.current.play().catch(() => {})
  }, [])

  const stopBgm = useCallback(() => {
    if (!bgmRef.current) return
    bgmRef.current.pause()
    bgmRef.current.currentTime = 0
  }, [])

  const startScratch = useCallback(() => {
    if (!scratchRef.current || mutedRef.current) return
    scratchRef.current.currentTime = 0
    scratchRef.current.play().catch(() => {})
  }, [])

  const stopScratch = useCallback(() => {
    if (!scratchRef.current) return
    scratchRef.current.pause()
    scratchRef.current.currentTime = 0
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
    startScratch,
    stopScratch,
    playReveal,
    playFanfare,
  }
}
