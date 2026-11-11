/* ECOM 발표 엔진 3판 — 꼬리표 · 헤드메시지 2줄 · 꽉 찬 본문 · 자동 쌓기 + 바뀜 단계 · 장 넘김 8종 · 왼쪽 아래 각주 · 오른쪽 아래 로고
   화면 종류는 style/parts/*.js 가 ECOM.parts[kind] 로 더함. ecs.py build 가 deck.js → parts(이름순) 를 한 <script> 에 붙이고,
   시작은 DOMContentLoaded 에서 함(그래서 parts 가 먼저 다 등록됨). 형식 = style/SCHEMA3.md */
(function () {
'use strict';
var ECOM = window.ECOM = window.ECOM || {}; ECOM.parts = ECOM.parts || {};
var NS = 'http://www.w3.org/2000/svg';
var C = ECOM.C = { main: '#00744F', dark: '#005136', g65: '#4D9E83', g40: '#99C7B9', g18: '#D1E8E0', g08: '#ECF5F1', on: '#8FD9B6',
  cmp: '#3E4743', gray: '#C9D1CD', light: '#E1E6E3', grid: '#E3E8E5', axis: '#9AA3A0', mute: '#6B7570', ink: '#1D2521', sub: '#3E4743',
  warn: '#B4461E', warnsoft: '#F6EDE8', paper: '#F5F7F6', well: '#EEF3F0', line: '#DDE3E0' };
var EIN = 'cubic-bezier(.05,.7,.1,1)', ESTD = 'cubic-bezier(.2,0,.38,.9)', EOUT = 'cubic-bezier(.3,0,.8,.15)';
var Q = new URLSearchParams(location.search), STILL = Q.has('still'), CHECK = Q.has('check'), PRES = Q.has('presenter');
var RMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function RM() { return STILL || CHECK || PRES || (RMQ && RMQ.matches) || document.hidden }
function dur(ms) { return RM() ? 1 : ms }

/* ───────── 그리기 도움 ───────── */
function E(t, a, p) { var e = document.createElementNS(NS, t); if (a) for (var k in a) if (a[k] !== undefined && a[k] !== null && k !== 'lh') e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e }
function T(p, x, y, s, a) { a = a || {}; var e = E('text', Object.assign({ x: x, y: y }, a), p), L = String(s == null ? '' : s).split('\n');
  if (L.length === 1) e.textContent = L[0]; else L.forEach(function (t, i) { var ts = E('tspan', { x: x, dy: i ? (a.lh || 1.3) + 'em' : 0 }, e); ts.textContent = t }); return e }
function H(tag, cls, html, p, css) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (css) e.style.cssText = css; if (p) p.appendChild(e); return e }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') }
function nf(v, d, o) { if (v == null || isNaN(v)) return '—'; d = d == null ? 0 : d; var r = Math.abs(v).toFixed(d), s = r.split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  var zero = +r === 0, sg = v < 0 && !zero ? '−' : (o && o.sign && v > 0 && !zero ? '+' : ''); return sg + s.join('.') }
function textW(s, size, bold) { var w = 0; s = String(s); for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i), ch = s[i];
    if (c >= 0xAC00 && c <= 0xD7A3 || c >= 0x3130 && c <= 0x318F) w += .94; else if (/[0-9]/.test(ch)) w += .58; else if (/[.,:;·]/.test(ch)) w += .3;
    else if (ch === ' ') w += .27; else if (ch === '%') w += .86; else if (/[A-Z]/.test(ch)) w += .66; else if (/[a-z]/.test(ch)) w += .54; else if (/[()\[\]]/.test(ch)) w += .34; else w += .62 }
  return w * size * (bold ? 1.03 : 1) }
function wrap(s, size, maxW, bold) { var words = String(s).split(' '), L = [], cur = ''; words.forEach(function (w) { var t = cur ? cur + ' ' + w : w;
    if (textW(t, size, bold) > maxW && cur) { L.push(cur); cur = w } else cur = t }); if (cur) L.push(cur); return L }
function niceTicks(lo, hi, n) { n = n || 5; var span = hi - lo; if (span <= 0) { span = Math.abs(hi) || 1; lo -= span / 2; hi += span / 2; span = hi - lo }
  var st = Math.pow(10, Math.floor(Math.log10(span / n))), err = span / n / st; if (err >= 7.5) st *= 10; else if (err >= 3.5) st *= 5; else if (err >= 1.5) st *= 2;
  var a = Math.floor(lo / st) * st, b = Math.ceil(hi / st) * st, out = []; for (var v = a; v <= b + st / 2; v += st) out.push(+v.toFixed(10)); return { lo: a, hi: b, step: st, ticks: out } }
function decOf(st) { return st >= 1 ? 0 : st >= .1 ? 1 : 2 }
function lin(d0, d1, r0, r1) { return function (v) { return r0 + (r1 - r0) * (v - d0) / ((d1 - d0) || 1) } }
function lv(p, b, extra) { var a = { 'data-b': b }; for (var k in extra) a[k] = extra[k]; return E('g', a, p) }
function at(p, ms, extra) { var a = { 'data-at': ms }; for (var k in extra) a[k] = extra[k]; return E('g', a, p) }
function tri(p, x, y, up, s, fill, extra) { var d = up ? 'M' + x + ' ' + (y - s) + ' L' + (x + s * .95) + ' ' + (y + s * .7) + ' L' + (x - s * .95) + ' ' + (y + s * .7) + ' Z'
  : 'M' + x + ' ' + (y + s) + ' L' + (x + s * .95) + ' ' + (y - s * .7) + ' L' + (x - s * .95) + ' ' + (y - s * .7) + ' Z'; return E('path', Object.assign({ d: d, fill: fill }, extra || {}), p) }
function arrow2(p, x, y0, y1, col, w) { col = col || C.dark; w = w || 1.6; var a = Math.min(y0, y1) + 3, b = Math.max(y0, y1) - 3; E('line', { x1: x, x2: x, y1: a, y2: b, stroke: col, 'stroke-width': w }, p);
  E('path', { d: 'M' + (x - 5) + ' ' + (a + 8) + ' L' + x + ' ' + a + ' L' + (x + 5) + ' ' + (a + 8), fill: 'none', stroke: col, 'stroke-width': w }, p);
  E('path', { d: 'M' + (x - 5) + ' ' + (b - 8) + ' L' + x + ' ' + b + ' L' + (x + 5) + ' ' + (b - 8), fill: 'none', stroke: col, 'stroke-width': w }, p) }
function bracket(p, x0, x1, y, col, up) { var d = up === false ? 'M' + x0 + ' ' + (y - 6) + ' V' + y + ' H' + x1 + ' V' + (y - 6) : 'M' + x0 + ' ' + (y + 6) + ' V' + y + ' H' + x1 + ' V' + (y + 6);
  return E('path', { d: d, fill: 'none', stroke: col || C.dark, 'stroke-width': 1.5 }, p) }
function legend(p, x, y, items) { items.forEach(function (it) { var c = col(it.color);
    if (it.type === 'box') E('rect', { x: x, y: y - 11, width: 14, height: 12, rx: 2, fill: c }, p);
    else E('line', { x1: x, x2: x + 22, y1: y - 4, y2: y - 4, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': it.type === 'dash' ? '4 4' : null }, p);
    var w = it.type === 'box' ? 20 : 28; T(p, x + w, y, it.text, { 'font-size': 13, fill: C.sub }); x += w + textW(it.text, 13) + 20 }); return x }
function stepD(a, X, Y) { var d = '', pen = false; for (var i = 0; i < a.length; i++) { if (a[i] == null) { pen = false; continue }
    if (!pen) { d += (d ? ' ' : '') + 'M' + X(i - .5) + ' ' + Y(a[i]); pen = true } else d += ' H' + X(i - .5) + ' V' + Y(a[i]); d += ' H' + X(i + .5) } return d }
function lineD(a, X, Y) { var d = '', pen = false; for (var i = 0; i < a.length; i++) { if (a[i] == null) { pen = false; continue } d += (pen ? ' L' : (d ? ' M' : 'M')) + X(i) + ' ' + Y(a[i]); pen = true } return d }
function col(c) { return C[c] || c || C.main }
function ext(a) { var lo = Infinity, hi = -Infinity; a.forEach(function (v) { if (v != null && !isNaN(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v) } }); return [lo, hi] }

/* ───────── 움직임 : 쌓기(data-b 단계 · data-at 시각) · 숫자 굴림 · 바뀜 ───────── */
function cText(e, v) { return (e.getAttribute('data-pre') || '') + nf(v, +(e.getAttribute('data-dec') || 0), { sign: e.getAttribute('data-sign') === '1' }) + (e.getAttribute('data-suf') || '') }
function later(root, fn, ms) { (root._tm = root._tm || []).push(setTimeout(fn, dur(ms))) }
function A(el, kf, ms, ease, delay, fill) { if (!el || !el.animate) return null; return el.animate(kf, { duration: dur(ms), easing: ease || 'ease', delay: RM() ? 0 : (delay || 0), fill: fill || 'both' }) }
function AF(e, kf, ms, ease, delay) { var a = A(e, kf, ms, ease, delay); if (a) a._fx = 1; return a }
function fx(root, e, delay) {
  var f = e.getAttribute('data-fx') || (e.classList && e.classList.contains('draw') ? 'draw' : 'rise'), ms = +(e.getAttribute('data-ms') || 0);
  if (e.hasAttribute('data-count')) {
    var to = +e.getAttribute('data-count'), fr = +(e.getAttribute('data-from') || 0), cm = ms || 900; e.textContent = cText(e, fr);
    later(root, function () { var t0 = null; function st(ts) { if (t0 === null) t0 = ts; var q = Math.min(1, (ts - t0) / cm); q = 1 - Math.pow(1 - q, 3); e.textContent = cText(e, fr + (to - fr) * q); if (q < 1) root._raf.push(requestAnimationFrame(st)) } root._raf.push(requestAnimationFrame(st)) }, delay);
    if (f === 'count') return delay + cm;
  }
  if (f === 'draw' && e.getTotalLength) { var L = e.getTotalLength(); e.style.strokeDasharray = L + ' ' + L; AF(e, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], ms || 900, ESTD, delay); return delay + (ms || 900) }
  if (f === 'grow' || f === 'growx') { e.style.transformBox = 'fill-box'; e.style.transformOrigin = e.getAttribute('data-o') || (f === 'grow' ? '50% 100%' : '0% 50%');
    A(e, f === 'grow' ? [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }] : [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], ms || 420, EIN, delay); return delay + (ms || 420) }
  if (f === 'pop') { e.style.transformBox = 'fill-box'; e.style.transformOrigin = '50% 50%'; AF(e, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], ms || 380, EIN, delay); return delay + (ms || 380) }
  if (f === 'fade') { AF(e, [{ opacity: 0 }, { opacity: 1 }], ms || 420, 'linear', delay); return delay + (ms || 420) }
  if (f === 'drop') { var dy = +(e.getAttribute('data-dy') || 220); AF(e, [{ opacity: 0, transform: 'translateY(-' + dy + 'px)' }, { opacity: 1, offset: .25 }, { opacity: 1, transform: 'translateY(0)' }], ms || 760, ESTD, delay); return delay + (ms || 760) }
  if (f === 'left') { AF(e, [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'translateX(0)' }], ms || 360, EIN, delay); return delay + (ms || 360) }
  if (f === 'right') { AF(e, [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'translateX(0)' }], ms || 360, EIN, delay); return delay + (ms || 360) }
  AF(e, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], ms || 320, EIN, delay); return delay + (ms || 320);
}
function stopPlay(root) {
  (root._tm || []).forEach(clearTimeout); (root._raf || []).forEach(cancelAnimationFrame); root._tm = []; root._raf = [];
  if (root.getAnimations) root.getAnimations({ subtree: true }).forEach(function (a) { var t = a.effect && a.effect.target;
    if ((window.CSSAnimation && a instanceof CSSAnimation) || t === root || (t && t.classList && (t.classList.contains('mv') || t.classList.contains('ch')))) return; a.cancel() });
  root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.strokeDasharray = ''; if (e.hasAttribute('data-count')) e.textContent = cText(e, +e.getAttribute('data-count')) });
  if (root._reset) root._reset(root); root._until = 0 }
function prep(root) { stopPlay(root); if (RM()) return; root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = 0 }); if (root._prep) root._prep(root) }
function play(root, skip) {
  stopPlay(root); root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' });
  if (RM()) { if (root._done) root._done(root); return 0 }
  var gap = +(root.getAttribute('data-gap') || 300), stg = +(root.getAttribute('data-stg') || 45), byL = {}, end = 0;
  root.querySelectorAll('[data-b],[data-at]').forEach(function (e) {
    if (skip && (e === skip || e.hasAttribute('data-carry-host'))) return;
    if (e.hasAttribute('data-at')) { end = Math.max(end, fx(root, e, +e.getAttribute('data-at'))); return }
    var l = +e.getAttribute('data-b'); (byL[l] = byL[l] || []).push(e) });
  Object.keys(byL).forEach(function (l) { byL[l].forEach(function (e, i) { end = Math.max(end, fx(root, e, (l - 1) * gap + i * stg)) }) });
  if (root._hook) end = Math.max(end, root._hook(root) || 0);
  later(root, function () { settle(root); if (root._done) root._done(root) }, end + 30);
  root._until = performance.now() + end; return end }
/* 쌓기가 끝나면 쌓기 움직임(끝 모습 = 기본값)만 지움 — 바뀜 단계에서 style.opacity 로 흐리게 하는 것이 먹도록. 부품 고리(_hook)의 움직임은 그대로 둠 */
function settle(root) { if (!root.getAnimations) return; root.getAnimations({ subtree: true }).forEach(function (a) { if (a._fx === 1 && a.playState === 'finished') a.cancel() }) }
function finish(root) { stopPlay(root); root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' }); if (root._done) root._done(root) }

ECOM.h = { E: E, T: T, H: H, esc: esc, md: md, nf: nf, textW: textW, wrap: wrap, niceTicks: niceTicks, decOf: decOf, lin: lin, lv: lv, at: at, tri: tri, arrow2: arrow2,
  bracket: bracket, legend: legend, stepD: stepD, lineD: lineD, col: col, ext: ext, A: A, later: later, dur: dur, RM: RM, cText: cText, EIN: EIN, ESTD: ESTD, EOUT: EOUT, C: C };

/* ───────── 장 만들기 ───────── */
var D = null, S = [], cur = -1, beatK = 0, origin = null, stage, deckEl, timers = [], chan = null, scaleK = 1, trans = null;
var LOGO = window.ECOM_LOGO || {};
function logoImg(white, cls) { var src = white ? LOGO.white : LOGO.green; return src ? '<img class="' + (cls || '') + '" src="' + src + '" alt="ECOM">' : '<b class="' + (cls || '') + '" style="font-size:20px;color:' + (white ? '#fff' : C.main) + '">ECOM</b>' }
ECOM.logo = logoImg;
function eyebrow(s) { var e = s.eyebrow; if (!e) return ''; if (typeof e === 'string') return '<b>' + esc(e) + '</b>';
  return '<b>' + esc(e.group || '') + '</b>' + (e.topic ? '<span>' + esc(e.topic) + '</span>' : '') + (e.basis ? '<em>' + esc(e.basis) + '</em>' : '') }
function footHTML(s) { var f = s.foot || {}, out = [], n = f.notes || [];
  if (n.length) out.push('주: ' + n.map(function (x, i) { return (i + 1) + ') ' + esc(x) }).join(' &nbsp;'));
  if (f.source) out.push('출처: ' + esc(f.source) + (f.asof ? ' (' + esc(f.asof) + ' 기준)' : '')); return out.join('<br>') }
function pageOf(i) { var x = S[i]; return x.apx ? x.s.appendix : String(x.page) }
function buildSlide(x) {
  var s = x.s, el = document.createElement('div'), kind = s.kind || 'line', part = ECOM.parts[kind]; el.className = 'sl'; el._s = s; x.el = el;
  var ctx = { W: 1168, H: 512, root: el, deck: D, index: x.i, page: pageOf(x.i), apx: x.apx };
  ctx.svg = function (h, bd) { var v = E('svg', { class: 'cv', viewBox: '0 0 1168 ' + (h || 512), width: 1168, height: h || 512 }); (bd || ctx.bd).appendChild(v); return v };
  if (kind === 'cover' || kind === 'part' || s.bare) { try { if (part) part(el, s, ctx); } catch (err) { el.innerHTML = '<p style="padding:40px;color:#B4461E">' + esc(kind) + ' 오류: ' + esc(err.message) + '</p>'; console.error(err) } }
  else {
    var lk = '';
    if (x.apx) lk = '<a data-back="1">← 본문으로</a>';
    else if (s.links && s.links.length) lk = s.links.map(function (l) { return '<a data-to="' + esc(l.to) + '">' + esc(l.text || l.to) + ' →</a>' }).join('');
    el.innerHTML = '<div class="tag ch">' + eyebrow(s) + '</div><div class="hm mv">' + md(s.head || '') + '</div><div class="bd mv"></div><div class="fn ch">' + footHTML(s) + '</div>'
      + '<div class="lg ch">' + logoImg(false) + '<span>' + esc(ctx.page) + '</span></div>' + (lk ? '<div class="lk ch">' + lk + '</div>' : '');
    ctx.bd = el.querySelector('.bd');
    if (!part) ctx.bd.innerHTML = '<p style="color:#B4461E">모르는 화면 종류 : ' + esc(kind) + '</p>';
    else try { part(ctx.bd, s, ctx) } catch (err) { ctx.bd.innerHTML = '<p style="color:#B4461E">' + esc(kind) + ' 그리기 오류 : ' + esc(err.message) + '</p>'; console.error(err) }
  }
  el.querySelectorAll('[data-count]').forEach(function (e) { e.textContent = cText(e, +e.getAttribute('data-count')) });
  el.querySelectorAll('.lk a').forEach(function (a) { a.addEventListener('click', function (ev) { ev.stopPropagation();
    if (a.getAttribute('data-back')) { back(); return } var j = S.findIndex(function (y) { return y.apx && y.s.appendix === a.getAttribute('data-to') }); if (j >= 0) { origin = cur; go(j, 1) } }) });
  return el }
function nBeats(i) { var s = S[i].s; return (s.beats && s.beats.length) || S[i].el._nb || 0 }

/* ───────── 장 넘김 8종 ─────────
   push M1 머리 고정 · 본문 밀기 | wipe M2 초록 면 닦기 | sheet M3 아래에서 올라오기 | carry M4 같은 차트 이어 넘기기
   fade M5 겹쳐 사라짐 | num M6 숫자 이어받기 | line M7 초록 선 닦기 | open M8 가운데서 열기 | none 바로 */
var NAMES = { push: 'M1 본문 밀기', wipe: 'M2 초록 면 닦기', sheet: 'M3 아래에서 올라오기', carry: 'M4 같은 차트 이어 넘기기', fade: 'M5 겹쳐 사라짐', num: 'M6 숫자 이어받기', line: 'M7 초록 선 닦기', open: 'M8 가운데서 열기', none: '바로' };
ECOM.transitions = NAMES;
function carryPair(a, b) { var m = {}; a.querySelectorAll('[data-carry]').forEach(function (e) { m[e.getAttribute('data-carry')] = e });
  var hit = null; b.querySelectorAll('[data-carry]').forEach(function (e) { if (!hit && m[e.getAttribute('data-carry')]) hit = [m[e.getAttribute('data-carry')], e] }); return hit }
function pick(f, t, dir) {
  if (RM() || f < 0) return 'none'; var A0 = S[f], B0 = S[t];
  if (dir < 0) return (A0.apx || B0.apx) ? 'sheet' : (A0.s.kind === 'part' || B0.s.kind === 'cover' ? 'fade' : 'push');
  if (B0.s.transition && NAMES[B0.s.transition]) return B0.s.transition;
  if (A0.apx !== B0.apx) return 'sheet';
  if (A0.s.kind === 'cover' || A0.s.kind === 'part' || B0.s.kind === 'part') return 'wipe';
  if (carryPair(A0.el, B0.el)) return 'num';
  if (B0.s.chart && A0.s.chart === B0.s.chart) return 'carry';
  if (B0.s.kind === 'quadrant' || B0.s.kind === 'discuss') return 'open';
  var gA = A0.s.eyebrow && A0.s.eyebrow.group, gB = B0.s.eyebrow && B0.s.eyebrow.group, newGroup = gA && gB && gA !== gB, B = D.meta && D.meta.combo === 'B';
  return newGroup ? (B ? 'push' : 'line') : (B ? 'line' : 'push') }
function rectIn(el) { var r = el.getBoundingClientRect(), s = deckEl.getBoundingClientRect(); return { x: (r.left - s.left) / scaleK, y: (r.top - s.top) / scaleK, w: r.width / scaleK, h: r.height / scaleK } }
function clearT() { timers.forEach(clearTimeout); timers = [] }
function enter(to, skip) { var b = S[to].el; beatK = 0; if (b._beat) b._beat(0); play(b, skip); post(); hud() }
function go(to, dir, how) {
  if (to < 0 || to >= S.length || to === cur) return; dir = dir || (to > cur ? 1 : -1);
  if (trans) skipTrans(); clearT(); var from = cur, a = from >= 0 ? S[from].el : null, b = S[to].el, t = how || pick(from, to, dir); cur = to; beatK = 0;
  try { history.replaceState(null, '', '#' + (to + 1)) } catch (e) { }
  S.forEach(function (x) { if (x.el !== a && x.el !== b) { stopPlay(x.el); x.el.classList.remove('on'); x.el.style.cssText = '' } });
  if (a) finish(a); prep(b);
  var fired = false;
  function done(skip) {
    if (fired) return; fired = true; trans = null; deckEl.querySelectorAll('.wipe3,.lwipe3,.fly3').forEach(function (e) { e.remove() });
    if (a) { a.classList.remove('on'); a.style.cssText = ''; a.querySelectorAll('.mv,.ch').forEach(function (e) { e.style.visibility = '' });
      a.getAnimations({ subtree: true }).forEach(function (x) { if (!(window.CSSAnimation && x instanceof CSSAnimation)) x.cancel() }) }
    b.style.cssText = ''; b.classList.add('on'); enter(to, skip) }
  if (!a || t === 'none' || RM()) { done(); return }
  trans = { done: done, a: a, b: b };
  b.classList.add('on');
  if (t === 'fade') { b.style.zIndex = 2; A(b, [{ opacity: 0 }, { opacity: 1 }], 240, 'linear').onfinish = function () { done() }; return }
  if (t === 'sheet') { if (dir > 0) { b.style.zIndex = 3; A(b, [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], 380, EIN).onfinish = function () { done() } }
    else { a.style.zIndex = 3; b.style.zIndex = 1; A(a, [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], 320, EOUT).onfinish = function () { done() } } return }
  if (t === 'wipe') { var w = H('div', 'wipe3', null, deckEl); b.classList.remove('on');
    A(w, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 360, ESTD).onfinish = function () { a.classList.remove('on'); b.classList.add('on'); w.style.transformOrigin = '100% 50%';
      A(w, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 300, ESTD).onfinish = function () { w.remove() };
      b.querySelectorAll('.mv,.ch').forEach(function (e, i) { A(e, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], 300, EIN, 120 + i * 40) });
      timers.push(setTimeout(function () { done() }, dur(260))) }; return }
  if (t === 'line') { var ln = H('div', 'lwipe3', null, deckEl); b.style.zIndex = 2;
    A(b, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 560, ESTD); A(ln, [{ left: '-4px' }, { left: '1280px' }], 560, ESTD).onfinish = function () { ln.remove(); done() }; return }
  if (t === 'open') { b.style.zIndex = 2; A(b, [{ clipPath: 'inset(0 50% 0 50%)', transform: 'scale(.985)' }, { clipPath: 'inset(0 0% 0 0%)', transform: 'scale(1)' }], 480, EIN).onfinish = function () { done() };
    A(a, [{ opacity: 1 }, { opacity: .4 }], 480, 'linear'); return }
  if (t === 'num') { var pr = carryPair(a, b); if (pr) { var sEl = pr[0], tEl = pr[1], rs = rectIn(sEl), rt = rectIn(tEl);
      var fsS = parseFloat(getComputedStyle(sEl).fontSize) || 16, fsT = parseFloat(getComputedStyle(tEl).fontSize) || 16, fill = getComputedStyle(tEl).fill, colT = (fill && fill !== 'none' && fill.indexOf('url') < 0) ? fill : getComputedStyle(tEl).color;
      var f = H('div', 'fly3', null, deckEl, 'left:' + (rs.x + rs.w / 2) + 'px;top:' + (rs.y + rs.h / 2) + 'px;font-size:' + fsS + 'px;color:' + C.dark + ';transform:translate(-50%,-50%)'); f.textContent = sEl.textContent;
      sEl.style.opacity = 0; tEl.style.opacity = 0; b.style.zIndex = 1; a.style.zIndex = 2;
      var host = b.querySelector('[data-carry-host]'); if (host) { host.style.opacity = ''; host.style.transformBox = 'fill-box'; host.style.transformOrigin = '50% 50%'; A(host, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 420, EIN, 200) }
      A(a, [{ opacity: 1 }, { opacity: 0 }], 300, 'linear'); A(b, [{ opacity: 0 }, { opacity: 1 }], 320, 'linear', 200);
      var dx = (rt.x + rt.w / 2) - (rs.x + rs.w / 2), dy = (rt.y + rt.h / 2) - (rs.y + rs.h / 2);
      A(f, [{ transform: 'translate(-50%,-50%) scale(1)', color: C.dark }, { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(' + (fsT / fsS) + ')', color: colT || C.dark }], 650, ESTD).onfinish = function () { f.remove(); sEl.style.opacity = ''; tEl.style.opacity = ''; done(tEl) }; return }
    t = 'push' }
  var dx2 = 32 * dir, carry = t === 'carry'; b.style.zIndex = 1; a.style.zIndex = 2; a.style.background = 'transparent'; a.querySelectorAll('.ch').forEach(function (e) { e.style.visibility = 'hidden' });
  a.querySelectorAll('.mv').forEach(function (e) { if (carry && e.classList.contains('bd')) A(e, [{ opacity: 1 }, { opacity: 0 }], 240, 'linear'); else A(e, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-dx2) + 'px)' }], 200, EOUT) });
  b.querySelectorAll('.mv,.ch').forEach(function (e, i) { if (e.classList.contains('ch')) A(e, [{ opacity: 0 }, { opacity: 1 }], 300, 'linear', 120); else if (carry && e.classList.contains('bd')) A(e, [{ opacity: 0 }, { opacity: 1 }], 200, 'linear', 100); else A(e, [{ opacity: 0, transform: 'translateX(' + dx2 + 'px)' }, { opacity: 1, transform: 'translateX(0)' }], 420, EIN, 120 + i * 40) });
  timers.push(setTimeout(function () { done() }, dur(carry ? 220 : 560)));
}
function skipTrans() { var t = trans; trans = null; clearT(); [t.a, t.b].forEach(function (el) { if (el) el.getAnimations({ subtree: true }).forEach(function (x) { if (!(window.CSSAnimation && x instanceof CSSAnimation)) x.finish() }) }); t.done() }
function building() { var el = cur >= 0 && S[cur].el; return el && el._until && performance.now() < el._until }
function next() { if (cur < 0) return; if (trans) { skipTrans(); return } var el = S[cur].el;
  if (building()) { finish(el); if (el._beat) el._beat(beatK); toast('쌓기를 바로 끝 상태로'); post(); return }
  if (beatK < nBeats(cur)) { beatK++; if (el._beat) el._beat(beatK); post(); hud(); return }
  if (cur < S.length - 1) go(cur + 1, 1) }
function prev() { if (trans) skipTrans(); if (cur > 0) go(cur - 1, -1) }
function back() { var j = origin != null ? origin : S.findIndex(function (y) { return !y.apx && y.s.links && y.s.links.some(function (l) { return l.to === S[cur].s.appendix }) }); origin = null; go(j >= 0 ? j : 0, -1) }

/* ───────── 화면 맞춤 · 키 · 알림 · 개요 · 발표자 창 ───────── */
function fit() { if (!deckEl || PRES) return; scaleK = Math.min(innerWidth / 1280, innerHeight / 720); deckEl.style.transform = 'scale(' + scaleK + ')' }
function toast(t) { var e = document.getElementById('toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('on') }, 1200) }
var numBuf = '';
function onKey(e) {
  if (e.target && /INPUT|TEXTAREA|BUTTON/.test(e.target.tagName)) return; var k = e.key;
  if (document.getElementById('ov').classList.contains('on')) { if (k === 'Escape' || k === 'o' || k === 'O') overview(); return }
  if (/^[0-9]$/.test(k)) { numBuf += k; toast(numBuf + '장으로 — Enter'); return }
  if (k === 'Enter' && numBuf) { var n = +numBuf; numBuf = ''; var j = S.findIndex(function (y) { return !y.apx && y.page === n }); if (j >= 0) go(j); e.preventDefault(); return }
  if (k === 'ArrowRight' || k === ' ' || k === 'Enter' || k === 'PageDown') { e.preventDefault(); next() }
  else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev() }
  else if (k === 'Home') go(0); else if (k === 'End') go(S.length - 1);
  else if (k === 'o' || k === 'O') overview(); else if (k === 'p' || k === 'P') window.open(location.pathname + '?presenter#' + (cur + 1), 'ecom-presenter', 'width=1200,height=760');
  else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen() }
  else if (k === 'Escape') numBuf = '' }
function overview() { var ov = document.getElementById('ov'); if (ov.classList.contains('on')) { ov.classList.remove('on'); ov.innerHTML = ''; return }
  S.forEach(function (x, i) { var it = H('div', 'it' + (i === cur ? ' cur' : ''), null, ov), th = H('div', 'th', null, it); H('div', null, esc(pageOf(i)) + ' · ' + esc((x.s.eyebrow && (x.s.eyebrow.topic || x.s.eyebrow.group)) || x.s.title || x.s.kind), it);
    var c = x.el.cloneNode(true); c.classList.add('on'); c.style.cssText = ''; c.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' }); th.appendChild(c);
    requestAnimationFrame(function () { c.style.transform = 'scale(' + (th.clientWidth / 1280) + ')' });
    it.addEventListener('click', function () { overview(); go(i) }) }); ov.classList.add('on') }
function post() { if (chan && !PRES) chan.postMessage({ i: cur, k: beatK }) }
function hud() { if (!PRES) return; var p = document.getElementById('pres'), c = p.querySelector('.b1'), n = p.querySelector('.b2');
  [c, n].forEach(function (b) { b.innerHTML = '' }); var x = S[cur], y = S[cur + 1];
  function put(box, el) { var cl = el.cloneNode(true); cl.classList.add('on'); cl.style.cssText = ''; cl.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' }); box.appendChild(cl); cl.style.transform = 'scale(' + (box.clientWidth / 1280) + ')' }
  put(c, x.el); if (y) put(n, y.el); p.querySelector('.pg').textContent = pageOf(cur) + ' / ' + S.filter(function (z) { return !z.apx }).length + (nBeats(cur) ? ' · 바뀜 ' + beatK + '/' + nBeats(cur) : '');
  p.querySelector('.note').textContent = x.s.note || '' }
function presenterUI() { document.body.classList.add('pres'); var p = document.getElementById('pres');
  p.innerHTML = '<div><div class="box b1"></div><div class="meta"><b class="pg"></b><span class="tm">00:00</span><button class="pv">← 이전</button><button class="nx">다음 →</button></div><div class="note"></div></div><div><div style="font-size:14px;color:#C9D1CD;margin-bottom:6px">다음 장</div><div class="box b2"></div></div>';
  var t0 = Date.now(); setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); p.querySelector('.tm').textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0') }, 1000);
  p.querySelector('.pv').onclick = function () { chan && chan.postMessage({ cmd: 'prev' }) }; p.querySelector('.nx').onclick = function () { chan && chan.postMessage({ cmd: 'next' }) };
  document.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === ' ') chan && chan.postMessage({ cmd: 'next' }); if (e.key === 'ArrowLeft') chan && chan.postMessage({ cmd: 'prev' }) }) }

/* ───────── 점검(?check) ───────── */
function runCheck() {
  var out = { engine: 3, slides: [] }, B0 = { l: 50, t: 136, r: 1230, b: 664 };
  S.forEach(function (x, i) {
    var el = x.el; S.forEach(function (y) { y.el.classList.remove('on') }); el.classList.add('on'); finish(el); if (el._beat) el._beat(0);
    var r0 = el.getBoundingClientRect(), k = r0.width / 1280; function toS(r) { return { l: (r.left - r0.left) / k, t: (r.top - r0.top) / k, r: (r.right - r0.left) / k, b: (r.bottom - r0.top) / k } }
    function visible(e) { var n = e; while (n && n !== el) { var cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; n = n.parentElement || n.parentNode } return true }
    function textIssues() { var R = [], minF = 99, ov = [], outS = [], outB = [], bdE = el.querySelector('.bd');
      el.querySelectorAll('text').forEach(function (t) { if (!t.textContent.trim() || !visible(t)) return; var rr = t.getBoundingClientRect(); if (!rr.width) return; var fz = parseFloat(getComputedStyle(t).fontSize) || 12, q0 = toS(rr); q0.t += fz * .16; q0.b -= fz * .16; R.push([t, q0, t.textContent.trim().slice(0, 16)]); minF = Math.min(minF, fz) });
      el.querySelectorAll('*').forEach(function (e) { if (e.namespaceURI === NS) return; var own = Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim() });
        if (!own || !visible(e)) return; var fz = parseFloat(getComputedStyle(e).fontSize) || 12;
        e.childNodes.forEach(function (n) { if (n.nodeType !== 3 || !n.textContent.trim()) return; var rg = document.createRange(); rg.selectNodeContents(n);
          Array.prototype.forEach.call(rg.getClientRects(), function (rr) { if (rr.width < 1) return; var q0 = toS(rr); q0.t += fz * .18; q0.b -= fz * .18; R.push([e, q0, e.textContent.trim().slice(0, 16)]) }) });
        minF = Math.min(minF, fz) });
      R.forEach(function (a, ii) { var q = a[1]; if (q.l < -1 || q.t < -1 || q.r > 1281 || q.b > 721) outS.push(a[2]);
        if (bdE && bdE.contains(a[0]) && (q.t < B0.t || q.b > B0.b || q.l < B0.l || q.r > B0.r)) outB.push(a[2] + ' ' + [q.l, q.t, q.r, q.b].map(Math.round).join(','));
        for (var j = ii + 1; j < R.length; j++) { var c = R[j][1]; if (a[0] === R[j][0] || a[0].contains(R[j][0]) || R[j][0].contains(a[0])) continue;
          var ix = Math.min(q.r, c.r) - Math.max(q.l, c.l), iy = Math.min(q.b, c.b) - Math.max(q.t, c.t); if (ix > 2 && iy > 3) ov.push(a[2] + ' × ' + R[j][2]) } });
      return { ov: ov, outS: outS, outB: outB, minF: minF } }
    var ti = textIssues(), nb = nBeats(i), ov = ti.ov, outS = ti.outS, outB = ti.outB, minF = ti.minF;
    if (nb && el._beat) { el._beat(nb); var t2 = textIssues(); t2.ov.forEach(function (x) { if (ov.indexOf(x) < 0) ov.push('[바뀜] ' + x) }); t2.outS.forEach(function (x) { if (outS.indexOf(x) < 0) outS.push('[바뀜] ' + x) }); t2.outB.forEach(function (x) { if (outB.indexOf(x) < 0) outB.push('[바뀜] ' + x) }); el._beat(0) }
    var gw = 58, gh = 26, cells = new Uint8Array(gw * gh), bd = el.querySelector('.bd');
    if (bd) { var bb = toS(bd.getBoundingClientRect()); bd.querySelectorAll('text,rect,path,circle,line,polyline,polygon,.card,.qc,.pc,.kb .kc,table,.eq,.hov,div').forEach(function (e) {
        if (!visible(e)) return; if (e.tagName === 'DIV' && !Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim() })) {
          var ds = getComputedStyle(e), bgOn = ds.backgroundColor && ds.backgroundColor !== 'rgba(0, 0, 0, 0)' && ds.backgroundColor !== 'transparent', bdOn = parseFloat(ds.borderTopWidth) > 0 || parseFloat(ds.borderLeftWidth) > 0;
          if (!bgOn && !bdOn) return; var qq = toS(e.getBoundingClientRect()); if ((qq.r - qq.l) > 1000 && (qq.b - qq.t) > 400) return }
        if (e.namespaceURI === NS && e.tagName !== 'text') { var cs = getComputedStyle(e); if ((cs.fill === 'none' || !cs.fill) && (cs.stroke === 'none' || !cs.stroke)) return; if (e.tagName === 'line' && (cs.strokeDasharray && cs.strokeDasharray !== 'none') && cs.stroke === 'rgb(227, 232, 229)') return }
        var q = toS(e.getBoundingClientRect()); var x0 = Math.max(0, Math.floor((q.l - bb.l) / (bb.r - bb.l) * gw)), x1 = Math.min(gw - 1, Math.floor((q.r - bb.l) / (bb.r - bb.l) * gw)), y0 = Math.max(0, Math.floor((q.t - bb.t) / (bb.b - bb.t) * gh)), y1 = Math.min(gh - 1, Math.floor((q.b - bb.t) / (bb.b - bb.t) * gh));
        for (var yy = y0; yy <= y1; yy++)for (var xx = x0; xx <= x1; xx++)cells[yy * gw + xx] = 1 }) }
    var occ = 0; for (var c2 = 0; c2 < cells.length; c2++)occ += cells[c2];
    var fn = el.querySelector('.fn'), hm = el.querySelector('.hm');
    out.slides.push({ i: i + 1, page: pageOf(i), kind: x.s.kind, textOverlap: ov.slice(0, 12), outside: outS.slice(0, 8), outsideBody: outB.slice(0, 8), minFont: minF === 99 ? null : Math.round(minF * 10) / 10,
      fnLines: fn && fn.textContent.trim() ? Math.round(fn.getBoundingClientRect().height / k / 18.75) : 0, headLen: hm ? hm.textContent.replace(/\s/g, '').length : 0,
      headLines: hm && hm.textContent.trim() ? Math.round(hm.getBoundingClientRect().height / k / 35.5) : 0, occupied: bd ? Math.round(occ / cells.length * 100) : null, beats: nBeats(i) });
    el.classList.remove('on') });
  if (cur >= 0) S[cur].el.classList.add('on'); return out }

/* ───────── 시작 ───────── */
function init() {
  var dd = document.getElementById('deck-data'); if (!dd) return; D = JSON.parse(dd.textContent); var sl = D.slides || [];
  document.body.insertAdjacentHTML('beforeend', '<div id="stage" tabindex="0"><div id="deck"></div></div><div id="ov"></div><div id="toast"></div><div id="pres"></div>');
  stage = document.getElementById('stage'); deckEl = document.getElementById('deck');
  var main = sl.filter(function (s) { return !s.appendix }), apx = sl.filter(function (s) { return s.appendix });
  main.concat(apx).forEach(function (s, i) { S.push({ s: s, i: i, apx: !!s.appendix, page: s.appendix ? null : i + 1 }) });
  S.forEach(function (x) { deckEl.appendChild(buildSlide(x)) });
  var m = /#(\d+)/.exec(location.hash), start = m ? Math.min(S.length, Math.max(1, +m[1])) - 1 : 0;
  try { chan = new BroadcastChannel('ecom-' + ((D.meta && D.meta.session) || 'deck')) } catch (e) { chan = null }
  if (CHECK) { var r = runCheck(); var pre = H('pre', null, null, document.body); pre.id = 'ecom-check'; pre.textContent = JSON.stringify(r); go(start, 1, 'none'); return }
  if (PRES) { presenterUI(); cur = start; hud(); if (chan) chan.onmessage = function (ev) { if (ev.data && ev.data.i != null) { cur = ev.data.i; beatK = ev.data.k; hud() } }; return }
  if (chan) chan.onmessage = function (ev) { if (!ev.data) return; if (ev.data.cmd === 'next') next(); else if (ev.data.cmd === 'prev') prev() };
  fit(); addEventListener('resize', fit); document.addEventListener('keydown', onKey);
  stage.addEventListener('click', function (e) { if (e.target.closest('a,button,input,.vote')) return; stage.focus(); next() });
  var tx = null; stage.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX }, { passive: true });
  stage.addEventListener('touchend', function (e) { if (tx == null) return; var d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) { if (d < 0) next(); else prev() } tx = null });
  document.addEventListener('visibilitychange', function () { if (document.hidden && cur >= 0) finish(S[cur].el) });
  go(start, 1, 'none'); stage.focus();
}
window.ECOMDeck = { go: function (n, how) { go(n - 1, n - 1 > cur ? 1 : -1, how) }, next: function () { next() }, prev: function () { prev() }, check: runCheck,
  state: function () { return { i: cur + 1, n: S.length, beat: beatK, beats: cur >= 0 ? nBeats(cur) : 0, building: !!building(), kind: cur >= 0 ? S[cur].s.kind : null } }, play: play, finish: finish, pick: function (a, b) { return pick(a - 1, b - 1, 1) } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
