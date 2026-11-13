/* expect — 기대 · 발표 · 이전값 : 지표 묶음 2~6개(발표치 막대 + 기대치 점선 + 이전값 빈 점 + 판정 칩) + 오른쪽 짙은 초록 「발표 뒤 시장 반응」 칸(선택)
   groups[{name,actual,expected,prev,max(칸 눈금 끝, 기본 공통),verdict('상회|부합|하회' 기본 자동),tone('warn' 이면 나쁜 뜻 칩)}] · unit(값 단위 '%') · dec · hi(강조 묶음 번호)
   react{title,sub,rows[{label,value('−9bp' 글자),trend[]}],note} — 없으면 묶음이 칸 전체를 씀(6개까지) · legend(false 면 범례 줄 뺌) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function chip(p, cx, cy, txt, bg, fg) { var w = h.textW(txt, 12.5, 1) + 20; E('rect', { x: cx - w / 2, y: cy - 13, width: w, height: 26, rx: 13, fill: bg }, p); T(p, cx, cy + 4.5, txt, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: fg }) }
ECOM.parts.expect = function (bd, s, ctx) {
  var G = (s.groups || []).slice(0, 6), n = G.length; if (!n) return;
  var root = ctx.root, svg = ctx.svg(512), unit = s.unit || '', dec = s.dec != null ? s.dec : 1, rc = s.react, RW = rc ? 312 : 0, area = 1168 - (rc ? RW + 28 : 0);
  var F = function (v) { return h.nf(v, dec) + unit };
  var gap = n > 4 ? 16 : 24, cw = Math.min(236, (area - (n - 1) * gap) / n), step = cw + gap, x0 = rc ? 0 : (1168 - (n * cw + (n - 1) * gap)) / 2;
  var cmax = 0; G.forEach(function (g) { cmax = Math.max(cmax, +g.actual || 0, +g.expected || 0, +g.prev || 0) });
  var top = s.legend === false ? 4 : 40, ch = 508 - top, y0 = top + 74, y1 = top + ch - 66, bw = Math.min(58, cw * .34), lw = bw + 30;
  if (s.legend !== false) { var lg = h.lv(svg, 1, { 'data-fx': 'fade' }), lx = x0;
    E('rect', { x: lx, y: 8, width: 16, height: 13, rx: 2, fill: C.main }, lg); T(lg, lx + 22, 20, '발표치', { 'font-size': 13, 'font-weight': 600, fill: C.cmp }); lx += 22 + h.textW('발표치', 13, 1) + 22;
    E('line', { x1: lx, x2: lx + 26, y1: 15, y2: 15, stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '6 3' }, lg); T(lg, lx + 32, 20, '기대치', { 'font-size': 13, 'font-weight': 600, fill: C.cmp }); lx += 32 + h.textW('기대치', 13, 1) + 22;
    E('circle', { cx: lx + 5, cy: 15, r: 5, fill: '#fff', stroke: C.mute, 'stroke-width': 2.5 }, lg); T(lg, lx + 17, 20, '이전값', { 'font-size': 13, 'font-weight': 600, fill: C.cmp }) }
  G.forEach(function (g, i) {
    var x = x0 + i * step, cx = x + cw / 2, mx = g.max || cmax * 1.12, Y = function (v) { return y1 - Math.max(0, v) / mx * (y1 - y0) }, ha = +g.actual, he = +g.expected, hp = +g.prev;
    var vd = g.verdict || (Math.abs(ha - he) < 1e-9 ? '부합' : ha > he ? '상회' : '하회'), isHi = s.hi === i, t0 = i * 120;
    var gc = h.at(svg, t0, { 'data-fx': 'fade' });
    E('rect', { x: x, y: top, width: cw, height: ch, rx: 10, fill: isHi ? C.paper : '#fff', stroke: isHi ? C.dark : C.line, 'stroke-width': isHi ? 2 : 1 }, gc);
    var nl = h.wrap(g.name || '', 13.5, cw - 16, 1); T(gc, cx, top + 26, nl[0] || '', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.ink });
    if (nl[1]) T(gc, cx, top + 44, nl.slice(1).join(' '), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.ink });
    E('line', { x1: x + 14, x2: x + cw - 14, y1: y1, y2: y1, stroke: C.axis, 'stroke-width': 1.2 }, gc);
    if (isFinite(ha)) E('rect', { x: cx - bw / 2, y: Y(ha), width: bw, height: Math.max(2, y1 - Y(ha)), rx: 3, fill: vd === '하회' ? C.g65 : C.main, 'data-at': 200 + i * 150, 'data-fx': 'grow', 'data-ms': 520 }, svg);
    var g2 = h.at(svg, 700 + i * 150, { 'data-fx': 'fade' });
    if (isFinite(he)) { E('line', { x1: cx - lw / 2, x2: cx + lw / 2, y1: Y(he), y2: Y(he), stroke: C.ink, 'stroke-width': 2.5, 'stroke-dasharray': '6 3' }, g2);
      T(g2, cx + lw / 2 + 4, Y(he) + 4.5, F(he), { 'font-size': 12, 'font-weight': 600, fill: C.ink }) }
    if (isFinite(hp)) { E('circle', { cx: cx, cy: Y(hp), r: 6, fill: '#fff', stroke: C.mute, 'stroke-width': 2.5, 'data-at': 850 + i * 150, 'data-fx': 'pop' }, svg);
      T(g2, cx - lw / 2 - 4, Y(hp) + 4.5, F(hp), { 'text-anchor': 'end', 'font-size': 12, 'font-weight': 600, fill: C.mute }) }
    var ty = Math.min(isFinite(ha) ? Y(ha) : y1, isFinite(he) ? Y(he) : y1, isFinite(hp) ? Y(hp) : y1) - 12;
    T(h.at(svg, 650 + i * 150, { 'data-fx': 'fade' }), cx, ty, F(ha), { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: vd === '하회' ? C.main : C.dark });
    var tone = g.tone === 'warn' ? C.warn : vd === '부합' ? C.cmp : vd === '하회' ? C.main : C.dark;
    chip(h.at(svg, 1000 + i * 150, { 'data-fx': 'pop' }), cx, top + ch - 30, '기대 ' + vd, tone, '#fff') });
  if (rc) { var rx = 1168 - RW, rows = (rc.rows || []).slice(0, 5), k = rows.length, gr = h.at(svg, 900 + n * 150, { 'data-fx': 'fade' }), t1 = 1100 + n * 150;
    E('rect', { x: rx, y: top, width: RW, height: ch, rx: 14, fill: C.dark }, gr);
    T(gr, rx + 24, top + 36, rc.title || '발표 뒤 시장 반응', { 'font-size': 15, 'font-weight': 700, fill: '#fff' });
    if (rc.sub) T(gr, rx + 24, top + 58, rc.sub, { 'font-size': 12.5, 'font-weight': 500, fill: C.on });
    var noteL = rc.note ? h.wrap(rc.note, 13.5, RW - 48, 1) : [], noteH = noteL.length ? 12 + noteL.length * 19 : 0, ry0 = top + 98, pitch = Math.min(88, (ch - 98 - 20 - noteH) / Math.max(1, k));
    rows.forEach(function (r, j) { var y = ry0 + j * pitch + 10, tg = h.at(svg, t1 + j * 120, { 'data-fx': 'fade' });
      T(tg, rx + 24, y, r.label || '', { 'font-size': 14, 'font-weight': 600, fill: '#D9EEE6' }); T(tg, rx + RW - 24, y + 4, r.value || '', { 'text-anchor': 'end', 'font-size': 24, 'font-weight': 700, fill: '#fff' });
      var sp = r.trend || []; if (sp.length > 1) { var lo = Math.min.apply(null, sp), hi = Math.max.apply(null, sp), rg = (hi - lo) || 1, sw = 200, sh = Math.min(26, pitch - 40), pts = sp.map(function (v, q) { return [rx + 24 + q * sw / (sp.length - 1), y + 16 + sh + 4 - (v - lo) / rg * sh] });
        E('path', { d: 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1) }).join(' L'), fill: 'none', stroke: C.g40, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-at': t1 + j * 120, 'data-fx': 'draw', 'data-ms': 700 }, svg);
        E('circle', { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 3.5, fill: '#fff' }, tg) } });
    if (noteL.length) { var tn = h.at(svg, t1 + k * 120 + 200, { 'data-fx': 'fade' }); noteL.forEach(function (ln, q) { T(tn, rx + 24, top + ch - 22 - (noteL.length - 1 - q) * 19, ln, { 'font-size': 13.5, 'font-weight': 700, fill: '#fff' }) }) } }
  root.setAttribute('data-gap', 300);
};
})();
