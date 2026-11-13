/* brshare — 가로 막대 + 몫 꼬리표 : 막대 끝에 둥근 % 꼬리표, 위 몇 개를 묶는 괄호와 합계
   rows[{label,value}] 3~8개(값 큰 순 정렬) · dec(꼬리표 소수, 기본 1) · top(괄호로 묶을 위 개수, 기본 3, 0 이면 없음) · topName(괄호 글 기본 '상위 N곳 합') · sub(막대 아래 작은 글) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
ECOM.parts.brshare = function (bd, s, ctx) {
  var R = (s.rows || []).slice(0, 8), n = R.length; if (!n) return; var svg = ctx.svg(512), dec = s.dec != null ? s.dec : 1, tp = s.top != null ? s.top : 3;
  R.sort(function (a, b) { return b.value - a.value }); var mx = R[0].value, lw = 0; R.forEach(function (r) { lw = Math.max(lw, h.textW(r.label, 19, 1)) });
  var x0 = Math.ceil(lw) + 30, full = 700, top = 20, pitch = (512 - top - 8) / n, bh = Math.min(40, pitch * .56), sc = full / mx, bx = x0 + full + 140;
  R.forEach(function (r, i) { var cy = top + pitch * i + pitch / 2, w = r.value * sc, t0 = 100 + i * 160, ink = i < tp, g = h.at(svg, t0, { 'data-fx': 'fade' });
    T(g, x0 - 16, cy + 7, r.label, { 'text-anchor': 'end', 'font-size': 19, 'font-weight': 700, fill: C.ink });
    E('rect', { x: x0, y: cy - bh / 2, width: w, height: bh, rx: 4, fill: ink ? (i === 0 ? C.dark : C.main) : C.g40, 'data-at': t0 + 60, 'data-fx': 'growx', 'data-ms': 520 }, svg);
    var g2 = h.at(svg, t0 + 480, { 'data-fx': 'pop' }), tx = h.nf(r.value, dec) + '%', tw = h.textW(tx, 19, 1) + 22; E('rect', { x: x0 + w + 10, y: cy - 16, width: tw, height: 32, rx: 16, fill: ink ? C.dark : '#fff', stroke: ink ? C.dark : C.g40, 'stroke-width': 1.5 }, g2);
    T(g2, x0 + w + 10 + tw / 2, cy + 7, tx, { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: ink ? '#fff' : C.cmp });
    if (r.sub) T(g, x0 + w + 10 + tw + 12, cy + 5, r.sub, { 'font-size': 13, fill: C.mute }) });
  if (tp > 0 && tp < n) { var sum = 0; for (var q = 0; q < tp; q++) sum += R[q].value; var y0 = top + pitch * 0 + (pitch - bh) / 2, y1 = top + pitch * (tp - 1) + pitch / 2 + bh / 2, gb = h.at(svg, 150 + n * 160 + 300, { 'data-fx': 'fade' });
    E('path', { d: 'M' + (bx - 10) + ' ' + y0 + ' h8 v' + (y1 - y0) + ' h-8', fill: 'none', stroke: C.dark, 'stroke-width': 2 }, gb);
    T(gb, bx + 6, (y0 + y1) / 2 - 2, s.topName || ('상위 ' + tp + '곳 합'), { 'font-size': 14, 'font-weight': 700, fill: C.mute }); T(gb, bx + 6, (y0 + y1) / 2 + 30, h.nf(sum, dec) + '%', { 'font-size': 32, 'font-weight': 700, fill: C.dark }) }
  ctx.root.setAttribute('data-gap', 300);
};
})();
