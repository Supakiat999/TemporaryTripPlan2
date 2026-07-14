(function(){
'use strict';
const $=id=>document.getElementById(id);
const U=[...(window.U||[])];
const Q=window.QS_DATA||window.META||{};
const C=window.MAP_COORDS||{};
const A=window.AIRPORTS_BY_UNI||{};
const R=window.RETURN_RISK||{};
const byId=Object.fromEntries(U.map(x=>[x.id,x]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=p=>{const d=Q[p.id]||{};return{rank:d.rank??d.qsRank??null,display:d.display||d.qsDisplay||'Not