/* odo — 기계식 숫자판 굴림(5판 영상 부품). 숫자판 칸이 굴러 값에 멈춘 뒤 단위가 붙음. 기본 그림 = 멈춘 모습, 굴림은 _hook 에서만.
   배치 single : 큰 숫자판 하나 + 단위 + 옆 비교 칸 · 칸 value dec unit label sub side[{k,v,d,tone:'up|down'}] align:'left|center'
   배치 twin   : 계기판 둘 + 차이 막대 · 칸 a{name,value,dec,unit} b{…} label gap{text} cap(아래 설명 한 줄)
   배치 tag    : 물건 그림 + 연도 · 값 표(그때 → 지금) · 칸 icon:'barrel|bag|home' label from{year,value} to{year,value} dec unit change sub
   배치 years  : 연도별 숫자가 차례로 떠올라 나란히 · 칸 items[{y,v}] dec unit label cap last(강조 설명) */
(function () {
'use strict';
var h = ECOM.h, E = h.E, T = h.T, uid = 0;

function pad(str, n) { str = String(str); while (str.length < n) str = '0' + str; return str }
/* 숫자판 한 줄 — 숫자는 칸, 쉼표 · 점은 칸 사이 글자. cols 에 굴림 정보를 모아 둠 */
function dial(svg, x, y, str, o, cols) {
  var P = o.P, fs = o.fs, th = fs * 1.18, tw = fs * .74, gap = Math.max(6, fs * .05), sep = fs * .3, fillT = o.fill || (o.dark ? '#FFFFFF' : P.dark), ink = o.ink || (o.dark ? '#003D2B' : '#FFFFFF'),
    g = E('g', { 'data-at': 0, 'data-fx': 'fade', 'data-ms': 300 }, svg), cx = x, from = o.from != null ? String(o.from) : null;
  for (var i = 0; i < str.length; i++) { var ch = str[i];
    if (/\d/.test(ch)) { var id = 'odo' + (++uid), cp = E('clipPath', { id: id }, g); E('rect', { x: cx, y: y, width: tw, height: th, rx: 10 }, cp);
      E('rect', { x: cx, y: y, width: tw, height: th, rx: 10, fill: fillT }, g);
      var cg = E('g', { 'clip-path': 'url(#' + id + ')' }, g), t = T(cg, cx + tw / 2, y + th / 2 + fs * .36, ch, { 'font-size': fs, 'font-weight': 800, fill: ink, 'text-anchor': 'middle' });
      [[cx, cx + Math.max(3, fs * .06 - 1)], [cx + tw - Math.max(3, fs * .06 - 1), cx + tw]].forEach(function (xs) { E('line', { x1: xs[0], x2: xs[1], y1: y + th / 2, y2: y + th / 2, stroke: o.dark ? '#003D2B' : '#000', 'stroke-width': 2.5, opacity: o.dark ? .35 : .5 }, g) });
      cols.push({ cg: cg, t: t, d1: +ch, d0: from && /\d/.test(from[i]) ? +from[i] : 0, cx: cx + tw / 2, by: y + th / 2 + fs * .36, th: th, fs: fs, ink: ink, i: cols.length });
      cx += tw + gap }
    else { var w = ch === ' ' ? sep * .6 : sep; if (ch !== ' ') T(g, cx - gap + w / 2 + 2, y + th - fs * .08, ch, { 'font-size': fs * .6, 'font-weight': 800, fill: o.dark ? P.ink : P.dark, 'text-anchor': 'middle' }); cx += w - gap + (ch === ' ' ? 0 : 0) } }
  return { w: cx - gap - x, h: th, g: g } }
function dialW(str, fs) { var th = fs * .74, gap = Math.max(6, fs * .05), w = 0, n = 0; for (var i = 0; i < str.length; i++) { if (/\d/.test(str[i])) { w += th + gap; n++ } else w += fs * .3 - gap + (str[i] === ' ' ? 0 : 0) } return w - gap }
function fitFs(str, maxW, fsMax, extra) { var fs = fsMax; while (fs > 40 && dialW(str, fs) + (extra ? extra(fs) : 0) > maxW) fs -= 4; return fs }

function chip(p, x, y, txt, o) { o = o || {}; var fs = o.fs || 15, w = h.textW(txt, fs, 1) + 28, g = E('g', o.attr || {}, p);
  E('rect', { x: x, y: y, width: w, height: fs + 18, rx: (fs + 18) / 2, fill: o.fill, stroke: o.stroke || 'none' }, g);
  T(g, x + 14, y + fs + 4, txt, { 'font-size': fs, 'font-weight': 700, fill: o.ink }); return { w: w, h: fs + 18, g: g } }
function lines(p, x, y, txt, fs, maxW, fill, at) { var L = h.wrap(txt || '', fs, maxW), g = E('g', { 'data-at': at, 'data-fx': 'fade', 'data-ms': 500 }, p); L.forEach(function (ln, i) { T(g, x, y + i * fs * 1.45, ln, { 'font-size': fs, fill: fill }) }); return L.length }

/* 굴림 — 칸마다 0~19 줄 띠를 만들어 위로 밀어 올림(끝에 띠를 걷고 멈춘 글자를 되살림) */
function install(ctx, cols, ms0) { var root = ctx.root, ease = 'cubic-bezier(.3,0,.2,1)';
  function clean() { cols.forEach(function (c) { if (c.strip) { c.strip.remove(); c.strip = null } c.t.style.opacity = '' }) }
  root._reset = clean; root._done = clean;
  root._hook = function (r) { if (h.RM() || !cols.length) return 0; var end = 0;
    cols.forEach(function (c, k) { var s = E('g', {}, c.cg), dur = (ms0 || 800) + k * 110;
      for (var q = 0; q < 20; q++) T(s, c.cx, c.by + q * c.th, String(q % 10), { 'font-size': c.fs, 'font-weight': 800, fill: c.ink, 'text-anchor': 'middle' });
      c.t.style.opacity = 0; c.strip = s; s.animate([{ transform: 'translateY(' + (-c.d0 * c.th) + 'px)' }, { transform: 'translateY(' + (-(10 + c.d1) * c.th) + 'px)' }], { duration: dur, easing: ease, fill: 'forwards' }); end = Math.max(end, dur) });
    (r._tm = r._tm || []).push(setTimeout(clean, end + 20)); return end } }

function side(svg, rows, x, y0, w, hh, P, at0) { var n = rows.length, gp = 12, rh = Math.min(150, (hh - (n - 1) * gp) / n);
  rows.forEach(function (r, i) { var y = y0 + i * (rh + gp), up = r.tone === 'up', down = r.tone === 'down', col = up ? P.warn : (down ? P.main : P.mute), g = E('g', { 'data-at': at0 + i * 260, 'data-fx': 'slide', 'data-dx': 18, 'data-key': r.k }, svg);
    E('rect', { x: x, y: y, width: w, height: rh, rx: 12, fill: P.paper, stroke: P.line }, g); E('rect', { x: x, y: y + 12, width: 5, height: rh - 24, rx: 2, fill: col }, g);
    T(g, x + 24, y + rh * .34, r.k, { 'font-size': 16, 'font-weight': 700, fill: P.cmp });
    var vs = r.v, fsv = Math.min(40, rh * .36); T(g, x + 24, y + rh * .74, vs, { 'font-size': fsv, 'font-weight': 800, fill: P.ink });
    if (r.d) { var dw = h.textW(r.d, 15, 1) + 24, dx = x + w - dw - 16; E('rect', { x: dx, y: y + rh * .74 - 22, width: dw, height: 30, rx: 15, fill: up ? P.warnsoft : P.g08 }, g); T(g, dx + 12, y + rh * .74 - 1, r.d, { 'font-size': 15, 'font-weight': 700, fill: up ? P.warn : P.main }) } }) }

function single(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), cols = [], dec = s.dec || 0, str = h.nf(s.value, dec), unit = s.unit || '', ctr = s.align === 'center', rows = (s.side || []).slice(0, 4);
  var maxW = ctr ? 1010 : 690, fs = fitFs(str, maxW, ctr ? 250 : 215, function (f) { return unit ? h.textW(unit, f * .3, 1) + 24 : 0 });
  var th = fs * 1.18, dw = dialW(str, fs), uf = Math.round(fs * .3), uw = unit ? h.textW(unit, uf, 1) + 22 : 0, tot = dw + uw, x0 = ctr ? (1168 - tot) / 2 : 0;
  var y0 = ctr ? 52 : 96; if (s.label) chip(svg, ctr ? (1168 - (h.textW(s.label, 16, 1) + 28)) / 2 : 0, ctr ? 4 : 40, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  var d = dial(svg, x0, y0, str, { P: P, fs: fs, dark: dk, from: s.from != null ? pad(h.nf(s.from, dec), str.length) : null }, cols);
  if (unit) T(svg, x0 + dw + 20, y0 + th - fs * .1, unit, { 'font-size': uf, 'font-weight': 800, fill: dk ? P.main : P.dark, 'data-at': 1250, 'data-fx': 'slide', 'data-dx': -16, 'data-ms': 600, 'data-key': '단위' });
  if (s.sub) lines(svg, x0, y0 + th + 40, s.sub, ctr ? 21 : 20, ctr ? tot : 690, P.cmp, 1500);
  if (rows.length) { if (ctr) { var n = rows.length, cw = (1168 - (n - 1) * 16) / n, gx = 0; rows.forEach(function (r, i) { var one = []; one.push(r); side(svg, one, i * (cw + 16), 372, cw, 128, P, 1500 + i * 220) }) }
    else side(svg, rows, 760, 4, 408, 504, P, 1500) }
  install(ctx, cols, 800); ctx.root.setAttribute('data-gap', 300) }

function twin(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), cols = [], dec = s.dec || 0, A = s.a, B = s.b, W = 568;
  var sa = h.nf(A.value, dec), sb = h.nf(B.value, dec), fs = Math.min(fitFs(sa, W - 120, 168), fitFs(sb, W - 120, 168), 168), th = fs * 1.18;
  [[A, sa, 0, dk ? '#FFFFFF' : P.dark, dk ? '#003D2B' : '#FFFFFF'], [B, sb, 600, dk ? P.main : P.cmp, dk ? '#003D2B' : '#FFFFFF']].forEach(function (q) { var it = q[0], str = q[1], px = q[2], tf = q[3], ti = q[4];
    E('rect', { x: px, y: 0, width: W, height: 306, rx: 16, fill: P.paper, stroke: P.line, 'data-at': 0, 'data-fx': 'fade' }, svg);
    chip(svg, px + 22, 18, it.name, { fs: 18, fill: tf, ink: ti, attr: { 'data-at': 0, 'data-fx': 'fade', 'data-key': it.name } });
    var uf = Math.round(fs * .3), uw = it.unit ? h.textW(it.unit, uf, 1) + 20 : 0, dw = dialW(str, fs), x0 = px + (W - dw - uw) / 2;
    dial(svg, x0, 70, str, { P: P, fs: fs, dark: dk, fill: tf, ink: ti, from: pad('0', str.length) }, cols);
    if (it.unit) T(svg, x0 + dw + 16, 70 + th - fs * .1, it.unit, { 'font-size': uf, 'font-weight': 800, fill: dk ? P.main : P.dark, 'data-at': 1250, 'data-fx': 'slide', 'data-dx': -12, 'data-ms': 500 });
    if (it.sub) T(svg, px + W / 2, 70 + th + 28, it.sub, { 'font-size': 15, fill: P.mute, 'text-anchor': 'middle', 'data-at': 1400, 'data-fx': 'fade' }) });
  /* 차이 막대 */
  var mx = Math.max(A.value, B.value) * 1.04, bx = 150, bw = 820, yA = 342, yB = 410, bh = 44, xa = bx + bw * A.value / mx, xb = bx + bw * B.value / mx, hi = A.value >= B.value, xs = Math.min(xa, xb), xl = Math.max(xa, xb), yS = hi ? yB : yA, yL = hi ? yA : yB;
  [[A, yA, xa, dk ? '#FFFFFF' : P.dark], [B, yB, xb, dk ? P.main : P.cmp]].forEach(function (q, i) { T(svg, 0, q[1] + bh / 2 + 6, q[0].name, { 'font-size': 17, 'font-weight': 700, fill: P.ink, 'data-at': 1500, 'data-fx': 'fade' });
    E('rect', { x: bx, y: q[1], width: q[2] - bx, height: bh, rx: 6, fill: q[3], 'data-at': 1500 + i * 120, 'data-fx': 'growx', 'data-ms': 600, 'data-key': q[0].name }, svg);
    T(svg, q[2] - 14, q[1] + bh / 2 + 7, h.nf(q[0].value, dec) + (q[0].unit || ''), { 'font-size': 20, 'font-weight': 800, fill: dk ? '#003D2B' : '#FFFFFF', 'text-anchor': 'end', 'data-at': 2000, 'data-fx': 'fade' }) });
  var gapTxt = s.gap && s.gap.text ? s.gap.text : '차이 ' + h.nf(Math.abs(A.value - B.value), dec) + (A.unit || '');
  var gw = h.textW(gapTxt, 17, 1) + 24, gcx = (xs + xl) / 2;
  E('rect', { x: xs, y: yS, width: xl - xs, height: bh, rx: 6, fill: P.warnsoft, stroke: P.warn, 'stroke-width': 1.6, 'stroke-dasharray': '5 4', 'data-at': 2100, 'data-fx': 'growx', 'data-ms': 600, 'data-key': '차이' }, svg);
  var cw = Math.max(gw, 20); if (xl - xs >= cw + 8) { T(svg, gcx, yS + bh / 2 + 6, gapTxt, { 'font-size': 17, 'font-weight': 800, fill: P.warn, 'text-anchor': 'middle', 'data-at': 2500, 'data-fx': 'fade' }) }
  else { var cx2 = xl + 130; E('line', { x1: xl + 4, x2: cx2 - 6, y1: yS + bh / 2, y2: yS + bh / 2, stroke: P.warn, 'stroke-width': 1.6, 'data-at': 2500, 'data-fx': 'fade' }, svg); T(svg, cx2, yS + bh / 2 + 6, gapTxt, { 'font-size': 17, 'font-weight': 800, fill: P.warn, 'data-at': 2500, 'data-fx': 'fade' }) }
  if (s.cap) T(svg, 0, 500, s.cap, { 'font-size': 13, fill: P.mute, 'data-at': 2600, 'data-fx': 'fade' });
  install(ctx, cols, 800); ctx.root.setAttribute('data-gap', 300) }

/* 물건 그림(평면) — 좌표 0~200 */
var ICON = {
  barrel: function (g, k, P) { E('rect', { x: 40, y: 22, width: 120, height: 156, rx: 22, fill: P.main }, g); [58, 100, 142].forEach(function (y) { E('rect', { x: 40, y: y, width: 120, height: 14, fill: P.dark }, g) }); E('rect', { x: 40, y: 22, width: 120, height: 156, rx: 22, fill: 'none', stroke: P.dark, 'stroke-width': 3 }, g); E('rect', { x: 86, y: 6, width: 28, height: 16, rx: 4, fill: P.dark }, g) },
  bag: function (g, k, P) { E('path', { d: 'M62 70v-14a38 38 0 0 1 76 0v14', fill: 'none', stroke: P.dark, 'stroke-width': 8, 'stroke-linecap': 'round' }, g); E('rect', { x: 34, y: 66, width: 132, height: 116, rx: 12, fill: P.main }, g); E('rect', { x: 34, y: 66, width: 132, height: 20, fill: P.dark }, g) },
  home: function (g, k, P) { E('path', { d: 'M20 96L100 24l80 72', fill: 'none', stroke: P.dark, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); E('rect', { x: 40, y: 92, width: 120, height: 86, rx: 6, fill: P.main }, g); E('rect', { x: 86, y: 124, width: 28, height: 54, rx: 4, fill: P.paper }, g) }
};
function tag(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), cols = [], dec = s.dec || 0, fr = s.from, to = s.to, unit = s.unit || '';
  E('rect', { x: 0, y: 0, width: 320, height: 512, rx: 18, fill: P.g08, 'data-at': 0, 'data-fx': 'fade' }, svg);
  var ig = E('g', { transform: 'translate(40,60) scale(1.2)', 'data-at': 150, 'data-fx': 'pop', 'data-ms': 500, 'data-key': s.iconName || '물건' }, svg); (ICON[s.icon] || ICON.barrel)(ig, 1, P);
  T(svg, 160, 336, s.thing || '', { 'font-size': 22, 'font-weight': 700, fill: P.ink, 'text-anchor': 'middle', 'data-at': 400, 'data-fx': 'fade' });
  if (s.thingSub) T(svg, 160, 366, s.thingSub, { 'font-size': 15, fill: P.mute, 'text-anchor': 'middle', 'data-at': 500, 'data-fx': 'fade' });
  var X0 = 372, ys = String(to.year), yfs = 96, uf = 40, ydw = dialW(ys, yfs);
  var gt = E('g', { 'data-at': 0, 'data-fx': 'fade' }, svg); chip(gt, X0, 4, '그때 ' + fr.year + (fr.label ? ' · ' + fr.label : '') + ' → 지금', { fs: 17, fill: P.g08, ink: P.dark, attr: { 'data-key': '연도' } });
  dial(svg, X0, 48, ys, { P: P, fs: yfs, dark: dk, from: String(fr.year) }, cols); T(svg, X0 + ydw + 14, 48 + yfs * 1.18 - 6, '년', { 'font-size': uf, 'font-weight': 800, fill: P.dark, 'data-at': 1250, 'data-fx': 'fade' });
  var ps = h.nf(to.value, dec), pfs = fitFs(ps, 720, 140, function (f) { return h.textW(unit, f * .26, 1) + 30 }), pth = pfs * 1.18, pdw = dialW(ps, pfs), py = 48 + yfs * 1.18 + 26;
  dial(svg, X0, py, ps, { P: P, fs: pfs, dark: dk, fill: P.main, ink: '#FFFFFF', from: pad(h.nf(fr.value, dec), ps.length) }, cols);
  T(svg, X0 + pdw + 18, py + pth - pfs * .1, unit, { 'font-size': Math.round(pfs * .26), 'font-weight': 800, fill: P.dark, 'data-at': 1250, 'data-fx': 'slide', 'data-dx': -12, 'data-ms': 600, 'data-key': '값' });
  var cy = py + pth + 28, g2 = E('g', { 'data-at': 1500, 'data-fx': 'slide', 'data-dy': 8, 'data-key': '변화' }, svg), c1 = chip(g2, X0, cy, '그때 ' + h.nf(fr.value, dec) + unit, { fs: 18, fill: P.g08, ink: P.cmp });
  chip(g2, X0 + c1.w + 12, cy, '지금 ' + h.nf(to.value, dec) + unit, { fs: 18, fill: P.main, ink: '#FFFFFF' });
  if (s.change) { var c2 = h.textW('지금 ' + h.nf(to.value, dec) + unit, 18, 1) + 28; chip(g2, X0 + c1.w + 12 + c2 + 12, cy, s.change, { fs: 18, fill: P.warnsoft, ink: P.warn }) }
  if (s.sub) lines(svg, X0, cy + 70, s.sub, 20, 780, P.cmp, 1800);
  install(ctx, cols, 900); ctx.root.setAttribute('data-gap', 300) }

function years(bd, s, ctx) { var P = ctx.P, dk = ctx.dark, svg = ctx.svg(512), it = (s.items || []).slice(0, 6), n = it.length, dec = s.dec || 0, unit = s.unit || '%', cw = 1168 / n, mx = Math.max.apply(null, it.map(function (q) { return q.v })), base = 392, bhMax = 190;
  if (s.label) chip(svg, 0, 0, s.label, { fs: 16, fill: dk ? P.g18 : P.g08, ink: P.dark, attr: { 'data-at': 0, 'data-fx': 'fade' } });
  E('line', { x1: 0, x2: 1168, y1: base, y2: base, stroke: P.axis, 'stroke-width': 1.5, 'data-at': 0, 'data-fx': 'fade' }, svg);
  it.forEach(function (q, i) { var last = i === n - 1, cx = cw * i + cw / 2, t = i * 420, bh = Math.max(4, bhMax * q.v / mx), fs = Math.min(last ? 80 : 58, (cw - 24) / (h.textW(h.nf(q.v, dec) + unit, 1, 1) || 1)), col = last ? P.warn : (dk ? P.g65 : P.g65);
    var g = E('g', { 'data-key': q.y, 'data-at': t, 'data-fx': 'rise', 'data-ms': 650 }, svg);
    E('rect', { x: cx - Math.min(70, cw * .3), y: base - bh, width: Math.min(140, cw * .6), height: bh, rx: 6, fill: last ? P.main : P.g18 }, g);
    var vy = base - bh - 22;
    T(g, cx, vy, h.nf(q.v, dec) + unit, { 'font-size': fs, 'font-weight': 800, fill: last ? P.main : P.ink, 'text-anchor': 'middle', 'data-count': q.v, 'data-dec': dec, 'data-suf': unit, 'data-fx': 'count', 'data-at': t + 150, 'data-ms': 800 });
    chip(g, cx - (h.textW(q.y, 20, 1) + 28) / 2, base + 18, q.y, { fs: 20, fill: last ? P.main : P.g08, ink: last ? '#FFFFFF' : P.dark });
    if (q.sub) T(g, cx, base + 78, q.sub, { 'font-size': 14, fill: P.mute, 'text-anchor': 'middle' }) });
  if (n > 1) { var lx = cw * (n - 1) + cw / 2, l0 = it[n - 2].v, l1 = it[n - 1].v, dl = l1 - l0, ytxt = s.last || ((dl >= 0 ? '+' : '−') + h.nf(Math.abs(dl), dec) + '%p 전년 대비');
    var gx = E('g', { 'data-at': n * 420 + 200, 'data-fx': 'slide', 'data-dy': 8, 'data-key': it[n - 1].y }, svg), cwid = h.textW(ytxt, 17, 1) + 28; chip(gx, 1168 - cwid, 44, ytxt, { fs: 17, fill: P.warnsoft, ink: P.warn }) }
  if (s.cap) lines(svg, 0, 480, s.cap, 15, 1100, P.mute, n * 420 + 400);
  ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.odo = function (bd, s, ctx) { var L = s.layout || 'single'; ({ single: single, twin: twin, tag: tag, years: years }[L] || single)(bd, s, ctx) };
ECOM.parts.odo.layouts = ['default', 'single', 'twin', 'tag', 'years'];
ECOM.parts.odo.dark = ['default', 'single', 'twin', 'tag', 'years'];
})();
