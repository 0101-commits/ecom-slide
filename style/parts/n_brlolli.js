/* brlolli — 롤리팝 긴 순위 : 가는 줄 + 끝 점으로 12~24개를 두 열로 촘촘히 (순위표처럼 1열 → 2열)
   rows[{label,value}] 값 큰 순으로 정렬해 줌 · unit · dec · hero(위 몇 개 진하게, 기본 3) · cols(1|2, 기본 2) · rank(true 면 순위 번호) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brlolli = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 24), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, u = s.unit || '', hero = s.hero != null ? s.hero : 3, nc = n > 12 && s.cols !== 1 ? 2 : 1;
  R.sort(function (a, b) { return b.value - a.value }); var per = Math.ceil(n / nc), vs = R.map(function (r) { return +r.value }), mn = Math.min(0, Math.min.apply(null, vs)), mx = Math.max(0, Math.max.apply(null, vs));
  var colW = (1168 - (nc - 1) * 48) / nc, lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 15, 1)) });
  var lab = 26 + Math.ceil(lw) + (mn < 0 ? 64 : 0), vw = 78, aw = colW - lab - vw, sc = aw / (mx - mn), top = 4, pitch = (512 - top - 6) / per, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var c = 0; c < nc; c++) { var cx0 = c * (colW + 48), X0 = cx0 + lab + (-mn) * sc; E('line', { x1: X0, x2: X0, y1: top, y2: 508, stroke: C.axis, 'stroke-width': 1.2 }, g0) }
  R.forEach(function (r, i) { var c = Math.floor(i / per), j = i % per, cx0 = c * (colW + 48), X0 = cx0 + lab + (-mn) * sc, cy = top + pitch * j + pitch / 2, v = +r.value, t0 = 80 + i * 70, ok = v >= 0, X = X0 + v * sc, on = i < hero, col = !ok ? C.cmp : on ? C.dark : C.g65, g = h.at(svg, t0, { 'data-fx': 'fade' });
    if (j % 2 === 0) E('rect', { x: cx0, y: cy - pitch / 2, width: colW, height: pitch, fill: C.paper }, g0);
    T(g, cx0 + 26 + Math.ceil(lw) - 10, cy + 5, (s.rank ? (i + 1) + ' ' : '') + r.label, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': on ? 700 : 400, fill: C.ink });
    E('line', { x1: X0, x2: X, y1: cy, y2: cy, stroke: col, 'stroke-width': 3, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-o': ok ? '0% 50%' : '100% 50%', 'data-ms': 360 }, svg);
    E('circle', { cx: X, cy: cy, r: on ? 7.5 : 6, fill: col, 'data-at': t0 + 380, 'data-fx': 'pop' }, svg);
    T(h.at(svg, t0 + 420, { 'data-fx': 'fade' }), ok ? X + 12 : X - 12, cy + 5, (ok ? '' : '−') + h.nf(Math.abs(v), dec) + u, { 'text-anchor': ok ? 'start' : 'end', 'font-size': 14, 'font-weight': on ? 700 : 400, fill: ok ? C.ink : C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
