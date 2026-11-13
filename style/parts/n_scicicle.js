/* scicicle — 확률 쌓기 나무(아이시클) : 맨 위 100% 한 줄 → 갈래 폭 = 가능성 → 갈래 안 갈래 폭 = 곱한 가능성 → 결과 숫자 → 결과 분포 축 + 확률 가중 평균
   root{title,sub} · level1[{name,p(%),children:[{name,p(갈래 안 %),v(결과 숫자)}]}] · unit · dec · resTitle(결과 이름, 예 '연말 10년물') · expText('확률 가중 평균')
   강조 = 곱한 가능성이 가장 큰 끝 갈래. 평균은 부품이 계산 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scicicle = function (bd, s, ctx) {
  var svg = ctx.svg(512), L1 = (s.level1 || []).slice(0, 4), rt = s.root || {}, u = s.unit || '', dec = s.dec != null ? s.dec : 1, X0 = 124, W = 1168 - X0, GAP = 3;
  if (!L1.length) return;
  var tot1 = L1.reduce(function (a, b) { return a + (+b.p || 0) }, 0) || 100, leaves = [], x = X0;
  var rows = [['사건', 4, 60], ['1단 갈래', 82, 92], ['2단 갈래', 186, 92], [s.resTitle || '결과', 290, 58]];
  rows.forEach(function (r, i) { var g = h.at(svg, 0, { 'data-fx': 'fade' }); T(g, 0, r[1] + r[2] / 2 + 5, r[0], { 'font-size': 14, 'font-weight': 700, fill: C.mute }) });
  var gr = h.at(svg, 100, { 'data-fx': 'fade', 'data-ms': 360 });
  E('rect', { x: X0, y: 4, width: W, height: 58, rx: 8, fill: C.dark }, gr);
  T(gr, X0 + 18, 29, rt.title || '', { 'font-size': 18, 'font-weight': 700, fill: '#fff' });
  if (rt.sub) T(gr, X0 + 18, 50, rt.sub, { 'font-size': 13, fill: C.g18 });
  T(gr, X0 + W - 18, 40, '100%', { 'text-anchor': 'end', 'font-size': 24, 'font-weight': 700, fill: '#fff' });
  var best = null, bp = -1;
  L1.forEach(function (b, i) { var w1 = W * (+b.p || 0) / tot1, cs = (b.children || []).slice(0, 3), t2 = cs.reduce(function (a, c) { return a + (+c.p || 0) }, 0) || 100, cx = x;
    cs.forEach(function (c, j) { var pj = (+b.p || 0) * (+c.p || 0) / 100, lf = { bi: i, n: c, pj: pj, x: cx, w: w1 * (+c.p || 0) / t2, v: +c.v }; leaves.push(lf); if (pj > bp) { bp = pj; best = lf } cx += lf.w });
    b._x = x; b._w = w1; x += w1 });
  L1.forEach(function (b, i) { var on = best && best.bi === i, g = h.at(svg, 450 + i * 160, { 'data-fx': 'fade', 'data-ms': 360 });
    E('rect', { x: b._x + 1.5, y: 82, width: b._w - GAP, height: 92, rx: 8, fill: on ? C.main : C.g65 }, g);
    var fs = S.fit(b.name || '', 17, b._w - 30, 1, 12.5); T(g, b._x + 16, 114, b.name || '', { 'font-size': fs, 'font-weight': 700, fill: '#fff' });
    T(g, b._x + 16, 156, h.nf(b.p, 0) + '%', { 'font-size': 26, 'font-weight': 700, fill: '#fff' }) });
  var vmin = Infinity, vmax = -Infinity, sp = 0, se = 0;
  leaves.forEach(function (l, i) { var on = l === best, g = h.at(svg, 1100 + i * 110, { 'data-fx': 'fade', 'data-ms': 320 }), w = l.w - GAP;
    E('rect', { x: l.x + 1.5, y: 186, width: w, height: 92, rx: 8, fill: on ? C.dark : C.g18 }, g);
    var fs = S.fit(l.n.name || '', 15, w - 12, 1, 11.5); T(g, l.x + 1.5 + w / 2, 218, l.n.name || '', { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: on ? '#fff' : C.ink });
    T(g, l.x + 1.5 + w / 2, 260, h.nf(l.pj, 0) + '%', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: on ? '#fff' : C.dark });
    var g2 = h.at(svg, 1700 + i * 100, { 'data-fx': 'fade', 'data-ms': 320 });
    E('rect', { x: l.x + 1.5, y: 290, width: w, height: 58, rx: 8, fill: '#fff', stroke: on ? C.dark : C.line, 'stroke-width': on ? 2.5 : 1.2 }, g2);
    var vt = h.nf(l.v, dec) + u, fs2 = S.fit(vt, 22, w - 8, 1, 13); T(g2, l.x + 1.5 + w / 2, 326, vt, { 'text-anchor': 'middle', 'font-size': fs2, 'font-weight': 700, fill: C.ink });
    vmin = Math.min(vmin, l.v); vmax = Math.max(vmax, l.v); sp += l.pj; se += l.pj * l.v });
  var ev = se / (sp || 1), pad = (vmax - vmin) * .12, nt = h.niceTicks(vmin - pad, vmax + pad, 6), XA = h.lin(nt.lo, nt.hi, X0 + 20, 1168 - 24), ay = 466, dy = 396;
  var ga = h.at(svg, 2500, { 'data-fx': 'fade', 'data-ms': 420 });
  T(ga, 0, ay + 5, '결과 분포', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  T(ga, 0, ay + 24, '원 크기 = 가능성', { 'font-size': 12.5, fill: C.mute });
  E('line', { x1: X0, x2: 1168, y1: ay, y2: ay, stroke: C.axis, 'stroke-width': 1.5 }, ga);
  nt.ticks.forEach(function (v) { E('line', { x1: XA(v), x2: XA(v), y1: ay, y2: ay + 6, stroke: C.axis }, ga); T(ga, XA(v), ay + 24, h.nf(v, nt.step < 1 ? 1 : 0) + u, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  leaves.slice().sort(function (a, b) { return b.pj - a.pj }).forEach(function (l) { var r = 8 + Math.sqrt(l.pj) * 4.4, on = l === best;
    E('circle', { cx: XA(l.v), cy: ay - r - 1, r: r, fill: on ? C.dark : C.g65, 'fill-opacity': on ? .95 : .62, stroke: '#fff', 'stroke-width': 1.5 }, ga) });
  var ge = h.at(svg, 3000, { 'data-fx': 'fade', 'data-ms': 420 }), ex = XA(ev), ew = h.textW((s.expText || '확률 가중 평균') + ' ' + h.nf(ev, dec) + u, 15, 1) + 20;
  E('line', { x1: ex, x2: ex, y1: 398, y2: ay + 4, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, ge);
  var lx = Math.min(Math.max(ex - ew / 2, X0), 1168 - ew);
  E('rect', { x: lx, y: 370, width: ew, height: 28, rx: 14, fill: C.ink }, ge);
  T(ge, lx + ew / 2, 389, (s.expText || '확률 가중 평균') + ' ' + h.nf(ev, dec) + u, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff' });
  ctx.root.setAttribute('data-gap', 300);
};
})();
