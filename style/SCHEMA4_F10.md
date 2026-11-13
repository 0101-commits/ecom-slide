# F10 제도 · 용어 · 구조 새 부품(`style/parts/n_st*.js`) 칸 정리 — 엔진 3판

공통 칸은 `SCHEMA3.md` 2절. 본문 1168×512 를 SVG 로 그림. 공통 도움 `n_st0util.js`(`ECOM.stu`). 목업 : `library/mockups/v4/F10.json` · 시험 덱 `style/demo4_r1_F10.json` · 만들기 `tools/make_mockups4_F10.py`. 기존 `structure`(N107 · N114)는 칸 그대로 사용.

| 종류 | 쓰는 때 | 칸 |
|---|---|---|
| `stcalc` 계산 예시 칸 | 값이 연산을 거쳐 줄어드는 과정(원금 → 이자 → 세금 → 실수령) | `steps[{name,sub,value,dec,unit,op,how,tone}]` 3~5 · `split{title,unit,dec,items[{name,value,tone}]}` · `band` |
| `stbefore` 제도 전후 표 | 개편 전후, 바뀐 줄만 강조 | `cols{item,before,after}` · `rows[{item,before,after,changed}]` ≤7 · `summary` |
| `stproc` 절차 단계 | 신청 → 지급 같은 단계 + 소요일 + 되돌림 | `steps[{name,who,doc,days}]` ≤5 · `unit` · `back{from,to,text}` · `totalLabel` · `band` |
| `stscale` 표현 번역 척도 | 완곡한 표현 → 실제 기간 범위 | `phrases[{text,en,lo,hi,note}]` ≤6 · `unit` · `max` · `step` · `axisTitle` · `band` |
| `stbuild` 구성 쌓기 공식 | 합 = 부분 + 부분 식 + 달마다 쌓은 막대 | `eq[3]{name,sub,value,dec,unit}` · `chart{labels,a,b,unit,names[3],legendNeg,y{max,step},tickEvery}` · `band` |
| `stdecide` 해당 여부 나무 | 예 · 아니오 질문으로 대상 가르기 | `tree{q,yes,no}`(재귀, 끝은 `{out,sub,tone:'main|gray|warn'}`) · `yesLabel` · `noLabel` · `band` |
| `sttax` 세율 구간 계단 | 구간별 세율 + 예시 소득의 구간별 세금 | `brackets[{upTo(null=끝없음),rate}]` 5~7 · `income` · `cur` · `incomeLabel` · `band` |
| `stmap` 용어 관계 지도 | 가운데 용어 + 둘레 4 용어 + 쪼개는 두 식 | `center{name,sub,value,dec,unit}` · `nodes[4]` · `edges[4 글]` · `eqs[2]{title,text}` |
| `st3q` 무엇 · 왜 · 어떻게 | 정의 · 이유 · 방법 3칸(폭이 다름) | `panels[3]{q,title,text,type:'num|line|steps',num{value,dec,unit,label,rows[{k,v,warn}]},line{data,labels,unit,hiAt,hiText,lastText},steps[{t,s}]}` |
| `stcmp` 같은 돈 두 제도 | 같은 총액을 두 제도로 나눈 결과 비교 | `total{value,unit}` · `a{name,sub,items[{name,value,tone}]}` · `b{…}` · `dec` · `deltaText` · `band` |
