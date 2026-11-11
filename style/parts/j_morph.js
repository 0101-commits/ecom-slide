/* morph — 달 막대가 묶음(분기 · 연)으로 모여 쌓임 : 달 막대 → 묶음 색 → 옆으로 모임 → 위로 쌓여 묶음 합 막대 → 합 · 증감
   labels('YYYY.MM') · data(값 목록 또는 [이름,값]) · group(기본 3) · glabels([[윗줄, 아랫줄]] 묶음 이름, 없으면 분기 · 연 자동) · unit · dec · y{max,step,dec,unit}
   growth(기본 true — 앞 묶음 대비 증감률) · gname('전분기') · beats([{}] 이면 모으기가 바뀜 단계 1 — 없으면 쌓기 안에서 저절로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { var L = [], V = []; (d || []).forEach(function (p) { if (Array.isArray(p)) { L.push(String(p[0])); V.push(+p[1]) } else { L.push(null); V.push(+p) } }); return { l: L, v: V } }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }
function mix(a, b, p) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p } }
ECOM.parts.morph = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, d = norm(s.data), V = d.v, n = V.length, labels = s.labels || d.l, G = s.group || 3, ng = Math.ceil(n / G); if (!n) return;
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', F = function (v) { return h.nf(v, dec) + unit }, beatMode = !!(s.beats && s.beats.length);
  var tot = [], pos = [], negs = []; for (var g = 0; g < ng; g++) { tot.push(0); pos.push(0); negs.push(0) } V.forEach(function (v, i) { var g = Math.floor(i / G); tot[g] += v; if (v >= 0) pos[g] += v; else negs[g] += v });
  var gl = s.glabels || tot.map(function (_, g) { var m = /^(\d{4})\.(\d{2})/.exec(labels[g * G] || ''); if (!m) return [String(g + 1), '']; var mo = +m[2];
    if (G === 3) return [Math.ceil(mo / 3) + '분기', (mo <= 3 || g === 0) ? m[1] + '년' : '']; if (G === 12) return [m[1] + '년', '']; return [mo + '~' + (mo + G - 1) + '월', g === 0 || mo === 1 ? m[1] + '년' : ''] });
  var gname = s.gname || (G === 3 ? '전분기' : G === 12 ? '전년' : '앞 묶음');
  var svg = ctx.svg(512), top = 30, bot = 448, ml = 64, x1 = 1168 - 8, PW = x1 - ml;
  var sc = u.yScale(pos.concat(negs).concat([0]).concat([Math.max.apply(null, pos) * 1.16]), s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit });
  var slot = PW / n, bw = Math.max(4, Math.min(40, slot * .62)), gband = PW / ng, cw = Math.min(gband * .56, 150), gap = 4, mw = Math.min(bw, (gband * .86 - (G - 1) * gap) / G);
  var lastG = ng - 1, cols = tot.map(function (_, g) { return g === lastG ? C.main : g === lastG - 1 ? C.g40 : C.gray });
  var up = tot.map(function () { return 0 }), dn = tot.map(function () { return 0 });
  var B = V.map(function (v, i) { var g = Math.floor(i / G), j = i % G, gc = ml + gband * (g + .5), cnt = Math.min(G, n - g * G), gw = cnt * mw + (cnt - 1) * gap, L2;
    if (v >= 0) { L2 = { x: gc - cw / 2, y: Y(up[g] + v), w: cw, h: Y(up[g]) - Y(up[g] + v) }; up[g] += v } else { L2 = { x: gc - cw / 2, y: Y(dn[g]), w: cw, h: Y(dn[g] + v) - Y(dn[g]) }; dn[g] += v }
    var L0 = { x: ml + slot * (i + .5) - bw / 2, y: v >= 0 ? Y(v) : Y(0), w: bw, h: Math.abs(Y(v) - Y(0)) }, L1 = { x: gc - gw / 2 + j * (mw + gap), y: L0.y, w: mw, h: L0.h };
    return { g: g, v: v, L0: L0, L1: L1, L2: L2, r: E('rect', { rx: 2, fill: C.gray, stroke: '#fff', 'stroke-width': 1.5, 'data-b': 2, 'data-fx': 'grow', 'data-o': v >= 0 ? '50% 100%' : '50% 0%' }, svg) } });
  function put(b, L) { b.r.setAttribute('x', L.x); b.r.setAttribute('y', L.y); b.r.setAttribute('width', Math.max(0, L.w)); b.r.setAttribute('height', Math.max(1, L.h)) }
  /* 달 이름표 · 값(처음 모습) */
  var lab0o = E('g', {}, svg), lab0 = E('g', {}, lab0o), stepX = n > 18 ? 3 : n > 12 ? 2 : 1, ma = 0; V.forEach(function (v, i) { if (v > V[ma]) ma = i });
  V.forEach(function (v, i) { if ((n - 1 - i) % stepX === 0) T(lab0, ml + slot * (i + .5), bot + 20, u.short(labels[i]), { 'text-anchor': 'middle', 'font-size': 12.5, fill: i === n - 1 ? C.ink : C.mute, 'font-weight': i === n - 1 ? 700 : 400 }) });
  (ma === n - 1 ? [ma] : [ma, n - 1]).forEach(function (i) { var x = ml + slot * (i + .5), t = F(V[i]), w = h.textW(t, 13.5, 1); T(lab0, x + w / 2 > x1 ? x1 : x, Y(Math.max(0, V[i])) - 9, t, { 'text-anchor': x + w / 2 > x1 ? 'end' : 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.dark }) });
  /* 묶음 이름 · 합 · 증감(끝 모습) */
  var lab2 = E('g', {}, svg);
  tot.forEach(function (t, g) { var gc = ml + gband * (g + .5), last = g === lastG; T(lab2, gc, bot + 21, gl[g][0], { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': last ? 700 : 500, fill: last ? C.ink : C.sub });
    if (gl[g][1]) T(lab2, gc, bot + 39, gl[g][1], { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute });
    var yt = Y(Math.max(0, pos[g])); T(lab2, gc, yt - 10, F(t), { 'text-anchor': 'middle', 'font-size': last ? 16 : 14.5, 'font-weight': 700, fill: last ? C.dark : C.ink });
    if (s.growth !== false && g > 0 && tot[g - 1]) { var gr = (t / tot[g - 1] - 1) * 100, upq = gr >= 0, gt = gname + ' 대비 ' + h.nf(gr, 1, { sign: true }) + '%';
      T(lab2, gc, yt - 30, gt, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: upq ? C.main : C.cmp }) } });
  /* 쌓인 조각 옆 달 이름 · 값(자리가 넉넉할 때) */
  var room = (gband - cw) / 2 - 12; B.forEach(function (b, i) { var m = /\.(\d{2})$/.exec(labels[i] || ''), t = (m ? +m[1] + '월 ' : '') + F(b.v); if (b.L2.h < 15 || h.textW(t, 12.5) > room) return;
    T(lab2, b.L2.x + cw + 8, b.L2.y + b.L2.h / 2 + 4.5, t, { 'font-size': 12.5, fill: b.g === lastG ? C.dark : C.sub }) });
  /* 상태 · 움직임 */
  function state(k) { B.forEach(function (b) { put(b, k ? b.L2 : b.L0); b.r.setAttribute('fill', k ? cols[b.g] : C.gray) }); lab0.style.opacity = k ? 0 : ''; lab2.style.opacity = k ? '' : 0 }
  function anim(r, delay) { r._raf = r._raf || []; var t0 = null, P1 = 280, P2 = 650, P3 = 750, end = delay + P1 + P2 + 150 + P3;
    h.A(lab0, [{ opacity: 1 }, { opacity: 0 }], 300, 'linear', delay + P1); lab2.style.opacity = ''; h.A(lab2, [{ opacity: 0 }, { opacity: 1 }], 380, 'linear', end + 60);
    function st(ts) { if (t0 === null) t0 = ts; var e = ts - t0 - delay;
      B.forEach(function (b) { b.r.setAttribute('fill', e >= 0 ? cols[b.g] : C.gray); var L = e < P1 ? b.L0 : e < P1 + P2 ? mix(b.L0, b.L1, ease((e - P1) / P2)) : e < P1 + P2 + 150 ? b.L1 : mix(b.L1, b.L2, ease(Math.min(1, (e - P1 - P2 - 150) / P3))); put(b, L) });
      if (e < P1 + P2 + 150 + P3) r._raf.push(requestAnimationFrame(st)) }
    r._raf.push(requestAnimationFrame(st)); return end + 500 }
  root._bk = 0; state(beatMode ? 0 : 1); root.setAttribute('data-stg', Math.max(10, Math.min(45, 600 / n)));
  root._hook = function (r) { state(0); h.A(lab0o, [{ opacity: 0 }, { opacity: 1 }], 300, 'linear', 300 + n * +root.getAttribute('data-stg') + 300);
    if (beatMode) return 0; return anim(r, 300 + n * +root.getAttribute('data-stg') + 900) };
  root._reset = function () { state(beatMode && !root._bk ? 0 : 1) };
  root._beat = function (k) { if (!beatMode) { root._bk = k; state(1); return } var go = k >= 1 && !root._bk && !h.RM(); root._bk = k; if (go) { state(0); anim(root, 0) } else state(k >= 1 ? 1 : 0) };
};
})();
