/* hub — 가운데 숫자 + 네 칸(숫자 하나 · 설명 두 줄 · 작은 차트) — CW48 4장 「금리차가 닿는 네 경로」
   center{label,value,dec,unit,sub1,sub2,carry} · nodes[4]{title,value,dec,unit,s1,s2,color,mini}
   mini : {type:'bars',labels,data,dec} | {type:'negbars',labels,data,dec} | {type:'line',data,first,last,marks:[{i,text,pos}],lo,hi,color}
          | {type:'lines',series:[{data,color,name}],first,last,lo,hi} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function mini(g, m, x, y, w, hh) { if (!m) return; var q = E('g', { 'data-b': 6, 'data-fx': 'fade' }, g), dec = m.dec == null ? 2 : m.dec;
  if (m.type === 'bars') { var d = m.data, e = h.ext(d), lo = m.lo != null ? m.lo : e[0] - (e[1] - e[0]) * .8, hi = m.hi != null ? m.hi : e[1], bw = Math.min(26, w / d.length * .6), gp = (w - d.length * bw) / Math.max(1, d.length - 1), Y = h.lin(lo, hi, y + hh - 22, y + 18);
    E('line', { x1: x, x2: x + w, y1: y + hh - 22, y2: y + hh - 22, stroke: C.axis }, q);
    d.forEach(function (v, i) { var bx = x + i * (bw + gp), last = i === d.length - 1; E('rect', { x: bx, y: Y(v), width: bw, height: y + hh - 22 - Y(v), rx: 2, fill: last ? C.main : C.g40, 'data-b': 6, 'data-fx': 'grow' }, g);
      T(q, bx + bw / 2, Y(v) - 6, h.nf(v, dec), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': last ? 700 : 400, fill: last ? C.dark : C.mute }); if (m.labels) T(q, bx + bw / 2, y + hh - 6, m.labels[i], { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.mute }) }) }
  if (m.type === 'negbars') { var z = y + 18, mn = Math.min.apply(null, m.data), sc = (hh - 50) / Math.abs(mn), bw2 = 34;
    E('line', { x1: x, x2: x + w, y1: z, y2: z, stroke: C.axis }, q);
    m.data.forEach(function (v, i) { var bx = x + 18 + i * 72, last = i === m.data.length - 1; E('rect', { x: bx, y: z, width: bw2, height: Math.abs(v) * sc, rx: 2, fill: last ? C.cmp : C.gray, 'data-b': 6, 'data-fx': 'grow', 'data-o': '50% 0%' }, g);
      if (m.labels) T(q, bx + bw2 / 2, z - 6, m.labels[i], { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.mute }); T(q, bx + bw2 / 2, z + Math.abs(v) * sc + 15, h.nf(v, m.dec == null ? 1 : m.dec), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': last ? 700 : 400, fill: last ? C.ink : C.mute }) }) }
  if (m.type === 'line' || m.type === 'lines') { var S = m.type === 'line' ? [{ data: m.data, color: m.color || 'cmp' }] : m.series, all = []; S.forEach(function (s) { all = all.concat(s.data) });
    var e2 = h.ext(all), lo2 = m.lo != null ? m.lo : e2[0], hi2 = m.hi != null ? m.hi : e2[1], n = S[0].data.length, X = function (i) { return x + w * i / (n - 1) }, Y2 = h.lin(lo2, hi2, y + hh - 26, y + 12);
    if (lo2 < 0 && hi2 > 0) { E('line', { x1: x, x2: x + w, y1: Y2(0), y2: Y2(0), stroke: C.axis, 'stroke-dasharray': '3 3' }, q); T(q, x - 4, Y2(0) + 4, '0', { 'text-anchor': 'end', 'font-size': 11.5, fill: C.mute }) }
    S.forEach(function (s, k) { E('path', { d: h.lineD(s.data, X, Y2), fill: 'none', stroke: h.col(s.color || (k ? 'main' : 'cmp')), 'stroke-width': k ? 2.6 : 2.2, 'stroke-linejoin': 'round', 'data-b': 6, 'data-fx': 'draw', 'data-ms': 700 }, g);
      if (s.name) { var lv = s.data[n - 1]; T(q, x + w + 4, Y2(lv) + (s.dy || 4), s.name, { 'font-size': 11.5, 'font-weight': k ? 700 : 400, fill: h.col(s.color || (k ? 'main' : 'cmp')) }) } });
    (m.marks || []).forEach(function (mk) { var v = S[0].data[mk.i], last = mk.i === n - 1; E('circle', { cx: X(mk.i), cy: Y2(v), r: 4, fill: last ? C.main : C.cmp }, q);
      T(q, X(mk.i), Y2(v) + (mk.pos === 'below' ? 18 : -9), mk.text, { 'text-anchor': mk.anchor || 'middle', 'font-size': 11.5, 'font-weight': last ? 700 : 400, fill: last ? C.dark : C.mute }) });
    if (m.first) T(q, x, y + hh - 4, m.first, { 'font-size': 11.5, fill: C.mute }); if (m.last) T(q, x + w, y + hh - 4, m.last, { 'text-anchor': 'end', 'font-size': 11.5, fill: C.mute }) } }
ECOM.parts.hub = function (bd, s, ctx) {
  var svg = ctx.svg(512), cx = 584, cy = 256, R = 104, W = 400, Hh = 222, P = [[0, 0], [768, 0], [0, 290], [768, 290]], c0 = s.center || {}, nodes = s.nodes || [];
  [[cx - R + 8, cy - 34, W, 111, -1], [cx + R - 8, cy - 34, 768, 111, 1], [cx - R + 8, cy + 34, W, 401, -1], [cx + R - 8, cy + 34, 768, 401, 1]].forEach(function (c, k) {
    if (!nodes[k]) return; var col = h.col(nodes[k].color || (k === 0 || k === 3 ? 'main' : 'cmp')), mx = (c[0] + c[2]) / 2;
    E('path', { d: 'M' + c[0] + ' ' + c[1] + ' C ' + mx + ' ' + c[1] + ', ' + mx + ' ' + c[3] + ', ' + (c[2] - c[4] * 10) + ' ' + c[3], fill: 'none', stroke: col, 'stroke-width': 2, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    E('path', { d: 'M' + (c[2] - c[4] * 12) + ' ' + (c[3] - 6) + ' L' + (c[2] - c[4]) + ' ' + c[3] + ' L' + (c[2] - c[4] * 12) + ' ' + (c[3] + 6), fill: 'none', stroke: col, 'stroke-width': 2, 'data-b': 3, 'data-fx': 'fade' }, svg) });
  var hub = h.lv(svg, 1, { 'data-fx': 'pop', 'data-carry-host': c0.carry || 'hub' }); E('circle', { cx: cx, cy: cy, r: R + 16, fill: 'none', stroke: C.g40, 'stroke-width': 1.5, 'stroke-dasharray': '4 6' }, hub); E('circle', { cx: cx, cy: cy, r: R, fill: C.dark }, hub);
  T(hub, cx, cy - 42, c0.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: '#fff', 'fill-opacity': .9 });
  if (c0.sub1) T(hub, cx, cy + 42, c0.sub1, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#fff', 'fill-opacity': .82 }); if (c0.sub2) T(hub, cx, cy + 61, c0.sub2, { 'text-anchor': 'middle', 'font-size': 12, fill: '#fff', 'fill-opacity': .7 });
  T(svg, cx, cy + 14, h.nf(c0.value, c0.dec || 0) + (c0.unit || ''), { 'text-anchor': 'middle', 'font-size': 46, 'font-weight': 700, fill: '#fff', 'data-b': 2, 'data-fx': 'count', 'data-count': c0.value, 'data-dec': c0.dec || 0, 'data-suf': c0.unit || '', 'data-carry': c0.carry || null });
  nodes.slice(0, 4).forEach(function (o, k) { var x0 = P[k][0], y0 = P[k][1], g = E('g', { 'data-b': 4 }, svg), col = o.color || (k === 0 || k === 3 ? 'main' : 'cmp');
    E('rect', { x: x0, y: y0, width: W, height: Hh, rx: 14, fill: '#fff', stroke: C.line }, g);
    E('circle', { cx: x0 + 30, cy: y0 + 30, r: 12, fill: h.col(col) }, g); T(g, x0 + 30, y0 + 34.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    T(g, x0 + 50, y0 + 35, o.title, { 'font-size': 16.5, 'font-weight': 700, fill: C.ink });
    var tx = E('text', { x: x0 + 24, y: y0 + 100, 'font-size': 40, 'font-weight': 700, fill: col === 'main' ? C.dark : C.ink, 'letter-spacing': '-0.02em' }, g);
    var ts = E('tspan', { 'data-b': 5, 'data-fx': 'count', 'data-count': o.value, 'data-dec': o.dec || 0, 'data-from': 0 }, tx); ts.textContent = h.nf(o.value, o.dec || 0);
    var tu = E('tspan', { 'font-size': 18, 'font-weight': 600, dx: 4 }, tx); tu.textContent = o.unit || '';
    if (o.s1) T(g, x0 + 24, y0 + 134, o.s1, { 'font-size': 13, fill: C.sub }); if (o.s2) T(g, x0 + 24, y0 + 155, o.s2, { 'font-size': 13, fill: C.mute });
    mini(g, o.mini, x0 + 238, y0 + 62, 140, 118) });
  ctx.root.setAttribute('data-gap', 300); ctx.root.setAttribute('data-stg', 110) };
})();
