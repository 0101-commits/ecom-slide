---
name: ecom-slide
description: ECOM 경제 스터디 발표를 컨퍼런스형 HTML 파일 하나로 만든다 — 주제 · 회차 · 자료를 받아 사실표 → 이야기 계획표(확인 1번) → 장 만들기(HCG 레퍼런스 골격 + 발표 엔진) → 점검 · 화면 재기 → 파일 하나. 「ECOM 발표 만들어」 「CW47 고용지표 발표 자료」 「경제 스터디 장표」 「경제지표 발표 HTML」 처럼 말하면 쓴다. Claude 앱 · 웹의 Code 탭에서 돈다.
---

# ECOM 발표 만들기

사람이 할 일은 ① 주제 · 회차(+ 자료) 말하기 ② 질문 카드 답 ③ 계획 표 확인 한 번 ④ 받은 파일 보기 뿐이다. 나머지는 아래 순서대로 **멈추지 않고** 한다.
- 말투 : 우리말 해요체, 짧게. 영어 · 개발 용어를 쓰지 않는다. 단계마다 한 줄만 알린다(「자료를 읽는 중이에요」).
- 계획 확인(4단계) 전에는 발표 파일을 만들지 않는다.

## 고정 값
- `<스킬>` = 이 스킬을 불렀을 때 맨 위에 나오는 「Base directory for this skill」 경로.
- 단계 명령 : `python "<스킬>/scripts/ecs.py" <단계> ...` (Windows 에서 `python` 이 없으면 `py -3`). 명령은 **작업 저장소(ecom-study) 안에서** 돌린다 — 회차 폴더는 `sessions/<회차>/`.
- 결과는 마지막 줄 JSON. `error` 가 있으면 그 문장을 사용자에게 그대로 전하고 멈춘다.
- `setup` · `build` · `check` 는 몇 분 걸릴 수 있다 — 도구 timeout 600000.
- 레퍼런스 저장소는 `setup` 이 `.ecom-slide/` 에 받는다. 규칙 문서 : `.ecom-slide/rules/plan.md` · `.ecom-slide/rules/write.md` · 형식 : `.ecom-slide/style/SCHEMA.md` · 용어 : `.ecom-slide/terms/glossary.json`.

## 0. 준비
- 「준비하는 중이에요」 한 줄 → `ecs.py setup`
- `refs` 가 0 이면 「레퍼런스를 못 받았어요」라고 하고 멈춘다.
- `series` 가 0 이면 「공개 수치 파일이 비어 있어 자료에 있는 숫자만 써요」라고 알리고 진행.
- `browser` 가 없으면 「화면 재기는 건너뛰어요」라고 알리고 진행.

## 1. 받기
- 회차(예 : CW47) · 주제 · 발표일을 사용자 말에서 찾는다. 없으면 2단계 질문 카드에 넣는다.
- `ecs.py new <회차> --title "<주제>" --date <YYYY.MM.DD>`
- 자료 : 사용자가 PC 폴더 경로를 주면(앱 Code 탭) 그 파일들을 `sessions/<회차>/자료/` 로 복사한다. 웹 Code 탭이면 자료는 이미 작업 저장소의 그 폴더에 있어야 한다 — 없으면 「작업 저장소 sessions/<회차>/자료 에 올려 두면 더 정확해요」라고 한 줄 알리고 자료 없이 진행.
- 지난 회차 폴더(`sessions/` 안 가장 최근)가 있으면 그 `deck.json` 의 PART · 핵심 메시지를 Recap 에 쓴다.

## 2. 질문 카드 (AskUserQuestion 한 번, 4문항 안)
1. 분량 : 짧게 30장 · **보통 45장(권고)** · 길게 60장
2. PART(다룰 지표) : 주제에서 뽑은 지표 후보 3~5개, 여러 개 고름
3. 깊이 : **입문(개념 위주, 권고)** · 실무(읽는 법 · 발표 날 볼 것 위주)
4. 토의 질문 수 : 2 · **3(권고)**
답은 `deck.json` 의 `meta.length` · `meta.parts` 로 옮긴다.

## 3. 사실표
- 「자료 · 수치를 읽는 중이에요」 → `ecs.py read <회차>` → `sessions/<회차>/work/자료.txt` 를 읽는다(스캔 PDF 는 그림으로 열어 읽음).
- `ecs.py series --q <지표>` 로 공개 수치 계열을 찾고 `ecs.py series --id <ID> --since 2021.01` 로 값을 받는다.
- `sessions/<회차>/facts.json` 을 쓴다 : `{"키": {"series": "계열 ID 또는 자료 파일 이름", "period": "2026.09", "value": 61457.5, "unit": "백만 달러", "source": "한국은행 ECOS 301Y013"}}`. 자료와 공개 수치가 다르면 공개 수치를 쓰고 `note` 에 차이를 적는다. 없는 숫자는 만들지 않는다.

## 4. 이야기 계획표 → 확인 1번
- `rules/plan.md` · `rules/write.md` · `style/SCHEMA.md` 를 읽고 `sessions/<회차>/work/outline.json` 을 쓴다 : `{"meta": {...}, "slides": [{"kind", "part", "title", "layout"?, "skeleton"?, "chart"?: "bar|line|cumline|hbar", "intent": "이 장에서 말할 것 한 줄"}]}`.
- 도식 장은 `ecs.py find --layout <배치> --cols <칸 수>` 로 골격을 골라 `skeleton` 에 id 를 적는다(단순한 것부터 나옴).
- `ecs.py table <회차>` 로 표를 만들어 사용자에게 보여 주고 AskUserQuestion 으로 묻는다 : 「이대로 만들까요?」(이대로 만들기 / 고칠 곳 말하기). 고칠 곳을 말하면 고쳐서 다시 한 번 보여 준다.

## 5. 장 만들기
- 「장을 만드는 중이에요(약 N분)」 → `sessions/<회차>/deck.json` 을 SCHEMA 대로 쓴다. 모든 장에 `read`(읽기 겹) · `note`(발표자 메모), 숫자 장엔 `source` · `fact`.
- 장이 40장 넘으면 PART 마다 Agent(general-purpose, model sonnet)에게 그 PART 의 slides 배열만 쓰게 나눠 맡기고(규칙 문서 · facts.json · outline 해당 줄을 넘김) 합친다.
- `ecs.py lint <회차>` → 「고칠 것」은 모두 고친다.

## 6. 묶기 · 점검
- `ecs.py build <회차>` → `ecs.py check <회차> --shots 1,3,<도식 장>,<차트 장>` → `work/check.md` 와 `work/shots/*.png` 를 본다.
- 「고칠 것」(화면 글 40자 넘음 · 넘침 · 겹침 · 출처 없음 등)을 고쳐 build → check 를 최대 2번 더. 남은 것은 확인 목록으로.

## 7. 저장 · 알림
- 작업 저장소에 커밋한다 : `git add sessions/<회차>` → `git commit -m "<회차> 발표"` → `git push`(웹 Code 탭은 세션이 사라지므로 꼭).
- 마지막 말(짧게) : 장 수 · 파일 위치 · 확인할 것 3개까지.
  - 앱 Code 탭 : 「sessions/<회차>/ECOM_<회차>.html 을 두 번 눌러 열면 돼요. ← → 로 넘기고 P 는 발표자 창, R 은 읽기 겹이에요.」
  - 웹 Code 탭 : 「GitHub 의 ecom-study 저장소 → sessions/<회차>/ECOM_<회차>.html → 내려받기(Download raw file)로 받으면 돼요.」
