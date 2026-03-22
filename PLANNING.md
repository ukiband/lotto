# 🎰 로또 긁긁 — 즉석복권 스타일 로또 결과 확인 웹앱

## 개요

로또 6/45 당첨 결과를 **즉석복권처럼 동전으로 긁어서 확인**하는 웹앱.
회차를 선택하면 즉석복권 카드가 생성되고, 은박 코팅을 손가락(모바일) 또는 마우스(데스크톱)로 긁어내면 당첨번호가 하나씩 드러난다.

---

## 핵심 사용자 시나리오

```
1. 사용자가 앱에 접속한다
2. 회차를 선택한다 (기본: 최신 회차)
3. 즉석복권 카드가 나타난다
4. 은박 영역을 긁으면 당첨 번호가 하나씩 드러난다
5. 보너스 번호 영역도 별도로 긁는다
6. 모두 긁으면 번호가 모두 공개된다
```

---

## 화면 구성

### 1. 메인 화면 (회차 선택)

```
┌─────────────────────────────┐
│       🎱 로또 긁긁           │
│                             │
│   회차를 선택하세요           │
│   [ 제1216회 (2026.03.21) ▾]│
│                             │
│      [ 🪙 긁기 시작! ]       │
│                             │
│   ─────────────────────     │
│   최근 회차                  │
│   1216회 · 2026.03.21       │
│   1215회 · 2026.03.14       │
│   1214회 · 2026.03.07       │
└─────────────────────────────┘
```

### 2. 긁기 화면 (메인)

```
┌─────────────────────────────┐
│  제1216회 로또 6/45          │
│  추첨일: 2026.03.21         │
│                             │
│  ┌─────────────────────┐    │
│  │ ░░░░░░░░░░░░░░░░░░░ │    │
│  │ ░ ⓵  ⓶  ⓷  ⓸  ⓹  ⓺░ │    │
│  │ ░░░░░░░░░░░░░░░░░░░ │    │
│  │                     │    │
│  │ ░░░░░ + 보너스 ░░░░░ │    │
│  └─────────────────────┘    │
│                             │
│         [ 전부 긁기 ]        │
└─────────────────────────────┘
```

### 3. 모두 긁은 후

```
┌─────────────────────────────┐
│  제1216회 로또 6/45          │
│                             │
│   ③ ⑩ ⑭ ⑮ ㉓ ㉔  + ㉕    │
│                             │
│      [ 다른 회차 긁기 ]      │
└─────────────────────────────┘
```

모든 번호가 공개되면 은박이 완전히 사라지고 번호 볼만 깔끔하게 남는다.

---

## 기능 명세

### MVP (v1.0)

| 기능 | 설명 |
|------|------|
| **회차 선택** | 최신 회차 자동 선택, 드롭다운으로 과거 회차 선택 가능 |
| **긁기 인터랙션** | Canvas 기반 은박 스크래치 효과 (터치 + 마우스 지원) |
| **번호 공개** | 당첨번호 6개 + 보너스 1개를 번호 볼 UI로 표시 |
| **전부 긁기** | 기다리기 싫은 사용자를 위한 한번에 공개 버튼 |
| **사운드** | 배경음 + 스크래치 효과음 + 번호 공개음 (음소거 토글 제공) |
| **PWA** | 아이폰 홈 화면에 앱으로 설치 가능 (manifest + Service Worker) |
| **반응형 UI** | 모바일 퍼스트, 데스크톱 호환 |

### Nice-to-have (v2.0)

| 기능 | 설명 |
|------|------|
| 결과 공유 | 카카오톡/링크 공유 |
| 히스토리 | 최근 확인한 회차 기록 (LocalStorage) |
| 번호 색상 | 로또 공식 색상 (1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록) |

---

## 기술 스택

| 구분 | 선택 | 사유 |
|------|------|------|
| **프레임워크** | React + Vite | 빠른 개발, 간단한 SPA에 적합 |
| **언어** | TypeScript | 타입 안전성 |
| **스타일링** | Tailwind CSS | 빠른 UI 구현, 반응형 유틸리티 |
| **스크래치 효과** | HTML5 Canvas API | 은박 긁기 인터랙션 구현 |
| **사운드** | Web Audio API + mp3 파일 | 코드 생성 톤 + 소스 파일 혼합 |
| **PWA** | vite-plugin-pwa | manifest.json + Service Worker 자동 생성 |
| **상태 관리** | React useState | 단순한 앱이므로 별도 라이브러리 불필요 |
| **배포** | GitHub Pages | 정적 사이트, GitHub Actions로 자동 배포 |
| **CI/CD** | GitHub Actions | 빌드 + 배포 자동화 |

---

## API 연동

### 동행복권 로또 당첨번호 API

> ⚠️ 비공식 API (공식 Open API 없음). 사이트 변경 시 동작하지 않을 수 있음.

**엔드포인트:**
```
GET https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do
```

**필수 헤더:**
```
Referer: https://www.dhlottery.co.kr/lt645/result
X-Requested-With: XMLHttpRequest
```

**파라미터:**

| 파라미터 | 설명 |
|---------|------|
| `srchDir` | `center`: 특정 회차, `latest`: 최신 회차 |
| `srchLtEpsd` | 조회할 회차 번호 |

**응답 주요 필드:**
```json
{
  "data": {
    "list": [{
      "ltEpsd": 1216,            // 회차
      "ltRflYmd": "20260321",    // 추첨일
      "tm1WnNo": 3,              // 당첨번호 1~6
      "tm2WnNo": 10,
      "tm3WnNo": 14,
      "tm4WnNo": 15,
      "tm5WnNo": 23,
      "tm6WnNo": 24,
      "bnsWnNo": 25              // 보너스 번호
    }]
  }
}
```

### 데이터 수집 전략 (CORS 프록시 불필요)

로또 추첨은 매주 토요일 고정이므로, **GitHub Actions 스케줄로 데이터를 수집하여 정적 JSON 파일로 배포**한다.
브라우저는 같은 도메인의 JSON 파일만 fetch → CORS 문제 없음, 외부 서비스 의존 없음.

```
GitHub Actions (매주 토 21:30 KST)
  → 동행복권 API 호출
  → public/data/rounds.json 업데이트
  → 자동 커밋 + GitHub Pages 재배포
```

**`public/data/rounds.json` 형식:**
```json
{
  "lastUpdated": "2026-03-21T21:30:00+09:00",
  "rounds": [
    {
      "round": 1216,
      "date": "2026-03-21",
      "numbers": [3, 10, 14, 15, 23, 24],
      "bonus": 25
    },
    {
      "round": 1215,
      "date": "2026-03-14",
      "numbers": [1, 7, 12, 29, 38, 44],
      "bonus": 17
    }
  ]
}
```

**GitHub Actions 스케줄:**
```yaml
# .github/workflows/fetch-lotto.yml
name: Fetch Lotto Data

on:
  schedule:
    - cron: '30 12 * * 6'  # 매주 토요일 21:30 KST (UTC 12:30)
  workflow_dispatch:          # 수동 실행 가능

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/fetch-lotto.mjs
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: 'data: update lotto results'
```

**`scripts/fetch-lotto.mjs`** — API 호출 후 `rounds.json`에 최신 회차 추가하는 스크립트.

### 최신 회차 번호 계산

```typescript
function getLatestRound(): number {
  const START_DATE = new Date('2002-12-07')
  const today = new Date()
  const diffDays = Math.floor(
    (today.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.floor(diffDays / 7) + 1
}
```

---

## 프로젝트 구조

```
lotto/
├── .github/
│   └── workflows/
│       ├── deploy.yml           # 빌드 + GitHub Pages 배포
│       └── fetch-lotto.yml      # 매주 토 21:30 KST 로또 데이터 수집
├── scripts/
│   └── fetch-lotto.mjs          # 동행복권 API → rounds.json 변환
├── public/
│   ├── favicon.ico
│   ├── data/
│   │   └── rounds.json          # 회차별 당첨번호 데이터 (Actions가 자동 갱신)
│   ├── icons/                   # PWA 아이콘 (192x192, 512x512)
│   ├── manifest.json            # PWA 매니페스트
│   └── sounds/
│       ├── bgm.mp3              # 배경음 루프
│       ├── reveal.mp3           # 번호 공개 효과음
│       └── fanfare.mp3          # 전체 공개 팡파레
├── src/
│   ├── components/
│   │   ├── ScratchCard.tsx      # 스크래치 카드 (Canvas)
│   │   ├── LottoBall.tsx        # 번호 볼 UI
│   │   └── RoundSelector.tsx    # 회차 선택
│   ├── hooks/
│   │   ├── useLottoResult.ts    # API 호출 훅
│   │   └── useSound.ts          # 사운드 관리 훅
│   ├── utils/
│   │   └── scratch.ts           # Canvas 스크래치 유틸
│   ├── types/
│   │   └── lotto.ts             # 타입 정의
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 스크래치 효과 구현 방식

```
1. Canvas 레이어를 당첨번호 위에 overlay
2. 은색 그라데이션 + 노이즈 텍스처로 은박 느낌 렌더링
3. 터치/마우스 이벤트로 접촉 좌표 추적
4. globalCompositeOperation = 'destination-out'으로 긁은 영역 투명화
5. 긁은 면적이 60% 이상이면 자동으로 나머지 공개 (reveal)
6. 각 번호 영역을 개별 Canvas로 분리 → 하나씩 긁는 재미
```

---

## PWA (Progressive Web App)

아이폰 Safari에서 "홈 화면에 추가"로 네이티브 앱처럼 설치/사용.

### 필수 구성

| 항목 | 설명 |
|------|------|
| `manifest.json` | 앱 이름, 아이콘, 테마 색상, `display: standalone` |
| Service Worker | vite-plugin-pwa가 자동 생성. 정적 에셋만 캐싱 (`rounds.json`은 제외) |
| 아이콘 | 192x192, 512x512 PNG (홈 화면/스플래시용) |
| `apple-mobile-web-app-capable` | iOS Safari 전체화면 모드 메타 태그 |
| `apple-touch-icon` | iOS 홈 화면 아이콘 지정 |

### vite.config.ts 설정

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '로또 긁긁',
        short_name: '로또긁긁',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
```

> ⚠️ iOS Safari 제약: 푸시 알림 제한, 50MB 캐시 한도, 백그라운드 실행 불가.
> 이 앱은 단순 조회 앱이므로 해당 제약에 영향 없음.

### 데이터 갱신 전략

PWA 캐시로 인해 새 회차 데이터가 반영 안 되는 문제를 방지한다.

**원칙:**
- `rounds.json`은 Service Worker 캐시에서 **제외** (Network Only)
- 정적 에셋 (JS, CSS, 이미지, 사운드)은 **Cache First** (오프라인 지원)

**갱신 시점:** 앱 시작 시 + 백그라운드 → 포그라운드 전환 시

```typescript
// useLottoResult.ts
function useLottoResult() {
  const [data, setData] = useState(null)

  const fetchData = useCallback(async () => {
    const res = await fetch('./data/rounds.json', { cache: 'no-cache' })
    setData(await res.json())
  }, [])

  useEffect(() => {
    fetchData() // 앱 시작 시

    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchData()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [fetchData])

  return data
}
```

**vite-plugin-pwa 캐시 제외 설정:**

```typescript
VitePWA({
  workbox: {
    navigateFallbackDenylist: [/\/data\//],
    runtimeCaching: [
      {
        urlPattern: /\/data\/rounds\.json$/,
        handler: 'NetworkOnly'  // 항상 서버에서 가져옴
      }
    ]
  }
})
```

---

## GitHub Actions (CI/CD)

main 브랜치에 push 시 자동으로 빌드 → GitHub Pages 배포.

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - uses: actions/deploy-pages@v4
```

### Vite base path 설정

GitHub Pages는 `https://{user}.github.io/{repo}/` 경로로 서빙되므로:

```typescript
// vite.config.ts
export default defineConfig({
  base: '/lotto/',  // GitHub 레포 이름에 맞춤
})
```

---

## 사운드 설계

### 사운드 목록

| 사운드 | 트리거 | 구현 방식 | 특징 |
| ------ | ------ | --------- | ---- |
| **배경음** | 긁기 화면 진입 시 자동 재생 | mp3 파일 루프 | 긴장감 있는 낮은 볼륨의 앰비언트, 거슬리지 않게 |
| **스크래치음** | 긁는 동안 (터치/마우스 이동 중) | Web Audio API 화이트노이즈 + 필터 | 긁을 때만 재생, 손 떼면 즉시 정지 |
| **번호 공개음** | 개별 번호 영역 60% 이상 긁었을 때 | mp3 파일 (짧은 "띵!") | 번호마다 피치를 살짝 올려서 점점 고조되는 느낌 |
| **전체 공개음** | 마지막 번호(보너스) 공개 시 | mp3 파일 (팡파레/드럼롤) | 모든 번호가 드러나는 클라이맥스 |

### 구현 방식

```text
1. useSound 훅으로 사운드 상태 일괄 관리
2. 배경음/효과음은 public/sounds/ 디렉토리에 mp3로 배치
3. 스크래치음은 Web Audio API로 실시간 생성 (화이트노이즈 + BandpassFilter)
   - 긁는 속도에 따라 볼륨/필터 주파수 변화 → 자연스러운 느낌
4. 모바일 브라우저 정책 대응: 첫 터치 이벤트에서 AudioContext.resume()
5. 음소거 토글 버튼 제공 (상태는 LocalStorage에 저장)
```

### 무료 사운드 소스

- freesound.org (CC0 라이선스 필터)
- mixkit.co (무료 상업용 효과음)
- 또는 GarageBand/Audacity로 직접 제작

---

## 일정 추정

| 단계 | 내용 | 규모 |
|------|------|------|
| 1 | 프로젝트 세팅 + PWA + GitHub Actions | 작음 |
| 2 | 회차 선택 UI | 작음 |
| 3 | API 연동 + CORS 프록시 | 작음 |
| 4 | 스크래치 카드 Canvas 구현 | 중간 |
| 5 | 번호 볼 UI | 작음 |
| 6 | 사운드 연동 (기본 효과음) | 작음 |
| 7 | 반응형 + 마무리 | 작음 |
| 8 | (v2) 사운드 컨셉 개선 (007 스타일) | 작음 |

---

## 핵심 UX 원칙

1. **두근두근 연출** — 번호를 하나씩 긁을 때 서서히 드러나는 느낌
2. **모바일 최적화** — 엄지 하나로 긁기 편한 카드 크기
3. **즉시 시작** — 접속하면 최신 회차 카드가 바로 준비됨
4. **가벼움** — 번들 사이즈 최소화, 3초 내 로딩
