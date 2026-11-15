/* p_anatomy.js — anatomy : 그림 풀이 · SVG 도형 그림에 이름 · 값을 꽂는 장. 본문 1168×512.
   parts[3~5]{label, sub, value, at} · fig(callout 용 그림 : chip 반도체 칩 · ship 컨테이너선 · building 아파트 단면)
   s.unit · s.dec · s.cap(왼쪽 아래 설명, 없으면 기본 문구)
   callout  가운데 그림에서 지시선이 뻗어 오른쪽 이름표에 꽂힘. parts[].at = 그림 위 자리 이름(chip a~e · ship cargo/bridge/engine/fuel/hull · building roof/floors/lobby/land), 번호 = 오른쪽 항목
   layers   층 단면(style : strata 물결 지층 · floors 건물 층) — 층 두께 = value, 위에서 아래로 번지며 오른쪽에 층 이름
   explode  원통 조각이 벌어져 이름 · 몫 — 조각 두께 = value, 아래 막대 = 몫
   움직임은 data-at · data-fx 만(기본 DOM = 끝 모습) */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T, K = ECOM.kx, LAY = {}, FIG = {};
function fit(str, size, min, w, bold) { while (size > min && h.textW(str, size, bold ? 1 : 0) > w) size -= .5; return size }
function hasV(o) { return o.value != null && isFinite(+o.value) }
function cap(svg, q, txt) { T(svg, 0, 506, txt, { 'font-size': 12.5, 'font-weight': 600, fill: q.P.mute, 'data-at': 1800, 'data-fx': 'fade' }) }
function ramp(q, N) { var P = q.P; return (q.dk ? [P.main, P.g65, P.g40, P.g18, P.gray] : [P.dark, P.main, P.g65, P.g40, P.g18]).slice(0, N) }
function onOf(q, i, N) { var lt = q.dk ? i < 2 : i < 3; return lt ? q.ON : q.P.ink }
/* 이름표 한 칸 : 번호 원(선택) · 이름 · 값(오른쪽) · 풀이 */
function rowBlock(svg, o, x, yc, w, q, at, s, num, z) { z = z || 1;
  var P = q.P, g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'right', 'data-ms': 440 }, svg), v = hasV(o), dec = s.dec != null ? s.dec : 0, unit = s.unit || '';
  var uw = v ? h.textW(unit, 16, 1) + 2 : 0, nw = v ? h.textW(h.nf(+o.value, dec), 30, 1) : 0, vw = v ? nw + uw + 16 : 0, ind = num ? 42 : 0, tx = x + ind;
  var lf = fit(o.label || '', 23 * z, 15, w - ind - vw, 1), fs = 14.5 * z, lh = 20 * z, sl = o.sub ? h.wrap(o.sub, fs, w - ind, 0).slice(0, 3) : [], bh = 30 * z + (sl.length ? 6 + sl.length * lh : 0), y0 = yc - bh / 2;
  if (num) { E('circle', { cx: x + 15, cy: y0 + 15, r: 15, fill: P.main }, g); T(g, x + 15, y0 + 21, String(num), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: q.ON }) }
  T(g, tx, y0 + 23 * z, o.label || '', { 'font-size': lf, 'font-weight': 700, fill: P.ink });
  if (v) { if (unit) T(g, x + w, y0 + 24, unit, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: P.main });
    T(g, x + w - uw, y0 + 25, h.nf(+o.value, dec), { 'text-anchor': 'end', 'font-size': 30, 'font-weight': 700, fill: P.main, 'data-fx': 'count', 'data-count': +o.value, 'data-dec': dec, 'data-ms': 900 }) }
  sl.forEach(function (t, j) { T(g, tx, y0 + 30 * z + 14 * z + j * lh, t, { 'font-size': fs, fill: P.sub }) });
  return g }
function badge(svg, q, ax, ay, num, at) { var g = E('g', { 'data-at': at, 'data-fx': 'pop', 'data-ms': 360 }, svg);
  E('circle', { cx: ax, cy: ay, r: 14, fill: q.ON, stroke: q.P.main, 'stroke-width': 3.5 }, g); T(g, ax, ay + 5.5, String(num), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: q.P.main }) }

/* ───── callout 용 그림 : 그림을 그리고 자리 이름 → [x,y] 를 돌려줌 ───── */
FIG.chip = function (svg, q, ref) { var P = q.P, g = E('g', { 'data-at': 0, 'data-fx': 'zoom', 'data-ms': 600 }, svg);
  E('rect', { x: 90, y: 56, width: 480, height: 400, rx: 26, fill: P.g08, stroke: P.g40, 'stroke-width': 2.5 }, g);
  for (var i = 0; i < 19; i++) { E('rect', { x: 118 + i * 22, y: 38, width: 9, height: 18, rx: 2, fill: P.g40 }, g); E('rect', { x: 118 + i * 22, y: 456, width: 9, height: 18, rx: 2, fill: P.g40 }, g) }
  for (i = 0; i < 12; i++) { E('rect', { x: 72, y: 84 + i * 30, width: 18, height: 9, rx: 2, fill: P.g40 }, g); E('rect', { x: 570, y: 84 + i * 30, width: 18, height: 9, rx: 2, fill: P.g40 }, g) }
  E('rect', { x: 130, y: 96, width: 400, height: 320, rx: 14, fill: P.g18 }, g);
  var B = { a: [142, 108, 190, 150], b: [342, 108, 176, 84], c: [342, 202, 176, 84], d: [142, 268, 120, 136], e: [272, 296, 246, 108] }, an = { a: [237, 183], b: [430, 150], c: [430, 244], d: [202, 336], e: [430, 382] };
  Object.keys(B).forEach(function (k) { var r = B[k]; E('rect', { x: r[0], y: r[1], width: r[2], height: r[3], rx: 10, fill: ref[k] != null ? P.main : P.g40 }, g);
    for (var y = r[1] + 20; y < r[1] + r[3] - 8; y += 18) E('line', { x1: r[0] + 10, x2: r[0] + r[2] - 10, y1: y, y2: y, stroke: q.ON, 'stroke-opacity': .16 }, g) });
  return an };
FIG.ship = function (svg, q, ref) { var P = q.P, og = E('g', { 'data-at': 0, 'data-fx': 'zoom', 'data-ms': 600 }, svg), g = E('g', { transform: 'translate(0,-70)' }, og);
  E('path', { d: 'M40 344 H630 L590 426 H80 Z', fill: P.g65 }, g);
  E('rect', { x: 70, y: 356, width: 100, height: 56, rx: 6, fill: ref.engine != null ? P.main : P.g40 }, g);
  E('rect', { x: 250, y: 364, width: 150, height: 48, rx: 10, fill: ref.fuel != null ? P.main : P.g40 }, g);
  for (var c = 0; c < 13; c++) { var n = [5, 6, 7, 7, 6, 7, 7, 6, 7, 6, 5, 7, 6][c]; for (var r = 0; r < n; r++) E('rect', { x: 70 + c * 28, y: 344 - (r + 1) * 18, width: 26, height: 17, rx: 2, fill: (c + r) % 2 ? P.g18 : P.g40 }, g) }
  for (c = 0; c < 3; c++) for (r = 0; r < 4; r++) E('rect', { x: 546 + c * 28, y: 344 - (r + 1) * 18, width: 26, height: 17, rx: 2, fill: (c + r) % 2 ? P.g18 : P.g40 }, g);
  E('rect', { x: 462, y: 196, width: 60, height: 148, rx: 4, fill: ref.bridge != null ? P.main : P.g18 }, g); E('rect', { x: 454, y: 188, width: 76, height: 10, rx: 3, fill: ref.bridge != null ? P.main : P.g18 }, g);
  for (r = 0; r < 6; r++) for (c = 0; c < 3; c++) E('rect', { x: 470 + c * 17, y: 208 + r * 20, width: 11, height: 10, rx: 2, fill: q.ON, 'fill-opacity': .55 }, g);
  E('path', { d: 'M0 436 Q22 426 44 436 T88 436 T132 436 T176 436 T220 436 T264 436 T308 436 T352 436 T396 436 T440 436 T484 436 T528 436 T572 436 T616 436 T660 436', fill: 'none', stroke: P.g40, 'stroke-width': 3 }, g);
  return { cargo: [252, 160], bridge: [492, 224], engine: [120, 302], fuel: [325, 320], hull: [602, 292] } };
FIG.building = function (svg, q, ref) { var P = q.P, g = E('g', { 'data-at': 0, 'data-fx': 'zoom', 'data-ms': 600 }, svg), fl = 7, fh = 46;
  E('rect', { x: 20, y: 424, width: 620, height: 66, fill: ref.land != null ? P.g40 : P.well }, g); E('rect', { x: 130, y: 424, width: 400, height: 46, fill: P.g18 }, g);
  E('rect', { x: 118, y: 40, width: 424, height: 18, rx: 4, fill: ref.roof != null ? P.main : P.g40 }, g);
  for (var i = 0; i < fl; i++) { var y = 58 + i * fh; E('rect', { x: 130, y: y, width: 400, height: fh, fill: q.ON, stroke: P.g40, 'stroke-width': 1.5 }, g);
    for (var j = 0; j < 4; j++) E('rect', { x: 152 + j * 92, y: y + 11, width: 64, height: 24, rx: 3, fill: ref.floors != null ? P.main : P.g40 }, g) }
  E('rect', { x: 130, y: 380, width: 400, height: 44, fill: ref.lobby != null ? P.main : P.g65 }, g); E('rect', { x: 296, y: 392, width: 68, height: 32, rx: 3, fill: q.ON, 'fill-opacity': .55 }, g);
  E('line', { x1: 0, x2: 660, y1: 424, y2: 424, stroke: P.ink, 'stroke-width': 2.5 }, g);
  return { roof: [330, 49], floors: [322, 196], lobby: [330, 402], land: [590, 458] } };

LAY.callout = function (svg, s, q) {
  var L = q.L, N = L.length, ref = {}, fig = FIG[s.fig] || FIG.chip; L.forEach(function (o, i) { if (o.at) ref[o.at] = i });
  var an = fig(svg, q, ref), keys = Object.keys(an), x0 = 700, w = 1168 - x0, rh = Math.min(118, 470 / N), P = q.P;
  L.forEach(function (o, i) { var yc = 256 + (i - (N - 1) / 2) * rh, a = an[o.at] || an[keys[i]] || [330, 256], at = 700 + i * 480, d = 'M' + a[0] + ' ' + a[1] + ' L' + (x0 - 40) + ' ' + yc + ' H' + (x0 - 12);
    E('path', { d: d, fill: 'none', stroke: q.ON, 'stroke-width': 6, 'stroke-linejoin': 'round', 'data-at': at, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    E('path', { d: d, fill: 'none', stroke: P.ink, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-at': at, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    E('circle', { cx: x0 - 12, cy: yc, r: 4.5, fill: P.ink, 'data-at': at + 480, 'data-fx': 'pop' }, svg);
    badge(svg, q, a[0], a[1], i + 1, at + 420); rowBlock(svg, o, x0, yc, w, q, at + 440, s);
    if (i) E('line', { x1: x0, x2: 1168, y1: yc - rh / 2, y2: yc - rh / 2, stroke: P.line }, svg) });
  cap(svg, q, s.cap || '번호 = 오른쪽 설명 항목 · 진한 면 = 설명하는 부분') };

LAY.layers = function (svg, s, q) {
  var L = q.L, N = L.length, P = q.P, fl = s.style === 'floors', R = ramp(q, N), tot = L.reduce(function (a, o) { return a + (+o.value || 0) }, 0) || 1, y0 = fl ? 46 : 6, H = 486 - y0, bx0 = fl ? 30 : 0, bx1 = fl ? 530 : 560, x0 = 640, w = 1168 - x0;
  var hs = L.map(function (o) { return fl ? H / N : H * (+o.value || 0) / tot }), small = 0, fixed = 0;
  if (!fl) { hs.forEach(function (v) { if (v < 58) { small++; fixed += 58 } }); var rest = H - fixed, big = hs.reduce(function (a, v) { return a + (v >= 58 ? v : 0) }, 0); hs = hs.map(function (v) { return v < 58 ? 58 : v * rest / big }) }
  var y = y0, dec = s.dec != null ? s.dec : 0, unit = s.unit || '';
  if (fl) { var rg = E('g', { 'data-at': 0, 'data-fx': 'fade' }, svg); E('path', { d: 'M' + (bx0 - 14) + ' ' + (y0 + 2) + ' L' + (bx0 + 60) + ' 4 H' + (bx1 - 60) + ' L' + (bx1 + 14) + ' ' + (y0 + 2) + ' Z', fill: P.cmp }, rg); T(rg, (bx0 + bx1) / 2, 34, s.roof || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: q.ON }) }
  L.forEach(function (o, i) { var ya = y, yb = y + hs[i], yc = (ya + yb) / 2, at = 250 + i * 560, f = R[i], tc = onOf(q, i, N), g, d;
    if (fl) { g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 600 }, svg); E('rect', { x: bx0, y: ya, width: bx1 - bx0, height: hs[i] - 3, fill: f }, g);
      for (var j = 0; j < 3; j++) E('rect', { x: 292 + j * 72, y: yc - Math.min(14, hs[i] * .22), width: 50, height: Math.min(28, hs[i] * .44), rx: 3, fill: tc, 'fill-opacity': .32 }, g) }
    else { var seg = []; for (var xx = 0; xx <= 560; xx += 14) seg.push(xx + ' ' + (ya + 5 * Math.sin(xx / 46 + i * 1.7)).toFixed(1));
      g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 600 }, svg); E('path', { d: 'M' + seg.join(' L') + ' V' + (yb) + ' H0 Z', fill: f, stroke: q.ON, 'stroke-width': 1.5 }, g) }
    if (hasV(o)) { var us = unit ? h.textW(unit, 17, 1) + 3 : 0; T(svg, bx0 + 26, yc + 11, h.nf(+o.value, dec), { 'font-size': 32, 'font-weight': 700, fill: tc, 'data-at': at + 300, 'data-fx': 'count', 'data-count': +o.value, 'data-dec': dec, 'data-ms': 900 });
      if (unit) T(svg, bx0 + 26 + h.textW(h.nf(+o.value, dec), 32, 1) + 6, yc + 11, unit, { 'font-size': 17, 'font-weight': 700, fill: tc, 'data-at': at + 300, 'data-fx': 'fade' }) }
    E('line', { x1: bx1 + 10, x2: x0 - 14, y1: yc, y2: yc, stroke: P.g40, 'stroke-width': 1.4, 'stroke-dasharray': '2 5', 'data-at': at + 400, 'data-fx': 'wipe', 'data-ms': 400 }, svg);
    var p = { label: o.label, sub: o.sub }; rowBlock(svg, p, x0, yc, w, q, at + 520, s, 0, 1.18); y = yb });
  cap(svg, q, s.cap || (fl ? '층 = 항목 · 오른쪽 숫자 = 크기' : '층 두께 = 값의 크기')) };

LAY.explode = function (svg, s, q) {
  var L = q.L, N = L.length, P = q.P, mx = Math.max.apply(null, L.map(function (o) { return +o.value || 0 })) || 1, cols = q.dk ? [P.main, P.g65, P.cmp, P.g40, P.gray] : [P.dark, P.main, P.g65, P.g40, P.g18];
  var ts = L.map(function (o) { return 44 + 132 * (+o.value || 0) / mx }), cap2 = 22, tot = ts.reduce(function (a, v) { return a + v + 2 * cap2 }, 0), gap = Math.max(26, (1088 - tot) / Math.max(1, N - 1)), x = (1168 - tot - gap * (N - 1)) / 2;
  var cs = [], xs = []; L.forEach(function (o, i) { xs.push(x + cap2); cs.push(x + cap2 + ts[i] / 2); x += ts[i] + 2 * cap2 + gap });
  var mid = 584, dist = Infinity; for (var k = 1; k < N; k++) dist = Math.min(dist, cs[k] - cs[k - 1]); var lw = Math.max(120, Math.min(206, dist - 14)), dec = s.dec != null ? s.dec : 0, unit = s.unit || '';
  E('line', { x1: 24, x2: 1144, y1: 176, y2: 176, stroke: P.g40, 'stroke-width': 1.4, 'stroke-dasharray': '2 6', 'data-at': 0, 'data-fx': 'wipe', 'data-ms': 700 }, svg);
  L.forEach(function (o, i) { var cy = 176 - (i - (N - 1) / 2) * 12, ry = 124 - (i % 2) * 10, c = cols[i % 5], t = ts[i], x0 = xs[i], at = 250 + i * 120;
    var g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'slide', 'data-dx': (mid - cs[i]) * .85, 'data-dy': 0, 'data-ms': 800 }, svg);
    E('rect', { x: x0, y: cy - ry, width: t, height: ry * 2, fill: c }, g); E('ellipse', { cx: x0, cy: cy, rx: cap2, ry: ry, fill: c, stroke: q.ON, 'stroke-width': 2 }, g);
    E('ellipse', { cx: x0 + t, cy: cy, rx: cap2, ry: ry, fill: c, stroke: q.ON, 'stroke-width': 2 }, g); E('ellipse', { cx: x0 + t, cy: cy, rx: cap2 * .5, ry: ry * .62, fill: 'none', stroke: q.ON, 'stroke-opacity': .5, 'stroke-width': 2 }, g);
    var lx = cs[i], ta = 1150 + i * 240, lg = E('g', { 'data-key': o.label || '', 'data-at': ta, 'data-fx': 'rise', 'data-ms': 500 }, svg);
    E('line', { x1: lx, x2: lx, y1: cy + ry + 14, y2: 332, stroke: P.g40, 'stroke-width': 1.4, 'stroke-dasharray': '2 4' }, lg);
    E('circle', { cx: lx - lw / 2 + 8, cy: 352, r: 7, fill: c }, lg); T(lg, lx - lw / 2 + 22, 359, o.label || '', { 'font-size': fit(o.label || '', 23, 14, lw - 22, 1), 'font-weight': 700, fill: P.ink });
    if (hasV(o)) { var us = unit ? h.textW(unit, 16, 1) + 3 : 0; T(lg, lx - lw / 2, 404, h.nf(+o.value, dec), { 'font-size': 36, 'font-weight': 700, fill: P.main, 'data-fx': 'count', 'data-count': +o.value, 'data-dec': dec, 'data-ms': 900 });
      if (unit) T(lg, lx - lw / 2 + h.textW(h.nf(+o.value, dec), 36, 1) + 6, 404, unit, { 'font-size': 16, 'font-weight': 700, fill: P.main });
      E('rect', { x: lx - lw / 2, y: 418, width: lw, height: 9, rx: 4, fill: P.line }, lg); E('rect', { x: lx - lw / 2, y: 418, width: Math.max(6, lw * (+o.value) / mx), height: 9, rx: 4, fill: c }, lg) }
    (o.sub ? h.wrap(o.sub, 16.5, lw, 0).slice(0, 2) : []).forEach(function (t, j) { T(lg, lx - lw / 2, 454 + j * 22, t, { 'font-size': 16.5, fill: P.sub }) }) });
  cap(svg, q, s.cap || '원통 두께 · 아래 막대 = 몫의 크기') };

ECOM.parts.anatomy = function (bd, s, ctx) {
  var P = ctx.P, svg = K.svg(ctx), q = { P: P, dk: ctx.dark, ON: ctx.dark ? P.bg : '#fff', L: (s.parts || []).slice(0, 5) }, f = LAY[s.layout] || LAY.callout;
  f(svg, s, q);
  ctx.root.setAttribute('data-gap', 380) };
ECOM.parts.anatomy.layouts = ['default', 'callout', 'layers', 'explode'];
ECOM.parts.anatomy.dark = ['default', 'callout', 'layers', 'explode'];
})();
