# 엔진 3판 시험 덱 추가분 — 한·미 국채 금리 표 · 미국 2년물 vs 정책금리 · 금리차와 환율 · 한·미 물가 · 한국 GDP (공개 통계만)
# 실행: python -X utf8 tools/make_demo3_extra.py → style/demo3_extra.json  (CW48 덱도 이 장들을 가져다 씀)
import json
from pathlib import Path
import make_demo3 as D

LIB = Path(__file__).resolve().parent.parent
snap = lambda n: dict(json.loads((LIB / "data" / "snap" / f"{n}.json").read_text(encoding="utf-8"))["data"])  # noqa: E731
LAB = D.LAB
dgs2, dgs10, gdp = snap("fred_dgs2"), snap("fred_dgs10"), snap("ecos_gdp_qoq")

# 13 한·미 국채 금리(표)
m4 = ["2026.06", "2026.07", "2026.08", "2026.09"]
kr3 = [3.703, 3.758, 3.838, 4.011]
kr10 = [4.091, 4.261, 4.313, 4.407]
us2 = [round(dgs2[m], 2) for m in m4]
us10 = [round(dgs10[m], 2) for m in m4]
krb = [2.5, 2.75, 3.0, 3.0]
usb = [3.75, 3.75, 3.75, 4.0]
def row(nm, a, dec=2):
    ch = a[-1] - a[0]
    return [nm] + [f"{v:.{dec}f}" for v in a] + [("+" if ch > 0 else "") + f"{ch:.2f}%p" if abs(ch) > 1e-9 else "0.00%p"]
t13 = {"kind": "table", "eyebrow": {"group": "시장금리 차", "topic": "한·미 국채 금리와 기준금리", "basis": "2026.06~09, 한국 월말 · 미국 월평균, 단위: %"},
       "head": f"2026.09 국고 3년 금리는 **{kr3[-1]:.2f}%**로 기준금리보다 {kr3[-1] - krb[-1]:.2f}%p 높고, 미국 2년물도 {us2[-1]:.2f}%로 정책금리를 {us2[-1] - usb[-1]:.2f}%p 웃돌아 두 시장 모두 추가 인상을 반영함",
       "cols": [{"t": "구분", "align": "left", "w": 250}, {"t": "2026.06"}, {"t": "2026.07"}, {"t": "2026.08"}, {"t": "2026.09", "hc": True}, {"t": "6월 대비", "w": 140}],
       "rows": [{"c": row("국고채 3년", kr3), "hi": True}, {"c": row("국고채 10년", kr10)}, {"c": row("한국 기준금리", krb)}, {"c": row("미국 국채 2년¹⁾", us2)}, {"c": row("미국 국채 10년¹⁾", us10)}, {"c": row("미국 정책금리 상단", usb)}],
       "chips": {"0,4": {"text": f"기준금리 +{kr3[-1] - krb[-1]:.2f}%p", "dir": "up"}, "3,4": {"text": f"정책금리 +{us2[-1] - usb[-1]:.2f}%p", "dir": "up"}, "4,4": {"text": f"한국 10년 {kr10[-1] - us10[-1]:+.2f}%p".replace("-", "−"), "dir": "dn"}},
       "foot": {"notes": ["미국 국채는 월평균, 한국 국고채는 월말 종가(보도 인용)"], "source": "금융투자협회 「장외채권시장 동향」, FRED DGS2 · DGS10, 한국은행 ECOS(722Y001), 연준 FOMC", "asof": "2026.11.10"}}

# 15 미국 2년물 vs 정책금리(24개월)
i0 = LAB.index("2024.11")
lab24 = LAB[i0:70]
u2 = [round(dgs2[m], 2) for m in lab24]
ub = D.US[i0:70]
first_above = next(i for i, (a, b) in enumerate(zip(u2, ub)) if a > b and i > 10)
l15 = {"kind": "line", "eyebrow": {"group": "시장금리 차", "topic": "미국 국채 2년물과 정책금리", "basis": "2024.11~2026.10, 월평균 · 월말, 단위: %"},
       "head": f"미국 국채 2년물 금리는 {lab24[first_above]}부터 정책금리 상단을 웃돌기 시작해 2026.10 **{u2[-1]:.2f}%**로 정책금리({ub[-1]:.2f}%)보다 **{u2[-1] - ub[-1]:.2f}%p** 높음",
       "labels": lab24, "series": [{"name": "연방기금금리 목표 상단", "data": ub, "color": "cmp", "end": f"정책금리 {ub[-1]:.2f}%"}, {"name": "미국 국채 2년물(월평균)", "data": u2, "color": "main", "step": False, "end": f"2년물 {u2[-1]:.2f}%"}],
       "y": {"min": 3, "max": 5, "step": 0.5, "dec": 2},
       "values": [{"s": 1, "at": 0, "text": f"{u2[0]:.2f}", "pos": "below", "dx": 2}, {"s": 1, "at": u2.index(min(u2)), "text": f"{min(u2):.2f}", "pos": "below", "dx": -10}, {"s": 0, "at": 0, "text": f"{ub[0]:.2f}", "dx": 2}],
       "events": [{"at": first_above, "v": ub[first_above] + 0.42, "text": "2년물이 정책금리 위로", "sub": f"{lab24[first_above]} · 시장이 인상을 반영", "anchor": "end", "leader": [ub[first_above] + 0.06, ub[first_above] + 0.3]},
                  {"at": lab24.index("2026.09"), "v": 4.32, "text": "연준 0.25%p 인상", "sub": "2026.09.16 · 12 대 0", "anchor": "end", "dx": -8},
                  {"at": 23, "v": 3.78, "text": f"차이 {u2[-1] - ub[-1]:.2f}%p", "anchor": "start", "dx": 12}],
       "foot": {"notes": ["2년물은 월평균, 정책금리는 월말 목표 범위 상단"], "source": "연준 세인트루이스 FRED DGS2, 연준 FOMC 결정문", "asof": "2026.11.10"}}

# 22 금리차와 환율(4 시점)
pts = [("2023.07", "금리차 2.00%p 지속 시작"), ("2024.12", "동반 인하 · 동결"), ("2026.06", "원/달러 12개월 최고"), ("2026.10", "지금")]
fxd = snap("fred_dexkous")
rows22 = [{"c": [p, f"{D.GAP[LAB.index(p)]:.2f}", f"{fxd[p]:,.1f}", note], "hi": p == "2023.07"} for p, note in pts]
t22 = {"kind": "table", "eyebrow": {"group": "환율 · 자금 흐름", "topic": "한·미 금리차와 원/달러 환율", "basis": "4개 시점, 금리차 월말 · 환율 월평균, 단위: %p, 원"},
       "head": "금리차가 가장 컸던 2023.07(**2.00%p**)의 원/달러는 1,282.3원으로 금리차가 더 작은 2026.06의 **1,529.5원**보다 낮아, 금리차만으로는 환율 수준이 설명되지 않음",
       "cols": [{"t": "시점", "align": "left", "w": 160}, {"t": "한·미 금리차(%p)", "w": 260}, {"t": "원/달러(원)", "w": 300}, {"t": "구간", "align": "left", "tx": True}],
       "rows": rows22, "bars": {"col": 2, "dec": 1}, "fill": True,
       "after": "금리차가 0.75%p 줄어드는 동안(2023.07 → 2026.10) 원/달러는 55.1원 올라, 위험 선호 · 경상수지 등 다른 요인이 함께 작용했음",
       "foot": {"notes": ["금리차 = 미국 목표 범위 상단 − 한국 기준금리"], "source": "한국은행 ECOS(722Y001), 연준 FOMC, FRED DEXKOUS", "asof": "2026.11.10"}}

# 28 한·미 물가
kc, uc = snap("ecos_cpi_yoy"), snap("fred_cpi_yoy")
kcp = [round(kc[m], 2) for m in LAB[:69]]
ucp = [round(uc[m], 2) if m in uc else None for m in LAB[:69]]
l28 = {"kind": "line", "eyebrow": {"group": "물가 · 정책 여지", "topic": "한·미 소비자물가 상승률", "basis": "2021.01~2026.09, 전년동월비, 단위: %"},
       "head": f"2026.09 소비자물가 상승률은 미국 **{ucp[-1]:.2f}%** · 한국 **{kcp[-1]:.2f}%**로 미국이 {ucp[-1] - kcp[-1]:.2f}%p 높으며, 두 나라 모두 2022년 고점 이후 내려왔으나 물가 목표 2%를 웃돎",
       "labels": LAB[:69], "series": [{"name": "미국¹⁾", "data": ucp, "color": "cmp", "step": False, "end": f"미국 {ucp[-1]:.2f}%"}, {"name": "한국", "data": kcp, "color": "main", "step": False, "end": f"한국 {kcp[-1]:.2f}%"}],
       "y": {"min": 0, "max": 10, "step": 2, "dec": 0, "suf": "%"},
       "avg": [{"s": 1, "value": 2, "x0": 0, "x1": 68, "label": "물가 목표 2%", "dec": 0, "labelEnd": True}],
       "values": [{"s": 0, "at": ucp.index(max(v for v in ucp if v is not None)), "text": f"미국 고점 {max(v for v in ucp if v is not None):.2f}%(2022.06)", "dx": 8, "dy": -6},
                  {"s": 1, "at": kcp.index(max(kcp)), "text": f"한국 고점 {max(kcp):.2f}%(2022.07)", "dx": 8, "dy": 18}],
       "events": [{"at": 68, "v": 5.0, "text": f"2026.09 차이 {ucp[-1] - kcp[-1]:.2f}%p", "anchor": "end", "dx": -4}],
       "foot": {"notes": ["미국 2025.10은 물가 통계 미발표로 비움"], "source": "통계청 · 한국은행 ECOS(901Y009), 미 노동통계국 · FRED CPIAUCSL", "asof": "2026.11.10"}}

# 30 한국 GDP
qs = [q for q in gdp][-14:]
qv = [gdp[q] for q in qs]
b30 = {"kind": "bar", "eyebrow": {"group": "물가 · 정책 여지", "topic": "한국 실질 GDP 성장률", "basis": f"{qs[0]}~{qs[-1]}, 전기비, 단위: %"},
       "head": "한국 실질 GDP는 2026년 1~3분기 전기비 **1.8% · 0.6% · 1.0%** 늘어, 마이너스 성장이 세 번 있었던 2024~2025년보다 성장 흐름이 강해짐",
       "labels": qs, "data": qv, "unit": "%", "y": {"min": -0.5, "max": 2, "step": 0.5, "dec": 1, "unit": "%"},
       "hi": [{"from": qs.index("2026.Q1"), "to": len(qs) - 1, "color": "main"}], "avg": {"text": "평균 {v}"},
       "brackets": [{"from": qs.index("2026.Q1"), "to": len(qs) - 1, "text": "2026년 1~3분기 평균 1.13%"}],
       "notes": [{"at": qs.index("2024.Q2"), "text": "−0.2%", "sub": "2024.Q2", "pos": "below", "anchor": "middle"}, {"at": qs.index("2025.Q1"), "text": "−0.2%", "sub": "2025.Q1", "pos": "below", "anchor": "middle"},
                 {"at": qs.index("2025.Q4"), "text": "−0.1%", "sub": "2025.Q4", "pos": "below", "anchor": "middle"}],
       "foot": {"notes": ["계절조정 실질 GDP 전기비, 평균은 ECOM 계산"], "source": "한국은행 ECOS(200Y102)", "asof": "2026.11.10"}}


slides = [t13, l15, t22, l28, b30]
if __name__ == "__main__":
    deck = {"schema": 3, "meta": {"session": "DEMO3X", "title": "시험 추가분", "cover": "A"}, "slides": slides}
    (LIB / "style" / "demo3_extra.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
    print("slides", len(slides))
