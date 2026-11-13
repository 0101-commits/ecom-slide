/* czfan — 갈래(하나 → 여럿) · 합류(여럿 → 하나) : 굵은 곡선 띠가 가운데 상자와 갈래 상자를 잇고 띠마다 이름표
   mode 'out'(왼쪽 큰 상자에서 오른쪽 갈래로) · 'in'(왼쪽 원인들이 오른쪽 결과 하나로)
   hub{name,value,sub,tag} · leaves[2~4]{name,value,sub,rel(띠 이름표),tone:'warn'} · hubTitle(위 작은 글) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T, Z = ECOM.cz;
ECOM.parts.czfan = function (bd, s, ctx) {
  var svg = ctx.svg(512), out = s.mode !== 'in', hub = s.hub || {}, lv = (s.leaves || []).slice(0, 4), n = lv.length; if (!n) return;
  var HW = 330, HH = 230, LW = 372, gapY = 22, LH = Math.min(150, (512 - 16 - (n - 1) * gapY) / n), top = (512 - n * LH - (n - 1) * gapY) / 2;
  var hx = out ? 0 : 1168 - HW, lx = out ? 1168 - LW : 0, hy = 256 - HH / 2, hxe = out ? hx + HW : hx, lxe = out ? lx : lx + LW;
  var gh = h.at(svg, 100, { 'data-fx': 'pop', 'data-ms': 460 }); Z.box(gh, hx, hy, HW, HH, { fill: C.dark, rx: 20 });
  if (hub.tag) Z.chip(gh, hx + HW / 2, hy + 34, hub.tag, 13.5, { fill: C.g18, stroke: 'none', color: C.dark });
  var nl = Z.tx(gh, hx + HW / 2, hy + 76, hub.name || '', 21, HW - 40, { fill: '#fff', lh: 27 }); T(gh, hx + HW / 2, hy + 80 + nl * 27 + 36, hub.value || '', { 'text-anchor': 'middle', 'font-size': 46, 'font-weight': 700, fill: '#fff' });
  if (hub.sub) Z.tx(gh, hx + HW / 2, hy + HH - 28, hub.sub, 13.5, HW - 40, { bold: false, fill: '#CDE9DD', lh: 18 });
  lv.forEach(function (o, i) { var y = top + i * (LH + gapY), cy = y + LH / 2, t = 560 + i * 520, warn = o.tone === 'warn', g = h.at(svg, t + 380, { 'data-fx': out ? 'right' : 'left', 'data-ms': 420 });
    var x0 = hxe + (out ? 6 : -6), x1 = lxe + (out ? -14 : 14), cxm = (x0 + x1) / 2, d = out ? 'M' + x0 + ' 256 C' + cxm + ' 256, ' + cxm + ' ' + cy + ', ' + x1 + ' ' + cy : 'M' + x1 + ' ' + cy + ' C' + cxm + ' ' + cy + ', ' + cxm + ' 256, ' + x0 + ' 256';
    var wd = 26 - (n > 3 ? 6 : 0), p = E('path', { d: d, fill: 'none', stroke: warn ? '#E4B8A6' : C.g40, 'stroke-width': wd, opacity: .9, 'stroke-linecap': 'butt', 'data-at': t, 'data-fx': 'draw', 'data-ms': 600 }, svg);
    var hd = out ? [lxe - 2, cy, 0] : [hxe + 2, 256, 0]; ECOM.kx.head(svg, hd[0], hd[1], 0, warn ? C.warn : C.g65, 24, { 'data-at': t + 520, 'data-fx': 'fade', 'data-ms': 160 });
    if (o.rel) { var mx = cxm, my = (256 + cy) / 2, gc = h.at(svg, t + 520, { 'data-fx': 'pop', 'data-ms': 300 }); Z.chip(gc, mx, my, o.rel, 14, { fill: '#fff', stroke: warn ? C.warn : C.g65, sw: 2, color: warn ? C.warn : C.dark }) }
    Z.box(g, lx, y, LW, LH, { fill: '#fff', stroke: warn ? C.warn : C.main, sw: 2.6, rx: 16 }); var lnn = Z.tx(g, lx + 22, y + 36, o.name || '', 18, LW - 190, { anchor: 'start', lh: 22 });
    if (o.sub) Z.tx(g, lx + 22, y + 36 + lnn * 22 + 8, o.sub, 13, LW - 190, { anchor: 'start', bold: false, fill: C.mute, lh: 17 });
    T(g, lx + LW - 20, y + LH / 2 + 12, o.value || '', { 'text-anchor': 'end', 'font-size': 34, 'font-weight': 700, fill: warn ? C.warn : C.dark }) });
};
})();
