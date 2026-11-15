/* pills — 알약 칩 상태 전환(5판 영상 부품). 기본 그림 = 바뀐 뒤 모습, 색 바뀜은 _hook 에서만.
   배치 row  : 같은 줄 알약 4~6개가 하나씩 색이 바뀜 · 칸 items[{k, v, word, tone:'good|bad|mid'}] dec unit label legend{good,bad,mid} summary(아래 설명) countLabel
   배치 flip : 큰 알약 하나가 뒤집히며 색 · 값이 바뀜 + 옆 설명 · 칸 before{when, word, value, tone} after{…} label points[{k,v}] */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T;
function chip(p, x, y, txt, o) { o = o || {}; var fs = o.fs || 15, w = h.textW(txt, fs, 1) + 28, g = E('g', o.attr || {}, p);
  E('rect', { x: x, y: y, width: w, height: fs + 18, rx: (fs + 18) / 2, fill: o.fill }, g); T(g, x + 14, y + fs + 4, txt, { 'font-size': fs, 'font-weight': 700, fill: o.ink }); return w }
function tones(P, dk) { var ink = dk ? '#003D2B' : '#FFFFFF'; return { good: { f: P.main, i: ink }, bad: { f: P.warn, i: ink }, mid: { f: dk ? P.g65 : P.cmp, i: ink }, none: { f: dk ? P.g18 : P.g18, i: P.mute } } }

function row(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), TN = tones(P, dk), it = (s.items || []).slice(0, 6), n = it.length, dec = s.dec || 0, unit = s.unit || '', gp = 18, pw = (1168 - (n - 1) * gp) / n, py = 112, ph = 176, pills = [];
  if (s.label) chip(svg, 0, 0, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  it.forEach(function (q, i) { var x = i * (pw + gp), tn = TN[q.tone] || TN.mid, g = E('g', { 'data-key': q.k }, svg), cx = x + pw / 2;
    chip(svg, cx - (h.textW(q.k, 19, 1) + 28) / 2, 62, q.k, { fs: 19, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
    var r = E('rect', { x: x, y: py, width: pw, height: ph, rx: 52, fill: tn.f }, g), tg = E('g', {}, g);
    T(tg, cx, py + 92, h.nf(q.v, dec) + unit, { 'font-size': 40, 'font-weight': 800, fill: tn.i, 'text-anchor': 'middle' }); T(tg, cx, py + 132, q.word || '', { 'font-size': 19, 'font-weight': 700, fill: tn.i, 'text-anchor': 'middle' });
    pills.push({ r: r, tg: tg, to: tn.f, from: TN.none.f }) });
  var cnt = {}; it.forEach(function (q) { cnt[q.tone] = (cnt[q.tone] || 0) + 1 });
  var by = 332, lg = s.legend || {}, bg = E('g', { 'data-at': 1800, 'data-fx': 'slide', 'data-dy': 10 }, svg);
  E('rect', { x: 0, y: by, width: 1168, height: 168, rx: 14, fill: P.paper, stroke: P.line }, bg);
  var k = 0; ['bad', 'good', 'mid'].forEach(function (t) { if (!cnt[t] || !lg[t]) return; var x = 32 + k * 214; E('rect', { x: x, y: by + 30, width: 44, height: 44, rx: 22, fill: TN[t].f }, bg);
    T(bg, x + 22, by + 60, String(cnt[t]), { 'font-size': 22, 'font-weight': 800, fill: TN[t].i, 'text-anchor': 'middle' }); T(bg, x + 56, by + 50, lg[t], { 'font-size': 17, 'font-weight': 700, fill: P.ink }); T(bg, x + 56, by + 72, cnt[t] + '개월', { 'font-size': 14, fill: P.mute }); k++ });
  if (s.summary) h.wrap(s.summary, 21, 1100, 1).slice(0, 2).forEach(function (ln, i) { T(bg, 32, by + 120 + i * 30, ln, { 'font-size': 21, 'font-weight': 700, fill: P.ink }) });
  ctx.root._reset = function () { pills.forEach(function (q) { q.tg.style.opacity = '' }) };
  ctx.root._hook = function (root) { if (h.RM()) return 0; var end = 0;
    pills.forEach(function (q, i) { var d = 300 + i * 320; q.r.animate([{ fill: q.from }, { fill: q.from, offset: .01 }, { fill: q.to }], { duration: 520, delay: d, easing: 'ease-in-out', fill: 'both' });
      q.r.style.transformBox = 'fill-box'; q.r.style.transformOrigin = '50% 50%'; q.r.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07,.9)', offset: .5 }, { transform: 'scale(1)' }], { duration: 520, delay: d, easing: 'ease-in-out' });
      q.tg.animate([{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1 }], { duration: 520, delay: d, fill: 'both', easing: 'linear' }); end = Math.max(end, d + 520) }); return end };
  ctx.root.setAttribute('data-gap', 300) }

function flip(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), TN = tones(P, dk), B = s.before, A = s.after, px = 20, py = 118, pw = 480, ph = 270, dec = s.dec || 0;
  function pillG(parent, o) { var tn = TN[o.tone] || TN.mid, g = E('g', {}, parent); E('rect', { x: px, y: py, width: pw, height: ph, rx: 96, fill: tn.f }, g);
    T(g, px + pw / 2, py + 96, o.word, { 'font-size': 36, 'font-weight': 700, fill: tn.i, 'text-anchor': 'middle' }); T(g, px + pw / 2, py + 192, o.value, { 'font-size': 84, 'font-weight': 800, fill: tn.i, 'text-anchor': 'middle' }); return g }
  if (s.label) chip(svg, 0, 0, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  var fg = pillG(svg, A); fg.setAttribute('data-key', '지금'); fg.style.transformBox = 'fill-box'; fg.style.transformOrigin = '50% 50%';
  chip(svg, px + pw / 2 - (h.textW('지금 · ' + A.when, 20, 1) + 28) / 2, py + ph + 24, '지금 · ' + A.when, { fs: 20, fill: TN[A.tone].f, ink: TN[A.tone].i, attr: { 'data-at': 1400, 'data-fx': 'fade' } });
  /* 오른쪽 설명 */
  var rx = 600, gx = E('g', { 'data-at': 1300, 'data-fx': 'fade' }, svg);
  [[B, 0, 'before'], [A, 1, 'after']].forEach(function (q) { var o = q[0], i = q[1], tn = TN[o.tone] || TN.mid, x = rx + i * 300, g = E('g', { 'data-key': i ? '지금' : '그때' }, gx);
    E('rect', { x: x, y: 20, width: 268, height: 120, rx: 40, fill: tn.f }, g); T(g, x + 134, 62, o.word, { 'font-size': 20, 'font-weight': 700, fill: tn.i, 'text-anchor': 'middle' }); T(g, x + 134, 112, o.value, { 'font-size': 40, 'font-weight': 800, fill: tn.i, 'text-anchor': 'middle' });
    T(g, x + 134, 168, (i ? '지금 · ' : '그때 · ') + o.when, { 'font-size': 16, fill: P.mute, 'text-anchor': 'middle' }) });
  E('path', { d: 'M' + (rx + 276) + ' 80H' + (rx + 292) + 'm-8-8l8 8-8 8', fill: 'none', stroke: P.cmp, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gx);
  (s.points || []).slice(0, 3).forEach(function (q, i) { var y = 206 + i * 100, g = E('g', { 'data-at': 1700 + i * 260, 'data-fx': 'slide', 'data-dx': 16, 'data-key': q.k }, svg);
    E('rect', { x: rx, y: y, width: 568, height: 86, rx: 12, fill: P.paper, stroke: P.line }, g); E('rect', { x: rx, y: y + 12, width: 5, height: 62, rx: 2, fill: TN[A.tone].f }, g);
    T(g, rx + 24, y + 32, q.k, { 'font-size': 15, fill: P.mute }); T(g, rx + 24, y + 66, q.v, { 'font-size': 24, 'font-weight': 800, fill: P.ink }) });
  ctx.root._reset = function () { var b = ctx.root._bg; if (b) { b.remove(); ctx.root._bg = null } fg.style.opacity = '' };
  ctx.root._done = ctx.root._reset;
  ctx.root._hook = function (root) { if (h.RM()) return 0; var bgG = pillG(svg, B); bgG.style.transformBox = 'fill-box'; bgG.style.transformOrigin = '50% 50%'; root._bg = bgG; fg.style.opacity = 0;
    bgG.animate([{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.05,.7,.1,1)', fill: 'both' });
    var t1 = 1000; (root._tm = root._tm || []).push(setTimeout(function () { var a = bgG.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' });
      a.onfinish = function () { bgG.remove(); root._bg = null; fg.style.opacity = ''; fg.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 380, easing: 'cubic-bezier(.05,.7,.1,1)' }) } }, t1)); return t1 + 700 };
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.pills = function (bd, s, ctx) { var L = s.layout || 'row'; ({ row: row, flip: flip }[L] || row)(bd, s, ctx) };
ECOM.parts.pills.layouts = ['default', 'row', 'flip'];
ECOM.parts.pills.dark = ['default', 'row', 'flip'];
})();
