/* cocust — 고객 의존 파이 : 큰 파이(첫째 조각이 떨어져 나옴) + 오른쪽 고객 카드 줄(몫 · 계약 설명 · 몫 막대) + 아래 위험 띠
   customers[{name,share,sub}] 큰 순 3~6개(마지막에 「그 밖」 가능) · hero(번호, 기본 0 — 떨어져 나오는 조각) · unit('%') · risk{text, from(위 N곳 합 막대 표시 수, 기본 1)} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function pie(cx, cy, R, a0, a1) { var p = function (a) { return [cx + R * Math.cos(a), cy + R * Math.sin(a)] }, s = p(a0), e = p(a1); return 'M' + cx + ' ' + cy + ' L' + s[0] + ' ' + s[1] + ' A' + R + ' ' + R + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + e[0] + ' ' + e[1] + ' Z' }
ECOM.parts.cocust = function (bd, s, ctx) {
  var K = (s.customers || []).slice(0, 6), n = K.length; if (!n) return; var svg = ctx.svg(512), u = s.unit || '%', hero = s.hero != null ? s.hero : 0, tot = K.reduce(function (a, b) { return a + b.share }, 0), cx = 270, cy = 222, R = 188, pal = [C.dark, C.main, C.g65, C.g40, C.g18, C.gray];
  var a = -Math.PI / 2 - (K[0].share / tot * Math.PI), g0 = h.at(svg, 0, { 'data-fx': 'fade' });
  K.forEach(function (q, i) { var da = 2 * Math.PI * q.share / tot, mid = a + da / 2, ex = i === hero ? 16 : 0, ox = ex * Math.cos(mid), oy = ex * Math.sin(mid), col = q.name === '그 밖' ? C.gray : pal[Math.min(i, 4)];
    var g = h.at(svg, 100 + i * 150, { 'data-fx': 'pop', 'data-ms': 360 }); E('path', { d: pie(cx + ox, cy + oy, R, a + .008, a + da - .008), fill: col, stroke: '#fff', 'stroke-width': 2 }, g);
    if (q.share >= 6) { var rr = R * .66; T(g, cx + ox + rr * Math.cos(mid), cy + oy + rr * Math.sin(mid) + 7, h.nf(q.share, 0) + u, { 'text-anchor': 'middle', 'font-size': i === hero ? 26 : 19, 'font-weight': 700, fill: (col === C.g18 || col === C.gray || col === C.g40) ? C.ink : '#fff' }) } a += da });
  var x0 = 560, rh = 70, g1;
  K.forEach(function (q, i) { var y = 4 + i * (rh + 8), on = i === hero, col = q.name === '그 밖' ? C.gray : pal[Math.min(i, 4)]; g1 = h.at(svg, 300 + i * 150, { 'data-fx': 'left' });
    E('rect', { x: x0, y: y, width: 608, height: rh, rx: 8, fill: on ? C.g18 : (i % 2 ? '#fff' : C.paper), stroke: on ? C.dark : C.line, 'stroke-width': on ? 2 : 1 }, g1); E('rect', { x: x0, y: y, width: 10, height: rh, rx: 4, fill: col }, g1);
    T(g1, x0 + 28, y + 30, (q.name === '그 밖' ? '' : (i + 1) + '위  ') + q.name, { 'font-size': 18, 'font-weight': 700, fill: on ? C.dark : C.ink }); if (q.sub) T(g1, x0 + 28, y + 54, q.sub, { 'font-size': 13.5, fill: C.mute });
    T(g1, x0 + 590, y + 44, h.nf(q.share, 0) + u, { 'text-anchor': 'end', 'font-size': 30, 'font-weight': 700, fill: on ? C.dark : C.ink }) });
  if (s.risk) { var gr = h.at(svg, 300 + n * 150 + 300, { 'data-fx': 'rise' }), k = Math.min(n, s.risk.from || 1), part = K.slice(0, k).reduce(function (a, b) { return a + b.share }, 0), by = 4 + n * (rh + 8) + 6, bh = 512 - by - 4;
    if (bh > 36) { E('rect', { x: x0, y: by, width: 608, height: bh, rx: 8, fill: C.paper }, gr); E('rect', { x: x0, y: by, width: 6, height: bh, rx: 3, fill: C.warn }, gr); T(gr, x0 + 24, by + bh / 2 + 6, s.risk.text, { 'font-size': 16, 'font-weight': 700, fill: C.warn }) } }
  ctx.root.setAttribute('data-gap', 300);
};
})();
