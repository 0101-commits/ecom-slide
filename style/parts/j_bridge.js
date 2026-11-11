/* bridge — 증감 다리 : 출발 막대 → 항목 몫이 하나씩 이어 붙음(점선 연결) → 도착 막대 → 전체 증감 화살
   start{label,value,sub} · steps[{label,value,sub}] · end{label,value,sub} · unit(수준 단위) · dunit(몫 단위, 기본 unit · '%' 면 '%p') · dec
   hero(몫 번호, 기본 절댓값 가장 큰 것) · share(기본 true — 주인공 몫이 전체 증감에서 차지하는 비중) · total(기본 true — 오른쪽 전체 증감 화살) · y{min,max,step,dec,unit} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.bridge = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, st = s.steps || [], sv = s.start || {}, ev = s.end || {}; if (!st.length) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', dunit = s.dunit || (unit === '%' ? '%p' : unit);
  var F = function (v) { return h.nf(v, dec) + unit }, DF = function (v) { return h.nf(v, dec, { sign: true }) + dunit };
  var lvl = +sv.value, cols = [{ k: 'start', label: sv.label, sub: sv.sub, v: lvl, a: 0, b: lvl }], lo = Math.min(0, lvl), hi = Math.max(0, lvl);
  st.forEach(function (q) { var nl = lvl + q.value; cols.push({ k: 'step', label: q.label, sub: q.sub, v: q.value, a: lvl, b: nl }); lvl = nl; lo = Math.min(lo, lvl); hi = Math.max(hi, lvl) });
  cols.push({ k: 'end', label: ev.label, sub: ev.sub, v: +ev.value, a: 0, b: +ev.value }); hi = Math.max(hi, +ev.value); lo = Math.min(lo, +ev.value);
  var hero = s.hero, hv = -1; if (hero == null) st.forEach(function (q, i) { if (Math.abs(q.value) > hv) { hv = Math.abs(q.value); hero = i } });
  var tot = s.total !== false, svg = ctx.svg(512), top = 36, bot = 448, ml = 64, x1 = 1168 - (tot ? 210 : 8), n = cols.length, slot = (x1 - ml) / n, bw = Math.min(slot * .64, 132);
  var sc = u.yScale([lo, hi + (hi - lo) * .14, 0], s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit });
  var X = function (i) { return ml + slot * (i + .5) }, T0 = 350, STEP = 520, tOf = function (i) { return T0 + i * STEP };
  cols.forEach(function (o, i) { var x = X(i), ya = Y(Math.max(o.a, o.b)), yb = Y(Math.min(o.a, o.b)), upv = o.b >= o.a, isH = o.k === 'step' && i - 1 === hero;
    var fill = o.k === 'start' ? C.cmp : o.k === 'end' ? C.dark : isH ? C.main : upv ? C.g65 : C.gray, g = h.at(svg, tOf(i), { 'data-fx': 'fade', 'data-ms': 160 });
    if (i > 0) { var pl = cols[i - 1].b; E('line', { x1: X(i - 1) + bw / 2, x2: x - bw / 2, y1: Y(pl), y2: Y(pl), stroke: C.axis, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g) }
    E('rect', { x: x - bw / 2, y: ya, width: bw, height: Math.max(2, yb - ya), rx: 2, fill: fill, 'data-at': tOf(i), 'data-fx': 'grow', 'data-ms': 420, 'data-o': o.k !== 'step' ? (o.b >= 0 ? '50% 100%' : '50% 0%') : (upv ? '50% 100%' : '50% 0%') }, svg);
    var lg = h.at(svg, tOf(i) + 300, { 'data-fx': 'fade' }), tv = o.k === 'step' ? DF(o.v) : F(o.v), ty = o.k === 'step' && !upv ? yb + 22 : ya - 10;
    T(lg, x, ty, tv, { 'text-anchor': 'middle', 'font-size': o.k === 'step' && !isH ? 15 : 17, 'font-weight': 700, fill: o.k === 'end' || isH ? C.dark : o.k === 'start' ? C.cmp : upv ? C.ink : C.cmp });
    if (isH && s.share !== false) { var dt = cols[n - 1].b - cols[0].b; if (dt) T(lg, x, upv ? ty - 20 : ty + 18, '전체 증감의 ' + h.nf(o.v / dt * 100, 1) + '%', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.main }) }
    T(lg, x, bot + 22, o.label || '', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': o.k === 'step' ? 500 : 700, fill: o.k === 'step' ? C.sub : C.ink });
    if (o.sub) T(lg, x, bot + 40, o.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  /* 전체 증감 화살 */
  if (tot) { var a0 = cols[0].b, b0 = cols[n - 1].b, xe = X(n - 1) + bw / 2, xa2 = xe + 34, ga = h.at(svg, tOf(n) + 200, { 'data-fx': 'fade' });
    E('line', { x1: X(0) + bw / 2, x2: xa2 + 8, y1: Y(a0), y2: Y(a0), stroke: C.cmp, 'stroke-width': 1.2, 'stroke-dasharray': '2 4', opacity: .8 }, ga);
    E('line', { x1: xe + 4, x2: xa2 + 8, y1: Y(b0), y2: Y(b0), stroke: C.dark, 'stroke-width': 1.2, 'stroke-dasharray': '2 4' }, ga);
    h.arrow2(ga, xa2, Y(a0), Y(b0), C.dark, 1.8);
    var my = (Y(a0) + Y(b0)) / 2, t1 = s.totalText || DF(b0 - a0), t2 = s.totalSub || (a0 > 0 && b0 > 0 && unit !== '%' ? h.nf(b0 / a0, 1) + '배' : '');
    T(ga, xa2 + 12, my - (t2 ? 2 : -5), t1, { 'font-size': 17, 'font-weight': 700, fill: C.dark }); if (t2) T(ga, xa2 + 12, my + 18, t2, { 'font-size': 13.5, 'font-weight': 700, fill: C.mute }) }
  root.setAttribute('data-gap', 300);
};
})();
