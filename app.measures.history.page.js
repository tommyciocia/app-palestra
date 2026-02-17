// app.measures.history.page.js
(function () {
  const btnOpen = document.getElementById("btnOpenMeasuresHistoryPage");
  const btnBack = document.getElementById("btnBackToMeasures");
  const list = document.getElementById("measuresHistoryList");

  const vWorkout = document.getElementById("view-workout");
  const vHistory = document.getElementById("view-history");
  const vMeasures = document.getElementById("view-measures");
  const vMeasuresHist = document.getElementById("view-measures-history");

  function safeVal(v, unit) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? `${n}${unit}` : "—";
  }

  function hideMeasuresHistoryView() {
    if (vMeasuresHist) vMeasuresHist.classList.add("hidden");
  }

  // ✅ CAMBIATA SOLO QUESTA FUNZIONE
  function renderMeasuresHistoryPage() {
    if (!list) return;
    list.innerHTML = "";

    const all = [...(state.measures || [])].sort((a, b) => b.date.localeCompare(a.date));

    if (all.length === 0) {
      list.innerHTML = `<div class="card"><div class="tiny muted">Nessuna misura salvata.</div></div>`;
      return;
    }

    all.forEach(r => {
      const card = document.createElement("div");
      card.className = "card";

      const header = document.createElement("div");
      header.style.cursor = "pointer";
      header.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div class="historyTitle" style="margin:0;">📅 ${fmtDate(r.date)}</div>
          <div class="tiny muted">Tocca</div>
        </div>
      `;

      const content = document.createElement("div");
      content.style.marginTop = "12px";
      content.style.display = "none";

      // ✅ AGGIUNTA: compatibilità (se ci sono i nuovi campi li mostro, sennò uso quelli vecchi)
      const hasArmsLR = (r.armL && String(r.armL).trim() !== "") || (r.armR && String(r.armR).trim() !== "");
      const hasQuadsLR = (r.quadL && String(r.quadL).trim() !== "") || (r.quadR && String(r.quadR).trim() !== "");

      const armLine = hasArmsLR
        ? `Braccio SX: ${safeVal(r.armL,"cm")} • Braccio DX: ${safeVal(r.armR,"cm")}`
        : `Braccio: ${safeVal(r.arm,"cm")}`;

      const quadLine = hasQuadsLR
        ? `Quad SX: ${safeVal(r.quadL,"cm")} • Quad DX: ${safeVal(r.quadR,"cm")}`
        : `Coscia: ${safeVal(r.thigh,"cm")}`;

      content.innerHTML = `
        <div class="historyMeta">Peso: ${safeVal(r.weight,"kg")}</div>
        <div class="historyMeta">Vita: ${safeVal(r.waist,"cm")}</div>
        <div class="historyMeta">Petto: ${safeVal(r.chest,"cm")}</div>
        <div class="historyMeta">${armLine}</div>
        <div class="historyMeta">${quadLine}</div>
        <div class="historyMeta">Spalle: ${safeVal(r.shoulders,"cm")}</div>

        <button class="btn ghost danger w100" type="button" style="margin-top:12px;">
          🗑️ Elimina
        </button>
      `;

      // toggle (puoi aprirne più di una)
      header.addEventListener("click", () => {
        content.style.display = (content.style.display === "none") ? "block" : "none";
      });

      // elimina (senza chiudere/aprire)
      const delBtn = content.querySelector("button");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();

          if (typeof deleteMeasureByDate === "function") {
            deleteMeasureByDate(r.date);
          } else {
            if (!confirm("Vuoi davvero cancellare queste misure?")) return;
            state.measures = (state.measures || []).filter(x => x.date !== r.date);
            save();
          }

          renderMeasuresHistoryPage();
          try { if (typeof hapticMedium === "function") hapticMedium(); } catch {}
        });
      }

      card.appendChild(header);
      card.appendChild(content);
      list.appendChild(card);
    });
  }

  function openPage() {
    // nascondo tutto e apro solo la pagina storico
    if (vWorkout) vWorkout.classList.add("hidden");
    if (vHistory) vHistory.classList.add("hidden");
    if (vMeasures) vMeasures.classList.add("hidden");
    if (vMeasuresHist) vMeasuresHist.classList.remove("hidden");

    renderMeasuresHistoryPage();
    try { if (typeof hapticLight === "function") hapticLight(); } catch {}
  }

  function goBack() {
    // ✅ FIX: prima nascondo SEMPRE la view nuova, sennò resta sotto
    hideMeasuresHistoryView();

    // poi torno a Misure col tuo sistema
    if (typeof show === "function") {
      show("measures");
    } else {
      if (vMeasures) vMeasures.classList.remove("hidden");
    }

    try { if (typeof hapticLight === "function") hapticLight(); } catch {}
  }

  // ✅ EXTRA FIX: se clicchi i tab sotto mentre sei nello storico,
  // nascondo la view storico per evitare sovrapposizioni
  document.querySelectorAll(".bottomNav .navItem").forEach(btn => {
    btn.addEventListener("click", () => {
      hideMeasuresHistoryView();
    });
  });

  if (btnOpen) btnOpen.addEventListener("click", openPage);
  if (btnBack) btnBack.addEventListener("click", goBack);
})();
