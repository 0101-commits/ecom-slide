/* timeline — 국면 타임라인 : 위 막대 띠 → 깔때기 → 국면 카드(재생 막대가 지나가며 열림) — CW48 8장
   labels · data(띠 값) · unit · ref[{v,label}] · phases[{from,to,name,rows:[[이름,값]],bg,now}] · rangeTitle('금리차') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function rangeSvg(data, a, b, now, unit, title, lo, hi) { var mn = Infinity, mx = -Infinity; for (var i = a; i <= b; i++) { mn = Math.min(mn, data[i]); mx = Math.max(mx, data[i]) }
  var W = 184, X = h.lin(lo, hi, 6, W - 6), t = (mn === mx ? h.nf(mn, 2) : h.nf(mn, 2) + ' ~ ' + h.nf(mx, 2)) + unit;
  return '<svg viewBox="0 0 ' + W + ' 36" width="' + W + '" height="36">' + (lo < 0 ? '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="3" y2="19" stroke="#9AA3A0"/>' : '') + '<line x1="6" x2="' + (W - 6) + '" y1="11" y2="11" stroke="#E3E8E5" stroke-width="2"/><rect x="' + X(mn) + '" y="7" width="' + Math.max(X(mx) - X(mn), 4) + '" height="8" rx="4" fill="' + (now ? '#00744F' : '#99C7B9') + '"/><circle cx="' + X(data[b]) + '" cy="11" r="5" fill="#005136"/><text x="' + (W / 2) + '" y="33" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1D2521">' + h.esc(title) + ' ' + t + '</text></svg>' }
ECOM.parts.timeline = function (bd, s, ctx) {
  var svg = ctx.svg(512), root = ctx.root, data = s.data || [], labels = s.labels || [], ph = s.phases || [], a = ph.length ? ph[0].from : 0, b = ph.length ? ph[ph.length - 1].to : data.length - 1, m = b - a + 1;
  var x0 = 30, pw = 1108, sw = pw / m, T0 = 320, PB = Math.max(16, Math.min(40, 1900 / m)), e = h.ext(data.slice(a, b + 1)), lo = Math.min(0, e[0]) - .25, hi = e[1] + .25;
  function X(i) { return x0 + sw * (i - a + .5) } var Y = h.lin(lo, hi, 146, 34), unit = s.unit || '';
  var g1 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 300 }), nowK = ph.findIndex(function (p) { return p.now }); if (nowK < 0) nowK = ph.length - 1;
  ph.forEach(function (p, k) { var xa = X(p.from) - sw / 2, xb = X(p.to) + sw / 2; E('rect', { x: xa, y: 34, width: xb - xa, height: 112, fill: k === nowK ? C.g18 : (k % 2 ? '#F3F7F5' : C.g08) }, g1);
    E('circle', { cx: (xa + xb) / 2, cy: 16, r: 10, fill: C.dark }, g1); T(g1, (xa + xb) / 2, 20.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' });
    T(g1, xa + 3, 164, labels[p.from], { 'font-size': 12, fill: C.mute }) });
  if (lo < 0) E('line', { x1: x0, x2: x0 + pw, y1: Y(0), y2: Y(0), stroke: C.mute }, g1);
  (s.ref || []).forEach(function (r) { E('line', { x1: x0, x2: x0 + pw, y1: Y(r.v), y2: Y(r.v), stroke: C.gray, 'stroke-dasharray': '3 4' }, g1); T(g1, x0 + 3, Y(r.v) - 5, r.label || (h.nf(r.v, 2) + unit), { 'font-size': 12, fill: C.mute }) });
  for (var i = a; i <= b; i++) { var v = data[i], hh = Math.abs(Y(v) - Y(0)); E('rect', { x: X(i) - sw * .36, y: v >= 0 ? Y(v) : Y(0), width: sw * .72, height: Math.max(hh, 1.5), rx: 1.5, fill: v < 0 ? C.light : (i >= ph[nowK].from && i <= ph[nowK].to ? C.main : C.gray), 'data-at': T0 + (i - a) * PB, 'data-fx': 'grow', 'data-ms': 240, 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) }
  var cw = (pw - (ph.length - 1) * 12) / ph.length, glo = s.rangeLo != null ? s.rangeLo : Math.min(0, e[0]), ghi = s.rangeHi != null ? s.rangeHi : e[1];
  ph.forEach(function (p, k) { var xa = X(p.from) - sw / 2, xb = X(p.to) + sw / 2, ca = x0 + k * (cw + 12), t = T0 + (p.from - a) * PB + 80;
    E('path', { d: 'M' + xa + ' 172 L' + xb + ' 172 L' + (ca + cw) + ' 198 L' + ca + ' 198 Z', fill: k === nowK ? C.g18 : C.well, 'data-at': t, 'data-fx': 'fade', 'data-ms': 300 }, svg);
    var d = document.createElement('div'); d.className = 'pc' + (k === nowK ? ' now' : ''); d.style.cssText = 'left:' + ca + 'px;top:200px;width:' + cw + 'px;height:312px'; d.setAttribute('data-at', t + 60);
    var months = p.months || (p.to - p.from + 1);
    d.innerHTML = (k === nowK && s.nowLabel !== false ? '<span class="nb">' + h.esc(s.nowLabel || '지금') + '</span>' : '') + '<div class="h"><i>' + (k + 1) + '</i><span>' + h.esc(p.name) + '</span></div>'
      + '<div class="d">' + h.esc(labels[p.from] + '~' + labels[p.to]) + ' · <b>' + months + '개월</b></div>'
      + (p.rows ? '<div class="rt">' + p.rows.map(function (r) { return '<div><span>' + h.esc(r[0]) + '</span>' + h.esc(r[1]) + '</div>' }).join('') + '</div>' : '')
      + '<div class="gr">' + rangeSvg(data, p.from, p.to, k === nowK, unit, s.rangeTitle || '', glo, ghi) + '</div>' + (p.bg ? '<div class="bg">' + h.md(p.bg) + '</div>' : '');
    bd.appendChild(d) });
  var phd = E('g', { style: 'display:none' }, svg); E('line', { x1: 0, x2: 0, y1: 26, y2: 150, stroke: C.dark, 'stroke-width': 1.5 }, phd);
  root._hook = function (r) { var len = (m - 1) * PB; phd.style.display = ''; h.A(phd, [{ transform: 'translate(' + X(a) + 'px,0)' }, { transform: 'translate(' + X(b) + 'px,0)' }], len, 'linear', T0);
    h.later(r, function () { phd.style.display = 'none'; var c = r.querySelector('.pc.now'); if (c) h.A(c, [{ boxShadow: '0 0 0 0 rgba(0,116,79,.35)' }, { boxShadow: '0 0 0 12px rgba(0,116,79,0)' }], 900, 'ease-out') }, T0 + len + 200); return T0 + len + 1100 };
  root._reset = function () { phd.style.display = 'none' } };
})();
