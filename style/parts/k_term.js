/* term — 일반 용어 정의(식 없는 용어 · 식 용어는 formula) : 낱말 → 한 문장 정의 상자 → 성질 카드 3장 → 관련 숫자 + 작은 차트 → 관련 용어 칩
   tag('용어') · term · en · def · props[3]{title,text} · num{label,note,value,dec,unit,sign,chart:{type,data,first,last,dec,unit},source} · ex{title,items[]}(num 없을 때 구성 상자) · related[] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, K = ECOM.kx;
ECOM.parts.term = function (bd, s, ctx) {
  var LW = 540, RX = 572, RW = 1168 - RX, pr = (s.props || []).slice(0, 3), n = s.num || null, rel = s.related || [];
  K.D(bd, 'kx k-tmw', 0, 0, LW, 92, '<span>' + h.esc(s.tag || '용어') + '</span><b>' + h.esc(s.term || '') + '</b>' + (s.en ? '<em>' + h.esc(s.en) + '</em>' : ''), { 'data-b': 1, 'data-fx': 'rise' });
  var dh = Math.max(118, 70 + K.lines(s.def, 18, LW - 60, 0) * 29), relH = rel.length ? 44 : 0, ny = 104 + dh + 16, nh = 512 - ny - (relH ? relH + 14 : 0);
  K.D(bd, 'kx k-tmd', 0, 104, LW, dh, '<i>' + h.esc(s.defLabel || '정의') + '</i><span>' + h.md(s.def || '') + '</span>', { 'data-b': 2, 'data-fx': 'left' });
  var ph = (512 - (pr.length - 1) * 14) / Math.max(1, pr.length);
  pr.forEach(function (p, i) { K.D(bd, 'kx k-tmp', RX, i * (ph + 14), RW, ph, '<em>' + (i + 1) + '</em><div><b>' + h.md(p.title || '') + '</b>' + (p.text ? '<span>' + h.md(p.text) + '</span>' : '') + '</div>', { 'data-b': 3, 'data-fx': 'right' }) });
  if (n) { K.D(bd, 'kx k-tmn', 0, ny, LW, nh, '<div class="k-smh"><b>' + h.esc(n.label || '') + '</b>' + (n.note ? '<span>' + h.esc(n.note) + '</span>' : '') + '</div>'
      + '<div class="k-smv"><span data-b="5" data-fx="count" data-count="' + h.num(n.value) + '" data-dec="' + h.num(n.dec) + '"' + (n.sign ? ' data-sign="1"' : '') + '>' + h.nf(n.value, n.dec || 0, { sign: n.sign }) + '</span><small>' + h.esc(n.unit || '') + '</small></div>'
      + (n.source ? '<div class="k-sms">' + h.esc(n.source) + '</div>' : ''), { 'data-b': 4, 'data-fx': 'rise' });
    if (n.chart) K.mini(K.svg(ctx), n.chart, 250, ny + 44, LW - 250 - 28, nh - 90, 6, 1700) }
  if (!n && s.ex) K.D(bd, 'kx k-tmx', 0, ny, LW, nh, '<b>' + h.esc(s.ex.title || '구성') + '</b><div>' + (s.ex.items || []).map(function (x) { return '<span>' + h.md(x) + '</span>' }).join('') + '</div>', { 'data-b': 4, 'data-fx': 'rise' });
  if (rel.length) K.D(bd, 'kx k-tmr', 0, 512 - relH, LW, relH, '<i>관련 용어</i>' + rel.map(function (r) { return '<span data-b="6" data-fx="pop">' + h.esc(r) + '</span>' }).join(''), {});
  ctx.root.setAttribute('data-gap', 340); ctx.root.setAttribute('data-stg', 110) };
})();
