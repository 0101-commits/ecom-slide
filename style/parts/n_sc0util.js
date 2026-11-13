/* sc 묶음(시나리오 · 찬반 · 나라 비교) 공통 도움 — ECOM.sc : fit(글 줄여 맞춤) · mix · ramp(연한→짙은 초록) · chip(둥근 꼬리표) · wrapT(줄바꿈 글) · uid */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, nu = 0;
function fit(s, size, maxW, bold, min) { while (size > (min || 12) && h.textW(s, size, bold) > maxW) size -= .5; return size }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] }
function mix(a, b, t) { var p = hex(a), q = hex(b); return 'rgb(' + p.map(function (v, i) { return Math.round(v + (q[i] - v) * t) }).join(',') + ')' }
function ramp(t) { t = Math.max(0, Math.min(1, t)); return t < .5 ? mix('#F1F7F4', C.g40, t * 2) : mix(C.g40, C.dark, (t - .5) * 2) }
function chip(g, x, y, w, hh, txt, fill, col, size, o) { o = o || {}; E('rect', { x: x, y: y, width: w, height: hh, rx: o.rx != null ? o.rx : hh / 2, fill: fill, stroke: o.stroke || 'none', 'stroke-width': o.stroke ? 1.5 : 0 }, g);
  return T(g, x + w / 2, y + hh / 2 + (size || 13) * .36, txt, { 'text-anchor': 'middle', 'font-size': size || 13, 'font-weight': 700, fill: col || '#fff' }) }
/* 줄바꿈 글 : 글 · 왼쪽 x · 첫 줄 y · 크기 · 최대 폭 · 속성 · 줄 간격 → 마지막 줄 아래 y 와 줄 수 */
function wrapT(g, x, y, txt, size, maxW, a, lh) { var L = h.wrap(txt, size, maxW, a && a['font-weight'] === 700); lh = lh || size * 1.32;
  L.forEach(function (t, i) { T(g, x, y + i * lh, t, Object.assign({ 'font-size': size }, a || {})) }); return { y: y + (L.length - 1) * lh, n: L.length } }
function uid(p) { nu++; return (p || 'sc') + nu }
ECOM.sc = { fit: fit, mix: mix, ramp: ramp, chip: chip, wrapT: wrapT, uid: uid };
})();
