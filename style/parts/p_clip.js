/* p_clip.js — 문서 발췌 + 형광펜(영상 장면 문법). 문서 카드 위 핵심 구절에 형광이 왼→오로 그어지고, 확대 · 대비 · 표시가 이어짐.
   문장 안 ==핵심 구절== 이 형광(한 문서에 한 군데 · marks 는 행 단위). 기본 DOM = 끝 모습, 긋기 · 흐림 · 확대는 _hook 안에서만.
   배치 doc    : 문서 카드(왼) + 큰따옴표 확대 카드(오른쪽) + 풀이   · 칸 doc{title,meta,lines[]} · quote{text(없으면 형광 구절),gloss} · legend
   배치 focus  : 본문 → 나머지 줄 흐려지고 핵심 한 줄만 가운데로 커짐 · 칸 doc{…} · gloss
   배치 pair   : 문서 둘 나란히(색 둘 = 두 쪽) + 아래 대비 한 줄 · 칸 pair[{title,meta,tag,lines[]}×2] · contrast{text}
   배치 marks  : 표 문서에서 여러 행이 차례로 형광 + 행 끝 숫자 · 칸 table{title,meta,cols[],widths[],rows[[…]],marks[행 번호]} · sum{label,value,unit,dec,note} · legend */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, H = h.H, esc = h.esc, YEL = '#FFE066', MINT = '#8FE0C0', ROW = '#FFE88A';
if (!document.getElementById('p-clip-css')) { var st = document.createElement('style'); st.id = 'p-clip-css';
  st.textContent = [
    '.pc-card{position:absolute;box-sizing:border-box;background:#fff;border:1px solid #DDE3E0;border-radius:6px;display:flex;flex-direction:column;overflow:hidden;color:#1D2521}',
    '.pc-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 22px;border-bottom:1px solid #E1E6E3;background:#F5F7F6;font-size:16px}',
    '.pc-hd b{font-weight:800;display:flex;align-items:center}.pc-hd>span{font-size:13px;color:#6B7570;white-space:nowrap}',
    '.pc-tag{font-style:normal;font-size:13px;font-weight:700;padding:3px 10px;border-radius:6px;margin-right:10px;color:#1D2521;white-space:nowrap}',
    '.pc-tag.a{background:' + YEL + '}.pc-tag.b{background:' + MINT + '}',
    '.pc-lines{flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:18px 26px 20px;gap:6px}',
    '.pc-l{font-size:18px;line-height:1.55;color:#6B7570}.pc-l.key{color:#1D2521}',
    '.pc-card.sm .pc-l{font-size:16px;line-height:1.5}',
    '.pc-m{background:linear-gradient(' + YEL + ',' + YEL + ') no-repeat 0 62%/100% 62%;color:#1D2521;font-weight:700;padding:0 2px;margin:0 -2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}',
    '.pc-m.b{background-image:linear-gradient(' + MINT + ',' + MINT + ')}',
    '.pc-ar{position:absolute;width:0;height:0;border-left:30px solid ' + YEL + ';border-top:16px solid transparent;border-bottom:16px solid transparent}',
    '.pc-q{position:relative;box-sizing:border-box;width:100%;padding-top:64px!important;background:' + C.dark + ';border:2px solid ' + YEL + ';border-radius:6px;padding:22px 30px 24px;color:#fff}',
    '.pc-q::before{content:\'\\201C\';position:absolute;left:30px;top:20px;font-size:70px;line-height:1;font-weight:800;color:' + YEL + '}',
    '.pc-q p{margin:0;font-size:26px;line-height:1.42;font-weight:800;letter-spacing:-.02em}',
    '.pc-gl{margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,.28);font-size:16px;line-height:1.5;color:#D8EFE5}',
    '.pc-gl em{font-style:normal;font-size:13px;font-weight:800;background:' + YEL + ';color:#1D2521;border-radius:6px;padding:2px 9px;margin-right:9px}',
    '.pc-lg{position:absolute;left:0;bottom:0;display:flex;align-items:center;gap:8px;font-size:13px}',
    '.pc-lg i{width:26px;height:12px;border-radius:2px;display:inline-block}',
    '.pc-fk{margin:12px 0;padding:14px 0;text-align:center;font-size:36px;line-height:1.38;font-weight:800;letter-spacing:-.02em;color:#1D2521}',
    '.pc-fg{text-align:center;font-size:18px;line-height:1.5;color:#3E4743;font-weight:600}',
    '.pc-fg em{font-style:normal;font-size:13px;font-weight:800;background:' + YEL + ';border-radius:6px;padding:2px 9px;margin-right:9px;color:#1D2521}',
    '.pc-dim{opacity:.34;font-size:20px}',
    '.pc-bs{margin-top:26px;display:flex;flex-direction:column;gap:16px}.pc-bs div{display:flex;justify-content:space-between;font-size:16px;font-weight:700;margin-bottom:6px}',
    '.pc-bs u{display:block;height:12px;border-radius:6px;text-decoration:none}',
    '.pc-ph{position:absolute;box-sizing:border-box;border-radius:6px;display:flex;align-items:center;gap:14px;padding:0 22px;height:76px;font-size:20px;font-weight:800;color:#1D2521;letter-spacing:-.02em}',
    '.pc-ph em{font-style:normal;font-size:13px;font-weight:800;background:rgba(255,255,255,.7);border-radius:6px;padding:3px 10px;white-space:nowrap}',
    '.pc-cn{position:absolute;left:0;width:1168px;text-align:center;font-size:26px;line-height:1.45;font-weight:800;letter-spacing:-.02em}',
    '.pc-tb{flex:1;display:flex;flex-direction:column;padding:4px 16px 12px}',
    '.pc-r{position:relative;flex:1;display:grid;align-items:center;column-gap:12px;padding:0 14px;border-bottom:1px solid #E1E6E3;font-size:16px;color:#6B7570}',
    '.pc-r.h{flex:0 0 40px;font-size:13px;font-weight:700;color:#3E4743;border-bottom:2px solid #9AA3A0}',
    '.pc-r.on{color:#1D2521;font-weight:700}.pc-r>span{position:relative;z-index:1}',
    '.pc-rb{position:absolute;left:0;right:0;top:5px;bottom:5px;background:' + ROW + ';border-radius:6px;display:none}.pc-r.on .pc-rb{display:block}',
    '.pc-r>span:last-child{text-align:right;font-size:18px;font-weight:800}.pc-r.on>span:last-child{font-size:20px}.pc-r.h>span:last-child{font-size:13px}',
    '.pc-pn{position:absolute;box-sizing:border-box;border-radius:6px;padding:26px 28px;display:flex;flex-direction:column}',
    '.pc-pn small{font-size:16px;font-weight:700}.pc-pn .v{font-size:72px;line-height:1.05;font-weight:800;margin-top:12px;letter-spacing:-.03em}.pc-pn .v u{text-decoration:none;font-size:20px;font-weight:700;margin-left:6px}',
    '.pc-pn p{margin:14px 0 0;font-size:16px;line-height:1.6}'
  ].join(''); document.head.appendChild(st) }

function rich(t, tone) { return esc(t).replace(/==(.+?)==/g, '<mark class="pc-m ' + (tone || 'a') + '">$1</mark>') }
function phrase(t) { var m = /==(.+?)==/.exec(t || ''); return m ? m[1] : '' }
function plain(t) { return String(t || '').replace(/==/g, '') }
function fade(e, at, ms) { e.setAttribute('data-at', at); e.setAttribute('data-fx', 'fade'); e.setAttribute('data-ms', ms || 500) }
/* 긋기 · 흐림 · 확대 — 끝 모습이 기본 DOM, 여기는 시작 → 끝 움직임만(settle 이 끝나면 지움) */
function hook(ctx, items) { ctx.root._hook = function () { if (h.RM()) return 0; var end = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, it.at + it.ms) }); return end } }
function swipe(el, at, ms) { return { el: el, at: at, ms: ms || 800, kf: [{ backgroundSize: '0% 62%' }, { backgroundSize: '100% 62%' }] } }

/* 문서 카드 : 제목 줄 + 본문 줄(회색 = 실제 문장, 형광 = 핵심) */
function docCard(p, o, css, tone, small) { o = o || {};
  var d = H('div', 'pc-card' + (small ? ' sm' : ''), null, p, css), tag = o.tag ? '<i class="pc-tag ' + (tone || 'a') + '">' + esc(o.tag) + '</i>' : '';
  H('div', 'pc-hd', '<b>' + tag + esc(o.title || '') + '</b><span>' + esc(o.meta || '') + '</span>', d);
  var bx = H('div', 'pc-lines', null, d), key = null;
  (o.lines || []).forEach(function (t) { var hit = /==/.test(t), ln = H('div', 'pc-l' + (hit ? ' key' : ''), rich(t, tone), bx); if (hit && !key) key = ln });
  d.setAttribute('data-key', o.title || ''); return { card: d, box: bx, key: key, marks: [].slice.call(d.querySelectorAll('mark')) } }

function legendRow(p, css, P, tone, text) { var g = H('div', 'pc-lg', '<i style="background:' + (tone === 'b' ? MINT : YEL) + '"></i><span style="color:' + P.sub + '">' + esc(text) + '</span>', p, css); return g }

function doc(bd, s, ctx) { var P = ctx.P, D = docCard(bd, s.doc, 'left:0;top:0;width:628px;height:512px', 'a'), q = s.quote || {};
  fade(D.card, 0, 500);
  var ar = H('div', 'pc-ar', null, bd, 'left:638px;top:240px'); fade(ar, 1500, 400);
  var side = H('div', null, null, bd, 'position:absolute;left:692px;top:0;width:476px;height:512px;display:flex;align-items:center'),
    qc = H('div', 'pc-q', '<p>' + esc(q.text || phrase((s.doc.lines || []).join('\n'))) + '</p><div class="pc-gl"><em>풀이</em>' + esc(q.gloss || '') + '</div>', side);
  qc.setAttribute('data-at', 1700); qc.setAttribute('data-fx', 'zoom'); qc.setAttribute('data-ms', 650); qc.setAttribute('data-key', '확대 문장');
  var lg = legendRow(side, '', P, 'a', s.legend || '형광 = 문서의 핵심 문장'); lg.setAttribute('data-at', 2300); lg.setAttribute('data-fx', 'fade');
  hook(ctx, D.marks.map(function (m) { return swipe(m, 700, 850) })) }

function focus(bd, s, ctx) { var o = s.doc || {}, d = H('div', 'pc-card', null, bd, 'left:0;top:0;width:1168px;height:512px'), kt = '';
  fade(d, 0, 500);
  H('div', 'pc-hd', '<b>' + esc(o.title || '') + '</b><span>' + esc(o.meta || '') + '</span>', d);
  var bx = H('div', 'pc-lines', null, d, 'justify-content:center;padding:14px 86px 18px;gap:7px'), dims = [], kp = null, mk = null;
  (o.lines || []).forEach(function (t) { var hit = /==/.test(t);
    if (hit && !kp) { var kb = H('div', 'pc-fk', rich(t, 'a'), bx); kp = kb; mk = [].slice.call(kb.querySelectorAll('mark')) }
    else dims.push(H('div', 'pc-l pc-dim', esc(plain(t)), bx)) });
  var g = H('div', 'pc-fg', '<em>풀이</em>' + esc(s.gloss || ''), bx); fade(g, 2100, 500); g.style.marginTop = '6px';
  var items = (mk || []).map(function (m) { return swipe(m, 300, 700) });
  dims.forEach(function (e) { items.push({ el: e, at: 1200, ms: 700, kf: [{ opacity: 1 }, { opacity: .34 }] }) });
  if (kp) items.push({ el: kp, at: 1200, ms: 800, kf: [{ transform: 'scale(.5)' }, { transform: 'scale(1)' }], ease: 'cubic-bezier(.2,.7,.2,1)' });
  hook(ctx, items) }

function pair(bd, s, ctx) { var P = ctx.P, pr = s.pair || [], tones = ['a', 'b'], items = [], cards = [];
  pr.slice(0, 2).forEach(function (o, i) { var D = docCard(bd, o, 'left:' + (i ? 600 : 0) + 'px;top:0;width:568px;height:318px', tones[i], true); fade(D.card, i * 450, 500); cards.push(D);
    D.marks.forEach(function (m) { items.push(swipe(m, 800 + i * 900, 800)) });
    var bg = i ? '#E4F6EE' : '#FFF5C7', bar = i ? MINT : YEL, ph = phrase((o.lines || []).join('\n'));
    var b = H('div', 'pc-ph', '<em>' + esc(o.tag || (i ? '이번' : '지난')) + '</em><span>' + esc(ph) + '</span>', bd, 'left:' + (i ? 648 : 0) + 'px;top:336px;width:520px;background:' + bg + ';border:2px solid ' + bar);
    b.setAttribute('data-at', 2500 + i * 450); b.setAttribute('data-fx', 'slide'); b.setAttribute('data-dy', 14); b.setAttribute('data-key', (o.tag || '') + ' 구절') });
  var ar = H('div', null, '→', bd, 'position:absolute;left:520px;width:128px;top:336px;height:76px;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:' + P.main); fade(ar, 3000, 400);
  if (s.contrast) { var cn = H('div', 'pc-cn', '<div>' + h.md(s.contrast.text || '') + '</div>', bd, 'top:430px;height:78px;display:flex;align-items:center;justify-content:center;color:' + P.ink); fade(cn, 3300, 500);
    [].forEach.call(cn.querySelectorAll('b'), function (b) { b.style.color = P.main }) }
  hook(ctx, items) }

function marks(bd, s, ctx) { var P = ctx.P, T = s.table || {}, cols = T.cols || [], rows = T.rows || [], on = {}, wd = T.widths || cols.map(function (c, i) { return i === cols.length - 1 ? '120px' : '1fr' }), items = [];
  (T.marks || []).forEach(function (i) { on[i] = 1 });
  var d = H('div', 'pc-card', null, bd, 'left:0;top:0;width:790px;height:512px'); fade(d, 0, 500);
  H('div', 'pc-hd', '<b>' + esc(T.title || '') + '</b><span>' + esc(T.meta || '') + '</span>', d);
  var tb = H('div', 'pc-tb', null, d), gt = 'grid-template-columns:' + wd.join(' ');
  H('div', 'pc-r h', cols.map(function (c) { return '<span>' + esc(c) + '</span>' }).join(''), tb, gt);
  var n = 0; rows.forEach(function (r, i) { var m = on[i] ? ' on' : '', e = H('div', 'pc-r' + m, '<i class="pc-rb"></i>' + r.map(function (c) { return '<span>' + esc(c) + '</span>' }).join(''), tb, gt); e.setAttribute('data-key', String(r[0]));
    if (on[i]) { var rb = e.querySelector('.pc-rb'), nm = e.lastChild; items.push({ el: rb, at: 700 + n * 520, ms: 700, kf: [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }] });
      items.push({ el: nm, at: 700 + n * 520 + 300, ms: 400, kf: [{ opacity: .3 }, { opacity: 1 }] }); n++ } });
  var S = s.sum || {}, pn = H('div', 'pc-pn', '<small style="color:' + P.mute + '">' + esc(S.label || '') + '</small><div class="v" style="color:' + P.main + '"><span data-count="' + (S.value || 0) + '" data-dec="' + (S.dec || 0) + '" data-at="' + (900 + n * 520) + '" data-fx="count" data-ms="900">' + h.nf(S.value, S.dec || 0) + '</span><u>' + esc(S.unit || '') + '</u></div><p style="color:' + P.sub + '">' + esc(S.note || '') + '</p>', bd,
    'left:822px;top:0;width:346px;height:512px;background:' + P.paper + ';border:1px solid ' + P.line);
  var hit = [], mx = 1; rows.forEach(function (r, i) { var v = Math.abs(parseFloat(String(r[r.length - 1]).replace('−', '-').replace(/[^0-9.\-]/g, '')) || 0); if (on[i]) { hit.push([r[0], r[r.length - 1], v]); mx = Math.max(mx, v) } });
  var bs = H('div', 'pc-bs', hit.map(function (q) { return '<section><div style="color:' + P.ink + '"><span>' + esc(q[0]) + '</span><span>' + esc(q[1]) + '</span></div><u style="width:' + Math.round(q[2] / mx * 100) + '%;background:' + ROW + '"></u></section>' }).join(''), pn);
  [].forEach.call(bs.querySelectorAll('u'), function (u, i) { items.push({ el: u, at: 900 + n * 520 + i * 200, ms: 600, kf: [{ transform: 'scaleX(0)', transformOrigin: '0 50%' }, { transform: 'scaleX(1)', transformOrigin: '0 50%' }] }) });
  pn.setAttribute('data-key', '합계'); fade(pn, 400, 500);
  legendRow(pn, 'left:28px;bottom:26px', P, 'a', s.legend || '형광 = 표시한 행');
  pn.lastChild.firstChild.style.background = ROW; hook(ctx, items) }

ECOM.parts.clip = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'doc';
  ({ doc: doc, focus: focus, pair: pair, marks: marks }[L] || doc)(bd, s, ctx); ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.clip.layouts = ['default', 'doc', 'focus', 'pair', 'marks'];
ECOM.parts.clip.dark = ['default', 'doc', 'focus', 'pair', 'marks'];
})();
