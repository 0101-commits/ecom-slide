/* rank — 순위 막대 : 원래 차례(달 순서)로 가로 막대가 서고 → 큰 순서로 자리를 옮김 → 1~3위 초록 · 순위 번호
   data[[이름,값]](또는 labels + data) · unit · dec · top(강조 개수, 기본 3) · order('desc' 기본 | 'asc') · avg(기본 true — 평균 세로선) · avgText
   음수 값은 0선 왼쪽으로. beats([{}] 이면 자리 옮기기가 바뀜 단계 1 — 없으면 쌓기 안에서 저절로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.rank = function (bd, s, ctx) {
  var root = ctx.root, rows = (s.data || []).map(function (p, i) { return Array.isArray(p) ? { l: String(p[0]), v: +p[1] } : { l: String((s.labels || [])[i]), v: +p } }), n = rows.length; if (!n) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', F = function (v, sg) { return h.nf(v, dec, { sign: sg }) + unit }, K = s.top == null ? 3 : s.top, beatMode = !!(s.beats && s.beats.length), neg = rows.some(function (r) { return r.v < 0 });
  var ord = rows.map(function (r, i) { return i }).sort(function (a, b) { return s.order === 'asc' ? rows[a].v - rows[b].v : rows[b].v - rows[a].v }), rk = []; ord.forEach(function (i, p) { rk[i] = p });
  var svg = ctx.svg(512), top = 44, bot = 500, rowH = Math.min(50, (bot - top) / n), bh = Math.min(28, rowH * .6), lw = Math.max.apply(null, rows.map(function (r) { return h.textW(r.l, 15, 1) })), bx0 = 44 + lw + 16;
  var vw = Math.max.apply(null, rows.map(function (r) { return h.textW(F(r.v, neg), 15, 1) })) + 24, bx1 = 1168 - vw, mn = Math.min(0, Math.min.apply(null, rows.map(function (r) { return r.v }))), mx = Math.max(0, Math.max.apply(null, rows.map(function (r) { return r.v }))), SX = h.lin(mn, mx, bx0, bx1);
  /* 0선 · 평균선 */
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' }); E('line', { x1: SX(0), x2: SX(0), y1: top - 6, y2: top + rowH * n, stroke: C.axis, 'stroke-width': 1.2 }, g1);
  T(g1, 44, top - 16, s.colTitle || '순위', { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); if (unit) T(g1, 1168, top - 16, '단위: ' + unit, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
  var sum = 0; rows.forEach(function (r) { sum += r.v }); var avg = sum / n, gA = E('g', {}, svg);
  if (s.avg !== false) { var ax = SX(avg), at = (s.avgText || '평균 {v}').replace('{v}', F(avg)), aw = h.textW(at, 13.5, 1), an = ax + aw / 2 > bx1 + vw ? 'end' : 'middle';
    E('line', { x1: ax, x2: ax, y1: top - 6, y2: top + rowH * n, stroke: C.dark, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: .7 }, gA);
    T(gA, an === 'end' ? ax + 6 : ax, top - 16, at, { 'text-anchor': an, 'font-size': 13.5, 'font-weight': 700, fill: C.dark }) }
  /* 줄 */
  var R = rows.map(function (r, i) { var o = E('g', {}, svg), g = E('g', { 'data-b': 2, 'data-fx': 'left' }, o), cy = rowH / 2 + top, v = r.v, x0 = SX(Math.min(0, v)), w = Math.max(2, Math.abs(SX(v) - SX(0))), hot = rk[i] < K;
    T(g, bx0 - 12, cy + 5, r.l, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: C.ink });
    E('rect', { x: x0, y: cy - bh / 2, width: w, height: bh, rx: 2, fill: v < 0 ? C.light : C.gray }, g);
    var ov = hot ? E('rect', { x: x0, y: cy - bh / 2, width: w, height: bh, rx: 2, fill: rk[i] === 0 ? C.dark : C.main }, o) : null;
    T(g, v >= 0 ? SX(v) + 8 : SX(0) + 8, cy + 5, F(v, neg), { 'font-size': 15, 'font-weight': 700, fill: hot ? C.dark : C.sub, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    var bg = E('g', {}, o); if (hot) { E('circle', { cx: 14, cy: cy, r: 11, fill: rk[i] === 0 ? C.dark : C.main }, bg); T(bg, 14, cy + 4.5, String(rk[i] + 1), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) }
    else T(bg, 14, cy + 4.5, String(rk[i] + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.mute });
    return { o: o, ov: ov, bg: bg, y0: rowH * i, y1: rowH * rk[i] } });
  root.setAttribute('data-stg', Math.max(30, Math.min(70, 600 / n)));
  function tr(y) { return 'translate(0px,' + y.toFixed(1) + 'px)' }
  function state(k) { R.forEach(function (q) { q.o.style.transform = tr(k ? q.y1 : q.y0); if (q.ov) q.ov.style.opacity = k ? '' : 0; q.bg.style.opacity = k ? '' : 0 }); gA.style.opacity = k ? '' : 0 }
  function sortAnim(delay) { R.forEach(function (q) { q.o.style.transform = tr(q.y1); h.A(q.o, [{ transform: tr(q.y0) }, { transform: tr(q.y1) }], 950, h.ESTD, delay);
      [q.ov, q.bg].forEach(function (e, j) { if (!e) return; e.style.opacity = ''; h.A(e, [{ opacity: 0 }, { opacity: 1 }], 320, 'linear', delay + 1000 + j * 80) }) });
    gA.style.opacity = ''; h.A(gA, [{ opacity: 0 }, { opacity: 1 }], 320, 'linear', delay + 1150); return delay + 1500 }
  root._bk = 0; state(beatMode ? 0 : 1);
  root._hook = function () { state(0); if (beatMode) return 0; return sortAnim(300 + 2 * 0 + n * +root.getAttribute('data-stg') + 900) };
  root._reset = function () { state(beatMode && !root._bk ? 0 : 1) };
  root._beat = function (k) { if (!beatMode) { root._bk = k; state(1); return } var go = k >= 1 && !root._bk && !h.RM(); root._bk = k; if (go) { state(0); sortAnim(0) } else state(k >= 1 ? 1 : 0) };
};
})();
