"use strict";
/* REST AREA · 14i-trucker.js
   the drivers who sleep in their rigs: one on the phone beside his, one
   walking round his by day, and the one who comes over in the night for
   a coffee
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14i · THE TRUCKERS
   Each has a rig of his own in the row, never the open walk-in (10b), and
   where the row allows, one whose driver's side (local +x, toward stall
   k-1) is an empty stall. That stall is held (no visitor rig pulls into
   it, 14-life), so there is always room for him on that side, and he is
   never squeezed between two trailers. They are big men in boots, beards
   and trucker caps with the foam front a colour of its own. They stop
   for you when you are in their way, and a visitor rig moving in the
   aisle stops for them (q.lot).

   THE ONE ON THE PHONE paces the side of his rig, up past the tandems and
   back to the steps, with the phone at his ear. Now and then he stops and
   listens, his free hand waving.

   THE WALK-ROUND, by day: every so often the driver of a rig at the south
   end climbs down in a hi-vis vest with a tire thumper. He goes down the
   driver's side from the steer tire to the trailer tandems, thumping each
   one, looks over the doors and the lights at the back, and walks back up
   to his cab.

   THE TRUCKER IN SLIPPERS comes out between half past ten at night and
   five in the morning, once in a while. The door of a cab a few stalls
   down from the crosswalk opens and a driver climbs down in sweatpants, a
   flannel shirt, a cap and his slippers, with his own steel mug, because
   the machine has been out of cups since July. He shuffles down the side
   of his rig, out into the aisle and along it to the stripes, across, and
   into the vending room. He sets the mug in the bay, punches his button,
   waits through the brewing, looks at the board and takes his coffee.
   Sometimes he stands at the sandwiches a while. Then he goes back the
   way he came and up into his cab. If you are in the room he tells you
   about the cups.
   ---------------------------------------------------------------------- */
const TRUCKERS={used:new Set(), held:[]};
// a rig for one of them: taken, not the walk-in, not another's; an empty stall on its driver's side
// first (which is then held), then by `by`
function truckerRig(by, ok){
  const free=s=>{ const n=TRUCK_STALLS[s.k-1]; return n && !n.taken && !n.held; };
  const cand=TRUCK_STALLS.filter(s=>s.taken && s.k!==WALKIN.stall && !TRUCKERS.used.has(s.k) && (!ok || ok(s)));
  cand.sort((a,b)=>((free(a)?0:1)-(free(b)?0:1))*1000 + by(a)-by(b));
  const st=cand[0]; if(!st) return null;
  TRUCKERS.used.add(st.k);
  if(free(st)){ TRUCK_STALLS[st.k-1].held=true; TRUCKERS.held.push(st.k-1); }
  const S=VEH_SPEC[[5,6,5,7,6,5][st.k%6]], back=1.2-S.tail;
  const xf=XF(st.x0+st.dx*back, st.z0+st.dz*back, st.yaw);
  return {st:st, S:S, yaw:st.yaw, L:(lx,lz)=>({x:xf.x(lx,lz), z:xf.z(lx,lz)})};
}
// the look: a big man in a long-sleeved shirt, a beard, work boots, a cap with a foam front
const _rugged=o=>buildPerson(Object.assign({h:1.05, long:true, boots:true, shoes:"#5a4028", capFront:"#e9e6dd"}, o));
const _angTo=(a,b)=>{ let d=b-a; while(d>Math.PI) d-=Math.PI*2; while(d<-Math.PI) d+=Math.PI*2; return d; };
// a step along p.path; he stops for you on foot ahead of him, or for the car you are in, close.
// p.walking says whether his feet moved this frame (the pose follows it). True at the path's end.
function _truckerStep(p, dt, sp){
  const tgt=p.path[p.pi], dx=tgt.x-p.x, dz=tgt.z-p.z, d=Math.hypot(dx,dz);
  if(d<0.06){ p.pi++; p.walking=false; return p.pi>=p.path.length; }
  p.yaw+=_angTo(p.yaw, Math.atan2(dx,dz))*Math.min(1,dt*5);
  let wait;
  if(driving){ const g=driving.g.position; wait=Math.hypot(g.x-p.x, g.z-p.z)<4.2; }
  else{ const px=player.pos.x-p.x, pz=player.pos.z-p.z; wait=Math.hypot(px,pz)<1.2 && (px*dx+pz*dz)>0; }
  if(wait){ p.walking=false; return false; }
  const step=Math.min(d, sp*dt);
  p.x+=dx/d*step; p.z+=dz/d*step; p.ph=(p.ph+step/0.78)%1; p.walking=true;
  p.y=surfaceY(p.x, p.z, p.y+0.3);
  return false;
}
/* ---- the trucker in slippers --------------------------------------------- */
const SLIPPERS={p:null, told:false};
(function slippers(){
  if(typeof VENDHUT_RT==="undefined" || !VENDHUT_RT.coffee) return;
  // a rig south of the crosswalk, the nearest such
  const R=truckerRig(s=>s.z0, s=>s.z0>3); if(!R) return;
  const S=R.S, L=R.L, C=VENDHUT_RT.coffee, V=VENDHUT, TL=TRUCKLOT;
  // the way over: off the step, down the driver's side, round the tail and out into the aisle
  // (clear of the next rigs' back corners, which stand into it at the angle), along it to the
  // stripes, across, in
  const door=L(1.55, 7.3), tailP=L(2.15, S.tail-0.9), ax=TL.aisle0+1.1;
  const out=[door, L(2.15, 7.3), tailP, {x:ax, z:tailP.z-1.0}, {x:ax, z:0.5}, {x:V.x0-2.2, z:0.5},
    {x:V.x0-0.5, z:0.5}, {x:V.x0+0.7, z:0.35}, {x:C.x-0.06, z:C.z+0.48}];
  const SAND={x:C.x+0.98, z:C.z+0.50};
  const P=buildPerson({h:1.05, skin:SKINS[1], hair:HAIRS[4], beard:"#8f8a84", belly:true, shirt:"#7a2a22", pants:"#7f8184",
                       shoes:"#6b5440", long:true, cap:"#2f4a6e", capFront:"#e9e6dd"});
  P.g.visible=false;
  // the flannel's checks are too fine to see from across a lot; the mug is not
  const mug=new T.Group();
  const mb=new T.Mesh(new T.CylinderGeometry(0.042,0.036,0.17,12), new T.MeshStandardMaterial({color:0x9aa0a4, roughness:0.3, metalness:0.7}));
  const ml=new T.Mesh(new T.CylinderGeometry(0.044,0.044,0.03,12), new T.MeshStandardMaterial({color:0x1d1d1f, roughness:0.5}));
  ml.position.y=0.10; mug.add(mb); mug.add(ml); mug.visible=false; scene.add(mug);
  const p={kind:"custom", lot:true, P:P, x:door.x, z:door.z, y:PAVE_T, yaw:0, ph:0, seed:3.7, cust:true, walking:false,
           state:"cab", t:0, path:null, pi:0, nextM:5.0+Math.random()*1.5, sand:false, mugIn:true};
  SLIPPERS.p=p;
  const nightM=()=>(DayNight.state.hour-18+24)%24;                // hours since six in the evening
  const go=(pts, then)=>{ p.path=pts; p.pi=1; p.state="walk"; p.then=then; };
  const face=(dt, yaw)=>{ p.yaw+=_angTo(p.yaw, yaw)*Math.min(1,dt*4); };
  const _hw=new T.Vector3();
  p.upd=(p, dt, now, dark, cd)=>{
    const m=nightM();
    if(m<1){ p.nextM=4.5+Math.random()*1.5; SLIPPERS.told=false; }  // a new evening: his first trip some time after half ten
    if(p.state==="cab"){
      P.g.visible=false; mug.visible=false; p.walking=false;
      if(m>=p.nextM && m<11 && dark>0.5){ p.x=door.x; p.z=door.z; p.sand=Math.random()<0.45; P.g.visible=true; go(out, "coffee"); }
      return;
    }
    // walking: a shuffle, slippers that do not leave the ground, the mug carried in front
    if(p.state==="walk" && _truckerStep(p, dt, 0.74)){
      if(p.then==="coffee"){ p.state="place"; p.t=0; }
      else if(p.then==="sand"){ p.state="sand"; p.t=0; }
      else{ p.state="cab"; p.nextM=nightM()+1.3+Math.random()*1.4; P.g.visible=false; mug.visible=false; return; }
    }
    const tStand=p.state!=="walk";
    p.t+=dt;
    // at the machine: the mug into the bay, his button, the wait, the mug back out
    const H=VENDHUT_RT;
    if(p.state==="place"){ face(dt, Math.PI);
      if(p.t>1.3 && p.mugIn){ p.mugIn=false; H.mugUnder=true; }
      if(p.t>2.6){ p.state="brew"; p.t=0; H.brew=10; if(typeof AUDIO!=="undefined"){ AUDIO.blip("tick", C.x, C.z); AUDIO.blip("gurgle", C.x, C.z); } } }
    else if(p.state==="brew"){
      if(p.t>3.2 && p.t<3.3){ H.pour=4.5; if(typeof AUDIO!=="undefined") AUDIO.blip("pour", C.x, C.z); }
      if(p.t>9.5){ p.state="take"; p.t=0; } }
    else if(p.state==="take"){ if(p.t>1.0 && !p.mugIn){ p.mugIn=true; H.mugUnder=false; }
      if(p.t>2.4){ const back=out.slice().reverse(); back[0]={x:p.x, z:p.z};
        if(p.sand){ p.sand=false; go([{x:p.x,z:p.z}, SAND], "sand"); }
        else go(back, "home"); } }
    else if(p.state==="sand"){ face(dt, Math.PI);
      if(p.t>7){ const back=out.slice(0,-1).reverse(); back.unshift({x:p.x, z:p.z}); go(back, "home"); } }
    // a word, if you are in the room while he is at the machine
    if(tStand && p.state!=="cab" && !SLIPPERS.told && Math.hypot(player.pos.x-p.x, player.pos.z-p.z)<3.2){
      SLIPPERS.told=true;
      toast(["“OUT OF CUPS SINCE JULY. YOU BRING YOUR OWN.”","“DON'T PUT MONEY IN THAT. IT'LL TAKE IT.”"][(Math.random()*2)|0], "#cfe0d4"); }
    // the pose
    if(cd<110){
      if(p.state==="walk" && p.walking){
        poseP(P, "walk", p.ph, now); const B=P.B, J=P.j;
        B[J.hpL].rotation.x*=0.42; B[J.hpR].rotation.x*=0.42;                  // short steps
        B[J.knL].rotation.x=0.10+(B[J.knL].rotation.x-0.08)*0.30; B[J.knR].rotation.x=0.10+(B[J.knR].rotation.x-0.08)*0.30;
        B[J.root].position.y=P.HIP-0.02+Math.abs(Math.cos(p.ph*Math.PI*2))*0.008;
        B[J.spine].rotation.x=0.12;                                            // a bit of a stoop
        B[J.shL].rotation.x*=0.4;
        B[J.shR].rotation.set(-0.30, 0, 0.05); B[J.elR].rotation.x=-1.25;      // the mug held in front
        B[J.head].rotation.x=0.10;
      }else{
        poseP(P, "stand", 0, now); const B=P.B, J=P.j;
        B[J.spine].rotation.x=0.10;
        if(p.state==="place"){ const r=smoothstep(0,1.2,p.t)*(1-smoothstep(1.6,2.4,p.t));
          B[J.spine].rotation.x=0.10+r*0.45; B[J.shR].rotation.set(-0.30-r*0.55, 0, 0.05); B[J.elR].rotation.x=-1.25+r*0.75; B[J.head].rotation.x=0.3*r;
          if(p.t>1.6){ const k=smoothstep(1.6,2.2,p.t)*(1-smoothstep(2.3,2.6,p.t)); B[J.shL].rotation.set(-0.95*k, 0, -0.05); B[J.elL].rotation.x=-0.6*k; } }
        else if(p.state==="brew"){ B[J.head].rotation.y=0.9*smoothstep(2,4,p.t)*(1-smoothstep(7,8.5,p.t));   // a look over at the board
          const sc=smoothstep(4.5,5,p.t)*(1-smoothstep(6,6.5,p.t)); B[J.shL].rotation.set(-2.4*sc, 0, -0.3*sc); B[J.elL].rotation.x=-1.6*sc; }   // scratches his head
        else if(p.state==="take"){ const r=smoothstep(0,0.9,p.t)*(1-smoothstep(1.2,2.0,p.t));
          B[J.spine].rotation.x=0.10+r*0.45; B[J.shR].rotation.set(-0.30-r*0.55, 0, 0.05); B[J.elR].rotation.x=-1.25+r*0.75;
          if(p.t>1.6){ const s=smoothstep(1.6,2.0,p.t); B[J.shR].rotation.set(-0.30-s*0.6, -0.4*s, 0.05); B[J.elR].rotation.x=-1.25-s*0.9; } }   // and a sip
        else { B[J.shR].rotation.set(-0.30, 0, 0.05); B[J.elR].rotation.x=-1.25; B[J.head].rotation.x=0.18; }
      }
    }
    P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw;
    // the mug rides in his right hand, upright, whenever it is not in the bay
    mug.visible=P.g.visible && p.mugIn;
    if(mug.visible){ P.g.updateMatrixWorld(true); _hw.set(0, -0.30*P.h, 0.03).applyMatrix4(P.B[P.j.elR].matrixWorld); mug.position.copy(_hw); mug.position.y+=0.02; mug.rotation.y=p.yaw; }
  };
  PEOPLE.push(p);
})();
/* ---- the one on the phone ------------------------------------------------- */
(function phone(){
  // up at the north end of the row
  const R=truckerRig(s=>s.k); if(!R) return;
  const P=_rugged({skin:SKINS[2], hair:HAIRS[0], beard:"#3a2c22", belly:true, shirt:"#5d6a73", pants:"#3b4a66",
                   vest:"#c6dd3c", cap:"#1d1d1f"});
  // from the trailer's middle to the back of the cab, out from the side, on and off
  const ends=[R.L(2.3,-4.0), R.L(2.3,5.2)];
  const p={kind:"custom", lot:true, P:P, x:ends[0].x, z:ends[0].z, y:PAVE_T, yaw:R.yaw, ph:0, seed:5.1, walking:false,
           path:null, pi:0, end:1, pause:2.0};
  p.upd=(p, dt, now, dark, cd)=>{
    if(p.pause>0){ p.pause-=dt; p.walking=false; if(p.pause<=0){ p.path=[{x:p.x, z:p.z}, ends[p.end]]; p.pi=1; } }
    else if(_truckerStep(p, dt, 0.62)){ p.end^=1; p.pause=1.0+Math.random()*(Math.random()<0.3 ? 9 : 2.5); }
    if(cd<110){
      poseP(P, p.walking?"walk":"phone", p.ph, now); const B=P.B, J=P.j;
      if(p.walking){ B[J.shR].rotation.set(-0.35, 0, 0.35); B[J.elR].rotation.x=-2.35; B[J.head].rotation.set(0.05, 0, -0.12); B[J.shL].rotation.x*=0.5; }
      else{ const g=Math.max(0, Math.sin(now*0.7+p.seed)*1.6-0.6);             // listening; then making a point
        B[J.shL].rotation.set(-0.15-0.55*g, 0, -0.12-0.15*g); B[J.elL].rotation.x=-0.30-0.95*g; }
    }
    P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw;
  };
  PEOPLE.push(p);
})();
/* ---- the walk-round -------------------------------------------------------- */
(function walkround(){
  // down at the south end of the row
  const R=truckerRig(s=>-s.k); if(!R) return;
  const S=R.S, L=R.L, side=2.05;
  const P=_rugged({skin:SKINS[0], hair:HAIRS[4], beard:"#9a958e", shirt:"#3e5a7a", pants:"#2f3a52",
                   vest:"#ef7d1f", cap:"#7a1f1f", shades:true});
  P.g.visible=false;
  // the thumper: an ash club with a taped grip, in his right hand, pointing forward and a little down
  const club=new T.Group();
  { const wood=new T.Mesh(new T.CylinderGeometry(0.022,0.015,0.32,8), new T.MeshStandardMaterial({color:0x8a6a44, roughness:0.7}));
    wood.position.y=0.25; club.add(wood);
    const grip=new T.Mesh(new T.CylinderGeometry(0.0165,0.016,0.10,8), new T.MeshStandardMaterial({color:0x1d1d1f, roughness:0.9}));
    grip.position.y=0.04; club.add(grip); }
  club.position.set(0.0, -0.29*P.h, 0.03); club.rotation.x=Math.PI/2+0.35; P.B[P.j.elR].add(club);
  // the walk: off the step, a thump at each tire down the driver's side, the doors and lights at
  // the back, then back up to the steps. A stop is {x, z, act, yaw} (yaw to face while at it)
  const door=L(1.55, 7.3), plan=[Object.assign({}, door)];
  for(const a of S.axles) plan.push(Object.assign(L(side, a), {act:"thump", yaw:R.yaw-Math.PI/2}));   // facing the tire
  const behind=S.tail-0.7;
  plan.push(L(side, behind), Object.assign(L(0.55, behind), {act:"look", yaw:R.yaw}), L(side, behind), L(side, 6.4), Object.assign({}, door));
  const p={kind:"custom", lot:true, P:P, x:door.x, z:door.z, y:PAVE_T, yaw:R.yaw, ph:0, seed:8.3, walking:false,
           state:"cab", t:0, wait:25+Math.random()*60, path:null, pi:0, si:0, act:null};
  const next=()=>{                                                      // on to the next stop on the plan
    p.si++; if(p.si>=plan.length){ p.state="cab"; p.wait=70+Math.random()*120; P.g.visible=false; return; }
    p.path=[{x:p.x, z:p.z}, plan[p.si]]; p.pi=1; p.state="walk"; };
  p.upd=(p, dt, now, dark, cd)=>{
    if(p.state==="cab"){
      P.g.visible=false; p.walking=false;
      if(dark<0.45 && (p.wait-=dt)<=0){ p.x=door.x; p.z=door.z; p.si=0; p.short=false; P.g.visible=true; next(); }
      return;
    }
    if(dark>0.6) p.short=true;                                             // dusk: the rest of the way round without stopping
    if(p.state==="walk" && _truckerStep(p, dt, 0.95)){ const s=plan[p.si]; if(s.act && !p.short){ p.state=s.act; p.t=0; p.hit=0; } else next(); }
    if(p.state==="thump" || p.state==="look"){
      p.t+=dt; p.yaw+=_angTo(p.yaw, plan[p.si].yaw)*Math.min(1,dt*4);
      if(p.state==="thump"){ // two swings, a dull thunk off the sidewall at the bottom of each
        for(const t0 of [0.85, 1.65]) if(p.hit<(t0===0.85?1:2) && p.t>=t0){ p.hit++; if(typeof AUDIO!=="undefined") AUDIO.blip("thump", p.x, p.z); }
        if(p.t>2.3) next(); }
      else if(p.t>4.2) next();
    }
    if(cd<110){
      const B=P.B, J=P.j;
      if(p.walking){ poseP(P, "walk", p.ph, now); B[J.shR].rotation.x*=0.5; B[J.elR].rotation.x=-0.55; }
      else{ poseP(P, "stand", 0, now);
        if(p.state==="thump"){
          // up, and down hard: the arm cocked back over the shoulder, then swung through
          let a=0; for(const t0 of [0.85, 1.65]) a=Math.max(a, smoothstep(t0-0.55, t0-0.12, p.t)*(1-smoothstep(t0-0.06, t0+0.02, p.t)));
          B[J.spine].rotation.x=0.22; B[J.head].rotation.set(0.35, 0, 0);
          B[J.shR].rotation.set(-0.35-1.25*a, 0, 0.12); B[J.elR].rotation.x=-0.25-0.9*a; }
        else if(p.state==="look"){ B[J.head].rotation.set(-0.18, Math.sin(p.t*1.3)*0.6, 0); B[J.elR].rotation.x=-0.5; }
        else B[J.elR].rotation.x=-0.5;
      }
    }
    P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw;
  };
  PEOPLE.push(p);
})();
