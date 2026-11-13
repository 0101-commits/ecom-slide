/* xp 계열 1(예상 vs 실제 · 발표 4판) — xprow · xpdots · xpwatch · xptable · xpqa. 형식 = style/SCHEMA4_F04.md
   xprow  : 가로 줄마다 발표 막대 + 기준 눈금 + 이전 점 + 기준 대비 차이 + 판정 칩
   xpdots : 발표 − 기준 차이를 회차마다 점으로(0선 위 · 아래) + 상회 · 하회 횟수 칸
   xpwatch: 관전 포인트 카드 3장(볼 숫자 · 기준값 게이지 · 읽는 방향)
   xptable: 여러 지표 결과 표 + 차이 발산 막대 + 판정 칩
   xpqa   : 문답 카드(질문 → 짧은 답 → 근거 숫자 하나) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var X = ECOM.xp = ECOM.xp || {};
X.sg = function (v, d, u) { var z = Math.abs(v).toFixed(d) === (0).toFixed(d); return (z ? '' : v >= 0 ? '+' : '−') + h.nf(Math.abs(v), d) + (u || '') };
X.chip = function (p, cx, cy, txt, bg, fg, size) { size = size || 13; var w = h.textW(txt, size, 1) + 22; E('rect', { x: cx - w / 2, y: cy - 14, width: w, height: 28, rx: 14, fill: bg }, p);
  T(p, cx, cy + size * .36, txt, { 'text-anchor': 'middle', 'font-size': size, 'font-weight': 700, fill: fg }) };
X.verdict = function (a, b, tol) { var d = a - b; return Math.abs(d) <= (tol || 0) ? '부합' : d > 0 ? '상회' : '하회' };
X.vcol = function (v) { return v === '상회' ? C.dark : v === '부합' ? C.mute : C.g65 };
X.lines = function (g, x, y, s, size, w, o) { o = o || {}; var L = h.wrap(String(s == null ? '' : s).replace(/\*\*/g, ''), size, w, o.bold ? 1 : 0), lh = o.lh || Math.round(size * 1.38);
  L.forEach(function (l, i) { T(g, x, y + i * lh, l, { 'text-anchor': o.anchor || 'start', 'font-size': size, 'font-weight': o.bold ? 700 : 500, fill: o.fill || C.ink }) }); return L.length };

/* ── xprow : rows[{label,sub,actual,base,prev,dec,unit,tol}] 3~5개 · baseName('직전 3개월 평균') · prevName('이전달') · dunit */
ECOM.parts.xprow = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 5), n = R.length; if (!n) return; var svg = ctx.svg(512), bn = s.baseName || '기준', pn = s.prevName || '이전', top = 40, pitch = (508 - top) / n;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }), tx0 = 280, tx1 = 760;
  T(g0, 0, 22, '지표', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  var lx = tx0; E('rect', { x: lx, y: 9, width: 16, height: 13, rx: 2, fill: C.main }, g0); T(g0, lx + 22, 21, '발표치', { 'font-size': 13, 'font-weight': 600, fill: C.cmp }); lx += 22 + h.textW('발표치', 13, 1) + 20;
  E('line', { x1: lx + 5, x2: lx + 5, y1: 6, y2: 25, stroke: C.ink, 'stroke-width': 3 }, g0); T(g0, lx + 16, 21, bn, { 'font-size': 13, 'font-weight': 600, fill: C.cmp }); lx += 16 + h.textW(bn, 13, 1) + 20;
  E('circle', { cx: lx + 5, cy: 15, r: 5, fill: '#fff', stroke: C.mute, 'stroke-width': 2.5 }, g0); T(g0, lx + 17, 21, pn, { 'font-size': 13, 'font-weight': 600, fill: C.cmp });
  T(g0, 930, 22, '발표치', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g0, 1012, 22, '기준 대비', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g0, 1168, 22, '판정', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, dec = r.dec != null ? r.dec : 1, u = r.unit || '', a = +r.actual, b = +r.base, p = +r.prev, t0 = 150 + i * 240, vd = r.verdict || X.verdict(a, b, r.tol);
    var lo = Math.min(0, a, b, p), hi = Math.max(a, b, p) * 1.12, Xs = function (v) { return tx0 + (v - lo) / (hi - lo) * (tx1 - tx0) }, g = h.at(svg, t0, { 'data-fx': 'fade' });
    E('rect', { x: 0, y: cy - pitch / 2 + 3, width: 1168, height: pitch - 6, rx: 8, fill: i % 2 ? '#fff' : C.paper }, g0);
    T(g, 14, cy - 3, r.label, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 14, cy + 19, r.sub, { 'font-size': 13, fill: C.mute });
    E('line', { x1: Xs(0), x2: Xs(0), y1: cy - 26, y2: cy + 26, stroke: C.axis, 'stroke-width': 1.2 }, g);
    E('rect', { x: Xs(0), y: cy - 12, width: Math.max(2, Xs(a) - Xs(0)), height: 24, rx: 3, fill: vd === '하회' ? C.g65 : C.main, 'data-at': t0 + 80, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    var g2 = h.at(svg, t0 + 500, { 'data-fx': 'fade' });
    E('line', { x1: Xs(b), x2: Xs(b), y1: cy - 24, y2: cy + 24, stroke: C.ink, 'stroke-width': 3 }, g2); T(g2, Xs(b), cy - 29, h.nf(b, dec) + u, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
    if (isFinite(p)) { E('circle', { cx: Xs(p), cy: cy + 25, r: 5.5, fill: '#fff', stroke: C.mute, 'stroke-width': 2.5 }, g2); T(g2, Xs(p) - 11, cy + 30, h.nf(p, dec) + u, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: C.mute }) }
    var g3 = h.at(svg, t0 + 650, { 'data-fx': 'fade' }), d = a - b;
    T(g3, 930, cy + 9, h.nf(a, dec) + u, { 'text-anchor': 'end', 'font-size': 27, 'font-weight': 700, fill: C.dark });
    T(g3, 1012, cy + 8, X.sg(d, dec, r.dunit || s.dunit || u), { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    X.chip(h.at(svg, t0 + 800, { 'data-fx': 'pop' }), 1118, cy, vd, X.vcol(vd), '#fff', 14) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpdots : points[{label,value}] 6~14개(옛 → 새) · unit · dec · baseName · stats(false 면 아래 칸 뺌) · tiles[{label,value,sub}] 로 덮어쓰기 */
ECOM.parts.xpdots = function (bd, s, ctx) {
  var P = (s.points || []).slice(0, 14), n = P.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, u = s.unit || '', vs = P.map(function (p) { return +p.value });
  var mx = Math.max.apply(null, vs.map(Math.abs)) * 1.18, nt = h.niceTicks(-mx, mx, 5), cT = 14, cB = 336, Y = h.lin(nt.lo, nt.hi, cB, cT), x0 = 100, x1 = 1150, pw = (x1 - x0) / n, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = nt.lo; v <= nt.hi + nt.step / 1000; v += nt.step) { E('line', { x1: x0 - 10, x2: x1, y1: Y(v), y2: Y(v), stroke: Math.abs(v) < 1e-9 ? C.ink : C.grid, 'stroke-width': Math.abs(v) < 1e-9 ? 1.6 : 1, 'stroke-dasharray': Math.abs(v) < 1e-9 ? null : '3 4' }, g0);
    T(g0, x0 - 18, Y(v) + 4.5, (Math.abs(v) < 1e-9 ? '0' : v > 0 ? '+' + h.nf(v, dec) : '−' + h.nf(-v, dec)), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  T(g0, x1, cB + 50, '세로축 = ' + (s.axisName || '발표 − 기준') + ' (' + u + ')', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: C.mute });
  var up = 0, dn = 0, sum = 0; vs.forEach(function (v) { sum += v; if (v > 0) up++; else if (v < 0) dn++ });
  P.forEach(function (p, i) { var cx = x0 + pw * i + pw / 2, v = +p.value, y = Y(v), pos = v >= 0, t0 = 100 + i * 110, g = h.at(svg, t0, { 'data-fx': 'fade' });
    T(g0, cx, cB + 26, p.label, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
    E('line', { x1: cx, x2: cx, y1: Y(0), y2: y, stroke: pos ? C.g65 : C.axis, 'stroke-width': 3, 'data-at': t0, 'data-fx': 'draw', 'data-ms': 260 }, svg);
    E('circle', { cx: cx, cy: y, r: 11, fill: pos ? C.dark : '#fff', stroke: pos ? C.dark : C.cmp, 'stroke-width': 3, 'data-at': t0 + 220, 'data-fx': 'pop' }, svg);
    T(g, cx, pos ? y - 19 : y + 29, X.sg(v, dec), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: pos ? C.dark : C.cmp }) });
  var mean = sum / n, gm = h.at(svg, 100 + n * 110, { 'data-fx': 'fade' });
  E('line', { x1: x0, x2: x1, y1: Y(mean), y2: Y(mean), stroke: C.main, 'stroke-width': 2.2, 'stroke-dasharray': '8 5' }, gm); E('rect', { x: x0 + 8, y: cT - 4, width: 190, height: 26, rx: 13, fill: C.g08 }, gm); T(gm, x0 + 103, cT + 14, '점선 = 평균 ' + X.sg(mean, dec, u), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.main });
  if (s.stats !== false) { var tl = s.tiles || [{ label: '기준을 웃돈 횟수', value: up + '회', sub: n + '회 중' }, { label: '기준을 밑돈 횟수', value: dn + '회', sub: n + '회 중' }, { label: '평균 차이', value: X.sg(mean, dec, u), sub: (s.baseName || '기준') + ' 대비' }],
      gt = h.at(svg, 160 + n * 110, { 'data-fx': 'fade' }), tw = (1168 - 2 * 20) / 3, ty = 402, th = 104;
    tl.slice(0, 3).forEach(function (t, i) { var tx = i * (tw + 20); E('rect', { x: tx, y: ty, width: tw, height: th, rx: 12, fill: i === 2 ? C.dark : C.paper }, gt);
      T(gt, tx + 22, ty + 32, t.label, { 'font-size': 14, 'font-weight': 600, fill: i === 2 ? C.on : C.cmp }); T(gt, tx + 22, ty + 82, t.value, { 'font-size': 38, 'font-weight': 700, fill: i === 2 ? '#fff' : C.dark });
      if (t.sub) T(gt, tx + tw - 22, ty + 82, t.sub, { 'text-anchor': 'end', 'font-size': 13.5, fill: i === 2 ? C.on : C.mute }) }) }
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpwatch : cards[{name,date,watch{label,value,unit,dec},ref{label,value},min,max,up{cond,read},down{cond,read}}] 3장 */
ECOM.parts.xpwatch = function (bd, s, ctx) {
  var K = (s.cards || []).slice(0, 3), n = K.length; if (!n) return; var svg = ctx.svg(512), gap = 24, cw = (1168 - (n - 1) * gap) / n, ch = 508;
  K.forEach(function (k, i) { var x = i * (cw + gap), t0 = i * 260, g = h.at(svg, t0, { 'data-fx': 'fade' }), w = k.watch || {}, dec = w.dec != null ? w.dec : 1, u = w.unit || '', v = +w.value, rf = +(k.ref && k.ref.value), lo = +k.min, hi = +k.max;
    E('rect', { x: x, y: 2, width: cw, height: ch, rx: 14, fill: '#fff', stroke: C.line, 'stroke-width': 1.2 }, g); E('rect', { x: x, y: 2, width: cw, height: 56, rx: 14, fill: C.dark }, g); E('rect', { x: x, y: 40, width: cw, height: 18, fill: C.dark }, g);
    E('circle', { cx: x + 30, cy: 30, r: 14, fill: '#fff' }, g); T(g, x + 30, 36, String(i + 1), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.dark });
    T(g, x + 54, 37, k.name, { 'font-size': 18, 'font-weight': 700, fill: '#fff' }); if (k.date) T(g, x + cw - 20, 36, k.date, { 'text-anchor': 'end', 'font-size': 13, fill: C.on });
    T(g, x + 24, 96, w.label || '볼 숫자', { 'font-size': 14, 'font-weight': 600, fill: C.mute });
    var g2 = h.at(svg, t0 + 250, { 'data-fx': 'fade' }); T(g2, x + 24, 150, h.nf(v, dec) + u, { 'font-size': 54, 'font-weight': 700, fill: C.dark });
    var tx0 = x + 28, tx1 = x + cw - 28, Xs = h.lin(lo, hi, tx0, tx1), ty = 204;
    E('rect', { x: tx0, y: ty - 6, width: tx1 - tx0, height: 12, rx: 6, fill: C.light }, g2);
    E('rect', { x: Math.min(Xs(rf), Xs(v)), y: ty - 6, width: Math.max(3, Math.abs(Xs(v) - Xs(rf))), height: 12, fill: v >= rf ? C.g65 : C.g40 }, g2);
    E('line', { x1: Xs(rf), x2: Xs(rf), y1: ty - 22, y2: ty + 20, stroke: C.ink, 'stroke-width': 3 }, g2); E('circle', { cx: Xs(v), cy: ty, r: 10, fill: C.dark, stroke: '#fff', 'stroke-width': 2.5 }, g2);
    T(g2, tx0, ty + 36, h.nf(lo, dec) + u, { 'font-size': 12.5, fill: C.mute }); T(g2, tx1, ty + 36, h.nf(hi, dec) + u, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
    var rl = (k.ref.label || '기준') + ' ' + h.nf(rf, dec) + u; var rw = h.textW(rl, 13, 1), rcx = Math.max(tx0 + rw / 2, Math.min(tx1 - rw / 2, Xs(rf))); T(g2, rcx, ty - 28, rl, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.ink });
    var g3 = h.at(svg, t0 + 600, { 'data-fx': 'fade' }); E('line', { x1: x + 24, x2: x + cw - 24, y1: 276, y2: 276, stroke: C.line }, g3); T(g3, x + 24, 302, '읽는 방향', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
    [[k.up, 0], [k.down, 1]].forEach(function (q) { var d = q[0] || {}, yy = 326 + q[1] * 90, upd = q[1] === 0;
      E('rect', { x: x + 24, y: yy - 4, width: cw - 48, height: 78, rx: 10, fill: upd ? C.g08 : C.paper }, g3);
      var tri = upd ? 'M' + (x + 44) + ' ' + (yy + 22) + ' L' + (x + 58) + ' ' + (yy + 22) + ' L' + (x + 51) + ' ' + (yy + 9) + ' Z' : 'M' + (x + 44) + ' ' + (yy + 9) + ' L' + (x + 58) + ' ' + (yy + 9) + ' L' + (x + 51) + ' ' + (yy + 22) + ' Z';
      E('path', { d: tri, fill: upd ? C.dark : C.cmp }, g3); T(g3, x + 68, yy + 22, d.cond || '', { 'font-size': 14.5, 'font-weight': 700, fill: C.ink }); X.lines(g3, x + 44, yy + 46, d.read || '', 14, cw - 90, { fill: C.cmp }) }) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xptable : rows[{label,sub,actual,base,prev,dec,unit,tol,dunit}] 4~8개 · baseName · cols(머리글 [지표,발표,기준,기준 대비 %,판정]) */
ECOM.parts.xptable = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 8), n = R.length; if (!n) return; var svg = ctx.svg(512), bn = s.baseName || '기준', top = 46, pitch = (508 - top) / n, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  var hd = s.cols || ['지표', '발표', bn, '기준 대비 차이', '판정'], cx = [14, 470, 620, 840, 1118];
  E('rect', { x: 0, y: 2, width: 1168, height: 36, rx: 8, fill: C.dark }, g0);
  hd.forEach(function (t, i) { T(g0, i === 0 ? cx[i] : cx[i], 26, t, { 'text-anchor': i === 0 ? 'start' : i === 1 || i === 2 ? 'end' : 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) });
  var bz = 840, bw = 150, cnt = { 상회: 0, 부합: 0, 하회: 0 };
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, dec = r.dec != null ? r.dec : 1, u = r.unit || '', a = +r.actual, b = +r.base, vd = r.verdict || X.verdict(a, b, r.tol), t0 = 150 + i * 150, g = h.at(svg, t0, { 'data-fx': 'fade' }), rel = b ? (a - b) / Math.abs(b) * 100 : 0, cl = Math.max(-25, Math.min(25, rel)), L = bw / 25;
    cnt[vd]++; if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2 + 2, width: 1168, height: pitch - 4, rx: 6, fill: C.paper }, g0);
    T(g, 14, cy - 2, r.label, { 'font-size': 17, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 14, cy + 17, r.sub, { 'font-size': 12.5, fill: C.mute });
    T(g, 470, cy + 7, h.nf(a, dec) + u, { 'text-anchor': 'end', 'font-size': 21, 'font-weight': 700, fill: C.dark }); T(g, 620, cy + 6, h.nf(b, dec) + u, { 'text-anchor': 'end', 'font-size': 17, fill: C.cmp });
    E('line', { x1: bz, x2: bz, y1: cy - 14, y2: cy + 14, stroke: C.axis, 'stroke-width': 1.4 }, g);
    E('rect', { x: cl >= 0 ? bz : bz + cl * L, y: cy - 8, width: Math.max(2, Math.abs(cl) * L), height: 16, rx: 3, fill: cl >= 0 ? C.main : C.g65, 'data-at': t0 + 150, 'data-fx': 'growx', 'data-o': cl >= 0 ? '0% 50%' : '100% 50%', 'data-ms': 380 }, svg);
    T(h.at(svg, t0 + 400, { 'data-fx': 'fade' }), cl >= 0 ? bz + cl * L + 10 : bz + cl * L - 10, cy + 5, X.sg(rel, 1, '%'), { 'text-anchor': cl >= 0 ? 'start' : 'end', 'font-size': 14, 'font-weight': 700, fill: C.ink });
    X.chip(h.at(svg, t0 + 500, { 'data-fx': 'pop' }), 1118, cy, vd, X.vcol(vd), '#fff', 14) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpqa : items[{q,a,num{value,unit,dec,label}}] 3~4개 */
ECOM.parts.xpqa = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 4), n = I.length; if (!n) return; var svg = ctx.svg(512), gap = 14, ph = (506 - (n - 1) * gap) / n;
  I.forEach(function (it, i) { var y = 3 + i * (ph + gap), t0 = i * 330, g = h.at(svg, t0, { 'data-fx': 'fade' }), cy = y + ph / 2, nm = it.num || {};
    E('rect', { x: 0, y: y, width: 420, height: ph, rx: 14, fill: C.paper }, g); E('circle', { cx: 38, cy: cy, r: 20, fill: C.dark }, g); T(g, 38, cy + 7, 'Q', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: '#fff' });
    var nq = X.lines(g, 72, cy - 6, it.q, 17, 330, { bold: true }); if (nq > 1) { /* 두 줄 이상이면 위로 보정은 생략 */ }
    var g2 = h.at(svg, t0 + 300, { 'data-fx': 'fade' }); E('path', { d: 'M436 ' + cy + ' L474 ' + cy + ' M464 ' + (cy - 9) + ' L476 ' + cy + ' L464 ' + (cy + 9), fill: 'none', stroke: C.g65, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g2);
    E('rect', { x: 490, y: y, width: 440, height: ph, rx: 14, fill: '#fff', stroke: C.dark, 'stroke-width': 2 }, g2); E('circle', { cx: 526, cy: cy, r: 20, fill: C.g18 }, g2); T(g2, 526, cy + 7, 'A', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: C.dark });
    X.lines(g2, 560, cy - 8, it.a, 17, 350, { bold: true, fill: C.dark });
    var g3 = h.at(svg, t0 + 620, { 'data-fx': 'fade' }); E('path', { d: 'M944 ' + cy + ' L974 ' + cy, fill: 'none', stroke: C.axis, 'stroke-width': 2.4, 'stroke-dasharray': '4 4' }, g3);
    E('rect', { x: 984, y: y, width: 184, height: ph, rx: 14, fill: C.dark }, g3); T(g3, 1076, cy - 6, h.nf(+nm.value, nm.dec != null ? nm.dec : 1) + (nm.unit || ''), { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 700, fill: '#fff' });
    T(g3, 1076, cy + 24, nm.label || '', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, fill: C.on }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
