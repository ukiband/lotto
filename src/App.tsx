import { useState, useCallback, useEffect, useMemo } from 'react'
import type { AppPhase } from './types/lotto'
import { useLottoData } from './hooks/useLottoData'
import { useSound } from './hooks/useSound'
import { RoundSelector } from './components/RoundSelector'
import { ScratchCard } from './components/ScratchCard'
import { LottoBall } from './components/LottoBall'

function App() {
  const { data, loading, error } = useLottoData()
  const sound = useSound()
  const [phase, setPhase] = useState<AppPhase>('select')
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  const rounds = useMemo(() => data?.rounds ?? [], [data])

  // 데이터 로드 시 최신 회차 자동 선택
  useEffect(() => {
    if (rounds.length > 0 && selectedRound === null) {
      setSelectedRound(rounds[0].round)
    }
  }, [rounds, selectedRound])

  const currentRound = rounds.find((r) => r.round === selectedRound)

  const handleStart = useCallback(async () => {
    await sound.resumeAudio()
    sound.startBgm()
    setPhase('scratch')
  }, [sound])

  const handleRevealNumber = useCallback(
    (index: number) => {
      sound.playReveal(index)
    },
    [sound]
  )

  const handleAllRevealed = useCallback(() => {
    sound.stopBgm()
    sound.playFanfare()
    setPhase('done')
  }, [sound])

  const handleReset = useCallback(() => {
    setPhase('select')
  }, [])

  const handleNewRound = useCallback(() => {
    sound.stopBgm()
    setPhase('select')
  }, [sound])

  if (loading) {
    return (
      <div className="min-h-dvh bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse text-lg">로딩 중...</div>
      </div>
    )
  }

  if (error || !data || rounds.length === 0) {
    return (
      <div className="min-h-dvh bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">데이터를 불러올 수 없습니다</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gray-900 flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1
          className="text-xl font-bold text-yellow-400 cursor-pointer"
          onClick={handleReset}
        >
          🎱 로또 긁긁
        </h1>
        <button
          onClick={sound.toggleMute}
          className="text-2xl p-1"
          aria-label={sound.muted ? '소리 켜기' : '소리 끄기'}
        >
          {sound.muted ? '🔇' : '🔊'}
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {phase === 'select' && (
          <>
            <RoundSelector
              rounds={rounds}
              selectedRound={selectedRound}
              onSelect={setSelectedRound}
            />
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-full text-lg shadow-lg transition-all active:scale-95"
            >
              🪙 긁기 시작!
            </button>

            {/* 최근 회차 목록 */}
            <div className="mt-6 w-full max-w-xs">
              <p className="text-gray-500 text-xs mb-2 text-center">최근 회차</p>
              <div className="space-y-2">
                {rounds.slice(0, 5).map((r) => (
                  <button
                    key={r.round}
                    onClick={() => {
                      setSelectedRound(r.round)
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      r.round === selectedRound
                        ? 'bg-gray-700 text-yellow-400'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    제{r.round}회 · {r.date}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {phase === 'scratch' && currentRound && (
          <ScratchCard
            round={currentRound}
            onRevealNumber={handleRevealNumber}
            onAllRevealed={handleAllRevealed}
            onScratchStart={sound.startScratch}
            onScratchEnd={sound.stopScratch}
          />
        )}

        {phase === 'done' && currentRound && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <h2 className="text-xl font-bold text-white">
              제{currentRound.round}회 당첨번호
            </h2>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {currentRound.numbers.map((n, i) => (
                <LottoBall key={i} number={n} size="lg" />
              ))}
              <span className="text-gray-500 text-2xl mx-1">+</span>
              <LottoBall number={currentRound.bonus} size="lg" isBonus />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleNewRound}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-full transition-all active:scale-95"
              >
                다른 회차 긁기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
