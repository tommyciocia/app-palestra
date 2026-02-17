const mDate = document.getElementById("mDate");

const mWeight = document.getElementById("mWeight");
const mWaist = document.getElementById("mWaist");
const mChest = document.getElementById("mChest");
const mShoulders = document.getElementById("mShoulders");

const mArmL = document.getElementById("mArmL");
const mArmR = document.getElementById("mArmR");
const mQuadL = document.getElementById("mQuadL");
const mQuadR = document.getElementById("mQuadR");

// ✅ vecchi campi (se esistono ancora nell’HTML) — li svuotiamo e basta
const mArm = document.getElementById("mArm");
const mThigh = document.getElementById("mThigh");

const btnSaveMeasures = document.getElementById("btnSaveMeasures");
const btnClearMeasures = document.getElementById("btnClearMeasures");
const measuresList = document.getElementById("measuresList");

if (mDate) mDate.value = todayISO();

btnSaveMeasures && (btnSaveMeasures.onclick = () => {
  const dateValue = (mDate && mDate.value) ? mDate.value : todayISO();

  // ✅ assicurati che esista
  state.measures = state.measures || [];

  // 🔴 controllo se esiste già quella data
  const alreadyExists = (state.measures || []).some(x => x.date === dateValue);
  if (alreadyExists) {
    openModal({ icon: "⚠️", title: "Ops", sub: "Giorno già aggiunto." });
    return;
  }

  // ✅ NUOVO: devono essere TUTTI compilati, altrimenti NON salva
  const required = [
    { el: mWeight,    label: "Peso" },
    { el: mChest,     label: "Petto" },
    { el: mShoulders, label: "Spalle" },
    { el: mWaist,     label: "Vita" },
    { el: mArmL,      label: "Braccio SX" },
    { el: mArmR,      label: "Braccio DX" },
    { el: mQuadL,     label: "Quad SX" },
    { el: mQuadR,     label: "Quad DX" }
  ];

  // se manca anche solo 1 -> blocco
  const missing = required.filter(x => !x.el || !x.el.value || String(x.el.value).trim() === "");
  if (missing.length > 0) {
    openModal({
      icon: "⚠️",
      title: "Compila tutto",
      sub: "Devi inserire TUTTE le misure prima di salvare."
    });
    return;
  }

  // ✅ nuovo record
  const rec = {
    date: dateValue,
    weight: mWeight.value,
    chest: mChest.value,
    shoulders: mShoulders.value,
    waist: mWaist.value,
    armL: mArmL.value,
    armR: mArmR.value,
    quadL: mQuadL.value,
    quadR: mQuadR.value
  };

  state.measures.push(rec);
  state.measures.sort((a, b) => a.date.localeCompare(b.date));
  save();

  // ✅ svuota campi dopo salvataggio (TUTTO)
  if (mWeight) mWeight.value = "";
  if (mChest) mChest.value = "";
  if (mShoulders) mShoulders.value = "";
  if (mWaist) mWaist.value = "";

  if (mArmL) mArmL.value = "";
  if (mArmR) mArmR.value = "";
  if (mQuadL) mQuadL.value = "";
  if (mQuadR) mQuadR.value = "";

  if (mArm) mArm.value = "";
  if (mThigh) mThigh.value = "";

  if (mDate) mDate.value = todayISO();

  renderAll();
  hapticMedium();

  openModal({
    icon: "📏",
    title: "Misure salvate",
    sub: "Giorno registrato correttamente."
  });
});

btnClearMeasures && (btnClearMeasures.onclick = () => {
  if (!confirm("Vuoi davvero svuotare tutto lo storico misure?")) return;

  state.measures = [];
  save();

  if (mDate) mDate.value = todayISO();
  if (mWeight) mWeight.value = "";
  if (mChest) mChest.value = "";
  if (mShoulders) mShoulders.value = "";
  if (mWaist) mWaist.value = "";

  if (mArmL) mArmL.value = "";
  if (mArmR) mArmR.value = "";
  if (mQuadL) mQuadL.value = "";
  if (mQuadR) mQuadR.value = "";

  if (mArm) mArm.value = "";
  if (mThigh) mThigh.value = "";

  renderAll();
  hapticMedium();

  openModal({
    icon: "🗑️",
    title: "Misure svuotate",
    sub: "Lo storico misure è stato cancellato."
  });
});

function safeVal(v, unit) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `${n}${unit}` : "—";
}

function deleteMeasureByDate(date) {
  if (!date) return;
  if (!confirm("Vuoi davvero cancellare queste misure?")) return;

  state.measures = (state.measures || []).filter(x => x.date !== date);
  save();
  renderAll();
  hapticMedium();

  openModal({
    icon: "🗑️",
    title: "Misure eliminate",
    sub: "La voce è stata rimossa dallo storico."
  });
}

/* ✅ lista mini nello stesso tab Misure (se la usi ancora da qualche parte) */
function renderMeasures() {
  if (!measuresList) return;
  measuresList.innerHTML = "";

  const last = [...(state.measures || [])].sort((a, b) => b.date.localeCompare(a.date));

  if (last.length === 0) {
    measuresList.innerHTML = `<div class="muted">Nessuna misura ancora.</div>`;
    return;
  }

  last.forEach(r => {
    const box = document.createElement("div");
    box.className = "historyItem";

    const armLine =
      (r.armL || r.armR)
        ? `Br SX: ${safeVal(r.armL, "cm")} • Br DX: ${safeVal(r.armR, "cm")}`
        : `Braccio: ${safeVal(r.arm, "cm")}`;

    const quadLine =
      (r.quadL || r.quadR)
        ? `Quad SX: ${safeVal(r.quadL, "cm")} • Quad DX: ${safeVal(r.quadR, "cm")}`
        : `Coscia: ${safeVal(r.thigh, "cm")}`;

    box.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
        <div style="min-width:0;">
          <div class="historyTitle">${fmtDate(r.date)}</div>
          <div class="historyMeta">Peso: ${safeVal(r.weight, "kg")} • Petto: ${safeVal(r.chest, "cm")}</div>
          <div class="historyMeta">Spalle: ${safeVal(r.shoulders, "cm")} • Vita: ${safeVal(r.waist, "cm")}</div>
          <div class="historyMeta">${armLine}</div>
          <div class="historyMeta">${quadLine}</div>
        </div>

        <button class="btn ghost danger" style="padding:10px 12px;">Elimina</button>
      </div>
    `;

    box.querySelector("button").onclick = () => {
      deleteMeasureByDate(r.date);
    };

    measuresList.appendChild(box);
  });
}
