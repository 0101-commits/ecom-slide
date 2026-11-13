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

### 간지 `part` — `no` · `name` · `desc` · `parts:[이름]` · `idx`

### `line` 주석 선 · 계단 차트(Kick-off 12쪽 · CW48 6장)
`labels` · `series[{name,data,color('main'|'cmp'|…),step(기본 true),width,dash,end('미국 4.00%')}]` · `y{min,max,step,dec,unit,suf}` · `ticks[idx]`
`band{a,b,from,legend,labels:[{at|[i0,i1],text,size,carry}]}`(두 계열 사이 면) · `phases[{from,to,name,now}]`(국면 띠 + 번호) · `avg[{s,from,to,x0,x1,label:'미국 평균 {v}%³⁾'}]`
`values[{s,at,text,pos:'above|below',dx,dy,anchor}]`(꺾임점 값) · `events[{at,v,text,sub,anchor,dx,dy,leader:[v0,v1]}]` · `arrows[{at,a,b,text,sub,side,dx}]`(차이 화살)
`box{title:'시사점',items:[…],x0,x1,top}`(차트 안 시사점 상자 — x 는 칸 번호, top 은 값) · `lanes[{name,sub,color,marks:[{at,kind:'up|down|hold|next',date,res,vote}]}]`(결정 일지)
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
