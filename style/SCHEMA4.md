# 부품 4판 칸 정리 — 색인

엔진 3판에 더한 부품(목업 4판용). 공통 칸 · 규칙은 `SCHEMA3.md` 2절 · 5절 그대로이고, kind 마다 받는 칸은 아래 문서에 있다.
새 부품 파일 = `style/parts/l_*.js`(1단계 14종 + 지도 자료 `l_geo.js`, Natural Earth 공개 자료) · `style/parts/n_*.js`(계열별, kind 이름 머리글자로 묶음).

| 문서 | 묶음 | kind |
|---|---|---|
| `SCHEMA4_lines.md` | 1단계 · 선 | curve · events · overlay |
| `SCHEMA4_bars.md` | 1단계 · 막대 | expect · firms · gapbar · treemap |
| `SCHEMA4_diagrams.md` | 1단계 · 도식 | chain · sankey · scentree · structure |
| `SCHEMA4_mapq.md` | 1단계 · 지도 · 문구 · 배관 | map · pipe · quote |
| `SCHEMA4_F01.md` | F01 선 · F09 역사 | lnarrow · lnband · lnbars · lncards · lndd · lnend · lnfan · lnfill · lnidx · lnlag · lnline · lnlog · lnma · lnmirror · lnpair · lnproj · lnring · lnyears |
| `SCHEMA4_F03.md` | F03 막대 | brbubble · brbullet · brdiv · brdumb · brgroup · brico · brlolli · brmeko · brprog · brrange · brshare · brstack · brtorn |
| `SCHEMA4_F05.md` | F05 인과 | czchain · czdomino · czfan · czfish · czloop · cznet · czrings · czvstep |
| `SCHEMA4_F07.md` | F07 지도 | mpduo · mprank · mptile |
| `SCHEMA4_F08.md` | F08 타임라인 | tlbill · tlcards · tlclock · tlcount · tleras · tlgantt · tlmile · tlpar · tlterm · tlvert · tlzoom |
| `SCHEMA4_F10.md` | F10 구조 | st3q · stbefore · stbuild · stcalc · stcmp · stdecide · stmap · stproc · stscale · sttax |
| `SCHEMA4_F02.md` | F02 두 지표 · F19 채권 | dxauct · dxdecomp · dxdual · dxend · dxgap · dxholder · dxmat · dxpath · dxquad · dxratio · dxscat · dxstack · dxzero |
| `SCHEMA4_F04.md` | F04 발표 · F18 순위 | xpband · xpbig · xpbump · xpcards · xpdot · xpdots · xpmin · xpprob · xpqa · xprank10 · xpratio · xprow · xpsched · xptable · xpwatch |
| `SCHEMA4_F06.md` | F06 돈 흐름 · F12 공급망 | mfbom · mfbook · mfchord · mfdays · mfdep · mfexch · mffunnel · mflev · mfneck · mfring · mfroute · mfshift · mfsmap · mftank · mfvalue · mfvert · mfzig |
| `SCHEMA4_F11.md` | F11 기업 | cobacklog · cocards · cochain · cocust · codonuts · comirror · copos · coscore · cotbl · cotimeline · cotreemap · coval |
| `SCHEMA4_F13.md` | F13 시나리오 · F17 찬반 · F15 나라 | scaxis · sccard · sccol3 · scfan · scfork · scgrid · scheat · scicicle · scissue · scmatrix · scpayoff · scradar · scrank · scscatter · scscore · scseat · scshare · scshift · scstake |
| `SCHEMA4_F14.md` | F14 발언 · F16 구성 | qtbubble · qtcard · qtcareer · qtcomp · qtdiff · qtdonut2 · qtexpand · qtgauge · qtmark · qtnet · qtpack · qtscale · qtstack100 · qtsun · qtvote |

모두 168개 kind. 목업으로 고르는 법은 `rules/mockup_map.md`.
