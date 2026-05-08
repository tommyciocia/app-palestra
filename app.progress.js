(function(){
  const vProgress = document.getElementById("view-progress");
  const pWeight = document.getElementById("pWeight");
  const pHeight = document.getElementById("pHeight");
  const btnSave = document.getElementById("btnSaveProgressProfile");
  const summary = document.getElementById("progressSummary");
  const groupsWrap = document.getElementById("progressGroups");

  const GROUPS = [
    { key:"petto", label:"Petto", rx:[/panca|chest|croci|spinte|stampa toracica/i] },
    { key:"schiena", label:"Schiena", rx:[/rematore|lat|pulldown|pulley|row|carrucola|face pull/i] },
    { key:"gambe", label:"Gambe", rx:[/squat|pressa|leg|rdl|iperestensione|quad/i] },
    { key:"spalle", label:"Spalle", rx:[/alzate|lento|shoulder|spalle/i] },
    { key:"braccia", label:"Braccia", rx:[/curl|push down|tricip|bicip|corda/i] },
    { key:"core", label:"Core", rx:[/addomin|plank|crunch/i] }
  ];

  const MINERALS = ["Bronzo","Argento","Oro","Platino","Diamante"];
  const SUB_LEVELS = ["I","II","III"];

  function toNum(v){
    const n = Number(String(v || "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function normalizeScore(raw, sampleCount, totalSessions, totalSets, weightKg, heightCm){
    if(!Number.isFinite(raw) || raw <= 0) return 0;
    // Curva bilanciata: forza + costanza + volume complessivo.
    const strength = ((Math.log10(raw + 1) - 1.7) / 1.5) * 100;
    const clampedStrength = Math.max(0, Math.min(100, strength));
    const consistencyFactor = 0.6 + 0.4 * Math.min(1, (sampleCount || 0) / 45);
    const activityBonus = Math.min(22, Math.log10((totalSets || 0) + 1) * 10);
    const sessionBonus = Math.min(12, Math.log10((totalSessions || 0) + 1) * 8);
    const relativeFactor = Number.isFinite(weightKg) && weightKg > 0
      ? Math.max(0.75, Math.min(1.25, 75 / weightKg))
      : 1;
    const bmi = (Number.isFinite(weightKg) && Number.isFinite(heightCm) && heightCm > 0)
      ? (weightKg / Math.pow(heightCm / 100, 2))
      : NaN;
    const bmiFactor = Number.isFinite(bmi)
      ? (bmi < 18.5 ? 0.94 : (bmi > 30 ? 0.92 : 1))
      : 1;
    const score = clampedStrength * consistencyFactor * relativeFactor * bmiFactor + activityBonus + sessionBonus;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function levelFromScore(score){
    const safe = Math.max(0, Math.min(100, score));
    const idx = Math.min(14, Math.floor(safe / (100/15)));
    const mineral = MINERALS[Math.floor(idx / 3)] || MINERALS[0];
    const sub = SUB_LEVELS[idx % 3] || SUB_LEVELS[0];
    return `${mineral} ${sub}`;
  }

  function levelColor(levelText){
    const s = String(levelText || "").toLowerCase();
    if(s.startsWith("bronzo")) return "#d9a77a";
    if(s.startsWith("argento")) return "#d7dde7";
    if(s.startsWith("oro")) return "#ffe08a";
    if(s.startsWith("platino")) return "#b9f2ff";
    if(s.startsWith("diamante")) return "#9ecbff";
    return "#e6edf7";
  }

  function detectGroup(exName){
    const n = String(exName || "");
    for(const g of GROUPS){
      if(g.rx.some(r => r.test(n))) return g.key;
    }
    return "core";
  }

  function ensureProfile(){
    if(!state.progressProfile || typeof state.progressProfile !== "object"){
      state.progressProfile = { weightKg:"", heightCm:"" };
    }
    return state.progressProfile;
  }


  function render(){
    if(!vProgress || !summary || !groupsWrap) return;
    const profile = ensureProfile();
    if(pWeight) pWeight.value = profile.weightKg || "";
    if(pHeight) pHeight.value = profile.heightCm || "";

    const groupRaw = {};
    for(const g of GROUPS) groupRaw[g.key] = [];

    const sessions = Array.isArray(state.sessions) ? state.sessions : [];
    for(const sess of sessions){
      for(const item of (sess.items || [])){
        const gk = detectGroup(item.exName);
        for(const set of (item.sets || [])){
          const kg = toNum(set.kg);
          const reps = toNum(set.reps);
          if(Number.isFinite(kg) && Number.isFinite(reps) && kg > 0 && reps > 0){
            groupRaw[gk].push(kg * reps);
          }
        }
      }
    }

    const totalSessions = sessions.length;
    const totalSets = Object.values(groupRaw).reduce((acc, arr) => acc + arr.length, 0);
    const weightKg = toNum(profile.weightKg);
    const heightCm = toNum(profile.heightCm);

    const scores = GROUPS.map(g => {
      const arr = groupRaw[g.key];
      const avg = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
      const score = normalizeScore(avg, arr.length, totalSessions, totalSets, weightKg, heightCm);
      return { ...g, avg, score, level: levelFromScore(score) };
    });

    const general = scores.length ? Math.round(scores.reduce((a,b)=>a+b.score,0)/scores.length) : 0;
    const gLevel = levelFromScore(general);

    const w = weightKg;
    const h = heightCm;
    const bmi = (Number.isFinite(w) && Number.isFinite(h) && h > 0)
      ? (w / Math.pow(h / 100, 2))
      : NaN;

    const bmiTxt = Number.isFinite(bmi) ? ` | BMI: ${bmi.toFixed(1)}` : "";
    summary.textContent = `Media generale: ${general}/100 (${gLevel})${bmiTxt}`;

    groupsWrap.innerHTML = "";
    for(const s of scores){
      const box = document.createElement("div");
      box.className = "card";
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
          <div style="font-weight:900;">${s.label}</div>
          <div class="badge" style="color:${levelColor(s.level)};">${s.level}</div>
        </div>
        <div class="tiny muted" style="margin-top:6px;">Punteggio: ${s.score}/100</div>
        <div class="workoutProgressBar" style="margin-top:8px;">
          <div class="workoutProgressFill" style="width:${s.score}%;"></div>
        </div>
      `;
      groupsWrap.appendChild(box);
    }
  }

  function saveProfile(){
    const profile = ensureProfile();
    profile.weightKg = (pWeight?.value || "").trim();
    profile.heightCm = (pHeight?.value || "").trim();
    save();
    render();
    try{ if(typeof hapticMedium === "function") hapticMedium(); }catch{}
  }

  if(btnSave) btnSave.addEventListener("click", saveProfile);
  if(pWeight) pWeight.addEventListener("change", saveProfile);
  if(pHeight) pHeight.addEventListener("change", saveProfile);
  window.renderProgress = render;
})();
