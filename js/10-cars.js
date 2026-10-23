"use strict";
/* REST AREA · 10-cars.js
   the car constants, the parked cars you can drive, the trucks you cannot
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   10 · PARKED CARS
   Every car in the lot is drivable: a group of its own (body, glass, four
   wheels that steer and roll) with a collider that moves with it. The
   trucks in the truck lot are scenery with colliders — nobody leaves a
   tractor-trailer unlocked with the engine idling, and anyway they are 23 m.
   ---------------------------------------------------------------------- */
const CARS=[];
let driving=null;
/* Tuning, unchanged from the engine: the parked cars stand at exactly the
   height the springs will hold them at, so nothing jumps when you get in. */
const CARC={ mass:1200, engineForce:9000, brakeConstant:12000, dragConstant:5.0,
             rollingResist:15.0, corneringFront:-5.0, corneringRear:-5.2,
             maxGrip:2.6, maxSteer:0.42, steerSpeedBias:40,
             restLength:0.34, springK:34000, damping:4200, wheelRadius:0.36,
             gravity:9.81 };
const CAR_WHEEL_Y=-0.35;
const CAR_SAG=CARC.mass*CARC.gravity/(4*CARC.springK);
const CAR_RIDE=(CARC.restLength-CAR_SAG+CARC.wheelRadius)-CAR_WHEEL_Y;
const LOT_TAKEN=new Set();            // stall keys a parked car occupies

function parkCar(x, z, yaw, kind, paint, y0){
  const parts=vehicleParts(kind, paint), far=vehicleParts(kind, paint, null, 0, true), S=parts.spec;
  const base=(y0||PAVE_T);
  const g=new T.Group();
  const shift=new T.Matrix4().makeTranslation(0, -CAR_RIDE, 0);
  const sh=L=>L.map(e=>({geo:e.geo, matrix:shift.clone().multiply(e.matrix), color:e.color}));
  // near: the full shell; far: the coarse one. updateParkedLOD swaps them
  const near=new T.Group(), farG=new T.Group();
  const body=new T.Mesh(mergeEntries(sh(parts.OP)), VEH_MAT); body.castShadow=true; body.receiveShadow=true;
  near.add(body); near.add(new T.Mesh(mergeEntries(sh(parts.GL)), parts.glassMat||VEH_GLASS));
  const fb=new T.Mesh(mergeEntries(sh(far.OP)), VEH_MAT); fb.castShadow=true;
  farG.add(fb); farG.add(new T.Mesh(mergeEntries(sh(far.GL)), VEH_GLASS));
  farG.visible=false;
  g.add(near); g.add(farG);
  const wheels=[], wg=wheelGeoCached(S.wr, S.tw, false), wf=wheelFarGeo(S.wr, S.tw, false);
  const REST_DROP=S.wr-CAR_RIDE;
  for(const w of [[-S.track, S.axles[0]],[S.track, S.axles[0]],[-S.track, S.axles[1]],[S.track, S.axles[1]]]){
    const wm=new T.Mesh(wg, VEH_MAT);
    wm.rotation.order="YXZ";
    wm.position.set(w[0], REST_DROP, w[1]);
    g.add(wm); wheels.push(wm);
  }
  g.position.set(x, base+CAR_RIDE, z);
  g.rotation.y=yaw;
  scene.add(g);
  const hx=Math.abs(Math.cos(yaw))*(S.hw+0.08)+Math.abs(Math.sin(yaw))*(S.len/2);
  const hz=Math.abs(Math.sin(yaw))*(S.hw+0.08)+Math.abs(Math.cos(yaw))*(S.len/2);
  const cc={x0:x-hx, x1:x+hx, z0:z-hz, z1:z+hz, y0:base, y1:base+S.ht};
  COL_DYN.push(cc);
  const car={g:g, wheels:wheels, kind:kind, col:cc, home:{x:x, z:z, yaw:yaw}, veh:null, spin:0,
             lod:{near:near, far:farG, wg:wg, wf:wf, isNear:true}};
  CARS.push(car);
  return car;
}
// the lot's cars past fifty metres are drawn coarse, wheels and all
function updateParkedLOD(cam){
  for(const c of CARS){
    const L=c.lod, dx=c.g.position.x-cam.x, dz=c.g.position.z-cam.z;
    const nr = c===driving || dx*dx+dz*dz < (L.isNear?56*56:50*50);
    if(nr===L.isNear) continue;
    L.isNear=nr; L.near.visible=nr; L.far.visible=!nr;
    for(const w of c.wheels) w.geometry=nr?L.wg:L.wf;
  }
}

(function lot(){
  const C=CARLOT, n=Math.floor((C.stallZ1-C.stallZ0)/C.stallW);
  // a weekday afternoon: thick by the building, thinning out both ways
  const kinds=[1,0,1,3,0,2,1,0,1,1,0,3,2,0,1];
  let i=0;
  for(let k=0;k<n;k++){
    const zc=C.stallZ0+(k+0.5)*C.stallW;
    for(const side of [1,-1]){
      const near=Math.exp(-Math.abs(zc)/34);
      const h=hash2(zc*1.7, side*3.1);
      if(h>0.10+near*0.62) continue;
      // the accessible stalls stay empty unless someone has a placard
      const ak=side>0 && C.ada[k];
      if(ak==="aisle" || (ak && h>0.2)) continue;
      const x = side>0 ? -29.2 : -43.15;
      const yaw=(side>0 ? Math.PI/2 : -Math.PI/2)+(hash2(zc,side)-0.5)*0.06;
      const kind=kinds[i%kinds.length];
      parkCar(x+(hash2(zc*3,side)-0.5)*0.4, zc+(hash2(side,zc*2)-0.5)*0.3, yaw, kind,
              CAR_PAINTS[(i*5+2)%CAR_PAINTS.length]);
      LOT_TAKEN.add((side>0?"E":"W")+k);
      i++;
    }
  }
})();

/* ---- the truck lot ------------------------------------------------------- */
const TRUCK_STALLS=[], REEFERS=[];
// one dry van, near the middle of the lot, whose back doors open (10b)
const WALKIN={};
// marker lamps on the parked rigs: a lens and a soft glow, both on with the dark
const RIG_MARKER=(function(){
  const lens=new T.MeshBasicMaterial({color:0xffa21c, transparent:true, opacity:0, toneMapped:false, depthWrite:false});
  const glow=new T.SpriteMaterial({map:GLOW_TEX, color:0xffa040, transparent:true, opacity:0, depthWrite:false, blending:T.AdditiveBlending});
  GLOW.push({m:lens, kind:"warm", basic:true, max:0.95}); GLOW.push({m:glow, kind:"warm", basic:true, max:0.55});
  return {lens:lens, glow:glow};
})();
(function trucks(){
  const TL=TRUCKLOT, sa=Math.sin(TL.angle), ca=Math.cos(TL.angle);
  const dx=-sa, dz=-ca, yaw=Math.atan2(dx, dz);
  // which stall: the taken dry van nearest the middle, where you would walk past it
  let pick=-1, pd=1e9;
  { let k2=0; for(let z=TL.stallZ1; z-TL.pitch>=TL.stallZ0; z-=TL.pitch, k2++){
      if(hash2(k2*1.9, 7.3)>0.36 || [5,6,5,7,6,5][k2%6]!==5) continue;
      const d=Math.abs(z-TL.pitch/2-6); if(d<pd){ pd=d; pick=k2; } } }
  let k=0;
  for(let z=TL.stallZ1; z-TL.pitch>=TL.stallZ0; z-=TL.pitch, k++){
    // the stall's centre line, from the aisle edge into the stall
    const z0=z-TL.pitch/2;
    TRUCK_STALLS.push({k:k, x0:TL.aisle0, z0:z0, dx:dx, dz:dz, yaw:yaw});
    const h=hash2(k*1.9, 7.3);
    if(h>0.36) continue;
    const kind=[5,6,5,7,6,5][k%6];
    const walk=k===pick;
    const m=buildVehicleMesh(kind, TRUCK_PAINTS[(k*3+1)%TRUCK_PAINTS.length],
                             ["#e8e7e2","#dcdad3","#c9c9c4","#e9e9e6"][k%4], walk?1:k%2, walk?{open:true}:undefined);
    const S=m.spec, back=1.2-S.tail;            // tail sits 1.2 m off the aisle edge
    const cx=TL.aisle0+dx*back, cz=z0+dz*back;
    m.g.position.set(cx, PAVE_T, cz);
    m.g.rotation.y=yaw;
    scene.add(m.g);
    WHEEL_POOL.register({g:m.g, lod:m.lod, spin:0}, S);
    if(m.lamps) for(const A of m.lamps.amber){
      const lm=new T.Mesh(new T.PlaneGeometry(0.10,0.06), RIG_MARKER.lens); lm.position.copy(A.p); lm.lookAt(A.p.clone().add(A.n)); m.g.add(lm);
      const sp=new T.Sprite(RIG_MARKER.glow); sp.scale.set(0.5,0.5,1); sp.position.copy(A.p).addScaledVector(A.n,0.05); m.g.add(sp);
    }
    if(kind===6) REEFERS.push({x:cx+dx*2.5, z:cz+dz*2.5});
    TRUCK_STALLS[TRUCK_STALLS.length-1].taken=true;
    if(walk) Object.assign(WALKIN, {g:m.g, S:S, x:cx, z:cz, yaw:yaw, stall:k, row:1});
    // a 23 m rig at an angle is one box turned with it (06), its own width, so the 1.6 m between
    // two rigs is somewhere a driver can walk (the walk-in's trailer is hollow: 10b gives it walls)
    { const t0=walk?3.6:S.tail, mid=(t0+S.nose)/2;
      addColOB(cx+dx*mid, cz+dz*mid, yaw, S.hw+0.03, (S.nose-t0)/2, PAVE_T, PAVE_T+S.ht); }
  }
})();
