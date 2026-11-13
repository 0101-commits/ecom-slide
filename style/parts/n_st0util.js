/* st 계열 공통 도움(ECOM.stu) — F10 구조 목업 부품들이 같이 씀 : fit · box · chip · rich · lines · arrow */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu = {};
u.fit = function (s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size };
u.box = function (p, x, y, w, hh, fill, o) { o = o || {}; var a = { x: x, y: y, width: w, height: hh, rx: o.rx == null ? 12 : o.rx, fill: fill };
  if (o.stroke) { a.stroke = o.stroke; a['stroke-width'] = o.sw || 1.5; if (o.dash) a['stroke-dasharray'] = o.dash } return E('rect', a, p) };
u.chip = function (p, cx, cy, text, fill, color, size) { size = size || 12.5; var w = h.textW(text, size, 1) + 20;
  E('rect', { x: cx - w / 2, y: cy - 11.5, width: w, height: 23, rx: 11.5, fill: fill }, p);
  T(p, cx, cy + 4.5, text, { 'text-anchor': 'middle', 'font-size': size, 'font-weight': 700, fill: color || '#fff' }); return w };
u.rich = function (p, x, y, str, size, maxW, o) { o = o || {}; var plain = String(str).split('**').join(''); size = u.fit(plain, size, maxW, 0, o.min || 12);
  var a = { x: x, y: y, 'font-size': size, fill: o.fill || C.cmp }; if (o.anchor) a['text-anchor'] = o.anchor; var t = E('text', a, p);
  String(str).split('**').forEach(function (s, i) { if (!s) return; var ts = E('tspan', i % 2 ? { 'font-weight': 700, fill: o.bold || C.dark } : {}, t); ts.textContent = s }); return t };
u.lines = function (p, x, y, str, size, maxW, o) { o = o || {}; var L = h.wrap(str, size, maxW, o.bold), lh = o.lh || 1.4;
  L.forEach(function (l, i) { T(p, x, y + i * size * lh, l, { 'font-size': size, 'font-weight': o.bold ? 700 : 500, fill: o.fill || C.cmp, 'text-anchor': o.anchor || 'start' }) }); return L.length };
u.arrow = function (p, x0, y0, x1, y1, col, w) { col = col || C.dark; w = w || 1.8; E('line', { x1: x0, y1: y0, x2: x1, y2: y1, stroke: col, 'stroke-width': w }, p);
  var a = Math.atan2(y1 - y0, x1 - x0), L = 9, d = 'M' + (x1 - L * Math.cos(a - .45)) + ' ' + (y1 - L * Math.sin(a - .45)) + ' L' + x1 + ' ' + y1 + ' L' + (x1 - L * Math.cos(a + .45)) + ' ' + (y1 - L * Math.sin(a + .45));
  E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': w }, p) };
})();
