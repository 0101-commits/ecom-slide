# F07 지도 12종(N075~N086) — 목업 만들기. 실행: python -X utf8 tools/make_mockups4_F07.py
# 쓰는 부품 : l_map(칸 더함 : view · zones · seas · bubble · num · frame · noFlowKey) · n_mptile · n_mprank · n_mpduo
# 실제 값 : 4개국 10년물 금리(OECD 계열 3 + FRED DGS10) · 구분만(공개 사실) : 수출입국 · 인구조사국 권역 · 중국 경제구역 · 한국 권역 · G7 · 항로
# 예시 값 : N077 · N078 · N086 (익명 이름)
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
GOT = "2026.11.13"


def snap4(i):
    return json.loads((S4 / f"{i}.json").read_text(encoding="utf-8"))


def at(d, ym):
    return next(v for k, v in d["data"] if k.startswith(ym))


KR = at(snap4("IRLTLT01KRM156N"), "2026-09")
JP = at(snap4("IRLTLT01JPM156N"), "2026-09")
DE = at(snap4("IRLTLT01DEM156N"), "2026-09")
us_d = json.loads((ROOT / "data" / "snap" / "fred_dgs10.json").read_text(encoding="utf-8"))
US = next(v for k, v in us_d["data"] if k == "2026.09")
Y = {"USA": US, "KOR": KR, "JPN": JP, "DEU": DE}
NAME = {"USA": "미국", "KOR": "한국", "JPN": "일본", "DEU": "독일"}
rank = sorted(Y, key=lambda k: -Y[k])
GAP = Y[rank[0]] - Y[rank[-1]]
YSRC = "OECD(IRLTLT01KRM156N · IRLTLT01JPM156N · IRLTLT01DEM156N), FRED(DGS10)"
EX = "숫자는 모양을 보이기 위한 예시 값"


def f1(v):
    return f"{v:.2f}"


def eb(group, topic, basis):
    return {"group": group, "topic": topic, "basis": basis}


def ft(notes, source, asof=GOT):
    return {"notes": notes, "source": source, "asof": asof}


items = []


def add(no, variant, title, tags, facts, slide):
    items.append({"id": no, "kind": slide["kind"], "family": "F07", "variant": variant, "title": title, "tags": ["4판"] + tags, "facts": facts, "slide": slide})


# ---- N075 세계 지도 흐름 화살표 — 구분만(굵기 같음)
EXP = {"미국": [-93, 29.5], "카타르": [51.2, 25.3], "호주": [134, -25]}
IMP = {"일본": [138, 36], "한국": [127.5, 36.5], "중국": [119, 31], "유럽": [4, 50]}
fl = [
    ("미국", "유럽", [[-45, 47]], "main"), ("미국", "한국", [[-62, 10], [-28, -20], [20, -36], [85, -15], [113, 10]], "main"),
    ("카타르", "일본", [[75, 12], [100.5, 3], [122, 20]], "dark"), ("카타르", "유럽", [[44, 12.5], [32.5, 30], [14, 38]], "dark"),
    ("호주", "중국", [[118, -2]], "g65"), ("호주", "일본", [[156, 0]], "g65")]
pos = {"미국": "l", "카타르": "t", "호주": "r", "일본": "r", "한국": "l", "중국": "l", "유럽": "t"}
add("N075", "세계 지도 흐름 화살표", "LNG 수출국에서 수입 지역으로 가는 바닷길", ["실제구분"],
    {"수출국": list(EXP), "수입 지역": list(IMP), "흐름선": len(fl)},
    {"kind": "map", "eyebrow": eb("에너지", "LNG 바닷길(방향만)", "수출국 → 수입 지역, 굵기는 같음"),
     "head": f"LNG는 **미국 · 카타르 · 호주** 등 수출국 **{len(EXP)}곳**에서 실려 **동아시아와 유럽**의 수입 지역 **{len(IMP)}곳**으로 감 · 바닷길 **길목 다섯 곳**을 지남",
     "noFlowKey": True, "dstKey": "수입 지역",
     "points": [{"at": v, "label": k, "kind": "src", "pos": pos[k]} for k, v in EXP.items()] + [{"at": v, "label": k, "kind": "dst", "pos": pos[k]} for k, v in IMP.items()],
     "flows": [{"from": EXP[a], "to": IMP[b], "via": via, "tone": t} for a, b, via, t in fl],
     "chokes": [{"at": [56.4, 26.6], "label": "호르무즈"}, {"at": [100.5, 3], "label": "말라카"}, {"at": [32.5, 30], "label": "수에즈"}, {"at": [-79.6, 9], "label": "파나마"}, {"at": [20, -36], "label": "희망봉"}],
     "foot": ft(["흐름선은 방향만 나타내며 굵기는 같음(물량 수치 없음)", "수출국 · 수입 지역 구분은 널리 알려진 공개 사실"], "공개 사실(수출국 · 수입 지역 구분)")})

# ---- N076 단계 구분도 — 4개국 10년물 금리(실제)
bins = [2.5, 3.0, 3.5, 4.0, 4.5]
add("N076", "단계 구분도", "나라별 10년물 금리를 색으로 칠한 지도", ["실제값"],
    {"기준월": "2026.09", **{NAME[k]: Y[k] for k in Y}, "최고": NAME[rank[0]], "최저": NAME[rank[-1]], "격차(%p)": round(GAP, 2)},
    {"kind": "map", "eyebrow": eb("금리", "나라별 10년물 국채 금리", "2026년 9월 월평균, 단위: %"),
     "head": f"2026년 9월 10년물 금리는 **{NAME[rank[0]]} {f1(Y[rank[0]])}%**로 비교 4개국 중 **가장 높고** **{NAME[rank[-1]]} {f1(Y[rank[-1]])}%**가 가장 낮아 격차가 **{GAP:.2f}%p**임",
     "unit": "%", "dec": 2, "fill": {k: round(v, 3) for k, v in Y.items()}, "legend": {"title": "10년물 금리", "bins": bins, "none": "자료 없음"},
     "fillLabels": ["USA", "KOR", "JPN", "DEU"],
     "foot": ft(["자료가 있는 4개국만 칠함(나머지는 「자료 없음」)", "미국은 DGS10 월평균, 나머지는 OECD 월평균"], YSRC, "2026.09")})

# ---- N077 거점 점 지도 — 예시
sites = [("거점 가", [-98, 40], 62), ("거점 나", [118, 34], 48), ("거점 다", [10, 50], 35), ("거점 라", [-50, -12], 28), ("거점 마", [135, -26], 22), ("거점 바", [28, -27], 18), ("거점 사", [78, 22], 12), ("거점 아", [100, 60], 9)]
tot = sum(v for _, _, v in sites)
top2 = (sites[0][2] + sites[1][2]) / tot * 100
add("N077", "거점 점 지도", "공장 · 광산 거점 위치와 규모 원", ["예시값"],
    {"거점 수": len(sites), "합계(만 톤)": tot, "상위2 비중(%)": round(top2, 1)},
    {"kind": "map", "eyebrow": eb("공급망", "생산 거점 분포", "거점별 연간 생산 규모(만 톤), 예시 값"),
     "head": f"생산 거점 **{len(sites)}곳**의 연간 규모는 합 **{tot}만 톤**이고 **거점 가 · 나** 두 곳이 **{top2:.0f}%**를 차지해 **한두 곳에 쏠림** · 지도의 원이 클수록 연간 생산 규모가 큼",
     "unit": "만 톤", "bubble": True, "bubbleKey": "원 크기 = 연간 생산 규모",
     "points": [{"at": a, "label": n, "value": v, "kind": "src", "pos": {"거점 다": "t", "거점 가": "l"}.get(n, "r")} for n, a, v in sites],
     "foot": ft([EX, "거점 위치는 모양을 보이기 위한 임의 지점"], "부품 시험용 가상 자료")})

# ---- N078 해협 · 항로 확대 — 예시 통항량
ships = [("A급 선박", 38), ("B급 선박", 27), ("C급 선박", 25)]
st = sum(v for _, v in ships)
add("N078", "해협 · 항로 확대", "해협 하나를 확대하고 하루 통항량을 겹침", ["예시값"],
    {"하루 통항(척)": st, "A급 비중(%)": round(ships[0][1] / st * 100, 1)},
    {"kind": "map", "eyebrow": eb("물류", "해협 확대", "하루 통항 척수, 예시 값"),
     "head": f"해협 하나를 크게 보면 모든 항로가 **좁은 물길 한 곳**으로 모임 · 하루 통항 예시 **{st}척** 중 **A급 선박이 {ships[0][1] / st * 100:.0f}%**임 · 길목이 막히면 **모든 항로가 멈춤**",
     "view": {"bbox": [42, 19, 68, 32]}, "noFlowKey": True, "unit": "척",
     "zones": [{"iso": ["IRN"], "tone": "g18", "label": "육지 가", "at": [55, 30]}, {"iso": ["SAU", "ARE", "OMN", "QAT"], "tone": "g08", "label": "육지 나", "at": [49.5, 22.5]}],
     "seas": [{"at": [51.2, 28.1], "label": "안쪽 바다"}, {"at": [61.5, 24.6], "label": "바깥 바다"}],
     "flows": [{"from": [50.3, 27.3], "to": [66, 19.8], "via": [[53.5, 26.9], [56.3, 26.4], [58.6, 25.3], [62, 22.8]], "tone": "main"}],
     "chokes": [{"at": [56.4, 26.6], "label": "해협 가", "pos": "t"}],
     "box": {"title": "하루 통항(척) 예시", "rows": [{"label": n, "value": v} for n, v in ships]},
     "foot": ft([EX, "해협 · 육지 이름은 가렸음(위치만 실제 지형)"], "부품 시험용 가상 자료")})

# ---- N079 동아시아 경계 지도 — 구분만
zones = [("한국", ["KOR"], "main"), ("일본", ["JPN"], "g65"), ("중국", ["CHN"], "g18"), ("북한", ["PRK"], "g40"), ("대만", ["TWN"], "g40"), ("러시아", ["RUS"], "g08")]
seas = [{"at": [133, 40.2], "label": "동해"}, {"at": [123.3, 35.6], "label": "황해"}, {"at": [126, 28.4], "label": "동중국해"}, {"at": [146, 46.5], "label": "오호츠크해"}]
chokes = [{"at": [129.6, 34.3], "label": "대한해협", "pos": "b"}, {"at": [119.5, 24.3], "label": "대만해협", "pos": "l"}]
add("N079", "동아시아 경계 지도", "동아시아 나라와 바다 · 해협 이름을 한 화면에", ["실제구분"],
    {"나라": [z[0] for z in zones], "바다": [x["label"] for x in seas], "해협": [x["label"] for x in chokes]},
    {"kind": "map", "eyebrow": eb("지리", "동아시아 바다와 나라", "나라 구분 · 바다 · 해협 이름"),
     "head": f"동아시아는 나라 **{len(zones)}곳**이 **바다 {len(seas)}곳 · 해협 {len(chokes)}곳**으로 이어짐 · **동해 · 황해 · 동중국해**가 **한 · 중 · 일**을 잇는 바다임 · 나라는 색으로 구분함",
     "view": {"bbox": [104, 20, 150, 52]}, "noFlowKey": True,
     "zones": [dict({"iso": i, "tone": t, "label": n}, **({"at": [136, 50.5]} if n == "러시아" else {})) for n, i, t in zones], "seas": seas, "chokes": chokes,
     "foot": ft(["해양 경계선은 나타내지 않고 나라 구분과 바다 이름만 표시", "나라 · 바다 · 해협 이름은 널리 알려진 공개 사실"], "공개 사실(지리 이름)")})

# ---- N080 미국 주별 타일 지도 — 인구조사국 권역(구분만)
US_REG = [("북동부", "g18", "CT ME MA NH RI VT NJ NY PA"), ("중서부", "g40", "IL IN MI OH WI IA KS MN MO NE ND SD"),
          ("남부", "g65", "DE FL GA MD NC SC VA DC WV AL KY MS TN AR LA OK TX"), ("서부", "dark", "AZ CO ID MT NV NM UT WY AK CA HI OR WA")]
usg = [{"label": n, "tone": t, "ids": ids.split()} for n, t, ids in US_REG]
usn = [len(g["ids"]) for g in usg]
add("N080", "미국 주별 지도", "미국 50개 주와 DC를 칸 하나씩 놓은 타일 지도", ["실제구분"],
    {"권역별 칸 수": {g["label"]: len(g["ids"]) for g in usg}},
    {"kind": "mptile", "eyebrow": eb("미국 경제", "주별 지도(권역 구분)", "미국 인구조사국 4개 권역"),
     "head": f"미국은 **50개 주와 DC**가 인구조사국 기준 **4개 권역**으로 나뉘며 **남부 {usn[2]}곳**이 가장 많고 **북동부 {usn[0]}곳**이 가장 적음 · 칸 크기는 모두 같음",
     "layout": "us", "groups": usg, "groupKey": "인구조사국 권역", "countUnit": "곳",
     "foot": ft(["칸은 주 이름 영문 약자, 대략의 지리 자리에 놓음(면적과 무관)", f"남부 {usn[2]}곳에는 DC 포함, 주별 숫자 없이 구분만 표시"], "미국 인구조사국(권역 구분, 공개 사실)")})

# ---- N081 지도 + 옆 순위 막대 — 4개국 10년물 금리
pts = [{"at": {"USA": [-98, 39], "KOR": [126.3, 36.5], "JPN": [140.5, 37], "DEU": [10.4, 51]}[k], "num": i + 1, "kind": "src"} for i, k in enumerate(rank)]
add("N081", "지도 + 옆 순위 막대", "지도엔 번호, 옆엔 값 막대", ["실제값"],
    {"기준월": "2026.09", "순위": [NAME[k] for k in rank], **{NAME[k]: Y[k] for k in Y}},
    {"kind": "mprank", "eyebrow": eb("금리", "나라별 10년물 금리 순위", "2026년 9월 월평균, 단위: %"),
     "head": f"10년물 금리는 **{NAME[rank[0]]} {f1(Y[rank[0]])}%**에서 **{NAME[rank[-1]]} {f1(Y[rank[-1]])}%**까지 갈려 **{GAP:.2f}%p** 벌어짐 · **한국 {f1(KR)}%**는 **{rank.index('KOR') + 1}번째**임 · 지도 번호는 막대 순서와 같음",
     "mapW": 740, "map": {"points": pts, "numKey": "번호 = 금리 높은 순서"}, "metrics": [{"title": "10년물 국채 금리(%)", "unit": "%", "dec": 2, "rows": [{"label": NAME[k], "value": round(Y[k], 3), "num": i + 1} for i, k in enumerate(rank)]}],
     "foot": ft(["자료가 있는 4개국만 표시", "미국은 DGS10 월평균, 나머지는 OECD 월평균"], YSRC, "2026.09")})

# ---- N082 육각 카토그램 — G7 구분 + 4개국 금리
HX = {"캐나다": (1, 0), "러시아": (7, 0), "미국": (1, 1), "영국": (4, 1), "독일": (5, 1), "튀르키예": (6, 1), "중국": (8, 1), "일본": (10, 1),
      "멕시코": (1, 2), "스페인": (3, 2), "프랑스": (4, 2), "이탈리아": (5, 2), "사우디": (6, 2), "인도": (7, 2), "한국": (9, 2),
      "브라질": (2, 3), "이집트": (5, 3), "이란": (6, 3), "인니": (8, 3), "아르헨": (2, 4), "남아공": (5, 4), "호주": (8, 4)}
G7 = ["미국", "캐나다", "영국", "프랑스", "독일", "이탈리아", "일본"]
ISO_N = {"미국": "USA", "한국": "KOR", "일본": "JPN", "독일": "DEU"}
vals = {n: round(Y[i], 2) for n, i in ISO_N.items()}
add("N082", "육각 카토그램", "나라를 같은 크기 육각으로 그린 지도", ["실제구분", "실제값"],
    {"G7": G7, "금리 있는 나라": vals, "칸 수": len(HX)},
    {"kind": "mptile", "eyebrow": eb("세계 경제", "육각 카토그램", "G7 구분 · 10년물 금리(%)"),
     "head": f"면적 대신 나라를 **같은 크기 육각**으로 놓으면 **G7 {len(G7)}곳**이 북미 · 유럽 · 동아시아에 고루 박힘 · 금리 자료는 **4개국**만 있음",
     "shape": "hex", "tiles": [{"id": n, "label": n, "c": c - 1, "r": r} for n, (c, r) in HX.items()], "values": vals, "unit": "%", "dec": 2, "fs": 13,
     "groups": [{"label": "G7 나라", "tone": "main", "ids": G7}, {"label": "그 밖의 나라", "tone": "g40", "ids": [n for n in HX if n not in G7]}], "groupKey": "G7 구분", "countUnit": "곳",
     "foot": ft([f"육각은 나라 면적과 무관하게 대략의 지리 자리에 놓음({len(HX)}개국 선택)", "육각 안 숫자 = 2026년 9월 10년물 금리, 자료가 있는 4개국만"], YSRC, "2026.09")})

# ---- N083 중국 성별 타일 지도 — 4대 경제구역(구분만)
CN = [("동부", "g65", "북경 천진 하북 상해 강소 절강 복건 산동 광동 해남"), ("중부", "g40", "산서 안휘 강서 하남 호북 호남"),
      ("서부", "dark", "내몽골 광서 중경 사천 귀주 운남 서장 섬서 감숙 청해 영하 신강"), ("동북", "g18", "요녕 길림 흑룡강")]
cng = [{"label": n, "tone": t, "ids": ids.split()} for n, t, ids in CN]
cnn = {g["label"]: len(g["ids"]) for g in cng}
add("N083", "중국 성별 지도", "중국 31개 성급 지역을 칸 하나씩 놓은 타일 지도", ["실제구분"],
    {"구역별 칸 수": cnn},
    {"kind": "mptile", "eyebrow": eb("중국 경제", "성별 지도(경제구역 구분)", "국가통계국 4대 경제구역"),
     "head": f"중국 **31개 성급 지역**은 **4대 경제구역**으로 묶이며 **서부 {cnn['서부']}곳**이 가장 많고 **직할시 4곳**은 굵은 테두리로 따로 표시함 · 칸 크기는 모두 같음",
     "layout": "cn", "groups": cng, "ring": ["북경", "천진", "상해", "중경"], "groupKey": "4대 경제구역", "countUnit": "곳",
     "marks": [{"shape": "ring", "label": "직할시(북경 · 천진 · 상해 · 중경)"}],
     "foot": ft(["성 이름은 한자음 표기, 대략의 지리 자리에 놓음(면적과 무관)", "홍콩 · 마카오 · 대만은 포함하지 않음, 성별 숫자 없이 구분만 표시"], "중국 국가통계국(경제구역 구분, 공개 사실)")})

# ---- N084 한국 시도 타일 지도 — 권역(구분만)
KRG = [("수도권", "main", "서울 인천 경기"), ("충청", "g65", "대전 세종 충북 충남"), ("호남", "g40", "광주 전북 전남"), ("영남", "dark", "부산 대구 울산 경북 경남"), ("강원 · 제주", "g18", "강원 제주")]
krg = [{"label": n, "tone": t, "ids": ids.split()} for n, t, ids in KRG]
krn = {g["label"]: len(g["ids"]) for g in krg}
CITY = "서울 부산 대구 인천 광주 대전 울산 세종".split()
add("N084", "한국 시도 지도", "한국 17개 시도를 칸 하나씩 놓은 타일 지도", ["실제구분"],
    {"권역별 칸 수": krn, "시": len(CITY)},
    {"kind": "mptile", "eyebrow": eb("한국 경제", "시도별 지도(권역 구분)", "17개 시도, 5개 권역"),
     "head": f"한국 **17개 시도**는 **5개 권역**으로 묶이며 **영남 {krn['영남']}곳**이 가장 많고 **수도권은 {krn['수도권']}곳**임 · **특별 · 광역시 {len(CITY)}곳**은 둥근 칸임 · 칸 크기는 모두 같음",
     "layout": "kr", "groups": krg, "round": CITY, "groupKey": "권역", "countUnit": "곳",
     "marks": [{"shape": "circle", "label": f"특별 · 광역 · 특별자치시 {len(CITY)}곳"}, {"shape": "sq", "label": f"도 · 특별자치도 {17 - len(CITY)}곳"}],
     "foot": ft(["칸은 시도 이름, 대략의 지리 자리에 놓음(면적과 무관)", "권역 구분은 일반적 통용 기준, 시도별 숫자 없이 구분만 표시"], "공개 사실(행정구역 · 권역 구분)")})

# ---- N085 전후 두 지도 — 항로 변화(구분만)
VIEW = {"bbox": [-28, -42, 128, 58]}
A = [[121, 31], [113, 10], [100.5, 3], [80, 5], [55, 13], [44, 12.5], [32.5, 30], [14, 37], [4, 50]]
B = [[121, 31], [113, 10], [100.5, 3], [80, 5], [60, -5], [40, -25], [22, -37], [5, -20], [0, 0], [-18, 20], [-12, 36], [-6, 45], [4, 50]]
ends = [{"at": [121, 31], "label": "아시아 항", "kind": "src", "pos": "b"}, {"at": [4, 50], "label": "유럽 항", "kind": "dst", "pos": "t"}]
add("N085", "전후 두 지도", "사건 전후 아시아-유럽 항로가 바뀐 모습", ["실제구분"],
    {"사건 전 길목": ["말라카", "수에즈"], "사건 후 길목": ["말라카", "희망봉"]},
    {"kind": "mpduo", "eyebrow": eb("물류", "홍해 사태 전후 항로", "아시아 → 유럽, 개념도"),
     "head": "홍해 사태 뒤 아시아와 유럽을 잇는 컨테이너 항로 일부가 **수에즈 경유에서 희망봉 우회**로 바뀜 · 같은 두 항구 사이 **길목 한 곳이 빠지고 한 곳이 더해짐**",
     "panels": [
         {"title": "수에즈 운하 경유", "map": {"view": VIEW, "points": ends, "flows": [{"from": A[0], "to": A[-1], "via": A[1:-1], "tone": "main"}], "chokes": [{"at": [100.5, 3], "label": "말라카", "pos": "b"}, {"at": [32.5, 30], "label": "수에즈", "pos": "r"}]}},
         {"title": "희망봉 우회", "map": {"view": VIEW, "points": ends, "flows": [{"from": B[0], "to": B[-1], "via": B[1:-1], "tone": "warn"}], "chokes": [{"at": [100.5, 3], "label": "말라카", "pos": "b"}, {"at": [22, -37], "label": "희망봉", "pos": "r"}]}}],
     "foot": ft(["항로는 개념도이며 거리 · 물량 수치는 나타내지 않음", "항로 변화 사실은 공개 보도에 알려진 내용만 사용"], "공개 사실(항로 구분)")})

# ---- N086 두 항로 거리 비교 — 예시
dA, dB, kA, kB = 14, 21, 10, 14
add("N086", "두 항로 거리 비교", "항로 A와 항로 B의 날수 · 거리 비교", ["예시값"],
    {"항로 A": {"날수": dA, "거리(천 해리)": kA}, "항로 B": {"날수": dB, "거리(천 해리)": kB}},
    {"kind": "mprank", "eyebrow": eb("물류", "두 항로 비교", "편도 날수 · 거리, 예시 값"),
     "head": f"항로 B는 항로 A보다 **{dB - dA}일 · {kB - kA}천 해리** 더 길어 걸리는 날수가 **{(dB / dA - 1) * 100:.0f}%** 늘어남 · 같은 두 항구 사이 **우회 비용**을 보이는 예시임",
     "mapW": 640,
     "map": {"view": VIEW, "points": [{"at": A[0], "label": "출발항 가", "kind": "src", "pos": "b"}, {"at": A[-1], "label": "도착항 나", "kind": "dst", "pos": "t"}],
             "flows": [{"from": A[0], "to": A[-1], "via": A[1:-1], "tone": "main"}, {"from": B[0], "to": B[-1], "via": B[1:-1], "tone": "warn"}],
             "chokes": [{"at": [32.5, 30], "label": "항로 A", "pos": "r"}, {"at": [5, -20], "label": "항로 B", "pos": "l"}]},
     "metrics": [{"title": "편도 날수(일)", "unit": "일", "rows": [{"label": "항로 A(짧은 길)", "value": dA}, {"label": "항로 B(먼 길)", "value": dB}]},
                 {"title": "편도 거리(천 해리)", "unit": "천 해리", "rows": [{"label": "항로 A(짧은 길)", "value": kA}, {"label": "항로 B(먼 길)", "value": kB}]}],
     "foot": ft([EX, "항구 이름은 가렸음(위치만 실제 지형)"], "부품 시험용 가상 자료")})

# ---- 점검 · 쓰기
BADH = [(it["id"], len(re.sub(r"[\s*]", "", it["slide"]["head"]))) for it in items if not 50 <= len(re.sub(r"[\s*]", "", it["slide"]["head"])) <= 90]
assert not BADH, BADH
for it in items:
    if "예시값" in it["tags"]:
        sl = it["slide"]
        assert "예시 값" in sl["eyebrow"]["basis"], it["id"]
        assert any("예시 값" in n for n in sl["foot"]["notes"]), it["id"]
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
(ROOT / "library" / "mockups" / "v4" / "F07.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R1", "title": "F07 지도 1차 목업"}, "slides": [it["slide"] for it in items]}
(ROOT / "style" / "demo4_r1_F07.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(items), "종", [(i["id"], len(re.sub(r"[\s*]", "", i["slide"]["head"]))) for i in items])
