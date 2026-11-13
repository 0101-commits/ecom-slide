/* scshift — 확률 전후 쌓기 : 사건 전 · 후 100% 기둥 두 개를 띠로 이어 칸마다 몫이 어디서 늘고 줄었는지. 왼쪽 이름 · 전 몫, 오른쪽 후 몫 · 변화 꼬리표
   before{title,sub} · after{title,sub} · items[{name,a,b,tone}](위에서 아래 쌓기 순서, 합 100) · unit('%') · dunit('%p') · event{text}(가운데 위 사건 글)
   움직임 : 전 기둥 → 띠 → 후 기둥 → 변화 꼬리표 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scshift = function (bd, s, ctx) {
  var it = (s.items || []).slice(0, 5), n = it.length; if (!n) return; var svg = ctx.svg(512), u = s.unit || '%', du = s.dunit || '%p', dec = s.dec || 0;
  var AX = 340, AW = 150, BX = 780, BW = 150, y0 = 66, H = 410, ta = it.reduce(function (a, q) { return a + q.a }, 0) || 100, tb = it.reduce(function (a, q) { return a + q.b }, 0) || 100;
  var ya = [], yb = [], ca = y0, cb = y0; it.forEach(function (q) { var ha = H * q.a / ta, hb = H * q.b / tb; ya.push([ca, ca + ha]); yb.push([cb, cb + hb]); ca += ha; cb += hb });
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  T(g0, AX + AW / 2, 22, s.before && s.before.title || '이전', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (s.before && s.before.sub) T(g0, AX + AW / 2, 42, s.before.sub, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
  T(g0, BX + BW / 2, 22, s.after && s.after.title || '이후', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (s.after && s.after.sub) T(g0, BX + BW / 2, 42, s.after.sub, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
  it.forEach(function (q, i) { var col = h.col(q.tone || ['dark', 'g65', 'g40', 'gray', 'cmp'][i]), g = h.at(svg, 200 + i * 90, { 'data-fx': 'fade', 'data-ms': 360 }), ha = ya[i][1] - ya[i][0], tc = (q.tone === 'g40' || q.tone === 'gray') ? C.ink : '#fff';
    E('rect', { x: AX, y: ya[i][0] + 1, width: AW, height: ha - 2, fill: col }, g);
    T(g, AX - 18, ya[i][0] + ha / 2 - 2, q.name, { 'text-anchor': 'end', 'font-size': S.fit(q.name, 17, AX - 34, 1, 13), 'font-weight': 700, fill: C.ink });
    T(g, AX - 18, ya[i][0] + ha / 2 + 20, h.nf(q.a, dec) + u, { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: col === C.gray || q.tone === 'g40' ? C.cmp : col });
    var rp = [['M' + (AX + AW) + ' ' + (ya[i][0] + 1)], ['L' + BX + ' ' + (yb[i][0] + 1)], ['L' + BX + ' ' + (yb[i][1] - 1)], ['L' + (AX + AW) + ' ' + (ya[i][1] - 1)], ['Z']];
    var xm = (AX + AW + BX) / 2; E('path', { d: 'M' + (AX + AW) + ' ' + (ya[i][0] + 1) + ' C' + xm + ' ' + (ya[i][0] + 1) + ' ' + xm + ' ' + (yb[i][0] + 1) + ' ' + BX + ' ' + (yb[i][0] + 1) + ' L' + BX + ' ' + (yb[i][1] - 1) + ' C' + xm + ' ' + (yb[i][1] - 1) + ' ' + xm + ' ' + (ya[i][1] - 1) + ' ' + (AX + AW) + ' ' + (ya[i][1] - 1) + ' Z', fill: col, 'fill-opacity': .3, 'data-at': 900 + i * 90, 'data-fx': 'fade', 'data-ms': 500 }, svg);
    var gb = h.at(svg, 1500 + i * 90, { 'data-fx': 'fade', 'data-ms': 360 }), hb = yb[i][1] - yb[i][0], d = q.b - q.a;
    E('rect', { x: BX, y: yb[i][0] + 1, width: BW, height: hb - 2, fill: col }, gb);
    var cy = yb[i][0] + hb / 2; T(gb, BX + BW + 18, cy + 7, h.nf(q.b, dec) + u, { 'font-size': 24, 'font-weight': 700, fill: C.ink });
    S.chip(gb, BX + BW + 100, cy - 14, 90, 28, (d >= 0 ? '▲ +' : '▼ −') + h.nf(Math.abs(d), dec) + du, d >= 0 ? C.g18 : C.paper, d >= 0 ? C.dark : C.cmp, 14, { stroke: d >= 0 ? C.g65 : C.axis }) });
  if (s.event) { var ge = h.at(svg, 700, { 'data-fx': 'fade', 'data-ms': 400 }), ex = (AX + AW + BX) / 2, ew = h.textW(s.event.text, 14, 1) + 28;
    E('rect', { x: ex - ew / 2, y: 8, width: ew, height: 32, rx: 16, fill: C.ink }, ge); T(ge, ex, 29, s.event.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
