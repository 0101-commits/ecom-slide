/* pipe — 정책 전파 배관 : 마디(처음 · 끝 짙게) + 굵은 관 + 관 위 시차, (선택) 아래 두 번째 길, (선택) 효과가 보이는 때 간트 + 눈금
   nodes[{name,value,lag}](3~5개, lag = 앞 마디에서 이 마디까지 걸리는 시간 글자) · lane2{from,to,label,sub}(마디 번호 0부터, 곡선 관 + 가운데 상자)
   gantt{title,max,step,unit,bars:[{from,to,label,tone:'main|g65|g40|g18'}]} (1~5줄)
   움직임 : 마디 · 관 · 시차 차례로 → 두 번째 길 그림 → 상자 → 간트 막대 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var TONE = { main: C.main, g65: C.g65, g40: C.g40, g18: '#B9D9CD', dark: C.dark };
ECOM.parts.pipe = function (bd, s, ctx) {
  var root = ctx.root, svg = ctx.svg(512), nodes = s.nodes || [], n = nodes.length, l2 = s.lane2 || null, gt = s.gantt || null; if (n < 2) return;
  var NH = l2 ? 108 : 128, ny = l2 ? 156 : (gt ? 206 : 236), pad = 8, nw = Math.min(210, Math.floor((1168 - 2 * pad - (n - 1) * 96) / n)), gap = (1168 - 2 * pad - n * nw) / (n - 1), X = function (i) { return pad + i * (nw + gap) };
  nodes.forEach(function (o, i) { var x = X(i), dk = i === 0 || i === n - 1, g = h.at(svg, 150 + i * 350, { 'data-fx': 'pop', 'data-ms': 380 });
    E('rect', { x: x, y: ny - NH / 2, width: nw, height: NH, rx: 14, fill: dk ? C.dark : '#fff', stroke: dk ? 'none' : C.main, 'stroke-width': 2.5 }, g);
    var nm = h.wrap(o.name || '', 19, nw - 20, 1), vy = ny + 26; nm.forEach(function (ln, k) { T(g, x + nw / 2, ny - 12 - (nm.length - 1 - k) * 22 + (nm.length > 1 ? -2 : 0), ln, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: dk ? '#fff' : C.ink }) });
    T(g, x + nw / 2, vy, o.value || '', { 'text-anchor': 'middle', 'font-size': nw < 170 ? 25 : 28, 'font-weight': 700, fill: dk ? '#fff' : C.main }) });
  for (var i = 1; i < n; i++) { var xa = X(i - 1) + nw, xb = X(i), t = 300 + (i - 1) * 350, lg = nodes[i].lag;
    E('rect', { x: xa, y: ny - 9, width: xb - xa - 8, height: 18, fill: C.g40, 'data-at': t, 'data-fx': 'growx', 'data-ms': 360 }, svg);
    var g = h.at(svg, t + 100, { 'data-fx': 'fade', 'data-ms': 300 });
    E('path', { d: 'M' + (xb - 2) + ' ' + ny + ' L' + (xb - 18) + ' ' + (ny - 9) + ' L' + (xb - 18) + ' ' + (ny + 9) + ' Z', fill: C.main }, g);
    if (lg) T(g, (xa + xb) / 2, ny - 22, lg, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) }
  /* 두 번째 길 */
  if (l2 && n > 1) { var a = Math.max(0, Math.min(n - 1, l2.from || 0)), b = Math.min(n - 1, l2.to != null ? l2.to : n - 1), xa2 = X(a) + nw / 2, xb2 = X(b) + nw / 2, y0 = ny + NH / 2 + 4, yb = 326, r = Math.max(30, Math.min(250, (xb2 - xa2) / 2 - 40)), tl = 300 + n * 350;
    E('path', { d: 'M' + xa2 + ' ' + y0 + ' C' + xa2 + ' ' + yb + ', ' + (xa2 + r * .55) + ' ' + yb + ', ' + (xa2 + r) + ' ' + yb + ' L' + (xb2 - r) + ' ' + yb + ' C' + (xb2 - r * .55) + ' ' + yb + ', ' + xb2 + ' ' + yb + ', ' + xb2 + ' ' + (y0 + 14),
      fill: 'none', stroke: C.g65, 'stroke-width': 14, opacity: .55, 'data-at': tl, 'data-fx': 'draw', 'data-ms': 900 }, svg);
    var gh = h.at(svg, tl + 850, { 'data-fx': 'fade', 'data-ms': 160 }); E('path', { d: 'M' + xb2 + ' ' + (y0 - 2) + ' L' + (xb2 - 11) + ' ' + (y0 + 17) + ' L' + (xb2 + 11) + ' ' + (y0 + 17) + ' Z', fill: C.g65 }, gh);
    var bw = Math.min(320, Math.max(220, h.textW(l2.label || '', 15, 1) + 40, h.textW(l2.sub || '', 12.5) + 40)), cx = (xa2 + xb2) / 2, gb = h.at(svg, tl + 500, { 'data-fx': 'fade', 'data-ms': 360 });
    E('rect', { x: cx - bw / 2, y: yb - 28, width: bw, height: 56, rx: 12, fill: '#fff', stroke: C.g65, 'stroke-width': 2 }, gb);
    T(gb, cx, yb - 4, l2.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }); if (l2.sub) T(gb, cx, yb + 17, l2.sub, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 500, fill: C.mute }) }
  /* 간트 + 개월 눈금 */
  if (gt) { var bars = (gt.bars || []).slice(0, 5), nb = bars.length, mx = gt.max || 18, stp = gt.step || 3, un = gt.unit || '개월', x0 = 194, x1 = 1144, sy = 480, top = sy - 32 - (nb - 1) * 20, tg = 300 + n * 350 + (l2 ? 1400 : 300);
    var gg = h.at(svg, tg, { 'data-fx': 'fade', 'data-ms': 360 }); T(gg, 14, top - 12, gt.title || '효과가 보이는 때', { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    bars.forEach(function (o, i) { var y = top + i * 20, xs = x0 + (x1 - x0) * o.from / mx, w = (x1 - x0) * (o.to - o.from) / mx;
      T(gg, x0 - 12, y + 11, o.label || '', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 600, fill: C.cmp });
      E('rect', { x: xs, y: y, width: Math.max(4, w), height: 13, rx: 6, fill: TONE[o.tone] || [C.main, C.g65, C.g40, '#B9D9CD', '#B9D9CD'][i], 'data-at': tg + 300 + i * 150, 'data-fx': 'growx', 'data-ms': 420 }, svg) });
    E('line', { x1: x0, x2: x1, y1: sy, y2: sy, stroke: C.axis, 'stroke-width': 1.2 }, gg);
    for (var m = 0; m <= mx + 1e-6; m += stp) { var x = x0 + (x1 - x0) * m / mx; E('line', { x1: x, x2: x, y1: sy - 4, y2: sy + 4, stroke: C.axis }, gg); T(gg, x, sy + 22, h.nf(m, 0) + un, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 500, fill: C.mute }) } }
  root.setAttribute('data-gap', 300);
};
})();
