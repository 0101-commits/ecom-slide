/* stscale — 표현 번역 척도 : 완곡한 말(왼쪽) → 실제로 걸린 기간 범위 막대(오른쪽 눈금), 긴 말일수록 짙은 막대
   phrases[{text,en,lo,hi,note}] 3~6줄(lo~hi 는 기간 숫자) · unit('개월') · max · step · axisTitle · concl */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stscale = function (bd, s, ctx) {
  var ph = (s.phrases || []).slice(0, 6), n = ph.length; if (!n) return; var svg = ctx.svg(512), unit = s.unit || '개월', mx = s.max || Math.max.apply(null, ph.map(function (p) { return p.hi })), step = s.step || 6;
  var LW = 330, x0 = 350, x1 = 1000, top = 50, bot = s.band ? 396 : 452, rh = (bot - top) / n, X = function (v) { return x0 + (x1 - x0) * v / mx };
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  for (var v = 0; v <= mx + .001; v += step) { E('line', { x1: X(v), x2: X(v), y1: top - 6, y2: bot + 6, stroke: v ? C.grid : C.axis, 'stroke-dasharray': v ? '3 4' : null }, g0); T(g0, X(v), bot + 28, h.nf(v, 0), { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute }) }
  T(g0, x1, bot + 52, s.axisTitle || ('걸린 기간(' + unit + ')'), { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  T(g0, 0, 28, '발표문의 표현', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(g0, x0, 28, '실제로 걸린 기간', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  var PAL = [C.g40, C.g65, C.main, C.dark, C.cmp, C.ink];
  ph.forEach(function (p, i) { var cy = top + rh * i + rh / 2, g = h.at(svg, 250 + i * 330, { 'data-fx': 'rise', 'data-ms': 380 }), bh = Math.min(34, rh - 18);
    if (i % 2 === 0) E('rect', { x: 0, y: top + rh * i + 3, width: 1168, height: rh - 6, rx: 8, fill: C.paper }, g);
    T(g, 16, cy + (p.en ? -2 : 6), p.text || '', { 'font-size': u.fit(p.text || '', 19, LW - 30, 1, 14), 'font-weight': 700, fill: C.ink });
    if (p.en) T(g, 16, cy + 18, p.en, { 'font-size': 12.5, 'font-weight': 500, fill: C.mute });
    var xa = X(p.lo), xb = X(p.hi); E('rect', { x: xa, y: cy - bh / 2, width: Math.max(8, xb - xa), height: bh, rx: bh / 2, fill: PAL[Math.min(PAL.length - 1, Math.round(i * (PAL.length - 1) / Math.max(1, n - 1)))], 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 520 }, g);
    var lab = (p.lo === p.hi ? h.nf(p.lo, 0) : h.nf(p.lo, 0) + '~' + h.nf(p.hi, 0)) + unit, lw = h.textW(lab, 14, 1);
    T(g, xb + 10, cy + 5, lab, { 'font-size': 14, 'font-weight': 700, fill: C.dark });
    if (p.note) T(g, xb + 10 + lw + 12, cy + 5, p.note, { 'font-size': 12.5, 'font-weight': 500, fill: C.mute }) });
  if (s.band) { var gc = h.at(svg, 400 + n * 330, { 'data-fx': 'fade' }); u.box(gc, 0, 452, 1168, 56, C.paper, { rx: 10 }); u.rich(gc, 22, 486, s.band, 16.5, 1124, { fill: C.cmp, min: 13 }) }
};
})();
