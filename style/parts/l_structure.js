/* structure — 주체 관계 구조도 : 가운데 짙은 상자 + 둘레 주체 상자(자리 자동) + 연결선 3종(돈 = 초록 실선 · 일 · 비용 = 회색 실선 · 보증 = 점선) + 선 위 짧은 이름
   center{title,sub} · nodes[3~6]{id,title,sub,tone:'dark|soft'} — 자리 차례 = 왼위 · 오른위 · 오른아래 · 왼아래 · (5번째) 위 가운데 · (6번째) 아래 가운데 (3개면 왼위 · 오른위 · 아래 가운데)
   edges[{from,to,kind:'money|work|guarantee',text}](from · to = 상자 id, 가운데는 'center') · legend{money,work,guarantee}(범례 글 바꾸기)
   order{title,warnFrom,items:[{t,s}]}(오른쪽 「번지는 순서」 번호 목록, 선택) · 지분 구조도 = 상자에 col · row(0부터) 주면 격자 자리, center 없이 써도 됨 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size }
var KIND = { money: { col: C.main, dash: '', lab: '돈' }, work: { col: C.cmp, dash: '', lab: '일 · 비용' }, guarantee: { col: C.cmp, dash: '7 5', lab: '보증' } };
var SLOT = { 3: [['L', 110], ['R', 110], ['M', 392]], 4: [['L', 110], ['R', 110], ['R', 380], ['L', 380]],
  5: [['L', 168], ['R', 168], ['R', 372], ['L', 372], ['M', 40]], 6: [['L', 168], ['R', 168], ['R', 372], ['L', 372], ['M', 40], ['M', 440]], 2: [['L', 240], ['R', 240]], 1: [['M', 60]] };
ECOM.parts.structure = function (bd, s, ctx) {
  var nodes = (s.nodes || []).slice(0, 8), ct = s.center || null, od = s.order || null, links = s.edges || [], svg = ctx.svg(512);
  var Wd = od ? 836 : 1168, grid = nodes.some(function (n) { return n.col != null }), M = {}, NW = 200, NH = 68, CW = 210, CH = 92;
  if (ct && !grid) M.center = { cx: Wd / 2, cy: 244, w: CW, h: CH, n: ct, c: 1 };
  else if (ct && ct.col != null) { }
  if (grid) {
    var all = nodes.slice(); if (ct && ct.col != null) { all.push(Object.assign({ id: 'center' }, ct)); }
    var NC = Math.max.apply(null, all.map(function (n) { return n.col || 0 })) + 1, NR = Math.max.apply(null, all.map(function (n) { return n.row || 0 })) + 1, cw = Wd / NC, nw = Math.min(210, cw - 40), nh = 64, gT = 34, gB = 440;
    all.forEach(function (n, i) { var id = n.id != null ? n.id : String(i); M[id] = { cx: (n.col + .5) * cw, cy: NR === 1 ? (gT + gB) / 2 : gT + nh / 2 + (n.row || 0) * (gB - gT - nh) / (NR - 1), w: nw, h: nh, n: n, c: n.id === 'center' || n.tone === 'dark' ? 1 : 0 } });
  } else {
    var sl = SLOT[Math.min(6, Math.max(1, nodes.length))] || [], lx = NW / 2 + (Wd > 1000 ? 70 : 10), rx = Wd - NW / 2 - (Wd > 1000 ? 70 : 10);
    nodes.slice(0, 6).forEach(function (n, i) { var p = sl[i] || ['M', 440], id = n.id != null ? n.id : String(i);
      M[id] = { cx: p[0] === 'L' ? lx : p[0] === 'R' ? rx : Wd / 2, cy: p[1], w: NW, h: NH, n: n, c: n.tone === 'dark' ? 1 : 0 } });
  }
  var ids = Object.keys(M), t = 0;
  ids.forEach(function (id, i) { var o = M[id], n = o.n, g = h.at(svg, id === 'center' ? 0 : 280 + i * 110, { 'data-fx': 'pop', 'data-ms': 340 }), dark = o.c, mw = o.w - 24;
    E('rect', { x: o.cx - o.w / 2, y: o.cy - o.h / 2, width: o.w, height: o.h, rx: id === 'center' ? 14 : 12, fill: dark ? C.dark : '#fff', stroke: dark ? 'none' : C.main, 'stroke-width': 2 }, g);
    T(g, o.cx, o.cy - (n.sub ? 5 : -6), n.title || '', { 'text-anchor': 'middle', 'font-size': fit(n.title || '', id === 'center' ? 19 : 17, mw, 1, 13), 'font-weight': 700, fill: dark ? '#fff' : C.ink });
    if (n.sub) T(g, o.cx, o.cy + (id === 'center' ? 21 : 18), n.sub, { 'text-anchor': 'middle', 'font-size': fit(n.sub, id === 'center' ? 13.5 : 12.5, mw, 0, 11.5), 'font-weight': dark ? 500 : 400, fill: dark ? C.g18 : C.mute }) });
  /* 연결선 : 같은 두 상자 사이는 나란히 */
  var grp = {}; links.forEach(function (l, i) { var k = [l.from, l.to].sort().join('|'); (grp[k] = grp[k] || []).push(i) });
  function clip(o, dx, dy) { var tx = dx ? (o.w / 2) / Math.abs(dx) : 1e9, ty = dy ? (o.h / 2) / Math.abs(dy) : 1e9; return Math.min(tx, ty) }
  var used = {}, T0 = 300 + ids.length * 110 + 200;
  links.forEach(function (l, i) { var A = M[l.from], B = M[l.to]; if (!A || !B) return; var kd = KIND[l.kind] || KIND.work; used[l.kind in KIND ? l.kind : 'work'] = 1;
    var gp = grp[[l.from, l.to].sort().join('|')], k = gp.indexOf(i), cnt = gp.length, off = cnt > 1 ? (k - (cnt - 1) / 2) * 20 : 0, sgn = cnt > 1 ? (k - (cnt - 1) / 2 < 0 ? 1 : -1) : 1;
    var dx = B.cx - A.cx, dy = B.cy - A.cy, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux; if (ny > 0 || (Math.abs(ny) < .01 && nx < 0)) { nx = -nx; ny = -ny }
    /* off 의 방향 = (nx,ny) 기준, 먼저 그리는 쪽이 위 */
    var ax = A.cx + nx * off * -1, ay = A.cy + ny * off * -1, bx = B.cx + nx * off * -1, by = B.cy + ny * off * -1;
    var ta = clip(A, bx - ax, by - ay) * Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)), tb = clip(B, bx - ax, by - ay) * Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)), L2 = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2)) || 1, vx = (bx - ax) / L2, vy = (by - ay) / L2;
    var x1 = ax + vx * (ta + 3), y1 = ay + vy * (ta + 3), x2 = bx - vx * (tb + 3), y2 = by - vy * (tb + 3), te = T0 + i * 330, dashed = !!kd.dash;
    var ln = E('line', { x1: x1, y1: y1, x2: x2 - vx * 9, y2: y2 - vy * 9, stroke: kd.col, 'stroke-width': 3, 'stroke-dasharray': kd.dash || null, 'stroke-linecap': 'round', 'data-at': te, 'data-fx': dashed ? 'fade' : 'draw', 'data-ms': 420 }, svg);
    var g = h.at(svg, te + 360, { 'data-fx': 'fade' }), ang = Math.atan2(vy, vx), px = -Math.sin(ang), py = Math.cos(ang);
    E('path', { d: 'M' + x2 + ' ' + y2 + ' L' + (x2 - vx * 11 + px * 5.5) + ' ' + (y2 - vy * 11 + py * 5.5) + ' L' + (x2 - vx * 11 - px * 5.5) + ' ' + (y2 - vy * 11 - py * 5.5) + ' Z', fill: kd.col }, g);
    if (l.text) { var mxx = (x1 + x2) / 2, myy = (y1 + y2) / 2, side = cnt > 1 ? (k - (cnt - 1) / 2 < 0 ? 1 : -1) : 1, vert = Math.abs(nx) > .8, d = 12;
      var hx = mxx + nx * d * side * (vert ? 1.2 : 1), hy = myy + ny * d * side + (vert ? 4 : (side > 0 ? 0 : 12)), an = vert ? (nx * side > 0 ? 'start' : 'end') : 'middle'; if (vert) { hx = mxx + nx * side * 9 }
      T(g, hx, hy, l.text, { 'text-anchor': an, 'font-size': 12.5, 'font-weight': 700, fill: kd.col, stroke: '#fff', 'stroke-width': 3.5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }) } });
  /* 범례 */
  var gk = h.at(svg, 300, { 'data-fx': 'fade' }), lg = s.legend || {}, lx0 = 0, ky = ['money', 'work', 'guarantee'].filter(function (k) { return used[k] });
  ky.forEach(function (k) { var kd = KIND[k], lab = lg[k] || kd.lab; E('line', { x1: lx0, x2: lx0 + 30, y1: 500, y2: 500, stroke: kd.col, 'stroke-width': 3, 'stroke-dasharray': kd.dash || null }, gk);
    T(gk, lx0 + 38, 505, lab, { 'font-size': 12.5, 'font-weight': 600, fill: C.mute }); lx0 += 38 + h.textW(lab, 12.5, 1) + 28 });
  /* 번지는 순서 */
  if (od) { var ox = Wd + 30, ow = 1168 - ox, its = (od.items || []).slice(0, 5), go = h.at(svg, 1500, { 'data-fx': 'fade' }), ih = Math.min(98, 398 / Math.max(1, its.length)), wf = od.warnFrom != null ? od.warnFrom : its.length;
    E('rect', { x: ox, y: 0, width: ow, height: 478, rx: 14, fill: C.paper }, go);
    T(go, ox + 22, 36, od.title || '', { 'font-size': 16, 'font-weight': 700, fill: C.warn });
    its.forEach(function (it, i) { var y = 84 + i * ih, gi = h.at(svg, 1600 + i * 180, { 'data-fx': 'fade' }), tw = ow - 58 - 14;
      if (i < its.length - 1) E('line', { x1: ox + 34, x2: ox + 34, y1: y + 18, y2: y + ih - 14, stroke: C.gray, 'stroke-width': 2 }, gi);
      E('circle', { cx: ox + 34, cy: y + 2, r: 14, fill: i >= wf ? C.warn : C.cmp }, gi); T(gi, ox + 34, y + 7, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
      var tl = h.wrap(it.t || '', 14.5, tw, 1).slice(0, 2), ty = y + 2; tl.forEach(function (q, j) { T(gi, ox + 58, ty + j * 19, q, { 'font-size': 14.5, 'font-weight': 700, fill: C.ink }) });
      var sy = ty + (tl.length - 1) * 19 + 21; h.wrap(it.s || '', 12.5, tw, 0).slice(0, 2).forEach(function (q, j) { T(gi, ox + 58, sy + j * 17, q, { 'font-size': 12.5, fill: C.mute }) }) }) }
};
})();
