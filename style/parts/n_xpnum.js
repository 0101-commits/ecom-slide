/* xp 계열 3(순위 · 숫자 4판) — xpbump · xpbig · xpcards · xprank10 · xpratio. 형식 = style/SCHEMA4_F04.md
   xpbump  : 범프 차트(해마다 순위 줄이 S 자로 갈아탐)
   xpbig   : 큰 숫자 하나 + 기준점 막대 + 비교 문장
   xpcards : 숫자 카드 6칸 + 카드마다 미니 선
   xprank10: 상위 10 표 + 지난번 대비 오름 · 내림 화살표
   xpratio : 1 : N 을 칸으로(작은 쪽 1칸 · 큰 쪽 N칸) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;

/* ── xpbump : years[라벨] · series[{name,ranks[],end('끝 값 글'),hero}] 4~8개 · hero 는 진한 선(여럿 가능) */
ECOM.parts.xpbump = function (bd, s, ctx) {
  var Y = s.years || [], S = (s.series || []).slice(0, 8), ny = Y.length, n = S.length; if (!ny || !n) return; var svg = ctx.svg(512), top = 62, bot = 486, x0 = 186, x1 = 982, pitch = (bot - top) / (n - 1), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  var Xp = function (i) { return x0 + (x1 - x0) * i / (ny - 1) }, Yp = function (r) { return top + (r - 1) * pitch };
  Y.forEach(function (y, i) { T(g0, Xp(i), 24, y, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: C.mute }); E('line', { x1: Xp(i), x2: Xp(i), y1: 38, y2: bot + 14, stroke: C.grid, 'stroke-dasharray': '3 5' }, g0) });
  for (var r = 1; r <= n; r++) T(g0, x0 - 110 + 0, Yp(r) + 5, '', {});
  var order = S.map(function (q, i) { return i }).sort(function (a, b) { return (S[a].hero ? 1 : 0) - (S[b].hero ? 1 : 0) });
  order.forEach(function (si, oi) { var q = S[si], hero = !!q.hero, col = hero ? (q.color || C.dark) : C.gray, t0 = 150 + oi * 140, d = '';
    q.ranks.forEach(function (rk, i) { var x = Xp(i), y = Yp(rk); if (!i) d = 'M' + x + ' ' + y; else { var xp = Xp(i - 1), yp = Yp(q.ranks[i - 1]), dx = (x - xp) / 2; d += ' C' + (xp + dx) + ' ' + yp + ' ' + (x - dx) + ' ' + y + ' ' + x + ' ' + y } });
    E('path', { d: d, fill: 'none', stroke: col, 'stroke-width': hero ? 7 : 4, 'stroke-linecap': 'round', 'data-at': t0, 'data-fx': 'draw', 'data-ms': 1100 }, svg);
    var g = h.at(svg, t0 + 900, { 'data-fx': 'fade' });
    q.ranks.forEach(function (rk, i) { E('circle', { cx: Xp(i), cy: Yp(rk), r: hero ? 15 : 12, fill: hero ? col : '#fff', stroke: hero ? '#fff' : col, 'stroke-width': hero ? 3 : 2.5 }, g); T(g, Xp(i), Yp(rk) + 5, String(rk), { 'text-anchor': 'middle', 'font-size': hero ? 14 : 13, 'font-weight': 700, fill: hero ? '#fff' : C.cmp }) });
    T(g, x0 - 28, Yp(q.ranks[0]) + 6, q.name, { 'text-anchor': 'end', 'font-size': hero ? 18 : 16, 'font-weight': hero ? 700 : 600, fill: hero ? C.dark : C.cmp });
    T(g, x1 + 28, Yp(q.ranks[ny - 1]) + 6, q.name, { 'font-size': hero ? 18 : 16, 'font-weight': hero ? 700 : 600, fill: hero ? C.dark : C.cmp });
    if (q.end) T(g, 1168, Yp(q.ranks[ny - 1]) + 6, q.end, { 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: hero ? C.dark : C.mute }) });
  T(g0, 1168, 24, s.endHead || '', { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.mute }); T(g0, 0, 24, '순위 1 = ' + (s.topName || '가장 높음'), { 'font-size': 13, 'font-weight': 600, fill: C.mute });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpbig : big{value,dec,unit,label,sub} · refs[{label,value,sub,now}] · line(비교 문장) · unit(refs 단위) */
ECOM.parts.xpbig = function (bd, s, ctx) {
  var b = s.big || {}, R = (s.refs || []).slice(0, 5), n = R.length; var svg = ctx.svg(512), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  E('rect', { x: 0, y: 2, width: 520, height: 506, rx: 16, fill: C.dark }, g0); T(g0, 40, 62, b.label || '', { 'font-size': 18, 'font-weight': 700, fill: C.on });
  var bt = h.nf(b.value, b.dec || 0), fs = bt.length > 6 ? 112 : 140;
  T(svg, 40, 262, bt, { 'font-size': fs, 'font-weight': 700, fill: '#fff', 'data-at': 200, 'data-fx': 'count', 'data-count': b.value, 'data-dec': b.dec || 0, 'data-suf': '', 'data-ms': 1300 });
  T(g0, 44, 316, b.unit || '', { 'font-size': 36, 'font-weight': 700, fill: C.g40 }); X(g0, 44, 372, b.sub || '', 17, 430, C.on);
  function X(g, x, y, t, sz, w, fill) { h.wrap(t, sz, w, 0).forEach(function (l, i) { T(g, x, y + i * 25, l, { 'font-size': sz, 'font-weight': 500, fill: fill }) }) }
  var mx = 0; R.forEach(function (r) { mx = Math.max(mx, +r.value) }); var rx = 580, bw = 470, top = 30, pitch = 66, g1 = h.at(svg, 500, { 'data-fx': 'fade' }); T(g1, rx, top, s.refHead || '기준점과 견줘 보면', { 'font-size': 15, 'font-weight': 700, fill: C.mute });
  R.forEach(function (r, i) { var cy = top + 24 + i * pitch + pitch / 2, t0 = 700 + i * 220, g = h.at(svg, t0, { 'data-fx': 'fade' }), now = !!r.now;
    T(g, rx, cy - 16, r.label, { 'font-size': 16, 'font-weight': 700, fill: now ? C.dark : C.ink }); if (r.sub) T(g, rx + bw + 36, cy - 16, r.sub, { 'text-anchor': 'end', 'font-size': 13, fill: C.mute });
    E('rect', { x: rx, y: cy - 4, width: bw * r.value / mx, height: 22, rx: 3, fill: now ? C.main : C.gray, 'data-at': t0 + 100, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    T(h.at(svg, t0 + 520, { 'data-fx': 'fade' }), rx + bw * r.value / mx + 10, cy + 14, h.nf(r.value, s.dec != null ? s.dec : 1) + (s.unit || ''), { 'font-size': 16, 'font-weight': 700, fill: now ? C.dark : C.cmp }) });
  var ly = top + 24 + n * pitch + 16, gl = h.at(svg, 700 + n * 220 + 200, { 'data-fx': 'fade' }); E('rect', { x: rx, y: ly, width: 588, height: 506 - ly + 2, rx: 12, fill: C.g08 }, gl);
  var L = h.wrap(String(s.line || '').replace(/\*\*/g, ''), 19, 540, 1), lh = 28, y0 = ly + (506 - ly + 2) / 2 - (L.length - 1) * lh / 2 + 6; L.forEach(function (l, i) { T(gl, rx + 24, y0 + i * lh, l, { 'font-size': 19, 'font-weight': 700, fill: C.dark }) });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpcards : cards[{name,sub,value,dec,unit,delta,up(true|false|null),trend[],from,to}] 4~6장(3열) */
ECOM.parts.xpcards = function (bd, s, ctx) {
  var K = (s.cards || []).slice(0, 6), n = K.length; if (!n) return; var svg = ctx.svg(512), nc = n > 4 ? 3 : n > 2 ? 2 : n, rows = Math.ceil(n / nc), gx = 20, gy = 18, cw = (1168 - (nc - 1) * gx) / nc, chh = (508 - (rows - 1) * gy) / rows;
  K.forEach(function (k, i) { var c = i % nc, r = Math.floor(i / nc), x = c * (cw + gx), y = 2 + r * (chh + gy), t0 = i * 170, g = h.at(svg, t0, { 'data-fx': 'fade' }), dec = k.dec != null ? k.dec : 1;
    E('rect', { x: x, y: y, width: cw, height: chh, rx: 14, fill: C.paper }, g); T(g, x + 22, y + 34, k.name, { 'font-size': 16, 'font-weight': 700, fill: C.ink }); if (k.sub) T(g, x + cw - 22, y + 34, k.sub, { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute });
    T(svg, x + 22, y + 94, h.nf(k.value, dec), { 'font-size': 46, 'font-weight': 700, fill: C.dark, 'data-at': t0 + 150, 'data-fx': 'count', 'data-count': k.value, 'data-dec': dec, 'data-suf': '', 'data-ms': 800 });
    var vw = h.textW(h.nf(k.value, dec), 46, 1); T(g, x + 22 + vw + 6, y + 94, k.unit || '', { 'font-size': 18, 'font-weight': 700, fill: C.main });
    if (k.delta) { var up = k.up, bg = up === true ? C.g18 : up === false ? C.light : C.light, tw = h.textW(k.delta, 14, 1) + 22; E('rect', { x: x + cw - 22 - tw, y: y + 62, width: tw, height: 30, rx: 15, fill: bg }, g); T(g, x + cw - 22 - tw / 2, y + 82, k.delta, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: up === true ? C.dark : C.cmp }) }
    var tr = k.trend || [], m = tr.length, lx0 = x + 22, lx1 = x + cw - 22, ly0 = y + 122, ly1 = y + chh - 40;
    if (m > 1) { var lo = Math.min.apply(null, tr), hi = Math.max.apply(null, tr), rg = (hi - lo) || 1, pt = tr.map(function (v, q) { return [lx0 + (lx1 - lx0) * q / (m - 1), ly1 - (v - lo) / rg * (ly1 - ly0)] }), d = 'M' + pt.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1) }).join(' L');
      E('path', { d: d + ' L' + lx1 + ' ' + (ly1 + 4) + ' L' + lx0 + ' ' + (ly1 + 4) + ' Z', fill: C.g18, opacity: .6, 'data-at': t0 + 250, 'data-fx': 'fade' }, svg);
      E('path', { d: d, fill: 'none', stroke: C.main, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'data-at': t0 + 250, 'data-fx': 'draw', 'data-ms': 800 }, svg);
      var ge = h.at(svg, t0 + 1000, { 'data-fx': 'pop' }); E('circle', { cx: pt[m - 1][0], cy: pt[m - 1][1], r: 5.5, fill: C.dark, stroke: '#fff', 'stroke-width': 2 }, ge);
      T(g, lx0, y + chh - 14, k.from || '', { 'font-size': 12.5, fill: C.mute }); T(g, lx1, y + chh - 14, k.to || '', { 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) } });
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xprank10 : rows[{name,value,prev(지난 순위 번호 | null = 신규)}] 값 큰 순 · unit · dec · valHead · prevHead · moveNote */
ECOM.parts.xprank10 = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 10), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, u = s.unit || '', top = 40, pitch = (508 - top) / n, g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  E('rect', { x: 0, y: 2, width: 1168, height: 32, rx: 8, fill: C.dark }, g0);
  [['순위', 26, 'middle'], ['변동', 118, 'middle'], ['이름', 190, 'start'], [s.valHead || '값', 780, 'start'], [s.prevHead || '지난번 순위', 1150, 'end']].forEach(function (c) { T(g0, c[1], 24, c[0], { 'text-anchor': c[2], 'font-size': 14, 'font-weight': 700, fill: '#fff' }) });
  var mx = 0; R.forEach(function (r) { mx = Math.max(mx, Math.abs(r.value)) }); var bx = 470, bw = 300 - 20, L = bw / mx;
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, t0 = 120 + i * 110, g = h.at(svg, t0, { 'data-fx': 'fade' }), mv = r.prev == null ? null : r.prev - (i + 1);
    if (i % 2 === 0) E('rect', { x: 0, y: cy - pitch / 2 + 1, width: 1168, height: pitch - 2, rx: 6, fill: C.paper }, g0);
    E('circle', { cx: 26, cy: cy, r: 15, fill: i < 3 ? C.dark : '#fff', stroke: i < 3 ? C.dark : C.axis, 'stroke-width': 2 }, g); T(g, 26, cy + 5, String(i + 1), { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: i < 3 ? '#fff' : C.cmp });
    if (mv === null) { X2(g, 118, cy, '신규', C.main, '#fff') } else if (mv === 0) T(g, 118, cy + 5, '―', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: C.axis });
    else { var up = mv > 0; E('path', { d: up ? 'M100 ' + (cy + 5) + ' l9 -13 l9 13 z' : 'M100 ' + (cy - 5) + ' l9 13 l9 -13 z', fill: up ? C.dark : C.cmp }, g); T(g, 126, cy + 6, String(Math.abs(mv)), { 'font-size': 16, 'font-weight': 700, fill: up ? C.dark : C.cmp }) }
    T(g, 190, cy + 6, r.name, { 'font-size': 18, 'font-weight': i < 3 ? 700 : 500, fill: C.ink });
    var v = +r.value, bwv = Math.max(2, Math.abs(v) * L); E('rect', { x: bx + 70, y: cy - 9, width: bwv, height: 18, rx: 3, fill: i < 3 ? C.main : C.g65, 'data-at': t0 + 120, 'data-fx': 'growx', 'data-ms': 420 }, svg);
    T(h.at(svg, t0 + 450, { 'data-fx': 'fade' }), bx + 70 + bwv + 10, cy + 6, (v < 0 ? '−' : '') + h.nf(Math.abs(v), dec) + u, { 'font-size': 16, 'font-weight': 700, fill: C.dark });
    T(g, 1150, cy + 6, r.prev == null ? '순위 밖' : r.prev + '위', { 'text-anchor': 'end', 'font-size': 15.5, fill: C.mute }) });
  function X2(g, cx, cy, t, bg, fg) { var w = h.textW(t, 12.5, 1) + 14; E('rect', { x: cx - w / 2, y: cy - 11, width: w, height: 22, rx: 11, fill: bg }, g); T(g, cx, cy + 4.5, t, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: fg }) }
  ctx.root.setAttribute('data-gap', 300);
};

/* ── xpratio : small{label,value,unit,sub} · big{label,value,unit} · n(큰 쪽 칸 수) · refs[{label,text}] */
ECOM.parts.xpratio = function (bd, s, ctx) {
  var sm = s.small || {}, bg = s.big || {}, n = Math.max(1, Math.round(+s.n)), svg = ctx.svg(512), refs = (s.refs || []).slice(0, 4), g0 = h.at(svg, 0, { 'data-fx': 'fade' }), gh = refs.length ? 376 : 470, gx0 = 372, gw = 796;
  E('rect', { x: 0, y: 6, width: 300, height: gh + 40 - 6, rx: 16, fill: C.paper }, g0); T(g0, 150, 48, sm.label || '', { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.ink });
  var sq = 116, sy = 60 + (gh - 140) / 2 - 16; E('rect', { x: 150 - sq / 2, y: sy, width: sq, height: sq, rx: 8, fill: C.dark, 'data-at': 150, 'data-fx': 'pop' }, svg);
  T(g0, 150, sy + sq + 44, h.nf(sm.value, sm.dec != null ? sm.dec : 0) + (sm.unit || ''), { 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 700, fill: C.dark }); if (sm.sub) T(g0, 150, sy + sq + 72, sm.sub, { 'text-anchor': 'middle', 'font-size': 13.5, fill: C.mute });
  T(g0, 336, 6 + (gh + 34) / 2 + 12, '=', { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 700, fill: C.g65 });
  var best = null; for (var cols = 6; cols <= 60; cols++) { var rows = Math.ceil(n / cols), cs = Math.min(gw / cols, (gh - 40) / rows); if (!best || cs > best.cs) best = { cols: cols, rows: rows, cs: cs } }
  var cs = best.cs, pad = Math.max(2, cs * .14), gtop = 54 + ((gh - 40) - best.rows * cs) / 2, gl = gx0 + (gw - best.cols * cs) / 2;
  T(g0, gx0, 32, (bg.label || '') + '  ' + h.nf(bg.value, bg.dec != null ? bg.dec : 0) + (bg.unit || '') + ' = ' + n + '칸', { 'font-size': 18, 'font-weight': 700, fill: C.dark });
  for (var q = 0; q < n; q++) { var rr = Math.floor(q / best.cols), cc = q % best.cols; E('rect', { x: gl + cc * cs + pad / 2, y: gtop + rr * cs + pad / 2, width: cs - pad, height: cs - pad, rx: 2.5, fill: (q + 1) % 10 === 0 ? C.main : C.g65, 'data-at': 300 + rr * 90, 'data-fx': 'pop', 'data-ms': 260 }, svg) }
  if (refs.length) { var gr = h.at(svg, 300 + best.rows * 90 + 300, { 'data-fx': 'fade' }), rw = (1168 - (refs.length - 1) * 16) / refs.length;
    refs.forEach(function (r, i) { var x = i * (rw + 16); E('rect', { x: x, y: 420, width: rw, height: 86, rx: 12, fill: i === refs.length - 1 ? C.dark : C.g08 }, gr); T(gr, x + 20, 450, r.label, { 'font-size': 14, 'font-weight': 600, fill: i === refs.length - 1 ? C.on : C.mute }); T(gr, x + 20, 490, r.text, { 'font-size': 30, 'font-weight': 700, fill: i === refs.length - 1 ? '#fff' : C.dark }) }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
