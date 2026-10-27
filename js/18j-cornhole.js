"use strict";
/* REST AREA · 18j-cornhole.js
   cornhole on the brewery's lawn (14r's boards): singles against Danny, at
   the near board, to 21
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18j · CORNHOLE
   `E` at the near board asks Danny for a game. You throw from the left of
   it and he from the right, four bags each, turn about, at the far board
   twenty-seven feet off; Jess steps out of the way beside it. Look where
   you want the bag to go and hold Space or the mouse button to wind up,
   and let go at the power you want: the bag goes up in a lob (higher the
   higher you look) and the first of its arc shows while you wind up.
   On the board a bag slides up the slope, slowing, and stops, unless it
   goes off the back or the side, or over the hole and through. Bags knock
   each other along the board: on, off, and in. In the hole is three, on
   the board one, on the grass nothing; the inning goes to whoever scored
   more, by the difference, and the first to 21 at the end of an inning
   wins. Whoever took the inning throws first in the next. Danny throws
   with the same bags through the same air, at a spot short of the hole so
   that the bag slides on into it: a fair player's hand, right more often
   than not. The scoreboard by the far board keeps the count.
   ---------------------------------------------------------------------- */
const CORN={on:false, bags:[], order:[], k:0, inning:1, score:[0,0], first:0, state:"idle", charge:-1, power:0, wait:0, swing:-1, aim:null,
            panel:null, arc:null, B0:null, B1:null, you:null, him:null};
(function cornhole(){
  if(typeof BREWERY==="undefined" || !BREWERY.boards || BREWERY.boards.length<2 || !BREWERY.corn) return;
  const C=CORN, B0=BREWERY.boards[0], B1=BREWERY.boards[1]; C.B0=B0; C.B1=B1;
  // the throwing end: you on the left of the near board, Danny on its right, both a step to the side of its middle
  const d=V3(B1.O.x-B0.O.x, 0, B1.O.z-B0.O.z).normalize(), right=V3(-d.z, 0, d.x);
  C.d=d; C.you=V3(B0.O.x-right.x*0.80, 0, B0.O.z-right.z*0.80); C.him=V3(B0.O.x+right.x*0.80, 0, B0.O.z+right.z*0.80);
  // the bags: four red (yours) and four blue (his), filled with corn: a soft square, a little flattened
  const geo=rboxGeo(0.152, 0.045, 0.152, 0.02, 2), mats=[new T.MeshStandardMaterial({color:0xb3261c, roughness:0.92}), new T.MeshStandardMaterial({color:0x1f4e8c, roughness:0.92})];
  for(let i=0;i<8;i++){ const m=new T.Mesh(geo, mats[i<4 ? 0 : 1]); m.castShadow=true; m.visible=false; scene.add(m);
    C.bags.push({m:m, who:i<4 ? 0 : 1, st:"hand", p:new T.Vector3(), v:new T.Vector3(), lx:0, ly:0, vx:0, vy:0, spin:Math.random()*6, board:null}); }
  // the first of the arc, while you wind up
  { const N=40, g=new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(N*3), 3).setUsage(T.DynamicDrawUsage)); g.setDrawRange(0, 0);
    C.arc=new T.Points(g, new T.PointsMaterial({color:0xf4e04a, size:4, sizeAttenuation:false, transparent:true, opacity:0.9, depthWrite:false}));
    C.arc.frustumCulled=false; C.arc.visible=false; scene.add(C.arc); }
  // the score and the bags, up top while you play
  const st=document.createElement("style");
  st.textContent="#corn{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:14;display:none;min-width:min(440px,92vw);"+
    "background:rgba(14,18,16,0.86);border:1px solid #3a4a40;border-radius:6px;padding:9px 14px;font-family:'JetBrains Mono',monospace;color:#e8ece6;"+
    "box-shadow:0 6px 24px rgba(0,0,0,0.5)}#corn.show{display:block}#corn .hd{display:flex;justify-content:space-between;gap:12px;align-items:baseline}"+
    "#corn .t{font-family:'Oswald',sans-serif;font-size:17px;letter-spacing:.12em}#corn .sc{font-size:14px}#corn .sc .r{color:#ff7a6a}#corn .sc .b{color:#8ab8ff}"+
    "#corn .bags{margin-top:6px;font-size:13px;letter-spacing:.2em}#corn .bags .r{color:#d8443a}#corn .bags .b{color:#4a86d8}#corn .bags .x{color:#3a403c}"+
    "#corn .msg{margin-top:6px;font-size:13px;color:#cfe0d4;min-height:18px}#corn .msg b{color:#f4c430;font-weight:500}"+
    "#corn .bar{margin-top:6px;height:8px;background:#2a302c;border-radius:4px;overflow:hidden}#corn .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7aff9a,#f4c430,#ff6a4a)}"+
    "#corn .keys{margin-top:6px;font-size:10px;color:#9aa1ab}#corn .keys b{color:#f4c430;font-weight:500}";
  document.head.appendChild(st);
  const el=document.createElement("div"); el.id="corn";
  el.innerHTML='<div class="hd"><span class="t">CORNHOLE</span><span class="sc"></span></div><div class="bags"></div><div class="msg"></div><div class="bar"><i></i></div>'+
    '<div class="keys"><b>LOOK</b> where you want it (up is a higher lob) · hold <b>SPACE</b> or the <b>MOUSE</b>, let go to throw · in the hole <b>3</b>, on the board <b>1</b>, the inning by the difference, first to <b>21</b> · <b>E</b> at the board to stop</div>';
  document.body.appendChild(el); C.panel=el;
  addUse(C.you.x, C.you.z, B0.g, "PLAY CORNHOLE WITH DANNY", ()=>C.start(), 1.6, ()=>!C.on);
  addUse(C.you.x, C.you.z, B0.g, "STOP PLAYING CORNHOLE", ()=>C.end("YOU PUT THE BAGS DOWN"), 1.6, ()=>C.on);
})();

/* ---- the bags where they lie ---------------------------------------------------------------------------------- */
const _cnQ=new T.Quaternion(), _cnQ2=new T.Quaternion(), _cnM=new T.Matrix4(), _cnY=new T.Vector3(0,1,0), _cnV=new T.Vector3();
// on a board at (lx, ly) in its own terms, or on the grass at (x, z), or down in the hole; turned on its spin
CORN.place=function(b){ const m=b.m;
  if(b.st==="board" || b.st==="slide"){ const B=b.board; m.position.copy(B.O).addScaledVector(B.ex, b.lx).addScaledVector(B.ez, b.ly).addScaledVector(B.n, 0.0235);
    _cnQ.setFromRotationMatrix(_cnM.makeBasis(B.ex, B.n, _cnV.crossVectors(B.ex, B.n))); m.quaternion.copy(_cnQ).multiply(_cnQ2.setFromAxisAngle(_cnY, b.spin)); }
  else if(b.st==="hole"){ const B=b.board; m.position.copy(B.hole).addScaledVector(B.n, -0.055);
    _cnQ.setFromRotationMatrix(_cnM.makeBasis(B.ex, B.n, _cnV.crossVectors(B.ex, B.n))); m.quaternion.copy(_cnQ).multiply(_cnQ2.setFromAxisAngle(V3(1,0,0), 0.9+b.spin*0.1)); }
  else if(b.st==="grass"){ m.position.set(b.p.x, Terrain.groundAt(b.p.x, b.p.z)+0.0235, b.p.z); m.quaternion.setFromAxisAngle(_cnY, b.spin); }
  else { m.position.copy(b.p); m.quaternion.setFromAxisAngle(V3(Math.sin(b.spin), 0.3, Math.cos(b.spin)).normalize(), b.spin*3); }
  m.visible=b.st!=="hand"; };
// when nobody is playing: a couple on the far board, one through its hole, one in the grass short of it, the rest in a heap by the near one
CORN.idle=function(){ const C=CORN, B1=C.B1;
  const lay=[["board", 0.10, -0.05],["board", -0.16, 0.22],["hole"],["board", 0.12, 0.30],["grass", -0.55, -0.9]];
  C.bags.forEach((b, i)=>{ b.v.set(0,0,0); b.spin=i*1.3;
    if(i<5){ const L=lay[i]; b.st=L[0]; b.board=B1;
      if(L[0]==="board"){ b.lx=L[1]; b.ly=L[2]; }
      else if(L[0]==="grass"){ const p=B1.O.clone().addScaledVector(B1.ex, L[1]).addScaledVector(B1.ez, L[2]); b.p.set(p.x, 0, p.z); } }
    else { b.st="grass"; const p=C.him.clone().addScaledVector(C.d, -0.35); b.p.set(p.x+(i-6)*0.17, 0, p.z+(i%2)*0.12); }
    C.place(b); }); };

/* ---- the game ----------------------------------------------------------------------------------------------------- */
CORN.start=function(){ const C=CORN, K=BREWERY.corn;
  C.on=true; C.score=[0,0]; C.inning=1; C.first=0; C.panel.classList.add("show");
  K.opp.x=C.him.x; K.opp.z=C.him.z; K.opp.y=Terrain.groundAt(C.him.x, C.him.z); K.opp.yaw=Math.atan2(C.d.x, C.d.z); K.opp.cornSwing=0.5;
  const far=C.B1.O.clone().addScaledVector(C.B1.ex, 1.7).addScaledVector(C.B1.ez, 0.6);       // (Jess: out of the way to the far board's side)
  K.far.home={x:K.far.x, z:K.far.z, yaw:K.far.yaw, job:K.far.job};
  K.far.x=far.x; K.far.z=far.z; K.far.y=Terrain.groundAt(far.x, far.z); K.far.yaw=Math.atan2(C.B1.O.x-far.x, C.B1.O.z-far.z); K.far.job="watch";
  REST.go(C.you.x, C.you.z, Math.atan2(-C.d.x, -C.d.z), C.B0.g+0.5, -0.08);
  if(typeof AUDIO!=="undefined") AUDIO.blip("jingle", C.you.x, C.you.z);
  toast("DANNY: “YOU'RE ON. RED'S YOURS. GO AHEAD.”", "#cfe0d4");
  BREWERY.scoreboard(0, 0, 1); C.newInning(); };
CORN.end=function(msg){ const C=CORN, K=BREWERY.corn; C.on=false; C.state="idle"; C.charge=-1; C.panel.classList.remove("show"); C.arc.visible=false;
  K.opp.cornSwing=undefined; if(K.far.home){ Object.assign(K.far, {x:K.far.home.x, z:K.far.home.z, yaw:K.far.home.yaw, job:K.far.home.job}); K.far.y=Terrain.groundAt(K.far.x, K.far.z); }
  BREWERY.scoreboard(C.score[0], C.score[1], 0); C.idle(); if(msg) toast(msg, "#cfe0d4"); };
CORN.newInning=function(){ const C=CORN;
  C.bags.forEach(b=>{ b.st="hand"; b.board=null; C.place(b); });
  C.order=[]; for(let i=0;i<4;i++){ C.order.push(C.first); C.order.push(1-C.first); }
  C.k=0; C.next(); C.draw(); };
// whose throw it is now
CORN.next=function(){ const C=CORN;
  if(C.k>=C.order.length){ C.tally(); return; }
  if(C.order[C.k]===0){ C.state="you"; C.msg(C.k<2 && C.inning===1 ? "YOUR THROW: LOOK AT THE FAR BOARD, HOLD <b>SPACE</b>, LET GO" : "YOUR THROW"); }
  else { C.state="him"; C.wait=1.0+Math.random()*0.8; C.msg("DANNY'S THROW"); }
  C.draw(); };
CORN.msg=function(s){ CORN.panel.querySelector(".msg").innerHTML=s; };
CORN.draw=function(){ const C=CORN, left=w=>C.order.slice(C.k).filter(x=>x===w).length;
  C.panel.querySelector(".sc").innerHTML='<span class="r">YOU '+C.score[0]+'</span> · <span class="b">DANNY '+C.score[1]+'</span> · INNING '+C.inning;
  const dots=(w, cls)=>{ let s=""; for(let i=0;i<4;i++) s+='<span class="'+(i<left(w) ? cls : "x")+'">●</span>'; return s; };
  C.panel.querySelector(".bags").innerHTML=dots(0, "r")+"&nbsp;&nbsp;"+dots(1, "b"); };
// the inning's count: three in the hole, one on the board, by the difference
CORN.tally=function(){ const C=CORN, pts=[0,0], tl=[[],[]];
  for(const b of C.bags){ const v=b.st==="hole" ? 3 : (b.st==="board" && Math.abs(b.lx)<=b.board.TW/2 && Math.abs(b.ly)<=b.board.TL/2) ? 1 : 0; pts[b.who]+=v; if(v) tl[b.who].push(v); }
  const dif=pts[0]-pts[1], who=dif>0 ? 0 : dif<0 ? 1 : -1;
  if(who>=0){ C.score[who]+=Math.abs(dif); C.first=who; }
  BREWERY.scoreboard(C.score[0], C.score[1], C.inning);
  const say=n=>n===0 ? "NOTHING" : n+(n===1 ? " POINT" : " POINTS");
  C.msg("YOU "+say(pts[0])+", DANNY "+say(pts[1])+" · "+(who<0 ? "THEY CANCEL: NO SCORE" : (who===0 ? "<b>YOU TAKE "+Math.abs(dif)+"</b>" : "DANNY TAKES "+Math.abs(dif))));
  C.draw(); C.state="tally"; C.wait=3.2;
  if(C.score[0]>=21 || C.score[1]>=21){ C.state="over"; C.wait=4.5;
    const won=C.score[0]>C.score[1], line=won ? "YOU WIN, "+C.score[0]+" TO "+C.score[1]+". DANNY: “RUN IT BACK?”" : "DANNY WINS, "+C.score[1]+" TO "+C.score[0]+". “GOOD GAME. ANOTHER?”";
    toast(line, won ? "#f4c430" : "#cfe0d4"); C.msg(line); if(won && typeof AUDIO!=="undefined") AUDIO.blip("jingle", C.you.x, C.you.z); } };
CORN.ready=function(){ const C=CORN; return C.on && C.state==="you" && !seated && !driving && Math.hypot(player.pos.x-C.you.x, player.pos.z-C.you.z)<1.4; };

/* ---- a throw -------------------------------------------------------------------------------------------------------
   Out of the hand at hip height a step in front, up at the angle you look plus a lob's worth, as hard as the meter; the
   air takes a little of it. One step of the flight: gravity and a light drag. */
const CORN_G=9.8, CORN_K=0.012, CORN_MU=0.55;
CORN.flyStep=function(p, v, h){ const s=v.length(); v.x-=CORN_K*s*v.x*h; v.z-=CORN_K*s*v.z*h; v.y-=(CORN_G+CORN_K*s*v.y)*h; p.addScaledVector(v, h); };
CORN.launch=function(b, from, yaw, ang, v0){ const fx=-Math.sin(yaw), fz=-Math.cos(yaw);
  b.p.set(from.x+fx*0.35, Terrain.groundAt(from.x, from.z)+0.95, from.z+fz*0.35); b.v.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
  b.st="fly"; b.board=null; b.spin=Math.random()*6; b.m.visible=true; CORN.state="fly"; CORN.k++; CORN.draw(); };
CORN.youThrow=function(){ const C=CORN, pw=C.power; C.charge=-1; C.power=0; if(!C.ready()) return;
  const b=C.bags.find(q=>q.who===0 && q.st==="hand"); if(!b) return;
  C.launch(b, player.pos, player.yaw, clamp(player.pitch+0.60, 0.12, 1.2), 4+9*pw); };
// Danny: the launch speed that brings a bag down at a spot (in the far board's terms) from where he stands, by trying it
CORN.solve=function(from, tx, tz, ty, ang){ const yaw=Math.atan2(-(tx-from.x), -(tz-from.z)), D=Math.hypot(tx-from.x, tz-from.z), p=new T.Vector3(), v=new T.Vector3();
  let lo=3, hi=16;
  for(let it=0;it<22;it++){ const v0=(lo+hi)/2, fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    p.set(from.x+fx*0.35, Terrain.groundAt(from.x, from.z)+0.95, from.z+fz*0.35); v.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
    let reach=0; for(let i=0;i<400;i++){ CORN.flyStep(p, v, 1/120); if(v.y<0 && p.y<ty){ reach=Math.hypot(p.x-from.x, p.z-from.z); break; } }
    if(reach<D) lo=v0; else hi=v0; }
  return {yaw:yaw, v0:(lo+hi)/2}; };
CORN.himThrow=function(){ const C=CORN, b=C.bags.find(q=>q.who===1 && q.st==="hand"); if(!b) return;
  const B=C.B1, g=()=>(Math.random()+Math.random()+Math.random()-1.5)*0.82;                              // (about a normal spread)
  const tlx=g()*0.07, tly=B.hy-0.40+g()*0.07, t=B.O.clone().addScaledVector(B.ex, tlx).addScaledVector(B.ez, tly), ang=0.55+g()*0.03;
  const S=C.solve(C.him, t.x, t.z, t.y+0.02, ang);
  C.launch(b, C.him, S.yaw+g()*0.030, ang, S.v0*(1+g()*0.055)); };

/* ---- the bags in the air and on the board ------------------------------------------------------------------------ */
const _cnP=new T.Vector3();
CORN.step=function(h){ const C=CORN, B=C.B1;
  for(const b of C.bags){
    if(b.st==="fly"){ _cnP.copy(b.p); C.flyStep(b.p, b.v, h); b.spin+=h*4;
      // onto the far board's face: through the hole from the air, or down on it and sliding with what way it keeps
      const rel=_cnV.copy(b.p).sub(B.O), hN=rel.dot(B.n), lx=rel.dot(B.ex), ly=rel.dot(B.ez), h0=_cnP.sub(B.O).dot(B.n);
      if(hN<=0.0235 && h0>0.0235 && Math.abs(lx)<=B.TW/2+0.02 && ly>=-B.TL/2 && ly<=B.TL/2+0.02){
        if(Math.hypot(lx, ly-B.hy)<0.060){ b.st="hole"; b.board=B; C.sound("baghole", b); }
        else { b.st="slide"; b.board=B; b.lx=lx; b.ly=ly; b.vx=b.v.dot(B.ex)*0.35; b.vy=b.v.dot(B.ez)*0.35; C.sound("bagboard", b); } }
      else if(b.p.y<=Terrain.groundAt(b.p.x, b.p.z)+0.0235){ b.st="grass"; b.p.addScaledVector(_cnV.set(b.v.x, 0, b.v.z).normalize(), 0.12); }
      C.place(b); }
    else if(b.st==="slide"){ const Bd=b.board, sp=Math.hypot(b.vx, b.vy);
      // up the slope, gravity back down it and the cloth's grip against the way it goes
      const fr=CORN_MU*CORN_G*Math.cos(Bd.A); b.vy-=CORN_G*Math.sin(Bd.A)*h;
      if(sp>1e-4){ const dec=Math.min(sp, fr*h); b.vx-=b.vx/sp*dec; b.vy-=b.vy/sp*dec; }
      b.lx+=b.vx*h; b.ly+=b.vy*h; b.spin+=b.vx*h*2;
      // into the others on the board: equal bags, a soft knock, and the one hit goes sliding
      for(const o of C.bags){ if(o===b || o.board!==Bd || (o.st!=="board" && o.st!=="slide")) continue;
        const dx=o.lx-b.lx, dy=o.ly-b.ly, dd=Math.hypot(dx, dy); if(dd>=0.15 || dd<1e-5) continue;
        const nx=dx/dd, ny=dy/dd, rv=(b.vx-o.vx)*nx+(b.vy-o.vy)*ny, push=(0.15-dd)/2;
        b.lx-=nx*push; b.ly-=ny*push; o.lx+=nx*push; o.ly+=ny*push;
        if(rv>0){ const j=rv*(1+0.25)/2; b.vx-=j*nx; b.vy-=j*ny; o.vx+=j*nx; o.vy+=j*ny; if(o.st==="board"){ o.st="slide"; } } }
      if(Math.hypot(b.lx, b.ly-Bd.hy)<0.058){ b.st="hole"; C.sound("baghole", b); }
      else if(Math.abs(b.lx)>Bd.TW/2+0.03 || b.ly>Bd.TL/2+0.03 || b.ly<-Bd.TL/2-0.03){                  // (off the side, the back, the front)
        const p=Bd.O.clone().addScaledVector(Bd.ex, b.lx+Math.sign(b.lx)*(Math.abs(b.lx)>Bd.TW/2+0.03 ? 0.12 : 0)).addScaledVector(Bd.ez, b.ly+(b.ly>Bd.TL/2 ? 0.15 : b.ly<-Bd.TL/2 ? -0.15 : 0));
        b.st="grass"; b.p.set(p.x, 0, p.z); }
      else if(Math.hypot(b.vx, b.vy)<0.03){ b.st="board"; b.vx=b.vy=0; }
      C.place(b); } } };
CORN.sound=function(k, b){ if(typeof AUDIO!=="undefined") AUDIO.blip(k, b.p.x, b.p.z); };
CORN.settled=function(){ return !CORN.bags.some(b=>b.st==="fly" || b.st==="slide"); };

/* ---- keys and the mouse (17-player hands them on) -------------------------------------------------------------- */
CORN.key=function(e){ const C=CORN; if(!C.on) return false;
  if(e.code==="Space" && C.ready()){ if(!e.repeat && C.charge<0) C.charge=0; return true; }
  return false; };
CORN.keyup=function(e){ if(e.code==="Space" && CORN.charge>=0) CORN.youThrow(); };
renderer.domElement.addEventListener("mousedown", e=>{ const C=CORN; if(C.on && e.button===0 && C.ready() && C.charge<0 && document.pointerLockElement===renderer.domElement) C.charge=0; });
addEventListener("mouseup", e=>{ if(e.button===0 && CORN.charge>=0) CORN.youThrow(); });

/* ---- each frame (18e's updateGames) ------------------------------------------------------------------------------ */
const _cnA=new T.Vector3(), _cnW=new T.Vector3();
function updateCornhole(dt){
  const C=CORN; if(!C.B1) return;
  if(C.state==="fly" || C.bags.some(b=>b.st==="fly" || b.st==="slide")){ let n=Math.ceil(dt*240); const h=dt/n; while(n--) C.step(h); }
  if(!C.on) return;
  const K=BREWERY.corn;
  // walk off and the game is off
  if(Math.hypot(player.pos.x-C.you.x, player.pos.z-C.you.z)>7){ C.end("YOU WALKED OFF. DANNY: “FINE, I'LL PLAY JESS.”"); return; }
  if(C.state==="fly" && C.settled()){ C.state="pause"; C.wait=0.7; }
  else if(C.state==="pause"){ C.wait-=dt; if(C.wait<=0) C.next(); }
  else if(C.state==="tally"){ C.wait-=dt; if(C.wait<=0){ C.inning++; C.newInning(); } }
  else if(C.state==="over"){ C.wait-=dt; if(C.wait<=0) C.end(null); }
  else if(C.state==="him"){                                     // Danny: a look at the board, the swing, and out of his hand at the bottom of it
    if(C.wait>0){ C.wait-=dt; K.opp.cornSwing=0.5; }
    else { if(C.swing<0) C.swing=0; C.swing+=dt/0.8; K.opp.cornSwing=C.swing*0.42;
      if(C.swing*0.42>=0.27 && C.state==="him"){ C.himThrow(); }
      if(C.swing>=1){ C.swing=-1; K.opp.cornSwing=0.5; } } }
  if(C.state!=="him" && C.swing>=0){ C.swing+=dt/0.8; K.opp.cornSwing=Math.min(0.42, C.swing*0.42); if(C.swing>=1){ C.swing=-1; K.opp.cornSwing=0.5; } }
  // the wind-up: the meter climbs and falls back; the first of the arc as it stands
  const ready=C.ready();
  if(C.charge>=0){ if(!ready){ C.charge=-1; C.power=0; } else { C.charge+=dt; C.power=(1-Math.cos(C.charge*Math.PI/1.0))/2; } } else C.power=0;
  C.panel.querySelector(".bar i").style.width=(C.power*100).toFixed(1)+"%";
  if(C.charge>=0 && ready){ const A=C.arc.geometry.attributes.position, yaw=player.yaw, ang=clamp(player.pitch+0.60, 0.12, 1.2), v0=4+9*C.power, fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    _cnA.set(player.pos.x+fx*0.35, Terrain.groundAt(player.pos.x, player.pos.z)+0.95, player.pos.z+fz*0.35); _cnW.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
    let n=0; for(let i=0;i<240 && n<40;i++){ CORN.flyStep(_cnA, _cnW, 1/120); if(i%6===0){ A.array[n*3]=_cnA.x; A.array[n*3+1]=_cnA.y; A.array[n*3+2]=_cnA.z; n++; } if(_cnW.y<0) break; }
    A.needsUpdate=true; C.arc.geometry.setDrawRange(0, n); C.arc.visible=true; }
  else C.arc.visible=false;
}
// the bags where they lie before anyone plays
if(CORN.B1) CORN.idle();
