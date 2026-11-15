/* formula — 정의 · 계산 장 : 식 → 뺄셈(또는 더하기) 막대 → 오른쪽 추이 + 번호 표식 + 상자 — CW48 부록 A4 틀
   eq[{t,k:'r|g'}|{op}] · op('−'|'+') · cols[{name,sub,a:{label,value},b:{label,value},r:{label,value}}] · dec · unit
   chart{labels,series:[{name,data,color}],y,markers:[{s,at,n,v}],box:{title,items:[{n,text,color}]},range} 
   배치 s.layout : default(없음) · invoice 계산서형(열마다 영수증 한 장 · 점선 · 겹줄 · 합계 띠, chart 안 씀) · blocks 블록 더하기(같은 눈금 블록, 부분이 쌓여 합계와 같은 높이, chart 안 씀) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, HN = 0;
function base(bd, s, ctx) {
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
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 90) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ── */
function opOf(s) { var o = (s.eq || []).filter(function (x) { return x.op }); return s.op || (o[1] ? o[1].op : '−') }
function eqText(s) { return (s.eq || []).map(function (x) { return x.op || x.t }).join(' ') }
function dashed(g, x1, x2, y, c, da) { return E('line', { x1: x1, x2: x2, y1: y, y2: y, stroke: c, 'stroke-dasharray': da || '4 4' }, g) }
/* invoice — 계산서형 : 열마다 영수증 한 장. 항목 줄(점선 잇기) → 겹줄 → 합계 띠 → 산식 */
function invoice(bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), cols = s.cols || [], N = Math.max(1, cols.length), gap = 28, cw = Math.min(560, (1168 - (N - 1) * gap) / N), dec = s.dec == null ? 2 : s.dec, un = s.unit || '', op = opOf(s), H0 = 486, t0 = (1168 - (N * cw + (N - 1) * gap)) / 2;
  cols.forEach(function (c, k) { var x0 = t0 + k * (cw + gap), L = x0 + 28, R = x0 + cw - 28, g = E('g', { 'data-b': 1, 'data-fx': 'rise', 'data-ms': 520, 'data-key': c.name }, svg), d = 'M' + x0 + ' 0 H' + (x0 + cw) + ' V' + H0;
    for (var zx = x0 + cw; zx > x0 + 1; zx -= 14) d += ' L' + Math.max(x0, zx - 7) + ' ' + (H0 + 9) + ' L' + Math.max(x0, zx - 14) + ' ' + H0;
    E('path', { d: d + ' Z', fill: '#fff', stroke: P.line, 'stroke-width': 1.2 }, g);
    T(g, L, 46, c.name, { 'font-size': 26, 'font-weight': 700, fill: P.ink }); if (c.sub) T(g, R, 46, c.sub, { 'text-anchor': 'end', 'font-size': 13, fill: P.mute });
    dashed(g, L, R, 66, P.axis); T(g, L, 94, '항목', { 'font-size': 12.5, fill: P.mute }); T(g, R, 94, '값' + (un ? ' (' + un + ')' : ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute });
    [[c.a, '', 2], [c.b, op + ' ', 3]].forEach(function (r, i) { var y = 152 + i * 78, row = E('g', { 'data-b': r[2], 'data-fx': i ? 'left' : 'fade', 'data-ms': 480, 'data-key': r[0].label }, svg), lab = r[1] + r[0].label, vt = h.nf(r[0].value, dec) + un, lx = L + h.textW(lab, 19, 1) + 12, rx = R - h.textW(vt, 26, 1) - 12;
      T(row, L, y, lab, { 'font-size': 19, 'font-weight': 700, fill: i ? P.sub : P.ink }); T(row, R, y, vt, { 'text-anchor': 'end', 'font-size': 26, 'font-weight': 700, fill: i ? P.sub : P.ink });
      if (rx > lx) E('line', { x1: lx, x2: rx, y1: y - 5, y2: y - 5, stroke: P.axis, 'stroke-width': 2, 'stroke-dasharray': '1 6', 'stroke-linecap': 'round' }, row) });
    E('line', { x1: L, x2: R, y1: 244, y2: 244, stroke: P.ink, 'stroke-width': 1.6, 'data-b': 4 }, svg); E('line', { x1: L, x2: R, y1: 250, y2: 250, stroke: P.ink, 'stroke-width': 1.6, 'data-b': 4 }, svg);
    var tg = E('g', { 'data-b': 4, 'data-fx': 'pop', 'data-ms': 520, 'data-key': c.r.label }, svg); E('rect', { x: x0 + 14, y: 268, width: cw - 28, height: 116, rx: 12, fill: P.g08 }, tg);
    T(tg, L + 6, 332, c.r.label, { 'font-size': 22, 'font-weight': 700, fill: P.dark });
    T(svg, R - 6, 346, h.nf(c.r.value, dec) + un, { 'text-anchor': 'end', 'font-size': 56, 'font-weight': 700, fill: P.dark, 'data-b': 4, 'data-fx': 'count', 'data-count': c.r.value, 'data-from': c.a.value, 'data-dec': dec, 'data-suf': un, 'data-ms': 900 });
    var fy = 424, fl = h.wrap(eqText(s), 13.5, cw - 56); T(svg, L, fy, '산식', { 'font-size': 12.5, 'font-weight': 700, fill: P.mute, 'data-b': 5, 'data-fx': 'fade' });
    fl.slice(0, 2).forEach(function (t, i) { T(svg, L, fy + 22 + i * 20, t, { 'font-size': 14, fill: P.sub, 'data-b': 5, 'data-fx': 'fade' }) }) });
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 110) }
/* blocks — 블록 더하기 : 같은 눈금의 블록. 부분 블록(빗금 = 빼는 값)이 쌓여 합계 블록과 같은 높이가 됨 */
function blocks(bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), cols = s.cols || [], N = Math.max(1, cols.length), gap = 24, cw = (1168 - (N - 1) * gap) / N, dec = s.dec == null ? 2 : s.dec, un = s.unit || '', op = opOf(s), base0 = 466, Hs = 396, bw = N > 1 ? 150 : 200, MIN = 24;
  var pid = 'hblk' + (++HN) + Math.floor(Math.random() * 1e4), df = E('defs', {}, svg), pt = E('pattern', { id: pid, width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, df);
  E('rect', { width: 8, height: 8, fill: '#DCE2DF' }, pt); E('line', { x1: 0, x2: 0, y1: 0, y2: 8, stroke: '#C4CCC8', 'stroke-width': 3 }, pt);
  var model = cols.map(function (c) { var a = c.a.value, b = c.b.value, r = c.r.value, m;
    if (op === '+') m = { whole: { t: c.r, v: r }, parts: [{ t: c.a, v: a, f: P.g65 }, { t: c.b, v: b, f: P.main }] };
    else if (r >= 0) m = { whole: { t: c.a, v: a }, parts: [{ t: c.b, v: b, f: 'url(#' + pid + ')', hatch: 1 }, { t: c.r, v: r, f: P.dark, res: 1 }] };
    else m = { whole: { t: c.b, v: b }, parts: [{ t: c.a, v: a, f: P.g65 }, { t: c.r, v: -r, f: P.cmp, res: 1, neg: 1 }] };
    return m }), mx = Math.max.apply(null, model.map(function (m) { return m.whole.v })) || 1, content = bw * 2 + 64 + 20 + 176;
  cols.forEach(function (c, k) { var m = model[k], x0 = k * (cw + gap) + Math.max(0, (cw - content) / 2), wh = Math.max(60, Hs * m.whole.v / mx), top = base0 - wh, gk = E('g', { 'data-b': 1, 'data-fx': 'fade' }, svg);
    T(gk, x0, 30, c.name, { 'font-size': 26, 'font-weight': 700, fill: P.ink }); if (c.sub) T(gk, x0 + h.textW(c.name, 26, 1) + 12, 30, c.sub, { 'font-size': 13, fill: P.mute });
    var wg = E('g', { 'data-b': 2, 'data-fx': 'grow', 'data-ms': 560, 'data-key': m.whole.t.label }, svg); E('rect', { x: x0, y: top, width: bw, height: wh, rx: 4, fill: P.g40 }, wg);
    var wl = E('g', { 'data-b': 2, 'data-fx': 'fade', 'data-ms': 560 }, svg); T(wl, x0 + bw / 2, top + wh / 2 - 4, m.whole.t.label, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: P.ink }); T(wl, x0 + bw / 2, top + wh / 2 + 26, h.nf(m.whole.v, dec) + un, { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: P.ink });
    T(svg, x0 + bw + 32, top + wh / 2 + 14, '=', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 700, fill: P.mute, 'data-b': 2, 'data-fx': 'fade' });
    var sx = x0 + bw + 64, y = base0, hs = m.parts.map(function (q) { return Math.max(MIN, wh * q.v / m.whole.v) }), sum = hs[0] + hs[1];
    if (sum !== wh) { var big = hs[0] >= hs[1] ? 0 : 1; hs[big] -= sum - wh }
    dashed(svg, x0 + bw + 4, sx + bw + 8, top, P.axis, '3 4'); svg.lastChild.setAttribute('data-b', 4);
    m.parts.forEach(function (q, i) { var hh = hs[i], yy = y - hh, pg = E('g', { 'data-b': 3 + i, 'data-fx': 'drop', 'data-dy': 200, 'data-ms': 640, 'data-key': q.t.label }, svg); E('rect', { x: sx, y: yy, width: bw, height: hh, rx: 3, fill: q.f, stroke: q.res ? P.dark : '#fff', 'stroke-width': q.res ? 2.2 : 1.5 }, pg);
      var lx = sx + bw + 20, ly = yy + hh / 2, lb = (q.neg ? '(−) ' : (i ? op + ' ' : '')) + q.t.label;
      var tl = E('g', { 'data-b': 3 + i, 'data-fx': 'fade', 'data-ms': 600 }, svg); E('line', { x1: sx + bw + 2, x2: lx - 4, y1: ly, y2: ly, stroke: P.axis }, tl);
      if (q.res) { T(tl, lx, ly - 8, q.t.label, { 'font-size': 15, 'font-weight': 700, fill: P.main }); T(svg, lx, ly + 28, h.nf(c.r.value, dec) + un, { 'font-size': 36, 'font-weight': 700, fill: P.dark, 'data-b': 4, 'data-fx': 'count', 'data-count': c.r.value, 'data-from': 0, 'data-dec': dec, 'data-suf': un, 'data-ms': 800 }) }
      else { T(tl, lx, ly - 4, lb, { 'font-size': 15.5, 'font-weight': 600, fill: P.sub }); T(tl, lx, ly + 22, h.nf(q.v, dec) + un, { 'font-size': 24, 'font-weight': 700, fill: P.sub }) }
      y = yy });
    E('line', { x1: x0 - 10, x2: sx + bw + 10, y1: base0, y2: base0, stroke: P.axis, 'data-b': 2 }, svg) });
  T(svg, 0, 502, '식 : ' + eqText(s), { 'font-size': 13, fill: P.mute, 'data-b': 5, 'data-fx': 'fade' });
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 110) }
var LAY = { invoice: invoice, blocks: blocks }, baseFn = base;
ECOM.parts.formula = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.formula.layouts = ['default', 'invoice', 'blocks'];
})();
