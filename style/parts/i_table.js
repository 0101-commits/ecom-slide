/* table — 표(+ 범위 막대 열 · 막대 열 · 강조 열 · 칩) — 가로 전체
   cols[{t,w,align,hc}] · rows[{c:[칸...],hi}] · chips{"행,열":{text,dir}} · range{col,lo,hi,unit,title,data:[[min,max,last],...]} · bars{col,max,dec,unit}
   칸이 {ph:n} 이면 번호 동그라미, 문자열 안 **굵게** 가능. after(표 아래 한 줄 메모) 
   배치 s.layout : default · bars 막대 든 표(맨 오른쪽 숫자 열이 긴 막대 칸, s.bars 로 열 지정) · heat 색 칸 표(숫자 열을 진하기로, 열마다 범례 막대, 숫자 열 없으면 기본 표) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C;
function numv(v) { return +String(v == null ? '' : v).replace(/,/g, '').replace(/−/g, '-').replace(/[^0-9.+-]/g, '') || 0 }
/* 칸 글에서 숫자 하나(화살표가 있으면 끝 값) — 숫자 칸이 아니면 null */
function pn(v) { var m = /^(?:.*→\s*)?([−\-+]?[\d,]*\.?\d+)\s*[%a-zA-Z가-힣]*$/.exec(String(v == null ? '' : v).replace(/\*\*/g, '').trim()); return m ? +m[1].replace(/,/g, '').replace(/−/g, '-') : null }
function rangeSvg(r, d) { var W = 190, X = h.lin(r.lo, r.hi, 6, W - 6);
  return '<svg viewBox="0 0 ' + W + ' 34" width="' + W + '" height="34">' + (r.lo < 0 ? '<line x1="' + X(0) + '" x2="' + X(0) + '" y1="3" y2="19" stroke="#9AA3A0"/>' : '') + '<line x1="6" x2="' + (W - 6) + '" y1="11" y2="11" stroke="#E3E8E5" stroke-width="2"/><rect x="' + X(d[0]) + '" y="7" width="' + Math.max(4, X(d[1]) - X(d[0])) + '" height="8" rx="4" fill="#99C7B9"/>' + (d[2] != null ? '<circle cx="' + X(d[2]) + '" cy="11" r="5" fill="#005136"/>' : '') + '<text x="' + (W / 2) + '" y="32" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1D2521">' + (d[0] === d[1] ? h.nf(d[0], 2) : h.nf(d[0], 2) + ' ~ ' + h.nf(d[1], 2)) + h.esc(r.unit || '') + '</text></svg>' }
function base(bd, s, ctx) { var cols = s.cols || [], rows = s.rows || [], ch = s.chips || {}, wide = s.layout === 'bars';
  if (wide && !s.bars) { var bj = -1; cols.forEach(function (c, j) { if (j && !c.k && rows.length && rows.every(function (r) { return pn((r.c || r)[j]) != null })) bj = j }); if (bj > 0) s.bars = { col: bj, dec: 0 } }
  if (wide && s.bars) { cols = cols.map(function (c, j) { return j === s.bars.col ? Object.assign({}, c, { w: 330 }) : c }) }
  var w = h.H('div', null, null, bd, 'position:absolute;left:0;right:0;top:0'), html = '<table class="t3"><thead><tr>' + cols.map(function (c, j) { return '<th class="' + (c.hc ? 'hc' : '') + '" style="' + (c.w ? 'width:' + h.num(c.w) + 'px;' : '') + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align : '') + '">' + h.esc(c.t) + '</th>' }).join('') + '</tr></thead><tbody>';
  var rhh = s.fill === false ? 0 : Math.min(rows.length <= 5 ? 86 : 66, Math.floor((470 - 46 - (s.after ? 34 : 0)) / Math.max(1, rows.length)));
  rows.forEach(function (r, i) { var cells = r.c || r; html += '<tr class="' + (r.hi ? 'hi' : '') + '" data-b="2"' + (rhh ? ' style="height:' + rhh + 'px' + (wide && !r.hi && i % 2 ? ';background:' + C.paper : '') + '"' : '') + '>' + cells.map(function (v, j) { var c = cols[j] || {}, cls = (c.hc ? 'hc ' : '') + (c.tx ? 'tx ' : '') + (c.k ? 'k' : ''), inner;
      if (s.range && j === s.range.col) inner = rangeSvg(s.range, s.range.data[i]);
      else if (s.bars && j === s.bars.col) { var mx = s.bars.max || Math.max.apply(null, rows.map(function (q) { return Math.abs(numv((q.c || q)[j])) })), nv = numv(v), wd = Math.abs(nv) / mx * 120;
        if (wide) { var pv = pn(v), tt = Math.abs(pv) / mx; inner = '<span style="display:flex;align-items:center;gap:12px"><b style="flex:0 0 46px;text-align:right;font-size:17px;color:' + C.ink + '">' + h.nf(pv, s.bars.dec || 0) + h.esc(s.bars.unit || '') + '</b><span style="flex:1;height:20px;border-radius:3px;background:' + C.well + '"><i data-b="3" data-fx="growx" data-ms="560" style="display:block;height:100%;width:' + (tt * 100).toFixed(1) + '%;border-radius:3px;background:' + (pv < 0 ? C.gray : (tt >= .999 ? C.dark : (r.hi ? C.main : C.g65))) + '"></i></span></span>' } else
        inner = '<span style="display:inline-flex;align-items:center;gap:8px;justify-content:flex-end"><span style="display:inline-block;height:12px;border-radius:2px;width:' + wd.toFixed(1) + 'px;background:' + (nv < 0 ? C.gray : (r.hi ? C.main : C.g40)) + '"></span>' + h.nf(nv, s.bars.dec || 0) + h.esc(s.bars.unit || '') + '</span>' }
      else if (v && typeof v === 'object' && v.ph) inner = '<span class="ph"><i>' + v.ph + '</i>' + h.md(v.t || '') + '</span>';
      else inner = h.md(v);
      var cp = ch[i + ',' + j]; if (cp) inner += '<span class="chip2 ' + (cp.dir === 'up' ? 'up' : cp.dir === 'dn' ? 'dn' : '') + '" data-b="3" data-fx="pop">' + h.esc(cp.text) + '</span>';
      return '<td class="' + cls + '" style="' + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align : '') + '">' + inner + '</td>' }).join('') + '</tr>' });
  html += '</tbody></table>' + (s.after ? '<p style="margin:12px 0 0;font-size:14px;color:#3E4743" data-b="4">' + h.md(s.after) + '</p>' : ''); w.innerHTML = html;
  ctx.root.setAttribute('data-stg', 80) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ──
   bars : 막대 든 표 — 맨 오른쪽 숫자 열이 긴 막대 칸이 됨(열 안 최댓값 = 가득). s.bars{col,dec,unit,max} 로 열을 고름
   heat : 색 칸 표 — 숫자만 든 열(화살표 칸은 끝 값)이 칸 진하기로 크기를 보임. 열마다 낮음→높음 범례 막대가 표 아래에 붙음. 숫자 열이 없으면 기본 표 */
function mix(a, b, t) { var p = function (x) { return [1, 3, 5].map(function (i) { return parseInt(x.slice(i, i + 2), 16) }) }, A = p(a), B = p(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t) }).join(',') + ')' }
function heat(bd, s, ctx) {
  var P = ctx.P, cols = s.cols || [], rows = s.rows || [], rj = s.range ? s.range.col : -1, hc = [];
  cols.forEach(function (c, j) { if (j > 0 && j !== rj && !c.k && rows.length && rows.every(function (r) { return pn((r.c || r)[j]) != null })) hc.push(j) });
  if (!hc.length) return baseFn(bd, s, ctx);
  var show = cols.map(function (c, j) { return j }).filter(function (j) { return j !== rj }), st = {}, arrow = false;
  hc.forEach(function (j) { var v = rows.map(function (r) { return pn((r.c || r)[j]) }), dm = 0; rows.forEach(function (r) { var t = String((r.c || r)[j]); if (/→/.test(t)) arrow = true; var q = /([.]\d+)\s*[%a-zA-Z가-힣]*$/.exec(t); if (q) dm = Math.max(dm, q[1].length - 1) }); st[j] = { lo: Math.min.apply(null, v), hi: Math.max.apply(null, v), dec: dm } });
  var lg = 34 + 38, rhh = Math.min(rows.length <= 5 ? 80 : 60, Math.floor((470 - 46 - lg - (arrow ? 30 : 0)) / Math.max(1, rows.length))), RA = P.g08, RB = P.dark;
  var w = h.H('div', null, null, bd, 'position:absolute;left:0;right:0;top:0'), html = '<table class="t3"><thead><tr>' + show.map(function (j) { var c = cols[j]; return '<th style="' + (hc.indexOf(j) >= 0 ? 'width:' + Math.max(c.w || 0, 160) + 'px;' : c.w ? 'width:' + h.num(c.w) + 'px;' : '') + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align : (hc.indexOf(j) >= 0 ? 'text-align:center' : '')) + '">' + h.esc(c.t) + '</th>' }).join('') + '</tr></thead><tbody>';
  rows.forEach(function (r, i) { var cells = r.c || r; html += '<tr data-b="2" style="height:' + rhh + 'px">' + show.map(function (j) { var c = cols[j] || {}, v = cells[j], inner, sty = '';
      if (hc.indexOf(j) >= 0) { var q = st[j], t = (pn(v) - q.lo) / ((q.hi - q.lo) || 1); sty = 'text-align:center;font-size:19px;font-weight:700;background:' + mix(RA, RB, t) + ';color:' + (t > .52 ? '#fff' : P.ink) + ';border-left:3px solid #fff;border-right:3px solid #fff'; inner = h.md(v) }
      else if (v && typeof v === 'object' && v.ph) inner = '<span class="ph"><i>' + v.ph + '</i>' + h.md(v.t || '') + '</span>';
      else inner = h.md(v);
      return '<td class="' + (c.k || j === 0 ? 'k' : '') + '" data-key="' + h.esc(String(cells[0] && cells[0].t || cells[0] || '')) + '" style="' + (/^(left|right|center)$/.test(c.align) ? 'text-align:' + c.align + ';' : '') + sty + '">' + inner + '</td>' }).join('') + '</tr>' });
  html += '</tbody><tfoot><tr data-b="3" style="height:' + lg + 'px">' + show.map(function (j, n) { if (hc.indexOf(j) < 0) return '<td style="border-bottom:0;vertical-align:bottom;font-size:13px;font-weight:700;color:' + P.mute + '">' + (n === 0 ? '범례 · 열마다 낮음 → 높음' : '') + '</td>';
    var q = st[j]; return '<td style="border-bottom:0;vertical-align:bottom;padding:4px 14px 0"><div style="height:12px;border-radius:3px;background:linear-gradient(90deg,' + RA + ',' + RB + ');border:1px solid ' + P.line + '"></div><div style="display:flex;justify-content:space-between;font-size:12.5px;color:' + P.mute + ';margin-top:4px"><span>' + h.nf(q.lo, q.dec) + '</span><span>' + h.nf(q.hi, q.dec) + '</span></div></td>' }).join('') + '</tr></tfoot></table>'
    + (arrow ? '<p style="margin:10px 0 0;font-size:13.5px;color:' + P.mute + '" data-b="3">화살표(→) 칸은 끝 값을 기준으로 칠함</p>' : '');
  w.innerHTML = html; ctx.root.setAttribute('data-stg', 80) }
var LAY = { heat: heat }, baseFn = base;
ECOM.parts.table = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.table.layouts = ['default', 'bars', 'heat'];
})();
