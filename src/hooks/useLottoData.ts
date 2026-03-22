import { useState, useEffect, useCallback } from 'react'
import type { LottoData } from '../types/lotto'

export function useLottoData() {
  const [data, setData] = useState<LottoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isBackground = false) => {
    try {
      // 백그라운드 갱신 시 로딩 표시 안 함 (스크래치 중 리셋 방지)
      if (!isBackground) setLoading(true)
      const res = await fetch(`${import.meta.env.BASE_URL}data/rounds.json`, {
        cache: 'no-cache',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: LottoData = await res.json()
      setData(json)
      setError(null)
    } catch (e) {
      // 백그라운드 갱신 실패 시 기존 데이터 유지
      if (!isBackground) {
        setError(e instanceof Error ? e.message : '데이터를 불러올 수 없습니다')
      }
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // 포그라운드 복귀 시 데이터 갱신
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchData])

  return { data, loading, error }
}
