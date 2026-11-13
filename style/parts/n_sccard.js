/* sccard — 나라 카드 격자 : 나라마다 카드(핵심 숫자 셋 + 작은 선), 강조 나라(hi)는 머리 띠 짙게 · 굵은 테두리
   cards[2~4]{name,sub,hi,metrics:[{k,v,dec,unit,delta:{text,dir:'up'|'down'}}≤3],spark:{data,title,lo,hi,dec,unit,first,last}}
   움직임 : 카드가 하나씩 → 숫자 → 작은 선 그리기 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.sccard = function (bd, s, ctx) {
  var cs = (s.cards || []).slice(0, 4), n = cs.length; if (!n) return; var svg = ctx.svg(512), two = n > 2, gap = 20, cw = two ? (1168 - gap) / 2 : (1168 - gap * (n - 1)) / n, chh = two ? (512 - gap) / 2 : 512;
  cs.forEach(function (c, i) { var col = two ? i % 2 : i, row = two ? Math.floor(i / 2) : 0, x = col * (cw + gap), y = row * (chh + gap), g = h.at(svg, 200 + i * 380, { 'data-fx': 'fade', 'data-ms': 380 });
    E('rect', { x: x, y: y, width: cw, height: chh, rx: 12, fill: '#fff', stroke: c.hi ? C.dark : C.line, 'stroke-width': c.hi ? 3 : 1.4 }, g);
    E('path', { d: 'M' + x + ' ' + (y + 12) + ' a12 12 0 0 1 12 -12 h' + (cw - 24) + ' a12 12 0 0 1 12 12 v34 h-' + cw + ' z', fill: c.hi ? C.dark : C.paper }, g);
    T(g, x + 20, y + 31, c.name, { 'font-size': 20, 'font-weight': 700, fill: c.hi ? '#fff' : C.ink }); if (c.sub) T(g, x + cw - 20, y + 31, c.sub, { 'text-anchor': 'end', 'font-size': 13, fill: c.hi ? C.g18 : C.mute });
    var m = (c.metrics || []).slice(0, 3), mw = (cw - 40) / Math.max(m.length, 1);
    m.forEach(function (q, k) { var mx = x + 20 + k * mw, vt = h.nf(q.v, q.dec != null ? q.dec : 1, { sign: q.sign });
      T(g, mx, y + 92, vt, { 'font-size': S.fit(vt + (q.unit || ''), 34, mw - 12, 1, 22), 'font-weight': 700, fill: c.hi ? C.dark : C.ink }); T(g, mx + h.textW(vt, S.fit(vt + (q.unit || ''), 34, mw - 12, 1, 22), 1) + 3, y + 92, q.unit || '', { 'font-size': 15, 'font-weight': 700, fill: C.mute });
      T(g, mx, y + 114, q.k, { 'font-size': 13, fill: C.mute });
      if (q.delta) { var up = q.delta.dir === 'up'; T(g, mx, y + 136, (up ? '▲ ' : '▼ ') + q.delta.text, { 'font-size': 13, 'font-weight': 700, fill: up ? C.dark : C.cmp }) } });
    var sp = c.spark; if (sp && sp.data) { var sx0 = x + 22, sx1 = x + cw - 90, sy0 = y + 156, sy1 = y + chh - 22, lo = sp.lo != null ? sp.lo : Math.min.apply(null, sp.data), hi = sp.hi != null ? sp.hi : Math.max.apply(null, sp.data), X = h.lin(0, sp.data.length - 1, sx0, sx1), Y = h.lin(lo, hi, sy1, sy0), dec = sp.dec != null ? sp.dec : 1;
      T(g, sx0, sy0 - 4, sp.title || '', { 'font-size': 12.5, fill: C.mute });
      E('line', { x1: sx0, x2: sx1, y1: sy1, y2: sy1, stroke: C.grid }, g);
      E('path', { d: h.lineD(sp.data, X, Y), fill: 'none', stroke: c.hi ? C.dark : C.g65, 'stroke-width': c.hi ? 3.2 : 2.4, 'stroke-linejoin': 'round', 'data-at': 500 + i * 380, 'data-fx': 'draw', 'data-ms': 900 }, svg);
      var lx = sx1, ly = Y(sp.data[sp.data.length - 1]); E('circle', { cx: lx, cy: ly, r: 5, fill: c.hi ? C.dark : C.g65, 'data-at': 1400 + i * 380, 'data-fx': 'pop' }, svg);
      var g2 = h.at(svg, 1400 + i * 380, { 'data-fx': 'fade' }); T(g2, lx + 10, ly + 5, h.nf(sp.data[sp.data.length - 1], dec) + (sp.unit || ''), { 'font-size': 14, 'font-weight': 700, fill: C.ink });
      T(g2, sx0, sy1 + 16, sp.first || '', { 'font-size': 11.5, fill: C.mute }); T(g2, sx1, sy1 + 16, sp.last || '', { 'text-anchor': 'end', 'font-size': 11.5, fill: C.mute }) } });
  ctx.root.setAttribute('data-gap', 300);
};
})();
