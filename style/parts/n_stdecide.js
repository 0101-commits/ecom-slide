/* stdecide — 해당 여부 나무 : 질문 상자(왼쪽) → 「예 · 아니오」 갈림 → 결과 칸(맨 오른쪽 한 줄 세로)
   tree{q, yes, no} — yes · no 는 또 다른 {q,yes,no} 이거나 결과 {out,sub,tone:'main|gray|warn'} · yesLabel('예') · noLabel('아니오') · concl */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.stu;
ECOM.parts.stdecide = function (bd, s, ctx) {
  var root = s.tree; if (!root) return; var svg = ctx.svg(512), NW = 210, LW = 220, LH = 80, leaves = [], D = 0;
  function walk(nd, d) { if (nd.out != null) { nd._leaf = true; nd._i = leaves.length; leaves.push(nd); return } D = Math.max(D, d + 1); nd._d = d; walk(nd.yes, d + 1); walk(nd.no, d + 1) }
  walk(root, 0);
  var n = leaves.length, top = 0, area = s.band ? 440 : 512, gapL = n > 1 ? Math.max(8, (area - n * LH) / (n - 1)) : 0, step = D > 1 ? (1168 - LW - NW - 110) / (D - 1) : 0, LX = 1168 - LW;
  function cyL(i) { return top + LH / 2 + i * (LH + gapL) }
  function place(nd) { if (nd._leaf) { nd._cy = cyL(nd._i); return nd._cy } var a = place(nd.yes), b = place(nd.no); nd._cy = (a + b) / 2; return nd._cy }
  place(root);
  var yl = s.yesLabel || '예', nl = s.noLabel || '아니오';
  function draw(nd) { var ms = (nd._d || 0) * 700;
    if (nd._leaf) return; var x = nd._d * step, y = nd._cy, g = h.at(svg, ms, { 'data-fx': 'rise', 'data-ms': 400 });
    u.box(g, x, y - 36, NW, 72, nd._d === 0 ? C.dark : C.paper, { stroke: nd._d === 0 ? null : C.g40, sw: 1.5 });
    var L = h.wrap(nd.q || '', 16, NW - 28, 1), fs = L.length > 2 ? 14 : 16; L = h.wrap(nd.q || '', fs, NW - 28, 1);
    L.forEach(function (l, i) { T(g, x + NW / 2, y + 5 - (L.length - 1) * fs * .65 + i * fs * 1.3, l, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: nd._d === 0 ? '#fff' : C.ink }) });
    [['yes', yl, C.main], ['no', nl, C.cmp]].forEach(function (k) { var ch = nd[k[0]], px = x + NW, py = y, leaf = !!ch._leaf, cx = leaf ? LX : ch._d * step, cy = ch._cy, mx = px + 24, gg = h.at(svg, ms + 350, { 'data-fx': 'fade', 'data-ms': 350 });
      E('path', { d: 'M' + px + ' ' + py + ' H' + mx + ' V' + cy + ' H' + cx, fill: 'none', stroke: k[2] === C.main ? C.g65 : C.axis, 'stroke-width': 2.2 }, gg);
      u.chip(gg, mx + 34, cy, k[1], k[2], '#fff', 12.5);
      if (leaf) { var tone = ch.tone || 'gray', fill = tone === 'main' ? C.dark : tone === 'warn' ? C.warn : C.light, tc = tone === 'gray' ? C.ink : '#fff', sc = tone === 'gray' ? C.mute : C.g18, gl = h.at(svg, ms + 700, { 'data-fx': 'pop', 'data-ms': 380 });
        u.box(gl, LX, cy - LH / 2, LW, LH, fill); T(gl, LX + 20, cy - 2, ch.out, { 'font-size': u.fit(ch.out, 19, LW - 40, 1, 13), 'font-weight': 700, fill: tc });
        if (ch.sub) T(gl, LX + 20, cy + 22, ch.sub, { 'font-size': u.fit(ch.sub, 13, LW - 40, 0, 11.5), 'font-weight': 500, fill: sc }) }
      else draw(ch) }) }
  draw(root);
  if (s.band) { var gc = h.at(svg, 700 * (D + 1), { 'data-fx': 'fade' }); u.box(gc, 0, 454, 1168, 54, C.paper, { rx: 10 }); u.rich(gc, 22, 487, s.band, 16, 1124, { fill: C.cmp, min: 13 }) }
};
})();
