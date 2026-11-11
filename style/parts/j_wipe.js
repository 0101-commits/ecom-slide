/* wipe — 같은 칸 두 계열 비교 : a(지난해 · 회색) 막대가 먼저 서고, 세로 선이 왼쪽에서 오른쪽으로 지나가며 b(올해 · 초록) 막대가 칸마다 솟음
   labels · a{name,data,color} · b{name,data,color}(data = 값 목록 또는 [이름,값]) · names(2판 범례 이름) · unit · dec · y{min,max,step,dec,unit}
   diff(기본 true — 아래 줄에 b − a) · dunit(차이 단위, 기본 unit · '%' 면 '%p') · diffTitle · marks('auto' = b 최고 · 마지막 | [{at,text}])
   box{title,items}(차트 안 시사점 상자 — 막대가 낮은 쪽 위에 저절로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { return (d && d.data ? d.data : d || []).map(function (p) { return Array.isArray(p) ? (p[1] == null ? null : +p[1]) : (p == null ? null : +p) }) }
function ovl(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t }
ECOM.parts.wipe = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, A = norm(s.a), B = norm(s.b), n = Math.min(A.length, B.length), labels = s.labels || [];
  if (!n) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', dunit = s.dunit || (unit === '%' ? '%p' : unit);
  var names = s.names || [(s.a && s.a.name) || 'a', (s.b && s.b.name) || 'b'], ca = h.col((s.a && s.a.color) || 'gray'), cb = h.col((s.b && s.b.color) || 'main'), diff = s.diff !== false;
  u.legendHTML(bd, [{ type: 'box', color: (s.a && s.a.color) || 'gray', text: names[0] }, { type: 'box', color: (s.b && s.b.color) || 'main', text: names[1] }], 0);
  var svg = ctx.svg(512), top = 46, bot = diff ? 404 : 468, ml = 64, x1 = 1168 - 8, slot = (x1 - ml) / n, bw = Math.max(6, Math.min(40, slot * .34)), X = function (i) { return ml + slot * (i + .5) };
  var sc = u.yScale(A.concat(B).concat([0]), s.y, top + 18, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit });
  labels.slice(0, n).forEach(function (l, i) { T(g1, X(i), bot + 20, u.short(l), { 'text-anchor': 'middle', 'font-size': 13, fill: i === n - 1 ? C.ink : C.mute, 'font-weight': i === n - 1 ? 700 : 400 }) });
  var stg = Math.max(20, Math.min(45, 500 / n)), T0 = 300 + n * stg + 700, PB = Math.max(140, Math.min(260, 2100 / n)), boxes = [];
  function rect(v, x, fill, attrs) { return E('rect', Object.assign({ x: x, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 2, fill: fill, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, attrs), svg) }
  A.slice(0, n).forEach(function (v, i) { if (v == null) return; rect(v, X(i) - bw - 2, ca, { 'data-b': 2 }); boxes.push({ l: X(i) - bw - 2, r: X(i) - 2, t: Math.min(Y(v), Y(0)), b: Math.max(Y(v), Y(0)) }) });
  root.setAttribute('data-stg', stg);
  B.slice(0, n).forEach(function (v, i) { if (v == null) return; rect(v, X(i) + 2, cb, { 'data-at': T0 + (i + .5) * PB, 'data-ms': 320 }); boxes.push({ l: X(i) + 2, r: X(i) + 2 + bw, t: Math.min(Y(v), Y(0)), b: Math.max(Y(v), Y(0)) }) });
  /* b 의 최고 · 마지막 값 */
  var tEnd = T0 + n * PB + 120, mg = h.at(svg, tEnd, { 'data-fx': 'fade' }), mk = s.marks === undefined || s.marks === 'auto' ? (function () { var ma = 0; B.forEach(function (v, i) { if (i < n && v != null && v > B[ma]) ma = i }); var o = [{ at: ma }]; if (ma !== n - 1) o.push({ at: n - 1 }); return o })() : (s.marks || []);
  mk.forEach(function (m) { var v = B[m.at]; if (v == null) return; var x = X(m.at) + 2 + bw / 2, t1 = m.text || F(v), w = h.textW(t1, 14, 1), an = x + w / 2 > 1168 ? 'end' : 'middle', y = v >= 0 ? Y(v) - 9 : Y(v) + 19;
    T(mg, an === 'end' ? x + bw / 2 : x, y, t1, { 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: C.dark }); boxes.push({ l: an === 'end' ? x + bw / 2 - w : x - w / 2, r: an === 'end' ? x + bw / 2 : x + w / 2, t: y - 14, b: y + 3 }) });
  function F(v, sg) { return h.nf(v, dec, { sign: sg }) + unit }
  /* 차이 줄 */
  if (diff) { var dg = h.lv(svg, 1, { 'data-fx': 'fade' }); E('line', { x1: ml, x2: x1, y1: bot + 34, y2: bot + 34, stroke: C.line }, dg);
    T(dg, ml, bot + 52, s.diffTitle || (names[1] + ' − ' + names[0] + ', ' + dunit), { 'font-size': 13, 'font-weight': 700, fill: C.sub });
    for (var i = 0; i < n; i++) { if (A[i] == null || B[i] == null) continue; var dv = +(B[i] - A[i]).toFixed(dec + 2), up = dv > 0;
      var dt = h.nf(dv, dec, { sign: true }), fz = slot < 70 ? 13 : 14; if (h.textW(dt + dunit, fz, 1) < slot * .9) dt += dunit; T(svg, X(i), bot + 76, dt, { 'text-anchor': 'middle', 'font-size': fz, 'font-weight': 700, fill: up ? C.dark : C.cmp, 'data-at': T0 + (i + .5) * PB + 140, 'data-fx': 'fade' }) } }
  /* 시사점 상자 — 막대가 낮은 쪽 위 */
  if (s.box && s.box.items && s.box.items.length) { var items = s.box.items, bw2 = Math.min(560, Math.max.apply(null, items.map(function (t) { return h.textW(t, 14) })) + 70), bh = 46 + items.length * 28;
    var cands = [[ml + 14, top], [x1 - bw2 - 6, top]].map(function (p) { return { p: p, box: { l: p[0], r: p[0] + bw2, t: p[1], b: p[1] + bh } } }), best = cands[0], bs = 1e9;
    cands.forEach(function (c, k) { var sc2 = k; boxes.forEach(function (b) { if (ovl(c.box, b)) sc2 += 100 }); if (sc2 < bs) { bs = sc2; best = c } });
    var g5 = h.at(svg, tEnd + 300, { 'data-fx': 'rise' }), bx = best.p[0], by = best.p[1];
    E('rect', { x: bx, y: by, width: bw2, height: bh, rx: 10, fill: '#fff', stroke: C.gray }, g5); E('rect', { x: bx, y: by, width: 92, height: 28, rx: 10, fill: C.dark }, g5);
    T(g5, bx + 46, by + 19, s.box.title || '시사점', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' });
    items.forEach(function (t, k) { var yy = by + 52 + k * 28; E('circle', { cx: bx + 22, cy: yy - 5, r: 9.5, fill: C.main }, g5); T(g5, bx + 22, yy - 1, String(k + 1), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#fff' }); T(g5, bx + 40, yy, t, { 'font-size': 14, fill: C.ink }) }) }
  /* 쓸어 가는 세로 선 */
  var wl = E('g', { style: 'display:none' }, svg); E('line', { x1: 0, x2: 0, y1: top - 4, y2: bot, stroke: C.dark, 'stroke-width': 2.2 }, wl);
  var cw = h.textW(names[1], 13, 1) + 24; E('rect', { x: -cw / 2, y: top - 30, width: cw, height: 24, rx: 12, fill: C.dark }, wl); T(wl, 0, top - 13, names[1], { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
  root._hook = function (r) { var len = n * PB; wl.style.display = ''; h.A(wl, [{ transform: 'translate(' + ml + 'px,0)' }, { transform: 'translate(' + x1 + 'px,0)' }], len, 'linear', T0);
    h.A(wl, [{ opacity: 0 }, { opacity: 1 }], 200, 'linear', T0 - 200); h.later(r, function () { wl.style.display = 'none' }, T0 + len + 60); return tEnd + 700 };
  root._reset = function () { wl.style.display = 'none' };
  root.setAttribute('data-gap', 300);
};
})();
