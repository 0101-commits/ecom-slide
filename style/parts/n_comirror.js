/* comirror — 맞대결 거울 막대 : 두 기업 이름표 + 항목마다 왼쪽 · 오른쪽 막대(항목마다 자기 단위 · 자기 눈금) + 이긴 쪽 짙게 + 위 승패 집계
   a{name} · b{name} · rows[{label,unit,dec,a,b,low(true 면 작을수록 우위)}] 4~8행 · tally(아래 한 줄 글, 없으면 승수 자동) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.comirror = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 8), n = R.length; if (!n) return; var svg = ctx.svg(512), A = s.a || { name: 'A사' }, B = s.b || { name: 'B사' }, cw = 190, half = (1168 - cw) / 2, cxL = half, cxR = half + cw, top = 78, bot = 456, pitch = (bot - top) / n, bh = Math.min(30, pitch * .62), wa = 0, wb = 0;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  R.forEach(function (r) { var a = r.low ? r.a < r.b : r.a > r.b, b = r.low ? r.b < r.a : r.b > r.a; r._w = a ? 'a' : (b ? 'b' : ''); if (a) wa++; if (b) wb++ });
  E('rect', { x: 0, y: 0, width: cxL, height: 58, rx: 8, fill: C.dark }, g0); E('rect', { x: cxR, y: 0, width: half, height: 58, rx: 8, fill: C.cmp }, g0);
  T(g0, 24, 38, A.name, { 'font-size': 24, 'font-weight': 700, fill: '#fff' }); T(g0, 1168 - 24, 38, B.name, { 'text-anchor': 'end', 'font-size': 24, 'font-weight': 700, fill: '#fff' });
  T(g0, cxL - 24, 38, wa + '승', { 'text-anchor': 'end', 'font-size': 22, 'font-weight': 700, fill: C.on }); T(g0, cxR + 24, 38, wb + '승', { 'font-size': 22, 'font-weight': 700, fill: C.on }); T(g0, 584, 38, 'VS', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: C.dark });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, t0 = 120 + i * 140, g = h.at(svg, t0, { 'data-fx': 'fade' }), mx = Math.max(r.a, r.b), sc = (half - 112) / mx, wl = Math.max(3, r.a * sc), wr = Math.max(3, r.b * sc), dec = r.dec || 0;
    if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2, width: 1168, height: pitch, fill: C.paper }, g0);
    T(g, 584, cy - 2, r.label, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.ink }); T(g, 584, cy + 16, r.unit || '', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    E('rect', { x: cxL - wl - 0, y: cy - bh / 2, width: wl, height: bh, rx: 3, fill: r._w === 'a' ? C.dark : C.g40, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-o': '100% 50%', 'data-ms': 440 }, svg);
    E('rect', { x: cxR, y: cy - bh / 2, width: wr, height: bh, rx: 3, fill: r._w === 'b' ? C.cmp : C.gray, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-ms': 440 }, svg);
    var g2 = h.at(svg, t0 + 480, { 'data-fx': 'fade' }); T(g2, cxL - wl - 10, cy + 6, h.nf(r.a, dec), { 'text-anchor': 'end', 'font-size': 17, 'font-weight': r._w === 'a' ? 700 : 400, fill: r._w === 'a' ? C.dark : C.mute });
    T(g2, cxR + wr + 10, cy + 6, h.nf(r.b, dec), { 'font-size': 17, 'font-weight': r._w === 'b' ? 700 : 400, fill: r._w === 'b' ? C.cmp : C.mute });
    if (r._w) { var wx = r._w === 'a' ? 0 : 1168 - 40; E('rect', { x: wx, y: cy - 12, width: 40, height: 24, rx: 12, fill: r._w === 'a' ? C.dark : C.cmp }, g2); T(g2, wx + 20, cy + 5, '우위', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) } });
  var gt = h.at(svg, 120 + n * 140 + 300, { 'data-fx': 'rise' }); E('rect', { x: 0, y: 466, width: 1168, height: 42, rx: 8, fill: C.g08 }, gt); T(gt, 584, 494, s.tally || (A.name + ' ' + wa + '승 · ' + B.name + ' ' + wb + '승'), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.dark });
  ctx.root.setAttribute('data-gap', 300);
};
})();
