/* columns — 틀 기둥 3~4개(Kick-off 6쪽) : (위 목표 띠 → 갈래 선) → 번호 기둥이 차례로 섬 → 기둥 숫자 굴림 → 아래 요약 띠가 왼쪽부터 펼쳐짐
   top{title,sub} · cols[{title,sub,hi,value:{v,dec,unit,label,sign},points[],chart:{type,data,first,last,dec,unit,title}(아래 작은 차트),note,noteLabel}] · summary('글, **굵게**') · sumLabel('요약') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
ECOM.parts.columns = function (bd, s, ctx) {
  var cols = (s.cols || []).slice(0, 4), N = cols.length, top = s.top || null, gap = 16, cw = (1168 - (N - 1) * gap) / N, y0 = top ? 104 : 0, y1 = s.summary ? 512 - 70 : 512, svg = K.svg(ctx);
  if (top) { var tw = Math.min(760, Math.max(420, h.textW(top.title || '', 19, 1) + 120));
    K.D(bd, 'kx k-cot', (1168 - tw) / 2, 0, tw, 56, '<b>' + h.md(top.title || '') + '</b>' + (top.sub ? '<span>' + h.md(top.sub) + '</span>' : ''), { 'data-b': 1, 'data-fx': 'pop' });
    var bus = 80, lg = h.lv(svg, 2, { 'data-fx': 'fade' });
    E('path', { d: 'M584 56 V' + bus, fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 260 }, svg);
    E('path', { d: 'M' + (cw / 2) + ' ' + bus + ' H' + (1168 - cw / 2), fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    cols.forEach(function (_, i) { var x = i * (cw + gap) + cw / 2; E('line', { x1: x, x2: x, y1: bus, y2: y0 - 10, stroke: C.g65, 'stroke-width': 2 }, lg); K.head(lg, x, y0 - 2, Math.PI / 2, C.g65, 9) }) }
  cols.forEach(function (c, i) { var x = i * (cw + gap), v = c.value || null;
    var html = '<div class="k-coh"><em>' + String(i + 1).padStart(2, '0') + '</em><div><b>' + h.md(c.title || '') + '</b>' + (c.sub ? '<span>' + h.md(c.sub) + '</span>' : '') + '</div></div>'
      + (v ? '<div class="k-cov"><span class="k-con"><span data-b="4" data-fx="count" data-count="' + h.num(v.v) + '" data-dec="' + h.num(v.dec) + '"' + (v.sign ? ' data-sign="1"' : '') + '>' + h.nf(v.v, v.dec || 0, { sign: v.sign }) + '</span><small>' + h.esc(v.unit || '') + '</small></span>' + (v.label ? '<i>' + h.esc(v.label) + '</i>' : '') + '</div>' : '')
      + '<div class="k-cop">' + (c.points || []).map(function (p) { return '<div><span>' + h.md(p) + '</span></div>' }).join('') + '</div>'
      + (c.note ? '<div class="k-cono"><i>' + h.esc(c.noteLabel || s.noteLabel || '확인 지표') + '</i><span>' + h.md(c.note) + '</span></div>' : '');
    var el = K.D(bd, 'kx k-coc' + (c.hi ? ' hi' : ''), x, y0, cw, y1 - y0, html, { 'data-b': 3, 'data-fx': 'rise', 'data-ms': 420 }); if (c.chart) el.style.paddingBottom = '160px' });
  var cs = null; cols.forEach(function (c, i) { if (!c.chart) return; cs = cs || K.svg(ctx); var x = i * (cw + gap);
    E('line', { x1: x + 20, x2: x + cw - 20, y1: y1 - 156, y2: y1 - 156, stroke: C.line, 'data-at': 1140 + i * 150, 'data-fx': 'fade' }, cs);
    if (c.chart.title) h.T(cs, x + 20, y1 - 134, c.chart.title, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute, 'data-at': 1140 + i * 150, 'data-fx': 'fade' });
    K.mini(cs, c.chart, x + 24, y1 - 132, cw - 48, 126, 4, 1140 + i * 150) });
  if (s.summary) K.D(bd, 'kx k-cos', 0, 512 - 56, 1168, 56, '<i>' + h.esc(s.sumLabel || '요약') + '</i><span>' + h.md(s.summary) + '</span>', { 'data-b': 5, 'data-fx': 'growx', 'data-ms': 620 });
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 150) };
})();
