/* axis — 가운데 축 비교(CW44 7쪽 · Kick-off 10쪽) : 가운데 기준 열 → 양쪽 판이 바깥으로 펼침 → 줄 → 예시 → 결론
   center{title} · left/right{title,def,sub,badge:'up|down|none|글자',tone} · rows[{label,left,right}]
   examples{label:'예시', left:{lead,items:[{k,v}],concl}, right:{…}} · result{left,right}(예시 없을 때 아래 띠) · beats[{spot:'left|right'}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, K = ECOM.kx;
/* ───── 배치(layout) ─────
   default : 아래 기본 그림(바뀌지 않음)
   scale   : 좌우 저울 — 가운데 받침 · 기울어진 저울대, 양쪽 접시(카드)에 제목 · 정의 · 줄별 내용.
             더 받는 칸 tilt{side:'left|right', text} = 어느 쪽이 더 무거운지 + 이유 한 줄(없으면 수평). 결과 띠 = result 또는 examples concl
   bars    : 겹친 막대 — 줄마다 왼쪽 값 · 오른쪽 값 막대가 가운데 줄 이름표에서 좌우로 뻗음. 값 = 줄 글 안 첫 숫자(줄마다 큰 쪽을 가득 채움)
             더 받는 칸 rows[i].lv · rows[i].rv(숫자) = 글에서 못 읽을 때 직접 지정
   overlay : 두 시기 겹친 선 — 줄마다 한 줄 위에 두 값을 점 둘 + 잇는 선으로 겹침(시계열 칸이 없어 항목 축). 값 읽기는 bars 와 같음, 오른쪽에 큰 쪽 ÷ 작은 쪽 배수.
             더 받는 칸 rows[i].lv · rows[i].rv
   cards   : 카드 두 장 — 큰 카드 둘이 마주 보고 가운데 「vs」 원, 위에 가운데 제목. 카드 머리 = 제목 · 정의, 몸 = 줄 이름 + 글, 아래 = 결과 */
var LAY = {}, E = h.E, T = h.T;
function plain(s) { return String(s == null ? '' : s).replace(/\*\*/g, '') }
function numOf(s) { var m = /-?\d[\d,]*(\.\d+)?/.exec(plain(s)); return m ? parseFloat(m[0].replace(/,/g, '')) : null }
function tone(P, o, right) { var t = o.tone || (right ? 'cmp' : 'main'); return P[t] || h.col(t) }
function toneDk(P, o, right) { return o.tone ? tone(P, o, right) : (right ? P.cmp : P.dark) }
function endText(s, k) { var r = s.result || s.concl, ex = s.examples; if (r && (k ? r.right : r.left)) return k ? r.right : r.left; var e = ex && (k ? ex.right : ex.left); return e && e.concl ? e.concl : '' }
function vals(r) { var l = r.lv != null ? r.lv : numOf(r.left), q = r.rv != null ? r.rv : numOf(r.right); return [l, q] }
function pill(P, c, txt, extra) { return '<span style="display:inline-block;background:' + c + ';color:#fff;border-radius:6px;padding:3px 10px;font-size:13px;font-weight:700;' + (extra || '') + '">' + h.esc(txt) + '</span>' }

LAY.scale = function (bd, s, ctx) { var P = ctx.P, K = ECOM.kx, L = s.left || {}, R = s.right || {}, rows = s.rows || [], cen = s.center || {}, tl = s.tilt || {}, sd = tl.side === 'left' ? 1 : tl.side === 'right' ? -1 : 0;
  var svg = ctx.svg(512), M = 584, by = 54, dy = sd ? 20 : 0, cw = 508, xl = 8, xr = 1168 - 8 - cw, cl = xl + cw / 2, cr = xr + cw / 2, H = 372;
  var yl = by + sd * dy, yr = by - sd * dy, tlTop = yl + 62, trTop = yr + 62;
  var g1 = h.lv(svg, 1);
  E('rect', { x: M - 8, y: by, width: 16, height: 490 - by, fill: P.g40 }, g1); E('path', { d: 'M' + (M - 62) + ' 508 L' + (M - 40) + ' 480 H' + (M + 40) + ' L' + (M + 62) + ' 508 Z', fill: P.dark }, g1);
  var gb = h.lv(svg, 1, { 'data-fx': 'zoom', 'data-ms': 520 }); E('line', { x1: cl, y1: yl, x2: cr, y2: yr, stroke: P.dark, 'stroke-width': 10, 'stroke-linecap': 'round' }, gb); E('circle', { cx: M, cy: by, r: 15, fill: P.dark }, gb); E('circle', { cx: M, cy: by, r: 5.5, fill: '#fff' }, gb);
  var cb = E('g', { 'data-b': 1, 'data-fx': 'pop' }, svg), cwid = Math.min(128, 40 + h.textW(cen.title || '', 15, true)), lines = h.wrap(cen.title || '', 15, 112, true).slice(0, 3);
  if (cen.title) { E('rect', { x: M - 64, y: 250, width: 128, height: 26 + lines.length * 20, rx: 12, fill: P.dark }, cb); lines.forEach(function (t, j) { T(cb, M, 276 + j * 20 - 6 + 0, t, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff' }) }) }
  var gs = h.lv(svg, 2); [[cl, yl, tlTop], [cr, yr, trTop]].forEach(function (a) { [-150, 150].forEach(function (o) { E('line', { x1: a[0], y1: a[1], x2: a[0] + o, y2: a[2], stroke: P.dark, 'stroke-width': 2 }, gs) }); E('circle', { cx: a[0], cy: a[1], r: 6, fill: '#fff', stroke: P.dark, 'stroke-width': 3 }, gs) });
  [[L, 0, xl, tlTop, cl], [R, 1, xr, trTop, cr]].forEach(function (a) { var o = a[0], k = a[1], x = a[2], top = a[3], c = tone(P, o, k), dk = toneDk(P, o, k), res = endText(s, k);
    var cd = K.D(bd, 'kx', x, top, cw, H, null, { 'data-b': 2, 'data-fx': 'drop', 'data-dy': 90, 'data-ms': 700, 'data-key': o.title });
    cd.style.cssText += ';border-radius:6px;background:' + (k ? P.paper : P.g08) + ';border:1.5px solid ' + (k ? P.light : P.g40) + ';padding:18px 24px 16px;display:flex;flex-direction:column;overflow:hidden';
    var hd = '<div style="font-size:26px;font-weight:700;letter-spacing:-.01em;color:' + dk + ';line-height:1.25">' + h.esc(o.title || '') + '</div>' + (o.def ? '<div style="font-size:16px;font-weight:700;color:' + P.ink + ';margin-top:4px;line-height:1.35">' + h.md(o.def) + '</div>' : '') + (o.sub ? '<div style="font-size:13px;color:' + P.mute + ';margin-top:3px;line-height:1.4">' + h.md(o.sub) + '</div>' : '');
    var rw = rows.map(function (r, i) { return '<div style="flex:1;min-height:0;display:flex;align-items:center;gap:12px;border-top:1px dashed ' + P.axis + '"><div style="flex:0 0 84px;font-size:13px;font-weight:700;color:' + dk + '">' + h.esc(r.label || '') + '</div><div style="flex:1;font-size:16px;font-weight:600;color:' + P.ink + ';line-height:1.4">' + h.md(k ? r.right : r.left) + '</div></div>' }).join('');
    cd.innerHTML = hd + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;margin-top:10px">' + rw + '</div>' + (res ? '<div data-b="3" data-fx="pop" style="margin-top:10px;background:' + dk + ';color:#fff;border-radius:6px;padding:10px 16px;font-size:16px;font-weight:700;line-height:1.4;text-align:center">' + h.md(res) + '</div>' : '') });
  if (tl.text && sd) { var tg = E('g', { 'data-b': 3, 'data-fx': 'pop' }, svg), tw = Math.min(440, h.textW(tl.text, 14, true) + 34), hx = sd > 0 ? M - tw / 2 - 150 : M + tw / 2 + 150; hx = M; E('rect', { x: hx - tw / 2, y: 2, width: tw, height: 28, rx: 14, fill: sd > 0 ? tone(P, L, 0) : tone(P, R, 1) }, tg); T(tg, hx, 21, tl.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' }) }
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

/* 막대 · 점선 공통 머리 : 양쪽 제목 · 정의 + 가운데 제목 */
function head2(bd, P, s, K, w) { var L = s.left || {}, R = s.right || {};
  [[L, 0], [R, 1]].forEach(function (a) { var o = a[0], k = a[1], x = k ? 1168 - w : 0, d = K.D(bd, 'kx', x, 0, w, 84, null, { 'data-b': 1, 'data-fx': k ? 'left' : 'right', 'data-key': o.title });
    d.style.cssText += ';border-bottom:4px solid ' + tone(P, o, k) + ';display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:8px;text-align:' + (k ? 'left' : 'right');
    d.innerHTML = '<div style="font-size:26px;font-weight:700;color:' + toneDk(P, o, k) + ';line-height:1.2">' + h.esc(o.title || '') + '</div>' + (o.def ? '<div style="font-size:16px;font-weight:600;color:' + P.sub + ';margin-top:3px">' + h.md(o.def) + '</div>' : '') }) }

LAY.bars = function (bd, s, ctx) { var P = ctx.P, K = ECOM.kx, L = s.left || {}, R = s.right || {}, rows = s.rows || [], cen = s.center || {}, svg = ctx.svg(512), cwid = 212, cx0 = 584 - cwid / 2, cx1 = 584 + cwid / 2, half = cx0 - 8, maxL = half - 30;
  head2(bd, P, s, K, half); var ry = 112, resH = endText(s, 0) || endText(s, 1) ? 62 : 0, rh = (512 - ry - resH - (resH ? 10 : 0)) / Math.max(1, rows.length), bh = Math.min(50, rh - 22);
  var ct = K.D(bd, 'kx', cx0, 6, cwid, 74, null, { 'data-b': 1, 'data-fx': 'pop' }); ct.style.cssText += ';display:flex;align-items:center;justify-content:center;text-align:center;font-size:16px;font-weight:700;color:' + P.ink + ';line-height:1.35;padding:0 10px'; ct.innerHTML = h.esc(cen.title || '');
  var gz = h.lv(svg, 1); E('line', { x1: 584, x2: 584, y1: ry - 8, y2: ry + rh * rows.length, stroke: P.axis }, gz);
  rows.forEach(function (r, i) { var cy = ry + rh * i + rh / 2, v = vals(r), mx = Math.max(v[0] || 0, v[1] || 0, 1e-9), lc = tone(P, L, 0), rc = tone(P, R, 1), g = E('g', { 'data-key': r.label }, svg);
    E('line', { x1: 16, x2: 1152, y1: ry + rh * i, y2: ry + rh * i, stroke: P.grid }, gz);
    var lab = K.D(bd, 'kx', cx0, cy - 21, cwid, 42, h.esc(r.label || ''), { 'data-b': 2, 'data-fx': 'pop', 'data-at': i * 70 }); lab.style.cssText += ';display:flex;align-items:center;justify-content:center;text-align:center;font-size:16px;font-weight:700;color:' + P.ink + ';background:#fff;border:1px solid ' + P.line + ';border-radius:6px;line-height:1.3';
    [[v[0], 0, r.left, lc], [v[1], 1, r.right, rc]].forEach(function (a) { var val = a[0], k = a[1], txt = plain(a[2]), c = a[3], len = val == null ? 0 : Math.max(10, maxL * val / mx), x0 = k ? cx1 : cx0, tw = h.textW(txt, 15, true), inside = len >= tw + 26, bx = k ? x0 : x0 - len;
      var bg = E('g', { 'data-b': 3, 'data-fx': 'growx', 'data-o': k ? '0% 50%' : '100% 50%', 'data-at': i * 70, 'data-ms': 520 }, svg); if (len) E('rect', { x: bx, y: cy - bh / 2, width: len, height: bh, rx: 6, fill: c }, bg);
      var tg = E('g', { 'data-b': 3, 'data-fx': 'fade', 'data-at': 320 + i * 70 }, svg), tx = inside ? (k ? x0 + 14 : x0 - 14) : (k ? x0 + len + 10 : x0 - len - 10);
      T(tg, tx, cy + 5.5, txt, { 'text-anchor': k ? 'start' : 'end', 'font-size': 15, 'font-weight': 700, fill: inside ? '#fff' : P.ink }) }) });
  [0, 1].forEach(function (k) { var t = endText(s, k); if (!t) return; var o = k ? R : L, d = K.D(bd, 'kx', k ? cx1 + 8 : 8, 512 - resH, half - 8, resH, h.md(t), { 'data-b': 4, 'data-fx': 'pop' }); d.style.cssText += ';background:' + toneDk(P, o, k) + ';color:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:16px;font-weight:700;line-height:1.4;padding:0 18px' });
  var cap = K.D(bd, 'kx', cx0, 512 - resH, cwid, resH, '막대 길이 = 줄마다 큰 쪽을 100%로', { 'data-b': 4, 'data-fx': 'fade' }); cap.style.cssText += ';display:flex;align-items:center;justify-content:center;text-align:center;font-size:13px;color:' + P.mute + ';line-height:1.4;padding:0 6px';
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

LAY.overlay = function (bd, s, ctx) { var P = ctx.P, u = ECOM.u, L = s.left || {}, R = s.right || {}, rows = s.rows || [], svg = ctx.svg(512), lc = tone(P, L, 0), rc = tone(P, R, 1), tx0 = 262, tx1 = 940, ry = 56, resH = endText(s, 0) || endText(s, 1) ? 58 : 0, rh = (512 - ry - resH - (resH ? 10 : 0)) / Math.max(1, rows.length);
  var gl = h.lv(svg, 1); [[L, lc, 0], [R, rc, 1]].forEach(function (a, j) { var x = tx0 + j * 250, o = a[0]; E('circle', { cx: x + 10, cy: 16, r: 9, fill: a[1] }, gl); T(gl, x + 26, 22, (o.title || '') + (o.def ? ' · ' + plain(o.def) : ''), { 'font-size': 16, 'font-weight': 700, fill: P.ink }) });
  T(gl, 1168, 22, (R.title || '') + ' ÷ ' + (L.title || ''), { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: P.mute });
  E('line', { x1: tx0, x2: tx0, y1: ry, y2: ry + rh * rows.length, stroke: P.axis }, gl);
  rows.forEach(function (r, i) { var cy = ry + rh * i + rh / 2, v = vals(r), g = E('g', { 'data-key': r.label, 'data-b': 2, 'data-fx': 'fade', 'data-at': i * 90 }, svg), mx = Math.max(v[0] || 0, v[1] || 0, 1e-9) * 1.1;
    E('line', { x1: 0, x2: 1168, y1: ry + rh * i, y2: ry + rh * i, stroke: P.grid }, g); h.wrap(r.label || '', 17, 224, true).slice(0, 2).forEach(function (t, j, a) { T(g, 8, cy + 6 + (j - (a.length - 1) / 2) * 21, t, { 'font-size': 17, 'font-weight': 700, fill: P.ink }) });
    E('line', { x1: tx0, x2: tx1, y1: cy, y2: cy, stroke: P.grid, 'stroke-width': 2, 'stroke-dasharray': '2 6' }, g);
    if (v[0] != null && v[1] != null) { var xa = tx0 + (tx1 - tx0) * v[0] / mx, xb = tx0 + (tx1 - tx0) * v[1] / mx;
      var ln = E('line', { x1: xa, x2: xb, y1: cy, y2: cy, stroke: P.g40, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-b': 3, 'data-fx': 'wipe', 'data-at': i * 90, 'data-ms': 520 }, svg);
      var dg = E('g', { 'data-key': r.label, 'data-b': 4, 'data-fx': 'pop', 'data-at': i * 90 }, svg); [[xa, lc, r.left, -1], [xb, rc, r.right, 1]].forEach(function (d, j) { E('circle', { cx: d[0], cy: cy, r: 13, fill: d[1], stroke: '#fff', 'stroke-width': 3 }, dg);
        var t = plain(d[2]), w = h.textW(t, 14.5, true), x = Math.max(w / 2 + 4, Math.min(1168 - w / 2 - 4, d[0])); T(dg, x, j ? cy + 38 : cy - 24, t, { 'text-anchor': 'middle', 'font-size': 14.5, 'font-weight': 700, fill: P.ink }) });
      var ratio = v[0] ? v[1] / v[0] : null; if (ratio != null) { var gr = E('g', { 'data-key': r.label, 'data-b': 5, 'data-fx': 'pop', 'data-at': i * 90 }, svg); E('rect', { x: 982, y: cy - 24, width: 168, height: 48, rx: 12, fill: P.g08, stroke: P.g40 }, gr); T(gr, 1066, cy + 9, h.nf(ratio, ratio >= 10 ? 1 : 2) + '배', { 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: P.dark }) } }
    else { T(g, tx0 + 20, cy + 5, plain(r.left) + '  /  ' + plain(r.right), { 'font-size': 15, fill: P.sub }) } });
  [0, 1].forEach(function (k) { var t = endText(s, k); if (!t) return; var K = ECOM.kx, o = k ? R : L, d = K.D(bd, 'kx', k ? 584 + 6 : 0, 512 - resH, 578, resH, h.md(t), { 'data-b': 6, 'data-fx': 'pop' }); d.style.cssText += ';background:' + toneDk(P, o, k) + ';color:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:16px;font-weight:700;line-height:1.4;padding:0 18px' });
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 80) };

LAY.cards = function (bd, s, ctx) { var P = ctx.P, K = ECOM.kx, L = s.left || {}, R = s.right || {}, rows = s.rows || [], cen = s.center || {}, svg = ctx.svg(512), cw = 570, ty = cen.title ? 40 : 0, H = 512 - ty - 4;
  if (cen.title) { var g = E('g', { 'data-b': 1, 'data-fx': 'fade' }, svg), w = h.textW(cen.title, 16, true) + 36; E('line', { x1: 0, x2: 584 - w / 2, y1: 15, y2: 15, stroke: P.axis }, g); E('line', { x1: 584 + w / 2, x2: 1168, y1: 15, y2: 15, stroke: P.axis }, g); T(g, 584, 21, cen.title, { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: P.ink }) }
  [[L, 0], [R, 1]].forEach(function (a) { var o = a[0], k = a[1], x = k ? 1168 - cw : 0, c = tone(P, o, k), dk = toneDk(P, o, k), res = endText(s, k);
    var cd = K.D(bd, 'kx', x, ty, cw, H, null, { 'data-b': 1, 'data-fx': k ? 'left' : 'right', 'data-ms': 560, 'data-key': o.title });
    cd.style.cssText += ';border-radius:6px;background:' + (k ? P.paper : P.g08) + ';border:1.5px solid ' + (k ? P.light : P.g40) + ';overflow:hidden;display:flex;flex-direction:column';
    var pad = k ? '20px 26px 0 52px' : '20px 52px 0 26px';
    cd.innerHTML = '<div style="background:' + dk + ';color:#fff;padding:' + (k ? '16px 26px 14px 52px' : '16px 52px 14px 26px') + '"><div style="font-size:26px;font-weight:700;letter-spacing:-.01em;line-height:1.2">' + h.esc(o.title || '') + '</div>' + (o.def ? '<div style="font-size:16px;font-weight:600;color:rgba(255,255,255,.9);margin-top:5px;line-height:1.35">' + h.md(o.def) + '</div>' : '') + '</div>'
      + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;padding:' + (k ? '6px 26px 0 52px' : '6px 52px 0 26px') + '">' + rows.map(function (r) { return '<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:2px;border-top:1px solid ' + P.line + '"><div style="font-size:13px;font-weight:700;color:' + dk + '">' + h.esc(r.label || '') + '</div><div style="font-size:16px;font-weight:600;color:' + P.ink + ';line-height:1.4">' + h.md(k ? r.right : r.left) + '</div></div>' }).join('') + '</div>'
      + (res ? '<div data-b="3" data-fx="pop" style="margin:0 18px 16px ' + (k ? '44px' : '18px') + ';margin-right:' + (k ? '18px' : '44px') + ';background:#fff;border:2px solid ' + dk + ';color:' + dk + ';border-radius:6px;padding:10px 16px;font-size:16px;font-weight:700;line-height:1.4;text-align:center">' + h.md(res) + '</div>' : '') });
  var vd = K.D(bd, 'kx', 584 - 42, ty + H / 2 - 42, 84, 84, 'vs', { 'data-b': 2, 'data-fx': 'pop', 'data-ms': 420 }); vd.style.cssText += ';border-radius:50%;background:#fff;border:4px solid ' + P.dark + ';color:' + P.dark + ';display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;letter-spacing:-.02em';
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 70) };

/* gap 격차 눈금 : 공통 눈금자 위에 두 값을 삼각 표시로 얹고, 사이 구간을 칠해 격차를 크게 보임. 양쪽 위 카드 = 두 값의 이름 · 값 · 풀이
   칸 gap{a:{title,value,sub},b:{…},min,max,step,unit,dec(눈금 소수),vdec(값 소수),label('격차'),gapText(직접 쓸 격차 글),bar(아래 띠 한 줄)} — 눈금은 min~max 한 줄 */
LAY.gap = function (bd, s, ctx) { var P = ctx.P, ON = ctx.dark ? P.bg : '#fff', svg = ctx.svg(512), G = s.gap || {}, A = G.a || {}, B = G.b || {}, mn = G.min != null ? G.min : 0, mx = G.max, st = G.step || (mx - mn) / 5, u = G.unit || '', dec = G.dec || 0;
  var X0 = 70, X1 = 1098, X = function (v) { return X0 + (X1 - X0) * (v - mn) / (mx - mn) }, RY = 268, xa = X(A.value), xb = X(B.value), lo = Math.min(xa, xb), hi = Math.max(xa, xb), gv = Math.abs(B.value - A.value), cA = P.main, cB = P.cmp;
  E('rect', { x: X0, y: RY, width: X1 - X0, height: 26, rx: 5, fill: P.g18, 'data-at': 0, 'data-fx': 'wipe', 'data-ms': 700 }, svg);
  var tk = E('g', { 'data-at': 200, 'data-fx': 'fade', 'data-ms': 500 }, svg);
  for (var v = mn; v <= mx + st / 1e6; v += st) { var x = X(v); E('line', { x1: x, x2: x, y1: RY, y2: RY + 34, stroke: P.axis, 'stroke-width': 1.5 }, tk); T(tk, x, RY + 54, h.nf(v, dec) + (v === mn ? u : ''), { 'text-anchor': 'middle', 'font-size': 14, fill: P.mute }) }
  E('rect', { x: lo, y: RY, width: hi - lo, height: 26, rx: 3, fill: P.g65, 'data-at': 1200, 'data-fx': 'growx', 'data-o': (xa <= xb ? '0%' : '100%') + ' 50%', 'data-ms': 800 }, svg);
  var cw = 400, ch = 188;
  [[A, xa, cA, 0, 500], [B, xb, cB, 1, 900]].forEach(function (a) { var o = a[0], x = a[1], c = a[2], k = a[3], at = a[4], cx = k ? 1168 - cw : 0, bx = cx + cw / 2;
    var tri = E('path', { d: 'M' + (x - 12) + ' ' + (RY - 28) + ' H' + (x + 12) + ' L' + x + ' ' + (RY - 5) + ' Z', fill: c, 'data-key': o.title || '', 'data-at': k ? 1000 : at, 'data-fx': k ? 'slide' : 'pop', 'data-dx': k ? xa - xb : 0, 'data-dy': 0, 'data-ms': 800 }, svg);
    E('path', { d: 'M' + x + ' ' + (RY - 30) + ' V' + (ch + 24) + ' H' + bx + ' V' + (ch + 2), fill: 'none', stroke: c, 'stroke-width': 2, 'data-at': at + 200, 'data-fx': 'draw', 'data-ms': 600 }, svg);
    var g = E('g', { 'data-key': o.title || '', 'data-at': at, 'data-fx': 'rise', 'data-ms': 520 }, svg);
    E('rect', { x: cx, y: 0, width: cw, height: ch, rx: 16, fill: P.paper, stroke: P.line, 'stroke-width': 1.5 }, g); E('rect', { x: cx + 22, y: 24, width: 16, height: 16, rx: 4, fill: c }, g);
    T(g, cx + 48, 38, o.title || '', { 'font-size': fit2(o.title || '', 24, 16, cw - 72), 'font-weight': 700, fill: P.ink });
    var vd = G.vdec != null ? G.vdec : dec, vt = h.nf(o.value, vd), nw = h.textW(vt, 62, 1); T(g, cx + 22, 112, vt, { 'font-size': 62, 'font-weight': 700, fill: c === P.cmp ? P.ink : P.main, 'data-fx': 'count', 'data-count': +o.value, 'data-dec': vd, 'data-ms': 1000 }); if (u) T(g, cx + 22 + nw + 8, 112, u, { 'font-size': 22, 'font-weight': 700, fill: P.sub });
    h.wrap(o.sub || '', 14.5, cw - 44, 0).slice(0, 2).forEach(function (t, j) { T(g, cx + 22, 148 + j * 20, t, { 'font-size': 14.5, fill: P.sub }) }) });
  var by = RY + 76, gg = E('g', { 'data-at': 1900, 'data-fx': 'fade', 'data-ms': 500 }, svg);
  E('path', { d: 'M' + lo + ' ' + (by - 9) + ' V' + by + ' H' + hi + ' V' + (by - 9), fill: 'none', stroke: P.dark, 'stroke-width': 3, 'stroke-linejoin': 'round' }, gg);
  var gt = G.gapText || (h.nf(gv, G.vdec != null ? G.vdec : dec) + u), mid = Math.max(130, Math.min(1038, (lo + hi) / 2)); T(gg, mid, by + 46, gt, { 'text-anchor': 'middle', 'font-size': 50, 'font-weight': 700, fill: P.dark });
  T(gg, mid, by + 70, G.label || '두 값의 격차', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: P.mute });
  if (G.bar) { var nb = K.D(bd, 'kx', 0, 456, 1168, 52, '', { 'data-at': 2400, 'data-fx': 'rise', 'data-ms': 500 }); nb.style.cssText += ';display:flex;align-items:center;padding:0 24px;border-radius:6px;background:' + P.dark + ';color:' + ON + ';font-size:16px;font-weight:700;line-height:1.4'; nb.innerHTML = '<span>' + h.md(G.bar).replace(/<b>/g, '<b style="color:' + ON + '">') + '</span>' }
  T(svg, 0, 448, '▼ = 눈금 위 두 값의 자리 · 눈금 위 진한 구간 = 격차', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute, 'data-at': 2000, 'data-fx': 'fade' }) };
function fit2(t, z, mn, w) { while (z > mn && h.textW(t, z, 1) > w) z -= .5; return z }

function badge(b, right, col) { if (b === 'none') return ''; var tri = right ? '<path d="M120 0 H6 L120 94 Z" fill="' + col + '"/>' : '<path d="M0 0 H114 L0 94 Z" fill="' + col + '"/>';
  var ix = right ? 86 : 34, iy = 32, g;
  if (!b || b === 'up' || b === 'down') { var up = b !== 'down', x0 = ix - 13, x1 = ix + 13, y0 = up ? iy + 13 : iy - 13, y1 = up ? iy - 13 : iy + 13;
    g = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M' + (x1 - 12) + ' ' + y1 + ' H' + x1 + ' V' + (up ? y1 + 12 : y1 - 12) + '" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' }
  else g = '<text x="' + ix + '" y="' + (iy + 8) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">' + h.esc(b) + '</text>';
  return tri + g }
ECOM.parts.axis = function (bd, s, ctx) { if (s.layout && LAY[s.layout]) return LAY[s.layout](bd, s, ctx);
  var root = ctx.root, W = 1168, CW = 156, c0 = (W - CW) / 2, c1 = c0 + CW, M = W / 2, PAD = 24, BW = 104;
  var L = s.left || {}, R = s.right || {}, rows = s.rows || [], cen = s.center || {}, ex = s.examples || null, cc = s.result || s.concl || null;
  var hasEx = !!(ex && (ex.left || ex.right)), hasCc = !hasEx && !!(cc && (cc.left || cc.right)), tw = c0 - PAD * 2;
  // 머리 높이 : 정의 · 보조 줄 수에 맞춤(바깥 모서리 표지 자리 비움)
  var hw = c0 - PAD - BW, hl = [L, R].map(function (o) { return 34 + K.lines(o.def, 16, hw - 4, 1) * 23 + (o.sub ? K.lines(o.sub, 13.5, hw - 4) * 20 + 4 : 0) });
  var HH = Math.max(108, Math.max.apply(null, hl) + 26);
  var rh = rows.map(function (r) { var n = Math.max(K.lines(r.left, 15, tw - 30, 1), K.lines(r.right, 15, tw - 30, 1), K.lines(r.label, 15, CW - 24, 1)); return Math.max(46, n * 22 + 20) });
  var rowsH = K.sum(rh);
  if (!hasEx) { var room = 512 - HH - rowsH - (hasCc ? 76 : 8); if (room > 0) { var add = Math.min(room / Math.max(1, rows.length), 46); rh = rh.map(function (v) { return v + add }); rowsH = K.sum(rh) } }
  var y = HH, ys = rh.map(function (v) { var a = y; y += v; return a }), rEnd = HH + rowsH, exTop = rEnd + 20, grp = [[], []];
  // 양쪽 판(바깥으로 펼침) — 판 · 머리 · 표지
  [L, R].forEach(function (o, k) { var right = k === 1, tone = h.col(o.tone || (right ? 'cmp' : 'main'));
    var p = K.D(bd, 'kx k-axp' + (right ? ' r' : ''), right ? M : 0, 0, M, 512, null, { 'data-b': 2, 'data-fx': right ? 'left' : 'right', 'data-ms': 560 });
    p.innerHTML = '<svg width="120" height="96" viewBox="0 0 120 96" style="position:absolute;top:0;' + (right ? 'right:0' : 'left:0') + '">' + badge(o.badge, right, tone) + '</svg>'
      + '<div class="k-axh" style="left:' + (right ? c1 - M + PAD : BW) + 'px;width:' + hw + 'px;text-align:' + (right ? 'left' : 'right') + '">'
      + '<div class="k-axt" style="color:' + (right ? (o.tone ? tone : C.cmp) : C.dark) + '">' + h.esc(o.title || '') + '</div>'
      + (o.def ? '<div class="k-axd">' + h.md(o.def) + '</div>' : '') + (o.sub ? '<div class="k-axs">' + h.md(o.sub) + '</div>' : '') + '</div>';
    grp[k].push(p) });
  // 가운데 기준 열(먼저)
  var stB = hasEx ? exTop + 40 : rEnd + 10, st = K.D(bd, 'kx k-axc', c0, 8, CW, stB - 8, null, { 'data-b': 1, 'data-fx': 'fade', 'data-ms': 420 });
  K.D(st, 'kx k-axct', 0, 0, CW, HH - 8, h.esc(cen.title || ''), { 'data-b': 1, 'data-fx': 'pop' });
  rows.forEach(function (r, i) { var last = i === rows.length - 1;
    K.D(st, 'kx k-axl', 0, ys[i] - 8, CW, rh[i], h.esc(r.label || ''), { 'data-b': 1, 'data-fx': 'pop' });
    grp[0].push(K.D(bd, 'kx k-axr' + (last ? ' last' : ''), PAD, ys[i], c0 - PAD, rh[i], '<span>' + h.md(r.left || '') + '</span>', { 'data-b': 3, 'data-fx': 'right' }));
    grp[1].push(K.D(bd, 'kx k-axr r' + (last ? ' last' : ''), c1, ys[i], W - PAD - c1, rh[i], '<span>' + h.md(r.right || '') + '</span>', { 'data-b': 3, 'data-fx': 'left' })) });
  // 예시
  if (hasEx) { K.D(st, 'kx k-axx', (CW - 72) / 2, exTop - 8 + 4, 72, 30, h.esc(ex.label || '예시'), { 'data-b': 4, 'data-fx': 'pop' });
    [ex.left, ex.right].forEach(function (e, k) { if (!e) return; var x = k ? c1 + 14 : 18, w = k ? W - 18 - x : c0 - 14 - 18;
      var html = (e.lead ? '<div class="k-axel">' + h.md(e.lead) + '</div>' : '') + (e.items && e.items.length ? '<div class="k-axul">' + e.items.map(function (it) {
        return '<div class="k-axli">' + (it.k ? '<div class="k-axk">' + h.md(it.k) + '</div>' : '') + (it.v ? '<div class="k-axv">' + h.md(it.v) + '</div>' : '') + '</div>' }).join('') + '</div>' : '')
        + (e.concl ? '<div class="k-axec' + (k ? ' r' : '') + '" data-b="5" data-fx="pop">' + h.md(e.concl) + '</div>' : '');
      grp[k].push(K.D(bd, 'kx k-axe', x, exTop, w, 512 - exTop - 4, html, { 'data-b': 4 })) }) }
  if (hasCc) [cc.left, cc.right].forEach(function (t, k) { if (!t) return; var x = k ? c1 + 14 : 18;
    grp[k].push(K.D(bd, 'kx k-axcc' + (k ? ' r' : ''), x, 512 - 62, k ? W - 18 - x : c0 - 14 - 18, 58, '<span>' + h.md(t) + '</span>', { 'data-b': 5, 'data-fx': 'pop' })) });
  grp.forEach(function (g) { g.forEach(function (e) { e.classList.add('k-dimx') }) });
  root._beat = function (k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? (b.spot === 'right' ? 1 : b.spot === 'left' ? 0 : null) : null;
    grp.forEach(function (g, i) { g.forEach(function (e) { e.classList.toggle('k-dim', sp != null && i !== sp) }) }) };
  root.setAttribute('data-gap', 380); root.setAttribute('data-stg', 70) };
ECOM.parts.axis.layouts = ['default', 'scale', 'bars', 'overlay', 'cards', 'gap'];
ECOM.parts.axis.dark = ['gap'];
})();
