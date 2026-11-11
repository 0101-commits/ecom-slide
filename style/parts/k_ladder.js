/* ladder — 조건 사다리(CW44 13쪽) : 왼쪽 = 아래에서 위로 조건 Ⅰ → Ⅱ → Ⅲ 이 차례로 채워지며 확인 표시 · 위로 굽은 화살 → 맨 위 목표, 오른쪽 = 요인 판(가운데 주제 → 묶음)
   goal{title,sub} · steps[2~4 · 0 = 맨 아래]{label,title,sub,met} · metText('충족') · unmetText('미충족')
   factors{title,lead,center:{title,text},groups:[{title,sub,tone,items:[{t,d}]}]} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
ECOM.parts.ladder = function (bd, s, ctx) {
  var root = ctx.root, st = (s.steps || []).slice(0, 4), N = st.length, gl = s.goal || {}, all = st.every(function (q) { return q.met }), LW = 500, GH = 60, GY = 0;
  var top = 82, gap = 10, bh = (512 - top - (N - 1) * gap) / N, BX = 104, BW = 290, svg = K.svg(ctx), gid = 'klad' + ctx.index;
  var df = E('defs', {}, svg), lg = E('linearGradient', { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }, df); E('stop', { offset: 0, 'stop-color': C.g08 }, lg); E('stop', { offset: 1, 'stop-color': C.g18 }, lg);
  E('path', { d: 'M250 ' + (GH + 6) + ' L478 512 H22 Z', fill: 'url(#' + gid + ')', 'data-at': 150, 'data-fx': 'fade', 'data-ms': 500 }, svg);
  var gbox = K.D(bd, 'kx k-lgo' + (all ? ' on' : ''), 70, GY, 360, GH, '<b>' + h.md(gl.title || '') + '</b>' + (gl.sub ? '<span>' + h.md(gl.sub) + '</span>' : ''), { 'data-at': 0, 'data-fx': 'fade', 'data-ms': 420 });
  var T0 = 700, PER = 640, ys = [], ov = K.svg(ctx);
  st.forEach(function (q, i) { var yb = 512 - (i + 1) * bh - i * gap, bxH = Math.min(62, bh - 30), by = yb + 24 + (bh - 24 - bxH) / 2, my = by + bxH / 2, tF = T0 + i * PER; ys.push([by, bxH, my]);
    E('rect', { x: 0, y: yb, width: LW - 26, height: bh, rx: 10, fill: q.met ? C.g18 : 'none', 'fill-opacity': .7, 'data-at': tF, 'data-fx': 'growx', 'data-ms': 460 }, svg);
    E('rect', { x: .5, y: yb + .5, width: LW - 27, height: bh - 1, rx: 10, fill: 'none', stroke: q.met ? C.g40 : C.gray, 'stroke-dasharray': '4 4', 'data-at': 300, 'data-fx': 'fade' }, svg);
    T(svg, 14, yb + 19, q.label || ('조건 ' + ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i]), { 'font-size': 12.5, 'font-weight': 700, fill: q.met ? C.dark : C.mute, 'data-at': 300, 'data-fx': 'fade' });
    K.D(bd, 'kx k-lst' + (q.met ? ' met' : ''), BX, by, BW, bxH, '<i class="k-lck" data-at="' + (tF + 280) + '" data-fx="pop">' + (q.met ? '<svg viewBox="0 0 20 20" width="14" height="14"><path d="M4 10.5 L8.5 15 L16 6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') + '</i><div><b>' + h.md(q.title || '') + '</b>' + (q.sub ? '<span>' + h.md(q.sub) + '</span>' : '') + '</div>',
      { 'data-at': 420 + i * 90, 'data-fx': 'rise' }) });
  st.forEach(function (q, i) { var a = ys[i], b = i < N - 1 ? ys[i + 1] : null, tF = T0 + i * PER, col = q.met ? C.main : C.axis;
    var x0 = BX + BW + 6, y0 = a[2] - 4, x1 = b ? BX + BW + 6 : 430 + 6, y1 = b ? b[2] + 4 : GY + GH / 2 + 8, cx = LW - 44;
    E('path', { d: 'M' + x0 + ' ' + y0 + ' C ' + cx + ' ' + (y0 - 6) + ', ' + cx + ' ' + (y1 + 22) + ', ' + (x1 + 9) + ' ' + (y1 + 3), fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-dasharray': q.met ? null : '5 4', 'data-at': tF + 380, 'data-fx': 'draw', 'data-ms': 420 }, ov);
    K.head(ov, x1, y1, Math.atan2(y1 + 3 - (y1 + 22), x1 + 9 - cx) + Math.PI * 0, col, 10, { 'data-at': tF + 760, 'data-fx': 'fade', 'data-ms': 160 });
    T(ov, LW - 20, (y0 + y1) / 2 + 5, q.met ? (s.metText || '충족') : (s.unmetText || '미충족'), { 'font-size': 13, 'font-weight': 700, fill: q.met ? C.main : C.mute, 'data-at': tF + 640, 'data-fx': 'fade' }) });
  var tL = T0 + N * PER + 120, f = s.factors || null;
  if (f) { var RX = 540, RW = 1168 - RX, gs = f.groups || [], cn = f.center || {};
    K.D(bd, 'kx k-lft', RX, 0, RW, 34, h.esc(f.title || ''), { 'data-at': 200, 'data-fx': 'fade' });
    if (f.lead) K.D(bd, 'kx k-lfl', RX, 42, RW, 26, h.md(f.lead), { 'data-at': tL, 'data-fx': 'rise' });
    var WY = f.lead ? 78 : 50, wl = K.D(bd, 'kx k-lfw', RX, WY, RW, 512 - WY, null, { 'data-at': 260, 'data-fx': 'fade' });
    var gx = RX + 262, gw = 1168 - 16 - gx, gh = gs.map(function (g) { return 48 + (g.items || []).reduce(function (a, it) { return a + 26 + (it.d ? K.lines(it.d, 13, gw - 36) * 19 : 0) }, 0) + 10 });
    var av = 512 - WY - 32 - (gs.length - 1) * 14, s0 = K.sum(gh); if (s0 < av) gh = gh.map(function (v) { return v * Math.min(1.5, av / s0) });
    var tot = K.sum(gh) + (gs.length - 1) * 14, gy = WY + Math.max(16, (512 - WY - tot) / 2), cy = WY + (512 - WY) / 2;
    K.D(bd, 'kx k-lfc', RX + 18, cy - 92, 214, 184, '<i>' + h.esc(cn.icon || '%') + '</i><b>' + h.md(cn.title || '') + '</b>' + (cn.text ? '<span>' + h.md(cn.text) + '</span>' : ''), { 'data-at': tL + 150, 'data-fx': 'pop' });
    var cs = K.svg(ctx);
    gs.forEach(function (g, j) { var y = gy, hh = gh[j], tone = h.col(g.tone || (j ? 'cmp' : 'dark')); gy += hh + 14;
      E('path', { d: 'M' + (RX + 232) + ' ' + cy + ' H' + (RX + 247) + ' V' + (y + 22) + ' H' + (gx - 2), fill: 'none', stroke: C.g65, 'stroke-width': 1.8, 'data-at': tL + 420 + j * 160, 'data-fx': 'draw', 'data-ms': 360 }, cs);
      K.D(bd, 'kx k-lfg', gx, y, gw, hh, '<div class="k-lfgh" style="background:' + tone + '"><b>' + h.esc(g.title || '') + '</b>' + (g.sub ? '<span>' + h.esc(g.sub) + '</span>' : '') + '</div>'
        + '<div class="k-lfb">' + (g.items || []).map(function (it) { return '<div class="k-lfi"><b>' + h.md(it.t || '') + '</b>' + (it.d ? '<span>' + h.md(it.d) + '</span>' : '') + '</div>' }).join('') + '</div>',{ 'data-at': tL + 620 + j * 180, 'data-fx': 'right', 'data-ms': 400 }) }) }
  root._hook = function (r) { if (!all) return 0; var t = T0 + N * PER + 40; h.later(r, function () { h.A(gbox, [{ boxShadow: '0 0 0 0 rgba(0,116,79,.45)' }, { boxShadow: '0 0 0 14px rgba(0,116,79,0)' }], 900, 'ease-out') }, t); return t + 900 } };
})();
