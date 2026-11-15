/* term — 일반 용어 정의(식 없는 용어 · 식 용어는 formula) : 낱말 → 한 문장 정의 상자 → 성질 카드 3장 → 관련 숫자 + 작은 차트 → 관련 용어 칩
   tag('용어') · term · en · def · props[3]{title,text} · num{label,note,value,dec,unit,sign,chart:{type,data,first,last,dec,unit},source} · ex{title,items[]}(num 없을 때 구성 상자) · related[] 
   배치 s.layout : default · dict 사전형(표제어 [영문] · 뜻풀이 ①②③④ · 쓰임 예) · picture 그림 풀이(용어 동그라미 + 성질 가지 셋) · calc 계산 예(s.calc{title,steps[{label,value,dec,unit,note}|{op}],result}, 없으면 num 을 결과로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, K = ECOM.kx;
function base(bd, s, ctx) {
  var LW = 540, RX = 572, RW = 1168 - RX, pr = (s.props || []).slice(0, 3), n = s.num || null, rel = s.related || [];
  K.D(bd, 'kx k-tmw', 0, 0, LW, 92, '<span>' + h.esc(s.tag || '용어') + '</span><b>' + h.esc(s.term || '') + '</b>' + (s.en ? '<em>' + h.esc(s.en) + '</em>' : ''), { 'data-b': 1, 'data-fx': 'rise' });
  var dh = Math.max(118, 70 + K.lines(s.def, 18, LW - 60, 0) * 29), relH = rel.length ? 44 : 0, ny = 104 + dh + 16, nh = 512 - ny - (relH ? relH + 14 : 0);
  K.D(bd, 'kx k-tmd', 0, 104, LW, dh, '<i>' + h.esc(s.defLabel || '정의') + '</i><span>' + h.md(s.def || '') + '</span>', { 'data-b': 2, 'data-fx': 'left' });
  var ph = (512 - (pr.length - 1) * 14) / Math.max(1, pr.length);
  pr.forEach(function (p, i) { K.D(bd, 'kx k-tmp', RX, i * (ph + 14), RW, ph, '<em>' + (i + 1) + '</em><div><b>' + h.md(p.title || '') + '</b>' + (p.text ? '<span>' + h.md(p.text) + '</span>' : '') + '</div>', { 'data-b': 3, 'data-fx': 'right' }) });
  if (n) { K.D(bd, 'kx k-tmn', 0, ny, LW, nh, '<div class="k-smh"><b>' + h.esc(n.label || '') + '</b>' + (n.note ? '<span>' + h.esc(n.note) + '</span>' : '') + '</div>'
      + '<div class="k-smv"><span data-b="5" data-fx="count" data-count="' + h.num(n.value) + '" data-dec="' + h.num(n.dec) + '"' + (n.sign ? ' data-sign="1"' : '') + '>' + h.nf(n.value, n.dec || 0, { sign: n.sign }) + '</span><small>' + h.esc(n.unit || '') + '</small></div>'
      + (n.source ? '<div class="k-sms">' + h.esc(n.source) + '</div>' : ''), { 'data-b': 4, 'data-fx': 'rise' });
    if (n.chart) K.mini(K.svg(ctx), n.chart, 250, ny + 44, LW - 250 - 28, nh - 90, 6, 1700) }
  if (!n && s.ex) K.D(bd, 'kx k-tmx', 0, ny, LW, nh, '<b>' + h.esc(s.ex.title || '구성') + '</b><div>' + (s.ex.items || []).map(function (x) { return '<span>' + h.md(x) + '</span>' }).join('') + '</div>', { 'data-b': 4, 'data-fx': 'rise' });
  if (rel.length) K.D(bd, 'kx k-tmr', 0, 512 - relH, LW, relH, '<i>관련 용어</i>' + rel.map(function (r) { return '<span data-b="6" data-fx="pop">' + h.esc(r) + '</span>' }).join(''), {});
  ctx.root.setAttribute('data-gap', 340); ctx.root.setAttribute('data-stg', 110) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ──
   dict    : 사전형 — 큰 표제어 + [영문] + 굵은 밑줄, 왼쪽 「뜻풀이」(정의 → 성질을 ①②③④ 뜻으로), 오른쪽 「쓰임 예」(관련 숫자 + 작은 차트) · 「함께 보면」(관련 용어)
   picture : 그림 풀이 — 왼쪽은 표제어 · 정의 · 관련 숫자, 오른쪽은 한 그림: 가운데 용어 동그라미에서 성질 셋이 가지로 뻗음
   calc    : 계산 예 — 위 표제어 · 정의 → 가운데 「계산 예」 숫자 상자 줄(a ÷ b = 결과) → 아래 성질 셋.
             s.calc{title,steps:[{label,value,dec,unit,note}|{op:'÷'}],result{label,value,dec,unit,note}} 가 있으면 그 계산, 없으면 num 한 칸을 결과로 보임 */
function cn(i) { return '①②③④⑤'.charAt(i) || String(i + 1) }
function pill(txt, bg, col) { return '<i style="font-style:normal;font-size:12.5px;font-weight:700;color:' + col + ';background:' + bg + ';border-radius:999px;padding:2px 11px">' + h.esc(txt) + '</i>' }
function cnt(v, dec, sign) { return 'data-fx="count" data-count="' + h.num(v) + '" data-dec="' + h.num(dec) + '"' + (sign ? ' data-sign="1"' : '') }
function dict(bd, s, ctx) {
  var P = ctx.P, pr = (s.props || []).slice(0, 3), n = s.num || null, rel = s.related || [], LW = 690, RX = 730, RW = 1168 - RX;
  K.D(bd, 'kx', 0, 0, 1168, 112, '<div style="position:absolute;left:0;bottom:16px;right:0;display:flex;align-items:baseline;gap:20px;flex-wrap:nowrap;white-space:nowrap"><b style="font-size:62px;line-height:1;letter-spacing:-.035em;color:' + P.ink + '">' + h.esc(s.term || '') + '</b>' + (s.en ? '<span style="font-size:26px;color:' + P.mute + '">[ ' + h.esc(s.en) + ' ]</span>' : '') + '<i style="font-style:normal;font-size:14px;font-weight:700;color:#fff;background:' + P.main + ';border-radius:4px;padding:2px 10px;align-self:center;margin-left:6px">' + h.esc(s.tag || '용어') + '</i></div><div style="position:absolute;left:0;right:0;bottom:0;height:4px;background:' + P.ink + '"></div>', { 'data-b': 1, 'data-fx': 'wipe', 'data-ms': 520 });
  var sense = [{ t: s.defLabel || '정의', x: s.def, d: 1 }].concat(pr.map(function (p) { return { t: p.title, x: p.text } })), sh = (512 - 136) / sense.length;
  K.D(bd, 'kx', 0, 128, LW, 22, '<i style="font-style:normal;font-size:13px;font-weight:700;letter-spacing:.14em;color:' + P.mute + '">뜻풀이</i>', { 'data-b': 2, 'data-fx': 'fade' });
  sense.forEach(function (q, i) { K.D(bd, 'kx', 0, 156 + i * sh * .97, LW, sh * .97, '<div style="height:100%;display:flex;gap:16px;align-items:' + (q.d ? 'center' : 'flex-start') + ';padding:' + (q.d ? '0' : '10px 0 0') + ';border-top:' + (i ? '1px solid ' + P.line : '0') + '"><em style="font-style:normal;flex:0 0 32px;font-size:' + (q.d ? 30 : 26) + 'px;font-weight:300;line-height:1.1;color:' + P.g65 + '">' + cn(i) + '</em><div style="display:flex;flex-direction:column;gap:5px;line-height:1.5">'
      + (q.d ? '<span style="font-size:20px;font-weight:500;line-height:1.6;color:' + P.ink + '">' + h.md(q.x || '').replace(/<b>/g, '<b style="color:' + P.dark + ';background:linear-gradient(transparent 62%,' + P.g18 + ' 62%)">') + '</span>' : '<b style="font-size:17px;color:' + P.dark + '">' + h.md(q.t || '') + '</b><span style="font-size:15px;line-height:1.55;color:' + P.sub + '">' + h.md(q.x || '') + '</span>') + '</div></div>', { 'data-b': 2 + (i ? i : 0), 'data-fx': 'left', 'data-ms': 420, 'data-key': q.t }) });
  var ex = K.D(bd, 'kx', RX, 128, RW, rel.length ? 276 : 384, '<div style="padding:16px 22px 0;display:flex;flex-direction:column;gap:6px;height:100%;box-sizing:border-box"><div>' + pill('쓰임 예', P.dark, '#fff') + '</div>'
    + (n ? '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:4px"><b style="font-size:16px;color:' + P.ink + '">' + h.esc(n.label || '') + '</b>' + (n.note ? '<span style="font-size:12.5px;color:' + P.mute + '">' + h.esc(n.note) + '</span>' : '') + '</div><div style="font-size:44px;font-weight:700;letter-spacing:-.025em;line-height:1.1;color:' + P.dark + ';font-variant-numeric:tabular-nums;white-space:nowrap"><span data-b="5" ' + cnt(n.value, n.dec, n.sign) + '>' + h.nf(n.value, n.dec || 0, { sign: n.sign }) + '</span><small style="font-size:18px;font-weight:600;margin-left:4px;color:' + P.sub + '">' + h.esc(n.unit || '') + '</small></div>'
      : (s.ex ? '<b style="font-size:16px;color:' + P.ink + '">' + h.esc(s.ex.title || '구성') + '</b>' + (s.ex.items || []).map(function (x) { return '<span style="font-size:15px;line-height:1.55;color:' + P.sub + '">' + h.md(x) + '</span>' }).join('') : '')) + '</div>', { 'data-b': 4, 'data-fx': 'rise', 'data-ms': 440 });
  ex.style.background = P.g08; ex.style.borderRadius = '14px';
  if (n && n.chart) K.mini(K.svg(ctx), n.chart, RX + 22, 128 + 96, RW - 44, 276 - 96 - 8, 6, 1700);
  if (rel.length) K.D(bd, 'kx', RX, 420, RW, 92, '<div style="display:flex;flex-direction:column;gap:9px"><i style="font-style:normal;font-size:13px;font-weight:700;letter-spacing:.1em;color:' + P.mute + '">함께 보면</i><div style="display:flex;flex-wrap:wrap;gap:8px">' + rel.map(function (r) { return '<span data-b="6" data-fx="pop" style="font-size:14px;font-weight:700;color:' + P.dark + ';background:#fff;border:1.5px solid ' + P.g40 + ';border-radius:999px;padding:4px 13px;white-space:nowrap">' + h.esc(r) + '</span>' }).join('') + '</div></div>', {});
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 110) }
function picture(bd, s, ctx) {
  var P = ctx.P, E = h.E, T = h.T, LW = 540, RX = 572, pr = (s.props || []).slice(0, 3), n = s.num || null, rel = s.related || [];
  K.D(bd, 'kx k-tmw', 0, 0, LW, 92, '<span>' + h.esc(s.tag || '용어') + '</span><b>' + h.esc(s.term || '') + '</b>' + (s.en ? '<em>' + h.esc(s.en) + '</em>' : ''), { 'data-b': 1, 'data-fx': 'rise' });
  var dh = Math.max(118, 70 + K.lines(s.def, 18, LW - 60, 0) * 29), ny = 104 + dh + 16, nh = 512 - ny;
  K.D(bd, 'kx k-tmd', 0, 104, LW, dh, '<i>' + h.esc(s.defLabel || '정의') + '</i><span>' + h.md(s.def || '') + '</span>', { 'data-b': 2, 'data-fx': 'left' });
  if (n) { K.D(bd, 'kx k-tmn', 0, ny, LW, nh, '<div class="k-smh"><b>' + h.esc(n.label || '') + '</b>' + (n.note ? '<span>' + h.esc(n.note) + '</span>' : '') + '</div><div class="k-smv"><span data-b="5" ' + cnt(n.value, n.dec, n.sign) + '>' + h.nf(n.value, n.dec || 0, { sign: n.sign }) + '</span><small>' + h.esc(n.unit || '') + '</small></div>', { 'data-b': 4, 'data-fx': 'rise' });
    if (n.chart) K.mini(K.svg(ctx), n.chart, 250, ny + 44, LW - 250 - 28, nh - 70, 6, 1700) }
  var svg = ctx.svg(512), cw = 270, chh = 136, cx = RX + 298, cy = 236, R0 = 68, pos = [[RX, 0], [1168 - cw, 0], [cx - cw / 2, 512 - chh - (rel.length ? 56 : 0)]];
  pr.forEach(function (p, i) { var q = pos[i], mx = q[0] + cw / 2, my = q[1] + chh / 2, a = Math.atan2(my - cy, mx - cx);
    E('line', { x1: cx + Math.cos(a) * R0, y1: cy + Math.sin(a) * R0, x2: mx, y2: my, stroke: P.g40, 'stroke-width': 3, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 420 }, svg) });
  var cg = E('g', { 'data-b': 2, 'data-fx': 'zoom', 'data-ms': 460, 'data-key': s.term }, svg); E('circle', { cx: cx, cy: cy, r: R0 + 9, fill: P.g18 }, cg); E('circle', { cx: cx, cy: cy, r: R0, fill: P.dark }, cg);
  var tl = h.wrap(s.term || '', 22, R0 * 1.5, 1); tl.slice(0, 2).forEach(function (t, i, a) { T(cg, cx, cy + 8 - (a.length - 1) * 12 + i * 26, t, { 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#fff' }) });
  pr.forEach(function (p, i) { var q = pos[i], d = K.D(bd, 'kx', q[0], q[1], cw, chh, '<div style="padding:14px 18px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:6px"><div style="display:flex;align-items:center;gap:10px"><em style="font-style:normal;flex:0 0 28px;height:28px;border-radius:50%;background:' + P.dark + ';color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center">' + (i + 1) + '</em><b style="font-size:16.5px;line-height:1.3;color:' + P.ink + '">' + h.md(p.title || '') + '</b></div>' + (p.text ? '<span style="font-size:14px;line-height:1.5;color:' + P.sub + '">' + h.md(p.text) + '</span>' : '') + '</div>', { 'data-b': 3, 'data-fx': 'pop', 'data-ms': 420, 'data-key': p.title }); d.style.background = '#fff'; d.style.border = '1.5px solid ' + P.g40; d.style.borderRadius = '14px' });
  if (rel.length) K.D(bd, 'kx', RX, 512 - 40, 1168 - RX, 40, '<div style="height:100%;display:flex;align-items:center;gap:8px;white-space:nowrap;overflow:hidden"><i style="font-style:normal;font-size:13px;font-weight:700;color:' + P.mute + ';margin-right:4px">함께 보면</i>' + rel.map(function (r) { return '<span data-b="6" data-fx="pop" style="font-size:13.5px;font-weight:700;color:' + P.dark + ';background:' + P.g08 + ';border-radius:999px;padding:5px 12px">' + h.esc(r) + '</span>' }).join('') + '</div>', {});
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 110) }
function calc(bd, s, ctx) {
  var P = ctx.P, pr = (s.props || []).slice(0, 3), n = s.num || null, c = s.calc;
  if (!c && n) c = { title: (n.note ? n.note + ' ' : '') + n.label, steps: [], result: n };
  c = c || { steps: [], result: { label: '', value: 0 } };
  K.D(bd, 'kx k-tmw', 0, 0, 420, 104, '<span>' + h.esc(s.tag || '용어') + '</span><b>' + h.esc(s.term || '') + '</b>' + (s.en ? '<em>' + h.esc(s.en) + '</em>' : ''), { 'data-b': 1, 'data-fx': 'rise' });
  var dw = 1168 - 444, dh = Math.max(104, 56 + K.lines(s.def, 18, dw - 52, 0) * 29);
  K.D(bd, 'kx k-tmd', 444, 0, dw, dh, '<i>' + h.esc(s.defLabel || '정의') + '</i><span>' + h.md(s.def || '') + '</span>', { 'data-b': 2, 'data-fx': 'left' });
  var y0 = Math.max(dh, 104) + 22;
  K.D(bd, 'kx', 0, y0, 1168, 30, '<div style="display:flex;align-items:center;gap:12px">' + pill('계산 예', P.dark, '#fff') + '<b style="font-size:17px;color:' + P.ink + '">' + h.esc(c.title || '') + '</b></div>', { 'data-b': 3, 'data-fx': 'fade' });
  var seq = (c.steps || []).slice(), tiles = seq.filter(function (q) { return !q.op }).length + 1, ops = seq.filter(function (q) { return q.op }).length + (seq.length ? 1 : 0), OW = 56, TW = (1168 - ops * OW) / tiles, TY = y0 + 44, TH = 150, x = 0, lvl = 3;
  var tile = function (q, res) { var d = K.D(bd, 'kx', x, TY, TW, TH, '<div style="padding:16px 22px 0;height:100%;box-sizing:border-box;display:flex;flex-direction:column"><b style="font-size:16px;color:' + (res ? '#fff' : P.ink) + '">' + h.esc(q.label || '') + '</b><div style="margin-top:8px;font-size:46px;font-weight:700;letter-spacing:-.03em;line-height:1.1;color:' + (res ? '#fff' : P.dark) + ';font-variant-numeric:tabular-nums;white-space:nowrap"><span data-b="' + lvl + '" ' + cnt(q.value, q.dec, q.sign) + '>' + h.nf(q.value, q.dec || 0, { sign: q.sign }) + '</span><small style="font-size:18px;font-weight:600;margin-left:5px;color:' + (res ? 'rgba(255,255,255,.86)' : P.sub) + '">' + h.esc(q.unit || '') + '</small></div>' + (q.note ? '<span style="margin-top:auto;padding-bottom:14px;font-size:13.5px;color:' + (res ? 'rgba(255,255,255,.86)' : P.mute) + '">' + h.esc(q.note) + '</span>' : '') + '</div>', { 'data-b': lvl, 'data-fx': res ? 'pop' : 'rise', 'data-ms': 440, 'data-key': q.label }); d.style.background = res ? P.dark : P.g08; d.style.borderRadius = '14px'; x += TW };
  var opb = function (g) { K.D(bd, 'kx', x, TY, OW, TH, '<div style="height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:700;color:' + P.mute + '">' + h.esc(g) + '</div>', { 'data-b': lvl, 'data-fx': 'fade' }); x += OW };
  seq.forEach(function (q) { if (q.op) { lvl++; opb(q.op) } else tile(q, false) });
  if (seq.length) { lvl++; opb('=') } tile(c.result, true);
  var py = TY + TH + 26, ph = 512 - py, pw = (1168 - (pr.length - 1) * 16) / Math.max(1, pr.length);
  pr.forEach(function (p, i) { K.D(bd, 'kx k-tmp', i * (pw + 16), py, pw, ph, '<em>' + (i + 1) + '</em><div><b>' + h.md(p.title || '') + '</b>' + (p.text ? '<span>' + h.md(p.text) + '</span>' : '') + '</div>', { 'data-b': lvl + 1, 'data-fx': 'rise', 'data-ms': 420, 'data-key': p.title }); bd.lastChild.style.gap = '14px'; bd.lastChild.style.padding = '0 20px' });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 110) }
var LAY = { dict: dict, picture: picture, calc: calc }, baseFn = base;
ECOM.parts.term = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.term.layouts = ['default', 'dict', 'picture', 'calc'];
})();
