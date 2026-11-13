/* brrange — 범위 막대 + 지금 점 : 줄마다 최저~최고 띠 안에 지금 값을 점으로 + 양끝 값 + 오른쪽 최고 대비 %
   rows[{label,lo,hi,now,unit,dec}] 3~9개(줄마다 눈금이 다름 — 띠 길이는 같고 점 위치로 비교) · loName · hiName · posName(오른쪽 열 이름) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brrange = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 9), n = R.length; if (!n) return; var svg = ctx.svg(512);
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 18, 1)) }); var x0 = Math.ceil(lw) + 130, x1 = 880, W = x1 - x0, top = 40, pitch = (512 - top - 6) / n, bh = Math.min(22, pitch * .4);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); T(g0, x0 - 12, 20, s.loName || '52주 최저', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g0, x1 + 12, 20, s.hiName || '52주 최고', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  T(g0, 1168, 20, s.posName || '최고 대비', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  R.forEach(function (r, i) { var dec = r.dec != null ? r.dec : 1, u = r.unit || '', cy = top + pitch * i + pitch / 2, p = (r.now - r.lo) / (r.hi - r.lo), t0 = 100 + i * 130, g = h.at(svg, t0, { 'data-fx': 'fade' }), off = (r.now / r.hi - 1) * 100;
    if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2, width: 1168, height: pitch, fill: C.paper }, g0);
    T(g, 0, cy + 6, r.label, { 'font-size': 18, 'font-weight': 700, fill: C.ink });
    T(g, x0 - 12, cy + 5.5, h.nf(r.lo, dec), { 'text-anchor': 'end', 'font-size': 15, fill: C.mute }); T(g, x1 + 12, cy + 5.5, h.nf(r.hi, dec), { 'font-size': 15, fill: C.mute });
    E('rect', { x: x0, y: cy - bh / 2, width: W, height: bh, rx: bh / 2, fill: C.g18, 'data-at': t0, 'data-fx': 'growx', 'data-ms': 360 }, svg);
    E('rect', { x: x0, y: cy - bh / 2, width: Math.max(bh / 2, W * p), height: bh, rx: bh / 2, fill: C.g40, 'data-at': t0 + 200, 'data-fx': 'growx', 'data-ms': 420 }, svg);
    var g2 = h.at(svg, t0 + 600, { 'data-fx': 'pop' }); E('circle', { cx: x0 + W * p, cy: cy, r: 11, fill: C.dark, stroke: '#fff', 'stroke-width': 3 }, g2);
    var lx = x0 + W * p, g3 = h.at(svg, t0 + 650, { 'data-fx': 'fade' }); T(g3, Math.min(Math.max(lx, x0 + 30), x1 - 30), cy - bh / 2 - 8, h.nf(r.now, dec) + u, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: C.dark });
    T(g3, 1168, cy + 7, (off >= -0.05 ? '고점' : '−' + h.nf(Math.abs(off), 1) + '%'), { 'text-anchor': 'end', 'font-size': 18, 'font-weight': 700, fill: off >= -0.05 ? C.dark : C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
