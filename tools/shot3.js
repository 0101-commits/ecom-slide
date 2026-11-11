// 엔진 3판 화면 점검 — node tools/shot3.js <발표.html> <캡처 폴더> [장 번호들 쉼표|all] [--mid]
// ?check 결과(겹침 · 밖으로 · 각주 줄 · 헤드메시지 · 채움) + 장마다 끝 상태 캡처(+ --mid 면 쌓기 중간 캡처)
// playwright 위치: 환경 변수 PLAYWRIGHT 또는 economic-site 의 node_modules
const pw = require(process.env.PLAYWRIGHT || 'C:/Users/cgpar/economic-site/node_modules/playwright');
const { pathToFileURL } = require('url'); const fs = require('fs'); const path = require('path');
(async () => {
  const [file, dir, which = 'all'] = process.argv.slice(2); const mid = process.argv.includes('--mid');
  fs.mkdirSync(dir, { recursive: true }); const url = pathToFileURL(path.resolve(file)).href;
  const b = await pw.chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url + '?check'); await p.waitForTimeout(600);
  const chk = JSON.parse(await p.$eval('#ecom-check', e => e.textContent));
  const n = chk.slides.length, list = which === 'all' ? [...Array(n).keys()].map(i => i + 1) : which.split(',').map(Number);
  await p.goto(url); await p.waitForTimeout(500);
  for (const i of list) {
    await p.evaluate(k => ECOMDeck.go(k, 'none'), i);
    if (mid) { await p.waitForTimeout(700); await p.screenshot({ path: path.join(dir, `m${String(i).padStart(2, '0')}.png`) }) }
    await p.waitForTimeout(4200); await p.screenshot({ path: path.join(dir, `s${String(i).padStart(2, '0')}.png`) });
  }
  const bad = chk.slides.filter(s => s.textOverlap.length || s.outside.length || s.outsideBody.length || s.fnLines > 2 || (s.headLen && (s.headLen < 40 || s.headLen > 95)) || s.headLines > 2);
  console.log(JSON.stringify({ errs, slides: chk.slides.map(s => ({ i: s.i, k: s.kind, ov: s.textOverlap, out: s.outside.concat(s.outsideBody), fn: s.fnLines, head: s.headLen, hl: s.headLines, occ: s.occupied, minF: s.minFont, beats: s.beats })), bad: bad.map(s => s.i) }, null, 0));
  await b.close();
})();
