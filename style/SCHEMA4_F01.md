# F01 계열 새 부품(`style/parts/n_lnline.js` · `n_lnnarr.js`, 머리글자 ln) 칸 정리

공통 칸(`kind` · `eyebrow` · `head` · `foot` · `transition` · `note`)은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 채우고 오른쪽 시사점 칸은 없음. 숫자는 덱이 준 값만 그림.
시험 덱 : `style/demo4_r1_F01.json`(만들기 `tools/make_mockups4_F01.py`, 25장 = `library/mockups/v4/F01.json`).

| 종류 | 쓰는 때 |
|---|---|
| `lnband` 범위 띠 + 올해 선 | 지난 몇 해 최저 · 최고 띠 안에 올해 선(같은 달끼리 12칸) |
| `lnfill` 기준선 위아래 칠 | 목표 · 0 · 평균선 위는 진하게, 아래는 옅게 |
| `lnlog` 로그 눈금 + 시대 띠 | 수십 년 · 100년 선, 배수 비교, 시대 구분 띠 |
| `lnproj` 점선 예상 | 실제 선 + 추세 연장 점선 + 닿는 시점 표시 |
| `lnidx` 기준 100 지수 선 | 서로 단위가 다른 가격을 같은 날 100으로 맞춰 비교 |
| `lnbars` 선 + 아래 막대 | 위는 수준 선(면), 아래는 증감 막대(음수 회색) |
| `lndd` 낙폭 면 | 고점 대비 %(0 아래로 잠긴 면) + 깊은 저점 표시 |
| `lnlag` 시차 당긴 선 | 한 선을 몇 달 밀어 다른 선과 겹쳐 보기, 가로 시차 화살표 |
| `lnma` 이동평균 교차 | 원선 + 두 이동평균, 교차점 표시 |
| `lnend` 끝점 큰 숫자 | 선 끝에 지금 값을 크게 |
| `lnarrow` 구간 화살표 | 두 점을 잇는 화살표 + 수익률 칩 |
| `lnmirror` 거울 선 | 둘째 선을 0 아래로 뒤집어 같은 축에 마주 보기(눈금은 절댓값) |
| `lnyears` 해마다 겹친 선 | x = 1~12월, 해마다 한 줄, 올해만 굵게 |
| `lnfan` 부채꼴 | 실제 선 뒤로 벌어지는 범위(`band` 에 앞부분 null) |
| `lncards` 사례 카드 연표 | 사례 3~6개를 위 연표 막대 + 카드로 |
| `lnpair` 짝 도식 | 지금 ↔ 옛 사건 2~4쌍 + 가운데 닮은 점 칩 |
| `lnring` 순환 원 | 두 호(확장 · 침체) 고리 위 지금 위치 + 오른쪽 막대 목록 |

## lnline 계열(`lnband` `lnfill` `lnlog` `lnproj` `lnidx` `lnbars` `lndd` `lnlag` `lnma` `lnend` `lnarrow` `lnmirror` `lnyears` `lnfan` 모두 같은 칸)
- `labels` · `series[{name,data(null 가능),color,dash,width,area,areaTo,areaColor,dot,nameColor}]` · `unit` · `dec` · `y{min,max,step,dec,suf,unit,ticks}` · `ticks`(x 눈금 번호) · `xwant` · `xraw:true`(라벨을 줄이지 않고 그대로) · `rmargin`(오른쪽 여백, 끝 이름 자리) · `endNames`(기본 이름 있으면 선 끝에 표시)
- `log:true` — 세로 눈금이 로그, `y.ticks` 로 눈금 값을 직접 줌(`y.min` · `y.max` 도)
- `band{lo[],hi[],name,nameY,tone:'main'|'soft'}` 위아래 범위 띠(null 인 칸은 건너뜀 → 부채꼴) · `fill{s,ref,upName,downName,upColor,downColor}` 선과 기준값 사이 칠(위 진하게 · 아래 옅게) · `ref{v,label}` 가로 기준선
- `eras[{from,to,name,tone:'main'|'soft'|'warn'}]` 세로 띠 · `vlines[{at,text,tone,y}]` 세로 점선 + 위 칩
- `marks[{at,s,text('\n' 줄바꿈),pos:'above'|'below',tone,dx,dy,anchor,hollow,size}]` 강조 점 · `arrows[{from,to,s,text,sub,tone:'main'|'warn',dx,dy}]` 두 점 잇는 화살표 · `shift{from,to,s,text,y}` 가로 당김 화살표
- `bars{name,unit,data,dec,suf,y{min,max,n}}` 아래 막대 칸(선 칸이 줄어듦) · `mirror:true` 둘째 선을 음수로 뒤집어 그림 · `endbig{s,text,sub}` 오른쪽 큰 숫자
- 움직임 : 축 · 띠 → 범위 · 칠 → 선 그리기 → 이름 → 세로선 · 화살표 → 강조 점 → 끝 숫자

## lncards — 사례 카드 연표
`axis{from,to,step}`(연 소수) · `axisTitle` · `cards[3~6]{start,end,title,big{value,unit},label,rows[{k,v}] 최대 4,hi}` — 위 연표에 기간 막대(`start`~`end` 소수 연도)가 찍히고 점선이 카드로 이어짐. `hi` 카드는 warn 색(가장 최근 · 가장 나쁜 사례).

## lnpair — 짝 도식
`heads[왼쪽,오른쪽]` · `pairs[2~4]{link('\n' 줄바꿈 가능),now{title,value,sub},old{title,value,sub}}` — 왼쪽 카드 = 지금(초록), 오른쪽 = 옛 사건(회색), 가운데 칩이 닮은 점.

## lnring — 순환 원
`center{title,sub}` · `arcs[2]{name,value,sub,tone:'good'|'bad'}`(호 길이 = value 비율, 첫 호 12시부터) · `now{at(0~1, 첫 호 안 위치),label,sub}` · `side{title,unit,dec,bars[{label,value,hi,bad}]}` 오른쪽 막대 목록.
