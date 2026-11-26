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

- `tone`: `strong`(짙은 면, 결론 칸) · `soft`(중간 면) · `ghost` · `warn` · `mid` · `hot`. 없으면 옅은 면.
- 숫자 크기: `stat` 은 36px, `big:true` 는 52px(장에 1곳). `bars` 의 `hero:true` 는 52px.
- `stat` 의 `n`(숫자) · `dec` 를 주면 숫자가 굴러 올라감. `spark` 는 칸 아래 작은 추이선(`sl` = 양 끝 이름, `rng` = 세로 범위).
- 움직임: 블록마다 차례로 떠오름(카드, 줄, 단계 하나씩). 마우스 올림 카드는 칸 이름(`data-key`)으로 붙음.

## 아이콘과 색 틀

- 카드(`cards`)와 타일(`tiles`)의 `icon`: 라인 아이콘 이름(`style/icons`, Lucide, ISC: database, cpu, shield-check 등 24종) 또는 `tf:<코드>`(Tossface 원본 그림, `style/tossface`, 예: `tf:u1F33E`).
- Tossface 사용 조건(토스 저작권 안내, 라이선스 전문 = `style/tossface/LICENSE.txt`): 누구나 무료, 변형 금지, 소스코드로 변환해 게재 금지, 출처 표기. 그래서 저장소에는 원본 파일만 두고 `ecs.py` 가 덱을 만들 때 그림으로 넣으며, 쓴 장의 각주 끝에 「이모지: 토스팀에서 제공한 토스페이스」가 자동으로 붙는다.
- `skin`: `navy`(남색) · `plain`(회색). 없으면 ECOM 초록. 벤토 틀(`bentoG` · `bentoL`)은 4단계 틀과 함께.
- 아직 없는 것: `doc`(문서 그림), 벤토 틀.

시험 덱: `style/demo6_blocks.json`(판 6 기획안 견본 중 공개 자료 주제 25장, `python -X utf8 tools/check5.py style/demo6_blocks.json`).
