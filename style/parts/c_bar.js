/* bar — 시간 막대(재생 막대 · 괄호 · 주석 · 결정 줄 · 분포) — CW48 7장 틀
   labels · data · y{min,max,step,dec,unit} · unit('%p' 읽어 주기 단위) · phases · playback(true)
   hi[{max|last|eq|idx:[...]|from,to, color}] · beats[{hi:[...], dim:['brackets','notes','last']}] · brackets[{from,to,text,sub}]
   notes[{at,text,sub,pos:'above|below',anchor}] · last{text} · lanes[{name,sub,color,values:[n+1 개, 첫 값 = 앞 달]}] · laneSum[{text,color}] · laneNote
   dist{title,sub,from,to,avg:true,avgText} */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, u;
function rule(r, i, v, n, mx) { if (r.idx) return r.idx.indexOf(i) >= 0; if (r.max) return v === mx; if (r.last) return i === n - 1; if (r.eq != null) return v === r.eq; if (r.from != null) return i >= r.from && i <= (r.to == null ? n - 1 : r.to); return false }
ECOM.parts.bar = function (bd, s, ctx) { u = ECOM.u;
  var labels = s.labels || [], data = s.data || [], n = data.length, root = ctx.root, svg = ctx.svg(512), lanes = s.lanes || [];
  var top = s.phases ? 60 : 34, bot = lanes.length ? 300 : 470, ml = 58, x1 = s.dist ? 880 : 1168, slot = (x1 - ml) / n, bw = Math.max(3, Math.min(48, slot * .6)), dec = (s.y && s.y.dec != null) ? s.y.dec : 2;
  function X(i) { return ml + slot * (i + .5) }
  var sc = u.yScale(data.concat([0]), s.y, top, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' }), mx = Math.max.apply(null, data);
  if (s.phases) u.phaseBands(g1, s.phases, X, slot / 2, top, bot, 30);
  u.yAxis(g1, ml, x1, sc, { unit: s.y && s.y.unit });
  u.xLabels(g1, labels, X, bot + 18, u.xTicks(n, 10, s.ticks), { boldLast: true });
  var T0 = s.playback ? 450 : 0, PB = s.playback ? Math.max(18, Math.min(60, 2300 / n)) : 0, B = [];
  data.forEach(function (v, i) { var hgt = Math.abs(Y(v) - Y(0)), a = { x: X(i) - bw / 2, y: v >= 0 ? Y(v) : Y(0), width: bw, height: Math.max(hgt, 1.5), rx: Math.min(2, bw / 4), fill: v < 0 ? C.light : C.gray, 'data-fx': 'grow', 'data-ms': s.playback ? 260 : 420, 'data-o': v >= 0 ? '50% 100%' : '50% 0%' };
    if (s.playback) a['data-at'] = T0 + i * PB; else { a['data-b'] = 2 } B.push({ i: i, v: v, r: E('rect', a, svg) }) });
  if (!s.playback) root.setAttribute('data-stg', Math.max(4, Math.min(30, 600 / n)));
  var tEnd = T0 + (n - 1) * PB + 300, AT = function (ms) { return s.playback ? { 'data-at': ms } : { 'data-b': 3 } };
  /* 결정 줄 */
  if (lanes.length) { var sum = h.lv(svg, 1); lanes.forEach(function (ln, r) { var cy = 374 + r * 60, c = h.col(ln.color || (r ? 'main' : 'cmp')), g = h.lv(svg, 1);
      T(g, 0, cy - 2, ln.name, { 'font-size': 14, 'font-weight': 700, fill: C.ink }); T(g, 0, cy + 14, ln.sub || '결정', { 'font-size': 12, fill: C.mute });
      E('line', { x1: ml, x2: x1, y1: cy, y2: cy, stroke: C.grid, 'stroke-width': 2 }, g);
      var vv = ln.values || [], st = ln.step || .25; for (var i = 0; i < n; i++) { var dv = +((vv[i + 1] || 0) - (vv[i] || 0)).toFixed(4); if (!dv || vv[i] == null || vv[i + 1] == null) continue;
        var at2 = s.playback ? { 'data-at': T0 + i * PB + 60, 'data-fx': 'pop', 'data-ms': 260 } : { 'data-b': 4, 'data-fx': 'pop' }; h.tri(svg, X(i), cy, dv > 0, 4 + Math.abs(dv) / st * 2.2, c, at2) }
      if (s.laneSum && s.laneSum[r]) T(svg, x1 + 22, cy + 5, s.laneSum[r].text || s.laneSum[r], Object.assign({ 'font-size': 14, 'font-weight': 700, fill: c, 'data-fx': 'fade' }, AT(tEnd + 200))) });
    if (s.laneSumTitle) T(svg, x1 + 22, 350, s.laneSumTitle, Object.assign({ 'font-size': 12, fill: C.mute }, AT(tEnd + 200)));
    if (s.laneNote) T(svg, ml, 486, s.laneNote, Object.assign({ 'font-size': 12.5, fill: C.mute, 'data-fx': 'fade' }, AT(tEnd + 300))) }
  /* 주석 */
  var an = E('g', AT(tEnd + 120), svg), BR = [], NT = [], LS = null;
  (s.brackets || []).forEach(function (b) { var x0 = X(b.from) - bw / 2, xb = X(b.to) + bw / 2, m = -Infinity; for (var i = b.from; i <= b.to; i++) m = Math.max(m, data[i]);
    var y = Y(m) - 12, q = E('g', {}, an); h.bracket(q, x0, xb, y, C.dark); T(q, (x0 + xb) / 2, y - 9, b.text, { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.dark });
    if (b.sub) T(q, (x0 + xb) / 2, y - 26, b.sub, { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }); BR.push(q) });
  (s.notes || []).forEach(function (nt) { var q = E('g', {}, an), x = X(nt.at), v = data[nt.at], an2 = nt.anchor || 'end', tx = x + (an2 === 'end' ? 6 : an2 === 'start' ? -6 : 0), L = nt.len || 34, side = X(nt.at) > (ml + x1) / 2 ? -1 : 1;
    var below = nt.pos === 'below', yEnd = below ? Y(Math.min(0, v)) : Y(Math.max(0, v)), room = below ? (bot - 8) - (yEnd + L + 34) : (yEnd - L - 38) - (top - 6);
    if (room < 0) { var bx = x + side * (bw / 2 + 8), by = below ? yEnd - 6 : yEnd + 16; E('line', { x1: x + side * bw / 2, x2: bx - side * 2, y1: yEnd + (below ? -3 : 3), y2: yEnd + (below ? -3 : 3), stroke: C.mute }, q);
      T(q, bx, by - (nt.sub ? 8 : 0), nt.text, { 'text-anchor': side > 0 ? 'start' : 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, bx, by + 9, nt.sub, { 'text-anchor': side > 0 ? 'start' : 'end', 'font-size': 12.5, fill: C.mute }); NT.push(q); return }
    if (below) { var yz = yEnd + 4, ly = yz + L; E('line', { x1: x, x2: x, y1: yz, y2: ly, stroke: C.mute, 'stroke-dasharray': '2 3' }, q);
      T(q, tx, ly + 14, nt.text, { 'text-anchor': an2, 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, tx, ly + 31, nt.sub, { 'text-anchor': an2, 'font-size': 12.5, fill: C.mute }) }
    else { var yt = yEnd - 4, ly2 = yt - L; E('line', { x1: x, x2: x, y1: yt, y2: ly2, stroke: C.mute, 'stroke-dasharray': '2 3' }, q);
      T(q, tx, ly2 - 20, nt.text, { 'text-anchor': an2, 'font-size': 13.5, 'font-weight': 700, fill: C.ink }); if (nt.sub) T(q, tx, ly2 - 4, nt.sub, { 'text-anchor': an2, 'font-size': 12.5, fill: C.mute }) }
    NT.push(q) });
  if (s.avg) { var av = data.reduce(function (p2, c2) { return p2 + c2 }, 0) / n, ag = E('g', AT(tEnd + 160), svg); E('line', { x1: ml, x2: x1, y1: Y(av), y2: Y(av), stroke: C.dark, 'stroke-dasharray': '5 4', opacity: .55 }, ag);
    var leftBusy = (s.notes || []).some(function (q) { return q.at < n * .3 }) || n - 1 < 0, rightBusy = (s.notes || []).some(function (q) { return q.at > n * .7 }) || !!s.last;
    var ax = leftBusy && !rightBusy ? x1 - 6 : (leftBusy && rightBusy ? X(Math.floor(n / 2)) : ml + 6), an3 = leftBusy && !rightBusy ? 'end' : (leftBusy && rightBusy ? 'middle' : 'start');
    T(ag, ax, Y(av) - 7, String(s.avg.text || '평균 {v}').replace('{v}', h.nf(av, dec) + (s.unit || '')), { 'text-anchor': an3, 'font-size': 12.5, 'font-weight': 700, fill: C.dark }) }
  if (s.last) { LS = E('g', {}, an); var nearR = X(n - 1) > x1 - 60; T(LS, nearR ? X(n - 1) + bw / 2 : X(n - 1), Y(Math.max(0, data[n - 1])) - 9, s.last.text || (h.nf(data[n - 1], dec) + (s.unit || '')), { 'text-anchor': nearR ? 'end' : 'middle', 'font-size': 15, 'font-weight': 700, fill: C.main }) }
  if (s.negNote) T(an, X(s.negNote.at), Y(s.negNote.v), s.negNote.text, { 'font-size': 13, fill: C.mute });
  /* 분포 */
  if (s.dist) { var ds = s.dist, f = ds.from || 0, t = ds.to == null ? n - 1 : ds.to, cnt = {}, tot = 0, sm = 0; for (var i = f; i <= t; i++) { cnt[data[i]] = (cnt[data[i]] || 0) + 1; tot++; sm += data[i] }
    var lvs = Object.keys(cnt).map(Number).sort(function (a, b) { return b - a }), cm = Math.max.apply(null, lvs.map(function (k) { return cnt[k] })), xs = 920, rowH = Math.min(27, 220 / lvs.length);
    T(svg, xs, 48, ds.title || ((t - f + 1) + '개월 분포'), Object.assign({ 'font-size': 13.5, 'font-weight': 700, fill: C.ink }, AT(tEnd + 260)));
    lvs.forEach(function (lv, k) { var y = 74 + k * rowH, w = cnt[lv] / cm * 128, hiR = lv === mx;
      T(svg, xs + 48, y + 4, h.nf(lv, dec) + (s.unit || ''), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, fill: C.sub, 'data-fx': 'fade' }, AT(tEnd + 260 + k * 60)));
      E('rect', Object.assign({ x: xs + 56, y: y - 8, width: w, height: 14, rx: 2, fill: hiR ? C.dark : (lv === data[n - 1] ? C.main : C.gray), 'data-fx': 'growx' }, AT(tEnd + 260 + k * 60)), svg);
      T(svg, xs + 62 + w, y + 4, cnt[lv] + (ds.unitN || '개월'), Object.assign({ 'font-size': 12.5, 'font-weight': 700, fill: hiR ? C.dark : C.sub, 'data-fx': 'fade' }, AT(tEnd + 320 + k * 60))) });
    if (ds.avg !== false) T(svg, xs, Math.min(300, 74 + lvs.length * rowH + 14), (ds.avgText || '평균 {v}').replace('{v}', h.nf(sm / tot, dec) + (s.unit || '')), Object.assign({ 'font-size': 14, 'font-weight': 700, fill: C.main, 'data-fx': 'fade' }, AT(tEnd + 800))) }
  /* 강조 · 바뀜 */
  function paint(k) { var st = k > 0 && s.beats && s.beats[k - 1] ? s.beats[k - 1] : null, rules = st && st.hi ? st.hi : (s.hi || []), dim = st && st.dim || s.dim0 || [];
    B.forEach(function (b) { var c = b.v < 0 ? C.light : C.gray; rules.forEach(function (r) { if (rule(r, b.i, b.v, n, mx)) c = h.col(r.color || 'dark') }); b.r.setAttribute('fill', c) });
    BR.forEach(function (q) { q.style.opacity = dim.indexOf('brackets') >= 0 ? .3 : 1 }); NT.forEach(function (q) { q.style.opacity = dim.indexOf('notes') >= 0 ? .35 : 1 }); if (LS) LS.style.opacity = dim.indexOf('last') >= 0 ? .35 : 1 }
  root._beat = function (k) { root._bk = k; paint(k) }; paint(0);
  /* 재생 막대 */
  if (s.playback) { var ph = E('g', { style: 'display:none' }, svg); E('line', { x1: 0, x2: 0, y1: top - 8, y2: bot, stroke: C.dark, 'stroke-width': 1.5 }, ph); E('rect', { x: -66, y: top - 38, width: 132, height: 26, rx: 13, fill: C.dark }, ph);
    var rd = T(ph, 0, top - 20, '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' });
    root._hook = function (r) { var len = (n - 1) * PB; ph.style.display = ''; h.A(ph, [{ transform: 'translate(' + X(0) + 'px,0)' }, { transform: 'translate(' + X(n - 1) + 'px,0)' }], len, 'linear', T0);
      var t0 = null; function stp(ts) { if (t0 === null) t0 = ts; var el = ts - t0 - T0, k = Math.max(0, Math.min(n - 1, Math.floor(el / PB))); rd.textContent = labels[k] + ' · ' + h.nf(data[k], dec) + (s.unit || '');
        if (el < len + PB) r._raf.push(requestAnimationFrame(stp)); else h.later(r, function () { ph.style.display = 'none' }, 300) } r._raf.push(requestAnimationFrame(stp)); paint(0); return T0 + len + 400 };
    root._reset = function () { ph.style.display = 'none'; paint(root._bk || 0) } }
};
})();
