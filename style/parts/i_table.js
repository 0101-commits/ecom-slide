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
/* ── 영상 장면 배치(5판 P5) : 끝 모습이 기본 DOM, 덧붙기 · 긋기 · 자라기는 _hook 안에서만 ──
   grow   : 행이 하나씩 덧붙고 강조 칸이 마지막에 튐 · 칸 title · cols[{t,w}] · rows[[칸…]] · marks[[행,열]…] · legend · after
   marker : 한 행의 이름 칸에 노랑 형광이 그어지고 행 띠가 깔림 · 칸 title · cols · rows · marker{row,col} · legend · after
   years  : 해 열이 왼쪽부터 채워지고 한 줄(bar.row)의 막대가 길어짐 · 칸 title · cols[항목,해…] · rows · bar{row,max,unit} · legend · after */
var YEL = '#FFE066', H = h.H;
if (!document.getElementById('i-table-css')) { var tst = document.createElement('style'); tst.id = 'i-table-css';
  tst.textContent = '.tg-ttl{display:flex;align-items:center;justify-content:center;font-size:23px;font-weight:800;letter-spacing:-.01em;border-radius:12px;box-sizing:border-box;margin:0 auto}'
    + '.tg-r{display:grid;align-items:center;box-sizing:border-box;border-bottom:1px solid rgba(128,140,134,.32);background:rgba(128,140,134,.055);font-size:22px;font-variant-numeric:tabular-nums;position:relative}'
    + '.tg-r>span{padding:0 14px;text-align:center;position:relative;z-index:1}.tg-r>span:first-child{text-align:left;font-weight:700}'
    + '.tg-r.hd{font-size:16px;font-weight:700;border-bottom:2px solid currentColor}'
    + '.tg-m{background:linear-gradient(' + YEL + ',' + YEL + ') no-repeat 0 62%/100% 62%;font-weight:800;padding:0 4px;margin:0 -4px;border-radius:3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}'
    + '.tg-lg{display:flex;gap:22px;align-items:center;font-size:13.5px;font-weight:600}.tg-lg i{display:inline-block;width:24px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:8px}'
    + '.tg-af{font-size:20px;font-weight:700;text-align:center;line-height:1.4}'; document.head.appendChild(tst) }
function tgHook(ctx, items) { ctx.root._hook = function () { if (h.RM()) return 0; var end = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, it.at + it.ms) }); return end } }
/* 틀 : 제목 알약 + 머리 줄 + 행 + 아래 범례 · 맺음 줄. 열 너비 w(px) 없으면 1fr */
function tgBuild(bd, s, ctx, extra) { var P = ctx.P, cols = s.cols || [], rows = s.rows || [], n = rows.length, items = [];
  var gt = 'grid-template-columns:' + cols.map(function (c) { return c.w ? h.num(c.w) + 'px' : '1fr' }).join(' ');
  var ttl = s.title ? 62 : 0, hd = 54, ft = 44 + (s.after ? 36 : 0), rh = Math.min(86, Math.floor((512 - ttl - hd - ft) / Math.max(1, n)));
  var y = 0, tt = null;
  if (s.title) { tt = H('div', 'tg-ttl', h.md(s.title), bd, 'position:absolute;left:50%;transform:translateX(-50%);top:0;height:50px;padding:0 34px;background:' + (ctx.dark ? P.g18 : P.dark) + ';color:' + (ctx.dark ? '#fff' : '#fff')); y = ttl }
  var box = H('div', null, null, bd, 'position:absolute;left:0;right:0;top:' + y + 'px;color:' + P.ink);
  var hr = H('div', 'tg-r hd', cols.map(function (c, j) { return '<span' + (j ? '' : ' style="font-weight:700"') + '>' + h.esc(c.t) + '</span>' }).join(''), box, gt + ';height:' + hd + 'px;color:' + P.sub);
  var rr = rows.map(function (r, i) { var cells = r.c || r, e = H('div', 'tg-r', cells.map(function (v) { return '<span>' + h.md(v) + '</span>' }).join(''), box, gt + ';height:' + rh + 'px'); e.setAttribute('data-key', String(cells[0] && cells[0].t || cells[0])); return e });
  var fy = y + hd + n * rh + 14;
  if (s.legend) H('div', 'tg-lg', '<span style="color:' + P.sub + '"><i style="background:' + (s.legend[0] === '#B4461E' ? P.warn : s.legend[0]) + (s.legend[2] ? ';border:1px solid ' + s.legend[2] : '') + '"></i>' + h.esc(s.legend[1]) + '</span>', bd, 'position:absolute;left:0;top:' + fy + 'px');
  var af = s.after ? H('div', 'tg-af', h.md(s.after), bd, 'position:absolute;left:0;right:0;top:' + (fy + 30) + 'px;color:' + P.ink) : null;
  ctx.root.setAttribute('data-stg', 80);
  return { box: box, hr: hr, rows: rr, af: af, tt: tt, P: P, rh: rh, items: items, fy: fy } }
function grow(bd, s, ctx) { var T = tgBuild(bd, s, ctx), P = T.P, items = T.items, n = T.rows.length;
  if (T.tt) items.push({ el: T.tt, at: 0, ms: 450, kf: [{ opacity: 0 }, { opacity: 1 }] });
  items.push({ el: T.hr, at: 150, ms: 450, kf: [{ opacity: 0 }, { opacity: 1 }] });
  T.rows.forEach(function (e, i) { items.push({ el: e, at: 500 + i * 430, ms: 500, kf: [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }] }) });
  var t1 = 500 + n * 430 + 100, wr = ctx.dark ? '#5A2E1E' : P.warn;
  (s.marks || []).forEach(function (m, q) { var e = T.rows[m[0]]; if (!e) return; var c = e.children[m[1]]; if (!c) return;
    c.style.cssText += ';background:' + P.warn + ';color:' + (ctx.dark ? '#1D2521' : '#fff') + ';font-weight:800;border-radius:8px;margin:6px 8px;padding:0 6px;display:flex;align-items:center;justify-content:center';
    items.push({ el: c, at: t1 + q * 250, ms: 450, ease: 'cubic-bezier(.2,.7,.2,1)', kf: [{ transform: 'scale(.6)', opacity: .2 }, { transform: 'scale(1)', opacity: 1 }] }) });
  if (T.af) items.push({ el: T.af, at: t1 + 500, ms: 500, kf: [{ opacity: 0 }, { opacity: 1 }] });
  tgHook(ctx, items) }
function marker(bd, s, ctx) { var T = tgBuild(bd, s, ctx), P = T.P, items = T.items, m = s.marker || {}, e = T.rows[m.row];
  if (T.tt) items.push({ el: T.tt, at: 0, ms: 450, kf: [{ opacity: 0 }, { opacity: 1 }] });
  T.rows.forEach(function (r, i) { if (i !== m.row) r.style.color = ctx.dark ? P.sub : P.mute });
  if (e) { var bandc = ctx.dark ? '#F2C46B' : '#FFF3B0', band = H('i', null, null, e, 'position:absolute;left:0;right:0;top:3px;bottom:3px;background:' + bandc + ';border-radius:6px;z-index:0');
    e.style.color = '#1D2521'; var c = e.children[m.col == null ? 0 : m.col]; c.innerHTML = '<mark class="tg-m" style="color:#1D2521' + (ctx.dark ? ';background:none' : '') + '">' + c.innerHTML + '</mark>';
    for (var q = 0; q < e.children.length; q++) e.children[q].style.fontWeight = '800';
    items.push({ el: band, at: 500, ms: 700, kf: [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }] });
    items.push({ el: c.firstChild, at: 900, ms: 800, kf: [{ backgroundSize: '0% 62%' }, { backgroundSize: '100% 62%' }] }) }
  if (T.af) items.push({ el: T.af, at: 1900, ms: 500, kf: [{ opacity: 0 }, { opacity: 1 }] });
  tgHook(ctx, items) }
function years(bd, s, ctx) { var T = tgBuild(bd, s, ctx), P = T.P, items = T.items, cols = s.cols || [], bar = s.bar || {}, hl = s.hl, rows = s.rows || [], mxv = 0;
  if (T.tt) items.push({ el: T.tt, at: 0, ms: 450, kf: [{ opacity: 0 }, { opacity: 1 }] });
  rows.forEach(function (r, i) { if (i === bar.row) (r.c || r).slice(1).forEach(function (v) { mxv = Math.max(mxv, Math.abs(parseFloat(String(v).replace(/\*\*/g, '').replace(/[,−]/g, function (z) { return z === '−' ? '-' : '' }).replace(/[^0-9.\-]/g, '')) || 0)) }) });
  mxv = bar.max || mxv || 1;
  [T.hr].concat(T.rows).forEach(function (e, ri) { var i = ri - 1; var lab = e.children[0];
    if (i === hl && lab) lab.style.cssText += ';background:' + P.warn + ';color:' + (ctx.dark ? '#1D2521' : '#fff') + ';border-radius:8px;margin:6px 0;padding:0 14px;display:flex;align-items:center;font-weight:800';
    for (var j = 1; j < e.children.length; j++) { var c = e.children[j]; items.push({ el: c, at: 400 + (j - 1) * 800, ms: 500, kf: [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }] });
      if (i === bar.row) { var v = Math.abs(parseFloat(String(((rows[i].c || rows[i])[j])).replace(/\*\*/g, '').replace(/−/g, '-').replace(/[^0-9.\-]/g, '')) || 0), bw = Math.min(1, v / mxv);
        c.style.flexDirection = 'column'; c.style.display = 'flex'; c.style.justifyContent = 'center'; c.style.gap = '6px';
        c.insertAdjacentHTML('beforeend', '<u style="display:block;height:14px;border-radius:4px;background:' + (j === cols.length - 1 ? P.main : P.g40) + ';width:' + (bw * 100).toFixed(1) + '%;align-self:flex-start;text-decoration:none"></u>');
        items.push({ el: c.lastChild, at: 400 + (j - 1) * 800 + 450, ms: 700, kf: [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }] }) } } });
  if (T.af) items.push({ el: T.af, at: 400 + (cols.length - 1) * 800 + 700, ms: 500, kf: [{ opacity: 0 }, { opacity: 1 }] });
  tgHook(ctx, items) }
var LAY = { heat: heat, grow: grow, marker: marker, years: years }, baseFn = base;
ECOM.parts.table = function (bd, s, ctx) { var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.table.layouts = ['default', 'bars', 'heat', 'grow', 'marker', 'years'];
ECOM.parts.table.dark = ['grow', 'marker', 'years'];
})();
