/* czfish — 물고기뼈 원인도 : 가운데 등뼈 끝에 결과(머리), 위 · 아래 가지마다 원인 상자 (위 3 · 아래 3)
   fishHead{name,value,sub} · bones[2~6]{name,value,sub,tone:'warn'} — 위 줄 왼쪽부터, 그다음 아래 줄 왼쪽부터 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czfish = function (bd, s, ctx) {
  var svg = ctx.svg(512), hd = s.fishHead || {}, bs = (s.bones || []).slice(0, 6), n = bs.length, up = Math.ceil(n / 2), dn = n - up, SY = 256, HX = 880, BW = 232, BH = 104;
  var gs = h.at(svg, 80, { 'data-fx': 'fade', 'data-ms': 300 });
  E('path', { d: 'M8 ' + (SY - 26) + ' L52 ' + SY + ' L8 ' + (SY + 26) + ' Z', fill: C.g40 }, gs);
  E('line', { x1: 40, x2: HX + 6, y1: SY, y2: SY, stroke: C.g65, 'stroke-width': 8, 'stroke-linecap': 'round', 'data-at': 160, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  var gh = h.at(svg, 900, { 'data-fx': 'pop', 'data-ms': 460 });
  E('path', { d: 'M' + HX + ' ' + (SY - 112) + ' H1120 Q1168 ' + (SY - 112) + ' 1168 ' + (SY - 64) + ' V' + (SY + 64) + ' Q1168 ' + (SY + 112) + ' 1120 ' + (SY + 112) + ' H' + HX + ' Q' + (HX - 26) + ' ' + SY + ' ' + HX + ' ' + (SY - 112) + ' Z', fill: C.dark }, gh);
  var nl = Z.tx(gh, (HX + 1168) / 2 + 8, SY - 52, hd.name || '', 19, 230, { fill: '#fff', lh: 24 }); T(gh, (HX + 1168) / 2 + 8, SY - 52 + (nl - 1) * 24 + 48, hd.value || '', { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 700, fill: '#fff' });
  if (hd.sub) Z.tx(gh, (HX + 1168) / 2 + 8, SY + 88, hd.sub, 13, 230, { bold: false, fill: '#CDE9DD', lh: 17 });
  function place(list, side) { var m = list.length, x0 = 270, x1 = 760; list.forEach(function (o, k) { var ex = m === 1 ? 520 : x0 + (x1 - x0) * k / (m - 1), bx = ex - 96, by = side < 0 ? 14 : 512 - 14 - BH, t = 400 + (side < 0 ? 0 : up) * 0 + (k * 2 + (side < 0 ? 0 : 1)) * 330, warn = o.tone === 'warn';
      var y1 = side < 0 ? by + BH : by;
      E('line', { x1: bx + BW / 2, y1: y1, x2: ex + 30, y2: SY, stroke: C.g65, 'stroke-width': 5, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 360 }, svg);
      var g = h.at(svg, t + 260, { 'data-fx': 'pop', 'data-ms': 380 }); Z.box(g, bx, by, BW, BH, { fill: '#fff', stroke: warn ? C.warn : C.main, sw: 2.6, rx: 14 });
      var l = Z.tx(g, bx + BW / 2, by + 28, o.name || '', 16, BW - 20, { lh: 19 }); T(g, bx + BW / 2, by + 28 + (l - 1) * 19 + 31, o.value || '', { 'text-anchor': 'middle', 'font-size': 27, 'font-weight': 700, fill: warn ? C.warn : C.dark }); if (o.sub) T(g, bx + BW / 2, by + BH - 9, o.sub, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 500, fill: C.mute }) }) }
  place(bs.slice(0, up), -1); place(bs.slice(up), 1);
};
})();
