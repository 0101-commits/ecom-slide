/* cochain — 가치사슬 위 기업 배치 : 쐐기 화살표 단계 4~6칸 + 단계마다 강자 카드(1위 큰 칸 · 2~3위 막대) + 우리 회사가 1위인 단계는 짙은 초록
   stages[{name,sub,top[{name,share}] 1~3개(큰 순)}] 4~6 · hero(이름) · unit('%') · band(아래 한 줄, `**굵게**` 불가 · 글만) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.cochain = function (bd, s, ctx) {
  var S = (s.stages || []).slice(0, 6), n = S.length; if (!n) return; var svg = ctx.svg(512), hero = s.hero, u = s.unit || '%', tip = 20, W = (1168 + tip * (n - 1)) / n - tip + 14, step = (1168 - W) / (n - 1 || 1); if (n === 1) step = 0;
  S.forEach(function (st, i) { var x = i * step, t0 = i * 170, g = h.at(svg, t0, { 'data-fx': 'left' }), top = st.top || [], lead = top[0] || {}, win = lead.name === hero, fc = win ? C.dark : C.g18;
    var d = 'M' + x + ' 0 H' + (x + W - tip) + ' L' + (x + W) + ' 32 L' + (x + W - tip) + ' 64 H' + x + (i ? ' L' + (x + tip) + ' 32' : '') + ' Z'; E('path', { d: d, fill: fc }, g);
    T(g, x + (i ? tip + 12 : 16), st.sub ? 28 : 38, st.name, { 'font-size': 17, 'font-weight': 700, fill: win ? '#fff' : C.ink }); if (st.sub) T(g, x + (i ? tip + 12 : 16), 48, st.sub, { 'font-size': 12.5, fill: win ? C.on : C.mute });
    var cx = x + 8, cw = W - tip - 6, g2 = h.at(svg, t0 + 300, { 'data-fx': 'rise' });
    E('rect', { x: cx, y: 82, width: cw, height: 168, rx: 10, fill: win ? C.g18 : '#fff', stroke: win ? C.dark : C.line, 'stroke-width': win ? 2.2 : 1.2 }, g2);
    T(g2, cx + 14, 108, '1위', { 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g2, cx + 14, 142, lead.name || '', { 'font-size': 24, 'font-weight': 700, fill: win ? C.dark : C.ink });
    T(g2, cx + 14, 206, h.nf(lead.share, 0), { 'font-size': 52, 'font-weight': 700, fill: win ? C.dark : C.cmp }); T(g2, cx + 14 + h.textW(h.nf(lead.share, 0), 52, 1) + 4, 206, u, { 'font-size': 20, 'font-weight': 700, fill: C.mute });
    E('rect', { x: cx + 14, y: 224, width: cw - 28, height: 10, rx: 5, fill: C.well }, g2); E('rect', { x: cx + 14, y: 224, width: (cw - 28) * lead.share / 100, height: 10, rx: 5, fill: win ? C.dark : C.g65, 'data-at': t0 + 520, 'data-fx': 'growx', 'data-ms': 420 }, svg);
    top.slice(1, 3).forEach(function (q, k) { var y = 266 + k * 58, on = q.name === hero, g3 = h.at(svg, t0 + 640 + k * 100, { 'data-fx': 'fade' });
      if (on) E('rect', { x: cx, y: y - 4, width: cw, height: 52, rx: 8, fill: C.g08 }, g3);
      T(g3, cx + 12, y + 17, (k + 2) + '위 ' + q.name, { 'font-size': 15, 'font-weight': on ? 700 : 400, fill: on ? C.dark : C.ink }); T(g3, cx + cw - 12, y + 17, h.nf(q.share, 0) + u, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: on ? C.dark : C.ink });
      E('rect', { x: cx + 12, y: y + 28, width: cw - 24, height: 8, rx: 4, fill: C.well }, g3); E('rect', { x: cx + 12, y: y + 28, width: Math.max(3, (cw - 24) * q.share / 100), height: 8, rx: 4, fill: on ? C.dark : C.g40 }, g3) }) });
  if (s.band) { var gb = h.at(svg, 170 * n + 700, { 'data-fx': 'fade' }); E('rect', { x: 0, y: 450, width: 1168, height: 54, rx: 8, fill: C.paper }, gb); E('rect', { x: 0, y: 450, width: 6, height: 54, rx: 3, fill: C.dark }, gb); T(gb, 24, 484, s.band, { 'font-size': 17, 'font-weight': 700, fill: C.dark }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
