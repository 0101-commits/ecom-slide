/* scmatrix — 결정 매트릭스 : 행동(줄) × 상황(칸, 가능성 꼬리표) 결과표 + 확률 가중 평균 열 + 최악 열. 상황마다 가장 좋은 행동 굵은 테두리, 평균이 가장 높은 줄 짙게
   actions[{name,sub}] · states[{name,sub,p(%)}] · cells[행동][상황] 숫자 · unit · dec · expTitle('확률 가중 평균') · worstTitle('가장 나쁜 경우')
   음수 칸 = 주황(나쁜 뜻). 움직임 : 머리 → 줄이 위에서부터 → 평균 · 최악 열 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.scmatrix = function (bd, s, ctx) {
  var A = (s.actions || []).slice(0, 4), St = (s.states || []).slice(0, 4), M = s.cells || [], na = A.length, ns = St.length; if (!na || !ns) return;
  var svg = ctx.svg(512), u = s.unit || '', dec = s.dec != null ? s.dec : 1, LW = 232, nc = ns + 2, cw = (1168 - LW) / nc, hh = 92, rh = (512 - hh - 6) / na;
  var ptot = St.reduce(function (a, t) { return a + (+t.p || 0) }, 0) || 100, exp = M.map(function (r) { return r.reduce(function (a, v, j) { return a + v * (+St[j].p || 0) }, 0) / ptot });
  var worst = M.map(function (r) { return Math.min.apply(null, r.slice(0, ns)) }), bestE = exp.indexOf(Math.max.apply(null, exp)), mx = 0;
  M.forEach(function (r) { r.forEach(function (v) { mx = Math.max(mx, Math.abs(v)) }) });
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  St.forEach(function (t, j) { var x = LW + j * cw;
    T(g0, x + cw / 2, 26, t.name, { 'text-anchor': 'middle', 'font-size': S.fit(t.name, 17, cw - 16, 1, 13), 'font-weight': 700, fill: C.ink });
    if (t.sub) T(g0, x + cw / 2, 45, t.sub, { 'text-anchor': 'middle', 'font-size': S.fit(t.sub, 12.5, cw - 16, 0, 11.5), fill: C.mute });
    S.chip(g0, x + cw / 2 - 34, 56, 68, 26, '가능성 ' + h.nf(t.p, 0) + '%', C.g18, C.dark, 12.5) });
  [[ns, s.expTitle || '확률 가중 평균', C.dark], [ns + 1, s.worstTitle || '가장 나쁜 경우', C.mute]].forEach(function (c) { T(g0, LW + c[0] * cw + cw / 2, 52, c[1], { 'text-anchor': 'middle', 'font-size': S.fit(c[1], 15, cw - 14, 1, 12), 'font-weight': 700, fill: c[2] }) });
  E('line', { x1: LW + ns * cw - 4, x2: LW + ns * cw - 4, y1: 8, y2: 506, stroke: C.axis, 'stroke-dasharray': '3 4' }, g0);
  M.forEach(function (r, i) { var y = hh + i * rh, g = h.at(svg, 350 + i * 260, { 'data-fx': 'fade', 'data-ms': 340 }), a = A[i];
    T(g, 6, y + rh / 2 - (a.sub ? 2 : -6), a.name, { 'font-size': S.fit(a.name, 18, LW - 20, 1, 13), 'font-weight': 700, fill: C.ink });
    if (a.sub) T(g, 6, y + rh / 2 + 19, a.sub, { 'font-size': S.fit(a.sub, 12.5, LW - 20, 0, 11.5), fill: C.mute });
    r.slice(0, ns).forEach(function (v, j) { var x = LW + j * cw, col = M.map(function (q) { return q[j] }), best = v === Math.max.apply(null, col), neg = v < 0, t = Math.abs(v) / (mx || 1);
      E('rect', { x: x + 4, y: y + 4, width: cw - 8, height: rh - 8, rx: 8, fill: neg ? C.warnsoft : S.ramp(.08 + t * .55), stroke: best ? C.dark : 'none', 'stroke-width': best ? 3.5 : 0 }, g);
      T(g, x + cw / 2, y + rh / 2 + 10, h.nf(v, dec, { sign: true }) + u, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: neg ? C.warn : (t > .6 ? '#fff' : C.ink) });
      if (best) S.chip(g, x + 12, y + 12, 52, 20, '최선', C.dark, '#fff', 12) });
    var xe = LW + ns * cw, on = i === bestE, g2 = h.at(svg, 350 + na * 260 + i * 160, { 'data-fx': 'fade', 'data-ms': 340 });
    E('rect', { x: xe + 4, y: y + 4, width: cw - 8, height: rh - 8, rx: 8, fill: on ? C.dark : C.paper }, g2);
    T(g2, xe + cw / 2, y + rh / 2 + 10, h.nf(exp[i], dec, { sign: true }) + u, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: on ? '#fff' : C.ink });
    var xw = LW + (ns + 1) * cw; E('rect', { x: xw + 4, y: y + 4, width: cw - 8, height: rh - 8, rx: 8, fill: C.paper }, g2);
    T(g2, xw + cw / 2, y + rh / 2 + 10, h.nf(worst[i], dec, { sign: true }) + u, { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: worst[i] < 0 ? C.warn : C.cmp }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
