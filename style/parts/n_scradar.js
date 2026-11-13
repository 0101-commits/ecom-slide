/* scradar — 레이더(거미줄) + 값 표 : 왼쪽은 항목 5~6개 레이더(나라 둘 · 셋 겹침), 오른쪽은 항목별 실제 값 표
   axes[{name,sub}] 5~6개 · series[{name,tone,vals:[0~100 …],raw:[글자 …]}] 2~3개 · ringText(['낮음','높음']) · tableTitle
   움직임 : 거미줄 → 나라마다 면이 펼쳐짐 → 오른쪽 표 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scradar = function (bd, s, ctx) {
  var svg = ctx.svg(512), A = (s.axes || []).slice(0, 6), SE = (s.series || []).slice(0, 3), n = A.length; if (n < 3 || !SE.length) return;
  var cx = 292, cy = 262, R = 176, ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / n }, pt = function (i, r) { return [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))] };
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 380 });
  [25, 50, 75, 100].forEach(function (p) { E('path', { d: 'M' + A.map(function (_, i) { return pt(i, R * p / 100).join(' ') }).join(' L') + ' Z', fill: p === 100 ? C.paper : 'none', stroke: p === 100 ? C.axis : C.grid, 'stroke-dasharray': p === 100 ? null : '3 4' }, g0) });
  A.forEach(function (a, i) { var p = pt(i, R), q = pt(i, R + 26), c = Math.cos(ang(i)), an = c > .3 ? 'start' : c < -.3 ? 'end' : 'middle';
    E('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: C.grid }, g0); var ty = q[1] + (Math.sin(ang(i)) > .3 ? 14 : Math.sin(ang(i)) < -.3 ? -8 : 4);
    T(g0, q[0] + (an === 'start' ? 6 : an === 'end' ? -6 : 0), ty, a.name, { 'text-anchor': an, 'font-size': 14.5, 'font-weight': 700, fill: C.ink }); if (a.sub) T(g0, q[0] + (an === 'start' ? 6 : an === 'end' ? -6 : 0), ty + 16, a.sub, { 'text-anchor': an, 'font-size': 12, fill: C.mute }) });
  var rt = s.ringText || ['낮음', '높음']; T(g0, cx + 6, cy - 4, rt[0], { 'font-size': 11.5, fill: C.axis }); T(g0, cx + 6, cy - R + 14, rt[1], { 'font-size': 11.5, fill: C.axis });
  SE.forEach(function (se, k) { var col = h.col(se.tone || ['dark', 'g65', 'cmp'][k]), t = 500 + k * 700, P = se.vals.map(function (v, i) { return pt(i, R * Math.max(v, 3) / 100) });
    var d = 'M' + P.map(function (p) { return p[0] + ' ' + p[1] }).join(' L') + ' Z', g = h.at(svg, t, { 'data-fx': 'pop', 'data-ms': 700 }); g.style.transformOrigin = cx + 'px ' + cy + 'px';
    E('path', { d: d, fill: col, 'fill-opacity': .16, stroke: col, 'stroke-width': k === 0 ? 3.4 : 2.6, 'stroke-linejoin': 'round' }, g); P.forEach(function (p) { E('circle', { cx: p[0], cy: p[1], r: k === 0 ? 5 : 4, fill: col, stroke: '#fff', 'stroke-width': 1.5 }, g) }) });
  var tx = 620, tw = 1168 - tx, gt = h.at(svg, 500 + SE.length * 700, { 'data-fx': 'fade', 'data-ms': 420 }), c0 = tx + 150, cwd = (1168 - c0) / SE.length, hh = 54, rh = (512 - hh - 12) / n;
  T(gt, tx, 24, s.tableTitle || '실제 값', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  SE.forEach(function (se, k) { var col = h.col(se.tone || ['dark', 'g65', 'cmp'][k]), x = c0 + k * cwd + cwd / 2; E('circle', { cx: x - h.textW(se.name, 17, 1) / 2 - 12, cy: 20, r: 7, fill: col }, gt); T(gt, x, 26, se.name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.ink }) });
  E('line', { x1: tx, x2: 1168, y1: hh - 8, y2: hh - 8, stroke: C.ink, 'stroke-width': 1.5 }, gt);
  A.forEach(function (a, i) { var y = hh + i * rh; if (i % 2 === 0) E('rect', { x: tx, y: y + 1, width: tw, height: rh - 2, rx: 6, fill: C.paper }, gt);
    T(gt, tx + 10, y + rh / 2 + (a.sub ? 0 : 6), a.name, { 'font-size': 15, 'font-weight': 700, fill: C.ink }); if (a.sub) T(gt, tx + 10, y + rh / 2 + 17, a.sub, { 'font-size': 12, fill: C.mute });
    SE.forEach(function (se, k) { T(gt, c0 + k * cwd + cwd / 2, y + rh / 2 + 7, se.raw[i], { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: k === 0 ? C.dark : C.ink }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
