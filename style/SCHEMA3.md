# 발표 데이터 형식 3판 (deck.json · `"schema": 3`)

엔진 3판(`style/deck.js` + `style/parts/*.js`)이 읽는 형식. 2판 덱(schema 없음)은 `style/v2/` 엔진으로 그대로 빌드된다.
기준 자료 : 사용자 Kick-off · CW44 발표(Discussion Material) — **꼬리표 → 헤드메시지 2줄 → 꽉 찬 본문(차트 · 도식) → 왼쪽 아래 각주 · 오른쪽 아래 로고**.

## 1. 덱
```json
{"schema": 3,
 "meta": {"session": "CW48", "title": "한·미 금리차", "date": "2026.11.24", "series": "경제지표101", "cover": "A", "combo": "A"},
 "facts": {"키": {"series": "...", "period": "2026.10", "value": 1.0, "unit": "%p", "source": "...", "got": "..."}},
 "slides": [ ... ]}
```
- `meta.cover` 표지 모양 A~E(회차마다 사용자에게 물음) · `meta.combo` 장 넘김 기본 조합 A(본문 → 본문 = M1 밀기) · B(= M7 초록 선 닦기).
- 부록 장은 `"appendix": "A1"` — 본문 뒤로 모이고 쪽 번호 대신 A1. 본문 장 `links:[{"to":"A1","text":"실질금리"}]` → 오른쪽 위 고리, 부록엔 「← 본문으로」가 저절로.

## 2. 장 공통 칸
| 칸 | 뜻 |
|---|---|
| `kind` | 화면 종류(아래 3절) |
| `eyebrow` | 꼬리표 `{"group":"기준금리 차","topic":"최근 6년 한·미 기준금리 추이","basis":"월말, 단위: %"}` — **어깨끈(본문 위 가운데 제목 줄)은 없음**, 무엇을 · 기준 · 단위는 여기에 |
| `head` | 헤드메시지 2줄 50~90자(띄어쓰기 뺀 글자). 사실(숫자) + 의미, 보고서체 「~함 · ~임 · ~됨」. 핵심 구는 `**굵게**`(짙은 초록) |
| `foot` | `{"notes":["…","…"],"source":"한국은행 ECOS(722Y001), …","asof":"2026.11.10"}` → 「주: 1) … 2) …」 + 「출처: … (기준일 기준)」 2줄 안 |
| `transition` | 장 넘김을 직접 정할 때만(`push` `wipe` `sheet` `carry` `fade` `num` `line` `open` `none`). 없으면 엔진이 고름 |
| `chart` | 같은 자료를 이어 보는 장끼리 같은 이름 → M4 같은 차트 이어 넘기기 |
| `beats` | 바뀜 단계(→ · Enter 로 넘김) — 화면 종류마다 뜻이 다름(아래). 장당 2개까지 |
| `note` | 발표자 메모(P 발표자 창) |
| `links` · `appendix` | 위 1절 |

본문 영역 = 가로 1168 × 세로 512(장 위 144px부터). **오른쪽에 시사점 · 요점 칸을 따로 두지 않는다** — 시사점은 차트 안 상자나 헤드메시지로.

## 3. 장 넘김 8종(엔진이 고르는 규칙)
| 이름 | 움직임 | 엔진이 고르는 때 |
|---|---|---|
| `push` M1 | 꼬리표 · 각주 · 로고 제자리, 헤드메시지 · 본문만 밀림 | 같은 묶음(꼬리표 group) 안 본문 → 본문(조합 A) |
| `wipe` M2 | 짙은 초록 면이 덮었다 걷힘 | 표지 · 간지 → 다음, 간지로 들어갈 때 |
| `sheet` M3 | 아래에서 올라옴 / 내려감 | 본문 ↔ 부록 |
| `carry` M4 | 헤드메시지만 밀리고 그림은 그 자리에서 바뀜 | 앞뒤 장 `chart` 이름이 같을 때 |
| `fade` M5 | 투명도 교차 | 뒤로 갈 때 일부 |
| `num` M6 | 앞 장 숫자가 다음 장 같은 숫자 자리로 날아감 | 두 장에 같은 `data-carry` 이름이 있을 때(`carry` 칸) |
| `line` M7 | 가는 초록 세로선이 지나가며 바뀜 | 묶음이 바뀔 때(조합 A) · 같은 묶음 안(조합 B) |
| `open` M8 | 가운데 틈이 양옆으로 열림 | 다음 장이 `quadrant` · `discuss` 일 때 |
움직임 줄이기 설정 · `?still` · `?check` · 뒤 탭이면 넘김 · 쌓기 없이 바로 끝 상태.

## 4. 화면 종류
### 표지 `cover` (`style` A~E)
- 공통 `title`(`**굵게**` 가능) · `sub` · `kicker` · `date` · `session` · `copy`.
- **A 주제 그래픽형** `graphic:{labels, series:[{data,color,step,end}], band:{a,b,from}, big:{value,dec,unit,label,carry}}` — 대표 계열이 그려지고 큰 숫자가 굴러 올라옴.
- **B 초록 타일형**(CW44식) `tiles:["%","₩",...]` · **C 짙은 초록 전면** · **D 큰 숫자형** `big:{value,dec,unit}` · **E 흰 바탕 · 아래 띠**(Kick-off식).
- **A · D · E 뒤 층**(5판) : Kick-off 1쪽 타일 12개가 처음부터 뒤에 투명도 11% · 흐림으로 깔려 앞 그래프보다 느리게 떠다님(움직임 줄이기 · `?still` 이면 멈춤). 끄려면 `backdrop:false`. 타일 그림은 비공개 `style/brand/kick/`(없으면 층 없이 그림).

### 마지막 장 `end`(5판) — 칸 없음 `{"kind":"end"}`
- Kick-off 21쪽을 부품 11개로 : 가운데 판 테두리가 그려짐 → 판 안 아이콘 4 → 타일 6이 작게 밀려 들어옴 → 「Economic Connection Opportunity Momentum」 → 로고 · 쪽 번호. 흔들림 · 흐림 · 회전 없음, 지구본 타일은 테두리 없이.
- 본문 맨 끝(토의 · 추후 분석 뒤) 한 장. 이 장에서 → 는 멈춤(부록은 고리 · O 모아 보기). PDF 로 뽑으면 부록 뒤 맨 끝. 그림이 없으면 문구만(`text`).

### 간지 `part` — `no` · `name` · `desc` · `parts:[이름]` · `idx`

### `line` 주석 선 · 계단 차트(Kick-off 12쪽 · CW48 6장)
`labels` · `series[{name,data,color('main'|'cmp'|…),step(기본 true),width,dash,end('미국 4.00%')}]` · `y{min,max,step,dec,unit,suf}` · `ticks[idx]`
`band{a,b,from,legend,labels:[{at|[i0,i1],text,size,carry}]}`(두 계열 사이 면) · `phases[{from,to,name,now}]`(국면 띠 + 번호) · `avg[{s,from,to,x0,x1,label:'미국 평균 {v}%³⁾'}]`
`values[{s,at,text,pos:'above|below',dx,dy,anchor}]`(꺾임점 값) · `events[{at,v,text,sub,anchor,dx,dy,leader:[v0,v1]}]`(글이 가리키는 점과 40px 넘게 떨어지면 `leader` 필수 — 점검 「이름표 거리」) · `arrows[{at,a,b,text,sub,side,dx}]`(차이 화살)
`box{title:'시사점',items:[…],x0,x1,top,fixed}`(차트 안 시사점 상자 — x 는 칸 번호, top 은 값. 정한 자리가 선 · 이름표를 덮으면 엔진이 그림 칸 안 가까운 빈자리로 옮김, `fixed:true` 면 그대로) · `lanes[{name,sub,color,marks:[{at,kind:'up|down|hold|next',date,res,vote}]}]`(결정 일지)
`future{n,xlabels,title,branches:[{s,at,to}],labels:[{v,text,color}],range:{v,sub,text}}`(다음 결정 구역)
쌓기 : 축 · 국면 → 선 → 면 · 평균 → 값 · 사건 · 화살 → 결정 점 → 다음 구역 → 시사점 상자.

### `bar` 시간 막대(CW48 7장)
`labels` · `data` · `unit` · `y` · `phases` · `playback:true`(재생 막대가 지나가며 막대가 자라고 그 달 값을 읽어 줌)
`hi[{max|last|eq|idx:[…]|from,to,color}]` · `dim0:['notes','last']` · `beats[{hi:[…],dim:['brackets']}]`(강조 이동)
`brackets[{from,to,text,sub}]` · `notes[{at,text,sub,pos:'above|below',anchor}]` · `last{text}` · `negNote{at,v,text}`
`lanes[{name,sub,color,values:[n+1 개 — 첫 값은 앞 달]}]`(값이 바뀐 달마다 ▲▼, 크기 = 폭) · `laneSum[{text}]` · `laneSumTitle` · `laneNote` · `dist{title,from,to,avgText}`(오른쪽 분포)

### `hub` 경로 방사도(CW48 4장) — `center{label,value,dec,unit,sub1,sub2,carry}` · `nodes[4]{title,value,dec,unit,s1,s2,color,mini}`
`mini` = `{type:'bars',data,labels,lo}` | `{type:'negbars',data,labels}` | `{type:'line',data,lo,hi,marks:[{i,text,pos,anchor}],first,last}` | `{type:'lines',series:[{data,color,name,dy}],lo,hi,first,last}`

### `timeline` 국면 타임라인(CW48 8장) — `labels` · `data` · `unit` · `rangeTitle` · `ref[{v,label}]` · `phases[{from,to,name,rows:[[이름,값]],bg,now}]`

### `quadrant` 2×2 시나리오(CW48 11장)
`x{title,a,b}` · `y{title,a:{t,s},b:{t,s}}` · `pivot{label,value}` · `cells[4]{v,dec,unit,chip,tone:'wide|min',rate,text,tag}` · `gauge{lo,hi,cur,unit,curLabel}` · `callout{text,sub,cell}`(떠 있는 말풍선) · `beats[{spot:칸}]`

### `formula` 정의 · 계산(CW48 부록 A4)
`eq[{t,k:'r|g'}|{op:'='}]` · `cols[{name,sub,a:{label,value},b:{label,value},r:{label,value}}]` · `dec` · `unit`
`chart{labels,range,y,series:[{name,data,color,end}],markers:[{s,at,n,v,color}],box:{title,items:[{n,text,color}]}}`

### `kpi` 큰 숫자 띠 + 큰 차트 — `cards[{label,sub,value,dec,unit,chip:{text,dir},asof,hero}]` · `chart{type:'line|bar',labels,series,unit,marks:'auto',avg,avgText,dec,suf,title}`

### `table` 표 — `cols[{t,w,align,hc,tx,k}]` · `rows[{c:[…],hi}]`(칸 `{ph:1,t:'…'}` = 번호) · `chips{"행,열":{text,dir}}` · `range{col,lo,hi,unit,data:[[min,max,last]]}` · `bars{col,max,dec,unit}` · `after`

### 차트 부품(`j_*.js`) · 도식 부품(`k_*.js`)
각 파일 머리 주석과 `style/SCHEMA3_charts.md` · `style/SCHEMA3_diagrams.md` 참고. 목업 4판에서 더한 부품(l_* · n_*, 168 kind)은 `style/SCHEMA4.md` 색인.

## 5. 부품 만들기 규칙(parts/*.js)
- 등록 : `ECOM.parts[kind] = function (bd, s, ctx) {…}` — `bd` 본문 칸(1168×512), `ctx.svg(h)` 로 본문 SVG, `ctx.root` 장 요소, `ctx.deck` 덱.
- 쌓기 : 요소에 `data-b="단계"`(1부터, 단계 사이 `data-gap` ms) 또는 `data-at="ms"`(시간표). 효과 `data-fx` = `rise`(기본) · `fade` · `pop` · `draw`(선 그리기) · `grow`(막대, `data-o` 기준점) · `growx` · `drop`(위에서 내려앉음, `data-dy`) · `left` · `right` · `count`(숫자 굴림 `data-count` `data-from` `data-dec` `data-pre` `data-suf`).
- 장 요소 고리 : `root._prep(root)`(쌓기 전 처음 모습) · `root._hook(root)`(직접 움직임, 끝 ms 반환) · `root._reset` · `root._done`(쌓기 끝) · `root._beat(k)`(바뀜 단계 k, 0 = 처음) · `root._nb`(바뀜 수, `s.beats` 없을 때).
- 도움 : `ECOM.h`(E · T · H · nf · textW · wrap · niceTicks · lin · lv · at · tri · arrow2 · bracket · legend · stepD · lineD · col · A(el,kf,ms,ease,delay,fill) · later · RM) · `ECOM.u`(yScale · yAxis · xTicks · xLabels · phaseBands · laneMarks · avoid · label · legendHTML) · `ECOM.C` 색.
- 색은 `ECOM.C` 만(초록 main · dark · g65 · g40 · g18 · g08, 진회색 cmp, 회색 gray · light, 나쁜 뜻 warn). 장마다 강조 역할 3가지까지.
- 글 : 본문 13~16px, 작은 라벨 11.5px 이상, 숫자 라벨엔 반드시 단위(장 안 같은 양은 한 단위). 글끼리 · 글과 막대가 겹치면 안 됨(`?check` 의 textOverlap 0).

## 5판 손잡이 · 재료 (목업 V001~V058)

### 배치 `layout` — 같은 자료, 다른 그림
장 칸에 `"layout":"<이름>"` 만 더하면 같은 칸 값으로 다른 짜임을 그린다. 없거나 `"default"` 면 지금 그림. 이름이 틀리면 `ecs.py lint` 가 「배치 이름 · 고칠 것」.
**같은 회차 안 같은 kind 두 번째부터는 앞과 다른 배치**를 쓴다. 각 배치의 더 받는 칸은 부품 파일 머리 주석(`style/parts/*.js`)과 해당 V 목업에 있음.

| kind | 배치(목업) | 짙은 바탕 되는 배치 |
|---|---|---|
| `axis` | `scale` 좌우 저울(V008) · `bars` 겹친 막대(V009) · `overlay` 두 시기 겹친 선(V010) · `cards` 카드 두 장(V011) | — |
| `columns` | `venn` 겹친 원(V018) · `rows` 가로 띠(V019) · `iconcards` 아이콘 카드(V020) | iconcards, venn |
| `discuss` | `qcards` 질문 카드 3(V028) · `map` 지도형 토의(V051) | — |
| `formula` | `invoice` 계산서형(V021) · `blocks` 블록 더하기(V022) | — |
| `further` | `tree` 나무형(V029) · `grid` 2×2(V030) | — |
| `hub` | `grid` 2×2 칸 + 가운데 원형(V042) · `branch` 위→아래 갈래형(V043) · `map` 지도 위 경로(V050) | — |
| `kpi` | `hero` 큰 하나 + 작은 셋(V005) · `spark` 숫자 + 긴 미니 선(V006) · `band` 짙은 띠(V007) · `map` 지도 위 숫자(V049) · `map` 강조 focus(V057) | — |
| `line` | `phasefull` 국면 띠 전면형(V001) · `small` 작은 여러 개(V002) · `endbig` 끝 이름표 큰 숫자형(V003) · `deep` 짙은 초록 바탕형(V004) | deep |
| `map` | `region` 범위 확대(V046) · `bubbles` 점 크기 + 오른쪽 순위(V047) · `lanes` 항로(V048) | — |
| `pyramid` | `stairs` 계단형(V034) · `rings` 동심원형(V035) · `bars` 층 막대형(V036) · `blocks` 블록 쌓기형(V037) · `funnel` 깔때기형(V038) | bars, blocks, funnel, rings, stairs |
| `sankey` | `twoline` 굵은 띠 흐름형(V044) · `pipe` 배관형(V045) | pipe, twoline |
| `stairs` | `domino` 가로 도미노(V012) · `vtimeline` 세로 연표(V013) · `causetree` 원인 나무(V014) | causetree, domino, vtimeline |
| `statement` | `steps` 숫자 셋 계단(V025) · `onepic` 한 그림 요약(V026) · `deep` 짙은 바탕(V027) | deep |
| `structure` | `hier` 위아래 계층형(V039) · `trade` 좌우 거래 흐름형(V040) · `matrix` 주체 × 역할 행렬형(V041) | hier, matrix, trade |
| `table` | `bars` 막대 든 표(V023) · `heat` 색 칸 표(V024) | — |
| `term` | `dict` 사전형(V031) · `picture` 그림 풀이(V032) · `calc` 계산 예(V033) | — |
| `tree` | `topdown` 위→아래 나무(V015) · `sunburst` 선버스트(V016) · `table` 표형(V017) | sunburst, table, topdown |

- `map` 의 `region` · `bubbles` · `lanes` 와 `kpi` · `hub` · `discuss` 의 `map` 은 칸에 `at`(나라 이름 · ISO3 · [경도, 위도])이 있어야 함. 범위는 빌드가 자료에서 정함(`view.bbox` 가 있으면 그것, `geo:{"region":"gulf"}` 로 지정 가능). `at` 이 없으면 기본 그림.

### 바탕 `bg` — 본문의 15~25%
`"bg":"mint"`(연초록, 모든 부품) · `"deep"`(짙은 초록 — 위 표의 「짙은 바탕 되는 배치」만, 아니면 lint 「바탕 · 고칠 것」이고 엔진은 흰 바탕으로 그림) · `"map"`(전면 지도 = `fullmap` 이 저절로).

### 강조 `emph`
- `{"mode":"focus","keys":["한국"]}` — 쌓기가 끝나면 `data-key` 가 keys 에 없는 항목을 흐리게(새 배치 · 지도 배치는 항목마다 data-key 있음).
- `{"mode":"lens","at":[x,y],"r":95,"zoom":1.8,"text":"바닥에서 반등"}` — 본문 좌표(1168×512) 한 곳을 동그란 돋보기로 확대(쌓기 끝). 돋보기가 덮는 자리의 글은 가려지니 숫자 · 선이 있는 곳에.

### 전면 지도 `fullmap`(다큐형 4형식 · 장 전체가 지도)
`form`: `zoom`(지역 확대 — 해협 · 도시) · `globe`(지구본 회전 — 먼 길) · `flow`(세계 흐름 — 여러 나라 → 한 곳) · `choro`(나라 칠하기 — 나라별 값). 칸: `region` · `paint[{c,tone,label}]` · `tags` · `routes[{path,style:'lane|pipe|ship',label}]` · `rings` · `points` · `card` · `globe{from,to}` · `flows[{from,to,value,group}]` + `groups` · `values{나라:값}` + `scale` · `key`. 자세한 것 = `style/parts/l_fullmap.js` 머리 주석 · 목업 V052~V055.
- 지도 자료 = Natural Earth(10m · 50m · 110m, `style/geo/`) — 빌드(`geo_pack.py`)가 그 범위 나라 윤곽만 잘라 덱에 넣고 d3-geo 를 내장(인터넷 없이 열림). 나라 이름은 한글 짧은 이름 · 별칭(사우디아라비아 → 사우디) · ISO3 모두 됨.
- 바다 #3E9DAA 계열 · 땅 #0B2427 + 해안 빛, 이름표 = 흰 상자. 흐르는 점선은 움직임 줄이기 · `?still` · 발표자 창에서 멈춤.

### 몸 그림 `body`(건강 · 제약)
`organs[{o:'brain|eye|lung|heart|liver|stomach|pancreas|kidney|intestine|fat|blood|bone|joint|skin', label, value, unit, sub, tone}]` · `title` · `side`. 실루엣 위 장기를 칠하고 양옆 설명 칸으로 끌어냄(목업 V056). 다른 부품에서 `ECOM.bodyFig(svg,x,y,k,organs)`.

### 회사 로고 칸 `ECOM.coLogo(p,x,y,w,h,이름)`
비공개 `style/brand/logos/<이름>.png` 가 있으면 그림, 없으면 글자 칸(첫 글자 동그라미 + 이름). 로고 그림은 공개 저장소에 넣지 않음(보도 자료 · IR · 저작권 없는 공용 그림만 비공개 보관).

## 5판 영상 문법 부품 · 배치 (목업 V101~V249)
영상 레퍼런스 120편 장면 문법(형광펜 · 헤드라인 · 숫자판 · 지도 배지 · 순위표 · 그림 풀이 …)을 ECOM 색으로 다시 그린 것. 칸 자세한 설명은 각 부품 파일 머리 주석. 움직임은 600~800ms(형광 · 선 긋기 700~900, 숫자 굴림 900~1200), 기본 DOM = 끝 모습이라 `?still` · 모아 보기 · 인쇄에서 그대로 보임. 장 위 짧은 설명 한 줄은 `cap`(`note` 는 발표자 메모, `links` 는 부록 고리라 부품 자료로 쓰지 않음).

| kind | 배치 | 쓸 때 | 목업 |
|---|---|---|---|
| `clip` 문서 발췌 | doc · focus · pair · marks | 결정문 · 보고서 · 조문 한 줄을 형광으로 짚음(문장 안 `==구절==`) | V101~V108 |
| `headline` 헤드라인 | card · stack · type | 기사 제목 카드(`title[2줄]`, `**핵심어**`) · 시간 순 쌓기 · 단어 타이핑 | V109~V116 |
| `odo` 숫자판 | single · twin · tag · years | 큰 숫자 하나 · 두 값 · 그때와 지금 가격표 · 연도별 값 | V117~V122 |
| `pile` 단위 쌓기 | bricks · grid · two | 양을 벽돌 · 100칸 · 덩어리 넓이로 | V123~V127 |
| `pills` 알약 칩 | row · flip | 달마다 상태(기준 넘음/못 넘음) · 바뀜 하나 크게 | V128~V131 |
| `part` 간지 | chip · num · giant · strike · ruler · dots | 장 넘김 간지(`ECOM.chapter`, `p_chapter.js`) | V132~V141 |
| `label` 노랑 라벨 | term · facts | 용어 풀이 · 연혁 · 사실 3~4개 | V142~V145 |
| `mapbadge` 지도 배지 | link · ring · cut · elbow | 나라 사이 관계 · 공급처 · 끊김(X) · 품목(`nodes` · `edges`) | V151~V159 |
| `mapval` 지도 값 | badge · callout · radiate | 나라별 숫자 · 큰 값 말풍선 · 한 나라에서 뻗는 가지 | V160~V166 |
| `mapspread` 번지는 지도 | years · rings · fan | 연도별 확대 · 사건 지점 · 수출처(`steps[{year,iso}]`) | V167~V174 |
| `tilemap` 칸 지도 | us · kr · bars | 미국 주 · 한국 시도 값(지도 자료 없음) | V175~V181 |
| `relay` 이어달리기 | pan · steps | 단계가 이어져 결과에 닿음 | V182~V185 |
| `chainfire` 연쇄 점화 | line · net | 충격이 시간 차로 번짐 | V186~V189 |
| `cycle` · `hub` · `flow` | vicious · burst · tags · twoway · choke | 악순환 · 중심에서 터지는 몫 · 질문 태그 · 두 갈래 · 병목 | V190~V199 |
| `rankroll` 순위표 | bars · scroll · two | 한 줄씩 채움 · 길게 올라가다 짚은 행 · 두 열 | V201~V208 |
| `table` | grow · marker · years | 행 덧붙임 · 한 행 형광 · 세 해 표 | V209~V215 |
| `line` | fan · estimate · drop · solid | 전망 범위 부채 · 추정 음영 · 하락 화살 · 단색 바탕 | V216~V223 |
| `bar` · `donut` | single · hstack · pick · fill | 막대 하나 · 가로 누적 · 한 막대 짚기 · 도넛 채우기 | V224~V232 |
| `anatomy` 그림 풀이 | callout · layers · explode | 칩 · 배 · 건물 그림 지시선 · 층 단면 · 조각 몫 | V233~V239 |
| `pyramid` · `timeline` · `axis` · `columns` | glass · cards · gap · dots · shrink | 잔 쌓기 · 위아래 날짜 카드 · 두 값 격차 · 점무리 비교 | V240~V249 |

### 장 넘김 `transition`(장 칸) — panel · circle · blocks · tear
그 장으로 넘어올 때 색 판 두 장 밀기 · 원이 덮었다 줄기 · 계단 블록 · 종이 찢긴 가장자리로 덮기(목업 V146~V149). 장(章)이 바뀌는 곳에만, 덱 하나에 3~4번까지. 움직임 줄이기 · `?still` 에서는 바로 넘어감.
