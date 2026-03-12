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

  /* ======= TRANSLATIONS ======= */
  const T = {
    it:{
      // settings UI
      title_google_in:"Accedi",title_google_out:"Esci",title_settings:"Impostazioni",
      settings_title:"Impostazioni",settings_close:"Chiudi",
      settings_theme:"Tema",settings_language:"Lingua",langLabel:"Italiano",
      theme_dark:"Nero",theme_light:"Bianco",
      section_aspect:"🎨 Aspetto",section_workout:"🏋️ Allenamento",section_data:"💾 Dati",
      kg_step_label:"Step progressione (kg)",kg_step_sub:"Quanto aumentare/diminuire i kg",
      rest_default_label:"Timer recupero default",rest_default_sub:"Secondi preimpostati al timer",
      confirm_save_label:"Chiedi conferma al salvataggio",confirm_save_sub:"Mostra dialogo prima di salvare",
      wakelock_label:"Schermo sempre acceso",wakelock_sub:"Durante l'allenamento (se supportato)",
      vibration_label:"Vibrazione/suono timer",vibration_sub:"Attiva vibrazione a fine recupero",
      export_label:"Esporta backup",export_sub:"Scarica tutti i tuoi dati in JSON",
      export_btn:"📤 Esporta",
      import_label:"Importa backup",import_sub:"Ripristina da un file JSON",
      import_btn:"📥 Importa",
      reset_label:"Reset completo",reset_sub:"Cancella tutti i dati dell'app",
      reset_btn:"🗑️ Reset",
      version:"Versione 1.0",
      // workout
      add_ex:"＋ Esercizio",save_plan:"💾 Salva scheda",start_workout:"Inizia allenamento",
      cancel:"Annulla",save_workout:"Salva allenamento",
      resume_title:"⏸ Allenamento in corso",resume_continue:"▶️ Continua",resume_discard:"🗑️ Annulla",
      resume_hint:"Se hai chiuso per sbaglio, riprendi da dove eri rimasto.",
      rest_title:"⏱ Timer recupero",rest_seconds:"Secondi recupero",rest_start:"Avvia",rest_reset:"Reset",
      mini_state:"Stato",mini_done:"Completati",
      plan_badge_hint:"set • modifica target qui sotto",
      no_exercises:"Nessun esercizio in questa scheda. Premi <b>＋ Esercizio</b>.",
      draft_state_idle:"Scheda",
      sug_title:"⚡ Suggerimenti progressione",sug_sub:"Applica i kg suggeriti a tutti gli esercizi",
      sug_apply_all:"Applica tutti",sug_apply:"Usa",
      next_time:"Prossima volta:",last:"Ultima:",reps_lbl:"reps",
      comment_placeholder:"Commento esercizio...",
      // prompts / confirms
      prompt_new_day:"Nome nuova scheda (es. ARMS, GLUTES, FULL BODY):",
      prompt_rename_day:"Nuovo nome scheda:",
      confirm_delete_day:'Eliminare la scheda "{name}"?',
      prompt_new_exercise:"Nome esercizio:",
      prompt_sets:"Quanti set? (1-10)",
      prompt_rename_exercise:"Nuovo nome esercizio:",
      prompt_change_sets:"Numero set (1-10):",
      confirm_delete_exercise:'Eliminare "{name}"?',
      confirm_discard_draft:"Annullare la bozza? (non verrà salvato nulla)",
      confirm_no_sets:"Nessun set spuntato. Salvare lo stesso?",
      confirm_save_workout:"Vuoi salvare l'allenamento?",
      confirm_clear_history:"Svuotare tutto lo storico?",
      confirm_delete_session:"Eliminare allenamento del {date}?",
      confirm_clear_measures:"Vuoi davvero svuotare tutto lo storico misure?",
      confirm_delete_measure:"Vuoi davvero cancellare queste misure?",
      confirm_import:"Vuoi davvero sostituire tutti i dati con il backup? L'operazione è irreversibile.",
      confirm_reset1:"Sei sicuro? Questa operazione cancellerà TUTTI i tuoi allenamenti, misure e schede. È irreversibile.",
      confirm_reset2:"Ultima conferma: vuoi davvero azzerare tutto?",
      // modals
      modal_ok:"Ok",
      modal_draft_block_title:"Prima salva/annulla",modal_draft_block_sub:"Non puoi creare una scheda mentre hai una bozza in corso.",
      modal_cant_delete_title:"Non puoi",modal_cant_delete_sub:"Deve rimanere almeno 1 scheda.",
      modal_draft_running_title:"Bozza in corso",modal_draft_running_sub:"Annulla o salva l'allenamento prima di eliminare questa scheda.",
      modal_ex_exists_title:"Esiste già",modal_ex_exists_sub:"C'è già un esercizio con questo nome in questa scheda.",
      modal_name_used_title:"Nome già usato",modal_name_used_sub:"Esiste già un esercizio con quel nome.",
      modal_saved_title:"Allenamento salvato!",modal_saved_sub:"{done}/{total} set completati. Lo trovi nello Storico.",
      modal_day_already_title:"Ops",modal_day_already_sub:"Giorno già aggiunto.",
      modal_fill_all_title:"Compila tutto",modal_fill_all_sub:"Devi inserire TUTTE le misure prima di salvare.",
      modal_measures_saved_title:"Misure salvate",modal_measures_saved_sub:"Giorno registrato correttamente.",
      modal_measures_cleared_title:"Misure svuotate",modal_measures_cleared_sub:"Lo storico misure è stato cancellato.",
      modal_measure_deleted_title:"Misure eliminate",modal_measure_deleted_sub:"La voce è stata rimossa dallo storico.",
      modal_export_ok_title:"Backup esportato",modal_export_ok_sub:"File JSON scaricato con successo.",
      modal_export_err_title:"Errore",modal_export_err_sub:"Impossibile esportare i dati.",
      modal_import_ok_title:"Backup importato",modal_import_ok_sub:"Dati ripristinati correttamente.",
      modal_import_err_title:"File non valido",modal_import_err_sub:"Assicurati di usare un backup esportato da Gym Tracker.",
      modal_rest_done_title:"Recupero finito",modal_rest_done_sub:"Vai 💪",
      modal_pr_title:"PR stimato",modal_pr_sub:"Esercizio: {ex}\nPR stimato 1RIP: {best} kg\n\nCalcolo (formula): 1RM = kg × (1 + reps/30)",
      modal_history_cleared_title:"Storico svuotato",modal_history_cleared_sub:"Tutti gli allenamenti sono stati rimossi.",
      // toasts
      toast_plan_created:'Scheda "{name}" creata',
      toast_plan_renamed:"Rinominata: {name}",
      toast_plan_deleted:"Scheda eliminata",
      toast_ex_added:"{name} aggiunto",
      toast_plan_saved:"Scheda salvata",
      toast_renamed:"Rinominato",
      toast_sets_changed:"{n} set",
      toast_deleted:"Eliminato",
      toast_kg_applied:"Kg applicati a {name}",
      toast_sug_updated:"{count} set aggiornati",
      // history
      hist_placeholder:'Scrivi NOME ESATTO esercizio (es. "Leg press")',
      clear:"Svuota",show_pr:"🔥 Scopri il PR",
      note:'Nota: la ricerca è <b>esatta</b>. Se scrivi "leg" non trova nulla: devi scrivere "leg press".',
      hist_none:"Nessun allenamento trovato.",
      hist_details:"Dettagli",
      set_lbl:"Set",
      streak_suffix:"gg",
      stat_sessions:"Allenamenti",stat_streak:"Streak 🔥",stat_kg:"Ton. sollevate",
      hist_filter_all:"Tutti",
      month_names:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],
      workout_count_1:"allenamento",workout_count_n:"allenamenti",
      // measures
      m_date:"Data",m_weight:"Peso (kg)",m_chest:"Petto (cm)",m_shoulders:"Spalle (cm)",m_waist:"Vita (cm)",
      m_arm_l:"Braccio SX (cm)",m_arm_r:"Braccio DX (cm)",m_quad_l:"Quad SX (cm)",m_quad_r:"Quad DX (cm)",
      save_measures:"💾 Salva misure",clear_measures:"🗑️ Svuota storico",measures_history:"Storico misure",back:"Indietro",
      measures_none:"Nessuna misura ancora.",measures_none_hist:"Nessuna misura salvata.",
      measures_tap:"Tocca",
      measures_weight:"Peso:",measures_waist:"Vita:",measures_chest:"Petto:",
      measures_shoulders:"Spalle:",
      m_arm_sx:"Braccio SX:",m_arm_dx:"Braccio DX:",m_quad_sx:"Quad SX:",m_quad_dx:"Quad DX:",
      m_arm_old:"Braccio:",m_thigh_old:"Coscia:",
      m_delete:"🗑️ Elimina",
      // nav & top
      nav_workout:"Workout",nav_history:"Storico",nav_measures:"Misure",
      // auth
      auth_login_title:"Accedi",auth_login_sub:"Accedi per sincronizzare i dati su più dispositivi.",
      auth_login_btn:"Accedi",auth_register_title:"Registrati",
      auth_register_sub:"Crea un account per sincronizzare i dati su più dispositivi.",
      auth_register_btn:"Crea account",auth_have_account:"Hai già un account? Accedi",
      auth_no_account:"Non hai un account? Registrati",auth_forgot:"Password dimenticata?",
      auth_cancel:"Annulla",auth_email_placeholder:"nome@email.com",
      // firebase errors
      err_empty:"Inserisci email e password.",
      err_firebase_unavail:"Firebase non disponibile.",
      err_user_not_found:"Nessun account con questa email.",
      err_wrong_password:"Password errata.",
      err_email_in_use:"Email già registrata.",
      err_weak_password:"Password troppo corta (min 6 caratteri).",
      err_invalid_email:"Email non valida.",
      err_invalid_cred:"Credenziali non valide.",
      err_too_many:"Troppi tentativi. Riprova più tardi.",
      err_prefix:"Errore: ",
      forgot_sent:"Email inviata! Controlla la casella.",
      forgot_need_email:"Inserisci prima la tua email.",
      // topbar
      top_history:"Storico",top_measures:"Misure",
      top_sub:"Storico: {s} • Schede: {d}",
      // resume card
      resume_set_label:"Set:",
      // history detail
      detail_comment:"Commento: ",
      reps_data_none:"Nessun dato reps",kg_data_none:"Nessun dato kg",
    },
    en:{
      // settings UI
      title_google_in:"Sign in",title_google_out:"Sign out",title_settings:"Settings",
      settings_title:"Settings",settings_close:"Close",
      settings_theme:"Theme",settings_language:"Language",langLabel:"English",
      theme_dark:"Dark",theme_light:"Light",
      section_aspect:"🎨 Appearance",section_workout:"🏋️ Workout",section_data:"💾 Data",
      kg_step_label:"Progression step (kg)",kg_step_sub:"How much to increase/decrease kg",
      rest_default_label:"Default rest timer",rest_default_sub:"Preset seconds for timer",
      confirm_save_label:"Confirm before saving",confirm_save_sub:"Show dialog before saving",
      wakelock_label:"Keep screen awake",wakelock_sub:"During workout (if supported)",
      vibration_label:"Vibration/timer sound",vibration_sub:"Vibrate when rest is done",
      export_label:"Export backup",export_sub:"Download all your data as JSON",
      export_btn:"📤 Export",
      import_label:"Import backup",import_sub:"Restore from a JSON file",
      import_btn:"📥 Import",
      reset_label:"Full reset",reset_sub:"Delete all app data",
      reset_btn:"🗑️ Reset",
      version:"Version 1.0",
      // workout
      add_ex:"＋ Exercise",save_plan:"💾 Save plan",start_workout:"Start workout",
      cancel:"Cancel",save_workout:"Save workout",
      resume_title:"⏸ Workout in progress",resume_continue:"▶️ Continue",resume_discard:"🗑️ Discard",
      resume_hint:"If you closed by mistake, continue where you left off.",
      rest_title:"⏱ Rest timer",rest_seconds:"Rest seconds",rest_start:"Start",rest_reset:"Reset",
      mini_state:"Status",mini_done:"Completed",
      plan_badge_hint:"sets • edit targets below",
      no_exercises:"No exercises in this plan. Press <b>＋ Exercise</b>.",
      draft_state_idle:"Plan",
      sug_title:"⚡ Progression suggestions",sug_sub:"Apply suggested kg to all exercises",
      sug_apply_all:"Apply all",sug_apply:"Use",
      next_time:"Next time:",last:"Last:",reps_lbl:"reps",
      comment_placeholder:"Exercise note...",
      // prompts / confirms
      prompt_new_day:"New plan name (e.g. ARMS, GLUTES, FULL BODY):",
      prompt_rename_day:"New plan name:",
      confirm_delete_day:'Delete plan "{name}"?',
      prompt_new_exercise:"Exercise name:",
      prompt_sets:"How many sets? (1-10)",
      prompt_rename_exercise:"New exercise name:",
      prompt_change_sets:"Number of sets (1-10):",
      confirm_delete_exercise:'Delete "{name}"?',
      confirm_discard_draft:"Discard draft? (nothing will be saved)",
      confirm_no_sets:"No sets checked. Save anyway?",
      confirm_save_workout:"Save this workout?",
      confirm_clear_history:"Clear all history?",
      confirm_delete_session:"Delete workout from {date}?",
      confirm_clear_measures:"Really clear all measures history?",
      confirm_delete_measure:"Really delete these measures?",
      confirm_import:"Replace all data with the backup? This cannot be undone.",
      confirm_reset1:"Are you sure? This will delete ALL your workouts, measures and plans. Irreversible.",
      confirm_reset2:"Final confirmation: really reset everything?",
      // modals
      modal_ok:"Ok",
      modal_draft_block_title:"Save/cancel first",modal_draft_block_sub:"You can't create a plan while a draft is in progress.",
      modal_cant_delete_title:"Can't delete",modal_cant_delete_sub:"At least 1 plan must remain.",
      modal_draft_running_title:"Draft in progress",modal_draft_running_sub:"Cancel or save the workout before deleting this plan.",
      modal_ex_exists_title:"Already exists",modal_ex_exists_sub:"There is already an exercise with this name in this plan.",
      modal_name_used_title:"Name already used",modal_name_used_sub:"There is already an exercise with that name.",
      modal_saved_title:"Workout saved!",modal_saved_sub:"{done}/{total} sets completed. Find it in History.",
      modal_day_already_title:"Oops",modal_day_already_sub:"Day already added.",
      modal_fill_all_title:"Fill everything",modal_fill_all_sub:"You must enter ALL measurements before saving.",
      modal_measures_saved_title:"Measures saved",modal_measures_saved_sub:"Day recorded correctly.",
      modal_measures_cleared_title:"Measures cleared",modal_measures_cleared_sub:"Measures history has been deleted.",
      modal_measure_deleted_title:"Measures deleted",modal_measure_deleted_sub:"The entry has been removed from history.",
      modal_export_ok_title:"Backup exported",modal_export_ok_sub:"JSON file downloaded successfully.",
      modal_export_err_title:"Error",modal_export_err_sub:"Unable to export data.",
      modal_import_ok_title:"Backup imported",modal_import_ok_sub:"Data restored successfully.",
      modal_import_err_title:"Invalid file",modal_import_err_sub:"Make sure to use a backup exported from Gym Tracker.",
      modal_rest_done_title:"Rest done",modal_rest_done_sub:"Let's go 💪",
      modal_pr_title:"Estimated PR",modal_pr_sub:"Exercise: {ex}\nEstimated 1RM: {best} kg\n\nFormula: 1RM = kg × (1 + reps/30)",
      modal_history_cleared_title:"History cleared",modal_history_cleared_sub:"All workouts have been removed.",
      // toasts
      toast_plan_created:'Plan "{name}" created',
      toast_plan_renamed:"Renamed: {name}",
      toast_plan_deleted:"Plan deleted",
      toast_ex_added:"{name} added",
      toast_plan_saved:"Plan saved",
      toast_renamed:"Renamed",
      toast_sets_changed:"{n} sets",
      toast_deleted:"Deleted",
      toast_kg_applied:"Kg applied to {name}",
      toast_sug_updated:"{count} sets updated",
      // history
      hist_placeholder:'Type the EXACT exercise name (e.g. "Leg press")',
      clear:"Clear",show_pr:"🔥 Show PR",
      note:'Note: search is <b>exact</b>. Typing "leg" finds nothing: you must type "leg press".',
      hist_none:"No workouts found.",
      hist_details:"Details",
      set_lbl:"Set",
      streak_suffix:"d",
      stat_sessions:"Workouts",stat_streak:"Streak 🔥",stat_kg:"Total lifted",
      hist_filter_all:"All",
      month_names:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      workout_count_1:"workout",workout_count_n:"workouts",
      // measures
      m_date:"Date",m_weight:"Weight (kg)",m_chest:"Chest (cm)",m_shoulders:"Shoulders (cm)",m_waist:"Waist (cm)",
      m_arm_l:"Left arm (cm)",m_arm_r:"Right arm (cm)",m_quad_l:"Left quad (cm)",m_quad_r:"Right quad (cm)",
      save_measures:"💾 Save measures",clear_measures:"🗑️ Clear history",measures_history:"Measures history",back:"Back",
      measures_none:"No measures yet.",measures_none_hist:"No saved measures.",
      measures_tap:"Tap",
      measures_weight:"Weight:",measures_waist:"Waist:",measures_chest:"Chest:",
      measures_shoulders:"Shoulders:",
      m_arm_sx:"Left arm:",m_arm_dx:"Right arm:",m_quad_sx:"Left quad:",m_quad_dx:"Right quad:",
      m_arm_old:"Arm:",m_thigh_old:"Thigh:",
      m_delete:"🗑️ Delete",
      // nav & top
      nav_workout:"Workout",nav_history:"History",nav_measures:"Measures",
      // auth
      auth_login_title:"Sign in",auth_login_sub:"Sign in to sync data across devices.",
      auth_login_btn:"Sign in",auth_register_title:"Register",
      auth_register_sub:"Create an account to sync data across devices.",
      auth_register_btn:"Create account",auth_have_account:"Already have an account? Sign in",
      auth_no_account:"No account? Register",auth_forgot:"Forgot password?",
      auth_cancel:"Cancel",auth_email_placeholder:"name@email.com",
      // firebase errors
      err_empty:"Enter email and password.",
      err_firebase_unavail:"Firebase not available.",
      err_user_not_found:"No account with this email.",
      err_wrong_password:"Wrong password.",
      err_email_in_use:"Email already registered.",
      err_weak_password:"Password too short (min 6 characters).",
      err_invalid_email:"Invalid email.",
      err_invalid_cred:"Invalid credentials.",
      err_too_many:"Too many attempts. Try again later.",
      err_prefix:"Error: ",
      forgot_sent:"Email sent! Check your inbox.",
      forgot_need_email:"Enter your email first.",
      // topbar
      top_history:"History",top_measures:"Measures",
      top_sub:"History: {s} • Plans: {d}",
      // resume card
      resume_set_label:"Sets:",
      // history detail
      detail_comment:"Note: ",
      reps_data_none:"No reps data",kg_data_none:"No kg data",
    }
  };

  /* ======= GLOBAL t() function ======= */
  window.__gt_lang = "it";
  window.t = function(key, vars){
    const lang = window.__gt_lang || "it";
    let str = (T[lang] && T[lang][key] !== undefined) ? T[lang][key] : (T["it"][key] || key);
    if(vars && typeof str === "string"){
      for(const k in vars){ str = str.replace(new RegExp("\\{"+k+"\\}","g"), vars[k]); }
    }
    return str;
  };

  /* ======= THEME ======= */
  function applyTheme(mode){
    const html = document.documentElement;
    if(mode === "light"){
      html.setAttribute("data-theme","light");
      if(themeToggle) themeToggle.checked = true;
      if(themeLabel)  themeLabel.textContent = t("theme_light");
    }else{
      html.removeAttribute("data-theme");
      if(themeToggle) themeToggle.checked = false;
      if(themeLabel)  themeLabel.textContent = t("theme_dark");
    }
  }
  function loadTheme(){
    const s = (localStorage.getItem(THEME_KEY)||"dark").toLowerCase();
    applyTheme(s==="light"?"light":"dark");
  }
  function saveTheme(m){ localStorage.setItem(THEME_KEY, m); }

  /* ======= LANGUAGE ======= */
  function setTextById(id,text){ const el=document.getElementById(id); if(el) el.textContent=text; }
  function setInnerHTMLById(id,html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
  function setTitleById(id,text){ const el=document.getElementById(id); if(el) el.setAttribute("title",text); }
  function setPlaceholderById(id,text){ const el=document.getElementById(id); if(el) el.setAttribute("placeholder",text); }

  function applyLanguage(lang){
    window.__gt_lang = (lang==="en")?"en":"it";

    // settings modal labels
    const st=document.querySelector("#settingsModal .modalTitle");
    if(st) st.textContent=t("settings_title");
    setTextById("btnSettingsClose",t("settings_close"));
    if(langLabel) langLabel.textContent=t("langLabel");

    // section labels
    const sectionLabels = document.querySelectorAll(".settingsSectionLabel");
    const sectionKeys = ["section_aspect","section_workout","section_data"];
    sectionLabels.forEach((el,i)=>{ if(sectionKeys[i]) el.textContent=t(sectionKeys[i]); });

    // settings rows labels & subs
    const rows = [
      ["themeRowLabel","themeRowSub","settings_theme",""],
      ["langRowLabel","langRowSub","settings_language",""],
      ["kgStepRowLabel","kgStepRowSub","kg_step_label","kg_step_sub"],
      ["restDefaultRowLabel","restDefaultRowSub","rest_default_label","rest_default_sub"],
      ["confirmSaveRowLabel","confirmSaveRowSub","confirm_save_label","confirm_save_sub"],
      ["wakeLockRowLabel","wakeLockRowSub","wakelock_label","wakelock_sub"],
      ["vibrationRowLabel","vibrationRowSub","vibration_label","vibration_sub"],
      ["exportRowLabel","exportRowSub","export_label","export_sub"],
      ["importRowLabel","importRowSub","import_label","import_sub"],
      ["resetRowLabel","resetRowSub","reset_label","reset_sub"],
    ];
    rows.forEach(([lid,sid,lk,sk])=>{
      setTextById(lid, t(lk));
      if(sk) setTextById(sid, t(sk));
    });

    // buttons inside settings
    setTextById("btnExportData", t("export_btn"));
    setTextById("btnImportLabel", t("import_btn"));
    setTextById("btnResetApp", t("reset_btn"));

    // version
    setTextById("appVersion", t("version"));

    // title attributes
    setTitleById("btnAuthOpen",t("title_google_in"));
    setTitleById("btnAuthOut",t("title_google_out"));
    setTitleById("btnSettings",t("title_settings"));

    // workout UI
    setTextById("btnAddExercise",t("add_ex"));
    setTextById("btnSavePlan",t("save_plan"));
    setTextById("btnStart",t("start_workout"));
    setTextById("btnDiscard",t("cancel"));
    setTextById("btnSave",t("save_workout"));

    // resume card
    const resumeTitle = document.querySelector("#resumeWorkoutCard [data-i18n='resume_title']");
    if(resumeTitle) resumeTitle.textContent=t("resume_title");
    setTextById("btnResumeWorkout",t("resume_continue"));
    setTextById("btnDiscardResumeWorkout",t("resume_discard"));
    const resumeHint = document.querySelector("#resumeWorkoutCard [data-i18n='resume_hint']");
    if(resumeHint) resumeHint.textContent=t("resume_hint");

    // timer
    const restCardTitle = document.querySelector("#restTimerCard .cardTitle");
    if(restCardTitle) restCardTitle.textContent=t("rest_title");
    const restLabel = document.querySelector("#restTimerCard label span");
    if(restLabel) restLabel.textContent=t("rest_seconds");
    setTextById("btnStartRest",t("rest_start"));
    setTextById("btnResetRest",t("rest_reset"));

    // mini labels
    const miniLabels = document.querySelectorAll(".miniLabel");
    if(miniLabels[0]) miniLabels[0].textContent=t("mini_state");
    if(miniLabels[1]) miniLabels[1].textContent=t("mini_done");

    // history
    setPlaceholderById("histSearch",t("hist_placeholder"));
    setTextById("btnClearHistory",t("clear"));
    setTextById("btnShowPR",t("show_pr"));
    const noteEl = document.querySelector("#view-history .tiny.muted");
    if(noteEl) noteEl.innerHTML=t("note");

    // history stats labels
    const statLbls = document.querySelectorAll(".statLbl");
    if(statLbls[0]) statLbls[0].textContent=t("stat_sessions");
    if(statLbls[1]) statLbls[1].textContent=t("stat_streak");
    if(statLbls[2]) statLbls[2].textContent=t("stat_kg");

    // history filter
    const histAllOpt = document.querySelector("#histDay option[value='all']");
    if(histAllOpt) histAllOpt.textContent=t("hist_filter_all");

    // measures
    setTextById("btnSaveMeasures",t("save_measures"));
    setTextById("btnClearMeasures",t("clear_measures"));
    setTextById("btnOpenMeasuresHistoryPage",t("measures_history"));
    setTextById("btnBackToMeasures",t("back"));
    const mhTitle=document.querySelector("#view-measures-history .cardTitle");
    if(mhTitle) mhTitle.textContent=t("measures_history");

    // measure field labels
    const mFields = [
      ["mDateLabel","m_date"],["mWeightLabel","m_weight"],["mChestLabel","m_chest"],
      ["mShouldersLabel","m_shoulders"],["mWaistLabel","m_waist"],
      ["mArmLLabel","m_arm_l"],["mArmRLabel","m_arm_r"],
      ["mQuadLLabel","m_quad_l"],["mQuadRLabel","m_quad_r"],
    ];
    mFields.forEach(([id,k])=>setTextById(id,t(k)));

    // bottom nav
    const w=document.querySelector('.bottomNav [data-view="workout"] .navTxt');
    const h=document.querySelector('.bottomNav [data-view="history"] .navTxt');
    const m=document.querySelector('.bottomNav [data-view="measures"] .navTxt');
    if(w) w.textContent=t("nav_workout");
    if(h) h.textContent=t("nav_history");
    if(m) m.textContent=t("nav_measures");

    // auth modal (only if in login state)
    const authModal = document.getElementById("authModal");
    if(authModal && !authModal.classList.contains("hidden")){
      const mode = authModal.dataset.mode || "login";
      _applyAuthLang(mode);
    }
    // auth cancel button (always)
    const authCancelBtn = document.querySelector("#authModal .btn.ghost.w100");
    if(authCancelBtn) authCancelBtn.textContent=t("auth_cancel");
    setTitleById("btnAuthOpen", t("title_google_in"));

    // topbar title (keep current view name)
    applyTheme(document.documentElement.getAttribute("data-theme")==="light"?"light":"dark");

    // re-render history with new lang (month names etc)
    try{ if(typeof renderHistory==="function") renderHistory(); }catch{}
    try{ if(typeof renderMeasures==="function") renderMeasures(); }catch{}
  }

  function _applyAuthLang(mode){
    const title = document.getElementById("authModalTitle");
    const subT  = document.getElementById("authModalSub");
    const btnDo = document.getElementById("btnAuthDo");
    const lnkSwitch = document.getElementById("authSwitchLink");
    const btnForgot = document.getElementById("btnForgotPassword");
    const authCancelBtn = document.querySelector("#authModal .btn.ghost.w100");
    if(mode==="register"){
      if(title) title.textContent=t("auth_register_title");
      if(subT) subT.textContent=t("auth_register_sub");
      if(btnDo) btnDo.textContent=t("auth_register_btn");
      if(lnkSwitch) lnkSwitch.textContent=t("auth_have_account");
    }else{
      if(title) title.textContent=t("auth_login_title");
      if(subT) subT.textContent=t("auth_login_sub");
      if(btnDo) btnDo.textContent=t("auth_login_btn");
      if(lnkSwitch) lnkSwitch.textContent=t("auth_no_account");
    }
    if(btnForgot) btnForgot.textContent=t("auth_forgot");
    if(authCancelBtn) authCancelBtn.textContent=t("auth_cancel");
    setPlaceholderById("authEmail", t("auth_email_placeholder"));
  }
  window._applyAuthLang = _applyAuthLang;

  function loadLanguage(){
    const s=(localStorage.getItem(LANG_KEY)||"it").toLowerCase();
    const lang=(s==="en")?"en":"it";
    window.__gt_lang = lang;
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
  window.getKgStep=()=>parseFloat(localStorage.getItem(KG_STEP_KEY)||"2.5");

  /* ======= REST DEFAULT ======= */
  function loadRestDefault(){
    const s=localStorage.getItem(REST_DEFAULT_KEY)||"90";
    if(restDefaultSelect) restDefaultSelect.value=s;
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
      try{ if(typeof openModal==="function") openModal({icon:"📤",title:t("modal_export_ok_title"),sub:t("modal_export_ok_sub")}); }catch{}
    }catch(e){
      try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:t("modal_export_err_title"),sub:t("modal_export_err_sub")}); }catch{}
    }
  }

  /* ======= IMPORT ======= */
  function importData(file){
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(e)=>{
      try{
        const parsed=JSON.parse(e.target.result);
        if(!parsed.template||!Array.isArray(parsed.sessions)) throw new Error("invalid");
        if(!confirm(t("confirm_import"))) return;
        localStorage.setItem("gym_tracker_full_v10",JSON.stringify(parsed));
        try{
          if(typeof state!=="undefined"){
            const fresh=JSON.parse(localStorage.getItem("gym_tracker_full_v10"));
            Object.assign(state,fresh);
            if(typeof renderAll==="function") renderAll();
          }
        }catch{}
        try{ if(typeof hapticMedium==="function") hapticMedium(); }catch{}
        try{ if(typeof openModal==="function") openModal({icon:"📥",title:t("modal_import_ok_title"),sub:t("modal_import_ok_sub")}); }catch{}
      }catch(err){
        try{ if(typeof openModal==="function") openModal({icon:"⚠️",title:t("modal_import_err_title"),sub:t("modal_import_err_sub")}); }catch{}
      }
    };
    reader.readAsText(file);
  }

  /* ======= RESET APP ======= */
  function resetApp(){
    if(!confirm(t("confirm_reset1"))) return;
    if(!confirm(t("confirm_reset2"))) return;
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
