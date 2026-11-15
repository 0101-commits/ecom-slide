/* statement — 결론 문장 + 근거 숫자 3개 : 문장이 오르고 핵심 구에 형광 띠가 칠해짐 → 근거 카드 3장 → 숫자 굴림 → 작은 차트 그려짐
   text('**핵심 구**' 2줄) · sub · evidence[3]{label,note,value,dec,unit,sign,chart:{type:'spark|bars|step',data,first,last,dec,unit,lo,hi},source} 
   배치 s.layout : default · steps 숫자 셋 계단(근거가 계단으로 올라 결론 띠에 닿음) · onepic 한 그림 요약(같은 눈금 가로 막대 + 결론 띠) · deep 짙은 바탕(bg:'deep') */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
function base(bd, s, ctx) {
  var root = ctx.root, ev = (s.evidence || []).slice(0, 3), N = ev.length || 1, gap = 20, cw = (1168 - (N - 1) * gap) / N, CY = 212, CH = 512 - CY;
  var tx = K.D(bd, 'kx k-sm', 0, 0, 1168, CY - 16, '<div>' + (s.label !== false ? '<em class="k-smk" data-b="1" data-fx="pop">' + h.esc(s.label || '결론') + '</em>' : '') + '<p data-b="1">' + h.md(s.text || '') + '</p>' + (s.sub ? '<span data-b="2" data-fx="fade">' + h.md(s.sub) + '</span>' : '') + '</div>');
  ev.forEach(function (e, i) { var x = i * (cw + gap);
    K.D(bd, 'kx k-sme', x, CY, cw, CH, '<div class="k-smh"><b>' + h.esc(e.label || '') + '</b>' + (e.note ? '<span>' + h.esc(e.note) + '</span>' : '') + '</div>'
      + '<div class="k-smv"><span data-b="4" data-fx="count" data-count="' + h.num(e.value) + '" data-dec="' + h.num(e.dec) + '"' + (e.sign ? ' data-sign="1"' : '') + '>' + h.nf(e.value, e.dec || 0, { sign: e.sign }) + '</span><small>' + h.esc(e.unit || '') + '</small></div>'
      + (e.source ? '<div class="k-sms">' + h.esc(e.source) + '</div>' : ''), { 'data-b': 3, 'data-fx': 'rise', 'data-ms': 420 }) });
  var svg = K.svg(ctx);
  ev.forEach(function (e, i) { if (e.chart) K.mini(svg, e.chart, i * (cw + gap) + 24, CY + 120, cw - 48, 118, 5, 1440 + i * 130) });
  root._reset = function () { tx.classList.add('on') };
  root._hook = function (r) { tx.classList.remove('on'); h.later(r, function () { tx.classList.add('on') }, 520); return 1300 };
  root.setAttribute('data-gap', 360); root.setAttribute('data-stg', 130) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ──
   steps  : 숫자 셋 계단 — 근거 카드가 왼쪽부터 한 계단씩 올라가 맨 위 결론 띠에 닿음(근거 칸에 chart 있으면 계단 안에 작은 차트)
   onepic : 한 그림 요약 — 근거 값을 같은 눈금의 가로 막대 한 장으로 비교 + 아래 결론 띠 한 줄(근거 chart 는 오른쪽 작은 추이)
   deep   : 짙은 바탕(장 칸 bg:'deep') — 큰 문장 아래에 근거 숫자 셋을 카드 없이 세로 줄로 나눠 보임 */
var E2 = h.E, T2 = h.T;
function mini(svg, m, x, y, w, hh, P, lvl, bgc) {
  var d = m.data || [], n = d.length; if (!n) return; var dec = m.dec == null ? 1 : m.dec, un = m.unit || '', bars = (m.type || 'spark') === 'bars', e = h.ext(d), lo = bars ? Math.min(0, e[0]) : e[0] - (e[1] - e[0]) * .18, hi = e[1] + (e[1] - e[0]) * .1;
  if (hi === lo) { hi += 1; lo -= 1 } var top = y + 22, bot = y + hh - 20, Y = h.lin(lo, hi, bot, top), g = E2('g', { 'data-b': lvl, 'data-fx': 'fade', 'data-ms': 500 }, svg), HL = { stroke: bgc, 'stroke-width': 3.5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, f = function (v) { return h.nf(v, dec) + un };
  if (bars) { var st = w / n, bw = Math.min(30, st * .66), z = Y(Math.max(lo, Math.min(hi, 0))); E2('line', { x1: x, x2: x + w, y1: z, y2: z, stroke: P.axis }, g);
    d.forEach(function (v, i) { var yv = Y(v); E2('rect', { x: x + i * st + (st - bw) / 2, y: Math.min(yv, z), width: bw, height: Math.max(1.5, Math.abs(z - yv)), rx: 2, fill: i === n - 1 ? (v < 0 ? P.cmp : P.main) : (v < 0 ? P.gray : P.g40), 'data-b': lvl, 'data-fx': 'grow', 'data-o': v < 0 ? '50% 0%' : '50% 100%', 'data-ms': 420 }, svg) });
    T2(g, x + w, y + 14, f(d[n - 1]), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: P.dark }, HL)) }
  else { var X = function (i) { return x + (n === 1 ? w : w * i / (n - 1)) }, path = h.lineD(d, X, Y);
    E2('line', { x1: x, x2: x + w, y1: bot, y2: bot, stroke: P.grid }, g); E2('path', { d: path + ' L' + X(n - 1) + ' ' + bot + ' L' + X(0) + ' ' + bot + ' Z', fill: P.g08 }, g);
    E2('path', { d: path, fill: 'none', stroke: P.main, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-b': lvl, 'data-fx': 'draw', 'data-ms': 900 }, svg);
    E2('circle', { cx: X(n - 1), cy: Y(d[n - 1]), r: 4.5, fill: P.dark, stroke: bgc, 'stroke-width': 1.5 }, g); T2(g, X(n - 1), Y(d[n - 1]) - 10, f(d[n - 1]), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: P.dark }, HL)) }
  if (m.first) T2(g, bars ? x + w / (2 * n) : x, y + hh - 4, m.first, { 'text-anchor': bars ? 'middle' : 'start', 'font-size': 12, fill: P.mute });
  if (m.last) T2(g, bars ? x + w - w / (2 * n) : x + w, y + hh - 4, m.last, { 'text-anchor': bars ? 'middle' : 'end', 'font-size': 12, 'font-weight': 700, fill: P.ink }) }
function valHTML(e, lvl, size, col, ucol) { return '<span data-b="' + lvl + '" data-fx="count" data-count="' + h.num(e.value) + '" data-dec="' + h.num(e.dec) + '"' + (e.sign ? ' data-sign="1"' : '') + '>' + h.nf(e.value, e.dec || 0, { sign: e.sign }) + '</span><small style="font-size:' + Math.round(size * .42) + 'px;font-weight:600;margin-left:5px;color:' + ucol + '">' + h.esc(e.unit || '') + '</small>' }
function steps(bd, s, ctx) {
  var P = ctx.P, ev = (s.evidence || []).slice(0, 3), N = Math.max(1, ev.length), cw = 1168 / N, BH = 102, STEP = 90, Hmax = 512 - BH - 16, charts = [], svg;
  ev.forEach(function (e, i) { var hh = Hmax - (N - 1 - i) * STEP, y = 512 - hh, x = i * cw, last = i === N - 1;
    K.D(bd, 'kx', x, y, cw - (last ? 0 : 0), hh, '<div style="position:absolute;left:0;right:0;top:0;height:5px;background:' + (last ? P.dark : P.g65) + '"></div><div style="padding:20px 26px 0"><div style="display:flex;align-items:center;gap:10px"><i style="font-style:normal;font-size:12.5px;font-weight:700;color:#fff;background:' + (last ? P.dark : P.g65) + ';border-radius:999px;padding:2px 11px">근거 ' + (i + 1) + '</i><b style="font-size:18px;color:' + P.ink + '">' + h.esc(e.label || '') + '</b>' + (e.note ? '<span style="font-size:13px;color:' + P.mute + ';margin-left:auto">' + h.esc(e.note) + '</span>' : '') + '</div>'
      + '<div style="margin-top:10px;font-size:50px;font-weight:700;letter-spacing:-.025em;line-height:1.1;color:' + P.dark + ';font-variant-numeric:tabular-nums;white-space:nowrap">' + valHTML(e, i + 1, 50, P.dark, P.sub) + '</div></div>',
      { 'data-b': i + 1, 'data-fx': 'rise', 'data-ms': 460, 'data-key': e.label, style: null }); bd.lastChild.style.background = last ? P.g18 : P.g08; bd.lastChild.style.borderRadius = '4px 4px 0 0'; bd.lastChild.style.borderLeft = i ? '3px solid #fff' : '0';
    if (e.chart) charts.push(function () { mini(svg, e.chart, x + 26, y + 112, cw - 52, hh - 120, P, i + 1, i === N - 1 ? P.g18 : P.g08) }) });
  svg = K.svg(ctx); charts.forEach(function (f) { f() });
  K.D(bd, 'kx', 0, 0, 1168, BH, '<div style="display:flex;align-items:center;gap:20px;height:100%;padding:0 30px"><i style="font-style:normal;flex:0 0 auto;font-size:13px;font-weight:700;color:' + P.dark + ';background:#fff;border-radius:999px;padding:3px 13px">' + h.esc(s.label || '결론') + '</i><p style="margin:0;font-size:26px;font-weight:600;line-height:1.38;letter-spacing:-.02em;color:#fff">' + h.md(s.text || '').replace(/<b>/g, '<b style="color:' + ECOM.Cd.main + '">') + '</p></div>',
    { 'data-b': N + 1, 'data-fx': 'drop', 'data-dy': -30, 'data-ms': 520 }); bd.lastChild.style.background = P.dark; bd.lastChild.style.borderRadius = '14px';
  if (s.sub) K.D(bd, 'kx', 0, BH + 22, Math.max(300, (N - 1) * cw - 20), 60, '<span style="font-size:15px;line-height:1.5;color:' + P.mute + '">' + h.md(s.sub) + '</span>', { 'data-b': N + 1, 'data-fx': 'fade' });
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 120) }
function onepic(bd, s, ctx) {
  var P = ctx.P, ev = (s.evidence || []).slice(0, 3), N = Math.max(1, ev.length), svg, AH = 372, rg = 14, rh = (AH - (N - 1) * rg) / N, BX = 236, BW = 460, mx = Math.max.apply(null, ev.map(function (e) { return Math.abs(e.value) })) || 1, sx = 940, sw = 1168 - sx;
  ev.forEach(function (e, i) { K.D(bd, 'kx', 0, i * (rh + rg), 1168, rh, '', { 'data-b': 1, 'data-fx': 'fade' }); bd.lastChild.style.background = P.paper; bd.lastChild.style.borderRadius = '12px' });
  svg = K.svg(ctx);
  E2('line', { x1: BX, x2: BX, y1: 0, y2: AH, stroke: P.axis, 'data-b': 1 }, svg);
  ev.forEach(function (e, i) { var y = i * (rh + rg), cy = y + rh / 2, wd = Math.max(8, BW * Math.abs(e.value) / mx), tb = y + (rh - 54) / 2;
    K.D(bd, 'kx', 0, y, BX - 16, rh, '<div style="height:100%;display:flex;flex-direction:column;justify-content:center;text-align:right"><b style="font-size:20px;color:' + P.ink + '">' + h.esc(e.label || '') + '</b>' + (e.note ? '<span style="font-size:13.5px;color:' + P.mute + ';margin-top:3px">' + h.esc(e.note) + '</span>' : '') + '</div>', { 'data-b': 1, 'data-fx': 'fade', 'data-key': e.label });
    E2('rect', { x: BX, y: tb, width: wd, height: 54, rx: 3, fill: e.value < 0 ? P.cmp : P.g65, 'data-b': 2 + i, 'data-fx': 'growx', 'data-ms': 640, 'data-key': e.label }, svg);
    K.D(bd, 'kx', BX + wd + 16, y, 260, rh, '<div style="height:100%;display:flex;align-items:center;font-size:40px;font-weight:700;letter-spacing:-.025em;color:' + P.dark + ';font-variant-numeric:tabular-nums;white-space:nowrap">' + valHTML(e, 2 + i, 40, P.dark, P.sub) + '</div>', { 'data-b': 2 + i, 'data-fx': 'fade' });
    if (e.chart) { var c = e.chart; mini(svg, c, sx, y + 8, sw, rh - 16, P, 2 + i, P.paper) } });
  var cap = ev.length && ev[0].chart ? '오른쪽 작은 그림 : 월간 값 추이' : ''; if (cap) T2(svg, sx, AH + 20, cap, { 'font-size': 12.5, fill: P.mute, 'data-b': 2, 'data-fx': 'fade' });
  K.D(bd, 'kx', 0, 404, 1168, 108, '<div style="display:flex;align-items:center;gap:20px;height:100%;padding:0 30px"><i style="font-style:normal;flex:0 0 auto;font-size:13px;font-weight:700;color:' + P.dark + ';background:#fff;border-radius:999px;padding:3px 13px">' + h.esc(s.label || '결론') + '</i><p style="margin:0;font-size:27px;font-weight:600;line-height:1.4;letter-spacing:-.02em;color:#fff">' + h.md(s.text || '').replace(/<b>/g, '<b style="color:' + ECOM.Cd.main + '">') + '</p></div>', { 'data-b': N + 2, 'data-fx': 'rise', 'data-ms': 520 }); bd.lastChild.style.background = P.dark; bd.lastChild.style.borderRadius = '14px';
  ctx.root.setAttribute('data-gap', 380); ctx.root.setAttribute('data-stg', 120) }
var DCSS = false;
function deep(bd, s, ctx) {
  var P = ctx.P, ev = (s.evidence || []).slice(0, 3), N = Math.max(1, ev.length), charts = [], gap = 20, cw = (1168 - (N - 1) * gap) / N, CY = 236, svg;
  if (!DCSS) { DCSS = true; var st = document.createElement('style'); st.textContent = '.k-smd p{margin:0;font-size:37px;font-weight:600;line-height:1.4;letter-spacing:-.02em;color:#fff}.k-smd p b{color:#8FD9B6;font-weight:700;background:linear-gradient(transparent 66%,rgba(143,217,182,.3) 66%) no-repeat;background-size:0% 100%}.k-smd.on p b{background-size:100% 100%;transition:background-size .8s cubic-bezier(.2,0,.38,.9)}.k-smd span{font-size:15px;color:rgba(255,255,255,.62);line-height:1.5}'; document.head.appendChild(st) }
  var tx = K.D(bd, 'kx k-smd', 0, 0, 1168, CY - 30, '<div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:12px"><em data-b="1" data-fx="pop" style="align-self:flex-start;font-style:normal;font-size:13px;font-weight:700;color:#003D2B;background:#8FD9B6;border-radius:999px;padding:3px 12px">' + h.esc(s.label || '결론') + '</em><p data-b="1">' + h.md(s.text || '') + '</p>' + (s.sub ? '<span data-b="2" data-fx="fade">' + h.md(s.sub) + '</span>' : '') + '</div>');
  ev.forEach(function (e, i) { var x = i * (cw + gap);
    K.D(bd, 'kx', x, CY, cw, 512 - CY, '<div style="padding:18px 24px 0"><div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px"><b style="font-size:17px;color:' + P.ink + '">' + h.esc(e.label || '') + '</b>' + (e.note ? '<span style="font-size:12.5px;color:' + P.mute + ';white-space:nowrap">' + h.esc(e.note) + '</span>' : '') + '</div>'
      + '<div style="margin-top:6px;font-size:56px;font-weight:700;letter-spacing:-.03em;line-height:1.1;color:' + P.main + ';font-variant-numeric:tabular-nums;white-space:nowrap">' + valHTML(e, 4, 56, P.main, P.sub) + '</div></div>', { 'data-b': 3, 'data-fx': 'rise', 'data-ms': 420, 'data-key': e.label }); bd.lastChild.style.background = P.g08; bd.lastChild.style.borderRadius = '14px';
    if (e.chart) charts.push(function () { mini(svg, e.chart, x + 24, CY + 126, cw - 48, 146, P, 5, P.g08) }) });
  svg = K.svg(ctx); charts.forEach(function (f) { f() });
  ctx.root._reset = function () { tx.classList.add('on') };
  ctx.root._hook = function (r) { tx.classList.remove('on'); h.later(r, function () { tx.classList.add('on') }, 520); return 1300 };
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 130) }
var LAY = { steps: steps, onepic: onepic, deep: deep }, baseFn = base;
ECOM.parts.statement = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.statement.layouts = ['default', 'steps', 'onepic', 'deep'];
ECOM.parts.statement.dark = ['deep'];
})();
