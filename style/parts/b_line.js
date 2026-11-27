/* line — 주석 선 · 계단 차트 (Kick-off 12쪽 · CW48 6 · 3장 틀)
   labels · series[{name,data,color,step,width,dash,end}] · y{min,max,step,dec,unit,suf} · ticks[idx]
   band{a,b,from,legend,labels:[{at|[i0,i1],text,carry}]} · phases[{from,to,name,now}] · avg[{s,from,to,x0,x1,label}]
   values[{s,at,text,pos:'above|below',dx,dy,anchor}] · events[{at,v,text,sub,anchor,dx,dy,leader:[v0,v1]}] · arrows[{at,a,b,text,sub,side}]
   box{title,items,x0,x1,top,bullet('dot' = 번호 대신 점, 국면 번호와 헷갈릴 때)}(시사점 상자: 연한 상자 안 머리 칩 + 번호 항목, 항목은 상자 너비에 맞춰 줄바꿈 · 높이는 글에 맞춤) · lanes[{name,sub,color,marks}] · future{n,xlabels,title,branches:[{s,at,to}],labels:[{v,text,color}],range:{text,sub,v}} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u;
/* ───── 배치(layout) ─────
   default  : 아래 기본 그림(바뀌지 않음)
   phasefull : 국면 띠 전면형 — phases 가 본문 전체 높이의 큰 색 띠, 띠 위쪽에 번호 · 국면 이름, 선은 그 아래. 더 받는 칸 없음(phases 없으면 기간을 4등분)
   small     : 작은 여러 개 — 계열마다 작은 차트를 나란히(같은 축 · 같은 눈금). 계열 하나면 기간을 3등분. 더 받는 칸 없음
   endbig    : 끝 이름표 큰 숫자형 — 선은 왼쪽 2/3, 오른쪽에 계열마다 마지막 값을 아주 크게(숫자 굴림) + 처음 대비 변화
   deep      : 짙은 초록 바탕형(장 칸 bg:"deep") — 밝은 선 · 흰 글, 끝 값 큰 글, phases 는 가는 칸 구분 · arrows 는 그대로 */
var LAY = {};
function dc(v) { var t = String(v), i = t.indexOf('.'); return i < 0 ? 0 : Math.min(2, t.length - i - 1) }
function decOfSer(ser) { var m = 0; ser.forEach(function (q) { q.data.forEach(function (v) { if (v != null) m = Math.max(m, dc(v)) }) }); return m }
function pc(P, c) { return P[c] || h.col(c) }
function scol(q, k) { return q.color || (k ? 'main' : 'cmp') }
function pathD(q, X, Y) { return q.step === false ? h.lineD(q.data, X, Y) : h.stepD(q.data, X, Y) }
function allVals(ser) { var v = []; ser.forEach(function (q) { v = v.concat(q.data) }); return v }
function sh(l) { return ECOM.u.short(l) }
function autoPh(labels) { var n = labels.length, k = 4, o = []; for (var i = 0; i < k; i++) { var a = Math.round(n * i / k), b = Math.round(n * (i + 1) / k) - 1; o.push({ from: a, to: b, name: sh(labels[a]) + '~' + sh(labels[b]), now: i === k - 1 }) } return o }
/* 국면 이름표 줄 : 번호 동그라미 + 이름, 한 줄에 못 들어가면 다음 줄 */
function phLegend(g, P, ph, y, x0, x1) { var x = x0, ty = P === ECOM.Cd ? '#003D2B' : '#fff';
  ph.forEach(function (p, k) { var w = 26 + h.textW(p.name, 13, false) + 20; if (x + w > x1 && x > x0) { x = x0; y += 24 }
    E('circle', { cx: x + 9.5, cy: y - 4.5, r: 9.5, fill: P.dark }, g); T(g, x + 9.5, y - .3, String(k + 1), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: ty });
    T(g, x + 26, y, p.name, { 'font-size': 13, fill: P.sub }); x += w }); return y }
/* 오른쪽 큰 글 칸 자리 : items [{y}] → 겹치지 않는 top 목록 */
function endBlocks(items, lo, hi, bh, gap) {
  var o = items.map(function (it, i) { return { i: i, t: it.y - bh / 2 } }).sort(function (a, b) { return a.t - b.t });
  for (var i = 0; i < o.length; i++) { o[i].t = Math.max(o[i].t, lo); if (i && o[i].t < o[i - 1].t + bh + gap) o[i].t = o[i - 1].t + bh + gap }
  var over = o.length ? o[o.length - 1].t + bh - hi : 0; if (over > 0) for (i = o.length - 1; i >= 0; i--) { o[i].t -= over; if (i < o.length - 1 && o[i].t + bh + gap > o[i + 1].t) o[i].t = o[i + 1].t - bh - gap }
  var r = []; o.forEach(function (q) { r[q.i] = q.t }); return r }

LAY.phasefull = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], ph = s.phases || autoPh(labels);
  var svg = ctx.svg(512), ml = 54, x1 = 1168 - 128, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) }, y0 = 32, bot = 482, headH = 100, top = y0 + headH + 16;
  phLegend(h.lv(svg, 1), P, ph, 14, 0, 1168);
  var sc = u.yScale(allVals(ser), s.y, top, bot), Y = sc.Y, gb = h.lv(svg, 1, { 'data-fx': 'fade' }), gh = h.lv(svg, 2);
  ph.forEach(function (p, k) { var xa = Math.max(ml, X(p.from) - slot / 2), xb = Math.min(x1, X(p.to) + slot / 2), cur = !!p.now, cx = (xa + xb) / 2, bw = xb - xa;
    var gk = E('g', { 'data-key': p.name }, gb); E('rect', { x: xa, y: y0, width: bw, height: bot - y0, fill: cur ? P.g40 : (k % 2 ? P.g08 : P.g18), opacity: cur ? .55 : 1 }, gk);
    var q = E('g', { 'data-key': p.name }, gh); E('circle', { cx: cx, cy: y0 + 24, r: 17, fill: P.dark }, q); T(q, cx, y0 + 31, String(k + 1), { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: '#fff' });
    if (bw >= 96) h.wrap(p.name, 14.5, bw - 14, true).slice(0, 3).forEach(function (ln, j) { T(q, cx, y0 + 62 + j * 19, ln, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: P.dark }) }) });
  var g1 = h.lv(svg, 1); u.yAxis(g1, ml, x1, sc, { unit: s.y && s.y.unit, suf: s.y && s.y.suf, base: true }); u.xLabels(g1, labels, X, bot + 20, u.xTicks(n, 11, s.ticks), { boldLast: true });
  var L = [], SEG = []; ser.forEach(function (q, k) { var c = pc(P, scol(q, k)); SEG = SEG.concat(u.segsOf(q.data, X, Y, q.step));
    E('path', { d: pathD(q, X, Y), fill: 'none', stroke: c, 'stroke-width': 3.8, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var en = h.lv(svg, 4); E('circle', { cx: X(n - 1), cy: Y(q.data[n - 1]), r: 5.5, fill: c }, en);
    L.push(u.label(en, X(n - 1) + 14, Y(q.data[n - 1]) + 5, q.end || q.name, { color: c, size: 15, dir: k ? 1 : -1 })) });
  u.avoid(L, 15, SEG, []); ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

LAY.small = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], dec = decOfSer(ser), suf = (s.y && s.y.suf) || '', pan = [];
  if (ser.length > 1) ser.forEach(function (q, k) { pan.push({ q: q, k: k, a: 0, b: n - 1 }) });
  else if (ser.length) { var q0 = ser[0], k3 = 3; for (var i = 0; i < k3; i++) pan.push({ q: q0, k: 1, a: Math.round((n - 1) * i / k3) + (i ? 1 : 0), b: Math.round((n - 1) * (i + 1) / k3), part: true }) }
  var m = pan.length, cols = m <= 3 ? m : 2, rows = Math.ceil(m / cols), gx = 36, gy = 30, pw = (1168 - (cols - 1) * gx) / cols, ph = (512 - (rows - 1) * gy) / rows;
  var svg = ctx.svg(512), sc = u.yScale(allVals(ser), s.y, 0, 100);
  pan.forEach(function (p, idx) { var px = (idx % cols) * (pw + gx), py = Math.floor(idx / cols) * (ph + gy), c = pc(P, scol(p.q, p.k)), hdr = 44, pl = px + 52, pr = px + pw - 16, pt = py + hdr + 16, pb = py + ph - 34;
    var Y = h.lin(sc.lo, sc.hi, pb, pt), cnt = p.b - p.a + 1, sl = (pr - pl) / cnt, X = function (i) { return pl + sl * (i - p.a + .5) }, d = p.q.data.slice(p.a, p.b + 1), b = 1 + idx;
    var g = E('g', { 'data-key': p.q.name, 'data-b': b, 'data-fx': 'fade' }, svg);
    E('rect', { x: px, y: py, width: pw, height: ph, rx: 12, fill: P.paper, stroke: P.line }, g);
    E('rect', { x: px + 16, y: py + 17, width: 22, height: 4, rx: 2, fill: c }, g);
    T(g, px + 46, py + 25, p.part ? sh(labels[p.a]) + ' ~ ' + sh(labels[p.b]) : p.q.name, { 'font-size': 16, 'font-weight': 700, fill: P.ink });
    var last = d[d.length - 1]; T(g, px + pw - 16, py + 30, h.nf(last, dec) + suf, { 'text-anchor': 'end', 'font-size': 26, 'font-weight': 700, fill: c });
    sc.ticks.forEach(function (v) { E('line', { x1: pl, x2: pr, y1: Y(v), y2: Y(v), stroke: v === sc.lo ? P.axis : P.grid, 'stroke-dasharray': v === sc.lo ? null : '3 4' }, g); T(g, pl - 8, Y(v) + 4.5, h.nf(v, sc.dec) + suf, { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute }) });
    [p.a, Math.round((p.a + p.b) / 2), p.b].forEach(function (i, j) { T(g, X(i) + (j === 0 ? -sl / 2 + 2 : j === 2 ? sl / 2 - 2 : 0), py + ph - 12, sh(labels[i]), { 'text-anchor': j === 0 ? 'start' : j === 2 ? 'end' : 'middle', 'font-size': 12.5, fill: P.mute }) });
    var XL = function (i) { return X(i + p.a) };
    E('path', { d: p.q.step === false ? h.lineD(d, XL, Y) : h.stepD(d, XL, Y), fill: 'none', stroke: c, 'stroke-width': 3.4, 'stroke-linejoin': 'round', 'data-b': b, 'data-fx': 'draw', 'data-ms': 900 }, svg);
    var mg = E('g', { 'data-b': b, 'data-at': 500, 'data-fx': 'fade' }, svg), mi = 0, ma = 0; d.forEach(function (v, i) { if (v < d[mi]) mi = i; if (v > d[ma]) ma = i });
    var pts = [{ i: ma, t: '최고', dir: -1 }]; if (mi !== ma && d[mi] !== d[ma]) pts.push({ i: mi, t: '최저', dir: 1 }); if (d.length - 1 !== ma && d.length - 1 !== mi) pts.push({ i: d.length - 1, t: '마지막', dir: -1 });
    var Lp = []; pts.forEach(function (q) { var v = d[q.i], x = XL(q.i); E('circle', { cx: x, cy: Y(v), r: 4.8, fill: '#fff', stroke: c, 'stroke-width': 2.2 }, mg);
      var an = q.i > d.length * .75 ? 'end' : q.i < d.length * .15 ? 'start' : 'middle', below = q.dir > 0 && Y(v) + 24 < pb;
      Lp.push(u.label(mg, x + (an === 'end' ? 4 : an === 'start' ? -4 : 0), Y(v) + (below ? 21 : -11), q.t + ' ' + h.nf(v, dec) + suf, { color: c, size: 13.5, anchor: an, dir: below ? 1 : -1 })) });
    u.avoid(Lp, 14, u.segsOf(d, XL, Y, p.q.step), []) });
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 60) };

LAY.endbig = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], dec = decOfSer(ser), suf = (s.y && s.y.suf) || '', dsuf = suf === '%' ? '%p' : suf;
  var svg = ctx.svg(512), ml = 54, x1 = 742, top = 24, bot = 478, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) }, sc = u.yScale(allVals(ser), s.y, top, bot), Y = sc.Y;
  var g1 = h.lv(svg, 1); u.yAxis(g1, ml, x1, sc, { unit: s.y && s.y.unit, suf: suf, base: true }); u.xLabels(g1, labels, X, bot + 20, u.xTicks(n, 7, s.ticks), { boldLast: true });
  var m = ser.length, bh = Math.min(176, Math.floor((bot - top - (m - 1) * 16) / Math.max(1, m))), tops = endBlocks(ser.map(function (q) { return { y: Y(q.data[n - 1]) } }), 10, 502, bh, 16), bx = 812;
  ser.forEach(function (q, k) { var c = pc(P, scol(q, k)), last = q.data[n - 1], first = q.data[0], dl = last - first, t = tops[k], my = t + bh / 2, ex = X(n - 1), fs = Math.min(76, Math.round(bh * .46));
    E('path', { d: pathD(q, X, Y), fill: 'none', stroke: c, 'stroke-width': 3.6, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var g = E('g', { 'data-key': q.name, 'data-b': 3, 'data-fx': 'fade' }, svg); E('circle', { cx: ex, cy: Y(last), r: 5.5, fill: c }, g);
    E('path', { d: 'M' + (ex + 7) + ' ' + Y(last) + ' H' + (ex + 30 + k * 8) + ' V' + my + ' H' + (bx - 8), fill: 'none', stroke: c, 'stroke-width': 1.6, 'stroke-dasharray': '3 4', opacity: .7 }, g);
    var bk = E('g', { 'data-key': q.name, 'data-b': 4, 'data-fx': 'left', 'data-ms': 520 }, svg); E('rect', { x: bx, y: t, width: 6, height: bh, rx: 3, fill: c }, bk);
    T(bk, bx + 24, t + 28, q.name, { 'font-size': 16, 'font-weight': 700, fill: P.ink });
    T(bk, bx + 24, t + 32 + fs * .92, h.nf(last, dec), { 'font-size': fs, 'font-weight': 700, fill: c, 'letter-spacing': '-0.02em', 'data-fx': 'count', 'data-count': last, 'data-dec': dec });
    if (suf) T(bk, bx + 30 + h.textW(h.nf(last, dec), fs, true), t + 32 + fs * .92, suf, { 'font-size': Math.round(fs * .42), 'font-weight': 700, fill: c });
    T(bk, bx + 24, t + bh - 14, sh(labels[0]) + ' 대비 ' + (dl > 0 ? '▲ ' : dl < 0 ? '▼ ' : '') + h.nf(Math.abs(dl), dec) + dsuf, { 'font-size': 14.5, 'font-weight': 700, fill: P.sub }) });
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 90) };

/* 짙은 바탕용 축 : 눈금 글 · 선을 P 색으로 */
function dAxis(g, P, x0, x1, sc, suf, labels, X, y, idx) { sc.ticks.forEach(function (v) { var z = v === sc.lo;
    E('line', { x1: x0, x2: x1, y1: sc.Y(v), y2: sc.Y(v), stroke: z ? P.axis : P.grid, 'stroke-dasharray': z ? null : '3 4' }, g);
    T(g, x0 - 9, sc.Y(v) + 4.5, h.nf(v, sc.dec) + suf, { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute }) });
  var last = labels.length - 1, step = (idx[1] - idx[0]) || 1, shown = {}; idx.forEach(function (i) { if (last - i < step * .6 && i !== last) return; shown[i] = 1; T(g, X(i), y, sh(labels[i]), { 'text-anchor': 'middle', 'font-size': 12.5, fill: P.mute }) });
  if (!shown[last]) T(g, X(last), y, sh(labels[last]), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: P.ink }) }
LAY.deep = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], ph = s.phases || [], dec = decOfSer(ser), suf = (s.y && s.y.suf) || '';
  var svg = ctx.svg(512), ml = 54, x1 = 1168 - 196, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) }, bot = 478;
  var yi = ph.length ? phLegend(h.lv(svg, 1), P, ph, 14, 0, 1168) : 0, top = ph.length ? yi + 54 : 28;
  var sc = u.yScale(allVals(ser), s.y, top, bot), Y = sc.Y, g0 = h.lv(svg, 1, { 'data-fx': 'fade' });
  ph.forEach(function (p, k) { var xa = Math.max(ml, X(p.from) - slot / 2), xb = Math.min(x1, X(p.to) + slot / 2), gk = E('g', { 'data-key': p.name }, g0);
    E('rect', { x: xa + 1, y: top - 20, width: Math.max(2, xb - xa - 2), height: 7, rx: 3.5, fill: p.now ? P.main : (k % 2 ? P.g65 : P.g40) }, gk);
    E('circle', { cx: (xa + xb) / 2, cy: top - 36, r: 10.5, fill: P.dark }, gk); T(gk, (xa + xb) / 2, top - 31.8, String(k + 1), { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#003D2B' }) });
  var g1 = h.lv(svg, 1); dAxis(g1, P, ml, x1, sc, suf, labels, X, bot + 20, u.xTicks(n, 11, s.ticks));
  var tops = endBlocks(ser.map(function (q) { return { y: Y(q.data[n - 1]) } }), top - 10, bot + 10, 58, 10), SEG = [], L = [];
  ser.forEach(function (q, k) { var c = pc(P, scol(q, k)), last = q.data[n - 1]; SEG = SEG.concat(u.segsOf(q.data, X, Y, q.step));
    E('path', { d: pathD(q, X, Y), fill: 'none', stroke: c, 'stroke-width': 4.6, 'stroke-linejoin': 'round', 'stroke-dasharray': q.dash ? '7 6' : null, 'data-key': q.name, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var g = E('g', { 'data-key': q.name, 'data-b': 3, 'data-fx': 'fade' }, svg), t = tops[k]; E('circle', { cx: X(n - 1), cy: Y(last), r: 6.5, fill: c }, g);
    T(g, x1 + 18, t + 16, q.name, { 'font-size': 14, 'font-weight': 700, fill: P.sub });
    T(g, x1 + 18, t + 54, h.nf(last, dec) + suf, { 'font-size': 33, 'font-weight': 700, fill: c, 'data-fx': 'count', 'data-count': last, 'data-dec': dec, 'data-suf': suf }) });
  var ag = h.lv(svg, 4); (s.arrows || []).forEach(function (ar) { var x = X(ar.at) + (ar.dx || 0), sd = ar.side || 1; if (x > x1 - 30) { x = X(ar.at) - 12; sd = -1 } h.arrow2(ag, x, Y(ar.a), Y(ar.b), P.dark, 2);
    var ty = (Y(ar.a) + Y(ar.b)) / 2, lb = u.label(ag, x + sd * 10, ty - 2, ar.text, { color: P.dark, size: 14.5, anchor: sd > 0 ? 'start' : 'end' }); L.push(lb); if (ar.sub) { lb.sub = T(ag, x + sd * 10, ty + 16, ar.sub, { 'text-anchor': sd > 0 ? 'start' : 'end', 'font-size': 12.5, fill: P.mute }); lb.below = 17 } });
  u.avoid(L, 15, SEG, []); ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

/* ───── 5판 P5 H : 부채꼴 · 추정 · 하락 짚기 · 단색 바탕 ───── */
var YEL = '#F2B705';
/* 가로 범례줄 : items [{type:'line|dash|box|frame',color,text}] — 짙은 바탕에서도 읽히게 P 색으로 */
function svgLeg(g, P, items, y, x) { x = x || 0; items.forEach(function (it) { var c = pc(P, it.color), sw = 28;
    if (it.type === 'box') { E('rect', { x: x, y: y - 11, width: 16, height: 12, rx: 2, fill: c, opacity: it.op || 1 }, g); sw = 24 }
    else if (it.type === 'frame') { E('rect', { x: x, y: y - 12, width: 18, height: 13, rx: 3, fill: 'none', stroke: c, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g); sw = 26 }
    else E('line', { x1: x, x2: x + 22, y1: y - 5, y2: y - 5, stroke: c, 'stroke-width': 3.4, 'stroke-dasharray': it.type === 'dash' ? '6 4' : null }, g);
    T(g, x + sw, y, it.text, { 'font-size': 13.5, fill: P.sub }); x += sw + h.textW(it.text, 13.5) + 26 }); return x }
function fan0(n, F, a) { var o = []; for (var i = 0; i < n; i++) o.push(i >= F ? a[i - F] : null); return o }

LAY.fan = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], f = s.fan || {}, F = f.from, dec = decOfSer(ser), suf = (s.y && s.y.suf) || '', nm = f.names || ['상단', '중심', '하단'];
  var svg = ctx.svg(512), ml = 54, x1 = 1168 - 176, top = 52, bot = 478, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) };
  var sc = u.yScale(allVals(ser).concat(f.hi, f.lo), s.y, top, bot), Y = sc.Y;
  var items = ser.map(function (q, k) { return { type: 'line', color: scol(q, k), text: q.name } });
  items.push({ type: 'dash', color: 'main', text: f.midName || '중심 전망' }, { type: 'box', color: 'g18', text: f.name || '전망 범위' });
  svgLeg(h.lv(svg, 1), P, items, 18, 0);
  var g1 = h.lv(svg, 1); dAxis(g1, P, ml, x1, sc, suf, labels, X, bot + 20, u.xTicks(n, 11, s.ticks));
  var xd = X(F); E('line', { x1: xd, x2: xd, y1: top - 10, y2: bot, stroke: P.axis, 'stroke-dasharray': '3 3' }, g1);
  T(g1, xd - 8, top - 14, '실적', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: P.mute }); T(g1, xd + 8, top - 14, f.title || '전망', { 'font-size': 13, 'font-weight': 700, fill: P.mute });
  var SEG = [];
  ser.forEach(function (q, k) { var c = pc(P, scol(q, k)); SEG = SEG.concat(u.segsOf(q.data, X, Y, false));
    E('path', { d: h.lineD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': 3.8, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 1100 }, svg) });
  var d = '', k;
  for (k = 0; k < f.hi.length; k++) d += (k ? ' L' : 'M') + X(F + k) + ' ' + Y(f.hi[k]); for (k = f.lo.length - 1; k >= 0; k--) d += ' L' + X(F + k) + ' ' + Y(f.lo[k]); d += ' Z';
  var gf = h.lv(svg, 3, { 'data-fx': 'wipe', 'data-ms': 900, 'data-key': f.name || '전망 범위' });
  E('path', { d: d, fill: P.g18, stroke: 'none' }, gf);
  E('path', { d: h.lineD(fan0(n, F, f.hi), X, Y), fill: 'none', stroke: P.g40, 'stroke-width': 1.6 }, gf); E('path', { d: h.lineD(fan0(n, F, f.lo), X, Y), fill: 'none', stroke: P.g40, 'stroke-width': 1.6 }, gf);
  E('path', { d: h.lineD(fan0(n, F, f.mid), X, Y), fill: 'none', stroke: P.main, 'stroke-width': 3.4, 'stroke-dasharray': '7 6', 'stroke-linejoin': 'round' }, gf);
  SEG = SEG.concat(u.segsOf(fan0(n, F, f.mid), X, Y, false));
  var en = h.lv(svg, 4), L = [], last = n - 1;
  [[f.hi, 0, -1], [f.mid, 1, -1], [f.lo, 2, 1]].forEach(function (a) { var v = a[0][a[0].length - 1], c = a[1] === 1 ? P.main : P.sub; E('circle', { cx: X(last), cy: Y(v), r: 5, fill: a[1] === 1 ? P.main : P.g40 }, en);
    L.push(u.label(en, X(last) + 14, Y(v) + 5, nm[a[1]] + ' ' + h.nf(v, dec) + suf, { color: c, size: 15, dir: a[2] })) });
  u.avoid(L, 15, SEG, []);
  var cg = h.lv(svg, 4, { 'data-fx': 'fade' }); (f.cards || []).forEach(function (cd, j) { var cx0 = ml + 14 + j * 214;
    E('rect', { x: cx0, y: top + 4, width: 200, height: 74, rx: 10, fill: P.paper, stroke: P.line }, cg); T(cg, cx0 + 16, top + 28, cd.k, { 'font-size': 13.5, fill: P.mute });
    T(cg, cx0 + 16, top + 64, cd.v, { 'font-size': 29, 'font-weight': 700, fill: j === 1 ? P.main : P.ink }) });
  ctx.root.setAttribute('data-gap', 400); ctx.root.setAttribute('data-stg', 70) };

LAY.estimate = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], m = ser.length, es = s.est || { from: n - 1 }, F = es.from, dec = (s.y && s.y.dec != null) ? s.y.dec : 0, suf = (s.y && s.y.suf) || '';
  var svg = ctx.svg(512), ml = 54, x1 = 1168 - 200, top = 52, bot = 478, X = function (i) { return ml + (x1 - ml) * i / (n - 1) }, pal = ['dark', 'g65', 'g40', 'g18', 'gray'], cum = [], i, k, d;
  for (k = 0; k < m; k++) { cum.push([]); for (i = 0; i < n; i++) cum[k].push((k ? cum[k - 1][i] : 0) + ser[k].data[i]) }
  var tot = cum[m - 1], sc = u.yScale(tot.concat([0]), s.y, top, bot), Y = sc.Y;
  svgLeg(h.lv(svg, 1), P, [{ type: 'line', color: 'ink', text: es.totalName || '합계 실적' }, { type: 'dash', color: 'ink', text: es.dashName || '합계 추정' }, { type: 'box', color: 'gray', text: es.name || '추정 구간', op: .45 }], 18, 0);
  var g0 = h.lv(svg, 1, { 'data-fx': 'fade', 'data-key': es.name || '추정 구간' }); E('rect', { x: X(F), y: top, width: x1 - X(F), height: bot - top, fill: P.gray, opacity: .3 }, g0);
  var g1 = h.lv(svg, 1); dAxis(g1, P, ml, x1, sc, suf, labels, X, bot + 20, u.xTicks(n, 9, s.ticks));
  E('line', { x1: X(F), x2: X(F), y1: top - 10, y2: bot, stroke: P.axis, 'stroke-dasharray': '3 3' }, g1);
  T(g1, X(F) - 8, top - 14, '실적', { 'text-anchor': 'end', 'font-size': 13, 'font-weight': 700, fill: P.mute }); T(g1, X(F) + 8, top - 14, es.title || '추정', { 'font-size': 13, 'font-weight': 700, fill: P.mute });
  var ga = h.lv(svg, 2, { 'data-fx': 'wipe', 'data-ms': 1100 }), colr = [];
  for (k = 0; k < m; k++) { var c = pc(P, ser[k].color || pal[k % pal.length]); colr.push(c); d = '';
    for (i = 0; i < n; i++) d += (i ? ' L' : 'M') + X(i) + ' ' + Y(cum[k][i]); for (i = n - 1; i >= 0; i--) d += ' L' + X(i) + ' ' + Y(k ? cum[k - 1][i] : 0); d += ' Z';
    E('path', { d: d, fill: c, stroke: P === ECOM.Cd ? P.bg : '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round', 'data-key': ser[k].name }, ga) }
  var lt = h.lv(svg, 3, { 'data-fx': 'fade' });
  E('path', { d: h.lineD(tot.map(function (v, j) { return j <= F ? v : null }), X, Y), fill: 'none', stroke: P.ink, 'stroke-width': 2.6 }, lt);
  E('path', { d: h.lineD(tot.map(function (v, j) { return j >= F ? v : null }), X, Y), fill: 'none', stroke: P.ink, 'stroke-width': 2.6, 'stroke-dasharray': '7 5' }, lt);
  var items = [{ y: Y(tot[n - 1]), name: es.totalLabel || '합계', v: tot[n - 1], tot: 1 }]; for (k = m - 1; k >= 0; k--) items.push({ y: Y((cum[k][n - 1] + (k ? cum[k - 1][n - 1] : 0)) / 2), name: ser[k].name, v: ser[k].data[n - 1], k: k });
  var tops = endBlocks(items, top - 8, bot + 8, 24, 3), eg = h.lv(svg, 4, { 'data-fx': 'fade' });
  items.forEach(function (it, j) { var ty = tops[j] + 17, xe = X(n - 1);
    E('path', { d: 'M' + (xe + 4) + ' ' + it.y + ' L' + (xe + 22) + ' ' + ty + ' H' + (x1 + 22), fill: 'none', stroke: P.axis, 'stroke-width': 1 }, eg);
    if (it.tot) T(eg, x1 + 28, ty + 5, it.name + ' ' + h.nf(it.v, dec) + suf, { 'font-size': 16, 'font-weight': 700, fill: P.ink });
    else { E('rect', { x: x1 + 28, y: ty - 7, width: 12, height: 12, rx: 2, fill: colr[it.k] }, eg); T(eg, x1 + 46, ty + 5, it.name + ' ' + h.nf(it.v, dec) + suf, { 'font-size': 14.5, 'font-weight': 700, fill: P.sub }) } });
  ctx.root.setAttribute('data-gap', 420); ctx.root.setAttribute('data-stg', 70) };

LAY.drop = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], dr = s.drop || {}, dec = decOfSer(ser), suf = (s.y && s.y.suf) || '', q0 = ser[dr.s || 0];
  var svg = ctx.svg(512), ml = 54, x1 = 1168 - 140, top = 36, bot = 440, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) };
  var sc = u.yScale(allVals(ser), s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1); dAxis(g1, P, ml, x1, sc, suf, labels, X, bot + 20, u.xTicks(n, 11, s.ticks));
  if (s.y && s.y.unit) T(g1, ml, top - 14, s.y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: P.mute });
  var SEG = [], L = [];
  ser.forEach(function (q, k) { var c = pc(P, scol(q, k)); SEG = SEG.concat(u.segsOf(q.data, X, Y, false));
    E('path', { d: h.lineD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': 3.6, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 1300 }, svg);
    var en = h.lv(svg, 2, { 'data-fx': 'fade' }); E('circle', { cx: X(n - 1), cy: Y(q.data[n - 1]), r: 5, fill: c }, en);
    L.push(u.label(en, X(n - 1) + 14, Y(q.data[n - 1]) + 5, q.end || q.name, { color: c, size: 15, dir: k ? 1 : -1 })) });
  u.avoid(L, 15, SEG, []);
  var a = dr.from, b = dr.to, xa = X(a), ya = Y(q0.data[a]), xb = X(b), yb = Y(q0.data[b]), sx = xa + 16, sy = ya + 2, ex = xb + 6, ey = yb - 30, cx = xb + 26, cy = ya + 8;
  var hk = Math.atan2(ey - cy, ex - cx), hd = 17, ah = [[ex, ey], [ex - hd * Math.cos(hk - .5), ey - hd * Math.sin(hk - .5)], [ex - hd * Math.cos(hk + .5), ey - hd * Math.sin(hk + .5)]];
  E('path', { d: 'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + (ex - 8 * Math.cos(hk)) + ' ' + (ey - 8 * Math.sin(hk)), fill: 'none', stroke: YEL, 'stroke-width': 8, 'stroke-linecap': 'round', 'data-at': 1500, 'data-fx': 'draw', 'data-ms': 800, 'data-key': '하락' }, svg);
  E('path', { d: 'M' + ah[0][0] + ' ' + ah[0][1] + ' L' + ah[1][0] + ' ' + ah[1][1] + ' L' + ah[2][0] + ' ' + ah[2][1] + ' Z', fill: YEL, stroke: YEL, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-at': 2250, 'data-fx': 'pop', 'data-ms': 300, 'data-key': '하락' }, svg);
  var pk = h.at(svg, 1300, { 'data-fx': 'pop', 'data-ms': 360 }), pw = h.textW(dr.peak, 15, true) + 20;
  E('rect', { x: xa - pw / 2, y: ya - 46, width: pw, height: 28, rx: 8, fill: YEL }, pk); T(pk, xa, ya - 27, dr.peak, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#1D2521' });
  var lw = h.at(svg, 2300, { 'data-fx': 'fade', 'data-ms': 420 }), lx = Math.min(xb + 4, x1 - 20), ly = 0; ser.forEach(function (q) { for (var z = b - 4; z <= b + 4; z++) if (q.data[z] != null) ly = Math.max(ly, Y(q.data[z])) }); ly = Math.min(ly, bot - 32); T(lw, lx, ly + 26, dr.low, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: P.warn });
  var tg = h.at(svg, 2500, { 'data-fx': 'fade', 'data-ms': 500 }), tx = Math.min(cx + 22, x1 - 150);
  T(tg, tx, (sy + ey) / 2 - 6, dr.text, { 'font-size': 17, 'font-weight': 700, fill: P.ink }); if (dr.sub) T(tg, tx, (sy + ey) / 2 + 16, dr.sub, { 'font-size': 13.5, fill: P.mute });
  if (dr.tag) { var t0 = X(dr.tag[0]) - slot / 2, t1 = X(dr.tag[1]) + slot / 2, tc = h.at(svg, 1900, { 'data-fx': 'fade', 'data-ms': 500 }); E('rect', { x: t0, y: bot + 34, width: t1 - t0, height: 26, rx: 6, fill: YEL }, tc);
    T(tc, (t0 + t1) / 2, bot + 52, dr.tag[2], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#1D2521' }) }
  ctx.root.setAttribute('data-gap', 400); ctx.root.setAttribute('data-stg', 70) };

LAY.solid = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, labels = s.labels || [], n = labels.length, ser = s.series || [], dec = decOfSer(ser), suf = (s.y && s.y.suf) || '', so = s.solid || {};
  var svg = ctx.svg(512), ml = 66, x1 = 1168 - (so.out ? 190 : 66), top = 36, bot = 474, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) }, sc = u.yScale(allVals(ser), s.y, top, bot), Y = sc.Y, pal = ['main', 'cmp', 'warn', 'g65'];
  var g1 = h.lv(svg, 1); dAxis(g1, P, ml, x1, sc, suf, labels, X, bot + 20, u.xTicks(n, 9, s.ticks));
  if (!so.out) sc.ticks.forEach(function (v) { T(g1, x1 + 9, sc.Y(v) + 4.5, h.nf(v, sc.dec) + suf, { 'font-size': 12.5, fill: P.mute }) });
  if (s.y && s.y.unit) { T(g1, ml, top - 14, s.y.unit, { 'font-size': 12.5, 'font-weight': 700, fill: P.mute }); if (!so.out) T(g1, x1, top - 14, s.y.unit, { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: P.mute }) }
  var SEG = [], L = [], R = [];
  ser.forEach(function (q, k) { var c = pc(P, q.color || pal[k % pal.length]), b = 2 + k, last = q.data[n - 1]; SEG = SEG.concat(u.segsOf(q.data, X, Y, false));
    E('path', { d: h.lineD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': 4.6, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': b, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
    var g = h.lv(svg, b + 1, { 'data-fx': 'fade', 'data-key': q.name }); E('circle', { cx: X(n - 1), cy: Y(last), r: 6.5, fill: c }, g);
    if (so.out) R.push(u.label(g, X(n - 1) + 14, Y(last) + 6, q.end || (q.name + ' ' + h.nf(last, dec) + suf), { color: c, size: 17, dir: k % 2 ? 1 : -1 }));
    else R.push(u.label(g, X(n - 1) - 14, Y(last) + (k % 2 ? 24 : -14), q.end || (q.name + ' ' + h.nf(last, dec) + suf), { color: c, size: 17, anchor: 'end', dir: k % 2 ? 1 : -1 })) });
  u.avoid(R, 17, SEG, []); ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

ECOM.parts.line = function (bd, s, ctx) { if (s.layout && LAY[s.layout]) return LAY[s.layout](bd, s, ctx); u = ECOM.u;
  var labels = s.labels || [], n = labels.length, fut = s.future, nAll = n + (fut ? (fut.n || 2) : 0), ser = s.series || [];
  var lanes = s.lanes || [], laneH = lanes.length ? lanes.length * 76 + 34 : 0, legTop = 0;
  var li = ser.map(function (q, k) { return { color: q.color || (k ? 'main' : 'cmp'), text: q.name, type: q.dash ? 'dash' : 'line' } });
  if (s.band && s.band.legend) li.push({ type: 'box', color: 'g18', text: s.band.legend });
  if (s.phases) { li.push({ type: 'sep' }); s.phases.forEach(function (p, k) { li.push({ type: 'ph', n: k + 1, text: p.name }) }) }
  if (s.legend !== false) u.legendHTML(bd, li, legTop);
  var svg = ctx.svg(512), top = 30 + (s.phases ? 36 : 16), bot = 512 - laneH - 30;
  var endW = ser.some(function (q) { return q.end }) || (fut && fut.labels) ? 128 : 16, ml = 54, x1 = 1168 - endW, slot = (x1 - ml) / nAll;
  function X(i) { return ml + slot * (i + .5) }
  var vals = []; ser.forEach(function (q) { vals = vals.concat(q.data) }); if (fut && fut.branches) fut.branches.forEach(function (b) { vals.push(b.to) });
  var sc = u.yScale(vals, s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1);
  if (s.phases) u.phaseBands(g1, s.phases, X, slot / 2, top, bot, top - 20);
  u.yAxis(g1, ml, X(nAll - .5), sc, { unit: s.y && s.y.unit, suf: s.y && s.y.suf, base: true });
  var all = labels.concat(fut && fut.xlabels ? fut.xlabels : []); u.xLabels(g1, all.slice(0, n), X, bot + 20, u.xTicks(n, s.nticks || 11, s.ticks), { boldLast: true });
  if (fut && fut.xlabels) fut.xlabels.forEach(function (l, j) { T(g1, X(n + j), bot + 20, u.short(l), { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#98A29D' }) });
  /* 다음 구역 */
  if (fut) { var fz = h.lv(svg, 6, { 'data-fx': 'fade' }); E('rect', { x: X(n - .5), y: top, width: slot * (nAll - n), height: bot - top, fill: C.paper }, fz);
    E('line', { x1: X(n - .5), x2: X(n - .5), y1: top, y2: bot, stroke: C.axis, 'stroke-dasharray': '3 3' }, fz);
    if (fut.title) T(fz, (X(n - .5) + X(nAll - .5)) / 2, top + 18, fut.title, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.sub }) }
  /* 두 계열 사이 면 */
  if (s.band) { var a = ser[s.band.a || 0].data, b = ser[s.band.b == null ? 1 : s.band.b].data, f = s.band.from || 0, bg = h.lv(svg, 3, { 'data-fx': 'fade' }), d = 'M' + X(f - .5) + ' ' + Y(a[f]);
    for (var i = f + 1; i < n; i++) d += ' H' + X(i - .5) + ' V' + Y(a[i]); d += ' H' + X(n - .5) + ' V' + Y(b[n - 1]); for (i = n - 1; i > f; i--) d += ' H' + X(i - .5) + ' V' + Y(b[i - 1]); d += ' H' + X(f - .5) + ' Z';
    E('path', { d: d, fill: C.g18, opacity: .8 }, bg) }
  /* 평균선 */
  (s.avg || []).forEach(function (q) { var dat = ser[q.s].data, f0 = q.from || 0, t0 = q.to == null ? n - 1 : q.to, sum = 0, c = 0; for (var i = f0; i <= t0; i++) if (dat[i] != null) { sum += dat[i]; c++ }
    var v = q.value != null ? q.value : sum / c, col = h.col(ser[q.s].color || (q.s ? 'main' : 'cmp')), g = h.lv(svg, 3);
    E('line', { x1: X(q.x0 || 0), x2: X(q.x1 == null ? Math.min(10, n - 1) : q.x1), y1: Y(v), y2: Y(v), stroke: col, 'stroke-width': 1.5, 'stroke-dasharray': '5 4', opacity: .6 }, g);
    var lt = String(q.label || '평균 {v}').replace('{v}', h.nf(v, q.dec == null ? 2 : q.dec)); if (q.labelEnd) T(g, (fut ? X(nAll - .5) : X(n - 1)) + 12, Y(v) + 5, lt, { 'font-size': 13, 'font-weight': 700, fill: col }); else T(g, X(q.x0 || 0), Y(v) - 8, lt, { 'font-size': 13.5, 'font-weight': 700, fill: col }) });
  /* 선 */
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'main' : 'cmp'));
    E('path', { d: q.step === false ? h.lineD(q.data, X, Y) : h.stepD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': q.width || (k ? 3.6 : 3), 'stroke-linejoin': 'round', 'stroke-dasharray': q.dash ? '6 5' : null, 'data-b': 2, 'data-fx': 'draw', 'data-ms': s.drawMs || 1100 }, svg);
    if (q.end) { var lv = q.data[n - 1], en = h.lv(svg, 2); E('circle', { cx: X(n - 1), cy: Y(lv), r: 5, fill: c }, en) } });
  var L = [];
  ser.forEach(function (q, k) { if (!q.end) return; var c = q.color || (k ? 'main' : 'cmp'), lvv = q.data[n - 1]; L.push(u.label(h.lv(svg, 2), (fut ? X(nAll - .5) : X(n - 1)) + 12, Y(lvv) + 5, q.end, { color: c, size: 14.5, dir: k ? 1 : -1 })) });
  /* 금리차 글 */
  if (s.band && s.band.labels) { var a2 = ser[s.band.a || 0].data, b2 = ser[s.band.b == null ? 1 : s.band.b].data, gl = h.lv(svg, 4);
    s.band.labels.forEach(function (l) { var at0 = Array.isArray(l.at) ? l.at : [l.at, l.at], m = Math.round((at0[0] + at0[1]) / 2), y = (Y(a2[m]) + Y(b2[m])) / 2 + 5;
      var t = T(gl, X((at0[0] + at0[1]) / 2), y, l.text, { 'text-anchor': 'middle', 'font-size': l.size || 14, 'font-weight': 700, fill: C.dark }); if (l.carry) t.setAttribute('data-carry', l.carry) }) }
  /* 꺾임점 값 */
  var vg = h.lv(svg, 4); (s.values || []).forEach(function (v) { var q = ser[v.s || 0], c = q.color || (v.s ? 'main' : 'cmp'), val = q.data[v.at], below = v.pos === 'below';
    L.push(u.label(vg, X(v.at) + (v.dx != null ? v.dx : -slot / 2 + 4), Y(val) + (v.dy != null ? v.dy : below ? 19 : -8), v.text || h.nf(val, sc.dec < 2 ? 2 : sc.dec), { color: c, size: 13.5, anchor: v.anchor, dir: below ? 1 : -1, pt: [X(v.at), Y(val)] })) });
  /* 사건 */
  var eg = h.lv(svg, 4); (s.events || []).forEach(function (ev) { var x = X(ev.at) + (ev.dx || 0), y = Y(ev.v) + (ev.dy || 0), an = ev.anchor || 'end';
    if (ev.leader) E('line', { x1: X(ev.at), x2: X(ev.at), y1: Y(ev.leader[0]), y2: Y(ev.leader[1]), stroke: C.mute, 'stroke-dasharray': '2 3' }, eg);
    var pv = null; ser.forEach(function (q) { var v = q.data[ev.at]; if (v != null && (pv == null || Math.abs(Y(v) - y) < Math.abs(Y(pv) - y))) pv = v });
    var lb = u.label(eg, x, y, ev.text, { anchor: an, size: 13.5, pt: pv != null ? [X(ev.at), Y(pv)] : null, leader: !!ev.leader }); if (ev.sub) { lb.sub = T(eg, x, y + 17, ev.sub, { 'text-anchor': an, 'font-size': 12.5, fill: C.mute }); lb.below = 17 } L.push(lb) });
  /* 차이 화살 */
  (s.arrows || []).forEach(function (ar) { var g = h.lv(svg, 4), x = X(ar.at) + (ar.dx || 0), sd = ar.side || 1; h.arrow2(g, x, Y(ar.a), Y(ar.b), C.dark);
    var ty = (Y(ar.a) + Y(ar.b)) / 2; T(g, x + sd * 10, ty - 2, ar.text, { 'font-size': 14, 'font-weight': 700, fill: C.dark, 'text-anchor': sd > 0 ? 'start' : 'end' });
    if (ar.sub) T(g, x + sd * 10, ty + 15, ar.sub, { 'font-size': 12.5, fill: C.mute, 'text-anchor': sd > 0 ? 'start' : 'end' }) });
  /* 다음 구역 갈래 · 범위 */
  if (fut) { var fb = h.lv(svg, 6, { 'data-fx': 'fade' }), xe = X(nAll - .5);
    (fut.branches || []).forEach(function (br) { var q = ser[br.s], c = h.col(q.color || (br.s ? 'main' : 'cmp')), lvv = q.data[n - 1], xb = X(br.at - .5);
      E('path', { d: 'M' + X(n - .5) + ' ' + Y(lvv) + ' H' + xe, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': '2 4' }, fb);
      E('path', { d: 'M' + xb + ' ' + Y(lvv) + ' V' + Y(br.to) + ' H' + xe, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': '2 4' }, fb) });
    (fut.labels || []).forEach(function (l) { T(fb, xe + 8, Y(l.v) + 5, l.text, { 'font-size': 13, 'font-weight': 700, fill: h.col(l.color || 'cmp') }) });
    if (fut.range) { T(fb, xe + 8, Y(fut.range.v) - 2, fut.range.sub || '', { 'font-size': 12.5, fill: C.mute }); T(fb, xe + 8, Y(fut.range.v) + 17, fut.range.text, { 'font-size': 15, 'font-weight': 700, fill: C.dark }) } }
  var SEG = []; ser.forEach(function (q) { SEG = SEG.concat(u.segsOf(q.data, X, Y, q.step)) });
  /* 시사점 상자 : 정한 자리가 선 · 이름표를 덮으면 그림 칸 안 가까운 빈자리로(못 찾으면 그대로) */
  var BX = null; if (s.box) { var bx0 = s.box, it0 = bx0.items || [], bw = X(bx0.x1) - X(bx0.x0), bxl = X(bx0.x0), bxt = Y(bx0.top), itL = it0.map(function (t) { return h.wrap(String(t), 14, bw - 62, 0) }), bh = 58 + itL.reduce(function (a2, l2) { return a2 + l2.length * 19 + 9 }, 0) + 4;
    if (bxt + bh > bot - 4) { var aL = ml + 6, aR = X(n - .5) - 4, need = Math.max.apply(null, it0.map(function (t) { return h.textW(String(t), 14, 0) + 66 })), nw = Math.min(Math.max(bw, need), aR - aL);   /* 7판 : 아래로 넘치면 넓혀서 줄 수를 줄임 */
      if (nw > bw) { bw = nw; bxl = Math.max(aL, Math.min(bxl, aR - bw)); itL = it0.map(function (t) { return h.wrap(String(t), 14, bw - 62, 0) }); bh = 58 + itL.reduce(function (a2, l2) { return a2 + l2.length * 19 + 9 }, 0) + 4 }
      if (bxt + bh > bot - 4) bxt = Math.max(top + 4, bot - 4 - bh) }
    var LB = L.map(function (l) { var x0 = l.anchor === 'end' ? l.x - l.w : l.anchor === 'middle' ? l.x - l.w / 2 : l.x; return { l: x0, r: x0 + l.w, t: l.y - l.h, b: l.y + 4 } });
    var spot = bx0.fixed ? null : u.freeSpot({ l: bxl, t: bxt, w: bw, h: bh }, SEG, LB, { l: ml + 6, t: top + 4, r: X(n - .5) - 4, b: bot - 4 });
    BX = { l: spot ? spot.l : bxl, t: spot ? spot.t : bxt, w: bw, h: bh } }
  u.avoid(L, 15, SEG, BX ? [{ l: BX.l, t: BX.t, r: BX.l + BX.w, b: BX.t + BX.h }] : []);
  /* 시사점 상자 */
  if (s.box) { var bx = s.box, g5 = h.lv(svg, 7), xa = BX.l, xb2 = BX.l + BX.w, ya = BX.t, items = bx.items || [], hh = BX.h;
    E('rect', { x: xa, y: ya, width: xb2 - xa, height: hh, rx: 10, fill: C.g08, stroke: C.g40 }, g5);
    var tcw = h.textW(bx.title || '시사점', 13.5, 1) + 28; E('rect', { x: xa + 12, y: ya + 12, width: tcw, height: 28, rx: 14, fill: C.dark }, g5); T(g5, xa + 12 + tcw / 2, ya + 31, bx.title || '시사점', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: '#fff' });
    var yy = ya + 64; items.forEach(function (t, k) { var ls = itL[k] || [String(t)]; if (bx.bullet === 'dot') E('circle', { cx: xa + 24, cy: yy - 5, r: 4, fill: C.main }, g5); else { E('circle', { cx: xa + 24, cy: yy - 5, r: 9.5, fill: C.main }, g5); T(g5, xa + 24, yy - 1, String(k + 1), { 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#fff' }) }
      ls.forEach(function (l, j) { T(g5, xa + 42, yy + j * 19, l, { 'font-size': 14, fill: C.ink }) }); yy += ls.length * 19 + 9 }) }
  /* 결정 줄 */
  if (lanes.length) { T(h.lv(svg, 1), ml, bot + 46, s.lanesTitle || '결정 일지', { 'font-size': 13, 'font-weight': 700, fill: C.sub }); u.laneMarks(svg, lanes, function (i) { return X(i) }, bot + 46, ml, X(nAll - .5), 5) }
  ctx.root.setAttribute('data-gap', s.gap || 360); ctx.root.setAttribute('data-stg', 70);
};
ECOM.parts.line.layouts = ['default', 'phasefull', 'small', 'endbig', 'deep', 'fan', 'estimate', 'drop', 'solid']; ECOM.parts.line.dark = ['deep', 'solid'];
})();
