/* 부품 공통 도움 — 축 · 눈금 · x 라벨 · 국면 띠 · 결정 줄 · 글 피하기 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function short(l) { var m = /^(\d{4})\.(\d{2})$/.exec(String(l)); return m ? m[1].slice(2) + '.' + m[2] : String(l) }
/* y 눈금: o = {min,max,step,ticks,dec,unit,zero} */
function yScale(vals, o, top, bot) { o = o || {}; var e = h.ext(vals), lo = o.min != null ? o.min : e[0], hi = o.max != null ? o.max : e[1];
  if (o.zero !== false && lo > 0 && o.min == null && (hi - lo) / hi > .35) lo = 0;
  var nt = h.niceTicks(lo, hi, o.n || 5); if (o.min == null) lo = nt.lo; if (o.max == null) hi = nt.hi; var st = o.step || nt.step, ticks = o.ticks;
  if (!ticks) { ticks = []; for (var v = Math.ceil(lo / st - 1e-9) * st; v <= hi + st / 1000; v += st) ticks.push(+v.toFixed(10)) }
  var dec = o.dec != null ? o.dec : Math.max.apply(null, ticks.map(function (t) { var s = String(t).split('.')[1]; return s ? Math.min(2, s.length) : 0 }));
  return { lo: lo, hi: hi, ticks: ticks, dec: dec, Y: h.lin(lo, hi, bot, top) } }
function yAxis(g, x0, x1, sc, o) { o = o || {}; sc.ticks.forEach(function (v) { var z = v === 0 || v === sc.lo && o.base;
    E('line', { x1: x0, x2: x1, y1: sc.Y(v), y2: sc.Y(v), stroke: z ? (v === 0 ? C.mute : C.axis) : C.grid, 'stroke-dasharray': z ? null : '3 4', 'stroke-width': z && v === 0 ? 1.2 : 1 }, g);
    T(g, x0 - 9, sc.Y(v) + 4.5, h.nf(v, sc.dec) + (o.suf || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
  if (o.unit) T(g, x0 - 9, sc.Y(sc.ticks[sc.ticks.length - 1]) - 16, o.unit, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.mute }) }
function xTicks(n, want, given) { if (given) return given; var k = Math.max(1, Math.ceil(n / (want || 10))), cand = [1, 2, 3, 4, 6, 12, 24]; for (var i = 0; i < cand.length; i++) if (cand[i] >= k) { k = cand[i]; break } var out = []; for (var j = 0; j < n; j += k) out.push(j); return out }
function xLabels(g, labels, X, y, idx, o) { o = o || {}; var last = labels.length - 1, shown = {};
  idx.forEach(function (i) { if (o.boldLast && last - i < (idx[1] - idx[0] || 1) * .6 && i !== last) return; shown[i] = 1; T(g, X(i), y, short(labels[i]), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  if (o.boldLast && !shown[last]) T(g, X(last), y, short(labels[last]), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.ink }) }
/* 국면 띠 : phases [{from,to,name}] → 띠 + 번호 동그라미 */
function phaseBands(g, ph, X, half, y0, y1, cy, now) { ph.forEach(function (p, k) { var xa = X(p.from) - half, xb = X(p.to) + half, cur = now != null ? k === now : !!p.now;
    E('rect', { x: xa, y: y0, width: xb - xa, height: y1 - y0, fill: cur ? C.g18 : (k % 2 ? '#F3F7F5' : C.g08) }, g);
    if (cy != null) { E('circle', { cx: (xa + xb) / 2, cy: cy, r: 10.5, fill: C.dark }, g); T(g, (xa + xb) / 2, cy + 4.3, String(k + 1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }) } }) }
/* 결정 줄 : lanes [{name, sub, color, marks:[{at,kind:'up|down|hold|next',date,res,vote}]}] */
function laneMarks(svg, lanes, X, y0, x0, x1, lvl) { var rowH = 76; lanes.forEach(function (ln, r) { var cy = y0 + 32 + r * rowH, c = h.col(ln.color || (r ? 'cmp' : 'main')), g = h.lv(svg, 1);
    T(g, 0, cy - 3, ln.name, { 'font-size': 14, 'font-weight': 700, fill: C.ink }); if (ln.sub) T(g, 0, cy + 13, ln.sub, { 'font-size': 12, fill: C.mute });
    E('line', { x1: x0, x2: x1, y1: cy, y2: cy, stroke: C.grid, 'stroke-width': 2 }, g);
    (ln.marks || []).forEach(function (m) { var x = X(m.at), q = E('g', { 'data-b': lvl || 5, 'data-fx': 'pop' }, svg), nx = m.kind === 'next';
      if (m.date) T(q, x, cy - 16, m.date, { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute });
      if (m.kind === 'up' || m.kind === 'down') h.tri(q, x, cy, m.kind === 'up', 8.5, c);
      else E('circle', { cx: x, cy: cy, r: 7, fill: '#fff', stroke: nx ? C.axis : c, 'stroke-width': 2, 'stroke-dasharray': nx ? '2 2' : null }, q);
      if (m.res) T(q, x, cy + 23, m.res, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: nx ? C.mute : c });
      if (m.vote) T(q, x, cy + 38, m.vote, { 'text-anchor': 'middle', 'font-size': 11.5, fill: C.mute }) }) }); return lanes.length * rowH }
/* 글 피하기 : items [{el,x,y,w,h,anchor}] → 겹치면 dy 만큼 밀기 */
function avoid(items, dy) { dy = dy || 15; var placed = [];
  items.forEach(function (it) { var l = it.anchor === 'end' ? it.x - it.w : it.anchor === 'middle' ? it.x - it.w / 2 : it.x, box = { l: l, r: l + it.w, t: it.y - it.h, b: it.y }, tries = 0;
    function hit() { return placed.some(function (p) { return box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t }) }
    while (hit() && tries < 6) { var d = (it.dir || -1) * dy; box.t += d; box.b += d; it.y += d; tries++ }
    if (tries) it.el.setAttribute('y', it.y); placed.push(box) }) }
function label(g, x, y, s, o) { o = o || {}; var fs = o.size || 13, e = T(g, x, y, s, { 'text-anchor': o.anchor || 'start', 'font-size': fs, 'font-weight': o.bold === false ? 400 : 700, fill: h.col(o.color || 'ink') });
  return { el: e, x: x, y: y, w: h.textW(s, fs, o.bold !== false), h: fs, anchor: o.anchor || 'start', dir: o.dir } }
function legendHTML(bd, items, top) { var d = h.H('div', 'leg', null, bd, 'position:absolute;left:0;right:0;top:' + (top || 0) + 'px'); d.setAttribute('data-b', 1);
  d.innerHTML = items.map(function (it) { if (it.type === 'sep') return '<span style="color:#6B7570">|</span>'; if (it.type === 'ph') return '<span class="ph"><i>' + it.n + '</i>' + h.esc(it.text) + '</span>';
    return '<span><i class="' + (it.type === 'box' ? 'bx' : 'ln') + '" style="background:' + h.col(it.color) + (it.type === 'dash' ? ';background:repeating-linear-gradient(90deg,' + h.col(it.color) + ' 0 5px,transparent 5px 9px)' : '') + '"></i>' + h.esc(it.text) + '</span>' }).join(''); return d }
ECOM.u = { short: short, yScale: yScale, yAxis: yAxis, xTicks: xTicks, xLabels: xLabels, phaseBands: phaseBands, laneMarks: laneMarks, avoid: avoid, label: label, legendHTML: legendHTML };
})();
