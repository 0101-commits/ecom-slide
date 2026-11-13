# 지도 계열(F07) 칸 정리 — 엔진 3판 · 1차 목업 12종

공통 칸은 `SCHEMA3.md` 2절. 본문 1168×512. 시험 덱 `style/demo4_r1_F07.json` · 만드는 곳 `tools/make_mockups4_F07.py`.

| 종류 | 쓰는 때 | 바뀜 |
|---|---|---|
| `map` 세계 지도 | 흐름 · 단계 구분도 + 확대 · 구분 칠 · 규모 원 · 번호 점 | 칸 더함(아래) |
| `mptile` 타일 격자 지도 | 지역 하나 = 칸 하나(미국 주 · 중국 성 · 한국 시도 · 나라 육각), 권역 색 구분 · 값 | 새 부품 |
| `mprank` 지도 + 옆 막대 | 왼쪽 지도(번호 점 · 항로) + 오른쪽 값 막대 1~2묶음 | 새 부품 |
| `mpduo` 전후 두 지도 | 지도 두 장 나란히(사건 전 · 후) | 새 부품 |

## map 에 더한 칸 (기존 시험 덱 그대로 그려짐)
- `view{bbox:[lon0,lat0,lon1,lat1]}` — 그 범위로 확대(바깥은 잘림). 해협 · 동아시아 확대에 씀
- `zones[{iso:[ISO3…], tone:'main|dark|g65|g40|g18|g08', label, at, pos}]` — 나라 묶음을 색으로 구분(값 없음) + 이름
- `seas[{at,label}]` — 바다 이름(기울인 글씨)
- `bubble:true` + `bubbleKey` — src 점을 값(`value`)에 비례한 원으로(왼쪽 아래에 「원 크기 = …」 열쇠)
- `points[].num` — 번호 점(짙은 동그라미 + 숫자) · `label` 이 비면 이름 없이 번호만 · `numKey`(열쇠 말)
- `noFlowKey` · `noDstKey` — 「굵기 = …」 · 「도착 지역」 열쇠 끔(흐름 굵기가 같을 때)
- `frame{w,h}` — 지도를 이 크기 상자에 맞춤(`mprank` · `mpduo` 가 안에서 씀)

## mptile
- `layout:'us'|'cn'|'kr'` 내장 격자(미국 50주+DC · 중국 31 성급(한자음 이름) · 한국 17 시도) 또는 `tiles[{id,label,c,r}]` 직접 · `shape:'hex'` 이면 홀수 줄이 반 칸 밀린 육각
- `groups[{label,tone,ids:[…]}]` 구분 칠 · 오른쪽 설명 칸에 칸 수 자동 · `groupKey`(제목) · `countUnit`(기본 곳)
- `values{id:값}` + `unit` · `dec` — 칸 안에 값(groups 가 없으면 값 크기로 5단 칠 + 범례, `bins` 로 한계 지정)
- `ring[id…]` 굵은 테두리 · `round[id…]` 동그란 칸 · `marks[{shape:'sq|circle|ring',label}]` 모양 설명 · `names{id:표시 이름}` · `fs`(글 크기)
- 움직임 : 칸이 묶음 순서로 튀어나옴 → 오른쪽 설명 칸

## mprank
- `map{…}` = map 칸 그대로 · `mapW`(지도 폭, 기본 640)
- `metrics[{title,unit,dec,rows:[{label,value,num,tone}]}]` 1~2묶음 · `num` 은 지도 번호 점과 맞춤
- 움직임 : 지도 → 번호 점 → 막대 위에서부터

## mpduo
- `panels[{title, map:{…map 칸}}]` 2개 — 제목 띠(사건 전 · 후) + 가운데 화살표. 같은 `view` 를 주면 두 지도 비교가 쉬움
