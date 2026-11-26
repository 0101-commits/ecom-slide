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

- `tone`: `strong`(짙은 면, 결론 칸) · `soft`(중간 면) · `ghost` · `warn` · `mid` · `hot`. 없으면 옅은 면.
- 숫자 크기: `stat` 은 36px, `big:true` 는 52px(장에 1곳). `bars` 의 `hero:true` 는 52px.
- `stat` 의 `n`(숫자) · `dec` 를 주면 숫자가 굴러 올라감. `spark` 는 칸 아래 작은 추이선(`sl` = 양 끝 이름, `rng` = 세로 범위).
- 움직임: 블록마다 차례로 떠오름(카드, 줄, 단계 하나씩). 마우스 올림 카드는 칸 이름(`data-key`)으로 붙음.

## 아직 옮기지 않은 블록(판 6 기획안 견본에는 있음)

`nodes`(상자 + 직각 연결선) · `dist`(점 분포) · `tiles`(벤토 타일) · `shot`(실제 그림 + 확대 풀이) · `matrix` · `line` · `doc`, 카드 머리 그림(`icon`), 색 틀(남색 등). 쓰면 「모르는 블록」으로 표시된다.

시험 덱: `style/demo6_blocks.json`(판 6 기획안 견본 중 공개 자료 주제 15장, `python -X utf8 tools/check5.py style/demo6_blocks.json`).
