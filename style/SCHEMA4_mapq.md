# 지도 · 문구 비교 · 배관 부품(`style/parts/l_*.js`) 칸 정리 — 엔진 3판

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `beats` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채운다.
시험 덱 : `style/demo4_mapq.json`(종류마다 2장). 숫자는 덱을 만드는 쪽이 넣는다(부품은 만들지 않음).
지도 자료 `l_geo.js` : Natural Earth 공개 자료(world-atlas npm, 저작권 없음) — `ECOM.geo = {W, H, land, countries:{ISO3:path}, project(lon,lat), find(이름·ISO3·[lon,lat]), names, anchor}`. 파일 이름순으로 `l_map.js` 보다 먼저 붙음.

| 종류 | 쓰는 때 | 바뀜 |
|---|---|---|
| `map` 세계 지도 | 물동량 · 자금이 나라 사이를 흐르는 길(굵기 = 값), 나라별 값을 색으로 칠하는 단계 구분도 | 없음 |
| `quote` 문구 비교 | 성명 · 결정문의 지난 문구와 이번 문구 대조(지운 말 · 더한 말) + 방향 칩 + 척도 | 없음 |
| `pipe` 정책 전파 배관 | 정책 변화가 마디를 거쳐 번지는 순서 · 시차 + 두 번째 길 + 효과가 보이는 때 | 없음 |

## map — 세계 지도
- `flows[{from, to, via:[[lon,lat]…], value, tone}]` — `from` · `to` 는 `[lon,lat]` 또는 나라 이름(`ECOM.geo.names` 에 있는 말, 예 `"미국"`). 굵기 = `value`(가장 큰 값이 11px). `tone` = `main` · `dark` · `g65` · `cmp` · `warn`
- `points[{at, label, value, kind:'src'|'dst', pos:'r|l|t|b'}]` — `src` 는 짙은 겹동그라미(이름 + 값), `dst` 는 속 빈 네모(이름). `value` 가 숫자면 `unit` 을 붙여 씀. 이름 자리는 겹치지 않게 저절로 고름(`pos` 로 먼저 시도할 방향 지정)
- `chokes[{at, label, pos}]` — 길목 작은 흰 동그라미 + 12px 이름
- `fill{ISO3: 값}` + `legend{title, bins:[아래 한계 5개 이하], none}` — 단계 구분도(5단 초록, 값 없으면 회색 · 「자료 없음」). `fillLabels[ISO3…]` 는 나라 이름 + 값을 표시
- `box{title, rows:[{label,value}], pos:'left'|'right'}` — 왼쪽 아래 작은 순위 칸(막대, 선택). 범례와 같이 쓰면 범례 오른쪽으로 비킴
- `unit`(값 단위, 숫자 라벨에 붙음) · `dec`(소수 자리) · `flowKey`(「굵기 = …」 말, 기본 물량) · `dstKey`(도착 열쇠 말, 기본 도착 지역)
- 움직임 : 지도(나라는 값 큰 순서로 칠해짐) → 출발 점 → 흐름 선이 차례로 그려지고 화살촉 → 도착 점 · 이름 → 길목 · 나라 표시 → 열쇠 · 순위 칸

## quote — 문구 비교
- `cols{item, old, new, side}` — 머리 글자(기본 지난 문구 · 이번 문구)
- `rows[{item, old, new, side, tone}]` 3~6줄 — 문자열 안 `~~지운 말~~`(회색 취소선) · `++더한 말++`(연초록 바탕 굵게). `side` 가 「매파…」면 warn, 「비둘기…」면 초록, 「같음」이면 회색 칩(`tone: main|warn|gray` 로 직접 지정). 긴 문구는 칸 안에서 줄바꿈, 줄 높이는 줄 수에 맞춰 나눔
- `scale{left, right, old, new, oldLabel, newLabel}` — 아래 척도 줄(`old` · `new` 는 0~1, 왼쪽 끝 0). 없으면 척도 없이 줄이 아래까지 늘어남
- 움직임 : 줄이 위에서부터 차례로 → (척도) 지난번 점 → 선 그리기 → 화살촉 → 이번 점

## pipe — 정책 전파 배관
- `nodes[{name, value, lag}]` 3~5개(처음 · 끝 짙게). `lag` = 앞 마디에서 이 마디까지 걸리는 시간 글자(관 위에 표시). 마디 폭은 개수에 맞춰 줄어듦
- `lane2{from, to, label, sub}`(선택) — 마디 번호(0부터) 사이를 아래로 돌아가는 곡선 관 + 가운데 상자. 없으면 마디가 아래로 내려와 커짐
- `gantt{title, max, step, unit, bars:[{from, to, label, tone:'main|g65|g40|g18'}]}`(선택, 1~5줄) — 맨 아래 「효과가 보이는 때」 막대 + 눈금
- 움직임 : 마디 · 관 · 시차 차례로(처음 → 끝) → 두 번째 길 그림 → 가운데 상자 → 간트 막대 위에서부터
