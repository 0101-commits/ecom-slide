/* czrings — 충격 동심원 : 가운데 사건, 둘레로 1차 · 2차 · 3차 영향 고리, 오른쪽에 고리마다 설명 카드(안내선)
   core{title,sub} · rings[2~4]{tag,name,value,sub} (안쪽 고리부터) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czrings = function (bd, s, ctx) {
  var svg = ctx.svg(512), rg = (s.rings || []).slice(0, 4), n = rg.length, core = s.core || {}; if (!n) return;
  var CX = 262, CY = 256, R0 = 64, RM = 250, step = (RM - R0) / n, fills = [C.g40, C.g18, C.g08, '#F3F8F5'], tc = [C.main, C.g65, C.g40, C.g40];
  for (var k = n - 1; k >= 0; k--) { var ro = R0 + step * (k + 1), t = 300 + (n - 1 - k) * 0; E('circle', { cx: CX, cy: CY, r: ro, fill: fills[k], stroke: '#fff', 'stroke-width': 3, 'data-at': 200 + (k + 1) * 520, 'data-fx': 'pop', 'data-ms': 520 }, svg) }
  var gc = h.at(svg, 100, { 'data-fx': 'pop', 'data-ms': 460 }); E('circle', { cx: CX, cy: CY, r: R0, fill: C.dark }, gc); var nl = Z.tx(gc, CX, CY - 6, core.title || '', 16, 110, { fill: '#fff', lh: 20 }); if (core.sub) Z.tx(gc, CX, CY - 6 + nl * 20 + 4, core.sub, 12.5, 110, { bold: false, fill: '#CDE9DD', lh: 16 });
  var CW = 590, CXC = 1168 - CW, CH = Math.min(150, (512 - (n - 1) * 18) / n), top = (512 - n * CH - (n - 1) * 18) / 2;
  rg.forEach(function (o, k) { var rm = R0 + step * (k + .5), y = top + k * (CH + 18), cyp = y + CH / 2, t = 200 + (k + 1) * 520 + 300, ang = (k - (n - 1) / 2) * 0.62 - 0.0, px = CX + rm * Math.cos(-ang * .0 + (cyp - CY) / 330 * 1.0), py = CY + rm * Math.sin((cyp - CY) / 330 * 1.0);
    var g = h.at(svg, t, { 'data-fx': 'right', 'data-ms': 420 }); var qa = (cyp - CY) / 330; px = CX + rm * Math.cos(qa); py = CY + rm * Math.sin(qa);
    E('circle', { cx: px, cy: py, r: 8, fill: '#fff', stroke: C.dark, 'stroke-width': 3 }, g); E('path', { d: 'M' + px + ' ' + py + ' L' + (CXC - 40) + ' ' + cyp + ' H' + CXC, fill: 'none', stroke: C.g65, 'stroke-width': 2.2 }, g);
    Z.box(g, CXC, y, CW, CH, { fill: '#fff', stroke: C.main, sw: 2.4, rx: 16 }); Z.chip(g, CXC + 54, y + 32, o.tag || String(k + 1) + '차', 14, { fill: C.dark, stroke: 'none', color: '#fff', min: 70 });
    var nm = Z.tx(g, CXC + 108, y + 38, o.name || '', 19, CW - 340, { anchor: 'start', lh: 24 }); if (o.sub) Z.tx(g, CXC + 20, y + 38 + Math.max(nm, 1) * 24 + 12, o.sub, 13.5, CW - 40, { anchor: 'start', bold: false, fill: C.mute, lh: 18 });
    T(g, CXC + CW - 22, y + 44, o.value || '', { 'text-anchor': 'end', 'font-size': 36, 'font-weight': 700, fill: C.dark }) });
};
})();
