/* F08 타임라인 부품 11종(머리글자 tl) — 모두 SVG 한 장(1168×512)
   tlvert 세로 연표 · tlpar 평행 타임라인 · tlgantt 간트 · tlcount 카운트다운 · tleras 시대 구분 띠 · tlterm 임기 막대
   tlzoom 펼친 구간 · tlclock 24시간 시계 · tlmile 단계 이정표 · tlbill 법안 진행 단계 · tlcards 사건 카드 연속
   칸 설명 = style/SCHEMA4_F08.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function tx(p, x, y, s, size, o) { o = o || {}; var a = { 'font-size': size, 'font-weight': o.w || 400, fill: o.fill || C.ink };
  if (o.a) a['text-anchor'] = o.a; if (o.halo) { a.stroke = '#fff'; a['stroke-width'] = 3.5; a['paint-order'] = 'stroke'; a['stroke-linejoin'] = 'round' } return T(p, x, y, s, a) }
function para(p, x, y, s, size, maxW, lh, o) { var L = h.wrap(s, size, maxW, o && o.w >= 600); L.forEach(function (l, i) { tx(p, x, y + i * lh, l, size, o) }); return L.length }
function box(p, x, y, w, hh, fill, o) { return E('rect', Object.assign({ x: x, y: y, width: Math.max(0, w), height: hh, fill: fill }, o || {}), p) }
function G(p, t, fx, ms) { return E('g', { 'data-at': t, 'data-fx': fx || 'fade', 'data-ms': ms || 420 }, p) }
function tone(t) { return t === 'warn' ? C.warn : t === 'cmp' ? C.cmp : t === 'g65' ? C.g65 : t === 'gray' ? C.axis : C.main }
function stepPath(pts, X, Y, tEnd) { var d = ''; pts.forEach(function (q, i) { d += (i ? 'H' + X(q[0]).toFixed(1) + 'V' + Y(q[1]).toFixed(1) : 'M' + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1)) });
  if (tEnd != null) d += 'H' + X(tEnd).toFixed(1); return d }
function linePath(pts, X, Y) { return pts.map(function (q, i) { return (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1) }).join('') }
function grid(p, x0, x1, Y, ticks, fmt) { ticks.forEach(function (v) { E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.mute : C.grid, 'stroke-dasharray': v === 0 ? null : '3 4' }, p);
  tx(p, x0 - 8, Y(v) + 4.5, fmt ? fmt(v) : String(v), 12.5, { a: 'end', fill: C.mute }) }) }
function nf(v, d, o) { return h.nf(v, d, o) }

/* ───── tlvert 세로 연표 ─────
   rows[{year,title,sub,value,now}] · unit · dec · vmax · barTitle */
ECOM.parts.tlvert = function (bd, s, ctx) {
  var svg = ctx.svg(512), rows = s.rows || [], n = rows.length, y0 = 34, rh = (512 - y0) / n, xr = 130, xt = 166, xb = 770, bw = 300, dec = s.dec == null ? 2 : s.dec, un = s.unit || '';
  var vmax = s.vmax || Math.max.apply(null, rows.map(function (r) { return r.value }));
  tx(svg, xb, 18, s.barTitle || '', 13.5, { w: 700, fill: C.mute });
  E('line', { x1: xr, x2: xr, y1: y0 + rh / 2, y2: 512 - rh / 2, stroke: C.g40, 'stroke-width': 3, 'data-at': 60, 'data-fx': 'draw', 'data-ms': n * 200 }, svg);
  rows.forEach(function (r, i) { var cy = y0 + i * rh + rh / 2, t = 160 + i * 230, g = G(svg, t, 'rise', 380), now = !!r.now;
    if (i) E('line', { x1: xt, x2: 1168, y1: y0 + i * rh, y2: y0 + i * rh, stroke: C.grid }, g);
    tx(g, xr - 24, cy + 7, r.year, 21, { w: 700, a: 'end', fill: now ? C.dark : C.cmp });
    E('circle', { cx: xr, cy: cy, r: now ? 10 : 8, fill: now ? C.main : '#fff', stroke: C.main, 'stroke-width': 3 }, g);
    tx(g, xt, cy - 4, r.title, 17, { w: 700, fill: now ? C.dark : C.ink }); tx(g, xt, cy + 17, r.sub || '', 13.5, { fill: C.mute });
    box(g, xb, cy - 11, bw, 22, C.well, { rx: 4 });
    var w = Math.max(5, r.value / vmax * bw);
    E('rect', { x: xb, y: cy - 11, width: w, height: 22, rx: 4, fill: now ? C.main : C.g40, 'data-at': t + 160, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 500 }, svg);
    tx(g, xb + bw + 12, cy + 6, nf(r.value, dec) + un, 17, { w: 700, fill: now ? C.dark : C.ink }) }) };

/* ───── tlpar 평행 타임라인 ─────
   from · to(소수 연도) · ticks[연도] · y{max,ticks} · unit · lanes[{name,sub,color,data:[월별],marks:[{i,text,v,pos,dx}]}] · gap{a:[lane,mark],b:[lane,mark],text} */
ECOM.parts.tlpar = function (bd, s, ctx) {
  var svg = ctx.svg(512), L = s.lanes || [], n = (L[0].data || []).length, x0 = 64, x1 = 1140, ph = 214, tops = [14, 270], ymax = (s.y && s.y.max) || 6, ticks = (s.y && s.y.ticks) || [0, 2, 4, 6], un = s.unit || '%';
  var X = function (i) { return x0 + (x1 - x0) * (i + .5) / n };
  var marks = {};
  L.forEach(function (ln, k) { var top = tops[k] + 46, bot = tops[k] + ph - 10, Y = h.lin(0, ymax, bot, top), c = tone(ln.color || (k ? 'cmp' : 'main')), g0 = G(svg, 40 + k * 120, 'fade', 360);
    box(g0, 0, tops[k], 1168, ph, k ? '#F6F8F7' : C.g08, { rx: 10 });
    tx(g0, 14, tops[k] + 22, ln.name, 17, { w: 700, fill: c }); tx(g0, 14 + h.textW(ln.name, 17, 1) + 10, tops[k] + 22, ln.sub || '', 13, { fill: C.mute });
    grid(g0, x0, x1, Y, ticks, function (v) { return v + un });
    var pts = ln.data.map(function (v, i) { return [i, v] });
    E('path', { d: stepPath(pts, X, Y, n - 1), fill: 'none', stroke: c, 'stroke-width': 3.2, 'stroke-linejoin': 'round', 'data-at': 260 + k * 150, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var gm = G(svg, 1500 + k * 300, 'pop', 320);
    (ln.marks || []).forEach(function (m, j) { var px = X(m.i), py = Y(m.v); marks[k + ',' + j] = { x: px, y: py, top: tops[k], ph: ph };
      E('circle', { cx: px, cy: py, r: 6, fill: '#fff', stroke: c, 'stroke-width': 3 }, gm);
      var above = m.pos !== 'below', w = h.textW(m.text, 13, 1) + 18, bx = Math.min(x1 + 10 - w, Math.max(4, px - w / 2 + (m.dx || 0))), by = above ? py - 44 : py + 14;
      E('line', { x1: px, x2: px, y1: above ? py - 6 : py + 6, y2: above ? by + 28 : by, stroke: c, 'stroke-width': 1.3 }, gm);
      box(gm, bx, by, w, 28, '#fff', { rx: 6, stroke: c, 'stroke-width': 1.5 }); tx(gm, bx + w / 2, by + 19, m.text, 13, { w: 700, a: 'middle', fill: c }) }) });
  var gx = G(svg, 80, 'fade', 300);
  (s.ticks || []).forEach(function (yr) { var i = (yr - s.from) * 12; if (i < -.5 || i > n) return; var x = X(i - .5); E('line', { x1: x, x2: x, y1: 486, y2: 492, stroke: C.axis }, gx); tx(gx, x, 508, String(yr), 12.5, { a: 'middle', fill: C.mute }) });
  if (s.gap) { var a = marks[s.gap.a.join(',')], b = marks[s.gap.b.join(',')], gy = 252, gg = G(svg, 2600, 'fade', 500);
    [a, b].forEach(function (q) { E('line', { x1: q.x, x2: q.x, y1: q.y + 7, y2: gy + 4, stroke: C.dark, 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, gg) });
    var qa = Math.min(a.x, b.x), qb = Math.max(a.x, b.x); E('line', { x1: qa, x2: qb, y1: gy, y2: gy, stroke: C.dark, 'stroke-width': 2 }, gg);
    var lw = h.textW(s.gap.text, 13.5, 1) + 20; box(gg, (qa + qb) / 2 - lw / 2, gy - 12, lw, 24, C.dark, { rx: 12 }); tx(gg, (qa + qb) / 2, gy + 5, s.gap.text, 13.5, { w: 700, a: 'middle', fill: '#fff' }) } };

/* ───── tlgantt 간트 ─────
   from · to(소수 연도) · step(눈금 간격 년) · rows[{name,sub,from,to,label,tone,now}] · nowAt{t,label} · unitNote */
ECOM.parts.tlgantt = function (bd, s, ctx) {
  var svg = ctx.svg(512), rows = s.rows || [], n = rows.length, gx0 = 262, gx1 = 1150, y0 = 34, rh = (512 - y0 - 44) / n, X = h.lin(s.from, s.to, gx0, gx1), step = s.step || 2;
  var g0 = G(svg, 0, 'fade', 300);
  for (var yr = Math.ceil(s.from / step) * step; yr <= s.to; yr += step) { E('line', { x1: X(yr), x2: X(yr), y1: y0 - 6, y2: 484, stroke: C.grid }, g0); tx(g0, X(yr), 18, String(yr), 13, { a: 'middle', fill: C.mute, w: 700 }) }
  rows.forEach(function (r, i) { var y = y0 + i * rh, cy = y + rh / 2, t = 200 + i * 260, c = tone(r.tone), g = G(svg, t, 'fade', 300);
    if (i % 2 === 0) box(g0, 0, y, 1168, rh, '#F6F8F7');
    tx(g, 14, cy - 2, r.name, 16, { w: 700, fill: r.now ? C.dark : C.ink }); tx(g, 14, cy + 17, r.sub || '', 13, { fill: C.mute });
    var xa = X(r.from), xb = X(r.to), w = Math.max(xb - xa, 7);
    E('rect', { x: xa, y: cy - 15, width: w, height: 30, rx: 6, fill: c, 'data-at': t + 80, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 520 }, svg);
    var lab = r.label || '', lw = h.textW(lab, 14, 1);
    var g2 = G(svg, t + 480, 'fade', 300);
    if (lw + 14 <= w) tx(g2, xa + w / 2, cy + 5, lab, 14, { w: 700, a: 'middle', fill: '#fff' });
    else if (xb + 10 + lw <= gx1) tx(g2, xb + 10, cy + 5, lab, 14, { w: 700, fill: c });
    else tx(g2, xa - 10, cy + 5, lab, 14, { w: 700, a: 'end', fill: c }) });
  if (s.nowAt) { var nx = X(s.nowAt.t), gn = G(svg, 200 + n * 260 + 300, 'fade', 400); E('line', { x1: nx, x2: nx, y1: y0 - 4, y2: 484, stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gn);
    var w2 = h.textW(s.nowAt.label, 13, 1) + 20; box(gn, nx - w2 + 6, 486, w2, 24, C.dark, { rx: 12 }); tx(gn, nx - w2 / 2 + 6, 502.5, s.nowAt.label, 13, { w: 700, a: 'middle', fill: '#fff' }) } };

/* ───── tlcount 카운트다운 칸 ─────
   today{label,t(일 번호 0)} · span(일) · ticks[{d,label}] · cards[{label,date,d(오늘로부터 일수),sub,value,hero}] */
ECOM.parts.tlcount = function (bd, s, ctx) {
  var svg = ctx.svg(512), cs = s.cards || [], n = cs.length, gap = 20, cw = (1168 - gap * (n - 1)) / n, ch = 244, ay = 428, ax0 = 30, ax1 = 1138, X = h.lin(0, s.span, ax0, ax1);
  var ga = G(svg, 0, 'fade', 300);
  E('line', { x1: ax0, x2: ax1, y1: ay, y2: ay, stroke: C.axis, 'stroke-width': 2 }, ga);
  (s.ticks || []).forEach(function (q) { E('line', { x1: X(q.d), x2: X(q.d), y1: ay - 5, y2: ay + 5, stroke: C.axis }, ga); tx(ga, X(q.d), ay + 24, q.label, 12.5, { a: 'middle', fill: C.mute }) });
  var pass = cs.map(function (c) { return c.d }); var tmax = Math.max.apply(null, pass);
  E('line', { x1: X(0), x2: X(tmax), y1: ay, y2: ay, stroke: C.main, 'stroke-width': 5, 'stroke-linecap': 'round', 'data-at': 900, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  E('circle', { cx: X(0), cy: ay, r: 8, fill: C.dark }, ga); var tw0 = h.textW(s.today.label, 13.5, 1) + 20, tl0 = Math.max(0, X(0) - tw0 / 2); box(ga, tl0, ay - 42, tw0, 24, C.dark, { rx: 12 }); tx(ga, tl0 + tw0 / 2, ay - 25.5, s.today.label, 13.5, { a: 'middle', w: 700, fill: '#fff' });
  cs.forEach(function (c, i) { var x = i * (cw + gap), t = 150 + i * 220, hero = !!c.hero, tc = hero ? '#fff' : C.ink, mx = X(c.d), g = G(svg, t, 'rise', 400);
    var path = 'M' + (x + cw / 2) + ' ' + (ch + 2) + 'C' + (x + cw / 2) + ' ' + (ch + 80) + ',' + mx + ' ' + (ay - 90) + ',' + mx + ' ' + (ay - 10);
    E('path', { d: path, fill: 'none', stroke: hero ? C.main : C.g40, 'stroke-width': hero ? 2.4 : 1.8, 'stroke-dasharray': hero ? null : '4 3', 'data-at': t + 300, 'data-fx': 'draw', 'data-ms': 500 }, svg);
    box(g, x, 0, cw, ch, hero ? C.dark : '#fff', { rx: 14, stroke: hero ? C.dark : C.line, 'stroke-width': 1.5 });
    tx(g, x + 18, 34, c.label, 16, { w: 700, fill: hero ? C.on : C.g }); tx(g, x + 18, 58, c.date, 14, { fill: hero ? '#CFE9DD' : C.mute });
    tx(g, x + 18, 132, 'D-' + c.d, 58, { w: 700, fill: tc }); tx(g, x + 18 + h.textW('D-' + c.d, 58, 1) + 8, 132, '일 남음', 17, { w: 700, fill: hero ? '#CFE9DD' : C.mute });
    E('line', { x1: x + 18, x2: x + cw - 18, y1: 156, y2: 156, stroke: hero ? '#2F7A60' : C.line }, g);
    para(g, x + 18, 184, c.sub || '', 14, cw - 36, 20, { fill: hero ? '#E5F3EC' : C.sub });
    if (c.value) tx(g, x + 18, ch - 16, c.value, 15, { w: 700, fill: hero ? C.on : C.dark });
    E('circle', { cx: mx, cy: ay, r: hero ? 9 : 7, fill: hero ? C.main : '#fff', stroke: C.main, 'stroke-width': 3, 'data-at': t + 700, 'data-fx': 'pop', 'data-ms': 300 }, svg) });
  var gg = G(svg, 1900, 'fade', 400); var sorted = cs.slice().sort(function (a, b) { return a.d - b.d }), prev = 0;
  sorted.forEach(function (c) { var d = c.d - prev, xa = X(prev), xb = X(c.d); if (d > 0 && xb - xa > 70) { var lw = h.textW(d + '일', 13, 1) + 14; box(gg, (xa + xb) / 2 - lw / 2, ay + 36, lw, 22, C.g08, { rx: 11 }); tx(gg, (xa + xb) / 2, ay + 52, d + '일', 13, { a: 'middle', w: 700, fill: C.dark }) } prev = c.d }) };

/* ───── tleras 시대 구분 띠 ─────
   from · to(소수 연도) · data(월별 값, from 부터) · y{min,max,ticks} · unit · eras[{name,from,to,range,nums:[{v,label}],tone}] */
ECOM.parts.tleras = function (bd, s, ctx) {
  var svg = ctx.svg(512), eras = s.eras || [], x0 = 44, x1 = 1168, X = h.lin(s.from, s.to, x0, x1), yb0 = 0, bh = 66, cy0 = 78, cy1 = 296, ymin = s.y.min, ymax = s.y.max, Y = h.lin(ymin, ymax, cy1, cy0 + 8), un = s.unit || '%';
  var gb = G(svg, 0, 'fade', 300);
  eras.forEach(function (e, k) { var xa = X(e.from), xb = X(e.to), w = xb - xa, now = k === eras.length - 1;
    box(gb, xa + 1, cy0, w - 2, cy1 - cy0 + 6, now ? C.g18 : (k % 2 ? '#F3F7F5' : C.g08));
    var g = G(svg, 150 + k * 190, 'rise', 340); box(g, xa + 1, yb0, w - 2, bh, now ? C.dark : (k % 2 ? C.main : C.g65), { rx: 8 });
    var lines = h.wrap(e.name, 15, w - 14, 1); lines.forEach(function (l, i) { tx(g, xa + w / 2, 22 + i * 18, l, 15, { w: 700, a: 'middle', fill: '#fff' }) });
    tx(g, xa + w / 2, bh - 8, e.range, 12.5, { a: 'middle', fill: '#DDEEE7' }) });
  grid(gb, x0, x1, Y, s.y.ticks, function (v) { return v + '' }); tx(gb, x0 - 8, cy0 - 2, un, 12.5, { a: 'end', w: 700, fill: C.mute });
  var pts = s.data.map(function (v, i) { return v == null ? null : [s.from + i / 12, v] }).filter(Boolean);
  E('path', { d: linePath(pts, X, Y), fill: 'none', stroke: C.dark, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-at': 200, 'data-fx': 'draw', 'data-ms': 1700 }, svg);
  var ex = pts[pts.length - 1]; E('circle', { cx: X(ex[0]), cy: Y(ex[1]), r: 5, fill: C.dark, 'data-at': 1900, 'data-fx': 'pop' }, svg);
  tx(svg, X(ex[0]) - 8, Y(ex[1]) - 10, nf(ex[1], 1) + un, 13.5, { w: 700, a: 'end', fill: C.dark, halo: 1 });
  eras.forEach(function (e, k) { var xa = X(e.from), xb = X(e.to), w = xb - xa, g = G(svg, 1000 + k * 220, 'rise', 360), now = k === eras.length - 1;
    box(g, xa + 3, cy1 + 16, w - 6, 512 - cy1 - 18, now ? C.g08 : '#fff', { rx: 10, stroke: now ? C.main : C.line, 'stroke-width': now ? 2 : 1.3 });
    var yy = cy1 + 40; (e.nums || []).forEach(function (q, i) { tx(g, xa + 14, yy + i * 70 + 24, q.v, 25, { w: 700, fill: now ? C.dark : C.ink }); para(g, xa + 14, yy + i * 70 + 44, q.label, 12.5, w - 28, 16, { fill: C.mute }) }) }) };

/* ───── tlterm 임기 막대 ─────
   from · to(소수 연도) · data(월별 값) · y{min,max,ticks} · unit · chartTitle · chairs[{name,from,to,range,decision,tone,clipL,end}] */
ECOM.parts.tlterm = function (bd, s, ctx) {
  var svg = ctx.svg(512), x0 = 56, x1 = 1150, X = h.lin(s.from, s.to, x0, x1), cy0 = 24, cy1 = 206, Y = h.lin(s.y.min, s.y.max, cy1, cy0), un = s.unit || '%', chairs = s.chairs || [];
  var gb = G(svg, 0, 'fade', 300); grid(gb, x0, x1, Y, s.y.ticks, function (v) { return v + '' }); tx(gb, x0 - 8, cy0 - 8, un, 12.5, { a: 'end', w: 700, fill: C.mute }); tx(gb, x0 + 6, cy0 - 6, s.chartTitle || '', 13.5, { w: 700, fill: C.mute });
  var by = 240, rh = (512 - by) / chairs.length;
  chairs.forEach(function (c, k) { var xa = X(Math.max(c.from, s.from)), xb = X(Math.min(c.to, s.to)); box(gb, xa, cy0 - 6, xb - xa, cy1 - cy0 + 12, k % 2 ? '#F3F7F5' : C.g08) });
  var pts = s.data.map(function (v, i) { return [s.from + i / 12, v] }); E('path', { d: linePath(pts, X, Y), fill: 'none', stroke: C.dark, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-at': 200, 'data-fx': 'draw', 'data-ms': 1500 }, svg);
  for (var yr = 2004; yr <= s.to; yr += 4) { E('line', { x1: X(yr), x2: X(yr), y1: cy1, y2: cy1 + 5, stroke: C.axis }, gb); tx(gb, X(yr), cy1 + 22, String(yr), 12.5, { a: 'middle', fill: C.mute }) }
  chairs.forEach(function (c, k) { var y = by + k * rh, t = 900 + k * 330, g = G(svg, t, 'rise', 380), xa = X(Math.max(c.from, s.from)), xb = X(Math.min(c.to, s.to)), col = tone(c.tone), w = xb - xa, bh = 32;
    E('line', { x1: xa, x2: xa, y1: cy1 + 6, y2: y + 8, stroke: col, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
    E('rect', { x: xa, y: y + 8, width: w, height: bh, rx: 6, fill: col, 'data-at': t + 80, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 500 }, svg);
    var nm = c.name + (w > 160 ? ' ' + c.range : ''), g2 = G(svg, t + 450, 'fade', 300);
    if (h.textW(nm, 14.5, 1) + 16 <= w) tx(g2, xa + 10, y + 29, nm, 14.5, { w: 700, fill: '#fff' }); else tx(g2, xa + 8, y + 29, c.name, 14.5, { w: 700, fill: '#fff' });
    var sub = (c.span || '') + (c.range ? ' · 임기 중 ' + c.range : ''), dl = c.decision || '', left = xa > 700;
    var ax = left ? xa - 12 : xb + 12, an = left ? 'end' : 'start';
    tx(g2, ax, y + 22, dl, 14.5, { w: 700, a: an, fill: C.ink }); tx(g2, ax, y + 41, sub, 13, { a: an, fill: C.mute }) }) };

/* ───── tlzoom 펼친 구간 타임라인 ─────
   full{from,to,pts[[t,v]],ticks[연도]} · y{max,ticks} · unit · win{from,to,title,sub} · zoom{pts[[t,v]],ticks[{t,label}],changes[{t,v,text,pos}]} */
ECOM.parts.tlzoom = function (bd, s, ctx) {
  var svg = ctx.svg(512), F = s.full, W = s.win, Z = s.zoom, x0 = 60, x1 = 1150, ymax = s.y.max, un = s.unit || '%';
  var XF = h.lin(F.from, F.to, x0, x1), fy0 = 34, fy1 = 100, YF = h.lin(0, ymax, fy1, fy0), g0 = G(svg, 0, 'fade', 300);
  box(g0, 0, 0, 1168, 138, '#F6F8F7', { rx: 10 }); tx(g0, 14, 18, s.fullTitle || '', 13.5, { w: 700, fill: C.mute });
  [0, ymax / 2, ymax].forEach(function (v) { E('line', { x1: x0, x2: x1, y1: YF(v), y2: YF(v), stroke: C.grid }, g0); tx(g0, x0 - 8, YF(v) + 4.5, nf(v, 0), 12.5, { a: 'end', fill: C.mute }) });
  F.ticks.forEach(function (yr) { tx(g0, XF(yr), 128, String(yr), 12.5, { a: 'middle', fill: C.mute }) });
  var wa = XF(W.from), wb = XF(W.to); box(g0, wa, fy0 - 8, wb - wa, fy1 - fy0 + 12, C.g18);
  E('path', { d: stepPath(F.pts, XF, YF, F.to), fill: 'none', stroke: C.cmp, 'stroke-width': 2.4, 'data-at': 150, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  var gz = G(svg, 1100, 'fade', 500); E('path', { d: 'M' + wa + ' 140L' + wb + ' 140L' + x1 + ' 214L' + x0 + ' 214Z', fill: C.g08, stroke: C.g40, 'stroke-width': 1 }, gz);
  var wl = W.title; var lw = h.textW(wl, 13.5, 1) + 20; box(gz, (wa + wb) / 2 - lw / 2, 152, lw, 24, C.dark, { rx: 12 }); tx(gz, (wa + wb) / 2, 168.5, wl, 13.5, { w: 700, a: 'middle', fill: '#fff' });
  var zy0 = 250, zy1 = 456, XZ = h.lin(W.from, W.to, x0, x1), YZ = h.lin(0, ymax, zy1, zy0), gp = G(svg, 1500, 'fade', 400);
  box(gp, 0, 218, 1168, 294, '#fff', { rx: 10, stroke: C.line });
  tx(gp, 14, 238, s.zoomTitle || '', 15, { w: 700, fill: C.dark });
  [0, ymax / 2, ymax].forEach(function (v) { E('line', { x1: x0, x2: x1, y1: YZ(v), y2: YZ(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, gp); tx(gp, x0 - 8, YZ(v) + 4.5, nf(v, 0), 12.5, { a: 'end', fill: C.mute }) });
  Z.ticks.forEach(function (q) { E('line', { x1: XZ(q.t), x2: XZ(q.t), y1: zy1, y2: zy1 + 5, stroke: C.axis }, gp); tx(gp, XZ(q.t), zy1 + 22, q.label, 12.5, { a: 'middle', fill: C.mute }) });
  var zp = Z.pts.slice(); E('path', { d: stepPath(zp, XZ, YZ, W.to), fill: 'none', stroke: C.main, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'data-at': 1700, 'data-fx': 'draw', 'data-ms': 1500 }, svg);
  var gc = G(svg, 2800, 'pop', 400), lastx = -99, flip = 0;
  Z.changes.forEach(function (c, i) { var px = XZ(c.t), py = YZ(c.v), up = c.up !== false; E('circle', { cx: px, cy: py, r: 4.2, fill: '#fff', stroke: up ? C.main : C.cmp, 'stroke-width': 2.4 }, gc);
    var below = (px - lastx < 44) ? !flip : false; flip = below ? 1 : 0; lastx = px;
    tx(gc, px, below ? py + 22 : py - 12, c.text, 12.5, { w: 700, a: 'middle', fill: up ? C.dark : C.cmp, halo: 1 }) });
  if (s.zoomNote) { var gnn = G(svg, 3100, 'fade', 400); tx(gnn, x1, 238, s.zoomNote, 14, { a: 'end', w: 700, fill: C.dark }) } };

/* ───── tlclock 24시간 시계 ─────
   center{label,sub} · work{from,to,label} · items[{t:'22:30',name,sub,tag,tone,next}] (한국 시각) */
ECOM.parts.tlclock = function (bd, s, ctx) {
  var svg = ctx.svg(512), cx = 262, cy = 256, R = 236, items = s.items || [], g0 = G(svg, 0, 'fade', 300);
  var ang = function (hr) { return hr / 24 * 2 * Math.PI - Math.PI / 2 }, pt = function (hr, r) { var a = ang(hr); return [cx + r * Math.cos(a), cy + r * Math.sin(a)] };
  E('circle', { cx: cx, cy: cy, r: R, fill: '#fff', stroke: C.g40, 'stroke-width': 2 }, g0);
  if (s.work) { var a0 = pt(s.work.from, 198), a1 = pt(s.work.to, 198), b0 = pt(s.work.to, 118), b1 = pt(s.work.from, 118);
    E('path', { d: 'M' + a0 + 'A198 198 0 0 1 ' + a1 + 'L' + b0 + 'A118 118 0 0 0 ' + b1 + 'Z', fill: C.g08 }, g0); var lp = pt((s.work.from + s.work.to) / 2, 142); tx(g0, lp[0], lp[1] + 4, s.work.label, 12.5, { a: 'middle', fill: C.g, w: 700 }) }
  for (var hr = 0; hr < 24; hr++) { var p0 = pt(hr, R - (hr % 3 ? 7 : 12)), p1 = pt(hr, R); E('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: C.axis, 'stroke-width': hr % 3 ? 1 : 2 }, g0);
    if (hr % 3 === 0) { var lq = pt(hr, R - 26); tx(g0, lq[0], lq[1] + 5, String(hr), 14, { a: 'middle', w: 700, fill: C.cmp }) } }
  tx(g0, cx, cy - 6, s.center.label, 20, { a: 'middle', w: 700, fill: C.dark }); tx(g0, cx, cy + 16, s.center.sub, 13, { a: 'middle', fill: C.mute });
  var order = items.map(function (it, i) { var p = it.t.split(':'); return { it: it, i: i, hr: +p[0] + (+p[1]) / 60 } }), prev = -99, ring = 0;
  order.sort(function (a, b) { return a.hr - b.hr });
  order.forEach(function (o) { ring = (o.hr - prev < 0.8) ? 1 - ring : 0; prev = o.hr; o.ring = ring });
  var X0 = 590, rh = 512 / items.length;
  order.forEach(function (o, k) { var it = o.it, c = tone(it.tone), t = 200 + k * 260, g = G(svg, t, 'pop', 340), r = o.ring ? 94 : 168;
    var pm = pt(o.hr, r), pe = pt(o.hr, R - 14); E('line', { x1: pm[0], y1: pm[1], x2: pe[0], y2: pe[1], stroke: c, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, g);
    E('circle', { cx: pm[0], cy: pm[1], r: 15, fill: c }, g); tx(g, pm[0], pm[1] + 5.5, String(k + 1), 15, { a: 'middle', w: 700, fill: '#fff' });
    var y = k * rh, gl = G(svg, t + 100, 'left', 380);
    if (k) E('line', { x1: X0 - 6, x2: 1168, y1: y, y2: y, stroke: C.grid }, gl);
    E('circle', { cx: X0 + 12, cy: y + rh / 2, r: 13, fill: c }, gl); tx(gl, X0 + 12, y + rh / 2 + 5, String(k + 1), 14, { a: 'middle', w: 700, fill: '#fff' });
    tx(gl, X0 + 40, y + rh / 2 + 8, it.t, 25, { w: 700, fill: C.ink }); if (it.next) tx(gl, X0 + 40 + h.textW(it.t, 25, 1) + 8, y + rh / 2 + 7, '다음 날', 12.5, { w: 700, fill: C.mute });
    tx(gl, X0 + 190, y + rh / 2 - 3, it.name, 16, { w: 700, fill: C.ink }); tx(gl, X0 + 190, y + rh / 2 + 17, it.sub, 13, { fill: C.mute });
    var tw = h.textW(it.tag, 12.5, 1) + 18; box(gl, 1168 - tw, y + rh / 2 - 12, tw, 24, c, { rx: 12 }); tx(gl, 1168 - tw / 2, y + rh / 2 + 4.5, it.tag, 12.5, { a: 'middle', w: 700, fill: '#fff' }) }) };

/* ───── tlmile 단계 이정표 ─────
   stages[{name,years,sub,value(숫자),label,tone}] · valueTitle · dec · unit */
ECOM.parts.tlmile = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = s.stages || [], n = st.length, cw = 1168 / n, roadY = 62, g0 = G(svg, 0, 'fade', 300), dec = s.dec == null ? 1 : s.dec, un = s.unit || '';
  E('line', { x1: cw / 2, x2: 1168 - cw / 2, y1: roadY, y2: roadY, stroke: C.g40, 'stroke-width': 10, 'stroke-linecap': 'round', 'data-at': 60, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  var base = 388, vmaxP = Math.max.apply(null, st.map(function (q) { return Math.max(0, q.value) })), vmaxN = Math.max.apply(null, st.map(function (q) { return Math.max(0, -q.value) })), sc = Math.min(138 / vmaxP, 70 / (vmaxN || 1));
  box(g0, 0, 206, 1168, 306, '#F6F8F7', { rx: 10 }); tx(g0, 16, 232, s.valueTitle || '', 14.5, { w: 700, fill: C.dark });
  E('line', { x1: 20, x2: 1148, y1: base, y2: base, stroke: C.mute, 'stroke-width': 1.3 }, g0);
  st.forEach(function (q, k) { var cxk = cw * k + cw / 2, c = tone(q.tone), t = 200 + k * 380, g = G(svg, t, 'rise', 400), neg = q.value < 0;
    E('circle', { cx: cxk, cy: roadY, r: 21, fill: c, stroke: '#fff', 'stroke-width': 4 }, g); tx(g, cxk, roadY + 7, q.no, 20, { a: 'middle', w: 700, fill: '#fff' });
    tx(g, cxk, 22, q.years, 15.5, { a: 'middle', w: 700, fill: C.cmp });
    var nl = h.wrap(q.name, 17, cw - 30, 1); nl.forEach(function (l, i) { tx(g, cxk, 118 + i * 21, l, 17, { a: 'middle', w: 700, fill: c }) });
    para(g, cxk - (cw - 40) / 2, 118 + nl.length * 21 + 8, q.sub || '', 13, cw - 40, 17, { fill: C.mute });
    var hh = Math.max(4, Math.abs(q.value) * sc), bw = Math.min(110, cw - 70);
    E('rect', { x: cxk - bw / 2, y: neg ? base : base - hh, width: bw, height: hh, rx: 5, fill: neg ? C.cmp : c, 'data-at': t + 300, 'data-fx': neg ? 'grow' : 'grow', 'data-o': neg ? '50% 0%' : '50% 100%', 'data-ms': 600 }, svg);
    var g2 = G(svg, t + 800, 'pop', 300); tx(g2, cxk, neg ? base + hh + 22 : base - hh - 10, nf(q.value, dec, { sign: 1 }) + un, 20, { a: 'middle', w: 700, fill: neg ? C.cmp : C.dark });
    tx(g2, cxk, 503, q.label || '', 12.5, { a: 'middle', fill: C.mute }) }) };

/* ───── tlbill 법안 진행 단계 ─────
   stages[{name,date,vote,now}] · pin(지금 위치 글) · stats[{v,label}] · note · chart{from,to,pts[[t,v]],y{min,max,ticks},mark{t,label},title,unit} */
ECOM.parts.tlbill = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = s.stages || [], n = st.length, ov = 18, cw = (1168 + ov * (n - 1)) / n, cy0 = 44, chh = 78, ar = 26;
  st.forEach(function (q, k) { var xa = k * (cw - ov), xb = xa + cw, t = 120 + k * 230, now = !!q.now, g = G(svg, t, 'rise', 400);
    var d = 'M' + xa + ' ' + cy0 + 'L' + (xb - ar) + ' ' + cy0 + 'L' + xb + ' ' + (cy0 + chh / 2) + 'L' + (xb - ar) + ' ' + (cy0 + chh) + 'L' + xa + ' ' + (cy0 + chh) + (k ? 'L' + (xa + ar) + ' ' + (cy0 + chh / 2) : '') + 'Z';
    E('path', { d: d, fill: now ? C.dark : (k % 2 ? C.g65 : C.main), stroke: '#fff', 'stroke-width': 3 }, g);
    var lines = h.wrap(q.name, 15.5, cw - ar - (k ? ar : 0) - 12, 1), ty = cy0 + chh / 2 - (lines.length - 1) * 9 + 5;
    lines.forEach(function (l, i) { tx(g, (xa + (k ? ar : 8) + xb - ar) / 2, ty + i * 19, l, 15.5, { a: 'middle', w: 700, fill: '#fff' }) });
    var mid = (xa + (k ? ar : 8) + xb - ar) / 2; tx(g, mid, cy0 + chh + 30, q.date, 20, { a: 'middle', w: 700, fill: now ? C.dark : C.ink }); if (q.vote) tx(g, mid, cy0 + chh + 52, q.vote, 14, { a: 'middle', fill: C.mute }); });
  var lk = st.findIndex(function (q) { return q.now }); if (lk < 0) lk = n - 1; var px = lk * (cw - ov) + cw / 2 - 6, gp = G(svg, 120 + n * 230 + 100, 'drop', 500); gp.setAttribute('data-dy', 24);
  var pw = h.textW(s.pin, 14, 1) + 26; box(gp, Math.min(1168 - pw, px - pw / 2) , 0, pw, 28, C.main, { rx: 14 }); tx(gp, Math.min(1168 - pw, px - pw / 2) + pw / 2, 19, s.pin, 14, { a: 'middle', w: 700, fill: '#fff' });
  var gd = G(svg, 120 + n * 230 + 500, 'fade', 500), y0 = 214; box(gd, 0, y0, 1168, 298, '#F6F8F7', { rx: 10 });
  (s.stats || []).forEach(function (q, i) { var y = y0 + 22 + i * 98; tx(gd, 20, y + 38, q.v, 38, { w: 700, fill: i ? C.ink : C.dark }); para(gd, 20, y + 62, q.label, 13.5, 250, 18, { fill: C.mute }) });
  var ch = s.chart, X = h.lin(ch.from, ch.to, 380, 1130), Y = h.lin(ch.y.min, ch.y.max, y0 + 262, y0 + 52); tx(gd, 380, y0 + 26, ch.title, 14.5, { w: 700, fill: C.dark });
  ch.y.ticks.forEach(function (v) { E('line', { x1: 380, x2: 1130, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, gd); tx(gd, 372, Y(v) + 4.5, v + '', 12.5, { a: 'end', fill: C.mute }) });
  for (var yr = Math.ceil(ch.from); yr <= ch.to; yr += 2) tx(gd, X(yr), y0 + 284, String(yr), 12.5, { a: 'middle', fill: C.mute });
  E('path', { d: linePath(ch.pts, X, Y), fill: 'none', stroke: C.cmp, 'stroke-width': 2.8, 'stroke-linejoin': 'round', 'data-at': 120 + n * 230 + 700, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
  var mx = X(ch.mark.t), gm = G(svg, 120 + n * 230 + 1800, 'pop', 400); E('line', { x1: mx, x2: mx, y1: y0 + 44, y2: y0 + 262, stroke: C.dark, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, gm);
  var mw = h.textW(ch.mark.label, 13, 1) + 18; box(gm, mx - mw - 6, y0 + 40, mw, 24, C.dark, { rx: 12 }); tx(gm, mx - mw / 2 - 6, y0 + 56.5, ch.mark.label, 13, { a: 'middle', w: 700, fill: '#fff' });
  var ep = ch.pts[ch.pts.length - 1]; E('circle', { cx: X(ep[0]), cy: Y(ep[1]), r: 5, fill: C.dark, 'data-at': 120 + n * 230 + 1800, 'data-fx': 'pop' }, svg);
  if (s.note) tx(gd, 1146, y0 + 26, s.note, 13.5, { a: 'end', w: 700, fill: C.dark }) };

/* ───── tlcards 사건 카드 연속 ─────
   cards[{date,title,text,stat:{label,value}}] · chart{from,to(일 번호),pts[[d,v]],y{min,max,ticks},title,ticks[{d,label}],marks[{d,v}]} */
ECOM.parts.tlcards = function (bd, s, ctx) {
  var svg = ctx.svg(512), cs = s.cards || [], n = cs.length, gap = 26, cw = (1168 - gap * (n - 1)) / n, chh = 222, ch = s.chart, X = h.lin(ch.from, ch.to, 70, 1130), cy0 = 312, cy1 = 470, Y = h.lin(ch.y.min, ch.y.max, cy1, cy0);
  var gc = G(svg, 0, 'fade', 300); box(gc, 0, 268, 1168, 244, '#F6F8F7', { rx: 10 }); tx(gc, 16, 292, ch.title, 14.5, { w: 700, fill: C.dark });
  ch.y.ticks.forEach(function (v) { E('line', { x1: 70, x2: 1130, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, gc); tx(gc, 62, Y(v) + 4.5, v + '', 12.5, { a: 'end', fill: C.mute }) });
  ch.ticks.forEach(function (q) { tx(gc, X(q.d), 498, q.label, 12.5, { a: 'middle', fill: C.mute }) });
  E('path', { d: linePath(ch.pts, X, Y), fill: 'none', stroke: C.cmp, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-at': 200, 'data-fx': 'draw', 'data-ms': 2200 }, svg);
  cs.forEach(function (c, i) { var x = i * (cw + gap), t = 300 + i * 450, g = G(svg, t, 'rise', 420), m = ch.marks[i], mx = X(m.d), my = Y(m.v), last = i === n - 1;
    if (i) { var ay = 44; E('path', { d: 'M' + (x - gap + 5) + ' ' + ay + 'L' + (x - 4) + ' ' + ay, stroke: C.g65, 'stroke-width': 2.4, fill: 'none' }, g); E('path', { d: 'M' + (x - 11) + ' ' + (ay - 6) + 'L' + (x - 3) + ' ' + ay + 'L' + (x - 11) + ' ' + (ay + 6), stroke: C.g65, 'stroke-width': 2.4, fill: 'none' }, g) }
    box(g, x, 0, cw, chh, '#fff', { rx: 14, stroke: last ? C.main : C.line, 'stroke-width': last ? 2.2 : 1.4 });
    var dw = h.textW(c.date, 14, 1) + 22; box(g, x + 14, 14, dw, 26, last ? C.dark : C.main, { rx: 13 }); tx(g, x + 14 + dw / 2, 32, c.date, 14, { a: 'middle', w: 700, fill: '#fff' });
    var nl = para(g, x + 16, 66, c.title, 16, cw - 32, 21, { w: 700, fill: C.ink }); para(g, x + 16, 66 + nl * 21 + 8, c.text, 13, cw - 32, 17.5, { fill: C.sub });
    E('line', { x1: x + 16, x2: x + cw - 16, y1: chh - 52, y2: chh - 52, stroke: C.line }, g); tx(g, x + 16, chh - 31, c.stat.label, 12.5, { fill: C.mute }); tx(g, x + 16, chh - 10, c.stat.value, 17, { w: 700, fill: C.dark });
    var p = 'M' + (x + cw / 2) + ' ' + (chh + 2) + 'C' + (x + cw / 2) + ' ' + (chh + 40) + ',' + mx + ' ' + (my - 50) + ',' + mx + ' ' + (my - 8);
    E('path', { d: p, fill: 'none', stroke: C.g40, 'stroke-width': 1.8, 'stroke-dasharray': '4 3', 'data-at': t + 300, 'data-fx': 'draw', 'data-ms': 500 }, svg);
    var gm = G(svg, t + 600, 'pop', 300); E('circle', { cx: mx, cy: my, r: 6.5, fill: '#fff', stroke: C.main, 'stroke-width': 3 }, gm); tx(gm, mx, my + 22, String(i + 1), 12.5, { a: 'middle', w: 700, fill: C.main, halo: 1 }) }) };
})();
