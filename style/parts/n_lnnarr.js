/* ln 서사 부품 3종(머리글자 ln) : lncards 사례 카드 연표 · lnpair 짝 도식(지금 ↔ 옛 사건) · lnring 순환 원 위 지금 위치
   lncards : axis{from,to,step}(연 소수) · cards[{start,end,title,big{value,unit},label,rows[{k,v}],hi}] 3~6장 · 위 연표 막대 위치 = 기간, 카드와 점선 연결
   lnpair  : heads[왼쪽 이름,오른쪽 이름] · pairs[{link,now{title,value,sub},old{title,value,sub}}] 2~4쌍 · 가운데 칩 = 닮은 점
   lnring  : arcs[{name,value,sub,tone:'good'|'bad'}] 둘(앞 = 확장 · 뒤 = 침체) · now{at(0~1, 첫 호 안 위치),label,sub} · center{title,sub} · side{title,unit,dec,bars[{label,value,hi}]} 오른쪽 막대 목록 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function chip(g, x, y, t, c, fs) { fs = fs || 13; var w = h.textW(t, fs, true) + 20; E('rect', { x: x - w / 2, y: y - 12, width: w, height: 24, rx: 12, fill: c }, g); T(g, x, y + 4.5, t, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: '#fff' }) }
ECOM.parts.lncards = function (bd, s, ctx) {
  var svg = ctx.svg(512), W = 1168, ax = s.axis || {}, cards = (s.cards || []).slice(0, 6), n = cards.length; if (!n) return;
  var fr = ax.from, to = ax.to, step = ax.step || 10, xa = 30, xb = W - 30, X = h.lin(fr, to, xa, xb), ty = 66;
  var g0 = h.lv(svg, 1, { 'data-fx': 'fade' }); E('line', { x1: xa, x2: xb, y1: ty + 20, y2: ty + 20, stroke: C.axis, 'stroke-width': 1.4 }, g0);
  for (var yv = Math.ceil(fr / step) * step; yv <= to; yv += step) { E('line', { x1: X(yv), x2: X(yv), y1: ty + 14, y2: ty + 26, stroke: C.axis }, g0); T(g0, X(yv), ty + 46, String(yv), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }
  T(g0, xa, 24, s.axisTitle || '', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  var gap = 14, cw = (W - gap * (n - 1)) / n, cy0 = 196, ch = 276;
  cards.forEach(function (c, k) { var g = h.at(svg, 300 + k * 330, { 'data-fx': 'rise' }), hi = !!c.hi, bx = k * (cw + gap), sx = X(c.start), ex = Math.max(X(c.end), sx + 5), mid = (sx + ex) / 2, col = hi ? C.warn : C.dark;
    E('rect', { x: sx, y: ty + 8, width: ex - sx, height: 24, rx: 3, fill: hi ? C.warn : C.g65 }, g);
    E('path', { d: 'M' + mid + ' ' + (ty + 32) + ' L' + mid + ' ' + (ty + 70) + ' L' + (bx + cw / 2) + ' ' + (cy0 - 34) + ' L' + (bx + cw / 2) + ' ' + cy0, fill: 'none', stroke: C.axis, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, g);
    E('rect', { x: bx, y: cy0, width: cw, height: ch, rx: 10, fill: hi ? '#FBEFEA' : '#fff', stroke: hi ? C.warn : C.axis, 'stroke-width': hi ? 2 : 1.4 }, g);
    E('rect', { x: bx, y: cy0, width: cw, height: 44, rx: 10, fill: hi ? C.warn : C.dark }, g); E('rect', { x: bx, y: cy0 + 30, width: cw, height: 14, fill: hi ? C.warn : C.dark }, g);
    T(g, bx + cw / 2, cy0 + 29, c.title || '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#fff' });
    var bv = c.big || {}, bt = String(bv.value) , bw = h.textW(bt, 46, true);
    T(g, bx + cw / 2 - (bv.unit ? h.textW(bv.unit, 18, true) / 2 : 0), cy0 + 100, bt, { 'text-anchor': 'middle', 'font-size': 46, 'font-weight': 700, fill: col });
    if (bv.unit) T(g, bx + cw / 2 + bw / 2 - h.textW(bv.unit, 18, true) / 2 + 6, cy0 + 100, bv.unit, { 'text-anchor': 'start', 'font-size': 18, 'font-weight': 700, fill: col });
    T(g, bx + cw / 2, cy0 + 124, c.label || '', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 600, fill: C.mute });
    E('line', { x1: bx + 14, x2: bx + cw - 14, y1: cy0 + 140, y2: cy0 + 140, stroke: C.line }, g);
    (c.rows || []).slice(0, 4).forEach(function (r, j) { var yy = cy0 + 168 + j * 40; T(g, bx + 16, yy - 6, r.k || '', { 'font-size': 12.5, 'font-weight': 600, fill: C.mute }); T(g, bx + 16, yy + 13, r.v || '', { 'font-size': 15.5, 'font-weight': 700, fill: C.ink }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
ECOM.parts.lnpair = function (bd, s, ctx) {
  var svg = ctx.svg(512), W = 1168, hd = s.heads || ['지금', '옛 사건'], pairs = (s.pairs || []).slice(0, 4), n = pairs.length; if (!n) return;
  var cw = 470, top = 54, rh = Math.floor((512 - top - 10) / n), ph = rh - 18, lx = 0, rx = W - cw;
  var g0 = h.lv(svg, 1, { 'data-fx': 'fade' });
  T(g0, lx + cw / 2, 30, hd[0], { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: C.dark }); T(g0, rx + cw / 2, 30, hd[1], { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: C.cmp });
  E('line', { x1: lx, x2: lx + cw, y1: 40, y2: 40, stroke: C.dark, 'stroke-width': 3 }, g0); E('line', { x1: rx, x2: rx + cw, y1: 40, y2: 40, stroke: C.gray, 'stroke-width': 3 }, g0);
  pairs.forEach(function (p, k) { var g = h.at(svg, 300 + k * 600, { 'data-fx': 'rise' }), y = top + k * rh, cy = y + ph / 2;
    function card(x, d, now) { E('rect', { x: x, y: y, width: cw, height: ph, rx: 10, fill: now ? C.g08 : '#fff', stroke: now ? C.g40 : C.axis, 'stroke-width': 1.6 }, g);
      T(g, x + 22, y + 32, d.title || '', { 'font-size': 16.5, 'font-weight': 700, fill: now ? C.dark : C.cmp });
      T(g, x + 22, y + ph - 20 - (d.sub2 ? 20 : 0), d.value || '', { 'font-size': Math.min(44, ph / 2.5), 'font-weight': 700, fill: now ? C.dark : C.cmp });
      var vw = h.textW(d.value || '', Math.min(44, ph / 2.5), true); h.wrap(d.sub || '', 14, cw - vw - 66, true).slice(0, 3).forEach(function (t, j) { T(g, x + 22 + vw + 16, y + ph - 40 + j * 18 - (d.sub ? Math.min(2, h.wrap(d.sub || '', 14, cw - vw - 66, true).length - 1) * 9 : 0), t, { 'font-size': 14, 'font-weight': 600, fill: C.mute }) }) }
    card(lx, p.now || {}, true); card(rx, p.old || {}, false);
    var mx = W / 2, x1 = lx + cw + 6, x2 = rx - 6; E('line', { x1: x1, x2: x2, y1: cy, y2: cy, stroke: C.dark, 'stroke-width': 2.4, 'stroke-dasharray': '6 4' }, g);
    E('path', { d: 'M' + (x1 + 12) + ' ' + (cy - 7) + ' L' + x1 + ' ' + cy + ' L' + (x1 + 12) + ' ' + (cy + 7) + ' Z', fill: C.dark }, g); E('path', { d: 'M' + (x2 - 12) + ' ' + (cy - 7) + ' L' + x2 + ' ' + cy + ' L' + (x2 - 12) + ' ' + (cy + 7) + ' Z', fill: C.dark }, g);
    var lt = String(p.link || '').split('\n'), cwid = Math.max.apply(null, lt.map(function (t) { return h.textW(t, 14, true) })) + 26, chh = 14 + lt.length * 18;
    E('rect', { x: mx - cwid / 2, y: cy - chh / 2, width: cwid, height: chh, rx: 10, fill: C.dark }, g); lt.forEach(function (t, j) { T(g, mx, cy - chh / 2 + 22 + j * 18 - 4, t, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
ECOM.parts.lnring = function (bd, s, ctx) {
  var svg = ctx.svg(512), W = 1168, arcs = s.arcs || [], now = s.now || {}, cn = s.center || {}, sd = s.side, cx = 270, cy = 270, R = 196, tk = 54, tot = arcs.reduce(function (a, q) { return a + q.value }, 0), a0 = -Math.PI / 2;
  var P = function (a, r) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)] };
  function arc(aS, aE, r1, r2, fill, at) { var p1 = P(aS, r2), p2 = P(aE, r2), p3 = P(aE, r1), p4 = P(aS, r1), lg = aE - aS > Math.PI ? 1 : 0;
    return E('path', { d: 'M' + p1[0] + ' ' + p1[1] + ' A' + r2 + ' ' + r2 + ' 0 ' + lg + ' 1 ' + p2[0] + ' ' + p2[1] + ' L' + p3[0] + ' ' + p3[1] + ' A' + r1 + ' ' + r1 + ' 0 ' + lg + ' 0 ' + p4[0] + ' ' + p4[1] + ' Z', fill: fill, 'data-at': at, 'data-fx': 'fade', 'data-ms': 600 }, svg) }
  var acc = a0, info = [];
  arcs.forEach(function (q, k) { var span = q.value / tot * Math.PI * 2, bad = q.tone === 'bad'; arc(acc, acc + span - .012, R - tk, R, bad ? C.warn : C.g40, 200 + k * 400); info.push([acc, acc + span]);
    var am = acc + span / 2, lp = P(am, R + 24), g = h.at(svg, 900 + k * 300, { 'data-fx': 'fade' });
    var anc = Math.cos(am) > .3 ? 'start' : Math.cos(am) < -.3 ? 'end' : 'middle'; T(g, lp[0], lp[1] + 5, q.name || '', { 'text-anchor': anc, 'font-size': 15, 'font-weight': 700, fill: bad ? C.warn : C.dark });
    if (q.sub) T(g, lp[0], lp[1] + 22, q.sub, { 'text-anchor': anc, 'font-size': 13, 'font-weight': 600, fill: C.mute }); acc += span });
  var gc = h.at(svg, 700, { 'data-fx': 'fade' }); T(gc, cx, cy - 60, cn.title || '', { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: C.ink }); if (cn.sub) T(gc, cx, cy - 32, cn.sub, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 600, fill: C.mute });
  /* 지금 위치 : 첫 호 안 now.at */
  var fa = info[0][0] + (info[0][1] - info[0][0]) * Math.max(0, Math.min(1, now.at || 0)), pd = P(fa, R - tk / 2), gn = h.at(svg, 1500, { 'data-fx': 'fade' });
  arc(info[0][0], fa, R - tk, R - tk + 12, C.dark, 1300);
  E('circle', { cx: pd[0], cy: pd[1], r: 14, fill: '#fff', stroke: C.dark, 'stroke-width': 5, 'data-at': 1500, 'data-fx': 'pop' }, svg); E('circle', { cx: pd[0], cy: pd[1], r: 5, fill: C.dark }, svg);
  var lw = h.textW(now.label || '', 16, true) + 26, lxx = cx, lyy = cy + 58;
  E('rect', { x: lxx - lw / 2, y: lyy - 17, width: lw, height: 34, rx: 17, fill: C.dark }, gn); T(gn, lxx, lyy + 5.5, now.label || '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#fff' });
  if (now.sub) T(gn, lxx, lyy + 40, now.sub, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.cmp });
  if (sd) { var bx = 590, bw = W - bx - 130, bars = (sd.bars || []), mx = Math.max.apply(null, bars.map(function (b) { return b.value })), rhh = Math.min(30, 410 / Math.max(1, bars.length)), g = h.at(svg, 1000, { 'data-fx': 'fade' });
    T(g, bx, 40, sd.title || '', { 'font-size': 17, 'font-weight': 700, fill: C.ink }); E('line', { x1: bx, x2: W, y1: 52, y2: 52, stroke: C.line }, g);
    bars.forEach(function (b, j) { var y = 74 + j * rhh, w = b.value / mx * bw; T(g, bx + 58, y + rhh * .62, b.label, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': b.hi ? 700 : 500, fill: b.hi ? C.dark : C.mute });
      E('rect', { x: bx + 68, y: y + 3, width: w, height: rhh - 8, rx: 2, fill: b.hi ? C.dark : b.bad ? '#E5B3A4' : C.g40, 'data-at': 1100 + j * 70, 'data-fx': 'growx', 'data-o': bx + 68 }, svg);
      T(svg, bx + 68 + w + 8, y + rhh * .62, h.nf(b.value, sd.dec || 0) + (sd.unit || ''), { 'font-size': 13.5, 'font-weight': 700, fill: b.hi ? C.dark : C.cmp, 'data-at': 1100 + j * 70, 'data-fx': 'fade' }) }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
