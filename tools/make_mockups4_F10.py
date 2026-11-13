# F10 제도 · 용어 · 구조 계열 목업 12종(N107~N118) — 자료를 읽어 library/mockups/v4/F10.json · style/demo4_r1_F10.json 을 씀
# 실행: python -X utf8 tools/make_mockups4_F10.py
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
S1 = ROOT / "data" / "snap"
EX = "숫자는 모양을 보이기 위한 예시 값"


def load(p):
    return json.load(open(p, encoding="utf8"))


def head_len(h):
    return len(re.sub(r"\s|\*\*", "", h))


def f(v, d=0):
    s = f"{abs(v):,.{d}f}"
    return ("−" if v < 0 and float(s.replace(",", "")) != 0 else "") + s


out = []


def add(id_, kind, variant, title, facts, slide, real):
    slide["kind"] = kind
    hl = head_len(slide["head"])
    if not 50 <= hl <= 90: print("HEAD", id_, hl)
    out.append({"id": id_, "kind": kind, "family": "F10", "variant": variant, "title": title, "tags": ["4판"] if real else ["4판", "예시 값"],
                "facts": facts, "slide": slide})


def foot_ex(extra=None):
    return {"notes": [EX] + (extra or []), "source": "예시(실제 제도 · 자료 아님)", "asof": "2026.11.13"}


# ---- N107 주체 관계 구조도(부동산 PF)
add("N107", "structure", "주체 관계 구조도", "부동산 PF 사업 구조", {"주체": 4},
    {"eyebrow": {"group": "제도 · 구조", "topic": "부동산 PF 사업 구조", "basis": "돈 · 일 · 보증의 흐름, 예시 값"},
     "head": "PF 사업장은 **금융기관 대출**로 땅값과 공사비를 대고 **시공사 · 신탁사 보증**으로 받쳐서, 분양이 막히면 **보증한 곳**으로 부담이 번짐",
     "foot": foot_ex(["주체 이름은 역할 이름이며 실제 회사가 아님"]),
     "center": {"title": "사업장 법인", "sub": "PF 사업을 맡는 특수목적법인"},
     "nodes": [{"id": "a", "title": "시행사", "sub": "땅 매입 · 인허가 · 사업 기획"}, {"id": "c", "title": "신탁사", "sub": "자금 관리 · 담보 신탁"},
               {"id": "b", "title": "시공사", "sub": "공사 · 책임준공 약속"}, {"id": "d", "title": "금융기관", "sub": "브리지론 → 본 PF 대출"}],
     "edges": [{"from": "d", "to": "center", "kind": "money", "text": "대출"}, {"from": "center", "to": "b", "kind": "work", "text": "공사비"},
               {"from": "a", "to": "center", "kind": "work", "text": "사업 기획"}, {"from": "c", "to": "center", "kind": "work", "text": "자금 관리"},
               {"from": "b", "to": "d", "kind": "guarantee", "text": "책임준공 보증"}],
     "legend": {"money": "돈", "work": "일 · 비용", "guarantee": "보증"},
     "order": {"title": "분양이 막히면", "warnFrom": 2, "items": [{"t": "분양대금이 안 들어옴", "s": "대출을 갚을 돈이 끊김"}, {"t": "본 PF 전환이 막힘", "s": "브리지론 만기 연장 거절"},
                                                            {"t": "보증한 곳이 대신 갚음", "s": "시공사 · 신탁사 부담"}, {"t": "금융권으로 번짐", "s": "대출 부실 · 충당금 증가"}]}}, False)

# ---- N108 계산 예시 칸
P, R, TX = 10000, 3.0, 15.4
INT = P * R / 100
TAX = INT * TX / 100
NET = INT - TAX
add("N108", "stcalc", "계산 예시 칸", "예금 이자와 세금 계산 예시", {"원금(만원)": P, "연 금리(%)": R, "이자소득세율(%)": TX, "세전 이자": INT, "세금": round(TAX, 2), "세후 이자": round(NET, 2)},
    {"eyebrow": {"group": "제도 · 구조", "topic": "예금 이자에서 세금까지 계산 예시", "basis": "원금 · 금리는 예시 값, 세율은 일반과세 15.4%"},
     "head": f"예금 1억원의 세전 이자 연 **{f(INT)}만원**에서 **세금 {f(TAX,1)}만원**이 빠져 실제 손에 남는 돈은 **{f(NET,1)}만원**뿐이라 세후 수익률이 표시 금리보다 낮음",
     "foot": {"notes": ["원금 · 금리는 모양을 보이기 위한 예시 값", "이자소득세 14% + 지방소득세 1.4% = 15.4%(일반과세)"], "source": "소득세법 · 지방세법 일반과세 세율", "asof": "2026.11.13"},
     "steps": [{"name": "예금 원금", "sub": "1년 만기 정기예금", "value": P, "unit": "만원", "op": f"× 연 {R:.1f}%", "how": "1억원을 1년 맡김"},
               {"name": "세전 이자", "sub": "1년 뒤 받는 이자", "value": INT, "unit": "만원", "op": f"× 세율 {TX}%", "how": f"{f(P)}만원 × {R:.1f}%"},
               {"name": "이자소득세", "sub": "국세 14% + 지방세 1.4%", "value": TAX, "dec": 1, "unit": "만원", "op": "이자 − 세금", "how": f"{f(INT)}만원 × {TX}%", "tone": "warn"},
               {"name": "손에 남는 돈", "sub": "세후 이자", "value": NET, "dec": 1, "unit": "만원", "how": f"{f(INT)} − {f(TAX,1)} = {f(NET,1)}만원"}],
     "split": {"title": f"이자 {f(INT)}만원이 가는 곳", "unit": "만원", "dec": 1, "items": [{"name": "손에 남는 돈", "value": NET, "tone": "dark"}, {"name": "세금", "value": TAX, "tone": "warn"}]},
     "band": f"세후 수익률은 연 **{NET/P*100:.2f}%**로 표시 금리 {R:.1f}%보다 **{R-NET/P*100:.2f}%p** 낮음"}, False)

# ---- N109 제도 전후 표
rows = [("지원 대상 나이", "만 19~34세", "만 19~39세", True), ("소득 기준", "중위소득 150% 이하", "중위소득 150% 이하", False),
        ("월 지원 한도", "20만원", "30만원", True), ("신청 방법", "온라인 · 방문", "온라인 · 방문", False),
        ("지급 시기", "신청 후 다음 달 말", "신청 후 15일 이내", True), ("환수 규정", "허위 신청 시 전액", "허위 신청 시 전액", False)]
nch = sum(1 for r in rows if r[3])
add("N109", "stbefore", "제도 전후 표", "지원 제도 개편 전후 비교", {"항목 수": len(rows), "바뀐 항목": nch},
    {"eyebrow": {"group": "제도 · 구조", "topic": "가상 지원 제도 개편 전후", "basis": "항목별 비교, 예시 값"},
     "head": f"개편으로 **{len(rows)}개 항목 중 {nch}개**가 바뀌어 대상 나이는 **넓어지고** 월 지원 한도는 **늘고** 지급 시기는 **빨라져** 신청자가 받는 혜택이 전반적으로 커짐",
     "foot": foot_ex(["제도 이름 · 내용은 가상의 예"]),
     "cols": {"item": "항목", "before": "개편 전", "after": "개편 후"},
     "rows": [{"item": a, "before": b, "after": c, "changed": d} for a, b, c, d in rows]}, False)

# ---- N110 절차 단계
st = [("신청", "신청자", "신청서 · 증빙 서류 제출", 0), ("심사", "심사 기관", "요건 확인 · 서류 보완 요청", 5), ("승인", "승인 위원회", "지급 여부 · 금액 결정", 3), ("지급", "지급 기관", "계좌 입금 · 결과 안내", 7)]
tot = sum(x[3] for x in st)
add("N110", "stproc", "절차 단계", "신청에서 지급까지 절차", {"총 영업일": tot, "단계": 4},
    {"eyebrow": {"group": "제도 · 구조", "topic": "신청에서 지급까지 절차", "basis": "단계별 소요 영업일, 예시 값"},
     "head": f"신청에서 지급까지 **4단계 · 총 {tot}영업일**이 걸리고, 심사에서 **서류 보완 요청**이 나오면 다시 신청 단계로 되돌아가 기간이 더 늘어남",
     "foot": foot_ex(["소요일은 가상의 제도 기준"]),
     "unit": "영업일", "steps": [{"name": a, "who": b, "doc": c, "days": d} for a, b, c, d in st],
     "back": {"from": 1, "to": 0, "text": "보완 요청 시 되돌아감"}, "totalLabel": "신청 ~ 지급",
     "band": f"가장 오래 걸리는 구간은 **승인 → 지급 {st[3][3]}영업일**로 전체의 **{st[3][3]/tot*100:.0f}%**임"}, False)

# ---- N111 표현 번역 척도
ph = [("머지않아", "soon", 1, 3), ("인내심을 갖고", "patient", 3, 9), ("당분간", "for some time", 6, 12), ("적절한 시점에", "at the appropriate time", 6, 18), ("상당 기간", "considerable period", 12, 24)]
add("N111", "stscale", "표현 번역 척도", "완곡한 표현의 실제 기간", {"표현 수": len(ph)},
    {"eyebrow": {"group": "제도 · 구조", "topic": "성명문 표현을 기간으로 옮기기", "basis": "표현별 읽는 기간(개월), 예시 값"},
     "head": "발표문 표현 5개를 기간으로 옮기면 **'머지않아'는 1~3개월**, **'상당 기간'은 12~24개월**로 읽혀 표현마다 **시차가 크게 다름**",
     "foot": foot_ex(["기간은 표현을 읽는 하나의 예이며 실제 발표 결과가 아님"]),
     "unit": "개월", "max": 24, "step": 6, "axisTitle": "읽는 기간(개월)",
     "phrases": [{"text": a, "en": b, "lo": c, "hi": d} for a, b, c, d in ph],
     "band": "같은 **'기다림'** 이어도 표현에 따라 **1개월부터 24개월**까지 폭이 벌어져 **시기 판단**이 갈림"}, False)

# ---- N112 구성 쌓기 공식 (실제 값)
d10 = {k: v for k, v in load(S1 / "fred_dgs10.json")["data"]}
d2 = {k: v for k, v in load(S1 / "fred_dgs2.json")["data"]}
labs = sorted(set(d10) & set(d2))[-48:]
a = [round(d2[k], 3) for k in labs]
b = [round(d10[k] - d2[k], 3) for k in labs]
neg = sum(1 for x in b if x < 0)
last = labs[-1]
v10, v2, sp = d10[last], d2[last], d10[last] - d2[last]
negfirst = next(k for k, x in zip(labs, b) if x < 0)
negend = [k for k, x in zip(labs, b) if x < 0][-1]
add("N112", "stbuild", "구성 쌓기 공식", "10년물 = 기대 단기금리 + 기간 프리미엄(근사)", {"10년물": round(v10, 2), "2년물": round(v2, 2), "격차": round(sp, 2), "음수 달": neg},
    {"eyebrow": {"group": "제도 · 구조", "topic": "10년물 금리를 쌓아 보기", "basis": "월평균, %, 2년물 · 격차로 근사한 분해"},
     "head": f"10년물 **{v10:.2f}%**는 2년물 **{v2:.2f}%**에 격차 **{sp:.2f}%p**를 얹은 값이고, 최근 48개월 중 **{neg}개월**은 얹을 몫이 **마이너스**였음",
     "foot": {"notes": ["기대 단기금리 ≈ 2년물 금리, 기간 프리미엄 ≈ 10년물 − 2년물 격차로 근사한 값이며 모형 추정치(ACM 등)와 다름"], "source": "FRED(DGS10 · DGS2, 월평균)", "asof": last.replace(".", ".")},
     "eq": [{"name": "10년물 금리", "sub": f"{last} 월평균", "value": round(v10, 2), "unit": "%"}, {"name": "기대 단기금리(근사)", "sub": "2년물 금리", "value": round(v2, 2), "unit": "%"},
            {"name": "기간 프리미엄(근사)", "sub": "10년물 − 2년물", "value": round(sp, 2), "unit": "%p"}],
     "chart": {"labels": labs, "a": a, "b": b, "unit": "%", "names": ["기대 단기금리(2년물)", "기간 프리미엄(격차)", "10년물"], "legendNeg": "격차 음수(10년물 < 2년물)", "y": {"min": 0, "max": 6, "step": 2}, "tickEvery": 12},
     "band": f"격차가 음수였던 구간은 **{negfirst} ~ {negend}** 이며, 이때 10년물은 2년물보다 낮았음"}, True)

# ---- N113 해당 여부 나무
tree = {"q": "소득이 기준 이하인가?", "no": {"out": "대상 아님", "sub": "소득 기준 초과", "tone": "gray"},
        "yes": {"q": "만 65세 이상이거나 장애인인가?", "yes": {"out": "전액 지원", "sub": "지원율 100%", "tone": "main"},
                "no": {"q": "18세 미만 자녀가 있는가?", "yes": {"out": "70% 지원", "sub": "자녀 가구 우대", "tone": "main"}, "no": {"out": "50% 지원", "sub": "기본 지원율", "tone": "main"}}}}
add("N113", "stdecide", "해당 여부 나무", "지원 대상 가르는 질문 나무", {"질문": 3, "결과": 4},
    {"eyebrow": {"group": "제도 · 구조", "topic": "지원 대상 여부 가르기", "basis": "예 · 아니오 질문 3개, 예시 값"},
     "head": "소득 기준을 넘으면 **대상 아님**이고, 넘지 않아도 **연령 · 자녀 여부**에 따라 지원율이 **100% · 70% · 50%**로 세 갈래로 나뉨",
     "foot": foot_ex(["기준 · 지원율은 가상의 제도 예"]), "tree": tree,
     "band": "질문은 **3개**뿐이고 결과는 **4가지**라, 대상 여부를 **세 번 만에** 가를 수 있음"}, False)

# ---- N114 지분 구조도
add("N114", "structure", "지분 구조도", "공동 투자 법인 지분 구조", {"투자자 지분": "60% · 40%"},
    {"eyebrow": {"group": "제도 · 구조", "topic": "공동 투자 법인 지분 구조도", "basis": "지분율 %, 예시 값"},
     "head": "투자자 두 곳이 **60% · 40%**로 만든 투자법인이 사업회사 A를 **100%**, B를 **49%** 들고 있어 B는 **지배력이 약하고** 연결 대상도 아님",
     "foot": foot_ex(["회사 · 지분율은 모두 가상의 예, 실제 회사가 아님"]),
     "nodes": [{"id": "x", "title": "투자자 X", "sub": "주도 투자자", "col": 0, "row": 0, "tone": "dark"}, {"id": "y", "title": "투자자 Y", "sub": "재무적 투자자", "col": 2, "row": 0},
               {"id": "s", "title": "투자법인", "sub": "공동 설립", "col": 1, "row": 1}, {"id": "a", "title": "사업회사 A", "sub": "자회사 · 연결", "col": 0, "row": 2},
               {"id": "b", "title": "사업회사 B", "sub": "지분 49% · 비연결", "col": 2, "row": 2}],
     "legend": {"work": "지분율(%)"},
     "edges": [{"from": "x", "to": "s", "kind": "work", "text": "60%"}, {"from": "y", "to": "s", "kind": "work", "text": "40%"},
               {"from": "s", "to": "a", "kind": "work", "text": "100%"}, {"from": "s", "to": "b", "kind": "work", "text": "49%"}]}, False)

# ---- N115 세율 구간 계단 (미국 연방 소득세 2025, 단독 신고자 — IRS Rev. Proc. 2024-40)
BR = [(11925, 10), (48475, 12), (103350, 22), (197300, 24), (250525, 32), (626350, 35), (None, 37)]
INC = 100000
tax = 0
prev = 0
for up, r in BR:
    hi = INC if up is None else min(INC, up)
    tax += max(0, hi - prev) * r / 100
    prev = up if up else prev
add("N115", "sttax", "세율 구간 계단", "미국 연방 소득세 구간(2025)", {"과세소득(예시)": INC, "세금": round(tax, 1), "평균세율": round(tax / INC * 100, 1), "한계세율": 22},
    {"eyebrow": {"group": "제도 · 구조", "topic": "미국 연방 소득세 구간", "basis": "2025 과세연도 단독 신고자, 소득은 예시 값"},
     "head": f"과세소득 {f(INC)}달러면 세금은 **{f(tax)}달러**로 평균세율 **{tax/INC*100:.1f}%**지만, 마지막 1달러에는 **22%**가 붙음",
     "foot": {"notes": ["과세소득 100,000달러는 모양을 보이기 위한 예시 값", "세율 구간은 2025 과세연도 단독 신고자(표준공제 차감 후 과세소득) 기준"], "source": "IRS Rev. Proc. 2024-40", "asof": "2025.12"},
     "brackets": [{"upTo": u, "rate": r} for u, r in BR], "income": INC, "cur": "달러", "incomeLabel": "예시 소득",
     "band": "구간별 세율은 **넘은 부분에만** 붙기 때문에 평균세율이 한계세율보다 **낮음**"}, True)

# ---- N116 용어 관계 지도 (실제 값: 2026.10 월평균)
dd = load(S4 / "DFII10.json")["data"]
oc = [v for k, v in dd if k.startswith("2026-10")]
real = sum(oc) / len(oc)
be = v10 - real
add("N116", "stmap", "용어 관계 지도", "10년물 금리와 관련 용어", {"명목 10년물": round(v10, 2), "실질(DFII10)": round(real, 2), "기대인플레(근사)": round(be, 2), "2년물": round(v2, 2), "격차": round(sp, 2)},
    {"eyebrow": {"group": "제도 · 구조", "topic": "10년물 금리 관련 용어 다섯", "basis": f"{last} 월평균, %, 근사"},
     "head": f"10년물 **{v10:.2f}%**는 실질금리 **{real:.2f}%**와 기대인플레이션 **{be:.2f}%**로도, 2년물 **{v2:.2f}%**와 격차 **{sp:.2f}%p**로도 쪼개 볼 수 있음",
     "foot": {"notes": ["기대인플레이션 ≈ 10년물 − 10년 실질금리, 기간 프리미엄 ≈ 10년물 − 2년물 격차로 근사한 값"], "source": "FRED(DGS10 · DGS2 월평균, DFII10 일별 월평균)", "asof": last},
     "center": {"name": "10년물 명목금리", "sub": "시장에서 정해지는 장기 금리", "value": round(v10, 2), "unit": "%"},
     "nodes": [{"name": "10년 실질금리", "sub": "물가 변동을 뺀 금리(TIPS)", "value": round(real, 2), "unit": "%"}, {"name": "기대인플레이션", "sub": "명목 − 실질로 근사", "value": round(be, 2), "unit": "%"},
               {"name": "기대 단기금리", "sub": "2년물 금리로 근사", "value": round(v2, 2), "unit": "%"}, {"name": "기간 프리미엄", "sub": "10년물 − 2년물로 근사", "value": round(sp, 2), "unit": "%p"}],
     "edges": ["① 물가를 뺀 몫", "① 물가 기대 몫", "② 짧은 금리 몫", "② 오래 빌려주는 대가"],
     "eqs": [{"title": "쪼개는 방법 ① 물가 기준", "text": f"**{v10:.2f}%** = 실질 {real:.2f}% + 기대인플레 {be:.2f}%"},
             {"title": "쪼개는 방법 ② 금리 경로 기준", "text": f"**{v10:.2f}%** ≈ 2년물 {v2:.2f}% + 격차 {sp:.2f}%p"}]}, True)

# ---- N117 무엇 · 왜 · 어떻게 (실제 값: 연준 총자산 WALCL)
wl = [(k, v / 1e6) for k, v in load(S4 / "WALCL.json")["data"] if k >= "2020-01-01"]
vals = [round(v, 3) for k, v in wl]
pk = max(range(len(wl)), key=lambda i: wl[i][1])
now = wl[-1]
dd_ = (now[1] / wl[pk][1] - 1) * 100
add("N117", "st3q", "무엇 · 왜 · 어떻게 3칸", "양적긴축이란", {"정점(조 달러)": round(wl[pk][1], 2), "정점일": wl[pk][0], "현재(조 달러)": round(now[1], 2), "변화율(%)": round(dd_, 1)},
    {"eyebrow": {"group": "제도 · 구조", "topic": "양적긴축(QT) 한 장 설명", "basis": "연준 총자산, 조 달러, 주간"},
     "head": f"양적긴축은 풀린 돈을 거두는 일로, 연준 총자산은 정점 **{wl[pk][1]:.2f}조 달러**에서 **{now[1]:.2f}조 달러**로 **{f(dd_,1)}%** 줄어든 상태임",
     "foot": {"notes": ["QT 설명은 일반 원칙이며 월별 감축 한도는 연준 결정에 따라 바뀜"], "source": "FRED(WALCL)", "asof": now[0].replace("-", ".")},
     "panels": [{"q": "무엇", "title": "양적긴축(QT)", "text": "연준이 들고 있는 국채 · 증권을 줄여서 시중에 풀린 돈을 다시 거두는 정책", "type": "num",
                 "num": {"value": round(now[1], 2), "dec": 2, "unit": "조 달러", "label": f"연준 총자산 {now[0].replace('-', '.')}", "rows": [{"k": "정점", "v": f"{wl[pk][1]:.2f}조 달러 ({wl[pk][0][:7].replace('-', '.')})"}, {"k": "정점 대비", "v": f"{f(now[1]-wl[pk][1],2)}조 달러", "warn": 1}]}},
                {"q": "왜", "title": "풀린 돈 회수", "text": "경기를 살리려고 사들인 자산이 너무 불어나, 물가 부담을 줄이려고 되돌리는 것", "type": "line",
                 "line": {"data": vals, "labels": [wl[0][0][:7].replace("-", "."), now[0][:7].replace("-", ".")], "unit": "조 달러", "hiAt": pk, "hiText": f"{wl[pk][1]:.2f}조 달러 ({wl[pk][0][:7].replace('-', '.')})", "lastText": f"{now[1]:.2f}조 달러"}},
                {"q": "어떻게", "title": "자연 감소", "text": "새로 사지 않고 보유 증권이 만기가 되도록 두는 방식", "type": "steps",
                 "steps": [{"t": "보유 증권 만기 도래", "s": "만기가 되면 상환받음"}, {"t": "재투자를 줄임", "s": "상환 금액으로 새로 사지 않음"}, {"t": "총자산이 줄어드는 결과임", "s": "시중 자금도 함께 줄어드는 결과임"}]}]}, True)

# ---- N118 같은 돈 두 제도
A_ = [("세금", 600, "warn"), ("사회보험료", 450, "g40"), ("실수령", 3950, "main")]
B_ = [("세금", 450, "warn"), ("사회보험료", 700, "g40"), ("실수령", 3850, "main")]
dnet = B_[2][1] - A_[2][1]
add("N118", "stcmp", "같은 돈 두 제도", "같은 소득에 두 제도 적용", {"총액(만원)": 5000, "A 실수령": 3950, "B 실수령": 3850, "차이": dnet},
    {"eyebrow": {"group": "제도 · 구조", "topic": "같은 소득에 제도 A · B 적용", "basis": "연 소득 5,000만원 기준, 만원, 예시 값"},
     "head": f"연 소득 5,000만원에서 제도 B는 세금이 **{A_[0][1]-B_[0][1]}만원 적지만** 사회보험료가 **{B_[1][1]-A_[1][1]}만원 많아** 실수령은 **{abs(dnet)}만원 줄어드는 결과임**",
     "foot": foot_ex(["제도 A · B는 가상의 제도"]),
     "total": {"value": 5000, "unit": "만원"}, "dec": 0, "deltaText": "B의 실수령 차이",
     "a": {"name": "제도 A", "sub": "세금 중심", "items": [{"name": n, "value": v, "tone": t} for n, v, t in A_]},
     "b": {"name": "제도 B", "sub": "보험료 중심", "items": [{"name": n, "value": v, "tone": t} for n, v, t in B_]},
     "band": "세금이 줄어도 **다른 부담이 더 늘면** 손에 쥐는 돈은 **오히려 줄 수 있음**"}, False)

# ---- 쓰기
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
for _o in out:  # 결론 띠 없음(SKILL.md 5절) — 장 아래 결론 글은 헤드메시지로
    if isinstance(_o["slide"].get("band"), str):
        _o["slide"].pop("band")
json.dump(out, open(ROOT / "library" / "mockups" / "v4" / "F10.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
slides = []
for m in out:
    sl = dict(m["slide"])
    for k in ("chart",):
        pass
    slides.append(sl)
deck = {"schema": 3, "meta": {"session": "R1", "title": "F10 1차 목업"}, "slides": slides}
json.dump(deck, open(ROOT / "style" / "demo4_r1_F10.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
real_n = sum(1 for m in out if "예시 값" not in m["tags"])
print("목업", len(out), "실제", real_n, "예시", len(out) - real_n)
