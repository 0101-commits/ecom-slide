# 6판 새 주제 시험 5개 (2026-11-26)

처음 보는 주제 5개를 엔진에 이미 있는 화면 종류, 조립 블록, 그림 재료만으로 짠 시험 덱. 목표(기획서 묶음 1 효과)는 덱마다 새 코드가 필요한 장 0~1장.

| 덱 | 주제 | 주제 팩 | 이야기 흐름 | 틀 | 장 | 쓴 블록과 화면 종류 | 새 코드 필요 | 고칠 것 |
|---|---|---|---|---|---|---|---|---|
| T1 | 엘리베이터는 어떻게 움직이나 | general | teach | bento | 6 | tiles, plan, steps, layers, compare, cards, note | 0 | 0 |
| T2 | 택배가 집에 오기까지 | general | explain | ecom | 5 | iso, steps, nodes, compare, cards | 0 | 0 |
| T3 | 고객 문의 처리 절차 개편 결과 보고(예시) | report | report | ecom | 6 | stat, compare, line, nodes, table, cards | 0 | 0 |
| T4 | 사무실 이전 후보 비교(예시) | report | decide | bento | 5 | cards, table, bars, matrix, stat | 0 | 0 |
| T5 | 혈압은 왜 오르나 | general | teach | ecom | 5 | body, nodes, layers, cards, tiles | 0 | 0 |

- 숫자: T3, T4 는 가상 회사의 예시 값(각주에 표시). T1, T2, T5 는 숫자 없는 개념 설명.
- 다시 만들기: `python -X utf8 tests/topics6/make_topics6.py`, 점검: `python -X utf8 tools/topics6.py --shots`(화면 점검 + 글 점검, 장별 캡처는 style/_topics6).
- 시험 중 고친 엔진: 아이콘 있는 카드와 타일이 키가 크면 내용을 세로 가운데로(아래가 크게 비던 것).
