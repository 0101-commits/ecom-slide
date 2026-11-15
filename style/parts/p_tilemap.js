/* p_tilemap.js — 같은 크기 칸 지도(미국 50주+DC · 한국 17 시도). 지도 자료 없이 칸 배치가 파일 안에 있음.
   배치 us   : 미국 칸 지도 · 색 3~5단계(bands) 또는 갈래(cats) + 범례 · 오른쪽에 최고/최저 · 높은/낮은 순
   배치 kr   : 한국 시도 칸 지도 · 칸 안에 값 · 오른쪽에 같은 짜임
   배치 bars : 칸 안에 두 시점 막대(grid us|kr) · 오른쪽에 많이 오른/내린 곳
   칸: values{주 약칭 | 시도: 값(bars 는 [앞, 뒤])} · bands[경계 2~4개] · cats[{k,label}] + values{…:k} · unit · dec · key · labels[앞,뒤](bars)
       lists[왼 제목, 오른 제목] · cap(지표 이름) · 바탕 deep 이면 짙은 면 색표. 움직임 = 칸이 값 낮은 순으로 찍힘 → 오른쪽 숫자. 기본 DOM = 끝 모습 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, Cd = ECOM.Cd, E = h.E, T = h.T;
var US = [['AK', 0, 0], ['ME', 0, 10], ['WI', 1, 5], ['VT', 1, 9], ['NH', 1, 10], ['WA', 2, 0], ['ID', 2, 1], ['MT', 2, 2], ['ND', 2, 3], ['MN', 2, 4], ['IL', 2, 5], ['MI', 2, 6], ['NY', 2, 8], ['MA', 2, 9],
  ['OR', 3, 0], ['NV', 3, 1], ['WY', 3, 2], ['SD', 3, 3], ['IA', 3, 4], ['IN', 3, 5], ['OH', 3, 6], ['PA', 3, 7], ['NJ', 3, 8], ['CT', 3, 9], ['RI', 3, 10],
  ['CA', 4, 0], ['UT', 4, 1], ['CO', 4, 2], ['NE', 4, 3], ['MO', 4, 4], ['KY', 4, 5], ['WV', 4, 6], ['VA', 4, 7], ['MD', 4, 8], ['DE', 4, 9],
  ['AZ', 5, 1], ['NM', 5, 2], ['KS', 5, 3], ['AR', 5, 4], ['TN', 5, 5], ['NC', 5, 6], ['SC', 5, 7], ['DC', 5, 8],
  ['OK', 6, 3], ['LA', 6, 4], ['MS', 6, 5], ['AL', 6, 6], ['GA', 6, 7], ['HI', 7, 0], ['TX', 7, 3], ['FL', 7, 8]];
var USN = { AL: '앨라배마', AK: '알래스카', AZ: '애리조나', AR: '아칸소', CA: '캘리포니아', CO: '콜로라도', CT: '코네티컷', DE: '델라웨어', DC: '워싱턴DC', FL: '플로리다', GA: '조지아', HI: '하와이', ID: '아이다호', IL: '일리노이', IN: '인디애나', IA: '아이오와', KS: '캔자스', KY: '켄터키', LA: '루이지애나', ME: '메인', MD: '메릴랜드', MA: '매사추세츠', MI: '미시간', MN: '미네소타', MS: '미시시피', MO: '미주리', MT: '몬태나', NE: '네브래스카', NV: '네바다', NH: '뉴햄프셔', NJ: '뉴저지', NM: '뉴멕시코', NY: '뉴욕', NC: '노스캐롤라이나', ND: '노스다코타', OH: '오하이오', OK: '오클라호마', OR: '오리건', PA: '펜실베이니아', RI: '로드아일랜드', SC: '사우스캐롤라이나', SD: '사우스다코타', TN: '테네시', TX: '텍사스', UT: '유타', VT: '버몬트', VA: '버지니아', WA: '워싱턴', WV: '웨스트버지니아', WI: '위스콘신', WY: '와이오밍' };
var KR = [['인천', 0, 0], ['서울', 0, 1], ['경기', 0, 2], ['강원', 0, 3], ['충남', 1, 0], ['세종', 1, 1], ['충북', 1, 2], ['경북', 1, 3], ['전북', 2, 0], ['대전', 2, 1], ['대구', 2, 2], ['울산', 2, 3], ['전남', 3, 0], ['광주', 3, 1], ['경남', 3, 2], ['부산', 3, 3], ['제주', 4, 0]];
var RL = ['#E3F1EB', '#A9D6C4', '#4D9E83', '#00593D'], RD = ['#14503E', '#2A8A68', '#6FC29F', '#D3F5E4'];
var CATL = ['#005136', '#4D9E83', '#BFDDD0', '#F2C46B'], CATD = ['#D3F5E4', '#6FC29F', '#2A8A68', '#F2C46B'];
function hx(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }) }
function mix(a, b, t) { var A = hx(a), B = hx(b); return '#' + [0, 1, 2].map(function (j) { var v = Math.round(A[j] + (B[j] - A[j]) * t); return (v < 16 ? '0' : '') + v.toString(16) }).join('') }
function lum(c) { var a = hx(c); return (a[0] * 299 + a[1] * 587 + a[2] * 114) / 1000 }
function ramp(stops, k) { var o = []; for (var i = 0; i < k; i++) { var t = k === 1 ? 1 : i / (k - 1) * (stops.length - 1), j = Math.min(stops.length - 2, Math.floor(t)); o.push(mix(stops[j], stops[j + 1], t - j)) } return o }
function ink(bg, dk) { return lum(bg) > 150 ? '#1D2521' : '#FFFFFF' }

function build(bd, s, ctx, grid, mode) {
  var dk = ctx.dark, P = ctx.P, svg = ctx.svg(512), us = grid === 'us', cells = us ? US : KR, TS = us ? 54 : 86, GP = us ? 5 : 8;
  var V = s.values || {}, dec = s.dec == null ? 0 : s.dec, un = s.unit || '', bars = mode === 'bars', cats = s.cats && s.cats.length && !bars;
  var gx = 0, gy = 0, TW = (us ? 11 : 4) * (TS + GP) - GP, panelX = TW + (us ? 28 : 32), PW = 1168 - panelX;
  function nm(id) { return us ? (USN[id] || id) : id }
  function val(id) { var v = V[id]; return bars ? (v && v.length ? v : null) : (cats ? v : (v == null ? null : +v)) }
  var ids = cells.map(function (c) { return c[0] }).filter(function (id) { return val(id) != null });
  function score(id) { var v = val(id); return bars ? v[1] - v[0] : +v }
  /* 색 : 단계(bands) · 갈래(cats) */
  var bands = (s.bands || []).slice(0, 4), K = bands.length + 1, rc = ramp(dk ? RD : RL, K), cp = dk ? CATD : CATL;
  function cls(v) { var k = 0; while (k < bands.length && v >= bands[k]) k++; return k }
  function fillOf(id) { var v = val(id); if (v == null) return dk ? '#0B3D2E' : '#EEF3F0';
    if (bars) return dk ? '#0F4433' : '#F1F6F3';
    if (cats) { var i = s.cats.findIndex(function (c) { return c.k === v }); return (s.cats[i] && s.cats[i].c) || cp[Math.max(0, i) % cp.length] }
    return rc[cls(+v)] }
  var order = ids.slice().sort(function (a, b) { return score(a) - score(b) }), rank = {}; order.forEach(function (id, i) { rank[id] = i });
  var span = 1500, tAt = function (id) { return 400 + Math.round((rank[id] != null ? rank[id] : 0) * span / Math.max(1, ids.length)) };
  var mx = 0, own = s.scale === 'tile'; if (bars) ids.forEach(function (id) { mx = Math.max(mx, val(id)[0], val(id)[1]) });
  var fmt = function (v, o) { return h.nf(v, dec, o) + un };
  /* 칸 */
  cells.forEach(function (c) { var id = c[0], x = gx + c[2] * (TS + GP), y = gy + c[1] * (TS + GP), v = val(id), bg = fillOf(id), fg = v == null ? P.mute : (bars ? P.ink : ink(bg, dk));
    var g = E('g', { 'data-at': v == null ? 300 : tAt(id), 'data-fx': 'pop', 'data-ms': 380, 'data-key': nm(id) }, svg), isK = s.key === id;
    g.setAttribute('data-tip', [nm(id), v == null ? '자료 없음' : (bars ? ((s.labels || ['앞', '뒤'])[0] + ' ' + fmt(v[0]) + ' → ' + (s.labels || ['앞', '뒤'])[1] + ' ' + fmt(v[1])) : '값 ' + fmt(v)), v == null ? '' : '낮은 순 ' + ((rank[id] || 0) + 1) + ' / ' + ids.length].filter(Boolean).join('|'));
    E('rect', { x: x, y: y, width: TS, height: TS, rx: us ? 6 : 10, fill: bg, stroke: isK ? P.ink : (v == null ? P.line : (bars ? P.line : 'none')), 'stroke-width': isK ? 3 : 1 }, g);
    T(g, x + TS / 2, y + (us ? (bars ? 15 : 23) : 24), id, { 'text-anchor': 'middle', 'font-size': us ? (bars ? 12.5 : 15) : 17, 'font-weight': 700, fill: fg });
    if (v == null) return;
    if (bars) { var bw = us ? 15 : 28, base = y + TS - (us ? 6 : 8), mh = us ? 26 : 40, xs = [x + TS / 2 - bw - 2, x + TS / 2 + 2];
      [0, 1].forEach(function (j) { var hh = Math.max(2, mh * v[j] / (own ? Math.max(v[0], v[1]) : mx)); var r = E('rect', { x: xs[j], y: base - hh, width: bw, height: hh, rx: 2, fill: j ? P.main : P.g40, 'data-at': tAt(id) + 150, 'data-fx': 'grow', 'data-o': '50% 100%', 'data-ms': 450 }, svg);
        if (!us) T(g, xs[j] + bw / 2, base - hh - 4, h.nf(v[j], dec), { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: j ? P.ink : P.mute }) }) }
    else if (!cats) T(g, x + TS / 2, y + (us ? 42 : 62), h.nf(+v, dec), { 'text-anchor': 'middle', 'font-size': us ? 13 : 22, 'font-weight': us ? 600 : 800, fill: fg }) });
  /* 범례(칸 아래) */
  var lx = 0, ly = 486, lg = E('g', { 'data-at': 2000, 'data-fx': 'fade' }, svg);
  function chip(col, t, st) { E('rect', { x: lx, y: ly - 11, width: 18, height: 12, rx: 3, fill: col, stroke: st || 'none' }, lg); T(lg, lx + 24, ly, t, { 'font-size': 12.5, fill: P.sub }); lx += 24 + h.textW(t, 12.5) + 16 }
  if (bars) { var lb = s.labels || ['앞', '뒤']; chip(P.g40, lb[0]); chip(P.main, lb[1]); if (own) { T(lg, lx, ly, '막대 높이는 칸마다 따로 맞춤', { 'font-size': 12.5, fill: P.sub }); lx += h.textW('막대 높이는 칸마다 따로 맞춤', 12.5) + 16 } }
  else if (cats) s.cats.forEach(function (c, i) { chip(c.c || cp[i % cp.length], c.label) });
  else for (var i = 0; i < K; i++) chip(rc[i], i === 0 ? fmt(bands[0]) + ' 미만' : (i === K - 1 ? fmt(bands[K - 2]) + ' 이상' : fmt(bands[i - 1]) + '~' + fmt(bands[i])));
  if (s.key) { E('rect', { x: lx, y: ly - 11, width: 18, height: 12, rx: 3, fill: 'none', stroke: P.ink, 'stroke-width': 2.5 }, lg); T(lg, lx + 24, ly, '굵은 테두리 = ' + nm(s.key), { 'font-size': 12.5, fill: P.sub }) }
  /* 오른쪽 칸 */
  var px = panelX, gap = 12;
  function card(x, y, w, hh, k, name, big, sub, at) { var g = E('g', { 'data-at': at, 'data-fx': 'rise', 'data-key': name }, svg);
    E('rect', { x: x, y: y, width: w, height: hh, rx: 12, fill: dk ? Cd.g08 : '#fff', stroke: P.line }, g);
    T(g, x + 16, y + 26, k, { 'font-size': 13, 'font-weight': 700, fill: P.mute }); T(g, x + 16, y + 52, name, { 'font-size': 16, 'font-weight': 700, fill: P.ink });
    T(g, x + 16, y + 92, big, { 'font-size': 32, 'font-weight': 800, fill: P.main, 'letter-spacing': '-.02em' }); if (sub) T(g, x + 16 + h.textW(big, 32, 1) + 6, y + 92, sub, { 'font-size': 14, fill: P.mute }) }
  if (cats) {
    var y = 6; T(svg, px, y + 14, s.cap || '갈래별 칸 수', { 'font-size': 14, 'font-weight': 700, fill: P.main, 'data-at': 1900, 'data-fx': 'fade' }); y += 30;
    s.cats.forEach(function (c, i) { var mem = ids.filter(function (id) { return val(id) === c.k }), col = c.c || cp[i % cp.length], ln = h.wrap(mem.join('  '), 13.5, PW - 32), hh = 62 + ln.length * 20, g = E('g', { 'data-at': 1900 + i * 180, 'data-fx': 'rise', 'data-key': c.label }, svg);
      E('rect', { x: px, y: y, width: PW, height: hh, rx: 12, fill: dk ? Cd.g08 : '#fff', stroke: P.line }, g); E('rect', { x: px + 16, y: y + 16, width: 18, height: 12, rx: 3, fill: col, stroke: P.line }, g);
      T(g, px + 42, y + 28, c.label, { 'font-size': 16, 'font-weight': 700, fill: P.ink }); T(g, px + PW - 16, y + 30, mem.length + (us ? '개 주' : '곳'), { 'text-anchor': 'end', 'font-size': 22, 'font-weight': 800, fill: P.main });
      ln.forEach(function (t, j) { T(g, px + 16, y + 54 + j * 20, t, { 'font-size': 13.5, fill: P.sub }) }); y += hh + 10 }) }
  else if (ids.length) {
    var hi = order[order.length - 1], lo = order[0], cw = (PW - gap * 2) / 3, ck = s.key && val(s.key) != null ? s.key : null;
    var cl = s.cardLabels || (bars ? ['가장 크게 늘어난 곳', '가장 적게 늘어난 곳'] : ['가장 높은 곳', '가장 낮은 곳']), w1 = cl[0], w2 = cl[1];
    function disp(id) { return bars ? h.nf(score(id), dec, { sign: true }) : h.nf(score(id), dec) }
    card(px, 4, cw, 108, w1, nm(hi), disp(hi), un, 1900); card(px + cw + gap, 4, cw, 108, w2, nm(lo), disp(lo), un, 2000);
    if (ck) card(px + (cw + gap) * 2, 4, cw, 108, '강조한 곳', nm(ck), disp(ck), un, 2100);
    else { var avg = ids.reduce(function (a, id) { return a + score(id) }, 0) / ids.length; card(px + (cw + gap) * 2, 4, cw, 108, '칸 평균', ids.length + (us ? '개 주' : '곳'), h.nf(avg, dec + (dec ? 0 : 1), { sign: bars }), un, 2100) }
    var N = Math.min(8, Math.floor(ids.length / 2)), lw = (PW - 24) / 2, lt = s.lists || (bars ? ['많이 늘어난 순', '적게 늘어난 순'] : ['높은 순', '낮은 순']);
    var rows = [order.slice().reverse().slice(0, N), order.slice(0, N)];
    var vmax = Math.max.apply(null, ids.map(function (id) { return Math.abs(score(id)) })) || 1;
    rows.forEach(function (rw, c) { var x0 = px + c * (lw + 24); T(svg, x0, 140, lt[c] + ' ' + N + (us ? '개 주' : '곳'), { 'font-size': 14, 'font-weight': 700, fill: P.main, 'data-at': 2200, 'data-fx': 'fade' });
      E('line', { x1: x0, x2: x0 + lw, y1: 150, y2: 150, stroke: P.axis, 'data-at': 2200, 'data-fx': 'fade' }, svg);
      rw.forEach(function (id, i) { var y = 150 + i * 36, g = E('g', { 'data-at': 2300 + i * 70 + c * 120, 'data-fx': 'fade', 'data-key': nm(id) }, svg), bw = (lw - 8) * Math.abs(score(id)) / vmax;
        T(g, x0, y + 21, String(c ? ids.length - i : i + 1), { 'font-size': 12.5, fill: P.mute }); T(g, x0 + 24, y + 21, nm(id), { 'font-size': 14.5, 'font-weight': 700, fill: P.ink });
        T(g, x0 + lw, y + 21, disp(id) + (bars ? '' : un), { 'text-anchor': 'end', 'font-size': 14.5, 'font-weight': 700, fill: P.dark });
        E('rect', { x: x0, y: y + 27, width: lw, height: 4, rx: 2, fill: P.g08 }, g); E('rect', { x: x0, y: y + 27, width: Math.max(3, bw), height: 4, rx: 2, fill: c ? P.g65 : P.main }, g) }) }) }
}

ECOM.parts.tilemap = function (bd, s, ctx) {
  var L = s.layout, grid = L === 'us' ? 'us' : (L === 'kr' ? 'kr' : (s.grid === 'us' ? 'us' : 'kr'));
  build(bd, s, ctx, grid, L === 'bars' ? 'bars' : 'val');
  ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.tilemap.layouts = ['us', 'kr', 'bars'];
ECOM.parts.tilemap.dark = ['us', 'kr', 'bars'];
})();
