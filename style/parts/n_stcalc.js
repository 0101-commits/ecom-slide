/* stcalc — 계산 예시 칸 : 큰 칸 3~5개가 연산 칩으로 이어지고, 아래에 값이 어디로 나뉘는지 띠 + 결론 띠
   steps[{name,sub,value,dec,unit,op(다음 칸으로 가는 연산 글),how(계산 글),tone:'warn'}] · split{title,unit,dec,items:[{name,value,tone:'warn|dark'}]} · concl('**굵게** 한 줄') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stcalc = function (bd, s, ctx) {
  var st = (s.steps || []).slice(0, 5), n = st.length; if (!n) return;
  var svg = ctx.svg(512), gap = 78, w = (1168 - (n - 1) * gap) / n, ch = 270, cy = ch / 2;
  st.forEach(function (q, i) { var x = i * (w + gap), last = i === n - 1, warn = q.tone === 'warn', g = h.at(svg, i * 460, { 'data-fx': 'rise', 'data-ms': 420 });
    u.box(g, x, 0, w, ch, last ? C.dark : warn ? C.warnsoft : C.paper);
    if (!last) E('rect', { x: x, y: 0, width: 6, height: ch, rx: 3, fill: warn ? C.warn : C.g65 }, g);
    T(g, x + 24, 42, q.name || '', { 'font-size': u.fit(q.name || '', 18, w - 40, 1, 13), 'font-weight': 700, fill: last ? '#fff' : C.ink });
    if (q.sub) T(g, x + 24, 66, q.sub, { 'font-size': u.fit(q.sub, 13, w - 40, 0, 11.5), 'font-weight': 500, fill: last ? C.g18 : C.mute });
    var val = h.nf(q.value, q.dec || 0), un = q.unit || '', vs = 44; while (vs > 26 && h.textW(val, vs, 1) + h.textW(un, 17, 1) + 6 > w - 40) vs -= 2;
    var vc = last ? '#fff' : warn ? C.warn : C.dark;
    T(g, x + 24, 160, val, { 'font-size': vs, 'font-weight': 700, fill: vc });
    T(g, x + 24 + h.textW(val, vs, 1) + 6, 160, un, { 'font-size': 17, 'font-weight': 700, fill: last ? C.on : C.mute });
    E('line', { x1: x + 24, x2: x + w - 24, y1: 196, y2: 196, stroke: last ? C.g65 : C.line }, g);
    if (q.how) T(g, x + 24, 228, q.how, { 'font-size': u.fit(q.how, 14, w - 40, 0, 12), 'font-weight': 500, fill: last ? C.g18 : C.cmp });
    if (!last && q.op) { var gg = h.at(svg, i * 460 + 300, { 'data-fx': 'fade', 'data-ms': 300 }), ax = x + w + 6, bx = x + w + gap - 6;
      u.arrow(gg, ax, cy, bx, cy, C.g65, 2); u.chip(gg, x + w + gap / 2, cy - 24, q.op, C.main, '#fff', 12.5) } });
  var sp = s.split; if (sp && sp.items && sp.items.length) { var tot = sp.items.reduce(function (a, b) { return a + (+b.value || 0) }, 0) || 1, g2 = h.at(svg, n * 460 + 200, { 'data-fx': 'rise', 'data-ms': 420 }), xx = 0, by = 346;
    T(g2, 0, 316, sp.title || '', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    sp.items.forEach(function (it, j) { var ww = 1168 * (+it.value || 0) / tot, warn = it.tone === 'warn';
      E('rect', { x: xx + 1, y: by, width: Math.max(2, ww - 2), height: 50, rx: 6, fill: warn ? C.warn : (it.tone === 'dark' ? C.dark : C.g65) }, g2);
      var lab = it.name + ' ' + h.nf(it.value, sp.dec || 0) + (sp.unit || '');
      T(g2, xx + 16, by + 31, lab, { 'font-size': u.fit(lab, 15, ww - 28, 1, 12), 'font-weight': 700, fill: '#fff' });
      T(g2, xx + 16, by + 76, '전체의 ' + h.nf(100 * it.value / tot, 1) + '%', { 'font-size': 13, 'font-weight': 600, fill: warn ? C.warn : C.mute }); xx += ww }) }
  if (s.band) { var gc = h.at(svg, n * 460 + 700, { 'data-fx': 'fade' }); u.box(gc, 0, 452, 1168, 56, C.paper, { rx: 10 }); u.rich(gc, 22, 486, s.band, 16.5, 1168 - 44, { fill: C.cmp, min: 13 }) }
};
})();
