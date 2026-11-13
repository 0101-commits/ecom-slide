/* scshare — 100% 기둥 + 이어진 띠 : 해마다 100% 기둥을 쌓고 같은 항목끼리 띠로 이어 몫이 어떻게 바뀌는지. 첫 해 몫은 왼쪽 이름에, 마지막 해 몫 · 변화는 오른쪽에
   years[…] · items[{name,tone,hi,data:[해마다 몫(%), 합 100]}](아래에서 위 쌓기 순서) · unit('%') · dunit('%p') · dec
   움직임 : 기둥이 왼쪽부터 → 띠 → 양 끝 이름 · 변화 꼬리표 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scshare = function (bd, s, ctx) {
  var Y = s.years || [], I = (s.items || []).slice(0, 6), ny = Y.length, ni = I.length; if (ny < 2 || !ni) return; var svg = ctx.svg(512), u = s.unit || '%', du = s.dunit || '%p', dec = s.dec || 0;
  var x0 = 196, x1 = 940, cw = Math.min(64, (x1 - x0) / ny * .55), sl = (x1 - x0 - cw) / (ny - 1), top = 14, bot = 456, H = bot - top, tones = ['dark', 'g65', 'g40', 'gray', 'light', 'axis'];
  var tot = Y.map(function (_, k) { return I.reduce(function (a, it) { return a + it.data[k] }, 0) || 100 });
  var seg = I.map(function (it) { return [] }), acc = Y.map(function () { return bot });
  I.forEach(function (it, i) { Y.forEach(function (_, k) { var hh = H * it.data[k] / tot[k]; seg[i][k] = [acc[k] - hh, acc[k]]; acc[k] -= hh }) });
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 300 }); Y.forEach(function (y, k) { T(g0, x0 + k * sl + cw / 2, bot + 26, y, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': k === ny - 1 ? 700 : 400, fill: k === ny - 1 ? C.ink : C.mute }) });
  I.forEach(function (it, i) { var col = h.col(it.tone || (it.hi ? 'cmp' : tones[i])), tc = (it.tone === 'g40' || it.tone === 'gray' || it.tone === 'light' || it.tone === 'axis' || (!it.tone && i > 1)) ? C.ink : '#fff';
    for (var k = 0; k < ny - 1; k++) { var xa = x0 + k * sl + cw, xb = x0 + (k + 1) * sl, xm = (xa + xb) / 2, a = seg[i][k], b = seg[i][k + 1];
      E('path', { d: 'M' + xa + ' ' + a[0] + ' C' + xm + ' ' + a[0] + ' ' + xm + ' ' + b[0] + ' ' + xb + ' ' + b[0] + ' L' + xb + ' ' + b[1] + ' C' + xm + ' ' + b[1] + ' ' + xm + ' ' + a[1] + ' ' + xa + ' ' + a[1] + ' Z', fill: col, 'fill-opacity': it.hi ? .42 : .26, 'data-at': 700 + k * 260, 'data-fx': 'fade', 'data-ms': 420 }, svg) }
    for (var k2 = 0; k2 < ny; k2++) { var a2 = seg[i][k2], hh = a2[1] - a2[0], x = x0 + k2 * sl, g = h.at(svg, 150 + k2 * 260, { 'data-fx': 'fade', 'data-ms': 320 });
      E('rect', { x: x, y: a2[0] + .8, width: cw, height: hh - 1.6, fill: col }, g); if (hh >= 22 || it.hi) T(g, x + cw / 2, a2[0] + hh / 2 + 5, h.nf(it.data[k2], dec), { 'text-anchor': 'middle', 'font-size': hh >= 22 ? 14 : 12.5, 'font-weight': 700, fill: tc }) }
    var gl = h.at(svg, 150 + ny * 260 + 300 + i * 100, { 'data-fx': 'fade', 'data-ms': 380 }), a0 = seg[i][0], al = seg[i][ny - 1], cy0 = (a0[0] + a0[1]) / 2, cyl = (al[0] + al[1]) / 2, d = it.data[ny - 1] - it.data[0];
    T(gl, x0 - 14, cy0 + 6, it.name, { 'text-anchor': 'end', 'font-size': it.hi ? 18 : 16, 'font-weight': 700, fill: C.ink });
    var rx = x0 + (ny - 1) * sl + cw + 16; T(gl, rx, cyl - 3, it.name, { 'font-size': it.hi ? 17 : 15, 'font-weight': 700, fill: C.ink });
    T(gl, rx, cyl + 17, h.nf(it.data[ny - 1], dec) + u, { 'font-size': 15, fill: C.sub }); var t = (d >= 0 ? '▲ +' : '▼ −') + h.nf(Math.abs(d), dec) + du; S.chip(gl, 1168 - 112, cyl - 13, 112, 26, t, d >= 0 ? C.g18 : C.paper, d >= 0 ? C.dark : C.cmp, 13.5, { stroke: d >= 0 ? C.g65 : C.axis }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
