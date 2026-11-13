/* brdumb — 아령 막대 : 줄마다 앞(빈 점) · 뒤(찬 점) 두 점을 잇는 가는 막대 + 오른쪽 변화 칸
   rows[{label,a,b}] 3~10개 · aName · bName(범례) · unit · dec · sort('b'|'diff'|없음) · dunit(변화 단위, 기본 unit) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brdumb = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 10), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 2, u = s.unit || '';
  if (s.sort === 'b') R.sort(function (p, q) { return q.b - p.b }); if (s.sort === 'diff') R.sort(function (p, q) { return (q.b - q.a) - (p.b - p.a) });
  var vals = []; R.forEach(function (r) { vals.push(+r.a, +r.b) }); var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), pad = (hi - lo) * .06, nt = h.niceTicks(lo - pad, hi + pad, 6);
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 17, 1)) });
  var x0 = Math.ceil(lw) + 30, x1 = 960, X = h.lin(nt.lo, nt.hi, x0, x1), top = 44, bot = 480, pitch = (bot - top) / n;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  [[C.dark, s.bName || '지금', 0], [C.axis, s.aName || '1년 전', 90]].forEach(function (L, i) { var lx = x0 + (i ? 120 : 0);
    E('circle', { cx: lx + 6, cy: 14, r: 6.5, fill: i ? '#fff' : L[0], stroke: L[0], 'stroke-width': 2.5 }, g0); T(g0, lx + 18, 19, L[1], { 'font-size': 13.5, 'font-weight': 700, fill: C.ink }) });
  T(g0, 1168, 19, '변화(' + (s.dunit || u) + ')', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  for (var v = nt.lo; v <= nt.hi + nt.step / 1000; v += nt.step) { E('line', { x1: X(v), x2: X(v), y1: top - 6, y2: bot, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, X(v), bot + 22, h.nf(v, nt.step < 1 ? 1 : 0), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, a = +r.a, b = +r.b, xa = X(a), xb = X(b), t0 = 200 + i * 130, up = b >= a, g = h.at(svg, t0, { 'data-fx': 'fade' });
    if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2 + 2, width: 1168, height: pitch - 4, rx: 6, fill: C.paper }, g0);
    T(g, x0 - 20, cy + 6, r.label, { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    E('rect', { x: Math.min(xa, xb), y: cy - 4, width: Math.max(2, Math.abs(xb - xa)), height: 8, rx: 4, fill: up ? C.g65 : C.g40, 'data-at': t0 + 150, 'data-fx': 'growx', 'data-o': up ? '0% 50%' : '100% 50%', 'data-ms': 400 }, svg);
    E('circle', { cx: xa, cy: cy, r: 9, fill: '#fff', stroke: C.axis, 'stroke-width': 3, 'data-at': t0 + 100, 'data-fx': 'pop' }, svg);
    E('circle', { cx: xb, cy: cy, r: 10, fill: C.dark, 'data-at': t0 + 500, 'data-fx': 'pop' }, svg);
    var g2 = h.at(svg, t0 + 650, { 'data-fx': 'fade' }), dd = b - a;
    T(g2, Math.min(xa, xb) - 16, cy + 6, h.nf(up ? a : b, dec), { 'text-anchor': 'end', 'font-size': 14, fill: C.mute });
    T(g2, Math.max(xa, xb) + 16, cy + 6, h.nf(up ? b : a, dec), { 'text-anchor': 'start', 'font-size': 14, 'font-weight': 700, fill: C.ink });
    T(g2, 1168, cy + 7, (dd >= 0 ? '+' : '−') + h.nf(Math.abs(dd), dec), { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: dd >= 0 ? C.dark : C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
