# ecom-slide

ECOM 경제 스터디 발표를 **HTML 파일 하나**로 만드는 스킬의 공개 재료 창고(엔진 3판 · 2026-11-11).
사용자 Kick-off · CW44 발표 자료의 짜임 — **꼬리표 → 헤드메시지 2줄 → 꽉 찬 주석 차트 · 도식 → 왼쪽 아래 각주 · 오른쪽 아래 로고** — 를 기본 틀로, 장에 들어오면 저절로 쌓이고 장 넘김 8종으로 이어진다.

| 폴더 | 내용 |
|---|---|
| `style/` | 엔진 3판(`deck.js` · `deck.css`) + 화면 종류 부품(`parts/*.js`) · 형식 `SCHEMA3.md`(+ `SCHEMA3_charts.md` · `SCHEMA3_diagrams.md`) · 로고 자리 `brand/`(ECOM CI 그림은 공개 저장소에 두지 않고 스킬 zip · 작업 저장소에만) · 글꼴(Pretendard, OFL) · 시험 덱 `demo3*.json` · 2판 엔진은 `v2/`(옛 회차 빌드용) |
| `rules/` | 이야기 계획(`plan.md`) · 문체(`write.md`, AI 말투 사전) · 화면 문법(`design_grammar.md`) 판 3 · 고객명 해시(검사용) · 2판 규칙은 `v2/` |
| `library/mockups/` | 목업 264종(4판) = 3판에서 남긴 80 + 새 목업 184(19계열, `v4/` · 만들기 `tools/make_mockups4*.py`) — `mockups.json` · `index.md`, 3판 목록 `v3/` · 판 2 원본 `v2/` |
| `library/` | HCG 레퍼런스 골격 3,920장(`catalog.json` · `skeletons/`) |
| `gallery/` | 목업 264 모아 보기(`mockups.html`, O 키) · 골격 찾아보기(`index.html`) |
| `terms/` · `data/` | 용어 사전 · 계열 번호 사전 · 목업용 숫자 묶음(`snap/`, 받은 시각 표시) |
| `skill/ecom-slide/` | 스킬 원본(SKILL.md · scripts/ecs.py). zip 은 `tools/sync_skill.py --zip` 이 lib/(엔진 · 규칙 · 목업)를 함께 넣어 만듦 |
| `tools/` | 목업 만들기(`make_mockups3.py` · `mock3_*.py`) · 갤러리(`build_mockups.py`) · 미리 보기(`preview3.py`) · 화면 점검(`shot3.js`) · 공개 검사 · 레퍼런스 정리 |

## 쓰는 법
1. 비공개 작업 저장소(ecom-study)를 Claude 앱 또는 웹의 **Code 탭**으로 연다.
2. 「CW47 고용지표 발표 만들어 줘」 — 스킬이 이 저장소를 `.ecom-slide/` 로 받아 쓴다.
3. 결과 : `sessions/<회차>/ECOM_<회차>.html` (→ · Enter 다음 · ← 이전 · 숫자 + Enter 이동 · O 모아 보기 · P 발표자 창 · F 전체 화면).

## 공개 원칙
- 이 저장소엔 회차 자료 · 완성 발표 파일 · 멤버 이름 · 고객명 원문 · 열쇠를 올리지 않는다(작업 저장소에만).
- push 마다 `public-check` 가 고객명 해시 · 정해지지 않은 칸 · 그림/PPTX 파일을 검사하고, 걸리면 실패한다.
- 숫자는 공개 통계만(한국은행 ECOS 공개 시험 열쇠 · 미국 정부 기관 FRED 계열). 열쇠 · 비밀값을 쓰지 않는다.

## 관리자
- 비밀값 : `ECOM_HASH_KEY` 하나(공개 검사의 고객명 대조 열쇠, 넣어 둠). 수치 열쇠는 쓰지 않음.
- 레퍼런스 다시 만들기 : `python -X utf8 tools/ref_build.py --meta <HCG meta.json> --src <장 pptx 폴더> --build <작업 폴더> --lib library --hash rules/client_hash.json` (환경 변수 `ECOM_HASH_KEY` 필요 — 고객명 열쇠 해시)
- 글꼴 : Pretendard — SIL Open Font License 1.1 (`style/fonts/Pretendard-LICENSE.txt`).
