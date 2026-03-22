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
  // muted를 ref로도 추적 — 콜백 클로저 문제 방지
  const mutedRef = useRef(muted)
  const scratchNoiseRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null)
  const bgmNodeRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null)

  useEffect(() => {
    mutedRef.current = muted
    localStorage.setItem('lotto-muted', String(muted))
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  const resumeAudio = useCallback(async () => {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
  }, [])

  // 배경음: 긴장감 있는 마이너 코드 드론 (폰 스피커에서도 들리는 주파수대)
  const startBgm = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    if (bgmNodeRef.current) return

    const gain = ctx.createGain()
    gain.gain.value = 0.12
    gain.connect(ctx.destination)

    const oscs: OscillatorNode[] = []

    // Am 코드: A3(220) + C4(262) + E4(330) — 폰 스피커에서 충분히 재생 가능
    const frequencies = [220, 262, 330]
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      osc.start()
      oscs.push(osc)
    })

    // LFO로 볼륨 떨림 (심장박동 느낌)
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 1.5
    lfoGain.gain.value = 0.04
    lfo.connect(lfoGain)
    lfoGain.connect(gain.gain)
    lfo.start()
    oscs.push(lfo)

    bgmNodeRef.current = { oscs, gain }
  }, [])

  const stopBgm = useCallback(() => {
    if (bgmNodeRef.current) {
      bgmNodeRef.current.oscs.forEach(o => o.stop())
      bgmNodeRef.current = null
    }
  }, [])

  // 스크래치 소리: 화이트노이즈 + 밴드패스 필터
  const startScratch = useCallback(() => {
    if (mutedRef.current || scratchNoiseRef.current) return
    const ctx = getAudioContext()

    const bufferSize = ctx.sampleRate * 0.5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const channelData = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2500
    filter.Q.value = 0.5

    const gain = ctx.createGain()
    gain.gain.value = 0.15

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    scratchNoiseRef.current = { source, gain }
  }, [])

  const stopScratch = useCallback(() => {
    if (scratchNoiseRef.current) {
      scratchNoiseRef.current.source.stop()
      scratchNoiseRef.current = null
    }
  }, [])

  // 번호 공개음: 피치가 올라가는 짧은 톤
  const playReveal = useCallback((index: number) => {
    if (mutedRef.current) return
    const ctx = getAudioContext()

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 523 + index * 100 // C5부터 시작, 더 높은 주파수

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  }, [])

  // 전체 공개 팡파레
  const playFanfare = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    // C major arpeggio: C5 → E5 → G5 → C6
    const notes = [523, 659, 784, 1047]

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      const startTime = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 1.0)
    })
  }, [])

  // 언마운트 시 오디오 리소스 정리
  useEffect(() => {
    return () => {
      if (bgmNodeRef.current) {
        bgmNodeRef.current.oscs.forEach(o => o.stop())
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
