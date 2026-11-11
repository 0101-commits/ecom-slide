/* heatmap — 색 칸 표 : 지표 × 달(또는 연 × 달). 값이 클수록 짙은 초록, 뚜렷이 나쁜 값만 주황 칸, 칸 안 값 글자 · 왼쪽 줄 이름 · 위 칸 이름
   A 지표 × 달 : cols[이름] · rows[{name,sub,unit,suf,dec,data:[값|null],dir:'up|down',bad:{ge|gt|le|lt:값}}] — 줄마다 따로 색 범위(scale 'row')
   B 연 × 달 : grid{rows:['2021',…],cols:['1월',…],data:[[…]],dec,suf,bad} — 한 색 범위(scale 'all')
   summary{title,kind:'avg|last|max'}(오른쪽 요약 열) · hiCol(테두리 강조할 열 번호, 기본 마지막) · legend(기본 true) · badText(주황 칸 뜻)
   움직임 : 줄 이름 → 칸이 줄마다 왼쪽에서 오른쪽으로 채워짐 → 요약 열 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] }
function mixC(a, b, t) { var p = hex(a), q = hex(b); return 'rgb(' + p.map(function (v, i) { return Math.round(v + (q[i] - v) * t) }).join(',') + ')' }
function tone(t) { return t < .5 ? mixC('#F1F7F4', C.g40, t * 2) : mixC(C.g40, C.dark, (t - .5) * 2) }
function isBad(b, v) { if (!b || v == null) return false; return (b.ge != null && v >= b.ge) || (b.gt != null && v > b.gt) || (b.le != null && v <= b.le) || (b.lt != null && v < b.lt) }
ECOM.parts.heatmap = function (bd, s, ctx) {
  var root = ctx.root, rows, cols, all = s.scale === 'all';
  if (s.grid) { var gd = s.grid; cols = gd.cols || []; rows = (gd.rows || []).map(function (nm, i) { return { name: nm, data: gd.data[i] || [], dec: gd.dec, suf: gd.suf, bad: gd.bad, dir: gd.dir } }); if (s.scale == null) all = true }
  else { cols = s.cols || []; rows = s.rows || [] }
  var nr = rows.length, nc = cols.length; if (!nr || !nc) return;
  var sm = s.summary, svg = ctx.svg(512), leg = s.legend !== false, top = leg ? 30 : 0;
  var lw = Math.min(250, Math.max.apply(null, rows.map(function (r) { return Math.max(h.textW(r.name, 14.5, 1), r.sub || r.unit ? h.textW(r.sub || r.unit, 12.5) : 0) })) + 22), smW = sm ? 96 : 0;
  var cw = (1168 - lw - smW - (sm ? 10 : 0)) / nc, hh = 30, ch = Math.min(64, (512 - top - hh - 4) / nr), gx = lw, gy = top + hh;
  var gl = Infinity, gh = -Infinity; rows.forEach(function (r) { r.data.forEach(function (v) { if (v != null) { gl = Math.min(gl, v); gh = Math.max(gh, v) } }) });
  /* 범례 */
  if (leg) { var lg = h.lv(svg, 1, { 'data-fx': 'fade' }), lx = 0; T(lg, lx, 15, all ? '낮음' : '줄마다 낮음', { 'font-size': 12.5, fill: C.mute }); lx += h.textW(all ? '낮음' : '줄마다 낮음', 12.5) + 8;
    for (var q = 0; q < 6; q++) { E('rect', { x: lx + q * 22, y: 4, width: 20, height: 14, rx: 2, fill: tone(q / 5) }, lg) } lx += 6 * 22 + 6; T(lg, lx, 15, '높음', { 'font-size': 12.5, fill: C.mute }); lx += 44;
    if (rows.some(function (r) { return r.bad })) { E('rect', { x: lx, y: 4, width: 20, height: 14, rx: 2, fill: C.warnsoft, stroke: C.warn, 'stroke-width': 1 }, lg); T(lg, lx + 28, 15, s.badText || '기준을 넘은 값', { 'font-size': 12.5, fill: C.warn, 'font-weight': 700 }) } }
  /* 위 칸 이름 · 줄 이름 */
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' }), hc = s.hiCol == null ? nc - 1 : s.hiCol;
  cols.forEach(function (c, j) { T(g1, gx + cw * (j + .5), gy - 10, c, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': j === hc ? 700 : 400, fill: j === hc ? C.ink : C.mute }) });
  if (sm) T(g1, gx + nc * cw + 10 + smW / 2, gy - 10, sm.title || (sm.kind === 'last' ? '최근' : sm.kind === 'max' ? '최고' : '평균'), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.ink });
  rows.forEach(function (r, i) { var cy = gy + ch * (i + .5); T(g1, 0, cy + (r.sub || r.unit ? -2 : 5), r.name, { 'font-size': 14.5, 'font-weight': 700, fill: C.ink }); if (r.sub || r.unit) T(g1, 0, cy + 15, r.sub || r.unit, { 'font-size': 12.5, fill: C.mute }) });
  /* 칸 */
  var fs = Math.min(14, cw / 5.2, ch * .36), T0 = 350, RS = Math.max(110, Math.min(220, 1800 / nr)), CS = Math.max(14, Math.min(40, RS * 1.6 / nc));
  rows.forEach(function (r, i) { var vals = r.data.filter(function (v) { return v != null }), lo = all ? gl : Math.min.apply(null, vals), hi = all ? gh : Math.max.apply(null, vals), dec = r.dec != null ? r.dec : (s.dec != null ? s.dec : 1), suf = r.suf != null ? r.suf : (s.suf || '');
    for (var j = 0; j < nc; j++) { var v = r.data[j], x = gx + cw * j, y = gy + ch * i, at = T0 + i * RS + j * CS, g = E('g', { 'data-at': at, 'data-fx': 'fade', 'data-ms': 260 }, svg);
      if (v == null) { E('rect', { x: x + 1.5, y: y + 1.5, width: cw - 3, height: ch - 3, rx: 3, fill: '#fff', stroke: C.line, 'stroke-dasharray': '3 3' }, g); T(g, x + cw / 2, y + ch / 2 + fs * .36, '—', { 'text-anchor': 'middle', 'font-size': fs, fill: C.mute }); continue }
      var t = hi > lo ? (v - lo) / (hi - lo) : .5; if (r.dir === 'down') t = 1 - t; var bad = isBad(r.bad, v), fill = bad ? C.warnsoft : tone(t);
      E('rect', { x: x + 1.5, y: y + 1.5, width: cw - 3, height: ch - 3, rx: 3, fill: fill, stroke: bad ? C.warn : 'none', 'stroke-width': bad ? 1.5 : 0 }, g);
      T(g, x + cw / 2, y + ch / 2 + fs * .36, h.nf(v, dec) + suf, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': bad || t > .62 ? 700 : 500, fill: bad ? C.warn : t > .62 ? '#fff' : C.ink }) }
    if (sm) { var sv = sm.kind === 'last' ? (function () { for (var k = r.data.length - 1; k >= 0; k--) if (r.data[k] != null) return r.data[k] })() : sm.kind === 'max' ? hi : vals.reduce(function (p, c) { return p + c }, 0) / vals.length;
      var sx = gx + nc * cw + 10, sgp = E('g', { 'data-at': T0 + i * RS + nc * CS + 120, 'data-fx': 'fade' }, svg);
      E('rect', { x: sx, y: gy + ch * i + 1.5, width: smW, height: ch - 3, rx: 3, fill: C.paper }, sgp); T(sgp, sx + smW / 2, gy + ch * (i + .5) + fs * .36, h.nf(sv, dec) + suf, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: isBad(r.bad, sv) ? C.warn : C.dark }) } });
  if (hc >= 0 && hc < nc) E('rect', { x: gx + cw * hc + .5, y: gy - 2, width: cw - 1, height: ch * nr + 4, rx: 4, fill: 'none', stroke: C.dark, 'stroke-width': 2, 'data-at': T0 + nr * RS + 200, 'data-fx': 'fade' }, svg);
  root.setAttribute('data-gap', 300);
};
})();
