/* sttax — 세율 구간 계단 : 소득 구간을 가로로(폭 = 구간 크기), 세율을 높이로 그린 기둥 + 예시 소득 위치 세로선 + 구간별 세금 칸 → 합 · 평균세율 · 한계세율
   brackets[{upTo(null=끝없음),rate(%)}] 5~7개 · income(예시 소득) · cur('달러') · scaleMax(선형으로 그릴 끝 소득, 기본 마지막에서 둘째 상한) · incomeLabel · concl */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.sttax = function (bd, s, ctx) {
  var br = (s.brackets || []).slice(0, 7), n = br.length; if (n < 3) return; var svg = ctx.svg(512), cur = s.cur || '', inc = +s.income || 0;
  var lin = n - 2, smax = br[lin - 1].upTo, x0 = 56, wl = 800, tw = 108, tg = 14, base = 292, maxH = 200, rmax = Math.max.apply(null, br.map(function (b) { return b.rate }));
  var PAL = [C.g18, C.g40, C.g65, C.main, C.dark, C.cmp, C.ink];
  function X(v) { return x0 + wl * v / smax } var xs = [], prev = 0;
  br.forEach(function (b, i) { var a, w; if (i < lin) { a = X(prev); w = X(b.upTo) - a; prev = b.upTo } else { a = x0 + wl + 30 + (i - lin) * (tw + tg); w = tw } xs.push([a, w]) });
  var ga = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 }); E('line', { x1: x0, x2: xs[n - 1][0] + tw, y1: base, y2: base, stroke: C.axis }, ga);
  T(ga, 0, 24, '세율(%)', { 'font-size': 13, 'font-weight': 700, fill: C.mute }); T(ga, 1168, 24, '과세소득(' + cur + ')', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute });
  E('path', { d: 'M' + (x0 + wl + 8) + ' ' + (base + 6) + ' l6 -12 M' + (x0 + wl + 16) + ' ' + (base + 6) + ' l6 -12', stroke: C.axis, 'stroke-width': 1.6 }, ga);
  var tot = 0, parts = [];
  br.forEach(function (b, i) { var lo = i ? br[i - 1].upTo : 0, hi = b.upTo == null ? Infinity : b.upTo, part = Math.max(0, Math.min(inc, hi) - lo); parts.push(part * b.rate / 100); tot += part * b.rate / 100;
    var hh = maxH * b.rate / rmax, a = xs[i][0], w = xs[i][1], g = h.at(svg, 250 + i * 330, { 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 520 });
    E('rect', { x: a + 1, y: base - hh, width: Math.max(2, w - 2), height: hh, rx: 3, fill: PAL[i % PAL.length] }, g);
    var gt = h.at(svg, 450 + i * 330, { 'data-fx': 'fade', 'data-ms': 300 }); T(gt, a + w / 2, base - hh - 8, b.rate + '%', { 'text-anchor': 'middle', 'font-size': w < 44 ? 12.5 : 15, 'font-weight': 700, fill: C.ink });
    var lab = i < lin ? h.nf(b.upTo, 0) : (i === lin ? h.nf(br[i - 1].upTo, 0) + '~' : h.nf(br[i - 1].upTo, 0) + '~'); if (i < lin) T(gt, a + w, base + 20, lab, { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute });
    else T(gt, a + w / 2, base + 20, lab, { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute }) });
  T(ga, x0, base + 20, '0', { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute });
  var gi = h.at(svg, 250 + n * 330, { 'data-fx': 'rise', 'data-ms': 420 }), ix = X(inc);
  E('line', { x1: ix, x2: ix, y1: 50, y2: base, stroke: C.warn, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gi);
  u.chip(gi, ix + 80, 44, (s.incomeLabel || '예시 소득') + ' ' + h.nf(inc, 0) + cur, C.warn, '#fff', 13);
  var marg = 0, cum = 0; br.forEach(function (b) { if (inc > cum) marg = b.rate; cum = b.upTo == null ? Infinity : b.upTo });
  var cards = []; br.forEach(function (b, i) { if (parts[i] > 0) cards.push({ name: b.rate + '% 구간', val: parts[i], dec: 1 }) });
  cards.push({ name: '세금 합계', val: tot, dec: 0, hero: 1 }); cards.push({ name: '평균세율', val: 100 * tot / inc, dec: 1, suf: '%' }); cards.push({ name: '한계세율', val: marg, dec: 0, suf: '%', warn: 1 });
  var cn = cards.length, cg = 10, cwid = (1168 - (cn - 1) * cg) / cn, gc = h.at(svg, 450 + n * 330, { 'data-fx': 'rise', 'data-ms': 460 });
  cards.forEach(function (c, i) { var x = i * (cwid + cg), fill = c.hero ? C.dark : c.warn ? C.warnsoft : C.paper; u.box(gc, x, 348, cwid, 100, fill, { rx: 10 });
    T(gc, x + 14, 376, c.name, { 'font-size': 13, 'font-weight': 700, fill: c.hero ? C.g18 : C.mute });
    var v = h.nf(c.val, c.dec), vs = u.fit(v + (c.suf || cur), 24, cwid - 28, 1, 15); T(gc, x + 14, 424, v + (c.suf || ''), { 'font-size': vs, 'font-weight': 700, fill: c.hero ? '#fff' : c.warn ? C.warn : C.dark });
    if (!c.suf) T(gc, x + 14 + h.textW(v, vs, 1) + 4, 424, cur, { 'font-size': 12.5, 'font-weight': 700, fill: c.hero ? C.on : C.mute }) });
  if (s.band) u.rich(gc, 0, 488, s.band, 15.5, 1168, { fill: C.cmp, min: 12.5 });
  ctx.taxTotal = tot;
};
})();
