import { useRef, useState, useCallback, useEffect } from 'react'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('lotto-muted') === 'true'
  })
  const scratchNoiseRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null)
  const bgmNodeRef = useRef<{ source: OscillatorNode; gain: GainNode; lfo: OscillatorNode } | null>(null)

  useEffect(() => {
    localStorage.setItem('lotto-muted', String(muted))
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  // 오디오 컨텍스트 시작 (사용자 제스처 필요)
  const resumeAudio = useCallback(async () => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
  }, [])

  // 배경음: 낮은 음의 드론 + 약간의 떨림
  const startBgm = useCallback(() => {
    if (muted) return
    const ctx = getAudioContext()
    if (bgmNodeRef.current) return

    const gain = ctx.createGain()
    gain.gain.value = 0.06
    gain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 80

    // LFO로 약간의 떨림 추가
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 2
    lfoGain.gain.value = 5
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    osc.connect(gain)
    osc.start()

    bgmNodeRef.current = { source: osc, gain, lfo }
  }, [muted])

  const stopBgm = useCallback(() => {
    if (bgmNodeRef.current) {
      bgmNodeRef.current.source.stop()
      bgmNodeRef.current.lfo.stop()
      bgmNodeRef.current = null
    }
  }, [])

  // 스크래치 소리: 화이트노이즈 + 밴드패스 필터
  const startScratch = useCallback(() => {
    if (muted || scratchNoiseRef.current) return
    const ctx = getAudioContext()

    const bufferSize = ctx.sampleRate * 0.5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 3000
    filter.Q.value = 0.8

    const gain = ctx.createGain()
    gain.gain.value = 0.08

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    scratchNoiseRef.current = { source, gain }
  }, [muted])

  const stopScratch = useCallback(() => {
    if (scratchNoiseRef.current) {
      scratchNoiseRef.current.source.stop()
      scratchNoiseRef.current = null
    }
  }, [])

  // 번호 공개음: 피치가 올라가는 짧은 톤
  const playReveal = useCallback((index: number) => {
    if (muted) return
    const ctx = getAudioContext()

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    // 번호마다 피치를 올려서 점점 고조
    osc.frequency.value = 440 + index * 80

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  }, [muted])

  // 전체 공개 팡파레: 화음 아르페지오
  const playFanfare = useCallback(() => {
    if (muted) return
    const ctx = getAudioContext()
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      const startTime = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 0.8)
    })
  }, [muted])

  // 언마운트 시 오디오 리소스 정리
  useEffect(() => {
    return () => {
      if (bgmNodeRef.current) {
        bgmNodeRef.current.source.stop()
        bgmNodeRef.current.lfo.stop()
        bgmNodeRef.current = null
      }
      if (scratchNoiseRef.current) {
        scratchNoiseRef.current.source.stop()
        scratchNoiseRef.current = null
      }
    }
  }, [])

  return {
    muted,
    toggleMute,
    resumeAudio,
    startBgm,
    stopBgm,
    startScratch,
    stopScratch,
    playReveal,
    playFanfare,
  }
}
