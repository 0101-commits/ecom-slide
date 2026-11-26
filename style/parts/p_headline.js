/* p_headline.js — 헤드라인 카드(영상 장면 문법). 기사 제목이 줄별 · 단어별로 들어오고 핵심어만 붉게 · 띠로 강조됨. 제목은 지어낸 예시 문구(실제 기사 아님).
   문장 안 **핵심어** 가 강조. 기본 DOM = 끝 모습, 색 바뀜 · 띠 긋기 · 단어 등장은 _hook 안에서만.
   배치 card  : 출처 줄 → 노랑 세로선 → 제목 2줄 줄별 등장 → 핵심어 붉게 → 숫자 칸 셋
                칸 src{name,date} · title[줄1, 줄2] · by · hl('red' 기본 | 'mark' 노랑 형광) · facts[{label,value,unit,dec,sub}] · legend
   배치 stack : 헤드라인 3~4개가 흰 띠로 시간 순 쌓임 + 날짜 칩 + 맨 끝 요약 · 칸 items[{date,src,title}] · summary{label,text}
   배치 type  : (짙은 바탕 권장) 날짜 먼저 → 제목이 단어 단위로 찍힘 → 주황 띠가 핵심어에 길어짐 · 칸 src{name,date} · title(문자열) · by · facts · legend */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, H = h.H, esc = h.esc, YEL = '#FFE066', ORG = '#E2552B';
if (!document.getElementById('p-headline-css')) { var st = document.createElement('style'); st.id = 'p-headline-css';
  st.textContent = [
    '.ph-a{position:absolute;box-sizing:border-box}',
    '.ph-src{display:flex;align-items:center;gap:18px;font-size:16px}.ph-src b{font-size:16px;font-weight:800;letter-spacing:.04em}.ph-src i{flex:1;height:1px;display:block}',
    '.ph-t{font-weight:800;letter-spacing:-.03em;white-space:nowrap}',
    '.ph-k{font-style:normal}.ph-k.y{background:linear-gradient(' + YEL + ',' + YEL + ') no-repeat 0 88%/100% 52%;padding:0 3px;margin:0 -3px}',
    '.ph-tile{position:absolute;box-sizing:border-box;border-radius:6px;padding:18px 24px;display:flex;flex-direction:column;justify-content:center}',
    '.ph-tile small{font-size:16px;font-weight:700}.ph-tile .v{font-weight:800;line-height:1.05;letter-spacing:-.03em;margin:8px 0 8px}.ph-tile .v u{text-decoration:none;font-size:.32em;font-weight:700;margin-left:6px}',
    '.ph-tile span{font-size:16px;line-height:1.45}',
    '.ph-lgd{display:flex;align-items:center;gap:8px;font-size:13px;white-space:nowrap}.ph-lgd i{width:22px;height:11px;border-radius:2px;display:inline-block}',
    '.ph-band{position:absolute;box-sizing:border-box;background:var(--g08);border:1px solid #DDE3E0;border-radius:6px;padding:0 26px;display:flex;flex-direction:column;justify-content:center;color:#1D2521;border-color:transparent}',
    '.ph-band small{font-size:13px;font-weight:700;color:#6B7570;margin-bottom:3px}.ph-band div{font-weight:800;letter-spacing:-.02em;line-height:1.35}',
    '.ph-no{font-style:normal;background:' + C.main + ';color:#fff;border-radius:6px;padding:1px 9px;margin-right:9px;font-size:13px;font-weight:800}',
    '.ph-band b{color:' + C.warn + '}',
    '.ph-chip{position:absolute;box-sizing:border-box;width:128px;height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;letter-spacing:.02em}',
    '.ph-w{display:inline-block;white-space:pre}',
    '.ph-mk{font-style:normal;color:#fff;background:linear-gradient(' + ORG + ',' + ORG + ') no-repeat 0 100%/100% 100%;padding:2px 12px;margin:0 -4px;border-radius:6px;-webkit-box-decoration-break:clone;box-decoration-break:clone}'
  ].join(''); document.head.appendChild(st) }

function fx(e, at, f, ms, extra) { e.setAttribute('data-at', at); e.setAttribute('data-fx', f); if (ms) e.setAttribute('data-ms', ms); if (extra) for (var k in extra) e.setAttribute(k, extra[k]); return e }
function hook(ctx, items) { ctx.root._hook = function () { if (h.RM()) return 0; var end = 0;
  items.forEach(function (it) { if (!it.el || !it.el.animate) return; var a = it.el.animate(it.kf, { duration: it.ms, delay: it.at, easing: it.ease || 'cubic-bezier(.4,0,.2,1)', fill: 'both' }); a._fx = 1; end = Math.max(end, it.at + it.ms) }); return end } }
function sweep(e, at, ms) { return { el: e, at: at, ms: ms || 800, kf: [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }] } }
function keyHTML(t, P, yel) { return esc(t).replace(/\*\*(.+?)\*\*/g, function (m, w) { return yel ? '<b class="ph-k y">' + w + '</b>' : '<b class="ph-k" style="color:' + P.warn + '">' + w + '</b>' }) }

function srcRow(p, o, css, P, at) { o = o || {};
  var r = H('div', 'ph-a ph-src', '<b style="color:' + P.ink + '">' + esc(o.name || '') + '</b><i style="background:' + P.axis + '"></i><span style="color:' + P.mute + '">' + esc(o.date || '') + '</span>', p, css);
  return fx(r, at, 'fade', 450) }
function tiles(p, F, top, hh, P, at0, vs) { F = (F || []).slice(0, 4); var n = F.length, gap = 18, w = (1168 - gap * (n - 1)) / n;
  F.forEach(function (f, i) { var t = H('div', 'ph-tile', '<small style="color:' + P.mute + '">' + esc(f.label || '') + '</small><div class="v" style="font-size:' + ECOM.fs(vs) + 'px;color:' + P.main + '"><span data-count="' + (f.value || 0) + '" data-dec="' + (f.dec || 0) + '" data-at="' + (at0 + i * 220) + '" data-fx="count" data-ms="900" style="font-size:inherit;line-height:inherit">' + h.nf(f.value, f.dec || 0) + '</span>' + (f.unit ? '<u>' + esc(f.unit) + '</u>' : '') + '</div><span style="color:' + P.sub + '">' + esc(f.sub || '') + '</span>', p,
      'left:' + (i * (w + gap)) + 'px;top:' + top + 'px;width:' + w + 'px;height:' + hh + 'px;background:' + P.paper + ';border:1px solid ' + P.line);
    t.setAttribute('data-key', f.label || ''); fx(t, at0 + i * 220, 'rise', 520) }) }
function legendHTML(P, sw, text) { return '<span class="ph-lgd" style="color:' + P.mute + '"><i style="background:' + sw + '"></i>' + esc(text) + '</span>' }

function card(bd, s, ctx) { var P = ctx.P, yel = s.hl === 'mark', items = [], tt = s.title || [];
  srcRow(bd, s.src, 'left:0;top:0;width:1168px', P, 0);
  var bar = H('div', 'ph-a', null, bd, 'left:0;top:64px;width:9px;height:142px;background:' + YEL); fx(bar, 150, 'grow', 500, { 'data-o': '50% 0%' });
  tt.slice(0, 2).forEach(function (ln, i) { var e = H('div', 'ph-a ph-t', keyHTML(ln, P, yel), bd, 'left:38px;top:' + (64 + i * 72) + 'px;font-size:52px;line-height:70px;color:' + P.ink); fx(e, 450 + i * 450, 'left', 600);
    [].forEach.call(e.querySelectorAll('.ph-k'), function (k) { if (yel) items.push(sweep(k, 1500, 700)); else items.push({ el: k, at: 1500, ms: 600, kf: [{ color: P.ink }, { color: P.warn }] }) }) });
  var by = H('div', 'ph-a', esc(s.by || '') + '<span style="float:right">' + legendHTML(P, yel ? YEL : P.warn, s.legend || (yel ? '노랑 띠 = 핵심어' : '붉은 글자 = 핵심어')) + '</span>', bd, 'left:38px;top:222px;width:1130px;font-size:16px;color:' + P.mute); fx(by, 1300, 'fade', 450);
  tiles(bd, s.facts, 276, 236, P, 1700, 70); hook(ctx, items) }

function stack(bd, s, ctx) { var P = ctx.P, it = (s.items || []).slice(0, 4), n = it.length || 1, SH = 100, region = 512 - SH - 18, pitch = region / n, bh = pitch - 14, fs = bh >= 100 ? 26 : 22, dot = [];
  var rail = H('div', 'ph-a', null, bd, 'left:149px;width:4px;top:' + (pitch / 2 - 7) + 'px;height:' + (pitch * (n - 1) + 14) + 'px;background:' + P.g40); fx(rail, 100, 'grow', 500 + n * 450, { 'data-o': '50% 0%' });
  it.forEach(function (o, i) { var t = i * 520 + 250, y = i * pitch, cy = y + bh / 2 + 7;
    var chip = H('div', 'ph-chip', esc(o.date || ''), bd, 'left:0;top:' + (cy - 17) + 'px;background:' + P.main + ';color:' + (ctx.dark ? '#003D2B' : '#fff')); fx(chip, t, 'pop', 400);
    var d = H('div', 'ph-a', null, bd, 'left:' + (151 - 8) + 'px;top:' + (cy - 8) + 'px;width:16px;height:16px;border-radius:50%;background:' + P.main + ';border:3px solid ' + (ctx.dark ? '#003D2B' : '#fff')); fx(d, t, 'pop', 300);
    var b = H('div', 'ph-band', '<small><em class="ph-no">' + (i + 1) + '</em>' + esc(o.src || '') + '</small><div style="font-size:' + ECOM.fs(fs) + 'px">' + h.esc(o.title || '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + '</div>', bd, 'left:190px;top:' + y + 'px;width:978px;height:' + bh + 'px;margin-top:7px'); fx(b, t + 120, 'slide', 650, { 'data-dx': -36 }); b.setAttribute('data-key', o.date || '') });
  var S = s.summary || {}, y0 = 512 - SH;
  var sc = H('div', 'ph-chip', esc(S.label || '요약'), bd, 'left:0;top:' + (y0 + SH / 2 - 17) + 'px;background:' + YEL + ';color:#1D2521'); fx(sc, n * 520 + 400, 'pop', 400);
  var sb = H('div', 'ph-a', '<div>' + h.esc(S.text || '').replace(/\*\*(.+?)\*\*/g, '<b style="color:' + YEL + '">$1</b>') + '</div>', bd, 'left:190px;top:' + y0 + 'px;width:978px;height:' + SH + 'px;border-radius:6px;padding:0 30px;display:flex;align-items:center;font-size:26px;line-height:1.4;font-weight:800;letter-spacing:-.02em;color:#fff;background:' + (ctx.dark ? '#0E4635' : C.dark) + ';border:' + (ctx.dark ? '2px solid ' + P.main : '0'));
  fx(sb, n * 520 + 500, 'slide', 650, { 'data-dx': -36 }); sb.setAttribute('data-key', '요약'); ctx.root.setAttribute('data-gap', 300) }

function type(bd, s, ctx) { var P = ctx.P, items = [], o = s.src || {};
  var dt = H('div', 'ph-a', esc(o.date || ''), bd, 'left:0;top:2px;font-size:20px;font-weight:800;letter-spacing:.14em;color:' + P.main); fx(dt, 0, 'fade', 450);
  var ru = H('div', 'ph-a', null, bd, 'left:0;top:42px;width:1168px;height:2px;background:' + P.axis); fx(ru, 150, 'growx', 600);
  var nm = H('div', 'ph-a', esc(o.name || ''), bd, 'right:0;top:4px;font-size:16px;font-weight:800;letter-spacing:.04em;color:' + P.sub); fx(nm, 250, 'fade', 450);
  var ti = H('div', 'ph-a', null, bd, 'left:0;top:68px;width:1168px;font-size:84px;line-height:1.24;font-weight:800;letter-spacing:-.03em;color:' + P.ink), parts = String(s.title || '').split('**'), wi = 0;
  parts.forEach(function (seg, i) { var hit = i % 2 === 1, host = hit ? H('i', 'ph-mk', null, ti) : ti;  var ws = seg.split(/(\s+)/);
    ws.forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { host.appendChild(document.createTextNode(w)); return }
      var e = H('span', 'ph-w', esc(w), host); items.push({ el: e, at: 500 + wi * 85, ms: 260, kf: [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }] }); wi++ });
    });
  var base = 500 + wi * 85 + 100; [].forEach.call(ti.querySelectorAll('.ph-mk'), function (m, j) { items.push(sweep(m, base + j * 350, 750)) });
  var by = H('div', 'ph-a', esc(s.by || '') + '<span style="float:right">' + legendHTML(P, ORG, s.legend || '주황 띠 = 핵심어') + '</span>', bd, 'left:0;top:298px;width:1168px;font-size:16px;color:' + P.mute); fx(by, base + 500, 'fade', 450);
  tiles(bd, s.facts, 342, 170, P, base + 700, 50); hook(ctx, items); ctx.root.setAttribute('data-gap', 300) }

ECOM.parts.headline = function (bd, s, ctx) { var L = s.layout || 'default'; if (L === 'default') L = 'card';
  ({ card: card, stack: stack, type: type }[L] || card)(bd, s, ctx); if (L !== 'stack') ctx.root.setAttribute('data-gap', 300) };
ECOM.parts.headline.layouts = ['default', 'card', 'stack', 'type'];
ECOM.parts.headline.dark = ['default', 'card', 'stack', 'type'];
})();
