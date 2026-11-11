/* stairs — 원인 계단(CW44 10쪽) : 물음 상자 → 단계가 하나씩 내려앉고 굽은 화살이 그려짐 → 큰 화살 → 도장이 떨어짐 → 옆 상자
   intro{title,text} · steps[3~5]{tag:'WHY|①',title,lines:[1~2줄]} · side{title,text,sub} · stamp{label,value}(큰 화살 위 도장 — side 없으면 오른쪽 위에 결과 도장) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
ECOM.parts.stairs = function (bd, s, ctx) {
  var steps = (s.steps || []).slice(0, 5), N = steps.length, side = s.side || null, stamp = s.stamp || null, intro = s.intro || null;
  var x0 = 58, dx = N >= 5 ? 96 : N === 4 ? 118 : 150, rmax = side ? 878 : stamp ? 930 : 1168, sw = Math.min(side || stamp ? 620 : 760, rmax - x0 - (N - 1) * dx);
  var TAG = 78, tx = TAG + 34, tw = sw - tx - 16;
  var sh = Math.max(72, Math.max.apply(null, steps.map(function (st) { return 26 + K.lines(st.title, 15.5, tw, 1) * 22 + (st.lines || []).reduce(function (a, l) { return a + K.lines(l, 13.5, tw - 12) * 19 }, 0) })) + 14);
  var y0 = intro ? 120 : 6, pitch = N > 1 ? Math.min(124, (512 - y0 - sh) / (N - 1)) : 0;
  if (!intro) y0 = Math.max(6, (512 - sh - (N - 1) * pitch) / 2);
  var svg = K.svg(ctx), t0 = intro ? 420 : 120, PER = 560, end = 0;
  if (intro) { K.D(bd, 'kx k-stin', 0, 0, 430, 96, '<div class="k-stit">' + h.md(intro.title || '') + '</div>' + (intro.text ? '<div class="k-sttx">' + h.md(intro.text) + '</div>' : ''), { 'data-at': 0, 'data-fx': 'rise' }) }
  var col = function (k) { var q = N > 1 ? k / (N - 1) : 1; return 'rgb(' + Math.round(240 - 26 * q) + ',' + Math.round(247 - 13 * q) + ',' + Math.round(244 - 20 * q) + ')' };
  steps.forEach(function (st, k) { var x = x0 + k * dx, y = y0 + k * pitch, ta = t0 + k * PER, last = k === N - 1, my = y + sh / 2;
    // 굽은 화살(위 왼쪽에서 내려와 이름표로)
    if (k > 0 || intro) { var sx = x - 36, sy = k ? y - pitch + sh + 6 : y - 18, ex = x - 7;
      var d = 'M' + sx + ' ' + sy + ' C ' + (sx - 6) + ' ' + (my - 4) + ', ' + (sx + 8) + ' ' + my + ', ' + ex + ' ' + my;
      E('path', { d: d, fill: 'none', stroke: C.g65, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'data-at': ta, 'data-fx': 'draw', 'data-ms': 380 }, svg);
      K.head(svg, x - 1, my, 0, C.g65, 10, { 'data-at': ta + 330, 'data-fx': 'fade', 'data-ms': 160 }) }
    var html = '<div class="k-sttg' + (last ? ' last' : '') + '" style="width:' + TAG + 'px">' + h.esc(st.tag || String(k + 1)) + '</div><div class="k-stbx" style="left:' + tx + 'px;width:' + tw + 'px">'
      + '<div class="k-stt">' + h.md(st.title || '') + '</div>' + (st.lines || []).map(function (l) { return '<div class="k-stl">' + h.md(l) + '</div>' }).join('') + '</div>';
    var b = K.D(bd, 'kx k-stp' + (last ? ' last' : ''), x, y, sw, sh, html, { 'data-at': ta + 220, 'data-fx': 'left', 'data-ms': 420 }); b.style.background = col(k);
    end = ta + 640 });
  // 큰 화살 → 옆 상자(또는 결과 도장)
  var sideBox = side ? { x: 900, y: intro ? 26 : 10, w: 268 } : null, tgt = null;
  if (side) { var shh = 64 + K.lines(side.text, 15.5, sideBox.w - 36, 1) * 23 + (side.sub ? K.lines(side.sub, 13, sideBox.w - 36) * 19 + 8 : 0);
    K.D(bd, 'kx k-stsd', sideBox.x, sideBox.y, sideBox.w, shh, '<div class="k-stsh"><i>!</i>' + h.esc(side.title || '') + '</div><div class="k-stst">' + h.md(side.text || '') + '</div>' + (side.sub ? '<div class="k-stss">' + h.md(side.sub) + '</div>' : ''),
      { 'data-at': end + 1500, 'data-fx': 'rise', 'data-ms': 420 }); tgt = { x: sideBox.x + sideBox.w / 2, y: sideBox.y + shh + 52 } }
  else if (stamp) tgt = { x: 1030, y: 214 };
  if (tgt && N) { var lx = x0 + (N - 1) * dx + sw + 16, ly = y0 + (N - 1) * pitch + sh / 2, P0 = [lx, ly], P1 = [tgt.x + 40, ly], P2 = [tgt.x, ly - 90], P3 = [tgt.x, tgt.y];
    var gid = 'kstg' + ctx.index, df = E('defs', {}, svg), lg = E('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: P0[0], y1: P0[1], x2: P3[0], y2: P3[1] }, df);
    E('stop', { offset: 0, 'stop-color': C.g08 }, lg); E('stop', { offset: 1, 'stop-color': C.g40 }, lg);
    E('path', { d: 'M' + P0 + ' C ' + P1 + ', ' + P2 + ', ' + P3, fill: 'none', stroke: 'url(#' + gid + ')', 'stroke-width': 40, 'data-at': end + 60, 'data-fx': 'draw', 'data-ms': 820 }, svg);
    K.head(svg, tgt.x, tgt.y - 40, -Math.PI / 2, C.g40, 40, { 'data-at': end + 820, 'data-fx': 'fade', 'data-ms': 200 });
    if (stamp) { var q = .5, bx = Math.pow(1 - q, 3) * P0[0] + 3 * Math.pow(1 - q, 2) * q * P1[0] + 3 * (1 - q) * q * q * P2[0] + q * q * q * P3[0], by = Math.pow(1 - q, 3) * P0[1] + 3 * Math.pow(1 - q, 2) * q * P1[1] + 3 * (1 - q) * q * q * P2[1] + q * q * q * P3[1];
      if (!side) { bx = tgt.x; by = tgt.y - 120 }
      var sw2 = Math.max(170, h.textW(stamp.value || '', 25, 1) + 40, h.textW(stamp.label || '', 13, 1) + 40), og = E('g', { transform: 'translate(' + bx + ' ' + by + ') rotate(-5)' }, svg), sg = E('g', { 'data-at': end + 1050, 'data-fx': 'drop', 'data-dy': 90, 'data-ms': 620 }, og);
      E('rect', { x: -sw2 / 2, y: -40, width: sw2, height: 80, rx: 8, fill: '#fff', stroke: C.dark, 'stroke-width': 2.6 }, sg);
      E('rect', { x: -sw2 / 2 + 5, y: -35, width: sw2 - 10, height: 70, rx: 5, fill: 'none', stroke: C.dark, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, sg);
      T(sg, 0, -13, stamp.label || '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.main });
      T(sg, 0, 24, stamp.value || '', { 'text-anchor': 'middle', 'font-size': 25, 'font-weight': 700, fill: C.dark, 'letter-spacing': '-0.02em' }) } }
};
})();
