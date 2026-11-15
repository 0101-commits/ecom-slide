/* 부품 공통 도움 — 축 · 눈금 · x 라벨 · 국면 띠 · 결정 줄 · 글 피하기 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function short(l) { var m = /^(\d{4})\.(\d{2})$/.exec(String(l)); return m ? m[1].slice(2) + '.' + m[2] : String(l) }
/* y 눈금: o = {min,max,step,ticks,dec,unit,zero} */
function yScale(vals, o, top, bot) { o = o || {}; var e = h.ext(vals), lo = o.min != null ? o.min : e[0], hi = o.max != null ? o.max : e[1];
  if (o.zero !== false && lo > 0 && o.min == null && (hi - lo) / hi > .35) lo = 0;
  var nt = h.niceTicks(lo, hi, o.n || 5); if (o.min == null) lo = nt.lo; if (o.max == null) hi = nt.hi; var st = o.step || nt.step, ticks = o.ticks;
  // 정해 준 축 끝보다 값이 크면(작으면) 눈금 한 칸씩 넓혀 값이 축 밖으로 나가지 않게 함
  if (!ticks && st > 0) { var guard = 0; while (o.max != null && e[1] > hi + st * 1e-6 && guard++ < 50) hi += st; guard = 0; while (o.min != null && e[0] < lo - st * 1e-6 && guard++ < 50) lo -= st }
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
/* 선분 ∩ 칸 */
function segHit(s, b) { var x1 = s[0], y1 = s[1], x2 = s[2], y2 = s[3]; if (Math.max(x1, x2) < b.l || Math.min(x1, x2) > b.r || Math.max(y1, y2) < b.t || Math.min(y1, y2) > b.b) return false;
  if (x1 >= b.l && x1 <= b.r && y1 >= b.t && y1 <= b.b) return true; if (x2 >= b.l && x2 <= b.r && y2 >= b.t && y2 <= b.b) return true;
  function cr(ax, ay, bx, by, cx, cy, dx, dy) { var d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx); if (!d) return false; var u = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d, v = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d; return u >= 0 && u <= 1 && v >= 0 && v <= 1 }
  return cr(x1, y1, x2, y2, b.l, b.t, b.r, b.t) || cr(x1, y1, x2, y2, b.l, b.b, b.r, b.b) || cr(x1, y1, x2, y2, b.l, b.t, b.l, b.b) || cr(x1, y1, x2, y2, b.r, b.t, b.r, b.b) }
/* 계열 → 선분 목록(step 이면 계단 모양) */
function segsOf(data, X, Y, step) { var S = [], prev = null; data.forEach(function (v, i) { if (v == null) { prev = null; return }
    if (step === false) { if (prev) S.push([X(prev[0]), Y(prev[1]), X(i), Y(v)]) } else { if (prev) S.push([X(i - .5), Y(prev[1]), X(i - .5), Y(v)]); S.push([X(i - .5), Y(v), X(i + .5), Y(v)]) }
    prev = [i, v] }); return S }
/* 글 피하기 : items [{el,x,y,w,h,anchor}] → 앞 글 · 막을 선분(segs) · 칸(boxes)과 겹치면 dy 만큼 밀기(위 · 아래 번갈아 최대 8번) */
function avoid(items, dy, segs, boxes) { dy = dy || 15; segs = segs || []; boxes = boxes || []; var placed = [];
  items.forEach(function (it) { var l = it.anchor === 'end' ? it.x - it.w : it.anchor === 'middle' ? it.x - it.w / 2 : it.x, y0 = it.y, tries = 0, box;
    function at(y) { return { l: l - 2, r: l + it.w + 2, t: y - it.h - 2, b: y + 3 + (it.below || 0) } }
    function hit(b) { return placed.some(function (p) { return b.l < p.r && b.r > p.l && b.t < p.b && b.b > p.t }) || segs.some(function (s) { return segHit(s, b) }) || boxes.some(function (p) { return b.l < p.r && b.r > p.l && b.t < p.b && b.b > p.t }) }
    var cand = [0], dir = it.dir || -1; for (var k = 1; k <= 4; k++) { cand.push(dir * k * dy); cand.push(-dir * k * dy) }
    for (var c = 0; c < cand.length; c++) { box = at(y0 + cand[c]); if (!hit(box)) { tries = c; break } if (c === cand.length - 1) { tries = 0; box = at(y0) } }
    if (tries) { it.y = y0 + cand[tries]; it.el.setAttribute('y', it.y); if (it.sub) it.sub.setAttribute('y', it.y + (it.subDy || 17)) }
    placed.push(box) }) }
/* 빈자리 찾기 : 칸 r(l,t,w,h) 이 선분 · 칸과 안 겹치는 곳을 처음 자리에서 가까운 차례로(area 안), 못 찾으면 null */
function freeSpot(r, segs, boxes, area, pad) { pad = pad == null ? 8 : pad; var best = null, bd2 = Infinity;
  function ok(l, t) { var b = { l: l - pad, t: t - pad, r: l + r.w + pad, b: t + r.h + pad }; return !segs.some(function (s) { return segHit(s, b) }) && !boxes.some(function (p) { return b.l < p.r && b.r > p.l && b.t < p.b && b.b > p.t }) }
  if (ok(r.l, r.t)) return { l: r.l, t: r.t };
  for (var t = area.t; t + r.h <= area.b; t += 8) for (var l = area.l; l + r.w <= area.r; l += 12) if (ok(l, t)) { var d = (l - r.l) * (l - r.l) + (t - r.t) * (t - r.t) * 2; if (d < bd2) { bd2 = d; best = { l: l, t: t } } }
  return best }
function label(g, x, y, s, o) { o = o || {}; var fs = o.size || 13, e = T(g, x, y, s, { 'text-anchor': o.anchor || 'start', 'font-size': fs, 'font-weight': o.bold === false ? 400 : 700, fill: h.col(o.color || 'ink') });
  if (o.pt) e.setAttribute('data-pt', Math.round(o.pt[0]) + ',' + Math.round(o.pt[1])); if (o.leader) e.setAttribute('data-leader', 1);
  return { el: e, x: x, y: y, w: h.textW(s, fs, o.bold !== false), h: fs, anchor: o.anchor || 'start', dir: o.dir } }
function legendHTML(bd, items, top) { var d = h.H('div', 'leg', null, bd, 'position:absolute;left:0;right:0;top:' + (top || 0) + 'px'); d.setAttribute('data-b', 1);
  d.innerHTML = items.map(function (it) { if (it.type === 'sep') return '<span style="color:#6B7570">|</span>'; if (it.type === 'ph') return '<span class="ph"><i>' + it.n + '</i>' + h.esc(it.text) + '</span>';
    return '<span><i class="' + (it.type === 'box' ? 'bx' : 'ln') + '" style="background:' + h.col(it.color) + (it.type === 'dash' ? ';background:repeating-linear-gradient(90deg,' + h.col(it.color) + ' 0 5px,transparent 5px 9px)' : '') + '"></i>' + h.esc(it.text) + '</span>' }).join(''); return d }
ECOM.u = { short: short, yScale: yScale, yAxis: yAxis, xTicks: xTicks, xLabels: xLabels, phaseBands: phaseBands, laneMarks: laneMarks, avoid: avoid, label: label, legendHTML: legendHTML, segHit: segHit, segsOf: segsOf, freeSpot: freeSpot };
})();
