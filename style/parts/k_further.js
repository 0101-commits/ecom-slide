/* further — 추가 분석 장(Kick-off 14쪽 · CW44 15쪽) : 위 제목 줄 → 왼쪽 묶음 이름 기둥이 아래로 자람 → 오른쪽 「분석 n」 줄이 차례로
   caption · tag('예시') · prefix('분석') · groups[{name,items:[{title,text}]}] 
   배치 s.layout : default · tree 나무형(뿌리 → 가지 → 잎, 곡선) · grid 2×2(5개 이상이면 3열, 묶음 이름 알약) */
(function () {
'use strict';
var h = ECOM.h, K = ECOM.kx;
function base(bd, s, ctx) {
  var gs = s.groups || [], n = gs.reduce(function (a, g) { return a + (g.items || []).length }, 0), G = gs.length, top = 54, gap = 10, ggap = 14;
  var rh = Math.min(104, (512 - top - (n - G) * gap - (G - 1) * ggap) / Math.max(1, n)), used = n * rh + (n - G) * gap + (G - 1) * ggap, y = top + Math.max(0, (512 - top - used) / 2), no = 0;
  K.D(bd, 'kx k-fuh', 0, 0, 1168, 38, h.esc(s.caption || s.title || '추가 분석 과제') + (s.tag !== false ? '<em>' + h.esc(s.tag || '예시') + '</em>' : ''), { 'data-b': 1, 'data-fx': 'fade' });
  gs.forEach(function (g, i) { var its = g.items || [], gh = its.length * rh + (its.length - 1) * gap;
    K.D(bd, 'kx k-fug', 0, y, 154, gh, '<span>' + h.md(g.name || '') + '</span>', { 'data-b': 2, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 460 });
    its.forEach(function (it, j) { no++; K.D(bd, 'kx k-fur', 172, y + j * (rh + gap), 1168 - 172, rh, '<div><em>' + h.esc((s.prefix || '분석') + ' ' + no + '.') + '</em><b>' + h.md(it.title || '') + '</b></div>' + (it.text ? '<span>' + h.md(it.text) + '</span>' : ''), { 'data-b': 3, 'data-fx': 'left' }) });
    y += gh + ggap });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ──
   tree : 나무형 — 왼쪽 뿌리(caption) → 가지(묶음 이름) → 잎(분석 줄)로 곡선이 뻗음
   grid : 2×2 — 분석 과제를 같은 크기 카드로 바둑판에 놓음(항목이 5개 이상이면 3열). 카드 위 알약 = 속한 묶음 이름 */
function allItems(s) { var out = []; (s.groups || []).forEach(function (g, gi) { (g.items || []).forEach(function (it) { out.push({ g: g, gi: gi, it: it }) }) }); return out }
function tree(bd, s, ctx) {
  var P = ctx.P, E = h.E, gs = s.groups || [], n = allItems(s).length, G = gs.length, svg, gap = 12, ggap = 24, rh = Math.min(104, (512 - (n - G) * gap - (G - 1) * ggap) / Math.max(1, n)), used = n * rh + (n - G) * gap + (G - 1) * ggap, y = Math.max(0, (512 - used) / 2), no = 0, RW = 170, GX = 234, GW = 186, LX = 486, rootY = 256, lines = [], gb = [];
  K.D(bd, 'kx k-fug', 0, rootY - 78, RW, 156, '<span style="display:flex;flex-direction:column;gap:8px;align-items:center">' + h.md(s.caption || s.title || '추가 분석 과제') + (s.tag !== false ? '<i style="font-style:normal;font-size:12.5px;font-weight:700;color:' + P.dark + ';background:#fff;border-radius:999px;padding:2px 11px">' + h.esc(s.tag || '예시') + '</i>' : '') + '</span>', { 'data-b': 1, 'data-fx': 'zoom', 'data-ms': 480 });
  gs.forEach(function (g, i) { var its = g.items || [], gh = its.length * rh + (its.length - 1) * gap, gy = y + gh / 2, y0 = y;
    gb.push(function () { K.D(bd, 'kx', GX, gy - 42, GW, 84, '<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 12px;font-size:18px;font-weight:700;line-height:1.35;color:#fff">' + h.md(g.name || '') + '</div>', { 'data-b': 2, 'data-fx': 'pop', 'data-ms': 440, 'data-key': g.name }); bd.lastChild.style.background = P.g65; bd.lastChild.style.borderRadius = '12px' });
    lines.push({ d: 'M' + RW + ' ' + rootY + ' C' + (RW + 34) + ' ' + rootY + ' ' + (GX - 34) + ' ' + gy + ' ' + GX + ' ' + gy, b: 2 });
    its.forEach(function (it, j) { no++; var nn = no, ly = y0 + j * (rh + gap); lines.push({ d: 'M' + (GX + GW) + ' ' + gy + ' C' + (GX + GW + 36) + ' ' + gy + ' ' + (LX - 36) + ' ' + (ly + rh / 2) + ' ' + LX + ' ' + (ly + rh / 2), b: 3 });
      gb.push(function () { K.D(bd, 'kx k-fur', LX, ly, 1168 - LX, rh, '<div><em>' + h.esc((s.prefix || '분석') + ' ' + nn + '.') + '</em><b>' + h.md(it.title || '') + '</b></div>' + (it.text ? '<span>' + h.md(it.text) + '</span>' : ''), { 'data-b': 3, 'data-fx': 'left', 'data-key': it.title }); bd.lastChild.style.background = P.g08 }) });
    y += gh + ggap });
  gb.forEach(function (f) { f() }); svg = K.svg(ctx);
  lines.forEach(function (l) { E('path', { d: l.d, fill: 'none', stroke: P.g40, 'stroke-width': 2.4, 'data-b': l.b, 'data-fx': 'draw', 'data-ms': 520 }, svg) });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) }
function grid(bd, s, ctx) {
  var P = ctx.P, items = allItems(s), n = items.length, cols = n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), gap = 16, top = 54, cw = (1168 - (cols - 1) * gap) / cols, ch = (512 - top - (rows - 1) * gap) / rows, tone = [P.dark, P.g65, P.cmp];
  K.D(bd, 'kx k-fuh', 0, 0, 1168, 38, h.esc(s.caption || s.title || '추가 분석 과제') + (s.tag !== false ? '<em>' + h.esc(s.tag || '예시') + '</em>' : ''), { 'data-b': 1, 'data-fx': 'fade' });
  items.forEach(function (o, i) { var c = i % cols, r = Math.floor(i / cols);
    K.D(bd, 'kx', c * (cw + gap), top + r * (ch + gap), cw, ch, '<div style="position:absolute;left:28px;top:22px;right:28px;display:flex;align-items:center;justify-content:space-between"><i style="font-style:normal;font-size:13.5px;font-weight:700;color:#fff;background:' + tone[o.gi % 3] + ';border-radius:999px;padding:3px 14px">' + h.md(o.g.name || '') + '</i><em style="font-style:normal;font-size:50px;font-weight:300;line-height:1;color:' + P.g40 + ';font-variant-numeric:tabular-nums">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</em></div>'
      + '<div style="position:absolute;left:28px;right:28px;top:' + (ch > 200 ? 92 : 80) + 'px;bottom:18px;display:flex;flex-direction:column;gap:9px"><b style="font-size:24px;line-height:1.35;color:' + P.dark + '">' + h.md(o.it.title || '') + '</b>' + (o.it.text ? '<span style="font-size:17px;line-height:1.6;color:' + P.ink + '">' + h.md(o.it.text) + '</span>' : '') + '</div>', { 'data-b': 2 + (i % 2), 'data-fx': 'rise', 'data-ms': 440, 'data-key': o.it.title }); bd.lastChild.style.background = P.g08; bd.lastChild.style.borderRadius = '16px' });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) }
var LAY = { tree: tree, grid: grid }, baseFn = base;
ECOM.parts.further = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.further.layouts = ['default', 'tree', 'grid'];
})();
