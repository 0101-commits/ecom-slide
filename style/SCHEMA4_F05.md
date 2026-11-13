# 인과 사슬 · 흐름도 부품(`style/parts/cz_*.js`) 칸 정리 — F05 · F06 1차

공통 칸은 `SCHEMA3.md` 2절 그대로. 공통 도움 `parts/n_cz_.js`(`ECOM.cz` : 줄바꿈 글 · 화살 · 이름표 · 상자). 시험 덱 : `style/demo4_r1_F05.json`(만들기 `tools/make_mockups4_F05.py`).
주의 : 장 공통 `links`(오른쪽 위 고리)와 겹치지 않도록 사슬 연결은 `lks` 로 부른다.

| 종류 | 쓰는 때 | 목업 |
|---|---|---|
| `czchain` 인과 사슬 | 마디가 화살로 이어짐 — `shape` 로 5모양 | N051 · N059 · N062 · N063 · N064 |
| `czfan` 갈래 · 합류 | 하나가 여럿으로(out) · 여럿이 하나로(in) | N052 · N053 |
| `czloop` 두 고리 8자 | 가운데 마디를 공유하는 두 순환 | N054 |
| `czdomino` 도미노 연쇄 | 쓰러지는 순서(기울기 커짐) | N055 |
| `czfish` 물고기뼈 | 결과 하나에 원인 여섯 | N057 |
| `czvstep` 세로 인과 계단 | 위 → 아래 단계 + 옆 근거 숫자 | N058 |
| `czrings` 충격 동심원 | 가운데 사건 + 1~4차 번짐 | N060 |
| `cznet` 연결망 | 마디 크기 = 규모, 선 굵기 = 연결 | N061 |
| (기존) `pipe` · `sankey` | 정책 전파 배관 · 산키 — 칸 그대로 사용 | N056 · N065 |

## czchain
- 공통 : `nodes[{name,value,vsub,sub,tag}]` · `lks[{text,sub}]`(마디 수 − 1)
- `shape:'circle'` 큰 동그라미(첫 마디 짙게) + 고리 숫자 이름표 + `total{text}` 아래 괄호
- `shape:'card'` 칸마다 작은 선 `nodes[].mini{data,first,last,dec,unit}`
- `shape:'rows'` 두 줄 비교 `rows[{label,sub,tone:'cmp|main',nodes,links}]` · `diffs[글]`(두 줄 사이 같은 자리 비교)
- `shape:'broke'` 끊긴 고리 `lks[i].broken:true`(✕ + 점선) · `nodes[].dim`(흐리게) · `callout{title,text}`(끊긴 곳 아래 전체 폭 상자)
- `shape:'gate'` 켜짐 · 꺼짐 점검 `nodes[{…,on,rule,short}]` · `result{title,text}`(아래 짙은 띠 + 칸별 켜짐 표시) — 앞 칸이 꺼지면 뒤 화살은 점선

## czfan
`mode:'out'|'in'` · `hub{name,value,sub,tag}`(짙은 큰 상자) · `leaves[2~4]{name,value,sub,rel(띠 위 이름표),tone:'warn'}`

## czloop
`center{name,value,sub}` · `left{title,sub,nodes[2],links[3]}` · `right{…}` — 왼쪽 반시계, 오른쪽 시계. `links` 순서 = 가운데 → 첫 마디 → 둘째 마디 → 가운데

## czdomino
`tiles[3~6]{name,value,sub,date}` · `lead{text}`(위 화살 머리글)

## czfish
`fishHead{name,value,sub}`(결과 머리) · `bones[2~6]{name,value,sub,tone}`(위 줄 왼쪽부터 → 아래 줄)

## czvstep
`steps[2~5]{tag,title,sub,ev{value,label,note}}` · `evTitle`

## czrings
`core{title,sub}` · `rings[1~4]{tag,name,value,sub}`(안쪽부터)

## cznet
`nodes[{id,name,value,x,y(0~1),tone}]` · `edges[{from,to,w,bend}]` · `unit` · `dec` · `sizeKey` · `edgeKey`
