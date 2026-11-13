/* scstake — 이해관계자 표 : 줄마다 주체 · 얻는 것(▲ 초록) · 잃는 것(▼ 주황) · 순 영향 막대(0 가운데, 오른쪽 = 이득 · 왼쪽 = 손해)
   rows[{name,sub,gain,loss,net(점수)}] 3~7줄 · scale{min,max,unit('점')} · titles{gain,loss,net}
   움직임 : 머리 → 줄이 위에서부터 → 순 영향 막대 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scstake = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 7), n = R.length; if (!n) return; var svg = ctx.svg(512), sc = s.scale || { min: -5, max: 5 }, tt = s.titles || {}, u = sc.unit || '';
  var cx = [0, 238, 560, 882], cwid = [226, 310, 310, 286], hh = 44, rh = (512 - hh - 4) / n;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 320 });
  [['주체', 0], [tt.gain || '얻는 것', 1], [tt.loss || '잃는 것', 2], [tt.net || '순 영향', 3]].forEach(function (c) { T(g0, cx[c[1]] + 8, 28, c[0], { 'font-size': 14, 'font-weight': 700, fill: c[1] === 1 ? C.dark : c[1] === 2 ? C.warn : C.mute }) });
  E('line', { x1: 0, x2: 1168, y1: hh - 4, y2: hh - 4, stroke: C.ink, 'stroke-width': 1.5 }, g0);
  var X = h.lin(sc.min, sc.max, cx[3] + 14, 1168 - 14), zx = X(0);
  R.forEach(function (r, i) { var y = hh + i * rh, g = h.at(svg, 300 + i * 220, { 'data-fx': 'fade', 'data-ms': 340 });
    if (i % 2 === 0) E('rect', { x: 0, y: y + 1, width: 1168, height: rh - 2, rx: 6, fill: C.paper }, g);
    T(g, 10, y + rh / 2 - (r.sub ? 2 : -6), r.name, { 'font-size': S.fit(r.name, 17, cwid[0] - 14, 1, 13), 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 10, y + rh / 2 + 17, r.sub, { 'font-size': 12.5, fill: C.mute });
    [['gain', 1, '▲', C.dark], ['loss', 2, '▼', C.warn]].forEach(function (c) { var t = r[c[0]]; if (!t) return; T(g, cx[c[1]] + 8, y + rh / 2 + 5, c[2], { 'font-size': 13, fill: c[3] });
      var L = h.wrap(t, 14.5, cwid[c[1]] - 36, false), by = y + rh / 2 + 5 - (L.length - 1) * 9; L.slice(0, 2).forEach(function (ln, k) { T(g, cx[c[1]] + 28, by + k * 19, ln, { 'font-size': 14.5, fill: C.ink }) }) });
    var gb = h.at(svg, 900 + i * 220, { 'data-fx': 'fade', 'data-ms': 300 }), v = +r.net, bx = X(v), pos = v >= 0;
    E('rect', { x: Math.min(zx, bx), y: y + rh / 2 - 14, width: Math.max(3, Math.abs(bx - zx)), height: 28, rx: 3, fill: pos ? C.main : C.warn, 'data-at': 900 + i * 220 + 60, 'data-fx': 'growx', 'data-o': pos ? '0% 50%' : '100% 50%', 'data-ms': 420 }, svg);
    T(gb, pos ? bx + 8 : bx - 8, y + rh / 2 + 6, h.nf(v, 0, { sign: true }) + u, { 'text-anchor': pos ? 'start' : 'end', 'font-size': 16, 'font-weight': 700, fill: pos ? C.dark : C.warn }) });
  var gz = h.at(svg, 300, { 'data-fx': 'fade' }); E('line', { x1: zx, x2: zx, y1: hh, y2: 508, stroke: C.ink, 'stroke-width': 1.4 }, gz);
  ctx.root.setAttribute('data-gap', 300);
};
})();
