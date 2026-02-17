// ==========================
// TIMER RECUPERO
// ==========================
(function(){
  function init(){
    const restInput = document.getElementById("restSeconds");
    const restDisplay = document.getElementById("restDisplay");
    const btnStartRest = document.getElementById("btnStartRest");
    const btnResetRest = document.getElementById("btnResetRest");

    if (!restInput || !restDisplay || !btnStartRest || !btnResetRest) return;

    const LS_END_AT = "gt_rest_endAt";
    const LS_RUNNING = "gt_rest_running";

    let restInterval = null;
    let remainingSeconds = parseInt(restInput.value || "90", 10);
    let endAt = 0;

    function formatTime(sec){
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return String(m).padStart(2,'0') + ":" + String(s).padStart(2,'0');
    }

    function updateDisplay(){
      restDisplay.textContent = formatTime(Math.max(0, remainingSeconds));
    }

    function vibrateFinish(){
      try{
      // Vibrazione SOLO se attiva nelle impostazioni
      if (localStorage.getItem("gt_vibration") !== "off"){
        if (navigator && typeof navigator.vibrate === "function"){
          navigator.vibrate([200, 120, 200, 120, 400]);
        }
      }

      }catch{}

      // Se hai già funzioni haptic nel tuo progetto, le usiamo senza toccare altro
      try{ if (typeof hapticHeavy === "function") hapticHeavy(); }catch{}
      try{ if (typeof hapticMedium === "function") hapticMedium(); }catch{}
    }

    function stopInterval(){
      if (restInterval){
        clearInterval(restInterval);
        restInterval = null;
      }
    }

    function clearPersisted(){
      try{
        localStorage.removeItem(LS_END_AT);
        localStorage.removeItem(LS_RUNNING);
      }catch{}
    }

    function savePersisted(){
      try{
        localStorage.setItem(LS_END_AT, String(endAt || 0));
        localStorage.setItem(LS_RUNNING, endAt ? "1" : "0");
      }catch{}
    }

    function computeRemainingFromEndAt(){
      if (!endAt) return;
      const diffMs = endAt - Date.now();
      remainingSeconds = Math.ceil(diffMs / 1000);
      if (!Number.isFinite(remainingSeconds)) remainingSeconds = 0;
      if (remainingSeconds < 0) remainingSeconds = 0;
    }

    function finishTimer(){
      stopInterval();
      remainingSeconds = 0;
      endAt = 0;
      clearPersisted();
      updateDisplay();
      vibrateFinish();

      // Messaggio finale: usa il tuo modal se esiste, altrimenti alert
      if (typeof openModal === "function"){
        openModal({ icon: "⏱️", title: "Recupero finito", sub: "Vai 💪" });
      } else {
        alert("Recupero finito 💪");
      }
    }

    function tick(){
      if (!endAt) return;
      computeRemainingFromEndAt();
      updateDisplay();

      if (remainingSeconds <= 0){
        finishTimer();
      }
    }

    function startInterval(){
      if (restInterval) return;
      restInterval = setInterval(tick, 250); // tick “fitto” ma leggero, così resta preciso anche se lagga
    }

    // Stato iniziale
    updateDisplay();

    // Se l’utente cambia i secondi mentre NON sta correndo, aggiorno solo display
    restInput.addEventListener("input", () => {
      const v = parseInt(restInput.value, 10);
      if (Number.isFinite(v)) {
        // se NON è in corso un timer, aggiorna il valore “pronto”
        if (!endAt){
          remainingSeconds = v;
          updateDisplay();
        }
      }
    });

    // START
    btnStartRest.addEventListener("click", () => {
      if (endAt) return; // già in corso

      const v = parseInt(restInput.value, 10);
      if (!Number.isFinite(v) || v <= 0) {
        restInput.value = "90";
        remainingSeconds = 90;
      } else {
        remainingSeconds = v;
      }

      endAt = Date.now() + (remainingSeconds * 1000);
      savePersisted();
      tick();
      startInterval();
    });

    // RESET
    btnResetRest.addEventListener("click", () => {
      stopInterval();
      endAt = 0;
      clearPersisted();

      const v = parseInt(restInput.value, 10);
      remainingSeconds = (Number.isFinite(v) && v > 0) ? v : 90;
      updateDisplay();
    });

    // ✅ Riprendi timer se era in corso (anche dopo refresh / background)
    try{
      const wasRunning = localStorage.getItem(LS_RUNNING) === "1";
      const savedEndAt = Number(localStorage.getItem(LS_END_AT) || "0");
      if (wasRunning && Number.isFinite(savedEndAt) && savedEndAt > 0){
        endAt = savedEndAt;
        tick();
        if (remainingSeconds > 0){
          startInterval();
        } else {
          // era già finito mentre eri via
          finishTimer();
        }
      }
    }catch{}

    // ✅ Quando torni dall’app in background, ricalcola subito (così “continua” davvero)
    document.addEventListener("visibilitychange", () => {
      if (!endAt) return;
      if (!document.hidden){
        tick();
      }
    });

    window.addEventListener("focus", () => {
      if (!endAt) return;
      tick();
    });
  }

  // sicuro su Safari/iPhone: parte anche se lo script viene caricato presto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
