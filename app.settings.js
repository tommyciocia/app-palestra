// app.settings.js
// Modal impostazioni + Switch Tema (OFF=Nero, ON=Bianco) + Lingua (IT/EN) SENZA modificare index
(function(){
  const btnSettings = document.getElementById("btnSettings");
  const modal = document.getElementById("settingsModal");
  const btnClose = document.getElementById("btnSettingsClose");

  const themeToggle = document.getElementById("themeToggle");
  const themeLabel  = document.getElementById("themeLabel");

  // lingua (se esistono nel modal)
  const langSelect = document.getElementById("langSelect");
  const langLabel  = document.getElementById("langLabel");

  const THEME_KEY = "gt_theme"; // "dark" | "light"
  const LANG_KEY  = "gt_lang";  // "it" | "en"

  let __gt_lang = "it";

  /* =========================
     THEME
  ========================= */
  function applyTheme(mode){
    const html = document.documentElement;
    if(mode === "light"){
      html.setAttribute("data-theme","light");
      if(themeToggle) themeToggle.checked = true;
      if(themeLabel) themeLabel.textContent = (__gt_lang === "en" ? "Light" : "Bianco");
    }else{
      html.removeAttribute("data-theme"); // default dark
      if(themeToggle) themeToggle.checked = false;
      if(themeLabel) themeLabel.textContent = (__gt_lang === "en" ? "Dark" : "Nero");
    }
  }

  function loadTheme(){
    const saved = (localStorage.getItem(THEME_KEY) || "dark").toLowerCase();
    applyTheme(saved === "light" ? "light" : "dark");
  }

  function saveTheme(mode){
    localStorage.setItem(THEME_KEY, mode);
  }

  /* =========================
     LANGUAGE (IT/EN) - NO INDEX CHANGES
  ========================= */
  const T = {
    it: {
      // top
      title_google_in: "Accedi con Google",
      title_google_out: "Esci",
      title_settings: "Impostazioni",

      // settings modal
      settings_title: "Impostazioni",
      settings_close: "Chiudi",
      settings_theme: "Tema",
      settings_language: "Lingua",
      langLabel: "Italiano",

      // workout view
      add_ex: "＋ Esercizio",
      save_plan: "💾 Salva scheda",
      start_workout: "Inizia allenamento",
      cancel: "Annulla",
      save_workout: "Salva allenamento",

      // resume card
      resume_title: "⏸ Allenamento in corso",
      resume_continue: "▶️ Continua",
      resume_discard: "🗑️ Annulla",
      resume_hint: "Se hai chiuso per sbaglio, riprendi da dove eri rimasto.",

      // timer
      rest_title: "⏱ Timer recupero",
      rest_seconds: "Secondi recupero",
      rest_start: "Avvia",
      rest_reset: "Reset",

      // mini labels
      mini_state: "Stato",
      mini_done: "Completati",

      // history
      hist_placeholder: "Scrivi NOME ESATTO esercizio (es. “Leg press”)",
      clear: "Svuota",
      show_pr: "🔥 Scopri il PR",
      note: 'Nota: la ricerca è esatta. Se scrivi “leg” non trova nulla: devi scrivere “leg press”.',

      // measures
      m_date: "Data",
      m_weight: "Peso (kg)",
      m_chest: "Petto (cm)",
      m_shoulders: "Spalle (cm)",
      m_waist: "Vita (cm)",
      m_arm_l: "Braccio SX (cm)",
      m_arm_r: "Braccio DX (cm)",
      m_quad_l: "Quad SX (cm)",
      m_quad_r: "Quad DX (cm)",
      save_measures: "💾 Salva misure",
      clear_measures: "🗑️ Svuota storico",
      measures_history: "Storico misure",
      back: "Indietro",

      // bottom nav
      nav_workout: "Workout",
      nav_history: "Storico",
      nav_measures: "Misure"
    },
    en: {
      // top
      title_google_in: "Sign in with Google",
      title_google_out: "Sign out",
      title_settings: "Settings",

      // settings modal
      settings_title: "Settings",
      settings_close: "Close",
      settings_theme: "Theme",
      settings_language: "Language",
      langLabel: "English",

      // workout view
      add_ex: "＋ Exercise",
      save_plan: "💾 Save plan",
      start_workout: "Start workout",
      cancel: "Cancel",
      save_workout: "Save workout",

      // resume card
      resume_title: "⏸ Workout in progress",
      resume_continue: "▶️ Continue",
      resume_discard: "🗑️ Discard",
      resume_hint: "If you closed by mistake, continue where you left off.",

      // timer
      rest_title: "⏱ Rest timer",
      rest_seconds: "Rest seconds",
      rest_start: "Start",
      rest_reset: "Reset",

      // mini labels
      mini_state: "Status",
      mini_done: "Completed",

      // history
      hist_placeholder: "Type the EXACT exercise name (e.g. “Leg press”)",
      clear: "Clear",
      show_pr: "🔥 Show PR",
      note: "Note: search is exact. If you type “leg” it finds nothing: you must type “leg press”.",

      // measures
      m_date: "Date",
      m_weight: "Weight (kg)",
      m_chest: "Chest (cm)",
      m_shoulders: "Shoulders (cm)",
      m_waist: "Waist (cm)",
      m_arm_l: "Left arm (cm)",
      m_arm_r: "Right arm (cm)",
      m_quad_l: "Left quad (cm)",
      m_quad_r: "Right quad (cm)",
      save_measures: "💾 Save measures",
      clear_measures: "🗑️ Clear history",
      measures_history: "Measures history",
      back: "Back",

      // bottom nav
      nav_workout: "Workout",
      nav_history: "History",
      nav_measures: "Measures"
    }
  };

  function setTextById(id, text){
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  }
  function setTitleById(id, text){
    const el = document.getElementById(id);
    if(el) el.setAttribute("title", text);
  }
  function setPlaceholderById(id, text){
    const el = document.getElementById(id);
    if(el) el.setAttribute("placeholder", text);
  }

  function setFirstExactText(selector, exactText, newText){
    const nodes = document.querySelectorAll(selector);
    for(const el of nodes){
      // solo nodi che contengono ESATTAMENTE quel testo (niente figli/HTML)
      if((el.textContent || "").trim() === exactText){
        el.textContent = newText;
        return;
      }
    }
  }

  function applyLanguage(lang){
    __gt_lang = (lang === "en") ? "en" : "it";
    const t = T[__gt_lang];

    // top buttons titles
    setTitleById("btnGoogleIn", t.title_google_in);
    setTitleById("btnGoogleOut", t.title_google_out);
    setTitleById("btnSettings", t.title_settings);

    // settings modal texts
    // titolo modal (primo .modalTitle dentro settingsModal)
    const st = document.querySelector("#settingsModal .modalTitle");
    if(st) st.textContent = t.settings_title;
    setTextById("btnSettingsClose", t.settings_close);

    // label "Tema" e "Lingua" dentro settings (senza id -> match testo esatto)
    setFirstExactText("#settingsModal .settingsBox .settingsLabel > div", "Tema", t.settings_theme);
    setFirstExactText("#settingsModal .settingsBox .settingsLabel > div", "Lingua", t.settings_language);

    if(langLabel) langLabel.textContent = t.langLabel;

    // workout buttons
    setTextById("btnAddExercise", t.add_ex);
    setTextById("btnSavePlan", t.save_plan);
    setTextById("btnStart", t.start_workout);
    setTextById("btnDiscard", t.cancel);
    setTextById("btnSave", t.save_workout);

    // resume card
    setFirstExactText("#resumeWorkoutCard div", "⏸ Allenamento in corso", t.resume_title);
    setTextById("btnResumeWorkout", t.resume_continue);
    setTextById("btnDiscardResumeWorkout", t.resume_discard);
    setFirstExactText("#resumeWorkoutCard .tiny", "Se hai chiuso per sbaglio, riprendi da dove eri rimasto.", t.resume_hint);

    // rest timer
    setFirstExactText("#restTimerCard .cardTitle", "⏱ Timer recupero", t.rest_title);
    setFirstExactText("#restTimerCard label span", "Secondi recupero", t.rest_seconds);
    setTextById("btnStartRest", t.rest_start);
    setTextById("btnResetRest", t.rest_reset);

    // mini labels
    setFirstExactText(".miniLabel", "Stato", t.mini_state);
    setFirstExactText(".miniLabel", "Completati", t.mini_done);

    // history
    setPlaceholderById("histSearch", t.hist_placeholder);
    // bottone "Svuota" in storico (ha id btnClearHistory)
    setTextById("btnClearHistory", t.clear);
    setTextById("btnShowPR", t.show_pr);

    // nota storico (div tiny muted dentro view-history)
    const noteEl = document.querySelector("#view-history .card .tiny.muted");
    if(noteEl){
      // è quella lunga; la sovrascriviamo
      noteEl.innerHTML = t.note.replace("esatta.", "<b>esatta</b>.");
    }

    // measures labels (match esatto)
    setFirstExactText("#view-measures .field span", "Data", t.m_date);
    setFirstExactText("#view-measures .field span", "Peso (kg)", t.m_weight);
    setFirstExactText("#view-measures .field span", "Petto (cm)", t.m_chest);
    setFirstExactText("#view-measures .field span", "Spalle (cm)", t.m_shoulders);
    setFirstExactText("#view-measures .field span", "Vita (cm)", t.m_waist);
    setFirstExactText("#view-measures .field span", "Braccio SX (cm)", t.m_arm_l);
    setFirstExactText("#view-measures .field span", "Braccio DX (cm)", t.m_arm_r);
    setFirstExactText("#view-measures .field span", "Quad SX (cm)", t.m_quad_l);
    setFirstExactText("#view-measures .field span", "Quad DX (cm)", t.m_quad_r);

    setTextById("btnSaveMeasures", t.save_measures);
    setTextById("btnClearMeasures", t.clear_measures);
    setTextById("btnOpenMeasuresHistoryPage", t.measures_history);
    setTextById("btnBackToMeasures", t.back);

    // measures history title (ci sono più "Storico misure": prendiamo quello in view-measures-history header)
    const mhTitle = document.querySelector("#view-measures-history .cardTitle");
    if(mhTitle) mhTitle.textContent = t.measures_history;

    // bottom nav (i tre bottoni)
    const w = document.querySelector('.bottomNav [data-view="workout"] .navTxt');
    const h = document.querySelector('.bottomNav [data-view="history"] .navTxt');
    const m = document.querySelector('.bottomNav [data-view="measures"] .navTxt');
    if(w) w.textContent = t.nav_workout;
    if(h) h.textContent = t.nav_history;
    if(m) m.textContent = t.nav_measures;

    // aggiorna label tema coerente con lingua
    try{
      if(themeLabel){
        const isLight = !!document.documentElement.getAttribute("data-theme");
        themeLabel.textContent = isLight ? (__gt_lang==="en" ? "Light" : "Bianco") : (__gt_lang==="en" ? "Dark" : "Nero");
      }
    }catch{}
  }

  function loadLanguage(){
    const saved = (localStorage.getItem(LANG_KEY) || "it").toLowerCase();
    const lang = (saved === "en") ? "en" : "it";
    applyLanguage(lang);
    if(langSelect) langSelect.value = lang;
  }

  function saveLanguage(lang){
    localStorage.setItem(LANG_KEY, lang);
  }

  function bindLanguage(){
    if(!langSelect) return;
    langSelect.addEventListener("change", ()=>{
      const lang = (langSelect.value === "en") ? "en" : "it";
      saveLanguage(lang);
      applyLanguage(lang);
      try{ if(typeof hapticMedium === "function") hapticMedium(); }catch{}
    });
  }

  /* =========================
     MODAL OPEN/CLOSE
  ========================= */
  function openSettings(){
    if(!modal) return;
    modal.classList.remove("hidden");
    try{ if(typeof hapticLight === "function") hapticLight(); }catch{}
  }

  function closeSettings(){
    if(!modal) return;
    modal.classList.add("hidden");
    try{ if(typeof hapticLight === "function") hapticLight(); }catch{}
  }

  window.initSettings = function(){
    if(window.__gt_settings_bound) return;
    window.__gt_settings_bound = true;

    // lingua prima, poi tema (così la label tema usa la lingua giusta)
    loadLanguage();
    loadTheme();

    if(btnSettings) btnSettings.addEventListener("click", openSettings);
    if(btnClose) btnClose.addEventListener("click", closeSettings);

    if(modal){
      modal.addEventListener("click", (e)=>{
        if(e.target === modal) closeSettings();
      });
    }

    window.addEventListener("keydown", (e)=>{
      if(e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeSettings();
    });

    if(themeToggle){
      themeToggle.addEventListener("change", ()=>{
        const mode = themeToggle.checked ? "light" : "dark";
        applyTheme(mode);
        saveTheme(mode);
        try{ if(typeof hapticMedium === "function") hapticMedium(); }catch{}
      });
    }

    bindLanguage();
  };

  try{ window.initSettings(); }catch{}
})();
