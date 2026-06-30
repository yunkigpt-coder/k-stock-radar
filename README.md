# K-Stock Radar

국내 주식 뉴스, 공시, 재무, 가격 데이터를 바탕으로 관심 종목을 선별하고 기업별 리서치 리포트를 제공하는 AI Research Agent입니다.

## 핵심 기능

- **48시간 Radar**
  - KOSPI Universe를 먼저 1차 스크리닝합니다.
  - 모든 종목을 바로 LLM으로 분석하지 않고, 상위 후보만 리포트 대상으로 추립니다.
  - `limit`, `sector`, `sort` 파라미터를 지원합니다.
- **Research Report**
  - 기업명, 종목코드, 부분 일치 검색을 지원합니다.
  - 뉴스, DART 공시, 재무, 차트, 3C, SWOT, 반대 의견, 리서치 스택을 제공합니다.
- **Demo Mode**
  - API 키가 없어도 `src/data/kospi-universe.ts`의 샘플 KOSPI Universe 기반으로 앱 전체가 동작합니다.
- **Real API Mode**
  - OpenAI, 뉴스 API, DART, 주가 API를 서버 API route에서만 사용하도록 확장할 수 있습니다.

## Demo Mode / Real API Mode

### Demo Mode

- `src/data/kospi-universe.ts`의 샘플 KOSPI Universe로 동작합니다.
- 1차 스크리너가 단기 모멘텀, 장기 테마 매력도, 리스크 레벨, 데이터 신뢰도를 계산합니다.
- 데모 제출용 URL에서도 주요 기능이 바로 보이도록 설계되어 있습니다.

### Real API Mode

- `OPENAI_API_KEY`가 있으면 서버에서만 LLM 요약을 생성합니다.
- `OPEN_DART_API_KEY`, `NEWS_API_KEY`, `STOCK_API_BASE_URL`, `STOCK_API_KEY`를 연결하면 하이브리드 모드로 동작합니다.
- 실제 운영에서는 KRX 상장사 마스터, DART 기업코드 매핑, 뉴스 수집기를 붙여 전체 KOSPI 상장사로 확장하는 구조를 염두에 두고 있습니다.

## 주요 파일

- `src/data/kospi-universe.ts`
  - 샘플 KOSPI Universe 데이터
- `src/lib/screener.ts`
  - 1차 스크리닝 로직
- `src/lib/dataProviders.ts`
  - 데모 데이터와 외부 API 데이터 결합 로직
- `src/lib/llm.ts`
  - OpenAI 기반 리서치 문장 생성 로직
- `src/app/api/recommend/route.ts`
  - Radar 후보 반환 API
- `src/app/api/analyze/route.ts`
  - 기업 리서치 리포트 API
- `src/components/RadarApp.tsx`
  - Command Center, Radar, Report 화면

## 실행 방법

Node.js 18.17 이상을 권장합니다.

```bash
cd k-stock-radar
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속합니다.

프로덕션 빌드 확인:

```bash
npm run build
```

## 환경 변수

`.env.example`을 참고해 `.env.local`을 만듭니다.

```bash
cp .env.example .env.local
```

필수 환경 변수는 없습니다. 아무 API 키가 없어도 Demo Mode로 동작합니다.

| 변수명 | 설명 |
| --- | --- |
| `OPENAI_API_KEY` | 서버 API route에서만 사용하는 OpenAI API 키 |
| `OPENAI_MODEL` | 기본값 `gpt-4.1-mini` |
| `OPEN_DART_API_KEY` | OpenDART API 키 |
| `NEWS_API_KEY` | 뉴스 API 키 |
| `NEWS_API_URL` | 선택 사항인 뉴스 API 엔드포인트 |
| `STOCK_API_BASE_URL` | 국내 주가/차트 API base URL |
| `STOCK_API_KEY` | 주가 API 키 |

## API

### `GET /api/recommend`

Radar 후보를 반환합니다.

Query parameters:

- `limit`: 반환할 후보 수, 기본값 `12`
- `sector`: 업종 필터
- `sort`: `short`, `long`, `risk` 중 하나

### `POST /api/analyze`

기업 리서치 리포트를 반환합니다.

Request body:

```json
{
  "query": "삼성전자"
}
```

`query`에는 기업명 또는 종목코드를 넣을 수 있습니다.

## Vercel 배포

1. 저장소를 GitHub, GitLab, Bitbucket 중 하나에 올립니다.
2. Vercel에서 `Add New Project`를 선택합니다.
3. Root Directory가 필요하면 `k-stock-radar`로 지정합니다.
4. Framework Preset은 `Next.js`를 사용합니다.
5. 필요한 서버 환경 변수를 등록합니다.
6. `Deploy`를 누르면 데모 제출용 URL이 생성됩니다.

Vercel CLI:

```bash
cd k-stock-radar
npm install
npx vercel
npx vercel --prod
```

## 참고

- 이 앱은 투자 권유 서비스가 아니라 리서치 보조 도구입니다.
- 점수와 코멘트는 최신 뉴스, 공시, 재무, 주가 데이터를 정리한 요약이며 원문 공시와 최신 시세 확인을 대체하지 않습니다.
