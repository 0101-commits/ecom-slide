/* mf 계열 2(가치사슬 · 공급망, F12 2차) — mfvalue · mfneck · mfdep · mfzig · mfbom · mfsmap · mfvert · mfdays
   ECOM.mf(n_mf1.js)를 씀. 형식 = style/SCHEMA4_F06.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz, M = ECOM.mf;
function chev(g, x, y, w, hh, fill, first) { var tip = 18, d = first ? 'M' + x + ' ' + y + ' L' + (x + w - tip) + ' ' + y + ' L' + (x + w) + ' ' + (y + hh / 2) + ' L' + (x + w - tip) + ' ' + (y + hh) + ' L' + x + ' ' + (y + hh) + ' Z'
  : 'M' + x + ' ' + y + ' L' + (x + w - tip) + ' ' + y + ' L' + (x + w) + ' ' + (y + hh / 2) + ' L' + (x + w - tip) + ' ' + (y + hh) + ' L' + x + ' ' + (y + hh) + ' L' + (x + tip) + ' ' + (y + hh / 2) + ' Z'; return E('path', { d: d, fill: fill }, g) }

/* ───────── mfvalue — 단계 폭 = 부가가치 몫, 칸 안은 나라 몫(100% 쌓기) ─────────
   stages[3~5]{name,sub,va(숫자),shares:[{name,value}]} · colors{이름:색 이름} · unit('%') · vaTitle('부가가치 몫') */
ECOM.parts.mfvalue = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.stages || []).slice(0, 5), n = st.length, GAP = 8, avail = 1168 - (n - 1) * GAP, tv = st.reduce(function (a, o) { return a + o.va }, 0), unit = s.unit || '%';
  var cnt = {}, order = []; st.forEach(function (q) { q.shares.forEach(function (a) { if (!(a.name in cnt)) { cnt[a.name] = 0; order.push(a.name) } cnt[a.name] += a.value }) });
  var REST = { '그 밖': 1, '기타': 1 }, PAL = [C.main, C.dark, C.g65, C.g40, C.cmp], cm = s.colors || {}, pi = 0, cc = {};
  order.slice().sort(function (a, b) { return cnt[b] - cnt[a] }).forEach(function (nm) { cc[nm] = cm[nm] ? M.tone(cm[nm]) : REST[nm] ? C.light : (PAL[pi++] || C.gray) });
  var x = 0, BY = 128, BH = 276;
  st.forEach(function (o, i) { var w = avail * o.va / tv, t0 = 100 + i * 220, g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 360 });
    chev(g, x, 16, w + (i < n - 1 ? 8 : 0), 64, i === s.neckAt ? C.dark : C.main, i === 0);
    var tw = w - 44, tx = x + w / 2 + (i ? 6 : -4); M.t(g, tx, 44, o.name, M.fit(o.name, 18, tw, 1, 13), { c: '#fff' }); if (o.sub) M.t(g, tx, 64, o.sub, M.fit(o.sub, 12.5, tw, 0, 11.5), { c: C.g18, b: 0 });
    var yy = BY; o.shares.forEach(function (a, j) { var hh = BH * a.value / 100, gb = h.at(svg, t0 + 250 + j * 70, { 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 420 }); M.rect(gb, x, yy, w, hh - 2, cc[a.name], { rx: 3 });
      if (hh >= 22 && w >= 90) { var dk = M.dark(cc[a.name]), txt = a.name + ' ' + h.nf(a.value, 0) + unit; M.t(h.at(svg, t0 + 700, { 'data-fx': 'fade' }), x + w / 2, yy + hh / 2 + 5, txt, M.fit(txt, 15, w - 12, 1, 11.5), { c: dk ? '#fff' : C.ink }) } yy += hh });
    var gv = h.at(svg, t0 + 800, { 'data-fx': 'rise' }); M.t(gv, x + w / 2, BY + BH + 34, h.nf(o.va, 0) + unit, 24, { c: C.dark }); x += w + GAP });
  var gl = h.at(svg, 1500, { 'data-fx': 'fade' }), lx = 0; M.t(gl, 0, 478, (s.vaTitle || '부가가치 몫') + ' = 칸 폭 · 칸 안 = 나라별 몫', 13, { a: 'start', c: C.mute, b: 0 });
  lx = 470; order.forEach(function (nm) { M.rect(gl, lx, 466, 14, 14, cc[nm], { rx: 3 }); M.t(gl, lx + 20, 479, nm, 14, { a: 'start', c: C.ink }); lx += 20 + h.textW(nm, 14, 1) + 30 });
};

/* ───────── mfneck — 병목 : 단계마다 관 두께 = 대안 여력(점유율이 클수록 가늘어짐), 병목 단계만 붉게 ─────────
   stages[3~6]{name,sub,share(숫자),neck} · shareLabel('상위 1개국 점유율') · neckChip('병목') */
ECOM.parts.mfneck = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.stages || []).slice(0, 6), n = st.length, w = 1168 / n, CY = 238, thick = function (p) { return 44 + (100 - p) * 2.3 };
  st.forEach(function (o, i) { var cx = i * w + w / 2, t = thick(o.share), neck = !!o.neck, t0 = 100 + i * 300, g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 380 }), bw = w - 56;
    M.t(g, cx, 30, o.name, 19, { c: C.ink }); if (o.sub) M.t(g, cx, 52, o.sub, 12.5, { c: C.mute, b: 0 });
    if (i < n - 1) { var nt = thick(st[i + 1].share), mh = Math.min(t, nt) * .45; M.rect(g, cx + bw / 2 - 2, CY - mh / 2, w - bw + 4, mh, C.g18, { rx: 0 }); E('path', { d: 'M' + (cx + w / 2 - 6) + ' ' + (CY - 11) + ' L' + (cx + w / 2 + 9) + ' ' + CY + ' L' + (cx + w / 2 - 6) + ' ' + (CY + 11) + ' Z', fill: C.g65 }, g) }
    var gb = h.at(svg, t0 + 150, { 'data-fx': 'grow', 'data-o': '50% 50%', 'data-ms': 560 }); M.rect(gb, cx - bw / 2, CY - t / 2, bw, t, neck ? C.warn : C.main, { rx: 18 });
    var gt = h.at(svg, t0 + 650, { 'data-fx': 'fade' }); M.t(gt, cx, CY + 13, h.nf(o.share, 0) + '%', 38, { c: '#fff' });
    if (neck) { var cwd = h.textW(s.neckChip || '병목', 13, 1) + 22, cy2 = CY + t / 2 + 34; E('rect', { x: cx - cwd / 2, y: cy2 - 13, width: cwd, height: 26, rx: 13, fill: C.warnsoft, stroke: C.warn, 'stroke-width': 2 }, gt); M.t(gt, cx, cy2 + 5, s.neckChip || '병목', 14, { c: C.warn }) } });
  var gl = h.at(svg, 1900, { 'data-fx': 'fade' }); M.t(gl, 0, 496, (s.shareLabel || '상위 1개국 점유율') + ' = 관 안 숫자 · 관 두께 = 대체 공급 여력(점유율이 클수록 가늘어짐)', 13, { a: 'start', c: C.mute, b: 0 });
};

/* ───────── mfdep — 의존도 고리 : 단계마다 특정국 의존 % 도넛 + 대체 공급처 ─────────
   stages[3~5]{name,sub,pct,value,alts} · who('가국') · line(경계 %, 기본 50) */
ECOM.parts.mfdep = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.stages || []).slice(0, 5), n = st.length, w = 1168 / n, R = 78, SW = 28, CY = 214, cr = 2 * Math.PI * R, ln = s.line == null ? 50 : s.line;
  st.forEach(function (o, i) { var cx = i * w + w / 2, bad = o.pct >= ln, col = bad ? C.warn : C.main, t0 = 100 + i * 360, g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 360 });
    M.t(g, cx, 34, o.name, 20, { c: C.ink }); if (o.sub) M.t(g, cx, 56, o.sub, 12.5, { c: C.mute, b: 0 });
    E('circle', { cx: cx, cy: CY, r: R, fill: 'none', stroke: C.light, 'stroke-width': SW }, g);
    E('circle', { cx: cx, cy: CY, r: R, fill: 'none', stroke: col, 'stroke-width': SW, 'stroke-dasharray': (cr * o.pct / 100) + ' ' + cr, transform: 'rotate(-90 ' + cx + ' ' + CY + ')', 'data-at': t0 + 150, 'data-fx': 'fade', 'data-ms': 700 }, svg);
    var gt = h.at(svg, t0 + 500, { 'data-fx': 'pop', 'data-ms': 360 }); M.t(gt, cx, CY + 14, h.nf(o.pct, 0) + '%', 42, { c: bad ? C.warn : C.dark });
    if (i < n - 1) { var x1 = cx + R + SW / 2 + 16, x2 = cx + w - R - SW / 2 - 16; Z.arr(svg, x1, CY, x2, CY, C.g40, 4, t0 + 300, { ms: 400 }) }
    var g2 = h.at(svg, t0 + 700, { 'data-fx': 'rise', 'data-ms': 400 }), cy2 = 352; Z.chip(g2, cx, cy2, o.alts || '', 14, { stroke: bad ? C.warn : C.g65, sw: 2, color: bad ? C.warn : C.dark });
    if (o.value) M.t(g2, cx, cy2 + 40, o.value, 15, { c: C.ink, b: 0 }) });
  var gl = h.at(svg, 2100, { 'data-fx': 'fade' }); M.t(gl, 0, 498, '도넛 칠한 몫 = ' + (s.who || '가국') + '에 기댄 비율 · 주황 = ' + ln + '% 넘는 단계', 13, { a: 'start', c: C.mute, b: 0 });
};

/* ───────── mfzig — 국경 왕복 : 나라 세 칸 위를 오가는 경로(위에서 아래로 시간 순) ─────────
   lanes[2~3]{name,sub} · steps[3~7]{lane,text,sub} · crossWord('국경') */
ECOM.parts.mfzig = function (bd, s, ctx) {
  var svg = ctx.svg(512), ln = (s.lanes || []).slice(0, 3), nl = ln.length, LW = (1168 - (nl - 1) * 4) / nl, st = (s.steps || []).slice(0, 7), n = st.length, Y0 = 108, DY = Math.min(62, (452 - Y0) / Math.max(1, n - 1)), cx = function (l) { return l * (LW + 4) + LW / 2 };
  ln.forEach(function (o, i) { var g = h.at(svg, 50, { 'data-fx': 'fade', 'data-ms': 300 }); M.rect(g, i * (LW + 4), 4, LW, 504, i % 2 ? C.paper : C.g08, { rx: 12 }); M.t(g, cx(i), 38, o.name, 21, { c: C.dark }); if (o.sub) M.t(g, cx(i), 60, o.sub, 12.5, { c: C.mute, b: 0 }) });
  var cross = 0, pts = st.map(function (o, i) { return [cx(o.lane), Y0 + i * DY] });
  for (var i = 1; i < n; i++) { var a = pts[i - 1], b = pts[i], t = 300 + i * 520, d = 'M' + a[0] + ' ' + a[1] + ' L' + a[0] + ' ' + b[1] + ' L' + b[0] + ' ' + b[1];
    E('path', { d: d, fill: 'none', stroke: C.main, 'stroke-width': 4, 'stroke-linejoin': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 460 }, svg);
    var dl = st[i].lane - st[i - 1].lane; if (dl) { var dir = dl > 0 ? 1 : -1; for (var l = st[i - 1].lane; l !== st[i].lane; l += dir) { cross++; var bx = (dir > 0 ? (l + 1) * (LW + 4) - 2 : l * (LW + 4) - 2), gc = h.at(svg, t + 380, { 'data-fx': 'pop', 'data-ms': 260 });
      Z.chip(gc, bx, b[1], (s.crossWord || '국경') + ' ' + cross + '회', 12.5, { stroke: C.main, sw: 1.8, color: C.dark }) } } }
  st.forEach(function (o, i) { var p = pts[i], g = h.at(svg, 200 + i * 520, { 'data-fx': 'pop', 'data-ms': 320 });
    E('circle', { cx: p[0], cy: p[1], r: 15, fill: C.dark, stroke: '#fff', 'stroke-width': 2.5 }, g); M.t(g, p[0], p[1] + 5.5, String(i + 1), 15, { c: '#fff' });
    M.t(g, p[0] + 24, p[1] + 22, o.text, 15.5, { a: 'start', c: C.ink }); if (o.sub) M.t(g, p[0] + 24, p[1] + 38, o.sub, 12, { a: 'start', c: C.mute, b: 0 }) });
};

/* ───────── mfbom — 원료 → 제품 갈래 : 층(광물 · 소재 · 부품 · 완제품)마다 상자, 상자 사이 곡선 ─────────
   tiers[3~5]{name,items:[{id,name,tag}]} · edges[[from,to]] · hi[[from,to]](굵은 짙은 선) */
ECOM.parts.mfbom = function (bd, s, ctx) {
  var svg = ctx.svg(512), tr = (s.tiers || []).slice(0, 5), n = tr.length, NW = 188, NH = 60, X0 = 0, XS = (1168 - NW) / (n - 1), pos = {};
  tr.forEach(function (t, i) { var k = t.items.length, x = X0 + i * XS, g = h.at(svg, 50 + i * 120, { 'data-fx': 'fade', 'data-ms': 360 });
    Z.chip(g, x + NW / 2, 20, t.name, 15, { fill: C.g08, stroke: C.g65, sw: 1.6, color: C.dark, min: 100 });
    t.items.forEach(function (o, j) { var y = 56 + (446 / k) * (j + .5) - NH / 2; pos[o.id] = { x: x, y: y, i: i, o: o } }) });
  function ed(a, b, hi, t) { var A = pos[a], B = pos[b]; if (!A || !B) return; var x1 = A.x + NW, y1 = A.y + NH / 2, x2 = B.x, y2 = B.y + NH / 2, c = (x1 + x2) / 2;
    E('path', { d: 'M' + x1 + ' ' + y1 + ' C' + c + ' ' + y1 + ', ' + c + ' ' + y2 + ', ' + x2 + ' ' + y2, fill: 'none', stroke: hi ? C.dark : C.g40, 'stroke-width': hi ? 4.5 : 2, opacity: hi ? 1 : .9, 'data-at': t, 'data-fx': 'draw', 'data-ms': 600 }, svg) }
  var hs = {}; (s.hi || []).forEach(function (e) { hs[e[0] + '>' + e[1]] = 1 });
  (s.edges || []).forEach(function (e, k) { if (!hs[e[0] + '>' + e[1]]) ed(e[0], e[1], 0, 400 + pos[e[0]].i * 500 + k * 40) });
  (s.edges || []).forEach(function (e, k) { if (hs[e[0] + '>' + e[1]]) ed(e[0], e[1], 1, 600 + pos[e[0]].i * 500 + k * 40) });
  Object.keys(pos).forEach(function (id) { var p = pos[id], o = p.o, g = h.at(svg, 200 + p.i * 500, { 'data-fx': 'pop', 'data-ms': 320 }), crit = !!o.crit; Z.box(g, p.x, p.y, NW, NH, { fill: crit ? C.dark : '#fff', stroke: crit ? 'none' : C.main, sw: 2.2, rx: 12 });
    M.t(g, p.x + NW / 2, p.y + (o.tag ? 25 : 36), o.name, M.fit(o.name, 17, NW - 16, 1, 13), { c: crit ? '#fff' : C.ink }); if (o.tag) M.t(g, p.x + NW / 2, p.y + 46, o.tag, M.fit(o.tag, 13, NW - 16, 0, 11.5), { c: crit ? '#CDE9DD' : C.mute, b: 0 }) });
};

/* ───────── mfsmap — 공급망 지도 : 익명 나라(덩어리 모양) 위에 단계 번호가 이어짐 ─────────
   lands[2~4]{name,slot:0~3} · steps[3~7]{land(번호),text,sub} */
ECOM.parts.mfsmap = function (bd, s, ctx) {
  var svg = ctx.svg(512), ln = (s.lands || []).slice(0, 4), st = (s.steps || []).slice(0, 7);
  var SL = [[250, 168, 232, 132, 1], [870, 126, 226, 100, 4], [610, 372, 270, 112, 7], [150, 398, 150, 86, 2]];
  function blob(cx, cy, rx, ry, sd) { var P = []; for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6, f = 1 + .13 * Math.sin(3 * a + sd) + .09 * Math.cos(5 * a + sd * 2); P.push([cx + rx * f * Math.cos(a), cy + ry * f * Math.sin(a)]) }
    var d = 'M' + P[0][0] + ' ' + P[0][1]; for (var i = 0; i < 12; i++) { var p0 = P[(i + 11) % 12], p1 = P[i], p2 = P[(i + 1) % 12], p3 = P[(i + 2) % 12]; d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6) + ',' + (p2[0] - (p3[0] - p1[0]) / 6) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6) + ',' + p2[0] + ' ' + p2[1] } return d + ' Z' }
  var cnt = {}, idx = {}; st.forEach(function (o) { cnt[o.land] = (cnt[o.land] || 0) + 1 });
  ln.forEach(function (o, i) { var q = SL[o.slot == null ? i : o.slot], g = h.at(svg, 50 + i * 120, { 'data-fx': 'fade', 'data-ms': 500 });
    E('path', { d: blob(q[0], q[1], q[2], q[3], q[4]), fill: i === (s.hiLand == null ? -1 : s.hiLand) ? C.g18 : C.g08, stroke: C.g40, 'stroke-width': 2.4 }, g); o._q = q; M.t(g, q[0] - q[2] + 22, q[1] - q[3] + 30, o.name, 18, { a: 'start', c: C.dark }) });
  var pts = st.map(function (o, i) { var L = ln[o.land]._q, c = cnt[o.land], j = idx[o.land] = (idx[o.land] == null ? 0 : idx[o.land] + 1), dy = (j - (c - 1) / 2) * 50; return [L[0] - 60, L[1] + dy + 8] });
  for (var i = 1; i < st.length; i++) { var a = pts[i - 1], b = pts[i], same = st[i].land === st[i - 1].land, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, bend = same ? 0 : 46, qx = mx - dy / L * bend, qy = my + dx / L * bend, t = 400 + i * 560;
    var sx = a[0] + (qx - a[0]) / Math.sqrt(Math.pow(qx - a[0], 2) + Math.pow(qy - a[1], 2)) * 20, sy = a[1] + (qy - a[1]) / Math.sqrt(Math.pow(qx - a[0], 2) + Math.pow(qy - a[1], 2)) * 20, ex = b[0] - (b[0] - qx) / Math.sqrt(Math.pow(b[0] - qx, 2) + Math.pow(b[1] - qy, 2)) * 22, ey = b[1] - (b[1] - qy) / Math.sqrt(Math.pow(b[0] - qx, 2) + Math.pow(b[1] - qy, 2)) * 22;
    E('path', { d: 'M' + sx + ' ' + sy + ' Q' + qx + ' ' + qy + ' ' + ex + ' ' + ey, fill: 'none', stroke: same ? C.g65 : C.dark, 'stroke-width': same ? 3 : 4.5, 'stroke-dasharray': same ? '2 7' : null, 'stroke-linecap': 'round', 'data-at': t, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    ECOM.kx.head(svg, b[0] - (b[0] - qx) / Math.sqrt(Math.pow(b[0] - qx, 2) + Math.pow(b[1] - qy, 2)) * 17, b[1] - (b[1] - qy) / Math.sqrt(Math.pow(b[0] - qx, 2) + Math.pow(b[1] - qy, 2)) * 17, Math.atan2(b[1] - qy, b[0] - qx), same ? C.g65 : C.dark, 12, { 'data-at': t + 440, 'data-fx': 'fade', 'data-ms': 140 }) }
  st.forEach(function (o, i) { var p = pts[i], g = h.at(svg, 300 + i * 560, { 'data-fx': 'pop', 'data-ms': 320 }); E('circle', { cx: p[0], cy: p[1], r: 16, fill: C.dark, stroke: '#fff', 'stroke-width': 2.5 }, g); M.t(g, p[0], p[1] + 5.5, String(i + 1), 16, { c: '#fff' });
    var sx = 0; [i - 1, i + 1].forEach(function (k) { if (k >= 0 && k < pts.length) { var ddx = pts[k][0] - p[0], ddy = pts[k][1] - p[1], dd = Math.sqrt(ddx * ddx + ddy * ddy) || 1; sx += ddx / dd } });
    var left = sx > 0.15, tx = left ? p[0] - 26 : p[0] + 26, an = left ? 'end' : 'start'; M.t(g, tx, p[1] - 1, o.text, 16, { a: an, c: C.ink }); if (o.sub) M.t(g, tx, p[1] + 16, o.sub, 12.5, { a: an, c: C.mute, b: 0 }) });
};

/* ───────── mfvert — 수직 계열화 비교 : 단계 칸마다 기업이 직접 하는지 맡기는지 칠하기 ─────────
   stages[3~6]{name} · firms[2~3]{name,sub,cells:[{k:'own|out',t}]} · ownLabel('직접') · outLabel('외주') */
ECOM.parts.mfvert = function (bd, s, ctx) {
  var svg = ctx.svg(512), sg = (s.stages || []).slice(0, 6), n = sg.length, fm = (s.firms || []).slice(0, 3), LW = 200, CW = (1168 - LW) / n, RH = 150, RG = 16, Y0 = 90;
  var gh = h.at(svg, 50, { 'data-fx': 'fade', 'data-ms': 360 }); sg.forEach(function (o, i) { chev(gh, LW + i * CW, 14, CW + 4, 52, C.main, i === 0); M.t(gh, LW + i * CW + CW / 2 + (i ? 6 : -4), 46, o.name, M.fit(o.name, 17, CW - 44, 1, 13), { c: '#fff' }) });
  fm.forEach(function (f, r) { var y = Y0 + r * (RH + RG), t0 = 400 + r * 700, g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 380 }), own = f.cells.filter(function (c) { return c.k === 'own' }).length;
    M.rect(g, 0, y, LW - 14, RH, C.paper, { rx: 12 }); M.t(g, 18, y + 44, f.name, 21, { a: 'start', c: C.dark }); if (f.sub) M.t(g, 18, y + 68, f.sub, 12.5, { a: 'start', c: C.mute, b: 0 }); M.t(g, 18, y + 106, (s.ownLabel || '직접') + ' ' + own + ' / ' + n + '단계', 15, { a: 'start', c: C.ink });
    f.cells.forEach(function (c, i) { var x = LW + i * CW + 4, gc = h.at(svg, t0 + 200 + i * 110, { 'data-fx': 'pop', 'data-ms': 300 }), isOwn = c.k === 'own';
      if (isOwn) M.rect(gc, x, y, CW - 8, RH, C.main, { rx: 12 }); else M.rect(gc, x, y, CW - 8, RH, '#fff', { rx: 12, stroke: C.axis, sw: 2, dash: '6 5' });
      M.t(gc, x + (CW - 8) / 2, y + RH / 2 - 4, isOwn ? (s.ownLabel || '직접') : (s.outLabel || '외주'), 20, { c: isOwn ? '#fff' : C.mute }); if (c.t) M.t(gc, x + (CW - 8) / 2, y + RH / 2 + 22, c.t, M.fit(c.t, 13.5, CW - 24, 0, 11.5), { c: isOwn ? '#CDE9DD' : C.mute, b: 0 }) }) });
};

/* ───────── mfdays — 단계별 재고 · 걸리는 기간 : 표 + 같은 기준선 막대(짙은 = 가장 긴 단계) + 누적 일수 ─────────
   stages[3~6]{name,sub,stock,days} · unit('일') · totalLabel */
ECOM.parts.mfdays = function (bd, s, ctx) {
  var svg = ctx.svg(512), st = (s.stages || []).slice(0, 6), n = st.length, u = s.unit || '일', RH = Math.min(76, (410) / n), Y0 = 54, mxS = Math.max.apply(null, st.map(function (o) { return o.stock })), mxD = Math.max.apply(null, st.map(function (o) { return o.days })), cum = 0;
  var gh = h.at(svg, 50, { 'data-fx': 'fade' }), cx = { n: 0, s: 300, d: 560, c: 1168 };
  M.t(gh, cx.n, 30, '단계', 14, { a: 'start', c: C.mute }); M.t(gh, cx.s, 30, '재고 쌓아 두는 기간(' + u + ')', 14, { a: 'start', c: C.mute }); M.t(gh, cx.d, 30, '걸리는 기간(' + u + ')', 14, { a: 'start', c: C.mute }); M.t(gh, cx.c, 30, '누적(' + u + ')', 14, { a: 'end', c: C.mute });
  E('line', { x1: 0, y1: 42, x2: 1168, y2: 42, stroke: C.axis, 'stroke-width': 2 }, gh);
  var top = st.reduce(function (a, o, i) { return o.days > st[a].days ? i : a }, 0);
  st.forEach(function (o, i) { var y = Y0 + i * RH, t0 = 200 + i * 300, g = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 360 }); cum += o.days; var hi = i === top;
    if (i) E('line', { x1: 0, y1: y, x2: 1168, y2: y, stroke: C.line, 'stroke-width': 1 }, g);
    M.t(g, 0, y + RH / 2 - 2, o.name, 18, { a: 'start', c: C.ink }); if (o.sub) M.t(g, 0, y + RH / 2 + 16, o.sub, 12.5, { a: 'start', c: C.mute, b: 0 });
    var sw = 170 * o.stock / mxS; M.rect(g, cx.s, y + RH / 2 - 9, sw, 18, C.g40, { rx: 3 }); M.t(g, cx.s + sw + 8, y + RH / 2 + 5, o.stock + u, 15, { a: 'start', c: C.cmp, b: 0 });
    var gd = h.at(svg, t0 + 200, { 'data-fx': 'grow', 'data-o': '0% 50%', 'data-ms': 520 }), dw = 330 * o.days / mxD; M.rect(gd, cx.d, y + RH / 2 - 14, dw, 28, hi ? C.dark : C.main, { rx: 3 }); M.t(g, cx.d + dw + 10, y + RH / 2 + 6, o.days + u, 18, { a: 'start', c: hi ? C.dark : C.ink });
    M.t(g, cx.c, y + RH / 2 + 7, h.nf(cum, 0) + u, 22, { a: 'end', c: C.dark }) });
  var yT = Y0 + n * RH + 4, gt = h.at(svg, 1900, { 'data-fx': 'rise' }); E('line', { x1: 0, y1: yT, x2: 1168, y2: yT, stroke: C.ink, 'stroke-width': 2.4 }, gt); M.t(gt, 0, yT + 34, s.totalLabel || '합계', 20, { a: 'start', c: C.dark }); M.t(gt, cx.c, yT + 36, h.nf(cum, 0) + u, 30, { a: 'end', c: C.dark });
};
})();
