"use strict";
/* REST AREA · 18r-lawndarts.js
   lawn darts on Lakeside Park's lawn (14n's park), against Walt, to 21
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18r · LAWN DARTS
   Two rings on the grass thirty-five feet apart, the yellow one at your
   end and the blue one out on the lawn toward the water. `E` by the yellow
   ring asks Walt for a game. The darts are the soft kind sold now: a
   plastic shaft and fins, a rubber-weighted round nose, so they come down
   nose first and stand in the grass where they land.
   Look where you want it to go, hold Space or the mouse button to wind up,
   and let go: an underhand lob, higher the higher you look, the first of its
   arc showing while you wind up. Two darts each an inning, turn about. A
   dart standing inside the ring is three; then the dart nearest the ring's
   middle, if it is within a dart's length of the ring, is one, and its
   owner's other dart one more if it is nearer too. The inning goes to the
   one who scored more, by the difference, and whoever took it throws first
   in the next. First to 21 at the end of an inning wins. Walt throws with
   the same darts through the same air, aiming at the middle, with an old
   hand's spread: a ringer about one throw in three.
   ---------------------------------------------------------------------- */
const LDARTS={on:false, darts:[], order:[], k:0, inning:1, score:[0,0], first:0, state:"idle", charge:-1, power:0, wait:0, swing:-1,
              panel:null, arc:null, A:null, B:null, you:null, him:null, opp:null};
(function lawnDarts(){
  if(typeof EAST==="undefined" || !EAST.park || !LAKESIDE.darts) return;
  const L=LDARTS, D=LAKESIDE.darts; L.A=D.A; L.B=D.B; L.opp=D.opp;
  const d=V3(L.B.x-L.A.x, 0, L.B.z-L.A.z).normalize(), right=V3(-d.z, 0, d.x); L.d=d;
  L.you=V3(L.A.x-d.x*0.4-right.x*0.75, 0, L.A.z-d.z*0.4-right.z*0.75); L.him=V3(L.A.x-d.x*0.4+right.x*0.75, 0, L.A.z-d.z*0.4+right.z*0.75);
  // the darts: a round weighted nose, a tapered plastic shaft, three fins; red for you, blue for Walt. +y is the way the nose points.
  const make=(col)=>{ const E=[], e=(geo,x,y,z,c,ry)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z), new T.Quaternion().setFromEuler(new T.Euler(0, ry||0, 0)), V3(1,1,1)), color:new T.Color(c)});
    e(new T.SphereGeometry(0.026, 12, 9), 0, 0.135, 0, "#1a1a1c"); e(new T.CylinderGeometry(0.022, 0.012, 0.05, 12), 0, 0.10, 0, "#2a2a2c");
    e(new T.CylinderGeometry(0.009, 0.007, 0.24, 8), 0, -0.035, 0, col);
    for(let k=0;k<3;k++) e(new T.BoxGeometry(0.003, 0.09, 0.05).translate(0, 0, 0.03), 0, -0.11, 0, col, k*Math.PI*2/3);
    const m=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5})); m.castShadow=true; m.visible=false; scene.add(m); return m; };
  for(let i=0;i<4;i++) L.darts.push({m:make(i<2 ? "#c8281e" : "#1e5ab8"), who:i<2 ? 0 : 1, st:"hand", p:new T.Vector3(), v:new T.Vector3(), dir:new T.Vector3(0,1,0)});
  { const N=40, g=new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(new Float32Array(N*3), 3).setUsage(T.DynamicDrawUsage)); g.setDrawRange(0, 0);
    L.arc=new T.Points(g, new T.PointsMaterial({color:0xf4e04a, size:4, sizeAttenuation:false, transparent:true, opacity:0.9, depthWrite:false}));
    L.arc.frustumCulled=false; L.arc.visible=false; scene.add(L.arc); }
  const st=document.createElement("style");
  st.textContent="#ldarts{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:14;display:none;min-width:min(440px,92vw);"+
    "background:rgba(14,18,16,0.86);border:1px solid #3a4a40;border-radius:6px;padding:9px 14px;font-family:'JetBrains Mono',monospace;color:#e8ece6;"+
    "box-shadow:0 6px 24px rgba(0,0,0,0.5)}#ldarts.show{display:block}#ldarts .hd{display:flex;justify-content:space-between;gap:12px;align-items:baseline}"+
    "#ldarts .t{font-family:'Oswald',sans-serif;font-size:17px;letter-spacing:.12em}#ldarts .sc{font-size:14px}#ldarts .sc .r{color:#ff7a6a}#ldarts .sc .b{color:#8ab8ff}"+
    "#ldarts .bags{margin-top:6px;font-size:13px;letter-spacing:.2em}#ldarts .bags .r{color:#d8443a}#ldarts .bags .b{color:#4a86d8}#ldarts .bags .x{color:#3a403c}"+
    "#ldarts .msg{margin-top:6px;font-size:13px;color:#cfe0d4;min-height:18px}#ldarts .msg b{color:#f4c430;font-weight:500}"+
    "#ldarts .bar{margin-top:6px;height:8px;background:#2a302c;border-radius:4px;overflow:hidden}#ldarts .bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#7aff9a,#f4c430,#ff6a4a)}"+
    "#ldarts .keys{margin-top:6px;font-size:10px;color:#9aa1ab}#ldarts .keys b{color:#f4c430;font-weight:500}";
  document.head.appendChild(st);
  const el=document.createElement("div"); el.id="ldarts";
  el.innerHTML='<div class="hd"><span class="t">LAWN DARTS</span><span class="sc"></span></div><div class="bags"></div><div class="msg"></div><div class="bar"><i></i></div>'+
    '<div class="keys"><b>LOOK</b> at the blue ring (up is a higher lob) · hold <b>SPACE</b> or the <b>MOUSE</b>, let go to throw · in the ring <b>3</b>, nearest <b>1</b>, the inning by the difference, first to <b>21</b> · <b>E</b> at the ring to stop</div>';
  document.body.appendChild(el); L.panel=el;
  addUse(L.you.x, L.you.z, L.A.y, "PLAY LAWN DARTS WITH WALT", ()=>L.start(), 1.6, ()=>!L.on);
  addUse(L.you.x, L.you.z, L.A.y, "STOP PLAYING LAWN DARTS", ()=>L.end("YOU HAND WALT THE DARTS"), 1.6, ()=>L.on);
})();

/* ---- the darts where they stand ---- */
const _ldQ=new T.Quaternion(), _ldY=new T.Vector3(0,1,0), _ldV=new T.Vector3(), _ldP=new T.Vector3();
LDARTS.place=function(t){ const m=t.m;
  if(t.st==="fly"){ m.position.copy(t.p); _ldV.copy(t.v).normalize(); m.quaternion.setFromUnitVectors(_ldY, _ldV); }
  else if(t.st==="stuck"){ m.position.copy(t.p); m.quaternion.setFromUnitVectors(_ldY, t.dir); }
  m.visible=t.st!=="hand"; };
// where a dart's nose went in
LDARTS.tip=function(t){ return _ldP.copy(t.p).addScaledVector(t.dir, 0.15); };
// stand a dart nose down in the grass at (x, z), leaning back along the way it came
LDARTS.stick=function(t, x, z, hx, hz, lean){ const g=Terrain.groundAt(x, z), h=Math.hypot(hx, hz)||1;
  t.dir.set(hx/h*Math.sin(lean), -Math.cos(lean), hz/h*Math.sin(lean)).normalize();
  t.p.set(x, g-0.03, z).addScaledVector(t.dir, -0.15); t.st="stuck"; LDARTS.place(t); };
// when nobody is playing: two in the blue ring, one just short, one lying by the yellow
LDARTS.idle=function(){ const L=LDARTS, B=L.B, A=L.A;
  const spots=[[B.x+0.12, B.z-0.08, 0.35],[B.x-0.55, B.z+0.25, 0.5],[B.x-0.05, B.z+0.18, 0.3],[A.x+0.2, A.z+0.7, 0.4]];
  L.darts.forEach((t, i)=>{ const s=spots[i]; L.stick(t, s[0], s[1], L.d.x, L.d.z, s[2]); }); };

/* ---- the game ---- */
LDARTS.start=function(){ const L=LDARTS, O=L.opp;
  L.on=true; L.score=[0,0]; L.inning=1; L.first=0; L.panel.classList.add("show");
  if(O){ O.home=O.home||{x:O.x, z:O.z, yaw:O.yaw}; O.x=L.him.x; O.z=L.him.z; O.y=Terrain.groundAt(L.him.x, L.him.z); O.yaw=Math.atan2(L.d.x, L.d.z); O.cornSwing=0.5; }
  REST.go(L.you.x, L.you.z, Math.atan2(-L.d.x, -L.d.z), L.A.y+0.5, -0.06);
  if(typeof AUDIO!=="undefined") AUDIO.blip("jingle", L.you.x, L.you.z);
  toast("WALT: “SOFT ONES, THESE. THE OLD STEEL KIND THEY DON'T SELL NO MORE. RED'S YOURS.”", "#cfe0d4");
  L.newInning(); };
LDARTS.end=function(msg){ const L=LDARTS, O=L.opp; L.on=false; L.state="idle"; L.charge=-1; L.panel.classList.remove("show"); L.arc.visible=false;
  if(O){ O.cornSwing=0.5; if(O.home){ O.x=O.home.x; O.z=O.home.z; O.yaw=O.home.yaw; O.y=Terrain.groundAt(O.x, O.z); } }
  L.idle(); if(msg) toast(msg, "#cfe0d4"); };
LDARTS.newInning=function(){ const L=LDARTS;
  L.darts.forEach(t=>{ t.st="hand"; L.place(t); });
  L.order=[]; for(let i=0;i<2;i++){ L.order.push(L.first); L.order.push(1-L.first); }
  L.k=0; L.next(); };
LDARTS.next=function(){ const L=LDARTS;
  if(L.k>=L.order.length){ L.tally(); return; }
  if(L.order[L.k]===0){ L.state="you"; L.msg(L.k<2 && L.inning===1 ? "YOUR THROW: LOOK AT THE BLUE RING, HOLD <b>SPACE</b>, LET GO" : "YOUR THROW"); }
  else { L.state="him"; L.wait=1.0+Math.random()*0.8; L.msg("WALT'S THROW"); }
  L.draw(); };
LDARTS.msg=function(s){ LDARTS.panel.querySelector(".msg").innerHTML=s; };
LDARTS.draw=function(){ const L=LDARTS, left=w=>L.order.slice(L.k).filter(x=>x===w).length;
  L.panel.querySelector(".sc").innerHTML='<span class="r">YOU '+L.score[0]+'</span> · <span class="b">WALT '+L.score[1]+'</span> · INNING '+L.inning;
  const dots=(w, cls)=>{ let s=""; for(let i=0;i<2;i++) s+='<span class="'+(i<left(w) ? cls : "x")+'">▲</span>'; return s; };
  L.panel.querySelector(".bags").innerHTML=dots(0, "r")+"&nbsp;&nbsp;"+dots(1, "b"); };
// the inning's count: three in the ring; then the nearest, if close enough, one, and its owner's other one more if nearer than the other side's best
LDARTS.RING=0.38; LDARTS.NEAR=0.38+0.42;
LDARTS.count=function(){ const L=LDARTS, B=L.B, pts=[0,0], dist=[[],[]];
  for(const t of L.darts){ if(t.st!=="stuck") continue; const q=L.tip(t), dd=Math.hypot(q.x-B.x, q.z-B.z); if(dd<L.RING) pts[t.who]+=3; else dist[t.who].push(dd); }
  const best=w=>dist[w].length ? Math.min(...dist[w]) : 1e9, b0=best(0), b1=best(1), w=b0<b1 ? 0 : 1, wb=Math.min(b0, b1);
  if(wb<L.NEAR) pts[w]+=dist[w].filter(v=>v<best(1-w) && v<L.NEAR).length;
  return pts; };
LDARTS.tally=function(){ const L=LDARTS, pts=L.count(), dif=pts[0]-pts[1], who=dif>0 ? 0 : dif<0 ? 1 : -1;
  if(who>=0){ L.score[who]+=Math.abs(dif); L.first=who; }
  const say=n=>n===0 ? "NOTHING" : n+(n===1 ? " POINT" : " POINTS");
  L.msg("YOU "+say(pts[0])+", WALT "+say(pts[1])+" · "+(who<0 ? "THEY CANCEL: NO SCORE" : (who===0 ? "<b>YOU TAKE "+Math.abs(dif)+"</b>" : "WALT TAKES "+Math.abs(dif))));
  L.draw(); L.state="tally"; L.wait=3.2;
  if(L.score[0]>=21 || L.score[1]>=21){ L.state="over"; L.wait=4.5;
    const won=L.score[0]>L.score[1], line=won ? "YOU WIN, "+L.score[0]+" TO "+L.score[1]+". WALT: “WELL, I'LL BE. AGAIN?”" : "WALT WINS, "+L.score[1]+" TO "+L.score[0]+". “FORTY YEARS OF PRACTICE. ANOTHER?”";
    toast(line, won ? "#f4c430" : "#cfe0d4"); L.msg(line); if(won && typeof AUDIO!=="undefined") AUDIO.blip("jingle", L.you.x, L.you.z); } };
LDARTS.ready=function(){ const L=LDARTS; return L.on && L.state==="you" && !seated && !driving && Math.hypot(player.pos.x-L.you.x, player.pos.z-L.you.z)<1.4; };

/* ---- a throw: underhand from knee height a step out, up at the angle you look plus a lob's worth ---- */
const LD_G=9.8, LD_K=0.010;
LDARTS.flyStep=function(p, v, h){ const s=v.length(); v.x-=LD_K*s*v.x*h; v.z-=LD_K*s*v.z*h; v.y-=(LD_G+LD_K*s*v.y)*h; p.addScaledVector(v, h); };
LDARTS.launch=function(t, from, yaw, ang, v0){ const fx=-Math.sin(yaw), fz=-Math.cos(yaw);
  t.p.set(from.x+fx*0.4, Terrain.groundAt(from.x, from.z)+0.75, from.z+fz*0.4); t.v.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
  t.st="fly"; t.m.visible=true; LDARTS.state="fly"; LDARTS.k++; LDARTS.draw(); if(typeof AUDIO!=="undefined") AUDIO.blip("tick", from.x, from.z); };
LDARTS.youThrow=function(){ const L=LDARTS, pw=L.power; L.charge=-1; L.power=0; if(!L.ready()) return;
  const t=L.darts.find(q=>q.who===0 && q.st==="hand"); if(!t) return;
  L.launch(t, player.pos, player.yaw, clamp(player.pitch+0.80, 0.25, 1.35), 4+10*pw); };
// Walt: the speed that brings the nose down at a spot, found by trying it; then his hand's spread on the way and the strength
LDARTS.solve=function(from, tx, tz, ang){ const yaw=Math.atan2(-(tx-from.x), -(tz-from.z)), D=Math.hypot(tx-from.x, tz-from.z), p=new T.Vector3(), v=new T.Vector3();
  let lo=3, hi=18; const gy=Terrain.groundAt(tx, tz);
  for(let it=0;it<24;it++){ const v0=(lo+hi)/2, fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    p.set(from.x+fx*0.4, Terrain.groundAt(from.x, from.z)+0.75, from.z+fz*0.4); v.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
    let reach=0; for(let i=0;i<800;i++){ LDARTS.flyStep(p, v, 1/120); if(v.y<0 && p.y<gy+0.1){ reach=Math.hypot(p.x-from.x, p.z-from.z); break; } }
    if(reach<D) lo=v0; else hi=v0; }
  return {yaw:yaw, v0:(lo+hi)/2}; };
LDARTS.himThrow=function(){ const L=LDARTS, t=L.darts.find(q=>q.who===1 && q.st==="hand"); if(!t) return;
  const g=()=>(Math.random()+Math.random()+Math.random()-1.5)*0.82, ang=0.85+g()*0.04;
  const S=L.solve(L.him, L.B.x, L.B.z, ang);
  L.launch(t, L.him, S.yaw+g()*0.1, ang, S.v0*(1+g()*0.05)); };

/* ---- in the air, and into the grass ---- */
LDARTS.step=function(h){ const L=LDARTS;
  for(const t of L.darts){ if(t.st!=="fly") continue;
    L.flyStep(t.p, t.v, h); _ldV.copy(t.v).normalize();
    const nose=_ldP.copy(t.p).addScaledVector(_ldV, 0.15), g=Terrain.groundAt(nose.x, nose.z);
    if(nose.y<=g+0.05){ const lean=Math.min(0.75, Math.acos(clamp(-_ldV.y, -1, 1)));      // (nose first: it stands no flatter than this)
      L.stick(t, nose.x, nose.z, t.v.x, t.v.z, lean); if(typeof AUDIO!=="undefined") AUDIO.blip("thump", nose.x, nose.z); }
    else L.place(t); } };
LDARTS.settled=function(){ return !LDARTS.darts.some(t=>t.st==="fly"); };

/* ---- keys and the mouse (17-player hands them on) ---- */
LDARTS.key=function(e){ const L=LDARTS; if(!L.on) return false;
  if(e.code==="Space" && L.ready()){ if(!e.repeat && L.charge<0) L.charge=0; return true; }
  return false; };
LDARTS.keyup=function(e){ if(e.code==="Space" && LDARTS.charge>=0) LDARTS.youThrow(); };
renderer.domElement.addEventListener("mousedown", e=>{ const L=LDARTS; if(L.on && e.button===0 && L.ready() && L.charge<0 && document.pointerLockElement===renderer.domElement) L.charge=0; });
addEventListener("mouseup", e=>{ if(e.button===0 && LDARTS.charge>=0) LDARTS.youThrow(); });

/* ---- each frame (18e's updateGames) ---- */
const _ldA=new T.Vector3(), _ldW=new T.Vector3();
function updateLawnDarts(dt){
  const L=LDARTS; if(!L.B) return;
  if(L.darts.some(t=>t.st==="fly")){ let n=Math.ceil(dt*240); const h=dt/n; while(n--) L.step(h); }
  if(!L.on) return;
  const O=L.opp;
  if(Math.hypot(player.pos.x-L.you.x, player.pos.z-L.you.z)>7){ L.end("YOU WALKED OFF. WALT: “SUIT YOURSELF.”"); return; }
  if(L.state==="fly" && L.settled()){ L.state="pause"; L.wait=0.8; }
  else if(L.state==="pause"){ L.wait-=dt; if(L.wait<=0) L.next(); }
  else if(L.state==="tally"){ L.wait-=dt; if(L.wait<=0){ L.inning++; L.newInning(); } }
  else if(L.state==="over"){ L.wait-=dt; if(L.wait<=0) L.end(null); }
  else if(L.state==="him"){
    if(L.wait>0){ L.wait-=dt; if(O) O.cornSwing=0.5; }
    else { if(L.swing<0) L.swing=0; L.swing+=dt/0.8; if(O) O.cornSwing=L.swing*0.42;
      if(L.swing*0.42>=0.27 && L.state==="him") L.himThrow();
      if(L.swing>=1){ L.swing=-1; if(O) O.cornSwing=0.5; } } }
  if(L.state!=="him" && L.swing>=0){ L.swing+=dt/0.8; if(O) O.cornSwing=Math.min(0.42, L.swing*0.42); if(L.swing>=1){ L.swing=-1; if(O) O.cornSwing=0.5; } }
  const ready=L.ready();
  if(L.charge>=0){ if(!ready){ L.charge=-1; L.power=0; } else { L.charge+=dt; L.power=(1-Math.cos(L.charge*Math.PI/1.0))/2; } } else L.power=0;
  L.panel.querySelector(".bar i").style.width=(L.power*100).toFixed(1)+"%";
  if(L.charge>=0 && ready){ const A=L.arc.geometry.attributes.position, yaw=player.yaw, ang=clamp(player.pitch+0.80, 0.25, 1.35), v0=4+10*L.power, fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    _ldA.set(player.pos.x+fx*0.4, Terrain.groundAt(player.pos.x, player.pos.z)+0.75, player.pos.z+fz*0.4); _ldW.set(fx*Math.cos(ang)*v0, Math.sin(ang)*v0, fz*Math.cos(ang)*v0);
    let n=0; for(let i=0;i<300 && n<40;i++){ LDARTS.flyStep(_ldA, _ldW, 1/120); if(i%6===0){ A.array[n*3]=_ldA.x; A.array[n*3+1]=_ldA.y; A.array[n*3+2]=_ldA.z; n++; } if(_ldW.y<0) break; }
    A.needsUpdate=true; L.arc.geometry.setDrawRange(0, n); L.arc.visible=true; }
  else L.arc.visible=false;
}
if(LDARTS.B) LDARTS.idle();
