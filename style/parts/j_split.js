/* split — 합계 막대가 항목으로 갈라짐 : 합계 막대(짙은 초록) → 그 자리에 항목이 쌓여 보임 → 항목마다 제자리로 흩어짐(음수는 0선 아래) → 값 · 비중
   total{label,value,sub} · parts[{label,value,sub}](합 = total, 음수 가능) · hero(번호, 기본 절댓값 가장 큰 것) · unit · dec · share(기본 true — 합계 대비 비중)
   y{min,max,step,dec,unit} · beats([{}] 이면 가르기가 바뀜 단계 1 — 없으면 쌓기 안에서 저절로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }
function mix(a, b, p) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p } }
ECOM.parts.split = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, tot = s.total || {}, P = s.parts || [], m = P.length; if (!m) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', F = function (v, sg) { return h.nf(v, dec, { sign: sg }) + unit }, tv = +tot.value, beatMode = !!(s.beats && s.beats.length);
  var hero = s.hero, hv = -1; if (hero == null) P.forEach(function (q, i) { if (Math.abs(q.value) > hv) { hv = Math.abs(q.value); hero = i } });
  var Ps = 0, Ns = 0; P.forEach(function (q) { if (q.value >= 0) Ps += q.value; else Ns += q.value });
  var svg = ctx.svg(512), top = 40, bot = 448, ml = 64, x1 = 1160, rngNeg = Ns < 0 ? Ns - (Ps - Ns) * .1 : 0;
  var sc = u.yScale([Ps * 1.12, rngNeg, 0, tv], s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit });
  var xt = ml + 124, tw = 132, xp0 = xt + 196, slot = (x1 - xp0) / m, pw = Math.min(slot * .58, 132);
  /* 합계 막대 */
  E('rect', { x: xt - tw / 2, y: Math.min(Y(tv), Y(0)), width: tw, height: Math.max(2, Math.abs(Y(tv) - Y(0))), rx: 2, fill: C.dark, 'data-b': 2, 'data-fx': 'grow', 'data-o': tv >= 0 ? '50% 100%' : '50% 0%' }, svg);
  var gt = h.lv(svg, 3); T(gt, xt, Math.min(Y(tv), Y(0)) - 10, F(tv), { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: C.dark });
  T(gt, xt, bot + 22, tot.label || '합계', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }); if (tot.sub) T(gt, xt, bot + 40, tot.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
  /* 항목 조각 : S1 = 합계 자리에 쌓임, S2 = 제자리 */
  var upA = 0, dnA = 0, segs = P.map(function (q, i) { var v = q.value, S1, cx = xp0 + slot * (i + .5);
    if (v >= 0) { S1 = { x: xt - tw / 2, y: Y(upA + v), w: tw, h: Y(upA) - Y(upA + v) }; upA += v } else { S1 = { x: xt - tw / 2, y: Y(dnA), w: tw, h: Y(dnA + v) - Y(dnA) }; dnA += v }
    var S2 = { x: cx - pw / 2, y: v >= 0 ? Y(v) : Y(0), w: pw, h: Math.abs(Y(v) - Y(0)) };
    return { q: q, i: i, cx: cx, S1: S1, S2: S2, r: E('rect', { rx: 2, stroke: '#fff', 'stroke-width': 1.5, fill: i === hero ? C.main : v >= 0 ? C.g40 : C.gray }, svg) } });
  function put(o, L) { o.r.setAttribute('x', L.x); o.r.setAttribute('y', L.y); o.r.setAttribute('width', L.w); o.r.setAttribute('height', Math.max(1.5, L.h)) }
  /* 끝 이름표 */
  var lab = E('g', {}, svg), labN = h.lv(svg, 3, { 'data-fx': 'fade' }); T(labN, (xt + tw / 2 + xp0 - pw / 2) / 2 - 4, (Y(0) + Y(tv)) / 2 + 12, '=', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: C.mute });
  segs.forEach(function (o, i) { var v = o.q.value, hot = i === hero, yb = v >= 0 ? Y(v) - 10 : Y(v) + 22;
    T(lab, o.cx, yb, F(v, true), { 'text-anchor': 'middle', 'font-size': hot ? 17 : 15, 'font-weight': 700, fill: hot ? C.dark : v >= 0 ? C.ink : C.cmp });
    if (s.share !== false && tv) T(lab, o.cx, v >= 0 ? yb - 19 : yb + 18, '비중 ' + h.nf(v / tv * 100, 1) + '%', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': hot ? 700 : 400, fill: hot ? C.main : C.mute });
    T(labN, o.cx, bot + 22, o.q.label, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': hot ? 700 : 500, fill: hot ? C.ink : C.sub });
    if (o.q.sub) T(labN, o.cx, bot + 40, o.q.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    if (i < m - 1) T(labN, xp0 + slot * (i + 1), (Y(0) + Y(tv)) / 2 + 12, '+', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: C.axis }) });
  /* 상태 · 움직임 */
  function state(k) { segs.forEach(function (o) { put(o, o.S2); o.r.style.opacity = k ? '' : 0 }); lab.style.opacity = k ? '' : 0 }
  function anim(r, delay) { r._raf = r._raf || []; var t0 = null, A1 = 320, HOLD = 600, M = 950;
    segs.forEach(function (o) { put(o, o.S1); o.r.style.opacity = '' }); lab.style.opacity = ''; h.A(lab, [{ opacity: 0 }, { opacity: 1 }], 380, 'linear', delay + A1 + HOLD + M + 60);
    segs.forEach(function (o, i) { h.A(o.r, [{ opacity: 0 }, { opacity: 1 }], A1, 'linear', delay + i * 60) });
    function st(ts) { if (t0 === null) t0 = ts; var e = ts - t0 - delay - A1 - HOLD, p = Math.max(0, Math.min(1, e / M)); segs.forEach(function (o, i) { var pi = Math.max(0, Math.min(1, (e - i * 70) / (M - 70 * (m - 1)))); put(o, mix(o.S1, o.S2, ease(pi))) });
      if (e < M) r._raf.push(requestAnimationFrame(st)) }
    r._raf.push(requestAnimationFrame(st)); return delay + A1 + HOLD + M + 500 }
  root._bk = 0; state(beatMode ? 0 : 1);
  root._hook = function (r) { state(0); if (beatMode) return 0; return anim(r, 300 * 2 + 700) };
  root._reset = function () { state(beatMode && !root._bk ? 0 : 1) };
  root._beat = function (k) { if (!beatMode) { root._bk = k; state(1); return } var go = k >= 1 && !root._bk && !h.RM(); root._bk = k; if (go) { state(0); anim(root, 0) } else state(k >= 1 ? 1 : 0) };
  root.setAttribute('data-gap', 300);
};
})();
