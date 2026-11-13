/* scissue — 쟁점 나무(위에서 아래) : 맨 위 쟁점 상자 → 두 갈래(찬성 · 반대 머리) → 갈래마다 논거 카드(근거 세기 점) 아래 반론 띠
   q{title,sub} · pro{title,items:[{t(논거),r(반론),w(1~3 근거 세기)}≤3]} · con{…} · strengthText('근거 세기')
   움직임 : 쟁점 → 두 머리 → 논거 카드(줄 단위) → 반론 띠 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scissue = function (bd, s, ctx) {
  var svg = ctx.svg(512), q = s.q || {}, cols = [[s.pro || {}, 0, C.main, '찬성'], [s.con || {}, 600, C.cmp, '반대']], CW = 568;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 380 }), qw = 760, qx = (1168 - qw) / 2;
  E('rect', { x: qx, y: 0, width: qw, height: 60, rx: 10, fill: C.dark }, g0); T(g0, 584, 27, q.title || '', { 'text-anchor': 'middle', 'font-size': S.fit(q.title || '', 20, qw - 40, 1, 14), 'font-weight': 700, fill: '#fff' });
  if (q.sub) T(g0, 584, 48, q.sub, { 'text-anchor': 'middle', 'font-size': 13, fill: C.g18 });
  cols.forEach(function (c, ci) { var o = c[0], x = c[1], col = c[2], mid = x + CW / 2, g = h.at(svg, 400 + ci * 120, { 'data-fx': 'fade', 'data-ms': 360 });
    E('path', { d: 'M584 60 V76 H' + mid + ' V92', fill: 'none', stroke: C.axis, 'stroke-width': 2 }, g);
    E('rect', { x: x, y: 92, width: CW, height: 38, rx: 19, fill: col }, g); T(g, mid, 117, o.title || c[3], { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: '#fff' });
    var it = (o.items || []).slice(0, 3), n = it.length, top = 146, ih = (512 - top) / Math.max(n, 1);
    E('line', { x1: x + 12, x2: x + 12, y1: 130, y2: top + ih * (n - 1) + 36, stroke: col, 'stroke-width': 2, 'data-at': 800, 'data-fx': 'fade' }, svg);
    it.forEach(function (m, i) { var y = top + i * ih, g1 = h.at(svg, 800 + i * 330 + ci * 100, { 'data-fx': 'fade', 'data-ms': 360 }), ch = ih - 12;
      E('path', { d: 'M' + (x + 12) + ' ' + (y + 26) + ' H' + (x + 30), fill: 'none', stroke: col, 'stroke-width': 2 }, g1);
      E('rect', { x: x + 30, y: y, width: CW - 30, height: ch, rx: 10, fill: '#fff', stroke: col, 'stroke-width': 2 }, g1);
      var r1 = S.wrapT(g1, x + 46, y + 28, m.t, 16, CW - 140, { 'font-weight': 700, fill: C.ink }, 21);
      for (var k = 0; k < 3; k++) E('circle', { cx: x + CW - 24 - (2 - k) * 18, cy: y + 24, r: 6, fill: k < (m.w || 2) ? col : C.light }, g1);
      T(g1, x + CW - 84, y + 28, s.strengthText || '근거 세기', { 'text-anchor': 'end', 'font-size': 11.5, fill: C.mute });
      var ry = y + ch - 62; E('rect', { x: x + 42, y: ry, width: CW - 54, height: 52, rx: 8, fill: C.paper, stroke: C.axis, 'stroke-dasharray': '4 3' }, g1);
      T(g1, x + 54, ry + 21, '반론', { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); S.wrapT(g1, x + 100, ry + 21, m.r, 14, CW - 130, { fill: C.sub }, 18) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
