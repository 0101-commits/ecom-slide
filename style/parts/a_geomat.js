/* 지도 재료(5판 · 밝은 바탕) — 본문 칸 안 지도. 빌드가 넣은 s._geo(그 범위 나라 윤곽, Natural Earth 10m/50m/110m) + d3-geo(내장).
   ECOM.gm.geoLike(s, W, H)  → map 부품이 쓰는 ECOM.geo 꼴 {project, find, countries{ISO3:path}, land, names, anchor, zoomed}
   ECOM.gm.base(svg, s, box) → 바다 · 땅 · 국경을 box[x,y,w,h] 안에 그리고 {P(나라 · [경도,위도]) → [x,y], proj, D{ISO3:path}}
   배치 : kpi 'map'(지도 위 숫자) · hub 'map'(지도 위 경로) · discuss 'map'(지도형) — 칸마다 at(나라 이름 · ISO3 · [경도,위도])를 더 받음. at 이 없으면 기본 그림. */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var SEA = '#E6EFEB', LAND = '#FFFFFF', BORD = '#C5D1CC', COAST = '#AFC4BC';
var HALO = { 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linejoin': 'round' };
function ok(s) { return !!(window.d3 && d3.geoPath && s && s._geo && s._geo.f) }
function decG(g, dd) { var m = Math.pow(10, dd); return g.map(function (poly) { return poly.map(function (r) { var o = [], x = 0, y = 0; for (var i = 0; i + 1 < r.length; i += 2) { x += r[i]; y += r[i + 1]; o.push([x / m, y / m]) } return o }) }) }
function feats(pack) { return (pack && pack.f || []).map(function (f) { var co = decG(f.g, pack.dec).map(function (p) { return d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? p.map(function (r) { return r.slice().reverse() }) : p });
  return { type: 'Feature', id: f.id, n: f.n, a3: f.a3, geometry: { type: 'MultiPolygon', coordinates: co } } }) }
function core(f) { var best = null, ba = -1; f.geometry.coordinates.forEach(function (p) { var a = d3.geoArea({ type: 'Polygon', coordinates: p }); if (a > ba) { ba = a; best = p } }); return d3.geoCentroid({ type: 'Polygon', coordinates: best }) }
function fitProj(bb, W, H, pad) { var span = Math.max(bb[1][0] - bb[0][0], bb[1][1] - bb[0][1]), pr = span > 110 ? d3.geoNaturalEarth1() : d3.geoMercator();
  var mp = { type: 'MultiPoint', coordinates: [bb[0], [bb[1][0], bb[0][1]], bb[1], [bb[0][0], bb[1][1]], [(bb[0][0] + bb[1][0]) / 2, bb[0][1]], [(bb[0][0] + bb[1][0]) / 2, bb[1][1]]] };
  return pr.fitExtent([[pad, pad], [W - pad, H - pad]], mp).clipExtent([[0, 0], [W, H]]) }

/* map 부품용 : 같은 그리기 코드에 고운 투영을 끼움 */
function geoLike(s, W, H) { var L = feats(s._geo), bb = s._geo.bb || [[-170, -58], [180, 78]], proj = fitProj(bb, W, H, 14), path = d3.geoPath(proj), base = ECOM.geo || {};
  var cs = {}, an = {}, land = '', byN = {};
  L.forEach(function (f) { var d = path(f) || ''; land += d; if (f.a3) { cs[f.a3] = (cs[f.a3] || '') + d; if (!an[f.a3]) an[f.a3] = core(f) } byN[f.n] = f.a3 || f.id });
  var anchorXY = {}; Object.keys(an).forEach(function (k) { anchorXY[k] = proj(an[k]) });
  function find(v) { if (Array.isArray(v)) return proj(v); if (v == null) return null; var k = String(v), iso = cs[k] ? k : (byN[k] || (base.names && base.names[k]));
    return iso && anchorXY[iso] ? anchorXY[iso] : null }
  return { W: W, H: H, project: function (lon, lat) { return proj([lon, lat]) }, find: find, countries: cs, land: land, names: Object.assign({}, base.names || {}, byN), anchor: an, zoomed: true, proj: proj, path: path, feats: L } }

function base(svg, s, box, opt) { opt = opt || {}; var G = geoLike(s, box[2], box[3]), id = 'gm' + Math.random().toString(36).slice(2, 7), g = E('g', { transform: 'translate(' + box[0] + ',' + box[1] + ')' }, svg);
  var cp = E('clipPath', { id: id }, E('defs', {}, svg)); E('rect', { width: box[2], height: box[3], rx: opt.rx != null ? opt.rx : 12 }, cp);
  var m = E('g', { 'clip-path': 'url(#' + id + ')', 'data-at': 0, 'data-fx': 'fade', 'data-ms': 500 }, g);
  E('rect', { width: box[2], height: box[3], fill: SEA }, m);
  E('path', { d: G.land, fill: 'none', stroke: COAST, 'stroke-width': 2.6, 'stroke-linejoin': 'round', opacity: .55 }, m);
  E('path', { d: G.land, fill: LAND }, m);
  var hi = opt.hi || {}; Object.keys(hi).forEach(function (k) { var iso = G.countries[k] ? k : (G.names[k] || ''); if (G.countries[iso]) E('path', { d: G.countries[iso], fill: hi[k] }, m) });
  E('path', { d: G.land, fill: 'none', stroke: BORD, 'stroke-width': .8 }, m);
  return { G: G, g: g, P: function (v) { var p = G.find(v); return p ? [p[0] + box[0], p[1] + box[1]] : null } } }

/* 겹치지 않는 자리 고르기(점 둘레 8방향) */
function placer(W, H) { var occ = []; function hit(a, b) { return a[0] < b[0] + b[2] + 6 && b[0] < a[0] + a[2] + 6 && a[1] < b[1] + b[3] + 6 && b[1] < a[1] + a[3] + 6 }
  return { occ: occ, put: function (x, y, w, hh, gap) { gap = gap || 26; var C8 = [[1, -1], [1, 1], [-1, -1], [-1, 1], [1, 0], [-1, 0], [0, -1], [0, 1]], best = null;
    for (var k = 1; k <= 4 && !best; k++) for (var i = 0; i < C8.length; i++) { var d = C8[i], cx = x + d[0] * (gap * k + w / 2), cy = y + d[1] * (gap * k * .8 + hh / 2), r = [cx - w / 2, cy - hh / 2, w, hh];
      if (r[0] < 4 || r[1] < 4 || r[0] + w > W - 4 || r[1] + hh > H - 4) continue; if (!occ.some(function (z) { return hit(r, z) })) { best = r; break } }
    best = best || [Math.max(4, Math.min(W - w - 4, x + 20)), Math.max(4, Math.min(H - hh - 4, y - hh / 2)), w, hh]; occ.push(best); return best } } }

function leader(svg, x, y, r, at) { var cx = Math.max(r[0], Math.min(r[0] + r[2], x)), cy = Math.max(r[1], Math.min(r[1] + r[3], y));
  E('line', { x1: x, y1: y, x2: cx, y2: cy, stroke: C.cmp, 'stroke-width': 1.2, 'data-at': at, 'data-fx': 'draw', 'data-ms': 260, 'data-leader': 1 }, svg) }

/* kpi map — 지도 위 숫자 : 카드마다 at → 그 자리 점 + 숫자 상자(큰 카드 hero 는 더 크게) */
function kpiMap(bd, s, ctx) { var cards = (s.cards || []).filter(function (c) { return c.at != null }), svg = ctx.svg(512), b = base(svg, s, [0, 0, 1168, 512]), pl = placer(1168, 512);
  var pts = cards.map(function (c) { return b.P(c.at) }); pts.forEach(function (p) { if (p) pl.occ.push([p[0] - 8, p[1] - 8, 16, 16]) });
  cards.forEach(function (c, i) { var p = pts[i]; if (!p) return; var big = !!c.hero, vs = h.nf(c.value, c.dec || 0), fs = big ? 40 : 28, w = Math.max(h.textW(c.label || '', 15, 1), h.textW(vs, fs, 1) + h.textW(c.unit || '', 14) + 8, c.sub ? h.textW(c.sub, 12.5) : 0, c.chip ? h.textW(c.chip.text || '', 12.5, 1) + 20 : 0) + 32,
    hh = 34 + fs + (c.sub ? 18 : 0) + (c.chip ? 26 : 0) + 8, r = pl.put(p[0], p[1], w, hh, big ? 40 : 30), t = 600 + i * 220, g = E('g', { 'data-at': t, 'data-fx': 'zoom', 'data-key': c.label || '' }, svg);
    var kg = E('g', { 'data-key': c.label || '' }, svg); E('circle', { cx: p[0], cy: p[1], r: big ? 9 : 7, fill: big ? C.main : C.dark, stroke: '#fff', 'stroke-width': 2.5, 'data-at': t - 200, 'data-fx': 'pop' }, kg); leader(kg, p[0], p[1], r, t - 100);
    E('rect', { x: r[0], y: r[1], width: w, height: hh, rx: 10, fill: big ? C.main : '#fff', stroke: big ? 'none' : C.line }, g);
    var ink = big ? '#fff' : C.ink, sub = big ? 'rgba(255,255,255,.82)' : C.mute;
    T(g, r[0] + 16, r[1] + 26, c.label || '', { 'font-size': 15, 'font-weight': 700, fill: ink });
    var tv = T(g, r[0] + 16, r[1] + 30 + fs, vs, { 'font-size': fs, 'font-weight': 800, fill: big ? '#fff' : C.dark, 'data-count': c.value, 'data-dec': c.dec || 0, 'data-at': t + 100, 'data-fx': 'count' });
    if (c.unit) T(g, r[0] + 22 + h.textW(vs, fs, 1), r[1] + 30 + fs, c.unit, { 'font-size': 14, fill: sub });
    var y = r[1] + 30 + fs; if (c.sub) { y += 18; T(g, r[0] + 16, y, c.sub, { 'font-size': 12.5, fill: sub }) }
    if (c.chip) { y += 8; var cw = h.textW(c.chip.text || '', 12.5, 1) + 16, up = c.chip.dir === 'up'; E('rect', { x: r[0] + 16, y: y, width: cw, height: 20, rx: 10, fill: big ? 'rgba(255,255,255,.18)' : (up ? C.warnsoft : C.g08) }, g);
      T(g, r[0] + 24, y + 14.5, c.chip.text || '', { 'font-size': 12.5, 'font-weight': 700, fill: big ? '#fff' : (up ? C.warn : C.dark) }) } });
  ctx.root.setAttribute('data-gap', 300) }

/* hub map — 지도 위 경로 : 가운데(center.at)에서 마디(nodes[].at)로 휜 화살, 마디 상자 = 제목 · 값 · 설명 한 줄 */
function hubMap(bd, s, ctx) { var c = s.center || {}, nodes = (s.nodes || []).filter(function (n) { return n.at != null }), svg = ctx.svg(512), b = base(svg, s, [0, 0, 1168, 512], { hi: c.at && !Array.isArray(c.at) ? (function () { var o = {}; o[c.at] = C.g18; return o })() : {} }), pl = placer(1168, 512);
  var p0 = b.P(c.at), ps = nodes.map(function (n) { return b.P(n.at) }); if (!p0) return;
  pl.occ.push([p0[0] - 30, p0[1] - 30, 60, 60]); ps.forEach(function (p) { if (p) pl.occ.push([p[0] - 8, p[1] - 8, 16, 16]) });
  nodes.forEach(function (n, i) { var p = ps[i]; if (!p) return; var dx = p[0] - p0[0], dy = p[1] - p0[1], L = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(.28, 60 / L + .12), mx = (p0[0] + p[0]) / 2 - dy * k, my = (p0[1] + p[1]) / 2 + dx * k;
    var e0 = [p[0] - dx / L * 10, p[1] - dy / L * 10], d = 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + e0[0].toFixed(1) + ' ' + e0[1].toFixed(1), t = 500 + i * 260;
    E('path', { d: d, fill: 'none', stroke: C.main, 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: .85, 'data-at': t, 'data-fx': 'draw', 'data-ms': 600 }, svg);
    var ang = Math.atan2(e0[1] - my, e0[0] - mx), a1 = ang + 2.6, a2 = ang - 2.6, sz = 13; E('path', { d: 'M' + e0[0] + ' ' + e0[1] + ' L' + (e0[0] + sz * Math.cos(a1)) + ' ' + (e0[1] + sz * Math.sin(a1)) + ' L' + (e0[0] + sz * Math.cos(a2)) + ' ' + (e0[1] + sz * Math.sin(a2)) + ' Z', fill: C.main, 'data-at': t + 560, 'data-fx': 'fade' }, svg);
    E('circle', { cx: p[0], cy: p[1], r: 6, fill: C.dark, stroke: '#fff', 'stroke-width': 2, 'data-at': t + 500, 'data-fx': 'pop' }, svg);
    var vs = n.value != null ? h.nf(n.value, n.dec || 0) + (n.unit ? ' ' + n.unit : '') : '', w = Math.max(h.textW(n.title || '', 14.5, 1), h.textW(vs, 22, 1), n.s1 ? h.textW(n.s1, 12.5) : 0) + 28, hh = 30 + (vs ? 28 : 0) + (n.s1 ? 18 : 0) + 6, r = pl.put(p[0], p[1], Math.min(w, 300), hh, 24);
    var g = E('g', { 'data-at': t + 620, 'data-fx': 'slide', 'data-dy': 6, 'data-key': n.title || '' }, svg); leader(svg, p[0], p[1], r, t + 600);
    E('rect', { x: r[0], y: r[1], width: r[2], height: hh, rx: 10, fill: '#fff', stroke: C.line }, g); T(g, r[0] + 14, r[1] + 22, n.title || '', { 'font-size': 14.5, 'font-weight': 700, fill: C.ink });
    if (vs) T(g, r[0] + 14, r[1] + 50, vs, { 'font-size': 22, 'font-weight': 800, fill: C.dark }); if (n.s1) T(g, r[0] + 14, r[1] + hh - 12, n.s1, { 'font-size': 12.5, fill: C.mute }) });
  var cg = E('g', { 'data-at': 200, 'data-fx': 'zoom', 'data-key': c.label || '' }, svg), cv = c.value != null ? h.nf(c.value, c.dec || 0) + (c.unit || '') : '', cw = Math.max(h.textW(c.label || '', 15, 1), h.textW(cv, 26, 1)) + 32, cr = pl.put(p0[0], p0[1], cw, cv ? 70 : 40, 34);
  E('circle', { cx: p0[0], cy: p0[1], r: 14, fill: C.main, stroke: '#fff', 'stroke-width': 3 }, cg); E('circle', { cx: p0[0], cy: p0[1], r: 24, fill: 'none', stroke: C.main, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, cg);
  leader(svg, p0[0], p0[1], cr, 250); E('rect', { x: cr[0], y: cr[1], width: cw, height: cr[3], rx: 10, fill: C.main }, cg);
  T(cg, cr[0] + 16, cr[1] + 24, c.label || '', { 'font-size': 15, 'font-weight': 700, fill: '#fff' }); if (cv) T(cg, cr[0] + 16, cr[1] + 56, cv, { 'font-size': 26, 'font-weight': 800, fill: '#fff' });
  ctx.root.setAttribute('data-gap', 300) }

/* discuss map — 지도형 : 왼쪽 지도에 토의 주제 번호 핀(topics[].at), 오른쪽 주제 카드, 아래 논의사항 띠 */
function discussMap(bd, s, ctx) { var R = s.right || {}, Lf = s.left || {}, tp = R.topics || [], it = Lf.items || [], svg = ctx.svg(512), MW = 700, b = base(svg, s, [0, 0, MW, it.length ? 420 : 512]);
  var lab = placer(MW, it.length ? 420 : 512), pins = tp.map(function (t) { return t.at != null ? b.P(t.at) : null }); pins.forEach(function (p) { if (p) lab.occ.push([p[0] - 14, p[1] - 38, 28, 40]) });
  tp.forEach(function (t, i) { var p = pins[i], tm = 500 + i * 300; if (p) { var g = E('g', { 'data-at': tm, 'data-fx': 'drop', 'data-key': t.title || '' }, svg);
      E('path', { d: 'M' + p[0] + ' ' + p[1] + ' l-11 -18 a14 14 0 1 1 22 0 z', fill: C.main, stroke: '#fff', 'stroke-width': 2 }, g); T(g, p[0], p[1] - 22, String(i + 1), { 'font-size': 14, 'font-weight': 800, fill: '#fff', 'text-anchor': 'middle' });
      if (t.place) { var lw = h.textW(t.place, 13, 1) + 4, r = lab.put(p[0], p[1] - 16, lw, 18, 14); T(g, r[0] + lw / 2, r[1] + 14, t.place, Object.assign({ 'font-size': 13, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, HALO)) } } });
  var x = MW + 24, cw = 1168 - x, y = 0, ch = Math.min(150, ((it.length ? 420 : 512) - (tp.length - 1) * 12 - 34) / Math.max(1, tp.length));
  T(svg, x, 16, R.title || '토의 주제', { 'font-size': 15, 'font-weight': 700, fill: C.dark }); y = 30;
  tp.forEach(function (t, i) { var g = E('g', { 'data-at': 600 + i * 300, 'data-fx': 'slide', 'data-dx': 16, 'data-key': t.title || '' }, svg), qs = h.wrap(t.q || '', 14, cw - 70);
    E('rect', { x: x, y: y, width: cw, height: ch, rx: 12, fill: '#fff', stroke: C.line }, g); E('circle', { cx: x + 26, cy: y + 28, r: 15, fill: C.main }, g); T(g, x + 26, y + 33, String(i + 1), { 'font-size': 15, 'font-weight': 800, fill: '#fff', 'text-anchor': 'middle' });
    T(g, x + 52, y + 33, t.title || '', { 'font-size': 16, 'font-weight': 700, fill: C.ink }); qs.slice(0, Math.floor((ch - 56) / 21)).forEach(function (ln, k) { T(g, x + 52, y + 60 + k * 21, ln, { 'font-size': 14, fill: C.cmp }) }); y += ch + 12 });
  if (it.length) { var bw = (1168 - (it.length - 1) * 10) / it.length; T(svg, 0, 446, Lf.title || '주요 논의사항', { 'font-size': 14, 'font-weight': 700, fill: C.dark, 'data-at': 1500, 'data-fx': 'fade' });
    it.forEach(function (q, i) { var g = E('g', { 'data-at': 1600 + i * 120, 'data-fx': 'rise' }, svg), x0 = i * (bw + 10); E('rect', { x: x0, y: 456, width: bw, height: 56, rx: 8, fill: C.g08 }, g);
      T(g, x0 + 12, 478, q.title || '', { 'font-size': 13.5, 'font-weight': 700, fill: C.dark }); var ln = h.wrap(q.text || '', 12.5, bw - 24)[0] || ''; T(g, x0 + 12, 499, ln + ((h.wrap(q.text || '', 12.5, bw - 24).length > 1) ? '…' : ''), { 'font-size': 12.5, fill: C.cmp }) }) }
  ctx.root.setAttribute('data-gap', 300) }

ECOM.gm = { ok: ok, feats: feats, core: core, geoLike: geoLike, base: base, placer: placer,
  kpi: function (bd, s, ctx) { return kpiMap(bd, s, ctx) }, hub: function (bd, s, ctx) { return hubMap(bd, s, ctx) }, discuss: function (bd, s, ctx) { return discussMap(bd, s, ctx) } };
})();
