/* dx 선 부품 7종(머리글자 dx) — F02 두 지표 · 이중축 / F19 채권 목업. 공통 도움 = n_dx0util.js(ECOM.dxu)
   dxdual 이중축 두 선 · dxgap 두 선 사이 칠(역전 색) · dxzero 0 기준 한 줄(0 아래 칠 · 세로 띠 · 앞선 화살표 · 구간 띠) · dxratio 비율 선 + 평균 띠 + 역대 위치 막대
   dxstack 위아래 두 칸 같은 시간축 · dxend 끝 라벨 차이 화살표 · dxdecomp 쌓은 면(명목 = 실질 + 기대물가)
   칸 설명은 style/SCHEMA4_F02.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.dxu, W = 1168;
function nn(v) { return v != null && !isNaN(v) }
function tone(t) { return t === 'warn' ? { c: C.warn, f: '#E9C3B3' } : t === 'soft' ? { c: C.cmp, f: C.light } : { c: C.main, f: C.g40 } }
function linePath(g, data, X, Y, color, wd, at, dash) { var pts = []; data.forEach(function (v, i) { if (nn(v)) pts.push([X(i), Y(v)]) });
  return E('path', { d: u.path(pts), fill: 'none', stroke: color, 'stroke-width': wd || 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': dash || null, 'data-at': at, 'data-fx': 'draw', 'data-ms': 1100 }, g) }
function mark(svg, x, y, c, text, at, o) { o = o || {}; E('circle', { cx: x, cy: y, r: 6.5, fill: o.hollow ? '#fff' : c, stroke: c, 'stroke-width': 3, 'data-at': at, 'data-fx': 'pop' }, svg);
  var g = h.at(svg, at, { 'data-fx': 'fade' }), fs = o.size || 14; String(text || '').split('\n').forEach(function (t, j, a) {
    var lf = o.pos === 'left', base = lf ? y + 5 - (a.length - 1 - j) * (fs + 3) + (a.length - 1) * (fs + 3) / 2 : o.pos === 'below' ? y + 28 + j * (fs + 3) : y - 14 - (a.length - 1 - j) * (fs + 3);
    T(g, lf ? x - 14 : Math.max(60, Math.min(W - 60, x + (o.dx || 0))), base + (o.dy || 0), t, Object.assign({ 'text-anchor': lf ? 'end' : (o.anchor || 'middle'), 'font-size': fs, 'font-weight': 700, fill: c }, u.halo)) }) }
function legend(g, x, y, items) { items.forEach(function (it) { E('rect', { x: x, y: y - 11, width: 16, height: 13, rx: 3, fill: it.fill, stroke: it.stroke || 'none', 'stroke-width': 1.5 }, g);
  T(g, x + 22, y, it.text, { 'font-size': 13.5, 'font-weight': 600, fill: C.sub }); x += 22 + h.textW(it.text, 13.5, true) + 24 }); return x }
/* 부호 바뀌는 곳에서 자른 조각 : [{sign,pts:[[i(실수),값]]}] */
function pieces(d, ref) { var out = [], cur = null;
  for (var i = 0; i < d.length; i++) { var v = d[i]; if (!nn(v)) { cur = null; continue } var sg = v >= ref ? 1 : -1;
    if (!cur) { cur = { sign: sg, pts: [[i, v]] }; out.push(cur); continue }
    if (sg === cur.sign) { cur.pts.push([i, v]); continue }
    var pv = d[i - 1], t = (ref - pv) / (v - pv), xi = i - 1 + t; cur.pts.push([xi, ref]); cur = { sign: sg, pts: [[xi, ref], [i, v]] }; out.push(cur) }
  return out }

/* ───── dxdual 이중축 ───── */
ECOM.parts.dxdual = function (bd, s, ctx) {
  var svg = ctx.svg(512), Lq = s.left, Rq = s.right, lab = s.labels, n = lab.length, x0 = 72, x1 = W - 86, y0 = 74, y1 = 456, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var cl = h.col(Lq.color || 'main'), cr = h.col(Rq.color || 'cmp'), a = u.scale(Lq.y, y0, y1), b = u.scale(Rq.y, y0, y1);
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' }); u.grid(g1, a, x0, x1, { color: cl, zero: false, suf: Lq.y.suf || '' });
  b.ticks.forEach(function (v) { T(g1, x1 + 9, b.Y(v) + 4.5, h.nf(v, b.dec) + (Rq.y.suf || ''), { 'font-size': 12.5, 'font-weight': 700, fill: cr }) });
  E('rect', { x: 0, y: 30, width: 14, height: 14, rx: 3, fill: cl }, g1); T(g1, 20, 42, Lq.name + ' ' + h.nf(Lq.data[n - 1], Lq.dec != null ? Lq.dec : 1) + (Lq.suf || '') + ' (왼쪽 축, ' + Lq.unit + ')', { 'font-size': 14, 'font-weight': 700, fill: cl });
  var rt = Rq.name + ' ' + h.nf(Rq.data[n - 1], Rq.dec != null ? Rq.dec : 0) + (Rq.suf || '') + ' (오른쪽 축, ' + Rq.unit + ')'; E('rect', { x: W - 20 - h.textW(rt, 14, true), y: 30, width: 14, height: 14, rx: 3, fill: cr }, g1); T(g1, W, 42, rt, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: cr });
  u.xaxis(g1, lab, X, y1 + 22, s);
  var YL = function (v) { return a.Y(v) }, YR = function (v) { return b.Y(v) };
  linePath(svg, Lq.data, X, YL, cl, 3.8, 200); linePath(svg, Rq.data, X, YR, cr, 3.8, 420);
  var le = Lq.data[n - 1], re = Rq.data[n - 1], yl = YL(le), yr = YR(re), gp = h.at(svg, 1500, { 'data-fx': 'pop' });
  E('circle', { cx: X(n - 1), cy: yl, r: 6.5, fill: cl }, gp); E('circle', { cx: X(n - 1), cy: yr, r: 6.5, fill: cr }, gp);
  (s.marks || []).forEach(function (m, k) { var q = m.side === 'right' ? Rq : Lq, Y = m.side === 'right' ? YR : YL, c = m.side === 'right' ? cr : cl; mark(svg, X(m.at), Y(q.data[m.at]), c, m.text, 1700 + k * 150, m) });
  if (s.corr) { var gc = h.at(svg, 1900, { 'data-fx': 'fade' }); u.pill(gc, (x0 + x1) / 2, 62, s.corr.text, C.dark, '#fff', 14) }
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxgap 두 선 사이 칠 ───── */
ECOM.parts.dxgap = function (bd, s, ctx) {
  var svg = ctx.svg(512), A = s.a, B = s.b, lab = s.labels, n = lab.length, x0 = 64, x1 = W - 120, y0 = 52, y1 = 456, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var all = A.data.concat(B.data).filter(nn), sc = ECOM.u.yScale(all, s.y || {}, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  ECOM.u.yAxis(g1, x0, x1, sc, { unit: (s.y || {}).unit, suf: (s.y || {}).suf }); u.xaxis(g1, lab, X, y1 + 22, s);
  var dpos = '', dneg = '', d = A.data.map(function (v, i) { return v - B.data[i] });
  function poly(pts) { return u.path(pts) + ' Z' }
  for (var i = 0; i < n - 1; i++) { var d0 = d[i], d1 = d[i + 1], pa = [X(i), Y(A.data[i])], pb = [X(i + 1), Y(A.data[i + 1])], qa = [X(i), Y(B.data[i])], qb = [X(i + 1), Y(B.data[i + 1])];
    if ((d0 >= 0 && d1 >= 0) || (d0 <= 0 && d1 <= 0)) { var p = poly([pa, pb, qb, qa]); if (d0 + d1 >= 0) dpos += p; else dneg += p }
    else { var t = d0 / (d0 - d1), xc = X(i) + t * (X(i + 1) - X(i)), yc = Y(A.data[i] + t * (A.data[i + 1] - A.data[i])), t1 = poly([pa, [xc, yc], qa]), t2 = poly([[xc, yc], pb, qb]);
      if (d0 > 0) { dpos += t1; dneg += t2 } else { dneg += t1; dpos += t2 } } }
  var gf = h.at(svg, 100, { 'data-fx': 'fade', 'data-ms': 800 }); E('path', { d: dpos, fill: C.g40, opacity: .75 }, gf); E('path', { d: dneg, fill: C.warn, opacity: .42 }, gf);
  var ca = h.col(A.color || 'dark'), cb = h.col(B.color || 'cmp'); linePath(svg, A.data, X, Y, ca, 3.4, 250); linePath(svg, B.data, X, Y, cb, 3.2, 450, '7 5');
  /* 역전 구간 이름 */
  var gr = h.at(svg, 1400, { 'data-fx': 'fade' }), rm = s.runMin || 4; u.runs(d, function (v) { return v < 0 }).forEach(function (r) { var len = r[1] - r[0] + 1; if (len < rm) return;
    var mid = Math.round((r[0] + r[1]) / 2), yy = Math.max(Y(A.data[mid]), Y(B.data[mid])) + 24; T(gr, X(mid), Math.min(y1 - 8, yy), (s.runText || '역전') + ' ' + len + (s.runUnit || '개월'), Object.assign({ 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.warn }, u.halo)) });
  /* 끝 이름 */
  var en = [[A, Y(A.data[n - 1]), ca], [B, Y(B.data[n - 1]), cb]].sort(function (p, q) { return p[1] - q[1] }); if (en[1][1] - en[0][1] < 18) en[1][1] = en[0][1] + 18;
  var ge = h.at(svg, 1500, { 'data-fx': 'fade' }); en.forEach(function (e) { T(ge, x1 + 10, e[1] + 5, e[0].name + ' ' + h.nf(e[0].data[n - 1], 2) + '%', { 'font-size': 13.5, 'font-weight': 700, fill: e[2] }) });
  var gl = h.lv(svg, 1, { 'data-fx': 'fade' }); legend(gl, x0 + 8, 26, [{ fill: C.g40, text: (s.posName || '정상') }, { fill: '#E3B9A8', text: (s.negName || '역전') }]);
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxzero 0 기준 한 줄 ───── */
ECOM.parts.dxzero = function (bd, s, ctx) {
  var svg = ctx.svg(512), lab = s.labels, d = s.data, n = lab.length, x0 = 64, x1 = W - (s.rmargin != null ? s.rmargin : 40), y0 = 54, y1 = (s.strip ? 420 : 456), X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var sc = u.scale(s.y, y0, y1), Y = sc.Y, pT = tone(s.posTone || 'main'), nT = tone(s.negTone || 'warn'), half = (x1 - x0) / (n - 1) / 2, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  (s.bands || []).forEach(function (b) { var xa = X(b.from) - half, xb = X(b.to) + half; E('rect', { x: xa, y: y0, width: Math.max(2, xb - xa), height: y1 - y0, fill: C.light, opacity: .95 }, g1);
    if (b.name) T(g1, (xa + xb) / 2, y0 + 15, b.name, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.cmp }) });
  u.grid(g1, sc, x0, x1, { suf: s.y.suf || '' }); if (s.y.unit) T(g1, 0, y0 - 24, s.y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); u.xaxis(g1, lab, X, y1 + 22, s);
  var pcs = pieces(d, 0), gf = h.at(svg, 100, { 'data-fx': 'fade', 'data-ms': 800 }), Z = Y(0);
  pcs.forEach(function (p) { var pts = p.pts.map(function (q) { return [X(q[0]), Y(q[1])] }); E('path', { d: u.path(pts) + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + Z + ' L' + pts[0][0].toFixed(1) + ' ' + Z + ' Z', fill: p.sign > 0 ? pT.f : nT.f, opacity: p.sign > 0 ? (s.posFill === false ? 0 : .55) : .8 }, gf) });
  if (s.segColor) pcs.forEach(function (p, k) { E('path', { d: u.path(p.pts.map(function (q) { return [X(q[0]), Y(q[1])] })), fill: 'none', stroke: p.sign > 0 ? pT.c : nT.c, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'data-at': 200 + k * 60, 'data-fx': 'fade', 'data-ms': 500 }, svg) });
  else linePath(svg, d, X, Y, C.dark, 3.4, 250);
  /* 0 아래 구간 이름 */
  if (s.runs) { var gr = h.at(svg, 1300, { 'data-fx': 'fade' }); u.runs(d, function (v) { return v < 0 }).forEach(function (r) { var len = r[1] - r[0] + 1; if (len < (s.runs.min || 3)) return;
    var lo = r[0]; for (var i = r[0]; i <= r[1]; i++) if (d[i] < d[lo]) lo = i; var tx = Math.max(x0 + 30, Math.min(x1 - 30, X((r[0] + r[1]) / 2)));
    T(gr, tx, Math.min(y1 - 8, Y(d[lo]) + 24), (s.runs.prefix || '') + len + (s.runs.unit || '개월'), Object.assign({ 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: nT.c }, u.halo)) }) }
  /* 앞선 화살표 */
  (s.leads || []).forEach(function (l, k) { var g = h.at(svg, 1300 + k * 250, { 'data-fx': 'fade' }), xa = X(l.from), xb = X(l.to), yy = (l.y != null ? l.y : y1 - 28);
    E('line', { x1: xa, x2: xb - 7, y1: yy, y2: yy, stroke: C.dark, 'stroke-width': 2.4 }, g); E('path', { d: 'M' + (xb - 12) + ' ' + (yy - 6) + ' L' + xb + ' ' + yy + ' L' + (xb - 12) + ' ' + (yy + 6) + ' Z', fill: C.dark }, g);
    E('circle', { cx: xa, cy: yy, r: 4.5, fill: C.dark }, g); var tw = h.textW(l.text, 13, true) + 14; E('rect', { x: Math.min(x1 - tw, Math.max(x0 + 2, (xa + xb) / 2 - tw / 2)), y: yy - 31, width: tw, height: 22, rx: 11, fill: C.dark }, g);
    T(g, Math.min(x1 - tw / 2, Math.max(x0 + tw / 2 + 2, (xa + xb) / 2)), yy - 15.5, l.text, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) });
  (s.marks || []).forEach(function (m, k) { mark(svg, X(m.at), Y(d[m.at]), m.tone === 'warn' ? C.warn : C.dark, m.text, 1600 + k * 150, m) });
  if (s.endbig) { var ep = [X(n - 1), Y(d[n - 1])], ge = h.at(svg, 1700, { 'data-fx': 'fade' }); E('circle', { cx: ep[0], cy: ep[1], r: 7, fill: C.dark, 'data-at': 1650, 'data-fx': 'pop' }, svg);
    u.pill(ge, ep[0] + 18 + (h.textW(s.endbig.text, 15, true) + 20) / 2, ep[1], s.endbig.text, C.dark, '#fff', 15) }
  if (s.strip) { var gs = h.lv(svg, 1, { 'data-fx': 'fade' }), sy = 458; pcs.forEach(function (p) { var xa = X(p.pts[0][0]), xb = X(p.pts[p.pts.length - 1][0]); E('rect', { x: xa, y: sy, width: Math.max(1, xb - xa), height: 16, fill: p.sign > 0 ? pT.c : nT.c, opacity: .9 }, gs) });
    T(gs, x0 - 9, sy + 13, '구간', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: C.mute }) }
  var gl = h.lv(svg, 1, { 'data-fx': 'fade' }); legend(gl, x0 + 8, 24, [{ fill: pT.f, stroke: pT.c, text: (s.posName || '0 위') }, { fill: nT.f, stroke: nT.c, text: (s.negName || '0 아래') }].concat(s.bands && s.bandName ? [{ fill: C.light, stroke: C.axis, text: s.bandName }] : []));
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxratio 비율 선 + 평균 띠 + 역대 위치 막대 ───── */
ECOM.parts.dxratio = function (bd, s, ctx) {
  var svg = ctx.svg(512), lab = s.labels, d = s.data, n = lab.length, x0 = 64, x1 = W - 250, y0 = 46, y1 = 456, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) }, sc = u.scale(s.y, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  E('rect', { x: x0, y: Y(s.mean + s.sd), width: x1 - x0, height: Y(s.mean - s.sd) - Y(s.mean + s.sd), fill: C.g08 }, g1); u.grid(g1, sc, x0, x1, { zero: false, suf: s.y.suf || '' }); u.xaxis(g1, lab, X, y1 + 22, s);
  if (s.y.unit) T(g1, 0, y0 - 22, s.y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  E('line', { x1: x0, x2: x1, y1: Y(s.mean), y2: Y(s.mean), stroke: C.dark, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }, g1);
  u.pill(g1, x0 + 56, Y(s.mean) - 14, s.meanText || '평균', C.dark, '#fff', 12.5); T(g1, x0 + 8, Y(s.mean + s.sd) + 17, s.bandText || '평균 ±1표준편차', { 'font-size': 12.5, 'font-weight': 700, fill: C.g65 });
  linePath(svg, d, X, Y, C.dark, 3.2, 250);
  var out = [], gd = h.at(svg, 1200, { 'data-fx': 'fade' }); d.forEach(function (v, i) { if (nn(v) && (v > s.mean + s.sd || v < s.mean - s.sd)) out.push([X(i), Y(v), v > s.mean + s.sd]) });
  out.forEach(function (p) { E('circle', { cx: p[0], cy: p[1], r: 2.2, fill: p[2] ? C.warn : C.main }, gd) });
  (s.marks || []).forEach(function (m, k) { mark(svg, X(m.at), Y(d[m.at]), m.tone === 'warn' ? C.warn : C.dark, m.text, 1500 + k * 150, m) });
  /* 오른쪽 역대 위치 막대 */
  var gr = h.at(svg, 1800, { 'data-fx': 'fade' }), bx = W - 62, bw = 26, lo = s.rangeMin, hi = s.rangeMax, R = h.lin(lo, hi, y1, y0 + 30), cur = d[n - 1];
  T(gr, W - 130, y0 - 22, s.stripTitle || '역대 분포', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
  E('rect', { x: bx, y: R(hi), width: bw, height: R(lo) - R(hi), rx: 4, fill: C.g08, stroke: C.axis }, gr); E('rect', { x: bx, y: R(s.mean + s.sd), width: bw, height: R(s.mean - s.sd) - R(s.mean + s.sd), fill: C.g18 }, gr);
  E('line', { x1: bx - 4, x2: bx + bw + 4, y1: R(s.mean), y2: R(s.mean), stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, gr);
  T(gr, bx + bw + 6, R(hi) + 4, h.nf(hi, s.dec != null ? s.dec : 1), { 'font-size': 12.5, 'font-weight': 600, fill: C.mute }); T(gr, bx + bw + 6, R(lo) + 4, h.nf(lo, s.dec != null ? s.dec : 1), { 'font-size': 12.5, 'font-weight': 600, fill: C.mute });
  T(gr, bx + bw + 6, R(s.mean) + 4, '평균', { 'font-size': 12.5, 'font-weight': 700, fill: C.dark });
  var cy = R(cur); E('path', { d: 'M' + (bx - 2) + ' ' + cy + ' L' + (bx - 14) + ' ' + (cy - 8) + ' L' + (bx - 14) + ' ' + (cy + 8) + ' Z', fill: C.warn }, gr); E('circle', { cx: bx + bw / 2, cy: cy, r: 5, fill: C.warn }, gr);
  T(gr, bx - 20, cy + 6, h.nf(cur, s.dec != null ? s.dec : 1), { 'text-anchor': 'end', 'font-size': 30, 'font-weight': 700, fill: C.warn });
  if (s.pctl) { T(gr, bx - 20, cy + 28, s.pctl.text, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (s.pctl.sub) T(gr, bx - 20, cy + 46, s.pctl.sub, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: C.mute }) }
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxstack 위아래 두 칸 같은 시간축 ───── */
ECOM.parts.dxstack = function (bd, s, ctx) {
  var svg = ctx.svg(512), lab = s.labels, n = lab.length, x0 = 72, x1 = W - 126, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) }, P = [s.top, s.bottom], rows = [[58, 226], [304, 456]], g1 = h.lv(svg, 1, { 'data-fx': 'fade' }), scs = [];
  (s.bands || []).forEach(function (b) { var half = (x1 - x0) / (n - 1) / 2, xa = X(b.from) - half, xb = X(b.to) + half; E('rect', { x: xa, y: 58, width: xb - xa, height: 398, fill: C.light, opacity: .8 }, g1); if (b.name) T(g1, (xa + xb) / 2, 74, b.name, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.cmp }) });
  P.forEach(function (q, k) { var y0 = rows[k][0], y1 = rows[k][1], sc = u.scale(q.y, y0, y1); scs.push(sc); u.grid(g1, sc, x0, x1, { zero: false, suf: q.y.suf || '' });
    E('rect', { x: 0, y: y0 - 27, width: 13, height: 13, rx: 3, fill: h.col(q.color || (k ? 'cmp' : 'main')) }, g1); T(g1, 19, y0 - 15, q.name + ' (' + q.unit + ')', { 'font-size': 14, 'font-weight': 700, fill: h.col(q.color || (k ? 'cmp' : 'main')) }) });
  u.xaxis(g1, lab, X, 478, s);
  P.forEach(function (q, k) { var c = h.col(q.color || (k ? 'cmp' : 'main')), Y = scs[k].Y, pp = [];
    if (q.area) { var pts = []; q.data.forEach(function (v, i) { if (nn(v)) pts.push([X(i), Y(v)]) }); E('path', { d: u.path(pts) + ' L' + pts[pts.length - 1][0] + ' ' + rows[k][1] + ' L' + pts[0][0] + ' ' + rows[k][1] + ' Z', fill: C.g08, 'data-at': 150 + k * 200, 'data-fx': 'fade', 'data-ms': 600 }, svg) }
    linePath(svg, q.data, X, Y, c, 3.4, 250 + k * 350); var last = q.data[n - 1], gp = h.at(svg, 1500, { 'data-fx': 'fade' }); E('circle', { cx: X(n - 1), cy: Y(last), r: 6, fill: c }, gp);
    T(gp, X(n - 1) + 12, Y(last) + 5, h.nf(last, q.dec != null ? q.dec : 0) + (q.suf || ''), { 'font-size': 15, 'font-weight': 700, fill: c }) });
  (s.marks || []).forEach(function (m, k) { var q = P[m.panel || 0], c = h.col(q.color || (m.panel ? 'cmp' : 'main')); mark(svg, X(m.at), scs[m.panel || 0].Y(q.data[m.at]), c, m.text, 1600 + k * 150, m) });
  if (s.link) { var gl = h.at(svg, 1900, { 'data-fx': 'fade' }); u.pill(gl, (x0 + x1) / 2, 266, s.link.text, C.dark, '#fff', 14) }
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxend 끝 라벨 차이 화살표 ───── */
ECOM.parts.dxend = function (bd, s, ctx) {
  var svg = ctx.svg(512), A = s.a, B = s.b, lab = s.labels, n = lab.length, x0 = 64, x1 = W - 372, y0 = 44, y1 = 456, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var all = A.data.concat(B.data).filter(nn), sc = ECOM.u.yScale(all, s.y || {}, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  ECOM.u.yAxis(g1, x0, x1, sc, { unit: (s.y || {}).unit, suf: (s.y || {}).suf }); u.xaxis(g1, lab, X, y1 + 22, s);
  var ca = h.col(A.color || 'main'), cb = h.col(B.color || 'cmp'); linePath(svg, A.data, X, Y, ca, 3.8, 200); linePath(svg, B.data, X, Y, cb, 3.8, 420);
  var ya = Y(A.data[n - 1]), yb = Y(B.data[n - 1]), ex = X(n - 1), gp = h.at(svg, 1500, { 'data-fx': 'pop' }); E('circle', { cx: ex, cy: ya, r: 7, fill: ca }, gp); E('circle', { cx: ex, cy: yb, r: 7, fill: cb }, gp);
  var ge = h.at(svg, 1600, { 'data-fx': 'fade' }), top = Math.min(ya, yb), bot = Math.max(ya, yb), ax = x1 + 176, aTop = ya <= yb ? A : B, aBot = ya <= yb ? B : A, cTop = ya <= yb ? ca : cb, cBot = ya <= yb ? cb : ca;
  [[ya, ca], [yb, cb]].forEach(function (q) { E('line', { x1: ex + 9, x2: ax, y1: q[0], y2: q[0], stroke: q[1], 'stroke-width': 1.6, 'stroke-dasharray': '3 4' }, ge) });
  var pys = [ya, yb]; if (Math.abs(ya - yb) < 34) { var mm = (ya + yb) / 2; pys = ya <= yb ? [mm - 18, mm + 18] : [mm + 18, mm - 18] }
  [[A, pys[0], ca], [B, pys[1], cb]].forEach(function (q) { var tx = q[0].name + ' ' + h.nf(q[0].data[n - 1], 2) + '%', w = h.textW(tx, 14, true) + 20;
    E('rect', { x: ex + 24, y: q[1] - 14, width: w, height: 28, rx: 14, fill: q[2] }, ge); T(ge, ex + 24 + w / 2, q[1] + 5, tx, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) });
  var gd = h.at(svg, 2000, { 'data-fx': 'fade' }); h.arrow2(gd, ax, top, bot, C.warn, 2.4);
  var bx = ax + 16; E('rect', { x: bx, y: (top + bot) / 2 - 46, width: W - bx, height: 92, rx: 10, fill: '#fff', stroke: C.warn, 'stroke-width': 2 }, gd);
  T(gd, bx + (W - bx) / 2, (top + bot) / 2 - 8, s.diff.text, { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: C.warn }); T(gd, bx + (W - bx) / 2, (top + bot) / 2 + 20, s.diff.sub, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
  if (s.start) { var sx = X(s.start.at), sa = Y(A.data[s.start.at]), sb = Y(B.data[s.start.at]), sm = s.start.y != null ? Y(s.start.y) : (sa + sb) / 2, g0 = h.at(svg, 900, { 'data-fx': 'fade' }); h.arrow2(g0, sx, sa, sb, C.warn, 2);
    var tw = h.textW(s.start.text, 14, true) + 18; E('rect', { x: sx + 10, y: sm - 13, width: tw, height: 26, rx: 13, fill: C.warn }, g0); T(g0, sx + 10 + tw / 2, sm + 5, s.start.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) }
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxdecomp 쌓은 면 : 명목 = 실질 + 기대물가 ───── */
ECOM.parts.dxdecomp = function (bd, s, ctx) {
  var svg = ctx.svg(512), lab = s.labels, R = s.real, B = s.be, n = lab.length, N = R.map(function (v, i) { return v + B[i] }), x0 = 64, x1 = W - 300, y0 = 40, y1 = 456, X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var sc = u.scale(s.y, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' }); u.grid(g1, sc, x0, x1, { suf: s.y.suf || '' }); if (s.y.unit) T(g1, 0, y0 - 22, s.y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); u.xaxis(g1, lab, X, y1 + 22, s);
  var Z = Y(0), pr = R.map(function (v, i) { return [X(i), Y(v)] }), pn = N.map(function (v, i) { return [X(i), Y(v)] });
  var gf = h.at(svg, 100, { 'data-fx': 'fade', 'data-ms': 800 });
  E('path', { d: u.path(pr) + ' L' + pr[n - 1][0] + ' ' + Z + ' L' + pr[0][0] + ' ' + Z + ' Z', fill: C.g40, opacity: .85 }, gf);
  E('path', { d: u.path(pn) + pr.slice().reverse().map(function (p) { return ' L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join('') + ' Z', fill: C.g18 }, gf);
  linePath(svg, R, X, Y, C.main, 3.2, 300); linePath(svg, N, X, Y, C.dark, 4, 600);
  var gn = h.at(svg, 1400, { 'data-fx': 'fade' }); (s.names || []).forEach(function (q) { var i = q.at, yy = q.kind === 'real' ? (Y(R[i]) + Z) / 2 : (Y(N[i]) + Y(R[i])) / 2;
    T(gn, X(i), yy + 5, q.text, Object.assign({ 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: q.kind === 'real' ? C.dark : C.g65 }, u.halo)) });
  (s.marks || []).forEach(function (m, k) { var arr = m.s === 'real' ? R : N; mark(svg, X(m.at), Y(arr[m.at]), m.tone === 'warn' ? C.warn : C.dark, m.text, 1600 + k * 150, m) });
  /* 오른쪽 식 카드 */
  var gc = h.at(svg, 1900, { 'data-fx': 'fade' }), cx = x1 + 34, cw = W - cx, rows = [['명목금리', N[n - 1], C.dark, null], ['실질금리', R[n - 1], C.main, C.g40], ['기대물가', B[n - 1], C.g65, C.g18]], ry = [64, 214, 346], rh = [112, 104, 104];
  rows.forEach(function (r, k) { E('rect', { x: cx, y: ry[k], width: cw, height: rh[k], rx: 10, fill: k === 0 ? C.dark : '#fff', stroke: k === 0 ? C.dark : C.axis, 'stroke-width': 1.6 }, gc);
    if (k) { E('rect', { x: cx + 14, y: ry[k] + 14, width: 22, height: 14, rx: 3, fill: r[3], stroke: r[2], 'stroke-width': 1.5 }, gc) }
    T(gc, cx + (k ? 44 : 16), ry[k] + 27, r[0] + (k === 0 ? ' (10년물)' : k === 1 ? ' (물가연동 10년물)' : ' (명목 − 실질)'), { 'font-size': 13.5, 'font-weight': 700, fill: k === 0 ? '#fff' : C.mute });
    T(gc, cx + 16, ry[k] + rh[k] - 22, h.nf(r[1], 2) + '%', { 'font-size': k === 0 ? 46 : 40, 'font-weight': 700, fill: k === 0 ? '#fff' : r[2] }) });
  u.pill(gc, cx + cw / 2, (ry[0] + rh[0] + ry[1]) / 2, '=', C.dark, '#fff', 17); u.pill(gc, cx + cw / 2, (ry[1] + rh[1] + ry[2]) / 2, '+', C.dark, '#fff', 17);
  ctx.root.setAttribute('data-gap', 300) };
})();
