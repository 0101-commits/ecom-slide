/* 6판 조립 블록 — 화면 종류 blocks. 본문 칸(1168×512)을 layout 으로 나누고 blocks[] 를 차례로 채움. 형식 = style/SCHEMA6_blocks.md
   layout : full · L6R4(좌우 6:4) · T7B3(위아래 7:3) · T6B4:L6R6(위 한 칸 + 아래 좌우) · L7R5:T5B5(왼쪽 한 칸 + 오른쪽 위아래)
   블록   : steps 차례 띠 · compare 가운데 축 비교 · stat 숫자 칸(+ 작은 추이선) · cards 카드 열 · note 결론 띠 · table 머리글 표 · bars 가로 막대 · timeline 시간 축 · layers 층 쌓기, 포함 겹 · pict 그림 단위 · nodes 상자 + 직각 연결선 · line 선 차트 · dist 점 분포 · matrix 2×2 · tiles 벤토 타일 · shot 실제 그림 + 확대 풀이 · list 번호 목록. 아이콘 = 라인 아이콘 이름 또는 tf:<코드>(Tossface, 쓴 장 각주에 출처). skin navy · plain
   칸은 테두리 없이 면 색(옅은 면 · 중간 면 · 짙은 면 = 결론), 글자는 6판 7단계 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var COL = { ink: C.ink, sub: C.sub, mute: C.mute, g: C.g65, gdk: C.dark, gon: '#CDEFE0', g18: C.g18, g40: C.g40, card: C.g08, well: '#DCEAE3',
  light: C.light, white: '#FFFFFF', line: C.line, warn: C.warn, warn08: C.warnsoft, yel: '#FFF3C4', g65: C.g65, gmid: '#0A6444', gold: '#C98F35', axis: C.axis, gray: C.gray, grid: C.grid, paper: '#FFFFFF', on: C.on };
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
    if (c.side) k.text(vx, ty, c.side, 18, 700, fg2);
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

var BLOCKS = { steps: steps, compare: compare, stat: stat, cards: cards, note: note, table: table, bars: bars, timeline: timeline, layers: layers, pict: pict, nodes: nodes, line: line, dist: dist, matrix: matrix, tiles: tiles, shot: shot, list: list };
ECOM.parts.blocks = function (bd, s, ctx) {
  var svg = ctx.svg(512), Z = zones(s.layout, 1168, 512, s.gap), bl = s.blocks || []; SK = SKINS[s.skin] || null; usedTF = false;
  bl.forEach(function (b, i) { var f = BLOCKS[b.type], z = Z[Math.min(i, Z.length - 1)];
    if (!f) { T(svg, z[0] + 12, z[1] + 28, '모르는 블록 : ' + b.type, { 'font-size': 16, fill: C.warn }); return }
    f(svg, z, b, 200 + i * 900) });
  SK = null;
  if (usedTF) { var fn = ctx.root.querySelector('.fn'); if (fn) fn.insertAdjacentHTML('beforeend', '<span data-k="tf-credit"> · ' + (ECOM.TF_CREDIT || '이모지: 토스팀에서 제공한 토스페이스') + '</span>') }
  ctx.root.setAttribute('data-gap', 380) };
ECOM.parts.blocks.types = Object.keys(BLOCKS);
})();
