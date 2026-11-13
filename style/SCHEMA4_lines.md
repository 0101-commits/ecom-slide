# 선 부품 3종(`style/parts/l_*.js`) 칸 정리 — 엔진 3판 v4-parts · 묶음 lines

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채우고 오른쪽 시사점 칸은 없음. 숫자는 덱이 준 값만 쓴다(부품은 계산해 넣지 않음, `curve.change.values` 만 비우면 칸 안 두 곡선 차이를 계산).
시험 덱 : `style/demo4_lines.json`(종류마다 쓰임 2~3장, 7장).

| 종류 | 쓰는 때 | 바뀜(`beats`) |
|---|---|---|
| `events` 사건 주석 선 | 한 계열 위에 번호 붙은 사건 3~8개를 얹어 읽을 때(환율 + 사건) · 국면 띠 + 아래 작은 보조 선까지 겹쳐 볼 때(통항 + 수위) | 없음 |
| `overlay` 사건 기준 겹친 선 | 같은 사건(첫 인하 · 급등 시작) 날을 0 에 맞춰 여러 해를 겹침, 묶음별 색 · 지금 선 강조 · 오른쪽 묶음 평균 / 두 시대를 같은 축에 비교 | 없음 |
| `curve` 수익률 곡선 | 만기별 금리 곡선을 시점끼리(전 · 지금, 세 시점) 또는 나라끼리 비교, 오른쪽에 만기별 차이 막대 | 없음 |

## events — 사건 주석 선
- `labels`(x 라벨, 「25.11」 · 「2026.01」 꼴이면 약식으로 줄임) · `series[{name,data,color,dash}]` 1~2줄 · `unit` · `dec` · `y{min,max,step,dec,unit}` · `area`(기본 줄 1개면 면 채움)
- `events[{at(칸 번호),text}]` 3~8개 · `evPos` `'top'`(기본 — 선 위에 번호 동그라미, 꼬리표가 위 · 아래 · 위쪽 한 줄 더로 엇갈려 겹치지 않음) | `'bottom'`(선 아래 번호 띠, 넘치면 최대 3줄)
- `bands[{from,to,name,tone:'main'|'warn'|'soft'}]` 국면 띠(이름은 띠 위쪽, warn 은 나쁜 뜻에만)
- `marks[{at,s,text,tone:'main'|'warn',pos:'above'|'below'}]` 강조 점 + 큰 글자 · `callout{text,at,s}` 끝 값 상자
- `lower{name,unit,data,dec,y{min,max}}` 아래 작은 보조 선(같은 x 축, 눈금은 위아래 두 개)
- 움직임 : 축 · 띠 → 면 → 선 그리기 → 사건이 하나씩(번호 → 꼬리표 → 점) → 강조 점 → 끝 값 상자

## overlay — 사건 기준 겹친 선
- `x{from,to,tick,unit}`(기본 -6 ~ 12 · 3칸마다 · `개월`, 칸 번호 = `from` 부터 한 칸씩) · `base`(굵은 가로 기준선, 예 100) · `y{min,max,step,dec,unit}` · `ref{label}`(0 세로선 + 위 칩)
- `groups[{label,tone:'good'|'bad'|'mid'}]` · `lines[{name,data(null 가능),group}]`(해 · 시대마다 한 줄, 끝에 이름 표 — 겹치면 아래로 밀림)
- `now{name,data,chip}` 지금 선(굵게 + 끝 점 + 칩, 데이터가 짧아도 됨)
- `summary{title,items[{value,label,tone:'good'|'bad'|'main'}] 2~3개,list{title,items[글] 최대 4}}` 오른쪽 좁은 요약(없으면 선 칸이 넓어짐)
- 움직임 : 축 · 0 선 → 지난 선이 차례로 그려짐 → 끝 이름 → 지금 선 → 칩 → 요약

## curve — 수익률 곡선
- `mats[{label,years}]`(또는 글자 배열 + `years[]`) x 는 만기 로그 간격, 라벨이 붙으면 줄여서 표시 · `unit` · `y{min,max,step,dec,unit}`
- `curves[{name,data,color,dash,tag{at,text,dx,dy,anchor}}]` 2~3개 — 마지막이 「지금」(굵은 초록), 앞 곡선은 점선 회색(`dash:false` · `color` 로 바꿈)
- `arrows{min,from,to}` 값 차이가 `min` 이상인 만기에 화살표(기본 눈금 간격의 0.3배, 곡선 사이 간격이 22px 미만이면 생략) · `arrows:false` 로 끔
- `change{title,unit,dec,values[],from,to,max,neg,pos}` 오른쪽 만기별 변화 막대(음수 `neg` 기본 초록, 양수 `pos` 기본 warn) · `change:false` 로 끄면 곡선이 넓어짐
- 움직임 : 축 → 앞 곡선 → 지금 곡선 그리기 → 화살표 → 이름표 → 변화 막대(하나씩 자람)
