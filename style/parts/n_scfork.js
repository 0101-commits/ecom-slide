/* scfork — 갈림길 + 신호 지표 : 왼쪽은 '지금'에서 두 길로 갈라지는 길(굵기 = 가능성) + 길 끝 상자, 오른쪽은 미리 볼 지표 줄(현재 값 · 눈금 · 기준선 · 어느 길 쪽인지 꼬리표)
   now{label,sub} · forks[2]{name,sub,p(%),tone('main'|'warn'),short('연착륙 쪽')} (첫째 = 위 길 · 좋은 쪽, 둘째 = 아래 길)
   signals[≤4]{name,src,value,unit,dec,lo,hi,thr,thrLabel,badSide('below'|'above'),note} — badSide 쪽에 있으면 둘째 길 쪽 꼬리표(주황), 아니면 첫째 길 쪽
   움직임 : 길 → 끝 상자 → 지표 줄이 위에서부터 → 요약 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scfork = function (bd, s, ctx) {
  var svg = ctx.svg(512), F = (s.forks || []).slice(0, 2), SG = (s.signals || []).slice(0, 4), nw = s.now || {}; if (F.length < 2) return;
  var LX = 560, yA = 112, yB = 384, ym = 248, gr = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 300 });
  E('circle', { cx: 24, cy: ym, r: 15, fill: C.dark }, gr); E('circle', { cx: 24, cy: ym, r: 6, fill: '#fff' }, gr);
  T(gr, 0, ym + 46, nw.label || '지금', { 'font-size': 17, 'font-weight': 700, fill: C.ink }); if (nw.sub) T(gr, 0, ym + 66, nw.sub, { 'font-size': 13, fill: C.mute });
  F.forEach(function (f, i) { var y = i ? yB : yA, col = h.col(f.tone || (i ? 'warn' : 'main')), sw = 8 + (+f.p || 0) * .38, t = 300 + i * 500;
    E('path', { d: 'M40 ' + ym + ' H90 C190 ' + ym + ' 200 ' + y + ' 310 ' + y + ' H372', fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 800 }, svg);
    var g = h.at(svg, t + 700, { 'data-fx': 'fade', 'data-ms': 380 }), bx = 384, bw = LX - bx;
    E('rect', { x: bx, y: y - 62, width: bw, height: 124, rx: 12, fill: '#fff', stroke: col, 'stroke-width': 3 }, g);
    T(g, bx + 16, y - 26, f.name, { 'font-size': S.fit(f.name, 19, bw - 32, 1, 13), 'font-weight': 700, fill: C.ink });
    if (f.sub) S.wrapT(g, bx + 16, y - 6, f.sub, 13, bw - 32, { fill: C.mute }, 17);
    T(g, bx + 16, y + 46, h.nf(f.p, 0) + '%', { 'font-size': 32, 'font-weight': 700, fill: i ? C.warn : C.dark }); T(g, bx + bw - 16, y + 46, '가능성', { 'text-anchor': 'end', 'font-size': 13, fill: C.mute }) });
  var cnt = [0, 0], px = 626, pw = 1168 - px, rh = Math.min(118, 460 / Math.max(SG.length, 1)), g1 = h.at(svg, 600, { 'data-fx': 'fade', 'data-ms': 300 });
  T(g1, px, 22, '미리 볼 지표', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
  E('line', { x1: LX + 30, x2: LX + 30, y1: 6, y2: 506, stroke: C.line }, g1);
  SG.forEach(function (sg, i) { var y = 40 + i * rh, g = h.at(svg, 800 + i * 380, { 'data-fx': 'fade', 'data-ms': 360 }), v = +sg.value, bad = sg.badSide === 'above' ? v > sg.thr : v < sg.thr, dec = sg.dec != null ? sg.dec : 1; cnt[bad ? 1 : 0]++;
    if (i) E('line', { x1: px, x2: 1168, y1: y, y2: y, stroke: C.line }, g);
    T(g, px, y + 28, sg.name, { 'font-size': 16, 'font-weight': 700, fill: C.ink }); if (sg.src) T(g, px, y + 47, sg.src, { 'font-size': 12, fill: C.mute });
    T(g, px, y + 88, h.nf(v, dec) + (sg.unit || ''), { 'font-size': 30, 'font-weight': 700, fill: bad ? C.warn : C.dark });
    var gx0 = px + 190, gx1 = px + 190 + 250, X = h.lin(sg.lo, sg.hi, gx0, gx1), gy = y + 58, tx = X(sg.thr), bx0 = sg.badSide === 'above' ? tx : gx0, bx1 = sg.badSide === 'above' ? gx1 : tx;
    E('rect', { x: gx0, y: gy - 7, width: gx1 - gx0, height: 14, rx: 7, fill: C.g18 }, g);
    E('rect', { x: bx0, y: gy - 7, width: bx1 - bx0, height: 14, rx: sg.badSide === 'above' ? 0 : 0, fill: C.warnsoft, stroke: C.warn, 'stroke-width': 1 }, g);
    E('line', { x1: tx, x2: tx, y1: gy - 15, y2: gy + 15, stroke: C.ink, 'stroke-width': 2 }, g);
    T(g, tx, gy + 32, sg.thrLabel || ('기준 ' + h.nf(sg.thr, dec)), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.sub });
    T(g, gx0, gy - 20, h.nf(sg.lo, dec === 0 ? 0 : (sg.lo % 1 ? dec : 0)), { 'font-size': 11.5, fill: C.mute }); T(g, gx1, gy - 20, h.nf(sg.hi, sg.hi % 1 ? dec : 0), { 'text-anchor': 'end', 'font-size': 11.5, fill: C.mute });
    var mx = Math.max(gx0 + 6, Math.min(gx1 - 6, X(v))); h.tri(g, mx, gy - 12, false, 8, bad ? C.warn : C.dark);
    S.chip(g, 1168 - 96, y + 38, 96, 28, bad ? F[1].short || '아래 길 쪽' : F[0].short || '위 길 쪽', bad ? C.warn : C.g18, bad ? '#fff' : C.dark, 13) });
  var gs = h.at(svg, 800 + SG.length * 380 + 300, { 'data-fx': 'fade', 'data-ms': 420 }), sm = '지표 ' + SG.length + '개 중 ' + (F[0].short || '위 길 쪽') + ' ' + cnt[0] + '개 · ' + (F[1].short || '아래 길 쪽') + ' ' + cnt[1] + '개';
  T(gs, LX / 2, 500, sm, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink });
  ctx.root.setAttribute('data-gap', 300);
};
})();
