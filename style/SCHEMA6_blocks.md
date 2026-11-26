# 6판 조립 블록 — 화면 종류 `blocks`

본문 칸(1168×512)을 `layout` 으로 나누고 `blocks` 를 차례로 채운다. 주제와 상관없이 설명 유형(`ecs.py types`)에 맞는 블록을 골라 명세만 적으면 엔진이 그린다. 꼬리표(eyebrow), 헤드메시지(head), 각주(foot)는 다른 화면 종류와 같다.

```json
{ "kind": "blocks", "eyebrow": {"group": "유가", "topic": "경유와 휘발유 소매 가격 비교", "basis": "미국 평균, 월평균, 단위: 달러/갤런"},
  "head": "…", "layout": "T7B3",
  "blocks": [ {"type": "stat", "cards": [ … ]}, {"type": "note", "tag": "전이 경로", "t": "…"} ],
  "foot": {"source": "…", "notes": ["…"]} }
```

## layout

| 값 | 나눔 |
|---|---|
| `full` | 한 칸 |
| `L6R4` | 좌우 6:4 (숫자는 비율) |
| `T7B3` | 위아래 7:3 |
| `T6B4:L6R6` | 위 한 칸 + 아래 좌우 |
| `L7R5:T5B5` | 왼쪽 한 칸 + 오른쪽 위아래 |

블록 수가 칸 수보다 많으면 남는 블록은 마지막 칸에 겹쳐 그려지므로 칸 수에 맞춘다. 칸 사이 간격은 `gap`(기본 24).

## 블록

| type | 설명 유형 | 칸 |
|---|---|---|
| `steps` | 과정, 절차, 일정 | `items[{k, t, s, fig, items[], tone}]` · `valign` |
| `compare` | 전후, 양자 비교 | `left{t, s}` `right{t, s}` `axis` `rows[{k, l, r, chip, hi, big}]` · `wc`(가운데 폭) |
| `stat` | 핵심 수치 | `cards[{q, v, unit, frm, side, cond, d[], tone, big, vfs, spark[], sl[2], rng[2], n, dec}]` · `dir:"col"` |
| `cards` | 정의, 구성 요소 | `items[{k, fig, t, s, items[], tone}]` · `dir:"col"` · `valign` |
| `note` | 결론 띠 | `t` · `tag` · `tone:"soft"` |
| `table` | 다자 비교 | `cols[{t, w, align:"c"}]` `rows[[글 또는 {t, s, tone, b, fs}]]` · `hi[]` `hot[]` `maxh` |
| `bars` | 크기, 순위 | `items[{label, sub, v, vt, tone, segs[[이름, 값]], hero, note}]` · `unit` `max` `labw` · `delta{a, b, t}` · `ref{v, t}` |
| `timeline` | 사건 순서, 일정 | `t0` `t1` · `events[{at, t, d, s, side:"up|down", tone, dx, w}]` · `phases[{a, b, t, tone}]` · `ticks[[값, 글]]` · `ew` `pad` |
| `layers` | 구조, 계층 / 포함 관계 | `layers[{t, n, s, chips[], tone, to}]` · `mode:"nest"`(포함 겹) · `flow`(층 사이 화살) · `tw` `sw` |
| `pict` | 규모 환산 | `rows[{label, sub, n, on, v, unit, tone, delta}]` · `icon:"drum|box|person|doc"` · `sz` `labw` `valw` `key` `box` |
| `nodes` | 인과, 과정, 주체별 처리 순서, 갈림, 순환 | `cols` `rows` · `nodes[{id, c, r, cs, rs, t, s, fig, tone, badge}]` · `edges[{a, b, pa, pb:"r|l|t|b", oa, ob, m, off, style:"solid|main|dash|warn", lab, lp, lbg}]` · `lanes[]`(주체별 줄) · `colhead[]`(\* 로 시작하면 강조) · `gx` `gy` `maxh` `fs` |
| `line` | 추이, 변화 | `x[]` · `y{min, max, step, unit}` · `series[{name, v[], tone, dash, show[], ldy, vdy}]` · `bands[{a, b, t}]` · `ref{v, t}` · `notes[{i, v, t, dx, dy}]` · `xstep` `rpad` |
| `dist` | 분포 | `groups[{label, dots{값: 개수}, box[q1, 중앙, q3], lo, hi}]` · `y{min, max, step, unit}` · `ref{v, t}` |
| `matrix` | 2×2 나눔 | `quads[{t, s, items[], tone}]`(왼위, 오른위, 왼아래, 오른아래) · `xaxis` `yaxis` |
| `tiles` | 요약 타일(벤토) | `grid[열, 줄]` · `items[{c, r, cs, rs, icon, ic, k, fig, big, t, fs, s, tone, bars[[이름, 값, 강조]], bottom}]` · `arrows[[a, b]]` · `gap` |
| `shot` | 근거 제시 | `img`(덱 기준 경로 또는 data:) · `ar`(원본 가로 ÷ 세로) · `crop[l, t, r, b]`(0~1) · `box[x, y, w, h]`(잘라 낸 그림 안 0~1) · `title` `mark` · `calls[{k, t, s, hot}]` · `dw` |
| `list` | 번호 목록(그림 번호와 짝) | `items[{n, t, s, fig, hot, tone}]` |
| `iso` | 공간 배치, 내부 구조(분해도) | `items[{k:"box|cyl|plate|flow|guide", x, y, z, w, d, h, r, tone:"strong|soft|mid|plain|warn|ground|ghost", tag, fig, pin, foot, side, lines[], grid, t, pts[], dash, ord}]` · `u`(한 칸 28) `ox` `oy` · `panel` · `texts[{fx, fy, t}]` · `list`(옆 번호 목록) |
| `plan` | 공간 배치(평면도, 배치도, 단면), 설비 계통, 기계 | `size[가로, 세로]` · `shapes[{k:"rect|line|poly|circle|arc|rep", …, fill:"soft|solid|hi|hatch", sw:"bold|mid|thin", dash, arrow}]` · `syms[{k:"tank|vessel|pump|valve|hx|turbine|gen|tower|fan", x, y, w, h, hot, t, tp}]` · `pipes[{pts[], tone, dash, lab}]` · `dims[{a, b, t, off}]` · `texts[]` · `pins[{x, y, n, to}]` · `title{name, scale, unit}` · `list`. 6판은 흰 바탕 옅은 격자(짙은 청사진 바탕 없음) |
| `section` | 층 단면, 구성 분해(방송 구성) | `layers[{t, v, fig, s, tone:"d|g|m|s|y", minus, hot}]`(아래부터, 두께 = 값), `total{t, v, fig}`(왼쪽 묶음), `unit`, `explode`(층 사이 띄움). 이름표는 오른쪽 칸, 직각 지시선 |
| `hexmap` | 지역별 값(한국 17 시도 육각 칸, 경계 자료 없음) | `values{시도: 값}`, `bands[경계 1~3개]`, `unit`, `dec`(소수 자리), `rise`(값만큼 솟은 입체), `side`(오른쪽 높은 곳, 낮은 곳 3곳씩, 기본 켬), `legend` |
| `versus` | 두 대상 맞대결(대결 판) | `a{name, icon, s, fig, k}`, `b{…}`(반씩 나눈 바탕), `rows[{t, a, b, fa, fb, hi}]`(같은 잣대 줄, 숫자면 가운데에서 바깥으로 막대), `lowWin`(작은 값이 이김), `note`(원인 한 줄) |
| `photo` | 사진 합성(근거 제시) | `img`, `ar`, `focus[0~1, 0~1]`, `fade:"right|left|bottom|none"`(그쪽을 흰색으로 흐리게), `calls[{x, y, n, t, s, hot}]`(사진 위 번호 → 흐린 쪽 이름표, 직각 지시선), `credit`(각주에 「사진: …」) |

- `tone`: `strong`(짙은 면, 결론 칸) · `soft`(중간 면) · `ghost` · `warn` · `mid` · `hot`. 없으면 옅은 면.
- 숫자 크기: `stat` 은 36px, `big:true` 는 52px(장에 1곳). `bars` 의 `hero:true` 는 52px.
- `stat` 의 `n`(숫자) · `dec` 를 주면 숫자가 굴러 올라감. `spark` 는 칸 아래 작은 추이선(`sl` = 양 끝 이름, `rng` = 세로 범위).
- 움직임: 블록마다 차례로 떠오름(카드, 줄, 단계 하나씩). 마우스 올림 카드는 칸 이름(`data-key`)으로 붙음.

## 그림 재료(iso 블록, 견본 수준)

`iso` 의 `items` 에서 아래 `k` 를 쓰면 판 6 견본과 같은 그림이 나온다. 좌표는 등각 칸 단위(a 오른쪽 아래, b 왼쪽 아래, z 위), `tone` 은 3면 색표 이름 `w` 흰 · `g` 초록 · `m` 옅은 초록 · `d` 짙은 초록 · `y` 노랑 · `r` 빨강 · `k` 검정 · `s` 회녹(이 이름이면 명암 3단 + 바닥 그림자).

| k | 그림 | 칸 |
|---|---|---|
| `box` · `prism` | 상자 · 다각 기둥 | `x y w d h z` · `pts[[a, b]]` `h` · `shadow` |
| `cyl` | 원통(탱크 · 탑) | `x y r h z rings` |
| `derrick` | 시추탑(유전) | `x y s h` |
| `ship` | 유조선(b 방향으로 뱃머리) | `x y len w` |
| `building` | 창 있는 건물 | `x y w d h floors wl wr tone` |
| `sphere` | 구형 탱크 | `x y r z` |
| `station` | 주유소(매장 · 지붕 · 주유기) | `x y` |
| `water` | 바다 띠(흰 물가선) | `x y w d` |
| `route` | 관(짙은 초록 굵은 선) · 항로(`style:"sea"`, 흰 점선) | `pts[[a, b, z]]` `arrow` `sw` |
| `text` | 땅 위 글(흰 테두리) | `x y z t dx dy fill` |
| `factory` | 공장(톱니 지붕 · 굴뚝) | `x y w d h teeth rh chimney ch` |
| `cooling` | 냉각탑(수증기) | `x y r h steam` |
| `crane` | 항만 크레인 | `x y h boom` |
| `containers` | 컨테이너 더미 | `x y cols rows levels len colors[]` |
| `rail` · `train` | 철길 · 화물 열차 | `x y len dir:"a|b"` · `x y n tone` |
| `warehouse` | 창고(박공 지붕) | `x y w d h rh` |
| `truck` | 화물차 | `x y tone` |
| `turbine` | 풍력 발전기 | `x y h blade` |
| `field` · `greenhouse` · `silo` · `tractor` | 밭 · 온실 · 저장고 · 트랙터 | `x y w d rows crop soil` · `x y w d h rh` · `x y r h` · `x y` |
| `hospital` · `ambulance` | 병원(붉은 십자) · 구급차 | `x y w d h floors` · `x y` |
| `tower` · `house` · `tree` · `road` · `car` | 고층 건물 · 집(박공) · 나무 · 도로 · 승용차 | `x y w d floors` · `x y w d h rh roof` · `x y s` · `x y len w dir` · `x y tone` |

- 재료마다 `tag`(흰 이름 칸 + 세로 지시선), `pin`(번호)을 붙일 수 있다.
- 블록 칸: `u`(칸 크기 px) · `oxp` `oyp`(원점, 본문 칸 안 px) · `panel:false`(흰 바탕) · `gridlines`(옅은 바닥 격자) · `callouts[{at[a, b, z], x, w, t, v, s, tone}]`(위쪽 숫자 칸 + 지시선).
- `bleed:true`: 장 전체(1280×720)에 깔고 헤드메시지와 각주 자리는 흰색으로 서서히 흐림(`fadeTop` `fadeBot` = 본문 칸 기준 y 구간, 기본 [-30, 50] · [470, 520]).
- 도면(`plan`) 재료: `walls[[x0, y0, x1, y1, 8|5]]`(짙은 초록 벽) · `windows[[x0, y0, x1, y1]]`(세 줄) · `doors[{x, y, r, a0, a1}]` · `furniture[{k:"bed|sofa|table|tv|counter|toilet", x, y, w, h, n, bx, by}]` · `rooms[{x, y, t, s, small}]`(방 이름 + 면적). 치수 글 16px.
- 인체(`body` 화면 종류): 지시선은 직각(가로 → 세로 → 가로), 설명 칸은 테두리 없는 옅은 면.
- 시험: `style/demo6_scene.json` 4장(견본 공급 경로 · 같은 장 장 전체 배치 · 제조업 수출 경로 개념도 · 견본 84㎡ 평면도 · 농산물이 도시에 이르는 경로 개념도).

## 틀 2종

- ECOM 틀(기본): 꼬리표(eyebrow), 헤드메시지 2줄(head), 본문 칸 1168×512, 각주(foot).
- 벤토 틀: 장에 `"frame": "bento"`(또는 `meta.frame`). 제목 2줄 36px(`title`, 줄 목록 또는 글), 부제목 18px(`sub`), 본문 칸 1168×470, 카드 모서리 18px, 출처는 아래 한 줄(`foot.source`), 로고 없음. 색은 `skin` `bentoG`(초록, 기본) 또는 `bentoL`(파랑).
- 덱 전체 색: `meta.skin`(navy, plain, bentoG, bentoL). 장의 `skin` 이 먼저.
- 주제 팩과 이야기 흐름: `ecs.py packs`(팩 3종 · 흐름 5종), `ecs.py packs <팩>`(그 팩의 틀, 색, 출처 규칙, 글 규칙, 설명 유형, 그림 재료, 흐름 차례). 자료 = `library/packs/packs.json`.

## 아이콘과 색 틀

- 카드(`cards`)와 타일(`tiles`)의 `icon`: 라인 아이콘 이름(`style/icons`, Lucide, ISC: database, cpu, shield-check 등 24종) 또는 `tf:<코드>`(Tossface 원본 그림, `style/tossface`, 예: `tf:u1F33E`).
- Tossface 사용 조건(토스 저작권 안내, 라이선스 전문 = `style/tossface/LICENSE.txt`): 누구나 무료, 변형 금지, 소스코드로 변환해 게재 금지, 출처 표기. 그래서 저장소에는 원본 파일만 두고 `ecs.py` 가 덱을 만들 때 그림으로 넣으며, 쓴 장의 각주 끝에 「이모지: 토스팀에서 제공한 토스페이스」가 자동으로 붙는다.
- `skin`: `navy`(남색), `plain`(회색), `paper`(종이 질감 : 칸 면만 옅은 종이 색과 6% 결, 장 바탕은 흰색). 없으면 ECOM 초록. 벤토 틀(`bentoG`, `bentoL`)은 4단계 틀과 함께.
- 지도와 인체는 엔진의 기존 화면 종류(`fullmap` · `map` · `body` 등)를 쓴다.
- 아직 없는 것: `doc`(문서 그림), 그림 재료는 산업 · 물류 · 농업 · 의료 · 도시 장면.

그림형 시험 덱: `style/demo6_picture.json`(판 4 그림형 명세 15장). 시험 덱: `style/demo6_blocks.json`(판 6 기획안 견본 중 공개 자료 주제 25장, `python -X utf8 tools/check5.py style/demo6_blocks.json`).

## 개념도 표시, 직각 연결선, 연결선 점검(7단계)

- 장에 `"concept": "개념도" | "예시 치수" | "어림 값"`(true = 개념도). 꼬리표 옆(벤토 틀은 부제목 옆)에 칩, 각주 출처 줄 끝에 「단순화한 개념도」 「치수는 예시 값」 「값은 어림 값」이 붙음.
- 연결선은 가로, 세로 마디만. 부품에서는 `ECOM.h.orthoD(a, b, via, r)` 로 경로를 만듦(`via` = `hvh` 기본, `vhv`, `hv`, `vh`, 또는 거칠 점 목록). 꺾는 곳만 둥글게(r 8).
- 연결선 굵기는 1.5px(기본) 또는 3px(강조). 화살 꼭지는 선과 같은 색. 선 위 이름표는 흰 테두리 글이나 흰 칸으로 가림.
- 화면 점검(`tools/check5.py`) 연결선 5항목 : 대각 연결선(곡선 포함), 연결선이 칸을 지남, 연결선이 글을 지남, 화살 꼭지 색, 연결선 굵기. 두 끝이 서로 다른 칸 가장자리에 닿는 선만 셈(지도, 그림 장 제외).
- 견본: `style/demo6_broadcast.json` 6장(층 단면, 시도 육각 지도 평면과 입체, 대결 판, 사진 합성, 종이 질감과 사람 그림). 숫자는 모두 예시 값.
- 파생 부품 한도는 덱당 화면 종류 1개(파일 수가 아니라 `ECOM.parts.<kind>` 수로 셈). 쓸 때는 `meta.derived` 에 `{"kind": "블록으로 못 그리는 까닭"}`.
