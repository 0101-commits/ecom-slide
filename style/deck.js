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
/* 짙은 바탕(bg deep · map) 색표 — 같은 이름, 어두운 면에서 읽히는 값. 부품은 var P = ctx.dark ? ECOM.Cd : ECOM.C */
ECOM.Cd = { main: '#8FD9B6', dark: '#CDEFE0', g65: '#6FC29F', g40: '#3F8A6E', g18: '#1F5A45', g08: '#0F4433', on: '#FFFFFF',
  cmp: '#E1E6E3', gray: '#5F7A70', light: '#2E5547', grid: 'rgba(255,255,255,.12)', axis: 'rgba(255,255,255,.45)', mute: 'rgba(255,255,255,.62)', ink: '#FFFFFF', sub: 'rgba(255,255,255,.82)',
  warn: '#FF9B73', warnsoft: '#5A2E1E', paper: '#0E4635', well: '#0B3D2E', line: 'rgba(255,255,255,.2)', bg: '#003D2B' };
var EIN = 'cubic-bezier(.05,.7,.1,1)', ESTD = 'cubic-bezier(.2,0,.38,.9)', EOUT = 'cubic-bezier(.3,0,.8,.15)';
var Q = new URLSearchParams(location.search), STILL = Q.has('still'), CHECK = Q.has('check'), PRES = Q.has('presenter'), CHECK_SHALLOW = Q.get('check') === 'quick';
var RMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function RM() { return STILL || CHECK || PRES || (RMQ && RMQ.matches) || document.hidden }
function dur(ms) { return RM() ? 1 : ms }

/* ───────── 그리기 도움 ───────── */
/* 6판 통일 규격 — 글자 7단계 · 선 굵기 4가지 · 모서리(6, 막대 2, 알약형은 그대로). 부품이 넘긴 값은 E() · textW() 가 이 표로 맞춤.
   글자 : 14 미만 → 13 · 14~17 → 16 · ~19.5 → 18 · ~23.5 → 20 · ~30 → 26 · ~48 → 36 · ~62 → 52 · 그보다 큰 글(표지 · 숫자판)은 그대로 */
var SPEC = ECOM.SPEC = { fs: [13, 16, 18, 20, 26, 36, 52], sw: [1.5, 3, 5, 8], rx: 6, rxBar: 2 };
function snapFs(v) { v = +v; if (!(v > 0)) return v; if (v < 14) return 13; if (v <= 17) return 16; if (v < 19.5) return 18; if (v < 23.5) return 20; if (v <= 30) return 26; if (v < 48) return 36; if (v <= 62) return 52; return v }
function snapSw(v) { v = +v; if (!(v > 0) || v > 8.5) return v; if (v <= 1.6) return 1.5; if (v <= 4) return 3; if (v <= 6.5) return 5; return 8 }
function specA(t, a) { var o = null; function set(k, v) { if (!o) o = Object.assign({}, a); o[k] = v }
  function num(v) { return typeof v === 'number' || /^[\s\d.]+(px)?\s*$/.test(String(v)) }
  var tx = t === 'text' || t === 'tspan';
  if (a['font-size'] != null && num(a['font-size'])) { var f0 = parseFloat(a['font-size']), f = snapFs(f0); if (f !== f0) set('font-size', f) }
  if (!tx && a['stroke-width'] != null && num(a['stroke-width'])) { var w0 = parseFloat(a['stroke-width']), w = snapSw(w0); if (w !== w0) set('stroke-width', w) }
  if (t === 'rect' && a.rx != null && num(a.rx)) { var r = parseFloat(a.rx), mn = Math.min(parseFloat(a.width) || 1e9, parseFloat(a.height) || 1e9);
    if (r > 0 && r < mn / 2 - .5) { var r2 = r <= 3 ? SPEC.rxBar : SPEC.rx; if (r2 !== r) { set('rx', r2); if (a.ry != null) set('ry', r2) } } }
  /* 흰 테두리 칸(60×40 이상 흰 면 + 선) → 테두리 없는 옅은 면. 전면 지도 위 이름표는 그대로 */
  if (t === 'rect' && WHITES.test(String(a.fill || '')) && a.stroke && a.stroke !== 'none' && (parseFloat(a.width) || 0) >= 60 && (parseFloat(a.height) || 0) >= 40 && !specA.pic && !(specA.p && specA.p.closest && specA.p.closest('.fl'))) { set('fill', C.g08); set('stroke', 'none') }
  return o || a }
var WHITES = /^(#fff|#ffffff|white|#F5F7F6)$/i;
ECOM.fs = snapFs;
function E(t, a, p) { var e = document.createElementNS(NS, t); specA.p = p; if (a) a = specA(t, a); if (a) for (var k in a) if (a[k] !== undefined && a[k] !== null && k !== 'lh') e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e }
function T(p, x, y, s, a) { a = a || {}; var e = E('text', Object.assign({ x: x, y: y }, a), p), L = String(s == null ? '' : s).split('\n');
  if (L.length === 1) e.textContent = L[0]; else L.forEach(function (t, i) { var ts = E('tspan', { x: x, dy: i ? (a.lh || 1.3) + 'em' : 0 }, e); ts.textContent = t }); return e }
function H(tag, cls, html, p, css) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (css) e.style.cssText = css; if (p) p.appendChild(e); return e }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>') }
function nf(v, d, o) { if (v == null || isNaN(v)) return '—'; d = d == null ? 0 : d; var r = Math.abs(v).toFixed(d), s = r.split('.'); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  var zero = +r === 0, sg = v < 0 && !zero ? '−' : (o && o.sign && v > 0 && !zero ? '+' : ''); return sg + s.join('.') }
function textW(s, size, bold) { var w = 0; s = String(s); if (size >= 10) size = snapFs(size); for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i), ch = s[i];
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
// 색 = 팔레트 이름 · #hex · rgb()/hsl() · 영문 색 이름만 (따옴표 · 세미콜론 든 값은 버림 → 속성 끼워 넣기 막기)
function col(c) { var v = C[c] || c; return (typeof v === 'string' && /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([0-9\s.,%\/]+\)|[a-z]+)$/i.test(v)) ? v : C.main }
// 숫자 = 유한한 수만 (문자열 끼워 넣기 막기)
function num(v, d) { var n = (v == null || v === '') ? NaN : +v; return isFinite(n) ? n : (d == null ? 0 : d) }
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
  if (f === 'zoom') { if (e.namespaceURI === NS) { e.style.transformBox = 'fill-box'; e.style.transformOrigin = '50% 50%' } AF(e, [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }], ms || 450, EIN, delay); return delay + (ms || 450) }
  if (f === 'slide') { var sx = +(e.getAttribute('data-dx') || 0), sy = +(e.getAttribute('data-dy') || 0); AF(e, [{ opacity: 0, transform: 'translate(' + sx + 'px,' + sy + 'px)' }, { opacity: 1, transform: 'translate(0,0)' }], ms || 620, 'cubic-bezier(.2,.7,.2,1)', delay); return delay + (ms || 620) }
  if (f === 'wipe') { AF(e, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], ms || 900, 'cubic-bezier(.6,0,.2,1)', delay); return delay + (ms || 900) }
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
/* 강조 손잡이(5판) emph{mode:'focus', keys:[이름…]} : 쌓기가 끝나면 data-key 가 keys 에 없는 항목을 흐리게
   emph{mode:'lens', at:[x,y](본문 좌표), r, zoom, text} : 그 자리를 동그란 돋보기로 확대해 보임(쌓기 끝에 나타남) */
function emphOn(root) { var m = root._s && root._s.emph; if (m && m.mode === 'lens' && m.at && !CHECK) { var bd0 = root.querySelector('.bd'); if (bd0 && !bd0.querySelector('.lens')) try { makeLens(bd0, m) } catch (err) { console.error(err) } return }
  if (!m || m.mode !== 'focus') return; var ks = (m.keys || []).map(function (k) { return String(k) }), all = root.querySelectorAll('[data-key]'), hit = 0;
  all.forEach(function (e) { if (ks.indexOf(e.getAttribute('data-key')) >= 0) hit++ }); if (!hit) return;
  all.forEach(function (e) { var k = function (n) { return n && ks.indexOf(n.getAttribute('data-key')) >= 0 }, up = e.parentElement && e.parentElement.closest('[data-key]');
    var on = k(e) || k(up) || Array.prototype.some.call(e.querySelectorAll('[data-key]'), k); e.classList.toggle('emph-dim', !on && !(up && up.classList.contains('emph-dim'))) }) }
function emphOff(root) { root.querySelectorAll('.emph-dim').forEach(function (e) { e.classList.remove('emph-dim') }); root.querySelectorAll('.lens').forEach(function (e) { e.remove() }) }
function makeLens(bd, m) { var r = m.r || 90, z = m.zoom || 1.8, x = m.at[0], y = m.at[1], L = document.createElement('div'); L.className = 'lens';
  L.style.cssText = 'left:' + (x - r) + 'px;top:' + (y - r) + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px';
  var inner = document.createElement('div'); inner.className = 'lens-in'; inner.style.transform = 'translate(' + (r - x * z) + 'px,' + (r - y * z) + 'px) scale(' + z + ')';
  Array.prototype.forEach.call(bd.children, function (c) { if (c === L) return; var k = c.cloneNode(true), oa = [c].concat(Array.prototype.slice.call(c.querySelectorAll('*'))), ka = [k].concat(Array.prototype.slice.call(k.querySelectorAll('*')));
    oa.forEach(function (o, i) { var cs = getComputedStyle(o), op = +cs.opacity; if (ka[i] && (op < .999 || cs.visibility === 'hidden' || cs.display === 'none')) { ka[i].style.opacity = cs.display === 'none' || cs.visibility === 'hidden' ? '0' : String(op) } }); k.querySelectorAll('[data-b],[data-at],[data-fx]').forEach(function (e) { e.removeAttribute('data-b'); e.removeAttribute('data-at'); e.removeAttribute('data-fx') });
    ['data-b', 'data-at', 'data-fx'].forEach(function (a) { k.removeAttribute(a) }); k.querySelectorAll('[id]').forEach(function (e) { e.removeAttribute('id') }); inner.appendChild(k) });
  L.appendChild(inner); if (!RM() && L.animate) L.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, easing: 'cubic-bezier(.2,.7,.2,1)' });
  if (m.text) { var t = document.createElement('b'); t.className = 'lens-t'; t.textContent = m.text; L.appendChild(t) }
  bd.appendChild(L) }
function play(root, skip) {
  stopPlay(root); emphOff(root); root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' });
  if (RM()) { if (root._done) root._done(root); emphOn(root); return 0 }
  var gap = +(root.getAttribute('data-gap') || 300), stg = +(root.getAttribute('data-stg') || 45), byL = {}, end = 0;
  root.querySelectorAll('[data-b],[data-at]').forEach(function (e) {
    if (skip && (e === skip || e.hasAttribute('data-carry-host'))) return;
    if (e.hasAttribute('data-at')) { end = Math.max(end, fx(root, e, +e.getAttribute('data-at'))); return }
    var l = +e.getAttribute('data-b'); (byL[l] = byL[l] || []).push(e) });
  Object.keys(byL).forEach(function (l) { byL[l].forEach(function (e, i) { end = Math.max(end, fx(root, e, (l - 1) * gap + i * stg)) }) });
  if (root._hook) end = Math.max(end, root._hook(root) || 0);
  later(root, function () { settle(root); if (root._done) root._done(root) }, end + 30); later(root, function () { emphOn(root) }, end + 250);
  root._until = performance.now() + end; return end }
/* 쌓기가 끝나면 쌓기 움직임(끝 모습 = 기본값)만 지움 — 바뀜 단계에서 style.opacity 로 흐리게 하는 것이 먹도록. 부품 고리(_hook)의 움직임은 그대로 둠 */
function settle(root) { if (!root.getAnimations) return; root.getAnimations({ subtree: true }).forEach(function (a) { if (a._fx === 1 && a.playState === 'finished') a.cancel() }) }
function finish(root) { stopPlay(root); root.querySelectorAll('[data-b],[data-at]').forEach(function (e) { e.style.opacity = '' }); if (root._done) root._done(root); emphOn(root) }

ECOM.h = { snapFs: snapFs, snapSw: snapSw, E: E, T: T, H: H, esc: esc, md: md, nf: nf, textW: textW, wrap: wrap, niceTicks: niceTicks, decOf: decOf, lin: lin, lv: lv, at: at, tri: tri, arrow2: arrow2,
  bracket: bracket, legend: legend, stepD: stepD, lineD: lineD, col: col, num: num, ext: ext, A: A, later: later, dur: dur, RM: RM, cText: cText, EIN: EIN, ESTD: ESTD, EOUT: EOUT, C: C };

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
  specA.pic = /map|body|anatomy|build|iso|plan/.test(kind + ' ' + (s.layout || ''));   /* 지도 · 그림 장은 그림 안 흰 칸을 그대로 둠 */
  /* 6판 : 모든 장 흰 바탕. 예전 bg deep · mint 는 흰 바탕으로 그림, 전면 지도(bg map)는 밝은 지도 + 헤드 · 각주 자리 흰 흐림 */
  var bg = (s.bg === 'map' || kind === 'fullmap') ? 'map' : '';
  /* 짙은 바탕은 그 배치가 짙은 색표를 아는 때만(ECOM.parts.<kind>.dark = ['배치', …]) — 모르면 흰 바탕으로 그리고 점검에 남김 */
  if ((bg === 'deep' || bg === 'map') && !(part && part.dark && part.dark.indexOf(s.layout || 'default') >= 0)) { x.bgOff = bg; bg = '' }
  if (bg) el.classList.add('bg-' + bg);
  var frame = s.frame || (D && D.meta && D.meta.frame) || 'ecom', bento = frame === 'bento' && !/^(cover|part|end)$/.test(kind); if (bento) el.classList.add('bento');
  var ctx = { W: 1168, H: bento ? 470 : 512, bento: bento, root: el, deck: D, index: x.i, page: pageOf(x.i), apx: x.apx, bg: bg, dark: false, P: C };
  /* 전면 층(bg map 등) : 장 전체 1280×720 을 덮는 판 — 꼬리표 · 헤드메시지 · 각주는 그 위 */
  ctx.full = function () { var f = el.querySelector('.fl'); if (!f) { f = document.createElement('div'); f.className = 'fl'; el.insertBefore(f, el.firstChild) } return f };
  ctx.svg = function (h, bd) { var v = E('svg', { class: 'cv', viewBox: '0 0 1168 ' + (h || 512), width: 1168, height: h || 512 }); (bd || ctx.bd).appendChild(v); return v };
  if (kind === 'end') el.classList.add('sl-end');
  if (kind === 'cover' || kind === 'part' || kind === 'end' || s.bare) { try { if (part) part(el, s, ctx); } catch (err) { el.innerHTML = '<p style="padding:40px;color:#B4461E">' + esc(kind) + ' 오류: ' + esc(err.message) + '</p>'; console.error(err) } }
  else {
    var lk = '';
    if (x.apx) lk = '<a data-back="1">← 본문으로</a>';
    else if (s.links && s.links.length) lk = s.links.map(function (l) { return '<a data-to="' + esc(l.to) + '">' + esc(l.text || l.to) + ' →</a>' }).join('');
    el.innerHTML = (bento ? '<div class="bt mv">' + md([].concat(s.title || s.head || '').join('\n')) + '</div>' + (s.sub ? '<div class="bs mv">' + md(s.sub) + '</div>' : '')
      : '<div class="tag ch">' + eyebrow(s) + '</div><div class="hm mv">' + md(s.head || '') + '</div>') + '<div class="bd mv"></div><div class="fn ch">' + footHTML(s) + '</div>'
      + '<div class="lg ch">' + logoImg(ctx.dark) + '<span>' + esc(ctx.page) + '</span></div>' + (lk ? '<div class="lk ch">' + lk + '</div>' : '');
    ctx.bd = el.querySelector('.bd');
    if (!part) ctx.bd.innerHTML = '<p style="color:#B4461E">모르는 화면 종류 : ' + esc(kind) + '</p>';
    else try { part(ctx.bd, s, ctx) } catch (err) { ctx.bd.innerHTML = '<p style="color:#B4461E">' + esc(kind) + ' 그리기 오류 : ' + esc(err.message) + '</p>'; console.error(err) }
  }
  el.querySelectorAll('[data-count]').forEach(function (e) { e.textContent = cText(e, +e.getAttribute('data-count')) });
  try { bridgeGaps(el) } catch (err) { console.error(err) }
  try { autoTips(el, s) } catch (err) { console.error(err) }
  el.querySelectorAll('.lk a').forEach(function (a) { a.addEventListener('click', function (ev) { ev.stopPropagation();
    if (a.getAttribute('data-back')) { back(); return } var j = S.findIndex(function (y) { return y.apx && y.s.appendix === a.getAttribute('data-to') }); if (j >= 0) { origin = cur; go(j, 1) } }) });
  return el }
/* 6판 : 대표 숫자(48~62px)는 장에 1곳 — 숫자가 든 글이 2곳 이상이면 모두 큰 숫자 36px. 장을 붙인 뒤 계산된 크기로 셈(CSS 로 정한 크기 포함).
   숫자판 자릿수(clip-path 묶음 안) · 숫자 없는 글(신문 제목, 단위)은 세지 않음. 62px 넘는 글(표지 · 대문 · 숫자판)은 그대로 */
function heroList(el) { var big = [];
  el.querySelectorAll('text,div,span,b,strong,em,i,p,h1,h2,h3,h4').forEach(function (e) { var own = e.namespaceURI === NS ? (e.closest('[clip-path]') ? '' : e.textContent) : Array.prototype.map.call(e.childNodes, function (n) { return n.nodeType === 3 ? n.textContent : '' }).join('');
    if (!/\d/.test(own)) return; var f = parseFloat(getComputedStyle(e).fontSize); if (f >= 48 && f <= 62) big.push(e) });
  return big }
function unitApart(e) { var f = parseFloat(getComputedStyle(e).fontSize) || 52, sib = e.parentNode ? Array.prototype.filter.call(e.parentNode.children, function (o) { return o !== e }) : [];
  function unitish(o) { var s = (o.textContent || '').trim(); return s && s.length <= 6 && !/\d/.test(s) }
  if (e.namespaceURI === NS) { var ex = parseFloat(e.getAttribute('x')) || 0, ey = parseFloat(e.getAttribute('y')) || 0;
    return sib.some(function (o) { return o.tagName === 'text' && unitish(o) && (parseFloat(o.getAttribute('x')) || 0) > ex && Math.abs((parseFloat(o.getAttribute('y')) || 0) - ey) <= f }) }
  return sib.some(function (o) { return unitish(o) && getComputedStyle(o).position === 'absolute' }) || (getComputedStyle(e).position === 'absolute' && sib.some(unitish)) }
function heroOne(el) { if (!el) return; var big = heroList(el);
  if (big.some(unitApart)) return;   /* 단위를 숫자 폭으로 따로 놓은 부품 — 줄이면 사이가 벌어짐 */
  if (big.length > 1) big.forEach(function (e) { if (e.namespaceURI === NS) e.setAttribute('font-size', 36); else e.style.fontSize = '36px' }) }
/* 결측 이음 : 차트 선(칠 없음 · 굵기 2 이상 · 점선 아님 · M/L/H/V 만)이 빈 달로 끊긴 곳을 같은 색 연한 점선으로 이음(data-gap).
   차트 위 「자료 없음」 글은 두지 않고 설명은 각주 · 마우스 올림 카드에. 세로 눈금처럼 가로로 안 나아가는 선은 건드리지 않음 */
function bridgeGaps(root) { root.querySelectorAll('.bd path').forEach(function (p) {
  if (p.hasAttribute('data-gap') || p.getAttribute('fill') !== 'none' || p.getAttribute('stroke-dasharray') || +(p.getAttribute('stroke-width') || 0) < 2) return;
  var d = p.getAttribute('d') || ''; if (/[^MLHV0-9.,\s\-e]/.test(d)) return;
  var tk = d.match(/[MLHV]|-?[\d.]+(?:e-?\d+)?/g) || [], x = 0, y = 0, cmd = '', subs = [], cs = null, i = 0;
  while (i < tk.length) { var t = tk[i]; if (/^[MLHV]$/.test(t)) { cmd = t; i++; continue }
    if (cmd === 'M') { x = +tk[i]; y = +tk[i + 1]; i += 2; cs = { s: [x, y], e: [x, y], n: 0 }; subs.push(cs); cmd = 'L' }
    else if (cmd === 'L') { x = +tk[i]; y = +tk[i + 1]; i += 2; cs.e = [x, y]; cs.n++ }
    else if (cmd === 'H') { x = +tk[i]; i++; cs.e = [x, y]; cs.n++ } else if (cmd === 'V') { y = +tk[i]; i++; cs.e = [x, y]; cs.n++ } else i++ }
  if (subs.length < 2 || subs.filter(function (q) { return q.e[0] - q.s[0] > 10 }).length < 2) return;
  var dd = ''; for (var j = 1; j < subs.length; j++) { var a = subs[j - 1].e, b = subs[j].s; if (b[0] <= a[0]) return; dd += 'M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + ' ' }
  var g = E('path', { d: dd.trim(), fill: 'none', stroke: p.getAttribute('stroke'), 'stroke-width': 1.8, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', opacity: .55, 'data-gap': 1 });
  if (p.hasAttribute('data-b')) { g.setAttribute('data-b', p.getAttribute('data-b')); g.setAttribute('data-fx', 'fade') } p.parentNode.insertBefore(g, p) }) }
function nBeats(i) { var s = S[i].s; return (s.beats && s.beats.length) || S[i].el._nb || 0 }

/* ───────── 장 넘김 8종 ─────────
   push M1 머리 고정 · 본문 밀기 | wipe M2 초록 면 닦기 | sheet M3 아래에서 올라오기 | carry M4 같은 차트 이어 넘기기
   fade M5 겹쳐 사라짐 | num M6 숫자 이어받기 | line M7 초록 선 닦기 | open M8 가운데서 열기 | none 바로 */
var NAMES = { push: 'M1 본문 밀기', wipe: 'M2 초록 면 닦기', sheet: 'M3 아래에서 올라오기', carry: 'M4 같은 차트 이어 넘기기', fade: 'M5 겹쳐 사라짐', num: 'M6 숫자 이어받기', line: 'M7 초록 선 닦기', open: 'M8 가운데서 열기', panel: 'M9 색 판 밀기', circle: 'M10 원으로 덮기', blocks: 'M11 계단 블록', tear: 'M12 종이 찢김', none: '바로' };
ECOM.transitions = NAMES;
function carryPair(a, b) { var m = {}; a.querySelectorAll('[data-carry]').forEach(function (e) { m[e.getAttribute('data-carry')] = e });
  var hit = null; b.querySelectorAll('[data-carry]').forEach(function (e) { if (!hit && m[e.getAttribute('data-carry')]) hit = [m[e.getAttribute('data-carry')], e] }); return hit }
function pick(f, t, dir) {
  if (RM() || f < 0) return 'none'; var A0 = S[f], B0 = S[t];
  if (dir < 0) return (A0.apx || B0.apx) ? 'sheet' : (A0.s.kind === 'part' || B0.s.kind === 'cover' ? 'fade' : 'push');
  if (B0.s.transition && NAMES[B0.s.transition]) return B0.s.transition;
  if (A0.apx !== B0.apx) return 'sheet';
  if (B0.s.kind === 'end') return 'fade';
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
  tipHide(); if (trans) skipTrans(); clearT(); var from = cur, a = from >= 0 ? S[from].el : null, b = S[to].el, t = how || pick(from, to, dir); cur = to; beatK = 0;
  try { history.replaceState(null, '', '#' + (to + 1)) } catch (e) { }
  S.forEach(function (x) { if (x.el !== a && x.el !== b) { stopPlay(x.el); x.el.classList.remove('on'); x.el.style.cssText = '' } });
  if (a) finish(a); prep(b);
  var fired = false;
  function done(skip) {
    if (fired) return; fired = true; trans = null; deckEl.querySelectorAll('.wipe3,.lwipe3,.fly3,.tr3').forEach(function (e) { e.remove() });
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
  /* 5판 장 넘김(영상 레퍼런스) — 판이 덮었다 걷히며 다음 장, 끝난 뒤 쌓기 시작 */
  if (t === 'panel' || t === 'circle' || t === 'blocks') { b.classList.remove('on'); var lay = [], E2 = 'cubic-bezier(.65,0,.35,1)';
    var swap = function () { a.classList.remove('on'); b.classList.add('on') }, out = function (an) { an.onfinish = function () { lay.forEach(function (e) { e.remove() }); done() } };
    if (t === 'panel') { [C.main, C.dark].forEach(function (c) { lay.push(H('div', 'tr3', null, deckEl, 'background:' + c + ';transform:translateX(-101%)')) });
      A(lay[0], [{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)' }], 380, E2); A(lay[1], [{ transform: 'translateX(-101%)' }, { transform: 'translateX(0)' }], 380, E2, 80).onfinish = function () { swap();
        A(lay[1], [{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], 380, E2); out(A(lay[0], [{ transform: 'translateX(0)' }, { transform: 'translateX(101%)' }], 380, E2, 80)) }; return }
    if (t === 'circle') { lay.push(H('div', 'tr3', null, deckEl, 'background:' + C.main + ';clip-path:circle(0% at 50% 50%)'));
      A(lay[0], [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], 420, E2).onfinish = function () { swap();
        out(A(lay[0], [{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], 400, E2)) }; return }
    for (var k = 0; k < 6; k++) lay.push(H('div', 'tr3', null, deckEl, 'background:' + (k % 2 ? C.dark : C.main) + ';left:' + (k * 1280 / 6).toFixed(1) + 'px;width:' + (1280 / 6 + 1).toFixed(1) + 'px;right:auto;transform:translateY(-101%)'));
    var last; lay.forEach(function (e, k) { last = A(e, [{ transform: 'translateY(-101%)' }, { transform: 'translateY(0)' }], 340, E2, k * 55) });
    last.onfinish = function () { swap(); var l2; lay.forEach(function (e, k) { l2 = A(e, [{ transform: 'translateY(0)' }, { transform: 'translateY(101%)' }], 340, E2, k * 55) }); out(l2) }; return }
  if (t === 'tear') { b.style.zIndex = 2; var Z = [0, 22, 6, 30, 10, 26, 2, 18];
    var tp = function (x) { var p = [x + 'px 0px', '1320px 0px', '1320px 720px']; for (var i = 16; i >= 0; i--) p.push((x + Z[i % 8]) + 'px ' + (i * 45) + 'px'); return 'polygon(' + p.join(',') + ')' };
    A(a, [{ opacity: 1 }, { opacity: .55 }], 620, 'linear'); A(b, [{ clipPath: tp(1320) }, { clipPath: tp(-40) }], 640, 'cubic-bezier(.65,0,.35,1)').onfinish = function () { done() }; return }
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
  if (S[cur].s.kind === 'end' && (cur === S.length - 1 || S[cur + 1].apx)) { toast('마지막 장이에요 — 부록은 오른쪽 위 고리 · O 모아 보기로'); return }
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
  else if (k === 'Escape') { numBuf = ''; tipHide() } }
function overview() { tipHide(); var ov = document.getElementById('ov'); if (ov.classList.contains('on')) { ov.classList.remove('on'); ov.innerHTML = ''; return }
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

/* ───────── 점검 넓히기(5판) : 글-선 · 글-도형 · 상자-자료 가림 · 이름표 거리 · 결측 끊김 · 축 밖 · 흐름 방향 · 뜻 표시 · 장식 도형 ─────────
   본문 칸(.bd) 안만 봄. 모양은 화면에 그려진 그대로(isPointInStroke · isPointInFill)로 잼. 부품이 일부러 겹치게 한 선은 data-ok 로 뺌.
   이름표 거리는 부품이 data-pt="x,y"(가리키는 점, svg 좌표) · data-leader(지시선 있음)를 단 글만 잼. 결측 이음 선은 data-gap. */
var SHP = 'line,path,polyline,polygon,rect,circle,ellipse';
function rgbA(s) { var m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null }
function lumA(c) { return c ? (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255 : 1 }
function cdist(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) }
function deepCheck(el, bd, k, r0, toS, visible, R) {
  var o = { textLine: [], textShape: [], hidden: [], farLabel: [], gap: [], outAxis: [], flowRev: [], flowCross: [], meaning: [], deco: [] }, CI = new Map();
  function push(a, s) { if (a.indexOf(s) < 0) a.push(s) }
  function cl(x, y) { return new DOMPoint(r0.left + x * k, r0.top + y * k) }
  function user(e, x, y) { var m = CI.get(e); if (m === undefined) { var c = e.getScreenCTM && e.getScreenCTM(); m = c ? c.inverse() : null; CI.set(e, m) } return m ? cl(x, y).matrixTransform(m) : null }
  function slideOf(e, p) { var q = new DOMPoint(p.x, p.y).matrixTransform(e.getScreenCTM()); return [(q.x - r0.left) / k, (q.y - r0.top) / k] }
  function inB(e, x, y) { var b = e._b; return !b || (x >= b.l - 1 && x <= b.r + 1 && y >= b.t - 1 && y <= b.b + 1) }
  function inStroke(e, x, y) { if (!inB(e, x, y)) return false; var p = user(e, x, y); try { return !!p && e.isPointInStroke(p) } catch (er) { return false } }
  function inFill(e, x, y) { if (e.namespaceURI !== NS) { var b = e._b; return x >= b.l && x <= b.r && y >= b.t && y <= b.b } if (!inB(e, x, y)) return false; var p = user(e, x, y); try { return !!p && e.isPointInFill(p) } catch (er) { return false } }
  function hit(a, b, pad) { pad = pad || 0; return a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad }
  function grid(q, nx, ny) { var P = []; for (var i = 0; i < nx; i++) for (var j = 0; j < ny; j++) P.push([q.l + (q.r - q.l) * (i + .5) / nx, q.t + (q.b - q.t) * (j + .5) / ny]); return P }
  function nm(e) { var t = e.textContent && e.textContent.trim(); if (t) return t.slice(0, 10); var g = e.parentNode && e.parentNode.querySelector && e.parentNode.querySelector('text'); return (g && g.textContent.trim().slice(0, 10)) || e.tagName }
  function ib(a, b) { return { l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) } }
  function boxOf(e, x, y, w, hh) { var m = e.getScreenCTM(); if (!m) return null; var P = [[x, y], [x + w, y], [x, y + hh], [x + w, y + hh]].map(function (c) { var q = new DOMPoint(c[0], c[1]).matrixTransform(m); return [(q.x - r0.left) / k, (q.y - r0.top) / k] });
    return { l: Math.min.apply(null, P.map(function (c) { return c[0] })), r: Math.max.apply(null, P.map(function (c) { return c[0] })), t: Math.min.apply(null, P.map(function (c) { return c[1] })), b: Math.max.apply(null, P.map(function (c) { return c[1] })) } }
  // 그려도 보이는 곳 = 장 · 본문 칸 ∩ 안쪽 svg 판 ∩ clip-path 상자
  var BDB = toS(bd.getBoundingClientRect()), VIEW = ib({ l: 0, t: 0, r: 1280, b: 720 }, { l: BDB.l - 40, t: BDB.t - 40, r: BDB.r + 40, b: BDB.b + 40 });
  function clipOf(e) { var c = VIEW, n = e;
    while (n && n !== bd && n.nodeType === 1) { if (n.namespaceURI === NS) {
        if (n.tagName === 'svg' && n.ownerSVGElement && n.parentNode.getScreenCTM) { var vb = boxOf(n.parentNode, n.x.baseVal.value, n.y.baseVal.value, n.width.baseVal.value, n.height.baseVal.value); if (vb) c = ib(c, vb) }
        var cp = n.getAttribute('clip-path'), id = cp && /#([^)"']+)/.exec(cp); if (id) { var ce = document.getElementById(id[1]), r = ce && ce.firstElementChild; if (r && r.getBBox) { var bb = r.getBBox(), cb = boxOf(n, bb.x, bb.y, bb.width, bb.height); if (cb) c = ib(c, cb) } } }
      n = n.parentNode }
    return c }
  function samples(e) { var P = [], L = 0; try { L = e.getTotalLength() } catch (er) { return P } var st = Math.max(4, L / 300); for (var d = 0; d <= L; d += st) P.push(slideOf(e, e.getPointAtLength(d))); return P }
  var Sh = [];
  bd.querySelectorAll(SHP).forEach(function (e) { if (!visible(e) || e.closest('defs,marker,pattern,clipPath,mask')) return; var cs = getComputedStyle(e), op = 1, n = e;
    while (n && n !== el && n.nodeType === 1) { op *= +getComputedStyle(n).opacity; n = n.parentNode }
    var st = cs.stroke && cs.stroke !== 'none' ? rgbA(cs.stroke) : null, sw = parseFloat(cs.strokeWidth) || 0, so = (+cs.strokeOpacity) * op;
    if (st && (sw <= 0 || so < .05 || st[3] === 0)) st = null;
    var fid = /url\(["']?#([^"')]+)/.exec(cs.fill || ''), fe = fid && document.getElementById(fid[1]), fu = !!(fe && fe.tagName === 'pattern'), fl = !fid && cs.fill && cs.fill !== 'none' ? rgbA(cs.fill) : null, fo = (+cs.fillOpacity) * op * (fl ? fl[3] : 1);
    if (fl && fo < .03) fl = null; if (e.tagName === 'line') { fl = null; fu = false }
    var b = ib(toS(e.getBoundingClientRect()), clipOf(e)); if (b.r - b.l < .5 || b.b - b.t < .5) { if (!(e.tagName === 'line' && (b.r - b.l >= 0 && b.b - b.t >= 0) && (b.r - b.l > 2 || b.b - b.t > 2))) return } e._b = b;
    Sh.push({ e: e, st: st, sw: sw, fl: fl, fu: fu, fo: fo, b: b, w: b.r - b.l, h: b.b - b.t, dash: !!(cs.strokeDasharray && cs.strokeDasharray !== 'none'), hair: !!st && sw <= 1.5 && lumA(st) > .85, svg: e.ownerSVGElement }) });
  // 차트 판 = 가로 눈금선(옅은 점선) 3개 이상인 svg — 위아래 끝 = 가로 긴 선의 끝
  var charts = new Map();
  bd.querySelectorAll('svg').forEach(function (sv) { var Hz = Sh.filter(function (s) { return s.svg === sv && s.st && s.w > 200 && s.h < 3 });
    if (Hz.filter(function (s) { return s.hair && s.dash }).length >= 3) charts.set(sv, { top: Math.min.apply(null, Hz.map(function (s) { return s.b.t })), bot: Math.max.apply(null, Hz.map(function (s) { return s.b.b })), ys: Hz.map(function (s) { return (s.b.t + s.b.b) / 2 }) }) });
  var Tx = R.filter(function (a) { return bd.contains(a[0]) });
  // ① 글-선 · ② 글-도형(걸침)
  Tx.forEach(function (a) { var t = a[0], q0 = a[1], q = { l: q0.l + 2, r: q0.r - 2, t: q0.t + 1.5, b: q0.b - 1.5 }; if (q.r <= q.l || q.b <= q.t) return;
    var tcs = getComputedStyle(t), halo = t.namespaceURI === NS && /^stroke/.test(tcs.paintOrder || '') && tcs.stroke !== 'none';
    var P = grid(q, Math.max(3, Math.min(14, Math.round((q.r - q.l) / 6))), 3);
    // 받침 = 글 밑에 먼저 그린 불투명 칸(번호 동그라미 · 이름표 상자 · 카드) — 그보다 먼저 그린 선 · 면은 가려져 안 보이므로 뺌
    var back = null;
    Sh.forEach(function (s) { if (!s.fl || s.fo < .9 || s.e.tagName === 'line' || !hit(s.b, q) || !(t.compareDocumentPosition(s.e) & Node.DOCUMENT_POSITION_PRECEDING)) return;
      var n = 0; P.forEach(function (p) { if (inFill(s.e, p[0], p[1])) n++ }); if (n >= P.length * .9 && (!back || (back.compareDocumentPosition(s.e) & Node.DOCUMENT_POSITION_FOLLOWING))) back = s.e });
    if (!back) { var an = t.parentElement; while (an && an !== bd) { var bc = an.namespaceURI !== NS && rgbA(getComputedStyle(an).backgroundColor); if (bc && bc[3] >= .9) { back = an; break } an = an.parentElement } }
    Sh.forEach(function (s) { if (!hit(s.b, q)) return; var e = s.e; if (e.hasAttribute('data-ok') || (e.parentNode && e.parentNode.hasAttribute && e.parentNode.hasAttribute('data-ok'))) return;
      if (back && (e === back || (back.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING))) return;
      if (s.st && !s.hair && !halo && P.some(function (p) { return inStroke(e, p[0], p[1]) })) { push(o.textLine, a[2] + ' × 선(' + e.tagName + ')'); return }
      if (((s.fl && lumA(s.fl) < .86 && s.fo >= .3) || s.fu) && e.tagName !== 'line' && ((e.getAttribute('d') || '').match(/[LHVCQA]/gi) || []).length <= 80) { var n = 0; P.forEach(function (p) { if (inFill(e, p[0], p[1])) n++ }); if (n > 0 && n < P.length) push(o.textShape, a[2] + ' × 도형(' + e.tagName + ')') } }) });
  // ③ 상자-자료 가림 : 나중에 그린 불투명 상자가 먼저 그린 글 · 차트 선 · 점을 덮음
  var covers = Sh.filter(function (s) { return s.fl && s.fo >= .9 && s.w * s.h >= 1500 && s.e.tagName !== 'line' });
  bd.querySelectorAll('div').forEach(function (d) { if (!visible(d)) return; var c = rgbA(getComputedStyle(d).backgroundColor); if (!c || c[3] < .9) return; var b = toS(d.getBoundingClientRect()), w = b.r - b.l, hh = b.b - b.t;
    if (w * hh < 1500 || (w > 1000 && hh > 400)) return; d._b = b; covers.push({ e: d, b: b }) });
  var marks = Tx.map(function (a) { return { e: a[0], b: a[1], t: 'text', name: a[2] } });
  Sh.forEach(function (s) { if (!charts.get(s.svg)) return; if (s.st && s.sw >= 2 && !s.dash && !s.fl && /^(path|polyline|line)$/.test(s.e.tagName)) marks.push({ e: s.e, b: s.b, t: 'line' });
    else if (s.e.tagName === 'circle' && s.fl && s.w <= 18) marks.push({ e: s.e, b: s.b, t: 'dot' }) });
  covers.forEach(function (c) { marks.forEach(function (m) { if (m.e === c.e || !hit(c.b, m.b) || c.e.contains(m.e) || m.e.contains(c.e)) return;
    if (!(c.e.compareDocumentPosition(m.e) & Node.DOCUMENT_POSITION_PRECEDING)) return;
    var pts = m.t === 'text' ? grid(m.b, 4, 2) : m.t === 'dot' ? [[(m.b.l + m.b.r) / 2, (m.b.t + m.b.b) / 2]] : samples(m.e), n = 0;
    pts.forEach(function (p) { if (p[0] > c.b.l && p[0] < c.b.r && p[1] > c.b.t && p[1] < c.b.b && inFill(c.e, p[0], p[1])) n++ });
    if (m.t === 'text' ? n >= 4 : n >= (m.t === 'dot' ? 1 : 2)) push(o.hidden, '「' + nm(c.e) + '」 상자가 ' + (m.t === 'text' ? '글 「' + m.name + '」' : m.t === 'dot' ? '자료 점' : '차트 선') + ' 가림') }) });
  // ④ 이름표 거리 : 가리키는 점과 40px 넘게 떨어졌는데 지시선 없음
  bd.querySelectorAll('[data-pt]').forEach(function (t) { if (!visible(t)) return; var sv = t.ownerSVGElement, a = String(t.getAttribute('data-pt')).split(',').map(Number); if (!sv || a.length < 2 || isNaN(a[0]) || isNaN(a[1])) return;
    var q = new DOMPoint(a[0], a[1]).matrixTransform(sv.getScreenCTM()), px = (q.x - r0.left) / k, py = (q.y - r0.top) / k, b = toS(t.getBoundingClientRect());
    var dx = Math.max(b.l - px, 0, px - b.r), dy = Math.max(b.t - py, 0, py - b.b), d = Math.sqrt(dx * dx + dy * dy);
    if (d > 40 && !t.hasAttribute('data-leader')) push(o.farLabel, '「' + t.textContent.trim().slice(0, 12) + '」 ' + Math.round(d) + 'px') });
  // ⑤ 결측 끊김 · ⑥ 축 밖
  Sh.forEach(function (s) { var ch = charts.get(s.svg); if (!ch || !s.st || s.fl || s.sw < 2 || s.dash) return;
    if (s.e.tagName === 'path') { var d = s.e.getAttribute('d') || '', nM = (d.match(/M/g) || []).length, nSeg = (d.match(/[LHVC]/g) || []).length;
      if (nM > 1 && nSeg >= 6 && !s.svg.querySelector('[data-gap]')) push(o.gap, '선 ' + (nM - 1) + '곳 끊김') }
    if (/^(path|polyline)$/.test(s.e.tagName) && samples(s.e).some(function (p) { return (p[1] < ch.top - 6 && p[1] > ch.top - 40) || (p[1] > ch.bot + 6 && p[1] < ch.bot + 40) })) push(o.outAxis, '선이 축 범위 밖') });
  Sh.forEach(function (s) { var ch = charts.get(s.svg); if (ch && s.e.tagName === 'circle' && s.fl && s.w <= 18) { var y = (s.b.t + s.b.b) / 2; if ((y < ch.top - 6 && y > ch.top - 40) || (y > ch.bot + 6 && y < ch.bot + 40)) push(o.outAxis, '점이 축 범위 밖') } });
  charts.forEach(function (ch, sv) { sv.querySelectorAll('text').forEach(function (t) { if (/자료\s*없음|미발표|결측/.test(t.textContent)) push(o.gap, '차트 위 결측 글 「' + t.textContent.trim().slice(0, 12) + '」') }) });
  // ⑦ 흐름 방향 : 산키 띠(M C L C Z) — 오른쪽 → 왼쪽 띠 · 같은 두 기둥 사이 띠 교차
  var rib = [];
  Sh.forEach(function (s) { if (!(s.fl || s.fu) || s.e.tagName !== 'path') return; var d = s.e.getAttribute('d') || '', cm = d.replace(/[^MCLZ]/gi, '').toUpperCase(), nu = d.match(/-?[\d.]+/g) || [];
    if (cm !== 'MCLCZ' || nu.length !== 16) return; nu = nu.map(Number); rib.push({ x0: nu[0], x1: nu[6], a: (nu[1] + nu[15]) / 2, b: (nu[7] + nu[9]) / 2 });
    if (nu[6] < nu[0] - 2) push(o.flowRev, '띠 ' + Math.round(nu[0]) + '→' + Math.round(nu[6])) });
  var nx = 0; rib.forEach(function (p, i) { for (var j = i + 1; j < rib.length; j++) { var q = rib[j]; if (Math.abs(p.x0 - q.x0) < 2 && Math.abs(p.x1 - q.x1) < 2 && (p.a - q.a) * (p.b - q.b) < -1) nx++ } });
  if (nx) push(o.flowCross, '띠 교차 ' + nx + '곳');
  // ⑧ 뜻 표시 : 점선 · 면 · 빗금마다 범례(같은 색)나 24px 안 이름표(눈금 글 뺌)
  var legC = [];
  bd.querySelectorAll('.leg i').forEach(function (i) { var cs = getComputedStyle(i), c = rgbA(cs.backgroundColor); if (c && c[3] > 0) legC.push(c); var m = /rgba?\([^)]*\)/.exec(cs.backgroundImage || ''); if (m) legC.push(rgbA(m[0])) });
  Sh.forEach(function (s) { if (s.fl && s.w <= 18 && s.h <= 16) legC.push(s.fl); if (s.st && s.e.tagName === 'line' && s.w <= 32 && s.h <= 5) legC.push(s.st) });
  var lab = Tx.filter(function (a) { var t = a[0], cs = getComputedStyle(t), fz = parseFloat(cs.fontSize), c = rgbA(t.namespaceURI === NS ? cs.fill : cs.color); return !(fz <= 12.6 && c && cdist(c, [107, 117, 112]) < 40 && /^[\d\s.,:%~\-−+'()QH년월분기]*$/.test(t.textContent.trim())) });
  Sh.forEach(function (s) { var e = s.e, kind = null, c = null;
    if (s.st && s.dash && !s.hair && !s.fl && Math.sqrt(s.w * s.w + s.h * s.h) >= 40) { kind = '점선'; c = s.st }
    else if (s.fu && s.w * s.h >= 600) kind = '빗금';
    else if (s.fl && e.tagName !== 'line' && s.w * s.h >= 2500 && Math.min(s.w, s.h) >= 14 && lumA(s.fl) < .985 && (s.fo < .9 || lumA(s.fl) >= .88) && ((e.getAttribute('d') || '').match(/[CQA]/gi) || []).length < 2) { kind = '면'; c = s.fl }
    if (!kind) return;
    var ch = charts.get(s.svg); if (kind === '면' && e.tagName === 'rect' && ch && ch.ys.some(function (y) { return Math.abs(s.b.b - y) <= 2.5 || Math.abs(s.b.t - y) <= 2.5 })) return;   // 막대
    if (kind === '점선') { var ends = []; try { var L = e.getTotalLength(); ends = [slideOf(e, e.getPointAtLength(0)), slideOf(e, e.getPointAtLength(L))] } catch (er) { }   // 잇는 선 = 끝이 글 · 칸에 닿음
      if (ends.some(function (pt) { var bx = { l: pt[0], r: pt[0], t: pt[1], b: pt[1] }; return Tx.some(function (a) { return hit(a[1], bx, 10) }) || Sh.some(function (q) { return q !== s && (q.fl || q.st) && q.w * q.h >= 120 && q.e.tagName !== 'line' && hit(q.b, bx, 8) }) })) return }
    if (lab.some(function (a) { return hit(a[1], s.b, 40) }) || (c && legC.some(function (q) { return cdist(q, c) < 24 }))) return;
    push(o.meaning, kind + '(' + e.tagName + ' ' + Math.round(s.b.l) + ',' + Math.round(s.b.t) + ')') });
  // ⑨ 장식 도형 : 기울인 글 · 도장(90도 배수 아님) · 흐림 필터 · 아주 옅은 큰 도형
  bd.querySelectorAll('[transform]').forEach(function (e) { if (!visible(e) || !e.ownerSVGElement || !(e.tagName === 'text' || e.querySelector('text'))) return;
    var m = e.ownerSVGElement.getScreenCTM().inverse().multiply(e.getScreenCTM()), ang = Math.atan2(m.b, m.a) * 180 / Math.PI, r = ((ang % 90) + 90) % 90;
    if (r > 2 && r < 88 && !(e.parentNode && e.parentNode.closest && e.parentNode.closest('[transform]') && o.deco.length)) push(o.deco, '기울인 글 · 도장 「' + nm(e) + '」 ' + Math.round(ang) + '°') });
  bd.querySelectorAll('*').forEach(function (e) { var cs = getComputedStyle(e); if (/blur/.test(cs.filter || '') && visible(e)) push(o.deco, '흐림 필터 「' + nm(e) + '」');
    if (e.namespaceURI !== NS && cs.transform && cs.transform !== 'none' && Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim() })) { var mm = /matrix\(([^,]+),\s*([^,]+)/.exec(cs.transform); if (mm) { var an = Math.atan2(+mm[2], +mm[1]) * 180 / Math.PI, rr = ((an % 90) + 90) % 90; if (rr > 2 && rr < 88) push(o.deco, '기울인 글 「' + nm(e) + '」 ' + Math.round(an) + '°') } } });
  Sh.forEach(function (s) { if (/^(rect|circle|ellipse)$/.test(s.e.tagName) && !s.st && s.fl && s.fo > 0 && s.fo <= .15 && s.w * s.h >= 8000 && !lab.some(function (a) { return hit(a[1], s.b, 24) })) push(o.deco, '옅은 장식 도형(' + s.e.tagName + ' ' + Math.round(s.b.l) + ',' + Math.round(s.b.t) + ')') });
  Sh.forEach(function (s) { delete s.e._b });
  return o }

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
      var dp = null; if (bdE && !CHECK_SHALLOW) { try { dp = deepCheck(el, bdE, k, r0, toS, visible, R) } catch (er) { dp = { error: [String(er && er.message || er).slice(0, 80)] } } }
      return { ov: ov, outS: outS, outB: outB, minF: minF, dp: dp } }
    var ti = textIssues(), nb = nBeats(i), ov = ti.ov, outS = ti.outS, outB = ti.outB, minF = ti.minF, dp = ti.dp || {};
    if (!(el._tips > 0) && el.querySelector('.bd svg') && /line|bar|combo|minis|zoom|slope|race|rank|map|kpi|odo|heat|donut|waffle|split|bridge/.test(x.s.kind || '')) dp.noTip = ['차트 · 지도 · 숫자에 마우스 올림 카드 없음'];
    if (nb && el._beat) { el._beat(nb); var t2 = textIssues(); t2.ov.forEach(function (x) { if (ov.indexOf(x) < 0) ov.push('[바뀜] ' + x) }); t2.outS.forEach(function (x) { if (outS.indexOf(x) < 0) outS.push('[바뀜] ' + x) }); t2.outB.forEach(function (x) { if (outB.indexOf(x) < 0) outB.push('[바뀜] ' + x) });
      if (t2.dp) Object.keys(t2.dp).forEach(function (key) { dp[key] = dp[key] || []; t2.dp[key].forEach(function (x) { if (dp[key].indexOf(x) < 0 && dp[key].indexOf('[바뀜] ' + x) < 0) dp[key].push('[바뀜] ' + x) }) }); el._beat(0) }
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
      headLines: hm && hm.textContent.trim() ? Math.round(hm.getBoundingClientRect().height / k / 35.5) : 0, occupied: bd && !el.querySelector('.fl svg') ? Math.round(occ / cells.length * 100) : null, beats: nBeats(i) });
    var rec = out.slides[out.slides.length - 1]; Object.keys(dp).forEach(function (key) { if (dp[key] && dp[key].length) rec[key] = dp[key].slice(0, 8) });
    /* 6판 규격 측정 : 보이는 글의 글자 크기(SVG 글 + HTML 글, 계산된 값) · 선 굵기 · 사각형 모서리 분포 */
    var hz = {}, wz = {}, rz = {}; function inc(m, v) { v = Math.round(v * 10) / 10; m[v] = (m[v] || 0) + 1 }
    el.querySelectorAll('text').forEach(function (t) { if (t.textContent.trim() && visible(t)) inc(hz, parseFloat(getComputedStyle(t).fontSize) || 0) });
    el.querySelectorAll('*').forEach(function (e) { if (e.namespaceURI === NS || !Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim() }) || !visible(e)) return; inc(hz, parseFloat(getComputedStyle(e).fontSize) || 0) });
    el.querySelectorAll('rect,path,line,polyline,polygon,circle,ellipse').forEach(function (e) { if (!visible(e)) return; var cs = getComputedStyle(e); if (cs.stroke && cs.stroke !== 'none') { var w = parseFloat(cs.strokeWidth); if (w > 0) inc(wz, w) }
      if (e.tagName === 'rect') { var r = parseFloat(e.getAttribute('rx')); if (r > 0) inc(rz, r) } });
    rec.fsz = hz; rec.swz = wz; rec.rxz = rz;
    /* 6판 품질 점검 4항목 : 칸 수(본문 칸 안 칸이 5개 넘음) · 흰 테두리 칸(흰 면 + 테두리) · 그림 크기(그림 장인데 가장 큰 그림이 본문 칸의 35% 밑) · 선명도(그림을 원본보다 크게 늘림) */
    (function () { var bdE = el.querySelector('.bd'); if (!bdE) return; var BB = toS(bdE.getBoundingClientRect()), bA = Math.max(1, (BB.r - BB.l) * (BB.b - BB.t)), cards = [], wb = [], big = 0, blur = [];
      function lum(c) { var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return -1; var v = m[1].split(',').map(parseFloat); if (v.length > 3 && v[3] < .5) return -1; return (v[0] * .299 + v[1] * .587 + v[2] * .114) / 255 }
      bdE.querySelectorAll('div').forEach(function (e) { if (!visible(e)) return; var q = toS(e.getBoundingClientRect()), w = q.r - q.l, hh = q.b - q.t; if (w < 80 || hh < 50 || w * hh > bA * .9) return;
        var cs = getComputedStyle(e), bgL = lum(cs.backgroundColor), bw = Math.max(parseFloat(cs.borderTopWidth) || 0, parseFloat(cs.borderLeftWidth) || 0) * (cs.borderTopStyle === 'none' && cs.borderLeftStyle === 'none' ? 0 : 1);
        if (bgL < 0 && !bw) return; cards.push(e); if (bgL >= .97 && bw > 0) wb.push(q) });
      var top = cards.filter(function (e) { return !cards.some(function (o) { return o !== e && o.contains(e) }) });
      bdE.querySelectorAll('rect').forEach(function (e) { if (!visible(e)) return; var cs = getComputedStyle(e); if (!cs.stroke || cs.stroke === 'none' || !(parseFloat(cs.strokeWidth) > 0)) return; var q = toS(e.getBoundingClientRect()); if (q.r - q.l < 60 || q.b - q.t < 40) return; if (lum(cs.fill) >= .97) wb.push(q) });
      el.querySelectorAll('.bd svg,.bd img,.bd canvas,.fl svg,.fl img').forEach(function (e) { if (!visible(e)) return; var q = toS(e.getBoundingClientRect()); big = Math.max(big, (q.r - q.l) * (q.b - q.t) / bA);
        if (e.tagName === 'IMG' && e.naturalWidth && e.naturalWidth < (q.r - q.l) * .95) blur.push(e.naturalWidth + 'px 원본을 ' + Math.round(q.r - q.l) + 'px 로') });
      if (top.length > 5) rec.qCards = ['칸 ' + top.length + '개'];
      if (wb.length && !/map|body|anatomy|build|iso|plan/.test((x.s.kind || '') + ' ' + (x.s.layout || ''))) rec.qWhite = wb.slice(0, 4).map(function (q) { return Math.round(q.l) + ',' + Math.round(q.t) + ' ' + Math.round(q.r - q.l) + '×' + Math.round(q.b - q.t) });
      if (/map|shot|img|photo|pict|body|plan|iso|clip/.test(x.s.kind || '') && big < .35) rec.qPic = ['가장 큰 그림이 본문 칸의 ' + Math.round(big * 100) + '%'];
      if (blur.length) rec.qBlur = blur.slice(0, 4) })();
    /* 6판 : 밝은 바탕 위 밝은 글 — 글 가운데 점 아래에서 처음 만나는 칠한 면(없으면 장 바탕 흰색)과 글 색이 모두 밝으면 */
    (function () { var bad = []; function lum2(c) { var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return -1; var v = m[1].split(',').map(parseFloat); if (v.length > 3 && v[3] < .35) return -1; return (v[0] * .299 + v[1] * .587 + v[2] * .114) / 255 }
      var FL = []; el.querySelectorAll('rect,circle,ellipse,path,polygon,div,span,b,i,em,p,li,td,th').forEach(function (o) { if (!visible(o)) return; var cs = getComputedStyle(o), f = o.namespaceURI === NS ? lum2(cs.fill) : lum2(cs.backgroundColor); if (f < 0 || (o.namespaceURI === NS && +cs.fillOpacity < .35)) return; var r = o.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return; FL.push([o, r, f, r.width * r.height]) });
      function under(e, cx, cy) { var best = null; FL.forEach(function (q) { if (q[0] === e || e.contains(q[0])) return; var r = q[1]; if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return; if (!best || q[3] < best[3]) best = q }); return best ? best[2] : 1 }
      el.querySelectorAll('text').forEach(function (e) { if (!e.textContent.trim() || !visible(e)) return; var tl = lum2(getComputedStyle(e).fill); if (tl < .8) return; var r = e.getBoundingClientRect(); if (!r.width) return; if (under(e, r.left + r.width / 2, r.top + r.height / 2) > .8) bad.push(e.textContent.trim().slice(0, 12)) });
      el.querySelectorAll('*').forEach(function (e) { if (e.namespaceURI === NS || !visible(e) || !Array.prototype.some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim() })) return; var tl = lum2(getComputedStyle(e).color); if (tl < .8) return; var r = e.getBoundingClientRect(); if (!r.width) return;
        var b = e, bg = -1; while (b && b !== el && bg < 0) { bg = lum2(getComputedStyle(b).backgroundColor); b = b.parentElement } if (bg < 0) bg = under(e, r.left + r.width / 2, r.top + r.height / 2); if (bg > .8) bad.push(e.textContent.trim().slice(0, 12)) });
      if (bad.length) rec.lowC = bad.slice(0, 6) })();
    var offF = Object.keys(hz).filter(function (v) { return +v <= 62 && SPEC.fs.indexOf(+v) < 0 }), offW = Object.keys(wz).filter(function (v) { return +v <= 8.5 && SPEC.sw.indexOf(+v) < 0 }), nHero = Object.keys(hz).reduce(function (a, v) { return a + (+v >= 48 && +v <= 62 ? hz[v] : 0) }, 0);
    if (offF.length) rec.specFs = offF.map(function (v) { return v + 'px ' + hz[v] + '곳' }); if (offW.length) rec.specSw = offW.map(function (v) { return v + 'px ' + wz[v] + '곳' }); var hl = heroList(el); if (hl.length > 1) rec.specHero = ['숫자 든 48~62px 글 ' + hl.length + '곳 : ' + hl.slice(0, 4).map(function (e) { return e.textContent.trim().slice(0, 12) }).join(' / ')];
    el.classList.remove('on') });
  if (cur >= 0) S[cur].el.classList.add('on'); return out }

/* ───────── 마우스 올림 자세히 보기(5판 P7) ─────────
   차트 점 · 막대 · 지도 나라 · 도식 마디 · 숫자 칸에 마우스를 올리거나 Tab 으로 옮기면 작은 카드(제목 · 값 · 전기 대비 · 사건 · 출처).
   부품을 고치지 않고 장 자료에서 만듦: ① s.tips{이름: '제목|줄|줄'} ② x축(u.xLabels)을 그린 차트 → 투명 세로 칸 ③ data-key 항목 → 장 자료에서 같은 이름 항목의 설명 · 값
   ④ data-count 숫자 → 값 · 최근 값들 · 기준일 · 출처. 카드는 장(1280×720) 밖으로 나가지 않고, ?still · ?check · 인쇄 · 모아 보기에서는 안 뜸 */
var TIP = null, tipCur = null;
function tipDec(arr) { var d = 0; (arr || []).forEach(function (v) { if (typeof v === 'number' && isFinite(v)) { var m = String(v).split('.')[1]; if (m) d = Math.max(d, Math.min(2, m.length)) } }); return d }
function tipNum(v, dec, suf) { return v == null || !isFinite(v) ? '—' : nf(v, dec) + (suf || '') }
function tipSigned(v, dec) { v = +(+v).toFixed(dec || 0); return (v > 0 ? '+' : v < 0 ? '−' : '±') + nf(Math.abs(v), dec) }
function tipClean(s) { return String(s == null ? '' : s).replace(/\*\*|==/g, '').replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰⁽⁾]+\)?/g, '').trim() }
function tipSuf(s) { var y = s.y || {}, u = y.suf || (y.unit && String(y.unit).length <= 3 ? y.unit : '') || (s.unit && String(s.unit).length <= 3 ? s.unit : ''); return u || '' }
function tipSrc(s) { var f = s.foot || {}, o = []; if (f.asof) o.push('기준 ' + tipClean(f.asof)); if (f.source) o.push('출처 ' + tipClean(f.source).slice(0, 44)); return o }
function tipSeries(s) { var L = Array.isArray(s.labels) ? s.labels : null; if (!L || L.length < 2) return null;
  var ser = Array.isArray(s.series) ? s.series.filter(function (q) { return q && Array.isArray(q.data) && q.data.length === L.length }) : [];
  if (!ser.length && Array.isArray(s.data) && s.data.length === L.length && s.data.every(function (v) { return v == null || typeof v === 'number' })) ser = [{ name: '', data: s.data }];
  return ser.length ? { L: L, ser: ser } : null }
function tipEvents(s, L, i) { var o = []; (Array.isArray(s.events) ? s.events : []).forEach(function (e) { if (!e) return; var at = e.at != null ? e.at : e.i != null ? e.i : e.x;
  if (at === i || at === L[i] || (typeof at === 'string' && at === String(L[i]))) o.push('사건 ' + tipClean(e.text || e.label || e.name || e.t || '')) }); return o }
function tipCol(s, D2, i) { var L = D2.L, suf = tipSuf(s), lines = [], one = D2.ser.length === 1;
  D2.ser.forEach(function (q) { var dec = tipDec(q.data), v = q.data[i]; if (v == null) { lines.push((tipClean(q.name) ? tipClean(q.name) + ' ' : '') + '자료 없음'); return }
    var t = (tipClean(q.name) ? tipClean(q.name) + ' ' : '') + tipNum(v, dec, suf), pv = null; for (var j = i - 1; j >= 0; j--) if (q.data[j] != null) { pv = q.data[j]; break }
    if (pv != null) t += ' · 전기 대비 ' + tipSigned(v - pv, dec);
    if (one && /^\d{4}\.\d{2}$/.test(String(L[i])) && i >= 12 && q.data[i - 12] != null) t += ' · 전년 대비 ' + tipSigned(v - q.data[i - 12], dec);
    lines.push(t) });
  return [tipClean(L[i])].concat(lines, tipEvents(s, L, i), tipSrc(s)).join('|') }
/* 장 자료에서 이름이 key 인 항목을 찾아 그 항목의 다른 글 · 값을 줄로 */
function tipItem(s, key) { var hit = null, NM = ['name', 'title', 'label', 'k', 'c', 'term', 'id', 'at'];
  (function walk(o, d) { if (hit || !o || d > 6) return; if (Array.isArray(o)) { o.forEach(function (v) { walk(v, d + 1) }); return }
    if (typeof o !== 'object') return; for (var n = 0; n < NM.length; n++) if (typeof o[NM[n]] === 'string' && tipClean(o[NM[n]]) === key) { hit = o; return }
    Object.keys(o).forEach(function (k) { if (k !== 'foot' && k !== 'eyebrow' && k.charAt(0) !== '_') walk(o[k], d + 1) }) })(s, 0);
  if (!hit) { var mp = s.values; if (mp && !Array.isArray(mp) && typeof mp === 'object' && typeof mp[key] === 'number') { var ks = Object.keys(mp).filter(function (k) { return typeof mp[k] === 'number' }).sort(function (a, b) { return mp[b] - mp[a] });
      return [key, '값 ' + tipNum(mp[key], tipDec([mp[key]]), (s.scale && s.scale.unit) || s.unit || ''), '순위 ' + (ks.indexOf(key) + 1) + ' / ' + ks.length].concat(tipSrc(s)).join('|') } return null }
  var lines = [], unit = hit.unit || s.unit || '';
  ['text', 'desc', 'sub', 'detail', 'gloss', 'def', 'cap', 'meta'].forEach(function (k) { if (typeof hit[k] === 'string' && tipClean(hit[k]) && tipClean(hit[k]) !== key) lines.push(tipClean(hit[k]).slice(0, 90)) });
  ['value', 'v', 'val', 'n'].forEach(function (k) { if (typeof hit[k] === 'number') lines.push('값 ' + tipNum(hit[k], hit.dec != null ? hit.dec : tipDec([hit[k]]), unit)) });
  if (!lines.length) return null; return [key].concat(lines.slice(0, 4), tipSrc(s)).join('|') }
function autoTips(el, s) {
  var n = 0, dry = STILL || CHECK;
  if (s.tips && typeof s.tips === 'object') el.querySelectorAll('[data-key]').forEach(function (e) { var t = s.tips[e.getAttribute('data-key')]; if (t) { e.setAttribute('data-tip', t); n++ } });
  var D2 = tipSeries(s), n0 = n;
  if (D2) el.querySelectorAll('svg').forEach(function (sv) { (sv._tipX || []).forEach(function (r) { if (r.n !== D2.L.length || r.n < 2) return; var ya = r.yAx || sv._tipY, half = Math.abs(r.X(1) - r.X(0)) / 2, top = ya ? ya.top - 6 : 0, bot = ya ? ya.bot + 2 : r.y - 14;
    if (!(half > 0) || bot - top < 20) return; n += r.n; if (dry) return; var g = E('g', { 'class': 'tipcols' }, r.g), tab = r.n <= 36;
    for (var i = 0; i < r.n; i++) { var c = E('rect', { x: (r.X(i) - half).toFixed(1), y: top.toFixed(1), width: (half * 2).toFixed(1), height: (bot - top).toFixed(1), 'class': 'tipcol', 'data-tip': tipCol(s, D2, i) }, g); if (tab || i >= r.n - 12) c.setAttribute('tabindex', '0') } }) });
  if (D2 && n === n0) n += tipPathCols(el, s, D2);
  el.querySelectorAll('[data-key]').forEach(function (e) { if (e.hasAttribute('data-tip')) { n++; return } var k = tipClean(e.getAttribute('data-key')); if (!k) return; var t = tipItem(s, k); if (t) { e.setAttribute('data-tip', t); n++ } });
  el.querySelectorAll('[data-count]').forEach(function (e) { if (e.closest('[data-tip]')) return; var host = e.closest('[data-key]'), title = host ? tipClean(host.getAttribute('data-key')) : tipClean((s.eyebrow && (s.eyebrow.topic || s.eyebrow.group)) || '');
    var lines = ['값 ' + tipClean(e.textContent)]; if (D2 && D2.ser.length === 1) { var q = D2.ser[0], dec = tipDec(q.data), rec = [], suf = tipSuf(s); for (var i = D2.L.length - 1; i >= 0 && rec.length < 6; i--) if (q.data[i] != null) rec.unshift(short2(D2.L[i]) + ' ' + tipNum(q.data[i], dec, suf)); if (rec.length > 1) lines.push('최근 ' + rec.join(' · ')) }
    e.setAttribute('data-tip', [title || '숫자'].concat(lines, tipSrc(s)).join('|')); n++ });
  if (!n) n += tipPairs(el, s);
  if (!n) n += tipBigNums(el, s);
  if (!dry) el.querySelectorAll('[data-tip]').forEach(function (e) { if (!e.hasAttribute('tabindex')) e.setAttribute('tabindex', '0') });
  el._tips = n; return n }
/* 대체 경로 : x축 기록이 없는 차트는 계열 선(path)의 꼭짓점에서 x 자리를 읽고, 그래도 없으면 큰 숫자 글자에 값 카드 */
function tipPathCols(el, s, D2) { var best = null, ys = [];
  el.querySelectorAll('.bd path').forEach(function (p) { if (best || p.getAttribute('fill') !== 'none' || +(p.getAttribute('stroke-width') || 0) < 1.5 || p.hasAttribute('data-gap')) return;
    var d = p.getAttribute('d') || ''; if (/[^MLHV0-9.,\s\-e]/.test(d)) return; var tk = d.match(/[MLHV]|-?[\d.]+(?:e-?\d+)?/g) || [], pts = [], cmd = '', x = 0, y = 0, i = 0;
    while (i < tk.length) { var t = tk[i]; if (/^[MLHV]$/.test(t)) { cmd = t; i++; continue } if (cmd === 'M' || cmd === 'L') { x = +tk[i]; y = +tk[i + 1]; i += 2; pts.push([x, y]); cmd = 'L' } else if (cmd === 'H') { x = +tk[i]; i++; pts.push([x, y]) } else if (cmd === 'V') { y = +tk[i]; i++; pts.push([x, y]) } else i++ }
    var ix = []; D2.ser[0].data.forEach(function (v, k) { if (v != null) ix.push(k) }); if (pts.length === D2.L.length) ix = D2.L.map(function (_, k) { return k }); if (pts.length === ix.length) { best = { p: p, pts: pts, ix: ix }; pts.forEach(function (q) { ys.push(q[1]) }) } });
  if (!best) return 0; var P2 = best.pts, top = Math.min.apply(null, ys) - 40, bot = Math.max.apply(null, ys) + 30, n = P2.length;
  if (STILL || CHECK) return n; var g = E('g', { 'class': 'tipcols' }, best.p.parentNode);
  for (var i = 0; i < n; i++) { var xa = i ? (P2[i - 1][0] + P2[i][0]) / 2 : P2[i][0] - (P2[1][0] - P2[0][0]) / 2, xb = i < n - 1 ? (P2[i][0] + P2[i + 1][0]) / 2 : P2[i][0] + (P2[i][0] - P2[i - 1][0]) / 2;
    var c = E('rect', { x: xa.toFixed(1), y: top.toFixed(1), width: Math.max(1, xb - xa).toFixed(1), height: (bot - top).toFixed(1), 'class': 'tipcol', 'data-tip': tipCol(s, D2, best.ix[i]) }, g); if (n <= 36 || i >= n - 12) c.setAttribute('tabindex', '0') }
  return n }
function tipPairs(el, s) { var dt = Array.isArray(s.data) ? s.data : null; if (!dt || !dt.length || !dt.every(function (r) { return Array.isArray(r) && r.length >= 2 && typeof r[1] === 'number' })) return 0;
  var srt = dt.slice().sort(function (a, b) { return b[1] - a[1] }), dec = s.dec != null ? s.dec : tipDec(dt.map(function (r) { return r[1] })), un = s.unit ? ' ' + s.unit : '', avg = dt.reduce(function (a, r) { return a + r[1] }, 0) / dt.length, n = 0;
  el.querySelectorAll('.bd text').forEach(function (tx) { var nm = tx.textContent.trim(), row = null; dt.forEach(function (r) { if (String(r[0]) === nm) row = r }); if (!row) return;
    var tip = [nm, '값 ' + tipNum(row[1], dec, un), '순위 ' + (srt.indexOf(row) + 1) + ' / ' + dt.length + ' · 평균 대비 ' + tipSigned(row[1] - avg, dec)].concat(tipSrc(s)).join('|'), ty = +tx.getAttribute('y'), svg = tx.ownerSVGElement;
    tx.setAttribute('data-tip', tip); n++; if (!svg || isNaN(ty)) return;
    svg.querySelectorAll('rect').forEach(function (r) { var y = +r.getAttribute('y'), h = +r.getAttribute('height'); if (!isNaN(y) && h > 4 && h < 60 && ty >= y - 4 && ty <= y + h + 8 && !r.hasAttribute('data-tip')) r.setAttribute('data-tip', tip) }) });
  return n }
function tipBigNums(el, s) { var n = 0, title = tipClean(s.label || (s.eyebrow && (s.eyebrow.topic || s.eyebrow.group)) || ''), src = tipSrc(s);
  el.querySelectorAll('.bd text, .bd div, .bd span, .bd b').forEach(function (e) { if (e.closest('[data-tip]')) return; var own = Array.prototype.filter.call(e.childNodes, function (c) { return c.nodeType === 3 }).map(function (c) { return c.textContent }).join('').trim();
    if (!/^[−\-+]?[\d][\d,.]*$/.test(own)) return; var fs = parseFloat(e.getAttribute('font-size') || (e.style && e.style.fontSize) || 0); if (fs < 34) return;
    var host = e.closest('[data-key]'), t = host ? tipClean(host.getAttribute('data-key')) : title; e.setAttribute('data-tip', [t || '숫자', '값 ' + (typeof s.value === 'number' ? nf(s.value, s.dec || 0) + (s.unit || '') : own)].concat(src).join('|')); n++ });
  return n }
function short2(l) { var m = /^(\d{4})\.(\d{2})$/.exec(String(l)); return m ? m[1].slice(2) + '.' + m[2] : String(l) }
function tipBox() { if (!TIP) { TIP = H('div', 'tip3', null, deckEl); TIP.setAttribute('role', 'tooltip') } return TIP }
function tipShow(el, x, y) { var t = el.getAttribute('data-tip'); if (!t) return; var b = tipBox(); b.innerHTML = ''; tipCur = el;
  t.split('|').forEach(function (s, i) { if (!s) return; var e = H(i ? 'span' : 'b', /^(출처|기준|사건)/.test(s) ? 's' : null, null, b); e.textContent = s });
  b.classList.toggle('dk', !!(el.closest('.bg-deep,.bg-map'))); b.classList.add('on'); tipPlace(x, y) }
function tipPlace(x, y) { var b = TIP; if (!b) return; var w = b.offsetWidth, h = b.offsetHeight, L = x + 16, Tt = y + 16;
  if (L + w > 1272) L = x - 16 - w; if (Tt + h > 712) Tt = y - 16 - h; b.style.left = Math.round(Math.max(8, Math.min(1272 - w, L))) + 'px'; b.style.top = Math.round(Math.max(8, Math.min(712 - h, Tt))) + 'px' }
function tipHide() { if (TIP) TIP.classList.remove('on'); tipCur = null }
function tipXY(e) { var r = deckEl.getBoundingClientRect(); return [(e.clientX - r.left) / scaleK, (e.clientY - r.top) / scaleK] }
function tipTarget(t) { var el = t && t.closest && t.closest('[data-tip]'); return el && cur >= 0 && S[cur].el.contains(el) && !document.getElementById('ov').classList.contains('on') ? el : null }
function tipInit() { if (STILL || CHECK || PRES) return;
  deckEl.addEventListener('pointerover', function (e) { var el = tipTarget(e.target); if (el) { var p = tipXY(e); tipShow(el, p[0], p[1]) } });
  deckEl.addEventListener('pointermove', function (e) { if (tipCur) { var p = tipXY(e); tipPlace(p[0], p[1]) } });
  deckEl.addEventListener('pointerout', function (e) { var el = tipTarget(e.target); if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) tipHide() });
  deckEl.addEventListener('focusin', function (e) { var el = tipTarget(e.target); if (!el) return; var r = el.getBoundingClientRect(), d = deckEl.getBoundingClientRect(); tipShow(el, (r.right - d.left) / scaleK, (r.top - d.top) / scaleK) });
  deckEl.addEventListener('focusout', tipHide) }

/* ───────── 시작 ───────── */
function init() {
  var dd = document.getElementById('deck-data'); if (!dd) return; D = JSON.parse(dd.textContent); var sl = D.slides || [];
  document.body.insertAdjacentHTML('beforeend', '<div id="stage" tabindex="0"><div id="deck"></div></div><div id="ov"></div><div id="toast"></div><div id="pres"></div>');
  stage = document.getElementById('stage'); deckEl = document.getElementById('deck'); if (STILL || CHECK) document.body.classList.add('still');
  var main = sl.filter(function (s) { return !s.appendix }), apx = sl.filter(function (s) { return s.appendix });
  main.concat(apx).forEach(function (s, i) { S.push({ s: s, i: i, apx: !!s.appendix, page: s.appendix ? null : i + 1 }) });
  S.forEach(function (x) { deckEl.appendChild(buildSlide(x)); heroOne(x.el) });
  var m = /#(\d+)/.exec(location.hash), start = m ? Math.min(S.length, Math.max(1, +m[1])) - 1 : 0;
  try { chan = new BroadcastChannel('ecom-' + ((D.meta && D.meta.session) || 'deck')) } catch (e) { chan = null }
  if (CHECK) { var r = runCheck(); var pre = H('pre', null, null, document.body); pre.id = 'ecom-check'; pre.textContent = JSON.stringify(r); go(start, 1, 'none'); return }
  if (PRES) { presenterUI(); cur = start; hud(); if (chan) chan.onmessage = function (ev) { if (ev.data && ev.data.i != null) { cur = ev.data.i; beatK = ev.data.k; hud() } }; return }
  if (chan) chan.onmessage = function (ev) { if (!ev.data) return; if (ev.data.cmd === 'next') next(); else if (ev.data.cmd === 'prev') prev() };
  fit(); addEventListener('resize', fit); document.addEventListener('keydown', onKey); tipInit();
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
