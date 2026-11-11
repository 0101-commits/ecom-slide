/* table — 표(+ 범위 막대 열 · 막대 열 · 강조 열 · 칩) — 가로 전체
   cols[{t,w,align,hc}] · rows[{c:[칸...],hi}] · chips{"행,열":{text,dir}} · range{col,lo,hi,unit,title,data:[[min,max,last],...]} · bars{col,max,dec,unit}
   칸이 {ph:n} 이면 번호 동그라미, 문자열 안 **굵게** 가능. after(표 아래 한 줄 메모) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C;
function numv(v) { return +String(v == null ? '' : v).replace(/,/g, '').replace(/−/g, '-').replace(/[^0-9.+-]/g, '') || 0 }
function rangeSvg(r, d) { var W = 190, X = h.lin(r.lo, r.hi, 6, W - 6);
  return '<svg viewBox="0 0 ' + W + ' 34" width="' + W + '" height="34">' + (r.lo < 0 ? '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="3" y2="19" stroke="#9AA3A0"/>' : '') + '<line x1="6" x2="' + (W - 6) + '" y1="11" y2="11" stroke="#E3E8E5" stroke-width="2"/><rect x="' + X(d[0]) + '" y="7" width="' + Math.max(4, X(d[1]) - X(d[0])) + '" height="8" rx="4" fill="#99C7B9"/>' + (d[2] != null ? '<circle cx="' + X(d[2]) + '" cy="11" r="5" fill="#005136"/>' : '') + '<text x="' + (W / 2) + '" y="32" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1D2521">' + (d[0] === d[1] ? h.nf(d[0], 2) : h.nf(d[0], 2) + ' ~ ' + h.nf(d[1], 2)) + h.esc(r.unit || '') + '</text></svg>' }
ECOM.parts.table = function (bd, s, ctx) { var cols = s.cols || [], rows = s.rows || [], ch = s.chips || {};
  var w = h.H('div', null, null, bd, 'position:absolute;left:0;right:0;top:0'), html = '<table class="t3"><thead><tr>' + cols.map(function (c, j) { return '<th class="' + (c.hc ? 'hc' : '') + '" style="' + (c.w ? 'width:' + h.num(c.w) + 'px;' : '') + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align : '') + '">' + h.esc(c.t) + '</th>' }).join('') + '</tr></thead><tbody>';
  var rhh = s.fill === false ? 0 : Math.min(rows.length <= 5 ? 86 : 66, Math.floor((470 - 46 - (s.after ? 34 : 0)) / Math.max(1, rows.length)));
  rows.forEach(function (r, i) { var cells = r.c || r; html += '<tr class="' + (r.hi ? 'hi' : '') + '" data-b="2"' + (rhh ? ' style="height:' + rhh + 'px"' : '') + '>' + cells.map(function (v, j) { var c = cols[j] || {}, cls = (c.hc ? 'hc ' : '') + (c.tx ? 'tx ' : '') + (c.k ? 'k' : ''), inner;
      if (s.range && j === s.range.col) inner = rangeSvg(s.range, s.range.data[i]);
      else if (s.bars && j === s.bars.col) { var mx = s.bars.max || Math.max.apply(null, rows.map(function (q) { return Math.abs(numv((q.c || q)[j])) })), nv = numv(v), wd = Math.abs(nv) / mx * 120;
        inner = '<span style="display:inline-flex;align-items:center;gap:8px;justify-content:flex-end"><span style="display:inline-block;height:12px;border-radius:2px;width:' + wd.toFixed(1) + 'px;background:' + (nv < 0 ? C.gray : (r.hi ? C.main : C.g40)) + '"></span>' + h.nf(nv, s.bars.dec || 0) + h.esc(s.bars.unit || '') + '</span>' }
      else if (v && typeof v === 'object' && v.ph) inner = '<span class="ph"><i>' + v.ph + '</i>' + h.md(v.t || '') + '</span>';
      else inner = h.md(v);
      var cp = ch[i + ',' + j]; if (cp) inner += '<span class="chip2 ' + (cp.dir === 'up' ? 'up' : cp.dir === 'dn' ? 'dn' : '') + '" data-b="3" data-fx="pop">' + h.esc(cp.text) + '</span>';
      return '<td class="' + cls + '" style="' + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align : '') + '">' + inner + '</td>' }).join('') + '</tr>' });
  html += '</tbody></table>' + (s.after ? '<p style="margin:12px 0 0;font-size:14px;color:#3E4743" data-b="4">' + h.md(s.after) + '</p>' : ''); w.innerHTML = html;
  ctx.root.setAttribute('data-stg', 80) };
})();
