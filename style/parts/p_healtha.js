/* p_healtha.js — 건강 · 제약 계열 A 전용 배치(P6 A, V301 · V302 · V307). 기본 그림 = 끝 모습, 움직임은 data-at · _hook 에서만.
   hxpills : 임상 알약 100개 — 오른쪽 10×10 알약이 멈춘 단계별 색으로 칠해지고 왼쪽 단계 사다리가 범례
             칸 label · start{label,value} · stages[{name,count,pass,tone:'gray|warn|yellow|white|main'}]×5(앞에서부터 일찍 멈춘 순, 마지막 = 허가) · result{text} · unitNote
   hxcal   : 한 해 달력 12칸 — 심사 기한일 · 허가 · 보완 요구 날짜에 표시
             칸 year(숫자) · marks[{m(0~11),d,kind:'due|ok|fix'}] · legend{due,ok,fix} · summary
   hxflow  : 두 줄 흐름 — 위 줄(약)은 왼쪽 → 오른쪽, 아래 줄(돈)은 오른쪽 → 왼쪽, 아래 점선은 되돌려 주는 돈
             칸 lanes[{title,tone:'drug|money',nodes[4]{name,sub},arrows[3]}] · back{label,sub} · result{label,value,unit} */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T;
function chip(p, x, y, txt, o) { o = o || {}; var fs = o.fs || 15, w = h.textW(txt, fs, 1) + 28, g = E('g', o.attr || {}, p);
  E('rect', { x: x, y: y, width: w, height: fs + 18, rx: (fs + 18) / 2, fill: o.fill }, g); T(g, x + 14, y + fs + 4, txt, { 'font-size': fs, 'font-weight': 700, fill: o.ink }); return w }
function pill(p, x, y, w, hh, fill, seam, attr) { var g = E('g', attr || {}, p), r = E('rect', { x: x, y: y, width: w, height: hh, rx: hh / 2, fill: fill }, g);
  E('line', { x1: x + w / 2, x2: x + w / 2, y1: y + 3, y2: y + hh - 3, stroke: seam, 'stroke-width': 1.6, opacity: .4 }, g); return r }

/* ───── hxpills ───── */
ECOM.parts.hxpills = function (bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), st = (s.stages || []).slice(0, 5), n = st.length, seam = dk ? '#003D2B' : '#FFFFFF';
  var TON = dk ? { gray: '#7E9A8F', warn: P.warn, yellow: '#FFE066', white: '#FFFFFF', main: P.main } : { gray: '#9AA3A0', warn: P.warn, yellow: '#D9A400', white: '#4D9E83', main: P.main };
  var ink = dk ? '#003D2B' : '#FFFFFF', neutral = P.g18;
  chip(svg, 0, 0, s.label || '', { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  var sx = 0, rw = 470, ry0 = 52, rp = 90, rh = 80;
  if (s.start) { var sg = E('g', { 'data-at': 0, 'data-fx': 'fade', 'data-key': '시작' }, svg); T(sg, rw, 20, (s.start.label || '') + ' ' + h.nf(s.start.value, 0) + '개', { 'font-size': 16, 'font-weight': 700, fill: P.ink, 'text-anchor': 'end' }) }
  var pills = [], order = [], total = 0;
  st.forEach(function (q, i) { var y = ry0 + i * rp, t = 200 + i * 380, col = TON[q.tone] || TON.gray, g = E('g', { 'data-at': t, 'data-fx': 'slide', 'data-dx': -14, 'data-ms': 600, 'data-key': q.name }, svg);
    if (i > 0) E('path', { d: 'M' + (sx + 42) + ' ' + (y - 9) + 'l6 0l-3 6z', fill: P.mute }, svg);
    E('rect', { x: sx, y: y, width: rw, height: rh, rx: 10, fill: P.paper, stroke: P.line }, g);
    pill(g, sx + 16, y + (rh - 28) / 2, 52, 28, col, seam);
    T(g, sx + 86, y + 33, q.name, { 'font-size': 17, 'font-weight': 700, fill: P.ink });
    T(g, sx + 86, y + 58, q.pass || '', { 'font-size': 13.5, fill: P.mute });
    var cs = h.nf(q.count, 0); T(g, sx + rw - 44, y + 52, cs, { 'font-size': 34, 'font-weight': 800, fill: col, 'text-anchor': 'end', 'data-count': q.count, 'data-dec': 0, 'data-fx': 'count', 'data-at': t + 150, 'data-ms': 700 });
    T(g, sx + rw - 38, y + 52, '개', { 'font-size': 15, fill: P.mute });
    total += q.count });
  /* 알약 100개 : 멀리 간 후보부터 왼쪽 위에 */
  var gx = 560, gy = 44, px = 60, py = 40, k = 0, rev = st.slice().reverse();
  var gl = E('g', { 'data-at': 0, 'data-fx': 'fade' }, svg); T(gl, gx, 22, '알약 1개 = 후보 1개', { 'font-size': 15, 'font-weight': 700, fill: P.dark });
  rev.forEach(function (q, ri) { var si = n - 1 - ri, col = TON[q.tone] || TON.gray;
    for (var j = 0; j < q.count; j++) { var cx = gx + (k % 10) * px, cy = gy + Math.floor(k / 10) * py;
      var r = pill(svg, cx, cy, 50, 26, col, seam, { 'data-key': q.name }); pills.push({ r: r, to: col, si: si, j: j }); k++ } });
  if (s.result) { var rg = E('g', { 'data-at': 2500, 'data-fx': 'rise', 'data-ms': 600, 'data-key': '결과' }, svg);
    E('rect', { x: gx, y: 456, width: 1168 - gx, height: 50, rx: 12, fill: dk ? P.g18 : P.g08 }, rg);
    T(rg, gx + 20, 488, s.result.text || '', { 'font-size': 20, 'font-weight': 700, fill: P.ink }) }
  ctx.root._reset = function () { };
  ctx.root._hook = function (root) { if (h.RM()) return 0; var end = 0;
    pills.forEach(function (q) { var d = 200 + q.si * 380 + q.j * 16; q.r.animate([{ fill: neutral }, { fill: neutral, offset: .01 }, { fill: q.to }], { duration: 420, delay: d, easing: 'ease-in-out', fill: 'both' }); end = Math.max(end, d + 420) });
    return end };
  ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.hxpills.layouts = ['default']; ECOM.parts.hxpills.dark = ['default'];

/* ───── hxcal ───── */
ECOM.parts.hxcal = function (bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), yr = s.year || 2026, mk = {}, order = [], lg = s.legend || {}, WD = ['일', '월', '화', '수', '목', '금', '토'];
  var COL = { due: { fill: dk ? P.paper : '#FFFFFF', stroke: P.ink, ink: P.ink }, ok: { fill: P.main, stroke: P.main, ink: dk ? '#003D2B' : '#FFFFFF' }, fix: { fill: P.warn, stroke: P.warn, ink: dk ? '#003D2B' : '#FFFFFF' } };
  (s.marks || []).forEach(function (q) { mk[q.m + '-' + q.d] = q; order.push(q) }); order.sort(function (a, b) { return a.m * 40 + a.d - (b.m * 40 + b.d) });
  var pw = 280, ph = 152, gp = 16, cw = (pw - 28) / 7, ch = 17.5, cnt = { due: 0, ok: 0, fix: 0 };
  function shape(p, kind, cx, cy, r, ex) { var c = COL[kind], g = E('g', ex || {}, p);
    if (kind === 'fix') E('rect', { x: cx - r * .86, y: cy - r * .86, width: r * 1.72, height: r * 1.72, rx: 2, transform: 'rotate(45 ' + cx + ' ' + cy + ')', fill: c.fill }, g);
    else E('circle', { cx: cx, cy: cy, r: r, fill: c.fill, stroke: c.stroke, 'stroke-width': kind === 'due' ? 2 : 0 }, g); return g }
  for (var m = 0; m < 12; m++) { var col = m % 4, row = Math.floor(m / 4), x0 = col * (pw + gp), y0 = row * (ph + 4), first = new Date(yr, m, 1).getDay(), days = new Date(yr, m + 1, 0).getDate();
    var g = E('g', { 'data-at': m * 45, 'data-fx': 'fade', 'data-ms': 400 }, svg);
    E('rect', { x: x0, y: y0, width: pw, height: ph, rx: 10, fill: P.paper, stroke: P.line }, g);
    T(g, x0 + 14, y0 + 21, (m + 1) + '월', { 'font-size': 15, 'font-weight': 700, fill: P.dark });
    WD.forEach(function (w, i) { T(g, x0 + 14 + cw * i + cw / 2, y0 + 38, w, { 'font-size': 12.5, fill: P.mute, 'text-anchor': 'middle' }) });
    for (var d = 1; d <= days; d++) { var idx = first + d - 1, cx = x0 + 14 + cw * (idx % 7) + cw / 2, cy = y0 + 53 + Math.floor(idx / 7) * ch, q = mk[m + '-' + d];
      if (q) { cnt[q.kind]++; continue }
      T(g, cx, cy + 4.5, String(d), { 'font-size': 12.5, fill: P.mute, 'text-anchor': 'middle' }) } }
  order.forEach(function (q, i) { var m0 = q.m, col = m0 % 4, row = Math.floor(m0 / 4), x0 = col * (pw + gp), y0 = row * (ph + 4), first = new Date(yr, m0, 1).getDay(), idx = first + q.d - 1,
      cx = x0 + 14 + cw * (idx % 7) + cw / 2, cy = y0 + 53 + Math.floor(idx / 7) * ch, c = COL[q.kind], g = shape(svg, q.kind, cx, cy, 8.6, { 'data-at': 500 + i * 230, 'data-fx': 'pop', 'data-ms': 360, 'data-key': lg[q.kind] || q.kind });
    T(g, cx, cy + 4.5, String(q.d), { 'font-size': 12.5, 'font-weight': 700, fill: c.ink, 'text-anchor': 'middle' }) });
  var ly = 3 * (ph + 4) + 12, lx = 0, lgg = E('g', { 'data-at': 1900, 'data-fx': 'fade' }, svg);
  ['due', 'ok', 'fix'].forEach(function (k) { shape(lgg, k, lx + 10, ly + 8, 8.6); var t = (lg[k] || k) + ' ' + cnt[k] + '건'; T(lgg, lx + 26, ly + 13, t, { 'font-size': 15, 'font-weight': 700, fill: P.ink }); lx += 26 + h.textW(t, 15, 1) + 30 });
  if (s.summary) T(lgg, 1168, ly + 13, s.summary, { 'font-size': 14, fill: P.mute, 'text-anchor': 'end' });
  ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.hxcal.layouts = ['default']; ECOM.parts.hxcal.dark = [];

/* ───── hxflow ───── */
ECOM.parts.hxflow = function (bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), lanes = (s.lanes || []).slice(0, 2), NW = 214, NH = 96, GAP = (1168 - 4 * NW) / 3, back = s.back || null;
  var COLS = { drug: P.main, money: dk ? '#FFE066' : P.cmp }, INK = dk ? '#003D2B' : '#FFFFFF', Y = [58, 268];
  function xAt(c) { return c * (NW + GAP) }
  function head(p, x, y, dir, col, at) { var d = dir > 0 ? 'M' + x + ' ' + y + 'l-10 -6l0 12z' : 'M' + x + ' ' + y + 'l10 -6l0 12z'; return E('path', { d: d, fill: col, 'data-at': at, 'data-fx': 'fade', 'data-ms': 300 }, p) }
  lanes.forEach(function (ln, li) { var y = Y[li], col = COLS[ln.tone] || P.main, dir = li === 0 ? 1 : -1, t0 = li === 0 ? 0 : 1000, nodes = (ln.nodes || []).slice(0, 4), ar = ln.arrows || [];
    chip(svg, 0, y - 50, ln.title || '', { fs: 16, fill: col, ink: INK, attr: { 'data-at': t0, 'data-fx': 'fade' } });
    if (ln.sub) T(svg, h.textW(ln.title || '', 16, 1) + 28 + 16, y - 25, ln.sub, { 'font-size': 14, fill: P.mute, 'data-at': t0, 'data-fx': 'fade' });
    nodes.forEach(function (nd, i) { var c = dir > 0 ? i : 3 - i, x = xAt(c), g = E('g', { 'data-at': t0 + i * 200, 'data-fx': 'pop', 'data-ms': 420, 'data-key': nd.name }, svg);
      E('rect', { x: x, y: y, width: NW, height: NH, rx: 12, fill: P.paper, stroke: col, 'stroke-width': 2 }, g);
      T(g, x + 18, y + 33, nd.name, { 'font-size': 19, 'font-weight': 700, fill: P.ink });
      h.wrap(nd.sub || '', 13.5, NW - 32).slice(0, 2).forEach(function (l, q) { T(g, x + 18, y + 57 + q * 19, l, { 'font-size': 13.5, fill: P.cmp }) }) });
    for (var i = 0; i < nodes.length - 1; i++) { var c0 = dir > 0 ? i : 3 - i, xa = dir > 0 ? xAt(c0) + NW + 4 : xAt(c0) - 4, xb = dir > 0 ? xa + GAP - 8 : xa - GAP + 8, ya = y + NH / 2, at = t0 + 120 + i * 200;
      E('line', { x1: xa, x2: dir > 0 ? xb - 8 : xb + 8, y1: ya, y2: ya, stroke: col, 'stroke-width': 3, 'data-at': at, 'data-fx': 'draw', 'data-ms': 320 }, svg); head(svg, xb, ya, dir, col, at + 250);
      if (ar[i]) T(svg, (xa + xb) / 2, ya - 11, ar[i], { 'font-size': 13.5, 'font-weight': 700, fill: P.ink, 'text-anchor': 'middle', 'data-at': at, 'data-fx': 'fade' }) } });
  if (back) { var y2 = Y[1] + NH, xa = xAt(0) + NW / 2, xb = xAt(1) + NW / 2, dp = 46, g = E('g', { 'data-at': 1900, 'data-fx': 'fade', 'data-ms': 500, 'data-key': '되돌려 주는 돈' }, svg);
    E('path', { d: 'M' + xa + ' ' + (y2 + 4) + 'C' + xa + ' ' + (y2 + dp) + ' ' + xb + ' ' + (y2 + dp) + ' ' + xb + ' ' + (y2 + 12), fill: 'none', stroke: P.warn, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g);
    E('path', { d: 'M' + xb + ' ' + (y2 + 4) + 'l-6 10l12 0z', fill: P.warn }, g);
    T(g, (xa + xb) / 2, y2 + dp + 36, back.label || '', { 'font-size': 16, 'font-weight': 700, fill: P.warn, 'text-anchor': 'middle' });
    if (back.sub) T(g, (xa + xb) / 2, y2 + dp + 58, back.sub, { 'font-size': 13.5, fill: P.mute, 'text-anchor': 'middle' }) }
  if (s.result) { var rg = E('g', { 'data-at': 2400, 'data-fx': 'rise', 'data-ms': 600, 'data-key': '결과' }, svg), rx = 640, rw = 1168 - rx, ry = Y[1] + NH + 38;
    E('rect', { x: rx, y: ry, width: rw, height: 64, rx: 12, fill: dk ? P.g18 : P.g08 }, rg);
    T(rg, rx + 22, ry + 40, s.result.label || '', { 'font-size': 17, 'font-weight': 700, fill: P.ink });
    var vs = h.nf(s.result.value, 0); T(rg, rx + rw - 54, ry + 44, vs, { 'font-size': 36, 'font-weight': 800, fill: COLS.money, 'text-anchor': 'end', 'data-count': s.result.value, 'data-dec': 0, 'data-fx': 'count', 'data-at': 2550, 'data-ms': 800 });
    T(rg, rx + rw - 46, ry + 44, s.result.unit || '', { 'font-size': 16, 'font-weight': 700, fill: P.mute }) }
  ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.hxflow.layouts = ['default']; ECOM.parts.hxflow.dark = ['default'];
})();
