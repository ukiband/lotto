import type { LottoRound } from '../types/lotto'

interface RoundSelectorProps {
  rounds: LottoRound[]
  selectedRound: number | null
  onSelect: (round: number) => void
}

export function RoundSelector({ rounds, selectedRound, onSelect }: RoundSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <label className="text-gray-300 text-sm" htmlFor="round-select">
        회차를 선택하세요
      </label>
      <select
        id="round-select"
        value={selectedRound ?? ''}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 text-lg w-64 text-center appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400"
      >
        {rounds.map((r) => (
          <option key={r.round} value={r.round}>
            제{r.round}회 ({r.date})
          </option>
        ))}
      </select>
    </div>
  )
}
