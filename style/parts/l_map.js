/* map — 세계 지도(바닷길 · 흐름 · 단계 구분도). 지도 자료는 l_geo.js(Natural Earth 공개 자료)
   flows[{from,to,via:[[lon,lat]…],value,tone:'main|dark|g65|cmp|warn'}](from·to = [lon,lat] 또는 나라 이름 · 굵기 = value) · points[{at,label,value,kind:'src'|'dst',pos:'r|l|t|b'}] · chokes[{at,label,pos}]
   fill{ISO3:값} + legend{title,bins:[아래 한계…],none} (단계 구분도) · fillLabels[ISO3…](나라 이름 + 값) · box{title,rows:[{label,value}],pos} 왼쪽 아래 순위 칸 · unit · dec · flowKey · dstKey
   움직임 : 지도 → 출발 점 → 흐름 선 차례로 그림 → 도착 점 · 이름 → 길목 → 순위 칸 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var HALO = { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linejoin': 'round' };
function TL(g, x, y, t, a) { return T(g, x, y, t, Object.assign({}, a, HALO)) }
var TONE = { main: C.main, dark: C.dark, g65: C.g65, cmp: C.cmp, warn: C.warn, g40: C.g40 };
var STEPS = [C.g08, C.g18, C.g40, C.g65, C.dark];
function curve(P, k) { /* Catmull-Rom → 베지어. 끝 접선도 돌려줌. 점 2개면 살짝 휜 호 */
  if (P.length === 2) { var a = P[0], b = P[1], dx = b[0] - a[0], dy = b[1] - a[1], q = [(a[0] + b[0]) / 2 - dy * .14, (a[1] + b[1]) / 2 + dx * .14];
    return { d: 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1), ang: Math.atan2(b[1] - q[1], b[0] - q[0]) } }
  var d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1), ang = 0;
  for (var i = 1; i < P.length; i++) { var p0 = P[i - 2] || P[0], p1 = P[i - 1], p2 = P[i], p3 = P[i + 1] || p2,
      c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); ang = Math.atan2(p2[1] - c2[1], p2[0] - c2[0]) }
  return { d: d, ang: ang } }
function hit(a, b) { return a[0] < b[0] + b[2] + 3 && b[0] < a[0] + a[2] + 3 && a[1] < b[1] + b[3] + 2 && b[1] < a[1] + a[3] + 2 }
ECOM.parts.map = function (bd, s, ctx) {
  var fr = s.frame || {}, W = fr.w || 1168, H = fr.h || 512, G = ECOM.geo, root = ctx.root, svg = ctx.svg(H), OY = 24, dec = s.dec != null ? s.dec : 0, unit = s.unit || '';
  var flows = s.flows || [], pts = s.points || [], chk = s.chokes || [], fill = s.fill || null, leg = s.legend || null, box = s.box || null;
  /* 확대(view.bbox=[lon0,lat0,lon1,lat1]) : 투영 좌표를 상자에 맞춰 늘림 */
  var VK = 1, VX = 0, VY = 0;
  if (s.view && s.view.bbox) { var b = s.view.bbox, a1 = G.project(b[0], b[3]), a2 = G.project(b[2], b[1]), vw = a2[0] - a1[0], vh = a2[1] - a1[1], th = H - OY - 18;
    VK = Math.min(W / vw, th / vh); VX = (W - vw * VK) / 2 - a1[0] * VK; VY = (th - vh * VK) / 2 - a1[1] * VK}
  else if (W < 1168) { var th0 = H - OY - 18; VK = Math.min(W / 1168, th0 / 470); VX = (W - 1168 * VK) / 2; VY = (th0 - 470 * VK) / 2 }
  var TRF = VK === 1 && !VX && !VY ? 'translate(0,' + OY + ')' : 'translate(' + VX.toFixed(2) + ',' + (VY + OY).toFixed(2) + ') scale(' + VK.toFixed(4) + ')', VE = VK === 1 ? {} : { 'vector-effect': 'non-scaling-stroke' };
  if (VK !== 1 || VX) svg.style.overflow = 'hidden';
  var P = function (v) { var q = G.find(v); return q ? [q[0] * VK + VX, q[1] * VK + VY + OY] : null };
  var FV = function (v) { return typeof v === 'number' ? h.nf(v, dec) + unit : String(v == null ? '' : v) };
  var occ = [], LX = 20, bottom = H - 12, blocks = [];
  /* 1) 지도 바탕 */
  E('path', Object.assign({ d: G.land, transform: TRF, fill: C.light, stroke: '#fff', 'stroke-width': .6, 'data-at': 0, 'data-fx': 'fade', 'data-ms': 500 }, VE), svg);
  /* 구분 칠(zones[{iso:[ISO3…],tone,label,at,pos}]) : 나라 묶음을 색으로 구분(값 없음) */
  var ZT = { main: C.main, dark: C.dark, g65: C.g65, g40: C.g40, g18: C.g18, g08: C.g08 };
  (s.zones || []).forEach(function (z, zi) { (z.iso || []).forEach(function (k) { var d = G.countries[k]; if (!d) return;
      E('path', Object.assign({ d: d, transform: TRF, fill: ZT[z.tone || 'g18'] || C.g18, stroke: '#fff', 'stroke-width': .8, 'data-at': 100 + zi * 120, 'data-fx': 'fade', 'data-ms': 360 }, VE), svg) }) });
  /* 단계 구분도 */
  var bins = null, cls = function () { return 0 };
  if (fill) { var vals = Object.keys(fill).map(function (k) { return fill[k] });
    bins = leg && leg.bins && leg.bins.length ? leg.bins.slice() : (function () { var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), st = (hi - lo) / 5, o = []; for (var i = 0; i < 5; i++) o.push(+(lo + st * i).toFixed(1)); return o })();
    bins = bins.slice(0, 5); cls = function (v) { var c = 0; bins.forEach(function (b, i) { if (v >= b) c = i }); return c };
    Object.keys(fill).sort(function (a, b) { return fill[b] - fill[a] }).forEach(function (k, i) { var d = G.countries[k]; if (!d) return;
      E('path', { d: d, transform: TRF, fill: STEPS[cls(fill[k]) + (5 - bins.length)] || STEPS[4], stroke: '#fff', 'stroke-width': .7, 'data-at': 300 + i * 40, 'data-fx': 'fade', 'data-ms': 360 }, svg) }) }
  /* 2) 왼쪽 아래 칸(범례 · 순위 · 열쇠) 자리 먼저 */
  var bx = LX, boxW = 250, boxH = 0, rows = box && box.rows || [];
  if (box) { boxH = 46 + rows.length * 24 + 6; if (leg && fill) bx = LX + 176; if (box.pos === 'right') bx = W - LX - boxW; occ.push([bx, bottom - boxH, boxW, boxH]) }
  var lh = 0; if (fill && leg) { lh = 40 + (bins.length + 1) * 22; occ.push([LX, bottom - lh, 168, lh]) }
  var keys = []; if (flows.length && !s.noFlowKey) keys.push('f'); if (pts.some(function (p) { return p.kind === 'dst' }) && !s.noDstKey) keys.push('d'); if (s.bubble && s.bubbleKey) keys.push('b'); if (s.numKey) keys.push('n');
  var kTop = bottom - (box ? boxH + 14 + (box.pos === 'right' ? 0 : 0) : 0) - keys.length * 26 - (box ? 0 : 4);
  if (keys.length && !(fill && leg)) occ.push([LX, kTop, 140, keys.length * 26]);
  /* 3) 흐름 선 */
  var vmax = Math.max.apply(null, flows.map(function (f) { return +f.value || 0 }).concat([1]));
  var T0 = 300, STEP = 260;
  flows.forEach(function (f, i) { var q = [P(f.from)].concat((f.via || []).map(function (v) { return P(v) })).concat([P(f.to)]); if (q.some(function (z) { return !z })) return;
    var w = 3 + 8 * (+f.value || vmax * .4) / vmax, col = TONE[f.tone || 'main'] || C.main, cv = curve(q), t = T0 + i * STEP;
    E('path', { d: cv.d, fill: 'none', stroke: col, 'stroke-width': w.toFixed(1), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .82, 'data-at': t, 'data-fx': 'draw', 'data-ms': 700 }, svg);
    var e = q[q.length - 1], sz = 11 + w * .5, a1 = cv.ang + 2.6, a2 = cv.ang - 2.6, ga = h.at(svg, t + 620, { 'data-fx': 'fade', 'data-ms': 160 });
    E('path', { d: 'M' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + ' L' + (e[0] + sz * Math.cos(a1)).toFixed(1) + ' ' + (e[1] + sz * Math.sin(a1)).toFixed(1) + ' L' + (e[0] + sz * Math.cos(a2)).toFixed(1) + ' ' + (e[1] + sz * Math.sin(a2)).toFixed(1) + ' Z', fill: col }, ga) });
  var tPt = T0 + Math.max(flows.length, 1) * STEP + 300;
  /* 4) 점 · 이름(겹치지 않는 자리를 고름) */
  function place(x, y, w, hh, order, rad) { var d0 = (rad || 11) + 5, c = { r: [x + d0, y - hh / 2, 'start'], l: [x - d0 - w, y - hh / 2, 'end'], t: [x - w / 2, y - d0 - hh, 'middle'], b: [x - w / 2, y + d0, 'middle'] }, best = null;
    for (var i = 0; i < order.length; i++) { var o = c[order[i]], r = [o[0], o[1], w, hh]; if (r[0] < 4 || r[0] + w > W - 4 || r[1] < 4 || r[1] + hh > H - 4) continue; if (!occ.some(function (z) { return hit(r, z) })) { best = [order[i], r]; break } }
    if (!best) best = [order[0], [c[order[0]][0], c[order[0]][1], w, hh]]; occ.push(best[1]); return { pos: best[0], r: best[1] } }
  function anchorOf(pos, r) { return pos === 'r' ? [r[0], 'start'] : pos === 'l' ? [r[0] + r[2], 'end'] : [r[0] + r[2] / 2, 'middle'] }
  var jobs = [], bmax = Math.max.apply(null, pts.map(function (p) { return +p.value || 0 }).concat([1]));
  pts.forEach(function (p, i) { var q = P(p.at); if (!q) return; var src = p.kind !== 'dst', t = src ? 100 + i * 70 : tPt + i * 60;
    var g = h.at(svg, t, { 'data-fx': 'pop', 'data-ms': 340 });
    var rad = 11;
    if (src && s.bubble && +p.value > 0) { rad = 8 + 24 * Math.sqrt(+p.value / bmax); E('circle', { cx: q[0], cy: q[1], r: rad.toFixed(1), fill: C.main, opacity: .82, stroke: '#fff', 'stroke-width': 1.6 }, g) }
    else if (src && p.num != null) { rad = 14; E('circle', { cx: q[0], cy: q[1], r: rad, fill: C.dark, stroke: '#fff', 'stroke-width': 2 }, g); T(g, q[0], q[1] + 5.5, String(p.num), { 'font-size': 16, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }) }
    else if (src) { E('circle', { cx: q[0], cy: q[1], r: 11, fill: C.dark }, g); E('circle', { cx: q[0], cy: q[1], r: 4, fill: '#fff' }, g) }
    else E('rect', { x: q[0] - 7, y: q[1] - 7, width: 14, height: 14, rx: 3, fill: '#fff', stroke: C.dark, 'stroke-width': 3 }, g);
    occ.push([q[0] - rad - 2, q[1] - rad - 2, 2 * rad + 4, 2 * rad + 4]);
    var v = p.value != null && p.value !== '' ? FV(p.value) : '', fs = src ? 16 : 15, w = Math.max(h.textW(p.label || '', fs, 1), v ? h.textW(v, 13, 1) : 0), hh = v ? 38 : 20;
    jobs.push({ q: q, p: p, src: src, v: v, fs: fs, w: w, hh: hh, t: t + 120, rad: rad, none: !p.label && !v }) });
  jobs.forEach(function (j) { var o = j.p.pos ? [j.p.pos] : (j.src ? ['r', 'l', 't', 'b'] : ['r', 'l', 't', 'b']), pl = place(j.q[0], j.q[1], j.none ? 0 : j.w, j.none ? 0 : j.hh, o, j.rad), an = anchorOf(pl.pos, pl.r), g = h.at(svg, j.t, { 'data-fx': 'fade', 'data-ms': 300 });
    var by = pl.r[1] + (j.v ? 16 : 15); TL(g, an[0], by, j.p.label || '', { 'font-size': j.fs, 'font-weight': 700, fill: j.src ? C.ink : C.dark, 'text-anchor': an[1] });
    if (j.v) TL(g, an[0], by + 19, j.v, { 'font-size': 13, 'font-weight': 700, fill: C.main, 'text-anchor': an[1] }) });
  /* 나라 이름 + 값(구분도) */
  var rev = {}; Object.keys(G.names).forEach(function (k) { if (!rev[G.names[k]]) rev[G.names[k]] = k });
  (s.fillLabels || []).forEach(function (iso, i) { var q = P(iso); if (!q || fill == null || fill[iso] == null) return; var nm = rev[iso] || iso, v = FV(fill[iso]), w = Math.max(h.textW(nm, 14, 1), h.textW(v, 12.5, 1));
    var pl = place(q[0], q[1], w, 36, ['t', 'b', 'r', 'l']), an = anchorOf(pl.pos, pl.r), g = h.at(svg, 1500 + i * 80, { 'data-fx': 'fade', 'data-ms': 300 });
    E('circle', { cx: q[0], cy: q[1], r: 3.5, fill: C.ink }, g); var by = pl.r[1] + 14;
    TL(g, an[0], by, nm, { 'font-size': 14, 'font-weight': 700, fill: C.ink, 'text-anchor': an[1] }); TL(g, an[0], by + 17, v, { 'font-size': 12.5, 'font-weight': 700, fill: C.dark, 'text-anchor': an[1] }) });
  /* 구분 칠 이름 · 바다 이름 */
  (s.zones || []).forEach(function (z, zi) { if (!z.label) return; var q = P(z.at || G.anchor[(z.iso || [])[0]]); if (!q) return; var w = h.textW(z.label, 14, 1), pl = place(q[0], q[1], w, 18, z.pos ? [z.pos] : ['t', 'b', 'r', 'l'], 0), an = anchorOf(pl.pos, pl.r), g = h.at(svg, 900 + zi * 100, { 'data-fx': 'fade', 'data-ms': 300 });
    TL(g, an[0], pl.r[1] + 14, z.label, { 'font-size': 14, 'font-weight': 700, fill: C.ink, 'text-anchor': an[1] }) });
  (s.seas || []).forEach(function (z, zi) { var q = P(z.at); if (!q) return; var g = h.at(svg, 1000 + zi * 100, { 'data-fx': 'fade', 'data-ms': 300 }); occ.push([q[0] - h.textW(z.label, 13, 1) / 2, q[1] - 12, h.textW(z.label, 13, 1), 16]);
    T(g, q[0], q[1], z.label, { 'font-size': 13, 'font-weight': 600, 'font-style': 'italic', fill: C.g65, 'text-anchor': 'middle', 'letter-spacing': 2 }) });
  /* 5) 길목 */
  chk.forEach(function (c, i) { var q = P(c.at); if (!q) return; var w = h.textW(c.label || '', 12, 1), pl = place(q[0], q[1], w, 16, c.pos ? [c.pos] : ['r', 'b', 'l', 't']), an = anchorOf(pl.pos, pl.r), g = h.at(svg, tPt + 400 + i * 60, { 'data-fx': 'fade', 'data-ms': 300 });
    E('circle', { cx: q[0], cy: q[1], r: 4.5, fill: '#fff', stroke: C.cmp, 'stroke-width': 1.6 }, g); TL(g, an[0], pl.r[1] + 12.5, c.label || '', { 'font-size': 12, 'font-weight': 600, fill: C.mute, 'text-anchor': an[1] }) });
  /* 6) 범례(구분도) */
  if (fill && leg) { var ly = bottom - lh, g1 = h.at(svg, 700, { 'data-fx': 'fade', 'data-ms': 400 });
    E('rect', { x: LX, y: ly, width: 168, height: lh, rx: 10, fill: '#fff', stroke: C.line }, g1); T(g1, LX + 14, ly + 24, leg.title || '', { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    var items = bins.map(function (b, i) { return { c: STEPS[i + (5 - bins.length)], t: i < bins.length - 1 ? h.nf(b, dec) + '~' + h.nf(bins[i + 1], dec) + unit : h.nf(b, dec) + unit + ' 이상' } }); items.push({ c: C.light, t: leg.none || '자료 없음' });
    items.forEach(function (it, i) { var y = ly + 40 + i * 22; E('rect', { x: LX + 14, y: y - 4, width: 22, height: 14, rx: 2, fill: it.c, stroke: i === items.length - 1 ? C.axis : 'none', 'stroke-width': .6 }, g1); T(g1, LX + 46, y + 8, it.t, { 'font-size': 13, 'font-weight': 600, fill: C.cmp }) }) }
  /* 열쇠(굵기 · 도착) */
  if (keys.length && !(fill && leg)) { var gk = h.at(svg, 700, { 'data-fx': 'fade', 'data-ms': 400 }); keys.forEach(function (k, i) { var y = kTop + 13 + i * 26;
      if (k === 'f') { E('line', { x1: LX + 4, x2: LX + 44, y1: y, y2: y, stroke: C.main, 'stroke-width': 10 }, gk); T(gk, LX + 56, y + 5, '굵기 = ' + (s.flowKey || '물량'), { 'font-size': 13, 'font-weight': 600, fill: C.mute }) }
      else if (k === 'n') { E('circle', { cx: LX + 24, cy: y, r: 11, fill: C.dark }, gk); T(gk, LX + 24, y + 4.5, '1', { 'font-size': 13, 'font-weight': 700, fill: '#fff', 'text-anchor': 'middle' }); T(gk, LX + 56, y + 5, s.numKey, { 'font-size': 13, 'font-weight': 600, fill: C.mute }) }
      else if (k === 'b') { E('circle', { cx: LX + 24, cy: y, r: 9, fill: C.main, opacity: .82 }, gk); T(gk, LX + 56, y + 5, s.bubbleKey, { 'font-size': 13, 'font-weight': 600, fill: C.mute }) }
      else { E('rect', { x: LX + 17, y: y - 7, width: 14, height: 14, rx: 3, fill: '#fff', stroke: C.dark, 'stroke-width': 3 }, gk); T(gk, LX + 56, y + 5, s.dstKey || '도착 지역', { 'font-size': 13, 'font-weight': 600, fill: C.mute }) } }) }
  /* 7) 순위 칸 */
  if (box && rows.length) { var by0 = bottom - boxH, mx = Math.max.apply(null, rows.map(function (r) { return +r.value || 0 }).concat([1])), bwMax = 120, gb = h.at(svg, 500, { 'data-fx': 'fade', 'data-ms': 360 });
    E('rect', { x: bx, y: by0, width: boxW, height: boxH, rx: 10, fill: '#fff', stroke: C.line }, gb); T(gb, bx + 16, by0 + 27, box.title || '', { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    var lw = Math.max.apply(null, rows.map(function (r) { return h.textW(r.label || '', 13, 1) }).concat([30])) + 10;
    rows.forEach(function (r, i) { var y = by0 + 52 + i * 24, bw = Math.max(4, bwMax * (+r.value || 0) / mx);
      T(gb, bx + 16, y + 4, r.label || '', { 'font-size': 13, 'font-weight': 600, fill: C.cmp });
      E('rect', { x: bx + 16 + lw, y: y - 8, width: bw, height: 12, rx: 2, fill: i === 0 ? C.main : C.g65, 'data-at': 700 + i * 120, 'data-fx': 'growx', 'data-ms': 420 }, svg);
      T(svg, bx + 22 + lw + bw, y + 3, FV(r.value), { 'font-size': 12.5, 'font-weight': 700, fill: C.ink, 'data-at': 900 + i * 120, 'data-fx': 'fade', 'data-ms': 260 }) }) }
  root.setAttribute('data-gap', 300);
};
})();
