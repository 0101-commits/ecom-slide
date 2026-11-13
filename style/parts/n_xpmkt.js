/* xp 계열 2(발표 뒤 시장 · 일정 4판) — xpmin · xpdot · xpprob · xpsched · xpband. 형식 = style/SCHEMA4_F04.md
   xpmin  : 발표 전후 선 두 칸(세로 발표선 + 전날 기준 점선 + 변화 큰 글자)
   xpdot  : 점도표(위원마다 점, 중앙값 선, 지난번 → 이번 + 수준별 위원 수 변화)
   xpprob : 확률 쌓기 막대 전 · 후(같은 칸끼리 리본으로 이음)
   xpsched: 세로 시간 줄 위 발표 일정 카드
   xpband : 발표치 구간(행) × 시장 반응(열) 방향 표 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;

/* ── xpmin : panels[{name,unit,dec,pts[[label,v]],at,delta,deltaSub}] 2칸 · event{label,sub} */
ECOM.parts.xpmin = function (bd, s, ctx) {
  var P = (s.panels || []).slice(0, 2), np = P.length; if (!np) return; var svg = ctx.svg(512), gap = 32, pw = (1168 - (np - 1) * gap) / np, ev = s.event || {};
  P.forEach(function (p, k) { var x = k * (pw + gap), g = h.at(svg, k * 300, { 'data-fx': 'fade' }), pts = p.pts || [], n = pts.length, at = p.at, dec = p.dec != null ? p.dec : 2, vs = pts.map(function (q) { return +q[1] });
    var lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs), pad = (hi - lo) * .2, nt = h.niceTicks(lo - pad, hi + pad, 4), cx0 = x + 74, cx1 = x + pw - 28, cT = 176, cB = 430, Y = h.lin(nt.lo, nt.hi, cB, cT), Xp = function (i) { return cx0 + (cx1 - cx0) * i / (n - 1) };
    E('rect', { x: x, y: 2, width: pw, height: 506, rx: 14, fill: '#fff', stroke: C.line, 'stroke-width': 1.2 }, g);
    T(g, x + 24, 38, p.name, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); T(g, x + 24, 60, p.sub || ('일별, 단위: ' + (p.unit || '')), { 'font-size': 13, fill: C.mute });
    T(g, x + pw - 24, 50, p.delta || '', { 'text-anchor': 'end', 'font-size': 40, 'font-weight': 700, fill: C.dark }); T(g, x + pw - 24, 76, p.deltaSub || '', { 'text-anchor': 'end', 'font-size': 13, fill: C.mute });
    for (var v = nt.lo; v <= nt.hi + nt.step / 1000; v += nt.step) { E('line', { x1: cx0 - 6, x2: cx1, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, g); T(g, cx0 - 12, Y(v) + 4.5, h.nf(v, nt.step < 1 ? (nt.step < .1 ? 2 : 1) : 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
    E('rect', { x: Xp(at), y: cT - 18, width: cx1 - Xp(at) + 10, height: cB - cT + 18, fill: C.g08 }, g);
    E('line', { x1: Xp(at), x2: Xp(at), y1: cT - 26, y2: cB + 6, stroke: C.dark, 'stroke-width': 2.2 }, g);
    var cw = h.textW(ev.label || '발표', 13, 1) + 22; E('rect', { x: Xp(at) - cw / 2, y: 100, width: cw, height: 26, rx: 13, fill: C.dark }, g); T(g, Xp(at), 118, ev.label || '발표', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    if (ev.sub) T(g, Xp(at), 144, ev.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.dark });
    var d = 'M' + pts.map(function (q, i) { return Xp(i).toFixed(1) + ' ' + Y(+q[1]).toFixed(1) }).join(' L');
    E('line', { x1: Xp(at - 1), x2: cx1, y1: Y(vs[at - 1]), y2: Y(vs[at - 1]), stroke: C.axis, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, g);
    E('path', { d: d, fill: 'none', stroke: C.main, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'data-at': 300 + k * 300, 'data-fx': 'draw', 'data-ms': 1400 }, svg);
    var g2 = h.at(svg, 1500 + k * 300, { 'data-fx': 'fade' });
    pts.forEach(function (q, i) { E('circle', { cx: Xp(i), cy: Y(+q[1]), r: i === at - 1 || i === at ? 6 : 3.4, fill: i === at ? C.dark : '#fff', stroke: C.main, 'stroke-width': 2.4 }, g2) });
    T(g2, Xp(at - 1) - 10, Y(vs[at - 1]) + (vs[at] < vs[at - 1] ? -14 : 24), h.nf(vs[at - 1], dec), { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.cmp });
    T(g2, Xp(at) + 12, Y(vs[at]) + (vs[at] < vs[at - 1] ? -12 : 24), h.nf(vs[at], dec), { 'font-size': 15, 'font-weight': 700, fill: C.dark });
    pts.forEach(function (q, i) { if (i % 2 === 0 || i === at) T(g, Xp(i), cB + 28, q[0], { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': i === at ? 700 : 500, fill: i === at ? C.dark : C.mute }) });
    T(g, cx0, cB + 54, (p.foot || ''), { 'font-size': 12.5, fill: C.mute }) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpdot : cols[{name,counts{'3.25':n,…}}] 2칸(지난번 · 이번) · lo · hi · step · who('위원') · rateUnit('%') */
ECOM.parts.xpdot = function (bd, s, ctx) {
  var Cc = (s.cols || []).slice(0, 2), lo = +s.lo, hi = +s.hi, st = +s.step || .25, lv = [], i; if (Cc.length < 2) return; for (var v = hi; v >= lo - 1e-9; v -= st) lv.push(+v.toFixed(4));
  var svg = ctx.svg(512), n = lv.length, top = 64, bot = 500, pitch = (bot - top) / n, Y = function (j) { return top + pitch * j + pitch / 2 }, g0 = h.at(svg, 0, { 'data-fx': 'fade' }), dr = Math.min(10, pitch / 2 - 3), cxs = [250, 530], cwid = 240;
  function med(c) { var arr = []; lv.slice().reverse().forEach(function (l) { for (var q = 0; q < (c.counts[l.toFixed(2)] || c.counts[String(l)] || 0); q++) arr.push(l) }); return arr[Math.floor(arr.length / 2)] }
  function cnt(c, l) { return c.counts[l.toFixed(2)] || c.counts[String(l)] || 0 }
  lv.forEach(function (l, j) { if (j % 2 === 0) E('rect', { x: 0, y: Y(j) - pitch / 2, width: 1168, height: pitch, fill: C.paper }, g0); T(g0, 78, Y(j) + 5, h.nf(l, 2) + '%', { 'text-anchor': 'end', 'font-size': 13.5, fill: C.mute }) });
  Cc.forEach(function (c, k) { var cx = cxs[k], now = k === 1, g = h.at(svg, k * 700, { 'data-fx': 'fade' }); T(g, cx, 20, c.name, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: now ? C.dark : C.mute });
    lv.forEach(function (l, j) { var m = cnt(c, l), sw = Math.min(2 * dr + 4, (cwid - 20) / Math.max(1, m)), x0 = cx - (m - 1) * sw / 2;
      for (var q = 0; q < m; q++) E('circle', { cx: x0 + q * sw, cy: Y(j), r: dr, fill: now ? C.main : '#fff', stroke: now ? C.main : C.axis, 'stroke-width': 2.4, 'data-at': 200 + k * 700 + j * 45 + q * 20, 'data-fx': 'pop' }, svg) });
    var md = med(c), jm = lv.indexOf(md), gm = h.at(svg, 700 + k * 700 + 300, { 'data-fx': 'fade' });
    E('line', { x1: cx - cwid / 2 - 6, x2: cx + cwid / 2 + 6, y1: Y(jm), y2: Y(jm), stroke: C.ink, 'stroke-width': 2.2, 'stroke-dasharray': '7 4' }, gm); c._md = md;
    var tw = h.textW('중앙값 ' + h.nf(md, 2) + '%', 13.5, 1) + 24; E('rect', { x: cx - tw / 2, y: 30, width: tw, height: 24, rx: 12, fill: C.ink }, h.at(svg, k * 700, { 'data-fx': 'fade' })); T(h.at(svg, k * 700, { 'data-fx': 'fade' }), cx, 47, '중앙값 ' + h.nf(md, 2) + '%', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' }) });
  var rx0 = 800, rw = 368, mid = rx0 + rw / 2, gr = h.at(svg, 1700, { 'data-fx': 'fade' }); T(gr, mid, 36, '수준별 ' + (s.who || '위원') + ' 수 변화(이번 − 지난번)', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink });
  E('line', { x1: mid, x2: mid, y1: top, y2: bot, stroke: C.axis, 'stroke-width': 1.4 }, gr);
  var mxd = 1; lv.forEach(function (l) { mxd = Math.max(mxd, Math.abs(cnt(Cc[1], l) - cnt(Cc[0], l))) }); var L = (rw / 2 - 52) / mxd;
  lv.forEach(function (l, j) { var d = cnt(Cc[1], l) - cnt(Cc[0], l); if (!d) return; E('rect', { x: d > 0 ? mid : mid + d * L, y: Y(j) - 10, width: Math.abs(d) * L, height: 20, rx: 3, fill: d > 0 ? C.main : C.g40, 'data-at': 1800 + j * 50, 'data-fx': 'growx', 'data-o': d > 0 ? '0% 50%' : '100% 50%', 'data-ms': 340 }, svg);
    T(h.at(svg, 2100 + j * 50, { 'data-fx': 'fade' }), d > 0 ? mid + d * L + 8 : mid + d * L - 8, Y(j) + 5, (d > 0 ? '+' : '−') + Math.abs(d) + '명', { 'text-anchor': d > 0 ? 'start' : 'end', 'font-size': 13.5, 'font-weight': 700, fill: d > 0 ? C.dark : C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpprob : cats[{name,before,now}] 3~5개(각 합 100) · beforeName · nowName · unit('%') */
ECOM.parts.xpprob = function (bd, s, ctx) {
  var K = (s.cats || []).slice(0, 5), n = K.length; if (!n) return; var svg = ctx.svg(512), cols = [C.dark, C.main, C.g65, C.g40, C.gray], tcol = ['#fff', '#fff', '#fff', C.ink, C.ink], top = 54, H = 420, xa = 440, xb = 728, cw = 130, u = s.unit || '%';
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); T(g0, xa + cw / 2, 28, s.beforeName || '한 주 전', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.mute }); T(g0, xb + cw / 2, 28, s.nowName || '지금', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.dark });
  function spread(ys, gap, lo, hi) { var o = ys.map(function (y, i) { return i }).sort(function (a, b) { return ys[a] - ys[b] }), r = ys.slice(); o.forEach(function (i, q) { if (q && r[i] < r[o[q - 1]] + gap) r[i] = r[o[q - 1]] + gap }); for (var q = o.length - 1; q >= 0; q--) { var i = o[q]; if (r[i] > hi) r[i] = hi; if (q < o.length - 1 && r[i] > r[o[q + 1]] - gap) r[i] = r[o[q + 1]] - gap } return r }
  var ya = top, yb = top, tot = 0, ma = [], mb = []; K.forEach(function (k) { tot += +k.before }); var sc0 = H / tot, ay = [], by = [], aa = top, bb = top; K.forEach(function (k) { ay.push(aa + k.before * sc0 / 2); by.push(bb + k.now * sc0 / 2); aa += k.before * sc0; bb += k.now * sc0 }); var ly = spread(ay, 26, 40, top + H), ry = spread(by, 30, 40, top + H); tot = 0; K.forEach(function (k) { tot += +k.before }); var sc = H / tot;
  K.forEach(function (k, i) { var ha = k.before * sc, hb = k.now * sc, t0 = 200 + i * 160, g = h.at(svg, t0, { 'data-fx': 'fade' }), d = k.now - k.before, a2 = ya, b2 = yb;
    E('path', { d: 'M' + (xa + cw) + ' ' + a2 + ' C' + (xa + cw + 80) + ' ' + a2 + ' ' + (xb - 80) + ' ' + b2 + ' ' + xb + ' ' + b2 + ' L' + xb + ' ' + (b2 + hb) + ' C' + (xb - 80) + ' ' + (b2 + hb) + ' ' + (xa + cw + 80) + ' ' + (a2 + ha) + ' ' + (xa + cw) + ' ' + (a2 + ha) + ' Z', fill: cols[i], opacity: .22, 'data-at': t0 + 300, 'data-fx': 'fade' }, svg);
    E('rect', { x: xa, y: a2, width: cw, height: Math.max(2, ha - 2), fill: cols[i] }, g); E('rect', { x: xb, y: b2, width: cw, height: Math.max(2, hb - 2), fill: cols[i] }, g);
    if (ha > 22) T(g, xa + cw / 2, a2 + ha / 2 + 6, h.nf(k.before, 0) + u, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: tcol[i] }); if (hb > 22) T(g, xb + cw / 2, b2 + hb / 2 + 6, h.nf(k.now, 0) + u, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: tcol[i] });
    T(g, xa - 22, ly[i] + 6, k.name, { 'text-anchor': 'end', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    var cy = ry[i], g3 = h.at(svg, t0 + 500, { 'data-fx': 'fade' }); T(g3, xb + cw + 28, cy + 8, (d >= 0 ? '+' : '−') + Math.abs(d) + '%p', { 'font-size': 26, 'font-weight': 700, fill: d >= 0 ? C.dark : C.cmp });
    E('path', { d: d >= 0 ? 'M' + (xb + cw + 140) + ' ' + (cy + 4) + ' l8 -14 l8 14 z' : 'M' + (xb + cw + 140) + ' ' + (cy - 4) + ' l8 14 l8 -14 z', fill: d >= 0 ? C.dark : C.cmp }, g3); ya += ha; yb += hb });
  T(g0, xb + cw + 28, 28, '변화', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpsched : items[{time,day,name,sub,imp(1~3)}] 4~7개 · railName('한국 시각') */
ECOM.parts.xpsched = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 7), n = I.length; if (!n) return; var svg = ctx.svg(512), top = 34, pitch = (506 - top) / n, rx = 214, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  T(g0, rx - 24, 18, s.railName || '한국 시각', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.mute }); T(g0, rx + 34, 18, '발표 · 직전 값', { 'font-size': 13.5, 'font-weight': 700, fill: C.mute }); T(g0, 1168, 18, '중요도', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
  E('line', { x1: rx, x2: rx, y1: top - 6, y2: 506, stroke: C.g40, 'stroke-width': 4, 'stroke-linecap': 'round', 'data-at': 100, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  I.forEach(function (it, i) { var cy = top + pitch * i + pitch / 2, t0 = 200 + i * 170, g = h.at(svg, t0, { 'data-fx': 'fade' }), hi = it.imp >= 3;
    E('rect', { x: rx + 22, y: cy - pitch / 2 + 4, width: 1168 - rx - 22, height: pitch - 8, rx: 10, fill: hi ? C.g08 : C.paper, stroke: hi ? C.g40 : 'none' }, g);
    T(g, rx - 24, cy + 2, it.time, { 'text-anchor': 'end', 'font-size': 24, 'font-weight': 700, fill: hi ? C.dark : C.ink }); T(g, rx - 24, cy + 22, it.day, { 'text-anchor': 'end', 'font-size': 13, fill: C.mute });
    E('circle', { cx: rx, cy: cy, r: hi ? 11 : 8, fill: hi ? C.dark : '#fff', stroke: C.main, 'stroke-width': 3 }, g);
    T(g, rx + 44, cy - 2, it.name, { 'font-size': 19, 'font-weight': 700, fill: C.ink }); if (it.sub) T(g, rx + 44, cy + 20, it.sub, { 'font-size': 13.5, fill: C.mute });
    for (var q = 0; q < 3; q++) E('circle', { cx: 1168 - 28 - (2 - q) * 26, cy: cy, r: 8, fill: q < it.imp ? C.dark : '#fff', stroke: q < it.imp ? C.dark : C.axis, 'stroke-width': 2 }, g) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpband : cols[{name,unit,dec}] 2~4개 · rows[{band,sub,vals[]}] 4~6개(옛 → 새, 위 = 크게 하회) · scaleName('발표 − 기준') */
ECOM.parts.xpband = function (bd, s, ctx) {
  var Cl = (s.cols || []).slice(0, 4), R = (s.rows || []).slice(0, 6), nc = Cl.length, n = R.length; if (!nc || !n) return; var svg = ctx.svg(512), top = 52, pitch = (508 - top) / n, bx = 420, cw = (1168 - bx - (nc - 1) * 12) / nc, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  T(g0, 14, 30, '발표치 구간(' + (s.scaleName || '발표 − 기준') + ')', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, 262, 30, '위치', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.mute });
  Cl.forEach(function (c, k) { T(g0, bx + k * (cw + 12) + cw / 2, 30, c.name, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }) });
  var mx = []; Cl.forEach(function (c, k) { var m = 0; R.forEach(function (r) { m = Math.max(m, Math.abs(r.vals[k])) }); mx.push(m || 1) });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, t0 = 200 + i * 160, g = h.at(svg, t0, { 'data-fx': 'fade' });
    T(g, 14, cy - 2, r.band, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 14, cy + 20, r.sub, { 'font-size': 13, fill: C.mute });
    for (var q = 0; q < n; q++) E('rect', { x: 262 - n * 12 + q * 24 + 2, y: cy - 8, width: 20, height: 16, rx: 3, fill: q === i ? C.dark : C.light }, g);
    Cl.forEach(function (c, k) { var v = +r.vals[k], x = bx + k * (cw + 12), m = Math.abs(v) / mx[k], up = v >= 0, g2 = h.at(svg, t0 + 250 + k * 90, { 'data-fx': 'fade' });
      E('rect', { x: x, y: cy - pitch / 2 + 4, width: cw, height: pitch - 8, rx: 10, fill: up ? C.g08 : C.paper, stroke: m > .66 ? (up ? C.main : C.axis) : 'none', 'stroke-width': 1.6 }, g2);
      E('path', { d: up ? 'M' + (x + 30) + ' ' + (cy + 11) + ' l12 -22 l12 22 z' : 'M' + (x + 30) + ' ' + (cy - 11) + ' l12 22 l12 -22 z', fill: up ? C.dark : C.cmp, transform: 'translate(0 0)' }, g2);
      T(g2, x + cw - 24, cy + 9, (up ? '+' : '−') + h.nf(Math.abs(v), c.dec != null ? c.dec : 0) + (c.unit || ''), { 'text-anchor': 'end', 'font-size': 25, 'font-weight': 700, fill: up ? C.dark : C.cmp }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
