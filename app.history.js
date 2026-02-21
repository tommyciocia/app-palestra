const histSearch = document.getElementById("histSearch");
const histDay = document.getElementById("histDay");
const historyList = document.getElementById("historyList");
const btnClearHistory = document.getElementById("btnClearHistory");

const chartsWrap = document.getElementById("chartsWrap");
const repChart = document.getElementById("repChart");
const kgChart = document.getElementById("kgChart");
const repChartTitle = document.getElementById("repChartTitle");
const kgChartTitle = document.getElementById("kgChartTitle");
const repChartNote = document.getElementById("repChartNote");
const kgChartNote = document.getElementById("kgChartNote");

// ✅ AGGIUNTA: bottone PR
const btnShowPR = document.getElementById("btnShowPR");
let lastPRInfo = null;

/* ✅ compat: roundRect su Safari vecchi */
(function(){
  try{
    const p = CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if(p && !p.roundRect){
      p.roundRect = function(x,y,w,h,r){
        r = Math.max(0, Math.min(r, Math.min(w,h)/2));
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y, x+w, y+h, r);
        this.arcTo(x+w, y+h, x, y+h, r);
        this.arcTo(x, y+h, x, y, r);
        this.arcTo(x, y, x+w, y, r);
        this.closePath();
        return this;
      };
    }
  }catch{}
})();
function formatTimeMMSS(totalSec){
  totalSec = Number(totalSec) || 0;
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function renderHistoryFilters(){
  if(!histDay) return;
  histDay.innerHTML = `<option value="all">Tutti</option>`;
  for(const d of state.template.days){
    const opt = document.createElement("option");
    opt.value = d.id;
    opt.textContent = d.name;
    histDay.appendChild(opt);
  }
}

function summarize(sess){
  let done=0,total=0;
  for(const it of sess.items){
    total += it.sets.length;
    done += it.sets.filter(s=>s.done).length;
  }
  return {done,total};
}

function renderHistory(){
  if(!historyList) return;

  const query = (histSearch?.value||"").trim();
  const f = histDay?.value || "all";

  const list = [...state.sessions]
    .sort((a,b)=>b.date.localeCompare(a.date))
    .filter(sess=>{
      if(f!=="all" && sess.dayId!==f) return false;
      if(!query) return true;
      return sess.items.some(it => isExactExerciseMatch(it.exName, query));
    });

  historyList.innerHTML = "";
  if(list.length === 0){
    historyList.innerHTML = `<div class="card"><div class="muted">Nessun allenamento trovato.</div></div>`;
    return;
  }

  // ✅ raggruppa per mese (YYYY-MM)
  const groups = {};
  for(const sess of list){
    const key = (sess.date || "").slice(0,7); // "2026-02"
    if(!key) continue;
    (groups[key] ||= []).push(sess);
  }

  // ✅ ordina mesi dal più recente
  const monthKeys = Object.keys(groups).sort((a,b)=>b.localeCompare(a));

  for(const monthKey of monthKeys){
    const mm = monthKey.slice(5,7);
    const yyyy = monthKey.slice(0,4);
    const monthLabel = `${mm}/${yyyy}`;

    // ✅ wrapper mese
    const wrap = document.createElement("div");
    wrap.className = "card";
    wrap.style.padding = "10px 12px";
    wrap.style.marginBottom = "12px";

    // ✅ header cliccabile (parte chiuso)
    const header = document.createElement("button");
    header.type = "button";
    header.className = "btn ghost w100";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.gap = "10px";
    header.style.height = "52px";

    const left = document.createElement("div");
    left.style.fontWeight = "900";
    left.style.textAlign = "left";
    left.textContent = `📅 ${monthLabel}`;

    const right = document.createElement("div");
    right.style.opacity = "0.75";
    right.style.fontWeight = "900";
    right.textContent = "▸"; // chiuso

    header.appendChild(left);
    header.appendChild(right);

    // ✅ contenitore sessioni del mese (chiuso di default)
    const body = document.createElement("div");
    body.className = "hidden";
    body.style.marginTop = "10px";
    body.style.display = "flex";
    body.style.flexDirection = "column";
    body.style.gap = "10px";

    header.onclick = ()=>{
      const isHidden = body.classList.contains("hidden");
      if(isHidden){
        body.classList.remove("hidden");
        right.textContent = "▾";
      }else{
        body.classList.add("hidden");
        right.textContent = "▸";
      }
    };

    // ✅ crea le card allenamento dentro il body
    for(const sess of groups[monthKey]){
      const dayName = getDay(sess.dayId)?.name || sess.dayId;
      const {done,total} = summarize(sess);
      const exLine = sess.items.map(it=>it.exName).join(" • ");
      const dur = sess.durationSec ? ` • ⏱ ${formatTimeMMSS(sess.durationSec)}` : "";


      const box = document.createElement("div");
      box.className = "historyItem";
      box.innerHTML = `
        <div class="historyTop">
          <div>
            <div class="historyTitle">${fmtDate(sess.date)} • ${esc(dayName)}${dur}</div>
            <div class="historyMeta">Set completati: ${done}/${total}</div>
            <div class="historyMeta">${esc(exLine)}</div>
          </div>
          <button class="btn ghost danger" style="padding:10px 12px;">Elimina</button>
        </div>

        <details style="margin-top:10px;">
         <summary style="cursor:pointer; font-weight:900;">Dettagli</summary>
          <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;"></div>
        </details>
      `;

      box.querySelector("button").onclick = ()=>{
        if(!confirm(`Eliminare allenamento del ${fmtDate(sess.date)}?`)) return;
        state.sessions = state.sessions.filter(s => s !== sess);
        save();
        renderAll();
        hapticMedium();
      };

      const inner = box.querySelector("details > div");
      sess.items.forEach(it=>{
        const lines = it.sets.map((s,i)=>{
          const kg = (s.kg && String(s.kg).trim() !== "") ? `${s.kg}kg` : "—kg";
          const reps = (s.reps && String(s.reps).trim() !== "") ? s.reps : "—";
          const tgt = s.target || "—";
          return `Set ${i+1} (${tgt}) • ${kg} • ${reps} reps ${s.done ? "✅":"⬜️"}`;
        }).join("<br>");

        const d = document.createElement("div");
        d.className = "exercise";
        d.innerHTML =
          `<div class="exerciseName">${esc(it.exName)}</div><div class="historyMeta" style="margin-top:8px;">${lines}</div>` +
          (it.comment ? `<div class="historyMeta" style="margin-top:6px;">💬 ${esc(it.comment)}</div>` : ``);
        inner.appendChild(d);
      });

      body.appendChild(box);
    }

    wrap.appendChild(header);
    wrap.appendChild(body);
    historyList.appendChild(wrap);
  }
}


/* =========================
   CHARTS (fixati bene + PR)
========================= */
function toNum(x){
  if(x === null || x === undefined) return NaN;
  const s = String(x).replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function estimate1RM_Epley(kg, reps){
  kg = toNum(kg);
  reps = toNum(reps);
  if(!Number.isFinite(kg) || kg <= 0) return NaN;
  if(!Number.isFinite(reps) || reps <= 0) return NaN;
  return kg * (1 + (reps / 30));
}

function pickBestSet(sets){
  let best = null;
  for(const s of sets){
    const kg = toNum(s.kg);
    const reps = toNum(s.reps);
    const scoreKg = Number.isFinite(kg) ? kg : -1;
    const scoreReps = Number.isFinite(reps) ? reps : -1;

    if(!best){ best = {kg, reps, scoreKg, scoreReps}; continue; }
    if(scoreKg > best.scoreKg) best = {kg, reps, scoreKg, scoreReps};
    else if(scoreKg === best.scoreKg && scoreReps > best.scoreReps) best = {kg, reps, scoreKg, scoreReps};
  }
  return best;
}

function getSeriesForExercise(exNameQuery){
  const q = (exNameQuery||"").trim();
  if(!q) return {title:"", labels:[], reps:[], kgs:[], pr1rm:[]};

  const ordered = [...state.sessions].sort((a,b)=>a.date.localeCompare(b.date));
  const labels = [];
  const reps = [];
  const kgs = [];
  const pr1rm = [];

  for(const sess of ordered){
    const it = sess.items.find(x => isExactExerciseMatch(x.exName, q));
    if(!it) continue;

    const best = pickBestSet(it.sets || []);
    if(!best) continue;

    labels.push(fmtDate(sess.date));
    reps.push(best.reps);
    kgs.push(best.kg);
    pr1rm.push(estimate1RM_Epley(best.kg, best.reps));
  }
  return { title:q, labels, reps, kgs, pr1rm };
}

function setupCanvas(canvas){
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const cssW = canvas.clientWidth || 1;
  const cssH = canvas.height || 110;

  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));

  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,cssW,cssH);

  return {ctx, w: cssW, h: cssH, dpr};
}

function niceTicks(minV, maxV, steps){
  const span = maxV - minV;
  if(span <= 0 || !Number.isFinite(span)) return {min:minV, max:maxV, step:1, ticks:[minV, maxV]};

  const rawStep = span / steps;
  const pow = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const n = rawStep / pow;

  let step;
  if(n <= 1) step = 1 * pow;
  else if(n <= 2) step = 2 * pow;
  else if(n <= 5) step = 5 * pow;
  else step = 10 * pow;

  const niceMin = Math.floor(minV / step) * step;
  const niceMax = Math.ceil(maxV / step) * step;

  const ticks = [];
  for(let v = niceMin; v <= niceMax + step*0.5; v += step){
    ticks.push(v);
  }
  return {min:niceMin, max:niceMax, step, ticks};
}

function drawLineChart(canvas, labels, values, yLabel){
  const {ctx, w, h, dpr} = setupCanvas(canvas);

  const padL = 34, padR = 10, padT = 10, padB = 22;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const n = labels.length;
  const pts = values.map((v,i)=>({i, v})).filter(p=>Number.isFinite(p.v));
  if(pts.length < 2){
    ctx.font = "11px system-ui";
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fillText("Dati insuff.", padL, padT + 14);
    canvas._chartData = null;
    canvas._baseCanvas = null;
    return;
  }

  let minV = Math.min(...pts.map(p=>p.v));
  let maxV = Math.max(...pts.map(p=>p.v));
  if(minV === maxV){ minV -= 1; maxV += 1; }

  const pad = (maxV - minV) * 0.06;
  minV -= pad; maxV += pad;

  const tickInfo = niceTicks(minV, maxV, 5);

  const xFor = (i)=> padL + (plotW * (n===1 ? 0 : i/(n-1)));
  const yFor = (v)=> padT + (plotH * (1 - (v-tickInfo.min)/(tickInfo.max-tickInfo.min)));

  ctx.fillStyle = "rgba(0,0,0,.12)";
  ctx.fillRect(padL, padT, plotW, plotH);

  ctx.lineWidth = 1;
  ctx.font = "10px system-ui";

  for(const v of tickInfo.ticks){
    const y = yFor(v);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.60)";
    const txt = (yLabel === "reps") ? String(Math.round(v)) : v.toFixed(1);
    ctx.fillText(txt, 4, y + 4);
  }

  ctx.strokeStyle = "rgba(255,255,255,.14)";
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  const linePts = [];
  for(let i=0;i<n;i++){
    const v = values[i];
    if(!Number.isFinite(v)) continue;
    linePts.push({x:xFor(i), y:yFor(v), i, v});
  }

  ctx.beginPath();
  ctx.moveTo(linePts[0].x, padT + plotH);
  for(const p of linePts){ ctx.lineTo(p.x, p.y); }
  ctx.lineTo(linePts[linePts.length-1].x, padT + plotH);
  ctx.closePath();
  ctx.fillStyle = "rgba(86,165,255,.12)";
  ctx.fill();

  ctx.strokeStyle = "rgba(86,165,255,.95)";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(linePts[0].x, linePts[0].y);
  for(const p of linePts.slice(1)){ ctx.lineTo(p.x, p.y); }
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.92)";
  for(const p of linePts){
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2);
    ctx.fill();
  }

  const last = linePts[linePts.length-1];
  ctx.strokeStyle = "rgba(255,255,255,.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI*2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.70)";
  ctx.font = "10px system-ui";
  ctx.fillText(yLabel, padL + 4, padT + 12);

  canvas._chartData = {
    labels,
    values,
    yLabel,
    padL, padT, padR, padB,
    plotW, plotH,
    xFor,
    yFor,
    linePts,
    tickInfo,
    dpr
  };

  // ✅ CACHE base (linea immobile): salva una copia dell’immagine base
  try{
    const base = canvas._baseCanvas || document.createElement("canvas");
    base.width = canvas.width;
    base.height = canvas.height;
    const bctx = base.getContext("2d");
    bctx.setTransform(1,0,0,1,0,0);
    bctx.clearRect(0,0,base.width,base.height);
    bctx.drawImage(canvas, 0, 0);
    canvas._baseCanvas = base;
  }catch{}
}

function drawTooltipOverlay(canvas, hoverIdx){
  const d = canvas._chartData;
  if(!d) return;

  const ctx = canvas.getContext("2d");
  const p = d.linePts.find(x => x.i === hoverIdx);
  if(!p) return;

  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(p.x, d.padT);
  ctx.lineTo(p.x, d.padT + d.plotH);
  ctx.stroke();

  const valTxt = (d.yLabel === "reps") ? `${Math.round(p.v)} reps` : `${p.v.toFixed(1)} kg`;
  const dateTxt = d.labels[p.i] || "";

  ctx.font = "11px system-ui";
  const w1 = ctx.measureText(valTxt).width;
  const w2 = ctx.measureText(dateTxt).width;
  const boxW = Math.max(w1, w2) + 16;
  const boxH = 34;

  let bx = p.x + 10;
  if(bx + boxW > d.padL + d.plotW) bx = p.x - boxW - 10;
  let by = p.y - boxH - 10;
  if(by < d.padT) by = p.y + 10;

  ctx.fillStyle = "rgba(0,0,0,.70)";
  ctx.strokeStyle = "rgba(255,255,255,.16)";
  ctx.lineWidth = 1;
  ctx.roundRect(bx, by, boxW, boxH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fillText(valTxt, bx + 8, by + 14);
  ctx.fillStyle = "rgba(255,255,255,.70)";
  ctx.fillText(dateTxt, bx + 8, by + 28);
}

function attachChartTooltip(canvas){
  if(!canvas || canvas._tooltipBound) return;
  canvas._tooltipBound = true;

  let raf = 0;
  let lastIdx = null;

  const getPos = (ev)=>{
    const r = canvas.getBoundingClientRect();
    let x, y;
    if(ev.touches && ev.touches[0]){
      x = ev.touches[0].clientX - r.left;
      y = ev.touches[0].clientY - r.top;
    }else{
      x = ev.clientX - r.left;
      y = ev.clientY - r.top;
    }
    return {x, y};
  };

  const restoreBase = ()=>{
    const d = canvas._chartData;
    const base = canvas._baseCanvas;
    if(!d || !base) return;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(d.dpr,0,0,d.dpr,0,0);
    lastIdx = null;
  };

  const schedule = (idx)=>{
    if(idx === lastIdx) return;
    lastIdx = idx;

    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      const d = canvas._chartData;
      if(!d) return;
      restoreBase();
      drawTooltipOverlay(canvas, idx);
    });
  };

  const onMove = (ev)=>{
    const d = canvas._chartData;
    if(!d) return;

    const {x,y} = getPos(ev);

    if(x < d.padL || x > d.padL + d.plotW || y < d.padT || y > d.padT + d.plotH){
      restoreBase();
      return;
    }

    let best = null;
    for(const p of d.linePts){
      const dx = Math.abs(p.x - x);
      if(!best || dx < best.dx) best = {dx, i: p.i};
    }
    if(best) schedule(best.i);
  };

  const onLeave = ()=>{
    if(raf) cancelAnimationFrame(raf);
    raf = 0;
    restoreBase();
  };

  canvas.addEventListener("mousemove", onMove);
  canvas.addEventListener("mouseleave", onLeave);
  canvas.addEventListener("touchstart", onMove, {passive:true});
  canvas.addEventListener("touchmove", onMove, {passive:true});
  canvas.addEventListener("touchend", onLeave);
}

function renderCharts(){
  if(!histSearch || !chartsWrap) return;

  const q = (histSearch.value||"").trim();

  // ✅ quando non c'è ricerca, nascondi anche PR
  if(btnShowPR){
    btnShowPR.classList.add("hidden");
    lastPRInfo = null;
  }

  if(!q){
    chartsWrap.classList.add("hidden");
    repChartNote && (repChartNote.textContent = "");
    kgChartNote && (kgChartNote.textContent = "");
    return;
  }

  const series = getSeriesForExercise(q);
  if(series.labels.length === 0){
    chartsWrap.classList.add("hidden");
    repChartNote && (repChartNote.textContent = "");
    kgChartNote && (kgChartNote.textContent = "");
    return;
  }

  chartsWrap.classList.remove("hidden");
  repChartTitle && (repChartTitle.textContent = `Reps • ${series.title}`);
  kgChartTitle && (kgChartTitle.textContent = `Kg • ${series.title}`);

  repChart && drawLineChart(repChart, series.labels, series.reps, "reps");
  kgChart && drawLineChart(kgChart, series.labels, series.kgs, "kg");

  repChart && attachChartTooltip(repChart);
  kgChart && attachChartTooltip(kgChart);

  const validReps = series.reps.filter(Number.isFinite);
  const validKg = series.kgs.filter(Number.isFinite);
  const validPR = series.pr1rm.filter(Number.isFinite);

  if(repChartNote){
    repChartNote.textContent = validReps.length
      ? `min ${Math.min(...validReps)} • max ${Math.max(...validReps)}`
      : "Nessun dato reps";
  }

  // ✅ sotto il grafico kg lasciamo SOLO min/max (pulito)
  if(kgChartNote){
    if(validKg.length){
      const minKg = Math.min(...validKg);
      const maxKg = Math.max(...validKg);
      kgChartNote.textContent = `min ${minKg} • max ${maxKg}`;
    }else{
      kgChartNote.textContent = "Nessun dato kg";
    }
  }

  // ✅ PR SOLO nel bottone + modal
  if(btnShowPR){
    if(validPR.length){
      const bestPR = Math.max(...validPR);
      const lastPR = validPR[validPR.length - 1];

      lastPRInfo = {
        ex: series.title,
        best: bestPR,
        last: lastPR
      };

      btnShowPR.classList.remove("hidden");
    }else{
      lastPRInfo = null;
      btnShowPR.classList.add("hidden");
    }
  }
}

/* events */
histSearch && histSearch.addEventListener("input", ()=>{ renderHistory(); renderCharts(); });
histDay && histDay.addEventListener("change", ()=>{ renderHistory(); renderCharts(); });

btnClearHistory && (btnClearHistory.onclick = ()=>{
  if(!confirm("Svuotare tutto lo storico?")) return;
  state.sessions = [];
  save();
  renderAll();
  hapticMedium();

  track("history_cleared");
  openModal({ icon:"🧹", title:"Storico svuotato", sub:"Tutti gli allenamenti sono stati rimossi." });
});

// ✅ CLICK bottone PR
btnShowPR && (btnShowPR.onclick = ()=>{
  if(!lastPRInfo) return;

  const best = lastPRInfo.best.toFixed(1);
  const last = lastPRInfo.last.toFixed(1);

const sub =
`Esercizio: ${lastPRInfo.ex}
PR stimato 1RIP: ${best} kg , 

Calcolo (formula): 1RM = kg × (1 + reps/30)`;


  if(typeof openModal === "function"){
    openModal({ icon:"🔥", title:"PR stimato", sub });
  }else{
    alert(sub);
  }
});
