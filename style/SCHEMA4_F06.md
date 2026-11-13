# 돈 · 물자 흐름 · 가치사슬 부품(`style/parts/n_mf1.js` · `n_mf2.js`) 칸 정리 — F06 + F12 2차

공통 칸은 `SCHEMA3.md` 2절 그대로. 공통 도움 `ECOM.mf`(글 · 맞춤 · 둥근 상자, `n_mf1.js` 안), 화살 · 이름표 · 상자는 `ECOM.cz`(`n_cz_.js`)를 씀. 시험 덱 : `style/demo4_r2_F06.json`(만들기 `tools/make_mockups4_F06.py`).
실제 값 장 : N066 · N067(연준 대차대조표) · 나머지는 예시 값(익명 나라 · 기업).

| 종류 | 쓰는 때 | 목업 |
|---|---|---|
| `mfbook` 장부 T 계정 | 두 시점의 자산 · 부채 칸을 같은 눈금으로 나란히 + 변화 목록 | N066 |
| `mftank` 탱크 | 같은 눈금 탱크 둘~셋의 수위 + 고점 · 1년 전 표시 | N067 |
| `mfring` 둘레 방사 | 한 곳에서 여러 곳으로 퍼지는 돈(굵기 · 원 크기 = 금액) | N068 |
| `mfshift` 이동 전후 | 두 곳의 전후 막대 + 가운데 굵은 화살표 | N069 |
| `mfexch` 돈 · 물건 고리 | 주체 넷의 사각 고리, 돈 초록 · 물건 회색 | N070 |
| `mfroute` 우회 경로 | 세 곳 카드 + 경유 화살표 + 막힌 직항 곡선 + 비교 막대 | N071 |
| `mffunnel` 깔때기 | 단계 폭 = 건수, 오른쪽에 첫 단계 대비 · 직전 대비 몫 | N072 |
| `mfchord` 코드 다이어그램 | 원 둘레 호 + 안쪽 띠 + 오른쪽 상위 쌍 막대 | N073 |
| `mflev` 레버리지 블록 | 열마다 같은 자산 칸을 자기 돈 · 빌린 돈으로, 사라지는 칸 점선 | N074 |
| `mfvalue` 폭이 값인 사슬 | 단계 폭 = 부가가치 몫, 칸 안 = 나라 몫(100% 쌓기) | N131 |
| `mfneck` 병목 관 | 관 두께 = 대체 여력, 한 단계만 붉게 | N132 |
| `mfdep` 의존 도넛 | 단계마다 특정국 의존 % 도넛 + 대체 공급처 | N133 |
| `mfzig` 국경 왕복 | 나라 칸 위를 오가는 경로 + 국경 누적 횟수 | N134 |
| `mfbom` 원료 → 제품 갈래 | 층별 상자 + 곡선(굵은 짙은 선 = 핵심 길) | N135 |
| `mfsmap` 공급망 지도 | 익명 나라 덩어리 위 번호 순서 경로 | N136 |
| `mfvert` 직접 · 외주 칸 | 단계 칸마다 기업이 직접 · 외주 칠하기 | N137 |
| `mfdays` 기간 표 + 막대 | 재고 기간 · 걸리는 기간 막대 + 누적 일수 | N138 |

## mfbook
`books[2]{title,date,total(글),assets:[{name,value,label,tone}],liabs:[{name,value,label,tone}]}`(아래에서 위로 쌓음, 값은 같은 눈금이라 숫자) · `deltas[{name,d,sub,tone('g'=늘어남)}]`(가운데 목록) · `deltaTitle`

## mftank
`tanks[2~3]{name,sub,value,vlabel,delta,peak,peakLabel,peakDate,prev,prevLabel,tone}` · `max`(눈금 위끝) · `step`(눈금 간격) · `unit`(눈금 글자 뒤, 예 '조'). 점선 = 고점, 초록 선 = 1년 전

## mfring
`hub{name,value,sub}` · `nodes[3~7]{name,value(숫자),label,share}` · `unit`(왼쪽 아래 설명 글)

## mfshift
`from{name,before,after,bl,al,tone}` · `to{…}`(막대 값 · 라벨) · `amount{value,sub}` · `beforeLabel` · `afterLabel`

## mfexch
`actors[4]{id,name,sub,at:'tl|tr|br|bl'}` · `flows[{from,to,kind:'money|goods',text,num}]` · `center{title,lines[]}` · `legend{money,goods}`

## mfroute
`lands[3]{name,role,sub}` · `legs[2]{text,sub}` · `direct{text,sub}` · `cmp{title,unit,rows:[{name,value,tone}]}`

## mffunnel
`stages[2~5]{name,value,label,dropLabel(이 단계에서 다음 단계로 가며 빠진 양)}` · `dropWord`('탈락')

## mfchord
`regions[n]{name}` · `pairs[{a,b,v}]`(지역 번호, 양방향 합계) · `hi`(강조 지역 번호) · `unit` · `rankTitle` · `topN`

## mflev
`cols[2~4]{name,own,borrow,lossLabel,lossBad,sub}` · `loss`(사라지는 칸 수) · `dropText`(왼쪽 아래 설명)

## mfvalue
`stages[3~5]{name,sub,va,shares:[{name,value}]}`(shares 합 100) · `colors{이름:색 이름}` · `unit` · `vaTitle`

## mfneck
`stages[3~6]{name,sub,share,neck}` · `neckChip` · `shareLabel`

## mfdep
`stages[3~5]{name,sub,pct,value,alts}` · `who` · `line`(기본 50, 이상은 주황)

## mfzig
`lanes[2~3]{name,sub}` · `steps[3~7]{lane,text,sub}` · `crossWord`

## mfbom
`tiers[3~5]{name,items:[{id,name,tag,crit}]}` · `edges[[from,to]]` · `hi[[from,to]]`

## mfsmap
`lands[2~4]{name,slot(0~3)}` · `hiLand` · `steps[3~7]{land(번호),text,sub}`

## mfvert
`stages[3~6]{name}` · `firms[2~3]{name,sub,cells:[{k:'own|out',t}]}` · `ownLabel` · `outLabel`

## mfdays
`stages[3~6]{name,sub,stock,days}` · `unit` · `totalLabel`
