// 엔진 3판 조작 시험 — node tools/nav3.js <발표.html> : 다음 · 바뀜 · 쌓기 중 누름 · 부록 고리 · 되돌아가기 · 숫자 이동 · 모아 보기 · 장 넘김 종류
const pw = require(process.env.PLAYWRIGHT || 'C:/Users/cgpar/economic-site/node_modules/playwright');
const { pathToFileURL } = require('url'); const path = require('path');
(async () => {
  const file = process.argv[2]; const b = await pw.chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 760 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(pathToFileURL(path.resolve(file)).href); await p.waitForTimeout(500);
  const st = () => p.evaluate(() => ECOMDeck.state()); const log = [];
  const n = (await st()).n;
  for (let i = 1; i < n; i++) { log.push('pick ' + i + '→' + (i + 1) + ' ' + await p.evaluate(([a, c]) => ECOMDeck.pick(a, c), [i, i + 1])) }
  // 다음을 차례로 : 쌓기 중 누르면 끝 상태, 바뀜 단계, 다음 장
  let guard = 0; while (guard++ < 80) { const s = await st(); if (s.i === n && s.beat >= s.beats && !s.building) break; await p.keyboard.press('ArrowRight'); await p.waitForTimeout(260); const t = await st(); log.push(`→ ${t.i}/${t.n} ${t.kind} b${t.beat}/${t.beats} ${t.building ? '쌓는 중' : ''}`) }
  await p.keyboard.press('3'); await p.keyboard.press('Enter'); await p.waitForTimeout(900); log.push('숫자 3 → ' + (await st()).i);
  const link = await p.$('.sl.on .lk a[data-to]'); if (link) { await link.click(); await p.waitForTimeout(900); log.push('부록 고리 → ' + (await st()).i + ' ' + (await st()).kind); const bk = await p.$('.sl.on .lk a[data-back]'); if (bk) { await bk.click(); await p.waitForTimeout(900); log.push('본문으로 → ' + (await st()).i) } }
  await p.keyboard.press('o'); await p.waitForTimeout(500); log.push('모아 보기 칸 ' + await p.$$eval('#ov .it', a => a.length)); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.keyboard.press('Home'); await p.waitForTimeout(400); log.push('Home → ' + (await st()).i);
  console.log(JSON.stringify({ errs, log }, null, 0)); await b.close();
})();
