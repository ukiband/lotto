#!/usr/bin/env node

/**
 * 동행복권 API에서 로또 당첨번호를 가져와 rounds.json을 갱신하는 스크립트
 * GitHub Actions에서 매주 토요일 자동 실행
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, '..', 'public', 'data', 'rounds.json')

const API_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do'
const HEADERS = {
  Referer: 'https://www.dhlottery.co.kr/lt645/result',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
}

// 최신 회차 번호 계산
function getLatestRound() {
  const startDate = new Date('2002-12-07')
  const today = new Date()
  const diffDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.floor(diffDays / 7) + 1
}

// API에서 회차 데이터 가져오기
async function fetchRounds(round) {
  const url = `${API_URL}?srchDir=center&srchLtEpsd=${round}`
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`API 호출 실패: HTTP ${res.status}`)
  const json = await res.json()
  return json.data?.list ?? []
}

// API 응답을 내부 포맷으로 변환
function transformRound(item) {
  const dateStr = item.ltRflYmd
  const date = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  return {
    round: item.ltEpsd,
    date,
    numbers: [
      item.tm1WnNo,
      item.tm2WnNo,
      item.tm3WnNo,
      item.tm4WnNo,
      item.tm5WnNo,
      item.tm6WnNo,
    ],
    bonus: item.bnsWnNo,
  }
}

async function main() {
  console.log('로또 데이터 수집 시작...')

  // 기존 데이터 로드
  let existingData = { lastUpdated: '', rounds: [] }
  try {
    existingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
  } catch {
    console.log('기존 데이터 없음, 새로 생성합니다.')
  }

  const existingRounds = new Set(existingData.rounds.map((r) => r.round))
  const latestRound = getLatestRound()

  console.log(`최신 회차 추정: ${latestRound}`)

  // 최신 회차 주변 데이터 가져오기
  const apiData = await fetchRounds(latestRound)
  console.log(`API에서 ${apiData.length}개 회차 데이터 수신`)

  let newCount = 0
  for (const item of apiData) {
    const transformed = transformRound(item)
    if (!existingRounds.has(transformed.round)) {
      existingData.rounds.push(transformed)
      existingRounds.add(transformed.round)
      newCount++
    }
  }

  // 회차 번호 내림차순 정렬
  existingData.rounds.sort((a, b) => b.round - a.round)

  // 최근 100회차만 유지
  existingData.rounds = existingData.rounds.slice(0, 100)
  existingData.lastUpdated = new Date().toISOString()

  // 저장
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true })
  fs.writeFileSync(DATA_PATH, JSON.stringify(existingData, null, 2) + '\n')

  console.log(`완료! 새로 추가된 회차: ${newCount}개, 전체: ${existingData.rounds.length}개`)
}

main().catch((e) => {
  console.error('오류:', e.message)
  process.exit(1)
})
