/* waffle — 칸 채우기 : 빈 칸 판(100칸 = 100% 또는 달력 칸)이 깔리고 칸이 차례로 채워짐(마지막 칸은 부분) → 큰 숫자 굴림 → 오른쪽 작은 분석 차트
   grids[{label,sub,value(채울 칸 수 · 소수 가능),n(기본 100),cols(기본 10),fill:[칸 번호](value 대신 낱칸 지정),na:[자료 없는 칸],rowLabels,colLabels,rowUnit,big(true|{value,dec,unit}),color}]
   2판 칸 value · label · rest 도 받음(판 하나) · unit(기본 '%') · dec · legend[{text,color,type:'box|na'}]
   side{type:'line|bars',title,labels,data | series[{name,data,color}],unit,dec,marks:'auto'} — 오른쪽 작은 차트(추세 · 연도별 수) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function mini(svg, x, y, w, ht, cf, t0) { var g = h.at(svg, t0, { 'data-fx': 'fade' }), unit = cf.unit || '', dec = cf.dec != null ? cf.dec : 1, F = function (v) { return h.nf(v, dec) + unit };
  E('rect', { x: x, y: y, width: w, height: ht, rx: 12, fill: '#fff', stroke: C.line }, g); T(g, x + 20, y + 30, cf.title || '', { 'font-size': 14.5, 'font-weight': 700, fill: C.ink });
  var px = x + 24, pw = w - 48, py = y + 64, ph = ht - 64 - 44, L = cf.labels || [], ser = cf.series || [{ data: cf.data, color: 'main' }], n = L.length || ser[0].data.length, all = [];
  ser.forEach(function (q) { all = all.concat(q.data) }); var e = h.ext(all);
  if (cf.type === 'bars') { var lo = Math.min(0, e[0]), Yb = h.lin(lo, e[1] * 1.12, py + ph, py), sl = pw / n, k = ser.length, bw = Math.min(28, sl * .7 / k);
    E('line', { x1: px, x2: px + pw, y1: Yb(0), y2: Yb(0), stroke: C.axis }, g);
    ser.forEach(function (q, j) { var c = h.col(q.color || (j ? 'cmp' : 'main')); q.data.forEach(function (v, i) { if (v == null) return; var bx = px + sl * (i + .5) - k * bw / 2 - (k - 1) + j * (bw + 2);
      E('rect', { x: bx, y: Math.min(Yb(v), Yb(0)), width: bw, height: Math.max(1.5, Math.abs(Yb(v) - Yb(0))), rx: 2, fill: c, 'data-at': t0 + 120 + i * 60, 'data-fx': 'grow' }, svg);
      T(g, bx + bw / 2, Yb(Math.max(0, v)) - 6, h.nf(v, dec) + (k > 1 ? '' : unit), { 'text-anchor': 'middle', 'font-size': k > 1 ? 12 : 13, 'font-weight': 700, fill: k > 1 ? c : C.dark }) }) });
    L.forEach(function (l, i) { T(g, px + sl * (i + .5), py + ph + 20, l, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
    if (k > 1) { var lx = px; ser.forEach(function (q, j) { var c = h.col(q.color || (j ? 'cmp' : 'main')); E('rect', { x: lx, y: py + ph + 30, width: 12, height: 10, rx: 2, fill: c }, g); T(g, lx + 17, py + ph + 40, q.name + (unit ? '(' + unit + ')' : ''), { 'font-size': 12.5, fill: C.sub }); lx += 30 + h.textW(q.name + '(' + unit + ')', 12.5) }) } }
  else { var d = ser[0].data, Yl = h.lin(e[0] - (e[1] - e[0]) * .1, e[1] + (e[1] - e[0]) * .12, py + ph, py), Xl = function (i) { return px + i * pw / Math.max(1, n - 1) };
    E('path', { d: h.lineD(d, Xl, Yl), fill: 'none', stroke: C.main, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-at': t0 + 100, 'data-fx': 'draw', 'data-ms': 900 }, svg);
    var mi = 0, ma = 0; d.forEach(function (v, i) { if (v == null) return; if (d[mi] == null || v < d[mi]) mi = i; if (d[ma] == null || v > d[ma]) ma = i });
    var mk = cf.marks && cf.marks !== 'auto' ? cf.marks : [{ at: ma, t: '최고', pos: -1 }, { at: mi, t: '최저', pos: 1 }].concat(n - 1 !== ma && n - 1 !== mi ? [{ at: n - 1, t: '', pos: d[n - 1] > (d[ma] + d[mi]) / 2 ? -1 : 1 }] : []);
    var gm = h.at(svg, t0 + 900, { 'data-fx': 'fade' }); mk.forEach(function (m) { var v = d[m.at], cx = Xl(m.at), cy = Yl(v), t = (m.t ? m.t + ' ' : '') + (L[m.at] ? u2(L[m.at]) + ' ' : '') + F(v), tw = h.textW(t, 12.5, 1), an = cx + tw / 2 > px + pw ? 'end' : cx - tw / 2 < px ? 'start' : 'middle';
      E('circle', { cx: cx, cy: cy, r: 4.5, fill: m.at === n - 1 ? C.main : '#fff', stroke: C.main, 'stroke-width': 2 }, gm); T(gm, an === 'end' ? cx + 4 : an === 'start' ? cx - 4 : cx, m.pos < 0 ? cy - 10 : cy + 21, t, { 'text-anchor': an, 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) });
    if (L.length) { T(g, px, py + ph + 24, u2(L[0]), { 'font-size': 12.5, fill: C.mute }); T(g, px + pw, py + ph + 24, u2(L[n - 1]), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) } }
  return g }
function u2(l) { return ECOM.u.short(l) }
ECOM.parts.waffle = function (bd, s, ctx) {
  var root = ctx.root, grids = s.grids || (s.value != null ? [{ label: s.label, value: s.value, sub: s.rest ? '나머지 = ' + s.rest : '' }] : []); if (!grids.length) return;
  var unit = s.unit == null ? '%' : s.unit, dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), svg = ctx.svg(512), lg = s.legend;
  if (lg) ECOM.u.legendHTML(bd, lg.map(function (it) { return it.type === 'na' ? { type: 'dash', color: 'gray', text: it.text } : { type: 'box', color: it.color || 'main', text: it.text } }), 0);
  var top = lg ? 38 : 4, side = s.side, SW = side ? 380 : 0, GW = 1168 - (side ? SW + 44 : 0), k = grids.length, gw = (GW - (k - 1) * 56) / k, T0 = 700, tEnd = T0;
  grids.forEach(function (gd, gi) { var n = gd.n || 100, cols = gd.cols || 10, rows = Math.ceil(n / cols), rl = gd.rowLabels, cl = gd.colLabels, gx = gi * (gw + 56), lw = rl ? 52 : 0, rw = rl ? 64 : 0, hh = 70, ch = cl ? 24 : 0;
    var cell = Math.min((gw - lw - rw) / cols, (512 - top - hh - ch) / rows, gd.maxCell || 76), gap = Math.max(3, cell * .12), cs = cell - gap, ox = gx + lw + Math.max(0, (gw - lw - rw - cols * cell) / 2), oy = top + hh + ch;
    var fill = gd.fill || null, val = gd.value != null ? +gd.value : (fill ? fill.length : 0), na = gd.na || [], cnt = fill ? fill.length : Math.ceil(val), dt = Math.max(10, Math.min(55, 1300 / Math.max(1, cnt))), col = h.col(gd.color || 'main');
    /* 머리 : 이름 · 큰 숫자 */
    var hg = h.lv(svg, 1); T(hg, gx + lw, top + 18, gd.label || '', { 'font-size': 15.5, 'font-weight': 700, fill: C.ink });
    var big = gd.big === false ? null : (typeof gd.big === 'object' ? gd.big : { value: val, dec: dec, unit: unit }), bx = gx + lw;
    if (big) { var bt = h.nf(big.value, big.dec != null ? big.dec : dec), bw = h.textW(bt, 34, 1) * .95; T(svg, bx + bw, top + 56, bt, { 'text-anchor': 'end', 'font-size': 34, 'font-weight': 700, fill: col === C.main ? C.dark : col, 'data-at': T0, 'data-fx': 'count', 'data-count': big.value, 'data-dec': big.dec != null ? big.dec : dec, 'data-ms': Math.min(1300, cnt * dt + 200) });
      T(hg, bx + bw + 3, top + 56, big.unit != null ? big.unit : unit, { 'font-size': 18, 'font-weight': 700, fill: C.dark }); bx += bw + h.textW(big.unit != null ? big.unit : unit, 18, 1) + 18 }
    if (gd.sub) T(hg, bx, top + 54, gd.sub, { 'font-size': 13.5, fill: C.mute });
    /* 칸 */
    var tg = h.lv(svg, 1, { 'data-fx': 'fade' }), on = {}; if (fill) fill.forEach(function (i) { on[i] = 1 }); var nas = {}; na.forEach(function (i) { nas[i] = 1 });
    if (cl) cl.forEach(function (t, c) { T(tg, ox + c * cell + cs / 2, oy - 8, t, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
    var order = 0, rowCnt = [];
    for (var i = 0; i < n; i++) { var r = Math.floor(i / cols), c = i % cols, x = ox + c * cell, y = oy + r * cell;
      if (nas[i]) { E('rect', { x: x + .5, y: y + .5, width: cs - 1, height: cs - 1, rx: 3, fill: 'none', stroke: C.gray, 'stroke-dasharray': '3 3' }, tg); continue }
      E('rect', { x: x, y: y, width: cs, height: cs, rx: 3, fill: C.light }, tg);
      var part = fill ? (on[i] ? 1 : 0) : Math.max(0, Math.min(1, val - i)); if (part > 0) { rowCnt[r] = (rowCnt[r] || 0) + 1;
        E('rect', { x: x, y: y, width: cs * part, height: cs, rx: 3, fill: col, 'data-at': T0 + order * dt, 'data-fx': 'pop', 'data-ms': 240 }, svg); order++ } }
    if (rl) rl.forEach(function (t, r) { T(tg, ox - 10, oy + r * cell + cs / 2 + 5, t, { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.sub });
      T(svg, ox + cols * cell + 6, oy + r * cell + cs / 2 + 5, (rowCnt[r] || 0) + (gd.rowUnit || '개'), { 'font-size': 13.5, 'font-weight': 700, fill: rowCnt[r] ? C.dark : C.mute, 'data-at': T0 + order * dt + 100, 'data-fx': 'fade' }) });
    tEnd = Math.max(tEnd, T0 + order * dt + 300) });
  if (side) mini(svg, 1168 - SW, top + 4, SW, 512 - top - 8, side, tEnd + 200);
  root.setAttribute('data-gap', 300);
};
})();
