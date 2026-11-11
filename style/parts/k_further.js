/* further — 추가 분석 장(Kick-off 14쪽 · CW44 15쪽) : 위 제목 줄 → 왼쪽 묶음 이름 기둥이 아래로 자람 → 오른쪽 「분석 n」 줄이 차례로
   caption · tag('예시') · prefix('분석') · groups[{name,items:[{title,text}]}] */
(function () {
'use strict';
var h = ECOM.h, K = ECOM.kx;
ECOM.parts.further = function (bd, s, ctx) {
  var gs = s.groups || [], n = gs.reduce(function (a, g) { return a + (g.items || []).length }, 0), G = gs.length, top = 54, gap = 10, ggap = 14;
  var rh = Math.min(104, (512 - top - (n - G) * gap - (G - 1) * ggap) / Math.max(1, n)), used = n * rh + (n - G) * gap + (G - 1) * ggap, y = top + Math.max(0, (512 - top - used) / 2), no = 0;
  K.D(bd, 'kx k-fuh', 0, 0, 1168, 38, h.esc(s.caption || s.title || '추가 분석 과제') + (s.tag !== false ? '<em>' + h.esc(s.tag || '예시') + '</em>' : ''), { 'data-b': 1, 'data-fx': 'fade' });
  gs.forEach(function (g, i) { var its = g.items || [], gh = its.length * rh + (its.length - 1) * gap;
    K.D(bd, 'kx k-fug', 0, y, 154, gh, '<span>' + h.md(g.name || '') + '</span>', { 'data-b': 2, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 460 });
    its.forEach(function (it, j) { no++; K.D(bd, 'kx k-fur', 172, y + j * (rh + gap), 1168 - 172, rh, '<div><em>' + h.esc((s.prefix || '분석') + ' ' + no + '.') + '</em><b>' + h.md(it.title || '') + '</b></div>' + (it.text ? '<span>' + h.md(it.text) + '</span>' : ''), { 'data-b': 3, 'data-fx': 'left' }) });
    y += gh + ggap });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) };
})();
