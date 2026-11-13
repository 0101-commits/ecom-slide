/* stmap — 용어 관계 지도 : 가운데 큰 용어 + 둘레 4 용어(왼위 · 오른위 · 왼아래 · 오른아래), 선 위 칩(+ · 역할) + 아래 두 식 상자(쪼개는 두 방법)
   center{name,sub,value,dec,unit} · nodes[4]{name,sub,value,dec,unit,tag} (순서 = 왼위 · 오른위 · 왼아래 · 오른아래) · edges[4 글](각 둘레 용어 → 가운데 선 위 글) · eqs[2]{title,text} 아래 식 상자 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stmap = function (bd, s, ctx) {
  var c = s.center, nd = (s.nodes || []).slice(0, 4); if (!c || nd.length < 2) return; var svg = ctx.svg(512), W = 270, H = 104, cx = 449, cy = 148, cw = 270, chh = 124;
  var pos = [[0, 0], [898, 0], [0, 300], [898, 300]], eqs = s.eqs || [], ed = s.edges || [];
  var gc = h.at(svg, 0, { 'data-fx': 'pop', 'data-ms': 460 });
  u.box(gc, cx, cy, cw, chh, C.dark, { rx: 16 }); T(gc, cx + cw / 2, cy + 34, c.name || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#fff' });
  if (c.sub) T(gc, cx + cw / 2, cy + 56, c.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.g18 });
  var cv = h.nf(c.value, c.dec == null ? 2 : c.dec); T(gc, cx + cw / 2 - h.textW(c.unit || '%', 16, 1) / 2, cy + 102, cv, { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 700, fill: '#fff' });
  T(gc, cx + cw / 2 + h.textW(cv, 38, 1) / 2 + 2, cy + 102, c.unit || '%', { 'font-size': 16, 'font-weight': 700, fill: C.on });
  nd.forEach(function (q, i) { var p = pos[i], left = i % 2 === 0, ms = 500 + i * 480, g = h.at(svg, ms, { 'data-fx': 'rise', 'data-ms': 420 }), x = p[0], y = p[1], tone = i < 2 ? C.main : C.g65;
    var ex = left ? x + W : x, ey = y + H / 2, tx = left ? cx : cx + cw, ty = i < 2 ? cy + 34 : cy + chh - 34, gl = h.at(svg, ms - 120, { 'data-fx': 'fade', 'data-ms': 360 });
    E('line', { x1: ex, y1: ey, x2: tx, y2: ty, stroke: tone, 'stroke-width': 3 }, gl);
    u.box(g, x, y, W, H, i < 2 ? C.g08 : C.paper, { stroke: tone, sw: 2 }); E('rect', { x: x, y: y, width: 7, height: H, rx: 3.5, fill: tone }, g);
    T(g, x + 22, y + 30, q.name || '', { 'font-size': u.fit(q.name || '', 17, W - 36, 1, 13), 'font-weight': 700, fill: C.ink });
    if (q.sub) T(g, x + 22, y + 50, q.sub, { 'font-size': u.fit(q.sub, 12.5, W - 36, 0, 11.5), 'font-weight': 500, fill: C.mute });
    var v = h.nf(q.value, q.dec == null ? 2 : q.dec); T(g, x + 22, y + 90, v, { 'font-size': 32, 'font-weight': 700, fill: C.dark }); T(g, x + 22 + h.textW(v, 32, 1) + 5, y + 90, q.unit || '%', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
    if (ed[i]) { var mx = (ex + tx) / 2, my = (ey + ty) / 2; u.chip(gl, mx, my, ed[i], i < 2 ? C.main : C.g65, i < 2 ? '#fff' : C.ink, 12.5) } });
  eqs.slice(0, 2).forEach(function (q, i) { var g = h.at(svg, 2600 + i * 400, { 'data-fx': 'rise', 'data-ms': 420 }), w = 574, x = i * (w + 20), col = i ? C.g65 : C.main;
    u.box(g, x, 428, w, 80, C.paper); E('rect', { x: x, y: 428, width: 7, height: 80, rx: 3.5, fill: col }, g);
    T(g, x + 24, 456, q.title || '', { 'font-size': 13.5, 'font-weight': 700, fill: C.mute }); u.rich(g, x + 24, 488, q.text || '', 18, w - 44, { fill: C.ink, min: 13 }) });
};
})();
