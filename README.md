# ecom-slide

ECOM 경제 스터디 발표를 **컨퍼런스형 HTML 파일 하나**로 만드는 스킬의 공개 재료 창고.
HCG 장표 3,920장의 짜임(골격)을 고객 흔적 없이 담고, 발표 엔진 · 이야기 규칙 · 용어 사전 · 공개 수치 파일을 둔다.

| 폴더 | 내용 |
|---|---|
| `library/` | HCG 레퍼런스 골격 3,920장 — 도형 자리 · 모양 · 색 역할 · 칸마다 글자 「수」만(글 · 이름 · 그림 없음). `catalog.json` 목록 + `skeletons/S01~S42.json`(구조별) |
| `gallery/` | 골격 찾아보기 페이지(GitHub Pages 또는 `python -m http.server` 로 열기) |
| `style/` | 발표 엔진(`deck.js` · `deck.css`) · 데이터 형식(`SCHEMA.md`) · 글꼴(Pretendard, OFL) |
| `rules/` | 이야기 계획 규칙 · 문체 · 용어 규칙 · 고객명 해시(검사용, 원문 없음) |
| `terms/` | ECOM 용어 사전(용어 풀이 · 같은 말 묶음) |
| `data/` | 공개 수치 파일 — `series.yml` 이 매일 ECOS · FRED 공개 계열을 받음 |
| `skill/ecom-slide/` | 스킬 원본(작업 저장소 `.claude/skills/` 로 복사해 씀) |
| `tools/` | 레퍼런스 정리(`ref_build.py`, 관리자 PC 전용) · 공개 검사 · 수치 받기 · 모아 보기 |

## 쓰는 법
1. 비공개 작업 저장소(ecom-study)를 Claude 앱 또는 웹의 **Code 탭**으로 연다.
2. 「CW47 고용지표 발표 만들어 줘」 — 스킬이 이 저장소를 `.ecom-slide/` 로 받아 쓴다.
3. 결과 : `sessions/<회차>/ECOM_<회차>.html` (← → 넘기기 · P 발표자 창 · R 읽기 겹 · O 개요).

## 공개 원칙
- 이 저장소엔 회차 자료 · 완성 발표 파일 · 멤버 이름 · 고객명 원문 · 열쇠를 올리지 않는다(작업 저장소에만).
- push 마다 `public-check` 가 고객명 해시 · 정해지지 않은 칸 · 그림/PPTX 파일을 검사하고, 걸리면 실패한다.
- 수치 파일엔 재배포 제한이 없는 공개 계열만 둔다(ECOS · 미국 정부 기관 FRED 계열).

## 관리자
- 공개 수치 : 저장소 Settings → Secrets 에 `ECOS_API_KEY` · `FRED_API_KEY` 를 넣으면 `series` 작업이 매일 07:40(한국) 갱신.
- 레퍼런스 다시 만들기 : `python -X utf8 tools/ref_build.py --meta <HCG meta.json> --src <장 pptx 폴더> --build <작업 폴더> --lib library --hash rules/client_hash.json`
- 글꼴 : Pretendard — SIL Open Font License 1.1 (`style/fonts/Pretendard-LICENSE.txt`).
