# 고객명 목록(비공개) → 열쇠 넣은 해시 목록(HMAC-SHA256 앞 20자). 목록 원문과 열쇠는 저장소에 올리지 않는다.
# 열쇠 = 환경 변수 ECOM_HASH_KEY (관리자 PC 와 GitHub 비밀값에만)
# 실행: python -X utf8 tools/make_hash.py <client_names.txt> rules/client_hash.json
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from ref_build import _h, hash_key, norm  # noqa: E402

if not hash_key():
    sys.exit("ECOM_HASH_KEY 환경 변수가 필요해요")
src, dst = sys.argv[1], sys.argv[2]
names = [l.strip() for l in open(src, encoding="utf-8") if l.strip() and not l.startswith("#")]
hs = sorted({_h(norm(n)) for n in names if len(norm(n)) >= 2})
json.dump({"note": "고객명 열쇠 해시(HMAC-SHA256 앞 20자, 정규화: NFKC · 공백 · 기호 뺌 · 소문자). 열쇠 · 원문 목록은 공개하지 않음", "h": hs},
          open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print("해시", len(hs))
