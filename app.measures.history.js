// Toggle storico misure (apri/chiudi)
(function(){
  const btn = document.getElementById("btnMeasuresHistoryToggle");
  const wrap = document.getElementById("measuresListWrap");

  if(!btn || !wrap) return;

  btn.addEventListener("click", ()=>{
    const isNowHidden = wrap.classList.toggle("hidden");

    // quando apro: aggiorno la lista
    if(!isNowHidden){
      try{
        if(typeof renderMeasures === "function") renderMeasures();
      }catch{}
    }

    try{
      if(typeof hapticLight === "function") hapticLight();
    }catch{}
  });
})();
