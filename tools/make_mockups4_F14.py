# F14 인물 · 발언 8종(N147~N154) + F16 구성 분해 8종(N161~N168) 2차 목업 — library/mockups/v4/F14.json · style/demo4_r2_F14.json 을 씀
# 실행: python -X utf8 tools/make_mockups4_F14.py
import json, re, random, math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
EX = "숫자는 모양을 보이기 위한 예시 값"
ASOF = "2026.11.13"


def load(n):
    return json.load(open(S4 / f"{n}.json", encoding="utf8"))


def head_len(h):
    return len(re.sub(r"\s|\*\*", "", h))


def f(v, d=0):
    s = f"{abs(v):,.{d}f}"
    return ("−" if v < 0 and float(s.replace(",", "")) != 0 else "") + s


def sg(v, d=1):
    return ("+" if v >= 0 else "−") + f"{abs(v):,.{d}f}"


out = []


def add(id_, fam, kind, variant, title, facts, slide, real):
    slide["kind"] = kind
    hl = head_len(slide["head"])
    if not 50 <= hl <= 90:
        print("HEAD", id_, hl)
    out.append({"id": id_, "kind": kind, "family": fam, "variant": variant, "title": title,
                "tags": ["4판"] if real else ["4판", "예시 값"], "facts": facts, "slide": slide})


def foot_ex(extra=None):
    return {"notes": [EX] + (extra or []), "source": "예시(실제 발언 · 인물 · 자료 아님)", "asof": ASOF}


# =============== F14 인물 · 발언 (모두 예시 값 · 익명) ===============
# ---- N147 발언 인용 카드
add("N147", "F14", "qtcard", "발언 인용 카드 + 해석", "의장 발언 한 줄과 읽는 법", {"읽는 법": 3},
    {"eyebrow": {"group": "인물 · 발언", "topic": "기자회견 발언 한 줄 읽기", "basis": "가상의 의장 · 예시 문구, 예시 값"},
     "head": "의장이 **‘확신이 들 때까지’** **‘당분간’** **‘제약적’** 세 말로 인하 시점을 데이터에 맡겨, 시장은 **즉각 인하는 아니라고** 읽을 수 있음",
     "foot": foot_ex(["발언 문구는 모양을 보이기 위한 예시 문구이며 실제 발언이 아님"]),
     "quote": {"text": "물가가 목표로 돌아온다는 확신이 들 때까지, 정책은 당분간 제약적인 수준을 유지할 것입니다.", "mark": "확신이 들 때까지", "who": "의장 가", "ctx": "정례 회의 뒤 기자회견 · 예시 문구", "tags": ["조건부 약속", "시점 모호", "긴축 유지"]},
     "readsTitle": "이 문장을 읽는 법",
     "reads": [{"k": "‘확신이 들 때까지’", "sig": "조건이 데이터에 달림", "t": "물가가 더 내려가는 것을 눈으로 확인하기 전에는 움직이지 않겠다는 뜻으로 읽힘"},
               {"k": "‘당분간’", "sig": "시점은 말하지 않음", "t": "몇 달인지 밝히지 않아 가까운 회의에서 인하가 나오기는 어렵다는 신호", "tone": "warn"},
               {"k": "‘제약적인 수준’", "sig": "긴축 기조 그대로", "t": "금리를 더 올린다는 말은 없고, 지금 수준을 유지한다는 뜻으로 읽힘"}]}, False)

# ---- N148 발언 전후 시장 선 (예시 구간)
rnd = random.Random(148)
n = 61
at = 30


def walk(drift_after, jump, vol):
    v, arr = 100.0, []
    for i in range(n):
        if i == at:
            v = 100.0
            arr.append(v)
            continue
        if i < at:
            v += rnd.gauss(0, vol)
        else:
            v += rnd.gauss(drift_after, vol) + (jump if i == at + 1 else 0)
        arr.append(v)
    base = arr[at]
    return [round(x - base + 100, 2) for x in arr]


s1 = walk(-.012, -.35, .07)
s2 = walk(.01, .28, .06)
span = 15
c1, c2 = s1[at + span] - s1[at], s2[at + span] - s2[at]
add("N148", "F14", "qtmark", "발언 전후 시장 선", "발언 시각 전후 시장 움직임", {"구간": "발언 −30분 ~ +30분(예시)", "주가 변화(%)": round(c1, 2), "달러 변화(%)": round(c2, 2)},
    {"eyebrow": {"group": "인물 · 발언", "topic": "발언 시각 전후 1시간 시장 반응", "basis": "발언 시각 = 100, 분 단위 가상 구간, 예시 값"},
     "head": f"발언 시각을 100으로 맞추면 **15분 뒤 주가는 {sg(c1,1)}%**, **달러는 {sg(c2,1)}%** 움직여 말 한 줄에 **두 시장이 반대로** 반응함",
     "foot": foot_ex(["분 단위 가상 구간이며 실제 날짜 · 시각 자료가 아님"]),
     "labels": [f"{i-at:+d}분" if i != at else "발언" for i in range(n)], "xTicks": [0, 15, 30, 45, 60], "at": at, "span": span, "unit": "발언 시각 = 100",
     "beforeText": "발언 전 30분", "afterText": "발언 후 30분", "atText": "발언 시각",
     "series": [{"name": "A 주가지수(가상)", "data": s1, "color": "main", "unit": "%", "sub": "발언 15분 뒤 변화", "sub2": "발언 시각 = 100 기준"},
                {"name": "B 달러지수(가상)", "data": s2, "color": "warn", "unit": "%", "sub": "발언 15분 뒤 변화", "sub2": "발언 시각 = 100 기준"}]}, False)

# ---- N149 매파 · 비둘기 척도
mem = [("가", .50, .50, True), ("나", .12, .12, False), ("다", .20, .10, False), ("라", .34, .34, False), ("마", .46, .38, False),
       ("바", .56, .56, False), ("사", .70, .62, False), ("아", .82, .82, False), ("자", .90, .78, False)]
nh = sum(1 for m in mem if m[1] < .38)
nm = sum(1 for m in mem if .38 <= m[1] <= .62)
nd = sum(1 for m in mem if m[1] > .62)
med = sorted(m[1] for m in mem)[len(mem) // 2]
moved = [m for m in mem if m[1] != m[2]]
add("N149", "F14", "qtscale", "매파 · 비둘기 척도", "위원 9명의 성향 배치", {"매파": nh, "중립": nm, "비둘기": nd, "중간값": med, "옮긴 위원": len(moved)},
    {"eyebrow": {"group": "인물 · 발언", "topic": "위원 9명 성향 배치", "basis": "익명 위원, 지난 회의 → 이번 회의, 예시 값"},
     "head": f"위원 9명 가운데 **매파 {nh}명 · 중립 {nm}명 · 비둘기 {nd}명**이고 지난번보다 **{len(moved)}명이 비둘기 쪽으로 옮겨** 갔지만 중간값은 **중립**에 놓여 **인하 쪽이 다수라 하기엔 이름**",
     "foot": foot_ex(["위원 이름은 가 · 나 · 다 같은 익명이며 성향 위치는 가상의 값"]),
     "left": "금리 인상 선호", "right": "금리 인하 선호", "median": med, "medianText": "중간값 위원",
     "members": [{"n": a, "pos": b, "prev": c, "chair": d} for a, b, c, d in mem], "moveText": "점선 동그라미 = 지난 회의 위치",
     "counts": [{"label": "매파", "value": f"{nh}명", "tone": "warn"}, {"label": "중립", "value": f"{nm}명", "tone": "gray"}, {"label": "비둘기", "value": f"{nd}명", "tone": "main"}, {"label": "위치를 옮긴 위원", "value": f"{len(moved)}명", "tone": "dark"}]}, False)

# ---- N150 인물 관계도
add("N150", "F14", "qtnet", "인물 관계도", "정책 결정 주변 사람 · 조직 관계", {"인물": 5, "조직": 3, "관계": 9},
    {"eyebrow": {"group": "인물 · 발언", "topic": "정책 결정 주변 사람 · 조직 관계", "basis": "가상의 인물 · 조직, 선 종류별 관계, 예시 값"},
     "head": "정부 부처는 **의장 가와 위원 나를 지명**하고 의장은 사무국에서 **보고**를 받으며, 위원 마 · 바 사이엔 **견해 대립**이 있어 표결이 **갈릴 수 있는 구도**임",
     "foot": foot_ex(["인물 · 조직은 모두 가상의 역할 이름이며 실제 인물이 아님"]),
     "nodes": [{"id": "a", "name": "의장 가", "sub": "결정 주재", "x": .47, "y": .46, "tone": "dark"},
               {"id": "gov", "name": "정부 부처", "sub": "지명 권한", "type": "org", "x": .12, "y": .46},
               {"id": "sec", "name": "사무국", "sub": "자료 · 보고", "type": "org", "x": .42, "y": .86},
               {"id": "adv", "name": "자문단", "sub": "외부 전문가", "type": "org", "x": .90, "y": .86},
               {"id": "b", "name": "위원 나", "sub": "전 부처 출신", "x": .12, "y": .80},
               {"id": "c", "name": "위원 다", "sub": "학계 출신", "x": .90, "y": .46},
               {"id": "d", "name": "위원 라", "sub": "금융권 출신", "x": .68, "y": .76},
               {"id": "e", "name": "위원 마", "sub": "매파 성향", "x": .30, "y": .10},
               {"id": "g", "name": "위원 바", "sub": "비둘기 성향", "x": .68, "y": .10}],
     "edges": [{"from": "gov", "to": "a", "kind": "power", "text": "지명"}, {"from": "gov", "to": "b", "kind": "power", "text": "지명"},
               {"from": "sec", "to": "a", "kind": "adv", "text": "보고"}, {"from": "adv", "to": "c", "kind": "adv", "text": "자문"},
               {"from": "adv", "to": "d", "kind": "adv", "text": "자문"}, {"from": "e", "to": "g", "kind": "rival", "text": "견해 대립", "dir": False},
               {"from": "a", "to": "e", "kind": "adv", "text": "의견 청취"}, {"from": "a", "to": "g", "kind": "adv", "text": "의견 청취"},
               {"from": "c", "to": "d", "kind": "tie", "text": "같은 대학", "dir": False}]}, False)

# ---- N151 성명 문구 비교 (문단 나란히)
old_p = ["경기는 **완만한** 속도로 확장되고 있으며, 고용 증가세는 **견조함**.", "물가 상승률은 **여전히 높은 수준**이며 위원회는 물가 위험에 **크게 주의**하고 있음.", "위원회는 추가 **금리 인상 여부**를 데이터에 따라 판단하겠음."]
new_p = ["경기는 **완만한** 속도로 확장되고 있으며, 고용 증가세는 ~~견조함~~ ++다소 둔화됨++.", "물가 상승률은 ~~여전히 높은 수준~~ ++내려오고 있으나 아직 높음++이며 위원회는 물가 위험에 ~~크게 주의~~ ++주의++하고 있음.", "위원회는 추가 ~~금리 인상 여부~~ ++정책 조정의 정도와 시기++를 데이터에 따라 판단하겠음."]
old_m = [re.sub(r"\*\*", "", p) for p in old_p]
# 지난 문구에서는 바뀐 낱말을 ~~ ~~ 로 표시
old_m = ["경기는 완만한 속도로 확장되고 있으며, 고용 증가세는 ~~견조함~~.", "물가 상승률은 ~~여전히 높은 수준~~이며 위원회는 물가 위험에 ~~크게 주의~~하고 있음.", "위원회는 추가 ~~금리 인상 여부~~를 데이터에 따라 판단하겠음."]
new_m = [re.sub(r"\*\*", "", p) for p in new_p]
new_m = [p.replace("~~견조함~~ ", "").replace("~~여전히 높은 수준~~ ", "").replace("~~크게 주의~~ ", "").replace("~~금리 인상 여부~~ ", "") for p in new_m]
add("N151", "F14", "qtdiff", "성명 문구 문단 비교", "지난번 · 이번 성명 문단 비교", {"바뀐 곳": 4, "문장": 3},
    {"eyebrow": {"group": "인물 · 발언", "topic": "성명 문단 비교", "basis": "가상의 성명 · 예시 문구, 예시 값"},
     "head": "성명 세 문장 가운데 **네 곳의 표현이 바뀌어** ‘견조함’은 **‘다소 둔화됨’**으로, ‘인상 여부’는 **‘조정의 정도와 시기’**로 **방향이 부드러워짐**",
     "foot": foot_ex(["성명 문구는 모양을 보이기 위한 예시 문구이며 실제 성명이 아님"]),
     "old": {"title": "지난 회의 성명", "paras": old_m}, "new": {"title": "이번 회의 성명", "paras": new_m},
     "stats": [{"label": "지운 낱말", "value": "4곳", "tone": "warn", "sub": "지난 성명에만 있음"}, {"label": "더한 낱말", "value": "4곳", "tone": "main", "sub": "이번 성명에만 있음"}, {"label": "그대로인 문장", "value": "0개", "tone": "gray", "sub": "세 문장 모두 손봄"}]}, False)

# ---- N152 인물 경력 연표
add("N152", "F14", "qtcareer", "인물 경력 연표", "인물 A의 자리와 큰 결정", {"기간": "1992~2026(예시)"},
    {"eyebrow": {"group": "인물 · 발언", "topic": "인물 A 경력과 큰 결정", "basis": "가상의 인물 · 자리, 1992~2026, 예시 값"},
     "head": "인물 A는 **학계 8년**을 거쳐 **정부 10년**, 이후 **중앙은행 14년**을 지내며 **세 번의 큰 결정**을 내려 **정책 성향의 뿌리**가 이어짐",
     "foot": foot_ex(["인물 · 자리 · 연도는 모두 가상의 예"]),
     "from": 1992, "to": 2027,
     "lanes": [{"name": "학계", "bars": [{"from": 1992, "to": 2000, "label": "교수", "sub": "거시 연구"}]},
               {"name": "정부", "bars": [{"from": 2000, "to": 2005, "label": "부처 국장", "sub": "물가 담당"}, {"from": 2005, "to": 2010, "label": "차관", "sub": "재정 · 금융"}]},
               {"name": "중앙은행", "bars": [{"from": 2010, "to": 2018, "label": "위원", "sub": "통화정책"}, {"from": 2018, "to": 2027, "label": "의장", "sub": "결정 주재"}]}],
     "decisions": [{"at": 2004.5, "year": "2004", "text": "물가 목표제 건의"}, {"at": 2014, "year": "2014", "text": "첫 반대표"}, {"at": 2019, "year": "2019", "text": "첫 인하 주도"}, {"at": 2023, "year": "2023", "text": "긴축 전환"}]}, False)

# ---- N153 표결 표
vm = [("가", "의장", "yyyyyy"), ("나", "위원", "yyyyyy"), ("다", "위원", "yyynyy"), ("라", "위원", "yyyyyy"), ("마", "위원", "ynnnny"), ("바", "위원", "yyyaay"), ("사", "위원", "yyyyyy"), ("아", "위원", "nnnyyy")]
dis = sum(1 for _, _, v in vm for c in v if c != "y")
dma = sum(1 for _, _, v in vm[4:5] + vm[7:8] for c in v if c != "y")
add("N153", "F14", "qtvote", "표결 표", "회의별 위원 표결", {"위원": len(vm), "회의": 6, "반대 · 기권": dis},
    {"eyebrow": {"group": "인물 · 발언", "topic": "위원별 표결 칸", "basis": "익명 위원 8명 · 가상의 회의 6회, 예시 값"},
     "head": f"6회 회의에서 위원 8명이 낸 **{len(vm)*6}표 가운데 {dis}표가 반대 · 기권**이고 그중 **{dma}표가 위원 마 · 아**에 몰려 **소수 의견**이 두 사람에 모임",
     "foot": foot_ex(["위원 이름은 가 · 나 · 다 같은 익명이며 회의 순서도 가상의 예"]),
     "nameTitle": "위원", "sumTitle": "반대 · 기권", "resultTitle": "회의 결과(찬 : 반 : 기)",
     "cols": [{"d": f"{i+1}차", "t": "가상 회의"} for i in range(6)],
     "rows": [{"name": f"{a} " + ("의장" if b == "의장" else ""), "sub": "" if b == "의장" else "위원", "votes": list(v)} for a, b, v in vm]}, False)
# 이름 정리: 의장 가 / 위원 나
for r in out[-1]["slide"]["rows"]:
    pass
for r, (a, b, v) in zip(out[-1]["slide"]["rows"], vm):
    r["name"] = ("의장 " if b == "의장" else "위원 ") + a
    r["sub"] = ""

# ---- N154 말풍선 타임라인
bb = [("08:30", "의장 가", "물가는 내려오고 있으나 아직 목표보다 높음", "회의 전 연설 · 예시 문구", "dark"),
      ("14:00", "의장 가", "오늘은 금리를 그대로 두기로 했음", "결정 발표 · 예시 문구", "main"),
      ("14:30", "위원 마", "인하를 서두를 이유는 없다고 봄", "반대 의견 · 예시 문구", "warn"),
      ("14:45", "위원 바", "고용이 식고 있어 대비가 필요함", "찬성 의견 · 예시 문구", "main"),
      ("다음 날", "의장 가", "다음 회의 결정은 데이터에 달려 있음", "인터뷰 · 예시 문구", "dark")]
add("N154", "F14", "qtbubble", "말풍선 타임라인", "하루 동안 이어진 발언", {"발언": len(bb)},
    {"eyebrow": {"group": "인물 · 발언", "topic": "발언을 시간 순서로", "basis": "가상의 하루 · 예시 문구, 예시 값"},
     "head": "하루 사이 **의장 발언 세 번**과 **위원 두 명의 상반된 의견**이 이어져, **결정 직후에 나온 반대 의견**이 시장에 **인하 기대를 되살릴 수 있음**",
     "foot": foot_ex(["발언 문구 · 시각은 모양을 보이기 위한 예시이며 실제 발언이 아님"]),
     "items": [{"t": a, "who": b, "text": c, "sub": d, "tone": e} for a, b, c, d, e in bb]}, False)

# =============== F16 구성 분해 ===============
walcl, wres, wtga, wrrp = load("WALCL")["data"], load("WRESBAL")["data"], load("WTREGEN")["data"], load("RRPONTSYD")["data"]


def at_or_before(data, d):
    r = None
    for x in data:
        if x[0] <= d:
            r = x
        else:
            break
    return r


def fed(date):
    t = at_or_before(walcl, date)[1] / 1e6
    r = at_or_before(wres, date)[1] / 1e6
    g = at_or_before(wtga, date)[1] / 1e6
    p = at_or_before(wrrp, date)[1] / 1e3
    return {"tot": t, "res": r, "tga": g, "rrp": p, "etc": t - r - g - p, "d": at_or_before(walcl, date)[0]}


now = fed("2026-12-31")
yago = fed("2025-11-12")
dd = lambda k: now[k] - yago[k]

# ---- N161 트리맵 — 연준 자금 구성
add("N161", "F16", "treemap", "트리맵 — 연준 자금 구성", "연준 총자산을 대는 자금 구성", {"총자산(조 달러)": round(now["tot"], 2), "지준": round(now["res"], 2), "TGA": round(now["tga"], 2), "역레포": round(now["rrp"], 4)},
    {"eyebrow": {"group": "구성 분해", "topic": "연준 총자산을 대는 돈의 구성", "basis": "조 달러, 주간, 1년 전 대비"},
     "head": f"연준 총자산 **{now['tot']:.2f}조 달러** 가운데 **은행 지급준비금이 {now['res']:.2f}조 달러**로 **{now['res']/now['tot']*100:.0f}%**를 차지하고 **재무부 계정은 {now['tga']:.2f}조 달러**임",
     "foot": {"notes": ["그 밖 = 총자산 − 지급준비금 − 재무부 계정 − 역레포(현금통화 등)", "역레포 잔고는 조 달러 단위로 너무 작아 칸 대신 오른쪽에 표시"], "source": "FRED(WALCL · WRESBAL · WTREGEN · RRPONTSYD)", "asof": now["d"].replace("-", ".")},
     "unit": "조 달러", "dec": 2, "hero": "은행 지급준비금",
     "items": [{"name": "은행 지급준비금", "value": round(now["res"], 3)}, {"name": "현금통화 등 그 밖", "value": round(now["etc"], 3), "other": True}, {"name": "재무부 일반계정(TGA)", "value": round(now["tga"], 3)}],
     "side": {"title": "1년 전 대비 증감", "dec": 2, "rows": [{"label": "지급준비금", "value": round(dd("res"), 3), "unit": "조 달러"}, {"label": "재무부 계정", "value": round(dd("tga"), 3), "unit": "조 달러"},
                                                         {"label": "역레포", "value": round(dd("rrp"), 3), "unit": "조 달러"}, {"label": "그 밖", "value": round(dd("etc"), 3), "unit": "조 달러"}],
              "total": {"label": "연준 총자산", "value": round(now["tot"], 2), "unit": "조 달러", "dec": 2, "sub": f"1년 전 {yago['tot']:.2f}조 달러"}}}, True)

# ---- N162 선버스트 (예시)
sun = [{"name": "화석연료", "value": 58, "color": "dark", "items": [{"name": "석유", "value": 27}, {"name": "천연가스", "value": 19}, {"name": "석탄", "value": 12}]},
       {"name": "원자력", "value": 20, "color": "main", "items": [{"name": "원전", "value": 20}]},
       {"name": "재생에너지", "value": 17, "color": "g65", "items": [{"name": "태양광", "value": 7}, {"name": "풍력", "value": 6}, {"name": "수력", "value": 4}]},
       {"name": "그 밖", "value": 5, "color": "g40", "items": [{"name": "바이오", "value": 3}, {"name": "수소 · 기타", "value": 2}]}]
add("N162", "F16", "qtsun", "선버스트(2단 도넛)", "에너지원 → 세부 연료 구성", {"합계": 100, "화석": 58},
    {"eyebrow": {"group": "구성 분해", "topic": "A국 1차 에너지 공급 구성", "basis": "에너지원 → 세부 연료, 합계 100%, 예시 값"},
     "head": "A국 에너지는 **화석연료가 58%**이고 그 안에서 **석유가 27%**로 가장 크며, **재생에너지는 17%**로 **원전(20%)보다 작음**",
     "foot": foot_ex(["A국은 가상의 나라이며 구성비는 합이 100%가 되도록 만든 값"]),
     "unit": "%", "dec": 0, "centerTitle": "에너지 공급", "innerTitle": "안쪽 고리 = 에너지원", "outerTitle": "바깥 고리 = 세부 연료", "groups": sun}, False)

# ---- N163 전후 도넛 쌍 (예시)
pb = [("창업주 가", 34), ("국내 기관", 18), ("해외 기관", 22), ("소액주주", 24), ("자사주", 2)]
pa = [("창업주 가", 28), ("국내 기관", 17), ("해외 기관", 31), ("소액주주", 22), ("자사주", 2)]
add("N163", "F16", "qtdonut2", "전후 도넛 쌍", "신주 발행 전 · 후 지분 구조", {"창업주 변화(%p)": -6, "해외 기관 변화(%p)": 9},
    {"eyebrow": {"group": "구성 분해", "topic": "A사 신주 발행 전 · 후 지분 구조", "basis": "지분율(%), 가상의 회사, 예시 값"},
     "head": "A사가 신주를 발행하자 **창업주 지분은 34%에서 28%로 6%p 줄고** **해외 기관은 22%에서 31%로 9%p 늘어** 지분 **무게가 바깥으로 옮겨감**",
     "foot": foot_ex(["A사는 가상의 회사이며 지분율은 합이 100%가 되도록 만든 값"]),
     "unit": "%", "dec": 0, "midTitle": "지분율이 바뀐 곳(%p)", "colors": {"창업주 가": "dark", "국내 기관": "main", "해외 기관": "g65", "소액주주": "g40", "자사주": "gray"},
     "before": {"title": "신주 발행 전", "sub": "발행주식 1,000만 주 기준", "center": "100%", "items": [{"name": a, "value": b} for a, b in pb]},
     "after": {"title": "신주 발행 후", "sub": "신주 150만 주 추가 기준", "center": "100%", "items": [{"name": a, "value": b} for a, b in pa]}}, False)

# ---- N164 100% 누적 연도별 — 연준 자금 구성 몫 변화
yrs = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"]
cols = []
for y in yrs:
    d = fed(f"{y}-12-31")
    cols.append({"label": y, "parts": {"지급준비금": d["res"], "재무부 계정": d["tga"], "역레포": d["rrp"], "그 밖": d["etc"]}, "tot": d["tot"]})
cols.append({"label": now["d"][:7].replace("-", "."), "parts": {"지급준비금": now["res"], "재무부 계정": now["tga"], "역레포": now["rrp"], "그 밖": now["etc"]}, "hi": True, "tot": now["tot"]})


def sh(c, k):
    return c["parts"][k] / sum(c["parts"].values()) * 100


rr = [(c["label"], sh(c, "역레포")) for c in cols]
rp = max(rr, key=lambda x: x[1])
add("N164", "F16", "qtstack100", "100% 누적 연도별", "연준 자금 구성 몫 변화", {"역레포 최대 몫(%)": round(rp[1], 1), "시점": rp[0], "지준 몫 현재(%)": round(sh(cols[-1], "지급준비금"), 1)},
    {"eyebrow": {"group": "구성 분해", "topic": "연준 총자산을 대는 돈의 몫 변화", "basis": "구성비(%), 각 연말, 마지막은 최근 주"},
     "head": f"역레포 몫은 **{rp[0]}년 {rp[1]:.0f}%**까지 커졌다가 **{sh(cols[-1],'역레포'):.1f}%**로 사라졌고, 그 자리를 **지급준비금({sh(cols[-1],'지급준비금'):.0f}%)**이 채워 **연준 자금의 중심**이 은행 예치금으로 옮겨옴",
     "foot": {"notes": ["그 밖 = 총자산 − 지급준비금 − 재무부 계정 − 역레포", "각 연도는 그 해 마지막 주 자료, 마지막 열은 최근 주"], "source": "FRED(WALCL · WRESBAL · WTREGEN · RRPONTSYD)", "asof": now["d"].replace("-", ".")},
     "names": ["지급준비금", "재무부 계정", "역레포", "그 밖"], "colors": {"지급준비금": "dark", "재무부 계정": "main", "역레포": "warn", "그 밖": "gray"}, "legendTitle": "마지막 열 몫 · 첫 열 대비",
     "cols": [{"label": c["label"], "parts": c["parts"], "hi": c.get("hi")} for c in cols]}, True)

# ---- N165 한 칸 펼침 막대 (예시)
ex = [("에너지", 22), ("반도체 장비", 18), ("소재", 15), ("기계", 12), ("식품", 9), ("의약", 8), ("그 밖", 16)]
add("N165", "F16", "qtexpand", "한 칸 펼침 막대", "수입 구성 중 에너지 한 칸 펼침", {"에너지 몫(%)": 22},
    {"eyebrow": {"group": "구성 분해", "topic": "A국 수입 구성에서 에너지 펼치기", "basis": "수입액 대비 구성비(%), 가상의 나라, 예시 값"},
     "head": "A국 수입의 **22%가 에너지**이고 펼쳐 보면 **원유가 12%p**로 절반을 넘고 **천연가스 7%p · 석탄 3%p**가 뒤를 이어 **원유 가격**에 민감함",
     "foot": foot_ex(["A국은 가상의 나라이며 구성비는 합이 100%가 되도록 만든 값"]),
     "unit": "%", "dec": 0, "focus": 0, "focusTitle": "에너지 수입 안쪽 구성",
     "items": [{"name": a, "value": b, **({"parts": [{"name": "원유", "value": 12, "sub": "에너지 수입 안의 55%"}, {"name": "천연가스(LNG)", "value": 7, "sub": "에너지 수입 안의 32%"}, {"name": "석탄", "value": 3, "sub": "에너지 수입 안의 14%"}]} if i == 0 else {})} for i, (a, b) in enumerate(ex)]}, False)

# ---- N166 원 쌓기 (예시)
pk = [("국내 주식", 120, "주식"), ("해외 주식", 96, "주식"), ("국채", 74, "채권"), ("회사채", 38, "채권"), ("부동산", 52, "실물"), ("인프라", 30, "실물"), ("원자재", 16, "실물"), ("현금", 28, "그 밖"), ("사모대출", 24, "그 밖"), ("대체 투자", 12, "그 밖")]
tp = sum(x[1] for x in pk)
sp = sum(x[1] for x in pk if x[2] == "주식")
add("N166", "F16", "qtpack", "원 쌓기(서클 패킹)", "펀드 B 자산 규모를 원 크기로", {"합계(조 원)": tp, "주식(조 원)": sp},
    {"eyebrow": {"group": "구성 분해", "topic": "가상 펀드 B 보유 자산 규모", "basis": "조 원, 원 넓이 = 규모, 예시 값"},
     "head": f"펀드 B의 자산 **{tp}조 원** 중 **국내 · 해외 주식이 {sp}조 원({sp/tp*100:.0f}%)**으로 가장 큰 덩어리고, 현금과 **대체 투자**는 **작은 원**에 그침",
     "foot": foot_ex(["펀드 B는 가상의 펀드이며 자산 규모는 모양을 보이기 위한 값"]),
     "unit": "조", "dec": 0, "sizeNote": "원 넓이 = 자산 규모(조 원)", "groups": [{"name": "주식"}, {"name": "채권"}, {"name": "실물"}, {"name": "그 밖"}],
     "items": [{"name": a, "value": b, "group": c} for a, b, c in pk]}, False)

# ---- N167 구성 + 증감 표 — 연방 재정
def fy(sid, d):
    for x in load(sid)["data"]:
        if x[0] == d:
            return x[1] / 1e6
    raise KeyError(d)


rev, rev0 = fy("FYFR", "2026-09-30"), fy("FYFR", "2025-09-30")
out_, out0 = fy("FYONET", "2026-09-30"), fy("FYONET", "2025-09-30")
dfc, dfc0 = out_ - rev, out0 - rev0
qi = {x[0]: x[1] for x in load("A091RC1Q027SBEA")["data"]}
q1 = [qi[k] for k in ["2025-10-01", "2026-01-01", "2026-04-01", "2026-07-01"]]
q0 = [qi[k] for k in ["2024-10-01", "2025-01-01", "2025-04-01", "2025-07-01"]]
intr, intr0 = sum(q1) / 4 / 1e3, sum(q0) / 4 / 1e3
oth, oth0 = out_ - intr, out0 - intr0
rows1 = [{"name": "연방 수입(세금 등)", "sub": "지출을 대는 정상 재원", "valueText": f"{rev:.2f}조 달러", "share": rev / out_ * 100, "delta": rev - rev0, "deltaText": f"{abs(rev-rev0):.2f}조 달러"},
         {"name": "재정적자(차입)", "sub": "지출 − 수입", "valueText": f"{dfc:.2f}조 달러", "share": dfc / out_ * 100, "delta": dfc - dfc0, "deltaText": f"{abs(dfc-dfc0):.2f}조 달러", "tone": "warn", "dtone": "warn"}]
rows2 = [{"name": "이자 지출", "sub": "국채 이자(분기 연율 평균 어림)", "valueText": f"{intr:.2f}조 달러", "share": intr / out_ * 100, "delta": intr - intr0, "deltaText": f"{abs(intr-intr0):.2f}조 달러", "tone": "warn", "dtone": "warn"},
         {"name": "이자 빼고 지출", "sub": "복지 · 국방 등 나머지", "valueText": f"{oth:.2f}조 달러", "share": oth / out_ * 100, "delta": oth - oth0, "deltaText": f"{abs(oth-oth0):.2f}조 달러"}]
add("N167", "F16", "qtcomp", "구성 + 증감 표", "연방 지출의 재원 · 용도 구성과 증감", {"지출(조 달러)": round(out_, 2), "수입": round(rev, 2), "적자": round(dfc, 2), "이자": round(intr, 2)},
    {"eyebrow": {"group": "구성 분해", "topic": "미국 연방 지출 2026 회계연도 구성", "basis": "조 달러, 회계연도 2026(~9월), 전년 대비"},
     "head": f"연방 지출 **{out_:.2f}조 달러** 중 **{dfc/out_*100:.0f}%({dfc:.2f}조 달러)**는 빌려서 댔고 **이자 지출은 {intr:.2f}조 달러**로 지출의 **{intr/out_*100:.0f}%**임",
     "foot": {"notes": ["이자 지출은 분기 연율(10억 달러)의 최근 4분기 평균이라 회계연도 합계와 정의가 달라 어림 값", "재원 두 줄과 용도 두 줄은 각각 합이 지출 합계와 같음"], "source": "FRED(FYONET · FYFR · A091RC1Q027SBEA)", "asof": "2026.09.30"},
     "cols": {"name": "항목", "value": "금액", "share": "지출 대비 비중", "delta": "1년 전 대비 증감"},
     "groups": [{"title": "재원 — 지출을 대는 돈", "total": f"지출 합계 {out_:.2f}조 달러", "rows": rows1}, {"title": "용도 — 돈이 가는 곳", "total": f"지출 합계 {out_:.2f}조 달러", "rows": rows2}]}, True)

# ---- N168 반원 게이지 (실제 값 + 예시 목표선)
gdp = load("GFDEGDQ188S")["data"][-1]
v1, v2, v3 = intr / rev * 100, dfc / out_ * 100, gdp[1]
add("N168", "F16", "qtgauge", "반원 게이지", "재정 부담 세 지표 목표 대비", {"수입 대비 이자(%)": round(v1, 1), "지출 대비 적자(%)": round(v2, 1), "부채/GDP(%)": round(v3, 1)},
    {"eyebrow": {"group": "구성 분해", "topic": "미국 연방 재정 부담 세 지표", "basis": "비중(%), 목표선은 예시 값"},
     "head": f"수입 대비 이자 **{v1:.1f}%**, 지출 대비 적자 **{v2:.1f}%**, GDP 대비 부채 **{v3:.0f}%**로 세 지표 모두 **예시 목표선을 넘어** 부담이 큼",
     "foot": {"notes": ["목표선(20% · 20% · 100%)은 모양을 보이기 위한 예시 값이며 공식 기준이 아님", "이자 지출은 분기 연율 최근 4분기 평균 어림 값"], "source": "FRED(FYFR · FYONET · A091RC1Q027SBEA · GFDEGDQ188S)", "asof": gdp[0].replace("-", ".")},
     "gauges": [{"title": "수입 대비 이자 지출", "sub": "이자 지출 ÷ 연방 수입", "value": round(v1, 1), "max": 40, "target": 20, "targetText": "예시 목표 20%", "unit": "%", "bad": "above", "gapLabel": "목표와 차이", "note1": f"이자 {intr:.2f}조 달러", "note2": f"수입 {rev:.2f}조 달러", "note3": "회계연도 2026"},
                {"title": "지출 대비 재정적자", "sub": "재정적자 ÷ 연방 지출", "value": round(v2, 1), "max": 50, "target": 20, "targetText": "예시 목표 20%", "unit": "%", "bad": "above", "gapLabel": "목표와 차이", "note1": f"적자 {dfc:.2f}조 달러", "note2": f"지출 {out_:.2f}조 달러", "note3": "회계연도 2026"},
                {"title": "GDP 대비 연방 부채", "sub": "연방 총부채 ÷ 명목 GDP", "value": round(v3, 1), "max": 160, "target": 100, "targetText": "예시 목표 100%", "unit": "%", "bad": "above", "dec": 0, "gapLabel": "목표와 차이", "note1": "분기 자료", "note2": gdp[0].replace("-", ".") + " 기준", "note3": ""}]}, True)

# ---- 쓰기
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
json.dump(out, open(ROOT / "library" / "mockups" / "v4" / "F14.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
deck = {"schema": 3, "meta": {"session": "R2", "title": "F14 2차 목업"}, "slides": [dict(m["slide"]) for m in out]}
json.dump(deck, open(ROOT / "style" / "demo4_r2_F14.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
real_n = sum(1 for m in out if "예시 값" not in m["tags"])
print("목업", len(out), "실제", real_n, "예시", len(out) - real_n)
