"use strict";
/* REST AREA · 14e-incidents.js
   a state trooper catching up on paperwork in the lot, and now and then a
   wreck on the northbound shoulder with the lights going
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14e · TROOPERS AND WRECKS
   Rest areas are where troopers write up: a grey cruiser backed into a
   stall by the walk, engine running, a trooper behind the wheel with a
   clipboard and the laptop lit, looking up now and then.
   And once in a long while, out on I-79 northbound across the verge from
   the truck lot, somebody has gone off the road: one car spun round in the
   grass, another pulled over on the shoulder with its hazards going, a
   cruiser behind them with its bar lit, flares and cones closing the right
   lane, and the traffic slowing to look as it squeezes by on the left. It
   stays a few minutes and then it is cleared away. X calls one up.
   ---------------------------------------------------------------------- */
// a vehicle that is not going anywhere: shell, glass and four wheels
function standingVehicle(kind, paint, x, z, yaw, gy){
  const parts=vehicleParts(kind, paint), S=parts.spec;
  const g=new T.Group();
  const body=new T.Mesh(mergeEntries(parts.OP), VEH_MAT); body.castShadow=true; body.receiveShadow=true; g.add(body);
  if(parts.GL.length) g.add(new T.Mesh(mergeEntries(parts.GL), VEH_GLASS));
  const wg=wheelGeoCached(S.wr, S.tw, false), wheels=[];
  for(const [wx,wz] of wheelSlots(S)){ const w=new T.Mesh(wg, VEH_MAT); w.position.set(wx, S.wr, wz); g.add(w); wheels.push(w); }
  g.position.set(x, gy===undefined ? PAVE_T : gy, z); g.rotation.order="YXZ"; g.rotation.y=yaw; scene.add(g);
  return {g:g, S:S, lamps:parts.lamps, wheels:wheels};
}
/* ---- the cruiser ----------------------------------------------------------
   The sedan in fleet grey with a navy stripe and gold lettering on the
   doors, a low bar on the roof (red on the driver's side, blue on the
   other), a push bumper, a spotlight by the windshield, antennas, and a
   laptop on its mount over the console. (In a vehicle's own space +z is
   forward, so the driver's side, the left, is +x.) */
const _barMat=(on,off)=>({on:new T.Color(on), off:new T.Color(off), m:new T.MeshBasicMaterial({color:off, toneMapped:false})});
const _doorTex=signTex(512,96,(c,W,H)=>{
  c.clearRect(0,0,W,H);
  c.fillStyle="#1d2b4f"; c.fillRect(0,H*0.62,W,H*0.20);
  c.fillStyle="#d4a62a"; c.fillRect(0,H*0.58,W,H*0.04); c.fillRect(0,H*0.82,W,H*0.04);
  c.fillStyle="#1d2b4f"; fitText(c,"STATE POLICE",W*0.80,H*0.46,W*0.5,H*0.30,"700");
});
function cruiserKit(V){
  const g=V.g, D=CAR_DEF[0], roof=D.gh.roof, kit={red:[], blue:[], halos:[], mats:[]};
  const dark=new T.MeshStandardMaterial({color:0x1b1c1e, roughness:0.5, metalness:0.3});
  // the bar
  const base=new T.Mesh(new T.BoxGeometry(1.30,0.07,0.30), dark); base.position.set(0, roof+0.05, -0.32); g.add(base);
  for(const sd of [-1,1]) for(let k=0;k<3;k++){
    const M=sd>0 ? _barMat(0xff2418, 0x4a0d0a) : _barMat(0x2a5cff, 0x0c1846);
    const lens=new T.Mesh(new T.BoxGeometry(0.19,0.075,0.26), M.m);
    lens.position.set(sd*(0.13+k*0.2), roof+0.12, -0.32); g.add(lens);
    const h=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:sd>0?0xff2a1a:0x3a66ff, transparent:true, opacity:0,
                                               depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
    h.scale.set(1.6,1.6,1); h.position.set(sd*(0.13+k*0.2), roof+0.14, -0.32); g.add(h);
    (sd>0?kit.red:kit.blue).push({M:M, h:h, k:k});
  }
  // push bumper
  for(const sd of [-1,1]){ const p=new T.Mesh(new T.BoxGeometry(0.06,0.42,0.06), dark); p.position.set(sd*0.32, 0.55, V.S.nose+0.10); g.add(p); }
  { const p=new T.Mesh(new T.BoxGeometry(0.76,0.06,0.07), dark); p.position.set(0, 0.70, V.S.nose+0.11); g.add(p); }
  // spotlight on the driver's pillar, antennas on the roof and the trunk
  { const s=new T.Mesh(new T.CylinderGeometry(0.06,0.07,0.12,10), new T.MeshStandardMaterial({color:0xc9ccce, roughness:0.25, metalness:0.8}));
    s.rotation.x=Math.PI/2; s.position.set(0.86, 1.05, 0.92); g.add(s); }
  // inside: two seat backs, the wheel
  const trim=new T.MeshStandardMaterial({color:0x1f2023, roughness:0.85});
  for(const sd of [-1,1]){ const sb=new T.Mesh(new T.BoxGeometry(0.50,0.62,0.12), trim); sb.position.set(sd*0.38, 0.86, -0.62); sb.rotation.x=-0.18; g.add(sb);
    const hr=new T.Mesh(new T.BoxGeometry(0.26,0.18,0.10), trim); hr.position.set(sd*0.38, 1.26, -0.70); g.add(hr); }
  { const sw=new T.Mesh(new T.TorusGeometry(0.17,0.022,6,18), trim); sw.position.set(0.38, 0.92, 0.30); sw.rotation.x=-0.45; g.add(sw); }
  for(const [x,z,h] of [[0.25,-0.9,0.30],[-0.2,-1.95,0.55],[0.2,-1.95,0.22]]){
    const a=new T.Mesh(new T.CylinderGeometry(0.004,0.006,h,4), dark); a.position.set(x, (z<-1.5?0.99:roof)+h/2, z); g.add(a); }
  // the doors' lettering
  for(const sd of [-1,1]){
    const m=new T.Mesh(new T.PlaneGeometry(1.85,0.35), new T.MeshStandardMaterial({map:_doorTex, transparent:true, roughness:0.35,
      polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(sd*0.947, 0.70, -0.22); m.rotation.y=sd*Math.PI/2; g.add(m);
  }
  // the laptop on its stand over the console, lit for whoever is in the seat
  const lc=cvs(128,96), lx=lc.getContext("2d");
  lx.fillStyle="#1d3c66"; lx.fillRect(0,0,128,96); lx.fillStyle="#e6eef8"; lx.fillRect(0,0,128,12);
  lx.fillStyle="#9fc0e6"; for(let i=0;i<7;i++) lx.fillRect(8, 20+i*10, 40+((i*37)%60), 4);
  lx.fillStyle="#f2c94c"; lx.fillRect(92,20,28,12);
  kit.screen=new T.MeshBasicMaterial({map:setSRGB(new T.CanvasTexture(lc)), toneMapped:false});
  const lt=new T.Group(); lt.position.set(0.02, 0.98, 0.10); lt.rotation.y=Math.atan2(-0.36, 0.40); g.add(lt);
  { const b=new T.Mesh(new T.BoxGeometry(0.36,0.025,0.26), dark); b.position.set(0,-0.02,0); lt.add(b);
    const lid=new T.Mesh(new T.BoxGeometry(0.36,0.24,0.015), dark); lid.position.set(0,0.10,0.12); lid.rotation.x=-0.25; lt.add(lid);
    const sc=new T.Mesh(new T.PlaneGeometry(0.32,0.20), kit.screen); sc.position.set(0,0.10,0.11); sc.rotation.x=-0.25; sc.rotation.y=Math.PI; lt.add(sc);
    const post=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.32,6), dark); post.position.set(0,-0.18,0); lt.add(post); }
  return kit;
}
// the bar's pattern: red and blue in turn, each a double flash, about twice a second
function flashBar(kit, now, on, dark){
  const c=(now*2.1)%1;
  const phase=(a)=>{ const u=(c-a+1)%1; return (u<0.09 || (u>0.16 && u<0.25)) ? 1 : 0; };
  const r=on?phase(0):0, b=on?phase(0.5):0;
  for(const L of kit.red){  L.M.m.color.copy(r?L.M.on:L.M.off); L.h.material.opacity=r*(0.35+0.65*dark); }
  for(const L of kit.blue){ L.M.m.color.copy(b?L.M.on:L.M.off); L.h.material.opacity=b*(0.35+0.65*dark); }
  return r?1:(b?-1:0);
}

/* ---- the trooper in the lot ---------------------------------------------
   Not always there. The cruiser comes down the exit ramp like anyone,
   drives the lot to the stall by the walk it always takes, pulls in and
   sits a while, the engine running and the laptop lit; then it backs out,
   goes round to the on-ramp and is gone, and comes back an hour or so
   later. The trooper sits as a driver sits: knees up, feet forward on the
   floor, nothing below the sills. */
const _crLens=(c)=>new T.MeshBasicMaterial({color:c, transparent:true, opacity:0, depthWrite:false, fog:false, toneMapped:false, side:T.DoubleSide});
function _carLamps(g, A){
  const L=[];
  for(const [list, head] of [[A.head,true],[A.tail,false]]) for(const a of list){
    const m=new T.Mesh(new T.PlaneGeometry(head?0.30:0.28, head?0.10:0.11), _crLens(head?0xfff0d0:0xff2a12));
    m.position.copy(a.p); m.lookAt(a.p.clone().add(a.n)); g.add(m); L.push({s:m, head:head});
    const sp=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, transparent:true, depthWrite:false, blending:T.AdditiveBlending,
                                                opacity:0, color:head?0xffffff:0xff3418}));
    sp.scale.set(head?1.3:0.7, head?1.3:0.7, 1); sp.position.copy(a.p).addScaledVector(a.n,0.06); g.add(sp); L.push({s:sp, head:head, soft:true});
  }
  return L;
}
const TROOPER=(function(){
  // a stall by the walk, in sight of where you come in
  const C=CARLOT, n=Math.floor((C.stallZ1-C.stallZ0)/C.stallW);
  let k0=-1, best=1e9;
  for(let k=0;k<n;k++){
    const zc=C.stallZ0+(k+0.5)*C.stallW;
    if(LOT_TAKEN.has("E"+k) || C.ada[k] || zc<14 || zc>40) continue;
    const d=Math.abs(zc-27); if(d<best){ best=d; k0=k; }
  }
  if(k0<0) for(let k=0;k<n;k++){ const zc=C.stallZ0+(k+0.5)*C.stallW; if(!LOT_TAKEN.has("E"+k) && !C.ada[k] && zc>-30 && zc<50){ k0=k; break; } }
  if(k0<0) return null;
  LOT_TAKEN.add("E"+k0);                         // kept for the cruiser, there or not
  const zs=C.stallZ0+(k0+0.5)*C.stallW, px=-29.2, ax=(C.aisle0+C.aisle1)/2;
  const V=standingVehicle(0, "#80858a", px, zs, Math.PI/2);
  const kit=cruiserKit(V);
  const S=V.S;
  V.lit=_carLamps(V.g, V.lamps);
  const col={x0:0,x1:0,z0:0,z1:0,y0:PAVE_T,y1:PAVE_T+S.ht};
  // the trooper: fleet grey shirt, dark trousers, the hat off on the dash
  const P=buildPerson({h:1.04, skin:SKINS[1], hair:HAIRS[0], shirt:"#6d7277", pants:"#24272c", shoes:"#111111", long:true});
  // a clipboard in the left hand, a pen in the right
  const clip=new T.Mesh(new T.BoxGeometry(0.23,0.012,0.31), new T.MeshStandardMaterial({color:0x8a6a44, roughness:0.8}));
  const paper=new T.Mesh(new T.PlaneGeometry(0.20,0.27), new T.MeshStandardMaterial({color:0xf2f0e8, roughness:0.9}));
  paper.rotation.x=-Math.PI/2; paper.position.y=0.007; clip.add(paper);
  clip.position.set(0.06, -0.30, 0.06); clip.rotation.set(-1.15, 0.4, 0.2); P.B[P.j.elL].add(clip);
  const pen=new T.Mesh(new T.CylinderGeometry(0.004,0.004,0.13,5), new T.MeshStandardMaterial({color:0x1a1a1a}));
  pen.position.set(-0.01,-0.30,0.04); pen.rotation.x=0.9; P.B[P.j.elR].add(pen);
  const hat=new T.Mesh(new T.CylinderGeometry(0.17,0.17,0.02,16), new T.MeshStandardMaterial({color:0x5d6166, roughness:0.8}));
  const crown=new T.Mesh(new T.CylinderGeometry(0.075,0.095,0.11,12), hat.material); crown.position.y=0.06; hat.add(crown);
  hat.position.set(-0.40, 1.02, 0.55); hat.rotation.z=0.08; V.g.add(hat);
  const lamp={x:0, y:0, z:0, color:0x9fc4ff, intensity:0.30, dist:1.8, decay:1.6};
  // the way in and the way out: the visitors' own (14-life), for this stall
  const legs=[
    {P:RAMP_EXIT, speed:13, ramp:true},
    _legFwd([{x:-75,z:104},{x:-74.7,z:100},{x:-72.6,z:96},{x:-66,z:93.6},{x:-58,z:92.4},{x:-50,z:91},{x:-41,z:87},{x:ax,z:78},
             {x:ax,z:Math.min(70,zs+16)},{x:ax,z:zs+7},{x:ax+1.9,z:zs+3.2},{x:px-2.4,z:zs+0.6},{x:px,z:zs}], 5.0, {stop:true, park:true}),
    {P:smoothPath([{x:px,z:zs},{x:px-2.8,z:zs+0.3},{x:ax+1.5,z:zs+2.0},{x:ax+0.3,z:zs+4.0},{x:ax,z:zs+5.4}],0.5,true), speed:1.4, rev:true, stop:true, dwell:0.8},
    _legFwd([{x:ax,z:zs+5.4},{x:ax,z:zs-2},{x:ax,z:-126},{x:ax-1.5,z:-136},{x:-44,z:-143.5},{x:-58,z:-146.2},{x:-68,z:-147.4},
             {x:-73.2,z:-150.5},{x:-75.1,z:-156},{x:_ON_PT.x,z:_ON_PT.z}], 6),
    {P:_ON_PATH, speed:27, ramp:true, gone:true}];
  for(const L of legs) L.len=L.P[L.P.length-1].s;
  const T0={kind:"custom", P:P, x:0, z:0, y:PAVE_T, yaw:0, seed:3.7, V:V, kit:kit, look:0, lookT:9, lamp:lamp, col:col,
    // in the lot when you arrive, for a while yet
    state:"parked", li:1, s:legs[1].len, speed:0, dwell:150+Math.random()*240, legs:legs, moving:false, wait:0,
    upd(p, dt, now, dark, cd){
      const P=p.P; P.seed=p.seed;
      P.g.position.set(p.x, p.y+0.02, p.z); P.g.rotation.y=p.yaw;
      if(cd>70 || !P.g.visible) return;
      poseP(P, "sit", 0, now);
      const B=P.B, J=P.j;
      // a driver's seat: the thighs up off the cushion, the shins forward
      // to the pedals, the feet on the floor well above the sills
      B[J.hpL].rotation.x=-1.74; B[J.hpR].rotation.x=-1.70;
      B[J.knL].rotation.x=0.52;  B[J.knR].rotation.x=0.58;
      B[J.hpL].rotation.z=-0.05; B[J.hpR].rotation.z=0.05;
      if(p.moving){                                   // hands on the wheel, eyes on the road
        B[J.head].rotation.set(0.04, 0, 0); B[J.spine].rotation.x=0;
        for(const [sh,el,sd] of [[J.shL,J.elL,-1],[J.shR,J.elR,1]]){ B[sh].rotation.set(-1.05, 0, sd*0.18); B[el].rotation.x=-0.55; }
        return;
      }
      // head down over the form; every so often up at the lot, then back
      p.lookT-=dt; if(p.lookT<=0){ p.look=p.look?0:1; p.lookT=p.look ? 2.5+Math.random()*2 : 8+Math.random()*10; }
      p.lk=(p.lk||0)+((p.look?1:0)-(p.lk||0))*Math.min(1,dt*3);
      B[J.head].rotation.x=0.42*(1-p.lk)-0.05*p.lk; B[J.head].rotation.y=p.lk*0.6;
      B[J.spine].rotation.x=0.10*(1-p.lk);
      B[J.shL].rotation.x=-0.78; B[J.shL].rotation.z=-0.05; B[J.elL].rotation.x=-1.25;
      const w=(1-p.lk)*Math.sin(now*7.0)*Math.sin(now*1.3);
      B[J.shR].rotation.x=-0.72+w*0.03; B[J.shR].rotation.z=0.12+w*0.05; B[J.elR].rotation.x=-1.42+w*0.05;
    }};
  PEOPLE.push(T0);
  return T0;
})();
const _crSeat=new T.Vector3(), _crY=new T.Vector3(0,1,0);
// put the cruiser, its trooper, its lamp and its footprint where it is
function _crPlace(Tr, x, z, head, dark){
  const V=Tr.V, S=V.S;
  V.g.position.set(x, PAVE_T+0.02, z); V.g.rotation.y=head;
  _crSeat.set(0.38, 0, -0.30).applyAxisAngle(_crY, head);
  Tr.x=x+_crSeat.x; Tr.z=z+_crSeat.z; Tr.yaw=head;
  _crSeat.set(0.0, 1.1, -0.05).applyAxisAngle(_crY, head);
  Tr.lamp.x=x+_crSeat.x; Tr.lamp.y=PAVE_T+_crSeat.y; Tr.lamp.z=z+_crSeat.z;
  const fx=Math.sin(head), fz=Math.cos(head), c=Tr.col;
  const hx=Math.abs(fz)*(S.hw+0.08)+Math.abs(fx)*S.len/2, hz=Math.abs(fx)*(S.hw+0.08)+Math.abs(fz)*S.len/2;
  c.x0=x-hx; c.x1=x+hx; c.z0=z-hz; c.z1=z+hz;
  const lit=dark>0.04;
  for(const L of V.lit){
    L.s.visible=lit; if(!lit) continue;
    const brake=(!L.head && Tr.braking) ? 1 : 0;
    L.s.material.opacity = L.soft ? dark*(L.head?0.34:0.22+brake*0.25) : dark*(L.head?0.98:0.80+brake*0.2);
  }
}
function _crShow(Tr, on){
  Tr.V.g.visible=on; Tr.P.g.visible=on;
  const li=LAMPS.indexOf(Tr.lamp);
  if(on && li<0) LAMPS.push(Tr.lamp);
  if(!on && li>=0) LAMPS.splice(li,1);
}
function _crParked(Tr, on){
  const i=COL_DYN.indexOf(Tr.col);
  if(on && i<0) COL_DYN.push(Tr.col);
  if(!on && i>=0) COL_DYN.splice(i,1);
}
// how fast it may go: its leg's speed, braking into a stop, and never into
// you, a car you are driving, a visitor on the move or someone on foot
function _crLimit(Tr, L, here, fx, fz){
  const V=Tr.V, S=V.S, front=L.rev ? -S.tail : S.nose, reach=front+9+Tr.speed*2.2;
  let lim=1e9, who=null;
  const look=(px,pz,olen,wide)=>{
    const dx=px-here.x, dz=pz-here.z, a=dx*fx+dz*fz, l=Math.abs(dx*fz-dz*fx);
    if(a<=0 || a>reach || l>wide) return false;
    const gap=a-front-olen, want=2.6+Tr.speed*1.2;
    const cap=Math.max(0,(gap-want)*0.6);
    if(cap<lim){ lim=cap; return true; } return false;
  };
  if(!driving && !droneMode && Math.abs(player.feetY-PAVE_T)<3 && look(player.pos.x, player.pos.z, 0.4, S.hw+1.0)) who="you";
  if(driving){ const p=driving.g.position; if(look(p.x, p.z, 2.4, S.hw+1.6)) who="car"; }
  if(Tr.wait<14) for(const o of TRAFFIC){
    if(!o.route || o.route.dwell>0) continue;
    if(look(o.g.position.x, o.g.position.z, Math.max(o.nose,-o.tail), S.hw+1.4)) who="traffic";
  }
  for(const q of PEOPLE) if(q.kind==="driver" && q.P.g.visible && look(q.x, q.z, 0.3, S.hw+0.9)) who="you";
  return {lim:lim, who:who};
}
function updateTrooper(dt, dark){
  const Tr=TROOPER; if(!Tr) return;
  Tr.moving=false; Tr.braking=false;
  if(Tr.state==="away"){
    Tr.dwell-=dt;
    // back an hour or so later, if the stall's way in is clear
    if(Tr.dwell<=0){ Tr.state="in"; Tr.li=0; Tr.s=0; Tr.speed=12; _crShow(Tr, true); }
    else return;
  }
  const L=Tr.legs[Tr.li];
  if(Tr.dwell>0){                                     // parked, or between legs
    Tr.dwell-=dt; Tr.speed=0;
    const at=pathAt(L.P, L.len);
    _crPlace(Tr, at.x, at.z, Math.atan2(at.hx, at.hz)+(L.rev?Math.PI:0), dark);
    if(Tr.dwell<=0){
      const N=Tr.legs[Tr.li+1];
      if(N && N.rev && _aisleBusy(Tr.V, N)){ Tr.dwell=0.8; return; }   // nobody coming down the aisle
      if(L.park){ _crParked(Tr, false); Tr.state="out"; }
      Tr.li++; Tr.s=0;
    }
    return;
  }
  const here=pathAt(L.P, Tr.s), sg=L.rev?-1:1, fx=here.hx*sg, fz=here.hz*sg;
  let target=L.speed;
  if(L.stop) target=Math.min(target, Math.sqrt(2*1.8*Math.max(0,L.len-Tr.s))+0.2);
  if(!L.ramp || Tr.s>L.len-40 || Tr.li>0){
    const r=_crLimit(Tr, L, here, fx, fz);
    target=Math.min(target, r.lim);
    if(r.lim<0.3){ Tr.wait+=dt; } else Tr.wait=0;
  }
  Tr.braking = target < Tr.speed-0.2;
  Tr.speed += clamp(target-Tr.speed, -4.5*dt, (L.ramp?2.6:1.6)*dt);
  Tr.s=Math.min(L.len, Tr.s+Tr.speed*dt);
  Tr.moving=Tr.speed>0.05 || Tr.li!==1 || Tr.state!=="parked";
  const at=pathAt(L.P, Tr.s);
  _crPlace(Tr, at.x, at.z, Math.atan2(at.hx, at.hz)+(L.rev?Math.PI:0), dark);
  for(const w of Tr.V.wheels) w.rotation.x+=Tr.speed*sg*dt/Tr.V.S.wr;
  if(Tr.s>=L.len-0.02){
    if(L.gone){                                       // down the on-ramp and away
      _crShow(Tr, false); Tr.state="away"; Tr.dwell=240+Math.random()*420; Tr.speed=0; return; }
    if(L.park){ Tr.state="parked"; Tr.dwell=240+Math.random()*420; Tr.speed=0; _crParked(Tr, true); }
    else if(L.stop){ Tr.dwell=L.dwell||0.5; }
    else { Tr.li++; Tr.s=0; }
  }
}
// where it starts: in its stall
if(TROOPER){ const L=TROOPER.legs[1], at=pathAt(L.P, L.len);
  _crPlace(TROOPER, at.x, at.z, Math.atan2(at.hx, at.hz), 0); _crParked(TROOPER, true); _crShow(TROOPER, true); }

/* ---- the wreck ------------------------------------------------------------ */
const _hazTex=GLOW_TEX;
const INC=(function(){
  const root=new T.Group(); root.visible=false; scene.add(root);
  const shoulderX=laneX(-1,0)+HWY.lane/2+1.45, gy=z=>roadY(z);
  const take=V=>{ scene.remove(V.g); root.add(V.g); return V; };
  // the one that went off: spun round, nose in the grass, down on one side
  const ax=-102.6, az=-44;
  const A=take(standingVehicle(0, "#2d4b6b", ax, az, 2.35, Terrain.groundAt(ax,az)-0.06));
  A.g.rotation.z=0.06; A.g.rotation.x=-0.03;
  // the other, pulled over on the shoulder with its flashers going
  const B=take(standingVehicle(1, "#c9c9c4", shoulderX, -24, Math.PI, gy(-24)));
  // the cruiser behind them, angled out a little to cover them, bar going
  const C=take(standingVehicle(0, "#80858a", shoulderX-0.5, -5, Math.PI+0.10, gy(-5)));
  const kit=cruiserKit(C);
  // hazards on the pulled-over one: amber at all four corners
  const haz=[];
  for(const a of [...B.lamps.head, ...B.lamps.tail]){
    const s=new T.Sprite(new T.SpriteMaterial({map:_hazTex, color:0xffa21c, transparent:true, opacity:0, depthWrite:false,
                                               blending:T.AdditiveBlending, toneMapped:false}));
    s.scale.set(0.9,0.9,1); s.position.copy(a.p).addScaledVector(a.n,0.08); B.g.add(s); haz.push(s);
  }
  // what came off it: a bumper cover, bits of trim and lens on the shoulder
  const deb=new T.MeshStandardMaterial({color:0x22262b, roughness:0.6});
  const deb2=new T.MeshStandardMaterial({color:0x2d4b6b, roughness:0.35, metalness:0.3});
  const r=_trng(4242);
  for(let i=0;i<14;i++){
    const m=new T.Mesh(new T.BoxGeometry(0.08+r()*0.35, 0.02+r()*0.03, 0.06+r()*0.25), i%3?deb:deb2);
    const x=shoulderX+0.8+r()*2.2, z=az+4+r()*7;
    m.position.set(x, Math.max(gy(z), Terrain.groundAt(x,z))+0.015, z); m.rotation.y=r()*6.28; root.add(m);
  }
  { const bump=new T.Mesh(new T.CylinderGeometry(0.9,0.9,0.35,12,1,true,0,Math.PI*0.7), deb2);
    bump.position.set(shoulderX+1.6, gy(az+8)+0.2, az+8); bump.rotation.set(Math.PI/2,0,1.1); root.add(bump); }
  // flares down the shoulder edge and across the lane, cones along the taper
  const flares=[], cones=[];
  const coneMat=new T.MeshStandardMaterial({color:0xff6a10, roughness:0.6}), band=new T.MeshStandardMaterial({color:0xf2f2ee, roughness:0.4});
  const L0=laneX(-1,0), edgeR=L0+HWY.lane/2-0.3, edgeL=L0-HWY.lane/2+0.3;
  const taper=(z)=>lerp(edgeR, edgeL, clamp((CRASH.zt-z)/42,0,1));
  for(let z=CRASH.zt; z>=CRASH.zEnd; z-= (z>CRASH.zt-45 ? 7 : 14)){
    const x=taper(z), c=new T.Group();
    const body=new T.Mesh(new T.ConeGeometry(0.16,0.70,12), coneMat); body.position.y=0.39; c.add(body);
    const b2=new T.Mesh(new T.CylinderGeometry(0.105,0.125,0.10,12), band); b2.position.y=0.42; c.add(b2);
    const ft=new T.Mesh(new T.BoxGeometry(0.42,0.04,0.42), coneMat); ft.position.y=0.02; c.add(ft);
    c.position.set(x, gy(z), z); root.add(c); cones.push(c);
  }
  for(const z of [CRASH.zt+120, CRASH.zt+85, CRASH.zt+50, CRASH.zt+20, CRASH.zt-10]){
    const x=z>CRASH.zt ? edgeR+0.6 : taper(z)+0.2;
    const s=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff3020, transparent:true, opacity:0, depthWrite:false,
                                               blending:T.AdditiveBlending, toneMapped:false}));
    s.scale.set(1.2,1.2,1); s.position.set(x, gy(z)+0.12, z); root.add(s);
    const stick=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.28,6), new T.MeshStandardMaterial({color:0xc4241a, roughness:0.7}));
    stick.rotation.z=Math.PI/2; stick.position.set(x, gy(z)+0.03, z); root.add(stick);
    flares.push({s:s, x:x, y:gy(z)+0.08, z:z, t:Math.random()});
  }
  // the light the bar throws: one lamp that turns red and blue
  const wash=new T.PointLight(0xff2020, 0, 46, 1.6); wash.position.set(shoulderX-0.5, gy(-5)+2.2, -5.3); scene.add(wash);
  // people: the trooper with the driver of the one in the grass, and the
  // other driver on the phone by the guide rail
  const tp=buildPerson({h:1.04, skin:SKINS[2], hair:HAIRS[1], shirt:"#6d7277", pants:"#24272c", shoes:"#111111", long:true, cap:"#5d6166"});
  const d1=randomPerson(_trng(77)), d2=randomPerson(_trng(91));
  const ppl=[{P:tp, x:ax-1.9, z:az+3.2, yaw:-2.2, mode:"read"},{P:d1, x:ax-0.9, z:az+4.6, yaw:-0.4+Math.PI, mode:"stand"},
             {P:d2, x:shoulderX+2.4, z:-22.5, yaw:Math.PI*0.5, mode:"phone"}];
  for(const q of ppl){
    q.y=Terrain.groundAt(q.x,q.z); q.P.g.visible=false; q.x0=q.x; q.z0=q.z;
    PEOPLE.push({kind:"custom", P:q.P, x:q.x, z:q.z, y:q.y, yaw:q.yaw, seed:Math.random()*9,
      upd(p, dt, now, dark, cd){ p.P.g.visible=CRASH.on && !q.gone; if(!p.P.g.visible) return; p.P.seed=p.seed;
        let mode=q.mode;
        if(q.walkTo){ const dx=q.walkTo.x-p.x, dz=q.walkTo.z-p.z, d=Math.hypot(dx,dz);
          if(d>0.02){ p.yaw=Math.atan2(dx,dz); p.x=q.walkTo.x; p.z=q.walkTo.z; p.ph=((p.ph||0)+d/1.45)%1; mode="walk"; }
          p.y=Math.max(Terrain.groundAt(p.x,p.z), roadY(p.z)+PAVE_T*(Math.abs(p.x-HWY.nb)<9?1:0)); }
        p.P.g.position.set(p.x,p.y,p.z); p.P.g.rotation.y=p.yaw; if(cd<120) poseP(p.P, mode, p.ph||0, now); }});
    q.reset=()=>{ q.gone=false; q.walkTo=null; const P2=PEOPLE.find(o=>o.P===q.P); if(P2){ P2.x=q.x0; P2.z=q.z0; P2.y=q.y; P2.yaw=q.yaw; } };
  }
  // the wrecker: a pickup with a boom and wheel-lift on the back and an
  // amber bar on the cab; it comes later, for the one in the grass
  const W=take(standingVehicle(2, "#b3241c", shoulderX, 300, Math.PI, gy(300)));
  { const M=c=>new T.MeshStandardMaterial({color:c, roughness:0.5, metalness:0.3}), add=(geo,mat,x,y,z,rx)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); if(rx) m.rotation.x=rx; W.g.add(m); return m; };
    add(new T.BoxGeometry(0.22,0.22,1.9), M(0x2a2a2a), 0, 1.45, -1.7, -0.45);                // the boom
    add(new T.BoxGeometry(0.30,0.60,0.30), M(0x2a2a2a), 0, 1.05, -1.05);
    add(new T.BoxGeometry(1.70,0.10,0.24), M(0xd8a51c), 0, 0.42, -3.62);                     // the lift's crossbar
    add(new T.BoxGeometry(0.16,0.10,0.70), M(0x2a2a2a), 0, 0.45, -3.25);
    add(new T.BoxGeometry(1.10,0.06,0.26), M(0x1d1d1e), 0, 1.93, -0.30);
    for(let k=0;k<4;k++) add(new T.BoxGeometry(0.24,0.08,0.24), M(0xe8962a), -0.42+k*0.28, 2.00, -0.30); }
  W.g.visible=false;
  // where everything stands at the start, so it can all be put back for the next one
  const home=[A,B,C,W].map(V=>({V:V, p:V.g.position.clone(), r:V.g.rotation.clone()}));
  return {root:root, A:A, B:B, C:C, W:W, kit:kit, haz:haz, flares:flares, cones:cones, wash:wash, ppl:ppl, home:home,
          shoulderX:shoulderX, t:0, next:900+Math.random()*900, steam:0, mv:{}};
})();
/* ---- clearing up -------------------------------------------------------------
   It does not stay. Somewhere past halfway the wrecker comes up the coned-off
   lane and stops on the shoulder ahead of the car in the grass; the car is
   winched round and up onto the wheel-lift, nose high, and away they go down
   the shoulder, the driver riding along. The other car's driver gets back in
   and goes. The flares burn down; the trooper walks the cones back to the
   cruiser one by one, gets in, the bar goes dark, and the cruiser pulls out.
   A mover is a vehicle running a polyline at its own pace: up to speed, and
   down to a stop at the end if it is to stop there. */
function _incMover(V, pts, vmax, acc, stop){ return {V:V, pts:pts, vmax:vmax, acc:acc, stop:stop, i:0, s:0, sp:stop?vmax*0.6:0, done:false}; }
function _incStep(m, dt){
  if(m.done) return;
  let left=0; for(let k=m.i;k<m.pts.length-1;k++) left+=Math.hypot(m.pts[k+1].x-m.pts[k].x, m.pts[k+1].z-m.pts[k].z);
  left-=m.s;
  let want=m.vmax; if(m.stop) want=Math.min(want, Math.sqrt(2*2.2*Math.max(0,left)));
  m.sp+=clamp(want-m.sp, -4*dt, m.acc*dt);
  let d=m.sp*dt;
  while(d>0 && m.i<m.pts.length-1){ const a=m.pts[m.i], b=m.pts[m.i+1], L=Math.hypot(b.x-a.x, b.z-a.z);
    if(m.s+d<L){ m.s+=d; d=0; } else { d-=L-m.s; m.s=0; m.i++; } }
  if(m.i>=m.pts.length-1){ m.done=true; m.i=m.pts.length-2; m.s=Math.hypot(m.pts[m.i+1].x-m.pts[m.i].x, m.pts[m.i+1].z-m.pts[m.i].z); }
  const a=m.pts[m.i], b=m.pts[m.i+1], L=Math.hypot(b.x-a.x, b.z-a.z)||1, u=m.s/L, x=lerp(a.x,b.x,u), z=lerp(a.z,b.z,u);
  const g=m.V.g, want2=Math.atan2(b.x-a.x, b.z-a.z);
  let dy=want2-g.rotation.y; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
  g.rotation.y+=dy*Math.min(1, dt*2.5); g.rotation.x=0; g.rotation.z=0;
  g.position.set(x, roadY(z)+PAVE_T, z);
  for(const w of m.V.wheels) w.rotation.x+=m.sp*dt/m.V.S.wr;
}
function _incClear(dt, now, dark){
  const I=INC, u=I.t/I.dur, M=I.mv, sx=I.shoulderX, lane=laneX(-1,0);
  // the wrecker comes, and stops ahead of the car in the grass
  if(u>0.42 && !M.w){ I.W.g.visible=true; M.w=_incMover(I.W, [{x:lane,z:300},{x:lane,z:30},{x:lane+0.2,z:-30},{x:sx-0.3,z:-46},{x:sx+0.2,z:-54}], 20, 2.0, true); M.w.sp=18; }
  if(M.w && !M.tow){ _incStep(M.w, dt);
    if(M.w.done){ M.wt=(M.wt||0)+dt;
      // the winch: the car comes round and up behind the wrecker, nose high
      const g=I.A.g, H=I.home[0], W=I.W.g, k=smoothstep(2, 14, M.wt);
      const tx=W.position.x-Math.sin(W.rotation.y)*6.1, tz=W.position.z-Math.cos(W.rotation.y)*6.1;
      g.position.set(lerp(H.p.x,tx,k), lerp(H.p.y, roadY(tz)+PAVE_T+0.32, k), lerp(H.p.z,tz,k));
      let dy=W.rotation.y-H.r.y; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
      g.rotation.set(lerp(H.r.x,-0.11,k), H.r.y+dy*k, lerp(H.r.z,0,k));
      if(M.wt>16){ M.tow=true; I.ppl[1].gone=true;
        M.w=_incMover(I.W, [{x:sx+0.2,z:-54},{x:sx,z:-90},{x:sx,z:-900}], 24, 1.8, false); } } }
  if(M.tow){ _incStep(M.w, dt); const W=I.W.g, g=I.A.g;
    g.position.set(W.position.x-Math.sin(W.rotation.y)*6.1, W.position.y+0.32, W.position.z-Math.cos(W.rotation.y)*6.1);
    g.rotation.set(-0.11, W.rotation.y, 0);
    if(M.w.done){ I.W.g.visible=false; I.A.g.visible=false; } }
  // the other car goes on its way
  if(u>0.62 && !M.b){ I.ppl[2].gone=true; M.b=_incMover(I.B, [{x:I.B.g.position.x, z:I.B.g.position.z},{x:sx,z:-70},{x:sx,z:-900}], 27, 2.4, false); }
  if(M.b){ _incStep(M.b, dt); if(M.b.done) I.B.g.visible=false; }
  // the flares burn down
  I.flareK=1-smoothstep(0.55, 0.78, u);
  // the trooper walks the cones back; then into the cruiser
  if(u>0.78){ const k=smoothstep(0.80, 0.90, u), n=I.cones.length;
    I.cones.forEach((c,i)=>{ c.visible = i/n >= k; });
    const tp=I.ppl[0], C=I.C.g, dx=C.position.x+1.1, dz=C.position.z+0.6, w=smoothstep(0.78, 0.91, u);
    tp.walkTo={x:lerp(tp.x0,dx,w), z:lerp(tp.z0,dz,w)}; if(u>0.91) tp.gone=true; }
  // the bar goes dark, and the cruiser pulls out
  if(u>0.93 && !M.c){ M.c=_incMover(I.C, [{x:I.C.g.position.x, z:I.C.g.position.z},{x:sx,z:-30},{x:sx,z:-70},{x:sx,z:-900}], 28, 2.6, false); }
  if(M.c){ _incStep(M.c, dt); if(M.c.done || I.C.g.position.z<-700) CRASH.stop(); }
  return u>0.93;
}
CRASH.start=function(){
  if(CRASH.on) return;
  CRASH.on=true; INC.t=0; INC.dur=360+Math.random()*200; INC.root.visible=true; INC.mv={}; INC.flareK=1;
};
CRASH.stop=function(){
  CRASH.on=false; INC.root.visible=false; INC.wash.intensity=0; INC.next=1600+Math.random()*1800;
  // all of it put back where it was, for next time
  for(const h of INC.home){ h.V.g.position.copy(h.p); h.V.g.rotation.copy(h.r); h.V.g.visible=h.V!==INC.W; }
  for(const c of INC.cones) c.visible=true;
  for(const q of INC.ppl) q.reset();
  INC.mv={}; INC.flareK=1;
};
CRASH.toggle=function(){ if(CRASH.on) CRASH.stop(); else { CRASH.pending=true; } };
// the lane has to be clear for the cones to go down in it
function _laneClear(){
  for(const v of TRAFFIC){
    if(v.route || v.dir!==CRASH.dir) continue;
    if((v.lane===CRASH.lane || v.fromLane===CRASH.lane) && v.z<CRASH.zt+30 && v.z>CRASH.zEnd-20) return false;
  }
  return true;
}
function updateIncidents(dt, now, dark){
  // the trooper's bar is dark, his screen is lit
  if(TROOPER){ updateTrooper(dt, dark); flashBar(TROOPER.kit, now, false, dark); TROOPER.kit.screen.color.setScalar(0.55+0.45*dark); }
  const I=INC;
  if(!CRASH.on){
    I.next-=dt;
    if((I.next<=0 || CRASH.pending) && _laneClear()){ CRASH.pending=false; CRASH.start(); }
    return;
  }
  I.t+=dt;
  if(I.t>I.dur*1.25){ CRASH.stop(); return; }                 // however it went, it is over
  const barOff=_incClear(dt, now, dark);
  if(!CRASH.on) return;
  const cam=camera.position, far=Math.hypot(cam.x-I.C.g.position.x, cam.z-I.C.g.position.z);
  const s=flashBar(I.kit, now, !barOff, dark);
  I.wash.intensity=s ? (0.4+2.6*dark)*(far<160?1:0) : 0;
  if(s) I.wash.color.setHex(s>0?0xff2418:0x2a5cff);
  const hz=(now*1.5)%1<0.5 ? 1 : 0;
  for(const h of I.haz) h.material.opacity=hz*(0.45+0.55*dark);
  const fk=I.flareK===undefined?1:I.flareK;
  for(const f of I.flares){
    f.t+=dt;
    f.s.material.opacity=fk*(0.55+0.45*dark)*(0.75+0.25*Math.sin(now*31+f.z)*Math.sin(now*17+f.x));
    if(fk<0.05) continue;
    if(far<220 && Math.random()<dt*6) SPARKS.emit(f.x, f.y, f.z, (Math.random()-0.5)*0.5, 0.8+Math.random()*0.6, (Math.random()-0.5)*0.5, 0.05, 0.5);
    if(far<220 && Math.random()<dt*3) PUFFS.emit(f.x, f.y+0.1, f.z, 0, 0.25, 0, 0.08, 0.7, 2.2, 0.25, 0.85, 0.6);
  }
  // a little steam off the one in the grass
  I.steam-=dt;
  if(I.steam<=0 && far<220 && !I.mv.w){ I.steam=0.35;
    const a=I.A.g, nx=Math.sin(a.rotation.y)*2.0, nz=Math.cos(a.rotation.y)*2.0;
    PUFFS.emit(a.position.x+nx, a.position.y+0.95, a.position.z+nz, 0.05, 0.35, 0.05, 0.15, 1.1, 3.0, 0.22, 0.9, 0); }
}
