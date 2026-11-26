/* columns — 틀 기둥 3~4개(Kick-off 6쪽) : (위 목표 띠 → 갈래 선) → 번호 기둥이 차례로 섬 → 기둥 숫자 굴림 → 아래 요약 띠가 왼쪽부터 펼쳐짐
   top{title,sub} · cols[{title,sub,hi,value:{v,dec,unit,label,sign},points[],chart:{type,data,first,last,dec,unit,title}(아래 작은 차트),note,noteLabel}] · summary('글, **굵게**') · sumLabel('요약') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
function columnsDefault(bd, s, ctx) {
  var cols = (s.cols || []).slice(0, 4), N = cols.length, top = s.top || null, gap = 16, cw = (1168 - (N - 1) * gap) / N, y0 = top ? 104 : 0, y1 = s.summary ? 512 - 70 : 512, svg = K.svg(ctx);
  if (top) { var tw = Math.min(760, Math.max(420, h.textW(top.title || '', 19, 1) + 120));
    K.D(bd, 'kx k-cot', (1168 - tw) / 2, 0, tw, 56, '<b>' + h.md(top.title || '') + '</b>' + (top.sub ? '<span>' + h.md(top.sub) + '</span>' : ''), { 'data-b': 1, 'data-fx': 'pop' });
    var bus = 80, lg = h.lv(svg, 2, { 'data-fx': 'fade' });
    E('path', { d: 'M584 56 V' + bus, fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 260 }, svg);
    E('path', { d: 'M' + (cw / 2) + ' ' + bus + ' H' + (1168 - cw / 2), fill: 'none', stroke: C.g65, 'stroke-width': 2, 'data-b': 2, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    cols.forEach(function (_, i) { var x = i * (cw + gap) + cw / 2; E('line', { x1: x, x2: x, y1: bus, y2: y0 - 10, stroke: C.g65, 'stroke-width': 2 }, lg); K.head(lg, x, y0 - 2, Math.PI / 2, C.g65, 9) }) }
  cols.forEach(function (c, i) { var x = i * (cw + gap), v = c.value || null;
    var html = '<div class="k-coh"><em>' + String(i + 1).padStart(2, '0') + '</em><div><b>' + h.md(c.title || '') + '</b>' + (c.sub ? '<span>' + h.md(c.sub) + '</span>' : '') + '</div></div>'
      + (v ? '<div class="k-cov"><span class="k-con"><span data-b="4" data-fx="count" data-count="' + h.num(v.v) + '" data-dec="' + h.num(v.dec) + '"' + (v.sign ? ' data-sign="1"' : '') + '>' + h.nf(v.v, v.dec || 0, { sign: v.sign }) + '</span><small>' + h.esc(v.unit || '') + '</small></span>' + (v.label ? '<i>' + h.esc(v.label) + '</i>' : '') + '</div>' : '')
      + '<div class="k-cop">' + (c.points || []).map(function (p) { return '<div><span>' + h.md(p) + '</span></div>' }).join('') + '</div>'
      + (c.note ? '<div class="k-cono"><i>' + h.esc(c.noteLabel || s.noteLabel || '확인 지표') + '</i><span>' + h.md(c.note) + '</span></div>' : '');
    var el = K.D(bd, 'kx k-coc' + (c.hi ? ' hi' : ''), x, y0, cw, y1 - y0, html, { 'data-b': 3, 'data-fx': 'rise', 'data-ms': 420 }); if (c.chart) el.style.paddingBottom = '160px' });
  var cs = null; cols.forEach(function (c, i) { if (!c.chart) return; cs = cs || K.svg(ctx); var x = i * (cw + gap);
    E('line', { x1: x + 20, x2: x + cw - 20, y1: y1 - 156, y2: y1 - 156, stroke: C.line, 'data-at': 1140 + i * 150, 'data-fx': 'fade' }, cs);
    if (c.chart.title) h.T(cs, x + 20, y1 - 134, c.chart.title, { 'font-size': 12.5, 'font-weight': 700, fill: C.mute, 'data-at': 1140 + i * 150, 'data-fx': 'fade' });
    K.mini(cs, c.chart, x + 24, y1 - 132, cw - 48, 126, 4, 1140 + i * 150) });
  if (s.summary) K.D(bd, 'kx k-cos', 0, 512 - 56, 1168, 56, '<i>' + h.esc(s.sumLabel || '요약') + '</i><span>' + h.md(s.summary) + '</span>', { 'data-b': 5, 'data-fx': 'growx', 'data-ms': 620 });
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 150) }
/* ───────── 배치(layout) — 같은 칸(top · cols · summary)으로 다른 그림 ─────────
   default   위 설명 그대로(번호 기둥)
   venn      겹친 원 — 기둥(2~4)을 겹친 원으로 그리고, 겹친 가운데에 공통점(summary, 없으면 top) 이름표. 기둥 설명은 오른쪽 줄
   rows      가로 띠 — 기둥을 가로 띠 행으로(번호 · 제목 · 값 · 요점 · 확인 지표 또는 작은 차트)
   iconcards 아이콘 카드 — 카드마다 위에 선 아이콘(칸 icon, 없으면 제목 낱말로 고름, 못 고르면 번호 원), 가운데 맞춤. 칸 icon = money·house·factory·person·ship·chart·bank·globe */
var LAY = {};
function inj() { if (document.getElementById('p3a2-css')) return; var st = document.createElement('style'); st.id = 'p3a2-css'; st.textContent = '.kx.p3 b,.kx.p3 span b,.kx.p3 div b{color:inherit}'; (document.head || document.documentElement).appendChild(st) }
function D(bd, x, y, w, hh, html, css, at) { inj(); var d = K.D(bd, 'kx p3', x, y, w, hh, html, at); if (css) d.style.cssText += ';' + css; return d }
function setup(ctx) { var P = ctx.P, dk = ctx.dark; return { P: P, ON: dk ? ECOM.Cd.bg : '#fff', CARD: dk ? P.g08 : '#fff', PAPER: dk ? P.well : P.paper, BD: dk ? P.line : '#DDE3E0' } }
function valHTML(c, P, big, at) { var v = c.value; if (!v) return ''; return '<span style="font-size:' + ECOM.fs(big) + 'px;font-weight:700;color:' + P.dark + ';letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap;line-height:1.1"><span data-b="' + at + '" data-fx="count" data-count="' + h.num(v.v) + '" data-dec="' + h.num(v.dec) + '"' + (v.sign ? ' data-sign="1"' : '') + '>' + h.nf(v.v, v.dec || 0, { sign: v.sign }) + '</span><small style="font-size:' + ECOM.fs(Math.round(big * .46)) + 'px;font-weight:600;margin-left:4px;color:' + P.sub + '">' + h.esc(v.unit || '') + '</small></span>' }
function bar(bd, s, ctx, sy) { var S = setup(ctx), P = S.P; if (!s.summary) return;
  D(bd, 0, sy, 1168, 512 - sy, '<i style="font-style:normal;flex:0 0 auto;font-size:13px;font-weight:700;color:' + P.dark + ';background:' + S.ON + ';border-radius:999px;padding:3px 12px">' + h.esc(s.sumLabel || '요약') + '</i><span style="font-size:16px;font-weight:600;line-height:1.4;color:' + S.ON + '">' + (ctx.dark ? h.md(s.summary) : h.md(s.summary).replace(/<b>/g, '<b style="color:' + ECOM.C.on + '">')) + '</span>',
    'display:flex;align-items:center;gap:16px;padding:0 22px;border-radius:6px;background:' + P.dark, { 'data-at': 1700, 'data-fx': 'growx', 'data-ms': 520 }) }
function topBand(bd, top, w, x, ctx, at) { var S = setup(ctx), P = S.P;
  return D(bd, x, 0, w, 56, '<b style="font-size:18px">' + h.md(top.title || '') + '</b>' + (top.sub ? '<span style="font-size:13px;opacity:.9;margin-top:2px">' + h.md(top.sub) + '</span>' : ''), 'display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;background:' + P.dark + ';color:' + S.ON, { 'data-at': at || 0, 'data-fx': 'pop', 'data-ms': 360 }) }

LAY.venn = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, cols = (s.cols || []).slice(0, 4), N = cols.length, top = s.top || null, svg = K.svg(ctx), cx = 330, cy = 256, R, cen;
  if (N === 2) { R = 178; cen = [[cx - 100, cy], [cx + 100, cy]] }
  else if (N === 3) { R = 150; cen = [[cx, cy - 86], [cx - 98, cy + 76], [cx + 98, cy + 76]] }
  else { R = 128; cen = [[cx - 80, cy - 80], [cx + 80, cy - 80], [cx - 80, cy + 80], [cx + 80, cy + 80]] }
  var fills = [P.g65, P.g40, P.gray, ctx.dark ? P.main : P.g18];
  cols.forEach(function (c, i) { var o = cen[i], dx = o[0] - cx, dy = o[1] - cy, dl = Math.hypot(dx, dy) || 1, lw = Math.min(176, R * 1.2), lxx = o[0] + dx / dl * R * (N === 2 ? .46 : .5), lyy = o[1] + dy / dl * R * (N === 2 ? 0 : .48), ta = 150 + i * 300;
    var g = E('g', { 'data-at': ta, 'data-fx': 'pop', 'data-ms': 420, 'data-key': c.title || '' }, svg);
    E('circle', { cx: o[0], cy: o[1], r: R, fill: fills[i], 'fill-opacity': .72, stroke: i === 3 ? P.main : fills[i], 'stroke-width': 2.4 }, g);
    var v = c.value, hh = 26 + (v ? 30 : 0), tt = h.wrap(c.title || '', 17, lw, 1), th = tt.length * 22 + (v ? 30 : 0), y0 = lyy - th / 2;
    tt.forEach(function (t, j) { h.T(g, lxx, y0 + 17 + j * 22, t, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ctx.dark ? '#fff' : ECOM.C.ink }) });
    if (v) h.T(g, lxx, y0 + tt.length * 22 + 24, h.nf(v.v, v.dec || 0, { sign: v.sign }) + (v.unit || ''), { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: ctx.dark ? '#fff' : ECOM.C.dark }) });
  // 공통점 이름표
  var cm = s.summary || (top ? (top.title || '') + (top.sub ? ' — ' + top.sub : '') : ''), te = 150 + N * 300 + 200;
  var gx = 700, gw = 1168 - gx, y0 = top && s.summary ? 68 : 0, rowH = (512 - y0 - 10 - (cm ? 0 : 0)) / N, cmH = 0;
  var common = cm ? Math.min(118, 40 + K.lines(cm, 15.5, gw - 40, 1) * 23) : 0, availR = 512 - y0 - (common ? common + 14 : 0), rh = Math.min(150, (availR - (N - 1) * 10) / N);
  var ry = y0;
  if (top && s.summary) topBand(bd, top, gw, gx, ctx, 0);
  cols.forEach(function (c, i) { var ta = 400 + i * 300, y = ry + i * (rh + 10), v = c.value, pts = (c.points || []).slice(0, 3);
    D(bd, gx, y, gw, rh, '<div style="display:flex;align-items:center;gap:12px"><i style="flex:0 0 auto;width:18px;height:18px;border-radius:50%;background:' + fills[i] + ';border:2px solid ' + fills[i] + '"></i><b style="font-size:16px;color:' + P.ink + ';line-height:1.3">' + h.md(c.title || '') + '</b>' + (c.sub ? '<span style="font-size:13px;color:' + P.mute + '">' + h.md(c.sub) + '</span>' : '') + (v ? '<span style="margin-left:auto;flex:0 0 auto;font-size:18px;font-weight:700;color:' + P.dark + '">' + h.nf(v.v, v.dec || 0, { sign: v.sign }) + h.esc(v.unit || '') + '</span>' : '') + '</div>'
      + pts.map(function (p) { return '<div style="font-size:13px;line-height:1.42;color:' + P.sub + ';padding-left:30px;margin-top:3px">' + h.md(p) + '</div>' }).join(''),
      'display:flex;flex-direction:column;justify-content:center;padding:0 18px;border-radius:6px;background:' + S.CARD + ';border:1px solid ' + S.BD, { 'data-at': ta, 'data-fx': 'right', 'data-ms': 360 }) });
  if (common) { var cyy = 512 - common, mid = [cx, cy + (N === 3 ? 18 : 0)];
    var g2 = E('g', { 'data-at': te, 'data-fx': 'fade', 'data-ms': 260 }, svg);
    E('circle', { cx: mid[0], cy: mid[1], r: 7, fill: P.dark, stroke: ON, 'stroke-width': 2.4 }, g2);
    var lp = E('path', { d: 'M' + (mid[0] + 7) + ' ' + mid[1] + ' L' + (cx + R + 70) + ' ' + mid[1] + ' L' + (gx - 4) + ' ' + (cyy + common / 2), fill: 'none', stroke: P.dark, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-at': te, 'data-fx': 'draw', 'data-ms': 500 }, svg);
    D(bd, gx, cyy, gw, common, '<i style="font-style:normal;align-self:flex-start;font-size:13px;font-weight:700;color:' + P.dark + ';background:' + ON + ';border-radius:999px;padding:2px 12px">' + h.esc(s.summary ? (s.sumLabel || '공통점') : '공통점') + '</i><span style="font-size:16px;font-weight:700;line-height:1.45;margin-top:6px;color:' + ON + '">' + h.md(cm) + '</span>',
      'display:flex;flex-direction:column;justify-content:center;padding:0 22px;border-radius:6px;background:' + P.dark, { 'data-at': te + 300, 'data-fx': 'rise', 'data-ms': 380 }) } };

LAY.rows = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, cols = (s.cols || []).slice(0, 4), N = cols.length, top = s.top || null, svg = null, jobs = [], gap = 10, y0 = top ? 66 : 0, y1 = s.summary ? 512 - 62 : 512, rh = (y1 - y0 - (N - 1) * gap) / N;
  if (top) topBand(bd, top, 1168, 0, ctx, 0);
  var any = cols.some(function (c) { return c.chart }), anyV = cols.some(function (c) { return c.value });
  cols.forEach(function (c, i) { var y = y0 + i * (rh + gap), ta = 200 + i * 340, v = c.value, hi = c.hi, pts = c.points || [], tx = 96, tw = anyV ? 232 : 300, vx = tx + tw + 16, vw = anyV ? 190 : 0, px = vx + vw + 16, nw = c.chart ? 232 : (c.note ? 220 : 0), pw = 1168 - 20 - nw - (nw ? 16 : 0) - px;
    D(bd, 0, y, 1168, rh, '', 'border-radius:6px;background:' + (hi ? P.g08 : S.CARD) + ';border:' + (hi ? '2px solid ' + P.main : '1px solid ' + S.BD), { 'data-at': ta, 'data-fx': 'left', 'data-ms': 380, 'data-key': c.title || '' });
    D(bd, 0, y, 80, rh, String(i + 1).padStart(2, '0'), 'display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;letter-spacing:-.02em;color:' + (hi ? P.main : P.g65) + ';font-variant-numeric:tabular-nums', { 'data-at': ta + 80, 'data-fx': 'fade', 'data-ms': 260 });
    D(bd, tx, y, tw, rh, '<b style="font-size:18px;color:' + P.ink + ';line-height:1.3">' + h.md(c.title || '') + '</b>' + (c.sub ? '<span style="font-size:13px;color:' + P.mute + ';margin-top:3px;line-height:1.4">' + h.md(c.sub) + '</span>' : ''), 'display:flex;flex-direction:column;justify-content:center', { 'data-at': ta + 100, 'data-fx': 'rise', 'data-ms': 300 });
    if (v) D(bd, vx - 8, y + 14, vw + 8, rh - 28, '<div style="border-left:1px solid ' + S.BD + ';padding-left:16px;display:flex;flex-direction:column;justify-content:center;height:100%">' + valHTML(c, P, 32, 5) + (v.label ? '<i style="font-style:normal;font-size:13px;color:' + P.mute + ';margin-top:3px">' + h.esc(v.label) + '</i>' : '') + '</div>', '', { 'data-at': ta + 200, 'data-fx': 'rise', 'data-ms': 300 });
    D(bd, px, y, pw, rh, pts.map(function (p) { return '<div style="font-size:16px;line-height:1.45;color:' + P.ink + ';padding-left:14px;position:relative;margin:2px 0"><i style="position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:' + P.g65 + '"></i>' + h.md(p) + '</div>' }).join(''), 'display:flex;flex-direction:column;justify-content:center', { 'data-at': ta + 280, 'data-fx': 'rise', 'data-ms': 300 });
    if (c.chart) jobs.push(function (svg) { var cx0 = 1168 - 20 - nw; E('line', { x1: cx0 - 8, x2: cx0 - 8, y1: y + 14, y2: y + rh - 14, stroke: S.BD, 'data-at': ta + 300, 'data-fx': 'fade' }, svg);
      if (c.chart.title) h.T(svg, cx0, y + 20, c.chart.title, { 'font-size': 12.5, 'font-weight': 700, fill: P.mute, 'data-at': ta + 300, 'data-fx': 'fade' });
      K.mini(svg, c.chart, cx0, y + 8, nw, rh - 12, 4, ta + 340) });
    else if (c.note) D(bd, 1168 - 20 - nw, y + 14, nw, rh - 28, '<i style="font-style:normal;font-size:13px;font-weight:700;color:' + P.main + '">' + h.esc(c.noteLabel || s.noteLabel || '확인 지표') + '</i><span style="font-size:16px;font-weight:600;line-height:1.45;color:' + P.ink + ';margin-top:2px">' + h.md(c.note) + '</span>',
      'display:flex;flex-direction:column;justify-content:center;padding:0 14px;border-radius:6px;background:' + (hi ? S.CARD : P.g08), { 'data-at': ta + 320, 'data-fx': 'rise', 'data-ms': 300 }) });
  if (jobs.length) { svg = K.svg(ctx); jobs.forEach(function (j) { j(svg) }) }
  bar(bd, s, ctx, y1 + 10) };

var ICONS = {
  money: '<circle cx="24" cy="24" r="16"/><path d="M15.5 19.5l4.2 11 4.3-9 4.3 9 4.2-11"/><path d="M14 24.5h20"/>',
  house: '<path d="M6 23L24 8l18 15"/><path d="M11 20v20h26V20"/><path d="M20 40V28h8v12"/>',
  factory: '<path d="M6 40V24l11 7v-7l11 7V10h9v30z"/><path d="M12 36h2M21 36h2M32 36h2"/>',
  person: '<circle cx="24" cy="15" r="7"/><path d="M9 40c0-9 6-14 15-14s15 5 15 14"/>',
  ship: '<path d="M6 30h36l-5 9H11z"/><path d="M14 30V21h20v9"/><path d="M24 21V10h8"/>',
  chart: '<path d="M8 8v32h32"/><path d="M14 32l8-9 6 5 10-14"/><circle cx="38" cy="14" r="2"/>',
  bank: '<path d="M6 19L24 8l18 11z"/><path d="M10 40h28M12 22v14M20 22v14M28 22v14M36 22v14"/>',
  globe: '<circle cx="24" cy="24" r="16"/><ellipse cx="24" cy="24" rx="7" ry="16"/><path d="M8 24h32M10.5 15h27M10.5 33h27"/>'
};
var KEYS = [['bank', /은행|기준금리|중앙은행|예금|대출|금통위/], ['house', /집|주택|아파트|부동산|주거/], ['globe', /해외|세계|국제|외국|미국|글로벌|환율|대외|여행/], ['ship', /수출|수입|무역|선박|운송|상품|교역/], ['factory', /공장|제조|생산|산업|기업|설비|투자/], ['money', /돈|금리|이자|배당|송금|이전|통화|자금|가격|원화|달러/], ['person', /사람|고용|임금|인구|가계|취업|실업|소비|소득/], ['chart', /그래프|지표|물가|성장|지수|GDP|통계|추이/]];
function pickIcon(c) { if (c.icon && ICONS[c.icon]) return c.icon; var t = (c.title || '') + ' ' + (c.sub || ''); for (var i = 0; i < KEYS.length; i++) if (KEYS[i][1].test(t)) return KEYS[i][0]; return null }

LAY.iconcards = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, ON = S.ON, cols = (s.cols || []).slice(0, 4), N = cols.length, top = s.top || null, gap = 18, cw = (1168 - (N - 1) * gap) / N, y0 = top ? 68 : 0, y1 = s.summary ? 512 - 62 : 512;
  if (top) topBand(bd, top, Math.min(760, Math.max(420, h.textW(top.title || '', 19, 1) + 120)), 0, ctx, 0).style.left = (1168 - Math.min(760, Math.max(420, h.textW(top.title || '', 19, 1) + 120))) / 2 + 'px';
  cols.forEach(function (c, i) { var x = i * (cw + gap), ta = 150 + i * 300, v = c.value, ic = pickIcon(c), hi = c.hi, pts = (c.points || []);
    var html = '<div style="width:76px;height:76px;border-radius:50%;background:' + (hi ? P.main : P.g08) + ';display:flex;align-items:center;justify-content:center;flex:0 0 auto;' + (hi ? '' : 'border:1.5px solid ' + P.g40) + '">'
      + (ic ? '<svg viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="' + (hi ? ON : P.main) + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + ICONS[ic] + '</svg>' : '<b style="font-size:26px;color:' + (hi ? ON : P.main) + '">' + (i + 1) + '</b>') + '</div>'
      + '<b style="font-size:18px;color:' + P.ink + ';margin-top:12px;line-height:1.3">' + h.md(c.title || '') + '</b>' + (c.sub ? '<span style="font-size:13px;color:' + P.mute + ';margin-top:3px;line-height:1.4">' + h.md(c.sub) + '</span>' : '')
      + (v ? '<div style="margin-top:10px;display:flex;flex-direction:column;align-items:center">' + valHTML(c, P, 34, 4) + (v.label ? '<i style="font-style:normal;font-size:13px;color:' + P.mute + ';margin-top:3px">' + h.esc(v.label) + '</i>' : '') + '</div>' : '')
      + '<div style="width:100%;border-top:1px solid ' + S.BD + ';margin-top:12px;padding-top:10px;flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px">' + pts.map(function (p) { return '<div style="font-size:16px;line-height:1.45;color:' + P.ink + '">' + h.md(p) + '</div>' }).join('') + '</div>'
      + (c.note ? '<div style="width:100%;margin-top:10px;border-radius:6px;background:' + (hi ? S.CARD : P.g08) + ';padding:8px 12px"><i style="font-style:normal;font-size:13px;font-weight:700;color:' + P.main + ';display:block">' + h.esc(c.noteLabel || s.noteLabel || '확인 지표') + '</i><span style="font-size:16px;font-weight:600;line-height:1.4;color:' + P.ink + '">' + h.md(c.note) + '</span></div>' : '');
    D(bd, x, y0, cw, y1 - y0, html, 'display:flex;flex-direction:column;align-items:center;text-align:center;padding:20px 18px 16px;border-radius:6px;background:' + S.CARD + ';border:' + (hi ? '2px solid ' + P.main : '1px solid ' + S.BD), { 'data-at': ta, 'data-fx': 'rise', 'data-ms': 420, 'data-key': c.title || '' }) });
  bar(bd, s, ctx, y1 + 10) };

/* dots 점무리 : cols[0] · cols[1](title · sub · value{v,dec,unit,label})의 값을 점으로 쌓아 두 쪽 크기를 비교. 점 하나 = s.dots.per(값 단위) · s.dots.unit(점 이름, 예 '20만 명') · 아래 요약 띠(summary) */
LAY.dots = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, svg = K.svg(ctx), C2 = (s.cols || []).slice(0, 2), per = +(s.dots || {}).per || 1, ns = C2.map(function (c) { return Math.max(1, Math.round(((c.value || {}).v || 0) / per)) }), mx = Math.max.apply(null, ns), y1 = s.summary ? 512 - 62 : 512, PW = 520, y0 = 118, H = y1 - y0 - 58, p = Math.sqrt(PW * H / mx), cols, rows;
  for (; ;) { cols = Math.floor((PW - 24) / p); rows = Math.ceil(mx / cols); if (rows * p <= H || p < 8) break; p -= .5 }
  var rd = p * .37, colr = [P.main, P.cmp], dec0 = (C2[0].value || {}).dec || 0, ratio = ns[0] ? ns[1] / ns[0] : 0;
  C2.forEach(function (c, k) { var v = c.value || {}, x = k ? 1168 - PW : 0, col = colr[k], at = 120 + k * 80;
    E('rect', { x: x, y: 0, width: PW, height: y1, rx: 18, fill: P.paper }, svg);
    var hg = E('g', { 'data-key': c.title || '', 'data-at': at, 'data-fx': 'rise', 'data-ms': 420 }, svg);
    E('circle', { cx: x + 32, cy: 34, r: 9, fill: col }, hg); T(hg, x + 52, 43, c.title || '', { 'font-size': 26, 'font-weight': 700, fill: P.ink });
    var vt = h.nf(v.v, v.dec || 0), nw = h.textW(vt, 50, 1); T(hg, x + 24, 96, vt, { 'font-size': 50, 'font-weight': 700, fill: k ? P.ink : P.main, 'data-fx': 'count', 'data-count': +v.v, 'data-dec': v.dec || 0, 'data-ms': 1100 });
    if (v.unit) T(hg, x + 24 + nw + 8, 96, v.unit, { 'font-size': 20, 'font-weight': 700, fill: P.sub });
    if (c.sub) T(hg, x + PW - 24, 96, c.sub, { 'text-anchor': 'end', 'font-size': 14, fill: P.mute });
    var gx = x + (PW - cols * p) / 2 + p / 2, gy = y1 - 36 - p / 2;
    for (var r = 0; r * cols < ns[k]; r++) { var g = E('g', { 'data-at': 300 + r * 90, 'data-fx': 'rise', 'data-ms': 360 }, svg); for (var j = 0; j < cols && r * cols + j < ns[k]; j++) E('circle', { cx: gx + j * p, cy: gy - r * p, r: rd, fill: col }, g) } });
  var cg = E('g', { 'data-at': 300 + rows * 90 + 200, 'data-fx': 'pop', 'data-ms': 420 }, svg), mid = 584;
  E('circle', { cx: mid, cy: 210, r: 54, fill: P.dark }, cg); T(cg, mid, 214, h.nf(ratio, ratio >= 10 ? 0 : 1), { 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 700, fill: S.ON, 'data-fx': 'count', 'data-count': +ratio.toFixed(ratio >= 10 ? 0 : 1), 'data-dec': ratio >= 10 ? 0 : 1, 'data-suf': '배', 'data-ms': 900 });
  T(cg, mid, 242, '큰 쪽 ÷ 작은 쪽', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: S.ON, 'fill-opacity': .85 });
  T(svg, 24, y1 - 12, '● 점 하나 = ' + ((s.dots || {}).unit || String(per)) + ' · 점이 많을수록 큼', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute, 'data-at': 1800, 'data-fx': 'fade' });
  bar(bd, s, ctx, y1 + 10) };

/* shrink 줄어드는 점 격자 : 10×10 점 격자(전체 = s.shrink.total, 기본 100점)에서 비교할 몫만 진하게 남고 나머지는 작고 흐려짐. cols[0] · cols[1] value.v = 점 수(전체 중). 오른쪽 카드 = 두 몫의 이름 · 점 수 · 풀이 */
LAY.shrink = function (bd, s, ctx) {
  var S = setup(ctx), P = S.P, svg = K.svg(ctx), C2 = (s.cols || []).slice(0, 2), sh = s.shrink || {}, tot = +sh.total || 100, nA = Math.round((C2[0].value || {}).v || 0), nB = Math.round((C2[1].value || {}).v || 0), side = 10, gx = 24, gy = 16, y1 = s.summary ? 512 - 62 : 512, p = Math.min(44, (y1 - gy - 30) / 10);
  var colr = [P.main, P.cmp], faint = P.g18, dots = [], init = P.g65;
  var gg = E('g', { 'data-at': 0, 'data-fx': 'fade', 'data-ms': 400 }, svg);
  for (var i = 0; i < tot; i++) { var role = i < nA ? 0 : i >= tot - nB ? 1 : 2, cx = gx + (i % side) * p + p / 2, cy = gy + Math.floor(i / side) * p + p / 2, r = role === 2 ? 9 : 17;
    var c = E('circle', { cx: cx, cy: cy, r: r, fill: role === 2 ? faint : colr[role] }, gg); c._role = role; c._r = r; dots.push(c) }
  T(svg, gx, y1 - 4, '● 점 하나 = ' + (sh.unit || '전체의 1%') + ' · 진한 점 = 비교할 몫 · 작고 흐린 점 = 나머지', { 'font-size': 12.5, 'font-weight': 600, fill: P.mute, 'data-at': 1800, 'data-fx': 'fade' });
  var cx0 = 520, cw = 1168 - cx0, ch = (y1 - 40 - 14) / 2;
  C2.forEach(function (c, k) { var v = c.value || {}, y = k * (ch + 14), at = 1300 + k * 450, col = colr[k], g = E('g', { 'data-key': c.title || '', 'data-at': at, 'data-fx': 'rise', 'data-ms': 500 }, svg);
    E('rect', { x: cx0, y: y, width: cw, height: ch, rx: 18, fill: P.paper }, g); E('circle', { cx: cx0 + 36, cy: y + 38, r: 11, fill: col }, g); T(g, cx0 + 58, y + 47, c.title || '', { 'font-size': 26, 'font-weight': 700, fill: P.ink });
    var vt = h.nf(v.v, v.dec || 0), nw = h.textW(vt, 64, 1); T(g, cx0 + 28, y + 118, vt, { 'font-size': 64, 'font-weight': 700, fill: k ? P.ink : P.main, 'data-fx': 'count', 'data-count': +v.v, 'data-dec': v.dec || 0, 'data-ms': 1000 });
    if (v.unit) T(g, cx0 + 28 + nw + 8, y + 118, v.unit, { 'font-size': 22, 'font-weight': 700, fill: P.sub });
    h.wrap(c.sub || '', 15, cw - 56, 0).slice(0, 2).forEach(function (t, j) { T(g, cx0 + 28, y + 150 + j * 21, t, { 'font-size': 15, fill: P.sub }) }) });
  ctx.root._hook = function (root) { if (h.RM()) return 0; var kk = 0;
    dots.forEach(function (c) { var to = c.getAttribute('fill'), d = 700 + (c._role === 2 ? kk++ * 8 : 0);
      c.style.transformBox = 'fill-box'; c.style.transformOrigin = '50% 50%'; var sc = (c._role === 2 ? 17 : 17) / c._r;
      h.A(c, [{ fill: init, transform: 'scale(' + sc + ')' }, { fill: to, transform: 'scale(1)' }], 700, h.EIN, d, 'both') });
    return 700 + 700 + kk * 8 };
  bar(bd, s, ctx, y1 + 10) };

ECOM.parts.columns = function (bd, s, ctx) { var f = s.layout && LAY[s.layout]; return f ? f(bd, s, ctx) : columnsDefault(bd, s, ctx) };
ECOM.parts.columns.layouts = ['default', 'venn', 'rows', 'iconcards', 'dots', 'shrink'];
ECOM.parts.columns.dark = ['venn', 'iconcards', 'dots', 'shrink'];
})();
