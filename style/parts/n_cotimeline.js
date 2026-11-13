/* cotimeline — 기업 연표 + 주가 : 위 한 줄에 사건 깃발(합병 · 상장 · 분할) → 점선이 아래 주가 선의 그 시점으로 내려옴. 주가는 기준 시점 100 으로 맞춘 선 둘(기업 · 비교 지수) + 끝값 꼬리표
   labels['YYYY-MM',…] · series[{name,data,color('main'|'cmp'),end}] 둘(첫째 = 기업, 깃발 점선이 닿는 선) · events[{at('YYYY-MM'),text,sub}] 3~6개(간격 ≥ 150px 가 되게) · base('기준 100') · unit */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.cotimeline = function (bd, s, ctx) {
  var Lb = s.labels || [], m = Lb.length, S = (s.series || []).slice(0, 3), ev = (s.events || []).slice(0, 6); if (m < 2 || !S.length) return; var svg = ctx.svg(512), L = 52, Rr = 1070, top = 128, bot = 462, X = h.lin(0, m - 1, L, Rr);
  var all = []; S.forEach(function (q) { q.data.forEach(function (v) { all.push(v) }) }); var nt = h.niceTicks(0, Math.max.apply(null, all), 5), Y = h.lin(nt.lo, nt.hi, bot, top), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = nt.lo; v <= nt.hi + 1e-9; v += nt.step) { E('line', { x1: L, x2: Rr, y1: Y(v), y2: Y(v), stroke: v === nt.lo ? C.axis : C.grid, 'stroke-dasharray': v === nt.lo ? null : '3 4' }, g0); T(g0, L - 8, Y(v) + 4.5, h.nf(v, 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  Lb.forEach(function (l, i) { if (/-01$/.test(l) && i % 12 === 0) { E('line', { x1: X(i), x2: X(i), y1: bot, y2: bot + 5, stroke: C.axis }, g0); T(g0, X(i), bot + 21, l.slice(0, 4), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) } });
  T(g0, L, 116, s.base || '기준 시점 = 100', { 'font-size': 12.5, fill: C.mute });
  S.forEach(function (q, k) { var c = h.col(q.color || (k ? 'cmp' : 'main')), d = h.lineD(q.data, X, Y); E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': k ? 2.2 : 3, 'stroke-linejoin': 'round', 'data-at': 200 + k * 150, 'data-fx': 'draw', 'data-ms': 1200 }, svg);
    var g = h.at(svg, 1500, { 'data-fx': 'fade' }), ly = Y(q.data[m - 1]); E('circle', { cx: X(m - 1), cy: ly, r: 4.5, fill: c }, g);
    T(g, Rr + 12, ly - 2 + (k ? 14 : 0), q.name, { 'font-size': 14, 'font-weight': 700, fill: c }); T(g, Rr + 12, ly + 15 + (k ? 14 : 0), h.nf(q.data[m - 1], 0) + (s.unit || ''), { 'font-size': 16, 'font-weight': 700, fill: c }) });
  ev.forEach(function (e, k) { var i = Lb.indexOf(e.at); if (i < 0) return; var x = X(i), w = Math.max(h.textW(e.text, 14, 1), e.sub ? h.textW(e.sub, 12, 0) : 0) + 22, fx = Math.min(Math.max(x - w / 2, 0), 1168 - w), y0 = Y(S[0].data[i]), t0 = 1700 + k * 220, g = h.at(svg, t0, { 'data-fx': 'drop', 'data-dy': -10 });
    E('line', { x1: x, x2: x, y1: 52, y2: y0, stroke: C.dark, 'stroke-dasharray': '3 4', 'stroke-width': 1.3 }, g); E('circle', { cx: x, cy: y0, r: 6, fill: '#fff', stroke: C.dark, 'stroke-width': 2.4 }, g);
    E('rect', { x: fx, y: 0, width: w, height: 52, rx: 8, fill: C.dark }, g); T(g, fx + w / 2, 22, e.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }); if (e.sub) T(g, fx + w / 2, 41, e.sub, { 'text-anchor': 'middle', 'font-size': 12, fill: C.on }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
