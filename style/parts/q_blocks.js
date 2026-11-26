/* 6판 조립 블록 — 화면 종류 blocks. 본문 칸(1168×512)을 layout 으로 나누고 blocks[] 를 차례로 채움. 형식 = style/SCHEMA6_blocks.md
   layout : full · L6R4(좌우 6:4) · T7B3(위아래 7:3) · T6B4:L6R6(위 한 칸 + 아래 좌우) · L7R5:T5B5(왼쪽 한 칸 + 오른쪽 위아래)
   블록   : steps 차례 띠 · compare 가운데 축 비교 · stat 숫자 칸(+ 작은 추이선) · cards 카드 열 · note 결론 띠 · table 머리글 표 · bars 가로 막대 · timeline 시간 축 · layers 층 쌓기, 포함 겹 · pict 그림 단위 · nodes 상자 + 직각 연결선 · line 선 차트 · dist 점 분포 · matrix 2×2 · tiles 벤토 타일 · shot 실제 그림 + 확대 풀이 · list 번호 목록. 아이콘 = 라인 아이콘 이름 또는 tf:<코드>(Tossface, 쓴 장 각주에 출처). skin navy · plain
   칸은 테두리 없이 면 색(옅은 면 · 중간 면 · 짙은 면 = 결론), 글자는 6판 7단계 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var COL = { ink: C.ink, sub: C.sub, mute: C.mute, g: C.g65, gdk: C.dark, gon: '#CDEFE0', g18: C.g18, g40: C.g40, card: C.g08, well: '#DCEAE3',
  light: C.light, white: '#FFFFFF', line: C.line, warn: C.warn, warn08: C.warnsoft, yel: '#FFF3C4', g08: '#F3F9F6', warn40: '#E7C4B5', g65: C.g65, gmid: '#0A6444', gold: '#C98F35', axis: C.axis, gray: C.gray, grid: C.grid, paper: '#FFFFFF', on: C.on };
var SK = null;
function col(k) { return (SK && SK[k]) || COL[k] || k }
var TONE = { strong: ['gdk', 'white', 'gon'], soft: ['g18', 'ink', 'sub'], ghost: ['well', 'sub', 'mute'], warn: ['warn08', 'warn', 'sub'], mid: ['g40', 'ink', 'sub'], hot: ['yel', 'ink', 'sub'] };
function tone(t) { return TONE[t] || ['card', 'ink', 'sub'] }

function zones(code, W, H, gap) { gap = gap == null ? 24 : gap;
  function lr(z, a, b) { var wa = (z[2] - gap) * a / (a + b); return [[z[0], z[1], wa, z[3]], [z[0] + wa + gap, z[1], z[2] - gap - wa, z[3]]] }
  function tb(z, a, b) { var ha = (z[3] - gap) * a / (a + b); return [[z[0], z[1], z[2], ha], [z[0], z[1] + ha + gap, z[2], z[3] - gap - ha]] }
  function one(z, c) { var m = /^L(\d+)R(\d+)$/.exec(c); if (m) return lr(z, +m[1], +m[2]); m = /^T(\d+)B(\d+)$/.exec(c); if (m) return tb(z, +m[1], +m[2]); return [z] }
  var Z = [0, 0, W, H]; code = code || 'full'; if (code === 'full') return [Z];
  if (code.indexOf(':') > 0) { var p = code.split(':'), f = one(Z, p[0]); return [f[0]].concat(one(f[1], p[1])) }
  return one(Z, code) }

/* 그리기 도움 — g 위에 그림 */
function K(g) {
  function text(x, y, t, fs, w, fill, anchor) { T(g, x, y, t, { 'font-size': fs, 'font-weight': w || 400, fill: col(fill || 'ink'), 'text-anchor': anchor || 'start' }); return h.textW(t, fs, (w || 400) >= 700) }
  function rect(x, y, w, hh, fill, rx) { return E('rect', { x: x, y: y, width: Math.max(0, w), height: Math.max(0, hh), rx: rx == null ? Math.min(6, hh / 2) : rx, fill: col(fill || 'card') }, g) }
  function lines(t, fs, maxW, w) { return h.wrap(String(t), fs, maxW, (w || 400) >= 700) }
  function measure(w, items, pad, gap) { var tot = 0, k = 0; items.forEach(function (it) { if (!it || !it[0]) return; tot += lines(it[0], it[1], w - 2 * pad, it[2]).length * Math.round(it[1] * 1.42); k++ }); return tot + gap * Math.max(k - 1, 0) }
  function stack(x, y, w, hh, items, o) { o = o || {}; var pad = o.pad == null ? 12 : o.pad, gap = o.gap == null ? 6 : o.gap, al = o.align || 'middle', va = o.valign || 'middle', bl = [], tot = 0;
    items.forEach(function (it) { if (!it || !it[0]) return; var L = lines(it[0], it[1], w - 2 * pad, it[2]), lh = Math.round(it[1] * 1.42); bl.push([L, it, lh]); tot += L.length * lh });
    tot += gap * Math.max(bl.length - 1, 0); var yy = va === 'middle' ? y + (hh - tot) / 2 : y + pad;
    bl.forEach(function (b) { b[0].forEach(function (l) { var base = yy + b[2] * .5 + b[1][1] * .35; if (al === 'middle') text(x + w / 2, base, l, b[1][1], b[1][2], b[1][3], 'middle'); else text(x + pad, base, l, b[1][1], b[1][2], b[1][3]); yy += b[2] }); yy += gap });
    return tot }
  function chip(x, y, t, fill, fg, fs, hh) { fs = fs || 16; hh = hh || fs + 12; var ww = h.textW(t, fs, true) + 24; rect(x, y, ww, hh, fill, 6); text(x + ww / 2, y + hh / 2 + fs * .35, t, fs, 700, fg, 'middle'); return ww }
  return { text: text, rect: rect, stack: stack, measure: measure, chip: chip } }

function grp(svg, at, key, fx) { var g = h.at(svg, at, { 'data-fx': fx || 'rise', 'data-ms': 450 }); if (key) g.setAttribute('data-key', key); return g }

/* steps : 차례 띠 + 단계별 풀이 — items[{k, t, s, fig, items[], tone:'strong'}] */
function steps(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], it = b.items || [], n = it.length, gap = 6, cw = (w - gap * (n - 1)) / n, hh = 52, nk = 14;
  it.forEach(function (a, i) { var g = grp(svg, t0 + i * 380, a.t), k = K(g), xx = x + i * (cw + gap), strong = a.tone === 'strong';
    var p = [[xx, y], [xx + cw - nk, y], [xx + cw, y + hh / 2], [xx + cw - nk, y + hh], [xx, y + hh]].concat(i ? [[xx + nk, y + hh / 2]] : []);
    E('polygon', { points: p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: col(strong ? 'gdk' : 'g18') }, g);
    k.text(xx + cw / 2 + (i ? nk / 2 : 0), y + hh / 2 + 6, (a.k ? a.k + '  ' : '') + a.t, 18, 700, strong ? 'white' : 'gdk', 'middle');
    var by = y + hh + 10, bh = H - hh - 10; k.rect(xx, by, cw - 2, bh, strong ? 'g18' : 'card');
    var items = []; if (a.fig) items.push([a.fig, 26, 800, 'gdk']); if (a.s) items.push([a.s, a.items ? 18 : 20, 700, 'ink']); (a.items || []).forEach(function (l) { items.push(['- ' + l, 18, 400, 'sub']) });
    k.stack(xx, by, cw - 2, bh, items, { pad: 16, align: 'start', valign: b.valign || (a.items ? 'top' : 'middle'), gap: 10 }) }) }

/* compare : 가운데 축 비교 — left{t,s} · right{t,s} · axis · rows[{k, l, r, chip, hi, big}] */
function compare(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], rows = b.rows || [], n = rows.length, wc = b.wc || 190, wl = (w - wc - 24) / 2, xc = x + wl + 12, xr = xc + wc + 12, hh = 68, gap = 8, rh = (H - hh - 10 - gap * (n - 1)) / n, L = b.left || {}, R = b.right || {};
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0);
  k0.rect(x, y, wl, hh, 'light'); k0.stack(x, y, wl, hh, [[L.t, 20, 700, 'sub'], [L.s, 16, 400, 'mute']], { align: 'start', pad: 18, gap: 0 });
  k0.text(xc + wc / 2, y + hh / 2 + 5, b.axis || '항목', 16, 700, 'mute', 'middle');
  k0.rect(xr, y, wl, hh, 'gdk'); k0.stack(xr, y, wl, hh, [[R.t, 20, 700, 'white'], [R.s, 16, 400, 'gon']], { align: 'start', pad: 18, gap: 0 });
  rows.forEach(function (r, i) { var g = grp(svg, t0 + 300 + i * 260, r.k), k = K(g), yy = y + hh + 10 + i * (rh + gap);
    k.rect(x, yy, wl, rh, 'card'); k.stack(x, yy, wl, rh, [[r.l, r.big ? 26 : 18, r.big ? 700 : 500, 'sub']], { align: 'start', pad: 18 });
    k.rect(xc, yy, wc, rh, 'well'); k.stack(xc, yy, wc, rh, [[r.k, 18, 700, 'ink']], { pad: 8 });
    k.rect(xr, yy, wl, rh, 'g18'); var cw = 0;
    if (r.chip) { cw = h.textW(r.chip, 16, true) + 24; k.rect(xr + wl - cw - 12, yy + rh / 2 - 14, cw, 28, r.hi ? 'gdk' : 'g18', 6); k.text(xr + wl - cw / 2 - 12, yy + rh / 2 + 5, r.chip, 16, 700, r.hi ? 'white' : 'gdk', 'middle'); cw += 16 }
    k.stack(xr, yy, wl - cw, rh, [[r.r, r.big ? 26 : 18, r.big ? 800 : 700, r.big ? 'gdk' : 'ink']], { align: 'start', pad: 18 }) }) }

/* stat : 숫자 칸 — cards[{q, v, unit, frm, side, cond, d[], tone, big}] · dir:'col' 이면 세로. 숫자 36px(big 52px, 장에 1곳) */
function stat(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], cs = b.cards || [], n = cs.length, vert = b.dir === 'col', gap = 16, cw = vert ? w : (w - gap * (n - 1)) / n, ch = vert ? (H - gap * (n - 1)) / n : H;
  cs.forEach(function (c, i) { var g = grp(svg, t0 + i * 300, c.q), k = K(g), xx = vert ? x : x + i * (cw + gap), yy = vert ? y + i * (ch + gap) : y, strong = c.tone === 'strong', px = 24;
    var fg = strong ? 'white' : (c.tone === 'plain' ? 'ink' : 'gdk'), fg2 = strong ? 'gon' : 'sub', nf = c.vfs || (c.big ? 52 : 36), dl = (c.d || []).map(function (d) { return [d, 18, 500, fg2] });
    k.rect(xx, yy, cw, ch, strong ? 'gdk' : (c.tone === 'soft' ? 'g18' : 'card'));
    var need = 30 + nf + 16 + (c.cond ? 38 : 0) + k.measure(cw, dl, px, 4) + 20, ty = yy + Math.max(34, (ch - need) / 2 + 22);
    k.text(xx + px, ty, c.q, 16, 700, strong ? 'gon' : 'g'); ty += nf * .86 + 18; var vx = xx + px;
    if (c.frm) vx += k.text(vx, ty, c.frm + ' →', 26, 700, strong ? 'gon' : 'mute') + 12;
    var tv = T(g, vx, ty, c.v, { 'font-size': nf, 'font-weight': 800, fill: col(fg) }); vx += h.textW(c.v, nf, true) + 10;
    if (typeof c.n === 'number') { tv.setAttribute('data-count', c.n); tv.setAttribute('data-dec', c.dec || 0); tv.setAttribute('data-fx', 'count') }
    if (c.unit) vx += k.text(vx, ty, c.unit, c.big ? 20 : 18, 700, fg2) + 12;
    if (c.side) { if (c.sideAt === 'end') k.text(xx + cw - px, ty, c.side, 18, 600, fg2, 'end'); else k.text(vx, ty, c.side, 18, 700, fg2) }
    ty += 20; if (c.cond) { k.chip(xx + px, ty, c.cond, strong ? C.main : 'g18', strong ? 'white' : 'gdk', 16, 30); ty += 40 }
    var sp = c.spark, sh = sp ? Math.min(110, ch - (ty - yy) - 100) : 0, rest = yy + ch - ty - (sp && sh > 30 ? sh + 44 : 0);
    if (dl.length) k.stack(xx, ty, cw, rest - 6, dl, { pad: px, align: 'start', valign: 'top', gap: 4 });
    if (sp && sh > 30) spark(g, xx + px + 4, yy + ch - sh - 34, cw - px * 2 - 8, sh, sp, strong ? 'gon' : 'gdk', c.sl, c.rng) }) }
function spark(g, x, y, w, hh, vals, tn, labels, rng) { var lo = rng ? rng[0] : Math.min.apply(null, vals), hi = rng ? rng[1] : Math.max.apply(null, vals), rg = (hi - lo) || 1, n = vals.length;
  var P = vals.map(function (v, i) { return [x + w * i / Math.max(1, n - 1), y + hh - (v - lo) / rg * hh] });
  E('polyline', { points: P.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: 'none', stroke: col(tn), 'stroke-width': 5, 'stroke-linejoin': 'round', 'data-fx': 'draw', 'data-ms': 700 }, g);
  [0, n - 1].forEach(function (i) { E('circle', { cx: P[i][0], cy: P[i][1], r: 4, fill: col(tn) }, g) });
  if (labels) { T(g, P[0][0], y + hh + 22, labels[0], { 'font-size': 13, fill: col(tn === 'gon' ? 'gon' : 'mute') }); T(g, P[n - 1][0], y + hh + 22, labels[1], { 'font-size': 13, fill: col(tn === 'gon' ? 'gon' : 'mute'), 'text-anchor': 'end' }) } }

/* cards : 카드 열 — items[{k, fig, t, s, items[], tone}] · dir:'col' 이면 세로 */
function cards(svg, z, b, t0) { var x = z[0], y0 = z[1], w = z[2], H0 = z[3], it = b.items || [], n = it.length, gap = 12, vert = b.dir === 'col', cw = vert ? w : (w - gap * (n - 1)) / n, hh = vert ? (H0 - gap * (n - 1)) / n : H0;
  it.forEach(function (a, i) { var g = grp(svg, t0 + i * 300, a.t), k = K(g), xx = vert ? x : x + i * (cw + gap), y = vert ? y0 + i * (hh + gap) : y0, ts = tone(a.tone), st = a.tone === 'strong';
    k.rect(xx, y, cw, hh, ts[0]); var items = [];
    if (a.k) items.push([a.k, 16, 700, st ? 'gon' : 'g']); if (a.fig) items.push([a.fig, 26, 800, st ? 'white' : 'gdk']); items.push([a.t, 20, 700, ts[1]]);
    if (a.s) items.push([a.s, 18, 400, st ? ts[2] : 'sub']); (a.items || []).forEach(function (l) { items.push(['- ' + l, 18, 400, st ? ts[2] : 'sub']) });
    if (a.icon) { iconSvg(g, a.icon, xx + 18, y + 22, 46, st ? 'gon' : 'g'); k.stack(xx, y + 76, cw, hh - 76, items, { pad: 18, align: 'start', valign: 'top', gap: 10 }) }
    else k.stack(xx, y, cw, hh, items, { pad: 18, align: 'start', valign: b.valign || 'middle', gap: 10 }) }) }

/* note : 결론 띠 — t(한 문장) · tag · tone:'soft' 면 옅은 띠 */
function note(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], soft = b.tone === 'soft', g = grp(svg, t0, b.tag || '결론', 'fade'), k = K(g), tx = x + 20;
  k.rect(x, y, w, H, soft ? 'g18' : 'gdk');
  if (b.tag) tx += k.chip(x + 20, y + H / 2 - 15, b.tag, soft ? 'gdk' : 'gon', soft ? 'white' : 'gdk', 16, 30) + 16;
  k.stack(tx - 12, y, w - (tx - x), H, [[b.t, 18, 700, soft ? 'ink' : 'white']], { align: 'start', pad: 12 }) }

/* table : 머리글 표 — cols[{t, w, align:'c'}] · rows[[글 또는 {t, s, tone:'strong|mute|warn', b, fs}]] · hi[] · hot[] · maxh */
function table(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], cols = b.cols || [], rows = b.rows || [], n = rows.length, hh = 40, tot = 0, xs = [x];
  cols.forEach(function (c) { tot += c.w || 1 }); cols.forEach(function (c) { xs.push(xs[xs.length - 1] + w * (c.w || 1) / tot) });
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0); k0.rect(x, y + hh - 6, w, H - hh + 6, 'card'); k0.rect(x, y, w, hh, 'gdk');
  cols.forEach(function (c, i) { k0.text((xs[i] + xs[i + 1]) / 2, y + hh / 2 + 5, c.t, 16, 700, 'white', 'middle') });
  var rh = Math.min((H - hh) / Math.max(1, n), b.maxh || 200);
  rows.forEach(function (row, r) { var g = grp(svg, t0 + 250 + r * 200, String(row[0] && row[0].t || row[0])), k = K(g), yy = y + hh + r * rh;
    if ((b.hot || []).indexOf(r) >= 0) k.rect(x, yy, w, rh, 'yel', 0); else if ((b.hi || []).indexOf(r) >= 0) k.rect(x, yy, w, rh, 'g18', 0);
    E('line', { x1: x, x2: x + w, y1: yy + rh, y2: yy + rh, stroke: col('line'), 'stroke-width': 1.5 }, g);
    row.forEach(function (cell, i) { var d = typeof cell === 'object' && cell ? cell : { t: cell }, fs = d.fs || (i === 0 && rh >= 84 ? 20 : 18), wt = i === 0 || d.b ? 700 : 400;
      var fill = { strong: 'gdk', mute: 'mute', warn: 'warn' }[d.tone] || 'ink', items = [[String(d.t), fs, d.tone === 'strong' ? 700 : wt, fill]]; if (d.s) items.push([d.s, 16, 400, 'mute']);
      k.stack(xs[i], yy, xs[i + 1] - xs[i], rh, items, { pad: 14, align: (cols[i] || {}).align === 'c' ? 'middle' : 'start', gap: 2 }) }) }) }

/* bars : 가로 막대 — items[{label, sub, v, vt, tone, segs[[이름, 값]], hero, note}] · unit · max · delta{a, b, t} · ref{v, t} */
function bars(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], it = b.items || [], n = it.length, unit = b.unit || '', mx = b.max || Math.max.apply(null, it.map(function (a) { return a.v }));
  var labw = b.labw || Math.max.apply(null, it.map(function (a) { return Math.max(h.textW(a.label, 20, true), h.textW(a.sub || '', 16)) })) + 28, dl = b.delta, rh = H / n;
  var low = it.some(function (a) { return a.note || a.segs }) ? 30 : 0, th = Math.min(92, (rh - low) * (dl ? .68 : .72)), bigrow = rh >= 108;
  function vsz(a) { return a.hero ? [52, 26] : (bigrow ? [36, 20] : [20, 18]) }
  var vw = Math.max.apply(null, it.map(function (a) { var f = vsz(a); return h.textW(String(a.vt != null ? a.vt : a.v), f[0], true) + h.textW(unit, f[1], true) + 34 })), bx = x + labw, bw = w - labw - vw, pos = [];
  var g0 = grp(svg, t0, null, 'fade'); E('line', { x1: bx, x2: bx, y1: y, y2: y + H, stroke: C.axis, 'stroke-width': 1.5 }, g0);
  it.forEach(function (a, i) { var g = grp(svg, t0 + 200 + i * 260, a.label, 'left'), k = K(g), tn = a.tone, cy = y + i * rh + rh / 2 - (dl && i === 0 ? 10 : 0) + (dl && i === n - 1 ? 10 : 0), top = cy - (th + low) / 2;
    k.stack(x, top + th / 2 - (rh - low) / 2 + 1, labw - 14, rh - low - 2, [[a.label, bigrow ? 20 : 18, 800, 'ink'], [a.sub, 16, 500, 'mute']], { align: 'start', pad: 0, gap: 4 });
    var cs = { strong: ['gdk', 'g'], mute: [C.axis, C.gray], warn: ['warn', '#C98F35'], hot: ['yel', '#C98F35'] }[tn] || ['g', 'g40'], segs = a.segs || [[null, a.v]], xx = bx;
    segs.forEach(function (sg, kk) { var L = Math.max(bw * sg[1] / mx, 3), fill = cs[Math.min(kk, 1)]; k.rect(xx, top, L, th, fill, 2);
      if (sg[0]) { var fg = /g40|yel|C98F35|C9D1CD/i.test(col(fill)) ? 'ink' : 'white';
        if (L > h.textW(sg[0], 16, true) + 30 && L > h.textW(sg[1] + unit, 20, true) + 30 && th >= 64) { k.text(xx + 16, top + th / 2 - 6, sg[0], 16, 600, fg); k.text(xx + 16, top + th / 2 + 24, sg[1] + unit, 20, 800, fg) }
        else k.text(xx, top + th + 24, sg[0] + ' ' + sg[1] + unit, 16, 700, tn === 'strong' ? 'g' : 'sub') }
      xx += L });
    var f = vsz(a), vt = String(a.vt != null ? a.vt : a.v), by = top + th / 2 + f[0] * .36, vx = xx + 20, vc = tn === 'strong' ? 'gdk' : (tn === 'warn' ? 'warn' : 'sub');
    vx += k.text(vx, by, vt, f[0], 800, vc) + 8; if (unit) k.text(vx, by, unit, f[1], 700, tn === 'strong' ? 'gdk' : 'sub');
    if (a.note) k.text(bx + 16, top + th + 24, a.note, 16, 500, 'mute'); pos.push([xx, top, top + th]) });
  if (dl && pos[dl.a] && pos[dl.b]) { var A = pos[dl.a], B = pos[dl.b], yy = (A[2] + B[1]) / 2, lo = Math.min(A[0], B[0]), hi = Math.max(A[0], B[0]), gd = grp(svg, t0 + 300 + n * 260, dl.t, 'fade'), kd = K(gd);
    E('line', { x1: hi, x2: hi, y1: A[2], y2: yy + 12, stroke: C.axis, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, gd);
    E('line', { x1: lo + 10, x2: hi - 10, y1: yy, y2: yy, stroke: C.dark, 'stroke-width': 3 }, gd);
    E('path', { d: 'M' + lo + ',' + yy + 'l12,-7v14z M' + hi + ',' + yy + 'l-12,-7v14z', fill: C.dark }, gd);
    var ww = h.textW(dl.t, 18, true) + 28; E('rect', { x: (lo + hi) / 2 - ww / 2, y: yy - 16, width: ww, height: 32, rx: 0, fill: '#FFFFFF' }, gd); kd.text((lo + hi) / 2, yy + 6, dl.t, 18, 800, 'gdk', 'middle') }
  if (b.ref) { var rx = bx + bw * b.ref.v / mx, gr = grp(svg, t0 + 400 + n * 260, b.ref.t, 'fade'); E('line', { x1: rx, x2: rx, y1: y + 4, y2: y + H - 4, stroke: C.warn, 'stroke-width': 3, 'stroke-dasharray': '9 7' }, gr); K(gr).text(rx + 10, y + 20, b.ref.t, 16, 700, 'warn') } }

/* 직각 연결선 — 가로 · 세로 마디만, 꺾는 곳은 둥글게(r). o = {sw, dash, arrow, lab} */
function link(g, pts, tn, o) { o = o || {}; var r = o.r || 8, d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
  for (var i = 1; i < pts.length - 1; i++) { var a = pts[i - 1], b = pts[i], c = pts[i + 1], dx0 = Math.sign(b[0] - a[0]), dy0 = Math.sign(b[1] - a[1]), dx1 = Math.sign(c[0] - b[0]), dy1 = Math.sign(c[1] - b[1]);
    var rr = Math.min(r, (Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1])) / 2, (Math.abs(c[0] - b[0]) + Math.abs(c[1] - b[1])) / 2);
    d += ' L' + (b[0] - dx0 * rr).toFixed(1) + ',' + (b[1] - dy0 * rr).toFixed(1) + ' Q' + b[0].toFixed(1) + ',' + b[1].toFixed(1) + ' ' + (b[0] + dx1 * rr).toFixed(1) + ',' + (b[1] + dy1 * rr).toFixed(1) }
  var z = pts[pts.length - 1], y0 = pts[pts.length - 2]; d += ' L' + z[0].toFixed(1) + ',' + z[1].toFixed(1);
  E('path', { d: d, fill: 'none', stroke: col(tn || 'g65'), 'stroke-width': o.sw || 3, 'stroke-dasharray': o.dash ? '9 7' : null }, g);
  if (o.arrow) { var ux = Math.sign(z[0] - y0[0]), uy = Math.sign(z[1] - y0[1]), s = 9; E('path', { d: 'M' + z[0] + ',' + z[1] + 'L' + (z[0] - ux * s * 1.4 - uy * s * .8) + ',' + (z[1] - uy * s * 1.4 - ux * s * .8) + 'L' + (z[0] - ux * s * 1.4 + uy * s * .8) + ',' + (z[1] - uy * s * 1.4 + ux * s * .8) + 'Z', fill: col(tn || 'g65') }, g) } }

/* timeline : 시간 축 + 사건 카드 + 국면 띠 — t0 · t1 · events[{at, t, d, s, side:'up|down', tone, dx, w}] · phases[{a, b, t, tone}] · ticks[[값, 글]] · ew · pad */
function timeline(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], T0 = b.t0, T1 = b.t1, ev = b.events || [], pad = b.pad == null ? 90 : b.pad, ax0 = x + pad, ax1 = x + w - pad;
  var ups = ev.filter(function (e) { return (e.side || 'up') === 'up' }), dns = ev.filter(function (e) { return e.side === 'down' }), band = 34, ay = dns.length ? y + (H - band) / 2 : y + H - band - 22; if (!ups.length) ay = y;
  function px(t) { return ax0 + (ax1 - ax0) * (t - T0) / ((T1 - T0) || 1) }
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0);
  if (b.phases) b.phases.forEach(function (p) { var c = { strong: ['gdk', 'white'], mid: ['g', 'white'], soft: ['g18', 'gdk'] }[p.tone || 'soft'] || ['g18', 'gdk'], xa = px(p.a), xb = px(p.b); k0.rect(xa + 1, ay, xb - xa - 2, band, c[0], 0); k0.text((xa + xb) / 2, ay + band / 2 + 5, p.t, 16, 700, c[1], 'middle') });
  else k0.rect(ax0, ay + band / 2 - 2, ax1 - ax0, 4, 'g40', 0);
  (b.ticks || []).forEach(function (q) { k0.text(px(q[0]), ay + band + 18, q[1], 16, 500, 'mute', 'middle') });
  var ew = b.ew || 178, tk = b.ticks ? 20 : 0, k = 0;
  [[ups, true], [dns, false]].forEach(function (G) { if (!G[0].length) return; var up = G[1], ch0 = up ? ay - y - 22 : y + H - (ay + band + tk + 22);
    G[0].forEach(function (e) { var g = grp(svg, t0 + 300 + (k++) * 300, e.t), kk = K(g), p = px(e.at), ww = e.w || ew, cx = Math.min(Math.max(p + (e.dx || 0), x + ww / 2), x + w - ww / 2), ts = tone(e.tone), st = e.tone === 'strong';
      var its = [[e.d, 16, 700, st ? 'gon' : 'g'], [e.t, 20, 700, ts[1]], [e.s, 16, 400, ts[2]]], ch = Math.min(ch0, kk.measure(ww, its, 14, 6) + 30), cy = up ? y : y + H - ch;
      kk.rect(cx - ww / 2, cy, ww, ch, ts[0]); kk.stack(cx - ww / 2, cy, ww, ch, its, { pad: 14, align: 'start', gap: 6 });
      var ya = up ? ay : ay + band + tk, yb = up ? cy + ch : cy, my = (ya + yb) / 2;
      link(g, Math.abs(cx - p) < 1 ? [[p, ya], [p, yb]] : [[p, ya], [p, my], [cx, my], [cx, yb]], 'g65', { sw: 1.5 });
      E('circle', { cx: p, cy: up ? ay : ay + band, r: 4.5, fill: '#FFFFFF', stroke: C.dark, 'stroke-width': 3 }, g) }) }) }

/* layers : 층 쌓기 · 포함 겹 — layers[{t, n, s, chips[], tone, to}] · mode:'nest'(포함 겹) · flow(층 사이 화살) · tw · sw */
function layers(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], L = b.layers || [], n = L.length;
  if (b.mode === 'nest') { var ins = 22, top = 46, cx = x, cy = y, cw = w, ch = H;
    L.forEach(function (a, i) { var g = grp(svg, t0 + i * 300, a.t, 'fade'), k = K(g);
      if (i === n - 1) { k.rect(cx, cy, cw, ch, 'gdk'); k.stack(cx, cy, cw, ch, [[a.t, 20, 700, 'white'], [a.s, 16, 400, 'gon']], { gap: 4 }); return }
      k.rect(cx, cy, cw, ch, ['card', 'g18', 'g40', 'g'][Math.min(i, 3)]); var tw = k.text(cx + 16, cy + 30, a.t, 20, 700, 'gdk');
      if (a.n) k.text(cx + 16 + tw + 10, cy + 29, a.n, 16, 600, 'sub'); if (a.s) k.text(cx + cw - 16, cy + 29, a.s, 16, 400, 'sub', 'end');
      cx += ins; cw -= ins * 2; cy += top; ch -= top + ins }); return }
  var gap = b.flow ? 26 : 8, lh = (H - gap * (n - 1)) / n, tw = b.tw || 220;
  L.forEach(function (a, i) { var g = grp(svg, t0 + i * 280, a.t), k = K(g), yy = y + i * (lh + gap), ts = tone(a.tone || 'soft'), st = a.tone === 'strong';
    k.rect(x, yy, w, lh, ts[0]); k.stack(x, yy, tw, lh, [[a.t, 20, 700, st ? ts[1] : 'gdk'], [a.n, 16, 400, ts[2]]], { align: 'start', pad: 18, gap: 2 });
    if (a.s) k.stack(x + tw, yy, b.sw || 330, lh, [[a.s, 18, 500, ts[1]]], { align: 'start', pad: 8 });
    var chips = a.chips || []; if (chips.length) { var cws = chips.map(function (c) { return h.textW(c, 16, true) + 24 }), cxx = x + w - cws.reduce(function (s0, v) { return s0 + v }, 0) - 8 * (chips.length - 1) - 16;
      chips.forEach(function (c, j) { k.rect(cxx, yy + lh / 2 - 15, cws[j], 30, st ? C.main : '#FFFFFF', 6); k.text(cxx + cws[j] / 2, yy + lh / 2 + 5, c, 16, 600, st ? 'white' : 'gdk', 'middle'); cxx += cws[j] + 8 }) }
    if (b.flow && i < n - 1) { var ax = x + w / 2; link(g, [[ax, yy + lh + 3], [ax, yy + lh + gap - 3]], 'g65', { arrow: true }); if (a.to) k.text(ax + 12, yy + lh + gap / 2 + 5, a.to, 16, 600, 'sub') } }) }

/* pict : 그림 단위 환산 — rows[{label, sub, n, on, v, unit, tone, delta}] · icon:'drum|box|person|doc' · sz · labw · valw · key · box */
var cpid = 0;
function icon(g, kind, x, y, sz, fill, frac) { var hh, body = [];
  function mk(p) { if (kind === 'person') { var r = sz * .2; E('circle', { cx: x + sz / 2, cy: y + r, r: r }, p); E('rect', { x: x + sz * .2, y: y + r * 2 + 3, width: sz * .6, height: sz * 1.25 - r * 2 - 3, rx: sz * .2 }, p) }
    else if (kind === 'doc') E('path', { d: 'M' + (x + sz * .1) + ',' + y + ' h' + sz * .55 + ' l' + sz * .25 + ',' + sz * .25 + ' v' + (hh - sz * .25) + ' h' + (-sz * .8) + ' z' }, p);
    else E('rect', { x: x + sz * .08, y: y, width: sz * .84, height: hh, rx: kind === 'drum' ? sz * .16 : 3 }, p) }
  hh = kind === 'person' || kind === 'doc' ? sz * 1.25 : sz * 1.1;
  if (frac >= 1) mk(E('g', { fill: col(fill) }, g));
  else { mk(E('g', { fill: C.light }, g)); if (frac > 0) { var id = 'bpc' + (++cpid), cp = E('clipPath', { id: id }, g); E('rect', { x: x, y: y, width: sz * frac, height: hh + 2 }, cp); mk(E('g', { fill: col(fill), 'clip-path': 'url(#' + id + ')' }, g)) } }
  if (kind === 'drum') [.33, .66].forEach(function (q) { E('line', { x1: x + sz * .08, x2: x + sz * .92, y1: y + hh * q, y2: y + hh * q, stroke: '#FFFFFF', 'stroke-width': 3 }, g) });
  return hh }
function pict(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], rows = b.rows || [], n = rows.length, labw = b.labw || 190, valw = b.valw || 190, keyh = b.key ? 30 : 0, px = 20, py = 12, ic = b.icon || 'drum';
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0); if (b.box !== false) k0.rect(x, y, w, H, 'card');
  var rh = (H - keyh - py * 2) / n, cnt = Math.max.apply(null, rows.map(function (r) { return r.n })), gi = 6, sz = Math.min(b.sz || 44, (w - px * 2 - labw - valw - gi * (cnt - 1)) / cnt);
  rows.forEach(function (r, i) { var g = grp(svg, t0 + 250 + i * 350, r.label), k = K(g), cy = y + py + i * rh + rh / 2, hh = sz * (ic === 'person' || ic === 'doc' ? 1.25 : 1.1);
    k.stack(x + px, cy - rh / 2, labw, rh, [[r.label, 18, 700, 'ink'], [r.sub, 16, 400, 'mute']], { align: 'start', pad: 0, gap: 2 });
    for (var q = 0; q < r.n; q++) icon(g, ic, x + px + labw + q * (sz + gi), cy - hh / 2, sz, r.tone || 'gdk', Math.max(0, Math.min(1, r.on - q)));
    var vx = x + w - px - valw + 16, vw = k.text(vx, cy + 14, String(r.v), 36, 800, r.tone || 'gdk');
    if (r.unit) { if (h.textW(r.unit, 16, true) < valw - 16 - vw - 8) k.text(vx + vw + 8, cy + 14, r.unit, 16, 600, 'sub'); else k.text(vx, cy + 36, r.unit, 16, 600, 'sub') }
    if (r.delta && i < n - 1) k.text(x + px + labw + cnt * (sz + gi) / 2, cy + rh / 2 + 5, r.delta, 16, 700, 'warn', 'middle') });
  if (b.key) k0.text(x + px, y + H - 14, b.key, 16, 400, 'mute') }

/* 연결선 이름표 — 가장 긴 마디 가운데(lp 로 마디 고름)에 바탕색 가림 칸 */
function linkLab(g, pts, lab, tn, lbg, lp) { var segs = []; for (var i = 0; i < pts.length - 1; i++) segs.push([pts[i], pts[i + 1]]);
  var k = lp != null ? lp : segs.reduce(function (bi, s0, j) { var L = function (q) { return Math.abs(q[0][0] - q[1][0]) + Math.abs(q[0][1] - q[1][1]) }; return L(s0) > L(segs[bi]) ? j : bi }, 0), a = segs[k], mx = (a[0][0] + a[1][0]) / 2, my = (a[0][1] + a[1][1]) / 2, ww = h.textW(lab, 16, true) + 14;
  E('rect', { x: mx - ww / 2, y: my - 14, width: ww, height: 28, rx: 0, fill: col(lbg || 'white') }, g); T(g, mx, my + 6, lab, { 'font-size': 16, 'font-weight': 600, fill: col(tn === 'axis' ? 'sub' : tn), 'text-anchor': 'middle' }) }

/* nodes : 상자 + 직각 연결선 — cols · rows · nodes[{id, c, r, cs, rs, t, s, fig, tone, badge}] · edges[{a, b, pa, pb, oa, ob, m, off, style:'solid|main|dash|warn', lab, lp, lbg}] · lanes[] · colhead[] · gx · gy · maxh · fs */
function nodes(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], cols = b.cols, rows = b.rows, lanes = b.lanes, chd = b.colhead, lw = lanes ? 132 : 0, top = (chd ? 44 : 0) + Math.max((b.nodes || []).some(function (q) { return q.badge && q.r === 0 }) ? 14 : 0, Math.max.apply(null, [0].concat((b.edges || []).filter(function (e) { return e.pa === 't' && e.pb === 't' }).map(function (e) { return (e.off || 22) + (e.lab ? 16 : 4) })))), gx = b.gx == null ? 64 : b.gx, gy = b.gy == null ? 40 : b.gy;
  var x0 = x + lw + (lanes ? 20 : 0), gw = w - (x0 - x) - (lanes ? 12 : 0), cw = (gw - gx * (cols - 1)) / cols, bodyh = H - top, rowy = [], nh, g0 = grp(svg, t0, null, 'fade'), k0 = K(g0);
  if (lanes) { var bh = bodyh / rows; nh = Math.min(bh - 28, b.maxh || 96);
    lanes.forEach(function (nm, r) { var yy = y + top + r * bh; k0.rect(x, yy + 3, w, bh - 6, r % 2 === 0 ? 'well' : 'card'); k0.rect(x, yy + 3, lw, bh - 6, 'g18'); k0.stack(x, yy + 3, lw, bh - 6, [[nm, 18, 700, 'gdk']]) });
    for (var r = 0; r < rows; r++) rowy.push(y + top + r * bh + (bh - nh) / 2) }
  else { nh = Math.min((bodyh - gy * (rows - 1)) / rows, b.maxh || 150); var g2 = rows > 1 ? (bodyh - rows * nh) / (rows - 1) : 0, y1 = y + top + (rows === 1 ? (bodyh - nh) / 2 : 0); for (var r2 = 0; r2 < rows; r2++) rowy.push(y1 + r2 * (nh + g2)) }
  (chd || []).forEach(function (nm, c) { var st = nm.charAt(0) === '*'; nm = nm.replace(/^\*/, ''); k0.rect(x0 + c * (cw + gx), y, cw, 30, st ? 'gdk' : 'g18'); k0.text(x0 + c * (cw + gx) + cw / 2, y + 20, nm, 16, 700, st ? 'white' : 'gdk', 'middle') });
  var N = {}, gE = grp(svg, t0 + 200 + (b.nodes || []).length * 220, null, 'fade');
  (b.nodes || []).forEach(function (n, i) { var g = grp(svg, t0 + 150 + i * 220, n.t), k = K(g), cs = n.cs || 1, rs = n.rs || 1, nx = x0 + n.c * (cw + gx), nw = cw * cs + gx * (cs - 1), ny = rowy[n.r], nhh = rowy[n.r + rs - 1] + nh - ny, ts = tone(n.tone), st = n.tone === 'strong';
    k.rect(nx, ny, nw, nhh, ts[0]); var items = [[n.t, b.fs || (nw >= 190 && nhh >= 84 ? 20 : 18), 700, ts[1]]]; if (n.fig) items.unshift([n.fig, 26, 800, st ? 'white' : 'gdk']); if (n.s) items.push([n.s, 16, 400, ts[2]]);
    k.stack(nx, ny, nw, nhh, items, { pad: 12, gap: 4 }); if (n.badge) k.chip(nx + 10, ny - 12, n.badge, 'warn', 'white', 13, 22);
    N[n.id] = [nx, ny, nw, nhh, n.c, n.r] });
  function port(id, p, o) { var q = N[id]; o = o || 0; return { r: [q[0] + q[2], q[1] + q[3] / 2 + o], l: [q[0], q[1] + q[3] / 2 + o], t: [q[0] + q[2] / 2 + o, q[1]], b: [q[0] + q[2] / 2 + o, q[1] + q[3]] }[p] }
  (b.edges || []).forEach(function (e) { if (!N[e.a] || !N[e.b]) return; var A0 = N[e.a], B0 = N[e.b], pa = e.pa, pb = e.pb;
    if (!pa) { if (B0[4] > A0[4]) { pa = 'r'; pb = 'l' } else if (B0[4] < A0[4]) { pa = 'l'; pb = 'r' } else if (B0[5] > A0[5]) { pa = 'b'; pb = 't' } else { pa = 't'; pb = 'b' } }
    var A = port(e.a, pa, e.oa), B = port(e.b, pb, e.ob), HZ = function (p) { return p === 'r' || p === 'l' }, pts;
    if (HZ(pa) && HZ(pb)) { if (pa !== pb) { if (Math.abs(A[1] - B[1]) < 1) pts = [A, B]; else { var mx = A[0] + (B[0] - A[0]) * (e.m == null ? .5 : e.m); pts = [A, [mx, A[1]], [mx, B[1]], B] } }
      else { var off = (e.off || 28) * (pa === 'r' ? 1 : -1), cx = (pa === 'r' ? Math.max : Math.min)(A[0], B[0]) + off; pts = [A, [cx, A[1]], [cx, B[1]], B] } }
    else if (!HZ(pa) && !HZ(pb)) { if (pa !== pb) { if (Math.abs(A[0] - B[0]) < 1) pts = [A, B]; else { var my = A[1] + (B[1] - A[1]) * (e.m == null ? .5 : e.m); pts = [A, [A[0], my], [B[0], my], B] } }
      else { var off2 = (e.off || 22) * (pa === 'b' ? 1 : -1), cy = (pa === 'b' ? Math.max : Math.min)(A[1], B[1]) + off2; pts = [A, [A[0], cy], [B[0], cy], B] } }
    else if (HZ(pa)) pts = [A, [B[0], A[1]], B]; else pts = [A, [A[0], B[1]], B];
    var sty = e.style || 'solid', tn = { solid: 'g65', main: 'gdk', dash: 'axis', warn: 'warn' }[sty] || 'g65', lbg = e.lbg || (lanes && A0[5] === B0[5] ? (A0[5] % 2 === 0 ? 'well' : 'card') : 'white');
    link(gE, pts, tn, { arrow: true, dash: (sty === 'dash' || sty === 'warn') && e.dashed !== false }); if (e.lab) linkLab(gE, pts, e.lab, tn, lbg, e.lp) }) }

/* line : 선 차트 — x[] · y{min, max, step, unit} · series[{name, v[], tone, dash, show[], ldy, vdy}] · bands[{a, b, t}] · ref{v, t} · notes[{i, v, t, dx, dy}] · xstep · rpad */
function line(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], xl = b.x || [], n = xl.length, Y = b.y, px0 = x + 52, px1 = x + w - (b.rpad || 120), py0 = y + 32, py1 = y + H - 34;
  function X(i) { return px0 + (px1 - px0) * i / Math.max(1, n - 1) } function Yv(v) { return py1 - (py1 - py0) * (v - Y.min) / ((Y.max - Y.min) || 1) }
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0);
  (b.bands || []).forEach(function (q) { k0.rect(X(q.a), py0, X(q.b) - X(q.a), py1 - py0, 'card', 0); k0.text((X(q.a) + X(q.b)) / 2, py0 + 18, q.t, 16, 700, 'g', 'middle') });
  for (var v = Y.min; v <= Y.max + 1e-9; v += Y.step) { E('line', { x1: px0, x2: px1, y1: Yv(v), y2: Yv(v), stroke: C.grid, 'stroke-width': 1.5 }, g0); k0.text(px0 - 10, Yv(v) + 5, String(+v.toFixed(6)), 16, 400, 'mute', 'end') }
  if (Y.unit) k0.text(px0 - 10, py0 - 16, Y.unit, 16, 400, 'mute', 'end');
  for (var i = 0; i < n; i += (b.xstep || 1)) k0.text(X(i), py1 + 24, xl[i], 16, 400, 'mute', 'middle');
  if (b.ref) { E('line', { x1: px0, x2: px1, y1: Yv(b.ref.v), y2: Yv(b.ref.v), stroke: C.warn, 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g0); k0.text(px1 + 10, Yv(b.ref.v) + 5, b.ref.t, 16, 600, 'warn') }
  (b.series || []).forEach(function (sr, j) { var g = grp(svg, t0 + 300 + j * 500, sr.name, 'fade'), k = K(g), tn = sr.tone || 'gdk', P = [];
    sr.v.forEach(function (vv, i2) { if (vv != null) P.push([X(i2), Yv(vv)]) });
    E('polyline', { points: P.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: 'none', stroke: col(tn), 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-dasharray': sr.dash ? '7 5' : null, 'data-fx': 'draw', 'data-ms': 900 }, g);
    var L = P[P.length - 1]; k.text(L[0] + 10, L[1] + 5 + (sr.ldy || 0), sr.name, 16, 700, tn);
    (sr.show || []).forEach(function (i3) { var xx = X(i3), yy = Yv(sr.v[i3]); E('circle', { cx: xx, cy: yy, r: 4.5, fill: col(tn) }, g); T(g, xx, yy + (sr.vdy == null ? -12 : sr.vdy), String(sr.v[i3]), { 'font-size': 16, 'font-weight': 700, fill: col(tn), 'text-anchor': 'middle', stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }) }) });
  (b.notes || []).forEach(function (nt, j) { var g = grp(svg, t0 + 900 + j * 300, nt.t, 'fade'), k = K(g), xx = X(nt.i), yy = Yv(nt.v), tx = xx + (nt.dx || 0), ty = yy + (nt.dy == null ? -50 : nt.dy), Ls = String(nt.t).split('\n');
    var ww = Math.max.apply(null, Ls.map(function (l) { return h.textW(l, 16) })) + 20, hh = 22 * Ls.length + 12, bx = tx - ww / 2, by = ty - hh / 2;
    link(g, Math.abs(nt.dx || 0) < 1 ? [[xx, yy + (ty < yy ? -7 : 7)], [xx, ty < yy ? by + hh : by]] : [[xx, yy + (ty < yy ? -7 : 7)], [xx, ty], [tx < xx ? bx + ww : bx, ty]], 'sub', { sw: 1.5 });
    k.rect(bx, by, ww, hh, 'card'); Ls.forEach(function (l, q) { k.text(tx, by + 22 + q * 22, l, 16, 500, 'ink', 'middle') }) }) }

/* dist : 점 분포 + 상자 수염 — groups[{label, dots{값: 개수}, box[q1, 중앙, q3], lo, hi}] · y{min, max, step, unit} · ref{v, t} */
function dist(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], G = b.groups || [], Y = b.y, n = G.length, px0 = x + 52, px1 = x + w - 110, py0 = y + 32, py1 = y + H - 36, gw = (px1 - px0) / Math.max(1, n);
  function Yv(v) { return py1 - (py1 - py0) * (v - Y.min) / ((Y.max - Y.min) || 1) }
  var g0 = grp(svg, t0, null, 'fade'), k0 = K(g0);
  for (var v = Y.min; v <= Y.max + 1e-9; v += Y.step) { E('line', { x1: px0, x2: px1, y1: Yv(v), y2: Yv(v), stroke: C.grid, 'stroke-width': 1.5 }, g0); k0.text(px0 - 10, Yv(v) + 5, v.toFixed(2), 16, 400, 'mute', 'end') }
  if (Y.unit) k0.text(px0 - 10, py0 - 16, Y.unit, 16, 400, 'mute', 'end');
  if (b.ref) { E('line', { x1: px0, x2: px1, y1: Yv(b.ref.v), y2: Yv(b.ref.v), stroke: C.warn, 'stroke-width': 3, 'stroke-dasharray': '7 5' }, g0); k0.text(px1 + 10, Yv(b.ref.v) + 5, b.ref.t, 16, 600, 'warn') }
  G.forEach(function (gq, i) { var g = grp(svg, t0 + 300 + i * 400, gq.label, 'fade'), k = K(g), cx = px0 + gw * i + gw * .36, ks = Object.keys(gq.dots || {}), mxc = Math.max.apply(null, ks.map(function (q) { return gq.dots[q] })), sp = Math.min(13, gw * .6 / mxc);
    ks.forEach(function (val) { for (var q = 0; q < gq.dots[val]; q++) E('circle', { cx: cx + (q - (gq.dots[val] - 1) / 2) * sp, cy: Yv(+val), r: Math.min(5, sp / 2 - .6), fill: C.dark }, g) });
    var q1 = gq.box[0], med = gq.box[1], q3 = gq.box[2], bx = px0 + gw * i + gw * .82;
    E('line', { x1: bx, x2: bx, y1: Yv(gq.hi), y2: Yv(gq.lo), stroke: C.sub, 'stroke-width': 1.5 }, g);
    E('rect', { x: bx - 11, y: Yv(q3), width: 22, height: Math.max(Yv(q1) - Yv(q3), 3), rx: 0, fill: C.g18 }, g); E('line', { x1: bx - 11, x2: bx + 11, y1: Yv(med), y2: Yv(med), stroke: C.dark, 'stroke-width': 5 }, g);
    T(g, bx + 18, Yv(med) + (b.ref && Math.abs(Yv(med) - Yv(b.ref.v)) < 14 ? -9 : 5), med.toFixed(2), { 'font-size': 16, 'font-weight': 700, fill: C.dark, stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    k.text(px0 + gw * i + gw / 2, py1 + 26, gq.label, 16, 700, 'ink', 'middle') }) }

/* matrix : 2×2 — quads[{t, s, items[], tone}] (왼위 · 오른위 · 왼아래 · 오른아래) · xaxis · yaxis */
function matrix(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], lab = 30, gx = x + lab, gw = w - lab, gh = H - lab, hw = (gw - 8) / 2, hh = (gh - 8) / 2;
  (b.quads || []).forEach(function (q, i) { var g = grp(svg, t0 + i * 280, q.t), k = K(g), ts = tone(q.tone || 'plain'), qx = gx + (i % 2) * (hw + 8), qy = y + Math.floor(i / 2) * (hh + 8);
    k.rect(qx, qy, hw, hh, ts[0]); k.stack(qx, qy, hw, hh, [[q.t, 20, 700, ts[1]], [q.s, 18, 400, ts[2]]].concat((q.items || []).map(function (it) { return ['- ' + it, 16, 400, ts[2]] })), { pad: 18, align: 'start', valign: 'top', gap: 6 }) });
  var g0 = grp(svg, t0, null, 'fade'); K(g0).text(gx + gw / 2, y + H - 8, b.xaxis || '', 16, 600, 'mute', 'middle');
  T(g0, 0, 0, b.yaxis || '', { transform: 'translate(' + (x + 14) + ',' + (y + gh / 2) + ') rotate(-90)', 'font-size': 16, 'font-weight': 600, fill: C.mute, 'text-anchor': 'middle' }) }

/* 아이콘 — 라인 아이콘(Lucide 이름) 또는 'tf:<코드>' = Tossface 원본 그림. Tossface 를 쓴 장은 각주에 출처 문구가 붙음 */
var usedTF = false;
function iconSvg(g, name, x, y, size, color) { name = String(name || '');
  if (name.indexOf('tf:') === 0) { var src = (ECOM.TF || {})[name.slice(3)]; if (!src) return; E('image', { href: src, x: x, y: y, width: size + 2, height: size + 2, 'data-k': 'emoji' }, g); usedTF = true; return }
  var body = (ECOM.ICONS || {})[name]; if (!body) return;
  var w = E('g', { transform: 'translate(' + x + ',' + y + ') scale(' + (size / 24).toFixed(3) + ')', fill: 'none', stroke: col(color || 'g'), 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-k': 'icon' }, g); w.innerHTML = body }

/* tiles : 벤토 타일 — grid[열, 줄] · items[{c, r, cs, rs, icon, ic, k, fig, big, t, fs, s, tone, bars[[이름, 값, 강조]], bottom}] · arrows[[a, b]] · gap */
function tiles(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], cols = b.grid[0], rows = b.grid[1], gap = b.gap == null ? 16 : b.gap, cw = (w - gap * (cols - 1)) / cols, rh = (H - gap * (rows - 1)) / rows, G = {};
  (b.items || []).forEach(function (t, i) { var g = grp(svg, t0 + i * 260, t.t), k = K(g), cs = t.cs || 1, rs = t.rs || 1, tx = x + t.c * (cw + gap), ty = y + t.r * (rh + gap), tw = cw * cs + gap * (cs - 1), th = rh * rs + gap * (rs - 1), hot = t.tone === 'strong', soft = t.tone === 'soft', pad = 26, yy = ty + pad, brs = t.bars || [], bh = 62 * brs.length;
    k.rect(tx, ty, tw, th, hot ? 'gdk' : (soft ? 'g18' : 'card')); G[i] = [tx, ty, tw, th];
    if (t.icon) { iconSvg(g, t.icon, tx + pad, yy, 38, hot ? 'gon' : (t.ic || 'g')); yy += 54 }
    if (brs.length) { var mx = Math.max.apply(null, brs.map(function (q) { return q[1] }));
      brs.forEach(function (q, j) { var by = ty + th - pad - bh + j * 62 + 8, L = (tw - pad * 2) * q[1] / mx; k.text(tx + pad, by + 12, q[0], 16, 700, hot ? 'white' : 'sub'); k.rect(tx + pad, by + 22, L, 26, hot ? (q[2] ? 'gon' : 'gmid') : (q[2] ? 'gdk' : 'g40'), 2) }); th -= bh + 6 }
    var R = []; if (t.k) R.push([t.k, 16, 600, hot ? 'gon' : 'mute']); if (t.fig) R.push([t.fig, t.big ? 52 : 36, 800, hot ? 'white' : 'ink']); R.push([t.t, t.fs || 20, 700, hot ? 'white' : 'ink']); if (t.s) R.push([t.s, 16, 400, hot ? 'gon' : 'sub']);
    if (t.icon) k.stack(tx, yy - 12, tw, th - (yy - ty) + 4, R, { pad: pad, align: 'start', valign: 'top', gap: 6 }); else k.stack(tx, ty, tw, th, R, { pad: pad, align: 'start', gap: 6 }) });
  var ga = grp(svg, t0 + (b.items || []).length * 260, null, 'fade');
  (b.arrows || []).forEach(function (q) { var A = G[q[0]], B = G[q[1]]; if (!A || !B) return;
    if (Math.abs(A[1] - B[1]) < 1) { var yy = A[1] + Math.min(A[3], B[3]) / 2; link(ga, [[A[0] + A[2] + 2, yy], [B[0] - 2, yy]], 'g65', { arrow: true }) }
    else { var xx = A[0] + Math.min(A[2], B[2]) / 2; link(ga, [[xx, A[1] + A[3] + 2], [xx, B[1] - 2]], 'g65', { arrow: true }) } }) }

/* shot : 실제 그림 + 확대 풀이 — img(덱 기준 경로 또는 data:) · ar(원본 가로 ÷ 세로) · crop[l, t, r, b](0~1) · box[x, y, w, h](잘라 낸 그림 안 0~1) · title · mark · calls[{k, t, s, hot}] · dw(그림 칸 비율) */
var shid = 0;
function shot(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], dw = w * (b.dw || .52), cr = b.crop || [0, 0, 1, 1], ar = b.ar || 1, cwid = (cr[2] - cr[0]) * ar, chgt = cr[3] - cr[1];
  var kk = Math.min((dw - 24) / cwid, (H - 54) / chgt), iw = cwid * kk, ih = chgt * kk, ix = x + (dw - iw) / 2, iy = y + 42 + (H - 54 - ih) / 2, g0 = grp(svg, t0, b.title, 'fade'), k0 = K(g0);
  k0.rect(x, y, dw, H, 'card'); k0.text(x + 16, y + 28, b.title || '', 18, 700, 'ink');
  var mk = b.mark || '시험 자료(가상)'; k0.chip(x + dw - h.textW(mk, 13, true) - 36, y + 12, mk, 'well', 'mute', 13, 22);
  var id = 'bsh' + (++shid), vs = E('svg', { x: ix, y: iy, width: iw, height: ih, viewBox: (cr[0] * ar) + ' ' + cr[1] + ' ' + cwid + ' ' + chgt, preserveAspectRatio: 'none', 'data-k': 'shot', style: 'overflow:hidden' }, g0);
  E('image', { href: b.img || '', x: 0, y: 0, width: ar, height: 1, preserveAspectRatio: 'none' }, vs);
  var bx = b.box || [0, 0, 0, 0], X0 = ix + iw * bx[0], Y0 = iy + ih * bx[1], BW = iw * bx[2], BH = ih * bx[3];
  if (BW > 0) E('rect', { x: X0, y: Y0, width: BW, height: BH, rx: 0, fill: 'none', stroke: C.warn, 'stroke-width': 3 }, g0);
  var cx = x + dw + 56, cwd = w - dw - 56, cs = b.calls || [], gp = 12, ch = (H - gp * (cs.length - 1)) / Math.max(1, cs.length);
  cs.forEach(function (c, i) { var g = grp(svg, t0 + 400 + i * 300, c.t), k = K(g), yy = y + i * (ch + gp), hot = c.hot;
    k.rect(cx, yy, cwd, ch, hot ? 'gdk' : 'card'); k.stack(cx, yy, cwd, ch, [[c.k, 16, 700, hot ? 'gon' : 'g'], [c.t, 20, 700, hot ? 'white' : 'ink'], [c.s, 16, 400, hot ? 'gon' : 'sub']], { pad: 20, align: 'start', gap: 6 });
    if (hot && BW > 0) link(g, [[X0 + BW, Y0 + BH / 2], [x + dw + 28, Y0 + BH / 2], [x + dw + 28, yy + ch / 2], [cx, yy + ch / 2]], 'warn', { arrow: true }) }) }

/* list : 번호 목록 — items[{n, t, s, fig, hot, tone}] (그림 위 번호와 짝) */
function pin(g, cx, cy, n, tn) { E('circle', { cx: cx, cy: cy, r: 11, fill: col(tn || 'gdk'), stroke: '#FFFFFF', 'stroke-width': 3 }, g); T(g, cx, cy + 4.5, String(n), { 'font-size': 13, 'font-weight': 700, fill: '#FFFFFF', 'text-anchor': 'middle' }) }
function list(svg, z, b, t0) { var x = z[0], y = z[1], w = z[2], H = z[3], it = b.items || [], n = it.length, gap = 8, ch = (H - gap * (n - 1)) / Math.max(1, n);
  it.forEach(function (q, i) { var g = grp(svg, t0 + i * 260, q.t), k = K(g), yy = y + i * (ch + gap), px = 16; k.rect(x, yy, w, ch, q.hot ? 'g18' : 'card');
    if (q.n != null) { pin(g, x + 24, yy + ch / 2, q.n, q.tone); px = 46 }
    k.stack(x + px - 12, yy, w - px + 12, ch, [[q.fig, 20, 800, 'gdk'], [q.t, 18, 700, 'ink'], [q.s, 16, 400, 'sub']], { pad: 12, align: 'start', gap: 3 }) }) }

/* 색 틀(skin) — 명세의 skin 이 navy · plain 이면 블록 색을 그 틀로(벤토 틀 bentoG · bentoL 은 4단계 틀과 함께) */
var SKINS = { navy: { g: '#1F4E8C', gdk: '#143A6B', g65: '#5E82B0', g40: '#A5BAD4', g18: '#CFDBEC', card: '#EDF2F8', gon: '#A9C6EA', gmid: '#1C4A82', gray: '#AEB9C6', line: '#C3D0E2', well: '#DCE5F1', grid: '#D3DDEB', light: '#C9D5E6', axis: '#7C8AA0' },
  plain: { g: '#3E4743', gdk: '#1D2521', g65: '#6B7570', g40: '#9AA3A0', g18: '#DDE3E0', card: '#F3F5F4', gon: '#C9D1CD', gmid: '#3E4743' } };

/* 그림 칸과 옆 목록 칸 나누기 — list · listw(330) · listside:'left' */
function splitList(z, b) { if (!b.list) return [z, null]; var lw = b.listw || 330;
  return b.listside === 'left' ? [[z[0] + lw + 16, z[1], z[2] - lw - 16, z[3]], [z[0], z[1], lw, z[3]]] : [[z[0], z[1], z[2] - lw - 16, z[3]], [z[0] + z[2] - lw, z[1], lw, z[3]]] }

/* 그림 재료(6판 견본 수준) — iso 블록 items 의 k 로 부름. tone 은 3면 색표 이름(w 흰 · g 초록 · m 옅은 초록 · d 짙은 초록 · y 노랑 · r 빨강 · k 검정 · s 회녹)
   prism(pts, h) · box · cyl(rings) · derrick(시추탑) · ship(유조선) · building(창 있는 건물) · sphere(구형 탱크) · station(주유소) · water(바다 띠) · route(관 · 항로) · label(이름 칸) */
var PAL5 = { w: ['#FFFFFF', '#DCE7E2', '#B9CCC4'], g: ['#57B090', '#00744F', '#005136'], m: ['#CFE7DD', '#99C7B9', '#6FAF99'], d: ['#2A7A60', '#005136', '#003D2B'],
  y: ['#FFE99A', '#F2C46B', '#D9A441'], r: ['#C96A72', '#8A2F3C', '#6B2230'], k: ['#55625C', '#343E3A', '#1D2521'], s: ['#F3F9F6', '#D3E3DB', '#B4CCC1'] };
function lerpC(c1, c2, t) { var a = [1, 3, 5].map(function (i) { return parseInt(c1.slice(i, i + 2), 16) }), b = [1, 3, 5].map(function (i) { return parseInt(c2.slice(i, i + 2), 16) });
  return '#' + a.map(function (v, i) { var x = Math.round(v + (b[i] - v) * t); return (x < 16 ? '0' : '') + x.toString(16) }).join('') }
function isoKit(g, P, u) {
  function poly(pts, fill, op, stroke) { E('polygon', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: fill, stroke: stroke || fill, 'stroke-width': 1, 'stroke-linejoin': 'round', opacity: op || null }, g) }
  function line(pts, c, w, o) { o = o || {}; E('polyline', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': o.cap || 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': o.dash || null, opacity: o.op || null }, g) }
  function prism(pts, h, pal, z, shadow) { z = z || 0; var c3 = PAL5[pal] || pal, n = pts.length, ca = 0, cb = 0; pts.forEach(function (p) { ca += p[0] / n; cb += p[1] / n });
    if (shadow !== false && !z) poly(pts.map(function (p) { return P(p[0] + .42, p[1] + .12) }), C.dark, .13);
    var faces = []; for (var i = 0; i < n; i++) { var p1 = pts[i], p2 = pts[(i + 1) % n], na = p2[1] - p1[1], nb = -(p2[0] - p1[0]); if (na * ((p1[0] + p2[0]) / 2 - ca) + nb * ((p1[1] + p2[1]) / 2 - cb) < 0) { na = -na; nb = -nb }
      if (na + nb > 1e-6) faces.push([p1[0] + p2[0] + p1[1] + p2[1], p1, p2, Math.max(0, na) / (Math.abs(na) + Math.abs(nb))]) }
    faces.sort(function (a, b) { return a[0] - b[0] }).forEach(function (f) { poly([P(f[1][0], f[1][1], z), P(f[2][0], f[2][1], z), P(f[2][0], f[2][1], z + h), P(f[1][0], f[1][1], z + h)], lerpC(c3[1], c3[2], f[3])) });
    poly(pts.map(function (p) { return P(p[0], p[1], z + h) }), c3[0]) }
  function box(a, b, w, d, h, pal, z, shadow) { prism([[a, b], [a + w, b], [a + w, b + d], [a, b + d]], h, pal, z, shadow) }
  function cyl(a, b, r, h, pal, z, rings, shadow) { z = z || 0; var c3 = PAL5[pal] || pal, T0 = P(a, b, z + h), B = P(a, b, z), ra = r * u * 1.2247, rb = r * u * .7071;
    if (shadow !== false && !z) E('ellipse', { cx: B[0] + 14, cy: B[1] + 5, rx: ra, ry: rb, fill: C.dark, opacity: .13 }, g);
    E('path', { d: 'M' + (T0[0] - ra) + ',' + T0[1] + ' L' + (B[0] - ra) + ',' + B[1] + ' A' + ra + ',' + rb + ' 0 0 0 ' + (B[0] + ra) + ',' + B[1] + ' L' + (T0[0] + ra) + ',' + T0[1] + ' Z', fill: c3[1] }, g);
    E('path', { d: 'M' + (T0[0] + ra * .15) + ',' + (T0[1] + rb) + ' L' + (B[0] + ra * .15) + ',' + (B[1] + rb) + ' A' + ra + ',' + rb + ' 0 0 0 ' + (B[0] + ra) + ',' + B[1] + ' L' + (T0[0] + ra) + ',' + T0[1] + ' Z', fill: c3[2] }, g);
    for (var i = 0; i < (rings || 0); i++) { var yy = T0[1] + (B[1] - T0[1]) * (i + 1) / (rings + 1); E('path', { d: 'M' + (T0[0] - ra) + ',' + yy + ' A' + ra + ',' + rb + ' 0 0 0 ' + (T0[0] + ra) + ',' + yy, fill: 'none', stroke: c3[0], 'stroke-width': 3, opacity: .65 }, g) }
    E('ellipse', { cx: T0[0], cy: T0[1], rx: ra, ry: rb, fill: c3[0], stroke: c3[1], 'stroke-width': 1.5 }, g) }
  function winL(a1, a2, bf, z1, z2, c) { poly([P(a1, bf, z1), P(a2, bf, z1), P(a2, bf, z2), P(a1, bf, z2)], c) }
  function winR(af, b1, b2, z1, z2, c) { poly([P(af, b1, z1), P(af, b2, z1), P(af, b2, z2), P(af, b1, z2)], c) }
  return {
    poly: poly, line: line, prism: prism, box: box, cyl: cyl, winL: winL, winR: winR,
    derrick: function (it) { var da = it.x || 0, db = it.y || 0, s = it.s || .78, h0 = .18, hh = it.h || 4, ts = .15;
      box(da - s - .2, db - s - .2, 2 * s + .4, 2 * s + .4, h0, 'd');
      var base = [[da - s, db - s], [da + s, db - s], [da + s, db + s], [da - s, db + s]], top = [[da - ts, db - ts], [da + ts, db - ts], [da + ts, db + ts], [da - ts, db + ts]];
      function at(i, t) { return P(base[i][0] + (top[i][0] - base[i][0]) * t, base[i][1] + (top[i][1] - base[i][1]) * t, h0 + hh * t) }
      var lv = [0, .3, .58, .82, 1]; line([at(0, 0), at(0, 1)], C.g65, 3); lv.slice(1, 4).forEach(function (t) { line([at(3, t), at(0, t), at(1, t)], C.g65, 3) });
      [1, 3, 2].forEach(function (i) { line([at(i, 0), at(i, 1)], C.dark, 5) });
      for (var q = 0; q < lv.length - 1; q++) [[1, 2], [2, 3]].forEach(function (ij) { line([at(ij[0], lv[q]), at(ij[1], lv[q + 1])], C.dark, 3); line([at(ij[1], lv[q]), at(ij[0], lv[q + 1])], C.dark, 3); line([at(ij[0], lv[q + 1]), at(ij[1], lv[q + 1])], C.dark, 3) });
      box(da - .3, db - .3, .6, .6, .42, 'y', h0 + hh, false); return P(da, db, h0 + hh + .42) },
    ship: function (it) { var x = it.x || 0, y = it.y || 0, L = it.len || 4.55, w = it.w || 1.24, k = L / 4.55, hull = [[x, y], [x + w, y], [x + w, y - 3.6 * k], [x + w / 2, y - L], [x, y - 3.6 * k]];
      poly(hull.map(function (p) { return P(p[0] + .5, p[1] + .15) }), '#1E6F6A', .35); prism(hull, .16, 'r', 0, false); prism(hull, .44, 'd', .16, false);
      [-3.45, -2.4, -1.35].forEach(function (b0) { box(x + .22, y + b0 * k, .8, .85 * k, .2, 'm', .6, false) });
      box(x + .12, y - .9, 1.0, .72, 1.05, 'w', .6, false); winL(x + .2, x + 1.04, y - .18, 1.22, 1.46, C.ink); winR(x + 1.12, y - .82, y - .26, 1.22, 1.46, C.ink);
      box(x + .46, y - .7, .32, .32, .42, 'y', 1.65, false); return P(x + w / 2, y - L / 2, .84) },
    building: function (it) { var a = it.x || 0, b = it.y || 0, w = it.w || 1.9, d = it.d || 1.4, h = it.h || 1.15, nl = it.wl == null ? 3 : it.wl, nr = it.wr == null ? 2 : it.wr, fl = it.floors || 1;
      box(a, b, w, d, h, it.tone || 'w'); for (var f = 0; f < fl; f++) { var z1 = h * (f + .36) / fl, z2 = h * (f + .75) / fl;
        for (var i = 0; i < nl; i++) { var a1 = a + .18 + i * (w - .36) / nl; winL(a1, a1 + (w - .36) / nl * .7, b + d, z1, z2, C.g40) }
        for (var j = 0; j < nr; j++) { var b1 = b + .16 + j * (d - .32) / nr; winR(a + w, b1, b1 + (d - .32) / nr * .7, z1, z2, C.g65) } } return P(a + w / 2, b + d / 2, h) },
    sphere: function (it) { var a = it.x || 0, b = it.y || 0, r = it.r || .62, zc = it.z || .95, S = P(a, b, zc), Gd = P(a, b), sr = r * u * 1.2247;
      E('ellipse', { cx: Gd[0] + 14, cy: Gd[1] + 5, rx: sr, ry: sr * .55, fill: C.dark, opacity: .13 }, g);
      [-.55, 0, .55].forEach(function (dx) { line([[S[0] + dx * sr, S[1] + sr * .6], [Gd[0] + dx * sr * 1.05, Gd[1] + (dx ? 4 : 12)]], C.g65, 3) });
      E('circle', { cx: S[0], cy: S[1], r: sr, fill: '#DCE7E2' }, g); E('path', { d: 'M' + (S[0] - sr) + ',' + S[1] + ' A' + sr + ',' + sr + ' 0 0 1 ' + (S[0] + sr) + ',' + S[1] + ' A' + sr + ',' + sr * .72 + ' 0 0 0 ' + (S[0] - sr) + ',' + S[1] + ' Z', fill: '#FFFFFF' }, g);
      E('path', { d: 'M' + (S[0] - sr) + ',' + S[1] + ' A' + sr + ',' + sr * .3 + ' 0 0 0 ' + (S[0] + sr) + ',' + S[1], fill: 'none', stroke: C.g40, 'stroke-width': 3 }, g); return [S[0], S[1] - sr] },
    station: function (it) { var a = it.x || 0, b = it.y || 0;
      box(a + .2, b, 1.6, 1.3, 1.2, 'w'); winL(a + .34, a + 1.1, b + 1.3, .4, .92, C.g40); winL(a + 1.28, a + 1.62, b + 1.3, 0, .88, C.g65);
      poly([P(a + .42, b + 1.67), P(a + 3.02, b + 1.67), P(a + 3.02, b + 3.42), P(a + .42, b + 3.42)], C.dark, .13);
      [[a + .1, b + 1.65], [a + 2.36, b + 1.65]].forEach(function (p) { box(p[0], p[1], .14, .14, 1.75, 'm', 0, false) });
      [a + .75, a + 1.7].forEach(function (x) { box(x, b + 2.28, .34, .34, .82, 'y', 0, false); winL(x + .06, x + .28, b + 2.62, .46, .7, C.ink) });
      [[a + .1, b + 3.06], [a + 2.36, b + 3.06]].forEach(function (p) { box(p[0], p[1], .14, .14, 1.75, 'm', 0, false) });
      box(a, b + 1.55, 2.6, 1.75, .26, 'g', 1.75, false); winL(a, a + 2.6, b + 3.3, 1.84, 1.92, '#FFFFFF'); winR(a + 2.6, b + 1.55, b + 3.3, 1.84, 1.92, '#FFFFFF'); return P(a + 1.3, b + 2.4, 2.01) },
    water: function (it) { var a = it.x || 0, b = it.y || -60, w = it.w || 3.4, d = it.d || 120;
      poly([P(a, b), P(a + w, b), P(a + w, b + d), P(a, b + d)], '#5FBDB4'); poly([P(a, b), P(a + .4, b), P(a + .4, b + d), P(a, b + d)], '#86D0C8'); poly([P(a + w - .4, b), P(a + w, b), P(a + w, b + d), P(a + w - .4, b + d)], '#86D0C8');
      line([P(a, b), P(a, b + d)], '#FFFFFF', 3, { cap: 'butt' }); line([P(a + w, b), P(a + w, b + d)], '#FFFFFF', 3, { cap: 'butt' }) },
    route: function (it) { var pts = (it.pts || []).map(function (p) { return P(p[0], p[1], p[2] || 0) }), sea = it.style === 'sea', c = sea ? '#FFFFFF' : col(it.tone || 'gdk'), w = sea ? 5 : (it.sw || 8);
      line(pts, c, w, { dash: sea ? '3 13' : (it.dash ? '9 7' : null), cap: sea ? 'round' : 'butt' }); if (it.arrow !== false && pts.length > 1) arrowHead(g, pts[pts.length - 2], pts[pts.length - 1], c, sea ? 13 : 16) } } }

/* 장면 재료 2차 — 공장 · 냉각탑 · 항만 크레인 · 컨테이너 · 철길 · 화물 열차 · 창고 · 화물차 · 풍력 발전기 */
function isoMore(K0, g, P, u) { var box = K0.box, cyl = K0.cyl, poly = K0.poly, line = K0.line, winL = K0.winL, winR = K0.winR;
  return {
    factory: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 3, d = it.d || 2, h = it.h || 1.1, n = it.teeth || 3, rh = it.rh || .55, tw = w / n, c3 = PAL5[it.tone || 'w'];
      box(x, y, w, d, h, it.tone || 'w');
      for (var f = 0; f < 3; f++) { var a1 = x + .25 + f * (w - .5) / 3; winL(a1, a1 + (w - .5) / 3 * .62, y + d, h * .3, h * .72, C.g40) }
      for (var i = 0; i < n; i++) { var a0 = x + i * tw, a2 = a0 + tw;
        poly([P(a0, y, h), P(a2, y, h + rh), P(a2, y + d, h + rh), P(a0, y + d, h)], c3[0], null, c3[1]);
        poly([P(a2, y, h), P(a2, y + d, h), P(a2, y + d, h + rh), P(a2, y, h + rh)], C.g65);
        poly([P(a0, y + d, h), P(a2, y + d, h), P(a2, y + d, h + rh)], c3[1]) }
      if (it.chimney !== false) cyl(x + .35, y + .35, .2, h + (it.ch || 1.9), 's', 0, 2, false);
      return P(x + w / 2, y + d / 2, h + rh) },
    cooling: function (it) { var x = it.x || 0, y = it.y || 0, r = it.r || .9, hh = it.h || 2.4, B = P(x, y), Tp = P(x, y, hh), W = P(x, y, hh * .72), rb = r * u * 1.2247, rt = rb * .68, rw = rb * .6, k = .5774;
      E('ellipse', { cx: B[0] + 16, cy: B[1] + 6, rx: rb, ry: rb * k, fill: C.dark, opacity: .13 }, g);
      E('path', { d: 'M' + (B[0] - rb) + ',' + B[1] + ' Q' + (W[0] - rw * .92) + ',' + W[1] + ' ' + (Tp[0] - rt) + ',' + Tp[1] + ' L' + (Tp[0] + rt) + ',' + Tp[1] + ' Q' + (W[0] + rw * .92) + ',' + W[1] + ' ' + (B[0] + rb) + ',' + B[1] + ' A' + rb + ',' + (rb * k) + ' 0 0 1 ' + (B[0] - rb) + ',' + B[1] + ' Z', fill: '#DCE7E2' }, g);
      E('path', { d: 'M' + (Tp[0] + rt * .1) + ',' + Tp[1] + ' L' + (Tp[0] + rt) + ',' + Tp[1] + ' Q' + (W[0] + rw * .92) + ',' + W[1] + ' ' + (B[0] + rb) + ',' + B[1] + ' A' + rb + ',' + (rb * k) + ' 0 0 1 ' + (B[0] + rb * .1) + ',' + (B[1] + rb * k) + ' Q' + (W[0] + rw * .1) + ',' + W[1] + ' ' + (Tp[0] + rt * .1) + ',' + Tp[1] + ' Z', fill: '#B9CCC4' }, g);
      E('ellipse', { cx: Tp[0], cy: Tp[1], rx: rt, ry: rt * k, fill: '#55625C', stroke: '#DCE7E2', 'stroke-width': 3 }, g);
      if (it.steam !== false) [[0, -.55, .62], [.35, -1.05, .5], [-.25, -1.4, .42]].forEach(function (q) { E('circle', { cx: Tp[0] + q[0] * rt * 2, cy: Tp[1] + q[1] * rt * 1.6, r: rt * q[2] * 1.4, fill: '#FFFFFF', stroke: '#DCE7E2', 'stroke-width': 1.5, opacity: .95 }, g) });
      return [Tp[0], Tp[1] - rt * 2.6] },
    crane: function (it) { var x = it.x || 0, y = it.y || 0, h = it.h || 3.2, bm = it.boom || 3, s = 1.2, l = .12;
      [[x, y], [x + s, y], [x, y + s], [x + s, y + s]].forEach(function (q) { box(q[0], q[1], l, l, h, 'y', 0, false) });
      line([P(x, y + s, h * .45), P(x + s, y + s, h * .45)], '#D9A441', 5); line([P(x + s, y, h * .45), P(x + s, y + s, h * .45)], '#D9A441', 5);
      box(x - .1, y - .1, s + .32, s + .32, .28, 'y', h, false); box(x - bm, y + s / 2 - .12, bm + s + .9, .24, .22, 'y', h + .28, false);
      box(x + s - .1, y + .2, .55, .6, .45, 'w', h + .28, false); var e = P(x - bm + .2, y + s / 2, h + .28); line([e, P(x - bm + .2, y + s / 2, h * .38)], C.ink, 1.5);
      return P(x + s / 2, y + s / 2, h + .5) },
    containers: function (it) { var x = it.x || 0, y = it.y || 0, nc = it.cols || 3, nr = it.rows || 2, nl = it.levels || 2, cs = it.colors || ['g', 'r', 'y', 'm', 'd'], k = 0, L = it.len || 1.2, W = .5, H = .45;
      for (var r = 0; r < nr; r++) for (var c = 0; c < nc; c++) for (var l = 0; l < nl; l++) { var a = x + c * (L + .06), b = y + r * (W + .06); box(a, b, L, W, H, cs[(k++) % cs.length], l * H, l === 0 && r === 0 && c === 0) }
      return P(x + nc * L / 2, y + nr * W / 2, nl * H) },
    rail: function (it) { var x = it.x || 0, y = it.y || 0, L = it.len || 8, along = it.dir !== 'b';
      for (var s = 0; s <= L; s += .4) along ? line([P(x + s, y - .1), P(x + s, y + .7)], '#9AA3A0', 3) : line([P(x - .1, y + s), P(x + .7, y + s)], '#9AA3A0', 3);
      [0, .6].forEach(function (o) { along ? line([P(x, y + o), P(x + L, y + o)], '#55625C', 3) : line([P(x + o, y), P(x + o, y + L)], '#55625C', 3) }); return P(x + (along ? L / 2 : .3), y + (along ? .3 : L / 2)) },
    train: function (it) { var x = it.x || 0, y = it.y || 0, n = it.n || 3, wl = 1.5;
      for (var i = n - 1; i >= 0; i--) { var a = x + i * (wl + .12), lead = i === n - 1; box(a, y - .02, wl, .64, lead ? .78 : .7, lead ? 'd' : (it.tone || 'g'), .12, i === 0);
        for (var q = 0; q < 3; q++) winL(a + .15 + q * .45, a + .45 + q * .45, y + .62, .42, .66, lead ? '#8FD9B6' : '#FFFFFF') }
      return P(x + n * (wl + .12) / 2, y + .3, .9) },
    warehouse: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 2.6, d = it.d || 1.6, h = it.h || .9, rh = it.rh || .5, c3 = PAL5[it.tone || 'w'];
      box(x, y, w, d, h, it.tone || 'w'); winL(x + w * .35, x + w * .65, y + d, 0, h * .7, C.g65);
      poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], c3[0], null, c3[1]);
      poly([P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], '#99C7B9', null, '#6FAF99');
      poly([P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh)], c3[2]); return P(x + w / 2, y + d / 2, h + rh) },
    truck: function (it) { var x = it.x || 0, y = it.y || 0;
      box(x, y, 1.8, .62, .62, it.tone || 's', .16); box(x + 1.86, y, .56, .62, .52, 'g', .16, false); winL(x + 2.02, x + 2.36, y + .62, .42, .6, '#8FD9B6');
      [x + .35, x + 1.4, x + 2.15].forEach(function (a) { var q = P(a, y + .62, .14); E('ellipse', { cx: q[0], cy: q[1], rx: 4.5, ry: 3.5, fill: '#343E3A' }, g) }); return P(x + 1.2, y + .3, .8) },
    turbine: function (it) { var x = it.x || 0, y = it.y || 0, h = it.h || 3.4, B = P(x, y), H = P(x, y, h), L = (it.blade || 1.4) * u;
      E('ellipse', { cx: B[0] + 6, cy: B[1] + 3, rx: 8, ry: 4, fill: C.dark, opacity: .13 }, g); line([B, H], '#DCE7E2', 7, { cap: 'butt' }); line([B, H], '#B9CCC4', 2.5, { cap: 'butt' });
      box(x - .12, y - .12, .42, .24, .22, 'w', h - .1, false);
      [-90, 30, 150].forEach(function (deg) { var r = deg * Math.PI / 180; line([H, [H[0] + Math.cos(r) * L, H[1] + Math.sin(r) * L]], '#FFFFFF', 7); line([H, [H[0] + Math.cos(r) * L, H[1] + Math.sin(r) * L]], '#B9CCC4', 1.5) });
      E('circle', { cx: H[0], cy: H[1], r: 5, fill: '#55625C' }, g); return [H[0], H[1] - L] } } }

/* 장면 재료 3차 — 농업(field · greenhouse · silo · tractor) · 의료(hospital · ambulance) · 도시(tower · house · tree · road · car) */
function isoMore2(K0, g, P, u) { var box = K0.box, cyl = K0.cyl, poly = K0.poly, line = K0.line, winL = K0.winL, winR = K0.winR;
  function gable(x, y, w, d, h, rh, tone, roof) { var c3 = PAL5[tone || 'w'], r3 = PAL5[roof || 'm']; box(x, y, w, d, h, tone || 'w');
    poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], r3[0], null, r3[1]);
    poly([P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], r3[1], null, r3[2]); poly([P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh)], c3[2]) }
  return {
    field: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 4, d = it.d || 3, n = it.rows || 7, c = it.crop || '#57B090';
      poly([P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)], it.soil || '#E9DFC8', null, '#D9CBA8');
      for (var i = 0; i < n; i++) { var b = y + (i + .5) * d / n; line([P(x + .15, b), P(x + w - .15, b)], c, Math.max(4, u * d / n * .42)) } return P(x + w / 2, y + d / 2) },
    greenhouse: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 2.6, d = it.d || 1.2, h = it.h || .55, rh = it.rh || .45;
      poly([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)], '#EAF6F1', null, '#99C7B9'); poly([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)], '#D3EDE3', null, '#99C7B9');
      poly([P(x, y, h), P(x + w, y, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], '#F3FBF8', null, '#99C7B9'); poly([P(x, y + d, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh), P(x, y + d / 2, h + rh)], '#E1F3EC', null, '#99C7B9');
      poly([P(x + w, y, h), P(x + w, y + d, h), P(x + w, y + d / 2, h + rh)], '#D3EDE3', null, '#99C7B9');
      for (var i = 1; i < 6; i++) { var a = x + w * i / 6; line([P(a, y + d, 0), P(a, y + d, h), P(a, y + d / 2, h + rh)], '#99C7B9', 1.5) } return P(x + w / 2, y + d / 2, h + rh) },
    silo: function (it) { var x = it.x || 0, y = it.y || 0, r = it.r || .45, h = it.h || 2.2, T0 = P(x, y, h), ra = r * u * 1.2247;
      cyl(x, y, r, h, it.tone || 's', 0, 3); E('path', { d: 'M' + (T0[0] - ra) + ',' + T0[1] + ' A' + ra + ',' + ra * .8 + ' 0 0 1 ' + (T0[0] + ra) + ',' + T0[1] + ' Z', fill: '#DCE7E2', stroke: '#B9CCC4', 'stroke-width': 1.5 }, g); return [T0[0], T0[1] - ra * .8] },
    tractor: function (it) { var x = it.x || 0, y = it.y || 0; box(x, y, 1.0, .6, .38, 'r', .22); box(x + .1, y + .05, .45, .5, .45, 'r', .6, false); winL(x + .16, x + .5, y + .55, .7, .98, '#DCE7E2');
      [[x + .2, .32], [x + .85, .22]].forEach(function (q) { var c = P(q[0], y + .6, q[1]); E('circle', { cx: c[0], cy: c[1], r: q[1] * u * .9, fill: '#343E3A', stroke: '#55625C', 'stroke-width': 3 }, g) }); return P(x + .5, y + .3, 1.05) },
    hospital: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 2.4, d = it.d || 1.6, h = it.h || 2.2, fl = it.floors || 4;
      box(x, y, w, d, h, 'w'); for (var f = 0; f < fl; f++) { var z1 = h * (f + .3) / fl, z2 = h * (f + .72) / fl; for (var i = 0; i < 4; i++) { var a1 = x + .18 + i * (w - .36) / 4; winL(a1, a1 + (w - .36) / 4 * .62, y + d, z1, z2, '#C9D9FA') } for (var j = 0; j < 2; j++) { var b1 = y + .16 + j * (d - .32) / 2; winR(x + w, b1, b1 + (d - .32) / 2 * .62, z1, z2, '#A5BAD4') } }
      var cc = P(x + w / 2, y + d / 2, h), s = u * .26; E('rect', { x: cc[0] - s * 1.6, y: cc[1] - s * 1.6 - 26, width: s * 3.2, height: s * 3.2, rx: 4, fill: '#FFFFFF', stroke: '#DCE7E2' }, g);
      E('rect', { x: cc[0] - s * .4, y: cc[1] - s * 1.2 - 26, width: s * .8, height: s * 2.4, fill: '#D9534F' }, g); E('rect', { x: cc[0] - s * 1.2, y: cc[1] - s * .4 - 26, width: s * 2.4, height: s * .8, fill: '#D9534F' }, g); return [cc[0], cc[1] - s * 1.6 - 26] },
    ambulance: function (it) { var x = it.x || 0, y = it.y || 0; box(x, y, 1.5, .62, .66, 'w', .16); box(x + 1.55, y, .5, .62, .5, 'w', .16, false);
      poly([P(x, y + .62, .42), P(x + 1.5, y + .62, .42), P(x + 1.5, y + .62, .52), P(x, y + .62, .52)], '#D9534F'); winL(x + 1.68, x + 1.98, y + .62, .42, .6, '#A5BAD4');
      [x + .3, x + 1.2, x + 1.8].forEach(function (a) { var q = P(a, y + .62, .14); E('ellipse', { cx: q[0], cy: q[1], rx: 4.5, ry: 3.5, fill: '#343E3A' }, g) }); return P(x + .75, y + .3, .82) },
    tower: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 1.2, d = it.d || 1.2, fl = it.floors || 10, h = it.h || fl * .32; box(x, y, w, d, h, it.tone || 'w');
      for (var f = 0; f < fl; f++) { var z1 = h * (f + .25) / fl, z2 = h * (f + .7) / fl; for (var i = 0; i < 3; i++) { var a1 = x + .12 + i * (w - .24) / 3; winL(a1, a1 + (w - .24) / 3 * .6, y + d, z1, z2, C.g40) } for (var j = 0; j < 3; j++) { var b1 = y + .12 + j * (d - .24) / 3; winR(x + w, b1, b1 + (d - .24) / 3 * .6, z1, z2, C.g65) } }
      return P(x + w / 2, y + d / 2, h) },
    house: function (it) { var x = it.x || 0, y = it.y || 0, w = it.w || 1.2, d = it.d || 1.0, h = it.h || .6; gable(x, y, w, d, h, it.rh || .45, it.tone || 'w', it.roof || 'r'); winL(x + .2, x + .5, y + d, .25, .48, C.g65); winR(x + w, y + .3, y + .7, .25, .5, C.g40); return P(x + w / 2, y + d / 2, h + (it.rh || .45)) },
    tree: function (it) { var x = it.x || 0, y = it.y || 0, s = it.s || 1, B = P(x, y), r = .36 * u * s, top = P(x, y, .9 * s);
      E('ellipse', { cx: B[0] + 6, cy: B[1] + 3, rx: r * .9, ry: r * .45, fill: C.dark, opacity: .13 }, g); line([B, P(x, y, .45 * s)], '#8A6A4A', 4, { cap: 'butt' });
      E('circle', { cx: top[0], cy: top[1], r: r, fill: '#57B090' }, g); E('circle', { cx: top[0] - r * .3, cy: top[1] - r * .3, r: r * .45, fill: '#7FC4A8' }, g); return [top[0], top[1] - r] },
    road: function (it) { var x = it.x || 0, y = it.y || 0, L = it.len || 10, along = it.dir !== 'b', W = it.w || 1;
      if (along) { poly([P(x, y), P(x + L, y), P(x + L, y + W), P(x, y + W)], '#DDE3E0'); line([P(x, y + W / 2), P(x + L, y + W / 2)], '#FFFFFF', 3, { dash: '10 10', cap: 'butt' }) }
      else { poly([P(x, y), P(x + W, y), P(x + W, y + L), P(x, y + L)], '#DDE3E0'); line([P(x + W / 2, y), P(x + W / 2, y + L)], '#FFFFFF', 3, { dash: '10 10', cap: 'butt' }) } return P(x + (along ? L / 2 : W / 2), y + (along ? W / 2 : L / 2)) },
    car: function (it) { var x = it.x || 0, y = it.y || 0; box(x, y, .9, .45, .28, it.tone || 'g', .1); box(x + .18, y + .04, .5, .38, .22, it.tone || 'g', .38, false); winL(x + .22, x + .64, y + .42, .42, .56, '#DCE7E2'); return P(x + .45, y + .22, .6) } } }

/* iso : 등각 모형 — items[{k:'box|cyl|plate|flow|guide', x, y, z, w, d, h, r, tone, tag, fig, pin, ptone, foot, side, lines[], grid, t, pts[], dash, tone_, ord, op}] · u(한 칸 크기 28) · ox · oy(원점 비율) · panel · texts[] · list
   무광 3면 색 : 윗면 밝게, 왼면 중간, 오른면 짙게 */
var ISO = { strong: ['g65', 'g', 'gdk'], soft: ['g08', 'g18', 'g40'], mid: ['g18', 'g40', 'g65'], plain: ['white', 'line', 'gray'], warn: ['warn08', 'warn40', 'warn'], ground: ['well', 'light', 'gray'], ghost: ['white', 'well', 'light'] };
function bleedSvg(fade) { var f = CTX.full(), v = E('svg', { viewBox: '0 0 1280 720', width: 1280, height: 720, style: 'position:absolute;left:0;top:0;overflow:hidden' }); f.appendChild(v); f.style.cssText += ';position:absolute;inset:0';
  var g = E('g', { transform: 'translate(56,144)' }, v); return g }
function bleedFade(g, top, bot) { var id = 'bfd' + (++plid), d = E('defs', {}, g);
  [['t', 1, 0], ['b', 0, 1]].forEach(function (q) { var lg = E('linearGradient', { id: id + q[0], x1: 0, y1: 0, x2: 0, y2: 1 }, d); E('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': q[1] }, lg); E('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': q[2] }, lg) });
  E('rect', { x: -56, y: -144, width: 1280, height: top[0] + 144, fill: '#FFFFFF' }, g); E('rect', { x: -56, y: top[0], width: 1280, height: top[1] - top[0], fill: 'url(#' + id + 't)' }, g);
  E('rect', { x: -56, y: bot[0], width: 1280, height: bot[1] - bot[0], fill: 'url(#' + id + 'b)' }, g); E('rect', { x: -56, y: bot[1], width: 1280, height: 720, fill: '#FFFFFF' }, g) }
function iso(svg, z, b, t0) { var bleed = !!(b.bleed && CTX); if (bleed) svg = bleedSvg(); var sp = splitList(z, b), x = sp[0][0], y = sp[0][1], pw = sp[0][2], ph = sp[0][3], u = b.u || 28, ox = b.oxp != null ? x + b.oxp : x + pw * (b.ox == null ? .5 : b.ox), oy = b.oyp != null ? y + b.oyp : y + ph * (b.oy == null ? .42 : b.oy);
  function P(a, c, e) { return [ox + (a - c) * u * .866, oy + (a + c) * u * .5 - (e || 0) * u] }
  function poly(g, pts, fill, stroke, op) { E('polygon', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: col(fill), stroke: col(stroke || fill), 'stroke-width': 1.5, 'stroke-linejoin': 'round', opacity: op || null }, g) }
  function seg(g, p0, p1, c, dash) { E('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: col(c), 'stroke-width': 1.5, 'stroke-dasharray': dash || null }, g) }
  var g0 = grp(svg, t0, null, 'fade'); if (b.panel !== false) K(g0).rect(x, y, pw, ph, 'card');
  var cpi = 'bic' + (++plid), cpe = E('clipPath', { id: cpi }, E('defs', {}, g0)); E('rect', bleed ? { x: -56, y: -144, width: 1280, height: 720 } : { x: x, y: y, width: pw, height: ph }, cpe);
  if (b.gridlines) { var gl0 = E('g', { 'clip-path': 'url(#' + cpi + ')' }, g0); for (var gi = -60; gi <= 60; gi += (b.gridstep || 2)) { var A1 = P(gi, -60), A2 = P(gi, 60), B1 = P(-60, gi), B2 = P(60, gi); E('line', { x1: A1[0], y1: A1[1], x2: A2[0], y2: A2[1], stroke: '#E3ECE7', 'stroke-width': 1.5 }, gl0); E('line', { x1: B1[0], y1: B1[1], x2: B2[0], y2: B2[1], stroke: '#E3ECE7', 'stroke-width': 1.5 }, gl0) } }
  function key(it) { if (it.k === 'water') return -950 + (it.ord || 0); if (it.k === 'plate') return -999 + (it.ord || 0); if (it.k === 'route') return -450 + (it.ord || 0); if (it.k === 'rail') return -470 + (it.ord || 0); if (it.k === 'road') return -480 + (it.ord || 0); if (it.k === 'field') return -490 + (it.ord || 0); if (it.k === 'flow') return -500 + (it.ord || 0); return it.ord != null ? it.ord : (it.x || 0) + (it.y || 0) + ((it.w || it.r || 1) + (it.d || it.r || 1)) / 2 }
  var items = (b.items || []).slice().sort(function (p, q) { return key(p) - key(q) || (p.z || 0) - (q.z || 0) }), lab = [], gI = grp(svg, t0 + 200, null, 'fade');
  var gM = E('g', { 'clip-path': 'url(#' + cpi + ')' }, gI), KT = isoKit(gM, P, u), KM = isoMore(KT, gM, P, u), KM2 = isoMore2(KT, gM, P, u); Object.keys(KM).forEach(function (q) { KT[q] = KM[q] }); Object.keys(KM2).forEach(function (q) { KT[q] = KM2[q] });
  items.forEach(function (it) { var mk = it.k || 'box', an = null;
    if (mk === 'text') { var qt = P(it.x || 0, it.y || 0, it.z || 0); lab.push(['txt', qt[0] + (it.dx || 0), qt[1] + (it.dy || 0), it.t, it.fs || 18, 700, it.fill || 'gdk', 'middle']); return }
    if (mk === 'prism') an = (KT.prism(it.pts, it.h || 1, it.tone || 'w', it.z || 0, it.shadow), P(it.pts[0][0], it.pts[0][1], (it.z || 0) + (it.h || 1)));
    else if (mk === 'box' && PAL5[it.tone]) { KT.box(it.x || 0, it.y || 0, it.w || 1, it.d || 1, it.h || 1, it.tone, it.z || 0, it.shadow); an = P((it.x || 0) + (it.w || 1) / 2, (it.y || 0) + (it.d || 1) / 2, (it.z || 0) + (it.h || 1)) }
    else if (mk === 'cyl' && PAL5[it.tone]) { KT.cyl(it.x || 0, it.y || 0, it.r || .5, it.h || 1, it.tone, it.z || 0, it.rings, it.shadow); an = P(it.x || 0, it.y || 0, (it.z || 0) + (it.h || 1)) }
    else if (KT[mk] && /^(derrick|ship|building|sphere|station|water|route|factory|cooling|crane|containers|rail|train|warehouse|truck|turbine|field|greenhouse|silo|tractor|hospital|ambulance|tower|house|tree|road|car)$/.test(mk)) an = KT[mk](it);
    if (an || mk === 'water' || mk === 'route' || mk === 'prism' || (PAL5[it.tone] && (mk === 'box' || mk === 'cyl'))) { if (an && it.tag) lab.push(['tagbox', an[0] + (it.tdx || 0), an[1] + (it.tdy || 0), it.tag]); if (an && it.pin != null) lab.push(['pin', an[0], an[1] + 18, it.pin, it.ptone || 'gdk']); return }
    var k = mk, pal = ISO[it.tone || 'plain'] || ISO.plain, top = pal[0], left = pal[1], right = pal[2], a = it.x || 0, c = it.y || 0, e = it.z || 0, hi, cen, foot;
    if (k === 'plate') { var w = it.w, d = it.d; poly(gI, [P(a, c, e), P(a + w, c, e), P(a + w, c + d, e), P(a, c + d, e)], top, it.edge || left);
      if (it.grid) { for (var i = 1; i < w; i++) seg(gI, P(a + i, c, e), P(a + i, c + d, e), left); for (var j = 1; j < d; j++) seg(gI, P(a, c + j, e), P(a + w, c + j, e), left) }
      if (it.t) { var q = P(a + .4, c + d - .5, e); lab.push(['txt', q[0], q[1], it.t, 16, 700, 'mute', 'start']) } return }
    if (k === 'flow') { var pts = it.pts.map(function (p) { return P(p[0], p[1], p.length > 2 ? p[2] : e) }), tc = it.tone_ || 'gdk';
      E('polyline', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: 'none', stroke: col(tc), 'stroke-width': it.sw || 3, 'stroke-linejoin': 'round', 'stroke-dasharray': it.dash ? '7 5' : null }, gI);
      var zp = pts[pts.length - 1], yp = pts[pts.length - 2], dx = zp[0] - yp[0], dy = zp[1] - yp[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, s = 11;
      E('path', { d: 'M' + zp[0] + ',' + zp[1] + 'L' + (zp[0] - ux * s - uy * s * .55) + ',' + (zp[1] - uy * s + ux * s * .55) + 'L' + (zp[0] - ux * s + uy * s * .55) + ',' + (zp[1] - uy * s - ux * s * .55) + 'Z', fill: col(tc) }, gI);
      if (it.t) { var li = it.lp != null ? it.lp : Math.floor((pts.length - 1) / 2), m = [(pts[li][0] + pts[li + 1][0]) / 2, (pts[li][1] + pts[li + 1][1]) / 2]; lab.push(['txt', m[0] + (it.dx || 0), m[1] - 8 + (it.dy || 0), it.t, 16, 700, tc, 'middle']) } return }
    if (k === 'guide') { (it.at || []).forEach(function (q) { seg(gI, P(q[0], q[1], it.z0), P(q[0], q[1], it.z1), 'axis', '4 4') }); return }
    if (k === 'cyl') { var r = it.r, hh = it.h, Tp = P(a, c, e + hh), B = P(a, c, e), ra = r * u * 1.2247, rb = r * u * .7071;
      E('path', { d: 'M' + (Tp[0] - ra) + ',' + Tp[1] + ' L' + (B[0] - ra) + ',' + B[1] + ' A' + ra + ',' + rb + ' 0 0 0 ' + (B[0] + ra) + ',' + B[1] + ' L' + (Tp[0] + ra) + ',' + Tp[1] + ' Z', fill: col(left) }, gI);
      E('path', { d: 'M' + Tp[0] + ',' + (Tp[1] + rb) + ' L' + B[0] + ',' + (B[1] + rb) + ' A' + ra + ',' + rb + ' 0 0 0 ' + (B[0] + ra) + ',' + B[1] + ' L' + (Tp[0] + ra) + ',' + Tp[1] + ' A' + ra + ',' + rb + ' 0 0 1 ' + Tp[0] + ',' + (Tp[1] + rb) + ' Z', fill: col(right) }, gI);
      E('ellipse', { cx: Tp[0], cy: Tp[1], rx: ra, ry: rb, fill: col(top), stroke: col(left), 'stroke-width': 1.5 }, gI);
      hi = [Tp[0], Tp[1] - rb]; cen = Tp; foot = [B[0], B[1] + rb] }
    else { var w2 = it.w || 1, d2 = it.d || 1, h2 = it.h || 1, op = it.op;
      poly(gI, [P(a, c + d2, e), P(a + w2, c + d2, e), P(a + w2, c + d2, e + h2), P(a, c + d2, e + h2)], left, null, op);
      poly(gI, [P(a + w2, c, e), P(a + w2, c + d2, e), P(a + w2, c + d2, e + h2), P(a + w2, c, e + h2)], right, null, op);
      poly(gI, [P(a, c, e + h2), P(a + w2, c, e + h2), P(a + w2, c + d2, e + h2), P(a, c + d2, e + h2)], top, left, op);
      (it.lines || []).forEach(function (ln) { seg(gI, P(a + ln[0] * w2, c + ln[1] * d2, e + h2), P(a + ln[2] * w2, c + ln[3] * d2, e + h2), left) });
      cen = P(a + w2 / 2, c + d2 / 2, e + h2); hi = [cen[0], P(a, c, e + h2)[1]]; foot = P(a + w2, c + d2, e) }
    var yy = hi[1] - 9;
    if (it.tag) { lab.push(['txt', hi[0] + (it.tdx || 0), yy + (it.tdy || 0), it.tag, 16, 700, 'ink', 'middle']); yy -= 22 }
    if (it.fig) lab.push(['txt', hi[0] + (it.tdx || 0), yy + (it.tdy || 0), it.fig, 20, 800, 'gdk', 'middle']);
    if (it.pin != null) lab.push(['pin', cen[0], cen[1], it.pin, it.ptone || 'gdk']);
    if (it.foot) lab.push(['txt', foot[0] + (it.fdx || 0), foot[1] + 20 + (it.fdy || 0), it.foot, 16, 600, 'sub', 'middle']);
    if (it.side) { var qs = k === 'box' ? P(a + (it.w || 1), c + (it.d || 1) / 2, e + (it.h || 1) / 2) : cen; lab.push(['lead', qs[0], qs[1], it.side, it.sx || x + pw - 20]) } });
  if (b.bleed && CTX) bleedFade(svg, b.fadeTop || [-30, 50], b.fadeBot || [470, 520]);
  var gl = grp(svg, t0 + 600, null, 'fade');
  lab.forEach(function (l) { if (l[0] === 'txt') T(gl, l[1], l[2], l[3], { 'font-size': l[4], 'font-weight': l[5], fill: col(l[6]), 'text-anchor': l[7], stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
    else if (l[0] === 'pin') pin(gl, l[1], l[2], l[3], l[4]);
    else if (l[0] === 'tagbox') { var tw2 = h.textW(l[3], 18, true) + 28, bx2 = l[1] - tw2 / 2, by2 = l[2] - 64; E('line', { x1: l[1], x2: l[1], y1: by2 + 38, y2: l[2] - 4, stroke: C.dark, 'stroke-width': 3 }, gl);
      E('rect', { x: bx2, y: by2, width: tw2, height: 38, rx: 6, fill: '#FFFFFF', style: 'filter:drop-shadow(0 3px 8px rgba(0,40,28,.16))' }, gl); T(gl, l[1], by2 + 26, l[3], { 'font-size': 18, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }) }
    else { var twd = h.textW(l[3], 16, true); link(gl, [[l[1] + 3, l[2]], [l[4] - twd - 10, l[2]]], 'axis', { sw: 1.5 }); E('circle', { cx: l[1] + 3, cy: l[2], r: 3, fill: C.dark }, gl); T(gl, l[4], l[2] + 5, l[3], { 'font-size': 16, 'font-weight': 700, fill: C.ink, 'text-anchor': 'end' }) } });
  (b.texts || []).forEach(function (q) { T(gl, x + pw * q.fx, y + ph * q.fy, q.t, { 'font-size': q.fs || 16, 'font-weight': q.w || 600, fill: col(q.fill || 'sub'), 'text-anchor': q.anchor || 'start' }) });
  (b.callouts || []).forEach(function (q, i) { var g = grp(svg, t0 + 900 + i * 300, q.t), k = K(g), at = P(q.at[0], q.at[1], q.at[2] || 0), cw = q.w || 280, cx = x + (q.x != null ? q.x : 20 + i * (cw + 20)), cy = y + (q.y || 0), chh = 120;
    E('line', { x1: at[0], x2: at[0], y1: cy + chh, y2: at[1] - 6, stroke: C.dark, 'stroke-width': 3 }, g); E('circle', { cx: at[0], cy: at[1] - 6, r: 6, fill: '#FFFFFF', stroke: C.dark, 'stroke-width': 3 }, g);
    k.rect(cx, cy, cw, chh, 'card'); k.text(cx + 22, cy + 34, q.t, 18, 700, 'ink'); k.text(cx + 22, cy + 84, q.v, 36, 800, q.tone === 'warn' ? 'warn' : 'gdk'); if (q.s) k.text(cx + 22, cy + 108, q.s, 16, 500, 'sub') });
  if (sp[1]) list(svg, sp[1], { items: b.list }, t0 + 800) }

/* plan : 도면 · 계통도 · 기계 — 흰 바탕 옅은 격자(6판은 짙은 청사진 바탕 없음) 위 선 그림 + 치수선 + 번호 + 기호 + 배관 + 표제란
   size[가로, 세로](도면 단위) · margin · mt_ · dx · dy · grid(24) · shapes[{k:'rect|line|poly|circle|arc|rep', x, y, w, h, r, pts[], a0, a1, c:'line|thin|warn|hi', fill:'soft|solid|hi|hatch|warn', sw:'bold|mid|thin', dash, arrow, n, dx, dy, shape}]
   syms[{k:'tank|vessel|pump|valve|hx|turbine|gen|tower|fan', x, y, w, h, hot, core, trays, t, tp:'below|above|in'}] · pipes[{pts[], tone, dash, arrow, lab, lp, sw}] · dims[{a, b, t, off}] · texts[{x, y, t, fs, w, fill, anchor, halo}] · pins[{x, y, n, to}] · title{name, scale, unit} · list */
var plid = 0, LIGHT6 = { gon: 'g65', white: 'gdk', on: 'g65', gmid: 'gdk' };   /* 짙은 청사진용 색 이름 → 흰 바탕용 */
function arrowHead(g, a, b, c, s) { var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; s = s || 9;
  E('path', { d: 'M' + b[0] + ',' + b[1] + 'L' + (b[0] - ux * s - uy * s * .5) + ',' + (b[1] - uy * s + ux * s * .5) + 'L' + (b[0] - ux * s + uy * s * .5) + ',' + (b[1] - uy * s - ux * s * .5) + 'Z', fill: c }, g) }
function plan(svg, z, b, t0) { var sp = splitList(z, b), x = sp[0][0], y = sp[0][1], pw = sp[0][2], ph = sp[0][3], ln = C.dark, thin = C.g65, soft = '#F3F9F6', txt = C.ink, GR = b.grid || 24;
  var g0 = grp(svg, t0, b.title && b.title.name, 'fade'), id = 'bpl' + (++plid), df = E('defs', {}, g0);
  var cp = E('clipPath', { id: id + 'c' }, df); E('rect', { x: x, y: y, width: pw, height: ph, rx: 6 }, cp);
  var pt = E('pattern', { id: id + 'h', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, df); E('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: C.axis, 'stroke-width': 1.5 }, pt);
  E('rect', { x: x, y: y, width: pw, height: ph, rx: 6, fill: '#FFFFFF' }, g0); var gg = E('g', { 'clip-path': 'url(#' + id + 'c)', 'data-k': 'plan' }, g0);
  for (var i = 1; x + i * GR < x + pw; i++) E('line', { x1: x + i * GR, x2: x + i * GR, y1: y, y2: y + ph, stroke: '#E3ECE7', 'stroke-width': i % 4 === 0 ? 1.5 : .8 }, gg);
  for (var j = 1; y + j * GR < y + ph; j++) E('line', { x1: x, x2: x + pw, y1: y + j * GR, y2: y + j * GR, stroke: '#E3ECE7', 'stroke-width': j % 4 === 0 ? 1.5 : .8 }, gg);
  var W = b.size[0], H = b.size[1], m = b.margin == null ? 44 : b.margin, mt = b.mt_ == null ? m : b.mt_, k = Math.min((pw - 2 * m) / W, (ph - mt - m) / H), ox = x + (pw - W * k) / 2 + (b.dx || 0), oy = y + mt + (ph - mt - m - H * k) / 2 + (b.dy || 0);
  function TP(a, c) { return [ox + a * k, oy + c * k] }
  var SW = { wall: 8, wall2: 5, bold: 3, mid: 1.5, thin: 1.5 }, gS = grp(svg, t0 + 200, null, 'fade');
  function shape(sh, da, dc) { da = da || 0; dc = dc || 0; var kd = sh.k, c = { line: ln, thin: thin, warn: C.warn, hi: C.main }[sh.c || 'line'] || col(sh.c), fl = sh.fill, fill = !fl ? 'none' : (fl === 'hatch' ? 'url(#' + id + 'h)' : ({ soft: soft, solid: ln, hi: C.g65, bg: '#FFFFFF', warn: C.warn }[fl] || col(fl))), sw = SW[sh.sw || 'mid'], dash = sh.dash ? '6 5' : null;
    if (kd === 'rect') { var p = TP(sh.x + da, sh.y + dc); E('rect', { x: p[0], y: p[1], width: sh.w * k, height: sh.h * k, rx: (sh.r || 0) * k, fill: fill, stroke: c, 'stroke-width': sw, 'stroke-dasharray': dash }, gS) }
    else if (kd === 'line' || kd === 'poly') { var P = sh.pts.map(function (q) { return TP(q[0] + da, q[1] + dc) });
      E(kd === 'poly' ? 'polygon' : 'polyline', { points: P.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1) }).join(' '), fill: fill, stroke: c, 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': sw >= 5 ? 'square' : 'butt', 'stroke-dasharray': dash }, gS);
      if (sh.arrow && P.length > 1) arrowHead(gS, P[P.length - 2], P[P.length - 1], C.main, 9) }
    else if (kd === 'circle') { var pc = TP(sh.x + da, sh.y + dc); E('circle', { cx: pc[0], cy: pc[1], r: sh.r * k, fill: fill, stroke: c, 'stroke-width': sw, 'stroke-dasharray': dash }, gS) }
    else if (kd === 'arc') { var ca = TP(sh.x + da, sh.y + dc), r = sh.r * k, a0 = sh.a0 * Math.PI / 180, a1 = sh.a1 * Math.PI / 180;
      E('path', { d: 'M' + (ca[0] + r * Math.cos(a0)) + ',' + (ca[1] + r * Math.sin(a0)) + ' A' + r + ',' + r + ' 0 ' + (Math.abs(sh.a1 - sh.a0) > 180 ? 1 : 0) + ' ' + (sh.a1 > sh.a0 ? 1 : 0) + ' ' + (ca[0] + r * Math.cos(a1)) + ',' + (ca[1] + r * Math.sin(a1)), fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-dasharray': dash }, gS) }
    else if (kd === 'rep') for (var q = 0; q < sh.n; q++) shape(sh.shape, da + q * (sh.dx || 0), dc + q * (sh.dy || 0)) }
  (b.shapes || []).forEach(function (sh) { shape(sh) });
  /* 도면 재료 : walls[[x0, y0, x1, y1, 굵기(8|5)]] · windows[[x0, y0, x1, y1]] · doors[{x, y, r, a0, a1}] · furniture[{k:'bed|sofa|table|tv|counter|toilet', x, y, w, h, n}] */
  function ln2(pts, c, w, cap, dsh) { E('polyline', { points: pts.map(function (q) { var r2 = TP(q[0], q[1]); return r2[0].toFixed(1) + ',' + r2[1].toFixed(1) }).join(' '), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-linecap': cap || 'butt', 'stroke-dasharray': dsh || null }, gS) }
  function rc(a, c2, w, hh, rx) { var r2 = TP(a, c2); E('rect', { x: r2[0], y: r2[1], width: w * k, height: hh * k, rx: rx == null ? 2 : rx, fill: 'none', stroke: thin, 'stroke-width': 1.5 }, gS) }
  function ov(a, c2, rx, ry) { var r2 = TP(a, c2); E('ellipse', { cx: r2[0], cy: r2[1], rx: rx, ry: ry, fill: 'none', stroke: thin, 'stroke-width': 1.5 }, gS) }
  (b.furniture || []).forEach(function (f) { var w = f.w || 10, hh = f.h || 6;
    if (f.k === 'bed') { rc(f.x, f.y, w, hh); ln2([[f.x, f.y + Math.min(5, hh * .28)], [f.x + w, f.y + Math.min(5, hh * .28)]], thin, 1.5) }
    else if (f.k === 'sofa') { rc(f.x, f.y, w, hh); ln2([[f.x + 4, f.y], [f.x + 4, f.y + hh]], thin, 1.5); ln2([[f.x + w - 4, f.y], [f.x + w - 4, f.y + hh]], thin, 1.5) }
    else if (f.k === 'table') { rc(f.x, f.y, w, hh, 3); var n = f.n || 3; for (var q = 0; q < n; q++) { var cx = f.x + w * (q + 1) / (n + 1) + (q - (n - 1) / 2) * .0; ov(cx, f.y - 1.9, 5, 5); ov(cx, f.y + hh + 1.9, 5, 5) } }
    else if (f.k === 'toilet') { rc(f.x, f.y, w || 14, hh || 6, 6); ov(f.x + (f.bx == null ? 4 : f.bx), f.y + (f.by == null ? 10.5 : f.by), 9, 12) }
    else rc(f.x, f.y, w, hh, f.k === 'tv' ? 1 : 2) });
  (b.walls || []).forEach(function (wl) { ln2([[wl[0], wl[1]], [wl[2], wl[3]]], ln, wl[4] || 8, 'square') });
  (b.windows || []).forEach(function (wn) { var vert = Math.abs(wn[0] - wn[2]) < .01; [-1, 0, 1].forEach(function (d) { ln2(vert ? [[wn[0] + d, wn[1]], [wn[2] + d, wn[3]]] : [[wn[0], wn[1] + d], [wn[2], wn[3] + d]], ln, 1.5) }) });
  (b.doors || []).forEach(function (dr) { var cc = TP(dr.x, dr.y), rr = dr.r * k, a0 = dr.a0 * Math.PI / 180, a1 = dr.a1 * Math.PI / 180, p0 = [cc[0] + rr * Math.cos(a0), cc[1] + rr * Math.sin(a0)], p1 = [cc[0] + rr * Math.cos(a1), cc[1] + rr * Math.sin(a1)];
    E('path', { d: 'M' + p0[0] + ',' + p0[1] + ' A' + rr + ',' + rr + ' 0 0 ' + (dr.a1 > dr.a0 ? 1 : 0) + ' ' + p1[0] + ',' + p1[1], fill: 'none', stroke: thin, 'stroke-width': 1.5 }, gS); E('line', { x1: cc[0], y1: cc[1], x2: p0[0], y2: p0[1], stroke: thin, 'stroke-width': 1.5 }, gS) });
  var gY = grp(svg, t0 + 400, null, 'fade');
  (b.syms || []).forEach(function (sy) { var p = TP(sy.x, sy.y), w = (sy.w || 0) * k, hh = (sy.h || 0) * k, c = ln, fill = sy.hot ? C.g65 : soft, r;
    if (sy.k === 'tank') E('rect', { x: p[0], y: p[1], width: w, height: hh, rx: Math.min(w, hh) * .18, fill: fill, stroke: c, 'stroke-width': 3 }, gY);
    else if (sy.k === 'vessel') { r = w / 2; E('path', { d: 'M' + p[0] + ',' + (p[1] + r) + ' A' + r + ',' + r + ' 0 0 1 ' + (p[0] + w) + ',' + (p[1] + r) + ' L' + (p[0] + w) + ',' + (p[1] + hh - r) + ' A' + r + ',' + r + ' 0 0 1 ' + p[0] + ',' + (p[1] + hh - r) + ' Z', fill: fill, stroke: c, 'stroke-width': 3 }, gY);
      if (sy.core) E('rect', { x: p[0] + w * .24, y: p[1] + hh * .42, width: w * .52, height: hh * .34, rx: 0, fill: 'url(#' + id + 'h)', stroke: c, 'stroke-width': 1.5 }, gY) }
    else if (sy.k === 'pump') { r = w / 2; var cx = p[0] + r, cy = p[1] + r; E('circle', { cx: cx, cy: cy, r: r, fill: fill, stroke: c, 'stroke-width': 3 }, gY); E('polygon', { points: (cx - r * .45) + ',' + (cy - r * .55) + ' ' + (cx + r * .6) + ',' + cy + ' ' + (cx - r * .45) + ',' + (cy + r * .55), fill: c }, gY) }
    else if (sy.k === 'valve') { var vx = p[0] + w / 2, vy = p[1] + hh / 2; E('polygon', { points: p[0] + ',' + p[1] + ' ' + vx + ',' + vy + ' ' + p[0] + ',' + (p[1] + hh), fill: '#FFFFFF', stroke: c, 'stroke-width': 3 }, gY); E('polygon', { points: (p[0] + w) + ',' + p[1] + ' ' + vx + ',' + vy + ' ' + (p[0] + w) + ',' + (p[1] + hh), fill: '#FFFFFF', stroke: c, 'stroke-width': 3 }, gY) }
    else if (sy.k === 'hx') { E('rect', { x: p[0], y: p[1], width: w, height: hh, rx: Math.min(w, hh) * .2, fill: fill, stroke: c, 'stroke-width': 3 }, gY); var zz = []; for (var q = 0; q <= 5; q++) zz.push((p[0] + w * (.15 + .7 * q / 5)).toFixed(1) + ',' + (p[1] + hh * (q % 2 ? .75 : .25)).toFixed(1)); E('polyline', { points: zz.join(' '), fill: 'none', stroke: thin, 'stroke-width': 3 }, gY) }
    else if (sy.k === 'turbine') E('polygon', { points: p[0] + ',' + (p[1] + hh * .3) + ' ' + (p[0] + w) + ',' + p[1] + ' ' + (p[0] + w) + ',' + (p[1] + hh) + ' ' + p[0] + ',' + (p[1] + hh * .7), fill: fill, stroke: c, 'stroke-width': 3 }, gY);
    else if (sy.k === 'gen') E('circle', { cx: p[0] + w / 2, cy: p[1] + w / 2, r: w / 2, fill: fill, stroke: c, 'stroke-width': 3 }, gY);
    else if (sy.k === 'tower') { E('rect', { x: p[0], y: p[1], width: w, height: hh, rx: w * .3, fill: fill, stroke: c, 'stroke-width': 3 }, gY); var n = sy.trays || 6; for (var t = 0; t < n; t++) E('line', { x1: p[0] + 4, x2: p[0] + w - 4, y1: p[1] + hh * (t + 1) / (n + 1), y2: p[1] + hh * (t + 1) / (n + 1), stroke: thin, 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, gY) }
    else if (sy.k === 'fan') { r = w / 2; var fx = p[0] + r, fy = p[1] + r; E('circle', { cx: fx, cy: fy, r: r, fill: fill, stroke: c, 'stroke-width': 3 }, gY); E('line', { x1: fx - r * .7, y1: fy - r * .7, x2: fx + r * .7, y2: fy + r * .7, stroke: c, 'stroke-width': 3 }, gY); E('line', { x1: fx - r * .7, y1: fy + r * .7, x2: fx + r * .7, y2: fy - r * .7, stroke: c, 'stroke-width': 3 }, gY) }
    if (sy.t) { var pos = sy.tp || 'below', pb = TP(sy.x + (sy.w || 0) / 2, sy.y + (sy.h || 0)), py = pos === 'below' ? pb[1] + 20 : (pos === 'above' ? TP(0, sy.y)[1] - 8 : TP(0, sy.y + (sy.h || 0) / 2)[1] + 5);
      T(gY, pb[0], py, sy.t, { 'font-size': 16, 'font-weight': 700, fill: txt, 'text-anchor': 'middle', stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }) } });
  var gP = grp(svg, t0 + 600, null, 'fade');
  (b.pipes || []).forEach(function (pp) { var P = pp.pts.map(function (q) { return TP(q[0], q[1]) }), tn = LIGHT6[pp.tone] || pp.tone || 'g65'; link(gP, P, tn, { dash: pp.dash, arrow: pp.arrow !== false, sw: pp.sw }); if (pp.lab) linkLab(gP, P, pp.lab, tn, 'white', pp.lp) });
  (b.dims || []).forEach(function (d) { var A = TP(d.a[0], d.a[1]), B = TP(d.b[0], d.b[1]), off = d.off == null ? -22 : d.off, c = C.g65, s = off > 0 ? 1 : -1, ww = h.textW(d.t, 16, true) + 16;
    if (Math.abs(A[1] - B[1]) < .5) { var yy = A[1] + off; E('line', { x1: A[0], x2: A[0], y1: A[1] + 4 * s, y2: yy + 5 * s, stroke: c, 'stroke-width': 1.5 }, gP); E('line', { x1: B[0], x2: B[0], y1: B[1] + 4 * s, y2: yy + 5 * s, stroke: c, 'stroke-width': 1.5 }, gP); E('line', { x1: A[0], x2: B[0], y1: yy, y2: yy, stroke: c, 'stroke-width': 1.5 }, gP); arrowHead(gP, [B[0], yy], [A[0], yy], c, 7); arrowHead(gP, [A[0], yy], [B[0], yy], c, 7);
      var mx = (A[0] + B[0]) / 2; E('rect', { x: mx - ww / 2, y: yy - 12, width: ww, height: 24, rx: 0, fill: '#FFFFFF' }, gP); T(gP, mx, yy + 6, d.t, { 'font-size': 16, 'font-weight': 700, fill: C.main, 'text-anchor': 'middle' }) }
    else { var xx = A[0] + off; E('line', { x1: A[0] + 4 * s, x2: xx + 5 * s, y1: A[1], y2: A[1], stroke: c, 'stroke-width': 1.5 }, gP); E('line', { x1: B[0] + 4 * s, x2: xx + 5 * s, y1: B[1], y2: B[1], stroke: c, 'stroke-width': 1.5 }, gP); E('line', { x1: xx, x2: xx, y1: A[1], y2: B[1], stroke: c, 'stroke-width': 1.5 }, gP); arrowHead(gP, [xx, B[1]], [xx, A[1]], c, 7); arrowHead(gP, [xx, A[1]], [xx, B[1]], c, 7);
      var my = (A[1] + B[1]) / 2; E('rect', { x: xx - ww / 2, y: my - 12, width: ww, height: 24, rx: 0, fill: '#FFFFFF' }, gP); T(gP, xx, my + 6, d.t, { 'font-size': 16, 'font-weight': 700, fill: C.main, 'text-anchor': 'middle' }) } });
  (b.texts || []).forEach(function (q) { var p = TP(q.x, q.y), a = { 'font-size': q.fs ? ECOM.fs(q.fs < 15 ? 16 : q.fs) : 16, 'font-weight': q.w || 600, fill: col(LIGHT6[q.fill] || q.fill || (q.main === false ? thin : txt)), 'text-anchor': q.anchor || 'middle' };
    if (q.halo) Object.assign(a, { stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }); T(gP, p[0], p[1], q.t, a) });
  (b.rooms || []).forEach(function (rm) { var p = TP(rm.x, rm.y), HL = { stroke: '#FFFFFF', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round', 'text-anchor': 'middle' };
    if (rm.small) T(gP, p[0], p[1], rm.t, Object.assign({ 'font-size': 16, 'font-weight': 600, fill: C.main }, HL));
    else { T(gP, p[0], p[1], rm.t, Object.assign({ 'font-size': 20, 'font-weight': 700, fill: C.ink }, HL)); if (rm.s) T(gP, p[0], p[1] + 23, rm.s, Object.assign({ 'font-size': 16, 'font-weight': 600, fill: C.main }, HL)) } });
  (b.pins || []).forEach(function (q) { var p = TP(q.x, q.y); if (q.to) { var t2 = TP(q.to[0], q.to[1]); E('line', { x1: p[0], y1: p[1], x2: t2[0], y2: t2[1], stroke: thin, 'stroke-width': 1.5 }, gP); E('circle', { cx: t2[0], cy: t2[1], r: 2.6, fill: thin }, gP) } pin(gP, p[0], p[1], q.n, 'gdk') });
  var tb = b.title; if (tb) { var rows = [['도면', tb.name], ['축척', tb.scale || '개념도'], ['단위', tb.unit || '-']], tw = Math.max.apply(null, rows.map(function (r2) { return h.textW(r2[1], 13, true) })) + 62, tx = x + pw - tw - 12, ty = y + ph - 12 - 20 * rows.length;
    E('rect', { x: tx, y: ty, width: tw, height: 20 * rows.length, rx: 0, fill: '#FFFFFF', stroke: thin, 'stroke-width': 1.5 }, gP); E('line', { x1: tx + 44, x2: tx + 44, y1: ty, y2: ty + 20 * rows.length, stroke: thin, 'stroke-width': 1.5 }, gP);
    rows.forEach(function (r2, q) { if (q) E('line', { x1: tx, x2: tx + tw, y1: ty + 20 * q, y2: ty + 20 * q, stroke: thin, 'stroke-width': 1.5 }, gP); T(gP, tx + 22, ty + 15 + 20 * q, r2[0], { 'font-size': 13, fill: thin, 'text-anchor': 'middle' }); T(gP, tx + 52, ty + 15 + 20 * q, r2[1], { 'font-size': 13, 'font-weight': 600, fill: txt }) }) }
  if (sp[1]) list(svg, sp[1], { items: b.list }, t0 + 800) }

var BLOCKS = { steps: steps, compare: compare, stat: stat, cards: cards, note: note, table: table, bars: bars, timeline: timeline, layers: layers, pict: pict, nodes: nodes, line: line, dist: dist, matrix: matrix, tiles: tiles, shot: shot, list: list, iso: iso, plan: plan };
var CTX = null;
ECOM.parts.blocks = function (bd, s, ctx) { CTX = ctx;
  var svg = ctx.svg(512), Z = zones(s.layout, 1168, 512, s.gap), bl = s.blocks || []; SK = SKINS[s.skin] || null; usedTF = false;
  bl.forEach(function (b, i) { var f = BLOCKS[b.type], z = Z[Math.min(i, Z.length - 1)];
    if (!f) { T(svg, z[0] + 12, z[1] + 28, '모르는 블록 : ' + b.type, { 'font-size': 16, fill: C.warn }); return }
    f(svg, z, b, 200 + i * 900) });
  SK = null;
  if (usedTF) { var fn = ctx.root.querySelector('.fn'); if (fn) fn.insertAdjacentHTML('beforeend', '<span data-k="tf-credit"> · ' + (ECOM.TF_CREDIT || '이모지: 토스팀에서 제공한 토스페이스') + '</span>') }
  ctx.root.setAttribute('data-gap', 380) };
ECOM.parts.blocks.types = Object.keys(BLOCKS);
})();
