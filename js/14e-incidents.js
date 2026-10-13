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
  const wg=wheelGeoCached(S.wr, S.tw, false);
  for(const [wx,wz] of wheelSlots(S)){ const w=new T.Mesh(wg, VEH_MAT); w.position.set(wx, S.wr, wz); g.add(w); }
  g.position.set(x, gy===undefined ? PAVE_T : gy, z); g.rotation.order="YXZ"; g.rotation.y=yaw; scene.add(g);
  return {g:g, S:S, lamps:parts.lamps};
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

/* ---- the trooper in the lot --------------------------------------------- */
const TROOPER=(function(){
  // a stall by the walk, in sight of where you come in; backed in, as they do
  const C=CARLOT, n=Math.floor((C.stallZ1-C.stallZ0)/C.stallW);
  let k0=-1, best=1e9;
  for(let k=0;k<n;k++){
    const zc=C.stallZ0+(k+0.5)*C.stallW;
    if(LOT_TAKEN.has("E"+k) || C.ada[k] || zc<14 || zc>40) continue;
    const d=Math.abs(zc-27); if(d<best){ best=d; k0=k; }
  }
  if(k0<0) for(let k=0;k<n;k++){ const zc=C.stallZ0+(k+0.5)*C.stallW; if(!LOT_TAKEN.has("E"+k) && !C.ada[k] && zc>-30 && zc<50){ k0=k; break; } }
  if(k0<0) return null;
  LOT_TAKEN.add("E"+k0);
  const zc=C.stallZ0+(k0+0.5)*C.stallW, x=-29.0, yaw=-Math.PI/2;
  const V=standingVehicle(0, "#80858a", x, zc, yaw);
  const kit=cruiserKit(V);
  const S=V.S;
  COL_DYN.push({x0:x-S.len/2, x1:x+S.len/2, z0:zc-S.hw-0.08, z1:zc+S.hw+0.08, y0:PAVE_T, y1:PAVE_T+S.ht});
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
  // where the seat is, in the world
  const seat=new T.Vector3(0.38, 0, -0.30).applyAxisAngle(V3(0,1,0), yaw).add(V3(x, PAVE_T, zc));
  const lamp={x:0, y:0, z:0, color:0x9fc4ff, intensity:0.30, dist:1.8, decay:1.6};
  { const lp=new T.Vector3(0.0, 1.1, -0.05).applyAxisAngle(V3(0,1,0), yaw).add(V3(x, PAVE_T, zc)); lamp.x=lp.x; lamp.y=lp.y; lamp.z=lp.z; }
  LAMPS.push(lamp);
  const T0={kind:"custom", P:P, x:seat.x, z:seat.z, y:seat.y, yaw:yaw, seed:3.7, V:V, kit:kit, look:0, lookT:9,
    upd(p, dt, now, dark, cd){
      const P=p.P; P.seed=p.seed;
      P.g.position.set(p.x, p.y+0.02, p.z); P.g.rotation.y=p.yaw;
      if(cd>70) return;
      poseP(P, "sit", 0, now);
      const B=P.B, J=P.j;
      // heads down over the form; every so often up at the lot, then back
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
    q.y=Terrain.groundAt(q.x,q.z); q.P.g.visible=false;
    PEOPLE.push({kind:"custom", P:q.P, x:q.x, z:q.z, y:q.y, yaw:q.yaw, seed:Math.random()*9,
      upd(p, dt, now, dark, cd){ p.P.g.visible=CRASH.on; if(!CRASH.on) return; p.P.seed=p.seed;
        p.P.g.position.set(p.x,p.y,p.z); p.P.g.rotation.y=p.yaw; if(cd<120) poseP(p.P, q.mode, 0, now); }});
  }
  return {root:root, A:A, B:B, C:C, kit:kit, haz:haz, flares:flares, wash:wash, t:0, next:900+Math.random()*900, steam:0};
})();
CRASH.start=function(){
  if(CRASH.on) return;
  CRASH.on=true; INC.t=0; INC.dur=420+Math.random()*300; INC.root.visible=true;
};
CRASH.stop=function(){
  CRASH.on=false; INC.root.visible=false; INC.wash.intensity=0; INC.next=1600+Math.random()*1800;
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
  if(TROOPER){ flashBar(TROOPER.kit, now, false, dark); TROOPER.kit.screen.color.setScalar(0.55+0.45*dark); }
  const I=INC;
  if(!CRASH.on){
    I.next-=dt;
    if((I.next<=0 || CRASH.pending) && _laneClear()){ CRASH.pending=false; CRASH.start(); }
    return;
  }
  I.t+=dt;
  if(I.t>I.dur){ CRASH.stop(); return; }
  const cam=camera.position, far=Math.hypot(cam.x-I.C.g.position.x, cam.z-I.C.g.position.z);
  const s=flashBar(I.kit, now, true, dark);
  I.wash.intensity=s ? (0.4+2.6*dark)*(far<160?1:0) : 0;
  if(s) I.wash.color.setHex(s>0?0xff2418:0x2a5cff);
  const hz=(now*1.5)%1<0.5 ? 1 : 0;
  for(const h of I.haz) h.material.opacity=hz*(0.45+0.55*dark);
  for(const f of I.flares){
    f.t+=dt;
    f.s.material.opacity=(0.55+0.45*dark)*(0.75+0.25*Math.sin(now*31+f.z)*Math.sin(now*17+f.x));
    if(far<220 && Math.random()<dt*6) SPARKS.emit(f.x, f.y, f.z, (Math.random()-0.5)*0.5, 0.8+Math.random()*0.6, (Math.random()-0.5)*0.5, 0.05, 0.5);
    if(far<220 && Math.random()<dt*3) PUFFS.emit(f.x, f.y+0.1, f.z, 0, 0.25, 0, 0.08, 0.7, 2.2, 0.25, 0.85, 0.6);
  }
  // a little steam off the one in the grass
  I.steam-=dt;
  if(I.steam<=0 && far<220){ I.steam=0.35;
    const a=I.A.g, nx=Math.sin(a.rotation.y)*2.0, nz=Math.cos(a.rotation.y)*2.0;
    PUFFS.emit(a.position.x+nx, a.position.y+0.95, a.position.z+nz, 0.05, 0.35, 0.05, 0.15, 1.1, 3.0, 0.22, 0.9, 0); }
}
