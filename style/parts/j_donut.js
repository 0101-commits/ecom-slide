/* donut — 비중 고리 : 고리 1~4개(회색 트랙 위로 호가 그려지며 가운데 숫자 굴림) + 오른쪽 작은 분석 차트(선택)
   rings[{label,value(0~100),sub,sub2,color,strip:[1|0|null 달마다]}] · half(true = 반원) · hero(번호, 기본 0 — 초록, 나머지 연초록) · unit(기본 '%') · dec
   ringTitle(고리 위 제목 — 2판 chart.head) · stripLabels[첫 칸 이름, 끝 칸 이름](달 띠 양 끝)
   side{type:'bars|line',title,labels,data | series[{name,data,color}],unit,dec} — 오른쪽 작은 차트 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function pt(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] }
function arc(cx, cy, r, a0, a1) { if (a1 - a0 >= 359.99) return arc(cx, cy, r, a0, a0 + 180) + ' ' + arc(cx, cy, r, a0 + 180, a1 - .01).replace(/^M[^A]+/, ''); var p0 = pt(cx, cy, r, a0), p1 = pt(cx, cy, r, a1);
  return 'M' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) }
function mini(svg, x, y, w, ht, cf, t0) { var g = h.at(svg, t0, { 'data-fx': 'fade' }), unit = cf.unit || '', dec = cf.dec != null ? cf.dec : 1;
  E('rect', { x: x, y: y, width: w, height: ht, rx: 12, fill: '#fff', stroke: C.line }, g); T(g, x + 20, y + 30, cf.title || '', { 'font-size': 14.5, 'font-weight': 700, fill: C.ink });
  var px = x + 24, pw = w - 48, py = y + 64, ph = ht - 64 - 50, L = cf.labels || [], ser = cf.series || [{ data: cf.data, color: 'main' }], n = L.length || ser[0].data.length, all = [];
  ser.forEach(function (q) { all = all.concat(q.data) }); var e = h.ext(all), lo = Math.min(0, e[0]), Yb = h.lin(lo, e[1] * 1.14, py + ph, py), sl = pw / n, k = ser.length, bw = Math.min(26, sl * .72 / k);
  E('line', { x1: px, x2: px + pw, y1: Yb(0), y2: Yb(0), stroke: C.axis }, g);
  ser.forEach(function (q, j) { var c = h.col(q.color || (j ? 'cmp' : 'main')); q.data.forEach(function (v, i) { if (v == null) return; var bx = px + sl * (i + .5) - k * bw / 2 - (k - 1) + j * (bw + 2);
    E('rect', { x: bx, y: Math.min(Yb(v), Yb(0)), width: bw, height: Math.max(1.5, Math.abs(Yb(v) - Yb(0))), rx: 2, fill: c, 'data-at': t0 + 120 + i * 60, 'data-fx': 'grow' }, svg);
    T(g, bx + bw / 2, Yb(Math.max(0, v)) - 6, h.nf(v, dec), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: c === C.gray ? C.sub : c }) }) });
  L.forEach(function (l, i) { T(g, px + sl * (i + .5), py + ph + 20, l, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  var lx = px; ser.forEach(function (q, j) { if (!q.name) return; var c = h.col(q.color || (j ? 'cmp' : 'main')), t = q.name + (unit ? ', ' + unit : ''); E('rect', { x: lx, y: py + ph + 32, width: 12, height: 10, rx: 2, fill: c }, g); T(g, lx + 17, py + ph + 42, t, { 'font-size': 12.5, fill: C.sub }); lx += 34 + h.textW(t, 12.5) });
  return g }
/* 5판 P5 H : fill — 한 고리를 시계 방향으로 채움(첫 조각 = 강조) + 강조 조각에서 뻗은 큰 값 라벨 · 오른쪽 조각 목록 (짙은 바탕 됨)
   rings[{label,value,sub,color}] 합이 100 아래면 나머지는 「그 밖」(rest) · centerText[줄] · rest(이름) */
function fillRing(bd, s, ctx) { var P = ctx.P, R = (s.rings || []).slice(0, 4), unit = s.unit == null ? '%' : s.unit, dec = s.dec != null ? s.dec : 1, svg = ctx.svg(512), deep = ctx.dark, bgc = deep ? P.bg : '#FFFFFF';
  var sum = 0; R.forEach(function (q) { sum += +q.value }); var rest = Math.max(0, 100 - sum); if (rest > .05) R.push({ label: s.rest || '그 밖', value: +rest.toFixed(dec), rest: 1 });
  var cx = 320, cy = 256, r = 186, sw = 88, T0 = 300, pal = ['main', 'cmp', 'g40', 'g65'], cum = 0, segs = [];
  E('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: P.light, 'stroke-width': sw }, h.lv(svg, 1));
  R.forEach(function (q, i) { var v = +q.value, a0 = -90 + 3.6 * cum, a1 = a0 + 3.6 * v, col = q.rest ? P.light : pc(P, q.color || pal[i % pal.length]);
    if (!q.rest) E('path', { d: arc(cx, cy, r, a0, a1 - (v >= 99.9 ? .02 : 0)), fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'butt', 'data-key': q.label, 'data-at': T0 + cum * 12, 'data-fx': 'draw', 'data-ms': Math.max(240, v * 12) }, svg);
    segs.push({ q: q, col: col, mid: (a0 + a1) / 2, v: v }); cum += v });
  var sp = h.at(svg, T0 + 1250, { 'data-fx': 'fade', 'data-ms': 300 }); cum = 0; segs.forEach(function (g) { var a = (-90 + 3.6 * cum) * Math.PI / 180; cum += g.v;
    E('line', { x1: cx + (r - sw / 2 - 1) * Math.cos(a), y1: cy + (r - sw / 2 - 1) * Math.sin(a), x2: cx + (r + sw / 2 + 1) * Math.cos(a), y2: cy + (r + sw / 2 + 1) * Math.sin(a), stroke: bgc, 'stroke-width': 3 }, sp) });
  (s.centerText || []).forEach(function (t, k, A) { T(h.lv(svg, 1), cx, cy + (k - (A.length - 1) / 2) * 24 + 5, t, { 'text-anchor': 'middle', 'font-size': k ? 15 : 18, 'font-weight': k ? 400 : 700, fill: k ? P.mute : P.sub }) });
  var px = 660, n = segs.length, heroH = 168, oh = 92, y0 = 256 - (heroH + oh * (n - 1)) / 2, hy = y0 + 70, g0 = segs[0];
  var hm = g0.mid * Math.PI / 180, p0 = [cx + (r + sw / 2 + 6) * Math.cos(hm), cy + (r + sw / 2 + 6) * Math.sin(hm)], p1 = [p0[0] + 30 * Math.cos(hm), Math.max(12, p0[1] + 30 * Math.sin(hm))];
  E('path', { d: 'M' + p0[0] + ' ' + p0[1] + ' L' + p1[0] + ' ' + p1[1] + ' H' + (px - 26) + ' V' + hy + ' H' + (px - 12), fill: 'none', stroke: P.main, 'stroke-width': 2 }, h.at(svg, T0 + 900, { 'data-fx': 'fade', 'data-ms': 400 }));
  segs.forEach(function (g, i) { var q = g.q, y = i ? y0 + heroH + (i - 1) * oh : y0, big = i === 0, fs = big ? 100 : 42, ty = big ? y + 118 : y + 72, gg = h.at(svg, T0 + 1100 + i * 200, { 'data-fx': 'right', 'data-ms': 520, 'data-key': q.label }); if (big) gg.setAttribute('data-at', T0 + 1000);
    E('rect', { x: px, y: y + (big ? 6 : 4), width: big ? 22 : 18, height: big ? 22 : 18, rx: 3, fill: g.col, stroke: q.rest ? P.axis : 'none' }, gg); T(gg, px + (big ? 34 : 28), y + (big ? 24 : 19), q.label, { 'font-size': big ? 24 : 20, 'font-weight': 700, fill: P.ink });
    var vv = h.nf(g.v, dec); T(gg, px, ty, vv, { 'font-size': fs, 'font-weight': 700, fill: big ? P.dark : P.sub, 'letter-spacing': '-0.02em', 'data-fx': 'count', 'data-count': g.v, 'data-dec': dec });
    var vw = h.textW(vv, fs, 1) * .97 + 6; T(gg, px + vw, ty, unit, { 'font-size': fs * .45, 'font-weight': 700, fill: big ? P.dark : P.sub });
    if (q.sub) T(gg, big ? px : px + vw + fs * .45 + 28, big ? ty + 30 : ty - 2, q.sub, { 'font-size': big ? 18 : 16, fill: P.mute }) });
  ctx.root.setAttribute('data-gap', 300) }
function pc(P, c) { return P[c] || h.col(c) }
ECOM.parts.donut = function (bd, s, ctx) {
  if (s.layout === 'fill') return fillRing(bd, s, ctx);
  var root = ctx.root, R = (s.rings || []).slice(0, 4), k = R.length; if (!k) return;
  var unit = s.unit == null ? '%' : s.unit, dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), half = !!s.half, hero = s.hero == null ? 0 : s.hero, svg = ctx.svg(512);
  var side = s.side, SW = side ? 400 : 0, RW = 1168 - (side ? SW + 40 : 0), rt = s.ringTitle, top = rt ? 34 : 6, cw = RW / k, T0 = 400, strip = R.some(function (q) { return q.strip }), subH = R.some(function (q) { return q.sub2 }) ? 50 : 30;
  if (rt) T(h.lv(svg, 1), 0, 20, rt, { 'font-size': 15, 'font-weight': 700, fill: C.sub });
  R.forEach(function (rg, i) { var cx = cw * (i + .5), v = Math.max(0, Math.min(100, +rg.value)), col = h.col(rg.color || (i === hero ? 'main' : 'g65')), r, cy, a0, a1, span;
    /* 고리 한 묶음(이름 · 고리 · 글 · 띠)을 세로 가운데에 */
    var stH = strip ? 62 : 0, room = 512 - top - 30 - 28 - subH - stH - 8;
    if (half) { r = Math.min(cw / 2 - 28, room - 30); a0 = 180; span = 180 } else { r = Math.min(cw / 2 - 24, room / 2.22); a0 = -90; span = 360 }
    var sw = Math.max(16, Math.min(40, r * .22)), ringH = half ? r + sw / 2 + 30 : 2 * r + sw, blk = 30 + ringH + 28 + subH + stH, y0 = top + Math.max(0, (512 - top - blk) / 2);
    cy = y0 + 30 + sw / 2 + r; a1 = a0 + span * v / 100; var g = h.lv(svg, 1);
    T(g, cx, y0 + 18, rg.label || '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.ink });
    E('path', { d: half ? arc(cx, cy, r, 180, 360) : arc(cx, cy, r, 0, 360), fill: 'none', stroke: C.light, 'stroke-width': sw }, g);
    if (v > 0) E('path', { d: arc(cx, cy, r, a0, a1), fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'butt', 'data-at': T0 + i * 260, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
    /* 가운데 숫자 : 숫자는 끝 맞춤, 단위는 바로 뒤에(간격 고정) */
    var vt = h.nf(v, dec), fs = Math.min(42, r * .42), vw = h.textW(vt, fs, 1) * .95, uw = h.textW(unit, fs * .5, 1), xe = cx + (vw - uw) / 2, ty = half ? cy - 14 : cy + fs * .35;
    T(svg, xe, ty, vt, { 'text-anchor': 'end', 'font-size': fs, 'font-weight': 700, fill: i === hero ? C.dark : C.ink, 'data-at': T0 + i * 260, 'data-fx': 'count', 'data-count': v, 'data-dec': dec, 'data-ms': 1000 });
    T(g, xe + 3, ty, unit, { 'font-size': fs * .5, 'font-weight': 700, fill: i === hero ? C.dark : C.ink });
    var sy = half ? cy + 36 : cy + r + sw / 2 + 28, sg = h.at(svg, T0 + i * 260 + 900, { 'data-fx': 'fade' });
    if (rg.sub) T(sg, cx, sy, rg.sub, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: i === hero ? C.dark : C.sub });
    if (rg.sub2) T(sg, cx, sy + 20, rg.sub2, { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute });
    /* 달 띠 : 칸마다 해당(색) · 아님(회색) */
    if (rg.strip) { var st = rg.strip, ns = st.length, sx0 = cx - Math.min(cw - 36, 260) / 2, swd = Math.min(cw - 36, 260), cwid = swd / ns, yy = sy + subH - 8, gs = h.at(svg, T0 + i * 260 + 1100, { 'data-fx': 'fade' });
      st.forEach(function (on, j) { if (on == null) return; E('rect', { x: sx0 + j * cwid, y: yy, width: Math.max(1, cwid - (cwid > 4 ? 1 : .4)), height: 22, fill: on ? col : C.gray }, gs) });
      var sl = s.stripLabels || []; if (sl[0]) T(gs, sx0, yy + 38, sl[0], { 'font-size': 12, fill: C.mute }); if (sl[1]) T(gs, sx0 + swd, yy + 38, sl[1], { 'text-anchor': 'end', 'font-size': 12, fill: C.mute }) }
    if (half) { T(g, cx - r, cy + 22, '0', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }); T(g, cx + r, cy + 22, '100' + unit, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) } });
  if (side) mini(svg, 1168 - SW, top, SW, 512 - top - 4, side, T0 + k * 260 + 900);
  root.setAttribute('data-gap', 300);
};
ECOM.parts.donut.layouts = ['default', 'fill']; ECOM.parts.donut.dark = ['fill'];
})();
