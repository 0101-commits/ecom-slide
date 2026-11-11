/* minis — 작은 차트 여러 개(2~4열) : 열마다 위 머리(이름 · 큰 값 · 변화 칩) + 아래 카드 안 작은 차트(최고 · 최저 · 마지막 값 표시)
   minis[{label,sub,value,dec,unit,kind:'bar|line',data:[[이름,값]],chip:{text,dir:'up|dn|flat'},ref:{v,label}}] — 열 차례로 나타남 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { var L = [], V = []; (d || []).forEach(function (p) { if (Array.isArray(p)) { L.push(String(p[0])); V.push(p[1] == null ? null : +p[1]) } else { L.push(''); V.push(p == null ? null : +p) } }); return { l: L, v: V } }
ECOM.parts.minis = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, M = (s.minis || []).slice(0, 4), k = M.length; if (!k) return;
  var svg = ctx.svg(512), gap = 24, cw = (1168 - gap * (k - 1)) / k, top = 4, cardY = 100;
  M.forEach(function (m, j) { var x0 = j * (cw + gap), t0 = j * 260, dec = m.dec != null ? m.dec : (m.decimals != null ? m.decimals : 1), unit = m.unit || '', F = function (v, sg) { return h.nf(v, dec, { sign: sg }) + unit };
    var g = h.at(svg, t0, { 'data-fx': 'rise' }), d = norm(m.data), V = d.v, L = d.l, n = V.length, bar = (m.kind || 'bar') === 'bar';
    /* 머리 */
    T(g, x0 + 2, top + 16, m.label || '', { 'font-size': 15.5, 'font-weight': 700, fill: C.ink }); if (m.sub) T(g, x0 + 2 + h.textW(m.label || '', 15.5, 1) + 8, top + 16, m.sub, { 'font-size': 12.5, fill: C.mute });
    var vt = h.nf(m.value, dec), vw = h.textW(vt, 30, 1) * .95;
    T(svg, x0 + 2 + vw, top + 56, vt, { 'text-anchor': 'end', 'font-size': 30, 'font-weight': 700, fill: j === 0 ? C.dark : C.ink, 'data-at': t0 + 100, 'data-fx': 'count', 'data-count': m.value, 'data-dec': dec, 'data-ms': 800 });
    T(g, x0 + 5 + vw, top + 56, unit, { 'font-size': 15, 'font-weight': 700, fill: j === 0 ? C.dark : C.ink });
    if (m.chip) { var up = m.chip.dir === 'up', dn = m.chip.dir === 'dn', ct = (up ? '▲ ' : dn ? '▼ ' : '') + m.chip.text, cwd = h.textW(ct, 12.5, 1) + 18, cx = x0 + 2, cg = h.at(svg, t0 + 700, { 'data-fx': 'pop' });
      E('rect', { x: cx, y: top + 68, width: cwd, height: 22, rx: 11, fill: up ? C.g08 : dn ? '#EEF0F1' : '#EEF0F1' }, cg); T(cg, cx + cwd / 2, top + 83.5, ct, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: up ? C.dark : C.sub }) }
    /* 카드 · 작은 차트 */
    E('rect', { x: x0, y: cardY, width: cw, height: 512 - cardY - 2, rx: 12, fill: '#fff', stroke: C.line }, g);
    var px = x0 + 54, pw = cw - 54 - 18, py = cardY + 40, ph = 512 - cardY - 2 - 40 - 42, e = h.ext(V), lo = bar ? Math.min(0, e[0]) : e[0], hi = bar ? Math.max(0, e[1]) : e[1];
    var nt = h.niceTicks(lo, hi, 3), Y = h.lin(bar ? nt.lo : lo - (hi - lo) * .12, bar ? nt.hi : hi + (hi - lo) * .18, py + ph, py), slot = pw / n, X = function (i) { return bar ? px + slot * (i + .5) : px + 8 + i * (pw - 16) / Math.max(1, n - 1) };
    var ticks = nt.ticks.filter(function (t) { return Y(t) >= py - 2 && Y(t) <= py + ph + 2 }), tdec = h.decOf(nt.step);
    ticks.forEach(function (t) { E('line', { x1: px, x2: px + pw, y1: Y(t), y2: Y(t), stroke: t === 0 ? C.axis : C.grid, 'stroke-dasharray': t === 0 ? null : '3 4' }, g); T(g, px - 8, Y(t) + 4.5, h.nf(t, tdec), { 'text-anchor': 'end', 'font-size': 12, fill: C.mute }) });
    T(g, px - 8, py - 16, unit, { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: C.mute });
    T(g, X(0), py + ph + 22, u.short(L[0]), { 'text-anchor': bar ? 'middle' : 'start', 'font-size': 12.5, fill: C.mute }); T(g, X(n - 1), py + ph + 22, u.short(L[n - 1]), { 'text-anchor': bar ? 'middle' : 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.ink });
    if (m.ref) { E('line', { x1: px, x2: px + pw, y1: Y(m.ref.v), y2: Y(m.ref.v), stroke: C.cmp, 'stroke-dasharray': '5 4', opacity: .6 }, g); T(g, px + 4, Y(m.ref.v) - 6, m.ref.label || '', { 'font-size': 12, 'font-weight': 700, fill: C.cmp }) }
    var mi = 0, ma = 0; V.forEach(function (v, i) { if (v == null) return; if (V[mi] == null || v < V[mi]) mi = i; if (V[ma] == null || v > V[ma]) ma = i });
    var bw = Math.max(3, Math.min(30, slot * .64)); if (bar) { V.forEach(function (v, i) { if (v == null) return; E('rect', { x: X(i) - bw / 2, y: Math.min(Y(v), Y(0)), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 1.5, fill: i === n - 1 ? C.main : v < 0 ? C.light : C.gray, 'data-at': t0 + 250 + i * 25, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) }) }
    else E('path', { d: h.lineD(V, X, Y), fill: 'none', stroke: C.main, 'stroke-width': 2.8, 'stroke-linejoin': 'round', 'data-at': t0 + 250, 'data-fx': 'draw', 'data-ms': 800 }, svg);
    /* 최고 · 최저 · 마지막 값 */
    var mg = h.at(svg, t0 + 1100, { 'data-fx': 'fade' }), mk = [{ at: ma, t: '최고' }]; if (mi !== ma) mk.push({ at: mi, t: '최저' }); if (n - 1 !== ma && n - 1 !== mi && V[n - 1] !== V[ma] && V[n - 1] !== V[mi]) mk.push({ at: n - 1, t: '' });
    if (!bar) E('circle', { cx: X(n - 1), cy: Y(V[n - 1]), r: 4, fill: C.main, stroke: C.main, 'stroke-width': 2 }, mg);
    var boxes = []; mk.forEach(function (q) { var v = V[q.at], x = X(q.at), tt = (q.t ? q.t + ' ' : '') + F(v, bar && e[0] < 0), tw = h.textW(tt, 12.5, 1), an = x + tw / 2 > px + pw ? 'end' : x - tw / 2 < px ? 'start' : 'middle';
      var below = bar ? v < 0 : q.t === '최저' || (q.t === '' && v < (V[ma] + V[mi]) / 2), l = an === 'end' ? x + 4 - tw : an === 'start' ? x - 4 : x - tw / 2, y, y0;
      if (bar) { /* 글이 걸치는 막대들 위(음수면 아래)로 — 막대 위에 글이 앉지 않게 */
        y0 = v >= 0 ? Y(v) - 7 : Y(v) + 17; y = y0; V.forEach(function (w2, j) { if (w2 == null) return; var bx = X(j); if (bx + bw / 2 < l - 2 || bx - bw / 2 > l + tw + 2) return; if (v >= 0 && w2 > 0) y = Math.min(y, Y(w2) - 7); if (v < 0 && w2 < 0) y = Math.max(y, Y(w2) + 17) }) }
      else y = below ? Y(v) + 20 : Y(v) - 10;
      var b = { l: l, r: l + tw, t: y - 12, b: y + 2 };
      for (var tries = 0; tries < 8 && boxes.some(function (o) { return b.l < o.r && b.r > o.l && b.t < o.b && b.b > o.t }); tries++) { var dy = below ? 8 : -8; y += dy; b.t += dy; b.b += dy } boxes.push(b);
      if (bar && Math.abs(y - y0) > 4) E('line', { x1: x, x2: x, y1: v >= 0 ? Y(v) - 2 : Y(v) + 2, y2: v >= 0 ? y + 4 : y - 13, stroke: C.axis, 'stroke-width': 1 }, mg);
      if (!bar && q.at !== n - 1) E('circle', { cx: x, cy: Y(v), r: 4, fill: '#fff', stroke: C.main, 'stroke-width': 2 }, mg);
      T(mg, an === 'end' ? x + 4 : an === 'start' ? x - 4 : x, y, tt, { 'text-anchor': an, 'font-size': 12.5, 'font-weight': 700, fill: q.at === n - 1 ? C.dark : C.sub }) }) });
};
})();
