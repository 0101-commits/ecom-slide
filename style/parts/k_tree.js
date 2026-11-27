/* tree — 논리 나무(왼쪽 → 오른쪽) : 뿌리 → 줄기 선 → 가지 상자 → 가지마다 잎 선 · 잎 상자
   root{title,sub,value} · branches[2~4]{title,sub,tone(main|dark|g65|cmp|warn|#hex — 그 갈래 가지 · 잎 색),icon('tf:<코드>' topdown 갈래 머리 그림),leaves:[{title,text,value}]} · beats[{spot:가지}]
   잎 앞 점은 한 개(상자 안 글머리 점) — 연결선 끝에는 점을 찍지 않음 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
function treeDefault(bd, s, ctx) {
  var root = ctx.root, rt = s.root || {}, br = (s.branches || []).slice(0, 4), B = br.length, nL = br.reduce(function (a, b) { return a + (b.leaves || []).length }, 0);
  var RX = 0, RW = 214, BX = 274, BW = 236, LX = 566, LW = 1168 - LX, lg = 10, bgp = 22, lh = Math.min(86, (512 - (nL - B) * lg - (B - 1) * bgp) / nL);
  var svg = K.svg(ctx), y = 0, grp = br.map(function () { return [] }), spans = [];
  var used = nL * lh + (nL - B) * lg + (B - 1) * bgp, oy = (512 - used) / 2; y = oy;
  br.forEach(function (b, i) { var ls = b.leaves || [], a = y; ls.forEach(function () { y += lh + lg }); y -= lg; spans.push([a, y]); y += bgp });
  var rh = Math.min(240, used), ry = 256 - rh / 2, cy = 256;
  K.D(bd, 'kx k-trr', RX, ry, RW, rh, '<b>' + h.md(rt.title || '') + '</b>' + (rt.value ? '<em>' + h.md(rt.value) + '</em>' : '') + (rt.sub ? '<span>' + h.md(rt.sub) + '</span>' : ''), { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 420 });
  var t1 = 380, li = 0;
  br.forEach(function (b, i) { var sp = spans[i], by = (sp[0] + sp[1]) / 2, bH = Math.min(sp[1] - sp[0], 128), tone = h.col(b.tone || 'main')   /* 7판 : tone 이 없으면 한 색(뜻 없는 색 차이 금지) */, tb = t1 + 260 + i * 140;
    var pth = E('path', { d: 'M' + (RX + RW) + ' ' + cy + ' H' + (RX + RW + 30) + ' V' + by + ' H' + (BX - 2), fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-at': t1 + i * 140, 'data-fx': 'draw', 'data-ms': 360 }, svg);
    var bx = K.D(bd, 'kx k-trb', BX, by - bH / 2, BW, bH, '<b>' + h.md(b.title || '') + '</b>' + (b.sub ? '<span>' + h.md(b.sub) + '</span>' : ''), { 'data-at': tb, 'data-fx': 'left', 'data-ms': 380 }); bx.style.background = tone;
    grp[i].push(pth, bx);
    var ly = sp[0];
    (b.leaves || []).forEach(function (l, j) { var my = ly + lh / 2, tl = t1 + 260 + B * 140 + 200 + li * 150;
      var lp = E('path', { d: 'M' + (BX + BW) + ' ' + by + ' H' + (BX + BW + 26) + ' V' + my + ' H' + (LX - 2), fill: 'none', stroke: C.gray, 'stroke-width': 1.8, 'data-at': tl, 'data-fx': 'draw', 'data-ms': 300 }, svg);
      var lb = K.D(bd, 'kx k-trl', LX + 6, ly, LW - 6, lh, '<i style="background:' + tone + '"></i><div><b>' + h.md(l.title || '') + '</b>' + (l.text ? '<span>' + h.md(l.text) + '</span>' : '') + '</div>' + (l.value ? '<em>' + h.md(l.value) + '</em>' : ''),
        { 'data-at': tl + 180, 'data-fx': 'rise', 'data-ms': 320 });
      grp[i].push(lp, lb); ly += lh + lg; li++ }) });
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } }
/* ───────── 배치(layout) — 같은 칸(root · branches · beats)으로 다른 그림 ─────────
   default  왼 → 오 논리 나무(위 설명 그대로)
   topdown  위 → 아래 나무 — 뿌리가 위, 갈래가 가로로 서고 잎이 갈래 밑에 줄지어 매달림
   sunburst 선버스트 — 가운데 원 = 뿌리, 안쪽 고리 = 갈래, 바깥 고리 = 잎(잎마다 값이 있으면 |값| 비례 각도, 없으면 균등). 이름은 가로 바깥 이름표
   table    표형 — 위 띠 = 뿌리, 왼쪽 묶음 칸 = 갈래, 한 줄 = 잎, 오른쪽 막대 = 값(없으면 막대 없이 설명을 넓게) */
var LAY = {};
function inj() { if (document.getElementById('p3a2-css')) return; var st = document.createElement('style'); st.id = 'p3a2-css'; st.textContent = '.kx.p3 b,.kx.p3 span b,.kx.p3 div b{color:inherit}'; (document.head || document.documentElement).appendChild(st) }
function D(bd, x, y, w, hh, html, css, at) { inj(); var d = K.D(bd, 'kx p3', x, y, w, hh, html, at); if (css) d.style.cssText += ';' + css; return d }
function mix(a, b, t) { function p(c) { c = c.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16) }) } var A = p(a), B = p(b); return '#' + A.map(function (v, i) { var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16) }).join('') }
function tone(P, b, i) { var n = b.tone || 'main'; return P[n] || (/^#/.test(n) ? n : P.main) }
function numOf(v) { var m = String(v == null ? '' : v).replace(/[−–]/g, '-').match(/-?\d[\d,]*\.?\d*/); return m ? parseFloat(m[0].replace(/,/g, '')) : null }
function setup(ctx) { var P = ctx.P, dk = ctx.dark; return { P: P, ON: dk ? ECOM.Cd.bg : '#fff', CARD: dk ? P.g08 : P.paper, BD: dk ? P.line : '#DDE3E0' } }
function beat(root, grp, s) { grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } }

LAY.topdown = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, rt = s.root || {}, br = (s.branches || []).slice(0, 4), B = br.length, svg = K.svg(ctx), grp = br.map(function () { return [] });
  var gap = 22, cw = (1168 - (B - 1) * gap) / B, nMax = Math.max.apply(null, br.map(function (b) { return (b.leaves || []).length })), RW = 400, RH = 84;
  var by0 = 140, bh = 62, ly0 = by0 + bh + 26, lg = 10, lh = Math.min(112, (512 - ly0 - (nMax - 1) * lg) / nMax);
  D(bd, (1168 - RW) / 2, 0, RW, RH, '<div style="display:flex;align-items:baseline;gap:14px"><b style="font-size:20px">' + h.md(rt.title || '') + '</b>' + (rt.value ? '<em style="font-style:normal;font-size:26px;font-weight:700;color:' + ON + ';letter-spacing:-.02em">' + h.md(rt.value) + '</em>' : '') + '</div>' + (rt.sub ? '<span style="font-size:13px;opacity:.9;margin-top:4px">' + h.md(rt.sub) + '</span>' : ''),
    'display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;background:' + P.dark + ';color:' + ON, { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 400 });
  var bus = 112, cxs = br.map(function (_, i) { return i * (cw + gap) + cw / 2 });
  E('path', { d: 'M584 ' + RH + ' V' + bus, fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'data-at': 300, 'data-fx': 'draw', 'data-ms': 160 }, svg);
  if (B > 1) E('path', { d: 'M' + cxs[0] + ' ' + bus + ' H' + cxs[B - 1], fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'data-at': 420, 'data-fx': 'draw', 'data-ms': 420 }, svg);
  br.forEach(function (b, i) { var x = i * (cw + gap), tc = tone(P, b, i), ta = 520 + i * 160, ls = b.leaves || [];
    var p0 = E('path', { d: 'M' + cxs[i] + ' ' + bus + ' V' + (by0 - 8), fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'data-at': ta - 60, 'data-fx': 'draw', 'data-ms': 200 }, svg), hd = K.head(svg, cxs[i], by0 - 1, Math.PI / 2, P.g65, 9, { 'data-at': ta + 120, 'data-fx': 'fade', 'data-ms': 100 });
    var bx = D(bd, x, by0, cw, bh, (b.icon ? '<div style="display:flex;align-items:center;gap:10px">' + ECOM.u.tfHTML(b.icon, 30, ctx) + '<b style="font-size:18px;line-height:1.3">' + h.md(b.title || '') + '</b></div>' : '<b style="font-size:18px;line-height:1.3">' + h.md(b.title || '') + '</b>') + (b.sub ? '<span style="font-size:13px;opacity:.92;margin-top:2px">' + h.md(b.sub) + '</span>' : ''),
      'display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;background:' + tc + ';color:' + ON, { 'data-at': ta, 'data-fx': 'rise', 'data-ms': 320, 'data-key': b.title || '' });
    grp[i].push(p0, hd, bx);
    if (!ls.length) return;
    var sx = x + 16, lyl = ly0 + (ls.length - 1) * (lh + lg) + lh / 2;
    grp[i].push(E('path', { d: 'M' + sx + ' ' + (by0 + bh) + ' V' + lyl, fill: 'none', stroke: tc, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'data-at': ta + 240, 'data-fx': 'draw', 'data-ms': 360 }, svg));
    ls.forEach(function (l, j) { var y = ly0 + j * (lh + lg), my = y + lh / 2, tl = ta + 380 + j * 150;
      grp[i].push(E('path', { d: 'M' + sx + ' ' + my + ' H' + (x + 36), fill: 'none', stroke: tc, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'data-at': tl, 'data-fx': 'draw', 'data-ms': 160 }, svg));
      grp[i].push(D(bd, x + 38, y, cw - 38, lh, '<div style="display:flex;align-items:baseline;gap:10px;justify-content:space-between"><b style="font-size:16px;color:' + P.ink + ';line-height:1.35">' + h.md(l.title || '') + '</b>' + (l.value ? '<em style="font-style:normal;flex:0 0 auto;font-size:16px;font-weight:700;color:' + P.dark + ';font-variant-numeric:tabular-nums">' + h.md(l.value) + '</em>' : '') + '</div>'
        + (l.text ? '<span style="font-size:16px;color:' + P.sub + ';line-height:1.42;margin-top:4px">' + h.md(l.text) + '</span>' : ''),
        'display:flex;flex-direction:column;justify-content:center;padding:0 14px;border-radius:6px;background:' + S.CARD + ';border-left:5px solid ' + tc, { 'data-at': tl + 80, 'data-fx': 'rise', 'data-ms': 300 })) }) });
  beat(ctx.root, grp, s) };

LAY.sunburst = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, rt = s.root || {}, br = (s.branches || []).slice(0, 4), B = br.length, svg = K.svg(ctx), grp = br.map(function () { return [] });
  var cx = 584, cy = 244, r0 = 66, r1 = 72, r2 = 142, r3 = 148, r4 = 224, TAU = Math.PI * 2;
  var all = []; br.forEach(function (b) { (b.leaves || []).forEach(function (l) { all.push(l) }) });
  var vals = all.map(function (l) { return numOf(l.value) }), prop = all.length > 0 && vals.every(function (v) { return v != null && v !== 0 }), wt = {}, k = 0;
  // 잎 무게
  var lw = br.map(function (b) { return (b.leaves || []).map(function (l) { return prop ? Math.abs(numOf(l.value)) : 1 }) });
  if (prop) { var tot0 = 0; lw.forEach(function (a) { a.forEach(function (v) { tot0 += v }) }); lw = lw.map(function (a) { return a.map(function (v) { return Math.max(v, tot0 * .06) }) }) }
  var sums = lw.map(function (a) { return a.reduce(function (x, y) { return x + y }, 0) }), tot = sums.reduce(function (x, y) { return x + y }, 0) || 1;
  function pt(r, a) { return [cx + r * Math.sin(a), cy - r * Math.cos(a)] }
  function arc(ra, rb, a0, a1) { var big = a1 - a0 > Math.PI ? 1 : 0, p = pt(rb, a0), q = pt(rb, a1), u = pt(ra, a1), v = pt(ra, a0);
    return 'M' + p + ' A' + rb + ' ' + rb + ' 0 ' + big + ' 1 ' + q + ' L' + u + ' A' + ra + ' ' + ra + ' 0 ' + big + ' 0 ' + v + ' Z' }
  function wedge(ra, rb, a0, a1, fill, at, g) { var e = E('path', { d: arc(ra, rb, a0, a1), fill: fill, stroke: ON, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'data-at': at, 'data-fx': 'fade', 'data-ms': 300 }, svg); g.push(e); return e }
  // 가운데 원
  var cg = E('g', { 'data-at': 0, 'data-fx': 'pop', 'data-ms': 380 }, svg);
  E('circle', { cx: cx, cy: cy, r: r0, fill: P.dark }, cg);
  h.T(cg, cx, cy - (rt.value ? 4 : -6), rt.title || '', { 'text-anchor': 'middle', 'font-size': h.textW(rt.title || '', 16, 1) > 112 ? 13.5 : 16, 'font-weight': 700, fill: ON });
  if (rt.value) h.T(cg, cx, cy + 20, rt.value, { 'text-anchor': 'middle', 'font-size': h.textW(rt.value, 19, 1) > 112 ? 13.5 : 19, 'font-weight': 700, fill: ON });
  var labels = [], unfit = {}, a = 0, ta = 360;
  br.forEach(function (b, i) { var tc = tone(P, b, i), span = sums[i] / tot * TAU, a0 = a, a1 = a + span, am = (a0 + a1) / 2;
    wedge(r1, r2, a0, a1 - 0.0001, tc, ta + i * 140, grp[i]);
    var chord = 2 * 100 * Math.sin(Math.min(span, Math.PI) / 2), tp = pt(100, am), fit = chord >= h.textW(b.title || '', 14, 1) + 14;
    if (fit) grp[i].push(h.T(svg, tp[0], tp[1] + 5, b.title || '', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: ON, 'data-at': ta + i * 140 + 160, 'data-fx': 'fade', 'data-ms': 200 }));
    else unfit[i] = b.title || '';
    var la = a0; (b.leaves || []).forEach(function (l, j) { var sp2 = lw[i][j] / tot * TAU, l0 = la, l1 = la + sp2, lm = (l0 + l1) / 2, lt = ta + 360 + B * 140 + k * 130;
      wedge(r3, r4, l0, l1 - 0.0001, mix(tc, ctx.dark ? ECOM.Cd.bg : '#ffffff', ctx.dark ? .35 : .5), lt, grp[i]);
      labels.push({ am: lm, i: i, l: l, tc: tc, at: lt + 160, ref: r4, br: j === 0 && unfit[i] ? unfit[i] : '' }); la = l1; k++ });
    a = a1 });
  // 이름표 — 좌우로 나눠 세로로 펼침
  labels.forEach(function (L) { L.right = Math.sin(L.am) >= 0; var pm = pt(L.ref + 26, L.am); L.ny = pm[1]; L.w = 268; var lines = [];
    if (L.l) { L.t1 = L.l.title || ''; L.t2 = L.l.value || ''; L.tx = h.wrap(L.l.text || '', 12.5, L.w, 0).slice(0, 2); L.hh = 34 + (L.br ? 18 : 0) + (L.t2 ? 21 : 0) + L.tx.length * 17 } else { L.t1 = L.title; L.t2 = ''; L.tx = []; L.hh = 34 } });
  [true, false].forEach(function (rt2) { var ls = labels.filter(function (L) { return L.right === rt2 }).sort(function (p, q) { return p.ny - q.ny }), y = -1e9;
    ls.forEach(function (L) { L.y = Math.max(L.ny - L.hh / 2, y + 10, 0); y = L.y + L.hh });
    var over = y - 478; if (over > 0) { var yy = 478; for (var q = ls.length - 1; q >= 0; q--) { ls[q].y = Math.min(ls[q].y, yy - ls[q].hh); yy = ls[q].y - 10 } } });
  labels.forEach(function (L) { var sg = L.right ? 1 : -1, ex = cx + sg * (r4 + 40), p1 = pt(r4 + 3, L.am), pm = pt(r4 + 24, L.am), ly = L.y + L.hh / 2, tcol = L.tc || P.g65, g = L.l ? grp[L.i] : grp[L.i];
    var path = E('path', { d: 'M' + p1 + ' L' + pm + ' L' + (ex) + ' ' + ly, fill: 'none', stroke: tcol, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-at': L.at || 600, 'data-fx': 'draw', 'data-ms': 260 }, svg), dot = E('circle', { cx: p1[0], cy: p1[1], r: 3.5, fill: tcol, 'data-at': L.at || 600, 'data-fx': 'fade', 'data-ms': 100 }, svg);
    grp[L.i].push(E('rect', { x: L.right ? ex : ex - 300, y: L.y, width: 300, height: L.hh, rx: 10, fill: ctx.dark ? P.g08 : P.paper, stroke: tcol, 'stroke-width': 0, 'data-at': (L.at || 600) + 60, 'data-fx': 'fade', 'data-ms': 200 }, svg));
    grp[L.i].push(E('rect', { x: L.right ? ex : ex + 300 - 5 - 300, y: L.y, width: 5, height: L.hh, rx: 2.5, fill: tcol, 'data-at': (L.at || 600) + 60, 'data-fx': 'fade', 'data-ms': 200 }, svg));
    var tg = E('g', { 'data-at': (L.at || 600) + 120, 'data-fx': 'fade', 'data-ms': 260 }, svg), anc = L.right ? 'start' : 'end', tx = ex + sg * 18, yy = L.y + 9;
    if (L.br) { h.T(tg, tx, yy + 13, L.br + ' 갈래', { 'text-anchor': anc, 'font-size': 12.5, 'font-weight': 700, fill: L.tc }); yy += 18 }
    h.T(tg, tx, yy + 15, L.t1, { 'text-anchor': anc, 'font-size': 15.5, 'font-weight': 700, fill: P.ink }); yy += 21;
    if (L.t2) { h.T(tg, tx, yy + 15, L.t2, { 'text-anchor': anc, 'font-size': 17, 'font-weight': 700, fill: P.dark }); yy += 21 }
    L.tx.forEach(function (t) { h.T(tg, tx, yy + 12, t, { 'text-anchor': anc, 'font-size': 13, fill: P.sub }); yy += 17 });
    grp[L.i].push(path, dot, tg) });
  // 읽는 법
  var cap = '중심 = ' + (rt.title || '뿌리') + (rt.sub ? '(' + rt.sub + ')' : '') + ' · 안쪽 고리 = 갈래 · 바깥 고리 = 세부 항목' + (prop ? ' · 조각 크기 = 값의 절댓값' : '');
  h.T(svg, 584, 502, cap, { 'text-anchor': 'middle', 'font-size': 12.5, fill: P.mute, 'data-at': 600, 'data-fx': 'fade' });
  beat(ctx.root, grp, s) };

LAY.table = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, rt = s.root || {}, br = (s.branches || []).slice(0, 4), B = br.length, svg = null, grp = br.map(function () { return [] });
  var nL = br.reduce(function (a, b) { return a + (b.leaves || []).length }, 0), HH = 64, lg = 8, bg = 14, top = HH + 14, lh = Math.min(100, (512 - top - (nL - B) * lg - (B - 1) * bg) / nL), jobs = [];
  var all = []; br.forEach(function (b) { (b.leaves || []).forEach(function (l) { all.push(numOf(l.value)) }) });
  var hasV = all.some(function (v) { return v != null }), maxA = Math.max.apply(null, all.map(function (v) { return v == null ? 0 : Math.abs(v) })) || 1, neg = all.some(function (v) { return v != null && v < 0 });
  var BW = 190, TX = BW + 16, VW = hasV ? 150 : 0, BX = 1168 - VW - 16 - 300, barMax = 280;
  D(bd, 0, 0, 1168, HH, '<b style="font-size:20px">' + h.md(rt.title || '') + '</b>' + (rt.value ? '<em style="font-style:normal;font-size:26px;font-weight:700;color:' + ON + ';letter-spacing:-.02em;margin-left:18px">' + h.md(rt.value) + '</em>' : '') + (rt.sub ? '<span style="font-size:16px;opacity:.9;margin-left:auto">' + h.md(rt.sub) + '</span>' : '') + (hasV ? '<span style="font-size:13px;font-weight:700;background:' + ON + ';color:' + P.dark + ';border-radius:999px;padding:3px 12px;margin-left:' + (rt.sub ? 16 : 'auto') + 'px">막대 = 값의 크기' + (neg ? ' · 속 빈 막대 = 마이너스' : '') + '</span>' : ''),
    'display:flex;align-items:center;padding:0 26px;border-radius:6px;background:' + P.dark + ';color:' + ON, { 'data-at': 0, 'data-fx': 'wipe', 'data-ms': 420 });
  var y = top, li = 0;
  br.forEach(function (b, i) { var ls = b.leaves || [], tc = tone(P, b, i), gh = ls.length * lh + (ls.length - 1) * lg, ta = 380 + i * 200;
    grp[i].push(D(bd, 0, y, BW, gh, '<b style="font-size:18px;line-height:1.3">' + h.md(b.title || '') + '</b>' + (b.sub ? '<span style="font-size:13px;opacity:.92;margin-top:4px">' + h.md(b.sub) + '</span>' : ''),
      'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 12px;border-radius:6px;background:' + tc + ';color:' + ON, { 'data-at': ta, 'data-fx': 'left', 'data-ms': 360, 'data-key': b.title || '' }));
    ls.forEach(function (l, j) { var yy = y + j * (lh + lg), v = numOf(l.value), tl = ta + 200 + li * 150, bw = v == null ? 0 : Math.max(4, Math.abs(v) / maxA * barMax);
      grp[i].push(D(bd, TX, yy, 1168 - TX, lh, '', 'border-radius:6px;background:' + S.CARD + ';border:1px solid ' + S.BD, { 'data-at': tl, 'data-fx': 'rise', 'data-ms': 280 }));
      grp[i].push(D(bd, TX, yy, (hasV ? BX - 20 : 1168) - TX, lh, '<b style="font-size:16px;color:' + P.ink + ';line-height:1.35">' + h.md(l.title || '') + '</b>' + (l.text ? '<span style="font-size:13px;color:' + P.sub + ';line-height:1.42;margin-top:2px">' + h.md(l.text) + '</span>' : ''),
        'display:flex;flex-direction:column;justify-content:center;padding:0 20px', { 'data-at': tl + 60, 'data-fx': 'rise', 'data-ms': 280 }));
      if (hasV && v != null) jobs.push(function (svg) { grp[i].push(E('rect', { x: BX, y: yy + lh / 2 - 11, width: bw, height: 22, rx: 4, fill: v < 0 ? S.CARD : tc, stroke: tc, 'stroke-width': v < 0 ? 2.4 : 0, 'data-at': tl + 120, 'data-fx': 'growx', 'data-ms': 420 }, svg)) });
      if (hasV && l.value) grp[i].push(D(bd, 1168 - VW - 16, yy, VW, lh, h.md(l.value), 'display:flex;align-items:center;justify-content:flex-end;font-size:16px;font-weight:700;color:' + P.dark + ';font-variant-numeric:tabular-nums', { 'data-at': tl + 120, 'data-fx': 'fade', 'data-ms': 300 }));
      li++ });
    y += gh + bg });
  svg = K.svg(ctx); jobs.forEach(function (j) { j(svg) });
  beat(ctx.root, grp, s) };

ECOM.parts.tree = function (bd, s, ctx) { var f = s.layout && LAY[s.layout]; return f ? f(bd, s, ctx) : treeDefault(bd, s, ctx) };
ECOM.parts.tree.layouts = ['default', 'topdown', 'sunburst', 'table'];
ECOM.parts.tree.dark = ['topdown', 'sunburst', 'table'];
})();
