/* brprog — 진행률 막대 : 줄마다 긴 트랙 + 채움 + 오른쪽 큰 % + 위 작은 글(분자 / 분모)
   rows[{label,done,total,tone('warn')}] 3~7개 · unit · dec · pdec(% 소수, 기본 0) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brprog = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 7), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, u = s.unit || '', pd = s.pdec || 0;
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 19, 1)) }); var x0 = Math.ceil(lw) + 30, x1 = 960, W = x1 - x0, top = 18, pitch = (512 - top - 30) / n, bh = Math.min(30, pitch * .42);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); [0, 25, 50, 75, 100].forEach(function (p) { var x = x0 + W * p / 100; E('line', { x1: x, x2: x, y1: top, y2: 512 - 26, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, x, 508, p + '%', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2 + 6, p = 100 * r.done / r.total, t0 = 150 + i * 150, bad = r.tone === 'warn', col = bad ? C.warn : (p >= 99.95 ? C.dark : C.main), g = h.at(svg, t0, { 'data-fx': 'fade' });
    T(g, x0 - 18, cy + 7, r.label, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink });
    E('rect', { x: x0, y: cy - bh / 2, width: W, height: bh, rx: bh / 2, fill: C.g08, stroke: C.line }, svg);
    E('rect', { x: x0, y: cy - bh / 2, width: Math.max(bh, W * Math.min(p, 100) / 100), height: bh, rx: bh / 2, fill: col, 'data-at': t0 + 100, 'data-fx': 'growx', 'data-ms': 600 }, svg);
    var g2 = h.at(svg, t0 + 650, { 'data-fx': 'fade' });
    T(g2, x0, cy - bh / 2 - 8, h.nf(r.done, dec) + ' / ' + h.nf(r.total, dec) + ' ' + u, { 'font-size': 13.5, fill: C.mute });
    T(g2, 1168, cy + 10, h.nf(p, pd) + '%', { 'text-anchor': 'end', 'font-size': 30, 'font-weight': 700, fill: bad ? C.warn : C.ink }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
