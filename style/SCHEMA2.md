# 발표 데이터 형식 2판 — 모션 · 새 화면 종류 (SCHEMA.md 에 더함)

1판(SCHEMA.md)의 칸과 화면 종류는 모두 그대로 쓴다. 아래는 2판에서 더하거나 바뀌는 것.

## 0. 움직임 원칙(엔진이 지킴)
- **차분함만.** 극적인 움직임(표현형 곡선 · 회전 · 확대 덮기 · 튀기)은 쓰지 않는다.
- 시간 : fast 120 · std 240 · scene 480 · count 900(ms). 차례 간격 50ms, 한 묶음 전체 400ms 안.
- 곡선 : enter `cubic-bezier(.05,.7,.1,1)` · std `cubic-bezier(.2,0,.38,.9)` · exit `cubic-bezier(.3,0,.8,.15)`. (표현형 없음)
- 클릭 한 번 = 한 단계. 움직이는 중에 누르면 그 단계를 바로 끝 상태로. 처음 열면(그리고 `?still` · `?check`) 끝 상태.
- 장 넘김은 바로 바꿈(cut). 앞 장과 같은 `carry` 이름을 가진 요소가 있을 때만 그 요소가 자리를 옮김.
- `prefers-reduced-motion` · 뒤 탭(document.hidden)이면 움직임 없이 바로 끝 상태.

## 1. 장 공통 칸 (더함)
| 칸 | 뜻 |
|---|---|
| `steps` | `false` 면 단계 없이 한 번에(기본은 화면 종류마다 정해진 단계) |
| `carry` | 다음 장으로 이어 옮길 요소 이름(예 : `"ytd"`) — 큰 숫자 · 제목 숫자 · 차트에 붙임 |
| `appendix` | 부록 장이면 번호(예 : `"A1"`). 진행 줄 · 쪽수에 안 셈, 본문 뒤에 모임 |
| `links` | 본문 장 아래 고리 `[{"to":"A1","text":"본원소득이란?"}]` → 누르면 부록, 부록엔 「← 본문 N장으로」 저절로 |
| `aside` | 오른쪽 좁은 칸(320px) 요점 `{"head":"…","points":["…"]}` — 차트 · 카드 장을 덜 비게 |

## 2. 새 화면 종류

### `kpi` 지표 카드 장 (구조화 — 빈 곳 없게)
```json
{"kind":"kpi","title":"2026년 대외 숫자 3개",
 "cards":[{"label":"경상수지 1~9월","value":3406.6,"decimals":1,"unit":"억 달러",
           "change":{"text":"× 2.8 2025년 연간 대비","dir":"up"},
           "asof":"데이터월 2026.09","source":"한국은행 ECOS 301Y013","fact":"ca_ytd",
           "spark":[["2026.01",132.6],["2026.02",231.9]]}],   // 작은 추세(6~24점)
 "foot":[["무역수지","2,525억 달러"],["외환보유액","4,405.6억 달러"]]}  // 선택: 카드 밑 요약 줄
```
- 카드 1~4장. 카드마다 **4칸 고정**(값 · 변화 · 기준 · 출처) + 작은 추세선. 1장이면 왼쪽 큰 카드 + 오른쪽 `aside`.
- 단계 : 카드 차례 등장 → 주인공 숫자 굴림 → (멈춘 뒤) 변화 칩 → 추세선 그리기.

### `table` (더함)
- `hiCol` : 옅은 띠를 깔 열 번호(최신 기간). `chips` : `{"행,열":"+316%"}` 칩으로 보일 칸.
- 단계 : 줄 차례 → 띠 쓸기 → 칩.

### `chart` (type 더함 · 모두 단계 있음)
| type | 칸 | 단계 |
|---|---|---|
| `bar` | (1판) + `notes:[{"at":"2026.04","text":"…"}]` | 축 → 막대 → 강조색 → 주석 하나씩(앞 주석 흐림) |
| `race` | `series:[{name,data(누적할 월 값)}]` 두 해 · `ref`(기준선 값 · 이름) · `mark`(넘어선 점) | 축 → 두 선 함께(끝 라벨 따라감) → 기준선 → 점 |
| `zoom` | `series` 하나 · `zoom:{"from":"2025.10","to":"2026.09"}` | 전체 → 틀 → 가로만 좁힘(세로 0부터 고정) + 작은 전체 그림 |
| `wipe` | `a`,`b` : 같은 칸 수 계열(같은 축) · `labels` | a 막대 → 세로 선이 지나가며 b |
| `slope` | `pairs:[{"label":"7월","a":119.5,"b":420.8}]` · `heads:["2025","2026"]` | 왼쪽 점 → 선 → 오른쪽 값 · 배수 |
| `rank` | `data:[["9월",614.6],…]` (가로 막대) | 차례 → 큰 순서로 자리만 옮김 → 1~3위 색 |
| `morph` | 월 `data` · `group:3` | 색 묶기 → 자리 모으기 → 위로 쌓기 → 끝 값 |
| `split` | `total:{label,value}` · `parts:[{label,value}]`(합 = total, 음수 가능) | 합계 막대 → 색 나눔 → 갈라져 제자리(음수는 0선 아래) → 주인공만 남김 |
| `bridge` | `start:{label,value}` · `steps:[{label,value}]` · `end:{label,value}` | 출발 → 몫 하나씩 → 도착 |
| `waffle` | `value`(%) · `label` · `rest` · `breakdown:[[이름, %]]`(오른쪽 표, 선택) | 빈 100칸 → 채움(마지막 칸 부분) → 숫자 · 표 |

### `headline` 결론 문장 장 (구조화)
```json
{"kind":"headline","text":"흑자의 거의 전부는 「상품」에서 나옴","key":"「상품」에서",
 "evidence":[{"label":"상품수지","value":3438.4,"unit":"억 달러","note":"1~9월"},
             {"label":"경상수지","value":3406.6,"unit":"억 달러","note":"1~9월"}],
 "points":["서비스 −187.7","본원소득 +206.1","이전소득 −50.3"]}
```
- 위 : 결론 문장(구 단위 차례 등장, `key` 에만 밑줄) / 아래 : 근거 카드 2~4장(4칸 틀 축약) + 작은 막대 비교 / 맨 아래 : 점 목록.
- 빈 곳 없이 위 · 아래 두 층을 채움.

### `drivers` 요인 장
- `items:[{"sign":"+","text":"반도체 수출 급증","num":"9월 +83.5%","note":"¹"}]` + 번호 각주. 단계 : 한 줄씩.

### `term` 정의 장 (보통 `appendix` 와 함께)
- `word`, `def`, `like`(비유), `example`?(숫자 한 줄). 단계 : 낱말 → 정의 → 비유.

## 3. 겹침 점검(`?check` 에 더함)
장마다 끝 상태에서 잼 :
- `textOverlap` : 보이는 글끼리 겹침(2px 넘게) — 0 이어야 함
- `textOnMark` : 글이 막대 · 점 · 선(데이터 표시) 위에 겹침 — 막대 안 값 라벨은 `data-inside` 로 표시한 것만 허용
- `outside` : 글 · 도형이 장(1280×720) 밖이나 자기 칸 밖
- `minFont` 16 이상(화면 겹)
결과 JSON 의 장마다 `{"textOverlap":[…], "textOnMark":[…], "outside":[…]}` — 모두 빈 배열이어야 통과.

## 4. 디자인 문법 칸 (`rules/design_grammar.md` 판 2에 맞춤)

### 발표 전체
| 칸 | 뜻 |
|---|---|
| `theme.accent` | `green`(기본) · `blue` · `violet` · `coral` · `amber` · `mono`. 엔진은 `--c-acc` 한 값만 바꾸고 `--c-acc-1~4`(농도 100 · 65 · 40 · 18%) · `-soft` 를 거기서 만듦. 장마다 `slide.theme.accent` 로 덮어쓸 수 있음(목업 갤러리용) |
| `nav` | `"tabs"`(기본) — 쪽 위 가운데 PART 칸 막대(지금 PART 만 진하게) · `"none"` |

### 장 공통 칸
| 칸 | 뜻 |
|---|---|
| `eyebrow` | 제목 위 작은 머리말(16px 굵게 강조색). 없으면 「PART n › 이름」 |
| `key` | 제목 안 강조 낱말(문자열 또는 두 개 배열). 제목 안에 있어야 함 |
| `keyStyle` | `"color"`(기본) · `"weight"`(가는 제목 + 굵은 낱말, 색 없음) |
| `sub` | 제목 아래 회색 한 줄(기간 · 기준) |
| `align` | `"left"`(기본) · `"center"` — center 는 term · statement · question · headline 만 |
| `band` | `"head"` — 제목 덩어리를 맨 위 옅은 회색 띠(높이 약 22%) 안에 |
| `surface` | `"card"`(기본, 흰 카드) · `"open"`(카드 없이) · `"well"`(흰 판 안 회색 우물) |
| `concl` | 결론 띠 `{"text":"…","tone":"dark|acc","style":"pill|band|top"}`. pill · band 는 마지막 단계, top 은 첫 단계에 나타남 |

글 안 표시 : `==구절==` 형광 칠(강조색 면 + 흰 글, 장당 하나) · `{{낱말}}` 문장 속 알약.

### 짜임 칸
| 짜임 | 칸 | 단계 |
|---|---|---|
| G3 `compare` `style:"rows"` | `heads:[2]` · `rows:[[왼,오],…]`(3~6줄 · 칸 18자) · `notes?`(줄 수 = rows, 점선 뒤 회색 설명) | 머리 → 줄 차례(왼 → 오) |
| G15 `compare` `style:"pair"` | `left`/`right` : `{"head":"…","tag?":"AS-IS","body":"…","wells":["…","…"]}` · `ribbon?`(오른쪽 카드 꼬리표 4자) · `concl` 함께 | 왼 카드 → › → 오른 카드 → 결론 |
| G4 `diagram` `style:"card"` | `items[].tags:["#…"]` | 카드 차례 |
| G5 `diagram` flow `style:"pill"` | `items[].note` · `now` | 칸 차례 → 지금 칸 칠 |
| G6 `diagram` `layout:"modules"` | items 3~4 · `cols` | 차례 |
| G7 `diagram` timeline `style:"chevron"` | `now` | 차례 |
| G16 `diagram` `layout:"wells"` | `items:[{"head":"…","parts":["…","…"]}]` 3~4칸, 마지막 칸 = 결과(강조색 면) | 칸 차례 → 결과 칠 |
| G17 `diagram` `layout:"tiers"` | `items:[{"head":"…","body":"…"}]` 3~5 (위가 가장 진함) · `shape:"pyramid|stairs"` | 아래 → 위 차례, 이름표 함께 |
| G13 `diagram` `layout:"circles"` | `items:[{"head":"…","value":3406.6,"unit":"억 달러"}]` 2~4 · `nest:true`(포함 관계로 겹침) · `hero` | 원 차례(크기는 값의 제곱근에 비례) |
| G10 `chart` `type:"combo"` | `bars:[[이름,값],…]`(회색 수준) · `line:[[이름,값],…]`(강조색 증가율, 칩 값) · `units:["억 달러","%"]` · `cards?:[{label,value,unit}]`(왼쪽 요약 1~2) · `summary?:[["2021~2026","연평균 +4.2%"]]`(점선 요약 줄) | 축 → 막대 → 선 그리기 → 칩 → (카드) |
| G11 `chart` `type:"minis"` | `minis:[{"label":"…","value":…,"unit":"…","kind":"bar|line|donut","data":[[이름,값],…]}]` 3개 | 열 차례 |
| G12 `chart` `type:"donut"` | `rings:[{"label":"한국","value":52.0}]` 1~4 · `head?` · `half:true`(반원) | 링 차례 → 숫자 |
| G14 `table` | (1판) + `rowHi`(주인공 행 번호) · `marks:{"행,열":"o|x"}` · `head:"row|col"` · `delta:true`(▲▼ 색) | 줄 차례 → 주인공 행 칠 |
| 정의 판 `term` `style:"plate"` | (term 칸 그대로) | 판 → 낱말 → 정의 |

### 그리기 규칙(엔진)
- 본문 장 바탕 `--c-bg`(#F4F5F7), 면은 `surface` 에 따름. 본문 장 진한 바탕 없음.
- 차트 막대 기본 회색(`--c-data`), 주인공 · 최신만 `--c-acc`. 세로축 선 없음, 가로 눈금 아주 옅게.
- 주인공 큰 숫자(64px 이상)만 단위 50%, 그 밖은 같은 크기.
- `?check` 결과에 `accentCount`(강조색 칠한 보이는 요소 수) · `accentRoles`(그 요소들의 역할 수 — 같은 부품 종류는 하나로 셈) 더함. 기준 : 역할 3 이하 · 요소 8 이하.

## 5. 엔진이 받아 주는 칸(구현 메모)
- `rank` · `morph` : `series` 대신 `data:[[이름,값],…]` 도 됨. `morph` · `wipe` · `split` · `bridge` · `slope` 는 `decimals`(소수 자리) 선택.
- `wipe` : `a` · `b` 는 숫자 목록 또는 `[이름,값]` 목록, `labels` 가 칸 이름, `names:["2025년","2026년"]` 가 범례.
- `race` : `ref:{value,name}` · `mark:{text?}`(넘어선 달은 엔진이 찾음, `text` 생략 가능).
- `split` : `hero`(번호) 생략 시 값이 가장 큰 몫. `drivers` : `footnotes:["¹ …"]` 로 각주 글.
- `table` : `chips` 값이 `true` 면 칸 글을 그대로 칩으로, 글이면 그 글로 바꿔 칩으로.
- 점검 결과 : `outside` 는 1판의 `overflow` 와 같은 값(1판 도구 호환으로 두 이름 모두 냄).
