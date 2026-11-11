/* race — 누적 두 선 경주 : 지난해(진회색) · 올해(초록) 누적선이 달마다 함께 그려지고, 끝 이름표가 머리를 따라가며 값을 셈
   series[{name,data,color}](2개 — data = 달 값 목록 또는 [이름,값]) · cum(기본 true, false 면 data 를 누적값으로 봄) · labels(기본 '1월'~)
   unit · dec · y{min,max,step,dec,unit} · ref{value|'auto',name,at:'left|right'}(기준선, 'auto' = 첫 계열 마지막 누적값)
   mark{text,sub}(둘째 계열이 기준선을 처음 넘는 달 — 엔진이 찾음, false 면 없음) · gap{at,text,sub}(같은 달 두 선 차이 화살, 기본 둘째 계열 마지막 달, false 면 없음)
   ms(경주 시간, 기본 2600) · area(기본 true, 둘째 계열 아래 옅은 면) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { var L = [], V = []; (d || []).forEach(function (p) { if (Array.isArray(p)) { L.push(String(p[0])); V.push(p[1] == null ? null : +p[1]) } else { L.push(null); V.push(p == null ? null : +p) } }); return { l: L, v: V } }
function hitN(b, polys) { var n = 0; polys.forEach(function (P) { for (var i = 0; i < P.length - 1; i++) { var a = P[i], c = P[i + 1], st = Math.max(2, Math.ceil(Math.abs(c[0] - a[0]) / 4));
  for (var k = 0; k <= st; k++) { var x = a[0] + (c[0] - a[0]) * k / st, y = a[1] + (c[1] - a[1]) * k / st; if (x > b.l - 4 && x < b.r + 4 && y > b.t - 4 && y < b.b + 4) n++ } } }); return n }
function ovl(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t }
function pick(cands, polys, boxes, lim) { var best = cands[0], bs = 1e9; cands.forEach(function (c, i) { var sc = hitN(c.box, polys) * 10 + i;
  boxes.forEach(function (b) { if (ovl(c.box, b)) sc += 200 }); if (c.box.l < lim.l || c.box.r > lim.r || c.box.t < lim.t || c.box.b > lim.b) sc += 2000; if (sc < bs) { bs = sc; best = c } }); return best }
ECOM.parts.race = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, ser = (s.series || []).slice(0, 2); if (ser.length < 2) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', F = function (v, sg) { return h.nf(v, dec, { sign: sg }) + unit };
  var cum = ser.map(function (q) { var r = norm(q.data).v; if (s.cum === false) return r; var a = 0; return r.map(function (v) { a += v || 0; return +a.toFixed(6) }) });
  var N = Math.max(cum[0].length, cum[1].length), labels = s.labels || (function () { var o = []; for (var i = 0; i < N; i++) o.push((i + 1) + '월'); return o })();
  var cn = [ser[0].color || 'cmp', ser[1].color || 'main'], cl = cn.map(h.col);
  var ref = s.ref ? { v: s.ref.value === 'auto' || s.ref.value == null ? cum[0][cum[0].length - 1] : +s.ref.value, name: s.ref.name || '기준' } : null;
  var li = ser.map(function (q, k) { return { color: cn[k], text: q.name } }); if (ref) li.push({ type: 'dash', color: 'cmp', text: ref.name + ' ' + F(ref.v) });
  if (s.legend !== false) u.legendHTML(bd, li, 0);
  var endT = ser.map(function (q, k) { return q.name + ' ' + F(cum[k][cum[k].length - 1]) }), endW = Math.min(240, Math.max.apply(null, endT.map(function (t) { return h.textW(t, 15, 1) })) + 30);
  var svg = ctx.svg(512), top = 44, bot = 468, ml = 64, x1 = 1168 - endW, X = function (i) { return ml + 16 + i * (x1 - ml - 32) / Math.max(1, N - 1) };
  var vals = cum[0].concat(cum[1]); if (ref) vals.push(ref.v);
  var sc = u.yScale(vals.concat([0]), s.y, top + 8, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit, base: true });
  var xi = N <= 14 ? labels.map(function (_, i) { return i }) : u.xTicks(N, 12); u.xLabels(g1, labels, X, bot + 20, xi, {});
  var boxes = [], polys = cum.map(function (c) { return c.map(function (v, i) { return [X(i), Y(v)] }) }), lim = { l: ml + 4, r: 1168, t: top - 10, b: bot - 2 };
  /* 기준선 */
  var gr = null; if (ref) { gr = h.lv(svg, 1); var ry = Y(ref.v); E('line', { x1: ml, x2: X(N - 1) - 10, y1: ry, y2: ry, stroke: C.cmp, 'stroke-width': 1.6, 'stroke-dasharray': '7 5', opacity: .75 }, gr);
    var rt = ref.name + ' ' + F(ref.v), rw = h.textW(rt, 13.5, 1), rc = [];
    [[X(0), ry - 9, 'start'], [X(N - 1) - 16, ry - 9, 'end'], [X(0), ry + 21, 'start'], [X(N - 1) - 16, ry + 21, 'end'], [X((N - 1) * .3), ry - 9, 'start'], [X((N - 1) * .3), ry + 21, 'start'], [X((N - 1) * .55), ry - 9, 'start'], [X((N - 1) * .55), ry + 21, 'start']].forEach(function (p) { var l = p[2] === 'end' ? p[0] - rw : p[0]; rc.push({ p: p, box: { l: l, r: l + rw, t: p[1] - 13, b: p[1] + 3 } }) });
    if (s.ref.at === 'right') rc = [rc[1], rc[0], rc[3], rc[2]];
    var rp = pick(rc, polys, boxes, lim); T(gr, rp.p[0], rp.p[1], rt, { 'text-anchor': rp.p[2], 'font-size': 13.5, 'font-weight': 700, fill: C.cmp }); boxes.push(rp.box) }
  /* 선(자르기 틀 안) */
  var cid = 'jrace' + ctx.index, cp = E('clipPath', { id: cid }, E('defs', {}, svg)), clipR = E('rect', { x: X(0) - 10, y: 0, width: 2000, height: 512 }, cp), lg = E('g', { 'clip-path': 'url(#' + cid + ')' }, svg);
  if (s.area !== false) { var c1 = cum[1], ad = 'M' + X(0) + ' ' + Y(Math.max(sc.lo, 0)); c1.forEach(function (v, i) { ad += ' L' + X(i) + ' ' + Y(v) }); ad += ' L' + X(c1.length - 1) + ' ' + Y(Math.max(sc.lo, 0)) + ' Z'; E('path', { d: ad, fill: C.g08, opacity: .9 }, lg) }
  cum.forEach(function (c, k) { E('path', { d: h.lineD(c, X, Y), fill: 'none', stroke: cl[k], 'stroke-width': k ? 3.6 : 2.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, lg);
    c.forEach(function (v, i) { E('circle', { cx: X(i), cy: Y(v), r: k ? 3.6 : 3, fill: '#fff', stroke: cl[k], 'stroke-width': 2 }, lg) }) });
  if (gr) svg.appendChild(gr); /* 기준선 · 글은 면 위로 */
  /* 머리 점 · 이름표 */
  var heads = cum.map(function (c, k) { var g = E('g', {}, svg); return { c: c, k: k, dot: E('circle', { r: k ? 7 : 6, fill: cl[k], stroke: '#fff', 'stroke-width': 2 }, g), txt: T(g, 0, 0, '', { 'font-size': 15, 'font-weight': 700, fill: cl[k] }) } });
  function headAt(c, p) { var last = c.length - 1, fi = p * (N - 1); if (fi >= last) return { x: X(last), v: c[last], end: true }; var i0 = Math.floor(fi), t = fi - i0; return { x: X(i0) + (X(i0 + 1) - X(i0)) * t, v: c[i0] + (c[i0 + 1] - c[i0]) * t } }
  function setP(p) { clipR.setAttribute('width', Math.max(0, (X(N - 1) - X(0)) * p + (p >= 1 ? 80 : 10)));
    var P = heads.map(function (hd) { var q = headAt(hd.c, p); return { hd: hd, x: q.x, y: Y(q.v), v: q.v } }), ly = P.map(function (q) { return q.y + 5 });
    var w0 = h.textW(endT[0], 15, 1) + 14; if (Math.abs(P[0].x - P[1].x) < w0 && Math.abs(ly[0] - ly[1]) < 22) { var m = (ly[0] + ly[1]) / 2, hi = P[1].y <= P[0].y ? 1 : 0; ly[hi] = m - 11; ly[1 - hi] = m + 11 }
    P.forEach(function (q, k) { var hd = q.hd; hd.dot.setAttribute('cx', q.x); hd.dot.setAttribute('cy', q.y); hd.txt.setAttribute('x', q.x + 13); hd.txt.setAttribute('y', ly[k]);
      hd.txt.textContent = ser[k].name + ' ' + F(q.v); hd.dot.style.opacity = hd.txt.style.opacity = p <= 0 ? 0 : '' }) }
  setP(1); heads.forEach(function (hd, k) { var b = hd.txt.getAttribute('x'); boxes.push({ l: +b, r: +b + h.textW(endT[k], 15, 1), t: +hd.txt.getAttribute('y') - 15, b: +hd.txt.getAttribute('y') + 3 }) });
  var T0 = 450, D = s.ms || 2600, tOf = function (i) { return T0 + D * i / Math.max(1, N - 1) };
  /* 기준선을 처음 넘는 달 */
  if (ref && s.mark !== false) { var c1b = cum[1], k0 = -1; for (var i = 0; i < c1b.length; i++) if (c1b[i] >= ref.v && (i === 0 || c1b[i - 1] < ref.v)) { k0 = i; break }
    if (k0 >= 0 && k0 < c1b.length - 1) { var mx = X(k0), my = Y(c1b[k0]), m1 = (s.mark && s.mark.text) || (labels[k0] + ' 누적 ' + F(c1b[k0])), m2 = (s.mark && s.mark.sub) || (ref.name + ' 첫 추월'), mw = Math.max(h.textW(m1, 14, 1), h.textW(m2, 13)), mc = [];
      [[-1, -1, 54], [1, -1, 54], [-1, -1, 96], [1, 1, 40], [-1, 1, 40], [1, -1, 100]].forEach(function (o) { var tx = mx + o[0] * 22, ty = my + o[1] * o[2], l = o[0] < 0 ? tx - mw : tx; mc.push({ o: o, tx: tx, ty: ty, box: { l: l, r: l + mw, t: ty - 15, b: ty + 21 } }) });
      var mp = pick(mc, polys, boxes, lim), gm = h.at(svg, tOf(k0) + 120, { 'data-fx': 'pop' }), an = mp.o[0] < 0 ? 'end' : 'start';
      if (boxes.some(function (b) { return ovl(mp.box, b) }) || mp.box.l < lim.l || mp.box.r > lim.r) { m1 = ''; m2 = '' }
      if (m1) E('line', { x1: mx + mp.o[0] * 5, y1: my + mp.o[1] * 7, x2: mp.tx - mp.o[0] * 2, y2: mp.o[1] < 0 ? mp.ty + 8 : mp.ty - 16, stroke: C.dark, 'stroke-width': 1.4 }, gm);
      E('circle', { cx: mx, cy: my, r: 9, fill: 'none', stroke: C.dark, 'stroke-width': 2 }, gm);
      if (m1) { T(gm, mp.tx, mp.ty, m1, { 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: C.dark }); T(gm, mp.tx, mp.ty + 17, m2, { 'text-anchor': an, 'font-size': 13, fill: C.mute }); boxes.push(mp.box) } } }
  /* 같은 달 차이 화살 */
  if (s.gap !== false) { var gi = s.gap && s.gap.at != null ? s.gap.at : cum[1].length - 1, ga = cum[0][gi], gb = cum[1][gi];
    if (ga != null && gb != null && Math.abs(Y(ga) - Y(gb)) >= 44) { var gx = X(gi), gg = h.at(svg, tOf(gi) + 260, { 'data-fx': 'fade' }), gt = (s.gap && s.gap.text) || F(gb - ga, true), gs = (s.gap && s.gap.sub) || '', gw = Math.max(h.textW(gt, 15, 1), h.textW(gs, 13)), gy = (Y(ga) + Y(gb)) / 2, gc = [];
      [1, -1].forEach(function (sd) { var l = sd > 0 ? gx + 12 : gx - 12 - gw; gc.push({ sd: sd, box: { l: l, r: l + gw, t: gy - 16, b: gy + (gs ? 20 : 4) } }) });
      var gp = pick(gc, polys, boxes, lim); if (boxes.some(function (b) { return ovl(gp.box, b) })) { gt = ''; gs = '' } h.arrow2(gg, gx, Y(ga), Y(gb), C.dark, 1.6);
      if (gt) T(gg, gx + gp.sd * 12, gy - 1, gt, { 'text-anchor': gp.sd > 0 ? 'start' : 'end', 'font-size': 15, 'font-weight': 700, fill: C.dark });
      if (gs) T(gg, gx + gp.sd * 12, gy + 16, gs, { 'text-anchor': gp.sd > 0 ? 'start' : 'end', 'font-size': 13, fill: C.mute }) } }
  /* 움직임 : 축 → 두 선이 함께 그려지고 이름표가 따라감 → 추월 점 → 차이 화살 */
  root._prep = function () { setP(0) };
  root._hook = function (r) { setP(0); var t0 = null; function st(ts) { if (t0 === null) t0 = ts; var e = ts - t0 - T0, p = Math.max(0, Math.min(1, e / D)); setP(p); if (p < 1) r._raf.push(requestAnimationFrame(st)) }
    r._raf.push(requestAnimationFrame(st)); return T0 + D + 400 };
  root._reset = function () { setP(1) };
  root.setAttribute('data-gap', 300);
};
})();
