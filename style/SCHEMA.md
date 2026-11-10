# 발표 데이터 형식 (deck.json)

스킬이 만드는 발표 파일은 `deck.json` 하나를 엔진(`deck.js` · `deck.css`)이 그려서 보여 준다.
`build` 단계가 deck.json + 엔진 + 글꼴을 HTML 파일 하나로 묶는다. 엔진은 이 JSON 만 읽는다.

## 맨 위

```json
{
  "meta": {
    "session": "CW47",                 // 회차
    "title": "고용지표",                // 회차 주제
    "series": "경제지표101",            // 연재 이름(없으면 "")
    "date": "2026.11.24",              // 발표일
    "asof": "2026.09",                 // 내장 숫자의 기준(가장 늦은 데이터월)
    "parts": [ {"no": 1, "name": "경상수지", "desc": "나라 밖에서 번 돈의 성적표"} ]
  },
  "glossary": { "본원소득": "해외에서 받은 임금 · 배당 · 이자에서 내준 것을 뺀 값" },
  "facts": {                            // 숫자 출처 · 최신 값 비교용
    "ca_2026_09": {"series": "ecos:301Y013:000000:M", "period": "2026.09", "value": 61457.5, "unit": "백만 달러", "source": "한국은행 ECOS 301Y013"}
  },
  "slides": [ ... ]
}
```

## 글 꾸밈 (모든 글 칸 공통)

- `**글**` → 강조색(초록) · `^^글^^` → 경고색(산호) · `[[낱말]]` → 용어 풀이(밑줄, glossary 에 뜻) · `\n` → 줄바꿈
- HTML 태그는 쓰지 않는다(엔진이 글자로 넣는다).

## 장 공통 칸

| 칸 | 뜻 |
|---|---|
| `kind` | 화면 종류 (아래 8가지) |
| `part` | PART 번호(없으면 0 — 표지 · 오프닝 · 토의 · 끝) |
| `title` | 화면 제목 = 결론 한 줄(25자 안) |
| `source` | 출처 한 줄(작게) |
| `note` | 발표자 메모 |
| `read` | 읽기 겹 `{ "head": "결론 문장 2줄 80자 안팎(~임/~함)", "points": ["근거", ...], "table": {"cols": [...], "rows": [[...]]}?, "source": "출처 · 기준월" }` |
| `transition` | 직접 정할 때만 `slide` · `fade` · `zoom` (안 쓰면 엔진이 화면 종류로 정함) |

## 화면 종류 8가지

### 1. `cover` 표지 · `part` 간지 · `end` 끝
- cover: `title`, `sub`, `date`
- part: `part`, `name`, `desc` — 아래 PART 지도(meta.parts)가 눌러 이동하는 단추로 나옴
- end: `title`(예: "다음 회차 : 물가지표"), `sub`

### 2. `statement` 한 문장
- `title`(크게), `sub`?(작은 한 줄)
- `words`?: `["생산","분배","지출"]` + `ops`?: `["=","="]` + `captions`?: `["누가 만들었나", ...]` → 큰 낱말 줄

### 3. `number` 큰 숫자
- `label`(숫자 위 한 줄), `value`(숫자), `decimals`, `unit`, `sub`(아래 한 줄), `fact`?(facts 키 — 최신 값 비교)
- 장이 열릴 때 0 → 값으로 셈

### 4. `chart` 차트
```json
{"kind":"chart","title":"해마다 ^^4월^^엔 흑자가 줄어듦",
 "chart":{"type":"bar",                     // bar | line | cumline | hbar
          "unit":"억 달러",
          "series":[{"name":"경상수지","data":[["2021.12",56.9], ...],"fact":"ca_2026_09"}],
          "colorBy":{"2026":"acc","*-04":"hot"},     // 라벨 규칙 → 색(acc · hot · data)
          "annotate":[{"at":"2026.04","text":"4월 = 배당 지급 달"}],
          "ranges":[12,36,0], "range":36,          // 0 = 전체
          "yoy":true}}
```
- `hbar`: `data` = `[["민간소비",48.1],["수입",-48.3]]`, 음수는 왼쪽으로
- `cumline`: 해마다 1월부터 누적한 선을 해마다 따로(지난해 회색 · 올해 강조)
- `line`: 계열 여러 개 가능, 끝점에 이름표

### 5. `diagram` 도식
```json
{"kind":"diagram","title":"경상수지는 **네 가지** 주고받음의 합",
 "layout":"columns",          // columns | flow | cycle | hub | tree | pyramid | matrix | timeline | venn | skeleton
 "op":"+",                    // columns 사이 기호(선택)
 "items":[{"head":"상품","body":"물건을 판 돈 − 산 돈\n[[국제수지 기준]]"}, ...],
 "center":"경상수지",          // hub · venn · cycle 가운데(선택)
 "steps":true,                // 클릭마다 한 칸
 "skeleton":"r01234",         // 참고한 HCG 골격 id(작게 표시)
 "skel":{...}}                // layout=skeleton 일 때만 build 가 넣음(골격 boxes)
```
- 칸 수: columns 2~5 · flow 3~6 · cycle 3~6 · hub 3~6 · tree 2단 · pyramid 3~4 · matrix 4(2×2, `axes`:{"x":"…","y":"…"}) · timeline 3~7 · venn 2~3

### 6. `compare` 비교
- `left`/`right`: `{"head":"무역수지","tag":"통관 기준","points":["…"]}`, `vs`?: 가운데 한 줄

### 7. `question` 질문(토의)
- `title`(질문), `options`: `["환율(원화 가치)", ...]` → 발표자가 손든 수를 눌러 셈(+1 · −1)

### 8. `table` 작은 표
- `cols`, `rows`(5행 안), `hi`?: 강조할 행 번호

## 화면 규칙(엔진이 `?check` 로 잼)
- 화면 글(제목 · 본문 · 항목, 차트 라벨 · 숫자 · 출처 빼고) 장당 40자 안
- 가장 작은 글 14px(1280×720 기준) 이상, 넘침 · 겹침 없음
