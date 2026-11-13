/* scaxis — 쟁점 축 : 위 양쪽에 두 주장 상자(왼쪽 · 오른쪽), 아래 가로 축 위에 인물을 점으로(글자 하나 = 이름 첫 글자), 점끼리 겹치면 위로 쌓음 + 중앙값 표시
   left{title,lines:[≤3]} · right{…} · people[{name,pos(0=왼쪽 주장 … 100=오른쪽 주장),group(0|1)}] · groups['A 집단','B 집단'] · ends{left,right,mid} 축 아래 글 · medianText('중앙값')
   움직임 : 주장 상자 → 축 → 점이 왼쪽부터 → 중앙값 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scaxis = function (bd, s, ctx) {
  var svg = ctx.svg(512), Lf = s.left || {}, Rt = s.right || {}, P = (s.people || []).slice(), gn = s.groups || [], en = s.ends || {}, bw = 540;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 400 });
  [[Lf, 0, C.dark], [Rt, 1168 - bw, C.cmp]].forEach(function (c) { var o = c[0], x = c[1]; E('rect', { x: x, y: 0, width: bw, height: 150, rx: 12, fill: '#fff', stroke: c[2], 'stroke-width': 2.5 }, g0); E('rect', { x: x, y: 0, width: 10, height: 150, rx: 4, fill: c[2] }, g0);
    T(g0, x + 28, 38, o.title || '', { 'font-size': S.fit(o.title || '', 21, bw - 50, 1, 15), 'font-weight': 700, fill: C.ink }); var y = 70;
    (o.lines || []).slice(0, 3).forEach(function (t) { E('circle', { cx: x + 32, cy: y - 5, r: 3, fill: c[2] }, g0); var r = S.wrapT(g0, x + 46, y, t, 15, bw - 70, { fill: C.sub }); y = r.y + 28 }) });
  T(g0, 584, 86, '↔', { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 700, fill: C.axis });
  var ax0 = 40, ax1 = 1128, X = h.lin(0, 100, ax0, ax1), ay = 384, id = S.uid('ax'), df = E('defs', null, svg), lg = E('linearGradient', { id: id, x1: 0, x2: 1, y1: 0, y2: 0 }, df);
  E('stop', { offset: '0%', 'stop-color': C.dark }, lg); E('stop', { offset: '50%', 'stop-color': C.g18 }, lg); E('stop', { offset: '100%', 'stop-color': C.cmp }, lg);
  var ga = h.at(svg, 500, { 'data-fx': 'fade', 'data-ms': 400 }); E('rect', { x: ax0, y: ay, width: ax1 - ax0, height: 12, rx: 6, fill: 'url(#' + id + ')' }, ga);
  T(ga, ax0, ay + 40, en.left || '왼쪽 주장에 가까움', { 'font-size': 14, 'font-weight': 700, fill: C.dark }); T(ga, ax1, ay + 40, en.right || '오른쪽 주장에 가까움', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.cmp }); T(ga, (ax0 + ax1) / 2, ay + 40, en.mid || '중간', { 'text-anchor': 'middle', 'font-size': 14, fill: C.mute });
  P.sort(function (a, b) { return a.pos - b.pos }); var lay = [], R = 22, pl = P.map(function (p) { var x = X(p.pos), L = 0; while (lay[L] && lay[L].some(function (q) { return Math.abs(q - x) < 2 * R + 4 })) L++; (lay[L] = lay[L] || []).push(x); return { p: p, x: x, y: ay - 28 - L * (2 * R + 6) } });
  pl.forEach(function (o, i) { var g = h.at(svg, 800 + i * 120, { 'data-fx': 'pop', 'data-ms': 340 }), col = (o.p.group || 0) ? C.cmp : C.main;
    E('circle', { cx: o.x, cy: o.y, r: R, fill: col, stroke: '#fff', 'stroke-width': 2 }, g); T(g, o.x, o.y + 6, o.p.name.slice(-1), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#fff' });
    E('line', { x1: o.x, x2: o.x, y1: o.y + R, y2: ay, stroke: col, 'stroke-width': 1.2, 'stroke-opacity': .5 }, g) });
  var ps = P.map(function (p) { return p.pos }).sort(function (a, b) { return a - b }), md = ps.length % 2 ? ps[(ps.length - 1) / 2] : (ps[ps.length / 2 - 1] + ps[ps.length / 2]) / 2, gm = h.at(svg, 800 + pl.length * 120 + 200, { 'data-fx': 'fade', 'data-ms': 420 });
  E('line', { x1: X(md), x2: X(md), y1: 190, y2: ay + 14, stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gm);
  var mt = (s.medianText || '중앙값') + ' ' + h.nf(md, 0), mw = h.textW(mt, 14, 1) + 24; E('rect', { x: X(md) - mw / 2, y: 164, width: mw, height: 26, rx: 13, fill: C.ink }, gm); T(gm, X(md), 182, mt, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' });
  if (gn.length) { var lx = ax0; gn.forEach(function (t, i) { E('circle', { cx: lx + 8, cy: 486, r: 8, fill: i ? C.cmp : C.main }, ga); T(ga, lx + 22, 491, t, { 'font-size': 13.5, fill: C.sub }); lx += 22 + h.textW(t, 13.5) + 28 }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
