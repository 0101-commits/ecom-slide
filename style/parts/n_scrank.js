/* scrank — 세로 기둥 순위 + 강조 나라 기준선 : 값 큰 순서로 세로 기둥, 강조 나라(hi) 진한 초록 · 나머지 연한 초록, 강조 나라 높이에 점선을 쭉 그어 나머지가 얼마나 높고 낮은지 차이 표시
   rows[{name,value,hi}] 3~6개 · unit · dec · dunit(차이 단위 기본 unit) · baseText('한국 수준') · rankText('위')
   움직임 : 기둥이 왼쪽부터 자람 → 값 → 기준선 → 차이 꼬리표 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scrank = function (bd, s, ctx) {
  var R = (s.rows || []).slice(), n = R.length; if (!n) return; R.sort(function (a, b) { return b.value - a.value }); var svg = ctx.svg(512), u = s.unit || '', du = s.dunit || u, dec = s.dec != null ? s.dec : 2;
  var mx = Math.max.apply(null, R.map(function (r) { return r.value })), top = 70, bot = 420, Y = h.lin(0, mx * 1.02, bot, top), slot = 1168 / n, bw = Math.min(170, slot * .56), hi = R.filter(function (r) { return r.hi })[0];
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); E('line', { x1: 0, x2: 1168, y1: bot, y2: bot, stroke: C.ink, 'stroke-width': 1.6 }, g0);
  R.forEach(function (r, i) { var cx = slot * (i + .5), x = cx - bw / 2, t = 200 + i * 300, y = Y(r.value), on = !!r.hi;
    E('rect', { x: x, y: y, width: bw, height: bot - y, rx: 4, fill: on ? C.dark : C.g40, 'data-at': t, 'data-fx': 'grow', 'data-ms': 700 }, svg);
    var g = h.at(svg, t + 600, { 'data-fx': 'fade', 'data-ms': 360 }), vt = h.nf(r.value, dec, { sign: s.sign });
    T(g, cx, y - 12, vt + u, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: on ? C.dark : C.ink });
    T(g, cx, bot + 34, r.name, { 'text-anchor': 'middle', 'font-size': on ? 22 : 20, 'font-weight': 700, fill: C.ink });
    S.chip(g, cx - 28, bot + 48, 56, 26, (i + 1) + (s.rankText || '위'), on ? C.dark : C.gray, on ? '#fff' : C.ink, 14) });
  if (hi) { var hy = Y(hi.value), tb = 200 + n * 300 + 200, gb = h.at(svg, tb, { 'data-fx': 'fade', 'data-ms': 420 }), hx = R.indexOf(hi);
    E('line', { x1: 0, x2: 1168, y1: hy, y2: hy, stroke: C.ink, 'stroke-width': 1.8, 'stroke-dasharray': '6 5' }, gb);
    var lt = (s.baseText || hi.name + ' 수준') + ' ' + h.nf(hi.value, dec) + u, lw = h.textW(lt, 13.5, 1) + 20, kg = hx < n - 1 ? hx + 1 : hx; E('rect', { x: slot * kg - lw / 2, y: hy + 12, width: lw, height: 26, rx: 13, fill: C.ink }, gb); T(gb, slot * kg, hy + 30, lt, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' });
    R.forEach(function (r, i) { if (r === hi) return; var cx = slot * (i + .5), y1 = Y(r.value), d = r.value - hi.value, gd = h.at(svg, tb + 300 + i * 120, { 'data-fx': 'fade', 'data-ms': 360 }), my = (hy + y1) / 2;
      if (Math.abs(y1 - hy) > 14) { var ax = cx + bw / 2 + 14; E('line', { x1: ax, x2: ax, y1: hy, y2: y1, stroke: d > 0 ? C.dark : C.cmp, 'stroke-width': 2 }, gd); h.tri(gd, ax, y1 + (d > 0 ? 3 : -3), d < 0, 6, d > 0 ? C.dark : C.cmp); }
      var t = (d >= 0 ? '+' : '−') + h.nf(Math.abs(d), dec) + du; S.chip(gd, cx + bw / 2 + 26, (Math.abs(y1 - hy) > 30 ? my : (d > 0 ? hy - 38 : hy + 12)) - 13, h.textW(t, 14, 1) + 20, 26, t, d > 0 ? C.g18 : C.paper, d > 0 ? C.dark : C.cmp, 14, { stroke: d > 0 ? C.g65 : C.axis }) }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
