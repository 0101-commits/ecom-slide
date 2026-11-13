/* st3q — 무엇 · 왜 · 어떻게 3칸 : 폭이 다른 세 칸(좁게 · 넓게 · 좁게)이 화살로 이어지고 칸마다 다른 그림 — 무엇 = 큰 숫자, 왜 = 작은 선 차트, 어떻게 = 번호 단계
   panels[3]{q('무엇'|'왜'|'어떻게'), title, text, type:'num|line|steps', num{value,dec,unit,label}, line{data[],labels[],unit,dec,hiAt,lastText,hiText}, steps[{t,s}]} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.st3q = function (bd, s, ctx) {
  var pn = (s.panels || []).slice(0, 3); if (pn.length < 3) return; var svg = ctx.svg(512), WS = [340, 460, 340], gap = 14, xs = [0, WS[0] + gap, WS[0] + WS[1] + 2 * gap];
  pn.forEach(function (p, i) { var x = xs[i], w = WS[i], g = h.at(svg, i * 1100, { 'data-fx': 'rise', 'data-ms': 440 }), gb = h.at(svg, i * 1100 + 500, { 'data-fx': 'fade', 'data-ms': 500 });
    u.box(g, x, 0, w, 512, C.paper); u.box(g, x, 0, w, 74, i === 1 ? C.main : C.dark); T(g, x + 24, 52, p.q || '', { 'font-size': 32, 'font-weight': 700, fill: '#fff' });
    T(g, x + w - 22, 46, p.title || '', { 'text-anchor': 'end', 'font-size': u.fit(p.title || '', 17, w - 130, 1, 13), 'font-weight': 700, fill: C.g18 });
    u.lines(g, x + 24, 112, p.text || '', 16, w - 48, { fill: C.cmp, lh: 1.42 });
    if (p.type === 'num' && p.num) { var v = h.nf(p.num.value, p.num.dec || 0), vs = 66; while (vs > 36 && h.textW(v, vs, 1) + h.textW(p.num.unit || '', 20, 1) + 8 > w - 48) vs -= 2;
      T(gb, x + 24, 292, v, { 'font-size': vs, 'font-weight': 700, fill: C.dark }); T(gb, x + 24 + h.textW(v, vs, 1) + 8, 292, p.num.unit || '', { 'font-size': 20, 'font-weight': 700, fill: C.mute });
      E('line', { x1: x + 24, x2: x + w - 24, y1: 316, y2: 316, stroke: C.line }, gb); u.lines(gb, x + 24, 344, p.num.label || '', 14.5, w - 48, { fill: C.mute, lh: 1.4 });
      (p.num.rows || []).slice(0, 3).forEach(function (r, k) { var y = 384 + k * 38; u.box(gb, x + 18, y - 24, w - 36, 32, '#fff', { rx: 8 }); T(gb, x + 32, y - 2, r.k, { 'font-size': 13.5, 'font-weight': 600, fill: C.mute }); T(gb, x + w - 32, y - 2, r.v, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: r.warn ? C.warn : C.dark }) }) }
    if (p.type === 'line' && p.line) { var L = p.line, d = L.data, n = d.length, lo = Math.min.apply(null, d), hi = Math.max.apply(null, d), px0 = x + 30, px1 = x + w - 30, py0 = 250, py1 = 440, pad = (hi - lo) * .12;
      var X = function (k) { return px0 + (px1 - px0) * k / (n - 1) }, Y = h.lin(lo - pad, hi + pad, py1, py0), pts = d.map(function (v, k) { return [X(k), Y(v)] });
      E('path', { d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1) }).join(' L') + ' L' + px1 + ' ' + py1 + ' L' + px0 + ' ' + py1 + ' Z', fill: C.g08 }, gb);
      var gl = h.at(svg, i * 1100 + 700, { 'data-fx': 'draw', 'data-ms': 900 }); E('path', { d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1) }).join(' L'), fill: 'none', stroke: C.main, 'stroke-width': 2.6 }, gl);
      var gm = h.at(svg, i * 1100 + 1500, { 'data-fx': 'pop', 'data-ms': 400 }), hk = L.hiAt;
      E('circle', { cx: pts[hk][0], cy: pts[hk][1], r: 5.5, fill: C.dark }, gm); T(gm, pts[hk][0] + 10, pts[hk][1] - 8, L.hiText || '', { 'font-size': 13.5, 'font-weight': 700, fill: C.dark });
      E('circle', { cx: pts[n - 1][0], cy: pts[n - 1][1], r: 5.5, fill: C.warn }, gm); T(gm, pts[n - 1][0], pts[n - 1][1] - 12, L.lastText || '', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.warn });
      T(gb, px0, py1 + 22, L.labels[0], { 'font-size': 12.5, fill: C.mute }); T(gb, px1, py1 + 22, L.labels[1], { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }); if (L.unit) T(gb, px0, py0 - 22, L.unit, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }) }
    if (p.type === 'steps' && p.steps) { var sy = 232, sh = 84; p.steps.slice(0, 3).forEach(function (q, k) { var y = sy + k * (sh + 10), gs = h.at(svg, i * 1100 + 600 + k * 320, { 'data-fx': 'rise', 'data-ms': 380 });
        u.box(gs, x + 18, y, w - 36, sh, '#fff', { rx: 10 }); E('circle', { cx: x + 52, cy: y + sh / 2, r: 18, fill: C.main }, gs); T(gs, x + 52, y + sh / 2 + 6, String(k + 1), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#fff' });
        T(gs, x + 82, y + 34, q.t || '', { 'font-size': u.fit(q.t || '', 15.5, w - 120, 1, 12.5), 'font-weight': 700, fill: C.ink }); if (q.s) T(gs, x + 82, y + 58, q.s, { 'font-size': u.fit(q.s, 13, w - 120, 0, 11.5), 'font-weight': 500, fill: C.mute }) }) }
    if (i < 2) { var ga = h.at(svg, i * 1100 + 800, { 'data-fx': 'pop', 'data-ms': 320 }); E('circle', { cx: x + w + gap / 2, cy: 37, r: 15, fill: '#fff', stroke: C.dark, 'stroke-width': 2 }, ga); E('path', { d: 'M' + (x + w + gap / 2 - 4) + ' 30 L' + (x + w + gap / 2 + 4) + ' 37 L' + (x + w + gap / 2 - 4) + ' 44', fill: 'none', stroke: C.dark, 'stroke-width': 2.2 }, ga) } });
};
})();
