/* line — 주석 선 · 계단 차트 (Kick-off 12쪽 · CW48 6 · 3장 틀)
   labels · series[{name,data,color,step,width,dash,end}] · y{min,max,step,dec,unit,suf} · ticks[idx]
   band{a,b,from,legend,labels:[{at|[i0,i1],text,carry}]} · phases[{from,to,name,now}] · avg[{s,from,to,x0,x1,label}]
   values[{s,at,text,pos:'above|below',dx,dy,anchor}] · events[{at,v,text,sub,anchor,dx,dy,leader:[v0,v1]}] · arrows[{at,a,b,text,sub,side}]
   box{title,items,x0,x1,top} · lanes[{name,sub,color,marks}] · future{n,xlabels,title,branches:[{s,at,to}],labels:[{v,text,color}],range:{text,sub,v}} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u;
ECOM.parts.line = function (bd, s, ctx) { u = ECOM.u;
  var labels = s.labels || [], n = labels.length, fut = s.future, nAll = n + (fut ? (fut.n || 2) : 0), ser = s.series || [];
  var lanes = s.lanes || [], laneH = lanes.length ? lanes.length * 76 + 34 : 0, legTop = 0;
  var li = ser.map(function (q, k) { return { color: q.color || (k ? 'main' : 'cmp'), text: q.name, type: q.dash ? 'dash' : 'line' } });
  if (s.band && s.band.legend) li.push({ type: 'box', color: 'g18', text: s.band.legend });
  if (s.phases) { li.push({ type: 'sep' }); s.phases.forEach(function (p, k) { li.push({ type: 'ph', n: k + 1, text: p.name }) }) }
  if (s.legend !== false) u.legendHTML(bd, li, legTop);
  var svg = ctx.svg(512), top = 30 + (s.phases ? 36 : 16), bot = 512 - laneH - 30;
  var endW = ser.some(function (q) { return q.end }) || (fut && fut.labels) ? 128 : 16, ml = 54, x1 = 1168 - endW, slot = (x1 - ml) / nAll;
  function X(i) { return ml + slot * (i + .5) }
  var vals = []; ser.forEach(function (q) { vals = vals.concat(q.data) }); if (fut && fut.branches) fut.branches.forEach(function (b) { vals.push(b.to) });
  var sc = u.yScale(vals, s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1);
  if (s.phases) u.phaseBands(g1, s.phases, X, slot / 2, top, bot, top - 20);
  u.yAxis(g1, ml, X(nAll - .5), sc, { unit: s.y && s.y.unit, suf: s.y && s.y.suf, base: true });
  var all = labels.concat(fut && fut.xlabels ? fut.xlabels : []); u.xLabels(g1, all.slice(0, n), X, bot + 20, u.xTicks(n, s.nticks || 11, s.ticks), { boldLast: true });
  if (fut && fut.xlabels) fut.xlabels.forEach(function (l, j) { T(g1, X(n + j), bot + 20, u.short(l), { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#98A29D' }) });
  /* 다음 구역 */
  if (fut) { var fz = h.lv(svg, 6, { 'data-fx': 'fade' }); E('rect', { x: X(n - .5), y: top, width: slot * (nAll - n), height: bot - top, fill: C.paper }, fz);
    E('line', { x1: X(n - .5), x2: X(n - .5), y1: top, y2: bot, stroke: C.axis, 'stroke-dasharray': '3 3' }, fz);
    if (fut.title) T(fz, (X(n - .5) + X(nAll - .5)) / 2, top + 18, fut.title, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.sub }) }
  /* 두 계열 사이 면 */
  if (s.band) { var a = ser[s.band.a || 0].data, b = ser[s.band.b == null ? 1 : s.band.b].data, f = s.band.from || 0, bg = h.lv(svg, 3, { 'data-fx': 'fade' }), d = 'M' + X(f - .5) + ' ' + Y(a[f]);
    for (var i = f + 1; i < n; i++) d += ' H' + X(i - .5) + ' V' + Y(a[i]); d += ' H' + X(n - .5) + ' V' + Y(b[n - 1]); for (i = n - 1; i > f; i--) d += ' H' + X(i - .5) + ' V' + Y(b[i - 1]); d += ' H' + X(f - .5) + ' Z';
    E('path', { d: d, fill: C.g18, opacity: .8 }, bg) }
  /* 평균선 */
  (s.avg || []).forEach(function (q) { var dat = ser[q.s].data, f0 = q.from || 0, t0 = q.to == null ? n - 1 : q.to, sum = 0, c = 0; for (var i = f0; i <= t0; i++) if (dat[i] != null) { sum += dat[i]; c++ }
    var v = q.value != null ? q.value : sum / c, col = h.col(ser[q.s].color || (q.s ? 'main' : 'cmp')), g = h.lv(svg, 3);
    E('line', { x1: X(q.x0 || 0), x2: X(q.x1 == null ? Math.min(10, n - 1) : q.x1), y1: Y(v), y2: Y(v), stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: .6 }, g);
    var lt = String(q.label || '평균 {v}').replace('{v}', h.nf(v, q.dec == null ? 2 : q.dec)); if (q.labelEnd) T(g, (fut ? X(nAll - .5) : X(n - 1)) + 12, Y(v) + 5, lt, { 'font-size': 13, 'font-weight': 700, fill: col }); else T(g, X(q.x0 || 0), Y(v) - 8, lt, { 'font-size': 13.5, 'font-weight': 700, fill: col }) });
  /* 선 */
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'main' : 'cmp'));
    E('path', { d: q.step === false ? h.lineD(q.data, X, Y) : h.stepD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': q.width || (k ? 3.6 : 3), 'stroke-linejoin': 'round', 'stroke-dasharray': q.dash ? '6 5' : null, 'data-b': 2, 'data-fx': 'draw', 'data-ms': s.drawMs || 1100 }, svg);
    if (q.end) { var lv = q.data[n - 1], en = h.lv(svg, 2); E('circle', { cx: X(n - 1), cy: Y(lv), r: 5, fill: c }, en) } });
  var L = [];
  ser.forEach(function (q, k) { if (!q.end) return; var c = q.color || (k ? 'main' : 'cmp'), lvv = q.data[n - 1]; L.push(u.label(h.lv(svg, 2), (fut ? X(nAll - .5) : X(n - 1)) + 12, Y(lvv) + 5, q.end, { color: c, size: 14.5, dir: k ? 1 : -1 })) });
  /* 금리차 글 */
  if (s.band && s.band.labels) { var a2 = ser[s.band.a || 0].data, b2 = ser[s.band.b == null ? 1 : s.band.b].data, gl = h.lv(svg, 4);
    s.band.labels.forEach(function (l) { var at0 = Array.isArray(l.at) ? l.at : [l.at, l.at], m = Math.round((at0[0] + at0[1]) / 2), y = (Y(a2[m]) + Y(b2[m])) / 2 + 5;
      var t = T(gl, X((at0[0] + at0[1]) / 2), y, l.text, { 'text-anchor': 'middle', 'font-size': l.size || 14, 'font-weight': 700, fill: C.dark }); if (l.carry) t.setAttribute('data-carry', l.carry) }) }
  /* 꺾임점 값 */
  var vg = h.lv(svg, 4); (s.values || []).forEach(function (v) { var q = ser[v.s || 0], c = q.color || (v.s ? 'main' : 'cmp'), val = q.data[v.at], below = v.pos === 'below';
    L.push(u.label(vg, X(v.at) + (v.dx != null ? v.dx : -slot / 2 + 4), Y(val) + (v.dy != null ? v.dy : below ? 19 : -8), v.text || h.nf(val, sc.dec < 2 ? 2 : sc.dec), { color: c, size: 13.5, anchor: v.anchor, dir: below ? 1 : -1 })) });
  /* 사건 */
  var eg = h.lv(svg, 4); (s.events || []).forEach(function (ev) { var x = X(ev.at) + (ev.dx || 0), y = Y(ev.v) + (ev.dy || 0), an = ev.anchor || 'end';
    if (ev.leader) E('line', { x1: X(ev.at), x2: X(ev.at), y1: Y(ev.leader[0]), y2: Y(ev.leader[1]), stroke: C.mute, 'stroke-dasharray': '2 3' }, eg);
    L.push(u.label(eg, x, y, ev.text, { anchor: an, size: 13.5 })); if (ev.sub) T(eg, x, y + 17, ev.sub, { 'text-anchor': an, 'font-size': 12.5, fill: C.mute }) });
  /* 차이 화살 */
  (s.arrows || []).forEach(function (ar) { var g = h.lv(svg, 4), x = X(ar.at) + (ar.dx || 0), sd = ar.side || 1; h.arrow2(g, x, Y(ar.a), Y(ar.b), C.dark);
    var ty = (Y(ar.a) + Y(ar.b)) / 2; T(g, x + sd * 10, ty - 2, ar.text, { 'font-size': 14, 'font-weight': 700, fill: C.dark, 'text-anchor': sd > 0 ? 'start' : 'end' });
    if (ar.sub) T(g, x + sd * 10, ty + 15, ar.sub, { 'font-size': 12.5, fill: C.mute, 'text-anchor': sd > 0 ? 'start' : 'end' }) });
  /* 다음 구역 갈래 · 범위 */
  if (fut) { var fb = h.lv(svg, 6, { 'data-fx': 'fade' }), xe = X(nAll - .5);
    (fut.branches || []).forEach(function (br) { var q = ser[br.s], c = h.col(q.color || (br.s ? 'main' : 'cmp')), lvv = q.data[n - 1], xb = X(br.at - .5);
      E('path', { d: 'M' + X(n - .5) + ' ' + Y(lvv) + ' H' + xe, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': '2 4' }, fb);
      E('path', { d: 'M' + xb + ' ' + Y(lvv) + ' V' + Y(br.to) + ' H' + xe, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': '2 4' }, fb) });
    (fut.labels || []).forEach(function (l) { T(fb, xe + 8, Y(l.v) + 5, l.text, { 'font-size': 13, 'font-weight': 700, fill: h.col(l.color || 'cmp') }) });
    if (fut.range) { T(fb, xe + 8, Y(fut.range.v) - 2, fut.range.sub || '', { 'font-size': 12.5, fill: C.mute }); T(fb, xe + 8, Y(fut.range.v) + 17, fut.range.text, { 'font-size': 15, 'font-weight': 700, fill: C.dark }) } }
  u.avoid(L);
  /* 시사점 상자 */
  if (s.box) { var bx = s.box, g5 = h.lv(svg, 7), xa = X(bx.x0), xb2 = X(bx.x1), ya = Y(bx.top), items = bx.items || [], hh = 46 + items.length * 30;
    E('rect', { x: xa, y: ya, width: xb2 - xa, height: hh, rx: 10, fill: '#fff', stroke: C.gray }, g5);
    E('rect', { x: xa, y: ya, width: 92, height: 28, rx: 10, fill: C.dark }, g5); T(g5, xa + 46, ya + 19, bx.title || '시사점', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' });
    items.forEach(function (t, k) { var yy = ya + 52 + k * 30; E('circle', { cx: xa + 22, cy: yy - 5, r: 9.5, fill: C.main }, g5); T(g5, xa + 22, yy - 1, String(k + 1), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#fff' });
      T(g5, xa + 40, yy, t, { 'font-size': 14, fill: C.ink }) }) }
  /* 결정 줄 */
  if (lanes.length) { T(h.lv(svg, 1), ml, bot + 46, s.lanesTitle || '결정 일지', { 'font-size': 13, 'font-weight': 700, fill: C.sub }); u.laneMarks(svg, lanes, function (i) { return X(i) }, bot + 46, ml, X(nAll - .5), 5) }
  ctx.root.setAttribute('data-gap', s.gap || 360); ctx.root.setAttribute('data-stg', 70);
};
})();
