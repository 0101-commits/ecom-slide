/* dx 계열 공통 도움(ECOM.dxu) — F02 두 지표 · F19 채권 목업 부품들이 같이 씀 : pill · path · halo · runs · placer(글 자리 찾기) · xaxis · scale */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u = ECOM.dxu = {};
u.halo = { stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' };
u.pill = function (p, cx, cy, text, fill, color, size, extra) { size = size || 13; var w = h.textW(text, size, true) + 20;
  E('rect', Object.assign({ x: cx - w / 2, y: cy - size / 2 - 6, width: w, height: size + 12, rx: (size + 12) / 2, fill: fill }, extra || {}), p);
  T(p, cx, cy + size * .36, text, { 'text-anchor': 'middle', 'font-size': size, 'font-weight': 700, fill: color || '#fff' }); return w };
u.path = function (pts) { return pts.map(function (a, i) { return (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) }).join(' ') };
u.runs = function (arr, test) { var out = [], st = null; arr.forEach(function (v, i) { var ok = v != null && test(v); if (ok && st === null) st = i; if (!ok && st !== null) { out.push([st, i - 1]); st = null } }); if (st !== null) out.push([st, arr.length - 1]); return out };
/* 값 눈금 : o{min,max,step,dec} → {ticks,Y,dec} */
u.scale = function (o, y0, y1) { var t = []; for (var v = o.min; v <= o.max + o.step * .001; v += o.step) t.push(+v.toFixed(8));
  var dec = o.dec != null ? o.dec : h.decOf(o.step); return { ticks: t, Y: h.lin(o.min, o.max, y1, y0), dec: dec, lo: o.min, hi: o.max } };
u.grid = function (g, sc, x0, x1, o) { o = o || {}; sc.ticks.forEach(function (v) { var z = v === 0 && o.zero !== false;
  E('line', { x1: x0, x2: x1, y1: sc.Y(v), y2: sc.Y(v), stroke: z ? C.mute : C.grid, 'stroke-dasharray': z ? null : '3 4', 'stroke-width': z ? 1.4 : 1 }, g);
  if (!o.noLabel) T(g, x0 - 9, sc.Y(v) + 4.5, h.nf(v, sc.dec) + (o.suf || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: o.color || C.mute, 'font-weight': o.color ? 700 : 400 }) }) };
u.xaxis = function (g, labels, X, y, s) { var xt = s.ticks || ECOM.u.xTicks(labels.length, s.xwant || 8);
  if (s.xyear) xt.forEach(function (i) { T(g, X(i), y, String(labels[i]).slice(0, 4), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  else if (s.xraw) xt.forEach(function (i) { T(g, X(i), y, String(labels[i]), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }); else ECOM.u.xLabels(g, labels, X, y, xt) };
u.segBoxes = function (P, rad) { var out = []; rad = rad || 5; for (var k = 0; k < P.length - 1; k++) { var a = P[k], b = P[k + 1], L = Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)), n = Math.max(1, Math.floor(L / 9));
  for (var i = 1; i < n; i++) { var x = a[0] + (b[0] - a[0]) * i / n, y = a[1] + (b[1] - a[1]) * i / n; out.push({ l: x - rad, r: x + rad, t: y - rad, b: y + rad }) } } return out };
u.hit = function (a, list) { return list.some(function (b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t }) };
/* 글 자리 찾기 : place(g,x,y,text,o{size,color,r,prefer,anchorOnly}) — 점 둘레 8방향 중 겹치지 않는 곳 */
u.placer = function (taken, bounds) { var self = { taken: taken || [] };
  self.add = function (b) { self.taken.push(b) };
  self.place = function (g, x, y, text, o) { o = o || {}; var fs = o.size || 13, w = h.textW(text, fs, true), r = o.r || 11, hh = fs + 2;
    var dirs = o.dirs || [[0, -1], [1, 0], [-1, 0], [0, 1], [1, -1], [1, 1], [-1, -1], [-1, 1]], best = null;
    for (var k = 0; k < dirs.length * 2; k++) { var d = dirs[k % dirs.length], rr = r + (k >= dirs.length ? 14 : 0), cx = x + d[0] * rr, cy = y + d[1] * rr, anc = d[0] > .3 ? 'start' : d[0] < -.3 ? 'end' : 'middle';
      var l = anc === 'start' ? cx : anc === 'end' ? cx - w : cx - w / 2, ty = d[1] > .3 ? cy + hh * .85 : d[1] < -.3 ? cy - 3 : cy + hh * .35, b = { l: l, r: l + w, t: ty - hh + 2, b: ty + 3 };
      var ok = !u.hit(b, self.taken) && (!bounds || (b.l >= bounds.l && b.r <= bounds.r && b.t >= bounds.t && b.b <= bounds.b)); if (ok) { best = { b: b, x: anc === 'start' ? cx : anc === 'end' ? cx : cx, y: ty, anc: anc }; break }
      if (!best) best = { b: b, x: cx, y: ty, anc: anc } }
    self.add(best.b); var a = { 'text-anchor': best.anc, 'font-size': fs, 'font-weight': o.bold === false ? 500 : 700, fill: o.color || C.ink }; if (!o.nohalo) Object.assign(a, u.halo);
    return T(g, best.x, best.y, text, a) };
  return self };
})();
