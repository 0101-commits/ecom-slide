/* sankey — 산키 흐름도 : 왼쪽 들어오는 것 → (가운데 기둥) → 오른쪽 쓰임, 띠 굵기 = 값
   left{items:[{name,value,tone}]} · right{items:[…]} · mid{label,sub}(없으면 왼쪽 → 오른쪽 바로 이어짐) · unit('조 달러') · dec
   flows[{from,to,value}](기둥이 없을 때만 — 없으면 양쪽 크기대로 나눔) · note{title,lines:[…],tone:'warn'}(오른쪽 위 작은 메모 상자, 선택)
   tone : 'warn'(나쁜 뜻) 또는 색 이름(main g65 g40 g18 gray) — 없으면 차례대로 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.sankey = function (bd, s, ctx) {
  var li = (s.left && s.left.items) || [], ri = (s.right && s.right.items) || [], mid = s.mid || null, note = s.note || null;
  if (!li.length || !ri.length) return;
  var dec = s.dec != null ? s.dec : 1, unit = s.unit || '', svg = ctx.svg(512), F = function (v) { return h.nf(v, dec) + unit };
  var PL = ['main', 'g65', 'g40', 'g18', 'gray'], PR = ['g65', 'g40', 'g18', 'gray', 'light'];
  function paint(items, P) { items.forEach(function (it, i) { var t = it.tone || it.color; it._w = t === 'warn'; it._c = t === 'warn' ? C.warn : h.col(t || P[i % P.length]) }) }
  paint(li, PL); paint(ri, PR);
  var sum = function (a) { return a.reduce(function (x, it) { return x + (+it.value || 0) }, 0) }, sL = sum(li), sR = sum(ri);
  var NW = 22, MW = 35, H = 412, top = 48, gap = 9;
  function heights(items, sm) { var av = H - gap * (items.length - 1); return items.map(function (it) { return Math.max(3, av * (+it.value || 0) / sm) }) }
  var hL = heights(li, sL), hR = heights(ri, sR);
  function lblW(items, hs) { return Math.min(250, Math.max.apply(null, items.map(function (it, i) { var nm = it.name || ''; return hs[i] < 44 ? h.textW(nm + '  ' + F(it.value), 14, 1) : Math.max(h.textW(nm, 15, 1), h.textW(F(it.value), 13, 1)) }))) }
  var LW = lblW(li, hL), RW = lblW(ri, hR), nW = note ? 168 : 0;
  var lx0 = LW + 14, rx0 = 1168 - nW - RW - 14 - NW, lEdge = lx0 + NW;
  function stack(hs) { var y = top, o = []; hs.forEach(function (q) { o.push(y); y += q + gap }); return o }
  var yL = stack(hL), yR = stack(hR);
  function rib(x0, a0, a1, x1, b0, b1, col, at) { var xm = (x0 + x1) / 2;
    E('path', { d: 'M' + x0 + ' ' + a0 + ' C' + xm + ' ' + a0 + ' ' + xm + ' ' + b0 + ' ' + x1 + ' ' + b0 + ' L' + x1 + ' ' + b1 + ' C' + xm + ' ' + b1 + ' ' + xm + ' ' + a1 + ' ' + x0 + ' ' + a1 + ' Z', fill: col, 'fill-opacity': .38, 'data-at': at, 'data-fx': 'fade', 'data-ms': 520 }, svg) }
  function node(it, x, y, hh, side, at) {
    E('rect', { x: x, y: y, width: NW, height: hh, rx: 3, fill: it._c, 'data-at': at, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 380 }, svg);
    var g = h.at(svg, at + 140, { 'data-fx': 'fade' }), end = side === 'l', tx = end ? x - 12 : x + NW + 12, an = end ? 'end' : 'start', cy = y + hh / 2, vc = it._w ? C.warn : C.main;
    if (hh < 44) { var t = E('text', { x: tx, y: cy + 5, 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: C.ink }, g); E('tspan', {}, t).textContent = it.name || ''; var v = E('tspan', { dx: 10, fill: vc }, t); v.textContent = F(it.value) }
    else { T(g, tx, cy - 2, it.name || '', { 'text-anchor': an, 'font-size': 15, 'font-weight': 700, fill: C.ink }); T(g, tx, cy + 17, F(it.value), { 'text-anchor': an, 'font-size': 13, 'font-weight': 700, fill: vc }) } }
  var t0 = 0;
  li.forEach(function (it, i) { node(it, lx0, yL[i], hL[i], 'l', t0 + i * 60) });
  var tR = mid ? 700 : 500, bR = tR;
  if (mid) {
    var Hm = H * .86, my0 = top + (H - Hm) / 2, mx = lEdge + (rx0 - lEdge - MW) / 2, ac = my0;
    li.forEach(function (it, i) { var q = Hm * (+it.value || 0) / sL; rib(lEdge, yL[i], yL[i] + hL[i], mx, ac, ac + q, it._c, 260 + i * 80); ac += q });
    E('rect', { x: mx, y: my0, width: MW, height: Hm, rx: 4, fill: C.dark, 'data-at': 560, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 420 }, svg);
    var gm = h.at(svg, 700, { 'data-fx': 'fade' }); T(gm, mx + MW / 2, top - (mid.sub ? 2 : 6), mid.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink });
    if (mid.sub) T(gm, mx + MW / 2, top + 16, mid.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    ac = my0; ri.forEach(function (it, i) { var q = Hm * (+it.value || 0) / sR; rib(mx + MW, ac, ac + q, rx0, yR[i], yR[i] + hR[i], it._c, 800 + i * 80); ac += q });
    tR = 1000; bR = 1000;
  } else {
    var f = [], ml = (s.flows || []);
    li.forEach(function (a, i) { f[i] = []; ri.forEach(function (b, j) { f[i][j] = (a.value / sL) * (b.value / sR) }) });
    if (ml.length) { li.forEach(function (a, i) { ri.forEach(function (b, j) { f[i][j] = 0 }) }); var st = ml.reduce(function (x, q) { return x + (+q.value || 0) }, 0) || 1; ml.forEach(function (q) { if (f[q.from]) f[q.from][q.to] = (+q.value || 0) / st }) }
    var outL = li.map(function (a, i) { return f[i].reduce(function (x, y) { return x + y }, 0) || 1 }), inR = ri.map(function (b, j) { return li.reduce(function (x, a, i) { return x + f[i][j] }, 0) || 1 });
    var offL = li.map(function (a, i) { return yL[i] }), offR = ri.map(function (b, j) { return yR[j] });
    li.forEach(function (a, i) { ri.forEach(function (b, j) { var q = f[i][j]; if (!q) return; var ta = hL[i] * q / outL[i], tb = hR[j] * q / inR[j];
      rib(lEdge, offL[i], offL[i] + ta, rx0, offR[j], offR[j] + tb, b._w ? C.warn : a._c, 300 + (i + j) * 70); offL[i] += ta; offR[j] += tb }) });
  }
  ri.forEach(function (it, i) { node(it, rx0, yR[i], hR[i], 'r', tR + i * 60) });
  if (note) { var nx = 1168 - 164, lines = [], tw = 164 - 28; (note.lines || []).forEach(function (l) { h.wrap(l, 13, tw).forEach(function (q) { lines.push(q) }) });
    var nh = 22 + (note.title ? 26 : 0) + lines.length * 21 + 8, g = h.at(svg, bR + 600, { 'data-fx': 'fade' }), ty = top + 24;
    E('rect', { x: nx, y: top, width: 164, height: nh, rx: 10, fill: C.paper }, g);
    if (note.title) { T(g, nx + 14, ty, note.title, { 'font-size': 13, 'font-weight': 700, fill: note.tone === 'warn' ? C.warn : C.dark }); ty += 24 }
    lines.forEach(function (l, i) { T(g, nx + 14, ty + i * 21, l, { 'font-size': 13, fill: C.cmp }) }) }
};
})();
