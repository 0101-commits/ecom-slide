/* brgroup — 그룹 막대 + 평균선 : 묶음마다 막대 2~4개(계열별 색) + 가로 점선 평균
   groups[{name,vals[]}] 2~7개 · names[계열 이름](범례) · unit · dec · avg{value,label}(없으면 마지막 계열 평균 계산) · y{min,max,step} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brgroup = function (bd, s, ctx) {
  var G = (s.groups || []).slice(0, 7), n = G.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, u = s.unit || '', k = G[0].vals.length, names = s.names || [];
  var all = []; G.forEach(function (g) { g.vals.forEach(function (v) { all.push(+v) }) });
  var lo = Math.min(0, Math.min.apply(null, all)), hi = Math.max.apply(null, all), yo = s.y || {}, nt = h.niceTicks(yo.min != null ? yo.min : lo, yo.max != null ? yo.max : hi * 1.1, 5);
  var top = 44, bot = 440, x0 = 56, x1 = 1168, Y = h.lin(nt.lo, nt.hi, bot, top), cw = (x1 - x0) / n, gw = Math.min(cw * .78, 70 * k + 14), bw = (gw - (k - 1) * 6) / k;
  var cols = k === 2 ? [C.g40, C.dark] : k === 3 ? [C.g40, C.g65, C.dark] : [C.g18, C.g40, C.g65, C.dark];
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = nt.lo; v <= nt.hi + nt.step / 1000; v += nt.step) { E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.mute : C.grid, 'stroke-dasharray': v === 0 ? null : '3 4' }, g0); T(g0, x0 - 8, Y(v) + 4.5, h.nf(v, nt.step < 1 ? 1 : 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  T(g0, x0 - 8, 18, u, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  names.slice(0, k).forEach(function (nm, j) { var lx = x0 + 20 + j * 120; E('rect', { x: lx, y: 7, width: 14, height: 14, rx: 2, fill: cols[j] }, g0); T(g0, lx + 21, 19, nm, { 'font-size': 13.5, 'font-weight': 700, fill: C.ink }) });
  var last = G.map(function (g) { return +g.vals[k - 1] }), avg = s.avg && s.avg.value != null ? +s.avg.value : last.reduce(function (a, b) { return a + b }, 0) / n;
  G.forEach(function (g, i) { var cx = x0 + cw * i + cw / 2, gx = cx - gw / 2, t0 = 150 + i * 180;
    g.vals.forEach(function (v, j) { v = +v; var x = gx + j * (bw + 6), y = v >= 0 ? Y(v) : Y(0), hh = Math.max(2, Math.abs(Y(v) - Y(0)));
      E('rect', { x: x, y: y, width: bw, height: hh, rx: 2, fill: cols[j], 'data-at': t0 + j * 90, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%', 'data-ms': 460 }, svg);
      T(h.at(svg, t0 + j * 90 + 420, { 'data-fx': 'fade' }), x + bw / 2, v >= 0 ? y - 7 : y + hh + 17, h.nf(v, dec), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': j === k - 1 ? 700 : 400, fill: j === k - 1 ? C.ink : C.mute }) });
    T(h.at(svg, t0, { 'data-fx': 'fade' }), cx, bot + 30, g.name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.ink }) });
  var ta = 150 + n * 180 + 400, ga = h.at(svg, ta, { 'data-fx': 'fade' }), lab = (s.avg && s.avg.label) || ('평균 ' + h.nf(avg, dec) + u);
  E('line', { x1: x0, x2: x1, y1: Y(avg), y2: Y(avg), stroke: C.warn, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, ga);
  var tw = h.textW(lab, 14, 1) + 16; E('rect', { x: x0 + 8, y: Y(avg) - 28, width: tw, height: 22, rx: 4, fill: C.warnsoft }, ga); T(ga, x0 + 8 + tw / 2, Y(avg) - 12, lab, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.warn });
  ctx.root.setAttribute('data-gap', 300);
};
})();
