/* brbullet — 불릿(목표 · 실적) : 줄마다 넓은 구간 띠(3단 회색) 위에 가는 실적 막대 + 세로 목표 눈금
   rows[{label,actual,target,max,unit,sub}] 3~6개 · bands(구간 경계 비율 기본 [.6,.85,1]) · dec · tone(실적 막대가 목표 미달이면 자동 진회색, 달성이면 짙은 초록) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brbullet = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 6), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, bnd = s.bands || [.6, .85, 1];
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 19, 1)) }); var x0 = Math.ceil(lw) + 34, x1 = 900, W = x1 - x0, top = 34, pitch = (512 - top - 10) / n, bh = Math.min(48, pitch * .56);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); E('rect', { x: x0, y: 6, width: 16, height: 14, fill: C.gray }, g0); T(g0, x0 + 22, 18, '구간(짙을수록 목표 대비 낮은 구간)', { 'font-size': 12.5, fill: C.mute });
  E('rect', { x: x0 + 270, y: 8, width: 14, height: 10, rx: 2, fill: C.dark }, g0); T(g0, x0 + 290, 18, '실적', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink }); E('line', { x1: x0 + 340, x2: x0 + 340, y1: 4, y2: 22, stroke: C.warn, 'stroke-width': 4 }, g0); T(g0, x0 + 350, 18, '목표', { 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, mx = r.max || Math.max(r.actual, r.target) * 1.15, X = function (v) { return x0 + W * v / mx }, t0 = 120 + i * 200, g = h.at(svg, t0, { 'data-fx': 'fade' }), pct = 100 * r.actual / r.target, done = r.actual >= r.target;
    T(g, x0 - 18, cy - 2, r.label, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, x0 - 18, cy + 17, r.sub, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
    var shades = [C.light, C.gray, C.axis].reverse(), bb = [0].concat(bnd.map(function (b) { return b * r.target })); if (bnd[bnd.length - 1] < 1.5) bb.push(mx);
    var cuts = [r.target * bnd[0], r.target * bnd[1], mx]; var prev = 0; cuts.forEach(function (cv, j) { E('rect', { x: X(prev), y: cy - bh / 2, width: X(cv) - X(prev), height: bh, fill: [C.gray, C.light, C.paper][j], 'data-at': t0, 'data-fx': 'fade' }, svg); prev = cv });
    E('rect', { x: x0, y: cy - bh * .17, width: X(r.actual) - x0, height: bh * .34, rx: 2, fill: C.dark, 'data-at': t0 + 150, 'data-fx': 'growx', 'data-ms': 600 }, svg);
    E('rect', { x: X(r.target) - 2.5, y: cy - bh * .5 - 5, width: 5, height: bh + 10, fill: C.warn, 'data-at': t0 + 700, 'data-fx': 'pop' }, svg);
    var g2 = h.at(svg, t0 + 800, { 'data-fx': 'fade' }); T(g2, x1 + 24, cy - 2, h.nf(r.actual, dec) + (r.unit || ''), { 'font-size': 22, 'font-weight': 700, fill: C.ink }); T(g2, x1 + 24, cy + 19, '목표 ' + h.nf(r.target, dec) + (r.unit || '') + ' · ' + h.nf(pct, 0) + '%', { 'font-size': 13.5, fill: done ? C.dark : C.mute, 'font-weight': 700 }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
