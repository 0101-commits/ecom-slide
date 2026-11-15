/* p_relay.js — 이어달리기(영상 장면 문법). 칸 3~5개가 화살로 이어지며 결과 칸이 마지막에 커짐. 기본 DOM = 끝 모습, 카메라 밀기 · 바통은 _hook 안에서만.
   배치 pan   : 카메라가 오른쪽으로 밀려가며 칸이 하나씩 나타나고 마지막 칸 아이콘이 커짐(끝 = 전체 보임, 마지막 칸 큼) · 기본(default)
   배치 steps : 제자리 판 — 위 트랙을 바통이 달려 번호가 켜지고 카드가 밝아짐 + 아래 결과 띠
   칸 steps[{title,text,value,ico,via}] 3~5(via = 이 칸에서 다음 칸으로 넘어가는 말) · tags(칸마다 위 작은 글, 없으면 n단계) · legend(문장 하나)
       result{label,value,dec,unit,text}(steps 배치 아래 띠) · ico = coin · house · factory · chart · people · ship · bolt · bank · globe · cart · doc · up · down */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T, K = ECOM.kx;
var ICO = {
  coin: 'M24 8a16 16 0 1 0 .01 0zM24 14v20M19 19.5c0-4 10-4 10 0s-10 3-10 7 10 4 10 0',
  house: 'M7 24L24 9l17 15M12 21v17h24V21M20 38V28h8v10',
  factory: 'M7 39V21l12 7v-7l12 7V12h8v27zM13 33h4M23 33h4M33 33h2',
  chart: 'M8 40h34M14 35V25M24 35V14M34 35V21',
  people: 'M24 11a6 6 0 1 0 .01 0zM12 40c0-9 6-14 12-14s12 5 12 14z',
  ship: 'M7 29h34l-6 10H13zM15 29V19h18v10M22 19v-7h4v7',
  bolt: 'M28 6L12 27h11l-3 15 16-21H25z',
  bank: 'M6 18L24 8l18 10zM11 22v14M20 22v14M28 22v14M37 22v14M7 40h34',
  globe: 'M24 8a16 16 0 1 0 .01 0zM8 24h32M24 8c-9 9-9 23 0 32M24 8c9 9 9 23 0 32',
  cart: 'M6 10h6l5 21h20l4-15H14M20 38a2 2 0 1 0 .01 0M34 38a2 2 0 1 0 .01 0',
  doc: 'M13 7h16l8 8v26H13zM29 7v8h8M18 24h14M18 31h14',
  up: 'M24 41V10M12 22L24 9l12 13',
  down: 'M24 7v31M12 26l12 13 12-13'
};
function icon(p, k, x, y, sz, col, w) { return E('path', { d: ICO[k] || ICO.doc, fill: 'none', stroke: col, 'stroke-width': w || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(' + x + ',' + y + ') scale(' + (sz / 48) + ') translate(-24,-24)' }, p) }
function hook(ctx, items, end) { ctx.root._hook = function () { if (h.RM()) return 0; var e = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; e = Math.max(e, it.at + it.ms) }); return end || e } }
function fadeIt(el, at, ms) { return { el: el, at: at, ms: ms || 450, kf: [{ opacity: 0 }, { opacity: 1 }] } }
function drawIt(el, at, ms) { return { el: el, at: at, ms: ms || 380, kf: [{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .97, opacity: 1, offset: .03 }, { strokeDashoffset: 0, opacity: 1 }] } }
function fitSize(t, size, w, bold) { while (size > 13 && h.textW(t || '', size, bold) > w) size -= .5; return size }

/* 칸 글 : 제목 · 값 · 설명을 cx 가운데로 쌓음. y 는 제목 기준선, 끝난 y 를 돌려줌 */
function cellText(g, st, cx, y, w, big, P, f) {
  f = f || (big ? { t: 25, v: 54, x: 17 } : { t: 21, v: 38, x: 15.5 });
  var ts = fitSize(st.title, f.t, w, 1), tl = h.wrap(st.title || '', ts, w, 1).slice(0, 2);
  tl.forEach(function (l, i) { T(g, cx, y + i * (ts + 5), l, { 'text-anchor': 'middle', 'font-size': ts, 'font-weight': 700, fill: P.ink }) }); y += (tl.length - 1) * (ts + 5);
  if (st.value != null) { var vs = f.v; y += vs + 10; T(g, cx, y, st.value, { 'text-anchor': 'middle', 'font-size': fitSize(st.value, vs, w, 1), 'font-weight': 800, fill: big ? P.dark : P.main }) }
  if (st.text) { var fs = f.x; h.wrap(st.text, fs, w).slice(0, f.n || 3).forEach(function (l, i) { T(g, cx, y + 28 + i * (fs + 6), l, { 'text-anchor': 'middle', 'font-size': fs, fill: P.sub }) }) }
}

function pan(bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), st = (s.steps || []).slice(0, 5), n = st.length, onM = ctx.dark ? P.bg : '#fff', r0 = n >= 5 ? 56 : n === 4 ? 66 : 72, cy = 190, PF = { t: 23, v: 40, x: 16, n: 3 }, PB = { t: 27, v: 50, x: 18, n: 2 };
  if (!n) return;
  var wt = st.map(function (_, i) { return i === n - 1 ? 1.5 : 1 }), tot = wt.reduce(function (a, b) { return a + b }, 0), sl = [], x = 0;
  wt.forEach(function (w) { var ww = 1168 * w / tot; sl.push({ x: x, w: ww, cx: x + ww / 2 }); x += ww });
  var rr = st.map(function (_, i) { return i === n - 1 ? r0 * 1.35 : r0 });
  var world = E('g', {}, svg), items = [];
  if (st.some(function (q) { return q.t })) { var tl0 = E('g', {}, world); E('line', { x1: 24, x2: 1130, y1: 458, y2: 458, stroke: P.axis, 'stroke-width': 1.6 }, tl0); K.head(tl0, 1152, 458, 0, P.axis, 11, {}); T(tl0, 1156, 440, '시간', { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute }) }
  var cells = [], arrs = [], lines = [], bigIc = null;
  st.forEach(function (q, i) {
    var last = i === n - 1, g = E('g', { 'data-key': q.title || '' }, world), c = sl[i].cx, r = rr[i], ig = E('g', { style: 'transform-box:fill-box;transform-origin:center' }, g);
    T(g, c, cy - r - (last ? 30 : 16), q.tag || (i + 1) + '단계', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: last ? P.main : P.mute });
    if (last) E('circle', { cx: c, cy: cy, r: r + 18, fill: P.g08 }, ig);
    E('circle', { cx: c, cy: cy, r: r, fill: last ? P.main : P.g08, stroke: last ? 'none' : P.g65, 'stroke-width': 2.5 }, ig);
    icon(ig, q.ico, c, cy, r * 1.05, last ? onM : P.main, last ? 3 : 3.2);
    cellText(g, q, c, cy + r + (last ? 38 : 36), sl[i].w - 36, last, P, last ? PB : PF);
    if (q.t) { E('circle', { cx: c, cy: 458, r: 6, fill: last ? P.main : P.g65 }, g); T(g, c, 486, q.t, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: P.ink }) }
    cells.push(g); if (last) bigIc = ig });
  for (var i = 0; i < n - 1; i++) {
    var x1 = sl[i].cx + rr[i] + 12, x2 = sl[i + 1].cx - rr[i + 1] - (i + 1 === n - 1 ? 34 : 12), g = E('g', {}, world);
    var pa = E('path', { d: 'M' + x1 + ' ' + cy + ' H' + (x2 - 9), fill: 'none', stroke: P.g65, 'stroke-width': 3.2, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, g);
    var hd = K.head(g, x2, cy, 0, P.g65, 13, {});
    var vl = st[i].via ? h.wrap(st[i].via, 12.5, x2 - x1 - 8, 1).slice(0, 3) : [];
    var vt = E('g', {}, g); vl.forEach(function (l, j) { T(vt, (x1 + x2) / 2, cy - 14 - (vl.length - 1 - j) * 16, l, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: P.sub }) });
    arrs.push({ g: g, pa: pa, hd: hd, vt: vt }) }
  var lg = E('g', {}, svg), ly = 20;
  E('circle', { cx: 12, cy: ly, r: 9, fill: P.g08, stroke: P.g65, 'stroke-width': 2 }, lg); T(lg, 28, ly + 4.5, '앞 단계', { 'font-size': 12.5, fill: P.sub });
  E('circle', { cx: 100, cy: ly, r: 9, fill: P.main }, lg); T(lg, 116, ly + 4.5, '마지막 결과 단계(크게 표시)', { 'font-size': 12.5, fill: P.sub });
  if (s.legend) T(lg, 12, ly + 26, s.legend, { 'font-size': 12.5, fill: P.mute });
  var S = 1.75, leg = Math.max(560, Math.min(850, Math.round(1900 / Math.max(1, n - 1)))), cam = leg - 60, H0 = 500;
  function view(i) { return 'translate(' + (584 - S * sl[i].cx) + 'px,' + (200 - S * cy) + 'px) scale(' + S + ')' }
  var pts = [[0, view(0)], [H0, view(0)]];
  for (var j = 1; j < n; j++) { var sj = H0 + (j - 1) * leg; pts.push([sj, view(j - 1)], [sj + cam, view(j)]) }
  var sL = H0 + (n - 1) * leg; pts.push([sL, view(n - 1)], [sL + 800, 'translate(0px,0px) scale(1)']);
  var T0 = pts[pts.length - 1][0];
  items.push({ el: world, at: 0, ms: T0, ease: 'linear', kf: pts.map(function (p) { return { transform: p[1], offset: p[0] / T0, easing: 'cubic-bezier(.4,0,.2,1)' } }) });
  items.push(fadeIt(cells[0], 0, 400));
  for (var k = 1; k < n; k++) { var sk = H0 + (k - 1) * leg;
    items.push(drawIt(arrs[k - 1].pa, sk, 380), fadeIt(arrs[k - 1].hd, sk + 300, 200), fadeIt(arrs[k - 1].vt, sk + 200, 360), fadeIt(cells[k], sk + 240, 460)) }
  items.push({ el: bigIc, at: sL + 100, ms: 700, ease: 'cubic-bezier(.2,.8,.2,1)', kf: [{ transform: 'scale(.66)' }, { transform: 'scale(1)' }] });
  hook(ctx, items, T0);
  ctx.root.setAttribute('data-gap', 300) }

function steps(bd, s, ctx) {
  var P = ctx.P, svg = ctx.svg(512), st = (s.steps || []).slice(0, 5), n = st.length, rs = s.result || null;
  if (!n) return;
  var fz = n <= 3 ? { t: 23, v: 44, x: 17 } : n === 4 ? { t: 20, v: 38, x: 15 } : { t: 18, v: 32, x: 14 }, ir = n <= 3 ? 42 : 36, gp = 18, cw = (1168 - (n - 1) * gp) / n, ty = 44, cx = st.map(function (_, i) { return i * (cw + gp) + cw / 2 }), cardY = 90, cardH = rs ? 296 : 400, bandY = cardY + cardH + 16;
  var items = [], onB = ctx.dark ? P.bg : '#fff';
  E('line', { x1: cx[0], x2: cx[n - 1], y1: ty, y2: ty, stroke: P.g18, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
  var lit = E('line', { x1: cx[0], x2: cx[n - 1], y1: ty, y2: ty, stroke: P.main, 'stroke-width': 5, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 }, svg);
  for (var i = 0; i < n - 1; i++) if (st[i].via) { var vl = h.wrap(st[i].via, 12.5, cw - 60, 1).slice(0, 1);
    T(svg, (cx[i] + cx[i + 1]) / 2, ty - 14, vl[0], { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: P.sub }) }
  var leg = 560, H0 = 300, stn = [], cards = [];
  st.forEach(function (q, i) {
    var x0 = i * (cw + gp), g = E('g', { 'data-key': q.title || '' }, svg), cc = cx[i];
    E('rect', { x: x0, y: cardY, width: cw, height: cardH, rx: 14, fill: P.paper, stroke: P.line }, g);
    E('circle', { cx: cc, cy: cardY + 24 + ir, r: ir, fill: P.g08, stroke: P.g65, 'stroke-width': 2.2 }, g); icon(g, q.ico, cc, cardY + 24 + ir, ir * 1.08, P.main, 3.2);
    cellText(g, q, cc, cardY + 24 + 2 * ir + 40, cw - 36, false, P, fz); cards.push(g);
    var sg = E('g', {}, svg); var sc = E('circle', { cx: cc, cy: ty, r: 18, fill: P.main, stroke: ctx.dark ? P.bg : '#fff', 'stroke-width': 3 }, sg);
    T(sg, cc, ty + 5.5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: onB }); stn.push([sc, sg]) });
  var baton = E('circle', { cx: cx[0], cy: ty, r: 11, fill: P.warn, stroke: ctx.dark ? P.bg : '#fff', 'stroke-width': 3, opacity: 0 }, svg);
  if (rs) { var g = E('g', { 'data-at': H0 + n * leg + 100, 'data-fx': 'rise', 'data-ms': 500, 'data-key': rs.label || '결과' }, svg);
    E('rect', { x: 0, y: bandY, width: 1168, height: 512 - bandY, rx: 14, fill: ctx.dark ? P.main : P.dark }, g);
    T(g, 32, bandY + 34, rs.label || '', { 'font-size': 17, 'font-weight': 700, fill: onB, 'fill-opacity': .9 });
    var by = bandY + 88; T(g, 32, by, h.nf(rs.value, rs.dec || 0) + (rs.unit || ''), { 'font-size': 46, 'font-weight': 800, fill: onB, 'data-at': H0 + n * leg + 300, 'data-fx': 'count', 'data-count': rs.value, 'data-dec': rs.dec || 0, 'data-suf': rs.unit || '' });
    if (rs.text) h.wrap(rs.text, 18, 640, 1).slice(0, 3).forEach(function (l, i, a) { T(g, 440, bandY + 62 - (a.length - 1) * 12 + i * 26, l, { 'font-size': 18, 'font-weight': 700, fill: onB, 'fill-opacity': .95 }) }) }
  var legY = 506; if (s.legend) T(svg, 4, legY, s.legend, { 'font-size': 12.5, fill: P.mute });
  items.push({ el: lit, at: H0, ms: leg * (n - 1), ease: 'linear', kf: [{ strokeDashoffset: 1, opacity: 0 }, { strokeDashoffset: .97, opacity: 1, offset: .03 }, { strokeDashoffset: 0, opacity: 1 }] });
  var bk = [{ opacity: 1, transform: 'translateX(0px)', offset: 0 }, { opacity: 1, transform: 'translateX(' + (cx[n - 1] - cx[0]) + 'px)', offset: .94 }, { opacity: 0, transform: 'translateX(' + (cx[n - 1] - cx[0]) + 'px)', offset: 1 }];
  items.push({ el: baton, at: H0, ms: leg * (n - 1) + 160, ease: 'linear', kf: bk });
  st.forEach(function (q, i) { var t = H0 + i * leg - (i ? 80 : 0);
    items.push({ el: stn[i][0], at: t, ms: 300, kf: [{ fill: P.g18 }, { fill: P.main }] });
    items.push({ el: cards[i], at: t, ms: 420, kf: [{ opacity: .28 }, { opacity: 1 }] }) });
  hook(ctx, items, H0 + (n - 1) * leg + 400);
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.relay = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'pan'; ({ pan: pan, steps: steps }[L] || pan)(bd, s, ctx) };
ECOM.parts.relay.layouts = ['default', 'pan', 'steps'];
ECOM.parts.relay.dark = ['default', 'pan', 'steps'];
})();
