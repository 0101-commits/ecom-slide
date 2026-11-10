# ecom-slide

ECOM 경제 스터디 발표를 **컨퍼런스형 HTML 파일 하나**로 만드는 스킬의 공개 재료 창고.
HCG 장표 3,920장의 짜임(골격)과 목업 315종을 담고, 발표 엔진(IR 화면 + 차분한 모션 + 디자인 문법 판 2) · 이야기 규칙 · 용어 사전을 둔다. 숫자는 발표를 만드는 날 열쇠 없이 받는다.

| 폴더 | 내용 |
|---|---|
| `library/` | HCG 레퍼런스 골격 3,920장 — 도형 자리 · 모양 · 색 역할 · 칸마다 글자 「수」만(글 · 이름 · 그림 없음). `catalog.json` 목록 + `skeletons/S01~S42.json`(구조별) |
| `library/mockups/` | 목업 315종 — 화면 종류 · 짜임 17 · 모션 기법별 slide 틀(공개 통계 숫자) |
| `gallery/` | 골격 찾아보기(`index.html`) · 목업 315 모아 보기(`mockups.html`) |
| `style/` | 발표 엔진(`deck.js` · `deck.css`) · 데이터 형식(`SCHEMA.md` · `SCHEMA2.md`) · 글꼴(Pretendard, OFL) |
| `rules/` | 이야기 계획 규칙 · 문체 · 용어 규칙 · 고객명 해시(검사용, 원문 없음) |
| `terms/` | ECOM 용어 사전(용어 풀이 · 같은 말 묶음) |
| `rules/design_grammar.md` | 화면 디자인 문법 판 2 — PPT 디자인 스튜디오 공개 포트폴리오 95건(본문 178장) 분석 : 바탕 · 한 색 · 결론형 제목 · 짜임 17 · 결론 띠 · 점검 기준 |
| `data/` | 계열 번호 사전(`series_ids.json`) · 목업용 숫자 묶음(`snap/`, 받은 시각 표시) |
| `skill/ecom-slide/` | 스킬 원본(작업 저장소 `.claude/skills/` 로 복사해 씀) |
| `tools/` | 레퍼런스 정리(`ref_build.py`, 관리자 PC 전용) · 공개 검사 · 목업 만들기 · 모아 보기 |

## 쓰는 법
1. 비공개 작업 저장소(ecom-study)를 Claude 앱 또는 웹의 **Code 탭**으로 연다.
2. 「CW47 고용지표 발표 만들어 줘」 — 스킬이 이 저장소를 `.ecom-slide/` 로 받아 쓴다.
3. 결과 : `sessions/<회차>/ECOM_<회차>.html` (← → 넘기기 · P 발표자 창 · R 읽기 겹 · O 개요).

## 공개 원칙
- 이 저장소엔 회차 자료 · 완성 발표 파일 · 멤버 이름 · 고객명 원문 · 열쇠를 올리지 않는다(작업 저장소에만).
- push 마다 `public-check` 가 고객명 해시 · 정해지지 않은 칸 · 그림/PPTX 파일을 검사하고, 걸리면 실패한다.
- 숫자는 공개 통계만(한국은행 ECOS 공개 시험 열쇠 · 미국 정부 기관 FRED 계열). 열쇠 · 비밀값을 쓰지 않는다.

## 관리자
- 비밀값 : `ECOM_HASH_KEY` 하나(공개 검사의 고객명 대조 열쇠, 넣어 둠). 수치 열쇠는 쓰지 않음.
- 레퍼런스 다시 만들기 : `python -X utf8 tools/ref_build.py --meta <HCG meta.json> --src <장 pptx 폴더> --build <작업 폴더> --lib library --hash rules/client_hash.json` (환경 변수 `ECOM_HASH_KEY` 필요 — 고객명 열쇠 해시)
- 글꼴 : Pretendard — SIL Open Font License 1.1 (`style/fonts/Pretendard-LICENSE.txt`).
