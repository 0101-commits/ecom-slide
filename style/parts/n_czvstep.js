/* czvstep — 세로 인과 계단 : 원인이 위, 결과가 아래로 한 칸씩 오른쪽으로 내려가고, 단마다 오른쪽에 근거 숫자 카드
   steps[3~5]{tag,title,sub,ev{value,label,note}} · evTitle(오른쪽 위 머리글, 선택) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czvstep = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.steps || []).slice(0, 5), n = st.length; if (n < 2) return;
  var SH = n > 4 ? 76 : 88, pitch = (512 - 24 - SH - (s.evTitle ? 22 : 0)) / (n - 1), y0 = 8 + (s.evTitle ? 22 : 0), off = n > 4 ? 44 : 58, SW = 470, EX = 744, EW = 424;
  if (s.evTitle) T(h.at(svg, 150, { 'data-fx': 'fade', 'data-ms': 300 }), EX, 18, s.evTitle, { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  st.forEach(function (o, k) { var x = k * off, y = y0 + k * pitch, t = 250 + k * 700, last = k === n - 1, g = h.at(svg, t, { 'data-fx': 'drop', 'data-dy': 40, 'data-ms': 460 });
    if (k) Z.arr(svg, x + off / 2 + 28, y0 + (k - 1) * pitch + SH + 3, x + off / 2 + 28, y - 3, C.g65, 4, t - 150, { head: 13, ms: 200 });
    Z.box(g, x, y, SW, SH, { fill: last ? C.dark : (k % 2 ? '#F3F8F5' : C.g08), stroke: last ? 'none' : C.g40, sw: 1.6, rx: 14 });
    E('rect', { x: x + 14, y: y + SH / 2 - 17, width: 74, height: 34, rx: 8, fill: last ? C.g18 : C.g65 }, g); T(g, x + 51, y + SH / 2 + 5.5, o.tag || String(k + 1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: last ? C.dark : '#fff' });
    var tw = SW - 112, nl = Z.nl(o.title || '', 17, tw), sl = o.sub ? Z.nl(o.sub, 13, tw, false) : 0, tot = nl * 22 + (sl ? sl * 17 + 3 : 0), ty = y + (SH - tot) / 2 + 17; Z.tx(g, x + 102, ty, o.title || '', 17, tw, { anchor: 'start', fill: last ? '#fff' : C.ink, lh: 22 });
    if (o.sub) Z.tx(g, x + 102, ty + nl * 22 + 1, o.sub, 13, tw, { anchor: 'start', bold: false, fill: last ? '#CDE9DD' : C.mute, lh: 17 });
    var ev = o.ev || {}, ge = h.at(svg, t + 380, { 'data-fx': 'left', 'data-ms': 420 }), ys = y + SH / 2;
    E('line', { x1: x + SW + 6, x2: EX - 6, y1: ys, y2: ys, stroke: C.g40, 'stroke-width': 2.2, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round' }, ge);
    Z.box(ge, EX, y, EW, SH, { fill: '#fff', stroke: last ? C.dark : C.main, sw: last ? 3 : 2, rx: 14 });
    T(ge, EX + 22, y + SH / 2 + 12, ev.value || '', { 'font-size': 34, 'font-weight': 700, fill: C.dark }); var vw = h.textW(ev.value || '', 34, 1) + 40; Z.tx(ge, EX + vw, y + 34, ev.label || '', 14.5, EW - vw - 14, { anchor: 'start', fill: C.ink, lh: 19 });
    if (ev.note) Z.tx(ge, EX + vw, y + 34 + Z.nl(ev.label || '', 14.5, EW - vw - 14) * 19 + 2, ev.note, 12.5, EW - vw - 14, { anchor: 'start', bold: false, fill: C.mute, lh: 16 }) });
};
})();
