/* hub — 가운데 숫자 + 네 칸(숫자 하나 · 설명 두 줄 · 작은 차트) — CW48 4장 「금리차가 닿는 네 경로」
   center{label,value,dec,unit,sub1,sub2,carry} · nodes[4]{title,value,dec,unit,s1,s2,color,mini}
   mini : {type:'bars',labels,data,dec} | {type:'negbars',labels,data,dec} | {type:'line',data,first,last,marks:[{i,text,pos}],lo,hi,color}
          | {type:'lines',series:[{data,color,name}],first,last,lo,hi}
   layout(없으면 default = 위 그림, 같은 칸 그대로) : grid 2×2 맞붙은 네 칸 + 가운데 원(연결선 없음) · branch 맨 위 막대에서 가지가 갈라져 아래 네 칸 카드(위 → 아래)
   branch 칸: tone(또는 color)을 주지 않으면 네 칸 모두 한 색 · 칸마다 icon:'tf:<코드>'(국기 · 이모지, 제목 앞에 그려짐)
   burst 가운데 원에서 값 크기대로 원이 하나씩 터져 나옴 {center{label,value,dec,unit,sub} · nodes[4~7]{title,value,dec,unit,size,tone:main|warn|cmp,text} · legend[{tone,text}]}
   tags 가운데 망 둘레로 질문 태그가 차례로 쳐짐 {center{label,sub} · tags[5~6]{q,kind:a|b|c} · kinds{a,b,c} 이름 · note} */
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
  nodes.forEach(function (o, k) { var x0 = cxs[k] - CWd / 2, col = o.tone || o.color || 'main', cc = h.col(col), g = E('g', { 'data-b': 4, 'data-fx': 'rise', 'data-key': o.title || '' }, svg);   /* 색 = 칸의 tone(color)이 있을 때만 다르게, 없으면 모두 한 색 */
    E('path', { d: 'M' + cxs[k] + ' ' + BY + ' V' + (CY - 1), fill: 'none', stroke: cc, 'stroke-width': 2.2, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 420 }, svg);
    E('path', { d: 'M' + (cxs[k] - 6) + ' ' + (CY - 11) + ' L' + cxs[k] + ' ' + (CY - 1) + ' L' + (cxs[k] + 6) + ' ' + (CY - 11), fill: 'none', stroke: cc, 'stroke-width': 2.2, 'data-b': 3, 'data-fx': 'fade' }, svg);
    E('rect', { x: x0, y: CY, width: CWd, height: 512 - CY, rx: 14, fill: '#fff', stroke: C.line }, g); 
    E('circle', { cx: x0 + 30, cy: CY + 36, r: 12, fill: cc }, g); T(g, x0 + 30, CY + 40.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    var ix = ECOM.u.tfSvg(g, o.icon, x0 + 50, CY + 21, 30, ctx) ? 36 : 0;
    T(g, x0 + 50 + ix, CY + 41, o.title, { 'font-size': fit2(o.title, 16.5, CWd - 66 - ix), 'font-weight': 700, fill: C.ink });
    cval(g, x0 + 24, CY + 106, o, col);
    var dy = o.s1 ? sline(g, x0 + 24, CY + 138, o.s1, CWd - 44, 13, C.sub) : 0, dy2 = o.s2 ? sline(g, x0 + 24, CY + 138 + dy + 3, o.s2, CWd - 44, 13, C.mute) : 0;
    var my = CY + 138 + dy + dy2 + 14; mini(g, o.mini, x0 + 24, my, CWd - 48, 512 - 10 - my) });
  ctx.root.setAttribute('data-gap', 300); ctx.root.setAttribute('data-stg', 110) };
/* burst 터져 나오는 원 : 가운데 원 → 원이 중심에서 튀어나와 자리에 앉음(원 넓이 = 값 크기). 이름은 원 옆, 값은 원 안 */
NEW.burst = function (bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), c0 = s.center || {}, nodes = (s.nodes || []).slice(0, 7), N = nodes.length, cx = 584, cy = 254, RX = N > 5 ? 410 : 390, RY = 168, onC = ctx.dark ? P.bg : '#fff', items = [];
  if (!N) return;
  var mx = Math.max.apply(null, nodes.map(function (o) { return Math.abs(o.size != null ? o.size : o.value) || 1 })), TN = { main: P.main, warn: P.warn, cmp: P.cmp };
  var rays = E('g', {}, svg), ring = E('g', {}, svg);
  var hub = E('g', { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 460, 'data-carry-host': c0.carry || 'hub' }, svg); E('circle', { cx: cx, cy: cy, r: 84, fill: ctx.dark ? P.main : P.dark }, hub);
  var hc = ctx.dark ? P.bg : '#fff', tl = h.wrap(c0.label || '', 15.5, 130, 1).slice(0, 2), y0 = cy - (c0.value != null ? 26 : 8) - (tl.length - 1) * 9;
  tl.forEach(function (l, j) { T(hub, cx, y0 + j * 19, l, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: hc, 'fill-opacity': .92 }) });
  if (c0.value != null) T(hub, cx, cy + 20, h.nf(c0.value, c0.dec || 0) + (c0.unit || ''), { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: hc });
  if (c0.sub) h.wrap(c0.sub, 12.5, 124).slice(0, 2).forEach(function (l, j) { T(hub, cx, cy + 44 + j * 16, l, { 'text-anchor': 'middle', 'font-size': 12.5, fill: hc, 'fill-opacity': .82 }) });
  var STEP = Math.min(560, Math.round(2900 / N));
  nodes.forEach(function (o, i) { var a = -Math.PI / 2 + i * 2 * Math.PI / N, r = 54 + 28 * Math.sqrt((Math.abs(o.size != null ? o.size : o.value) || 1) / mx), bx = cx + RX * Math.cos(a), by = cy + RY * Math.sin(a), col = TN[o.tone] || P.main, t = 450 + i * STEP;
    var g = E('g', { 'data-key': o.title || '' }, ring), dx = bx - cx, dy = by - cy, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, a1 = 90, a2 = L - r - 4;
    if (a2 - a1 > 16) { var ray = E('path', { d: 'M' + (cx + ux * a1).toFixed(1) + ' ' + (cy + uy * a1).toFixed(1) + ' L' + (cx + ux * a2).toFixed(1) + ' ' + (cy + uy * a2).toFixed(1), fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-dasharray': '1 7' }, rays); items.push({ el: ray, at: t, ms: 360, kf: [{ opacity: 0 }, { opacity: 1 }] }) }
    var bg = E('g', { style: 'transform-origin:' + bx.toFixed(1) + 'px ' + by.toFixed(1) + 'px' }, g); E('circle', { cx: bx, cy: by, r: r, fill: col }, bg);
    var vs = h.nf(o.value, o.dec || 0) + (o.unit || ''), fs = 25; while (fs > 13 && h.textW(vs, fs, 1) > 2 * r - 16) fs -= .5; T(bg, bx, by + fs * .36, vs, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: onC });
    items.push({ el: bg, at: t, ms: 640, ease: 'cubic-bezier(.2,.9,.25,1.15)', kf: [{ opacity: 0, transform: 'translate(' + (-dx).toFixed(1) + 'px,' + (-dy).toFixed(1) + 'px) scale(.18)' }, { opacity: 1, transform: 'translate(0px,0px) scale(1)' }] });
    var right = bx >= cx - 4, lx = right ? bx + r + 14 : bx - r - 14, an = right ? 'start' : 'end', lab = E('g', {}, g), ll = h.wrap(o.title || '', 17, 150, 1).slice(0, 2), tx = o.text ? h.wrap(o.text, 14, 150).slice(0, 2) : [], hh = ll.length * 21 + tx.length * 18, ty0 = by - hh / 2 + 16;
    ll.forEach(function (l, j) { T(lab, lx, ty0 + j * 21, l, { 'text-anchor': an, 'font-size': 17, 'font-weight': 700, fill: P.ink }) });
    tx.forEach(function (l, j) { T(lab, lx, ty0 + ll.length * 21 + j * 18, l, { 'text-anchor': an, 'font-size': 14, fill: P.sub }) });
    items.push({ el: lab, at: t + 260, ms: 420, kf: [{ opacity: 0 }, { opacity: 1 }] }) });
  var lg = E('g', {}, svg), lx0 = 4; (s.legend || []).forEach(function (q) { E('circle', { cx: lx0 + 8, cy: 496, r: 8, fill: TN[q.tone] || P.main }, lg); T(lg, lx0 + 22, 500.5, q.text, { 'font-size': 12.5, fill: P.sub }); lx0 += 44 + h.textW(q.text, 12.5, 0) });
  T(lg, lx0 + 4, 500.5, '원 넓이 = 값 크기', { 'font-size': 12.5, fill: P.mute });
  ctx.root._hook = function () { if (h.RM()) return 0; var e = 0; items.forEach(function (it) { if (!it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; e = Math.max(e, it.at + it.ms) }); return e };
  ctx.root.setAttribute('data-gap', 300) };

/* tags 질문 태그 : 가운데 망(점 · 선) 둘레에 질문 칸이 차례로 켜지고 글자가 쳐짐 → 망의 한 점과 이어짐. 질문 색 = 종류(kinds) */
NEW.tags = function (bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), c0 = s.center || {}, tg = (s.tags || []).slice(0, 6), kinds = s.kinds || {}, cx = 584, cy = 244, items = [], KC = { a: P.main, b: P.warn, c: P.cmp }, ws = ctx.dark ? P.bg : '#fff';
  var out = [], inn = [], used = {}; for (var i = 0; i < 12; i++) { var th = i * Math.PI / 6 + Math.PI / 12; out.push([cx + 196 * Math.cos(th), cy + 168 * Math.sin(th)]) }
  for (var i2 = 0; i2 < 6; i2++) { var th2 = i2 * Math.PI / 3; inn.push([cx + 100 * Math.cos(th2), cy + 84 * Math.sin(th2)]) }
  var ng = E('g', {}, svg), ln0 = function (p, q) { E('line', { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1), stroke: P.g40, 'stroke-width': 1.6 }, ng) };
  out.forEach(function (p, i) { ln0(p, out[(i + 1) % 12]); inn.map(function (q, j) { return [Math.hypot(p[0] - q[0], p[1] - q[1]), j] }).sort(function (u, v) { return u[0] - v[0] }).slice(0, 2).forEach(function (u) { ln0(p, inn[u[1]]) }) });
  inn.forEach(function (p, i) { ln0(p, inn[(i + 1) % 6]) });
  out.forEach(function (p) { E('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 6, fill: P.g65 }, ng) }); inn.forEach(function (p) { E('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5, fill: P.main }, ng) });
  var pts = out;
  var cg = E('g', { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 420 }, svg), cw = Math.max(170, h.textW(c0.label || '', 21, 1) + 48), cl = ctx.dark ? P.main : P.dark;
  E('rect', { x: cx - cw / 2, y: cy - 36, width: cw, height: c0.sub ? 82 : 58, rx: 12, fill: cl }, cg); T(cg, cx, cy - 6, c0.label || '', { 'text-anchor': 'middle', 'font-size': 21, 'font-weight': 800, fill: ws });
  if (c0.sub) T(cg, cx, cy + 25, c0.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: ws, 'fill-opacity': .85 });
  var SP = [[18, 40], [18, 176], [18, 316], [0, 84], [0, 228], [0, 372]], order = [0, 3, 1, 4, 2, 5], STEP = 520;
  tg.forEach(function (q, i) { var slot = SP[order[i]], left = order[i] < 3, col = KC[q.kind] || P.main, ln = h.wrap(q.q || '', 17, 296, 1).slice(0, 2), w = Math.min(356, Math.max.apply(null, ln.map(function (l) { return h.textW(l, 17, 1) })) + 64), hh = 28 + ln.length * 22, x = left ? slot[0] : 1168 - 18 - w, y = slot[1], t = 400 + i * STEP;
    var g = E('g', { 'data-key': q.q || '' }, svg), pg = E('g', { style: 'transform-box:fill-box;transform-origin:' + (left ? '0% 50%' : '100% 50%') }, g);
    E('rect', { x: x, y: y, width: w, height: hh, rx: 10, fill: ctx.dark ? P.paper : '#fff', stroke: col, 'stroke-width': 2 }, pg); E('circle', { cx: x + 20, cy: y + hh / 2, r: 6, fill: col }, pg);
    var tx = E('g', {}, pg); ln.forEach(function (l, j) { T(tx, x + 40, y + 26 + j * 22, l, { 'font-size': 17, 'font-weight': 700, fill: P.ink }) });
    var ex = left ? x + w : x, ey = y + hh / 2, best = null, bd2 = 1e9, bi = -1; pts.forEach(function (p, pi) { var d2 = Math.hypot(p[0] - ex, p[1] - ey) + (used[pi] ? 900 : 0); if (d2 < bd2) { bd2 = d2; best = p; bi = pi } }); used[bi] = 1;
    var lk = E('path', { d: 'M' + ex + ' ' + ey + ' L' + best[0].toFixed(1) + ' ' + best[1].toFixed(1), fill: 'none', stroke: col, 'stroke-width': 2, pathLength: 1, 'stroke-dasharray': 1 }, g), dot = E('circle', { cx: best[0].toFixed(1), cy: best[1].toFixed(1), r: 8, fill: 'none', stroke: col, 'stroke-width': 2.4 }, g);
    items.push({ el: pg, at: t, ms: 360, ease: 'cubic-bezier(.2,.8,.2,1)', kf: [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'scale(1)' }] });
    items.push({ el: tx, at: t + 260, ms: 480, ease: 'steps(14)', kf: [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }] });
    items.push({ el: lk, at: t + 700, ms: 360, kf: [{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .97, opacity: 1, offset: .03 }, { strokeDashoffset: 0, opacity: 1 }] }); items.push({ el: dot, at: t + 1000, ms: 300, kf: [{ opacity: 0 }, { opacity: 1 }] }) });
  var lg = E('g', {}, svg), lx0 = 4; ['a', 'b', 'c'].forEach(function (k) { if (!kinds[k]) return; E('circle', { cx: lx0 + 8, cy: 496, r: 7, fill: KC[k] }, lg); T(lg, lx0 + 22, 500.5, kinds[k], { 'font-size': 12.5, fill: P.sub }); lx0 += 44 + h.textW(kinds[k], 12.5, 0) });
  if (s.cap) T(svg, 1164, 500.5, s.cap, { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute });
  ctx.root._hook = function () { if (h.RM()) return 0; var e = 0; items.forEach(function (it) { if (!it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; e = Math.max(e, it.at + it.ms) }); return e };
  ctx.root.setAttribute('data-gap', 300) };
function fit2(s, size, w) { while (size > 13.5 && h.textW(s || '', size, 1) > w) size -= .5; return size }

ECOM.parts.hub = function (bd, s, ctx) { if (s.layout === 'map' && ECOM.gm && ECOM.gm.ok(s)) return ECOM.gm.hub(bd, s, ctx); var f = NEW[s.layout]; return f ? f(bd, s, ctx) : baseHub(bd, s, ctx) };
ECOM.parts.hub.layouts = ['default', 'grid', 'branch', 'map', 'burst', 'tags'];
ECOM.parts.hub.dark = ['burst', 'tags'];
})();
