(()=>{
const U=Array.isArray(window.U)?window.U:[];
const META=window.META||{};
const COORDS=window.MAP_COORDS||{};
const AIRPORTS=window.AIRPORTS_BY_UNI||{};
const RISK=window.RETURN_RISK||{};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=id=>document.getElementById(id);
const q=el('mapQ'),region=el('mapRegion'),fit=el('mapFit'),climate=el('mapClimate'),count=el('mapCount'),list=el('mapList'),showAirports=el('showAirports'),showLines=el('showLines');
if(!window.L){count.textContent='Map library failed to load. Please refresh.';return;}
const map=L.map('map',{worldCopyJump:true}).setView([35,15],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const universityLayer=L.layerGroup().addTo(map);
const airportLayer=L.layerGroup().addTo(map);
const lineLayer=L.layerGroup().addTo(map);
const markers=new Map();
function riskLabel(p){return (RISK[p.id]&&RISK[p.id].label)||p.returnSafety||'Not assessed';}
function riskNote(p){return (RISK[p.id]&&RISK[p.id].note)||'';}
function colorFor(x){return x==='Return-safe'?'#16a34a':x==='Medium risk'?'#f59e0b':'#dc2626';}
function badgeClass(x){return x==='Return-safe'?'good':x==='Medium risk'?'warn':'bad';}
function meta(p){return Object.assign({qsDisplay:'Not verified',courseUrl:'#',uniUrl:'#',qsUrl:'#'},META[p.id]||{});}
function visible(){const term=(q.value||'').toLowerCase();return U.filter(p=>COORDS[p.id]&&(!term||[p.name,p.location,p.country,p.region,meta(p).qsDisplay].join(' ').toLowerCase().includes(term))&&(!region.value||p.region===region.value)&&(!fit.value||riskLabel(p)===fit.value)&&(!climate.value||p.climate===climate.value));}
function airportRows(p){const airports=AIRPORTS[p.id]||[];if(!airports.length)return '<div class="popup-row"><b>Nearby airports:</b> Not yet added.</div>';return `<div class="popup-row"><b>Nearby airports:</b></div>${airports.map(a=>`<div class="popup-row airport-row"><b>${esc(a.iata)}</b> — ${esc(a.name)}<br><span>${esc(a.time)} · ${esc(a.mode)}</span></div>`).join('')}`;}
function popup(p){const m=meta(p),c=COORDS[p.id],risk=riskLabel(p);return `<div class="popup-title">${esc(p.name)}</div><div class="popup-sub">${esc(p.location)} · ${esc(p.level)}</div><div class="popup-row"><b>Campus:</b> ${esc(c.label)}</div><div class="popup-row"><b>QS 2026:</b> ${esc(m.qsDisplay)}</div><div class="popup-row"><b>Return risk:</b> ${esc(risk)}</div><div class="popup-row">${esc(riskNote(p))}</div><div class="popup-row"><b>Semester:</b> ${esc(p.semester)}</div><div class="popup-row"><b>Weather:</b> ${esc(p.temperature)}</div>${airportRows(p)}<div class="popup-links"><a href="${esc(m.courseUrl)}" target="_blank" rel="noopener">Courses ↗</a><a href="${esc(m.uniUrl)}" target="_blank" rel="noopener">University ↗</a><a href="${esc(m.qsUrl)}" target="_blank" rel="noopener">QS ↗</a></div>`;}
function airportPopup(a,p){return `<div class="popup-title">✈ ${esc(a.iata)} — ${esc(a.name)}</div><div class="popup-sub">Near ${esc(p.name)}</div><div class="popup-row"><b>Estimated transfer:</b> ${esc(a.time)}</div><div class="popup-row"><b>Typical mode:</b> ${esc(a.mode)}</div><div class="popup-row">Times are planning estimates and can change with traffic, transfers and service schedules.</div>`;}
function airportIcon(){return L.divIcon({className:'airport-div-icon',html:'✈',iconSize:[24,24],iconAnchor:[12,12]});}
function render(){universityLayer.clearLayers();airportLayer.clearLayers();lineLayer.clearLayers();markers.clear();const a=visible();const bounds=[];const airportSeen=new Set();a.forEach(p=>{const c=COORDS[p.id],risk=riskLabel(p);const marker=L.circleMarker([c.lat,c.lng],{radius:8,color:'#fff',weight:2,fillColor:colorFor(risk),fillOpacity:.95}).bindPopup(popup(p));marker.addTo(universityLayer);markers.set(p.id,marker);bounds.push([c.lat,c.lng]);if(showAirports.checked){(AIRPORTS[p.id]||[]).forEach(ap=>{const key=ap.iata;if(!airportSeen.has(key)){airportSeen.add(key);L.marker([ap.lat,ap.lng],{icon:airportIcon(),title:`${ap.iata} — ${ap.name}`}).bindPopup(airportPopup(ap,p)).addTo(airportLayer);bounds.push([ap.lat,ap.lng]);}if(showLines.checked)L.polyline([[c.lat,c.lng],[ap.lat,ap.lng]],{color:'#64748b',weight:1.3,opacity:.45,dashArray:'5,5'}).addTo(lineLayer);});}});count.textContent=`${a.length} universities shown · ${airportSeen.size} nearby airports`;list.innerHTML=a.length?a.sort((x,y)=>x.name.localeCompare(y.name)).map(p=>{const risk=riskLabel(p),m=meta(p),aps=AIRPORTS[p.id]||[];return `<div class="map-item" data-id="${p.id}"><h3>${esc(p.name)}</h3><div class="mini">${esc(p.location)}<br>${esc(COORDS[p.id].label)}</div><div class="badges"><span class="b ${badgeClass(risk)}">${esc(risk)}</span><span class="b qsbadge">QS ${esc(m.qsDisplay)}</span></div><div class="airport-summary">${aps.length?aps.map(ap=>`<div><b>${esc(ap.iata)}</b>: ${esc(ap.time)}</div>`).join(''):'Airport data pending'}</div></div>`;}).join(''):'<div class="empty">No universities match these filters.</div>';list.querySelectorAll('.map-item').forEach(item=>item.onclick=()=>{const id=Number(item.dataset.id),m=markers.get(id),c=COORDS[id];if(m&&c){map.setView([c.lat,c.lng],8);m.openPopup();}});if(bounds.length>1)map.fitBounds(bounds,{padding:[35,35],maxZoom:5});else if(bounds.length===1)map.setView(bounds[0],8);}
[...new Set(U.map(x=>x.region))].sort().forEach(x=>region.add(new Option(x,x)));
[q,region,fit,climate,showAirports,showLines].forEach(x=>x&&x.addEventListener('input',render));
if(!U.length){count.textContent='University data failed to load.';list.innerHTML='<div class="empty">University data failed to load.</div>';return;}
render();
})();