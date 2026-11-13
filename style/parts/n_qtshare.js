/* qt 계열(F16 구성 분해) 부품 7종 — 칸 설명은 style/SCHEMA4_F14.md
   qtsun 2단 도넛(선버스트) · qtdonut2 전후 도넛 쌍 · qtstack100 100% 누적 + 이어짐 띠 · qtexpand 한 칸 펼침 막대 · qtpack 원 쌓기 · qtcomp 구성 + 증감 표 · qtgauge 반원 게이지 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size }
function box(p, x, y, w, hh, fill, o) { o = o || {}; var a = { x: x, y: y, width: w, height: hh, rx: o.rx == null ? 12 : o.rx, fill: fill }; if (o.stroke) { a.stroke = o.stroke; a['stroke-width'] = o.sw || 1.5 } return E('rect', a, p) }
var PAL = [C.dark, C.main, C.g65, C.g40, C.gray, '#7E8A85'];
function col(c, i) { return c ? (h.col ? h.col(c) : c) : PAL[i % PAL.length] }
function pt(cx, cy, r, deg) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
function sector(cx, cy, r0, r1, a0, a1) { if (a1 - a0 > 359.99) a1 = a0 + 359.99; var p0 = pt(cx, cy, r1, a0), p1 = pt(cx, cy, r1, a1), p2 = pt(cx, cy, r0, a1), p3 = pt(cx, cy, r0, a0), lg = a1 - a0 > 180 ? 1 : 0;
  return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' L' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) + ' A' + r0 + ' ' + r0 + ' 0 ' + lg + ' 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + ' Z' }
function txtOn(c) { return c === C.gray || c === C.g40 || c === C.g18 ? C.ink : '#fff' }

/* ---------- qtsun ---------- */
ECOM.parts.qtsun = function (bd, s, ctx) {
  var gs = s.groups || [], tot = gs.reduce(function (a, g) { return a + g.value }, 0), svg = ctx.svg(512), cx = 262, cy = 256, unit = s.unit || '%', dec = s.dec == null ? 1 : s.dec;
  var a = 0, ang = 360 / tot, order = [];
  var gI = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 500 }), gO = h.at(svg, 700, { 'data-fx': 'fade', 'data-ms': 600 });
  gs.forEach(function (g, i) { var c = col(g.color, i), a1 = a + g.value * ang; E('path', { d: sector(cx, cy, 86, 146, a, a1 - .6), fill: c, stroke: '#fff', 'stroke-width': 2 }, gI);
    var mid = (a + a1) / 2, p = pt(cx, cy, 116, mid); if (g.value / tot > .08) T(gI, p[0], p[1] + 5, h.nf(g.value / tot * 100, 0) + '%', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: txtOn(c) });
    var b = a; (g.items || []).forEach(function (it, k) { var b1 = b + it.value * ang, shade = k % 2 ? .62 : .86; E('path', { d: sector(cx, cy, 151, 238, b, b1 - .5), fill: c, opacity: shade, stroke: '#fff', 'stroke-width': 1.6 }, gO);
      var q = pt(cx, cy, 195, (b + b1) / 2); if (it.value / tot > .045) T(gO, q[0], q[1] + 4.5, h.nf(it.value / tot * 100, 0), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: txtOn(c) }); b = b1 });
    a = a1 });
  var gc = h.at(svg, 200, { 'data-fx': 'pop', 'data-ms': 400 }); T(gc, cx, cy - 4, s.centerTitle || '합계', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: C.mute }); T(gc, cx, cy + 22, h.nf(tot, dec) + unit, { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: C.dark });
  var x = 560, y = 18, gl = h.at(svg, 1300, { 'data-fx': 'rise', 'data-ms': 500 }); T(gl, x, y + 8, s.innerTitle || '안쪽 고리', { 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(gl, x + 300, y + 8, s.outerTitle || '바깥 고리 = 세부', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  y += 30; var rh = (512 - y) / (gs.length + gs.reduce(function (z, g) { return z + (g.items || []).length * .52 }, 0));
  gs.forEach(function (g, i) { var c = col(g.color, i), hh = rh + (g.items || []).length * rh * .52; box(gl, x, y + 2, 608, hh - 8, i % 2 ? '#fff' : C.paper, { rx: 12 }); E('rect', { x: x, y: y + 2, width: 8, height: hh - 8, rx: 4, fill: c }, gl);
    T(gl, x + 24, y + rh * .5 + 6, g.name, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); T(gl, x + 24, y + rh * .5 + 26, '합계의 ' + h.nf(g.value / tot * 100, 0) + '%', { 'font-size': 14, 'font-weight': 700, fill: C.dark });
    (g.items || []).forEach(function (it, k) { var yy = y + 26 + k * rh * .52 + 12; E('rect', { x: x + 300, y: yy - 11, width: 12, height: 12, rx: 3, fill: c, opacity: k % 2 ? .62 : .86 }, gl); T(gl, x + 320, yy, it.name, { 'font-size': 14.5, 'font-weight': 600, fill: C.ink }); T(gl, x + 592, yy, h.nf(it.value, dec) + unit, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: C.cmp }) });
    y += hh });
};

/* ---------- qtdonut2 ---------- */
ECOM.parts.qtdonut2 = function (bd, s, ctx) {
  var A = s.before || {}, B = s.after || {}, svg = ctx.svg(512), names = [], unit = s.unit || '%', dec = s.dec == null ? 1 : s.dec, cmap = s.colors || {};
  (A.items || []).concat(B.items || []).forEach(function (it) { if (names.indexOf(it.name) < 0) names.push(it.name) });
  function cl(nm) { var i = names.indexOf(nm); return cmap[nm] ? h.col(cmap[nm]) : PAL[i % PAL.length] }
  function ring(D, cx, t0) { var g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 600 }), tot = D.items.reduce(function (a, b) { return a + b.value }, 0), a = 0, R1 = 150, R0 = 86, cy = 214;
    E('circle', { cx: cx, cy: cy, r: (R0 + R1) / 2, fill: 'none', stroke: C.light, 'stroke-width': R1 - R0 }, g);
    D.items.forEach(function (it) { var a1 = a + it.value / tot * 360, c = cl(it.name); E('path', { d: sector(cx, cy, R0, R1, a, a1 - .5), fill: c, stroke: '#fff', 'stroke-width': 2 }, g); var p = pt(cx, cy, (R0 + R1) / 2, (a + a1) / 2); if (it.value / tot > .06) T(g, p[0], p[1] + 5, h.nf(it.value, dec === 0 ? 0 : 0) + '', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: txtOn(c) }); a = a1 });
    T(g, cx, cy + 6, D.center || '', { 'text-anchor': 'middle', 'font-size': 21, 'font-weight': 700, fill: C.dark }); T(g, cx, cy + 196, D.title || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink }); T(g, cx, cy + 220, D.sub || '', { 'text-anchor': 'middle', 'font-size': 13.5, fill: C.mute, 'font-weight': 500 }) }
  ring(A, 190, 0); ring(B, 978, 900);
  var gm = h.at(svg, 1700, { 'data-fx': 'rise', 'data-ms': 500 }), rows = names.map(function (nm) { var a = (A.items.filter(function (x) { return x.name === nm })[0] || { value: 0 }).value, b = (B.items.filter(function (x) { return x.name === nm })[0] || { value: 0 }).value; return { nm: nm, a: a, b: b, d: b - a } });
  var x = 392, w = 384, rh = Math.min(54, 380 / rows.length), y = 214 - rows.length * rh / 2 - 8;
  T(gm, x + w / 2, y - 14, s.midTitle || '몫이 바뀐 곳', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.mute });
  rows.forEach(function (r, i) { var yy = y + i * rh, c = cl(r.nm); box(gm, x, yy, w, rh - 8, i % 2 ? '#fff' : C.paper, { rx: 10 }); E('rect', { x: x + 12, y: yy + (rh - 8) / 2 - 7, width: 14, height: 14, rx: 3, fill: c }, gm);
    T(gm, x + 36, yy + (rh - 8) / 2 + 5, r.nm, { 'font-size': fit(r.nm, 15.5, 130, 1, 12.5), 'font-weight': 700, fill: C.ink }); T(gm, x + 214, yy + (rh - 8) / 2 + 5, h.nf(r.a, dec) + ' → ' + h.nf(r.b, dec), { 'text-anchor': 'end', 'font-size': 14.5, fill: C.cmp, 'font-weight': 600 });
    var up = r.d > 0, z = Math.abs(r.d) < .05; var cw = 78, cx = x + w - 10 - cw; E('rect', { x: cx, y: yy + 6, width: cw, height: rh - 20, rx: (rh - 20) / 2, fill: z ? C.gray : up ? C.main : C.warn }, gm);
    T(gm, cx + cw / 2, yy + (rh - 8) / 2 + 5, z ? '—' : (up ? '+' : '−') + h.nf(Math.abs(r.d), dec) + 'p', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: z ? C.cmp : '#fff' }) });
  var ga = h.at(svg, 1500, { 'data-fx': 'pop', 'data-ms': 360 }); E('path', { d: 'M360 214 L384 214', stroke: C.axis, 'stroke-width': 2 }, ga); E('path', { d: 'M780 214 L804 214', stroke: C.axis, 'stroke-width': 2 }, ga);
};

/* ---------- qtstack100 ---------- */
ECOM.parts.qtstack100 = function (bd, s, ctx) {
  var cols = s.cols || [], names = s.names || [], n = cols.length, svg = ctx.svg(512), x0 = 30, x1 = 1168 - 250, bw = Math.min(70, (x1 - x0) / n * .56), yT = 20, yB = 458, Y = function (p) { return yB - (yB - yT) * p / 100 }, X = function (i) { return x0 + bw / 2 + (x1 - x0 - bw) * i / (n - 1) };
  var sh = cols.map(function (c) { var tot = names.reduce(function (a, nm) { return a + (c.parts[nm] || 0) }, 0), acc = 0, o = {}; names.forEach(function (nm) { var v = (c.parts[nm] || 0) / tot * 100; o[nm] = [acc, acc + v, v]; acc += v }); return o });
  var gR = h.at(svg, 500, { 'data-fx': 'fade', 'data-ms': 700 });
  names.forEach(function (nm, k) { var c = col((s.colors || {})[nm], k); for (var i = 0; i < n - 1; i++) { var a = sh[i][nm], b = sh[i + 1][nm]; E('path', { d: 'M' + (X(i) + bw / 2) + ' ' + Y(a[0]) + ' L' + (X(i + 1) - bw / 2) + ' ' + Y(b[0]) + ' L' + (X(i + 1) - bw / 2) + ' ' + Y(b[1]) + ' L' + (X(i) + bw / 2) + ' ' + Y(a[1]) + ' Z', fill: c, opacity: .3 }, gR) } });
  cols.forEach(function (c, i) { var g = h.at(svg, i * 160, { 'data-fx': 'grow', 'data-ms': 520 }); names.forEach(function (nm, k) { var a = sh[i][nm], cc = col((s.colors || {})[nm], k), hh = Y(a[0]) - Y(a[1]);
      E('rect', { x: X(i) - bw / 2, y: Y(a[1]), width: bw, height: Math.max(0, hh - 1.2), fill: cc }, g); if (hh > 18) T(g, X(i), Y(a[1]) + hh / 2 + 4.5, h.nf(a[2], 0), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: txtOn(cc) }) });
    T(g, X(i), yB + 26, c.label, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': c.hi ? 700 : 600, fill: c.hi ? C.ink : C.mute }) });
  var gl = h.at(svg, 1700, { 'data-fx': 'rise', 'data-ms': 500 }), lx = x1 + 30; T(gl, lx, 14, s.legendTitle || '마지막 열 몫', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  var last = sh[n - 1], first = sh[0], pos = names.map(function (nm) { return { nm: nm, y: Y((last[nm][0] + last[nm][1]) / 2) - 31 } }).sort(function (p, q) { return p.y - q.y });
  for (var z = 0; z < pos.length; z++) { pos[z].y = Math.max(26 + z * 66, pos[z].y); if (z && pos[z].y < pos[z - 1].y + 66) pos[z].y = pos[z - 1].y + 66 } var over = pos[pos.length - 1].y + 62 - 500; if (over > 0) pos.forEach(function (p) { p.y -= over });
  pos.forEach(function (p) { var nm = p.nm, k = names.indexOf(nm), cc = col((s.colors || {})[nm], k), d = last[nm][2] - first[nm][2], yy = p.y;
    E('rect', { x: lx, y: yy, width: 8, height: 58, rx: 4, fill: cc }, gl);
    T(gl, lx + 20, yy + 20, nm, { 'font-size': fit(nm, 15.5, 190, 1, 12.5), 'font-weight': 700, fill: C.ink }); T(gl, lx + 20, yy + 44, h.nf(last[nm][2], 0) + '%', { 'font-size': 20, 'font-weight': 700, fill: C.dark }); T(gl, lx + 20 + h.textW(h.nf(last[nm][2], 0) + '%', 20, 1) + 10, yy + 44, (d >= 0 ? '+' : '−') + h.nf(Math.abs(d), 0) + '%p', { 'font-size': 13.5, 'font-weight': 700, fill: C.mute }) });
};

/* ---------- qtexpand ---------- */
ECOM.parts.qtexpand = function (bd, s, ctx) {
  var seg = s.items || [], fi = s.focus, svg = ctx.svg(512), tot = seg.reduce(function (a, b) { return a + b.value }, 0), unit = s.unit || '%', dec = s.dec == null ? 1 : s.dec, W = 1168, y0 = 8, bh = 74;
  var g1 = h.at(svg, 0, { 'data-fx': 'growx', 'data-ms': 700 }), a = 0, fx0 = 0, fx1 = 0;
  seg.forEach(function (it, i) { var w = it.value / tot * W, c = i === fi ? C.main : col(it.color, 3 + (i % 2)), foc = i === fi; if (foc) { fx0 = a; fx1 = a + w }
    E('rect', { x: a, y: y0, width: Math.max(0, w - 3), height: bh, rx: 8, fill: foc ? C.main : (i % 2 ? C.g18 : C.g40) }, g1); var lab = it.name, fs = fit(lab, 15.5, w - 14, 1, 12);
    if (w > 54) { T(g1, a + 10, y0 + 32, lab, { 'font-size': fs, 'font-weight': 700, fill: foc ? '#fff' : C.ink }); T(g1, a + 10, y0 + 56, h.nf(it.value / tot * 100, 1) + '%', { 'font-size': 14, 'font-weight': 700, fill: foc ? '#fff' : C.dark }) } else T(g1, a + w / 2, y0 + bh + 18, h.nf(it.value / tot * 100, 0), { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute, 'font-weight': 600 }); a += w });
  var gc = h.at(svg, 800, { 'data-fx': 'fade', 'data-ms': 500 }), fo = seg[fi], y2 = 218, bh2 = 84;
  E('path', { d: 'M' + fx0 + ' ' + (y0 + bh + 2) + ' L' + 0 + ' ' + y2 + ' L' + W + ' ' + y2 + ' L' + (fx1 - 3) + ' ' + (y0 + bh + 2) + ' Z', fill: C.g08, stroke: C.main, 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, gc);
  T(gc, W / 2, 152, (s.focusTitle || fo.name + ' 안쪽 구성'), { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: C.dark }); T(gc, W / 2, 176, h.nf(fo.value, dec) + unit + ' = 전체의 ' + h.nf(fo.value / tot * 100, 1) + '%', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 600, fill: C.mute });
  var sub = fo.parts || [], st = sub.reduce(function (z, b) { return z + b.value }, 0), g2 = h.at(svg, 1300, { 'data-fx': 'growx', 'data-ms': 700 }), b = 0;
  sub.forEach(function (p, i) { var w = p.value / st * W, cc = [C.main, C.g65, C.g40, C.dark, C.gray][i % 5]; E('rect', { x: b, y: y2, width: w - 3, height: bh2, rx: 10, fill: cc }, g2); T(g2, b + 14, y2 + 38, p.name, { 'font-size': 18, 'font-weight': 700, fill: txtOn(cc) }); T(g2, b + 14, y2 + 66, h.nf(p.value / st * 100, 0) + '%', { 'font-size': 20, 'font-weight': 700, fill: txtOn(cc) }); p._x = b; p._w = w; p._c = cc; b += w });
  var g3 = h.at(svg, 1900, { 'data-fx': 'rise', 'data-ms': 500 }), cw = (W - (sub.length - 1) * 12) / sub.length;
  sub.forEach(function (p, i) { var x = i * (cw + 12); box(g3, x, 328, cw, 176, '#fff', { rx: 14, stroke: C.line }); E('rect', { x: x, y: 328, width: cw, height: 8, rx: 4, fill: p._c }, g3); T(g3, x + 20, 372, p.name, { 'font-size': 17, 'font-weight': 700, fill: C.ink });
    T(g3, x + 20, 424, h.nf(p.value, dec) + '', { 'font-size': 38, 'font-weight': 700, fill: C.dark }); T(g3, x + 28 + h.textW(h.nf(p.value, dec), 38, 1), 424, unit, { 'font-size': 17, 'font-weight': 700, fill: C.mute }); T(g3, x + 20, 456, p.sub || '', { 'font-size': 13.5, fill: C.mute, 'font-weight': 500 });
    T(g3, x + 20, 484, '전체 대비 ' + h.nf(p.value / tot * 100, 1) + '%', { 'font-size': 14, 'font-weight': 700, fill: C.main }) });
};

/* ---------- qtpack ---------- */
ECOM.parts.qtpack = function (bd, s, ctx) {
  var it = (s.items || []).slice().sort(function (a, b) { return b.value - a.value }), svg = ctx.svg(512), W = 1168, H = 440, cx0 = W / 2, cy0 = H / 2, gs = s.groups || [], unit = s.unit || '', dec = s.dec == null ? 0 : s.dec, placed;
  function tryK(k) { var out = []; for (var i = 0; i < it.length; i++) { var r = Math.sqrt(it[i].value) * k, ok = false, best = null;
      for (var rad = 0; rad < 700 && !ok; rad += 3) for (var an = 0; an < 360; an += 5) { var x = cx0 + rad * 1.5 * Math.cos(an * Math.PI / 180), y = cy0 + rad * .9 * Math.sin(an * Math.PI / 180);
        if (x - r < 2 || x + r > W - 2 || y - r < 2 || y + r > H - 2) continue; if (out.every(function (o) { return Math.hypot(o.x - x, o.y - y) >= o.r + r + 3 })) { best = { x: x, y: y, r: r, it: it[i] }; ok = true; break } }
      if (!best) return null; out.push(best) } return out }
  for (var k = 44; k > 4; k -= 1) { placed = tryK(k); if (placed) break }
  var gcol = {}; gs.forEach(function (g, i) { gcol[g.name] = [C.dark, C.main, C.g65, C.g40][i % 4] });
  placed.forEach(function (o, i) { var g = h.at(svg, 150 + i * 110, { 'data-fx': 'pop', 'data-ms': 420 }), c = gcol[o.it.group] || C.main; E('circle', { cx: o.x, cy: o.y, r: o.r, fill: c, stroke: '#fff', 'stroke-width': 2 }, g);
    var tc = txtOn(c); if (o.r > 52) { T(g, o.x, o.y - 2, o.it.name, { 'text-anchor': 'middle', 'font-size': fit(o.it.name, 17, o.r * 1.7, 1, 12.5), 'font-weight': 700, fill: tc }); T(g, o.x, o.y + 22, h.nf(o.it.value, dec) + unit, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: tc }) }
    else if (o.r > 30) { T(g, o.x, o.y - 1, o.it.name, { 'text-anchor': 'middle', 'font-size': fit(o.it.name, 13.5, o.r * 1.8, 1, 11.5), 'font-weight': 700, fill: tc }); T(g, o.x, o.y + 15, h.nf(o.it.value, dec), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: tc }) }
    else T(g, o.x, o.y + 4.5, o.it.name, { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: tc }) });
  var gl = h.at(svg, 150 + placed.length * 110 + 200, { 'data-fx': 'fade', 'data-ms': 400 }), lx = 0, tot = it.reduce(function (z, b) { return z + b.value }, 0);
  gs.forEach(function (g, i) { var sum = it.filter(function (x) { return x.group === g.name }).reduce(function (z, b) { return z + b.value }, 0); E('circle', { cx: lx + 8, cy: 480, r: 8, fill: gcol[g.name] }, gl); var t = g.name + ' ' + h.nf(sum / tot * 100, 0) + '%'; T(gl, lx + 24, 485, t, { 'font-size': 14.5, 'font-weight': 700, fill: C.ink }); lx += 50 + h.textW(t, 14.5, 1) + 20 });
  T(gl, 1168, 485, s.sizeNote || '원 넓이 = 규모', { 'text-anchor': 'end', 'font-size': 13.5, fill: C.mute, 'font-weight': 600 });
};

/* ---------- qtcomp ---------- */
ECOM.parts.qtcomp = function (bd, s, ctx) {
  var gs = s.groups || [], svg = ctx.svg(512), cols = s.cols || {}, xN = 26, xV = 372, xB = 410, wB = 300, xD = 760, wD = 400, g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 340 });
  T(g0, xN, 22, cols.name || '항목', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, xV, 22, cols.value || '금액', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, xB, 22, cols.share || '비중', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, xD, 22, cols.delta || '1년 전 대비 증감', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  var nr = gs.reduce(function (z, g) { return z + g.rows.length }, 0), gh = 38, avail = 512 - 34 - gs.length * (gh + 10), rh = Math.min(86, avail / nr), y = 34, maxD = Math.max.apply(null, [1].concat([].concat.apply([], gs.map(function (g) { return g.rows.map(function (r) { return Math.abs(r.delta) }) }))));
  var mid = xD + wD * .42, k = 0;
  gs.forEach(function (g, gi) { var gg = h.at(svg, 250 + gi * 900, { 'data-fx': 'rise', 'data-ms': 420 }); box(gg, 0, y, 1168, gh, C.dark, { rx: 10 }); T(gg, 16, y + 25, g.title, { 'font-size': 16, 'font-weight': 700, fill: '#fff' }); T(gg, 1152, y + 25, g.total || '', { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: C.on }); y += gh + 6;
    g.rows.forEach(function (r, i) { var gr = h.at(svg, 450 + gi * 900 + i * 220, { 'data-fx': 'rise', 'data-ms': 400 }), cy = y + (rh - 6) / 2, tone = r.tone || 'main', c = tone === 'warn' ? C.warn : C.main;
      box(gr, 0, y, 1168, rh - 6, i % 2 ? '#fff' : C.paper, { rx: 10 }); T(gr, xN, cy - 2, r.name, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (r.sub) T(gr, xN, cy + 18, r.sub, { 'font-size': 12.5, fill: C.mute, 'font-weight': 500 });
      T(gr, xV, cy + 7, r.valueText, { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: C.dark });
      E('rect', { x: xB, y: cy - 13, width: wB, height: 26, rx: 6, fill: C.light }, gr); E('rect', { x: xB, y: cy - 13, width: Math.max(3, wB * r.share / 100), height: 26, rx: 6, fill: c }, gr); T(gr, xB + wB + 12, cy + 6, h.nf(r.share, 1) + '%', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
      E('line', { x1: mid, x2: mid, y1: cy - 18, y2: cy + 18, stroke: C.axis }, gr); var dw = Math.abs(r.delta) / maxD * (wD * .34), up = r.delta >= 0, dc = r.dtone === 'warn' ? C.warn : C.main;
      E('rect', { x: up ? mid : mid - dw, y: cy - 12, width: Math.max(2, dw), height: 24, rx: 5, fill: dc }, gr); T(gr, up ? mid + dw + 10 : mid - dw - 10, cy + 6, (up ? '+' : '−') + r.deltaText, { 'text-anchor': up ? 'start' : 'end', 'font-size': 15, 'font-weight': 700, fill: dc }); y += rh });
    y += 10 });
};

/* ---------- qtgauge ---------- */
ECOM.parts.qtgauge = function (bd, s, ctx) {
  var gs = s.gauges || [], n = gs.length, svg = ctx.svg(512), cw = (1168 - (n - 1) * 16) / n, R = Math.min(150, cw / 2 - 34);
  gs.forEach(function (d, i) { var x = i * (cw + 16), cx = x + cw / 2, cy = 270, g = h.at(svg, i * 700, { 'data-fx': 'rise', 'data-ms': 420 }), max = d.max, f = function (v) { return 180 + 180 * Math.max(0, Math.min(1, v / max)) }, bad = d.bad === 'above' ? d.value > d.target : d.bad === 'below' ? d.value < d.target : false, c = bad ? C.warn : C.main;
    box(g, x, 0, cw, 512, C.paper, { rx: 18 }); T(g, cx, 44, d.title, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: C.ink }); T(g, cx, 68, d.sub || '', { 'text-anchor': 'middle', 'font-size': 13.5, fill: C.mute, 'font-weight': 500 });
    E('path', { d: arcPath(cx, cy, R - 15, 180, 360), fill: 'none', stroke: C.light, 'stroke-width': 30, 'stroke-linecap': 'butt' }, g);
    E('path', { d: arcPath(cx, cy, R - 15, 180, f(d.value)), fill: 'none', stroke: c, 'stroke-width': 30, 'data-at': i * 700 + 400, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
    var gt = h.at(svg, i * 700 + 1200, { 'data-fx': 'pop', 'data-ms': 420 }), pa = pt180(cx, cy, R - 40, f(d.target)), pb = pt180(cx, cy, R + 12, f(d.target)); E('line', { x1: pa[0], y1: pa[1], x2: pb[0], y2: pb[1], stroke: C.dark, 'stroke-width': 3.2 }, gt);
    var pl = pt180(cx, cy, R + 34, f(d.target)); T(gt, pl[0], pl[1] + 4, d.targetText || ('목표 ' + d.target), { 'text-anchor': pl[0] < cx - 20 ? 'end' : pl[0] > cx + 20 ? 'start' : 'middle', 'font-size': 13, 'font-weight': 700, fill: C.dark });
    T(g, cx - R + 15, cy + 22, '0', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }); T(g, cx + R - 15, cy + 22, h.nf(max, 0) + (d.unit || ''), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    var gv = h.at(svg, i * 700 + 900, { 'data-fx': 'fade', 'data-ms': 500 }); T(gv, cx, cy - 12, h.nf(d.value, d.dec == null ? 1 : d.dec), { 'text-anchor': 'middle', 'font-size': 52, 'font-weight': 700, fill: c }); T(gv, cx + h.textW(h.nf(d.value, d.dec == null ? 1 : d.dec), 52, 1) / 2 + 6, cy - 12, d.unit || '', { 'font-size': 20, 'font-weight': 700, fill: C.mute });
    var gb = h.at(svg, i * 700 + 1500, { 'data-fx': 'rise', 'data-ms': 420 }), gap = d.value - d.target; box(gb, x + 20, 332, cw - 40, 64, '#fff', { rx: 12, stroke: C.line });
    T(gb, x + 36, 358, d.gapLabel || '목표와 차이', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(gb, x + cw - 36, 372, (gap >= 0 ? '+' : '−') + h.nf(Math.abs(gap), 1) + (d.gapUnit || '%p'), { 'text-anchor': 'end', 'font-size': 26, 'font-weight': 700, fill: bad ? C.warn : C.main });
    T(g, cx, 432, d.note1 || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: C.cmp }); T(g, cx, 456, d.note2 || '', { 'text-anchor': 'middle', 'font-size': 13.5, fill: C.mute, 'font-weight': 500 }); T(g, cx, 490, d.note3 || '', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute, 'font-weight': 500 }) });
  function pt180(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
  function arcPath(cx, cy, r, a0, a1) { var p0 = pt180(cx, cy, r, a0), p1 = pt180(cx, cy, r, a1); return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) }
};
})();
