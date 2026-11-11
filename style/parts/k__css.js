/* 도식 부품(k_*.js) 공통 — <style id="k-parts-css"> 한 번 넣기 + 공통 도움 ECOM.kx(상자 · 화살촉 · 줄 수 · 작은 차트)
   이름순으로 k_axis 등보다 먼저 붙음. 형식 = style/SCHEMA3_diagrams.md */
(function () {
'use strict';
var h = ECOM.h, C = ECOM.C, E = h.E, T = h.T;
var CSS = [
'.kx{position:absolute;box-sizing:border-box}',
'.kx span b,.kx p b,.kx .k-axr b,.kx .k-tmd b,.k-tmd b{font-weight:700;color:var(--gdk)}',
'.k-dimx{transition:filter .35s ease}.k-dim{filter:opacity(.24) saturate(.3)}',
'.k-axcc span b,.k-cot span b,.k-lgo.on span b{color:var(--gon)}',
/* axis */
'.k-axp{border-radius:18px;background:var(--g08);overflow:hidden}.k-axp.r{background:var(--paper)}',
'.k-axh{position:absolute;top:18px}.k-axt{font-size:21px;font-weight:700;letter-spacing:-.01em;line-height:1.3}',
'.k-axd{font-size:16px;font-weight:700;color:var(--ink);margin-top:6px;line-height:1.42}.k-axs{font-size:13.5px;color:var(--mute);margin-top:4px;line-height:1.45}',
'.k-axc{border-radius:14px;background:#fff;box-shadow:0 2px 12px rgba(0,60,40,.09)}',
'.k-axct{display:flex;align-items:center;justify-content:center;text-align:center;font-size:15.5px;font-weight:700;color:var(--ink);padding:0 12px;line-height:1.35}',
'.k-axl{display:flex;align-items:center;justify-content:center;text-align:center;font-size:15px;font-weight:700;color:var(--ink);padding:0 12px;line-height:1.35}',
'.k-axr{display:flex;align-items:center;justify-content:flex-end;text-align:right;padding:0 22px 0 6px;border-top:1px dashed #BFC8C3;font-size:15px;font-weight:600;color:var(--ink);line-height:1.45}',
'.k-axr.r{justify-content:flex-start;text-align:left;padding:0 6px 0 22px}.k-axr.last{border-bottom:1px dashed #BFC8C3}',
'.k-axx{display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--cmp);color:#fff;font-size:14px;font-weight:700}',
'.k-axe{border-radius:12px;background:#fff;padding:14px 20px 12px;display:flex;flex-direction:column;gap:8px;border:1px solid var(--line)}',
'.k-axel{font-size:15px;font-weight:700;color:var(--ink);line-height:1.45}.k-axel b{color:var(--gdk)}',
'.k-axul{display:flex;flex-direction:column;gap:6px}.k-axli{padding-left:14px;position:relative;line-height:1.45}',
'.k-axli:before{content:"";position:absolute;left:0;top:8px;width:6px;height:6px;background:var(--cmp)}',
'.k-axk{font-size:14px;font-weight:700;color:var(--ink)}.k-axv{font-size:14px;color:var(--sub)}.k-axv b{color:var(--ink)}',
'.k-axec{margin-top:auto;text-align:center;font-size:15px;font-weight:700;color:var(--gdk);line-height:1.45;border-top:1px solid var(--line);padding-top:9px}.k-axec.r{color:var(--cmp)}',
'.k-axcc{display:flex;align-items:center;justify-content:center;text-align:center;border-radius:12px;background:var(--gdk);color:#fff;font-size:15.5px;font-weight:700;padding:0 18px;line-height:1.4}.k-axcc.r{background:var(--cmp)}',
/* stairs */
'.k-stin{border:1.5px solid var(--g40);border-radius:12px;background:#fff;padding:10px 20px;display:flex;flex-direction:column;justify-content:center;gap:4px}',
'.k-stit{font-size:17px;font-weight:700;color:var(--gdk)}.k-sttx{font-size:14px;color:var(--sub);line-height:1.45}',
'.k-stp{border-radius:10px}.k-stp.last{box-shadow:inset 0 0 0 2px var(--g)}',
'.k-sttg{position:absolute;left:16px;top:50%;margin-top:-17px;height:34px;border-radius:8px;background:var(--g65);color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;letter-spacing:.02em}.k-sttg.last{background:var(--gdk)}',
'.k-stbx{position:absolute;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:3px}',
'.k-stt{font-size:15.5px;font-weight:700;color:var(--ink);line-height:1.4}.k-stt b{color:var(--gdk)}',
'.k-stl{font-size:13.5px;color:var(--sub);line-height:1.4;padding-left:13px;position:relative}.k-stl:before{content:"–";position:absolute;left:0;color:var(--mute)}',
'.k-stsd{display:flex;flex-direction:column;align-items:center;text-align:center;gap:9px}',
'.k-stsh{align-self:stretch;display:flex;align-items:center;justify-content:center;gap:9px;background:var(--cmp);color:#fff;font-size:16px;font-weight:700;border-radius:10px;height:42px;flex:0 0 auto}',
'.k-stsh i{font-style:normal;width:21px;height:21px;border-radius:50%;border:2px solid #fff;display:inline-flex;align-items:center;justify-content:center;font-size:12.5px}',
'.k-stst{font-size:15.5px;font-weight:700;color:var(--ink);line-height:1.45;padding:0 6px}.k-stst b{color:var(--gdk)}.k-stss{font-size:13px;color:var(--mute);line-height:1.45;padding:0 6px}',
/* pyramid */
'.k-pyd{border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 16px;font-size:15.5px;font-weight:700;color:var(--gdk);line-height:1.42;box-shadow:0 1px 2px rgba(0,60,40,.08)}',
'.k-pyn{display:flex;flex-direction:column;justify-content:center;gap:3px}.k-pynt{font-size:13.5px;font-weight:700;color:var(--ink);line-height:1.4}',
'.k-pyni{font-size:13px;color:var(--sub);line-height:1.42;padding-left:11px;position:relative}.k-pyni:before{content:"";position:absolute;left:0;top:7px;width:5px;height:5px;border-radius:50%;background:var(--g65)}',
/* balance */
'.k-blc{border:1px solid var(--line);border-radius:14px;background:#fff;overflow:hidden;display:flex;flex-direction:column}',
'.k-blh{color:#fff;font-size:16px;font-weight:700;text-align:center;padding:12px 10px;flex:0 0 auto}',
'.k-blb{flex:1;padding:14px;display:flex;flex-direction:column;justify-content:center;gap:10px}',
'.k-bli{flex:1;max-height:150px;display:flex;align-items:center;font-size:15px;color:var(--ink);line-height:1.5;padding:0 16px;background:var(--paper);border-radius:10px}',
'.k-bli>div{display:flex;flex-direction:column;gap:2px;line-height:1.35}.k-bli>div b{font-size:14.5px;font-weight:700;color:var(--ink)}.k-bli>div em{font-style:normal;font-size:21px;font-weight:700;color:var(--gdk);letter-spacing:-.02em;font-variant-numeric:tabular-nums}.k-bli>div span{font-size:13px;color:var(--mute)}',
'.k-blc.r .k-bli>div em{color:var(--cmp)}',
'.k-bld{border-radius:12px;background:var(--gdk);color:#fff;display:flex;align-items:center;gap:20px;padding:0 24px}',
'.k-bldv{display:flex;align-items:baseline;gap:10px;flex:0 0 auto;border-right:1px solid rgba(255,255,255,.3);padding-right:20px}',
'.k-bldv span{font-size:13.5px;color:rgba(255,255,255,.88);font-weight:600}.k-bldv b{font-size:25px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums}',
'.k-bldn{font-size:15px;line-height:1.45;color:#fff}.k-bld .k-bldn b{color:var(--gon)}.k-bld.nod{justify-content:center;text-align:center}',
/* flow */
'.k-fsd{display:flex;flex-direction:column;border-radius:12px;overflow:hidden;border:1px solid var(--g40)}',
'.k-fsh{background:var(--gdk);color:#fff;font-size:17px;font-weight:700;text-align:center;padding:11px 0;flex:0 0 auto}',
'.k-fsb{flex:1;background:var(--g08);display:flex;flex-direction:column;padding:18px 18px 16px;gap:16px}',
'.k-fsr{display:flex;gap:12px;align-items:flex-start}',
'.k-fsr i{font-style:normal;flex:0 0 auto;min-width:58px;text-align:center;background:#fff;border-radius:8px;padding:6px 8px;font-size:14.5px;font-weight:700;color:var(--gdk);box-shadow:0 1px 2px rgba(0,60,40,.08)}',
'.k-fsr span{font-size:14px;line-height:1.55;color:var(--ink);padding-top:4px}',
'.k-fsc{margin-top:auto;border-top:1px solid var(--g40);padding-top:12px;text-align:center;font-size:15px;font-weight:700;color:var(--gdk);line-height:1.5}',
'.k-fw{border-radius:14px;background:var(--well)}',
'.k-tab{position:absolute;left:0;top:0;background:var(--gdk);color:#fff;font-size:13.5px;font-weight:700;padding:4px 14px;border-radius:14px 0 10px 0}',
'.k-fn{border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.3}',
'.k-fn b{font-size:15.5px;font-weight:700}.k-fn span{font-size:12.5px;margin-top:2px;opacity:.88}',
'.k-fn.soft{background:var(--g18);color:var(--gdk)}.k-fn.dark{background:var(--gdk);color:#fff}.k-fn.main{background:var(--g);color:#fff}.k-fn.gray{background:#fff;color:var(--sub);border:1.5px solid var(--gray)}',
'.k-fty{position:absolute;left:18px;right:18px;top:38px;display:flex;flex-direction:column;gap:10px}',
'.k-ftr{display:flex;align-items:center;gap:16px;height:44px}',
'.k-ftr i{font-style:normal;flex:0 0 150px;height:38px;border-radius:8px;background:var(--gdk);color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center}',
'.k-ftr span{font-size:14px;line-height:1.45;color:var(--ink)}',
/* ladder */
'.k-lgo{border-radius:12px;border:2px dashed var(--gray);background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.3}',
'.k-lgo b{font-size:16.5px;font-weight:700;color:var(--sub)}.k-lgo span{font-size:12.5px;color:var(--mute);margin-top:2px}',
'.k-lgo.on{border:0;background:var(--gdk)}.k-lgo.on b{color:#fff}.k-lgo.on span{color:rgba(255,255,255,.86)}',
'.k-lst{border-radius:10px;background:#fff;border:1.5px solid var(--gray);display:flex;align-items:center;gap:12px;padding:0 14px}.k-lst.met{border:2px solid var(--g)}',
'.k-lck{flex:0 0 auto;width:26px;height:26px;border-radius:50%;border:2px solid var(--gray);display:flex;align-items:center;justify-content:center;font-style:normal;box-sizing:border-box}',
'.k-lst.met .k-lck{background:var(--g);border-color:var(--g)}',
'.k-lst div{display:flex;flex-direction:column;line-height:1.35}.k-lst b{font-size:15px;font-weight:700;color:var(--ink)}.k-lst span{font-size:12.5px;color:var(--mute);margin-top:1px}',
'.k-lft{text-align:center;font-size:17px;font-weight:700;color:var(--ink);border-bottom:1.5px solid var(--ink);line-height:30px}',
'.k-lfl{text-align:center;font-size:15px;font-weight:700;color:var(--g);line-height:26px}',
'.k-lfw{border-radius:14px;background:var(--g08);border:1px solid var(--g18)}',
'.k-lfc{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:7px}',
'.k-lfc i{font-style:normal;width:44px;height:44px;border-radius:50%;background:var(--gdk);box-shadow:0 0 0 7px var(--g18);margin-bottom:6px;color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center}',
'.k-lfc b{font-size:18px;font-weight:700;color:var(--ink);line-height:1.35}.k-lfc span{font-size:13.5px;color:var(--sub);line-height:1.5}',
'.k-lfg{border-radius:12px;background:#fff;overflow:hidden;box-shadow:0 1px 3px rgba(0,60,40,.1);display:flex;flex-direction:column}',
'.k-lfgh{color:#fff;padding:8px 14px;display:flex;align-items:baseline;gap:8px;flex:0 0 auto}.k-lfgh b{font-size:15px;font-weight:700}.k-lfgh span{font-size:12.5px;color:rgba(255,255,255,.86)}',
'.k-lfb{flex:1;display:flex;flex-direction:column;justify-content:center;gap:8px;padding:8px 16px 10px 30px}',
'.k-lfi{position:relative;display:flex;flex-direction:column;line-height:1.4}.k-lfi:before{content:"";position:absolute;left:-14px;top:7px;width:6px;height:6px;background:var(--g65)}',
'.k-lfi b{font-size:14.5px;font-weight:700;color:var(--ink)}.k-lfi span{font-size:13px;color:var(--sub)}',
/* cycle */
'.k-cyc{border-radius:12px;background:#fff;border:1.5px solid var(--g40);display:flex;align-items:center;gap:12px;padding:0 16px;box-shadow:0 2px 8px rgba(0,60,40,.07)}',
'.k-cyc i{font-style:normal;flex:0 0 auto;width:34px;height:34px;border-radius:50%;background:var(--g);color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center}',
'.k-cyc div{display:flex;flex-direction:column;line-height:1.38;min-width:0}.k-cyc b{font-size:15.5px;font-weight:700;color:var(--ink)}.k-cyc span{font-size:13.5px;color:var(--sub);margin-top:2px}',
'.k-cyc em{font-style:normal;align-self:flex-start;margin-top:5px;font-size:12.5px;font-weight:700;color:var(--gdk);background:var(--g08);border-radius:999px;padding:1px 9px}',
/* columns */
'.k-cot{border-radius:12px;background:var(--gdk);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.3}',
'.k-cot b{font-size:18px;font-weight:700;color:#fff}.k-cot span{font-size:13px;color:rgba(255,255,255,.86);margin-top:2px}',
'.k-coc{border-radius:14px;background:#fff;border:1px solid var(--line);padding:16px 20px;display:flex;flex-direction:column;gap:12px}',
'.k-coc.hi{border:1.5px solid var(--g);background:var(--g08)}.k-coc.hi .k-cop div{background:#fff}',
'.k-coh{display:flex;gap:12px;align-items:flex-start}.k-coh em{font-style:normal;font-size:30px;font-weight:700;color:var(--g65);line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums}',
'.k-coh div{display:flex;flex-direction:column;line-height:1.35}.k-coh b{font-size:17px;font-weight:700;color:var(--ink)}.k-coh span{font-size:13px;color:var(--mute);margin-top:2px}',
'.k-cov{border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:9px 0;display:flex;flex-direction:column}',
'.k-con{font-size:32px;font-weight:700;color:var(--gdk);letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15;white-space:nowrap}',
'.k-con small{font-size:15px;font-weight:600;margin-left:4px;color:var(--sub)}.k-cov i{font-style:normal;font-size:12.5px;color:var(--mute)}',
'.k-cop{flex:1;min-height:0;display:flex;flex-direction:column;gap:8px}.k-cop div{flex:1;max-height:96px;display:flex;align-items:center;font-size:14px;line-height:1.5;color:var(--ink);padding:6px 12px 6px 16px;background:var(--paper);border-radius:8px;}',
'.k-cop div b{color:var(--gdk)}',
'.k-cono{margin-top:auto;border-radius:10px;background:var(--g08);padding:10px 14px;display:flex;flex-direction:column;gap:2px}',
'.k-cono i{font-style:normal;font-size:12.5px;font-weight:700;color:var(--g)}.k-cono span{font-size:14px;color:var(--ink);line-height:1.45;font-weight:600}',
'.k-cos{border-radius:12px;background:var(--gdk);color:#fff;display:flex;align-items:center;gap:16px;padding:0 22px}',
'.k-cos i{font-style:normal;flex:0 0 auto;font-size:13px;font-weight:700;color:var(--gdk);background:var(--gon);border-radius:999px;padding:3px 12px}',
'.k-cos span{font-size:16px;font-weight:600;line-height:1.4}.k-cos span b{color:var(--gon)}',
/* tree */
'.k-trr{border-radius:14px;background:var(--gdk);color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 20px;gap:6px}',
'.k-trr b{font-size:20px;font-weight:700;line-height:1.3}.k-trr em{font-style:normal;font-size:28px;font-weight:700;color:var(--gon);font-variant-numeric:tabular-nums;letter-spacing:-.02em;line-height:1.1}',
'.k-trr span{font-size:13px;color:rgba(255,255,255,.86);line-height:1.45}.k-trr span b{color:#fff}',
'.k-trb{border-radius:12px;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 18px;gap:3px}',
'.k-trb b{font-size:16.5px;font-weight:700;line-height:1.35}.k-trb span{font-size:13px;color:rgba(255,255,255,.9);line-height:1.4}.k-trb span b{color:#fff}',
'.k-trl{border-radius:10px;background:var(--paper);display:flex;align-items:center;gap:14px;padding:0 18px 0 0;overflow:hidden}',
'.k-trl i{flex:0 0 9px;height:9px;border-radius:50%;margin-left:18px}.k-trl div{flex:1;display:flex;flex-direction:column;line-height:1.38;min-width:0}',
'.k-trl b{font-size:15px;font-weight:700;color:var(--ink)}.k-trl span{font-size:13.5px;color:var(--sub)}',
'.k-trl em{font-style:normal;flex:0 0 auto;font-size:17px;font-weight:700;color:var(--gdk);font-variant-numeric:tabular-nums}',
/* calendar */
'.k-cah{display:flex;align-items:center;font-size:16px;font-weight:700;color:var(--ink);padding-left:14px}',
'.k-cam{border-radius:8px;background:var(--paper);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--sub)}.k-cam.on{background:var(--gdk);color:#fff}',
'.k-car{border-radius:12px;background:var(--paper)}',
'.k-cal{display:flex;flex-direction:column;justify-content:center;gap:3px;line-height:1.35}.k-cal b{font-size:17px;font-weight:700}.k-cal span{font-size:13px;color:var(--mute)}',
'.k-cal em{font-style:normal;font-size:13px;color:var(--ink);margin-top:5px;font-weight:600;line-height:1.45}',
'.k-cae{border-radius:8px;border:1px dashed #D5DCD8}',
'.k-cac{border-radius:8px;background:#fff;border:1.5px solid var(--gray);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;line-height:1.25;text-align:center}',
'.k-cac b{font-size:14.5px;font-weight:700;color:var(--ink)}.k-cac i{font-style:normal;font-size:13px;font-weight:700}.k-cac span{font-size:12px;color:var(--mute)}',
'.k-cac em{font-style:normal;font-size:12.5px;font-weight:600;color:var(--sub);border-top:1px solid var(--line);padding-top:4px;margin-top:2px;font-variant-numeric:tabular-nums}',
'.k-cac.chg{border-width:2px}.k-cac.next{border:1.5px dashed var(--axis)}.k-cac.next b{color:var(--mute)}.k-cac.fut{filter:opacity(.5)}',
'.k-cag{display:flex;align-items:center;gap:18px;font-size:13px;color:var(--sub)}.k-cag span{display:inline-flex;align-items:center;gap:6px}.k-cag em{font-style:normal;color:var(--mute)}',
/* discuss */
'.k-dsh{text-align:center;font-size:17px;font-weight:700;color:var(--ink);border-bottom:1.5px solid var(--ink);line-height:34px}',
'.k-dsi{display:flex;align-items:center;gap:18px;padding:0 8px}',
'.k-dsi em{font-style:normal;flex:0 0 46px;font-size:54px;font-weight:300;color:var(--g);line-height:1;text-align:center;font-variant-numeric:tabular-nums}',
'.k-dsi div{display:flex;flex-direction:column;gap:4px;line-height:1.4}.k-dsi b{font-size:18px;font-weight:700;color:var(--ink)}.k-dsi span{font-size:14px;color:var(--sub);line-height:1.5}',
'.k-dst{border-radius:16px;background:var(--g08);border:2px solid transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 40px 30px;gap:10px;transition:border-color .3s}',
'.k-dst.lead{border-color:var(--g)}.k-dst b{font-size:19px;font-weight:700;color:var(--gdk);line-height:1.35}',
'.k-dst hr{width:70%;border:0;border-top:1.5px solid var(--g40);margin:2px 0}.k-dst span{font-size:15.5px;color:var(--ink);line-height:1.55}',
'.k-dst .vote{position:absolute;right:14px;bottom:12px;display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--g40);background:#fff;color:var(--gdk);border-radius:999px;padding:3px 13px 3px 10px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}',
'.k-dst .vote:hover{border-color:var(--g)}.k-dst .vote em{font-style:normal;font-variant-numeric:tabular-nums;min-width:12px}.k-dst .vote.bump{animation:kbump .35s ease}',
'@keyframes kbump{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}',
/* further */
'.k-fuh{text-align:center;font-size:17px;font-weight:700;color:var(--ink);border-bottom:1.5px solid var(--ink);line-height:36px}',
'.k-fuh em{position:absolute;right:0;top:6px;font-style:normal;font-size:13px;font-weight:600;color:var(--mute);border-bottom:1px solid var(--mute);line-height:22px}',
'.k-fug{border-radius:12px;background:var(--gdk);display:flex;align-items:center;justify-content:center;text-align:center;padding:0 12px;color:#fff;font-size:17px;font-weight:700;line-height:1.4}.k-fug span b{color:#fff}',
'.k-fur{border-radius:12px;background:var(--g08);display:flex;flex-direction:column;justify-content:center;gap:7px;padding:0 26px}',
'.k-fur div{display:flex;align-items:baseline;gap:8px}.k-fur em{font-style:normal;font-size:14px;color:var(--g65);font-weight:600;flex:0 0 auto}',
'.k-fur b{font-size:17.5px;font-weight:700;color:var(--gdk);text-decoration:underline;text-underline-offset:4px;text-decoration-thickness:1.5px}.k-fur span{font-size:14.5px;color:var(--ink);line-height:1.5}',
/* statement */
'.k-sm{display:flex;align-items:center}.k-sm em.k-smk{align-self:flex-start;font-style:normal;font-size:13px;font-weight:700;color:#fff;background:var(--g);border-radius:999px;padding:3px 12px}',
'.k-sm>div{display:flex;flex-direction:column;gap:12px}.k-sm p{margin:0;font-size:31px;font-weight:600;line-height:1.42;letter-spacing:-.02em;color:var(--ink)}',
'.k-sm p b{color:var(--gdk);font-weight:700;background:linear-gradient(transparent 62%,var(--g18) 62%) no-repeat;background-size:0% 100%}',
'.k-sm.on p b{background-size:100% 100%;transition:background-size .8s cubic-bezier(.2,0,.38,.9)}.k-sm span{font-size:15px;color:var(--mute);line-height:1.5}',
'.k-sme,.k-tmn{border-radius:14px;background:#fff;border:1px solid var(--line);padding:16px 22px 12px;display:flex;flex-direction:column}',
'.k-smh{display:flex;align-items:baseline;justify-content:space-between;gap:10px}.k-smh b{font-size:15.5px;font-weight:700;color:var(--ink)}.k-smh span{font-size:12.5px;color:var(--mute);white-space:nowrap}',
'.k-smv{margin-top:6px;font-size:40px;font-weight:700;color:var(--gdk);letter-spacing:-.025em;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}',
'.k-smv small{font-size:18px;font-weight:600;margin-left:4px;color:var(--sub)}.k-sms{margin-top:auto;border-top:1px solid var(--line);padding-top:8px;font-size:12px;color:var(--mute)}',
/* term */
'.k-tmw{display:flex;flex-direction:column;justify-content:flex-end;gap:2px}',
'.k-tmw span{align-self:flex-start;font-size:12.5px;font-weight:700;color:#fff;background:var(--g);border-radius:999px;padding:2px 11px;margin-bottom:6px}',
'.k-tmw b{font-size:40px;font-weight:700;color:var(--ink);letter-spacing:-.03em;line-height:1.1}.k-tmw em{font-style:normal;font-size:16px;color:var(--mute);font-weight:500}',
'.k-tmd{border-radius:12px;background:var(--g08);padding:0 26px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:8px;font-size:18px;font-weight:500;line-height:1.6;color:var(--ink)}',
'.k-tmd i{font-style:normal;font-size:12.5px;font-weight:700;color:var(--gdk);background:#fff;border:1px solid var(--g40);border-radius:999px;padding:1px 10px;line-height:1.5}',
'.k-tmp{border-radius:14px;background:#fff;border:1px solid var(--line);display:flex;gap:18px;align-items:center;padding:0 26px}',
'.k-tmp em{font-style:normal;flex:0 0 auto;width:44px;height:44px;border-radius:12px;background:var(--gdk);color:#fff;font-size:20px;font-weight:700;display:flex;align-items:center;justify-content:center}',
'.k-tmp div{display:flex;flex-direction:column;gap:5px;line-height:1.45}.k-tmp b{font-size:17px;font-weight:700;color:var(--ink)}.k-tmp span{font-size:14.5px;color:var(--sub);line-height:1.55}',
'.k-tmx{border-radius:14px;background:#fff;border:1px solid var(--line);padding:16px 22px 18px;display:flex;flex-direction:column;gap:12px}.k-tmx>b{font-size:15.5px;font-weight:700;color:var(--ink)}',
'.k-tmx>div{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:10px}.k-tmx span{display:flex;align-items:center;justify-content:center;text-align:center;background:var(--paper);border-radius:10px;font-size:14.5px;font-weight:600;color:var(--ink);padding:6px 10px}',
'.k-tmr{display:flex;align-items:center;gap:8px;overflow:hidden}.k-tmr i{font-style:normal;font-size:13px;font-weight:700;color:var(--mute);margin-right:4px;white-space:nowrap}',
'.k-tmr span{font-size:13.5px;font-weight:700;border-radius:999px;padding:5px 13px;background:var(--g08);color:var(--gdk);white-space:nowrap}'
].join('\n');
function inject() { if (document.getElementById('k-parts-css')) return; var st = document.createElement('style'); st.id = 'k-parts-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st) }
inject();
/* 공통 도움 */
var kx = ECOM.kx = {};
kx.D = function (p, cls, x, y, w, hh, html, at) { var d = document.createElement('div'); d.className = cls;
  d.style.cssText = 'left:' + x + 'px;top:' + y + 'px;' + (w != null ? 'width:' + w + 'px;' : '') + (hh != null ? 'height:' + hh + 'px;' : ''); if (html != null) d.innerHTML = html;
  if (at) for (var k in at) if (at[k] != null) d.setAttribute(k, at[k]); p.appendChild(d); return d };
kx.lines = function (t, size, w, bold) { if (!t) return 0; return String(t).replace(/\*\*/g, '').split('\n').reduce(function (a, l) { return a + Math.max(1, h.wrap(l, size, w, bold).length) }, 0) };
kx.sum = function (a) { return a.reduce(function (x, y) { return x + y }, 0) };
kx.svg = function (ctx) { var v = ctx.svg(512); v.style.pointerEvents = 'none'; return v };
/* 화살촉 : (x,y) 끝점, ang 방향(라디안), s 길이, wf 폭 비 */
kx.head = function (p, x, y, ang, col, s, a, wf) { s = s || 9; wf = wf || .55; var c = Math.cos(ang), sn = Math.sin(ang), bx = x - c * s, by = y - sn * s, px = -sn * s * wf, py = c * s * wf;
  return E('path', Object.assign({ d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + (bx + px).toFixed(1) + ' ' + (by + py).toFixed(1) + ' L' + (bx - px).toFixed(1) + ' ' + (by - py).toFixed(1) + ' Z', fill: col }, a || {}), p) };
/* 작은 차트 : m{type:'spark|bars|step',data,first,last,dec,unit,lo,hi} — (x,y,w,hh) 칸 안, lvl 단계에 그려짐 */
kx.mini = function (svg, m, x, y, w, hh, lvl, at) { var TM = function (o, more) { var a = at != null ? { 'data-at': at + o } : { 'data-b': lvl }; for (var k in more) a[k] = more[k]; return a }; var d = m.data || [], n = d.length; if (!n) return; var dec = m.dec == null ? 1 : m.dec, un = m.unit || '', ty = m.type || 'spark';
  var e = h.ext(d), bars = ty === 'bars', lo = m.lo != null ? m.lo : (bars ? Math.min(0, e[0]) : e[0] - (e[1] - e[0]) * .18), hi = m.hi != null ? m.hi : e[1] + (e[1] - e[0]) * .1;
  if (hi === lo) { hi += 1; lo -= 1 } var top = y + 22, bot = y + hh - 22, Y = h.lin(lo, hi, bot, top), g = E('g', TM(0, { 'data-fx': 'fade' }), svg);
  var fmt = function (v) { return h.nf(v, dec, { sign: m.sign }) + un }, HL = { stroke: '#fff', 'stroke-width': 3.5, 'paint-order': 'stroke', 'stroke-linejoin': 'round' };
  if (bars) { var st = w / n, bw = Math.min(26, st * .64), z = Y(Math.max(lo, Math.min(hi, 0)));
    E('line', { x1: x, x2: x + w, y1: z, y2: z, stroke: C.axis }, g);
    d.forEach(function (v, i) { var bx = x + i * st + (st - bw) / 2, last = i === n - 1, yv = Y(v);
      E('rect', { x: bx, y: Math.min(yv, z), width: bw, height: Math.max(1.5, Math.abs(z - yv)), rx: 2, fill: last ? (v < 0 ? C.cmp : C.main) : (v < 0 ? C.gray : C.g40), 'data-at': (at != null ? at : null), 'data-fx': 'grow', 'data-o': v < 0 ? '50% 0%' : '50% 100%', 'data-ms': 360 }, svg); var rr = svg.lastChild; if (at != null) rr.setAttribute('data-at', at + 120 + i * 40); else rr.setAttribute('data-b', lvl) });
    var lv = d[n - 1], lxx = x + (n - 1) * st + st / 2; var lyy = Math.min(lv < 0 ? z : Y(lv), z) - 8, clash = d.some(function (v, i) { var bx = x + i * st; return i < n - 1 && bx + st > x + w - h.textW(fmt(lv), 12.5, 1) - 4 && Math.min(Y(v), z) < lyy + 4 }); if (clash) lyy = top - 8;
    T(g, x + w, lyy, fmt(lv), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.dark }, HL));
    if (m.first) T(g, x + st / 2, bot + 17, m.first, { 'text-anchor': 'middle', 'font-size': 12, fill: C.mute }); if (m.last) T(g, lxx, bot + 17, m.last, { 'text-anchor': 'middle', 'font-size': 12, fill: C.ink, 'font-weight': 700 }) }
  else { var X = function (i) { return x + (n === 1 ? w : w * i / (n - 1)) }, path = '';
    if (ty === 'step') d.forEach(function (v, i) { path += i ? ' H' + X(i).toFixed(1) + ' V' + Y(v).toFixed(1) : 'M' + X(0) + ' ' + Y(v).toFixed(1) });
    else path = h.lineD(d, X, Y);
    if (lo < 0 && hi > 0) E('line', { x1: x, x2: x + w, y1: Y(0), y2: Y(0), stroke: C.axis, 'stroke-dasharray': '3 3' }, g);
    E('line', { x1: x, x2: x + w, y1: bot, y2: bot, stroke: C.grid }, g);
    if (ty === 'spark') E('path', { d: path + ' L' + X(n - 1) + ' ' + bot + ' L' + X(0) + ' ' + bot + ' Z', fill: C.g08 }, g);
    E('path', { d: path, fill: 'none', stroke: C.main, 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'data-fx': 'draw', 'data-ms': 900 }, svg); svg.lastChild.setAttribute(at != null ? 'data-at' : 'data-b', at != null ? at + 100 : lvl);
    E('circle', { cx: X(n - 1), cy: Y(d[n - 1]), r: 4.5, fill: C.dark, stroke: '#fff', 'stroke-width': 1.5 }, g);
    E('circle', { cx: X(0), cy: Y(d[0]), r: 3.5, fill: C.axis }, g);
    T(g, X(n - 1), Y(d[n - 1]) - 10, fmt(d[n - 1]), Object.assign({ 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: C.dark }, HL));
    T(g, X(0), Y(d[0]) + (Y(d[0]) > (top + bot) / 2 ? -9 : 18), fmt(d[0]), Object.assign({ 'font-size': 12, fill: C.mute }, HL));
    if (m.first) T(g, X(0), bot + 17, m.first, { 'font-size': 12, fill: C.mute }); if (m.last) T(g, X(n - 1), bot + 17, m.last, { 'text-anchor': 'end', 'font-size': 12, fill: C.ink, 'font-weight': 700 }) } };
})();
