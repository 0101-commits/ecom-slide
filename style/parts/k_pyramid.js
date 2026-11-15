/* pyramid — 층 피라미드(CW44 8쪽) : 아래층부터 쌓임 → 층마다 설명 상자 → 가운데 순환(선택) 그려짐 → 오른쪽 괄호 메모가 밀려 들어옴
   layers[3~5 · 0 = 꼭대기]{label,sub,desc,note:{title,items[]}|'글'} · cycle{label,from,to}(층 번호 범위 · 가운데 둥근 화살) · beats[{spot:층}]
   layout(없으면 default = 위 그림) : stairs 계단(아래층이 왼쪽 낮은 계단 · 계단 위 카드) · rings 동심원(바깥 = 넓은 아래층, 오른쪽 설명 줄)
     · bars 층 막대(길이 = layers[].value, 없으면 아래로 갈수록 길게) · blocks 블록 쌓기(이름 띠 + 설명, 폭 계단식) · funnel 깔때기형(맨 아래층 = 첫 단계, layers[].value 모두 있으면 폭 = 값 + 줄어든 몫 표시)
     새 배치는 cycle 은 안 그림, 선택 칸 value(숫자)·s.unit·s.dec 만 더 받음. 짙은 바탕(bg deep) 가능 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
var FILL = [C.dark, C.main, C.g65, C.g40, C.g18];
var basePyramid = function (bd, s, ctx) {
  var root = ctx.root, L = (s.layers || []).slice(0, 5), N = L.length, cyc = s.cycle || null, PW = 500, AX = PW / 2, GP = 8;
  var unit = (512 - (N - 1) * GP) / (N - 1 + 1.3), hs = L.map(function (_, i) { return i ? unit : unit * 1.3 }), ys = [], yy = 0;
  hs.forEach(function (v) { ys.push(yy); yy += v + GP });
  function wAt(y) { return PW * y / 512 }
  var cA = cyc ? 528 : null, dX = cyc ? 672 : 536, dW = cyc ? 262 : 340, nX = dX + dW + 20, nW = 1168 - nX;
  var svg = K.svg(ctx, false), bands = h.lv(svg, 1, { 'data-fx': 'fade', 'data-ms': 500 }), grp = L.map(function () { return [] });
  E('path', { d: 'M' + (AX + 14) + ' 0 H1168 V512 H' + (PW + 14) + ' Z', fill: C.paper }, bands);
  ys.slice(1).forEach(function (y) { var yb = y - GP / 2; E('line', { x1: wAt(yb) / 2 + AX + 22, x2: 1168, y1: yb, y2: yb, stroke: C.gray, 'stroke-dasharray': '3 4' }, bands) });
  var T0 = 250, PER = 380, tEnd = T0 + N * PER;
  L.forEach(function (o, i) { var ya = ys[i], yb = ya + hs[i], wa = wAt(ya), wb = wAt(yb), f = FILL[i] || C.g18, dark = [C.dark, C.main, C.g65].indexOf(f) >= 0;
    var t = T0 + (N - 1 - i) * PER, g = E('g', { 'data-at': t, 'data-fx': 'rise', 'data-ms': 420 }, svg);
    E('path', { d: 'M' + (AX - wa / 2) + ' ' + ya + ' H' + (AX + wa / 2) + ' L' + (AX + wb / 2) + ' ' + yb + ' H' + (AX - wb / 2) + ' Z', fill: f }, g);
    var top = i === 0, ly = top ? ya + hs[i] * .66 : ya + hs[i] / 2 + (o.sub ? -4 : 6), lw = wAt(ly - 10) - 26, fs = 17;
    while (h.textW(o.label || '', fs, 1) > lw && fs > 13.5) fs -= .5;
    T(g, AX, ly, o.label || '', { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: dark ? '#fff' : C.ink });
    if (o.sub) { var sw = wAt(ly + 14) - 24, ss = 13; while (h.textW(o.sub, ss) > sw && ss > 11.5) ss -= .5; T(g, AX, ly + 21, o.sub, { 'text-anchor': 'middle', 'font-size': ss, fill: dark ? '#fff' : C.sub, 'fill-opacity': dark ? .86 : 1 }) }
    grp[i].push(g);
    if (o.desc) grp[i].push(K.D(bd, 'kx k-pyd', dX, ya + 8, dW, hs[i] - 16, '<span>' + h.md(o.desc) + '</span>', { 'data-at': t + 200, 'data-fx': 'fade', 'data-ms': 360 }));
    if (o.note) { var nt = typeof o.note === 'string' ? { items: [o.note] } : o.note, ng = E('g', { 'data-at': tEnd + 650 + (N - 1 - i) * 110, 'data-fx': 'right', 'data-ms': 360 }, svg), y1 = ya + 10, y2 = yb - 10, xm = nX + 2;
      E('path', { d: 'M' + (xm + 9) + ' ' + y1 + ' Q' + xm + ' ' + y1 + ' ' + xm + ' ' + (y1 + 10) + ' V' + ((y1 + y2) / 2 - 8) + ' Q' + xm + ' ' + (y1 + y2) / 2 + ' ' + (xm - 6) + ' ' + (y1 + y2) / 2
        + ' Q' + xm + ' ' + (y1 + y2) / 2 + ' ' + xm + ' ' + ((y1 + y2) / 2 + 8) + ' V' + (y2 - 10) + ' Q' + xm + ' ' + y2 + ' ' + (xm + 9) + ' ' + y2, fill: 'none', stroke: C.g65, 'stroke-width': 1.6 }, ng);
      var nd = K.D(bd, 'kx k-pyn', nX + 18, ya + 4, nW - 18, hs[i] - 8, (nt.title ? '<div class="k-pynt">' + h.md(nt.title) + '</div>' : '') + (nt.items || []).map(function (x) { return '<div class="k-pyni">' + h.md(x) + '</div>' }).join(''),
        { 'data-at': tEnd + 650 + (N - 1 - i) * 110, 'data-fx': 'right', 'data-ms': 360 }); grp[i].push(ng, nd) } });
  if (cyc) { var a = Math.max(0, Math.min(N - 1, cyc.from == null ? 1 : cyc.from)), b = Math.max(a, Math.min(N - 1, cyc.to == null ? N - 2 : cyc.to)), ya2 = ys[a] + hs[a] * .3, yb2 = ys[b] + hs[b] * .7, cx = cA + 64, cy = (ya2 + yb2) / 2, r = Math.min(64, (yb2 - ya2) / 2 + 8);
    var cg = E('g', {}, svg), t2 = tEnd + 150;
    E('path', { d: 'M' + (cx + r * Math.sin(.35)) + ' ' + (cy - r * Math.cos(.35)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.sin(2.75)) + ' ' + (cy - r * Math.cos(2.75)), fill: 'none', stroke: C.g40, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-at': t2, 'data-fx': 'draw', 'data-ms': 520 }, cg);
    E('path', { d: 'M' + (cx - r * Math.sin(.35)) + ' ' + (cy + r * Math.cos(.35)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx - r * Math.sin(2.75)) + ' ' + (cy + r * Math.cos(2.75)), fill: 'none', stroke: C.g40, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-at': t2 + 260, 'data-fx': 'draw', 'data-ms': 520 }, cg);
    var th = 2.75, tx1 = Math.cos(th), ty1 = Math.sin(th);
    K.head(svg, cx + r * Math.sin(th) + tx1 * 12, cy - r * Math.cos(th) + ty1 * 12, Math.atan2(ty1, tx1), C.g65, 16, { 'data-at': t2 + 480, 'data-fx': 'fade' }, .75);
    K.head(svg, cx - r * Math.sin(th) - tx1 * 12, cy + r * Math.cos(th) - ty1 * 12, Math.atan2(-ty1, -tx1), C.g65, 16, { 'data-at': t2 + 740, 'data-fx': 'fade' }, .75);
    var lb = (cyc.label || '').split('\n'); lb.forEach(function (t, j) { T(svg, cx, cy + 6 + (j - (lb.length - 1) / 2) * 19, t, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.dark, 'data-at': t2 + 200, 'data-fx': 'pop' }) });
    (cyc.top ? [[cyc.top, ys[a] - 2 + 20]] : []).concat(cyc.bottom ? [[cyc.bottom, ys[b] + hs[b] - 8]] : []).forEach(function (q) { T(svg, cx, q[1], q[0], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.sub, 'data-at': t2, 'data-fx': 'fade' }) }) }
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } };
/* ───────── 새 배치 5종 (s.layout) ───────── */
/* 글 쌓기 도우미 : items[{s,size,min,bold,fill,op,gap}] 를 폭 w · 높이 mh 안에 맞춰(필요하면 글자 줄임) 위에서부터 씀. g 가 null 이면 높이만 잼 */
function mz(it, k, w) { var sz = Math.max(it.min || 12.5, Math.round(it.size * k * 2) / 2), ls = h.wrap(String(it.s == null ? '' : it.s).replace(/\*\*/g, ''), sz, w, it.bold ? 1 : 0); return { sz: sz, ls: ls, h: ls.length * sz * 1.36 + (it.gap || 0), it: it } }
function stk(g, x, y, w, mh, items, va, an) {
  items = items.filter(function (it) { return it.s }); var k = 1, ms = [], tot = 0;
  for (; ;) { ms = items.map(function (it) { return mz(it, k, w) }); tot = ms.reduce(function (a, m) { return a + m.h }, 0) - (ms[0] ? ms[0].it.gap || 0 : 0); if (tot <= mh || k <= .72) break; k -= .04 }
  if (!g) return tot;
  var yy = va === 'mid' ? y + (mh - tot) / 2 : va === 'bot' ? y + mh - tot : y;
  ms.forEach(function (m, i) { if (i) yy += m.it.gap || 0; m.ls.forEach(function (l, j) { T(g, x, yy + m.sz * .95 + j * m.sz * 1.36, l, { 'text-anchor': an || 'start', 'font-size': m.sz, 'font-weight': m.it.bold ? 700 : 400, fill: m.it.fill, 'fill-opacity': m.it.op }) }); yy += m.ls.length * m.sz * 1.36 });
  return tot }
function fitS(str, size, min, w, bold) { while (size > min && h.textW(str, size, bold ? 1 : 0) > w) size -= .5; return size }
/* 층 색 : 0 = 꼭대기(가장 진함) → 아래로 연해짐. t = 그 면 위 글 색 */
function ramp(ctx, N) { var P = ctx.P, dk = ctx.dark, a = dk ? [P.main, P.g65, P.g40, P.g18, P.g08] : [P.dark, P.main, P.g65, P.g40, P.g18];
  return a.slice(0, N).map(function (f, i) { var lt = dk ? i < 2 : i < 3; return { f: f, t: lt ? (dk ? P.bg : '#fff') : P.ink, s: lt ? (dk ? P.bg : '#fff') : P.sub } }) }
function noteItems(o, P) { var nt = !o.note ? null : typeof o.note === 'string' ? { items: [o.note] } : o.note; if (!nt) return [];
  var r = []; if (nt.title) r.push({ s: nt.title, size: 13, bold: 1, fill: P.ink, gap: 6 }); (nt.items || []).forEach(function (x, i) { r.push({ s: x, size: 12.5, fill: P.sub, gap: !nt.title && !i ? 6 : 1 }) }); return r }
function bodyItems(o, P, dsz) { return [{ s: o.desc, size: dsz || 14.5, bold: 1, fill: P.ink }].concat(noteItems(o, P)) }
function prep(ctx, s, N) { var P = ctx.P, svg = K.svg(ctx), grp = []; for (var i = 0; i < N; i++) grp.push([]); return { P: P, svg: svg, R: ramp(ctx, N), grp: grp } }
function beats(root, s, grp) { grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) } }
function cap(svg, P, txt, x, y, an) { E('text', { x: x, y: y, 'text-anchor': an || 'start', 'font-size': 12.5, 'font-weight': 600, fill: P.mute, 'data-at': 1700, 'data-fx': 'fade' }, svg).textContent = txt }
function val(o, s) { return o.value != null && isFinite(+o.value) ? h.nf(+o.value, s.dec != null ? s.dec : 0) + (s.unit || '') : '' }
var NEW = {};

/* stairs 계단 : 아래층이 맨 왼쪽 낮은 계단, 위로 갈수록 오른쪽에서 높아짐. 계단 위 빈 곳에 층 설명 + 메모 카드 */
NEW.stairs = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, cw = 1168 / N, yb = 484, GP = 6;
  L.forEach(function (o, i) { var k = N - 1 - i, x = k * cw, bh = N > 1 ? 214 + k * (140 / (N - 1)) : 280, yt = yb - bh, f = q.R[i], at = 250 + k * 300;
    var g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'rise', 'data-ms': 420 }, svg), w = cw - GP - 4;
    E('rect', { x: x, y: yt, width: cw - GP, height: bh, rx: 10, fill: f.f }, g);
    E('rect', { x: x, y: yt + 10, width: cw - GP, height: bh - 10, fill: f.f }, g);
    var fs = fitS(o.label || '', 20, 14, w - 28, 1); T(g, x + 18, yt + 36, o.label || '', { 'font-size': fs, 'font-weight': 700, fill: f.t });
    if (o.sub) T(g, x + 18, yt + 60, o.sub, { 'font-size': fitS(o.sub, 14, 12.5, w - 28), fill: f.s, 'fill-opacity': .9 });
    T(g, x + cw - GP - 16, yb - 14, String(i + 1), { 'text-anchor': 'end', 'font-size': 26, 'font-weight': 700, fill: f.t, 'fill-opacity': .55 });
    q.grp[i].push(g);
    var items = bodyItems(o, P, 15), mh = yt - 22, th = stk(null, 0, 0, w - 28, mh - 20, items); if (!o.desc && !o.note) return;
    var ch = Math.min(mh, th + 24), cy = yt - 10 - ch, cg = E('g', { 'data-key': o.label || '', 'data-at': at + 220, 'data-fx': 'fade', 'data-ms': 360 }, svg);
    E('rect', { x: x, y: cy, width: cw - GP, height: ch, rx: 10, fill: P.paper }, cg);
    E('path', { d: 'M' + (x + 28) + ' ' + (yt - 10) + ' l8 9 l8 -9 z', fill: P.paper }, cg);
    stk(cg, x + 14, cy + 12, w - 28, ch - 20, items, 'mid'); q.grp[i].push(cg) });
  cap(svg, P, '계단이 높을수록 위 층 · 오른쪽 위로 올라가는 위계', 0, 504);
  beats(ctx.root, s, q.grp) };

/* rings 동심원 : 바깥 원 = 아래(넓은) 층 · 안쪽 = 위 층. 오른쪽에 층마다 설명 줄(번호로 이어짐) */
NEW.rings = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, cx = 300, B = 506, R0 = 250, rh = 500 / N, tx = 600;
  for (var k = N - 1; k >= 0; k--) { var o = L[k], r = R0 * (k + 1) / N, g = E('g', { 'data-key': o.label || '', 'data-at': 200 + (N - 1 - k) * 280, 'data-fx': 'zoom', 'data-ms': 420 }, svg);
    E('circle', { cx: cx, cy: B - r, r: r, fill: q.R[k].f, stroke: ctx.dark ? P.bg : '#fff', 'stroke-width': 2 }, g); q.grp[k].push(g) }
  L.forEach(function (o, k) { var yc = B - rh * (k + .5), f = q.R[k], g = E('g', { 'data-key': o.label || '', 'data-at': 500 + (N - 1 - k) * 280, 'data-fx': 'fade', 'data-ms': 360 }, svg);
    E('line', { x1: cx + 20, x2: tx - 14, y1: yc, y2: yc, stroke: P.cmp, 'stroke-width': 1.3, 'stroke-opacity': .7 }, g);
    E('circle', { cx: cx, cy: yc, r: 15, fill: f.t === '#fff' || f.t === P.bg ? (ctx.dark ? P.bg : P.dark) : P.dark }, g);
    T(g, cx, yc + 5.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ctx.dark ? P.main : '#fff' });
    var lf = fitS(o.label || '', 19, 14, 330, 1); T(g, tx, yc - rh / 2 + 24, o.label || '', { 'font-size': lf, 'font-weight': 700, fill: P.ink });
    if (o.sub) T(g, tx + h.textW(o.label || '', lf, 1) + 14, yc - rh / 2 + 24, o.sub, { 'font-size': 14, fill: P.mute });
    stk(g, tx, yc - rh / 2 + 32, 1168 - tx, rh - 38, bodyItems(o, P, 14.5).map(function (it, j) { if (!j) it.gap = 0; return it }), 'top'); q.grp[k].push(g) });
  cap(svg, P, '안쪽 = 위 층', 0, 16); cap(svg, P, '바깥 = 아래 층', 0, 34);
  beats(ctx.root, s, q.grp) };

/* bars 층 막대 : 위 층부터 한 줄씩, 막대 길이 = 값(layers[].value) 없으면 아래로 갈수록 길게. 오른쪽에 설명 */
NEW.bars = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, GP = 10, rh = (478 - (N - 1) * GP) / N, BW = 560, tx = 616;
  var hv = L.every(function (o) { return o.value != null && +o.value > 0 }), mx = Math.max.apply(null, L.map(function (o) { return +o.value || 0 }));
  L.forEach(function (o, i) { var y = i * (rh + GP), fr = hv ? Math.max(.22, +o.value / mx) : (N > 1 ? .5 + .5 * i / (N - 1) : 1), len = BW * fr, f = q.R[i], at = 220 + i * 260;
    var g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    E('rect', { x: 0, y: y, width: len, height: rh, rx: 10, fill: f.f }, g);
    var vt = hv ? val(o, s) : '', vw = vt ? h.textW(vt, 20, 1) + 24 : 0, lf = fitS(o.label || '', 20, 14, len - 36 - vw, 1);
    T(g, 20, y + rh / 2 - (o.sub ? 3 : -6), o.label || '', { 'font-size': lf, 'font-weight': 700, fill: f.t });
    if (o.sub) T(g, 20, y + rh / 2 + 17, o.sub, { 'font-size': fitS(o.sub, 14, 12.5, len - 36 - vw), fill: f.s, 'fill-opacity': .9 });
    if (vt) T(g, len - 16, y + rh / 2 + 7, vt, { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: f.t });
    var ln = E('line', { x1: len + 8, x2: tx - 14, y1: y + rh / 2, y2: y + rh / 2, stroke: P.g40, 'stroke-width': 1.3, 'stroke-dasharray': '2 4', 'data-at': at + 260, 'data-fx': 'wipe', 'data-ms': 300 }, svg);
    var tg = E('g', { 'data-key': o.label || '', 'data-at': at + 300, 'data-fx': 'fade', 'data-ms': 360 }, svg);
    stk(tg, tx, y + 4, 1168 - tx, rh - 8, bodyItems(o, P, 15).map(function (it, j) { if (!j) it.gap = 0; return it }), 'mid'); q.grp[i].push(g, ln, tg);
    if (i < N - 1) E('line', { x1: tx, x2: 1168, y1: y + rh + GP / 2, y2: y + rh + GP / 2, stroke: P.line, 'stroke-width': 1 }, svg) });
  cap(svg, P, hv ? '막대 길이 = 값' : '막대 길이 = 층의 차례(아래층일수록 길고 범위가 넓음)', 0, 506);
  beats(ctx.root, s, q.grp) };

/* blocks 블록 쌓기 : 층마다 가로 블록(왼쪽 이름 띠 + 오른쪽 설명), 위 층이 좁고 아래 층이 넓은 계단식 쌓기 */
NEW.blocks = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, GP = 8, rh = (480 - (N - 1) * GP) / N, TW = 214;
  L.forEach(function (o, i) { var w = N > 1 ? 1168 * (.52 + .48 * i / (N - 1)) : 1168, x = (1168 - w) / 2, y = i * (rh + GP), f = q.R[i], at = 250 + (N - 1 - i) * 340;
    var g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'rise', 'data-ms': 420 }, svg);
    E('rect', { x: x, y: y, width: w, height: rh, rx: 12, fill: P.paper }, g);
    E('rect', { x: x, y: y, width: TW, height: rh, rx: 12, fill: f.f }, g); E('rect', { x: x + TW - 14, y: y, width: 14, height: rh, fill: f.f }, g);
    var lf = fitS(o.label || '', 20, 14, TW - 34, 1), hasSub = !!o.sub; T(g, x + 18, y + rh / 2 - (hasSub ? 4 : -6), o.label || '', { 'font-size': lf, 'font-weight': 700, fill: f.t });
    if (hasSub) T(g, x + 18, y + rh / 2 + 17, o.sub, { 'font-size': fitS(o.sub, 14, 12.5, TW - 34), fill: f.s, 'fill-opacity': .9 });
    stk(g, x + TW + 18, y + 8, w - TW - 36, rh - 16, bodyItems(o, P, 17).map(function (it, j) { if (!j) it.gap = 0; return it }), 'mid'); q.grp[i].push(g) });
  cap(svg, P, '블록 폭 = 아래층일수록 넓음(범위가 큼)', 0, 506);
  beats(ctx.root, s, q.grp) };

/* funnel 깔때기 : 위가 넓고 아래가 좁음(아래층 = 첫 단계). layers[].value 가 모두 있으면 폭 = 값 + 단계 사이 줄어든 몫 표시, 없으면 폭만 줄어듦 */
NEW.funnel = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, FW = 640, cx = FW / 2, GP = 10, rh = (486 - (N - 1) * GP) / N;
  var S = L.map(function (o, i) { return { o: o, i: i } }).reverse(), hv = L.every(function (o) { return o.value != null && +o.value > 0 }), mx = Math.max.apply(null, L.map(function (o) { return +o.value || 0 }));
  var fr = S.map(function (z, j) { return hv ? Math.max(.2, +z.o.value / mx) : (N > 1 ? 1 - .58 * j / (N - 1) : 1) }), dX = 664, tX = hv ? 836 : 704;
  S.forEach(function (z, j) { var o = z.o, y = j * (rh + GP), wa = FW * fr[j], wb = j < N - 1 ? FW * fr[j + 1] : wa * .74, f = q.R[z.i], at = 220 + j * 300, yc = y + rh / 2;
    var g = E('g', { 'data-key': o.label || '', 'data-at': at, 'data-fx': 'drop', 'data-dy': 40, 'data-ms': 420 }, svg);
    E('path', { d: 'M' + (cx - wa / 2) + ' ' + y + ' H' + (cx + wa / 2) + ' L' + (cx + wb / 2) + ' ' + (y + rh) + ' H' + (cx - wb / 2) + ' Z', fill: f.f }, g);
    var iw = Math.max(80, (wa + wb) / 2 - 36), lf = fitS(o.label || '', 19, 13.5, iw, 1), vt = hv ? val(o, s) : (o.sub || '');
    T(g, cx, yc - (vt ? 3 : -6), o.label || '', { 'text-anchor': 'middle', 'font-size': lf, 'font-weight': 700, fill: f.t });
    if (vt) T(g, cx, yc + 18, vt, { 'text-anchor': 'middle', 'font-size': hv ? fitS(vt, 17, 12.5, iw, 1) : fitS(vt, 14, 12.5, iw), 'font-weight': hv ? 700 : 400, fill: f.s, 'fill-opacity': hv ? 1 : .9 });
    q.grp[z.i].push(g);
    var xr = cx + (wa + wb) / 4 + 12, tg = E('g', { 'data-key': o.label || '', 'data-at': at + 260, 'data-fx': 'fade', 'data-ms': 360 }, svg);
    E('line', { x1: xr, x2: tX - 16, y1: yc, y2: yc, stroke: P.g40, 'stroke-width': 1.3, 'stroke-dasharray': '2 4' }, tg);
    var hd = hv && o.sub ? o.sub : '', its = bodyItems(o, P, 15); if (hd) its.unshift({ s: hd, size: 13.5, bold: 1, fill: P.main, gap: 0 }); its[hd ? 1 : 0].gap = hd ? 3 : 0;
    stk(tg, tX, y + 4, 1168 - tX, rh - 8, its, 'mid'); q.grp[z.i].push(tg);
    if (hv && j) { var pv = +S[j - 1].o.value, cv = +o.value, d = pv - cv, yy = y - GP / 2;
      var dg = E('g', { 'data-at': at + 160, 'data-fx': 'fade', 'data-ms': 320 }, svg), sg = d >= 0 ? '−' : '+', dt = sg + h.nf(Math.abs(d), s.dec != null ? s.dec : 0) + (s.unit || '') + ' (' + sg + h.nf(Math.abs(d) / pv * 100, 0) + '%)';
      E('path', { d: 'M' + (dX + 4) + ' ' + (yy - 7) + ' l7 0 l0 8 l5 0 l-8.5 8 l-8.5 -8 l5 0 z', fill: P.cmp }, dg);
      T(dg, dX + 24, yy + 5, dt, { 'font-size': 13, 'font-weight': 700, fill: P.cmp }) } });
  if (hv) cap(svg, P, '▼ = 앞 단계에서 줄어든 몫', dX, 506); else cap(svg, P, '깔때기 폭 = 단계가 지날수록 좁아짐', 0, 506);
  beats(ctx.root, s, q.grp) };

/* glass 잔 쌓기 : 층마다 한 줄 선반 위에 와인잔이 놓임(기본 = 위 층 1잔 → 아래 층일수록 늘어난 샴페인 탑, layers[].n 으로 잔 수를 직접 정하면 거꾸로도 됨).
   잔 속 색 = 그 층의 색, 오른쪽에 층 이름 · 풀이. 아래 층부터 차례로 올라옴 */
NEW.glass = function (bd, s, ctx) {
  var L = (s.layers || []).slice(0, 5), N = L.length, q = prep(ctx, s, N), P = q.P, svg = q.svg, rh = 486 / N, gh = Math.min(rh - 16, 134), gw = gh * .72, cx0 = 350, tx = 760, tw = 1168 - tx;
  L.forEach(function (o, i) { var n = o.n != null ? Math.max(1, Math.min(6, Math.round(+o.n))) : i + 1, yb = i * rh + rh - 20, yc = i * rh + rh / 2, f = q.R[i], at = 250 + (N - 1 - i) * 520, top = yb - gh, bh = gh * .56;
    var sp = Math.min(gw * 1.6, 600 / n), sw = (n - 1) * sp + gw + 150;
    E('ellipse', { cx: cx0, cy: yb + 3, rx: sw / 2, ry: 6, fill: P.g18, 'data-at': at, 'data-fx': 'wipe', 'data-ms': 420 }, svg); E('line', { x1: 0, x2: tx - 40, y1: yb + 9, y2: yb + 9, stroke: P.line, 'data-at': at, 'data-fx': 'wipe', 'data-ms': 420 }, svg);
    for (var k = 0; k < n; k++) { var cx = cx0 + (k - (n - 1) / 2) * sp, x1 = cx - gw / 2, x2 = cx + gw / 2, ya = top + bh * .26, g = E('g', { 'data-key': o.label || '', 'data-at': at + 120 + k * 90, 'data-fx': 'rise', 'data-ms': 420 }, svg);
      E('path', { d: 'M' + x1 + ' ' + (top + bh * .3) + ' H' + x2 + ' V' + ya + ' Q' + x2 + ' ' + (top + bh) + ' ' + cx + ' ' + (top + bh) + ' Q' + x1 + ' ' + (top + bh) + ' ' + x1 + ' ' + ya + ' Z', fill: f.f }, g);
      E('path', { d: 'M' + x1 + ' ' + top + ' V' + ya + ' Q' + x1 + ' ' + (top + bh) + ' ' + cx + ' ' + (top + bh) + ' Q' + x2 + ' ' + (top + bh) + ' ' + x2 + ' ' + ya + ' V' + top, fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
      E('path', { d: 'M' + cx + ' ' + (top + bh) + ' V' + (yb - 4) + ' M' + (cx - gw * .34) + ' ' + (yb - 1) + ' Q' + cx + ' ' + (yb - 8) + ' ' + (cx + gw * .34) + ' ' + (yb - 1), fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); q.grp[i].push(g) }
    var tg = E('g', { 'data-key': o.label || '', 'data-at': at + 300, 'data-fx': 'right', 'data-ms': 420 }, svg), its = [{ s: o.label, size: 25, bold: 1, fill: P.ink }, { s: o.sub, size: 16, fill: P.main, bold: 1, gap: 3 }, { s: o.desc, size: 17, fill: P.sub, gap: 5 }].concat(noteItems(o, P));
    E('line', { x1: cx0 + sw / 2 + 10, x2: tx - 34, y1: yc, y2: yc, stroke: P.g40, 'stroke-width': 1.3, 'stroke-dasharray': '2 4' }, tg); E('rect', { x: tx - 24, y: yc - 9, width: 18, height: 18, rx: 5, fill: f.f }, tg);
    stk(tg, tx, i * rh + 6, tw, rh - 12, its, 'mid'); q.grp[i].push(tg);
    if (i) E('line', { x1: tx, x2: 1168, y1: i * rh, y2: i * rh, stroke: P.line }, svg) });
  cap(svg, P, '잔 속 색 = 층(오른쪽 네모와 같은 색) · 잔 수 = 그 층의 몫', 0, 506);
  beats(ctx.root, s, q.grp) };

ECOM.parts.pyramid = function (bd, s, ctx) { var f = NEW[s.layout]; return f ? f(bd, s, ctx) : basePyramid(bd, s, ctx) };
ECOM.parts.pyramid.layouts = ['default', 'stairs', 'rings', 'bars', 'blocks', 'funnel', 'glass'];
ECOM.parts.pyramid.dark = ['stairs', 'rings', 'bars', 'blocks', 'funnel', 'glass'];
})();
