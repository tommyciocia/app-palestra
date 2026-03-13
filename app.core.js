const LS_KEY = "gym_tracker_full_v10";
const DEFAULT_TARGET = "6-8";

/* =========================
   GA4 TRACKING
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
   FIREBASE CONFIG
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

/* =========================
   EMAIL / PASSWORD LOGIN
========================= */
let _auth = null;
let _db   = null;
let _currentUser = null;
let _syncTimeout = null;

function getAuth(){
  if(_auth) return _auth;
  if(!window.firebase) return null;
  try{
    if(!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
    _auth = firebase.auth();
  }catch{}
  return _auth;
}

function getDb(){
  if(_db) return _db;
  if(!window.firebase || !firebase.firestore) return null;
  try{ _db = firebase.firestore(); }catch{}
  return _db;
}

/* ---------- UI helpers ---------- */
function setLoginUI(user){
  _currentUser = user;
  const badge  = document.getElementById("userBadge");
  const btnIn  = document.getElementById("btnAuthOpen");
  const btnOut = document.getElementById("btnAuthOut");

  if(user){
    if(badge)  badge.textContent = `✅ ${user.email}`;
    if(btnIn)  btnIn.classList.add("hidden");
    if(btnOut) btnOut.classList.remove("hidden");
  } else {
    if(badge)  badge.textContent = "";
    if(btnIn)  btnIn.classList.remove("hidden");
    if(btnOut) btnOut.classList.add("hidden");
  }
}

/* ---------- Firestore sync ---------- */
const FS_COLLECTION = "gym_data";
const FS_DOC        = "state";

async function pushToCloud(){
  const db   = getDb();
  const user = _currentUser;
  if(!db || !user) return;
  try{
    const payload = JSON.stringify(state);
    await db.collection(FS_COLLECTION).doc(user.uid).set({ payload, updatedAt: Date.now() });
  }catch(e){ console.warn("pushToCloud:", e); }
}

async function pullFromCloud(){
  const db   = getDb();
  const user = _currentUser;
  if(!db || !user) return null;
  try{
    const doc = await db.collection(FS_COLLECTION).doc(user.uid).get();
    if(doc.exists){
      const { payload } = doc.data();
      return JSON.parse(payload);
    }
  }catch(e){ console.warn("pullFromCloud:", e); }
  return null;
}

function schedulePush(){
  // debounce: aspetta 1.5s dopo l'ultima modifica prima di salvare sul cloud
  clearTimeout(_syncTimeout);
  _syncTimeout = setTimeout(()=>{ pushToCloud(); }, 1500);
}

/* ---------- Login modal ---------- */
function openAuthModal(mode){
  const m = document.getElementById("authModal");
  if(!m) return;

  // reset
  const err   = document.getElementById("authError");
  const email = document.getElementById("authEmail");
  const pass  = document.getElementById("authPass");
  const title = document.getElementById("authModalTitle");
  const subT  = document.getElementById("authModalSub");
  const btnDo = document.getElementById("btnAuthDo");
  const lnkSwitch = document.getElementById("authSwitchLink");
  const wrapForgot = document.getElementById("authForgotWrap");

  if(err)   err.textContent = "";
  if(email) email.value = "";
  if(pass)  pass.value = "";

  m.dataset.mode = mode || "login";

  if(typeof window._applyAuthModal === "function"){
    window._applyAuthModal(mode || "login");
    if(wrapForgot){
      if(mode==="register") wrapForgot.classList.add("hidden");
      else wrapForgot.classList.remove("hidden");
    }
  } else if(mode === "register"){
    if(title)     title.textContent  = "Sign up";
    if(subT)      subT.textContent   = "Create an account to sync your data.";
    if(btnDo)     btnDo.textContent  = "Create account";
    if(lnkSwitch) lnkSwitch.textContent = "Already have an account? Sign in";
    if(wrapForgot) wrapForgot.classList.add("hidden");
  } else {
    if(title)     title.textContent  = "Sign in";
    if(subT)      subT.textContent   = "Sign in to sync your data.";
    if(btnDo)     btnDo.textContent  = "Sign in";
    if(lnkSwitch) lnkSwitch.textContent = "No account? Sign up";
    if(wrapForgot) wrapForgot.classList.remove("hidden");
  }

  m.classList.remove("hidden");
  try{ if(typeof hapticLight==="function") hapticLight(); }catch{}
}

function closeAuthModal(){
  const m = document.getElementById("authModal");
  if(m) m.classList.add("hidden");
}

async function doAuthAction(){
  const m     = document.getElementById("authModal");
  const mode  = m?.dataset?.mode || "login";
  const email = (document.getElementById("authEmail")?.value || "").trim();
  const pass  = (document.getElementById("authPass")?.value  || "");
  const pass2 = (document.getElementById("authPass2")?.value || "");
  const err   = document.getElementById("authError");
  const btnDo = document.getElementById("btnAuthDo");

  if(!email || !pass){
    if(err) err.textContent = (typeof window.t==="function"?window.t("auth_no_email"):"Inserisci email e password.");
    return;
  }

  // nessun campo conferma password: registrazione diretta

  if(btnDo) btnDo.disabled = true;
  if(err)   err.textContent = "";

  const auth = getAuth();
  if(!auth){
    if(err) err.textContent = (typeof window.t==="function"?window.t("auth_firebase_unavailable"):"Firebase non disponibile.");
    if(btnDo) btnDo.disabled = false;
    return;
  }

  try{
    if(mode === "register"){
      await auth.createUserWithEmailAndPassword(email, pass);
    } else {
      await auth.signInWithEmailAndPassword(email, pass);
    }
    closeAuthModal();
    try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
  } catch(e){
    const msgs = {
      "auth/user-not-found":      (typeof window.t==="function"?window.t("auth_err_user_not_found"):"Nessun account con questa email."),
      "auth/wrong-password":      (typeof window.t==="function"?window.t("auth_err_wrong_pass"):"Password errata."),
      "auth/email-already-in-use":(typeof window.t==="function"?window.t("auth_err_email_in_use"):"Email già registrata."),
      "auth/weak-password":       (typeof window.t==="function"?window.t("auth_err_weak_pass"):"Password troppo corta."),
      "auth/invalid-email":       (typeof window.t==="function"?window.t("auth_err_invalid_email"):"Email non valida."),
      "auth/invalid-credential":  (typeof window.t==="function"?window.t("auth_err_invalid_cred"):"Credenziali non valide."),
      "auth/too-many-requests":   (typeof window.t==="function"?window.t("auth_err_too_many"):"Troppi tentativi.")
    };
    if(err) err.textContent = msgs[e.code] || ("Errore: " + (e.message || e.code));
  } finally {
    if(btnDo) btnDo.disabled = false;
  }
}

async function doForgotPassword(){
  const email = (document.getElementById("authEmail")?.value || "").trim();
  const err   = document.getElementById("authError");
  if(!email){
    if(err) err.textContent = (typeof window.t==="function"?window.t("auth_forgot_no_email"):"Inserisci prima la tua email.");
    return;
  }
  const auth = getAuth();
  try{
    await auth.sendPasswordResetEmail(email);
    if(err){ err.style.color = "var(--primary)"; err.textContent = (typeof window.t==="function"?window.t("auth_forgot_sent"):"Email inviata! Controlla la casella."); }
  }catch(e){
    if(err){ err.style.color = ""; err.textContent = "Errore: " + (e.message || e.code); }
  }
}

async function doSignOut(){
  const auth = getAuth();
  if(!auth) return;
  try{ await auth.signOut(); }catch{}
}

function initEmailLogin(){
  const auth = getAuth();
  if(!auth) return;

  // bottoni topbar
  const btnIn  = document.getElementById("btnAuthOpen");
  const btnOut = document.getElementById("btnAuthOut");
  if(btnIn)  btnIn.addEventListener("click",  ()=> openAuthModal("login"));
  if(btnOut) btnOut.addEventListener("click", doSignOut);

  // bottone "Do" nel modal
  const btnDo = document.getElementById("btnAuthDo");
  if(btnDo) btnDo.addEventListener("click", doAuthAction);

  // switch login ↔ register
  const lnk = document.getElementById("authSwitchLink");
  if(lnk) lnk.addEventListener("click", ()=>{
    const m = document.getElementById("authModal");
    openAuthModal(m?.dataset?.mode === "login" ? "register" : "login");
  });

  // forgot password
  const btnForgot = document.getElementById("btnForgotPassword");
  if(btnForgot) btnForgot.addEventListener("click", doForgotPassword);

  // chiudi modal cliccando fuori
  const m = document.getElementById("authModal");
  if(m) m.addEventListener("click", (e)=>{ if(e.target === m) closeAuthModal(); });

  // chiudi con ESC
  window.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeAuthModal();
  });

  // invio con Enter nel form
  const inputs = ["authEmail","authPass","authPass2"];
  inputs.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener("keydown", (e)=>{ if(e.key==="Enter") doAuthAction(); });
  });

  // osserva stato autenticazione
  auth.onAuthStateChanged(async (user)=>{
    setLoginUI(user);
    if(user){
      track("login", { method: "email" });
      // pull dati dal cloud e merge
      const remote = await pullFromCloud();
      if(remote){
        // merge: prendi quello con più sessioni
        const localSessions  = (state.sessions  || []).length;
        const remoteSessions = (remote.sessions || []).length;
        if(remoteSessions > localSessions){
          state = remote;
          save();
          try{ renderAll(); }catch{}
          openModal({ icon:"☁️", title:(typeof window.t==="function"?window.t("sync_title"):"Dati sincronizzati"), sub:(typeof window.t==="function"?window.t("sync_sub"):"Dati caricati dal cloud.") });
        } else if(localSessions > 0){
          // ho dati locali più recenti: li carico sul cloud
          await pushToCloud();
        }
      } else if(state.sessions?.length > 0){
        // primo accesso su questo account: carica dati locali
        await pushToCloud();
      }
    }
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

/* PROGRESSIONE "PROSSIMA VOLTA" */
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
try{ state.sessions && state.sessions.sort((a,b)=>b.date.localeCompare(a.date)); }catch{}

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  // sync al cloud se loggato
  if(_currentUser){ schedulePush(); }
}

function getDay(id){ return state.template.days.find(d=>d.id===id); }

/* Draft */
function findLastExerciseItemByName(exName){
  const q = normName(exName);
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
          const step = (typeof window.getKgStep === "function") ? window.getKgStep() : 2.5;
          const sug = suggestNextKg(lastKg, lastReps, t, step);
          return {
            target: t,
            kg: lastKg,
            reps: "",
            done: false,
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

const vWorkout  = document.getElementById("view-workout");
const vHistory  = document.getElementById("view-history");
const vMeasures = document.getElementById("view-measures");

const modal      = document.getElementById("modal");
const modalIcon  = document.getElementById("modalIcon");
const modalTitle = document.getElementById("modalTitle");
const modalSub   = document.getElementById("modalSub");
const modalBtn   = document.getElementById("modalBtn");

/* Modal */
function openModal({icon="✅", title="Ok", sub=""}){
  modalIcon.textContent  = icon;
  modalTitle.textContent = title;
  modalSub.textContent   = sub;
  modal.classList.remove("hidden");
}
function closeModal(){ modal.classList.add("hidden"); }
modalBtn  && modalBtn.addEventListener("click", closeModal);
modal     && modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

/* View switch */
function show(view){
  vWorkout  && vWorkout.classList.toggle("hidden",  view!=="workout");
  vHistory  && vHistory.classList.toggle("hidden",  view!=="history");
  vMeasures && vMeasures.classList.toggle("hidden", view!=="measures");

  navItems.forEach(b => b.classList.toggle("active", b.dataset.view===view));
  if(topTitle){
    const _vn=typeof window.t==="function";
    if(view==="workout") topTitle.textContent=_vn?window.t("nav_workout"):"Workout";
    else if(view==="history") topTitle.textContent=_vn?window.t("nav_history"):"Storico";
    else topTitle.textContent=_vn?window.t("nav_measures"):"Misure";
  }
  if(topSub){
    topSub.textContent = `Storico: ${state.sessions.length} • Schede: ${state.template.days.length}`;
  }

  try{ if(view==="workout"  && typeof renderWorkout         === "function") renderWorkout(); }catch{}
  try{
    if(view==="history"){
      if(typeof renderHistoryFilters === "function") renderHistoryFilters();
      if(typeof renderHistory        === "function") renderHistory();
      if(typeof renderCharts         === "function") renderCharts();
    }
  }catch{}
  try{ if(view==="measures" && typeof renderMeasures === "function") renderMeasures(); }catch{}

  track("screen_view", { screen: view });
}

navItems.forEach(b => b.addEventListener("click", ()=> show(b.dataset.view)));

/* Render all */
function renderAll(){
  try{ if(typeof renderChips          === "function") renderChips(); }catch{}
  try{ if(typeof renderWorkout        === "function") renderWorkout(); }catch{}
  try{ if(typeof renderHistoryFilters === "function") renderHistoryFilters(); }catch{}
  try{ if(typeof renderHistory        === "function") renderHistory(); }catch{}
  try{ if(typeof renderCharts         === "function") renderCharts(); }catch{}
  try{ if(typeof renderMeasures       === "function") renderMeasures(); }catch{}

  if(topSub){
    topSub.textContent = `Storico: ${state.sessions.length} • Schede: ${state.template.days.length}`;
  }
}
