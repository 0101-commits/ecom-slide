# 도식 부품 2차(`style/parts/l_*.js`) 칸 정리 — 엔진 3판

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `beats` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 안에 그리고, 숫자는 덱이 준 값만 쓴다.
주의 : 장 공통 `links`(오른쪽 위 고리)와 겹치지 않도록 산키 연결은 `flows`, 구조도 연결은 `edges` 로 부른다.
시험 덱 : `style/demo4_diagrams.json`(종류마다 2장).

| 종류 | 쓰는 때 | 바뀜(`beats`) |
|---|---|---|
| `sankey` 산키 | 들어오는 돈 · 물량이 어디로 쓰이는지(예산 · 수지 · 수출입) | 없음 |
| `scentree` 시나리오 나무 | 한 사건이 갈래로 나뉘고 갈래마다 결과 숫자가 다름(판결 · 결정 · 협상) | 없음 |
| `structure` 주체 관계 구조도 | 주체 사이 돈 · 일 · 보증이 오가는 구조, 지분 구조도 | 없음 |
| `chain` 단계 가치사슬 | 단계별로 누가 얼마를 쥐었는지, 병목이 어디인지 | 없음 |

## sankey — 산키(견본 06)
- `left{items:[{name,value,tone}]}` · `right{items:[…]}` · `unit`('조 달러') · `dec`(기본 1)
- `mid{label,sub}` 있으면 왼쪽 → 가운데 기둥 → 오른쪽, 없으면 왼쪽 → 오른쪽 바로. 바로일 때 `flows[{from,to,value}]`(칸 번호 0부터)를 주면 그대로, 안 주면 양쪽 크기대로 나눔
- `tone` = `warn`(나쁜 뜻 · 주황) 또는 색 이름(main g65 g40 g18 gray), 없으면 차례대로. 띠 높이 44px 미만이면 이름과 값을 한 줄로
- `note{title,lines:[…],tone:'warn'}` 오른쪽 위 작은 메모 상자(선택)
- 움직임 : 왼쪽 기둥 → 왼쪽 띠 → 가운데 기둥 + 이름 → 오른쪽 띠 → 오른쪽 기둥 + 꼬리표 → 메모

## scentree — 시나리오 나무(견본 08)
- `root{title,sub}` · `branches[2~4]{name,sub,p(%),hi,outcomes:[{k,v}(2~3)]}`
- 2단 : 갈래에 `children[2~3]{name,sub,p(갈래 안 몫 %),hi,outcomes}` 를 주면 갈래 → 다시 갈래 → 결과
- 선 굵기 = `p`. 강조(굵은 짙은 선 · 테두리 · 연한 초록 결과 칸) = 끝 갈래 중 가능성(1단은 `p`, 2단은 곱)이 가장 큰 쪽 길, 또는 `hi:true`
- `heads{branch,sub,out}` 열 머리 글 · `legend`(기본 「선 굵기 = 가능성」, `false` 면 없음). 결과 값 `v` 는 단위까지 든 글자
- 움직임 : 뿌리 → 갈래 선 그리기 + 상자 → (둘째 갈래) → 결과 선 → 결과 칸 → 머리 글

## structure — 주체 관계 구조도(견본 13)
- `center{title,sub}` 가운데 짙은 상자 · `nodes[3~6]{id,title,sub,tone}` 둘레 상자 — 자리는 순서대로 왼위 · 오른위 · 오른아래 · 왼아래 · (5번째)위 가운데 · (6번째)아래 가운데(3개면 왼위 · 오른위 · 아래 가운데)
- `edges[{from,to,kind:'money|work|guarantee',text}]` — `from` · `to` 는 `id`(가운데는 `center`). 돈 = 초록 실선, 일 · 비용 = 회색 실선, 보증 = 회색 점선. 같은 두 상자 사이 선이 둘이면 나란히
- `legend{money,work,guarantee}` 범례 글 바꾸기(쓴 종류만 왼쪽 아래에 나옴)
- `order{title,warnFrom,items[≤5]:{t,s}}` 오른쪽 「번지는 순서」 번호 목록(선택, `warnFrom` 번호부터 주황)
- 지분 구조도 : 상자에 `col` · `row`(0부터)를 주면 격자 자리, `center` 없이 써도 됨(지주 상자는 `tone:'dark'`). 선 글자에 `65%`, 범례에 `{work:'지분율(%)'}`
- 움직임 : 가운데 상자 → 주체 상자 하나씩 → 선 그리기(점선은 나타남) + 화살촉 · 이름 → 범례 → 번지는 순서

## chain — 단계 가치사슬(견본 07)
- `stages[4~6]{name,sub,neck,shares:[{name,value,tone}] | firms:[{name,value}]}` — `shares` 는 단계마다 합 100 안팎(세로 막대), `firms`(2~3개, `value` 는 글자 그대로)는 대표 기업 카드
- `neck:true` = 짙은 단계 + 칩(`neckChip`, 기본 「병목」) · `unit`(기본 `%`) · `shareTitle`(막대 아래 작은 글, 예 「세계 몫」) · `colors{이름:색 이름}`(없으면 많이 나온 이름부터 색을 배정, 「그 밖」은 연한 회색)
- `concl` 아래 결론 띠 한 줄(`**굵게**`)
- 움직임 : 단계가 왼쪽부터 → 몫 막대 자람 + 꼬리표(기업 카드는 위에서 올라옴) → 병목 칩 → 결론 띠
