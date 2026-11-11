/* drivers — 변화 요인 줄 : 줄마다 부호 표(+ / −) · 요인 이름 · 설명 · 가운데 0선에서 갈라지는 막대 · 값, 맨 아래 합계 줄
   items[{sign,text,sub,value,unit,dec,num,note}](value 없으면 2판 num 글을 그대로) · unit · dec · total{label,value,sub} · hero(번호, 기본 절댓값 가장 큰 것)
   colTitles[요인, 기여](선택) · 줄 차례로 나타남(막대는 0선에서 뻗음) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.drivers = function (bd, s, ctx) {
  var root = ctx.root, I = s.items || [], n = I.length; if (!n) return;
  var unit = s.unit || '', dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), svg = ctx.svg(512), tot = s.total;
  var V = I.map(function (it) { if (it.value != null) return +it.value; var m = /([+−-])?\s*([\d,.]+)/.exec(String(it.num || '')); return m ? (m[1] === '−' || m[1] === '-' ? -1 : 1) * parseFloat(m[2].replace(/,/g, '')) : 0 });
  var hero = s.hero, hv = -1; if (hero == null) V.forEach(function (v, i) { if (Math.abs(v) > hv) { hv = Math.abs(v); hero = i } });
  var F = function (v, it) { it = it || {}; return it.value == null && it.num ? it.num : h.nf(v, it.dec != null ? it.dec : dec, { sign: true }) + (it.unit || unit) };
  var top = 34, totH = tot ? 76 : 0, rowH = Math.min(100, (512 - top - totH) / n), tx = 64, bx0 = 470, bx1 = 1168 - 150;
  var dv = V.concat(tot ? [+tot.value] : []), SX = h.lin(Math.min(0, Math.min.apply(null, dv)), Math.max(0, Math.max.apply(null, dv)), bx0, bx1), zx = SX(0);
  var ct = s.colTitles || ['요인', '기여' + (unit ? ', ' + unit : '')], g0 = h.lv(svg, 1, { 'data-fx': 'fade' });
  T(g0, tx, 16, ct[0], { 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(g0, bx0, 16, ct[1], { 'font-size': 13, 'font-weight': 700, fill: C.mute });
  E('line', { x1: 0, x2: 1168, y1: top - 6, y2: top - 6, stroke: C.line }, g0);
  E('line', { x1: zx, x2: zx, y1: top, y2: top + rowH * n, stroke: C.axis, 'stroke-width': 1.2 }, g0);
  I.forEach(function (it, i) { var v = V[i], up = v >= 0, cy = top + rowH * (i + .5), hot = i === hero, g = h.lv(svg, 2 + i, { 'data-fx': 'left' });
    if (i) E('line', { x1: 0, x2: 1168, y1: top + rowH * i, y2: top + rowH * i, stroke: C.line, 'stroke-dasharray': '2 4' }, g);
    E('rect', { x: 0, y: cy - 20, width: 40, height: 40, rx: 8, fill: up ? (hot ? C.main : C.g18) : '#EEF0F1' }, g);
    T(g, 20, cy + 9, up ? '+' : '−', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: up ? (hot ? '#fff' : C.dark) : C.cmp });
    var nm = T(g, tx, cy + (it.sub ? -4 : 6), it.text || '', { 'font-size': 18, 'font-weight': 700, fill: C.ink });
    if (it.note) T(g, tx + h.textW(it.text || '', 18, 1) + 3, cy + (it.sub ? -12 : -2), it.note, { 'font-size': 12, 'font-weight': 700, fill: C.mute });
    if (it.sub) T(g, tx, cy + 17, it.sub, { 'font-size': 13.5, fill: C.mute });
    var x0 = Math.min(SX(0), SX(v)), w = Math.max(2, Math.abs(SX(v) - SX(0))), bh = Math.min(26, rowH * .42);
    E('rect', { x: x0, y: cy - bh / 2, width: w, height: bh, rx: 2, fill: hot ? C.main : up ? C.g40 : C.gray, 'data-b': 2 + i, 'data-fx': 'growx', 'data-o': up ? '0% 50%' : '100% 50%', 'data-ms': 520 }, svg);
    var vt = F(v, it), vx = up ? SX(v) + 10 : SX(v) - 10, vw = h.textW(vt, 16, 1); if (!up && vx - vw < bx0 - 10) vx = SX(0) + 10;
    T(g, vx, cy + 6, vt, { 'text-anchor': up || vx > SX(0) ? 'start' : 'end', 'font-size': hot ? 17 : 16, 'font-weight': 700, fill: up ? (hot ? C.dark : C.ink) : C.cmp }) });
  if (tot) { var ty = top + rowH * n, gt = h.lv(svg, 2 + n, { 'data-fx': 'rise' }), tv = +tot.value;
    E('rect', { x: 0, y: ty + 12, width: 1168, height: totH - 18, rx: 10, fill: C.paper }, gt);
    T(gt, tx, ty + 12 + (totH - 18) / 2 + (tot.sub ? -3 : 6), tot.label || '합계', { 'font-size': 17, 'font-weight': 700, fill: C.ink }); if (tot.sub) T(gt, tx, ty + 12 + (totH - 18) / 2 + 16, tot.sub, { 'font-size': 13, fill: C.mute });
    E('rect', { x: Math.min(SX(0), SX(tv)), y: ty + 12 + (totH - 18) / 2 - 12, width: Math.max(2, Math.abs(SX(tv) - SX(0))), height: 24, rx: 2, fill: C.dark }, gt);
    T(gt, tv >= 0 ? SX(tv) + 10 : SX(tv) - 10, ty + 12 + (totH - 18) / 2 + 6, h.nf(tv, dec, { sign: true }) + unit, { 'text-anchor': tv >= 0 ? 'start' : 'end', 'font-size': 18, 'font-weight': 700, fill: C.dark }) }
  root.setAttribute('data-gap', 280);
};
})();
