/* firms — 기업 카드 나란히 : 카드 2~4장, 카드마다 큰 숫자 · 진행 막대(몇 년 치) · 지표 + 분기 작은 선 · 비중 고리. 1위 카드는 강조 테두리 + 칩
   cards[{name,tag(칩 글, 강조 카드만),big{label,value,unit,dec},bar{label,value,max,step(눈금 간격, 기본 1)},metric{label,value,unit,dec,trend[],trendLabels[처음,끝]},ring{label,value(0~100),sub}}]
   hero(강조 카드 번호, 기본 0 · -1 이면 강조 없음) · 고리 칸이 없으면 지표 선이 아래까지 커짐 · 막대 칸이 없으면 건너뜀 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.firms = function (bd, s, ctx) {
  var K = (s.cards || []).slice(0, 4), n = K.length; if (!n) return;
  var root = ctx.root, svg = ctx.svg(512), hero = s.hero == null ? 0 : s.hero, gap = n > 3 ? 20 : 26, cw = (1168 - (n - 1) * gap) / n, top = 4, ch = 504, noRing = !K.some(function (k) { return k.ring });
  var lo = Infinity, hi = -Infinity; K.forEach(function (k) { ((k.metric || {}).trend || []).forEach(function (v) { lo = Math.min(lo, v); hi = Math.max(hi, v) }) }); if (lo === Infinity) { lo = 0; hi = 1 } var pad = (hi - lo) * .15 || 1; lo -= pad; hi += pad;
  K.forEach(function (k, i) {
    var x = i * (cw + gap), isH = hero === i, t0 = i * 160, pl = x + 24, pw = cw - 48, g = h.at(svg, t0, { 'data-fx': 'fade' });
    E('rect', { x: x, y: top, width: cw, height: ch, rx: 14, fill: '#fff', stroke: isH ? C.dark : C.line, 'stroke-width': isH ? 2.5 : 1.2 }, g);
    T(g, pl, top + 40, k.name || '', { 'font-size': 20, 'font-weight': 700, fill: C.ink });
    if (isH && k.tag) { var tw = h.textW(k.tag, 12.5, 1) + 22; E('rect', { x: x + cw - 20 - tw, y: top + 24, width: tw, height: 24, rx: 12, fill: C.dark }, g); T(g, x + cw - 20 - tw / 2, top + 40.5, k.tag, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) }
    var b = k.big || {}, bd0 = b.dec != null ? b.dec : 0;
    if (b.label) T(g, pl, top + 80, b.label, { 'font-size': 13, 'font-weight': 600, fill: C.mute });
    var bt = T(svg, pl, top + 128, h.nf(b.value, bd0), { 'font-size': 46, 'font-weight': 700, fill: C.dark, 'data-at': 200 + t0, 'data-fx': 'count', 'data-count': b.value, 'data-dec': bd0, 'data-ms': 800 });
    T(h.at(svg, 200 + t0, { 'data-fx': 'fade' }), pl + h.textW(h.nf(b.value, bd0), 46, 1) + 8, top + 128, b.unit || '', { 'font-size': 16, 'font-weight': 600, fill: C.cmp });
    var y = top + 168;
    if (k.bar) { var br = k.bar, mx = +br.max || 1, v = Math.min(+br.value, mx), st = br.step || 1, g2 = h.at(svg, 350 + t0, { 'data-fx': 'fade' });
      T(g2, pl, y + 4, br.label || '', { 'font-size': 13.5, 'font-weight': 600, fill: C.cmp });
      E('rect', { x: pl, y: y + 14, width: pw, height: 14, rx: 7, fill: C.light }, g2);
      E('rect', { x: pl, y: y + 14, width: Math.max(2, pw * v / mx), height: 14, rx: 7, fill: C.main, 'data-at': 400 + t0, 'data-fx': 'growx', 'data-ms': 700 }, svg);
      for (var t = st; t < mx - 1e-9 && st > 0; t += st) { var tx = pl + pw * t / mx; E('line', { x1: tx, x2: tx, y1: y + 12, y2: y + 30, stroke: '#fff', 'stroke-width': 2 }, svg).setAttribute('data-at', 500 + t0) } }
    y += 66; E('line', { x1: pl, x2: pl + pw, y1: y, y2: y, stroke: C.grid }, g);
    var m = k.metric;
    if (m) { var md = m.dec != null ? m.dec : 1, ringH = noRing ? 0 : 148, mb = top + ch - 18 - ringH, vs = noRing ? 40 : 32, vy = noRing ? y + 74 : y + 70, g3 = h.at(svg, 550 + t0, { 'data-fx': 'fade' });
      T(g3, pl, y + 30, m.label || '', { 'font-size': 13, 'font-weight': 600, fill: C.mute });
      var vt = h.nf(m.value, md) + (m.unit || ''); T(svg, pl, vy, vt, { 'font-size': vs, 'font-weight': 700, fill: C.ink, 'data-at': 600 + t0, 'data-fx': 'fade' });
      var tr = m.trend || []; if (tr.length > 1) { var tl = m.trendLabels || [], vw = h.textW(vt, vs, 1), sx = noRing ? pl + 10 : pl + Math.max(vw + 24, pw * .5), sw = pl + pw - sx - 8, labH = tl.length ? 18 : 0, ty0 = noRing ? vy + 34 : y + 36, ty1 = noRing ? mb - labH - 6 : vy + 4, sl = tr.length > 1 ? sw / (tr.length - 1) : 0;
        var pts = tr.map(function (q, j) { return [sx + j * sl, ty1 - (q - lo) / (hi - lo) * (ty1 - ty0)] });
        E('path', { d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1) }).join(' L'), fill: 'none', stroke: C.main, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-at': 700 + t0, 'data-fx': 'draw', 'data-ms': 800 }, svg);
        var gp = h.at(svg, 900 + t0, { 'data-fx': 'fade' }); pts.forEach(function (q) { E('circle', { cx: q[0], cy: q[1], r: 4, fill: C.main }, gp) });
        if (tl[0]) T(gp, sx, ty1 + 20, tl[0], { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 500, fill: C.mute }); if (tl[1]) T(gp, sx + sw, ty1 + 20, tl[1], { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 500, fill: C.mute }) } }
    if (k.ring) { var rg = k.ring, ry = top + ch - 148, rv = Math.max(0, Math.min(100, +rg.value)), cx = pl + 46, cy = ry + 74, r = 40, g4 = h.at(svg, 800 + t0, { 'data-fx': 'fade' }), ang = 2 * Math.PI * rv / 100;
      E('line', { x1: pl, x2: pl + pw, y1: ry, y2: ry, stroke: C.grid }, g4); E('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: C.light, 'stroke-width': 14 }, g4);
      if (rv > 0) E('path', { d: 'M' + cx + ' ' + (cy - r) + ' A' + r + ' ' + r + ' 0 ' + (rv > 50 ? 1 : 0) + ' 1 ' + (cx + r * Math.sin(Math.min(ang, 6.283))).toFixed(1) + ' ' + (cy - r * Math.cos(Math.min(ang, 6.283))).toFixed(1), fill: 'none', stroke: C.main, 'stroke-width': 14, 'data-at': 800 + t0, 'data-fx': 'draw', 'data-ms': 800 }, svg);
      T(g4, cx, cy + 7, h.nf(rv, 0) + '%', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink });
      var rx = cx + r + 26, rw = pl + pw - rx; if (rg.label) T(g4, rx, cy - 12, rg.label, { 'font-size': 13, 'font-weight': 600, fill: C.mute });
      h.wrap(rg.sub || '', 15, rw, 1).slice(0, 2).forEach(function (ln, q) { T(g4, rx, cy + 10 + q * 20, ln, { 'font-size': 15, 'font-weight': 700, fill: C.ink }) }) } });
  root.setAttribute('data-gap', 300);
};
})();
