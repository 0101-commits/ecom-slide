/* lnline — 선 계열 확장 부품(머리글자 ln) : 한 엔진으로 여러 모양. kind 이름마다 같은 칸을 받고 모양은 쓰는 칸이 정함.
   lnband 범위 띠 + 올해 선(또는 부채꼴) · lnfill 기준선 위아래 칠 · lnlog 로그 눈금 + 시대 띠 · lnproj 점선 예상 · lnidx 기준 100 여러 선 · lnbars 선 + 아래 막대
   lndd 고점 대비 낙폭 · lnlag 시차 당긴 선 · lnma 이동평균 교차 · lnend 끝점 큰 숫자 · lnarrow 구간 화살표 · lnmirror 거울 선 · lnyears 해마다 겹친 선 · lnfan 부채꼴
   칸 : labels · series[{name,data(null 가능),color,dash,width,area}] · unit · dec · y{min,max,step,dec,suf,unit,ticks} · log:true(y.ticks 필요) · ticks(x 눈금 번호) · xwant
   band{lo[],hi[],name,tone:'main'|'soft'} · fill{s,ref,up,down} (선과 기준값 사이 칠) · ref{v,label} 가로 기준선 · eras[{from,to,name,tone}] 세로 띠
   vlines[{at,text,tone}] 세로 점선 · marks[{at,s,text,pos:'above'|'below',tone,dx,dy,anchor}] 강조 점 · arrows[{from,to,s,text,tone:'main'|'warn'}] 두 점 잇는 화살표
   shift{from,to,s,text} 가로 화살표(당김) · bars{name,unit,data,dec,y{min,max}} 아래 막대 칸 · mirror:true 둘째 선을 0 아래로 뒤집음(눈금은 절댓값)
   endbig{s,text,sub} 끝점 큰 숫자 · endNames(기본 이름 있으면 끝에 이름 표) · 쌓기 : 축 · 띠 → 칠 → 선 → 화살표 · 세로선 → 강조 점 → 끝 숫자 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function run(bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, W = 1168, labels = s.labels || [], ser = (s.series || []).filter(function (q) { return q && q.data && q.data.length }); if (!ser.length) return;
  var n = Math.max(labels.length, ser[0].data.length), unit = s.unit || '', dec = s.dec != null ? s.dec : 0, yo = s.y || {}, band = s.band, bars = s.bars, eb = s.endbig, mir = !!s.mirror;
  var endNames = s.endNames != null ? s.endNames : ser.some(function (q) { return q.name });
  var x0 = 64, rm = eb ? 250 : endNames ? 96 : 40; if (s.rmargin != null) rm = s.rmargin; var x1 = W - rm, X = function (i) { return x0 + (x1 - x0) * i / Math.max(1, n - 1) };
  var barH = bars ? 134 : 0, y0 = s.top != null ? s.top : 40, y1 = 458 - barH, svg = ctx.svg(512);
  var val = function (q, k, v) { return v == null ? null : (mir && k === 1 ? -v : v) };
  var all = []; ser.forEach(function (q, k) { q.data.forEach(function (v) { if (v != null) all.push(val(q, k, v)) }) });
  if (band) { (band.lo || []).concat(band.hi || []).forEach(function (v) { if (v != null) all.push(v) }) }
  if (s.ref && s.ref.v != null) all.push(s.ref.v); if (s.fill && s.fill.ref != null) all.push(s.fill.ref);
  var sc, Y;
  if (s.log) { var lt = yo.ticks || [1, 10, 100], llo = Math.log(yo.min || lt[0]), lhi = Math.log(yo.max || lt[lt.length - 1]), Yl = h.lin(llo, lhi, y1, y0);
    Y = function (v) { return Yl(Math.log(Math.max(v, 1e-9))) }; sc = { ticks: lt, dec: yo.dec || 0, lo: lt[0], hi: lt[lt.length - 1], Y: Y } }
  else { sc = u.yScale(all, yo, y0, y1); Y = sc.Y }
  var g1 = h.lv(svg, 1, { 'data-fx': 'fade' }), suf = yo.suf || '';
  /* 시대 띠 */
  (s.eras || []).forEach(function (b, i) { var xa = X(b.from), xb = X(b.to), tn = b.tone || (i % 2 ? 'soft' : 'main');
    E('rect', { x: xa, y: y0 - 4, width: xb - xa, height: y1 - y0 + 4, fill: tn === 'warn' ? '#F2D9CF' : tn === 'soft' ? C.g08 : C.g18, opacity: .75 }, g1);
    var tw = h.textW(b.name || '', 13, true), ty = y0 + 14; if (tw > xb - xa - 6) { var L = h.wrap(b.name || '', 13, xb - xa - 8, true); L.forEach(function (t, j) { T(g1, (xa + xb) / 2, ty + j * 15, t, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.dark }) }) }
    else T(g1, (xa + xb) / 2, ty, b.name || '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: tn === 'warn' ? C.warn : C.dark }) });
  /* 눈금 */
  sc.ticks.forEach(function (v) { var z = v === 0 && !s.log;
    E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: z ? C.mute : C.grid, 'stroke-dasharray': z ? null : '3 4', 'stroke-width': z ? 1.4 : 1 }, g1);
    T(g1, x0 - 9, Y(v) + 4.5, h.nf(mir ? Math.abs(v) : v, sc.dec) + suf, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
  if (yo.unit) T(g1, 0, y0 - 16, yo.unit, { 'text-anchor': 'start', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  var ty = y1 + 22, xt = s.ticks || u.xTicks(n, s.xwant || 12);
  if (s.xraw) xt.forEach(function (i) { T(g1, X(i), ty, String(labels[i]), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) }); else u.xLabels(g1, labels, X, ty, xt);
  /* 기준선 */
  if (s.ref && s.ref.v != null) { var ry = Y(s.ref.v); E('line', { x1: x0, x2: x1, y1: ry, y2: ry, stroke: C.dark, 'stroke-width': 1.8, 'stroke-dasharray': '6 4' }, g1);
    if (s.ref.label) { var rw = h.textW(s.ref.label, 12.5, true) + 16; E('rect', { x: x0 + 8, y: ry - 25, width: rw, height: 21, rx: 10, fill: C.dark }, g1); T(g1, x0 + 8 + rw / 2, ry - 10.5, s.ref.label, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) } }
  /* 아래 막대 칸 */
  var ly0 = y1 + 62, ly1 = ly0 + 66;
  if (bars) { var bs = u.yScale(bars.data.filter(function (v) { return v != null }), Object.assign({ n: 3 }, bars.y || {}), ly0, ly1), Z = bs.Y, zy = Z(0), bw = Math.max(1.5, Math.min(14, (x1 - x0) / n * .72));
    T(g1, x0, ly0 - 12, (bars.name || '') + (bars.unit ? ' (' + bars.unit + ')' : ''), { 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
    bs.ticks.forEach(function (v) { T(g1, x0 - 9, Z(v) + 4.5, h.nf(v, bars.dec != null ? bars.dec : bs.dec) + (bars.suf || ''), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) });
    E('line', { x1: x0, x2: x1, y1: zy, y2: zy, stroke: C.mute, 'stroke-width': 1.2 }, g1);
    var gb = h.at(svg, 500, { 'data-fx': 'fade', 'data-ms': 700 });
    bars.data.forEach(function (v, i) { if (v == null) return; var yy = Z(v); E('rect', { x: X(i) - bw / 2, y: Math.min(yy, zy), width: bw, height: Math.max(1, Math.abs(zy - yy)), fill: v < 0 ? C.gray : C.g65 }, gb) }) }
  /* 범위 띠 · 부채꼴 */
  if (band && band.lo && band.hi) { var up = [], dn = []; band.hi.forEach(function (v, i) { if (v != null && band.lo[i] != null) { up.push([X(i), Y(v)]); dn.push([X(i), Y(band.lo[i])]) } });
    if (up.length) { var d = up.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join(' ') + dn.slice().reverse().map(function (p) { return ' L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join('') + ' Z';
      E('path', { d: d, fill: band.tone === 'main' ? C.g40 : C.g18, opacity: band.tone === 'main' ? .55 : .8, 'data-at': 100, 'data-fx': 'fade', 'data-ms': 700 }, svg);
      if (band.name) { var mid = Math.floor(up.length / 2), bp = up[mid], tx = Math.min(x1 - 60, Math.max(x0 + 60, bp[0]));
        T(svg, tx, band.nameY != null ? band.nameY : bp[1] - 10, band.name, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.dark, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'data-at': 400, 'data-fx': 'fade' }) } } }
  /* 기준값과 선 사이 칠 */
  if (s.fill) { var fq = ser[s.fill.s || 0], fr = s.fill.ref, fy = Y(fr), segs = [[], []];
    var pushSeg = function (k, pts) { if (pts.length > 1) segs[k].push(pts) };
    var cur = [], curK = null;
    for (var i = 0; i < fq.data.length; i++) { var v = fq.data[i]; if (v == null) continue; var k = v >= fr ? 0 : 1;
      if (curK === null) { cur = [[X(i), Y(v)]]; curK = k }
      else if (k === curK) cur.push([X(i), Y(v)]);
      else { var pv = fq.data[i - 1], t = (fr - pv) / (v - pv), xc = X(i - 1) + t * (X(i) - X(i - 1)); cur.push([xc, fy]); pushSeg(curK, cur); cur = [[xc, fy], [X(i), Y(v)]]; curK = k } }
    if (cur.length) pushSeg(curK, cur);
    [0, 1].forEach(function (k) { segs[k].forEach(function (p) { var d = p.map(function (a, i) { return (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) }).join(' ') + ' L' + p[p.length - 1][0].toFixed(1) + ' ' + fy + ' L' + p[0][0].toFixed(1) + ' ' + fy + ' Z';
      E('path', { d: d, fill: k ? (s.fill.downColor ? h.col(s.fill.downColor) : C.g18) : (s.fill.upColor ? h.col(s.fill.upColor) : C.main), opacity: k ? .9 : .6, 'data-at': 150, 'data-fx': 'fade', 'data-ms': 700 }, svg) }) });
    if (s.fill.upName || s.fill.downName) { var gn = h.at(svg, 900, { 'data-fx': 'fade' }); if (s.fill.upName) T(gn, x1 - 4, y0 + 12, s.fill.upName, { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.dark }); if (s.fill.downName) T(gn, x1 - 4, y1 - 8, s.fill.downName, { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: C.mute }) } }
  /* 선 */
  var cols = ['dark', 'cmp', 'g65', 'gray'], lab = [], ends = [];
  ser.forEach(function (q, k) { var c = h.col(q.color || cols[k % 4]), d = '', pts = [], wd = q.width || (k === 0 ? 3.6 : 3);
    var prev = -2; q.data.forEach(function (v0, i) { var v = val(q, k, v0); if (v == null) return; var pp = [X(i), Y(v), i]; pts.push(pp); d += (i === prev + 1 ? ' L' : ' M') + pp[0].toFixed(1) + ' ' + pp[1].toFixed(1); prev = i });
    d = d.trim();
    if (q.area && pts.length) E('path', { d: d + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + Y(q.areaTo != null ? q.areaTo : sc.lo) + ' L' + pts[0][0].toFixed(1) + ' ' + Y(q.areaTo != null ? q.areaTo : sc.lo) + ' Z', fill: q.areaColor ? h.col(q.areaColor) : C.g08, 'data-at': 150, 'data-fx': 'fade', 'data-ms': 600 }, svg);
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': wd, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': q.dash ? '7 5' : null, 'stroke-opacity': q.op != null ? q.op : null, 'data-at': 200 + k * 220, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    q._pts = pts; if (pts.length && endNames && q.name) { var lp = pts[pts.length - 1]; lab.push({ x: lp[0] + 10, y: lp[1] + 5, c: q.nameColor ? h.col(q.nameColor) : c, t: q.name }) }
    if (pts.length && q.dot) { var ep = pts[pts.length - 1]; E('circle', { cx: ep[0], cy: ep[1], r: 6.5, fill: c, 'data-at': 1500, 'data-fx': 'pop' }, svg) } });
  if (lab.length) { lab.sort(function (a, b) { return a.y - b.y }); for (var li = 1; li < lab.length; li++) if (lab[li].y - lab[li - 1].y < 16) lab[li].y = lab[li - 1].y + 16;
    var gl = h.at(svg, 1300, { 'data-fx': 'fade' }); lab.forEach(function (l) { T(gl, l.x, l.y, l.t, { 'font-size': 13.5, 'font-weight': 700, fill: l.c }) }) }
  /* 세로 점선 */
  (s.vlines || []).forEach(function (v, k) { var gx = h.at(svg, 1200 + k * 200, { 'data-fx': 'fade' }), xx = X(v.at), c = v.tone === 'warn' ? C.warn : C.dark;
    E('line', { x1: xx, x2: xx, y1: y0 - 2, y2: y1, stroke: c, 'stroke-width': 1.8, 'stroke-dasharray': '5 4' }, gx);
    if (v.text) { var tw = h.textW(v.text, 13, true) + 18, tx = Math.min(x1 - tw, Math.max(x0, xx - tw / 2)), ty0 = v.y != null ? v.y : y0 - 2; E('rect', { x: tx, y: ty0 - 2, width: tw, height: 22, rx: 11, fill: c }, gx); T(gx, tx + tw / 2, ty0 + 13, v.text, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) } });
  /* 가로 당김 화살표 */
  if (s.shift) { var sh = s.shift, sq = ser[sh.s || 0], p0 = sq._pts.filter(function (p) { return p[2] === sh.from })[0], p1 = sq._pts.filter(function (p) { return p[2] === sh.to })[0];
    if (p0 && p1) { var gs = h.at(svg, 1800, { 'data-fx': 'fade' }), yy = (sh.y != null ? sh.y : Math.min(p0[1], p1[1]) - 24); E('line', { x1: p0[0], x2: p1[0] - 6, y1: yy, y2: yy, stroke: C.dark, 'stroke-width': 2.4 }, gs);
      E('path', { d: 'M' + (p1[0] - 12) + ' ' + (yy - 6) + ' L' + p1[0] + ' ' + yy + ' L' + (p1[0] - 12) + ' ' + (yy + 6) + ' Z', fill: C.dark }, gs);
      E('circle', { cx: p0[0], cy: yy, r: 4, fill: C.dark }, gs); var stw = h.textW(sh.text || '', 14, true) + 20; E('rect', { x: (p0[0] + p1[0]) / 2 - stw / 2, y: yy - 36, width: stw, height: 24, rx: 12, fill: C.dark }, gs); T(gs, (p0[0] + p1[0]) / 2, yy - 19, sh.text || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) } }
  /* 구간 화살표 */
  (s.arrows || []).forEach(function (a, k) { var q = ser[a.s || 0], pa = q._pts.filter(function (p) { return p[2] === a.from })[0], pb = q._pts.filter(function (p) { return p[2] === a.to })[0]; if (!pa || !pb) return;
    var c = a.tone === 'warn' ? C.warn : C.dark, gx = h.at(svg, 1500 + k * 450, { 'data-fx': 'fade' }), dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L, ex = pb[0] - ux * 10, ey = pb[1] - uy * 10;
    E('line', { x1: pa[0], y1: pa[1], x2: ex, y2: ey, stroke: c, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' }, gx);
    E('path', { d: 'M' + pb[0] + ' ' + pb[1] + ' L' + (pb[0] - ux * 14 - uy * 6) + ' ' + (pb[1] - uy * 14 + ux * 6) + ' L' + (pb[0] - ux * 14 + uy * 6) + ' ' + (pb[1] - uy * 14 - ux * 6) + ' Z', fill: c }, gx);
    [pa, pb].forEach(function (p) { E('circle', { cx: p[0], cy: p[1], r: 6.5, fill: '#fff', stroke: c, 'stroke-width': 3 }, gx) });
    var mx = (pa[0] + pb[0]) / 2 + (a.dx || 0), my = (pa[1] + pb[1]) / 2 + (a.dy != null ? a.dy : (dy < 0 ? -26 : 26)), tw = h.textW(a.text || '', 17, true) + 22;
    E('rect', { x: mx - tw / 2, y: my - 17, width: tw, height: 30, rx: 15, fill: c }, gx); T(gx, mx, my + 4.5, a.text || '', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: '#fff' });
    if (a.sub) T(gx, mx, my + 28, a.sub, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: C.mute, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' }) });
  /* 강조 점 */
  (s.marks || []).forEach(function (m, k) { var q = ser[m.s || 0], pp = q._pts.filter(function (p) { return p[2] === m.at })[0]; if (!pp) return; var c = m.tone === 'warn' ? C.warn : C.dark, tm = 1600 + k * 160, g = h.at(svg, tm, { 'data-fx': 'fade' }), fs = m.size || 14;
    E('circle', { cx: pp[0], cy: pp[1], r: 6.5, fill: m.hollow ? '#fff' : c, stroke: c, 'stroke-width': 3, 'data-at': tm, 'data-fx': 'pop' }, svg);
    var lines = String(m.text || '').split('\n'), anc = m.anchor || 'middle', bw = Math.max.apply(null, lines.map(function (t) { return h.textW(t, fs, true) })), tx = pp[0] + (m.dx || 0);
    tx = Math.max(bw / 2 + 2, Math.min(W - bw / 2 - 2, tx)); if (anc === 'start') tx = pp[0] + (m.dx != null ? m.dx : 10); if (anc === 'end') tx = pp[0] + (m.dx != null ? m.dx : -10);
    var base = m.pos === 'below' ? pp[1] + 28 + (m.dy || 0) : pp[1] - 14 - (lines.length - 1) * (fs + 3) + (m.dy || 0);
    lines.forEach(function (t, j) { T(g, tx, base + j * (fs + 3), t, { 'text-anchor': anc, 'font-size': fs, 'font-weight': 700, fill: c, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' }) }) });
  /* 끝점 큰 숫자 */
  if (eb) { var eq = ser[eb.s || 0], ep = eq._pts[eq._pts.length - 1], g = h.at(svg, 1700, { 'data-fx': 'fade' }); E('circle', { cx: ep[0], cy: ep[1], r: 8, fill: C.dark, 'data-at': 1600, 'data-fx': 'pop' }, svg);
    E('line', { x1: ep[0] + 10, x2: ep[0] + 24, y1: ep[1], y2: ep[1], stroke: C.dark, 'stroke-width': 2 }, g);
    T(g, ep[0] + 30, ep[1] + 16, eb.text || '', { 'font-size': 56, 'font-weight': 700, fill: C.dark });
    if (eb.sub) h.wrap(eb.sub, 14.5, 190, true).slice(0, 3).forEach(function (t, j) { T(g, ep[0] + 32, ep[1] + 42 + j * 19, t, { 'font-size': 14.5, 'font-weight': 600, fill: C.mute }) }) }
  root.setAttribute('data-gap', 300);
}
['lnline', 'lnband', 'lnfill', 'lnlog', 'lnproj', 'lnidx', 'lnbars', 'lndd', 'lnlag', 'lnma', 'lnend', 'lnarrow', 'lnmirror', 'lnyears', 'lnfan'].forEach(function (k) { ECOM.parts[k] = run });
})();
