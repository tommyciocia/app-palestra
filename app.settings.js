// app.settings.js
(function(){
  const btnSettings   = document.getElementById("btnSettings");
  const modal         = document.getElementById("settingsModal");
  const btnClose      = document.getElementById("btnSettingsClose");
  const themeToggle   = document.getElementById("themeToggle");
  const themeLabel    = document.getElementById("themeLabel");
  const langSelect    = document.getElementById("langSelect");
  const langLabel     = document.getElementById("langLabel");
  const vibrationToggle   = document.getElementById("vibrationToggle");
  const kgStepSelect      = document.getElementById("kgStepSelect");
  const restDefaultSelect = document.getElementById("restDefaultSelect");
  const confirmSaveToggle = document.getElementById("confirmSaveToggle");
  const wakeLockToggle    = document.getElementById("wakeLockToggle");
  const btnExportData     = document.getElementById("btnExportData");
  const importFileInput   = document.getElementById("importFileInput");
  const btnResetApp       = document.getElementById("btnResetApp");

  const THEME_KEY        = "gt_theme";
  const LANG_KEY         = "gt_lang";
  const VIBRATION_KEY    = "gt_vibration";
  const KG_STEP_KEY      = "gt_kg_step";
  const REST_DEFAULT_KEY = "gt_rest_default";
  const CONFIRM_SAVE_KEY = "gt_confirm_save";
  const WAKE_LOCK_KEY    = "gt_wake_lock";

  let __gt_lang = "it";
  let _wakeLock = null;

  window.getLang = () => __gt_lang;
  window.t = (key) => {
    const d = T[__gt_lang] || T["it"];
    return (d && d[key] !== undefined) ? d[key] : ((T["it"] && T["it"][key]) || key);
  };

  const T = {
    it: {
      title_google_in:"Accedi", title_google_out:"Esci", title_settings:"Impostazioni",
      settings_title:"Impostazioni", settings_close:"Chiudi",
      settings_theme:"Tema", settings_language:"Lingua", langLabel:"Italiano",
      sect_appearance:"Aspetto", sect_workout:"Allenamento", sect_data:"Dati",
      kg_step_label:"Step progressione (kg)", kg_step_sub:"Quanto aumentare/diminuire i kg",
      rest_default_label:"Timer recupero default", rest_default_sub:"Secondi preimpostati al timer",
      confirm_save_label:"Chiedi conferma al salvataggio", confirm_save_sub:"Mostra dialogo prima di salvare",
      wakelock_label:"Schermo sempre acceso", wakelock_sub:"Durante l'allenamento (se supportato)",
      vibration_label:"Vibrazione/suono timer", vibration_sub:"Attiva vibrazione a fine recupero",
      export_label:"Esporta backup", export_sub:"Scarica tutti i tuoi dati in JSON",
      import_label:"Importa backup", import_sub:"Ripristina da un file JSON",
      reset_label:"Reset completo", reset_sub:"Cancella tutti i dati dell'app",
      export_btn:"Esporta", import_btn:"Importa", reset_btn:"Reset",
      add_ex:"+ Esercizio", save_plan:"Salva scheda",
      start_workout:"Inizia allenamento", cancel:"Annulla", save_workout:"Salva allenamento",
      resume_title:"Allenamento in corso",
      resume_continue:"Continua", resume_discard:"Annulla",
      resume_hint:"Se hai chiuso per sbaglio, riprendi da dove eri rimasto.",
      rest_title:"Timer recupero", rest_seconds:"Secondi recupero",
      rest_start:"Avvia", rest_reset:"Reset",
      mini_state:"Stato", mini_done:"Completati",
      draft_no_draft:"Nessuna bozza",
      no_exercises:"Nessun esercizio. Premi",
      w_new_day_prompt:"Nome nuova scheda (es. ARMS, GLUTES, FULL BODY):",
      w_rename_day_prompt:"Nuovo nome scheda:",
      w_delete_day_confirm:"Eliminare la scheda",
      w_add_ex_prompt:"Nome esercizio:",
      w_add_sets_prompt:"Quanti set? (1-10)",
      w_rename_ex_prompt:"Nuovo nome esercizio:",
      w_sets_prompt:"Numero set (1-10):",
      w_del_ex_confirm:"Eliminare",
      w_discard_confirm:"Annullare la bozza? (non verra salvato nulla)",
      w_no_sets_confirm:"Nessun set spuntato. Salvare lo stesso?",
      w_save_confirm:"Vuoi salvare l'allenamento?",
      w_saved_title:"Allenamento salvato!",
      w_saved_sub:"set completati. Lo trovi nello Storico.",
      w_draft_active:"Hai gia una bozza in corso.",
      w_no_draft:"Non c'e nessuna bozza.",
      w_draft_needed:"Prima devi iniziare.",
      w_draft_in_progress:"Bozza in corso",
      w_draft_in_progress_sub:"Annulla o salva l'allenamento prima di eliminare questa scheda.",
      w_plan_only_one:"Non puoi", w_plan_only_one_sub:"Deve rimanere almeno 1 scheda.",
      w_new_day_draft:"Prima salva/annulla",
      w_new_day_draft_sub:"Non puoi creare una scheda mentre hai una bozza in corso.",
      w_ex_exists:"Esiste gia", w_ex_exists_sub:"C'e gia un esercizio con questo nome in questa scheda.",
      w_name_used:"Nome gia usato", w_name_used_sub:"Esiste gia un esercizio con quel nome.",
      w_apply_all:"Applica tutti",
      w_apply_all_title:"Suggerimenti progressione",
      w_apply_all_sub:"Applica i kg suggeriti a tutti gli esercizi",
      w_next_time:"Prossima volta:", w_last:"Ultima:", w_use:"Usa",
      w_comment:"Commento esercizio...",
      w_sets_badge:"set - modifica target qui sotto",
      w_details:"Dettagli", w_plan_label:"Scheda",
      toast_created:"creata", toast_renamed:"Rinominata:",
      toast_deleted_day:"Scheda eliminata", toast_plan_saved:"Scheda salvata",
      toast_added:"aggiunto", toast_renamed_ex:"Rinominato",
      toast_sets:"set", toast_deleted_ex:"Eliminato",
      toast_applied:"set aggiornati", toast_applied_ex:"Kg applicati a",
      hist_placeholder:"Scrivi NOME ESATTO esercizio",
      clear:"Svuota", show_pr:"Scopri il PR",
      note:"Nota: la ricerca e esatta. Scrivi il nome completo.",
      hist_empty:"Nessun allenamento trovato.",
      hist_clear_confirm:"Svuotare tutto lo storico?",
      hist_cleared_title:"Storico svuotato",
      hist_cleared_sub:"Tutti gli allenamenti sono stati rimossi.",
      hist_del_confirm:"Eliminare allenamento del",
      hist_sets_done:"Set completati:",
      hist_details:"Dettagli",
      hist_sets_label:"allenamento", hist_sets_label_plural:"allenamenti",
      hist_stat_workouts:"Allenamenti", hist_stat_streak:"Streak", hist_stat_kg:"Ton. sollevate",
      months:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],
      streak_suffix:"gg",
      m_date:"Data", m_weight:"Peso (kg)", m_chest:"Petto (cm)",
      m_shoulders:"Spalle (cm)", m_waist:"Vita (cm)",
      m_arm_l:"Braccio SX (cm)", m_arm_r:"Braccio DX (cm)",
      m_quad_l:"Quad SX (cm)", m_quad_r:"Quad DX (cm)",
      save_measures:"Salva misure", clear_measures:"Svuota storico",
      measures_history:"Storico misure", back:"Indietro",
      m_already_exists:"Giorno gia aggiunto.",
      m_fill_all:"Compila tutto",
      m_fill_all_sub:"Devi inserire TUTTE le misure prima di salvare.",
      m_saved_title:"Misure salvate", m_saved_sub:"Giorno registrato correttamente.",
      m_clear_confirm:"Vuoi davvero svuotare tutto lo storico misure?",
      m_cleared_title:"Misure svuotate", m_cleared_sub:"Lo storico misure e stato cancellato.",
      m_del_confirm:"Vuoi davvero cancellare queste misure?",
      m_del_title:"Misure eliminate", m_del_sub:"La voce e stata rimossa dallo storico.",
      m_none:"Nessuna misura ancora.", m_none_history:"Nessuna misura salvata.", m_tap:"Tocca",
      auth_login_title:"Accedi", auth_login_sub:"Accedi per sincronizzare i dati.",
      auth_login_btn:"Accedi", auth_register_title:"Registrati",
      auth_register_sub:"Crea un account per sincronizzare i dati.",
      auth_register_btn:"Crea account",
      auth_switch_to_register:"Non hai un account? Registrati",
      auth_switch_to_login:"Hai gia un account? Accedi",
      auth_forgot:"Password dimenticata?", auth_cancel:"Annulla",
      auth_email_placeholder:"nome@email.com",
      auth_no_email:"Inserisci email e password.",
      auth_firebase_unavailable:"Firebase non disponibile.",
      auth_forgot_no_email:"Inserisci prima la tua email.",
      auth_forgot_sent:"Email inviata! Controlla la casella.",
      auth_err_user_not_found:"Nessun account con questa email.",
      auth_err_wrong_pass:"Password errata.",
      auth_err_email_in_use:"Email gia registrata.",
      auth_err_weak_pass:"Password troppo corta (min 6 caratteri).",
      auth_err_invalid_email:"Email non valida.",
      auth_err_invalid_cred:"Credenziali non valide.",
      auth_err_too_many:"Troppi tentativi. Riprova piu tardi.",
      export_ok_title:"Backup esportato", export_ok_sub:"File JSON scaricato con successo.",
      export_err_title:"Errore", export_err_sub:"Impossibile esportare i dati.",
      import_invalid_title:"File non valido",
      import_invalid_sub:"Assicurati di usare un backup esportato da Gym Tracker.",
      import_confirm:"Vuoi davvero sostituire tutti i dati con il backup? Operazione irreversibile.",
      import_ok_title:"Backup importato", import_ok_sub:"Dati ripristinati correttamente.",
      reset_confirm1:"Sei sicuro? Verranno cancellati TUTTI i dati. Operazione irreversibile.",
      reset_confirm2:"Ultima conferma: vuoi davvero azzerare tutto?",
      sync_title:"Dati sincronizzati", sync_sub:"Dati caricati dal cloud.",
      nav_workout:"Workout", nav_history:"Storico", nav_measures:"Misure"
    },
    en: {
      title_google_in:"Sign in", title_google_out:"Sign out", title_settings:"Settings",
      settings_title:"Settings", settings_close:"Close",
      settings_theme:"Theme", settings_language:"Language", langLabel:"English",
      sect_appearance:"Appearance", sect_workout:"Workout", sect_data:"Data",
      kg_step_label:"Progression step (kg)", kg_step_sub:"How much to increase/decrease kg",
      rest_default_label:"Default rest timer", rest_default_sub:"Pre-set seconds for timer",
      confirm_save_label:"Confirm before saving", confirm_save_sub:"Show dialog before saving",
      wakelock_label:"Keep screen awake", wakelock_sub:"During workout (if supported)",
      vibration_label:"Timer vibration/sound", vibration_sub:"Vibrate when rest ends",
      export_label:"Export backup", export_sub:"Download all your data as JSON",
      import_label:"Import backup", import_sub:"Restore from a JSON file",
      reset_label:"Full reset", reset_sub:"Delete all app data",
      export_btn:"Export", import_btn:"Import", reset_btn:"Reset",
      add_ex:"+ Exercise", save_plan:"Save plan",
      start_workout:"Start workout", cancel:"Cancel", save_workout:"Save workout",
      resume_title:"Workout in progress",
      resume_continue:"Continue", resume_discard:"Discard",
      resume_hint:"If you closed by mistake, continue where you left off.",
      rest_title:"Rest timer", rest_seconds:"Rest seconds",
      rest_start:"Start", rest_reset:"Reset",
      mini_state:"Status", mini_done:"Completed",
      draft_no_draft:"No draft",
      no_exercises:"No exercises. Press",
      w_new_day_prompt:"New plan name (e.g. ARMS, GLUTES, FULL BODY):",
      w_rename_day_prompt:"New plan name:",
      w_delete_day_confirm:"Delete plan",
      w_add_ex_prompt:"Exercise name:",
      w_add_sets_prompt:"How many sets? (1-10)",
      w_rename_ex_prompt:"New exercise name:",
      w_sets_prompt:"Number of sets (1-10):",
      w_del_ex_confirm:"Delete",
      w_discard_confirm:"Discard the draft? (nothing will be saved)",
      w_no_sets_confirm:"No sets ticked. Save anyway?",
      w_save_confirm:"Do you want to save the workout?",
      w_saved_title:"Workout saved!",
      w_saved_sub:"sets completed. Check your History.",
      w_draft_active:"You already have a draft in progress.",
      w_no_draft:"There is no draft.",
      w_draft_needed:"You need to start first.",
      w_draft_in_progress:"Draft in progress",
      w_draft_in_progress_sub:"Cancel or save the workout before deleting this plan.",
      w_plan_only_one:"Can't do that", w_plan_only_one_sub:"At least 1 plan must remain.",
      w_new_day_draft:"Save or cancel first",
      w_new_day_draft_sub:"You can't create a plan while a draft is in progress.",
      w_ex_exists:"Already exists", w_ex_exists_sub:"There is already an exercise with this name in this plan.",
      w_name_used:"Name already used", w_name_used_sub:"An exercise with that name already exists.",
      w_apply_all:"Apply all",
      w_apply_all_title:"Progression suggestions",
      w_apply_all_sub:"Apply suggested kg to all exercises",
      w_next_time:"Next time:", w_last:"Last:", w_use:"Use",
      w_comment:"Exercise note...",
      w_sets_badge:"sets - edit target below",
      w_details:"Details", w_plan_label:"Plan",
      toast_created:"created", toast_renamed:"Renamed:",
      toast_deleted_day:"Plan deleted", toast_plan_saved:"Plan saved",
      toast_added:"added", toast_renamed_ex:"Renamed",
      toast_sets:"sets", toast_deleted_ex:"Deleted",
      toast_applied:"sets updated", toast_applied_ex:"Kg applied to",
      hist_placeholder:"Type the EXACT exercise name",
      clear:"Clear", show_pr:"Show PR",
      note:"Note: search is exact. Type the full name.",
      hist_empty:"No workouts found.",
      hist_clear_confirm:"Clear all history?",
      hist_cleared_title:"History cleared",
      hist_cleared_sub:"All workouts have been removed.",
      hist_del_confirm:"Delete workout of",
      hist_sets_done:"Sets completed:",
      hist_details:"Details",
      hist_sets_label:"workout", hist_sets_label_plural:"workouts",
      hist_stat_workouts:"Workouts", hist_stat_streak:"Streak", hist_stat_kg:"Tons lifted",
      months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      streak_suffix:"d",
      m_date:"Date", m_weight:"Weight (kg)", m_chest:"Chest (cm)",
      m_shoulders:"Shoulders (cm)", m_waist:"Waist (cm)",
      m_arm_l:"Left arm (cm)", m_arm_r:"Right arm (cm)",
      m_quad_l:"Left quad (cm)", m_quad_r:"Right quad (cm)",
      save_measures:"Save measures", clear_measures:"Clear history",
      measures_history:"Measures history", back:"Back",
      m_already_exists:"Day already added.",
      m_fill_all:"Fill everything",
      m_fill_all_sub:"You must enter ALL measurements before saving.",
      m_saved_title:"Measures saved", m_saved_sub:"Day recorded successfully.",
      m_clear_confirm:"Do you really want to clear all body measurements?",
      m_cleared_title:"Measures cleared", m_cleared_sub:"Measurement history has been deleted.",
      m_del_confirm:"Do you really want to delete these measurements?",
      m_del_title:"Measures deleted", m_del_sub:"Entry has been removed from history.",
      m_none:"No measurements yet.", m_none_history:"No saved measurements.", m_tap:"Tap",
      auth_login_title:"Sign in", auth_login_sub:"Sign in to sync your data across devices.",
      auth_login_btn:"Sign in", auth_register_title:"Sign up",
      auth_register_sub:"Create an account to sync your data across devices.",
      auth_register_btn:"Create account",
      auth_switch_to_register:"No account? Sign up",
      auth_switch_to_login:"Already have an account? Sign in",
      auth_forgot:"Forgot password?", auth_cancel:"Cancel",
      auth_email_placeholder:"name@email.com",
      auth_no_email:"Please enter email and password.",
      auth_firebase_unavailable:"Firebase not available.",
      auth_forgot_no_email:"Please enter your email first.",
      auth_forgot_sent:"Email sent! Check your inbox.",
      auth_err_user_not_found:"No account with this email.",
      auth_err_wrong_pass:"Wrong password.",
      auth_err_email_in_use:"Email already registered.",
      auth_err_weak_pass:"Password too short (min 6 characters).",
      auth_err_invalid_email:"Invalid email.",
      auth_err_invalid_cred:"Invalid credentials.",
      auth_err_too_many:"Too many attempts. Try again later.",
      export_ok_title:"Backup exported", export_ok_sub:"JSON file downloaded successfully.",
      export_err_title:"Error", export_err_sub:"Unable to export data.",
      import_invalid_title:"Invalid file",
      import_invalid_sub:"Make sure you use a backup exported from Gym Tracker.",
      import_confirm:"Do you really want to replace all data with this backup? Irreversible.",
      import_ok_title:"Backup imported", import_ok_sub:"Data restored successfully.",
      reset_confirm1:"Are you sure? ALL data will be deleted. Irreversible.",
      reset_confirm2:"Last confirmation: really reset everything?",
      sync_title:"Data synced", sync_sub:"Data loaded from the cloud.",
      nav_workout:"Workout", nav_history:"History", nav_measures:"Measures"
    }
  };

  /* ── TEMA ── */
  function applyTheme(mode){
    const html = document.documentElement;
    if(mode === "light"){
      html.setAttribute("data-theme","light");
      if(themeToggle) themeToggle.checked = true;
      if(themeLabel)  themeLabel.textContent = __gt_lang==="en" ? "Light" : "Bianco";
    } else {
      html.removeAttribute("data-theme");
      if(themeToggle) themeToggle.checked = false;
      if(themeLabel)  themeLabel.textContent = __gt_lang==="en" ? "Dark" : "Nero";
    }
  }
  function loadTheme(){ const s=(localStorage.getItem(THEME_KEY)||"dark").toLowerCase(); applyTheme(s==="light"?"light":"dark"); }
  function saveTheme(m){ localStorage.setItem(THEME_KEY,m); }

  /* ── DOM HELPERS ── */
  function setText(id,txt){ const e=document.getElementById(id); if(e) e.textContent=txt; }
  function setTitle(id,txt){ const e=document.getElementById(id); if(e) e.setAttribute("title",txt); }
  function setPlaceholder(id,txt){ const e=document.getElementById(id); if(e) e.setAttribute("placeholder",txt); }

  function setFieldLabel(inputId, text){
    const inp=document.getElementById(inputId); if(!inp) return;
    const lbl=inp.closest("label"); if(!lbl) return;
    const span=lbl.querySelector("span"); if(span) span.textContent=text;
  }

  function setSettingsRow(controlId, labelText, subText){
    const ctrl=document.getElementById(controlId); if(!ctrl) return;
    const row=ctrl.closest(".settingsRow"); if(!row) return;
    const lbl=row.querySelector(".settingsLabel div:first-child");
    const sub=row.querySelector(".settingsLabel .tiny.muted");
    if(lbl && labelText) lbl.textContent=labelText;
    if(sub && subText)   sub.textContent=subText;
  }

  /* ── AUTH MODAL ── */
  function applyAuthModal(mode){
    const T2 = T[__gt_lang] || T["it"];
    const title     = document.getElementById("authModalTitle");
    const sub       = document.getElementById("authModalSub");
    const btnDo     = document.getElementById("btnAuthDo");
    const lnkSwitch = document.getElementById("authSwitchLink");
    const btnForgot = document.getElementById("btnForgotPassword");
    const cancelBtn = document.querySelector("#authModal .btn.ghost.w100");
    const emailInp  = document.getElementById("authEmail");
    if(mode === "register"){
      if(title)     title.textContent     = T2.auth_register_title;
      if(sub)       sub.textContent       = T2.auth_register_sub;
      if(btnDo)     btnDo.textContent     = T2.auth_register_btn;
      if(lnkSwitch) lnkSwitch.textContent = T2.auth_switch_to_login;
    } else {
      if(title)     title.textContent     = T2.auth_login_title;
      if(sub)       sub.textContent       = T2.auth_login_sub;
      if(btnDo)     btnDo.textContent     = T2.auth_login_btn;
      if(lnkSwitch) lnkSwitch.textContent = T2.auth_switch_to_register;
    }
    if(btnForgot)  btnForgot.textContent = T2.auth_forgot;
    if(cancelBtn)  cancelBtn.textContent = T2.auth_cancel;
    if(emailInp)   emailInp.placeholder  = T2.auth_email_placeholder;
  }
  window._applyAuthModal = applyAuthModal;

  /* ── APPLICA LINGUA ── */
  function applyLanguage(lang){
    __gt_lang = (lang==="en") ? "en" : "it";
    const t = window.t;

    setTitle("btnAuthOpen",  t("title_google_in"));
    setTitle("btnAuthOut",   t("title_google_out"));
    setTitle("btnSettings",  t("title_settings"));

    const stTitle = document.querySelector("#settingsModal .modalTitle");
    if(stTitle) stTitle.textContent = t("settings_title");
    setText("btnSettingsClose", t("settings_close"));
    if(langLabel) langLabel.textContent = t("langLabel");

    /* sezioni — aggiorna prefissi emoji + testo */
    const sects = document.querySelectorAll(".settingsSectionLabel");
    if(sects[0]) sects[0].textContent = (lang==="en" ? "🎨 " : "🎨 ") + t("sect_appearance");
    if(sects[1]) sects[1].textContent = (lang==="en" ? "🏋️ " : "🏋️ ") + t("sect_workout");
    if(sects[2]) sects[2].textContent = (lang==="en" ? "💾 " : "💾 ") + t("sect_data");

    setSettingsRow("themeToggle",       t("settings_theme"),      "");
    setSettingsRow("kgStepSelect",      t("kg_step_label"),       t("kg_step_sub"));
    setSettingsRow("restDefaultSelect", t("rest_default_label"),  t("rest_default_sub"));
    setSettingsRow("confirmSaveToggle", t("confirm_save_label"),  t("confirm_save_sub"));
    setSettingsRow("wakeLockToggle",    t("wakelock_label"),      t("wakelock_sub"));
    setSettingsRow("vibrationToggle",   t("vibration_label"),     t("vibration_sub"));
    setSettingsRow("btnExportData",     t("export_label"),        t("export_sub"));
    setSettingsRow("importFileInput",   t("import_label"),        t("import_sub"));
    setSettingsRow("btnResetApp",       t("reset_label"),         t("reset_sub"));

    /* bottoni dati — testo */
    setText("btnExportData", (lang==="en"?"📤 ":"📤 ") + t("export_btn"));
    setText("btnResetApp",   (lang==="en"?"🗑️ ":"🗑️ ") + t("reset_btn"));
    const importLbl = importFileInput && importFileInput.closest("label");
    if(importLbl){
      const node = Array.from(importLbl.childNodes).find(n => n.nodeType===3 && n.textContent.trim());
      if(node) node.textContent = "\n            " + "📥 " + t("import_btn") + "\n            ";
    }

    /* workout tab */
    setText("btnAddExercise", t("add_ex"));
    setText("btnSavePlan",    t("save_plan"));
    setText("btnStart",       t("start_workout"));
    setText("btnDiscard",     t("cancel"));
    setText("btnSave",        t("save_workout"));

    const resumeTitle = document.querySelector("#resumeWorkoutCard [style*='font-weight:1000']");
    if(resumeTitle) resumeTitle.textContent = "⏸ " + t("resume_title");
    setText("btnResumeWorkout",        "▶️ " + t("resume_continue"));
    setText("btnDiscardResumeWorkout", "🗑️ " + t("resume_discard"));
    const resumeHint = document.querySelector("#resumeWorkoutCard .tiny.muted");
    if(resumeHint) resumeHint.textContent = t("resume_hint");

    const restTitle = document.querySelector("#restTimerCard .cardTitle");
    if(restTitle) restTitle.textContent = "⏱ " + t("rest_title");
    const restSpan = document.querySelector("#restTimerCard label span");
    if(restSpan) restSpan.textContent = t("rest_seconds");
    setText("btnStartRest", t("rest_start"));
    setText("btnResetRest", t("rest_reset"));

    const minis = document.querySelectorAll(".miniLabel");
    if(minis[0]) minis[0].textContent = t("mini_state");
    if(minis[1]) minis[1].textContent = t("mini_done");

    setPlaceholder("histSearch",   t("hist_placeholder"));
    setText("btnClearHistory",     t("clear"));
    setText("btnShowPR",           "🔥 " + t("show_pr"));

    const statLbls = document.querySelectorAll(".statLbl");
    if(statLbls[0]) statLbls[0].textContent = t("hist_stat_workouts");
    if(statLbls[1]) statLbls[1].textContent = t("hist_stat_streak") + " 🔥";
    if(statLbls[2]) statLbls[2].textContent = t("hist_stat_kg");

    setFieldLabel("mDate",      t("m_date"));
    setFieldLabel("mWeight",    t("m_weight"));
    setFieldLabel("mChest",     t("m_chest"));
    setFieldLabel("mShoulders", t("m_shoulders"));
    setFieldLabel("mWaist",     t("m_waist"));
    setFieldLabel("mArmL",      t("m_arm_l"));
    setFieldLabel("mArmR",      t("m_arm_r"));
    setFieldLabel("mQuadL",     t("m_quad_l"));
    setFieldLabel("mQuadR",     t("m_quad_r"));
    setText("btnSaveMeasures",            "💾 " + t("save_measures"));
    setText("btnClearMeasures",           "🗑️ " + t("clear_measures"));
    setText("btnOpenMeasuresHistoryPage", t("measures_history"));
    setText("btnBackToMeasures",          t("back"));
    const mhTitle = document.querySelector("#view-measures-history .cardTitle");
    if(mhTitle) mhTitle.textContent = t("measures_history");

    const nw = document.querySelector('.bottomNav [data-view="workout"] .navTxt');
    const nh = document.querySelector('.bottomNav [data-view="history"] .navTxt');
    const nm = document.querySelector('.bottomNav [data-view="measures"] .navTxt');
    if(nw) nw.textContent = t("nav_workout");
    if(nh) nh.textContent = t("nav_history");
    if(nm) nm.textContent = t("nav_measures");

    applyAuthModal(document.getElementById("authModal")?.dataset?.mode || "login");

    try{
      if(themeLabel){
        const isLight = !!document.documentElement.getAttribute("data-theme");
        themeLabel.textContent = isLight ? (__gt_lang==="en"?"Light":"Bianco") : (__gt_lang==="en"?"Dark":"Nero");
      }
    }catch{}

    /* ri-renderizza per aggiornare testi dinamici (dettagli, mesi, ecc.) */
    try{ if(typeof renderAll==="function") renderAll(); }catch{}
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

  /* ── VIBRATION ── */
  function loadVibration(){ if(vibrationToggle) vibrationToggle.checked=(localStorage.getItem(VIBRATION_KEY)!=="off"); }
  function saveVibration(){ if(vibrationToggle) localStorage.setItem(VIBRATION_KEY,vibrationToggle.checked?"on":"off"); }

  /* ── KG STEP ── */
  function loadKgStep(){ if(kgStepSelect) kgStepSelect.value=localStorage.getItem(KG_STEP_KEY)||"2.5"; }
  function saveKgStep(){ if(kgStepSelect) localStorage.setItem(KG_STEP_KEY,kgStepSelect.value); }
  window.getKgStep = () => parseFloat(localStorage.getItem(KG_STEP_KEY)||"2.5");

  /* ── REST DEFAULT ── */
  function loadRestDefault(){
    const s=localStorage.getItem(REST_DEFAULT_KEY)||"90";
    if(restDefaultSelect) restDefaultSelect.value=s;
    const inp=document.getElementById("restSeconds");
    if(inp) inp.value=s;
  }
  function saveRestDefault(){
    if(!restDefaultSelect) return;
    const v=restDefaultSelect.value; localStorage.setItem(REST_DEFAULT_KEY,v);
    const inp=document.getElementById("restSeconds");
    if(inp){ inp.value=v; inp.dispatchEvent(new Event("input")); }
  }

  /* ── CONFIRM SAVE ── */
  function loadConfirmSave(){ if(confirmSaveToggle) confirmSaveToggle.checked=(localStorage.getItem(CONFIRM_SAVE_KEY)==="on"); }
  function saveConfirmSave(){ if(confirmSaveToggle) localStorage.setItem(CONFIRM_SAVE_KEY,confirmSaveToggle.checked?"on":"off"); }
  window.isConfirmSaveEnabled = () => localStorage.getItem(CONFIRM_SAVE_KEY)==="on";

  /* ── WAKE LOCK ── */
  async function requestWakeLock(){
    if(!("wakeLock" in navigator)) return;
    try{ _wakeLock=await navigator.wakeLock.request("screen"); _wakeLock.addEventListener("release",()=>{ _wakeLock=null; }); }catch{}
  }
  function releaseWakeLock(){ if(_wakeLock){ _wakeLock.release().catch(()=>{}); _wakeLock=null; } }
  function loadWakeLock(){
    if(wakeLockToggle) wakeLockToggle.checked=(localStorage.getItem(WAKE_LOCK_KEY)==="on");
    if(localStorage.getItem(WAKE_LOCK_KEY)==="on") requestWakeLock();
  }
  function saveWakeLock(){
    if(!wakeLockToggle) return;
    const on=wakeLockToggle.checked; localStorage.setItem(WAKE_LOCK_KEY,on?"on":"off");
    if(on) requestWakeLock(); else releaseWakeLock();
  }
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden&&localStorage.getItem(WAKE_LOCK_KEY)==="on"&&!_wakeLock) requestWakeLock();
  });

  /* ── EXPORT ── */
  function exportData(){
    try{
      const raw=localStorage.getItem("gym_tracker_full_v10")||"{}";
      const blob=new Blob([raw],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url; a.download=`gym-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
      try{ if(typeof openModal==="function") openModal({icon:"📤",title:window.t("export_ok_title"),sub:window.t("export_ok_sub")}); }catch{}
    }catch{
      try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:window.t("export_err_title"),sub:window.t("export_err_sub")}); }catch{}
    }
  }

  /* ── IMPORT ── */
  function importData(file){
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const parsed=JSON.parse(e.target.result);
        if(!parsed.template||!Array.isArray(parsed.sessions)) throw new Error("invalid");
        if(!confirm(window.t("import_confirm"))) return;
        localStorage.setItem("gym_tracker_full_v10",JSON.stringify(parsed));
        try{
          if(typeof state!=="undefined"){
            Object.assign(state,JSON.parse(localStorage.getItem("gym_tracker_full_v10")));
            if(typeof renderAll==="function") renderAll();
          }
        }catch{}
        try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
        try{ if(typeof openModal==="function") openModal({icon:"📥",title:window.t("import_ok_title"),sub:window.t("import_ok_sub")}); }catch{}
      }catch{
        try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:window.t("import_invalid_title"),sub:window.t("import_invalid_sub")}); }catch{}
      }
    };
    reader.readAsText(file);
  }

  /* ── RESET ── */
  function resetApp(){
    if(!confirm(window.t("reset_confirm1"))) return;
    if(!confirm(window.t("reset_confirm2"))) return;
    localStorage.removeItem("gym_tracker_full_v10");
    try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
    location.reload();
  }

  /* ── OPEN/CLOSE ── */
  function openSettings(){ if(!modal) return; modal.classList.remove("hidden"); try{ if(typeof hapticLight==="function") hapticLight(); }catch{} }
  function closeSettings(){ if(!modal) return; modal.classList.add("hidden"); try{ if(typeof hapticLight==="function") hapticLight(); }catch{} }

  /* ── INIT ── */
  window.initSettings = function(){
    if(window.__gt_settings_bound) return;
    window.__gt_settings_bound = true;
    loadLanguage(); loadTheme(); loadVibration(); loadKgStep(); loadRestDefault(); loadConfirmSave(); loadWakeLock();
    if(btnSettings) btnSettings.addEventListener("click", openSettings);
    if(btnClose)    btnClose.addEventListener("click",    closeSettings);
    if(modal)       modal.addEventListener("click",(e)=>{ if(e.target===modal) closeSettings(); });
    window.addEventListener("keydown",(e)=>{ if(e.key==="Escape"&&modal&&!modal.classList.contains("hidden")) closeSettings(); });
    if(themeToggle)       themeToggle.addEventListener("change",()=>{ const m=themeToggle.checked?"light":"dark"; applyTheme(m); saveTheme(m); try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}; });
    if(vibrationToggle)   vibrationToggle.addEventListener("change",   saveVibration);
    if(kgStepSelect)      kgStepSelect.addEventListener("change",      saveKgStep);
    if(restDefaultSelect) restDefaultSelect.addEventListener("change", saveRestDefault);
    if(confirmSaveToggle) confirmSaveToggle.addEventListener("change", saveConfirmSave);
    if(wakeLockToggle)    wakeLockToggle.addEventListener("change",    saveWakeLock);
    if(btnExportData)     btnExportData.addEventListener("click",      exportData);
    if(importFileInput)   importFileInput.addEventListener("change",(e)=>{ importData(e.target.files[0]); e.target.value=""; });
    if(btnResetApp)       btnResetApp.addEventListener("click",        resetApp);
    bindLanguage();
  };

  try{ window.initSettings(); }catch{}
})();
