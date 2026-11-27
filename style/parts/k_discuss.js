/* discuss — 토의 장(Kick-off 13쪽 · CW44 14쪽) : 왼쪽 = 다룬 내용 번호 목록, 가운데 갈매기 화살, 오른쪽 = 토의 주제 상자 2~3개(물음 + 손들기 수)
   left{title,items:[{title,text}]} · right{title,topics:[{title,q}]} · vote(false = 손들기 없음)
   손들기 : 누르면 +1 · Shift 누르고 누르면 −1, 브라우저 localStorage(회차 · 장 · 주제별)에 남음. 가장 많은 주제 상자에 초록 테두리 
   배치 s.layout : default · qcards 질문 카드(주제를 큰 카드 2~3장으로, 논의 요약은 아래 띠, topics[].options(또는 choices)["찬성","반대"] 고를 답 2~4개 알약 — 누르면 그 답의 수 +1(Shift = −1, localStorage), 가장 많은 답 강조 · 없으면 손들기) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, K = ECOM.kx;
var HAND = '<svg viewBox="0 0 20 22" width="17" height="19"><path d="M6.5 11 V4.2 a1.4 1.4 0 0 1 2.8 0 V10 M9.3 9.6 V2.6 a1.4 1.4 0 0 1 2.8 0 V9.8 M12.1 9.8 V3.6 a1.4 1.4 0 0 1 2.8 0 V11 M14.9 10.6 V6.2 a1.4 1.4 0 0 1 2.8 0 V13 c0 4.2 -2.8 7.4 -6.6 7.4 c-2.6 0 -4.2 -1.2 -5.6 -3.2 L2.6 13.4 a1.5 1.5 0 0 1 2.4 -1.8 L6.5 13.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function store(k, v) { try { if (v == null) return +(localStorage.getItem(k) || 0); localStorage.setItem(k, String(v)) } catch (e) { } return v == null ? 0 : v }
function base(bd, s, ctx) {
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
  lead(); ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) }
/* ── 배치(s.layout) : 없거나 'default' = 위 그림 그대로 ──
   qcards : 질문 카드 — 토의 주제를 큰 카드(번호 · 주제 이름 · 물음 · 고를 것) 2~3장으로 가로로 세우고, 주요 논의사항은 아래 띠로 내림
            topics[].choices 가 있으면 고를 것 = 그 선택지 칩, 없으면 손들기 단추(같은 회차 · 장 · 주제의 손들기 숫자를 기본 배치와 함께 씀) */
var QCSS = false;
function qcards(bd, s, ctx) {
  var P = ctx.P, Lf = s.left || {}, Rt = s.right || {}, it = (Lf.items || []).slice(0, 4), tp = (Rt.topics || []).slice(0, 3), N = Math.max(1, tp.length), gap = 22, cw = (1168 - (N - 1) * gap) / N, CH = 338, vote = s.vote !== false;
  var key = 'ecom-vote|' + ((ctx.deck && ctx.deck.meta && ctx.deck.meta.session) || 'deck') + '|' + ctx.index + '|', mem = {}, boxes = [];
  if (!QCSS) { QCSS = true; var st = document.createElement('style'); st.textContent = '.k-qc{border-radius:6px;background:var(--g08);border:2px solid transparent;transition:border-color .3s}.k-qc.lead{border-color:var(--g)}.k-qc .qv{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--g40);background:#fff;color:var(--gdk);border-radius:999px;padding:4px 14px 4px 11px;font:inherit;font-size:16px;font-weight:700;cursor:pointer}.k-qc .qv:hover{border-color:var(--g)}.k-qc .qv em{font-style:normal;font-variant-numeric:tabular-nums;min-width:12px}.k-qc .qv.bump{animation:kbump .35s ease}.k-qc .qo{display:inline-flex;align-items:center;gap:8px;border:1.5px solid var(--g40);background:#fff;color:var(--gdk);border-radius:999px;padding:5px 12px 5px 16px;font:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:background .2s,border-color .2s}.k-qc .qo:hover{border-color:var(--g)}.k-qc .qo em{font-style:normal;font-variant-numeric:tabular-nums;min-width:20px;text-align:center;font-size:14px;background:var(--g08);border-radius:999px;padding:1px 7px}.k-qc .qo.lead{background:var(--g18);border-color:var(--g)}.k-qc .qo.bump{animation:kbump .35s ease}'; document.head.appendChild(st) }
  tp.forEach(function (q, i) { var k = key + i, n = store(k), ch = q.options || q.choices || [], opt = !!q.options && q.options.length > 0, vt = vote && !opt;
    var b = K.D(bd, 'kx k-qc', i * (cw + gap), 0, cw, CH, '<div style="position:absolute;left:28px;top:20px;right:28px;display:flex;align-items:center;gap:16px"><em style="font-style:normal;font-size:68px;font-weight:300;line-height:1;color:' + P.g65 + ';font-variant-numeric:tabular-nums">' + (i + 1) + '</em><b style="font-size:18px;line-height:1.35;color:' + P.dark + '">' + h.md(q.title || '') + '</b></div>'
      + '<div style="position:absolute;left:28px;right:28px;top:104px;border-top:1.5px solid ' + P.g40 + '"></div><div style="position:absolute;left:28px;right:28px;top:122px;bottom:84px;display:flex;align-items:center"><span style="font-size:20px;font-weight:600;line-height:1.55;letter-spacing:-.01em;color:' + P.ink + '">' + h.md(q.q || '') + '</span></div>'
      + '<div style="position:absolute;left:28px;right:28px;bottom:20px;display:flex;align-items:center;gap:10px;flex-wrap:wrap"><i style="font-style:normal;font-size:13px;font-weight:700;color:' + P.mute + ';margin-right:4px">고를 것</i>'
      + (ch.length ? ch.map(function (c, j) { return opt && vote ? '<button type="button" class="qo" data-o="' + j + '" title="누르면 +1 (Shift = 빼기)">' + h.esc(c) + '<em>' + store(k + 'o' + j) + '</em></button>' : '<span style="font-size:16px;font-weight:700;color:' + P.dark + ';background:#fff;border:1.5px solid ' + P.g40 + ';border-radius:999px;padding:4px 14px">' + h.esc(c) + '</span>' }).join('') : '<span style="font-size:16px;color:' + P.sub + '">이 물음에 손들기</span>')
      + (vt ? '<button type="button" class="qv" style="margin-left:auto" title="손들기 (Shift = 빼기)">' + HAND + '<em>' + n + '</em></button>' : '') + '</div>', { 'data-b': 2 + i, 'data-fx': 'rise', 'data-ms': 460, 'data-key': q.title });
    boxes.push(b); mem[i] = n;
    if (opt && vote) { var pills = [].slice.call(b.querySelectorAll('.qo')), cnt = pills.map(function (_, j) { return store(k + 'o' + j) });
      var mark = function () { var mx = Math.max.apply(null, cnt); pills.forEach(function (pb, j) { pb.classList.toggle('lead', mx > 0 && cnt[j] === mx) }) }; mark();
      pills.forEach(function (pb, j) { pb.addEventListener('click', function (ev) { ev.stopPropagation(); cnt[j] = Math.max(0, cnt[j] + (ev.shiftKey ? -1 : 1)); store(k + 'o' + j, cnt[j]); pb.querySelector('em').textContent = cnt[j];
        pb.classList.remove('bump'); void pb.offsetWidth; pb.classList.add('bump'); mark(); var sg = document.getElementById('stage'); if (sg) sg.focus() }) }) }
    if (vt) { var bt = b.querySelector('.qv'), em = bt.querySelector('em');
      bt.addEventListener('click', function (ev) { ev.stopPropagation(); var v = Math.max(0, (mem[i] || 0) + (ev.shiftKey ? -1 : 1)); mem[i] = v; store(k, v); em.textContent = v;
        bt.classList.remove('bump'); void bt.offsetWidth; bt.classList.add('bump'); lead(); var sg = document.getElementById('stage'); if (sg) sg.focus() }) } });
  function lead() { var mx = 0; tp.forEach(function (_, i) { mx = Math.max(mx, mem[i] || 0) }); boxes.forEach(function (b, i) { b.classList.toggle('lead', mx > 0 && mem[i] === mx) }) }
  lead();
  var sy = CH + 24, sh = 512 - sy, tw = 150, M = Math.max(1, it.length), iw = (1168 - tw - 14 - (M - 1) * 12) / M;
  K.D(bd, 'kx', 0, sy, tw, sh, '<div style="height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 14px;font-size:16px;font-weight:700;line-height:1.4;color:#fff">' + h.esc(Lf.title || '주요 논의사항') + '</div>', { 'data-b': 5, 'data-fx': 'left' }); bd.lastChild.style.background = P.dark; bd.lastChild.style.borderRadius = '12px';
  it.forEach(function (q, i) { K.D(bd, 'kx', tw + 14 + i * (iw + 12), sy, iw, sh, '<div style="padding:12px 16px;height:100%;display:flex;flex-direction:column;gap:5px;justify-content:center"><div style="display:flex;gap:8px;align-items:baseline"><em style="font-style:normal;font-size:16px;font-weight:700;color:' + P.g65 + '">' + (i + 1) + '</em><b style="font-size:16px;line-height:1.35;color:' + P.ink + '">' + h.md(q.title || '') + '</b></div>' + (q.text ? '<span style="font-size:13px;line-height:1.45;color:' + P.sub + '">' + h.md(q.text) + '</span>' : '') + '</div>', { 'data-b': 5, 'data-fx': 'left', 'data-key': q.title }); bd.lastChild.style.background = P.paper; bd.lastChild.style.borderRadius = '12px' });
  ctx.root.setAttribute('data-gap', 360); ctx.root.setAttribute('data-stg', 120) }
var LAY = { qcards: qcards }, baseFn = base;
ECOM.parts.discuss = function (bd, s, ctx) { if (s.layout === 'map' && ECOM.gm && ECOM.gm.ok(s)) return ECOM.gm.discuss(bd, s, ctx); var f = LAY[s.layout]; return f ? f(bd, s, ctx) : baseFn(bd, s, ctx) };
ECOM.parts.discuss.layouts = ['default', 'qcards', 'map'];
})();
