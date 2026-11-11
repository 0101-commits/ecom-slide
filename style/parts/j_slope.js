/* slope — 두 시점 기울기 : 왼쪽 점 → 선이 뻗음 → 오른쪽 값 · 변화, 오른쪽에 변화 폭 순위(작은 막대)
   pairs[{label,a,b,color}] · heads[왼쪽 이름, 오른쪽 이름] · unit · dec · delta('diff' 기본 | 'ratio' | 'none') · dunit(차이 단위, 기본 '%' 면 '%p')
   hi[번호 또는 이름](굵게) · y{min,max} · side(기본 true — 변화 폭 순위) · sideTitle */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
/* 세로로 겹치지 않게 펼치기 : items[{y}] → y 를 gap 만큼 띄움(위아래 한계 안) */
function spans(t, parts) { parts.forEach(function (q) { if (!q) return; var a = { dx: q.dx, 'font-weight': q.w, fill: q.c }, e = E('tspan', a, t); e.textContent = q.t }); return t }
function spread(items, gap, lo, hi) { var a = items.slice().sort(function (p, q) { return p.y - q.y }); for (var k = 0; k < 60; k++) { var moved = false;
    for (var i = 1; i < a.length; i++) { var d = a[i].y - a[i - 1].y; if (d < gap) { var m = (gap - d) / 2; a[i - 1].y -= m; a[i].y += m; moved = true } }
    if (a.length) { if (a[0].y < lo) { var s0 = lo - a[0].y; a.forEach(function (o) { o.y += s0 }) } if (a[a.length - 1].y > hi) { var s1 = a[a.length - 1].y - hi; a.forEach(function (o) { o.y -= s1 }) } } if (!moved) break } }
ECOM.parts.slope = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, P = s.pairs || [], n = P.length; if (!n) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', mode = s.delta || 'diff', dunit = s.dunit || (unit === '%' ? '%p' : unit), heads = s.heads || ['', ''];
  var F = function (v) { return h.nf(v, dec) + unit }, D = P.map(function (q) { return mode === 'ratio' ? (q.a ? q.b / q.a : null) : q.b - q.a }), DF = function (v) { return v == null ? '' : mode === 'ratio' ? h.nf(v, 1) + '배' : h.nf(v, dec, { sign: true }) + dunit };
  var hi = (s.hi || []).map(function (x) { return typeof x === 'number' ? x : P.findIndex(function (q) { return q.label === x }) });
  var side = s.side !== false && mode !== 'none', svg = ctx.svg(512), top = 70, bot = 492, xa = side ? 330 : 420, xb = side ? 690 : 820;
  var all = []; P.forEach(function (q) { all.push(q.a, q.b) }); var e = h.ext(all), lo = s.y && s.y.min != null ? s.y.min : e[0] - (e[1] - e[0]) * .06, hi2 = s.y && s.y.max != null ? s.y.max : e[1] + (e[1] - e[0]) * .06, Y = h.lin(lo, hi2, bot - 10, top + 10);
  /* 머리 · 세로 기준선 */
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  [[xa, heads[0]], [xb, heads[1]]].forEach(function (c) { E('line', { x1: c[0], x2: c[0], y1: top - 6, y2: bot, stroke: C.grid, 'stroke-width': 2 }, g1); T(g1, c[0], top - 24, c[1], { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.ink }) });
  function colOf(i) { var q = P[i]; return q.color ? h.col(q.color) : (hi.length ? (hi.indexOf(i) >= 0 ? C.main : C.gray) : (D[i] == null || (mode === 'ratio' ? D[i] >= 1 : D[i] >= 0) ? C.main : C.cmp)) }
  function txtCol(i) { var c = colOf(i); return c === C.gray ? C.sub : c === C.main ? C.dark : c }
  var Ls = P.map(function (q, i) { return { i: i, y: Y(q.a), y0: Y(q.a) } }), Rs = P.map(function (q, i) { return { i: i, y: Y(q.b), y0: Y(q.b) } });
  spread(Ls, 24, top, bot); spread(Rs, 24, top, bot);
  /* 왼쪽 점 · 이름 */
  var gL = h.lv(svg, 2), gR = h.lv(svg, 4);
  Ls.forEach(function (o) { var q = P[o.i], c = colOf(o.i), bold = !hi.length || hi.indexOf(o.i) >= 0;
    E('circle', { cx: xa, cy: o.y0, r: 6.5, fill: '#fff', stroke: c, 'stroke-width': 2.6 }, gL);
    if (Math.abs(o.y - o.y0) > 3) E('path', { d: 'M' + (xa - 9) + ' ' + o.y0 + ' L' + (xa - 16) + ' ' + o.y, fill: 'none', stroke: C.axis }, gL);
    spans(T(gL, xa - 18, o.y + 5, '', { 'text-anchor': 'end', 'font-size': 15, fill: C.ink }), [{ t: q.label, w: bold ? 700 : 500 }, { t: F(q.a), dx: 10, c: C.sub }]) });
  /* 선 */
  P.forEach(function (q, i) { var c = colOf(i), w = hi.indexOf(i) >= 0 ? 4.4 : 3; E('path', { d: 'M' + xa + ' ' + Y(q.a) + ' L' + xb + ' ' + Y(q.b), stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', fill: 'none', 'data-b': 3, 'data-fx': 'draw', 'data-ms': 700 }, svg) });
  /* 오른쪽 점 · 값 · 변화 */
  Rs.forEach(function (o) { var q = P[o.i], c = colOf(o.i);
    E('circle', { cx: xb, cy: o.y0, r: 7, fill: c }, gR);
    if (Math.abs(o.y - o.y0) > 3) E('path', { d: 'M' + (xb + 9) + ' ' + o.y0 + ' L' + (xb + 16) + ' ' + o.y, fill: 'none', stroke: C.axis }, gR);
    spans(T(gR, xb + 18, o.y + 5, '', { 'font-size': 15, fill: C.ink }), [{ t: F(q.b), w: 700, c: txtCol(o.i) }, mode !== 'none' ? { t: DF(D[o.i]), dx: 10, w: 700, c: c === C.gray ? C.mute : txtCol(o.i) } : null, side ? null : { t: q.label, dx: 10, c: C.mute }]) });
  /* 변화 폭 순위 */
  if (side) { var xs = 880, xe = 1160, order = D.map(function (v, i) { return i }).filter(function (i) { return D[i] != null }).sort(function (a, b) { return D[b] - D[a] }), g5 = h.lv(svg, 5);
    T(g5, xs, top - 24, s.sideTitle || (mode === 'ratio' ? heads[1] + ' ÷ ' + heads[0] : '변화 폭 순위, ' + dunit), { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    var base = mode === 'ratio' ? 1 : 0, vals = order.map(function (i) { return D[i] }), mn = Math.min(base, Math.min.apply(null, vals)), mx = Math.max(base, Math.max.apply(null, vals));
    var lw = Math.max.apply(null, order.map(function (i) { return h.textW(P[i].label, 13.5, 1) })) + 14, bx0 = xs + lw, vw = Math.max.apply(null, order.map(function (i) { return h.textW(DF(D[i]), 13.5, 1) })) + 14, SX = h.lin(mn, mx, bx0, xe - vw), rowH = Math.min(84, (bot - top) / Math.max(order.length, 1));
    if (mn < base) E('line', { x1: SX(base), x2: SX(base), y1: top - 4, y2: top + rowH * order.length, stroke: C.axis }, g5);
    order.forEach(function (i, r) { var y = top + rowH * (r + .5), v = D[i], x0 = SX(Math.min(base, v)), w = Math.abs(SX(v) - SX(base)), c = colOf(i);
      T(g5, bx0 - 10, y + 5, P[i].label, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.sub });
      E('rect', { x: x0, y: y - 12, width: Math.max(2, w), height: 24, rx: 2, fill: c === C.cmp ? C.gray : c, 'data-fx': 'growx', 'data-o': v >= base ? '0% 50%' : '100% 50%' }, g5);
      T(g5, v >= base ? SX(v) + 8 : SX(base) + 8, y + 5, DF(v), { 'font-size': 13.5, 'font-weight': 700, fill: txtCol(i) }) });
    if (mode === 'ratio') T(g5, xs, top + rowH * order.length + 24, '1배 = 변화 없음', { 'font-size': 12.5, fill: C.mute }) }
  root.setAttribute('data-gap', 420); root.setAttribute('data-stg', 60);
};
})();
