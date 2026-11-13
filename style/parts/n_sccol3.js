/* sccol3 — 시나리오 3칸 : 맨 위 100% 한 줄(폭 = 가능성) + 칸마다 이름 · 가능성 · 조건 · 결과 숫자
   cases[2~3]{name,p(%),tone('main'|'g65'|'g40'|'warn'),cond:[글 ≤3],stats:[{k,v}≤3]} · condTitle(기본 '이렇게 되려면') · statTitle(기본 '숫자')
   움직임 : 위 한 줄 → 칸이 왼쪽부터 → 숫자 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
ECOM.parts.sccol3 = function (bd, s, ctx) {
  var cs = (s.cases || []).slice(0, 3), n = cs.length; if (!n) return; var svg = ctx.svg(512), tot = cs.reduce(function (a, c) { return a + (+c.p || 0) }, 0) || 100;
  var x = 0, gb = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 380 });
  cs.forEach(function (c, i) { var w = 1168 * (+c.p || 0) / tot, fill = h.col(c.tone || 'main'), t = c.name + ' ' + h.nf(c.p, 0) + '%';
    E('rect', { x: x + 1, y: 0, width: w - 2, height: 40, rx: 6, fill: fill }, gb);
    T(gb, x + w / 2, 26, t, { 'text-anchor': 'middle', 'font-size': S.fit(t, 17, w - 14, 1, 12.5), 'font-weight': 700, fill: c.tone === 'g40' ? C.ink : '#fff' }); x += w });
  var gap = 22, cw = (1168 - gap * (n - 1)) / n, y0 = 56, ch = 452;
  cs.forEach(function (c, i) { var cx = i * (cw + gap), fill = h.col(c.tone || 'main'), g = h.at(svg, 500 + i * 330, { 'data-fx': 'fade', 'data-ms': 380 });
    E('rect', { x: cx, y: y0, width: cw, height: ch, rx: 10, fill: '#fff', stroke: C.line, 'stroke-width': 1.4 }, g);
    E('path', { d: 'M' + cx + ' ' + (y0 + 10) + ' a10 10 0 0 1 10 -10 h' + (cw - 20) + ' a10 10 0 0 1 10 10 v52 h-' + cw + ' z', fill: fill }, g);
    var tc = c.tone === 'g40' ? C.ink : '#fff';
    T(g, cx + 20, y0 + 41, c.name, { 'font-size': 22, 'font-weight': 700, fill: tc });
    T(g, cx + cw - 20, y0 + 43, h.nf(c.p, 0) + '%', { 'text-anchor': 'end', 'font-size': 32, 'font-weight': 700, fill: tc });
    T(g, cx + 20, y0 + 90, s.condTitle || '이렇게 되려면', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
    var y = y0 + 116;
    (c.cond || []).slice(0, 3).forEach(function (t) { E('circle', { cx: cx + 25, cy: y - 5, r: 3.2, fill: fill }, g); var r = S.wrapT(g, cx + 38, y, t, 15.5, cw - 60, { fill: C.ink }); y = r.y + 30 });
    var sy = y0 + 232; E('line', { x1: cx + 20, x2: cx + cw - 20, y1: sy - 14, y2: sy - 14, stroke: C.line }, g);
    T(g, cx + 20, sy + 6, s.statTitle || '숫자', { 'font-size': 13, 'font-weight': 700, fill: C.mute });
    var g2 = h.at(svg, 1100 + i * 250, { 'data-fx': 'fade', 'data-ms': 360 });
    (c.stats || []).slice(0, 3).forEach(function (st, j) { var yy = sy + 32 + j * 62;
      T(g2, cx + 20, yy, st.k, { 'font-size': 14, fill: C.mute });
      T(g2, cx + 20, yy + 32, st.v, { 'font-size': S.fit(st.v, 30, cw - 40, 1, 18), 'font-weight': 700, fill: c.tone === 'warn' ? C.warn : C.dark }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
