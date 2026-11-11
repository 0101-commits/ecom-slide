/* quadrant — 2×2 시나리오 : 가운데 축(현재 값) · 칸 글은 바깥 모서리 · 칸별 눈금 · 떠 있는 말풍선 — CW48 11장
   x{title,a,b} · y{title,a:{t,s},b:{t,s}} · pivot{label,value} · cells[4: 위왼 위오른 아래왼 아래오른]{v,dec,unit,chip,tone:'wide|same|min',rate,text,tag}
   gauge{lo,hi,cur,unit,curLabel} · callout{text,sub,cell} · beats[{spot:칸번호}] */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function gauge(v, g) { var W = 236, X = h.lin(g.lo, g.hi, 8, W - 8), c = v > g.cur ? C.cmp : (v < g.cur ? C.main : C.mute);
  return '<svg viewBox="0 0 ' + W + ' 34" width="' + W + '" height="34" data-b="6" data-fx="fade"><line x1="8" x2="' + (W - 8) + '" y1="12" y2="12" stroke="#DDE3E0" stroke-width="6" stroke-linecap="round"/>'
    + (v !== g.cur ? '<line x1="' + X(g.cur) + '" x2="' + X(v) + '" y1="12" y2="12" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' : '') + '<line x1="' + X(g.cur) + '" x2="' + X(g.cur) + '" y1="3" y2="21" stroke="#1D2521" stroke-width="1.5"/><circle cx="' + X(v) + '" cy="12" r="6.5" fill="' + c + '" stroke="#fff" stroke-width="2"/>'
    + '<text x="8" y="32" font-size="11.5" fill="#6B7570">' + h.nf(g.lo, 2) + '</text><text x="' + X(g.cur) + '" y="32" font-size="11.5" fill="#1D2521" text-anchor="middle" font-weight="700">' + h.esc(g.curLabel || ('현재 ' + h.nf(g.cur, 2))) + '</text><text x="' + (W - 8) + '" y="32" font-size="11.5" fill="#6B7570" text-anchor="end">' + h.nf(g.hi, 2) + h.esc(g.unit || '') + '</text></svg>' }
ECOM.parts.quadrant = function (bd, s, ctx) {
  var svg = ctx.svg(512), root = ctx.root, c1 = 150, cw = 484, gp = 20, r1 = 84, rh = 183, px = c1 + cw + gp / 2, py = r1 + rh + gp / 2, K = ['tl', 'tr', 'bl', 'br'], cells = [];
  (s.cells || []).slice(0, 4).forEach(function (q, i) { var d = document.createElement('div'), x = c1 + (i % 2) * (cw + gp), y = r1 + Math.floor(i / 2) * (rh + gp);
    d.className = 'qc ' + K[i] + (q.tone === 'min' ? ' min' : '') + (q.tone === 'wide' ? ' wide' : ''); d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + cw + 'px;height:' + rh + 'px'; d.setAttribute('data-b', 4);
    var ch = q.chip ? '<span class="chip2 ' + (q.tone === 'min' ? 'g' : q.tone === 'wide' ? 'dk' : '') + '">' + h.esc(q.chip) + '</span>' : '';
    d.innerHTML = '<div class="vr"><div class="v"><span data-b="5" data-fx="count" data-count="' + q.v + '" data-from="' + (s.gauge ? s.gauge.cur : 0) + '" data-dec="' + (q.dec == null ? 2 : q.dec) + '">' + h.nf(q.v, q.dec == null ? 2 : q.dec) + '</span><small>' + h.esc(q.unit || '') + '</small></div>' + ch + '</div>'
      + (q.rate ? '<div class="r">' + h.esc(q.rate) + '</div>' : '') + '<div class="x">' + h.esc(q.text || '') + (q.tag ? ' &nbsp;<span class="mt">' + h.esc(q.tag) + '</span>' : '') + '</div>' + (s.gauge ? gauge(q.v, s.gauge) : '');
    bd.insertBefore(d, svg); cells.push(d) });
  var ya = r1 + 2 * rh + gp + 16, ax = [];
  if (s.y) { ax.push(['<span>' + h.esc(s.y.title || '') + '</span>', 0, r1 - 30]); if (s.y.a) ax.push([h.esc(s.y.a.t) + '<small>' + h.esc(s.y.a.s || '') + '</small>', 0, r1 + rh / 2 - 20]); if (s.y.b) ax.push([h.esc(s.y.b.t) + '<small>' + h.esc(s.y.b.s || '') + '</small>', 0, r1 + rh + gp + rh / 2 - 20]) }
  if (s.x) { ax.push([h.esc(s.x.title || ''), 0, ya]); if (s.x.a) ax.push([h.esc(s.x.a), c1 + cw / 2 - h.textW(s.x.a, 15, 1) / 2, ya]); if (s.x.b) ax.push([h.esc(s.x.b), c1 + cw + gp + cw / 2 - h.textW(s.x.b, 15, 1) / 2, ya]) }
  ax.forEach(function (a) { var d = document.createElement('div'); d.className = 'qax'; d.style.cssText = 'left:' + a[1] + 'px;top:' + a[2] + 'px'; d.innerHTML = a[0]; d.setAttribute('data-b', 1); bd.insertBefore(d, svg) });
  if (s.pivot) { var pv = h.lv(svg, 2, { 'data-fx': 'pop' }); E('circle', { cx: px, cy: py, r: 46, fill: '#fff', stroke: C.main, 'stroke-width': 2.5 }, pv);
    T(pv, px, py - 7, s.pivot.label || '현재', { 'text-anchor': 'middle', 'font-size': 12.5, fill: C.mute }); T(pv, px, py + 15, s.pivot.value, { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: C.dark });
    (s.cells || []).forEach(function (q, i) { var dx = i % 2 ? 1 : -1, dy = i < 2 ? -1 : 1, c = q.tone === 'wide' ? C.cmp : q.tone === 'min' ? C.main : C.axis, x2 = px + dx * 66, y2 = py + dy * 66;
      E('line', { x1: px + dx * 36, y1: py + dy * 36, x2: x2, y2: y2, stroke: c, 'stroke-width': 2.5, 'data-b': 3, 'data-fx': 'draw', 'data-ms': 300 }, svg);
      E('path', { d: 'M' + (x2 - dx * 9) + ' ' + y2 + ' L' + x2 + ' ' + y2 + ' L' + x2 + ' ' + (y2 - dy * 9), fill: 'none', stroke: c, 'stroke-width': 2.5, 'data-b': 3, 'data-fx': 'fade' }, svg) }) }
  var hv = null, ld = null, ah = null;
  if (s.callout) { var ci = s.callout.cell == null ? 3 : s.callout.cell, right = ci % 2 === 1, cx0 = c1 + (ci % 2) * (cw + gp), cyTop = r1 + Math.floor(ci / 2) * (rh + gp);
    hv = document.createElement('div'); hv.className = 'hov'; hv.style.cssText = (right ? 'right:0' : 'left:' + c1 + 'px') + ';top:0;width:550px;height:64px';
    hv.setAttribute('data-b', 7); hv.setAttribute('data-fx', 'drop'); hv.setAttribute('data-dy', '26'); hv.setAttribute('data-ms', '520');
    hv.innerHTML = '<b>' + h.esc(s.callout.text) + '</b>' + (s.callout.sub ? '<span>' + h.esc(s.callout.sub) + '</span>' : ''); bd.appendChild(hv);
    var lx = right ? 1153 : px, ey = cyTop + 26, ex = right ? cx0 + cw + 4 : cx0 + cw - 4;
    ld = E('path', { d: right ? 'M' + lx + ' 64 V' + ey + ' H' + ex : 'M' + lx + ' 64 V' + (py - 50), fill: 'none', stroke: C.dark, 'stroke-width': 2, 'stroke-dasharray': '5 5', 'data-b': 7, 'data-fx': 'draw', 'data-ms': 520 }, svg);
    if (right) ah = E('path', { d: 'M' + (ex + 9) + ' ' + (ey - 7) + ' L' + ex + ' ' + ey + ' L' + (ex + 9) + ' ' + (ey + 7), fill: 'none', stroke: C.dark, 'stroke-width': 2, 'data-b': 7, 'data-fx': 'fade' }, svg) }
  function spot(k) { var b = k > 0 && s.beats && s.beats[k - 1], sp = b ? b.spot : null; cells.forEach(function (c, i) { c.style.opacity = sp != null && i !== sp ? .35 : ''; c.classList.toggle('spot', sp != null && i === sp) });
    [hv, ld, ah].forEach(function (e) { if (e) e.style.opacity = sp != null ? .25 : '' }) }
  root._done = function () { if (hv && !h.RM()) hv.classList.add('bob') }; root._reset = function () { if (hv) hv.classList.remove('bob'); spot(root._bk || 0) };
  root._beat = function (k) { root._bk = k; spot(k) }; root.setAttribute('data-gap', 280); root.setAttribute('data-stg', 110) };
})();
