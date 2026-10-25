"use strict";
/* REST AREA · 14c-critters.js
   the small things that make a place feel lived in: butterflies over the
   beds by day, grey squirrels working the lawn under the grove's trees,
   and the mist that lies on the grass at dawn and comes back at dusk
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14c · CRITTERS AND MIST
   Butterflies are one InstancedMesh of wings: two instances each, hinged
   on the body's line and flapped by rewriting their matrices; they wander
   round a flower bed or the edge of the lawn at knee to head height and go
   to ground when the light does. Squirrels hop from tree to tree in short
   bounds, stop, sit up, flick the tail, and go on. The mist is a height fog
   in every surface's shader (03-scene), thick on the ground and gone a
   couple of metres up; dense an hour after sunrise and again as the light
   goes.
   ---------------------------------------------------------------------- */
const CRITTERS={bflies:[], squirrels:[], mist:[]};
(function butterflies(){
  const c=cvs(64,64), x=c.getContext("2d");
  // one wing: fore and hind lobes, dusky veins, a dark edge
  x.clearRect(0,0,64,64);
  x.fillStyle="#ffffff";
  x.beginPath(); x.ellipse(30,22,26,18,-0.3,0,7); x.fill();
  x.beginPath(); x.ellipse(24,46,18,14,0.4,0,7); x.fill();
  x.strokeStyle="rgba(40,30,20,0.55)"; x.lineWidth=3; x.stroke();
  x.beginPath(); x.ellipse(30,22,26,18,-0.3,0,7); x.stroke();
  x.fillStyle="rgba(30,20,10,0.6)"; x.beginPath(); x.arc(44,16,4,0,7); x.fill();
  const tex=setSRGB(new T.CanvasTexture(c));
  const geo=new T.PlaneGeometry(0.075,0.075); geo.translate(0.0375,0,0);       // hinged at its root
  geo.rotateX(-Math.PI/2);
  const mat=new T.MeshLambertMaterial({map:tex, transparent:true, alphaTest:0.4, side:T.DoubleSide});
  const N=14, mesh=new T.InstancedMesh(geo, mat, N*2);
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); mesh.frustumCulled=false;
  const cols=[0xf4f2e6,0xf2d84a,0xe8892a,0xf4f2e6,0xe9e3c8];
  const anchors=[[-7.6,-3.8],[-7.6,3.8],[-17.8,-11],[-17.8,11],[-2,-40],[11,-46],[-14,-58],[16,72],[22,84],[-50,-20],[-50,30],[6,-70],[-4,-56],[24,-60]];
  for(let i=0;i<N;i++){
    const a=anchors[i%anchors.length], col=new T.Color(cols[i%cols.length]);
    mesh.setColorAt(i*2, col); mesh.setColorAt(i*2+1, col);
    CRITTERS.bflies.push({ax:a[0], az:a[1], x:a[0], y:0.8, z:a[1], vx:0, vy:0, vz:0, ph:Math.random()*6, t:0, yaw:0, rest:0});
  }
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
  scene.add(mesh); CRITTERS.bmesh=mesh;
})();
/* ---- grey squirrels ----------------------------------------------------------
   An eastern grey: a pear of a body, the haunches heavy; a short head with
   a blunt snout, round ears and a white ring round a black eye; four legs;
   and the tail, five fluffy segments that curl up over the back and wave.
   Everything hinges at the hips, so it can sit up on its haunches. It
   moves the way they do: a few short hops nose-down working the grass,
   sitting up to eat with the paws at the mouth, then a run across the open
   in long bounds, back legs coming through past the front; it freezes,
   up tall, and flicks the tail when you come near, and if you keep coming
   it goes for the nearest tree and straight up the bark, clings there
   watching you, and comes down again head first when you have gone. At
   dusk it goes up for the night. */
const SQ_TREES=[[-2,-40,1.15],[11,-45,1.05],[-15,-61,1.1],[6,-69,1.2],[25,-65,1.0],[-6,-87,1.15],[16,-91,1.05],[26,-44,0.95],[-17,-36,0.9],[-5,-55,0.85]];
(function squirrels(){
  const M=c=>new T.MeshStandardMaterial({color:c, roughness:0.92});
  const GR=M(0x4e4944), BR=M(0x6b5842), WH=M(0xc4bcaf), DK=M(0x141210), TL=M(0x4a453f), TF=M(0x6d6760);
  // the body in one piece: a profile turned round its length, heavy at the haunches, narrowing to the neck
  const prof=[[0.000,-0.075],[0.032,-0.066],[0.052,-0.045],[0.060,-0.018],[0.058,0.010],[0.052,0.040],[0.047,0.070],[0.044,0.100],[0.036,0.128],[0.022,0.145],[0.000,0.150]]
               .map(([r,y])=>new T.Vector2(r,y));
  const bodyGeo=new T.LatheGeometry(prof, 14); bodyGeo.rotateX(Math.PI/2);         // its length along +z
  const bellyGeo=new T.LatheGeometry(prof.map(v=>new T.Vector2(v.x*0.86,v.y)), 12); bellyGeo.rotateX(Math.PI/2);
  const sph=(r,sx,sy,sz,mat,x,y,z)=>{ const m=new T.Mesh(new T.SphereGeometry(r,10,8), mat); m.scale.set(sx,sy,sz); m.position.set(x,y,z); m.castShadow=true; return m; };
  for(let i=0;i<4;i++){
    const g=new T.Group(); g.rotation.order="YXZ";
    const hip=new T.Group(); hip.position.set(0,0.075,-0.055); g.add(hip);          // everything above the hind legs turns here
    // (the shells differ by a clear margin where they cross, so no band of the one lies in the other)
    { const b=new T.Mesh(bodyGeo, GR); b.scale.set(0.90,1.0,1.0); b.position.set(0, 0.016, 0.012); b.castShadow=true; hip.add(b);
      const f=new T.Mesh(bodyGeo, BR); f.scale.set(1.0,0.74,0.86); f.position.set(0, 0.002, 0.012); hip.add(f);          // the brown along the flanks
      const w=new T.Mesh(bellyGeo, WH); w.scale.set(0.86,0.72,0.82); w.position.set(0,-0.010, 0.030); hip.add(w); }     // the pale belly
    const head=new T.Group(); head.position.set(0, 0.040, 0.165); hip.add(head);
    head.add(sph(1, 0.036,0.034,0.045, GR, 0, 0.010, 0.022));
    head.add(sph(1, 0.020,0.019,0.024, BR, 0, 0.000, 0.058));                       // the snout
    head.add(sph(0.007,1,1,1, DK, 0, 0.004, 0.081));
    for(const sd of [-1,1]){
      head.add(sph(1, 0.012,0.012,0.004, WH, sd*0.027, 0.022, 0.040));             // the eye ring
      head.add(sph(0.0085,1,1,1, DK, sd*0.030, 0.022, 0.042));
      const ear=sph(1, 0.011,0.016,0.006, GR, sd*0.020, 0.046, 0.012); ear.rotation.z=-sd*0.3; head.add(ear); }
    const legs=[];
    for(const [x,z,front] of [[-0.030,0.120,1],[0.030,0.120,1],[-0.042,-0.010,0],[0.042,-0.010,0]]){
      const L=new T.Group(); L.position.set(x, front?-0.005:0.0, z); hip.add(L);
      if(front){ L.add(sph(1, 0.012,0.034,0.013, GR, 0,-0.030,0)); L.add(sph(1, 0.012,0.008,0.016, BR, 0,-0.064,0.006)); }
      else { L.add(sph(1, 0.020,0.030,0.030, GR, 0,-0.025,0.004)); L.add(sph(1, 0.013,0.009,0.040, BR, 0,-0.066,0.022)); }
      legs.push(L); }
    // the tail: a chain, each piece hung off the end of the one before
    const tail=[]; let par=hip, len=0.062;
    for(let k=0;k<5;k++){
      const seg=new T.Group(); seg.position.set(0, k?0:0.018, k?-len:-0.085); par.add(seg);
      const w=0.034+[0,0.012,0.018,0.016,0.008][k];                                  // bushiest past the middle
      seg.add(sph(1, w*1.30, w*0.92, len*1.25, k<3?TL:TF, 0, 0, -len*0.5));          // long and overlapping: one plume, not beads
      tail.push(seg); par=seg; }
    scene.add(g);
    const t0=SQ_TREES[(i*3)%SQ_TREES.length];
    CRITTERS.squirrels.push({g:g, hip:hip, head:head, legs:legs, tail:tail, x:t0[0]+1.2, z:t0[1]+0.8, y:0, yaw:Math.random()*6,
      tree:t0, state:"forage", t:0, wait:0, ph:0, seed:Math.random()*10, gait:null, climbH:0, upright:0, flick:0, chew:0});
  }
})();
/* THE MIST is not a sheet: it is in the fog of every surface (03-scene),
   a layer thickest on the ground that thins out a metre or two up, so it
   has no edges at all. Here is only how much of it there is, its colour,
   and where the ground is: it settles on the ground under you, slowly, so
   from up in the woods the site below lies in it. */
let MIST_K=0;
const _bm=new T.Matrix4(), _bq=new T.Quaternion(), _be=new T.Euler(), _bs=new T.Vector3(1,1,1), _bp=new T.Vector3();
function updateCritters(dt, now, dark){
  // butterflies: summer days only
  const day=1-dark, on=day>0.6 && !FOREST.isAutumn();
  const BM=CRITTERS.bmesh; BM.visible=on;
  if(on){
    CRITTERS.bflies.forEach((b,i)=>{
      b.t-=dt;
      if(b.rest>0){ b.rest-=dt; }
      else{
        if(b.t<=0){ b.t=0.4+Math.random()*1.2;
          const tx=b.ax+(Math.random()-0.5)*5, tz=b.az+(Math.random()-0.5)*5, ty=0.35+Math.random()*1.3;
          b.vx=(tx-b.x)*0.9; b.vz=(tz-b.z)*0.9; b.vy=(ty-b.y)*1.2;
          if(Math.random()<0.08) b.rest=2+Math.random()*4; }
        b.x+=b.vx*dt; b.z+=b.vz*dt; b.y+=b.vy*dt+Math.sin(now*9+b.ph)*0.012;
        if(Math.abs(b.vx)+Math.abs(b.vz)>0.05) b.yaw=Math.atan2(b.vx,b.vz);
      }
      const gy=groundY(b.x,b.z), y=Math.max(gy+0.15, gy+b.y);
      const flap=b.rest>0 ? 0.25+Math.sin(now*2+b.ph)*0.2 : 0.2+Math.abs(Math.sin(now*16+b.ph))*1.25;
      for(const s of [-1,1]){
        _be.set(0, b.yaw, s*flap, "YXZ"); _bq.setFromEuler(_be);
        _bs.set(s,1,1); _bp.set(b.x, y, b.z);
        _bm.compose(_bp, _bq, _bs);
        BM.setMatrixAt(i*2+(s>0?1:0), _bm);
      }
    });
    BM.instanceMatrix.needsUpdate=true;
  }
  // squirrels
  for(const q of CRITTERS.squirrels) _squirrel(q, dt, now, day);
  // the mist: an hour after sunrise, and again from dusk into the night
  const h=DayNight.state.hour;
  const morning=smoothstep(4.8,6.4,h)*(1-smoothstep(7.4,9.6,h));
  const evening=smoothstep(18.5,21.0,h)+ (h<4.8 ? 1 : 0);
  const k=Math.max(morning*1.0, Math.min(1,evening)*0.55)*(FOREST.isAutumn()?1.3:1.0);
  MIST_K=k;
  const cam=camera.position;
  // (by the lake it lies on the water, which is lower than the shore: anchored at the shore, the whole
  // lake would be under its densest foot and go one white sheet)
  let gnd=Terrain.groundAt(cam.x, cam.z);
  if(typeof EAST!=="undefined" && Terrain.lakeSD) gnd=lerp(gnd, Math.min(gnd, EAST.wy), 1-smoothstep(60, 260, Terrain.lakeSD(cam.x, cam.z)));
  MIST_U.z += (gnd-0.3-MIST_U.z)*Math.min(1, dt*0.4);
  MIST_U.x = 0.030*Math.min(1.3,k);
  MIST_U.w = now;
  // lit by the sky it lies under: the haze's own colour, paler, and dark at night
  const f=scene.fog.color, lit=0.10+0.86*day;
  MIST_C.x=(f.r*0.45+0.55*0.90)*lit; MIST_C.y=(f.g*0.45+0.55*0.91)*lit; MIST_C.z=(f.b*0.45+0.55*0.93)*lit;
  // not indoors: through the glass it is out there, not in here
  MIST_C.w = k>0.01 ? 1-_indoorMix : 0;
}

/* ---- one squirrel's life -------------------------------------------------- */
const _SQ_REST=[0.95, 0.55, 0.30, -0.15, -0.45];                 // the tail's curl, standing
function _sqTrunk(T0){ return 0.34*T0[2]+0.02; }
function _squirrel(q, dt, now, day){
  const g=q.g;
  if(day<0.3 && q.state!=="climb" && q.state!=="cling"){ if(q.state!=="night"){ q.state="toTree"; q.night=true; } }
  if(q.state==="night"){ g.visible=day>0.35; if(day>0.4){ q.state="down"; q.climbH=3.0; g.visible=true; } if(!g.visible) return; }
  g.visible=true;
  const P=player.pos, pd=(driving||droneMode) ? 99 : Math.hypot(P.x-q.x, P.z-q.z);
  q.t+=dt;
  const tr=q.tree, R=_sqTrunk(tr);
  // what it is doing decides where the gait is going
  const goTo=(x,z,run)=>{ q.gait={x:x, z:z, run:run, ph:0}; };
  if(q.state==="forage"){
    if(pd<3.6){ q.state="flee"; q.tree=_sqNearest(q.x,q.z); q.gait=null; }
    else if(pd<7 && q.alertT===undefined){ q.state="alert"; q.t=0; q.alertT=1.5+Math.random()*2; q.gait=null; }
    else if(!q.gait && q.t>q.wait){
      q.t=0; const r=Math.random();
      if(r<0.18){ q.tree=SQ_TREES[(Math.random()*SQ_TREES.length)|0]; q.state="run"; }
      else if(r<0.42){ q.act="eat"; q.wait=3+Math.random()*4; }
      else { q.act="sniff"; q.wait=0.8+Math.random()*2;
        const a=Math.random()*6.28, d=1.0+Math.random()*2.2; goTo(tr[0]+Math.cos(a)*d, tr[1]+Math.sin(a)*d, false); } }
    if(pd>9) q.alertT=undefined;
  }
  else if(q.state==="alert"){
    if(pd<3.6){ q.state="flee"; q.tree=_sqNearest(q.x,q.z); }
    else if(q.t>q.alertT || pd>8){ q.state="forage"; q.t=0; q.wait=0.5; }
    q.yawTo=Math.atan2(P.x-q.x, P.z-q.z);
  }
  if((q.state==="run"||q.state==="flee"||q.state==="toTree") && !q.gait){
    const a=Math.atan2(q.x-q.tree[0], q.z-q.tree[1]), r2=_sqTrunk(q.tree)+0.12;
    goTo(q.tree[0]+Math.sin(a)*r2, q.tree[1]+Math.cos(a)*r2, true); }
  // the gait: hops when it is working the grass, long bounds when it runs
  let air=0, pitch=0, legPh=-1;
  if(q.gait){
    const G=q.gait, dx=G.x-q.x, dz=G.z-q.z, d=Math.hypot(dx,dz);
    const fast=G.run && (q.state==="flee"||q.state==="toTree") ? 1.4 : 1;
    const per=G.run ? 0.30/fast : 0.42, stride=G.run ? 0.85*fast : 0.30, hgt=G.run ? 0.13 : 0.06;
    let want=Math.atan2(dx,dz), dy=want-q.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
    q.yaw+=dy*Math.min(1, dt*10);
    G.ph+=dt/per;
    const u=G.ph%1, sp=stride/per*(0.55+0.9*Math.sin(u*Math.PI));
    // close in, straight at it (on the turn it would circle the spot for ever)
    const step=Math.min(d, sp*dt), dir=d<0.6 ? want : q.yaw;
    q.x+=Math.sin(dir)*step; q.z+=Math.cos(dir)*step;
    air=Math.sin(u*Math.PI)*hgt*Math.min(1,d/0.3); pitch=Math.sin(u*Math.PI*2)*(G.run?0.22:0.12); legPh=u;
    // a run across the open stops dead now and then, to look
    if(G.run && q.state==="run" && Math.random()<dt*0.35){ q.gait=null; q.state="alert"; q.t=0; q.alertT=0.8+Math.random()*1.4; q.resume="run"; }
    else if(d<0.1){ q.gait=null;
      if(q.state==="run"){ q.state="forage"; q.t=0; q.wait=0.5; }
      else if(q.state==="flee"||q.state==="toTree"){ q.state="climb"; q.climbH=0; q.yaw=Math.atan2(q.tree[0]-q.x, q.tree[1]-q.z); q.topH=q.night?6.5:2.4+Math.random()*1.8; } }
  }
  if(q.state==="alert" && q.resume && q.t>q.alertT){ q.state=q.resume; q.resume=null; }
  // up the bark in spurts, a cling, and head first down
  let onTrunk=false;
  if(q.state==="climb"||q.state==="cling"||q.state==="down"){
    onTrunk=true;
    const a=Math.atan2(q.x-q.tree[0], q.z-q.tree[1]);
    if(q.state==="climb"){ const spurt=(Math.sin(q.t*9)>-0.2)?1.6:0; q.climbH+=spurt*dt;
      if(q.climbH>=q.topH){ q.climbH=q.topH; if(q.night){ q.state="night"; g.visible=false; return; } q.state="cling"; q.t=0; } }
    else if(q.state==="cling"){ if(pd>8 && q.t>4 || q.t>25){ q.state="down"; q.t=0; } }
    else { const spurt=(Math.sin(q.t*7)>0)?1.1:0; q.climbH-=spurt*dt;
      if(q.climbH<=0){ q.climbH=0; q.state="forage"; q.t=0; q.wait=1; q.alertT=undefined; q.night=false;
        q.x=q.tree[0]+Math.sin(a)*(R+0.25); q.z=q.tree[1]+Math.cos(a)*(R+0.25); q.yaw=a; } }
    const r3=R*(1-0.06*q.climbH)+0.05;
    q.px=q.tree[0]+Math.sin(a)*r3; q.pz=q.tree[1]+Math.cos(a)*r3;
  }
  const gy=Terrain.groundAt(q.x, q.z);
  // the pose, joint by joint
  const H=q.hip, L=q.legs, Tl=q.tail;
  const up=(q.state==="alert"||(q.state==="forage"&&!q.gait&&q.act==="eat")) ? 1 : 0;
  q.upright+= (up-q.upright)*Math.min(1, dt*8);
  const U=q.upright;
  H.rotation.x=-1.15*U+pitch;
  q.head.rotation.x=1.0*U+(q.state==="forage"&&!q.gait&&q.act==="sniff"?0.55+Math.sin(now*14)*0.06:0)-pitch*0.6;
  q.head.rotation.y=q.state==="alert" ? clamp(((q.yawTo||q.yaw)-q.yaw+Math.PI*3)%(Math.PI*2)-Math.PI, -0.8, 0.8) : Math.sin(now*0.9+q.seed)*0.15*(1-U);
  const eat=q.act==="eat" && U>0.5;
  if(eat) q.head.rotation.x+=Math.sin(now*22)*0.04;                      // chewing
  if(legPh>=0){ const s=Math.sin(legPh*Math.PI*2);
    L[0].rotation.x=L[1].rotation.x=-0.9*s;                                 // fronts reach, then plant
    L[2].rotation.x=L[3].rotation.x=0.9*s-0.3; }                            // hinds push, then come through
  else { L[0].rotation.x=L[1].rotation.x=U*(eat?-1.6:-0.7)+(q.act==="sniff"&&!q.gait?Math.sin(now*11)*0.25:0);
    L[2].rotation.x=L[3].rotation.x=1.15*U; }
  // the tail: curled, streaming on the run, and the flick when it is wary
  q.flick=Math.max(0, q.flick-dt);
  if(q.state==="alert" && Math.random()<dt*1.2) q.flick=0.45;
  for(let k=0;k<5;k++){
    let a=_SQ_REST[k];
    if(q.gait && q.gait.run) a=[0.35,0.15,0.05,0.0,0.05][k]+Math.sin(now*12-k*0.9)*0.12;
    if(U>0.5) a=[1.0+U*0.4,0.4,0.1,-0.2,-0.5][k];
    if(q.flick>0) a+=Math.sin(q.flick*45-k*1.1)*0.35;
    Tl[k].rotation.x+= (a-Tl[k].rotation.x)*Math.min(1, dt*14); }
  // and where it all is
  if(onTrunk){
    const a=Math.atan2(q.px-q.tree[0], q.pz-q.tree[1]), down=q.state==="down";
    g.position.set(q.px, gy+0.15+q.climbH, q.pz);
    g.rotation.set(down?Math.PI/2:-Math.PI/2, down?a:a+Math.PI, 0);
    H.rotation.x=0; q.head.rotation.x=down?-0.4:(q.state==="cling"?-0.9:0.1);
    if(q.state==="cling"){ q.head.rotation.y=Math.sin(now*0.8)*0.5; if(Math.random()<dt*0.8) q.flick=0.4; }
    const s=Math.sin(q.t*(q.state==="climb"?18:14));
    L[0].rotation.x=L[1].rotation.x=-0.6+s*0.4*(q.state==="cling"?0:1); L[2].rotation.x=L[3].rotation.x=0.6-s*0.4*(q.state==="cling"?0:1);
  }else{
    g.position.set(q.x, gy+air, q.z); g.rotation.set(0, q.yaw, 0);
  }
}
function _sqNearest(x,z){ let b=SQ_TREES[0], bd=1e9; for(const t of SQ_TREES){ const d=Math.hypot(t[0]-x,t[1]-z); if(d<bd){ bd=d; b=t; } } return b; }
