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
/* Kick-off 그림(비공개 brand/kick → ecs.py 가 window.ECOM_LOGO.art 로 넣음). 없으면 타일 없이 그림 */
function art() { return (window.ECOM_LOGO && window.ECOM_LOGO.art) || null }
/* 표지 뒤 층 : Kick-off 1쪽 타일 12개를 처음부터 뒤에 투명도 11% · 흐림으로 깔고 앞 그래프보다 느리게 떠다니게 함(s.backdrop === false 면 뺌) */
function backdrop(el, s) { var A = art(), C0 = A && A.cover; if (s.backdrop === false || !C0 || !C0.tiles || !C0.tiles.length) return;
  var p = C0.place || { x: 33, y: 150, scale: .811 }, f = p.scale, kt = document.createElement('div'); kt.className = 'kt'; kt.setAttribute('aria-hidden', 'true');
  kt.setAttribute('data-at', 0); kt.setAttribute('data-fx', 'fade'); kt.setAttribute('data-ms', 1800); var inner = h.H('div', 'kti', null, kt);
  C0.tiles.forEach(function (t, i) { var b = t.b; h.H('i', null, '<img alt="" src="' + t.src + '">', inner, 'left:' + (p.x + b[0] * f) + 'px;top:' + (p.y + b[1] * f) + 'px;width:' + ((b[2] - b[0]) * f) + 'px;--d:' + (9 + (i % 4) * 1.6) + 's;--dl:' + (-i * .9) + 's;--dx:' + (i % 2 ? 6 : -6) + 'px') });
  el.insertBefore(kt, el.firstChild) }
ECOM.parts.cover = function (el, s, ctx) { var st = String(s.style || (ctx.deck.meta && ctx.deck.meta.cover) || 'A').toUpperCase(); el.classList.add('cv-' + st.toLowerCase());
  ({ A: coverA, B: coverB, C: coverC, D: coverD, E: coverE }[st] || coverA)(el, s, ctx); if (/^[ADE]$/.test(st)) backdrop(el, s) };
/* 마지막 장(end) : Kick-off 21쪽을 부품 11개로 — 판 테두리 그리기 → 판 안 아이콘 4 → 타일 6(작게 밀려 들어옴) → 문구 → 로고 · 쪽 번호.
   흔들림 · 흐림 · 회전 없음. 본문 맨 끝(토의 · 추후 분석 뒤) 한 장, 부록은 그 뒤 고리로. 그림이 없으면 문구만 */
ECOM.parts.end = function (el, s, ctx) { var A = art() && art().end, foot = '<div class="lg" data-at="2900" data-fx="fade">' + ECOM.logo(false) + '<span>' + esc(ctx.page) + '</span></div>';
  if (!A) { el.innerHTML = '<div data-b="1" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:700;letter-spacing:.02em;color:' + C.main + '">' + esc(s.text || 'Economic Connection Opportunity Momentum') + '</div>' + foot; return }
  var k = A.scale || .62, ox = (1280 - A.w * k) / 2, oy = (720 - A.h * k) / 2, SEQ = ['hand', 'eye', 'globe', 'people', 'pencil', 'net'];
  function place(t, at, fx, ms, from) { var b = t.b, d = h.H('i', 'ep', '<img alt="" src="' + t.src + '">', el, 'left:' + (ox + b[0] * k) + 'px;top:' + (oy + b[1] * k) + 'px;width:' + ((b[2] - b[0]) * k) + 'px');
    d.setAttribute('data-at', at); d.setAttribute('data-fx', fx); d.setAttribute('data-ms', ms); if (from) { d.setAttribute('data-dx', from[0]); d.setAttribute('data-dy', from[1]) } return d }
  function tile(t) { var i = Math.max(0, SEQ.indexOf(t.n)); return place(t, 1300 + i * 130, 'slide', 620, t.from || [0, 18]) }
  (A.under || []).forEach(tile);
  var P = A.panel, svg = E('svg', { viewBox: '0 0 1280 720', width: 1280, height: 720, style: 'position:absolute;left:0;top:0' }, el), px = ox + P[0] * k, py = oy + P[1] * k, pw = (P[2] - P[0]) * k, ph = (P[3] - P[1]) * k;
  E('rect', { x: px, y: py, width: pw, height: ph, rx: 8, fill: '#fff', 'data-at': 500, 'data-fx': 'fade', 'data-ms': 500 }, svg);
  E('rect', { x: px, y: py, width: pw, height: ph, rx: 8, fill: 'none', stroke: C.main, 'stroke-width': 2, 'data-at': 0, 'data-fx': 'draw', 'data-ms': 900 }, svg);
  (A.icons || []).forEach(function (t, i) { place(t, 800 + i * 110, 'zoom', 450) });
  (A.tiles || []).forEach(tile);
  if (A.motto) place(A.motto, 2500, 'wipe', 900);
  el.insertAdjacentHTML('beforeend', foot); el.setAttribute('aria-label', 'ECOM — Economic Connection Opportunity Momentum') };
/* 간지 : {no:'PART 01', name, desc, parts:[이름], idx} */
ECOM.parts.part = function (el, s, ctx) { if (s.layout && s.layout !== 'default' && ECOM.chapter) return ECOM.chapter(el, s, ctx); el.classList.add('pt');
  el.innerHTML = '<div class="no mv">' + esc(s.no || '') + '</div><div class="nm mv">' + md(s.name || '') + '</div>' + (s.desc ? '<div class="ds mv">' + md(s.desc) + '</div>' : '')
    + (s.parts ? '<div class="pg">' + s.parts.map(function (p, i) { return '<div class="' + (i === s.idx ? 'on' : '') + '">' + esc(p) + '</div>' }).join('') + '</div>' : '') + ECOM.logo(true, 'lgw') };
})();
