const LS_KEY = "gym_tracker_full_v10";
const DEFAULT_TARGET = "6-8";

/* =========================
   GA4 PRO (Livello 3) — SOLO AGGIUNTE
   - retention (first_open / returning_user / daily_open)
   - screen_view
   - workout funnel + exercise usage
   - backup/import usage
========================= */
function track(eventName, params = {}){
  try{
    if (typeof window.gtag === "function"){
      window.gtag("event", eventName, params);
    }
  }catch{}
}
function trackOncePerDay(eventName, params = {}){
  try{
    const key = `gt_once_${eventName}_${new Date().toISOString().slice(0,10)}`;
    if(localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    track(eventName, params);
  }catch{}
}
(function(){
  try{
    const now = Date.now();
    const last = Number(localStorage.getItem("gt_last_visit_ts") || "0");
    if(!last){
      track("first_open");
    }else{
      const diffH = (now - last) / (1000*60*60);
      if(diffH >= 24){
        track("returning_user", { hours_since_last: Math.round(diffH) });
      }
    }
    localStorage.setItem("gt_last_visit_ts", String(now));
    trackOncePerDay("daily_open");
  }catch{}
})();

/* =========================
   GOOGLE LOGIN (Firebase Auth) — SOLO LOGIN
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBhEVHNm0NCHGKmqoBiOHM3m7pIT4mTSNs",
  authDomain: "gym-tracker-f0daf.firebaseapp.com",
  projectId: "gym-tracker-f0daf",
  storageBucket: "gym-tracker-f0daf.firebasestorage.app",
  messagingSenderId: "568544891751",
  appId: "1:568544891751:web:76fa6093c115b31c0d15c2",
  measurementId: "G-MV5J2E20CB"
};

function initGoogleLogin(){
  const btnIn = document.getElementById("btnGoogleIn");
  const btnOut = document.getElementById("btnGoogleOut");
  const badge = document.getElementById("userBadge");

  if (!window.firebase || !firebaseConfig || !firebaseConfig.apiKey){
    btnIn && btnIn.classList.add("hidden");
    btnOut && btnOut.classList.add("hidden");
    if (badge) badge.textContent = "";
    return;
  }

  try {
    if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
  } catch {}

  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  if (btnIn){
    btnIn.addEventListener("click", async ()=>{
      try{
        await auth.signInWithRedirect(provider);
      }catch(e){
        alert("Errore login: " + (e?.message || e));
      }
    });
  }

  if (btnOut){
    btnOut.addEventListener("click", async ()=>{
      try{
        await auth.signOut();
      }catch(e){
        alert("Errore logout: " + (e?.message || e));
      }
    });
  }

  auth.getRedirectResult().catch(()=>{});

  auth.onAuthStateChanged((user)=>{
    if (!user){
      btnIn && btnIn.classList.remove("hidden");
      btnOut && btnOut.classList.add("hidden");
      if (badge) badge.textContent = "";
      return;
    }

    btnIn && btnIn.classList.add("hidden");
    btnOut && btnOut.classList.remove("hidden");
    if (badge) badge.textContent = `Connesso: ${user.displayName || "Google"} ✅`;
  });
}

/* Template base */
const TEMPLATE = {
  days: [
    { id:"push",  name:"PUSH",  exercises:[
      { name:"Chest press", targets:["6-8","6-8","8-10"] },
      { name:"Spinte panca 15°", targets:["6-8","6-8","6-8"] },
      { name:"Croci cavo basso panca (5° buco)", targets:["6-8","6-8","6-8"] },
      { name:"Lento avanti (bilanciere multi)", targets:["6-8","6-8","6-8"] },
      { name:"Spalle frontali cavo basso (cavigliera)", targets:["6-8","6-8","6-8"] },
      { name:"Cavo alto tirata", targets:["6-8","6-8","6-8"] },
      { name:"Push down corda", targets:["6-8","6-8","6-8"] },
      { name:"Addominali machine (opzionale)", targets:["6-8","6-8","6-8"] }
    ]},
    { id:"pull",  name:"PULL",  exercises:[
      { name:"Lat presa stretta", targets:["6-8","6-8","8-10"] },
      { name:"Rematore appoggiato panca (2 manubri)", targets:["6-8","6-8","6-8"] },
      { name:"Tirata cavo alto panca 60° (schiena)", targets:["6-8","6-8","6-8"] },
      { name:"Row singola", targets:["6-8","6-8","6-8"] },
      { name:"Curl cavo basso monolaterale", targets:["6-8","6-8","6-8"] },
      { name:"Curl EZ", targets:["6-8","6-8","6-8"] },
      { name:"Addominali machine (opzionale)", targets:["6-8","6-8","6-8"] }
    ]},
    { id:"legs",  name:"LEGS",  exercises:[
      { name:"Squat machine", targets:["6-8","6-8","8-10"] },
      { name:"Leg extension", targets:["6-8","6-8","6-8"] },
      { name:"Leg press", targets:["6-8","6-8","6-8"] },
      { name:"RDL manubri", targets:["6-8","6-8","6-8"] },
      { name:"Addominali machine", targets:["6-8","6-8","6-8"] }
    ]},
    { id:"upper", name:"UPPER", exercises:[
      { name:"Panca multi", targets:["6-8","6-8","8-10"] },
      { name:"Croci cavo alto", targets:["6-8","6-8","6-8"] },
      { name:"Pulley", targets:["6-8","6-8","6-8"] },
      { name:"Pull down", targets:["6-8","6-8","6-8"] },
      { name:"Corda sopra la testa", targets:["6-8","6-8","6-8"] },
      { name:"Hammer curl", targets:["6-8","6-8","6-8"] },
      { name:"French press EZ 60° (SS)", targets:["6-8","6-8","6-8"] },
      { name:"Curl manubri panca 60° (SS)", targets:["6-8","6-8","6-8"] },
      { name:"Addominali machine (opzionale)", targets:["6-8","6-8","6-8"] }
    ]}
  ]
};

/* Utils */
function todayISO(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}
function fmtDate(iso){
  const [y,m,d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
function esc(s){
  return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function hapticLight(){ if (navigator.vibrate) navigator.vibrate(12); }
function hapticMedium(){ if (navigator.vibrate) navigator.vibrate([18,20,18]); }

function normName(s){
  return (s || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
}
function isExactExerciseMatch(exName, query){
  const a = normName(exName);
  const q = normName(query);
  if(!q) return false;
  return a === q;
}
// ==========================
// PROGRESSIONE "PROSSIMA VOLTA"
// ==========================
function toNum(v){
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
}

function parseTargetRange(t){
  const s = String(t || "").trim().replace("–", "-");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if(m){
    const min = Number(m[1]), max = Number(m[2]);
    if(Number.isFinite(min) && Number.isFinite(max)) return {min, max};
  }
  const single = Number(s);
  if(Number.isFinite(single)) return {min: single, max: single};
  return null;
}

function roundToStep(n, step){
  if(!Number.isFinite(n) || !Number.isFinite(step) || step <= 0) return n;
  return Math.round(n / step) * step;
}

function suggestNextKg(lastKg, lastReps, targetText, step = 2.5){
  const kg = toNum(lastKg);
  const reps = toNum(lastReps);
  const r = parseTargetRange(targetText);

  if(!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(reps) || reps <= 0 || !r) return null;

  let next = kg;
  let note = "Mantieni";

  if(reps >= r.max){
    next = kg + step;
    note = `Aumenta +${step}kg`;
  }else if(reps < r.min){
    next = Math.max(0, kg - step);
    note = `Scendi -${step}kg`;
  }

  next = roundToStep(next, step);
  return { nextKg: next, note, min:r.min, max:r.max };
}

function slugId(s){
  return normName(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function uniqueDayId(base){
  const b = slugId(base) || "scheda";
  let id = b;
  let i = 2;
  while(state.template.days.some(d => d.id === id)){
    id = `${b}-${i}`;
    i++;
  }
  return id;
}

/* State */
function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){
    const init = { template:TEMPLATE, currentDayId:TEMPLATE.days[0].id, draft:null, sessions:[], measures:[] };
    localStorage.setItem(LS_KEY, JSON.stringify(init));
    return init;
  }
  try{ return JSON.parse(raw); }
  catch{ localStorage.removeItem(LS_KEY); return loadState(); }
}
let state = loadState();
// assicura: più recente -> più vecchio
try{ state.sessions && state.sessions.sort((a,b)=>b.date.localeCompare(a.date)); }catch{}
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function getDay(id){ return state.template.days.find(d=>d.id===id); }

/* Draft (usato dal workout) */
function findLastExerciseItemByName(exName){
  const q = normName(exName);
  // sessions: più recente -> più vecchio (ultimo salvato in cima)
  for(let i = 0; i < state.sessions.length; i++){
    const sess = state.sessions[i];
    const it = (sess.items || []).find(x => normName(x.exName) === q);
    if(it) return it;
  }
  return null;
}

function makeDraft(dayId){
  const day = getDay(dayId);
  return {
    date: todayISO(),
    dayId,
    items: (day?.exercises || []).map(ex => {
      const lastItem = findLastExerciseItemByName(ex.name);
      return {
        exName: ex.name,
        comment: (lastItem?.comment || ""),
        sets: ex.targets.map((t, idx) => {
          const lastSet = lastItem?.sets?.[idx];
         const lastKg = (lastSet?.kg || "");
const lastReps = (lastSet?.reps || "");
const sug = suggestNextKg(lastKg, lastReps, t, 2.5);

return {
  target: t,
  kg: lastKg,
  reps: "",
  done: false,

  // ✅ info per UI "Prossima volta"
  lastKg,
  lastReps,
  sugKg: sug ? String(sug.nextKg) : "",
  sugNote: sug ? sug.note : ""
};

        })
      };
    })
  };
}
function countDone(draft){
  let done=0,total=0;
  for(const it of draft.items){ total += it.sets.length; done += it.sets.filter(s=>s.done).length; }
  return {done,total};
}

/* DOM shared */
const topTitle = document.getElementById("topTitle");
const topSub = document.getElementById("topSub");
const navItems = document.querySelectorAll(".navItem");

const vWorkout = document.getElementById("view-workout");
const vHistory = document.getElementById("view-history");
const vMeasures = document.getElementById("view-measures");

const modal = document.getElementById("modal");
const modalIcon = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalBtn = document.getElementById("modalBtn");

/* Modal */
function openModal({icon="✅", title="Ok", sub=""}){
  modalIcon.textContent = icon;
  modalTitle.textContent = title;
  modalSub.textContent = sub;
  modal.classList.remove("hidden");
}
function closeModal(){ modal.classList.add("hidden"); }
modalBtn && modalBtn.addEventListener("click", closeModal);
modal && modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

/* View switch (chiama render per view se esiste) */
function show(view){
  vWorkout && vWorkout.classList.toggle("hidden", view!=="workout");
  vHistory && vHistory.classList.toggle("hidden", view!=="history");
  vMeasures && vMeasures.classList.toggle("hidden", view!=="measures");

  navItems.forEach(b => b.classList.toggle("active", b.dataset.view===view));
  if(topTitle){
    topTitle.textContent = view==="workout" ? "Workout" : (view==="history" ? "Storico" : "Misure");
  }
  if(topSub){
    topSub.textContent = `Storico: ${state.sessions.length} • Schede: ${state.template.days.length}`;
  }

  try{ if(view==="workout" && typeof renderWorkout === "function") renderWorkout(); }catch{}
  try{
    if(view==="history"){
      if(typeof renderHistoryFilters === "function") renderHistoryFilters();
      if(typeof renderHistory === "function") renderHistory();
      if(typeof renderCharts === "function") renderCharts();
    }
  }catch{}
  try{ if(view==="measures" && typeof renderMeasures === "function") renderMeasures(); }catch{}

  track("screen_view", { screen: view });
}

navItems.forEach(b => b.addEventListener("click", ()=> show(b.dataset.view)));

/* Render all (chiama i render per file) */
function renderAll(){
  try{ if(typeof renderChips === "function") renderChips(); }catch{}
  try{ if(typeof renderWorkout === "function") renderWorkout(); }catch{}
  try{ if(typeof renderHistoryFilters === "function") renderHistoryFilters(); }catch{}
  try{ if(typeof renderHistory === "function") renderHistory(); }catch{}
  try{ if(typeof renderCharts === "function") renderCharts(); }catch{}
  try{ if(typeof renderMeasures === "function") renderMeasures(); }catch{}

  if(topSub){
    topSub.textContent = `Storico: ${state.sessions.length} • Schede: ${state.template.days.length}`;
  }
}
