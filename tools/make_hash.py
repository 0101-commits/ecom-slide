# 고객명 목록(비공개) → 해시 목록(공개 저장소에 둠). 목록 원문은 저장소에 올리지 않는다.
# 실행: python -X utf8 tools/make_hash.py <client_names.txt> rules/client_hash.json
import hashlib, json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from ref_build import norm  # noqa: E402

src, dst = sys.argv[1], sys.argv[2]
names = [l.strip() for l in open(src, encoding="utf-8") if l.strip() and not l.startswith("#")]
hs = sorted({hashlib.sha256(norm(n).encode()).hexdigest()[:16] for n in names if len(norm(n)) >= 2})
json.dump({"note": "고객명 해시(sha256 앞 16자, 정규화: NFKC · 공백 · 기호 뺌 · 소문자). 원문 목록은 공개하지 않음", "h": hs},
          open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("해시", len(hs))
