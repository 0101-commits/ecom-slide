/* tree — 논리 나무(왼쪽 → 오른쪽) : 뿌리 → 줄기 선 → 가지 상자 → 가지마다 잎 선 · 잎 상자
   root{title,sub,value} · branches[2~4]{title,sub,tone,leaves:[{title,text,value}]} · beats[{spot:가지}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
ECOM.parts.tree = function (bd, s, ctx) {
  var root = ctx.root, rt = s.root || {}, br = (s.branches || []).slice(0, 4), B = br.length, nL = br.reduce(function (a, b) { return a + (b.leaves || []).length }, 0);
  var RX = 0, RW = 214, BX = 274, BW = 236, LX = 566, LW = 1168 - LX, lg = 10, bgp = 22, lh = Math.min(86, (512 - (nL - B) * lg - (B - 1) * bgp) / nL);
  var svg = K.svg(ctx), y = 0, grp = br.map(function () { return [] }), spans = [];
  var used = nL * lh + (nL - B) * lg + (B - 1) * bgp, oy = (512 - used) / 2; y = oy;
  br.forEach(function (b, i) { var ls = b.leaves || [], a = y; ls.forEach(function () { y += lh + lg }); y -= lg; spans.push([a, y]); y += bgp });
  var rh = Math.min(240, used), ry = 256 - rh / 2, cy = 256;
  K.D(bd, 'kx k-trr', RX, ry, RW, rh, '<b>' + h.md(rt.title || '') + '</b>' + (rt.value ? '<em>' + h.md(rt.value) + '</em>' : '') + (rt.sub ? '<span>' + h.md(rt.sub) + '</span>' : ''), { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 420 });
  var t1 = 380, li = 0;
  br.forEach(function (b, i) { var sp = spans[i], by = (sp[0] + sp[1]) / 2, bH = Math.min(sp[1] - sp[0], 128), tone = h.col(b.tone || (['main', 'dark', 'g65', 'cmp'][i] || 'main')), tb = t1 + 260 + i * 140;
    var pth = E('path', { d: 'M' + (RX + RW) + ' ' + cy + ' H' + (RX + RW + 30) + ' V' + by + ' H' + (BX - 2), fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-at': t1 + i * 140, 'data-fx': 'draw', 'data-ms': 360 }, svg);
    var bx = K.D(bd, 'kx k-trb', BX, by - bH / 2, BW, bH, '<b>' + h.md(b.title || '') + '</b>' + (b.sub ? '<span>' + h.md(b.sub) + '</span>' : ''), { 'data-at': tb, 'data-fx': 'left', 'data-ms': 380 }); bx.style.background = tone;
    grp[i].push(pth, bx);
    var ly = sp[0];
    (b.leaves || []).forEach(function (l, j) { var my = ly + lh / 2, tl = t1 + 260 + B * 140 + 200 + li * 150;
      var lp = E('path', { d: 'M' + (BX + BW) + ' ' + by + ' H' + (BX + BW + 26) + ' V' + my + ' H' + (LX - 2), fill: 'none', stroke: C.gray, 'stroke-width': 1.8, 'data-at': tl, 'data-fx': 'draw', 'data-ms': 300 }, svg);
      var dt = E('circle', { cx: LX - 2, cy: my, r: 3.5, fill: tone, 'data-at': tl + 260, 'data-fx': 'fade' }, svg);
      var lb = K.D(bd, 'kx k-trl', LX + 6, ly, LW - 6, lh, '<i style="background:' + tone + '"></i><div><b>' + h.md(l.title || '') + '</b>' + (l.text ? '<span>' + h.md(l.text) + '</span>' : '') + '</div>' + (l.value ? '<em>' + h.md(l.value) + '</em>' : ''),
        { 'data-at': tl + 180, 'data-fx': 'rise', 'data-ms': 320 });
      grp[i].push(lp, dt, lb); ly += lh + lg; li++ }) });
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } };
})();
