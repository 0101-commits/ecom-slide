/* scentree — 시나리오 나무 : 뿌리 상자 → 갈래 2~4개(선 굵기 = 가능성 %) → 갈래마다 결과 숫자 칸. 가장 가능성 높은 갈래 강조
   root{title,sub} · branches[{name,sub,p(%),hi,outcomes:[{k,v}], children:[{name,sub,p(%, 갈래 안 몫),hi,outcomes}]}]
   children 이 있으면 2단(갈래 → 다시 갈래 → 결과) · 강조 = 끝 갈래 중 가능성(곱) 가장 큰 것(또는 hi:true) 쪽 길
   heads{branch,sub,out}(열 머리 글, 선택) · legend('선 굵기 = 가능성' 기본, false 면 없음) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 12) && h.textW(s, size, bold) > maxW) size -= .5; return size }
ECOM.parts.scentree = function (bd, s, ctx) {
  var br = (s.branches || []).slice(0, 4), rt = s.root || {}; if (!br.length) return;
  var svg = ctx.svg(512), two = br.some(function (b) { return b.children && b.children.length }), leaves = [];
  br.forEach(function (b, i) { var ch = two && b.children && b.children.length ? b.children.slice(0, 3) : null;
    if (ch) ch.forEach(function (c) { leaves.push({ bi: i, n: c, pj: (+b.p || 0) * (+c.p || 0) / 100, two: true }) }); else leaves.push({ bi: i, n: b, pj: +b.p || 0, two: false }) });
  var hi = -1, mx = -1, forced = leaves.some(function (l, i) { if (l.n.hi) { hi = i; return true } });
  if (!forced) leaves.forEach(function (l, i) { if (l.pj > mx) { mx = l.pj; hi = i } });
  var n = leaves.length, top = 46, AH = 452, rh = AH / n, bh = Math.max(50, Math.min(76, rh - 14)), cyL = leaves.map(function (l, i) { return top + rh * (i + .5) });
  var X1 = two ? 214 : 330, W1 = two ? 196 : 224, X2 = 486, W2 = 196, XO = two ? 756 : 660, RW = 150;
  var bcy = br.map(function (b, i) { var ys = cyL.filter(function (y, k) { return leaves[k].bi === i }); return ys.reduce(function (a, y) { return a + y }, 0) / ys.length });
  var rcy = bcy.reduce(function (a, y) { return a + y }, 0) / bcy.length, hiB = hi >= 0 ? leaves[hi].bi : -1;
  var hd = s.heads || null;
  if (hd) { var gh = h.at(svg, 1500, { 'data-fx': 'fade' });
    if (hd.branch) T(gh, X1, 20, hd.branch, { 'font-size': 13, 'font-weight': 700, fill: C.mute });
    if (hd.sub && two) T(gh, X2, 20, hd.sub, { 'font-size': 13, 'font-weight': 700, fill: C.mute });
    if (hd.out) T(gh, XO, 20, hd.out, { 'font-size': 13, 'font-weight': 700, fill: C.mute }) }
  var gr = h.at(svg, 0, { 'data-fx': 'pop', 'data-ms': 380 });
  E('rect', { x: 0, y: rcy - 40, width: RW, height: 80, rx: 12, fill: C.dark }, gr);
  T(gr, RW / 2, rcy - 4, rt.title || '', { 'text-anchor': 'middle', 'font-size': fit(rt.title || '', 18, RW - 20, 1, 13), 'font-weight': 700, fill: '#fff' });
  if (rt.sub) T(gr, RW / 2, rcy + 20, rt.sub, { 'text-anchor': 'middle', 'font-size': fit(rt.sub, 14, RW - 20, 1, 12), 'font-weight': 600, fill: C.g18 });
  function curve(x0, y0, x1, y1, p, on, at) { var sw = Math.min(14, 3 + (+p || 0) / 3), xm = (x0 + x1) / 2;
    E('path', { d: 'M' + x0 + ' ' + y0 + ' C' + xm + ' ' + y0 + ' ' + xm + ' ' + y1 + ' ' + x1 + ' ' + y1, fill: 'none', stroke: on ? C.main : C.g40, 'stroke-width': sw, 'stroke-linecap': 'round', 'data-at': at, 'data-fx': 'draw', 'data-ms': 520 }, svg) }
  function box(x, cy, w, hh, nd, on, at) { var g = h.at(svg, at, { 'data-fx': 'fade', 'data-ms': 360 }), pw = nd.p != null ? h.textW(h.nf(nd.p, 0) + '%', 26, 1) + 8 : 0, mw = w - 28 - pw;
    E('rect', { x: x, y: cy - hh / 2, width: w, height: hh, rx: 10, fill: '#fff', stroke: on ? C.dark : C.line, 'stroke-width': on ? 2.5 : 1.2 }, g);
    T(g, x + 14, cy - (nd.sub ? 6 : -6), nd.name || '', { 'font-size': fit(nd.name || '', 17, mw, 1, 13), 'font-weight': 700, fill: C.ink });
    if (nd.sub) T(g, x + 14, cy + 17, nd.sub, { 'font-size': fit(nd.sub, 12.5, mw, 0, 11.5), fill: C.mute });
    if (nd.p != null) T(g, x + w - 14, cy + 9, h.nf(nd.p, 0) + '%', { 'text-anchor': 'end', 'font-size': 26, 'font-weight': 700, fill: on ? C.dark : C.g65 }) }
  var done = {};
  leaves.forEach(function (l, i) { var on = i === hi, bi = l.bi, b = br[bi], onB = bi === hiB, t = 200 + i * 130;
    if (!done[bi]) { done[bi] = 1; curve(RW, rcy, X1, bcy[bi], b.p, onB, 200 + bi * 130); box(X1, bcy[bi], W1, 64, b, onB, 500 + bi * 130) }
    var sx;
    if (l.two) { curve(X1 + W1, bcy[bi], X2, cyL[i], l.n.p, on, 700 + i * 110); box(X2, cyL[i], W2, bh < 64 ? bh : 64, l.n, on, 960 + i * 110); sx = X2 + W2 }
    else sx = X1 + W1;
    var tl = 1000 + i * 130 + (two ? 300 : 0);
    E('path', { d: 'M' + sx + ' ' + cyL[i] + ' H' + XO, fill: 'none', stroke: C.axis, 'stroke-width': 1.5, 'data-at': tl, 'data-fx': 'draw', 'data-ms': 360 }, svg);
    var oc = l.n.outcomes || [], m = Math.max(1, oc.length), OW = 1168 - XO, cw = (OW - 28) / m, g = h.at(svg, tl + 300, { 'data-fx': 'fade' }), lblY = bh >= 76 ? -8 : -6, vS = bh >= 76 ? 24 : 22;
    E('rect', { x: XO, y: cyL[i] - bh / 2, width: OW, height: bh, rx: 10, fill: on ? C.g08 : C.paper }, g);
    oc.forEach(function (o, j) { var x = XO + 18 + j * cw;
      T(g, x, cyL[i] + lblY, o.k || '', { 'font-size': fit(o.k || '', 13, cw - 10, 1, 11.5), 'font-weight': 600, fill: C.mute });
      T(g, x, cyL[i] + (bh >= 76 ? 24 : 20), o.v == null ? '' : String(o.v), { 'font-size': fit(String(o.v), vS, cw - 10, 1, 15), 'font-weight': 700, fill: C.ink }) }) });
  if (s.legend !== false) { var gl = h.at(svg, 1500, { 'data-fx': 'fade' }); T(gl, 0, 506, typeof s.legend === 'string' ? s.legend : '선 굵기 = 가능성', { 'font-size': 12.5, 'font-weight': 600, fill: C.mute }) }
};
})();
