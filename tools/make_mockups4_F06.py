# F06 돈 · 물자 흐름 9종(N066~N074) + F12 가치사슬 · 공급망 8종(N131~N138) 2차 목업 — 묶음 이름 F06
# 실행: python -X utf8 tools/make_mockups4_F06.py → library/mockups/v4/F06.json · style/demo4_r2_F06.json
# 쓰는 부품 : n_mf1.js(mfbook · mftank · mfring · mfshift · mfexch · mfroute · mffunnel · mfchord · mflev) · n_mf2.js(mfvalue · mfneck · mfdep · mfzig · mfbom · mfsmap · mfvert · mfdays)
# 실제 값 : N066 · N067(연준 대차대조표 WALCL · WRESBAL · WTREGEN · RRPONTSYD) / 예시 값 : 나머지 15종(익명 나라 · 기업)
import json
import datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
GOT = "2026.11.13"


def ld(i):
    return json.loads((S4 / f"{i}.json").read_text(encoding="utf-8"))


def D(s):
    return dt.date.fromisoformat(s)


def at(ser, d):
    r = None
    for a, b in ser["data"]:
        if b is None:
            continue
        if D(a) <= d:
            r = (a, b)
        else:
            break
    return r


def sg(v, d=2):
    return f"{v:+.{d}f}".replace("-", "−")


def ymd(a):
    return a[:4] + "." + a[5:7] + "." + a[8:10]


def headlen(h):
    return len(h.replace("**", "").replace(" ", ""))


items = []


def add(nid, kind, fam, variant, title, facts, slide):
    n = headlen(slide["head"])
    if not 50 <= n <= 90: print("HEAD", nid, n, slide["head"])
    slide["kind"] = kind
    items.append({"id": nid, "kind": kind, "family": fam, "variant": variant, "title": title, "tags": ["4판"], "facts": facts, "slide": slide})


def ex_foot(extra=None):
    return {"notes": (extra or []) + ["숫자는 모양을 보이기 위한 예시 값(나라 · 기업 이름은 익명)"], "source": "예시 값(실제 통계 아님)", "asof": GOT}


# ───────── 연준 대차대조표 ─────────
W, R_, G_, RR = ld("WALCL"), ld("WRESBAL"), ld("WTREGEN"), ld("RRPONTSYD")
dN = D(W["data"][-1][0])
dP = D("2022-04-13")
for s_ in (W, R_, G_, RR):
    pass


def snap(d):
    w = at(W, d)[1] / 1e6          # 조 달러(WALCL 백만 달러)
    r = at(R_, d)[1] / 1e6         # WRESBAL 값은 백만 달러 단위로 들어 있음
    t = at(G_, d)[1] / 1e6
    p = at(RR, d)[1] / 1e3         # 역레포 십억 달러 → 조 달러
    return {"w": w, "r": r, "t": t, "p": p, "o": w - r - t - p}


a, b = snap(dP), snap(dN)
asof_fed = ymd(W["data"][-1][0])
fed_src = "FRED(WALCL · WRESBAL · WTREGEN · RRPONTSYD)"
assert a["o"] > 0 and b["o"] > 0, (a, b)


def tn(v, d=2):
    return f"{v:.{d}f}조"


# ===== N066 중앙은행 장부 =====
def book(title, date, x):
    return {"title": title, "date": date, "total": tn(x["w"]) + " 달러",
            "assets": [{"name": "총자산", "value": x["w"], "label": tn(x["w"]), "tone": "dark"}],
            "liabs": [{"name": "화폐 등 나머지", "value": x["o"], "label": tn(x["o"]), "tone": "g18"},
                      {"name": "은행 지준", "value": x["r"], "label": tn(x["r"]), "tone": "main"},
                      {"name": "역레포", "value": x["p"], "label": tn(x["p"]), "tone": "g65"},
                      {"name": "재무부 계좌", "value": x["t"], "label": tn(x["t"]), "tone": "g40"}]}


dl = [("총자산", "w"), ("은행 지준", "r"), ("역레포", "p"), ("재무부 계좌", "t"), ("화폐 등 나머지", "o")]
deltas = [{"name": n, "d": sg(b[k] - a[k]) + "조", "tone": "g" if b[k] - a[k] > 0 else "r", "sub": f"{tn(a[k])} → {tn(b[k])}"} for n, k in dl]
head = f"연준 장부 양쪽이 **{tn(a['w'])} → {tn(b['w'])} 달러**로 줄 때 부채 쪽은 **역레포 {sg(b['p'] - a['p'])}조**가 가장 크게 빠지고 지준은 {sg(b['r'] - a['r'])}조 줄었음"
add("N066", "mfbook", "F06", "중앙은행 장부 T 계정", "연준 대차대조표 고점 vs 지금",
    {"peak": a, "now": b, "peak_date": ymd(W["data"][0][0]) if False else "2022.04.13", "now_date": asof_fed},
    {"eyebrow": {"group": "연준 대차대조표", "topic": "연준 장부의 자산 · 부채 칸이 함께 줄어든 모습", "basis": "주간 잔액, 단위: 조 달러(고점 2022.04.13 대 최근)"}, "head": head,
     "books": [book("자산 고점", "2022.04.13", a), book("지금", asof_fed, b)], "deltas": deltas, "deltaTitle": "고점 대비 변화",
     "foot": {"notes": ["자산은 합계만, 부채는 세 항목 + 나머지(화폐 등 = 합계 − 세 항목)로 나눔", "역레포는 일 자료를 조 달러로 환산"], "source": fed_src, "asof": asof_fed}})

# ===== N067 유동성 탱크 =====
def hist(ser, d0, scale):
    v = [(x[0], x[1] / scale) for x in ser["data"] if x[1] is not None and x[0] >= d0]
    return max(v, key=lambda t: t[1])


dPrev = dN.replace(year=dN.year - 1)
p1 = snap(dPrev)
tp = hist(G_, "2020-01-01", 1e6); rp = hist(RR, "2020-01-01", 1e3); sp = hist(R_, "2020-01-01", 1e6)
rr_now = at(RR, D(RR["data"][-1][0]))[1]  # 십억 달러


def ym(a):
    return a[:4] + "." + a[5:7]


tanks = [
    {"name": "재무부 계좌(TGA)", "sub": "정부가 쓰기 전에 쌓아 둔 돈", "value": b["t"], "vlabel": tn(b["t"]) + " 달러", "delta": f"1년 전 대비 {sg(b['t'] - p1['t'])}조", "peak": tp[1], "peakLabel": "고점 " + tn(tp[1]), "peakDate": ym(tp[0]), "prev": p1["t"], "prevLabel": tn(p1["t"]), "tone": "g65"},
    {"name": "역레포", "sub": "여윳돈이 연준에 하루 맡겨진 돈", "value": b["p"], "vlabel": f"{rr_now * 10:.1f}억 달러", "delta": f"1년 전 대비 {sg((b['p'] - p1['p']) * 1000, 0)}십억", "peak": rp[1], "peakLabel": "고점 " + tn(rp[1]), "peakDate": ym(rp[0]), "prev": p1["p"], "prevLabel": f"{p1['p'] * 1000:.0f}십억", "tone": "dark"},
    {"name": "은행 지준", "sub": "은행이 연준에 맡긴 돈", "value": b["r"], "vlabel": tn(b["r"]) + " 달러", "delta": f"1년 전 대비 {sg(b['r'] - p1['r'])}조", "peak": sp[1], "peakLabel": "고점 " + tn(sp[1]), "peakDate": ym(sp[0]), "prev": p1["r"], "prevLabel": tn(p1["r"]), "tone": "main"},
]
head = f"역레포 탱크는 고점 **{tn(rp[1])} 달러**에서 **{rr_now * 10:.1f}억 달러**로 거의 비었고 지준은 **{tn(b['r'])}**, 재무부 계좌는 **{tn(b['t'])}**가 차 있음"
add("N067", "mftank", "F06", "유동성 탱크", "TGA · 역레포 · 지준 수위",
    {"tga": b["t"], "rrp": b["p"], "res": b["r"], "tga_peak": tp, "rrp_peak": rp, "res_peak": sp},
    {"eyebrow": {"group": "유동성", "topic": "세 탱크의 수위(같은 눈금)", "basis": "잔액, 눈금 0~4.5조 달러 · 점선 = 2020년 이후 고점 · 초록 선 = 1년 전"}, "head": head, "tanks": tanks, "max": 4.5, "step": 1, "unit": "조",
     "foot": {"notes": ["세 탱크는 같은 눈금이라 높이를 그대로 비교할 수 있음", "역레포는 일 자료(십억 달러), 나머지는 주 자료이며 고점은 2020년 이후 기준"], "source": fed_src, "asof": asof_fed}})

# ===== N068 나라 둘레 =====
nodes = [("나국", 480), ("다국", 360), ("라국", 250), ("마국", 190), ("바국", 120), ("사국", 60)]
tot = sum(v for _, v in nodes)
head = f"가국의 해외 투자 **{tot:,}억 달러** 가운데 **나국에 {nodes[0][1]}억 달러({nodes[0][1] / tot * 100:.0f}%)** 가 몰리고 나국 · 다국 두 곳을 합치면 절반을 넘어섬"
add("N068", "mfring", "F06", "나라 둘레 방사 흐름", "가국 투자가 여섯 나라로",
    {"total": tot, "nodes": nodes},
    {"eyebrow": {"group": "자본 이동", "topic": "가국에서 나가는 해외 투자의 행선지", "basis": "연간 투자 잔액, 단위: 억 달러 · 예시 값"}, "head": head,
     "hub": {"name": "가국", "value": f"{tot:,}억 달러", "sub": "해외 투자 합계"},
     "nodes": [{"name": n, "value": v, "label": f"{v:,}억 달러", "share": f"{v / tot * 100:.0f}%"} for n, v in nodes], "unit": "화살표 굵기 · 원 크기 = 투자 금액",
     "foot": ex_foot(["비율 = 가국 해외 투자 합계에서 차지하는 몫"])})

# ===== N069 자금 이동 전후 =====
d0, d1, m0, m1 = 12.0, 11.2, 4.0, 4.8
mv = d0 - d1
head = f"가국 금리가 오르자 은행 예금 **{mv:.1f}조 달러**가 머니마켓펀드로 옮겨 가 예금은 **{d0:.1f} → {d1:.1f}조**, 펀드는 **{m0:.1f} → {m1:.1f}조 달러**가 됨"
add("N069", "mfshift", "F06", "자금 이동 전후 막대", "예금에서 머니마켓펀드로",
    {"move": mv, "dep": [d0, d1], "mmf": [m0, m1]},
    {"eyebrow": {"group": "자금 이동", "topic": "예금에서 머니마켓펀드로 옮겨 간 돈", "basis": "잔액, 단위: 조 달러 · 예시 값"}, "head": head,
     "from": {"name": "은행 예금", "before": d0, "after": d1, "bl": f"{d0:.1f}조", "al": f"{d1:.1f}조"}, "to": {"name": "머니마켓펀드(MMF)", "before": m0, "after": m1, "bl": f"{m0:.1f}조", "al": f"{m1:.1f}조"},
     "amount": {"value": f"{mv:.1f}조 달러 이동", "sub": f"예금 {sg(-mv, 1)}조 · 펀드 {sg(mv, 1)}조"}, "beforeLabel": "금리 인상 전", "afterLabel": "금리 인상 후",
     "foot": ex_foot(["두 곳의 막대는 같은 눈금"])})

# ===== N070 거래 흐름 두 색 =====
head = "수출 한 건에서 **물건은 가국에서 나국으로** 가고 **돈은 은행 둘을 거쳐 반대로** 돌아와 네 주체를 한 바퀴 돌며 대금 입금까지 3일이 걸림"
add("N070", "mfexch", "F06", "거래 흐름 두 색(돈 · 물건)", "수출 대금 결제 한 바퀴",
    {"goods": "부품 1,000개", "money": "100만 달러", "days": 3},
    {"eyebrow": {"group": "거래 흐름", "topic": "수출 한 건에서 돈과 물건이 도는 길", "basis": "한 거래 기준, 단위: 개 · 달러 · 일 · 예시 값"}, "head": head,
     "actors": [{"id": "a", "name": "가국 수출기업", "sub": "부품을 만들어 보냄", "at": "tl"}, {"id": "b", "name": "나국 수입업체", "sub": "부품을 받아 대금을 냄", "at": "tr"},
                {"id": "c", "name": "나국 은행", "sub": "수입업체 계좌에서 인출", "at": "br"}, {"id": "d", "name": "가국 은행", "sub": "수출기업 계좌에 입금", "at": "bl"}],
     "flows": [{"from": "a", "to": "b", "kind": "goods", "text": "물건 출하 · 부품 1,000개", "num": "1)"}, {"from": "b", "to": "c", "kind": "money", "text": "대금 지급 · 100만 달러", "num": "2)"},
               {"from": "c", "to": "d", "kind": "money", "text": "은행 간 송금", "num": "3)"}, {"from": "d", "to": "a", "kind": "money", "text": "수출 대금 입금", "num": "4)"}],
     "center": {"title": "수출 한 건의 한 바퀴", "lines": ["부품 1,000개 · 대금 100만 달러", "대금이 들어오기까지 3일"]}, "legend": {"money": "돈", "goods": "물건"},
     "foot": ex_foot(["번호는 거래가 진행되는 순서"])})

# ===== N071 우회 수출 경로 =====
head = "다국이 가국산에 **관세 25%** 를 매기자 부품 **120억 달러**가 나국을 거쳐 우회 수출되면서 최종 관세 부담은 **6%** 로 낮아졌음"
add("N071", "mfroute", "F06", "우회 수출 경로", "가국 → 나국 → 다국",
    {"direct_tariff": 25, "via_tariff": 6, "parts_bn": 120, "final_bn": 150},
    {"eyebrow": {"group": "무역 우회", "topic": "관세를 피해 제3국을 거쳐 가는 수출 경로", "basis": "연간 금액, 단위: 억 달러 · %, 예시 값"}, "head": head,
     "lands": [{"name": "가국", "role": "부품 생산", "sub": "원산지"}, {"name": "나국", "role": "조립 · 가공", "sub": "경유지"}, {"name": "다국", "role": "최종 소비 시장", "sub": "관세 부과국"}],
     "legs": [{"text": "부품 120억 달러", "sub": "관세 0%"}, {"text": "완제품 150억 달러", "sub": "관세 6%"}],
     "direct": {"text": "직수출 막힘 · 관세 25%", "sub": "가국산 표시가 붙은 채로는 높은 관세"},
     "cmp": {"title": "다국이 매기는 관세율", "unit": "%", "rows": [{"name": "가국 → 다국 직수출", "value": 25, "tone": "warn"}, {"name": "나국 경유 수출", "value": 6, "tone": "main"}]},
     "foot": ex_foot(["완제품 금액은 나국에서 부가가치가 더해진 뒤 값"])})

# ===== N072 깔때기 =====
fs = [("신청", 12000), ("승인", 7200), ("집행", 5400)]
head = f"신청 **{fs[0][1]:,}건** 가운데 승인은 **{fs[1][1] / fs[0][1] * 100:.0f}%** , 돈이 실제로 나간 집행은 **{fs[2][1] / fs[0][1] * 100:.0f}%** 로 신청에서 승인으로 넘어가는 단계에서 가장 많이 걸러짐"
add("N072", "mffunnel", "F06", "깔때기", "신청 → 승인 → 집행",
    {"stages": fs},
    {"eyebrow": {"group": "정책 집행", "topic": "지원금 신청이 집행까지 줄어드는 길", "basis": "건수, 단위: 건 · % · 예시 값"}, "head": head,
     "stages": [{"name": n, "value": v, "label": f"{v:,}건", "dropLabel": (f"{fs[i][1] - fs[i + 1][1]:,}건" if i < 2 else None)} for i, (n, v) in enumerate(fs)], "dropWord": "탈락 · 보류",
     "foot": ex_foot(["직전의 N% = 바로 앞 단계 건수 대비 몫"])})

# ===== N073 코드 다이어그램 =====
reg = ["가지역", "나지역", "다지역", "라지역", "마지역", "바지역"]
pairs = [(0, 1, 410), (0, 2, 260), (0, 3, 120), (0, 4, 80), (0, 5, 60), (1, 2, 190), (1, 3, 140), (1, 4, 70), (1, 5, 50), (2, 3, 110), (2, 4, 90), (2, 5, 40), (3, 4, 60), (3, 5, 30), (4, 5, 25)]
tt = [0] * 6
for x, y, v in pairs:
    tt[x] += v
    tt[y] += v
sm = sum(v for *_, v in pairs)
share_pair = pairs[0][2] / sm * 100
head = f"여섯 지역의 교역 **{sm:,}억 달러** 가운데 **가지역 ↔ 나지역** 한 쌍이 **{share_pair:.0f}%** 를 차지해 교역이 가지역을 중심에 두고 얽혀 있음"
add("N073", "mfchord", "F06", "코드 다이어그램(지역 간 교역)", "지역 간 교역 원형 연결",
    {"total": sm, "pairs": pairs},
    {"eyebrow": {"group": "교역 구조", "topic": "지역 사이 교역이 서로 이어진 모양", "basis": "연간 교역액, 단위: 억 달러 · 예시 값"}, "head": head,
     "regions": [{"name": n} for n in reg], "pairs": [{"a": x, "b": y, "v": v} for x, y, v in pairs], "hi": 0, "unit": "억 달러", "rankTitle": "교역액 상위 쌍(억 달러)", "topN": 6,
     "foot": ex_foot(["호 길이와 띠 굵기 = 교역액, 한 쌍의 교역액은 양방향 합계"])})

# ===== N074 레버리지 블록 =====
head = "같은 자산 10칸을 사도 **빌린 돈이 9칸**이면 가격이 **10%** 내릴 때 자기 돈은 전부 사라져 레버리지 **10배의 손실률은 −100%** 임"
add("N074", "mflev", "F06", "레버리지 블록", "자기 돈 · 빌린 돈 칸",
    {"cols": [(1, 10, 0), (5, 2, 8), (10, 1, 9)], "drop": 10},
    {"eyebrow": {"group": "레버리지", "topic": "빌린 돈의 비중에 따라 같은 하락이 얼마나 다른지", "basis": "자산 10칸 = 100%, 1칸 = 10%, 예시 값"}, "head": head,
     "cols": [{"name": "레버리지 1배", "own": 10, "borrow": 0, "lossLabel": "−10%", "sub": "자기 돈 10칸 중 1칸 사라짐"}, {"name": "레버리지 5배", "own": 2, "borrow": 8, "lossLabel": "−50%", "sub": "자기 돈 2칸 중 1칸 사라짐"},
              {"name": "레버리지 10배", "own": 1, "borrow": 9, "lossLabel": "−100%", "lossBad": True, "sub": "자기 돈 1칸이 모두 사라짐"}], "loss": 1, "dropText": "자산 가격 10% 하락(점선 칸 = 사라진 자기 돈)",
     "foot": ex_foot(["손실은 자기 돈에서 먼저 빠지며 이자 · 증거금 추가 요구는 생략"])})

# ================= F12 =================
# ===== N131 단계 가치사슬 + 나라 몫 =====
stg = [("설계", "칩 구조 만들기", 28, [("가국", 72), ("다국", 18), ("그 밖", 10)]), ("장비", "제조 기계", 17, [("다국", 58), ("가국", 28), ("그 밖", 14)]),
       ("제조", "웨이퍼 가공", 33, [("나국", 64), ("가국", 12), ("그 밖", 24)]), ("조립 · 검사", "포장 · 시험", 22, [("라국", 46), ("나국", 30), ("그 밖", 24)])]
head = f"부가가치 **{stg[0][2]}%** 인 설계는 가국이 **72%** , **{stg[2][2]}%** 인 제조는 나국이 **64%** 를 쥐어 단계마다 주인이 달라지고 한 나라가 다 갖지 못함"
add("N131", "mfvalue", "F12", "단계 폭 = 부가가치, 칸 안 = 나라 몫", "반도체형 가치사슬 4단계",
    {"stages": [(n, v) for n, _, v, _ in stg]},
    {"eyebrow": {"group": "가치사슬", "topic": "단계별 부가가치와 나라별 몫", "basis": "부가가치 합계 100%, 단위: % · 예시 값"}, "head": head,
     "stages": [{"name": n, "sub": sb, "va": v, "shares": [{"name": c, "value": x} for c, x in sh]} for n, sb, v, sh in stg], "colors": {"가국": "main", "나국": "dark", "다국": "g65", "라국": "g40"}, "vaTitle": "칸 폭 = 단계의 부가가치 몫",
     "foot": ex_foot(["칸 폭은 단계가 만드는 부가가치의 몫, 칸 안은 그 단계에서 나라별 몫"])})

# ===== N132 병목 강조 사슬 =====
nk = [("소재", "원료 가공", 38, False), ("설계", "회로 만들기", 47, False), ("노광 장비", "핵심 기계", 91, True), ("제조", "웨이퍼 가공", 52, False), ("조립", "포장 · 시험", 33, False)]
head = f"다섯 단계 가운데 **{nk[2][0]}** 한 곳만 상위 1개국 점유율이 **{nk[2][2]}%** 로 가늘게 조여 있어 나머지 단계가 넉넉해도 **전체 공급이 막힘**"
add("N132", "mfneck", "F12", "병목 한 단계만 붉게(점유율 관)", "한 장비 단계 병목",
    {"stages": [(n, s_) for n, _, s_, _ in nk]},
    {"eyebrow": {"group": "공급망 병목", "topic": "단계마다 상위 1개국이 쥔 점유율", "basis": "단계별 점유율, 단위: % · 예시 값"}, "head": head,
     "stages": [{"name": n, "sub": sb, "share": s_, "neck": nb} for n, sb, s_, nb in nk], "neckChip": "병목", "shareLabel": "상위 1개국 점유율",
     "foot": ex_foot(["관 두께는 점유율이 클수록 가늘게 그린 대체 공급 여력의 어림"])})

# ===== N133 의존도 고리 =====
dp = [("원료 채굴", "광석", 35, "대체 공급처 4곳", "연 80억 달러"), ("정제", "금속으로 만들기", 88, "대체 공급처 1곳", "연 60억 달러"), ("소재", "가공 소재", 61, "대체 공급처 2곳", "연 120억 달러"), ("부품", "모듈 제작", 44, "대체 공급처 3곳", "연 200억 달러"), ("완제품", "최종 조립", 22, "대체 공급처 6곳", "연 450억 달러")]
over = [x for x in dp if x[2] >= 50]
head = f"가국에 기댄 비율이 **정제 88%** · **소재 61%** 로 50%를 넘어 채굴이나 조립보다 **중간 단계에서 사슬이 한 나라에 묶여** 있음"
add("N133", "mfdep", "F12", "의존도 고리(도넛)", "단계별 가국 의존 %",
    {"stages": [(x[0], x[2]) for x in dp], "over_50": [x[0] for x in over]},
    {"eyebrow": {"group": "공급망 의존", "topic": "단계마다 가국에 얼마나 기대는지", "basis": "수입액 기준 가국 비중, 단위: % · 억 달러 · 예시 값"}, "head": head,
     "stages": [{"name": n, "sub": sb, "pct": p, "alts": al, "value": v} for n, sb, p, al, v in dp], "who": "가국", "line": 50,
     "foot": ex_foot(["의존 비율 = 그 단계 수입액 중 가국에서 온 몫"])})

# ===== N134 국경 왕복 =====
steps = [(0, "칩 설계", "가국 연구소"), (1, "웨이퍼 가공", "나국 공장"), (2, "패키징", "다국 공장"), (1, "성능 시험", "나국으로 되돌아옴"), (0, "모듈 조립", "가국 조립 라인"), (2, "포장 · 출하", "다국 항만")]
cross = sum(abs(steps[i][0] - steps[i - 1][0]) for i in range(1, len(steps)))
head = f"부품 하나가 여섯 단계를 거치는 동안 가국 · 나국 · 다국 사이 국경을 **{cross}번** 넘어 **한 나라에서 막히면 전체가 멈추는** 구조여서 사슬 전체가 약해짐"
add("N134", "mfzig", "F12", "국경 왕복 경로", "부품이 세 나라를 오가는 횟수",
    {"cross": cross, "steps": [(s_[1]) for s_ in steps]},
    {"eyebrow": {"group": "공급망 경로", "topic": "부품 하나가 국경을 넘나드는 횟수", "basis": "단계 순서, 단위: 번 · 예시 값"}, "head": head,
     "lanes": [{"name": "가국", "sub": "설계 · 조립"}, {"name": "나국", "sub": "제조"}, {"name": "다국", "sub": "후공정"}], "steps": [{"lane": l_, "text": t_, "sub": sb} for l_, t_, sb in steps], "crossWord": "국경",
     "foot": ex_foot(["국경 번호 = 경로를 따라 처음부터 센 누적 통과 횟수"])})

# ===== N135 원료 → 제품 갈래 =====
tiers = [{"name": "광물", "items": [{"id": "li", "name": "리튬", "tag": "가국 정제 80%"}, {"id": "ni", "name": "니켈"}, {"id": "gr", "name": "흑연"}, {"id": "re", "name": "희토류"}]},
         {"name": "소재", "items": [{"id": "ca", "name": "양극재", "tag": "나국 70%", "crit": True}, {"id": "an", "name": "음극재"}, {"id": "el", "name": "전해액"}, {"id": "mg", "name": "영구자석"}]},
         {"name": "부품", "items": [{"id": "ce", "name": "배터리 셀", "tag": "나국 · 다국"}, {"id": "mo", "name": "구동 모터"}]},
         {"name": "완제품", "items": [{"id": "ev", "name": "전기차", "tag": "조립 5곳"}]}]
edges = [["li", "ca"], ["ni", "ca"], ["gr", "an"], ["li", "el"], ["re", "mg"], ["ca", "ce"], ["an", "ce"], ["el", "ce"], ["mg", "mo"], ["ce", "ev"], ["mo", "ev"]]
head = "전기차 한 대는 **광물 4종**이 소재 4종 · 부품 2종을 거쳐 만들어지며 **양극재** 한 갈래가 막히면 배터리 셀과 완제품까지 멈춤"
add("N135", "mfbom", "F12", "원료 → 제품 갈래(층별 연결)", "광물 → 소재 → 부품 → 완제품",
    {"tiers": [t["name"] + str(len(t["items"])) for t in tiers]},
    {"eyebrow": {"group": "공급망 구조", "topic": "원료가 제품으로 갈라지고 모이는 길", "basis": "층별 연결, 이름은 널리 알려진 품목 · 몫은 예시 값"}, "head": head,
     "tiers": tiers, "edges": edges, "hi": [["li", "ca"], ["ca", "ce"], ["ce", "ev"]],
     "foot": ex_foot(["짙은 선 = 막혔을 때 파급이 가장 큰 길(품목 이름은 구조를 보이기 위한 것)"])})

# ===== N136 공급망 지도 =====
sm_steps = [(3, "원료 채굴", "라국 광산"), (0, "소재 가공", "가국 정제소"), (1, "부품 제조", "나국 공장"), (2, "최종 조립", "다국 공장"), (0, "소비 시장", "가국 최종 판매")]
head = "공급망은 **라국에서 시작해 가국 · 나국 · 다국을 거쳐 가국으로 돌아와** 다섯 단계 · 네 나라를 한 바퀴 돌고서야 소비자에게 닿음"
add("N136", "mfsmap", "F12", "공급망 지도(익명 나라 덩어리)", "단계를 지도 위 순서로",
    {"steps": [x[1] for x in sm_steps]},
    {"eyebrow": {"group": "공급망 지도", "topic": "원료에서 소비까지 단계가 지나는 나라", "basis": "단계 순서, 나라 위치 · 모양은 개념 그림 · 예시 값"}, "head": head,
     "lands": [{"name": "가국", "slot": 0}, {"name": "나국", "slot": 1}, {"name": "다국", "slot": 2}, {"name": "라국", "slot": 3}], "hiLand": 0, "steps": [{"land": l_, "text": t_, "sub": sb} for l_, t_, sb in sm_steps],
     "foot": ex_foot(["나라 모양과 위치는 실제 지도가 아니라 순서를 보이기 위한 그림"])})

# ===== N137 수직 계열화 비교 =====
head = "A사는 다섯 단계 가운데 **네 단계를 직접** 맡고 B사는 **설계 · 판매 두 단계만** 맡아 같은 제품이어도 책임지는 범위가 두 배 차이 남"
stn = ["설계", "소재", "부품", "조립", "판매"]
add("N137", "mfvert", "F12", "수직 계열화 비교(칸 칠하기)", "A사 · B사가 맡는 단계",
    {"A": [1, 1, 1, 1, 0], "B": [1, 0, 0, 0, 1]},
    {"eyebrow": {"group": "가치사슬 구조", "topic": "기업이 직접 하는 단계와 맡기는 단계", "basis": "단계별 직접 · 외주 구분, 예시 값"}, "head": head,
     "stages": [{"name": n} for n in stn], "ownLabel": "직접", "outLabel": "외주",
     "firms": [{"name": "A사", "sub": "수직 계열화형", "cells": [{"k": "own", "t": "자체 연구소"}, {"k": "own", "t": "자체 조달"}, {"k": "own", "t": "자체 공장"}, {"k": "own", "t": "자체 라인"}, {"k": "out", "t": "유통사"}]},
               {"name": "B사", "sub": "설계 · 판매 집중형", "cells": [{"k": "own", "t": "자체 연구소"}, {"k": "out", "t": "소재사"}, {"k": "out", "t": "부품사"}, {"k": "out", "t": "위탁 생산"}, {"k": "own", "t": "직영 판매"}]}],
     "foot": ex_foot(["직접 = 기업이 그 단계를 스스로 수행, 외주 = 협력사에 맡김"])})

# ===== N138 단계별 재고 · 기간 =====
ds = [("원료 조달", "계약 · 선적", 25, 20), ("소재 가공", "가공 · 검사", 15, 12), ("부품 제조", "생산 · 포장", 30, 18), ("조립", "완제품 조립", 8, 6), ("운송 · 통관", "해상 운송 · 통관", 5, 28)]
td = sum(x[3] for x in ds)
ts = sum(x[2] for x in ds)
head = f"주문에서 출하까지 **{td}일** 가운데 **운송 · 통관이 28일**로 가장 길고 단계마다 재고로 쌓아 두는 기간을 더하면 **{ts}일**이나 됨"
add("N138", "mfdays", "F12", "단계별 재고 · 기간 표 + 막대", "단계마다 걸리는 기간",
    {"stages": [(x[0], x[2], x[3]) for x in ds], "total_days": td, "stock_days": ts},
    {"eyebrow": {"group": "공급망 시간", "topic": "단계마다 걸리는 기간과 재고 기간", "basis": "일 수, 단위: 일 · 예시 값"}, "head": head,
     "stages": [{"name": n, "sub": sb, "stock": st_, "days": d_} for n, sb, st_, d_ in ds], "unit": "일", "totalLabel": "주문 → 출하 합계",
     "foot": ex_foot(["누적 = 앞 단계부터 걸린 기간을 더한 값", "재고 기간은 단계 사이에서 쌓아 두는 일수로 걸리는 기간과 겹칠 수 있음"])})

# ───────── 쓰기 ─────────
out1 = ROOT / "library" / "mockups" / "v4"
out1.mkdir(parents=True, exist_ok=True)
json.dump(items, open(out1 / "F06.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
deck = {"schema": 3, "meta": {"session": "R2", "title": "F06 2차 목업"}, "slides": [it["slide"] for it in items]}
json.dump(deck, open(ROOT / "style" / "demo4_r2_F06.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(len(items), "개 목업 ·", ", ".join(f"{i['id']}:{i['kind']}" for i in items))
