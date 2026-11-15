/* p_label.js — label : 노랑 막대가 옆으로 펼쳐져 용어 라벨이 되는 설명 장. 본문 1168×512.
   term  : term(용어) · lines[2~3](풀이) · eg(보기, 선택) · fig{type:'bars'|'flow'} 왼쪽 도형
           bars {items:[{label,value}], hi:번호, unit}   flow {nodes:[이름 3~4], note}
   facts : items[{label,text}] 3~4개가 차례로 노랑 막대 → 라벨로 펼쳐짐(연혁 · 숫자)
   노랑 칸 = 용어 · 항목 이름. 움직임은 data-at · data-fx 만(기본 DOM = 끝 모습). */
ECOM.parts.label = function (el, s, ctx) {
  var h = ECOM.h, C = ECOM.C, Cd = ECOM.Cd, E = h.E, T = h.T, esc = h.esc, md = h.md, dk = ctx.dark, P = ctx.P, YEL = '#F2C46B', INK = '#1D2521';
  function D(css, html, attr) { return '<div style="position:absolute;' + css + '"' + (attr ? ' ' + attr : '') + '>' + (html == null ? '' : html) + '</div>' }
  var ly = s.layout === 'facts' ? 'facts' : 'term';
  if (ly === 'facts') { var it = (s.items || []).slice(0, 4), n = Math.max(1, it.length), rh = Math.min(116, Math.floor(440 / n)), top = 14, out = '';
    it.forEach(function (x, i) { var y = top + i * (rh + 10), at = 200 + i * 650;
      out += D('left:0;top:' + y + 'px;width:330px;height:' + rh + 'px;background:' + YEL + ';border-radius:6px;transform-origin:0 50%', '', 'data-at="' + at + '" data-fx="growx" data-ms="650" data-o="0% 50%"')
        + D('left:26px;top:' + y + 'px;height:' + rh + 'px;width:290px;display:flex;align-items:center;font-size:30px;font-weight:800;letter-spacing:-.03em;color:' + INK, md(x.label || ''), 'data-at="' + (at + 330) + '" data-fx="fade" data-ms="350" data-key="' + esc(String(x.label || '').replace(/\*\*/g, '')) + '"')
        + D('left:370px;top:' + y + 'px;right:0;height:' + rh + 'px;display:flex;align-items:center;font-size:27px;font-weight:500;line-height:1.45;color:' + P.ink + ';border-bottom:1.5px solid ' + (dk ? 'rgba(255,255,255,.16)' : C.line), md(x.text || ''), 'data-at="' + (at + 420) + '" data-fx="rise" data-ms="550"') });
    el.innerHTML = out + D('left:0;bottom:-6px;font-size:13px;color:' + P.mute, '노랑 칸 = 항목 이름', 'data-at="2600" data-fx="fade"'); return }
  /* term */
  var f = s.fig || {}, svg = E('svg', { viewBox: '0 0 460 512', width: 460, height: 512, style: 'position:absolute;left:0;top:0' }, el);
  var inkc = P.ink, sub = P.sub;
  if (f.type === 'flow') { var nd = (f.nodes || []).slice(0, 4), m = nd.length, bh = 66, gp = (400 - m * bh) / Math.max(1, m - 1);
    nd.forEach(function (t, i) { var y = 30 + i * (bh + gp), g = E('g', { 'data-at': 400 + i * 380, 'data-fx': 'rise' }, svg);
      E('rect', { x: 40, y: y, width: 380, height: bh, rx: 10, fill: i === m - 1 ? P.main : (dk ? Cd.g08 : C.g08), stroke: i === m - 1 ? 'none' : (dk ? Cd.line : C.g40), 'stroke-width': 1.5 }, g);
      T(g, 230, y + 42, t, { 'text-anchor': 'middle', 'font-size': 23, 'font-weight': 700, fill: i === m - 1 ? (dk ? '#003D2B' : '#fff') : inkc });
      if (i < m - 1) E('path', { d: 'M230 ' + (y + bh + 6) + ' V' + (y + bh + gp - 6) + ' m-7 -9 l7 9 l7 -9', fill: 'none', stroke: P.main, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-at': 700 + i * 380, 'data-fx': 'fade' }, svg) });
    if (f.note) T(svg, 230, 484, f.note, { 'text-anchor': 'middle', 'font-size': 14, fill: P.mute }) }
  else { var bi = (f.items || []).slice(0, 5), mx = Math.max.apply(null, bi.map(function (b) { return +b.value || 0 })) || 1, bw = 58, g2 = (400 - bi.length * bw) / Math.max(1, bi.length), base = 410;
    E('path', { d: 'M20 ' + base + ' H440', stroke: dk ? Cd.axis : C.axis, 'stroke-width': 2 }, svg);
    bi.forEach(function (b, i) { var x = 30 + i * (bw + g2) + g2 / 2 - 0, hh = 300 * (+b.value || 0) / mx, on = i === (f.hi == null ? bi.length - 1 : f.hi);
      E('rect', { x: x, y: base - hh, width: bw, height: hh, rx: 4, fill: on ? P.main : (dk ? Cd.g40 : C.g40), 'data-at': 400 + i * 160, 'data-fx': 'grow', 'data-ms': 600 }, svg);
      T(svg, x + bw / 2, base - hh - 10, h.nf(+b.value || 0, +f.dec || 0) + (f.unit || ''), { 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: on ? P.main : sub, 'data-at': 800 + i * 160, 'data-fx': 'fade' });
      T(svg, x + bw / 2, base + 30, b.label || '', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 600, fill: sub }) });
    T(svg, 230, 484, f.note || '진한 막대 = 이 용어가 가리키는 값', { 'text-anchor': 'middle', 'font-size': 14, fill: P.mute }) }
  var lines = (s.lines || []).slice(0, 3), lh = 86, y0 = 150;
  el.insertAdjacentHTML('beforeend',
    D('left:520px;top:20px;width:520px;height:84px;background:' + YEL + ';border-radius:6px;transform-origin:0 50%', '', 'data-at="300" data-fx="growx" data-ms="650" data-o="0% 50%"')
    + D('left:548px;top:20px;height:84px;display:flex;align-items:center;font-size:46px;font-weight:800;letter-spacing:-.04em;color:' + INK, md(s.term || ''), 'data-at="800" data-fx="fade" data-ms="350"')
    + lines.map(function (t, i) { return D('left:520px;right:0;top:' + (y0 + i * lh) + 'px;height:' + (lh - 8) + 'px;display:flex;align-items:center;font-size:28px;font-weight:500;line-height:1.45;color:' + P.ink + ';border-bottom:1.5px solid ' + (dk ? 'rgba(255,255,255,.16)' : C.line), md(t), 'data-at="' + (1100 + i * 380) + '" data-fx="rise" data-ms="550"') }).join('')
    + (s.eg ? D('left:520px;right:0;bottom:6px;height:84px;border-radius:10px;background:' + (dk ? Cd.g08 : C.g08) + ';padding:0 24px;display:flex;align-items:center;font-size:22px;line-height:1.45;color:' + sub, '<b style="color:' + P.main + ';margin-right:14px;flex:0 0 auto;white-space:nowrap">보기</b><span>' + md(s.eg) + '</span>'      , 'data-at="2400" data-fx="rise" data-ms="550"') : '')
    + D('left:520px;top:112px;font-size:13px;color:' + P.mute, '노랑 칸 = 용어', 'data-at="1000" data-fx="fade"')) };
ECOM.parts.label.layouts = ['default', 'term', 'facts'];
ECOM.parts.label.dark = ['default', 'term', 'facts'];
