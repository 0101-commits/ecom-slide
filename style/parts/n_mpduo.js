/* mpduo — 전후 두 지도 나란히. 칸마다 l_map 의 칸을 그대로 씀(폭 572 로 줄임) + 위 제목 띠
   panels[{title,sub,map:{…l_map 칸(view · flows · chokes · points …)}}] 2개 · 가운데 화살표
   움직임 : 왼쪽 지도(항로 그림) → 화살표 → 오른쪽 지도 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.mpduo = function (bd, s, ctx) {
  var svg = ctx.svg(512), P = (s.panels || []).slice(0, 2), PW = 572, GAP = 24, HT = 44;
  P.forEach(function (p, i) { var x = i * (PW + GAP), g = h.at(svg, i * 1500, { 'data-fx': 'fade', 'data-ms': 300 });
    E('rect', { x: x + .5, y: 2, width: PW - 1, height: 508, rx: 12, fill: '#fff', stroke: C.line }, g);
    E('rect', { x: x + 14, y: 14, width: i ? 70 : 70, height: 26, rx: 13, fill: i ? C.warn : C.main }, g);
    T(g, x + 49, 32, i ? '사건 후' : '사건 전', { 'font-size': 14, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' });
    T(g, x + 96, 33, p.title || '', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    var sub = E('svg', { x: x + 2, y: HT + 6, width: PW - 4, height: 508 - HT - 8, viewBox: '0 0 ' + (PW - 4) + ' ' + (508 - HT - 8), style: 'overflow:hidden' }, svg);
    var ms = Object.assign({ noFlowKey: true, noDstKey: true }, p.map || {}, { frame: { w: PW - 4, h: 508 - HT - 8 } });
    var sub2 = ctx; ECOM.parts.map(bd, ms, Object.assign({}, ctx, { svg: function () { return sub } })) });
  if (P.length > 1) { var ga = h.at(svg, 1200, { 'data-fx': 'pop', 'data-ms': 300 }), cx = PW + GAP / 2; E('circle', { cx: cx, cy: 256, r: 20, fill: C.dark, stroke: '#fff', 'stroke-width': 3 }, ga); E('path', { d: 'M' + (cx - 7) + ' 246L' + (cx + 7) + ' 256L' + (cx - 7) + ' 266', fill: 'none', stroke: '#fff', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ga) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
