/* p_chainfire.js — 연쇄 점화(영상 장면 문법). 마디가 차례로 켜지며 충격이 다음 마디로 번짐. 켜진 색은 늦게 전달될수록 옅어짐. 기본 DOM = 모두 켜진 끝 모습, 점화는 _hook 안에서만(카드 · 이름은 켜지기 전엔 안 보이고 차례로 나타남).
   배치 line : 한 줄 — 마디 4~7개가 시간 순으로 켜지고 아래 카드 · 시간 눈금 · 결과 띠 · 기본(default)
              칸 nodes[{title,text,value,lag(앞 마디에서 이 마디까지 걸린 말 · 첫 마디는 비움),t(시간 눈금)}] · result{label,text} · waves(범례 이름 4개, 기본 최초 충격 · 1차 · 2차 · 3차 이후)
   배치 net  : 망 — 한 마디(첫 번째)에서 시작해 이어진 마디로 번지고 오른쪽 칸에 전달 순서가 정리됨
              칸 nodes[{id,label,x,y(0~1, 망 칸 안 자리),value}] · edges[{from,to,lag}] · waves[차례 이름…] · panel{title,note} */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T, K = ECOM.kx;
var MIXT = [0, .26, .46, .62];
function mix(c, base, t) { var a = [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }), b = [1, 3, 5].map(function (i) { return parseInt(base.slice(i, i + 2), 16) });
  return 'rgb(' + a.map(function (v, i) { return Math.round(v * (1 - t) + b[i] * t) }).join(',') + ')' }
var DK = .72;
function pal(ctx) { var P = ctx.P, base = ctx.dark ? P.bg : '#FFFFFF';
  return { shade: function (d) { return mix(P.warn, base, MIXT[Math.min(3, d)] * (ctx.dark ? DK : 1)) }, txt: function (d) { return ctx.dark ? (d < 2 ? '#2A1005' : '#fff') : (d < 2 ? '#fff' : P.ink) },
    off: ctx.dark ? P.g08 : '#FFFFFF', offLine: ctx.dark ? P.g40 : P.axis } }
function hook(ctx, items, end) { ctx.root._hook = function () { if (h.RM()) return 0; var e = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; e = Math.max(e, it.at + it.ms) }); return end || e } }
function fadeIt(el, at, ms, from) { return { el: el, at: at, ms: ms || 450, kf: [{ opacity: from == null ? 0 : from }, { opacity: 1 }] } }
function drawIt(el, at, ms) { return { el: el, at: at, ms: ms || 380, kf: [{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .97, opacity: 1, offset: .03 }, { strokeDashoffset: 0, opacity: 1 }] } }
function fit(t, size, w, bold) { while (size > 12.5 && h.textW(t || '', size, bold) > w) size -= .5; return size }
/* 마디 하나 : 원 + (켜질 때 퍼지는 고리). 켜짐 = fill 이 꺼진 색 → 켜진 색 */
function node(p, x, y, r, col, pl, items, t) {
  var ring = E('circle', { cx: x, cy: y, r: r, fill: 'none', stroke: col, 'stroke-width': 3, opacity: 0, style: 'transform-box:fill-box;transform-origin:center' }, p);
  var c = E('circle', { cx: x, cy: y, r: r, fill: col, stroke: col, 'stroke-width': 2.5 }, p);
  items.push({ el: c, at: t, ms: 420, kf: [{ fill: pl.off, stroke: pl.offLine }, { fill: col, stroke: col }] });
  items.push({ el: ring, at: t + 60, ms: 760, ease: 'ease-out', kf: [{ opacity: 0, transform: 'scale(1)' }, { opacity: .75, offset: .18 }, { opacity: 0, transform: 'scale(2.2)' }] });
  return c }

function line(bd, s, ctx) {
  var P = ctx.P, pl = pal(ctx), svg = ctx.svg(512), nd = (s.nodes || []).slice(0, 7), n = nd.length, sw = 1168 / n, items = [], cy = 92, wv = s.waves || ['최초 충격', '1차 전달', '2차 전달', '3차 이후'];
  if (!n) return;
  var cx = nd.map(function (_, i) { return sw * (i + .5) }), r = function (i) { return i ? 37 : 45 }, STEP = Math.min(700, Math.round(3000 / n)), t0 = 400, tt = function (i) { return t0 + i * STEP };
  var links = E("g", {}, svg), nodes = E('g', {}, svg), cards = [];
  nd.forEach(function (q, i) {
    var d = i, col = pl.shade(d), g = E('g', { 'data-key': q.title || '' }, nodes);
    if (i) { var x1 = cx[i - 1] + r(i - 1) + 6, x2 = cx[i] - r(i) - 6, lg = E('g', {}, links), pa = E('path', { d: 'M' + x1 + ' ' + cy + ' H' + (x2 - 8), fill: 'none', stroke: col, 'stroke-width': 3.2, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, lg), hd = K.head(lg, x2, cy, 0, col, 12, {});
      items.push(drawIt(pa, tt(i) - 240, 300), fadeIt(hd, tt(i) - 60, 150));
      if (q.lag) { var ll = h.wrap(q.lag, 12.5, x2 - x1 + 6, 1).slice(0, 2), lt = E('g', {}, lg); ll.forEach(function (l, j) { T(lt, (x1 + x2) / 2, cy - 12 - (ll.length - 1 - j) * 15, l, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: P.sub }) }); items.push(fadeIt(lt, tt(i) - 200, 300)) } }
    node(g, cx[i], cy, r(i), col, pl, items, tt(i));
    if (q.value != null) { var vs = fit(q.value, i ? 15.5 : 17, 2 * r(i) - 10, 1), vt = T(g, cx[i], cy + 5.5, q.value, { 'text-anchor': 'middle', 'font-size': vs, 'font-weight': 800, fill: pl.txt(d) }); items.push(fadeIt(vt, tt(i) + 80, 250)) }
    var cw = sw - 14, cg = E('g', {}, svg), ctop = 152;
    E('rect', { x: cx[i] - cw / 2, y: ctop, width: cw, height: 152, rx: 12, fill: P.paper, stroke: P.line }, cg);
    var tl = h.wrap(q.title || '', 17, cw - 22, 1).slice(0, 2); tl.forEach(function (l, j) { T(cg, cx[i], ctop + 32 + j * 21, l, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: P.ink }) });
    var ty = ctop + 32 + (tl.length - 1) * 21 + 10; h.wrap(q.text || '', 15, cw - 22).slice(0, 5).forEach(function (l, j) { T(cg, cx[i], ty + 18 + j * 20, l, { 'text-anchor': 'middle', 'font-size': 15, fill: P.sub }) });
    items.push(fadeIt(cg, tt(i) + 100, 450, 0)) });
  /* 시간 눈금 */
  var ay = 334; E('line', { x1: 12, x2: 1130, y1: ay, y2: ay, stroke: P.axis, 'stroke-width': 1.6 }, svg); K.head(svg, 1152, ay, 0, P.axis, 11, {});
  T(svg, 1156, ay - 10, '시간', { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute });
  nd.forEach(function (q, i) { E('circle', { cx: cx[i], cy: ay, r: 4.5, fill: pl.shade(i) }, svg); if (q.t) T(svg, cx[i], ay + 22, q.t, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: P.ink }) });
  /* 범례 */
  var lx = 12; wv.slice(0, Math.min(4, Math.max(2, n))).forEach(function (w, i) { E('circle', { cx: lx + 8, cy: 382, r: 8, fill: pl.shade(i) }, svg); T(svg, lx + 22, 386.5, w, { 'font-size': 12.5, fill: P.sub }); lx += 40 + h.textW(w, 12.5, 0) });
  var rs = s.result;
  if (rs) { var rg = E('g', { 'data-at': tt(n - 1) + 500, 'data-fx': 'rise', 'data-ms': 450, 'data-key': rs.label || '결과' }, svg);
    E('rect', { x: 0, y: 410, width: 1168, height: 102, rx: 12, fill: P.warnsoft }, rg);
    var pw = h.textW(rs.label || '', 15, 1) + 30; E('rect', { x: 22, y: 441, width: pw, height: 40, rx: 20, fill: P.warn }, rg); T(rg, 22 + pw / 2, 466, rs.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ctx.dark ? '#2A1005' : '#fff' });
    h.wrap(rs.text || '', 18, 1168 - pw - 90, 1).slice(0, 2).forEach(function (l, j, a) { T(rg, 52 + pw, (a.length > 1 ? 454 : 467) + j * 26, l, { 'font-size': 18, 'font-weight': 700, fill: P.ink }) }) }
  hook(ctx, items, tt(n - 1) + 900);
  ctx.root.setAttribute('data-gap', 300) }

function net(bd, s, ctx) {
  var P = ctx.P, pl = pal(ctx), svg = ctx.svg(512), nd = (s.nodes || []).slice(0, 10), ed = s.edges || [], wv = s.waves || [], pn = s.panel || {}, items = [], AX = 24, AY = 28, AW = 740, AH = 440;
  if (!nd.length) return;
  var idx = {}; nd.forEach(function (q, i) { idx[q.id] = i; q._x = AX + q.x * AW; q._y = AY + q.y * AH; q._d = i ? 99 : 0 });
  for (var pass = 0; pass < 8; pass++) ed.forEach(function (e) { var a = nd[idx[e.from]], b = nd[idx[e.to]]; if (a && b && a._d + 1 < b._d) b._d = a._d + 1 });
  nd.forEach(function (q) { if (q._d === 99) q._d = 3 });
  var maxD = Math.max.apply(null, nd.map(function (q) { return q._d })), STEP = 700, tt = function (d) { return 400 + d * STEP };
  var eg = E('g', {}, svg), ng = E('g', {}, svg);
  var rad = function (q) { return q._d === 0 ? 38 : 30 };
  ed.forEach(function (e) { var a = nd[idx[e.from]], b = nd[idx[e.to]]; if (!a || !b) return; var dx = b._x - a._x, dy = b._y - a._y, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, ra = rad(a) + 5, rb = rad(b) + 5;
    var x1 = a._x + ux * ra, y1 = a._y + uy * ra, x2 = b._x - ux * rb, y2 = b._y - uy * rb, col = pl.shade(b._d), g = E('g', {}, eg);
    var pa = E('path', { d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L' + (x2 - ux * 9).toFixed(1) + ' ' + (y2 - uy * 9).toFixed(1), fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, g);
    var hd = K.head(g, x2, y2, Math.atan2(uy, ux), col, 12, {}), t = tt(b._d);
    items.push(drawIt(pa, t - 280, 340), fadeIt(hd, t - 60, 160));
    if (e.lag) { var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, w = h.textW(e.lag, 12.5, 1) + 14, lg = E('g', {}, g);
      E('rect', { x: mx - w / 2, y: my - 11, width: w, height: 22, rx: 11, fill: ctx.dark ? P.bg : '#fff', stroke: col, 'stroke-width': 1.4 }, lg); T(lg, mx, my + 4.5, e.lag, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: P.ink }); items.push(fadeIt(lg, t - 120, 300)) } });
  nd.forEach(function (q) { var g = E('g', { 'data-key': q.label || q.id }, ng), r = rad(q), col = pl.shade(q._d), t = tt(q._d);
    node(g, q._x, q._y, r, col, pl, items, t);
    if (q.value != null) { var vt = T(g, q._x, q._y + 5, q.value, { 'text-anchor': 'middle', 'font-size': fit(q.value, 14, 2 * r - 8, 1), 'font-weight': 800, fill: pl.txt(q._d) }); items.push(fadeIt(vt, t + 80, 250)) }
    var lg = E('g', {}, g), ll = h.wrap(q.label || '', 16, 140, 1).slice(0, 2); ll.forEach(function (l, j) { T(lg, q._x, q._y + r + 22 + j * 19, l, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: P.ink }) }); items.push(fadeIt(lg, t, 400, 0)) });
  /* 오른쪽 칸 : 전달 순서 */
  var X0 = 800, W = 368, pg = E('g', { 'data-at': 200, 'data-fx': 'fade', 'data-ms': 400 }, svg);
  E('rect', { x: X0, y: 0, width: W, height: 512, rx: 14, fill: P.paper, stroke: P.line }, pg);
  T(pg, X0 + 24, 42, pn.title || '전달 순서', { 'font-size': 18, 'font-weight': 800, fill: P.ink });
  var y = 70;
  for (var d = 0; d <= maxD; d++) { var mem = nd.filter(function (q) { return q._d === d }); if (!mem.length) continue;
    var g = E('g', {}, svg), nm = h.wrap(mem.map(function (q) { return q.label }).join(' · '), 14, W - 100).slice(0, 3), hh = 44 + nm.length * 19;
    E('circle', { cx: X0 + 34, cy: y + 18, r: 14, fill: pl.shade(d) }, g); T(g, X0 + 34, y + 23, String(d), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: pl.txt(d) });
    T(g, X0 + 60, y + 24, wv[d] || (d ? d + '차 전달' : '최초 충격'), { 'font-size': 15.5, 'font-weight': 700, fill: P.ink });
    nm.forEach(function (l, j) { T(g, X0 + 60, y + 46 + j * 19, l, { 'font-size': 14, fill: P.sub }) });
    items.push(fadeIt(g, tt(d) + 100, 450, 0)); y += hh + 16 }
  if (pn.note) h.wrap(pn.note, 13.5, W - 48).slice(0, 4).forEach(function (l, j) { T(pg, X0 + 24, 512 - 78 + j * 19, l, { 'font-size': 13.5, fill: P.mute }) });
  hook(ctx, items, tt(maxD) + 900);
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.chainfire = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'line'; ({ line: line, net: net }[L] || line)(bd, s, ctx) };
ECOM.parts.chainfire.layouts = ['default', 'line', 'net'];
ECOM.parts.chainfire.dark = ['default', 'line', 'net'];
})();
