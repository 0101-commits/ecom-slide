/* scheat — 나라 × 지표 색 표 : 줄 = 나라, 칸 = 지표. 지표(열)마다 값이 클수록 짙은 초록(dir:'down' 이면 작을수록), 칸 안 큰 값 + 작은 순위. 강조 나라(hi) 줄 굵은 테두리
   cols[{name,sub,unit,dec,dir,data:[나라 순서 값]}] 3~6열 · rows[{name,sub,hi}] 2~6줄 · sign(true 면 + 부호) · rankText('위')
   움직임 : 머리 → 줄이 위에서부터 칸이 채워짐 → 강조 테두리 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scheat = function (bd, s, ctx) {
  var cols = (s.cols || []).slice(0, 6), rows = (s.rows || []).slice(0, 6), nc = cols.length, nr = rows.length; if (!nc || !nr) return; var svg = ctx.svg(512);
  var LW = 170, hh = 76, cw = (1168 - LW) / nc, rh = (512 - hh - 6) / nr, g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 340 });
  cols.forEach(function (c, j) { var x = LW + j * cw + cw / 2; T(g0, x, 30, c.name, { 'text-anchor': 'middle', 'font-size': S.fit(c.name, 16, cw - 14, 1, 12.5), 'font-weight': 700, fill: C.ink }); if (c.sub) T(g0, x, 50, c.sub, { 'text-anchor': 'middle', 'font-size': S.fit(c.sub, 12.5, cw - 14, 0, 11.5), fill: C.mute });
    T(g0, x, 68, (c.dir === 'down' ? '작을수록 짙음' : '클수록 짙음'), { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.axis }) });
  rows.forEach(function (r, i) { var y = hh + i * rh, g = h.at(svg, 300 + i * 340, { 'data-fx': 'fade', 'data-ms': 320 });
    T(g, 16, y + rh / 2 + (r.sub ? -2 : 7), r.name, { 'font-size': 20, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 16, y + rh / 2 + 18, r.sub, { 'font-size': 12.5, fill: C.mute });
    cols.forEach(function (c, j) { var v = c.data[i], lo = Math.min.apply(null, c.data), hi = Math.max.apply(null, c.data), t = hi > lo ? (v - lo) / (hi - lo) : .5; if (c.dir === 'down') t = 1 - t;
      var order = c.data.slice().sort(function (a, b) { return c.dir === 'down' ? a - b : b - a }), rk = order.indexOf(v) + 1, x = LW + j * cw, dark = t > .58;
      E('rect', { x: x + 3, y: y + 3, width: cw - 6, height: rh - 6, rx: 6, fill: S.ramp(.06 + t * .94) }, g);
      T(g, x + cw / 2, y + rh / 2 + 6, h.nf(v, c.dec != null ? c.dec : 2, { sign: s.sign || c.sign }) + (c.unit || ''), { 'text-anchor': 'middle', 'font-size': S.fit(h.nf(v, c.dec != null ? c.dec : 2, { sign: s.sign || c.sign }) + (c.unit || ''), 28, cw - 24, 1, 16), 'font-weight': 700, fill: dark ? '#fff' : C.ink });
      T(g, x + cw / 2, y + rh / 2 + 29, rk + (s.rankText || '위'), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: dark ? C.g18 : C.mute }) }) });
  var ih = rows.map(function (r, i) { return r.hi ? i : -1 }).filter(function (i) { return i >= 0 });
  ih.forEach(function (i) { var gh = h.at(svg, 300 + nr * 340 + 100, { 'data-fx': 'pop', 'data-ms': 420 }); E('rect', { x: 1, y: hh + i * rh + 1, width: 1166, height: rh - 2, rx: 8, fill: 'none', stroke: C.ink, 'stroke-width': 3 }, gh) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
