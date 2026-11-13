# F11 기업 · 산업 비교 새 부품(`style/parts/n_co*.js`, 머리글자 co) 칸 정리 — 2차

공통 칸은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채움. 기업 숫자는 모두 예시 값(익명 A사 · B사), 시험 덱 `style/demo4_r2_F11.json`(12장, 만들기 `tools/make_mockups4_F11.py`).

| 종류 | 쓰는 때 | 모양 |
|---|---|---|
| `cocards` 기업 카드(스펙 시트) | 2~4곳을 같은 항목으로 맞댐 | 카드마다 큰 숫자 + 같은 눈금 막대 + 항목별 순위 + 아래 칩 |
| `codonuts` 점유율 도넛 여럿 | 시장마다 업체 점유율 | 도넛 2~4개 + 같은 회사 색 표 범례 + 순위 한 줄 |
| `copos` 포지셔닝 시장 지도 | 성장률 × 이익률, 원 넓이 = 시가총액 | 기준선 4구역 이름표 + 원 |
| `cotbl` 실적 표 + 작은 선 열 | 기업 행 × 숫자 열 + 분기 추이 | 증감 칩 + 행끼리 같은 눈금 작은 선 |
| `cochain` 가치사슬 위 기업 | 단계마다 강자 | 쐐기 화살표 + 1위 카드 + 2~3위 막대, 우리 회사 1위 단계는 짙게 |
| `coscore` 점수표 | 항목 × 기업 ○ ◐ ● | 공 + 합계 막대 + 최고 칩 |
| `cobacklog` 수주 잔고 | 기업별 해마다 막대 | 칸마다 막대 5~6개(같은 눈금) + 칩 둘 |
| `coval` 밸류에이션 산점 | PER × 이익 성장률 | PEG 1 대각선 + 아래 면 옅게 |
| `cotimeline` 연표 + 주가 | 사건 깃발 + 주가 선 둘 | 깃발에서 점선이 주가 선 시점으로 |
| `cotreemap` 사업부 트리맵 | 매출 비중 + 이익률 색 | 넓이 = 비중, 짙기 = 이익률, 적자 = 붉은 바탕 |
| `cocust` 고객 의존 파이 | 상위 고객 몫 | 큰 조각이 떨어진 파이 + 고객 카드 + 위험 띠 |
| `comirror` 맞대결 거울 막대 | 두 기업 항목별 | 항목마다 자기 단위 · 눈금, 우위 칩, 승패 집계 |

## 칸
- `cocards` : `cards[{name,tag,rows[{label,value,unit,dec}],chips[{label,value,unit,dec,sign,tone('warn')}]}]` 2~4 · `hero`
- `codonuts` : `markets[{name,size,parts[{label,value}],note}]` 2~4 · `companies[]`(색 순서) · `hero` · `unit`
- `copos` : `items[{name,x,y,size,hero,left}]` · `x{min,max,step,title,unit}` · `y{…}` · `pivot{x,y}` · `quads[왼위,오른위,왼아래,오른아래]{t,s}` · `sizeLabel`
- `cotbl` : `cols[{t,dec,unit,sign,chip}]` · `rows[{name,sub,hero,v[],trend[]}]` 3~8 · `nameTitle` · `trendTitle` · `trendUnit` · `trendDec` · `trendNote`
- `cochain` : `stages[{name,sub,top[{name,share}]}]` 4~6 · `hero` · `unit` · `band`
- `coscore` : `firms[]` · `hero`(번호) · `rows[{label,sub,lv[0|1|2]}]` 4~8 · `totalTitle`
- `cobacklog` : `panels[{name,hero,vals[],chips[{label,value,tone}]}]` 2~4 · `years[]` · `unit` · `dec` · `latestLabel`
- `coval` : `items[{name,x,y,sub,hero,left}]` · `x{min,max,step,title,unit}`(x.min ≥ y.min, x.max ≥ y.max) · `y{…}` · `lineLabel` · `zones{above,below}`
- `cotimeline` : `labels['YYYY-MM']` · `series[{name,data,color}]` 첫째 = 기업 · `events[{at,text,sub}]` 3~6(간격 150px 이상) · `base` · `unit`
- `cotreemap` : `items[{name,value,margin}]` 4~10 · `unit` · `dec` · `marginTitle` · `hero`
- `cocust` : `customers[{name,share,sub}]` 3~6 · `hero` · `unit` · `risk{text,from}`
- `comirror` : `a{name}` · `b{name}` · `rows[{label,unit,dec,a,b,low}]` 4~8 · `tally`
