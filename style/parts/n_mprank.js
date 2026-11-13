/* mprank — 지도 + 옆 막대. 왼쪽은 세계 지도(map 칸 그대로 · 폭만 줄임), 오른쪽은 값 막대 묶음.
   map{…} = l_map 의 칸(points[{at,num,label}] 번호 점 · flows · view · chokes …) · mapW(지도 폭, 기본 640)
   metrics[{title,unit,dec,rows:[{label,value,num,tone}]}] 1~2묶음 — num 이 있으면 지도 번호 점과 맞춤 · 큰 값이 맨 앞 막대(진한 초록)
   움직임 : 지도 → 번호 점 → 오른쪽 막대 위에서부터 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.mprank = function (bd, s, ctx) {
  var svg = ctx.svg(512), MW = s.mapW || 640, ms = Object.assign({ noFlowKey: true, noDstKey: true }, s.map || {}, { frame: { w: MW, h: 512 } });
  var sub = E('svg', { x: 0, y: 0, width: MW, height: 512, viewBox: '0 0 ' + MW + ' 512', style: 'overflow:hidden' }, svg);
  ECOM.parts.map(bd, ms, Object.assign({}, ctx, { svg: function () { return sub } }));
  var px = MW + 36, pw = 1168 - 20 - px, mets = s.metrics || [], top = 10, tot = 500, bh = Math.floor(tot / Math.max(mets.length, 1));
  E('line', { x1: MW + 14, x2: MW + 14, y1: 14, y2: 498, stroke: C.line }, svg);
  mets.forEach(function (m, mi) { var y0 = top + mi * bh, rows = m.rows || [], dec = m.dec != null ? m.dec : 0, u = m.unit || '', g = h.at(svg, 600 + mi * 500, { 'data-fx': 'fade', 'data-ms': 300 });
    T(g, px, y0 + 24, m.title || '', { 'font-size': 16, 'font-weight': 700, fill: C.ink });
    var rh = Math.min(84, Math.floor((bh - 50) / Math.max(rows.length, 1))), mx = Math.max.apply(null, rows.map(function (r) { return +r.value || 0 }).concat([1e-9]));
    var lw = Math.max.apply(null, rows.map(function (r) { return h.textW(r.label || '', 15, 1) }).concat([30])), bx = px + (rows.some(function (r) { return r.num != null }) ? 38 : 0) + lw + 14, vw = 86, bwMax = 1168 - 20 - bx - vw;
    rows.forEach(function (r, i) { var cy = y0 + 46 + i * rh + rh / 2, bw = Math.max(4, bwMax * (+r.value || 0) / mx), t = 700 + mi * 500 + i * 140;
      var gr = h.at(svg, t, { 'data-fx': 'fade', 'data-ms': 260 });
      if (r.num != null) { E('circle', { cx: px + 14, cy: cy, r: 14, fill: C.dark }, gr); T(gr, px + 14, cy + 5.5, String(r.num), { 'font-size': 16, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }) }
      T(gr, px + (r.num != null ? 38 : 0), cy + 5.5, r.label || '', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
      var th = Math.min(40, rh - 18);
      E('rect', { x: bx, y: cy - th / 2, width: bw.toFixed(1), height: th, rx: 3, fill: r.tone === 'warn' ? C.warn : (i === 0 ? C.main : C.g65), 'data-at': t + 60, 'data-fx': 'growx', 'data-ms': 420 }, svg);
      T(svg, bx + bw + 8, cy + 5.5, h.nf(r.value, dec) + u, { 'font-size': 15, 'font-weight': 700, fill: C.ink, 'data-at': t + 300, 'data-fx': 'fade', 'data-ms': 260 }) }) });
  ctx.root.setAttribute('data-gap', 300);
};
})();
