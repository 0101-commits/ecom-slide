/* scseat — 의석 반원 : 의회 · 법원 구성을 반원 좌석 점으로(정당별 색 덩어리), 과반선 표시, 오른쪽에 정당별 석수 · 몫 + 연합 합계
   parties[{name,seats,tone}] 왼쪽부터 · unit('석') · title(가운데 큰 글 기본 총 석수) · sub(가운데 작은 글) · coalitions[{name,idx:[정당 번호…]}] · majorityText('과반')
   rounds[2]{label,parties,caption,sub,majorityText}  두 회차(예 2022 / 2026) 반원을 나란히 — 있으면 parties · coalitions 대신 이것을 씀, 정당 이름 · 색(tone)이 같으면 한눈에 비교 · 아래에 정당별 석수
   움직임 : 좌석이 왼쪽부터 채워짐 → 과반선 → 오른쪽 칸 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, S = ECOM.sc;
/* 두 회차 나란히 — rounds[{label,parties,caption,sub}] */
function pair(bd, s, ctx) { var svg = ctx.svg(512), u = s.unit || '석', RS = s.rounds.slice(0, 2);
  RS.forEach(function (rd, q) { var P = (rd.parties || []).slice(0, 7), N = P.reduce(function (a, p) { return a + p.seats }, 0); if (!N) return;
    var x0 = q * 598, cx = x0 + 285, cy = 372, R1 = 262, R0 = 108, rows = N > 200 ? 9 : N > 100 ? 7 : 5, rad = [], sum = 0, t0 = q * 500;
    for (var i = 0; i < rows; i++) { var r = R0 + (R1 - R0) * i / (rows - 1); rad.push(r); sum += r }
    var cnt = rad.map(function (r) { return Math.round(N * r / sum) }), df = N - cnt.reduce(function (a, b) { return a + b }, 0); cnt[rows - 1] += df;
    var seats = []; rad.forEach(function (r, i) { for (var j = 0; j < cnt[i]; j++) { var th = Math.PI * (1 - (cnt[i] > 1 ? j / (cnt[i] - 1) : .5)); seats.push({ th: th, x: cx + r * Math.cos(th), y: cy - r * Math.sin(th) }) } });
    seats.sort(function (a, b) { return b.th - a.th }); var sr = Math.min((R1 - R0) / (rows - 1) / 2 * .84, Math.PI * R0 / Math.max.apply(null, cnt) / 2 * 1.4), ord = [];
    P.forEach(function (p, k) { for (var j = 0; j < p.seats; j++) ord.push(k) });
    var hd = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 400 }); T(hd, cx, 24, rd.label || '', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: C.ink });
    seats.forEach(function (st, i) { var k = ord[i], col = h.col(P[k].tone || ['dark', 'g65', 'g40', 'gray', 'cmp'][k]);
      E('circle', { cx: st.x.toFixed(1), cy: st.y.toFixed(1), r: sr.toFixed(1), fill: col, 'data-at': t0 + 100 + Math.round(i / seats.length * 900), 'data-fx': 'pop', 'data-ms': 240 }, svg) });
    var maj = Math.floor(N / 2) + 1, a = seats[maj - 2], b = seats[maj - 1], mth = (a.th + b.th) / 2, gm = h.at(svg, t0 + 1100, { 'data-fx': 'fade', 'data-ms': 380 });
    E('line', { x1: cx + (R0 - 16) * Math.cos(mth), y1: cy - (R0 - 16) * Math.sin(mth), x2: cx + (R1 + 20) * Math.cos(mth), y2: cy - (R1 + 20) * Math.sin(mth), stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gm);
    var mt = (rd.majorityText || s.majorityText || '과반') + ' ' + maj + u, mw = h.textW(mt, 14, 1) + 24, mx = cx + (R1 + 20) * Math.cos(mth), my = cy - (R1 + 20) * Math.sin(mth);
    E('rect', { x: Math.min(x0 + 570 - mw, mx - mw / 2), y: my - 30, width: mw, height: 26, rx: 13, fill: C.ink }, gm); T(gm, Math.min(x0 + 570 - mw / 2, mx), my - 12, mt, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' });
    var gc = h.at(svg, t0 + 300, { 'data-fx': 'fade', 'data-ms': 400 }); T(gc, cx, cy - 12, rd.caption || (N + u), { 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 700, fill: C.ink }); if (rd.sub) T(gc, cx, cy + 14, rd.sub, { 'text-anchor': 'middle', 'font-size': 15, fill: C.mute });
    var gl = h.at(svg, t0 + 1300, { 'data-fx': 'fade', 'data-ms': 400 }), per = Math.ceil(P.length / 2), cw2 = 285;
    P.forEach(function (p, k) { var col = h.col(p.tone || ['dark', 'g65', 'g40', 'gray', 'cmp'][k]), cx2 = x0 + Math.floor(k / per) * cw2, yy = 410 + (k % per) * 25;
      E('circle', { cx: cx2 + 8, cy: yy + 8, r: 7, fill: col }, gl); T(gl, cx2 + 24, yy + 13, p.name, { 'font-size': S.fit(p.name, 15, cw2 - 100, 1, 12), 'font-weight': 600, fill: C.ink }); T(gl, cx2 + cw2 - 22, yy + 13, p.seats + u, { 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: C.ink }) }) });
  var ar = h.at(svg, 700, { 'data-fx': 'fade', 'data-ms': 400 }); E('line', { x1: 584, x2: 584, y1: 40, y2: 500, stroke: C.line, 'stroke-width': 1.5 }, ar);
  ctx.root.setAttribute('data-gap', 300) }
ECOM.parts.scseat = function (bd, s, ctx) {
  if (s.rounds && s.rounds.length > 1) return pair(bd, s, ctx);
  var P = (s.parties || []).slice(0, 7), N = P.reduce(function (a, p) { return a + p.seats }, 0), u = s.unit || '석'; if (!N) return; var svg = ctx.svg(512);
  var cx = 436, cy = 462, R1 = 398, R0 = 162, rows = N > 200 ? 9 : N > 100 ? 7 : 5, rad = [], sum = 0; for (var i = 0; i < rows; i++) { var r = R0 + (R1 - R0) * i / (rows - 1); rad.push(r); sum += r }
  var cnt = rad.map(function (r) { return Math.round(N * r / sum) }), df = N - cnt.reduce(function (a, b) { return a + b }, 0); cnt[rows - 1] += df;
  var seats = []; rad.forEach(function (r, i) { for (var j = 0; j < cnt[i]; j++) { var th = Math.PI * (1 - (cnt[i] > 1 ? j / (cnt[i] - 1) : .5)); seats.push({ th: th, r: r, x: cx + r * Math.cos(th), y: cy - r * Math.sin(th) }) } });
  seats.sort(function (a, b) { return b.th - a.th || a.r - b.r });
  var sr = Math.min((R1 - R0) / (rows - 1) / 2 * .84, Math.PI * R0 / Math.max.apply(null, cnt) / 2 * 1.4), idx = 0, ord = [];
  P.forEach(function (p, k) { for (var j = 0; j < p.seats; j++) ord.push(k) });
  seats.forEach(function (st, i) { var k = ord[i], col = h.col(P[k].tone || ['dark', 'g65', 'g40', 'gray', 'cmp'][k]);
    E('circle', { cx: st.x.toFixed(1), cy: st.y.toFixed(1), r: sr.toFixed(1), fill: col, 'data-at': 100 + Math.round(i / seats.length * 1300), 'data-fx': 'pop', 'data-ms': 260 }, svg) });
  var maj = Math.floor(N / 2) + 1, a = seats[maj - 2], b = seats[maj - 1], mth = (a.th + b.th) / 2, gm = h.at(svg, 1700, { 'data-fx': 'fade', 'data-ms': 420 });
  E('line', { x1: cx + (R0 - 22) * Math.cos(mth), y1: cy - (R0 - 22) * Math.sin(mth), x2: cx + (R1 + 26) * Math.cos(mth), y2: cy - (R1 + 26) * Math.sin(mth), stroke: C.ink, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, gm);
  var mt = (s.majorityText || '과반') + ' ' + maj + u, mw = h.textW(mt, 14, 1) + 24, mx = cx + (R1 + 26) * Math.cos(mth), my = cy - (R1 + 26) * Math.sin(mth);
  E('rect', { x: mx - mw / 2, y: my - 30, width: mw, height: 26, rx: 13, fill: C.ink }, gm); T(gm, mx, my - 12, mt, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#fff' });
  var gc = h.at(svg, 800, { 'data-fx': 'fade', 'data-ms': 500 }); T(gc, cx, cy - 22, s.caption || s.title || (N + u), { 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 700, fill: C.ink }); if (s.sub) T(gc, cx, cy + 6, s.sub, { 'text-anchor': 'middle', 'font-size': 16, fill: C.mute });
  var gl = h.at(svg, 1900, { 'data-fx': 'fade', 'data-ms': 420 }), lx = 900, y = 30; T(gl, lx, y, '정당별 ' + u + '수', { 'font-size': 15, 'font-weight': 700, fill: C.mute }); y += 22;
  P.forEach(function (p, k) { var col = h.col(p.tone || ['dark', 'g65', 'g40', 'gray', 'cmp'][k]); E('circle', { cx: lx + 9, cy: y + 18, r: 9, fill: col }, gl);
    T(gl, lx + 28, y + 24, p.name, { 'font-size': 16, 'font-weight': 700, fill: C.ink }); T(gl, 1168, y + 25, p.seats + u, { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: C.ink }); T(gl, 1168 - 70, y + 24, h.nf(p.seats / N * 100, 0) + '%', { 'text-anchor': 'end', 'font-size': 13.5, fill: C.mute }); y += 38 });
  (s.coalitions || []).forEach(function (c, i) { var tot = c.idx.reduce(function (a, k) { return a + P[k].seats }, 0), ok = tot >= maj; if (!i) { y += 14; E('line', { x1: lx, x2: 1168, y1: y, y2: y, stroke: C.line }, gl); y += 8; T(gl, lx, y + 14, '연합 합계', { 'font-size': 14, 'font-weight': 700, fill: C.mute }); y += 22 }
    T(gl, lx, y + 24, c.name, { 'font-size': S.fit(c.name, 15, 150, 1, 12), 'font-weight': 700, fill: C.ink }); T(gl, 1168 - 96, y + 25, tot + u, { 'text-anchor': 'end', 'font-size': 20, 'font-weight': 700, fill: ok ? C.dark : C.cmp });
    S.chip(gl, 1168 - 88, y + 8, 88, 26, ok ? '과반 넘음' : '과반 못 미침', ok ? C.main : C.gray, ok ? '#fff' : C.ink, 12.5); y += 42 });
  ctx.root.setAttribute('data-gap', 300);
};
})();
