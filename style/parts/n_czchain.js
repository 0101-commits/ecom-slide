/* czchain — 인과 사슬 : 마디가 화살로 이어짐. shape 로 모양이 갈림
   shape 'circle'(큰 동그라미 + 고리 숫자 + 아래 전체 괄호) · 'card'(칸마다 작은 선) · 'rows'(두 줄 비교) · 'broke'(끊긴 고리) · 'gate'(켜짐 · 꺼짐 점검)
   nodes[{name,value,vsub,sub,tag,mini{data,first,last,dec,unit},on,rule}] · lks[{text,sub,broken}](마디 수 − 1, 장 공통 칸 links 와 겹치지 않게 lks) · total{text}
   rows[{label,sub,nodes,links,tone:'cmp|main'}] · diffs[글](두 줄 사이 같은 자리 비교) · callout{title,text}(끊긴 고리 아래 상자)
   result{text,n,of}(gate 아래 띠) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
function nodeAt(k) { return 150 + k * 430 }
ECOM.parts.czchain = function (bd, s, ctx) {
  var svg = ctx.svg(512), shape = s.shape || 'circle', rows = s.rows || [{ nodes: s.nodes, links: s.lks }], n = (rows[0].nodes || []).length; if (n < 2) return;
  var wm = { 'text-anchor': 'middle' };
  /* ---------- 동그라미 ---------- */
  if (shape === 'circle') { var nodes = rows[0].nodes, links = rows[0].links || [], r = n <= 4 ? 100 : 84, D = 2 * r, gap = (1168 - n * D) / (n - 1), cy = 222, cx = function (i) { return i * (D + gap) + r };
    nodes.forEach(function (o, i) { var x = cx(i), dk = i === 0, last = i === n - 1, g = h.at(svg, nodeAt(i), { 'data-fx': 'pop', 'data-ms': 420 });
      E('circle', { cx: x, cy: cy, r: r, fill: dk ? C.dark : (last ? C.g18 : '#fff'), stroke: dk ? 'none' : (last ? C.dark : C.main), 'stroke-width': 3.5 }, g);
      T(g, x, cy + 4, o.value || '', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: dk ? '#fff' : C.dark });
      if (o.vsub) T(g, x, cy + 32, o.vsub, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: dk ? '#CDE9DD' : C.mute });
      if (o.tag) Z.chip(g, x, cy - r - 22, o.tag, 13, { fill: C.g08, stroke: C.g40 });
      var nl = Z.tx(g, x, cy + r + 32, o.name || '', 18, D + gap * .55); if (o.sub) Z.tx(g, x, cy + r + 32 + nl * 24 + 2, o.sub, 13, D + gap * .5, { bold: false, fill: C.mute }) });
    links.forEach(function (lk, i) { var x1 = cx(i) + r + 6, x2 = cx(i + 1) - r - 6, t = nodeAt(i) + 260, mx = (x1 + x2) / 2;
      Z.arr(svg, x1, cy, x2, cy, C.g65, 7, t, { head: 17, ms: 340 }); var g = h.at(svg, t + 160, { 'data-fx': 'pop', 'data-ms': 300 });
      Z.chip(g, mx, cy - 30, lk.text || '', 15, { fill: '#fff', stroke: C.g65, sw: 2 }); if (lk.sub) Z.tx(g, mx, cy + 34, lk.sub, 12.5, x2 - x1 + 20, { bold: false, fill: C.mute, lh: 16 }) });
    if (s.total) { var y = 456, g = h.at(svg, nodeAt(n) + 100, { 'data-fx': 'fade', 'data-ms': 420 }), xa = cx(0), xb = cx(n - 1);
      E('path', { d: 'M' + xa + ' ' + (y - 14) + ' V' + y + ' H' + xb + ' V' + (y - 14), fill: 'none', stroke: C.g65, 'stroke-width': 2.2 }, g);
      var tw = Math.max(260, h.textW(s.total.text || '', 16, 1) + 40); E('rect', { x: (xa + xb) / 2 - tw / 2, y: y - 19, width: tw, height: 38, rx: 19, fill: C.dark }, g);
      T(g, (xa + xb) / 2, y + 6, s.total.text || '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#fff' }) } }
  /* ---------- 칸(작은 선) ---------- */
  else if (shape === 'card') { var nodes = rows[0].nodes, links = rows[0].links || [], gp = 88, cw = (1168 - (n - 1) * gp) / n, y0 = 14, ch = 484, cxx = function (i) { return i * (cw + gp) };
    nodes.forEach(function (o, i) { var x = cxx(i), g = h.at(svg, nodeAt(i), { 'data-fx': 'rise', 'data-ms': 420 });
      Z.box(g, x, y0, cw, ch, { fill: '#fff', stroke: C.g40, sw: 2, rx: 16 }); E('path', { d: 'M' + x + ' ' + (y0 + 72) + ' V' + (y0 + 16) + ' Q' + x + ' ' + y0 + ' ' + (x + 16) + ' ' + y0 + ' H' + (x + cw - 16) + ' Q' + (x + cw) + ' ' + y0 + ' ' + (x + cw) + ' ' + (y0 + 16) + ' V' + (y0 + 72) + ' Z', fill: i === 0 ? C.dark : C.g08 }, g);
      var nl = Z.nl(o.name || '', 18, cw - 28); Z.tx(g, x + cw / 2, y0 + (nl > 1 ? 30 : 43), o.name || '', 18, cw - 28, { fill: i === 0 ? '#fff' : C.ink, lh: 23 });
      T(g, x + cw / 2, y0 + 126, o.value || '', { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 700, fill: C.dark }); if (o.vsub) T(g, x + cw / 2, y0 + 150, o.vsub, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: C.mute });
      if (o.mini) ECOM.kx.mini(svg, Object.assign({ type: 'spark' }, o.mini), x + 16, y0 + 166, cw - 32, ch - 180, null, nodeAt(i) + 250) });
    links.forEach(function (lk, i) { var x1 = cxx(i) + cw + 6, x2 = cxx(i + 1) - 6, ym = y0 + 100, t = nodeAt(i) + 300; Z.arr(svg, x1, ym, x2, ym, C.g65, 5, t, { head: 13, ms: 260 });
      var g = h.at(svg, t + 100, { 'data-fx': 'pop', 'data-ms': 280 }); Z.chip(g, (x1 + x2) / 2, ym - 24, lk.text || '', 12.5, { fill: '#fff', stroke: C.g65 }) }) }
  /* ---------- 두 줄 비교 ---------- */
  else if (shape === 'rows') { var LW = 150, cw = 200, gp = (1168 - LW - n * cw) / (n - 1), cxr = function (i) { return LW + i * (cw + gp) }, rh = 196, ys = [20, 292];
    rows.forEach(function (row, rI) { var y0 = ys[rI], cmpRow = (row.tone || (rI ? 'main' : 'cmp')) === 'cmp', col = cmpRow ? C.cmp : C.main, tt = 150 + rI * 1400, g0 = h.at(svg, tt, { 'data-fx': 'left', 'data-ms': 380 });
      Z.box(g0, 0, y0, LW - 22, rh, { fill: cmpRow ? C.paper : C.g08, stroke: col, sw: 2.2, rx: 14 }); var nl = Z.tx(g0, (LW - 22) / 2, y0 + rh / 2 - 12, row.label || '', 19, LW - 40, { fill: col }); if (row.sub) Z.tx(g0, (LW - 22) / 2, y0 + rh / 2 - 12 + nl * 25 + 4, row.sub, 13, LW - 38, { bold: false, fill: C.mute, lh: 17 });
      (row.nodes || []).forEach(function (o, i) { var x = cxr(i), g = h.at(svg, tt + 200 + i * 260, { 'data-fx': 'pop', 'data-ms': 360 });
        Z.box(g, x, y0, cw, rh, { fill: '#fff', stroke: col, sw: 2.6, rx: 14 }); Z.tx(g, x + cw / 2, y0 + 38, o.name || '', 16, cw - 20, { lh: 20 });
        T(g, x + cw / 2, y0 + 106, o.value || '', { 'text-anchor': 'middle', 'font-size': 33, 'font-weight': 700, fill: col }); if (o.vsub) Z.tx(g, x + cw / 2, y0 + 134, o.vsub, 13, cw - 20, { bold: false, fill: C.mute, lh: 17 }); if (o.sub) Z.tx(g, x + cw / 2, y0 + 170, o.sub, 12.5, cw - 20, { bold: false, fill: C.mute, lh: 16 }) });
      (row.links || []).forEach(function (lk, i) { var x1 = cxr(i) + cw + 5, x2 = cxr(i + 1) - 5, ym = y0 + rh / 2, t = tt + 330 + i * 260; Z.arr(svg, x1, ym, x2, ym, col, 4, t, { head: 12, ms: 220 });
        if (lk.text) { var g = h.at(svg, t + 100, { 'data-fx': 'pop', 'data-ms': 260 }); Z.chip(g, (x1 + x2) / 2, ym - 22, lk.text, 12.5, { fill: '#fff', stroke: col }) } }) });
    (s.diffs || []).forEach(function (d, i) { var x = cxr(i) + cw / 2, g = h.at(svg, 150 + 1400 + 1500 + i * 150, { 'data-fx': 'fade', 'data-ms': 360 });
      E('line', { x1: x, x2: x, y1: ys[0] + rh + 2, y2: ys[1] - 2, stroke: C.g40, 'stroke-width': 2, 'stroke-dasharray': '3 4' }, g); Z.chip(g, x, (ys[0] + rh + ys[1]) / 2, d, 13.5, { fill: C.g08, stroke: C.g65, sw: 1.8 }) }) }
  /* ---------- 끊긴 고리 ---------- */
  else if (shape === 'broke') { var nodes = rows[0].nodes, links = rows[0].links || [], gp = 150, cw = (1168 - (n - 1) * gp) / n, y0 = 24, rh = 236, cxb = function (i) { return i * (cw + gp) }, bi = -1;
    links.forEach(function (lk, i) { if (lk.broken) bi = i });
    nodes.forEach(function (o, i) { var x = cxb(i), after = !!o.dim, g = h.at(svg, nodeAt(i) - 50, { 'data-fx': 'pop', 'data-ms': 380 });
      Z.box(g, x, y0, cw, rh, { fill: after ? C.paper : '#fff', stroke: after ? C.axis : C.main, sw: 2.6, dash: after ? '6 5' : null, rx: 14 });
      Z.tx(g, x + cw / 2, y0 + 46, o.name || '', 18, cw - 20, { fill: after ? C.mute : C.ink, lh: 22 }); T(g, x + cw / 2, y0 + 128, o.value || '', { 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 700, fill: after ? C.mute : C.dark });
      if (o.vsub) Z.tx(g, x + cw / 2, y0 + 162, o.vsub, 14, cw - 20, { bold: false, fill: C.mute, lh: 18 }); if (o.sub) Z.tx(g, x + cw / 2, y0 + 202, o.sub, 13, cw - 20, { bold: false, fill: C.mute, lh: 16 }) });
    links.forEach(function (lk, i) { var x1 = cxb(i) + cw + 5, x2 = cxb(i + 1) - 5, ym = y0 + rh / 2, mx = (x1 + x2) / 2, t = nodeAt(i) + 150;
      if (!lk.broken) { Z.arr(svg, x1, ym, x2, ym, C.main, 5, t, { head: 14, ms: 260 }); if (lk.text) { var g = h.at(svg, t + 100, { 'data-fx': 'pop', 'data-ms': 260 }); Z.chip(g, mx, ym - 26, lk.text, 13.5, { fill: '#fff', stroke: C.main }) } }
      else { var g = h.at(svg, t + 100, { 'data-fx': 'fade', 'data-ms': 380 }); E('line', { x1: x1, x2: mx - 26, y1: ym, y2: ym, stroke: C.warn, 'stroke-width': 5, 'stroke-linecap': 'round' }, g); E('line', { x1: mx + 26, x2: x2 - 10, y1: ym, y2: ym, stroke: C.axis, 'stroke-width': 4, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }, g);
        E('circle', { cx: mx, cy: ym, r: 22, fill: C.warn }, g); E('path', { d: 'M' + (mx - 8) + ' ' + (ym - 8) + ' L' + (mx + 8) + ' ' + (ym + 8) + ' M' + (mx + 8) + ' ' + (ym - 8) + ' L' + (mx - 8) + ' ' + (ym + 8), stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        if (lk.text) Z.chip(g, mx, ym - 40, lk.text, 13.5, { fill: C.warnsoft, stroke: C.warn, color: C.warn }) } });
    if (s.callout && bi >= 0) { var mx = (cxb(bi) + cw + cxb(bi + 1)) / 2, cwid = 1168, bx = 0, by = y0 + rh + 62, g = h.at(svg, nodeAt(n) + 200, { 'data-fx': 'rise', 'data-ms': 460 });
      E('path', { d: 'M' + mx + ' ' + (y0 + rh + 14) + ' L' + (mx - 10) + ' ' + (by) + ' L' + (mx + 10) + ' ' + (by) + ' Z', fill: C.warn }, g); E('line', { x1: mx, x2: mx, y1: y0 + rh + 14, y2: by, stroke: C.warn, 'stroke-width': 2.2, 'stroke-dasharray': '4 4' }, g);
      var ln = Z.nl(s.callout.text || '', 15.5, cwid - 48, false), bh = 62 + ln * 22; Z.box(g, bx, by, cwid, bh, { fill: C.warnsoft, stroke: C.warn, sw: 2, rx: 14 });
      T(g, bx + 24, by + 34, s.callout.title || '', { 'font-size': 18, 'font-weight': 700, fill: C.warn }); Z.tx(g, bx + 24, by + 62, s.callout.text || '', 15.5, cwid - 48, { anchor: 'start', bold: false, fill: C.ink, lh: 22 }) } }
  /* ---------- 켜짐 · 꺼짐 점검 ---------- */
  else { var nodes = rows[0].nodes, gp = 90, cw = (1168 - (n - 1) * gp) / n, y0 = 14, ch = 352, cxg = function (i) { return i * (cw + gp) }, onN = 0;
    nodes.forEach(function (o, i) { var x = cxg(i), on = !!o.on, mid = x + cw / 2, g = h.at(svg, nodeAt(i) - 50, { 'data-fx': 'rise', 'data-ms': 420 }); if (on) onN++;
      Z.box(g, x, y0, cw, ch, { fill: on ? C.g08 : '#fff', stroke: on ? C.main : C.axis, sw: on ? 2.8 : 2, dash: on ? null : '7 5', rx: 18 });
      E('circle', { cx: mid, cy: y0 + 56, r: 30, fill: on ? C.main : '#fff', stroke: on ? C.dark : C.axis, 'stroke-width': 3 }, g);
      if (on) E('path', { d: 'M' + (mid - 12) + ' ' + (y0 + 56) + ' L' + (mid - 3) + ' ' + (y0 + 66) + ' L' + (mid + 14) + ' ' + (y0 + 45), fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); else E('line', { x1: mid - 11, x2: mid + 11, y1: y0 + 56, y2: y0 + 56, stroke: C.axis, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      T(g, mid, y0 + 108, on ? '켜짐 · 충족' : '꺼짐 · 미충족', { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: on ? C.dark : C.mute });
      var nl = Z.tx(g, mid, y0 + 142, o.name || '', 18, cw - 28, { lh: 22 }); var ry = y0 + 142 + nl * 22 + 8; T(g, mid, ry + 4, '기준', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: C.mute }); Z.tx(g, mid, ry + 24, o.rule || '', 14, cw - 28, { bold: false, fill: C.sub, lh: 19 });
      T(g, mid, y0 + ch - 58, o.value || '', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 700, fill: on ? C.dark : C.cmp }); if (o.vsub) T(g, mid, y0 + ch - 30, o.vsub, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: C.mute }) });
    for (var i = 0; i < n - 1; i++) { var x1 = cxg(i) + cw + 5, x2 = cxg(i + 1) - 5, ym = y0 + 56, ok = !!nodes[i].on; Z.arr(svg, x1, ym, x2, ym, ok ? C.main : C.axis, 5, nodeAt(i) + 280, { head: 13, ms: 240, dash: ok ? null : '4 7' }) }
    if (s.result) { var ry = 398, g = h.at(svg, nodeAt(n) + 80, { 'data-fx': 'rise', 'data-ms': 460 }); Z.box(g, 0, ry, 1168, 100, { fill: C.dark, rx: 16 });
      T(g, 32, ry + 42, s.result.title || '점검 결과', { 'font-size': 15, 'font-weight': 600, fill: '#CDE9DD' }); T(g, 32, ry + 78, s.result.text || '', { 'font-size': 26, 'font-weight': 700, fill: '#fff' });
      var bx = 640, bw = 480, sw = (bw - (n - 1) * 8) / n; nodes.forEach(function (o, i) { E('rect', { x: bx + i * (sw + 8), y: ry + 32, width: sw, height: 36, rx: 8, fill: o.on ? C.on : 'none', stroke: o.on ? C.on : '#7FA898', 'stroke-width': 2, 'stroke-dasharray': o.on ? null : '5 4' }, g); T(g, bx + i * (sw + 8) + sw / 2, ry + 56, o.short || String(i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: o.on ? C.dark : '#CDE9DD' }) }) } }
};
})();
