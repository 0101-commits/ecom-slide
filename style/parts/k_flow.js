/* flow — 거래 흐름(CW44 12쪽) : (왼쪽 정의 판) → 시간 띠(거래일 → 만기일) → 주체 상자 → 화살이 차례로 그려지며 통화 표가 화살을 따라 이동 → 아래 종류 판
   side{title,rows:[{k,v}],concl} · tab('구조') · time{from,to} · nodes[{id,label,sub,col,row,tone:'soft|dark|gray|main'}]
   edges[{from,to,token,tone:'main|cmp',curve:'up|down'}](같은 두 상자 사이 화살 둘은 나란히) · types{title,items:[{name,text}]}
   layout(없으면 default = 위 그림, 같은 칸 그대로) : twoway 두 갈래 단계가 색별로 · choke 단계 사이 띠에서 병목 구간만 경고색 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
var baseFlow = function (bd, s, ctx) {
  var root = ctx.root, side = s.side || null, X0 = side ? 392 : 0, FW = 1168 - X0, ty = s.types || null, tyN = ty ? (ty.items || []).length : 0;
  var tyH = ty ? 44 + tyN * 54 : 0, FH = ty ? 512 - tyH - 14 : 512, nodes = s.nodes || [], edges = s.edges || [];
  if (side) { var rows = side.rows || [];
    var sp = K.D(bd, 'kx k-fsd', 0, 0, 372, 512, '<div class="k-fsh">' + h.esc(side.title || '') + '</div><div class="k-fsb">' + rows.map(function (r) { return '<div class="k-fsr"><i>' + h.esc(r.k || '') + '</i><span>' + h.md(r.v || '') + '</span></div>' }).join('')
      + (side.concl ? '<div class="k-fsc">' + h.md(side.concl) + '</div>' : '') + '</div>', { 'data-at': 0, 'data-fx': 'rise', 'data-ms': 420 }) }
  K.D(bd, 'kx k-fw', X0, 0, FW, FH, '<span class="k-tab">' + h.esc(s.tab || '구조') + '</span>', { 'data-at': 120, 'data-fx': 'fade', 'data-ms': 360 });
  var svg = K.svg(ctx), tm = s.time || null, t0 = 300;
  if (tm) { var bx0 = X0 + 22, bx1 = 1168 - 22, g = E('g', { 'data-at': t0, 'data-fx': 'growx', 'data-ms': 620 }, svg), gid = 'kflg' + ctx.index, df = E('defs', {}, svg), lg = E('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, df);
    E('stop', { offset: 0, 'stop-color': C.g08 }, lg); E('stop', { offset: 1, 'stop-color': C.g40 }, lg);
    E('path', { d: 'M' + bx0 + ' 34 H' + (bx1 - 16) + ' L' + bx1 + ' 48 L' + (bx1 - 16) + ' 62 H' + bx0 + ' Z', fill: 'url(#' + gid + ')' }, g);
    T(svg, bx0 + 16, 53.5, tm.from || '', { 'font-size': 15, 'font-weight': 700, fill: C.dark, 'data-at': t0 + 200, 'data-fx': 'fade' }); var w1 = h.textW(tm.to || '', 15, 1);
    T(svg, bx1 - 28, 53.5, tm.to || '', { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: C.dark, 'data-at': t0 + 500, 'data-fx': 'fade' });
    var la = bx0 + 30 + h.textW(tm.from || '', 15, 1), lb = bx1 - 42 - w1;
    E('line', { x1: la, x2: lb - 8, y1: 48, y2: 48, stroke: C.g65, 'stroke-width': 1.5, 'data-at': t0 + 300, 'data-fx': 'draw', 'data-ms': 500 }, svg); K.head(svg, lb, 48, 0, C.g65, 9, { 'data-at': t0 + 750, 'data-fx': 'fade' }) }
  var NC = s.cols || Math.max.apply(null, nodes.map(function (n) { return n.col || 0 }).concat([0])) + 1, NR = Math.max.apply(null, nodes.map(function (n) { return n.row || 0 }).concat([0])) + 1;
  var gT = tm ? 122 : 60, gB = FH - 18, cw = (FW - 44) / NC, nw = Math.min(190, cw - 34), nh = 54, M = {};
  nodes.forEach(function (n, i) { var cx = X0 + 22 + (n.col + .5) * cw, cy = NR === 1 ? (gT + gB) / 2 : gT + nh / 2 + 4 + (n.row || 0) * (gB - gT - nh - 8) / (NR - 1);
    M[n.id] = { cx: cx, cy: cy, w: nw, h: nh, n: n };
    K.D(bd, 'kx k-fn ' + (n.tone || 'soft'), cx - nw / 2, cy - nh / 2, nw, nh, '<b>' + h.esc(n.label || '') + '</b>' + (n.sub ? '<span>' + h.esc(n.sub) + '</span>' : ''), { 'data-at': 560 + i * 60, 'data-fx': 'pop', 'data-ms': 340 }) });
  var top = K.svg(ctx), par = {}, tE0 = 620 + nodes.length * 60 + 140, PER = 400, rides = [];
  edges.forEach(function (e, i) { var k = [e.from, e.to].sort().join('|'); (par[k] = par[k] || []).push(i) });
  edges.forEach(function (e, i) { var A = M[e.from], B = M[e.to]; if (!A || !B) return; var col = h.col(e.tone || 'main'), grp = par[[e.from, e.to].sort().join('|')], off = grp.length > 1 ? (grp.indexOf(i) === 0 ? -1 : 1) * 17 : 0;
    var d, hx, hy, ha, lx, ly, an = 'middle', tE = tE0 + i * PER;
    if (Math.abs(A.cx - B.cx) < 2) { var x = A.cx + off, dn = B.cy > A.cy, y1 = dn ? A.cy + A.h / 2 + 3 : A.cy - A.h / 2 - 3, y2 = dn ? B.cy - B.h / 2 - 3 : B.cy + B.h / 2 + 3;
      d = 'M' + x + ' ' + y1 + ' V' + (y2 + (dn ? -9 : 9)); hx = x; hy = y2; ha = dn ? Math.PI / 2 : -Math.PI / 2; lx = x + (off < 0 ? -9 : 9); ly = (y1 + y2) / 2 + 5; an = off < 0 ? 'end' : 'start' }
    else if (e.curve) { var dir = B.cx > A.cx ? 1 : -1, up = e.curve !== 'down', sx = A.cx + dir * A.w * .2, ex = B.cx - dir * B.w * .2, sy = up ? A.cy - A.h / 2 - 3 : A.cy + A.h / 2 + 3, ey = up ? B.cy - B.h / 2 - 3 : B.cy + B.h / 2 + 3, bump = up ? -46 : 46;
      d = 'M' + sx + ' ' + sy + ' C ' + sx + ' ' + (sy + bump) + ', ' + ex + ' ' + (ey + bump) + ', ' + ex + ' ' + (ey + (up ? -8 : 8)); hx = ex; hy = ey; ha = up ? Math.PI / 2 : -Math.PI / 2; lx = (sx + ex) / 2; ly = (sy + ey) / 2 + bump * .75 + 5 }
    else { var rt = B.cx > A.cx, yy = A.cy + off, xa = rt ? A.cx + A.w / 2 + 3 : A.cx - A.w / 2 - 3, xb = rt ? B.cx - B.w / 2 - 3 : B.cx + B.w / 2 + 3;
      d = 'M' + xa + ' ' + yy + ' H' + (xb + (rt ? -9 : 9)); hx = xb; hy = yy; ha = rt ? 0 : Math.PI; lx = (xa + xb) / 2; ly = yy + (off > 0 ? 24 : -10) }
    var p = E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 2.4, 'data-at': tE, 'data-fx': 'draw', 'data-ms': 380 }, top);
    K.head(top, hx, hy, ha, col, 10, { 'data-at': tE + 340, 'data-fx': 'fade', 'data-ms': 140 });
    if (e.token) { var tw = h.textW(e.token, 13, 1) + 18, rx = an === 'end' ? lx - tw : an === 'start' ? lx : lx - tw / 2, pg = E('g', { 'data-at': tE + 360, 'data-fx': 'pop', 'data-ms': 280 }, top);
      E('rect', { x: rx, y: ly - 16, width: tw, height: 23, rx: 11.5, fill: col }, pg); T(pg, rx + tw / 2, ly, e.token, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) }
    var dot = E('circle', { r: 7, fill: col, stroke: '#fff', 'stroke-width': 2, style: 'display:none' }, top); rides.push([p, dot, tE]) });
  var tEnd = tE0 + edges.length * PER - 100;
  if (ty) { K.D(bd, 'kx k-fw', X0, FH + 14, FW, tyH, '<span class="k-tab">' + h.esc(ty.title || '종류') + '</span><div class="k-fty">' + (ty.items || []).map(function (it) { return '<div class="k-ftr"><i>' + h.esc(it.name || '') + '</i><span>' + h.md(it.text || '') + '</span></div>' }).join('') + '</div>',
    { 'data-at': tEnd, 'data-fx': 'rise', 'data-ms': 420 }) }
  root._hook = function (r) { rides.forEach(function (q) { h.later(r, function () { var L = q[0].getTotalLength(), t0 = null; q[1].style.display = '';
      function f(ts) { if (t0 === null) t0 = ts; var u = Math.min(1, (ts - t0) / 380), pt = q[0].getPointAtLength(L * (1 - Math.pow(1 - u, 2))); q[1].setAttribute('cx', pt.x); q[1].setAttribute('cy', pt.y); if (u < 1) r._raf.push(requestAnimationFrame(f)); else q[1].style.display = 'none' }
      r._raf.push(requestAnimationFrame(f)) }, q[2]) }); return tEnd + 420 };
  root._reset = function () { rides.forEach(function (q) { q[1].style.display = 'none' }) } };

/* twoway 두 갈래 : 같은 일이 두 길로 갈라져 색별로 따로 흐름. 두 칸(왼 · 오른) 안에 이름 띠 · 설명 · 단계 상자(3열 줄바꿈 화살) · 끝 숫자, 아래에 차이 한 줄
   branches[2]{name,desc,tone:main|warn,steps[3~6]{title,sub},out{label,value}} · diff{label,text} */
function twoway(bd, s, ctx) {
  var P = ctx.P, svg = K.svg(ctx), br = (s.branches || []).slice(0, 2), ws = ctx.dark ? P.bg : '#fff', PW = 568, PH = 408, T0 = 300;
  br.forEach(function (b, k) {
    var x0 = k ? 600 : 0, col = b.tone === 'warn' ? P.warn : P.main, st = (b.steps || []).slice(0, 6), n = st.length, rows = n > 3 ? 2 : 1, bw = 152, bh = rows === 2 ? 92 : 112, gp = (PW - 48 - 3 * bw) / 2;
    var t0 = T0 + k * 1250, g = E('g', { 'data-key': b.name || '', 'data-at': t0, 'data-fx': 'rise', 'data-ms': 420 }, svg);
    E('rect', { x: x0, y: 0, width: PW, height: PH, rx: 16, fill: P.paper, stroke: P.line }, g);
    var pw = h.textW(b.name || '', 18, 1) + 36; E('rect', { x: x0 + 24, y: 22, width: pw, height: 40, rx: 20, fill: col }, g); T(g, x0 + 24 + pw / 2, 48, b.name || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: ws });
    h.wrap(b.desc || '', 15, PW - 48, 1).slice(0, 2).forEach(function (l, j) { T(g, x0 + 24, 90 + j * 21, l, { 'font-size': 15, 'font-weight': 600, fill: P.ink }) });
    var y1 = rows === 2 ? 126 : 176, y2 = y1 + bh + 38, pos = st.map(function (_, i) { var r = i < 3 ? 0 : 1, c = i % 3; return [x0 + 24 + c * (bw + gp), r ? y2 : y1] });
    st.forEach(function (q, i) { var p = pos[i], tt = t0 + 360 + i * 170, bg = E('g', { 'data-at': tt, 'data-fx': 'pop', 'data-ms': 300 }, svg);
      E('rect', { x: p[0], y: p[1], width: bw, height: bh, rx: 10, fill: ctx.dark ? P.well : '#fff', stroke: col, 'stroke-width': 2 }, bg);
      E('circle', { cx: p[0] + 17, cy: p[1] + 18, r: 11, fill: col }, bg); T(bg, p[0] + 17, p[1] + 22.5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 800, fill: ws });
      var tl = h.wrap(q.title || '', 16, bw - 20, 1).slice(0, 2); tl.forEach(function (l, j) { T(bg, p[0] + 10, p[1] + 50 + j * 19, l, { 'font-size': 16, 'font-weight': 700, fill: P.ink }) });
      if (q.sub) h.wrap(q.sub, 13, bw - 20).slice(0, rows === 2 ? 1 : 3).forEach(function (l, j) { T(bg, p[0] + 10, p[1] + 50 + tl.length * 19 + 2 + j * 17, l, { 'font-size': 13, fill: P.sub }) });
      if (i) { var pa = pos[i - 1], d, hx, hy, ha, sameRow = pa[1] === p[1];
        if (sameRow) { var ya = p[1] + bh / 2; d = 'M' + (pa[0] + bw + 3) + ' ' + ya + ' H' + (p[0] - 12); hx = p[0] - 2; hy = ya; ha = 0 }
        else { var xa = pa[0] + bw / 2, xb = p[0] + bw / 2, ym = pa[1] + bh + 23; d = 'M' + xa + ' ' + (pa[1] + bh + 3) + ' V' + ym + ' H' + xb + ' V' + (p[1] - 12); hx = xb; hy = p[1] - 2; ha = Math.PI / 2 }
        E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-at': tt - 130, 'data-fx': 'draw', 'data-ms': 220 }, svg);
        K.head(svg, hx, hy, ha, col, 11, { 'data-at': tt + 60, 'data-fx': 'fade', 'data-ms': 120 }) } });
    if (b.out) { var og = E('g', { 'data-at': t0 + 360 + n * 170 + 100, 'data-fx': 'fade', 'data-ms': 360 }, svg);
      E('line', { x1: x0 + 24, x2: x0 + PW - 24, y1: PH - 54, y2: PH - 54, stroke: P.line }, og);
      T(og, x0 + 24, PH - 18, b.out.label || '', { 'font-size': 14, fill: P.sub }); T(og, x0 + PW - 24, PH - 16, b.out.value || '', { 'text-anchor': 'end', 'font-size': 28, 'font-weight': 800, fill: col }) } });
  var df = s.diff; if (df) { var dg = E('g', { 'data-at': T0 + 2900, 'data-fx': 'rise', 'data-ms': 450, 'data-key': df.label || '차이' }, svg);
    E('rect', { x: 0, y: 424, width: 1168, height: 88, rx: 14, fill: ctx.dark ? P.main : P.dark }, dg);
    var dw = h.textW(df.label || '', 15, 1) + 32; E('rect', { x: 24, y: 448, width: dw, height: 38, rx: 19, fill: ws }, dg); T(dg, 24 + dw / 2, 472, df.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ctx.dark ? P.main : P.dark });
    h.wrap(df.text || '', 17, 1168 - dw - 90, 1).slice(0, 2).forEach(function (l, j, a) { T(dg, 52 + dw, (a.length > 1 ? 460 : 473) + j * 24, l, { 'font-size': 17, 'font-weight': 700, fill: ws }) }) }
  ctx.root.setAttribute('data-gap', 300) }

/* choke 병목 : 단계 문(막대 높이 = 값) 사이를 띠가 이어주고, 가장 크게 줄어든 구간 띠만 경고색 + 말풍선
   stages[4~6]{name,value,dec,unit,text} · choke(줄어든 구간의 앞 단계 번호, 없으면 자동) · callout{title,text} · legend{ok,bad} 두 문장 */
function choke(bd, s, ctx) {
  var P = ctx.P, svg = K.svg(ctx), st = (s.stages || []).slice(0, 6), n = st.length, ws = ctx.dark ? P.bg : '#fff', BW = 30, cy = 214, MX = 236, PAD = 66;
  if (n < 3) return;
  var vals = st.map(function (q) { return +q.value || 0 }), mx = Math.max.apply(null, vals), bi = s.choke;
  if (bi == null) { var bestR = -1; for (var i = 0; i < n - 1; i++) { var dr = vals[i] ? (vals[i] - vals[i + 1]) / vals[i] : 0; if (dr > bestR) { bestR = dr; bi = i } } }
  var hs = vals.map(function (v) { return Math.max(26, MX * v / mx) }), xs = st.map(function (_, i) { return PAD + i * (1168 - 2 * PAD) / (n - 1) }), sp = (1168 - 2 * PAD) / (n - 1);
  for (var k = 0; k < n - 1; k++) { var t = 300 + k * 520, bad = k === bi, xa = xs[k] + BW / 2, xb = xs[k + 1] - BW / 2, mxm = (xa + xb) / 2, ya0 = cy - hs[k] / 2, ya1 = cy + hs[k] / 2, yb0 = cy - hs[k + 1] / 2, yb1 = cy + hs[k + 1] / 2;
    var d = 'M' + xa + ' ' + ya0 + ' C' + mxm + ' ' + ya0 + ' ' + mxm + ' ' + yb0 + ' ' + xb + ' ' + yb0 + ' L' + xb + ' ' + yb1 + ' C' + mxm + ' ' + yb1 + ' ' + mxm + ' ' + ya1 + ' ' + xa + ' ' + ya1 + ' Z';
    var g = E('g', { 'data-at': t + 160, 'data-fx': 'growx', 'data-ms': 420, 'data-key': (st[k].name || '') + ' → ' + (st[k + 1].name || '') }, svg);
    E('path', { d: d, fill: bad ? P.warn : P.g18 }, g);
    var ax = mxm + 14, ay = cy; K.head(g, ax, ay, 0, bad ? ws : P.g65, 18, {}); E('line', { x1: mxm - 24, x2: ax - 12, y1: ay, y2: ay, stroke: bad ? ws : P.g65, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    if (bad) { var pct = vals[k] ? Math.round((vals[k] - vals[k + 1]) / vals[k] * 100) : 0, lab = '−' + pct + '%', lw = h.textW(lab, 15, 1) + 18; var pg = E('g', { 'data-at': t + 520, 'data-fx': 'pop', 'data-ms': 300 }, svg);
      E('rect', { x: mxm - lw / 2, y: cy + Math.max(hs[k], hs[k + 1]) / 2 + 8, width: lw, height: 26, rx: 13, fill: P.warn }, pg); T(pg, mxm, cy + Math.max(hs[k], hs[k + 1]) / 2 + 26, lab, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: ws }) } }
  st.forEach(function (q, i) { var t = 300 + i * 520 - 200, g = E('g', { 'data-at': Math.max(0, t), 'data-fx': 'pop', 'data-ms': 320, 'data-key': q.name || '' }, svg), x = xs[i], bad = i === bi + 1;
    E('rect', { x: x - BW / 2, y: cy - hs[i] / 2, width: BW, height: hs[i], rx: 6, fill: bad ? P.warn : P.main }, g);
    var cw = Math.min(176, sp - 14), nm = h.wrap(q.name || '', 16, cw, 1).slice(0, 2), y0 = 386; nm.forEach(function (l, j) { T(g, x, y0 + j * 18, l, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: P.ink }) });
    var vy = y0 + (nm.length - 1) * 18 + 30; T(g, x, vy, h.nf(q.value, q.dec || 0) + (q.unit || ''), { 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 800, fill: bad ? P.warn : P.dark });
    if (q.text) h.wrap(q.text, 12.5, cw).slice(0, 2).forEach(function (l, j) { T(g, x, vy + 20 + j * 16, l, { 'text-anchor': 'middle', 'font-size': 12.5, fill: P.sub }) }) });
  var co = s.callout; if (co) { var tx = (xs[bi] + xs[bi + 1]) / 2, cw2 = 330, cx0 = Math.max(4, Math.min(1168 - cw2 - 4, tx - cw2 / 2)), cl = h.wrap(co.text || '', 13.5, cw2 - 28).slice(0, 2), chh = 40 + cl.length * 18, cg = E('g', { 'data-at': 300 + (bi + 1) * 520 + 300, 'data-fx': 'drop', 'data-ms': 380, 'data-key': co.title || '병목' }, svg);
    E('rect', { x: cx0, y: 6, width: cw2, height: chh, rx: 12, fill: ctx.dark ? P.warnsoft : '#fff', stroke: P.warn, 'stroke-width': 2 }, cg); T(cg, cx0 + 16, 30, co.title || '', { 'font-size': 16, 'font-weight': 800, fill: P.warn });
    cl.forEach(function (l, j) { T(cg, cx0 + 16, 50 + j * 18, l, { 'font-size': 13.5, fill: P.ink }) });
    E('path', { d: 'M' + tx + ' ' + (6 + chh) + ' V' + (cy - Math.max(hs[bi], hs[bi + 1]) / 2 - 4), stroke: P.warn, 'stroke-width': 2, 'stroke-dasharray': '4 4', fill: 'none' }, cg) }
  var lg = E('g', {}, svg), lx = 4, lgd = s.legend || {}; E('rect', { x: lx, y: 488, width: 22, height: 14, rx: 3, fill: P.g18 }, lg); T(lg, lx + 30, 500, lgd.ok || '초록 띠 = 다음 단계로 넘어간 양', { 'font-size': 12.5, fill: P.sub });
  var lx2 = lx + 44 + h.textW(lgd.ok || '초록 띠 = 다음 단계로 넘어간 양', 12.5, 0); E('rect', { x: lx2, y: 488, width: 22, height: 14, rx: 3, fill: P.warn }, lg); T(lg, lx2 + 30, 500, lgd.bad || '주황 띠 = 가장 크게 줄어든 구간(병목)', { 'font-size': 12.5, fill: P.sub });
  ctx.root.setAttribute('data-gap', 300) }
ECOM.parts.flow = function (bd, s, ctx) { return s.layout === 'twoway' ? twoway(bd, s, ctx) : s.layout === 'choke' ? choke(bd, s, ctx) : baseFlow(bd, s, ctx) };
ECOM.parts.flow.layouts = ['default', 'twoway', 'choke'];
ECOM.parts.flow.dark = ['twoway', 'choke'];
})();
