/* p_mapbadge.js — 지도 위 배지 + 연결(영상 장면 문법). 납작한 원 배지가 나라 자리에 차례로 놓이고 선이 이어짐. 지도 = ECOM.gm.geoLike(빌드가 장 자료의 at · iso · fill · view.bbox 로 범위를 정함).
   배치 link  : 두 나라(셋까지) 배지가 놓이고 점선이 이어지며 관계 이름표      · 칸 nodes[{at,code,label,sub,tone,dx,dy,icon}] · edges[{from,to,label,tone}]
   배치 ring  : 한 나라 둘레에 아이콘 원 배지가 하나씩 둘러 붙음               · 칸 center{at,code,label,sub} · items[{icon,code,label,sub}] · rx · ry
   배치 cut   : 이어진 선 위에 X 가 찍히며 관계가 끊김 + 이름표               · 칸 nodes[…] · edges[{from,to,label,cut:true}]
   배치 elbow : 배지를 꺾인 직각선으로 잇고 선 위에 품목 아이콘 칩            · 칸 nodes[…] · edges[{from,to,items[{icon,label}],route:'hvh|vhv',mid}]
   공통 칸    : fill{나라:색 이름} · legend[{k:'box|line|dash|x',c,t}] · note{title,text,pos:'tl|tr|bl|br',w}
   색 이름    : green · main · warn · gold · gray (밝은 · 짙은 바탕 따로) · 기본 DOM = 끝 모습, 점선 긋기는 _hook 안에서만.
   ECOM.pmap = 이 파일의 지도 도우미(p_mapval.js 가 가져다 씀). */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, uid = 0;
var TL = { green: '#7FC4A6', main: '#4D9E83', warn: '#E3A98F', gold: '#F0D58A', gray: '#D5DBD8' }, TD = { green: '#2E9970', main: '#3FBF8A', warn: '#C0603F', gold: '#C9A24A', gray: '#4A6B60' };
var ICON = {
  chip: 'M7 7h10v10H7zM10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3',
  drum: 'M6 6c0-1.7 2.7-3 6-3s6 1.3 6 3v12c0 1.7-2.7 3-6 3s-6-1.3-6-3zM6 6c0 1.7 2.7 3 6 3s6-1.3 6-3M6 12c0 1.7 2.7 3 6 3s6-1.3 6-3',
  ship: 'M3 14h18l-2.5 6h-13zM7 14V9h10v5M10 9V5h4v4',
  grain: 'M12 21V8M12 8c-3 0-4-2-4-4 3 0 4 2 4 4zM12 8c3 0 4-2 4-4-3 0-4 2-4 4zM12 14c-3 0-4-2-4-4 3 0 4 2 4 4zM12 14c3 0 4-2 4-4-3 0-4 2-4 4z',
  car: 'M3 16v-4l2.2-5h13.6L21 12v4zM5.5 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0M14.5 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
  bolt: 'M4 8h13v8H4zM17 11h3v2h-3zM11 9.5l-2 2.5h3l-2 2.5',
  box: 'M4 8l8-4 8 4v9l-8 4-8-4zM4 8l8 4 8-4M12 12v9',
  coin: 'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4',
  pill: 'M5 12a7 4 0 1 0 14 0a7 4 0 1 0-14 0M12 8v8',
  gem: 'M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l-2 6 5 11 5-11-2-6',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9'
};

function K(ctx) { var dk = !!ctx.dark, Cd = ECOM.Cd;
  return { dk: dk, acc: dk ? Cd.main : C.main, warn: dk ? Cd.warn : C.warn, ink: dk ? '#fff' : C.ink, sub: dk ? 'rgba(255,255,255,.82)' : C.sub, card: dk ? '#0B3D2E' : '#fff', line: dk ? 'rgba(255,255,255,.28)' : C.line,
    halo: { 'paint-order': 'stroke', stroke: dk ? '#062E23' : '#fff', 'stroke-width': 3.6, 'stroke-linejoin': 'round' } } }
function tone(v, dk) { if (!v) return null; v = String(v); if (v.charAt(0) === '#') return v; return (dk ? TD : TL)[v] || null }

/* 지도 바탕 : 밝은 바탕 = 흰 땅 · 연한 바다, 짙은 바탕(deep) = 다큐형 짙은 바다 · 땅 */
function base(svg, s, ctx) { var k = K(ctx), W = 1168, H = 512;
  if (!window.d3 || !d3.geoPath || !ECOM.gm || !ECOM.gm.ok(s)) { T(svg, 20, 40, '지도 자료가 빠졌음 — ecs.py 로 다시 빌드', { fill: k.warn, 'font-size': 14 }); return null }
  var G = ECOM.gm.geoLike(s, W, H), id = 'pm' + (++uid), cp = E('clipPath', { id: id }, E('defs', {}, svg)); E('rect', { width: W, height: H, rx: 12 }, cp);
  var m = E('g', { 'clip-path': 'url(#' + id + ')', 'data-at': 0, 'data-fx': 'fade', 'data-ms': 500 }, svg);
  E('rect', { width: W, height: H, fill: k.dk ? '#062E23' : '#E6EFEB' }, m);
  E('path', { d: G.land, fill: 'none', stroke: k.dk ? '#3F8A6E' : '#AFC4BC', 'stroke-width': 2.6, 'stroke-linejoin': 'round', opacity: .55 }, m);
  E('path', { d: G.land, fill: k.dk ? '#18523F' : '#FFFFFF' }, m);
  var fl = s.fill || {}, n = 0;
  Object.keys(fl).forEach(function (nm) { var iso = G.countries[nm] ? nm : (G.names[nm] || ''), col = tone(fl[nm], k.dk); if (!col || !G.countries[iso]) return;
    E('path', { d: G.countries[iso], fill: col, 'data-key': nm, 'data-at': 300 + (n++) * 160, 'data-fx': 'fade', 'data-ms': 500 }, m) });
  E('path', { d: G.land, fill: 'none', stroke: k.dk ? '#0E3D2F' : '#C5D1CC', 'stroke-width': .8 }, m);
  return { G: G, k: k, W: W, H: H } }
function pos(B, n) { var p = B.G.find(n.at); if (!p) return null; return [p[0] + (n.dx || 0), p[1] + (n.dy || 0)] }

/* 아이콘(24 칸 선그림) */
function icon(parent, name, cx, cy, size, col) { var d = ICON[name]; if (!d) return null; var kk = size / 24;
  var g = E('g', { transform: 'translate(' + (cx - 12 * kk).toFixed(1) + ',' + (cy - 12 * kk).toFixed(1) + ') scale(' + kk.toFixed(3) + ')', fill: 'none', stroke: col, 'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
  E('path', { d: d }, g); return g }

/* 납작한 원 배지 — 안 = 아이콘 또는 두 글자 이름, 밑 · 곁 = 이름 + 한 줄 설명 */
function badge(svg, k, x, y, R, n, at) { n = n || {}; var col = tone(n.tone, k.dk) || k.acc, g = E('g', { 'data-at': at, 'data-fx': 'pop', 'data-ms': 420, 'data-key': n.label || n.code || '' }, svg);
  E('circle', { cx: x, cy: y, r: R, fill: k.card, stroke: col, 'stroke-width': 3.4 }, g);
  if (n.icon && ICON[n.icon]) icon(g, n.icon, x, y, R * 1.05, k.dk ? '#fff' : C.dark);
  else if (n.code) T(g, x, y + R * .24, n.code, { 'font-size': R > 34 ? 21 : 17, 'font-weight': 800, fill: k.ink, 'text-anchor': 'middle', 'letter-spacing': '-.03em' });
  var lp = n.lp || 'below', lx = x, ly = y + R + 18, an = 'middle';
  if (lp === 'above') ly = y - R - 10 - (n.sub ? 18 : 0); if (lp === 'right') { lx = x + R + 10; ly = y + 5 - (n.sub ? 9 : 0); an = 'start' } if (lp === 'left') { lx = x - R - 10; ly = y + 5 - (n.sub ? 9 : 0); an = 'end' }
  var dupe = n.label && n.label === n.code, sy = dupe ? ly : ly + 18;
  if (n.label && !dupe) T(g, lx, ly, n.label, Object.assign({ 'font-size': 14.5, 'font-weight': 800, fill: k.ink, 'text-anchor': an }, k.halo));
  if (n.sub) T(g, lx, sy, n.sub, Object.assign({ 'font-size': 12.5, 'font-weight': 600, fill: k.sub, 'text-anchor': an }, k.halo));
  return g }

/* 이름표 칩 */
function chip(svg, k, x, y, text, col, at, fx) { var w = h.textW(text, 13.5, 1) + 24, g = E('g', { 'data-at': at, 'data-fx': fx || 'zoom', 'data-ms': 420, 'data-key': text }, svg);
  E('rect', { x: x - w / 2, y: y - 14, width: w, height: 28, rx: 14, fill: k.card, stroke: col, 'stroke-width': 1.8 }, g);
  T(g, x, y + 5, text, { 'font-size': 13.5, 'font-weight': 800, fill: k.ink, 'text-anchor': 'middle' }); return g }

function quad(a, b, bend) { var dx = b[0] - a[0], dy = b[1] - a[1], c = [(a[0] + b[0]) / 2 - dy * bend, (a[1] + b[1]) / 2 + dx * bend]; return { p0: a, c: c, p1: b } }
function qpt(q, t) { var u = 1 - t; return [u * u * q.p0[0] + 2 * u * t * q.c[0] + t * t * q.p1[0], u * u * q.p0[1] + 2 * u * t * q.c[1] + t * t * q.p1[1]] }
function qseg(q, t0, t1) { var a = qpt(q, t0), b = qpt(q, t1), u = 1 - t0, dx = u * (q.c[0] - q.p0[0]) + t0 * (q.p1[0] - q.c[0]), dy = u * (q.c[1] - q.p0[1]) + t0 * (q.p1[1] - q.c[1]), d = t1 - t0;
  return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q' + (a[0] + d * dx).toFixed(1) + ' ' + (a[1] + d * dy).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) }
/* 두 배지 가장자리에서 시작하도록 곡선의 양 끝을 안으로 */
function edge(a, b, R, bend) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, g = R + 6; return quad([a[0] + dx / L * g, a[1] + dy / L * g], [b[0] - dx / L * g, b[1] - dy / L * g], bend) }

/* 점선 긋기 — 마스크 선이 그어지는 동안만 드러남(기본 DOM = 다 그어진 모습) */
function dash(svg, d, attrs, at, ms, items, key) { var id = 'pm' + (++uid), mk = E('mask', { id: id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1168, height: 512 }, E('defs', {}, svg));
  var mp = E('path', { d: d, fill: 'none', stroke: '#fff', 'stroke-width': 14, 'stroke-linecap': 'round' }, mk), g = E('g', { mask: 'url(#' + id + ')', 'data-at': at, 'data-fx': 'fade', 'data-ms': 60, 'data-key': key || '' }, svg);
  E('path', Object.assign({ d: d, fill: 'none' }, attrs), g);
  items.push({ el: mp, at: at, ms: ms, kf: function () { var L = mp.getTotalLength(), v = L + ' ' + L; return [{ strokeDasharray: v, strokeDashoffset: L }, { strokeDasharray: v, strokeDashoffset: 0 }] } }); return g }
function hook(ctx, items) { ctx.root._hook = function () { if (h.RM()) return 0; var end = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(typeof it.kf === 'function' ? it.kf() : it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, it.at + it.ms) }); return end } }

/* 범례(왼 아래) · 풀이 카드(모서리) */
function legend(svg, k, items, at) { if (!items || !items.length) return; var W = 0, ws = items.map(function (it) { var sw = it.k === 'x' ? 22 : (it.k === 'box' ? 20 : 34), w = sw + h.textW(it.t, 13, 0) + 22; W += w; return [sw, w] }), x = 14, y = 512 - 14 - 30;
  var g = E('g', { 'data-at': at, 'data-fx': 'fade', 'data-ms': 500 }, svg); E('rect', { x: x, y: y, width: W + 8, height: 30, rx: 15, fill: k.card, stroke: k.line }, g); x += 12;
  items.forEach(function (it, i) { var c = tone(it.c, k.dk) || it.c || k.acc, cy = y + 15;
    if (it.k === 'box') E('rect', { x: x, y: cy - 7, width: 14, height: 14, rx: 3, fill: c, stroke: k.line }, g);
    else if (it.k === 'dash') E('line', { x1: x, x2: x + 26, y1: cy, y2: cy, stroke: c, 'stroke-width': 3.2, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }, g);
    else if (it.k === 'x') { E('circle', { cx: x + 8, cy: cy, r: 8, fill: c }, g); E('path', { d: 'M' + (x + 4.5) + ' ' + (cy - 3.5) + 'l7 7M' + (x + 11.5) + ' ' + (cy - 3.5) + 'l-7 7', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, g) }
    else E('line', { x1: x, x2: x + 26, y1: cy, y2: cy, stroke: c, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g);
    T(g, x + ws[i][0] + 4, cy + 4.5, it.t, { 'font-size': 13, fill: k.sub }); x += ws[i][1] }) }
function note(svg, k, o, at) { if (!o || typeof o !== 'object' || !(o.text || o.title)) return;   /* 글 없는 메모(목업 설명 글)는 빈 칸을 그리지 않음 */ var w = o.w || 330, ls = h.wrap(o.text || '', 14, w - 32), hh = 20 + (o.title ? 26 : 0) + ls.length * 21 + 8, pz = o.pos || 'tr', x = /r/.test(pz) ? 1168 - w - 16 : 16, y = /b/.test(pz) ? 512 - hh - 16 : 16;
  var g = E('g', { 'data-at': at, 'data-fx': 'slide', 'data-dy': 8, 'data-key': o.title || '풀이' }, svg); E('rect', { x: x, y: y, width: w, height: hh, rx: 10, fill: k.card, stroke: k.line }, g);
  var yy = y + 28; if (o.title) { T(g, x + 16, yy, o.title, { 'font-size': 14.5, 'font-weight': 800, fill: k.acc }); yy += 26 }
  ls.forEach(function (ln, i) { T(g, x + 16, yy + i * 21, ln, { 'font-size': 14, fill: k.ink }) }) }

function dflt(s) { var n = (s.nodes || []).length, o = []; for (var i = 0; i + 1 < n; i++) o.push({ from: i, to: i + 1 }); return o }

/* link : 배지가 차례로 떨어지고 점선이 이어지며 관계 이름표 */
function link(bd, s, ctx) { var svg = ctx.svg(512), B = base(svg, s, ctx); if (!B) return; var k = B.k, nodes = s.nodes || [], P = nodes.map(function (n) { return pos(B, n) }), R = 30, items = [];
  var t0 = 500 + nodes.length * 520 + 100, ls = s.edges || dflt(s);
  ls.forEach(function (l, j) { var a = P[l.from], b = P[l.to]; if (!a || !b) return; var col = tone(l.tone, k.dk) || k.acc, q = edge(a, b, R, l.bend != null ? l.bend : .16), t = t0 + j * 950;
    dash(svg, qseg(q, 0, 1), { stroke: col, 'stroke-width': 3.6, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }, t, 800, items, l.label);
    if (l.label) { var m = qpt(q, l.t != null ? l.t : .5); chip(svg, k, m[0], m[1], l.label, col, t + 800) } });
  nodes.forEach(function (n, i) { if (P[i]) badge(svg, k, P[i][0], P[i][1], R, n, 500 + i * 520) });
  legend(svg, k, s.legend, t0 + ls.length * 950); note(svg, k, s.note, t0 + ls.length * 950 + 200); hook(ctx, items) }

/* ring : 한 나라 둘레에 아이콘 원 배지가 하나씩 둘러 붙음 */
function ring(bd, s, ctx) { var svg = ctx.svg(512), B = base(svg, s, ctx); if (!B) return; var k = B.k, c = s.center || {}, p0 = pos(B, c), its = s.items || [], n = its.length, R = 30, R0 = 44;
  if (!p0) return; var rx = s.rx || 360, ry = s.ry || 168, cx = Math.max(rx + 120, Math.min(1168 - rx - 120, p0[0])), cy = Math.max(ry + 70, Math.min(512 - ry - 70, p0[1]));
  var pts = its.map(function (it, i) { var a = -Math.PI / 2 + (i + (s.rot || 0)) * 2 * Math.PI / n; return { a: a, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) } });
  pts.forEach(function (p, i) { var dx = p.x - cx, dy = p.y - cy, L = Math.sqrt(dx * dx + dy * dy), e0 = R0 + 4, e1 = L - R - 4;
    E('line', { x1: cx + dx / L * e0, y1: cy + dy / L * e0, x2: cx + dx / L * e1, y2: cy + dy / L * e1, stroke: tone(its[i].tone, k.dk) || k.acc, 'stroke-width': 2.4, 'data-at': 900 + i * 330, 'data-fx': 'draw', 'data-ms': 420 }, svg) });
  badge(svg, k, cx, cy, R0, Object.assign({ lp: 'below' }, c, { dx: 0, dy: 0, sub: c.sub }), 400);
  its.forEach(function (it, i) { var p = pts[i], sn = Math.sin(p.a), cs = Math.cos(p.a), lp = sn > .55 ? 'below' : (sn < -.55 ? 'above' : (cs > 0 ? 'right' : 'left'));
    badge(svg, k, p.x, p.y, R, Object.assign({ lp: lp }, it), 1150 + i * 330) });
  var tt = 1150 + n * 330 + 100; legend(svg, k, s.legend, tt); note(svg, k, s.note, tt + 200) }

/* cut : 이어진 선 위에 X 가 찍히며 관계가 끊김 */
function cut(bd, s, ctx) { var svg = ctx.svg(512), B = base(svg, s, ctx); if (!B) return; var k = B.k, nodes = s.nodes || [], P = nodes.map(function (n) { return pos(B, n) }), R = 30, ls = s.edges || dflt(s), t0 = 500 + nodes.length * 520 + 100, tt = t0;
  ls.forEach(function (l, j) { var a = P[l.from], b = P[l.to]; if (!a || !b) return; var q = edge(a, b, R, l.bend != null ? l.bend : .12), t = t0 + j * 1500, m = qpt(q, .5);
    if (!l.cut) { E('path', { d: qseg(q, 0, 1), fill: 'none', stroke: tone(l.tone, k.dk) || k.acc, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 700, 'data-key': l.label || '' }, svg);
      if (l.label) chip(svg, k, m[0], m[1], l.label, tone(l.tone, k.dk) || k.acc, t + 700); tt = Math.max(tt, t + 1000); return }
    E('path', { d: qseg(q, 0, .4), fill: 'none', stroke: k.acc, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 420, 'data-key': l.label || '끊긴 선' }, svg);
    E('path', { d: qseg(q, .6, 1), fill: 'none', stroke: k.acc, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 420, 'data-key': l.label || '끊긴 선' }, svg);
    var x = E('g', { 'data-at': t + 650, 'data-fx': 'pop', 'data-ms': 360, 'data-key': l.label || '끊김' }, svg); E('circle', { cx: m[0], cy: m[1], r: 17, fill: k.warn, stroke: k.card, 'stroke-width': 3 }, x);
    E('path', { d: 'M' + (m[0] - 6.5) + ' ' + (m[1] - 6.5) + 'l13 13M' + (m[0] + 6.5) + ' ' + (m[1] - 6.5) + 'l-13 13', stroke: '#fff', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, x);
    if (l.label) chip(svg, k, m[0], m[1] + 38, l.label, k.warn, t + 1000, 'slide'); tt = Math.max(tt, t + 1400) });
  nodes.forEach(function (n, i) { if (P[i]) badge(svg, k, P[i][0], P[i][1], R, n, 500 + i * 520) });
  legend(svg, k, s.legend, tt); note(svg, k, s.note, tt + 200) }

/* elbow : 배지를 꺾인 직각선으로 잇고 선 위 품목 아이콘 칩 */
function elbow(bd, s, ctx) { var svg = ctx.svg(512), B = base(svg, s, ctx); if (!B) return; var k = B.k, nodes = s.nodes || [], P = nodes.map(function (n) { return pos(B, n) }), R = 30, ls = s.edges || dflt(s), t0 = 500 + nodes.length * 480 + 100, tt = t0;
  ls.forEach(function (l, j) { var a = P[l.from], b = P[l.to]; if (!a || !b) return; var dx = b[0] - a[0], dy = b[1] - a[1], hv = l.route ? l.route !== 'vhv' : Math.abs(dx) >= Math.abs(dy), f = l.mid != null ? l.mid : .5, pts;
    if (hv) { var mx = a[0] + dx * f; pts = [a, [mx, a[1]], [mx, b[1]], b] } else { var my = a[1] + dy * f; pts = [a, [a[0], my], [b[0], my], b] }
    pts = pts.filter(function (p, i) { return i === 0 || Math.abs(p[0] - pts[i - 1][0]) + Math.abs(p[1] - pts[i - 1][1]) > 2 }).map(function (p) { return p.slice() });
    function pull(p, q, d) { var vx = q[0] - p[0], vy = q[1] - p[1], L = Math.sqrt(vx * vx + vy * vy) || 1; p[0] += vx / L * d; p[1] += vy / L * d }
    var n = pts.length, A0 = pts[0], A1 = pts[1], Z0 = pts[n - 1], Z1 = pts[n - 2]; pull(A0, A1, R + 4); pull(Z0, Z1, R + 10);
    var col = tone(l.tone, k.dk) || k.acc, t = t0 + j * 1100, d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1) }).join(' L'), L = [], tot = 0;
    for (var i = 1; i < n; i++) { var sl = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); L.push(sl); tot += sl }
    function at(fr) { var w = fr * tot, i = 0; while (i < L.length - 1 && w > L[i]) { w -= L[i]; i++ } var u = L[i] ? w / L[i] : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u] }
    E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': 3.4, 'stroke-linejoin': 'miter', 'data-at': t, 'data-fx': 'draw', 'data-ms': 800, 'data-key': l.label || '' }, svg);
    var ux = Z0[0] - Z1[0], uy = Z0[1] - Z1[1], ul = Math.sqrt(ux * ux + uy * uy) || 1; ux /= ul; uy /= ul;
    E('path', { d: 'M' + Z0[0] + ' ' + Z0[1] + 'L' + (Z0[0] - ux * 14 - uy * 8) + ' ' + (Z0[1] - uy * 14 + ux * 8) + 'L' + (Z0[0] - ux * 14 + uy * 8) + ' ' + (Z0[1] - uy * 14 - ux * 8) + 'Z', fill: col, 'data-at': t + 760, 'data-fx': 'fade', 'data-ms': 200 }, svg);
    var its = l.items || []; its.forEach(function (it, q) { var c = at(l.cf != null ? l.cf + (q - (its.length - 1) / 2) * .16 : (q + 1) / (its.length + 1)), w = 44 + h.textW(it.label || '', 13.5, 1), g = E('g', { 'data-at': t + 800 + q * 260, 'data-fx': 'pop', 'data-ms': 380, 'data-key': it.label || '' }, svg);
      E('rect', { x: c[0] - w / 2, y: c[1] - 17, width: w, height: 34, rx: 17, fill: k.card, stroke: col, 'stroke-width': 1.8 }, g); icon(g, it.icon, c[0] - w / 2 + 20, c[1], 20, k.dk ? '#fff' : C.dark);
      T(g, c[0] - w / 2 + 36, c[1] + 5, it.label || '', { 'font-size': 13.5, 'font-weight': 800, fill: k.ink }) });
    tt = Math.max(tt, t + 900 + its.length * 260) });
  nodes.forEach(function (n, i) { if (P[i]) badge(svg, k, P[i][0], P[i][1], R, n, 500 + i * 480) });
  legend(svg, k, s.legend, tt); note(svg, k, s.note, tt + 200) }

ECOM.pmap = { K: K, tone: tone, base: base, pos: pos, icon: icon, badge: badge, chip: chip, legend: legend, note: note, hook: hook, dash: dash };
ECOM.parts.mapbadge = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'link';
  ({ link: link, ring: ring, cut: cut, elbow: elbow }[L] || link)(bd, s, ctx); ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.mapbadge.layouts = ['default', 'link', 'ring', 'cut', 'elbow'];
ECOM.parts.mapbadge.dark = ['default', 'link', 'ring', 'cut', 'elbow'];
})();
