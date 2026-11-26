/* p_rankroll.js — 순위표(영상 장면 문법). 한 줄씩 채워지는 막대 순위 · 길게 올라가다 멈추는 순위표 · 두 열 순위표. 짚은 행에 노랑 띠.
   기본 DOM = 끝 모습(막대 · 띠 · 멈춘 자리), 자라기 · 올라가기 · 띠 긋기는 _hook 안에서만.
   공통 칸 rows[{name,v,x?,hi?}] (값 큰 순으로 쓸 것 · 순위는 자동) · unit · dec · max · legend
   배치 bars   : 막대 순위 + 오른쪽 풀이 칸(짚은 행 순위 · 값 · 평균과 차이) · 칸 title · cols[이름 열 · 값 열] · side{label,avg}
   배치 scroll : 긴 순위표가 올라가다 짚은 행에서 멈춤 + 오른쪽 전체 위치 그림 · 칸 title · cols[순위,이름,값,덧붙임] · rows[{…,x}]
   배치 two    : 두 열 순위표 · 칸 panels[{title,unit,dec,start,rows[{name,v,hi}]}×2] */
(function () {
'use strict';
var h = ECOM.h, H = h.H, esc = h.esc, YEL = '#FFE066', INK = '#1D2521';
if (!document.getElementById('p-rankroll-css')) { var st = document.createElement('style'); st.id = 'p-rankroll-css';
  st.textContent = [
    '.rr-hd{display:flex;align-items:center;gap:12px;font-size:16px;font-weight:700;border-bottom:2px solid currentColor;box-sizing:border-box}',
    '.rr-row{position:relative;display:flex;align-items:center;box-sizing:border-box;border-bottom:1px solid rgba(128,140,134,.28);background:rgba(128,140,134,.055);font-size:18px}',
    '.rr-row>*{position:relative;z-index:1}',
    '.rr-band{position:absolute!important;z-index:0!important;left:-8px;right:-8px;top:3px;bottom:3px;border-radius:6px;background:' + YEL + '}',
    '.rr-n{flex:0 0 64px;text-align:center;font-weight:800;font-variant-numeric:tabular-nums}',
    '.rr-nm{flex:0 0 176px;font-weight:700;letter-spacing:-.01em;white-space:nowrap}',
    '.rr-tr{flex:1;display:flex;align-items:center;min-width:0}',
    '.rr-bar{display:block;height:20px;border-radius:2px;flex:0 0 auto}',
    '.rr-v{margin-left:10px;font-size:18px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.rr-cell{font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.rr-pn{position:absolute;box-sizing:border-box;border-radius:6px;padding:24px 26px;display:flex;flex-direction:column}',
    '.rr-pn small{font-size:16px;font-weight:700}',
    '.rr-pn .nm{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-top:6px}',
    '.rr-pn .big{font-size:68px;line-height:1.05;font-weight:800;letter-spacing:-.03em;margin-top:6px;font-variant-numeric:tabular-nums}',
    '.rr-pn .big u{text-decoration:none;font-size:20px;font-weight:700;margin-left:6px}',
    '.rr-pn p{margin:10px 0 0;font-size:16px;line-height:1.5}',
    '.rr-lg{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;margin-top:auto}',
    '.rr-lg span{display:flex;align-items:center;gap:8px}.rr-lg i{display:inline-block;width:24px;height:12px;border-radius:2px;flex:0 0 auto}',
    '.rr-ttl{display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;letter-spacing:-.01em;box-sizing:border-box}'
  ].join(''); document.head.appendChild(st) }

function hook(ctx, items) { ctx.root._hook = function () { if (h.RM()) return 0; var end = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, it.at + it.ms) }); return end } }
var GROW = [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }];
var FADE = [{ opacity: 0 }, { opacity: 1 }];
function fmt(v, s) { return h.nf(v, s.dec == null ? 0 : s.dec) + (s.unit || '') }
function maxOf(rows, s) { return s.max || Math.max.apply(null, rows.map(function (r) { return Math.abs(r.v) })) || 1 }
function legendBox(items, P, row) { return '<div class="rr-lg" style="color:' + P.sub + (row ? ';flex-direction:row;gap:26px;margin-top:0' : '') + '">' + items.map(function (t) { return '<span><i style="background:' + t[0] + (t[2] ? ';border:1px solid ' + t[2] : '') + '"></i>' + esc(t[1]) + '</span>' }).join('') + '</div>' }
function hiOf(rows) { var k = -1; rows.forEach(function (r, i) { if (r.hi && k < 0) k = i }); return k }

/* ── bars ── */
function bars(bd, s, ctx) { var P = ctx.P, rows = s.rows || [], n = rows.length, cols = s.cols || ['국가', '값'], mx = maxOf(rows, s), items = [], rh = Math.min(50, Math.floor((512 - 46) / Math.max(1, n))), LW = 840;
  var L = H('div', null, null, bd, 'position:absolute;left:0;top:0;width:' + LW + 'px;height:512px;color:' + P.ink);
  H('div', 'rr-hd', '<span style="flex:0 0 64px;text-align:center">순위</span><span style="flex:0 0 176px">' + esc(cols[0]) + '</span><span style="flex:1">' + esc(cols[1] || '') + '</span>', L, 'height:46px;color:' + P.sub);
  rows.forEach(function (r, i) { var hi = !!r.hi, w = (Math.abs(r.v) / mx * 100).toFixed(2);
    var e = H('div', 'rr-row', (hi ? '<i class="rr-band"></i>' : '') + '<span class="rr-n">' + (i + 1) + '</span><span class="rr-nm">' + esc(r.name) + '</span><span class="rr-tr"><i class="rr-bar" style="width:calc((100% - 96px) * ' + (w / 100) + ');background:' + (hi ? P.main : P.g40) + '"></i><b class="rr-v">' + fmt(r.v, s) + '</b></span>', L, 'height:' + rh + 'px;' + (hi ? 'color:' + INK : ''));
    e.setAttribute('data-key', r.name);
    items.push({ el: e.querySelector('.rr-bar'), at: 150 + i * 110, ms: 700, kf: GROW });
    items.push({ el: e.querySelector('.rr-v'), at: 150 + i * 110 + 350, ms: 400, kf: FADE });
    if (hi) items.push({ el: e.querySelector('.rr-band'), at: 150 + n * 110 + 250, ms: 700, kf: GROW }) });
  var k = hiOf(rows), r = rows[k] || rows[0], avg = rows.reduce(function (a, q) { return a + q.v }, 0) / Math.max(1, n), sd = s.side || {};
  var pn = H('div', 'rr-pn', '<small style="color:' + P.mute + '">' + esc(sd.label || '짚은 행') + '</small><div class="nm" style="color:' + P.ink + '">' + esc(r.name) + '</div>'
    + '<div class="big" style="color:' + P.main + '"><span data-count="' + r.v + '" data-dec="' + (s.dec || 0) + '" data-at="' + (150 + n * 110 + 250) + '" data-fx="count" data-ms="900">' + h.nf(r.v, s.dec || 0) + '</span><u>' + esc(s.unit || '') + '</u></div>'
    + '<p style="color:' + P.sub + '"><b style="color:' + P.ink + '">' + n + '개 중 ' + (k + 1) + '위</b>' + (sd.note ? ' · ' + esc(sd.note) : '') + '</p>'
    + '<div style="margin-top:20px;display:flex;flex-direction:column;gap:16px"><div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:' + P.ink + ';margin-bottom:5px"><span>' + esc(r.name) + '</span><span>' + fmt(r.v, s) + '</span></div><u style="display:block;height:16px;border-radius:6px;background:' + P.main + ';width:' + Math.min(100, Math.abs(r.v) / mx * 100).toFixed(1) + '%;text-decoration:none"></u></div>'
    + '<div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:' + P.ink + ';margin-bottom:5px"><span>' + esc(sd.avg || '전체 평균') + '</span><span>' + fmt(avg, s) + '</span></div><u style="display:block;height:16px;border-radius:6px;background:' + P.g40 + ';width:' + Math.min(100, Math.abs(avg) / mx * 100).toFixed(1) + '%;text-decoration:none"></u></div></div>'
    + '<div style="margin-top:20px"><div style="display:flex;gap:4px">' + rows.map(function (q, i) { return '<i style="flex:1;height:24px;border-radius:6px;background:' + (i === k ? YEL : P.g40) + (i === k ? ';outline:1px solid ' + P.ink : '') + '"></i>' }).join('') + '</div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:' + P.sub + ';margin-top:5px"><span>1위</span><span>' + n + '위</span></div></div>'
    + legendBox([[YEL, '노랑 띠 = 짚은 행'], [P.main, '진한 막대 = 짚은 행 값'], [P.g40, '옅은 막대 = 나머지']], P), bd, 'left:' + (LW + 24) + 'px;top:0;width:' + (1168 - LW - 24) + 'px;height:512px;background:' + P.paper + ';border:1px solid ' + P.line);
  pn.setAttribute('data-key', '풀이'); pn.setAttribute('data-at', 150 + n * 110); pn.setAttribute('data-fx', 'fade'); pn.setAttribute('data-ms', 500);
  hook(ctx, items) }

/* ── scroll ── */
function scroll(bd, s, ctx) { var P = ctx.P, rows = s.rows || [], n = rows.length, cols = s.cols || ['순위', '국가', '값', ''], VIS = 10, rh = 46, LW = 860, items = [], k = hiOf(rows);
  var start = Math.max(0, Math.min(n - VIS, k - 6)), mx = maxOf(rows, s);
  var L = H('div', null, null, bd, 'position:absolute;left:0;top:0;width:' + LW + 'px;height:512px;color:' + P.ink);
  H('div', 'rr-hd', '<span style="flex:0 0 64px;text-align:center">' + esc(cols[0]) + '</span><span style="flex:1 1 0;padding-left:12px">' + esc(cols[1]) + '</span><span style="flex:0 0 200px;text-align:right">' + esc(cols[2]) + '</span><span style="flex:0 0 190px;text-align:right;padding-right:16px">' + esc(cols[3] || '') + '</span>', L, 'height:52px;color:' + P.sub);
  var vp = H('div', null, null, L, 'position:relative;overflow:hidden;height:' + (VIS * rh) + 'px'), lst = H('div', null, null, vp, 'position:absolute;left:0;right:0;top:0'), band = null;
  function rowEl(i, top) { var r = rows[i], hi = i === k;
    var e = H('div', 'rr-row', (hi ? '<i class="rr-band"></i>' : '') + '<span class="rr-n" style="flex:0 0 64px">' + (i + 1) + '</span><span class="rr-nm" style="flex:1 1 0;padding-left:12px">' + esc(r.name) + '</span><span class="rr-cell" style="flex:0 0 200px;text-align:right;font-weight:800">' + fmt(r.v, s) + '</span><span class="rr-cell" style="flex:0 0 190px;text-align:right;padding-right:16px;font-size:16px">' + esc(r.x == null ? '' : r.x) + '</span>', lst, (top == null ? '' : 'position:absolute;left:0;right:0;top:' + top + 'px;') + 'height:' + rh + 'px;' + (hi ? 'color:' + INK : 'color:' + (i % 2 ? P.sub : P.ink)));
    e.setAttribute('data-key', r.name); if (hi && top == null) band = e.querySelector('.rr-band'); return e }
  for (var q = start; q < start + VIS; q++) rowEl(q);
  var extra = [];
  if (start > 0) items.push({ el: lst, at: 300, ms: 2200, ease: 'cubic-bezier(.45,0,.25,1)', kf: [{ transform: 'translateY(' + (start * rh) + 'px)' }, { transform: 'translateY(0px)' }] });
  if (band) items.push({ el: band, at: start > 0 ? 2650 : 600, ms: 700, kf: GROW });
  /* 오른쪽 : 전체 위치 그림 */
  var p = Math.min(18, Math.floor((512 - 196) / n)), px = LW + 24, pw = 1168 - px;
  var pn = H('div', 'rr-pn', '<small style="color:' + P.mute + '">전체 ' + n + '개 가운데 보이는 구간</small>', bd, 'left:' + px + 'px;top:0;width:' + pw + 'px;height:512px;background:' + P.paper + ';border:1px solid ' + P.line);
  var mini = H('div', null, null, pn, 'position:relative;margin-top:14px;height:' + (n * p) + 'px');
  rows.forEach(function (r, i) { var hi = i === k, lab = (i === 0 || i === n - 1 || hi) ? (i + 1) + '위' : '';
    H('div', null, '<span style="flex:0 0 40px;font-size:13px;font-weight:700;color:' + (hi ? P.ink : P.mute) + '">' + lab + '</span><i style="display:block;height:' + Math.max(6, p - 5) + 'px;border-radius:2px;width:' + (Math.abs(r.v) / mx * (pw - 52 - 50)).toFixed(1) + 'px;background:' + (hi ? YEL : P.g40) + (hi ? ';outline:1px solid ' + P.ink : '') + '"></i>', mini, 'height:' + p + 'px;display:flex;align-items:center') });
  var fr = H('div', null, null, mini, 'position:absolute;left:-6px;right:-6px;top:' + (start * p - 2) + 'px;height:' + (VIS * p + 4) + 'px;border:2px solid ' + P.main + ';border-radius:6px;box-sizing:border-box;pointer-events:none');
  if (start > 0) items.push({ el: fr, at: 300, ms: 2200, ease: 'cubic-bezier(.45,0,.25,1)', kf: [{ transform: 'translateY(' + (-start * p) + 'px)' }, { transform: 'translateY(0px)' }] });
  pn.insertAdjacentHTML('beforeend', legendBox([['transparent', '테두리 = 지금 화면에 보이는 구간', P.main], [YEL, '노랑 = 짚은 행'], [P.g40, '막대 길이 = 값 크기']], P));
  pn.setAttribute('data-key', '위치'); pn.setAttribute('data-at', 0); pn.setAttribute('data-fx', 'fade'); pn.setAttribute('data-ms', 500);
  hook(ctx, items); var h0 = ctx.root._hook;
  ctx.root._hook = function (root) { if (!h.RM()) for (var i = 0; i < start; i++) extra.push(rowEl(i, (i - start) * rh)); return h0(root) };
  ctx.root._done = function () { extra.forEach(function (e) { if (e.parentNode) e.parentNode.removeChild(e) }); extra.length = 0 } }

/* ── two ── */
function two(bd, s, ctx) { var P = ctx.P, ps = (s.panels || []).slice(0, 2), items = [], PW = 572, nn = Math.max.apply(null, ps.map(function (q) { return (q.rows || []).length })) || 1, rh = Math.min(46, Math.floor((512 - 52 - 34) / nn));
  ps.forEach(function (q, pi) { var rows = q.rows || [], mx = maxOf(rows, q), x0 = pi * (PW + 24), st = q.start || 1, t0 = pi * 900;
    var pc = H('div', null, null, bd, 'position:absolute;left:' + x0 + 'px;top:0;width:' + PW + 'px;height:' + (52 + nn * rh) + 'px;color:' + P.ink + ';background:' + P.paper + ';border:1px solid ' + P.line + ';border-radius:6px;overflow:hidden');
    pc.setAttribute('data-key', q.title || ''); pc.setAttribute('data-at', t0); pc.setAttribute('data-fx', 'fade'); pc.setAttribute('data-ms', 450);
    H('div', 'rr-ttl', esc(q.title || ''), pc, 'height:52px;background:' + P.dark + ';color:' + (ctx.dark ? '#003D2B' : '#fff'));
    var bx = H('div', null, null, pc, 'padding:0 14px');
    rows.forEach(function (r, i) { var hi = !!r.hi, w = Math.abs(r.v) / mx;
      var e = H('div', 'rr-row', (hi ? '<i class="rr-band" style="left:-6px;right:-6px"></i>' : '') + '<span class="rr-n" style="flex:0 0 50px;font-size:16px">' + (st + i) + '</span><span class="rr-nm" style="flex:1 1 0;font-size:16px">' + esc(r.name) + '</span><span class="rr-tr" style="flex:0 0 250px;justify-content:flex-end"><i class="rr-bar" style="width:' + (w * 150).toFixed(1) + 'px;height:14px;background:' + (hi ? P.main : P.g40) + ';transform-origin:100% 50%"></i><b class="rr-v" style="flex:0 0 86px;text-align:right;font-size:16px">' + h.nf(r.v, q.dec || 0) + esc(q.unit || '') + '</b></span>', bx, 'height:' + rh + 'px;' + (hi ? 'color:' + INK : ''));
      e.setAttribute('data-key', (q.title || '') + ' ' + r.name);
      items.push({ el: e.querySelector('.rr-bar'), at: t0 + 300 + i * 90, ms: 650, kf: [{ transform: 'scaleX(0)', transformOrigin: '100% 50%' }, { transform: 'scaleX(1)', transformOrigin: '100% 50%' }] });
      if (hi) items.push({ el: e.querySelector('.rr-band'), at: t0 + 300 + rows.length * 90 + 150, ms: 700, kf: GROW }) }) });
  var lg = H('div', null, legendBox([[YEL, '노랑 띠 = 짚은 행'], [P.main, '진한 막대 = 짚은 행 값'], [P.g40, '옅은 막대 = 나머지']], P, 1), bd, 'position:absolute;left:0;top:' + (52 + nn * rh + 12) + 'px;width:1168px');
  lg.setAttribute('data-at', 1800); lg.setAttribute('data-fx', 'fade');
  hook(ctx, items) }

ECOM.parts.rankroll = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'bars';
  ({ bars: bars, scroll: scroll, two: two }[L] || bars)(bd, s, ctx); ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.rankroll.layouts = ['default', 'bars', 'scroll', 'two'];
ECOM.parts.rankroll.dark = ['default', 'bars', 'scroll', 'two'];
})();
