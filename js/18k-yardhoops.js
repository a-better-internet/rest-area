"use strict";
/* REST AREA · 18k-yardhoops.js
   shooting baskets at the hoops in the yards and over the drives on Lake Street
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18k · THE HOOP OVER THE DRIVE
   Every hoop 14n puts up (YARD_HOOPS: its rim, its board, the way it
   faces, the ground under it) can be shot at. E in front of it takes the
   ball. Aim with the view: the higher you look the higher the arc. Hold
   Space or the mouse button and the power rises and falls; let go to
   shoot. The ball is a ball: it rattles round the rim, comes off the
   board, the pole, the drive and the garage, and bounces and rolls. A
   make drops through and swings the net; a swish touches nothing; from
   past the three-point distance it is a three. Walk to the rebound to pick
   it up, or it comes back to you. E again by the hoop puts it down.
   Keys come through 17's keydown chain (YARDHOOP.key, keyup), the frame
   through 18e's updateGames.
   ---------------------------------------------------------------------- */
const YARDHOOP=(function(){
  const H={on:false, held:false, hoop:null, key:()=>false, keyup:()=>{}, frame:()=>{}};
  if(typeof YARD_HOOPS==="undefined" || !YARD_HOOPS.length) return H;
  const RB=0.12, RT=0.014, G=9.8;
  // the ball: orange, pebbled, its black seams
  const tex=signTex(256, 128, (c, W, Hh)=>{
    c.fillStyle="#c9581c"; c.fillRect(0, 0, W, Hh);
    for(let i=0;i<1400;i++){ c.fillStyle=Math.random()<0.5 ? "rgba(90,30,8,0.18)" : "rgba(255,170,110,0.12)"; c.fillRect(Math.random()*W, Math.random()*Hh, 1.5, 1.5); }
    c.strokeStyle="#1d1410"; c.lineWidth=3;
    c.beginPath(); c.moveTo(0, Hh/2); c.lineTo(W, Hh/2); c.stroke();
    for(const u of [0, 0.5]){ c.beginPath(); c.moveTo(W*(u+0.25), 0); c.lineTo(W*(u+0.25), Hh); c.stroke(); }
    for(const u of [0, 0.5]){ c.beginPath(); for(let k=0;k<=24;k++){ const v=k/24; c.lineTo(W*(u+0.25)+Math.sin(v*Math.PI)*W*0.17, v*Hh); } c.stroke(); }
  });
  const ball=new T.Mesh(new T.SphereGeometry(RB, 20, 14), new T.MeshStandardMaterial({map:tex, roughness:0.8}));
  ball.castShadow=true; ball.visible=false; scene.add(ball);
  // a net under each rim, white cord in a diamond weave, that swings when one goes through
  const netTex=signTex(64, 64, (c, W, Hh)=>{ c.clearRect(0, 0, W, Hh); c.strokeStyle="#f2f0ea"; c.lineWidth=3;
    for(let k=-1;k<=2;k++){ c.beginPath(); c.moveTo(k*W/2, 0); c.lineTo(k*W/2+W, Hh); c.stroke(); c.beginPath(); c.moveTo(k*W/2+W, 0); c.lineTo(k*W/2, Hh); c.stroke(); } });
  netTex.wrapS=netTex.wrapT=T.RepeatWrapping; netTex.repeat.set(6, 2);
  const netMat=new T.MeshStandardMaterial({map:netTex, transparent:true, alphaTest:0.35, side:T.DoubleSide, roughness:0.9, depthWrite:false});
  for(const hp of YARD_HOOPS){
    const n=new T.Mesh(new T.CylinderGeometry(hp.rim.r-0.012, 0.15, 0.40, 14, 1, true), netMat);
    n.position.set(hp.rim.x, hp.rim.y-0.21, hp.rim.z); scene.add(n); hp.net=n; hp.swing=0;
    // E in front of it: the ball (pri: by the hoop, E is the game's before a door's)
    const ux=hp.rim.x, uz=hp.rim.z+hp.f*3.2;
    addUse(ux, uz, hp.y, "SHOOT BASKETS", ()=>start(hp), 2.2,
      ()=>!H.on && !(typeof ZOMBIE!=="undefined" && ZOMBIE.on) && !driving).pri=true;
    addUse(ux, uz, hp.y, "PUT THE BALL DOWN", ()=>stop("YOU LEAVE THE BALL BY THE HOOP"), 2.2, ()=>H.on && H.hoop===hp).pri=true;
  }
  // the card: made of taken, the streak, and the power while you wind up
  const card=document.createElement("div"); card.id="yhoop";
  card.innerHTML='<div class="t"></div><div class="m"><i></i></div><div class="r"></div>';
  const st=document.createElement("style"); st.textContent=`
    #yhoop{position:fixed;left:50%;bottom:9%;transform:translateX(-50%);display:none;pointer-events:none;z-index:9;text-align:center;
      font-family:"Oswald",Arial,sans-serif;color:#f4ead8;letter-spacing:.12em;text-shadow:0 2px 8px #000}
    #yhoop .t{font-size:15px;opacity:.9}
    #yhoop .m{width:220px;height:8px;margin:8px auto 0;border:1px solid rgba(244,234,216,.6);border-radius:4px;overflow:hidden;opacity:0;transition:opacity .15s}
    #yhoop .m i{display:block;height:100%;width:0;background:linear-gradient(90deg,#e8a040,#e6531c)}
    #yhoop .r{font-size:30px;font-weight:700;margin-top:6px;letter-spacing:.2em;opacity:0;transition:opacity .25s}`;
  document.head.appendChild(st); document.body.appendChild(card);
  const cT=card.querySelector(".t"), cM=card.querySelector(".m"), cMi=card.querySelector(".m i"), cR=card.querySelector(".r");
  let made=0, taken=0, streak=0, best=0, resT=0;
  const show=()=>{ cT.textContent="MADE "+made+" OF "+taken+(streak>1 ? "   ·   STREAK "+streak : "")+(best>2 ? "   ·   BEST "+best : ""); };
  const say=(t, col)=>{ cR.textContent=t; cR.style.color=col||"#f4ead8"; cR.style.opacity=1; resT=1.6; };
  // the sounds: a bounce, the rim, the board, the net
  const ac=()=>(typeof AUDIO!=="undefined" && AUDIO.ctx && AUDIO.on && AUDIO.on()) ? AUDIO.ctx() : null;
  const vol=(p)=>{ const d=p.distanceTo(camera.position); return 1/(1+d*d/40); };
  function tone(type, f0, f1, dur, peak, p){ const c=ac(); if(!c) return; const t=c.currentTime, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(f0, t); if(f1) o.frequency.exponentialRampToValueAtTime(f1, t+dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak*vol(p), t+0.005); g.gain.exponentialRampToValueAtTime(0.0005, t+dur);
    o.connect(g); g.connect(AUDIO.master()); o.start(t); o.stop(t+dur+0.05); }
  function hiss(f, q, dur, peak, p){ const c=ac(); if(!c || !AUDIO.noise) return; const t=c.currentTime, s=c.createBufferSource(); s.buffer=AUDIO.noise(1, "white");
    const fl=c.createBiquadFilter(); fl.type="bandpass"; fl.frequency.value=f; fl.Q.value=q; const g=c.createGain();
    g.gain.setValueAtTime(peak*vol(p), t); g.gain.exponentialRampToValueAtTime(0.0005, t+dur); s.connect(fl); fl.connect(g); g.connect(AUDIO.master()); s.start(t, 0, dur+0.05); }
  const sBounce=(p, k)=>{ tone("sine", 140, 70, 0.14, 0.32*k, p); hiss(900, 0.8, 0.05, 0.12*k, p); };
  const sRim=(p, k)=>{ tone("triangle", 1180, 1100, 0.32, 0.12*k, p); tone("sine", 2460, 2400, 0.18, 0.05*k, p); };
  const sBoard=(p, k)=>{ tone("sine", 210, 120, 0.12, 0.3*k, p); hiss(500, 1.0, 0.08, 0.14*k, p); };
  const sNet=(p)=>hiss(3400, 0.7, 0.28, 0.25, p);
  // the ball in flight: where it is, how it goes, what it has touched this shot
  const V=new T.Vector3(), P=new T.Vector3(), Q=new T.Vector3(), _n=new T.Vector3();
  const B={st:"none", t:0, rim:false, board:false, made:false, done:false, three:false, back:0, charge:-1, power:0, ph:0, spin:new T.Vector3()};
  function start(hp){
    H.on=true; H.held=true; H.hoop=hp; B.st="held"; B.charge=-1; ball.visible=true; made=0; taken=0; streak=0; show();
    card.style.display="block"; toast("THE BALL  ·  HOLD SPACE OR THE MOUSE, LET GO TO SHOOT", "#e8a040");
  }
  function stop(msg){ H.on=false; H.held=false; B.st="none"; B.charge=-1; ball.visible=false; card.style.display="none"; cM.style.opacity=0; if(msg) toast(msg, "#cfe0d4"); H.hoop=null; }
  const canShoot=()=>H.held && !driving && !droneMode && view==="fp" && !seated;
  function shoot(){
    const pw=B.power; B.charge=-1; B.power=0; cM.style.opacity=0; if(!canShoot()) return;
    const hp=H.hoop, yaw=player.yaw+(Math.random()-0.5)*0.012, el=clamp(player.pitch+0.62+(Math.random()-0.5)*0.01, 0.25, 1.35);
    const v=4.6+5.8*pw*(1+(Math.random()-0.5)*0.02), fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    camera.updateMatrixWorld(); P.set(0.0, -0.12, -0.42).applyMatrix4(camera.matrixWorld);
    V.set(fx*Math.cos(el)*v, Math.sin(el)*v, fz*Math.cos(el)*v);
    B.spin.set(-fz, 0, fx).multiplyScalar(-9);                                         // backspin, off the fingers
    const d=Math.hypot(P.x-hp.rim.x, P.z-hp.rim.z);
    Object.assign(B, {st:"fly", t:0, rim:false, board:false, made:false, done:false, three:d>6.75, back:0});
    H.held=false; taken++; show(); hiss(700, 0.6, 0.12, 0.08, P);
  }
  function result(){
    if(B.done) return; B.done=true;
    if(B.made){ made++; streak++; best=Math.max(best, streak);
      say(B.three ? "THREE!" : (!B.rim && !B.board) ? "SWISH" : (B.board && !B.rim) ? "OFF THE GLASS" : "IN", B.three ? "#ffd27a" : "#9fe08a"); }
    else { streak=0; say(!B.rim && !B.board ? "AIRBALL" : B.rim ? "OFF THE RIM" : "OFF THE BOARD", "#e8b8a0"); }
    show();
  }
  // one small step of the ball: the air, the rim, the board, the pole, the ground, anything solid
  function step(dt){
    const hp=H.hoop, R=hp.rim, Bd=hp.board, py=P.y;
    V.y-=G*dt; V.multiplyScalar(1-0.012*dt); P.addScaledVector(V, dt);
    // through the hoop: down past the rim's plane inside it
    if(!B.made && py>R.y && P.y<=R.y && V.y<0 && Math.hypot(P.x-R.x, P.z-R.z)<R.r-RB*0.35){ B.made=true; hp.swing=1; sNet(P); result(); }
    // the rim: a ring, the ball off its tube
    { const dx=P.x-R.x, dz=P.z-R.z, hd=Math.hypot(dx, dz)||1e-6; Q.set(R.x+dx/hd*R.r, R.y, R.z+dz/hd*R.r);
      _n.subVectors(P, Q); const d=_n.length();
      if(d<RB+RT && d>1e-6){ _n.multiplyScalar(1/d); P.copy(Q).addScaledVector(_n, RB+RT); const vn=V.dot(_n);
        if(vn<0){ V.addScaledVector(_n, -1.55*vn); V.multiplyScalar(0.9); if(-vn>0.6) sRim(P, Math.min(1, -vn/4)); B.rim=true; } } }
    // the board, both faces, and its edges near enough
    if(P.x>Bd.x0-RB*0.4 && P.x<Bd.x1+RB*0.4 && P.y>Bd.y0-RB*0.4 && P.y<Bd.y1+RB*0.4){
      const s=(P.z-Bd.z)*hp.f, lim=RB+Bd.t;
      if(Math.abs(s)<lim){ const side=s>=0 ? 1 : -1; P.z=Bd.z+hp.f*side*lim;
        if(V.z*hp.f*side<0){ const k=Math.abs(V.z); V.z=-V.z*0.62; V.x*=0.9; V.y*=0.92; if(k>0.6) sBoard(P, Math.min(1, k/6)); B.board=true; } } }
    // the pole
    { const dx=P.x-hp.x, dz=P.z-hp.z, d=Math.hypot(dx, dz), lim=RB+0.06;
      if(d<lim && P.y<hp.y+3.3 && d>1e-6){ P.x=hp.x+dx/d*lim; P.z=hp.z+dz/d*lim; const vn=(V.x*dx+V.z*dz)/d; if(vn<0){ V.x-=1.6*vn*dx/d; V.z-=1.6*vn*dz/d; sBoard(P, 0.4); } } }
    // walls, doors, cars: back the way it came on whichever way it ran in, and off
    const hit=(x, z)=>hitsAny(colsNear(x, z), x, z, RB, P.y-RB, P.y+RB) || hitsAny(COL_DYN, x, z, RB, P.y-RB, P.y+RB);
    if(hit(P.x, P.z)){ const ox=P.x-V.x*dt, oz=P.z-V.z*dt;
      if(!hit(ox, P.z)){ P.x=ox; V.x*=-0.55; } else if(!hit(P.x, oz)){ P.z=oz; V.z*=-0.55; } else { P.x=ox; P.z=oz; V.x*=-0.5; V.z*=-0.5; }
      sBoard(P, Math.min(1, V.length()/6)); }
    // the drive (or the grass)
    const g=surfaceY(P.x, P.z, P.y+0.2);
    if(P.y-RB<g){ P.y=g+RB;
      if(V.y<-0.9){ const k=-V.y; V.y=k*0.74; V.x*=0.9; V.z*=0.9; sBounce(P, Math.min(1, k/7)); if(B.st==="fly" && !B.made) result(); }
      else { V.y=0; const f=Math.max(0, 1-dt*1.1); V.x*=f; V.z*=f; } }
  }
  H.key=(e)=>{ if(e.code==="Space" && canShoot()){ if(!e.repeat && B.charge<0){ B.charge=0; B.ph=0; } return true; } return false; };
  H.keyup=(e)=>{ if(e.code==="Space" && B.charge>=0) shoot(); };
  renderer.domElement.addEventListener("mousedown", e=>{ if(e.button===0 && canShoot() && B.charge<0 && document.pointerLockElement===renderer.domElement){ B.charge=0; B.ph=0; } });
  addEventListener("mouseup", e=>{ if(e.button===0 && B.charge>=0) shoot(); });
  // every frame (18e): the ball in your hands, the wind-up, the flight, the rebound, walking off with it
  H.frame=(dt)=>{
    for(const hp of YARD_HOOPS) if(hp.swing>0){ hp.swing=Math.max(0, hp.swing-dt*1.6); const s=hp.swing;
      hp.net.scale.set(1-0.12*s, 1+0.22*s*Math.abs(Math.sin(s*14)), 1-0.12*s); hp.net.position.y=hp.rim.y-0.21-0.04*s; }
    if(resT>0){ resT-=dt; if(resT<=0) cR.style.opacity=0; }
    if(!H.on) return;
    const hp=H.hoop, away=Math.hypot(player.pos.x-hp.rim.x, player.pos.z-hp.rim.z);
    if(driving || away>24 || (typeof ZOMBIE!=="undefined" && ZOMBIE.on)){ stop("YOU LEAVE THE BALL BY THE HOOP"); return; }
    if(H.held){
      // the power rises and falls while you hold it: let go at the top
      if(B.charge>=0){ B.charge+=dt; B.ph=(B.charge/1.4)%2; B.power=B.ph<1 ? B.ph : 2-B.ph; cM.style.opacity=1; cMi.style.width=(B.power*100).toFixed(1)+"%"; }
      const k=B.charge>=0 ? B.power : 0; camera.updateMatrixWorld();
      ball.position.set(0.22-k*0.10, -0.36+k*0.14, -0.62+k*0.06).applyMatrix4(camera.matrixWorld); ball.visible=view==="fp" && !droneMode;
      return;
    }
    // in the air or loose: four small steps a frame
    for(let i=0;i<4;i++) step(dt/4);
    ball.position.copy(P); ball.rotateOnWorldAxis(_n.copy(B.spin).normalize(), B.spin.length()*dt); B.spin.multiplyScalar(Math.max(0, 1-dt*0.8)); ball.visible=true;
    B.t+=dt;
    if(B.done || B.t>4) B.back+=dt;
    // the rebound: walk to it and it is yours, or after a while it comes back to you
    const pick=Math.hypot(player.pos.x-P.x, player.pos.z-P.z)<1.1 && P.y<player.feetY+1.4;
    if((B.done || B.t>1) && (pick || B.back>3.0 || Math.hypot(P.x-hp.rim.x, P.z-hp.rim.z)>20)){
      if(!B.done) result(); H.held=true; B.st="held"; B.charge=-1; }
  };
  H.list=YARD_HOOPS;
  return H;
})();
