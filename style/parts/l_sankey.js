/* sankey — 산키 흐름도 : 왼쪽 들어오는 것 → (가운데 기둥) → 오른쪽 쓰임, 띠 굵기 = 값
   left{items:[{name,value,tone}]} · right{items:[…]} · mid{label,sub}(없으면 왼쪽 → 오른쪽 바로 이어짐) · unit('조 달러') · dec
   flows[{from,to,value}](기둥이 없을 때만 — 없으면 양쪽 크기대로 나눔) · note{title,lines:[…],tone:'warn'}(오른쪽 위 작은 메모 상자, 선택)
   tone : 'warn'(나쁜 뜻) 또는 색 이름(main g65 g40 g18 gray) — 없으면 차례대로
   layout(없으면 default = 위 그림) : twoline 두 줄 흐름(위 줄 = 굵은 띠 하나로 모였다 갈라짐 · 선택 칸 money{label,unit,items[{name,value}]} 가 있을 때만 아래 줄 = 반대 방향 대금 띠, 없으면 한 줄)
     · pipe 배관(원천 관 → 합계 기둥 → 쓰임 관, 굵기 = 값, 오른쪽 끝 화살). 둘 다 단계 머리글 + 방향 화살(left.title · right.title 선택, 기본 원천 → 쓰임). 짙은 바탕(bg deep) 가능 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var baseSankey = function (bd, s, ctx) {
  var li = (s.left && s.left.items) || [], ri = (s.right && s.right.items) || [], mid = s.mid || null, note = s.note && typeof s.note === 'object' ? s.note : null;
  if (!li.length || !ri.length) return;
  var dec = s.dec != null ? s.dec : 1, unit = s.unit || '', svg = ctx.svg(512), F = function (v) { return h.nf(v, dec) + unit };
  var PL = ['main', 'g65', 'g40', 'g18', 'gray'], PR = ['g65', 'g40', 'g18', 'gray', 'light'];
  function paint(items, P) { items.forEach(function (it, i) { var t = it.tone || it.color; it._w = t === 'warn'; it._c = t === 'warn' ? C.warn : h.col(t || P[i % P.length]) }) }
  paint(li, PL); paint(ri, PR);
  var sum = function (a) { return a.reduce(function (x, it) { return x + (+it.value || 0) }, 0) }, sL = sum(li), sR = sum(ri);
  var NW = 22, MW = 35, H = 412, top = 48, gap = 9;
  function heights(items, sm) { var av = H - gap * (items.length - 1); return items.map(function (it) { return Math.max(3, av * (+it.value || 0) / sm) }) }
  var hL = heights(li, sL), hR = heights(ri, sR);
  function lblW(items, hs) { return Math.min(250, Math.max.apply(null, items.map(function (it, i) { var nm = it.name || ''; return hs[i] < 44 ? h.textW(nm + '  ' + F(it.value), 14, 1) : Math.max(h.textW(nm, 15, 1), h.textW(F(it.value), 13, 1)) }))) }
  var LW = lblW(li, hL), RW = lblW(ri, hR), nW = note ? 168 : 0;
  var lx0 = LW + 14, rx0 = 1168 - nW - RW - 14 - NW, lEdge = lx0 + NW;
  function stack(hs) { var y = top, o = []; hs.forEach(function (q) { o.push(y); y += q + gap }); return o }
  var yL = stack(hL), yR = stack(hR);
  function rib(x0, a0, a1, x1, b0, b1, col, at) { var xm = (x0 + x1) / 2;
    E('path', { d: 'M' + x0 + ' ' + a0 + ' C' + xm + ' ' + a0 + ' ' + xm + ' ' + b0 + ' ' + x1 + ' ' + b0 + ' L' + x1 + ' ' + b1 + ' C' + xm + ' ' + b1 + ' ' + xm + ' ' + a1 + ' ' + x0 + ' ' + a1 + ' Z', fill: col, 'fill-opacity': .38, 'data-at': at, 'data-fx': 'fade', 'data-ms': 520 }, svg) }
  function node(it, x, y, hh, side, at) {
    E('rect', { x: x, y: y, width: NW, height: hh, rx: 3, fill: it._c, 'data-at': at, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 380 }, svg);
    var g = h.at(svg, at + 140, { 'data-fx': 'fade' }), end = side === 'l', tx = end ? x - 12 : x + NW + 12, an = end ? 'end' : 'start', cy = y + hh / 2, vc = it._w ? C.warn : C.main;
    if (hh < 44) { var t = E('text', { x: tx, y: cy + 5, 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: C.ink }, g); E('tspan', {}, t).textContent = it.name || ''; var v = E('tspan', { dx: 10, fill: vc }, t); v.textContent = F(it.value) }
    else { T(g, tx, cy - 2, it.name || '', { 'text-anchor': an, 'font-size': 15, 'font-weight': 700, fill: C.ink }); T(g, tx, cy + 17, F(it.value), { 'text-anchor': an, 'font-size': 13, 'font-weight': 700, fill: vc }) } }
  var t0 = 0;
  li.forEach(function (it, i) { node(it, lx0, yL[i], hL[i], 'l', t0 + i * 60) });
  var tR = mid ? 700 : 500, bR = tR;
  if (mid) {
    var Hm = H * .86, my0 = top + (H - Hm) / 2, mx = lEdge + (rx0 - lEdge - MW) / 2, ac = my0;
    li.forEach(function (it, i) { var q = Hm * (+it.value || 0) / sL; rib(lEdge, yL[i], yL[i] + hL[i], mx, ac, ac + q, it._c, 260 + i * 80); ac += q });
    E('rect', { x: mx, y: my0, width: MW, height: Hm, rx: 4, fill: C.dark, 'data-at': 560, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 420 }, svg);
    var gm = h.at(svg, 700, { 'data-fx': 'fade' }); T(gm, mx + MW / 2, top - (mid.sub ? 2 : 6), mid.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink });
    if (mid.sub) T(gm, mx + MW / 2, top + 16, mid.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    ac = my0; ri.forEach(function (it, i) { var q = Hm * (+it.value || 0) / sR; rib(mx + MW, ac, ac + q, rx0, yR[i], yR[i] + hR[i], it._c, 800 + i * 80); ac += q });
    tR = 1000; bR = 1000;
  } else {
    var f = [], ml = (s.flows || []);
    li.forEach(function (a, i) { f[i] = []; ri.forEach(function (b, j) { f[i][j] = (a.value / sL) * (b.value / sR) }) });
    if (ml.length) { li.forEach(function (a, i) { ri.forEach(function (b, j) { f[i][j] = 0 }) }); var st = ml.reduce(function (x, q) { return x + (+q.value || 0) }, 0) || 1; ml.forEach(function (q) { if (f[q.from]) f[q.from][q.to] = (+q.value || 0) / st }) }
    var outL = li.map(function (a, i) { return f[i].reduce(function (x, y) { return x + y }, 0) || 1 }), inR = ri.map(function (b, j) { return li.reduce(function (x, a, i) { return x + f[i][j] }, 0) || 1 });
    var offL = li.map(function (a, i) { return yL[i] }), offR = ri.map(function (b, j) { return yR[j] });
    li.forEach(function (a, i) { ri.forEach(function (b, j) { var q = f[i][j]; if (!q) return; var ta = hL[i] * q / outL[i], tb = hR[j] * q / inR[j];
      rib(lEdge, offL[i], offL[i] + ta, rx0, offR[j], offR[j] + tb, b._w ? C.warn : a._c, 300 + (i + j) * 70); offL[i] += ta; offR[j] += tb }) });
  }
  ri.forEach(function (it, i) { node(it, rx0, yR[i], hR[i], 'r', tR + i * 60) });
  if (note) { var nx = 1168 - 164, lines = [], tw = 164 - 28; (note.lines || []).forEach(function (l) { h.wrap(l, 13, tw).forEach(function (q) { lines.push(q) }) });
    var nh = 22 + (note.title ? 26 : 0) + lines.length * 21 + 8, g = h.at(svg, bR + 600, { 'data-fx': 'fade' }), ty = top + 24;
    E('rect', { x: nx, y: top, width: 164, height: nh, rx: 10, fill: C.paper }, g);
    if (note.title) { T(g, nx + 14, ty, note.title, { 'font-size': 13, 'font-weight': 700, fill: note.tone === 'warn' ? C.warn : C.dark }); ty += 24 }
    lines.forEach(function (l, i) { T(g, nx + 14, ty + i * 21, l, { 'font-size': 13, fill: C.cmp }) }) }
};
/* ───────── 새 배치 2종 (s.layout) ───────── */
var NEW = {};
function pcol(P, t) { if (t === 'warn') return P.warn; if (t && P[t] && typeof P[t] === 'string') return P[t]; if (/^#[0-9a-f]{3,8}$/i.test(t || '')) return t; return P.main }
function geo(s, ctx, top, H) {
  var P = ctx.P, li = (s.left && s.left.items) || [], ri = (s.right && s.right.items) || []; if (!li.length || !ri.length) return null;
  var dec = s.dec != null ? s.dec : 1, unit = s.unit || '', F = function (v) { return h.nf(v, dec) + unit }, PL = ['main', 'g65', 'g40', 'g18', 'gray'], PR = ['g65', 'g40', 'g18', 'gray', 'light'];
  function paint(items, Q) { items.forEach(function (it, i) { var t = it.tone || it.color; it._w = t === 'warn'; it._c = pcol(P, t || Q[i % Q.length]) }) } paint(li, PL); paint(ri, PR);
  var sum = function (a) { return a.reduce(function (x, it) { return x + (+it.value || 0) }, 0) }, sL = sum(li), sR = sum(ri), gap = H > 300 ? 9 : 7, NW = 22;
  function heights(items, sm) { var av = H - gap * (items.length - 1); return items.map(function (it) { return Math.max(3, av * (+it.value || 0) / sm) }) }
  var hL = heights(li, sL), hR = heights(ri, sR);
  function lblW(items, hs) { return Math.min(250, Math.max.apply(null, items.map(function (it, i) { var nm = it.name || ''; return hs[i] < 44 ? h.textW(nm + '  ' + F(it.value), 14, 1) : Math.max(h.textW(nm, 15, 1), h.textW(F(it.value), 13, 1)) }))) }
  var LW = lblW(li, hL), RW = lblW(ri, hR), nW = s.note ? 168 : 0, lx0 = LW + 14, rx0 = 1168 - nW - RW - 14 - NW - 18;
  function stack(hs) { var y = top, o = []; hs.forEach(function (q) { o.push(y); y += q + gap }); return o }
  return { P: P, li: li, ri: ri, F: F, sL: sL, sR: sR, hL: hL, hR: hR, yL: stack(hL), yR: stack(hR), lx0: lx0, rx0: rx0, NW: NW, nW: nW, top: top, H: H, dec: dec, unit: unit } }
function rib(svg, G, x0, a0, a1, x1, b0, b1, col, at) { var xm = (x0 + x1) / 2;
  E('path', { d: 'M' + x0 + ' ' + a0 + ' C' + xm + ' ' + a0 + ' ' + xm + ' ' + b0 + ' ' + x1 + ' ' + b0 + ' L' + x1 + ' ' + b1 + ' C' + xm + ' ' + b1 + ' ' + xm + ' ' + a1 + ' ' + x0 + ' ' + a1 + ' Z', fill: col, 'fill-opacity': ctx_dk(G) ? .5 : .38, 'data-at': at, 'data-fx': 'fade', 'data-ms': 520 }, svg) }
function ctx_dk(G) { return G.P.bg != null }
/* 노드 한 줄 : 이름 · 값(띠 두께가 얇으면 한 줄). side 'l' 은 바깥(왼쪽)에 글, 'r' 은 오른쪽 끝 화살 뒤에 글 */
function snode(svg, G, it, x, y, hh, side, at, bar) { var P = G.P, e = [], g;
  if (bar) E('rect', { x: x, y: y, width: G.NW, height: hh, rx: 3, fill: it._c, 'data-at': at, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 380, 'data-key': it.name || '' }, svg);
  g = h.at(svg, at + 140, { 'data-fx': 'fade', 'data-key': it.name || '' }); var end = side === 'l', tx = end ? x - 12 : x + (bar ? G.NW : 0) + 28, an = end ? 'end' : 'start', cy = y + hh / 2, vc = it._w ? P.warn : P.main;
  if (hh < 44) { var t = E('text', { x: tx, y: cy + 5, 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: P.ink }, g); E('tspan', {}, t).textContent = it.name || ''; var v = E('tspan', { dx: 10, fill: vc }, t); v.textContent = G.F(it.value) }
  else { T(g, tx, cy - 2, it.name || '', { 'text-anchor': an, 'font-size': 15, 'font-weight': 700, fill: P.ink }); T(g, tx, cy + 17, G.F(it.value), { 'text-anchor': an, 'font-size': 13, 'font-weight': 700, fill: vc }) } }
function tip(svg, G, x, y, hh, col, at) { E('path', { d: 'M' + x + ' ' + (y - Math.min(5, hh * .25 + 2)) + ' L' + (x + 16) + ' ' + (y + hh / 2) + ' L' + x + ' ' + (y + hh + Math.min(5, hh * .25 + 2)) + ' Z', fill: col, 'data-at': at, 'data-fx': 'fade', 'data-ms': 260 }, svg) }
/* 단계 머리글 + 방향 화살 : 왼쪽 이름 → 오른쪽 이름, rev 면 거꾸로(오른쪽 → 왼쪽) */
function hdr(svg, G, y, left, mid, right, rev, at) { var P = G.P, g = h.at(svg, at, { 'data-fx': 'fade', 'data-ms': 360 }), R = 1168 - G.nW, wl = h.textW(left, 13.5, 1), wr = h.textW(right, 13.5, 1), x1 = wl + 14, x2 = R - wr - 14, mw = mid ? h.textW(mid, 13.5, 1) + 26 : 0, cm = (x1 + x2) / 2;
  T(g, 0, y, left, { 'font-size': 13.5, 'font-weight': 700, fill: P.mute }); T(g, R, y, right, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: P.mute });
  var ly = y - 5, segs = mid ? [[x1, cm - mw / 2], [cm + mw / 2, x2]] : [[x1, x2]]; if (mid) T(g, cm, y, mid, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: P.sub });
  segs.forEach(function (q, i) { var last = i === segs.length - 1, first = i === 0, tipR = !rev && last, tipL = rev && first; E('line', { x1: q[0] + (tipL ? 10 : 0), x2: q[1] - (tipR ? 10 : 0), y1: ly, y2: ly, stroke: P.g40, 'stroke-width': 2 }, g);
    if (tipR) E('path', { d: 'M' + q[1] + ' ' + ly + ' l-11 -6 v12 z', fill: P.g65 }, g); if (tipL) E('path', { d: 'M' + q[0] + ' ' + ly + ' l11 -6 v12 z', fill: P.g65 }, g) }) }
function hcm(G, left, right) { return (h.textW(left, 13.5, 1) + 14 + 1168 - G.nW - h.textW(right, 13.5, 1) - 14) / 2 }
function noteBox(svg, G, s, at) { var note = s.note, P = G.P; if (!note || typeof note !== 'object') return; var nx = 1168 - 164, lines = [], tw = 136; (note.lines || []).forEach(function (l) { h.wrap(l, 13, tw).forEach(function (q) { lines.push(q) }) });
  var nh = 22 + (note.title ? 26 : 0) + lines.length * 21 + 8, g = h.at(svg, at, { 'data-fx': 'fade' }), ty = G.top + 24;
  E('rect', { x: nx, y: G.top, width: 164, height: nh, rx: 10, fill: P.paper }, g); if (note.title) { T(g, nx + 14, ty, note.title, { 'font-size': 13, 'font-weight': 700, fill: note.tone === 'warn' ? P.warn : P.dark }); ty += 24 }
  lines.forEach(function (l, i) { T(g, nx + 14, ty + i * 21, l, { 'font-size': 13, fill: P.cmp }) }) }

/* twoline 두 줄 흐름 : 위 줄 = 물자(왼 → 오, 굵은 띠 하나로 모였다 갈라짐). s.money{label,unit,items[{name,value}]} 가 있으면 아래 줄 = 돈(오 → 왼, 반대 방향 띠). 없으면 한 줄 굵은 띠만 */
NEW.twoline = function (bd, s, ctx) {
  var mo = s.money && (s.money.items || []).length ? s.money : null, G = geo(s, ctx, mo ? 40 : 52, mo ? 212 : 396); if (!G) return; var P = G.P, svg = ctx.svg(512), mid = s.mid || {}, dk = ctx.dark, tc = dk ? P.bg : '#fff';
  var lt = (s.left && s.left.title) || '원천', rt = (s.right && s.right.title) || '쓰임', li = G.li, ri = G.ri, lEdge = G.lx0 + G.NW, rEdge = G.rx0, hc = hcm(G, lt, rt), bw2 = (rEdge - lEdge) * .4, bx0 = hc - bw2 / 2, bx1 = hc + bw2 / 2, Hm = G.H * .68, my0 = G.top + (G.H - Hm) / 2;
  hdr(svg, G, 17, lt, mo ? (s.flowLabel || '물자') + ' · 왼쪽 → 오른쪽' : '', rt, false, 0);
  li.forEach(function (it, i) { snode(svg, G, it, G.lx0, G.yL[i], G.hL[i], 'l', i * 60, true) });
  var ac = my0; li.forEach(function (it, i) { var q = Hm * (+it.value || 0) / G.sL; rib(svg, G, lEdge, G.yL[i], G.yL[i] + G.hL[i], bx0, ac, ac + q, it._c, 260 + i * 80); ac += q });
  var bg = E('g', { 'data-at': 560, 'data-fx': 'zoom', 'data-ms': 420, 'data-key': mid.label || '합계' }, svg); E('rect', { x: bx0, y: my0, width: bx1 - bx0, height: Hm, rx: 8, fill: P.g18 }, bg);
  var tot = !mid.label && Math.abs(G.sL - G.sR) <= .02 * G.sL ? G.F(G.sL) : '', lab = mid.label || '합계', lw = bx1 - bx0 - 28, ly = my0 + Hm / 2;
  T(bg, (bx0 + bx1) / 2, ly - (tot || mid.sub ? 8 : -6), lab, { 'text-anchor': 'middle', 'font-size': fitS(lab, 18, 13.5, lw, 1), 'font-weight': 700, fill: P.ink });
  if (tot || mid.sub) T(bg, (bx0 + bx1) / 2, ly + 18, mid.sub || tot, { 'text-anchor': 'middle', 'font-size': fitS(mid.sub || tot, 16, 12.5, lw, 1), 'font-weight': 700, fill: P.main });
  ac = my0; ri.forEach(function (it, i) { var q = Hm * (+it.value || 0) / G.sR; rib(svg, G, bx1, ac, ac + q, rEdge, G.yR[i], G.yR[i] + G.hR[i], it._c, 800 + i * 80); ac += q });
  ri.forEach(function (it, i) { var at = 1000 + i * 60; snode(svg, G, it, rEdge, G.yR[i], G.hR[i], 'r', at, true); tip(svg, G, rEdge + G.NW, G.yR[i], G.hR[i], it._c, at + 200) });
  noteBox(svg, G, s, 1700);
  if (mo) { var y0 = 300, by = y0 + 16, bh = 118, items = mo.items.slice(0, 5), mu = mo.unit != null ? mo.unit : G.unit, F2 = function (v) { return h.nf(v, G.dec) + mu }, ss = items.reduce(function (a, q) { return a + (+q.value || 0) }, 0) || 1;
    var ramp = [P.main, P.g65, P.g40, P.g18, P.gray], xa = G.lx0, xb = G.rx0 + G.NW, TX = 40, avail = xb - xa - TX - (items.length - 1) * 5, xx = xa + TX, lg = h.at(svg, 1300, { 'data-fx': 'fade', 'data-ms': 360 });
    hdr(svg, G, y0, lt, (mo.label || '돈') + ' · 오른쪽 → 왼쪽', rt, true, 1250);
    E('path', { d: 'M' + xa + ' ' + (by + bh / 2) + ' L' + (xa + TX - 4) + ' ' + by + ' V' + (by + bh) + ' Z', fill: P.cmp, 'data-at': 1350, 'data-fx': 'fade', 'data-ms': 300 }, svg);
    items.forEach(function (it, i) { var w = Math.max(30, avail * (+it.value || 0) / ss), f = ramp[i % 5], light = i >= 3, g = E('g', { 'data-at': 1400 + (items.length - 1 - i) * 90, 'data-fx': 'growx', 'data-o': '100% 50%', 'data-ms': 360, 'data-key': it.name || '' }, svg);
      E('rect', { x: xx, y: by, width: w, height: bh, rx: 6, fill: f }, g); var cx = xx + w / 2, c1 = light ? P.ink : tc;
      T(g, cx, by + bh / 2 - 4, it.name || '', { 'text-anchor': 'middle', 'font-size': fitS(it.name || '', 16, 12.5, w - 16, 1), 'font-weight': 700, fill: c1 }); T(g, cx, by + bh / 2 + 20, F2(it.value), { 'text-anchor': 'middle', 'font-size': fitS(F2(it.value), 16, 12.5, w - 16, 1), 'font-weight': 700, fill: c1 }); xx += w + 5 });
    T(lg, xa, by + bh + 26, '띠 길이 = 대금 크기', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute }) } };

/* pipe 배관 : 원천 → (굵기 = 값) 가는 관 → 합계 기둥 → 쓰임 관, 왼 → 오 한 방향, 오른쪽 끝에 화살 */
NEW.pipe = function (bd, s, ctx) {
  var G = geo(s, ctx, 58, 428); if (!G) return; var P = G.P, svg = ctx.svg(512), mid = s.mid || {}, li = G.li, ri = G.ri, lEdge = G.lx0, rEdge = G.rx0, TWd = 84, tx0 = hcm(G, (s.left && s.left.title) || '원천', (s.right && s.right.title) || '쓰임') - TWd / 2;
  var lt = (s.left && s.left.title) || '원천', rt = (s.right && s.right.title) || '쓰임';
  hdr(svg, G, 17, lt, mid.label || '합계', rt, false, 0);
  li.forEach(function (it, i) { var hh = G.hL[i], at = i * 70; E('rect', { x: lEdge, y: G.yL[i], width: tx0 - lEdge + 4, height: hh, rx: Math.min(6, hh / 2), fill: it._c, 'data-at': 100 + at, 'data-fx': 'growx', 'data-ms': 520, 'data-key': it.name || '' }, svg); snode(svg, G, it, lEdge, G.yL[i], hh, 'l', at, false) });
  var tg = E('g', { 'data-at': 700, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 480, 'data-key': mid.label || '합계' }, svg); E('rect', { x: tx0, y: G.top, width: TWd, height: G.H, rx: 8, fill: P.dark }, tg); T(tg, tx0 + TWd / 2, G.top + G.H / 2 + 6, '합계', { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ctx.dark ? P.bg : '#fff' });
  ri.forEach(function (it, i) { var hh = G.hR[i], at = 900 + i * 70, y = G.yR[i]; E('rect', { x: tx0 + TWd - 4, y: y, width: rEdge - tx0 - TWd + 4, height: hh, rx: Math.min(6, hh / 2), fill: it._c, 'data-at': at, 'data-fx': 'growx', 'data-ms': 520, 'data-key': it.name || '' }, svg);
    tip(svg, G, rEdge, y, hh, it._c, at + 400); snode(svg, G, it, rEdge, y, hh, 'r', at + 200, false) });
  noteBox(svg, G, s, 1700) };

ECOM.parts.sankey = function (bd, s, ctx) { var f = NEW[s.layout]; return f ? f(bd, s, ctx) : baseSankey(bd, s, ctx) };
ECOM.parts.sankey.layouts = ['default', 'twoline', 'pipe'];
ECOM.parts.sankey.dark = ['twoline', 'pipe'];
function fitS(str, size, min, w, bold) { while (size > min && h.textW(str, size, bold ? 1 : 0) > w) size -= .5; return size }
})();
