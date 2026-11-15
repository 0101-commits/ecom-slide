/* p_mapval.js — 지도 위 나라별 숫자(영상 장면 문법). 지도 · 배지 도우미 = ECOM.pmap(p_mapbadge.js). 지도 범위는 빌드가 장 자료의 at · iso · fill · view.bbox 로 정함.
   배치 badge   : 나라 칠하기(값 클수록 진하게) + 나라마다 원형 숫자 뱃지가 낮은 값부터 놓임 + 범례   · 칸 values[{c,v,dec,label}] · unit · scale{title} · iso[…]
   배치 callout : 칠한 지역 위 숫자 말풍선(큰 값) + 연도 상자                                      · 칸 regions[{c,v,dec,unit,label,tone}] · year{text,sub,pos}
   배치 radiate : 한 나라에서 가지선이 뻗어 이름표 상자로 이어짐                                    · 칸 origin{at,label,value,unit,sub} · branches[{at,label,value,unit,sub}] · unit
   공통 칸      : legend[…] · note{title,text,pos,w} · 기본 DOM = 끝 모습(숫자 굴림 · 가지 긋기는 data-fx 로 쌓을 때만). */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, uid = 0;
function X() { return ECOM.pmap }
function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16) }) }
function ramp(stops) { var S = stops.map(hex); return function (t) { t = Math.max(0, Math.min(1, t)); var k = Math.min(S.length - 2, Math.floor(t * (S.length - 1))), u = t * (S.length - 1) - k;
  return '#' + [0, 1, 2].map(function (j) { var v = Math.round(S[k][j] + (S[k + 1][j] - S[k][j]) * u); return (v < 16 ? '0' : '') + v.toString(16) }).join('') } }
function nf(v, d) { return h.nf(v, d || 0) }

/* badge : 나라 칠하기 + 원형 숫자 뱃지 */
function badgeMap(bd, s, ctx) { var svg = ctx.svg(512), M = X(), B = M.base(svg, s, ctx); if (!B) return; var k = B.k, G = B.G, vs = (s.values || []).slice(), mx = Math.max.apply(null, vs.map(function (o) { return +o.v || 0 }).concat([1])), mn = Math.min.apply(null, vs.map(function (o) { return +o.v || 0 }).concat([mx]));
  var rp = k.dk ? ramp(['#1F5A45', '#2E9970', '#8FD9B6']) : ramp(['#D9EDE5', '#7FC4A6', '#00744F']), col = function (v) { return rp(mx > mn ? (v - mn) / (mx - mn) : 1) };
  vs.sort(function (a, b) { return a.v - b.v });
  var fg = E('g', { 'clip-path': svg.querySelector('g[clip-path]').getAttribute('clip-path') }, svg);
  vs.forEach(function (o, i) { var iso = G.countries[o.c] ? o.c : (G.names[o.c] || ''); if (!G.countries[iso]) return; E('path', { d: G.countries[iso], fill: col(o.v), stroke: k.dk ? '#0E3D2F' : '#fff', 'stroke-width': 1, 'data-key': o.c, 'data-at': 500 + i * 230, 'data-fx': 'fade', 'data-ms': 420 }, fg) });
  var occ = [];
  vs.forEach(function (o, i) { var p = G.find(o.c); if (!p) return; p = [p[0] + (o.dx || 0), p[1] + (o.dy || 0)]; var vsx = nf(o.v, o.dec), r = Math.max(17 + 12 * Math.sqrt((+o.v || 0) / mx), h.textW(vsx, 15, 1) / 2 + 8), t = 600 + i * 230, g = E('g', { 'data-at': t, 'data-fx': 'pop', 'data-ms': 380, 'data-key': o.c }, svg);
    E('circle', { cx: p[0], cy: p[1], r: r, fill: k.dk ? '#fff' : '#1D2521', stroke: k.dk ? '#062E23' : '#fff', 'stroke-width': 2.4 }, g);
    T(g, p[0], p[1] + 5.5, vsx, { 'font-size': 15, 'font-weight': 800, fill: k.dk ? '#062E23' : '#fff', 'text-anchor': 'middle', 'data-count': o.v, 'data-dec': o.dec || 0, 'data-at': t + 150, 'data-fx': 'count', 'data-ms': 800 });
    T(g, p[0], p[1] + r + 17, o.label || o.c, Object.assign({ 'font-size': 14, 'font-weight': 800, fill: k.ink, 'text-anchor': 'middle' }, k.halo)) });
  var lg = E('g', { 'data-at': 700 + vs.length * 230, 'data-fx': 'fade', 'data-ms': 500 }, svg), W = 380, x = 14, y = 512 - 14 - 54, gid = 'pv' + (++uid), gd = E('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, E('defs', {}, svg));
  [0, .5, 1].forEach(function (o) { E('stop', { offset: o, 'stop-color': col(mn + (mx - mn) * o) }, gd) });
  E('rect', { x: x, y: y, width: W, height: 54, rx: 12, fill: k.card, stroke: k.line }, lg); T(lg, x + 14, y + 20, (s.scale && s.scale.title) || '', { 'font-size': 13, 'font-weight': 700, fill: k.ink });
  E('rect', { x: x + 14, y: y + 28, width: 150, height: 10, rx: 5, fill: 'url(#' + gid + ')' }, lg); T(lg, x + 14, y + 50, nf(mn, vs.length ? vs[0].dec : 0) + (s.unit || ''), { 'font-size': 12.5, fill: k.sub }); T(lg, x + 164, y + 50, nf(mx, vs.length ? vs[vs.length - 1].dec : 0) + (s.unit || ''), { 'font-size': 12.5, fill: k.sub, 'text-anchor': 'end' });
  E('circle', { cx: x + 196, cy: y + 33, r: 9, fill: k.dk ? '#fff' : '#1D2521' }, lg); T(lg, x + 212, y + 38, '원 안 숫자 = 값', { 'font-size': 13, fill: k.sub });
  M.note(svg, k, s.note, 900 + vs.length * 230) }

/* callout : 칠한 지역 위 숫자 말풍선 + 연도 상자 */
function callout(bd, s, ctx) { var svg = ctx.svg(512), M = X(), B = M.base(svg, s, ctx); if (!B) return; var k = B.k, G = B.G, rg = s.regions || [], occ = [], pl = ECOM.gm.placer(1168, 512), y = s.year;
  var fg = E('g', { 'clip-path': svg.querySelector('g[clip-path]').getAttribute('clip-path') }, svg);
  rg.forEach(function (o, i) { var iso = G.countries[o.c] ? o.c : (G.names[o.c] || ''), cl = M.tone(o.tone || 'main', k.dk); if (G.countries[iso]) E('path', { d: G.countries[iso], fill: cl, stroke: k.dk ? '#0E3D2F' : '#fff', 'stroke-width': 1, 'data-key': o.c, 'data-at': 400 + i * 500, 'data-fx': 'fade', 'data-ms': 500 }, fg) });
  var yw = 0, yh = 0, yx = 16, yyy = 16; if (y) { yw = Math.max(h.textW(y.text || '', 40, 1), h.textW(y.sub || '', 13)) + 40; yh = 56 + (y.sub ? 24 : 0); var pz = y.pos || 'tl'; yx = /r/.test(pz) ? 1168 - yw - 16 : 16; yyy = /b/.test(pz) ? 512 - yh - 16 : 16; pl.occ.push([yx, yyy, yw, yh]) }
  var pts = rg.map(function (o) { var p = G.find(o.c); return p ? [p[0] + (o.dx || 0), p[1] + (o.dy || 0)] : null }); pts.forEach(function (p) { if (p) pl.occ.push([p[0] - 10, p[1] - 10, 20, 20]) });
  if (s.note) { var nw = s.note.w || 330, nl = h.wrap(s.note.text || '', 14, nw - 32), nh = 20 + (s.note.title ? 26 : 0) + nl.length * 21 + 8, pz2 = s.note.pos || 'bl'; pl.occ.push([/r/.test(pz2) ? 1168 - nw - 16 : 16, /b/.test(pz2) ? 512 - nh - 16 : 16, nw, nh]) }
  rg.forEach(function (o, i) { var p = pts[i]; if (!p) return; var vsx = nf(o.v, o.dec), fs = 34, w = Math.max(h.textW(vsx, fs, 1) + h.textW(o.unit || '', 14) + 14, h.textW(o.label || '', 13.5, 1)) + 34, hh = 58 + (o.label ? 24 : 0), r = pl.put(p[0], p[1], w, hh, 40), t = 900 + i * 600;
    var g = E('g', { 'data-at': t, 'data-fx': 'zoom', 'data-ms': 450, 'data-key': o.c }, svg), cx = r[0] + w / 2, cy = r[1] + hh / 2, dx = p[0] - cx, dy = p[1] - cy, tail;
    if (Math.abs(dx) / w > Math.abs(dy) / hh) { var bx = dx > 0 ? r[0] + w : r[0], by = Math.max(r[1] + 16, Math.min(r[1] + hh - 16, p[1])); tail = 'M' + bx + ' ' + (by - 10) + 'L' + (p[0] - Math.sign(dx) * 5) + ' ' + p[1] + 'L' + bx + ' ' + (by + 10) + 'Z' }
    else { var by2 = dy > 0 ? r[1] + hh : r[1], bx2 = Math.max(r[0] + 16, Math.min(r[0] + w - 16, p[0])); tail = 'M' + (bx2 - 10) + ' ' + by2 + 'L' + p[0] + ' ' + (p[1] - Math.sign(dy) * 5) + 'L' + (bx2 + 10) + ' ' + by2 + 'Z' }
    E('path', { d: tail, fill: k.dk ? '#fff' : '#1D2521' }, g); E('rect', { x: r[0], y: r[1], width: w, height: hh, rx: 12, fill: k.dk ? '#fff' : '#1D2521' }, g);
    var tv = T(g, r[0] + 17, r[1] + 42, vsx, { 'font-size': fs, 'font-weight': 800, fill: k.dk ? '#062E23' : '#fff', 'data-count': o.v, 'data-dec': o.dec || 0, 'data-at': t + 150, 'data-fx': 'count', 'data-ms': 900 });
    if (o.unit) T(g, r[0] + w - 12, r[1] + 42, o.unit, { 'text-anchor': 'end', 'font-size': 14, fill: k.dk ? '#35564B' : 'rgba(255,255,255,.8)' });
    if (o.label) T(g, r[0] + 17, r[1] + 64, o.label, { 'font-size': 13.5, 'font-weight': 700, fill: k.dk ? '#35564B' : 'rgba(255,255,255,.85)' });
    E('circle', { cx: p[0], cy: p[1], r: 5, fill: k.dk ? '#fff' : '#1D2521', stroke: k.card, 'stroke-width': 2 }, g) });
  if (y) { var g2 = E('g', { 'data-at': 150, 'data-fx': 'slide', 'data-dy': -8, 'data-key': '연도' }, svg); E('rect', { x: yx, y: yyy, width: yw, height: yh, rx: 10, fill: k.card, stroke: k.line }, g2);
    T(g2, yx + 20, yyy + 46, y.text || '', { 'font-size': 40, 'font-weight': 800, fill: k.acc, 'letter-spacing': '-.02em' }); if (y.sub) T(g2, yx + 20, yyy + 70, y.sub, { 'font-size': 13, fill: k.sub }) }
  M.legend(svg, k, s.legend, 900 + rg.length * 600); M.note(svg, k, s.note, 1100 + rg.length * 600) }

/* radiate : 한 나라에서 가지선이 뻗어 이름표 상자로 */
function radiate(bd, s, ctx) { var svg = ctx.svg(512), M = X(), B = M.base(svg, s, ctx); if (!B) return; var k = B.k, G = B.G, o0 = s.origin || {}, p0 = G.find(o0.at), br = s.branches || [], pl = ECOM.gm.placer(1168, 512);
  if (!p0) return; pl.occ.push([p0[0] - 40, p0[1] - 40, 80, 80]);
  var pts = br.map(function (b) { var p = G.find(b.at); return p ? [p[0] + (b.dx || 0), p[1] + (b.dy || 0)] : null }); pts.forEach(function (p) { if (p) pl.occ.push([p[0] - 8, p[1] - 8, 16, 16]) });
  var mx = Math.max.apply(null, br.map(function (b) { return +b.value || 0 }).concat([1])), ink = k.dk ? '#fff' : '#1D2521', tx = k.dk ? '#062E23' : '#fff', sb = k.dk ? '#35564B' : 'rgba(255,255,255,.82)';
  br.forEach(function (b, i) { var p = pts[i]; if (!p) return; var dx = p[0] - p0[0], dy = p[1] - p0[1], L = Math.sqrt(dx * dx + dy * dy) || 1, bend = .2, cx = (p0[0] + p[0]) / 2 - dy * bend, cy = (p0[1] + p[1]) / 2 + dx * bend, t = 500 + i * 300,
    w = 1.6 + 2.6 * (+b.value || 0) / mx, vs = b.value != null ? nf(b.value, b.dec) + (b.unit || s.unit || '') : '';
    E('path', { d: 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1), fill: 'none', stroke: k.acc, 'stroke-width': w, 'stroke-linecap': 'round', opacity: .9, 'data-at': t, 'data-fx': 'draw', 'data-ms': 700, 'data-key': b.label || '' }, svg);
    var bw = Math.max(h.textW(b.label || '', 14, 1), vs ? h.textW(vs, 18, 1) : 0, b.sub ? h.textW(b.sub, 12.5) : 0) + 26, bh = 30 + (vs ? 22 : 0) + (b.sub ? 18 : 0), r = pl.put(p[0], p[1], bw, bh, 22), g = E('g', { 'data-at': t + 650, 'data-fx': 'zoom', 'data-ms': 380, 'data-key': b.label || '' }, svg);
    var qx = Math.max(r[0], Math.min(r[0] + bw, p[0])), qy = Math.max(r[1], Math.min(r[1] + bh, p[1])); E('line', { x1: p[0], y1: p[1], x2: qx, y2: qy, stroke: ink, 'stroke-width': 1.6 }, g);
    E('circle', { cx: p[0], cy: p[1], r: 5, fill: k.card, stroke: ink, 'stroke-width': 2.4 }, g); E('rect', { x: r[0], y: r[1], width: bw, height: bh, rx: 8, fill: ink }, g);
    T(g, r[0] + 13, r[1] + 21, b.label || '', { 'font-size': 14, 'font-weight': 800, fill: tx }); var yy = r[1] + 21;
    if (vs) { yy += 22; T(g, r[0] + 13, yy, vs, { 'font-size': 18, 'font-weight': 800, fill: k.dk ? '#00744F' : '#8FD9B6' }) } if (b.sub) T(g, r[0] + 13, yy + 17, b.sub, { 'font-size': 12.5, fill: sb }) });
  var og = E('g', { 'data-at': 200, 'data-fx': 'zoom', 'data-ms': 450, 'data-key': o0.label || '' }, svg), ov = o0.value != null ? nf(o0.value, o0.dec) + (o0.unit || '') : '', ow = Math.max(h.textW(o0.label || '', 15, 1), ov ? h.textW(ov, 22, 1) : 0, o0.sub ? h.textW(o0.sub, 12.5) : 0) + 30, oh = 32 + (ov ? 28 : 0) + (o0.sub ? 18 : 0), or = pl.put(p0[0], p0[1], ow, oh, 36);
  E('circle', { cx: p0[0], cy: p0[1], r: 22, fill: 'none', stroke: k.acc, 'stroke-width': 2, 'stroke-dasharray': '3 4' }, og); E('circle', { cx: p0[0], cy: p0[1], r: 11, fill: k.acc, stroke: k.card, 'stroke-width': 3 }, og);
  var oq = [Math.max(or[0], Math.min(or[0] + ow, p0[0])), Math.max(or[1], Math.min(or[1] + oh, p0[1]))]; E('line', { x1: p0[0], y1: p0[1], x2: oq[0], y2: oq[1], stroke: k.acc, 'stroke-width': 1.8 }, og);
  E('rect', { x: or[0], y: or[1], width: ow, height: oh, rx: 9, fill: k.acc }, og); var ot = k.dk ? '#062E23' : '#fff'; T(og, or[0] + 15, or[1] + 22, o0.label || '', { 'font-size': 15, 'font-weight': 800, fill: ot });
  var oy = or[1] + 22; if (ov) { oy += 28; T(og, or[0] + 15, oy, ov, { 'font-size': 22, 'font-weight': 800, fill: ot }) } if (o0.sub) T(og, or[0] + 15, oy + 18, o0.sub, { 'font-size': 12.5, fill: ot });
  M.legend(svg, k, s.legend, 1000 + br.length * 300); M.note(svg, k, s.note, 1200 + br.length * 300) }

ECOM.parts.mapval = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'badge';
  ({ badge: badgeMap, callout: callout, radiate: radiate }[L] || badgeMap)(bd, s, ctx); ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.mapval.layouts = ['default', 'badge', 'callout', 'radiate'];
ECOM.parts.mapval.dark = ['default', 'badge', 'callout', 'radiate'];
})();
