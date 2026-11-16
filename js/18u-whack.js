"use strict";
/* REST AREA · 18u-whack.js
   the arcade's whack-a-chuck machine
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18u · WHACK-A-CHUCK
   A machine you stand at, not a screen: a red box against the arcade's
   front wall (12c) with a patch of lawn for a top, six burrows in it and
   a woodchuck under each. They come up; you hit them with the mallet.
   Thirty seconds a game, quicker as it goes. Ten for a chuck, twenty-five
   for the one in the hard hat.

   The mouse carries the mallet over the lawn and a click brings it down;
   or Q W E (the back row) and A S D (the front) hit a burrow outright.
   N starts again, Esc or E steps away. ENTER plays it (17), as it does
   every game down here. Nobody at it, a chuck looks out now and then.

   Built here, after the room, the way 18h's dozer is: its own group and
   meshes, the six chucks one geometry, the readout a canvas on the
   backboard. The best score is kept in the browser.
   ---------------------------------------------------------------------- */
const WHACK={on:false, t:0, g:null, cab:null, hi:0, acc:0, keys:{}, demoT:2};
(function whackBuild(){
  const A=ARCADE.room; if(!A) return;
  const P={x:77.3, z:A.z1-0.50, y:A.y};                    // its middle, half a metre off the front wall, its face to the room
  const W=1.12, DP=0.84, TOP=0.84;
  const G=new T.Group(); G.position.set(P.x, P.y, P.z); G.rotation.y=Math.PI; scene.add(G);   // local +z: out of its front
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c)=>ent(boxGeo(w,h,d),x,y,z,c);
  const RED="#a02a1e", TRIM="#e8d8a8", DARK="#1a1612";
  B(W, TOP-0.04, DP, 0, (TOP-0.04)/2, 0, RED);                                    // the box
  B(W+0.03, 0.04, DP+0.03, 0, TOP-0.02, 0, TRIM);                                 // the top's rim, a little wider
  B(W-0.20, 0.10, 0.012, 0, 0.56, DP/2+0.008, TRIM);                              // a plate on its front (the lettering below)
  for(const sx of [-1,1]){ B(0.05, 0.16, DP, sx*(W/2-0.01), TOP+0.08, 0, RED);    // low sides round the lawn
    B(0.06, 0.02, DP+0.02, sx*(W/2-0.01), TOP+0.17, 0, TRIM); }
  // the backboard: a barn end, the readout on it
  B(W, 0.86, 0.08, 0, TOP+0.43, -DP/2+0.04, RED);
  B(W+0.06, 0.05, 0.14, 0, TOP+0.885, -DP/2+0.05, TRIM);
  for(const sx of [-1,1]) B(0.04, 0.86, 0.10, sx*(W/2+0.005), TOP+0.43, -DP/2+0.045, TRIM);
  // the mallet's rest, on the right
  B(0.03, 0.10, 0.03, W/2-0.11, TOP+0.05, DP/2-0.06, DARK); B(0.03, 0.10, 0.03, W/2-0.11, TOP+0.05, DP/2-0.20, DARK);
  const body=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.1}));
  body.castShadow=true; body.receiveShadow=true; G.add(body);
  // the lawn: a picture laid on the top, the burrows drawn in it, each burrow's mouth a dark disc clear of it
  const HOLES=[]; for(const z of [-0.14, 0.17]) for(const x of [-0.34, 0, 0.34]) HOLES.push({x:x, z:z});
  const HR=0.108, LW=W-0.12, LD=DP-0.16, LZ=0.03;
  { const tex=signTex(512, 360, (c, Wc, Hc)=>{
      c.fillStyle="#3c6a2a"; c.fillRect(0,0,Wc,Hc);
      for(let i=0;i<900;i++){ c.strokeStyle=["#4a7a30","#2f5a22","#588a38","#35602a"][i%4]; c.lineWidth=1.5; const x=(i*197.3)%Wc, y=(i*89.7)%Hc;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x+((i*7)%5)-2, y-5-((i*3)%4)); c.stroke(); }
      for(const h of HOLES){ const px=(h.x/LW+0.5)*Wc, py=((h.z-LZ)/LD+0.5)*Hc, rx=HR/LW*Wc, ry=HR/LD*Hc;
        c.fillStyle="#5a4028"; c.beginPath(); c.ellipse(px, py, rx*1.34, ry*1.34, 0, 0, 7); c.fill();
        c.fillStyle="#6e5236"; for(let k=0;k<26;k++){ const a=k*2.4, r=1.08+((k*37)%10)*0.03; c.beginPath(); c.arc(px+Math.cos(a)*rx*r, py+Math.sin(a)*ry*r, 3+(k%3), 0, 7); c.fill(); } } });
    const m=new T.Mesh(new T.PlaneGeometry(LW, LD), new T.MeshStandardMaterial({map:tex, roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(0, TOP+0.008, LZ); m.receiveShadow=true; G.add(m);
    const hg=[]; for(const h of HOLES) hg.push({geo:new T.CircleGeometry(HR, 24).rotateX(-Math.PI/2), matrix:new T.Matrix4().makeTranslation(h.x, TOP+0.016, h.z), color:new T.Color("#0c0806")});
    G.add(new T.Mesh(mergeEntries(hg), new T.MeshBasicMaterial({vertexColors:true}))); }
  // a woodchuck: one geometry, six of them; its feet at 0, the top of its head at about 0.25
  const chuckGeo=(()=>{ const C=[], add=(g,x,y,z,c,sx,sy,sz)=>C.push({geo:g, matrix:new T.Matrix4().compose(V3(x,y,z), new T.Quaternion(), V3(sx||1,sy||1,sz||1)), color:new T.Color(c)});
    const FUR="#7a5a38", PALE="#b89868", S=(r)=>new T.SphereGeometry(r, 14, 10);
    add(new T.CylinderGeometry(0.080, 0.086, 0.16, 16), 0, 0.08, 0, FUR);
    add(S(0.084), 0, 0.17, 0, FUR, 1, 0.95, 1);                                   // the head
    add(S(0.050), 0, 0.150, 0.052, PALE, 1, 0.8, 1);                              // the muzzle
    add(S(0.016), 0, 0.166, 0.098, "#1a1210");                                    // the nose
    for(const sx of [-1,1]){ add(S(0.020), sx*0.058, 0.232, -0.010, "#5a4028", 1, 1, 0.6);   // ears
      add(S(0.013), sx*0.036, 0.196, 0.070, "#0c0a08");                           // eyes
      add(boxGeo(0.014, 0.022, 0.008), sx*0.009, 0.128, 0.094, "#f4f0e2");        // the teeth
      add(S(0.022), sx*0.074, 0.070, 0.040, PALE, 1, 1.4, 1); }                   // paws
    return mergeEntries(C); })();
  const fur=new T.MeshStandardMaterial({vertexColors:true, roughness:0.85});
  const hatM=new T.MeshStandardMaterial({color:0xf2c81e, roughness:0.4});
  const hatGeo=(()=>{ const C=[{geo:new T.SphereGeometry(0.078, 14, 8, 0, Math.PI*2, 0, Math.PI/2), matrix:new T.Matrix4().makeTranslation(0, 0.215, 0), color:new T.Color(1,1,1)},
      {geo:new T.CylinderGeometry(0.098, 0.098, 0.010, 18), matrix:new T.Matrix4().makeTranslation(0, 0.218, 0.012), color:new T.Color(1,1,1)}]; return mergeEntries(C); })();
  const DOWN=-0.275;                                                             // how far under the lawn one waits
  const chucks=HOLES.map(h=>{ const g=new T.Group(); g.position.set(h.x, TOP+DOWN, h.z);
    const m=new T.Mesh(chuckGeo, fur); m.castShadow=true; g.add(m);
    const hat=new T.Mesh(hatGeo, hatM); hat.scale.setScalar(0.001); g.add(hat);  // (the hard hat is always there, and nothing until it is worn)
    G.add(g); return {g:g, hat:hat, x:h.x, z:h.z, u:0, st:0, t:0, hold:0, gold:false, hit:0}; });
  // the mallet
  const mal=new T.Group(); mal.rotation.order="YXZ";
  { const h=new T.Mesh(new T.CylinderGeometry(0.014, 0.016, 0.30, 10), new T.MeshStandardMaterial({color:0xc8a060, roughness:0.6})); h.rotation.x=Math.PI/2; h.position.z=0.17; mal.add(h);
    const hd=new T.Mesh(new T.CylinderGeometry(0.050, 0.050, 0.13, 18), new T.MeshStandardMaterial({color:0x1e1e22, roughness:0.5})); mal.add(hd);
    const band=new T.Mesh(new T.CylinderGeometry(0.052, 0.052, 0.03, 18), new T.MeshStandardMaterial({color:0xf2c81e, roughness:0.5})); mal.add(band); }
  G.add(mal);
  // the readout on the backboard, and the name over it
  const rc=cvs(512, 320), rtex=setSRGB(new T.CanvasTexture(rc)); rtex.minFilter=T.LinearFilter;
  { const m=new T.Mesh(new T.PlaneGeometry(0.96, 0.60), new T.MeshBasicMaterial({map:rtex, toneMapped:false})); m.position.set(0, TOP+0.50, -DP/2+0.092); G.add(m); }
  { const t=signTex(420, 60, (c, Wc, Hc)=>{ c.fillStyle="#e8d8a8"; c.fillRect(0,0,Wc,Hc); c.fillStyle="#a02a1e"; fitText(c, "TEN A CHUCK · 25 THE FOREMAN", Wc*0.84, Hc*0.56, Wc/2, Hc/2, "900", "'Arial Black', Arial"); });
    const m=new T.Mesh(new T.PlaneGeometry(W-0.24, 0.085), new T.MeshStandardMaterial({map:t, roughness:0.6})); m.position.set(0, 0.56, DP/2+0.026); G.add(m); }
  G.updateMatrixWorld(true); body.matrixAutoUpdate=false;
  // its light, over the lawn (BURIED: the arcade's, 12c)
  LAMPS.push({x:P.x, y:P.y+2.1, z:P.z-0.25, color:0xfff0d8, intensity:0.7, dist:4.5, decay:1.5, under:true, indoor:true, circ:"bldg"});
  addCol(P.x-W/2-0.03, P.x+W/2+0.03, P.z-DP/2-0.02, A.z1, A.y-0.5, A.y+TOP+0.9);
  const st={x:P.x, z:P.z-DP/2-0.62};
  addUse(st.x, st.z-0.1, A.y, "PLAY WHACK-A-CHUCK", ()=>WHACK.start(), 0.9).game=true;
  ARCADE.games.push({name:"WHACK-A-CHUCK", x:st.x, z:st.z});
  WHACK.cab={G:G, P:P, TOP:TOP, DOWN:DOWN, HR:HR, HX:LW/2-0.05, Z0:LZ-LD/2+0.05, Z1:LZ+LD/2-0.05, chucks:chucks, mal:mal, rest:{x:W/2-0.11, z:DP/2-0.13},
             read:{c:rc, x:rc.getContext("2d"), tex:rtex}, stand:st, floor:A.y};
})();

/* ---- the game ------------------------------------------------------------ */
const _WK={LEN:30, KEYS:{KeyQ:0, KeyW:1, KeyE:2, KeyA:3, KeyS:4, KeyD:5}};
function _wkSnd(k){ const C=WHACK.cab; if(typeof AUDIO!=="undefined" && C) AUDIO.blip(k, C.P.x, C.P.z); }
try{ WHACK.hi=+(localStorage.getItem("restarea.arcade.whack")||0)||0; }catch(e){}
WHACK.newGame=function(){ const C=WHACK.cab; for(const c of C.chucks){ c.st=0; c.hit=0; }
  return {score:0, left:_WK.LEN, next:0.6, hits:0, ups:0, over:false, ax:0, az:0.02, swing:0, sx:0, sz:0, pop:0, popT:0, flash:0}; };
// one comes up: a burrow with nobody in it
function _wkUp(g, hold){ const C=WHACK.cab, free=C.chucks.filter(c=>c.st===0 && c.u<=0.01); if(!free.length) return;
  const c=free[(Math.random()*free.length)|0]; c.st=1; c.t=0; c.hold=hold; c.hit=0; c.gold=Math.random()<0.14; c.hat.scale.setScalar(c.gold ? 1 : 0.001);
  if(g) g.ups++; _wkSnd("pop"); }
// the mallet down at (x, z): whoever is up under it
WHACK.hitAt=function(x, z){
  const g=WHACK.g, C=WHACK.cab; if(!g || g.over || g.swing>0.10) return;
  g.swing=0.22; g.sx=x; g.sz=z;
  let best=null, bd=C.HR*1.25; for(const c of C.chucks){ const d=Math.hypot(c.x-x, c.z-z); if(d<bd && c.st>0 && c.st<3 && c.u>0.35){ bd=d; best=c; } }
  if(best){ best.st=3; best.t=0; best.hit=1; const v=best.gold ? 25 : 10; g.score+=v; g.hits++; g.pop=v; g.popT=0.7; g.flash=1; _wkSnd(best.gold ? "jingle" : "thump"); }
  else _wkSnd("tick"); };
WHACK.start=function(){
  const C=WHACK.cab; if(!C || WHACK.on) return;
  for(const o of [typeof DARTS!=="undefined" && DARTS, typeof HOCKEY!=="undefined" && HOCKEY, typeof HOOPS!=="undefined" && HOOPS, typeof RAIDERS!=="undefined" && RAIDERS,
                  typeof CABS!=="undefined" && CABS, typeof DOZER!=="undefined" && DOZER, typeof SKEE!=="undefined" && SKEE]) if(o && o.on) o.stop();
  if(seated) standUp();
  WHACK.on=true; WHACK.keys={}; clearKeys(); WHACK.g=WHACK.newGame(); _wkSnd("coin");
  toast("MOUSE · THE MALLET   CLICK · WHACK   Q W E / A S D · A BURROW   N · AGAIN   ESC · STEP AWAY","#ffd247");
};
WHACK.stop=function(){ WHACK.on=false; WHACK.keys={}; player.pitch=-0.1; WHACK.g=null; for(const c of WHACK.cab.chucks) if(c.st>0 && c.st<3){ c.st=3; c.t=0; } };
WHACK.key=function(e){
  if(e.code==="Escape" || e.code==="Tab" || (e.code==="KeyE" && WHACK.g && WHACK.g.over)){ if(!e.repeat) WHACK.stop(); return; }
  if(e.repeat) return;
  const g=WHACK.g; if(!g) return;
  if(e.code==="KeyN" || (g.over && g.overT>0.8 && (e.code==="Space" || e.code==="Enter"))){ WHACK.g=WHACK.newGame(); _wkSnd("coin"); return; }
  const k=_WK.KEYS[e.code]; if(k!==undefined){ const c=WHACK.cab.chucks[k]; g.ax=c.x; g.az=c.z; WHACK.hitAt(c.x, c.z); return; }
  if(e.code==="Space") WHACK.hitAt(g.ax, g.az);
};
// (the machine's own +x is your right as you face it, and its +z is toward you)
WHACK.mouse=function(dx, dy){ const g=WHACK.g, C=WHACK.cab; if(!g) return; g.ax=clamp(g.ax+dx*0.0016, -C.HX, C.HX); g.az=clamp(g.az+dy*0.0016, C.Z0, C.Z1); };
{ let down=null;
  renderer.domElement.addEventListener("mousedown", e=>{ if(!WHACK.on || e.button!==0 || !WHACK.g) return;
    if(document.pointerLockElement===renderer.domElement) WHACK.hitAt(WHACK.g.ax, WHACK.g.az); else down=[e.clientX, e.clientY]; });
  addEventListener("mouseup", e=>{ if(WHACK.on && WHACK.g && down && Math.hypot(e.clientX-down[0], e.clientY-down[1])<6) WHACK.hitAt(WHACK.g.ax, WHACK.g.az); down=null; }); }
function _wkReadout(g){
  const R=WHACK.cab.read, x=R.x, W=512, H=320, t=WHACK.t;
  x.fillStyle="#7a1e14"; x.fillRect(0,0,W,H);
  x.strokeStyle="#e8d8a8"; x.lineWidth=6; x.strokeRect(8,8,W-16,H-16);
  x.beginPath(); x.moveTo(8,8); x.lineTo(W-8,150); x.moveTo(W-8,8); x.lineTo(8,150); x.moveTo(8,150); x.lineTo(W-8,150); x.stroke();   // (a barn door's braces)
  x.fillStyle="#7a1e14"; x.fillRect(60, 30, W-120, 96);
  x.textAlign="center"; x.textBaseline="middle"; x.lineJoin="round";
  x.fillStyle="#f2c81e"; x.strokeStyle="#2a0c08"; x.lineWidth=8; x.font="900 56px 'Arial Black', Arial";
  { let f=56; while(f>20 && x.measureText("WHACK-A-CHUCK").width>W*0.74){ f-=2; x.font="900 "+f+"px 'Arial Black', Arial"; } }
  x.strokeText("WHACK-A-CHUCK", W/2, 78); x.fillText("WHACK-A-CHUCK", W/2, 78);
  x.fillStyle="#0a0604"; x.fillRect(40, 170, W-80, 122);
  const led=(s, px, py, f, col, w)=>{ x.font="bold "+f+"px 'Courier New', monospace"; while(f>12 && x.measureText(s).width>w){ f-=2; x.font="bold "+f+"px 'Courier New', monospace"; } x.fillStyle=col; x.fillText(s, px, py); };
  if(g && !g.over){ led("SCORE "+("000"+g.score).slice(-3), 150, 212, 40, g.flash>0.3 ? "#fff3b0" : "#ffd247", 190);
    led("TIME "+("00"+Math.ceil(g.left)).slice(-2), 372, 212, 40, g.left<6 && ((t*4)|0)%2 ? "#ff5a3a" : "#3df3ff", 170);
    led(g.popT>0 ? "+"+g.pop+(g.pop>10 ? " · THE FOREMAN" : "") : "BEST "+("000"+WHACK.hi).slice(-3), W/2, 262, 30, g.popT>0 ? "#7aff7a" : "#8a8aa0", 380); }
  else if(g){ led("TIME · "+g.score+" POINTS", W/2, 208, 38, "#ffd247", 400); led(g.hits+" OF "+g.ups+(g.score>=WHACK.hi && g.score>0 ? " · THE BEST YET" : " · BEST "+WHACK.hi), W/2, 248, 26, "#3df3ff", 400);
    led("SPACE TO PLAY AGAIN", W/2, 278, 20, ((t*2)|0)%2 ? "#ff3ecb" : "#8a8aa0", 400); }
  else { led("ENTER TO PLAY", W/2, 212, 40, ((t*2)|0)%2 ? "#ffd247" : "#ff3ecb", 400); led("BEST "+("000"+WHACK.hi).slice(-3), W/2, 262, 30, "#3df3ff", 380); }
  R.tex.needsUpdate=true;
}
function updateWhack(dt){
  const C=WHACK.cab; if(!C) return;
  WHACK.t+=dt;
  const cam=camera.position, near=Math.hypot(cam.x-C.P.x, cam.z-C.P.z)<12 && Math.abs(cam.y-(C.floor+1.5))<3;
  if(!WHACK.on && !near) return;
  const g=WHACK.g, live=WHACK.on && g && !g.over;
  if(live){ g.left-=dt; const k=1-g.left/_WK.LEN;                                 // (0 at the start to 1 at the bell)
    g.next-=dt; if(g.next<=0){ g.next=0.78-0.42*k+Math.random()*0.25; _wkUp(g, 1.15-0.55*k); if(k>0.55 && Math.random()<0.35) _wkUp(g, 0.95-0.4*k); }
    if(g.left<=0){ g.left=0; g.over=true; g.overT=0; for(const c of C.chucks) if(c.st>0 && c.st<3){ c.st=2; c.t=9; }
      if(g.score>WHACK.hi){ WHACK.hi=g.score; try{ localStorage.setItem("restarea.arcade.whack", String(g.score)); }catch(e){} } _wkSnd("jingle"); } }
  else if(!WHACK.on){ WHACK.demoT-=dt; if(WHACK.demoT<=0){ WHACK.demoT=1.6+Math.random()*2.5; _wkUp(null, 1.3); } }
  if(g){ g.swing=Math.max(0, g.swing-dt); g.popT=Math.max(0, g.popT-dt); g.flash=Math.max(0, g.flash-dt*3); if(g.over) g.overT+=dt; }
  // each chuck: up (1), looking round (2), knocked or going down (3)
  for(const c of C.chucks){ c.t+=dt;
    if(c.st===1){ c.u=Math.min(1, c.u+dt/0.11); if(c.u>=1){ c.st=2; c.t=0; } }
    else if(c.st===2){ if(c.t>c.hold){ c.st=3; c.t=0; } }
    else if(c.st===3){ c.u=Math.max(0, c.u-dt/(c.hit ? 0.07 : 0.16)); if(c.u<=0){ c.st=0; c.hit=0; } }
    const bob=c.st===2 ? Math.sin(c.t*9)*0.006 : 0;
    c.g.position.y=C.TOP+C.DOWN*(1-c.u)+0.012+bob; c.g.rotation.y=c.st===2 ? Math.sin(c.t*3.1+c.x*9)*0.5 : 0;
    c.g.scale.set(1+c.hit*0.12, 1-c.hit*0.25, 1+c.hit*0.12); }
  // the mallet: over the lawn in your hand, down and back when swung; on its rest when nobody has it
  { const m=C.mal;
    if(WHACK.on && g){ const s=g.swing>0 ? Math.sin((1-g.swing/0.22)*Math.PI) : 0, x=g.swing>0 ? g.sx : g.ax, z=g.swing>0 ? g.sz : g.az;
      m.position.set(x, C.TOP+0.33-s*0.14, z+0.02); m.rotation.set(-0.25+s*0.25, 0, 0.0); }
    else { m.position.set(C.rest.x, C.TOP+0.155, C.rest.z-0.10); m.rotation.set(0, 0, 0); } }
  WHACK.acc+=dt; if(WHACK.acc>1/12){ WHACK.acc=0; _wkReadout(g); }
  if(WHACK.on){ player.pos.set(C.stand.x, 0, C.stand.z); player.feetY=C.floor; player.yaw=Math.PI; player.pitch=-0.60; }
}
if(WHACK.cab){ updateWhack(0); _wkReadout(null); }
