export interface LottoRound {
  round: number
  date: string
  numbers: number[]
  bonus: number
}

export interface LottoData {
  lastUpdated: string
  rounds: LottoRound[]
}

export type AppPhase = 'select' | 'scratch' | 'done'
