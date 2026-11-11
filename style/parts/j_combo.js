/* combo — 막대(수준 · 왼쪽 축) + 선(비율 · 오른쪽 축) : 선은 위 띠, 막대는 아래 띠에 두어 서로 겹치지 않게. 선 위 값 칩(최고 · 최저 · 마지막), 막대 최고 · 마지막 값
   labels · bars{name,data,unit,dec} · line{name,data,unit,dec} (2판 bars:[[이름,값]] · line:[[이름,값]] · units:[막대, 선] 도 받음)
   y(막대 축) · y2{min,max}(선 축) · band(선 띠 비율, 기본 .36) · marks('auto') · summary[[이름, 글]](아래 한 줄 요약, 선택) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { var L = [], V = []; (d || []).forEach(function (p) { if (Array.isArray(p)) { L.push(String(p[0])); V.push(p[1] == null ? null : +p[1]) } else { L.push(null); V.push(p == null ? null : +p) } }); return { l: L, v: V } }
function ovl(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t }
ECOM.parts.combo = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, un = s.units || [], bs = Array.isArray(s.bars) ? { data: s.bars, unit: un[0] } : (s.bars || {}), ls = Array.isArray(s.line) ? { data: s.line, unit: un[1] } : (s.line || {});
  var bdt = norm(bs.data), ldt = norm(ls.data), B = bdt.v, Lv = ldt.v, n = B.length, labels = s.labels || bdt.l; if (!n) return;
  var bu = bs.unit || '', lu = ls.unit || '', bdec = bs.dec != null ? bs.dec : (s.decimals != null ? s.decimals : 1), ldec = ls.dec != null ? ls.dec : (s.decimals != null ? s.decimals : 1);
  var BF = function (v) { return h.nf(v, bdec) + bu }, LF = function (v) { return h.nf(v, ldec) + lu };
  u.legendHTML(bd, [{ type: 'box', color: 'gray', text: (bs.name || '막대') + '(왼쪽' + (bu ? ', ' + bu : '') + ')' }, { color: 'cmp', text: (ls.name || '선') + '(오른쪽' + (lu ? ', ' + lu : '') + ')' }], 0);
  var sum = s.summary || [], sumH = sum.length ? 40 : 0, svg = ctx.svg(512), top = 40, bot = 470 - sumH, ml = 64, x1 = 1168 - 62, ph = bot - top, band = s.band || .36;
  var slot = (x1 - ml) / n, bw = Math.max(4, Math.min(40, slot * .58)), X = function (i) { return ml + slot * (i + .5) };
  var sc = u.yScale(B.concat([0]), s.y, top + ph * (band + .12), bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || bu });
  var e = h.ext(Lv), l0 = s.y2 && s.y2.min != null ? s.y2.min : e[0], l1 = s.y2 && s.y2.max != null ? s.y2.max : e[1], pad = (l1 - l0) * .12 || 1, YL = h.lin(l0 - pad, l1 + pad, top + ph * band, top + 14);
  var nt = h.niceTicks(l0, l1, 3), td = h.decOf(nt.step); nt.ticks.forEach(function (t) { var y = YL(t); if (y < top + 4 || y > top + ph * band + 6) return; E('line', { x1: x1, x2: x1 + 5, y1: y, y2: y, stroke: C.axis }, g1); T(g1, x1 + 9, y + 4.5, h.nf(t, td), { 'font-size': 12.5, fill: C.mute }) });
  T(g1, x1 + 9, top - 6, lu, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute }); E('line', { x1: x1, x2: x1, y1: top + 6, y2: top + ph * band + 8, stroke: C.axis }, g1);
  u.xLabels(g1, labels, X, bot + 20, s.ticks || (n <= 14 ? labels.map(function (_, i) { return i }) : u.xTicks(n, 12)), { boldLast: true });
  /* 막대 */
  B.forEach(function (v, i) { if (v == null) return; E('rect', { x: X(i) - bw / 2, y: Math.min(Y(v), Y(0)), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 2, fill: i === n - 1 ? C.main : v < 0 ? C.light : C.gray, 'data-b': 2, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) });
  root.setAttribute('data-stg', Math.max(8, Math.min(40, 600 / n)));
  /* 선 */
  E('path', { d: h.lineD(Lv, X, YL), fill: 'none', stroke: C.cmp, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-b': 3, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
  var gd = h.lv(svg, 4, { 'data-fx': 'fade' }); Lv.forEach(function (v, i) { if (v == null) return; E('circle', { cx: X(i), cy: YL(v), r: 3.8, fill: '#fff', stroke: C.cmp, 'stroke-width': 2 }, gd) });
  /* 값 칩 · 막대 값 */
  var boxes = [], poly = [], gc = h.lv(svg, 5, { 'data-fx': 'pop' }), gb = h.lv(svg, 5, { 'data-fx': 'fade' });
  Lv.forEach(function (v, i) { if (v != null) poly.push([X(i), YL(v)]) });
  function hits(b) { var c = 0; for (var i = 0; i < poly.length - 1; i++) { var a = poly[i], q = poly[i + 1]; for (var k = 0; k <= 10; k++) { var x = a[0] + (q[0] - a[0]) * k / 10, y = a[1] + (q[1] - a[1]) * k / 10; if (x > b.l - 2 && x < b.r + 2 && y > b.t - 2 && y < b.b + 2) c++ } } return c }
  var li = 0, la = 0; Lv.forEach(function (v, i) { if (v == null) return; if (Lv[li] == null || v < Lv[li]) li = i; if (Lv[la] == null || v > Lv[la]) la = i }); var lL = n - 1; while (lL > 0 && Lv[lL] == null) lL--;
  var lm = s.marks && s.marks !== 'auto' ? s.marks : [{ at: la, t: '최고', pos: -1 }].concat(li !== la ? [{ at: li, t: '최저', pos: 1 }] : []).concat(lL !== la && lL !== li ? [{ at: lL, t: '', pos: 0 }] : []);
  lm.forEach(function (m) { var v = Lv[m.at], x = X(m.at), y = YL(v), t = (m.t ? m.t + ' ' : '') + LF(v), w = h.textW(t, 13, 1) + 16, best = null, bsc = 1e9;
    [m.pos >= 0 ? 12 : -36, m.pos >= 0 ? -36 : 12, -60, 36].forEach(function (dy, k) { var l = Math.min(x1 - w + 40, Math.max(ml, x - w / 2)), b = { l: l, r: l + w, t: y + dy, b: y + dy + 24 }, sc2 = hits(b) * 10 + k; boxes.forEach(function (o) { if (ovl(o, b)) sc2 += 200 }); if (b.t < top - 30) sc2 += 500; if (sc2 < bsc) { bsc = sc2; best = b } });
    boxes.push(best); E('rect', { x: best.l, y: best.t, width: w, height: 24, rx: 12, fill: m.at === lL ? C.cmp : '#fff', stroke: C.cmp, 'stroke-width': 1.4 }, gc);
    T(gc, best.l + w / 2, best.t + 16.5, t, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: m.at === lL ? '#fff' : C.cmp }) });
  var bi = 0, ba = 0; B.forEach(function (v, i) { if (v == null) return; if (v < B[bi]) bi = i; if (v > B[ba]) ba = i });
  [ba].concat(n - 1 !== ba ? [n - 1] : []).concat(B[bi] < 0 && bi !== n - 1 ? [bi] : []).forEach(function (i) { var v = B[i], t = BF(v), w = h.textW(t, 14, 1), an = X(i) + w / 2 > x1 ? 'end' : 'middle', y = v >= 0 ? Y(v) - 9 : Y(v) + 19;
    T(gb, an === 'end' ? X(i) + bw / 2 : X(i), y, t, { 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: i === n - 1 ? C.dark : C.sub }) });
  /* 아래 요약 줄 */
  if (sum.length) { var gs = h.lv(svg, 6, { 'data-fx': 'fade' }), sx = 0, sw = 1168 / sum.length; E('line', { x1: 0, x2: 1168, y1: bot + 34, y2: bot + 34, stroke: C.line }, gs);
    sum.forEach(function (q, i) { T(gs, sx + i * sw, bot + 60, q[0], { 'font-size': 13.5, fill: C.sub }); T(gs, sx + i * sw + h.textW(q[0], 13.5) + 10, bot + 60, q[1], { 'font-size': 15, 'font-weight': 700, fill: C.dark }) }) }
  root.setAttribute('data-gap', 340);
};
})();
