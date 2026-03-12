// app.settings.js
(function(){
  const btnSettings = document.getElementById("btnSettings");
  const modal       = document.getElementById("settingsModal");
  const btnClose    = document.getElementById("btnSettingsClose");

  const themeToggle    = document.getElementById("themeToggle");
  const themeLabel     = document.getElementById("themeLabel");
  const langSelect     = document.getElementById("langSelect");
  const langLabel      = document.getElementById("langLabel");
  const vibrationToggle  = document.getElementById("vibrationToggle");
  const kgStepSelect     = document.getElementById("kgStepSelect");
  const restDefaultSelect= document.getElementById("restDefaultSelect");
  const confirmSaveToggle= document.getElementById("confirmSaveToggle");
  const wakeLockToggle   = document.getElementById("wakeLockToggle");
  const btnExportData    = document.getElementById("btnExportData");
  const importFileInput  = document.getElementById("importFileInput");
  const btnResetApp      = document.getElementById("btnResetApp");

  const THEME_KEY        = "gt_theme";
  const LANG_KEY         = "gt_lang";
  const VIBRATION_KEY    = "gt_vibration";
  const KG_STEP_KEY      = "gt_kg_step";
  const REST_DEFAULT_KEY = "gt_rest_default";
  const CONFIRM_SAVE_KEY = "gt_confirm_save";
  const WAKE_LOCK_KEY    = "gt_wake_lock";

  let __gt_lang = "it";
  let _wakeLock = null;

  /* ======= THEME ======= */
  function applyTheme(mode){
    const html = document.documentElement;
    if(mode === "light"){
      html.setAttribute("data-theme","light");
      if(themeToggle) themeToggle.checked = true;
      if(themeLabel)  themeLabel.textContent = (__gt_lang==="en" ? "Light" : "Bianco");
    }else{
      html.removeAttribute("data-theme");
      if(themeToggle) themeToggle.checked = false;
      if(themeLabel)  themeLabel.textContent = (__gt_lang==="en" ? "Dark" : "Nero");
    }
  }
  function loadTheme(){
    const s = (localStorage.getItem(THEME_KEY)||"dark").toLowerCase();
    applyTheme(s==="light"?"light":"dark");
  }
  function saveTheme(m){ localStorage.setItem(THEME_KEY, m); }

  /* ======= LANGUAGE ======= */
  const T = {
    it:{
      title_google_in:"Accedi con Google",title_google_out:"Esci",title_settings:"Impostazioni",
      settings_title:"Impostazioni",settings_close:"Chiudi",settings_theme:"Tema",settings_language:"Lingua",langLabel:"Italiano",
      add_ex:"＋ Esercizio",save_plan:"💾 Salva scheda",start_workout:"Inizia allenamento",cancel:"Annulla",save_workout:"Salva allenamento",
      resume_title:"⏸ Allenamento in corso",resume_continue:"▶️ Continua",resume_discard:"🗑️ Annulla",resume_hint:"Se hai chiuso per sbaglio, riprendi da dove eri rimasto.",
      rest_title:"⏱ Timer recupero",rest_seconds:"Secondi recupero",rest_start:"Avvia",rest_reset:"Reset",
      mini_state:"Stato",mini_done:"Completati",
      hist_placeholder:'Scrivi NOME ESATTO esercizio (es. "Leg press")',clear:"Svuota",show_pr:"🔥 Scopri il PR",
      note:'Nota: la ricerca è esatta. Se scrivi "leg" non trova nulla: devi scrivere "leg press".',
      m_date:"Data",m_weight:"Peso (kg)",m_chest:"Petto (cm)",m_shoulders:"Spalle (cm)",m_waist:"Vita (cm)",
      m_arm_l:"Braccio SX (cm)",m_arm_r:"Braccio DX (cm)",m_quad_l:"Quad SX (cm)",m_quad_r:"Quad DX (cm)",
      save_measures:"💾 Salva misure",clear_measures:"🗑️ Svuota storico",measures_history:"Storico misure",back:"Indietro",
      nav_workout:"Workout",nav_history:"Storico",nav_measures:"Misure"
    },
    en:{
      title_google_in:"Sign in with Google",title_google_out:"Sign out",title_settings:"Settings",
      settings_title:"Settings",settings_close:"Close",settings_theme:"Theme",settings_language:"Language",langLabel:"English",
      add_ex:"＋ Exercise",save_plan:"💾 Save plan",start_workout:"Start workout",cancel:"Cancel",save_workout:"Save workout",
      resume_title:"⏸ Workout in progress",resume_continue:"▶️ Continue",resume_discard:"🗑️ Discard",resume_hint:"If you closed by mistake, continue where you left off.",
      rest_title:"⏱ Rest timer",rest_seconds:"Rest seconds",rest_start:"Start",rest_reset:"Reset",
      mini_state:"Status",mini_done:"Completed",
      hist_placeholder:'Type the EXACT exercise name (e.g. "Leg press")',clear:"Clear",show_pr:"🔥 Show PR",
      note:'Note: search is exact. If you type "leg" it finds nothing: you must type "leg press".',
      m_date:"Date",m_weight:"Weight (kg)",m_chest:"Chest (cm)",m_shoulders:"Shoulders (cm)",m_waist:"Waist (cm)",
      m_arm_l:"Left arm (cm)",m_arm_r:"Right arm (cm)",m_quad_l:"Left quad (cm)",m_quad_r:"Right quad (cm)",
      save_measures:"💾 Save measures",clear_measures:"🗑️ Clear history",measures_history:"Measures history",back:"Back",
      nav_workout:"Workout",nav_history:"History",nav_measures:"Measures"
    }
  };

  function setTextById(id,text){ const el=document.getElementById(id); if(el) el.textContent=text; }
  function setTitleById(id,text){ const el=document.getElementById(id); if(el) el.setAttribute("title",text); }
  function setPlaceholderById(id,text){ const el=document.getElementById(id); if(el) el.setAttribute("placeholder",text); }
  function setFirstExactText(sel,exact,newTxt){
    const nodes=document.querySelectorAll(sel);
    for(const el of nodes){ if((el.textContent||"").trim()===exact){ el.textContent=newTxt; return; } }
  }

  function applyLanguage(lang){
    __gt_lang=(lang==="en")?"en":"it";
    const t=T[__gt_lang];
    setTitleById("btnAuthOpen",t.title_google_in);
    setTitleById("btnAuthOut",t.title_google_out);
    setTitleById("btnSettings",t.title_settings);
    const st=document.querySelector("#settingsModal .modalTitle");
    if(st) st.textContent=t.settings_title;
    setTextById("btnSettingsClose",t.settings_close);
    if(langLabel) langLabel.textContent=t.langLabel;
    setTextById("btnAddExercise",t.add_ex);
    setTextById("btnSavePlan",t.save_plan);
    setTextById("btnStart",t.start_workout);
    setTextById("btnDiscard",t.cancel);
    setTextById("btnSave",t.save_workout);
    setFirstExactText("#resumeWorkoutCard div","⏸ Allenamento in corso",t.resume_title);
    setTextById("btnResumeWorkout",t.resume_continue);
    setTextById("btnDiscardResumeWorkout",t.resume_discard);
    setFirstExactText("#resumeWorkoutCard .tiny","Se hai chiuso per sbaglio, riprendi da dove eri rimasto.",t.resume_hint);
    setFirstExactText("#restTimerCard .cardTitle","⏱ Timer recupero",t.rest_title);
    setFirstExactText("#restTimerCard label span","Secondi recupero",t.rest_seconds);
    setTextById("btnStartRest",t.rest_start);
    setTextById("btnResetRest",t.rest_reset);
    setFirstExactText(".miniLabel","Stato",t.mini_state);
    setFirstExactText(".miniLabel","Completati",t.mini_done);
    setPlaceholderById("histSearch",t.hist_placeholder);
    setTextById("btnClearHistory",t.clear);
    setTextById("btnShowPR",t.show_pr);
    setTextById("btnSaveMeasures",t.save_measures);
    setTextById("btnClearMeasures",t.clear_measures);
    setTextById("btnOpenMeasuresHistoryPage",t.measures_history);
    setTextById("btnBackToMeasures",t.back);
    const mhTitle=document.querySelector("#view-measures-history .cardTitle");
    if(mhTitle) mhTitle.textContent=t.measures_history;
    const w=document.querySelector('.bottomNav [data-view="workout"] .navTxt');
    const h=document.querySelector('.bottomNav [data-view="history"] .navTxt');
    const m=document.querySelector('.bottomNav [data-view="measures"] .navTxt');
    if(w) w.textContent=t.nav_workout;
    if(h) h.textContent=t.nav_history;
    if(m) m.textContent=t.nav_measures;
    try{
      if(themeLabel){
        const isLight=!!document.documentElement.getAttribute("data-theme");
        themeLabel.textContent=isLight?(__gt_lang==="en"?"Light":"Bianco"):(__gt_lang==="en"?"Dark":"Nero");
      }
    }catch{}
  }
  function loadLanguage(){
    const s=(localStorage.getItem(LANG_KEY)||"it").toLowerCase();
    const lang=(s==="en")?"en":"it";
    applyLanguage(lang);
    if(langSelect) langSelect.value=lang;
  }
  function saveLanguage(lang){ localStorage.setItem(LANG_KEY,lang); }
  function bindLanguage(){
    if(!langSelect) return;
    langSelect.addEventListener("change",()=>{
      const lang=(langSelect.value==="en")?"en":"it";
      saveLanguage(lang); applyLanguage(lang);
      try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
    });
  }

  /* ======= VIBRATION ======= */
  function loadVibration(){
    const s=localStorage.getItem(VIBRATION_KEY);
    if(vibrationToggle) vibrationToggle.checked=(s!=="off");
  }
  function saveVibration(){ if(!vibrationToggle) return; localStorage.setItem(VIBRATION_KEY,vibrationToggle.checked?"on":"off"); }

  /* ======= KG STEP ======= */
  function loadKgStep(){
    const s=localStorage.getItem(KG_STEP_KEY)||"2.5";
    if(kgStepSelect) kgStepSelect.value=s;
  }
  function saveKgStep(){ if(!kgStepSelect) return; localStorage.setItem(KG_STEP_KEY,kgStepSelect.value); }
  // esponi globalmente così app.core.js può leggerla
  window.getKgStep=()=>parseFloat(localStorage.getItem(KG_STEP_KEY)||"2.5");

  /* ======= REST DEFAULT ======= */
  function loadRestDefault(){
    const s=localStorage.getItem(REST_DEFAULT_KEY)||"90";
    if(restDefaultSelect) restDefaultSelect.value=s;
    // applica anche all'input timer se esiste
    const inp=document.getElementById("restSeconds");
    if(inp) inp.value=s;
  }
  function saveRestDefault(){
    if(!restDefaultSelect) return;
    const v=restDefaultSelect.value;
    localStorage.setItem(REST_DEFAULT_KEY,v);
    const inp=document.getElementById("restSeconds");
    if(inp){ inp.value=v; inp.dispatchEvent(new Event("input")); }
  }

  /* ======= CONFIRM SAVE ======= */
  function loadConfirmSave(){
    const s=localStorage.getItem(CONFIRM_SAVE_KEY);
    if(confirmSaveToggle) confirmSaveToggle.checked=(s==="on");
  }
  function saveConfirmSave(){ if(!confirmSaveToggle) return; localStorage.setItem(CONFIRM_SAVE_KEY,confirmSaveToggle.checked?"on":"off"); }
  window.isConfirmSaveEnabled=()=>localStorage.getItem(CONFIRM_SAVE_KEY)==="on";

  /* ======= WAKE LOCK ======= */
  async function requestWakeLock(){
    if(!("wakeLock" in navigator)) return;
    try{
      _wakeLock=await navigator.wakeLock.request("screen");
      _wakeLock.addEventListener("release",()=>{ _wakeLock=null; });
    }catch{}
  }
  function releaseWakeLock(){
    if(_wakeLock){ _wakeLock.release().catch(()=>{}); _wakeLock=null; }
  }
  function loadWakeLock(){
    const s=localStorage.getItem(WAKE_LOCK_KEY);
    if(wakeLockToggle) wakeLockToggle.checked=(s==="on");
    if(s==="on") requestWakeLock();
  }
  function saveWakeLock(){
    if(!wakeLockToggle) return;
    const on=wakeLockToggle.checked;
    localStorage.setItem(WAKE_LOCK_KEY,on?"on":"off");
    if(on) requestWakeLock(); else releaseWakeLock();
  }
  // richiedi di nuovo se la pagina torna in foreground
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden && localStorage.getItem(WAKE_LOCK_KEY)==="on" && !_wakeLock) requestWakeLock();
  });

  /* ======= EXPORT ======= */
  function exportData(){
    try{
      const raw=localStorage.getItem("gym_tracker_full_v10")||"{}";
      const blob=new Blob([raw],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      const date=new Date().toISOString().slice(0,10);
      a.href=url; a.download=`gym-tracker-backup-${date}.json`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
      try{ if(typeof openModal==="function") openModal({icon:"📤",title:"Backup esportato",sub:"File JSON scaricato con successo."}); }catch{}
    }catch(e){
      try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:"Errore",sub:"Impossibile esportare i dati."}); }catch{}
    }
  }

  /* ======= IMPORT ======= */
  function importData(file){
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const parsed=JSON.parse(e.target.result);
        if(!parsed.template||!Array.isArray(parsed.sessions)) throw new Error("File non valido");
        if(!confirm("Vuoi davvero sostituire tutti i dati con il backup? L'operazione è irreversibile.")) return;
        localStorage.setItem("gym_tracker_full_v10",JSON.stringify(parsed));
        // ricarica stato globale
        try{
          if(typeof state!=="undefined"){
            const fresh=JSON.parse(localStorage.getItem("gym_tracker_full_v10"));
            Object.assign(state,fresh);
            if(typeof renderAll==="function") renderAll();
          }
        }catch{}
        try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
        try{ if(typeof openModal==="function") openModal({icon:"📥",title:"Backup importato",sub:"Dati ripristinati correttamente."}); }catch{}
      }catch(err){
        try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:"File non valido",sub:"Assicurati di usare un backup esportato da Gym Tracker."}); }catch{}
      }
    };
    reader.readAsText(file);
  }

  /* ======= RESET APP ======= */
  function resetApp(){
    if(!confirm("Sei sicuro? Questa operazione cancellerà TUTTI i tuoi allenamenti, misure e schede. È irreversibile.")) return;
    if(!confirm("Ultima conferma: vuoi davvero azzerare tutto?")) return;
    localStorage.removeItem("gym_tracker_full_v10");
    try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
    location.reload();
  }

  /* ======= OPEN / CLOSE ======= */
  function openSettings(){
    if(!modal) return;
    modal.classList.remove("hidden");
    try{ if(typeof hapticLight==="function") hapticLight(); }catch{}
  }
  function closeSettings(){
    if(!modal) return;
    modal.classList.add("hidden");
    try{ if(typeof hapticLight==="function") hapticLight(); }catch{}
  }

  /* ======= INIT ======= */
  window.initSettings=function(){
    if(window.__gt_settings_bound) return;
    window.__gt_settings_bound=true;

    loadLanguage();
    loadTheme();
    loadVibration();
    loadKgStep();
    loadRestDefault();
    loadConfirmSave();
    loadWakeLock();

    if(btnSettings) btnSettings.addEventListener("click",openSettings);
    if(btnClose)    btnClose.addEventListener("click",closeSettings);
    if(modal)       modal.addEventListener("click",(e)=>{ if(e.target===modal) closeSettings(); });
    window.addEventListener("keydown",(e)=>{ if(e.key==="Escape"&&modal&&!modal.classList.contains("hidden")) closeSettings(); });

    if(themeToggle) themeToggle.addEventListener("change",()=>{ const m=themeToggle.checked?"light":"dark"; applyTheme(m); saveTheme(m); try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{} });
    if(vibrationToggle) vibrationToggle.addEventListener("change",saveVibration);
    if(kgStepSelect)    kgStepSelect.addEventListener("change",saveKgStep);
    if(restDefaultSelect) restDefaultSelect.addEventListener("change",saveRestDefault);
    if(confirmSaveToggle) confirmSaveToggle.addEventListener("change",saveConfirmSave);
    if(wakeLockToggle)    wakeLockToggle.addEventListener("change",saveWakeLock);
    if(btnExportData)     btnExportData.addEventListener("click",exportData);
    if(importFileInput)   importFileInput.addEventListener("change",(e)=>{ importData(e.target.files[0]); e.target.value=""; });
    if(btnResetApp)       btnResetApp.addEventListener("click",resetApp);

    bindLanguage();
  };

  try{ window.initSettings(); }catch{}
})();
