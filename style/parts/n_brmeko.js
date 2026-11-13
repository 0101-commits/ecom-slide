/* brmeko — 마리메코 : 열 폭 = 시장 크기, 열 안 높이 = 몫(%) 로 쌓은 면 (면적 = 크기 × 몫)
   cols[{name,size,parts[%]}] 2~5열 · names[몫 이름](범례, 위 칸부터) · sizeUnit(열 위 크기 글 단위) · dec · hero(강조 칸 번호) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brmeko = function (bd, s, ctx) {
  var Cc = (s.cols || []).slice(0, 5), n = Cc.length; if (!n) return; var svg = ctx.svg(512), names = s.names || [], k = Cc[0].parts.length, dec = s.dec != null ? s.dec : 0, su = s.sizeUnit || '';
  var tot = Cc.reduce(function (a, c) { return a + c.size }, 0), gap = 4, W = 1168 - gap * (n - 1), top = 64, H = 512 - top - 4, x = 0, shades = [C.dark, C.main, C.g65, C.g40, C.g18], tc = ['#fff', '#fff', '#fff', C.ink, C.ink], hero = s.hero != null ? s.hero : 0;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); names.slice(0, k).forEach(function (nm, j) { var lx = 0 + j * 170; E('rect', { x: lx, y: 7, width: 14, height: 14, rx: 2, fill: shades[j] }, g0); T(g0, lx + 21, 19, nm, { 'font-size': 14, 'font-weight': 700, fill: C.ink }) });
  Cc.forEach(function (c, i) { var w = W * c.size / tot, t0 = 100 + i * 330, y = top;
    T(h.at(svg, t0, { 'data-fx': 'fade' }), x + w / 2, 42, c.name + ' ' + h.nf(c.size, 0) + su, { 'text-anchor': 'middle', 'font-size': w > 130 ? 16 : 14, 'font-weight': 700, fill: C.ink });
    c.parts.forEach(function (p, j) { var hh = H * p / 100, on = hero === j;
      E('rect', { x: x, y: y, width: w, height: hh, fill: shades[j], 'data-at': t0 + 60 + j * 110, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 380 }, svg);
      var fits = hh > 24 && w > 54, gg = h.at(svg, t0 + 400 + j * 110, { 'data-fx': 'fade' });
      if (fits) T(gg, x + w / 2, y + hh / 2 + (w > 90 && hh > 44 ? -2 : 6), h.nf(p, dec) + '%', { 'text-anchor': 'middle', 'font-size': hh > 70 && w > 120 ? 26 : 16, 'font-weight': 700, fill: tc[j] });
      if (w > 90 && hh > 44) T(gg, x + w / 2, y + hh / 2 + 20, h.nf(w / W * 0 + p * c.size / 100, 0) + su, { 'text-anchor': 'middle', 'font-size': 12.5, fill: tc[j] });
      y += hh });
    x += w + gap });
  ctx.root.setAttribute('data-gap', 300);
};
})();
