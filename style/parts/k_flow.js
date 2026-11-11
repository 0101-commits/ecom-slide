/* flow — 거래 흐름(CW44 12쪽) : (왼쪽 정의 판) → 시간 띠(거래일 → 만기일) → 주체 상자 → 화살이 차례로 그려지며 통화 표가 화살을 따라 이동 → 아래 종류 판
   side{title,rows:[{k,v}],concl} · tab('구조') · time{from,to} · nodes[{id,label,sub,col,row,tone:'soft|dark|gray|main'}]
   edges[{from,to,token,tone:'main|cmp',curve:'up|down'}](같은 두 상자 사이 화살 둘은 나란히) · types{title,items:[{name,text}]} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
ECOM.parts.flow = function (bd, s, ctx) {
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
})();
