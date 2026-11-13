/* brico — 아이콘 세기 : 줄마다 같은 그림(아이콘 1개 = per 단위)을 개수만큼 늘어놓음 + 끝에 개수
   rows[{label,n,sub}] 3~6개 · icon('tower' 기본 | 'ship' | 'dot' | 'box') · per(아이콘 하나가 뜻하는 수, 기본 1) · unit('기') · hero(가장 큰 줄 진하게 — 기본 첫 줄) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function icon(g, k, x, y, s, fill) { /* x,y = 왼쪽 위, s = 크기 */
  if (k === 'ship') E('path', { d: 'M' + x + ' ' + (y + s * .62) + ' h' + s + ' l-' + s * .16 + ' ' + s * .3 + ' h-' + s * .68 + ' z M' + (x + s * .3) + ' ' + (y + s * .58) + ' v-' + s * .3 + ' h' + s * .3 + ' v' + s * .3 + ' z M' + (x + s * .42) + ' ' + (y + s * .28) + ' v-' + s * .22 + ' h' + s * .06 + ' v' + s * .22 + ' z', fill: fill }, g);
  else if (k === 'dot') E('circle', { cx: x + s / 2, cy: y + s / 2, r: s * .42, fill: fill }, g);
  else if (k === 'box') E('rect', { x: x + s * .1, y: y + s * .1, width: s * .8, height: s * .8, rx: 3, fill: fill }, g);
  else E('path', { d: 'M' + (x + s * .22) + ' ' + y + ' h' + s * .56 + ' q' + s * .1 + ' ' + s * .42 + ' ' + s * .2 + ' ' + s * .74 + ' q' + (-s * .06) + ' ' + s * .12 + ' ' + (-s * .2) + ' ' + s * .14 + ' h' + (-s * .76) + ' q' + (-s * .14) + ' ' + (-s * .02) + ' ' + (-s * .2) + ' ' + (-s * .14) + ' q' + s * .1 + ' ' + (-s * .32) + ' ' + s * .2 + ' ' + (-s * .74) + ' z', fill: fill }, g) }
ECOM.parts.brico = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 6), n = R.length; if (!n) return; var svg = ctx.svg(512), per = s.per || 1, u = s.unit || '', ik = s.icon || 'tower', hero = s.hero != null ? s.hero : 0;
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 19, 1)) }); var x0 = Math.ceil(lw) + 30, avail = 1168 - x0 - 150, mx = Math.max.apply(null, R.map(function (r) { return r.n / per }));
  var top = 14, pitch = (512 - top - 30) / n, sz = Math.min(pitch * .78, avail / mx * .92, 58), step = Math.min(avail / mx, sz * 1.18);
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, t0 = 100 + i * 220, on = i === hero, g = h.at(svg, t0, { 'data-fx': 'fade' }), cnt = r.n / per, full = Math.floor(cnt + 1e-9);
    T(g, x0 - 16, cy + 7, r.label, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, x0 - 16, cy + 26, r.sub, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
    for (var j = 0; j < full; j++) { var gi = h.at(svg, t0 + 80 + j * 40, { 'data-fx': 'pop', 'data-ms': 260 }); icon(gi, ik, x0 + j * step, cy - sz / 2, sz, on ? C.dark : C.g65) }
    if (cnt - full > .05) { var gi2 = h.at(svg, t0 + 80 + full * 40, { 'data-fx': 'pop', 'data-ms': 260 }); icon(gi2, ik, x0 + full * step, cy - sz / 2, sz * Math.sqrt(cnt - full), on ? C.dark : C.g65) }
    T(h.at(svg, t0 + 100 + cnt * 40 + 200, { 'data-fx': 'fade' }), x0 + Math.ceil(cnt) * step + 12, cy + 9, h.nf(r.n, 0) + u, { 'font-size': 26, 'font-weight': 700, fill: on ? C.dark : C.ink }) });
  T(h.at(svg, 150 + n * 220 + 600, { 'data-fx': 'fade' }), 0, 506, '아이콘 1개 = ' + h.nf(per, 0) + u, { 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};
})();
