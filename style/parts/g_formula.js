/* formula — 정의 · 계산 장 : 식 → 뺄셈(또는 더하기) 막대 → 오른쪽 추이 + 번호 표식 + 상자 — CW48 부록 A4 틀
   eq[{t,k:'r|g'}|{op}] · op('−'|'+') · cols[{name,sub,a:{label,value},b:{label,value},r:{label,value}}] · dec · unit
   chart{labels,series:[{name,data,color}],y,markers:[{s,at,n,v}],box:{title,items:[{n,text,color}]},range} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, HN = 0;
ECOM.parts.formula = function (bd, s, ctx) {
  var svg = ctx.svg(512), dec = s.dec == null ? 2 : s.dec, un = s.unit || '', hasChart = !!s.chart, lw = hasChart ? 560 : 1168;
  var eq = document.createElement('div'); eq.className = 'eq'; eq.innerHTML = (s.eq || []).map(function (x) { return x.op ? '<span class="op" data-b="1">' + h.esc(x.op) + '</span>' : '<span class="tok ' + (x.k || '') + '" data-b="1" data-fx="pop">' + h.esc(x.t) + '</span>' }).join(''); bd.insertBefore(eq, svg);
  var cols = s.cols || [], all = []; cols.forEach(function (c) { all.push(c.a.value, c.b.value) }); var mx = Math.max.apply(null, all) * 1.12, Yb = h.lin(0, mx, 470, 120);
  var pid = 'htch' + (++HN) + Math.floor(Math.random() * 1e4), df = E('defs', {}, svg), pt = E('pattern', { id: pid, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, df);
  E('rect', { width: 8, height: 8, fill: '#DCE2DF' }, pt); E('line', { x1: 0, x2: 0, y1: 0, y2: 8, stroke: '#C4CCC8', 'stroke-width': 3 }, pt);
  var step = Math.min(240, (lw - 80) / Math.max(1, cols.length)), w = Math.min(110, step * .46);
  cols.forEach(function (c, k) { var x = 120 + k * step, g = h.lv(svg, 2), sub = s.op === '+';
    T(g, x + w / 2, 80, c.name, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink }); if (c.sub) T(g, x + w / 2, 99, c.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    E('line', { x1: x - 14, x2: x + w + 14, y1: 470, y2: 470, stroke: C.axis }, g);
    E('rect', { x: x, y: Yb(c.a.value), width: w, height: 470 - Yb(c.a.value), rx: 3, fill: C.main, 'data-b': 2, 'data-fx': 'grow', 'data-ms': 520 }, svg);
    T(svg, x + w / 2, Yb(c.a.value) - 12, c.a.label + ' ' + h.nf(c.a.value, dec) + un, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.ink, 'data-b': 2, 'data-fx': 'fade' });
    var cp = E('g', { 'data-b': 3, 'data-fx': 'drop', 'data-dy': 240, 'data-ms': 820 }, svg); E('rect', { x: x, y: Yb(c.b.value), width: w, height: 470 - Yb(c.b.value), rx: 3, fill: 'url(#' + pid + ')' }, cp);
    T(cp, x + w / 2, (Yb(c.b.value) + 470) / 2 - 6, c.b.label, { 'text-anchor': 'middle', 'font-size': 13.5, fill: C.sub, 'font-weight': 600 }); T(cp, x + w / 2, (Yb(c.b.value) + 470) / 2 + 15, h.nf(c.b.value, dec) + un, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.sub });
    var ya = Math.min(Yb(c.a.value), Yb(c.b.value)), yb = Math.max(Yb(c.a.value), Yb(c.b.value)), rs = h.lv(svg, 4, { 'data-fx': 'pop' });
    E('rect', { x: x - 3, y: ya - 3, width: w + 6, height: yb - ya + 6, rx: 3, fill: 'none', stroke: C.dark, 'stroke-width': 2.5 }, rs);
    E('path', { d: 'M' + (x + w + 8) + ' ' + ya + ' H' + (x + w + 14) + ' V' + yb + ' H' + (x + w + 8), fill: 'none', stroke: C.dark, 'stroke-width': 1.6 }, rs);
    T(svg, x + w + 20, ya - 14, c.r.label, { 'font-size': 13.5, 'font-weight': 700, fill: C.main, 'data-b': 3, 'data-fx': 'fade' });
    T(svg, x + w + 20, ya + 28, h.nf(c.r.value, dec) + un, { 'font-size': 30, 'font-weight': 700, fill: C.dark, 'data-b': 3, 'data-fx': 'count', 'data-count': c.r.value, 'data-from': c.a.value, 'data-dec': dec, 'data-suf': un, 'data-ms': 820 }) });
  if (!hasChart) return; var ch = s.chart, ml = 640, pw = 420, n = ch.labels.length, X = function (i) { return ml + pw * i / (n - 1) }, vals = [];
  ch.series.forEach(function (q) { vals = vals.concat(q.data) }); var sc = ECOM.u.yScale(vals, ch.y || { n: 5 }, 40, 440), Y = sc.Y, g5 = h.lv(svg, 5, { 'data-fx': 'fade' });
  if (sc.lo < 0) E('rect', { x: ml, y: Y(0), width: pw, height: Y(sc.lo) - Y(0), fill: C.paper }, g5);
  sc.ticks.forEach(function (v) { E('line', { x1: ml, x2: ml + pw, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.mute : C.grid, 'stroke-dasharray': v === 0 ? null : '3 4', 'stroke-width': v === 0 ? 1.4 : 1 }, g5); T(g5, ml - 8, Y(v) + 4.5, h.nf(v, sc.dec), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
  ch.labels.forEach(function (l, i) { if (/\.01$/.test(l) || i === n - 1) T(g5, X(i), 462, ECOM.u.short(l), { 'text-anchor': 'middle', 'font-size': 12.5, fill: i === n - 1 ? C.ink : C.mute, 'font-weight': i === n - 1 ? 700 : 400 }) });
  h.legend(g5, ml, 18, ch.series.map(function (q, k) { return { color: q.color || (k ? 'cmp' : 'main'), text: q.name } })); if (ch.range) T(g5, ml + pw + 58, 18, ch.range, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
  var ends = [];
  ch.series.slice().reverse().forEach(function (q, kk) { var k = ch.series.length - 1 - kk; E('path', { d: h.lineD(q.data, X, Y), fill: 'none', stroke: h.col(q.color || (k ? 'cmp' : 'main')), 'stroke-width': k ? 2.4 : 3, 'stroke-linejoin': 'round', 'data-b': 6, 'data-fx': 'draw', 'data-ms': 1400 }, svg) });
  ch.series.forEach(function (q, k) { var lv = q.data[n - 1]; ends.push(ECOM.u.label(h.lv(svg, 7), X(n - 1) + 8, Y(lv) + 5, (q.end || q.name + ' ' + h.nf(lv, dec) + un), { color: q.color || (k ? 'cmp' : 'main'), size: 13, dir: k ? -1 : 1 })) }); ECOM.u.avoid(ends, 22);
  (ch.markers || []).forEach(function (m) { var v = m.v != null ? m.v : ch.series[m.s || 0].data[m.at], q = E('g', { 'data-b': 7, 'data-fx': 'pop' }, svg), c = h.col(m.color || (m.s ? 'cmp' : 'main'));
    E('circle', { cx: X(m.at), cy: Y(v), r: 10, fill: c, stroke: '#fff', 'stroke-width': 2 }, q); T(q, X(m.at), Y(v) + 4.5, String(m.n), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }) });
  if (ch.box) { var bx = E('g', { 'data-b': 7 }, svg), it = ch.box.items || [], bw = ch.box.w || 282, x0 = ch.box.x || (ml + pw - bw + 44), y0 = ch.box.y || 262, hh = 44 + it.length * 25;
    E('rect', { x: x0, y: y0, width: bw, height: hh, rx: 10, fill: '#fff', stroke: C.line }, bx); T(bx, x0 + 16, y0 + 26, ch.box.title || '주요 지점', { 'font-size': 13.5, 'font-weight': 700, fill: C.ink });
    it.forEach(function (r, k) { var y = y0 + 52 + k * 25; E('circle', { cx: x0 + 24, cy: y - 4.5, r: 8.5, fill: h.col(r.color || 'main') }, bx); T(bx, x0 + 24, y - .5, String(r.n || k + 1), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#fff' }); T(bx, x0 + 40, y, r.text, { 'font-size': 12.5, fill: C.ink }) }) }
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 90) };
})();
