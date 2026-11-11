# 도식 부품(`style/parts/k_*.js`) 칸 정리 — 엔진 3판

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `beats` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채우는 짜임만 둔다.
글은 모두 상자 안에서 줄바꿈되며, 문자열 안 `**굵게**` 는 짙은 초록(어두운 바탕에서는 밝은 초록). 숫자는 덱을 만드는 쪽이 `data/snap` 에서 계산해 넣는다.
공통 CSS · 도움은 `k__css.js`(이름순으로 먼저 붙음) — `<style id="k-parts-css">` 한 번, `ECOM.kx`(상자 · 화살촉 · 줄 수 · 작은 차트 `mini`).
시험 덱 : `style/demo3_diagrams.json`(종류마다 2장, 만들기 `tools/make_demo3_diagrams.py`).

| 종류 | 쓰는 때 | 바뀜(`beats`) |
|---|---|---|
| `axis` 가운데 축 비교 | 두 개념 · 두 기관을 같은 기준 줄로 맞대기 | `{spot:'left'|'right'}` 한쪽만 밝게 |
| `stairs` 원인 계단 | 원인 → 결과 3~5단 + 결과 숫자 도장 | 없음 |
| `pyramid` 층 피라미드 | 위계 · 층(기준금리 → 시장금리 …) | `{spot:층}` |
| `balance` 저울 | 두 힘의 크기 비교(금리 대 물가, 흑자 대 적자) | `{left:{value},right:{value},period,note}` 다른 시점으로 다시 기욺 |
| `flow` 거래 흐름 | 주체 사이 통화 · 자산 이동(거래일 → 만기일) | 없음 |
| `ladder` 조건 사다리 | 조건 Ⅰ~Ⅲ 충족 여부 → 목표 | 없음 |
| `cycle` 순환 고리 | 3~6단계가 되돌아오는 구조 | `{spot:단계}` |
| `columns` 틀 기둥 | 3~4개 구성 · 경로를 나란히 | 없음 |
| `tree` 논리 나무 | 한 값을 요인으로 나눠 봄 | `{spot:가지}` |
| `calendar` 결정 일정판 | 금통위 · FOMC 월별 결과 · 다음 회의 | 없음 |
| `discuss` 토의 장 | 다룬 내용 → 토의 주제 + 손들기 | 없음 |
| `further` 추가 분석 장 | 후속 분석 과제 목록 | 없음 |
| `statement` 결론 문장 | 결론 2줄 + 근거 숫자 3개 | 없음 |
| `term` 용어(식 없음) | 정의 · 성질 3 · 관련 숫자(또는 구성 상자) · 관련 용어 | 없음 |

## axis — 가운데 축 비교(CW44 7쪽 · Kick-off 10쪽)
- `center{title}` · `left` / `right` `{title, def(한 줄 정의), sub, badge:'up'|'down'|'none'|짧은 글자('BOK'), tone}`
- `rows[{label(가운데 기준 열), left, right}]` 3~6줄
- `examples{label:'예시', left:{lead, items:[{k,v}], concl}, right:{…}}` — 있으면 줄 아래 예시 상자, 결론은 상자 맨 아래
- `result{left, right}` — 예시가 없을 때 양쪽 아래 띠(판 2 칸 이름 `concl` 은 lint 가 막으므로 `result`)
- 움직임 : 가운데 기준 열 → 양쪽 판이 바깥으로 펼쳐짐 → 줄(왼 · 오 동시) → 예시 → 결론

## stairs — 원인 계단(CW44 10쪽)
- `intro{title, text}`(왼쪽 위 물음 상자) · `steps[3~5]{tag:'WHY'·'물가' 등 4자 안팎, title, lines:[1~2줄]}`
- `side{title, text, sub}`(오른쪽 위 상자, 큰 화살이 가리킴) · `stamp{label, value}`(큰 화살 위 도장. side 없으면 오른쪽 위 결과 도장)
- 움직임 : 굽은 화살이 그려지고 단계가 하나씩 내려앉음 → 큰 화살 → 도장이 떨어짐 → 옆 상자

## pyramid — 층 피라미드(CW44 8쪽)
- `layers[3~5, 0 = 꼭대기]{label, sub, desc(가운데 설명 상자), note:{title, items[]} | '글'(오른쪽 괄호 메모)}`
- `cycle{label('시장\n기대'), from, to, top, bottom}` — 층 범위 사이 둥근 화살(선택)
- 움직임 : 아래층부터 쌓임 + 층마다 설명 → 둥근 화살 → 오른쪽 메모가 밀려 들어옴

## balance — 저울(CW44 11쪽)
- `left` / `right` `{label, value, dec, unit, sub, tone, title(옆 목록 머리), items:['글' | {t, v, d}]}`
- `period`('2026.10') · `diff{label, dec, unit, sign}`(왼 − 오른 값을 아래 띠에) · `summary`(아래 띠 글) · `tilt`(도, 직접)
- `from{left:{value}, right:{value}, period}` — 쌓기 중 이 시점에서 출발해 지금 값으로 다시 기욺(쌓기 안 바뀜)
- 기울기 = 값 차이 비율(25% 이상이면 최대 12°), 추 크기 = 값의 제곱근. 끝 상태(인쇄 · ?check)는 늘 `left/right` 값
- 움직임 : 받침 → 막대 · 추 → 무거운 쪽으로 흔들리다 멈춤(움직임 줄이기면 바로 끝 상태) → 옆 목록 → 아래 띠

## flow — 거래 흐름(CW44 12쪽)
- `side{title, rows:[{k, v}], concl}`(왼쪽 정의 판, 선택) · `tab('구조')` · `time{from, to}`(위 시간 띠)
- `nodes[{id, label, sub, col, row, tone:'soft'|'dark'|'gray'|'main'}]` — 칸(col) · 줄(row) 격자
- `edges[{from, to, token, tone:'main'|'cmp', curve:'up'|'down'}]` — 같은 두 상자 사이 둘이면 나란히, 표는 바깥쪽에
- `types{title('종류'), items:[{name, text}]}`(아래 판)
- 움직임 : 시간 띠가 펼쳐짐 → 상자 → 화살이 차례로 그려지며 점이 화살을 따라가고 통화 표가 붙음 → 아래 판

## ladder — 조건 사다리(CW44 13쪽)
- `goal{title, sub}` · `steps[2~4, 0 = 맨 아래]{label('조건 Ⅰ'), title, sub, met}` · `metText` · `unmetText`
- `factors{title, lead, center:{title, text, icon('%')}, groups:[{title, sub, tone, items:[{t, d}]}]}`(오른쪽 판)
- 움직임 : 조건 칸이 아래부터 채워지고 확인 표시 → 위로 굽은 화살 → 모두 충족이면 목표 상자가 빛남 → 오른쪽 판

## cycle — 순환 고리
- `center{title, sub}` · `steps[3~6]{title, text, value(작은 칩)}`
- 움직임 : 가운데 원 → 단계 상자가 고리 위에 놓이고 다음 단계로 가는 화살 → 마지막 화살이 고리를 닫음 → 점 하나가 한 바퀴

## columns — 틀 기둥(Kick-off 6쪽)
- `top{title, sub}`(위 목표 띠 + 갈래 화살, 선택) · `cols[3~4]{title, sub, hi, value:{v, dec, unit, label, sign}, points[], chart:{type, data, first, last, dec, unit, title}, note, noteLabel('확인 지표')}`
- `summary`(아래 요약 띠, `**굵게**`) · `sumLabel('요약')`
- 움직임 : 목표 띠 → 갈래 선 → 기둥이 차례로 섬 → 숫자 굴림 · 작은 차트 → 요약 띠가 왼쪽부터 펼쳐짐

## tree — 논리 나무
- `root{title, value, sub}` · `branches[2~4]{title, sub, tone, leaves:[{title, text, value}]}`(잎 합계 8개 안팎)
- 움직임 : 뿌리 → 줄기 선 → 가지 → 가지마다 잎 선과 잎

## calendar — 결정 일정판(Kick-off 10쪽)
- `year` · `months`(기본 1~12월) · `rows[{name, sub, sum, tone, marks:[{m(0~11), kind:'up'|'down'|'hold'|'next', res, size, rate, date}]}]`
- `now{m, f(달 안 위치 0~1), label}`(오늘 선) · `legend:false` · `legendNote`
- 회의가 없는 달은 점선 빈칸, 오늘 뒤의 일반 칸은 흐리게, `next` 는 점선 상자
- 움직임 : 월 머리 → 줄 이름 → 달 칸이 시간 순서대로 → 오늘 선이 그려짐

## discuss — 토의 장(Kick-off 13쪽 · CW44 14쪽)
- `left{title('주요 논의사항'), items[3~4]{title, text}}` · `right{title('토의 주제'), topics[2~3]{title, q}}` · `vote:false`
- 손들기 단추(`.vote`) : 누르면 +1, Shift+누르기 −1. 장이 넘어가지 않음. `localStorage` 키 `ecom-vote|회차|장 번호|주제 번호` 에 남고(막히면 무시), 가장 많은 주제 상자에 초록 테두리

## further — 추가 분석 장(Kick-off 14쪽 · CW44 15쪽)
- `caption`(위 제목 줄) · `tag('예시', false = 없음)` · `prefix('분석')` · `groups[{name, items:[{title, text}]}]`(번호는 묶음을 넘어 이어짐)

## statement — 결론 문장 + 근거
- `label('결론', false = 없음)` · `text`(2줄, `**핵심 구**` 에 형광 띠가 칠해짐, 줄바꿈은 `\n`) · `sub`
- `evidence[3]{label, note, value, dec, unit, sign, chart:{type:'spark'|'bars'|'step', data, first, last, dec, unit, sign, lo, hi}, source}`

## term — 일반 용어(식 용어는 `formula`)
- `tag('용어')` · `term` · `en` · `def`(한 문장, 상자 안 `defLabel('정의')` 칩) · `props[3]{title, text}`
- `num{label, note, value, dec, unit, sign, chart:{…mini}, source}` · `ex{title, items[]}`(숫자가 없을 때 구성 상자) · `related[]`(관련 용어 칩)

## 작은 차트 `ECOM.kx.mini(svg, m, x, y, w, h, 단계, 시작ms)`
`m.type` = `spark`(선 + 옅은 면) · `step`(계단 선, 정책금리) · `bars`(막대, 음수는 0선 아래 · 마지막 막대만 강조).
끝 값 · 첫 값 라벨에 단위가 붙고 흰 테두리로 선과 겹쳐도 읽힘. 막대 끝 값 라벨이 옆 막대와 겹치면 차트 위로 올라감.
`시작ms` 를 주면 막대가 40ms 간격으로 자람(단계 차례 지연이 막대 수만큼 쌓이지 않게).

## 2판 → 3판 대응
| 2판(`style/v2`) | 3판 |
|---|---|
| `compare` `style:"rows"`(`heads` · `rows:[[왼,오]]` · `notes`) | `axis` — `left.title`/`right.title` = heads, `rows[{label, left, right}]`(label = 2판 notes 또는 줄 이름) |
| `compare` `style:"pair"`(`left/right{head, tag, body, wells}` · `concl`) | `axis` — head → title, body → def, wells → `examples.*.items`, concl → `concl{left,right}` |
| `diagram` `layout:"tiers"` `shape:"pyramid"` | `pyramid` — `items[{head, body}]` → `layers[{label: head, desc: body}]`(2판은 아래 → 위, 3판 0 = 꼭대기) |
| `diagram` `layout:"tiers"` `shape:"stairs"` | `stairs` — `items[{head, body}]` → `steps[{title: head, lines:[body]}]` |
| `diagram` flow `style:"pill"` · timeline `style:"chevron"` | 차례만 있으면 `stairs`, 순환이면 `cycle`, 주체 사이 이동이면 `flow` |
| `diagram` `layout:"modules"` · `style:"card"` · `layout:"wells"` | `columns` — `items[{head, parts}]` → `cols[{title: head, points: parts}]`, 마지막 결과 칸 → `summary` |
| `diagram` `layout:"circles"`(값 크기 비교) | 두 값이면 `balance`, 셋 이상이면 `columns` + `value` |
| `question` | `discuss`(물음 → `right.topics[].q`) |
| `term`(`word` · `def` · `like` · `example`) | `term` — word → term, def 그대로, like(비유)는 쓰지 않음 → `props`, example → `num` |
| `headline`(`text` · `key` · `evidence` · `points`) | `statement` — key → `text` 안 `**…**`, evidence → `evidence`(+ `chart`), points → `sub` |
| `drivers`(`items[{sign,text,num}]`) | 3판 차트 부품 `drivers`(`j_drivers.js`), 요인을 갈래로 나눠 보일 때는 `tree` |
| `frame` · 「추후 분석」 표 | `further` |
| (없음) | `ladder` · `calendar` · `flow` 는 3판에서 새로 생김 |

## 디자인 규칙(이 부품들에 적용)
- 둥근 카드에 한쪽만 두꺼운 색 테두리(왼쪽 띠 · 위쪽 띠)를 쓰지 않음 — 강조 카드는 1.5px 초록 테두리 + 옅은 초록 바탕, 머리 강조는 카드 안 번호 칩 · 작은 이름표로.
- 바뀜 단계의 흐림은 `filter` 클래스(`.k-dim`)로 — 쌓기 움직임이 남긴 opacity 와 부딪히지 않음.

## 글 목업(`library/mockups/text3.json`)
판 2 도식 36 · 비교 14 · 용어 12 · 질문 6 = 68종을 이 부품(+ `formula` 1)으로 새로 씀. 만들기 `tools/make_text3.py`(시험 덱 `style/_mock_text.json` 도 함께) → `tools/make_mockups3.py` 가 합침.
