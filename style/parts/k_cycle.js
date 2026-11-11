/* cycle — 순환 고리(3~6단계) : 가운데 원 → 단계 상자가 고리 위에 차례로 놓이고 다음 단계로 가는 굽은 화살이 그려짐 → 마지막 화살이 고리를 닫고 점 하나가 한 바퀴 돎
   center{title,sub} · steps[{title,text,value}] · beats[{spot:단계}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
ECOM.parts.cycle = function (bd, s, ctx) {
  var root = ctx.root, st = (s.steps || []).slice(0, 6), N = st.length, cx = 584, cy = 256, RX = N >= 5 ? 370 : 400, RY = 190, cn = s.center || {};
  var CWd = N >= 5 ? 266 : 304, chs = st.map(function (q) { return 30 + K.lines(q.title, 15.5, CWd - 84, 1) * 21 + (q.text ? K.lines(q.text, 13.5, CWd - 84) * 19 : 0) + (q.value ? 26 : 0) + 8 }), CH = Math.max(84, Math.max.apply(null, chs));
  var A = st.map(function (_, i) { return -Math.PI / 2 + i * 2 * Math.PI / N }), P = A.map(function (a) { var x = cx + RX * Math.cos(a), y = cy + RY * Math.sin(a); return [x, Math.max(CH / 2 + 2, Math.min(512 - CH / 2 - 2, y))] });
  var svg = K.svg(ctx), grp = st.map(function () { return [] });
  E('ellipse', { cx: cx, cy: cy, rx: RX, ry: RY, fill: 'none', stroke: C.g40, 'stroke-width': 1.5, 'stroke-dasharray': '2 6', 'data-at': 200, 'data-fx': 'fade' }, svg);
  var cg = E('g', { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 460 }, svg); E('circle', { cx: cx, cy: cy, r: 104, fill: C.g08 }, cg); E('circle', { cx: cx, cy: cy, r: 86, fill: C.dark }, cg);
  var tl = h.wrap(cn.title || '', 19, 140, 1); tl.forEach(function (t, j) { T(cg, cx, cy + 7 + (j - (tl.length - 1) / 2) * 24 - (cn.sub ? 10 : 0), t, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: '#fff' }) });
  if (cn.sub) { var sl = h.wrap(cn.sub, 12.5, 130); sl.forEach(function (t, j) { T(cg, cx, cy + 7 + (tl.length - 1) / 2 * 24 + 16 + j * 16, t, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#fff', 'fill-opacity': .82 }) }) }
  function inCard(x, y, pad) { return P.some(function (p) { return Math.abs(x - p[0]) < CWd / 2 + pad && Math.abs(y - p[1]) < CH / 2 + pad }) }
  var T0 = 520, PER = 520, ring = [];
  st.forEach(function (q, i) { var t = T0 + i * PER, p = P[i];
    var html = '<i>' + (i + 1) + '</i><div><b>' + h.md(q.title || '') + '</b>' + (q.text ? '<span>' + h.md(q.text) + '</span>' : '') + (q.value ? '<em>' + h.md(q.value) + '</em>' : '') + '</div>';
    grp[i].push(K.D(bd, 'kx k-cyc', p[0] - CWd / 2, p[1] - CH / 2, CWd, CH, html, { 'data-at': t, 'data-fx': 'pop', 'data-ms': 380 }));
    var a0 = A[i], a1 = A[(i + 1) % N] + (i === N - 1 ? 2 * Math.PI : 0), pts = [];
    for (var k = 0; k <= 80; k++) { var a = a0 + (a1 - a0) * k / 80, x = cx + RX * Math.cos(a), y = cy + RY * Math.sin(a); if (!inCard(x, y, 12)) pts.push([x, y]) }
    if (pts.length > 2) { var d = 'M' + pts.map(function (q2) { return q2[0].toFixed(1) + ' ' + q2[1].toFixed(1) }).join(' L'), e1 = pts[pts.length - 1], e0 = pts[pts.length - 3];
      var ar = E('path', { d: d, fill: 'none', stroke: C.main, 'stroke-width': 2.8, 'stroke-linecap': 'round', 'data-at': t + 260, 'data-fx': 'draw', 'data-ms': 420 }, svg); ring.push(ar);
      var hd = K.head(svg, e1[0], e1[1], Math.atan2(e1[1] - e0[1], e1[0] - e0[0]), C.main, 11, { 'data-at': t + 640, 'data-fx': 'fade', 'data-ms': 140 }); grp[i].push(ar, hd) } });
  var dot = E('circle', { r: 6, fill: C.dark, stroke: '#fff', 'stroke-width': 2, style: 'display:none' }, svg), tEnd = T0 + N * PER + 300;
  root._hook = function (r) { h.later(r, function () { var t0 = null; dot.style.display = '';
      function f(ts) { if (t0 === null) t0 = ts; var u = Math.min(1, (ts - t0) / 1900), a = -Math.PI / 2 + u * 2 * Math.PI, x = cx + RX * Math.cos(a), y = cy + RY * Math.sin(a); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        dot.style.opacity = inCard(x, y, 4) ? 0 : 1; if (u < 1) r._raf.push(requestAnimationFrame(f)); else dot.style.display = 'none' } r._raf.push(requestAnimationFrame(f)) }, tEnd); return tEnd };
  root._reset = function () { dot.style.display = 'none' };
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } };
})();
