/* p_mapspread.js — 번지는 지도(영상 장면 문법). 지도 재료(ECOM.gm.geoLike · 빌드가 넣은 s._geo) 위에 시간 · 사건 · 흐름이 번짐.
   배치 years : 연도 상자가 바뀌며 나라가 차례로 칠해짐 + 오른쪽 해마다 누계   · 칸 steps[{year, iso[], note, tag}] · cap · unit · total · view.bbox
   배치 rings : 칠한 나라 위에 붉은 원이 하나씩 커지며 찍힘 + 번호 목록       · 칸 iso[](바탕 칠) · isoLabel · events[{at, label, note, year}] · ringLabel · cap
   배치 fan   : 한 점에서 여러 나라로 곡선이 뻗음(굵기 = 값) + 순위 목록       · 칸 from · dest[{c, label, value}] · unit · dec · cap · fromLabel
   나라 이름 · 좌표는 at · from · c · iso 칸에 적어야 빌드가 지도 범위에 넣음(view.bbox 를 적으면 그 범위). 기본 DOM = 끝 모습, 해 바뀜 · 원 커짐은 _hook 안에서만 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, Cd = ECOM.Cd, E = h.E, T = h.T, uid = 0;
function hx(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }) }
function mix(a, b, t) { var A = hx(a), B = hx(b); return '#' + [0, 1, 2].map(function (j) { var v = Math.round(A[j] + (B[j] - A[j]) * t); return (v < 16 ? '0' : '') + v.toString(16) }).join('') }
function stepCols(n, dk) { var a = dk ? '#2E8F6B' : '#A9D6C4', b = dk ? '#CFF6E3' : '#00593D', o = []; for (var i = 0; i < n; i++) o.push(mix(a, b, n === 1 ? 1 : i / (n - 1))); return o }

/* 바다 · 땅 · 국경이 상자 안에 그려지고, 칠할 나라는 paint 층에 붙음(국경이 그 위) */
function mapBase(svg, s, box, dk) {
  var G = ECOM.gm.geoLike(s, box[2], box[3]), id = 'ps' + (++uid), g = E('g', { transform: 'translate(' + box[0] + ',' + box[1] + ')' }, svg);
  var cp = E('clipPath', { id: id }, E('defs', {}, svg)); E('rect', { width: box[2], height: box[3], rx: 12 }, cp);
  var m = E('g', { 'clip-path': 'url(#' + id + ')' }, g);
  E('rect', { width: box[2], height: box[3], fill: dk ? '#14566A' : '#E6EFEB' }, m);
  E('path', { d: G.land, fill: 'none', stroke: dk ? '#8FD3D0' : '#AFC4BC', 'stroke-width': 2.6, 'stroke-linejoin': 'round', opacity: dk ? .45 : .55 }, m);
  E('path', { d: G.land, fill: dk ? '#0B2427' : '#FFFFFF' }, m);
  var paint = E('g', {}, m); E('path', { d: G.land, fill: 'none', stroke: dk ? '#1D4A4E' : '#C5D1CC', 'stroke-width': .8 }, m);
  var ov = E('g', { transform: 'translate(' + box[0] + ',' + box[1] + ')' }, svg);
  function iso(v) { var k = String(v); return G.countries[k] ? k : (G.names[k] && G.countries[G.names[k]] ? G.names[k] : null) }
  return { G: G, paint: paint, ov: ov, iso: iso, pt: function (v) { return G.find(v) },
    fill: function (k, col, at, key) { var i = iso(k); if (!i) return null; return E('path', { d: G.countries[i], fill: col, 'data-key': key || null, 'data-at': at, 'data-fx': 'fade', 'data-ms': 500 }, paint) } } }

function legendRow(svg, y, items, P, at) { var g = E('g', { 'data-at': at || 1800, 'data-fx': 'fade' }, svg), x = 0;
  items.forEach(function (it) { var w = 0;
    if (it.cols) { it.cols.forEach(function (c, i) { E('rect', { x: x + i * 14, y: y - 11, width: 14, height: 12, fill: c }, g) }); w = it.cols.length * 14 }
    else if (it.k === 'line') { E('path', { d: 'M' + x + ' ' + (y - 5) + ' h8 M' + (x + 10) + ' ' + (y - 5) + ' h12 M' + (x + 24) + ' ' + (y - 5) + ' h16', stroke: it.c, 'stroke-width': 2, 'stroke-linecap': 'round' }, g); E('path', { d: 'M' + x + ' ' + (y - 5) + ' h40', stroke: it.c, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: .9 }, g); w = 40 }
    else if (it.k === 'ring') { E('circle', { cx: x + 8, cy: y - 5, r: 7, fill: 'none', stroke: it.c, 'stroke-width': 2.4 }, g); w = 16 }
    else { E('rect', { x: x, y: y - 11, width: 18, height: 12, rx: 3, fill: it.c, stroke: P.line }, g); w = 18 }
    T(g, x + w + 8, y, it.t, { 'font-size': 12.5, fill: P.sub }); x += w + 8 + h.textW(it.t, 12.5) + 20 }) }

function panelCard(svg, x, y, w, hh, dk, P) { return E('rect', { x: x, y: y, width: w, height: hh, rx: 12, fill: dk ? Cd.g08 : '#fff', stroke: P.line }, svg) }
function tagText(g, x, y, t, dk, o) { return T(g, x, y, t, Object.assign({ 'font-size': 13, 'font-weight': 700, fill: dk ? '#fff' : C.ink, 'paint-order': 'stroke', stroke: dk ? '#0B2427' : '#fff', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, o || {})) }
function fit(t, size, w, bold) { while (size > 12.5 && h.textW(t, size, bold) > w) size -= .5; return size }

/* years */
function years(bd, s, ctx) {
  var dk = ctx.dark, P = ctx.P, svg = ctx.svg(512), st = (s.steps || []).slice(0, 8), n = st.length, MW = 800, MH = 484;
  var b = mapBase(svg, s, [0, 0, MW, MH], dk), cols = stepCols(n, dk), un = s.unit || '개국', cum = [], c = 0, pl = ECOM.gm.placer(MW, MH);
  st.forEach(function (x) { c += (x.iso || []).length; cum.push(c) }); var tot = s.total || c, tm = function (i) { return 500 + i * (n > 6 ? 560 : 680) };
  st.forEach(function (x, i) { (x.iso || []).forEach(function (k, j) { b.fill(k, cols[i], tm(i) + j * 40, x.note || String(x.year)) });
    if (x.tag) { var p = b.pt(x.at || (x.iso || [])[0]); if (!p) return; var w = h.textW(x.tag, 13, 1) + 4, r = pl.put(p[0], p[1], w, 18, 10), g = E('g', { 'data-at': tm(i) + 250, 'data-fx': 'fade', 'data-key': x.note || String(x.year) }, b.ov);
      E('circle', { cx: p[0], cy: p[1], r: 3.5, fill: dk ? '#fff' : C.ink }, g); tagText(g, r[0] + w / 2, r[1] + 14, x.tag, dk, { 'text-anchor': 'middle' }) } });
  /* 오른쪽 : 연도 상자 + 해마다 누계 */
  var px = MW + 24, PW = 1168 - px, lastY = n ? st[n - 1].year : '';
  panelCard(svg, px, 0, PW, 124, dk, P); T(svg, px + 20, 28, s.cap || '발효국 누계', { 'font-size': 14, 'font-weight': 700, fill: P.mute });
  var yt = T(svg, px + 20, 98, String(lastY), { 'font-size': 66, 'font-weight': 800, fill: P.dark, 'letter-spacing': '-.03em' });
  var ct = T(svg, px + PW - 20, 98, (cum[n - 1] || 0) + un, { 'text-anchor': 'end', 'font-size': 38, 'font-weight': 800, fill: P.main });
  var y0 = 140, rh = Math.min(52, Math.floor((MH - y0) / Math.max(1, n))), yw = Math.max.apply(null, st.map(function (x) { return h.textW(String(x.year), 15, 1) }).concat([30])), nx = 22 + yw + 14;
  st.forEach(function (x, i) { var y = y0 + i * rh, g = E('g', { 'data-at': tm(i), 'data-fx': 'fade', 'data-key': x.note || String(x.year) }, svg), note = String(x.note || ''), nw = PW - nx - 50, fs = fit(note, 14, nw);
    E('rect', { x: px, y: y + 3, width: 14, height: 14, rx: 3, fill: cols[i] }, g); T(g, px + 22, y + 16, String(x.year), { 'font-size': 15, 'font-weight': 800, fill: P.ink });
    T(g, px + nx, y + 16, note, { 'font-size': fs, fill: P.sub }); T(g, px + PW, y + 16, '+' + (x.iso || []).length, { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: P.main });
    var bw = PW - 22 - 58; E('rect', { x: px + 22, y: y + 24, width: bw, height: 8, rx: 4, fill: dk ? Cd.g18 : C.g08 }, g);
    E('rect', { x: px + 22, y: y + 24, width: Math.max(4, bw * cum[i] / tot), height: 8, rx: 4, fill: cols[i], 'data-at': tm(i) + 150, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 500 }, g);
    T(g, px + PW, y + 33, cum[i] + un, { 'text-anchor': 'end', 'font-size': 12.5, fill: P.mute }) });
  legendRow(svg, 502, [{ cols: cols.length > 4 ? [cols[0], cols[Math.floor(n / 2)], cols[n - 1]] : cols, t: '칠한 나라 · 진할수록 나중(오른쪽 표의 색)' }, { c: dk ? '#0B2427' : '#fff', t: '빈 땅 = 해당 없음' }], P, 1800);
  function set(i) { yt.textContent = String(st[i].year); ct.textContent = cum[i] + un }
  ctx.root._done = function () { if (n) set(n - 1) };
  ctx.root._hook = function (root) { if (h.RM() || !n) return 0; root._tm = root._tm || []; set(0);
    st.forEach(function (x, i) { if (i) root._tm.push(setTimeout(function () { set(i) }, tm(i))) }); return tm(n - 1) + 700 };
  ctx.root.setAttribute('data-gap', 300) }

/* rings */
function rings(bd, s, ctx) {
  var dk = ctx.dark, P = ctx.P, svg = ctx.svg(512), ev = (s.events || []).slice(0, 7), n = ev.length, MW = 760, MH = 484, RED = dk ? '#FF9B73' : '#B4461E';
  var b = mapBase(svg, s, [0, 0, MW, MH], dk), tm = function (i) { return 600 + i * 560 };
  (s.iso || []).forEach(function (k, j) { b.fill(k, dk ? '#2E8F6B' : '#A9D6C4', 300 + j * 40, k) });
  var outers = [];
  ev.forEach(function (e, i) { var p = b.pt(e.at); if (!p) return; var g = E('g', { 'data-key': e.label || String(i + 1) }, b.ov);
    outers.push(E('circle', { cx: p[0], cy: p[1], r: 22, fill: RED, 'fill-opacity': .12, stroke: RED, 'stroke-width': 2, 'stroke-opacity': .6, style: 'transform-box:fill-box;transform-origin:center' }, g));
    var q = E('g', { 'data-at': tm(i), 'data-fx': 'pop', 'data-ms': 420 }, g); E('circle', { cx: p[0], cy: p[1], r: 14, fill: RED, stroke: dk ? '#0B2427' : '#fff', 'stroke-width': 2.5 }, q);
    T(q, p[0], p[1] + 5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: dk ? '#3A1608' : '#fff' }) });
  var px = MW + 24, PW = 1168 - px, rh = Math.min(76, Math.floor((MH - 28) / Math.max(1, n)));
  T(svg, px, 16, s.cap || '사건 목록', { 'font-size': 14, 'font-weight': 700, fill: P.main, 'data-at': 400, 'data-fx': 'fade' });
  ev.forEach(function (e, i) { var y = 28 + i * rh, g = E('g', { 'data-at': tm(i) + 150, 'data-fx': 'rise', 'data-key': e.label || String(i + 1) }, svg), ln = h.wrap(e.note || '', 13.5, PW - 44).slice(0, rh >= 64 ? 2 : 1);
    E('line', { x1: px, x2: px + PW, y1: y, y2: y, stroke: P.line }, g); E('circle', { cx: px + 14, cy: y + 24, r: 13, fill: RED }, g); T(g, px + 14, y + 29, String(i + 1), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 800, fill: dk ? '#3A1608' : '#fff' });
    T(g, px + 38, y + 29, e.label || '', { 'font-size': fit(e.label || '', 16, PW - 38 - 56, 1), 'font-weight': 700, fill: P.ink });
    if (e.year != null) T(g, px + PW, y + 29, String(e.year), { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 800, fill: P.mute });
    ln.forEach(function (t, j) { T(g, px + 38, y + 50 + j * 19, t, { 'font-size': 13.5, fill: P.sub }) }) });
  var lg = [{ k: 'ring', c: RED, t: s.ringLabel || '사건 지점(번호 = 오른쪽 목록)' }]; if ((s.iso || []).length) lg.unshift({ c: dk ? '#2E8F6B' : '#A9D6C4', t: s.isoLabel || '칠한 나라' });
  legendRow(svg, 502, lg, P, 1800);
  ctx.root._hook = function (root) { if (h.RM() || !n) return 0; var end = 0;
    outers.forEach(function (o, i) { var a = o.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 760, delay: tm(i), easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, tm(i) + 760) }); return end };
  ctx.root.setAttribute('data-gap', 300) }

/* fan */
function fan(bd, s, ctx) {
  var dk = ctx.dark, P = ctx.P, svg = ctx.svg(512), D = (s.dest || []).slice().sort(function (a, b) { return b.value - a.value }).slice(0, 8), n = D.length, MW = 800, MH = 484, dec = s.dec || 0, un = s.unit || '';
  var b = mapBase(svg, s, [0, 0, MW, MH], dk), O = b.pt(s.from), pl = ECOM.gm.placer(MW, MH), mx = Math.max.apply(null, D.map(function (d) { return +d.value || 0 }).concat([1])), LC = dk ? '#F0C27A' : C.main, tm = function (i) { return 500 + i * 330 };
  var ot = s.fromLabel || String(s.from), ow = h.textW(ot, 15, 1) + 4, og0 = null;
  if (O) { pl.occ.push([O[0] - 14, O[1] - 14, 28, 28]); og0 = pl.put(O[0], O[1], ow, 20, 16) }
  var cur = [];
  D.forEach(function (d) { var p = b.pt(d.c); if (!p || !O) return; var dx = p[0] - O[0], dy = p[1] - O[1], k = .24, c1 = [(O[0] + p[0]) / 2 - dy * k, (O[1] + p[1]) / 2 + dx * k], c2 = [(O[0] + p[0]) / 2 + dy * k, (O[1] + p[1]) / 2 - dx * k], cc = c1[1] < c2[1] ? c1 : c2;
    cur.push([d, p, cc]); pl.occ.push([p[0] - 6, p[1] - 6, 12, 12]);
    for (var q = .15; q < .9; q += .1) { var x = (1 - q) * (1 - q) * O[0] + 2 * q * (1 - q) * cc[0] + q * q * p[0], y = (1 - q) * (1 - q) * O[1] + 2 * q * (1 - q) * cc[1] + q * q * p[1]; pl.occ.push([x - 9, y - 9, 18, 18]) } });
  D.forEach(function (d, i) { b.fill(d.c, dk ? '#2E8F6B' : '#BFDDD0', tm(i) + 450, d.label || d.c) });
  cur.forEach(function (a) { var d = a[0], p = a[1], cc = a[2], i = D.indexOf(d), w = 1.6 + 8 * (+d.value || 0) / mx, g = E('g', { 'data-key': d.label || d.c }, b.ov);
    E('path', { d: 'M' + O[0].toFixed(1) + ' ' + O[1].toFixed(1) + ' Q' + cc[0].toFixed(1) + ' ' + cc[1].toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1), fill: 'none', stroke: LC, 'stroke-width': w.toFixed(1), 'stroke-linecap': 'round', opacity: dk ? .85 : .78, 'data-at': tm(i), 'data-fx': 'draw', 'data-ms': 800 }, g);
    E('circle', { cx: p[0], cy: p[1], r: 3 + 3.5 * Math.sqrt((+d.value || 0) / mx), fill: LC, stroke: dk ? '#0B2427' : '#fff', 'stroke-width': 2, 'data-at': tm(i) + 650, 'data-fx': 'pop' }, g) });
  cur.forEach(function (a) { var d = a[0], p = a[1], i = D.indexOf(d), t = d.label || d.c, tw = h.textW(t, 13, 1) + 4, r = pl.put(p[0], p[1], tw, 18, 18), g = E('g', { 'data-key': t }, b.ov);
    tagText(g, r[0] + tw / 2, r[1] + 14, t, dk, { 'text-anchor': 'middle', 'data-at': tm(i) + 700, 'data-fx': 'fade' }) });
  if (O) { var og = E('g', { 'data-at': 200, 'data-fx': 'zoom', 'data-key': ot }, b.ov); E('circle', { cx: O[0], cy: O[1], r: 22, fill: 'none', stroke: LC, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, og); E('circle', { cx: O[0], cy: O[1], r: 10, fill: LC, stroke: dk ? '#0B2427' : '#fff', 'stroke-width': 3 }, og);
    tagText(og, og0[0] + ow / 2, og0[1] + 15, ot, dk, { 'text-anchor': 'middle', 'font-size': 15 }) }
  var px = MW + 24, PW = 1168 - px, rh = Math.min(52, Math.floor((MH - 36) / Math.max(1, n)));
  T(svg, px, 16, s.cap || '도착국 순위', { 'font-size': 14, 'font-weight': 700, fill: P.main, 'data-at': 400, 'data-fx': 'fade' });
  D.forEach(function (d, i) { var y = 28 + i * rh, g = E('g', { 'data-at': tm(i) + 300, 'data-fx': 'fade', 'data-key': d.label || d.c }, svg), bw = PW - 34;
    E('line', { x1: px, x2: px + PW, y1: y, y2: y, stroke: P.line }, g); T(g, px, y + 24, String(i + 1), { 'font-size': 12.5, fill: P.mute }); T(g, px + 24, y + 24, d.label || d.c, { 'font-size': 15, 'font-weight': 700, fill: P.ink });
    T(g, px + PW, y + 24, h.nf(d.value, dec) + un, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: P.dark });
    E('rect', { x: px + 24, y: y + 32, width: bw, height: 7, rx: 3.5, fill: dk ? Cd.g18 : C.g08 }, g);
    E('rect', { x: px + 24, y: y + 32, width: Math.max(4, bw * (+d.value || 0) / mx), height: 7, rx: 3.5, fill: LC, 'data-at': tm(i) + 350, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 500 }, g) });
  legendRow(svg, 502, [{ k: 'line', c: LC, t: s.lineLabel || '선 굵기 = 값' }, { c: dk ? '#2E8F6B' : '#BFDDD0', t: '칠한 나라 = 도착국' }], P, 1800);
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.mapspread = function (bd, s, ctx) {
  if (!ECOM.gm || !ECOM.gm.ok(s)) { bd.innerHTML = '<p style="color:#B4461E">지도 재료가 빠졌어요 — ecs.py 로 다시 빌드</p>'; return }
  var L = s.layout; (L === 'rings' ? rings : (L === 'fan' ? fan : years))(bd, s, ctx) };
ECOM.parts.mapspread.layouts = ['years', 'rings', 'fan'];
ECOM.parts.mapspread.dark = ['years', 'rings', 'fan'];
})();
