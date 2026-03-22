import { useRef, useEffect, useCallback, useState } from 'react'
import type { LottoRound } from '../types/lotto'
import { LottoBall } from './LottoBall'
import { fillScratchSurface, scratchLine, getScratchPercentage, clearCanvas } from '../utils/scratch'

const REVEAL_THRESHOLD = 0.80

interface ScratchCardProps {
  round: LottoRound
  onAllRevealed: () => void
}

export function ScratchCard({
  round,
  onAllRevealed,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const scratchingRef = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const checkCountRef = useRef(0)

  // 캔버스 초기화
  useEffect(() => {
    setRevealed(false)
    checkCountRef.current = 0

    requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctxRef.current = ctx

      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      fillScratchSurface(ctx, rect.width, rect.height)

      // "긁어보세요!" 텍스트
      ctx.fillStyle = '#888'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('긁어보세요! 🪙', rect.width / 2, rect.height / 2)
    })
  }, [round.round])

  const doReveal = useCallback(() => {
    if (revealed) return
    setRevealed(true)
    scratchingRef.current = false
    lastPosRef.current = null
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (canvas && ctx) clearCanvas(canvas, ctx)
    onAllRevealed()
  }, [revealed, onAllRevealed])

  // 전부 긁기
  const handleRevealAll = useCallback(() => {
    doReveal()
  }, [doReveal])

  const getCanvasPos = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (revealed) return
    e.preventDefault()
    scratchingRef.current = true
    lastPosRef.current = getCanvasPos(e.clientX, e.clientY)
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!scratchingRef.current || revealed) return
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const pos = getCanvasPos(e.clientX, e.clientY)
    if (lastPosRef.current) {
      scratchLine(ctx, lastPosRef.current.x, lastPosRef.current.y, pos.x, pos.y, 28)
    }
    lastPosRef.current = pos

    // 매 5번째 move마다 비율 체크 (성능 최적화)
    checkCountRef.current++
    if (checkCountRef.current % 5 === 0) {
      const pct = getScratchPercentage(canvas, ctx)
      if (pct > REVEAL_THRESHOLD) {
        doReveal()
      }
    }
  }

  const handlePointerUp = () => {
    if (scratchingRef.current) {
      scratchingRef.current = false
      lastPosRef.current = null
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      {/* 회차 정보 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">제{round.round}회 로또 6/45</h2>
        <p className="text-gray-400 text-sm">추첨일: {round.date}</p>
      </div>

      {/* 스크래치 카드 */}
      <div className="relative bg-gray-800 rounded-2xl w-full shadow-2xl border border-gray-700 overflow-hidden">
        {/* 번호 레이어 (캔버스 아래) */}
        <div className="p-6">
          {/* 당첨번호 6개 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {round.numbers.map((num, i) => (
              <div key={i} className="flex justify-center">
                <LottoBall number={num} size="lg" />
              </div>
            ))}
          </div>

          {/* 구분선 */}
          <div className="border-t border-dashed border-gray-600 my-4" />

          {/* 보너스 번호 */}
          <div className="flex justify-center">
            <LottoBall number={round.bonus} size="lg" isBonus />
          </div>
        </div>

        {/* 스크래치 캔버스 (전체 카드를 덮음) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            style={{ borderRadius: 'inherit' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}
      </div>

      {/* 전부 긁기 버튼 */}
      {!revealed && (
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
