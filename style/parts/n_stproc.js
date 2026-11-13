/* stproc — 절차 단계 : 번호 동그라미가 선으로 이어지고, 사이에 걸리는 시간 칩 · 아래에 단계 카드(누가 · 무엇을) · 되돌아가는 점선 · 전체 소요 괄호
   steps[{name,who,doc,days}] 3~5개 (days = 앞 단계에서 이 단계까지 걸리는 날, 첫 단계는 0) · unit('영업일') · back{from,to,text}(번호 0부터, 점선 되돌림) · totalLabel(기본 「접수 ~ 마지막 단계」) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stproc = function (bd, s, ctx) {
  var st = (s.steps || []).slice(0, 5), n = st.length; if (!n) return; var svg = ctx.svg(512), unit = s.unit || '일', cw = 1168 / n, cy = 120, R = 34, cum = 0, xs = [];
  st.forEach(function (q, i) { xs.push(cw * i + cw / 2) });
  E('line', { x1: xs[0], x2: xs[n - 1], y1: cy, y2: cy, stroke: C.g40, 'stroke-width': 4 }, h.at(svg, 0, { 'data-fx': 'fade' }));
  st.forEach(function (q, i) { cum += +q.days || 0; var x = xs[i], last = i === n - 1, g = h.at(svg, 200 + i * 520, { 'data-fx': 'pop', 'data-ms': 420 });
    E('circle', { cx: x, cy: cy, r: R, fill: last ? C.dark : C.main }, g); T(g, x, cy + 12, String(i + 1), { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: '#fff' });
    if (i) { var mx = (xs[i - 1] + x) / 2; u.chip(g, mx, cy - 20, '+' + h.nf(q.days, 0) + unit, C.g18, C.dark, 13) }
    var cx = x - cw / 2 + 14, w2 = cw - 28, g2 = h.at(svg, 420 + i * 520, { 'data-fx': 'rise', 'data-ms': 420 });
    u.box(g2, cx, 196, w2, 204, last ? C.g08 : C.paper); E('rect', { x: cx, y: 196, width: w2, height: 5, rx: 2.5, fill: last ? C.dark : C.g65 }, g2);
    T(g2, cx + 18, 234, q.name || '', { 'font-size': u.fit(q.name || '', 21, w2 - 36, 1, 14), 'font-weight': 700, fill: last ? C.dark : C.main });
    T(g2, cx + 18, 266, '누가', { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); T(g2, cx + 18, 290, q.who || '', { 'font-size': u.fit(q.who || '', 17, w2 - 36, 1, 13), 'font-weight': 700, fill: C.ink });
    T(g2, cx + 18, 326, '무엇을', { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); u.lines(g2, cx + 18, 350, q.doc || '', 15, w2 - 36, { fill: C.cmp, lh: 1.35 });
    T(g2, cx + w2 - 18, 388, '누적 ' + h.nf(cum, 0) + unit, { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: last ? C.dark : C.mute }) });
  var b = s.back; if (b && xs[b.from] != null && xs[b.to] != null) { var gb = h.at(svg, 200 + n * 520, { 'data-fx': 'fade', 'data-ms': 420 }), x0 = xs[b.from], x1 = xs[b.to], top = 18;
    E('path', { d: 'M' + (x0 - 8) + ' ' + (cy - R) + ' C' + (x0 - 8) + ' ' + top + ' ' + (x1 + 8) + ' ' + top + ' ' + (x1 + 8) + ' ' + (cy - R - 4), fill: 'none', stroke: C.warn, 'stroke-width': 2, 'stroke-dasharray': '5 5' }, gb);
    u.arrow(gb, x1 + 8, cy - R - 12, x1 + 8, cy - R - 3, C.warn, 2); u.chip(gb, (x0 + x1) / 2, top + 12, b.text || '되돌아감', C.warn, '#fff', 12.5) }
  var total = st.reduce(function (a, q) { return a + (+q.days || 0) }, 0), gt = h.at(svg, 400 + n * 520, { 'data-fx': 'rise', 'data-ms': 420 });
  E('path', { d: 'M' + xs[0] + ' 416 V428 H' + xs[n - 1] + ' V416', fill: 'none', stroke: C.dark, 'stroke-width': 2 }, gt);
  u.chip(gt, 584, 428, (s.totalLabel || '접수 ~ 마지막 단계') + ' ' + h.nf(total, 0) + unit, C.dark, '#fff', 15);
  if (s.band) u.rich(gt, 584, 486, s.band, 16, 1100, { anchor: 'middle', fill: C.cmp, min: 13 });
};
})();
