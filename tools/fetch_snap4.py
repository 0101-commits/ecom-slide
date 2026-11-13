# 목업 4판용 공개 통계 받기 — FRED 열쇠 없는 CSV(fredgraph.csv) → data/snap4/<id>.json {id, name, unit, freq, got, data:[[날짜, 값]]}
# 실행: python -X utf8 tools/fetch_snap4.py   (일 단위 계열은 2000년부터, 나머지는 처음부터)
import csv, io, json, subprocess, time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "snap4"
OUT.mkdir(parents=True, exist_ok=True)
GOT = datetime.now().strftime("%Y.%m.%d %H:%M")
S = [  # (FRED 번호, 이름, 단위, 주기)
    ("DCOILWTICO", "WTI 원유 가격", "달러/배럴", "일"), ("DCOILBRENTEU", "브렌트 원유 가격", "달러/배럴", "일"), ("DHHNGSP", "헨리허브 천연가스 가격", "달러/MMBtu", "일"),
    ("PNGASEUUSDM", "유럽 천연가스 가격(IMF)", "달러/MMBtu", "월"), ("PNGASJPUSDM", "일본 LNG 가격(IMF)", "달러/MMBtu", "월"), ("PCOPPUSDM", "구리 가격(IMF)", "달러/톤", "월"),
    ("PIORECRUSDM", "철광석 가격(IMF)", "달러/톤", "월"), ("PWHEAMTUSDM", "밀 가격(IMF)", "달러/톤", "월"),
    ("T10Y2Y", "미국 10년물 − 2년물", "%p", "일"), ("T10Y3M", "미국 10년물 − 3개월물", "%p", "일"), ("DFII10", "미국 10년 실질금리(TIPS)", "%", "일"),
    ("DGS3MO", "미국 국채 3개월", "%", "일"), ("DGS6MO", "미국 국채 6개월", "%", "일"), ("DGS1", "미국 국채 1년", "%", "일"), ("DGS3", "미국 국채 3년", "%", "일"),
    ("DGS5", "미국 국채 5년", "%", "일"), ("DGS7", "미국 국채 7년", "%", "일"), ("DGS20", "미국 국채 20년", "%", "일"), ("DGS30", "미국 국채 30년", "%", "일"),
    ("RRPONTSYD", "미 연준 역레포 잔고", "십억 달러", "일"), ("WTREGEN", "미 재무부 일반계정(TGA)", "백만 달러", "주"), ("WRESBAL", "미 은행 지급준비금", "백만 달러", "주"),
    ("WALCL", "미 연준 총자산", "백만 달러", "주"), ("VIXCLS", "VIX 변동성 지수", "지수", "일"), ("SP500", "S&P 500", "지수", "일"), ("NASDAQCOM", "나스닥 종합", "지수", "일"),
    ("DTWEXBGS", "달러 지수(광의)", "지수", "일"), ("DEXJPUS", "엔/달러", "엔", "일"), ("DEXCHUS", "위안/달러", "위안", "일"), ("DEXUSEU", "달러/유로", "달러", "일"),
    ("M2SL", "미국 M2 통화량", "십억 달러", "월"), ("CPIAUCSL", "미국 소비자물가 지수", "지수", "월"), ("CPILFESL", "미국 근원 소비자물가 지수", "지수", "월"),
    ("PCEPILFE", "미국 근원 PCE 물가 지수", "지수", "월"), ("PPIACO", "미국 생산자물가 지수", "지수", "월"), ("A191RL1Q225SBEA", "미국 실질 GDP 성장률(연율)", "%", "분기"),
    ("USREC", "미국 경기 침체 기간(NBER)", "0/1", "월"), ("DFEDTARU", "미 연준 정책금리 상단", "%", "일"), ("MORTGAGE30US", "미국 30년 주택담보대출 금리", "%", "주"),
    ("CSUSHPINSA", "미국 케이스-실러 주택가격 지수", "지수", "월"), ("UMCSENT", "미시간대 소비자심리", "지수", "월"), ("ICSA", "미국 신규 실업수당 청구", "건", "주"),
    ("JTSJOL", "미국 구인 건수", "천 건", "월"), ("GFDEGDQ188S", "미국 연방부채 / GDP", "%", "분기"), ("A091RC1Q027SBEA", "미국 연방정부 이자 지출(연율)", "십억 달러", "분기"),
    ("FYFSD", "미국 연방 재정수지", "백만 달러", "연"), ("FYONET", "미국 연방 지출", "백만 달러", "연"), ("FYFR", "미국 연방 수입", "백만 달러", "연"),
    ("BOPGSTB", "미국 무역수지(상품 · 서비스)", "백만 달러", "월"), ("GASREGW", "미국 휘발유 소매가", "달러/갤런", "주"), ("WCESTUS1", "미국 상업 원유 재고", "천 배럴", "주"),
    ("CPALTT01KRM659N", "한국 소비자물가(OECD, 전년비)", "%", "월"), ("IRLTLT01KRM156N", "한국 10년물 금리(OECD)", "%", "월"), ("IRLTLT01JPM156N", "일본 10년물 금리(OECD)", "%", "월"),
    ("IRLTLT01DEM156N", "독일 10년물 금리(OECD)", "%", "월"), ("CPALTT01JPM659N", "일본 소비자물가(OECD, 전년비)", "%", "월"), ("CP0000EZ19M086NEST", "유로 지역 소비자물가 지수", "지수", "월")]


def get(sid):
    """FRED 는 일부 User-Agent 를 끊음 → curl 기본값으로 받음"""
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}"
    for i in range(3):
        r = subprocess.run(["curl", "-s", "-f", "-m", "60", url], capture_output=True)
        if r.returncode == 0 and r.stdout:
            return r.stdout.decode("utf-8")
        time.sleep(3 * (i + 1))
    raise RuntimeError(f"curl 실패 {r.returncode}")


ok, bad = [], {}
for sid, name, unit, freq in S:
    try:
        rows = list(csv.reader(io.StringIO(get(sid))))[1:]
        data = [[d, float(v)] for d, v in rows if v not in ("", ".")]
        if freq == "일":
            data = [x for x in data if x[0] >= "2000-01-01"]
        (OUT / f"{sid}.json").write_text(json.dumps({"id": sid, "name": name, "unit": unit, "freq": freq, "src": "FRED(세인트루이스 연은)", "got": GOT, "data": data}, ensure_ascii=False), encoding="utf-8")
        ok.append(sid)
    except Exception as e:
        bad[sid] = str(e)[:120]
    time.sleep(0.6)
(OUT / "_index.json").write_text(json.dumps({"got": GOT, "ok": ok, "failed": bad}, ensure_ascii=False, indent=1), encoding="utf-8")
print(json.dumps({"ok": len(ok), "failed": bad}, ensure_ascii=False))
