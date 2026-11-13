/* czdomino — 도미노 연쇄 : 세워진 패가 하나씩 오른쪽으로 쓰러짐(기울기 점점 커짐), 패 아래에 이름 · 값
   tiles[4~6]{name,value,sub,date} · lead{text}(위 화살 위 글) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czdomino = function (bd, s, ctx) {
  var svg = ctx.svg(512), tl = (s.tiles || []).slice(0, 6), n = tl.length; if (n < 3) return;
  var pitch = 1168 / n, base = 276, TH = 200, TW = 74, ang = function (i) { return 5 + 79 * Math.pow(i / Math.max(1, n - 1), 1.35) };
  var cols = [C.g40, C.g65, C.main, C.dark, C.dark, C.dark];
  E('line', { x1: 0, x2: 1168, y1: base + 2, y2: base + 2, stroke: C.axis, 'stroke-width': 2.4 }, E('g', { 'data-at': 80, 'data-fx': 'fade', 'data-ms': 300 }, svg));
  tl.forEach(function (o, i) { var t = 220 + i * 560, mid0 = pitch * i + pitch / 2, a = ang(i), ar = a * Math.PI / 180, px = mid0 + TW / 2 * Math.cos(ar) - TH / 2 * Math.sin(ar), g = h.at(svg, t, { 'data-fx': 'fade', 'data-ms': 300 }), g2 = h.at(svg, t + 60, { 'data-fx': 'rise', 'data-ms': 420 });
    var og = E('g', { transform: 'rotate(' + a + ' ' + px + ' ' + base + ')' }, g); E('rect', { x: px - TW, y: base - TH, width: TW, height: TH, rx: 7, fill: cols[Math.min(i, 5)], stroke: '#fff', 'stroke-width': 2 }, og);
    var cyp = base - TH + 26; for (var k = 0; k < 3; k++) E('circle', { cx: px - TW / 2, cy: cyp + k * 20, r: 4.2, fill: i < 2 ? C.dark : '#fff', opacity: .8 }, og);
    E('circle', { cx: px - TW / 2, cy: base - 18, r: 13, fill: '#fff', stroke: 'none', opacity: .0 }, og);
    var cx0 = pitch * i + pitch / 2 - TW / 2 + (i ? 0 : 0), mid = pitch * i + pitch / 2;
    E('circle', { cx: mid, cy: base + 40, r: 15, fill: C.dark }, g2); T(g2, mid, base + 45.5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' });
    var nl = Z.tx(g2, mid, base + 82, o.name || '', 17, pitch - 20, { lh: 21 }); T(g2, mid, base + 82 + (nl - 1) * 21 + 38, o.value || '', { 'text-anchor': 'middle', 'font-size': 29, 'font-weight': 700, fill: C.dark });
    var yy = base + 82 + (nl - 1) * 21 + 38; if (o.sub) Z.tx(g2, mid, yy + 24, o.sub, 12.5, pitch - 24, { bold: false, fill: C.mute, lh: 16 }); if (o.date) Z.chip(g2, mid, 478, o.date, 12.5, { fill: C.g08, stroke: C.g40, sw: 1.4 }) });
  var gl = h.at(svg, 150, { 'data-fx': 'fade', 'data-ms': 420 }); if (s.lead && s.lead.text) { T(gl, 20, 34, s.lead.text, { 'font-size': 17, 'font-weight': 700, fill: C.dark }) }
  Z.arr(svg, 20, 54, 1148, 54, C.g40, 4, 300, { head: 16, ms: 2600 });
};
})();
