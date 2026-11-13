/* cocards — 기업 카드 나란히(스펙 시트형) : 카드 2~4장, 카드마다 같은 줄 항목(매출 · 이익 · 시가총액)을 큰 숫자 + 카드끼리 같은 눈금의 막대 + 항목별 순위로 맞대고, 아래에 칩(이익률 · 증감)
   cards[{name,tag(강조 카드만),rows[{label,value,unit,dec}],chips[{label,value,unit,dec,sign,tone('warn')}]}] 2~4장 · hero(강조 카드 번호, 기본 0, -1 이면 없음) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.cocards = function (bd, s, ctx) {
  var K = (s.cards || []).slice(0, 4), n = K.length; if (!n) return; var svg = ctx.svg(512), hero = s.hero != null ? s.hero : 0, gap = 20, W = (1168 - gap * (n - 1)) / n;
  var nr = Math.max.apply(null, K.map(function (c) { return (c.rows || []).length })), mx = [], rk = [];
  for (var r = 0; r < nr; r++) { var vs = K.map(function (c) { return c.rows[r] ? +c.rows[r].value : 0 }); mx[r] = Math.max.apply(null, vs); rk[r] = vs.map(function (v) { return 1 + vs.filter(function (q) { return q > v }).length }) }
  K.forEach(function (c, i) { var x = i * (W + gap), on = i === hero, t0 = i * 120, g = h.at(svg, t0, { 'data-fx': 'rise' }), fc = on ? C.dark : C.g08;
    E('rect', { x: x + .5, y: .5, width: W - 1, height: 511, rx: 10, fill: '#fff', stroke: on ? C.dark : C.line, 'stroke-width': on ? 2.4 : 1.2 }, g);
    E('rect', { x: x + 1, y: 1, width: W - 2, height: 66, rx: 9, fill: fc }, g); E('rect', { x: x + 1, y: 40, width: W - 2, height: 27, fill: fc }, g);
    E('circle', { cx: x + 36, cy: 34, r: 18, fill: on ? '#fff' : C.dark }, g); T(g, x + 36, 40.5, String(c.name).charAt(0), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: on ? C.dark : '#fff' });
    T(g, x + 64, 41, c.name, { 'font-size': 22, 'font-weight': 700, fill: on ? '#fff' : C.ink });
    if (on && c.tag) { var tw = h.textW(c.tag, 12.5, 1) + 18; E('rect', { x: x + W - tw - 14, y: 21, width: tw, height: 26, rx: 13, fill: C.on }, g); T(g, x + W - tw / 2 - 14, 38.5, c.tag, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) }
    (c.rows || []).forEach(function (q, k) { var y = 82 + k * 108, g2 = h.at(svg, t0 + 260 + k * 110, { 'data-fx': 'fade' }), vt = h.nf(q.value, q.dec || 0), rkk = rk[k][i];
      T(g2, x + 20, y + 14, q.label, { 'font-size': 14, fill: C.mute }); T(g2, x + W - 20, y + 14, rkk + '위', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: rkk === 1 ? C.dark : C.mute });
      T(g2, x + 20, y + 54, vt, { 'font-size': 32, 'font-weight': 700, fill: C.ink }); T(g2, x + 20 + h.textW(vt, 32, 1) + 6, y + 54, q.unit || '', { 'font-size': 15, fill: C.mute });
      E('rect', { x: x + 20, y: y + 68, width: W - 40, height: 12, rx: 6, fill: C.well }, g2);
      E('rect', { x: x + 20, y: y + 68, width: Math.max(3, (W - 40) * q.value / mx[k]), height: 12, rx: 6, fill: on ? C.dark : C.g65, 'data-at': t0 + 420 + k * 110, 'data-fx': 'growx', 'data-ms': 460 }, svg) });
    (c.chips || []).forEach(function (q, k) { var y = 396 + k * 50, g3 = h.at(svg, t0 + 760 + k * 100, { 'data-fx': 'fade' }), bad = q.tone === 'warn';
      E('rect', { x: x + 14, y: y, width: W - 28, height: 42, rx: 8, fill: bad ? C.warnsoft : (on ? C.g18 : C.paper) }, g3);
      T(g3, x + 28, y + 27, q.label, { 'font-size': 14.5, fill: C.sub }); T(g3, x + W - 28, y + 28, h.nf(q.value, q.dec || 0, { sign: !!q.sign }) + (q.unit || ''), { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: bad ? C.warn : C.dark }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
