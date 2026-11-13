# F02 계열 새 부품 13종(`style/parts/n_dx*.js`, 머리글자 dx) 칸 정리 — 2차 목업 F02 두 지표 + F19 채권

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 채우고 오른쪽 시사점 칸은 없음. 숫자는 덱이 준 값만 그림(부품은 계산하지 않음, `dxgap` 의 역전 개월 수만 칸에서 센다).
시험 덱 : `style/demo4_r2_F02.json`(만들기 `tools/make_mockups4_F02.py`, 15장 = `library/mockups/v4/F02.json`). 공통 도움 = `n_dx0util.js`(`ECOM.dxu` : pill · path · runs · scale · grid · xaxis · placer · segBoxes).
없는 FRED 계열(DGS10 · DGS2 · DGS1MO · UNRATE · GGGDTA… · IRLTLT01…)은 만들기 스크립트가 받아 `data/snap4/<id>.json` 으로 저장.

| 종류 | 쓰는 때 | 파일 |
|---|---|---|
| `dxdual` 이중축 두 선 | 단위가 다른 두 지표를 왼쪽 · 오른쪽 축으로 겹쳐 방향만 봄 | n_dxline |
| `dxgap` 두 선 사이 칠 | 장기 − 단기처럼 두 선 사이 면, 부호 바뀌는 구간은 다른 색 + 개월 수 | n_dxline |
| `dxzero` 0 기준 한 줄 | 0 위 · 아래가 뜻이 다른 한 줄(금리차 · 상관) — 0 아래 칠 · 세로 띠 · 앞선 화살표 · 구간 띠 | n_dxline |
| `dxratio` 비율 선 + 평균 띠 | 두 가격의 비율 + 장기 평균 ±1표준편차 띠 + 오른쪽 역대 위치 막대 | n_dxline |
| `dxstack` 위아래 두 칸 | 같은 시간축에 서로 다른 눈금의 두 선을 위 · 아래 | n_dxline |
| `dxend` 끝 라벨 차이 화살표 | 두 나라 선 + 끝(과 처음) 값 차이를 화살표 · 큰 숫자로 | n_dxline |
| `dxdecomp` 쌓은 면 | 명목 = 실질 + 기대물가처럼 합을 쌓은 면 + 오른쪽 식 카드 | n_dxline |
| `dxpath` 연결 산점 | 두 지표 점을 해마다 이어 시간 경로(화살표 · 마지막 점 강조) | n_dxxy |
| `dxscat` 산점 + 추세선 | 나라별 산점 + 추세선 + 지금 점(강조) + 추세선과 차이 | n_dxxy |
| `dxquad` 4분면 경로 | 기준선 4분면 위 최근 몇 분기 이동 경로 | n_dxxy |
| `dxmat` 만기별 변화 세로 막대 | 만기마다 변화 막대(0 기준 위 · 아래) + 지금 금리 칩 + 단기 · 중기 · 장기 묶음 | n_dxbond |
| `dxauct` 입찰 결과 표 | 회차별 낙찰 금리 · 예상 대비 막대 · 응찰률 막대(평균 점선) · 판정 칩 | n_dxbond |
| `dxholder` 보유자 구성 | 쌓은 가로 막대 + 묶음 괄호 + 보유자별 카드(전후 점 두 개) | n_dxbond |

## dxdual
`labels` · `left{name,unit,data,dec,suf,color,y{min,max,step,dec,suf}}` · `right{…}`(`color` 기본 cmp) — 두 축의 눈금 칸 수(`(max−min)/step`)를 같게 해야 가로선이 맞음 · `ticks` · `xyear:true`(해 이름만) · `marks[{side:'left'|'right',at,text('\n'),pos:'above'|'below'|'left',dx}]` · `corr{text}` 위쪽 칩. 끝 값은 알약으로 저절로 표시.

## dxgap
`labels` · `a{name,data,color}`(위 기준 — 장기) · `b{name,data,color}` · `y{min,max,step,dec,unit,suf}` · `ticks` · `xyear` · `runMin`(이 개월 이상 역전만 이름, 기본 4) · `runText` · `runUnit` · `posName` · `negName`(왼쪽 위 범례). a<b 구간이 warn 색, 그 밖은 옅은 초록.

## dxzero
`labels` · `data` · `y{min,max,step,dec,unit,suf}` · `ticks` · `xyear` · `rmargin` · `posTone` · `negTone`(`'main'|'soft'|'warn'`) · `posFill:false`(0 위는 칠하지 않음) · `segColor:true`(선 자체를 부호별 색으로) · `bands[{from,to,name}]` 세로 회색 띠 + `bandName` · `runs{min,unit,prefix}` 0 아래 구간마다 개월 수 · `leads[{from,to,text}]` 앞선 화살표(앞 칸 번호 → 뒤 칸 번호) · `marks[{at,text,pos,tone,dx,dy}]` · `endbig{text}` 끝 알약 · `strip:true` 아래 구간 띠(부호 구간) · `posName` · `negName`.

## dxratio
`labels` · `data` · `mean` · `sd` · `meanText` · `bandText` · `y{min,max,step,dec,unit}` · `ticks` · `xyear` · `rangeMin` · `rangeMax`(오른쪽 막대 범위) · `dec` · `stripTitle` · `pctl{text,sub}` 지금 값 아래 설명 · `marks[…]`. 평균 ±1표준편차 밖의 달은 작은 점(위 warn · 아래 초록).

## dxstack
`labels` · `top{name,unit,data,dec,suf,y{min,max,step,dec,suf},color,area}` · `bottom{…}` · `ticks` · `xyear` · `bands[{from,to,name}]` 두 칸을 가로지르는 띠 · `link{text}` 두 칸 사이 가운데 칩 · `marks[{panel:0|1,at,text,pos,dx}]`.

## dxend
`labels` · `a{name,data,color}` · `b{…}` · `y{…}` · `ticks` · `xyear` · `diff{text,sub}` 오른쪽 차이 상자(끝 두 값 사이 양쪽 화살표) · `start{at,y(값),text}` 처음 차이 화살표 + 알약(`y` 는 알약을 놓을 값 높이).

## dxdecomp
`labels` · `real[]` · `be[]`(명목 = 합 — 부품이 더해 그림) · `y{…}` · `ticks` · `xyear` · `names[{at,kind:'real'|'be',text}]` 면 안 이름 · `marks[{s:'real'|'nom',at,text,pos,tone}]`. 오른쪽에 명목 · 실질 · 기대물가 카드와 = · + 칩.

## dxpath · dxquad 공통
`points[{label,x,y}]`(차례대로 이어짐, 처음은 속 빈 점 · 마지막은 큰 진한 점) · `x{title,min,max,step,dec,suf}` · `y{…}` · 글은 점 둘레에서 겹치지 않는 곳을 찾아 놓임(선 위 · 알약 피함).
- `dxpath` : `refx{v,label}` · `refy{v,label}` 기준 점선 · `notes[{at,text,dx,dy,tone}]` 점 옆 알약.
- `dxquad` : `x.pivot` · `y.pivot` 4분면 기준선 · `names[4]{t,s}`(왼쪽 위 · 오른쪽 위 · 왼쪽 아래 · 오른쪽 아래) · `tones[4]`(`'warn'|'main'|'soft'`, 칸 색).

## dxscat
`points[{label,x,y,now}]`(`now` 한 점 강조 — 점 · 이름 큼 · warn 색 + 추세선까지 세로 점선) · `x` · `y` · `trend{a,b,from,to,text}`(y = a + b·x, 실제 값은 덱이 줌) · `callout{big,sub,x,y}` 큰 숫자 상자.

## dxmat
`mats[글자]` · `values[]`(막대 값) · `levels[]`(지금 금리 칩) · `caption`(차트 위 제목, 예전 `title` 도 읽음) · `y{min,max,step,dec,suf}` · `dec` · `avgText` · `maxText` · `groups[{from,to,name,value}]` 아래 괄호 묶음. 가장 큰 변화 막대는 진하게 + 알약.

## dxauct
`rows[{name,size,yield,tail,btc,verdict{text,tone:'good'|'mid'|'bad'}}]`(2~6줄) · `heads[6]` · `sizeUnit` · `btcAvg`(응찰률 평균 점선) · `tailMax` · `btcMax`. 예상 대비 + 는 warn 막대.

## dxholder
`parts[{name,share,prev,sub}]`(왼쪽부터 쌓임, 2~7개) · `heads['5년 전','지금']` · `groups[{from,to,name,value}]` 위 괄호. 카드마다 큰 비중 + ▲▼ 칩 + 전후 점 두 개.
