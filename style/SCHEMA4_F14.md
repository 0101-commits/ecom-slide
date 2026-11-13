# F14 인물 · 발언 + F16 구성 분해 부품(`style/parts/n_qtspeech.js` · `n_qtshare.js`) — 2차 목업
공통 칸은 `SCHEMA3.md` 2절. 본문 1168×512. 예제 = `style/demo4_r2_F14.json`(16장).

| 종류 | 쓰는 때 | 주요 칸 |
|---|---|---|
| `qtcard` 발언 카드 + 읽는 법 | 말 한 줄과 읽는 법 3줄 | `quote{text,mark,who,ctx,tags[]}` · `reads[3]{k,sig,t,tone}` · `readsTitle` |
| `qtmark` 발언 시각 세로선 | 사건 앞뒤 두 줄 반응 | `series[{name,data[],color,unit,sub,sub2}]` · `labels[]` · `at`(사건 칸 번호) · `span`(변화 폭 칸 수) · `xTicks[]` · `unit` · `beforeText` · `afterText` · `atText` |
| `qtscale` 성향 척도 점 | 위원 배치 · 지난번 → 이번 이동 | `members[{n,pos(0~1),prev,chair}]` · `zones[{a,b,name,tone}]` · `median` · `counts[{label,value,tone}]` · `left` · `right` · `moveText` |
| `qtnet` 관계도 | 사람(원) · 조직(상자) 사이 선 | `nodes[{id,name,sub,type:'org',x,y(0~1),tone}]` · `edges[{from,to,kind:'power|adv|tie|rival',text,dir,bend}]` · `legend{}` |
| `qtdiff` 문단 나란히 비교 | 지난 · 이번 성명 문단 | `old{title,paras[]}` · `new{…}`(`~~지운 말~~` · `++더한 말++`) · `stats[{label,value,sub,tone}]` |
| `qtcareer` 경력 연표 | 자리 막대 + 큰 결정 깃발 | `from` · `to`(연도) · `lanes[{name,bars[{from,to,label,sub,tone}]}]` · `decisions[{at,year,text}]` |
| `qtvote` 표결 표 | 위원 × 회의 칸(`y`·`n`·`a`) | `cols[{d,t}]` · `rows[{name,sub,votes[]}]` · 결과 줄은 저절로 셈 |
| `qtbubble` 말풍선 타임라인 | 발언 시간 순서 | `items[{t,who,text,sub,tone}]` 3~6개 |
| `qtsun` 2단 도넛 | 대분류 → 세부 | `groups[{name,value,color,items[{name,value}]}]` · `unit` · `dec` · `centerTitle` · `innerTitle` · `outerTitle` |
| `qtdonut2` 전후 도넛 쌍 | 구성 전 · 후 + 몫 변화 | `before{title,sub,center,items[]}` · `after{…}` · `colors{이름:색}` · `midTitle` |
| `qtstack100` 100% 누적 | 연도별 구성 + 이어짐 띠 | `names[]` · `cols[{label,parts{이름:값},hi}]` · `colors{}` · `legendTitle` |
| `qtexpand` 한 칸 펼침 막대 | 전체 막대 → 한 칸 확대 | `items[{name,value,parts[{name,value,sub}]}]` · `focus`(번호) · `focusTitle` · `unit` |
| `qtpack` 원 쌓기 | 규모를 원 크기로 | `items[{name,value,group}]` · `groups[{name}]` · `unit` · `sizeNote` |
| `qtcomp` 구성 + 증감 표 | 비중 막대 + 전년 증감 막대 | `groups[{title,total,rows[{name,sub,valueText,share(%),delta,deltaText,tone,dtone}]}]` · `cols{}` |
| `qtgauge` 반원 게이지 | 목표 대비 비중 | `gauges[{title,sub,value,max,target,targetText,unit,bad:'above|below',gapLabel,note1~3,dec}]` |
