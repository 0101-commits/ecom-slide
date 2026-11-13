/* overlay — 사건 기준 겹친 선 : x = 기준일 뒤 몇 달(음수 = 앞), 여러 해(또는 시대) 선을 0 에 맞춰 겹침 · 묶음별 색 · 지금 선 굵게 + 끝 칩 · 오른쪽 좁은 요약
   x{from,to,tick,unit('개월'),suffix} · base(기준값, 굵은 가로줄) · y{min,max,step,dec} · ref{label}(0 세로선 + 위 칩) · groups[{label,tone:'good'|'bad'|'mid'}]
   lines[{name,data(x.from 부터 한 칸씩, null 가능),group(번호)}] · now{name,data,chip} · summary{title,items[{value,label,tone:'good'|'bad'|'main'}],list{title,items[글]}}
   쌓기 : 축 · 0 선 → 지난 선들이 차례로 그려짐 → 끝 이름 → 지금 선 → 칩 → 요약 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var TONE = { good: { line: C.g40, txt: C.g65 }, bad: { line: C.warn, txt: C.warn, op: .5 }, mid: { line: C.gray, txt: C.cmp } };
ECOM.parts.overlay = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, W = 1168, xs = s.x || {}, lines = s.lines || [], nw = s.now, sm = s.summary, groups = s.groups || [];
  var xf = xs.from != null ? xs.from : -6, xt = xs.to != null ? xs.to : 12, unit = xs.unit || '', tk = xs.tick || 3;
  var xa = 64, xb = W - (sm ? 250 : 80), y0 = 46, y1 = 466, svg = ctx.svg(512), X = function (m) { return xa + (m - xf) / (xt - xf) * (xb - xa) };
  var all = []; lines.forEach(function (q) { all = all.concat(q.data || []) }); if (nw) all = all.concat(nw.data || []); if (s.base != null) all.push(s.base);
  var sc = u.yScale(all, s.y, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  sc.ticks.forEach(function (v) { var b = s.base != null && v === s.base;
    E('line', { x1: xa, x2: xb, y1: Y(v), y2: Y(v), stroke: b ? C.axis : C.grid, 'stroke-width': b ? 1.4 : 1, 'stroke-dasharray': b ? null : '3 4' }, g1);
    T(g1, xa - 9, Y(v) + 4.5, h.nf(v, sc.dec), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
  if (s.y && s.y.unit) T(g1, xa - 9, y0 - 16, s.y.unit, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  for (var m = Math.ceil(xf / tk) * tk; m <= xt; m += tk) T(g1, X(m), y1 + 24, (m > 0 ? '+' : '') + m + unit, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
  if (s.ref && xf < 0 && xt > 0) { var gr = h.lv(svg, 1, { 'data-fx': 'fade' }); E('line', { x1: X(0), x2: X(0), y1: y0 - 6, y2: y1, stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gr);
    var rw = h.textW(s.ref.label || '', 12.5, true) + 18; E('rect', { x: X(0) - rw / 2, y: y0 - 30, width: rw, height: 22, rx: 11, fill: C.dark }, gr); T(gr, X(0), y0 - 14.5, s.ref.label || '', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) }
  var pts = function (q) { var r = []; (q.data || []).forEach(function (v, i) { if (v != null) r.push([X(xf + i), Y(v)]) }); return r };
  var dp = function (p) { return p.map(function (a, i) { return (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) }).join(' ') };
  var labs = [];
  lines.forEach(function (q, k) { var g = groups[q.group != null ? q.group : 0] || {}, tn = TONE[g.tone || 'good'] || TONE.good, p = pts(q); if (!p.length) return;
    E('path', { d: dp(p), fill: 'none', stroke: tn.line, 'stroke-opacity': tn.op || 1, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-at': 300 + k * 160, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var lp = p[p.length - 1]; labs.push({ x: lp[0] + 8, y: lp[1] + 5, t: q.name || '', c: tn.txt }) });
  labs.sort(function (a, b) { return a.y - b.y }); for (var i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 16) labs[i].y = labs[i - 1].y + 16;
  var gl = h.at(svg, 300 + lines.length * 160 + 500, { 'data-fx': 'fade' }); labs.forEach(function (l) { T(gl, l.x, l.y, l.t, { 'font-size': 13.5, 'font-weight': 700, fill: l.c }) });
  var tn0 = 300 + lines.length * 160 + 900;
  if (nw) { var np = pts(nw); if (np.length) { E('path', { d: dp(np), fill: 'none', stroke: C.dark, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'data-at': tn0, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var ep = np[np.length - 1], tm = tn0 + 1150; E('circle', { cx: ep[0], cy: ep[1], r: 7, fill: C.dark, 'data-at': tm, 'data-fx': 'pop' }, svg);
    if (nw.chip) { var cw = h.textW(nw.chip, 12.5, true) + 18, gc = h.at(svg, tm, { 'data-fx': 'fade' }); E('rect', { x: ep[0] + 12, y: ep[1] - 30, width: cw, height: 22, rx: 11, fill: C.dark }, gc); T(gc, ep[0] + 12 + cw / 2, ep[1] - 14.5, nw.chip, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) } } }
  if (sm) { var sx = W - 190, sw = 190, g = h.at(svg, tn0 + 1500, { 'data-fx': 'fade' }), y = 26;
    if (sm.title) T(g, sx, y, sm.title, { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    (sm.items || []).slice(0, 3).forEach(function (it, k) { var yy = y + 50 + k * 70, c = it.tone === 'bad' ? C.warn : it.tone === 'main' ? C.dark : C.g65, vw = h.textW(it.value || '', 40, true);
      T(g, sx, yy, it.value || '', { 'font-size': 40, 'font-weight': 700, fill: c });
      var L = h.wrap(it.label || '', 13.5, sw - vw - 10, true); (L.length ? L : ['']).slice(0, 2).forEach(function (t, j) { T(g, sx + vw + 8, yy - 4 + j * 17, t, { 'font-size': 13.5, 'font-weight': 600, fill: C.mute }) }) });
    if (sm.list) { var ly = y + 50 + Math.min(3, (sm.items || []).length) * 70 + 6; E('line', { x1: sx, x2: W, y1: ly, y2: ly, stroke: C.line }, g);
      T(g, sx, ly + 32, sm.list.title || '', { 'font-size': 15, 'font-weight': 700, fill: C.ink }); var cy = ly + 58;
      (sm.list.items || []).slice(0, 4).forEach(function (t) { var L = h.wrap(t, 13.5, sw - 18, false); E('circle', { cx: sx + 6, cy: cy - 4, r: 4, fill: C.dark }, g);
        L.slice(0, 2).forEach(function (ln, j) { T(g, sx + 18, cy + j * 17, ln, { 'font-size': 13.5, 'font-weight': 500, fill: C.cmp }) }); cy += 17 * Math.min(2, L.length) + 13 }) } }
  root.setAttribute('data-gap', 300);
};
})();
