/* curve — 수익률 곡선 : x = 만기(로그 간격), 곡선 2~3개(앞 것은 점선), 크게 바뀐 만기에 화살표, 오른쪽 만기별 변화 막대
   mats[{label,years}] 또는 mats:['3개월',…] + years[0.25,…] · curves[{name,data,color,dash,tag{at,text,dx,dy,anchor}}] (마지막 = 지금, 굵게) · unit · y{min,max,step,dec}
   arrows{min(값 차이가 이 이상인 만기에만, 기본 눈금 간격의 0.3배),from,to} | false · change{title,unit,dec,values[],from,to,max,neg,pos}(없으면 칸 안 숫자 차이로 계산) | false
   쌓기 : 축 → 앞 곡선(점선) → 지금 곡선 그리기 → 화살표 → 이름표 → 변화 막대 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function smooth(p) { if (p.length < 3) return p.map(function (a, i) { return (i ? 'L' : 'M') + a[0] + ' ' + a[1] }).join(' ');
  var d = 'M' + p[0][0].toFixed(1) + ' ' + p[0][1].toFixed(1); for (var i = 1; i < p.length; i++) { var p0 = p[i - 2] || p[0], p1 = p[i - 1], p2 = p[i], p3 = p[i + 1] || p2;
    d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) } return d }
ECOM.parts.curve = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, W = 1168, cv = (s.curves || []).filter(function (q) { return q && q.data }); if (!cv.length) return;
  var mats = (s.mats || []).map(function (m, i) { return typeof m === 'string' ? { label: m, years: (s.years || [])[i] } : m }), n = mats.length || cv[0].data.length, unit = s.unit || '';
  var chg = s.change === false ? null : (s.change || {}), x0 = 64, x1 = W - (chg ? 364 : 90), y0 = 56, y1 = 456, svg = ctx.svg(512);
  var yrs = mats.map(function (m, i) { return m.years != null ? m.years : i + 1 }), lmin = Math.log(Math.min.apply(null, yrs)), lmax = Math.log(Math.max.apply(null, yrs));
  var X = function (i) { return x0 + (Math.log(yrs[i]) - lmin) / ((lmax - lmin) || 1) * (x1 - x0) };
  var all = []; cv.forEach(function (q) { all = all.concat(q.data) }); var sc = u.yScale(all, s.y, y0, y1), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, x0, x1, sc, { unit: s.y && s.y.unit }); var last = -1e9;
  mats.forEach(function (m, i) { var w = h.textW(m.label, 12.5, false), l = X(i) - w / 2; if (l < last + 8 && i < n - 1) return; if (i === n - 1 && l < last + 8) return; last = l + w; T(g1, X(i), y1 + 24, m.label, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  var nc = cv.length, dcol = ['axis', 'g65', 'main'], P = [];
  cv.forEach(function (q, k) { var isNow = k === nc - 1, col = h.col(q.color || (nc === 2 ? ['axis', 'main'][k] : dcol[k])), dash = q.dash != null ? q.dash : (k === 0 && nc > 1 && !q.color), p = q.data.map(function (v, i) { return [X(i), Y(v)] }); P.push(p);
    E('path', { d: smooth(p), fill: 'none', stroke: col, 'stroke-width': isNow ? 4.5 : 3, 'stroke-linecap': 'round', 'stroke-dasharray': dash ? '7 5' : null, 'data-at': 100 + k * 600, 'data-fx': dash ? 'fade' : 'draw', 'data-ms': 1100 }, svg) });
  var ar = s.arrows;
  if (ar !== false && nc > 1) { ar = ar || {}; var fa = ar.from != null ? ar.from : 0, ta = ar.to != null ? ar.to : nc - 1, mn = ar.min != null ? ar.min * 1 : sc.ticks.length > 1 ? (sc.ticks[1] - sc.ticks[0]) * .3 : 0, ga = h.at(svg, 100 + nc * 600 + 300, { 'data-fx': 'fade' });
    for (var i = 0; i < n; i++) { var a = cv[fa].data[i], b = cv[ta].data[i]; if (a == null || b == null || Math.abs(b - a) < mn) continue; var xo = X(i), yo = Y(a), yn = Y(b), dn = yn > yo, d = dn ? 1 : -1;
      if (Math.abs(yn - yo) < 22) continue; E('line', { x1: xo, x2: xo, y1: yo + d * 8, y2: yn - d * 11, stroke: C.g40, 'stroke-width': 2 }, ga);
      E('path', { d: 'M' + xo + ' ' + (yn - d * 6) + ' L' + (xo - 5) + ' ' + (yn - d * 15) + ' L' + (xo + 5) + ' ' + (yn - d * 15) + ' Z', fill: C.g40 }, ga) } }
  var gt = h.at(svg, 100 + nc * 600 + 800, { 'data-fx': 'fade' });
  cv.forEach(function (q, k) { var t = q.tag; if (!t) return; var i = t.at != null ? t.at : n - 1, c = h.col(q.color || (nc === 2 ? ['axis', 'main'][k] : dcol[k])), isNow = k === nc - 1;
    T(gt, X(i) + (t.dx || 0), Y(q.data[i]) + (t.dy != null ? t.dy : -16), t.text || q.name || '', { 'text-anchor': t.anchor || 'start', 'font-size': 14, 'font-weight': 700, fill: isNow ? C.dark : (k ? C.cmp : C.mute) }) });
  if (chg) { var rx = W - 294, cx = rx + 150, fa2 = chg.from != null ? chg.from : 0, ta2 = chg.to != null ? chg.to : nc - 1, dec = chg.dec != null ? chg.dec : 2, cu = chg.unit || unit;
    var vals = chg.values || cv[0].data.map(function (_, i) { return cv[ta2].data[i] - cv[fa2].data[i] }), mx = chg.max || Math.max.apply(null, vals.map(Math.abs)) || 1, pitch = Math.min(40, 380 / n), gb = h.at(svg, 100 + nc * 600 + 1000, { 'data-fx': 'fade' });
    T(gb, rx, 52, (chg.title || '만기별 변화') + (cu ? '(' + cu + ')' : ''), { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    var nc2 = h.col(chg.neg || 'main'), pc = h.col(chg.pos || 'warn');
    E('line', { x1: cx, x2: cx, y1: 66, y2: 82 + n * pitch - pitch / 2 + 6, stroke: C.axis, 'stroke-width': 1.2 }, gb);
    vals.forEach(function (dv, i) { var y = 92 + i * pitch, w = Math.abs(dv) / mx * 95, tm = 100 + nc * 600 + 1000 + i * 60;
      T(gb, rx, y + 5, mats[i] ? mats[i].label : '', { 'font-size': 13, 'font-weight': 600, fill: C.cmp });
      E('rect', { x: dv < 0 ? cx - w : cx, y: y - 9, width: Math.max(w, 1), height: 18, rx: 3, fill: dv < 0 ? nc2 : pc, 'data-at': tm, 'data-fx': 'growx', 'data-o': dv < 0 ? '100% 50%' : '0% 50%', 'data-ms': 420 }, svg);
      T(h.at(svg, tm + 250, { 'data-fx': 'fade' }), dv < 0 ? cx + 8 : cx + w + 8, y + 5, h.nf(dv, dec, { sign: true }), { 'font-size': 12.5, 'font-weight': 700, fill: C.ink }) }) }
  root.setAttribute('data-gap', 300);
};
})();
