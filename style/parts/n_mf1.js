/* mf 계열 1(돈 · 물자 흐름, F06 2차) — mfbook · mftank · mfring · mfshift · mfexch · mfroute · mffunnel · mfchord · mflev
   공통 도움 ECOM.mf(글 · 맞춤 · 화살 · 둥근 상자). 형식 = style/SCHEMA4_F06.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
var M = ECOM.mf = { n: 0 };
M.fit = function (s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size };
M.t = function (g, x, y, s, size, o) { o = o || {}; return T(g, x, y, s, { 'text-anchor': o.a || 'middle', 'font-size': size, 'font-weight': o.b === 0 ? 500 : 700, fill: o.c || C.ink }) };
M.rect = function (g, x, y, w, hh, fill, o) { o = o || {}; return E('rect', { x: x, y: y, width: w, height: Math.max(.5, hh), rx: o.rx == null ? 4 : o.rx, fill: fill, stroke: o.stroke || 'none', 'stroke-width': o.sw || 1.6, 'stroke-dasharray': o.dash || null, opacity: o.op }, g) };
M.dark = function (c) { return c === C.dark || c === C.main || c === C.cmp || c === C.g65 || c === C.warn };
M.tone = function (n, d) { var m = { main: C.main, dark: C.dark, g65: C.g65, g40: C.g40, g18: C.g18, g08: C.g08, cmp: C.cmp, gray: C.gray, light: C.light, warn: C.warn }; return m[n] || d || C.main };
M.id = function () { return 'mf' + (++M.n) };

/* ───────── mfbook — 중앙은행 장부(T 계정) 두 시점 비교 ─────────
   books[2]{title,date,total(글),assets:[{name,value,tone}],liabs:[{name,value,tone}]} · deltas[{name,d,sub}] · deltaTitle · unit */
ECOM.parts.mfbook = function (bd, s, ctx) {
  var svg = ctx.svg(512), bk = (s.books || []).slice(0, 2), BASE = 440, HH = 372, mx = 0, TW = 440;
  bk.forEach(function (b) { b._t = b.liabs.reduce(function (a, o) { return a + o.value }, 0); mx = Math.max(mx, b._t) });
  bk.forEach(function (b, bi) {
    var x0 = bi ? 1168 - TW : 0, ht = HH * b._t / mx, AW = 178, LX = x0 + AW + 12, LW = TW - AW - 12, t0 = bi * 900 + 100, top = BASE - ht;
    var g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 420 });
    E('line', { x1: x0, y1: BASE + 2, x2: x0 + TW, y2: BASE + 2, stroke: C.ink, 'stroke-width': 3 }, g);
    E('line', { x1: x0 + AW + 6, y1: top - 26, x2: x0 + AW + 6, y2: BASE + 2, stroke: C.ink, 'stroke-width': 3 }, g);
    M.t(g, x0 + AW / 2, top - 8, '자산 ' + b.total, 15, { c: C.cmp }); M.t(g, LX + LW / 2, top - 8, '부채 · 자본 ' + b.total, 15, { c: C.cmp });
    M.t(g, x0 + TW / 2, BASE + 30, b.title, 17, { c: C.ink }); M.t(g, x0 + TW / 2, BASE + 50, b.date, 12.5, { c: C.mute, b: 0 });
    var y = BASE;
    (b.assets || []).forEach(function (o, i) { var hh = HH * o.value / mx, c = M.tone(o.tone, C.dark); y -= hh;
      var gg = h.at(svg, t0 + 250 + i * 120, { 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 520 }); M.rect(gg, x0, y, AW, hh - 2, c, { rx: 3 });
      var gt = h.at(svg, t0 + 650, { 'data-fx': 'fade' }); M.t(gt, x0 + AW / 2, y + hh / 2 - 4, o.name, 17, { c: M.dark(c) ? '#fff' : C.ink }); M.t(gt, x0 + AW / 2, y + hh / 2 + 20, o.label, 21, { c: M.dark(c) ? '#fff' : C.ink }) });
    y = BASE;
    (b.liabs || []).forEach(function (o, i) { var hh = HH * o.value / mx, c = M.tone(o.tone, C.main); y -= hh;
      var gg = h.at(svg, t0 + 250 + i * 120, { 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 520 }); M.rect(gg, LX, y, LW, hh - 2, c, { rx: 3 });
      var gt = h.at(svg, t0 + 650, { 'data-fx': 'fade' }), tc = M.dark(c) ? '#fff' : C.ink;
      if (hh < 12) { } else if (hh >= 44) { M.t(gt, LX + 14, y + hh / 2 - 2, o.name, 15, { a: 'start', c: tc }); M.t(gt, LX + 14, y + hh / 2 + 18, o.label, 14, { a: 'start', c: tc, b: 0 }) }
      else { M.t(gt, LX + 14, y + hh / 2 + 5, o.name + ' ' + o.label, 13.5, { a: 'start', c: tc }) } });
  });
  var dl = s.deltas || [], gx = 458, gw = 252, g2 = h.at(svg, 1400, { 'data-fx': 'fade', 'data-ms': 500 });
  M.t(g2, gx + gw / 2, 62, s.deltaTitle || '변화', 15, { c: C.dark });
  E('line', { x1: gx, y1: 76, x2: gx + gw, y2: 76, stroke: C.line, 'stroke-width': 2 }, g2);
  dl.forEach(function (o, i) { var y = 126 + i * 66; M.t(g2, gx + 4, y, o.name, 15.5, { a: 'start', c: C.ink }); M.t(g2, gx + gw - 2, y + 4, o.d, 24, { a: 'end', c: o.tone === 'g' ? C.main : C.cmp });
    if (o.sub) M.t(g2, gx + 4, y + 20, o.sub, 12, { a: 'start', c: C.mute, b: 0 }); E('line', { x1: gx, y1: y + 32, x2: gx + gw, y2: y + 32, stroke: C.line, 'stroke-width': 1 }, g2) });
};

/* ───────── mftank — 유동성 탱크 세 개(같은 눈금) ─────────
   tanks[3]{name,sub,value,vlabel,delta,peak,peakLabel,peakDate,prev,prevLabel,tone} · max(눈금 위끝) · step(눈금 간격) · unit('조') */
ECOM.parts.mftank = function (bd, s, ctx) {
  var svg = ctx.svg(512), tk = (s.tanks || []).slice(0, 3), n = tk.length, BW = 1168 / n, GUT = 38, TW = 190, TY = 84, TH = 316, mx = s.max || 1, stp = s.step || 1, unit = s.unit || '';
  var Y = function (v) { return TY + TH - TH * Math.min(v, mx) / mx };
  tk.forEach(function (o, i) { var x0 = i * BW, tx = x0 + GUT, t0 = 100 + i * 500, id = M.id(), g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 360 }), c = M.tone(o.tone, C.main);
    M.t(g, tx, 34, o.name, 19, { a: 'start', c: C.ink }); M.t(g, tx, 56, o.sub || '', 12.5, { a: 'start', c: C.mute, b: 0 });
    E('rect', { x: tx, y: TY, width: TW, height: TH, rx: 16, fill: '#fff', stroke: C.axis, 'stroke-width': 3 }, g);
    for (var v = stp; v < mx; v += stp) { E('line', { x1: tx + 8, y1: Y(v), x2: tx + TW - 8, y2: Y(v), stroke: C.grid, 'stroke-width': 1.4, 'stroke-dasharray': '2 5' }, g); M.t(g, tx - 6, Y(v) + 4, v + unit, 11.5, { a: 'end', c: C.mute, b: 0 }) }
    M.t(g, tx - 6, TY + TH + 4, '0', 11.5, { a: 'end', c: C.mute, b: 0 });
    var cp = E('clipPath', { id: id }, E('defs', {}, svg)); E('rect', { x: tx + 2, y: TY + 2, width: TW - 4, height: TH - 4, rx: 14 }, cp);
    var cg = E('g', { 'clip-path': 'url(#' + id + ')' }, svg), wh = Math.max(3, TH * Math.min(o.value, mx) / mx);
    var w = E('rect', { x: tx, y: TY + TH - wh, width: TW, height: wh, fill: c, 'data-at': t0 + 200, 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 900 }, cg);
    E('rect', { x: tx, y: TY + TH - wh, width: TW, height: 5, fill: '#fff', opacity: .35, 'data-at': t0 + 200, 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 900 }, cg);
    var gl = h.at(svg, t0 + 1000, { 'data-fx': 'fade', 'data-ms': 400 }), labs = [];
    if (o.peak != null) labs.push({ y: Y(o.peak), a: o.peakLabel, b: o.peakDate, dash: 1 });
    if (o.prev != null) labs.push({ y: Y(o.prev), a: o.prevLabel, b: '1년 전', dash: 0 });
    labs.sort(function (a, b) { return a.y - b.y }); for (var k = 1; k < labs.length; k++) { labs[k].ly = Math.max(labs[k].y, (labs[k - 1].ly == null ? labs[k - 1].y : labs[k - 1].ly) + 36) } if (labs[0]) labs[0].ly = labs[0].y;
    labs.forEach(function (L) { var ly = L.ly == null ? L.y : L.ly; E('line', { x1: tx + (L.dash ? 0 : 8), y1: L.y, x2: tx + TW + 14, y2: L.y, stroke: L.dash ? C.cmp : C.main, 'stroke-width': L.dash ? 2.4 : 2.4, 'stroke-dasharray': L.dash ? '7 5' : null }, gl);
      E('line', { x1: tx + TW + 14, y1: L.y, x2: tx + TW + 24, y2: ly, stroke: L.dash ? C.cmp : C.main, 'stroke-width': 1.6 }, gl);
      M.t(gl, tx + TW + 28, ly + 1, L.a, 13.5, { a: 'start', c: C.ink }); M.t(gl, tx + TW + 28, ly + 17, L.b, 12, { a: 'start', c: C.mute, b: 0 }) });
    var gv = h.at(svg, t0 + 900, { 'data-fx': 'rise', 'data-ms': 400 }); M.t(gv, tx, 450, o.vlabel, 28, { a: 'start', c: C.dark }); if (o.delta) M.t(gv, tx, 476, o.delta, 13.5, { a: 'start', c: C.cmp, b: 0 }) });
};

/* ───────── mfring — 한 나라에서 여러 나라로 퍼지는 돈(굵기 = 금액) ─────────
   hub{name,value,sub} · nodes[3~7]{name,value(숫자),label(글),share(글)} · unit(글, 굵기 설명) */
ECOM.parts.mfring = function (bd, s, ctx) {
  var svg = ctx.svg(512), hub = s.hub || {}, nd = (s.nodes || []).slice(0, 7), n = nd.length, CX = 584, CY = 252, RX = 436, RY = 188, HR = 82, mx = Math.max.apply(null, nd.map(function (o) { return o.value }));
  var ang = { 3: [-150, -30, 90], 4: [-140, -40, 40, 140], 5: [-150, -90, -30, 40, 140], 6: [-145, -90, -35, 35, 90, 145], 7: [-150, -105, -50, 0, 50, 105, 150] }[n] || [];
  nd.forEach(function (o, i) { var a = ang[i] * Math.PI / 180, nx = CX + RX * Math.cos(a), ny = CY + RY * Math.sin(a), r = 26 + 30 * Math.sqrt(o.value / mx), w = 4 + 26 * o.value / mx, t = 400 + i * 360;
    var dx = nx - CX, dy = ny - CY, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, hs = 16 + w * .55;
    var x1 = CX + ux * (HR + 4), y1 = CY + uy * (HR + 4), x2 = nx - ux * (r + 6), y2 = ny - uy * (r + 6);
    E('line', { x1: x1, y1: y1, x2: x2 - ux * hs * .7, y2: y2 - uy * hs * .7, stroke: C.g65, 'stroke-width': w, 'stroke-linecap': 'butt', 'data-at': t, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    ECOM.kx.head(svg, x2, y2, Math.atan2(uy, ux), C.g65, hs, { 'data-at': t + 440, 'data-fx': 'fade', 'data-ms': 160 });
    var g = h.at(svg, t + 300, { 'data-fx': 'pop', 'data-ms': 380 });
    E('circle', { cx: nx, cy: ny, r: r, fill: '#fff', stroke: C.main, 'stroke-width': 3 }, g); E('circle', { cx: nx, cy: ny, r: r - 7, fill: C.g08 }, g);
    M.t(g, nx, ny + 5, o.name, M.fit(o.name, 17, r * 1.6, 1, 13), { c: C.dark });
    var right = ux >= -.05, lx = right ? nx + r + 10 : nx - r - 10, an = right ? 'start' : 'end';
    M.t(g, lx, ny - 2, o.label, 20, { a: an, c: C.ink }); if (o.share) M.t(g, lx, ny + 18, o.share, 13, { a: an, c: C.mute, b: 0 }) });
  var g0 = h.at(svg, 100, { 'data-fx': 'pop', 'data-ms': 460 }); E('circle', { cx: CX, cy: CY, r: HR, fill: C.dark }, g0);
  M.t(g0, CX, CY - 14, hub.name || '', 19, { c: '#fff' }); M.t(g0, CX, CY + 18, hub.value || '', 26, { c: '#fff' }); if (hub.sub) M.t(g0, CX, CY + 40, hub.sub, 12, { c: '#CDE9DD', b: 0 });
  if (s.unit) M.t(h.at(svg, 200, { 'data-fx': 'fade' }), 0, 506, s.unit, 12.5, { a: 'start', c: C.mute, b: 0 });
};

/* ───────── mfshift — 자금 이동 전후 : 두 곳의 막대(이전 연함 · 이후 짙음) + 가운데 굵은 화살표 ─────────
   from{name,before,after,bl,al(글),tone} · to{…} · amount{value,sub} · beforeLabel · afterLabel */
ECOM.parts.mfshift = function (bd, s, ctx) {
  var svg = ctx.svg(512), A = s.from || {}, B = s.to || {}, BASE = 424, HH = 330, mx = Math.max(A.before, A.after, B.before, B.after) * 1.0, BW = 128;
  var X = [{ g: A, xs: [70, 238], c: C.g65 }, { g: B, xs: [760, 928], c: C.main }];
  X.forEach(function (o, k) { var g = o.g, t0 = 150 + k * 900;
    [['before', o.xs[0], s.beforeLabel || '이전', C.g40], ['after', o.xs[1], s.afterLabel || '이후', o.c]].forEach(function (q, j) { var v = g[q[0]], hh = HH * v / mx, x = q[1], gb = h.at(svg, t0 + j * 500, { 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 600 });
      M.rect(gb, x, BASE - hh, BW, hh, q[3], { rx: 3 }); var gt = h.at(svg, t0 + j * 500 + 500, { 'data-fx': 'fade' }); M.t(gt, x + BW / 2, BASE - hh - 11, g[j ? 'al' : 'bl'], 20, { c: j ? C.dark : C.cmp });
      M.t(gt, x + BW / 2, BASE + 22, q[2], 13.5, { c: C.mute, b: 0 }) });
    var gn = h.at(svg, 60, { 'data-fx': 'fade' }); M.t(gn, o.xs[0] + (o.xs[1] + BW - o.xs[0]) / 2, 474, g.name, 18, { c: C.ink });
    E('line', { x1: o.xs[0] - 20, y1: BASE + 1, x2: o.xs[1] + BW + 20, y2: BASE + 1, stroke: C.axis, 'stroke-width': 2 }, gn) });
  var yb = BASE - HH * A.before / mx, ya = BASE - HH * A.after / mx, yc = BASE - HH * B.before / mx, yd = BASE - HH * B.after / mx;
  var ax0 = 238 + BW + 34, ax1 = 760 - 34, cy = 232, hw = 36, hl = 56, gb = h.at(svg, 1500, { 'data-fx': 'right', 'data-ms': 600 });
  E('path', { d: 'M' + ax0 + ' ' + (cy - hw / 2) + ' L' + (ax1 - hl) + ' ' + (cy - hw / 2) + ' L' + (ax1 - hl) + ' ' + (cy - hw) + ' L' + ax1 + ' ' + cy + ' L' + (ax1 - hl) + ' ' + (cy + hw) + ' L' + (ax1 - hl) + ' ' + (cy + hw / 2) + ' L' + ax0 + ' ' + (cy + hw / 2) + ' Z', fill: C.main }, gb);
  var gc = h.at(svg, 2000, { 'data-fx': 'pop', 'data-ms': 400 }), am = s.amount || {};
  Z.chip(gc, (ax0 + ax1) / 2, cy - hw - 34, am.value || '', 22, { fill: C.dark, stroke: 'none', color: '#fff' }); if (am.sub) M.t(gc, (ax0 + ax1) / 2, cy + hw + 28, am.sub, 14, { c: C.cmp, b: 0 });
};

/* ───────── mfexch — 주체 넷의 돈(초록) · 물건(회색) 고리 ─────────
   actors[4]{id,name,sub,at:'tl|tr|br|bl'} · flows[{from,to,kind:'money|goods',text}] · center{title,lines[]} · legend{money,goods} */
ECOM.parts.mfexch = function (bd, s, ctx) {
  var svg = ctx.svg(512), AW = 252, AH = 108, pos = { tl: [0, 18], tr: [1168 - AW, 18], br: [1168 - AW, 512 - AH - 18], bl: [0, 512 - AH - 18] }, P = {};
  (s.actors || []).forEach(function (a, i) { var p = pos[a.at]; P[a.id] = { x: p[0], y: p[1], cx: p[0] + AW / 2, cy: p[1] + AH / 2 };
    var g = h.at(svg, 100 + i * 140, { 'data-fx': 'pop', 'data-ms': 380 }); Z.box(g, p[0], p[1], AW, AH, { fill: i % 2 ? C.paper : C.g08, stroke: C.main, sw: 2.6, rx: 16 });
    M.t(g, p[0] + AW / 2, p[1] + 46, a.name, 21, { c: C.dark }); if (a.sub) M.t(g, p[0] + AW / 2, p[1] + 74, a.sub, 13.5, { c: C.mute, b: 0 }) });
  function edge(a, b) { var A = P[a], B = P[b], dx = B.cx - A.cx, dy = B.cy - A.cy, out = function (q, sx, sy) { var tx = Math.abs(sx) > 1e-6 ? (AW / 2 + 8) / Math.abs(sx) : 1e9, ty = Math.abs(sy) > 1e-6 ? (AH / 2 + 8) / Math.abs(sy) : 1e9, t = Math.min(tx, ty); return [q.cx + sx * t, q.cy + sy * t] };
    return [out(A, dx, dy), out(B, -dx, -dy)] }
  (s.flows || []).forEach(function (f, i) { if (!P[f.from] || !P[f.to]) return; var e = edge(f.from, f.to), money = f.kind !== 'goods', col = money ? C.main : C.axis, t = 800 + i * 700;
    Z.arr(svg, e[0][0], e[0][1], e[1][0], e[1][1], col, money ? 6 : 8, t, { ms: 560 });
    var gc = h.at(svg, t + 480, { 'data-fx': 'pop', 'data-ms': 300 }); Z.chip(gc, (e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2, (f.num ? f.num + ' ' : '') + f.text, 14, { stroke: col, sw: 2.2, color: money ? C.dark : C.cmp }) });
  var c = s.center || {}, gx = h.at(svg, 600, { 'data-fx': 'fade', 'data-ms': 500 }), lg = s.legend || {};
  M.t(gx, 584, 188, c.title || '', 22, { c: C.dark }); (c.lines || []).forEach(function (l, i) { M.t(gx, 584, 222 + i * 26, l, 15, { c: C.cmp, b: 0 }) });
  E('line', { x1: 456, y1: 318, x2: 506, y2: 318, stroke: C.main, 'stroke-width': 6 }, gx); M.t(gx, 516, 323, lg.money || '돈', 15, { a: 'start', c: C.ink });
  E('line', { x1: 640, y1: 318, x2: 690, y2: 318, stroke: C.axis, 'stroke-width': 8 }, gx); M.t(gx, 700, 323, lg.goods || '물건', 15, { a: 'start', c: C.ink });
};

/* ───────── mfroute — 우회 수출 경로 : 세 나라 카드 + 경유 화살표 + 막힌 직항 + 관세 비교 막대 ─────────
   lands[3]{name,role,sub} · legs[2]{text,sub} · direct{text,sub} · cmp{title,unit,rows:[{name,value,tone}]} */
ECOM.parts.mfroute = function (bd, s, ctx) {
  var svg = ctx.svg(512), L = s.lands || [], CW = 286, CH = 138, CY0 = 22, xs = [0, (1168 - CW) / 2, 1168 - CW];
  L.forEach(function (o, i) { var g = h.at(svg, 100 + i * 700, { 'data-fx': 'pop', 'data-ms': 380 }), x = xs[i]; Z.box(g, x, CY0, CW, CH, { fill: i === 1 ? C.dark : C.g08, stroke: i === 1 ? 'none' : C.main, sw: 2.6, rx: 16 });
    var dk = i === 1; M.t(g, x + CW / 2, CY0 + 44, o.name, 24, { c: dk ? '#fff' : C.dark }); M.t(g, x + CW / 2, CY0 + 78, o.role, 16, { c: dk ? '#fff' : C.ink }); if (o.sub) M.t(g, x + CW / 2, CY0 + 106, o.sub, 13, { c: dk ? '#CDE9DD' : C.mute, b: 0 }) });
  (s.legs || []).forEach(function (o, i) { var x1 = xs[i] + CW + 6, x2 = xs[i + 1] - 8, y = CY0 + CH / 2, t = 500 + i * 900; Z.arr(svg, x1, y, x2, y, C.main, 7, t, { ms: 600 });
    var g = h.at(svg, t + 500, { 'data-fx': 'pop', 'data-ms': 300 }); Z.chip(g, (x1 + x2) / 2, y - 24, o.text, 15, { stroke: C.main, sw: 2.2 }); if (o.sub) M.t(g, (x1 + x2) / 2, y + 36, o.sub, 12.5, { c: C.mute, b: 0 }) });
  var d = s.direct || {}, ax = xs[0] + CW / 2, bx = xs[2] + CW / 2, y0 = CY0 + CH + 6, gd = h.at(svg, 2400, { 'data-fx': 'fade', 'data-ms': 600 });
  E('path', { d: 'M' + ax + ' ' + y0 + ' C' + ax + ' ' + (y0 + 190) + ', ' + bx + ' ' + (y0 + 190) + ', ' + bx + ' ' + (y0 + 8), fill: 'none', stroke: C.warn, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, gd);
  ECOM.kx.head(gd, bx, y0 + 4, -Math.PI / 2, C.warn, 16);
  var my = y0 + .75 * 190 + 6; Z.chip(gd, 584, my - 2, d.text || '', 15, { stroke: C.warn, sw: 2.2, color: C.warn }); if (d.sub) M.t(gd, 584, my + 30, d.sub, 12.5, { c: C.mute, b: 0 });
  var cm = s.cmp || {}, rows = cm.rows || [], gc = h.at(svg, 3200, { 'data-fx': 'fade', 'data-ms': 500 }), by = 384, mxv = Math.max.apply(null, rows.map(function (r) { return r.value })) * 1.15;
  M.t(gc, 250, by - 6, cm.title || '', 14, { a: 'start', c: C.cmp });
  rows.forEach(function (r, i) { var y = by + 8 + i * 40, w = 480 * r.value / mxv; M.t(gc, 250, y + 20, r.name, 15, { a: 'start', c: C.ink }); M.rect(gc, 480, y, w, 28, M.tone(r.tone, C.main), { rx: 3 }); M.t(gc, 480 + w + 10, y + 20, r.value + (cm.unit || ''), 17, { a: 'start', c: C.ink }) });
};

/* ───────── mffunnel — 깔때기 : 단계 폭 = 건수, 오른쪽에 첫 단계 대비 몫 · 직전 대비 몫 ─────────
   stages[2~5]{name,value,label,sub} · unit(글) · dropWord('탈락') */
ECOM.parts.mffunnel = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.stages || []).slice(0, 5), n = st.length, GAP = 34, SH = (490 - (n - 1) * GAP) / n, FX = 330, FW = 600, v0 = st[0].value, cols = [C.dark, C.main, C.g65, C.g40, C.g18];
  st.forEach(function (o, i) { var w0 = FW * o.value / v0, w1 = i < n - 1 ? FW * st[i + 1].value / v0 : w0 * .86, y = 10 + i * (SH + GAP), t = 200 + i * 650, g = h.at(svg, t, { 'data-fx': 'fade', 'data-ms': 500 }), c = cols[i];
    E('path', { d: 'M' + (FX - w0 / 2) + ' ' + y + ' L' + (FX + w0 / 2) + ' ' + y + ' L' + (FX + w1 / 2) + ' ' + (y + SH) + ' L' + (FX - w1 / 2) + ' ' + (y + SH) + ' Z', fill: c }, g);
    var dk = M.dark(c); M.t(g, FX, y + SH / 2 - 6, o.name, 21, { c: dk ? '#fff' : C.ink }); M.t(g, FX, y + SH / 2 + 24, o.label, 24, { c: dk ? '#fff' : C.ink });
    var gr = h.at(svg, t + 300, { 'data-fx': 'rise', 'data-ms': 420 }), pc = 100 * o.value / v0;
    M.t(gr, 884, y + SH / 2 + 4, h.nf(pc, 0) + '%', 44, { a: 'start', c: i ? C.dark : C.cmp }); M.t(gr, 884, y + SH / 2 + 30, i ? '첫 단계 대비' : '첫 단계(100%)', 13, { a: 'start', c: C.mute, b: 0 });
    if (i) { var pv = 100 * o.value / st[i - 1].value; M.t(gr, 1168, y + SH / 2 - 10, '직전의 ' + h.nf(pv, 0) + '%', 16, { a: 'end', c: C.ink }); }
    if (i < n - 1) { var d = st[i].value - st[i + 1].value, gd = h.at(svg, t + 520, { 'data-fx': 'fade', 'data-ms': 400 }), yy = y + SH + GAP / 2; E('line', { x1: FX + w1 / 2 + 24, y1: yy, x2: FX + FW / 2 + 90, y2: yy, stroke: C.axis, 'stroke-width': 1.6, 'stroke-dasharray': '4 4' }, gd);
      M.t(gd, FX + FW / 2 + 100, yy + 5, '▼ ' + (s.dropWord || '탈락') + ' ' + (o.dropLabel || st[i + 1].dropLabel || h.nf(d, 0)), 14, { a: 'start', c: C.cmp, b: 0 }) } });
};

/* ───────── mfchord — 코드 다이어그램 : 원 둘레 지역 호 + 안쪽 띠(굵기 = 교역액) + 오른쪽 상위 쌍 막대 ─────────
   regions[n]{name} · pairs[{a,b,v}](지역 번호) · hi(강조 지역 번호) · unit · rankTitle · topN(기본 6) */
ECOM.parts.mfchord = function (bd, s, ctx) {
  var svg = ctx.svg(512), R = s.regions || [], n = R.length, P = (s.pairs || []).slice(), CX = 330, CY = 256, RO = 196, RT = 16, GAPD = 4, hi = s.hi == null ? 0 : s.hi, unit = s.unit || '';
  var tot = R.map(function () { return 0 }); P.forEach(function (p) { tot[p.a] += p.v; tot[p.b] += p.v }); var sum = tot.reduce(function (a, b) { return a + b }, 0), degPer = (360 - n * GAPD) / sum;
  var start = [], a0 = -90 + GAPD / 2; for (var i = 0; i < n; i++) { start.push(a0); a0 += tot[i] * degPer + GAPD }
  var pt = function (deg, r) { var a = deg * Math.PI / 180; return [CX + r * Math.cos(a), CY + r * Math.sin(a)] }, cur = start.slice(), maxP = P.reduce(function (a, p) { return Math.max(a, p.v) }, 0);
  var rib = [];
  R.forEach(function (_, i) { P.filter(function (p) { return p.a === i || p.b === i }).sort(function (p, q) { var oa = p.a === i ? p.b : p.a, ob = q.a === i ? q.b : q.a; return ((oa - i + n) % n) - ((ob - i + n) % n) }).forEach(function (p) { var d = p.v * degPer; (p['s' + i] = [cur[i], cur[i] + d]); cur[i] += d }) });
  var RI = RO - RT - 6;
  P.slice().sort(function (p, q) { return p.v - q.v }).forEach(function (p, k) { var A = p['s' + p.a], B = p['s' + p.b], a1 = pt(A[0], RI), a2 = pt(A[1], RI), b1 = pt(B[0], RI), b2 = pt(B[1], RI), big = p.v === maxP, touch = p.a === hi || p.b === hi;
    var d = 'M' + a1[0] + ' ' + a1[1] + ' A' + RI + ' ' + RI + ' 0 0 1 ' + a2[0] + ' ' + a2[1] + ' Q' + CX + ' ' + CY + ' ' + b1[0] + ' ' + b1[1] + ' A' + RI + ' ' + RI + ' 0 0 1 ' + b2[0] + ' ' + b2[1] + ' Q' + CX + ' ' + CY + ' ' + a1[0] + ' ' + a1[1] + ' Z';
    E('path', { d: d, fill: big ? C.dark : touch ? C.main : C.gray, opacity: big ? .92 : touch ? .55 : .5, stroke: '#fff', 'stroke-width': .8, 'data-at': 500 + k * 160, 'data-fx': 'fade', 'data-ms': 500 }, svg) });
  R.forEach(function (o, i) { var d0 = start[i], d1 = start[i] + tot[i] * degPer, p0 = pt(d0, RO), p1 = pt(d1, RO), m = pt((d0 + d1) / 2, RO + 26), g = h.at(svg, 100 + i * 80, { 'data-fx': 'fade', 'data-ms': 400 });
    E('path', { d: 'M' + p0[0] + ' ' + p0[1] + ' A' + RO + ' ' + RO + ' 0 ' + ((d1 - d0) > 180 ? 1 : 0) + ' 1 ' + p1[0] + ' ' + p1[1], fill: 'none', stroke: i === hi ? C.dark : C.cmp, 'stroke-width': RT, 'stroke-linecap': 'butt' }, g);
    var right = m[0] > CX + 6, mid = Math.abs(m[0] - CX) <= 6; M.t(g, m[0], m[1] + (m[1] < CY ? -10 : 18), o.name, 16, { a: mid ? 'middle' : right ? 'start' : 'end', c: i === hi ? C.dark : C.ink }); M.t(g, m[0], m[1] + (m[1] < CY ? 6 : 34), h.nf(tot[i], 0) + unit, 12.5, { a: mid ? 'middle' : right ? 'start' : 'end', c: C.mute, b: 0 }) });
  var top = P.slice().sort(function (p, q) { return q.v - p.v }).slice(0, s.topN || 6), gr = h.at(svg, 1700, { 'data-fx': 'fade', 'data-ms': 500 }), RX0 = 760, mxr = top[0].v;
  M.t(gr, RX0, 80, s.rankTitle || '교역액 상위 쌍', 15, { a: 'start', c: C.cmp });
  top.forEach(function (p, i) { var y = 112 + i * 58, w = 180 * p.v / mxr, big = i === 0, touch = p.a === hi || p.b === hi; M.t(gr, RX0, y + 20, R[p.a].name + ' ↔ ' + R[p.b].name, 15, { a: 'start', c: C.ink });
    M.rect(gr, RX0 + 128, y + 4, w, 24, big ? C.dark : touch ? C.main : C.gray, { rx: 3 }); M.t(gr, RX0 + 128 + w + 8, y + 22, h.nf(p.v, 0) + unit, 14.5, { a: 'start', c: C.ink }) });
};

/* ───────── mflev — 레버리지 블록 : 열마다 같은 자산 10칸을 자기 돈(초록) · 빌린 돈(회색)으로 나누고 가격이 떨어지면 자기 돈 칸이 사라짐 ─────────
   cols[2~4]{name,own,borrow,lossLabel,sub} · loss(떨어져 사라지는 칸 수) · dropText(「자산 가격 −10%」) */
ECOM.parts.mflev = function (bd, s, ctx) {
  var svg = ctx.svg(512), cl = (s.cols || []).slice(0, 4), n = cl.length, CW = 1168 / n, BH = 33, BG = 4, TOP = 66, loss = s.loss == null ? 1 : s.loss, SW = 150;
  cl.forEach(function (o, i) { var x0 = i * CW + 6, t0 = 150 + i * 700, tot = o.own + o.borrow, g = h.at(svg, 60, { 'data-fx': 'fade' }); M.t(g, x0, 36, o.name, 22, { a: 'start', c: C.dark });
    for (var k = 0; k < tot; k++) { var y = TOP + k * (BH + BG), isOwn = k >= o.borrow, ownIdx = k - o.borrow, lost = isOwn && ownIdx < loss, gg = h.at(svg, t0 + (tot - k) * 40, { 'data-fx': 'pop', 'data-ms': 260 });
      if (lost) { M.rect(gg, x0, y, SW, BH, C.warnsoft, { rx: 4, stroke: C.warn, sw: 2, dash: '5 4' }); M.t(gg, x0 + SW / 2, y + BH / 2 + 6, '×', 20, { c: C.warn }) }
      else M.rect(gg, x0, y, SW, BH, isOwn ? C.main : C.gray, { rx: 4 }) }
    var ly = TOP + o.borrow * (BH + BG), lx = x0 + SW + 16, gl = h.at(svg, t0 + 500, { 'data-fx': 'fade', 'data-ms': 400 });
    if (o.borrow) { E('line', { x1: lx, y1: TOP, x2: lx, y2: ly - BG - 2, stroke: C.axis, 'stroke-width': 2 }, gl); M.t(gl, lx + 12, TOP + (ly - BG - TOP) / 2 + 5, '빌린 돈 ' + o.borrow + '칸', 14.5, { a: 'start', c: C.cmp }) }
    E('line', { x1: lx, y1: ly, x2: lx, y2: TOP + tot * (BH + BG) - BG, stroke: C.main, 'stroke-width': 2 }, gl); M.t(gl, lx + 12, ly + (tot - o.borrow) * (BH + BG) / 2 - 12, '자기 돈 ' + o.own + '칸', 14.5, { a: 'start', c: C.dark });
    var gv = h.at(svg, t0 + 900, { 'data-fx': 'rise', 'data-ms': 400 }); M.t(gv, lx + 12, ly + (tot - o.borrow) * (BH + BG) / 2 + 28, o.lossLabel, 30, { a: 'start', c: o.lossBad ? C.warn : C.dark }); if (o.sub) M.t(gv, lx + 12, ly + (tot - o.borrow) * (BH + BG) / 2 + 50, o.sub, 12.5, { a: 'start', c: C.mute, b: 0 }) });
  if (s.dropText) { var gd = h.at(svg, 100, { 'data-fx': 'fade' }); M.t(gd, 6, 498, s.dropText, 13.5, { a: 'start', c: C.mute, b: 0 }) }
};
})();
