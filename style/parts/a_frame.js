/* 표지 5종(cover style A~E) · 간지(part) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, esc = h.esc, md = h.md;
var COPY = '본 자료는 ECOM 멤버의 스터디 용도로만 활용함';
function meta(ctx) { return (ctx.deck && ctx.deck.meta) || {} }
/* A 주제 그래픽형 : graphic {labels, series:[{data,color,step,end}], band:{a,b,from}, big:{value,dec,unit,label}} */
function coverA(el, s, ctx) { var m = meta(ctx), g = s.graphic || {};
  el.innerHTML = ECOM.logo(false, 'lgc') + '<div class="no" data-b="1">' + esc((s.session || m.session || '') + (m.date || s.date ? ' · ' + (s.date || m.date) : '')) + '</div>'
    + '<div class="kick" data-b="1">' + esc(s.kicker || 'ECOM 경제 스터디') + '</div><div class="ttl" data-b="2">' + md(s.title || m.title || '') + '</div>'
    + (s.sub ? '<div class="sub" data-b="2">' + md(s.sub) + '</div>' : '') + '<div class="cpy">' + esc(s.copy || COPY) + '</div>';
  var ser = g.series || []; if (!ser.length) return;
  var svg = E('svg', { viewBox: '0 0 1280 720', width: 1280, height: 720, style: 'position:absolute;left:0;top:0' }, el), n = ser[0].data.length;
  var all = []; ser.forEach(function (q) { all = all.concat(q.data) }); var e = h.ext(all), lo = Math.min(0, e[0]), hi = e[1] * 1.08;
  var x1 = 1130, X = function (i) { return 20 + (x1 - 20) * (i + .5) / n }, Y = h.lin(lo, hi, 612, 330);
  var yr = h.lv(svg, 1); (g.labels || []).forEach(function (l, i) { if (/\.01$/.test(l) || i === 0 && !/\.01$/.test(l) && false) T(yr, X(i - .5) + 4, 640, String(l).slice(0, 4), { 'font-size': 12.5, fill: '#98A29D' }) });
  if (g.band) { var a = ser[g.band.a || 0].data, b = ser[g.band.b == null ? 1 : g.band.b].data, f = g.band.from || 0, d = 'M' + X(f - .5) + ' ' + Y(a[f]);
    for (var i = f + 1; i < n; i++) d += ' H' + X(i - .5) + ' V' + Y(a[i]); d += ' H' + X(n - .5) + ' V' + Y(b[n - 1]); for (i = n - 1; i > f; i--) d += ' H' + X(i - .5) + ' V' + Y(b[i - 1]); d += ' H' + X(f - .5) + ' Z';
    E('path', { d: d, fill: C.g18, opacity: .85, 'data-b': 4, 'data-fx': 'fade' }, svg) }
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'main' : 'cmp')); E('path', { d: q.step === false ? h.lineD(q.data, X, Y) : h.stepD(q.data, X, Y), fill: 'none', stroke: c, 'stroke-width': k ? 3.2 : 2.4, 'stroke-linejoin': 'round', 'data-b': 3, 'data-fx': 'draw', 'data-ms': 1700 }, svg);
    var lv = q.data[n - 1], en = h.lv(svg, 5); E('circle', { cx: X(n - .5), cy: Y(lv), r: 5.5, fill: c }, en); if (q.end) T(en, X(n - .5) + 14, Y(lv) + 5, q.end, { 'font-size': 16, 'font-weight': 700, fill: c }) });
  if (g.big) { var top = Math.min.apply(null, ser.map(function (q) { return Y(q.data[n - 1]) })), en2 = h.lv(svg, 5);
    if (g.big.label) T(en2, x1 - 6, top - 96, g.big.label, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 600, fill: C.sub });
    T(svg, x1 - 6, top - 22, h.nf(g.big.value, g.big.dec || 0) + (g.big.unit || ''), { 'text-anchor': 'end', 'font-size': 58, 'font-weight': 700, fill: C.main, 'data-b': 5, 'data-fx': 'count', 'data-count': g.big.value, 'data-dec': g.big.dec || 0, 'data-suf': g.big.unit || '', 'data-ms': 1000, 'data-carry': g.big.carry || null }) } }
function coverB(el, s, ctx) { var m = meta(ctx), t = s.tiles || ['%', '', 'K', '₩', '$', '', '↗', '±', '', '', '↘', '%', '', '₩'], cl = ['l', 'o', 'k', 'd', 'o', 'l', 'o', 'l', 'o', 'd', 'l', 'o', 'l', 'o'];
  el.innerHTML = '<div class="tiles">' + t.map(function (x, i) { return '<i class="' + cl[i % cl.length] + '" data-b="' + (1 + i % 3) + '" data-fx="pop">' + (cl[i % cl.length] === 'k' ? ECOM.logo(true) : esc(x)) + '</i>' }).join('') + '</div>'
    + '<div class="tt" data-b="2">' + md(s.title || m.title || '') + '</div><div class="st" data-b="3">' + md(s.sub || '') + '</div><div class="dt" data-b="3">' + esc((s.session || m.session || '') + ' · ' + (s.date || m.date || '')) + '</div><div class="cpy">' + esc(s.copy || COPY) + '</div>';
  el.setAttribute('data-stg', '60') }
function coverC(el, s, ctx) { var m = meta(ctx); el.innerHTML = '<div class="arc"></div>' + ECOM.logo(true, 'lgw') + '<div class="kick" data-b="1">' + esc(s.kicker || 'ECOM 경제 스터디 · ' + (m.session || '')) + '</div>'
  + '<div class="ttl" data-b="2">' + md(s.title || m.title || '') + '</div><div class="sub" data-b="3">' + md(s.sub || '') + '</div><div class="dt" data-b="3">' + esc(s.date || m.date || '') + '</div><div class="cpy">' + esc(s.copy || COPY) + '</div>' }
function coverD(el, s, ctx) { var m = meta(ctx), b = s.big || {}; el.innerHTML = ECOM.logo(false, 'lgc') + '<div class="no">' + esc((s.session || m.session || '') + ' · ' + (s.date || m.date || '')) + '</div>'
  + '<div class="big"><span data-b="1" data-fx="count" data-count="' + h.num(b.value) + '" data-dec="' + h.num(b.dec) + '" data-ms="1100">' + h.nf(b.value || 0, b.dec || 0) + '</span><small>' + esc(b.unit || '') + '</small></div>'
  + '<div class="ttl" data-b="2">' + md(s.title || m.title || '') + '</div><div class="sub" data-b="3">' + md(s.sub || '') + '</div><div class="cpy">' + esc(s.copy || COPY) + '</div>' }
function coverE(el, s, ctx) { var m = meta(ctx); el.innerHTML = ECOM.logo(false, 'lgc') + '<div class="kick" data-b="1">' + esc(s.kicker || 'ECOM 경제 스터디 · ' + (m.session || '')) + '</div>'
  + '<div class="ttl" data-b="2">' + md(s.title || m.title || '') + '</div><div class="sub" data-b="3">' + md(s.sub || '') + '</div><div class="dt" data-b="3">' + esc(s.date || m.date || '') + '</div><div class="bar"></div>' }
ECOM.parts.cover = function (el, s, ctx) { var st = String(s.style || (ctx.deck.meta && ctx.deck.meta.cover) || 'A').toUpperCase(); el.classList.add('cv-' + st.toLowerCase());
  ({ A: coverA, B: coverB, C: coverC, D: coverD, E: coverE }[st] || coverA)(el, s, ctx) };
/* 간지 : {no:'PART 01', name, desc, parts:[이름], idx} */
ECOM.parts.part = function (el, s) { el.classList.add('pt');
  el.innerHTML = '<div class="no mv">' + esc(s.no || '') + '</div><div class="nm mv">' + md(s.name || '') + '</div>' + (s.desc ? '<div class="ds mv">' + md(s.desc) + '</div>' : '')
    + (s.parts ? '<div class="pg">' + s.parts.map(function (p, i) { return '<div class="' + (i === s.idx ? 'on' : '') + '">' + esc(p) + '</div>' }).join('') + '</div>' : '') + ECOM.logo(true, 'lgw') };
})();
