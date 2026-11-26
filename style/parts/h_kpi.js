/* kpi — 큰 숫자 띠(2~4개) + 아래 큰 차트(대표 계열) : 카드 + 오른쪽 요점 칸 대신 화면을 채움
   cards[{label,sub,value,dec,unit,chip:{text,dir:'up|dn|flat'},asof,hero}] · chart{type:'line|bar',labels,series:[{name,data,color}],y,unit,marks:'auto'|[{s,at,text,pos}],avg,note} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
/* ───── 배치(layout) ─────
   default : 아래 기본 그림(바뀌지 않음)
   hero    : 큰 하나 + 작은 셋 — 왼쪽 짙은 초록 큰 칸에 대표 숫자(hero 카드, 없으면 첫 카드), 오른쪽 위 작은 카드 셋, 오른쪽 아래 차트.
             작은 카드가 3장 안 되면 chart 첫 계열에서 기간 최고 · 최저 · 평균을 계산해 채움(이미 있는 이름은 건너뜀)
   spark   : 숫자 + 긴 미니 선 — 카드마다 한 줄, 왼쪽 숫자 · 오른쪽 chart 첫 계열 긴 선. 점 = 그 숫자가 선 위에서 닿은 자리, 점선 = 그 숫자 높이
   band    : 짙은 띠 — 위에 chart, 본문 가운데 짙은 초록 가로 띠에 카드 숫자들, 띠 아래 칩 · 기준 시점 */
var LAY = {};
function dc(v) { var t = String(v), i = t.indexOf('.'); return i < 0 ? 0 : Math.min(2, t.length - i - 1) }
function sh(l) { return ECOM.u.short(l) }
function pc(P, c) { return P[c] || h.col(c) }
function fitFs(str, unit, w, max) { var a = h.textW(str, 1, true) + (unit ? h.textW(unit, .38, true) + .1 : 0); return Math.max(24, Math.min(max, Math.floor(w / a))) }
function chipOf(P, c) { if (!c) return null; var dn = c.dir === 'dn', up = c.dir === 'up'; return { t: (up ? '▲ ' : dn ? '▼ ' : '') + c.text, bg: up ? P.g18 : dn ? P.warnsoft : P.light, fg: up ? P.dark : dn ? P.warn : P.sub } }
/* 칸 안에 그리는 차트 : bx {l,r,t,b} · 첫 계열 막대(type bar) 또는 선 · 최고 · 최저 · 마지막 표시 */
function chartIn(svg, ch, bx, P, lvl) { var u = ECOM.u, labels = ch.labels, n = labels.length, ser = ch.series || [], vals = [], dec = ch.dec; ser.forEach(function (q) { vals = vals.concat(q.data) });
  if (dec == null) { dec = 0; vals.forEach(function (v) { if (v != null) dec = Math.max(dec, dc(v)) }); dec = Math.min(dec, Math.abs(vals[0]) >= 100 ? 1 : 2) }
  var bar = ch.type === 'bar', ends = ser.length > 1 ? 130 : 24, ml = bx.l + 54, x1 = bx.r - ends, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) }, bot = bx.b - 24;
  var sc = u.yScale(bar ? vals.concat([0]) : vals, ch.y, bx.t + 30, bot), Y = sc.Y, g = h.lv(svg, lvl, { 'data-fx': 'fade' });
  u.yAxis(g, ml, x1, sc, { unit: ch.unit, base: true }); u.xLabels(g, labels, X, bot + 20, u.xTicks(n, Math.max(4, Math.round((x1 - ml) / 70)), ch.ticks), { boldLast: true });
  var L = [], SEG = [];
  ser.forEach(function (q, k) { var c = pc(P, q.color || (k ? 'cmp' : 'main')), d = q.data;
    if (bar && k === 0) { var bw = Math.max(3, slot * .62); d.forEach(function (v, i) { if (v == null) return; E('rect', { x: X(i) - bw / 2, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 1.5, fill: i === n - 1 ? P.main : (v < 0 ? P.light : P.gray), 'data-b': lvl + 1, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) }) }
    else { SEG = SEG.concat(u.segsOf(d, X, Y, false)); E('path', { d: h.lineD(d, X, Y), fill: 'none', stroke: c, 'stroke-width': k ? 2.6 : 3.4, 'stroke-linejoin': 'round', 'data-key': q.name, 'data-b': lvl + 1, 'data-fx': 'draw', 'data-ms': 1000 }, svg) }
    if (k > 0) return; var mi = 0, ma = 0; d.forEach(function (v, i) { if (v == null) return; if (d[mi] == null || v < d[mi]) mi = i; if (d[ma] == null || v > d[ma]) ma = i });
    var pts = [{ at: ma, t: '최고', dir: -1 }]; if (mi !== ma) pts.push({ at: mi, t: '최저', dir: 1 }); if (n - 1 !== ma && n - 1 !== mi) pts.push({ at: n - 1, t: '', dir: -1 });
    var mg = h.lv(svg, lvl + 2, { 'data-fx': 'fade' }); pts.forEach(function (m) { var v = d[m.at], x = X(m.at); E('circle', { cx: x, cy: Y(v), r: 4.8, fill: '#fff', stroke: c, 'stroke-width': 2.2 }, mg);
      var an = m.at > n * .8 ? 'end' : m.at < n * .15 ? 'start' : 'middle', below = m.dir > 0 && Y(v) + 24 < bot - 4;
      L.push(u.label(mg, x, Y(v) + (below ? 21 : -11), (m.t ? m.t + ' ' : '') + h.nf(v, dec) + (ch.suf || ''), { color: P.dark, size: 13.5, anchor: an, dir: below ? 1 : -1 })) }) });
  if (ser.length > 1) ser.forEach(function (q, k) { var v = q.data[n - 1]; if (v != null) L.push(u.label(h.lv(svg, lvl + 2), X(n - 1) + 10, Y(v) + 5, q.name + ' ' + h.nf(v, dec), { color: pc(P, q.color || (k ? 'cmp' : 'main')), size: 13 })) });
  u.avoid(L, 14, SEG, []); return { X: X, Y: Y, sc: sc, dec: dec, ml: ml, x1: x1, bot: bot } }

LAY.hero = function (bd, s, ctx) { var P = ctx.P, K = ECOM.kx, cards = s.cards || [], ch = s.chart, hi = Math.max(0, cards.findIndex(function (c) { return c.hero })), hc = cards[hi] || {}, sm = cards.filter(function (c, i) { return i !== hi });
  if (ch && ch.series && ch.series[0]) { var d = ch.series[0].data.filter(function (v) { return v != null }), lb = ch.labels, has = function (w) { return cards.some(function (c) { return String(c.label).indexOf(w) >= 0 }) }, unit = hc.unit || '', dec = hc.dec;
    var mn = Math.min.apply(null, d), mni = ch.series[0].data.indexOf(mn), mx = Math.max.apply(null, d), mxi = ch.series[0].data.indexOf(mx), av = d.reduce(function (p, c) { return p + c }, 0) / d.length;
    [!has('최고') && { label: '기간 최고', sub: lb[mxi], value: mx }, !has('최저') && { label: '기간 최저', sub: lb[mni], value: mn }, !has('평균') && { label: '기간 평균', sub: lb[0] + '~' + lb[lb.length - 1], value: av }, { label: '기간 처음', sub: lb[0], value: ch.series[0].data[0] }].forEach(function (c) { if (c && sm.length < 3 && Math.abs(c.value - hc.value) > 1e-9) sm.push({ label: c.label, sub: c.sub, value: c.value, dec: dec, unit: unit }) }) }
  sm = sm.slice(0, 3);
  var hw = 440, fs = fitFs(h.nf(hc.value, hc.dec || 0), hc.unit, hw - 56, 118), cp = chipOf(P, hc.chip), x0 = hw + 28, rw = 1168 - x0;
  var hp = K.D(bd, 'kx', 0, 0, hw, 512, null, { 'data-b': 1, 'data-fx': 'right', 'data-ms': 520, 'data-key': hc.label }); hp.style.cssText += ';border-radius:6px;background:' + P.dark + ';color:#fff;padding:30px 28px 0;overflow:hidden';
  hp.innerHTML = '<div style="font-size:20px;font-weight:700;line-height:1.3">' + h.esc(hc.label) + '</div>' + (hc.sub ? '<div style="font-size:16px;color:rgba(255,255,255,.8);margin-top:6px">' + h.esc(hc.sub) + '</div>' : '')
    + '<div style="position:absolute;left:28px;right:20px;top:' + (cp ? 168 : 190) + 'px;white-space:nowrap;font-variant-numeric:tabular-nums;letter-spacing:-.03em;font-weight:700;font-size:' + ECOM.fs(fs) + 'px;line-height:1"><span data-b="2" data-fx="count" data-count="' + h.num(hc.value) + '" data-dec="' + h.num(hc.dec) + '">' + h.nf(hc.value, hc.dec || 0) + '</span><small style="font-size:' + ECOM.fs(Math.round(fs * .34)) + 'px;margin-left:6px;font-weight:600;color:' + P.on + '">' + h.esc(hc.unit || '') + '</small></div>'
    + (cp ? '<div style="position:absolute;left:28px;bottom:84px"><span data-b="3" data-fx="pop" style="display:inline-block;background:rgba(255,255,255,.16);border-radius:999px;padding:6px 16px;font-size:16px;font-weight:700">' + h.esc(cp.t) + '</span></div>' : '')
    + (hc.asof ? '<div style="position:absolute;left:28px;bottom:40px;font-size:16px;color:rgba(255,255,255,.75)">' + h.esc(hc.asof) + '</div>' : '');
  var gw = 14, cw = (rw - gw * (sm.length - 1)) / Math.max(1, sm.length);
  sm.forEach(function (c, i) { var k = K.D(bd, 'kx', x0 + i * (cw + gw), 0, cw, 138, null, { 'data-b': 2, 'data-fx': 'rise', 'data-at': i * 90, 'data-key': c.label }), cc = chipOf(P, c.chip);
    k.style.cssText += ';border-top:3px solid ' + P.g40 + ';padding:10px 2px 0';
    k.innerHTML = '<div style="font-size:16px;font-weight:700;color:' + P.sub + '">' + h.esc(c.label) + (c.sub ? '<span style="font-weight:500;color:' + P.mute + ';font-size:13px;margin-left:6px">' + h.esc(c.sub) + '</span>' : '') + '</div>'
      + '<div style="font-size:' + ECOM.fs(fitFs(h.nf(c.value, c.dec || 0), c.unit, cw - 8, 46)) + 'px;font-weight:700;letter-spacing:-.03em;line-height:1.12;margin-top:6px;font-variant-numeric:tabular-nums;white-space:nowrap;color:' + P.ink + '"><span data-b="3" data-fx="count" data-count="' + h.num(c.value) + '" data-dec="' + h.num(c.dec) + '">' + h.nf(c.value, c.dec || 0) + '</span><small style="font-size:18px;font-weight:600;margin-left:3px;color:' + P.sub + '">' + h.esc(c.unit || '') + '</small></div>'
      + (cc ? '<div style="margin-top:8px"><span style="display:inline-block;background:' + cc.bg + ';color:' + cc.fg + ';border-radius:999px;padding:3px 11px;font-size:13px;font-weight:700">' + h.esc(cc.t) + '</span></div>' : '') });
  if (!ch) return; var svg = ctx.svg(512); if (ch.title || true) T(h.lv(svg, 4), x0, 172, ch.title || (hc.label + ' 흐름'), { 'font-size': 14, 'font-weight': 700, fill: P.sub });
  chartIn(svg, ch, { l: x0, r: 1168, t: 184, b: 512 }, P, 4); ctx.root.setAttribute('data-gap', 340); ctx.root.setAttribute('data-stg', 60) };

LAY.spark = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, K = ECOM.kx, cards = (s.cards || []).slice(0, 4), ch = s.chart, n = cards.length, rh = Math.floor((512 - 26) / Math.max(1, n));
  var svg = ctx.svg(512), q = ch && ch.series && ch.series[0], d = q ? q.data : [], labels = ch ? ch.labels : [], m = d.length, vals = d.filter(function (v) { return v != null }), lx = 400, rx = 1168 - 112;
  var sc = u.yScale(vals, ch && ch.y ? ch.y : null, 0, 100), dec = 0; vals.forEach(function (v) { dec = Math.max(dec, dc(v)) });
  var slot = (rx - lx) / Math.max(1, m), X = function (i) { return lx + slot * (i + .5) };
  cards.forEach(function (c, i) { var y0 = i * rh, hero = c.hero || (i === 0 && !cards.some(function (x) { return x.hero })), col = hero ? P.dark : P.cmp, cp = chipOf(P, c.chip);
    var row = K.D(bd, 'kx', 0, y0, 360, rh, null, { 'data-b': 1 + i, 'data-fx': 'right', 'data-key': c.label });
    row.style.cssText += ';border-top:3px solid ' + (hero ? P.main : P.g40) + ';padding:14px 0 0;display:flex;flex-direction:column;justify-content:center;gap:2px';
    row.innerHTML = '<div style="font-size:16px;font-weight:700;color:' + P.sub + '">' + h.esc(c.label) + (c.sub ? '<span style="font-weight:500;color:' + P.mute + ';font-size:16px;margin-left:8px">' + h.esc(c.sub) + '</span>' : '') + '</div>'
      + '<div style="font-size:' + ECOM.fs(fitFs(h.nf(c.value, c.dec || 0), c.unit, 330, 58)) + 'px;font-weight:700;letter-spacing:-.03em;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap;color:' + col + '"><span data-fx="count" data-count="' + h.num(c.value) + '" data-dec="' + h.num(c.dec) + '">' + h.nf(c.value, c.dec || 0) + '</span><small style="font-size:20px;font-weight:600;margin-left:4px;color:' + P.sub + '">' + h.esc(c.unit || '') + '</small></div>'
      + ((cp || c.asof) ? '<div style="display:flex;gap:10px;align-items:center;margin-top:4px">' + (cp ? '<span style="background:' + cp.bg + ';color:' + cp.fg + ';border-radius:999px;padding:3px 11px;font-size:13px;font-weight:700">' + h.esc(cp.t) + '</span>' : '') + (c.asof ? '<span style="font-size:13px;color:' + P.mute + '">' + h.esc(c.asof) + '</span>' : '') + '</div>' : '');
    if (!q) return; var pt = y0 + 26, pb = y0 + rh - 16, Y = h.lin(sc.lo, sc.hi, pb, pt), g = E('g', { 'data-key': c.label, 'data-b': 1 + i, 'data-fx': 'fade' }, svg);
    E('line', { x1: lx, x2: rx, y1: pb, y2: pb, stroke: P.axis }, g); E('line', { x1: lx, x2: rx, y1: pt, y2: pt, stroke: P.grid, 'stroke-dasharray': '3 4' }, g);
    var nearest = 0, best = Infinity; d.forEach(function (v, j) { if (v != null && Math.abs(v - c.value) < best) { best = Math.abs(v - c.value); nearest = j } });
    var vy = Y(c.value), exact = best < Math.pow(10, -(c.dec || 0)) / 2 + 1e-9; E('line', { x1: lx, x2: rx, y1: vy, y2: vy, stroke: col, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', opacity: .65 }, g); T(g, rx + 10, vy + 5, c.label, { 'font-size': 13.5, 'font-weight': 700, fill: col });
    E('path', { d: h.lineD(d, X, Y), fill: 'none', stroke: hero ? P.main : P.cmp, 'stroke-width': hero ? 3.4 : 2.8, 'stroke-linejoin': 'round', 'data-b': 1 + i, 'data-fx': 'draw', 'data-ms': 1000 }, svg);
    if (!exact) return; var dg = h.lv(svg, 1 + i, { 'data-fx': 'pop', 'data-at': 700 }), dx = X(nearest); E('circle', { cx: dx, cy: Y(d[nearest]), r: 7, fill: col, stroke: '#fff', 'stroke-width': 2.5 }, dg);
    var t = sh(labels[nearest]), an = nearest > m * .75 ? 'end' : nearest < m * .25 ? 'start' : 'middle', up = vy - pt > 30;
    T(dg, dx + (an === 'end' ? 10 : an === 'start' ? -10 : 0), up ? vy - 14 : vy + 26, t, { 'text-anchor': an, 'font-size': 13.5, 'font-weight': 700, fill: col }) });
  if (q) { var gx = h.lv(svg, 1, { 'data-fx': 'fade' }); u.xLabels(gx, labels, X, 504, [0, Math.round((m - 1) / 2), m - 1], { boldLast: true }) }
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 90) };

LAY.band = function (bd, s, ctx) { var P = ctx.P, cards = (s.cards || []).slice(0, 4), ch = s.chart, n = Math.max(1, cards.length), svg = ctx.svg(512), by = 312, bh = 138, cw = 1168 / n, dec = 0;
  if (ch) chartIn(svg, ch, { l: 0, r: 1168, t: 0, b: 296 }, P, 1);
  var g = E('g', { 'data-b': 3, 'data-fx': 'wipe', 'data-ms': 700 }, svg); E('rect', { x: 0, y: by, width: 1168, height: bh, rx: 16, fill: P.dark }, g);
  cards.forEach(function (c, i) { var cx = i * cw, fs = fitFs(h.nf(c.value, c.dec || 0), c.unit, cw - 70, 62), gq = E('g', { 'data-key': c.label, 'data-b': 4, 'data-fx': 'rise', 'data-at': i * 100 }, svg), cp = chipOf(P, c.chip);
    if (i) E('line', { x1: cx, x2: cx, y1: by + 22, y2: by + bh - 22, stroke: 'rgba(255,255,255,.3)' }, gq);
    T(gq, cx + 32, by + 34, c.label + (c.sub ? '  ' + c.sub : ''), { 'font-size': 15, 'font-weight': 700, fill: P.on });
    T(gq, cx + 32, by + 34 + fs * .98 + 14, h.nf(c.value, c.dec || 0), { 'font-size': fs, 'font-weight': 700, fill: '#fff', 'letter-spacing': '-0.03em', 'data-fx': 'count', 'data-count': c.value, 'data-dec': c.dec || 0 });
    T(gq, cx + 38 + h.textW(h.nf(c.value, c.dec || 0), fs, true), by + 34 + fs * .98 + 14, c.unit || '', { 'font-size': Math.round(fs * .36), 'font-weight': 600, fill: P.on });
    var ty = by + bh + 34; if (cp) { var w = h.textW(cp.t, 14, true) + 26, gc = E('g', { 'data-key': c.label, 'data-b': 5, 'data-fx': 'pop', 'data-at': i * 100 }, svg); E('rect', { x: cx + 32, y: ty - 21, width: w, height: 30, rx: 15, fill: cp.bg }, gc); T(gc, cx + 45, ty - .5, cp.t, { 'font-size': 14, 'font-weight': 700, fill: cp.fg }) }
    if (c.asof) T(E('g', { 'data-b': 5, 'data-fx': 'fade' }, svg), cx + 32, ty + 30, c.asof, { 'font-size': 13.5, fill: P.mute }) });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 70) };

ECOM.parts.kpi = function (bd, s, ctx) { if (s.layout === 'map' && ECOM.gm && ECOM.gm.ok(s)) return ECOM.gm.kpi(bd, s, ctx); if (s.layout && LAY[s.layout]) return LAY[s.layout](bd, s, ctx); var u = ECOM.u, cards = s.cards || [], kb = h.H('div', 'kb', null, bd);
  kb.style.gridTemplateColumns = 'repeat(' + Math.max(1, cards.length) + ',minmax(0,1fr))';
  cards.forEach(function (c, i) { var k = h.H('div', 'kc' + ((c.hero || (i === 0 && !cards.some(function (x) { return x.hero }))) ? ' hero' : ''), null, kb); k.setAttribute('data-b', 1);
    k.innerHTML = '<div class="l">' + h.esc(c.label) + (c.sub ? '<span>' + h.esc(c.sub) + '</span>' : '') + '</div><div class="v"><span data-b="2" data-fx="count" data-count="' + h.num(c.value) + '" data-dec="' + h.num(c.dec) + '">' + h.nf(c.value, c.dec || 0) + '</span><small>' + h.esc(c.unit || '') + '</small></div>'
      + '<div class="c">' + (c.chip ? '<span class="chip2 ' + (c.chip.dir === 'up' ? 'up' : c.chip.dir === 'dn' ? 'dn' : '') + '" data-b="3" data-fx="pop">' + (c.chip.dir === 'up' ? '▲ ' : c.chip.dir === 'dn' ? '▼ ' : '') + h.esc(c.chip.text) + '</span>' : '') + (c.asof ? '<span>' + h.esc(c.asof) + '</span>' : '') + '</div>' });
  var ch = s.chart; if (!ch) return; var svg = ctx.svg(512), top = 168, bot = 482, labels = ch.labels, n = labels.length, ser = ch.series || [], vals = [];
  ser.forEach(function (q) { vals = vals.concat(q.data) }); var ends = ser.length > 1 || ch.endLabels ? 150 : 30, ml = 54, x1 = 1168 - ends, slot = (x1 - ml) / n, X = function (i) { return ml + slot * (i + .5) };
  if (ch.title) T(h.lv(svg, 4), 0, top - 14, ch.title, { 'font-size': 13.5, 'font-weight': 700, fill: C.sub });
  var sc = u.yScale(ch.type === 'bar' ? vals.concat([0]) : vals, ch.y, top + 14, bot), Y = sc.Y, g = h.lv(svg, 4, { 'data-fx': 'fade' });
  u.yAxis(g, ml, x1, sc, { unit: ch.unit, base: true }); u.xLabels(g, labels, X, bot + 20, u.xTicks(n, 12, ch.ticks), { boldLast: true });
  if (ser.length > 1) h.legend(g, ml + 10, top + 4, ser.map(function (q, k) { return { color: q.color || (k ? 'cmp' : 'main'), text: q.name } }));
  var L = [];
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'cmp' : 'main')), d = q.data;
    if (ch.type === 'bar' && k === 0) { var bw = Math.max(3, slot * .62); d.forEach(function (v, i) { if (v == null) return; E('rect', { x: X(i) - bw / 2, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(1.5, Math.abs(Y(v) - Y(0))), rx: 1.5, fill: i === n - 1 ? C.main : (v < 0 ? C.light : C.gray), 'data-b': 5, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) }); ctx.root.setAttribute('data-stg', Math.max(4, Math.min(30, 500 / n))) }
    else E('path', { d: h.lineD(d, X, Y), fill: 'none', stroke: c, 'stroke-width': k ? 2.4 : 3.2, 'stroke-linejoin': 'round', 'data-b': 5, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var marks = ch.marks === 'auto' || !ch.marks ? (k === 0 ? (function () { var mi = 0, ma = 0; d.forEach(function (v, i) { if (v == null) return; if (d[mi] == null || v < d[mi]) mi = i; if (d[ma] == null || v > d[ma]) ma = i }); var o = [{ at: ma, pos: 'above', t: '최고' }, { at: mi, pos: 'below', t: '최저' }]; if (n - 1 !== ma && n - 1 !== mi && ends <= 30) o.push({ at: n - 1, pos: 'above' }); return o })() : []) : ch.marks.filter(function (m) { return (m.s || 0) === k });
    var mg = h.lv(svg, 6, { 'data-fx': 'fade' }); marks.forEach(function (m) { var v = d[m.at]; if (v == null) return; E('circle', { cx: X(m.at), cy: Y(v), r: 4.5, fill: '#fff', stroke: c, 'stroke-width': 2 }, mg);
      var t = m.text || ((m.t ? m.t + ' ' : '') + h.nf(v, ch.dec == null ? (Math.abs(v) >= 100 ? 1 : 2) : ch.dec) + (ch.suf || '')), an = m.at > n * .8 ? 'end' : m.at < n * .15 ? 'start' : 'middle';
      var below = m.pos === 'below' && Y(v) + 22 < bot - 4; L.push(u.label(mg, X(m.at), Y(v) + (below ? 20 : -10), t, { color: k ? 'cmp' : 'dark', size: 13, anchor: an, dir: below ? 1 : -1 })) });
    if (ends > 30) L.push(u.label(h.lv(svg, 6), X(n - 1) + 10, Y(d[n - 1]) + 5, q.name + (d[n - 1] != null ? ' ' + h.nf(d[n - 1], ch.dec == null ? 1 : ch.dec) : ''), { color: q.color || (k ? 'cmp' : 'main'), size: 13 })) });
  if (ch.avg) { var a = ser[0].data.filter(function (v) { return v != null }), av = a.reduce(function (p, c) { return p + c }, 0) / a.length, ag = h.lv(svg, 6, { 'data-fx': 'fade' });
    E('line', { x1: ml, x2: x1, y1: Y(av), y2: Y(av), stroke: C.dark, 'stroke-dasharray': '5 4', opacity: .5 }, ag); L.push(u.label(ag, ml + 6, Y(av) - 7, (ch.avgText || '평균 {v}').replace('{v}', h.nf(av, ch.dec == null ? 1 : ch.dec) + (ch.suf || '')), { color: 'dark', size: 12.5 })) }
  u.avoid(L); ctx.root.setAttribute('data-gap', 320) };
ECOM.parts.kpi.layouts = ['default', 'hero', 'spark', 'band', 'map'];
})();
