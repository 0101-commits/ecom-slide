# F04 예상 vs 실제 · 발표 + F18 순위 · 숫자 새 부품(`style/parts/n_xp*.js`) 칸 정리

공통 칸은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채움. 숫자는 덱을 만드는 쪽이 계산해 넣음. 시험 덱 : `style/demo4_r2_F04.json`(목업 15장, 만들기 `tools/make_mockups4_F04.py`). 기대치(컨센서스)는 공개 무료 자료가 없어 「직전 3개월 평균」을 기준으로 씀.
파일 : `n_xpbar.js`(xprow · xpdots · xpwatch · xptable · xpqa) · `n_xpmkt.js`(xpmin · xpdot · xpprob · xpsched · xpband) · `n_xpnum.js`(xpbump · xpbig · xpcards · xprank10 · xpratio). 공통 도움 `ECOM.xp`(부호 · 칩 · 판정).

| 종류 | 쓰는 때 | 모양 |
|---|---|---|
| `xprow` | 발표치를 기준 · 이전값과 맞대기 | 가로 줄: 발표 막대 + 기준 눈금 + 이전 점 + 기준 대비 차이 + 판정 칩 |
| `xpdots` | 발표 − 기준 차이를 회차마다 | 0선 위 · 아래 점과 줄기 + 평균선 + 상회 · 하회 횟수 칸 |
| `xpwatch` | 다음 발표 관전 포인트 | 카드 3장: 볼 숫자 + 기준 게이지 + 읽는 방향(▲ ▼) |
| `xptable` | 여러 지표 결과 한꺼번에 | 표 + 기준 대비 % 발산 막대 + 상회 · 부합 · 하회 칩 |
| `xpqa` | 질문 → 답 → 근거 숫자 | 3~4줄 Q 상자 → A 상자 → 짙은 숫자 칸 |
| `xpmin` | 발표 전후 시장 움직임 | 선 두 칸 + 발표일 세로선 + 전날 점선 + 변화 큰 글자 |
| `xpdot` | 점도표(위원별 점) | 지난번 · 이번 점 기둥 + 중앙값 + 수준별 인원 변화 막대 |
| `xpprob` | 확률 분포 전 · 후 | 쌓기 막대 두 개를 같은 색 리본으로 이음 + 변화 %p |
| `xpsched` | 이번 주 발표 일정 | 세로 시간 줄 + 발표 카드 + 중요도 점 3개 |
| `xpband` | 발표치 구간별 시장 방향 | 구간 행 × 시장 열, 칸마다 ▲ ▼ + 값 |
| `xpbump` | 해마다 순위 변동 | 범프 차트(S 자 선) + 순위 번호 원 + 끝 수익률 |
| `xpbig` | 큰 숫자 하나 + 비교 | 짙은 초록 큰 숫자 칸 + 기준점 막대 + 비교 문장 |
| `xpcards` | 지표 6개 현재값 + 추이 | 카드 3×2 : 값 · 1년 전 대비 칩 · 미니 선 |
| `xprank10` | 상위 10 + 순위 이동 | 표: 순위 · ▲▼ 이동 · 이름 · 막대 · 지난 순위 |
| `xpratio` | 1 : N 비율 | 작은 쪽 1칸 + 큰 쪽 N 칸 격자 + 과거 비율 칩 |

## 칸
- `xprow` : `rows[{label,sub,actual,base,prev,dec,unit,tol,dunit,verdict}]` 3~5개 · `baseName` · `prevName` · `dunit` — 판정은 `|발표 − 기준| ≤ tol` 이면 부합(`verdict` 로 덮어쓰기 가능)
- `xpdots` : `points[{label,value}]` 6~14개 · `unit` · `dec` · `axisName` · `baseName` · `stats:false`(아래 칸 뺌) · `tiles[{label,value,sub}]`(아래 칸 3개 덮어쓰기)
- `xpwatch` : `cards[{name,date,watch{label,value,unit,dec},ref{label,value},min,max,up{cond,read},down{cond,read}}]` 3장
- `xptable` : `rows[{label,sub,actual,base,dec,unit,tol,verdict}]` 4~8개 · `cols[머리글 5개]` · `baseName`
- `xpqa` : `items[{q,a,num{value,unit,dec,label}}]` 3~4개
- `xpmin` : `panels[{name,sub,pts[[라벨,값]],at(발표 점 번호),dec,unit,delta,deltaSub,foot}]` 2칸 · `event{label,sub}`
- `xpdot` : `cols[{name,counts{'3.25':명수,…}}]` 2칸 · `lo` · `hi` · `step` · `who` — 중앙값은 부품이 계산(합계 홀수일 때 가운데 점)
- `xpprob` : `cats[{name,before,now}]` 3~5개(합계 100) · `beforeName` · `nowName` · `unit`
- `xpsched` : `items[{time,day,name,sub,imp(1~3)}]` 4~7개 · `railName`
- `xpband` : `cols[{name,unit,dec}]` 2~4개 · `rows[{band,sub,vals[]}]` 4~6개(위 = 크게 하회) · `scaleName`
- `xpbump` : `years[]` · `series[{name,ranks[],end,hero,color}]` 4~8개 · `endHead` · `topName` — 순위 1 이 위
- `xpbig` : `big{value,dec,unit,label,sub}` · `refs[{label,value,sub,now}]` 2~5개 · `refHead` · `unit` · `dec` · `line`(비교 문장)
- `xpcards` : `cards[{name,sub,value,dec,unit,delta,up(true|false),trend[],from,to}]` 4~6장(3열)
- `xprank10` : `rows[{name,value,prev(지난 순위 번호, null 이면 신규)}]` 값 큰 순 10개 · `unit` · `dec` · `valHead` · `prevHead`
- `xpratio` : `small{label,value,unit,dec,sub}` · `big{label,value,unit,dec}` · `n`(큰 쪽 칸 수) · `refs[{label,text}]` 1~4개
