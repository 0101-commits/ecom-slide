/* codonuts — 점유율 도넛 여럿 : 시장마다 도넛 하나(가운데 = 우리 회사 몫), 아래에 같은 회사 색으로 표 범례 + 순위 한 줄
   markets[{name,size('120조원'),parts[{label,value}],note}] 2~4개 · companies[이름…] 색 순서(첫째 = hero) · hero(이름, 기본 companies[0]) · unit('%')
   hero 조각은 12시부터 시작, 나머지는 큰 순서 · companies 에 없는 이름은 연한 회색(그 밖) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function arc(cx, cy, R, r, a0, a1) { var p = function (a, q) { return [cx + q * Math.cos(a), cy + q * Math.sin(a)] }, big = a1 - a0 > Math.PI ? 1 : 0, o0 = p(a0, R), o1 = p(a1, R), i1 = p(a1, r), i0 = p(a0, r);
  return 'M' + o0[0] + ' ' + o0[1] + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + o1[0] + ' ' + o1[1] + ' L' + i1[0] + ' ' + i1[1] + ' A' + r + ' ' + r + ' 0 ' + big + ' 0 ' + i0[0] + ' ' + i0[1] + ' Z' }
ECOM.parts.codonuts = function (bd, s, ctx) {
  var M = (s.markets || []).slice(0, 4), n = M.length; if (!n) return; var svg = ctx.svg(512), O = s.companies || [], hero = s.hero || O[0], u = s.unit || '%', cw = 1168 / n, R = Math.min(104, cw / 2 - 34), r = R * .62;
  var pal = [C.g65, C.cmp, C.g40, C.main];
  function colorOf(l) { if (l === hero) return C.dark; var j = O.filter(function (q) { return q !== hero }).indexOf(l); return j < 0 ? C.gray : pal[j % pal.length] }
  M.forEach(function (m, i) { var cx = cw * i + cw / 2, cy = 142, t0 = i * 230, g = h.at(svg, t0, { 'data-fx': 'fade' }), P = (m.parts || []).slice(), tot = P.reduce(function (a, q) { return a + q.value }, 0);
    if (i) E('line', { x1: cw * i, x2: cw * i, y1: 8, y2: 500, stroke: C.line }, svg);
    T(g, cx, 22, m.name, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (m.size) T(g, cx, 41, m.size, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
    P.sort(function (a, b) { return (b.label === hero) - (a.label === hero) || (a.label === '그 밖') - (b.label === '그 밖') || b.value - a.value });
    var a = -Math.PI / 2; P.forEach(function (q, k) { var da = 2 * Math.PI * q.value / tot; E('path', { d: arc(cx, cy + 14, R, r, a + .004, a + da - .004), fill: colorOf(q.label), 'data-at': t0 + 80 + k * 110, 'data-fx': 'fade', 'data-ms': 360 }, svg); a += da });
    var hp = P.filter(function (q) { return q.label === hero })[0], g2 = h.at(svg, t0 + 520, { 'data-fx': 'fade' });
    if (hp) { T(g2, cx, cy + 14 + 4, h.nf(hp.value, 0) + u, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: C.dark }); T(g2, cx, cy + 14 + 26, hero, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute }) }
    var g3 = h.at(svg, t0 + 640, { 'data-fx': 'rise' }), lx = cx - Math.min(112, cw / 2 - 24), rx = cx + Math.min(112, cw / 2 - 24);
    P.forEach(function (q, k) { var y = 276 + k * 29, on = q.label === hero; if (on) E('rect', { x: lx - 8, y: y - 8, width: rx - lx + 16, height: 27, rx: 6, fill: C.g08 }, g3);
      E('rect', { x: lx, y: y - 1, width: 12, height: 12, rx: 3, fill: colorOf(q.label) }, g3); T(g3, lx + 20, y + 10, q.label, { 'font-size': 15, 'font-weight': on ? 700 : 400, fill: on ? C.dark : C.ink });
      T(g3, rx, y + 10, h.nf(q.value, 0) + u, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: on ? C.dark : C.ink }) });
    if (m.note) { var g4 = h.at(svg, t0 + 760, { 'data-fx': 'fade' }); E('rect', { x: lx - 8, y: 462, width: rx - lx + 16, height: 38, rx: 8, fill: C.paper }, g4); T(g4, cx, 486, m.note, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.dark }) } });
  ctx.root.setAttribute('data-gap', 300);
};
})();
