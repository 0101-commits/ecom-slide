---
name: ecom-slide
description: ECOM 경제 스터디 발표를 HTML 파일 하나로 만든다(엔진 3판) — 주제 · 회차 · 자료를 받아 작성하는 날의 최신 숫자(열쇠 없이) → 질문 카드(본문 장 수 · 표지 5종 · 깊이 · 토의) → 이야기 계획표(확인 1번) → Kick-off · CW44 짜임(꼬리표 · 헤드메시지 2줄 · 꽉 찬 주석 차트 · 도식, 왼쪽 아래 각주 · 오른쪽 아래 로고)으로 장 만들기 → 자동 쌓기 · 장 넘김 8종 → 겹침 · 넘침 · 채움 점검 → 파일 하나. 「ECOM 발표 만들어」 「CW49 고용지표 발표 자료」 「경제 스터디 장표」처럼 말하면 쓴다. Claude 앱 「Code」 탭(권고) · 웹 Code 탭에서 돈다.
---

# ECOM 발표 만들기 (엔진 3판)

사람이 할 일은 ① 주제 · 회차(+ 자료) 말하기 ② 질문 카드 답 ③ 계획 표 확인 한 번 ④ 받은 파일 보기 뿐이다. 나머지는 아래 순서대로 **멈추지 않고** 한다.
- 사용자에게 하는 말 : 우리말 해요체, 짧게. 단계마다 한 줄만 알린다.
- 계획 확인(4단계) 전에는 발표 파일을 만들지 않는다.

## 고정 값
- `<스킬>` = 「Base directory for this skill」 경로. 명령 : `python "<스킬>/scripts/ecs.py" <단계> ...` (Windows 에서 `python` 이 없으면 `py -3`). **작업 저장소(ecom-study) 안에서** 돌린다.
- 결과는 마지막 줄 JSON. `error` 면 그 문장을 그대로 전하고 멈춘다. `setup` · `fetch` · `build` · `check` 는 도구 timeout 600000.
- 규칙 문서(`setup` 이 받는 `.ecom-slide/`, 스킬 묶음에 `lib/` 가 있으면 그것) : **`rules/plan.md` · `rules/write.md` · `rules/design_grammar.md`** · 형식 **`style/SCHEMA3.md` + `style/SCHEMA3_charts.md` + `style/SCHEMA3_diagrams.md`** · 용어 `terms/glossary.json` · 목업 315종 `library/mockups/`.

## 0. 준비
- 「준비하는 중이에요」 → `ecs.py setup` → `browser` 없으면 「화면 재기는 건너뛰어요」.

## 1. 받기
- 회차 · 주제 · 발표일을 찾고 `ecs.py new <회차> --title "<주제>" --date <YYYY.MM.DD>`.
- 자료 : PC 폴더 경로를 주면 `sessions/<회차>/자료/` 로 복사. 웹 Code 탭이면 작업 저장소에 미리 올려 둔 것만.

## 2. 질문 카드 (AskUserQuestion 한 번, 4문항 — 매 회차 반드시)
1. **본문 장 수** : 20~24 · 25~30 · 31~36장.
2. **표지** : 5종을 `preview` 로 보여 주고 고름 — A 주제 그래픽형(대표 계열 · 숫자) · B 초록 타일형 · C 짙은 초록 전면 · D 큰 숫자형 · E 흰 바탕 · 아래 띠.
3. **깊이** : 입문 · 실무.  4. **토의 질문 수** : 2 · 3.
답은 `meta.length`([최소, 최대]) · `meta.cover` · `meta.depth` · `meta.questions`.

## 3. 사실표 — 작성하는 날의 최신 숫자, 열쇠 없이
- `ecs.py read <회차>` → `work/자료.txt`.
- `ecs.py series --q <지표>` 로 계열 번호를 찾고 `ecs.py fetch <회차> <id> --since 2021.01`(ECOS 공개 시험 열쇠 · FRED 내려받기 주소). 못 받으면 그 문장을 전하고 자료 · 웹 검색 숫자로 진행.
- `sessions/<회차>/facts.json` : `{"키": {"series", "period", "value", "unit", "source", "got"}}`. 없는 숫자는 만들지 않는다.

## 4. 이야기 계획표 → 확인 1번
- `rules/plan.md` 를 읽고 `work/outline.json` : 장마다 `kind` · `eyebrow` · `head`(초안) · `place`(본문 / 부록) · `mockup`(참고한 목업 번호).
- **목업 고르기** : `ecs.py mockup --family <kind>` 로 후보를 보고 `ecs.py mockup <M번호>` 로 slide 틀을 꺼내 숫자 · 글만 바꾼다. 화면 종류 = cover · part · line · bar · hub · timeline · quadrant · formula · kpi · table · (차트) race · zoom · wipe · slope · rank · morph · split · bridge · waffle · donut · minis · heatmap · drivers · combo · (도식) axis · stairs · pyramid · balance · flow · ladder · cycle · columns · tree · calendar · discuss · further · statement · term.
- **PART 별 발표 순서(목록) 장은 만들지 않는다.** 들어가며는 지금 숫자(`line` 계단 + 결정 일지 · `kpi`) → 주제 도식(`hub`).
- `ecs.py table <회차>` → AskUserQuestion 「이대로 만들까요?」(이대로 / 고칠 곳 말하기).

## 5. 장 만들기
- `sessions/<회차>/deck.json` — `"schema": 3`(SCHEMA3). 모든 본문 장에 `eyebrow{group,topic,basis}` · `head`(2줄 50~90자, 사실 + 의미, 보고서체) · `foot{notes,source,asof}`.
- **어깨끈(본문 위 가운데 제목 줄) · 오른쪽 시사점 칸 · 결론 띠 · 읽기 겹은 없다.** 무엇을 · 기준 · 단위는 꼬리표에, 시사점은 차트 안 상자 · 말풍선 · 헤드메시지에.
- 차트는 Kick-off 12쪽처럼 자세히 : 꺾임점 값 · 사건 주석 · 차이 화살 · 국면 번호 · 평균선 · 시사점 상자 중 3가지 이상. 도식은 CW44 어휘(가운데 축 비교 · 인과 계단 · 피라미드 · 저울 · 거래 흐름도 · 조건 사다리 …).
- 단위 : 한 장 안 같은 양은 한 단위, 모든 숫자 주석에 단위. 말투 : `rules/write.md` 의 AI 말투 사전 금지어를 쓰지 않는다.
- 쌓기는 엔진이 자동. 바뀜 단계(`beats`)는 뜻이 바뀌는 곳만 장당 2개까지. 같은 자료를 이어 보면 `chart` 이름을 같게, 같은 숫자를 이어받으면 `carry`.
- 장이 30장 넘으면 묶음마다 Agent(general-purpose, model sonnet)에게 나눠 맡기고 합친다.
- `ecs.py lint <회차>` → 「고칠 것」을 모두 고친다.

## 6. 묶기 · 점검
- `ecs.py build <회차>` → `ecs.py check <회차> --shots all`.
- **글끼리 겹침 · 장 밖 · 본문 칸 밖 · 각주 3줄 이상 · 헤드메시지 3줄 이상 · 글자 11.5px 밑**은 0 이 될 때까지 고친다(최대 3번). 「화면 채움 45% 밑」은 장을 다시 짠다. 캡처(`work/shots/`)를 눈으로 보고 점검이 놓친 겹침 · 빈 곳도 고친다.

## 7. 저장 · 알림
- 작업 저장소에 커밋 · push.
- 마지막 말 : 장 수 · 파일 위치 · 확인할 것 3개까지. 「파일을 두 번 눌러 열어요. → · Enter 다음(쌓기는 저절로, 바뀜 단계가 있는 장만 한 번 더) · ← 이전 · 숫자 + Enter 이동 · O 모아 보기 · P 발표자 창 · F 전체 화면. 부록은 오른쪽 위 고리로.」
