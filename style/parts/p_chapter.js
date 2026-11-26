/* p_chapter.js — 간지(part) 새 배치 6가지. a_frame.js 의 part 가 s.layout 이 있으면 ECOM.chapter 를 부름(default 는 기존 그림).
   칸(공통): no · name · desc · parts[이름] · idx   배치별:
   chip   : items[3] 「이 장에서 볼 것」                      (밝은 연초록 바탕 기본 · deep 가능)
   num    : parts · idx 로 장 순서 띠                           (흰 바탕 기본 · deep 가능)
   giant  : word(큰 키워드) · cards[{label,value,dec,unit}] · desc 부제     (짙은 바탕 고정)
   strike : tag(붉은 태그) · name 안의 strike(취소선 낱말) · repl(바뀐 말) · desc  (짙은 바탕 고정)
   ruler  : from · to · step · hi[시작,끝] · marks[{year,text}]   (짙은 바탕 고정)
   dots   : name 글자가 노랑 동그라미로 하나씩 박힘 · desc          (짙은 바탕 고정)
   움직임은 data-b · data-at · _hook 안에서만(기본 DOM = 끝 모습). */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, Cd = ECOM.Cd, E = h.E, esc = h.esc, md = h.md;
var DEEP = '#003D2B', MINT = '#E9F3EE', YEL = '#F2C46B';
function D(css, html, attr, cls) { return '<div' + (cls ? ' class="' + cls + '"' : '') + ' style="position:absolute;' + css + '"' + (attr ? ' ' + attr : '') + '>' + (html == null ? '' : html) + '</div>' }
function logo(dark) { return '<div style="position:absolute;right:56px;bottom:22px;height:24px;display:flex;align-items:center">' + ECOM.logo(dark, 'lgw').replace('<img ', '<img style="height:24px" ').replace('<b ', '<b style="font-size:20px" ') + '</div>' }
function partNo(s) { return esc(s.no || '') }
function paint(el, bg) { el.style.background = bg }

/* 장 순서 띠 : parts 이름 칸들 가운데 idx 가 현재 */
function strip(s, P, y, dark) { if (!s.parts) return '';
  return D('left:72px;right:72px;top:' + y + 'px;display:flex;gap:14px;font-size:16px;font-weight:600', s.parts.map(function (p, i) { var on = i === s.idx;
    return '<div data-b="9" data-fx="rise" style="flex:1;border-top:3px solid ' + (on ? P.main : (dark ? 'rgba(255,255,255,.2)' : C.gray)) + ';padding-top:10px;color:' + (on ? (dark ? '#fff' : C.dark) : (dark ? 'rgba(255,255,255,.55)' : C.mute)) + '">' + esc(p) + '</div>' }).join('')) }

/* chip : PART 칩 + 큰 제목 + 이 장에서 볼 것 3개 */
function chip(el, s, ctx) { var dk = ctx.dark, P = dk ? Cd : C; paint(el, dk ? DEEP : MINT);
  var it = (s.items || []).slice(0, 4), n = Math.max(1, it.length), gap = 24, w = (1136 - gap * (n - 1)) / n;
  el.innerHTML = D('left:90px;right:90px;top:96px;height:310px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center',
      '<span data-b="1" data-fx="pop" style="display:inline-block;padding:7px 22px;border-radius:6px;background:' + (dk ? Cd.main : C.main) + ';color:' + (dk ? DEEP : '#fff') + ';font-size:20px;font-weight:700;letter-spacing:.06em">' + partNo(s) + '</span>'
      + '<div data-b="2" style="font-size:66px;font-weight:700;letter-spacing:-.04em;line-height:1.16;color:' + (dk ? '#fff' : C.dark) + '">' + md(s.name || '') + '</div>'
      + (s.desc ? '<div data-b="3" style="font-size:20px;line-height:1.5;color:' + P.sub + '">' + md(s.desc) + '</div>' : ''))
    + D('left:72px;top:430px;font-size:16px;font-weight:700;letter-spacing:.14em;color:' + P.main, '이 장에서 볼 것', 'data-b="4"')
    + it.map(function (t, i) { return D('left:' + (72 + i * (w + gap)) + 'px;top:460px;width:' + w + 'px;height:140px;border-radius:6px;background:' + (dk ? Cd.g08 : '#fff') + ';border:1.5px solid ' + (dk ? 'rgba(255,255,255,.14)' : C.g18) + ';padding:20px 22px;display:flex;gap:14px;align-items:flex-start',
      '<i style="flex:0 0 auto;font-style:normal;width:30px;height:30px;border-radius:50%;background:' + P.main + ';color:' + (dk ? DEEP : '#fff') + ';font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center">' + (i + 1) + '</i>'
      + '<span style="font-size:20px;font-weight:600;line-height:1.4;color:' + (dk ? '#fff' : C.ink) + '">' + md(t) + '</span>', 'data-b="5" data-fx="rise" data-key="' + esc(String(t).replace(/\*\*/g, '')) + '"') }).join('')
    + logo(dk) }

/* num : 번호 마름모 + 큰 청록 제목 + 장 순서 띠 */
function num(el, s, ctx) { var dk = ctx.dark, P = dk ? Cd : C; paint(el, dk ? DEEP : '#fff');
  var n = String(s.no || '').replace(/\D/g, '') || '1';
  el.innerHTML = '<svg viewBox="0 0 1280 720" width="1280" height="720" style="position:absolute;left:0;top:0"><g data-b="1" data-fx="pop"><path d="M640 112 L704 176 L640 240 L576 176 Z" fill="' + P.main + '"/>'
    + '<text x="640" y="190" text-anchor="middle" font-size="36" font-weight="700" fill="' + (dk ? DEEP : '#fff') + '">' + esc(+n) + '</text></g>'
    + '<path d="M72 176 H540 M740 176 H1208" stroke="' + (dk ? 'rgba(255,255,255,.2)' : C.g18) + '" stroke-width="3" data-b="1" data-fx="growx" data-ms="700"/></svg>'
    + D('left:90px;right:90px;top:262px;height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center',
      '<div data-b="2" style="font-size:84px;font-weight:700;letter-spacing:-.045em;line-height:1.1;color:' + (dk ? Cd.main : C.main) + '">' + md(s.name || '') + '</div>'
      + (s.desc ? '<div data-b="3" style="font-size:26px;line-height:1.5;color:' + P.sub + '">' + md(s.desc) + '</div>' : ''))
    + strip(s, P, 620, dk) + logo(dk) }
function textLen(t) { return String(t || '').replace(/\*\*/g, '').length }

/* giant : 큰 키워드 → 줄어들며 위로 → 부제 · 핵심 숫자 카드 */
function giant(el, s, ctx) { paint(el, DEEP); var P = Cd, w = String(s.word || s.name || ''), fs = 100;
  var kw = h.textW(w, fs, true), cards = (s.cards || []).slice(0, 3), n = Math.max(1, cards.length), gap = 24, cw = (1136 - gap * (n - 1)) / n;
  el.innerHTML = D('left:72px;top:92px;font-size:' + ECOM.fs(fs) + 'px;font-weight:800;letter-spacing:-.045em;line-height:1.1;white-space:nowrap;color:' + Cd.main, esc(w), 'data-at="0" data-fx="fade" data-ms="300" class="gk"')
    + D('left:76px;top:48px;font-size:16px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.62)', partNo(s) + (s.name && s.word ? ' · ' + esc(s.name.replace(/\*\*/g, '')) : ''), 'data-at="1700" data-fx="fade"')
    + (s.desc ? D('left:76px;right:140px;top:222px;font-size:26px;font-weight:500;line-height:1.45;color:#fff', md(s.desc), 'data-at="1500" data-fx="rise" data-ms="600"') : '')
    + cards.map(function (c, i) { return D('left:' + (72 + i * (cw + gap)) + 'px;top:352px;width:' + cw + 'px;height:230px;border-radius:6px;background:' + Cd.g08 + ';border:1.5px solid rgba(255,255,255,.14);padding:26px 30px',
      '<div style="font-size:18px;font-weight:600;color:' + Cd.sub + '">' + esc(c.label || '') + '</div>'
      + '<div style="position:absolute;left:30px;right:30px;bottom:34px;font-size:84px;font-weight:700;letter-spacing:-.04em;line-height:1;color:#fff"><span data-count="' + h.num(c.value) + '" data-dec="' + h.num(c.dec) + '" data-ms="900" data-at="' + (1900 + i * 160) + '">' + h.nf(h.num(c.value), h.num(c.dec)) + '</span><small style="font-size:26px;font-weight:600;margin-left:6px;color:' + Cd.main + '">' + esc(c.unit || '') + '</small></div>',
      'data-at="' + (1800 + i * 160) + '" data-fx="rise" data-ms="600" data-key="' + esc(c.label || '') + '"') }).join('')
    + logo(true);
  var big = el.querySelector('.gk');
  ctx.root._hook = function () { if (h.RM()) return 0; var k = 2.5, cx = 72 + kw / 2, cy = 92 + fs * .55, dx = 640 - cx, dy = 360 - cy;
    big.style.transformOrigin = '50% 50%'; var a = big.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')', offset: 0 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + k + ')', offset: .38 }, { transform: 'none', offset: 1 }], { duration: 1500, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'both' }); a._fx = 1; return 1500 } }

/* strike : 붉은 태그 → 낱말에 취소선 → 바뀐 말이 위에 씀 */
function strike(el, s, ctx) { paint(el, DEEP); var nm = String(s.name || '').replace(/\*\*/g, ''), sw = String(s.strike || ''), i = nm.indexOf(sw), a = nm.slice(0, i < 0 ? nm.length : i), b = i < 0 ? '' : nm.slice(i + sw.length);
  var fs = 128, W = h.textW(nm, fs, true), L = Math.max(72, (1280 - W) / 2), stW = h.textW(sw, fs, true);
  el.innerHTML = D('left:0;right:0;top:150px;text-align:center', '<span style="display:inline-block;padding:9px 26px;background:' + C.warn + ';color:#fff;font-size:26px;font-weight:700;letter-spacing:.08em">' + esc(s.tag || '') + '</span>', 'data-b="1" data-fx="drop" data-dy="40" data-ms="600"')
    + D('left:0;right:0;top:300px;text-align:center;font-size:' + ECOM.fs(fs) + 'px;font-weight:800;letter-spacing:-.04em;line-height:1.1;white-space:nowrap;color:#fff',
      esc(a) + '<span style="position:relative;display:inline-block">' + esc(sw)
      + '<i data-at="1200" data-fx="growx" data-ms="700" data-o="0% 50%" style="position:absolute;left:-10px;right:-10px;top:56%;height:12px;background:' + Cd.warn + ';transform-origin:0 50%"></i>'
      + (s.repl ? '<b data-at="2100" data-fx="rise" data-ms="650" style="position:absolute;left:0;right:0;bottom:100%;margin-bottom:-6px;text-align:center;font-size:70px;font-weight:800;color:' + Cd.main + ';letter-spacing:-.03em">' + esc(s.repl) + '</b>' : '') + '</span>' + esc(b), 'data-b="2"')
    + (s.desc ? D('left:140px;right:140px;top:488px;text-align:center;font-size:26px;line-height:1.5;color:' + Cd.sub, md(s.desc), 'data-at="2500" data-fx="rise"') : '')
    + D('left:72px;bottom:28px;font-size:16px;font-weight:700;letter-spacing:.14em;color:rgba(255,255,255,.55)', partNo(s) + ' · 붉은 선 = 바뀌기 전 말 · 민트 글씨 = 바뀐 말', 'data-b="9" data-fx="fade"')
    + logo(true) }

/* ruler : 제목 + 연도 눈금 + 이 장이 다룰 구간 */
function ruler(el, s, ctx) { paint(el, DEEP); var f = +s.from || 2000, t = +s.to || 2025, st = +s.step || 5, hi = s.hi || [f, t], x0 = 72, x1 = 1208, X = function (y) { return x0 + (x1 - x0) * (y - f) / (t - f) }, ay = 560, ticks = '', ys = [];
  for (var y = f; y <= t; y += st) ys.push(y);
  var svg = '<svg viewBox="0 0 1280 720" width="1280" height="720" style="position:absolute;left:0;top:0">'
    + '<rect x="' + X(hi[0]) + '" y="' + (ay - 44) + '" width="' + (X(hi[1]) - X(hi[0])) + '" height="44" fill="' + Cd.main + '" data-at="1300" data-fx="growx" data-ms="800" data-o="0% 50%"/>'
    + '<text x="' + (X(hi[0]) + 14) + '" y="' + (ay - 14) + '" font-size="18" font-weight="700" fill="' + DEEP + '" data-at="1900" data-fx="fade">이 장이 다룰 구간 ' + hi[0] + '~' + hi[1] + '</text>'
    + '<path d="M' + x0 + ' ' + ay + ' H' + x1 + '" stroke="rgba(255,255,255,.75)" stroke-width="3" data-at="300" data-fx="growx" data-ms="900" data-o="0% 50%"/>'
    + ys.map(function (y, i) { return '<path d="M' + X(y) + ' ' + ay + ' v10" stroke="rgba(255,255,255,.75)" stroke-width="3" data-at="' + (500 + i * 40) + '" data-fx="fade"/><text x="' + X(y) + '" y="' + (ay + 36) + '" text-anchor="middle" font-size="16" font-weight="600" fill="rgba(255,255,255,.75)" data-at="' + (500 + i * 40) + '" data-fx="fade">' + y + '</text>' }).join('')
    + (s.marks || []).map(function (m, i) { var x = X(+m.year), up = i % 2 ? 150 : 110; return '<path d="M' + x + ' ' + (ay - 46) + ' V' + (ay - 46 - up + 30) + '" stroke="' + Cd.on + '" stroke-width="1.5" data-at="' + (2100 + i * 220) + '" data-fx="growx" data-o="50% 100%"/><circle cx="' + x + '" cy="' + (ay - 46) + '" r="5" fill="#fff" data-at="' + (2100 + i * 220) + '" data-fx="pop"/>'
      + '<text x="' + x + '" y="' + (ay - 46 - up + 18) + '" text-anchor="middle" font-size="16" font-weight="600" fill="#fff" data-at="' + (2200 + i * 220) + '" data-fx="rise">' + esc(m.year + ' ' + m.text) + '</text>' }).join('') + '</svg>';
  el.innerHTML = D('left:72px;top:96px;font-size:16px;font-weight:700;letter-spacing:.14em;color:' + Cd.main, partNo(s), 'data-b="1"')
    + D('left:72px;right:200px;top:124px;font-size:76px;font-weight:700;letter-spacing:-.045em;line-height:1.1;color:#fff', md(s.name || ''), 'data-b="1"')
    + (s.desc ? D('left:72px;right:300px;top:240px;font-size:26px;line-height:1.5;color:' + Cd.sub, md(s.desc), 'data-b="2"') : '') + svg
    + D('left:72px;bottom:28px;font-size:16px;color:rgba(255,255,255,.55)', '민트 띠 = 이 장이 다루는 구간 · 흰 눈금 = 연도', 'data-at="2000" data-fx="fade"') + logo(true) }

/* dots : 노랑 동그라미 글자가 하나씩 박혀 제목 조립 */
function dots(el, s, ctx) { paint(el, DEEP); var words = String(s.name || '').replace(/\*\*/g, '').split(/\s+/).filter(Boolean), tot = words.join('').length, one = tot <= 9, gp = 14, wg = 56, k = 0, out = '', r, rows;
  rows = one ? [words] : words.map(function (w) { return [w] });
  var mxl = Math.max.apply(null, rows.map(function (rw) { return rw.join('').length })), mxw = Math.max.apply(null, rows.map(function (rw) { return rw.length }));
  r = Math.min(150, Math.floor((1060 - (mxl - 1) * gp - (mxw - 1) * (wg - gp)) / mxl)); var rh = r + gp, y0 = 340 - rows.length * rh / 2 + 6;
  rows.forEach(function (rw, ri) { var tw = mxl && rw.join('').length * r + (rw.join('').length - 1) * gp + (rw.length - 1) * (wg - gp), x = (1280 - tw) / 2;
    rw.forEach(function (w) { w.split('').forEach(function (c) { out += D('left:' + x + 'px;top:' + (y0 + ri * rh) + 'px;width:' + r + 'px;height:' + r + 'px;border-radius:50%;background:' + YEL + ';color:' + DEEP + ';font-size:' + ECOM.fs(Math.round(r * .56)) + 'px;font-weight:800;display:flex;align-items:center;justify-content:center', esc(c), 'data-at="' + (200 + k * 110) + '" data-fx="pop" data-ms="420"'); k++; x += r + gp }); x += wg - gp }) });
  el.innerHTML = D('left:0;right:0;top:92px;text-align:center;font-size:20px;font-weight:700;letter-spacing:.16em;color:' + Cd.main, partNo(s), 'data-b="1"') + out
    + (s.desc ? D('left:150px;right:150px;bottom:92px;text-align:center;font-size:26px;line-height:1.5;color:' + Cd.sub, md(s.desc), 'data-at="' + (400 + k * 110) + '" data-fx="rise"') : '') + logo(true) }

var LAY = { chip: chip, num: num, giant: giant, strike: strike, ruler: ruler, dots: dots };
ECOM.chapter = function (el, s, ctx) { var f = LAY[s.layout]; if (!f) return; el.classList.add('pt-v5'); f(el, s, ctx) };
ECOM.parts.part.layouts = ['default', 'chip', 'num', 'giant', 'strike', 'ruler', 'dots'];
ECOM.parts.part.dark = ['chip', 'num', 'giant', 'strike', 'ruler', 'dots'];
})();
