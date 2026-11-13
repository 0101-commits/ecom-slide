/* czloop — 두 고리 8자 : 가운데 마디 하나를 공유하는 두 순환 고리
   center{name,value,sub} · left{title,sub,nodes[2]{name,value,sub},links[3]{text}} · right{…} — 고리 방향 : 왼쪽 반시계, 오른쪽 시계
   links 순서 = 가운데 → 첫 마디 → 둘째 마디 → 가운데 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czloop = function (bd, s, ctx) {
  var svg = ctx.svg(512), RX = 214, RY = 200, CX = 584, CY = 256, NW = 206, NH = 92, ctr = s.center || {};
  function ring(side) { var L = side === 'left', cx = L ? CX - RX : CX + RX, pt = function (a) { return [cx + RX * Math.cos(a * Math.PI / 180), CY - RY * Math.sin(a * Math.PI / 180)] };
    var A = L ? [0, 120, 240, 360] : [180, 60, -60, -180], d = L ? 1 : -1, def = s[side] || {}, t0 = L ? 300 : 1500;
    var q = pt(A[0]); E('ellipse', { cx: cx, cy: CY, rx: RX, ry: RY, fill: L ? C.g08 : '#F3F6F4', stroke: 'none' }, E('g', { 'data-at': t0 - 150, 'data-fx': 'fade', 'data-ms': 400 }, svg));
    for (var k = 0; k < 3; k++) { var a0 = A[k], a1 = A[k + 1], p0 = pt(a0), p1 = pt(a1), mid = (a0 + a1) / 2, pm = pt(mid), t = t0 + k * 520, g = h.at(svg, t, { 'data-fx': 'fade', 'data-ms': 320 });
      E('path', { d: 'M' + p0[0] + ' ' + p0[1] + ' A' + RX + ' ' + RY + ' 0 0 ' + (L ? 0 : 1) + ' ' + p1[0] + ' ' + p1[1], fill: 'none', stroke: C.g65, 'stroke-width': 5, 'data-at': t, 'data-fx': 'draw', 'data-ms': 500 }, svg);
      var ah = mid + d * 30, pa = pt(ah), tr = (ah * Math.PI / 180), tx = -RX * Math.sin(tr) * d, ty = -RY * Math.cos(tr) * d; ECOM.kx.head(svg, pa[0], pa[1], Math.atan2(ty, tx), C.g65, 20, { 'data-at': t + 440, 'data-fx': 'fade', 'data-ms': 160 });
      var lk = (def.links || [])[k]; if (lk) { var gc = h.at(svg, t + 360, { 'data-fx': 'pop', 'data-ms': 300 }); Z.chip(gc, pm[0] + (L ? (k === 1 ? -4 : 0) : (k === 1 ? 4 : 0)), pm[1], lk.text || lk, 14, { fill: '#fff', stroke: C.g65, sw: 2 }) } }
    (def.nodes || []).forEach(function (o, k) { var p = pt(A[k + 1]), g = h.at(svg, t0 + k * 520 + 260, { 'data-fx': 'pop', 'data-ms': 380 }), x = p[0] - NW / 2, y = p[1] - NH / 2;
      Z.box(g, x, y, NW, NH, { fill: '#fff', stroke: C.main, sw: 2.6, rx: 14 }); var nl = Z.tx(g, p[0], y + 28, o.name || '', 16, NW - 16, { lh: 19 }); T(g, p[0], y + 28 + (nl - 1) * 19 + 29, o.value || '', { 'text-anchor': 'middle', 'font-size': 25, 'font-weight': 700, fill: C.dark });
      if (o.sub) T(g, p[0], y + NH + 17, o.sub, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 500, fill: C.mute }) });
    var lc = L ? cx - 12 : cx + 12, gt = h.at(svg, t0 + 80, { 'data-fx': 'fade', 'data-ms': 420 }); Z.tx(gt, lc, CY - 20, def.title || '', 18, 190, { fill: C.dark, lh: 23 }); if (def.sub) Z.tx(gt, lc, CY + 28, def.sub, 13, 190, { bold: false, fill: C.mute, lh: 17 }) }
  ring('left'); ring('right');
  var g = h.at(svg, 100, { 'data-fx': 'pop', 'data-ms': 460 }); Z.box(g, CX - 112, CY - 62, 224, 124, { fill: C.dark, rx: 18 });
  var nl = Z.tx(g, CX, CY - 22, ctr.name || '', 18, 200, { fill: '#fff', lh: 22 }); T(g, CX, CY - 22 + (nl - 1) * 22 + 38, ctr.value || '', { 'text-anchor': 'middle', 'font-size': 31, 'font-weight': 700, fill: '#fff' });
  if (ctr.sub) T(g, CX, CY + 80, ctr.sub, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 500, fill: C.mute });
};
})();
