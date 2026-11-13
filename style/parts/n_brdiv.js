/* brdiv — 발산 막대 : 0 을 가운데 세로선으로 두고 + 는 오른쪽 · − 는 왼쪽으로 뻗는 막대 줄
   rows[{label,value}] 4~14개(값 큰 순으로 정렬해 줌) · unit('%') · dec · posName · negName(위쪽 꼬리표) · sort(false 면 입력 순서) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brdiv = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 14), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, u = s.unit || '';
  if (s.sort !== false) R.sort(function (a, b) { return b.value - a.value });
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 16, 1)) });
  var vs = R.map(function (r) { return +r.value }), mn = Math.min(0, Math.min.apply(null, vs)), mx = Math.max(0, Math.max.apply(null, vs));
  var xl = Math.ceil(lw) + 24, lab = 110, avail = 1168 - xl - lab * 2, sc = avail / (mx - mn), X0 = xl + lab + (-mn) * sc, top = 40, bot = 506, pitch = (bot - top) / n, bh = Math.min(26, pitch * .64);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); T(g0, X0 + 8, 20, (s.posName || '상승') + ' →', { 'font-size': 13.5, 'font-weight': 700, fill: C.dark }); T(g0, X0 - 8, 20, '← ' + (s.negName || '하락'), { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.cmp });
  R.forEach(function (r, i) { var v = +r.value, cy = top + pitch * i + pitch / 2, t0 = 100 + i * 90, ok = v >= 0, w = Math.max(2, Math.abs(v) * sc), g = h.at(svg, t0, { 'data-fx': 'fade' });
    if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2, width: 1168, height: pitch, fill: C.paper }, g0);
    T(g, xl - 12, cy + 5.5, r.label, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: C.ink });
    E('rect', { x: ok ? X0 : X0 - w, y: cy - bh / 2, width: w, height: bh, rx: 3, fill: ok ? (i === 0 ? C.dark : C.main) : C.cmp, 'data-at': t0 + 80, 'data-fx': 'growx', 'data-o': ok ? '0% 50%' : '100% 50%', 'data-ms': 420 }, svg);
    T(h.at(svg, t0 + 450, { 'data-fx': 'fade' }), ok ? X0 + w + 8 : X0 - w - 8, cy + 6, (ok ? '+' : '−') + h.nf(Math.abs(v), dec) + u, { 'text-anchor': ok ? 'start' : 'end', 'font-size': 16, 'font-weight': 700, fill: ok ? C.dark : C.cmp }) });
  E('line', { x1: X0, x2: X0, y1: 28, y2: bot + 4, stroke: C.ink, 'stroke-width': 1.5 }, g0);
  ctx.root.setAttribute('data-gap', 300);
};
})();
