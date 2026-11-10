/* ECOM 발표 엔진 — deck.json(<script id="deck-data">)을 읽어 그리고 돌린다.
   프레임워크 · 외부 주소 없음. 공개 이음새: window.ECOMDeck, document 의 'ecom:slide' 이벤트. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var LATEST_URL = 'https://raw.githubusercontent.com/0101-commits/ecom-slide/main/data/series.json';
  var Q = new URLSearchParams(location.search);
  var CHECK = Q.has('check');
  var PRESENTER = Q.has('presenter');
  var STILL = Q.has('still');
  var NOA = RM || CHECK || STILL;
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var KIND_KO = { cover: '표지', part: '간지', end: '끝', statement: '한 문장', number: '큰 숫자', chart: '차트', diagram: '도식', compare: '비교', question: '질문', table: '표' };

  var DATA, META, SL, GLOS, FACTS, N;
  var cards = [], charts = [], UPD = {}, votes = {};
  var cur = 0, step = 0, started = false;
  var deckEl, stageEl, tipEl, navPos, ovEl, rdpEl, penEl, laserEl, gotoEl, toastEl;
  var reading = false, penOn = false, laserOn = false, gotoBuf = '', gotoTimer = 0, toastTimer = 0;
  var SID = Math.random().toString(36).slice(2), CH_NAME = '', bc = null, pw = null;

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
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* 글 꾸밈: **강조** ^^경고^^ [[풀이]] \n */
  function fmt(s) {
    return esc(s).replace(/\\n/g, '\n')
      .replace(/\*\*([^*]+)\*\*/g, '<em>$1</em>')
      .replace(/\^\^([^^]+)\^\^/g, '<s>$1</s>')
      .replace(/\[\[([^\]]+)\]\]/g, '<span class="gl" tabindex="0" data-g="$1">$1</span>')
      .replace(/\n/g, '<br>');
  }
  function plain(s) { return String(s == null ? '' : s).replace(/\*\*|\^\^|\[\[|\]\]/g, '').replace(/\\n|\n/g, ' '); }
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

  /* 칸 안 글자가 넘치면 14px 까지 줄인다 */
  function fit(box) {
    var max = +box.getAttribute('data-fit') || 24, min = +box.getAttribute('data-min') || 14, fs = max;
    box.style.fontSize = fs + 'px';
    while (fs > min && (box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1)) {
      fs -= 1;
      box.style.fontSize = fs + 'px';
    }
  }
  function fitAll(root) {
    var list = root.querySelectorAll('[data-fit]:not([data-shrink])');
    for (var i = 0; i < list.length; i++) fit(list[i]);
    balance(root);
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
  function animDelay(i, gap) { return 'animation-delay:' + Math.round(i * gap) + 'ms'; }

  function Chart(host, d) {
    var ch = d.chart || {}, type = ch.type || 'bar', self = this;
    var S = (ch.series || []).map(function (s) {
      return { name: s.name || '', fact: s.fact || '', pts: (s.data || []).map(function (p) { return { l: String(p[0]), v: +p[1] }; }) };
    });
    var ranges = ch.ranges || null;
    var range = ch.range != null ? ch.range : (ranges && ranges.length ? ranges[0] : 0);
    var yoy = false;
    var ctl = el('div', 'ctl'), plot = el('div', 'plot'), upd = el('span', 'upd');
    var monthly = !!(S[0] && S[0].pts[0] && /^\d{4}\.\d{2}$/.test(S[0].pts[0].l));
    upd.hidden = true;
    if (S[0] && S[0].fact) upd.setAttribute('data-fact', S[0].fact);
    ctl.appendChild(upd);
    ctl.appendChild(el('span', 'gap'));
    var rbtn = [];
    if (ranges && ranges.length > 1 && (type === 'bar' || type === 'line')) {
      ranges.forEach(function (n) {
        var b = el('button', '', n === 0 ? '전체' : (monthly ? n + '개월' : '최근 ' + n));
        b.type = 'button';
        b.addEventListener('click', function () { range = n; sync(); self.render(true); });
        ctl.appendChild(b);
        rbtn.push([b, n]);
      });
    }
    var ybtn = null;
    if (ch.yoy && type === 'bar') {
      ybtn = el('button', '', '전년 같은 달');
      ybtn.type = 'button';
      ybtn.addEventListener('click', function () { yoy = !yoy; sync(); self.render(false); });
      ctl.appendChild(ybtn);
    }
    function sync() {
      rbtn.forEach(function (r) { r[0].setAttribute('aria-pressed', String(r[1] === range)); });
      if (ybtn) ybtn.setAttribute('aria-pressed', String(yoy));
    }
    sync();
    host.appendChild(ctl);
    host.appendChild(plot);
    this.S = S;

    this.render = function (anim) {
      plot.innerHTML = '';
      var W = plot.clientWidth, H = plot.clientHeight;
      if (!W || !H) return;
      var svg = sv('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': plain(d.title || '') });
      svg.setAttribute('class', anim && !NOA ? 'anim' : '');
      plot.appendChild(svg);
      var c = { svg: svg, W: W, H: H, S: S, range: range, yoy: yoy, unit: ch.unit || '', ch: ch, mk: 'm' + (++uidc) };
      if (type === 'hbar') drawHbar(c);
      else if (type === 'cumline') drawCum(c);
      else if (type === 'line') drawLine(c);
      else drawBar(c);
    };

    /* 온라인 최신 값 반영: 같은 기간 값이 다르면 갈아 끼우고 이전 값을 남김, 더 늦은 기간은 덧붙임 */
    this.refresh = function (ser) {
      var changed = false;
      S.forEach(function (s) {
        var f = s.fact && FACTS[s.fact], rs = f && ser[f.series];
        if (!rs || !rs.data || !f.value) return;
        var base = s.pts.filter(function (p) { return p.l === String(f.period); })[0];
        if (!base) return;
        var k = base.v / f.value, lastL = s.pts[s.pts.length - 1].l;
        rs.data.forEach(function (r) {
          var l = String(r[0]), v = +r[1] * k, p = s.pts.filter(function (q) { return q.l === l; })[0];
          if (p) { if (Math.abs(v - p.v) > 1e-6 * Math.max(1, Math.abs(p.v))) { p.old = p.v; p.v = v; changed = true; } }
          else if (l > lastL) { s.pts.push({ l: l, v: v, nw: true }); changed = true; }
        });
      });
      if (changed) self.render(false);
    };
    this.render(false);
  }
  var uidc = 0;

  function axes(c, geo, tk, Y) {
    var svg = c.svg;
    tk.ticks.forEach(function (t) {
      var y = Y(t);
      sv('line', { x1: geo.ml, x2: c.W - geo.mr, y1: y, y2: y, class: 'grid' }, svg);
      var tx = sv('text', { x: geo.ml - 10, y: y + 5, 'text-anchor': 'end', class: 'tk' }, svg);
      tx.textContent = tickText(t, tk.step);
    });
    if (c.unit) { var u = sv('text', { x: 0, y: 12, class: 'tk' }, svg); u.textContent = c.unit; }
  }

  function drawBar(c) {
    var svg = c.svg, W = c.W, H = c.H, ch = c.ch;
    var ml = 62, mr = 14, mt = 26, mb = 36;
    var pts = c.S[0] ? c.S[0].pts : [];
    var vis = c.range > 0 && c.range < pts.length ? pts.slice(-c.range) : pts;
    var n = vis.length;
    if (!n) return;
    var ann = ch.annotate || [];
    var vals = vis.map(function (p) { return p.v; });
    var mn = Math.min.apply(null, vals.concat(0)), mx = Math.max.apply(null, vals.concat(0));
    var span = (mx - mn) || 1;
    mx += span * (ann.length ? 0.3 : 0.12);
    if (mn < 0) mn -= span * 0.08;
    var tk = niceTicks(mn, mx, 4), lo = tk.lo, hi = tk.hi;
    var iw = W - ml - mr, ih = H - mt - mb;
    function Y(v) { return mt + (hi - v) / (hi - lo) * ih; }
    axes(c, { ml: ml, mr: mr }, tk, Y);
    var band = iw / n, bw = Math.min(band * 0.66, 64), y0 = Y(0);
    var byLabel = {};
    pts.forEach(function (p) { byLabel[p.l] = p.v; });
    var tipFn = function (i) {
      return function () {
        var p = vis[i];
        var h = '<b>' + esc(p.l) + '</b> · ' + vfmt(p.v) + ' ' + esc(c.unit);
        if (p.old != null) h += '<br><span class="old">이전 값 ' + vfmt(p.old) + '</span>';
        if (c.yoy) {
          var pv = byLabel[priorLabel(p.l)];
          if (pv != null) { var df = p.v - pv; h += '<br>전년 같은 달 ' + vfmt(pv) + ' → ' + (df >= 0 ? '▲ ' : '▼ ') + vfmt(Math.abs(df)); }
        }
        return h;
      };
    };
    var stepX = Math.max(1, Math.ceil((n > 14 ? 46 : 70) / band));
    var annIdx = {};
    ann.forEach(function (a) { annIdx[a.at] = true; });
    vis.forEach(function (p, i) {
      var x = ml + i * band + (band - bw) / 2, yv = Y(p.v);
      var r = sv('rect', {
        x: x, y: Math.min(y0, yv), width: bw, height: Math.max(1, Math.abs(y0 - yv)), rx: 2,
        class: 'g-bar f-' + colorFor(ch.colorBy, p.l) + (p.v < 0 ? ' neg' : ''), style: animDelay(i, 22)
      }, svg);
      r.setAttribute('data-i', i);
      if (n <= 14 || i === n - 1 || annIdx[p.l]) {
        var vt = sv('text', { x: x + bw / 2, y: p.v >= 0 ? yv - 7 : yv + 18, 'text-anchor': 'middle', class: 'vl g-fade', style: animDelay(i, 22) }, svg);
        vt.textContent = vfmt(p.v);
      }
      if ((i % stepX === 0 && n - 1 - i >= stepX) || i === n - 1) {
        var lt = sv('text', { x: x + bw / 2, y: H - 12, 'text-anchor': 'middle', class: 'tk' }, svg);
        lt.textContent = shortLabel(p.l);
      }
    });
    sv('line', { x1: ml, x2: W - mr, y1: y0, y2: y0, class: 'axis' }, svg);
    if (c.yoy) {
      vis.forEach(function (p, i) {
        var pv = byLabel[priorLabel(p.l)];
        if (pv == null) return;
        var x = ml + i * band + (band - bw) / 2;
        sv('line', { x1: x - 4, x2: x + bw + 4, y1: Y(pv), y2: Y(pv), class: 's-ink', 'stroke-width': 3, 'stroke-dasharray': '5 3' }, svg);
      });
    }
    ann.forEach(function (a, k) {
      var idx = -1;
      vis.forEach(function (p, i) { if (p.l === a.at) idx = i; });
      if (idx < 0) return;
      var bx = ml + (idx + 0.5) * band, by = Y(vis[idx].v) - 26;
      var tw = String(a.text).length * 18 + 6, ty = mt + 12 + k * 26, tx, anchor, sx;
      if (bx - 40 - tw > ml) { tx = bx - 36; anchor = 'end'; sx = tx + 8; }
      else { tx = bx + 36; anchor = 'start'; sx = tx - 8; }
      var mid = c.mk + 'a' + k;
      var defs = sv('defs', {}, svg), mk = sv('marker', { id: mid, markerWidth: 10, markerHeight: 10, refX: 8, refY: 5, orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs);
      sv('path', { d: 'M1,1 L9,5 L1,9 z', class: 'f-hot' }, mk);
      var g = sv('g', { class: 'g-fade', style: 'animation-delay:700ms' }, svg);
      var t = sv('text', { x: tx, y: ty, 'text-anchor': anchor, class: 'an' }, g);
      t.textContent = a.text;
      sv('path', { d: 'M' + sx + ',' + (ty - 6) + ' Q' + bx + ',' + (ty - 6) + ' ' + bx + ',' + Math.max(by, ty + 6), class: 'nofill s-hot', 'stroke-width': 2.5, 'marker-end': 'url(#' + mid + ')' }, g);
    });
    vis.forEach(function (p, i) {
      var h = sv('rect', { x: ml + i * band, y: mt, width: band, height: ih, class: 'hit' }, svg);
      bindTip(h, tipFn(i));
      h.addEventListener('mouseenter', function () { var r = svg.querySelector('.g-bar[data-i="' + i + '"]'); if (r) r.classList.add('hov'); });
      h.addEventListener('mouseleave', function () { var r = svg.querySelector('.g-bar[data-i="' + i + '"]'); if (r) r.classList.remove('hov'); });
    });
  }

  /* 선 그리기: 계열마다 [{x,y}] 목록(빈 곳은 null)을 받아 선 · 끝점 · 끝 이름표를 그린다 */
  function drawSeriesLines(c, lines, geo, anim) {
    var svg = c.svg, labels = [];
    lines.forEach(function (ln, si) {
      var d = '', last = null, open = false;
      ln.pts.forEach(function (p) {
        if (!p) { open = false; return; }
        d += (open ? 'L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
        open = true; last = p;
      });
      if (!last) return;
      sv('path', { d: d, pathLength: 1, class: 'g-line ' + ln.stroke, 'stroke-width': ln.w, style: animDelay(si, 160) }, svg);
      sv('circle', { cx: last.x, cy: last.y, r: ln.w + 1, class: 'g-fade ' + ln.fill, style: 'animation-delay:' + Math.round(900 + si * 100) + 'ms' }, svg);
      labels.push({ x: last.x + 14, y: last.y + 6, t: ln.name, cls: ln.tcls });
    });
    labels.sort(function (a, b) { return a.y - b.y; });
    for (var i = 1; i < labels.length; i++) { if (labels[i].y < labels[i - 1].y + 22) labels[i].y = labels[i - 1].y + 22; }
    labels.forEach(function (l, i) {
      var t = sv('text', { x: l.x, y: l.y, class: 'en g-fade ' + l.cls, style: 'animation-delay:' + Math.round(900 + i * 100) + 'ms' }, svg);
      t.textContent = l.t;
    });
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

  function drawLine(c) {
    var svg = c.svg, W = c.W, H = c.H;
    var base = c.S[0] ? c.S[0].pts : [];
    var cats = base.map(function (p) { return p.l; });
    if (c.range > 0 && c.range < cats.length) cats = cats.slice(-c.range);
    var n = cats.length;
    if (!n) return;
    var maxName = 0;
    c.S.forEach(function (s) { maxName = Math.max(maxName, String(s.name).length); });
    var ml = 62, mr = clamp(maxName * 17 + 26, 70, 220), mt = 26, mb = 36;
    var iw = W - ml - mr, ih = H - mt - mb;
    var all = [];
    c.S.forEach(function (s) { s.pts.forEach(function (p) { if (cats.indexOf(p.l) >= 0) all.push(p.v); }); });
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), sp = (mx - mn) || 1;
    var tk = niceTicks(mn >= 0 && mn < sp * 0.6 ? 0 : mn - sp * 0.05, mx + sp * 0.08, 4);
    function Y(v) { return mt + (tk.hi - v) / (tk.hi - tk.lo) * ih; }
    function X(i) { return n === 1 ? ml + iw / 2 : ml + i * iw / (n - 1); }
    axes(c, { ml: ml, mr: mr }, tk, Y);
    var stepX = Math.max(1, Math.ceil(54 / (iw / Math.max(1, n - 1))));
    cats.forEach(function (l, i) {
      if (i % stepX !== 0 && i !== n - 1) return;
      var t = sv('text', { x: X(i), y: H - 12, 'text-anchor': 'middle', class: 'tk' }, svg);
      t.textContent = shortLabel(l);
    });
    var lines = c.S.map(function (s, si) {
      var m = {};
      s.pts.forEach(function (p) { m[p.l] = p.v; });
      var k = 's' + (si % 4 + 1);
      return { name: s.name, stroke: 's-' + k, fill: 'f-' + k, tcls: 't-' + k, w: 4, pts: cats.map(function (l, i) { return m[l] == null ? null : { x: X(i), y: Y(m[l]) }; }) };
    });
    drawSeriesLines(c, lines, null, true);
    hoverGuide(c, { ml: ml, mt: mt, iw: iw, ih: ih }, n, X, function (i) {
      var h = '<b>' + esc(cats[i]) + '</b>';
      c.S.forEach(function (s) {
        var p = s.pts.filter(function (q) { return q.l === cats[i]; })[0];
        if (p) h += '<br>' + esc(s.name) + ' ' + vfmt(p.v) + ' ' + esc(c.unit) + (p.old != null ? ' <span class="old">(이전 ' + vfmt(p.old) + ')</span>' : '');
      });
      return h;
    });
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
    var ml = 62, mr = 80, mt = 26, mb = 36, iw = W - ml - mr, ih = H - mt - mb, cum = {}, mx = 0;
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
    axes(c, { ml: ml, mr: mr }, tk, Y);
    for (var m = 0; m < 12; m++) {
      var t = sv('text', { x: X(m), y: H - 12, 'text-anchor': 'middle', class: 'tk' }, svg);
      t.textContent = (m + 1) + '월';
    }
    var lines = [];
    years.forEach(function (y, k) {
      var rank = years.length - 1 - k;
      lines.push({
        name: y, w: rank === 0 ? 6 : 4, stroke: rank === 0 ? 's-acc' : rank === 1 ? 's-data' : 's-line',
        fill: rank === 0 ? 'f-acc' : rank === 1 ? 'f-data' : 'f-data', tcls: rank === 0 ? 't-acc' : 't-mute',
        pts: cum[y].map(function (v, i) { return { x: X(i), y: Y(v) }; })
      });
    });
    lines.reverse();
    drawSeriesLines(c, lines, null, true);
    hoverGuide(c, { ml: ml, mt: mt, iw: iw, ih: ih }, 12, X, function (i) {
      var h = '<b>' + (i + 1) + '월까지 누적</b>';
      years.slice().reverse().forEach(function (y) { if (cum[y][i] != null) h += '<br>' + y + ' ' + vfmt(cum[y][i]) + ' ' + esc(c.unit); });
      return h;
    });
  }

  function drawHbar(c) {
    var svg = c.svg, W = c.W, H = c.H, pts = c.S[0] ? c.S[0].pts : [], n = pts.length;
    if (!n) return;
    var vals = pts.map(function (p) { return p.v; });
    var mn = Math.min.apply(null, vals.concat(0)), mx = Math.max.apply(null, vals.concat(0)), signed = mn < 0;
    var maxL = 0;
    pts.forEach(function (p) { maxL = Math.max(maxL, p.l.length); });
    var lw = clamp(maxL * 20 + 16, 110, 300), ml = lw + (signed ? 84 : 0), mr = 96, mt = 4, mb = 4;
    var iw = W - ml - mr, row = (H - mt - mb) / n, bh = Math.min(row * 0.62, 40);
    function X(v) { return ml + (v - mn) / ((mx - mn) || 1) * iw; }
    var x0 = X(0);
    pts.forEach(function (p, i) {
      var cy = mt + row * (i + 0.5), x1 = X(p.v), col = c.ch.colorBy && colorFor(c.ch.colorBy, p.l);
      var cls = col && col !== 'data' || (col === 'data' && c.ch.colorBy && c.ch.colorBy[p.l]) ? col : (p.v < 0 ? 'hot' : 'acc');
      var lt = sv('text', { x: lw - 10, y: cy + 7, 'text-anchor': 'end', class: 'hl' }, svg);
      lt.textContent = p.l;
      var r = sv('rect', { x: Math.min(x0, x1), y: cy - bh / 2, width: Math.max(1, Math.abs(x1 - x0)), height: bh, rx: 2, class: 'g-hbar f-' + cls + (p.v < 0 ? ' neg' : ''), style: animDelay(i, 60) }, svg);
      var vt = sv('text', { x: p.v >= 0 ? x1 + 10 : x1 - 10, y: cy + 7, 'text-anchor': p.v >= 0 ? 'start' : 'end', class: 'hv g-fade ' + (p.v < 0 ? 't-s2' : 't-acc'), style: animDelay(i, 60) }, svg);
      vt.textContent = (signed && p.v > 0 ? '+' : '') + vfmt(p.v);
      var hit = sv('rect', { x: 0, y: cy - row / 2, width: W, height: row, class: 'hit' }, svg);
      bindTip(hit, function () { return '<b>' + esc(p.l) + '</b> · ' + vfmt(p.v) + ' ' + esc(c.unit); });
      hit.addEventListener('mouseenter', function () { r.classList.add('hov'); });
      hit.addEventListener('mouseleave', function () { r.classList.remove('hov'); });
    });
    sv('line', { x1: x0, x2: x0, y1: 0, y2: H, class: 'axis' }, svg);
  }

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
        stMark(sv('circle', { cx: cen[k][0], cy: cen[k][1], r: dd / 2, class: 'f-s' + (k + 1), 'fill-opacity': 0.32, stroke: 'none' }, svg), k + 1, steps);
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
      if (ps.length) {
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
      sl.appendChild(titleBlk(d));
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
      var fmtV = function (v) { return Number(v).toLocaleString('ko-KR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      c.innerHTML = '<div class="nl" data-c>' + fmt(d.label) + '</div><div class="huge"><span class="v">' + fmtV(d.value) + '</span><small>' + esc(d.unit || '') + '</small></div><div class="hsub" data-c>' + fmt(d.sub) + '</div>';
      var huge = c.querySelector('.huge'), v = c.querySelector('.v');
      if (d.fact) {
        huge.setAttribute('data-fact', d.fact);
        var badge = el('span', 'upd'); badge.hidden = true; badge.setAttribute('data-fact', d.fact);
        huge.appendChild(badge);
        huge.title = '누르면 숫자의 출처';
        huge.addEventListener('click', function (e) {
          e.stopPropagation();
          var f = FACTS[d.fact] || {}, u = UPD[d.fact];
          var h = '<b>' + esc(f.source || d.source || '출처 없음') + '</b><br>기준 ' + esc(f.period || META.asof || '') + (f.value != null ? ' · ' + vfmt(f.value) + ' ' + esc(f.unit || '') : '');
          if (u) h += '<br>최신 ' + esc(u.period) + ' · ' + vfmt(u.value) + ' ' + esc(f.unit || '');
          showTip(h, e.clientX, e.clientY);
        });
      }
      sl.appendChild(c);
      ctx.enters.push(function () {
        if (NOA || ctx.isStatic) { v.textContent = fmtV(d.value); return; }
        var t0 = performance.now(), dur = 1100, target = +d.value;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          v.textContent = fmtV(target * e);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    },
    chart: function (sl, d, ctx) {
      sl.appendChild(titleBlk(d));
      var area = el('div', 'area chartarea blk');
      sl.appendChild(area);
      var chart = new Chart(area, d);
      charts.push(chart);
      ctx.enters.push(function () { chart.render(!ctx.isStatic); });
    },
    diagram: function (sl, d) {
      sl.appendChild(titleBlk(d));
      var area = el('div', 'area blk'), host = area;
      sl.appendChild(area);
      if (d.layout !== 'skeleton') { host = el('div', 'cen'); area.appendChild(host); }
      layoutDiagram(host, d, area.clientWidth, area.clientHeight);
    },
    compare: function (sl, d) {
      sl.appendChild(titleBlk(d));
      var area = el('div', 'area blk'), mid = 120;
      sl.appendChild(area);
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
      if (d.vs) { var vs = el('div', 'vs', '<span data-c>' + fmt(d.vs) + '</span>'); vs.style.left = (W / 2) + 'px'; area.appendChild(stMark(vs, 2, d.steps)); }
    },
    question: function (sl, d, ctx) {
      sl.appendChild(titleBlk(d));
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
    table: function (sl, d) {
      sl.appendChild(titleBlk(d));
      var area = el('div', 'area blk');
      area.setAttribute('data-fit', 26);
      var hi = d.hi == null ? [] : [].concat(d.hi);
      var html = '<table class="tbl"><thead><tr>' + (d.cols || []).map(function (c) { return '<th>' + fmt(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
      (d.rows || []).forEach(function (r, i) {
        html += '<tr>' + r.map(function (c) { return '<td>' + fmt(c) + '</td>'; }).join('') + '</tr>';
      });
      area.innerHTML = html + '</tbody></table>';
      var trs = area.querySelectorAll('tbody tr');
      hi.forEach(function (i) { if (trs[i]) trs[i].className = 'hi'; });
      sl.appendChild(area);
    }
  };

  function titleBlk(d) {
    var t = el('h2', 't blk', '');
    t.innerHTML = '<span data-c>' + fmt(d.title) + '</span>';
    t.setAttribute('data-fit', 52);
    t.setAttribute('data-min', 40);
    return t;
  }

  /* i 번째 장 요소를 host 에 짓는다. isStatic = 움직임 없이 완성 모습(발표자 창 · 점검) */
  function buildSlide(i, host, isStatic) {
    var d = SL[i], kind = d.kind || 'statement';
    var sl = el('section', 'sl B');
    sl.setAttribute('data-kind', kind);
    sl.setAttribute('data-i', i + 1);
    var ctx = { i: i, enters: [], isStatic: !!isStatic };
    var top = el('div', 'top blk');
    top.innerHTML = '<span class="lb">' + topLabel(d) + '</span><span class="bar"><i style="width:' + ((i + 1) / N * 100).toFixed(1) + '%"></i></span><span class="pg num">' + (i + 1) + ' / ' + N + '</span>';
    sl.appendChild(top);
    host.appendChild(sl);
    (KINDS[kind] || KINDS.statement)(sl, d, ctx);
    var srcTxt = plain(d.source || '') + (d.skeleton ? (d.source ? ' · ' : '') + '골격 ' + d.skeleton : '');
    if (srcTxt) sl.appendChild(el('div', 'src blk', esc(srcTxt)));
    sl.appendChild(el('div', 'lg blk', 'ECOM'));
    fitAll(sl);
    var nodes = sl.querySelectorAll('[data-st]'), max = 0;
    for (var k = 0; k < nodes.length; k++) max = Math.max(max, +nodes[k].getAttribute('data-st'));
    sl._steps = max;
    sl._setStep = function (n) {
      for (var j = 0; j < nodes.length; j++) nodes[j].classList.toggle('st-hide', +nodes[j].getAttribute('data-st') > n);
    };
    sl._enter = function () { ctx.enters.forEach(function (f) { f(); }); };
    sl._setStep(max);
    return sl;
  }

  /* ---------- 읽기 겹 ---------- */
  function readHTML(d, i) {
    var r = d.read, h = '<div class="lab">' + (i + 1) + ' / ' + N + ' · ' + esc(KIND_KO[d.kind] || '') + '</div><div class="rt">' + esc(ovTitle(d)) + '</div>';
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
        var b = el('button', i === cur ? 'cur' : '', '<b>' + (i + 1) + '. ' + esc(ovTitle(d)) + '</b><small>' + esc(KIND_KO[d.kind] || '') + '</small>');
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
  function transOf(i) {
    var d = SL[i];
    return d.transition || ({ part: 'zoom', question: 'fade', end: 'fade' })[d.kind] || 'slide';
  }
  function show(i, stp, silent) {
    i = clamp(i, 0, N - 1);
    var c = cards[i], sl = c.sl, changed = i !== cur || !started;
    stp = clamp(stp || 0, 0, sl._steps);
    if (changed) {
      deckEl.setAttribute('data-t', transOf(i));
      if (!reading) sl._enter();
    }
    sl._setStep(reading || CHECK || STILL ? sl._steps : stp);
    if (changed) {
      cards.forEach(function (k, j) { k.classList.toggle('before', j < i); k.classList.toggle('on', j === i); });
      penClear(); hideTip();
      if (rdpEl) rdpEl.innerHTML = readHTML(SL[i], i);
      if (reading && started && c.scrollIntoView) c.scrollIntoView({ block: 'start' });
      var cc = ovEl && ovEl.querySelector('.cur');
      if (cc) cc.className = '';
    }
    cur = i; step = stp; started = true;
    if (navPos) navPos.textContent = (i + 1) + ' / ' + N;
    try { history.replaceState(null, '', '#' + (i + 1)); } catch (x) { noop(); }
    if (!silent) post({ type: 'state', i: cur, step: step });
    document.dispatchEvent(new CustomEvent('ecom:slide', { detail: { i: cur, step: step } }));
  }
  function next() {
    if (step < cards[cur].sl._steps) show(cur, step + 1);
    else if (cur < N - 1) show(cur + 1, 0);
  }
  function prev() {
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
      else if (m.i !== cur || m.step !== step) show(m.i, m.step, true);
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
      if (!was) observeReading();
    } else {
      deckEl.style.transform = '';
      fitDeck();
      if (was) cards[cur].sl._setStep(step);
    }
  }
  var io = null;
  function observeReading() {
    if (!window.IntersectionObserver) { cards.forEach(function (c) { c.sl._enter(); }); return; }
    if (io) return;
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !e.target._seen) { e.target._seen = true; e.target.sl._enter(); } });
    }, { threshold: 0.35 });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* ---------- 최신 값(온라인) ---------- */
  function applyUpdates(latest) {
    var ser = latest && latest.series;
    if (!ser) return;
    Object.keys(FACTS).forEach(function (k) {
      var f = FACTS[k], rs = ser[f.series];
      if (!rs || !rs.data || !rs.data.length) return;
      var last = rs.data[rs.data.length - 1], u = null;
      if (String(last[0]) > String(f.period)) u = { period: String(last[0]), value: +last[1] };
      else {
        var m = rs.data.filter(function (r) { return String(r[0]) === String(f.period); })[0];
        if (m && Math.abs(+m[1] - f.value) > 1e-6 * Math.max(1, Math.abs(f.value))) u = { period: String(f.period), value: +m[1], old: f.value };
      }
      if (u) UPD[k] = u;
    });
    charts.forEach(function (c) { c.refresh(ser); });
    var bs = document.querySelectorAll('.upd[data-fact]');
    for (var i = 0; i < bs.length; i++) {
      var u2 = UPD[bs[i].getAttribute('data-fact')];
      if (u2) { bs[i].textContent = '갱신 ' + u2.period; bs[i].hidden = false; }
    }
  }
  function fetchLatest() {
    if (CHECK || STILL || PRESENTER || !window.fetch || navigator.onLine === false || !Object.keys(FACTS).length) return;
    var ac = window.AbortController ? new AbortController() : null;
    var tm = setTimeout(function () { if (ac) ac.abort(); }, 4000);
    fetch(LATEST_URL, { cache: 'no-cache', signal: ac ? ac.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { clearTimeout(tm); if (j) { try { applyUpdates(j); } catch (x) { noop(); } } })
      .catch(function () { clearTimeout(tm); });
  }

  /* ---------- 점검 모드 ---------- */
  function rectOf(e) { return e.getBoundingClientRect(); }
  function tagOf(e) {
    var c = typeof e.className === 'string' ? e.className : (e.className && e.className.baseVal) || '';
    return e.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/)[0] : '') + ' "' + (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 12) + '"';
  }
  function measure(sl, i) {
    var R = rectOf(sl), out = { i: i + 1, kind: SL[i].kind, chars: 0, minFont: 0, overflow: [], overlap: [] };
    var seen = {}, minF = 999;
    var cs = sl.querySelectorAll('[data-c]');
    for (var a = 0; a < cs.length; a++) {
      var t = (cs[a].textContent || '').replace(/\s+/g, '');
      if (t && !/^[\d.,%+\-−()~·\/:]+$/.test(t)) out.chars += t.length;
    }
    function flag(msg) { if (!seen[msg] && out.overflow.length < 8) { seen[msg] = 1; out.overflow.push(msg); } }
    var all = sl.querySelectorAll('*');
    for (var k = 0; k < all.length; k++) {
      var e = all[k], r = rectOf(e);
      var own = false;
      for (var n = e.firstChild; n; n = n.nextSibling) { if (n.nodeType === 3 && n.nodeValue.trim()) { own = true; break; } }
      if (own) { var fs = parseFloat(getComputedStyle(e).fontSize); if (fs && fs < minF) minF = fs; }
      if (!r.width && !r.height) continue;
      if (e.classList.contains('cen') || (e.tagName.toLowerCase() === 'svg' && e.classList.contains('under'))) continue;
      if (r.left < R.left - 1 || r.right > R.right + 1 || r.top < R.top - 1 || r.bottom > R.bottom + 1) flag('화면 밖 ' + tagOf(e));
      var ar = e.closest && e.closest('.area');
      if (ar && ar !== e && e.tagName.toLowerCase() !== 'svg') {
        var A = rectOf(ar);
        if (r.left < A.left - 1 || r.right > A.right + 1 || r.top < A.top - 1 || r.bottom > A.bottom + 1) flag('영역 밖 ' + tagOf(e));
      }
      if (e.hasAttribute('data-fit') && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1)) flag('칸 넘침 ' + tagOf(e));
    }
    out.minFont = minF === 999 ? 0 : Math.round(minF * 10) / 10;
    var blocks = [].filter.call(sl.children, function (e) { return e.classList.contains('blk'); });
    for (var p = 0; p < blocks.length; p++) {
      for (var q = p + 1; q < blocks.length; q++) {
        var r1 = rectOf(blocks[p]), r2 = rectOf(blocks[q]);
        var ix = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left), iy = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
        if (ix > 2 && iy > 2 && out.overlap.length < 8) out.overlap.push(tagOf(blocks[p]) + ' × ' + tagOf(blocks[q]));
      }
    }
    return out;
  }
  function runCheck() {
    document.body.classList.add('check', 'noanim');
    var res = [];
    cards.forEach(function (c, i) {
      c.classList.add('on');
      c.sl._enter();
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
    sl._enter();
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
    pres.meta.textContent = (pres.i + 1) + ' / ' + N + ' 장 · ' + (pres.steps ? '남은 단계 ' + left : '단계 없음');
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
    else if (k === 'End') { e.preventDefault(); show(N - 1, 0); }
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
    META = DATA.meta || {}; SL = DATA.slides || []; GLOS = DATA.glossary || {}; FACTS = DATA.facts || {}; N = SL.length;
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
    show(CHECK ? 0 : (start >= 1 && start <= N ? start - 1 : 0), 0, true);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { cards.forEach(function (c) { fitAll(c.sl); }); if (CHECK) runCheck(); });
    } else if (CHECK) runCheck();
    fetchLatest();
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
