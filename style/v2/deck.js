/* ECOM 발표 엔진 2판 — deck.json(<script id="deck-data">)을 읽어 그리고 돌린다.
   프레임워크 · 외부 주소 없음. 숫자는 만든 때 고정(온라인 갱신 없음).
   움직임은 차분함만: fast 120 · std 240 · scene 480 · count 900(ms), 곡선 enter / std / exit 셋뿐.
   공개 이음새: window.ECOMDeck, document 의 'ecom:slide' 이벤트. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var Q = new URLSearchParams(location.search);
  var CHECK = Q.has('check');
  var PRESENTER = Q.has('presenter');
  var STILL = Q.has('still');
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var NOA = RM || CHECK || STILL;
  var KIND_KO = { cover: '표지', part: '간지', end: '끝', statement: '한 문장', number: '큰 숫자', chart: '차트', diagram: '도식', compare: '비교', question: '질문', table: '표', kpi: '지표 카드', headline: '결론 문장', drivers: '요인', term: '정의' };

  var DATA, META, SL, GLOS, FACTS, N, NM;
  var cards = [], charts = [], votes = {};
  var cur = 0, step = 0, started = false, lastMain = -1;
  var deckEl, stageEl, tipEl, navPos, ovEl, rdpEl, penEl, laserEl, gotoEl, toastEl;
  var reading = false, penOn = false, laserOn = false, gotoBuf = '', gotoTimer = 0, toastTimer = 0;
  var SID = Math.random().toString(36).slice(2), CH_NAME = '', bc = null, pw = null;

  /* ---------- 움직임 토큰 · 곡선 · 단계 재생 ---------- */
  var T = { fast: 120, std: 240, scene: 480, count: 900, stagger: 50, groupMax: 400 };
  var CURVE = { enter: [0.05, 0.7, 0.1, 1], std: [0.2, 0, 0.38, 0.9], exit: [0.3, 0, 0.8, 0.15] };
  function bezier(p1x, p1y, p2x, p2y) {
    function A(a1, a2) { return 1 - 3 * a2 + 3 * a1; }
    function B(a1, a2) { return 3 * a2 - 6 * a1; }
    function C(a1) { return 3 * a1; }
    function calc(t, a1, a2) { return ((A(a1, a2) * t + B(a1, a2)) * t + C(a1)) * t; }
    function slope(t, a1, a2) { return 3 * A(a1, a2) * t * t + 2 * B(a1, a2) * t + C(a1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, s;
      for (i = 0; i < 8; i++) { s = slope(t, p1x, p2x); if (Math.abs(s) < 1e-6) break; t -= (calc(t, p1x, p2x) - x) / s; }
      return calc(t, p1y, p2y);
    };
  }
  var EASE = {};
  Object.keys(CURVE).forEach(function (k) { EASE[k] = bezier.apply(null, CURVE[k]); });

  /* 선(track) = {ms, e, f(p), d}: p 는 곡선을 거친 0~1. f(0) = 그 단계 시작 전 모습, f(1) = 끝 모습.
     한 단계 = 선들의 목록. 앞으로 가면 f(1), 뒤로 가면 f(0) 을 거꾸로 부름 → 점프도 되감기도 한 번에. */
  var players = [];
  function mk(ms, e, f, d) { return { ms: ms, e: e || 'std', f: f, d: d || 0, done: false }; }
  function noMotion() { return NOA || document.hidden; }
  function totalOf(tracks) { var t = 0; tracks.forEach(function (k) { t = Math.max(t, k.d + k.ms); }); return t; }
  function finishPlayer(pl) {
    if (pl.fin) return;
    pl.fin = true;
    if (pl.id) cancelAnimationFrame(pl.id);
    var i = players.indexOf(pl);
    if (i >= 0) players.splice(i, 1);
    pl.tracks.forEach(function (k) { k.f(1); k.done = true; });
    if (pl.cb) pl.cb();
  }
  function play(tracks, cb) {
    var total = totalOf(tracks);
    if (!tracks.length || !total || noMotion()) { tracks.forEach(function (k) { k.f(1); }); if (cb) cb(); return; }
    var pl = { tracks: tracks, fin: false, id: 0, t0: 0, cb: cb };
    players.push(pl);
    tracks.forEach(function (k) { k.done = false; k.f(0); });
    function frame(ts) {
      if (pl.fin) return;
      if (!pl.t0) pl.t0 = ts;
      var t = ts - pl.t0, k, p, i;
      for (i = 0; i < tracks.length; i++) {
        k = tracks[i];
        if (k.done) continue;
        p = clamp((t - k.d) / k.ms, 0, 1);
        if (p > 0) { k.f(EASE[k.e](p)); if (p >= 1) k.done = true; }
      }
      if (t >= total) finishPlayer(pl); else pl.id = requestAnimationFrame(frame);
    }
    pl.id = requestAnimationFrame(frame);
  }
  function flushAnim() {
    var had = players.length > 0;
    players.slice().forEach(finishPlayer);
    return had;
  }
  function stag(n) { return Math.min(T.stagger, T.groupMax / Math.max(1, n)); }

  /* 등장 · 흐림 선 */
  function isSvg(n) { return typeof SVGElement !== 'undefined' && n instanceof SVGElement; }
  function trEnter(node, delay, dy) {
    var move = !isSvg(node) && !node.hasAttribute('data-fade'), d0 = dy == null ? 10 : dy;
    return mk(T.std, 'enter', function (p) {
      node.style.opacity = p >= 1 ? '' : String(p);
      if (move) node.style.transform = p >= 1 ? '' : 'translateY(' + ((1 - p) * d0) + 'px)';
    }, delay);
  }
  function trFade(node, delay, ms, to) {
    var hi = to == null ? 1 : to;
    return mk(ms || T.std, 'enter', function (p) { node.style.opacity = (p >= 1 && hi === 1) ? '' : String(p * hi); }, delay);
  }
  function trFadeOut(node, delay) {
    return mk(T.std, 'exit', function (p) { node.style.opacity = p >= 1 ? '0' : String(1 - p); }, delay);
  }
  function trDim(node, delay) { /* 앞 주석 흐리게 */
    return mk(T.std, 'std', function (p) { node.style.opacity = String(1 - 0.55 * p); }, delay);
  }
  function trEnterAll(nodes, base) {
    var g = stag(nodes.length);
    return nodes.map(function (n, i) { return trEnter(n, (base || 0) + i * g); });
  }
  /* 숫자 굴림(글자 띠) */
  function trCount(node, target, fmtFn, delay) {
    return mk(T.count, 'enter', function (p) { node.textContent = fmtFn(target * p); }, delay);
  }

  /* 색 섞기(막대 색 바꿈) — 장 안에서 풀어낸 토큰 값(장마다 강조색이 다를 수 있음) */
  function cssRGB(name, node) {
    var sl = (node && node.closest && node.closest('.sl')) || document.documentElement;
    sl._rgb = sl._rgb || {};
    if (sl._rgb[name]) return sl._rgb[name];
    var pr = document.createElement('i');
    pr.style.cssText = 'display:none;color:var(' + name + ')';
    sl.appendChild(pr);
    var v = getComputedStyle(pr).color, m = /(-?[\d.]+)[ ,]+(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(v), out = [136, 136, 136];
    if (m) { out = [+m[1], +m[2], +m[3]]; if (/^color\(/.test(v) && out.every(function (n) { return n <= 1.0001; })) out = out.map(function (n) { return Math.round(n * 255); }); }
    sl.removeChild(pr);
    sl._rgb[name] = out;
    return out;
  }
  function mixCss(a, b, p, node) {
    var x = cssRGB(a, node), y = cssRGB(b, node);
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * p); }).join(',') + ')';
  }
  /* 강조색 이름 → 값 (deck.theme.accent · slide.theme.accent) */
  var ACCENTS = { green: '#08805A', blue: '#2A62F0', violet: '#6B4DFF', coral: '#D23A25', amber: '#AD5A00', mono: '#16191D' };
  var DECK_MONO = false, NAVTABS = true;
  function accentOf(th) {
    var a = th && th.accent;
    if (!a) return '';
    return ACCENTS[a] || (/^#[0-9a-f]{6}$/i.test(a) ? a : '');
  }

  /* ---------- 도우미 ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function sv(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) e.setAttribute(k, attrs[k]); }
    if (parent) parent.appendChild(e);
    return e;
  }
  function mark(n) { n.setAttribute('data-mark', '1'); return n; }
  function svt(parent, attrs, text) { var t = sv('text', attrs, parent); t.textContent = text; return t; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* 글 꾸밈: **강조** ^^경고^^ [[풀이]] \n */
  function fmt(s) {
    return esc(s).replace(/\\n/g, '\n')
      .replace(/\*\*([^*]+)\*\*/g, '<em data-acc="em">$1</em>')
      .replace(/==([^=]+)==/g, '<mark class="hl" data-acc="hl">$1</mark>')
      .replace(/\{\{([^}]+)\}\}/g, '<span class="pl" data-acc="pl">$1</span>')
      .replace(/\^\^([^^]+)\^\^/g, '<s>$1</s>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="gl" tabindex="0" data-g="$1">$1</span>')
      .replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\*\*|\^\^|\[\[|\]\]|==|\{\{|\}\}/g, '').replace(/\\n|\n/g, ' '); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function noop() {}
  function vfmt(v) {
    var a = Math.abs(v);
    return Number(v).toLocaleString('ko-KR', { maximumFractionDigits: a >= 1000 ? 0 : 1 });
  }
  function item(it) { return typeof it === 'string' ? { head: it } : (it || {}); }

  function niceTicks(min, max, n) {
    var span = (max - min) || 1;
    var step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    var lo = Math.floor(min / step + 1e-9) * step, hi = Math.ceil(max / step - 1e-9) * step, t = [];
    for (var v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
    return { lo: lo, hi: hi, step: step, ticks: t };
  }
  function tickText(v, step) {
    return Number(v).toLocaleString('ko-KR', { maximumFractionDigits: step < 1 ? 2 : 0 });
  }


  /* 글자 폭 어림(차트 라벨 자리 잡기용): 한글 1em · 숫자 · 영문 0.58em · 기호 0.4em */
  function tw(s, px) {
    var w = 0, str = String(s == null ? '' : s), i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3131 && c <= 0x318e) || (c >= 0x4e00 && c <= 0x9fff)) w += 1;
      else if (c === 32 || c === 44 || c === 46 || c === 58 || c === 39) w += 0.36;
      else if (c < 128) w += 0.6;
      else w += 0.9;
    }
    return w * px * 1.04;
  }

  function fmtV2(v, unit) { return Number(v).toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + (unit ? ' ' + unit : ''); }

  /* 칸 안 글자가 넘치면 16px 까지 줄인다 */
  function fit(box) {
    var max = +box.getAttribute('data-fit') || 24, min = +box.getAttribute('data-min') || 16, fs = max;
    box.style.fontSize = fs + 'px';
    var wOnly = box.hasAttribute('data-fitw');
    while (fs > min && ((!wOnly && box.scrollHeight > box.clientHeight + 1) || box.scrollWidth > box.clientWidth + 1)) {
      fs -= 1;
      box.style.fontSize = fs + 'px';
    }
  }
  function fitAll(root) {
    var list = root.querySelectorAll('[data-fit]:not([data-shrink])');
    for (var i = 0; i < list.length; i++) fit(list[i]);
    balance(root);
    if (root._post) root._post.forEach(function (f) { f(); });
  }
  /* 도식 묶음을 본문 영역 가운데로: 줄어들 칸은 글 높이에 맞추고(같은 높이), 묶음 전체를 세로 중앙으로 옮긴다 */
  function balance(sl) {
    var cen = sl.querySelector('.cen');
    if (!cen) return;
    var H = cen.parentNode.clientHeight, sh = cen.querySelectorAll('.bx[data-shrink]'), i, mh = 0;
    cen.style.transform = '';
    for (i = 0; i < sh.length; i++) { sh[i].style.height = sh[i].getAttribute('data-h') + 'px'; fit(sh[i]); }
    for (i = 0; i < sh.length; i++) sh[i].style.height = 'auto';
    for (i = 0; i < sh.length; i++) mh = Math.max(mh, sh[i].offsetHeight);
    for (i = 0; i < sh.length; i++) sh[i].style.height = mh + 'px';
    var asub = cen.querySelector('.asub'), eq = cen.querySelector('.eq');
    if (asub && eq) { asub.style.bottom = 'auto'; asub.style.top = (eq.offsetTop + eq.offsetHeight + 40) + 'px'; }
    var minT = 1e9, maxB = -1e9;
    for (i = 0; i < cen.children.length; i++) {
      var c = cen.children[i], t, b;
      if (c.tagName.toLowerCase() === 'svg') { var bb = c.getBBox(); t = bb.y; b = bb.y + bb.height; }
      else { t = c.offsetTop; b = t + c.offsetHeight; }
      minT = Math.min(minT, t); maxB = Math.max(maxB, b);
    }
    var dy = Math.round((H - (maxB - minT)) / 2 - minT);
    if (Math.abs(dy) >= 2) cen.style.transform = 'translateY(' + dy + 'px)';
  }

  /* ---------- 말풍선(용어 · 차트 값 · 출처) ---------- */
  function showTip(html, x, y) {
    if (!tipEl) return;
    tipEl.innerHTML = html;
    tipEl.hidden = false;
    var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = clamp(x + 14, 8, window.innerWidth - w - 8) + 'px';
    tipEl.style.top = clamp(y - h - 12, 8, window.innerHeight - h - 8) + 'px';
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }
  function bindTip(node, htmlFn) {
    node.addEventListener('mouseenter', function (e) { showTip(htmlFn(), e.clientX, e.clientY); node.classList.add('hov'); });
    node.addEventListener('mousemove', function (e) { showTip(htmlFn(), e.clientX, e.clientY); });
    node.addEventListener('mouseleave', function () { hideTip(); node.classList.remove('hov'); });
    node.addEventListener('click', function (e) { e.stopPropagation(); showTip(htmlFn(), e.clientX, e.clientY); });
  }
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 1600);
  }

  /* ---------- 차트 ---------- */
  function colorFor(rules, l) {
    if (!rules) return 'acc';
    var c = 'data', c2 = '', mm = l.split(/[.\-]/).pop();
    Object.keys(rules).forEach(function (k) {
      if (k.charAt(0) === '*') { if (mm === k.replace(/^\*[.\-]?/, '')) c2 = rules[k]; }
      else if (k === l || l.indexOf(k) === 0) c = rules[k];
    });
    return c2 || c;
  }
  function priorLabel(l) {
    var m = /^(\d{4})(.*)$/.exec(l);
    return m ? (Number(m[1]) - 1) + m[2] : null;
  }
  function shortLabel(l) {
    var m = /^\d{2}(\d{2})\.(\d{2})$/.exec(l);
    return m ? m[1] + '.' + m[2] : l;
  }

  /* ---------- 차트 ---------- */
  var uidc = 0;

  function Chart(host, d, ctx) {
    var ch = d.chart || {}, type = ch.type || 'bar', self = this;
    var S = (ch.series || (ch.data ? [{ name: '', data: ch.data }] : [])).map(function (s) {
      return { name: s.name || '', fact: s.fact || '', pts: (s.data || []).map(function (p) { return { l: String(p[0]), v: +p[1] }; }) };
    });
    var ranges = ch.ranges || null;
    var range = ch.range != null ? ch.range : (ranges && ranges.length ? ranges[0] : 0);
    var yoy = false;
    var ctl = el('div', 'ctl'), plot = el('div', 'plot');
    var monthly = !!(S[0] && S[0].pts[0] && /^\d{4}\.\d{2}$/.test(S[0].pts[0].l));
    var rbtn = [], ybtn = null;
    if (ranges && ranges.length > 1 && (type === 'bar' || type === 'line')) {
      ranges.forEach(function (n) {
        var b = el('button', '', n === 0 ? '전체' : (monthly ? n + '개월' : '최근 ' + n));
        b.type = 'button';
        b.addEventListener('click', function () { range = n; sync(); self.render(); });
        ctl.appendChild(b);
        rbtn.push([b, n]);
      });
    }
    if (ch.yoy && type === 'bar') {
      ybtn = el('button', '', '전년 같은 달');
      ybtn.type = 'button';
      ybtn.addEventListener('click', function () { yoy = !yoy; sync(); self.render(); });
      ctl.appendChild(ybtn);
    }
    function sync() {
      rbtn.forEach(function (r) { r[0].setAttribute('aria-pressed', String(r[1] === range)); });
      if (ybtn) ybtn.setAttribute('aria-pressed', String(yoy));
    }
    sync();
    if (rbtn.length || ybtn) host.appendChild(ctl); else plot.className = 'plot nc';
    host.appendChild(plot);
    this.S = S;

    this.render = function () {
      plot.innerHTML = '';
      var W = plot.clientWidth, H = plot.clientHeight;
      if (!W || !H) return;
      var svg = sv('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': plain(d.title || '') });
      plot.appendChild(svg);
      var c = { svg: svg, W: W, H: H, S: S, range: range, yoy: yoy, unit: ch.unit || '', ch: ch, d: d, mk: 'm' + (++uidc), steps: [] };
      (DRAW[type] || drawBar)(c);
      ctx.setSteps(c.steps);
    };
    this.render();
  }

  function addStep(c, tracks) { c.steps.push(tracks.filter(Boolean)); }
  /* 격자 + 눈금 글 묶음 */
  function axG(c, ml, tk, Y, mr) {
    var svg = c.svg, g = sv('g', {}, svg);
    tk.ticks.forEach(function (t) {
      var y = Y(t);
      sv('line', { x1: ml, x2: c.W - (mr || 0), y1: y, y2: y, class: 'grid' }, g);
      svt(g, { x: ml - 10, y: y + 5, 'text-anchor': 'end', class: 'tk' }, tickText(t, tk.step));
    });
    if (c.unit) svt(g, { x: 0, y: 14, class: 'tk' }, c.unit);
    return g;
  }
  function pathD(list) {
    var d = '', open = false;
    list.forEach(function (p) {
      if (!p) { open = false; return; }
      d += (open ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
      open = true;
    });
    return d;
  }
  /* 선 그리기 track: dasharray 로 그린다 */
  function trDraw(path, ms, delay) {
    return mk(ms, 'std', function (p) {
      if (p >= 1) { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; }
      else { path.style.strokeDasharray = '1 1'; path.style.strokeDashoffset = String(1 - p); }
    }, delay);
  }
  /* 세로로 겹치지 않게 라벨 높이를 밀어 벌린다 */
  function nudge(ls, gap, lo, hi) {
    ls.sort(function (a, b) { return a.y - b.y; });
    var i;
    for (i = 0; i < ls.length; i++) ls[i].y = clamp(ls[i].y, lo, hi);
    for (i = 1; i < ls.length; i++) { if (ls[i].y < ls[i - 1].y + gap) ls[i].y = ls[i - 1].y + gap; }
    if (ls.length && ls[ls.length - 1].y > hi) ls[ls.length - 1].y = hi;
    for (i = ls.length - 2; i >= 0; i--) { if (ls[i].y > ls[i + 1].y - gap) ls[i].y = ls[i + 1].y - gap; }
  }

  function drawBar(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch;
    var ml = 62, mr = 14, mt = 30, mb = 40;
    var pts = c.S[0] ? c.S[0].pts : [];
    var vis = c.range > 0 && c.range < pts.length ? pts.slice(-c.range) : pts;
    var n = vis.length;
    if (!n) return;
    var notes = (ch.notes || ch.annotate || []).filter(function (a) { return vis.some(function (p) { return p.l === a.at; }); });
    var vals = vis.map(function (p) { return p.v; });
    var maxV = Math.max.apply(null, vals.concat(0)), minV = Math.min.apply(null, vals.concat(0));
    var span = (maxV - minV) || 1, iw = W - ml - mr, ih = H - mt - mb;
    var mx = maxV + span * 0.1, mn = minV < 0 ? minV - span * 0.1 : 0;
    var padTop = 34 + Math.min(2, notes.length) * 30, tk = niceTicks(mn, mx, 4), g, needTop, needBot;
    for (g = 0; g < 30; g++) {
      needTop = (tk.hi - maxV) / (tk.hi - tk.lo) * ih < padTop;
      needBot = minV < 0 && (minV - tk.lo) / (tk.hi - tk.lo) * ih < 30;
      if (!needTop && !needBot) break;
      if (needTop) mx += span * 0.06;
      if (needBot) mn -= span * 0.06;
      tk = niceTicks(mn, mx, 4);
    }
    var lo = tk.lo, hi = tk.hi;
    function Y(v) { return mt + (hi - v) / (hi - lo) * ih; }
    var ax = axG(c, ml, tk, Y, mr);
    var band = iw / n, bw = Math.min(band * 0.66, 64), y0 = Y(0);
    var byLabel = {};
    pts.forEach(function (p) { byLabel[p.l] = p.v; });
    var tipFn = function (i) {
      return function () {
        var p = vis[i];
        var h = '<b>' + esc(p.l) + '</b> · ' + vfmt(p.v) + ' ' + esc(c.unit);
        if (c.yoy) {
          var pv = byLabel[priorLabel(p.l)];
          if (pv != null) { var df = p.v - pv; h += '<br>전년 같은 달 ' + vfmt(pv) + ' → ' + (df >= 0 ? '▲ ' : '▼ ') + vfmt(Math.abs(df)); }
        }
        return h;
      };
    };
    var maxLab = 0;
    vis.forEach(function (p) { maxLab = Math.max(maxLab, tw(shortLabel(p.l), 16) + 14); });
    var stepX = Math.max(1, Math.ceil(maxLab / band));
    var noteAt = {};
    notes.forEach(function (a) { noteAt[a.at] = true; });
    var xg = sv('g', {}, svg), bars = [], vls = [], hasColor = false;
    vis.forEach(function (p, i) {
      var x = ml + i * band + (band - bw) / 2, yv = Y(p.v), col = ch.colorBy ? colorFor(ch.colorBy, p.l) : (i === n - 1 ? 'acc' : 'data');
      if (col === 'hot' && p.v >= 0) col = 'acc';   /* 주의색은 값이 음수일 때만 */
      if (col !== 'data') hasColor = true;
      var r = mark(sv('rect', { x: x, y: Math.min(y0, yv), width: bw, height: Math.max(1, Math.abs(y0 - yv)), rx: 4, class: 'g-bar f-' + col + (p.v < 0 ? ' neg' : '') }, svg));
      if (col === 'acc') r.setAttribute('data-acc', 'hero');
      r.setAttribute('data-i', i);
      bars.push({ r: r, p: p, col: col, h: Math.max(1, Math.abs(y0 - yv)) });
      if (n <= 14 || i === n - 1 || noteAt[p.l]) {
        vls.push(svt(svg, { x: x + bw / 2, y: p.v >= 0 ? yv - 8 : yv + 22, 'text-anchor': 'middle', class: 'vl' + (col === 'acc' ? ' hero' : '') }, vfmt(p.v)));
      }
      if ((i % stepX === 0 && n - 1 - i >= stepX) || i === n - 1) svt(xg, { x: x + bw / 2, y: H - 14, 'text-anchor': 'middle', class: 'tk' }, shortLabel(p.l));
    });
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    var yoyG = null;
    if (c.yoy) {
      yoyG = sv('g', {}, svg);
      vis.forEach(function (p, i) {
        var pv = byLabel[priorLabel(p.l)];
        if (pv == null) return;
        var x = ml + i * band + (band - bw) / 2;
        sv('line', { x1: x - 4, x2: x + bw + 4, y1: Y(pv), y2: Y(pv), class: 's-ink', 'stroke-width': 3, 'stroke-dasharray': '5 3' }, yoyG);
      });
    }
    /* 주석: 빈 곳(막대 위)에 글 · 끌선 */
    var rowsEnd = [[], []], ng = [];
    notes.forEach(function (a, k) {
      var idx = -1;
      vis.forEach(function (p, i) { if (p.l === a.at) idx = i; });
      var bcx = ml + (idx + 0.5) * band, topY = Math.min(Y(vis[idx].v), y0), w = tw(a.text, 18) + 4;
      var tx = clamp(bcx - w / 2, ml, W - mr - w);
      var ok0 = rowsEnd[0].every(function (e) { return tx > e.r + 16 || tx + w < e.l - 16; });
      var row = ok0 ? 0 : 1;
      rowsEnd[row].push({ l: tx, r: tx + w });
      var ty = mt + 22 + row * 28, gn = sv('g', {}, svg);
      svt(gn, { x: tx, y: ty, class: 'an' }, a.text);
      var lx = clamp(bcx, tx + 8, tx + w - 8), ex = bcx, ey = topY - 36;
      sv('line', { x1: lx, y1: ty + 9, x2: ex, y2: ey - 7, class: 's-mute', 'stroke-width': 2.5 }, gn);
      var ang = Math.atan2(ey - 7 - (ty + 9), ex - lx) * 180 / Math.PI;
      sv('polygon', { points: '0,-6 12,0 0,6', transform: 'translate(' + (ex - 12 * Math.cos(ang * Math.PI / 180)) + ',' + (ey - 7 - 12 * Math.sin(ang * Math.PI / 180)) + ') rotate(' + ang + ')', class: 'f-mute' }, gn);
      ng.push(gn);
    });
    vis.forEach(function (p, i) {
      var h = sv('rect', { x: ml + i * band, y: mt, width: band, height: ih, class: 'hit' }, svg);
      bindTip(h, tipFn(i));
      h.addEventListener('mouseenter', function () { var r = svg.querySelector('.g-bar[data-i="' + i + '"]'); if (r) r.classList.add('hov'); });
      h.addEventListener('mouseleave', function () { var r = svg.querySelector('.g-bar[data-i="' + i + '"]'); if (r) r.classList.remove('hov'); });
    });
    /* 단계: 축 → 막대 → 강조색 → 주석 하나씩 */
    addStep(c, [trFade(ax), trFade(xg), trFade(axis)]);
    var gs = stag(n), grow = [];
    bars.forEach(function (b, i) {
      grow.push(mk(T.scene, 'enter', function (p) {
        var hh = b.h * p;
        b.r.setAttribute('height', Math.max(0, hh));
        b.r.setAttribute('y', b.p.v >= 0 ? y0 - hh : y0);
      }, i * gs));
    });
    vls.forEach(function (t, i) { grow.push(trFade(t, (n - 1) * gs + 200)); });
    if (yoyG) grow.push(trFade(yoyG, (n - 1) * gs + 200));
    addStep(c, grow);
    if (hasColor) {
      addStep(c, bars.filter(function (b) { return b.col !== 'data'; }).map(function (b, i) {
        return mk(T.std, 'std', function (p) {
          if (p >= 1) b.r.style.fill = '';
          else b.r.style.fill = mixCss('--c-data', b.col === 'hot' ? '--c-hot' : '--c-acc', p, svg);
        }, i * 20);
      }).concat(bars.filter(function (b) { return b.col === 'data'; }).map(function () { return null; })));
      /* 처음(앞 단계 끝)에는 전부 옅은 회색 */
      c.steps[c.steps.length - 1].unshift(mk(1, 'std', function (p) {
        if (p < 1) bars.forEach(function (b) { if (b.col !== 'data') b.r.style.fill = 'var(--c-data)'; });
      }, 0));
    }
    ng.forEach(function (gn, k) {
      var t = [trEnter(gn, 0)];
      for (var q = 0; q < k; q++) t.push(trDim(ng[q], 0));
      addStep(c, t);
    });
  }

  /* 선 · 끝점 · 끝 이름표 → 그리는 선들 */
  function seriesTracks(c, lines, mt, mb) {
    var svg = c.svg, tracks = [], labels = [];
    lines.forEach(function (ln, si) {
      var last = null;
      ln.pts.forEach(function (p) { if (p) last = p; });
      if (!last) return;
      var path = mark(sv('path', { d: pathD(ln.pts), pathLength: 1, class: 'g-line ' + ln.stroke + (ln.hero ? ' hero' : '') }, svg));
      var dot = mark(sv('circle', { cx: last.x, cy: last.y, r: ln.hero ? 8 : 6, class: ln.fill }, svg));
      if (ln.acc) { path.setAttribute('data-acc', 'hero'); dot.setAttribute('data-acc', 'hero'); }
      tracks.push(trDraw(path, T.count, si * T.stagger * 2));
      tracks.push(trFade(dot, T.count + si * T.stagger));
      labels.push({ x: last.x + 14, y: last.y + 6, t: ln.name, cls: ln.tcls, acc: ln.acc });
    });
    nudge(labels, 24, mt + 10, c.H - mb - 4);
    labels.forEach(function (l, i) {
      var t = svt(svg, { x: l.x, y: l.y, class: 'en ' + l.cls }, l.t);
      if (l.acc) t.setAttribute('data-acc', 'hero');
      tracks.push(trFade(t, T.count + i * T.stagger));
    });
    return tracks;
  }

  function drawLine(c) {
    var svg = c.svg, W = c.W, H = c.H;
    var base = c.S[0] ? c.S[0].pts : [];
    var cats = base.map(function (p) { return p.l; });
    if (c.range > 0 && c.range < cats.length) cats = cats.slice(-c.range);
    var n = cats.length;
    if (!n) return;
    var maxName = 0;
    c.S.forEach(function (s) { maxName = Math.max(maxName, tw(s.name, 18)); });
    var ml = 62, mr = clamp(maxName + 34, 70, 240), mt = 30, mb = 40;
    var iw = W - ml - mr, ih = H - mt - mb;
    var all = [];
    c.S.forEach(function (s) { s.pts.forEach(function (p) { if (cats.indexOf(p.l) >= 0) all.push(p.v); }); });
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), sp = (mx - mn) || 1;
    var tk = niceTicks(mn >= 0 && mn < sp * 0.6 ? 0 : mn - sp * 0.05, mx + sp * 0.08, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    function X(i) { return n === 1 ? ml + iw / 2 : ml + i * iw / (n - 1); }
    var ax = axG(c, ml, tk, Y, mr), xg = sv('g', {}, svg);
    var stepX = Math.max(1, Math.ceil(64 / (iw / Math.max(1, n - 1))));
    cats.forEach(function (l, i) {
      if (i % stepX !== 0 && i !== n - 1) return;
      if (i !== n - 1 && n - 1 - i < stepX) return;
      svt(xg, { x: X(i), y: H - 14, 'text-anchor': 'middle', class: 'tk' }, shortLabel(l));
    });
    var lines = c.S.map(function (s, si) {
      var m = {};
      s.pts.forEach(function (p) { m[p.l] = p.v; });
      var k = 's' + (si % 4 + 1);
      return { name: s.name, stroke: 's-' + k, fill: 'f-' + k, tcls: 't-' + k, acc: si === 0, pts: cats.map(function (l, i) { return m[l] == null ? null : { x: X(i), y: Y(m[l]) }; }) };
    });
    var tr = seriesTracks(c, lines, mt, mb);
    hoverGuide(c, { ml: ml, mt: mt, iw: iw, ih: ih }, n, X, function (i) {
      var h = '<b>' + esc(cats[i]) + '</b>';
      c.S.forEach(function (s) {
        var p = s.pts.filter(function (q) { return q.l === cats[i]; })[0];
        if (p) h += '<br>' + esc(s.name) + ' ' + vfmt(p.v) + ' ' + esc(c.unit);
      });
      return h;
    });
    addStep(c, [trFade(ax), trFade(xg)]);
    addStep(c, tr);
  }

  function drawCum(c) {
    var svg = c.svg, W = c.W, H = c.H;
    var pts = c.S[0] ? c.S[0].pts : [], byYear = {};
    pts.forEach(function (p) {
      var y = p.l.slice(0, 4), m = parseInt(p.l.slice(5, 7), 10);
      if (!byYear[y]) byYear[y] = {};
      byYear[y][m] = p.v;
    });
    var years = Object.keys(byYear).sort().slice(-4);
    if (!years.length) return;
    var ml = 62, mr = 90, mt = 30, mb = 40, iw = W - ml - mr, ih = H - mt - mb, cum = {}, mx = 0;
    years.forEach(function (y) {
      var acc = 0; cum[y] = [];
      for (var m = 1; m <= 12; m++) {
        if (byYear[y][m] == null) break;
        acc += byYear[y][m]; cum[y].push(acc); mx = Math.max(mx, acc);
      }
    });
    var tk = niceTicks(0, mx * 1.06, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    function X(i) { return ml + i * iw / 11; }
    var ax = axG(c, ml, tk, Y, mr), xg = sv('g', {}, svg);
    for (var m = 0; m < 12; m++) svt(xg, { x: X(m), y: H - 14, 'text-anchor': 'middle', class: 'tk' }, (m + 1) + '월');
    var lines = [];
    years.forEach(function (y, k) {
      var rank = years.length - 1 - k;
      lines.push({
        name: y, hero: rank === 0, acc: rank === 0, stroke: rank === 0 ? 's-acc' : rank === 1 ? 's-data' : 's-line',
        fill: rank === 0 ? 'f-acc' : 'f-data', tcls: rank === 0 ? 't-acc' : 't-mute',
        pts: cum[y].map(function (v, i) { return { x: X(i), y: Y(v) }; })
      });
    });
    lines.reverse();
    var tr = seriesTracks(c, lines, mt, mb);
    hoverGuide(c, { ml: ml, mt: mt, iw: iw, ih: ih }, 12, X, function (i) {
      var h = '<b>' + (i + 1) + '월까지 누적</b>';
      years.slice().reverse().forEach(function (y) { if (cum[y][i] != null) h += '<br>' + y + ' ' + vfmt(cum[y][i]) + ' ' + esc(c.unit); });
      return h;
    });
    addStep(c, [trFade(ax), trFade(xg)]);
    addStep(c, tr);
  }

  function drawHbar(c) {
    var svg = c.svg, W = c.W, H = c.H, pts = c.S[0] ? c.S[0].pts : [], n = pts.length;
    if (!n) return;
    var vals = pts.map(function (p) { return p.v; });
    var mn = Math.min.apply(null, vals.concat(0)), mx = Math.max.apply(null, vals.concat(0)), signed = mn < 0;
    var maxL = 0;
    pts.forEach(function (p) { maxL = Math.max(maxL, tw(p.l, 20)); });
    var lw = clamp(maxL + 24, 110, 300), ml = lw + (signed ? 84 : 0), mr = 110, mt = 4, mb = 4;
    var iw = W - ml - mr, row = (H - mt - mb) / n, bh = Math.min(row * 0.62, 40);
    function X(v) { return ml + (v - mn) / ((mx - mn) || 1) * iw; }
    var x0 = X(0), labs = sv('g', {}, svg), grow = [], gs = stag(n), topI = 0;
    pts.forEach(function (p, i) { if (p.v > pts[topI].v) topI = i; });
    pts.forEach(function (p, i) {
      var cy = mt + row * (i + 0.5), x1 = X(p.v), cls;
      if (c.ch.colorBy) { cls = colorFor(c.ch.colorBy, p.l); if (cls === 'hot' && p.v >= 0) cls = 'acc'; }
      else cls = p.v < 0 ? 'hot' : (i === topI ? 'acc' : 'data');
      svt(labs, { x: lw - 10, y: cy + 7, 'text-anchor': 'end', class: 'hl' }, p.l);
      var w = Math.max(1, Math.abs(x1 - x0));
      var r = mark(sv('rect', { x: Math.min(x0, x1), y: cy - bh / 2, width: w, height: bh, rx: 2, class: 'g-hbar f-' + cls + (p.v < 0 ? ' neg' : '') }, svg));
      if (cls === 'acc') r.setAttribute('data-acc', 'hero');
      var vt = svt(svg, { x: p.v >= 0 ? x1 + 10 : x1 - 10, y: cy + 7, 'text-anchor': p.v >= 0 ? 'start' : 'end', class: 'hv ' + (p.v < 0 ? 't-neg' : 't-ink') }, (signed && p.v > 0 ? '+' : '') + vfmt(p.v));
      grow.push(mk(T.scene, 'enter', function (q) {
        var ww = w * q;
        r.setAttribute('width', Math.max(0, ww));
        r.setAttribute('x', p.v >= 0 ? x0 : x0 - ww);
      }, i * gs));
      grow.push(trFade(vt, (n - 1) * gs + 200));
      var hit = sv('rect', { x: 0, y: cy - row / 2, width: W, height: row, class: 'hit' }, svg);
      bindTip(hit, function () { return '<b>' + esc(p.l) + '</b> · ' + vfmt(p.v) + ' ' + esc(c.unit); });
      hit.addEventListener('mouseenter', function () { r.classList.add('hov'); });
      hit.addEventListener('mouseleave', function () { r.classList.remove('hov'); });
    });
    var axis = sv('line', { x1: x0, x2: x0, y1: 0, y2: H, class: 'axis' }, svg);
    if (!signed) axis.style.display = 'none';
    addStep(c, [trFade(labs), trFade(axis)]);
    addStep(c, grow);
  }
  function hoverGuide(c, geo, nCat, Xof, rowsFn) {
    var svg = c.svg, guide = sv('line', { y1: geo.mt, y2: geo.mt + geo.ih, class: 's-mute', 'stroke-width': 1.5, 'stroke-dasharray': '4 3', visibility: 'hidden' }, svg);
    var hit = sv('rect', { x: geo.ml, y: geo.mt, width: geo.iw, height: geo.ih, class: 'hit' }, svg);
    function at(e) {
      var r = svg.getBoundingClientRect(), sc = r.width / c.W || 1;
      var px = (e.clientX - r.left) / sc, i = 0, best = 1e9;
      for (var k = 0; k < nCat; k++) { var dd = Math.abs(Xof(k) - px); if (dd < best) { best = dd; i = k; } }
      guide.setAttribute('x1', Xof(i)); guide.setAttribute('x2', Xof(i)); guide.setAttribute('visibility', 'visible');
      showTip(rowsFn(i), e.clientX, e.clientY);
    }
    hit.addEventListener('mousemove', at);
    hit.addEventListener('click', at);
    hit.addEventListener('mouseleave', function () { guide.setAttribute('visibility', 'hidden'); hideTip(); });
  }


  /* ---------- 새 차트 종류(2판) ---------- */
  function lerp(a, b, p) { return a + (b - a) * p; }
  function fmtN(v, dec) { return Number(v).toLocaleString('ko-KR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
  function signed(v, dec) { return (v > 0 ? '+' : v < 0 ? '−' : '') + fmtN(Math.abs(v), dec); }
  function cumOf(s) {
    var acc = 0;
    return s.pts.slice().sort(function (a, b) { return a.l < b.l ? -1 : 1; }).map(function (p) { acc += p.v; return { m: parseInt(p.l.slice(5, 7), 10), v: acc }; });
  }

  /* race: 두 해의 누적선이 함께 달림 · 기준선 · 넘어선 점 */
  function drawRace(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, ser = c.S.slice(0, 2);
    if (ser.length < 2) return;
    var cum = ser.map(cumOf), ref = ch.ref || null, mxv = ref ? +ref.value : 0;
    cum.forEach(function (a) { a.forEach(function (p) { mxv = Math.max(mxv, p.v); }); });
    var endTxt = ser.map(function (s, i) { return s.name + ' ' + vfmt(cum[i][cum[i].length - 1].v); });
    var ml = 62, mt = 30, mb = 40, mr = clamp(Math.max(tw(endTxt[0], 18), tw(endTxt[1], 18)) + 34, 120, 280);
    var iw = W - ml - mr, ih = H - mt - mb, tk = niceTicks(0, mxv * 1.08, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    function X(m) { return ml + (m - 1) * iw / 11; }
    var ax = axG(c, ml, tk, Y, mr), xg = sv('g', {}, svg), m;
    for (m = 1; m <= 12; m++) svt(xg, { x: X(m), y: H - 14, 'text-anchor': 'middle', class: 'tk' }, m + '월');
    var items = cum.map(function (cm, i) {
      var pts = cm.map(function (p) { return { x: X(p.m), y: Y(p.v), m: p.m, v: p.v }; });
      var hot = i === 1;
      var path = mark(sv('path', { d: pathD(pts), pathLength: 1, class: 'g-line ' + (hot ? 'hero s-acc' : 's-data') }, svg));
      var dot = mark(sv('circle', { r: hot ? 8 : 6, class: hot ? 'f-acc' : 'f-mute' }, svg));
      var txt = svt(svg, { class: 'en ' + (hot ? 't-acc' : 't-mute') }, '');
      if (hot) { path.setAttribute('data-acc', 'hero'); dot.setAttribute('data-acc', 'hero'); txt.setAttribute('data-acc', 'hero'); }
      return { pts: pts, path: path, dot: dot, txt: txt, len: path.getTotalLength(), name: ser[i].name };
    });
    /* 끝 이름표 자리: 오른쪽이 다른 선과 겹치면 위 · 아래 · 왼쪽 위로 */
    function pickOffsets() {
      items.forEach(function (it, ii) {
        var q = it.pts[it.pts.length - 1], w = tw(it.name + ' ' + vfmt(q.v), 18) + 4;
        var cands = [[14, 6, 'start'], [0, -16, 'middle'], [0, 32, 'middle'], [-14, -14, 'end'], [-14, 30, 'end'], [14, -20, 'start'], [14, 34, 'start']];
        var pick = cands[0], best = 1e9;
        cands.forEach(function (c0) {
          var x0 = q.x + c0[0] - (c0[2] === 'middle' ? w / 2 : c0[2] === 'end' ? w : 0), x1 = x0 + w, y0 = q.y + c0[1] - 16, y1 = q.y + c0[1] + 4, hits = 0;
          items.forEach(function (o2, jj) {
            var lst = jj === ii ? o2.pts.slice(0, -1) : o2.pts;
            for (var k = 0; k < lst.length - 1; k++) {
              var a = lst[k], b = lst[k + 1], steps = Math.max(2, Math.ceil(Math.abs(b.x - a.x) / 4));
              for (var s2 = 0; s2 <= steps; s2++) { var px = a.x + (b.x - a.x) * s2 / steps, py = a.y + (b.y - a.y) * s2 / steps; if (px > x0 - 2 && px < x1 + 2 && py > y0 - 2 && py < y1 + 2) hits++; }
            }
          });
          if (x1 > W - 4 || x0 < 0 || y0 < 0 || y1 > H) hits += 1000;
          if (hits < best) { best = hits; pick = c0; }
        });
        it.off = pick;
      });
    }
    pickOffsets();
    function setHeads(p) {
      var ls = items.map(function (it) {
        var q = it.path.getPointAtLength(it.len * p);
        var xm = (q.x - ml) / (iw / 11) + 1, k = 0, val = 0, a, b;
        for (k = 0; k < it.pts.length - 1; k++) { if (xm <= it.pts[k + 1].m) break; }
        a = it.pts[k]; b = it.pts[Math.min(k + 1, it.pts.length - 1)];
        val = b.m === a.m ? b.v : lerp(a.v, b.v, clamp((xm - a.m) / (b.m - a.m), 0, 1));
        if (p >= 1) { q = it.pts[it.pts.length - 1]; val = q.v; }
        it.dot.setAttribute('cx', q.x); it.dot.setAttribute('cy', q.y);
        it.dot.style.opacity = p <= 0 ? '0' : '';
        return { it: it, x: q.x + it.off[0], y: q.y + it.off[1], t: it.name + ' ' + vfmt(val) };
      });
      if (items[0].off[0] === 14 && items[1].off[0] === 14) nudge(ls, 24, mt + 10, H - mb - 4);
      ls.forEach(function (l) {
        l.it.txt.setAttribute('x', l.x); l.it.txt.setAttribute('y', l.y); l.it.txt.setAttribute('text-anchor', l.it.off[2]);
        l.it.txt.textContent = l.t;
        l.it.txt.style.opacity = p <= 0.02 ? '0' : '';
      });
    }
    var tr = [mk(T.count, 'std', function (p) {
      items.forEach(function (it) {
        if (p >= 1) { it.path.style.strokeDasharray = ''; it.path.style.strokeDashoffset = ''; }
        else { it.path.style.strokeDasharray = '1 1'; it.path.style.strokeDashoffset = String(1 - p); }
      });
      setHeads(p);
    }, 0)];
    addStep(c, [trFade(ax), trFade(xg)]);
    addStep(c, tr);
    if (ref) {
      var rg = sv('g', {}, svg), ry = Y(+ref.value);
      sv('line', { x1: ml, x2: W - mr, y1: ry, y2: ry, class: 's-ink', 'stroke-width': 2, 'stroke-dasharray': '7 5' }, rg);
      svt(rg, { x: ml + 10, y: ry - 10, class: 'an2' }, (ref.name || '기준') + ' ' + vfmt(+ref.value));
      addStep(c, [trFade(rg)]);
      /* 넘어선 점 */
      var hotC = cum[1], cross = null;
      hotC.forEach(function (p) { if (!cross && p.v > +ref.value) cross = p; });
      if (ch.mark && cross) {
        var mg = sv('g', {}, svg), dx = X(cross.m), dy = Y(cross.v);
        mark(sv('circle', { cx: dx, cy: dy, r: 10, class: 'f-ink' }, mg));
        var mtx = (ch.mark && ch.mark.text) || (cross.m + '월에 넘어섬'), w = tw(mtx, 18) + 4, ty = ry - 38;
        var ancEnd = dx - 18 - w >= ml;
        svt(mg, { x: ancEnd ? dx - 18 : dx + 18, y: ty, 'text-anchor': ancEnd ? 'end' : 'start', class: 'an' }, mtx);
        sv('line', { x1: ancEnd ? dx - 14 : dx + 14, y1: ty - 5, x2: dx - (ancEnd ? 7 : -7), y2: dy - 7, class: 's-ink', 'stroke-width': 2.5 }, mg);
        addStep(c, [trEnter(mg, 0)]);
      }
    }
  }

  /* zoom: 전체 → 틀 → 가로만 좁힘(세로는 0부터 고정) + 작은 전체 그림 */
  function drawZoom(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, s = c.S[0];
    if (!s || s.pts.length < 3) return;
    var pts = s.pts, n = pts.length, z = ch.zoom || {}, ia = -1, ib = -1;
    pts.forEach(function (p, i) { if (p.l === z.from) ia = i; if (p.l === z.to) ib = i; });
    if (ia < 0) ia = Math.max(0, n - 12);
    if (ib < 0) ib = n - 1;
    var ml = 62, mr = 24, mt = 30, mb = 40, iw = W - ml - mr, ih = H - mt - mb;
    var mx = Math.max.apply(null, pts.map(function (p) { return p.v; })), mnz = Math.min.apply(null, pts.map(function (p) { return p.v; }));
    var tk = niceTicks(mnz < 0 ? mnz - (mx - mnz) * 0.12 : 0, Math.max(mx, 0) + (mx - Math.min(mnz, 0)) * 0.18, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    var ax = axG(c, ml, tk, Y, mr), cid = c.mk + 'z', defs = sv('defs', {}, svg);
    sv('rect', { x: ml - 2, y: mt - 6, width: iw + 4, height: ih + 8 }, sv('clipPath', { id: cid }, defs));
    var path = mark(sv('path', { class: 'g-line hero s-acc', 'data-acc': 'hero', 'clip-path': 'url(#' + cid + ')', pathLength: 1, 'data-nocheck': '1', 'data-clip': [ml - 2, mt - 6, iw + 4, ih + 8].join(',') }, svg));
    var xls = pts.map(function (p) { return svt(svg, { 'text-anchor': 'middle', y: H - 14, class: 'tk' }, shortLabel(p.l)); });
    var endLab = svt(svg, { 'text-anchor': 'end', class: 'vl2' }, parseInt(pts[ib].l.slice(5), 10) + '월 ' + vfmt(pts[ib].v));
    var fx0 = ml + ia / (n - 1) * iw, fx1 = ml + ib / (n - 1) * iw;
    var frame = sv('rect', { y: mt, height: ih, rx: 4, class: 'zframe' }, svg);
    var inset = sv('g', { transform: 'translate(' + (ml + 18) + ',' + (mt + 10) + ')' }, svg), iwm = 190, ihm = 58;
    sv('rect', { width: iwm, height: ihm, rx: 5, class: 'zin' }, inset);
    var mini = mark(sv('path', { class: 'nofill s-mute', 'stroke-width': 2.5, d: pathD(pts.map(function (p, i) { return { x: 8 + i / (n - 1) * (iwm - 16), y: 6 + (1 - (p.v - mnz) / ((mx - mnz) || 1)) * (ihm - 12) }; })) }, inset));
    mini.setAttribute('data-mark', '1');
    sv('rect', { x: 8 + ia / (n - 1) * (iwm - 16), y: 3, width: (ib - ia) / (n - 1) * (iwm - 16), height: ihm - 6, rx: 3, class: 'zframe2' }, inset);
    /* 끝 값 글자 자리: 끝 점 위가 선과 겹치면 아래로 */
    var endOff = -16;
    (function () {
      var kk = iw / (ib - ia), w = tw(parseInt(pts[ib].l.slice(5), 10) + '월 ' + vfmt(pts[ib].v), 20) + 4, ex = ml + (ib - ia) * kk, ey = Y(pts[ib].v);
      [-16, 32].forEach(function (off, oi) {
        if (oi && endOff !== -16) return;
        var x0 = Math.min(ex, W - mr) - w, x1 = Math.min(ex, W - mr), y0 = ey + off - 20, y1 = ey + off + 4, hit = false;
        for (var q = 0; q < n - 1 && !hit; q++) {
          var ax = ml + (q - ia) * kk, bx2 = ml + (q + 1 - ia) * kk, ay = Y(pts[q].v), by = Y(pts[q + 1].v), st = Math.max(2, Math.ceil(Math.abs(bx2 - ax) / 4));
          for (var s = 0; s <= st; s++) { var px = ax + (bx2 - ax) * s / st, py = ay + (by - ay) * s / st; if (px > x0 - 2 && px < x1 + 2 && py > y0 - 2 && py < y1 + 2) { hit = true; break; } }
        }
        if (hit && oi === 0) endOff = 32;
      });
    })();
    function setView(a, b) {
      var k = iw / (b - a), pp = pts.map(function (p, i) { return { x: ml + (i - a) * k, y: Y(p.v) }; });
      path.setAttribute('d', pathD(pp));
      var stepX = Math.max(1, Math.ceil((tw('00.00', 16) + 26) / k)), e = Math.round(b);
      xls.forEach(function (t, i) {
        var x = ml + (i - a) * k, show = ((e - i) % stepX === 0) && x >= ml - 2 && x <= W - mr + 2;
        t.setAttribute('x', x); t.style.display = show ? '' : 'none';
      });
      endLab.setAttribute('x', Math.min(W - mr, ml + (ib - a) * k));
      endLab.setAttribute('y', Y(pts[ib].v) + endOff);
    }
    setView(0, n - 1);
    addStep(c, [trFade(ax), mk(T.count, 'std', function (p) {
      setView(0, n - 1);
      if (p >= 1) { path.style.strokeDasharray = ''; path.style.strokeDashoffset = ''; }
      else { path.style.strokeDasharray = '1 1'; path.style.strokeDashoffset = String(1 - p); }
    }, 0)]);
    addStep(c, [mk(T.std, 'enter', function (p) {
      frame.setAttribute('x', fx0); frame.setAttribute('width', fx1 - fx0); frame.style.opacity = String(p);
    }, 0)]);
    addStep(c, [mk(T.scene, 'std', function (p) {
      setView(lerp(0, ia, p), lerp(n - 1, ib, p));
      frame.setAttribute('x', lerp(fx0, ml, p)); frame.setAttribute('width', lerp(fx1 - fx0, iw, p));
      frame.style.opacity = String(p >= 1 ? 0 : 1 - p * 0.9);
      endLab.style.opacity = p >= 1 ? '' : '0';
      inset.style.opacity = p >= 1 ? '' : '0';
    }, 0)]);
  }

  /* wipe: 같은 칸 두 계열 — 세로 선이 지나가며 b 가 나타남 */
  function drawWipe(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch;
    function norm(a) { return (a && a.data ? a.data : a || []).map(function (x) { return Array.isArray(x) ? +x[1] : +x; }); }
    var A = norm(ch.a), B = norm(ch.b), labs = ch.labels || [], n = Math.min(A.length, B.length), dec = ch.decimals || 0;
    var names = ch.names || [(ch.a && ch.a.name) || '', (ch.b && ch.b.name) || ''];
    if (!n) return;
    var ml = 62, mr = 14, mt = 40, mb = 40, iw = W - ml - mr, ih = H - mt - mb;
    var allv = A.slice(0, n).concat(B.slice(0, n)), mxv = Math.max.apply(null, allv.concat(0)), mnv = Math.min.apply(null, allv.concat(0));
    var tk = niceTicks(mnv < 0 ? mnv - (mxv - mnv) * 0.14 : 0, mxv + (mxv - mnv) * 0.12, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    function put(r, h, p) { var hh = Math.abs(h) * p; r.setAttribute('height', Math.max(0, hh)); r.setAttribute('y', h >= 0 ? y0 - hh : y0); }
    var band = iw / n, bw = Math.min(band * 0.4, 56), y0 = Y(0), both = bw >= 44;
    var ax = axG(c, ml, tk, Y, mr), xg = sv('g', {}, svg), aT = [], bT = [], bRect = [], tA = [], tB = [];
    var lg = sv('g', {}, svg), lgA = sv('g', {}, lg), lgB = sv('g', {}, lg), lx = W - mr - (24 + tw(names[0], 18) + 34 + 24 + tw(names[1], 18));
    sv('rect', { x: lx, y: 5, width: 16, height: 16, rx: 3, class: 'f-data' }, lgA);
    svt(lgA, { x: lx + 24, y: 20, class: 'tk2' }, names[0]);
    var lx2 = lx + 24 + tw(names[0], 18) + 34;
    sv('rect', { x: lx2, y: 5, width: 16, height: 16, rx: 3, class: 'f-acc', 'data-acc': 'hero' }, lgB);
    svt(lgB, { x: lx2 + 24, y: 20, class: 'tk2' }, names[1]);
    var i, gs = stag(n);
    for (i = 0; i < n; i++) {
      var xa = ml + i * band + band / 2 - bw - 2, xb = xa + bw + 4;
      svt(xg, { x: ml + i * band + band / 2, y: H - 14, 'text-anchor': 'middle', class: 'tk' }, labs[i] != null ? labs[i] : String(i + 1));
      aT.push({ r: mark(sv('rect', { x: xa, width: bw, rx: 2, class: 'g-bar f-data' }, svg)), h: y0 - Y(A[i]) });
      bT.push({ r: mark(sv('rect', { x: xb, width: bw, rx: 2, class: 'g-bar f-acc', 'data-acc': 'hero' }, svg)), h: y0 - Y(B[i]), cx: xb + bw / 2 });
      if (both) tA.push(svt(svg, { x: xa + bw / 2, y: A[i] >= 0 ? Y(A[i]) - 8 : Y(A[i]) + 22, 'text-anchor': 'middle', class: 'vl' }, fmtN(A[i], dec)));
      tB.push(svt(svg, { x: xb + bw / 2, y: B[i] >= 0 ? Y(B[i]) - 8 : Y(B[i]) + 22, 'text-anchor': 'middle', class: 'vl' }, fmtN(B[i], dec)));
    }
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    var wl = sv('line', { y1: mt - 8, y2: y0 + 4, class: 's-ink', 'stroke-width': 3 }, svg);
    function setB(wx) {
      bT.forEach(function (b, k) {
        var q = clamp((wx - b.cx + 30) / 60, 0, 1);
        put(b.r, b.h, q);
        tB[k].style.opacity = q >= 0.98 ? '' : '0';
      });
    }
    addStep(c, [trFade(ax), trFade(xg), trFade(axis), trFade(lgA)].concat(aT.map(function (a, k) {
      return mk(T.scene, 'enter', function (p) { put(a.r, a.h, p); }, k * gs);
    })).concat(tA.map(function (t) { return trFade(t, (n - 1) * gs + 200); })));
    addStep(c, [trFade(lgB), mk(T.count, 'std', function (p) {
      var wx = ml + p * iw;
      wl.setAttribute('x1', wx); wl.setAttribute('x2', wx);
      wl.style.opacity = p <= 0 ? '0' : (p > 0.94 ? String(Math.max(0, (1 - p) / 0.06)) : '1');
      setB(p >= 1 ? W : wx);
    }, 0)]);
  }

  /* slope: 왼쪽 점 → 선 → 오른쪽 값 · 배수 */
  function drawSlope(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, pairs = ch.pairs || [], heads = ch.heads || ['', ''], n = pairs.length;
    if (!n) return;
    var mt = 52, mb = 16, ih = H - mt - mb, x1 = W * 0.34, x2 = W * 0.66, dec = ch.decimals != null ? ch.decimals : 1;
    var all = [];
    pairs.forEach(function (q) { all.push(+q.a, +q.b); });
    var mxv = Math.max.apply(null, all), mnv = Math.min.apply(null, all), lo = mnv > 0 ? mnv * 0.5 : mnv * 1.1;
    function Y(v) { return mt + (mxv - v) / ((mxv - lo) || 1) * ih; }
    var hg = sv('g', {}, svg);
    svt(hg, { x: x1, y: 24, 'text-anchor': 'middle', class: 'hl' }, heads[0]);
    svt(hg, { x: x2, y: 24, 'text-anchor': 'middle', class: 'hl' }, heads[1]);
    var L = pairs.map(function (q) { return { y: Y(+q.a), t: q.label + '  ' + fmtN(+q.a, dec) }; });
    var R = pairs.map(function (q) { return { y: Y(+q.b), t: fmtN(+q.b, dec) + (+q.a > 0 ? '  ×' + (+q.b / +q.a).toFixed(1) : '') }; });
    var Ln = L.map(function (o, i) { o.i = i; return o; }), Rn = R.map(function (o, i) { o.i = i; return o; });
    Ln.forEach(function (o) { o.y0 = o.y; }); Rn.forEach(function (o) { o.y0 = o.y; });
    nudge(Ln, 26, mt, H - mb); nudge(Rn, 26, mt, H - mb);
    var lead = [];
    Ln.forEach(function (o) { if (Math.abs(o.y - o.y0) > 5) lead.push(sv('line', { x1: x1 - 10, y1: o.y0, x2: x1 - 16, y2: o.y, class: 's-mute', 'stroke-width': 1.5 }, svg)); });
    Rn.forEach(function (o) { if (Math.abs(o.y - o.y0) > 5) lead.push(sv('line', { x1: x2 + 10, y1: o.y0, x2: x2 + 16, y2: o.y, class: 's-mute', 'stroke-width': 1.5 }, svg)); });
    var dl = [], ln = [], dr = [], tl = [], trr = [];
    pairs.forEach(function (q, i) {
      var ya = Y(+q.a), yb = Y(+q.b);
      dl.push(mark(sv('circle', { cx: x1, cy: ya, r: 8, class: 'f-mute' }, svg)));
      ln.push(mark(sv('line', { x1: x1, y1: ya, x2: x2, y2: yb, class: 's-acc', 'data-acc': 'hero', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg)));
      dr.push(mark(sv('circle', { cx: x2, cy: yb, r: 8, class: 'f-acc', 'data-acc': 'hero' }, svg)));
    });
    Ln.forEach(function (o) { tl[o.i] = svt(svg, { x: x1 - 18, y: o.y + 7, 'text-anchor': 'end', class: 'hl' }, o.t); });
    Rn.forEach(function (o) { trr[o.i] = svt(svg, { x: x2 + 18, y: o.y + 7, 'text-anchor': 'start', class: 'hl t-acc', 'data-acc': 'hero' }, o.t); });
    var g = stag(n);
    addStep(c, [trFade(hg)].concat(lead.map(function (l) { return trFade(l, 100); })).concat(dl.map(function (d, i) { return trFade(d, i * g); })).concat(tl.map(function (t, i) { return trFade(t, i * g + 100); })));
    addStep(c, ln.map(function (l, i) {
      var x2f = +l.getAttribute('x2'), y2f = +l.getAttribute('y2'), xs = +l.getAttribute('x1'), ys = +l.getAttribute('y1');
      return mk(T.scene, 'std', function (p) { l.setAttribute('x2', lerp(xs, x2f, p)); l.setAttribute('y2', lerp(ys, y2f, p)); }, i * g);
    }));
    addStep(c, dr.map(function (d, i) { return trFade(d, i * g); }).concat(trr.map(function (t, i) { return trFade(t, i * g + 100); })));
  }

  /* rank: 차례대로 → 큰 순서로 자리만 옮김 → 1~3위 색 */
  function drawRank(c) {
    var svg = c.svg, W = c.W, H = c.H, pts = c.S[0] ? c.S[0].pts : [], n = pts.length;
    if (!n) return;
    var maxL = 0, mxv = 0;
    pts.forEach(function (p) { maxL = Math.max(maxL, tw(p.l, 20)); mxv = Math.max(mxv, Math.abs(p.v)); });
    var ml = clamp(maxL + 28, 90, 300), mr = 120, mt = 4, mb = 4, iw = W - ml - mr, row = (H - mt - mb) / n, bh = Math.min(row * 0.6, 38);
    var order = pts.map(function (p, i) { return i; }).sort(function (a, b) { return pts[b].v - pts[a].v; });
    var rankOf = {};
    order.forEach(function (i, r) { rankOf[i] = r; });
    var rows = pts.map(function (p, i) {
      var g = sv('g', {}, svg), w = Math.max(2, Math.abs(p.v) / mxv * iw), top = rankOf[i] === 0;
      svt(g, { x: ml - 14, y: row / 2 + 7, 'text-anchor': 'end', class: 'hl' }, p.l);
      var r = mark(sv('rect', { x: ml, y: row / 2 - bh / 2, width: w, height: bh, rx: 2, class: top ? 'f-acc' : 'f-data' }, g));
      if (top) r.setAttribute('data-acc', 'hero');
      svt(g, { x: ml + w + 12, y: row / 2 + 7, class: 'hv ' + (top ? 't-ink' : 't-mute') }, vfmt(p.v));
      return { g: g, r: r, top: top, y0: mt + row * i, y1: mt + row * rankOf[i] };
    });
    function place(r, y) { r.g.setAttribute('transform', 'translate(0,' + y.toFixed(1) + ')'); }
    var g = stag(n);
    addStep(c, rows.map(function (r, i) { return mk(T.std, 'enter', function (p) { r.g.style.opacity = p >= 1 ? '' : String(p); }, i * g); }));
    addStep(c, rows.map(function (r, i) { return mk(T.scene, 'std', function (p) { place(r, lerp(r.y0, r.y1, p)); }, 0); }));
    var col = rows.filter(function (r) { return r.top; }).map(function (r, i) {
      return mk(T.std, 'std', function (p) { r.r.style.fill = p >= 1 ? '' : mixCss('--c-data', '--c-acc', p, svg); }, i * T.stagger);
    });
    addStep(c, col);
  }

  /* morph: 월 → 묶음(색 → 모으기 → 쌓기 → 끝 값). 세로 척도는 처음부터 끝 값에 맞춰 고정 */
  function drawMorph(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, pts = c.S[0] ? c.S[0].pts : [], n = pts.length;
    if (!n) return;
    var gsz = ch.group || 3, ng = Math.ceil(n / gsz), dec = ch.decimals || 0;
    var ml = 62, mr = 14, mt = 34, mb = 40, iw = W - ml - mr, ih = H - mt - mb;
    var tot = [], g, i;
    for (g = 0; g < ng; g++) tot.push(0);
    pts.forEach(function (p, k) { tot[Math.floor(k / gsz)] += p.v; });
    var tk = niceTicks(0, Math.max.apply(null, tot) * 1.14, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    var ax = axG(c, ml, tk, Y, mr), y0 = Y(0), band = iw / n, bw = Math.min(band * 0.62, 56), gband = iw / ng, cw = Math.min(gband * 0.5, 170), gap = 6;
    var gw = gsz * bw + (gsz - 1) * gap, before = [], xm = sv('g', {}, svg), xgp = sv('g', {}, svg), vls = sv('g', {}, svg), tls = [];
    for (g = 0; g < ng; g++) before.push(0);
    var bars = pts.map(function (p, k) {
      var gi = Math.floor(k / gsz), j = k % gsz, gc = ml + (gi + 0.5) * gband, b0 = before[gi];
      before[gi] += p.v;
      var good = gi === ng - 1 ? 'acc' : ((ng - 1 - gi) % 2 === 1 ? 's3' : 's4');
      var r = mark(sv('rect', { rx: 2, class: 'g-bar f-' + good, 'stroke-width': 2, stroke: 'var(--c-card)' }, svg));
      if (good === 'acc') r.setAttribute('data-acc', 'hero');
      var o = {
        r: r, good: good,
        L0: { x: ml + k * band + (band - bw) / 2, y: Y(p.v), w: bw, h: y0 - Y(p.v) },
        L1: { x: gc - gw / 2 + j * (bw + gap), y: Y(p.v), w: bw, h: y0 - Y(p.v) },
        L2: { x: gc - cw / 2, y: Y(b0 + p.v), w: cw, h: Y(b0) - Y(b0 + p.v) }
      };
      svt(xm, { x: o.L0.x + bw / 2, y: H - 14, 'text-anchor': 'middle', class: 'tk' }, shortLabel(p.l));
      svt(vls, { x: o.L0.x + bw / 2, y: o.L0.y - 8, 'text-anchor': 'middle', class: 'vl' }, fmtN(p.v, dec));
      return o;
    });
    for (g = 0; g < ng; g++) {
      var a = pts[g * gsz], b = pts[Math.min(n - 1, g * gsz + gsz - 1)];
      svt(xgp, { x: ml + (g + 0.5) * gband, y: H - 14, 'text-anchor': 'middle', class: 'tk' }, parseInt(a.l.slice(5), 10) + '~' + parseInt(b.l.slice(5), 10) + '월');
      tls.push(svt(svg, { x: ml + (g + 0.5) * gband, y: Y(tot[g]) - 12, 'text-anchor': 'middle', class: 'vl2' }, fmtN(tot[g], dec)));
    }
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    function put(o, L) { o.r.setAttribute('x', L.x); o.r.setAttribute('y', L.y); o.r.setAttribute('width', L.w); o.r.setAttribute('height', Math.max(0, L.h)); }
    function mixL(A, B, p) { return { x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), w: lerp(A.w, B.w, p), h: lerp(A.h, B.h, p) }; }
    bars.forEach(function (o) { put(o, o.L2); });
    addStep(c, bars.map(function (o, k) {
      return mk(T.std, 'std', function (p) { o.r.style.fill = p >= 1 ? '' : mixCss('--c-data', o.good === 'acc' ? '--c-acc' : o.good === 's3' ? '--c-s3' : '--c-s4', p, svg); }, k * 20);
    }));
    addStep(c, bars.map(function (o) { return mk(T.scene, 'std', function (p) { put(o, mixL(o.L0, o.L1, p)); }, 0); })
      .concat([mk(T.std, 'exit', function (p) { xm.style.opacity = p >= 1 ? '0' : String(1 - p); vls.style.opacity = p >= 1 ? '0' : String(1 - p); }, 0), trFade(xgp, T.std)]));
    addStep(c, bars.map(function (o) { return mk(T.scene, 'std', function (p) { put(o, mixL(o.L1, o.L2, p)); }, 0); }));
    addStep(c, tls.map(function (t, k) { return trFade(t, k * T.stagger); }));
  }

  /* split: 합계 막대 → 색 나눔 → 갈라져 제자리(음수는 0선 아래) → 주인공만 */
  function drawSplit(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, total = ch.total || {}, parts = ch.parts || [], m = parts.length, dec = ch.decimals != null ? ch.decimals : 1;
    if (!m) return;
    var P = 0, Nn = 0, hero = 0, hv = -1;
    parts.forEach(function (q, i) { if (q.value >= 0) P += q.value; else Nn += -q.value; if (Math.abs(q.value) > hv) { hv = Math.abs(q.value); hero = i; } });
    if (ch.hero != null) hero = ch.hero;
    var ml = 62, mr = 14, mt = 34, mb = 46, iw = W - ml - mr, ih = H - mt - mb;
    var top = P * 1.14, bot = Nn > 0 ? -(Nn + P * 0.14) : -P * 0.02, tk = niceTicks(bot, top, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    var ax = axG(c, ml, tk, Y, mr), y0 = Y(0), cx = ml + iw * 0.4, colW = Math.min(150, iw * 0.2), tv = +total.value;
    var pal = ['f-s2', 'f-s3', 'f-s4'], npal = ['f-hot', 'f-hot', 'f-mute'], pi = 0, ni = 0;
    var totR = mark(sv('rect', { x: cx - colW / 2, y: Y(tv), width: colW, height: y0 - Y(tv), rx: 2, class: 'f-ink' }, svg));
    var totT = svt(svg, { x: cx, y: Y(tv) - 12, 'text-anchor': 'middle', class: 'vl2' }, (total.label || '합계') + ' ' + fmtN(tv, dec));
    var up = 0, dn = 0, segs = [], mm = parts.length;
    parts.forEach(function (q, i) {
      var cls = i === hero ? 'f-acc' : (q.value >= 0 ? pal[pi++ % pal.length] : npal[ni++ % npal.length]), v = q.value, S1, S2;
      if (v >= 0) { S1 = { x: cx - colW / 2, y: Y(up + v), w: colW, h: Y(up) - Y(up + v) }; up += v; }
      else { S1 = { x: cx - colW / 2, y: Y(dn), w: colW, h: Y(dn + v) - Y(dn) }; dn += v; }
      var wcol = Math.min(iw / mm * 0.5, 150), cxi = ml + (i + 0.5) * iw / mm;
      S2 = { x: cxi - wcol / 2, w: wcol, y: v >= 0 ? Y(v) : y0, h: Math.abs(Y(v) - y0) };
      var r = mark(sv('rect', { rx: 2, class: 'g-bar ' + cls }, svg));
      if (i === hero) r.setAttribute('data-acc', 'hero');
      segs.push({ r: r, S1: S1, S2: S2, q: q, cxi: cxi, cls: cls });
    });
    function put(o, L) { o.r.setAttribute('x', L.x); o.r.setAttribute('y', L.y); o.r.setAttribute('width', L.w); o.r.setAttribute('height', Math.max(0, L.h)); }
    function mixL(A, B, p) { return { x: lerp(A.x, B.x, p), y: lerp(A.y, B.y, p), w: lerp(A.w, B.w, p), h: lerp(A.h, B.h, p) }; }
    /* 쌓은 모습 옆 이름표 */
    var sl = segs.map(function (o) { return { o: o, y: o.S1.y + o.S1.h / 2 + 7 }; });
    nudge(sl, 24, mt + 10, H - mb - 4);
    var stackLab = sv('g', {}, svg);
    sl.forEach(function (l) { svt(stackLab, { x: cx + colW / 2 + 14, y: l.y, class: 'hl' }, l.o.q.label + ' ' + signed(l.o.q.value, dec)); });
    var netG = sv('g', {}, svg);
    sv('line', { x1: cx - colW / 2 - 8, x2: cx + colW / 2 + 8, y1: Y(tv), y2: Y(tv), class: 's-ink', 'stroke-width': 3, 'stroke-dasharray': '6 4' }, netG);
    svt(netG, { x: cx - colW / 2 - 16, y: Y(tv) + 6, 'text-anchor': 'end', class: 'hl' }, (total.label || '합계') + ' ' + fmtN(tv, dec));
    /* 제자리 이름 · 값 */
    var fin = sv('g', {}, svg), finT = [];
    segs.forEach(function (o, i) {
      var v = o.q.value;
      var nm = svt(fin, { x: o.cxi, y: H - 14, 'text-anchor': 'middle', class: 'tk2' }, o.q.label);
      var vl = svt(fin, { x: o.cxi, y: v >= 0 ? Y(v) - 10 : y0 + o.S2.h + 24, 'text-anchor': 'middle', class: 'vl2' }, signed(v, dec));
      if (i === hero) vl.setAttribute('data-acc', 'hero');
      finT.push({ nm: nm, vl: vl, hero: i === hero });
    });
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    segs.forEach(function (o) { put(o, o.S2); });
    addStep(c, [trFade(ax), trFade(totR), trFade(totT), trFade(axis)]);
    addStep(c, [mk(T.scene, 'std', function (p) {
      totR.style.opacity = String(1 - p); totT.style.opacity = String(1 - p);
      segs.forEach(function (o) { o.r.style.opacity = p >= 1 ? '' : String(p); put(o, o.S1); });
      stackLab.style.opacity = p >= 1 ? '' : String(p); netG.style.opacity = p >= 1 ? '' : String(p);
    }, 0)]);
    addStep(c, [mk(T.scene, 'std', function (p) { segs.forEach(function (o) { put(o, mixL(o.S1, o.S2, p)); }); }, 0),
      mk(T.std, 'exit', function (p) { stackLab.style.opacity = String(1 - p); netG.style.opacity = String(1 - p); }, 0),
      trFade(fin, T.std)]);
    var dim = [];
    segs.forEach(function (o, i) { if (i !== hero) dim.push(mk(T.std, 'std', function (p) { o.r.style.opacity = String(1 - 0.75 * p); finT[i].vl.style.opacity = String(1 - 0.55 * p); finT[i].nm.style.opacity = String(1 - 0.55 * p); }, 0)); });
    addStep(c, dim);
  }

  /* bridge: 출발 → 몫 하나씩 → 도착 */
  function drawBridge(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, s = ch.start || {}, st = ch.steps || [], e = ch.end || {}, dec = ch.decimals != null ? ch.decimals : 1;
    var cols = [{ label: s.label, kind: 'edge', v: +s.value, from: 0, to: +s.value }], lvl = +s.value, mxv = lvl, mnv = 0;
    st.forEach(function (q) { var nl = lvl + q.value; cols.push({ label: q.label, kind: 'step', v: q.value, from: lvl, to: nl }); lvl = nl; mxv = Math.max(mxv, lvl); mnv = Math.min(mnv, lvl); });
    cols.push({ label: e.label, kind: 'edge', v: +e.value, from: 0, to: +e.value });
    mxv = Math.max(mxv, +e.value);
    var n = cols.length, ml = 62, mr = 14, mt = 34, mb = 46, iw = W - ml - mr, ih = H - mt - mb;
    var tk = niceTicks(mnv, mxv * 1.14, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    var ax = axG(c, ml, tk, Y, mr), y0 = Y(0), band = iw / n, bw = Math.min(band * 0.6, 150);
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    cols.forEach(function (o, i) {
      o.x = ml + i * band + (band - bw) / 2;
      var yTop = Y(Math.max(o.from, o.to)), yBot = Y(Math.min(o.from, o.to));
      o.y = yTop; o.h = Math.max(2, yBot - yTop);
      o.cls = o.kind === 'edge' ? 'f-ink' : (o.v >= 0 ? 'f-s2' : 'f-hot');
      o.rect = mark(sv('rect', { x: o.x, width: bw, rx: 2, class: 'g-bar ' + o.cls }, svg));
      o.lab = svt(svg, { x: o.x + bw / 2, y: yTop - 10, 'text-anchor': 'middle', class: 'vl2 ' + (o.kind === 'step' ? (o.v >= 0 ? 't-ink' : 't-neg') : '') }, o.kind === 'step' ? signed(o.v, dec) : fmtN(o.v, dec));
      o.xl = svt(svg, { x: o.x + bw / 2, y: H - 14, 'text-anchor': 'middle', class: 'tk2' }, o.label);
      if (i > 0) { var pv = cols[i - 1], lv = pv.to; o.con = sv('line', { x1: pv.x + bw, x2: o.x, y1: Y(lv), y2: Y(lv), class: 's-mute', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg); }
    });
    var first = [trFade(ax), trFade(axis)];
    cols.forEach(function (o, i) {
      var tr = [mk(T.scene, 'enter', function (p) { var hh = o.h * p; o.rect.setAttribute('height', Math.max(0, hh)); o.rect.setAttribute('y', o.kind === 'edge' ? y0 - hh : o.y + (o.v >= 0 ? o.h - hh : 0)); }, 0),
        trFade(o.lab, T.scene * 0.6), trFade(o.xl, 0)];
      if (o.con) tr.push(trFade(o.con, 0));
      addStep(c, i === 0 ? first.concat(tr) : tr);
    });
  }

  var DRAW = { bar: drawBar, line: drawLine, cumline: drawCum, hbar: drawHbar, race: drawRace, zoom: drawZoom, wipe: drawWipe, slope: drawSlope, rank: drawRank, morph: drawMorph, split: drawSplit, bridge: drawBridge };

  /* ---------- 판 2 차트: combo · minis · donut ---------- */
  function pairs(a) { return (a || []).map(function (p) { return { l: String(p[0]), v: +p[1] }; }); }
  function heroAttr(n) { n.setAttribute('data-acc', 'hero'); return n; }

  /* combo: 회색 막대(수준) + 강조색 선 · 빈 점 + 점 위 네모 칩, 왼쪽 요약 카드, 아래 점선 요약 줄 */
  function drawCombo(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, bars = pairs(ch.bars), line = pairs(ch.line), units = ch.units || ['', ''];
    var cards = ch.cards || [], summary = ch.summary || [], n = bars.length, ld = ch.decimals != null ? ch.decimals : 1;
    if (!n) return;
    var cw = cards.length ? 230 : 0, ml = (cards.length ? cw + 28 : 0) + 56, mr = 24, mt = 40, sumH = summary.length * 34, mb = 40 + sumH;
    var iw = W - ml - mr, ih = H - mt - mb, mx = Math.max.apply(null, bars.map(function (p) { return p.v; }));
    var tk = niceTicks(0, mx / 0.56, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    var lmn = Math.min.apply(null, line.map(function (p) { return p.v; })), lmx = Math.max.apply(null, line.map(function (p) { return p.v; }));
    function YL(v) { return mt + 44 + (1 - (v - lmn) / ((lmx - lmn) || 1)) * (ih * 0.26 - 10); }
    var ax = axG(c, ml, tk, Y, mr), xg = sv('g', {}, svg), band = iw / n, bw = Math.min(band * 0.5, 64), y0 = Y(0);
    function X(i) { return ml + (i + 0.5) * band; }
    /* 범례(오른쪽 위) */
    var lgw = tw(units[1] || '선', 16) + 30 + tw(units[0] || '막대', 16) + 52, lx = W - mr - lgw, lg = sv('g', {}, svg);
    sv('rect', { x: lx, y: 6, width: 14, height: 14, rx: 3, class: 'f-data' }, lg);
    svt(lg, { x: lx + 22, y: 19, class: 'tk' }, units[0] || '막대');
    var lx2 = lx + 22 + tw(units[0] || '막대', 16) + 24;
    heroAttr(sv('line', { x1: lx2, x2: lx2 + 18, y1: 13, y2: 13, class: 's-acc', 'stroke-width': 3 }, lg));
    heroAttr(sv('circle', { cx: lx2 + 9, cy: 13, r: 4, class: 'hollow s-acc' }, lg));
    svt(lg, { x: lx2 + 26, y: 19, class: 'tk' }, units[1] || '선');
    var bt = [], vt = [];
    bars.forEach(function (p, i) {
      var x = X(i) - bw / 2, h = y0 - Y(p.v);
      var r = mark(sv('rect', { x: x, y: Y(p.v), width: bw, height: h, rx: 4, class: 'g-bar f-data' }, svg));
      bt.push({ r: r, h: h });
      vt.push(svt(svg, { x: X(i), y: Y(p.v) - 8, 'text-anchor': 'middle', class: 'vl' }, fmtN(p.v, 0)));
      if (n <= 14 || i % 2 === 0) svt(xg, { x: X(i), y: H - mb + 26, 'text-anchor': 'middle', class: 'tk' }, shortLabel(p.l));
    });
    var axis = sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    var pts = line.map(function (p, i) { return { x: X(i), y: YL(p.v), v: p.v }; });
    var lp = heroAttr(mark(sv('path', { d: pathD(pts), pathLength: 1, class: 'g-line s-acc' }, svg)));
    var dots = pts.map(function (p) { return heroAttr(mark(sv('circle', { cx: p.x, cy: p.y, r: 6, class: 'hollow s-acc' }, svg))); });
    function chipHits(p, w, dy) {
      var x0 = p.x - w / 2 - 2, x1 = p.x + w / 2 + 2, y0 = p.y + dy - 2, y1 = p.y + dy + 26, hits = 0;
      for (var k = 0; k < pts.length - 1; k++) {
        var a2 = pts[k], b2 = pts[k + 1], st = Math.max(2, Math.ceil(Math.abs(b2.x - a2.x) / 3));
        for (var s2 = 0; s2 <= st; s2++) {
          var px = a2.x + (b2.x - a2.x) * s2 / st, py = a2.y + (b2.y - a2.y) * s2 / st;
          if (Math.abs(px - p.x) < 9 && Math.abs(py - p.y) < 9) continue;
          if (px > x0 && px < x1 && py > y0 && py < y1) hits++;
        }
      }
      return hits;
    }
    var placed = [];
    function ovl(r, q) { return Math.min(r[2], q[2]) - Math.max(r[0], q[0]) > 1 && Math.min(r[3], q[3]) - Math.max(r[1], q[1]) > 1; }
    var barLab = bars.map(function (p, i) { var lw = tw(fmtN(p.v, 0), 16) + 4; return [X(i) - lw / 2, Y(p.v) - 26, X(i) + lw / 2, Y(p.v) - 4]; });
    var chips = pts.map(function (p) {
      var g = sv('g', {}, svg), t = fmtN(p.v, ld) + (units[1] === '%' ? '%' : ''), w = tw(t, 16) + 14, dy = -38, best = 1e9;
      [-38, 14, -66, 42].forEach(function (cd) {
        var r = [p.x - w / 2, p.y + cd, p.x + w / 2, p.y + cd + 24], sc = chipHits(p, w, cd) * 3 + (cd === -38 ? 0 : cd === 14 ? 1 : 4);
        placed.forEach(function (q) { if (ovl(r, q)) sc += 60; });
        barLab.forEach(function (q) { if (ovl(r, q)) sc += 60; });
        if (r[1] < mt - 20) sc += 500;
        if (sc < best) { best = sc; dy = cd; }
      });
      placed.push([p.x - w / 2, p.y + dy, p.x + w / 2, p.y + dy + 24]);
      heroAttr(sv('rect', { x: p.x - w / 2, y: p.y + dy, width: w, height: 24, rx: 4, class: 'chipr' }, g));
      heroAttr(svt(g, { x: p.x, y: p.y + dy + 17, 'text-anchor': 'middle', class: 'chipt' }, t));
      return g;
    });
    /* 왼쪽 요약 카드 · 아래 점선 요약 줄 */
    var side = sv('g', {}, svg), ch1 = Math.min(150, (ih - 16 * Math.max(0, cards.length - 1)) / Math.max(1, cards.length));
    cards.forEach(function (cd, k) {
      var y = mt + k * (ch1 + 16);
      sv('rect', { x: 0, y: y, width: cw, height: ch1, rx: 12, class: 'cardw' }, side);
      svt(side, { x: 18, y: y + 34, class: 'tk2' }, cd.label);
      var v = svt(side, { x: 18, y: y + 88, class: 'big2' }, fmtN(+cd.value, cd.decimals || 0));
      if (k === 0) heroAttr(v);
      svt(side, { x: 18, y: y + 120, class: 'tk' }, cd.unit || '');
    });
    summary.forEach(function (sm, k) {
      var y = H - sumH + 26 + k * 34, nw = tw(sm[0], 18) + 8, vw = tw(sm[1], 20) + 8;
      svt(side, { x: ml, y: y, class: 'sumn' }, sm[0]);
      sv('line', { x1: ml + nw + 6, x2: W - mr - vw - 6, y1: y - 6, y2: y - 6, class: 'dots' }, side);
      svt(side, { x: W - mr, y: y, 'text-anchor': 'end', class: 'sumv' }, sm[1]);
    });
    addStep(c, [trFade(ax), trFade(xg), trFade(axis), trFade(lg), trFade(side)]);
    var gs = stag(n), g1 = [];
    bt.forEach(function (b, i) { g1.push(mk(T.scene, 'enter', function (p) { var hh = b.h * p; b.r.setAttribute('height', Math.max(0, hh)); b.r.setAttribute('y', y0 - hh); }, i * gs)); });
    vt.forEach(function (t) { g1.push(trFade(t, (n - 1) * gs + 200)); });
    addStep(c, g1);
    addStep(c, [trDraw(lp, T.count, 0)].concat(dots.map(function (d, i) { return trFade(d, 120 + i * (T.count / n)); })));
    addStep(c, chips.map(function (g, i) { return trFade(g, i * T.stagger); }));
  }

  /* minis: 3열 — 위 회색 머리(이름 + 큰 값) + 아래 흰 카드 작은 차트 */
  function drawMinis(c) {
    var svg = c.svg, W = c.W, H = c.H, ms = (c.ch.minis || []).slice(0, 4), n = ms.length;
    if (!n) return;
    var gap = 28, cw = (W - gap * (n - 1)) / n, top = 96;
    ms.forEach(function (m, k) {
      var x0 = k * (cw + gap), g = sv('g', {}, svg), dec = m.decimals != null ? m.decimals : 1;
      svt(g, { x: x0 + 4, y: 24, class: 'tk2' }, m.label);
      svt(g, { x: x0 + 4, y: 70, class: 'big2' }, fmtN(+m.value, dec) + (m.unit || ''));
      sv('rect', { x: x0, y: top, width: cw, height: H - top - 4, rx: 16, class: 'mcard' }, g);
      var px = x0 + 28, pw = cw - 56, py = top + 40, ph = H - top - 4 - 96, data = pairs(m.data), nd = data.length, kind = m.kind || 'bar';
      if (kind === 'donut') {
        var r = Math.min(pw, H - top - 4 - 40) / 2 - 20, cx = x0 + cw / 2, cy = top + (H - top - 4) / 2, pc = +m.value;
        sv('path', { d: ringD(cx, cy, r), class: 'trk' }, g);
        var arc = heroAttr(mark(sv('path', { d: ringD(cx, cy, r), pathLength: 100, class: 'arc s-acc' }, g)));
        svt(g, { x: cx, y: cy + 12, 'text-anchor': 'middle', class: 'big2' }, fmtN(pc, dec) + '%');
        arc.setAttribute('stroke-dasharray', pc + ' 100');
      } else if (nd) {
        var vmx = Math.max.apply(null, data.map(function (p) { return p.v; })), vmn = Math.min.apply(null, data.map(function (p) { return p.v; }));
        if (kind === 'bar') {
          var bwid = Math.min(pw / nd * 0.6, 40), base = py + ph, lo0 = Math.min(0, vmn);
          data.forEach(function (p, i) {
            var xx = px + (i + 0.5) * pw / nd, hh = Math.max(2, (p.v - lo0) / ((vmx - lo0) || 1) * (ph - 24)), last = i === nd - 1;
            var rr = mark(sv('rect', { x: xx - bwid / 2, y: base - hh, width: bwid, height: hh, rx: 4, class: 'g-bar ' + (last ? 'f-acc' : 'f-data') }, g));
            if (last) { heroAttr(rr); svt(g, { x: xx, y: base - hh - 8, 'text-anchor': 'middle', class: 'vl hero' }, fmtN(p.v, dec)); }
            if (i === 0 || last) svt(g, { x: xx, y: base + 24, 'text-anchor': 'middle', class: 'tk' }, shortLabel(p.l));
          });
          sv('line', { x1: px, x2: px + pw, y1: base, y2: base, class: 'axis' }, g);
        } else {
          var lpts = data.map(function (p, i) { return { x: px + (nd === 1 ? pw / 2 : i * pw / (nd - 1)), y: py + 20 + (1 - (p.v - vmn) / ((vmx - vmn) || 1)) * (ph - 40) }; });
          mark(sv('path', { d: pathD(lpts), class: 'g-line s-s3' }, g));
          var lst = lpts[lpts.length - 1];
          heroAttr(mark(sv('circle', { cx: lst.x, cy: lst.y, r: 7, class: 'f-acc' }, g)));
          svt(g, { x: px, y: py + ph + 30, class: 'tk' }, shortLabel(data[0].l));
          svt(g, { x: px + pw, y: py + ph + 30, 'text-anchor': 'end', class: 'tk' }, shortLabel(data[nd - 1].l));
        }
      }
      addStep(c, [trEnter(g, 0)]);
    });
  }
  function ringD(cx, cy, r) { return 'M' + cx + ',' + (cy - r) + ' A' + r + ',' + r + ' 0 1 1 ' + cx + ',' + (cy + r) + ' A' + r + ',' + r + ' 0 1 1 ' + cx + ',' + (cy - r); }

  /* donut: 한 색 + 회색 트랙, 가운데 큰 %, half = 반원 */
  function drawDonut(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch, rings = (ch.rings || []).slice(0, 4), n = rings.length, half = !!ch.half, dec = ch.decimals != null ? ch.decimals : 1;
    if (!n) return;
    var cw = W / n, top = ch.head ? 40 : 10, hero = ch.hero != null ? ch.hero : 0;
    if (ch.head) svt(svg, { x: 0, y: 24, class: 'tk2' }, ch.head);
    rings.forEach(function (rg, k) {
      var cx = cw * (k + 0.5), r, cy;
      if (half) { cy = H - 44; r = Math.min(cw / 2 - 40, cy - top - 60); }
      else { cy = top + 30 + (H - top - 30) / 2; r = Math.min(cw / 2 - 40, (H - top - 30) / 2 - 24); }
      var g = sv('g', {}, svg), d1 = half ? 'M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy : ringD(cx, cy, r);
      svt(g, { x: cx, y: top + 20, 'text-anchor': 'middle', class: 'tk2' }, rg.label || '');
      sv('path', { d: d1, pathLength: 100, class: 'trk' }, g);
      var arc = mark(sv('path', { d: d1, pathLength: 100, class: 'arc ' + (k === hero ? 's-acc' : 's-s2') }, g));
      if (k === hero) heroAttr(arc);
      var txt = svt(g, { x: cx, y: half ? cy - 8 : cy + 14, 'text-anchor': 'middle', class: 'big' }, fmtN(+rg.value, dec) + '%');
      var v = +rg.value;
      addStep(c, [trFade(g, 0), mk(T.count, 'std', function (p) { arc.setAttribute('stroke-dasharray', (v * p) + ' 100'); }, 0), trFade(txt, T.scene)]);
    });
  }
  DRAW.combo = drawCombo; DRAW.minis = drawMinis; DRAW.donut = drawDonut;
  /* ---------- 도식 ---------- */
  function bx(parent, x, y, w, h, it, o) {
    o = o || {};
    it = item(it);
    var b = el('div', 'bx' + (o.cls ? ' ' + o.cls : ''));
    b.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
    b.setAttribute('data-fit', o.fs || 24);
    if (o.min) b.setAttribute('data-min', o.min);
    if (o.shrink) { b.setAttribute('data-shrink', 1); b.setAttribute('data-h', h); }
    var html = '';
    if (o.no) html += '<div class="no">' + o.no + '</div>';
    if (it.head) html += '<div class="h" data-c>' + fmt(it.head) + '</div>';
    if (it.body) html += '<div class="b" data-c>' + fmt(it.body) + '</div>';
    b.innerHTML = html;
    parent.appendChild(b);
    return b;
  }
  function layer(area, W, H) {
    var s = sv('svg', { class: 'under', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H });
    area.insertBefore(s, area.firstChild);
    return s;
  }
  function arrowHead(parent, x, y, deg, sz, cls) {
    return sv('polygon', { points: '0,' + (-sz * 0.62) + ' ' + sz + ',0 0,' + (sz * 0.62), transform: 'translate(' + x + ',' + y + ') rotate(' + deg + ')', class: cls || 'f-mid' }, parent);
  }
  function ring(n, cx, cy, rx, ry, start) {
    var r = [];
    for (var i = 0; i < n; i++) { var a = start + i * 2 * Math.PI / n; r.push({ a: a, x: cx + rx * Math.sin(a), y: cy - ry * Math.cos(a) }); }
    return r;
  }
  function stMark(node, id, on) {
    if (on && id > 0) { node.setAttribute('data-st', id); node.classList.add('st'); }
    return node;
  }

  var SHAPES = {
    rect: function (w, h) { return ['rect', { width: w, height: h }]; },
    round: function (w, h) { var r = Math.min(w, h) * 0.2; return ['rect', { width: w, height: h, rx: r, ry: r }]; },
    ellipse: function (w, h) { return ['ellipse', { cx: w / 2, cy: h / 2, rx: w / 2, ry: h / 2 }]; },
    chevron: function (w, h) { var d = Math.min(h / 2, w / 4); return ['polygon', { points: [0, 0, w - d, 0, w, h / 2, w - d, h, 0, h, d, h / 2].join(',') }]; },
    pentagon: function (w, h) { var d = Math.min(h / 2, w / 4); return ['polygon', { points: [0, 0, w - d, 0, w, h / 2, w - d, h, 0, h].join(',') }]; },
    arrowR: function (w, h) { var d = Math.min(h / 2, w / 2), t = h * 0.25; return ['polygon', { points: [0, t, w - d, t, w - d, 0, w, h / 2, w - d, h, w - d, h - t, 0, h - t].join(',') }]; },
    arrowD: function (w, h) { var d = Math.min(w / 2, h / 2), t = w * 0.25; return ['polygon', { points: [t, 0, w - t, 0, w - t, h - d, w, h - d, w / 2, h, 0, h - d, t, h - d].join(',') }]; },
    triangle: function (w, h) { return ['polygon', { points: [w / 2, 0, w, h, 0, h].join(',') }]; },
    diamond: function (w, h) { return ['polygon', { points: [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2].join(',') }]; },
    hexagon: function (w, h) { var d = Math.min(w / 4, h / 2); return ['polygon', { points: [d, 0, w - d, 0, w, h / 2, w - d, h, d, h / 2 * 2, 0, h / 2].join(',') }]; }
  };
  var FILLS = { acc: ['f-acc', 'on-dark'], dark: ['f-ink', 'on-dark'], mid: ['f-mid', 'on-ink'], light: ['f-soft', 'on-ink'], none: ['nofill', 'on-ink'] };

  function layoutSkeleton(area, d, W, H, steps) {
    var sk = d.skel, items = d.items || [];
    if (!sk || !sk.body) return;
    var b = sk.body, s = Math.min(W / b[2], H / b[3]);
    var ox = (W - b[2] * s) / 2, oy = (H - b[3] * s) / 2;
    function X(x) { return ox + (x - b[0]) * s; }
    function Y(y) { return oy + (y - b[1]) * s; }
    var svg = layer(area, W, H), defs = sv('defs', {}, svg), mid = 'sk' + (++uidc);
    var mk = sv('marker', { id: mid, markerWidth: 12, markerHeight: 12, refX: 10, refY: 6, orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs);
    sv('path', { d: 'M1,1 L11,6 L1,11 z', class: 'f-mute' }, mk);
    (sk.lines || []).forEach(function (l) {
      var a = { x1: X(l.x1), y1: Y(l.y1), x2: X(l.x2), y2: Y(l.y2), class: 's-mute', 'stroke-width': 2.5 };
      if (l.arrow) a['marker-end'] = 'url(#' + mid + ')';
      sv('line', a, svg);
    });
    (sk.boxes || []).forEach(function (bo) {
      var x = X(bo.x), y = Y(bo.y), w = bo.w * s, h = bo.h * s;
      var shp = (SHAPES[bo.k] || SHAPES.round)(w, h), fl = FILLS[bo.fill] || FILLS.light;
      var id = bo.slot != null ? bo.slot + 1 : 0;
      var g = sv('g', { transform: 'translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')' }, svg);
      var sp = sv(shp[0], shp[1], g);
      sp.setAttribute('class', fl[0] + (bo.line ? ' s-acc' : ''));
      if (bo.line) sp.setAttribute('stroke-width', 2.5);
      stMark(g, id, steps);
      if (bo.slot != null && items[bo.slot]) {
        var ins = { ellipse: [0.14, 0.14], diamond: [0.24, 0.26], triangle: [0.25, 0.1], hexagon: [0.14, 0.04], chevron: [0.1, 0], pentagon: [0.04, 0], arrowR: [0.04, 0.3], arrowD: [0.3, 0.04] }[bo.k] || [0.03, 0.03];
        var tx = x + w * ins[0], ty = y + h * ins[1], tw = w * (1 - ins[0] * 2), th = h * (1 - ins[1] * 2);
        if (bo.k === 'triangle') { ty = y + h * 0.38; th = h * 0.58; }
        var t = bx(area, tx.toFixed(1), ty.toFixed(1), tw.toFixed(1), th.toFixed(1), items[bo.slot], { cls: 'ctr ' + fl[1], fs: 26 });
        stMark(t, id, steps);
      }
    });
  }

  function layoutDiagram(area, d, W, H) {
    var items = (d.items || []).map(item), n = items.length, steps = !!d.steps, L = d.layout || 'columns';
    var gap, w, i, svg;
    if (L === 'skeleton') return layoutSkeleton(area, d, W, H, steps);
    if (L === 'wells') {
      var wsh = el('div', 'sheet wlw'), wpad = 28, wgap = 48, wcw = (W - 2 * wpad - (n - 1) * wgap) / n, wch = Math.min(H - 2 * wpad, 300), wy = (H - wch) / 2;
      wsh.style.cssText = 'left:0;top:0;width:' + W + 'px;height:' + H + 'px';
      area.appendChild(wsh);
      items.forEach(function (it, k) {
        var wc = el('div', 'wlc' + (k === n - 1 ? ' last' : ''), '<div class="wh" data-c>' + fmt(it.head) + '</div><div class="wp">' + (it.parts || []).map(function (p) { return '<div data-c>' + fmt(p) + '</div>'; }).join('') + '</div>');
        wc.style.cssText = 'left:' + (wpad + k * (wcw + wgap)) + 'px;top:' + wy + 'px;width:' + wcw + 'px;height:' + wch + 'px';
        area.appendChild(stMark(wc, k + 1, steps));
        if (k > 0) {
          var wg = el('div', 'wlg', '&rsaquo;');
          wg.style.cssText = 'left:' + (wpad + k * (wcw + wgap) - wgap) + 'px;top:' + wy + 'px;width:' + wgap + 'px;height:' + wch + 'px';
          area.appendChild(stMark(wg, k + 1, steps));
        }
      });
      return;
    }
    if (L === 'tiers') {
      var tsw = W * 0.44, tth = (H - 8) / n, stairs = d.shape === 'stairs', tsv = layer(area, W, H);
      items.forEach(function (it, k) {
        var ty = k * tth + 2, th2 = tth - 4, pts2, px, cls = 'f-a' + Math.min(k, 3) + 1;
        cls = 'f-a' + (Math.min(k, 3) + 1);
        if (stairs) {
          var sw2 = tsw * (k + 1) / n;
          pts2 = [0, ty, sw2, ty, sw2, ty + th2, 0, ty + th2]; px = sw2;
        } else {
          var wt = tsw * k / n, wb = tsw * (k + 1) / n;
          pts2 = [(tsw - wt) / 2, ty, (tsw + wt) / 2, ty, (tsw + wb) / 2, ty + th2, (tsw - wb) / 2, ty + th2];
          px = (tsw + (wt + wb) / 2) / 2;
        }
        var st = n - k, g = sv('g', {}, tsv);
        sv('polygon', { points: pts2.join(','), class: cls }, g);
        sv('line', { x1: px + 6, y1: ty + th2 / 2, x2: tsw + 44, y2: ty + th2 / 2, class: 'tline' }, g);
        sv('circle', { cx: px + 6, cy: ty + th2 / 2, r: 5, class: 'tdot' }, g);
        stMark(g, st, steps);
        stMark(bx(area, tsw + 60, ty, W - tsw - 60, th2, it, { cls: 'plain ctr', fs: 24 }), st, steps);
      });
      return;
    }
    if (L === 'circles') {
      var cvals = items.map(function (it) { return +it.value; }), cmax = Math.max.apply(null, cvals), cnest = !!d.nest, chero = d.hero != null ? +d.hero : cvals.indexOf(cmax);
      var csv = layer(area, W, H), Dm = cnest ? H - 40 : Math.min(H - 100, W / n - 48);
      var dia = cvals.map(function (v) { return Dm * Math.sqrt(v / cmax); });
      if (cnest) {
        var ncx = W * 0.3, nb = H - 16, order = items.map(function (it, k) { return k; }).sort(function (a, b) { return dia[b] - dia[a]; });
        var lys = order.map(function (k) { return { k: k, y: nb - dia[k] }; });
        lys.forEach(function (o) { o.y0 = o.y; });
        nudge(lys, 70, 0, H - 56);
        var lyOf = {};
        lys.forEach(function (o) { lyOf[o.k] = o; });
        order.forEach(function (k) {
          var it = items[k], r = dia[k] / 2, cyy = nb - r;
          stMark(sv('circle', { cx: ncx, cy: cyy, r: r, class: k === chero ? 'cr-hero' : 'cr-plain' }, csv), k + 1, steps);
          var tx2 = W * 0.3 + Dm / 2 + 60, topy = nb - dia[k], lyy = lyOf[k].y;
          var lg2 = sv('g', {}, csv);
          sv('line', { x1: ncx, y1: topy, x2: tx2 - 14, y2: lyy + 22, class: 'tline' }, lg2);
          sv('circle', { cx: ncx, cy: topy, r: 5, class: 'tdot' }, lg2);
          stMark(lg2, k + 1, steps);
          var lab = el('div', 'bx plain', '<div class="crv on-gray" data-c>' + fmtV2(it.value, it.unit) + '</div><div class="crh on-gray" data-c>' + fmt(it.head) + '</div>');
          lab.style.cssText = 'left:' + tx2 + 'px;top:' + lyy + 'px;width:' + (W - tx2) + 'px;height:56px';
          area.appendChild(stMark(lab, k + 1, steps));
        });
      } else {
        var cgap = 40, tot = dia.reduce(function (a, b) { return a + b; }, 0) + cgap * (n - 1), cx0 = (W - tot) / 2, cyc = (H - 56) / 2;
        items.forEach(function (it, k) {
          var r = dia[k] / 2, cxx = cx0 + dia.slice(0, k).reduce(function (a, b) { return a + b; }, 0) + cgap * k + r, hero = k === chero;
          stMark(sv('circle', { cx: cxx, cy: cyc, r: r, class: hero ? 'cr-hero' : 'cr-plain' }, csv), k + 1, steps);
          var inside = dia[k] >= 150, w3 = Math.max(dia[k], 150);
          var lab = el('div', 'bx ctr', '<div class="crv ' + (hero ? 'on-acc' : 'on-gray') + '" data-c>' + fmtV2(it.value, it.unit) + '</div><div class="crh on-gray" data-c>' + fmt(it.head) + '</div>');
          if (inside) { lab.style.cssText = 'left:' + (cxx - w3 / 2) + 'px;top:' + (cyc - 34) + 'px;width:' + w3 + 'px;height:68px'; var hh = lab.querySelector('.crh'); hh.className = 'crh on-gray'; }
          else lab.style.cssText = 'left:' + (cxx - w3 / 2) + 'px;top:' + (cyc + r + 12) + 'px;width:' + w3 + 'px;height:68px';
          area.appendChild(stMark(lab, k + 1, steps));
        });
      }
      return;
    }
    if (L === 'columns' && d.style === 'card') {
      gap = 24; w = (W - gap * (n - 1)) / n;
      var chh = Math.min(H - 8, 340);
      items.forEach(function (it, k) {
        var b = bx(area, k * (w + gap), 0, w, chh, it, { cls: 'cardc', fs: 24 });
        if (it.tags && it.tags.length) b.insertAdjacentHTML('beforeend', '<div class="tgs" data-acc="tags" data-c>' + it.tags.map(esc).join(' ') + '</div>');
        stMark(b, k + 1, steps);
      });
      return;
    }
    if (L === 'flow' && d.style === 'pill') {
      var pbh = 128, pdd = 104, pnow = d.now != null ? +d.now - 1 : -1, ptop = Math.max(0, (H - pbh - 100) / 2), pcw = (W - 80) / n;
      var bar = el('div', 'pillbar');
      bar.style.cssText = 'left:0;top:' + ptop + 'px;width:' + W + 'px;height:' + pbh + 'px';
      area.appendChild(bar);
      items.forEach(function (it, k) {
        var st = el('div', 'pillstep' + (k === pnow ? ' now' : ''));
        st.style.cssText = 'left:' + (40 + k * pcw) + 'px;width:' + pcw + 'px;top:' + (ptop + (pbh - pdd) / 2) + 'px';
        st.innerHTML = '<div class="dot" data-fit="22" data-min="16" data-c style="width:' + pdd + 'px;height:' + pdd + 'px">' + fmt(it.head) + '</div>' + (it.note ? '<div class="val" data-c style="margin-top:' + (14 + (pbh - pdd) / 2) + 'px">' + fmt(it.note) + '</div>' : '');
        area.appendChild(stMark(st, k + 1, steps));
      });
      return;
    }
    if (L === 'modules') {
      var two = n === 4 && !d.cols, mc = two ? 2 : (d.cols || n), mr = Math.ceil(n / mc), mgx = 32, mgy = 24;
      var mw = (W - mgx * (mc - 1)) / mc, mh = (H - mgy * (mr - 1)) / mr;
      items.forEach(function (it, k) {
        var b = bx(area, (k % mc) * (mw + mgx), Math.floor(k / mc) * (mh + mgy), mw, mh, it, { cls: 'mod' + (two ? ' sm' : ''), fs: 22 });
        b.insertAdjacentHTML('afterbegin', '<div class="mn">' + pad2(k + 1) + '</div><div class="ml"></div>');
        stMark(b, k + 1, steps);
      });
      return;
    }
    if (L === 'timeline' && d.style === 'chevron') {
      var cnow = d.now != null ? +d.now - 1 : n - 1, cgap = 8, cw2 = (W + (n - 1) * (22 - cgap)) / n, chh2 = 64, cstep = cw2 - 22 + cgap, ctw = W / n - 16;
      items.forEach(function (it, k) {
        var cv = el('div', 'chev' + (k === 0 ? ' first' : '') + (k === cnow ? ' now' : ''), '<span data-c>STEP ' + (k + 1) + '</span>');
        cv.style.cssText = 'left:' + (k * cstep) + 'px;top:0;width:' + cw2 + 'px;height:' + chh2 + 'px;font-size:22px';
        area.appendChild(stMark(cv, k + 1, steps));
        stMark(bx(area, k * (W / n) + 4, chh2 + 28, ctw, 200, it, { cls: 'plain', fs: 24 }), k + 1, steps);
      });
      return;
    }
    if (L === 'columns') {
      gap = d.op ? 64 : 28;
      w = (W - gap * (n - 1)) / n;
      items.forEach(function (it, k) {
        var x = k * (w + gap);
        stMark(bx(area, x, 0, w, H - 10, it, { cls: 'rule', fs: n <= 4 ? 30 : 26, shrink: true }), k + 1, steps);
        if (d.op && k > 0) {
          var o = el('div', 'opc', esc(d.op));
          o.style.left = (x - gap) + 'px'; o.style.width = gap + 'px';
          area.appendChild(stMark(o, k + 1, steps));
        }
      });
    } else if (L === 'flow') {
      gap = 52;
      w = (W - gap * (n - 1)) / n;
      var h = Math.min(H, 340), top = (H - h) / 2;
      svg = layer(area, W, H);
      items.forEach(function (it, k) {
        var x = k * (w + gap);
        stMark(bx(area, x, top, w, h, it, { cls: 'fill ctr', fs: n <= 4 ? 32 : 26, no: pad2(k + 1) }), k + 1, steps);
        if (k > 0) stMark(arrowHead(svg, x - gap / 2 - 8, H / 2, 0, 22, 'f-mid'), k + 1, steps);
      });
    } else if (L === 'cycle' || L === 'hub') {
      var hub = L === 'hub', cx = W / 2, cy = H / 2;
      var rx = hub ? 380 : 340, ry = hub ? 135 : 140, bw = hub ? 260 : 250, bh = 90;
      var start = hub && n % 2 === 0 ? Math.PI / n : 0;
      var pos = ring(n, cx, cy, rx, ry, start);
      svg = layer(area, W, H);
      if (!hub) sv('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, class: 'nofill s-line', 'stroke-width': 3, 'stroke-dasharray': '8 6' }, svg);
      pos.forEach(function (p, k) {
        if (hub) stMark(sv('line', { x1: cx, y1: cy, x2: p.x, y2: p.y, class: 's-mid', 'stroke-width': 3 }, svg), k + 1, steps);
        else {
          var am = p.a - Math.PI / n;
          var ax = cx + rx * Math.sin(am), ay = cy - ry * Math.cos(am), deg = Math.atan2(ry * Math.sin(am), rx * Math.cos(am)) * 180 / Math.PI;
          stMark(arrowHead(svg, ax - 8 * Math.cos(deg * Math.PI / 180), ay - 8 * Math.sin(deg * Math.PI / 180), deg, 22, 'f-acc'), k + 1, steps);
        }
        stMark(bx(area, p.x - bw / 2, p.y - bh / 2, bw, bh, items[k], { cls: 'fill ctr', fs: 24 }), k + 1, steps);
      });
      if (d.center) {
        var cw = hub ? 170 : 300, chh = hub ? 170 : 100;
        bx(area, cx - cw / 2, cy - chh / 2, cw, chh, { head: d.center }, { cls: (hub ? 'solid round ' : 'plain ') + 'ctr', fs: hub ? 28 : 34 });
      }
    } else if (L === 'tree') {
      var root = d.center ? { head: d.center } : items[0], kids = d.center ? items : items.slice(1), kn = kids.length;
      var rw = 420, rh = 90, kg = 20, kw = (W - kg * (kn - 1)) / kn, ky = 190;
      svg = layer(area, W, H);
      bx(area, (W - rw) / 2, 0, rw, rh, root, { cls: 'solid ctr', fs: 28 });
      sv('line', { x1: W / 2, y1: rh, x2: W / 2, y2: 140, class: 's-mid', 'stroke-width': 3 }, svg);
      if (kn > 1) sv('line', { x1: kw / 2, y1: 140, x2: W - kw / 2, y2: 140, class: 's-mid', 'stroke-width': 3 }, svg);
      kids.forEach(function (it, k) {
        var x = k * (kw + kg);
        stMark(sv('line', { x1: x + kw / 2, y1: 140, x2: x + kw / 2, y2: ky, class: 's-mid', 'stroke-width': 3 }, svg), k + 1, steps);
        stMark(bx(area, x, ky, kw, H - ky - 6, it, { cls: 'fill ctr', fs: 28 }), k + 1, steps);
      });
    } else if (L === 'pyramid') {
      var PW = 560, lg = 8, lh = (H - lg * (n - 1)) / n, a0 = PW * 0.2;
      var fills = ['f-acc', 'f-mid', 'f-soft', 'f-soft'], tcl = ['on-dark', 'on-ink', 'on-ink', 'on-ink'];
      svg = layer(area, W, H);
      items.forEach(function (it, k) {
        var wt = a0 + (PW - a0) * k / n, wb = a0 + (PW - a0) * (k + 1) / n, y = k * (lh + lg);
        var pg = sv('polygon', { points: [(PW - wt) / 2, y, (PW + wt) / 2, y, (PW + wb) / 2, y + lh, (PW - wb) / 2, y + lh].join(','), class: fills[k % 4] }, svg);
        stMark(pg, k + 1, steps);
        var tw = (wt + wb) / 2 - 16;
        stMark(bx(area, (PW - tw) / 2, y + 6, tw, lh - 12, { head: it.head }, { cls: 'ctr ' + tcl[k % 4], fs: 28 }), k + 1, steps);
        if (it.body) {
          var ly = y + lh / 2;
          stMark(sv('line', { x1: (PW + (wt + wb) / 2) / 2 + 12, y1: ly, x2: PW + 40, y2: ly, class: 's-op', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, svg), k + 1, steps);
          stMark(bx(area, PW + 60, y, W - PW - 60, lh, { body: it.body }, { cls: 'plain ctr', fs: 26 }), k + 1, steps);
        }
      });
    } else if (L === 'matrix') {
      var axx = d.axes || {}, lx = 70, bot = 44, mg = 16;
      var gw = (W - lx - mg) / 2, gh = (H - bot - mg) / 2;
      items.slice(0, 4).forEach(function (it, k) {
        var col = k % 2, rw2 = Math.floor(k / 2);
        stMark(bx(area, lx + col * (gw + mg), rw2 * (gh + mg), gw, gh, it, { cls: 'fill ctr', fs: 30 }), k + 1, steps);
      });
      if (axx.y) { var ay = el('div', 'axy', fmt(axx.y)); ay.style.height = (H - bot) + 'px'; area.appendChild(ay); }
      if (axx.x) { var ax2 = el('div', 'axx', fmt(axx.x)); ax2.style.cssText = 'left:' + lx + 'px;width:' + (W - lx) + 'px;top:' + (H - 34) + 'px'; area.appendChild(ax2); }
    } else if (L === 'timeline') {
      w = W / n;
      svg = layer(area, W, H);
      items.forEach(function (it, k) {
        if (k > 0) stMark(sv('line', { x1: w * (k - 0.5), y1: 40, x2: w * (k + 0.5), y2: 40, class: 's-mid', 'stroke-width': 5 }, svg), k + 1, steps);
      });
      items.forEach(function (it, k) {
        var xc = w * (k + 0.5);
        var g = sv('g', {}, svg);
        sv('circle', { cx: xc, cy: 40, r: 18, class: 'f-acc' }, g);
        sv('text', { x: xc, y: 46, class: 'tn' }, g).textContent = k + 1;
        stMark(g, k + 1, steps);
        stMark(bx(area, w * k + 8, 84, w - 16, H - 90, it, { cls: 'plain', fs: n <= 4 ? 30 : 26, shrink: true }), k + 1, steps);
      });
    } else if (L === 'venn') {
      var vx = W * 0.42, vw = W - vx, mx2 = vx + vw / 2, dd, cen;
      svg = layer(area, W, H);
      if (n <= 2) { dd = 300; cen = [[mx2 - 95, H / 2], [mx2 + 95, H / 2]]; }
      else { dd = 230; cen = [[mx2, 115], [mx2 - 70, 240], [mx2 + 70, 240]]; }
      var hp = n <= 2 ? [[mx2 - 150, H / 2], [mx2 + 150, H / 2]] : [[mx2, 52], [mx2 - 100, 290], [mx2 + 100, 290]];
      var lgh = H / Math.max(n, 1);
      items.forEach(function (it, k) {
        stMark(sv('circle', { cx: cen[k][0], cy: cen[k][1], r: dd / 2, class: 'f-s' + (k + 2), 'fill-opacity': 0.32, stroke: 'none' }, svg), k + 1, steps);
        stMark(bx(area, hp[k][0] - 55, hp[k][1] - 40, 110, 80, { head: it.head }, { cls: 'ctr', fs: 24 }), k + 1, steps);
        stMark(bx(area, 0, k * lgh + 8, vx - 30, lgh - 16, it, { cls: 'k' + (k + 1), fs: 26 }), k + 1, steps);
      });
      if (d.center) bx(area, mx2 - 45, n <= 2 ? H / 2 - 30 : 190 - 30, 90, 60, { head: d.center }, { cls: 'ctr', fs: 20 });
    }
  }

  /* ---------- 슬라이드 짓기 ---------- */
  function partName(no) {
    var p = (META.parts || []).filter(function (x) { return x.no === no; })[0];
    return p || {};
  }
  function topLabel(d) {
    if (d.appendix) return '<b>부록</b>' + (d.title ? ' · ' + esc(plain(d.title)) : '');
    if (d.part > 0) return '<b>PART ' + pad2(d.part) + '</b>' + (partName(d.part).name ? ' · ' + esc(partName(d.part).name) : '');
    return '<b>' + esc(META.session || 'ECOM') + '</b>' + (META.title ? ' · ' + esc(META.title) : '');
  }
  function goPart(no) {
    for (var i = 0; i < N; i++) { if (SL[i].kind === 'part' && SL[i].part === no) { show(i, 0); return; } }
  }


  var KINDS = {
    cover: function (sl, d) {
      var c = el('div', 'cv blk');
      var kick = [META.series, META.session].filter(Boolean).join(' · ');
      c.innerHTML = '<div class="kick">' + esc(kick) + '</div><h1 class="cvt" data-c>' + fmt(d.title) + '</h1><div class="cvs" data-c>' + fmt(d.sub) + '</div><div class="cvd">' + esc(d.date || META.date || '') + '</div>';
      sl.appendChild(c);
    },
    part: function (sl, d, ctx) {
      var pn = partName(d.part), c = el('div', 'part blk');
      c.innerHTML = '<div class="no">PART ' + pad2(d.part) + '</div><div class="nm" data-c>' + fmt(d.name || pn.name) + '</div><div class="ds" data-c>' + fmt(d.desc || pn.desc) + '</div>';
      sl.appendChild(c);
      var ps = META.parts || [];
      if (ps.length > 8) { sl.appendChild(el('div', 'parts blk plist', 'PART ' + pad2(d.part) + ' / ' + ps.length)); }
      else if (ps.length) {
        var m = el('div', 'parts blk');
        ps.forEach(function (p) {
    var b = el('button', p.no === d.part ? 'on' : '', 'PART ' + pad2(p.no) + '<br>' + esc(p.name));
          b.type = 'button';
          b.addEventListener('click', function () { if (!ctx.isStatic) goPart(p.no); });
          m.appendChild(b);
        });
        sl.appendChild(m);
      }
    },
    end: function (sl, d) {
      var c = el('div', 'part end blk');
      c.innerHTML = '<div class="no">' + esc(META.series || 'ECOM') + '</div><div class="nm" data-c>' + fmt(d.title) + '</div><div class="ds" data-c>' + fmt(d.sub) + '</div>';
      sl.appendChild(c);
    },
    statement: function (sl, d) {
      var words = d.words || [];
      if (!words.length) {
        var c = el('div', 'stmt blk');
        c.innerHTML = '<div class="st1" data-c>' + fmt(d.title) + '</div>' + (d.sub ? '<div class="st2" data-c>' + fmt(d.sub) + '</div>' : '');
        sl.appendChild(c);
        return;
      }
      var area = el('div', 'area blk'), cen = el('div', 'cen'), row = el('div', 'eq'), ops = d.ops || [], caps = d.captions || [];
      words.forEach(function (w, k) {
        if (k > 0) row.appendChild(stMark(el('div', 'op', esc(ops[k - 1] || '')), k + 1, d.steps));
        row.appendChild(stMark(el('div', 'tm', '<div class="w" data-c>' + fmt(w) + '</div><div class="m">' + fmt(caps[k] || '') + '</div>'), k + 1, d.steps));
      });
      cen.appendChild(row);
      if (d.sub) cen.appendChild(el('div', 'asub', '<span data-c>' + fmt(d.sub) + '</span>'));
      area.appendChild(cen);
      sl.appendChild(area);
    },
    number: function (sl, d, ctx) {
      var c = el('div', 'numwrap blk'), dec = d.decimals || 0;
      var fmtV = numFmt(dec);
      c.innerHTML = '<div class="nl" data-c>' + fmt(d.label) + '</div><div class="huge"><span class="v">' + fmtV(d.value) + '</span><small>' + esc(d.unit || '') + '</small></div><div class="hsub" data-c>' + fmt(d.sub) + '</div>';
      var huge = c.querySelector('.huge'), v = c.querySelector('.v');
      huge.setAttribute('data-acc', 'hero');
      if (d.fact) {
        huge.setAttribute('data-fact', d.fact);
        huge.title = '누르면 숫자의 출처';
        huge.addEventListener('click', function (e) {
          e.stopPropagation();
    var f = FACTS[d.fact] || {};
    var h = '<b>' + esc(f.source || d.source || '출처 없음') + '</b><br>기준 ' + esc(f.period || META.asof || '') + (f.value != null ? ' · ' + vfmt(f.value) + ' ' + esc(f.unit || '') : '');
          showTip(h, e.clientX, e.clientY);
        });
      }
      sl.appendChild(c);
      ctx.carryEl = huge;
      ctx.setSteps([[trCount(v, +d.value, fmtV, 0)]]);
    },
    chart: function (sl, d, ctx) {
            if (d.chart && d.chart.type === 'waffle') { buildWaffle(sl, d, ctx); return; }
      var area = mkArea(sl, d, 'chartarea sheet');
      var chart = new Chart(area, d, ctx);
      charts.push(chart);
      ctx.carryEl = area.querySelector('.plot');
    },
    diagram: function (sl, d) {
      var area = mkArea(sl, d, ''), host = area;
      if (d.layout !== 'skeleton') { host = el('div', 'cen'); area.appendChild(host); }
      host.setAttribute('data-acc', 'dg');
      layoutDiagram(host, d, area.clientWidth, area.clientHeight);
    },
    compare: function (sl, d) {
      if (d.style === 'rows') { compareRows(sl, d); return; }
      if (d.style === 'pair') { comparePair(sl, d); return; }
      var area = mkArea(sl, d, ''), mid = 120;
      var W = area.clientWidth, H = area.clientHeight, pw2 = (W - mid) / 2;
      ['left', 'right'].forEach(function (side, k) {
        var p = d[side] || {};
        var b = bx(area, k ? pw2 + mid : 0, 0, pw2, H - 10, { head: p.head }, { cls: 'pane ' + (k ? 'r' : 'l'), fs: 34 });
        var h = '';
        if (p.tag) h += '<div class="tag" data-c>' + fmt(p.tag) + '</div>';
        if (p.points && p.points.length) h += '<ul>' + p.points.map(function (x) { return '<li data-c>' + fmt(x) + '</li>'; }).join('') + '</ul>';
        b.insertAdjacentHTML('beforeend', h);
        stMark(b, k + 1, d.steps);
      });
      var vs = el('div', 'vs' + (d.vs ? ' pill' : ''), d.vs ? '<span data-c>' + fmt(d.vs) + '</span>' : '&rsaquo;'); vs.style.left = (W / 2) + 'px'; vs.setAttribute('data-fade', '1'); area.appendChild(stMark(vs, 2, d.steps));
    },
    question: function (sl, d, ctx) {
      var area = el('div', 'area blk'), box = el('div', 'qz'), opts = d.options || [];
      var vs = votes[ctx.i] || (votes[ctx.i] = opts.map(function () { return 0; }));
      var rows = opts.map(function (o, k) {
        var r = el('div', 'o');
        r.innerHTML = '<div class="nm" data-fit="28" data-c>' + fmt(o) + '</div><div class="tr"><i style="width:0"></i></div><b class="num">0</b><div class="bt"><button type="button" class="mi" aria-label="하나 줄이기">−1</button><button type="button" aria-label="하나 늘리기">+1</button></div>';
        var bt = r.querySelectorAll('button');
        bt[0].addEventListener('click', function () { vs[k] = Math.max(0, vs[k] - 1); paint(); });
        bt[1].addEventListener('click', function () { vs[k] += 1; paint(); });
        box.appendChild(r);
        return r;
      });
      function paint() {
        var tot = vs.reduce(function (a, b) { return a + b; }, 0);
        rows.forEach(function (r, k) {
          r.querySelector('i').style.width = (tot ? vs[k] / tot * 100 : 0) + '%';
          r.querySelector('b').textContent = vs[k];
        });
      }
      paint();
      area.appendChild(box);
      sl.appendChild(area);
    },
    table: function (sl, d, ctx) {
      var area = mkArea(sl, d, 'tblarea sheet');
      area.setAttribute('data-fit', 30);
      var hi = d.hi == null ? [] : [].concat(d.hi), chips = d.chips || {}, hc = d.hiCol == null ? -1 : +d.hiCol, hasChip = false;
      var marks = d.marks || {};
      function cell(tag, c, r, k) {
        var key = r + ',' + k, ch = chips[key], txt = ch == null || ch === true ? c : ch;
        if (marks[key]) return '<' + tag + '><span class="mk" data-c>' + (marks[key] === 'o' ? '●' : '○') + '</span></' + tag + '>';
        if (d.delta && /^[▲▼+−-]/.test(String(c)) && ch == null) {
          var up = /^(▲|\+)/.test(String(c)), body = String(c).replace(/^[▲▼+−-]\s*/, '');
          return '<' + tag + '><span class="dl ' + (up ? 'up' : 'dn') + '" data-c>' + (up ? '▲ ' : '▼ ') + fmt(body) + '</span></' + tag + '>';
        }
        if (ch != null) {
          hasChip = true;
    var cls = /^[−-]/.test(String(txt)) ? 'dn' : /^\+/.test(String(txt)) ? 'up' : 'fl';
          return '<' + tag + '><span class="chip ' + cls + '" data-c>' + fmt(txt) + '</span></' + tag + '>';
        }
        return '<' + tag + '>' + fmt(c) + '</' + tag + '>';
      }
      var html = '<div class="tband"></div><table class="tbl ' + (d.head === 'col' ? 'hcol' : 'hrow') + '"><thead><tr>' + (d.cols || []).map(function (c, k) { return '<th>' + fmt(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      (d.rows || []).forEach(function (r, i) {
        html += '<tr>' + r.map(function (c, k) { return cell('td', c, i, k); }).join('') + '</tr>';
      });
      area.innerHTML = html + '</tbody></table>';
      var trs = area.querySelectorAll('tbody tr');
      hi.forEach(function (i) { if (trs[i]) trs[i].className = 'hi'; });
      sl.appendChild(area);
      var table = area.querySelector('table'), band = area.querySelector('.tband'), rowHi = d.rowHi == null ? -1 : +d.rowHi, pill = null;
      if (rowHi >= 0) { pill = el('div', 'rhpill'); pill.style.opacity = '0'; area.appendChild(pill); if (trs[rowHi]) trs[rowHi].setAttribute('data-acc', 'hero'); }
      function place() {
        if (pill && table.rows[rowHi + 1]) { var rr = table.rows[rowHi + 1]; pill.style.cssText += ';left:' + (table.offsetLeft - 6) + 'px;top:' + (table.offsetTop + rr.offsetTop + 2) + 'px;width:' + (table.offsetWidth + 12) + 'px;height:' + (rr.offsetHeight - 4) + 'px'; }
        var th = table.rows[0] && table.rows[0].cells[hc];
        if (!th || hc < 0) { band.style.display = 'none'; return; }
        band.style.cssText = 'left:' + (table.offsetLeft + th.offsetLeft) + 'px;top:' + table.offsetTop + 'px;width:' + th.offsetWidth + 'px;height:' + table.offsetHeight + 'px';
      }
      sl._post.push(place);
      var rowsEl = [].slice.call(table.rows), g = stag(rowsEl.length), chipEl = [].slice.call(area.querySelectorAll('.chip'));
      rowsEl.forEach(function (r) { r.setAttribute('data-fade', '1'); });
      var steps = [rowsEl.map(function (r, i) { return trEnter(r, i * g); })];
      if (pill) steps.push([mk(T.std, 'std', function (p) { if (trs[rowHi]) trs[rowHi].classList.toggle('rh', p > 0.5); pill.style.opacity = p >= 1 ? '' : String(p); }, 0)]);
      if (hc >= 0) steps.push([mk(T.scene, 'std', function (p) { band.style.clipPath = p >= 1 ? '' : 'inset(0 ' + ((1 - p) * 100) + '% 0 0)'; if (p <= 0) band.style.clipPath = 'inset(0 100% 0 0)'; }, 0)]);
      if (hasChip) steps.push(chipEl.map(function (c, i) { return trAppear(c, i * T.stagger); }));
      ctx.setSteps(steps);
      ctx.carryEl = table;
    }
  };


  /* 비교 알약 줄(G3): 머리 알약 둘 · 줄마다 왼쪽 회색 알약 > 오른쪽 흰 알약 · 오른쪽 회색 설명 */
  function compareRows(sl, d) {
    var area = mkArea(sl, d, ''), cmp = el('div', 'cmpr'), W = area.clientWidth, H = area.clientHeight;
    area.appendChild(cmp);
    var heads = d.heads || ['', ''], rows = d.rows || [], notes = d.notes || [], n = rows.length;
    var nw = notes.length ? 300 : 0, gt = 56, pw = (W - nw - gt - (nw ? 24 : 0)) / 2, hh = 48, gap = 16;
    var rh = clamp((H - hh - 24 - gap * Math.max(0, n - 1)) / Math.max(1, n), 44, 64);
    var y0 = Math.max(0, (H - (hh + 24 + n * rh + Math.max(0, n - 1) * gap)) / 2);
    function put(cls, x, y, w, h, html, st, sd, fitPx) {
      var e = el('div', cls, html);
      e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
      if (fitPx) { e.setAttribute('data-fit', fitPx); e.setAttribute('data-min', 16); }
      e.setAttribute('data-st', st); e.setAttribute('data-sd', sd || 0);
      cmp.appendChild(e);
      return e;
    }
    put('hp', 0, y0, pw, hh, '<span data-c>' + fmt(heads[0]) + '</span>', 1, 0);
    put('hp r', pw + gt, y0, pw, hh, '<span data-c>' + fmt(heads[1]) + '</span>', 1, 60);
    rows.forEach(function (r, i) {
      var y = y0 + hh + 24 + i * (rh + gap), st = i + 2;
      put('rl l', 0, y, pw, rh, '<span data-c>' + fmt(r[0]) + '</span>', st, 0, 22);
      put('gt', pw, y, gt, rh, '&gt;', st, 60);
      put('rl r', pw + gt, y, pw, rh, '<span data-c>' + fmt(r[1]) + '</span>', st, 120, 22);
      if (notes[i]) put('nt', pw * 2 + gt + 24, y, nw, rh, '<span data-c>' + fmt(notes[i]) + '</span>', st, 180, 20);
    });
  }

  /* 전후 카드 한 쌍(G15) */
  function comparePair(sl, d) {
    var area = mkArea(sl, d, ''), box = el('div', 'pairw'), W = area.clientWidth, H = area.clientHeight, gt = 72, cw = (W - gt) / 2, chh = Math.min(H, 380), y = (H - chh) / 2;
    area.appendChild(box);
    ['left', 'right'].forEach(function (side, k) {
      var p = d[side] || {}, c = el('div', 'pc ' + (k ? 'r' : 'l'),
        (p.tag ? '<div class="pt" data-c>' + esc(p.tag) + '</div>' : '') + '<div class="phd" data-c>' + fmt(p.head) + '</div>' + (p.body ? '<div class="pb" data-c>' + fmt(p.body) + '</div>' : '') +
        ((p.wells || []).length ? '<div class="pwl">' + p.wells.map(function (w) { return '<div class="wl" data-c>' + fmt(w) + '</div>'; }).join('') + '</div>' : '') +
        (k && d.ribbon ? '<div class="rb" data-c>' + esc(d.ribbon) + '</div>' : ''));
      c.style.cssText = 'left:' + (k ? cw + gt : 0) + 'px;top:' + y + 'px;width:' + cw + 'px;height:' + chh + 'px';
      c.setAttribute('data-st', k ? 3 : 1);
      box.appendChild(c);
    });
    var ar = el('div', 'pgt', '&rsaquo;');
    ar.style.cssText = 'left:' + cw + 'px;top:' + y + 'px;width:' + gt + 'px;height:' + chh + 'px';
    ar.setAttribute('data-st', 2);
    box.appendChild(ar);
  }

  /* 제목 덩어리: 머리말 · 제목(key 낱말만 강조색) · 부제 */
  var NOTITLE = { headline: 1, term: 1, number: 1 };
  var SUBBODY = { statement: 1, number: 1 };
  function defaultEyebrow(d) {
    if (d.appendix) return '부록 ' + d.appendix;
    if (d.part > 0) return 'PART ' + pad2(d.part) + (partName(d.part).name ? ' › ' + partName(d.part).name : '');
    return [META.session || 'ECOM', META.title].filter(Boolean).join(' · ');
  }
  function header(sl, d) {
    var kind = d.kind || 'statement';
    if (kind === 'cover' || kind === 'part' || kind === 'end') return;
    var noT = NOTITLE[kind] || (kind === 'statement' && !(d.words || []).length);
    if (d.band === 'head') sl.appendChild(el('div', 'bandbg blk'));
    var hd = el('div', 'hd blk'), ey = d.eyebrow != null ? d.eyebrow : defaultEyebrow(d);
    if (ey) hd.appendChild(el('div', 'ey', esc(plain(ey))));
    if (!noT && d.title) {
      var h = fmt(d.title).replace(/<em data-acc="em">/g, '<em>');
      [].concat(d.key || []).forEach(function (k) {
        var ek = esc(k);
        if (ek && h.indexOf(ek) >= 0 && h.indexOf('<em>' + ek) < 0) h = h.replace(ek, '<em>' + ek + '</em>');
      });
      var t = el('h2', 't', '<span data-c>' + h + '</span>');
      t.setAttribute('data-fit', 40); t.setAttribute('data-min', 28); t.setAttribute('data-acc', 'key');
      hd.appendChild(t);
    }
    if (d.sub && !SUBBODY[kind]) hd.appendChild(el('div', 'sb', fmt(d.sub)));
    sl.appendChild(hd);
  }

  /* ---------- 새 화면 짜임 ---------- */
  var ASIDE_RIGHT = 'calc(var(--pad-x) + var(--aside-w) + var(--gap))';
  function mkArea(sl, d, cls) {
    var a = el('div', 'area blk' + (cls ? ' ' + cls : ''));
    if (d.aside) a.style.right = ASIDE_RIGHT;
    sl.appendChild(a);
    return a;
  }
  function numFmt(dec) { return function (v) { return Number(v).toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }; }
  function chipCls(dir) { return dir === 'down' ? 'dn' : dir === 'up' ? 'up' : 'fl'; }
  function chipArrow(dir) { return dir === 'down' ? '▼ ' : dir === 'up' ? '▲ ' : ''; }
  function trAppear(node, delay) {
    return mk(T.std, 'enter', function (p) {
      node.style.opacity = p >= 1 ? '' : String(p);
      node.style.transform = p >= 1 ? '' : 'scale(' + (0.92 + 0.08 * p) + ')';
    }, delay);
  }
  function sparkSVG(host, pts, h) {
    var w = host.clientWidth || 300, lo = Math.min.apply(null, pts), hi = Math.max.apply(null, pts), sp = (hi - lo) || 1;
    var svg = sv('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h }, host), pad = 7;
    var list = pts.map(function (v, i) { return { x: pad + i * (w - 2 * pad) / Math.max(1, pts.length - 1), y: pad + (1 - (v - lo) / sp) * (h - 2 * pad) }; });
    sv('line', { x1: 0, x2: w, y1: h - 1, y2: h - 1, class: 'grid' }, svg);
    var path = mark(sv('path', { d: pathD(list), pathLength: 1, class: 'g-line spark s-s2' }, svg));
    var last = list[list.length - 1], dot = mark(sv('circle', { cx: last.x, cy: last.y, r: 5.5, class: 'f-s2' }, svg));
    return [trDraw(path, T.scene, 0), trFade(dot, T.scene)];
  }

  function buildWaffle(sl, d, ctx) {
    var ch = d.chart || {}, area = mkArea(sl, d, 'sheet'), inner = el('div', 'wfin');
    area.appendChild(inner);
    var H = inner.clientHeight, Sz = Math.min(H, 372), gap = 6;
    var cell = (Sz - 9 * gap) / 10, value = +ch.value, bd = ch.breakdown || [];
    var left = el('div', 'wfl'), right = el('div', 'wfr');
    left.style.cssText = 'left:0;top:' + ((H - Sz) / 2) + 'px;width:' + Sz + 'px;height:' + Sz + 'px';
    inner.appendChild(left); inner.appendChild(right);
    right.style.left = (Sz + 72) + 'px';
    var svg = sv('svg', { width: Sz, height: Sz, viewBox: '0 0 ' + Sz + ' ' + Sz, role: 'img', 'aria-label': plain(d.title || '') }, left);
    var base = sv('g', {}, svg), fills = [], i;
    for (i = 0; i < 100; i++) {
      var x = (i % 10) * (cell + gap), y = Math.floor(i / 10) * (cell + gap);
      mark(sv('rect', { x: x, y: y, width: cell, height: cell, rx: 3, class: 'f-track' }, base));
      fills.push({ x: x, y: y, r: mark(sv('rect', { x: x, y: y, width: 0, height: cell, rx: 3, class: 'f-acc', 'data-acc': 'hero' }, svg)) });
    }
    var dec = ch.decimals != null ? ch.decimals : 1, fv = numFmt(dec);
    right.innerHTML = '<div class="wfn" data-fitw data-fit="' + (bd.length ? 112 : 150) + '" data-min="60"><span class="v">' + fv(value) + '</span><small>%</small></div>' +
      '<div class="wflab" data-c>' + fmt(ch.label || d.title) + '</div>' +
      (ch.rest ? '<div class="wfrest" data-c>' + fmt(ch.rest) + '</div>' : '') +
      (bd.length ? '<table class="wft"><tbody>' + bd.map(function (r) { return '<tr><td data-c>' + fmt(r[0]) + '</td><td class="r num">' + fv(+r[1]) + '%</td></tr>'; }).join('') + '</tbody></table>' : '');
    right.querySelector('.wfn').setAttribute('data-acc', 'hero');
    var v = right.querySelector('.v'), items = [].slice.call(right.children).filter(function (n) { return !n.classList.contains('wft'); });
    var rows = [].slice.call(right.querySelectorAll('tr'));
    ctx.setSteps([
      [mk(T.std, 'enter', function (p) { base.style.opacity = p >= 1 ? '' : String(p); }, 0)],
      [mk(T.count, 'std', function (p) {
        var cnt = value * p;
        fills.forEach(function (f, k) { f.r.setAttribute('width', cell * clamp(cnt - k, 0, 1)); });
      }, 0)],
      [trCount(v, value, fv, 0)].concat(items.map(function (n, k) { return trEnter(n, k * T.stagger); })).concat(rows.map(function (r, k) { r.setAttribute('data-fade', '1'); return trEnter(r, 120 + k * T.stagger); }))
    ]);
    ctx.carryEl = left;
  }

  KINDS.kpi = function (sl, d, ctx) {
        var area = mkArea(sl, d, ''), cs = (d.cards || []).slice(0, 4), n = cs.length, wrap = el('div', 'kpi n' + n), grid = el('div', 'kgrid');
    area.appendChild(wrap); wrap.appendChild(grid);
    var cardsEl = [], vals = [], chips = [], sparks = [];
    cs.forEach(function (c, i) {
      var dec = c.decimals || 0, fv = numFmt(dec), card = el('div', 'kc' + (i === 0 ? ' hero' : '')), ch = c.change || null;
      if (i === 0) card.setAttribute('data-acc', 'hero');
      var big = { 1: 104, 2: 72, 3: 52, 4: 44 }[n] || 52;
      card.innerHTML = '<div class="kl" data-c>' + fmt(c.label) + '</div>' +
        '<div class="kv' + (big >= 64 ? ' u50' : '') + '" data-fitw data-fit="' + big + '" data-min="28"><span class="v">' + fv(c.value) + '</span><small>' + esc(c.unit || '') + '</small></div>' +
        '<div class="kd">' + (ch ? '<span class="chip ' + chipCls(ch.dir) + '" data-c>' + chipArrow(ch.dir) + esc(ch.text) + '</span>' : '') + '</div>' +
        '<div class="ks" style="height:' + (n === 1 ? 92 : 84) + 'px"></div>' +
        '<div class="km" data-c>' + esc(c.asof || '') + '</div><div class="ksrc" data-c>' + esc(c.source || '') + '</div>';
      grid.appendChild(card);
      cardsEl.push(card); vals.push([card.querySelector('.v'), +c.value, fv]); chips.push(card.querySelector('.chip'));
      sparks.push(c.spark && c.spark.length > 1 ? c.spark.map(function (p) { return +(Array.isArray(p) ? p[1] : p); }) : null);
      if (c.fact) card.querySelector('.kv').setAttribute('data-fact', c.fact);
    });
    var foot = null;
    if (d.foot && d.foot.length) {
      foot = el('div', 'kfoot', d.foot.map(function (f) { return '<div class="kf"><span class="a" data-c>' + fmt(f[0]) + '</span><span class="b num" data-c>' + fmt(f[1]) + '</span></div>'; }).join(''));
      wrap.appendChild(foot);
    }
    ctx.carryEl = cardsEl[0] && cardsEl[0].querySelector('.kv');
    var spTr = [];
    cardsEl.forEach(function (card, i) {
      var host = card.querySelector('.ks');
      if (!sparks[i]) { host.style.display = 'none'; return; }
      spTr = spTr.concat(sparkSVG(host, sparks[i], n === 1 ? 92 : 84));
    });
    var g = stag(n), s1 = cardsEl.map(function (c2, i) { return trEnter(c2, i * g * 2); });
    if (foot) { foot.setAttribute('data-fade', '1'); s1.push(trEnter(foot, n * g * 2 + 60)); }
    var s2 = vals.map(function (v, i) { return trCount(v[0], v[1], v[2], i * 90); });
    var s3 = [];
    chips.forEach(function (c, i) { if (c) s3.push(trAppear(c, i * T.stagger)); });
    var all = [s1, s2];
    if (s3.length) all.push(s3);
    if (spTr.length) all.push(spTr);
    ctx.setSteps(all);
  };

  KINDS.headline = function (sl, d, ctx) {
    var wrap = el('div', 'hlw blk');
    if (d.aside) wrap.style.right = ASIDE_RIGHT;
    sl.appendChild(wrap);
    /* 위 : 문장(구 단위 · key 에만 밑줄) */
    var text = String(d.text || d.title || ''), key = d.key ? String(d.key) : '', at = key ? text.indexOf(key) : -1, segs = [];
    if (at < 0) segs = [{ t: text, k: false }];
    else segs = [{ t: text.slice(0, at), k: false }, { t: key, k: true }, { t: text.slice(at + key.length), k: false }].filter(function (s) { return s.t; });
    var phr = [];
    segs.forEach(function (sg) {
      var words = sg.t.split(/\s+/).filter(Boolean), acc = '';
      words.forEach(function (w, i) {
        acc += (acc ? ' ' : '') + w;
        if (acc.length >= 6 || i === words.length - 1) { phr.push({ t: acc, k: sg.k }); acc = ''; }
      });
    });
    var top = el('div', 'hl-txt'), pe = [];
    top.setAttribute('data-fit', 64); top.setAttribute('data-min', 36);
    top.innerHTML = phr.map(function (p) { return '<span class="ph' + (p.k ? ' ul' : '') + '" data-c>' + fmt(p.t) + '</span>'; }).join(' ');
    wrap.appendChild(top);
    pe = [].slice.call(top.querySelectorAll('.ph'));
    ctx.carryEl = top;
    /* 가운데 : 근거 카드 */
    var ev = (d.evidence || []).slice(0, 4), mx = 0, evEl = [], bars = [];
    ev.forEach(function (e) { mx = Math.max(mx, Math.abs(+e.value)); });
    var evw = el('div', 'hl-ev n' + ev.length);
    ev.forEach(function (e) {
      var dec = e.decimals != null ? e.decimals : 1, card = el('div', 'ev' + (evEl.length === 0 ? ' hero' : ''));
      if (evEl.length === 0) card.setAttribute('data-acc', 'hero');
      card.innerHTML = '<div class="el" data-c>' + fmt(e.label) + '</div><div class="evv" data-fitw data-fit="64" data-min="32"><span class="v">' + numFmt(dec)(+e.value) + '</span><small>' + esc(e.unit || '') + '</small></div>' +
        '<div class="en2" data-c>' + fmt(e.note || '') + '</div><div class="evb"><i data-mark="1" class="' + (+e.value < 0 ? 'neg' : '') + '" style="width:' + (mx ? Math.abs(+e.value) / mx * 100 : 0) + '%"></i></div>';
      evw.appendChild(card); evEl.push(card); bars.push(card.querySelector('i'));
    });
    wrap.appendChild(evw);
    /* 아래 : 점 목록 */
    var pts = d.points || [], pw2 = el('div', 'hl-pts'), pe2 = [];
    pts.forEach(function (p) {
      var h = esc(p).replace(/([+−-]\s?[\d][\d.,]*)/, function (m) { return '<b class="' + (m.charAt(0) === '+' ? 'up' : 'dn') + '">' + m + '</b>'; });
      var node = el('div', 'pt', h);
      node.setAttribute('data-c', '');
      pw2.appendChild(node); pe2.push(node);
    });
    wrap.appendChild(pw2);
    var g = stag(phr.length);
    var s1 = pe.map(function (p, i) { return trEnter(p, i * g); });
    var s2 = evEl.map(function (c, i) { return trEnter(c, i * T.stagger * 2); }).concat(bars.map(function (b, i) {
      var w = b.style.width;
      return mk(T.scene, 'std', function (p) { b.style.width = p >= 1 ? w : (parseFloat(w) * p) + '%'; }, 120 + i * T.stagger * 2);
    }));
    var s3 = pe2.map(function (p, i) { return trEnter(p, i * T.stagger); });
    ctx.setSteps([s1, s2, s3]);
  };

  KINDS.drivers = function (sl, d, ctx) {
        var area = mkArea(sl, d, 'sheet'), items = d.items || [], rows = [], fns = d.footnotes || [];
    var box = el('div', 'drv');
    items.forEach(function (it) {
      var sign = String(it.sign || '+'), neg = /^[−-]/.test(sign), r = el('div', 'dr');
      r.innerHTML = '<div class="sg ' + (neg ? 'dn' : 'up') + '">' + esc(neg ? '−' : '+') + '</div><div class="dt" data-c>' + fmt(it.text) + (it.note ? '<sup>' + esc(it.note) + '</sup>' : '') + '</div><div class="dn2 ' + (neg ? 'dn' : 'up') + ' num" data-c>' + esc(it.num || '') + '</div>';
      box.appendChild(r); rows.push(r);
    });
    var fnEl = null;
    if (fns.length) { fnEl = el('div', 'dfn', fns.map(function (f) { return '<div data-c>' + esc(f) + '</div>'; }).join('')); box.appendChild(fnEl); }
    area.appendChild(box);
    var steps = rows.map(function (r) { return [trEnter(r, 0)]; });
    if (fnEl && steps.length) { fnEl.setAttribute('data-fade', '1'); steps[steps.length - 1].push(trEnter(fnEl, 100)); }
    ctx.setSteps(steps);
  };

  KINDS.term = function (sl, d, ctx) {
    var plate = d.style === 'plate', c = el('div', 'term blk' + (plate ? ' plate' : ''));
    if (d.aside) c.style.right = ASIDE_RIGHT;
    c.setAttribute('data-fit', 34); c.setAttribute('data-min', 24);
    var tail = (d.like ? '<div class="tlike" data-c><b>쉽게 말해</b>' + fmt(d.like) + '</div>' : '') + (d.example ? '<div class="tex" data-c>' + fmt(d.example) + '</div>' : '');
    c.innerHTML = plate ? '<div class="plateb"><div class="tw" data-c>' + fmt(d.word) + '</div><div class="pln"></div><div class="td" data-c>' + fmt(d.def) + '</div></div>' + tail
      : '<div class="tlab">용어 풀이</div><div class="tw" data-c>' + fmt(d.word) + '</div><div class="td" data-c>' + fmt(d.def) + '</div>' + tail;
    sl.appendChild(c);
    var q = function (s) { return c.querySelector(s); };
    if (plate) {
      var ps = [[trEnter(q('.plateb'), 0)]];
      if (tail) ps.push([q('.tlike') ? trEnter(q('.tlike'), 0) : null, q('.tex') ? trEnter(q('.tex'), 100) : null]);
      ctx.setSteps(ps); ctx.carryEl = q('.tw');
      return;
    }
    var s3 = q('.tlike') ? [trEnter(q('.tlike'), 0)] : [];
    if (q('.tex')) s3.push(trEnter(q('.tex'), 120));
    ctx.setSteps([[trEnter(q('.tw'), 0), trEnter(q('.tlab'), 0)], [trEnter(q('.td'), 0)]].concat(s3.length ? [s3] : []));
    ctx.carryEl = q('.tw');
  };

  var PG = [], APX = {};   /* 본문 쪽 번호(부록은 0) · 부록 번호 → 장 위치 */

  function pageLabel(i) { return SL[i].appendix ? '부록 ' + SL[i].appendix : String(PG[i]); }
  function firstLinker(id) {
    for (var k = 0; k < N; k++) {
      if (SL[k].appendix) continue;
      if ((SL[k].links || []).some(function (l) { return l.to === id; })) return k;
    }
    return -1;
  }

  /* i 번째 장 요소를 host 에 짓는다. isStatic = 움직임 없이 완성 모습(발표자 창 · 점검) */
  function buildSlide(i, host, isStatic) {
    var d = SL[i], kind = d.kind || 'statement';
    var cst = d.concl && d.concl.text ? (d.concl.style === 'band' ? 'cl-band' : d.concl.style === 'top' ? 'cl-top' : 'cl') : '';
    var CENTERK = { term: 1, statement: 1, question: 1, headline: 1 };
    var accN = (d.theme && d.theme.accent) || '';
    var mono = accN ? accN === 'mono' : DECK_MONO;
    var sl = el('section', 'sl B' + (cst ? ' ' + cst : '') + (d.keyStyle === 'weight' ? ' kw' : '') + (d.align === 'center' && CENTERK[kind] ? ' ac' : '') +
      (d.surface === 'open' ? ' sf-open' : d.surface === 'well' ? ' sf-well' : '') + (mono ? ' mono' : ''));
    var acc = accentOf(d.theme);
    if (acc) sl.style.setProperty('--c-acc', acc);
    sl.setAttribute('data-kind', kind);
    sl.setAttribute('data-i', i + 1);
    sl._tr = [null]; sl._steps = 0; sl._st = null; sl._post = [];
    var ctx = { i: i, isStatic: !!isStatic, own: false, carryEl: null, aside: null };

    sl._go = function (n, anim) {
      n = clamp(n, 0, sl._steps);
      var from = sl._st == null ? sl._steps : sl._st, k, j, tr;
      if (anim && n === from + 1 && !noMotion()) { flushAnim(); sl._st = n; play(sl._tr[n]); return; }
      flushAnim();
      if (n < from) {
        for (k = from; k > n; k--) { tr = sl._tr[k]; for (j = tr.length - 1; j >= 0; j--) tr[j].f(0); }
      } else {
        for (k = from + 1; k <= n; k++) { tr = sl._tr[k]; for (j = 0; j < tr.length; j++) tr[j].f(1); }
      }
      sl._st = n;
    };
    sl._setStep = function (n) { sl._go(n, false); };
    ctx.setSteps = function (arr) {
      var keep = sl._st, k, j;
      ctx.own = true;
      arr = arr.map(function (t) { return t.filter(Boolean); });
      if (ctx.aside && arr.length && d.steps !== false) arr[0] = arr[0].concat([trEnter(ctx.aside, 0)]);
      if (ctx.concl && d.steps !== false) {
        if (ctx.concl.classList.contains('top')) { if (arr.length) arr[0] = arr[0].concat([trEnter(ctx.concl, 0)]); else arr.push([trEnter(ctx.concl, 0)]); }   /* 요지 띠는 첫 단계 */
        else arr.push([trEnter(ctx.concl, 0)]);   /* 결론 띠는 마지막 단계 */
      }
      for (k = 0; k < arr.length; k++) { for (j = 0; j < arr[k].length; j++) arr[k][j].f(1); }  /* 끝 모습 확정 */
      if (d.steps === false) arr = [];
      sl._tr = [null].concat(arr); sl._steps = arr.length;
      sl._st = arr.length;
      if (keep != null && keep < arr.length) sl._go(keep, false);
    };

    host.appendChild(sl);
    if (kind !== 'cover' && kind !== 'part' && kind !== 'end') {
      var pg = el('div', 'pgn blk num', d.appendix ? '부록 ' + esc(d.appendix) : PG[i] + ' / ' + NM);
      sl.appendChild(pg);
    }
    header(sl, d);
    if (NAVTABS && d.part > 0 && !d.appendix && kind !== 'cover' && kind !== 'part' && kind !== 'end' && (META.parts || []).length > 1) {
      var tb = el('div', 'tabs blk');
      tb.innerHTML = (META.parts || []).map(function (p) { return '<i' + (p.no === d.part ? ' class="on"' : '') + '></i>'; }).join('');
      sl.appendChild(tb);
    }
    if (d.concl && d.concl.text) {
      var cl = el('div', 'concl blk' + (d.concl.style === 'band' ? ' band' : d.concl.style === 'top' ? ' top' : '') + (d.concl.tone === 'acc' && d.concl.style !== 'band' ? ' acc' : ''), '<span data-c>' + fmt(d.concl.text) + '</span>');
      if (d.concl.style === 'top') sl._post.push(function () { var hd = sl.querySelector('.hd'); if (hd) cl.style.top = (hd.offsetTop + hd.offsetHeight + 14) + 'px'; });
      cl.setAttribute('data-fade', '1');
      ctx.concl = cl;
    }
    if (d.aside) {
      var as = el('div', 'aside blk' + (kind === 'headline' ? ' full' : ''));
      as.setAttribute('data-fit', 24); as.setAttribute('data-min', 16);
      as.innerHTML = (d.aside.head ? '<div class="ah" data-c>' + fmt(d.aside.head) + '</div>' : '') + '<ul>' + (d.aside.points || []).map(function (p) { return '<li data-c>' + fmt(p) + '</li>'; }).join('') + '</ul>';
      ctx.aside = as;
    }
    (KINDS[kind] || KINDS.statement)(sl, d, ctx);
    if (ctx.aside) sl.appendChild(ctx.aside);
    if (ctx.concl) sl.appendChild(ctx.concl);
    if (!ctx.own) {
      /* 도식 · 비교 · 한 문장: data-st 칸을 단계로 */
      var nodes = sl.querySelectorAll('[data-st]'), max = 0, k2, steps = [];
      for (k2 = 0; k2 < nodes.length; k2++) max = Math.max(max, +nodes[k2].getAttribute('data-st'));
      for (k2 = 1; k2 <= max; k2++) steps.push([].filter.call(nodes, function (nd) { return +nd.getAttribute('data-st') === k2; }).map(function (nd) { return trEnter(nd, +nd.getAttribute('data-sd') || 0); }));
      ctx.setSteps(steps);
    }
    var srcTxt = plain(d.source || '') + (d.skeleton ? (d.source ? ' · ' : '') + '골격 ' + d.skeleton : '');
    if (srcTxt) sl.appendChild(el('div', 'src blk', esc(srcTxt)));
    sl.appendChild(el('div', 'lg blk', 'ECOM'));
    /* 본문 → 부록 고리 · 부록 → 본문 돌아가기 */
    if (d.links && d.links.length && !d.appendix) {
      var lk = el('div', 'lk blk');
      d.links.forEach(function (l) {
        var b = el('button', '', '<span data-c>' + esc(l.text) + '</span> →');
        b.type = 'button';
        b.addEventListener('click', function (e) { e.stopPropagation(); if (!ctx.isStatic && APX[l.to] != null) { lastMain = cur; show(APX[l.to], 0); } });
        lk.appendChild(b);
      });
      sl.appendChild(lk);
      if (srcTxt) sl.querySelector('.src').style.maxWidth = '640px';
    }
    if (d.appendix) {
      var bk = el('button', 'bk blk', '← 본문 <span data-c class="bkn"></span>장으로');
      bk.type = 'button';
      bk.addEventListener('click', function (e) { e.stopPropagation(); if (!ctx.isStatic) show(backTarget(i), 0); });
      sl.appendChild(bk);
      sl._bk = bk;
      setBack(sl, i);
      if (srcTxt) sl.querySelector('.src').style.maxWidth = '640px';
    }
    if (d.carry) {
      var ce = ctx.carryEl || sl.querySelector('.t');
      if (ce) ce.setAttribute('data-carry', d.carry);
    }
    fitAll(sl);
    return sl;
  }
  function backTarget(i) {
    var id = SL[i].appendix;
    if (lastMain >= 0 && !SL[lastMain].appendix && (SL[lastMain].links || []).some(function (l) { return l.to === id; })) return lastMain;
    var f = firstLinker(id);
    return f >= 0 ? f : 0;
  }
  function setBack(sl, i) {
    if (!sl._bk) return;
    var t = backTarget(i);
    sl._bk.querySelector('.bkn').textContent = PG[t] || '';
  }

  /* ---------- 읽기 겹 ---------- */
  function readHTML(d, i) {
    var r = d.read, h = '<div class="lab">' + esc(pageLabel(i)) + (d.appendix ? '' : ' / ' + NM) + ' · ' + esc(KIND_KO[d.kind] || '') + '</div><div class="rt">' + esc(ovTitle(d)) + '</div>';
    if (!r) return h + '<div class="rs">이 장에는 읽기 요약이 없습니다.</div>';
    h += '<div class="rh">' + fmt(r.head || '') + '</div>';
    if (r.points && r.points.length) h += '<ul>' + r.points.map(function (p) { return '<li>' + fmt(p) + '</li>'; }).join('') + '</ul>';
    if (r.table && r.table.cols) {
      h += '<table><thead><tr>' + r.table.cols.map(function (c) { return '<th>' + fmt(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        (r.table.rows || []).map(function (row) { return '<tr>' + row.map(function (c) { return '<td>' + fmt(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
    }
    if (r.source) h += '<div class="rs">' + esc(r.source) + '</div>';
    return h;
  }
  function ovTitle(d) {
    if (d.kind === 'part') return 'PART ' + d.part + ' ' + plain(d.name || partName(d.part).name || '');
    if (d.kind === 'headline') return plain(d.text || d.title || '');
    if (d.kind === 'term') return plain(d.word || '');
    return plain(d.title || d.label || d.name || '');
  }
  function toggleRead(force) {
    if (reading) return;
    var on = force != null ? force : !rdpEl;
    if (on && !rdpEl) {
      rdpEl = el('aside', 'rdbox');
      rdpEl.id = 'rdp';
      document.body.appendChild(rdpEl);
      document.body.classList.add('rd-open');
      rdpEl.innerHTML = readHTML(SL[cur], cur);
    } else if (!on && rdpEl) {
      rdpEl.parentNode.removeChild(rdpEl);
      rdpEl = null;
      document.body.classList.remove('rd-open');
    }
    fitDeck();
  }

  /* ---------- 개요 · 펜 · 레이저 ---------- */
  function toggleOverview(force) {
    var on = force != null ? force : !ovEl;
    if (on && !ovEl) {
      ovEl = el('div');
      ovEl.id = 'ov';
      SL.forEach(function (d, i) {
        var b = el('button', i === cur ? 'cur' : '', '<b>' + esc(pageLabel(i)) + '. ' + esc(ovTitle(d)) + '</b><small>' + esc(KIND_KO[d.kind] || '') + (d.appendix ? ' · 부록' : '') + '</small>');
        b.type = 'button';
        b.addEventListener('click', function () { toggleOverview(false); show(i, 0); });
        ovEl.appendChild(b);
      });
      document.body.appendChild(ovEl);
      var c = ovEl.querySelector('.cur');
      if (c && c.scrollIntoView) c.scrollIntoView({ block: 'center' });
    } else if (!on && ovEl) {
      ovEl.parentNode.removeChild(ovEl);
      ovEl = null;
    }
  }
  function penSize() {
    var dpr = window.devicePixelRatio || 1;
    penEl.width = Math.round(window.innerWidth * dpr);
    penEl.height = Math.round(window.innerHeight * dpr);
  }
  function penClear() {
    if (!penEl) return;
    penEl.getContext('2d').clearRect(0, 0, penEl.width, penEl.height);
  }
  function setPen(on) {
    if (reading) return;
    penOn = on;
    if (on && !penEl) {
      penEl = el('canvas');
      penEl.id = 'pen';
      penSize();
      var ctx = penEl.getContext('2d'), down = false;
      var col = getComputedStyle(document.documentElement).getPropertyValue('--c-pen').trim() || '#e2664c';
      function pt(e) { var r = penEl.getBoundingClientRect(); return [(e.clientX - r.left) * penEl.width / r.width, (e.clientY - r.top) * penEl.height / r.height]; }
      penEl.addEventListener('pointerdown', function (e) {
        down = true;
        try { penEl.setPointerCapture(e.pointerId); } catch (x) { noop(); }
        var p = pt(e);
        ctx.strokeStyle = col; ctx.lineWidth = 4 * (window.devicePixelRatio || 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0] + 0.1, p[1]); ctx.stroke();
        e.preventDefault();
      });
      penEl.addEventListener('pointermove', function (e) { if (!down) return; var p = pt(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p[0], p[1]); });
      penEl.addEventListener('pointerup', function () { down = false; });
      penEl.addEventListener('pointercancel', function () { down = false; });
      document.body.appendChild(penEl);
    }
    if (penEl) penEl.hidden = !on;
    toast(on ? '펜 켜짐 · D 로 끔' : '펜 꺼짐');
  }
  function setLaser(on) {
    if (reading) return;
    laserOn = on;
    document.body.classList.toggle('laser', on);
    if (!laserEl) {
      laserEl = el('div');
      laserEl.id = 'laser';
      document.body.appendChild(laserEl);
      document.addEventListener('pointermove', function (e) { if (laserOn) { laserEl.style.left = e.clientX + 'px'; laserEl.style.top = e.clientY + 'px'; } });
    }
    laserEl.hidden = !on;
    toast(on ? '레이저 켜짐 · L 로 끔' : '레이저 꺼짐');
  }
  function toggleFull() {
    try {
      var d = document;
      var p = d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen();
      if (p && p.catch) p.catch(function () { toast('전체 화면을 켤 수 없습니다'); });
    } catch (x) { toast('전체 화면을 켤 수 없습니다'); }
  }


  /* ---------- 이동 · 동기화 ---------- */
  /* 장 넘김은 바로 바꿈(cut). 앞 장과 같은 carry 이름의 요소만 자리를 옮김(FLIP). */
  function carryMap(card) {
    var m = {}, list = card.querySelectorAll('[data-carry]');
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.width && r.height) m[list[i].getAttribute('data-carry')] = { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    return m;
  }
  function carryFlip(old, card) {
    var sc = deckEl.getBoundingClientRect().width / 1280 || 1, list = card.querySelectorAll('[data-carry]'), tracks = [];
    [].forEach.call(list, function (n) {
      var o = old[n.getAttribute('data-carry')], r = n.getBoundingClientRect();
      if (!o || !r.width || !r.height) return;
      var dx = (o.left - r.left) / sc, dy = (o.top - r.top) / sc, k = o.width / r.width;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(k - 1) < 0.01) return;
      n.style.transformOrigin = '0 0';
      tracks.push(mk(T.scene, 'std', function (p) {
        if (p >= 1) { n.style.transform = ''; n.style.transformOrigin = ''; }
        else n.style.transform = 'translate(' + (dx * (1 - p)) + 'px,' + (dy * (1 - p)) + 'px) scale(' + lerp(k, 1, p) + ')';
      }, 0));
    });
    if (tracks.length) play(tracks);
  }
  function show(i, stp, silent, anim) {
    i = clamp(i, 0, N - 1);
    var c = cards[i], sl = c.sl, changed = i !== cur || !started, first = !started;
    stp = clamp(stp || 0, 0, sl._steps);
    if (changed) {
      flushAnim();
      var old = (!first && !reading && !noMotion() && cards[cur]) ? carryMap(cards[cur]) : null;
      cards.forEach(function (k, j) { k.classList.toggle('before', j < i); k.classList.toggle('on', j === i); });
      penClear(); hideTip();
      if (rdpEl) rdpEl.innerHTML = readHTML(SL[i], i);
      if (reading && started && c.scrollIntoView) c.scrollIntoView({ block: 'start' });
      var cc = ovEl && ovEl.querySelector('.cur');
      if (cc) cc.className = '';
      if (started && SL[cur] && !SL[cur].appendix) lastMain = cur;
      if (SL[i].appendix) setBack(sl, i);
      sl._go(reading || CHECK || STILL ? sl._steps : stp, false);
      if (old) carryFlip(old, c);
    } else {
      sl._go(reading || CHECK || STILL ? sl._steps : stp, !!anim && !reading);
    }
    cur = i; step = stp; started = true;
    if (navPos) navPos.textContent = pageLabel(i) + (SL[i].appendix ? '' : ' / ' + NM);
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (x) { noop(); }
    if (!silent) post({ type: 'state', i: cur, step: step });
    document.dispatchEvent(new CustomEvent('ecom:slide', { detail: { i: cur, step: step } }));
  }
  function next() {
    if (flushAnim()) return;                       /* 움직이는 중 클릭 = 그 단계를 바로 끝 상태로 */
    if (step < cards[cur].sl._steps) show(cur, step + 1, false, true);
    else if (cur < N - 1) show(cur + 1, 0);
  }
  function prev() {
    flushAnim();
    if (step > 0) show(cur, step - 1);
    else if (cur > 0) show(cur - 1, cards[cur - 1].sl._steps);
  }

  function post(msg) {
    msg.src = SID; msg.n = Date.now() + Math.random();
    try { if (bc) bc.postMessage(msg); } catch (x) { noop(); }
    try { localStorage.setItem(CH_NAME, JSON.stringify(msg)); } catch (x) { noop(); }
    try {
      if (PRESENTER) { if (window.opener && !window.opener.closed) window.opener.postMessage({ ecom: msg }, '*'); }
      else if (pw && !pw.closed) pw.postMessage({ ecom: msg }, '*');
    } catch (x) { noop(); }
  }
  function onMsg(m) {
    if (!m || m.src === SID) return;
    if (m.type === 'hello') { if (!PRESENTER && started) post({ type: 'state', i: cur, step: step }); }
    else if (m.type === 'state') {
      if (PRESENTER) presenterState(m.i, m.step);
      else if (m.i !== cur || m.step !== step) show(m.i, m.step, true, m.i === cur && m.step === step + 1);
    }
  }
  function openPresenter() {
    var base = location.href.split('#')[0].split('?')[0];
    pw = window.open(base + '?presenter', 'ecom-presenter', 'width=1180,height=720');
    if (!pw) { toast('팝업이 막혀 발표자 창을 열 수 없습니다'); return; }
    setTimeout(function () { post({ type: 'state', i: cur, step: step }); }, 600);
  }

  /* ---------- 화면 맞춤 ---------- */
  function fitDeck() {
    if (reading || CHECK || !stageEl) return;
    var sw = stageEl.clientWidth, sh = stageEl.clientHeight, s = Math.min(sw / 1280, sh / 720);
    deckEl.style.transform = 'translate(' + ((sw - 1280 * s) / 2) + 'px,' + ((sh - 720 * s) / 2) + 'px) scale(' + s + ')';
  }
  function layoutMode() {
    var narrow = !CHECK && window.innerWidth < 820, was = reading;
    reading = narrow;
    document.body.classList.toggle('reading', narrow);
    if (narrow) {
      if (rdpEl) toggleRead(false);
      var s = (window.innerWidth - 24) / 1280;
      document.documentElement.style.setProperty('--rs', s);
      document.documentElement.style.setProperty('--rh', (720 * s) + 'px');
      cards.forEach(function (c) { c.sl._setStep(c.sl._steps); });
    } else {
      deckEl.style.transform = '';
      fitDeck();
      if (was) cards[cur].sl._setStep(step);
    }
  }

  /* ---------- 점검 모드: 끝 상태에서 겹침 · 밖으로 나감 · 글자 크기를 잼 ---------- */
  function rectOf(e) { return e.getBoundingClientRect(); }
  function tagOf(e) {
    var c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '';
    return e.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/)[0] : '') + ' "' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 12) + '"';
  }
  function effOpacity(n, root, cache) {
    var o = 1, cur2 = n;
    while (cur2 && cur2 !== root && cur2.nodeType === 1) {
      var v = cache.get(cur2);
      if (v == null) {
        var cs = getComputedStyle(cur2);
        v = (cs.display === 'none' || cs.visibility === 'hidden') ? 0 : parseFloat(cs.opacity);
        cache.set(cur2, v);
      }
      o *= v;
      if (o < 0.05) return 0;
      cur2 = cur2.parentNode;
    }
    return o;
  }
  /* overflow:hidden 칸 밖으로 잘려 안 보이는 글줄은 재지 않음 */
  function clippedOut(p, sl, r, cache) {
    var cy = (r.top + r.bottom) / 2, cx = (r.left + r.right) / 2;
    for (var a = p; a && a !== sl && a.nodeType === 1; a = a.parentNode) {
      if (a._hid == null) { var cs = getComputedStyle(a); a._hid = cs.overflowX !== 'visible' || cs.overflowY !== 'visible'; }
      var ov = { hid: a._hid };
      if (ov.hid && a !== p) { var ar = rectOf(a); if (cy > ar.bottom + 1 || cy < ar.top - 1 || cx > ar.right + 1 || cx < ar.left - 1) return true; }
      else if (ov.hid) { var ar2 = rectOf(a); if (cy > ar2.bottom + 1 || cy < ar2.top - 1) return true; }
    }
    return false;
  }
  function textBoxes(sl, cache) {
    var out = [], w = document.createTreeWalker(sl, NodeFilter.SHOW_TEXT, null), n, rg = document.createRange();
    while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue;
      var p = n.parentNode;
      if (!p || p.nodeType !== 1 || (p.closest && p.closest('[data-nocheck]'))) continue;
      if (effOpacity(p, sl, cache) < 0.05) continue;
      rg.selectNodeContents(n);
      var fs = parseFloat(getComputedStyle(p).fontSize) || 16, rs = rg.getClientRects();
      for (var k = 0; k < rs.length; k++) {
        var r = rs[k];
        if (r.width < 2 || r.height < 2) continue;
        if (clippedOut(p, sl, r, cache)) continue;
        var cy = (r.top + r.bottom) / 2, h = Math.min(r.height, fs * 0.95);
        out.push({ n: n, el: p, x0: r.left, x1: r.right, y0: cy - h / 2, y1: cy + h / 2, t: n.nodeValue.trim().slice(0, 14) });
      }
    }
    return out;
  }
  function markShapes(sl, cache) {
    var out = [], list = sl.querySelectorAll('[data-mark]');
    for (var i = 0; i < list.length; i++) {
      var m = list[i], tag = m.tagName.toLowerCase();
      if (effOpacity(m, sl, cache) < 0.05) continue;
      var r = rectOf(m);
      if (!r.width && !r.height) continue;
      if ((tag === 'path' || tag === 'line') && m.getTotalLength) {
        var L = 0, ctm = m.getScreenCTM();
        try { L = m.getTotalLength(); } catch (x) { L = 0; }
        if (!ctm || !L) continue;
        var pts = [], st = Math.max(1, L / 300), cl = m.getAttribute('data-clip');
        cl = cl ? cl.split(',').map(Number) : null;
        for (var d = 0; d <= L; d += st) { var q = m.getPointAtLength(d); if (cl && (q.x < cl[0] || q.x > cl[0] + cl[2] || q.y < cl[1] || q.y > cl[1] + cl[3])) continue; pts.push([ctm.a * q.x + ctm.c * q.y + ctm.e, ctm.b * q.x + ctm.d * q.y + ctm.f]); }
        out.push({ el: m, pts: pts });
      } else if (r.width >= 1 && r.height >= 1) out.push({ el: m, r: r });
    }
    return out;
  }
  /* 강조색이 칠해진 보이는 요소(글 · 도형)의 가짓수. 같은 data-acc 이름은 한 가지로 셈 */
  function accentCount(sl, cache) {
    var pr = document.createElement('i');
    pr.style.cssText = 'display:none;color:var(--c-acc)';
    sl.appendChild(pr);
    var acc = getComputedStyle(pr).color;
    sl.removeChild(pr);
    var units = {}, kinds = {}, all = sl.querySelectorAll('*'), SH = { rect: 1, circle: 1, path: 1, polygon: 1, line: 1, ellipse: 1, polyline: 1 };
    for (var k = 0; k < all.length; k++) {
      var e = all[k], tag = e.tagName.toLowerCase(), cs = getComputedStyle(e), hit = false, own = false;
      for (var n = e.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && n.nodeValue.trim()) { own = true; break; } }
      if (isSvg(e)) {
        if (tag === 'text') hit = own && cs.fill === acc;
        else if (SH[tag]) hit = cs.fill === acc || (cs.stroke === acc && cs.strokeWidth !== '0px');
      } else {
        hit = (own && cs.color === acc) || cs.backgroundColor === acc;
      }
      if (!hit || e.closest('[data-nocheck]')) continue;
      var r = rectOf(e);
      if ((!r.width || !r.height) || effOpacity(e, sl, cache) < 0.05) continue;
      var a = e.closest('[data-acc]');
      var role = a ? 'u:' + a.getAttribute('data-acc') : 'e:' + (typeof e.className === 'string' && e.className ? e.className.split(/\s+/)[0] : tag);
      units[role] = 1;
      kinds[role + '|' + tag] = 1;
    }
    return { roles: Object.keys(units).length, count: Object.keys(kinds).length };
  }
  function measure(sl, i) {
    var R = rectOf(sl), out = { i: i + 1, page: pageLabel(i), kind: SL[i].kind, chars: 0, minFont: 0, accentCount: 0, accentRoles: 0, textOverlap: [], textOnMark: [], outside: [], overlap: [] };
    var seen = {}, minF = 999, cache = new Map();
    var cs = sl.querySelectorAll('[data-c]');
    for (var a = 0; a < cs.length; a++) {
      var t = (cs[a].textContent || '').replace(/\s+/g, '');
      if (t && !/^[\d.,%+\-−()~·\/:]+$/.test(t)) out.chars += t.length;
    }
    function flag(arr, msg) { if (!seen[msg] && arr.length < 8) { seen[msg] = 1; arr.push(msg); } }
    var all = sl.querySelectorAll('*');
    for (var k = 0; k < all.length; k++) {
      var e = all[k], r = rectOf(e);
      var own = false;
      for (var n = e.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && n.nodeValue.trim()) { own = true; break; } }
      if (own) { var fs = parseFloat(getComputedStyle(e).fontSize); if (fs && fs < minF) minF = fs; }
      if (!r.width && !r.height) continue;
      if (e.classList.contains('cen') || (e.tagName.toLowerCase() === 'svg' && e.classList.contains('under'))) continue;
      if (effOpacity(e, sl, cache) < 0.05) continue;
      if (e.hasAttribute('data-nocheck')) continue;
      if (r.left < R.left - 1 || r.right > R.right + 1 || r.top < R.top - 1 || r.bottom > R.bottom + 1) flag(out.outside, '화면 밖 ' + tagOf(e));
      var ar = e.closest && e.closest('.area, .aside');
      if (ar && ar !== e && e.tagName.toLowerCase() !== 'svg' && !e.hasAttribute('data-nocheck')) {
        var A = rectOf(ar);
        if (r.left < A.left - 1 || r.right > A.right + 1 || r.top < A.top - 1 || r.bottom > A.bottom + 1) flag(out.outside, '영역 밖 ' + tagOf(e));
      }
      if (e.hasAttribute('data-fit') && ((!e.hasAttribute('data-fitw') && e.scrollHeight > e.clientHeight + 1) || e.scrollWidth > e.clientWidth + 1)) flag(out.outside, '칸 넘침 ' + tagOf(e));
    }
    out.minFont = minF === 999 ? 0 : Math.round(minF * 10) / 10;
    var blocks = [].filter.call(sl.children, function (e) { return e.classList.contains('blk') && !e.classList.contains('tabs') && !e.classList.contains('bandbg'); });
    for (var p = 0; p < blocks.length; p++) {
      for (var q = p + 1; q < blocks.length; q++) {
        var r1 = rectOf(blocks[p]), r2 = rectOf(blocks[q]);
        var ix = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left), iy = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
        if (ix > 2 && iy > 2) flag(out.overlap, tagOf(blocks[p]) + ' × ' + tagOf(blocks[q]));
      }
    }
    /* 글 상자끼리 · 글과 데이터 표시(막대 · 점 · 선) 겹침 */
    var tb = textBoxes(sl, cache), ms = markShapes(sl, cache), u, v;
    for (u = 0; u < tb.length; u++) {
      if (tb[u].x0 < R.left - 1 || tb[u].x1 > R.right + 1 || tb[u].y0 < R.top - 1 || tb[u].y1 > R.bottom + 1) flag(out.outside, '글 밖 "' + tb[u].t + '"');
      for (v = u + 1; v < tb.length; v++) {
        if (tb[u].n === tb[v].n) continue;
        var ix2 = Math.min(tb[u].x1, tb[v].x1) - Math.max(tb[u].x0, tb[v].x0), iy2 = Math.min(tb[u].y1, tb[v].y1) - Math.max(tb[u].y0, tb[v].y0);
        if (ix2 > 2 && iy2 > 2) flag(out.textOverlap, '"' + tb[u].t + '" × "' + tb[v].t + '"');
      }
    }
    tb.forEach(function (t) {
      if (t.el.closest && t.el.closest('[data-inside]')) return;
      ms.forEach(function (m) {
        var hit = false;
        if (m.pts) {
          for (var z = 0; z < m.pts.length && !hit; z++) { var pt = m.pts[z]; if (pt[0] > t.x0 - 1 && pt[0] < t.x1 + 1 && pt[1] > t.y0 - 1 && pt[1] < t.y1 + 1) hit = true; }
        } else {
          var ix3 = Math.min(t.x1, m.r.right) - Math.max(t.x0, m.r.left), iy3 = Math.min(t.y1, m.r.bottom) - Math.max(t.y0, m.r.top);
          hit = ix3 > 2 && iy3 > 2;
        }
        if (hit) flag(out.textOnMark, '"' + t.t + '" 위 ' + tagOf(m.el));
      });
    });
    var ac = accentCount(sl, cache);
    out.accentCount = ac.count; out.accentRoles = ac.roles;
    var sr = sl.querySelector('.src');
    out.srcCut = !!(sr && sr.scrollHeight > sr.clientHeight + 1);   /* 출처 줄이 길어 잘림 */
    out.overflow = out.outside;   /* 1판 점검 도구(ecs.py)가 읽는 이름도 같은 값으로 */
    return out;
  }
  function runCheck() {
    document.body.classList.add('check', 'noanim');
    var res = [];
    cards.forEach(function (c, i) {
      c.classList.add('on');
      c.sl._go(c.sl._steps, false);
      fitAll(c.sl);
      res.push(measure(c.sl, i));
      c.classList.remove('on');
    });
    var pre = el('pre');
    pre.id = 'ecom-check';
    pre.hidden = true;
    pre.textContent = JSON.stringify({ slides: res });
    document.body.appendChild(pre);
  }

  /* ---------- 발표자 창 ---------- */
  var pres = {};
  function presenterState(i, s) {
    pres.i = clamp(i, 0, N - 1); pres.step = s || 0;
    presenterRender();
  }
  function mount(host, idx, stp) {
    host.innerHTML = '';
    if (idx < 0 || idx >= N) { host.textContent = '— 끝 —'; host.style.cssText += ';display:flex;align-items:center;justify-content:center'; return null; }
    host.style.display = '';
    var sl = buildSlide(idx, host, true);
    sl.style.transform = 'scale(' + (host.clientWidth / 1280) + ')';
    sl._setStep(stp);
    return sl;
  }
  function presenterRender() {
    var cs = mount(pres.cur, pres.i, 99);
    pres.steps = cs ? cs._steps : 0;
    pres.step = clamp(pres.step, 0, pres.steps);
    if (cs) cs._setStep(pres.step);
    mount(pres.nxt, pres.i + 1, 99);
    var d = SL[pres.i];
    pres.note.textContent = d.note || '(발표자 메모 없음)';
    var left = pres.steps - pres.step;
    pres.meta.textContent = pageLabel(pres.i) + (d.appendix ? '' : ' / ' + NM) + ' 장 · ' + (pres.steps ? '남은 단계 ' + left : '단계 없음');
  }
  function pNext() { if (pres.step < pres.steps) pres.step++; else if (pres.i < N - 1) { pres.i++; pres.step = 0; } else return; presenterRender(); post({ type: 'state', i: pres.i, step: pres.step }); }
  function pPrev() { if (pres.step > 0) pres.step--; else if (pres.i > 0) { pres.i--; pres.step = 999; } else return; presenterRender(); post({ type: 'state', i: pres.i, step: pres.step }); }
  function initPresenter() {
    document.body.classList.add('presenter', 'noanim');
    var root = el('div');
    root.id = 'pres';
    root.innerHTML = '<div class="pbox"><div class="lab">지금 화면</div><div class="pf" id="pcur"></div></div>' +
      '<div class="pside"><div class="pbox"><div class="lab">다음 화면</div><div class="pf" id="pnext"></div></div>' +
      '<div class="pbox" style="flex:1;min-height:0"><div class="lab">발표자 메모</div><div class="pnote" id="pnote"></div></div>' +
      '<div class="pbox"><div class="lab">지난 시간 (누르면 처음부터)</div><div class="ptime" id="ptime">00:00</div><div class="pmeta" id="pmeta"></div>' +
      '<div class="pbtn"><button type="button" id="pp">← 이전</button><button type="button" id="pn">다음 →</button></div></div></div>';
    document.body.appendChild(root);
    pres = { i: 0, step: 0, steps: 0, cur: root.querySelector('#pcur'), nxt: root.querySelector('#pnext'), note: root.querySelector('#pnote'), meta: root.querySelector('#pmeta') };
    var t0 = Date.now(), tm = root.querySelector('#ptime');
    setInterval(function () { var s = Math.floor((Date.now() - t0) / 1000); tm.textContent = pad2(Math.floor(s / 60)) + ':' + pad2(s % 60); }, 1000);
    tm.addEventListener('click', function () { t0 = Date.now(); });
    root.querySelector('#pp').addEventListener('click', pPrev);
    root.querySelector('#pn').addEventListener('click', pNext);
    try { var last = JSON.parse(localStorage.getItem(CH_NAME) || 'null'); if (last && last.type === 'state') { pres.i = clamp(last.i, 0, N - 1); pres.step = last.step || 0; } } catch (x) { noop(); }
    presenterRender();
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); pNext(); }
      else if (k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); pPrev(); }
      else if (k === 'Home') { pres.i = 0; pres.step = 0; presenterRender(); post({ type: 'state', i: 0, step: 0 }); }
      else if (k === 'End') { pres.i = N - 1; pres.step = 999; presenterRender(); post({ type: 'state', i: pres.i, step: pres.step }); }
    });
    window.addEventListener('resize', presenterRender);
    post({ type: 'hello' });
  }

  /* ---------- 키 · 손가락 ---------- */
  function gotoHud() {
    if (!gotoBuf) { if (gotoEl) { gotoEl.parentNode.removeChild(gotoEl); gotoEl = null; } return; }
    if (!gotoEl) { gotoEl = el('div'); gotoEl.id = 'goto'; document.body.appendChild(gotoEl); }
    gotoEl.textContent = gotoBuf + ' ⏎';
    clearTimeout(gotoTimer);
    gotoTimer = setTimeout(function () { gotoBuf = ''; gotoHud(); }, 3000);
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    var k = e.key, c = e.code;
    if (k === 'Escape') {
      if (tipEl && !tipEl.hidden) hideTip();
      else if (gotoBuf) { gotoBuf = ''; gotoHud(); }
      else if (ovEl) toggleOverview(false);
      else if (rdpEl) toggleRead(false);
      else if (penOn) setPen(false);
      else if (laserOn) setLaser(false);
      return;
    }
    if (reading) return;
    if (/^[0-9]$/.test(k)) { gotoBuf += k; if (gotoBuf.length > 3) gotoBuf = gotoBuf.slice(-3); gotoHud(); return; }
    if (k === 'Enter' && gotoBuf) { var n = parseInt(gotoBuf, 10); gotoBuf = ''; gotoHud(); if (n >= 1) { toggleOverview(false); show(n - 1, 0); } e.preventDefault(); return; }
    if (ovEl) { return; }
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); show(0, 0); }
    else if (k === 'End') { e.preventDefault(); show(NM - 1, 0); }
    else if (c === 'KeyO') toggleOverview();
    else if (c === 'KeyR') toggleRead();
    else if (c === 'KeyP') openPresenter();
    else if (c === 'KeyL') setLaser(!laserOn);
    else if (c === 'KeyD') setPen(!penOn);
    else if (c === 'KeyF') toggleFull();
  }

  /* ---------- 시작 ---------- */
  function init() {
    var node = document.getElementById('deck-data');
    try { DATA = JSON.parse(node.textContent); } catch (x) { document.body.textContent = '발표 데이터를 읽지 못했습니다.'; return; }
    var dth = DATA.theme || (DATA.meta || {}).theme || {};
    DECK_MONO = dth.accent === 'mono';
    NAVTABS = (DATA.nav || (DATA.meta || {}).nav || 'tabs') !== 'none';
    var deckAcc = accentOf(dth);
    if (deckAcc) document.documentElement.style.setProperty('--c-acc', deckAcc);
    META = DATA.meta || {}; GLOS = DATA.glossary || {}; FACTS = DATA.facts || {};
    /* 부록 장은 본문 뒤로 모음 · 쪽수에 안 셈 */
    var main = [], apx = [];
    (DATA.slides || []).forEach(function (s) { (s.appendix ? apx : main).push(s); });
    SL = main.concat(apx); N = SL.length; NM = main.length;
    SL.forEach(function (s, i) { PG[i] = s.appendix ? 0 : i + 1; if (s.appendix) APX[s.appendix] = i; });
    CH_NAME = 'ecom-deck:' + (META.session || '') + '|' + (META.title || '');
    try { if (typeof BroadcastChannel === 'function') { bc = new BroadcastChannel(CH_NAME); bc.onmessage = function (e) { onMsg(e.data); }; } } catch (x) { bc = null; }
    window.addEventListener('storage', function (e) { if (e.key === CH_NAME && e.newValue) { try { onMsg(JSON.parse(e.newValue)); } catch (x) { noop(); } } });
    window.addEventListener('message', function (e) { if (e.data && e.data.ecom) onMsg(e.data.ecom); });
    if (document.title === '' || !document.title) document.title = (META.session ? META.session + ' ' : '') + (META.title || 'ECOM');

    tipEl = el('div'); tipEl.id = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl);
    toastEl = el('div'); toastEl.id = 'toast'; toastEl.hidden = true; document.body.appendChild(toastEl);
    document.addEventListener('mouseover', function (e) {
      var g = e.target.closest && e.target.closest('.gl');
      if (g) showTip('<b>' + esc(g.getAttribute('data-g')) + '</b><br>' + esc(GLOS[g.getAttribute('data-g')] || '풀이가 없습니다'), e.clientX, e.clientY);
    });
    document.addEventListener('mouseout', function (e) { if (e.target.closest && e.target.closest('.gl')) hideTip(); });
    document.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('.gl');
      if (g) showTip('<b>' + esc(g.getAttribute('data-g')) + '</b><br>' + esc(GLOS[g.getAttribute('data-g')] || '풀이가 없습니다'), e.clientX, e.clientY);
      else if (!(e.target.closest && e.target.closest('.huge, svg'))) hideTip();
    });

    if (PRESENTER) { initPresenter(); return; }

    stageEl = el('div'); stageEl.id = 'stage';
    deckEl = el('div'); deckEl.id = 'deck';
    stageEl.appendChild(deckEl);
    document.body.appendChild(stageEl);
    if (NOA) document.body.classList.add('noanim');
    if (STILL) document.body.classList.add('still');
    SL.forEach(function (d, i) {
      var card = el('div', 'card'), frame = el('div', 'frame'), rd = el('div', 'rd rdbox');
      card.appendChild(frame);
      rd.innerHTML = readHTML(d, i);
      card.appendChild(rd);
      deckEl.appendChild(card);
      card.sl = buildSlide(i, frame, false);
      cards.push(card);
    });

    var nav = el('div');
    nav.id = 'nav';
    nav.innerHTML = '<button type="button" aria-label="이전">‹</button><span class="pos num"></span><button type="button" aria-label="다음">›</button>';
    navPos = nav.querySelector('.pos');
    nav.children[0].addEventListener('click', prev);
    nav.children[2].addEventListener('click', next);
    document.body.appendChild(nav);

    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', function () {
      layoutMode();
      if (penEl) penSize();
    });
    window.addEventListener('hashchange', function () {
      var n = parseInt(location.hash.slice(1), 10);
      if (n >= 1 && n - 1 !== cur) show(n - 1, 0);
    });
    var sx = 0, sy = 0, tracking = false;
    stageEl.addEventListener('touchstart', function (e) {
      tracking = !(e.target.closest && e.target.closest('button, .ctl, svg')) && e.touches.length === 1 && !reading;
      if (tracking) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }
    }, { passive: true });
    stageEl.addEventListener('touchend', function (e) {
      if (!tracking || penOn) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dy) < 60) { if (dx < 0) next(); else prev(); }
    }, { passive: true });

    layoutMode();
    var start = parseInt(location.hash.slice(1), 10);
    /* 처음 열면 끝 상태 */
    show(CHECK ? 0 : (start >= 1 && start <= N ? start - 1 : 0), 1e6, true);
    function after() {
      cards.forEach(function (c) { fitAll(c.sl); });
      charts.forEach(function (c) { c.render(); });
      if (CHECK) runCheck();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(after);
    else after();
  }

  window.ECOMDeck = {
    go: function (i, s) { show(i, s || 0); },
    next: next,
    prev: prev,
    state: function () { return { i: cur, step: step, total: N }; },
    check: function () { return JSON.parse(document.getElementById('ecom-check').textContent); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
