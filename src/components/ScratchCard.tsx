import { useRef, useEffect, useCallback, useState } from 'react'
import type { LottoRound } from '../types/lotto'
import { LottoBall } from './LottoBall'
import { fillScratchSurface, scratchLine, getScratchPercentage, clearCanvas } from '../utils/scratch'

interface ScratchCardProps {
  round: LottoRound
  onRevealNumber: (index: number) => void
  onAllRevealed: () => void
  onScratchStart: () => void
  onScratchEnd: () => void
}

interface BallSlot {
  revealed: boolean
}

export function ScratchCard({
  round,
  onRevealNumber,
  onAllRevealed,
  onScratchStart,
  onScratchEnd,
}: ScratchCardProps) {
  const allNumbers = [...round.numbers, round.bonus]
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const ctxRefs = useRef<(CanvasRenderingContext2D | null)[]>([])
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const activeCanvasRef = useRef<number | null>(null)
  const [slots, setSlots] = useState<BallSlot[]>(
    allNumbers.map(() => ({ revealed: false }))
  )
  const [revealAll, setRevealAll] = useState(false)
  const scratchingRef = useRef(false)

  // 캔버스 초기화
  useEffect(() => {
    setSlots(allNumbers.map(() => ({ revealed: false })))
    setRevealAll(false)

    // requestAnimationFrame으로 DOM이 그려진 후 캔버스 초기화
    requestAnimationFrame(() => {
      canvasRefs.current.forEach((canvas, i) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctxRefs.current[i] = ctx

        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        fillScratchSurface(ctx, rect.width, rect.height)
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.round])

  const revealSlot = useCallback(
    (index: number) => {
      // 스크래치 중이면 정리 (canvas 제거 시 pointerUp 미발생 방지)
      if (scratchingRef.current) {
        scratchingRef.current = false
        activeCanvasRef.current = null
        lastPosRef.current = null
        onScratchEnd()
      }

      setSlots((prev) => {
        if (prev[index].revealed) return prev
        const next = [...prev]
        next[index] = { revealed: true }
        return next
      })
      onRevealNumber(index)
      const canvas = canvasRefs.current[index]
      const ctx = ctxRefs.current[index]
      if (canvas && ctx) clearCanvas(canvas, ctx)

      // 모든 슬롯 공개 확인
      const allRevealed = slots.every((s, i) => i === index || s.revealed)
      if (allRevealed) onAllRevealed()
    },
    [onRevealNumber, onAllRevealed, onScratchEnd, slots]
  )

  // 전부 긁기
  const handleRevealAll = useCallback(() => {
    setRevealAll(true)
    allNumbers.forEach((_, i) => {
      setTimeout(() => revealSlot(i), i * 150)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealSlot, allNumbers.length])

  // 터치/마우스 이벤트 핸들러
  const getCanvasPos = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = canvas.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const findCanvasIndex = (target: EventTarget | null): number => {
    return canvasRefs.current.findIndex((c) => c === target)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    const idx = findCanvasIndex(e.target)
    if (idx === -1 || slots[idx].revealed) return
    e.preventDefault()

    scratchingRef.current = true
    activeCanvasRef.current = idx
    const canvas = canvasRefs.current[idx]!
    const pos = getCanvasPos(canvas, e.clientX, e.clientY)
    lastPosRef.current = pos
    onScratchStart()

    // 포인터 캡처
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!scratchingRef.current) return
    const idx = activeCanvasRef.current
    if (idx === null || slots[idx].revealed) return

    const canvas = canvasRefs.current[idx]
    const ctx = ctxRefs.current[idx]
    if (!canvas || !ctx) return

    const pos = getCanvasPos(canvas, e.clientX, e.clientY)
    if (lastPosRef.current) {
      scratchLine(ctx, lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y, 18)
    }
    lastPosRef.current = pos

    // 긁은 비율 체크
    const pct = getScratchPercentage(canvas, ctx)
    if (pct > 0.55) {
      revealSlot(idx)
    }
  }

  const handlePointerUp = () => {
    if (scratchingRef.current) {
      scratchingRef.current = false
      activeCanvasRef.current = null
      lastPosRef.current = null
      onScratchEnd()
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* 회차 정보 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">제{round.round}회 로또 6/45</h2>
        <p className="text-gray-400 text-sm">추첨일: {round.date}</p>
      </div>

      {/* 스크래치 카드 영역 */}
      <div className="bg-gray-800 rounded-2xl p-6 w-full shadow-2xl border border-gray-700">
        {/* 당첨번호 6개 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {round.numbers.map((num, i) => (
            <div key={i} className="relative flex justify-center">
              <LottoBall number={num} size="lg" />
              {!slots[i].revealed && (
                <canvas
                  ref={(el) => { canvasRefs.current[i] = el }}
                  className="absolute inset-0 w-full h-full rounded-xl cursor-pointer touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              )}
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-dashed border-gray-600 my-4" />

        {/* 보너스 번호 */}
        <div className="flex justify-center">
          <div className="relative flex justify-center">
            <LottoBall number={round.bonus} size="lg" isBonus />
            {!slots[round.numbers.length].revealed && (
              <canvas
                ref={(el) => { canvasRefs.current[round.numbers.length] = el }}
                className="absolute inset-0 w-full h-full rounded-xl cursor-pointer touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            )}
          </div>
        </div>
      </div>

      {/* 전부 긁기 버튼 */}
      {!revealAll && !slots.every((s) => s.revealed) && (
        <button
          onClick={handleRevealAll}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-full text-sm transition-colors"
        >
          전부 긁기
        </button>
      )}
    </div>
  )
}
