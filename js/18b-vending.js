"use strict";
/* REST AREA · 18b-vending.js
   the vending machines, worked the way they are: pick a slot, feed it,
   and shake it when the thing you paid for hangs on the spiral
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18b · VENDING
   E at a machine brings up its keypad. The arrows (or W A S D) move
   along the rows of slots; Q drops in a quarter and F feeds it a dollar
   bill (which it may spit back out); Enter or E presses the button. The
   coil turns, and either the thing drops into the flap or it hangs there
   on the end of the spiral, and then Space shakes the machine until it
   falls. R is the coin return, Esc walks away. Whatever credit is left in
   a machine stays in it for the next person, the way it does. In a power
   cut the machines are dark until the generator picks the building up.
   ---------------------------------------------------------------------- */
const VEND_ITEMS={
  soda:{title:"COLD DRINKS", cols:4, stick:0.14, items:[
    ["WATER",1.50],["COLA",1.75],["DIET COLA",1.75],["LEMON-LIME",1.75],
    ["ROOT BEER",1.75],["ORANGE SODA",1.75],["ICED TEA",2.00],["LEMONADE",2.00],
    ["GINGER ALE",1.75],["BIRCH BEER",1.75],["SPORTS DRINK",2.25],["ENERGY DRINK",2.75],
    ["SELTZER",1.50],["CREAM SODA",1.75],["COLD BREW",2.75],["GRAPE SODA",1.75]]},
  // the island's (13b): hot drinks, out of cups, and a refrigerated case of sandwiches on coils
  coffee:{title:"HOT DRINKS", cols:4, stick:0.25, hot:true, items:[
    ["COFFEE",1.25],["COFFEE · CREAM",1.25],["COFFEE · SUGAR",1.25],["CREAM & SUGAR",1.25],
    ["DECAF",1.25],["FRENCH VANILLA",1.50],["CAPPUCCINO",1.75],["HOT CHOCOLATE",1.25]]},
  sandwich:{title:"FRESH FOOD", cols:4, stick:0.18, items:[
    ["HAM & SWISS",4.25],["TURKEY CLUB",4.75],["EGG SALAD",3.75],["TUNA SALAD",3.75],
    ["ITALIAN HOAGIE",5.25],["CHICKEN SALAD",4.25],["PB & J",2.75],["CHEF SALAD",5.00],
    ["YOGURT PARFAIT",3.25],["FRUIT CUP",3.00],["BEAN BURRITO",3.50],["CHEESE DANISH",2.50]]},
  snack:{title:"SNACKS", cols:5, stick:0.32, items:[
    ["PRETZELS",1.50],["POTATO CHIPS",1.50],["BBQ CHIPS",1.50],["CHEESE CURLS",1.50],["CORN CHIPS",1.50],
    ["PB CRACKERS",1.25],["CHEESE CRACKERS",1.25],["TRAIL MIX",2.00],["PEANUTS",1.25],["SUNFLOWER SEEDS",1.50],
    ["CANDY BAR",1.75],["PB CUPS",1.75],["CHOCOLATE BAR",1.75],["CARAMEL BAR",1.75],["MINTS",1.25],
    ["GRANOLA BAR",1.50],["BEEF JERKY",3.25],["SNACK CAKES",1.50],["COOKIES",1.75],["TOASTER PASTRY",1.75],
    ["GUM",1.00],["LICORICE",1.75],["FRUIT SNACKS",1.25],["POPCORN",1.50],["WHOOPIE PIE",2.25]]},
};
const VEND={open:false, m:null, machines:{}, shake:0, got:[]};
const _vendEl=(function(){
  const d=document.createElement("div"); d.id="vend";
  d.innerHTML='<div class="hd"><span class="t"></span><span class="led"></span></div><div class="grid"></div>'+
    '<div class="msg"></div><div class="keys"><b>↑↓←→</b> pick · <b>Q</b> quarter · <b>F</b> dollar bill · <b>E</b> vend · '+
    '<b>Space</b> shake · <b>R</b> coin return · <b>Esc</b> leave</div>';
  document.body.appendChild(d); return d;
})();
function _vm(id, kind){
  if(!VEND.machines[id]){
    const L=VEND_ITEMS[kind].items, out=new Set();
    // one or two slots are always empty
    const r=_trng(id.length*97+(kind==="snack"?13:7));
    out.add((r()*L.length)|0); if(r()<0.6) out.add((r()*L.length)|0);
    VEND.machines[id]={id:id, kind:kind, credit:0, sel:0, state:"idle", out:out, shakes:0, item:null, t:0};
  }
  return VEND.machines[id];
}
const _money=v=>"$"+v.toFixed(2);
function _vendDraw(){
  const M=VEND.m, D=VEND_ITEMS[M.kind], el=_vendEl, dark=GRID.bldg<0.5;
  el.querySelector(".t").textContent=D.title;
  el.classList.toggle("dark", dark);
  const it=D.items[M.sel], code=String.fromCharCode(65+Math.floor(M.sel/D.cols))+((M.sel%D.cols)+1);
  el.querySelector(".led").textContent = dark ? "" : (M.state==="vending" ? "VENDING..." :
      "CREDIT "+_money(M.credit)+"   "+code+" "+(M.out.has(M.sel)?"SOLD OUT":_money(it[1]))+(D.hot && M.state==="idle" && (Date.now()/1500|0)%2 ? "   · OUT OF CUPS" : ""));
  let h="";
  D.items.forEach((q,i)=>{
    const c=String.fromCharCode(65+Math.floor(i/D.cols))+((i%D.cols)+1);
    h+='<div class="cell'+(i===M.sel?' on':'')+(M.out.has(i)?' out':'')+'"><span class="c">'+c+'</span><span class="n">'+q[0]+
       '</span><span class="p">'+(M.out.has(i)?"—":_money(q[1]))+'</span></div>';
  });
  const g=el.querySelector(".grid"); g.style.gridTemplateColumns="repeat("+D.cols+",1fr)"; g.innerHTML=h;
}
function _vendSay(s){ _vendEl.querySelector(".msg").textContent=s; }
VEND.openAt=function(id, kind){
  if(VEND.open) return;
  VEND.m=_vm(id, kind); VEND.open=true;
  for(const k in keys) keys[k]=false;                      // stop walking
  _vendEl.classList.add("show");
  _vendDraw();
  _vendSay(GRID.bldg<0.5 ? "THE MACHINE IS DARK. NO POWER." :
           VEND.m.state==="stuck" ? (VEND_ITEMS[kind].hot ? "THE BREWING LAMP IS STILL ON. IT NEEDS A THUMP." : "YOUR "+VEND.m.item+" IS STILL HANGING THERE. SHAKE IT.") :
           VEND_ITEMS[kind].hot && VEND.m.credit<=0 ? "A RED LAMP UNDER THE BAY: SORRY, OUT OF CUPS. SOMEBODY HAS TAPED A NOTE ON IT TOO." :
           VEND.m.credit>0 ? "SOMEBODY LEFT "+_money(VEND.m.credit)+" IN IT." : "MAKE A SELECTION.");
};
VEND.close=function(){ VEND.open=false; _vendEl.classList.remove("show"); };
function _snd(k){ if(typeof AUDIO!=="undefined") AUDIO.blip(k); }
function _vendDrop(M){
  M.state="idle"; M.shakes=0;
  _snd("clunk");
  VEND.got.push(M.item);
  toast("CLUNK — "+M.item, "#cfe0d4");
  _vendSay("IT DROPS INTO THE FLAP. YOU REACH IN FOR YOUR "+M.item+".");
  if(M.credit>0.001){ const c=M.credit; M.credit=0; setTimeout(()=>{ _snd("coins"); if(VEND.m===M && VEND.open){ _vendSay("CHANGE: "+_money(c)+" RATTLES INTO THE CUP."); _vendDraw(); } }, 500); }
  M.item=null;
}
/* the hot-drink machine's own way of going wrong: no cup drops, and it
   brews anyway; or it hangs mid-brew with the lamp on until it is thumped */
function _vendPour(M){
  M.state="idle"; M.shakes=0;
  const H=(typeof VENDHUT_RT!=="undefined") ? VENDHUT_RT : null; if(H){ H.brew=1.8; H.pour=1.8; }
  _snd("pour");
  toast("NO CUP — "+M.item+" DOWN THE DRAIN", "#ffb36a");
  _vendSay("NO CUP DROPS. YOUR "+M.item+" RUNS STRAIGHT THROUGH THE GRATE AND DOWN THE DRAIN.");
  if(M.credit>0.001){ const c=M.credit; M.credit=0; setTimeout(()=>{ _snd("coins"); if(VEND.m===M && VEND.open){ _vendSay("CHANGE: "+_money(c)+" RATTLES INTO THE CUP. THE COIN CUP, ANYWAY."); _vendDraw(); } }, 900); }
  M.item=null;
}
VEND.key=function(e){
  const M=VEND.m, D=VEND_ITEMS[M.kind], n=D.items.length, c=e.code;
  if(c==="Escape" || c==="Tab" || c==="Backspace"){ VEND.close(); return; }
  if(GRID.bldg<0.5){ if(c==="Space"){ VEND.shake=0.6; _snd("thump"); _vendSay("YOU THUMP IT. IT STAYS DARK."); } return; }
  if(M.state==="vending") return;
  if(c==="ArrowRight"||c==="KeyD") M.sel=(M.sel+1)%n;
  else if(c==="ArrowLeft"||c==="KeyA") M.sel=(M.sel+n-1)%n;
  else if(c==="ArrowDown"||c==="KeyS") M.sel=(M.sel+D.cols)%n;
  else if(c==="ArrowUp"||c==="KeyW") M.sel=(M.sel+n-D.cols)%n;
  else if(c==="KeyQ"){ M.credit+=0.25; _snd("coin"); _vendSay("A QUARTER. "+_money(M.credit)+" IN."); }
  else if(c==="KeyF"){
    if(Math.random()<0.22){ _snd("bill"); _vendSay("IT TAKES THE BILL... AND PUSHES IT BACK OUT. SMOOTH IT ON YOUR LEG AND TRY AGAIN."); }
    else { _snd("bill"); M.credit+=1; _vendSay("THE BILL GOES IN. "+_money(M.credit)+" IN."); }
  }
  else if(c==="KeyR"){ if(M.credit>0){ _snd("coins"); _vendSay("COIN RETURN: "+_money(M.credit)+"."); M.credit=0; } else _vendSay("NOTHING COMES OUT."); }
  else if(c==="Space"){
    VEND.shake=1; _snd("thump"); M.shakes++;
    if(M.state==="stuck"){
      const fin=D.hot?_vendPour:_vendDrop;
      if(Math.random()<0.22+0.16*M.shakes || M.shakes>=6){ setTimeout(()=>{ if(M.state==="stuck") { fin(M); _vendDraw(); } }, 260); _vendSay(D.hot?"SOMETHING INSIDE GURGLES...":"ONE MORE SHOVE..."); }
      else _vendSay(D.hot ? ["A CLICK. THE LAMP STAYS ON.","IT HUMS AT YOU.","THE NOTE ON THE FRONT FLAPS.","HARDER..."][Math.min(3,M.shakes-1)]
                          : ["IT SWINGS. IT HOLDS.","THE WHOLE MACHINE ROCKS. IT'S STILL UP THERE.","A STICKER ON THE SIDE SAYS MACHINE MAY TIP OVER.","HARDER..."][Math.min(3,M.shakes-1)]);
    } else _vendSay("YOU ROCK THE MACHINE. NOTHING FALLS. SOMEONE LOOKS OVER.");
  }
  else if(c==="Enter"||c==="KeyE"||c==="NumpadEnter"){
    const it=D.items[M.sel];
    if(M.state==="stuck"){ _vendSay(D.hot ? "IT IS STILL BREWING, OR SAYS IT IS. THUMP IT (SPACE)." : "THE "+M.item+" IS STILL HANGING. SHAKE THE MACHINE (SPACE)."); }
    else if(M.out.has(M.sel)) _vendSay("SOLD OUT. MAKE ANOTHER SELECTION.");
    else if(M.credit+1e-6<it[1]) _vendSay("INSERT "+_money(it[1]-M.credit)+" MORE.");
    else {
      M.credit-=it[1]; M.state="vending"; M.item=it[0]; M.shakes=0; _snd("whirr");
      if(D.hot){ const H=(typeof VENDHUT_RT!=="undefined") ? VENDHUT_RT : null;
        if(H) H.brew=4.0; _vendSay("NO CUP DROPS. THE BREWING LAMP COMES ON ANYWAY...");
        setTimeout(()=>_snd("gurgle"), 500);
        setTimeout(()=>{
          if(Math.random()<D.stick){ M.state="stuck"; if(H) H.brew=1e9;
            if(VEND.m===M && VEND.open) _vendSay("...AND STAYS ON. SOMETHING IN THERE CLICKS, AND STOPS. GIVE IT A THUMP (SPACE).");
            toast("IT'S HUNG UP", "#ffb36a"); }
          else _vendPour(M);
          if(VEND.open) _vendDraw(); }, 3400);
        _vendDraw(); return; }
      _vendSay("THE COIL TURNS...");
      setTimeout(()=>{
        if(Math.random()<D.stick){ M.state="stuck"; _snd("tick");
          if(VEND.m===M && VEND.open){ _vendSay("...AND STOPS. YOUR "+M.item+" IS HANGING OFF THE END OF THE SPIRAL. SHAKE IT (SPACE)."); }
          toast("IT'S STUCK", "#ffb36a");
        } else _vendDrop(M);
        if(VEND.open) _vendDraw();
      }, 1300);
    }
  }
  else return;
  _vendDraw();
};
// keep the LED line honest while the panel is up (credit, the power)
function updateVending(dt){
  if(VEND.shake>0) VEND.shake=Math.max(0, VEND.shake-dt*2.6);
  if(VEND.open){
    VEND._t=(VEND._t||0)+dt;
    if(VEND._t>0.25){ VEND._t=0; _vendDraw(); }
    // walked off (a door, a car) somehow: put it away
    if(driving || droneMode) VEND.close();
  }
}
