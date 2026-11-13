/* scpayoff — 손익 꺾인 선 : 가격(가로)에 따른 손익(세로) 꺾은선. 0 위 이익 면(연한 초록) · 0 아래 손실 면(연한 주황), 꺾이는 점 · 손익분기 · 지금 가격 표시
   x{min,max,step,title,dec} · y{min,max,step,unit,dec} · pts[[가격,손익]…](양 끝 포함 꺾은선) · marks[{type:'now'|'be'|'kink'|'cap',x,label,sub,dx,dy,anchor}] · box{title,rows:[{k,v}],x,y}
   움직임 : 축 → 면 → 선 그리기 → 표시들 → 요약 상자 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scpayoff = function (bd, s, ctx) {
  var P = s.pts || [], xo = s.x || {}, yo = s.y || {}; if (P.length < 2) return; var svg = ctx.svg(512), x0 = 78, x1 = 1150, top = 24, bot = 452;
  var X = h.lin(xo.min, xo.max, x0, x1), Y = h.lin(yo.min, yo.max, bot, top), zy = Y(0), du = yo.unit || '', xd = xo.dec || 0, yd = yo.dec || 0;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  for (var v = yo.min; v <= yo.max + 1e-9; v += yo.step) { E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.ink : C.grid, 'stroke-width': v === 0 ? 1.6 : 1, 'stroke-dasharray': v === 0 ? null : '3 4' }, g0); T(g0, x0 - 10, Y(v) + 4.5, h.nf(v, yd, { sign: v !== 0 }), { 'text-anchor': 'end', 'font-size': 12.5, fill: v === 0 ? C.ink : C.mute }) }
  T(g0, x0 - 10, top - 10, du, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  for (var q = xo.min; q <= xo.max + 1e-9; q += xo.step) T(g0, X(q), bot + 24, h.nf(q, xd), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
  T(g0, (x0 + x1) / 2, bot + 50, xo.title || '', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
  var d = 'M' + P.map(function (p) { return X(p[0]) + ' ' + Y(p[1]) }).join(' L'), area = d + ' L' + X(P[P.length - 1][0]) + ' ' + zy + ' L' + X(P[0][0]) + ' ' + zy + ' Z', id = S.uid('po');
  var df = E('defs', null, svg); [['u', top - 20, zy], ['d', zy, bot + 10]].forEach(function (c) { var cp = E('clipPath', { id: id + c[0] }, df); E('rect', { x: x0, y: c[1], width: x1 - x0, height: c[2] - c[1] }, cp) });
  var ga = h.at(svg, 350, { 'data-fx': 'fade', 'data-ms': 500 });
  E('path', { d: area, fill: C.g18, 'clip-path': 'url(#' + id + 'u)' }, ga); E('path', { d: area, fill: '#F2D9CF', 'clip-path': 'url(#' + id + 'd)' }, ga);
  E('path', { d: d, fill: 'none', stroke: C.dark, 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'data-at': 900, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
  (s.marks || []).forEach(function (m, i) { var g = h.at(svg, 2100 + i * 380, { 'data-fx': 'fade', 'data-ms': 380 }), mx = X(m.x), my = m.y != null ? Y(m.y) : zy, an = m.anchor || 'start', lx = mx + (m.dx || 0), ly = my + (m.dy || 0);
    if (m.type === 'now') { E('line', { x1: mx, x2: mx, y1: top - 4, y2: bot, stroke: C.ink, 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, g); var w = h.textW(m.label, 14, 1) + 20; E('rect', { x: mx - w / 2, y: bot - 30, width: w, height: 26, rx: 13, fill: C.ink }, g); T(g, mx, bot - 12, m.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }); return }
    E('circle', { cx: mx, cy: my, r: m.type === 'be' ? 7 : 8, fill: m.type === 'be' ? '#fff' : C.dark, stroke: C.dark, 'stroke-width': 3 }, g);
    if (m.leader !== false) E('line', { x1: mx, y1: my, x2: lx - (an === 'end' ? -4 : an === 'middle' ? 0 : 4), y2: ly - 5, stroke: C.axis, 'stroke-width': 1.2 }, g);
    T(g, lx, ly, m.label, { 'text-anchor': an, 'font-size': 15, 'font-weight': 700, fill: C.ink }); if (m.sub) T(g, lx, ly + 18, m.sub, { 'text-anchor': an, 'font-size': 13, fill: C.sub }) });
  if (s.zones) s.zones.forEach(function (z, i) { var g = h.at(svg, 500, { 'data-fx': 'fade' }); T(g, z.x, z.y, z.text, { 'text-anchor': z.anchor || 'start', 'font-size': 14, 'font-weight': 700, fill: z.warn ? C.warn : C.g65 }) });
  if (s.box) { var b = s.box, bg = h.at(svg, 2100 + (s.marks || []).length * 380 + 200, { 'data-fx': 'fade', 'data-ms': 420 }), bw = 252, bh = 46 + b.rows.length * 30, bx = b.x, by = b.y;
    E('rect', { x: bx, y: by, width: bw, height: bh, rx: 10, fill: '#fff', stroke: C.line, 'stroke-width': 1.5 }, bg); T(bg, bx + 16, by + 28, b.title, { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    b.rows.forEach(function (r, i) { T(bg, bx + 16, by + 56 + i * 30, r.k, { 'font-size': 13.5, fill: C.mute }); T(bg, bx + bw - 16, by + 56 + i * 30, r.v, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: r.warn ? C.warn : C.ink }) }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
