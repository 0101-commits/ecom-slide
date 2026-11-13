/* qt 계열(F14 인물 · 발언) 부품 8종 — 칸 설명은 style/SCHEMA4_F14.md
   qtcard 발언 카드 + 읽는 법 · qtmark 발언 시각 세로선 · qtscale 매파-비둘기 점 · qtnet 인물 관계도 · qtdiff 문장 나란히 비교 · qtcareer 경력 연표 · qtvote 표결 칸 · qtbubble 말풍선 타임라인 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size }
function box(p, x, y, w, hh, fill, o) { o = o || {}; var a = { x: x, y: y, width: w, height: hh, rx: o.rx == null ? 12 : o.rx, fill: fill }; if (o.stroke) { a.stroke = o.stroke; a['stroke-width'] = o.sw || 1.5; if (o.dash) a['stroke-dasharray'] = o.dash } return E('rect', a, p) }
function chip(p, cx, cy, text, fill, color, size) { size = size || 12.5; var w = h.textW(text, size, 1) + 22; E('rect', { x: cx - w / 2, y: cy - 12, width: w, height: 24, rx: 12, fill: fill }, p);
  T(p, cx, cy + 4.5, text, { 'text-anchor': 'middle', 'font-size': size, 'font-weight': 700, fill: color || '#fff' }); return w }
function lines(p, x, y, str, size, maxW, o) { o = o || {}; var L = h.wrap(str, size, maxW, o.bold), lh = o.lh || 1.4; L.forEach(function (l, i) { T(p, x, y + i * size * lh, l, { 'font-size': size, 'font-weight': o.bold ? 700 : 500, fill: o.fill || C.cmp, 'text-anchor': o.anchor || 'start' }) }); return L.length }
function rich(p, x, y, str, size, o) { o = o || {}; var a = { x: x, y: y, 'font-size': size, fill: o.fill || C.cmp, 'font-weight': o.w || 500 }; var t = E('text', a, p);
  String(str).split('**').forEach(function (s, i) { if (!s) return; var ts = E('tspan', i % 2 ? { 'font-weight': 700, fill: o.bold || C.dark } : {}, t); ts.textContent = s }); return t }
function tcol(t) { return t === 'warn' ? C.warn : t === 'gray' ? C.axis : t === 'dark' ? C.dark : t === 'g65' ? C.g65 : C.main }

/* ---------- qtcard ---------- */
ECOM.parts.qtcard = function (bd, s, ctx) {
  var q = s.quote || {}, rd = (s.reads || []).slice(0, 3), svg = ctx.svg(512), W1 = 690;
  var g = h.at(svg, 0, { 'data-fx': 'rise', 'data-ms': 500 });
  box(g, 0, 0, W1, 512, C.paper, { rx: 18 }); E('rect', { x: 0, y: 0, width: 10, height: 512, rx: 5, fill: C.main }, g);
  T(g, 48, 118, '“', { 'font-size': 110, 'font-weight': 700, fill: C.g18 });
  var L = h.wrap(String(q.text || '').split('**').join(''), 29, W1 - 130, 1), hl = (q.mark || ''), y0 = 168;
  L.forEach(function (l, i) { var tx = T(g, 78, y0 + i * 46, '', { 'font-size': 29, 'font-weight': 700, fill: C.ink });
    if (hl && l.indexOf(hl) >= 0) { var p = l.split(hl); tx.appendChild(document.createTextNode(p[0])); var ts = E('tspan', { fill: C.main }, tx); ts.textContent = hl; tx.appendChild(document.createTextNode(p.slice(1).join(hl))) } else tx.textContent = l });
  var ty = y0 + L.length * 46 + 14;
  E('line', { x1: 78, x2: W1 - 52, y1: ty, y2: ty, stroke: C.line, 'stroke-width': 1.5 }, g);
  chip(g, 78 + h.textW(q.who || '', 15, 1) / 2 + 11, ty + 40, q.who || '', C.dark, '#fff', 15);
  T(g, 78 + h.textW(q.who || '', 15, 1) + 36, ty + 45, q.ctx || '', { 'font-size': 14.5, fill: C.mute, 'font-weight': 500 });
  var tags = (q.tags || []), tx0 = 78; tags.forEach(function (t, i) { var w = h.textW(t, 13, 1) + 22; chip(g, tx0 + w / 2, ty + 100, t, C.g18, C.dark, 13); tx0 += w + 10 });
  /* 오른쪽 읽는 법 */
  var x1 = W1 + 24, w1 = 1168 - x1, hs = 130, gp = 14, gh = h.at(svg, 450, { 'data-fx': 'fade', 'data-ms': 300 });
  T(gh, x1 + 4, 24, s.readsTitle || '읽는 법', { 'font-size': 17, 'font-weight': 700, fill: C.ink });
  rd.forEach(function (r, i) { var y = 44 + i * (hs + gp), gr = h.at(svg, 650 + i * 420, { 'data-fx': 'rise', 'data-ms': 420 });
    box(gr, x1, y, w1, hs, '#fff', { rx: 14, stroke: C.line, sw: 1.5 }); box(gr, x1, y, w1, hs, 'none', { rx: 14 });
    E('circle', { cx: x1 + 34, cy: y + 38, r: 19, fill: r.tone === 'warn' ? C.warn : C.main }, gr); T(gr, x1 + 34, y + 45, String(i + 1), { 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: '#fff' });
    T(gr, x1 + 66, y + 34, r.k || '', { 'font-size': fit(r.k || '', 17, w1 - 84, 1, 13), 'font-weight': 700, fill: C.ink });
    T(gr, x1 + 66, y + 54, r.sig || '', { 'font-size': 13.5, 'font-weight': 700, fill: r.tone === 'warn' ? C.warn : C.main });
    lines(gr, x1 + 24, y + 88, r.t || '', 14.5, w1 - 44, { fill: C.cmp, lh: 1.38 }) });
};

/* ---------- qtmark ---------- */
ECOM.parts.qtmark = function (bd, s, ctx) {
  var ser = s.series || [], labels = s.labels || [], n = labels.length, at = s.at, svg = ctx.svg(512), x0 = 66, x1 = 1168 - 250, yT = 34, yB = 440;
  var all = []; ser.forEach(function (q) { all = all.concat(q.data) }); var e = h.ext(all), pad = (e[1] - e[0]) * .14, Y = h.lin(e[0] - pad, e[1] + pad, yB, yT), X = function (i) { return x0 + (x1 - x0) * i / (n - 1) };
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 }), xa = X(at);
  E('rect', { x: x0, y: yT - 8, width: xa - x0, height: yB - yT + 8, fill: C.g08 }, g0); E('rect', { x: xa, y: yT - 8, width: x1 - xa, height: yB - yT + 8, fill: '#fff', stroke: C.line }, g0);
  T(g0, x0 + 10, yT + 10, s.beforeText || '발언 전', { 'font-size': 13.5, 'font-weight': 700, fill: C.mute }); T(g0, xa + 12, yT + 10, s.afterText || '발언 후', { 'font-size': 13.5, 'font-weight': 700, fill: C.dark });
  var ticks = h.niceTicks(e[0] - pad, e[1] + pad, 5); for (var v = Math.ceil(ticks.lo / ticks.step - 1e-9) * ticks.step; v <= ticks.hi; v += ticks.step) { if (Y(v) < yT || Y(v) > yB) continue; E('line', { x1: x0, x2: x1, y1: Y(v), y2: Y(v), stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, x0 - 8, Y(v) + 4.5, h.nf(v, ticks.step < 1 ? 1 : 0), { 'text-anchor': 'end', 'font-size': 12.5, fill: C.mute }) }
  (s.xTicks || []).forEach(function (k) { T(g0, X(k), yB + 24, labels[k], { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }) });
  T(g0, 0, yT - 16, s.unit || '', { 'text-anchor': 'start', 'font-size': 12.5, 'font-weight': 700, fill: C.mute });
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'warn' : 'main')), d = 'M' + q.data.map(function (v, i) { return X(i).toFixed(1) + ' ' + Y(v).toFixed(1) }).join(' L');
    E('path', { d: d, fill: 'none', stroke: c, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-at': 300 + k * 500, 'data-fx': 'draw', 'data-ms': 1400 }, svg) });
  var gl = h.at(svg, 2300, { 'data-fx': 'drop', 'data-ms': 420 });
  E('line', { x1: xa, x2: xa, y1: yT - 8, y2: yB + 4, stroke: C.dark, 'stroke-width': 2.2, 'stroke-dasharray': '6 4' }, gl); chip(gl, xa, yB + 40, s.atText || '발언 시각', C.dark, '#fff', 13.5);
  ser.forEach(function (q, k) { var c = h.col(q.color || (k ? 'warn' : 'main')), gm = h.at(svg, 2700 + k * 350, { 'data-fx': 'pop', 'data-ms': 360 }), j = Math.min(n - 1, at + (s.span || 6));
    E('circle', { cx: xa, cy: Y(q.data[at]), r: 6, fill: '#fff', stroke: c, 'stroke-width': 3 }, gm); E('circle', { cx: X(j), cy: Y(q.data[j]), r: 6.5, fill: c }, gm);
    var ch = q.data[j] - q.data[at]; T(gm, X(j) + 12, Y(q.data[j]) + 5, (ch >= 0 ? '+' : '−') + h.nf(Math.abs(ch), 1) + (q.unit || ''), { 'font-size': 14, 'font-weight': 700, fill: c });
    /* 오른쪽 이름표 */
    var ly = 64 + k * 150, gc = h.at(svg, 3000 + k * 250, { 'data-fx': 'rise', 'data-ms': 380 }); box(gc, x1 + 70, ly, 1168 - x1 - 70, 126, C.paper, { rx: 14 });
    E('rect', { x: x1 + 70, y: ly, width: 8, height: 126, rx: 4, fill: c }, gc); T(gc, x1 + 94, ly + 30, q.name || '', { 'font-size': 15.5, 'font-weight': 700, fill: C.ink });
    T(gc, x1 + 94, ly + 68, (ch >= 0 ? '+' : '−') + h.nf(Math.abs(ch), 1) + (q.unit || ''), { 'font-size': 30, 'font-weight': 700, fill: c });
    T(gc, x1 + 94, ly + 96, q.sub || '', { 'font-size': 13.5, fill: C.mute, 'font-weight': 500 }); T(gc, x1 + 94, ly + 114, q.sub2 || '', { 'font-size': 12.5, fill: C.mute, 'font-weight': 500 }) });
};

/* ---------- qtscale ---------- */
ECOM.parts.qtscale = function (bd, s, ctx) {
  var ms = s.members || [], svg = ctx.svg(512), x0 = 90, x1 = 1078, X = function (v) { return x0 + (x1 - x0) * v }, ay = 270;
  var g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 400 });
  var zs = s.zones || [{ a: 0, b: .38, name: '매파', tone: 'warn' }, { a: .38, b: .62, name: '중립', tone: 'gray' }, { a: .62, b: 1, name: '비둘기', tone: 'main' }];
  zs.forEach(function (z) { var c = tcol(z.tone); E('rect', { x: X(z.a), y: 84, width: X(z.b) - X(z.a), height: 330, fill: c, opacity: .09 }, g0); T(g0, (X(z.a) + X(z.b)) / 2, 112, z.name, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: c }) });
  E('line', { x1: x0, x2: x1, y1: ay, y2: ay, stroke: C.axis, 'stroke-width': 3, 'stroke-linecap': 'round' }, g0);
  T(g0, x0, ay + 80 + 150, s.left || '금리 인상 쪽', { 'font-size': 13.5, fill: C.mute, 'font-weight': 600 }); T(g0, x1, ay + 80 + 150, s.right || '금리 인하 쪽', { 'text-anchor': 'end', 'font-size': 13.5, fill: C.mute, 'font-weight': 600 });
  var placed = [], R = 21; ms.forEach(function (m) { var cx = X(m.pos), k = 0, up = 1; m._x = cx; m._y = ay - 50; while (placed.some(function (p) { return Math.abs(p.x - cx) < R * 2 + 2 && Math.abs(p.y - m._y) < R * 2 + 2 })) { k++; m._y = ay - 50 - (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (R * 2 + 4) + (k % 2 ? 0 : 0); if (k > 8) break }
    placed.push({ x: cx, y: m._y }) });
  ms.forEach(function (m, i) { var gm = h.at(svg, 500 + i * 230, { 'data-fx': 'drop', 'data-ms': 420 }), c = m.pos < zs[0].b ? C.warn : m.pos > zs[2].a ? C.main : C.axis;
    if (m.prev != null && m.prev !== m.pos) { var px = X(m.prev), dir = m._x > px ? 1 : -1; E('circle', { cx: px, cy: ay, r: 8, fill: '#fff', stroke: C.axis, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, gm);
      E('line', { x1: px + dir * 10, x2: m._x - dir * 5, y1: ay, y2: ay, stroke: C.axis, 'stroke-width': 2 }, gm) }
    E('line', { x1: m._x, x2: m._x, y1: m._y + R, y2: ay, stroke: C.gray, 'stroke-width': 1.5 }, gm);
    E('circle', { cx: m._x, cy: ay, r: 5, fill: c }, gm);
    E('circle', { cx: m._x, cy: m._y, r: m.chair ? R + 4 : R, fill: m.chair ? C.dark : c }, gm); T(gm, m._x, m._y + 6, m.n, { 'text-anchor': 'middle', 'font-size': m.chair ? 17 : 16, 'font-weight': 700, fill: '#fff' });
    if (m.chair) T(gm, m._x, ay + 30, '의장', { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.dark }) });
  var md = s.median; if (md != null) { var gd = h.at(svg, 500 + ms.length * 230 + 200, { 'data-fx': 'fade', 'data-ms': 360 }); E('line', { x1: X(md), x2: X(md), y1: 126, y2: 414, stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, gd);
    chip(gd, X(md), 430, s.medianText || '중간값', C.dark, '#fff', 13) }
  var gs = h.at(svg, 500 + ms.length * 230 + 500, { 'data-fx': 'rise', 'data-ms': 400 }), cnt = s.counts || [], cw = (1168 - 6 * 12) / Math.max(1, cnt.length);
  cnt.forEach(function (c, i) { var x = i * (cw + 12), col = tcol(c.tone); box(gs, x, 456, cw, 54, '#fff', { rx: 12, stroke: C.line }); E('rect', { x: x, y: 456, width: 8, height: 54, rx: 4, fill: col }, gs);
    T(gs, x + 24, 490, c.label, { 'font-size': 15, 'font-weight': 700, fill: C.ink }); T(gs, x + cw - 18, 492, c.value, { 'text-anchor': 'end', 'font-size': 22, 'font-weight': 700, fill: col }) });
  if (s.moveText) { var gx = h.at(svg, 500 + ms.length * 230 + 300, { 'data-fx': 'fade', 'data-ms': 300 }); E('circle', { cx: 18, cy: 48, r: 8, fill: '#fff', stroke: C.axis, 'stroke-width': 2, 'stroke-dasharray': '3 2' }, gx); T(gx, 34, 53, s.moveText, { 'font-size': 13.5, fill: C.mute, 'font-weight': 600 }) }
};

/* ---------- qtnet ---------- */
ECOM.parts.qtnet = function (bd, s, ctx) {
  var ns = s.nodes || [], es = s.edges || [], svg = ctx.svg(512), M = {};
  ns.forEach(function (n) { n._x = n.x * 1168; n._y = 30 + n.y * 452; M[n.id] = n });
  var KIND = { power: { c: C.dark, d: '', w: 3.4 }, adv: { c: C.main, d: '', w: 2 }, tie: { c: C.axis, d: '5 4', w: 1.8 }, rival: { c: C.warn, d: '7 4', w: 2.2 } };
  var gE = h.at(svg, 300, { 'data-fx': 'fade', 'data-ms': 700 }), lab = [];
  es.forEach(function (e) { var a = M[e.from], b = M[e.to]; if (!a || !b) return; var K = KIND[e.kind || 'tie'], dx = b._x - a._x, dy = b._y - a._y, L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
    var ra = a.type === 'org' ? 62 : 40, rb = b.type === 'org' ? 62 : 40, ang = Math.abs(ux) > Math.abs(uy) ? 1 : 0;
    var sx = a._x + ux * (a.type === 'org' ? (Math.abs(ux) > .6 ? 78 : 40) : 40), sy = a._y + uy * (a.type === 'org' ? 34 : 40), ex = b._x - ux * (b.type === 'org' ? (Math.abs(ux) > .6 ? 82 : 44) : 44), ey = b._y - uy * (b.type === 'org' ? 38 : 44);
    var cx = (sx + ex) / 2 - uy * (e.bend || 0), cy = (sy + ey) / 2 + ux * (e.bend || 0);
    E('path', { d: 'M' + sx + ' ' + sy + ' Q' + cx + ' ' + cy + ' ' + ex + ' ' + ey, fill: 'none', stroke: K.c, 'stroke-width': K.w, 'stroke-dasharray': K.d || null }, gE);
    if (e.dir !== false) { var tx = ex - cx, ty = ey - cy, tl = Math.sqrt(tx * tx + ty * ty) || 1; tx /= tl; ty /= tl; E('path', { d: 'M' + (ex - 11 * tx + 6 * ty) + ' ' + (ey - 11 * ty - 6 * tx) + ' L' + ex + ' ' + ey + ' L' + (ex - 11 * tx - 6 * ty) + ' ' + (ey - 11 * ty + 6 * tx) + ' Z', fill: K.c }, gE) }
    lab.push({ x: .25 * sx + .5 * cx + .25 * ex, y: .25 * sy + .5 * cy + .25 * ey, t: e.text, c: K.c }) });
  var gL = h.at(svg, 900, { 'data-fx': 'fade', 'data-ms': 400 }); lab.forEach(function (l) { if (!l.t) return; var w = h.textW(l.t, 12.5, 1) + 14; E('rect', { x: l.x - w / 2, y: l.y - 11, width: w, height: 22, rx: 11, fill: '#fff', stroke: l.c, 'stroke-width': 1.3 }, gL); T(gL, l.x, l.y + 4.5, l.t, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: l.c }) });
  ns.forEach(function (n, i) { var g = h.at(svg, i * 150, { 'data-fx': 'pop', 'data-ms': 420 }), c = tcol(n.tone || (n.type === 'org' ? 'g65' : 'main'));
    if (n.type === 'org') { box(g, n._x - 78, n._y - 34, 156, 68, '#fff', { rx: 14, stroke: c, sw: 2.4 }); T(g, n._x, n._y - 3, n.name, { 'text-anchor': 'middle', 'font-size': fit(n.name, 16, 140, 1, 12.5), 'font-weight': 700, fill: C.ink }); T(g, n._x, n._y + 18, n.sub || '', { 'text-anchor': 'middle', 'font-size': fit(n.sub || '', 12.5, 140, 0, 11.5), fill: C.mute, 'font-weight': 500 }) }
    else { E('circle', { cx: n._x, cy: n._y, r: 38, fill: c }, g); T(g, n._x, n._y + 6, n.name, { 'text-anchor': 'middle', 'font-size': fit(n.name, 17, 66, 1, 13), 'font-weight': 700, fill: '#fff' }); T(g, n._x, n._y + 58, n.sub || '', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute, 'font-weight': 600 }) } });
  var gk = h.at(svg, 1500, { 'data-fx': 'fade', 'data-ms': 360 }), ky = [['power', s.legend && s.legend.power || '지명 · 임명'], ['adv', s.legend && s.legend.adv || '자문 · 보고'], ['tie', s.legend && s.legend.tie || '인맥 · 같은 출신'], ['rival', s.legend && s.legend.rival || '견해 대립']], lx = 0;
  ky.forEach(function (k) { var K = KIND[k[0]]; if (!es.some(function (e) { return (e.kind || 'tie') === k[0] })) return; E('line', { x1: lx, x2: lx + 34, y1: 500, y2: 500, stroke: K.c, 'stroke-width': K.w, 'stroke-dasharray': K.d || null }, gk); T(gk, lx + 42, 505, k[1], { 'font-size': 13, fill: C.mute, 'font-weight': 600 }); lx += 62 + h.textW(k[1], 13, 1) + 16 });
};

/* ---------- qtdiff ---------- */
(function () { if (document.getElementById('qt-diff-css')) return; var st = document.createElement('style'); st.id = 'qt-diff-css';
  st.textContent = ['.qd-c{position:absolute;top:0;box-sizing:border-box;border-radius:16px;padding:64px 28px 20px;font-size:22px;line-height:1.85;color:var(--ink);font-weight:500}',
    '.qd-h{position:absolute;left:24px;top:18px;font-size:15px;font-weight:700;padding:5px 14px;border-radius:15px}',
    '.qd-c .d{background:#F6EDE8;color:#B4461E;text-decoration:line-through;text-decoration-thickness:1.5px;border-radius:4px;padding:1px 3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.qd-c .a{background:var(--g18);color:var(--gdk);font-weight:700;border-radius:4px;padding:1px 3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.qd-c .k{color:#6B7570}.qd-c p{margin:0 0 6px}'].join(''); document.head.appendChild(st) })();
function dr(t) { return h.esc(t).replace(/~~(.+?)~~/g, '<span class="d">$1</span>').replace(/\+\+(.+?)\+\+/g, '<span class="a">$1</span>') }
ECOM.parts.qtdiff = function (bd, s, ctx) {
  var W = 548, A = s.old || {}, B = s.new || {}, hh = 392, rows = [[A, 0], [B, 620]];
  rows.forEach(function (r, i) { var d = r[0], c = h.H('div', 'qd-c', '<div class="qd-h" style="background:' + (i ? 'var(--main)' : '#DDE3E0') + ';color:' + (i ? '#fff' : '#3E4743') + '">' + h.esc(d.title || '') + '</div>'
      + (d.paras || []).map(function (p) { return '<p>' + dr(p) + '</p>' }).join(''), bd, 'left:' + r[1] + 'px;width:' + W + 'px;height:' + hh + 'px;background:' + (i ? '#fff' : 'var(--paper)') + ';border:' + (i ? '2px solid var(--main)' : '1.5px solid #DDE3E0'));
    c.setAttribute('data-at', 150 + i * 500); c.setAttribute('data-fx', 'rise'); c.setAttribute('data-ms', 480) });
  var svg = ctx.svg(512), g = h.at(svg, 1200, { 'data-fx': 'pop', 'data-ms': 360 }); E('circle', { cx: 584, cy: 196, r: 22, fill: C.main }, g); E('path', { d: 'M575 186 L592 196 L575 206', fill: 'none', stroke: '#fff', 'stroke-width': 3 }, g);
  var all = (A.paras || []).concat(B.paras || []).join(' '), nd = (all.match(/~~/g) || []).length / 2, na = (all.match(/\+\+/g) || []).length / 2, st = s.stats || [{ label: '지운 말', value: nd + '곳', tone: 'warn' }, { label: '더한 말', value: na + '곳', tone: 'main' }, { label: '그대로', value: s.keep || '', tone: 'gray' }];
  var gs = h.at(svg, 1500, { 'data-fx': 'rise', 'data-ms': 420 }), cw = 1168 / st.length - 12; st.forEach(function (c, i) { var x = i * (cw + 12 * st.length / (st.length)) + i * 0, col = tcol(c.tone); x = i * (1168 + 12) / st.length; box(gs, x, 418, cw, 94, '#fff', { rx: 14, stroke: C.line });
    E('rect', { x: x, y: 418, width: 8, height: 94, rx: 4, fill: col }, gs); T(gs, x + 28, 452, c.label, { 'font-size': 15, 'font-weight': 700, fill: C.mute }); T(gs, x + 28, 494, c.value, { 'font-size': 30, 'font-weight': 700, fill: col }); if (c.sub) T(gs, x + cw - 18, 494, c.sub, { 'text-anchor': 'end', 'font-size': 13.5, fill: C.mute, 'font-weight': 500 }) });
};

/* ---------- qtcareer ---------- */
ECOM.parts.qtcareer = function (bd, s, ctx) {
  var y0 = s.from, y1 = s.to, lanes = s.lanes || [], dec = s.decisions || [], svg = ctx.svg(512), x0 = 150, x1 = 1150, X = function (y) { return x0 + (x1 - x0) * (y - y0) / (y1 - y0) }, top = 150, lh = 84, g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  var by = top + lanes.length * lh + 6;
  for (var y = Math.ceil(y0 / 5) * 5; y <= y1; y += 5) { E('line', { x1: X(y), x2: X(y), y1: top - 8, y2: by, stroke: C.grid, 'stroke-dasharray': '3 4' }, g0); T(g0, X(y), by + 24, String(y), { 'text-anchor': 'middle', 'font-size': 13, fill: C.mute, 'font-weight': 600 }) }
  E('line', { x1: x0, x2: x1, y1: by, y2: by, stroke: C.axis, 'stroke-width': 1.5 }, g0);
  lanes.forEach(function (ln, i) { var cy = top + i * lh + lh / 2; E('rect', { x: 0, y: top + i * lh + 3, width: 1168, height: lh - 6, rx: 10, fill: i % 2 ? '#fff' : C.paper, opacity: .8 }, g0); T(g0, 14, cy + 5, ln.name, { 'font-size': 15, 'font-weight': 700, fill: C.ink });
    (ln.bars || []).forEach(function (b, k) { var gb = h.at(svg, 400 + i * 300 + k * 160, { 'data-fx': 'growx', 'data-ms': 520 }), xa = X(b.from), xb = X(b.to), c = tcol(b.tone || (i === 0 ? 'main' : i === 1 ? 'g65' : 'dark'));
      E('rect', { x: xa, y: cy - 20, width: xb - xa - 3, height: 40, rx: 8, fill: c }, gb); var lt = b.label || '', w = xb - xa - 18; T(gb, xa + 10, cy - 2, lt, { 'font-size': fit(lt, 14.5, w, 1, 11.5), 'font-weight': 700, fill: '#fff' }); T(gb, xa + 10, cy + 14, b.sub || '', { 'font-size': fit(b.sub || '', 12, w, 0, 11.5), fill: '#fff', opacity: .92, 'font-weight': 500 }) }) });
  dec.forEach(function (d, i) { var x = X(d.at), gd = h.at(svg, 1700 + i * 380, { 'data-fx': 'drop', 'data-ms': 420 }), w = Math.min(176, 20 + h.textW(d.text, 13.5, 1)), lx = Math.max(w / 2 + 4, Math.min(1168 - w / 2 - 4, x)), yy = 14 + (i % 2) * 66;
    E('line', { x1: x, x2: x, y1: yy + 44, y2: by, stroke: C.warn, 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, gd); box(gd, lx - w / 2, yy, w, 44, '#fff', { rx: 10, stroke: C.warn, sw: 1.8 });
    T(gd, lx, yy + 18, d.year || '', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: C.warn }); T(gd, lx, yy + 36, d.text, { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: C.ink });
    E('path', { d: 'M' + x + ' ' + (by - 2) + ' l-7 -12 l14 0 z', fill: C.warn }, gd) });
};

/* ---------- qtvote ---------- */
ECOM.parts.qtvote = function (bd, s, ctx) {
  var cols = s.cols || [], rows = s.rows || [], svg = ctx.svg(512), nx = 250, cw = (1168 - nx - 190) / cols.length, hy = 62, rh = Math.min(50, (512 - hy - 96) / rows.length), g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 360 });
  var KD = { y: ['찬성', C.main, '#fff'], n: ['반대', C.warn, '#fff'], a: ['기권', C.gray, C.cmp] };
  T(g0, 10, 40, s.nameTitle || '위원', { 'font-size': 14, 'font-weight': 700, fill: C.mute });
  cols.forEach(function (c, j) { var cx = nx + cw * (j + .5); T(g0, cx, 30, c.d, { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: C.ink }); T(g0, cx, 50, c.t || '', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute, 'font-weight': 500 }) });
  T(g0, 1168 - 95, 40, s.sumTitle || '반대 · 기권', { 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: C.mute });
  rows.forEach(function (r, i) { var y = hy + i * rh, g = h.at(svg, 250 + i * 190, { 'data-fx': 'rise', 'data-ms': 380 }), dis = r.votes.filter(function (v) { return v !== 'y' }).length;
    box(g, 0, y, 1168, rh - 6, i % 2 ? '#fff' : C.paper, { rx: 10 }); T(g, 16, y + (rh - 6) / 2 + 5.5, r.name, { 'font-size': 16, 'font-weight': 700, fill: C.ink }); T(g, 16 + h.textW(r.name, 16, 1) + 10, y + (rh - 6) / 2 + 5, r.sub || '', { 'font-size': 12.5, fill: C.mute, 'font-weight': 500 });
    r.votes.forEach(function (v, j) { var K = KD[v], cx = nx + cw * (j + .5), w = Math.min(cw - 14, 92); box(g, cx - w / 2, y + 5, w, rh - 16, K[1], { rx: (rh - 16) / 2 }); T(g, cx, y + (rh - 6) / 2 + 5, K[0], { 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: K[2] }) });
    T(g, 1168 - 95, y + (rh - 6) / 2 + 6, dis ? dis + '회' : '—', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: dis ? C.warn : C.axis }) });
  var gt = h.at(svg, 250 + rows.length * 190 + 250, { 'data-fx': 'rise', 'data-ms': 420 }), ty = hy + rows.length * rh + 4; box(gt, 0, ty, 1168, 56, C.dark, { rx: 12 }); T(gt, 16, ty + 35, s.resultTitle || '결과(찬 : 반 : 기권)', { 'font-size': 15, 'font-weight': 700, fill: '#fff' });
  cols.forEach(function (c, j) { var cnt = { y: 0, n: 0, a: 0 }; rows.forEach(function (r) { cnt[r.votes[j]]++ }); var cx = nx + cw * (j + .5); T(gt, cx, ty + 35, cnt.y + ' : ' + cnt.n + ' : ' + cnt.a, { 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: cnt.n + cnt.a ? C.on : '#fff' }) });
};

/* ---------- qtbubble ---------- */
ECOM.parts.qtbubble = function (bd, s, ctx) {
  var it = s.items || [], n = it.length, svg = ctx.svg(512), ay = 256, bw = Math.min(330, 1168 / n * 1.45), step = (1168 - bw) / (n - 1), g0 = h.at(svg, 0, { 'data-fx': 'fade', 'data-ms': 300 });
  E('line', { x1: 0, x2: 1168, y1: ay, y2: ay, stroke: C.axis, 'stroke-width': 3 }, g0);
  it.forEach(function (d, i) { var cx = bw / 2 + step * i, up = i % 2 === 0, g = h.at(svg, 300 + i * 520, { 'data-fx': 'pop', 'data-ms': 480 }), c = tcol(d.tone), bh = 176, by = up ? ay - 40 - bh : ay + 40, bx = Math.max(0, Math.min(1168 - bw, cx - bw / 2));
    E('circle', { cx: cx, cy: ay, r: 9, fill: '#fff', stroke: c, 'stroke-width': 4 }, g);
    E('path', { d: up ? 'M' + (cx - 11) + ' ' + (by + bh - 1) + ' L' + cx + ' ' + (ay - 12) + ' L' + (cx + 11) + ' ' + (by + bh - 1) + ' Z' : 'M' + (cx - 11) + ' ' + (by + 1) + ' L' + cx + ' ' + (ay + 12) + ' L' + (cx + 11) + ' ' + (by + 1) + ' Z', fill: c === C.main ? C.g08 : '#fff', stroke: c, 'stroke-width': 2 }, g);
    E('rect', { x: bx, y: by, width: bw, height: bh, rx: 18, fill: d.tone === 'main' || !d.tone ? C.g08 : '#fff', stroke: c, 'stroke-width': 2 }, g);
    E('path', { d: 'M' + (cx - 10) + ' ' + (up ? by + bh : by) + ' L' + (cx + 10) + ' ' + (up ? by + bh : by), stroke: d.tone === 'main' || !d.tone ? C.g08 : '#fff', 'stroke-width': 4 }, g);
    chip(g, bx + 18 + h.textW(d.who, 13, 1) / 2 + 11, by + 26, d.who, c, '#fff', 13); T(g, bx + bw - 16, by + 31, d.t, { 'text-anchor': 'end', 'font-size': 13.5, 'font-weight': 700, fill: C.mute });
    lines(g, bx + 18, by + 64, d.text, 16.5, bw - 36, { fill: C.ink, bold: true, lh: 1.42 }); if (d.sub) T(g, bx + 18, by + bh - 14, d.sub, { 'font-size': 12.5, fill: C.mute, 'font-weight': 500 }) });
};
})();
