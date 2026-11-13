/* gapbar — 압도 차이 막대 : 막대 3~6개 가로로 나열(압도적으로 큰 값은 축 끊김 표시, 아주 작은 값은 빨간 강조) + 오른쪽 비율 칸(작은 네모 N 개 대 1개) + 아래 결론 띠 한 줄
   rows[{label,value,tone('warn' 이면 빨강 · 'hero' 면 짙은 초록)}] · unit(막대 아래 설명 글, 예 '연간 건조량, 만 GT') · dec · brk(true|false 기본 자동 — 가장 큰 값이 둘째의 2배 넘으면 끊김)
   ratio{title,n(큰 쪽 네모 수),cols(기본 20),one('미국 1' 작은 쪽 꼬리표)} — 없으면 막대가 칸 넓게 · band('결론 한 줄, **굵게** 가능') 없으면 띠 뺌 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function rich(s, size, maxW) { var toks = [], b = false; String(s || '').split('**').forEach(function (seg, i) { b = i % 2 === 1; seg.split(/(?<=\s)|(?=\s)/).forEach(function (w) { if (w) toks.push({ t: w, b: b }) }) });
  var L = [[]], w = 0; toks.forEach(function (k) { var kw = h.textW(k.t, size, k.b); if (w + kw > maxW && L[L.length - 1].length && k.t.trim()) { L.push([]); w = 0 } if (!(w === 0 && !k.t.trim())) { L[L.length - 1].push(k); w += kw } }); return L }
function richT(p, x, y, lines, size, lh) { lines.forEach(function (ln, i) { var e = E('text', { x: x, y: y + i * lh, 'font-size': size, fill: C.cmp }, p); ln.forEach(function (k) { var ts = E('tspan', k.b ? { 'font-weight': 700, fill: C.dark } : {}, e); ts.textContent = k.t }) }) }
ECOM.parts.gapbar = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 6), n = R.length; if (!n) return;
  var root = ctx.root, svg = ctx.svg(512), dec = s.dec != null ? s.dec : 0, rt = s.ratio, band = s.band;
  var vs = R.map(function (r) { return +r.value }).sort(function (a, b) { return b - a }), brk = s.brk != null ? !!s.brk : (n > 1 && vs[0] > vs[1] * 2), ref = brk ? vs[1] * 1.64 : vs[0];
  var lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label || '', 19, 1)) });
  var x0 = Math.max(110, Math.ceil(lw) + 26), full = rt ? 640 : 900, bandH = 0, bandL = [];
  if (band) { bandL = rich(band, 15, 1168 - 40); bandH = 22 + bandL.length * 22 }
  var capY = band ? 508 - bandH - 14 : 498, rows0 = 30, rowsB = capY - 26, pitch = Math.min(82, (rowsB - rows0) / n), bh = Math.min(44, pitch * .58);
  var hero = 0; R.forEach(function (r, i) { if (+r.value > +R[hero].value) hero = i });
  R.forEach(function (r, i) { var y = rows0 + i * pitch, v = +r.value, tiny = r.tone === 'warn' || (r.tone == null && v < ref * .02), isBr = brk && i === hero, w = isBr ? full : Math.max(3, full * v / ref);
    var rank = R.map(function (q, j) { return j }).sort(function (a, b) { return R[b].value - R[a].value }).indexOf(i), col = tiny ? C.warn : r.tone === 'hero' || rank === 0 ? C.dark : rank === 1 ? C.main : C.g65, by = y + (pitch - bh) / 2, t0 = i * 150;
    T(h.at(svg, t0, { 'data-fx': 'fade' }), x0 - 16, by + bh / 2 + 7, r.label || '', { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink });
    if (isBr) { E('rect', { x: x0, y: by, width: w * .62, height: bh, rx: 4, fill: col, 'data-at': t0, 'data-fx': 'growx', 'data-ms': 520 }, svg);
      E('rect', { x: x0 + w * .66, y: by, width: w * .34, height: bh, rx: 4, fill: col, 'data-at': t0 + 200, 'data-fx': 'growx', 'data-ms': 420 }, svg);
      E('path', { d: 'M' + (x0 + w * .61) + ' ' + (by - 4) + ' l10 ' + (bh + 8) + ' M' + (x0 + w * .655) + ' ' + (by - 4) + ' l10 ' + (bh + 8), stroke: '#fff', 'stroke-width': 6, fill: 'none', 'data-at': t0 + 300, 'data-fx': 'fade' }, svg) }
    else E('rect', { x: x0, y: by, width: w, height: bh, rx: 4, fill: col, 'data-at': t0, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    T(h.at(svg, t0 + 400, { 'data-fx': 'fade' }), x0 + w + 12, by + bh / 2 + 8, h.nf(v, dec), { 'font-size': 24, 'font-weight': 700, fill: tiny ? C.warn : C.ink }) });
  if (s.unit) T(h.at(svg, 200, { 'data-fx': 'fade' }), x0, capY, s.unit, { 'font-size': 12.5, 'font-weight': 600, fill: C.mute });
  var tr = 1000;
  if (rt) { var rx = 844, cols = rt.cols || 20, N = +rt.n || 0, sq = Math.min(13, Math.floor(300 / cols) - 2), rws = Math.ceil(N / cols), tl = h.wrap(rt.title || '', 14, 1168 - rx, 1), ry = 30 + (tl.length - 1) * 20 + 22;
    var avail = (rt.one ? capY - 52 : capY - 20) - ry, sq2 = Math.max(6, Math.min(sq, Math.floor(avail / rws) - 2)), gt = h.at(svg, 300, { 'data-fx': 'fade' });
    tl.forEach(function (ln, i) { T(gt, rx, 22 + i * 20, ln, { 'font-size': 14, 'font-weight': 700, fill: C.ink }) });
    for (var q = 0; q < rws; q++) { var gq = h.at(svg, 500 + q * 90, { 'data-fx': 'fade', 'data-ms': 260 });
      for (var c = 0; c < cols && q * cols + c < N; c++) E('rect', { x: rx + c * (sq2 + 2), y: ry + q * (sq2 + 2), width: sq2, height: sq2, rx: 2, fill: C.dark }, gq) }
    tr = 500 + rws * 90 + 300;
    if (rt.one) { var oy = ry + rws * (sq2 + 2) + 16; E('rect', { x: rx, y: oy, width: sq2, height: sq2, rx: 2, fill: C.warn, 'data-at': tr, 'data-fx': 'pop' }, svg); T(h.at(svg, tr, { 'data-fx': 'fade' }), rx + sq2 + 10, oy + sq2 - 1, rt.one, { 'font-size': 13, 'font-weight': 700, fill: C.warn }) } }
  if (band) { var gb = h.at(svg, tr + 300, { 'data-fx': 'fade' }); E('rect', { x: 0, y: 508 - bandH, width: 1168, height: bandH, rx: 10, fill: C.paper }, gb); richT(gb, 20, 508 - bandH + 29, bandL, 15, 22) }
  root.setAttribute('data-gap', 300);
};
})();
