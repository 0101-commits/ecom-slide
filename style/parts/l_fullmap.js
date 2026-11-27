/* fullmap — 전면 지도 장(5판 · 다큐형 4형식). 장 전체 1280×720 이 지도, 꼬리표 · 헤드메시지 · 각주는 위 · 아래 어둠 띠 위 흰 글(장 바탕 bg map 저절로).
   지도 자료 = 빌드(ecs.py · geo_pack.py)가 그 범위 나라 윤곽만 넣음(s._geo · 덱 _w110). Natural Earth 공개 자료 · d3-geo(내장).
   form  'zoom' A 지역 확대(해협 · 도시) · 'globe' B 지구본 회전(먼 길) · 'flow' C 세계 흐름(여러 나라 → 한 곳) · 'choro' D 나라 칠하기(나라별 값)
   region  'gulf' 'hormuz' 'redsea' 'suez' 'malacca' 'taiwan' 'korea' 'eastasia' 'blacksea' 'panama' 'northamerica' 'europe' 'mideast' 'asia' 'africa' 'southamerica'
           | [[서경,남위],[동경,북위]] | ['미국','캐나다','멕시코'](그 나라들을 감싸는 범위)
   paint[{c:'이란', tone:'red|green|gold|teal|korea|white|gray', label:'봉쇄 선포국', tip}]  칠할 나라 — label 이 범례
   tags[{c | at:[경도,위도], text, size:'l|m|s', dx, dy, light}]  흰 이름표(없으면 paint 나라 이름 저절로)
   labelOff{나라:[dx,dy]}(choro 값 이름표를 옮기고 지시선) · areas[{id:'SA-04', tone:'red|green|gold|teal|…' | color:'#hex' | 'main', label:'동부주(범례)', text:'이름표(선택)', tip, dx, dy}]  1단계 행정구역 칠하기(지금은 SA-04 사우디 동부주 — geo/admin1-SA-04.json, Natural Earth) · zoom · choro 에서 paint 위에 칠해짐
   routes[{path:[[경도,위도]…], style:'lane|pipe|ship', label}]  lane = 흐르는 점선(항로) · pipe = 밝은 굵은 선(송유관) · ship = 금빛 점선(먼 뱃길)
   rings[{at, text, r, dx, dy}]  점선 고리 + 이름표(해협 · 길목) · points[{at|c, label, value}]  점 크기 = 값
   card{title, value, unit, sub, bar:[몫, 전체], at:[x,y]}  숫자 칸 — 빈 바다 쪽
   globe{from:[경도,위도], to:[경도,위도]}  B : from 에서 to 쪽으로 2.8초 돎(paint · routes · tags 같이)
   flows[{from, to, value, group}] · groups{이름:{tone, label}} · center(가운데 경도) · unit  C : 굵기 · 출발 점 = 값
   values{나라:값} · scale{min, max, title, unit, dec} · key('한국')  D : 낮은 값부터 차례로 칠함 · 범례 막대 + 자료 없음
   legend:false 면 범례 없음. 움직임 = 카메라 다가감 → 칠 → 이름표 → 길 · 숫자 칸(움직임 줄이기 · ?still 이면 끝 모습). */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T;
var LAND = '#E3ECE7', BORDER = '#FFFFFF', COAST = '#CDE3DA', INK = '#0E1513', SUB = '#6B7570';   /* 6판 밝은 지도 */
var TONE = { red: ['#8A2F3C', '#D0614F'], green: ['#1F9467', '#7FE0B5'], gold: ['#C98F35', '#F0C27A'], teal: ['#2F7F86', '#8FD3D0'],
  korea: ['#3FBF8A', '#B7F2D7'], white: ['#C9D1CD', '#9AA3A0'], gray: ['#3B5C5E', '#7FA3A3'], blue: ['#7D8FD1', '#B9C4F0'] };
function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }) }
/* 색 줄 : stops = ['#..', …] 고르게 놓고 0~1 사이 섞음(d3-scale 없이) */
function ramp(stops) { var S = stops.map(hex); return function (t) { t = Math.max(0, Math.min(1, t)); var k = Math.min(S.length - 2, Math.floor(t * (S.length - 1))), u = t * (S.length - 1) - k;
  return '#' + [0, 1, 2].map(function (j) { var v = Math.round(S[k][j] + (S[k + 1][j] - S[k][j]) * u); return (v < 16 ? '0' : '') + v.toString(16) }).join('') } }
var RS = { lane: ['#3E4743', 3, '2 9'], pipe: ['#005136', 5, ''], ship: ['#C98F35', 3, '2 8'] };
var AREAS = { 'SA-04': { n: '동부주', polys: [[[50.81,24.75],[50.98,24.57],[51.27,24.62],[51.31,24.61],[51.3,24.52],[51.4,24.63],[51.5,24.58],[51.34,24.45],[51.28,24.31],[51.41,24.32],[51.57,24.26],[51.59,24.08],[52.56,22.94],[55.11,22.62],[55.19,22.7],[55.64,21.98],[54.98,20],[51.98,19],[49.04,18.58],[48.16,18.15],[47.59,17.46],[47.43,17.09],[48.3,23.65],[48.29,24],[48.14,24.27],[47.5,24.79],[47.47,26.17],[47.43,26.26],[47.06,26.41],[46.83,26.62],[46.59,26.61],[46.23,26.82],[45.91,26.86],[45.69,27.05],[45.53,27.09],[45.25,27.23],[45.15,27.42],[44.98,27.55],[44.94,27.64],[45.7,28.76],[45.94,28.91],[46.53,29.1],[47.43,28.99],[47.58,28.63],[47.67,28.53],[48.43,28.54],[48.5,28.49],[48.47,28.39],[48.54,28.41],[48.52,28.32],[48.62,28.22],[48.6,28.15],[48.65,28.05],[48.79,28.01],[48.74,27.96],[48.88,27.83],[48.85,27.74],[48.85,27.82],[48.81,27.76],[48.81,27.83],[48.78,27.71],[48.81,27.74],[48.82,27.69],[48.88,27.69],[48.87,27.61],[48.83,27.61],[48.9,27.63],[48.9,27.57],[48.97,27.62],[49.06,27.54],[49.19,27.56],[49.3,27.49],[49.31,27.45],[49.12,27.44],[49.26,27.41],[49.22,27.33],[49.31,27.34],[49.32,27.21],[49.41,27.2],[49.37,27.15],[49.52,27.13],[49.49,27.17],[49.57,27.19],[49.57,27.1],[49.7,26.96],[49.97,26.84],[50.16,26.66],[50.02,26.7],[50.01,26.75],[49.98,26.71],[50.03,26.49],[50.19,26.4],[50.22,26.32],[50.14,26.04],[50.03,26.2],[49.98,26.14],[49.99,26],[50.02,26.04],[50.1,25.99],[50.12,25.87],[50.26,25.63],[50.16,25.73],[50.15,25.7],[50.35,25.48],[50.37,25.46],[50.38,25.51],[50.47,25.44],[50.56,25.05],[50.73,24.88],[50.76,24.74],[50.81,24.75]]] } };   /* Natural Earth 1:10m admin-1 (공공 자료), 0.03° 단순화 */
var uid = 0;

function decG(g, dd) { var m = Math.pow(10, dd); return g.map(function (poly) { return poly.map(function (r) { var o = [], x = 0, y = 0; for (var i = 0; i + 1 < r.length; i += 2) { x += r[i]; y += r[i + 1]; o.push([x / m, y / m]) } return o }) }) }
function feats(pack) { if (!pack || !pack.f) return [];
  return pack.f.map(function (f) { var co = decG(f.g, pack.dec).map(function (p) { return d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? p.map(function (r) { return r.slice().reverse() }) : p });
    return { type: 'Feature', id: f.id, n: f.n, a3: f.a3, geometry: { type: 'MultiPolygon', coordinates: co } } }) }
function byName(L, q) { if (q == null) return null; q = String(q); for (var i = 0; i < L.length; i++) { var f = L[i]; if (f.n === q || f.a3 === q || f.id === q) return f } return null }
function core(f) { var best = null, ba = -1; f.geometry.coordinates.forEach(function (p) { var a = d3.geoArea({ type: 'Polygon', coordinates: p }); if (a > ba) { ba = a; best = p } }); return d3.geoCentroid({ type: 'Polygon', coordinates: best }) }
function bbPts(bb) { return { type: 'MultiPoint', coordinates: [bb[0], [bb[1][0], bb[0][1]], bb[1], [bb[0][0], bb[1][1]], [(bb[0][0] + bb[1][0]) / 2, bb[0][1]], [(bb[0][0] + bb[1][0]) / 2, bb[1][1]]] } }
function clamp(p, box) { return [Math.max(box[0], Math.min(box[2], p[0])), Math.max(box[1], Math.min(box[3], p[1]))] }

function defs(s, id) { var d = E('defs', {}, s);
  var rg = E('radialGradient', { id: id + 'sea', cx: '55%', cy: '48%', r: '78%' }, d); E('stop', { offset: 0, 'stop-color': '#FFFFFF' }, rg); E('stop', { offset: 1, 'stop-color': '#FFFFFF' }, rg);
  var fl = E('filter', { id: id + 'tex', x: 0, y: 0, width: '100%', height: '100%' }, d); E('feTurbulence', { type: 'fractalNoise', baseFrequency: '.012 .02', numOctaves: 3, seed: 7 }, fl);
  E('feColorMatrix', { type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .08 0' }, fl);
  var bg = E('radialGradient', { id: id + 'sp', cx: '62%', cy: '58%', r: '75%' }, d); E('stop', { offset: 0, 'stop-color': '#FFFFFF' }, bg); E('stop', { offset: 1, 'stop-color': '#EEF3F0' }, bg);
  var at = E('radialGradient', { id: id + 'atm', cx: '50%', cy: '50%', r: '50%' }, d); E('stop', { offset: '86%', 'stop-color': '#8FE3C0', 'stop-opacity': 0 }, at); E('stop', { offset: '93%', 'stop-color': '#8FE3C0', 'stop-opacity': .22 }, at); E('stop', { offset: '100%', 'stop-color': '#8FE3C0', 'stop-opacity': 0 }, at);
  return d }

/* 이름표 — 글자 + 흰 테두리(네모 없음) · 겹치면 위아래로 비켜 섬 */
function Tagger(p) { var boxes = []; return function (x, y, t, o) { o = o || {}; var fs = o.fs || 16, w = h.textW(t, fs, 1) + 20, hh = fs + 14, tries = [0, 1, -1, 2, -2, 3, -3], k, bx;
  for (k = 0; k < tries.length; k++) { var yy = y + tries[k] * (hh + 4); bx = [x - w / 2, yy - hh / 2, w, hh];
    if (!boxes.some(function (b) { return bx[0] < b[0] + b[2] + 4 && b[0] < bx[0] + bx[2] + 4 && bx[1] < b[1] + b[3] + 2 && b[1] < bx[1] + bx[3] + 2 })) break }
  boxes.push(bx); var g = E('g', Object.assign({ class: 'fm-tag' }, o.attr || {}), p);
  T(g, bx[0] + w / 2, bx[1] + hh / 2 + fs * .36, t, { 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: INK, stroke: '#fff', 'stroke-width': Math.max(3.5, fs * .24), 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'letter-spacing': '-.02em' });
  g._box = bx; return g } }

function legend(s, items, at, x0) { if (!items.length) return; var g = E('g', { class: 'fm-leg', 'data-at': at, 'data-fx': 'fade' }, s), x = x0 || 56, y = 640;
  items.forEach(function (it) { var w;
    if (it.k === 'dash' || it.k === 'line') { E('line', { x1: x, x2: x + 44, y1: y - 5, y2: y - 5, stroke: it.c, 'stroke-width': it.k === 'line' ? 5.5 : 3.4, 'stroke-dasharray': it.k === 'line' ? null : '2 6', 'stroke-linecap': 'round' }, g); w = 52 }
    else if (it.k === 'dot') { E('circle', { cx: x + 7, cy: y - 5, r: 6, fill: it.c, stroke: '#FFFFFF' }, g); w = 20 }
    else if (it.k === 'ring') { E('circle', { cx: x + 8, cy: y - 5, r: 7, fill: 'none', stroke: '#1D2521', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, g); w = 22 }
    else { E('rect', { x: x, y: y - 13, width: 16, height: 16, rx: 2, fill: it.c, stroke: it.s || 'none' }, g); w = 24 }
    T(g, x + w, y, it.t, { 'font-size': 14.5, 'font-weight': 600, fill: '#1D2521', stroke: '#fff', 'stroke-width': 3.5, 'paint-order': 'stroke' }); x += w + h.textW(it.t, 14.5) + 26 }) }

function card(s, o, dflt) { if (!o) return null; var at = o.at || dflt, x = at[0], y = at[1], W = o.w || 250, H = o.bar ? 150 : 130;
  var g = E('g', { class: 'fm-card', 'data-at': 2700, 'data-fx': 'slide', 'data-dx': 16 }, s);
  E('rect', { x: x, y: y, width: W, height: H, rx: 10, fill: '#005136', stroke: 'none', style: 'filter:drop-shadow(0 4px 10px rgba(0,40,28,.18))' }, g);
  if (o.title) T(g, x + 18, y + 30, o.title, { 'font-size': 13, fill: '#B7CCC6' });
  var v = o.value, big = typeof v === 'object' && v ? h.nf(v.v, v.dec || 0) : String(v == null ? '' : v);
  var tv = T(g, x + 18, y + 80, big, { 'font-size': 40, 'font-weight': 800, fill: '#fff' });
  if (v && typeof v === 'object') { tv.setAttribute('data-count', v.v); tv.setAttribute('data-dec', v.dec || 0); tv.setAttribute('data-at', 2700); tv.setAttribute('data-fx', 'count') }
  if (o.unit) T(g, x + 26 + h.textW(big, 40, 1), y + 80, o.unit, { 'font-size': 15, fill: '#D5E3DE' });
  if (o.sub) T(g, x + 18, y + 108, o.sub, { 'font-size': 12.5, fill: '#B7CCC6' });
  if (o.bar) { var bw = W - 36, f = Math.max(0, Math.min(1, o.bar[0] / o.bar[1])); E('rect', { x: x + 18, y: y + H - 26, width: bw, height: 10, rx: 5, fill: 'rgba(255,255,255,.18)' }, g); E('rect', { x: x + 18, y: y + H - 26, width: Math.max(4, bw * f), height: 10, rx: 5, fill: '#8FE3C0' }, g) }
  return g }

function routeEl(s, d, st, at) { var r = RS[st] || RS.lane, g = E('g', { 'data-at': at, 'data-fx': st === 'pipe' ? 'fade' : 'fade' }, s);
  if (st === 'pipe') { E('path', { d: d, fill: 'none', stroke: r[0], 'stroke-width': 11, opacity: .22, 'stroke-linecap': 'round' }, g);
    E('path', { d: d, fill: 'none', stroke: r[0], 'stroke-width': r[1], 'stroke-linecap': 'round', 'data-at': at, 'data-fx': 'draw', 'data-ms': 900 }, g) }
  else E('path', { d: d, fill: 'none', stroke: r[0], 'stroke-width': r[1], 'stroke-dasharray': r[2], 'stroke-linecap': 'round', class: 'fm-run' }, g);
  return g }

/* 땅 그리기 : 해안 빛(넓고 옅은 선) → 땅 → 결 → 국경 */
function lands(cam, L, path, id) { var glow = E('g', { opacity: .5 }, cam), land = E('g', {}, cam), D = {};
  L.forEach(function (f) { var d = path(f); if (!d) return; D[f.id] = d; E('path', { d: d, fill: 'none', stroke: COAST, 'stroke-width': 3, 'stroke-linejoin': 'round' }, glow); E('path', { d: d, fill: LAND }, land) });
  E('rect', { width: 1280, height: 720, filter: 'url(#' + id + 'tex)', style: 'mix-blend-mode:soft-light;pointer-events:none' }, cam);
  var bord = E('g', {}, cam); L.forEach(function (f) { if (D[f.id]) E('path', { d: D[f.id], fill: 'none', stroke: BORDER, 'stroke-width': .8 }, bord) });
  return D }

function zoomLike(s, S, ctx, choro) {
  var id = 'fm' + (++uid), det = feats(S._geo), w110 = feats(ctx.deck._w110), have = {};
  det.forEach(function (f) { have[f.id] = 1 });
  var ctxL = w110.filter(function (f) { return !have[f.id] }), L = ctxL.concat(det), bb = (S._geo && S._geo.bb) || [[-170, -58], [180, 78]];
  var proj = d3.geoMercator().fitExtent([[40, choro ? 170 : 150], [1240, choro ? 610 : 640]], bbPts(bb)).clipExtent([[-400, -300], [1680, 1020]]), path = d3.geoPath(proj);
  defs(s, id); var cam = E('g', { class: 'fm-cam' }, s); E('rect', { x: -400, y: -300, width: 2080, height: 1320, fill: 'url(#' + id + 'sea)' }, cam);
  var D = lands(cam, L, path, id), leg = [], tagger = Tagger(s), VIS = [70, 190, 1210, 600], i = 0;
  function P(q) { if (Array.isArray(q)) return proj(q); var f = byName(L, q); return f ? proj(core(f)) : null }
  if (choro) {
    var V = S.values || {}, ks = Object.keys(V), vs = ks.map(function (k) { return +V[k] }), sc = S.scale || {}, lo = sc.min != null ? sc.min : Math.min.apply(null, vs), hi = sc.max != null ? sc.max : Math.max.apply(null, vs);
    var rp = ramp(['#1E4E55', '#4FA88F', '#F2C46B']), col = function (v) { return rp(hi > lo ? (v - lo) / (hi - lo) : 1) };
    ks.map(function (k) { return [k, +V[k]] }).sort(function (a, b) { return a[1] - b[1] }).forEach(function (kv, j) { var f = byName(L, kv[0]); if (!f || !D[f.id]) return;
      E('path', { d: D[f.id], fill: col(kv[1]), stroke: '#0B2A2E', 'stroke-width': .7, 'data-key': kv[0], 'data-tip': kv[0] + '|' + (sc.title || '') + ' ' + h.nf(kv[1], sc.dec || 0) + (sc.unit || ''), 'data-at': 900 + j * 110, 'data-fx': 'fade', 'data-ms': 420 }, cam) });
    var tagsC = ks.slice().sort(function (a, b) { return (S.key === b) - (S.key === a) || V[b] - V[a] }).slice(0, S.maxTags || 16);
    tagsC.forEach(function (k, j) { var p = P(k); if (!p) return; p = clamp(p, VIS); var big = S.key === k, off = (S.labelOff || {})[k];
      if (off) { var p0 = p; p = [p[0] + off[0], p[1] + off[1]]; E('line', { x1: p0[0], y1: p0[1], x2: p[0], y2: p[1], stroke: '#3E4743', 'stroke-width': 1.2, 'data-ok': 1, 'data-at': 2200 + j * 100, 'data-fx': 'fade' }, s); E('circle', { cx: p0[0], cy: p0[1], r: 3, fill: '#3E4743', 'data-at': 2200 + j * 100, 'data-fx': 'fade' }, s) }   /* 7판 : labelOff{나라:[dx,dy]} 이름표를 떼어 지시선으로 잇기 */
      tagger(p[0], p[1], k + ' ' + h.nf(V[k], V[k] % 1 ? Math.max(1, sc.dec || 0) : (sc.dec || 0)) + (sc.unit || ''), { fs: big ? 16 : 13, bg: big ? '#fff' : '#F4F6F5', attr: { 'data-at': 2200 + j * 100, 'data-fx': 'slide', 'data-dy': 6, 'data-key': k } }) });
    var lg = E('g', { class: 'fm-leg', 'data-at': 2000, 'data-fx': 'fade' }, s), gid = id + 'sc', gd = E('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, s.querySelector('defs'));
    [0, .5, 1].forEach(function (o) { E('stop', { offset: o, 'stop-color': col(lo + (hi - lo) * o) }, gd) });
    T(lg, 56, 618, sc.title || '', { 'font-size': 13, fill: '#3E4743' }); E('rect', { x: 56, y: 628, width: 260, height: 12, rx: 6, fill: 'url(#' + gid + ')' }, lg);
    [0, .5, 1].forEach(function (o) { T(lg, 56 + o * 260, 658, h.nf(lo + (hi - lo) * o, sc.dec || 0) + (sc.unit || ''), { 'text-anchor': o === 0 ? 'start' : (o === 1 ? 'end' : 'middle'), 'font-size': 12.5, fill: '#6B7570' }) });
    E('rect', { x: 340, y: 628, width: 14, height: 12, rx: 2, fill: LAND, stroke: '#C9D1CD' }, lg); T(lg, 360, 639, '자료 없음', { 'font-size': 12.5, fill: '#6B7570' });
  }
  (S.paint || []).forEach(function (pt, j) { var f = byName(L, pt.c); if (!f || !D[f.id]) return; var t = TONE[pt.tone] || TONE.red;
    E('path', { d: D[f.id], fill: t[0], stroke: t[1], 'stroke-width': 1.4, 'data-key': pt.c, 'data-tip': pt.tip || (pt.c + '|' + (pt.label || '')), 'data-at': 1500 + j * 250, 'data-fx': 'fade', 'data-ms': 600 }, cam);
    if (pt.label && !leg.some(function (x) { return x.t === pt.label })) leg.push({ k: 'box', c: t[0], t: pt.label }) });
  (S.areas || []).forEach(function (ar, j) { var A = AREAS[ar.id]; if (!A) return;
    var co = A.polys.map(function (r) { var p = [r.concat([r[0]])]; return d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? [p[0].slice().reverse()] : p }), ft = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: co } }, d = path(ft); if (!d) return;
    var tn = TONE[ar.tone], fc = tn ? tn[0] : (ar.color && ar.color.charAt(0) === '#' ? ar.color : '#005136'), sc = tn ? tn[1] : '#fff';
    E('path', { d: d, fill: fc, 'fill-opacity': .92, stroke: sc, 'stroke-width': 1.8, 'stroke-linejoin': 'round', 'data-key': ar.id, 'data-tip': ar.tip || ((ar.text || ar.label || A.n) + '|' + (ar.label || '')), 'data-at': 1700 + j * 250, 'data-fx': 'fade', 'data-ms': 600 }, cam);
    if (ar.label && !leg.some(function (x) { return x.t === ar.label })) leg.push({ k: 'box', c: fc, t: ar.label });
    if (ar.text) { var cp = proj(d3.geoCentroid(ft)); if (cp) { cp = clamp([cp[0] + (ar.dx || 0), cp[1] + (ar.dy || 0)], VIS); tagger(cp[0], cp[1], ar.text, { fs: 16, attr: { 'data-at': 2000 + j * 140, 'data-fx': 'slide', 'data-dy': 6 } }) } } });
  (S.routes || []).forEach(function (r, j) { var d = path({ type: 'LineString', coordinates: r.path }); if (!d) return; routeEl(cam, d, r.style || 'lane', 1900 + j * 200);
    if (r.style === 'pipe') r.path.filter(function (_, k) { return k === 0 || k === r.path.length - 1 }).forEach(function (q) { var p = proj(q); E('circle', { cx: p[0], cy: p[1], r: 6, fill: RS.pipe[0], stroke: '#05302A', 'stroke-width': 2, 'data-at': 2900, 'data-fx': 'zoom' }, cam) });
    if (r.label) leg.push({ k: r.style === 'pipe' ? 'line' : 'dash', c: (RS[r.style] || RS.lane)[0], t: r.label }) });
  (S.points || []).forEach(function (pt, j) { var p = P(pt.at || pt.c); if (!p) return; var mx = Math.max.apply(null, (S.points || []).map(function (q) { return +q.value || 1 })), r = 4 + 12 * Math.sqrt((+pt.value || 1) / mx);
    E('circle', { cx: p[0], cy: p[1], r: r, fill: '#F0C27A', 'fill-opacity': .85, stroke: '#06181A', 'data-at': 1700 + j * 120, 'data-fx': 'zoom', 'data-key': pt.label || '' }, cam);
    if (pt.label) tagger(p[0], p[1] + r + 16, pt.label + (pt.value != null ? ' ' + h.nf(pt.value, S.dec || 0) : ''), { fs: 13, attr: { 'data-at': 2000 + j * 120, 'data-fx': 'fade' } }) });
  if (S.points && S.points.length && S.pointsLabel) leg.push({ k: 'dot', c: '#F0C27A', t: S.pointsLabel });
  (S.rings || []).forEach(function (rg, j) { var p = proj(rg.at), r = rg.r || 34; E('circle', { cx: p[0], cy: p[1], r: r, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '4 5', 'data-at': 1800, 'data-fx': 'zoom' }, cam);
    if (rg.text) { var dx = rg.dx != null ? rg.dx : 120, dy = rg.dy != null ? rg.dy : -56, a = Math.atan2(dy, dx);
      E('line', { x1: p[0] + Math.cos(a) * (r + 2), y1: p[1] + Math.sin(a) * (r + 2), x2: p[0] + dx - Math.sign(dx) * 30, y2: p[1] + dy + 10, stroke: '#fff', 'stroke-width': 1.5, 'data-at': 2000, 'data-fx': 'fade' }, cam);
      tagger(p[0] + dx, p[1] + dy, rg.text, { fs: 18, bg: '#fff', attr: { 'data-at': 2000, 'data-fx': 'slide', 'data-dy': 6 } }) }
    if (rg.legend) leg.push({ k: 'ring', t: rg.legend }) });
  var tags = S.tags || (S.paint || []).map(function (pt) { return { c: pt.c, size: 'l' } });
  tags.forEach(function (tg, j) { var p = P(tg.at || tg.c); if (!p) return; p = clamp([p[0] + (tg.dx || 0), p[1] + (tg.dy || 0)], VIS);
    tagger(p[0], p[1], tg.text || tg.c, { fs: tg.size === 'l' ? 20 : (tg.size === 's' ? 14 : 16), bg: tg.light ? '#fff' : '#F4F6F5', attr: { 'data-at': 1900 + j * 140, 'data-fx': 'slide', 'data-dy': 6 } }) });
  if (S.legend !== false) legend(s, leg, 2400, choro ? 470 : 56);   /* choro 는 왼쪽 아래에 값 막대 범례가 있어 그 오른쪽으로 */
  card(s, S.card, [990, 420]);
  var c = proj([(bb[0][0] + bb[1][0]) / 2, (bb[0][1] + bb[1][1]) / 2]);
  ctx.root._hook = function () { if (h.RM()) return 0; cam.style.transformOrigin = (c[0] / 12.8).toFixed(1) + '% ' + (c[1] / 7.2).toFixed(1) + '%';
    /* 한 번에 부드럽게: 지도 전체가 흐림 → 선명 + 살짝 다가감(위쪽이 빈 채 그려지지 않게 처음부터 전체 땅이 있음) */
    var a = cam.animate([{ transform: 'scale(' + (choro ? .95 : .92) + ')', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.3,0,.2,1)' }); a._fx = 1; return 1100 } }

function globe(s, S, ctx) {
  var id = 'fm' + (++uid), L = feats(ctx.deck._w110), R = S.R || 300, cx = S.cx || 820, cy = S.cy || 430, G = S.globe || {}, fr = G.from || [52, 24], to = G.to || [129, 35.5];
  var A = [-fr[0], -fr[1] * .92], B = G.end || [-(to[0] - 21), -to[1] * .62];
  var proj = d3.geoOrthographic().scale(R).translate([cx, cy]).clipAngle(90), path = d3.geoPath(proj), grat = d3.geoGraticule().step([20, 20])();
  defs(s, id); E('rect', { width: 1280, height: 720, fill: 'url(#' + id + 'sp)' }, s); E('circle', { cx: cx, cy: cy, r: R * 1.16, fill: 'url(#' + id + 'atm)' }, s);
  var sea = E('path', { fill: 'url(#' + id + 'sea)' }, s), gr = E('path', { fill: 'none', stroke: 'rgba(0,81,54,.08)', 'stroke-width': .7 }, s);
  var glow = E('g', { opacity: .5 }, s), land = E('g', {}, s), paintG = E('g', { 'data-at': 500, 'data-fx': 'fade', 'data-ms': 700 }, s), bord = E('path', { fill: 'none', stroke: BORDER, 'stroke-width': .6 }, s), leg = [];
  var LS = L.map(function (f) { return [f, E('path', { fill: LAND }, land), E('path', { fill: 'none', stroke: COAST, 'stroke-width': 2.4 }, glow)] });
  var PS = (S.paint || []).map(function (pt) { var f = byName(L, pt.c), t = TONE[pt.tone] || TONE.gold; if (pt.label && !leg.some(function (x) { return x.t === pt.label })) leg.push({ k: 'box', c: t[0], t: pt.label });
    return f ? [f, E('path', { fill: t[0], stroke: t[1], 'stroke-width': 1, 'data-key': pt.c, 'data-tip': pt.tip || (pt.c + '|' + (pt.label || '')) }, paintG)] : null }).filter(Boolean);
  var RTs = (S.routes || []).map(function (r, j) { var st = r.style || 'ship', g = routeEl(s, '', st, 900 + j * 200), ps = g.querySelectorAll('path'); if (r.label) leg.push({ k: st === 'pipe' ? 'line' : 'dash', c: (RS[st] || RS.ship)[0], t: r.label }); return [r, ps] });
  var tagger = Tagger(s), TG = (S.tags || []).map(function (tg, j) { var g = tagger(0, 0, tg.text || tg.c, { fs: tg.size === 'l' ? 18 : 15, bg: tg.light ? '#fff' : '#F4F6F5', attr: { 'data-at': 1200 + j * 140, 'data-fx': 'fade' } }); return [tg, g] });
  function render(rot) { proj.rotate(rot); sea.setAttribute('d', path({ type: 'Sphere' })); gr.setAttribute('d', path(grat)); var bd = '';
    LS.forEach(function (a) { var d = path(a[0]) || ''; a[1].setAttribute('d', d); a[2].setAttribute('d', d); bd += d }); bord.setAttribute('d', bd);
    PS.forEach(function (a) { a[1].setAttribute('d', path(a[0]) || '') });
    RTs.forEach(function (a) { var d = path({ type: 'LineString', coordinates: a[0].path }) || ''; a[1].forEach(function (p) { p.setAttribute('d', d) }) });
    var c = [-rot[0], -rot[1]];
    TG.forEach(function (a) { var q = a[0].at || (byName(L, a[0].c) ? core(byName(L, a[0].c)) : null); if (!q) return; var vis = d3.geoDistance(q, c) < Math.PI / 2 - .08, p = proj(q), bx = a[1]._box;
      a[1].setAttribute('transform', 'translate(' + (p[0] + (a[0].dx || 0) - bx[0] - bx[2] / 2) + ',' + (p[1] - 24 + (a[0].dy || 0) - bx[1] - bx[3] / 2) + ')'); a[1].style.display = vis ? '' : 'none' }) }
  render(B);
  if (S.legend !== false) legend(s, leg, 2400);
  card(s, S.card, [56, 420]);
  ctx.root._hook = function (root) { if (h.RM()) return 0; var t0 = performance.now(), dur = 2800; render(A);
    function step(t) { var k = Math.min(1, (t - t0) / dur); k = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; render([A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k]);
      if (k < 1) { root._raf = root._raf || []; root._raf.push(requestAnimationFrame(step)) } }
    root._raf = root._raf || []; root._raf.push(requestAnimationFrame(step)); return dur } }

function flow(s, S, ctx) {
  var id = 'fm' + (++uid), L = feats(ctx.deck._w110), FL = S.flows || [], GR = S.groups || {}, ce = S.center != null ? S.center : 50;
  var pts = []; FL.forEach(function (f) { [f.from, f.to].forEach(function (q) { var g = Array.isArray(q) ? q : (byName(L, q) ? core(byName(L, q)) : null); if (g) pts.push(g) }) });
  var lo0 = Math.min.apply(null, pts.map(function (p) { return ((p[0] - ce + 540) % 360) - 180 }).concat([-60])), hi0 = Math.max.apply(null, pts.map(function (p) { return ((p[0] - ce + 540) % 360) - 180 }).concat([60]));
  var proj = d3.geoNaturalEarth1().rotate([-ce, 0]).fitExtent([[40, 150], [1240, 690]], { type: 'MultiPoint', coordinates: [[ce + lo0 - 14, -38], [ce + hi0 + 14, 66]] }), path = d3.geoPath(proj);
  defs(s, id); var cam = E('g', { class: 'fm-cam' }, s); E('rect', { x: -200, y: -200, width: 1680, height: 1120, fill: 'url(#' + id + 'sea)' }, cam);
  E('path', { d: path(d3.geoGraticule().step([20, 20])()), fill: 'none', stroke: 'rgba(220,240,236,.08)' }, cam);
  var D = lands(cam, L, path, id), mx = Math.max.apply(null, FL.map(function (f) { return +f.value || 0 }).concat([1])), tagger = Tagger(s), leg = [], dests = {};
  function tone(gn) { var g = GR[gn]; var t = typeof g === 'string' ? g : (g && g.tone) || 'gold'; return TONE[t] || TONE.gold }
  FL.forEach(function (f, j) { var src = byName(L, f.from); if (src && D[src.id]) E('path', { d: D[src.id], fill: tone(f.group)[0], stroke: BORDER, 'stroke-width': .6, 'data-key': f.from, 'data-at': 500 + (Object.keys(GR).indexOf(f.group) + 1) * 420, 'data-fx': 'fade', 'data-ms': 500 }, cam); dests[f.to] = 1 });
  Object.keys(dests).forEach(function (k) { var f = byName(L, k); if (f && D[f.id]) E('path', { d: D[f.id], fill: '#EAF4F1', stroke: BORDER, 'stroke-width': .6, 'data-key': k }, cam) });
  FL.slice().sort(function (a, b) { return b.value - a.value }).forEach(function (f, j) {
    var a = proj(Array.isArray(f.from) ? f.from : core(byName(L, f.from) || { geometry: { coordinates: [] } })), b = proj(Array.isArray(f.to) ? f.to : core(byName(L, f.to)));
    if (!a || !b) return; var w = 1.2 + 6 * (+f.value || 0) / mx, c = tone(f.group)[0], mxx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 60 - Math.abs(a[0] - b[0]) * .16, d = 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q ' + mxx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    var g = E('g', { 'data-at': 1600 + j * 90, 'data-fx': 'fade', 'data-key': f.from }, s); E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': w * 2.6, opacity: .22, 'stroke-linecap': 'round' }, g);
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': w, 'stroke-dasharray': '3 7', 'stroke-linecap': 'round', class: 'fm-run', 'data-tip': f.from + ' → ' + f.to + '|' + h.nf(f.value, S.dec || 0) + (S.unit || '') }, g);
    E('circle', { cx: a[0], cy: a[1], r: 3 + 6 * Math.sqrt((+f.value || 0) / mx), fill: c, stroke: '#06181A' }, g);
    if ((+f.value || 0) >= mx * (S.labelMin != null ? S.labelMin : .2)) tagger(a[0], a[1] + 22, f.from + ' ' + h.nf(f.value, S.dec || 0) + (S.unit || ''), { fs: 13, attr: { 'data-at': 2300 + j * 110, 'data-fx': 'fade' } }) });
  Object.keys(dests).forEach(function (k) { var f = byName(L, k); if (!f) return; var p = proj(core(f)); E('circle', { cx: p[0], cy: p[1], r: 9, fill: 'none', stroke: '#fff', 'stroke-width': 2, 'data-at': 2600, 'data-fx': 'zoom' }, s);
    tagger(p[0] - 60, p[1] - 36, k, { fs: 16, bg: '#fff', attr: { 'data-at': 2700, 'data-fx': 'slide', 'data-dy': -6 } }) });
  Object.keys(GR).forEach(function (gn) { var g = GR[gn]; leg.push({ k: 'box', c: tone(gn)[0], t: (g && g.label) || gn }) });
  if (S.flowLabel !== false) leg.push({ k: 'dash', c: '#D5E3DE', t: S.flowLabel || '흐름(굵기 = 값)' });
  if (S.legend !== false) legend(s, leg, 2400);
  card(s, S.card, [990, 420]);
  var k = proj([ce + 40, 30]) || [900, 320];
  ctx.root._hook = function () { if (h.RM()) return 0; cam.style.transformOrigin = (k[0] / 12.8).toFixed(1) + '% ' + (k[1] / 7.2).toFixed(1) + '%';
    var a = cam.animate([{ transform: 'scale(1.06)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 1200, easing: 'cubic-bezier(.4,0,.2,1)' }); a._fx = 1; return 1200 } }

ECOM.parts.fullmap = function (bd, s, ctx) {
  var f = ctx.full(), S = s, form = s.form || 'zoom';
  if (!window.d3 || !d3.geoPath) { T(ctx.svg(), 0, 40, '지도 도구(d3-geo)가 빠졌어요 — ecs.py 로 다시 빌드', { fill: '#B4461E' }); return }
  var sv = E('svg', { class: 'fm', viewBox: '0 0 1280 720', width: 1280, height: 720, style: 'position:absolute;left:0;top:0' }); f.appendChild(sv);
  if (form === 'globe') globe(sv, S, ctx); else if (form === 'flow') flow(sv, S, ctx); else zoomLike(sv, S, ctx, form === 'choro') };
ECOM.parts.fullmap.layouts = ['zoom', 'globe', 'flow', 'choro'];
ECOM.parts.fullmap.dark = ['default', 'zoom', 'globe', 'flow', 'choro'];
})();
