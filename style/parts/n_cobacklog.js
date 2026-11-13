/* cobacklog — 수주 잔고 쌓기 : 기업마다 칸 하나, 해마다 막대(같은 눈금)가 올라가며 쌓이고 마지막 해만 진하게 + 칸 아래 칩 둘(연평균 증가 · 매출 대비 배수)
   panels[{name,hero,vals[해마다],chips[{label,value(글),tone('warn')}]}] 2~4칸 · years[라벨…] · unit · dec · latestLabel('올해 잔고') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.cobacklog = function (bd, s, ctx) {
  var P = (s.panels || []).slice(0, 4), n = P.length; if (!n) return; var svg = ctx.svg(512), Y = s.years || [], m = Y.length, dec = s.dec || 0, gap = 24, W = (1168 - gap * (n - 1)) / n, mx = 0;
  P.forEach(function (p) { p.vals.forEach(function (v) { mx = Math.max(mx, v) }) }); var nt = h.niceTicks(0, mx, 4), top = 150, bot = 372, Yv = h.lin(0, nt.hi, bot, top);
  P.forEach(function (p, i) { var x = i * (W + gap), on = !!p.hero, t0 = i * 200, g = h.at(svg, t0, { 'data-fx': 'fade' }), last = p.vals[m - 1];
    E('rect', { x: x + .5, y: .5, width: W - 1, height: 511, rx: 10, fill: '#fff', stroke: on ? C.dark : C.line, 'stroke-width': on ? 2.4 : 1.2 }, g);
    T(g, x + 18, 34, p.name, { 'font-size': 20, 'font-weight': 700, fill: on ? C.dark : C.ink }); T(g, x + 18, 58, s.latestLabel || '올해 잔고', { 'font-size': 13, fill: C.mute });
    T(g, x + 18, 100, h.nf(last, dec), { 'font-size': 36, 'font-weight': 700, fill: on ? C.dark : C.ink }); T(g, x + 18 + h.textW(h.nf(last, dec), 36, 1) + 6, 100, s.unit || '', { 'font-size': 15, fill: C.mute });
    nt.ticks = nt.ticks || []; for (var v = 0; v <= nt.hi + 1e-9; v += nt.step) E('line', { x1: x + 18, x2: x + W - 18, y1: Yv(v), y2: Yv(v), stroke: v === 0 ? C.axis : C.grid, 'stroke-dasharray': v === 0 ? null : '3 4' }, g);
    var bw = (W - 36) / m, g2;
    p.vals.forEach(function (v, k) { var bx = x + 18 + k * bw + bw * .18, w = bw * .64, isL = k === m - 1, y = Yv(v); g2 = h.at(svg, t0 + 200 + k * 90, { 'data-fx': 'fade' });
      E('rect', { x: bx, y: y, width: w, height: bot - y, rx: 2, fill: isL ? (on ? C.dark : C.cmp) : (on ? C.g65 : C.g40), 'data-at': t0 + 200 + k * 90, 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 420 }, svg);
      T(g2, bx + w / 2, y - 7, h.nf(v, dec), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': isL ? 700 : 400, fill: isL ? C.ink : C.mute }); T(g2, bx + w / 2, bot + 20, Y[k], { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
    var g3 = h.at(svg, t0 + 800, { 'data-fx': 'rise' }); (p.chips || []).slice(0, 2).forEach(function (q, k) { var y = 410 + k * 48; E('rect', { x: x + 14, y: y, width: W - 28, height: 40, rx: 8, fill: q.tone === 'warn' ? C.warnsoft : (on ? C.g18 : C.paper) }, g3);
      T(g3, x + 28, y + 26, q.label, { 'font-size': 14.5, fill: C.sub }); T(g3, x + W - 28, y + 27, q.value, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: q.tone === 'warn' ? C.warn : C.dark }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
