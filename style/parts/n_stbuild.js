/* stbuild — 구성 쌓기 공식 : 위에 「합 = 부분 + 부분」 식 상자 3개(값 포함), 아래에 달마다 부분 둘이 쌓여 합 높이가 되는 쌓은 막대(합이 부분보다 작으면 warn 조각)
   eq[{name,sub,value,dec,unit,tone:'dark|main|g65'}] 3개(합, 부분 1, 부분 2) · chart{labels[],a[],b[](a 위에 b 쌓음, 음수면 a 안쪽 warn),unit,names[a,b,합],y{min,max,step}} · legendNeg(음수 조각 설명) · concl */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stbuild = function (bd, s, ctx) {
  var eq = (s.eq || []).slice(0, 3), ch = s.chart; if (eq.length < 3 || !ch) return; var svg = ctx.svg(512), bw = 330, ow = 89;
  eq.forEach(function (q, i) { var x = i * (bw + ow), g = h.at(svg, i * 420, { 'data-fx': 'rise', 'data-ms': 420 }), fill = i === 0 ? C.dark : i === 1 ? C.main : C.g65;
    u.box(g, x, 0, bw, 112, fill); T(g, x + 22, 36, q.name || '', { 'font-size': u.fit(q.name || '', 17, bw - 40, 1, 13), 'font-weight': 700, fill: '#fff' });
    if (q.sub) T(g, x + 22, 58, q.sub, { 'font-size': 12.5, 'font-weight': 500, fill: C.g18 });
    var v = h.nf(q.value, q.dec == null ? 2 : q.dec); T(g, x + 22, 98, v, { 'font-size': 38, 'font-weight': 700, fill: '#fff' }); T(g, x + 22 + h.textW(v, 38, 1) + 6, 98, q.unit || '%', { 'font-size': 17, 'font-weight': 700, fill: i === 2 ? C.dark : C.on });
    if (i < 2) { var go = h.at(svg, i * 420 + 250, { 'data-fx': 'pop', 'data-ms': 300 }); T(go, x + bw + ow / 2, 76, i === 0 ? '=' : '+', { 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 700, fill: C.dark }) } });
  var L = ch.labels || [], n = L.length, y = ch.y || {}, hi = y.max != null ? y.max : Math.ceil(Math.max.apply(null, L.map(function (_, i) { return Math.max(ch.a[i], ch.a[i] + ch.b[i]) })) + .5), lo = 0, st = y.step || 2;
  var px0 = 60, px1 = 1130, py0 = 190, py1 = 440, Y = h.lin(lo, hi, py1, py0), cw = (px1 - px0) / n, bwid = Math.max(6, cw - 5);
  var ga = h.at(svg, 1300, { 'data-fx': 'fade', 'data-ms': 400 });
  for (var v = lo; v <= hi + .001; v += st) { E('line', { x1: px0, x2: px1, y1: Y(v), y2: Y(v), stroke: v ? C.grid : C.axis, 'stroke-dasharray': v ? '3 4' : null }, ga); T(ga, px0 - 9, Y(v) + 4.5, h.nf(v, 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  T(ga, px0 - 9, py0 - 20, ch.unit || '%', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  var names = ch.names || ['부분 1', '부분 2', '합'], lg = h.at(svg, 1300, { 'data-fx': 'fade' });
  [[C.g65, names[0]], [C.main, names[1]], [C.warn, ch.legendNeg || (names[1] + ' 음수')]].forEach(function (a, i) { var lx = px0 + [0, 190, 390][i]; E('rect', { x: lx, y: 134, width: 14, height: 14, rx: 3, fill: a[0] }, lg); T(lg, lx + 22, 146, a[1], { 'font-size': 13, 'font-weight': 600, fill: C.cmp }) });
  var gc = h.at(svg, 1500, { 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 900 }); var last = n - 1, tickEvery = ch.tickEvery || 12, pts = [];
  L.forEach(function (lab, i) { var x = px0 + i * cw + (cw - bwid) / 2, a = ch.a[i], b = ch.b[i];
    E('rect', { x: x, y: Y(a), width: bwid, height: Math.max(1, Y(0) - Y(a)), fill: C.g65, opacity: i === last ? 1 : .9 }, gc);
    if (b >= 0) E('rect', { x: x, y: Y(a + b), width: bwid, height: Math.max(1, Y(a) - Y(a + b)), fill: C.main }, gc);
    else E('rect', { x: x, y: Y(a), width: bwid, height: Math.max(1, Y(a + b) - Y(a)), fill: C.warn }, gc);
    pts.push([x + bwid / 2, Y(a + b)]);
    if (i % tickEvery === tickEvery - 1 || i === last) T(gc, x + bwid / 2, py1 + 22, lab, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': i === last ? 700 : 500, fill: i === last ? C.ink : C.mute }) });
  var gl = h.at(svg, 2300, { 'data-fx': 'draw', 'data-ms': 800 }); E('path', { d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join(' L'), fill: 'none', stroke: C.ink, 'stroke-width': 2 }, gl);
  var gz = h.at(svg, 3000, { 'data-fx': 'pop', 'data-ms': 400 }); E('circle', { cx: pts[last][0], cy: pts[last][1], r: 5.5, fill: C.ink }, gz); T(gz, pts[last][0] - 10, pts[last][1] - 12, (names[2] || '합') + ' ' + h.nf(ch.a[last] + ch.b[last], 2) + (ch.unit || '%'), { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.ink });
  if (s.band) { var gk = h.at(svg, 3200, { 'data-fx': 'fade' }); u.rich(gk, 584, 492, s.band, 15, 1100, { anchor: 'middle', min: 12 }) }
};
})();
