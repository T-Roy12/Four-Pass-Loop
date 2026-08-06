const navButtons = [...document.querySelectorAll('.bottom-nav button')];
const views = [...document.querySelectorAll('.view')];
const dayButtons = [...document.querySelectorAll('.day-switcher button')];
const dayPanels = [...document.querySelectorAll('.day-panel')];
let boxes = [...document.querySelectorAll('input[type="checkbox"][data-key]')];
const gearBoxes = boxes.filter(box => box.dataset.key.startsWith('gear-'));
const milestoneBoxes = boxes.filter(box => box.dataset.key.startsWith('photo-') || box.dataset.key.startsWith('d1-') || box.dataset.key.startsWith('d2-') || box.dataset.key.startsWith('pass-'));

function showView(id){navButtons.forEach(b=>b.classList.toggle('active',b.dataset.view===id));views.forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo({top:0,behavior:'smooth'});}
navButtons.forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.getElementById('startTodayBtn')?.addEventListener('click',()=>showView('today')); // compatibility

const profileData={
 day1:{title:'Day 1 · Maroon Lake to East Fork',gain:'+3,000 ft',points:[[20,155,'Start','0.0 mi · 9,580 ft · 7:30 AM'],[180,120,'Crater','1.8 mi · 10,080 ft · 9:00 AM'],[330,30,'Buckskin','4.5 mi · 12,462 ft · 11:30 AM'],[455,90,'Willow','5.7 mi · approx. 11,000 ft · 12:45 PM'],[580,145,'Camp','8.2 mi · East Fork · 2:00–3:00 PM']]},
 day2:{title:'Day 2 · East Fork to Upper Snowmass',gain:'+2,500 ft',points:[[20,145,'Camp','0.0 mi · East Fork · 5:30 AM'],[170,35,'Frigid','2.8 mi · 12,415 ft · 8:00 AM'],[320,125,'Basin','Between passes'],[425,28,'Trail Rider','4.8 mi · 12,420 ft · 10:00 AM'],[580,145,'Snowmass','10.4 mi · Upper Snowmass · Noon']]},
 day3:{title:'Day 3 · Upper Snowmass to Maroon Lake',gain:'+1,900 ft',points:[[20,145,'Camp','0.0 mi · Upper Snowmass · 5:31 AM'],[190,30,'West Maroon','3.3 mi · 12,500 ft · 8:00 AM'],[350,90,'Meadows','Wildflowers · morning'],[470,125,'Crater','7.6 mi · 11:00 AM'],[580,155,'Finish','9.4 mi · Maroon Lake · Noon']]}
};
function renderProfile(day){const d=profileData[day];document.getElementById('profileTitle').textContent=d.title;document.getElementById('profileGain').textContent=d.gain;const line=d.points.map(p=>`${p[0]},${p[1]}`).join(' ');document.getElementById('profileLine').setAttribute('d',`M ${line.replaceAll(' ',' L ')}`);const area=`M ${d.points[0][0]},175 L ${line.replaceAll(' ',' L ')} L ${d.points.at(-1)[0]},175 Z`;document.getElementById('profileArea').setAttribute('d',area);const g=document.getElementById('profileMarkers');g.innerHTML='';d.points.forEach(([x,y,label,detail])=>{const ns='http://www.w3.org/2000/svg';const group=document.createElementNS(ns,'g');group.setAttribute('class','profile-marker');group.innerHTML=`<circle cx="${x}" cy="${y}" r="9"></circle><text x="${x}" y="${Math.max(18,y-16)}" text-anchor="middle">${label}</text>`;group.addEventListener('click',()=>document.getElementById('profileDetail').textContent=detail);g.appendChild(group);});}

function setDay(day){dayButtons.forEach(b=>b.classList.toggle('active',b.dataset.day===day));dayPanels.forEach(p=>p.classList.toggle('active',p.id===day));renderProfile(day);updateNextEvent();}
dayButtons.forEach(b=>b.addEventListener('click',()=>setDay(b.dataset.day)));

function updateTaskCounts(){document.querySelectorAll('.camp-checks').forEach(section=>{const items=[...section.querySelectorAll('input[type="checkbox"]')];section.querySelector('.task-count').textContent=`${items.filter(i=>i.checked).length} / ${items.length}`;});}
function updateProgress(){const gearDone=gearBoxes.filter(b=>b.checked).length;const gearPct=gearBoxes.length?Math.round(gearDone/gearBoxes.length*100):0;document.getElementById('gearCount').textContent=`${gearDone} / ${gearBoxes.length} packed`;const ring=document.getElementById('gearRing');ring.textContent=`${gearPct}%`;ring.style.background=`conic-gradient(var(--pine) ${gearPct}%,#e4ebe6 0)`;const done=milestoneBoxes.filter(b=>b.checked).length;const pct=milestoneBoxes.length?Math.round(done/milestoneBoxes.length*100):0;document.getElementById('milestoneCount').textContent=`${done} / ${milestoneBoxes.length}`;document.getElementById('tripProgressBar').style.width=`${pct}%`;document.getElementById('tripPercent').textContent=`${pct}%`;document.querySelector('.trip-ring').style.background=`conic-gradient(var(--pine) ${pct}%,#e4ebe6 0)`;updateTaskCounts();const passes=boxes.filter(b=>b.dataset.key.startsWith('pass-'));const pd=passes.filter(b=>b.checked).length;document.getElementById('passCount').textContent=`${pd} / 4`;document.getElementById('completionBadge').hidden=pd!==4;}
function bindBox(box){box.checked=localStorage.getItem(box.dataset.key)==='true';box.addEventListener('change',()=>{localStorage.setItem(box.dataset.key,String(box.checked));updateProgress();});}
boxes.forEach(bindBox);

document.querySelectorAll('textarea[data-note]').forEach(area=>{area.value=localStorage.getItem(area.dataset.note)||'';area.addEventListener('input',()=>localStorage.setItem(area.dataset.note,area.value));});

document.querySelectorAll('.waypoint').forEach(button=>button.addEventListener('click',()=>{const detail=document.getElementById('routeDetail');detail.querySelector('h3').textContent=button.querySelector('strong').textContent;detail.querySelector('p').textContent=button.dataset.detail;detail.scrollIntoView({behavior:'smooth',block:'center'});}));

document.querySelectorAll('.day-panel').forEach((panel,di)=>{[...panel.querySelectorAll('.timeline-item.standard,.timeline-item.camp-arrival')].forEach((item,i)=>{const key=`event-${di+1}-${i}`;item.classList.toggle('completed',localStorage.getItem(key)==='true');item.addEventListener('click',()=>{item.classList.toggle('completed');localStorage.setItem(key,String(item.classList.contains('completed')));updateNextEvent();});});});
function updateNextEvent(){const panel=document.querySelector('.day-panel.active');if(!panel)return;const pending=[...panel.querySelectorAll('.timeline-item')].find(item=>{const photo=item.querySelector('input[data-key]');return photo?!photo.checked:!item.classList.contains('completed');});document.getElementById('nextEventName').textContent=pending?pending.querySelector('div span').textContent:'Day complete';document.getElementById('nextEventMeta').textContent=pending?`${panel.querySelector('.day-hero-copy span').textContent} · ${pending.querySelector('time').textContent}`:'All planned events completed';document.getElementById('nextEventCountdown').textContent=pending?pending.querySelector('time').textContent:'✓';}

function updateTripCountdown(){const start=new Date('2026-08-09T06:00:00-06:00');const end=new Date('2026-08-11T12:00:00-06:00');const now=new Date();const el=document.getElementById('tripCountdown');if(now<start){const hrs=Math.max(0,Math.floor((start-now)/36e5));const days=Math.floor(hrs/24);el.textContent=days?`${days}d ${hrs%24}h`:`${hrs}h`;document.getElementById('tripStatusTitle').textContent='Trip countdown';document.getElementById('tripCountdownLabel').textContent='until shuttle';}else if(now<=end){el.textContent='ON TRAIL';document.getElementById('tripStatusTitle').textContent='Adventure underway';document.getElementById('tripStatusText').textContent='Open Today for your chronological plan and check off milestones.';document.getElementById('tripCountdownLabel').textContent='Four Pass Loop';}else{el.textContent='COMPLETE';document.getElementById('tripStatusTitle').textContent='Trip complete';document.getElementById('tripCountdownLabel').textContent='great work';}}

async function loadWeather(){const btn=document.getElementById('loadWeatherBtn');btn.textContent='Loading…';try{const url='https://api.open-meteo.com/v1/forecast?latitude=39.0708&longitude=-106.989&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FDenver&forecast_days=3';const r=await fetch(url);if(!r.ok)throw new Error();const d=await r.json();document.getElementById('weatherSummary').textContent=`${Math.round(d.current.temperature_2m)}°F · Wind ${Math.round(d.current.wind_speed_10m)} mph`;document.getElementById('weatherDetail').textContent=`Today ${Math.round(d.daily.temperature_2m_min[0])}°–${Math.round(d.daily.temperature_2m_max[0])}° · Precipitation chance ${d.daily.precipitation_probability_max[0]}%`;btn.textContent='Refresh';}catch{document.getElementById('weatherSummary').textContent='Forecast unavailable';document.getElementById('weatherDetail').textContent='Check your weather app before leaving camp.';btn.textContent='Retry';}}
document.getElementById('loadWeatherBtn')?.addEventListener('click',loadWeather);

function getLocation(callback){if(!navigator.geolocation){callback(null);return;}navigator.geolocation.getCurrentPosition(p=>callback(p),()=>callback(null),{enableHighAccuracy:true,timeout:12000,maximumAge:30000});}
function formatCoords(p){return `${p.coords.latitude.toFixed(6)}, ${p.coords.longitude.toFixed(6)}`;}
document.getElementById('locateBtn')?.addEventListener('click',()=>getLocation(p=>{if(!p){document.getElementById('gpsHeading').textContent='Location unavailable';return;}document.getElementById('gpsHeading').textContent=formatCoords(p);document.getElementById('gpsCoords').textContent=`Accuracy about ${Math.round(p.coords.accuracy)} meters · save or share these coordinates if needed.`;}));

const sheet=document.getElementById('trailSheet'),backdrop=document.getElementById('sheetBackdrop');function openSheet(){backdrop.hidden=false;sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');}function closeSheet(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');setTimeout(()=>backdrop.hidden=true,260);}document.getElementById('quickActionBtn').addEventListener('click',openSheet);backdrop.addEventListener('click',closeSheet);document.querySelectorAll('.sheet-tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.sheet-tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.sheet-panel').forEach(p=>p.classList.toggle('active',p.id===b.dataset.sheet));}));

const journalDay=document.getElementById('journalDay'),journalText=document.getElementById('journalText'),journalPreview=document.getElementById('journalPreview');function loadJournal(){const k=`journal-day-${journalDay.value}`;journalText.value=localStorage.getItem(k)||'';const img=localStorage.getItem(`${k}-photo`);journalPreview.hidden=!img;if(img)journalPreview.src=img;}journalDay.addEventListener('change',loadJournal);document.getElementById('journalPhoto').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{journalPreview.src=reader.result;journalPreview.hidden=false;};reader.readAsDataURL(file);});document.getElementById('saveJournalBtn').addEventListener('click',()=>{const k=`journal-day-${journalDay.value}`;localStorage.setItem(k,journalText.value);if(!journalPreview.hidden){try{localStorage.setItem(`${k}-photo`,journalPreview.src);}catch{}}document.getElementById('journalSaved').textContent='Saved on this device.';setTimeout(()=>document.getElementById('journalSaved').textContent='',1800);});loadJournal();

let latestCoords='';document.getElementById('emergencyLocateBtn').addEventListener('click',()=>getLocation(p=>{if(!p){document.getElementById('emergencyCoords').textContent='Location unavailable';return;}latestCoords=formatCoords(p);document.getElementById('emergencyCoords').textContent=latestCoords;document.getElementById('emergencyAccuracy').textContent=`Accuracy about ${Math.round(p.coords.accuracy)} meters`; }));document.getElementById('copyCoordsBtn').addEventListener('click',async()=>{if(!latestCoords)return;try{await navigator.clipboard.writeText(latestCoords);document.getElementById('emergencyAccuracy').textContent='Coordinates copied.';}catch{document.getElementById('emergencyAccuracy').textContent='Press and hold the coordinates to copy.';}});

document.getElementById('resetBtn')?.addEventListener('click',()=>{boxes.forEach(box=>{box.checked=false;localStorage.removeItem(box.dataset.key);});document.querySelectorAll('.timeline-item.completed').forEach(i=>i.classList.remove('completed'));Object.keys(localStorage).filter(k=>k.startsWith('event-')).forEach(k=>localStorage.removeItem(k));updateProgress();updateNextEvent();});

renderProfile('day1');updateProgress();updateNextEvent();updateTripCountdown();setInterval(updateTripCountdown,60000);
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));


// Version 2.1 trail experience
const trailExperienceData={
 day1:{title:'Day 1 progress',subtitle:'Maroon Lake to East Fork Zone',total:8.2,tip:'Buckskin Pass is exposed. Keep summit time short if clouds begin building.',cards:[
  {type:'photo',icon:'📸',name:'Maroon Lake',mile:0,time:'7:30 AM',meta:'Classic reflection at the trailhead',tip:'Use the shoreline to frame the Bells and include the lake reflection.',key:'photo-maroon-start'},
  {type:'photo',icon:'📸',name:'Crater Lake',mile:1.8,time:'9:00 AM',meta:'Lake-and-evergreen composition',tip:'Look back toward the Bells from the west side of the lake.',key:'photo-crater-day1'},
  {type:'pass',icon:'⛰️',name:'Buckskin Pass',mile:4.5,time:'11:30 AM',meta:'12,462 ft · Pass 1 of 4',tip:'Take a wide panorama, then descend promptly if weather is changing.',key:'pass-buckskin'},
  {type:'photo',icon:'📸',name:'Willow Lake Overlook',mile:5.7,time:'12:45 PM',meta:'Layered basin and ridgeline view',tip:'Include foreground rock or wildflowers for depth.',key:'photo-willow'},
  {type:'water',icon:'💧',name:'East Fork drainage',mile:7.4,time:'Early afternoon',meta:'Reliable camp-area water · filter required',tip:'Refill before choosing camp so you do not need another trip.',key:null},
  {type:'camp',icon:'🏕️',name:'East Fork Zone',mile:8.2,time:'2:00–3:00 PM',meta:'Night 1 campsite',tip:'Set up, filter water, eat, and stage gear for the early Day 2 start.',key:'d1-tent'}]},
 day2:{title:'Day 2 progress',subtitle:'East Fork to Upper Snowmass Zone',total:10.4,tip:'This is the biggest alpine day. Keep moving between Frigid Air and Trail Rider while weather is stable.',cards:[
  {type:'water',icon:'💧',name:'East Fork Creek',mile:0,time:'5:15 AM',meta:'Start with full bottles · filter required',tip:'Carry enough for the first climb before leaving camp.',key:'d2-water'},
  {type:'pass',icon:'⛰️',name:'Frigid Air Pass',mile:2.8,time:'8:00 AM',meta:'12,415 ft · Pass 2 of 4',tip:'Photograph the basin in both directions before descending.',key:'pass-frigid'},
  {type:'photo',icon:'📸',name:'Frigid Air panorama',mile:2.8,time:'8:00 AM',meta:'Morning alpine light',tip:'Use a wide view with a hiker in the foreground for scale.',key:'photo-frigid'},
  {type:'pass',icon:'⛰️',name:'Trail Rider Pass',mile:4.8,time:'10:00 AM',meta:'12,420 ft · Pass 3 of 4',tip:'Snowmass Mountain is the dominant backdrop from the pass.',key:'pass-trailrider'},
  {type:'water',icon:'💧',name:'North Fork crossings',mile:6.0,time:'10:30–11:00 AM',meta:'Refill opportunity · filter required',tip:'Top off before the final approach to Snowmass.',key:null},
  {type:'photo',icon:'📸',name:'Snowmass Lake',mile:8.2,time:'11:15 AM',meta:'Signature lake reflection',tip:'Walk the shoreline to find calm water and a clean mountain reflection.',key:'photo-snowmass'},
  {type:'camp',icon:'🏕️',name:'Upper Snowmass Zone',mile:10.4,time:'About noon',meta:'Night 2 campsite',tip:'Choose camp, secure food, and return to the lake for evening light.',key:'d2-tent'}]},
 day3:{title:'Day 3 progress',subtitle:'Upper Snowmass to Maroon Lake',total:9.4,tip:'West Maroon Pass is the final high point. Enjoy the morning light, then descend through the meadows.',cards:[
  {type:'photo',icon:'🌅',name:'Snowmass Lake sunrise',mile:0,time:'Before 5:31 AM',meta:'Blue-hour and first-light option',tip:'Take the photo before leaving camp if the water is calm.',key:'photo-snowmass-sunrise'},
  {type:'pass',icon:'⛰️',name:'West Maroon Pass',mile:3.3,time:'8:00 AM',meta:'12,500 ft · Pass 4 of 4',tip:'Look back toward Snowmass, then photograph the valley ahead.',key:'pass-westmaroon'},
  {type:'photo',icon:'📸',name:'Wildflower Meadows',mile:4.5,time:'8:45–9:30 AM',meta:'Colorful descent foregrounds',tip:'Shoot low to place flowers against the red peaks.',key:'photo-wildflowers'},
  {type:'water',icon:'💧',name:'West Maroon Creek',mile:6.0,time:'10:00 AM',meta:'Reliable water · filter required',tip:'A good refill before the final miles to Crater Lake.',key:null},
  {type:'photo',icon:'📸',name:'Crater Lake',mile:7.6,time:'11:00 AM',meta:'Final lake stop',tip:'Pause for one last framed view of the Bells.',key:'photo-crater-day3'},
  {type:'photo',icon:'📸',name:'Maroon Lake finish',mile:9.4,time:'12:00 PM',meta:'Completion photo',tip:'Take one wide landscape and one portrait with the trailhead behind you.',key:'photo-maroon-finish'}]}
};
function activeTrailDay(){return document.querySelector('.day-switcher button.active')?.dataset.day||'day1';}
function cardIsDone(card){if(!card.key)return false;const box=document.querySelector(`input[data-key="${card.key}"]`);return box?box.checked:localStorage.getItem(card.key)==='true';}
function estimateTrailProgress(day){const d=trailExperienceData[day];let miles=0;d.cards.forEach(c=>{if(cardIsDone(c))miles=Math.max(miles,c.mile)});return Math.min(d.total,miles);}
function renderTrailExperience(){if(!document.getElementById("trailExperienceCards"))return;const day=activeTrailDay(),d=trailExperienceData[day];if(!d)return;const doneMiles=estimateTrailProgress(day),pct=d.total?Math.round(doneMiles/d.total*100):0;document.getElementById('trailExperienceTitle').textContent=d.title;document.getElementById('trailExperienceSubtitle').textContent=d.subtitle;document.getElementById('trailMilesDone').textContent=doneMiles.toFixed(1);document.getElementById('trailMilesTotal').textContent=`of ${d.total.toFixed(1)} mi`;document.getElementById('trailProgressFill').style.width=`${pct}%`;document.getElementById('trailProgressMarker').style.left=`${pct}%`;const next=d.cards.find(c=>!cardIsDone(c)&&c.mile>=doneMiles)||d.cards.at(-1);document.getElementById('trailNextLandmark').textContent=doneMiles>=d.total?'Day complete':next.name;document.getElementById('trailNextDistance').textContent=doneMiles>=d.total?'All planned landmarks reached':`${Math.max(0,next.mile-doneMiles).toFixed(1)} mi ahead · ETA ${next.time}`;const host=document.getElementById('trailExperienceCards');host.innerHTML=d.cards.map((c,i)=>{const done=cardIsDone(c),clickable=!!c.key;return `<article class="experience-card ${c.type}-card ${done?'done':''}" data-exp-index="${i}" ${clickable?'role="button" tabindex="0"':''}><div class="experience-card-top"><div style="display:flex;gap:11px"><div class="experience-card-icon">${c.icon}</div><div><h3>${c.name}</h3><p class="meta">Mile ${c.mile.toFixed(1)} · ${c.time}</p><span class="experience-badge">${c.meta}</span></div></div>${clickable?`<button class="status-button" type="button">${done?'Completed':'Mark done'}</button>`:''}</div><p class="tip">${c.tip}</p></article>`}).join('')+`<div class="trail-tip-strip"><strong>Today’s trail tip</strong>${d.tip}</div>`;host.querySelectorAll('[data-exp-index]').forEach(el=>{const c=d.cards[+el.dataset.expIndex];if(!c.key)return;const toggle=()=>{const box=document.querySelector(`input[data-key="${c.key}"]`);if(box){box.checked=!box.checked;box.dispatchEvent(new Event('change',{bubbles:true}));}else{localStorage.setItem(c.key,String(!cardIsDone(c)));renderTrailExperience();}};el.addEventListener('click',e=>{if(e.target.closest('button')||e.currentTarget===el)toggle()});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});});}
const originalSetDay=setDay;setDay=function(day){originalSetDay(day);renderTrailExperience();};
document.addEventListener('change',e=>{if(e.target.matches('input[data-key]'))setTimeout(renderTrailExperience,0)});
renderTrailExperience();

// Version 2.2 navigation
const navRouteData={
 day1:{label:'Day 1',total:8.2,camp:'East Fork Zone',water:[{name:'East Fork drainage',mile:7.4}],points:[
  {name:'Maroon Lake',mile:0,meta:'Start · 7:30 AM',x:95,y:350,icon:'●',key:'photo-maroon-start'},
  {name:'Crater Lake',mile:1.8,meta:'Photo · 9:00 AM',x:150,y:260,icon:'📸',key:'photo-crater-day1'},
  {name:'Buckskin',mile:4.5,meta:'12,462 ft · 11:30 AM',x:242,y:150,icon:'⛰️',key:'pass-buckskin'},
  {name:'Willow',mile:5.7,meta:'Photo · 12:45 PM',x:320,y:110,icon:'📸',key:'photo-willow'},
  {name:'East Fork',mile:8.2,meta:'Camp · 2:00–3:00 PM',x:385,y:112,icon:'🏕️',key:'d1-tent'}]},
 day2:{label:'Day 2',total:10.4,camp:'Upper Snowmass Zone',water:[{name:'North Fork crossings',mile:6.0}],points:[
  {name:'East Fork',mile:0,meta:'Start · 5:30 AM',x:385,y:112,icon:'🏕️',key:'d2-water'},
  {name:'Frigid Air',mile:2.8,meta:'12,415 ft · 8:00 AM',x:465,y:145,icon:'⛰️',key:'pass-frigid'},
  {name:'Trail Rider',mile:4.8,meta:'12,420 ft · 10:00 AM',x:555,y:185,icon:'⛰️',key:'pass-trailrider'},
  {name:'North Fork',mile:6.0,meta:'Water · 10:30–11:00 AM',x:620,y:235,icon:'💧',key:null},
  {name:'Snowmass Lake',mile:8.2,meta:'Photo · 11:15 AM',x:640,y:300,icon:'📸',key:'photo-snowmass'},
  {name:'Upper Snowmass',mile:10.4,meta:'Camp · about noon',x:590,y:365,icon:'🏕️',key:'d2-tent'}]},
 day3:{label:'Day 3',total:9.4,camp:'Maroon Lake finish',water:[{name:'West Maroon Creek',mile:6.0}],points:[
  {name:'Upper Snowmass',mile:0,meta:'Start · 5:31 AM',x:590,y:365,icon:'🏕️',key:'photo-snowmass-sunrise'},
  {name:'West Maroon',mile:3.3,meta:'12,500 ft · 8:00 AM',x:470,y:405,icon:'⛰️',key:'pass-westmaroon'},
  {name:'Meadows',mile:4.5,meta:'Photo · 8:45–9:30 AM',x:385,y:360,icon:'📸',key:'photo-wildflowers'},
  {name:'West Maroon Creek',mile:6.0,meta:'Water · 10:00 AM',x:290,y:405,icon:'💧',key:null},
  {name:'Crater Lake',mile:7.6,meta:'Photo · 11:00 AM',x:190,y:395,icon:'📸',key:'photo-crater-day3'},
  {name:'Maroon Lake',mile:9.4,meta:'Finish · noon',x:95,y:350,icon:'🏁',key:'photo-maroon-finish'}]}
};
function navDone(key){if(!key)return false;const b=document.querySelector(`input[data-key="${key}"]`);return b?b.checked:localStorage.getItem(key)==='true'}
function navProgress(day){const d=navRouteData[day];let m=0;d.points.forEach(p=>{if(navDone(p.key))m=Math.max(m,p.mile)});return Math.min(m,d.total)}
function renderNavigation(){const day=activeTrailDay(),d=navRouteData[day];if(!d)return;const miles=navProgress(day);document.getElementById('navDayLabel').textContent=d.label;const next=d.points.find(p=>!navDone(p.key)&&p.mile>=miles)||d.points.at(-1);document.getElementById('navNextName').textContent=miles>=d.total?'Day complete':next.name;document.getElementById('navNextMeta').textContent=miles>=d.total?'All planned points reached':`${Math.max(0,next.mile-miles).toFixed(1)} mi ahead · ${next.meta}`;const water=d.water.find(w=>w.mile>=miles);document.getElementById('navWaterName').textContent=water?water.name:'No planned refill ahead';document.getElementById('navWaterMeta').textContent=water?`${(water.mile-miles).toFixed(1)} mi ahead · filter required`:'Carry to destination';document.getElementById('navCampName').textContent=d.camp;document.getElementById('navCampMeta').textContent=`${Math.max(0,d.total-miles).toFixed(1)} mi ahead`;
 const host=document.getElementById('mapWaypoints');host.innerHTML=d.points.map((p,i)=>`<g class="map-point ${navDone(p.key)?'completed':''}" data-map-index="${i}" tabindex="0" transform="translate(${p.x} ${p.y})"><circle r="15"/><text text-anchor="middle" y="7">${p.icon}</text><text class="map-label" text-anchor="middle" y="-24">${p.name}</text></g>`).join('');
 host.querySelectorAll('.map-point').forEach(el=>{const p=d.points[+el.dataset.mapIndex];const show=()=>{document.querySelector('#mapDetail h3').textContent=p.name;document.querySelector('#mapDetail p').textContent=`Mile ${p.mile.toFixed(1)} · ${p.meta}`};el.addEventListener('click',show);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})});
 const target=d.points.reduce((best,p)=>Math.abs(p.mile-miles)<Math.abs(best.mile-miles)?p:best,d.points[0]);document.getElementById('mapHiker').setAttribute('transform',`translate(${target.x} ${target.y})`);
 const pct=d.total?Math.min(1,miles/d.total):0;document.getElementById('mapRouteProgress').style.strokeDasharray='1';document.getElementById('mapRouteProgress').style.strokeDashoffset=String(1-pct);
 document.querySelector('#mapDetail h3').textContent=next.name;document.querySelector('#mapDetail p').textContent=miles>=d.total?'Day complete':`Next · ${Math.max(0,next.mile-miles).toFixed(1)} mi ahead · ${next.meta}`;
}
const oldSetDay22=setDay;setDay=function(day){oldSetDay22(day);renderNavigation()};
document.addEventListener('change',e=>{if(e.target.matches('input[data-key]'))setTimeout(renderNavigation,0)});
renderNavigation();


// Version 2.3 photography guide
const photoGuideData={
 day1:[
  {key:'photo-maroon-start',name:'Maroon Lake',mile:'0.0',time:'7:30 AM',light:'Morning',direction:'Face southwest',image:'images/maroon-scene.svg',tip:'Use the shoreline as a leading line and include the full reflection when the water is calm.'},
  {key:'photo-crater-day1',name:'Crater Lake',mile:'1.8',time:'9:00 AM',light:'Soft morning',direction:'Look south',image:'images/maroon-scene.svg',tip:'Frame the Bells between evergreens and leave a little lake in the foreground.'},
  {key:'photo-buckskin',name:'Buckskin Pass',mile:'4.5',time:'11:30 AM',light:'Late morning',direction:'Pan both ways',image:'images/pass-scene.svg',tip:'Take one wide panorama, then add a hiker in the foreground to show scale.'},
  {key:'photo-willow',name:'Willow Lake Overlook',mile:'5.7',time:'12:45 PM',light:'Midday',direction:'Look back uphill',image:'images/pass-scene.svg',tip:'Use rock, flowers, or trail in the foreground to build depth through the basin.'}
 ],
 day2:[
  {key:'photo-frigid',name:'Frigid Air Pass',mile:'2.8',time:'8:00 AM',light:'Early morning',direction:'Face into basin',image:'images/pass-scene.svg',tip:'Shoot wide and place your hiking partner off-center against the layered ridges.'},
  {key:'photo-trail-rider',name:'Trail Rider Pass',mile:'4.8',time:'10:00 AM',light:'Morning',direction:'Toward Snowmass',image:'images/pass-scene.svg',tip:'Keep Snowmass Mountain dominant and include the trail as a natural leading line.'},
  {key:'photo-snowmass',name:'Snowmass Lake',mile:'8.2',time:'11:15 AM',light:'Late morning',direction:'Across the lake',image:'images/snowmass-scene.svg',tip:'Walk the shoreline to find calm water, a clean reflection, and fewer foreground branches.'},
  {key:'photo-snowmass-sunset',name:'Snowmass Sunset',mile:'Camp',time:'7:55 PM',light:'Golden hour',direction:'Toward peaks',image:'images/snowmass-scene.svg',tip:'Arrive early, lock focus on the mountains, and take several frames as the light changes.'}
 ],
 day3:[
  {key:'photo-snowmass-sunrise',name:'Snowmass Sunrise',mile:'0.0',time:'Before 5:31 AM',light:'Blue hour',direction:'Across the lake',image:'images/snowmass-scene.svg',tip:'Photograph before breaking camp if the lake is calm; underexpose slightly to preserve the sky.'},
  {key:'photo-west-maroon',name:'West Maroon Pass',mile:'3.3',time:'8:00 AM',light:'Early morning',direction:'Both valleys',image:'images/pass-scene.svg',tip:'Take one frame looking back toward Snowmass and another into West Maroon Creek valley.'},
  {key:'photo-wildflowers',name:'Wildflower Meadows',mile:'3.5–6.0',time:'8:15–10:00 AM',light:'Morning',direction:'Down valley',image:'images/maroon-scene.svg',tip:'Get low, focus on flowers near the lens, and use the red peaks as the background.'},
  {key:'photo-crater-day3',name:'Crater Lake',mile:'7.6',time:'11:00 AM',light:'Late morning',direction:'Toward Bells',image:'images/maroon-scene.svg',tip:'Use trees to frame the final lake view and take both a landscape and a vertical shot.'},
  {key:'photo-maroon-finish',name:'Maroon Lake Finish',mile:'9.4',time:'12:00 PM',light:'Midday',direction:'Toward Bells',image:'images/maroon-scene.svg',tip:'Take a wide completion photo and a portrait with your packs and the Bells behind you.'}
 ]
};
function photoDone(key){const b=document.querySelector(`input[data-key="${key}"]`);return b?b.checked:localStorage.getItem(key)==='true'}
function photoStorageKey(key){return `v23-stop-photo-${key}`}
function resizePhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=1100,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.76))};img.src=reader.result};reader.readAsDataURL(file)})}
function togglePhotoStop(key){const b=document.querySelector(`input[data-key="${key}"]`);if(b){b.checked=!b.checked;b.dispatchEvent(new Event('change',{bubbles:true}))}else{localStorage.setItem(key,String(!photoDone(key)));renderPhotoStudio()}}
function renderPhotoStudio(){const day=activeTrailDay(),data=photoGuideData[day]||[],host=document.getElementById('photoStudioGrid');if(!host)return;const completed=data.filter(x=>photoDone(x.key)).length;document.getElementById('photoStudioCount').textContent=`${completed} / ${data.length}`;document.getElementById('photoStudioSubtitle').textContent=`${trailExperienceData[day].subtitle} · ${data.length} planned photo stops`;
 host.innerHTML=data.map((p,i)=>{const done=photoDone(p.key),saved=localStorage.getItem(photoStorageKey(p.key));return `<article class="photo-guide-card ${done?'done':''}" data-photo-index="${i}"><div class="photo-guide-visual"><img src="${p.image}" alt="Scenic guide image for ${p.name}"><span class="photo-guide-status">${done?'✓ Taken':'Planned'}</span><div class="photo-guide-title"><small>Mile ${p.mile} · ${p.time}</small><h3>${p.name}</h3></div></div><div class="photo-guide-body"><div class="photo-guide-facts"><div><span>Best light</span><strong>${p.light}</strong></div><div><span>Direction</span><strong>${p.direction}</strong></div><div><span>Arrival</span><strong>${p.time}</strong></div></div><p class="composition-tip"><strong>Composition:</strong> ${p.tip}</p><div class="photo-card-actions"><button type="button" class="photo-done-btn">${done?'Photo taken ✓':'Mark photo taken'}</button><label class="attach-photo-btn">${saved?'Replace your photo':'Attach your photo'}<input type="file" accept="image/*" capture="environment"></label></div>${saved?`<img class="stop-photo-preview" src="${saved}" alt="Your photo from ${p.name}"><button type="button" class="remove-stop-photo">Remove attached photo</button>`:''}</div></article>`}).join('');
 host.querySelectorAll('.photo-guide-card').forEach(card=>{const p=data[+card.dataset.photoIndex];card.querySelector('.photo-done-btn').addEventListener('click',()=>togglePhotoStop(p.key));card.querySelector('input[type=file]').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const image=await resizePhoto(file);localStorage.setItem(photoStorageKey(p.key),image);renderPhotoStudio()}catch(err){alert('This photo could not be saved on this device. Try a smaller image.')}});card.querySelector('.remove-stop-photo')?.addEventListener('click',()=>{localStorage.removeItem(photoStorageKey(p.key));renderPhotoStudio()})})
}
const oldSetDay23=setDay;setDay=function(day){oldSetDay23(day);renderPhotoStudio()};
document.addEventListener('change',e=>{if(e.target.matches('input[data-key]'))setTimeout(renderPhotoStudio,0)});
renderPhotoStudio();

// Trail Companion: camp dashboard + glanceable Trail Mode
const campCompanionData={
 day1:{title:'East Fork Zone',sub:'Night 1 · planned arrival 2:00–3:00 PM',water:'East Fork drainage',sunset:'7:58 PM',light:'Golden hour about 7:20 PM',tomorrow:'10.4 miles',start:'Start 5:30 AM',photo:'Evening basin light',tip:'Use the last warm light on the ridgeline and include your tent for scale.',tasks:[['d1-water','Filter water'],['d1-tent','Set up tent'],['d1-dinner','Eat dinner'],['d1-gear','Prepare morning gear']]},
 day2:{title:'Upper Snowmass Zone',sub:'Night 2 · planned arrival about noon',water:'Snowmass Lake area',sunset:'7:57 PM',light:'Golden hour about 7:19 PM',tomorrow:'9.4 miles',start:'Start 5:31 AM',photo:'Snowmass sunset',tip:'Walk the shoreline before sunset and look for calm water with a clean reflection.',tasks:[['d2-water','Filter water'],['d2-tent','Set up tent'],['d2-dinner','Eat dinner'],['d2-gear','Prepare morning gear']]},
 day3:{title:'Maroon Lake Finish',sub:'Trip completion · planned finish about noon',water:'West Maroon Creek',sunset:'—',light:'Celebrate at the trailhead',tomorrow:'Trip complete',start:'No early alarm',photo:'Completion portrait',tip:'Take one wide image of the Bells and one portrait with both packs visible.',tasks:[['finish-photo','Take finish photo'],['finish-gear','Check all gear'],['finish-water','Hydrate'],['finish-share','Save trip notes']]}
};
function renderCampCompanion(){const day=activeTrailDay(),d=campCompanionData[day];if(!d)return;campCompanionTitle.textContent=d.title;campCompanionSub.textContent=d.sub;campWater.textContent=d.water;campSunset.textContent=d.sunset;campLight.textContent=d.light;campTomorrow.textContent=d.tomorrow;campTomorrowStart.textContent=d.start;campPhotoTitle.textContent=d.photo;campPhotoTip.textContent=d.tip;campCompanionTasks.innerHTML=d.tasks.map(([key,label])=>`<label><input type="checkbox" data-key="${key}"><span>${label}</span></label>`).join('');campCompanionTasks.querySelectorAll('input').forEach(b=>{b.checked=localStorage.getItem(b.dataset.key)==='true';b.addEventListener('change',()=>{localStorage.setItem(b.dataset.key,b.checked);updateAll?.()})})}
const prevSetDayTC=setDay;setDay=function(day){prevSetDayTC(day);renderCampCompanion();renderTrailMode()};
function trailModeStats(){const day=activeTrailDay(),d=navRouteData[day],m=navProgress(day);const next=d.points.find(p=>!navDone(p.key)&&p.mile>=m)||d.points.at(-1),water=d.water.find(w=>w.mile>=m);return{day,d,m,next,water,pct:Math.round(m/d.total*100)}}
function renderTrailMode(){if(!window.navRouteData)return;const x=trailModeStats();tmDay.textContent=x.d.label;tmNext.textContent=x.m>=x.d.total?'Day complete':x.next.name;tmDistance.textContent=x.m>=x.d.total?'All landmarks reached':`${Math.max(0,x.next.mile-x.m).toFixed(1)} mi ahead`;tmWater.textContent=x.water?x.water.name:'No refill ahead';tmWaterDistance.textContent=x.water?`${(x.water.mile-x.m).toFixed(1)} mi`:'Carry to destination';tmCamp.textContent=x.d.camp;tmCampDistance.textContent=`${Math.max(0,x.d.total-x.m).toFixed(1)} mi`;tmProgress.textContent=`${x.pct}%`;tmMiles.textContent=`${x.m.toFixed(1)} / ${x.d.total.toFixed(1)} mi`}
function updateTrailClock(){tmClock.textContent=new Intl.DateTimeFormat([], {hour:'numeric',minute:'2-digit'}).format(new Date())}
function openTrailMode(){trailMode.classList.add('open');trailMode.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';renderTrailMode();updateTrailClock()}
function closeTrailMode(){trailMode.classList.remove('open');trailMode.setAttribute('aria-hidden','true');document.body.style.overflow=''}
trailModeFab.addEventListener('click',openTrailMode);openTrailModeBtn.addEventListener('click',openTrailMode);closeTrailModeBtn.addEventListener('click',closeTrailMode);
tmLocate.addEventListener('click',()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{tmCoords.textContent=`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`},()=>{tmCoords.textContent='Location unavailable'},{enableHighAccuracy:true,timeout:10000}):tmCoords.textContent='GPS unsupported');
tmEmergency.addEventListener('click',()=>{closeTrailMode();document.getElementById('trailSheet')?.classList.add('open');document.getElementById('trailSheet')?.setAttribute('aria-hidden','false');document.getElementById('sheetBackdrop')?.removeAttribute('hidden');document.querySelector('[data-sheet="emergencyTool"]')?.click()});
document.addEventListener('change',e=>{if(e.target.matches('input[data-key]'))setTimeout(renderTrailMode,0)});setInterval(updateTrailClock,30000);renderCampCompanion();renderTrailMode();updateTrailClock();

// Version 2.5 — Finish & Memories
const finishPassData=[
  ['pass-buckskin','Buckskin Pass','12,462 ft'],
  ['pass-frigid','Frigid Air Pass','12,415 ft'],
  ['pass-trailrider','Trail Rider Pass','12,420 ft'],
  ['pass-westmaroon','West Maroon Pass','12,500 ft']
];
const finishPhotoKeys=[
 'photo-maroon-start','photo-crater-day1','photo-willow','photo-frigid','photo-snowmass','photo-snowmass-sunset',
 'photo-snowmass-sunrise','photo-west-maroon','photo-wildflowers','photo-crater-day3','photo-maroon-finish',
 'photo-buckskin','photo-trailrider','photo-eastfork'
];
const finishWildlifeData=[
 ['wild-moose','🫎 Moose'],['wild-bear','🐻 Black bear'],['wild-marmot','🦫 Marmot'],['wild-pika','🐹 Pika'],['wild-deer','🦌 Mule deer'],['wild-eagle','🦅 Eagle']
];
function storedChecked(key){const box=document.querySelector(`input[data-key="${key}"]`);return box?box.checked:localStorage.getItem(key)==='true'}
function finishSummaryText(){const passes=finishPassData.filter(x=>storedChecked(x[0])).length;const photos=finishPhotoKeys.filter(storedChecked).length;const wildlife=finishWildlifeData.filter(x=>storedChecked(x[0])).map(x=>x[1].replace(/^\S+\s/,''));const complete=localStorage.getItem('trip-complete-v25')==='true';return `Four Pass Loop${complete?' — completed':''}\nAugust 9–11, 2026\n28.0 miles · ${passes} of 4 passes · 2 nights · ${photos} photo stops captured${wildlife.length?` · Wildlife: ${wildlife.join(', ')}`:''}.`}
function renderFinish(){
 const passDone=finishPassData.filter(x=>storedChecked(x[0])).length;
 const photoDoneCount=finishPhotoKeys.filter(storedChecked).length;
 const wildlifeDone=finishWildlifeData.filter(x=>storedChecked(x[0])).length;
 const total=finishPassData.length+finishPhotoKeys.length,done=passDone+photoDoneCount,pct=Math.round(done/total*100);
 const manuallyComplete=localStorage.getItem('trip-complete-v25')==='true';
 finishPasses.textContent=`${passDone} / 4`;finishPhotos.textContent=photoDoneCount;finishWildlife.textContent=wildlifeDone;
 finishMilestones.textContent=`${done} / ${total}`;finishProgressLabel.textContent=`${pct}% complete`;finishProgressBar.style.width=`${pct}%`;
 const completed=manuallyComplete||passDone===4;
 finishTitle.textContent=completed?'Four Pass Loop completed':'Adventure in progress';
 finishSubtitle.textContent=completed?'28.0 miles · four passes · two nights · one unforgettable loop.':'Complete your milestones and return here for the trip recap.';
 finishBadge.textContent=completed?'🏆':'4P';markTripCompleteBtn.textContent=completed?'Trip complete ✓':'Mark trip complete';markTripCompleteBtn.classList.toggle('completed',completed);
 finishPassList.innerHTML=finishPassData.map(([key,name,elev])=>`<div class="recap-row ${storedChecked(key)?'done':''}"><span>${storedChecked(key)?'✓':'○'} ${name}</span><small>${elev}</small></div>`).join('');
 const seen=finishWildlifeData.filter(x=>storedChecked(x[0]));finishWildlifeList.innerHTML=seen.length?seen.map(([,name])=>`<div class="recap-row done"><span>✓ ${name}</span><small>Seen</small></div>`).join(''):'<div class="recap-row"><span>No sightings checked yet</span><small>Use Trail Tools</small></div>';
 let journalCount=0;finishJournalList.innerHTML=[1,2,3].map(day=>{const text=localStorage.getItem(`journal-day-${day}`)||localStorage.getItem(`note-day${day}`)||'';if(text.trim())journalCount++;return `<article class="journal-recap-item ${text.trim()?'':'empty'}"><strong>Day ${day}</strong><p>${text.trim()?text.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])):'No journal entry saved.'}</p></article>`}).join('');finishJournalCount.textContent=`${journalCount} / 3`;
 tripStoryText.textContent=finishSummaryText().replaceAll('\n',' · ');
}
markTripCompleteBtn?.addEventListener('click',()=>{const now=localStorage.getItem('trip-complete-v25')==='true';localStorage.setItem('trip-complete-v25',String(!now));renderFinish()});
shareTripBtn?.addEventListener('click',async()=>{const text=finishSummaryText();try{if(navigator.share)await navigator.share({title:'Four Pass Loop',text});else{await navigator.clipboard.writeText(text);storyStatus.textContent='Summary copied for sharing.'}}catch(e){if(e?.name!=='AbortError')storyStatus.textContent='Sharing was unavailable on this device.'}setTimeout(()=>storyStatus.textContent='',2200)});
copyTripBtn?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(finishSummaryText());storyStatus.textContent='Trip summary copied.'}catch{storyStatus.textContent='Press and hold the summary text to copy.'}setTimeout(()=>storyStatus.textContent='',2200)});
document.addEventListener('change',e=>{if(e.target.matches('input[data-key]'))setTimeout(renderFinish,0)});
const oldShowViewV25=showView;showView=function(id){oldShowViewV25(id);if(id==='finish')renderFinish()};
renderFinish();


// Version 2.7 — photo capture controls embedded in timeline
function renderTimelinePhotoState(key){
  const box=document.querySelector(`input[data-key="${key}"]`);
  const btn=document.querySelector(`[data-photo-key="${key}"]`);
  if(btn) btn.textContent=box?.checked?'Photo taken':'Mark photo taken';
  const host=document.querySelector(`[data-photo-preview="${key}"]`);
  if(!host)return;
  const saved=localStorage.getItem(photoStorageKey(key));
  host.innerHTML=saved?`<img src="${saved}" alt="Your attached landmark photo"><button type="button" data-remove-photo="${key}">Remove attached photo</button>`:'';
}
function hydrateTimelinePhotos(){
  document.querySelectorAll('[data-photo-key]').forEach(btn=>renderTimelinePhotoState(btn.dataset.photoKey));
}
document.addEventListener('click',e=>{
  const mark=e.target.closest('[data-photo-key]');
  if(mark){e.preventDefault();togglePhotoStop(mark.dataset.photoKey);renderTimelinePhotoState(mark.dataset.photoKey);updateNextEvent();return;}
  const remove=e.target.closest('[data-remove-photo]');
  if(remove){e.preventDefault();localStorage.removeItem(photoStorageKey(remove.dataset.removePhoto));renderTimelinePhotoState(remove.dataset.removePhoto);}
});
document.addEventListener('change',async e=>{
  const upload=e.target.closest('[data-photo-upload]');
  if(upload){const file=upload.files?.[0];if(!file)return;try{const image=await resizePhoto(file);localStorage.setItem(photoStorageKey(upload.dataset.photoUpload),image);renderTimelinePhotoState(upload.dataset.photoUpload)}catch{alert('This photo could not be saved. Try a smaller image.')}return;}
  if(e.target.matches('input[data-key^="photo-"]'))renderTimelinePhotoState(e.target.dataset.key);
});
hydrateTimelinePhotos();


// Version 3.0 camp selector
const v3CampButtons=[...document.querySelectorAll('[data-camp-day]')];
v3CampButtons.forEach(btn=>btn.addEventListener('click',()=>{
  v3CampButtons.forEach(b=>b.classList.toggle('active',b===btn));
  const day=btn.dataset.campDay;
  const dayBtn=document.querySelector(`.day-switcher button[data-day="day${day}"]`);
  if(dayBtn){ setDay(`day${day}`); }
  if(typeof updateCampCompanion==='function') updateCampCompanion();
}));

// Final candidate: check off every timeline event and show daily progress.
(function initTimelineCompletion(){
  const panels=[...document.querySelectorAll('.day-panel')];

  function dayId(panel,index){ return panel.id || `day${index+1}`; }
  function itemKey(panel,index,itemIndex){
    const photo=item.querySelector('input[data-key^="photo-"]');
    return photo ? photo.dataset.key : `timeline-${dayId(panel,index)}-${itemIndex}`;
  }
  function isDone(input,key,item){
    return input ? input.checked : localStorage.getItem(key)==='true' || item.classList.contains('completed');
  }
  function setVisual(item,done){
    item.classList.toggle('timeline-checked',done);
    item.classList.toggle('completed',done);
  }
  function updatePanelProgress(panel){
    const items=[...panel.querySelectorAll('.timeline-list .timeline-item')];
    const done=items.filter(item=>{
      const cb=item.querySelector(':scope > input[type="checkbox"]');
      return cb?.checked;
    }).length;
    const pct=items.length?Math.round(done/items.length*100):0;
    const card=panel.querySelector('.day-progress-card');
    if(card){
      card.querySelector('.day-progress-count').textContent=`${done} of ${items.length} completed`;
      card.querySelector('.day-progress-percent').textContent=`${pct}%`;
      card.querySelector('.day-progress-track i').style.width=`${pct}%`;
    }
  }
  function updateAllDayProgress(){ panels.forEach(updatePanelProgress); }

  panels.forEach((panel,panelIndex)=>{
    const items=[...panel.querySelectorAll('.timeline-list .timeline-item')];
    if(!items.length) return;

    // Place daily progress near the top, immediately before the timeline.
    const timeline=panel.querySelector('.timeline-list');
    if(timeline && !panel.querySelector('.day-progress-card')){
      const progress=document.createElement('section');
      progress.className='day-progress-card';
      progress.innerHTML=`
        <div class="day-progress-top"><strong>Daily progress</strong><span class="day-progress-percent">0%</span></div>
        <div class="day-progress-track"><i></i></div>
        <div class="day-progress-caption"><span class="day-progress-count">0 of ${items.length} completed</span><span>Check each time, task, or location</span></div>`;
      timeline.before(progress);
    }

    items.forEach((item,itemIndex)=>{
      let cb=item.querySelector(':scope > input[type="checkbox"]');
      const key=itemKey(panel,panelIndex,itemIndex);
      if(!cb){
        cb=document.createElement('input');
        cb.type='checkbox';
        cb.className='timeline-complete-box';
        cb.setAttribute('aria-label',`Mark ${item.querySelector('div span')?.textContent || 'timeline item'} complete`);
        cb.dataset.timelineKey=key;
        const time=item.querySelector(':scope > time');
        time?.insertAdjacentElement('afterend',cb);
        cb.checked=localStorage.getItem(key)==='true' || item.classList.contains('completed');
      }else{
        cb.classList.add('timeline-complete-box');
        cb.checked=localStorage.getItem(key)==='true';
      }
      setVisual(item,cb.checked);

      cb.addEventListener('click',e=>e.stopPropagation());
      cb.addEventListener('change',e=>{
        e.stopPropagation();
        localStorage.setItem(key,String(cb.checked));
        setVisual(item,cb.checked);
        updatePanelProgress(panel);
        if(typeof updateNextEvent==='function') updateNextEvent();
        if(typeof renderTrailMode==='function') renderTrailMode();
      });
    });
    updatePanelProgress(panel);
  });

  // Keep daily progress synchronized when another control changes the same photo checkbox.
  document.addEventListener('change',e=>{
    if(e.target.matches('.timeline-item > input[type="checkbox"]')) setTimeout(updateAllDayProgress,0);
  });
  updateAllDayProgress();
})();
