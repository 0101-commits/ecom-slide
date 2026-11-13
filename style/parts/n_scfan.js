/* scfan — 경로 갈라짐 선 : 실제 지난 선(굵은 짙은 초록)이 '지금'에서 시나리오별 선으로 갈라지고, 끝에 이름 · 가능성 · 값 꼬리표. 확률 가중 평균 점선
   hist{labels:['2025.01',…],data:[…]} · fut{labels:[…],paths:[{name,sub,p(%),tone,data:[앞 지점에서 이어 갈 값 n개]}]} · y{min,max,step,dec,unit} · avg(true 면 가중 평균 점선) · nowText('지금 2026.10') · zoneText('시나리오 구간')
   움직임 : 축 → 지난 선 → 지금 표시 → 갈라진 선이 하나씩 → 꼬리표 → 가중 평균 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc, U = ECOM.u;
ECOM.parts.scfan = function (bd, s, ctx) {
  var svg = ctx.svg(512), H = s.hist || {}, F = s.fut || {}, hd = H.data || [], nh = hd.length, P = (F.paths || []).slice(0, 4), nfu = (F.labels || []).length; if (!nh || !P.length) return;
  var n = nh + nfu, x0 = 62, x1 = 900, top = 30, bot = 462, X = h.lin(0, n - 1, x0, x1), all = hd.slice(); P.forEach(function (p) { all = all.concat(p.data) });
  var sc = U.yScale(all, s.y || {}, top, bot), Y = sc.Y, dec = sc.dec, u = (s.y && s.y.unit) || '';
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  E('rect', { x: X(nh - 1), y: top - 14, width: x1 - X(nh - 1) + 6, height: bot - top + 14, fill: C.g08 }, g0);
  U.yAxis(g0, x0, x1 + 6, sc, { unit: s.y && s.y.title });
  U.xLabels(g0, (H.labels || []).concat(F.labels || []), X, bot + 24, U.xTicks(n, 9, s.xticks), {});
  T(g0, X(nh - 1) + 12, top - 2, s.zoneText || '시나리오 구간', { 'font-size': 13, 'font-weight': 700, fill: C.g65 });
  var line = E('path', { d: h.lineD(hd, X, Y), fill: 'none', stroke: C.dark, 'stroke-width': 3.6, 'stroke-linejoin': 'round', 'data-at': 400, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
  var gn = h.at(svg, 1500, { 'data-fx': 'fade', 'data-ms': 360 }), nx = X(nh - 1), ny = Y(hd[nh - 1]);
  E('line', { x1: nx, x2: nx, y1: top - 6, y2: bot, stroke: C.dark, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, gn);
  E('circle', { cx: nx, cy: ny, r: 8, fill: '#fff', stroke: C.dark, 'stroke-width': 3 }, gn);
  var nt = s.nowText || '지금'; T(gn, nx - 12, ny - 16, nt + ' ' + h.nf(hd[nh - 1], dec) + u, { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.ink });
  var lab = [];
  P.forEach(function (p, i) { var pts = [[nx, ny]].concat(p.data.map(function (v, k) { return [X(nh + k), Y(v)] })), d = 'M' + pts.map(function (q) { return q[0] + ' ' + q[1] }).join(' L'), col = h.col(p.tone || 'main'), t = 1700 + i * 700;
    E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 800 }, svg);
    var q = pts[pts.length - 1]; E('circle', { cx: q[0], cy: q[1], r: 6, fill: col, 'data-at': t + 760, 'data-fx': 'pop' }, svg);
    lab.push({ p: p, y: q[1], col: col, t: t + 800, last: p.data[p.data.length - 1] }) });
  if (s.avg) { var wsum = P.reduce(function (a, p) { return a + (+p.p || 0) }, 0), av = P[0].data.map(function (_, k) { return P.reduce(function (a, p) { return a + (+p.p || 0) * p.data[k] }, 0) / wsum });
    var ap = [[nx, ny]].concat(av.map(function (v, k) { return [X(nh + k), Y(v)] }));
    E('path', { d: 'M' + ap.map(function (q) { return q[0] + ' ' + q[1] }).join(' L'), fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '3 5', 'data-at': 1700 + P.length * 700, 'data-fx': 'fade', 'data-ms': 500 }, svg);
    lab.push({ p: { name: '확률 가중 평균', sub: '', p: null }, y: ap[ap.length - 1][1], col: C.ink, t: 1700 + P.length * 700 + 300, last: av[av.length - 1], avg: true }) }
  lab.sort(function (a, b) { return a.y - b.y }); var LH = 58, ly = lab.map(function (l) { return l.y });
  for (var k = 1; k < ly.length; k++) if (ly[k] - ly[k - 1] < LH) ly[k] = ly[k - 1] + LH;
  var ov = ly[ly.length - 1] - (bot + 10); if (ov > 0) for (var k2 = ly.length - 1; k2 >= 0; k2--) { ly[k2] -= ov; if (k2 && ly[k2 - 1] > ly[k2] - LH) ly[k2 - 1] = ly[k2] - LH }
  lab.forEach(function (l, i) { var g = h.at(svg, l.t, { 'data-fx': 'fade', 'data-ms': 380 }), cy = ly[i], lx = x1 + 22;
    E('path', { d: 'M' + (x1 + 4) + ' ' + l.y + ' L' + (lx - 6) + ' ' + cy, stroke: l.col, fill: 'none', 'stroke-width': 1.4, 'stroke-dasharray': l.avg ? '3 3' : null }, g);
    var nm = l.p.name + (l.p.p != null ? '  ' + h.nf(l.p.p, 0) + '%' : '');
    T(g, lx, cy - 8, nm, { 'font-size': S.fit(nm, 16, 1168 - lx, 1, 12), 'font-weight': 700, fill: l.avg ? C.ink : l.col });
    T(g, lx, cy + 11, h.nf(l.last, dec) + u + (l.p.sub ? ' · ' + l.p.sub : ''), { 'font-size': S.fit(h.nf(l.last, dec) + u + (l.p.sub ? ' · ' + l.p.sub : ''), 14, 1168 - lx, 0, 11.5), 'font-weight': 600, fill: C.sub }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
