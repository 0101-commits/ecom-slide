# F13 시나리오 · F17 찬반 · F15 나라 비교 부품 2차(`style/parts/n_sc*.js`) 칸 정리 — 엔진 3판

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `beats` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 채우고 숫자는 덱이 준 값만 쓴다(평균 · 몫 · 중앙값 · 과반은 부품이 계산).
공통 도움 `n_sc0util.js` = `ECOM.sc`(fit · mix · ramp · chip · wrapT · uid). 시험 덱 : `style/demo4_r2_F13.json`(19장), 목업 `library/mockups/v4/F13.json`.

| 종류 | 쓰는 때 | 바뀜 |
|---|---|---|
| `scicicle` 확률 쌓기 나무 | 갈래 폭 = 가능성, 끝 갈래 결과 숫자 + 확률 가중 평균 | 없음 |
| `sccol3` 시나리오 3칸 | 기본 · 낙관 · 비관 조건 · 숫자 · 확률 | 없음 |
| `scfan` 경로 갈라짐 선 | 실제 지난 선이 지금에서 시나리오별 선으로 갈라짐 | 없음 |
| `scmatrix` 결정 매트릭스 | 행동 × 상황 결과 · 기대값 · 최악 | 없음 |
| `scgrid` 민감도 격자 | 두 변수 바꾼 결과를 칸 색으로 + 경계선 | 없음 |
| `scfork` 갈림길 + 신호 지표 | 두 길 + 미리 볼 지표 게이지 | 없음 |
| `scshift` 확률 전후 쌓기 | 사건 전 · 후 100% 기둥을 띠로 이음 | 없음 |
| `scpayoff` 손익 꺾인 선 | 가격별 손익 꺾은선 · 손익분기 | 없음 |
| `scstake` 이해관계자 표 | 주체별 얻는 것 · 잃는 것 · 순 영향 막대 | 없음 |
| `scaxis` 쟁점 축 | 두 주장 사이 인물 점 + 중앙값 | 없음 |
| `scscore` 쟁점별 점수 표 | 쟁점마다 찬 · 반 근거 세기(나비 모양) | 없음 |
| `scseat` 의석 반원 | 정당별 좌석 + 과반선 + 연합 합계 | 없음 |
| `scissue` 쟁점 나무 | 쟁점 → 찬성 · 반대 논거 → 반론 | 없음 |
| `sccard` 나라 카드 격자 | 나라마다 숫자 셋 + 작은 선 | 없음 |
| `scrank` 세로 기둥 순위 | 값 순 기둥 + 강조 나라 기준선 · 차이 꼬리표 | 없음 |
| `scscatter` 나라 산점 | 가로 한 해 전 · 세로 지금, 달마다 궤적 + 대각선 | 없음 |
| `scheat` 나라 × 지표 색 표 | 열마다 높낮이 색 + 순위 | 없음 |
| `scradar` 레이더 + 값 표 | 항목 5~6개에 나라 2~3개 겹침 + 실제 값 표 | 없음 |
| `scshare` 100% 기둥 + 이어진 띠 | 해마다 몫이 바뀌는 흐름 | 없음 |

## scicicle
`root{title,sub}` · `level1[≤4]{name,p(%),children[≤3]:{name,p(갈래 안 %),v(숫자)}}` · `unit` · `dec` · `resTitle` · `expText`. 곱한 가능성이 가장 큰 끝 갈래 강조, 결과 분포 축에 원(크기 = 가능성)과 확률 가중 평균 표시.
## sccol3
`cases[2~3]{name,p,tone('main'|'g65'|'g40'|'warn'),cond[≤3],stats[≤3]:{k,v}}` · `condTitle` · `statTitle`. 위 100% 한 줄 폭 = 가능성.
## scfan
`hist{labels,data}` · `fut{labels,paths[≤4]:{name,sub,p,tone,data}}` · `y{min,max,step,dec,unit,title}` · `avg`(가중 평균 점선) · `nowText` · `zoneText` · `xticks`.
## scmatrix
`actions[≤4]{name,sub}` · `states[≤4]{name,sub,p}` · `cells[행동][상황]` · `unit` · `dec` · `expTitle` · `worstTitle`. 음수 칸 주황, 상황별 최선 굵은 테두리, 평균 최고 줄 짙게.
## scgrid
`xs` · `ys`(칸 이름 글자) · `data[세로][가로]` · `xTitle` · `yTitle` · `dec` · `suf` · `base{xi,yi,label}` · `thr{v,label}`(이상 = 주황 경계선) · `side{title,rows[{k,v,warn}],note}`.
## scfork
`now{label,sub}` · `forks[2]{name,sub,p,tone,short}` · `signals[≤4]{name,src,value,unit,dec,lo,hi,thr,thrLabel,badSide('below'|'above')}`. 값이 badSide 쪽이면 둘째 길 꼬리표.
## scshift
`before{title,sub}` · `after{…}` · `items[≤5]{name,a,b,tone}`(합 100) · `unit` · `dunit` · `dec` · `event{text}`.
## scpayoff
`x{min,max,step,title,dec}` · `y{min,max,step,unit,dec}` · `pts[[x,y]…]` · `marks[{type:'now'|'be'|'kink',x,y,label,sub,dx,dy,anchor}]` · `box{title,x,y,rows[{k,v,warn}]}` · `zones[{x,y,text,anchor,warn}]`.
## scstake
`rows[≤7]{name,sub,gain,loss,net}` · `scale{min,max,unit}` · `titles{gain,loss,net}`.
## scaxis
`left{title,lines[≤3]}` · `right{…}` · `people[{name,pos(0~100),group(0|1)}]` · `groups[이름 2개]` · `ends{left,mid,right}` · `medianText`.
## scscore
`rows[≤7]{name,sub,pro,con}` · `max`(기본 5) · `proName` · `conName` · `tieText`. 아래 합계 줄은 부품이 계산.
## scseat
`parties[≤7]{name,seats,tone}` · `unit` · `caption`(가운데 합계 글, 예전 `title` 도 읽음) · `sub` · `majorityText` · `coalitions[{name,idx[정당 번호]}]`.
## scissue
`q{title,sub}` · `pro{title,items[≤3]:{t,r,w(1~3)}}` · `con{…}` · `strengthText`.
## sccard
`cards[2~4]{name,sub,hi,metrics[≤3]:{k,v,dec,unit,sign,delta:{text,dir}},spark:{data,title,lo,hi,dec,unit,first,last}}`. 4장이면 2×2.
## scrank
`rows[3~6]{name,value,hi}` · `unit` · `dec` · `dunit` · `sign` · `baseText` · `rankText`. 값 큰 순서로 정렬, 강조 나라 높이에 점선.
## scscatter
`x{min,max,step,title,dec}` · `y{…}` · `series[≤5]{name,tone,hi,pts[[x,y]…]}` · `diag{up,down}` · `suf` · `side{title,rows}`.
## scheat
`cols[3~6]{name,sub,unit,dec,dir('up'|'down'),sign,data}` · `rows[2~6]{name,sub,hi}` · `sign` · `rankText`.
## scradar
`axes[3~6]{name,sub}` · `series[≤3]{name,tone,vals[0~100],raw[글자]}` · `ringText[2]` · `tableTitle`.
## scshare
`years[]` · `items[≤6]{name,tone,hi,data}`(해마다 합 100, 아래에서 위로 쌓음) · `unit` · `dunit` · `dec`.
