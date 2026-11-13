/* mptile — 타일 격자 지도. 칸 하나 = 지역 하나, 대략의 지리 자리에 놓음(경계 자료 없음).
   layout:'us'(미국 50주+DC) | 'cn'(중국 31개 성급) | 'kr'(한국 17개 시도) | 'world'(나라 육각, shape:'hex') 이거나 tiles[{id,label,c,r}] 직접
   groups[{label,tone:'main|dark|g65|g40|g18',ids:[id…]}] — 구분 칠(권역 · 묶음) · values{id:값} + unit · dec — 있으면 칸 안에 값을 적음
   ring[id…] 굵은 테두리 · round[id…] 동그란 칸 · marks[{shape:'sq|circle|ring',label}] 오른쪽 표시 설명 · groupKey(오른쪽 칸 제목) · countUnit(개수 단위, 기본 곳)
   움직임 : 칸이 묶음 순서로 튀어나옴 → 오른쪽 설명 칸 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function rows(str) { var o = []; str.split('|').forEach(function (line, r) { line.trim().split(/\s+/).forEach(function (tok) { if (!tok || tok === '.') return; var m = tok.split('@'); o.push({ id: m[0], label: m[0], c: +m[1], r: r }) }) }); return o }
var LAY = {
  us: rows('AK@0 ME@10|WI@5 VT@9 NH@10|WA@0 ID@1 MT@2 ND@3 MN@4 IL@5 MI@6 NY@8 MA@9|OR@0 NV@1 WY@2 SD@3 IA@4 IN@5 OH@6 PA@7 NJ@8 CT@9 RI@10|CA@0 UT@1 CO@2 NE@3 MO@4 KY@5 WV@6 VA@7 MD@8 DE@9|AZ@1 NM@2 KS@3 AR@4 TN@5 NC@6 SC@7 DC@8|OK@3 LA@4 MS@5 AL@6 GA@7|HI@0 TX@3 FL@8'),
  cn: rows('흑룡강@8|신강@1 내몽골@5 길림@8|청해@2 감숙@3 영하@4 산서@5 하북@6 북경@7 요녕@8|서장@1 섬서@4 하남@5 산동@6 천진@7|사천@3 중경@4 호북@5 안휘@6 강소@7|운남@3 귀주@4 호남@5 강서@6 상해@7|광서@4 광동@5 복건@6 절강@7|해남@5'),
  kr: rows('경기@2 강원@3|인천@1 서울@2|충남@1 세종@2 충북@3 경북@4|전북@1 대전@2 대구@3 울산@4|광주@1 경남@3 부산@4|전남@1|제주@0')
};
var FILL = { main: C.main, dark: C.dark, g65: C.g65, g40: C.g40, g18: C.g18, g08: C.g08, none: C.g08 }, LIGHT = { g40: 1, g18: 1, g08: 1, none: 1 };
function hexPath(cx, cy, R) { var d = ''; for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 30); d += (i ? 'L' : 'M') + (cx + R * Math.cos(a)).toFixed(1) + ' ' + (cy + R * Math.sin(a)).toFixed(1) } return d + 'Z' }
ECOM.parts.mptile = function (bd, s, ctx) {
  var root = ctx.root, svg = ctx.svg(512), tiles = (s.tiles || LAY[s.layout] || []).slice(), hex = s.shape === 'hex', gap = s.gap != null ? s.gap : 5;
  var groups = s.groups || [], gOf = {}; groups.forEach(function (g, gi) { (g.ids || []).forEach(function (id) { gOf[id] = gi }) });
  var vals = s.values || null, unit = s.unit || '', dec = s.dec != null ? s.dec : 0, ring = {}, round = {}; (s.ring || []).forEach(function (k) { ring[k] = 1 }); (s.round || []).forEach(function (k) { round[k] = 1 });
  var names = s.names || {};
  var cols = Math.max.apply(null, tiles.map(function (t) { return t.c })) + 1, nr = Math.max.apply(null, tiles.map(function (t) { return t.r })) + 1;
  var PW = 316, AX = 20, AW = 1168 - PW - 40 - AX, AH = 496, ts, gw, gh, ox, oy;
  if (hex) { var hw = Math.min(AW / (cols + .5), AH / (nr * .75 + .25) / 1.1547); ts = hw; gw = hw * (cols + .5); gh = hw * 1.1547 * (nr * .75 + .25) }
  else { ts = Math.floor(Math.min(AW / cols, AH / nr)); gw = ts * cols; gh = ts * nr }
  ox = AX + (AW - gw) / 2; oy = 8 + (AH - gh) / 2;
  /* 값 칠(groups 없을 때) */
  var bins = null, bcls = function () { return 0 }, STEPS = [C.g08, C.g18, C.g40, C.g65, C.dark];
  if (vals && !groups.length) { var vv = tiles.map(function (t) { return vals[t.id] }).filter(function (v) { return v != null }), lo = Math.min.apply(null, vv), hi = Math.max.apply(null, vv);
    bins = (s.bins || [0, 1, 2, 3, 4].map(function (i) { return lo + (hi - lo) * i / 5 })).slice(0, 5); bcls = function (v) { var c = 0; bins.forEach(function (b, i) { if (v >= b) c = i }); return c } }
  var order = tiles.map(function (t, i) { return { t: t, i: i, g: gOf[t.id] != null ? gOf[t.id] : 99 } }).sort(function (a, b) { return a.g - b.g || a.i - b.i });
  var counts = groups.map(function () { return 0 });
  order.forEach(function (o, k) { var t = o.t, gi = o.g, tone = gi < 99 ? groups[gi].tone || 'g65' : 'none', fill = FILL[tone] || C.g65, v = vals && vals[t.id];
    if (gi < 99) counts[gi]++; if (bins && v != null) { fill = STEPS[bcls(v)]; tone = bcls(v) < 3 ? 'g18' : 'dark' }
    var cx, cy, g = h.at(svg, 80 + k * (hex ? 26 : 16), { 'data-fx': 'pop', 'data-ms': 280 });
    if (hex) { cx = ox + ts * (t.c + .5 + (t.r % 2 ? .5 : 0)); cy = oy + ts * 1.1547 * (.5 + t.r * .75) ; E('path', { d: hexPath(cx, cy, ts * 0.577 - gap / 2 * .9), fill: fill, stroke: ring[t.id] ? C.ink : '#fff', 'stroke-width': ring[t.id] ? 3 : 1 }, g) }
    else { var x = ox + t.c * ts + gap / 2, y = oy + t.r * ts + gap / 2, sz = ts - gap; cx = x + sz / 2; cy = y + sz / 2;
      if (round[t.id]) E('circle', { cx: cx, cy: cy, r: sz / 2, fill: fill, stroke: ring[t.id] ? C.ink : 'none', 'stroke-width': 3 }, g);
      else E('rect', { x: x, y: y, width: sz, height: sz, rx: 9, fill: fill, stroke: ring[t.id] ? C.ink : 'none', 'stroke-width': 3 }, g) }
    var tc = LIGHT[tone] ? C.ink : '#fff', lab = names[t.id] || t.label, fs = s.fs || (lab.length > 2 && !/^[A-Z]+$/.test(lab) ? 13.5 : 15), hasV = v != null;
    T(g, cx, cy + (hasV ? -1 : 5), lab, { 'font-size': fs, 'font-weight': 700, fill: tc, 'text-anchor': 'middle' });
    if (hasV) T(g, cx, cy + 14, h.nf(v, dec) + unit, { 'font-size': 12.5, 'font-weight': 700, fill: tc, 'text-anchor': 'middle' }) });
  /* 오른쪽 설명 칸 */
  var px = 1168 - 20 - PW, py = oy, tEnd = 80 + order.length * 16 + 200, g2 = h.at(svg, tEnd, { 'data-fx': 'fade', 'data-ms': 400 }), y = py;
  var items = groups.length ? groups.map(function (g, i) { return { c: FILL[g.tone || 'g65'], t: g.label, n: counts[i] } }) : (bins ? bins.map(function (b, i) { return { c: STEPS[i], t: i < bins.length - 1 ? h.nf(b, dec) + '~' + h.nf(bins[i + 1], dec) + unit : h.nf(b, dec) + unit + ' 이상' } }) : []);
  var marks = s.marks || [], rh = Math.min(66, Math.floor((AH - 70 - (marks.length ? 40 + marks.length * 34 : 0)) / Math.max(items.length, 1))), bh = 52 + items.length * rh + (marks.length ? 34 + marks.length * 34 : 0);
  E('rect', { x: px, y: py, width: PW, height: bh, rx: 12, fill: '#fff', stroke: C.line }, g2);
  T(g2, px + 18, py + 30, s.groupKey || '구분', { 'font-size': 15, 'font-weight': 700, fill: C.ink });
  items.forEach(function (it, i) { var yy = py + 46 + i * rh;
    E('rect', { x: px + 18, y: yy + rh / 2 - 15, width: 30, height: 30, rx: 7, fill: it.c, stroke: it.c === C.g08 ? C.axis : 'none', 'stroke-width': .6 }, g2);
    T(g2, px + 60, yy + rh / 2 + 6, it.t, { 'font-size': 15, 'font-weight': 600, fill: C.ink });
    if (it.n != null) T(g2, px + PW - 18, yy + rh / 2 + 7, it.n + (s.countUnit || '곳'), { 'font-size': 18, 'font-weight': 700, fill: C.main, 'text-anchor': 'end' }) });
  if (marks.length) { var my = py + 46 + items.length * rh + 12; E('line', { x1: px + 18, x2: px + PW - 18, y1: my - 8, y2: my - 8, stroke: C.line }, g2);
    marks.forEach(function (m, i) { var yy = my + 14 + i * 34;
      if (m.shape === 'circle') E('circle', { cx: px + 33, cy: yy, r: 14, fill: C.g40 }, g2); else if (m.shape === 'ring') E('rect', { x: px + 19, y: yy - 14, width: 28, height: 28, rx: 7, fill: C.g40, stroke: C.ink, 'stroke-width': 3 }, g2); else E('rect', { x: px + 19, y: yy - 14, width: 28, height: 28, rx: 7, fill: C.g40 }, g2);
      T(g2, px + 60, yy + 5.5, m.label, { 'font-size': 14, 'font-weight': 600, fill: C.mute }) }) }
  root.setAttribute('data-gap', 300);
};
})();
