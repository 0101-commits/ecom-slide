/* treemap — 트리맵 : 값 크기대로 네모를 채움(강조 항목 짙게 · 상위 몇 개 초록 · 나머지 연하게 · 「그 밖」 회색) + 오른쪽 좁은 증감 칩 목록 + 합계 상자(선택)
   items[{name,value,other(true 면 회색 「그 밖」)}] · unit(값 단위 '%') · dec · hero(항목 이름 · 번호, 기본 가장 큰 것) · top(초록 개수, 기본 5)
   side{title:'1년 전보다',rows[{label,value(숫자),unit('%p')}],dec,total{label,value,unit,sub,dec}} — 없으면 트리맵이 칸 전체
   groups[{name,value(대분류 합계 글, 없으면 이름만),items[{name,value}]}] — 주면 2단(대분류 안 소분류, items 대신) · 증감 목록 없이 씀 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function squarify(items, x, y, w, ht) {
  var out = [], q = items.slice(), tot = q.reduce(function (a, b) { return a + b.v }, 0); if (!(tot > 0)) return out;
  function worst(row, side) { var s = row.reduce(function (a, b) { return a + b.v }, 0), m = 0; row.forEach(function (r) { m = Math.max(m, side * side * r.v / (s * s), s * s / (side * side * r.v)) }); return m }
  while (q.length) {
    var side = Math.min(w, ht), sc = w * ht / q.reduce(function (a, b) { return a + b.v }, 0), row = [q.shift()];
    while (q.length) { var r2 = row.concat([q[0]]); if (worst(r2.map(function (o) { return { v: o.v * sc } }), side) <= worst(row.map(function (o) { return { v: o.v * sc } }), side)) row.push(q.shift()); else break }
    var sum = row.reduce(function (a, b) { return a + b.v }, 0) * sc;
    if (w >= ht) { var cw = sum / ht, cy = y; row.forEach(function (o) { var chh = o.v * sc / cw; out.push({ o: o, x: x, y: cy, w: cw, h: chh }); cy += chh }); x += cw; w -= cw }
    else { var chh2 = sum / w, cx = x; row.forEach(function (o) { var cw2 = o.v * sc / chh2; out.push({ o: o, x: cx, y: y, w: cw2, h: chh2 }); cx += cw2 }); y += chh2; ht -= chh2 } }
  return out }
function label(p, rc, o, fg, vfg, dec, unit, t0, sz0) {
  var nm = o.name || '', vt = h.nf(o.value, dec) + unit, big = rc.w > 70 && rc.h > 46, sz = sz0 || (o.value > 0 && rc.w * rc.h > 24000 ? 22 : rc.w * rc.h > 6500 ? 16 : 13.5), g = h.at(p, t0, { 'data-fx': 'fade' });
  if (big) { while (sz > 12 && h.textW(nm, sz, 1) > rc.w - 28) sz -= 1; if (h.textW(nm, sz, 1) > rc.w - 20) return;
    T(g, rc.x + 14, rc.y + 12 + sz, nm, { 'font-size': sz, 'font-weight': 700, fill: fg }); if (rc.h > sz * 2.2 + 26) T(g, rc.x + 14, rc.y + 20 + sz * 2.2, vt, { 'font-size': Math.max(12, sz * 1.1), 'font-weight': 700, fill: vfg }); return }
  if (rc.w > 52 && rc.h > 28) { var t = nm + ' ' + vt, f = 12; if (h.textW(t, f, 1) > rc.w - 12) t = nm; if (h.textW(t, f, 1) > rc.w - 12) return; T(g, rc.x + 8, rc.y + rc.h / 2 + 4.5, t, { 'font-size': f, 'font-weight': 700, fill: fg }) } }
ECOM.parts.treemap = function (bd, s, ctx) {
  var root = ctx.root, svg = ctx.svg(512), unit = s.unit == null ? '%' : s.unit, dec = s.dec != null ? s.dec : 1, side = s.side && !s.groups ? s.side : null, TW = side ? 900 : 1168, y0 = 4, TH = 504;
  if (s.groups) { var gs = (s.groups || []).map(function (g) { var it = (g.items || []).filter(function (q) { return +q.value > 0 }); return { name: g.name, items: it, v: it.reduce(function (a, b) { return a + +b.value }, 0), tot: g.value } }).filter(function (g) { return g.v > 0 }).sort(function (a, b) { return b.v - a.v });
    if (!gs.length) return; var ro = squarify(gs, 0, y0, TW, TH), tones = [[C.main, '#fff'], [C.g65, '#fff'], [C.g40, C.ink], [C.g18, C.ink]], gt = 0;
    ro.forEach(function (r, gi) { var g = r.o, tn = tones[Math.min(gi, 3)], hd = 30, ix = r.x + 3, iy = r.y + hd + 1, iw = r.w - 6, ih = r.h - hd - 4, t0 = gi * 220;
      E('rect', { x: r.x + 1.5, y: r.y + 1.5, width: r.w - 3, height: r.h - 3, rx: 8, fill: C.g08, stroke: C.line, 'data-at': t0, 'data-fx': 'pop', 'data-ms': 360 }, svg);
      var ht = g.name + (g.tot != null ? ' ' + h.nf(g.tot, dec) + unit : ''), hg = h.at(svg, t0 + 160, { 'data-fx': 'fade' }); if (h.textW(ht, 14.5, 1) < r.w - 16) T(hg, r.x + 10, r.y + 22, ht, { 'font-size': 14.5, 'font-weight': 700, fill: C.dark }); else T(hg, r.x + 10, r.y + 22, g.name, { 'font-size': 14.5, 'font-weight': 700, fill: C.dark });
      if (iw < 10 || ih < 10) return; var items = g.items.map(function (q) { return { name: q.name, value: +q.value, v: +q.value } }).sort(function (a, b) { return b.v - a.v });
      squarify(items, ix, iy, iw, ih).forEach(function (c, ci) { var d = 2; E('rect', { x: c.x + 1, y: c.y + 1, width: Math.max(0, c.w - 2), height: Math.max(0, c.h - 2), rx: 4, fill: tn[0], 'data-at': t0 + 200 + ci * 70, 'data-fx': 'pop', 'data-ms': 320 }, svg);
        label(svg, { x: c.x + 1, y: c.y + 1, w: c.w - 2, h: c.h - 2 }, c.o, tn[1], tn[1], dec, unit, t0 + 420 + ci * 70, c.w * c.h > 9000 ? 16 : 13.5) }); gt = Math.max(gt, t0 + 420 + 6 * 70) });
    root.setAttribute('data-gap', 300); return }
  var its = (s.items || []).filter(function (q) { return +q.value > 0 }).map(function (q) { return { name: q.name, value: +q.value, v: +q.value, other: !!q.other || q.name === '그 밖' } }); if (!its.length) return;
  its.sort(function (a, b) { return b.v - a.v });
  var hero = s.hero, hn = null; if (typeof hero === 'number') hn = (s.items[hero] || {}).name; else if (hero) hn = hero; else hn = its.filter(function (q) { return !q.other })[0].name;
  var topN = s.top != null ? s.top : 5, ranked = its.filter(function (q) { return !q.other }).slice(0, topN).map(function (q) { return q.name });
  squarify(its, 0, y0, TW, TH).forEach(function (r, i) { var o = r.o, isH = o.name === hn, inTop = ranked.indexOf(o.name) >= 0, fill = isH ? C.dark : o.other ? C.light : inTop ? C.main : C.g18, fg = isH || inTop ? '#fff' : C.ink, vfg = isH || inTop ? '#fff' : C.dark;
    E('rect', { x: r.x + 2, y: r.y + 2, width: Math.max(0, r.w - 4), height: Math.max(0, r.h - 4), rx: 6, fill: fill, 'data-at': 60 * i, 'data-fx': 'pop', 'data-ms': 340 }, svg);
    label(svg, { x: r.x + 2, y: r.y + 2, w: r.w - 4, h: r.h - 4 }, o, fg, vfg, dec, unit, 60 * i + 220) });
  if (side) { var rx = 934, RW = 234, sd = side.rows || [], sdec = side.dec != null ? side.dec : 1, tt = side.total, boxH = tt ? 150 : 0, rows0 = 84, avail = (tt ? 500 - boxH - 14 : 500) - rows0, pitch = Math.min(46, avail / Math.max(1, sd.length)), t1 = 900;
    T(h.at(svg, t1 - 100, { 'data-fx': 'fade' }), rx, 40, side.title || '1년 전보다', { 'font-size': 14, 'font-weight': 700, fill: C.ink });
    sd.forEach(function (r, i) { var y = rows0 + i * pitch + 14, v = +r.value, tx = h.nf(v, sdec, { sign: true }) + (r.unit || ''), cw = h.textW(tx, 12.5, 1) + 20, g = h.at(svg, t1 + i * 100, { 'data-fx': 'fade' });
      T(g, rx, y + 5, r.label || '', { 'font-size': 14.5, 'font-weight': 600, fill: C.cmp }); E('rect', { x: rx + RW - cw, y: y - 11, width: cw, height: 24, rx: 12, fill: v < 0 ? C.warn : C.main }, g);
      T(g, rx + RW - cw / 2, y + 5, tx, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }); E('line', { x1: rx, x2: rx + RW, y1: y + 20, y2: y + 20, stroke: C.grid }, g) });
    if (tt) { var tg = h.at(svg, t1 + sd.length * 100 + 200, { 'data-fx': 'fade' }), by = 508 - boxH, tdec = tt.dec != null ? tt.dec : dec;
      E('rect', { x: rx, y: by, width: RW, height: boxH, rx: 12, fill: C.dark }, tg); T(tg, rx + 18, by + 34, tt.label || '', { 'font-size': 14, 'font-weight': 600, fill: C.g18 });
      T(svg, rx + 18, by + 84, h.nf(tt.value, tdec), { 'font-size': 38, 'font-weight': 700, fill: '#fff', 'data-at': t1 + sd.length * 100 + 200, 'data-fx': 'count', 'data-count': tt.value, 'data-dec': tdec, 'data-suf': tt.unit == null ? unit : tt.unit, 'data-ms': 900 });
      if (tt.sub) h.wrap(tt.sub, 13, RW - 36, 0).slice(0, 2).forEach(function (ln, q) { T(tg, rx + 18, by + 118 + q * 18, ln, { 'font-size': 13, 'font-weight': 500, fill: C.g18 }) }) } }
  root.setAttribute('data-gap', 300);
};
})();
