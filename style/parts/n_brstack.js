/* brstack — 연도별 누적 + 합계 : 해마다 세로 막대에 항목이 쌓이고 맨 위에 합계 숫자
   cols[{label,parts[]}] 3~12개 · names[항목 이름](범례, 아래부터 쌓는 순서) · unit · dec · totalName(합계 설명, 기본 '합계') · hi(강조 막대 번호, 기본 마지막) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brstack = function (bd, s, ctx) {
  var Cc = (s.cols || []).slice(0, 12), n = Cc.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, u = s.unit || '', names = s.names || [], k = Cc[0].parts.length;
  var tots = Cc.map(function (c) { return c.parts.reduce(function (a, b) { return a + (+b) }, 0) }), hi = s.hi != null ? s.hi : n - 1, mx = Math.max.apply(null, tots), nt = h.niceTicks(0, mx * 1.12, 5);
  var top = 48, bot = 452, x0 = 56, x1 = 1168, Y = h.lin(nt.lo, nt.hi, bot, top), cw = (x1 - x0) / n, bw = Math.min(cw * .62, 78), cols = k === 2 ? [C.dark, C.g40] : [C.dark, C.g65, C.g40, C.g18].slice(0, k);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = nt.lo; v <= nt.hi + nt.step / 1000; v += nt.step) { E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.mute : C.grid, 'stroke-dasharray': v === 0 ? null : '3 4' }, g0); T(g0, x0 - 8, Y(v) + 4.5, h.nf(v, 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  T(g0, x0 - 8, 18, u, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  names.slice(0, k).forEach(function (nm, j) { var lx = x0 + 20 + j * 190; E('rect', { x: lx, y: 7, width: 14, height: 14, rx: 2, fill: cols[j] }, g0); T(g0, lx + 21, 19, nm, { 'font-size': 13.5, 'font-weight': 700, fill: C.ink }) });
  Cc.forEach(function (c, i) { var cx = x0 + cw * i + cw / 2, acc = 0, t0 = 120 + i * 200;
    c.parts.forEach(function (p, j) { p = +p; var y = Y(acc + p), hh = Y(acc) - y;
      E('rect', { x: cx - bw / 2, y: y, width: bw, height: Math.max(1, hh - 1), fill: cols[j], opacity: i === hi || j === 0 ? 1 : .9, 'data-at': t0 + j * 120, 'data-fx': 'grow', 'data-ms': 420 }, svg);
      if (hh > 26 && bw > 40) T(h.at(svg, t0 + j * 120 + 400, { 'data-fx': 'fade' }), cx, y + hh / 2 + 5, h.nf(p, dec), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: j === 0 ? '#fff' : C.ink }); acc += p });
    var on = i === hi, gt = h.at(svg, t0 + k * 120 + 300, { 'data-fx': 'fade' }); T(gt, cx, Y(tots[i]) - 10, h.nf(tots[i], dec), { 'text-anchor': 'middle', 'font-size': on ? 20 : 16, 'font-weight': 700, fill: on ? C.dark : C.ink });
    T(h.at(svg, t0, { 'data-fx': 'fade' }), cx, bot + 26, c.label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': on ? 700 : 400, fill: on ? C.ink : C.mute }) });
  T(h.at(svg, 150 + n * 200 + 500, { 'data-fx': 'fade' }), x1, 18, '막대 위 숫자 = ' + (s.totalName || '합계'), { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.dark });
  ctx.root.setAttribute('data-gap', 300);
};
})();
