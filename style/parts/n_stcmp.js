/* stcmp — 같은 돈 두 제도 : 같은 총액을 제도 A · B 쌓은 막대 두 개로 나란히, 같은 조각끼리 띠로 이어 차이를 보임 + 실수령 차이 칩
   total{value,unit,label} · a{name,sub,items:[{name,value,tone}]} · b{...}(조각 이름 같게, tone:'warn' = 깎이는 몫, 'main' = 손에 쥐는 몫, 'g65'·'g40') · dec · concl */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stcmp = function (bd, s, ctx) {
  var A = s.a, B = s.b, tot = s.total; if (!A || !B || !tot) return; var svg = ctx.svg(512), unit = tot.unit || '', dec = s.dec || 0, top = 60, bot = s.band ? 396 : 456, H = bot - top, k = H / tot.value;
  var cw = 150, ax = 330, bx = 688, items = A.items, n = items.length;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 }); u.chip(g0, ax + cw / 2, 28, A.name, C.dark, '#fff', 15); u.chip(g0, bx + cw / 2, 28, B.name, C.cmp, '#fff', 15);
  if (A.sub) T(g0, ax - 20, 28 + 5, A.sub, { 'text-anchor': 'end', 'font-size': 13, fill: C.mute }); if (B.sub) T(g0, bx + cw + 20, 28 + 5, B.sub, { 'font-size': 13, fill: C.mute });
  T(g0, 584, 28 + 5, '', {});
  var fillOf = function (t, j) { return t === 'warn' ? C.warn : t === 'main' ? C.main : t === 'g40' ? C.g40 : t === 'g65' ? C.g65 : (j % 2 ? C.g65 : C.g40) };
  var ya = top, yb = top;
  items.forEach(function (ia, j) { var ib = B.items[j], ha = ia.value * k, hb = ib.value * k, col = fillOf(ia.tone, j), g = h.at(svg, 250 + j * 420, { 'data-fx': 'rise', 'data-ms': 420 });
    var rib = [[ax + cw, ya], [bx, yb], [bx, yb + hb], [ax + cw, ya + ha]]; E('path', { d: 'M' + rib.map(function (p) { return p[0] + ' ' + p[1] }).join(' L') + ' Z', fill: col, opacity: .22 }, g);
    E('rect', { x: ax, y: ya + 1, width: cw, height: Math.max(2, ha - 2), rx: 3, fill: col }, g); E('rect', { x: bx, y: yb + 1, width: cw, height: Math.max(2, hb - 2), rx: 3, fill: col }, g);
    var la = ia.name + ' ' + h.nf(ia.value, dec) + unit, lb = h.nf(ib.value, dec) + unit, diff = ib.value - ia.value;
    if (ha >= 16) T(g, ax - 20, ya + ha / 2 + 5, la, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: ia.tone === 'warn' ? C.warn : C.ink });
    if (hb >= 16) T(g, bx + cw + 20, yb + hb / 2 + 5, lb + (diff ? '  (' + (diff > 0 ? '+' : '−') + h.nf(Math.abs(diff), dec) + ')' : ''), { 'font-size': 15, 'font-weight': 700, fill: ib.tone === 'warn' ? C.warn : C.ink });
    ya += ha; yb += hb });
  var gt = h.at(svg, 250 + n * 420 + 200, { 'data-fx': 'pop', 'data-ms': 420 }), last = n - 1, d = B.items[last].value - items[last].value;
  var msg = (s.deltaText || '실수령 차이') + ' ' + (d > 0 ? '+' : '−') + h.nf(Math.abs(d), dec) + unit; u.chip(gt, 584, (top + bot) / 2 + 150, msg, d < 0 ? C.warn : C.main, '#fff', 15);
  T(g0, ax + cw / 2, bot + 24, '총 ' + h.nf(tot.value, dec) + unit, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g0, bx + cw / 2, bot + 24, '총 ' + h.nf(tot.value, dec) + unit, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  if (s.band) { var gc = h.at(svg, 250 + n * 420 + 700, { 'data-fx': 'fade' }); u.box(gc, 0, 452, 1168, 56, C.paper, { rx: 10 }); u.rich(gc, 22, 486, s.band, 16.5, 1124, { fill: C.cmp, min: 13 }) }
};
})();
