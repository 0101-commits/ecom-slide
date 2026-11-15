/* timeline — 국면 타임라인 : 위 막대 띠 → 깔때기 → 국면 카드(재생 막대가 지나가며 열림) — CW48 8장
   labels · data(띠 값) · unit · ref[{v,label}] · phases[{from,to,name,rows:[[이름,값]],bg,now}] · rangeTitle('금리차') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function rangeSvg(data, a, b, now, unit, title, lo, hi) { var mn = Infinity, mx = -Infinity; for (var i = a; i <= b; i++) { mn = Math.min(mn, data[i]); mx = Math.max(mx, data[i]) }
  var W = 184, X = h.lin(lo, hi, 6, W - 6), t = (mn === mx ? h.nf(mn, 2) : h.nf(mn, 2) + ' ~ ' + h.nf(mx, 2)) + unit;
  return '<svg viewBox="0 0 ' + W + ' 36" width="' + W + '" height="36">' + (lo < 0 ? '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="3" y2="19" stroke="#9AA3A0"/>' : '') + '<line x1="6" x2="' + (W - 6) + '" y1="11" y2="11" stroke="#E3E8E5" stroke-width="2"/><rect x="' + X(mn) + '" y="7" width="' + Math.max(X(mx) - X(mn), 4) + '" height="8" rx="4" fill="' + (now ? '#00744F' : '#99C7B9') + '"/><circle cx="' + X(data[b]) + '" cy="11" r="5" fill="#005136"/><text x="' + (W / 2) + '" y="33" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1D2521">' + h.esc(title) + ' ' + t + '</text></svg>' }
function timelineDefault(bd, s, ctx) {
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
  root._reset = function () { phd.style.display = 'none' } }
/* cards 날짜 카드 : 가로선 위 · 아래로 날짜 카드가 번갈아 올라옴. events[3~7]{date,title,desc,value,hi}(hi = 핵심 사건, 진한 카드) · 칸 labels · data 없이 씀 */
function cardsLayout(bd, s, ctx) {
  var P = ctx.P, ON = ctx.dark ? P.bg : '#fff', svg = ctx.svg(512), ev = (s.events || []).slice(0, 7), N = ev.length, AY = 256, x0 = 74, x1 = 1094, st = N > 1 ? (x1 - x0) / (N - 1) : 0, cw = Math.min(N < 4 ? 300 : 270, N > 1 ? 2 * st - 18 : 300), CH = ev.some(function (e) { return e.value }) ? 190 : 156, anyHi = ev.some(function (e) { return e.hi });
  E('line', { x1: 16, x2: 1152, y1: AY, y2: AY, stroke: P.dark, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-at': 0, 'data-fx': 'wipe', 'data-ms': 800 }, svg);
  ev.forEach(function (e, i) { var x = N > 1 ? x0 + i * st : 584, up = i % 2 === 0, at = 600 + i * 460, cx = Math.max(cw / 2 + 4, Math.min(1168 - cw / 2 - 4, x)), cy = up ? AY - 36 - CH : AY + 36, hi = !!e.hi, tc = hi ? ON : P.ink, sc = hi ? ON : P.sub;
    E('line', { x1: x, x2: x, y1: up ? cy + CH : AY + 14, y2: up ? AY - 14 : cy, stroke: P.g65, 'stroke-width': 2, 'data-at': at, 'data-fx': 'grow', 'data-o': up ? '50% 100%' : '50% 0%', 'data-ms': 380 }, svg);
    var g = E('g', { 'data-key': e.title || '', 'data-at': at + 120, 'data-fx': 'slide', 'data-dx': 0, 'data-dy': up ? 44 : -44, 'data-ms': 620 }, svg);
    E('rect', { x: cx - cw / 2, y: cy, width: cw, height: CH, rx: 14, fill: hi ? P.main : P.paper, stroke: hi ? 'none' : P.line, 'stroke-width': 1.5 }, g);
    var ty = cy + 16, tl = h.wrap(e.title || '', 20.5, cw - 34, 1).slice(0, 2); tl.forEach(function (t, j) { T(g, cx - cw / 2 + 18, ty + 20 + j * 26, t, { 'font-size': 20.5, 'font-weight': 700, fill: tc }) }); ty += tl.length * 26 + 6;
    if (e.value) { T(g, cx - cw / 2 + 18, ty + 32, e.value, { 'font-size': fitV(e.value, cw - 36), 'font-weight': 700, fill: hi ? ON : P.main }); ty += 46 }
    h.wrap(e.desc || '', 16, cw - 36, 0).slice(0, Math.max(1, Math.floor((cy + CH - 12 - ty) / 22))).forEach(function (t, j) { T(g, cx - cw / 2 + 18, ty + 17 + j * 22, t, { 'font-size': 16, fill: sc }) });
    var pw = h.textW(e.date || '', 15, 1) + 26, pg = E('g', { 'data-key': e.title || '', 'data-at': at, 'data-fx': 'pop', 'data-ms': 360 }, svg);
    E('rect', { x: x - pw / 2, y: AY - 15, width: pw, height: 30, rx: 15, fill: hi ? P.dark : P.main }, pg); T(pg, x, AY + 5.5, e.date || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ON }) });
  T(svg, 0, 506, anyHi ? '진한 카드 = 핵심 사건 · 위 · 아래 번갈아 시간 순서' : '카드는 위 · 아래로 번갈아 시간 순서대로 놓임', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute, 'data-at': 1800, 'data-fx': 'fade' });
  ctx.root.setAttribute('data-gap', 380) }
function fitV(t, w) { var z = 36; while (z > 18 && h.textW(t, z, 1) > w) z -= .5; return z }
ECOM.parts.timeline = function (bd, s, ctx) { return s.layout === 'cards' ? cardsLayout(bd, s, ctx) : timelineDefault(bd, s, ctx) };
ECOM.parts.timeline.layouts = ['default', 'cards'];
ECOM.parts.timeline.dark = ['cards'];
})();
