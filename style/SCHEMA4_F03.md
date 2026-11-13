# F03 막대 · 크기 비교 새 부품(`style/parts/n_br*.js`) 칸 정리

공통 칸은 `SCHEMA3.md` 2절 그대로. 본문 1168×512 를 꽉 채움. 숫자는 덱을 만드는 쪽이 계산해 넣음. 시험 덱 : `style/demo4_r1_F03.json`(목업 14장, 만들기 `tools/make_mockups4_F03.py`).

| 종류 | 쓰는 때 | 모양 |
|---|---|---|
| `brdumb` 아령 막대 | 같은 대상의 앞 · 뒤 두 값(1년 전 vs 지금) | 빈 점 · 찬 점을 잇는 가는 막대 + 오른쪽 변화 칸 |
| `brbubble` 면적 그림 | 크기 차이가 큰 값을 넓이로 | 원 넓이 = 값, 가로로 나란히 |
| `brprog` 진행률 막대 | 분자 ÷ 분모 달성 정도 | 긴 트랙 + 채움 + 오른쪽 큰 % |
| `brdiv` 발산 막대 | 0 기준 오름 · 내림 | 가운데 세로선, 오른쪽 + · 왼쪽 − |
| `brrange` 범위 막대 | 최저~최고 안 지금 위치 | 같은 길이 띠 + 지금 점 + 최고 대비 % |
| `brgroup` 그룹 막대 | 묶음별 계열 2~4개 + 평균 | 세로 그룹 막대 + 점선 평균 |
| `brstack` 연도별 누적 | 해마다 항목 쌓기 + 합계 | 세로 누적 막대, 위에 합계 숫자 |
| `brlolli` 롤리팝 긴 순위 | 12~24개 순위 | 가는 줄 + 끝 점, 2열 |
| `brbullet` 불릿 | 목표 대비 실적 | 3단 구간 띠 + 실적 막대 + 목표 눈금 |
| `brtorn` 토네이도 | 두 값 좌우 맞대기 | 가운데 이름 칸, 왼쪽 · 오른쪽 막대 |
| `brshare` 몫 꼬리표 | 점유율 순위 | 막대 끝 % 꼬리표 + 위 N 개 묶음 괄호 |
| `brico` 아이콘 세기 | 개수 | 같은 그림을 개수만큼(1개 = per) |
| `brmeko` 마리메코 | 크기 × 몫 | 열 폭 = 크기, 높이 = 몫 |

압도 차이(N038)는 기존 `gapbar` 칸만 바꿔 씀.

## 칸
- `brdumb` : `rows[{label,a,b}]` 3~10 · `aName` · `bName` · `unit` · `dec` · `dunit`(변화 단위) · `sort('b'|'diff')`
- `brbubble` : `items[{name,value,sub}]` 3~7 · `unit` · `dec` · `hero` · `note`(false 면 아래 줄 뺌)
- `brprog` : `rows[{label,done,total,tone('warn')}]` 3~7 · `unit` · `dec` · `pdec`
- `brdiv` : `rows[{label,value}]` 4~14(값 큰 순 자동 정렬, `sort:false` 면 입력 순서) · `unit` · `dec` · `posName` · `negName`
- `brrange` : `rows[{label,lo,hi,now,unit,dec}]` 3~9 · `loName` · `hiName` · `posName`
- `brgroup` : `groups[{name,vals[]}]` 2~7 · `names[]`(범례) · `unit` · `dec` · `avg{value,label}`(없으면 마지막 계열 평균) · `y{min,max}`
- `brstack` : `cols[{label,parts[]}]` 3~12 · `names[]`(아래부터 쌓는 순서) · `unit` · `dec` · `totalName` · `hi`(강조 막대 번호, 기본 마지막)
- `brlolli` : `rows[{label,value}]` 12~24 · `unit` · `dec` · `hero`(위 N개 진하게, 기본 3) · `cols`(1|2) · `rank`(번호)
- `brbullet` : `rows[{label,actual,target,max,unit,sub}]` 3~6 · `bands`(경계 비율, 기본 [.6,.85,1]) · `dec`
- `brtorn` : `rows[{label,left,right}]` 4~10 · `leftName` · `rightName` · `unit` · `dec` · `sort('sum')`
- `brshare` : `rows[{label,value,sub}]` 3~8(값 큰 순 자동) · `dec` · `top`(괄호로 묶을 위 개수, 기본 3, 0 이면 없음) · `topName`
- `brico` : `rows[{label,n,sub}]` 3~6 · `icon('tower'|'ship'|'dot'|'box')` · `per`(아이콘 1개 = 몇) · `unit` · `hero`
- `brmeko` : `cols[{name,size,parts[%]}]` 2~5 · `names[]`(위 칸부터) · `sizeUnit` · `dec` · `hero`
