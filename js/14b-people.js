"use strict";
/* REST AREA · 14b-people.js
   the people: drivers out of the cars that pull in, someone at a picnic
   table, a dog being walked, a smoker by the post, a trucker on the phone
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14b · PEOPLE
   Each person is one SkinnedMesh — one draw — rigidly skinned to eleven
   bones: hips, spine, head, shoulders and elbows, hips and knees. The parts
   are plain shapes (tapered cylinders, ellipsoids, a box for each shoe)
   merged with a bone index per vertex; poses are bone rotations. A walk is
   a stride cycle (thigh swing, a knee that folds on the way forward, the
   opposite arm, a little bob); sitting folds the hips and knees square.
   Every car that pulls in lets somebody out: they walk to the door by the
   way people do (between the cars, over the crosswalk, along the walk),
   go in, are a while, come out and walk back, and the car waits for them.
   ---------------------------------------------------------------------- */
const PEOPLE=[];
const PEOPLE_MAT=new T.MeshStandardMaterial({vertexColors:true, roughness:0.84, skinning:true});
// a merged geometry from parts {geo, matrix, color, bone}, each vertex bound to one bone
function rigidSkin(parts){
  let n=0; for(const p of parts) n+=p.geo.attributes.position.count;
  const P=new Float32Array(n*3), N=new Float32Array(n*3), C=new Float32Array(n*3),
        SI=new Uint16Array(n*4), SW=new Float32Array(n*4), idx=[];
  let o=0;
  const v=new T.Vector3(), nm=new T.Matrix3();
  for(const p of parts){
    const g=p.geo.index ? p.geo : p.geo, pos=g.attributes.position, nor=g.attributes.normal, c=new T.Color(p.color);
    nm.getNormalMatrix(p.matrix);
    for(let i=0;i<pos.count;i++){
      v.fromBufferAttribute(pos,i).applyMatrix4(p.matrix); P[(o+i)*3]=v.x; P[(o+i)*3+1]=v.y; P[(o+i)*3+2]=v.z;
      v.fromBufferAttribute(nor,i).applyMatrix3(nm).normalize(); N[(o+i)*3]=v.x; N[(o+i)*3+1]=v.y; N[(o+i)*3+2]=v.z;
      C[(o+i)*3]=c.r; C[(o+i)*3+1]=c.g; C[(o+i)*3+2]=c.b;
      SI[(o+i)*4]=p.bone; SW[(o+i)*4]=1;
    }
    if(g.index) for(let k=0;k<g.index.count;k++) idx.push(o+g.index.getX(k));
    else for(let k=0;k<pos.count;k++) idx.push(o+k);
    o+=pos.count;
  }
  const geo=new T.BufferGeometry();
  geo.setAttribute("position", new T.BufferAttribute(P,3));
  geo.setAttribute("normal", new T.BufferAttribute(N,3));
  geo.setAttribute("color", new T.BufferAttribute(C,3));
  geo.setAttribute("skinIndex", new T.Uint16BufferAttribute(SI,4));
  geo.setAttribute("skinWeight", new T.Float32BufferAttribute(SW,4));
  geo.setIndex(idx);
  return geo;
}
const _pm=(x,y,z,sx,sy,sz,rx)=>new T.Matrix4().compose(V3(x,y,z), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,0)), V3(sx||1,sy||1,sz||1));
function skinned(parts, bones){
  const mesh=new T.SkinnedMesh(rigidSkin(parts), PEOPLE_MAT);
  mesh.add(bones[0]); mesh.updateMatrixWorld(true);
  mesh.bind(new T.Skeleton(bones));
  mesh.castShadow=true; mesh.frustumCulled=false;
  return mesh;
}
/* ---- a person ------------------------------------------------------------- */
const SKINS=["#f1c9a5","#e2b48c","#c68e62","#9a6440","#6b4428"], HAIRS=["#2b1e14","#4a3020","#6b4a2b","#b89b6a","#8d8a86","#1a1716"];
const SHIRTS=["#2f5f8f","#b33a3a","#e8e4d8","#3d6e44","#1d1f22","#c99a2a","#7a4f8a","#5d6a73","#d77a3a","#2b3d63"];
const PANTS=["#3b4a66","#2c3446","#b9a27a","#1d1f22","#5c5a52","#6f7b86"];
function buildPerson(o){
  const h=o.h||1, HIP=0.93*h, B=[], parts=[];
  const bone=(par,x,y,z)=>{ const b=new T.Bone(); b.position.set(x,y,z); if(par>=0) B[par].add(b); B.push(b); return B.length-1; };
  const root=bone(-1,0,HIP,0), spine=bone(root,0,0.04*h,0), head=bone(spine,0,0.58*h,0);
  const sw=(o.female?0.18:0.205)*h;
  const shL=bone(spine,-sw,0.50*h,0), elL=bone(shL,0,-0.28*h,0), shR=bone(spine,sw,0.50*h,0), elR=bone(shR,0,-0.28*h,0);
  const hpL=bone(root,-0.095*h,-0.03*h,0), knL=bone(hpL,0,-0.44*h,0), hpR=bone(root,0.095*h,-0.03*h,0), knR=bone(hpR,0,-0.44*h,0);
  const add=(geo,m,c,b)=>parts.push({geo:geo, matrix:m, color:c, bone:b});
  const cyl=(rt,rb,len,seg)=>new T.CylinderGeometry(rt,rb,len,seg||8);
  const sph=(r,a,b)=>new T.SphereGeometry(r,a||10,b||8);
  const Y=y=>HIP+y*h;
  // pelvis and torso
  add(new T.BoxGeometry(0.30*h,0.20*h,0.19*h), _pm(0,Y(-0.01),0), o.pants, root);
  add(cyl(0.165*h*(o.female?0.92:1), 0.145*h, 0.50*h, 12), _pm(0,Y(0.30),0, 1,1,0.62), o.shirt, spine);
  add(sph(0.5,12,8), _pm(0,Y(0.52),0, (sw*2+0.04)*1.0, 0.13*h, 0.21*h), o.shirt, spine);
  if(o.female) add(sph(0.5,10,8), _pm(0,Y(0.40),0.05*h, 0.26*h,0.12*h,0.12*h), o.shirt, spine);
  add(cyl(0.048*h,0.052*h,0.10*h,8), _pm(0,Y(0.61),0.005), o.skin, spine);
  // the head: skull, nose, ears, eyes, hair
  add(sph(0.105*h,14,10), _pm(0,Y(0.73),0.01, 0.92,1.08,1.0), o.skin, head);
  add(new T.BoxGeometry(0.03*h,0.045*h,0.04*h), _pm(0,Y(0.72),0.105*h), o.skin, head);
  for(const s of [-1,1]){ add(sph(0.013*h,6,5), _pm(s*0.035*h,Y(0.745),0.093*h), "#1a1614", head);
                          add(sph(0.024*h,6,5), _pm(s*0.097*h,Y(0.73),0.0, 0.5,1,0.8), o.skin, head); }
  add(new T.SphereGeometry(0.114*h,14,8,0,Math.PI*2,0,Math.PI*0.52), _pm(0,Y(0.745),-0.008*h, 0.95,0.95,1.04), o.hair, head);
  if(o.female) add(new T.BoxGeometry(0.20*h,0.26*h,0.06*h), _pm(0,Y(0.64),-0.075*h), o.hair, head);
  if(o.cap){ add(new T.SphereGeometry(0.118*h,14,8,0,Math.PI*2,0,Math.PI*0.42), _pm(0,Y(0.758),-0.004*h), o.cap, head);
             add(new T.BoxGeometry(0.17*h,0.012*h,0.10*h), _pm(0,Y(0.785),0.10*h), o.cap, head); }
  // arms: a sleeve, the forearm, the hand
  for(const [s,sh,el] of [[-1,shL,elL],[1,shR,elR]]){
    add(cyl(0.050*h,0.045*h,0.16*h,8), _pm(s*sw,Y(0.43),0), o.shirt, sh);
    add(cyl(0.042*h,0.038*h,0.13*h,8), _pm(s*sw,Y(0.30),0), o.long?o.shirt:o.skin, sh);
    add(cyl(0.037*h,0.031*h,0.25*h,8), _pm(s*sw,Y(0.135),0), o.long?o.shirt:o.skin, el);
    add(sph(0.042*h,8,6), _pm(s*sw,Y(-0.015),0.005, 0.8,1.1,0.6), o.skin, el);
  }
  // legs: thigh, shin (bare under shorts), the shoe
  for(const [s,hp,kn] of [[-1,hpL,knL],[1,hpR,knR]]){
    add(cyl(0.078*h,0.060*h,0.45*h,9), _pm(s*0.095*h,Y(-0.255),0), o.pants, hp);
    add(cyl(0.056*h,0.045*h,0.43*h,8), _pm(s*0.095*h,Y(-0.685),0), o.shorts?o.skin:o.pants, kn);
    add(new T.BoxGeometry(0.095*h,0.075*h,0.26*h), _pm(s*0.095*h,0.04,0.045*h), o.shoes, kn);
  }
  const mesh=skinned(parts, B);
  const g=new T.Group(); g.add(mesh); scene.add(g);
  return {g:g, mesh:mesh, B:B, j:{root:root,spine:spine,head:head,shL:shL,elL:elL,shR:shR,elR:elR,hpL:hpL,knL:knL,hpR:hpR,knR:knR}, HIP:HIP, h:h};
}
function randomPerson(r){
  const pick=a=>a[(r()*a.length)|0], female=r()<0.45;
  return buildPerson({female:female, h:female?0.95+r()*0.06:1.0+r()*0.07, skin:pick(SKINS), hair:pick(HAIRS),
                      shirt:pick(SHIRTS), pants:pick(PANTS), shoes:pick(["#f2f0ea","#1d1d1f","#6b4a2b","#8d9196"]),
                      shorts:r()<0.3, long:r()<0.25, cap:r()<0.22?pick(["#b3151b","#1f3b6e","#2f5a35","#1d1d1f"]):null});
}
// poses: everything is a bone rotation off the rest pose
function poseP(p, mode, ph, t){
  const B=p.B, J=p.j, s=Math.sin(ph*Math.PI*2), c=Math.cos(ph*Math.PI*2);
  for(const b of B) b.rotation.set(0,0,0);
  B[J.root].position.y=p.HIP;
  if(mode==="walk"){
    const sL=s, sR=-s;
    B[J.hpL].rotation.x=-sL*0.42; B[J.hpR].rotation.x=-sR*0.42;
    B[J.knL].rotation.x=0.08+Math.max(0, c)*0.75; B[J.knR].rotation.x=0.08+Math.max(0,-c)*0.75;
    B[J.shL].rotation.x=sL*0.34; B[J.shR].rotation.x=sR*0.34;
    B[J.elL].rotation.x=-0.25-Math.max(0,-sL)*0.25; B[J.elR].rotation.x=-0.25-Math.max(0,-sR)*0.25;
    B[J.root].position.y=p.HIP+Math.abs(c)*0.025-0.012;
    B[J.spine].rotation.y=s*0.06; B[J.spine].rotation.x=0.04;
  }else if(mode==="sit"){
    B[J.root].position.y=0.50;
    B[J.hpL].rotation.x=B[J.hpR].rotation.x=-1.50;
    B[J.knL].rotation.x=B[J.knR].rotation.x=1.45;
    B[J.shL].rotation.x=B[J.shR].rotation.x=-0.55; B[J.elL].rotation.x=B[J.elR].rotation.x=-0.85;
    B[J.head].rotation.y=Math.sin(t*0.3+p.seed)*0.5; B[J.head].rotation.x=0.08;
  }else{
    // standing: weight on one leg, a little sway, the head looking about
    B[J.hpL].rotation.z=0.03; B[J.hpR].rotation.z=-0.02; B[J.knL].rotation.x=0.05;
    B[J.shL].rotation.z=-0.06; B[J.shR].rotation.z=0.06; B[J.elL].rotation.x=B[J.elR].rotation.x=-0.12;
    B[J.spine].rotation.y=Math.sin(t*0.4+p.seed)*0.05;
    B[J.head].rotation.y=Math.sin(t*0.25+p.seed*2)*0.45;
    if(mode==="phone"){ B[J.shR].rotation.x=-0.35; B[J.shR].rotation.z=0.35; B[J.elR].rotation.x=-2.35; B[J.head].rotation.y*=0.4; B[J.head].rotation.z=-0.12; }
    if(mode==="read"){ B[J.head].rotation.x=0.30; B[J.head].rotation.y*=0.2; B[J.shL].rotation.x=B[J.shR].rotation.x=-0.45; B[J.elL].rotation.x=B[J.elR].rotation.x=-1.1; }
    if(mode==="smoke"){ const up=smoothstep(0,0.15,(t*0.12+p.seed)%1)*(1-smoothstep(0.25,0.4,(t*0.12+p.seed)%1));
      B[J.shR].rotation.x=-0.25-up*0.55; B[J.shR].rotation.z=0.18+up*0.25; B[J.elR].rotation.x=-0.9-up*1.35; }
  }
}
/* ---- a dog: a yellow lab, on the same plan with seven bones ------------- */
function buildDog(coat){
  const B=[], parts=[];
  const bone=(par,x,y,z)=>{ const b=new T.Bone(); b.position.set(x,y,z); if(par>=0) B[par].add(b); B.push(b); return B.length-1; };
  const root=bone(-1,0,0.44,0), head=bone(root,0,0.10,0.30), tail=bone(root,0,0.06,-0.32);
  const legs=[bone(root,-0.08,-0.04,0.22), bone(root,0.08,-0.04,0.22), bone(root,-0.08,-0.03,-0.24), bone(root,0.08,-0.03,-0.24)];
  const add=(geo,m,c,b)=>parts.push({geo:geo, matrix:m, color:c, bone:b});
  add(new T.SphereGeometry(0.5,12,8), _pm(0,0.44,0, 0.24,0.25,0.66), coat, root);
  add(new T.SphereGeometry(0.5,10,8), _pm(0,0.47,0.20, 0.24,0.27,0.30), coat, root);
  add(new T.CylinderGeometry(0.065,0.08,0.18,8), _pm(0,0.53,0.30, 1,1,1, 0.7), coat, head);
  add(new T.SphereGeometry(0.085,10,8), _pm(0,0.60,0.38), coat, head);
  add(new T.BoxGeometry(0.075,0.065,0.11), _pm(0,0.575,0.47), coat, head);
  add(new T.SphereGeometry(0.018,6,5), _pm(0,0.595,0.53), "#1a1614", head);
  for(const s of [-1,1]){ add(new T.BoxGeometry(0.02,0.10,0.06), _pm(s*0.075,0.57,0.36), "#a07c4c", head);
                          add(new T.SphereGeometry(0.011,6,5), _pm(s*0.04,0.625,0.445), "#1a1614", head); }
  add(new T.TorusGeometry(0.07,0.012,5,12), _pm(0,0.53,0.31, 1,1,1, 1.2), "#b3151b", head);
  add(new T.CylinderGeometry(0.02,0.012,0.30,6), _pm(0,0.58,-0.44, 1,1,1, -0.9), coat, tail);
  legs.forEach((b,k)=>{ const x=(k%2?0.08:-0.08), z=k<2?0.22:-0.24;
    add(new T.CylinderGeometry(0.035,0.026,0.38,7), _pm(x,0.21,z), coat, b);
    add(new T.SphereGeometry(0.03,6,5), _pm(x,0.025,z+0.02, 1,0.7,1.3), coat, b); });
  const mesh=skinned(parts, B);
  const g=new T.Group(); g.add(mesh); scene.add(g);
  return {g:g, B:B, head:head, tail:tail, legs:legs};
}

/* ---- where people walk ---------------------------------------------------- */
const _WALK_X=-23.6, _DOOR={x:-7.0, z:0}, _INSIDE={x:-4.4, z:0.3};
// from a stall to the front door, the way a person would go
function _doorPath(st){
  const pts=[];
  const toPlaza=z=>{ pts.push({x:_WALK_X, z:z}); const zz=clamp(z,-12,12); pts.push({x:_WALK_X, z:zz});
    pts.push({x:-19.5, z:zz*0.5}); pts.push({x:-12, z:zz*0.15}); pts.push(_DOOR); pts.push(_INSIDE); };
  if(st.E){
    const zl=st.zs-1.375;
    pts.push({x:st.px-0.4, z:st.zs-1.05}); pts.push({x:-27.6, z:zl}); pts.push({x:-25.3, z:zl});
    toPlaza(zl);
  }else{
    const zl=st.zs+1.375, zc=st.zs>0?14.5:-14.5;
    pts.push({x:st.px+0.4, z:st.zs+1.05}); pts.push({x:-40.0, z:zl}); pts.push({x:-38.9, z:zl+(zc>zl?0.6:-0.6)});
    pts.push({x:-38.9, z:zc}); pts.push({x:-27.2, z:zc}); pts.push({x:-24.6, z:zc});
    toPlaza(zc);
  }
  return pts;
}
// a walker: follows its points at its pace, turns smoothly, stands on whatever is there
function _stepWalker(p, dt, speed){
  const tgt=p.path[p.pi];
  if(!tgt) return true;
  const dx=tgt.x-p.x, dz=tgt.z-p.z, d=Math.hypot(dx,dz);
  // stop for you, the way people do
  const px=player.pos.x-p.x, pz=player.pos.z-p.z, ahead=(px*dx+pz*dz)/(d||1);
  const pd=Math.hypot(px,pz);
  let sp=speed;
  if(!driving && pd<1.3 && ahead>0) sp=0;
  if(d<0.25){ p.pi++; return p.pi>=p.path.length; }
  const want=Math.atan2(dx,dz);
  let dy=want-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
  p.yaw+=dy*Math.min(1,dt*6);
  const step=Math.min(d, sp*dt);
  p.x+=Math.sin(p.yaw)*step; p.z+=Math.cos(p.yaw)*step;
  p.y=surfaceY(p.x, p.z, (p.y===undefined?0:p.y)+0.45);
  p.ph=(p.ph+step/1.45)%1;
  p.moving=sp>0.05;
  return false;
}
const PEOPLE_API=(function(){
  let seedR=_trng ? _trng(9137) : Math.random;
  // a driver gets out of a car that has just parked
  function arrive(v){
    const R=v.route; if(!R || !R.stall) return;
    const P=randomPerson(seedR); P.g.visible=false;
    const p={kind:"driver", P:P, v:v, path:_doorPath(R.stall), pi:0, x:0, z:0, y:0, yaw:0, ph:0, seed:Math.random()*10,
             state:"wait", t:1.6+Math.random()*1.5, done:false};
    p.x=p.path[0].x; p.z=p.path[0].z; p.y=groundY(p.x,p.z);
    R.ped=p; PEOPLE.push(p);
  }
  return {arrive:arrive};
})();
(function ambient(){
  const r=_trng(5521);
  // two at a table in the grove, by day
  const tb=PICNIC[3]||PICNIC[0];
  if(tb){
    const c=Math.cos(tb.ry), s=Math.sin(tb.ry);
    for(const [lx,lz] of [[-0.45,0.62],[0.45,-0.62]]){
      const x=tb.x+lx*c+lz*s, z=tb.z-lx*s+lz*c, P=randomPerson(r);
      PEOPLE.push({kind:"sit", P:P, x:x, z:z, y:Terrain.groundAt(tb.x,tb.z)+0.02, yaw:Math.atan2(tb.x-x, tb.z-z), seed:r()*10, dayOnly:true});
    }
  }
  // a smoker by the post outside the door, and a trucker on the phone by his rig
  PEOPLE.push({kind:"stand", mode:"smoke", P:randomPerson(r), x:-7.25, z:-2.75, y:PLAZA_Y, yaw:-Math.PI/2-0.4, seed:r()*10});
  const ts=TRUCK_STALLS.filter(s=>s.taken)[1];
  if(ts){ const x=ts.x0+ts.dx*9.0+ts.dz*1.9, z=ts.z0+ts.dz*9.0-ts.dx*1.9;
    PEOPLE.push({kind:"stand", mode:"phone", P:buildPerson({h:1.04, skin:SKINS[2], hair:HAIRS[0], shirt:"#5d6a73", pants:"#3b4a66", shoes:"#3a2a1a", long:true, cap:"#1d1d1f"}),
                 x:x, z:z, y:PAVE_T, yaw:Math.atan2(ts.dx,ts.dz)+1.8, seed:r()*10}); }
  // somebody in the lobby reading the state map
  PEOPLE.push({kind:"stand", mode:"read", P:randomPerson(r), x:-3.2, z:-4.55, y:FL, yaw:Math.PI, seed:r()*10, dayOnly:false});
  // and a dog being walked round the pet area
  const loopPts=[{x:12,z:66},{x:19,z:68},{x:25,z:75},{x:26,z:86},{x:20,z:93},{x:13,z:88},{x:10,z:77}];
  const w={kind:"dogwalk", P:randomPerson(r), path:loopPts, pi:0, x:12, z:66, y:0, yaw:0, ph:0, seed:r()*10, dayOnly:true,
           dog:buildDog(r()<0.5?"#c9a066":"#2a2420"), pause:0, dx:12, dz:64.5, dyaw:0, dph:0, sniff:0};
  const lm=new T.LineBasicMaterial({color:0x8a1a1a});
  w.leash=new T.Line(new T.BufferGeometry().setFromPoints([V3(),V3()]), lm); w.leash.frustumCulled=false; scene.add(w.leash);
  PEOPLE.push(w);
})();
const _hand=new T.Vector3(), _col=new T.Vector3();
function updatePeople(dt, now, dark){
  for(let i=PEOPLE.length-1;i>=0;i--){
    const p=PEOPLE[i], P=p.P;
    if(P.seed===undefined) P.seed=p.seed||0;
    if(p.dayOnly){ const on=dark<0.55; P.g.visible=on; if(p.dog){ p.dog.g.visible=on; p.leash.visible=on; } if(!on) continue; }
    const cd=Math.hypot(p.x-camera.position.x, p.z-camera.position.z);
    if(p.kind==="sit"){ if(cd<90) poseP(P,"sit",0,now); P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw; continue; }
    if(p.kind==="stand"){ if(cd<90) poseP(P,p.mode,0,now); P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw; continue; }
    if(p.kind==="dogwalk"){
      if(p.pause>0){ p.pause-=dt; p.moving=false; }
      else if(_stepWalker(p, dt, 0.95)){ p.pi=0; }
      if(p.pause<=0 && Math.random()<dt*0.04) p.pause=3+Math.random()*5;
      poseP(P, p.moving?"walk":"stand", p.ph, now);
      P.B[P.j.shL].rotation.x=-0.35; P.B[P.j.elL].rotation.x=-0.6;              // the leash hand
      P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw;
      // the dog: trots after the hand, sniffs when the walker stops
      const D=p.dog, lx=p.x+Math.sin(p.yaw-0.9)*1.6, lz=p.z+Math.cos(p.yaw-0.9)*1.6;
      const ddx=lx-p.dx, ddz=lz-p.dz, dd=Math.hypot(ddx,ddz);
      let sp=dd>0.5 ? Math.min(2.2, dd*1.6) : 0;
      if(sp>0){ const want=Math.atan2(ddx,ddz); let dy=want-p.dyaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
        p.dyaw+=dy*Math.min(1,dt*5); p.dx+=Math.sin(p.dyaw)*sp*dt; p.dz+=Math.cos(p.dyaw)*sp*dt; p.dph=(p.dph+sp*dt/0.9)%1; }
      for(let k=0;k<4;k++) D.B[D.legs[k]].rotation.x=sp>0 ? Math.sin((p.dph+(k===0||k===3?0:0.5))*Math.PI*2)*0.55 : 0;
      D.B[D.tail].rotation.y=Math.sin(now*11)*0.45;
      D.B[D.head].rotation.x=(sp>0?0.05:0.55+Math.sin(now*3)*0.1);
      D.g.position.set(p.dx, Terrain.groundAt(p.dx,p.dz), p.dz); D.g.rotation.y=p.dyaw;
      // the leash, hand to collar
      P.mesh.updateMatrixWorld(true);
      _hand.setFromMatrixPosition(P.B[P.j.elL].matrixWorld); _hand.y-=0.24;
      D.g.updateMatrixWorld(true); _col.set(0,0.55,0.31).applyMatrix4(D.g.matrixWorld);
      const a=p.leash.geometry.attributes.position; a.setXYZ(0,_hand.x,_hand.y,_hand.z); a.setXYZ(1,_col.x,_col.y,_col.z); a.needsUpdate=true;
      continue;
    }
    if(p.kind==="driver"){
      const R=p.v.route;
      if(p.state==="wait"){ p.t-=dt; if(p.t<=0){ p.state="out"; P.g.visible=true; if(typeof AUDIO!=="undefined") AUDIO.blip("door",p.x,p.z); } }
      else if(p.state==="out"){ if(_stepWalker(p, dt, 1.3)){ p.state="in"; P.g.visible=false; p.t=25+Math.random()*55; } }
      else if(p.state==="in"){ p.t-=dt; if(p.t<=0){ p.state="back"; p.path=p.path.slice().reverse(); p.pi=0; P.g.visible=true; } }
      else if(p.state==="back"){ if(_stepWalker(p, dt, 1.25)){ p.state="gone"; P.g.visible=false; p.t=2.5;
        if(typeof AUDIO!=="undefined") AUDIO.blip("door",p.x,p.z); } }
      else if(p.state==="gone"){ p.t-=dt; if(p.t<=0){ p.done=true; scene.remove(P.g); P.mesh.geometry.dispose(); PEOPLE.splice(i,1); continue; } }
      if(P.g.visible){ poseP(P, p.moving?"walk":"stand", p.ph, now); P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw; }
      if(!R) p.done=true;
    }
  }
}
