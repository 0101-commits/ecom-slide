/* brbubble — 면적 그림 : 항목마다 원, 값 = 원 넓이(지름 아님) 로 가로로 나란히 + 이름 · 값 · 작은 글
   items[{name,value,sub}] 3~7개 · unit · dec · hero(번호, 기본 가장 큰 것) · note(아래 한 줄, false 면 뺌) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brbubble = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 7), n = I.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, u = s.unit || '';
  var mx = 0, mn = 1e18, hero = 0; I.forEach(function (it, i) { if (+it.value > mx) { mx = +it.value; hero = i } mn = Math.min(mn, +it.value) }); if (s.hero != null) hero = s.hero;
  var gap = 26, sumRel = I.reduce(function (a, it) { return a + Math.sqrt(it.value / mx) }, 0), Dmax = Math.min((1168 - gap * (n - 1)) / sumRel, 290);
  var by = 372, g0 = h.at(svg, 0, { 'data-fx': 'fade' }); E('line', { x1: 0, x2: 1168, y1: by, y2: by, stroke: C.line }, g0);
  var tw = sumRel * Dmax + gap * (n - 1), x = (1168 - tw) / 2;
  I.forEach(function (it, i) { var d = Math.sqrt(it.value / mx) * Dmax, r = d / 2, cx = x + r, t0 = 150 + i * 160, on = i === hero, g = h.at(svg, t0 + 350, { 'data-fx': 'fade' }), cy = by - 12 - r;
    E('circle', { cx: cx, cy: cy, r: r, fill: on ? C.dark : (it.value / mx > .3 ? C.main : C.g65), opacity: on ? 1 : .9, 'data-at': t0, 'data-fx': 'pop', 'data-ms': 420 }, svg);
    if (r > 40) T(g, cx, cy + 8, h.nf(it.value, dec), { 'text-anchor': 'middle', 'font-size': r > 70 ? 28 : 20, 'font-weight': 700, fill: '#fff' }); else T(g, cx, cy - r - 9, h.nf(it.value, dec), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    T(g, cx, by + 30, it.name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.ink });
    T(g, cx, by + 50, u, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
    if (it.sub) T(g, cx, by + 70, it.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    x += d + gap });
  var ratio = mx / mn; if (s.note !== false) { var gn = h.at(svg, 150 + n * 160 + 700, { 'data-fx': 'fade' }), tx = s.note || ('넓이 기준 — 가장 큰 원은 가장 작은 원의 ' + h.nf(ratio, ratio < 10 ? 1 : 0) + '배');
    E('rect', { x: 0, y: 466, width: 1168, height: 40, rx: 8, fill: C.paper }, gn); T(gn, 20, 492, tx, { 'font-size': 15, 'font-weight': 700, fill: C.dark }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
