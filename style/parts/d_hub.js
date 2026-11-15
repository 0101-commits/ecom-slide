/* hub — 가운데 숫자 + 네 칸(숫자 하나 · 설명 두 줄 · 작은 차트) — CW48 4장 「금리차가 닿는 네 경로」
   center{label,value,dec,unit,sub1,sub2,carry} · nodes[4]{title,value,dec,unit,s1,s2,color,mini}
   mini : {type:'bars',labels,data,dec} | {type:'negbars',labels,data,dec} | {type:'line',data,first,last,marks:[{i,text,pos}],lo,hi,color}
          | {type:'lines',series:[{data,color,name}],first,last,lo,hi}
   layout(없으면 default = 위 그림, 같은 칸 그대로) : grid 2×2 맞붙은 네 칸 + 가운데 원(연결선 없음) · branch 맨 위 막대에서 가지가 갈라져 아래 네 칸 카드(위 → 아래) */
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
var baseHub = function (bd, s, ctx) {
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
/* ───────── 새 배치 2종 (s.layout) ───────── */
var NEW = {};
function cval(g, ix, y, o, col) { var tx = E('text', { x: ix, y: y, 'font-size': 40, 'font-weight': 700, fill: col === 'main' ? C.dark : C.ink, 'letter-spacing': '-0.02em' }, g);
  var ts = E('tspan', { 'data-b': 5, 'data-fx': 'count', 'data-count': o.value, 'data-dec': o.dec || 0, 'data-from': 0 }, tx); ts.textContent = h.nf(o.value, o.dec || 0);
  var tu = E('tspan', { 'font-size': 18, 'font-weight': 600, dx: 4 }, tx); tu.textContent = o.unit || '' }
function sline(g, x, y, str, w, size, fill) { var ls = h.wrap(String(str || ''), size, w, 0).slice(0, 2); ls.forEach(function (l, i) { T(g, x, y + i * (size + 4), l, { 'font-size': size, fill: fill }) }); return ls.length * (size + 4) }

/* grid 2×2 칸 : 네 칸이 맞붙은 격자, 가운데 원이 네 칸 모서리를 덮음(연결선 없음). 칸 안 = 번호 · 이름 · 큰 숫자 · 설명 두 줄 · 작은 차트(칸 안쪽은 원을 피해 바깥쪽에 모음) */
NEW.grid = function (bd, s, ctx) {
  var svg = ctx.svg(512), c0 = s.center || {}, nodes = (s.nodes || []).slice(0, 4), CW = 576, CH = 250, cx = 584, cy = 256, R = 92;
  nodes.forEach(function (o, k) { var x0 = k % 2 ? 592 : 0, y0 = k < 2 ? 0 : 262, ix = k % 2 ? 688 : 24, col = o.color || (k === 0 || k === 3 ? 'main' : 'cmp'), g = E('g', { 'data-b': 3 + (k % 2) + (k > 1 ? 1 : 0), 'data-fx': 'zoom', 'data-key': o.title || '' }, svg), cc = h.col(col);
    E('rect', { x: x0, y: y0, width: CW, height: CH, rx: 14, fill: C.paper }, g);
    E('rect', { x: k % 2 ? x0 + CW - 6 : x0, y: y0 + 18, width: 6, height: CH - 36, rx: 3, fill: cc }, g);
    E('circle', { cx: ix + 12, cy: y0 + 30, r: 12, fill: cc }, g); T(g, ix + 12, y0 + 34.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    T(g, ix + 32, y0 + 35, o.title, { 'font-size': 16.5, 'font-weight': 700, fill: C.ink });
    cval(g, ix, y0 + 104, o, col);
    var dy = o.s1 ? sline(g, ix, y0 + 138, o.s1, 236, 13, C.sub) : 0; if (o.s2) sline(g, ix, y0 + 138 + dy + 4, o.s2, 236, 13, C.mute);
    mini(g, o.mini, ix + 252, y0 + 56, 196, 150) });
  var hub = h.lv(svg, 2, { 'data-fx': 'pop', 'data-carry-host': c0.carry || 'hub' }); E('circle', { cx: cx, cy: cy, r: R, fill: C.dark, stroke: '#fff', 'stroke-width': 7 }, hub);
  T(hub, cx, cy - 46, c0.label || '', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 600, fill: '#fff', 'fill-opacity': .92 });
  if (c0.sub1) T(hub, cx, cy + 44, c0.sub1, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#fff', 'fill-opacity': .85 }); if (c0.sub2) T(hub, cx, cy + 62, c0.sub2, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#fff', 'fill-opacity': .75 });
  T(svg, cx, cy + 14, h.nf(c0.value, c0.dec || 0) + (c0.unit || ''), { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 700, fill: '#fff', 'data-b': 2, 'data-fx': 'count', 'data-count': c0.value, 'data-dec': c0.dec || 0, 'data-suf': c0.unit || '', 'data-carry': c0.carry || null });
  ctx.root.setAttribute('data-gap', 300); ctx.root.setAttribute('data-stg', 110) };

/* branch 위→아래 갈래 : 맨 위 가운데 막대(이름 · 설명 · 큰 숫자)에서 가지가 갈라져 아래로 네 칸 카드(번호 · 이름 · 큰 숫자 · 설명 · 작은 차트) */
NEW.branch = function (bd, s, ctx) {
  var svg = ctx.svg(512), c0 = s.center || {}, nodes = (s.nodes || []).slice(0, 4), n = nodes.length, CWd = 280, GP = 16, CY = 150, BY = 128, x00 = (1168 - (n * CWd + (n - 1) * GP)) / 2;
  var cxs = nodes.map(function (_, i) { return x00 + i * (CWd + GP) + CWd / 2 });
  var top = h.lv(svg, 1, { 'data-fx': 'pop', 'data-carry-host': c0.carry || 'hub' }); E('rect', { x: 314, y: 0, width: 540, height: 100, rx: 14, fill: C.dark }, top);
  T(top, 342, 34, c0.label || '', { 'font-size': 15.5, 'font-weight': 600, fill: '#fff', 'fill-opacity': .92 });
  if (c0.sub1) T(top, 342, 62, c0.sub1, { 'font-size': 13, fill: '#fff', 'fill-opacity': .85 }); if (c0.sub2) T(top, 342, 82, c0.sub2, { 'font-size': 12.5, fill: '#fff', 'fill-opacity': .75 });
  T(svg, 828, 68, h.nf(c0.value, c0.dec || 0) + (c0.unit || ''), { 'text-anchor': 'end', 'font-size': 46, 'font-weight': 700, fill: '#fff', 'data-b': 2, 'data-fx': 'count', 'data-count': c0.value, 'data-dec': c0.dec || 0, 'data-suf': c0.unit || '', 'data-carry': c0.carry || null });
  if (n) { E('path', { d: 'M584 100 V' + BY + ' M' + cxs[0] + ' ' + BY + ' H' + cxs[n - 1], fill: 'none', stroke: C.g65, 'stroke-width': 2.2, 'stroke-linejoin': 'round', 'data-b': 3, 'data-fx': 'draw', 'data-ms': 520 }, svg) }
  nodes.forEach(function (o, k) { var x0 = cxs[k] - CWd / 2, col = o.color || (k === 0 || k === 3 ? 'main' : 'cmp'), cc = h.col(col), g = E('g', { 'data-b': 4, 'data-fx': 'rise', 'data-key': o.title || '' }, svg);
    E('path', { d: 'M' + cxs[k] + ' ' + BY + ' V' + (CY - 1), fill: 'none', stroke: cc, 'stroke-width': 2.2, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 420 }, svg);
    E('path', { d: 'M' + (cxs[k] - 6) + ' ' + (CY - 11) + ' L' + cxs[k] + ' ' + (CY - 1) + ' L' + (cxs[k] + 6) + ' ' + (CY - 11), fill: 'none', stroke: cc, 'stroke-width': 2.2, 'data-b': 3, 'data-fx': 'fade' }, svg);
    E('rect', { x: x0, y: CY, width: CWd, height: 512 - CY, rx: 14, fill: '#fff', stroke: C.line }, g); E('rect', { x: x0 + 18, y: CY, width: CWd - 36, height: 5, rx: 2.5, fill: cc }, g);
    E('circle', { cx: x0 + 30, cy: CY + 36, r: 12, fill: cc }, g); T(g, x0 + 30, CY + 40.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    T(g, x0 + 50, CY + 41, o.title, { 'font-size': fit2(o.title, 16.5, CWd - 66), 'font-weight': 700, fill: C.ink });
    cval(g, x0 + 24, CY + 106, o, col);
    var dy = o.s1 ? sline(g, x0 + 24, CY + 138, o.s1, CWd - 44, 13, C.sub) : 0, dy2 = o.s2 ? sline(g, x0 + 24, CY + 138 + dy + 3, o.s2, CWd - 44, 13, C.mute) : 0;
    var my = CY + 138 + dy + dy2 + 14; mini(g, o.mini, x0 + 24, my, CWd - 48, 512 - 10 - my) });
  ctx.root.setAttribute('data-gap', 300); ctx.root.setAttribute('data-stg', 110) };
function fit2(s, size, w) { while (size > 13.5 && h.textW(s || '', size, 1) > w) size -= .5; return size }

ECOM.parts.hub = function (bd, s, ctx) { if (s.layout === 'map' && ECOM.gm && ECOM.gm.ok(s)) return ECOM.gm.hub(bd, s, ctx); var f = NEW[s.layout]; return f ? f(bd, s, ctx) : baseHub(bd, s, ctx) };
ECOM.parts.hub.layouts = ['default', 'grid', 'branch', 'map'];
})();
