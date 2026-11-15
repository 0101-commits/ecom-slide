/* p_healthb.js — 건강 · 제약 전용 부품(P6 B 담당). 기본 DOM = 끝 모습, 움직임은 data-at · data-fx 로만.
   hxpipe : 후보물질 × 단계 막대 표(바이오 기업 파이프라인)
     칸 stages[단계 이름] · rows[{name, sub, done(통과한 단계 수), state:'go|stop|ok'}] (go = 다음 단계 진행 중 · stop = 다음 단계에서 중단 · ok = 전 단계 통과) · legend{ok,go,stop,none} · sumLabel */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T;

function hxpipe(bd, s, ctx) {
  var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), st = s.stages || [], ns = st.length || 5, rows = s.rows || [], nr = rows.length;
  var ink = dk ? '#003D2B' : '#FFFFFF', x0 = 262, gx = 6, cw = (1168 - x0 - (ns - 1) * gx) / ns, hy = 8, hh = 34, y0 = hy + hh + 10, rh = Math.min(66, Math.floor((512 - y0 - 78) / Math.max(1, nr)));
  var lg = Object.assign({ ok: '통과', go: '진행 중', stop: '중단', none: '아직 안 감' }, s.legend || {});
  var fills = { ok: P.main, go: P.g40, stop: P.warn, none: P.g08 }, inks = { ok: ink, go: P.dark, stop: ink, none: P.mute };
  var gh = E('g', { 'data-at': 0, 'data-fx': 'fade', 'data-ms': 300 }, svg);
  st.forEach(function (n, j) { var x = x0 + j * (cw + gx);
    E('rect', { x: x, y: hy, width: cw, height: hh, rx: 8, fill: P.g18 }, gh);
    T(gh, x + cw / 2, hy + 23, n, { 'font-size': 16, 'font-weight': 800, fill: P.dark, 'text-anchor': 'middle' }) });
  var cnt = { ok: 0, go: 0, stop: 0 };
  rows.forEach(function (r, i) { var y = y0 + i * rh, cy = y + rh / 2, t = 250 + i * 240, g = E('g', { 'data-key': r.name, 'data-at': t, 'data-fx': 'fade', 'data-ms': 300 }, svg);
    if (i % 2 === 0) E('rect', { x: 0, y: y, width: 1168, height: rh, rx: 8, fill: P.paper }, g);
    T(g, 14, cy - 1, r.name, { 'font-size': 17, 'font-weight': 800, fill: P.ink }); T(g, 14, cy + 18, r.sub || '', { 'font-size': 13, fill: P.mute });
    var done = r.done || 0, state = r.state || 'go'; cnt[state] = (cnt[state] || 0) + 1;
    for (var j = 0; j < ns; j++) { var x = x0 + j * (cw + gx), k = j < done ? 'ok' : j === done && state !== 'ok' ? state : 'none', bh = 34, by = cy - bh / 2;
      var rc = E('rect', { x: x, y: by, width: cw, height: bh, rx: 8, fill: fills[k], 'data-at': t + 60 + j * 70, 'data-fx': 'growx', 'data-o': '0% 50%', 'data-ms': 420 }, svg);
      if (k !== 'none') T(svg, x + cw / 2, cy + 5, (k === 'stop' ? '× ' : '') + lg[k], { 'font-size': 14, 'font-weight': 700, fill: inks[k], 'text-anchor': 'middle', 'data-at': t + 260 + j * 70, 'data-fx': 'fade', 'data-ms': 260 }) } });
  /* 아래 요약 줄 : 범례 + 개수 */
  var by2 = y0 + nr * rh + 14, gs = E('g', { 'data-at': 250 + nr * 240 + 400, 'data-fx': 'fade', 'data-ms': 400 }, svg), x = 0;
  E('rect', { x: 0, y: by2, width: 1168, height: 512 - by2 - 6, rx: 12, fill: P.well, stroke: P.line }, gs);
  ['ok', 'go', 'stop', 'none'].forEach(function (k) { var tx = lg[k] + (k === 'none' ? '' : ' ' + cnt[k] + '개');
    E('rect', { x: 28 + x, y: by2 + 23, width: 18, height: 14, rx: 4, fill: fills[k], stroke: k === "none" ? P.axis : "none" }, gs);
    T(gs, 54 + x, by2 + 36, tx, { 'font-size': 15, 'font-weight': 700, fill: P.ink }); x += 54 + h.textW(tx, 15, 1) + 36 });
  if (s.sumLabel) T(gs, 1140, by2 + 36, s.sumLabel, { 'font-size': 15, fill: P.mute, 'text-anchor': 'end' });
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.hxpipe = hxpipe;
ECOM.parts.hxpipe.layouts = ['default'];
ECOM.parts.hxpipe.dark = ['default'];
})();
