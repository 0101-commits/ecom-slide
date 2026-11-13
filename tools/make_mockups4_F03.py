# F03 막대 · 크기 비교 목업 14종(N027~N040) — 공개 통계(FRED · OECD) 7장 + 예시 값 7장
# 실행: python -X utf8 tools/make_mockups4_F03.py
#   → library/mockups/v4/F03.json · style/demo4_r1_F03.json
import json
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
SN = ROOT / "data" / "snap"
TODAY = "2026.11.13"


def load(sid):
    d = json.loads((S4 / f"{sid}.json").read_text(encoding="utf-8"))
    return d["name"], [(p[0], float(p[1])) for p in d["data"] if p[1] is not None]


def monthly(sid):
    """일 · 주 · 월 자료 → {'YYYY-MM': 월 평균}"""
    _, data = load(sid)
    acc = {}
    for dt, v in data:
        acc.setdefault(dt[:7], []).append(v)
    return {k: sum(v) / len(v) for k, v in acc.items()}


def snap_dgs10():
    d = json.loads((SN / "fred_dgs10.json").read_text(encoding="utf-8"))
    return {p[0].replace(".", "-"): float(p[1]) for p in d["data"] if p[1] is not None}


def last_date(sid):
    return load(sid)[1][-1][0]


def dot(dt):
    return dt.replace("-", ".")


def eun(w):
    """이름 뒤 은/는"""
    sp = {"S&P 500": "은", "VIX": "는", "WTI 원유": "은", "브렌트유": "은"}
    if w in sp:
        return w + sp[w]
    c = w[-1]
    if "가" <= c <= "힣":
        return w + ("은" if (ord(c) - 0xAC00) % 28 else "는")
    return w + "은"


def ga(w):
    if w.endswith("LNG"):
        return w + "가"
    c = w[-1]
    if "가" <= c <= "힣":
        return w + ("이" if (ord(c) - 0xAC00) % 28 else "가")
    return w + "이"


def foot(notes, source, asof):
    return {"notes": notes, "source": source, "asof": asof}


EX_NOTE = "숫자는 모양을 보이기 위한 예시 값"
EX_SRC = "예시 값 (공개 통계 아님)"
out = []


def add(id_, kind, variant, title, facts, slide, example=False):
    slide["kind"] = kind
    out.append({"id": id_, "kind": kind, "family": "F03", "variant": variant, "title": title, "tags": ["4판"] + (["예시값"] if example else []), "facts": facts, "slide": slide})


def eb(group, topic, basis, example=False):
    return {"group": group, "topic": topic, "basis": basis + (" · 예시 값" if example else "")}


# ───────── N027 아령 막대 : 나라별 10년물 금리 · 미국 만기별(1년 전 vs 지금)
kr, jp, de = (monthly("IRLTLT01KRM156N"), monthly("IRLTLT01JPM156N"), monthly("IRLTLT01DEM156N"))
us10 = snap_dgs10()
A, B = "2025-09", "2026-09"
rows = [("한국 10년", kr[A], kr[B]), ("일본 10년", jp[A], jp[B]), ("독일 10년", de[A], de[B]), ("미국 10년", us10[A], us10[B])]
for sid, nm in [("DGS3MO", "미국 3개월"), ("DGS5", "미국 5년"), ("DGS20", "미국 20년"), ("DGS30", "미국 30년")]:
    m = monthly(sid)
    rows.append((nm, m[A], m[B]))
chg = sorted(rows[:4], key=lambda r: r[2] - r[1], reverse=True)
top = chg[0]
add("N027", "brdumb", "아령 막대", "나라별 10년물 금리 1년 전 vs 지금",
    {"A": A, "B": B, "rows": [{"label": r[0], "a": round(r[1], 2), "b": round(r[2], 2)} for r in rows]},
    {"eyebrow": eb("금리", "나라별 국채 금리, 1년 사이 움직임", "2025.09 · 2026.09 월평균, 단위: %"),
     "head": f"한·일·독·미 10년물 금리가 1년 새 일제히 올라 **{ga(top[0].split()[0])} +{top[2] - top[1]:.2f}%p**로 가장 크게 뛰었고 **미국 {us10[B]:.2f}%**는 네 나라 중 가장 높음",
     "rows": [{"label": r[0], "a": round(r[1], 2), "b": round(r[2], 2)} for r in rows], "aName": "2025.09", "bName": "2026.09", "unit": "%", "dunit": "%p", "dec": 2,
     "foot": foot(["일·주 단위 자료는 월평균", "미국 10년물은 FRED 월 자료"], "OECD · FRED(IRLTLT01KRM156N · IRLTLT01JPM156N · IRLTLT01DEM156N · DGS10 · DGS3MO · DGS5 · DGS20 · DGS30)", "2026.09")})

# ───────── N028 면적 그림 (예시 값)
items = [("제품 A", 1200, "대당"), ("제품 B", 520, "대당"), ("제품 C", 210, "대당"), ("제품 D", 95, "대당"), ("제품 E", 40, "대당")]
add("N028", "brbubble", "면적 그림 비교", "제품마다 들어가는 희토류 양을 원 넓이로",
    {"items": [{"name": i[0], "value": i[1]} for i in items]},
    {"eyebrow": eb("소재", "제품별 희토류 사용량 비교", "단위: g/대", True),
     "head": f"희토류가 가장 많이 드는 **제품 A는 {items[0][1]:,}g**으로 가장 적은 제품 E의 **{items[0][1] / items[-1][1]:.0f}배**에 달해 원 넓이로 보면 제품 간 격차가 한눈에 드러남",
     "items": [{"name": i[0], "value": i[1]} for i in items], "unit": "g/대", "dec": 0,
     "foot": foot([EX_NOTE, "원 지름이 아닌 넓이가 값에 비례"], EX_SRC, TODAY)}, True)

# ───────── N029 진행률 막대 (예시 값)
pr = [("가국", 420, 480), ("나국", 310, 360), ("다국", 250, 240), ("라국", 180, 330), ("마국", 90, 300)]
pr[2] = ("다국", 240, 240)
add("N029", "brprog", "진행률 막대", "나라별 신청 대비 배정률",
    {"rows": [{"label": r[0], "done": r[1], "total": r[2]} for r in pr]},
    {"eyebrow": eb("배정", "나라별 신청량 대비 배정 비율", "단위: 만 톤", True),
     "head": f"신청분을 모두 받은 곳은 **다국 한 곳**뿐이고 **마국은 신청량의 {100 * pr[4][1] / pr[4][2]:.0f}%**만 배정받아 나라별 배정률이 크게 엇갈려 편차가 매우 큼",
     "rows": [{"label": r[0], "done": r[1], "total": r[2], "tone": "warn" if r[1] / r[2] < .4 else None} for r in pr], "unit": "만 톤",
     "foot": foot([EX_NOTE, "배정률 = 배정량 ÷ 신청량"], EX_SRC, TODAY)}, True)

# ───────── N030 발산 막대 : 원자재 · 에너지 1년 변화율(실제)
com = [("WTI 원유", "DCOILWTICO"), ("브렌트유", "DCOILBRENTEU"), ("헨리허브 가스", "DHHNGSP"), ("유럽 가스", "PNGASEUUSDM"), ("일본 LNG", "PNGASJPUSDM"),
       ("구리", "PCOPPUSDM"), ("철광석", "PIORECRUSDM"), ("밀", "PWHEAMTUSDM"), ("미국 휘발유", "GASREGW"), ("생산자물가(PPI)", "PPIACO")]
dv = []
for nm, sid in com:
    m = monthly(sid)
    dv.append((nm, sid, 100 * (m[B] / m[A] - 1)))
up = max(dv, key=lambda r: r[2]); dn = min(dv, key=lambda r: r[2])
npos = sum(1 for r in dv if r[2] >= 0)
add("N030", "brdiv", "발산 막대(0 가운데)", "원자재 · 에너지 1년 변화율",
    {"rows": [{"label": r[0], "value": round(r[2], 1)} for r in dv], "from": A, "to": B},
    {"eyebrow": eb("원자재", "에너지 · 곡물 · 금속 가격 1년 변화", "2025.09 대비 2026.09 월평균 변화율, 단위: %"),
     "head": f"1년 새 원자재 · 물가 {len(dv)}개 중 **{npos}개가 올라** **{ga(up[0])} {up[2]:+.1f}%**로 가장 크게 뛰었고 **{eun(dn[0])} {dn[2]:+.1f}%**로 가장 많이 내림".replace("-", "−"),
     "rows": [{"label": r[0], "value": round(r[2], 1)} for r in dv], "unit": "%", "dec": 1, "posName": "1년 새 상승", "negName": "1년 새 하락",
     "foot": foot(["일·주 단위 자료는 월평균"], "FRED(DCOILWTICO · DCOILBRENTEU · DHHNGSP · PNGASEUUSDM · PNGASJPUSDM · PCOPPUSDM 등 10개 계열)", "2026.09")})

# ───────── N031 범위 막대 + 지금 점 : 52주 범위(실제)
rg_defs = [("WTI 원유", "DCOILWTICO", "$", 1), ("브렌트유", "DCOILBRENTEU", "$", 1), ("헨리허브 가스", "DHHNGSP", "$", 2), ("S&P 500", "SP500", "", 0), ("나스닥", "NASDAQCOM", "", 0),
           ("VIX", "VIXCLS", "", 1), ("엔/달러", "DEXJPUS", "엔", 1), ("미국 30년 금리", "DGS30", "%", 2)]
rg = []
asofs = []
for nm, sid, pre, dc in rg_defs:
    _, data = load(sid)
    ld = data[-1][0]
    asofs.append(ld)
    d0 = (date.fromisoformat(ld) - timedelta(days=365)).isoformat()
    win = [v for dt, v in data if dt >= d0]
    rg.append({"label": nm, "lo": round(min(win), dc + 1), "hi": round(max(win), dc + 1), "now": round(data[-1][1], dc + 1), "unit": "%" if pre == "%" else "", "dec": dc, "sid": sid})
near = max(rg, key=lambda r: (r["now"] - r["lo"]) / (r["hi"] - r["lo"]))
far = min(rg, key=lambda r: (r["now"] - r["lo"]) / (r["hi"] - r["lo"]))
asof_rg = dot(max(asofs))
add("N031", "brrange", "범위 막대 + 지금 점", "52주 최저 · 최고 사이 지금 값",
    {"rows": rg},
    {"eyebrow": eb("시장", "자산별 52주 범위 안 지금 위치", "최근 52주 최저 · 최고, 단위: 자산별 표기"),
     "head": f"52주 범위에서 **{eun(near['label'])} 최고가의 {100 * near['now'] / near['hi']:.0f}%** 자리로 고점에 가깝고 **{eun(far['label'])} {100 * far['now'] / far['hi']:.0f}%**로 아래쪽에 머무는 등 자산별 위치 차이가 큼",
     "rows": [{k: v for k, v in r.items() if k != "sid"} for r in rg],
     "foot": foot(["띠 길이는 줄마다 같고 눈금은 자산별로 다름", "계열마다 마지막 관측일 기준"], "FRED(" + " · ".join(r["sid"] for r in rg) + ")", asof_rg)})

# ───────── N032 그룹 막대 + 평균선 : 물가 지표별 3년 상승률(실제)
def yoy(sid, ym):
    m = monthly(sid)
    y, mo = int(ym[:4]), ym[5:]
    return 100 * (m[ym] / m[f"{y - 1}-{mo}"] - 1)

pi = [("소비자물가", "CPIAUCSL"), ("근원 소비자물가", "CPILFESL"), ("근원 PCE", "PCEPILFE"), ("생산자물가", "PPIACO")]
yrs = ["2024-09", "2025-09", "2026-09"]
gv = [{"name": nm, "vals": [round(yoy(sid, y), 1) for y in yrs]} for nm, sid in pi]
avg = sum(g["vals"][2] for g in gv) / len(gv)
hi_g = max(gv, key=lambda g: g["vals"][2])
add("N032", "brgroup", "그룹 막대 + 평균선", "물가 지표별 상승률과 평균",
    {"groups": gv, "avg": round(avg, 2)},
    {"eyebrow": eb("물가", "미국 물가 지표별 전년 대비 상승률", "각 해 9월, 단위: %"),
     "head": f"2026년 9월 미국 물가 4개 지표 평균은 **{avg:.1f}%**이고 **{ga(hi_g['name'])} {hi_g['vals'][2]:.1f}%**로 평균을 가장 크게 웃돌아 지표별 상승 속도 차이가 뚜렷함",
     "groups": gv, "names": ["2024.09", "2025.09", "2026.09"], "unit": "%", "dec": 1, "avg": {"value": round(avg, 2), "label": f"2026.09 평균 {avg:.1f}%"},
     "foot": foot(["상승률 = 해당 월 지수 ÷ 1년 전 같은 달 지수 − 1", "소비자물가 · 근원 · PCE · 생산자물가 모두 월 지수 기준"], "FRED(CPIAUCSL · CPILFESL · PCEPILFE · PPIACO)", "2026.09")})

# ───────── N033 연도별 누적 + 합계 : 미국 연방 재정(실제)
_, rev = load("FYFR"); _, dfc = load("FYFSD"); _, spd = load("FYONET")
rm = {d[:4]: v for d, v in rev}; dm = {d[:4]: v for d, v in dfc}; sm = {d[:4]: v for d, v in spd}
ys = [str(y) for y in range(2019, 2027)]
cols = [{"label": y, "parts": [round(rm[y] / 1e6, 2), round(-dm[y] / 1e6, 2)]} for y in ys]
tot_last = sum(cols[-1]["parts"]); tot_first = sum(cols[0]["parts"])
add("N033", "brstack", "연도별 누적 + 합계", "해마다 연방 지출 = 수입 + 적자",
    {"cols": cols},
    {"eyebrow": eb("재정", "미국 연방 지출을 수입과 적자로 쪼개기", "회계연도, 단위: 조 달러"),
     "head": f"연방 지출은 {ys[0]}년 **{tot_first:.1f}조 달러**에서 {ys[-1]}년 **{tot_last:.1f}조 달러**로 늘었고 이 중 **{cols[-1]['parts'][1]:.1f}조 달러**는 수입이 모자라 적자로 메운 몫임",
     "cols": cols, "names": ["연방 수입", "재정적자(수입 부족분)"], "unit": "조 달러", "dec": 1, "totalName": "연방 지출 합계",
     "foot": foot(["지출 = 수입 + 재정적자(음수 부호 뺌)", "단위 변환: 백만 달러 ÷ 1,000,000"], "FRED(FYFR · FYFSD · FYONET)", dot(last_date("FYFR")))})

# ───────── N034 롤리팝 긴 순위 : 20개 계열 5년 변화율(실제)
ll_defs = [("WTI 원유", "DCOILWTICO"), ("브렌트유", "DCOILBRENTEU"), ("헨리허브 가스", "DHHNGSP"), ("유럽 가스", "PNGASEUUSDM"), ("일본 LNG", "PNGASJPUSDM"), ("구리", "PCOPPUSDM"),
           ("철광석", "PIORECRUSDM"), ("밀", "PWHEAMTUSDM"), ("미국 휘발유", "GASREGW"), ("S&P 500", "SP500"), ("나스닥", "NASDAQCOM"), ("달러 지수", "DTWEXBGS"),
           ("엔/달러", "DEXJPUS"), ("위안/달러", "DEXCHUS"), ("달러/유로", "DEXUSEU"), ("소비자물가", "CPIAUCSL"), ("생산자물가", "PPIACO"), ("M2 통화량", "M2SL"),
           ("유로 소비자물가", "CP0000EZ19M086NEST"), ("연준 총자산", "WALCL")]
A5 = "2021-09"
lv = []
for nm, sid in ll_defs:
    m = monthly(sid)
    lv.append({"label": nm, "value": round(100 * (m[B] / m[A5] - 1), 0)})
lv_s = sorted(lv, key=lambda r: -r["value"])
npos5 = sum(1 for r in lv if r["value"] > 0)
add("N034", "brlolli", "롤리팝 긴 순위", "20개 계열 5년 변화율 순위",
    {"rows": lv, "from": A5, "to": B},
    {"eyebrow": eb("전체", "가격 · 지수 20개 5년 변화 순위", "2021.09 대비 2026.09 월평균 변화율, 단위: %"),
     "head": f"5년 새 20개 중 **{npos5}개가 올라** **{ga(lv_s[0]['label'])} +{lv_s[0]['value']:,.0f}%**로 1위였고 **{eun(lv_s[-1]['label'])} {lv_s[-1]['value']:+.0f}%**로 가장 크게 내려 꼴찌에 머물렀고 오른 계열도 상승 폭 차이가 큼".replace("-", "−"),
     "rows": lv, "unit": "%", "dec": 0, "hero": 3, "rank": True,
     "foot": foot(["일·주 단위 자료는 월평균", "지수 · 가격 · 잔액이 섞여 있어 변화율로만 비교"], "FRED(DCOILWTICO · SP500 · NASDAQCOM · CPIAUCSL · M2SL · WALCL 등 20개 계열)", "2026.09")})

# ───────── N035 불릿 (예시 값)
bl = [("부처 A", 92, 100, 140, "조원"), ("부처 B", 68, 80, 110, "조원"), ("부처 C", 41, 60, 90, "조원"), ("부처 D", 33, 30, 50, "조원"), ("부처 E", 12, 25, 40, "조원")]
add("N035", "brbullet", "불릿(목표 · 실적)", "재정 목표 대비 집행",
    {"rows": [{"label": r[0], "actual": r[1], "target": r[2]} for r in bl]},
    {"eyebrow": eb("재정", "부처별 집행 실적과 연간 목표", "단위: 조원", True),
     "head": f"5개 부처 중 **부처 D만 목표를 넘겼고** **부처 E는 목표의 {100 * bl[4][1] / bl[4][2]:.0f}%**에 그쳐 부처별 집행 속도 차이가 크게 벌어져 후반기 집행이 관건임",
     "rows": [{"label": r[0], "actual": r[1], "target": r[2], "max": r[3], "unit": r[4]} for r in bl],
     "foot": foot([EX_NOTE, "빨간 눈금 = 연간 목표, 막대 = 현재 집행액"], EX_SRC, TODAY)}, True)

# ───────── N036 토네이도 (예시 값)
tn = [("품목 A", 620, 180), ("품목 B", 410, 330), ("품목 C", 305, 520), ("품목 D", 240, 90), ("품목 E", 150, 270), ("품목 F", 95, 60)]
net = sorted(tn, key=lambda r: r[1] - r[2])
add("N036", "brtorn", "토네이도(좌우)", "수출은 왼쪽, 수입은 오른쪽",
    {"rows": [{"label": r[0], "left": r[1], "right": r[2]} for r in tn]},
    {"eyebrow": eb("무역", "품목별 수출입 규모 맞대기", "단위: 억 달러", True),
     "head": f"수출이 가장 큰 **품목 A는 수출 {tn[0][1]}억 달러**로 수입의 **{tn[0][1] / tn[0][2]:.1f}배**이고 반대로 **품목 C는 수입이 수출보다 {tn[2][2] - tn[2][1]}억 달러** 많아 품목별 방향이 갈림",
     "rows": [{"label": r[0], "left": r[1], "right": r[2]} for r in tn], "leftName": "수출", "rightName": "수입", "unit": "억 달러", "dec": 0,
     "foot": foot([EX_NOTE], EX_SRC, TODAY)}, True)

# ───────── N037 가로 막대 + 몫 꼬리표 (예시 값)
sh = [("A사", 31.2), ("B사", 24.5), ("C사", 18.8), ("D사", 11.6), ("E사", 8.4), ("기타", 5.5)]
t3 = sum(v for _, v in sh[:3])
add("N037", "brshare", "가로 막대 + 몫 꼬리표", "시장 점유율 막대 끝에 %",
    {"rows": [{"label": r[0], "value": r[1]} for r in sh], "top3": round(t3, 1)},
    {"eyebrow": eb("시장", "회사별 시장 점유율", "단위: %", True),
     "head": f"점유율 1위 **A사가 {sh[0][1]}%**이고 **상위 3사가 합쳐 {t3:.1f}%**를 차지해 나머지 업체의 몫이 작은 소수 업체 집중형 시장 구조임",
     "rows": [{"label": r[0], "value": r[1]} for r in sh], "top": 3, "dec": 1,
     "foot": foot([EX_NOTE, "기타는 나머지 업체 합계"], EX_SRC, TODAY)}, True)

# ───────── N038 압도 차이 막대 : 연준 대차대조표 항목(실제)
_, w = load("WALCL"); _, rr = load("WRESBAL"); _, tg = load("WTREGEN"); _, rp = load("RRPONTSYD")
g = [("연준 총자산", w[-1][1] / 1e3), ("은행 지급준비금", rr[-1][1] / 1e3), ("재무부 일반계정", tg[-1][1] / 1e3), ("역레포 잔고", rp[-1][1])]
g_asof = dot(max(w[-1][0], rr[-1][0], tg[-1][0], rp[-1][0]))
ratio_a = g[0][1] / g[2][1]
add("N038", "gapbar", "압도 차이 막대(축 끊김)", "연준 총자산 vs 준비금 · TGA · 역레포",
    {"rows": [{"label": r[0], "value": round(r[1], 2)} for r in g], "asof": g_asof},
    {"eyebrow": eb("유동성", "연준 대차대조표 주요 항목 크기", "단위: 십억 달러"),
     "head": f"연준 총자산 **{g[0][1] / 1000:.1f}조 달러**는 재무부 일반계정의 **{ratio_a:.1f}배**이고 **역레포 잔고는 {g[3][1] * 10:.1f}억 달러**까지 줄어 단기 자금 완충이 바닥난 상태임",
     "rows": [{"label": r[0], "value": round(r[1], 2), "tone": ("x" if i == 3 else None)} for i, r in enumerate(g)], "unit": "십억 달러(가장 큰 막대는 축을 끊어 표시)", "dec": 2,
     "band": f"총자산 대비 **준비금 {100 * g[1][1] / g[0][1]:.0f}% · 일반계정 {100 * g[2][1] / g[0][1]:.0f}%**, 역레포는 **{100 * g[3][1] / g[0][1]:.4f}%** 수준으로 시중에 풀린 단기 자금 완충이 거의 없는 상태임",
     "foot": foot(["WALCL · WRESBAL · WTREGEN 은 백만 달러를 십억으로 환산", "계열마다 마지막 관측일이 달라 가장 늦은 날짜 표기"], "FRED(WALCL · WRESBAL · WTREGEN · RRPONTSYD)", g_asof)})

# ───────── N039 아이콘 세기 (예시 값)
ic = [("가국", 56), ("나국", 40), ("다국", 24), ("라국", 16), ("마국", 8)]
add("N039", "brico", "아이콘 세기", "원전 개수를 아이콘 줄로",
    {"rows": [{"label": r[0], "n": r[1]} for r in ic], "per": 4},
    {"eyebrow": eb("에너지", "나라별 가동 원전 수", "단위: 기", True),
     "head": f"가동 원전은 **가국 {ic[0][1]}기**로 마국의 **{ic[0][1] // ic[-1][1]}배**이고 상위 두 나라가 전체 {sum(r[1] for r in ic)}기 중 **{100 * (ic[0][1] + ic[1][1]) // sum(r[1] for r in ic)}%**를 차지해 보유 규모가 크게 쏠려 있는 구조임",
     "rows": [{"label": r[0], "n": r[1]} for r in ic], "icon": "tower", "per": 4, "unit": "기",
     "foot": foot([EX_NOTE, "아이콘 1개 = 4기"], EX_SRC, TODAY)}, True)

# ───────── N040 마리메코 (예시 값)
mk = [("A시장", 420, [46, 30, 24]), ("B시장", 260, [38, 34, 28]), ("C시장", 190, [58, 22, 20]), ("D시장", 130, [27, 25, 48])]
mtot = sum(c[1] for c in mk)
lead = sum(c[1] * c[2][0] / 100 for c in mk)
add("N040", "brmeko", "마리메코", "폭 = 시장 크기, 높이 = 점유율",
    {"cols": [{"name": c[0], "size": c[1], "parts": c[2]} for c in mk]},
    {"eyebrow": eb("시장", "시장 크기와 업체 점유율을 한 면에", "폭: 시장 크기(조원), 높이: 점유율(%)", True),
     "head": f"4개 시장 합계 **{mtot:,}조원** 중 **1위 업체 몫은 {lead:.0f}조원({100 * lead / mtot:.0f}%)**이고 시장이 가장 큰 A시장의 1위 면적이 넓어 전체 몫을 끌어올림",
     "cols": [{"name": c[0], "size": c[1], "parts": c[2]} for c in mk], "names": ["1위 업체", "2위 업체", "그 밖"], "sizeUnit": "조원",
     "foot": foot([EX_NOTE, "면적 = 시장 크기 × 점유율"], EX_SRC, TODAY)}, True)

# ───────── 쓰기
for o in out:
    sl = o["slide"]
    if not sl["head"].count("**"):
        raise SystemExit("굵게 빠짐 " + o["id"])
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
for _o in out:  # 결론 띠 없음(SKILL.md 5절) — 장 아래 결론 글은 헤드메시지로
    if isinstance(_o["slide"].get("band"), str):
        _o["slide"].pop("band")
(ROOT / "library" / "mockups" / "v4" / "F03.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R1", "title": "F03 막대 1차 목업"}, "slides": [o["slide"] for o in out]}
(ROOT / "style" / "demo4_r1_F03.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
real = sum(1 for o in out if "예시값" not in o["tags"])
print("목업", len(out), "실제", real, "예시", len(out) - real)
for o in out:
    print(o["id"], len(o["slide"]["head"].replace(" ", "").replace("**", "")), o["slide"]["head"])
