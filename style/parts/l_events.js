/* events — 사건 주석 선 : 선(1~2줄) 위에 번호 동그라미 + 꼬리표(위아래 엇갈림), 국면 띠 · 아래 작은 보조 선 · 끝 값 상자
   labels · series[{name,data,color,dash,end}] · unit · dec · y{min,max,step,dec} · area(기본 줄 1개면 true) · events[{at,text}] (3~8개) · evPos 'top'(기본, 선 위 꼬리표) | 'bottom'(아래 번호 띠)
   bands[{from,to,name,tone:'main'|'warn'|'soft'}] · marks[{at,s,text,tone:'main'|'warn',pos:'above'|'below'}] 강조 점 · callout{text,at,s} 끝 값 상자
   lower{name,unit,data,dec,y{min,max}} 아래 작은 보조 선 · 쌓기 : 축 · 띠 → 면 → 선 그리기 → 사건 하나씩 → 강조 점 → 상자 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.events = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, ser = (s.series || []).filter(function (q) { return q && q.data && q.data.length }), labels = s.labels || []; if (!ser.length) return;
  var n = Math.max(labels.length, ser[0].data.length), W = 1168, evs = (s.events || []).slice(0, 8), bands = s.bands || [], lo = s.lower, top = s.evPos !== 'bottom';
  var multi = ser.length > 1 && ser.some(function (q) { return q.name }), x0 = 64, x1 = W - (multi ? 84 : 36), X = function (i) { return x0 + (x1 - x0) * i / Math.max(1, n - 1) };
  var unit = s.unit || '', dec = s.dec != null ? s.dec : 0, F = function (v) { return h.nf(v, dec) + unit };
  /* 아래 번호 띠 줄 배치 */
  var rows = [], items = [];
  if (!top) evs.forEach(function (e, k) { var tw = h.textW(e.text || '', 13.5, true), w = 26 + tw, st = Math.max(0, Math.min(X(e.at) - 10, W - w)), r = 0;
    for (; r < 3; r++) { if (rows[r] == null || st >= rows[r] + 14) break } if (r > 2) r = 2; st = Math.max(st, rows[r] == null ? 0 : rows[r] + 14); rows[r] = st + w; items.push({ k: k, e: e, r: r, st: st }) });
  var nrow = top ? 0 : Math.max(1, rows.length), evH = top ? 0 : nrow * 28 + 6, lowS = lo ? 98 : 0;
  var y0 = top ? 132 : 14, y1 = 480 - evH - lowS, svg = ctx.svg(512);
  /* y 눈금 */
  var all = []; ser.forEach(function (q) { all = all.concat(q.data) });
  var pad = bands.length ? 30 : 0, sc = u.yScale(all, s.y, y0 + pad, y1), Y = sc.Y;
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  /* 국면 띠 */
  var toneFill = { main: C.g18, warn: '#F2D9CF', soft: C.g08 };
  bands.forEach(function (b, i) { var xa = X(b.from), xb = X(b.to), tn = b.tone || (i % 2 ? 'soft' : 'main');
    E('rect', { x: xa, y: y0, width: xb - xa, height: y1 - y0, fill: toneFill[tn] || C.g08, opacity: .75 }, g1);
    T(g1, (xa + xb) / 2, y0 + 19, b.name || '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: tn === 'warn' ? C.warn : C.dark }) });
  u.yAxis(g1, x0, x1, sc, { unit: s.y && s.y.unit });
  var ty = lo ? y1 + 30 + 68 + 22 : y1 + 22, xt = u.xTicks(n, s.xwant || 12, s.ticks);
  u.xLabels(g1, labels, X, ty, xt);
  /* 보조 선 칸 */
  var Z = null, ly0 = y1 + 30, ly1 = ly0 + 68;
  if (lo && lo.data) { var zs = u.yScale(lo.data, Object.assign({ n: 2 }, lo.y || {}), ly0 + 6, ly1);
    T(g1, x0, ly0 - 8, (lo.name || '') + (lo.unit ? ' (' + lo.unit + ')' : ''), { 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
    zs.ticks.forEach(function (v) { T(g1, x0 - 9, zs.Y(v) + 4.5, h.nf(v, lo.dec != null ? lo.dec : zs.dec), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
    E('line', { x1: x0, x2: x1, y1: ly1, y2: ly1, stroke: C.axis }, g1); Z = zs.Y;
    var zp = lo.data.map(function (v, i) { return [X(i), Z(v)] }), zd = zp.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1] }).join(' ');
    E('path', { d: zd + ' L' + X(lo.data.length - 1) + ' ' + ly1 + ' L' + X(0) + ' ' + ly1 + ' Z', fill: C.g18, 'data-at': 700, 'data-fx': 'fade', 'data-ms': 500 }, svg);
    E('path', { d: zd, fill: 'none', stroke: C.g65, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'data-at': 700, 'data-fx': 'draw', 'data-ms': 900 }, svg) }
  /* 선 */
  var cols = ['dark', 'cmp', 'g65'], pts0 = null;
  ser.forEach(function (q, k) { var c = h.col(q.color || cols[k % 3]), pts = [], d = '';
    q.data.forEach(function (v, i) { if (v == null) return; pts.push([X(i), Y(v), i]); d += (d ? ' L' : 'M') + X(i) + ' ' + Y(v) }); if (!k) pts0 = pts;
    if (k === 0 && (s.area != null ? s.area : ser.length === 1) && pts.length) E('path', { d: d + ' L' + pts[pts.length - 1][0] + ' ' + y1 + ' L' + pts[0][0] + ' ' + y1 + ' Z', fill: C.g08, 'data-at': 200, 'data-fx': 'fade', 'data-ms': 600 }, svg);
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': k ? 3 : 3.5, 'stroke-linejoin': 'round', 'stroke-dasharray': q.dash ? '7 5' : null, 'data-at': 200 + k * 150, 'data-fx': q.dash ? 'fade' : 'draw', 'data-ms': 1100 }, svg);
    if (multi && q.name && pts.length) { var lp = pts[pts.length - 1]; q._lab = { x: lp[0] + 10, y: lp[1] + 5, c: c, t: q.name } } });
  if (multi) { var ls = ser.filter(function (q) { return q._lab }).sort(function (a, b) { return a._lab.y - b._lab.y }); for (var li = 1; li < ls.length; li++) if (ls[li]._lab.y - ls[li - 1]._lab.y < 16) ls[li]._lab.y = ls[li - 1]._lab.y + 16;
    var gl = h.at(svg, 1200, { 'data-fx': 'fade' }); ls.forEach(function (q) { T(gl, q._lab.x, q._lab.y, q._lab.t, { 'font-size': 13.5, 'font-weight': 700, fill: q._lab.c }) }) }
  /* 사건 */
  var pt = function (i) { var q = pts0.filter(function (p) { return p[2] === i })[0]; return q ? [q[0], q[1]] : [X(i), y1] };
  if (top) { var cy = 70, slots = [{ y: cy - 24, l: [] }, { y: cy + 36, l: [] }, { y: cy - 46, l: [] }];
    evs.forEach(function (e, k) { var p = pt(e.at), w = h.textW(e.text || '', 13.5, true), pref = k % 2 ? [1, 0, 2] : [0, 1, 2], pick = 2, l0 = Math.max(0, Math.min(p[0] - w / 2, W - w));
      for (var j = 0; j < 3; j++) { var sl = slots[pref[j]]; if (!sl.l.some(function (r) { return l0 < r[1] + 12 && l0 + w > r[0] - 12 })) { pick = pref[j]; break } } slots[pick].l.push([l0, l0 + w]);
      var tm = 900 + k * 180, g = h.at(svg, tm, { 'data-fx': 'fade' });
      E('line', { x1: p[0], x2: p[0], y1: cy + 14, y2: p[1] - 10, stroke: C.gray, 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, g);
      E('circle', { cx: p[0], cy: cy, r: 13, fill: C.dark }, g); T(g, p[0], cy + 5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
      T(g, l0, slots[pick].y, e.text || '', { 'font-size': 13.5, 'font-weight': 600, fill: C.cmp, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' });
      E('circle', { cx: p[0], cy: p[1], r: 6, fill: '#fff', stroke: C.dark, 'stroke-width': 3, 'data-at': tm, 'data-fx': 'pop' }, svg) }) }
  else items.forEach(function (it) { var tm = 1400 + it.k * 150, g = h.at(svg, tm, { 'data-fx': 'fade' }), yy = ty + 30 + it.r * 28;
    E('line', { x1: X(it.e.at), x2: X(it.e.at), y1: y0 + (bands.length ? 30 : 0), y2: lo ? ly1 : y1, stroke: C.axis, 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }, g); E('circle', { cx: X(it.e.at), cy: y1, r: 9, fill: C.dark, stroke: '#fff', 'stroke-width': 2 }, g); T(g, X(it.e.at), y1 + 4.3, String(it.k + 1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }); E('circle', { cx: it.st + 10, cy: yy, r: 10, fill: C.dark }, g);
    T(g, it.st + 10, yy + 4.3, String(it.k + 1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' });
    T(g, it.st + 26, yy + 4.5, it.e.text || '', { 'font-size': 13.5, 'font-weight': 600, fill: C.cmp }) });
  /* 강조 점 */
  (s.marks || []).forEach(function (m, k) { var q = ser[m.s || 0] || ser[0], v = q.data[m.at]; if (v == null) return; var x = X(m.at), y = Y(v), warn = m.tone === 'warn', c = warn ? C.warn : C.dark, below = m.pos === 'below', tm = 1500 + k * 200, g = h.at(svg, tm, { 'data-fx': 'fade' }), bw = h.textW(m.text || '', 17, true), tx = Math.max(bw / 2, Math.min(W - bw / 2, x));
    E('circle', { cx: x, cy: y, r: 7, fill: c, 'data-at': tm, 'data-fx': 'pop' }, svg);
    T(g, tx, below ? y + 30 : y - 14, m.text || '', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: c }) });
  /* 끝 값 상자 */
  if (s.callout && s.callout.text) { var cq = ser[s.callout.s || 0] || ser[0], ci = s.callout.at != null ? s.callout.at : cq.data.length - 1, cp = cq.data[ci]; if (cp != null) {
    var cw = h.textW(s.callout.text, 18, true) + 28, cx = Math.min(W - cw, X(ci) - cw + 22), cyy = Math.max(2, Y(cp) - 62), g = h.at(svg, 2100, { 'data-fx': 'fade' });
    E('rect', { x: cx, y: cyy, width: cw, height: 40, rx: 8, fill: C.dark }, g); T(g, cx + cw / 2, cyy + 26, s.callout.text, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#fff' }) } }
  root.setAttribute('data-gap', 300);
};
})();
