(()=>{
const U=Array.isArray(window.U)?window.U:[];
const META=window.META||{};
const COORDS=window.MAP_COORDS||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=id=>document.getElementById(id);
const q=el('mapQ'),region=el('mapRegion'),fit=el('mapFit'),climate=el('mapClimate'),count=el('mapCount'),list=el('mapList');
if(!window.L){count.textContent='Map library failed to load. Please refresh.';return;}
const map=L.map('map',{worldCopyJump:true}).setView([35,15],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const layer=L.layerGroup().addTo(map);
const markers=new Map();
function colorFor(x){return x==='Return-safe'?'#16a34a':x==='Check exact exams'?'#f59e0b':'#dc2626';}
function meta(p){return Object.assign({qsDisplay:'Not verified',courseUrl:'#',uniUrl:'#'},META[p.id]||{});}
function visible(){const term=(q.value||'').toLowerCase();return U.filter(p=>COORDS[p.id]&&(!term||[p.name,p.location,p.country,p.region].join(' ').toLowerCase().includes(term))&&(!region.value||p.region===region.value)&&(!fit.value||p.returnSafety===fit.value)&&(!climate.value||p.climate===climate.value));}
function popup(p){const m=meta(p),c=COORDS[p.id];return `<div class="popup-title">${esc(p.name)}</div><div class="popup-sub">${esc(p.location)} · ${esc(p.level)}</div><div class="popup-row"><b>Campus:</b> ${esc(c.label)}</div><div class="popup-row"><b>QS 2026:</b> ${esc(m.qsDisplay)}</div><div class="popup-row"><b>Return fit:</b> ${esc(p.returnSafety)}</div><div class="popup-row"><b>Semester:</b> ${esc(p.semester)}</div><div class="popup-row"><b>Weather:</b> ${esc(p.temperature)}</div><div class="popup-links"><a href="${esc(m.courseUrl)}" target="_blank" rel="noopener">Courses ↗</a><a href="${esc(m.uniUrl)}" target="_blank" rel="noopener">University ↗</a></div>`;}
function render(){layer.clearLayers();markers.clear();const a=visible();const bounds=[];a.forEach(p=>{const c=COORDS[p.id];const marker=L.circleMarker([c.lat,c.lng],{radius:8,color:'#fff',weight:2,fillColor:colorFor(p.returnSafety),fillOpacity:.95}).bindPopup(popup(p));marker.addTo(layer);markers.set(p.id,marker);bounds.push([c.lat,c.lng]);});count.textContent=`${a.length} universities shown on the map`;list.innerHTML=a.length?a.sort((x,y)=>x.name.localeCompare(y.name)).map(p=>`<div class="map-item" data-id="${p.id}"><h3>${esc(p.name)}</h3><div class="mini">${esc(p.location)}<br>${esc(COORDS[p.id].label)}</div><div class="badges"><span class="b ${p.returnSafety==='Return-safe'?'good':p.returnSafety==='Check exact exams'?'warn':'bad'}">${esc(p.returnSafety)}</span><span class="b">${esc(meta(p).qsDisplay)}</span></div></div>`).join(''):'<div class="empty">No universities match these filters.</div>';list.querySelectorAll('.map-item').forEach(item=>item.onclick=()=>{const id=Number(item.dataset.id),m=markers.get(id),c=COORDS[id];if(m&&c){map.setView([c.lat,c.lng],8);m.openPopup();}});if(bounds.length>1)map.fitBounds(bounds,{padding:[35,35],maxZoom:4});else if(bounds.length===1)map.setView(bounds[0],8);}
[...new Set(U.map(x=>x.region))].sort().forEach(x=>region.add(new Option(x,x)));
[q,region,fit,climate].forEach(x=>x.addEventListener('input',render));
if(!U.length){count.textContent='University data failed to load.';list.innerHTML='<div class="empty">University data failed to load.</div>';return;}
render();
})();