/* chain — 단계 가치사슬 : 셰브론 단계 4~6개, 단계마다 아래 100% 세로 막대(나라 · 기업 몫), 병목 단계 짙게 + 칩, 아래 결론 띠 한 줄
   stages[{name,sub,neck, shares:[{name,value,tone}] | firms:[{name,value}]}] — shares 가 있으면 몫 막대, 없고 firms 가 있으면 대표 기업 카드(value 는 글자 그대로)
   unit('%' 기본) · shareTitle('세계 몫', 막대 아래 작은 글) · neckChip('병목') · colors{이름:색 이름}(없으면 많이 나온 차례로) · concl('**굵게** 한 줄 결론', 선택) */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
function fit(s, size, maxW, bold, min) { while (size > (min || 11.5) && h.textW(s, size, bold) > maxW) size -= .5; return size }
ECOM.parts.chain = function (bd, s, ctx) {
  var st = (s.stages || []).slice(0, 6), n = st.length; if (!n) return;
  var svg = ctx.svg(512), unit = s.unit != null ? s.unit : '%', gx = 24, w = (1168 - 10 - (n - 1) * gx) / n, x0 = 0, cy = 78, ch = 68;
  var cnt = {}, order = []; st.forEach(function (q) { (q.shares || []).forEach(function (a) { if (!(a.name in cnt)) { cnt[a.name] = 0; order.push(a.name) } cnt[a.name] += +a.value || 0 }) });
  var REST = { '그 밖': 1, '기타': 1, '나머지': 1 }, PAL = ['cmp', 'main', 'dark', 'g65', 'g40'], cm = s.colors || {}, pi = 0, cc = {};
  order.slice().sort(function (a, b) { return cnt[b] - cnt[a] }).forEach(function (nm) { cc[nm] = cm[nm] ? h.col(cm[nm]) : REST[nm] ? C.light : (pi < PAL.length ? h.col(PAL[pi++]) : C.gray) });
  st.forEach(function (q, i) { var x = x0 + i * (w + gx), g = h.at(svg, i * 140, { 'data-fx': 'fade', 'data-ms': 360 }), neck = !!q.neck, tip = 20;
    var d = i ? 'M' + x + ' ' + (cy - ch / 2) + ' L' + (x + w - 14) + ' ' + (cy - ch / 2) + ' L' + (x + w + 6) + ' ' + cy + ' L' + (x + w - 14) + ' ' + (cy + ch / 2) + ' L' + x + ' ' + (cy + ch / 2) + ' L' + (x + tip) + ' ' + cy + ' Z'
      : 'M' + x + ' ' + (cy - ch / 2) + ' L' + (x + w - 14) + ' ' + (cy - ch / 2) + ' L' + (x + w + 6) + ' ' + cy + ' L' + (x + w - 14) + ' ' + (cy + ch / 2) + ' L' + x + ' ' + (cy + ch / 2) + ' Z';
    E('path', { d: d, fill: neck ? C.dark : C.main }, g);
    var tw = w - tip - 24, mx = x + (i ? tip : 0) + (w - (i ? tip : 0) - 14) / 2;
    T(g, mx, cy - (q.sub ? 4 : -6), q.name || '', { 'text-anchor': 'middle', 'font-size': fit(q.name || '', 17, tw, 1, 12.5), 'font-weight': 700, fill: '#fff' });
    if (q.sub) T(g, mx, cy + 18, q.sub, { 'text-anchor': 'middle', 'font-size': fit(q.sub, 12.5, tw, 0, 11.5), 'font-weight': 500, fill: C.g18 });
    if (neck) { var cg = h.at(svg, 900, { 'data-fx': 'pop', 'data-ms': 320 }), lab = s.neckChip || '병목', cw = h.textW(lab, 12.5, 1) + 20;
      E('rect', { x: mx - cw / 2, y: cy - ch / 2 - 30, width: cw, height: 23, rx: 11.5, fill: C.warn }, cg); T(cg, mx, cy - ch / 2 - 13, lab, { 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#fff' }) }
    var by = 150, bh = 250;
    if (q.shares && q.shares.length) { var bw = Math.min(70, w * .36), bx = x + Math.min(30, w * .12), lx = bx + bw + 10, lw = x + w - lx + 4, yy = by, tot = q.shares.reduce(function (a, b) { return a + (+b.value || 0) }, 0) || 100;
      q.shares.forEach(function (a, j) { var hh = bh * (+a.value || 0) / tot;
        E('rect', { x: bx, y: yy, width: bw, height: Math.max(1, hh - 2), rx: 2, fill: cc[a.name] || C.gray, 'data-at': 400 + i * 140 + j * 50, 'data-fx': 'grow', 'data-o': '50% 0%', 'data-ms': 380 }, svg);
        if (hh >= 17) { var txt = a.name + ' ' + h.nf(+a.value, 0) + unit, gl = h.at(svg, 560 + i * 140, { 'data-fx': 'fade' });
          T(gl, lx, yy + hh / 2 + 4.5, txt, { 'font-size': fit(txt, 13.5, lw, j === 0, 11.5), 'font-weight': j === 0 ? 700 : 500, fill: j === 0 ? C.ink : C.cmp }) }
        yy += hh });
      if (s.shareTitle) T(h.at(svg, 500 + i * 140, { 'data-fx': 'fade' }), bx, by + bh + 26, s.shareTitle, { 'font-size': 12, 'font-weight': 600, fill: C.mute }) }
    else if (q.firms && q.firms.length) { var fs = q.firms.slice(0, 3), fh = 70, fg = 10;
      fs.forEach(function (f, j) { var gf = h.at(svg, 420 + i * 140 + j * 90, { 'data-fx': 'rise', 'data-ms': 340 }), fy = by + j * (fh + fg), fw = w - 4;
        E('rect', { x: x + 2, y: fy, width: fw, height: fh, rx: 10, fill: neck ? C.g08 : C.paper }, gf); E('rect', { x: x + 2, y: fy + 12, width: 4, height: fh - 24, rx: 2, fill: neck ? C.dark : C.g65 }, gf);
        T(gf, x + 18, fy + 28, f.name || '', { 'font-size': fit(f.name || '', 14.5, fw - 28, 1, 12), 'font-weight': 700, fill: C.ink });
        T(gf, x + 18, fy + 54, f.value == null ? '' : String(f.value), { 'font-size': fit(String(f.value), 19, fw - 28, 1, 13), 'font-weight': 700, fill: neck ? C.dark : C.main }) }) } });
  if (s.concl) { var gc = h.at(svg, 1300, { 'data-fx': 'fade' }), parts = String(s.concl).split('**'), plain = parts.join(''), fs2 = fit(plain, 15, 1168 - 48, 0, 13);
    E('rect', { x: 0, y: 454, width: 1168, height: 48, rx: 10, fill: C.paper }, gc);
    var tx = E('text', { x: 20, y: 484, 'font-size': fs2, fill: C.cmp }, gc); parts.forEach(function (p, i) { if (!p) return; var ts = E('tspan', i % 2 ? { 'font-weight': 700, fill: C.dark } : {}, tx); ts.textContent = p }) }
};
})();
