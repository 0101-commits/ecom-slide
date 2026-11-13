/* cotreemap — 사업부 트리맵(이익률 색) : 칸 넓이 = 매출 비중, 칸 색 = 영업이익률(짙을수록 높음, 적자는 붉은 바탕) · 칸마다 이름 + 매출 · 비중 + 이익률 · 아래 색 눈금
   items[{name,value,margin}] 4~10개(value 큰 순 자동) · unit('조원') · dec · marginTitle('영업이익률') · hero(이름, 테두리 강조) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function squarify(items, x, y, w, hh) { var out = [], rest = items.slice(), tot = rest.reduce(function (a, b) { return a + b.value }, 0), sc = w * hh / tot; rest.forEach(function (it) { it.a = it.value * sc });
  function worst(row, side) { var s = row.reduce(function (a, b) { return a + b.a }, 0), mx = Math.max.apply(null, row.map(function (r) { return r.a })), mn = Math.min.apply(null, row.map(function (r) { return r.a })); return Math.max(side * side * mx / (s * s), s * s / (side * side * mn)) }
  while (rest.length) { var side = Math.min(w, hh), row = [rest.shift()];
    while (rest.length && worst(row.concat([rest[0]]), side) <= worst(row, side)) row.push(rest.shift());
    var s = row.reduce(function (a, b) { return a + b.a }, 0), th = s / side;
    if (w >= hh) { var yy = y; row.forEach(function (r) { var ch = r.a / th; out.push({ it: r, x: x, y: yy, w: th, h: ch }); yy += ch }); x += th; w -= th }
    else { var xx = x; row.forEach(function (r) { var cw = r.a / th; out.push({ it: r, x: xx, y: y, w: cw, h: th }); xx += cw }); y += th; hh -= th } }
  return out }
function mix(a, b, t) { var p = function (c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }) }, A = p(a), B = p(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t) }).join(',') + ')' }
ECOM.parts.cotreemap = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 10).map(function (q) { return { name: q.name, value: +q.value, margin: +q.margin } }); if (!I.length) return; I.sort(function (a, b) { return b.value - a.value }); var svg = ctx.svg(512), tot = I.reduce(function (a, b) { return a + b.value }, 0), dec = s.dec || 0, u = s.unit || '';
  var mg = I.map(function (q) { return q.margin }), mxm = Math.max.apply(null, mg), TH = 468, cells = squarify(I, 0, 0, 1168, TH), gap = 3;
  cells.forEach(function (c, k) { var q = c.it, neg = q.margin < 0, t = neg ? 0 : Math.min(1, q.margin / mxm), fill = neg ? C.warnsoft : mix('#D1E8E0', '#005136', Math.pow(t, .9)), dark = !neg && t > .45, tc = dark ? '#fff' : (neg ? C.warn : C.ink), mc = dark ? C.on : (neg ? C.warn : C.dark), t0 = 100 + k * 130;
    var x = c.x + gap / 2, y = c.y + gap / 2, w = c.w - gap, hh = c.h - gap, g = h.at(svg, t0, { 'data-fx': 'pop', 'data-ms': 380 }), on = s.hero === q.name;
    E('rect', { x: x, y: y, width: w, height: hh, rx: 6, fill: fill, stroke: on ? C.ink : 'none', 'stroke-width': on ? 3 : 0 }, g);
    var share = 100 * q.value / tot, big = w > 230 && hh > 120, fs = big ? 24 : 17, can = w > h.textW(q.name, fs, 1) + 20 && hh > 56;
    if (can) { T(g, x + 14, y + fs + 10, q.name, { 'font-size': fs, 'font-weight': 700, fill: tc }); var l2 = h.nf(q.value, dec) + u + ' · ' + h.nf(share, 0) + '%', l3 = (s.marginTitle || '영업이익률') + ' ' + h.nf(q.margin, 1) + '%';
      if (hh > 84 && w > h.textW(l2, 14, 0) + 24) T(g, x + 14, y + fs + 33, l2, { 'font-size': 14, fill: tc });
      if (hh > 108 && w > h.textW(l3, 14, 1) + 24) T(g, x + 14, y + fs + 55, l3, { 'font-size': 14, 'font-weight': 700, fill: mc }) } });
  var gl = h.at(svg, 1500, { 'data-fx': 'fade' }), lx = 0, gid = 'cotm' + Math.round(Math.random() * 1e6), df = E('defs', null, gl), lg = E('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, df);
  E('stop', { offset: 0, 'stop-color': '#D1E8E0' }, lg); E('stop', { offset: 1, 'stop-color': '#005136' }, lg);
  T(gl, 0, 505, (s.marginTitle || '영업이익률') + ' 낮음', { 'font-size': 12.5, fill: C.mute }); E('rect', { x: 118, y: 493, width: 160, height: 12, rx: 3, fill: 'url(#' + gid + ')' }, gl); T(gl, 288, 505, '높음(' + h.nf(mxm, 0) + '%)', { 'font-size': 12.5, fill: C.mute });
  E('rect', { x: 400, y: 493, width: 12, height: 12, rx: 3, fill: C.warnsoft, stroke: C.warn }, gl); T(gl, 418, 505, '적자 사업부', { 'font-size': 12.5, fill: C.mute }); T(gl, 1168, 505, '칸 넓이 = 매출 비중', { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};
})();
