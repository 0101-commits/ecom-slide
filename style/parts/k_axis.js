/* axis — 가운데 축 비교(CW44 7쪽 · Kick-off 10쪽) : 가운데 기준 열 → 양쪽 판이 바깥으로 펼침 → 줄 → 예시 → 결론
   center{title} · left/right{title,def,sub,badge:'up|down|none|글자',tone} · rows[{label,left,right}]
   examples{label:'예시', left:{lead,items:[{k,v}],concl}, right:{…}} · result{left,right}(예시 없을 때 아래 띠) · beats[{spot:'left|right'}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, K = ECOM.kx;
function badge(b, right, col) { if (b === 'none') return ''; var tri = right ? '<path d="M120 0 H6 L120 94 Z" fill="' + col + '"/>' : '<path d="M0 0 H114 L0 94 Z" fill="' + col + '"/>';
  var ix = right ? 86 : 34, iy = 32, g;
  if (!b || b === 'up' || b === 'down') { var up = b !== 'down', x0 = ix - 13, x1 = ix + 13, y0 = up ? iy + 13 : iy - 13, y1 = up ? iy - 13 : iy + 13;
    g = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/><path d="M' + (x1 - 12) + ' ' + y1 + ' H' + x1 + ' V' + (up ? y1 + 12 : y1 - 12) + '" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' }
  else g = '<text x="' + ix + '" y="' + (iy + 8) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">' + h.esc(b) + '</text>';
  return tri + g }
ECOM.parts.axis = function (bd, s, ctx) {
  var root = ctx.root, W = 1168, CW = 156, c0 = (W - CW) / 2, c1 = c0 + CW, M = W / 2, PAD = 24, BW = 104;
  var L = s.left || {}, R = s.right || {}, rows = s.rows || [], cen = s.center || {}, ex = s.examples || null, cc = s.result || s.concl || null;
  var hasEx = !!(ex && (ex.left || ex.right)), hasCc = !hasEx && !!(cc && (cc.left || cc.right)), tw = c0 - PAD * 2;
  // 머리 높이 : 정의 · 보조 줄 수에 맞춤(바깥 모서리 표지 자리 비움)
  var hw = c0 - PAD - BW, hl = [L, R].map(function (o) { return 34 + K.lines(o.def, 16, hw - 4, 1) * 23 + (o.sub ? K.lines(o.sub, 13.5, hw - 4) * 20 + 4 : 0) });
  var HH = Math.max(108, Math.max.apply(null, hl) + 26);
  var rh = rows.map(function (r) { var n = Math.max(K.lines(r.left, 15, tw - 30, 1), K.lines(r.right, 15, tw - 30, 1), K.lines(r.label, 15, CW - 24, 1)); return Math.max(46, n * 22 + 20) });
  var rowsH = K.sum(rh);
  if (!hasEx) { var room = 512 - HH - rowsH - (hasCc ? 76 : 8); if (room > 0) { var add = Math.min(room / Math.max(1, rows.length), 46); rh = rh.map(function (v) { return v + add }); rowsH = K.sum(rh) } }
  var y = HH, ys = rh.map(function (v) { var a = y; y += v; return a }), rEnd = HH + rowsH, exTop = rEnd + 20, grp = [[], []];
  // 양쪽 판(바깥으로 펼침) — 판 · 머리 · 표지
  [L, R].forEach(function (o, k) { var right = k === 1, tone = h.col(o.tone || (right ? 'cmp' : 'main'));
    var p = K.D(bd, 'kx k-axp' + (right ? ' r' : ''), right ? M : 0, 0, M, 512, null, { 'data-b': 2, 'data-fx': right ? 'left' : 'right', 'data-ms': 560 });
    p.innerHTML = '<svg width="120" height="96" viewBox="0 0 120 96" style="position:absolute;top:0;' + (right ? 'right:0' : 'left:0') + '">' + badge(o.badge, right, tone) + '</svg>'
      + '<div class="k-axh" style="left:' + (right ? c1 - M + PAD : BW) + 'px;width:' + hw + 'px;text-align:' + (right ? 'left' : 'right') + '">'
      + '<div class="k-axt" style="color:' + (right ? (o.tone ? tone : C.cmp) : C.dark) + '">' + h.esc(o.title || '') + '</div>'
      + (o.def ? '<div class="k-axd">' + h.md(o.def) + '</div>' : '') + (o.sub ? '<div class="k-axs">' + h.md(o.sub) + '</div>' : '') + '</div>';
    grp[k].push(p) });
  // 가운데 기준 열(먼저)
  var stB = hasEx ? exTop + 40 : rEnd + 10, st = K.D(bd, 'kx k-axc', c0, 8, CW, stB - 8, null, { 'data-b': 1, 'data-fx': 'fade', 'data-ms': 420 });
  K.D(st, 'kx k-axct', 0, 0, CW, HH - 8, h.esc(cen.title || ''), { 'data-b': 1, 'data-fx': 'pop' });
  rows.forEach(function (r, i) { var last = i === rows.length - 1;
    K.D(st, 'kx k-axl', 0, ys[i] - 8, CW, rh[i], h.esc(r.label || ''), { 'data-b': 1, 'data-fx': 'pop' });
    grp[0].push(K.D(bd, 'kx k-axr' + (last ? ' last' : ''), PAD, ys[i], c0 - PAD, rh[i], '<span>' + h.md(r.left || '') + '</span>', { 'data-b': 3, 'data-fx': 'right' }));
    grp[1].push(K.D(bd, 'kx k-axr r' + (last ? ' last' : ''), c1, ys[i], W - PAD - c1, rh[i], '<span>' + h.md(r.right || '') + '</span>', { 'data-b': 3, 'data-fx': 'left' })) });
  // 예시
  if (hasEx) { K.D(st, 'kx k-axx', (CW - 72) / 2, exTop - 8 + 4, 72, 30, h.esc(ex.label || '예시'), { 'data-b': 4, 'data-fx': 'pop' });
    [ex.left, ex.right].forEach(function (e, k) { if (!e) return; var x = k ? c1 + 14 : 18, w = k ? W - 18 - x : c0 - 14 - 18;
      var html = (e.lead ? '<div class="k-axel">' + h.md(e.lead) + '</div>' : '') + (e.items && e.items.length ? '<div class="k-axul">' + e.items.map(function (it) {
        return '<div class="k-axli">' + (it.k ? '<div class="k-axk">' + h.md(it.k) + '</div>' : '') + (it.v ? '<div class="k-axv">' + h.md(it.v) + '</div>' : '') + '</div>' }).join('') + '</div>' : '')
        + (e.concl ? '<div class="k-axec' + (k ? ' r' : '') + '" data-b="5" data-fx="pop">' + h.md(e.concl) + '</div>' : '');
      grp[k].push(K.D(bd, 'kx k-axe', x, exTop, w, 512 - exTop - 4, html, { 'data-b': 4 })) }) }
  if (hasCc) [cc.left, cc.right].forEach(function (t, k) { if (!t) return; var x = k ? c1 + 14 : 18;
    grp[k].push(K.D(bd, 'kx k-axcc' + (k ? ' r' : ''), x, 512 - 62, k ? W - 18 - x : c0 - 14 - 18, 58, '<span>' + h.md(t) + '</span>', { 'data-b': 5, 'data-fx': 'pop' })) });
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? (b.spot === 'right' ? 1 : b.spot === 'left' ? 0 : null) : null;
    grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) };
  root.setAttribute('data-gap', 380); root.setAttribute('data-stg', 70) };
})();
