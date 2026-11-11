/* balance — 저울(CW44 11쪽) : 받침 → 수평 막대 · 추 → 무거운 쪽으로 기울어 흔들리다 멈춤 → 양쪽 특성 목록 → 아래 차이 · 결론
   left/right{label,value,dec,unit,sub,title,items:['글'|{t,v,d}],tone} · period('2026.10') · from{left:{value},right:{value},period}(쌓기 중 이 상태에서 출발)
   diff{label,dec,unit,sign}(왼 − 오른 값을 아래 상자에 읽어 줌) · summary(아래 띠 글) · beats[{left:{value},right:{value},period,note}](바뀜 = 다른 시점으로 다시 기욺) · tilt(도, 직접 지정) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
ECOM.parts.balance = function (bd, s, ctx) {
  var root = ctx.root, L = s.left || {}, R = s.right || {}, PX = 584, PY = 126, LB = 232, HG = 22, MAXA = 12 * Math.PI / 180;
  function st(o) { return { lv: +((o.left || {}).value != null ? o.left.value : L.value), rv: +((o.right || {}).value != null ? o.right.value : R.value), period: o.period || '', note: o.note, tilt: o.tilt } }
  var S = [{ lv: +L.value, rv: +R.value, period: s.period || '', note: s.summary || s.concl, tilt: s.tilt }].concat((s.beats || []).map(st)), FR = s.from ? st(s.from) : null;
  var vmax = 0; S.concat(FR ? [FR] : []).forEach(function (q) { vmax = Math.max(vmax, Math.abs(q.lv), Math.abs(q.rv)) }); vmax = vmax || 1;
  function ang(q) { if (q.tilt != null) return q.tilt * Math.PI / 180; var d = (q.lv - q.rv) / Math.max(Math.abs(q.lv), Math.abs(q.rv), 1e-9); return MAXA * Math.max(-1, Math.min(1, d / .25)) }
  function rad(v) { return 56 + 28 * Math.sqrt(Math.abs(v) / vmax) }
  function fmt(v, o) { return h.nf(v, o.dec == null ? 1 : o.dec) }
  // 양쪽 목록
  [L, R].forEach(function (o, k) { if (!o.items && !o.title) return; var tone = h.col(o.tone || (k ? 'cmp' : 'main'));
    K.D(bd, 'kx k-blc' + (k ? ' r' : ''), k ? 916 : 0, 0, 252, 436,'<div class="k-blh" style="background:' + tone + '">' + h.esc(o.title || o.label || '') + '</div><div class="k-blb">' + (o.items || []).map(function (x) { return '<div class="k-bli">' + (typeof x === 'string' ? '<span>' + h.md(x) + '</span>' : '<div><b>' + h.esc(x.t || '') + '</b>' + (x.v ? '<em>' + h.esc(x.v) + '</em>' : '') + (x.d ? '<span>' + h.md(x.d) + '</span>' : '') + '</div>') + '</div>' }).join('') + '</div>',
      { 'data-b': 4, 'data-fx': k ? 'left' : 'right', 'data-ms': 420 }) });
  var svg = K.svg(ctx), sd = h.lv(svg, 1, { 'data-fx': 'fade', 'data-ms': 420 });
  E('rect', { x: PX - 5, y: PY, width: 10, height: 300, rx: 3, fill: C.cmp }, sd);
  E('path', { d: 'M' + (PX - 104) + ' 440 L' + (PX - 80) + ' 420 H' + (PX + 80) + ' L' + (PX + 104) + ' 440 Z', fill: C.cmp }, sd);
  E('path', { d: 'M' + (PX - 18) + ' ' + (PY + 2) + ' L' + PX + ' ' + (PY - 22) + ' L' + (PX + 18) + ' ' + (PY + 2) + ' Z', fill: C.dark }, sd);
  var beam = E('line', { x1: PX - LB, x2: PX + LB, y1: PY, y2: PY, stroke: C.ink, 'stroke-width': 7, 'stroke-linecap': 'round', 'data-b': 2, 'data-fx': 'fade' }, svg);
  E('circle', { cx: PX, cy: PY, r: 8, fill: '#fff', stroke: C.ink, 'stroke-width': 3, 'data-b': 2, 'data-fx': 'fade' }, svg);
  var pc = E('g', { 'data-b': 2, 'data-fx': 'pop' }, svg), pT = null;
  if (s.period || FR) { E('rect', { x: PX - 62, y: PY - 92, width: 124, height: 32, rx: 16, fill: C.dark }, pc); pT = T(pc, PX, PY - 70.5, '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff' }) }
  var sides = [L, R].map(function (o, k) { var tone = h.col(o.tone || (k ? 'cmp' : 'main')), hang = E('line', { stroke: C.ink, 'stroke-width': 2, 'data-b': 2, 'data-fx': 'fade' }, svg);
    var og = E('g', {}, svg), ig = E('g', { 'data-b': 3, 'data-fx': 'pop', 'data-ms': 420 }, og), c = E('circle', { cx: 0, cy: 0, r: 60, fill: tone }, ig);
    var u = o.unit || '', inl = u.length <= 2, v = T(ig, 0, inl ? 8 : 2, '', { 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 700, fill: '#fff', 'letter-spacing': '-0.02em' });
    var un = inl ? null : T(ig, 0, 22, u, { 'text-anchor': 'middle', 'font-size': 12.5, fill: '#fff', 'fill-opacity': .88 });
    var lb = T(ig, 0, 0, o.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }), sb = o.sub ? T(ig, 0, 0, o.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) : null;
    return { o: o, hang: hang, og: og, c: c, v: v, u: inl ? u : '', lb: lb, sb: sb } });
  var dff = null;
  if (s.diff || s.summary || s.concl || S.some(function (q) { return q.note })) { var bx = K.D(bd, 'kx k-bld', 0, 452, 1168, 60,(s.diff ? '<div class="k-bldv"><span>' + h.esc(s.diff.label || '') + '</span><b></b></div>' : '') + '<div class="k-bldn"></div>', { 'data-b': 5, 'data-fx': 'rise' });
    dff = { v: bx.querySelector('.k-bldv b'), n: bx.querySelector('.k-bldn') }; if (!s.diff) bx.classList.add('nod') }
  var shown = null;
  function draw(q) { var a = q.a, ca = Math.cos(a), sa = Math.sin(a), P = [[PX - LB * ca, PY + LB * sa], [PX + LB * ca, PY - LB * sa]];
    beam.setAttribute('x1', P[0][0]); beam.setAttribute('y1', P[0][1]); beam.setAttribute('x2', P[1][0]); beam.setAttribute('y2', P[1][1]);
    [q.lv, q.rv].forEach(function (val, k) { var sdk = sides[k], r = rad(val), x = P[k][0], y = P[k][1];
      sdk.hang.setAttribute('x1', x); sdk.hang.setAttribute('x2', x); sdk.hang.setAttribute('y1', y); sdk.hang.setAttribute('y2', y + HG);
      sdk.og.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + (y + HG + r).toFixed(2) + ')'); sdk.c.setAttribute('r', r.toFixed(2));
      sdk.v.textContent = fmt(val, sdk.o) + sdk.u; sdk.lb.setAttribute('y', r + 24); if (sdk.sb) sdk.sb.setAttribute('y', r + 42) });
    if (pT) pT.textContent = q.period || '';
    if (dff) { if (dff.v) dff.v.textContent = h.nf(q.lv - q.rv, s.diff.dec == null ? 1 : s.diff.dec, { sign: s.diff.sign }) + (s.diff.unit || ''); dff.n.innerHTML = h.md(q.note || s.summary || s.concl || '') }
    shown = q }
  function full(q) { return { lv: q.lv, rv: q.rv, a: ang(q), period: q.period, note: q.note } }
  function tween(a, b, ms) { root._raf = root._raf || []; if (h.RM()) { draw(b); return }
    var t0 = null; function f(ts) { if (t0 === null) t0 = ts; var p = Math.min(1, (ts - t0) / ms), e = 1 - Math.pow(1 - p, 3), sp = p >= 1 ? 1 : 1 - Math.cos(p * Math.PI * 2.5) * Math.exp(-4.2 * p);
      draw({ lv: a.lv + (b.lv - a.lv) * e, rv: a.rv + (b.rv - a.rv) * e, a: a.a + (b.a - a.a) * sp, period: p < .5 ? a.period : b.period, note: p < .5 ? a.note : b.note }); if (p < 1) root._raf.push(requestAnimationFrame(f)) }
    root._raf.push(requestAnimationFrame(f)) }
  draw(full(S[0]));
  root._reset = function () { draw(full(S[root._bk || 0])) };
  root._hook = function () { root._bk = 0; var b = full(S[0]), a = FR ? full(FR) : { lv: b.lv, rv: b.rv, a: 0, period: b.period, note: b.note }; draw(a);
    var t1 = FR ? 1700 : 1150; h.later(root, function () { tween(a, b, FR ? 1700 : 1400) }, t1); return t1 + (FR ? 1700 : 1400) };
  root._beat = function (k) { root._bk = k; if (!shown) return; tween(shown, full(S[Math.min(k, S.length - 1)]), 1500) };
  root._nb = S.length - 1; root.setAttribute('data-gap', 340) };
})();
