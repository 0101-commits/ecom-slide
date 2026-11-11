/* calendar — 결정 일정판(Kick-off 10쪽 아래) : 월 머리 → 회의 줄 이름 → 달 칸이 시간 순서대로 채워짐(지난 결정 = 채움 · 다음 = 점선) → 오늘 선
   year · months(기본 1~12월) · rows[{name,sub,sum,tone,marks:[{m(0~11),kind:'up|down|hold|next',res,size,date}]}] · now{m,f(달 안 위치 0~1),label} · legend(false = 범례 없음) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
function icon(kind, col) { var w = '<svg width="16" height="14" viewBox="0 0 16 14">';
  if (kind === 'up') return w + '<path d="M8 1 L15 13 H1 Z" fill="' + col + '"/></svg>'; if (kind === 'down') return w + '<path d="M1 1 H15 L8 13 Z" fill="' + col + '"/></svg>';
  if (kind === 'next') return w + '<circle cx="8" cy="7" r="5.5" fill="#fff" stroke="#9AA3A0" stroke-width="1.8" stroke-dasharray="2 2"/></svg>';
  return w + '<circle cx="8" cy="7" r="5.5" fill="#fff" stroke="' + col + '" stroke-width="2.4"/></svg>' }
ECOM.parts.calendar = function (bd, s, ctx) {
  var MN = s.months || ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], M = MN.length, rows = s.rows || [], R = rows.length, nw = s.now || null;
  var GX = 190, cw = (1168 - GX) / M, HH = 40, legH = s.legend === false ? 0 : 40, rh = Math.min(184, (512 - HH - 8 - legH) / Math.max(1, R)), ly0 = HH + 8;
  K.D(bd, 'kx k-cah', 0, 0, GX - 12, HH, h.esc(s.year || ''), { 'data-at': 0, 'data-fx': 'fade' });
  MN.forEach(function (m, i) { var on = nw && Math.floor(nw.m) === i; K.D(bd, 'kx k-cam' + (on ? ' on' : ''), GX + i * cw + 2, 0, cw - 4, HH, h.esc(m), { 'data-at': 60 + i * 25, 'data-fx': 'fade' }) });
  var T0 = 520, last = T0 + (M - 1) * 105 + (R - 1) * 40;
  rows.forEach(function (r, i) { var y = ly0 + i * rh, tone = h.col(r.tone || (i ? 'cmp' : 'main'));
    K.D(bd, 'kx k-car', 0, y, 1168, rh - 8, null, { 'data-at': 120, 'data-fx': 'fade' });
    K.D(bd, 'kx k-cal', 14, y, GX - 26, rh - 8, '<b style="color:' + tone + '">' + h.esc(r.name || '') + '</b>' + (r.sub ? '<span>' + h.esc(r.sub) + '</span>' : '') + (r.sum ? '<em>' + h.md(r.sum) + '</em>' : ''), { 'data-at': 200 + i * 90, 'data-fx': 'left' }) });
  var svg = nw ? K.svg(ctx) : null;
  rows.forEach(function (r, i) { var y = ly0 + i * rh, tone = h.col(r.tone || (i ? 'cmp' : 'main')), mk = {};
    (r.marks || []).forEach(function (q) { mk[q.m] = q });
    for (var m = 0; m < M; m++) { var q = mk[m], x = GX + m * cw + 4, w = cw - 8, yy = y + 9, hh = rh - 26;
      if (!q) { K.D(bd, 'kx k-cae', x, yy, w, hh, null, { 'data-at': 160, 'data-fx': 'fade' }); continue }
      var fut = nw && m > nw.m, cls = q.kind === 'next' ? ' next' : fut ? ' fut' : (q.kind === 'up' || q.kind === 'down' ? ' chg' : ''), t = T0 + m * 105 + i * 40;
      var c = K.D(bd, 'kx k-cac' + cls, x, yy, w, hh, icon(q.kind, tone) + '<b>' + h.esc(q.res || (q.kind === 'next' ? '예정' : '')) + '</b>' + (q.size ? '<i style="color:' + tone + '">' + h.esc(q.size) + '</i>' : '')
        + (q.rate ? '<em>' + h.esc(q.rate) + '</em>' : '') + (q.date ? '<span>' + h.esc(q.date) + '</span>' : ''), { 'data-at': t, 'data-fx': 'pop', 'data-ms': 320 });
      if (q.kind === 'up' || q.kind === 'down') c.style.borderColor = tone } });
  if (nw) { var nx = GX + (Math.floor(nw.m) + (nw.f != null ? nw.f : nw.m % 1 || .5)) * cw, yb = ly0 + R * rh - 4;
    E('line', { x1: nx, x2: nx, y1: HH + 2, y2: yb, stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '5 4', 'data-at': last + 300, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    var lw = h.textW(nw.label || '오늘', 13, 1) + 22, g = E('g', { 'data-at': last + 700, 'data-fx': 'pop' }, svg), lx = Math.min(1168 - lw, Math.max(GX, nx - lw / 2));
    E('rect', { x: lx, y: yb + 6, width: lw, height: 24, rx: 12, fill: C.dark }, g); T(g, lx + lw / 2, yb + 22.5, nw.label || '오늘', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }) }
  if (s.legend !== false) K.D(bd, 'kx k-cag', 0, 512 - 30, 700, 30, [['up', '인상'], ['down', '인하'], ['hold', '동결'], ['next', '다음 회의']].map(function (q) { return '<span>' + icon(q[0], C.cmp) + h.esc(q[1]) + '</span>' }).join('') + (s.legendNote ? '<em>' + h.esc(s.legendNote) + '</em>' : ''), { 'data-at': last + 500, 'data-fx': 'fade' }) };
})();
