"use strict";
/* REST AREA · 18d-darts.js
   darts on the board in the cellar's dug-out (12b): aim, throw, score,
   and a game of 301 against Dale
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18d · DARTS
   E at the oche takes the three darts out of the board and stands you on
   the line. You aim where you look (the dot); your hand drifts a little,
   as a hand does, and a dart goes where you meant to within a centimetre
   or two. Click (or Space) throws: the dart flies its arc, sticks where it
   lands, and is scored off the same rings the board is drawn with: single,
   treble, double, outer bull and bull. Off the board it is nothing, off
   the cork it hits the wall and drops. It is 301 against Dale: three darts
   a turn, his throws after yours, exactly to nothing to win, under it and
   the turn is bust. The panel keeps the score and the chalkboard by the
   board keeps it too. Esc (or E) puts the darts down.
   ---------------------------------------------------------------------- */
const DARTS={on:false, game:null, flying:null, stuck:[], swayT:0, sway:[0,0], last:"", panel:null, wait:0, dale:null};
(function dartsUI(){
  const st=document.createElement("style");
  st.textContent="#darts{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:14;display:none;min-width:min(520px,92vw);"+
    "background:rgba(14,18,16,0.86);border:1px solid #3a4a40;border-radius:6px;padding:10px 14px;font-family:'JetBrains Mono',monospace;color:#e8ece6;"+
    "box-shadow:0 6px 24px rgba(0,0,0,0.5)}#darts.show{display:block}#darts .hd{display:flex;justify-content:space-between;gap:12px;align-items:baseline}"+
    "#darts .t{font-family:'Oswald',sans-serif;font-size:18px;letter-spacing:.14em}#darts .sc{display:flex;gap:18px;font-size:15px}"+
    "#darts .sc b{color:#f4c430;font-weight:600}#darts .sc .you.up b{color:#7aff9a}#darts .dt{margin-top:6px;font-size:13px;color:#cfe0d4;min-height:18px}"+
    "#darts .big{font-family:'Oswald',sans-serif;font-size:22px;letter-spacing:.06em;color:#fff;min-height:28px;margin-top:2px}"+
    "#darts .keys{margin-top:6px;font-size:10px;color:#9aa1ab}#darts .keys b{color:#f4c430;font-weight:500}"+
    "#darts .pips span{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;background:#f4c430}#darts .pips span.used{background:#3a4040}";
  document.head.appendChild(st);
  const d=document.createElement("div"); d.id="darts";
  d.innerHTML='<div class="hd"><span class="t">DARTS · 301</span><span class="sc"><span class="you">YOU <b>301</b></span><span class="dal">DALE <b>301</b></span></span></div>'+
    '<div class="pips"></div><div class="big"></div><div class="dt"></div>'+
    '<div class="keys"><b>LOOK</b> aim · <b>CLICK</b> or <b>SPACE</b> throw · <b>N</b> new game · <b>ESC</b> put the darts down</div>';
  document.body.appendChild(d); DARTS.panel=d;
})();
// where a point on the board's face scores: dy up from the centre, dr to your right (metres)
function dartScore(dy, dr){
  const R=DART_RINGS, r=Math.hypot(dy, dr);
  if(r<=R.bull) return {pts:50, say:"BULLSEYE", ring:"bull"};
  if(r<=R.outerBull) return {pts:25, say:"OUTER BULL", ring:"25"};
  if(r>R.doubleOut) return {pts:0, say:r<=HANGOUT.dart.r?"OUTSIDE THE DOUBLE":"OFF THE BOARD", ring:"miss"};
  const th=Math.atan2(dr, dy), i=((Math.round(th/(Math.PI/10))%20)+20)%20, n=DART_ORDER[i];
  if(r>=R.trebleIn && r<=R.trebleOut) return {pts:n*3, say:"TREBLE "+n, ring:"t", n:n};
  if(r>=R.doubleIn) return {pts:n*2, say:"DOUBLE "+n, ring:"d", n:n};
  return {pts:n, say:"SINGLE "+n, ring:"s", n:n};
}
const _gauss=()=>{ let u=0,v=0; while(!u) u=Math.random(); while(!v) v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
DARTS.newGame=function(){
  const G={you:301, dale:301, turn:"you", dart:0, turnStart:301, histY:[301], histD:[301], over:null, thrown:[]};
  DARTS.game=G; DARTS.clearBoard(); DARTS.last="TOE THE LINE. YOU THROW FIRST."; DARTS.draw();
};
DARTS.clearBoard=function(){ for(const m of DARTS.stuck) scene.remove(m); DARTS.stuck.length=0; };
DARTS.start=function(){
  const B=HANGOUT.dart; if(!B || DARTS.on) return;
  DARTS.on=true; clearKeys();
  if(seated) standUp();
  for(const m of HANGOUT.idleDarts) m.visible=false;
  player.pos.set(B.oche+0.22, 0, B.z); player.feetY=HANGOUT.room.y; player.yaw=Math.PI/2;
  player.pitch=Math.atan2(B.y-(player.feetY+EYE), B.oche+0.22-B.x);
  if(!DARTS.game || DARTS.game.over) DARTS.newGame();
  DARTS.panel.classList.add("show"); DARTS.draw();
  toast("DARTS · CLICK TO THROW","#f4c430");
};
DARTS.stop=function(){
  DARTS.on=false; DARTS.panel.classList.remove("show");
  if(!DARTS.stuck.length) for(const m of HANGOUT.idleDarts) m.visible=true;
};
DARTS.key=function(e){
  if(e.repeat) return;
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ DARTS.stop(); return; }
  if(e.code==="Space") DARTS.throwDart();
  if(e.code==="KeyN"){ DARTS.newGame(); toast("NEW GAME · 301","#f4c430"); }
};
renderer.domElement.addEventListener("mousedown", e=>{ if(DARTS.on && e.button===0 && document.pointerLockElement===renderer.domElement) DARTS.throwDart(); });

DARTS.throwDart=function(){
  const G=DARTS.game, B=HANGOUT.dart;
  if(!G || G.over || G.turn!=="you" || DARTS.flying || DARTS.wait>0) return;
  // where you are looking, where the ray meets the board's face, and the hand's error on top
  const cp=Math.cos(player.pitch), o=V3(player.pos.x, player.feetY+EYE, player.pos.z);
  const d=V3(-Math.sin(player.yaw)*cp, Math.sin(player.pitch), -Math.cos(player.yaw)*cp);
  if(d.x>-0.2) return;                                                // not facing the board
  const t=(B.x-o.x)/d.x, aim=o.clone().addScaledVector(d, t);
  aim.y+=_gauss()*0.010-0.004; aim.z+=_gauss()*0.010;
  const right=new T.Vector3(-d.z, 0, d.x).normalize();                 // your right, in the board's plane
  const s=o.clone().addScaledVector(d, 0.30).addScaledVector(right, 0.13); s.y-=0.16;
  const m=new T.Mesh(DART_GEO, DART_MAT); m.position.copy(s); scene.add(m);
  DARTS.flying={m:m, s:s, e:aim, u:0, dur:Math.max(0.16, s.distanceTo(aim)/10.5), h:0.09};
  G.dart++;
  if(typeof AUDIO!=="undefined") AUDIO.blip("whoosh");
};
function _dartLand(F){
  const G=DARTS.game, B=HANGOUT.dart, e=F.e;
  const dy=e.y-B.y, dr=-(e.z-B.z), r=Math.hypot(dy,dr);
  let res;
  if(r<=B.r){ res=dartScore(dy, dr); DARTS.stuck.push(F.m); if(typeof AUDIO!=="undefined") AUDIO.blip("dart", e.x, e.z); }
  else if(Math.abs(dy)<B.corkHalf && Math.abs(dr)<B.corkHalf){ res={pts:0, say:"IN THE CORK", ring:"miss"}; DARTS.stuck.push(F.m); if(typeof AUDIO!=="undefined") AUDIO.blip("dart", e.x, e.z); }
  else { res={pts:0, say:"OFF THE WALL", ring:"miss"}; F.m.position.set(e.x+0.25+Math.random()*0.3, HANGOUT.room.y+0.01, e.z+(Math.random()-0.5)*0.6);
    F.m.rotation.set(Math.PI/2, Math.random()*6, 0); DARTS.stuck.push(F.m); if(typeof AUDIO!=="undefined") AUDIO.blip("tick", e.x, e.z); }
  G.thrown.push(res);
  const left=G.you-res.pts;
  if(left<0){                                                         // bust: the turn is back to where it started
    G.you=G.turnStart; DARTS.last="BUST · "+res.say+" ("+res.pts+") · BACK TO "+G.you; toast("BUST","#ff8a6a");
    G.dart=3;
  }else{
    G.you=left; DARTS.last=res.say+(res.pts?" · "+res.pts:"");
    toast(res.pts?res.say+" · "+res.pts:res.say, res.pts>=50||res.ring==="t"?"#7aff9a":"#cfe0d4");
    if(G.you===0){ G.over="you"; DARTS.last="GAME SHOT · "+res.say+". YOU WIN"; toast("GAME SHOT · YOU WIN","#7aff9a"); G.histY.push(0); }
  }
  if(!G.over && G.dart>=3){ G.histY.push(G.you); DARTS.wait=1.2; DARTS.after="dale"; }
  DARTS.draw();
}
// Dale's turn: he aims for the treble twenty until he can see the finish, then goes for it; he's decent
function _daleTurn(){
  const G=DARTS.game; let left=G.dale; const start=left, said=[];
  const R=DART_RINGS;
  for(let k=0;k<3;k++){
    let tdy=(R.trebleIn+R.trebleOut)/2, tdr=0;                         // treble twenty
    if(left<=40 && left%2===0 && left>0){ const n=left/2, i=n===25?-1:DART_ORDER.indexOf(n); if(i>=0){ const th=i*Math.PI/10, rr=(R.doubleIn+R.doubleOut)/2; tdy=Math.cos(th)*rr; tdr=Math.sin(th)*rr; } else { tdy=0; tdr=0; } }
    else if(left<=20){ const i=DART_ORDER.indexOf(left), th=i*Math.PI/10, rr=0.13; tdy=Math.cos(th)*rr; tdr=Math.sin(th)*rr; }
    else if(left===50 || left===25){ tdy=0; tdr=0; }
    else if(left<60){ const want=left-20, i=DART_ORDER.indexOf(Math.min(20,want)); if(i>=0){ const th=i*Math.PI/10; tdy=Math.cos(th)*0.13; tdr=Math.sin(th)*0.13; } }
    const res=dartScore(tdy+_gauss()*0.022, tdr+_gauss()*0.022);
    said.push(res.pts?res.say.replace("SINGLE ",""):"MISS");
    if(left-res.pts<0){ left=start; said.push("BUST"); break; }
    left-=res.pts; if(left===0) break;
  }
  G.dale=left; G.histD.push(left);
  DARTS.last="DALE: "+said.join(" · ")+(left===0?" · DALE WINS":" · "+(start-left)+" (LEFT "+left+")");
  if(left===0){ G.over="dale"; toast("DALE CHECKS OUT. DALE WINS","#ff8a6a"); }
  else toast("DALE THROWS "+(start-left),"#cfe0d4");
}
DARTS.draw=function(){
  const G=DARTS.game; if(!G) return;
  const P=DARTS.panel;
  P.querySelector(".you b").textContent=G.you; P.querySelector(".dal b").textContent=G.dale;
  P.querySelector(".you").classList.toggle("up", G.turn==="you" && !G.over);
  let pips=""; for(let k=0;k<3;k++) pips+='<span class="'+(k<G.dart||G.turn!=="you"?"used":"")+'"></span>';
  P.querySelector(".pips").innerHTML=pips;
  P.querySelector(".big").textContent = G.over ? (G.over==="you"?"YOU WIN · N FOR ANOTHER":"DALE WINS · N FOR ANOTHER")
                                       : G.turn==="you" ? "YOUR THROW · DART "+Math.min(3,G.dart+1)+" OF 3" : "DALE IS UP";
  P.querySelector(".dt").textContent=DARTS.last;
  // the chalkboard: the last few rows of each of you
  const C=HANGOUT.chalk;
  if(C){ const tail=a=>a.slice(-6);
    chalkDraw(C.c, ["YOU","DALE"], tail(G.histY), tail(G.histD), G.over?(G.over==="you"?"YOU WON":"DALE WON"):(G.turn==="you"?"YOUR THROW":"DALE")); C.tex.needsUpdate=true; }
};
function updateDarts(dt){
  if(!DARTS.on && !DARTS.flying) return;
  const F=DARTS.flying;
  if(F){ F.u=Math.min(1, F.u+dt/F.dur); const u=F.u;
    const p=new T.Vector3().lerpVectors(F.s, F.e, u); p.y+=4*F.h*u*(1-u);
    const v=new T.Vector3().subVectors(F.e, F.s); v.y+=4*F.h*(1-2*u);       // the arc's own direction
    F.m.position.copy(p); F.m.lookAt(p.clone().sub(v));
    if(u>=1){ DARTS.flying=null; _dartLand(F); } }
  if(!DARTS.on) return;
  // the hand: a slow drift with a quicker tremor on it, felt as the view
  DARTS.swayT+=dt; const t=DARTS.swayT;
  const sy=Math.sin(t*0.9)*0.0035+Math.sin(t*2.3+1.1)*0.0015, sp=Math.sin(t*1.1+0.5)*0.0030+Math.sin(t*2.9)*0.0012;
  player.yaw+=sy-DARTS.sway[0]; player.pitch+=sp-DARTS.sway[1]; DARTS.sway=[sy,sp];
  // standing at the line
  const B=HANGOUT.dart; player.pos.x=B.oche+0.22; player.pos.z=B.z;
  if(DARTS.wait>0){ DARTS.wait-=dt;
    if(DARTS.wait<=0 && DARTS.after==="dale"){ const G=DARTS.game; G.turn="dale"; DARTS.draw(); DARTS.wait=1.4; DARTS.after="daleThrows"; }
    else if(DARTS.wait<=0 && DARTS.after==="daleThrows"){ _daleTurn(); const G=DARTS.game;
      if(!G.over){ DARTS.wait=1.8; DARTS.after="pull"; } DARTS.draw(); }
    else if(DARTS.wait<=0 && DARTS.after==="pull"){ const G=DARTS.game;     // your darts out of the board, your turn again
      DARTS.clearBoard(); G.turn="you"; G.dart=0; G.turnStart=G.you; G.thrown.length=0; DARTS.last="YOUR THROW"; DARTS.draw(); } }
}
const DART_GEO=dartGeometry();
