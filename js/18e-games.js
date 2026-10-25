"use strict";
/* REST AREA · 18e-games.js
   the two games in the arcade you play (12c): air hockey against the
   table's computer, and the hoops machine
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18e · AIR HOCKEY AND HOOPS

   AIR HOCKEY. E at the east end of the table puts the red mallet in your
   hand. The mouse (or WASD) moves it about your half; the CPU has the
   blue one at the far end. The puck rides the air: it slows only a little,
   comes off the rails with most of its speed, and off a mallet the way it
   comes off a real one, the mallet's own speed carried into it, so a swing
   is a shot and a mallet held still is a block. Into the slot at an end is
   a goal; the one scored on serves. First to seven. The physics are the
   ones in the little canvas game the crew left on the office computer
   (the rails, the slots, the hit off a mallet, the CPU that chases the
   puck in its own half and gets out of the way of one behind it), moved
   on to the table in metres and stepped at 240 Hz so nothing tunnels.

   HOOPS. E at the front of the machine stands you at the line. You aim
   where you look, a hand's sway on it the way the darts have; click (or
   Space) shoots the next ball from the tray. It flies its arc to where
   you aimed (to within a couple of centimetres), and the rim and the
   backboard are hard: off the front of the rim it bounces out, off the
   board it can still drop. Down through the hoop is two, three in the last
   ten seconds. The balls roll back down the ramp to the tray. Forty
   seconds from the first shot. Esc (or E) steps away from either.
   ---------------------------------------------------------------------- */
(function gamesUI(){
  const st=document.createElement("style");
  st.textContent=".gp{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:14;display:none;min-width:min(520px,92vw);"+
    "background:rgba(14,14,22,0.86);border:1px solid #3a3a5a;border-radius:6px;padding:10px 14px;font-family:'JetBrains Mono',monospace;color:#e8e8f0;"+
    "box-shadow:0 6px 24px rgba(0,0,0,0.5)}.gp.show{display:block}.gp .hd{display:flex;justify-content:space-between;gap:12px;align-items:baseline}"+
    ".gp .t{font-family:'Oswald',sans-serif;font-size:18px;letter-spacing:.14em}.gp .sc{display:flex;gap:18px;font-size:15px}"+
    ".gp .sc b{color:#f4c430;font-weight:600}.gp .big{font-family:'Oswald',sans-serif;font-size:22px;letter-spacing:.06em;color:#fff;min-height:28px;margin-top:4px}"+
    ".gp .dt{margin-top:4px;font-size:13px;color:#cfd0e4;min-height:18px}.gp .keys{margin-top:6px;font-size:10px;color:#9a9fb4}.gp .keys b{color:#f4c430;font-weight:500}";
  document.head.appendChild(st);
})();
function _gamePanel(id, title, sc, keys){
  const d=document.createElement("div"); d.id=id; d.className="gp";
  d.innerHTML='<div class="hd"><span class="t">'+title+'</span><span class="sc">'+sc+'</span></div><div class="big"></div><div class="dt"></div><div class="keys">'+keys+'</div>';
  document.body.appendChild(d); return d;
}
// the LED face a score is shown on: red digits, fitted to the face with room round them
function _ledFace(S, left, right){
  const c=S.c, x=c.getContext("2d"), W=c.width, H=c.height;
  x.fillStyle="#0a0a0a"; x.fillRect(0,0,W,H);
  x.shadowColor="#ff2a1a"; x.shadowBlur=10; x.fillStyle="#ff3a2a";
  fitText(x, left, W*0.40, H*0.56, W*0.27, H/2, "700", "'Courier New', monospace");
  fitText(x, right, W*0.40, H*0.56, W*0.73, H/2, "700", "'Courier New', monospace");
  x.shadowBlur=0; S.tex.needsUpdate=true;
}

/* ======================================================================
   AIR HOCKEY
   ====================================================================== */
const HOCKEY={on:false, g:null, panel:null, keys:{}, last:"",
  P:{u:0, v:0, vu:0, vv:0}, Y:{u:0, v:0, pu:0, pv:0, vu:0, vv:0}, C:{u:0, v:0, vu:0, vv:0},
  pause:0, still:0, hitT:0, mood:1,
  // what the CPU believes: the puck as it saw it a beat ago, and this rally's misjudgements
  ai:{u:0, v:0, vu:0, vv:0, err:0, aim:0, slack:1, side:0, late:0}};
HOCKEY.panel=_gamePanel("hockey", "AIR HOCKEY · FIRST TO 7", '<span class="you">YOU <b>0</b></span><span class="cpu">CPU <b>0</b></span>',
  '<b>MOUSE</b> or <b>WASD</b> move your mallet · <b>N</b> new game · <b>ESC</b> step away');
const _HK={rP:0.031, rM:0.050, e:0.86, hit:1.15, max:7.0, win:7};
function _hkT(){ const T2=ARCADE.hockey; return {HU:T2.L/2-0.06, HV:T2.W/2-0.06, GH:T2.goal/2}; }
HOCKEY.newGame=function(){
  const F=_hkT();
  HOCKEY.g={you:0, cpu:0, over:null}; Object.assign(HOCKEY.ai, {u:0, v:0, vu:0, vv:0, err:0, aim:0, slack:1, side:1, late:0});
  Object.assign(HOCKEY.Y, {u:F.HU-0.25, v:0, pu:F.HU-0.25, pv:0, vu:0, vv:0});
  Object.assign(HOCKEY.C, {u:-(F.HU-0.25), v:0, vu:0, vv:0});
  HOCKEY.serve("you"); HOCKEY.last="YOUR SERVE. HIT IT."; HOCKEY.draw();
};
// the puck put down in the half of whoever was scored on, still, for them to hit
HOCKEY.serve=function(who){ Object.assign(HOCKEY.P, {u:who==="you"?0.32:-0.32, v:(Math.random()-0.5)*0.2, vu:0, vv:0}); HOCKEY.pause=0.7; HOCKEY.still=0; };
HOCKEY.start=function(){
  const T2=ARCADE.hockey; if(!T2 || HOCKEY.on) return;
  if(typeof DARTS!=="undefined" && DARTS.on) DARTS.stop();
  HOCKEY.on=true; clearKeys(); HOCKEY.keys={};
  if(seated) standUp();
  if(!HOCKEY.g || HOCKEY.g.over) HOCKEY.newGame();
  HOCKEY.panel.classList.add("show"); HOCKEY.draw();
  if(typeof AUDIO!=="undefined") AUDIO.blip("coin", T2.x, T2.z);
  toast("A TOKEN IN. THE AIR COMES ON","#7ae4ff");
};
HOCKEY.stop=function(){
  HOCKEY.on=false; HOCKEY.panel.classList.remove("show");
  // the puck goes back to drifting on its own from wherever it is
  const T2=ARCADE.hockey, A=ARCADE.puck; if(A && T2){ A.x=T2.x+HOCKEY.P.u; A.z=T2.z+HOCKEY.P.v; A.vx=0.3*(Math.random()<0.5?-1:1); A.vz=0.2; }
  player.pitch=-0.15;
};
HOCKEY.key=function(e){
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ if(!e.repeat) HOCKEY.stop(); return; }
  if(e.code==="KeyN" && !e.repeat){ HOCKEY.newGame(); toast("NEW GAME · FIRST TO 7","#7ae4ff"); return; }
  HOCKEY.keys[e.code]=true;
};
addEventListener("keyup", e=>{ HOCKEY.keys[e.code]=false; });
// the mouse moves the mallet, not your head: right is across the table to your right, down the mouse brings it to you
HOCKEY.move=function(dx, dy){
  const F=_hkT(), Y=HOCKEY.Y;
  Y.v=clamp(Y.v-dx*0.0017, -F.HV+_HK.rM, F.HV-_HK.rM);
  Y.u=clamp(Y.u+dy*0.0017, _HK.rM+0.02, F.HU-_HK.rM);
};
HOCKEY.draw=function(){
  const G=HOCKEY.g; if(!G) return; const P=HOCKEY.panel;
  P.querySelector(".you b").textContent=G.you; P.querySelector(".cpu b").textContent=G.cpu;
  P.querySelector(".big").textContent=G.over ? (G.over==="you"?"YOU WIN "+G.you+"–"+G.cpu+" · N FOR ANOTHER":"CPU WINS "+G.cpu+"–"+G.you+" · N FOR ANOTHER")
                                             : (G.you===_HK.win-1||G.cpu===_HK.win-1 ? "GAME POINT" : "");
  P.querySelector(".dt").textContent=HOCKEY.last;
  if(ARCADE.hockey) _ledFace(ARCADE.hockey.score, "YOU "+G.you, G.cpu+" CPU");
};
function _hkGoal(by){
  const G=HOCKEY.g;
  if(by==="you"){ G.you++; HOCKEY.last="GOAL. "+G.you+"–"+G.cpu; toast("GOAL","#7aff9a"); HOCKEY.serve("cpu"); }
  else { G.cpu++; HOCKEY.last="THE CPU SCORES. "+G.you+"–"+G.cpu+". YOUR SERVE"; toast("CPU SCORES","#ff8a6a"); HOCKEY.serve("you"); }
  if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", ARCADE.hockey.x, ARCADE.hockey.z);
  if(G.you>=_HK.win){ G.over="you"; toast("YOU WIN "+G.you+"–"+G.cpu,"#7aff9a"); }
  else if(G.cpu>=_HK.win){ G.over="cpu"; toast("THE CPU WINS "+G.cpu+"–"+G.you,"#ff8a6a"); }
  HOCKEY.draw();
}
// the table's computer: from the canvas game. In its own half and the puck slow (or going
// away) it goes round behind the puck and hits it at your goal; the puck coming at it, it
// gets across in front of its slot where the puck is headed; the puck in your half, it
// waits at home a little to the puck's side; a puck behind it, it steps out of the way.
// It is beatable: it sees the puck a beat late, misreads where a shot is going by a few
// centimetres, aims its own shots a little off, and now and then is slow off the mark.
function _hkCPU(dt){
  const F=_hkT(), Pt=HOCKEY.P, C=HOCKEY.C, R=_HK.rP+_HK.rM, home=-F.HU+0.22, A=HOCKEY.ai;
  HOCKEY.mood=clamp(HOCKEY.mood+(Math.random()-0.5)*dt*0.8, 0.76, 1.02);       // it has better and worse moments
  // its eyes: the puck it acts on trails the real one by about a tenth of a second
  const k=Math.min(1, dt/0.085); A.u+=(Pt.u-A.u)*k; A.v+=(Pt.v-A.v)*k; A.vu+=(Pt.vu-A.vu)*k; A.vv+=(Pt.vv-A.vv)*k;
  // each time the puck comes over into its half, a fresh misjudgement for the rally
  const side=Pt.u<0?-1:1;
  if(side<0 && A.side>=0){ A.err=_gauss()*0.03; A.aim=_gauss()*0.07; A.slack=Math.random()<0.10 ? 0.55+Math.random()*0.3 : 1; A.late=Math.random()<0.10 ? 0.08+Math.random()*0.12 : 0; }
  A.side=side; if(A.late>0){ A.late-=dt; return; }                                // caught flat-footed: it starts late
  const P=A;
  let tu=home, tv=P.v*0.4, sp=1.0;
  const speed=Math.hypot(P.vu, P.vv);
  if(P.u<0 && (speed<1.0 || P.vu>0.2)){
    // round behind it, along the line from your goal through the puck, and on through it
    const du=F.HU-P.u, dv=A.aim-P.v, L=Math.hypot(du,dv)||1, nu=du/L, nv=dv/L;   // (at a spot it means for your slot, a little off)
    const behind=(C.u-P.u)*nu+(C.v-P.v)*nv;                                     // > 0: on your side of the puck
    if(behind>-R*0.3){ tu=P.u-nu*R*1.4; tv=P.v-nv*R*1.4+(C.v>P.v?R:-R)*1.2; }  // go round it first
    else { tu=P.u+nu*0.06; tv=P.v+nv*0.06; }                                    // and through it
    sp=1.45;
  }else if(P.vu<-0.1){
    const t=(home-P.u)/P.vu; let pv=P.v+P.vv*Math.max(0,t);
    const span=2*(F.HV-_HK.rP); pv=((pv+F.HV-_HK.rP)%(2*span)+2*span)%(2*span); pv=pv>span?2*span-pv:pv; pv-=F.HV-_HK.rP;   // off the rails
    tu=home; tv=clamp(pv+A.err, -F.GH-0.06, F.GH+0.06); sp=1.7;
  }
  if(Pt.u<C.u-0.01 && Math.abs(Pt.v-C.v)<R*1.1){ tu=C.u+0.08; tv=C.v+(C.v>=Pt.v?1:-1)*R*1.6; sp=1.6; }    // out of its way
  const du=tu-C.u, dv=tv-C.v, d=Math.hypot(du,dv), step=Math.min(d, sp*HOCKEY.mood*A.slack*dt);
  const ou=C.u, ov=C.v;
  if(d>1e-6){ C.u+=du/d*step; C.v+=dv/d*step; }
  C.u=clamp(C.u, -F.HU+_HK.rM, -_HK.rM-0.02); C.v=clamp(C.v, -F.HV+_HK.rM, F.HV-_HK.rM);
  C.vu=(C.u-ou)/dt; C.vv=(C.v-ov)/dt;
}
function _hkHit(P, M, mvu, mvv){
  const du=P.u-M.u, dv=P.v-M.v, d=Math.hypot(du,dv), R=_HK.rP+_HK.rM;
  if(d>=R || d<1e-6) return false;
  const nu=du/d, nv=dv/d;
  P.u=M.u+nu*R; P.v=M.v+nv*R;                                                   // out of the mallet
  const ru=P.vu-mvu, rv=P.vv-mvv, vn=ru*nu+rv*nv;
  if(vn<0){ P.vu-=(1+_HK.e)*vn*nu; P.vv-=(1+_HK.e)*vn*nv; }                   // off it, its own speed carried in
  const out=P.vu*nu+P.vv*nv; if(out<_HK.hit){ P.vu+=(_HK.hit-out)*nu; P.vv+=(_HK.hit-out)*nv; }   // a touch still sends it
  const s=Math.hypot(P.vu,P.vv); if(s>_HK.max){ P.vu*=_HK.max/s; P.vv*=_HK.max/s; }
  return true;
}
function _hkStep(h, Ym){
  const F=_hkT(), P=HOCKEY.P, rP=_HK.rP;
  P.u+=P.vu*h; P.v+=P.vv*h;
  const k=Math.exp(-0.30*h); P.vu*=k; P.vv*=k;                                 // the air: it hardly slows
  if(P.v>F.HV-rP){ P.v=F.HV-rP; P.vv=-Math.abs(P.vv)*0.9; }
  if(P.v<-F.HV+rP){ P.v=-F.HV+rP; P.vv=Math.abs(P.vv)*0.9; }
  const inSlot=Math.abs(P.v)<F.GH-rP*0.4;
  if(P.u>F.HU-rP){ if(inSlot){ if(P.u>F.HU+rP){ _hkGoal("cpu"); return "goal"; } } else { P.u=F.HU-rP; P.vu=-Math.abs(P.vu)*0.9; } }
  if(P.u<-F.HU+rP){ if(inSlot){ if(P.u<-F.HU-rP){ _hkGoal("you"); return "goal"; } } else { P.u=-F.HU+rP; P.vu=Math.abs(P.vu)*0.9; } }
  let hit=_hkHit(P, Ym, HOCKEY.Y.vu, HOCKEY.Y.vv) | _hkHit(P, HOCKEY.C, HOCKEY.C.vu, HOCKEY.C.vv);
  if(hit && HOCKEY.hitT<=0 && typeof AUDIO!=="undefined"){ AUDIO.blip("tick", ARCADE.hockey.x, ARCADE.hockey.z); HOCKEY.hitT=0.08; }
  return "";
}
function updateHockey(dt){
  const T2=ARCADE.hockey; if(!T2 || !HOCKEY.on) return;
  const F=_hkT(), G=HOCKEY.g, Y=HOCKEY.Y, K=HOCKEY.keys;
  HOCKEY.hitT-=dt;
  // the keys move the mallet too
  const ks=1.5*dt;
  if(K.KeyW||K.ArrowUp) Y.u-=ks; if(K.KeyS||K.ArrowDown) Y.u+=ks;
  if(K.KeyA||K.ArrowLeft) Y.v+=ks; if(K.KeyD||K.ArrowRight) Y.v-=ks;
  Y.u=clamp(Y.u, _HK.rM+0.02, F.HU-_HK.rM); Y.v=clamp(Y.v, -F.HV+_HK.rM, F.HV-_HK.rM);
  const d=Math.max(1e-4, dt);
  Y.vu=clamp((Y.u-Y.pu)/d, -6, 6); Y.vv=clamp((Y.v-Y.pv)/d, -6, 6);
  if(!G.over){
    if(HOCKEY.pause>0) HOCKEY.pause-=dt;
    else {
      const n=Math.max(1, Math.ceil(dt*240)), h=dt/n, Ym={u:0, v:0};
      for(let i=1;i<=n;i++){
        Ym.u=lerp(Y.pu, Y.u, i/n); Ym.v=lerp(Y.pv, Y.v, i/n);                   // your mallet swept through the frame
        _hkCPU(h);
        if(_hkStep(h, Ym)==="goal") break;
      }
      // a puck dead on the table where nobody will hit it gets a nudge from the air
      const P=HOCKEY.P; if(Math.hypot(P.vu,P.vv)<0.04){ HOCKEY.still+=dt; if(HOCKEY.still>5){ P.vu=(P.u>0?-1:1)*0.35; P.vv=(Math.random()-0.5)*0.3; HOCKEY.still=0; } } else HOCKEY.still=0;
    }
  }
  Y.pu=Y.u; Y.pv=Y.v;
  // what you see: the puck, the two mallets
  const P=HOCKEY.P, top=T2.top;
  T2.puck.position.set(T2.x+P.u, top+0.016, T2.z+P.v);
  T2.you.position.set(T2.x+Y.u, top+0.009, T2.z+Y.v); T2.cpu.position.set(T2.x+HOCKEY.C.u, top+0.009, T2.z+HOCKEY.C.v);
  // you, at the end of the table, looking down it
  player.pos.set(T2.x+T2.L/2+0.50, 0, T2.z); player.feetY=T2.floor; player.yaw=Math.PI/2;
  player.pitch=Math.atan2(top-(T2.floor+EYE), T2.L/2+0.50+0.15);
}

/* ======================================================================
   HOOPS
   ====================================================================== */
const HOOPS={on:false, g:null, panel:null, best:0, last:"", balls:[], swayT:0, sway:[0,0], drift:[0,0], dirty:true, drawT:0,
  // the net's state: each ring's bulge round a ball in it, the whole net's stretch down and its swing
  net:{bulge:null, cx:null, cz:null, st:0, sv:0, sx:0, svx:0, sz:0, svz:0, live:0}};
HOOPS.panel=_gamePanel("hoops", "HOOPS · 40 SECONDS", '<span class="pts">SCORE <b>0</b></span><span class="tm">TIME <b>40</b></span><span class="bs">BEST <b>0</b></span>',
  '<b>LOOK</b> aim · <b>CLICK</b> or <b>SPACE</b> shoot · <b>N</b> new game · <b>ESC</b> step away');
const _HP={g:9.81, len:40, err:0.045};
function _hpSlot(k){ const H=ARCADE.hoops; return V3(H.x-0.30+k*0.20, H.tray.y, H.tray.z); }
function _hpInit(){
  if(HOOPS.balls.length || !ARCADE.hoops) return;
  ARCADE.hoops.balls.forEach((m,k)=>HOOPS.balls.push({m:m, st:"tray", slot:k, p:_hpSlot(k), v:V3(0,0,0), rv:0, t:0, scored:false}));
}
HOOPS.newGame=function(){
  _hpInit();
  HOOPS.g={score:0, time:_HP.len, started:false, over:false, shots:0, made:0};
  HOOPS.balls.forEach((b,k)=>{ b.st="tray"; b.slot=k; b.p.copy(_hpSlot(k)); b.v.set(0,0,0); b.m.position.copy(b.p); });
  HOOPS.last="THE CLOCK STARTS WITH YOUR FIRST SHOT"; HOOPS.dirty=true; HOOPS.draw();
};
HOOPS.start=function(){
  const H=ARCADE.hoops; if(!H || HOOPS.on) return;
  if(typeof DARTS!=="undefined" && DARTS.on) DARTS.stop();
  HOOPS.on=true; clearKeys();
  if(seated) standUp();
  if(!HOOPS.g || HOOPS.g.over) HOOPS.newGame();
  player.pos.set(H.x, 0, H.zf+0.55); player.feetY=H.floor; player.yaw=0;
  player.pitch=Math.atan2(H.rim.y-(H.floor+EYE), (H.zf+0.55)-H.rim.z)+0.06;
  HOOPS.panel.classList.add("show"); HOOPS.draw();
  if(typeof AUDIO!=="undefined") AUDIO.blip("coin", H.x, H.zf);
  toast("A TOKEN IN. FOUR BALLS IN THE TRAY","#f4a030");
};
HOOPS.stop=function(){ HOOPS.on=false; HOOPS.panel.classList.remove("show"); };
HOOPS.key=function(e){
  if(e.repeat) return;
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ HOOPS.stop(); return; }
  if(e.code==="Space") HOOPS.shoot();
  if(e.code==="KeyN"){ HOOPS.newGame(); toast("NEW GAME · 40 SECONDS","#f4a030"); }
};
renderer.domElement.addEventListener("mousedown", e=>{ if(HOOPS.on && e.button===0 && document.pointerLockElement===renderer.domElement) HOOPS.shoot(); });
HOOPS.shoot=function(){
  const G=HOOPS.g, H=ARCADE.hoops; if(!G || G.over || !H) return;
  const b=HOOPS.balls.filter(q=>q.st==="tray").sort((a,c)=>a.slot-c.slot)[0];
  if(!b){ HOOPS.last="WAITING ON A BALL"; HOOPS.draw(); return; }
  // where you are looking, where that meets the plane of the hoop, and the hand's error on it
  const cp=Math.cos(player.pitch), o=V3(player.pos.x, player.feetY+EYE, player.pos.z);
  const d=V3(-Math.sin(player.yaw)*cp, Math.sin(player.pitch), -Math.cos(player.yaw)*cp);
  if(d.z>-0.3) return;                                                         // not facing the machine
  const t0=(H.rim.z-o.z)/d.z, aim=o.clone().addScaledVector(d, t0);
  aim.x+=_gauss()*_HP.err; aim.y+=_gauss()*_HP.err;
  // from your hands, a ballistic arc through the aimed point, peaking well over it (so it comes down
  // into the hoop steeply, the way a shot that goes in does) but under the machine's frame
  const S=o.clone().addScaledVector(d, 0.35); S.y-=0.30;
  const g=_HP.g, apex=Math.min(Math.max(S.y, aim.y)+0.65, H.top-H.br-0.04), vy=Math.sqrt(2*g*Math.max(0.05, apex-S.y));
  const tf=(vy+Math.sqrt(Math.max(0, vy*vy+2*g*(S.y-aim.y))))/g;
  b.st="fly"; b.p.copy(S); b.v.set((aim.x-S.x)/tf, vy, (aim.z-S.z)/tf); b.scored=false; b.t=0;
  if(!G.started){ G.started=true; HOOPS.last="GO"; }
  G.shots++; HOOPS.dirty=true;
  if(typeof AUDIO!=="undefined") AUDIO.blip("whoosh");
};
HOOPS.draw=function(){
  const G=HOOPS.g; if(!G) return; const P=HOOPS.panel;
  P.querySelector(".pts b").textContent=G.score; P.querySelector(".tm b").textContent=Math.ceil(Math.max(0,G.time));
  P.querySelector(".bs b").textContent=HOOPS.best;
  P.querySelector(".big").textContent=G.over ? "TIME · "+G.score+" POINTS · "+G.made+" OF "+G.shots+" · N FOR ANOTHER"
                                             : (G.started && G.time<=10 ? "THREE POINTS A BASKET NOW" : "");
  P.querySelector(".dt").textContent=HOOPS.last;
  if(ARCADE.hoops) _ledFace(ARCADE.hoops.score, String(G.score).padStart(2,"0"), String(Math.ceil(Math.max(0,G.time))).padStart(2,"0"));
};
// one ball through a step: gravity, the rim (a hoop of steel tube), the backboard, the nets, the ramp
function _hpBall(b, h){
  const H=ARCADE.hoops, R=H.br, G=HOOPS.g, p=b.p, v=b.v, rim=H.rim;
  if(b.st==="fly" || b.st==="drop"){
    const py=p.y;
    v.y-=_HP.g*h; p.addScaledVector(v, h);
    if(b.st==="drop"){                                                          // out over the front, on the carpet
      if(p.y<H.floor+R){ p.y=H.floor+R; v.y=Math.abs(v.y)*0.45; v.x*=0.8; v.z*=0.8; }
      b.t+=h; if(b.t>1.4){ b.st="roll"; p.set(H.x, H.rampY(H.zf-0.4)+R, H.zf-0.4); b.rv=0.3; }
      return;
    }
    // the rim: the nearest point on its circle, and off that
    const qx=p.x-rim.x, qz=p.z-rim.z, ql=Math.hypot(qx,qz)||1e-6;
    const cx=rim.x+qx/ql*rim.r, cz=rim.z+qz/ql*rim.r, dx=p.x-cx, dy=p.y-rim.y, dz=p.z-cz, dl=Math.hypot(dx,dy,dz), RR=R+0.009;
    if(dl<RR && dl>1e-6){ const nx=dx/dl, ny=dy/dl, nz=dz/dl; p.x=cx+nx*RR; p.y=rim.y+ny*RR; p.z=cz+nz*RR;
      const vn=v.x*nx+v.y*ny+v.z*nz; if(vn<0){ v.x-=1.55*vn*nx; v.y-=1.55*vn*ny; v.z-=1.55*vn*nz; v.multiplyScalar(0.88);
        const N=HOOPS.net; N.svx-=nx*Math.abs(vn)*0.25; N.svz-=nz*Math.abs(vn)*0.25; N.live=2;
        if(typeof AUDIO!=="undefined" && Math.abs(vn)>0.6) AUDIO.blip("rim", p.x, p.z); } }
    // the backboard
    const Bd=H.board;
    if(p.z-R<Bd.z && py>Bd.y0-R && p.y<Bd.y1+R && p.x>Bd.x0-R && p.x<Bd.x1+R && v.z<0){ p.z=Bd.z+R; v.z=-v.z*0.55; v.x*=0.9; v.y*=0.9;
      if(typeof AUDIO!=="undefined") AUDIO.blip("thump", p.x, p.z); }
    if(p.z-R<H.zb){ p.z=H.zb+R; v.z=Math.abs(v.z)*0.3; }
    // the nets either side, and over the top: they give, and drop it
    if(p.z<H.netZ0){ if(p.x>H.x+H.hw-R){ p.x=H.x+H.hw-R; v.x=-Math.abs(v.x)*0.25; } if(p.x<H.x-H.hw+R){ p.x=H.x-H.hw+R; v.x=Math.abs(v.x)*0.25; }
      if(p.z<H.roofZ && p.y>H.top-R){ p.y=H.top-R; v.y=-Math.abs(v.y)*0.25; } }
    // down through the hoop
    if(!b.scored && py>rim.y && p.y<=rim.y && Math.hypot(p.x-rim.x, p.z-rim.z)<rim.r-R*0.30){
      b.scored=true; b.net=true;
      if(typeof AUDIO!=="undefined") AUDIO.blip("swish", rim.x, rim.z);
      if(G && G.started && !G.over && G.time>0){ const pts=G.time<=10?3:2; G.score+=pts; G.made++; HOOPS.last=pts===3?"THREE":"SWISH";
        HOOPS.dirty=true; } }
    // in the net: the cords take its speed and close round it, centring it, and it drops out the
    // bottom slower than it went in, the net snapped down after it and swinging
    if(b.net){ const N=H.net, k=Math.exp(-5.5*h);
      v.y*=Math.exp(-3.2*h); v.x=v.x*k+(rim.x-p.x)*28*h; v.z=v.z*k+(rim.z-p.z)*28*h;
      const ox=p.x-rim.x, oz=p.z-rim.z, off=Math.hypot(ox,oz), lim=rim.r-R*0.7;      // (it cannot leave by the side)
      if(off>lim){ p.x=rim.x+ox/off*lim; p.z=rim.z+oz/off*lim; }
      HOOPS.net.sv-=Math.max(0, -v.y)*2.6*h; HOOPS.net.live=2.5;
      if(p.y<rim.y-0.012-N.len-R*0.6){ b.net=false; HOOPS.net.svx+=v.x*0.9; HOOPS.net.svz+=v.z*0.9; HOOPS.net.sv-=0.35; } }
    // the ramp: it lands, and rolls back down to you
    if(p.z<H.zf && p.y-R<H.rampY(p.z)){ b.st="roll"; p.y=H.rampY(p.z)+R; b.rv=Math.max(0.2, v.z*0.3); v.set(0,0,0); return; }
    // short, over the front: into the tray if it comes down on it, the carpet if it doesn't
    if(p.z>=H.zf-0.02 && p.y-R<H.tray.y-R+0.02 && Math.abs(p.x-H.x)<H.hw){ b.st="roll"; b.rv=0.1; }
    else if(p.z>H.zf+0.10 && p.y<H.tray.y-0.1){ b.st="drop"; b.t=0; }
    b.m.rotation.x-=h*12;                                                        // backspin
    return;
  }
  if(b.st==="roll"){
    b.rv=Math.min(1.7, b.rv+1.8*h); p.z+=b.rv*h;
    const slots=[0,1,2,3].filter(k=>!HOOPS.balls.some(q=>q!==b && q.st==="tray" && q.slot===k));
    const k=slots.length ? slots[0] : 0, sx=_hpSlot(k).x;
    p.x+=(sx-p.x)*Math.min(1, h*3);
    p.y=(p.z<H.zf-0.25 ? H.rampY(p.z) : H.yF+0.05)+R;
    b.m.rotation.x+=b.rv*h/R;
    if(p.z>=H.tray.z){ b.st="tray"; b.slot=k; p.copy(_hpSlot(k)); }
  }
}
// the net: its rings springing back to their own size, pushed out round a ball inside them; the
// whole net stretched down by a ball going through and springing back up; its foot swung on
function _hpNet(dt){
  const H=ARCADE.hoops, N=H.net, S=HOOPS.net, rim=H.rim, R=H.br;
  if(!N || !N.mesh) return;
  if(S.live<=0 && !HOOPS.balls.some(b=>b.net)) return;
  S.live-=dt;
  const rows=N.rows, segs=N.segs;
  if(!S.bulge){ S.bulge=new Float32Array(rows); S.cx=new Float32Array(rows); S.cz=new Float32Array(rows); }
  // springs: the stretch (down), the swing (x, z), each with its damping
  const k=Math.exp(-6*dt);
  S.sv+=(-90*S.st)*dt; S.sv*=Math.exp(-7*dt); S.st=clamp(S.st+S.sv*dt, -0.12, 0.02);
  S.svx+=(-60*S.sx)*dt; S.svx*=Math.exp(-3.5*dt); S.sx=clamp(S.sx+S.svx*dt, -0.05, 0.05);
  S.svz+=(-60*S.sz)*dt; S.svz*=Math.exp(-3.5*dt); S.sz=clamp(S.sz+S.svz*dt, -0.05, 0.05);
  const top=rim.y-0.012;
  for(let j=0;j<rows;j++){
    const f=j/(rows-1), y=top-f*N.len+S.st*f, r=lerp(N.r0, N.r1, f);
    let need=0, cx=0, cz=0;
    for(const b of HOOPS.balls){ if(!b.net) continue;
      const dy=b.p.y-y; if(Math.abs(dy)>=R) continue;
      const half=Math.sqrt(R*R-dy*dy)+0.004, ox=b.p.x-rim.x, oz=b.p.z-rim.z, off=Math.hypot(ox,oz);
      const w=Math.min(0.07, Math.max(0, off+half-r)); if(w>need){ need=w; cx=ox*0.5; cz=oz*0.5; } }
    // out fast to the ball, back slower to its own size
    S.bulge[j]=need>S.bulge[j] ? need : S.bulge[j]*k; S.cx[j]=need>0?cx:S.cx[j]*k; S.cz[j]=need>0?cz:S.cz[j]*k;
  }
  const P=N.mesh.geometry.attributes.position, B=N.base, h0=N.len/2;
  for(let i=0;i<P.count;i++){
    const bx=B[i*3], by=B[i*3+1], bz=B[i*3+2], j=Math.round((h0-by)/N.len*(rows-1)), f=j/(rows-1);
    const r0=Math.hypot(bx,bz)||1e-6, r=r0+S.bulge[j];
    const sw=f*f;                                                       // the foot swings, the top is tied to the rim
    P.setXYZ(i, bx/r0*r+S.cx[j]+S.sx*sw, by+S.st*f, bz/r0*r+S.cz[j]+S.sz*sw);
  }
  P.needsUpdate=true; N.mesh.geometry.computeVertexNormals();
}
function updateHoops(dt){
  const H=ARCADE.hoops; if(!H) return;
  _hpInit();
  _hpNet(dt);
  const busy=HOOPS.balls.some(b=>b.st!=="tray");
  if(!HOOPS.on && !busy) return;
  const G=HOOPS.g;
  const n=Math.max(1, Math.ceil(dt*240)), h=dt/n;
  for(let i=0;i<n;i++) for(const b of HOOPS.balls) if(b.st!=="tray") _hpBall(b, h);
  for(const b of HOOPS.balls) b.m.position.copy(b.p);
  if(G && G.started && !G.over){ const was=Math.ceil(G.time); G.time-=dt; if(Math.ceil(G.time)!==was) HOOPS.dirty=true;
    if(G.time<=0){ G.time=0; G.over=true; HOOPS.best=Math.max(HOOPS.best, G.score);
      HOOPS.last="THE BUZZER"; toast("TIME · "+G.score+" POINTS","#f4a030"); if(typeof AUDIO!=="undefined") AUDIO.blip("horn", H.x, H.zf); HOOPS.dirty=true; } }
  if(HOOPS.dirty){ HOOPS.dirty=false; HOOPS.draw(); }
  if(!HOOPS.on) return;
  // the hand: a slow drift with a quicker tremor on it, as at the darts, and a wander that never
  // quite settles, so a shot has to be timed to the sway as well as aimed
  HOOPS.swayT+=dt; const t=HOOPS.swayT, D=HOOPS.drift;
  D[0]=clamp(D[0]+_gauss()*dt*0.016-D[0]*dt*0.6, -0.013, 0.013); D[1]=clamp(D[1]+_gauss()*dt*0.013-D[1]*dt*0.6, -0.010, 0.010);
  const sy=Math.sin(t*0.8)*0.015+Math.sin(t*2.1+1.3)*0.0065+D[0], sp=Math.sin(t*1.0+0.4)*0.013+Math.sin(t*2.7)*0.0050+D[1];
  player.yaw+=sy-HOOPS.sway[0]; player.pitch+=sp-HOOPS.sway[1]; HOOPS.sway=[sy,sp];
  player.pos.x=H.x; player.pos.z=H.zf+0.55; player.feetY=H.floor;
}
function updateGames(dt){ updateHockey(dt); updateHoops(dt); if(typeof updateRaiders==="function") updateRaiders(dt); if(typeof updateCabs==="function") updateCabs(dt); if(typeof updateDozer==="function") updateDozer(dt); }
// the scoreboards lit from the start, showing the last game's numbers (or none yet)
if(ARCADE.hockey) _ledFace(ARCADE.hockey.score, "YOU 0", "0 CPU");
if(ARCADE.hoops) _ledFace(ARCADE.hoops.score, "00", String(_HP.len));
