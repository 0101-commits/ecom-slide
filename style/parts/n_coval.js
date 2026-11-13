/* coval — 밸류에이션 산점 : 가로 = 주가수익비율(PER), 세로 = 이익 성장률, 대각선(PER = 성장률, 곧 PEG 1) 아래 면은 「성장 대비 비쌈」으로 옅게 칠함 · 점마다 이름 + 작은 글(PEG)
   items[{name,x,y,sub,hero,left}] 5~10개 · x{min,max,step,title,unit}(x.min ≥ y.min, x.max ≥ y.max 여야 면이 맞음) · y{min,max,step,title,unit} · lineLabel('PEG 1') · zones{above,below}(구역 이름) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.coval = function (bd, s, ctx) {
  var I = (s.items || []).slice(0, 10); if (!I.length) return; var svg = ctx.svg(512), xa = s.x, ya = s.y, L = 74, Rr = 1150, Tp = 8, Bt = 440, X = h.lin(xa.min, xa.max, L, Rr), Y = h.lin(ya.min, ya.max, Bt, Tp), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  for (var v = xa.min; v <= xa.max + 1e-9; v += xa.step) { E('line', { x1: X(v), x2: X(v), y1: Tp, y2: Bt, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, X(v), Bt + 19, h.nf(v, 0) + (xa.unit || ''), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }
  for (var w = ya.min; w <= ya.max + 1e-9; w += ya.step) { E('line', { x1: L, x2: Rr, y1: Y(w), y2: Y(w), stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, L - 9, Y(w) + 4.5, h.nf(w, 0) + (ya.unit || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  var a = xa.min, b = ya.max, pts = [[a, a], [b, b], [xa.max, b], [xa.max, ya.min], [a, ya.min]].map(function (p) { return X(p[0]) + ',' + Y(p[1]) }).join(' ');
  E('polygon', { points: pts, fill: C.warnsoft, opacity: .75 }, g0); E('rect', { x: L, y: Tp, width: Rr - L, height: Bt - Tp, fill: 'none', stroke: C.line }, g0);
  E('line', { x1: X(a), y1: Y(a), x2: X(b), y2: Y(b), stroke: C.warn, 'stroke-width': 1.8, 'stroke-dasharray': '7 5' }, g0);
  T(g0, X(a + (b - a) * .7) - 10, Y(a + (b - a) * .7) - 6, s.lineLabel || 'PEG 1', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.warn });
  var Z = s.zones || {}; if (Z.above) T(g0, L + 14, Tp + 24, Z.above, { 'font-size': 15, 'font-weight': 700, fill: C.dark }); if (Z.below) T(g0, Rr - 14, Bt - 14, Z.below, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: C.warn });
  T(g0, (L + Rr) / 2, 487, xa.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub }); T(g0, 16, (Tp + Bt) / 2, ya.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub, transform: 'rotate(-90 16 ' + ((Tp + Bt) / 2) + ')' });
  I.forEach(function (q, k) { var cx = X(q.x), cy = Y(q.y), t0 = 200 + k * 130, on = !!q.hero, g = h.at(svg, t0, { 'data-fx': 'pop', 'data-ms': 320 }), lw = h.textW(q.name, 15, 1) + (q.sub ? 8 + h.textW(q.sub, 12.5, 0) : 0), left = q.left || (cx + 16 + lw > Rr);
    E('circle', { cx: cx, cy: cy, r: on ? 11 : 9, fill: on ? C.dark : C.g65, stroke: '#fff', 'stroke-width': 2 }, g);
    var nw = h.textW(q.name, 15, 1); T(g, left ? cx - 16 : cx + 16, cy + 5, q.name, { 'text-anchor': left ? 'end' : 'start', 'font-size': 15, 'font-weight': 700, fill: on ? C.dark : C.ink });
    if (q.sub) T(g, left ? cx - 16 - nw - 7 : cx + 16 + nw + 7, cy + 5, q.sub, { 'text-anchor': left ? 'end' : 'start', 'font-size': 12.5, fill: C.mute }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
