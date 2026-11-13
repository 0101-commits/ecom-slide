/* cznet — 산업 연결망 : 마디(동그라미) 크기 = 규모, 마디 사이 선 굵기 = 연결 세기
   nodes[{id,name,value,x,y(0~1),tone:'dark|main|g65|g40'}] · edges[{from,to,w}] · unit · sizeKey('마디 크기 = …') · edgeKey('선 굵기 = …') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.cznet = function (bd, s, ctx) {
  var svg = ctx.svg(512), nd = s.nodes || [], ed = s.edges || [], by = {}, vmax = Math.max.apply(null, nd.map(function (o) { return o.value || 1 })), wmax = Math.max.apply(null, ed.map(function (e) { return e.w || 1 }));
  var X0 = 70, X1 = 1098, Y0 = 48, Y1 = 410, TC = { dark: C.dark, main: C.main, g65: C.g65, g40: C.g40 };
  nd.forEach(function (o) { o._x = X0 + (X1 - X0) * o.x; o._y = Y0 + (Y1 - Y0) * o.y; o._r = 22 + 40 * Math.sqrt((o.value || 0) / vmax); by[o.id] = o });
  ed.forEach(function (e, i) { var a = by[e.from], b = by[e.to]; if (!a || !b) return; var dx = b._x - a._x, dy = b._y - a._y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, bend = (e.bend != null ? e.bend : 0.12) * d, mx = (a._x + b._x) / 2 - uy * bend, my = (a._y + b._y) / 2 + ux * bend;
    var sx = a._x + ux * a._r * .8, sy = a._y + uy * a._r * .8, ex = b._x - ux * (b._r + 6), ey = b._y - uy * (b._r + 6), t = 300 + i * 90;
    E('path', { d: 'M' + sx + ' ' + sy + ' Q' + mx + ' ' + my + ' ' + ex + ' ' + ey, fill: 'none', stroke: C.g40, 'stroke-width': 2 + 13 * (e.w || 1) / wmax, opacity: .85, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'fade', 'data-ms': 420 }, svg) });
  nd.forEach(function (o, i) { var g = h.at(svg, 150 + i * 110, { 'data-fx': 'pop', 'data-ms': 380 }), fc = TC[o.tone] || C.main, light = fc === C.g40;
    E('circle', { cx: o._x, cy: o._y, r: o._r, fill: fc, stroke: '#fff', 'stroke-width': 3 }, g);
    T(g, o._x, o._y + 5, h.nf(o.value, s.dec || 0) + (s.unit || ''), { 'text-anchor': 'middle', 'font-size': o._r > 46 ? 17 : 13.5, 'font-weight': 700, fill: light ? C.dark : '#fff' });
    var up = o._y > 330 && false; Z.tx(g, o._x, o._y + o._r + 20, o.name || '', 15, 160, { lh: 18 }) });
  var gl = h.at(svg, 1500, { 'data-fx': 'fade', 'data-ms': 420 }); E('circle', { cx: 24, cy: 476, r: 10, fill: C.g65 }, gl); T(gl, 42, 481, s.sizeKey || '마디 크기 = 규모', { 'font-size': 13.5, 'font-weight': 600, fill: C.sub });
  E('line', { x1: 330, x2: 372, y1: 476, y2: 476, stroke: C.g40, 'stroke-width': 10, 'stroke-linecap': 'round' }, gl); T(gl, 384, 481, s.edgeKey || '선 굵기 = 연결 세기', { 'font-size': 13.5, 'font-weight': 600, fill: C.sub });
};
})();
