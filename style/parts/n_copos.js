/* copos — 포지셔닝 시장 지도 : 가로 = 성장률, 세로 = 이익률, 원 넓이 = 시가총액. 기준선이 그려내는 4구역에 이름표(구역 이름 + 한 줄 뜻)
   items[{name,x,y,size,hero,left(true 면 이름을 원 왼쪽)}] 5~10개 · x{min,max,step,title,unit} · y{min,max,step,title,unit} · pivot{x,y}(기준선 값) · quads[왼위,오른위,왼아래,오른아래]{t,s}
   sizeLabel(범례 글, 기본 '원 넓이 = 시가총액') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.copos = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 10); if (!I.length) return; var svg = ctx.svg(512), xa = s.x || { min: 0, max: 30, step: 5 }, ya = s.y || { min: 0, max: 30, step: 5 }, L = 74, Rr = 1150, Tp = 8, Bt = 440;
  var X = h.lin(xa.min, xa.max, L, Rr), Y = h.lin(ya.min, ya.max, Bt, Tp), pv = s.pivot || { x: (xa.min + xa.max) / 2, y: (ya.min + ya.max) / 2 }, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = xa.min; v <= xa.max + 1e-9; v += xa.step) { E('line', { x1: X(v), x2: X(v), y1: Tp, y2: Bt, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, X(v), Bt + 19, h.nf(v, 0) + (xa.unit || ''), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }
  for (var w = ya.min; w <= ya.max + 1e-9; w += ya.step) { E('line', { x1: L, x2: Rr, y1: Y(w), y2: Y(w), stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, L - 9, Y(w) + 4.5, h.nf(w, 0) + (ya.unit || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  E('rect', { x: X(pv.x), y: Tp, width: Rr - X(pv.x), height: Y(pv.y) - Tp, fill: C.g08 }, g0); E('rect', { x: L, y: Tp, width: Rr - L, height: Bt - Tp, fill: 'none', stroke: C.line }, g0);
  E('line', { x1: X(pv.x), x2: X(pv.x), y1: Tp, y2: Bt, stroke: C.dark, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g0); E('line', { x1: L, x2: Rr, y1: Y(pv.y), y2: Y(pv.y), stroke: C.dark, 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g0);
  var Q = s.quads || [], qp = [[L + 12, Tp + 22, 'start'], [Rr - 12, Tp + 22, 'end'], [L + 12, Bt - 22, 'start'], [Rr - 12, Bt - 22, 'end']];
  Q.slice(0, 4).forEach(function (q, k) { if (!q) return; T(g0, qp[k][0], qp[k][1], q.t, { 'text-anchor': qp[k][2], 'font-size': 15, 'font-weight': 700, fill: k === 1 ? C.dark : C.axis }); if (q.s) T(g0, qp[k][0], qp[k][1] + 17, q.s, { 'text-anchor': qp[k][2], 'font-size': 12.5, fill: C.mute }) });
  T(g0, (L + Rr) / 2, 487, (xa.title || '') , { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub });
  T(g0, 16, (Tp + Bt) / 2, ya.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub, transform: 'rotate(-90 16 ' + ((Tp + Bt) / 2) + ')' });
  var mx = Math.max.apply(null, I.map(function (q) { return q.size })), rm = 46, rr = function (q) { return Math.max(9, Math.sqrt(q.size / mx) * rm) };
  I.slice().sort(function (a, b) { return b.size - a.size }).forEach(function (q, k) { var cx = X(q.x), cy = Y(q.y), r = rr(q), t0 = 150 + k * 110, on = !!q.hero, g = h.at(svg, t0, { 'data-fx': 'fade' }), lw = h.textW(q.name, 14.5, 1), left = q.left || (cx + r + 8 + lw > Rr);
    E('circle', { cx: cx, cy: cy, r: r, fill: on ? C.dark : C.g65, opacity: on ? .94 : .72, stroke: '#fff', 'stroke-width': 1.6 }, g);
    T(g, left ? cx - r - 7 : cx + r + 7, cy + 5, q.name, { 'text-anchor': left ? 'end' : 'start', 'font-size': 14.5, 'font-weight': 700, fill: on ? C.dark : C.ink }) });
  var gl = h.at(svg, 1200, { 'data-fx': 'fade' }); E('circle', { cx: Rr - 164, cy: 482, r: 7, fill: C.g65, opacity: .72 }, gl); T(gl, Rr - 150, 487, s.sizeLabel || '원 넓이 = 시가총액', { 'font-size': 13, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};
})();
