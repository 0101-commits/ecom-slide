# 막대 묶음 부품(`style/parts/l_*.js`) 칸 정리 — 엔진 3판

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `beats` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채우는 짜임만 둔다.
숫자는 덱을 만드는 쪽이 계산해 넣는다(부품은 판정 글 · 막대 길이만 계산, 합계 · 비율 숫자는 만들지 않음). 시험 덱 : `style/demo4_bars.json`(종류마다 2장).

| 종류 | 쓰는 때 | 바뀜 |
|---|---|---|
| `expect` 기대 · 발표 · 이전값 | 지표 발표가 기대와 어떻게 달랐는지 + 발표 뒤 시장 반응 | 반응 칸 있음(묶음 2~5개) / 없음(묶음 6개) |
| `gapbar` 압도 차이 막대 | 한 값이 압도적으로 크거나 작아서 격차 자체가 주제 | 축 끊김 + 비율 칸 + 결론 띠 / 끊김 없이 막대 6개만 |
| `treemap` 트리맵 | 구성 비중(품목 · 업종)과 1년 전 대비 증감 | 증감 칩 목록 + 합계 상자 / 2단(대분류 안 소분류) |
| `firms` 기업 카드 나란히 | 회사 2~4곳을 같은 지표로 맞대기 | 카드 3장 + 비중 고리 / 카드 4장 고리 없이(선이 커짐) |

## expect
- `groups[{name, actual, expected, prev, max, verdict, tone}]` 2~6개 — `max` 는 그 묶음 눈금 끝(없으면 전체 최대 ×1.12), `verdict` 는 '상회 · 부합 · 하회'(없으면 발표 대 기대로 자동), `tone:'warn'` 이면 판정 칩이 나쁜 뜻 빨강
- `unit` · `dec`(값 글 단위 · 소수) · `hi`(강조 묶음 번호, 테두리 짙게) · `legend:false`(범례 줄 뺌)
- `react{title, sub, rows[{label, value('−9bp' 같은 글), trend[]}], note}` — 오른쪽 짙은 초록 칸(행 5개까지). 없으면 묶음이 가로 전체
- 움직임 : 카드 → 발표 막대 자람 → 기대 점선 → 발표값 → 이전값 빈 점 → 판정 칩 → 반응 칸(행마다 값 · 작은 선 그리기) → 한 줄 요점

## gapbar
- `rows[{label, value, tone('warn' 빨강 | 'hero' 짙은 초록)}]` 3~6개 — 색은 큰 순서(짙은 초록 → 초록 → 연초록), 값이 가장 큰 값의 2% 아래면 자동 빨강
- `brk`(true · false, 기본 자동 : 가장 큰 값이 둘째의 2배 넘으면 그 막대를 끊고 나머지는 둘째 ×1.64 기준) · `unit`(막대 아래 설명 글) · `dec`
- `ratio{title, n(큰 쪽 네모 수), cols(기본 20), one('미국 1' 작은 쪽 꼬리표)}` — 오른쪽 비율 칸. 없으면 막대가 넓어짐
- `band` 결론 한 줄(`**굵게**` 가능, 넘치면 2줄) — 없으면 띠 뺌
- 움직임 : 막대 차례로 자람(끊긴 막대는 두 토막) → 값 → 비율 네모가 줄 단위로 채워짐 → 작은 쪽 네모 → 결론 띠

## treemap
- `items[{name, value, other(true 면 회색 「그 밖」)}]` · `unit` · `dec` · `hero`(이름 또는 번호, 기본 가장 큰 항목, 짙은 초록) · `top`(초록 개수, 기본 5, 나머지 연한 초록)
- `side{title, dec, rows[{label, value(숫자), unit('%p')}], total{label, value, unit, dec, sub}}` — 오른쪽 증감 칩(음수는 빨강) + 합계 상자
- `groups[{name, value(대분류 합계 글), items[{name, value}]}]` — 주면 2단(`items` · `side` 무시, 대분류 크기순으로 초록 → 연함)
- 작은 칸은 글자가 들어가는 만큼만 표시(이름 + 값 → 이름만 → 없음)
- 움직임 : 큰 칸부터 하나씩 나타남 → 이름 · 값 → 증감 칩 줄 → 합계 숫자 굴림

## firms
- `cards[{name, tag, big{label,value,unit,dec}, bar{label,value,max,step}, metric{label,value,unit,dec,trend[],trendLabels[처음,끝]}, ring{label,value(0~100),sub}}]` 2~4장
- `hero`(강조 카드 번호, 기본 0, -1 이면 강조 없음) — 강조 카드에만 `tag` 칩이 나옴
- 선 눈금은 카드끼리 같은 범위로 그려 비교됨. 어느 카드에도 `ring` 이 없으면 지표 선이 카드 아래까지 커짐 · `bar` 없으면 그 칸은 건너뜀
- 움직임 : 카드 → 큰 숫자 굴림 → 진행 막대 자람 → 지표 값 → 분기 선 그리기 → 비중 고리 그려짐
