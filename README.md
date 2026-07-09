# K-Stock Radar

국내 주식 뉴스, DART 공시, 재무, 가격 데이터를 바탕으로 투자 검토 후보를 정리하는 리서치 보조 도구입니다.

## 실행

Windows PowerShell에서는 `npm.ps1` 실행 정책에 막힐 수 있으므로 `npm.cmd` 사용을 권장합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

접속 주소:

```text
http://localhost:3000
```

빌드 확인:

```powershell
npm.cmd run build
```

## 로컬 환경변수

`.env.example`을 복사해 `.env.local`을 만들고 필요한 값을 입력하세요. 실제 API 키는 코드에 직접 넣지 말고 서버 환경변수로만 읽습니다.

```powershell
Copy-Item .env.example .env.local
```

```env
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
OPEN_DART_API_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

## 뉴스와 DART 검색

- 뉴스 조회에는 `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`이 필요합니다.
- DART 공시 조회에는 `OPEN_DART_API_KEY`가 필요합니다.
- `OPENAI_API_KEY`는 선택 사항이며, 리포트 문장 보강과 AI 반대 의견 생성에만 사용합니다.
- 뉴스와 DART 조회에는 OpenAI를 사용하지 않습니다.
- 실제 URL이 확인된 뉴스와 공시만 표시합니다.
- API 키가 없거나 조회 결과가 없으면 임의 생성 자료를 만들지 않고 데이터 없음 상태를 표시합니다.

## Vercel 환경변수

Vercel 배포 시 Project Settings → Environment Variables에서 아래 값을 등록하세요.

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `OPEN_DART_API_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

뉴스/DART만 사용하려면 OpenAI 관련 값은 비워도 됩니다.

## 가격과 차트

- Yahoo Finance 기반 `yahoo-finance2`를 서버에서만 사용합니다.
- KOSPI는 `.KS`, KOSDAQ은 `.KQ` 심볼로 조회합니다.
- 현재가는 quote 값을 우선 사용하고, 차트는 일별 과거 시세 데이터를 사용합니다.
- 과거 시세를 불러오지 못하면 가짜 차트를 그리지 않고 차트 데이터 없음 상태를 표시합니다.

## Git 보안

`.gitignore`에서 `.env`와 `.env*.local`을 제외합니다. `.env.local`과 `.env`는 GitHub에 올리지 마세요.

```gitignore
.env
.env*.local
```

## 참고

이 서비스는 투자 조언이 아닌 리서치 보조 자료입니다. 뉴스 요약과 공시 분류는 원문 확인을 돕기 위한 참고 정보이며, 최종 판단 전 원문 기사와 DART 공시를 직접 확인해야 합니다.
