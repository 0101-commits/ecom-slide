# 차트 부품 14종 (`style/parts/j_*.js` · `"schema": 3`)

엔진 3판 공통 칸(`eyebrow` · `head` · `foot` · `transition` · `chart` · `note` · `links` · `appendix`)은 `SCHEMA3.md` 2절 그대로. 아래는 화면 종류(`kind`)마다 더하는 칸.
시험 덱 : `style/demo3_charts.json`(`tools/make_demo3_charts.py` 가 `data/snap/*.json` 숫자만으로 만듦, 종류마다 2장 · 28장).

## 0. 공통 약속
- **숫자 칸** : 값 목록 `[132.6, 231.9]` 또는 `[["2026.01", 132.6], …]`(2판 모양) 둘 다 받음. `[이름,값]` 이면 이름이 x 라벨이 됨.
- **소수 · 단위** : `dec`(2판 `decimals` 도 받음) · `unit`(값 단위, 예 `"억 달러"` `"%"` `"원"` `"만 명"`). 차이 단위 `dunit` 은 없으면 `unit`, 단 `"%"` 면 `"%p"`. 숫자 라벨은 모두 단위를 붙여 그림.
- **색** : `ECOM.C` 만. 올해 · 최신 · 주인공 = `main`(짙으면 `dark`), 지난해 · 비교 = `cmp`, 과거 · 보통 막대 = `gray` · `light`, 둘째 강조 = `g65` · `g40`. `warn` 은 heatmap 의 뚜렷이 나쁜 칸에만.
- **바뀜 단계** : `zoom` · `rank` · `morph` · `split` 은 `beats:[{}]` 를 주면 「바뀌는 순간」(좁히기 · 자리 옮기기 · 모으기 · 가르기)을 → 한 번 누를 때로 미룸. 없으면 쌓기 안에서 저절로 일어남. `?check` 는 바뀜 0 상태를 잼.
- **움직임 줄이기 · `?still` · `?check`** : 모든 종류가 바로 끝 상태(바뀜 단계 종류는 현재 단계 상태).
- 부품 안 직접 움직임은 `root._prep`(쌓기 전 처음 모습) · `root._hook`(끝 ms 반환) · `root._reset`(끝 모습) · `root._beat(k)` 를 씀.

## 1. 종류별 칸 · 움직임 · 2판 → 3판

### `race` 누적 두 선 경주
| 칸 | 뜻 |
|---|---|
| `series` | `[{name,data,color}]` 2개. 첫째 = 지난해(`cmp`), 둘째 = 올해(`main`). data 는 달 값(엔진이 1월부터 누적) |
| `cum` | 기본 `true`. `false` 면 data 를 이미 누적한 값으로 봄 |
| `labels` | x 라벨, 없으면 `1월`~ |
| `ref` | `{value,name,at}` 기준선. `value:"auto"` = 첫 계열 마지막 누적값(예 「2025년 연간」) |
| `mark` | `{text,sub}` 둘째 계열이 기준선을 처음 넘는 달(엔진이 찾음) 표시 · `false` 면 없음 |
| `gap` | `{at,text,sub}` 같은 달 두 선 차이 화살(기본 둘째 계열 마지막 달) · `false` 면 없음 |
| `area` · `ms` | 둘째 계열 아래 옅은 면(기본 켬) · 경주 시간(기본 2600ms) |

움직임 : 축 · 기준선 → 두 선이 왼쪽부터 함께 그려지고 끝 이름표가 머리를 따라가며 값을 셈 → 머리가 그 달에 닿을 때 추월 점 → 차이 화살.
2판 : `chart.series` · `chart.ref{name,value}` · `chart.mark{text}` 그대로, `chart.unit` · `decimals` → `unit` · `dec`.

### `zoom` 전체 → 최근 구간 확대
| 칸 | 뜻 |
|---|---|
| `labels` · `data` | 전체 기간(또는 `series[0].data`) · `name` 범례 이름 |
| `type` | `"line"`(기본) · `"bar"` |
| `zoom` | `{from,to}` 이름 또는 번호(기본 마지막 12칸) |
| `marks` | `"auto"`(구간 최고 · 최저 · 마지막) 또는 `[{at,text,pos}]` |
| `full` | 좁히기 전 전체 최고 · 최저 표시(기본 켬, `false` 면 없음) |
| `avg` · `avgText` | 구간 평균선 · 글(`"최근 12개월 평균 {v}"`) |
| `frameText` · `beats` | 틀 이름표 · 바뀜 단계(위 0절) |

움직임 : 축 → 전체 선(막대)이 왼쪽부터 → 최근 구간 틀 → 가로만 좁혀 그 구간이 화면을 채움(세로 눈금 고정) → 구간 값 · 평균선 · 작은 전체 그림(빈 모서리에 저절로).
2판 : `chart.series[0].data` → `data`, `chart.zoom` 그대로.

### `wipe` 같은 칸 두 계열(쓸어 보기)
| 칸 | 뜻 |
|---|---|
| `labels` · `a` · `b` | `a{name,data,color}`(지난해, 기본 `gray`) · `b{…}`(올해, 기본 `main`). 2판 `names` 도 받음 |
| `diff` · `dunit` · `diffTitle` | 아래 줄 b − a(기본 켬, 칸이 넉넉하면 값마다 단위) |
| `marks` | `"auto"` = b 최고 · 마지막 |
| `box` | `{title,items}` 차트 안 시사점 상자(막대가 낮은 쪽 위에 저절로) |

움직임 : 축 → a 막대 → 세로 선(b 이름 칩)이 지나가며 칸마다 b 막대가 솟고 차이 값이 나타남 → b 값 → 상자.
2판 : `chart.labels` · `a` · `b` · `names` 그대로.

### `slope` 두 시점 기울기 + 변화 폭 순위
| 칸 | 뜻 |
|---|---|
| `pairs` | `[{label,a,b,color}]` |
| `heads` | `[왼쪽 이름, 오른쪽 이름]` |
| `delta` | `"diff"`(기본, `+1.22%p`) · `"ratio"`(`4.7배`) · `"none"` |
| `hi` | 강조할 번호 · 이름(나머지 회색). 없으면 오름 `main` · 내림 `cmp` |
| `side` · `sideTitle` | 오른쪽 변화 폭 순위 막대(기본 켬) |

움직임 : 머리 · 세로 기준선 → 왼쪽 점 · 이름 → 선이 뻗음 → 오른쪽 점 · 값 · 변화 → 순위 막대. 겹치는 이름은 위아래로 펼치고 짧은 이음선.
2판 : `chart.pairs` · `heads` 그대로.

### `rank` 순위 막대(자리 옮기기)
| 칸 | 뜻 |
|---|---|
| `data` | `[[이름,값]]`(음수는 0선 왼쪽) |
| `top` | 강조 개수(기본 3, 1위 `dark`, 2~3위 `main`) |
| `order` | `"desc"`(기본) · `"asc"` |
| `avg` · `avgText` | 평균 세로선(기본 켬) |
| `colTitle` · `beats` | 왼쪽 위 「순위」 글 · 바뀜 단계 |

움직임 : 원래 차례(달 순서)로 막대 → 큰 순서로 자리를 옮김 → 1~3위 초록 · 순위 번호 · 평균선.
2판 : `chart.data` 그대로. `aside` 는 버림(헤드메시지로).

### `morph` 달 → 묶음(분기 · 연) 쌓기
| 칸 | 뜻 |
|---|---|
| `labels` · `data` | `YYYY.MM` 이름과 달 값 |
| `group` | 묶음 크기(기본 3 = 분기, 12 = 연) |
| `glabels` | `[[윗줄, 아랫줄]]` 묶음 이름(없으면 `1분기` / `2026년` 자동) |
| `growth` · `gname` | 앞 묶음 대비 증감률(기본 켬) · `"전분기"` |
| `beats` | 바뀜 단계 |

움직임 : 달 막대 → 묶음 색(마지막 묶음 `main`, 앞 묶음 `g40`, 나머지 `gray`) → 옆으로 모임 → 위로 쌓여 묶음 합 막대 → 합 · 증감률 · (자리가 넉넉하면) 조각 옆 달 값.
2판 : `chart.data` · `group` 그대로.

### `split` 합계 → 항목 가르기
| 칸 | 뜻 |
|---|---|
| `total` | `{label,value,sub}` |
| `parts` | `[{label,value,sub}]`(합 = total, 음수 가능) |
| `hero` · `share` | 주인공 번호(기본 절댓값 최대) · 합계 대비 비중(기본 켬) |
| `beats` | 바뀜 단계 |

움직임 : 합계 막대(`dark`) → 그 자리에 항목 조각이 쌓여 보임 → 조각마다 제자리로 흩어짐(음수는 0선 아래) → 값 · 비중. 「합계 = 항목 + 항목 …」 기호와 항목 이름은 가르기 전부터 보임.
2판 : `chart.total` · `parts` · `hero` 그대로.

### `bridge` 증감 다리
| 칸 | 뜻 |
|---|---|
| `start` · `steps` · `end` | `{label,value,sub}` · `[{label,value,sub}]` · `{…}` |
| `unit` · `dunit` | 수준 단위(%) · 몫 단위(%p) |
| `hero` · `share` | 주인공 몫 · 「전체 증감의 96.7%」 |
| `total` · `totalText` · `totalSub` | 오른쪽 전체 증감 화살(기본 켬, 배수 자동) |

움직임 : 출발 막대(`cmp`) → 몫이 하나씩(점선 연결, 늘면 `g65` · 줄면 `gray`, 주인공 `main`) → 도착 막대(`dark`) → 전체 증감 화살.
2판 : `chart.start` · `steps` · `end` 그대로.

### `waffle` 칸 채우기
| 칸 | 뜻 |
|---|---|
| `grids` | `[{label,sub,value,n,cols,fill,na,rowLabels,colLabels,rowUnit,big,color,maxCell(기본 76px)}]` — `value` 칸 수(마지막 칸 부분), 또는 `fill:[칸 번호]`(달력 칸) · `na` 자료 없는 칸(점선) |
| `unit` · `dec` | 큰 숫자 단위(기본 `%`) |
| `legend` | `[{text,color,type:'na'}]` |
| `side` | `{type:'line'|'bars',title,labels,data|series,unit,dec}` 오른쪽 작은 분석 차트 |

움직임 : 빈 칸 판 → 칸이 차례로 채워짐 · 큰 숫자 굴림 → 줄 합계 → 작은 차트.
2판 : `chart.value` · `label` · `rest` 를 그대로 받으면 판 하나. `breakdown` 은 버리고 `side` · 두 번째 판으로.

### `donut` 비중 고리
| 칸 | 뜻 |
|---|---|
| `rings` | `[{label,value(0~100),sub,sub2,color,strip}]` 1~4개 |
| `half` · `hero` | 반원 · 주인공(기본 0) |
| `ringTitle` | 고리 위 제목(2판 `chart.head` — 3판 `head` 는 헤드메시지라 이름을 바꿈) |
| `strip` · `stripLabels` | 고리 아래 달 띠(달마다 1 = 해당 · 0 = 아님 · null = 자료 없음) · 양 끝 이름 |
| `side` | 오른쪽 작은 막대(연도별 수 등) |

움직임 : 이름 · 트랙 → 호가 그려지며 숫자 굴림 → 글 → 달 띠 → 작은 차트. 고리 묶음은 세로 가운데.
2판 : `chart.rings` · `half` 그대로, `chart.head` → `ringTitle`.

### `minis` 작은 차트 여러 개
`minis:[{label,sub,value,dec,unit,kind:'bar'|'line',data,chip:{text,dir},ref:{v,label}}]` 2~4열. 열마다 이름 · 큰 값 · 칩 + 카드 안 차트(최고 · 최저 · 마지막 값, 막대 위 글은 걸치는 막대 위로 올리고 이음선).
움직임 : 열 차례(머리 → 축 → 막대 · 선 → 값).
2판 : `chart.minis` 그대로(`decimals` → `dec`). `kind:'donut'` 은 3판에서 `donut` 종류로.

### `heatmap` 색 칸 표 (새 종류)
| 칸 | 뜻 |
|---|---|
| `cols` · `rows` | 지표 × 달 : `rows:[{name,sub,dec,suf,data,dir:'up'|'down',bad:{ge|gt|le|lt}}]`, 줄마다 따로 색 범위 |
| `grid` | 연 × 달 : `{rows:['2021',…],cols:['1월',…],data:[[…]],dec,suf,bad}`, 한 색 범위 |
| `scale` | `"row"` · `"all"`(기본 : rows 는 row, grid 는 all) |
| `summary` | `{title,kind:'avg'|'last'|'max'}` 오른쪽 요약 열 |
| `hiCol` · `badText` · `legend` | 테두리 강조 열(기본 마지막, -1 이면 없음) · 주황 칸 뜻 · 범례(기본 켬) |

색 : 높을수록 짙은 초록(`dir:'down'` 이면 반대), `bad` 조건을 넘은 칸만 주황 테두리 · 옅은 주황 바탕. 칸 안 값 글자(짙은 칸은 흰 글).
움직임 : 줄 이름 · 칸 이름 → 칸이 줄마다 왼쪽부터 채워짐 → 요약 열 → 강조 열 테두리.

### `drivers` 변화 요인
| 칸 | 뜻 |
|---|---|
| `items` | `[{sign,text,sub,value,unit,dec,note}]` — `value` 없으면 2판 `num` 글을 그대로 씀 |
| `total` | `{label,value,sub}` 맨 아래 합계 줄 |
| `hero` · `colTitles` | 주인공(기본 절댓값 최대) · 위 열 이름 |

모양 : 줄마다 부호 표(+ / −) · 요인 이름 · 설명 · 가운데 0선에서 갈라지는 막대 · 값. 움직임 : 줄 차례(막대는 0선에서 뻗음) → 합계 줄.
2판 : 장 칸 `items[{sign,text,num,note}]` 그대로, `footnotes` → `foot.notes`.

### `combo` 막대 + 선(두 축)
| 칸 | 뜻 |
|---|---|
| `labels` · `bars` · `line` | `bars{name,data,unit,dec}`(왼쪽 축, 아래 띠) · `line{…}`(오른쪽 축, 위 띠) |
| `units` | 2판 `[막대 단위, 선 단위]` + `bars:[[이름,값]]` · `line:[[이름,값]]` 도 받음 |
| `y` · `y2` · `band` | 막대 축 · 선 축 범위 · 선 띠 비율(기본 .36) |
| `marks` · `summary` | 선 칩(최고 · 최저 · 마지막) · 아래 요약 줄 `[[이름, 글]]` |

움직임 : 축 → 막대 → 선 그리기 → 점 → 값 칩 · 막대 값 → 요약 줄.
2판 : `chart.bars` · `line` · `units` · `summary` 그대로. `cards`(왼쪽 요약 카드)는 버림 — 헤드메시지나 `kpi` 종류로.

## 2. 2판 목업 → 3판 옮기기(모든 종류 공통)
자동 변환기 : `tools/mock3_charts.py` 의 `CONV`(13묶음, `tools/make_mockups3.py` 가 불러 씀). 판 2 숫자만 쓰고 헤드메시지는 그 숫자로 새로 씀.
- `kind:"chart"` + `chart.type:X` → `kind:X`, `chart.*` 칸을 장 칸으로 올림(`drivers` 는 원래 장 칸).
- `title` · `read.head` → `head`(보고서체 50~90자로 다시 씀), `read.points` · `aside` · `concl` → 헤드메시지나 `wipe.box` 같은 차트 안 상자.
- `source` → `foot.source`, `sub`(데이터월) → `foot.asof` 또는 `eyebrow.basis`, `eyebrow`(「PART n › …」) → `{group,topic,basis}`.
- `theme` · `key` · `keyStyle` 은 버림(3판은 초록 하나, 강조는 `**굵게**`).
