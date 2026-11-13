/* cotbl — 실적 표 + 작은 선 열 : 기업 행마다 숫자 열(매출 · 이익 · 이익률 · 증감 칩) + 맨 오른쪽 분기 추이 작은 선(행끼리 같은 눈금)
   cols[{t,dec,unit,sign,chip}] 숫자 열 2~5개 · rows[{name,sub,hero,v[열마다 숫자],trend[분기 값]}] 3~8행 · trendTitle · trendUnit('%') · trendDec · trendLabels[처음,끝] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.cotbl = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 8), n = R.length, cols = (s.cols || []).slice(0, 5); if (!n) return; var svg = ctx.svg(512), nw = 210, vw = 122, sx0 = nw + vw * cols.length + 30, sx1 = 1168 - 100, hh = 48, rh = (496 - hh) / n;
  var all = []; R.forEach(function (r) { (r.trend || []).forEach(function (v) { all.push(v) }) }); var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * .12; lo -= pad; hi += pad;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade' }); E('rect', { x: 0, y: 0, width: 1168, height: hh, fill: C.cmp, rx: 6 }, g0); T(g0, 16, 30, s.nameTitle || '기업', { 'font-size': 14.5, 'font-weight': 700, fill: '#fff' });
  cols.forEach(function (c, k) { T(g0, nw + vw * (k + 1) - 12, 30, c.t, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: '#fff' }) });
  T(g0, sx0, 30, s.trendTitle || '분기 추이', { 'font-size': 14.5, 'font-weight': 700, fill: '#fff' });
  R.forEach(function (r, i) { var y = hh + i * rh, cy = y + rh / 2, t0 = 120 + i * 130, g = h.at(svg, t0, { 'data-fx': 'fade' }), on = !!r.hero;
    if (on) E('rect', { x: 0, y: y + 2, width: 1168, height: rh - 4, rx: 6, fill: C.g08 }, g); else if (i) E('line', { x1: 0, x2: 1168, y1: y, y2: y, stroke: C.line }, g);
    T(g, 16, cy + (r.sub ? -2 : 7), r.name, { 'font-size': 19, 'font-weight': 700, fill: on ? C.dark : C.ink }); if (r.sub) T(g, 16, cy + 17, r.sub, { 'font-size': 13, fill: C.mute });
    cols.forEach(function (c, k) { var v = r.v[k], tx = h.nf(v, c.dec || 0, { sign: !!c.sign }) + (c.unit || ''), rx = nw + vw * (k + 1) - 12;
      if (c.chip) { var bad = v < 0, tw = h.textW(tx, 16, 1) + 18; E('rect', { x: rx - tw + 6, y: cy - 15, width: tw, height: 30, rx: 15, fill: bad ? C.warnsoft : C.g18 }, g); T(g, rx - tw / 2 + 6, cy + 5.5, tx, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: bad ? C.warn : C.dark }) }
      else T(g, rx, cy + 6, tx, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink }) });
    var tr = r.trend || [], m = tr.length; if (m > 1) { var X = h.lin(0, m - 1, sx0, sx1), Y = h.lin(lo, hi, cy + rh / 2 - 10, cy - rh / 2 + 10), d = h.lineD(tr, X, Y);
      E('path', { d: d, fill: 'none', stroke: on ? C.dark : C.g65, 'stroke-width': on ? 3 : 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'data-at': t0 + 200, 'data-fx': 'draw', 'data-ms': 700 }, svg);
      var g2 = h.at(svg, t0 + 860, { 'data-fx': 'fade' }); E('circle', { cx: X(m - 1), cy: Y(tr[m - 1]), r: 4.5, fill: on ? C.dark : C.g65 }, g2); E('circle', { cx: X(0), cy: Y(tr[0]), r: 3.2, fill: '#fff', stroke: C.axis, 'stroke-width': 1.5 }, g2);
      T(g2, sx1 + 14, cy + 6, h.nf(tr[m - 1], s.trendDec != null ? s.trendDec : 1) + (s.trendUnit || ''), { 'font-size': 17, 'font-weight': 700, fill: on ? C.dark : C.ink }) } });
  var gl = h.at(svg, 1300, { 'data-fx': 'fade' }); T(gl, sx0, 508, s.trendNote || '○ 8분기 전 · ● 최근 분기, 행끼리 같은 눈금', { 'font-size': 12, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};
})();
