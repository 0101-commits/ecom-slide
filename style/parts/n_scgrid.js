/* scgrid — 민감도 격자 : 두 변수(가로 · 세로)를 바꿨을 때 결과 값을 칸 색(연한 → 짙은 초록)으로. 기준 칸 굵은 테두리, 기준선 이상 칸은 주황 경계선으로 묶음
   xs[…] · ys[…](칸 이름 글자) · data[세로][가로] · xTitle · yTitle · dec · suf · base{xi,yi,label} · thr{v,label}(이상이면 나쁜 뜻 · 주황 글자 + 경계선) · side{title,rows:[{k,v}],note}(오른쪽 데이터 칸)
   움직임 : 축 → 칸이 위 왼쪽부터 → 주황 경계 → 기준 칸 → 오른쪽 칸 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scgrid = function (bd, s, ctx) {
  var xs = s.xs || [], ys = s.ys || [], D = s.data || [], nc = xs.length, nr = ys.length; if (!nc || !nr) return;
  var svg = ctx.svg(512), sd = s.side, SW = sd ? 290 : 0, gx = 128, gw = 1168 - gx - SW - (sd ? 24 : 0), cw = gw / nc, gy = 62, rh = (512 - gy - 4) / nr, dec = s.dec != null ? s.dec : 1, suf = s.suf || '', thr = s.thr;
  var lo = Infinity, hi = -Infinity; D.forEach(function (r) { r.forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v) }) });
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  T(g0, gx + gw / 2, 16, s.xTitle || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.ink });
  T(g0, 0, 30, s.yTitle || '', { 'font-size': 14, 'font-weight': 700, fill: C.ink });
  xs.forEach(function (x, j) { T(g0, gx + cw * (j + .5), 48, x, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': s.base && s.base.xi === j ? 700 : 400, fill: s.base && s.base.xi === j ? C.ink : C.mute }) });
  ys.forEach(function (y, i) { T(g0, gx - 14, gy + rh * (i + .5) + 5, y, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': s.base && s.base.yi === i ? 700 : 400, fill: s.base && s.base.yi === i ? C.ink : C.mute }) });
  var fs = Math.min(15, cw / 4.6);
  D.forEach(function (r, i) { var g = h.at(svg, 300 + i * 130, { 'data-fx': 'fade', 'data-ms': 300 });
    r.forEach(function (v, j) { var t = hi > lo ? (v - lo) / (hi - lo) : .5, bad = thr && v >= thr.v;
      E('rect', { x: gx + cw * j + 1, y: gy + rh * i + 1, width: cw - 2, height: rh - 2, rx: 2, fill: S.ramp(t) }, g);
      T(g, gx + cw * (j + .5), gy + rh * (i + .5) + fs * .36, h.nf(v, dec) + suf, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': bad || t > .6 ? 700 : 500, fill: bad ? (t > .6 ? '#FFD9C8' : C.warn) : (t > .6 ? '#fff' : C.ink) }) }) });
  if (thr) { var gt = h.at(svg, 300 + nr * 130 + 200, { 'data-fx': 'fade', 'data-ms': 420 }), on = function (i, j) { return i >= 0 && j >= 0 && i < nr && j < nc && D[i][j] >= thr.v };
    for (var i = 0; i < nr; i++) for (var j = 0; j < nc; j++) if (on(i, j)) { var x = gx + cw * j, y = gy + rh * i;
      if (!on(i - 1, j) && i > 0) E('line', { x1: x, x2: x + cw, y1: y, y2: y, stroke: C.warn, 'stroke-width': 3.5 }, gt);
      if (!on(i + 1, j) && i < nr - 1) E('line', { x1: x, x2: x + cw, y1: y + rh, y2: y + rh, stroke: C.warn, 'stroke-width': 3.5 }, gt);
      if (!on(i, j - 1) && j > 0) E('line', { x1: x, x2: x, y1: y, y2: y + rh, stroke: C.warn, 'stroke-width': 3.5 }, gt);
      if (!on(i, j + 1) && j < nc - 1) E('line', { x1: x + cw, x2: x + cw, y1: y, y2: y + rh, stroke: C.warn, 'stroke-width': 3.5 }, gt) } }
  if (s.base) { var gb = h.at(svg, 300 + nr * 130 + 600, { 'data-fx': 'pop', 'data-ms': 420 }), bx = gx + cw * s.base.xi, by = gy + rh * s.base.yi;
    E('rect', { x: bx + 1, y: by + 1, width: cw - 2, height: rh - 2, rx: 3, fill: 'none', stroke: C.ink, 'stroke-width': 3.5 }, gb);
    var bw = h.textW(s.base.label || '지금', 13, 1) + 16; E('rect', { x: bx + cw / 2 - bw / 2, y: by - 10, width: bw, height: 20, rx: 10, fill: C.ink }, gb);
    T(gb, bx + cw / 2, by + 4, s.base.label || '지금', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) }
  if (sd) { var gs = h.at(svg, 300 + nr * 130 + 900, { 'data-fx': 'fade', 'data-ms': 420 }), sx = 1168 - SW;
    E('rect', { x: sx, y: gy - 4, width: SW, height: 512 - gy - 4, rx: 10, fill: C.paper }, gs);
    T(gs, sx + 18, gy + 26, sd.title || '', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    (sd.rows || []).forEach(function (r, i) { var y = gy + 62 + i * 78; T(gs, sx + 18, y, r.k, { 'font-size': 13.5, fill: C.mute }); T(gs, sx + 18, y + 33, r.v, { 'font-size': S.fit(r.v, 30, SW - 36, 1, 18), 'font-weight': 700, fill: r.warn ? C.warn : C.dark }) });
    if (sd.note) S.wrapT(gs, sx + 18, 512 - gy + 14 - 4 - 22 * 1 - 50, sd.note, 13, SW - 36, { fill: C.sub }) }
  if (thr) { var gl = h.at(svg, 300, { 'data-fx': 'fade' }); E('rect', { x: gx, y: 512 - 0, width: 0, height: 0 }, gl) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
