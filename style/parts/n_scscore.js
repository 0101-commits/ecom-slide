/* scscore — 쟁점별 점수 표(나비 모양) : 줄마다 쟁점 · 반대 근거 세기(왼쪽 칸) | 찬성 근거 세기(오른쪽 칸) · 어느 쪽이 센지 꼬리표 · 점수 비교
   rows[{name,sub,pro,con}] 3~7줄(점수 0~max) · max(기본 5) · proName('찬성') · conName('반대') · tieText('팽팽')
   차이 1점 이상이면 센 쪽 꼬리표, 같으면 회색. 아래에 합계 줄(부품이 계산). 움직임 : 머리 → 줄이 위에서부터 → 합계 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scscore = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 7), n = R.length; if (!n) return; var svg = ctx.svg(512), mx = s.max || 5, pn = s.proName || '찬성', cn = s.conName || '반대', CW = 50, ZX = 604;
  var hh = 46, rh = (512 - hh - 62) / n, g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 320 });
  T(g0, 0, 30, '쟁점', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, ZX - 10, 30, cn + ' 근거 세기', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.cmp }); T(g0, ZX + 10, 30, pn + ' 근거 세기', { 'font-size': 14, 'font-weight': 700, fill: C.dark });
  T(g0, 1168, 30, '점수 · 판정', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.mute }); E('line', { x1: 0, x2: 1168, y1: hh - 6, y2: hh - 6, stroke: C.ink, 'stroke-width': 1.5 }, g0);
  var sp = 0, sc = 0;
  R.forEach(function (r, i) { var y = hh + i * rh, cy = y + rh / 2, g = h.at(svg, 300 + i * 240, { 'data-fx': 'fade', 'data-ms': 320 }), d = r.pro - r.con; sp += r.pro; sc += r.con;
    if (i % 2 === 0) E('rect', { x: 0, y: y + 1, width: 1168, height: rh - 2, rx: 6, fill: C.paper }, g);
    T(g, 10, cy - (r.sub ? 1 : -6), r.name, { 'font-size': S.fit(r.name, 17, 300, 1, 13), 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 10, cy + 18, r.sub, { 'font-size': S.fit(r.sub, 12.5, 300, 0, 11.5), fill: C.mute });
    for (var k = 0; k < mx; k++) { E('rect', { x: ZX - 10 - (k + 1) * CW + 4, y: cy - 15, width: CW - 8, height: 30, rx: 4, fill: k < r.con ? C.cmp : C.light }, g); E('rect', { x: ZX + 10 + k * CW + 4, y: cy - 15, width: CW - 8, height: 30, rx: 4, fill: k < r.pro ? C.main : C.light }, g) }
    E('line', { x1: ZX, x2: ZX, y1: y + 6, y2: y + rh - 6, stroke: C.ink, 'stroke-width': 1.4 }, g);
    var vx = ZX + 10 + mx * CW + 24; T(g, vx, cy + 7, r.con + ' : ' + r.pro, { 'font-size': 20, 'font-weight': 700, fill: C.ink });
    var tx = d >= 1 ? pn + ' 우세' : d <= -1 ? cn + ' 우세' : (s.tieText || '팽팽'); S.chip(g, 1168 - 100, cy - 14, 100, 28, tx, d >= 1 ? C.main : d <= -1 ? C.cmp : C.gray, d === 0 ? C.ink : '#fff', 13.5) });
  var gs = h.at(svg, 300 + n * 240 + 200, { 'data-fx': 'fade', 'data-ms': 420 }), y = 512 - 50;
  E('line', { x1: 0, x2: 1168, y1: y - 6, y2: y - 6, stroke: C.ink, 'stroke-width': 1.5 }, gs); T(gs, 10, y + 26, '합계', { 'font-size': 18, 'font-weight': 700, fill: C.ink });
  T(gs, ZX - 10, y + 28, cn + ' ' + sc + '점', { 'text-anchor': 'end', 'font-size': 22, 'font-weight': 700, fill: C.cmp }); T(gs, ZX + 10, y + 28, pn + ' ' + sp + '점', { 'font-size': 22, 'font-weight': 700, fill: C.dark });
  ctx.root.setAttribute('data-gap', 300);
};
})();
