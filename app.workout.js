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

/* ===========================
   TOAST
=========================== */
let _toastTimer = null;
function showToast(icon, msg, ms = 2200){
  const host = document.getElementById("toastHost");
  const el   = document.getElementById("toastEl");
  if(!host || !el) return;
  clearTimeout(_toastTimer);
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  el.classList.add("show");
  _toastTimer = setTimeout(()=> el.classList.remove("show"), ms);
}

/* ===========================
   PROGRESS BAR
=========================== */
function updateProgressBar(){
  const wrap  = document.getElementById("workoutProgressWrap");
  const fill  = document.getElementById("workoutProgressFill");
  const label = document.getElementById("workoutProgressLabel");
  if(!wrap || !fill || !label) return;

  if(!state.draft){ wrap.style.display = "none"; return; }

  const {done, total} = countDone(state.draft);
  if(total === 0){ wrap.style.display = "none"; return; }

  const pct = Math.round((done / total) * 100);
  wrap.style.display = "flex";
  fill.style.width = pct + "%";
  label.textContent = pct + "%";
}

/* ===========================
   WORKOUT TIMER
=========================== */
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
    if(draftState){
      const dayName = getDay(state.draft.dayId)?.name || "";
      draftState.textContent = `⏱ ${formatTimeMMSS(diff)} • ${dayName}`;
    }
  }, 1000);
}

function stopWorkoutTimer(){
  if(workoutTimerInterval){ clearInterval(workoutTimerInterval); workoutTimerInterval = null; }
}

/* Template+draft helpers */
function templateHasExerciseName(day, name){
  return day.exercises.some(e => normName(e.name) === normName(name));
}
function renameExerciseEverywhere(dayId, oldName, newName){
  const day = getDay(dayId);
  if(day){ const ex = day.exercises.find(e => e.name === oldName); if(ex) ex.name = newName; }
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
  if(!ex || idx < 0 || idx >= ex.targets.length) return;
  ex.targets[idx] = value;
}

/* Days CRUD */
btnNewDay && (btnNewDay.onclick = ()=>{
  if(state.draft){ openModal({ icon:"⚠️", title:t("modal_draft_block_title"), sub:t("modal_draft_block_sub") }); return; }
  const name = (prompt(t("prompt_new_day")) || "").trim();
  if(!name) return;
  const id = uniqueDayId(name);
  state.template.days.push({ id, name, exercises:[] });
  state.currentDayId = id;
  save(); renderAll(); hapticMedium();
  showToast("➕", t("toast_plan_created",{name}));
});

btnRenameDay && (btnRenameDay.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;
  const newName = (prompt(t("prompt_rename_day"), day.name) || "").trim();
  if(!newName || newName === day.name) return;
  day.name = newName;
  save(); renderAll(); hapticMedium();
  showToast("✏️", t("toast_plan_renamed",{name:newName}));
});

btnDeleteDay && (btnDeleteDay.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;
  if(state.template.days.length === 1){ openModal({ icon:"⚠️", title:t("modal_cant_delete_title"), sub:t("modal_cant_delete_sub") }); return; }
  if(state.draft && state.draft.dayId === day.id){ openModal({ icon:"⚠️", title:t("modal_draft_running_title"), sub:t("modal_draft_running_sub") }); return; }
  if(!confirm(t("confirm_delete_day",{name:day.name}))) return;
  state.template.days = state.template.days.filter(d => d.id !== day.id);
  state.currentDayId = state.template.days[0].id;
  save(); renderAll(); hapticMedium();
  showToast("🗑️", t("toast_plan_deleted"));
});

/* Chips */
function renderChips(){
  if(!dayChips) return;
  dayChips.innerHTML="";
  for(const d of state.template.days){
    const c = document.createElement("button");
    c.type = "button";
    c.className = "chip" + (d.id===state.currentDayId ? " active":"");
    c.textContent = d.name;
    c.onclick = ()=>{ state.currentDayId = d.id; save(); renderAll(); hapticLight(); };
    dayChips.appendChild(c);
  }
}

/* Add exercise */
btnAddExercise && (btnAddExercise.onclick = ()=>{
  const day = getDay(state.currentDayId);
  if(!day) return;
  const name = (prompt(t("prompt_new_exercise")) || "").trim();
  if(!name) return;
  if(templateHasExerciseName(day, name)){ openModal({ icon:"⚠️", title:t("modal_ex_exists_title"), sub:t("modal_ex_exists_sub") }); return; }
  let sets = parseInt(prompt(t("prompt_sets"), "3") || "3", 10);
  if(!Number.isFinite(sets)) sets = 3;
  sets = Math.max(1, Math.min(10, sets));
  const targets = Array.from({length: sets}, ()=>DEFAULT_TARGET);
  day.exercises.push({ name, targets });
  if(state.draft && state.draft.dayId === day.id){
    state.draft.items.push({ exName: name, sets: targets.map(t2 => ({ target:t2, kg:"", reps:"", done:false })) });
  }
  save(); renderAll(); hapticMedium();
  showToast("➕", t("toast_ex_added",{name}));
});

btnSavePlan && (btnSavePlan.onclick = ()=>{
  save(); hapticLight();
  showToast("💾", t("toast_plan_saved"));
});

/* Header */
function renderDraftHeader(){
  if(workMsg) workMsg.textContent = "";
  if(!draftState || !draftDone) return;
  if(!state.draft){
    const dayName = getDay(state.currentDayId)?.name || state.currentDayId;
    draftState.textContent = `${t("draft_state_idle")} • ${dayName}`;
    draftDone.textContent = "—";
    return;
  }
  const dayName = getDay(state.draft.dayId)?.name || state.draft.dayId;
  const {done,total} = countDone(state.draft);
  draftState.textContent = `${fmtDate(state.draft.date)} • ${dayName}`;
  draftDone.textContent = `${done}/${total}`;
  updateProgressBar();
}

/* Plan editor (no draft) */
function renderPlanEditor(){
  const day = getDay(state.currentDayId);
  if(!exerciseList) return;
  exerciseList.innerHTML = "";
  if(!day || day.exercises.length === 0){
    exerciseList.innerHTML = `<div class="card"><div class="muted">${t("no_exercises")}</div></div>`;
    return;
  }
  day.exercises.forEach(ex=>{
    const box = document.createElement("div");
    box.className = "exercise";
    box.innerHTML = `
      <div class="exerciseTop">
        <div>
          <div class="exerciseName">${esc(ex.name)}</div>
          <div class="badge">${ex.targets.length} set • ${t("plan_badge_hint")}</div>
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
      const newName = (prompt(t("prompt_rename_exercise"), ex.name) || "").trim();
      if(!newName || newName === ex.name) return;
      if(templateHasExerciseName(day, newName)){ openModal({ icon:"⚠️", title:t("modal_name_used_title"), sub:t("modal_name_used_sub") }); return; }
      renameExerciseEverywhere(day.id, ex.name, newName);
      save(); renderAll(); hapticMedium();
      showToast("✏️", t("toast_renamed"));
    };
    btnSets.onclick = ()=>{
      let n = parseInt(prompt(t("prompt_change_sets"), String(ex.targets.length)) || "", 10);
      if(!Number.isFinite(n)) return;
      n = Math.max(1, Math.min(10, n));
      setCountEverywhere(day.id, ex.name, n);
      save(); renderAll(); hapticMedium();
      showToast("🔢", t("toast_sets_changed",{n}));
    };
    btnDel.onclick = ()=>{
      if(!confirm(t("confirm_delete_exercise",{name:ex.name}))) return;
      deleteExerciseEverywhere(day.id, ex.name);
      save(); renderAll(); hapticMedium();
      showToast("🗑️", t("toast_deleted"));
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
      row.querySelector("input.targetInp").addEventListener("input", (e)=>{ setTemplateTarget(day.id, ex.name, idx, e.target.value); save(); });
      box.appendChild(row);
    });
    exerciseList.appendChild(box);
  });
}

/* Draft */
function renderWorkoutDraft(){
  if(!exerciseList) return;
  exerciseList.innerHTML = "";

  // ===== BOTTONE "APPLICA TUTTI I SUGGERIMENTI" =====
  const hasAnySug = state.draft.items.some(it => it.sets?.[0]?.sugKg && it.sets[0].sugKg !== "");
  if(hasAnySug){
    const applyAllWrap = document.createElement("div");
    applyAllWrap.className = "card";
    applyAllWrap.style.padding = "10px 12px";
    applyAllWrap.style.marginBottom = "4px";
    applyAllWrap.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
        <div>
          <div style="font-weight:900; font-size:13px;">${t("sug_title")}</div>
          <div class="tiny muted" style="margin-top:3px;">${t("sug_sub")}</div>
        </div>
        <button id="btnApplyAllSug" type="button" class="btn primary small" style="white-space:nowrap; height:38px;">${t("sug_apply_all")}</button>
      </div>
    `;
    applyAllWrap.querySelector("#btnApplyAllSug").onclick = ()=>{
      let count = 0;
      for(const item of state.draft.items){
        for(const s of item.sets){
          if(!s.sugKg) continue;
          const cur  = String(s.kg   || "").trim();
          const last = String(s.lastKg|| "").trim();
          if(cur === "" || cur === last){ s.kg = String(s.sugKg); count++; }
        }
      }
      save(); renderAll(); hapticMedium();
      showToast("⚡", t("toast_sug_updated",{count}));
    };
    exerciseList.appendChild(applyAllWrap);
  }

  for(const item of state.draft.items){
    const box = document.createElement("div");
    box.className = "exercise";

    const s0 = item.sets?.[0] || {};
    const hasSug = (s0.sugKg && String(s0.sugKg).trim() !== "" && s0.sugNote);
    const lastNum = Number(String(s0.lastKg || "").replace(",", "."));
    const sugNum  = Number(String(s0.sugKg  || "").replace(",", "."));

    let sugStyle = "border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.04);";
    if(Number.isFinite(lastNum) && Number.isFinite(sugNum)){
      if(sugNum > lastNum) sugStyle = "border:1px solid rgba(46,204,113,.55); background:rgba(46,204,113,.10);";
      else if(sugNum < lastNum) sugStyle = "border:1px solid rgba(255,77,93,.55); background:rgba(255,77,93,.10);";
    }

    // calcola set completati di questo esercizio
    const exDone  = item.sets.filter(s=>s.done).length;
    const exTotal = item.sets.length;
    const exPct   = exTotal ? Math.round((exDone/exTotal)*100) : 0;
    const exDoneStyle = exDone === exTotal && exTotal > 0
      ? "border-color:rgba(46,204,113,.5);"
      : "";

    box.innerHTML = `
      <div class="exerciseTop" style="${exDoneStyle}">
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="exerciseName">${esc(item.exName)}</div>
            ${exDone===exTotal && exTotal>0 ? `<span style="color:#2ecc71; font-size:16px;">✓</span>` : `<span class="badge" style="padding:3px 8px;">${exDone}/${exTotal}</span>`}
          </div>

          ${hasSug ? `
            <div style="margin-top:6px; padding:8px 10px; border-radius:14px; display:flex; align-items:center; justify-content:space-between; gap:10px; ${sugStyle}">
              <div>
                <div class="tiny" style="font-weight:900;">
                  ${t("next_time")} <b>${esc(s0.sugKg)}kg</b> • ${esc(s0.sugNote)}
                </div>
                <div class="tiny muted" style="margin-top:3px;">
                  ${t("last")} ${esc(s0.lastKg||"—")}kg × ${esc(s0.lastReps||"—")} ${t("reps_lbl")}
                </div>
              </div>
              <button type="button" class="btn small primary sugApplyBtn" style="height:34px; white-space:nowrap;">${t("sug_apply")}</button>
            </div>
          ` : `<div class="badge" style="margin-top:4px;">${item.sets.length} set</div>`}
        </div>

        <div class="exerciseActions">
          <button class="iconTiny" title="Rinomina">✏️</button>
          <button class="iconTiny" title="Cambia set">🔢</button>
          <button class="iconTiny danger" title="Elimina">🗑️</button>
        </div>
      </div>
    `;

    if(hasSug){
      const b = box.querySelector(".sugApplyBtn");
      b && (b.onclick = ()=>{
        for(const s of item.sets){
          if(!s.sugKg) continue;
          const cur  = String(s.kg   || "").trim();
          const last = String(s.lastKg|| "").trim();
          if(cur === "" || cur === last) s.kg = String(s.sugKg);
        }
        save(); renderAll(); hapticLight();
        showToast("✅", t("toast_kg_applied",{name:item.exName}));
      });
    }

    const [btnRename, btnSets, btnDel] = box.querySelectorAll("button.iconTiny");

    btnRename.onclick = ()=>{
      const dayId = state.draft.dayId;
      const day = getDay(dayId);
      const newName = (prompt(t("prompt_rename_exercise"), item.exName) || "").trim();
      if(!newName || newName === item.exName) return;
      if(day && templateHasExerciseName(day, newName)){ openModal({ icon:"⚠️", title:t("modal_name_used_title"), sub:t("modal_name_used_sub") }); return; }
      renameExerciseEverywhere(dayId, item.exName, newName);
      save(); renderAll(); hapticMedium();
      showToast("✏️", t("toast_renamed"));
    };

    btnSets.onclick = ()=>{
      const dayId = state.draft.dayId;
      let n = parseInt(prompt(t("prompt_change_sets"), String(item.sets.length)) || "", 10);
      if(!Number.isFinite(n)) return;
      n = Math.max(1, Math.min(10, n));
      setCountEverywhere(dayId, item.exName, n);
      save(); renderAll(); hapticMedium();
      showToast("🔢", t("toast_sets_changed",{n}));
    };

    btnDel.onclick = ()=>{
      const dayId = state.draft.dayId;
      if(!confirm(t("confirm_delete_exercise",{name:item.exName}))) return;
      deleteExerciseEverywhere(dayId, item.exName);
      save(); renderAll(); hapticMedium();
      showToast("🗑️", t("toast_deleted"));
    };

    item.sets.forEach((s, idx)=>{
      const row = document.createElement("div");
      row.className = "setRow" + (s.done ? " justDone" : "");
      row.innerHTML = `
        <div class="setLabel">#${idx+1}</div>
        <input class="inp targetInp" type="text" value="${esc(s.target || "")}" placeholder="6-8">
        <input class="inp kgInp" type="number" step="0.25" inputmode="decimal" placeholder="Kg" value="${esc(s.kg || "")}">
        <input class="inp reps" type="number" step="1" inputmode="numeric" placeholder="Reps" value="${esc(s.reps || "")}">
        <input class="chk done" type="checkbox" ${s.done ? "checked":""}>
      `;
      row.querySelector("input.targetInp").addEventListener("input", (e)=>{ s.target = e.target.value; save(); });
      row.querySelector("input.kgInp").addEventListener("input",    (e)=>{ s.kg    = e.target.value; save(); });
      row.querySelector("input.reps").addEventListener("input",     (e)=>{ s.reps  = e.target.value; save(); });
      row.querySelector("input.done").addEventListener("change", (e)=>{
        s.done = e.target.checked;
        save();
        renderDraftHeader();
        updateProgressBar();
        hapticLight();
        // flash verde sulla riga
        if(s.done){
          row.classList.add("justDone");
          // auto-scroll al prossimo set non completato
          setTimeout(()=>{
            const allRows = exerciseList.querySelectorAll(".setRow");
            for(const r of allRows){
              const chk = r.querySelector("input.done");
              if(chk && !chk.checked){
                r.scrollIntoView({ behavior:"smooth", block:"center" });
                break;
              }
            }
          }, 150);
        } else {
          row.classList.remove("justDone");
        }
      });
      box.appendChild(row);
    });

    // commento
    const cRow = document.createElement("div");
    cRow.className = "setRow";
    cRow.style.marginTop = "10px";
    cRow.innerHTML = `
      <div class="setLabel">💬</div>
      <input class="inp commentInp" type="text" placeholder="${t("comment_placeholder")}" value="${esc(item.comment || "")}" style="grid-column: 2 / 6;">
    `;
    const cInp = cRow.querySelector("input.commentInp");
    cInp && cInp.addEventListener("input", (e)=>{ item.comment = e.target.value || ""; save(); });
    box.appendChild(cRow);

    exerciseList.appendChild(box);
  }
}

function renderWorkout(){
  renderDraftHeader();
  updateProgressBar();
  if(!state.draft){
    document.body.classList.remove("workout-active");
    return renderPlanEditor();
  }
  document.body.classList.add("workout-active");
  renderWorkoutDraft();
}

/* Actions workout */
btnStart && (btnStart.onclick = ()=>{
  if(state.draft){ if(workMsg) workMsg.textContent = t("modal_draft_block_sub"); hapticLight(); return; }
  state.draft = makeDraft(state.currentDayId);
  state.draft.startedAt = Date.now();
  save(); renderAll(); hapticMedium();
  try{ startWorkoutTimer(); }catch{}
  track("workout_start", { day_id: state.currentDayId });
});

btnDiscard && (btnDiscard.onclick = ()=>{
  if(!state.draft){ if(workMsg) workMsg.textContent = t("modal_draft_block_sub"); hapticLight(); return; }
  if(!confirm(t("confirm_discard_draft"))) return;
  state.draft = null;
  stopWorkoutTimer();
  save(); renderAll(); hapticMedium();
});

btnSaveWorkout && (btnSaveWorkout.onclick = ()=>{
  if(!state.draft){ if(workMsg) workMsg.textContent = t("modal_draft_block_sub"); hapticLight(); return; }
  const {done, total} = countDone(state.draft);
  if(done===0 && !confirm(t("confirm_no_sets"))) return;
  if(typeof window.isConfirmSaveEnabled === "function" && window.isConfirmSaveEnabled()){
    if(!confirm(t("confirm_save_workout"))) return;
  }
  if(state.draft.startedAt){
    state.draft.durationSec = Math.floor((Date.now() - state.draft.startedAt) / 1000);
  }
  state.sessions.unshift(structuredClone(state.draft));
  state.draft = null;
  stopWorkoutTimer();
  save(); renderAll(); hapticMedium();

  try{
    const lastSession = state.sessions[0];
    if(lastSession){
      track("workout_saved", {
        day_id: lastSession.dayId || "unknown",
        exercises_count: lastSession.items.length,
        sets_total:  lastSession.items.reduce((a,i)=>a+(i.sets?.length||0),0),
        sets_done:   lastSession.items.reduce((a,i)=>a+(i.sets?.filter(s=>s.done).length||0),0)
      });
      lastSession.items.forEach(it=>{ track("exercise_used", { exercise_name: it.exName||"unknown" }); });
    }
  }catch{}

  openModal({ icon:"✅", title:t("modal_saved_title"), sub:t("modal_saved_sub",{done,total}) });
});
