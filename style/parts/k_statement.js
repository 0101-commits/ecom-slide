/* statement — 결론 문장 + 근거 숫자 3개 : 문장이 오르고 핵심 구에 형광 띠가 칠해짐 → 근거 카드 3장 → 숫자 굴림 → 작은 차트 그려짐
   text('**핵심 구**' 2줄) · sub · evidence[3]{label,note,value,dec,unit,sign,chart:{type:'spark|bars|step',data,first,last,dec,unit,lo,hi},source} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
ECOM.parts.statement = function (bd, s, ctx) {
  var root = ctx.root, ev = (s.evidence || []).slice(0, 3), N = ev.length || 1, gap = 20, cw = (1168 - (N - 1) * gap) / N, CY = 212, CH = 512 - CY;
  var tx = K.D(bd, 'kx k-sm', 0, 0, 1168, CY - 16, '<div>' + (s.label !== false ? '<em class="k-smk" data-b="1" data-fx="pop">' + h.esc(s.label || '결론') + '</em>' : '') + '<p data-b="1">' + h.md(s.text || '') + '</p>' + (s.sub ? '<span data-b="2" data-fx="fade">' + h.md(s.sub) + '</span>' : '') + '</div>');
  ev.forEach(function (e, i) { var x = i * (cw + gap);
    K.D(bd, 'kx k-sme', x, CY, cw, CH, '<div class="k-smh"><b>' + h.esc(e.label || '') + '</b>' + (e.note ? '<span>' + h.esc(e.note) + '</span>' : '') + '</div>'
      + '<div class="k-smv"><span data-b="4" data-fx="count" data-count="' + h.num(e.value) + '" data-dec="' + h.num(e.dec) + '"' + (e.sign ? ' data-sign="1"' : '') + '>' + h.nf(e.value, e.dec || 0, { sign: e.sign }) + '</span><small>' + h.esc(e.unit || '') + '</small></div>'
      + (e.source ? '<div class="k-sms">' + h.esc(e.source) + '</div>' : ''), { 'data-b': 3, 'data-fx': 'rise', 'data-ms': 420 }) });
  var svg = K.svg(ctx);
  ev.forEach(function (e, i) { if (e.chart) K.mini(svg, e.chart, i * (cw + gap) + 24, CY + 120, cw - 48, 118, 5, 1440 + i * 130) });
  root._reset = function () { tx.classList.add('on') };
  root._hook = function (r) { tx.classList.remove('on'); h.later(r, function () { tx.classList.add('on') }, 520); return 1300 };
  root.setAttribute('data-gap', 360); root.setAttribute('data-stg', 130) };
})();
