---
name: ecom-slide
description: ECOM 경제 스터디 발표를 IR(실적 발표)형 HTML 파일 하나로 만든다 — 주제 · 회차 · 자료를 받아 작성하는 날의 최신 숫자(열쇠 없이) → 이야기 계획표(확인 1번) → 목업 300종 · HCG 골격으로 장 만들기(차분한 모션, 클릭 한 번에 한 단계) → 겹침 · 넘침 점검 → 파일 하나. 「ECOM 발표 만들어」 「CW47 고용지표 발표 자료」 「경제 스터디 장표」처럼 말하면 쓴다. Claude 앱 「Code」 탭(권고) · 웹 Code 탭에서 돈다.
---

# ECOM 발표 만들기

사람이 할 일은 ① 주제 · 회차(+ 자료) 말하기 ② 질문 카드 답 ③ 계획 표 확인 한 번 ④ 받은 파일 보기 뿐이다. 나머지는 아래 순서대로 **멈추지 않고** 한다.
- 말투 : 우리말 해요체, 짧게. 영어 · 개발 용어를 쓰지 않는다. 단계마다 한 줄만 알린다.
- 계획 확인(4단계) 전에는 발표 파일을 만들지 않는다.

## 고정 값
- `<스킬>` = 「Base directory for this skill」 경로. 명령 : `python "<스킬>/scripts/ecs.py" <단계> ...` (Windows 에서 `python` 이 없으면 `py -3`). **작업 저장소(ecom-study) 안에서** 돌린다.
- 결과는 마지막 줄 JSON. `error` 면 그 문장을 그대로 전하고 멈춘다. `setup` · `fetch` · `build` · `check` 는 도구 timeout 600000.
- 규칙 문서(`setup` 이 받는 `.ecom-slide/`) : `rules/plan.md` · `rules/write.md` · **화면 문법 `rules/design_grammar.md`** · 형식 `style/SCHEMA.md` + `style/SCHEMA2.md` · 용어 `terms/glossary.json` · 목업 `library/mockups/`.

## 0. 준비
- 「준비하는 중이에요」 → `ecs.py setup` → `refs` 0 이면 멈춤. `browser` 없으면 「화면 재기는 건너뛰어요」.

## 1. 받기
- 회차 · 주제 · 발표일을 찾고 `ecs.py new <회차> --title "<주제>" --date <YYYY.MM.DD>`.
- 자료 : PC 폴더 경로를 주면 `sessions/<회차>/자료/` 로 복사. 웹 Code 탭이면 작업 저장소에 미리 올려 둔 것만.

## 2. 질문 카드 (AskUserQuestion 한 번, 4문항 안)
분량(30 · **45** · 60장) · PART(지표, 여러 개) · 깊이(**입문** · 실무) · 토의 질문 수(2 · **3**). 답은 `meta.length` · `meta.parts`.

## 3. 사실표 — 작성하는 날의 최신 숫자, 열쇠 없이
- `ecs.py read <회차>` → `work/자료.txt`.
- `ecs.py series --q <지표>` 로 계열 번호를 찾고 `ecs.py fetch <회차> <id> --since 2021.01` 로 받는다(ECOS 공개 시험 열쇠 · FRED 내려받기 주소 — 받은 시각이 함께 적힘). 못 받으면(웹 Code 탭 네트워크 등) 그 문장을 전하고 자료 · 웹 검색 숫자로 진행.
- `sessions/<회차>/facts.json` : `{"키": {"series", "period"(데이터월), "value", "unit", "source", "got"(받은 시각)}}`. 없는 숫자는 만들지 않는다.

## 4. 이야기 계획표 → 확인 1번
- 규칙 문서를 읽고 `work/outline.json` : 장마다 `kind` · `part` · `title` · `pattern`(목업 번호) · `place`(**본문 / 부록**) · `intent`.
- **목업 고르기** : `ecs.py mockup --family <kpi|table|bar|race|zoom|wipe|slope|rank|morph|split|bridge|waffle|headline|drivers|term|compare|diagram|question>` 로 후보를 보고, `ecs.py mockup <M번호>` 로 slide 틀을 꺼내 내용만 바꿔 쓴다. 도식은 `ecs.py find --layout …` 로 HCG 골격도 고를 수 있다.
- 정의 장(`term`) : 그 장 결론에 꼭 필요한 낱말이면 본문, 아니면 부록(`appendix: "A1"`) + 본문 장 `links`.
- `ecs.py table <회차>` → AskUserQuestion 「이대로 만들까요?」(이대로 / 고칠 곳 말하기).

## 5. 장 만들기
- `sessions/<회차>/deck.json` (SCHEMA + SCHEMA2). 모든 장에 `read` · `note`, 숫자 장엔 `source` · `fact`. 비어 보이는 장은 `aside` · 근거 카드 · 작은 표로 채운다(지표 카드는 4칸 + 추세선).
- 화면 문법(`rules/design_grammar.md` 판 2 — 포트폴리오 95건 · 본문 178장 분석) : 장마다 `eyebrow` · 결론형 제목 + `key` · 필요하면 `sub`. 짜임은 G1~G17 중 하나(같은 짜임 2장까지), 결론 띠 `concl` 은 핵심 장에만(본문 20~30%), 강조색은 `theme.accent` 하나로 장마다 역할 3가지까지.
- 모션은 엔진이 차분하게 정해 둔다(클릭 한 번 = 한 단계). 극적인 움직임은 쓰지 않는다. 같은 숫자가 다음 장으로 이어질 때만 `carry`.
- 장이 40장 넘으면 PART 마다 Agent(general-purpose, model sonnet)에게 나눠 맡기고 합친다.
- `ecs.py lint <회차>` → 「고칠 것」을 모두 고친다.

## 6. 묶기 · 점검
- `ecs.py build <회차>` → `ecs.py check <회차> --shots 1,<숫자 장>,<차트 장>`.
- **글끼리 겹침 · 글이 막대 위 · 밖으로 나감 · 화면 글 40자 넘음 · 글자 16px 밑**은 모두 0 이 될 때까지 고친다(최대 3번). 캡처를 눈으로 보고 점검이 놓친 겹침도 고친다.

## 7. 저장 · 알림
- 작업 저장소에 커밋 · push.
- 마지막 말 : 장 수 · 파일 위치 · 확인할 것 3개까지. 「파일을 두 번 눌러 열고, 클릭(→)할 때마다 한 단계씩 나와요. P 발표자 창 · R 읽기 겹 · 부록은 장 아래 고리로.」
