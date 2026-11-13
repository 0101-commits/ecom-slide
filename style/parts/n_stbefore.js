/* stbefore — 제도 전후 표 : 항목 · 개편 전 · 개편 후 3열, 바뀐 줄만 오른쪽 칸이 연초록 + 「변경」 칩 + 화살표, 안 바뀐 줄은 연한 회색
   cols{item,before,after} · rows[{item,before,after,changed}] 3~7줄 · summary(오른쪽 위 글, 기본 「바뀐 줄 N / M」) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stbefore = function (bd, s, ctx) {
  var rows = (s.rows || []).slice(0, 7), n = rows.length; if (!n) return; var svg = ctx.svg(512), cols = s.cols || {}, cn = rows.filter(function (r) { return r.changed }).length;
  var xi = 0, wi = 300, xb = 312, wb = 380, xa = 704, wa = 464, hy = 50, gap = 8, rh = (512 - hy - 10 - (n - 1) * gap) / n;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  u.chip(g0, xb + wb / 2, 24, cols.before || '개편 전', C.gray, C.cmp, 14); u.chip(g0, xa + wa / 2, 24, cols.after || '개편 후', C.main, '#fff', 14);
  T(g0, xi, 30, cols.item || '항목', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  var sm = s.summary || ('바뀐 줄 ' + cn + ' / ' + n); T(g0, 1168, 30, sm, { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.dark });
  rows.forEach(function (r, i) { var y = hy + 10 + i * (rh + gap), ch = !!r.changed, g = h.at(svg, 200 + i * 170, { 'data-fx': 'rise', 'data-ms': 360 });
    T(g, xi + 4, y + rh / 2 + 5.5, r.item || '', { 'font-size': u.fit(r.item || '', 17, wi - 10, 1, 13), 'font-weight': 700, fill: C.ink });
    u.box(g, xb, y, wb, rh, C.paper, { rx: 10 });
    T(g, xb + 20, y + rh / 2 + 5, r.before || '', { 'font-size': u.fit(r.before || '', 16, wb - 40, 0, 12), 'font-weight': 500, fill: ch ? C.mute : C.cmp, 'text-decoration': ch ? 'line-through' : null });
    if (!ch) { u.box(g, xa, y, wa, rh, C.paper, { rx: 10 }); T(g, xa + 20, y + rh / 2 + 5, r.after || '', { 'font-size': u.fit(r.after || '', 16, wa - 40, 0, 12), 'font-weight': 500, fill: C.mute }) } });
  rows.forEach(function (r, i) { if (!r.changed) return; var y = hy + 10 + i * (rh + gap), g = h.at(svg, 200 + n * 170 + i * 200, { 'data-fx': 'pop', 'data-ms': 380 });
    u.box(g, xa, y, wa, rh, C.g18, { rx: 10, stroke: C.main, sw: 2 });
    T(g, xa + 20, y + rh / 2 + 6, r.after || '', { 'font-size': u.fit(r.after || '', 18, wa - 110, 1, 13), 'font-weight': 700, fill: C.dark });
    u.chip(g, xa + wa - 40, y + rh / 2, '변경', C.main, '#fff', 12.5);
    u.arrow(g, xb + wb + 2, y + rh / 2, xa - 3, y + rh / 2, C.main, 2.2) });
};
})();
