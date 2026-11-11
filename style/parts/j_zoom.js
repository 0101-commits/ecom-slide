/* zoom — 전체 기간을 먼저 그린 뒤 최근 구간 틀이 나타나고, 가로만 좁혀 그 구간을 크게 봄(세로 눈금은 그대로) + 작은 전체 그림
   labels · data(값 목록 또는 [이름,값], series[0].data 도 됨) · name · type('line' 기본 | 'bar') · zoom{from,to}(이름 또는 번호, 기본 마지막 12칸)
   unit · dec · y{min,max,step,dec,unit} · marks('auto' = 구간 최고 · 최저 · 마지막 | [{at,text,pos}]) · full('auto' = 전체 최고 · 최저, false 면 없음)
   avg(true = 구간 평균선) · avgText('최근 12개월 평균 {v}') · frameText(틀 이름표) · beats([{}] 이면 좁히기가 바뀜 단계 1 — 없으면 쌓기 안에서 저절로) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function norm(d) { var L = [], V = []; (d || []).forEach(function (p) { if (Array.isArray(p)) { L.push(String(p[0])); V.push(p[1] == null ? null : +p[1]) } else { L.push(null); V.push(p == null ? null : +p) } }); return { l: L, v: V } }
function hitN(b, polys) { var n = 0; polys.forEach(function (P) { for (var i = 0; i < P.length - 1; i++) { var a = P[i], c = P[i + 1], st = Math.max(2, Math.ceil(Math.abs(c[0] - a[0]) / 4));
  for (var k = 0; k <= st; k++) { var x = a[0] + (c[0] - a[0]) * k / st, y = a[1] + (c[1] - a[1]) * k / st; if (x > b.l - 4 && x < b.r + 4 && y > b.t - 4 && y < b.b + 4) n++ } } }); return n }
function ovl(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t }
function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }
ECOM.parts.zoom = function (bd, s, ctx) {
  var u = ECOM.u, root = ctx.root, d = norm(s.data || (s.series && s.series[0] && s.series[0].data)), V = d.v, n = V.length, labels = s.labels || d.l, bar = s.type === 'bar';
  var dec = s.dec != null ? s.dec : (s.decimals != null ? s.decimals : 1), unit = s.unit || '', F = function (v) { return h.nf(v, dec) + unit }, beatMode = !!(s.beats && s.beats.length);
  function ix(x, df) { if (x == null) return df; if (typeof x === 'number') return x; var k = labels.indexOf(x); return k < 0 ? df : k }
  var z = s.zoom || {}, ia = ix(z.from, Math.max(0, n - 12)), ib = ix(z.to, n - 1), win = ib - ia + 1, short = u.short;
  var rng = short(labels[ia]) + '~' + short(labels[ib]);
  var lgd = u.legendHTML(bd, [{ color: 'main', type: bar ? 'box' : 'line', text: s.name || '값' }, { type: 'box', color: 'g18', text: (s.frameText || '최근 ' + win + '개월') + ' ' + labels[ia] + '~' + labels[ib] }], 0);
  var svg = ctx.svg(512), top = 46, bot = 468, ml = 64, x1 = 1168 - 18, PW = x1 - ml;
  var sc = u.yScale(bar ? V.concat([0]) : V, s.y, top + 6, bot), Y = sc.Y, g1 = h.lv(svg, 1, { 'data-fx': 'fade' });
  u.yAxis(g1, ml, x1, sc, { unit: (s.y && s.y.unit) || unit, base: true });
  var cid = 'jzoom' + ctx.index, cp = E('clipPath', { id: cid }, E('defs', {}, svg)), clipR = E('rect', { x: ml, y: 0, width: PW, height: 512 }, cp);
  var plot = E('g', { 'clip-path': 'url(#' + cid + ')' }, svg), dom = [-.5, n - .5];
  function XD(i) { return ml + (i - dom[0]) / (dom[1] - dom[0]) * PW }
  var frame = E('g', {}, svg), fR = E('rect', { y: top - 6, height: bot - top + 6, rx: 4, fill: C.g18, 'fill-opacity': .45, stroke: C.main, 'stroke-width': 2 }, frame);
  var fT = T(frame, 0, top - 12, s.frameText || ('최근 ' + win + '개월'), { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.dark });
  plot.appendChild(frame);
  var path = null, bars = [];
  if (bar) V.forEach(function (v, i) { if (v == null) return; bars.push({ i: i, v: v, r: E('rect', { fill: i >= ia && i <= ib ? C.main : C.gray, rx: 1.5 }, plot) }) });
  else path = E('path', { fill: 'none', stroke: C.main, 'stroke-width': 3, 'stroke-linejoin': 'round' }, plot);
  var dots = bar ? [] : V.map(function (v, i) { return v == null || i < ia ? null : E('circle', { r: 3.6, fill: '#fff', stroke: C.main, 'stroke-width': 2 }, plot) });
  var xl = labels.map(function (l, i) { return T(svg, 0, bot + 20, short(l), { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  function render() { var k = PW / (dom[1] - dom[0]);
    if (path) path.setAttribute('d', h.lineD(V, XD, Y));
    dots.forEach(function (c, i) { if (!c) return; c.setAttribute('cx', XD(i)); c.setAttribute('cy', Y(V[i])); c.style.opacity = Math.max(0, Math.min(1, (k - 24) / 30)) });
    var bw = Math.max(2, Math.min(46, k * .62)); bars.forEach(function (b) { b.r.setAttribute('x', XD(b.i) - bw / 2); b.r.setAttribute('width', bw); b.r.setAttribute('y', b.v >= 0 ? Y(b.v) : Y(0)); b.r.setAttribute('height', Math.max(1.5, Math.abs(Y(b.v) - Y(0)))) });
    var stp = Math.max(1, Math.ceil(58 / k)), cand = [1, 2, 3, 6, 12, 24]; for (var c = 0; c < cand.length; c++) if (cand[c] >= stp) { stp = cand[c]; break }
    var e = Math.min(n - 1, Math.floor(dom[1])); xl.forEach(function (t, i) { var x = XD(i), on = (e - i) % stp === 0 && x >= ml - 2 && x <= x1 + 2; t.setAttribute('x', x); t.style.display = on ? '' : 'none';
      t.setAttribute('font-weight', i === n - 1 ? 700 : 400); t.setAttribute('fill', i === n - 1 ? C.ink : C.mute) });
    fR.setAttribute('x', XD(ia - .5)); fR.setAttribute('width', XD(ib + .5) - XD(ia - .5)); fT.setAttribute('x', (XD(ia - .5) + XD(ib + .5)) / 2) }
  /* 확대 뒤 이름표(최종 위치에서 계산) */
  dom = [ia - .5, ib + .5]; var zP = [], zBox = [], polyZ = [[]]; for (var i = ia; i <= ib; i++) if (V[i] != null) { var pt = [XD(i), Y(V[i])]; polyZ[0].push(pt); if (bar) zBox.push({ l: XD(i) - 22, r: XD(i) + 22, t: Math.min(Y(V[i]), Y(0)), b: Math.max(Y(V[i]), Y(0)) }) }
  var zl = E('g', {}, svg), L = [], marks = s.marks === undefined || s.marks === 'auto' ? (function () { var mi = ia, ma = ia; for (var i = ia; i <= ib; i++) { if (V[i] == null) continue; if (V[i] < V[mi]) mi = i; if (V[i] > V[ma]) ma = i }
    var o = [{ at: ma, pos: 'above', t: '최고' }]; if (mi !== ma) o.push({ at: mi, pos: 'below', t: '최저' }); if (ib !== ma && ib !== mi) o.push({ at: ib, pos: 'auto' }); return o })() : (s.marks || []);
  var placed = [];
  marks.forEach(function (m) { var v = V[m.at]; if (v == null) return; var x = XD(m.at), y = Y(v), t1 = m.text || ((m.t ? m.t + ' ' : '') + F(v)), w = h.textW(t1, 14, 1), cand = [];
    var an = x + w / 2 > x1 ? 'end' : x - w / 2 < ml + 4 ? 'start' : 'middle', lx = an === 'end' ? x + 6 - w : an === 'start' ? x - 6 : x - w / 2;
    var ys = m.pos === 'below' ? [y + 24, y - 12, y - 30, y + 42] : [y - 12, y + 24, y - 30, y + 42], neg = bar && v < 0, y0b = neg ? Y(v) + 19 : Math.min(y, Y(0)) - 9;
    if (bar) { var yl = y0b; zBox.forEach(function (b) { if (b.r < lx - 2 || b.l > lx + w + 2) return; if (neg) yl = Math.max(yl, b.b + 19); else yl = Math.min(yl, b.t - 9) });
      ys = neg ? [yl, yl + 17, Math.min(y0b, Y(0)) - 9 - 17 * 0] : [yl, yl - 17, yl - 34] }
    ys.forEach(function (yy) { cand.push({ y: yy, box: { l: lx, r: lx + w, t: yy - 14, b: yy + 3 } }) });
    var best = cand[0], bs = 1e9; cand.forEach(function (c, k) { var sc2 = hitN(c.box, polyZ) * 10 + k; placed.concat(zBox.filter(function (b) { return Math.abs((b.l + b.r) / 2 - x) > 1 })).forEach(function (b) { if (ovl(c.box, b)) sc2 += 200 });
      if (c.box.b > bot - 2 || c.box.t < top - 22) sc2 += 1000; if (sc2 < bs) { bs = sc2; best = c } });
    if (!bar) E('circle', { cx: x, cy: y, r: 5.5, fill: '#fff', stroke: C.dark, 'stroke-width': 2.4 }, zl);
    else if (neg && best.y > y0b + 4) E('line', { x1: x, x2: x, y1: Y(v) + 3, y2: best.y - 13, stroke: C.axis }, zl);
    else if (!neg && best.y < y0b - 4) E('line', { x1: x, x2: x, y1: Math.min(y, Y(0)) - 3, y2: best.y + 4, stroke: C.axis }, zl);
    T(zl, an === 'end' ? x + 6 : an === 'start' ? x - 6 : x, best.y, t1, { 'text-anchor': an, 'font-size': 14, 'font-weight': 700, fill: C.dark, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }); placed.push(best.box) });
  if (s.avg) { var sm = 0, cn = 0; for (i = ia; i <= ib; i++) if (V[i] != null) { sm += V[i]; cn++ } var av = sm / cn, ay = Y(av), at = (s.avgText || ('최근 ' + win + '개월 평균 {v}')).replace('{v}', F(av)), aw = h.textW(at, 13.5, 1);
    E('line', { x1: ml, x2: x1, y1: ay, y2: ay, stroke: C.dark, 'stroke-width': 1.4, 'stroke-dasharray': '6 5', opacity: .6 }, zl);
    var ac = [[ml + 8, ay - 8, 'start'], [x1 - 8, ay - 8, 'end'], [ml + 8, ay + 20, 'start'], [x1 - 8, ay + 20, 'end']].map(function (p) { var l = p[2] === 'end' ? p[0] - aw : p[0]; return { p: p, box: { l: l, r: l + aw, t: p[1] - 14, b: p[1] + 3 } } });
    var ab = ac[0], abs = 1e9; ac.forEach(function (c, k) { var sc3 = hitN(c.box, polyZ) * 10 + k; placed.concat(zBox).forEach(function (b) { if (ovl(c.box, b)) sc3 += 200 }); if (sc3 < abs) { abs = sc3; ab = c } });
    if (abs >= 200) lgd.insertAdjacentHTML('beforeend', '<span><i class="ln" style="background:repeating-linear-gradient(90deg,' + C.dark + ' 0 5px,transparent 5px 9px)"></i>' + h.esc(at) + '</span>');
    else { T(zl, ab.p[0], ab.p[1], at, { 'text-anchor': ab.p[2], 'font-size': 13.5, 'font-weight': 700, fill: C.dark, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }); placed.push(ab.box) } }
  /* 전체 그림의 최고 · 최저(좁히기 전) */
  var fl = E('g', {}, svg); dom = [-.5, n - .5];
  if (s.full !== false) { var fa = 0, fb = 0; V.forEach(function (v, i) { if (v == null) return; if (V[fa] == null || v > V[fa]) fa = i; if (V[fb] == null || v < V[fb]) fb = i });
    var polyF = [V.map(function (v, i) { return [XD(i), Y(v)] }).filter(function (p, i) { return V[i] != null })], fPl = [];
    [[fa, -1, '최고'], [fb, 1, '최저']].forEach(function (m) { if (bar && m[1] > 0) return; var x = XD(m[0]), y = Y(V[m[0]]), t1 = m[2] + ' ' + short(labels[m[0]]) + ' ' + F(V[m[0]]), w = h.textW(t1, 13, 1), an = x + w / 2 > x1 ? 'end' : x - w / 2 < ml + 4 ? 'start' : 'middle', lx = an === 'end' ? x + 4 - w : an === 'start' ? x - 4 : x - w / 2, yy = bar ? Math.min(y, Y(0)) - 8 : m[1] < 0 ? y - 11 : y + 22;
      if (!bar) E('circle', { cx: x, cy: y, r: 4.5, fill: '#fff', stroke: C.cmp, 'stroke-width': 2 }, fl); T(fl, an === 'end' ? x + 4 : an === 'start' ? x - 4 : x, yy, t1, { 'text-anchor': an, 'font-size': 13, 'font-weight': 700, fill: C.cmp }) }) }
  /* 작은 전체 그림 — 확대 상태에서 비어 있는 모서리에 */
  dom = [ia - .5, ib + .5]; var IW = 236, IH = 86, corners = [[ml + 12, top + 4], [x1 - IW - 8, top + 4], [ml + 12, bot - IH - 8], [x1 - IW - 8, bot - IH - 8]], best2 = corners[0], bs2 = 1e9;
  corners.forEach(function (c, k) { var bx = { l: c[0], r: c[0] + IW, t: c[1], b: c[1] + IH }, sc4 = hitN(bx, polyZ) * 10 + k; placed.concat(zBox).forEach(function (b) { if (ovl(bx, b)) sc4 += 200 }); if (sc4 < bs2) { bs2 = sc4; best2 = c } });
  var ins = E('g', { transform: 'translate(' + best2[0] + ',' + best2[1] + ')' }, svg), e2 = h.ext(V), mY = h.lin(e2[0], e2[1], IH - 12, 30), mX = function (i) { return 12 + i * (IW - 24) / Math.max(1, n - 1) };
  E('rect', { width: IW, height: IH, rx: 8, fill: '#fff', stroke: C.line }, ins); T(ins, 12, 19, '전체 ' + short(labels[0]) + '~' + short(labels[n - 1]), { 'font-size': 12, 'font-weight': 700, fill: C.sub });
  E('rect', { x: mX(ia) - 3, y: 26, width: mX(ib) - mX(ia) + 6, height: IH - 32, rx: 3, fill: C.g18 }, ins);
  E('path', { d: h.lineD(V, mX, mY), fill: 'none', stroke: C.gray, 'stroke-width': 2 }, ins); E('path', { d: h.lineD(V.map(function (v, i) { return i >= ia && i <= ib ? v : null }), mX, mY), fill: 'none', stroke: C.main, 'stroke-width': 2.4 }, ins);
  /* 상태 : q 0 = 전체, 1 = 확대 */
  function setZ(q) { dom = [-.5 + (ia + 0) * q, n - .5 + (ib + .5 - (n - .5)) * q]; render(); frame.style.opacity = q >= 1 ? 0 : 1 - q * .85 }
  function vis(el, on) { el.style.opacity = on ? '' : 0 }
  function state(k) { clipR.setAttribute('width', PW); setZ(k); vis(zl, k >= 1); vis(ins, k >= 1); vis(fl, k < 1); vis(frame, k < 1) }
  function zoomAnim(r, delay) { var t0 = null, D = 1150; r._raf = r._raf || []; vis(zl, 0); vis(ins, 0);
    var cut = false; function st(ts) { if (t0 === null) t0 = ts; var p = Math.max(0, Math.min(1, (ts - t0 - delay) / D)), q = ease(p); if (p > 0 && !cut) { cut = true; [frame, fl].forEach(function (e4) { e4.getAnimations().forEach(function (a) { a.cancel() }) }) } setZ(q); fl.style.opacity = Math.max(0, 1 - p * 3);
      if (p < 1) r._raf.push(requestAnimationFrame(st)); else { vis(frame, 0); [zl, ins].forEach(function (e3, k) { e3.style.opacity = ''; h.A(e3, [{ opacity: 0 }, { opacity: 1 }], 360, 'linear', 80 + k * 160) }) } }
    r._raf.push(requestAnimationFrame(st)); return delay + D + 600 }
  root._bk = 0; state(beatMode ? 0 : 1);
  root._prep = function () { state(0); clipR.setAttribute('width', 0); vis(frame, 0); vis(fl, 0) };
  root._hook = function (r) { state(0); clipR.setAttribute('width', 0); vis(frame, 0); vis(fl, 0); var T0 = 350, D = 1300, t0 = null;
    function st(ts) { if (t0 === null) t0 = ts; var p = Math.max(0, Math.min(1, (ts - t0 - T0) / D)); clipR.setAttribute('width', PW * p); if (p < 1) r._raf.push(requestAnimationFrame(st)) } r._raf.push(requestAnimationFrame(st));
    frame.style.opacity = 1; h.A(frame, [{ opacity: 0 }, { opacity: 1 }], 320, 'linear', T0 + D + 60); fl.style.opacity = 1; h.A(fl, [{ opacity: 0 }, { opacity: 1 }], 320, 'linear', T0 + D + 60);
    if (beatMode) return T0 + D + 400; return zoomAnim(r, T0 + D + 1000) };
  root._reset = function () { state(beatMode && !root._bk ? 0 : 1) };
  root._beat = function (k) { if (!beatMode) { root._bk = k; state(1); return } var go = k >= 1 && !root._bk && !h.RM(); root._bk = k;
    if (go) { (root._tm || []).forEach(clearTimeout); state(0); zoomAnim(root, 0) } else state(k >= 1 ? 1 : 0) };
  root.setAttribute('data-gap', 300);
};
})();
