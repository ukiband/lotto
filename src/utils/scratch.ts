/**
 * Canvas 스크래치 유틸리티
 * globalCompositeOperation = 'destination-out'으로 긁은 영역을 투명화
 */

export function fillScratchSurface(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number
) {
  // DPR 스케일된 ctx에서 CSS 크기 기준으로 그라데이션 생성
  const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight)
  gradient.addColorStop(0, '#c0c0c0')
  gradient.addColorStop(0.3, '#d8d8d8')
  gradient.addColorStop(0.5, '#a8a8a8')
  gradient.addColorStop(0.7, '#d0d0d0')
  gradient.addColorStop(1, '#b0b0b0')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  // 노이즈 텍스처 (CSS 크기 기준으로만 — 성능 최적화)
  const imageData = ctx.getImageData(
    0, 0,
    cssWidth * window.devicePixelRatio,
    cssHeight * window.devicePixelRatio
  )
  const pixels = imageData.data
  // 4픽셀 간격으로 샘플링하여 성능 개선
  for (let i = 0; i < pixels.length; i += 16) {
    const noise = (Math.random() - 0.5) * 30
    pixels[i] = Math.min(255, Math.max(0, pixels[i] + noise))
    pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1] + noise))
    pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)
}

export function scratchLine(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  radius: number = 20
) {
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = radius * 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
  ctx.globalCompositeOperation = 'source-over'
}

// 샘플링으로 성능 최적화 (매 pointerMove 호출 대비)
export function getScratchPercentage(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): number {
  const w = canvas.width
  const h = canvas.height
  const step = 8 // 8픽셀 간격으로 샘플링
  const imageData = ctx.getImageData(0, 0, w, h)
  const pixels = imageData.data
  let transparent = 0
  let total = 0
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = (y * w + x) * 4 + 3 // alpha 채널
      if (pixels[idx] === 0) transparent++
      total++
    }
  }
  return transparent / total
}

export function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}
