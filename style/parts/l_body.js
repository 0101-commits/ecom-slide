/* body — 몸 그림 위 장기 표시(5판 재료 · 건강 · 제약 계열). 사람 앞모습 실루엣(평면) + 장기 모양 + 양옆 설명 칸.
   organs[{o, label, value, unit, dec, sub, tone:'main|warn|cmp|g65'}]  o = brain · eye · lung · heart · liver · stomach · pancreas · kidney · intestine · fat · blood · bone · joint · skin
   title(그림 위 한 줄) · note(그림 아래) · side:'both|right|left'(설명 칸 자리, 기본 both — 장기 위치로 나눔) · figure:'adult'
   재료 함수 ECOM.bodyFig(svg, x, y, k, organs) → {pt(o) → [x,y]} 다른 부품에서도 몸 그림을 쓸 때.
   움직임 : 실루엣 → 장기가 하나씩 칠해짐 → 끌어낸 선 → 설명 칸(숫자 굴림) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
/* 그림 좌표 300×600(머리 위 = 0) */
var SIL = 'M150 14c-24 0-42 18-42 44 0 20 11 37 27 43v13c-22 3-44 10-56 22-10 10-14 24-15 40l-10 150c-1 12 7 18 15 18h6c7 0 12-5 13-12l12-142 4 0-2 152 4 220c0 10 6 16 15 16h10c8 0 13-6 14-15l8-205h6l8 205c1 9 6 15 14 15h10c9 0 15-6 15-16l4-220-2-152 4 0 12 142c1 7 6 12 13 12h6c8 0 16-6 15-18l-10-150c-1-16-5-30-15-40-12-12-34-19-56-22v-13c16-6 27-23 27-43 0-26-18-44-42-44z';
var ORG = {
  brain: { p: [150, 50], d: 'M126 52c0-16 11-26 24-26s24 10 24 26c0 9-6 14-12 14h-24c-6 0-12-5-12-14z' },
  eye: { p: [150, 60], d: 'M134 60a5 4 0 1 0 10 0a5 4 0 1 0-10 0zM156 60a5 4 0 1 0 10 0a5 4 0 1 0-10 0z' },
  lung: { p: [150, 178], d: 'M128 140c-14 4-22 20-22 44 0 18 6 30 18 30 9 0 14-8 14-20v-44c0-7-4-11-10-10zM172 140c14 4 22 20 22 44 0 18-6 30-18 30-9 0-14-8-14-20v-44c0-7 4-11 10-10z' },
  heart: { p: [158, 192], d: 'M158 206c-14-9-20-16-20-23 0-6 5-10 10-10 4 0 7 2 10 6 3-4 6-6 10-6 5 0 10 4 10 10 0 7-6 14-20 23z' },
  liver: { p: [130, 236], d: 'M106 226c12-8 34-10 52-6 6 2 6 8 2 12-12 10-30 18-46 18-10 0-14-14-8-24z' },
  stomach: { p: [174, 244], d: 'M170 222c10 0 18 8 18 20 0 14-10 24-24 24-8 0-12-4-10-8 3-5 10-6 12-14 2-8-4-14 0-20 1-1 2-2 4-2z' },
  pancreas: { p: [156, 268], d: 'M126 266c10-4 30-6 52-2 6 1 6 7 0 8-20 3-38 4-50 2-6-1-7-6-2-8z' },
  kidney: { p: [150, 282], d: 'M120 270c-7 0-11 7-11 16s4 16 11 16c5 0 6-5 4-9-2-4-2-10 0-14 2-4 1-9-4-9zM180 270c7 0 11 7 11 16s-4 16-11 16c-5 0-6-5-4-9 2-4 2-10 0-14-2-4-1-9 4-9z' },
  intestine: { p: [150, 322], d: 'M118 296h64c6 0 10 4 10 10v34c0 6-4 10-10 10h-64c-6 0-10-4-10-10v-34c0-6 4-10 10-10zM124 310h52M124 323h52M124 336h52' },
  fat: { p: [150, 300], d: 'M100 278c18-8 82-8 100 0 6 14 6 32 0 46-18 8-82 8-100 0-6-14-6-32 0-46z' },
  blood: { p: [150, 230], d: 'M158 206v150M158 356l-24 60M158 356l18 60M158 226l-40-6M158 226l40-6' },
  bone: { p: [150, 470], d: 'M131 380v170M169 380v170M125 380h12M163 380h12M125 550h12M163 550h12' },
  joint: { p: [150, 468], d: 'M131 468a9 9 0 1 0 0.1 0zM169 468a9 9 0 1 0 0.1 0z' },
  skin: { p: [150, 120], d: SIL }
};
function mix(c, t) { var v = [1, 3, 5].map(function (i) { return Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - t) + 255 * t) }); return 'rgb(' + v.join(',') + ')' }
var TONE = { main: C.main, warn: C.warn, cmp: C.cmp, g65: C.g65, dark: C.dark };

function bodyFig(svg, x, y, k, organs, t0) { var g = E('g', { transform: 'translate(' + x + ',' + y + ') scale(' + k + ')' }, svg);
  E('path', { d: SIL, fill: C.g08, stroke: C.g40, 'stroke-width': 1.6 / k, 'data-at': t0 || 0, 'data-fx': 'fade', 'data-ms': 500 }, g);
  var hit = {}; (organs || []).forEach(function (o) { hit[o.o] = o });
  Object.keys(ORG).forEach(function (n) { if (n === 'skin' || n === 'fat' || n === 'blood' || n === 'bone' || n === 'joint' || n === 'eye') return; if (hit[n]) return;
    E('path', { d: ORG[n].d, fill: '#fff', stroke: C.g40, 'stroke-width': 1 / k, opacity: .9, 'data-at': (t0 || 0) + 200, 'data-fx': 'fade' }, g) });
  (organs || []).map(function (o, i) { return [o, i] }).sort(function (a, b) { return (/^(fat|skin)$/.test(b[0].o) ? 1 : 0) - (/^(fat|skin)$/.test(a[0].o) ? 1 : 0) }).forEach(function (oi) { var o = oi[0], i = oi[1], O = ORG[o.o]; if (!O) return; var col = TONE[o.tone] || C.main, line = /^(blood|bone)$/.test(o.o), t = (t0 || 0) + 600 + i * 380;
    E('path', { d: O.d, fill: line ? 'none' : (o.o === 'skin' ? 'none' : (o.o === 'fat' ? mix(col, .5) : col)), stroke: col, 'stroke-width': (line || o.o === 'skin' ? 4 : 1.4) / k, 'stroke-linecap': 'round', 'data-key': o.label || o.o, 'data-at': t, 'data-fx': line ? 'draw' : 'zoom', 'data-ms': 420 }, g) });
  return { pt: function (n) { var O = ORG[n]; return O ? [x + O.p[0] * k, y + O.p[1] * k] : [x + 150 * k, y + 300 * k] } } }

ECOM.bodyFig = bodyFig;
ECOM.parts.body = function (bd, s, ctx) { var svg = ctx.svg(512), os = (s.organs || []).slice(0, 8), k = .82, fw = 300 * k, fx = (1168 - fw) / 2, fy = s.title ? 22 : 6;
  if (s.title) T(svg, 584, 14, s.title, { 'font-size': 15, 'font-weight': 700, fill: C.dark, 'text-anchor': 'middle', 'data-at': 0, 'data-fx': 'fade' });
  var F = bodyFig(svg, fx, fy, k, os, 0), side = s.side || 'both';
  var L = [], R = [], cx = fx + 150 * k; os.forEach(function (o, i) { o._p = F.pt(o.o); o._i = i });
  if (side === 'left') L = os.slice(); else if (side === 'right') R = os.slice();
  else { os.slice().sort(function (a, b) { return a._p[1] - b._p[1] }).forEach(function (o, j) { var d = o._p[0] - cx; (Math.abs(d) > 6 ? (d < 0 ? L : R) : (L.length <= R.length ? L : R)).push(o) });
    while (L.length - R.length > 1) R.push(L.splice(L.length - 1, 1)[0]); while (R.length - L.length > 1) L.push(R.splice(R.length - 1, 1)[0]) }
  L.sort(function (a, b) { return a._p[1] - b._p[1] }); R.sort(function (a, b) { return a._p[1] - b._p[1] });
  function col(list, left) { var n = list.length; if (!n) return; var cw = 330, gap = 14, chh = Math.min(100, (512 - 8 - (n - 1) * gap) / n), x0 = left ? 0 : 1168 - cw, y0 = (512 - (n * chh + (n - 1) * gap)) / 2;
    list.forEach(function (o, j) { var y = y0 + j * (chh + gap), t = 900 + o._i * 380, col = TONE[o.tone] || C.main, p = o._p, ex = left ? x0 + cw : x0, ey = y + chh / 2;
      E('path', { d: 'M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ' L' + (left ? ex + 26 : ex - 26) + ' ' + p[1].toFixed(1) + ' L' + (left ? ex + 26 : ex - 26) + ' ' + ey.toFixed(1) + ' L' + ex + ' ' + ey.toFixed(1), fill: 'none', stroke: col, 'stroke-width': 1.4, 'data-leader': 1, 'data-at': t, 'data-fx': 'draw', 'data-ms': 320 }, svg);
      E('circle', { cx: p[0], cy: p[1], r: 4, fill: '#fff', stroke: col, 'stroke-width': 2, 'data-at': t, 'data-fx': 'pop' }, svg);
      var g = E('g', { 'data-at': t + 260, 'data-fx': 'slide', 'data-dx': left ? -14 : 14, 'data-key': o.label || o.o }, svg);
      E('rect', { x: x0, y: y, width: cw, height: chh, rx: 6, fill: C.g08 }, g); E('rect', { x: left ? x0 + cw - 5 : x0, y: y, width: 5, height: chh, fill: col }, g);
      var tx = x0 + (left ? 16 : 20); T(g, tx, y + 26, o.label || o.o, { 'font-size': 16, 'font-weight': 700, fill: C.ink });
      var yy = y + 26; if (o.value != null) { yy += 34; var vs = h.nf(o.value, o.dec || 0); T(g, tx, yy, vs, { 'font-size': 28, 'font-weight': 800, fill: col, 'data-count': o.value, 'data-dec': o.dec || 0, 'data-at': t + 300, 'data-fx': 'count' }); if (o.unit) T(g, tx + 6 + h.textW(vs, 28, 1), yy, o.unit, { 'font-size': 14, fill: C.mute }) }
      if (o.sub) h.wrap(o.sub, 13, cw - 36).slice(0, Math.max(1, Math.floor((y + chh - yy - 10) / 18))).forEach(function (ln, q) { T(g, tx, yy + 21 + q * 18, ln, { 'font-size': 13, fill: C.cmp }) }) }) }
  col(L, true); col(R, false);
  if (s.note) T(svg, 584, 506, s.note, { 'font-size': 12.5, fill: C.mute, 'text-anchor': 'middle', 'data-at': 2400, 'data-fx': 'fade' });
  ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.body.layouts = ['default'];

/* 회사 로고 칸(5판 재료) — 비공개 brand/logos/<이름>.png 가 빌드에 들어오면 그림, 없으면 글자 칸(이름 첫 글자 동그라미 + 이름).
   ECOM.coLogo(p, x, y, w, h, name, o) : SVG 안에 그림. 로고 그림은 공개 저장소에 넣지 않음(보도 자료 · IR · 저작권 없는 공용 그림만, 비공개 보관). */
ECOM.coLogo = function (p, x, y, w, hh, name, o) { o = o || {}; var L = (window.ECOM_LOGO && window.ECOM_LOGO.co) || {}, src = L[name];
  var g = E('g', { 'data-key': name }, p);
  if (src) { E('image', { href: src, x: x, y: y, width: w, height: hh, preserveAspectRatio: 'xMidYMid meet' }, g); return g }
  E('rect', { x: x, y: y, width: w, height: hh, rx: 6, fill: o.fill || C.g08 }, g); var r = Math.min(hh * .36, 16);
  E('circle', { cx: x + 10 + r, cy: y + hh / 2, r: r, fill: o.tone || C.main }, g); T(g, x + 10 + r, y + hh / 2 + r * .38, String(name || '').slice(0, 1), { 'font-size': r * 1.05, 'font-weight': 800, fill: '#fff', 'text-anchor': 'middle' });
  T(g, x + 18 + 2 * r, y + hh / 2 + 5, name || '', { 'font-size': Math.min(15, hh * .38), 'font-weight': 700, fill: C.ink }); return g };
})();
