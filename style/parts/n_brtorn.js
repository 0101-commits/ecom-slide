/* brtorn — 토네이도(좌우) : 가운데 이름 칸을 두고 왼쪽 막대(A) · 오른쪽 막대(B) 가 서로 반대로 뻗음
   rows[{label,left,right}] 4~10개 · leftName · rightName(위 꼬리표) · unit · dec · sort('sum'|없음 — 합 큰 순) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brtorn = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 10), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, u = s.unit || '';
  if (s.sort === 'sum') R.sort(function (a, b) { return (b.left + b.right) - (a.left + a.right) });
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 17, 1)) }); var cw = Math.max(110, Math.ceil(lw) + 28), mx = Math.max.apply(null, R.map(function (r) { return Math.max(r.left, r.right) }));
  var half = (1168 - cw) / 2 - 90, sc = half / mx, cxL = 584 - cw / 2, cxR = 584 + cw / 2, top = 44, bot = 506, pitch = (bot - top) / n, bh = Math.min(34, pitch * .7), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  T(g0, cxL, 24, '← ' + (s.leftName || '수출'), { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: C.dark }); T(g0, cxR, 24, (s.rightName || '수입') + ' →', { 'font-size': 16, 'font-weight': 700, fill: C.cmp });
  T(g0, 584, 24, u, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, t0 = 100 + i * 140, wl = Math.max(2, r.left * sc), wr = Math.max(2, r.right * sc), g = h.at(svg, t0, { 'data-fx': 'fade' });
    T(g, 584, cy + 6, r.label, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    E('rect', { x: cxL - wl, y: cy - bh / 2, width: wl, height: bh, rx: 3, fill: C.dark, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-o': '100% 50%', 'data-ms': 440 }, svg);
    E('rect', { x: cxR, y: cy - bh / 2, width: wr, height: bh, rx: 3, fill: C.cmp, opacity: .85, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-ms': 440 }, svg);
    var g2 = h.at(svg, t0 + 480, { 'data-fx': 'fade' }); T(g2, cxL - wl - 8, cy + 6, h.nf(r.left, dec), { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: C.dark }); T(g2, cxR + wr + 8, cy + 6, h.nf(r.right, dec), { 'font-size': 15, 'font-weight': 700, fill: C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
