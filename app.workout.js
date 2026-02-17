/* DOM workout */
const dayChips = document.getElementById("dayChips");
const btnNewDay = document.getElementById("btnNewDay");
const btnRenameDay = document.getElementById("btnRenameDay");
const btnDeleteDay = document.getElementById("btnDeleteDay");

const btnAddExercise = document.getElementById("btnAddExercise");
const btnSavePlan = document.getElementById("btnSavePlan");
const btnStart = document.getElementById("btnStart");
const btnDiscard = document.getElementById("btnDiscard");
const btnSaveWorkout = document.getElementById("btnSave");
const exerciseList = document.getElementById("exerciseList");
const draftState = document.getElementById("draftState");
const draftDone = document.getElementById("draftDone");
const workMsg = document.getElementById("workMsg");
/* =========================
   WORKOUT TIMER (AGGIUNTA)
========================= */
let workoutTimerInterval = null;

function formatTimeMMSS(totalSec){
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function startWorkoutTimer(){
  stopWorkoutTimer();

  workoutTimerInterval = setInterval(()=>{
    if(!state.draft || !state.draft.startedAt) return;

    const diff = Math.floor((Date.now() - state.draft.startedAt)/1000);

    // Mostra timer live nel titolo in alto (draftState)
    if(draftState){
      const dayName = getDay(state.draft.dayId)?.name || "";
      draftState.textContent = `⏱ ${formatTimeMMSS(diff)} • ${dayName}`;
    }
  }, 1000);
}

function stopWorkoutTimer(){
  if(workoutTimerInterval){
    clearInterval(workoutTimerInterval);
    workoutTimerInterval = null;
  }
}
/* =========================
   FINE AGGIUNTA TIMER
========================= */

/* Template+draft helpers */
function templateHasExerciseName(day, name){
  return day.exercises.some(e => normName(e.name) === normName(name));
}
function renameExerciseEverywhere(dayId, oldName, newName){
  const day = getDay(dayId);
  if(day){
    const ex = day.exercises.find(e => e.name === oldName);
    if(ex) ex.name = newName;
  }
  if(state.draft && state.draft.dayId === dayId){
    const it = state.draft.items.find(x => x.exName === oldName);
    if(it) it.exName = newName;
  }
}
function deleteExerciseEverywhere(dayId, name){
  const day = getDay(dayId);
  if(day) day.exercises = day.exercises.filter(e => e.name !== name);
  if(state.draft && state.draft.dayId === dayId){
    state.draft.items = state.draft.items.filter(it => it.exName !== name);
  }
}
function setCountEverywhere(dayId, name, newCount){
  const day = getDay(dayId);
  if(day){
    const ex = day.exercises.find(e => e.name === name);
    if(ex){
      if(ex.targets.length > newCount) ex.targets = ex.targets.slice(0,newCount);
      while(ex.targets.length < newCount) ex.targets.push(DEFAULT_TARGET);
    }
  }
  if(state.draft && state.draft.dayId === dayId){
    const it = state.draft.items.find(x => x.exName === name);
    if(it){
      if(it.sets.length > newCount) it.sets = it.sets.slice(0,newCount);
      while(it.sets.length < newCount) it.sets.push({ target: DEFAULT_TARGET, kg:"", reps:"", done:false });
    }
  }
}
function setTemplateTarget(dayId, exName, idx, value){
  const day = getDay(dayId);
  if(!day) return;
  const ex = day.exercises.find(e => e.name === exName);
  if(!ex) return;
  if(idx < 0 || idx >= ex.targets.length) return;
  ex.targets[idx] = value;
}

/* Days CRUD */
btnNewDay && (btnNewDay.onclick = ()=>{
  if(state.draft){
    openModal({ icon:"⚠️", title:"Prima salva/annulla", sub:"Non puoi creare una scheda mentre hai una bozza in corso." });
    return;
  }
  const name = (prompt("Nome nuova scheda (es. ARMS, GLUTES, FULL BODY):") || "").trim();
  if(!name) return;

  const id = uniqueDayId(name);
  state.template.days.push({ id, name, exercises:[] });
  state.currentDayId = id;
  save();
  renderAll();
  hapticMedium();
  openModal({ icon:"➕", title:"Scheda creata", sub:`Creata: ${name}` });
});

btnRenameDay && (btnRenameDay.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;

  const newName = (prompt("Nuovo nome scheda:", day.name) || "").trim();
  if(!newName || newName === day.name) return;

  day.name = newName;
  save();
  renderAll();
  hapticMedium();
  openModal({ icon:"✏️", title:"Scheda rinominata", sub:`Ora: ${newName}` });
});

btnDeleteDay && (btnDeleteDay.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;

  if(state.template.days.length === 1){
    openModal({ icon:"⚠️", title:"Non puoi", sub:"Deve rimanere almeno 1 scheda." });
    return;
  }
  if(state.draft && state.draft.dayId === day.id){
    openModal({ icon:"⚠️", title:"Bozza in corso", sub:"Annulla o salva l’allenamento prima di eliminare questa scheda." });
    return;
  }
  if(!confirm(`Eliminare la scheda "${day.name}"?`)) return;

  state.template.days = state.template.days.filter(d => d.id !== day.id);
  state.currentDayId = state.template.days[0].id;

  save();
  renderAll();
  hapticMedium();
  openModal({ icon:"🗑️", title:"Scheda eliminata", sub:"Eliminata correttamente. Lo storico resta." });
});

/* Chips */
function renderChips(){
  if(!dayChips) return;
  dayChips.innerHTML="";
  for(const d of state.template.days){
    const c = document.createElement("button");
    c.type = "button"; // (solo questa riga in più)
    c.className = "chip" + (d.id===state.currentDayId ? " active":"");
    c.textContent = d.name;
    c.onclick = ()=>{
      state.currentDayId = d.id;
      save();
      renderAll();
      hapticLight();
    };
    dayChips.appendChild(c);
  }
}

/* Add exercise */
btnAddExercise && (btnAddExercise.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;

  const name = (prompt("Nome esercizio (uguale a come vuoi cercarlo nello storico):") || "").trim();
  if(!name) return;

  if(templateHasExerciseName(day, name)){
    openModal({ icon:"⚠️", title:"Esiste già", sub:"C’è già un esercizio con questo nome in questa scheda." });
    return;
  }

  let sets = parseInt(prompt("Quanti set? (1-10)", "3") || "3", 10);
  if(!Number.isFinite(sets)) sets = 3;
  sets = Math.max(1, Math.min(10, sets));

  const targets = Array.from({length: sets}, ()=>DEFAULT_TARGET);
  day.exercises.push({ name, targets });

  if(state.draft && state.draft.dayId === day.id){
    state.draft.items.push({
      exName: name,
      sets: targets.map(t => ({ target:t, kg:"", reps:"", done:false }))
    });
  }

  save();
  renderAll();
  hapticMedium();
  openModal({ icon:"➕", title:"Esercizio aggiunto", sub:`Aggiunto a ${day.name}.` });
});

btnSavePlan && (btnSavePlan.onclick = ()=>{
  save();
  hapticLight();
  openModal({ icon:"💾", title:"Scheda salvata", sub:"Modifiche memorizzate." });
});

/* Header */
function renderDraftHeader(){
  if(workMsg) workMsg.textContent = "";
  if(!draftState || !draftDone) return;

  if(!state.draft){
    const dayName = getDay(state.currentDayId)?.name || state.currentDayId;
    draftState.textContent = `Scheda • ${dayName}`;
    draftDone.textContent = "—";
    return;
  }
  const dayName = getDay(state.draft.dayId)?.name || state.draft.dayId;
  const {done,total} = countDone(state.draft);
  draftState.textContent = `${fmtDate(state.draft.date)} • ${dayName}`;
  draftDone.textContent = `${done}/${total}`;
}

/* Plan editor (no draft) */
function renderPlanEditor(){
  const day = getDay(state.currentDayId);
  if(!exerciseList) return;
  exerciseList.innerHTML = "";

  if(!day || day.exercises.length === 0){
    exerciseList.innerHTML = `
      <div class="card">
        <div class="muted">Nessun esercizio in questa scheda. Premi <b>＋ Esercizio</b>.</div>
      </div>`;
    return;
  }

  day.exercises.forEach(ex=>{
    const box = document.createElement("div");
    box.className = "exercise";

    box.innerHTML = `
      <div class="exerciseTop">
        <div>
          <div class="exerciseName">${esc(ex.name)}</div>
          <div class="badge">${ex.targets.length} set • modifica target qui sotto</div>
        </div>

        <div class="exerciseActions">
          <button class="iconTiny" title="Rinomina">✏️</button>
          <button class="iconTiny" title="Cambia set">🔢</button>
          <button class="iconTiny danger" title="Elimina">🗑️</button>
        </div>
      </div>
    `;

    const [btnRename, btnSets, btnDel] = box.querySelectorAll("button.iconTiny");

    btnRename.onclick = ()=>{
      const newName = (prompt("Nuovo nome esercizio (ricerca storico ESATTA):", ex.name) || "").trim();
      if(!newName || newName === ex.name) return;

      if(templateHasExerciseName(day, newName)){
        openModal({ icon:"⚠️", title:"Nome già usato", sub:"Esiste già un esercizio con quel nome in questa scheda." });
        return;
      }

      renameExerciseEverywhere(day.id, ex.name, newName);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"✏️", title:"Rinominato", sub:"Aggiornato nella scheda." });
    };

    btnSets.onclick = ()=>{
      let n = parseInt(prompt("Numero set (1-10):", String(ex.targets.length)) || "", 10);
      if(!Number.isFinite(n)) return;
      n = Math.max(1, Math.min(10, n));

      setCountEverywhere(day.id, ex.name, n);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"🔢", title:"Set aggiornati", sub:`Ora: ${n} set.` });
    };

    btnDel.onclick = ()=>{
      if(!confirm(`Eliminare "${ex.name}" dalla scheda?`)) return;
      deleteExerciseEverywhere(day.id, ex.name);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"🗑️", title:"Esercizio eliminato", sub:"Rimosso dalla scheda." });
    };

    ex.targets.forEach((t, idx)=>{
      const row = document.createElement("div");
      row.className = "setRow";
      row.innerHTML = `
        <div class="setLabel">#${idx+1}</div>
        <input class="inp targetInp" type="text" value="${esc(t || "")}" placeholder="6-8">
        <input class="inp" type="text" value="—" disabled>
        <input class="inp" type="text" value="—" disabled>
        <input class="chk" type="checkbox" disabled>
      `;

      const targetInp = row.querySelector("input.targetInp");
      targetInp.addEventListener("input", (e)=>{
        setTemplateTarget(day.id, ex.name, idx, e.target.value);
        save();
      });

      box.appendChild(row);
    });

    exerciseList.appendChild(box);
  });
}

/* Draft */
function renderWorkoutDraft(){
  if(!exerciseList) return;
  exerciseList.innerHTML = "";

  for(const item of state.draft.items){
    const box = document.createElement("div");
    box.className = "exercise";

    // ✅ MODIFICA: colore + bottone "Usa"
    const s0 = item.sets?.[0] || {};
    const hasSug = (s0.sugKg && String(s0.sugKg).trim() !== "" && s0.sugNote);

    const lastNum = Number(String(s0.lastKg || "").replace(",", "."));
    const sugNum  = Number(String(s0.sugKg  || "").replace(",", "."));

    let sugStyle = "";
    if(Number.isFinite(lastNum) && Number.isFinite(sugNum)){
      if(sugNum > lastNum){
        sugStyle = "border:1px solid rgba(46,204,113,.55); background:rgba(46,204,113,.10);";
      }else if(sugNum < lastNum){
        sugStyle = "border:1px solid rgba(255,77,93,.55); background:rgba(255,77,93,.10);";
      }else{
        sugStyle = "border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04);";
      }
    }else{
      sugStyle = "border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04);";
    }

    box.innerHTML = `
      <div class="exerciseTop">
        <div>
          <div class="exerciseName">${esc(item.exName)}</div>

          ${hasSug ? `
            <div style="margin-top:6px; padding:8px 10px; border-radius:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; ${sugStyle}">
              <div>
                <div class="tiny" style="font-weight:900;">
                  Prossima volta: <b>${esc(s0.sugKg)}kg</b> • ${esc(s0.sugNote)}
                </div>
                <div class="tiny muted" style="opacity:.85; margin-top:4px;">
                  Ultima: ${esc(s0.lastKg||"—")}×${esc(s0.lastReps||"—")}
                </div>
              </div>

              <button type="button" class="btn small primary sugApplyBtn" style="height:34px; padding:8px 10px; border-radius:14px;">
                Usa
              </button>
            </div>
          ` : `
            <div class="badge">${item.sets.length} set</div>
          `}
        </div>

        <div class="exerciseActions">
          <button class="iconTiny" title="Rinomina">✏️</button>
          <button class="iconTiny" title="Cambia set">🔢</button>
          <button class="iconTiny danger" title="Elimina">🗑️</button>
        </div>
      </div>
    `;

    // ✅ AGGIUNTA: handler bottone "Usa"
    if(hasSug){
      const b = box.querySelector(".sugApplyBtn");
      b && (b.onclick = ()=>{
        for(const s of item.sets){
          if(!s.sugKg) continue;

          const cur  = String(s.kg || "").trim();
          const last = String(s.lastKg || "").trim();

          if(cur === "" || cur === last){
            s.kg = String(s.sugKg);
          }
        }

        save();
        renderAll();
        hapticLight();
      });
    }

    const [btnRename, btnSets, btnDel] = box.querySelectorAll("button.iconTiny");

    btnRename.onclick = ()=>{
      const dayId = state.draft.dayId;
      const day = getDay(dayId);
      const newName = (prompt("Nuovo nome esercizio:", item.exName) || "").trim();
      if(!newName || newName === item.exName) return;

      if(day && templateHasExerciseName(day, newName)){
        openModal({ icon:"⚠️", title:"Nome già usato", sub:"Esiste già un esercizio con quel nome in questa scheda." });
        return;
      }

      renameExerciseEverywhere(dayId, item.exName, newName);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"✏️", title:"Rinominato", sub:"Nome aggiornato nella scheda." });
    };

    btnSets.onclick = ()=>{
      const dayId = state.draft.dayId;
      let n = parseInt(prompt("Numero set (1-10):", String(item.sets.length)) || "", 10);
      if(!Number.isFinite(n)) return;
      n = Math.max(1, Math.min(10, n));

      setCountEverywhere(dayId, item.exName, n);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"🔢", title:"Set aggiornati", sub:`Ora: ${n} set.` });
    };

    btnDel.onclick = ()=>{
      const dayId = state.draft.dayId;
      if(!confirm(`Eliminare "${item.exName}" dalla scheda?`)) return;

      deleteExerciseEverywhere(dayId, item.exName);
      save();
      renderAll();
      hapticMedium();
      openModal({ icon:"🗑️", title:"Esercizio eliminato", sub:"Rimosso dalla scheda." });
    };

    item.sets.forEach((s, idx)=>{
      const row = document.createElement("div");
      row.className = "setRow";
      row.innerHTML = `
        <div class="setLabel">#${idx+1}</div>
        <input class="inp targetInp" type="text" value="${esc(s.target || "")}" placeholder="6-8">
        <input class="inp kgInp" type="number" step="0.25" inputmode="decimal" placeholder="Kg" value="${esc(s.kg || "")}">
        <input class="inp reps" type="number" step="1" inputmode="numeric" placeholder="Reps" value="${esc(s.reps || "")}">
        <input class="chk done" type="checkbox" ${s.done ? "checked":""}>
      `;

      row.querySelector("input.targetInp").addEventListener("input", (e)=>{ s.target = e.target.value; save(); });
      row.querySelector("input.kgInp").addEventListener("input", (e)=>{ s.kg = e.target.value; save(); });
      row.querySelector("input.reps").addEventListener("input", (e)=>{ s.reps = e.target.value; save(); });
      row.querySelector("input.done").addEventListener("change", (e)=>{
        s.done = e.target.checked;
        save();
        renderDraftHeader();
        hapticLight();
      });

      box.appendChild(row);
    });

    // 💬 Commento (si salva nell'allenamento e si rivede la volta dopo)
    const cRow = document.createElement("div");
    cRow.className = "setRow";
    cRow.style.marginTop = "10px";
    cRow.innerHTML = `
      <div class="setLabel">💬</div>
      <input class="inp commentInp" type="text" placeholder="Commento esercizio..." value="${esc(item.comment || "")}" style="grid-column: 2 / 6;">
    `;
    const cInp = cRow.querySelector("input.commentInp");
    cInp && cInp.addEventListener("input", (e)=>{
      item.comment = e.target.value || "";
      save();
    });
    box.appendChild(cRow);

    exerciseList.appendChild(box);
  }
}

function renderWorkout(){
  renderDraftHeader();

  if(!state.draft){
    document.body.classList.remove("workout-active");
    return renderPlanEditor();
  }

  document.body.classList.add("workout-active");
  renderWorkoutDraft();
}


/* Actions workout */
btnStart && (btnStart.onclick = ()=>{
  if(state.draft){
    if(workMsg) workMsg.textContent = "Hai già una bozza in corso (salva o annulla).";
    hapticLight();
    return;
  }

  state.draft = makeDraft(state.currentDayId);
  state.draft.startedAt = Date.now(); // ✅ prima del save
  save();
  renderAll();
  hapticMedium();

  try{ startWorkoutTimer(); }catch{}

  track("workout_start", { day_id: state.currentDayId });
});



btnDiscard && (btnDiscard.onclick = ()=>{
  if(!state.draft){
    if(workMsg) workMsg.textContent = "Non c’è nessuna bozza.";
    hapticLight();
    return;
  }
  if(!confirm("Annullare la bozza? (non verrà salvato nulla)")) return;
  state.draft = null;
  stopWorkoutTimer();
  save();
  renderAll();
  hapticMedium();
});

btnSaveWorkout && (btnSaveWorkout.onclick = ()=>{
  if(!state.draft){
    if(workMsg) workMsg.textContent = "Prima devi iniziare.";
    hapticLight();
    return;
  }
  const {done} = countDone(state.draft);
  if(done===0 && !confirm("Nessun set spuntato. Salvare lo stesso?")) return;

  // ✅ ultimo allenamento IN CIMA (così "ultimo" è davvero ultimo)
  if(state.draft.startedAt){
    state.draft.durationSec = Math.floor((Date.now() - state.draft.startedAt) / 1000);
  }
  state.sessions.unshift(structuredClone(state.draft));
  state.draft = null;
  stopWorkoutTimer();

  save();
  renderAll();
  hapticMedium();

  // GA PRO
  try{
    const lastSession = state.sessions[0];
    if(lastSession){
      const exercises_count = lastSession.items.length;
      const sets_total = lastSession.items.reduce((a,i)=>a + (i.sets?.length || 0), 0);
      const sets_done = lastSession.items.reduce((a,i)=>a + (i.sets?.filter(s=>s.done).length || 0), 0);

      track("workout_saved", {
        day_id: lastSession.dayId || "unknown",
        exercises_count,
        sets_total,
        sets_done
      });

      lastSession.items.forEach(it=>{
        track("exercise_used", { exercise_name: it.exName || "unknown" });
      });
    }
  }catch{}

  openModal({ icon:"✅", title:"Allenamento salvato", sub:"Lo trovi nello Storico." });
});
