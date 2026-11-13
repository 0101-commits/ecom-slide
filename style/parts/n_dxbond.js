/* dx 채권 부품 3종(머리글자 dx) — F19 채권 · 금리 구조 : dxmat 만기별 변화 세로 막대 · dxauct 입찰 결과 표(칸 안 막대) · dxholder 보유자 구성 쌓은 막대 + 카드
   칸 설명은 style/SCHEMA4_F02.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.dxu, W = 1168;

/* ───── dxmat 만기별 변화 세로 막대 ───── */
ECOM.parts.dxmat = function (bd, s, ctx) {
  var svg = ctx.svg(512), M = s.mats, V = s.values, L = s.levels, n = M.length, x0 = 70, x1 = W - 20, y0 = 62, y1 = 336, sc = u.scale(s.y, y0, y1), Y = sc.Y, slot = (x1 - x0) / n, bw = slot * .52, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.grid(g1, sc, x0, x1, { suf: s.y.suf || '' }); T(g1, 0, y0 - 28, s.caption || s.title || '', { 'font-size': 14, 'font-weight': 700, fill: C.sub });
  var mx = 0, mi = 0; V.forEach(function (v, i) { if (Math.abs(v) > mx) { mx = Math.abs(v); mi = i } });
  var avg = V.reduce(function (a, b) { return a + b }, 0) / n;
  M.forEach(function (m, i) { var cx = x0 + slot * (i + .5); T(g1, cx, y1 + 24, m, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }) });
  T(g1, x0 - 9, y1 + 60, '지금 금리', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  V.forEach(function (v, i) { var cx = x0 + slot * (i + .5), yv = Y(v), z = Y(0), pos = v >= 0, hi = i === mi;
    E('rect', { x: cx - bw / 2, y: Math.min(yv, z), width: bw, height: Math.max(1.5, Math.abs(yv - z)), rx: 3, fill: pos ? (hi ? C.dark : C.main) : (hi ? C.cmp : C.gray), 'data-at': 300 + i * 90, 'data-fx': 'grow', 'data-o': pos ? '50% 100%' : '50% 0%', 'data-ms': 520 }, svg);
    var gv = h.at(svg, 700 + i * 90, { 'data-fx': 'fade' }); T(gv, cx, pos ? yv - 9 : yv + 20, h.nf(v, s.dec != null ? s.dec : 0, { sign: true }), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: hi ? C.ink : C.sub });
    var gl = h.at(svg, 500 + i * 60, { 'data-fx': 'fade' }); E('rect', { x: cx - 31, y: y1 + 42, width: 62, height: 26, rx: 13, fill: C.g08, stroke: C.g40 }, gl); T(gl, cx, y1 + 60, h.nf(L[i], 2) + '%', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.dark }) });
  var ga = h.at(svg, 1500, { 'data-fx': 'fade' }); E('line', { x1: x0, x2: x1, y1: Y(avg), y2: Y(avg), stroke: C.dark, 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, ga);
  u.pill(ga, x1 - 66, Y(avg) + (avg >= 0 ? -16 : 16), s.avgText || '평균', C.dark, '#fff', 12.5);
  var cx = x0 + slot * (mi + .5), yv = Y(V[mi]); u.pill(ga, cx, V[mi] >= 0 ? yv - 34 : yv + 46, s.maxText || '변화 최대', C.warn, '#fff', 12.5, {});
  (s.groups || []).forEach(function (g, k) { var xa = x0 + slot * g.from + 8, xb = x0 + slot * (g.to + 1) - 8, gg = h.at(svg, 1700 + k * 200, { 'data-fx': 'fade' }), yy = y1 + 94;
    h.bracket(gg, xa, xb, yy, C.dark, false); T(gg, (xa + xb) / 2, yy + 26, g.name, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: C.dark });
    T(gg, (xa + xb) / 2, yy + 46, g.value, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.mute }) });
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxauct 입찰 결과 표 ───── */
ECOM.parts.dxauct = function (bd, s, ctx) {
  var svg = ctx.svg(512), rows = s.rows, n = rows.length, top = 62, rh = Math.floor((512 - top - 8) / n), cols = [0, 172, 372, 584, 812, 1040], g0 = h.lv(svg, 1, { 'data-fx': 'fade' });
  var heads = s.heads || ['만기', '발행액', '낙찰 금리', '예상 대비', '응찰률(배)', '판정'];
  E('rect', { x: 0, y: 6, width: W, height: 40, rx: 8, fill: C.dark }, g0); heads.forEach(function (t, i) { T(g0, cols[i] + 18, 32, t, { 'font-size': 14, 'font-weight': 700, fill: '#fff' }) });
  var tmax = s.tailMax || 3, bmax = s.btcMax || 4;
  rows.forEach(function (r, i) { var y = top + i * rh, cy = y + rh / 2, g = h.at(svg, 250 + i * 220, { 'data-fx': 'rise' });
    E('rect', { x: 0, y: y, width: W, height: rh - 6, rx: 8, fill: i % 2 ? '#fff' : C.g08, stroke: C.line }, g);
    T(g, cols[0] + 18, cy + 8, r.name, { 'font-size': 24, 'font-weight': 700, fill: C.dark });
    T(g, cols[1] + 18, cy + 7, r.size, { 'font-size': 20, 'font-weight': 700, fill: C.ink }); T(g, cols[1] + 18 + h.textW(r.size, 20, true) + 6, cy + 7, s.sizeUnit || '', { 'font-size': 13, 'font-weight': 600, fill: C.mute });
    T(g, cols[2] + 18, cy + 9, h.nf(r.yield, 2) + '%', { 'font-size': 26, 'font-weight': 700, fill: C.ink });
    /* 예상 대비 가운데 0 막대 */
    var bx0 = cols[3] + 18, bw = 160, bz = bx0 + bw / 2, tl = Math.min(bw / 2, Math.abs(r.tail) / tmax * bw / 2), bad = r.tail > 0;
    E('rect', { x: bx0, y: cy - 10, width: bw, height: 20, rx: 4, fill: '#fff', stroke: C.line }, g); E('rect', { x: bad ? bz : bz - tl, y: cy - 10, width: tl, height: 20, rx: 3, fill: bad ? C.warn : C.main }, g);
    E('line', { x1: bz, x2: bz, y1: cy - 15, y2: cy + 15, stroke: C.mute, 'stroke-width': 1.6 }, g); T(g, bx0 + bw + 10, cy + 6, h.nf(r.tail, 1, { sign: true }) + 'bp', { 'font-size': 14.5, 'font-weight': 700, fill: bad ? C.warn : C.dark });
    /* 응찰률 막대 + 평균 눈금 */
    var cx0 = cols[4] + 18, cw = 150, bl = Math.min(cw, r.btc / bmax * cw); E('rect', { x: cx0, y: cy - 10, width: cw, height: 20, rx: 4, fill: '#fff', stroke: C.line }, g); E('rect', { x: cx0, y: cy - 10, width: bl, height: 20, rx: 3, fill: r.btc < s.btcAvg ? C.g40 : C.main }, g);
    var ax = cx0 + s.btcAvg / bmax * cw; E('line', { x1: ax, x2: ax, y1: cy - 16, y2: cy + 16, stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, g); T(g, cx0 + cw + 10, cy + 6, h.nf(r.btc, 2), { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    var v = r.verdict, vc = v.tone === 'bad' ? C.warn : v.tone === 'good' ? C.main : C.cmp; u.pill(g, cols[5] + 18 + h.textW(v.text, 14, true) / 2 + 10, cy, v.text, vc, '#fff', 14) });
  ctx.root.setAttribute('data-gap', 300) };

/* ───── dxholder 보유자 구성 쌓은 막대 + 카드 ───── */
ECOM.parts.dxholder = function (bd, s, ctx) {
  var svg = ctx.svg(512), P = s.parts, n = P.length, g0 = h.lv(svg, 1, { 'data-fx': 'fade' }), by = 92, bh = 78, tot = P.reduce(function (a, p) { return a + p.share }, 0), shades = [['dark', '#fff'], ['main', '#fff'], ['g65', '#fff'], ['g40', C.ink], ['g18', C.ink], ['gray', C.ink]];
  var acc = 0, seg = P.map(function (p, i) { var w = p.share / tot * W, o = { x: acc, w: w, c: acc + w / 2, i: i }; acc += w; return o });
  (s.groups || []).forEach(function (g, k) { var xa = seg[g.from].x + 3, xb = seg[g.to].x + seg[g.to].w - 3, gg = h.at(svg, 1500 + k * 200, { 'data-fx': 'fade' }); h.bracket(gg, xa, xb, by - 12, C.dark, false);
    T(gg, (xa + xb) / 2, by - 36, g.name + ' ' + g.value, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.dark }) });
  seg.forEach(function (q, i) { var p = P[i], sh = shades[i % shades.length]; E('rect', { x: q.x + 1, y: by, width: Math.max(2, q.w - 2), height: bh, rx: 4, fill: C[sh[0]], 'data-at': 200 + i * 130, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    if (q.w > 70) { var g = h.at(svg, 500 + i * 130, { 'data-fx': 'fade' }); T(g, q.c, by + bh / 2 + 8, h.nf(p.share, 0) + '%', { 'text-anchor': 'middle', 'font-size': q.w > 120 ? 26 : 20, 'font-weight': 700, fill: sh[1] }) } });
  /* 카드 */
  var gap = 12, cw = (W - gap * (n - 1)) / n, cy = 232, ch = 270, mxv = Math.max.apply(null, P.map(function (p) { return Math.max(p.share, p.prev) })) * 1.1;
  P.forEach(function (p, i) { var q = seg[i], bx = i * (cw + gap), g = h.at(svg, 900 + i * 200, { 'data-fx': 'rise' }), d = p.share - p.prev, up = d >= 0, sh = shades[i % shades.length];
    E('path', { d: 'M' + q.c + ' ' + (by + bh) + ' L' + q.c + ' ' + (by + bh + 18) + ' L' + (bx + cw / 2) + ' ' + (cy - 20) + ' L' + (bx + cw / 2) + ' ' + cy, fill: 'none', stroke: C.axis, 'stroke-width': 1.4, 'stroke-dasharray': '3 3' }, g);
    E('rect', { x: bx, y: cy, width: cw, height: ch, rx: 10, fill: '#fff', stroke: C.axis, 'stroke-width': 1.4 }, g); E('rect', { x: bx, y: cy, width: cw, height: 40, rx: 10, fill: C[sh[0]] }, g); E('rect', { x: bx, y: cy + 28, width: cw, height: 12, fill: C[sh[0]] }, g);
    T(g, bx + cw / 2, cy + 27, p.name, { 'text-anchor': 'middle', 'font-size': 15.5, 'font-weight': 700, fill: sh[1] });
    T(g, bx + cw / 2 - 8, cy + 98, h.nf(p.share, 1), { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 700, fill: C.ink }); T(g, bx + cw / 2 + h.textW(h.nf(p.share, 1), 38, true) / 2 - 4, cy + 98, '%', { 'font-size': 18, 'font-weight': 700, fill: C.mute });
    u.pill(g, bx + cw / 2, cy + 130, (up ? '▲ ' : '▼ ') + h.nf(Math.abs(d), 1) + '%p', up ? C.main : C.warn, '#fff', 14);
    T(g, bx + cw / 2, cy + 160, (s.heads || ['5년 전', '지금']).join(' → '), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: C.mute });
    var tx0 = bx + 16, tx1 = bx + cw - 16, A = h.lin(0, mxv, tx0, tx1); E('line', { x1: tx0, x2: tx1, y1: cy + 190, y2: cy + 190, stroke: C.line, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    E('line', { x1: A(p.prev), x2: A(p.share), y1: cy + 190, y2: cy + 190, stroke: up ? C.main : C.warn, 'stroke-width': 4 }, g); E('circle', { cx: A(p.prev), cy: cy + 190, r: 6, fill: '#fff', stroke: C.cmp, 'stroke-width': 2.4 }, g); E('circle', { cx: A(p.share), cy: cy + 190, r: 7, fill: up ? C.main : C.warn }, g);
    T(g, bx + cw / 2, cy + 224, h.nf(p.prev, 1) + '% → ' + h.nf(p.share, 1) + '%', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.sub }); if (p.sub) T(g, bx + cw / 2, cy + 246, p.sub, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: C.mute }) });
  ctx.root.setAttribute('data-gap', 300) };
})();
