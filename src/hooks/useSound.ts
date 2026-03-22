import { useRef, useState, useCallback, useEffect } from 'react'

let audioCtx: AudioContext | null = null
let audioUnlocked = false

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

// iOS Safari/PWA에서 AudioContext를 unlock하는 함수
// 사용자 제스처 안에서 무음 버퍼를 재생해야 이후 오디오가 동작함
function unlockAudio(ctx: AudioContext) {
  if (audioUnlocked) return
  audioUnlocked = true

  if (ctx.state === 'suspended') ctx.resume()

  // 무음 버퍼 재생으로 iOS 오디오 잠금 해제
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
}

export function useSound() {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('lotto-muted') === 'true'
  })
  const mutedRef = useRef(muted)
  const scratchNoiseRef = useRef<{ source: AudioBufferSourceNode; gain: GainNode } | null>(null)
  const bgmNodeRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null)

  useEffect(() => {
    mutedRef.current = muted
    localStorage.setItem('lotto-muted', String(muted))
  }, [muted])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  // 배경음: 긴장감 있는 마이너 코드
  const startBgm = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    unlockAudio(ctx)
    if (bgmNodeRef.current) return

    const gain = ctx.createGain()
    gain.gain.value = 0.15
    gain.connect(ctx.destination)

    const oscs: OscillatorNode[] = []

    // Am 코드 (높은 옥타브): A4(440) + C5(523) + E5(659)
    // 아이폰 스피커에서 확실히 들리는 주파수대
    const frequencies = [440, 523, 659]
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
    lfoGain.gain.value = 0.05
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

  // 스크래치 소리
  const startScratch = useCallback(() => {
    if (mutedRef.current || scratchNoiseRef.current) return
    const ctx = getAudioContext()
    unlockAudio(ctx)

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
    gain.gain.value = 0.18

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

  // 번호 공개음
  const playReveal = useCallback((index: number) => {
    if (mutedRef.current) return
    const ctx = getAudioContext()

    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = 523 + index * 100

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  }, [])

  // 팡파레
  const playFanfare = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getAudioContext()
    const notes = [523, 659, 784, 1047]

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq

      const gain = ctx.createGain()
      const startTime = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(startTime)
      osc.stop(startTime + 1.0)
    })
  }, [])

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
    startBgm,
    stopBgm,
    startScratch,
    stopScratch,
    playReveal,
    playFanfare,
  }
}
