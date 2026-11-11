/* discuss — 토의 장(Kick-off 13쪽 · CW44 14쪽) : 왼쪽 = 다룬 내용 번호 목록, 가운데 갈매기 화살, 오른쪽 = 토의 주제 상자 2~3개(물음 + 손들기 수)
   left{title,items:[{title,text}]} · right{title,topics:[{title,q}]} · vote(false = 손들기 없음)
   손들기 : 누르면 +1 · Shift 누르고 누르면 −1, 브라우저 localStorage(회차 · 장 · 주제별)에 남음. 가장 많은 주제 상자에 초록 테두리 */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
var HAND = '<svg viewBox="0 0 20 22" width="17" height="19"><path d="M6.5 11 V4.2 a1.4 1.4 0 0 1 2.8 0 V10 M9.3 9.6 V2.6 a1.4 1.4 0 0 1 2.8 0 V9.8 M12.1 9.8 V3.6 a1.4 1.4 0 0 1 2.8 0 V11 M14.9 10.6 V6.2 a1.4 1.4 0 0 1 2.8 0 V13 c0 4.2 -2.8 7.4 -6.6 7.4 c-2.6 0 -4.2 -1.2 -5.6 -3.2 L2.6 13.4 a1.5 1.5 0 0 1 2.4 -1.8 L6.5 13.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function store(k, v) { try { if (v == null) return +(localStorage.getItem(k) || 0); localStorage.setItem(k, String(v)) } catch (e) { } return v == null ? 0 : v }
ECOM.parts.discuss = function (bd, s, ctx) {
  var Lf = s.left || {}, Rt = s.right || {}, it = (Lf.items || []).slice(0, 4), tp = (Rt.topics || []).slice(0, 3), LW = 600, RX = 676, RW = 1168 - RX, vote = s.vote !== false;
  var key = 'ecom-vote|' + ((ctx.deck && ctx.deck.meta && ctx.deck.meta.session) || 'deck') + '|' + ctx.index + '|', mem = {};
  K.D(bd, 'kx k-dsh', 0, 0, LW, 36, h.esc(Lf.title || '주요 논의사항'), { 'data-b': 1, 'data-fx': 'fade' });
  K.D(bd, 'kx k-dsh', RX, 0, RW, 36, h.esc(Rt.title || '토의 주제'), { 'data-b': 1, 'data-fx': 'fade' });
  var ih = (512 - 56) / Math.max(1, it.length);
  it.forEach(function (q, i) { K.D(bd, 'kx k-dsi', 0, 56 + i * ih, LW, ih, '<em>' + (i + 1) + '</em><div><b>' + h.md(q.title || '') + '</b>' + (q.text ? '<span>' + h.md(q.text) + '</span>' : '') + '</div>', { 'data-b': 2, 'data-fx': 'left' }) });
  var svg = K.svg(ctx), gid = 'kdsg' + ctx.index, df = E('defs', {}, svg), lg = E('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 }, df);
  E('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 0 }, lg); E('stop', { offset: 1, 'stop-color': C.gray }, lg);
  E('path', { d: 'M' + (LW + 14) + ' 70 L' + (RX - 14) + ' 284 L' + (LW + 14) + ' 498 L' + (LW + 30) + ' 284 Z', fill: 'url(#' + gid + ')', 'data-b': 3, 'data-fx': 'left', 'data-ms': 420 }, svg);
  var th = (512 - 56 - (tp.length - 1) * 22) / Math.max(1, tp.length), boxes = [];
  tp.forEach(function (q, i) { var k = key + i, n = store(k);
    var b = K.D(bd, 'kx k-dst', RX, 56 + i * (th + 22), RW, th, '<b>' + h.md(q.title || '') + '</b><hr><span>' + h.md(q.q || '') + '</span>'
      + (vote ? '<button type="button" class="vote" title="손들기 (Shift = 빼기)">' + HAND + '<em>' + n + '</em></button>' : ''), { 'data-b': 4, 'data-fx': 'pop', 'data-ms': 420 });
    boxes.push(b); mem[i] = n;
    if (vote) { var bt = b.querySelector('.vote'), em = bt.querySelector('em');
      bt.addEventListener('click', function (ev) { ev.stopPropagation(); var v = Math.max(0, (mem[i] || 0) + (ev.shiftKey ? -1 : 1)); mem[i] = v; store(k, v); em.textContent = v;
        bt.classList.remove('bump'); void bt.offsetWidth; bt.classList.add('bump'); lead(); var sg = document.getElementById('stage'); if (sg) sg.focus() }) } });
  function lead() { var mx = 0; tp.forEach(function (_, i) { mx = Math.max(mx, mem[i] || 0) }); boxes.forEach(function (b, i) { b.classList.toggle('lead', mx > 0 && mem[i] === mx) }) }
  lead(); ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) };
})();
