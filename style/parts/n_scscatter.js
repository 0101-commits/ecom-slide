/* scscatter — 나라 산점(꼬리 궤적) : 가로 = 한 해 전 값, 세로 = 지금 값. 같은 값 대각선 위는 올랐고 아래는 내렸음. 나라마다 달마다 찍은 점 궤적, 가장 최근 점이 큰 점 + 이름
   x{min,max,step,title,dec} · y{…} · series[{name,tone,hi,pts:[[x,y]…](가장 최근이 마지막),label}] · diag{up:'올랐음 쪽',down:'내렸음 쪽'} · suf('%')
   움직임 : 축 → 궤적이 나라마다 그려짐 → 큰 점 + 이름 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc, U = ECOM.u;
ECOM.parts.scscatter = function (bd, s, ctx) {
  var svg = ctx.svg(512), xo = s.x || {}, yo = s.y || {}, SE = (s.series || []).slice(0, 5), x0 = 82, x1 = 1100, top = 14, bot = 452, X = h.lin(xo.min, xo.max, x0, x1), Y = h.lin(yo.min, yo.max, bot, top), suf = s.suf || '', xd = xo.dec || 0;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 }), dg = s.diag || {};
  var dlo = Math.max(xo.min, yo.min), dhi = Math.min(xo.max, yo.max);
  E('path', { d: 'M' + X(dlo) + ' ' + Y(dlo) + ' L' + X(dhi) + ' ' + Y(dhi) + ' L' + X(dlo) + ' ' + Y(dhi) + ' Z', fill: C.g08 }, g0);
  for (var v = yo.min; v <= yo.max + 1e-9; v += yo.step) { E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, x0 - 10, Y(v) + 4.5, h.nf(v, xd) + suf, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  for (var q = xo.min; q <= xo.max + 1e-9; q += xo.step) { E('line', { x1: X(q), x2: X(q), y1: top, y2: bot, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, X(q), bot + 22, h.nf(q, xd) + suf, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }
  E('line', { x1: x0, x2: x1, y1: bot, y2: bot, stroke: C.axis }, g0); E('line', { x1: x0, x2: x0, y1: top, y2: bot, stroke: C.axis }, g0);
  E('line', { x1: X(dlo), x2: X(dhi), y1: Y(dlo), y2: Y(dhi), stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '6 5' }, g0);
  T(g0, x0 + 14, top + 24, (dg.up || '지금이 더 높음') + ' ↖', { 'font-size': 14, 'font-weight': 700, fill: C.g65 }); T(g0, x1 - 12, bot - 14, '↘ ' + (dg.down || '지금이 더 낮음'), { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.mute });
  T(g0, (x0 + x1) / 2, bot + 48, xo.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.ink });
  T(g0, x0, 5, '', {}); var yt = T(g0, 0, 0, yo.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.ink, transform: 'translate(20 ' + ((top + bot) / 2) + ') rotate(-90)' });
  var lab = [];
  SE.forEach(function (se, i) { var col = h.col(se.tone || (se.hi ? 'dark' : ['g65', 'cmp', 'g40', 'gray'][i])), t = 300 + i * 650, P = se.pts || [], on = !!se.hi;
    E('path', { d: h.lineD(P.map(function (p) { return p[1] }), function (k) { return X(P[k][0]) }, Y), fill: 'none', stroke: col, 'stroke-width': on ? 2.6 : 1.8, 'stroke-opacity': on ? .9 : .7, 'stroke-linejoin': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 900 }, svg);
    var g = h.at(svg, t + 100, { 'data-fx': 'fade', 'data-ms': 800 }); P.forEach(function (p, k) { if (k < P.length - 1) E('circle', { cx: X(p[0]), cy: Y(p[1]), r: on ? 3.4 : 2.6, fill: col, 'fill-opacity': .55 }, g) });
    var L = P[P.length - 1]; E('circle', { cx: X(L[0]), cy: Y(L[1]), r: on ? 10 : 8, fill: col, stroke: '#fff', 'stroke-width': 2.5, 'data-at': t + 900, 'data-fx': 'pop' }, svg);
    lab.push({ se: se, col: col, x: X(L[0]), y: Y(L[1]), t: t + 950, on: on, L: L }) });
  lab.forEach(function (l) { var g = h.at(svg, l.t, { 'data-fx': 'fade', 'data-ms': 360 }), nm = l.se.name, sub = h.nf(l.L[0], 2) + ' → ' + h.nf(l.L[1], 2) + suf, w = Math.max(h.textW(nm, l.on ? 17 : 15, 1), h.textW(sub, 12.5)) , right = l.x + w + 24 < x1 + 120, lx = right ? l.x + 16 : l.x - 16;
    T(g, lx, l.y - 2, nm, { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4, 'text-anchor': right ? 'start' : 'end', 'font-size': l.on ? 17 : 15, 'font-weight': 700, fill: l.on ? C.dark : C.ink }); T(g, lx, l.y + 15, sub, { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4, 'text-anchor': right ? 'start' : 'end', 'font-size': 12.5, fill: C.mute }) });
  if (s.side) { var sd = s.side, gs = h.at(svg, 300 + SE.length * 650 + 400, { 'data-fx': 'fade', 'data-ms': 420 }), sx = 1050, sw = 118; T(gs, sx, top + 18, sd.title || '', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
    (sd.rows || []).forEach(function (r, i) { T(gs, sx, top + 52 + i * 62, r.k, { 'font-size': 13, fill: C.mute }); T(gs, sx, top + 78 + i * 62, r.v, { 'font-size': 20, 'font-weight': 700, fill: r.hi ? C.dark : C.ink }) }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
