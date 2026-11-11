/* pyramid — 층 피라미드(CW44 8쪽) : 아래층부터 쌓임 → 층마다 설명 상자 → 가운데 순환(선택) 그려짐 → 오른쪽 괄호 메모가 밀려 들어옴
   layers[3~5 · 0 = 꼭대기]{label,sub,desc,note:{title,items[]}|'글'} · cycle{label,from,to}(층 번호 범위 · 가운데 둥근 화살) · beats[{spot:층}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
var FILL = [C.dark, C.main, C.g65, C.g40, C.g18];
ECOM.parts.pyramid = function (bd, s, ctx) {
  var root = ctx.root, L = (s.layers || []).slice(0, 5), N = L.length, cyc = s.cycle || null, PW = 500, AX = PW / 2, GP = 8;
  var unit = (512 - (N - 1) * GP) / (N - 1 + 1.3), hs = L.map(function (_, i) { return i ? unit : unit * 1.3 }), ys = [], yy = 0;
  hs.forEach(function (v) { ys.push(yy); yy += v + GP });
  function wAt(y) { return PW * y / 512 }
  var cA = cyc ? 528 : null, dX = cyc ? 672 : 536, dW = cyc ? 262 : 340, nX = dX + dW + 20, nW = 1168 - nX;
  var svg = K.svg(ctx, false), bands = h.lv(svg, 1, { 'data-fx': 'fade', 'data-ms': 500 }), grp = L.map(function () { return [] });
  E('path', { d: 'M' + (AX + 14) + ' 0 H1168 V512 H' + (PW + 14) + ' Z', fill: C.paper }, bands);
  ys.slice(1).forEach(function (y) { var yb = y - GP / 2; E('line', { x1: wAt(yb) / 2 + AX + 22, x2: 1168, y1: yb, y2: yb, stroke: C.gray, 'stroke-dasharray': '3 4' }, bands) });
  var T0 = 250, PER = 380, tEnd = T0 + N * PER;
  L.forEach(function (o, i) { var ya = ys[i], yb = ya + hs[i], wa = wAt(ya), wb = wAt(yb), f = FILL[i] || C.g18, dark = [C.dark, C.main, C.g65].indexOf(f) >= 0;
    var t = T0 + (N - 1 - i) * PER, g = E('g', { 'data-at': t, 'data-fx': 'rise', 'data-ms': 420 }, svg);
    E('path', { d: 'M' + (AX - wa / 2) + ' ' + ya + ' H' + (AX + wa / 2) + ' L' + (AX + wb / 2) + ' ' + yb + ' H' + (AX - wb / 2) + ' Z', fill: f }, g);
    var top = i === 0, ly = top ? ya + hs[i] * .66 : ya + hs[i] / 2 + (o.sub ? -4 : 6), lw = wAt(ly - 10) - 26, fs = 17;
    while (h.textW(o.label || '', fs, 1) > lw && fs > 13.5) fs -= .5;
    T(g, AX, ly, o.label || '', { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: dark ? '#fff' : C.ink });
    if (o.sub) { var sw = wAt(ly + 14) - 24, ss = 13; while (h.textW(o.sub, ss) > sw && ss > 11.5) ss -= .5; T(g, AX, ly + 21, o.sub, { 'text-anchor': 'middle', 'font-size': ss, fill: dark ? '#fff' : C.sub, 'fill-opacity': dark ? .86 : 1 }) }
    grp[i].push(g);
    if (o.desc) grp[i].push(K.D(bd, 'kx k-pyd', dX, ya + 8, dW, hs[i] - 16, '<span>' + h.md(o.desc) + '</span>', { 'data-at': t + 200, 'data-fx': 'fade', 'data-ms': 360 }));
    if (o.note) { var nt = typeof o.note === 'string' ? { items: [o.note] } : o.note, ng = E('g', { 'data-at': tEnd + 650 + (N - 1 - i) * 110, 'data-fx': 'right', 'data-ms': 360 }, svg), y1 = ya + 10, y2 = yb - 10, xm = nX + 2;
      E('path', { d: 'M' + (xm + 9) + ' ' + y1 + ' Q' + xm + ' ' + y1 + ' ' + xm + ' ' + (y1 + 10) + ' V' + ((y1 + y2) / 2 - 8) + ' Q' + xm + ' ' + (y1 + y2) / 2 + ' ' + (xm - 6) + ' ' + (y1 + y2) / 2
        + ' Q' + xm + ' ' + (y1 + y2) / 2 + ' ' + xm + ' ' + ((y1 + y2) / 2 + 8) + ' V' + (y2 - 10) + ' Q' + xm + ' ' + y2 + ' ' + (xm + 9) + ' ' + y2, fill: 'none', stroke: C.g65, 'stroke-width': 1.6 }, ng);
      var nd = K.D(bd, 'kx k-pyn', nX + 18, ya + 4, nW - 18, hs[i] - 8, (nt.title ? '<div class="k-pynt">' + h.md(nt.title) + '</div>' : '') + (nt.items || []).map(function (x) { return '<div class="k-pyni">' + h.md(x) + '</div>' }).join(''),
        { 'data-at': tEnd + 650 + (N - 1 - i) * 110, 'data-fx': 'right', 'data-ms': 360 }); grp[i].push(ng, nd) } });
  if (cyc) { var a = Math.max(0, Math.min(N - 1, cyc.from == null ? 1 : cyc.from)), b = Math.max(a, Math.min(N - 1, cyc.to == null ? N - 2 : cyc.to)), ya2 = ys[a] + hs[a] * .3, yb2 = ys[b] + hs[b] * .7, cx = cA + 64, cy = (ya2 + yb2) / 2, r = Math.min(64, (yb2 - ya2) / 2 + 8);
    var cg = E('g', {}, svg), t2 = tEnd + 150;
    E('path', { d: 'M' + (cx + r * Math.sin(.35)) + ' ' + (cy - r * Math.cos(.35)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.sin(2.75)) + ' ' + (cy - r * Math.cos(2.75)), fill: 'none', stroke: C.g40, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-at': t2, 'data-fx': 'draw', 'data-ms': 520 }, cg);
    E('path', { d: 'M' + (cx - r * Math.sin(.35)) + ' ' + (cy + r * Math.cos(.35)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx - r * Math.sin(2.75)) + ' ' + (cy + r * Math.cos(2.75)), fill: 'none', stroke: C.g40, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-at': t2 + 260, 'data-fx': 'draw', 'data-ms': 520 }, cg);
    var th = 2.75, tx1 = Math.cos(th), ty1 = Math.sin(th);
    K.head(svg, cx + r * Math.sin(th) + tx1 * 12, cy - r * Math.cos(th) + ty1 * 12, Math.atan2(ty1, tx1), C.g65, 16, { 'data-at': t2 + 480, 'data-fx': 'fade' }, .75);
    K.head(svg, cx - r * Math.sin(th) - tx1 * 12, cy + r * Math.cos(th) - ty1 * 12, Math.atan2(-ty1, -tx1), C.g65, 16, { 'data-at': t2 + 740, 'data-fx': 'fade' }, .75);
    var lb = (cyc.label || '').split('\n'); lb.forEach(function (t, j) { T(svg, cx, cy + 6 + (j - (lb.length - 1) / 2) * 19, t, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.dark, 'data-at': t2 + 200, 'data-fx': 'pop' }) });
    (cyc.top ? [[cyc.top, ys[a] - 2 + 20]] : []).concat(cyc.bottom ? [[cyc.bottom, ys[b] + hs[b] - 8]] : []).forEach(function (q) { T(svg, cx, q[1], q[0], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.sub, 'data-at': t2, 'data-fx': 'fade' }) }) }
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } };
})();
