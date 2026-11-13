# F13 시나리오 8종(N139~N146) + F17 찬반 5종(N169~N173) + F15 나라 비교 6종(N155~N160) = 19종 — 2차 목업 만들기
# 실행: python -X utf8 tools/make_mockups4_F13.py
# 쓰는 부품(새 kind, 머리글자 sc) : scicicle · sccol3 · scfan · scmatrix · scgrid · scfork · scshift · scpayoff · scstake · scaxis · scscore · scseat · scissue · sccard · scrank · scscatter · scheat · scradar · scshare
# 실제 값 : N141(미국 10년물 지난 선) · N143(부채/GDP · 10년물) · N144(신호 지표 4개) · N155~N159(4개국 10년물 금리) — 나머지는 예시 값(익명)
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
S3 = ROOT / "data" / "snap"
GOT = "2026.11.13"
EX = "숫자는 모양을 보이기 위한 예시 값"


def snap4(i):
    return json.loads((S4 / f"{i}.json").read_text(encoding="utf-8"))


def snap3(i):
    return json.loads((S3 / f"{i}.json").read_text(encoding="utf-8"))


def eb(group, topic, basis):
    return {"group": group, "topic": topic, "basis": basis}


def ft(notes, source, asof=GOT):
    return {"notes": notes, "source": source, "asof": asof}


items = []


def add(no, family, variant, title, tags, facts, slide):
    items.append({"id": no, "kind": slide["kind"], "family": family, "variant": variant, "title": title, "tags": ["4판"] + tags, "facts": facts, "slide": slide})


def pct(v, d=0):
    return f"{v:.{d}f}"


# ================= 실제 자료 =================
us_m = {k.replace(".", "-"): v for k, v in snap3("fred_dgs10")["data"]}  # 2021-01 ~ 2026-10 월평균
mon = [f"{y}-{m:02d}" for y in range(2021, 2027) for m in range(1, 13)]
mon = [m for m in mon if m <= "2026-09"]


def oecd(i):
    d = {k[:7]: v for k, v in snap4(i)["data"]}
    return [d[m] for m in mon]


Y10 = {"KOR": oecd("IRLTLT01KRM156N"), "USA": [us_m[m] for m in mon], "JPN": oecd("IRLTLT01JPM156N"), "DEU": oecd("IRLTLT01DEM156N")}
NM = {"KOR": "한국", "USA": "미국", "JPN": "일본", "DEU": "독일"}
ORDER = ["KOR", "USA", "JPN", "DEU"]
YSRC = "OECD(IRLTLT01KRM156N · IRLTLT01JPM156N · IRLTLT01DEM156N), FRED(DGS10)"


def stats(s):
    d = [s[i] - s[i - 1] for i in range(1, len(s))]
    mu = sum(d) / len(d)
    sd = math.sqrt(sum((x - mu) ** 2 for x in d) / len(d))
    return {"cur": s[-1], "chg1": s[-1] - s[-13], "chg5": s[-1] - s[0], "frommax": s[-1] - max(s), "chg6": s[-1] - s[-7], "vol": sd, "max": max(s), "min": min(s)}


ST = {c: stats(Y10[c]) for c in ORDER}

# ================= F13 시나리오 =================
# ---- N139 시나리오 나무(아이시클) — 예시
L1 = [
    {"name": "물가 둔화", "p": 50, "children": [{"name": "연착륙", "p": 60, "v": 4.3}, {"name": "경기 침체", "p": 40, "v": 3.6}]},
    {"name": "물가 정체", "p": 30, "children": [{"name": "성장 유지", "p": 70, "v": 4.9}, {"name": "성장 둔화", "p": 30, "v": 4.4}]},
    {"name": "물가 재상승", "p": 20, "children": [{"name": "긴축 재개", "p": 55, "v": 5.8}, {"name": "성장 훼손", "p": 45, "v": 5.2}]},
]
lv = [(b["p"] * c["p"] / 100, c["v"], c["name"]) for b in L1 for c in b["children"]]
E139 = sum(p * v for p, v, _ in lv) / sum(p for p, _, _ in lv)
top = max(lv)
add("N139", "F13", "시나리오 나무", "물가 갈래 아래 경기 갈래, 결과 숫자와 평균", ["예시값"],
    {"1단 갈래": {b["name"]: b["p"] for b in L1}, "끝 갈래 수": len(lv), "확률 가중 평균(%)": round(E139, 2), "가장 큰 끝 갈래": top[2]},
    {"kind": "scicicle", "eyebrow": eb("시나리오", "물가 · 경기 갈래별 연말 10년물", "가능성은 100% 쌓기, 결과는 연말 10년물 금리(%), 예시 값"),
     "head": f"물가가 꺾이느냐에 따라 길이 갈려 끝 갈래 **{len(lv)}개**의 연말 10년물이 **3.6~5.8%**로 흩어지며 확률 가중 평균은 **{E139:.2f}%**임 · 가장 큰 갈래는 **{top[2]} {top[0]:.0f}%**임",
     "root": {"title": "올해 말 10년물 금리", "sub": "물가 → 경기 순서로 갈림"}, "level1": L1, "unit": "%", "dec": 1, "resTitle": "연말 10년물", "expText": "확률 가중 평균",
     "foot": ft([EX, "갈래 폭 = 가능성, 두 번째 줄 폭 = 앞 갈래 가능성 × 갈래 안 몫"], "부품 시험용 가상 자료")})

# ---- N140 시나리오 3칸 — 예시
add("N140", "F13", "시나리오 3칸", "기본 · 낙관 · 비관 조건과 숫자와 확률", ["예시값"],
    {"기본": 55, "낙관": 25, "비관": 20},
    {"kind": "sccol3", "eyebrow": eb("시나리오", "내년 경기 3가지 시나리오", "가능성(%) · 연말 숫자, 예시 값"),
     "head": "내년 경기는 **기본 55%** · **낙관 25%** · **비관 20%**의 세 갈래로 보며 **비관**에서는 성장률 **0.4%**, 기준금리 **2.50%**까지 내려감",
     "cases": [
         {"name": "기본", "p": 55, "tone": "main", "cond": ["물가가 천천히 목표로 내려옴", "고용은 완만하게 둔화", "금리를 두 번 내림"], "stats": [{"k": "성장률", "v": "1.8%"}, {"k": "연말 기준금리", "v": "3.25%"}, {"k": "연말 10년물", "v": "4.3%"}]},
         {"name": "낙관", "p": 25, "tone": "g65", "cond": ["생산성이 올라 성장이 받쳐줌", "물가가 빨리 내려옴", "금리를 세 번 내림"], "stats": [{"k": "성장률", "v": "2.6%"}, {"k": "연말 기준금리", "v": "3.00%"}, {"k": "연말 10년물", "v": "4.0%"}]},
         {"name": "비관", "p": 20, "tone": "warn", "cond": ["고용이 갑자기 꺾임", "소비와 투자가 함께 줄어듦", "금리를 급하게 내림"], "stats": [{"k": "성장률", "v": "0.4%"}, {"k": "연말 기준금리", "v": "2.50%"}, {"k": "연말 10년물", "v": "3.4%"}]}],
     "foot": ft([EX, "가능성은 세 시나리오 합 100%"], "부품 시험용 가상 자료")})

# ---- N141 경로 갈라짐 선 — 실제 지난 선 + 예시 경로
hist_k = sorted(us_m)[-24:]
hist_v = [us_m[k] for k in hist_k]
HL = [k.replace("-", ".") for k in hist_k]
last = hist_v[-1]
FL = [f"{2026 + (10 + k) // 12}.{(10 + k) % 12 + 1:02d}" for k in range(1, 13)]
FL = [f"2026.{m:02d}" for m in (11, 12)] + [f"2027.{m:02d}" for m in range(1, 11)]


def path(end, bend=1.6):
    return [round(last + (end - last) * (1 - (1 - (k + 1) / 12) ** bend), 3) for k in range(12)]


PP = [("연착륙", "물가 둔화 · 금리 인하", 50, "main", 4.4), ("재가속", "물가 재상승 · 금리 유지", 25, "warn", 6.0), ("침체", "고용 급락 · 급한 인하", 25, "cmp", 3.4)]
avg_end = sum(p * e for _, _, p, _, e in PP) / 100
add("N141", "F13", "경로 갈라짐 선", "미국 10년물 지난 24개월 + 시나리오 3경로", ["실제값", "예시값"],
    {"기준월": HL[-1], "10년물(%)": round(last, 3), "시나리오 끝값(%)": {n: e for n, _, _, _, e in PP}, "가중 평균 끝값(%)": round(avg_end, 2)},
    {"kind": "scfan", "eyebrow": eb("금리", "미국 10년물 금리 앞으로 갈래", "월평균, 단위: %, 2026.10까지 실제 값 · 이후 경로는 예시 값"),
     "head": f"미국 10년물은 2026년 10월 **{last:.2f}%**에서 1년 뒤 **연착륙 4.4% · 재가속 6.0% · 침체 3.4%**로 갈라질 수 있으며 확률 가중 평균은 **{avg_end:.2f}%**임",
     "hist": {"labels": HL, "data": [round(v, 3) for v in hist_v]}, "fut": {"labels": FL, "paths": [{"name": n, "sub": sub, "p": p, "tone": t, "data": path(e)} for n, sub, p, t, e in PP]},
     "y": {"min": 3, "max": 6.5, "step": 0.5, "dec": 1, "title": "%", "unit": "%"}, "avg": True, "nowText": "지금 " + HL[-1], "zoneText": "시나리오 구간(예시 값)",
     "foot": ft([EX + "(2026.10 이후 경로 · 가능성)", "굵은 짙은 초록 선은 실제 월평균, 갈라지는 선은 가상 경로"], "FRED(DGS10) 월평균", "2026.10")})

# ---- N142 결정 매트릭스 — 예시
ACT = [{"name": "채권 비중 확대", "sub": "금리가 내리면 이득"}, {"name": "현금 유지", "sub": "움직이지 않음"}, {"name": "주식 비중 확대", "sub": "성장이 받쳐주면 이득"}]
STA = [{"name": "연착륙", "sub": "물가 둔화", "p": 50}, {"name": "물가 재상승", "sub": "금리 다시 오름", "p": 25}, {"name": "침체", "sub": "성장 급락", "p": 25}]
CEL = [[5, -4, 9], [3.5, 3.5, 3.5], [12, -8, -15]]
EXP = [sum(v * st["p"] for v, st in zip(r, STA)) / 100 for r in CEL]
bi = EXP.index(max(EXP))
add("N142", "F13", "결정 매트릭스", "행동 3가지 × 상황 3가지 결과표", ["예시값"],
    {"기대 수익(%)": {a["name"]: round(e, 2) for a, e in zip(ACT, EXP)}, "평균 최고 행동": ACT[bi]["name"]},
    {"kind": "scmatrix", "eyebrow": eb("의사결정", "행동 × 상황 연간 수익률", "연간 수익률(%), 상황 가능성 가중, 예시 값"),
     "head": f"상황마다 최선의 행동이 달라 **연착륙**에는 **주식**, **침체**에는 **채권**이 좋으나 가능성을 곱한 평균은 **{ACT[bi]['name']} {EXP[bi]:+.2f}%**로 가장 높음",
     "actions": ACT, "states": STA, "cells": CEL, "unit": "%", "dec": 1,
     "foot": ft([EX, "굵은 테두리 = 그 상황에서 가장 좋은 행동, 짙은 칸 = 평균이 가장 높은 행동"], "부품 시험용 가상 자료")})

# ---- N143 민감도 격자 — 실제 부채/GDP · 10년물로 이자 부담 계산
debt = snap4("GFDEGDQ188S")["data"][-1]
r0 = us_m["2026-10"]
ys_v = [debt[1] + 10 * k for k in range(-2, 3)]
xs_v = [r0 + 0.5 * k for k in range(-4, 3)]
DAT = [[round(d * r / 100, 2) for r in xs_v] for d in ys_v]
base = debt[1] * r0 / 100
thr = round(base * 1.2, 2)
add("N143", "F13", "민감도 격자", "금리와 부채 비율을 바꾸면 이자 부담이 어떻게 변하는가", ["실제값"],
    {"부채/GDP(%)": round(debt[1], 2), "부채 기준 분기": debt[0][:7], "10년물(%)": round(r0, 3), "이자 부담(%GDP)": round(base, 2), "경계(%GDP)": thr},
    {"kind": "scgrid", "eyebrow": eb("재정", "금리 · 부채 비율 민감도", "부채 비율 × 금리 = GDP 대비 이자 부담(%), 단순 계산"),
     "head": f"미국 연방부채 **GDP의 {debt[1]:.0f}%**에 10년물 **{r0:.2f}%**를 곱하면 이자 부담은 **GDP의 {base:.1f}%**이고 금리가 **0.5%p** 오르면 **{debt[1] * 0.5 / 100:.1f}%p** 더 늘어남",
     "xs": [f"{v:.1f}%" for v in xs_v], "ys": [f"{v:.0f}%" for v in ys_v], "data": DAT, "xTitle": "10년물 금리(가로)", "yTitle": "부채/GDP(세로)", "dec": 1, "suf": "%",
     "base": {"xi": 4, "yi": 2, "label": "지금"}, "thr": {"v": thr, "label": "현재의 1.2배"},
     "side": {"title": "한 칸 움직이면", "rows": [{"k": "금리 +0.5%p", "v": f"+{debt[1] * 0.5 / 100:.2f}%p"}, {"k": "부채 비율 +10%p", "v": f"+{r0 * 10 / 100:.2f}%p"}, {"k": f"주황 선 안쪽(현재의 1.2배 {thr:.1f}% 이상)", "v": "부담 급증", "warn": True}], "note": "모든 부채에 10년물 금리가 붙는다고 본 단순 계산"},
     "foot": ft(["이자 부담 = 부채/GDP × 10년물 금리, 모든 부채에 같은 금리를 가정한 단순 계산(실제 평균 이자율은 더 낮음)", f"부채/GDP는 {debt[0][:4]}년 {int(debt[0][5:7]) // 3 + 1}분기, 10년물은 2026.10 월평균"], "FRED(GFDEGDQ188S, DGS10)", "2026.10")})

# ---- N144 갈림길 + 신호 지표 — 실제 지표 4개 + 예시 가능성
t3 = snap4("T10Y3M")["data"][-1]
vix = snap4("VIXCLS")["data"][-1]
icsa = snap4("ICSA")["data"][-1]
un = snap3("fred_unrate")["data"][-1]
SIG = [
    {"name": "10년물 − 3개월물", "src": "FRED(T10Y3M)", "value": t3[1], "unit": "%p", "dec": 2, "lo": -1, "hi": 3, "thr": 0, "thrLabel": "0 아래 = 역전", "badSide": "below"},
    {"name": "실업률", "src": "FRED(UNRATE) 월", "value": un[1], "unit": "%", "dec": 1, "lo": 3, "hi": 6, "thr": 4.5, "thrLabel": "4.5% 넘으면", "badSide": "above"},
    {"name": "신규 실업수당 청구", "src": "FRED(ICSA) 주", "value": icsa[1] / 10000, "unit": "만 건", "dec": 1, "lo": 15, "hi": 35, "thr": 25, "thrLabel": "25만 건", "badSide": "above"},
    {"name": "VIX 변동성", "src": "FRED(VIXCLS)", "value": vix[1], "unit": "", "dec": 1, "lo": 10, "hi": 40, "thr": 25, "thrLabel": "25", "badSide": "above"}]
nbad = sum(1 for s_ in SIG if (s_["badSide"] == "above" and s_["value"] > s_["thr"]) or (s_["badSide"] == "below" and s_["value"] < s_["thr"]))
add("N144", "F13", "갈림길 + 신호 지표", "연착륙과 침체 두 길, 갈림길에서 미리 볼 지표 4개", ["실제값", "예시값"],
    {"지표": {s_["name"]: round(s_["value"], 3) for s_ in SIG}, "침체 쪽 지표 수": nbad, "가능성(예시)": {"연착륙": 70, "침체": 30}},
    {"kind": "scfork", "eyebrow": eb("경기", "연착륙 · 침체 갈림길", "신호 지표 4개의 최근 값, 가능성은 예시 값"),
     "head": f"갈림길의 두 길 중 가능성은 **연착륙 70%** · **침체 30%**(예시)이고 미리 볼 지표 4개는 아직 **침체 쪽 {nbad}개**뿐이라 **위쪽 길 신호**가 이어지는 중임",
     "now": {"label": "지금", "sub": "2026.11"}, "forks": [{"name": "연착륙", "sub": "물가 둔화 · 성장 유지", "p": 70, "tone": "main", "short": "연착륙 쪽"}, {"name": "침체", "sub": "고용 악화 · 성장 급락", "p": 30, "tone": "warn", "short": "침체 쪽"}], "signals": SIG,
     "foot": ft(["두 길의 가능성은 모양을 보이기 위한 예시 값, 지표 값은 실제 최근치", "기준선은 널리 쓰이는 어림 기준(역전 0%p · 실업률 4.5% · 청구 25만 건 · VIX 25)"], "FRED(T10Y3M, UNRATE, ICSA, VIXCLS)", "2026.11.12")})

# ---- N145 확률 변화 막대 — 예시
SH = [{"name": "0.50%p 인하", "a": 5, "b": 2, "tone": "g40"}, {"name": "0.25%p 인하", "a": 50, "b": 28, "tone": "g65"}, {"name": "동결", "a": 45, "b": 70, "tone": "dark"}]
bigd = max(SH, key=lambda q: abs(q["b"] - q["a"]))
add("N145", "F13", "확률 변화 막대", "발표 전후 시장 가격에 든 결정 확률", ["예시값"],
    {"전": {q["name"]: q["a"] for q in SH}, "후": {q["name"]: q["b"] for q in SH}, "가장 크게 변한 칸": bigd["name"]},
    {"kind": "scshift", "eyebrow": eb("금리", "고용 발표 전후 시장이 보는 결정", "시장 가격에 든 확률(%), 예시 값"),
     "head": f"고용 발표 뒤 시장 가격에 든 **동결 확률**이 **45%에서 70%**로 뛰고 **0.25%p 인하**는 **50%에서 28%**로 줄어 **{abs(bigd['b'] - bigd['a'])}%p** 크게 움직임",
     "before": {"title": "발표 전", "sub": "시장 가격 기준"}, "after": {"title": "발표 후", "sub": "시장 가격 기준"}, "items": SH, "unit": "%", "dunit": "%p", "event": {"text": "고용 발표"},
     "foot": ft([EX, "띠는 같은 결정 확률이 어디서 어디로 옮겨 갔는지를 나타냄"], "부품 시험용 가상 자료")})

# ---- N146 손익 꺾인 선 — 보호적 풋(가상)
K, PR, S0 = 95, 3, 100
pnl = lambda p: (p - S0) + max(K - p, 0) - PR
PTS = [[70, pnl(70)], [K, pnl(K)], [130, pnl(130)]]
be = S0 + PR
add("N146", "F13", "손익 꺾인 선", "보유 + 풋옵션 매수의 가격별 손익", ["예시값"],
    {"기준 가격": S0, "행사가": K, "프리미엄": PR, "최대 손실": pnl(K), "손익분기": be},
    {"kind": "scpayoff", "eyebrow": eb("헤지", "보호적 풋(보유 + 풋 매수) 손익", "만기 때 가격별 손익, 기초자산 가 100 기준, 예시 값"),
     "head": f"자산을 보유하며 행사가 **{K}**의 풋을 **{PR}**에 사두면 가격이 아무리 내려도 손실은 **{-pnl(K)}**에서 **멈추고** 가격이 **{be}** 위로 올라서야 이익이 남",
     "x": {"min": 70, "max": 130, "step": 10, "title": "만기 때 기초자산 가격(가)", "dec": 0}, "y": {"min": -20, "max": 30, "step": 10, "unit": "손익", "dec": 0}, "pts": PTS,
     "marks": [{"type": "now", "x": S0, "label": "지금 가격 100"},
               {"type": "kink", "x": K, "y": pnl(K), "label": f"꺾이는 점 · 행사가 {K}", "sub": f"여기서부터 손실이 {-pnl(K)}에 고정", "dx": -150, "dy": 50, "anchor": "start"},
               {"type": "be", "x": be, "label": f"손익분기 {be}", "sub": "넘으면 이익", "dx": 26, "dy": 44, "anchor": "start"}],
     "zones": [{"x": 98, "y": 480 - 0, "text": ""}],
     "box": {"title": "읽는 법", "x": 100, "y": 34, "rows": [{"k": "최대 손실", "v": f"{pnl(K)}", "warn": True}, {"k": "풋 비용(프리미엄)", "v": f"{PR}"}, {"k": "손익분기 가격", "v": f"{be}"}, {"k": "가격 상승 시 이익", "v": "제한 없음"}]},
     "foot": ft([EX, "손익 = (만기 가격 − 100) + 풋 가치 − 풋 비용, 세금 · 수수료 제외"], "부품 시험용 가상 자료")})
items[-1]["slide"]["zones"] = []

# ================= F17 찬반 · 쟁점 =================
# ---- N169 이해관계자 표 — 예시
STK = [
    {"name": "국내 생산 기업", "sub": "수입품과 경쟁", "gain": "수입품 값이 올라 판매 늘 수 있음", "loss": "수입 원료 · 부품 비용 상승", "net": 2},
    {"name": "수입 기업", "sub": "해외 물건을 들여옴", "gain": "", "loss": "관세 부담으로 이익 감소", "net": -4},
    {"name": "소비자", "sub": "물건을 삼", "gain": "", "loss": "수입품 값 상승으로 생활비 증가", "net": -3},
    {"name": "정부", "sub": "세금을 걷음", "gain": "관세 수입 증가", "loss": "상대국 보복 위험", "net": 2},
    {"name": "수출 기업", "sub": "해외에 물건을 팔음", "gain": "", "loss": "상대국 보복 관세를 맞을 위험", "net": -2},
    {"name": "보호 업종 근로자", "sub": "경쟁 압박을 받던 쪽", "gain": "일자리 유지 가능성", "loss": "수입 부품 의존 업종은 일자리 불안", "net": 1}]
pos = [r for r in STK if r["net"] > 0]
neg = [r for r in STK if r["net"] < 0]
add("N169", "F17", "이해관계자 표", "관세 인상에서 누가 얻고 누가 잃는가", ["예시값"],
    {"이득 주체": [r["name"] for r in pos], "손해 주체": [r["name"] for r in neg], "점수 합": sum(r["net"] for r in STK)},
    {"kind": "scstake", "eyebrow": eb("정책", "관세 인상의 이해관계자", "주체별 얻는 것 · 잃는 것 · 순 영향 점수(−5~+5), 예시 값"),
     "head": f"관세 인상으로 이득을 보는 주체는 **{len(pos)}곳**이고 손해를 보는 주체는 **{len(neg)}곳**이며 손해가 가장 큰 쪽은 **수입 기업 −4점**으로 점수 합은 **{sum(r['net'] for r in STK):+d}점**임",
     "rows": STK, "scale": {"min": -5, "max": 5, "unit": "점"}, "titles": {"gain": "얻는 것", "loss": "잃는 것", "net": "순 영향(점수)"},
     "foot": ft([EX, "순 영향 점수는 얻는 것과 잃는 것을 합쳐 매긴 어림 점수"], "부품 시험용 가상 자료")})

# ---- N170 쟁점 축 — 예시
PPL = [("위원 가", 9, 0), ("위원 나", 12, 0), ("위원 다", 15, 0), ("위원 라", 29, 0), ("위원 마", 33, 1), ("위원 바", 42, 0), ("위원 사", 50, 1), ("위원 아", 53, 1), ("위원 자", 57, 1), ("위원 차", 64, 1), ("위원 카", 67, 1), ("위원 타", 88, 1)]
pos_s = sorted(p[1] for p in PPL)
med = (pos_s[len(pos_s) // 2 - 1] + pos_s[len(pos_s) // 2]) / 2
nl = sum(1 for p in PPL if p[1] < 50)
add("N170", "F17", "쟁점 축", "금리 인하 시점을 두고 왼쪽 주장과 오른쪽 주장 사이 인물 위치", ["예시값"],
    {"인원": len(PPL), "왼쪽 쪽": nl, "중앙값": med},
    {"kind": "scaxis", "eyebrow": eb("쟁점", "금리 인하 시점 논쟁", "위원 12명의 입장 위치(0~100), 예시 값"),
     "head": f"금리 인하 시점을 두고 위원 **{len(PPL)}명** 중 **{nl}명**이 **조기 인하** 쪽에 가깝고 중앙값은 **{med:.0f}**로 **가운데 근처**에 있어 위원 의견이 한쪽으로 쏠리지 않고 갈려 있음",
     "left": {"title": "주장 가: 조기에 내려야 함", "lines": ["물가가 목표에 가까워짐", "높은 금리가 성장을 누름", "기다리는 동안 고용이 약해질 수 있음"]}, "right": {"title": "주장 나: 더 기다려야 함", "lines": ["서비스 물가가 아직 높음", "너무 일찍 내리면 물가가 되살아남", "인하 신호는 한 번 주면 되돌리기 어려움"]},
     "people": [{"name": n, "pos": p, "group": g} for n, p, g in PPL], "groups": ["A 집단", "B 집단"], "ends": {"left": "주장 가에 가까움", "mid": "중간", "right": "주장 나에 가까움"},
     "foot": ft([EX, "위원 이름 · 입장은 가상이며 실제 인물과 무관"], "부품 시험용 가상 자료")})

# ---- N171 쟁점별 점수 표 — 예시
SC = [("비용 부담", "시행에 드는 돈", 2, 4), ("효과 입증", "개선이 증명되었는지", 4, 3), ("형평성", "집단 간 공정함", 3, 3), ("국제 정합성", "다른 나라와 보조", 5, 2), ("시행 가능성", "현장에서 돌아갈지", 3, 4)]
sp_ = sum(r[2] for r in SC)
sc_ = sum(r[3] for r in SC)
add("N171", "F17", "쟁점별 점수 표", "규제 도입 찬반 근거의 세기를 쟁점마다 비교", ["예시값"],
    {"찬성 합": sp_, "반대 합": sc_, "쟁점 수": len(SC)},
    {"kind": "scscore", "eyebrow": eb("쟁점", "규제 도입 찬반 근거 세기", "쟁점별 근거 세기 점수(0~5), 예시 값"),
     "head": f"쟁점 **{len(SC)}개** 중 **찬성이 센 쟁점은 2개**, **반대가 센 쟁점은 2개**, **팽팽한 쟁점은 1개**이며 점수 합은 **찬성 {sp_}점 · 반대 {sc_}점**으로 근소한 차이임",
     "rows": [{"name": n, "sub": sb, "pro": p, "con": c} for n, sb, p, c in SC], "max": 5, "proName": "찬성", "conName": "반대",
     "foot": ft([EX, "근거 세기는 증거 · 사례의 양과 신뢰도를 어림 점수로 나타낸 것"], "부품 시험용 가상 자료")})
tiebreak = [(n, p - c) for n, _, p, c in SC]
assert sum(1 for _, d in tiebreak if d >= 1) == 2 and sum(1 for _, d in tiebreak if d <= -1) == 2 and sum(1 for _, d in tiebreak if d == 0) == 1

# ---- N172 의석 반원 — 예시
PAR = [{"name": "가당", "seats": 62, "tone": "dark"}, {"name": "나당", "seats": 48, "tone": "cmp"}, {"name": "다당", "seats": 22, "tone": "g65"}, {"name": "라당", "seats": 12, "tone": "g40"}, {"name": "무소속", "seats": 6, "tone": "gray"}]
NS = sum(p["seats"] for p in PAR)
maj = NS // 2 + 1
add("N172", "F17", "의석 반원", "의회 150석을 반원 좌석으로 그리고 과반선을 표시", ["예시값"],
    {"총 의석": NS, "과반": maj, "정당 의석": {p["name"]: p["seats"] for p in PAR}},
    {"kind": "scseat", "eyebrow": eb("의회", "법안 표결 구성", "정당별 의석 수(석), 예시 값"),
     "head": f"총 **{NS}석** 의회에서 과반은 **{maj}석**이며 제1당 **가당 62석**만으로는 모자라고 **가당 + 다당 {62 + 22}석**이 모여야 **과반을 넘김**",
     "parties": PAR, "unit": "석", "caption": f"{NS}석", "sub": "의회 전체", "majorityText": "과반", "coalitions": [{"name": "가당 + 다당", "idx": [0, 2]}, {"name": "나당 + 라당", "idx": [1, 3]}],
     "foot": ft([EX, "정당 이름 · 의석은 가상이며 실제 의회와 무관"], "부품 시험용 가상 자료")})

# ---- N173 쟁점 나무 — 예시
add("N173", "F17", "쟁점 나무", "금융 규제 완화 찬반 논거와 반론", ["예시값"],
    {"찬성 논거": 3, "반대 논거": 3},
    {"kind": "scissue", "eyebrow": eb("쟁점", "금융 규제 완화 찬반", "논거 · 반론 · 근거 세기(점 1~3개), 예시 값"),
     "head": "금융 규제 완화를 두고 **찬성 3개 논거**와 **반대 3개 논거**가 맞서며 논거마다 반론이 붙어 **근거 세기가 가장 센 쪽**은 **찬성의 자금 공급 확대**임",
     "q": {"title": "금융 규제를 완화해야 하는가", "sub": "쟁점 하나 → 찬성 · 반대 논거 → 반론"},
     "pro": {"title": "찬성 논거", "items": [{"t": "기업에 돈이 더 흐름", "r": "돈이 부동산으로만 쏠릴 수 있음", "w": 3}, {"t": "금융사 비용이 줄어듦", "r": "줄어든 비용이 소비자에게 가지 않을 수 있음", "w": 2}, {"t": "새 금융 서비스가 늘어남", "r": "검증되지 않은 상품이 늘 수 있음", "w": 2}]},
     "con": {"title": "반대 논거", "items": [{"t": "금융 위기 위험이 커짐", "r": "위험 관리 기술이 발전했음", "w": 3}, {"t": "소비자 피해가 늘어남", "r": "공시 의무로 막을 수 있음", "w": 2}, {"t": "부실 때 세금으로 메움", "r": "구제 금융 제한 장치를 둘 수 있음", "w": 1}]},
     "foot": ft([EX, "논거 · 반론은 일반적인 논의를 줄여 쓴 예시"], "부품 시험용 가상 자료")})

# ================= F15 나라 비교 (실제 4개국 10년물) =================
f2 = lambda v: f"{v:.2f}"
sp_all = lambda c: [round(v, 3) for v in Y10[c]]
# ---- N155 나라 카드 격자
cards = []
for c in ORDER:
    st = ST[c]
    cards.append({"name": NM[c], "sub": "10년물 국채 금리", "hi": c == "KOR",
                  "metrics": [{"k": "10년물 금리(2026.09)", "v": round(st["cur"], 2), "dec": 2, "unit": "%", "delta": {"text": f"2021.01보다 {st['chg5']:+.2f}%p".replace("-", "−"), "dir": "up" if st["chg5"] >= 0 else "down"}},
                              {"k": "1년 전보다", "v": round(st["chg1"], 2), "dec": 2, "unit": "%p", "sign": True},
                              {"k": "6개월 전보다", "v": round(st["chg6"], 2), "dec": 2, "unit": "%p", "sign": True}],
                  "spark": {"data": sp_all(c), "title": "10년물 금리 월평균 추이(%)", "lo": -1, "hi": 6, "dec": 2, "unit": "%", "first": "2021.01", "last": "2026.09"}})
add("N155", "F15", "나라 카드 격자", "4개국 10년물 금리 핵심 숫자 셋과 추이", ["실제값"],
    {"기준월": "2026.09", **{NM[c]: {"10년물": round(ST[c]["cur"], 3), "1년 전보다": round(ST[c]["chg1"], 3), "6개월 전보다": round(ST[c]["chg6"], 3)} for c in ORDER}},
    {"kind": "sccard", "eyebrow": eb("금리", "4개국 10년물 금리 카드", "2026년 9월 월평균, 단위: %"),
     "head": f"2026년 9월 10년물은 **미국 {ST['USA']['cur']:.2f}%** · **한국 {ST['KOR']['cur']:.2f}%** · **일본 {ST['JPN']['cur']:.2f}%** · **독일 {ST['DEU']['cur']:.2f}%**로 한국은 **2021년 1월보다 {ST['KOR']['chg5']:.2f}%p** 올랐음",
     "cards": cards, "foot": ft(["자료가 있는 4개국만 비교, 미국은 DGS10 월평균 · 나머지는 OECD 월평균", "1년 전 · 6개월 전보다 = 2026년 9월 월평균에서 그때 월평균을 뺀 값"], YSRC, "2026.09")})

# ---- N156 나라 순위 + 한국 강조 — 2021.01 대비 변화
rk = sorted(ORDER, key=lambda c: -ST[c]["chg5"])
kr_rank = rk.index("KOR") + 1
add("N156", "F15", "나라 순위 + 한국 강조", "2021.01 이후 10년물 상승폭 순위, 한국 기둥만 진하게", ["실제값"],
    {"순위": [NM[c] for c in rk], **{NM[c]: round(ST[c]["chg5"], 3) for c in ORDER}, "한국 순위": kr_rank},
    {"kind": "scrank", "eyebrow": eb("금리", "10년물 금리 상승폭 순위", "2021.01 대비 2026.09 변화, 단위: %p"),
     "head": f"2021년 1월 이후 10년물 금리는 **{NM[rk[0]]} +{ST[rk[0]]['chg5']:.2f}%p**가 가장 많이 올랐고 **한국 +{ST['KOR']['chg5']:.2f}%p**는 4개국 중 **{kr_rank}번째**이며 **{NM[rk[-1]]}**이 가장 덜 오름",
     "rows": [{"name": NM[c], "value": round(ST[c]["chg5"], 3), "hi": c == "KOR"} for c in ORDER], "unit": "%p", "dec": 2, "baseText": "한국 수준", "rankText": "위", "sign": True,
     "foot": ft(["상승폭 = 2026년 9월 월평균 − 2021년 1월 월평균", "점선과 꼬리표 = 한국과의 차이"], YSRC, "2026.09")})

# ---- N157 나라 산점(1년 전 vs 지금, 달마다 궤적)
SER = []
tone = {"KOR": "dark", "USA": "cmp", "JPN": "g65", "DEU": "axis"}
allp = []
for c in ORDER:
    pts = [[round(Y10[c][i - 12], 3), round(Y10[c][i], 3)] for i in range(12, len(mon))]
    allp += [v for p in pts for v in p]
    SER.append({"name": NM[c], "tone": tone[c], "hi": c == "KOR", "pts": pts})
lo_ = math.floor(min(allp)); hi_ = math.ceil(max(allp))
add("N157", "F15", "나라 산점", "1년 전 금리(가로)와 지금 금리(세로), 달마다 찍은 궤적", ["실제값"],
    {"기간": f"{mon[12]}~{mon[-1]}", "점 수": len(mon) - 12, "범위(%)": [lo_, hi_], **{NM[c]: {"1년 전": round(Y10[c][-13], 3), "지금": round(Y10[c][-1], 3)} for c in ORDER}},
    {"kind": "scscatter", "eyebrow": eb("금리", "나라별 10년물: 1년 전 vs 지금", "월평균 쌍(2022.01~2026.09), 단위: %"),
     "head": f"점마다 1년 전 금리와 지금 금리를 짝지어 찍으면 **한국**은 **{ST['KOR']['cur'] - ST['KOR']['chg1']:.2f}%에서 {ST['KOR']['cur']:.2f}%**로 대각선 **위쪽**(올랐음)에 있고 **일본 {ST['JPN']['cur'] - ST['JPN']['chg1']:.2f}→{ST['JPN']['cur']:.2f}%**도 올랐음",
     "x": {"min": lo_, "max": hi_, "step": 1, "title": "1년 전 10년물 금리(%)", "dec": 0}, "y": {"min": lo_, "max": hi_, "step": 1, "title": "지금 10년물 금리(%)", "dec": 0}, "suf": "%", "series": SER, "diag": {"up": "1년 전보다 올랐음", "down": "1년 전보다 내렸음"},
     "foot": ft(["점선 대각선 = 1년 전과 같은 값, 큰 점 = 2026년 9월, 가는 점 = 앞선 달들(같은 나라)", "자료가 있는 4개국만 표시, 미국은 DGS10 월평균 · 나머지는 OECD 월평균"], YSRC, "2026.09")})

# ---- N158 나라 × 지표 색 표
COLS = [("10년물 금리", "2026.09, %", "cur", 2, "%", False), ("1년 전보다", "%p", "chg1", 2, "%p", True), ("2021.01보다", "%p", "chg5", 2, "%p", True), ("6개월 전보다", "%p", "chg6", 2, "%p", True), ("월간 변동폭", "월 변화 표준편차, %p", "vol", 2, "%p", False)]
hcols = [{"name": n, "sub": sb, "dec": d, "unit": u, "sign": sg, "data": [round(ST[c][k], 3) for c in ORDER]} for n, sb, k, d, u, sg in COLS]
hi_us = max(ORDER, key=lambda c: ST[c]["cur"])
lo_jp = min(ORDER, key=lambda c: ST[c]["cur"])
add("N158", "F15", "나라 × 지표 색 표", "4개국 × 지표 5개, 칸마다 높낮이 색", ["실제값"],
    {"지표": [c[0] for c in COLS], **{NM[c]: {n[0]: round(ST[c][n[2]], 3) for n in COLS} for c in ORDER}},
    {"kind": "scheat", "eyebrow": eb("금리", "나라 × 지표 색 표", "10년물 금리 기준 5지표, 지표마다 높낮이 색"),
     "head": f"10년물 금리 수준은 **{NM[hi_us]} {ST[hi_us]['cur']:.2f}%**가 가장 높고 **{NM[lo_jp]} {ST[lo_jp]['cur']:.2f}%**가 가장 낮으며 **한국**은 수준 **{sorted(ORDER, key=lambda c: -ST[c]['cur']).index('KOR') + 1}위**에 월간 변동폭은 **{sorted(ORDER, key=lambda c: -ST[c]['vol']).index('KOR') + 1}위**로 지표마다 순위가 다르게 나타남",
     "cols": hcols, "rows": [{"name": NM[c], "sub": "10년물 국채", "hi": c == "KOR"} for c in ORDER], "rankText": "위",
     "foot": ft(["지표마다 4개국 사이에서 클수록 짙은 초록, 칸 아래 숫자 = 지표 안 순위", "월간 변동폭 = 월 변화(%p)의 표준편차, 2021.01~2026.09"], YSRC, "2026.09")})

# ---- N159 레이더 — 한국 · 미국 · 일본, 4개국 최소~최대를 0~100 으로
AXK = [("금리 수준", "2026.09", "cur", "{:.2f}%"), ("1년 상승", "1년 전보다", "chg1", "{:+.2f}%p"), ("5년 상승", "2021.01보다", "chg5", "{:+.2f}%p"), ("6개월 상승", "6개월 전보다", "chg6", "{:+.2f}%p"), ("변동 폭", "월간", "vol", "{:.2f}%p")]


def norm(k, c):
    vs = [ST[x][k] for x in ORDER]
    lo, hi = min(vs), max(vs)
    return round(100 * (ST[c][k] - lo) / (hi - lo), 1) if hi > lo else 50


RS = []
for c, t in (("KOR", "dark"), ("USA", "cmp"), ("JPN", "g65")):
    RS.append({"name": NM[c], "tone": t, "vals": [norm(k, c) for _, _, k, _ in AXK], "raw": [f.format(ST[c][k]).replace("-", "−") for _, _, k, f in AXK]})
add("N159", "F15", "레이더", "한국 · 미국 · 일본 5개 항목을 거미줄에 겹침", ["실제값"],
    {"항목": [a[0] for a in AXK], "정규화 기준": "4개국 최소=0, 최대=100", **{r["name"]: r["vals"] for r in RS}},
    {"kind": "scradar", "eyebrow": eb("금리", "한국 · 미국 · 일본 10년물 레이더", "5개 항목을 4개국 최소 0~최대 100으로 환산, 2026.09"),
     "head": f"세 나라의 10년물을 5개 항목으로 겹치면 **미국**은 금리 수준 · 상승폭이 크고 **일본**은 **5년 상승 +{ST['JPN']['chg5']:.2f}%p**가 두드러지며 **한국**은 **{ST['KOR']['cur']:.2f}%**로 가운데에 있음",
     "axes": [{"name": a, "sub": b} for a, b, _, _ in AXK], "series": RS, "ringText": ["", "4개국 중 최대"], "tableTitle": "실제 값",
     "foot": ft(["거미줄 바깥일수록 4개국 중 큰 값(0 = 최소, 100 = 최대), 독일은 환산 기준에만 포함", "오른쪽 표는 환산 전 실제 값"], YSRC, "2026.09")})

# ---- N160 수입처 100% 막대 — 예시(익명)
YR = [str(y) for y in range(2019, 2027)]
SHD = [("가국", "dark", True, [22, 24, 27, 31, 34, 37, 40, 42]), ("나국", "g65", False, [30, 29, 28, 26, 24, 22, 21, 20]), ("다국", "g40", False, [18, 18, 17, 17, 16, 16, 15, 15]),
       ("라국", "gray", False, [12, 12, 11, 10, 10, 9, 8, 7]), ("그 밖", "light", False, [18, 17, 17, 16, 16, 16, 16, 16])]
for k in range(len(YR)):
    assert sum(d[3][k] for d in SHD) == 100, k
add("N160", "F15", "수입처 100% 막대", "연도별 수입처 몫이 어떻게 바뀌는가", ["예시값"],
    {"기간": f"{YR[0]}~{YR[-1]}", "가국 몫": [SHD[0][3][0], SHD[0][3][-1]], "나국 몫": [SHD[1][3][0], SHD[1][3][-1]]},
    {"kind": "scshare", "eyebrow": eb("무역", "원료 수입처 몫 변화", "연도별 수입 비중(%), 예시 값"),
     "head": f"원료 수입처 몫은 **가국**이 **{SHD[0][3][0]}%에서 {SHD[0][3][-1]}%**로 **{SHD[0][3][-1] - SHD[0][3][0]}%p** 커져 쏠림이 뚜렷하고 **나국**은 **{SHD[1][3][0]}%에서 {SHD[1][3][-1]}%**로 줄어 1위 자리를 내줌",
     "years": YR, "items": [{"name": n, "tone": t, "hi": h_, "data": d} for n, t, h_, d in SHD], "unit": "%", "dunit": "%p",
     "foot": ft([EX, "나라 이름은 가렸음(모양을 보이기 위한 가상 자료)"], "부품 시험용 가상 자료")})

# ================= 점검 · 쓰기 =================
order = ["N139", "N140", "N141", "N142", "N143", "N144", "N145", "N146", "N155", "N156", "N157", "N158", "N159", "N160", "N169", "N170", "N171", "N172", "N173"]
items.sort(key=lambda it: order.index(it["id"]))
BADH = [(it["id"], len(re.sub(r"[\s*]", "", it["slide"]["head"]))) for it in items if not 50 <= len(re.sub(r"[\s*]", "", it["slide"]["head"])) <= 90]
assert not BADH, BADH
for it in items:
    sl = it["slide"]
    if "예시값" in it["tags"]:
        assert "예시 값" in sl["eyebrow"]["basis"], it["id"]
        assert any("예시 값" in n for n in sl["foot"]["notes"]), it["id"]
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
(ROOT / "library" / "mockups" / "v4" / "F13.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R2", "title": "F13 시나리오 · 찬반 · 나라 비교 2차 목업"}, "slides": [it["slide"] for it in items]}
(ROOT / "style" / "demo4_r2_F13.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(items), "종", [(i["id"], len(re.sub(r"[\s*]", "", i["slide"]["head"]))) for i in items])
