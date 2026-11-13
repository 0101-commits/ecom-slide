/* dx 두 지표 평면 부품 3종(머리글자 dx) — F02 : dxpath 연결 산점(시간 경로) · dxscat 산점 + 추세선 + 지금 점 · dxquad 4분면 위 이동 경로
   칸 설명은 style/SCHEMA4_F02.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.dxu, W = 1168;
function nn(v) { return v != null && !isNaN(v) }
/* 가로 · 세로 눈금 + 축 이름. 반환 {X,Y,box,g} */
function frame(svg, s, o) { o = o || {}; var xo = s.x, yo = s.y, bx = { l: o.l || 92, r: W - (o.r != null ? o.r : 36), t: o.t || 34, b: o.b || 436 }, g = h.lv(svg, 1, { 'data-fx': 'fade' });
  var sx = u.scale(xo, bx.t, bx.b), X = h.lin(xo.min, xo.max, bx.l, bx.r), sy = u.scale(yo, bx.t, bx.b), Y = sy.Y;
  if (o.tint) o.tint(g, X, Y, bx);
  sy.ticks.forEach(function (v) { E('line', { x1: bx.l, x2: bx.r, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, g); T(g, bx.l - 9, Y(v) + 4.5, h.nf(v, sy.dec) + (yo.suf || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
  sx.ticks.forEach(function (v) { E('line', { x1: X(v), x2: X(v), y1: bx.t, y2: bx.b, stroke: C.grid, 'stroke-dasharray': '3 4' }, g); T(g, X(v), bx.b + 20, h.nf(v, sx.dec) + (xo.suf || ''), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  E('line', { x1: bx.l, x2: bx.r, y1: bx.b, y2: bx.b, stroke: C.axis, 'stroke-width': 1.2 }, g); E('line', { x1: bx.l, x2: bx.l, y1: bx.t, y2: bx.b, stroke: C.axis, 'stroke-width': 1.2 }, g);
  T(g, (bx.l + bx.r) / 2, bx.b + 46, xo.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub });
  T(g, 0, bx.t - 12, yo.title || '', { 'font-size': 14, 'font-weight': 700, fill: C.sub });
  [['refx', true], ['refy', false]].forEach(function (q) { var r = s[q[0]]; if (!r) return; var gg = g;
    if (q[1]) { E('line', { x1: X(r.v), x2: X(r.v), y1: bx.t, y2: bx.b, stroke: C.dark, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, gg); if (r.label) u.pill(gg, X(r.v), bx.t - 8, r.label, C.dark, '#fff', 12.5) }
    else { E('line', { x1: bx.l, x2: bx.r, y1: Y(r.v), y2: Y(r.v), stroke: C.dark, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, gg); if (r.label) u.pill(gg, bx.r - 34, Y(r.v) - 14, r.label, C.dark, '#fff', 12.5) } });
  return { X: X, Y: Y, box: bx, g: g, svg: svg } }

/* ───── dxpath 연결 산점 ───── */
ECOM.parts.dxpath = function (bd, s, ctx) {
  var svg = ctx.svg(512), f = frame(svg, s), X = f.X, Y = f.Y, bx = f.box, pts = s.points, n = pts.length, P = pts.map(function (p) { return [X(p.x), Y(p.y)] }), taken = [];
  P.forEach(function (p) { taken.push({ l: p[0] - 9, r: p[0] + 9, t: p[1] - 9, b: p[1] + 9 }) });
  u.segBoxes(P).forEach(function (b) { taken.push(b) });
  (s.notes || []).forEach(function (m) { var q = P[m.at], tw = h.textW(m.text, 13.5, true) + 20, tx = Math.max(bx.l + 4, Math.min(bx.r - tw, q[0] + (m.dx || 0))), ty = q[1] + (m.dy || 0); m._r = { x: tx, y: ty, w: tw }; taken.push({ l: tx - 3, r: tx + tw + 3, t: ty - 17, b: ty + 15 }) });
  var pl = u.placer(taken, { l: bx.l + 2, r: bx.r, t: bx.t, b: bx.b + 4 });
  for (var k = 0; k < n - 1; k++) { var a = P[k], b = P[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, at = 300 + k * 240, last = k === n - 2;
    E('path', { d: 'M' + (a[0] + ux * 8).toFixed(1) + ' ' + (a[1] + uy * 8).toFixed(1) + ' L' + (b[0] - ux * 9).toFixed(1) + ' ' + (b[1] - uy * 9).toFixed(1), fill: 'none', stroke: last ? C.dark : C.g65, 'stroke-width': last ? 3.2 : 2.4, 'data-at': at, 'data-fx': 'draw', 'data-ms': 220 }, svg);
    var mx = b[0] - ux * 22, my = b[1] - uy * 22; E('path', { d: 'M' + (mx + ux * 8) + ' ' + (my + uy * 8) + ' L' + (mx - uy * 5.5) + ' ' + (my + ux * 5.5) + ' L' + (mx + uy * 5.5) + ' ' + (my - ux * 5.5) + ' Z', fill: last ? C.dark : C.g65, 'data-at': at + 120, 'data-fx': 'fade' }, svg) }
  var gp = h.at(svg, 300 + n * 240, { 'data-fx': 'fade' });
  P.forEach(function (p, i) { var hi = pts[i].hi, first = i === 0, lastp = i === n - 1, r = lastp ? 10 : (first ? 8 : 6.5);
    E('circle', { cx: p[0], cy: p[1], r: r, fill: first ? '#fff' : (lastp ? C.dark : C.g65), stroke: first || lastp ? C.dark : '#fff', 'stroke-width': first ? 3 : 2 }, gp);
    pl.place(gp, p[0], p[1], pts[i].label, { size: lastp ? 16 : 13.5, color: lastp ? C.dark : (hi ? C.warn : C.sub), r: lastp ? 15 : 12 }) });
  (s.notes || []).forEach(function (m, k) { var g = h.at(svg, 300 + n * 240 + 400 + k * 250, { 'data-fx': 'fade' }), tw = m._r.w, tx = m._r.x, ty = m._r.y;
    E('rect', { x: tx, y: ty - 15, width: tw, height: 28, rx: 14, fill: m.tone === 'warn' ? C.warn : C.dark }, g); T(g, tx + tw / 2, ty + 4, m.text, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' }) });
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxscat 산점 + 추세선 + 지금 점 ───── */
ECOM.parts.dxscat = function (bd, s, ctx) {
  var svg = ctx.svg(512), f = frame(svg, s), X = f.X, Y = f.Y, bx = f.box, pts = s.points, tr = s.trend, xo = s.x, taken = [];
  var gt = h.at(svg, 200, { 'data-fx': 'fade', 'data-ms': 700 }); if (tr) { var xa = tr.from != null ? tr.from : xo.min, xb = tr.to != null ? tr.to : xo.max;
    E('line', { x1: X(xa), y1: Y(tr.a + tr.b * xa), x2: X(xb), y2: Y(tr.a + tr.b * xb), stroke: C.dark, 'stroke-width': 2.6, 'stroke-dasharray': '8 5' }, gt);
    var tw = h.textW(tr.text, 13, true) + 18; E('rect', { x: X(xb) - tw - 4, y: Y(tr.a + tr.b * xb) - 38, width: tw, height: 24, rx: 12, fill: C.dark }, gt); T(gt, X(xb) - tw / 2 - 4, Y(tr.a + tr.b * xb) - 21.5, tr.text, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    taken.push({ l: X(xb) - tw - 6, r: X(xb), t: Y(tr.a + tr.b * xb) - 40, b: Y(tr.a + tr.b * xb) - 12 }) }
  pts.forEach(function (p) { var r = p.now ? 11 : 6.5; taken.push({ l: X(p.x) - r - 2, r: X(p.x) + r + 2, t: Y(p.y) - r - 2, b: Y(p.y) + r + 2 }) });
  var pl = u.placer(taken, { l: bx.l + 2, r: bx.r + 4, t: bx.t, b: bx.b });
    var gp = h.at(svg, 800, { 'data-fx': 'fade', 'data-ms': 600 }); pts.forEach(function (p) { if (p.now) return; E('circle', { cx: X(p.x), cy: Y(p.y), r: 6.5, fill: C.g65, stroke: '#fff', 'stroke-width': 1.6, opacity: .95 }, gp) });
  var gl = h.at(svg, 1200, { 'data-fx': 'fade' }); pts.forEach(function (p) { if (!p.now) pl.place(gl, X(p.x), Y(p.y), p.label, { size: 13, color: C.sub, bold: false, r: 10 }) });
  pts.forEach(function (p) { if (!p.now) return; if (tr) { var gq = h.at(svg, 1500, { 'data-fx': 'fade' }); E('line', { x1: X(p.x), x2: X(p.x), y1: Y(p.y), y2: Y(tr.a + tr.b * p.x), stroke: C.warn, 'stroke-width': 3, 'stroke-dasharray': '4 3' }, gq) } var gn = h.at(svg, 1600, { 'data-fx': 'pop' }); E('circle', { cx: X(p.x), cy: Y(p.y), r: 11, fill: C.warn, stroke: '#fff', 'stroke-width': 2.4 }, gn);
    var g2 = h.at(svg, 1800, { 'data-fx': 'fade' }); pl.place(g2, X(p.x), Y(p.y), p.label, { size: 16, color: C.warn, r: 16 }) });
  if (s.callout) { var c = s.callout, gc = h.at(svg, 2100, { 'data-fx': 'fade' }), cw = 250, cx = c.x != null ? c.x : bx.l + 14, cy = c.y != null ? c.y : bx.t + 8;
    E('rect', { x: cx, y: cy, width: cw, height: 78, rx: 10, fill: '#fff', stroke: C.warn, 'stroke-width': 2 }, gc); T(gc, cx + 14, cy + 36, c.big, { 'font-size': 32, 'font-weight': 700, fill: C.warn }); T(gc, cx + 14, cy + 62, c.sub, { 'font-size': 13, 'font-weight': 700, fill: C.mute }) }
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxquad 4분면 위 이동 경로 ───── */
ECOM.parts.dxquad = function (bd, s, ctx) {
  var px = s.x.pivot, py = s.y.pivot, tones = s.tones || ['warn', 'soft', 'soft', 'main'], nm = s.names;
  var f = frame(svg0(ctx), s, { tint: function (g, X, Y, bx) { var xs = [bx.l, X(px), bx.r], ys = [bx.t, Y(py), bx.b], fills = { warn: '#F6E4DB', main: C.g18, soft: C.g08 };
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (q, k) { E('rect', { x: xs[q[0]], y: ys[q[1]], width: xs[q[0] + 1] - xs[q[0]], height: ys[q[1] + 1] - ys[q[1]], fill: fills[tones[k]] }, g) });
      [[bx.l + 12, bx.t + 26, 'start', 0], [bx.r - 12, bx.t + 26, 'end', 1], [bx.l + 12, bx.b - 28, 'start', 2], [bx.r - 12, bx.b - 28, 'end', 3]].forEach(function (c) { var t = nm[c[3]], col = tones[c[3]] === 'warn' ? C.warn : C.dark;
        T(g, c[0], c[1], t.t, { 'text-anchor': c[2], 'font-size': 18, 'font-weight': 700, fill: col }); if (t.s) T(g, c[0], c[1] + 20, t.s, { 'text-anchor': c[2], 'font-size': 13, 'font-weight': 600, fill: C.mute }) });
      E('line', { x1: X(px), x2: X(px), y1: bx.t, y2: bx.b, stroke: C.dark, 'stroke-width': 2 }, g); E('line', { x1: bx.l, x2: bx.r, y1: Y(py), y2: Y(py), stroke: C.dark, 'stroke-width': 2 }, g) } }), svg = f.svg;
  var X = f.X, Y = f.Y, bx = f.box, pts = s.points, n = pts.length, P = pts.map(function (p) { return [X(p.x), Y(p.y)] }), taken = [];
  [[bx.l, bx.t, 260, 52], [bx.r - 260, bx.t, 260, 52], [bx.l, bx.b - 52, 260, 52], [bx.r - 260, bx.b - 52, 260, 52]].forEach(function (b) { taken.push({ l: b[0], r: b[0] + b[2], t: b[1], b: b[1] + b[3] }) });
  P.forEach(function (p) { taken.push({ l: p[0] - 9, r: p[0] + 9, t: p[1] - 9, b: p[1] + 9 }) }); u.segBoxes(P).forEach(function (b) { taken.push(b) });
  var pl = u.placer(taken, { l: bx.l + 2, r: bx.r, t: bx.t, b: bx.b });
  for (var k = 0; k < n - 1; k++) { var a = P[k], b = P[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, at = 300 + k * 260, last = k === n - 2;
    E('path', { d: 'M' + (a[0] + ux * 8).toFixed(1) + ' ' + (a[1] + uy * 8).toFixed(1) + ' L' + (b[0] - ux * 9).toFixed(1) + ' ' + (b[1] - uy * 9).toFixed(1), fill: 'none', stroke: last ? C.dark : C.cmp, 'stroke-width': last ? 3.2 : 2.2, opacity: last ? 1 : .55 + k / n * .4, 'data-at': at, 'data-fx': 'draw', 'data-ms': 240 }, svg);
    var mx = b[0] - ux * 22, my = b[1] - uy * 22; E('path', { d: 'M' + (mx + ux * 8) + ' ' + (my + uy * 8) + ' L' + (mx - uy * 5.5) + ' ' + (my + ux * 5.5) + ' L' + (mx + uy * 5.5) + ' ' + (my - ux * 5.5) + ' Z', fill: last ? C.dark : C.cmp, 'data-at': at + 130, 'data-fx': 'fade' }, svg) }
  var gp = h.at(svg, 300 + n * 260, { 'data-fx': 'fade' });
  P.forEach(function (p, i) { var first = i === 0, lastp = i === n - 1; E('circle', { cx: p[0], cy: p[1], r: lastp ? 10 : first ? 8 : 6.5, fill: first ? '#fff' : lastp ? C.dark : C.cmp, stroke: first || lastp ? C.dark : '#fff', 'stroke-width': first ? 3 : 2 }, gp);
    pl.place(gp, p[0], p[1], pts[i].label, { size: lastp ? 16 : 13.5, color: lastp ? C.dark : C.sub, r: lastp ? 15 : 12 }) });
  ctx.root.setAttribute('data-gap', 300) };
function svg0(ctx) { var sv = ctx.svg(512); sv._ = 1; svg0.last = sv; return sv }
})();
