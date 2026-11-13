# 타임라인 부품 11종(`style/parts/n_tl.js`, 머리글자 tl) 칸 정리 — 엔진 3판 v4-parts · 계열 F08

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `note`)은 `SCHEMA3.md` 2절 그대로. 모두 SVG 한 장(1168×512)이고 쌓기는 시간표(`data-at`)로 3초 안에 끝남. 연도 칸은 소수 연도(2022.5 = 2022년 중순). 시험 덱 `style/demo4_r1_F08.json`(12장, 만드는 도구 `tools/make_mockups4_F08.py`).

| 종류 | 쓰는 때 | 
|---|---|
| `tlvert` 세로 연표 | 긴 역사를 왼쪽 연도 + 가운데 줄 + 오른쪽 값 막대로 읽을 때 |
| `tlpar` 평행 타임라인 | 두 나라(기관) 줄을 같은 시간축 위아래로 나란히 + 두 줄 사이 시차 막대 |
| `tlgantt` 간트 | 국면 · 정책 · 공사 단계의 기간 막대(개월 수와 값 글) + 오늘 선 |
| `tlcount` 카운트다운 칸 | 다음 발표 · 마감까지 남은 날 큰 숫자 카드 + 오늘부터 날짜 축 |
| `tleras` 시대 구분 띠 | 긴 선 위에 시대 띠(이름 · 기간) + 시대별 대표 숫자 두 개 카드 |
| `tlterm` 임기 막대 | 위 가격 선 + 아래 인물별 임기 막대(결정 한 줄 + 임기 중 범위) |
| `tlzoom` 펼친 구간 | 전체 줄 + 한 구간 강조 + 깔때기로 아래에 확대(결정마다 변화폭) |
| `tlclock` 24시간 시계 | 나라별 발표 시각을 시계 둘레에 번호로 + 오른쪽 시각표 |
| `tlmile` 단계 이정표 | 1 · 2 · 3단계 길(연도 · 이름 · 설명) + 아래 단계별 값 막대(음수 가능) |
| `tlbill` 법안 진행 단계 | 쐐기 화살표 6칸(발의 → 표결 → 서명 → 시행) + 지금 위치 표지 + 아래 숫자 · 선 |
| `tlcards` 사건 카드 연속 | 날짜 칩이 달린 사건 카드 4~6장이 화살표로 이어지고 아래 선 위 점으로 연결 |

## tlvert
`rows[{year,title,sub,value,now}]` 6~9개 · `unit` · `dec` · `vmax`(막대 최대) · `barTitle`

## tlpar
`from` · `to`(소수 연도) · `ticks[연도]` · `y{max,ticks}` · `unit` · `lanes[2]{name,sub,color,data[월별 값],marks[{i(월 번호),v,text,pos:'above|below',dx}]}` · `gap{a:[줄,마크],b:[줄,마크],text}`(두 마크 사이 시차 막대)

## tlgantt
`from` · `to` · `step`(눈금 간격) · `rows[{name,sub,from,to,label,tone:'main|cmp|gray|warn',now}]` · `nowAt{t,label}`(점선 · 알약) — 막대 안에 글이 안 들어가면 오른쪽, 오른쪽도 모자라면 왼쪽에 글이 나감

## tlcount
`today{label}` · `span`(축 일수) · `ticks[{d,label}]` · `cards[3~5]{label,date,d(오늘로부터 일수),sub,value,hero}` — 카드는 왼쪽부터 놓이고 점은 날짜 위치로 이어짐, `hero` 하나만 짙은 초록 카드

## tleras
`from` · `to` · `data[월별 값, null 가능]` · `y{min,max,ticks}` · `unit` · `eras[5~6]{name,from,to,range,nums:[{v,label}] 두 개}` — 마지막 시대가 「지금」 강조

## tlterm
`from` · `to` · `data[월별]` · `y{min,max,ticks}` · `unit` · `chartTitle` · `chairs[3~5]{name,from,to,span,range,decision,tone}` — 시작 연도가 축보다 앞이면 축 시작에서 자름, 결정 글은 막대가 왼쪽이면 오른쪽에, 오른쪽이면 왼쪽에 놓임

## tlzoom
`y{max}` · `unit` · `fullTitle` · `full{from,to,pts[[t,v]],ticks[연도]}` · `win{from,to,title}` · `zoomTitle` · `zoomNote` · `zoom{pts[[t,v]],ticks[{t,label}],changes[{t,v,text,up}]}` — 값은 계단 선

## tlclock
`center{label,sub}` · `work{from,to,label}`(낮 시간대 부채꼴, 시 단위) · `items[5~8]{t:'HH:MM',next(다음 날),name,sub,tag,tone}` — 가까운 시각은 안쪽 고리로 비켜 놓음, 오른쪽 표는 시각 순

## tlmile
`stages[4~5]{no,name,years,sub,value(숫자, 음수 가능),label,tone}` · `valueTitle` · `dec` · `unit`

## tlbill
`stages[5~6]{name,date,vote,now}` · `pin`(지금 위치 글) · `note` · `stats[2~3]{v,label}` · `chart{from,to,pts[[t,v]],y{min,max,ticks},title,mark{t,label}}`

## tlcards
`cards[4~6]{date,title,text,stat{label,value}}` · `chart{from,to(일 번호),pts[[d,v]],y{min,max,ticks},title,ticks[{d,label}],marks[{d,v}] — 카드와 같은 개수}`
