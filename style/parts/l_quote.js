/* quote — 문구 비교(성명서 · 보도자료 이전/이번). 줄마다 항목 · 지난 문구 · 이번 문구 · 오른쪽 칩 + 아래 척도 줄
   cols{item,old,new,side}(머리 글자, 기본 '' · '지난 회의' · '이번 회의' · '쪽') · rows[{item,old,new,side:'매파'|'비둘기'|'같음'|글자,tone:'main|warn|gray'}] (3~6줄)
   문자열 안 ~~지운 말~~(회색 취소선) · ++더한 말++(연초록 바탕 굵게) · scale{left,right,old,new,oldLabel,newLabel}(0~1, 없으면 척도 줄 없음)
   움직임 : 줄이 위에서 차례로 → (척도) 지난번 점 → 선 그리기 → 이번 점 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
if (!document.getElementById('l-quote-css')) { var st = document.createElement('style'); st.id = 'l-quote-css';
  st.textContent = [
    '.l-qr{position:absolute;left:0;width:1168px;box-sizing:border-box;border-radius:10px;display:flex;align-items:center;font-size:16px;line-height:1.5;color:var(--ink)}',
    '.l-qr.z{background:var(--paper)}.l-qi{flex:0 0 110px;box-sizing:border-box;padding-left:20px;font-weight:700}',
    '.l-qo{flex:0 0 394px;box-sizing:border-box;padding-right:20px;color:var(--mute);font-weight:500}.l-qn{flex:0 0 520px;box-sizing:border-box;padding-right:16px;font-weight:500}',
    '.l-qr .d{color:#9AA3A0;text-decoration:line-through;text-decoration-thickness:1.5px}',
    '.l-qr .a{background:var(--g18);color:var(--gdk);font-weight:700;border-radius:4px;padding:2px 3px;margin:0 -1px;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.l-qc{margin-left:auto;margin-right:14px;flex:0 0 auto;font-size:12.5px;font-weight:700;color:#fff;padding:5px 12px;border-radius:15px;white-space:nowrap}',
    '.l-qh{position:absolute;top:26px;font-size:14px;font-weight:700;color:var(--mute)}'
  ].join(''); document.head.appendChild(st) }
function rich(t) { return h.esc(t).replace(/~~(.+?)~~/g, '<span class="d">$1</span>').replace(/\+\+(.+?)\+\+/g, '<span class="a">$1</span>') }
ECOM.parts.quote = function (bd, s, ctx) {
  var root = ctx.root, rows = s.rows || [], n = rows.length, cols = s.cols || {}, sc = s.scale || null; if (!n) return;
  var top = 56, bottomY = sc ? 392 : 504, pitch = Math.min(84, (bottomY - top) / n), rh = pitch - 14;
  H2(bd, 'l-qh', cols.item || '', 'left:20px', 0); H2(bd, 'l-qh', cols.old || '지난 문구', 'left:110px', 0); var hn = H2(bd, 'l-qh', cols.new || '이번 문구', 'left:504px;color:var(--gdk)', 0);
  H2(bd, 'l-qh', cols.side || '', 'right:14px', 0);
  rows.forEach(function (r, i) { var tone = r.tone || ({ '매파': 'warn', '비둘기': 'main', '같음': 'gray' }[r.side] || 'main'), bg = tone === 'warn' ? C.warn : tone === 'gray' ? C.gray : C.main, fg = tone === 'gray' ? C.cmp : '#fff';
    var row = h.H('div', 'l-qr' + (i % 2 === 0 ? ' z' : ''), '<div class="l-qi">' + h.esc(r.item || '') + '</div><div class="l-qo">' + rich(r.old || '') + '</div><div class="l-qn">' + rich(r.new || '') + '</div>'
      + (r.side ? '<div class="l-qc" style="background:' + bg + ';color:' + fg + '">' + h.esc(r.side) + '</div>' : ''), bd, 'top:' + (top + i * pitch) + 'px;height:' + rh + 'px');
    row.setAttribute('data-at', 150 + i * 220); row.setAttribute('data-fx', 'fade'); row.setAttribute('data-ms', 360) });
  if (sc) { var svg = ctx.svg(512), y = 458, x0 = 244, x1 = 924, X = function (v) { return x0 + (x1 - x0) * Math.max(0, Math.min(1, v)) }, t0 = 150 + n * 220 + 200, g0 = h.at(svg, t0, { 'data-fx': 'fade', 'data-ms': 360 });
    E('line', { x1: x0, x2: x1, y1: y, y2: y, stroke: C.light, 'stroke-width': 8, 'stroke-linecap': 'round' }, g0);
    T(g0, x0 - 14, y + 5, sc.left || '매파', { 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: C.warn }); T(g0, x1 + 14, y + 5, sc.right || '비둘기', { 'font-size': 14, 'font-weight': 700, fill: C.main });
    var a = X(sc.old), b = X(sc.new), dir = b >= a ? 1 : -1, ga = h.at(svg, t0 + 300, { 'data-fx': 'pop', 'data-ms': 300 });
    E('circle', { cx: a, cy: y, r: 9, fill: '#fff', stroke: C.axis, 'stroke-width': 3 }, ga); T(ga, a, y - 18, sc.oldLabel || '지난번', { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, fill: C.mute });
    E('line', { x1: a + dir * 12, x2: b - dir * 22, y1: y, y2: y, stroke: C.main, 'stroke-width': 3, 'stroke-linecap': 'round', 'data-at': t0 + 700, 'data-fx': 'draw', 'data-ms': 600 }, svg);
    var gh = h.at(svg, t0 + 1250, { 'data-fx': 'fade', 'data-ms': 160 }), hx = b - dir * 14;
    E('path', { d: 'M' + hx + ' ' + y + ' L' + (hx - dir * 11) + ' ' + (y - 6.5) + ' L' + (hx - dir * 11) + ' ' + (y + 6.5) + ' Z', fill: C.main }, gh);
    var gb = h.at(svg, t0 + 1300, { 'data-fx': 'pop', 'data-ms': 320 }); E('circle', { cx: b, cy: y, r: 11, fill: C.dark }, gb); T(gb, b, y - 20, sc.newLabel || '이번', { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: C.dark }) }
  root.setAttribute('data-gap', 300);
  function H2(p, cls, txt, css, at) { var e = h.H('div', cls, h.esc(txt), p, css); e.setAttribute('data-at', at); e.setAttribute('data-fx', 'fade'); return e }
};
})();
