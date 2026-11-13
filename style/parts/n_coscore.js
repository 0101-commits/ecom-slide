/* coscore — 기업 점수표 : 항목(행) × 기업(열)을 ○ ◐ ● 로 채우고, 아래 합계(● 2점 · ◐ 1점 · ○ 0점)를 막대로. 강조 기업 열은 연한 초록 바탕
   firms[이름…] 2~5곳 · hero(번호, 기본 0) · rows[{label,sub,lv[기업마다 0|1|2]}] 4~8행 · totalTitle('종합 점수') · legend['우수','보통','미흡'] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function ball(g, cx, cy, r, lv, col) { E('circle', { cx: cx, cy: cy, r: r, fill: lv === 2 ? col : '#fff', stroke: col, 'stroke-width': 2.2 }, g);
  if (lv === 1) E('path', { d: 'M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + ' Z', fill: col }, g) }
ECOM.parts.coscore = function (bd, s, ctx) {
  var F = (s.firms || []).slice(0, 5), nf = F.length, R = (s.rows || []).slice(0, 8), nr = R.length; if (!nf || !nr) return; var svg = ctx.svg(512), hero = s.hero != null ? s.hero : 0, lw = 330, cw = (1168 - lw) / nf, hh = 60, tb = 410, rh = (tb - hh) / nr;
  var tot = F.map(function (f, j) { return R.reduce(function (a, r) { return a + (r.lv[j] || 0) }, 0) }), mxs = 2 * nr, best = Math.max.apply(null, tot);
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); E('rect', { x: lw + hero * cw, y: 0, width: cw, height: 512, rx: 8, fill: C.g08 }, g0);
  F.forEach(function (f, j) { var on = j === hero; T(g0, lw + cw * j + cw / 2, 36, f, { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: on ? C.dark : C.ink }) }); E('line', { x1: 0, x2: 1168, y1: hh, y2: hh, stroke: C.cmp, 'stroke-width': 1.6 }, g0);
  R.forEach(function (r, i) { var y = hh + i * rh, cy = y + rh / 2, t0 = 140 + i * 150, g = h.at(svg, t0, { 'data-fx': 'fade' }); if (i) E('line', { x1: 0, x2: 1168, y1: y, y2: y, stroke: C.line }, g);
    T(g, 12, cy + (r.sub ? -2 : 6), r.label, { 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (r.sub) T(g, 12, cy + 17, r.sub, { 'font-size': 13, fill: C.mute });
    F.forEach(function (f, j) { var on = j === hero, g2 = h.at(svg, t0 + 80 + j * 60, { 'data-fx': 'pop', 'data-ms': 300 }); ball(g2, lw + cw * j + cw / 2, cy, 15, r.lv[j] || 0, on ? C.dark : C.cmp) }) });
  var gt = h.at(svg, 140 + nr * 150 + 200, { 'data-fx': 'rise' }); E('line', { x1: 0, x2: 1168, y1: tb, y2: tb, stroke: C.cmp, 'stroke-width': 1.6 }, gt); T(gt, 12, tb + 36, s.totalTitle || '종합 점수', { 'font-size': 18, 'font-weight': 700, fill: C.ink }); T(gt, 12, tb + 56, '● 2점 · ◐ 1점 · ○ 0점, ' + mxs + '점 만점', { 'font-size': 13, fill: C.mute });
  F.forEach(function (f, j) { var on = j === hero, x = lw + cw * j + 22, bw = cw - 44, top = tot[j] === best;
    T(gt, x, tb + 46, String(tot[j]), { 'font-size': 34, 'font-weight': 700, fill: on ? C.dark : C.ink }); T(gt, x + h.textW(String(tot[j]), 34, 1) + 4, tb + 46, '/' + mxs + '점', { 'font-size': 15, fill: C.mute });
    if (top) { E('rect', { x: x + bw - 44, y: tb + 20, width: 44, height: 26, rx: 13, fill: C.dark }, gt); T(gt, x + bw - 22, tb + 38, '최고', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) }
    E('rect', { x: x, y: tb + 62, width: bw, height: 12, rx: 6, fill: C.well }, gt); E('rect', { x: x, y: tb + 62, width: bw * tot[j] / mxs, height: 12, rx: 6, fill: on ? C.dark : C.g65, 'data-at': 140 + nr * 150 + 500, 'data-fx': 'growx', 'data-ms': 460 }, svg) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
