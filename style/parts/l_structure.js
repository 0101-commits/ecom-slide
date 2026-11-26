/* structure — 주체 관계 구조도 : 가운데 짙은 상자 + 둘레 주체 상자(자리 자동) + 연결선 3종(돈 = 초록 실선 · 일 · 비용 = 회색 실선 · 보증 = 점선) + 선 위 짧은 이름
   center{title,sub} · nodes[3~6]{id,title,sub,tone:'dark|soft'} — 자리 차례 = 왼위 · 오른위 · 오른아래 · 왼아래 · (5번째) 위 가운데 · (6번째) 아래 가운데 (3개면 왼위 · 오른위 · 아래 가운데)
   edges[{from,to,kind:'money|work|guarantee',text}](from · to = 상자 id, 가운데는 'center') · legend{money,work,guarantee}(범례 글 바꾸기)
   order{title,warnFrom,items:[{t,s}]}(오른쪽 「번지는 순서」 번호 목록, 선택) · 지분 구조도 = 상자에 col · row(0부터) 주면 격자 자리, center 없이 써도 됨
   layout(없으면 default = 위 그림) : hier 위아래 계층(center 가 맨 위, 꺾인 선 · order 가능) · trade 좌우 거래 흐름(주체 좌우 줄 + 가운데 큰 상자, 선 종류별 색 · 모양 + 범례 · order 가능)
     · matrix 주체 × 역할 행렬(행 = 주체, 열 = 돈 · 일 · 보증 × 보냄/받음, order 는 안 그림). 같은 칸만 씀(선택 칸 없음). 짙은 바탕(bg deep) 가능 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size }
var KIND = { money: { col: C.main, dash: '', lab: '돈' }, work: { col: C.cmp, dash: '', lab: '일 · 비용' }, guarantee: { col: C.cmp, dash: '7 5', lab: '보증' } };
var SLOT = { 3: [['L', 110], ['R', 110], ['M', 392]], 4: [['L', 110], ['R', 110], ['R', 380], ['L', 380]],
  5: [['L', 168], ['R', 168], ['R', 372], ['L', 372], ['M', 40]], 6: [['L', 168], ['R', 168], ['R', 372], ['L', 372], ['M', 40], ['M', 440]], 2: [['L', 240], ['R', 240]], 1: [['M', 60]] };
var baseStructure = function (bd, s, ctx) {
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
/* ───────── 새 배치 3종 (s.layout) ───────── */
function mz(it, k, w) { var sz = Math.max(it.min || 12.5, Math.round(it.size * k * 2) / 2), ls = h.wrap(String(it.s == null ? '' : it.s), sz, w, it.bold ? 1 : 0); return { sz: sz, ls: ls, h: ls.length * sz * 1.36 + (it.gap || 0), it: it } }
function stk(g, x, y, w, mh, items, va, an) {
  items = items.filter(function (it) { return it.s }); var k = 1, ms = [], tot = 0;
  for (; ;) { ms = items.map(function (it) { return mz(it, k, w) }); tot = ms.reduce(function (a, m) { return a + m.h }, 0) - (ms[0] ? ms[0].it.gap || 0 : 0); if (tot <= mh || k <= .72) break; k -= .04 }
  var yy = va === 'mid' ? y + (mh - tot) / 2 : va === 'bot' ? y + mh - tot : y;
  ms.forEach(function (m, i) { if (i) yy += m.it.gap || 0; m.ls.forEach(function (l, j) { T(g, x, yy + m.sz * .95 + j * m.sz * 1.36, l, { 'text-anchor': an || 'start', 'font-size': m.sz, 'font-weight': m.it.bold ? 700 : 400, fill: m.it.fill }) }); yy += m.ls.length * m.sz * 1.36 });
  return tot }
var NEW = {};
function kinds(P) { return { money: { col: P.main, w: 3, dash: '', lab: '돈' }, work: { col: P.cmp, w: 1.5, dash: '', lab: '일 · 비용' }, guarantee: { col: P.cmp, w: 1.5, dash: '7 5', lab: '보증' } } }
function collect(s) { var a = [], ct = s.center || null; if (ct) a.push({ id: 'center', n: ct, c: 1 });
  (s.nodes || []).slice(0, 8).forEach(function (n, i) { a.push({ id: n.id != null ? n.id : String(i), n: n, c: n.tone === 'dark' ? 1 : 0 }) }); return a }
function drawBox(svg, o, cx, cy, w, hh, at, ctx, big) { var P = ctx.P, dk = ctx.dark, n = o.n, g = h.at(svg, at, { 'data-fx': 'pop', 'data-ms': 340, 'data-key': n.title || '' }), c = o.c, mw = w - 24;
  E('rect', { x: cx - w / 2, y: cy - hh / 2, width: w, height: hh, rx: 12, fill: c ? (dk ? P.main : P.dark) : (dk ? P.well : '#fff'), stroke: c ? 'none' : P.main, 'stroke-width': 2 }, g);
  var tc = c ? (dk ? P.bg : '#fff') : P.ink, sc = c ? (dk ? P.bg : P.g18) : P.mute;
  T(g, cx, cy - (n.sub ? (big ? 7 : 5) : -6), n.title || '', { 'text-anchor': 'middle', 'font-size': fit(n.title || '', o.id === 'center' ? (big ? 22 : 19) : (big ? 20 : 17), mw, 1, 13), 'font-weight': 700, fill: tc });
  if (n.sub) T(g, cx, cy + (big ? 22 : 18), n.sub, { 'text-anchor': 'middle', 'font-size': fit(n.sub, big ? 14 : 12.5, mw, 0, 11.5), fill: sc });
  return g }
function arrowTip(p, x, y, ux, uy, col, sz, at) { var px = -uy, py = ux, hw = sz * .52; return E('path', { d: 'M' + x + ' ' + y + ' L' + (x - ux * sz + px * hw) + ' ' + (y - uy * sz + py * hw) + ' L' + (x - ux * sz - px * hw) + ' ' + (y - uy * sz - py * hw) + ' Z', fill: col, 'data-at': at, 'data-fx': 'fade', 'data-ms': 200 }, p) }
function elabel(p, x, y, txt, col, an, ctx) { return T(p, x, y, txt, { 'text-anchor': an || 'middle', 'font-size': 12.5, 'font-weight': 700, fill: col, stroke: ctx.dark ? ctx.P.bg : '#fff', 'stroke-width': 3.5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }) }
function legendK(svg, used, lg, ctx) { var P = ctx.P, K2 = kinds(P), gk = h.at(svg, 300, { 'data-fx': 'fade' }), x0 = 0;
  ['money', 'work', 'guarantee'].filter(function (k) { return used[k] }).forEach(function (k) { var kd = K2[k], lab = lg[k] || kd.lab;
    E('line', { x1: x0, x2: x0 + 30, y1: 500, y2: 500, stroke: kd.col, 'stroke-width': kd.w, 'stroke-dasharray': kd.dash || null }, gk); arrowTip(gk, x0 + 36, 500, 1, 0, kd.col, 9);
    T(gk, x0 + 46, 505, lab, { 'font-size': 12.5, 'font-weight': 600, fill: P.mute }); x0 += 46 + h.textW(lab, 12.5, 1) + 28 }) }
function orderPanel(svg, od, Wd, ctx) { var P = ctx.P, ox = Wd + 30, ow = 1168 - ox, its = (od.items || []).slice(0, 5), go = h.at(svg, 1500, { 'data-fx': 'fade' }), ih = Math.min(98, 398 / Math.max(1, its.length)), wf = od.warnFrom != null ? od.warnFrom : its.length, tc = ctx.dark ? P.bg : '#fff';
  E('rect', { x: ox, y: 0, width: ow, height: 478, rx: 14, fill: P.paper }, go); T(go, ox + 22, 36, od.title || '', { 'font-size': 16, 'font-weight': 700, fill: P.warn });
  its.forEach(function (it, i) { var y = 84 + i * ih, gi = h.at(svg, 1600 + i * 180, { 'data-fx': 'fade' }), tw = ow - 58 - 14;
    if (i < its.length - 1) E('line', { x1: ox + 34, x2: ox + 34, y1: y + 18, y2: y + ih - 14, stroke: P.gray, 'stroke-width': 2 }, gi);
    E('circle', { cx: ox + 34, cy: y + 2, r: 14, fill: i >= wf ? P.warn : P.cmp }, gi); T(gi, ox + 34, y + 7, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: tc });
    var tl = h.wrap(it.t || '', 14.5, tw, 1).slice(0, 2), ty = y + 2; tl.forEach(function (q, j) { T(gi, ox + 58, ty + j * 19, q, { 'font-size': 14.5, 'font-weight': 700, fill: P.ink }) });
    var sy = ty + (tl.length - 1) * 19 + 21; h.wrap(it.s || '', 12.5, tw, 0).slice(0, 2).forEach(function (q, j) { T(gi, ox + 58, sy + j * 17, q, { 'font-size': 12.5, fill: P.mute }) }) }) }

/* hier 위아래 계층 : 가운데(center)가 맨 위, 주체가 아래 줄. 위 → 아래 · 아래 → 위는 꺾인 선, 같은 줄끼리는 아래로 도는 선. 번지는 순서(order) 오른쪽 */
NEW.hier = function (bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), od = s.order || null, Wd = od ? 836 : 1168, A = collect(s), K2 = kinds(P), links = s.edges || [], NH = 74, M = {}, gridm = A.some(function (a) { return a.n.col != null }), rows = {}, used = {};
  A.forEach(function (a, i) { var r = gridm ? (a.n.row || 0) : (a.id === 'center' ? 0 : (s.center ? 1 : (i ? 1 : 0))); (rows[r] = rows[r] || []).push(a) });
  var rk = Object.keys(rows).map(Number).sort(function (a, b) { return a - b }), LV = rk.length, NC = gridm ? Math.max.apply(null, A.map(function (a) { return a.n.col || 0 })) + 1 : 0;
  rk.forEach(function (r, l) { var arr = rows[r], n = arr.length, y = LV > 1 ? 14 + l * (390 / (LV - 1)) : 200, cwd = Wd / (gridm ? NC : n);
    arr.forEach(function (a, i) { M[a.id] = { o: a, lv: l, cx: ((gridm ? a.n.col || 0 : i) + .5) * cwd, top: y, bot: y + NH, w: Math.min(250, cwd - 24), t: [], b: [] } }) });
  var ids = Object.keys(M); ids.forEach(function (id, i) { var o = M[id]; drawBox(svg, o.o, o.cx, o.top + NH / 2, o.w, NH, id === 'center' ? 0 : 200 + i * 100, ctx) });
  var T0 = 240 + ids.length * 100, E2 = [], gap = {}, same = {};
  links.forEach(function (l, i) { var A0 = M[l.from], B0 = M[l.to]; if (!A0 || !B0) return; used[l.kind in K2 ? l.kind : 'work'] = 1;
    var e = { l: l, i: i, A: A0, B: B0, kd: K2[l.kind] || K2.work, ty: A0.lv < B0.lv ? 'down' : A0.lv > B0.lv ? 'up' : 'same' }; E2.push(e);
    var sa = e.ty === 'down' || e.ty === 'same' ? 'b' : 't', sb = e.ty === 'down' ? 't' : 'b'; A0[sa].push({ e: e, o: B0.cx, k: 'oa' }); B0[sb].push({ e: e, o: A0.cx, k: 'ob' });
    if (e.ty === 'same') (same[A0.lv] = same[A0.lv] || []).push(e); else { var gk = Math.min(A0.lv, B0.lv); (gap[gk] = gap[gk] || []).push(e) } });
  ids.forEach(function (id) { var o = M[id]; ['t', 'b'].forEach(function (sd) { var lst = o[sd]; lst.sort(function (a, b) { return a.o - b.o }); var m = lst.length, pt = Math.min(24, (o.w - 28) / Math.max(1, m - 1));
    lst.forEach(function (q, i) { q.e[q.k] = m > 1 ? (i - (m - 1) / 2) * pt : 0 }) }) });
  E2.forEach(function (e, n) { var A0 = e.A, B0 = e.B, kd = e.kd, te = T0 + n * 320, g = E('g', { 'data-key': e.l.text || '' }, svg), up = e.ty === 'up', sx = A0.cx + e.oa, ex = B0.cx + e.ob, sy, ey, ym, d, tx, ty2, an = 'middle';
    if (e.ty === 'same') { var k = same[A0.lv].indexOf(e); sy = A0.bot; ey = B0.bot; ym = A0.bot + 22 + k * 20; d = 'M' + sx + ' ' + sy + ' V' + ym + ' H' + ex + ' V' + (ey + 10);
      var ln = E('path', { d: d, fill: 'none', stroke: kd.col, 'stroke-width': kd.w, 'stroke-dasharray': kd.dash || null, 'stroke-linejoin': 'round', 'data-at': te, 'data-fx': kd.dash ? 'fade' : 'draw', 'data-ms': 460 }, g); arrowTip(g, ex, ey + 1, 0, -1, kd.col, 12, te + 400);
      if (e.l.text) { var lt = h.at(g, te + 300, { 'data-fx': 'fade' }); elabel(lt, (sx + ex) / 2, ym + 16, e.l.text, kd.col, 'middle', ctx) } return }
    sy = up ? A0.top : A0.bot; ey = up ? B0.bot : B0.top; var gl = gap[Math.min(A0.lv, B0.lv)], kk = gl.indexOf(e), g0 = Math.min(sy, ey), gH = Math.abs(ey - sy); ym = g0 + gH * (kk + 1) / (gl.length + 1);
    var dir = up ? -1 : 1; d = 'M' + sx + ' ' + sy + ' V' + ym + ' H' + ex + ' V' + (ey - dir * 10);
    E('path', { d: d, fill: 'none', stroke: kd.col, 'stroke-width': kd.w, 'stroke-dasharray': kd.dash || null, 'stroke-linejoin': 'round', 'data-at': te, 'data-fx': kd.dash ? 'fade' : 'draw', 'data-ms': 460 }, g); arrowTip(g, ex, ey, 0, dir, kd.col, 12, te + 400);
    if (e.l.text) { var lt2 = h.at(g, te + 300, { 'data-fx': 'fade' }), tw = h.textW(e.l.text, 12.5, 1);
      if (Math.abs(ex - sx) > tw + 24) elabel(lt2, (sx + ex) / 2, ym - 8, e.l.text, kd.col, 'middle', ctx); else elabel(lt2, ex + 10, (ym + ey) / 2 + 4, e.l.text, kd.col, 'start', ctx) } });
  legendK(svg, used, s.legend || {}, ctx);
  if (od) orderPanel(svg, od, Wd, ctx) };

/* trade 좌우 거래 흐름 : 주체가 왼쪽 · 오른쪽 줄, 가운데(center)는 가운데 큰 상자. 선 = 돈(굵은 실선) · 일 · 비용(가는 실선) · 보증(점선) + 화살로 방향, 아래 범례 */
NEW.trade = function (bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), od = s.order || null, Wd = od ? 836 : 1168, A = collect(s), K2 = kinds(P), links = s.edges || [], M = {}, gridm = A.some(function (a) { return a.n.col != null }), big = A.length <= 5, NH = big ? 104 : 76, used = {};
  if (gridm) { var NC = Math.max.apply(null, A.map(function (a) { return a.n.col || 0 })) + 1, NR = Math.max.apply(null, A.map(function (a) { return a.n.row || 0 })) + 1, cw = Wd / NC, nw = Math.min(big ? 270 : 230, cw - 50);
    A.forEach(function (a) { M[a.id] = { o: a, cx: ((a.n.col || 0) + .5) * cw, cy: NR === 1 ? 240 : 14 + NH / 2 + (a.n.row || 0) * (456 - NH - 14) / (NR - 1), w: nw, h: NH, L: [], R: [], t: [], b: [] } }) }
  else { var sd = A.filter(function (a) { return a.id !== 'center' }), half = Math.ceil(sd.length / 2), cl = sd.slice(0, half), cr = sd.slice(half), NW = Wd > 1000 ? (big ? 262 : 230) : (big ? 206 : 196);
    function col(arr, cx) { arr.forEach(function (a, i) { M[a.id] = { o: a, cx: cx, cy: arr.length === 1 ? 240 : 14 + NH / 2 + i * (456 - NH - 14) / (arr.length - 1), w: NW, h: NH, L: [], R: [], t: [], b: [] } }) }
    col(cl, NW / 2 + 6); col(cr, Wd - NW / 2 - 6); if (s.center) M.center = { o: A[0], cx: Wd / 2, cy: 240, w: Wd > 1000 ? (big ? 270 : 250) : 214, h: 170, L: [], R: [], t: [], b: [] } }
  var ids = Object.keys(M); ids.forEach(function (id, i) { var o = M[id]; drawBox(svg, o.o, o.cx, o.cy, o.w, o.h, id === 'center' ? 0 : 200 + i * 100, ctx, big) });
  var T0 = 240 + ids.length * 100, E2 = [];
  links.forEach(function (l, i) { var a = M[l.from], b = M[l.to]; if (!a || !b) return; used[l.kind in K2 ? l.kind : 'work'] = 1; var e = { l: l, a: a, b: b, kd: K2[l.kind] || K2.work };
    var sa, sb; if (Math.abs(a.cx - b.cx) < 8) { sa = a.cy < b.cy ? 'b' : 't'; sb = a.cy < b.cy ? 't' : 'b' } else { sa = a.cx < b.cx ? 'R' : 'L'; sb = a.cx < b.cx ? 'L' : 'R' }
    e.sa = sa; e.sb = sb; E2.push(e); a[sa].push({ e: e, o: (sa === 'b' || sa === 't') ? b.cx : b.cy, k: 'oa' }); b[sb].push({ e: e, o: (sb === 'b' || sb === 't') ? a.cx : a.cy, k: 'ob' }) });
  ids.forEach(function (id) { var o = M[id]; ['L', 'R', 't', 'b'].forEach(function (sd2) { var lst = o[sd2]; if (!lst.length) return;
      lst.sort(function (a, b) { return a.o - b.o }); var m = lst.length, len = (sd2 === 'L' || sd2 === 'R') ? o.h : o.w, pt = Math.min(26, (len - 28) / Math.max(1, m - 1)); lst.forEach(function (q, i) { q.e[q.k] = m > 1 ? (i - (m - 1) / 2) * pt : 0 }) }) });
  function port(o, sd2, off) { return sd2 === 'L' ? [o.cx - o.w / 2, o.cy + off] : sd2 === 'R' ? [o.cx + o.w / 2, o.cy + off] : sd2 === 't' ? [o.cx + off, o.cy - o.h / 2] : [o.cx + off, o.cy + o.h / 2] }
  E2.forEach(function (e, n) { var p1 = port(e.a, e.sa, e.oa || 0), p2 = port(e.b, e.sb, e.ob || 0), kd = e.kd, te = T0 + n * 320, g = E('g', { 'data-key': e.l.text || '' }, svg), d, ux = 0, uy = 0, lx, ly, an = 'middle';
    if (e.sa === 'b' || e.sa === 't') { uy = e.sa === 'b' ? 1 : -1; d = ECOM.h.orthoD(p1, [p2[0], p2[1] - uy * 10], 'vhv'); lx = (p1[0] + p2[0]) / 2 + 12; ly = (p1[1] + p2[1]) / 2 + 4; an = 'start' }
    else { ux = e.sa === 'R' ? 1 : -1; var mx = (p1[0] + p2[0]) / 2; d = ECOM.h.orthoD(p1, [p2[0] - ux * 10, p2[1]], 'hvh'); lx = mx; ly = (p1[1] + p2[1]) / 2 + 4 }
    E('path', { d: d, fill: 'none', stroke: kd.col, 'stroke-width': kd.w, 'stroke-dasharray': kd.dash || null, 'stroke-linecap': 'round', 'data-at': te, 'data-fx': kd.dash ? 'fade' : 'draw', 'data-ms': 480 }, g); arrowTip(g, p2[0], p2[1], ux, uy || 0, kd.col, kd.w > 3 ? 14 : 12, te + 440);
    if (e.l.text) { var lt = h.at(g, te + 300, { 'data-fx': 'fade' }); elabel(lt, lx, ly, e.l.text, kd.col, an, ctx) } });
  legendK(svg, used, s.legend || {}, ctx);
  if (od) orderPanel(svg, od, Wd, ctx) };

/* matrix 주체 × 역할 행렬 : 행 = 주체(center 포함), 열 = 관계 종류(돈 · 일 · 보증) 마다 「보냄 → / ← 받음」 두 칸. 칸 = 상대 주체 · 선 이름 (선이 없으면 —) */
NEW.matrix = function (bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), A = collect(s), K2 = kinds(P), links = s.edges || [], lg = s.legend || {}, used = [], tc = ctx.dark ? P.bg : '#fff';
  var name = {}; A.forEach(function (a) { name[a.id] = a.n.title || '' });
  ['money', 'work', 'guarantee'].forEach(function (k) { if (links.some(function (l) { return (l.kind in K2 ? l.kind : 'work') === k })) used.push(k) });
  var NK = used.length || 1, LW = 206, CW = (1168 - LW) / (NK * 2), HH0 = 40, HH1 = 28, y0 = HH0 + HH1 + 6, nr = A.length, rh = Math.min(92, (478 - y0) / Math.max(1, nr));
  var gh = h.at(svg, 100, { 'data-fx': 'fade' });
  T(gh, 8, 26, '주체', { 'font-size': 14, 'font-weight': 700, fill: P.mute });
  used.forEach(function (k, j) { var kd = K2[k], x = LW + j * 2 * CW, lab = lg[k] || kd.lab;
    E('rect', { x: x + 4, y: 0, width: CW * 2 - 8, height: HH0 - 6, rx: 8, fill: kd.col }, gh); E('line', { x1: x + 14, x2: x + 44, y1: (HH0 - 6) / 2, y2: (HH0 - 6) / 2, stroke: tc, 'stroke-width': kd.w, 'stroke-dasharray': kd.dash || null, 'stroke-linecap': 'round' }, gh);
    T(gh, x + 54, (HH0 - 6) / 2 + 5.5, lab, { 'font-size': 15, 'font-weight': 700, fill: tc });
    ['보냄 →', '← 받음'].forEach(function (t2, q) { T(gh, x + q * CW + CW / 2, HH0 + 17, t2, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: P.sub }) }) });
  A.forEach(function (a, i) { var y = y0 + i * rh, g = h.at(svg, 220 + i * 160, { 'data-fx': 'fade', 'data-ms': 360, 'data-key': a.n.title || '' });
    if (i % 2 === 0) E('rect', { x: 0, y: y, width: 1168, height: rh, rx: 8, fill: P.paper }, g);
    E('rect', { x: 0, y: y + 4, width: LW - 12, height: rh - 8, rx: 10, fill: a.c ? (ctx.dark ? P.main : P.dark) : (ctx.dark ? P.well : '#fff'), stroke: a.c ? 'none' : P.main, 'stroke-width': 2 }, g);
    var c1 = a.c ? (ctx.dark ? P.bg : '#fff') : P.ink, c2 = a.c ? (ctx.dark ? P.bg : P.g18) : P.mute;
    stk(g, 14, y + 8, LW - 40, rh - 16, [{ s: a.n.title, size: 16.5, bold: 1, fill: c1 }, { s: a.n.sub, size: 12.5, fill: c2, gap: 2 }], 'mid');
    used.forEach(function (k, j) { [0, 1].forEach(function (dir) { var x = LW + (j * 2 + dir) * CW, kd = K2[k], its = [];
      links.forEach(function (l) { if ((l.kind in K2 ? l.kind : 'work') !== k) return; var oth = dir === 0 ? (l.from === a.id ? l.to : null) : (l.to === a.id ? l.from : null); if (oth == null) return; its.push((name[oth] || oth) + (l.text ? ' · ' + l.text : '')) });
      if (!its.length) { T(g, x + CW / 2, y + rh / 2 + 5, '—', { 'text-anchor': 'middle', 'font-size': 15, fill: P.axis }); return }
      var mh = rh - 14, k2 = 1, hh2, sz; for (; ;) { sz = Math.max(12.5, 14 * k2); hh2 = its.reduce(function (t, q) { return t + h.wrap(q, sz, CW - 40, 1).length * sz * 1.32 + 5 }, 0) - 5; if (hh2 <= mh || k2 <= .8) break; k2 -= .04 }
      var yy = y + (rh - hh2) / 2; its.forEach(function (q) { var ls = h.wrap(q, sz, CW - 40, 1); E('circle', { cx: x + 16, cy: yy + sz * .62, r: 4.5, fill: kd.col }, g);
        ls.forEach(function (l, jj) { T(g, x + 28, yy + sz * .95 + jj * sz * 1.32, l, { 'font-size': sz, 'font-weight': 700, fill: P.ink }) }); yy += ls.length * sz * 1.32 + 5 }) }) });
    if (i) E('line', { x1: LW, x2: 1168, y1: y, y2: y, stroke: P.line, 'stroke-width': 1 }, g) });
  used.forEach(function (k, j) { var x = LW + j * 2 * CW; if (j) E('line', { x1: x, x2: x, y1: y0, y2: y0 + nr * rh, stroke: P.line, 'stroke-width': 1.5 }, svg) });
  T(h.at(svg, 1500, { 'data-fx': 'fade' }), 0, 505, '칸 = 그 주체가 보내는 곳 · 받는 곳과 선 이름 · ● 색 = 위 칸 머리 색(관계 종류)', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute }) };

ECOM.parts.structure = function (bd, s, ctx) { var f = NEW[s.layout]; return f ? f(bd, s, ctx) : baseStructure(bd, s, ctx) };
ECOM.parts.structure.layouts = ['default', 'hier', 'trade', 'matrix'];
ECOM.parts.structure.dark = ['hier', 'trade', 'matrix'];
})();
