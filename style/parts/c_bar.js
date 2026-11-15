/* bar — 시간 막대(재생 막대 · 괄호 · 주석 · 결정 줄 · 분포) — CW48 7장 틀
   labels · data · y{min,max,step,dec,unit} · unit('%p' 읽어 주기 단위) · phases · playback(true)
   hi[{max|last|eq|idx:[...]|from,to, color}] · beats[{hi:[...], dim:['brackets','notes','last']}] · brackets[{from,to,text,sub}]
   notes[{at,text,sub,pos:'above|below',anchor}] · last{text} · lanes[{name,sub,color,values:[n+1 개, 첫 값 = 앞 달]}] · laneSum[{text,color}] · laneNote
   dist{title,sub,from,to,avg:true,avgText} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u;
function rule(r, i, v, n, mx) { if (r.idx) return r.idx.indexOf(i) >= 0; if (r.max) return v === mx; if (r.last) return i === n - 1; if (r.eq != null) return v === r.eq; if (r.from != null) return i >= r.from && i <= (r.to == null ? n - 1 : r.to); return false }
/* ───── 5판 P5 H 배치 : single · hstack · pick (짙은 바탕은 single · hstack) ───── */
var LAY = {};
function yAx(g, P, x0, x1, sc, suf) { sc.ticks.forEach(function (v) { var z = v === 0 || v === sc.lo;
    E('line', { x1: x0, x2: x1, y1: sc.Y(v), y2: sc.Y(v), stroke: z ? P.axis : P.grid, 'stroke-dasharray': z ? null : '3 4', 'stroke-width': v === 0 ? 1.4 : 1 }, g);
    T(g, x0 - 9, sc.Y(v) + 4.5, h.nf(v, sc.dec) + (suf || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute }) }) }
function swLeg(g, P, items, y, x) { items.forEach(function (it) { var w = h.textW(it.text, 13.5);
    if (it.frame) E('rect', { x: x, y: y - 12, width: 18, height: 13, rx: 3, fill: 'none', stroke: it.color, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g); else E('rect', { x: x, y: y - 12, width: 16, height: 13, rx: 2, fill: it.color }, g);
    T(g, x + 26, y, it.text, { 'font-size': 13.5, fill: P.sub }); x += 26 + w + 26 }) }
var PAL = ['dark', 'g65', 'g40', 'g18', 'gray'];
var PALD = ['g40', 'g65', 'main', 'dark', 'gray'];
function lum(hex) { var m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return 0; var v = parseInt(m[1], 16); return (.299 * (v >> 16) + .587 * ((v >> 8) & 255) + .114 * (v & 255)) / 255 }
function onSeg(hex) { return lum(hex) > .6 ? '#1D2521' : '#FFFFFF' }

LAY.single = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], data = s.data || [], n = data.length, y = s.y || {}, dec = s.dec != null ? s.dec : (y.dec != null ? y.dec : 1), suf = y.suf || s.unit || '', bg = s.big || {}, one = n === 1, svg = ctx.svg(512);
  var ml = 74, x1 = one ? 660 : 1168, top = 28, bot = 446, sc = u.yScale(data.concat([0]), y, top, bot), Y = sc.Y, slot = (x1 - ml) / n, bw = one ? 190 : Math.min(210, slot * .56), X = function (i) { return ml + slot * (i + .5) };
  var g1 = h.lv(svg, 1); yAx(g1, P, ml, x1, sc, suf); if (y.unit) T(g1, ml, top - 8, y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: P.mute });
  if (s.ref) { var ry = Y(s.ref.v), gr = h.lv(svg, 3, { 'data-fx': 'fade' }); E('line', { x1: ml, x2: x1, y1: ry, y2: ry, stroke: P.warn, 'stroke-width': 2, 'stroke-dasharray': '7 5' }, gr);
    T(gr, ml + 8, ry - 9, s.ref.text, { 'text-anchor': 'start', 'font-size': 14, 'font-weight': 700, fill: P.warn }) }
  if (one && s.ref && s.ref.gap) { var gx = X(0) + bw / 2 + 34, gp = h.lv(svg, 4, { 'data-fx': 'fade', 'data-ms': 500 }); h.arrow2(gp, gx, Y(s.ref.v), Y(data[0]), P.dark, 2);
    T(gp, gx + 14, (Y(s.ref.v) + Y(data[0])) / 2 + 5, s.ref.gap, { 'font-size': 16, 'font-weight': 700, fill: P.dark }) }
  data.forEach(function (v, i) { var hero = i === n - 1, c = hero ? P.main : P.g40, fs = one ? 64 : 34, cx = X(i);
    E('rect', { x: cx - bw / 2, y: Y(v), width: bw, height: Math.max(2, Y(0) - Y(v)), rx: 5, fill: c, 'data-key': labels[i], 'data-b': 2, 'data-fx': 'grow', 'data-ms': 900 }, svg);
    T(svg, cx, Y(v) - 14, h.nf(v, dec) + suf, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: hero ? P.dark : P.sub, 'data-key': labels[i], 'data-at': 750 + i * 150, 'data-fx': 'count', 'data-count': v, 'data-dec': dec, 'data-suf': suf, 'data-ms': 900 });
    T(g1, cx, bot + 30, labels[i] || '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': hero ? 700 : 400, fill: hero ? P.ink : P.sub }) });
  if (one) { var pn = h.lv(svg, 4, { 'data-fx': 'left', 'data-ms': 600 }), px = 724; T(pn, px, 56, bg.name || labels[0], { 'font-size': 22, 'font-weight': 700, fill: P.ink });
    E('line', { x1: px, x2: 1168, y1: 76, y2: 76, stroke: P.axis }, pn);
    (bg.lines || []).forEach(function (t, k) { var yy = 132 + k * 104; E('circle', { cx: px + 14, cy: yy - 7, r: 13, fill: P.main }, pn); T(pn, px + 14, yy - 1.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ctx.dark ? '#003D2B' : '#fff' });
      h.wrap(t, 22, 396).slice(0, 3).forEach(function (ln, j) { T(pn, px + 42, yy + j * 30, ln, { 'font-size': 22, fill: P.ink }) }) }) }
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 200) };

LAY.hstack = function (bd, s, ctx) { var P = ctx.P, rows = s.rows || [], cats = s.cats || [], n = rows.length, dec = s.dec != null ? s.dec : 0, suf = s.unit == null ? '%' : s.unit, mk = s.mark || 0, svg = ctx.svg(512), deep = ctx.dark;
  var x0 = 210, x1 = 1168 - 96, top = 50, bot = 492, rh = Math.min(64, (bot - top) / n), bh = Math.round(rh * .7), mx = Math.max.apply(null, rows.map(function (r) { return r.parts.reduce(function (a, b) { return a + b }, 0) })), sc = (x1 - x0) / mx;
  var pal = s.colors || (deep ? PALD : PAL), cl = function (k) { var c = pal[k % pal.length]; return P[c] || c };
  swLeg(h.lv(svg, 1), P, cats.map(function (c, k) { return { text: c, color: cl(k) } }), 18, 0);
  var hg = h.lv(svg, 1); T(hg, x1 + 14, 22, cats[mk], { 'font-size': 13, 'font-weight': 700, fill: P.mute });
  var stg = Math.min(240, 2400 / n);
  rows.forEach(function (r, i) { var y = top + i * rh + (rh - bh) / 2, xx = x0, hi = s.hi != null && s.hi === i, g = h.at(svg, 300 + i * stg, { 'data-fx': 'wipe', 'data-ms': 700, 'data-key': r.name });
    T(g, 0, y + bh / 2 + 5, r.name, { 'font-size': 15, 'font-weight': hi ? 700 : 400, fill: P.ink });
    r.parts.forEach(function (v, k) { var w = v * sc; E('rect', { x: xx, y: y, width: Math.max(0, w - 1.5), height: bh, fill: cl(k) }, g);
      if (w > h.textW(h.nf(v, dec) + suf, 13.5, true) + 10) T(g, xx + w / 2, y + bh / 2 + 4.8, h.nf(v, dec) + suf, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: onSeg(cl(k)) }); xx += w });
    T(g, x1 + 14, y + bh / 2 + 5.5, h.nf(r.parts[mk], dec) + suf, { 'font-size': 16, 'font-weight': 700, fill: P.dark }) });
  ctx.root.setAttribute('data-gap', 300) };

LAY.pick = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], data = s.data || [], n = data.length, y = s.y || {}, dec = y.dec != null ? y.dec : 0, suf = y.suf || '', pk = s.pick || {}, ix = pk.idx || [], bx = pk.box || [ix[0], ix[ix.length - 1]], svg = ctx.svg(512);
  var ml = 74, x1 = 1168, top = 96, bot = 448, sc = u.yScale(data.concat([0]), y, top, bot), Y = sc.Y, slot = (x1 - ml) / n, bw = Math.min(56, slot * .62), X = function (i) { return ml + slot * (i + .5) }, lg = pk.legend || ['그 밖의 달', '강조한 달'];
  swLeg(h.lv(svg, 1), P, [{ text: lg[0], color: P.gray }, { text: lg[1], color: P.dark }].concat(pk.text ? [{ text: lg[2] || pk.text, color: P.axis, frame: 1 }] : []), 18, 0);
  var g1 = h.lv(svg, 1); yAx(g1, P, ml, x1, sc, suf); if (y.unit) T(g1, ml, top - 16, y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: P.mute });
  u.xLabels(g1, labels, X, bot + 22, u.xTicks(n, 12, s.ticks), { boldLast: false }); var showV = n <= 14, hg = h.lv(svg, 3, { 'data-fx': 'fade' });
  data.forEach(function (v, i) { var yt = v >= 0 ? Y(v) : Y(0), pick = ix.indexOf(i) >= 0, hh = Math.max(2, Math.abs(Y(v) - Y(0)));
    E('rect', { x: X(i) - bw / 2, y: yt, width: bw, height: hh, rx: 2.5, fill: P.gray, 'data-key': labels[i], 'data-b': 2, 'data-fx': 'grow', 'data-ms': 600, 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg);
    if (pick) { E('rect', { x: X(i) - bw / 2, y: yt, width: bw, height: hh, rx: 2.5, fill: P.dark, 'data-key': labels[i] }, hg); T(hg, X(i), v >= 0 ? Y(v) - 10 : Y(v) + 24, h.nf(v, dec) + suf, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: P.dark }) }
    else if (showV) T(svg, X(i), v >= 0 ? Y(v) - 8 : Y(v) + 19, h.nf(v, dec), { 'text-anchor': 'middle', 'font-size': 12.5, fill: P.mute, 'data-b': 2, 'data-fx': 'fade' }) });
  var ys = []; for (var i = bx[0]; i <= bx[1]; i++) ys.push(Y(data[i])), ys.push(Y(0)); var yA = Math.min.apply(null, ys) - 48, yB = Math.max.apply(null, ys) + (Math.max.apply(null, ys) > Y(0) + 1 ? 14 : 5), xa = X(bx[0]) - slot / 2 + 3, xb = X(bx[1]) + slot / 2 - 3;
  var fg = h.lv(svg, 4, { 'data-fx': 'fade', 'data-ms': 600 }); E('rect', { x: xa, y: yA, width: xb - xa, height: yB - yA, rx: 9, fill: 'none', stroke: P.dark, 'stroke-width': 2.2, 'stroke-dasharray': '7 6' }, fg);
  if (pk.text) { var cw = Math.max(h.textW(pk.text, 15, true), pk.sub ? h.textW(pk.sub, 13, false) : 0) + 28, ch = pk.sub ? 52 : 32, cx = (xa + xb) / 2, ct = Math.max(30, yA - ch - 8), cl = Math.max(ml, Math.min(1168 - cw, cx - cw / 2));
    var tc = ctx.dark ? '#003D2B' : '#fff'; E('rect', { x: cl, y: ct, width: cw, height: ch, rx: 9, fill: P.dark }, fg); T(fg, cl + cw / 2, ct + 21, pk.text, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: tc });
    if (pk.sub) T(fg, cl + cw / 2, ct + 41, pk.sub, { 'text-anchor': 'middle', 'font-size': 13, fill: tc }) }
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', Math.max(12, Math.min(50, 900 / n))) };

ECOM.parts.bar = function (bd, s, ctx) { if (s.layout && LAY[s.layout]) return LAY[s.layout](bd, s, ctx); u = ECOM.u;
  var labels = s.labels || [], data = s.data || [], n = data.length, root = ctx.root, svg = ctx.svg(512), lanes = s.lanes || [];
  var top = s.phases ? 60 : 34, bot = lanes.length ? 300 : 470, ml = 58, x1 = s.dist ? 880 : 1168, slot = (x1 - ml) / n, bw = Math.max(3, Math.min(48, slot * .6)), dec = (s.y && s.y.dec != null) ? s.y.dec : 2;
  function X(i) { return ml + slot * (i + .5) }
  var sc = u.yScale(data.concat([0]), s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' }), mx = Math.max.apply(null, data);
  if (s.phases) u.phaseBands(g1, s.phases, X, slot / 2, top, bot, 30);
  u.yAxis(g1, ml, x1, sc, { unit: s.y && s.y.unit });
  u.xLabels(g1, labels, X, bot + 18, u.xTicks(n, 10, s.ticks), { boldLast: true });
  var T0 = s.playback ? 450 : 0, PB = s.playback ? Math.max(18, Math.min(60, 2300 / n)) : 0, B = [];
  data.forEach(function (v, i) { var hgt = Math.abs(Y(v) - Y(0)), a = { x: X(i) - bw / 2, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(hgt, 1.5), rx: Math.min(2, bw / 4), fill: v < 0 ? C.light : C.gray, 'data-fx': 'grow', 'data-ms': s.playback ? 260 : 420, 'data-o': v >= 0 ? '50% 100%' : '50% 0%' };
    if (s.playback) a['data-at'] = T0 + i * PB; else { a['data-b'] = 2 } B.push({ i: i, v: v, r: E('rect', a, svg) }) });
  if (!s.playback) root.setAttribute('data-stg', Math.max(4, Math.min(30, 600 / n)));
  var tEnd = T0 + (n - 1) * PB + 300, AT = function (ms) { return s.playback ? { 'data-at': ms } : { 'data-b': 3 } };
  /* 결정 줄 */
  if (lanes.length) { var sum = h.lv(svg, 1); lanes.forEach(function (ln, r) { var cy = 374 + r * 60, c = h.col(ln.color || (r ? 'main' : 'cmp')), g = h.lv(svg, 1);
      T(g, 0, cy - 2, ln.name, { 'font-size': 14, 'font-weight': 700, fill: C.ink }); T(g, 0, cy + 14, ln.sub || '결정', { 'font-size': 12, fill: C.mute });
      E('line', { x1: ml, x2: x1, y1: cy, y2: cy, stroke: C.grid, 'stroke-width': 2 }, g);
      var vv = ln.values || [], st = ln.step || .25; for (var i = 0; i < n; i++) { var dv = +((vv[i + 1] || 0) - (vv[i] || 0)).toFixed(4); if (!dv || vv[i] == null || vv[i + 1] == null) continue;
        var at2 = s.playback ? { 'data-at': T0 + i * PB + 60, 'data-fx': 'pop', 'data-ms': 260 } : { 'data-b': 4, 'data-fx': 'pop' }; h.tri(svg, X(i), cy, dv > 0, 4 + Math.abs(dv) / st * 2.2, c, at2) }
      if (s.laneSum && s.laneSum[r]) T(svg, x1 + 22, cy + 5, s.laneSum[r].text || s.laneSum[r], Object.assign({ 'font-size': 14, 'font-weight': 700, fill: c, 'data-fx': 'fade' }, AT(tEnd + 200))) });
    if (s.laneSumTitle) T(svg, x1 + 22, 350, s.laneSumTitle, Object.assign({ 'font-size': 12, fill: C.mute }, AT(tEnd + 200)));
    if (s.laneNote) T(svg, ml, 486, s.laneNote, Object.assign({ 'font-size': 12.5, fill: C.mute, 'data-fx': 'fade' }, AT(tEnd + 300))) }
  /* 주석 */
  var an = E('g', AT(tEnd + 120), svg), BR = [], NT = [], LS = null;
  (s.brackets || []).forEach(function (b) { var x0 = X(b.from) - bw / 2, xb = X(b.to) + bw / 2, m = -Infinity; for (var i = b.from; i <= b.to; i++) m = Math.max(m, data[i]);
    var y = Y(m) - 12, q = E('g', {}, an); h.bracket(q, x0, xb, y, C.dark); T(q, (x0 + xb) / 2, y - 9, b.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.dark });
    if (b.sub) T(q, (x0 + xb) / 2, y - 26, b.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }); BR.push(q) });
  (s.notes || []).forEach(function (nt) { var q = E('g', {}, an), x = X(nt.at), v = data[nt.at], an2 = nt.anchor || 'end', tx = x + (an2 === 'end' ? 6 : an2 === 'start' ? -6 : 0), L = nt.len || 34, side = X(nt.at) > (ml + x1) / 2 ? -1 : 1;
    var below = nt.pos === 'below', yEnd = below ? Y(Math.min(0, v)) : Y(Math.max(0, v)), room = below ? (bot - 8) - (yEnd + L + 34) : (yEnd - L - 38) - (top - 6);
    if (room < 0) { var bx = x + side * (bw / 2 + 8), by = below ? yEnd - 6 : yEnd + 16; E('line', { x1: x + side * bw / 2, x2: bx - side * 2, y1: yEnd + (below ? -3 : 3), y2: yEnd + (below ? -3 : 3), stroke: C.mute }, q);
      T(q, bx, by - (nt.sub ? 8 : 0), nt.text, { 'text-anchor': side > 0 ? 'start' : 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, bx, by + 9, nt.sub, { 'text-anchor': side > 0 ? 'start' : 'end', 'font-size': 12.5, fill: C.mute }); NT.push(q); return }
    if (below) { var yz = yEnd + 4, ly = yz + L; E('line', { x1: x, x2: x, y1: yz, y2: ly, stroke: C.mute, 'stroke-dasharray': '2 3' }, q);
      T(q, tx, ly + 14, nt.text, { 'text-anchor': an2, 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, tx, ly + 31, nt.sub, { 'text-anchor': an2, 'font-size': 12.5, fill: C.mute }) }
    else { var yt = yEnd - 4, ly2 = yt - L; E('line', { x1: x, x2: x, y1: yt, y2: ly2, stroke: C.mute, 'stroke-dasharray': '2 3' }, q);
      T(q, tx, ly2 - 20, nt.text, { 'text-anchor': an2, 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, tx, ly2 - 4, nt.sub, { 'text-anchor': an2, 'font-size': 12.5, fill: C.mute }) }
    NT.push(q) });
  if (s.avg) { var av = data.reduce(function (p2, c2) { return p2 + c2 }, 0) / n, ag = E('g', AT(tEnd + 160), svg); E('line', { x1: ml, x2: x1, y1: Y(av), y2: Y(av), stroke: C.dark, 'stroke-dasharray': '5 4', opacity: .55 }, ag);
    var leftBusy = (s.notes || []).some(function (q) { return q.at < n * .3 }) || n - 1 < 0, rightBusy = (s.notes || []).some(function (q) { return q.at > n * .7 }) || !!s.last;
    var ax = leftBusy && !rightBusy ? x1 - 6 : (leftBusy && rightBusy ? X(Math.floor(n / 2)) : ml + 6), an3 = leftBusy && !rightBusy ? 'end' : (leftBusy && rightBusy ? 'middle' : 'start');
    T(ag, ax, Y(av) - 7, String(s.avg.text || '평균 {v}').replace('{v}', h.nf(av, dec) + (s.unit || '')), { 'text-anchor': an3, 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) }
  if (s.last) { LS = E('g', {}, an); var nearR = X(n - 1) > x1 - 60; T(LS, nearR ? X(n - 1) + bw / 2 : X(n - 1), Y(Math.max(0, data[n - 1])) - 9, s.last.text || (h.nf(data[n - 1], dec) + (s.unit || '')), { 'text-anchor': nearR ? 'end' : 'middle', 'font-size': 15, 'font-weight': 700, fill: C.main }) }
  if (s.negNote) T(an, X(s.negNote.at), Y(s.negNote.v), s.negNote.text, { 'font-size': 13, fill: C.mute });
  /* 분포 */
  if (s.dist) { var ds = s.dist, f = ds.from || 0, t = ds.to == null ? n - 1 : ds.to, cnt = {}, tot = 0, sm = 0; for (var i = f; i <= t; i++) { cnt[data[i]] = (cnt[data[i]] || 0) + 1; tot++; sm += data[i] }
    var lvs = Object.keys(cnt).map(Number).sort(function (a, b) { return b - a }), cm = Math.max.apply(null, lvs.map(function (k) { return cnt[k] })), xs = 920, rowH = Math.min(27, 220 / lvs.length);
    T(svg, xs, 48, ds.title || ((t - f + 1) + '개월 분포'), Object.assign({ 'font-size': 13.5, 'font-weight': 700, fill: C.ink }, AT(tEnd + 260)));
    lvs.forEach(function (lv, k) { var y = 74 + k * rowH, w = cnt[lv] / cm * 128, hiR = lv === mx;
      T(svg, xs + 48, y + 4, h.nf(lv, dec) + (s.unit || ''), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, fill: C.sub, 'data-fx': 'fade' }, AT(tEnd + 260 + k * 60)));
      E('rect', Object.assign({ x: xs + 56, y: y - 8, width: w, height: 14, rx: 2, fill: hiR ? C.dark : (lv === data[n - 1] ? C.main : C.gray), 'data-fx': 'growx' }, AT(tEnd + 260 + k * 60)), svg);
      T(svg, xs + 62 + w, y + 4, cnt[lv] + (ds.unitN || '개월'), Object.assign({ 'font-size': 12.5, 'font-weight': 700, fill: hiR ? C.dark : C.sub, 'data-fx': 'fade' }, AT(tEnd + 320 + k * 60))) });
    if (ds.avg !== false) T(svg, xs, Math.min(300, 74 + lvs.length * rowH + 14), (ds.avgText || '평균 {v}').replace('{v}', h.nf(sm / tot, dec) + (s.unit || '')), Object.assign({ 'font-size': 14, 'font-weight': 700, fill: C.main, 'data-fx': 'fade' }, AT(tEnd + 800))) }
  /* 강조 · 바뀜 */
  function paint(k) { var st = k > 0 && s.beats && s.beats[k - 1] ? s.beats[k - 1] : null, rules = st && st.hi ? st.hi : (s.hi || []), dim = st && st.dim || s.dim0 || [];
    B.forEach(function (b) { var c = b.v < 0 ? C.light : C.gray; rules.forEach(function (r) { if (rule(r, b.i, b.v, n, mx)) c = h.col(r.color || 'dark') }); b.r.setAttribute('fill', c) });
    BR.forEach(function (q) { q.style.opacity = dim.indexOf('brackets') >= 0 ? .3 : 1 }); NT.forEach(function (q) { q.style.opacity = dim.indexOf('notes') >= 0 ? .35 : 1 }); if (LS) LS.style.opacity = dim.indexOf('last') >= 0 ? .35 : 1 }
  root._beat = function (k) { root._bk = k; paint(k) }; paint(0);
  /* 재생 막대 */
  if (s.playback) { var ph = E('g', { style: 'display:none' }, svg); E('line', { x1: 0, x2: 0, y1: top - 8, y2: bot, stroke: C.dark, 'stroke-width': 1.5 }, ph); E('rect', { x: -66, y: top - 38, width: 132, height: 26, rx: 13, fill: C.dark }, ph);
    var rd = T(ph, 0, top - 20, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    root._hook = function (r) { var len = (n - 1) * PB; ph.style.display = ''; h.A(ph, [{ transform: 'translate(' + X(0) + 'px,0)' }, { transform: 'translate(' + X(n - 1) + 'px,0)' }], len, 'linear', T0);
      var t0 = null; function stp(ts) { if (t0 === null) t0 = ts; var el = ts - t0 - T0, k = Math.max(0, Math.min(n - 1, Math.floor(el / PB))); rd.textContent = labels[k] + ' · ' + h.nf(data[k], dec) + (s.unit || '');
        if (el < len + PB) r._raf.push(requestAnimationFrame(stp)); else h.later(r, function () { ph.style.display = 'none' }, 300) } r._raf.push(requestAnimationFrame(stp)); paint(0); return T0 + len + 400 };
    root._reset = function () { ph.style.display = 'none'; paint(root._bk || 0) } }
};
ECOM.parts.bar.layouts = ['default', 'single', 'hstack', 'pick']; ECOM.parts.bar.dark = ['single', 'hstack'];
})();
