/* pile — 큰 숫자 + 단위 블록(양을 눈으로 보임, 5판 영상 부품).
   배치 bricks : 아래 띠에 큰 숫자 · 벽돌이 피라미드로 쌓임 · 칸 value dec unit unitName(예 '조 원') per(벽돌 1개 값) hi(강조 벽돌 수) hiLabel label facts[{k,v}] caption
   배치 grid   : 흩어진 점이 100칸 격자로 정렬 · 칸 value(100칸 중 몇 칸, 소수 가능) dec unit label sub dotLabel restLabel
   배치 two    : 덩어리 둘(넓이 = 값) + 아래 숫자 칩 · 칸 a{name,value,label} b{…} dec unit ratio note
   움직임은 _hook 이나 data-at · data-fx 로만(기본 그림 = 끝 모습) */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T;
function rnd(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }
function chip(p, x, y, txt, o) { o = o || {}; var fs = o.fs || 15, w = h.textW(txt, fs, 1) + 28, g = E('g', o.attr || {}, p);
  E('rect', { x: x, y: y, width: w, height: fs + 18, rx: (fs + 18) / 2, fill: o.fill }, g); T(g, x + 14, y + fs + 4, txt, { 'font-size': fs, 'font-weight': 700, fill: o.ink }); return w }
function para(p, x, y, txt, fs, maxW, fill, at, anchor) { var g = E('g', { 'data-at': at, 'data-fx': 'fade', 'data-ms': 500 }, p); h.wrap(txt || '', fs, maxW).forEach(function (ln, i) { T(g, x, y + i * fs * 1.45, ln, { 'font-size': fs, fill: fill, 'text-anchor': anchor || 'start' }) }); return g }

function bricks(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), dec = s.dec || 0, N = Math.max(1, Math.round(s.value / (s.per || 1))), rows = [], base = 1, left = N;
  while (base * (base + 1) / 2 < N) base++; if (base > 11) base = 11;
  for (var b = base; b >= 1 && left > 0; b--) { var c = Math.min(b, left); rows.push(c); left -= c }
  var bw = Math.min(96, 640 / base), bh = Math.min(bw * .46, 300 / rows.length - 3), gp = 3, cx = 760, by = 340, hi = s.hi || 0, placed = 0, tot = rows.reduce(function (a, c) { return a + c }, 0);
  var bandFill = dk ? '#FFFFFF' : P.g08, bandInk = dk ? '#003D2B' : P.ink, bandSub = dk ? '#3E4743' : P.cmp;
  E('rect', { x: 0, y: 356, width: 1168, height: 150, rx: 14, fill: bandFill, 'data-at': 0, 'data-fx': 'fade' }, svg);
  rows.forEach(function (c, r) { for (var j = 0; j < c; j++) { var x = cx - (c * (bw + gp) - gp) / 2 + j * (bw + gp), y = by - (r + 1) * (bh + gp) + gp, idx = tot - placed - 1, isHi = hi && placed >= tot - hi;
      E('rect', { x: x, y: y, width: bw, height: bh, rx: 3, fill: isHi ? P.warn : (r % 2 ? P.g65 : P.main), 'data-at': 150 + r * 190 + j * 28, 'data-fx': 'drop', 'data-dy': 80, 'data-ms': 520, 'data-key': isHi ? (s.hiLabel || '증가분') : '벽돌' }, svg); placed++ } });
  var fs = 104, vs = h.nf(s.value, dec), uf = 34;
  var nx = 32 + h.textW(vs, fs, 1) * 1.08; T(svg, nx, 356 + 112, vs, { 'font-size': fs, 'text-anchor': 'end', 'font-weight': 800, fill: bandInk, 'data-count': s.value, 'data-dec': dec, 'data-fx': 'count', 'data-at': 150, 'data-ms': Math.max(1200, rows.length * 190 + 300), 'data-key': '값' });
  T(svg, nx + 16, 356 + 112, s.unit || '', { 'font-size': uf, 'font-weight': 800, fill: bandInk, 'data-at': 400, 'data-fx': 'fade' });
  var ux = nx + 16 + h.textW(s.unit || '', uf, 1) + 60; if (ux < 560) ux = 560;
  if (s.caption) para(svg, ux, 356 + 56, s.caption, 20, 1168 - ux - 30, bandSub, 900);
  /* 범례 · 사실 */
  var lg = E('g', { 'data-at': 200, 'data-fx': 'fade' }, svg);
  if (s.label) chip(lg, 0, 0, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark });
  E('rect', { x: 0, y: 56, width: 26, height: 12, rx: 2, fill: P.main }, lg); T(lg, 36, 67, '벽돌 1개 = ' + h.nf(s.per || 1, s.perDec || 0) + (s.unitName || ''), { 'font-size': 15, fill: P.cmp });
  if (hi) { E('rect', { x: 0, y: 84, width: 26, height: 12, rx: 2, fill: P.warn }, lg); T(lg, 36, 95, (s.hiLabel || '증가분') + ' ' + hi + '개', { 'font-size': 15, fill: P.cmp }) }
  (s.facts || []).slice(0, 3).forEach(function (f, i) { var y = 122 + i * 74, g = E('g', { 'data-at': 1200 + i * 300, 'data-fx': 'slide', 'data-dx': -14, 'data-key': f.k }, svg);
    E('rect', { x: 0, y: y, width: 320, height: 62, rx: 10, fill: P.paper, stroke: P.line }, g); E('rect', { x: 0, y: y + 10, width: 5, height: 42, rx: 2, fill: P.main }, g);
    T(g, 20, y + 25, f.k, { 'font-size': 14, fill: P.mute }); T(g, 20, y + 51, f.v, { 'font-size': 22, 'font-weight': 800, fill: P.ink }) });
  ctx.root.setAttribute('data-gap', 300) }

function grid(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), dec = s.dec || 0, v = s.value, full = Math.floor(v + 1e-9), part = +(v - full).toFixed(3), pitch = 44, r = 17, gx0 = 700, gy0 = 38, dots = [], R = rnd(7);
  var neutral = dk ? P.g40 : P.g18, hiCol = P.warn;
  for (var i = 0; i < 100; i++) { var cx = gx0 + (i % 10) * pitch + r + 3, cy = gy0 + Math.floor(i / 10) * pitch + r, on = i < full, g = E('g', { 'data-key': on ? (s.dotLabel || '해당') : (s.restLabel || '나머지') }, svg);
    var c = E('circle', { cx: cx, cy: cy, r: r, fill: on ? hiCol : neutral }, g); if (!on && i === full && part > 0) { var a = part * Math.PI * 2, x2 = cx + r * Math.sin(a), y2 = cy - r * Math.cos(a); E('path', { d: 'M' + cx + ' ' + cy + 'L' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2) + 'Z', fill: hiCol }, g) }
    dots.push({ g: g, on: on || (i === full && part > 0), c: c, dx: (R() - .5) * 560, dy: (R() - .5) * 420, d: R() * 700, cx: cx, cy: cy }) }
  if (s.label) chip(svg, 0, 4, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  var vs = h.nf(v, dec), fs = 176;
  T(svg, 0, 214, vs, { 'font-size': fs, 'font-weight': 800, fill: P.warn, 'data-count': v, 'data-dec': dec, 'data-fx': 'count', 'data-at': 200, 'data-ms': 1200, 'data-key': '값' });
  T(svg, h.textW(vs, fs, 1) * 1.04 + 16, 214, s.unit || '', { 'font-size': 52, 'font-weight': 800, fill: P.warn, 'data-at': 500, 'data-fx': 'fade' });
  if (s.sub) para(svg, 0, 272, s.sub, 23, 600, P.ink, 1300);
  var lg = E('g', { 'data-at': 1700, 'data-fx': 'fade' }, svg); E('circle', { cx: 12, cy: 394, r: 10, fill: hiCol }, lg); T(lg, 32, 400, (s.dotLabel || '해당') + ' ' + h.nf(v, dec) + '칸', { 'font-size': 17, fill: P.cmp });
  E('circle', { cx: 12, cy: 432, r: 10, fill: neutral }, lg); T(lg, 32, 438, (s.restLabel || '나머지') + ' ' + h.nf(100 - v, dec) + '칸', { 'font-size': 17, fill: P.cmp }); T(lg, 0, 480, s.cell || '한 칸 = 100 중 1', { 'font-size': 14, fill: P.mute });
  ctx.root._hook = function (root) { if (h.RM()) return 0; var end = 0;
    dots.forEach(function (q) { var d = q.d, a = q.g.animate([{ opacity: 0, transform: 'translate(' + q.dx.toFixed(0) + 'px,' + q.dy.toFixed(0) + 'px)' }, { opacity: 1, transform: 'translate(0,0)' }], { duration: 800, delay: d, easing: 'cubic-bezier(.3,0,.2,1)', fill: 'backwards' }); end = Math.max(end, 800 + d);
      if (q.on) q.c.animate([{ fill: neutral }, { fill: neutral, offset: .75 }, { fill: hiCol }], { duration: 1000, delay: 1100, easing: 'ease-out', fill: 'backwards' }) });
    return Math.max(end, 2100) };
  ctx.root.setAttribute('data-gap', 300) }

function blob(g, cx, cy, R, c1, c2, seed) { var q = rnd(seed), k = R / .92, n = 10; E('circle', { cx: cx, cy: cy, r: k * .8, fill: c1 }, g);
  for (var i = 0; i < n; i++) { var a = (i / n + (q() - .5) * .05) * Math.PI * 2; E('circle', { cx: cx + Math.cos(a) * k * .62, cy: cy + Math.sin(a) * k * .62, r: k * (.27 + q() * .05), fill: c1 }, g) }
  for (var m = 0; m < 4; m++) { var b = q() * Math.PI * 2, d = Math.sqrt(q()) * k * .24; E('circle', { cx: cx + Math.cos(b) * d, cy: cy + Math.sin(b) * d, r: k * (.1 + q() * .07), fill: c2 }, g) } }
function two(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), dec = s.dec || 0, A = s.a, B = s.b, mx = Math.max(A.value, B.value), Rm = 140, base = 330, xa = 250, xb = 918;
  var items = [[A, xa, P.main, P.g65, 11, P.main], [B, xb, P.warn, dk ? '#FFC2A8' : '#D98A66', 23, P.warn]];
  if (s.label) chip(svg, 0, 0, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  [0, 668].forEach(function (px) { E('rect', { x: px, y: 40, width: 500, height: base - 30, rx: 16, fill: P.paper, stroke: P.line, 'data-at': 0, 'data-fx': 'fade' }, svg) });
  items.forEach(function (q, i) { var it = q[0], R = Rm * Math.sqrt(it.value / mx), cx = q[1], cy = base - R, t = i * 500;
    var g = E('g', { 'data-key': it.name, 'data-at': 150 + t, 'data-fx': 'zoom', 'data-ms': 800 }, svg); blob(g, cx, cy, R, q[2], q[3], q[4]);
    var vs = h.nf(it.value, dec) + (s.unit || ''), fs = 32, w = h.textW(vs, fs, 1) + 44, cg = E('g', { 'data-at': 600 + t, 'data-fx': 'slide', 'data-dy': 8, 'data-key': it.name }, svg);
    E('rect', { x: cx - w / 2, y: 366, width: w, height: 56, rx: 10, fill: q[5] }, cg);
    T(cg, cx, 366 + 40, vs, { 'font-size': fs, 'font-weight': 800, fill: '#FFFFFF', 'text-anchor': 'middle', 'data-count': it.value, 'data-dec': dec, 'data-suf': s.unit || '', 'data-fx': 'count', 'data-at': 700 + t, 'data-ms': 900 });
    T(cg, cx, 454, it.name, { 'font-size': 20, 'font-weight': 700, fill: P.ink, 'text-anchor': 'middle' }); if (it.label) T(cg, cx, 480, it.label, { 'font-size': 14, fill: P.mute, 'text-anchor': 'middle' }) });
  var ratio = s.ratio || ('약 ' + h.nf(mx / Math.min(A.value, B.value), 1) + '배'), rw = h.textW(ratio, 30, 1) + 44, rg = E('g', { 'data-at': 1600, 'data-fx': 'pop', 'data-key': '비교' }, svg);
  E('rect', { x: 584 - rw / 2, y: 150, width: rw, height: 56, rx: 28, fill: dk ? '#FFFFFF' : P.dark }, rg); T(rg, 584, 150 + 39, ratio, { 'font-size': 30, 'font-weight': 800, fill: dk ? '#003D2B' : '#FFFFFF', 'text-anchor': 'middle' });
  T(svg, 584, 232, '넓이 = 값', { 'font-size': 14, fill: P.mute, 'text-anchor': 'middle', 'data-at': 1700, 'data-fx': 'fade' });
    ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.pile = function (bd, s, ctx) { var L = s.layout || 'bricks'; ({ bricks: bricks, grid: grid, two: two }[L] || bricks)(bd, s, ctx) };
ECOM.parts.pile.layouts = ['default', 'bricks', 'grid', 'two'];
ECOM.parts.pile.dark = ['default', 'bricks', 'grid', 'two'];
})();
