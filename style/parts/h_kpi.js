/* kpi — 큰 숫자 띠(2~4개) + 아래 큰 차트(대표 계열) : 카드 + 오른쪽 요점 칸 대신 화면을 채움
   cards[{label,sub,value,dec,unit,chip:{text,dir:'up|dn|flat'},asof,hero}] · chart{type:'line|bar',labels,series:[{name,data,color}],y,unit,marks:'auto'|[{s,at,text,pos}],avg,note} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.kpi = function (bd, s, ctx) { var u = ECOM.u, cards = s.cards || [], kb = h.H('div', 'kb', null, bd);
  kb.style.gridTemplateColumns = 'repeat(' + Math.max(1, cards.length) + ',minmax(0,1fr))';
  cards.forEach(function (c, i) { var k = h.H('div', 'kc' + ((c.hero || (i === 0 && !cards.some(function (x) { return x.hero }))) ? ' hero' : ''), null, kb); k.setAttribute('data-b', 1);
    k.innerHTML = '<div class="l">' + h.esc(c.label) + (c.sub ? '<span>' + h.esc(c.sub) + '</span>' : '') + '</div><div class="v"><span data-b="2" data-fx="count" data-count="' + h.num(c.value) + '" data-dec="' + h.num(c.dec) + '">' + h.nf(c.value, c.dec || 0) + '</span><small>' + h.esc(c.unit || '') + '</small></div>'
      + '<div class="c">' + (c.chip ? '<span class="chip2 ' + (c.chip.dir === 'up' ? 'up' : c.chip.dir === 'dn' ? 'dn' : '') + '" data-b="3" data-fx="pop">' + (c.chip.dir === 'up' ? '▲ ' : c.chip.dir === 'dn' ? '▼ ' : '') + h.esc(c.chip.text) + '</span>' : '') + (c.asof ? '<span>' + h.esc(c.asof) + '</span>' : '') + '</div>' });
  var ch = s.chart; if (!ch) return; var svg = ctx.svg(512), top = 168, bot = 482, labels = ch.labels, n = labels.length, ser = ch.series || [], vals = [];
  ser.forEach(function (q) { vals = vals.concat(q.data) }); var ends = ser.length > 1 || ch.endLabels ? 150 : 30, ml = 54, x1 = 1168 - ends, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) };
  if (ch.title) T(h.lv(svg, 4), 0, top - 14, ch.title, { 'font-size': 13.5, 'font-weight': 700, fill: C.sub });
  var sc = u.yScale(ch.type === 'bar' ? vals.concat([0]) : vals, ch.y, top + 14, bot), Y = sc.Y, g = h.lv(svg, 4, { 'data-fx': 'fade' });
  u.yAxis(g, ml, x1, sc, { unit: ch.unit, base: true }); u.xLabels(g, labels, X, bot + 20, u.xTicks(n, 12, ch.ticks), { boldLast: true });
  if (ser.length > 1) h.legend(g, ml + 10, top + 4, ser.map(function (q, k) { return { color: q.color || (k ? 'cmp' : 'main'), text: q.name } }));
  var L = [];
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'cmp' : 'main')), d = q.data;
    if (ch.type === 'bar' && k === 0) { var bw = Math.max(3, slot * .62); d.forEach(function (v, i) { if (v == null) return; E('rect', { x: X(i) - bw / 2, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 1.5, fill: i === n - 1 ? C.main : (v < 0 ? C.light : C.gray), 'data-b': 5, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) }); ctx.root.setAttribute('data-stg', Math.max(4, Math.min(30, 500 / n))) }
    else E('path', { d: h.lineD(d, X, Y), fill: 'none', stroke: c, 'stroke-width': k ? 2.4 : 3.2, 'stroke-linejoin': 'round', 'data-b': 5, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var marks = ch.marks === 'auto' || !ch.marks ? (k === 0 ? (function () { var mi = 0, ma = 0; d.forEach(function (v, i) { if (v == null) return; if (d[mi] == null || v < d[mi]) mi = i; if (d[ma] == null || v > d[ma]) ma = i }); var o = [{ at: ma, pos: 'above', t: '최고' }, { at: mi, pos: 'below', t: '최저' }]; if (n - 1 !== ma && n - 1 !== mi && ends <= 30) o.push({ at: n - 1, pos: 'above' }); return o })() : []) : ch.marks.filter(function (m) { return (m.s || 0) === k });
    var mg = h.lv(svg, 6, { 'data-fx': 'fade' }); marks.forEach(function (m) { var v = d[m.at]; if (v == null) return; E('circle', { cx: X(m.at), cy: Y(v), r: 4.5, fill: '#fff', stroke: c, 'stroke-width': 2 }, mg);
      var t = m.text || ((m.t ? m.t + ' ' : '') + h.nf(v, ch.dec == null ? (Math.abs(v) >= 100 ? 1 : 2) : ch.dec) + (ch.suf || '')), an = m.at > n * .8 ? 'end' : m.at < n * .15 ? 'start' : 'middle';
      var below = m.pos === 'below' && Y(v) + 22 < bot - 4; L.push(u.label(mg, X(m.at), Y(v) + (below ? 20 : -10), t, { color: k ? 'cmp' : 'dark', size: 13, anchor: an, dir: below ? 1 : -1 })) });
    if (ends > 30) L.push(u.label(h.lv(svg, 6), X(n - 1) + 10, Y(d[n - 1]) + 5, q.name + (d[n - 1] != null ? ' ' + h.nf(d[n - 1], ch.dec == null ? 1 : ch.dec) : ''), { color: q.color || (k ? 'cmp' : 'main'), size: 13 })) });
  if (ch.avg) { var a = ser[0].data.filter(function (v) { return v != null }), av = a.reduce(function (p, c) { return p + c }, 0) / a.length, ag = h.lv(svg, 6, { 'data-fx': 'fade' });
    E('line', { x1: ml, x2: x1, y1: Y(av), y2: Y(av), stroke: C.dark, 'stroke-dasharray': '5 4', opacity: .5 }, ag); L.push(u.label(ag, ml + 6, Y(av) - 7, (ch.avgText || '평균 {v}').replace('{v}', h.nf(av, ch.dec == null ? 1 : ch.dec) + (ch.suf || '')), { color: 'dark', size: 12.5 })) }
  u.avoid(L); ctx.root.setAttribute('data-gap', 320) };
})();
