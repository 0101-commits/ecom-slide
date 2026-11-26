/* stairs — 원인 계단(CW44 10쪽) : 물음 상자 → 단계가 하나씩 내려앉고 굽은 화살이 그려짐 → 큰 화살 → 도장이 떨어짐 → 옆 상자
   intro{title,text} · steps[3~5]{tag:'WHY|①',title,lines:[1~2줄]} · side{title,text,sub} · stamp{label,value}(큰 화살 위 도장 — side 없으면 오른쪽 위에 결과 도장) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, K = ECOM.kx;
function stairsDefault(bd, s, ctx) {
  var steps = (s.steps || []).slice(0, 5), N = steps.length, side = s.side || null, stamp = s.stamp || null, intro = s.intro || null;
  var x0 = 58, dx = N >= 5 ? 96 : N === 4 ? 118 : 150, rmax = side ? 878 : stamp ? 930 : 1168, sw = Math.min(side || stamp ? 620 : 760, rmax - x0 - (N - 1) * dx);
  var TAG = 78, tx = TAG + 34, tw = sw - tx - 16;
  var sh = Math.max(72, Math.max.apply(null, steps.map(function (st) { return 26 + K.lines(st.title, 15.5, tw, 1) * 22 + (st.lines || []).reduce(function (a, l) { return a + K.lines(l, 13.5, tw - 12) * 19 }, 0) })) + 14);
  var y0 = intro ? 120 : 6, pitch = N > 1 ? Math.min(124, (512 - y0 - sh) / (N - 1)) : 0;
  if (!intro) y0 = Math.max(6, (512 - sh - (N - 1) * pitch) / 2);
  var svg = K.svg(ctx), t0 = intro ? 420 : 120, PER = 560, end = 0;
  if (intro) { K.D(bd, 'kx k-stin', 0, 0, 430, 96, '<div class="k-stit">' + h.md(intro.title || '') + '</div>' + (intro.text ? '<div class="k-sttx">' + h.md(intro.text) + '</div>' : ''), { 'data-at': 0, 'data-fx': 'rise' }) }
  var col = function (k) { var q = N > 1 ? k / (N - 1) : 1; return 'rgb(' + Math.round(240 - 26 * q) + ',' + Math.round(247 - 13 * q) + ',' + Math.round(244 - 20 * q) + ')' };
  steps.forEach(function (st, k) { var x = x0 + k * dx, y = y0 + k * pitch, ta = t0 + k * PER, last = k === N - 1, my = y + sh / 2;
    // 굽은 화살(위 왼쪽에서 내려와 이름표로)
    if (k > 0 || intro) { var sx = x - 36, sy = k ? y - pitch + sh + 6 : y - 18, ex = x - 7;
      var d = ECOM.h.orthoD([sx, sy], [ex, my], 'vh', 10);
      E('path', { d: d, fill: 'none', stroke: C.g65, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-at': ta, 'data-fx': 'draw', 'data-ms': 380 }, svg);
      K.head(svg, x - 1, my, 0, C.g65, 10, { 'data-at': ta + 330, 'data-fx': 'fade', 'data-ms': 160 }) }
    var html = '<div class="k-sttg' + (last ? ' last' : '') + '" style="width:' + TAG + 'px">' + h.esc(st.tag || String(k + 1)) + '</div><div class="k-stbx" style="left:' + tx + 'px;width:' + tw + 'px">'
      + '<div class="k-stt">' + h.md(st.title || '') + '</div>' + (st.lines || []).map(function (l) { return '<div class="k-stl">' + h.md(l) + '</div>' }).join('') + '</div>';
    var b = K.D(bd, 'kx k-stp' + (last ? ' last' : ''), x, y, sw, sh, html, { 'data-at': ta + 220, 'data-fx': 'left', 'data-ms': 420 }); b.style.background = col(k); b.setAttribute("data-key", st.title || "");
    end = ta + 640 });
  // 큰 화살 → 옆 상자(또는 결과 도장)
  var sideBox = side ? { x: 900, y: intro ? 26 : 10, w: 268 } : null, tgt = null;
  if (side) { var shh = 64 + K.lines(side.text, 15.5, sideBox.w - 36, 1) * 23 + (side.sub ? K.lines(side.sub, 13, sideBox.w - 36) * 19 + 8 : 0);
    K.D(bd, 'kx k-stsd', sideBox.x, sideBox.y, sideBox.w, shh, '<div class="k-stsh"><i>!</i>' + h.esc(side.title || '') + '</div><div class="k-stst">' + h.md(side.text || '') + '</div>' + (side.sub ? '<div class="k-stss">' + h.md(side.sub) + '</div>' : ''),
      { 'data-at': end + 1500, 'data-fx': 'rise', 'data-ms': 420 }); tgt = { x: sideBox.x + sideBox.w / 2, y: sideBox.y + shh + 52 } }
  else if (stamp) tgt = { x: 1030, y: 214 };
  if (tgt && N) { var lx = x0 + (N - 1) * dx + sw + 16, ly = y0 + (N - 1) * pitch + sh / 2, P0 = [lx, ly], P1 = [tgt.x + 40, ly], P2 = [tgt.x, ly - 90], P3 = [tgt.x, tgt.y];
    var gid = 'kstg' + ctx.index, df = E('defs', {}, svg), lg = E('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: P0[0], y1: P0[1], x2: P3[0], y2: P3[1] }, df);
    E('stop', { offset: 0, 'stop-color': C.g08 }, lg); E('stop', { offset: 1, 'stop-color': C.g40 }, lg);
    E('path', { d: 'M' + P0 + ' C ' + P1 + ', ' + P2 + ', ' + P3, fill: 'none', stroke: 'url(#' + gid + ')', 'stroke-width': 40, 'data-at': end + 60, 'data-fx': 'draw', 'data-ms': 820 }, svg);
    K.head(svg, tgt.x, tgt.y - 40, -Math.PI / 2, C.g40, 40, { 'data-at': end + 820, 'data-fx': 'fade', 'data-ms': 200 });
    if (stamp) { var q = .5, bx = Math.pow(1 - q, 3) * P0[0] + 3 * Math.pow(1 - q, 2) * q * P1[0] + 3 * (1 - q) * q * q * P2[0] + q * q * q * P3[0], by = Math.pow(1 - q, 3) * P0[1] + 3 * Math.pow(1 - q, 2) * q * P1[1] + 3 * (1 - q) * q * q * P2[1] + q * q * q * P3[1];
      if (!side) { bx = tgt.x; by = tgt.y - 120 }
      var sw2 = Math.max(170, h.textW(stamp.value || '', 25, 1) + 40, h.textW(stamp.label || '', 13, 1) + 40), og = E('g', { transform: 'translate(' + bx + ' ' + by + ')' }, svg), sg = E('g', { 'data-at': end + 1050, 'data-fx': 'rise', 'data-ms': 420 }, og);
      E('rect', { x: -sw2 / 2, y: -40, width: sw2, height: 80, rx: 8, fill: '#fff', stroke: C.line, 'stroke-width': 1.2 }, sg);
      E('rect', { x: -sw2 / 2, y: -40, width: 6, height: 80, rx: 3, fill: C.main }, sg);
      T(sg, 0, -13, stamp.label || '', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.main });
      T(sg, 0, 24, stamp.value || '', { 'text-anchor': 'middle', 'font-size': 25, 'font-weight': 700, fill: C.dark, 'letter-spacing': '-0.02em' }) } }
}
/* ───────── 배치(layout) — 같은 칸(intro · steps · side · stamp)으로 다른 그림 ─────────
   default   위 설명 그대로(굽은 화살 계단)
   domino    가로 도미노 — 단계가 왼 → 오 패로 서서 차례로 밀려 나며 다음 패를 침. 글은 패 아래에 바로 섬
   vtimeline 세로 연표 — 위 → 아래 줄기에 마디, 오른쪽에 설명 카드 · 결과 도장은 마지막 카드 옆
   causetree 원인 나무 — 마지막 단계가 오른쪽 결과, 앞 단계들이 왼쪽에서 모여드는 가지 */
var LAY = {};
function inj() { if (document.getElementById('p3a2-css')) return; var st = document.createElement('style'); st.id = 'p3a2-css'; st.textContent = '.kx.p3 b,.kx.p3 span b,.kx.p3 div b{color:inherit}'; (document.head || document.documentElement).appendChild(st) }
function D(bd, x, y, w, hh, html, css, at) { inj(); var d = K.D(bd, 'kx p3', x, y, w, hh, html, at); if (css) d.style.cssText += ';' + css; return d }
function st0(ctx) { var P = ctx.P, dk = ctx.dark; return { P: P, ON: dk ? ECOM.Cd.bg : '#fff', CARD: dk ? P.g08 : P.paper, BD: dk ? P.line : '#DDE3E0' } }
function ramp(P, k, N) { var q = N > 1 ? k / (N - 1) : 1, a = P.g65, b = P.main; return q >= 1 ? P.dark : mix(a, b, q) }
function mix(a, b, t) { function p(c) { c = c.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(c.substr(i, 2), 16) }) } var A = p(a), B = p(b); return '#' + A.map(function (v, i) { var r = Math.round(v + (B[i] - v) * t); return (r < 16 ? '0' : '') + r.toString(16) }).join('') }
/* 도장 · 옆 상자 — 한 줄 띠 */
function strip(bd, x, y, w, hh, o, at) { var P = o.P, ON = o.ON;
  return D(bd, x, y, w, hh, '<i style="font-style:normal;flex:0 0 auto;font-size:13px;font-weight:700;color:' + o.tc + ';background:' + o.tb + ';border-radius:999px;padding:4px 14px">' + h.esc(o.label) + '</i>'
    + '<div style="display:flex;flex-direction:column;min-width:0;gap:2px"><span style="font-size:' + ECOM.fs((o.big ? 26 : 15.5)) + 'px;font-weight:700;line-height:1.35;color:' + o.fg + '">' + h.md(o.text) + '</span>' + (o.sub ? '<span style="font-size:13px;color:' + o.sg + ';line-height:1.4">' + h.md(o.sub) + '</span>' : '') + '</div>',
    'display:flex;align-items:center;gap:18px;padding:0 24px;border-radius:6px;background:' + o.bg + ';' + (o.bd ? 'border:1px solid ' + o.bd : ''), at) }
function endBoxes(bd, s, ctx, y, hh, at) { var S = st0(ctx), P = S.P, side = s.side, stamp = s.stamp, n = (side ? 1 : 0) + (stamp ? 1 : 0); if (!n) return; var w = (1168 - (n - 1) * 16) / n, x = 0;
  if (stamp) { strip(bd, x, y, w, hh, { P: P, ON: S.ON, label: stamp.label || '결과', text: stamp.value || '', big: 1, bg: P.dark, fg: S.ON, tb: S.ON, tc: P.dark, sg: S.ON }, { 'data-at': at, 'data-fx': 'rise', 'data-ms': 420 }); x += w + 16 }
  if (side) strip(bd, x, y, w, hh, { P: P, ON: S.ON, label: side.title || '남은 변수', text: side.text || '', sub: side.sub, bg: S.CARD, bd: S.BD, fg: P.ink, tb: P.cmp, tc: S.ON, sg: P.mute }, { 'data-at': at + 200, 'data-fx': 'rise', 'data-ms': 420 }) }
function introStrip(bd, intro, w, ctx, at) { var S = st0(ctx), P = S.P;
  return D(bd, 0, 0, w, 56, '<b style="font-size:18px;color:' + P.dark + ';flex:0 0 auto">' + h.md(intro.title || '') + '</b>' + (intro.text ? '<span style="font-size:16px;color:' + P.sub + ';line-height:1.4">' + h.md(intro.text) + '</span>' : ''),
    'display:flex;align-items:center;gap:18px;padding:0 22px;border-radius:6px;border:1.5px solid ' + P.g40 + ';background:' + (ctx.dark ? P.g08 : '#fff'), { 'data-at': at || 0, 'data-fx': 'rise', 'data-ms': 360 }) }

LAY.domino = function (bd, s, ctx) {
  var S = st0(ctx), P = S.P, ON = S.ON, steps = (s.steps || []).slice(0, 5), N = steps.length, intro = s.intro, end = s.side || s.stamp, svg = K.svg(ctx);
  var gp = 34, sw = (1168 - (N - 1) * gp) / N, tw0 = sw - 12;
  var th = Math.max.apply(null, steps.map(function (st) { return K.lines(st.title, 16, tw0, 1) * 22 + (st.lines || []).reduce(function (a, l) { return a + K.lines(l, 14, tw0) * 20 }, 0) + 8 }));
  var top = intro ? 72 : 0, bot = end ? 84 : 0, avail = 512 - top - bot, TH = Math.max(120, Math.min(330, avail - th - 50)), tw = Math.min(TH * .5, sw - 36, 164);
  var tot = TH + 22 + th, y0 = top + Math.max(0, (avail - tot) / 2), cy = y0 + TH / 2;
  if (intro) introStrip(bd, intro, 1168, ctx, 0);
  steps.forEach(function (st, k) { var sx = k * (sw + gp), tx = sx + (sw - tw) / 2, ta = 200 + k * 420, last = k === N - 1, col = ramp(P, k, N);
    var tile = D(bd, tx, y0, tw, TH, '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:' + ECOM.fs((h.textW(st.tag || '', 17, 1) > tw - 16 ? 14 : 17)) + 'px;font-weight:700;letter-spacing:.02em;color:' + ON + '">' + h.esc(st.tag || String(k + 1)) + '</div>'
      + '<div style="height:2px;margin:0 14%;background:' + ON + ';opacity:.7"></div>'
      + '<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;letter-spacing:-.02em;color:' + ON + '">' + (k + 1) + '<small style="font-size:16px;font-weight:600;margin-left:3px">단계</small></div>',
      'display:flex;flex-direction:column;border-radius:6px;background:' + col + (last ? ';box-shadow:0 0 0 3px ' + P.g40 : ''), { 'data-at': ta, 'data-fx': 'slide', 'data-dx': k ? -80 : -30, 'data-ms': 420, 'data-key': st.title || '' });
    D(bd, sx + 6, y0 + TH + 22, tw0, th, '<div style="font-size:16px;font-weight:700;line-height:1.4;color:' + P.ink + '">' + h.md(st.title || '') + '</div>' + (st.lines || []).map(function (l) { return '<div style="font-size:16px;line-height:1.42;color:' + P.sub + ';margin-top:3px">' + h.md(l) + '</div>' }).join(''),
      'text-align:center', { 'data-at': ta + 200, 'data-fx': 'rise', 'data-ms': 360 });
    if (k < N - 1) { var ax0 = tx + tw + 10, ax1 = (k + 1) * (sw + gp) + (sw - tw) / 2 - 10;
      E('path', { d: 'M' + ax0 + ' ' + cy + ' H' + (ax1 - 7), fill: 'none', stroke: P.g65, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-at': ta + 260, 'data-fx': 'draw', 'data-ms': 220 }, svg);
      K.head(svg, ax1, cy, 0, P.g65, 11, { 'data-at': ta + 400, 'data-fx': 'fade', 'data-ms': 120 }) } });
  endBoxes(bd, s, ctx, 512 - 72, 72, 200 + N * 420 + 200) };

LAY.vtimeline = function (bd, s, ctx) {
  var S = st0(ctx), P = S.P, ON = S.ON, steps = (s.steps || []).slice(0, 5), N = steps.length, intro = s.intro, side = s.side, stamp = s.stamp, svg = K.svg(ctx);
  var rw = side || stamp ? 292 : 0, lx = 214, cx0 = 252, cw = 1168 - rw - (rw ? 36 : 0) - cx0, y0 = intro ? 72 : 0, ph = (512 - y0) / N;
  if (intro) introStrip(bd, intro, cx0 + cw, ctx, 0);
  var ys = steps.map(function (_, k) { return y0 + ph * k + ph / 2 });
  if (N > 1) E('path', { d: 'M' + lx + ' ' + ys[0] + ' V' + ys[N - 1], fill: 'none', stroke: P.g40, 'stroke-width': 4, 'stroke-linecap': 'round', 'data-at': 150, 'data-fx': 'draw', 'data-ms': 120 + N * 320 }, svg);
  steps.forEach(function (st, k) { var ta = 150 + k * 320, last = k === N - 1, col = ramp(P, k, N), r = last ? 21 : 17;
    var need = 14 + K.lines(st.title, 18, cw - 56, 1) * 25 + (st.lines || []).reduce(function (a, l) { return a + K.lines(l, 14.5, cw - 56) * 21 }, 0), chh = Math.min(ph - 12, Math.max(need, 64));
    D(bd, 0, ys[k] - 15, lx - 34, 30, h.esc(st.tag || String(k + 1)), 'display:flex;align-items:center;justify-content:flex-end;font-size:' + ECOM.fs((last ? 18 : 16)) + 'px;font-weight:700;color:' + (last ? P.dark : P.g65) + ';letter-spacing:.02em', { 'data-at': ta, 'data-fx': 'right', 'data-ms': 320 });
    E('line', { x1: lx + r, x2: cx0 - 10, y1: ys[k], y2: ys[k], stroke: P.g40, 'stroke-width': 2, 'data-at': ta + 80, 'data-fx': 'draw', 'data-ms': 200 }, svg);
    var nd = E('g', { 'data-at': ta, 'data-fx': 'pop', 'data-ms': 300, 'data-o': lx + 'px ' + ys[k] + 'px' }, svg);
    E('circle', { cx: lx, cy: ys[k], r: r, fill: col, stroke: ON, 'stroke-width': 3 }, nd); h.T(nd, lx, ys[k] + 5.5, String(k + 1), { 'text-anchor': 'middle', 'font-size': last ? 17 : 15, 'font-weight': 700, fill: ON });
    D(bd, cx0, ys[k] - chh / 2, cw, chh, '<div style="font-size:18px;font-weight:700;line-height:1.4;color:' + P.ink + '">' + h.md(st.title || '') + '</div>' + (st.lines || []).map(function (l) { return '<div style="font-size:16px;line-height:1.45;color:' + P.sub + ';margin-top:2px">' + h.md(l) + '</div>' }).join(''),
      'display:flex;flex-direction:column;justify-content:center;padding:0 28px;border-radius:6px;background:' + (last ? P.g08 : S.CARD) + ';border:' + (last ? '2px solid ' + P.main : '1px solid ' + S.BD), { 'data-at': ta + 120, 'data-fx': 'left', 'data-ms': 380, 'data-key': st.title || '' }) });
  var tEnd = 150 + N * 320 + 200;
  if (stamp) { var sy = ys[N - 1], sh = 112, sx = 1168 - rw;
    E('path', { d: 'M' + (cx0 + cw + 6) + ' ' + sy + ' H' + (sx - 14), fill: 'none', stroke: P.dark, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'data-at': tEnd, 'data-fx': 'draw', 'data-ms': 300 }, svg);
    K.head(svg, sx - 4, sy, 0, P.dark, 13, { 'data-at': tEnd + 260, 'data-fx': 'fade', 'data-ms': 120 });
    D(bd, sx, Math.min(512 - sh, sy - sh / 2), rw, sh, '<div style="font-size:16px;font-weight:700;color:' + ON + ';opacity:.92">' + h.esc(stamp.label || '결과') + '</div><div style="font-size:36px;font-weight:700;letter-spacing:-.02em;color:' + ON + ';margin-top:4px;line-height:1.15">' + h.esc(stamp.value || '') + '</div>',
      'display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;border-radius:6px;background:' + P.dark, { 'data-at': tEnd + 280, 'data-fx': 'pop', 'data-ms': 360 }) }
  if (side) { var sx2 = 1168 - rw, shh = 74 + K.lines(side.text, 15.5, rw - 36, 1) * 23 + (side.sub ? K.lines(side.sub, 13, rw - 36) * 19 + 8 : 0), sy2 = stamp ? Math.max(0, Math.min(ys[N - 1] - 112 / 2 - 24 - shh, 20)) : (512 - shh) / 2;
    D(bd, sx2, sy2, rw, shh, '<div style="align-self:stretch;text-align:center;background:' + P.cmp + ';color:' + ON + ';font-size:16px;font-weight:700;border-radius:6px;padding:9px 0;margin-bottom:10px">' + h.esc(side.title || '남은 변수') + '</div><div style="font-size:16px;font-weight:700;line-height:1.45;color:' + P.ink + '">' + h.md(side.text || '') + '</div>' + (side.sub ? '<div style="font-size:13px;color:' + P.mute + ';line-height:1.45;margin-top:8px">' + h.md(side.sub) + '</div>' : ''),
      'display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 18px;border-radius:6px;background:' + S.CARD + ';border:1px solid ' + S.BD, { 'data-at': tEnd + (stamp ? 700 : 0), 'data-fx': 'rise', 'data-ms': 420 }) } };

LAY.causetree = function (bd, s, ctx) {
  var S = st0(ctx), P = S.P, ON = S.ON, steps = (s.steps || []).slice(0, 5), N = steps.length, intro = s.intro, side = s.side, stamp = s.stamp, svg = K.svg(ctx);
  if (N < 2) return stairsDefault(bd, s, ctx);
  var causes = steps.slice(0, N - 1), res = steps[N - 1], n = causes.length, cw = 520, rx = 668, rw = 1168 - rx, y0 = intro ? 72 : 0, area = 512 - y0, gp = 14, ch = Math.min(130, (area - (n - 1) * gp) / n);
  if (intro) introStrip(bd, intro, cw, ctx, 0);
  var cy0 = y0 + (area - (n * ch + (n - 1) * gp)) / 2;
  // 결과 상자 크기
  var rtl = K.lines(res.title, 24, rw - 56, 1) * 31 + (res.lines || []).reduce(function (a, l) { return a + K.lines(l, 15, rw - 56) * 22 }, 0), rh = 70 + rtl + (stamp ? 92 : 0);
  var sdh = side ? 70 + K.lines(side.text, 15, rw - 40, 1) * 22 + (side.sub ? K.lines(side.sub, 13, rw - 40) * 19 + 6 : 0) : 0, stackH = rh + (side ? 16 + sdh : 0), ry = Math.max(0, (512 - stackH) / 2), rcy = ry + rh / 2, tx = 604;
  var ys = [];
  causes.forEach(function (st, k) { var y = cy0 + k * (ch + gp), ta = 120 + k * 360, my = y + ch / 2, col = ramp(P, k, n + 1); ys.push(my);
    D(bd, 0, y, cw, ch, '<i style="font-style:normal;flex:0 0 auto;min-width:56px;text-align:center;font-size:16px;font-weight:700;border-radius:6px;padding:6px 8px;background:' + col + ';color:' + ON + '">' + h.esc(st.tag || String(k + 1)) + '</i>'
      + '<div style="display:flex;flex-direction:column;min-width:0"><div style="font-size:16px;font-weight:700;line-height:1.4;color:' + P.ink + '">' + h.md(st.title || '') + '</div>' + (st.lines || []).map(function (l) { return '<div style="font-size:16px;line-height:1.42;color:' + P.sub + ';margin-top:2px">' + h.md(l) + '</div>' }).join('') + '</div>',
      'display:flex;align-items:center;gap:16px;padding:0 20px 0 16px;border-radius:6px;background:' + S.CARD + ';border:1px solid ' + S.BD + ';border-left:6px solid ' + col, { 'data-at': ta, 'data-fx': 'left', 'data-ms': 360, 'data-key': st.title || '' });
    E('path', { d: 'M' + cw + ' ' + my + ' H' + tx + ' V' + rcy, fill: 'none', stroke: P.g65, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'data-at': ta + 260, 'data-fx': 'draw', 'data-ms': 420 }, svg) });
  var te = 120 + n * 360 + 200;
  E('path', { d: 'M' + tx + ' ' + rcy + ' H' + (rx - 9), fill: 'none', stroke: P.g65, 'stroke-width': 3, 'data-at': te, 'data-fx': 'draw', 'data-ms': 240 }, svg);
  E('circle', { cx: tx, cy: rcy, r: 5, fill: P.g65, 'data-at': te - 80, 'data-fx': 'fade', 'data-ms': 120 }, svg);
  K.head(svg, rx - 2, rcy, 0, P.g65, 12, { 'data-at': te + 200, 'data-fx': 'fade', 'data-ms': 120 });
  D(bd, rx, ry, rw, rh, '<i style="font-style:normal;align-self:flex-start;font-size:16px;font-weight:700;border-radius:6px;padding:5px 12px;background:' + ON + ';color:' + P.dark + '">' + h.esc(res.tag || '결과') + '</i><div style="font-size:26px;font-weight:700;line-height:1.3;margin-top:12px;color:' + ON + '">' + h.md(res.title || '') + '</div>'
    + (res.lines || []).map(function (l) { return '<div style="font-size:16px;line-height:1.45;margin-top:4px;color:' + ON + ';opacity:.92">' + h.md(l) + '</div>' }).join('')
    + (stamp ? '<div style="margin-top:auto;border-top:1px solid ' + ON + ';padding-top:10px;display:flex;align-items:baseline;gap:14px"><span style="font-size:16px;font-weight:700;color:' + ON + '">' + h.esc(stamp.label || '') + '</span><span style="font-size:36px;font-weight:700;letter-spacing:-.02em;color:' + ON + '">' + h.esc(stamp.value || '') + '</span></div>' : ''),
    'display:flex;flex-direction:column;padding:20px 28px 18px;border-radius:6px;background:' + P.dark, { 'data-at': te + 120, 'data-fx': 'pop', 'data-ms': 420, 'data-key': res.title || '' });
  if (side) D(bd, rx, ry + rh + 16, rw, sdh, '<div style="align-self:stretch;text-align:center;background:' + P.cmp + ';color:' + ON + ';font-size:16px;font-weight:700;border-radius:6px;padding:8px 0;margin-bottom:10px">' + h.esc(side.title || '남은 변수') + '</div><div style="font-size:16px;font-weight:700;line-height:1.45;color:' + P.ink + '">' + h.md(side.text || '') + '</div>' + (side.sub ? '<div style="font-size:13px;color:' + P.mute + ';line-height:1.45;margin-top:6px">' + h.md(side.sub) + '</div>' : ''),
    'display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 20px;border-radius:6px;background:' + S.CARD + ';border:1px solid ' + S.BD, { 'data-at': te + 600, 'data-fx': 'rise', 'data-ms': 400 }) };

ECOM.parts.stairs = function (bd, s, ctx) { var f = s.layout && LAY[s.layout]; return f ? f(bd, s, ctx) : stairsDefault(bd, s, ctx) };
ECOM.parts.stairs.layouts = ['default', 'domino', 'vtimeline', 'causetree'];
ECOM.parts.stairs.dark = ['domino', 'vtimeline', 'causetree'];
})();
