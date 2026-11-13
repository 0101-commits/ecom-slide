/* cz 계열(인과 사슬 · 흐름도 4판) 공통 도움 — ECOM.cz : 줄바꿈 글 · 화살 · 이름표(칩) · 상자
   이름순으로 cz_*.js 보다 먼저 붙음. 형식 = style/SCHEMA4_F05.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var Z = ECOM.cz = {};
/* 줄바꿈 글(가운데 기본) — 줄 수를 돌려줌. o{anchor,bold,fill,lh} */
Z.tx = function (g, x, y, s, size, w, o) { o = o || {}; var bd = o.bold === false ? 0 : 1, L = h.wrap(String(s == null ? '' : s).replace(/\*\*/g, ''), size, w, bd), lh = o.lh || Math.round(size * 1.32);
  L.forEach(function (l, i) { T(g, x, y + i * lh, l, { 'text-anchor': o.anchor || 'middle', 'font-size': size, 'font-weight': bd ? 700 : 500, fill: o.fill || C.ink }) }); return L.length };
Z.nl = function (s, size, w, bold) { return h.wrap(String(s == null ? '' : s).replace(/\*\*/g, ''), size, w, bold === false ? 0 : 1).length };
/* 선 + 화살촉 — (x1,y1) → (x2,y2). at(ms) 있으면 그려지는 쌓기 */
Z.arr = function (svg, x1, y1, x2, y2, col, w, at, o) { o = o || {}; w = w || 3; var hs = o.head || (7 + w * 1.6), ang = Math.atan2(y2 - y1, x2 - x1), ex = x2 - Math.cos(ang) * hs * .8, ey = y2 - Math.sin(ang) * hs * .8;
  var a = { x1: x1, y1: y1, x2: ex, y2: ey, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || null };
  if (at != null && !o.dash) { a['data-at'] = at; a['data-fx'] = 'draw'; a['data-ms'] = o.ms || 380 } else if (at != null) { a['data-at'] = at; a['data-fx'] = 'fade'; a['data-ms'] = 300 }
  E('line', a, svg); ECOM.kx.head(svg, x2, y2, ang, col, hs, at != null ? { 'data-at': at + (o.ms || 380) - 60, 'data-fx': 'fade', 'data-ms': 160 } : null) };
/* 이름표 : 둥근 흰 상자 + 글(가운데 cx,cy) — 너비를 돌려줌 */
Z.chip = function (g, cx, cy, s, size, o) { o = o || {}; size = size || 13; var w = Math.max(o.min || 0, h.textW(s, size, 1) + 18), hh = size + 11;
  E('rect', { x: cx - w / 2, y: cy - hh / 2, width: w, height: hh, rx: hh / 2, fill: o.fill || '#fff', stroke: o.stroke || C.g65, 'stroke-width': o.sw || 1.6 }, g);
  T(g, cx, cy + size * .36, s, { 'text-anchor': 'middle', 'font-size': size, 'font-weight': 700, fill: o.color || C.dark }); return w };
/* 둥근 상자 */
Z.box = function (g, x, y, w, hh, o) { o = o || {}; return E('rect', { x: x, y: y, width: w, height: hh, rx: o.rx == null ? 14 : o.rx, fill: o.fill || '#fff', stroke: o.stroke || 'none', 'stroke-width': o.sw || 2, 'stroke-dasharray': o.dash || null, opacity: o.op }, g) };
/* 숫자 글자 : 부호 포함 */
Z.f = function (v, d, o) { return h.nf(v, d == null ? 1 : d, o) };
})();
