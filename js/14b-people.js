"use strict";
/* REST AREA · 14b-people.js
   the people: drivers out of the cars that pull in, someone at a picnic
   table, a dog being walked and a smoker by the post
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
  // a gut over the belt, and a vest open down the front over it: the hi-vis a driver wears
  // round a lot, two silver bands round it (each piece a size out from the one under it)
  if(o.belly) add(sph(0.5,12,9), _pm(0,Y(0.17),0.045*h, 0.31*h,0.30*h,0.23*h), o.shirt, spine);
  if(o.vest){ const vz=o.belly?1.0:0.66, vo=o.belly?0.02*h:0;           // cut fuller round a gut
    const vt=(r,y,len,c)=>add(new T.CylinderGeometry(r*1.0,r*0.94,len,14,1,true, 0.55, Math.PI*2-1.1), _pm(0,Y(y),vo, 1,1,vz), c, spine);
    vt(0.178*h, 0.31, 0.44*h, o.vest); vt(0.183*h, 0.20, 0.035*h, "#d9dcd8"); vt(0.180*h, 0.40, 0.035*h, "#d9dcd8"); }
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
  // a beard and a moustache, under the cap; shades across the eyes
  if(o.beard){ add(sph(0.5,12,8), _pm(0,Y(0.668),0.042*h, 0.19*h,0.14*h,0.15*h), o.beard, head);
               add(new T.BoxGeometry(0.075*h,0.016*h,0.02*h), _pm(0,Y(0.697),0.112*h), o.beard, head); }
  if(o.shades) add(new T.BoxGeometry(0.155*h,0.032*h,0.012*h), _pm(0,Y(0.748),0.106*h), "#121416", head);
  // a trucker's cap is two panels, the foam front a colour of its own and the mesh round the back
  // (the two meet at an edge, they do not lie one over the other)
  if(o.cap){ const f=o.capFront, cs=(a0,a1,c)=>add(new T.SphereGeometry(0.118*h,14,8,a0,a1,0,Math.PI*0.42), _pm(0,Y(0.758),-0.004*h), c, head);
             if(f){ cs(Math.PI/2-0.9, 1.8, f); cs(Math.PI/2+0.9, Math.PI*2-1.8, o.cap); } else cs(0, Math.PI*2, o.cap);
             add(new T.BoxGeometry(0.17*h,0.012*h,0.10*h), _pm(0,Y(0.785),0.10*h), o.cap, head); }
  if(o.beanie){ add(new T.SphereGeometry(0.119*h,14,8,0,Math.PI*2,0,Math.PI*0.46), _pm(0,Y(0.752),-0.006*h, 1,1.12,1), o.beanie, head);
                add(new T.CylinderGeometry(0.121*h,0.121*h,0.04*h,14,1,true), _pm(0,Y(0.785),-0.006*h), o.beanie, head); }
  // a hoodie: the hood up over the head (open at the face) or down on the
  // shoulders, the drawstrings, the pocket across the front
  if(o.hoodie){
    if(o.hoodUp) add(new T.SphereGeometry(0.132*h,16,10, Math.PI/2+0.95, Math.PI*2-1.9, 0, Math.PI*0.66),
                     _pm(0,Y(0.738),-0.02*h, 0.98,1.06,1.10), o.shirt, head);
    else add(new T.SphereGeometry(0.12*h,12,8, Math.PI, Math.PI, Math.PI*0.25, Math.PI*0.55), _pm(0,Y(0.575),-0.05*h, 1.25,0.70,0.95), o.shirt, spine);
    for(const s of [-1,1]) add(new T.CylinderGeometry(0.004*h,0.004*h,0.13*h,4), _pm(s*0.035*h,Y(0.47),0.10*h), "#e8e6df", spine);
    add(new T.BoxGeometry(0.21*h,0.10*h,0.02*h), _pm(0,Y(0.15),0.092*h), o.pocket||o.shirt, spine);
  }
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
    if(o.boots) add(new T.BoxGeometry(0.10*h,0.15*h,0.27*h), _pm(s*0.095*h,0.075*h,0.045*h), o.shoes, kn);   // work boots, laced up the shin
    else add(new T.BoxGeometry(0.095*h,0.075*h,0.26*h), _pm(s*0.095*h,0.04,0.045*h), o.shoes, kn);
  }
  const mesh=skinned(parts, B);
  const g=new T.Group(); g.add(mesh); scene.add(g);
  return {g:g, mesh:mesh, B:B, j:{root:root,spine:spine,head:head,shL:shL,elL:elL,shR:shR,elR:elR,hpL:hpL,knL:knL,hpR:hpR,knR:knR}, HIP:HIP, h:h, female:!!o.female};
}
function randomPerson(r){
  const pick=a=>a[(r()*a.length)|0], female=r()<0.45;
  return buildPerson({female:female, h:female?0.95+r()*0.06:1.0+r()*0.07, skin:pick(SKINS), hair:pick(HAIRS),
                      shirt:pick(SHIRTS), pants:pick(PANTS), shoes:pick(["#f2f0ea","#1d1d1f","#6b4a2b","#8d9196"]),
                      shorts:r()<0.3, long:r()<0.25, cap:r()<0.22?pick(["#b3151b","#1f3b6e","#2f5a35","#1d1d1f"]):null});
}
// the smoker's cycle: the hand comes up (0..0.15), holds at the mouth for
// the drag (to 0.25), and goes down again by 0.4; once every 8 s or so
const _smokeCyc=(t,seed)=>(t*0.12+seed)%1;
const _smokeUp=c=>smoothstep(0,0.15,c)*(1-smoothstep(0.25,0.4,c));
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
    // the drag: the arm comes forward and in, the elbow folds right up and
    // the forearm turns over, so the fingers end at the lips; the head
    // stops looking about and meets the hand
    if(mode==="smoke"){ const up=_smokeUp(_smokeCyc(t,p.seed));
      B[J.shR].rotation.set(-0.25-up*1.008, -up*0.817, 0.18-up*0.165);
      B[J.elR].rotation.set(-0.9-up*1.30, up*0.875, 0);
      B[J.head].rotation.y*=1-up; B[J.head].rotation.x=-0.04*up; }
  }
}
/* ---- a lit cigarette, held in the right hand ------------------------------
   Filter, paper, and a coal at the end that brightens on the drag. It
   rides on the forearm's bone, so it goes up to the mouth with the hand,
   and the fingers turn it as a wrist would (see updateCigarette): held low
   it points forward, out and down; at the mouth the filter is between the
   lips and the lit end points out and away from the face. */
const CIG_MAT={paper:new T.MeshStandardMaterial({color:0xf2f0ea, roughness:0.7}),
               filter:new T.MeshStandardMaterial({color:0xc98f52, roughness:0.75}),
               ash:new T.MeshStandardMaterial({color:0x6b6763, roughness:0.95})};
function giveCigarette(P){
  const g=new T.Group(), h=P.h;
  const part=(r0,r1,len,z,mat)=>{ const m=new T.Mesh(new T.CylinderGeometry(r1,r0,len,8), mat); m.rotation.x=Math.PI/2; m.position.z=z; g.add(m); return m; };
  part(0.0044,0.0044,0.024, 0.012, CIG_MAT.filter);
  part(0.0042,0.0042,0.054, 0.051, CIG_MAT.paper);
  part(0.0042,0.0040,0.004, 0.080, CIG_MAT.ash);
  const coal=part(0.0040,0.0034,0.004, 0.084, new T.MeshBasicMaterial({color:0xff5a1a, toneMapped:false}));
  const glow=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff6420, transparent:true, depthWrite:false,
                                                blending:T.AdditiveBlending, opacity:0.5, toneMapped:false}));
  glow.scale.set(0.05,0.05,1); glow.position.z=0.085; g.add(glow);
  const tip=new T.Object3D(); tip.position.z=0.088; g.add(tip);
  g.position.set(0.014, -0.29*h, 0.022);
  P.B[P.j.elR].add(g);
  return {g:g, coal:coal, glow:glow, tip:tip, wisp:0, puff:0};
}
// where the filter sits on the forearm (in bone space, per metre of height)
// and which way the lit end points (in the body's frame: x out to the
// right, y up, z forward), hand down and hand at the mouth
const CIG_POS0=V3(0.014,-0.290,0.022), CIG_POS1=V3(-0.013,-0.346,0.009);
const CIG_DIR0=V3(0.35,-0.40,0.85).normalize(), CIG_DIR1=V3(0.42,-0.12,0.90).normalize();
const _cq=new T.Quaternion(), _cqB=new T.Quaternion(), _cd=new T.Vector3(), _cZ=V3(0,0,1);
function holdCigarette(C, P, up){
  C.g.position.lerpVectors(CIG_POS0, CIG_POS1, up).multiplyScalar(P.h);
  _cd.lerpVectors(CIG_DIR0, CIG_DIR1, up).normalize();
  P.B[P.j.spine].getWorldQuaternion(_cqB); _cd.applyQuaternion(_cqB);
  P.B[P.j.elR].getWorldQuaternion(_cq); _cd.applyQuaternion(_cq.invert());
  C.g.quaternion.setFromUnitVectors(_cZ, _cd);
}
const _tipW=new T.Vector3(), _mouthW=new T.Vector3();
function updateCigarette(p, dt, now, dark){
  const C=p.cig, P=p.P, cyc=_smokeCyc(now,P.seed), up=_smokeUp(cyc);
  holdCigarette(C, P, up);
  // the coal: dull red, and bright while it is drawn on
  const drag=up>0.85 && cyc>0.15 && cyc<0.27 ? 1 : 0;
  C.heat=(C.heat||0.3)+((drag?1:0.3)-(C.heat||0.3))*Math.min(1,dt*(drag?5:1.5));
  C.coal.material.color.setRGB(0.55+0.45*C.heat, 0.12+0.30*C.heat*C.heat, 0.03+0.06*C.heat);
  C.glow.material.opacity=(0.18+0.55*dark)*(0.35+0.65*C.heat);
  const s=0.035+0.035*C.heat; C.glow.scale.set(s,s,1);
  if(Math.hypot(p.x-camera.position.x, p.z-camera.position.z)>60) return;
  // a thread of smoke off the end, and the breath out after each drag
  C.tip.getWorldPosition(_tipW);
  C.wisp-=dt;
  if(C.wisp<=0){ C.wisp=0.09+Math.random()*0.06;
    PUFFS.emit(_tipW.x, _tipW.y+0.01, _tipW.z, (Math.random()-0.5)*0.03, 0.16+Math.random()*0.06, (Math.random()-0.5)*0.03,
               0.02, 0.26+Math.random()*0.08, 2.6+Math.random()*0.8, 0.62, 0.92, 0); }
  if(cyc>0.31 && cyc<0.43){
    C.puff-=dt;
    if(C.puff<=0){ C.puff=0.045;
      const hb=P.B[P.j.head]; _mouthW.set(0, 0.08*P.h, 0.11*P.h).applyMatrix4(hb.matrixWorld);
      const fx=Math.sin(p.yaw), fz=Math.cos(p.yaw), k=1-(cyc-0.31)/0.12;
      PUFFS.emit(_mouthW.x, _mouthW.y, _mouthW.z, fx*(0.55*k+0.15)+(Math.random()-0.5)*0.08, 0.05+Math.random()*0.08,
                 fz*(0.55*k+0.15)+(Math.random()-0.5)*0.08, 0.06, 0.55+Math.random()*0.18, 3.0+Math.random()*0.8, 0.55*k+0.10, 0.92, 0);
    }
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
  // along the walk to the gap between the flower beds (|z| < 4.5), clear of
  // the bin in the middle of it, then straight across the plaza to the door
  const toPlaza=z=>{ pts.push({x:_WALK_X, z:z});
    let zz=clamp(z,-3.3,3.3); if(Math.abs(zz)<1.25) zz=(z<0?-1.25:1.25);
    pts.push({x:_WALK_X, z:zz}); pts.push({x:-19.5, z:zz*0.85}); pts.push({x:-12, z:zz*0.3});
    pts.push(_DOOR); pts.push(_INSIDE); };
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
/* ---- keeping clear ---------------------------------------------------------
   A person is a disc BODY_R across. They do not stand in a collider (a
   planter, a post, a bin, a parked car) or on a flower bed, and nobody walks
   into another person. _hitAt answers whether a disc there would touch any
   of it; a walker probes ahead with it and bends its line round whatever
   is in the way, the side it first chose, until the way is clear. */
const BODY_R=0.28;
function _hitAt(x, z, y, r, self){
  const own=self && self.v ? self.v.col : null;                         // a driver's own car is not in the way
  const hit=c=>{ if(c===own || c.y1<y+0.30 || c.y0>y+1.75) return false;  // a curb is stepped over
    if(c.ob) return obNear(c.ob,x,z,r);
    const qx=clamp(x,c.x0,c.x1), qz=clamp(z,c.z0,c.z1), dx=x-qx, dz=z-qz;
    return dx*dx+dz*dz<r*r; };
  const near=colsNear(x,z);
  for(let i=0;i<near.length;i++) if(hit(near[i])) return true;
  for(let i=0;i<COL_BIG.length;i++) if(hit(COL_BIG[i])) return true;
  for(let i=0;i<COL_DYN.length;i++) if(hit(COL_DYN[i])) return true;
  for(const k of KEEP_OFF) if(x>k.x0-r && x<k.x1+r && z>k.z0-r && z<k.z1+r) return true;
  for(const q of PEOPLE){
    if(q===self || !q.P || !q.P.g.visible || q.kind==="driver" && q.state!=="out" && q.state!=="back" && q.state!=="inside") continue;
    if(q.sat) continue;                                                  // sat in a stall, behind its door
    if(Math.abs(q.y-y)<1.2 && (q.x-x)*(q.x-x)+(q.z-z)*(q.z-z)<(r+BODY_R)*(r+BODY_R)) return true;
  }
  return false;
}
// the nearest place to (x,z) at the same level where a person stands clear
function _clearSpot(x, z, y, self){
  const r=BODY_R+0.10;
  if(!_hitAt(x,z,y,r,self)) return {x:x, z:z};
  for(let d=0.1; d<=2.5; d+=0.1) for(let k=0;k<24;k++){
    const a=k/24*Math.PI*2, cx=x+Math.sin(a)*d, cz=z+Math.cos(a)*d;
    if(Math.abs(surfaceY(cx,cz,y+0.3)-y)<0.08 && !_hitAt(cx,cz,y,r,self)) return {x:cx, z:cz};
  }
  return {x:x, z:z};
}
// a walker: follows its points at its pace, turns smoothly, steps round
// what is in its way, stands on whatever is there
function _stepWalker(p, dt, speed){
  const tgt=p.path[p.pi];
  if(!tgt) return true;
  const dx=tgt.x-p.x, dz=tgt.z-p.z, d=Math.hypot(dx,dz);
  // stop for you, the way people do
  const px=player.pos.x-p.x, pz=player.pos.z-p.z, ahead=(px*dx+pz*dz)/(d||1);
  const pd=Math.hypot(px,pz);
  let sp=speed;
  if(!driving && pd<1.3 && ahead>0) sp=0;
  // there, or as near as it can be got (held up, or a long while circling it)
  p.wpT=(p.wpT||0)+dt;
  if(d<0.25 || (d<0.9 && p.stuck>0.6) || (d<2.5 && p.wpT>9)){ p.pi++; p.stuck=0; p.wpT=0; return p.pi>=p.path.length; }
  let want=Math.atan2(dx,dz);
  // look a stride ahead; if that is blocked, bend the line a little at a
  // time toward the side already chosen, then the other, until it is not.
  // Someone already in a tight spot (or held up for long) just goes on out.
  const y=(p.y===undefined?0:p.y), look=Math.min(0.75, d);
  const free=a=>!_hitAt(p.x+Math.sin(a)*look, p.z+Math.cos(a)*look, y, BODY_R, p) &&
                !_hitAt(p.x+Math.sin(a)*look*0.5, p.z+Math.cos(a)*look*0.5, y, BODY_R, p);
  const loose=(p.stuck||0)>1.5 || _hitAt(p.x, p.z, y, BODY_R*0.8, p);
  if(!loose && !free(want)){
    const side=p.side||1; let found=false;
    bend: for(const k of [1,2,3,4,5,6]) for(const s of [side,-side]){
      const a=want+s*k*0.28;
      if(free(a)){ want=a; p.side=s; found=true; break bend; }
    }
    if(!found){ sp=0; p.stuck=(p.stuck||0)+dt; }
  }else if(p.side && Math.random()<dt*0.5) p.side=0;
  let dy=want-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
  p.yaw+=dy*Math.min(1,dt*7);
  const step=Math.min(d, sp*dt), nx=p.x+Math.sin(p.yaw)*step, nz=p.z+Math.cos(p.yaw)*step;
  // never into anything: hold where you are instead, and after a moment
  // give the point up and make for the next one
  if(step>0 && !loose && _hitAt(nx, nz, y, BODY_R*0.9, p)){ p.stuck=(p.stuck||0)+dt; p.moving=false; return false; }
  if(step>0) p.stuck=Math.max(0,(p.stuck||0)-dt*0.5);
  p.x=nx; p.z=nz;
  p.y=surfaceY(p.x, p.z, y+0.45);
  p.ph=(p.ph+step/1.45)%1;
  p.moving=sp>0.05 && step>0;
  return false;
}
// someone coming or going is at this door: it opens for them (17-player).
// A stall's door opens only for whoever is going in or coming out of it,
// and only as they reach it; with them sat inside it stays shut.
function npcNearDoor(d){
  const reach=d.stall ? 0.95 : 2.4;
  for(const p of PEOPLE){
    if(p.cust){ if(p.holdDoor===d) return true;
      if(!p.walking || (d.occ && d.occBy!==p)) continue;
      if(Math.abs(p.y-d.y)<1.8 && Math.hypot(p.x-d.x, p.z-d.z)<reach) return true;
      continue; }
    if(p.kind!=="driver") continue;
    if(p.state!=="out" && p.state!=="back" && !(p.state==="inside" && p.walking)) continue;
    if(d.occ && d.occBy!==p) continue;
    if(Math.abs(p.y-d.y)<1.8 && Math.hypot(p.x-d.x, p.z-d.z)<reach) return true;
  }
  return false;
}

/* ---- inside: what people come in for -------------------------------------
   Nobody pulls off I-79 to stand in the lobby. They use the restroom (a
   urinal or a stall, then a sink, sometimes the dryer), or buy something
   from the machines, or turn the brochure rack a while, or a bit of each;
   then back out to the car. The way between is found on a grid over the
   building's floor round everything solid in it, and pulled straight
   wherever a line is clear. Now and then whoever was in a stall leaves it
   in a state (09-building's MESS): somebody has to clean that up. */
const _IG={x0:-5.65, z0:-14.1, x1:5.65, z1:14.1, cs:0.2, nx:0, nz:0, ok:null};
function _staticHit(x, z, y, r){
  const hit=c=>{ if(c.y1<y+0.30 || c.y0>y+1.75) return false;
    if(c.ob) return obNear(c.ob,x,z,r);
    const qx=clamp(x,c.x0,c.x1), qz=clamp(z,c.z0,c.z1), dx=x-qx, dz=z-qz;
    return dx*dx+dz*dz<r*r; };
  const near=colsNear(x,z);
  for(let i=0;i<near.length;i++) if(hit(near[i])) return true;
  for(let i=0;i<COL_BIG.length;i++) if(hit(COL_BIG[i])) return true;
  return false;
}
function _igBuild(){
  const G=_IG; G.nx=Math.round((G.x1-G.x0)/G.cs)+1; G.nz=Math.round((G.z1-G.z0)/G.cs)+1;
  G.ok=new Uint8Array(G.nx*G.nz);
  for(let j=0;j<G.nz;j++) for(let i=0;i<G.nx;i++){
    const x=G.x0+i*G.cs, z=G.z0+j*G.cs;
    G.ok[j*G.nx+i]=(!_staticHit(x,z,FL,BODY_R+0.04) && Math.abs(surfaceY(x,z,FL+0.4)-FL)<0.06) ? 1 : 0;
  }
}
function _igCell(x,z){ const G=_IG, i=Math.round((x-G.x0)/G.cs), j=Math.round((z-G.z0)/G.cs);
  return (i<0||j<0||i>=G.nx||j>=G.nz) ? -1 : j*G.nx+i; }
function _igNear(x,z){
  const G=_IG, c=_igCell(x,z); if(c>=0 && G.ok[c]) return c;
  let best=-1, bd=1e9;
  const i0=Math.round((x-G.x0)/G.cs), j0=Math.round((z-G.z0)/G.cs);
  for(let dj=-5;dj<=5;dj++) for(let di=-5;di<=5;di++){
    const i=i0+di, j=j0+dj; if(i<0||j<0||i>=G.nx||j>=G.nz || !G.ok[j*G.nx+i]) continue;
    const d=di*di+dj*dj; if(d<bd){ bd=d; best=j*G.nx+i; }
  }
  return best;
}
function _igLOS(ax,az,bx,bz){
  const d=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(d/0.07));
  for(let k=0;k<=n;k++){ const t=k/n, c=_igCell(ax+(bx-ax)*t, az+(bz-az)*t); if(c<0 || !_IG.ok[c]) return false; }
  return true;
}
// A* over the grid, 8 ways, no cutting corners; the cells pulled into a few straight legs
function _igPath(ax, az, bx, bz){
  if(!_IG.ok) _igBuild();
  const G=_IG, s=_igNear(ax,az), g=_igNear(bx,bz);
  if(s<0 || g<0) return [{x:bx, z:bz}];
  const N=G.nx*G.nz, gs=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), shut=new Uint8Array(N);
  const gi=g%G.nx, gj=(g/G.nx)|0, h=c=>{ const i=c%G.nx, j=(c/G.nx)|0, di=Math.abs(i-gi), dj=Math.abs(j-gj); return Math.max(di,dj)+0.414*Math.min(di,dj); };
  // the open set: a binary heap on f
  const hc=[], hf=[];
  const hpush=(c,f)=>{ let i=hc.length; hc.push(c); hf.push(f);
    while(i>0){ const p=(i-1)>>1; if(hf[p]<=hf[i]) break; [hc[p],hc[i]]=[hc[i],hc[p]]; [hf[p],hf[i]]=[hf[i],hf[p]]; i=p; } };
  const hpop=()=>{ const c=hc[0], lc=hc.pop(), lf=hf.pop();
    if(hc.length){ hc[0]=lc; hf[0]=lf; let i=0;
      for(;;){ const l=i*2+1, r=l+1; let m=i;
        if(l<hc.length && hf[l]<hf[m]) m=l; if(r<hc.length && hf[r]<hf[m]) m=r;
        if(m===i) break; [hc[m],hc[i]]=[hc[i],hc[m]]; [hf[m],hf[i]]=[hf[i],hf[m]]; i=m; } }
    return c; };
  gs[s]=0; hpush(s, h(s));
  while(hc.length){
    const c=hpop();
    if(c===g) break;
    if(shut[c]) continue; shut[c]=1;
    const ci=c%G.nx, cj=(c/G.nx)|0;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
      if(!di && !dj) continue;
      const i=ci+di, j=cj+dj; if(i<0||j<0||i>=G.nx||j>=G.nz) continue;
      const n=j*G.nx+i; if(!G.ok[n] || shut[n]) continue;
      if(di && dj && (!G.ok[cj*G.nx+i] || !G.ok[j*G.nx+ci])) continue;
      const ng=gs[c]+(di&&dj?1.414:1);
      if(ng<gs[n]){ gs[n]=ng; from[n]=c; hpush(n, ng+h(n)); }
    }
  }
  if(from[g]<0 && g!==s) return [{x:bx, z:bz}];
  const cells=[]; for(let c=g; c>=0; c=from[c]){ cells.push(c); if(c===s) break; }
  cells.reverse();
  const pt=c=>({x:G.x0+(c%G.nx)*G.cs, z:G.z0+((c/G.nx)|0)*G.cs});
  const out=[]; let cur={x:ax, z:az}, k=0;
  while(k<cells.length-1){
    let far=k+1;
    for(let m=k+2;m<cells.length;m++){ const q=pt(cells[m]); if(_igLOS(cur.x,cur.z,q.x,q.z)) far=m; else break; }
    cur=pt(cells[far]); out.push(cur); k=far;
  }
  if(out.length) out.pop();
  out.push({x:bx, z:bz});
  return out;
}
const _VEND_SPOTS=[-3.35,-2.25,-1.15].map(z=>({x:LOBBY.x1-1.36, z:z, yaw:Math.PI/2, busy:null}));
const _RACK_SPOT={x:-3.92, z:-3.6, yaw:-Math.PI/2, busy:null};
const _MAP_SPOT={x:-3.2, z:-4.55, yaw:Math.PI, busy:null};          // in front of the state map on the north wall
// is the player standing on it (or about to)? then it is not free
const _youAt=(x,z,r)=>!driving && !droneMode && Math.abs(player.feetY-FL)<1 && Math.hypot(player.pos.x-x, player.pos.z-z)<r;
function _planInside(p){
  const room=p.P.female ? RESTROOMS.women : RESTROOMS.men, plan=[], r=Math.random();
  if(r<0.66){
    plan.push({kind:(!p.P.female && Math.random()<0.62) ? "urinal" : "stall", room:room});
    if(Math.random()<0.85) plan.push({kind:"sink", room:room});
    if(Math.random()<0.45) plan.push({kind:"dryer", room:room});
    if(Math.random()<0.22) plan.push({kind:"vend"});
    else if(Math.random()<0.12) plan.push({kind:"rack"});
    else if(Math.random()<0.16) plan.push({kind:"map"});
  }else if(r<0.86){
    if(Math.random()<0.3) plan.push({kind:"rack"});
    if(Math.random()<0.25) plan.push({kind:"map"});
    plan.push({kind:"vend"});
  }else plan.push({kind:Math.random()<0.5?"rack":"map"});
  return plan;
}
// a free one of the kind wanted (a clean stall over a dirty one)
function _pickSpot(step){
  let list;
  if(step.kind==="urinal") list=step.room.urinals.filter(u=>!u.low || Math.random()<0.2);
  else if(step.kind==="stall"){ list=step.room.stalls; const clean=list.filter(s=>!s.mess && !s.busy); if(clean.length) list=clean; }
  else if(step.kind==="sink") list=step.room.sinks;
  else if(step.kind==="dryer") list=step.room.dryers;
  else if(step.kind==="vend") list=_VEND_SPOTS;
  else if(step.kind==="map") list=[_MAP_SPOT];
  else list=[_RACK_SPOT];
  const free=list.filter(o=>!o.busy && !_youAt(o.sit?o.sit.x:o.x, o.sit?o.sit.z:o.z, 0.8));
  return free.length ? free[(Math.random()*free.length)|0] : null;
}
const _DUR={urinal:[16,32], stall:[40,110], sink:[5,9], dryer:[7,11], vend:[9,13], rack:[9,24], map:[10,26]};
// begin the next thing on the list: find a free one, and the way to it
function _nextStep(p){
  const step=p.plan[p.si];
  if(!step){                                              // done: to the door, then the way back to the car
    p.path=_igPath(p.x, p.z, _INSIDE.x, _INSIDE.z); p.pi=0; p.walking=true; p.leaving=true; p.spot=null; return; }
  if(step.kind==="vend" && GRID.bldg<0.5){ p.si++; _nextStep(p); return; }      // the machines are dark
  const o=_pickSpot(step);
  if(!o){ p.waitT=(p.waitT||0)+1; if(p.waitT>14){ p.waitT=0; p.si++; } p.hold=1; return; }   // all taken: wait, or give it up
  p.waitT=0; o.busy=p; p.spot=o; p.act=step.kind;
  const D=_DUR[step.kind]; p.dur=D[0]+Math.random()*(D[1]-D[0]);
  if(step.kind==="stall") p.path=_igPath(p.x, p.z, o.front.x, o.front.z).concat([o.mouth, o.inside]);
  else p.path=_igPath(p.x, p.z, o.x, o.z);
  p.pi=0; p.wpT=0; p.walking=true; p.doing=0;
}
// let go of whatever they were at
function _freeSpot(p){
  const o=p.spot; if(!o) return;
  if(o.busy===p) o.busy=null;
  if(o.door && o.door.occBy===p){ o.door.occ=false; o.door.occBy=null; }
  if(o.col){ const i=COL_DYN.indexOf(o.col); if(i>=0) COL_DYN.splice(i,1); }
  p.spot=null;
}
function _stepInside(p, dt, now){
  if(p.hold>0){ p.hold-=dt; if(p.hold<=0) _nextStep(p); return; }
  if(p.walking){
    if(_stepWalker(p, dt, 1.1)){
      p.walking=false;
      if(p.leaving){ p.state="back"; p.path=p.out.slice().reverse(); p.pi=1; p.leaving=false; return; }
      if(p.act==="stall-out"){ _freeSpot(p); p.si++; _nextStep(p); return; }
      // there: face the thing, and get on with it
      p.doing=0; p.x0=p.x; p.z0=p.z;
      if(p.act==="stall"){ const o=p.spot; o.door.occ=true; o.door.occBy=p; }
    }
    return;
  }
  const o=p.spot; if(!o){ _nextStep(p); return; }
  p.doing+=dt;
  // the last step or two up to it, square on
  if(!p.sat){ const at=p.act==="stall" ? o.inside : o, k=Math.min(1, dt*3);
    p.x+=(at.x-p.x)*k; p.z+=(at.z-p.z)*k; }
  let dy=o.yaw-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
  p.yaw+=dy*Math.min(1,dt*5);
  if(p.act==="stall"){
    // the door shuts behind them, then they sit; when they get up, a
    // flush, and once in a while they leave it for somebody else
    if(p.doing>0.8 && !p.sat){ p.sat=true; p.x=o.sit.x; p.z=o.sit.z; }
    if(p.doing>p.dur){
      p.sat=false; p.x=o.inside.x; p.z=o.inside.z;
      if(Math.random()<0.24){ o.mess=true; o.messMesh.visible=true; }
      else if(typeof AUDIO!=="undefined" && AUDIO.flush) AUDIO.flush(o.tx, o.dz);
      if(o.mess && Math.random()<0.5 && typeof AUDIO!=="undefined" && AUDIO.flush) AUDIO.flush(o.tx, o.dz);   // flushed, and it did not go
      p.act="stall-out"; p.walking=true; p.path=[o.mouth, o.front]; p.pi=0;
    }
    return;
  }
  if(p.act==="urinal" && p.doing>p.dur && !p.flushed){ p.flushed=true; if(typeof AUDIO!=="undefined" && AUDIO.flush && Math.random()<0.8) AUDIO.flush(o.x, o.z); }
  if(p.act==="dryer" && !p.dried && p.doing>0.6){ p.dried=true; if(typeof AUDIO!=="undefined") AUDIO.blip("dryer", o.x, o.z); }
  if(p.act==="vend"){
    if(!p.paid && p.doing>2.5){ p.paid=true; if(typeof AUDIO!=="undefined") AUDIO.blip("coin", o.x, o.z); }
    if(!p.got && p.doing>p.dur*0.62){ p.got=true; if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", o.x, o.z); }
  }
  if(p.doing>p.dur){ p.flushed=p.dried=p.paid=p.got=false; _freeSpot(p); p.si++; _nextStep(p); }
}
// how each of those looks, over the standing (or sitting) pose
function _poseInside(p, now){
  const P=p.P, B=P.B, J=P.j, u=p.doing||0, a=p.act;
  if(p.walking || !p.spot){ poseP(P, p.moving?"walk":"stand", p.ph, now); return; }
  if(a==="stall"){
    if(p.sat){ poseP(P, "sit", 0, now);
      B[J.head].rotation.set(0.38, 0, 0);                              // on the phone, like everyone
      B[J.shR].rotation.set(-0.62, 0, 0.18); B[J.elR].rotation.x=-1.55; B[J.shL].rotation.x=-0.25; B[J.elL].rotation.x=-0.5; }
    else poseP(P, "stand", 0, now);
    return;
  }
  if(a==="rack"){ poseP(P, "read", 0, now); B[J.head].rotation.y=Math.sin(now*0.4+p.seed)*0.25; return; }
  if(a==="map"){ poseP(P, "stand", 0, now);
    // looking it over, the head going along the interstates; now and then a finger on where we are
    B[J.head].rotation.set(-0.06+Math.sin(now*0.23+p.seed)*0.05, Math.sin(now*0.31+p.seed)*0.3, 0);
    const pt=Math.max(0, Math.sin(u*0.35+p.seed)), up=smoothstep(0.55,0.8,pt);
    B[J.shR].rotation.set(-0.12-up*1.25, 0, -0.06+up*0.2); B[J.elR].rotation.x=-0.12-up*0.35;
    B[J.shL].rotation.set(0.05, 0, 0.12); B[J.elL].rotation.x=-0.6; return; }
  poseP(P, "stand", 0, now);
  B[J.head].rotation.y*=0.2;
  if(a==="urinal"){
    B[J.shL].rotation.set(-0.38, 0, 0.22); B[J.shR].rotation.set(-0.38, 0, -0.22);
    B[J.elL].rotation.x=B[J.elR].rotation.x=-0.45;
    B[J.head].rotation.x=u<3 ? 0.35 : -0.05+Math.sin(now*0.3+p.seed)*0.05; B[J.head].rotation.y=u<3?0:Math.sin(now*0.2+p.seed)*0.3;
  }else if(a==="sink"||a==="dryer"){
    const rub=Math.sin(now*(a==="sink"?9:6))*0.08;
    B[J.shL].rotation.set(a==="sink"?-0.72:-0.95, 0, 0.20); B[J.shR].rotation.set(a==="sink"?-0.72:-0.95, 0, -0.20);
    B[J.elL].rotation.x=-0.55+rub; B[J.elR].rotation.x=-0.55-rub;
    B[J.head].rotation.x=0.30; B[J.spine].rotation.x=a==="sink"?0.12:0.04;
  }else if(a==="vend"){
    const t=u/(p.dur||10);
    if(t<0.55){ B[J.shR].rotation.set(-1.15, 0, -0.05); B[J.elR].rotation.x=-0.45+Math.sin(now*5)*0.04*(t>0.2?1:0); B[J.head].rotation.x=0.05; }
    else if(t<0.62){ B[J.head].rotation.x=0.25; }
    else if(t<0.82){ B[J.spine].rotation.x=0.75; B[J.head].rotation.x=0.15;
      B[J.hpL].rotation.x=B[J.hpR].rotation.x=-0.55; B[J.knL].rotation.x=B[J.knR].rotation.x=0.95;
      B[J.root].position.y=P.HIP-0.20; B[J.shR].rotation.set(-1.0, 0, 0); B[J.elR].rotation.x=-0.2; }
    else { B[J.shR].rotation.set(-0.6, 0, 0); B[J.elR].rotation.x=-1.2; B[J.head].rotation.x=0.2; }   // reading the wrapper
  }
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
  // a smoker by the post outside the door, on the paving between the
  // planter and the doors' swing, facing the lot, a cigarette going
  const sm={kind:"stand", mode:"smoke", P:randomPerson(r), x:-7.35, z:-1.95, y:PLAZA_Y, yaw:-Math.PI/2-0.25, seed:r()*10};
  sm.cig=giveCigarette(sm.P); PEOPLE.push(sm);
  // (the truckers, the one on the phone among them, are 14i's)
  // (the state map in the lobby is one of the things visitors stop at: _MAP_SPOT)
  // somebody sat in the grass with their back to the big boulder by the
  // grove, legs out, a paperback; now and then a page, now and then a look round
  { const P=randomPerson(r), bk=new T.Group();
    for(const sd of [-1,1]){ const pg=new T.Mesh(new T.BoxGeometry(0.075,0.008,0.11), new T.MeshStandardMaterial({color:sd<0?0x2a5d9a:0xf2efe6, roughness:0.8}));
      pg.position.set(sd*0.038, 0, 0); pg.rotation.z=-sd*0.25; bk.add(pg); }
    bk.position.set(-0.06, -0.31, 0.06); P.B[P.j.elR].add(bk);
    PEOPLE.push({kind:"custom", P:P, x:24.48, z:-33.85, y:0, yaw:-Math.PI/2, seed:r()*10, dayOnly:true,
      upd:(p, dt, now, dark, cd)=>{
        const on=dark<0.55; P.g.visible=on; if(!on) return;
        p.y=Terrain.groundAt(p.x,p.z);
        if(cd<80){ poseP(P, "stand", 0, now); const B=P.B, J=P.j;
          B[J.root].position.y=0.13;
          B[J.hpL].rotation.set(-1.50, 0, 0.10); B[J.hpR].rotation.set(-1.42, 0, -0.06);
          B[J.knL].rotation.x=0.10; B[J.knR].rotation.x=0.55;                        // one knee up
          B[J.spine].rotation.x=-0.30;                                               // back to the rock
          const look=smoothstep(0.85,0.97,Math.sin(now*0.11+p.seed));                // now and then, a look round
          B[J.head].rotation.set(0.55-look*0.6, look*0.7*Math.sin(now*0.3), 0);
          B[J.shR].rotation.set(-0.95, 0, -0.10); B[J.elR].rotation.x=-1.05;
          const turn=smoothstep(0.96,1.0,Math.sin(now*0.23+p.seed*3));             // a page
          B[J.shL].rotation.set(-0.85-turn*0.2, 0, 0.12+turn*0.2); B[J.elL].rotation.x=-1.15; }
        P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw; }});
    KEEP_OFF.push({x0:23.6, x1:25.4, z0:-34.4, z1:-33.3}); }
  // and a dog being walked round the pet area
  // (south of the bag dispenser at 15.4, 67.2, not through it)
  const loopPts=[{x:12,z:65.4},{x:19,z:65.8},{x:25,z:73},{x:26,z:86},{x:20,z:93},{x:13,z:88},{x:10,z:77}];
  const w={kind:"dogwalk", P:randomPerson(r), path:loopPts, pi:0, x:12, z:66, y:0, yaw:0, ph:0, seed:r()*10, dayOnly:true,
           dog:buildDog(r()<0.5?"#c9a066":"#2a2420"), pause:0, dx:12, dz:64.5, dyaw:0, dph:0, sniff:0};
  const lm=new T.LineBasicMaterial({color:0x8a1a1a});
  w.leash=new T.Line(new T.BufferGeometry().setFromPoints([V3(),V3()]), lm); w.leash.frustumCulled=false; scene.add(w.leash);
  PEOPLE.push(w);
  // nobody is placed standing in anything: each one standing is moved, if
  // need be, to the nearest spot at the same level that is clear
  for(const p of PEOPLE) if(p.kind==="stand"){ const c=_clearSpot(p.x, p.z, p.y, p); p.x=c.x; p.z=c.z; }
})();
const _hand=new T.Vector3(), _col=new T.Vector3();
function updatePeople(dt, now, dark){
  for(let i=PEOPLE.length-1;i>=0;i--){
    const p=PEOPLE[i], P=p.P;
    if(P.seed===undefined) P.seed=p.seed||0;
    if(p.dayOnly){ const on=dark<0.55; P.g.visible=on; if(p.dog){ p.dog.g.visible=on; p.leash.visible=on; } if(!on) continue; }
    const cd=Math.hypot(p.x-camera.position.x, p.z-camera.position.z);
    if(p.kind==="sit"){ if(cd<90) poseP(P,"sit",0,now); P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw; continue; }
    if(p.kind==="teen" || p.kind==="custom"){ p.upd(p, dt, now, dark, cd); continue; }
    if(p.kind==="stand"){ if(cd<90) poseP(P,p.mode,0,now); P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw;
      if(p.cig) updateCigarette(p, dt, now, dark);
      continue; }
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
      if(sp>0){ let want=Math.atan2(ddx,ddz);
        // round a post or a bin, not through it
        const gy=Terrain.groundAt(p.dx,p.dz), clear=a=>!_hitAt(p.dx+Math.sin(a)*0.55, p.dz+Math.cos(a)*0.55, gy, 0.26, p);
        if(!clear(want)){ let ok=false; for(const k of [1,2,3,4,5]){ for(const s of [1,-1]) if(clear(want+s*k*0.35)){ want+=s*k*0.35; ok=true; break; } if(ok) break; }
          if(!ok) sp=0; }
        let dy=want-p.dyaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
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
      else if(p.state==="out"){ if(_stepWalker(p, dt, 1.3)){ p.state="inside"; p.out=p.path; p.plan=_planInside(p); p.si=0; _nextStep(p); } }
      else if(p.state==="inside"){ _stepInside(p, dt, now); }
      else if(p.state==="back"){ if(_stepWalker(p, dt, 1.25)){ p.state="gone"; P.g.visible=false; p.t=2.5;
        if(typeof AUDIO!=="undefined") AUDIO.blip("door",p.x,p.z); } }
      else if(p.state==="gone"){ p.t-=dt; if(p.t<=0){ p.done=true; scene.remove(P.g); P.mesh.geometry.dispose(); PEOPLE.splice(i,1); continue; } }
      if(P.g.visible){
        if(p.state==="inside"){ if(cd<60) _poseInside(p, now); }
        else poseP(P, p.moving?"walk":"stand", p.ph, now);
        P.g.position.set(p.x,p.y,p.z); P.g.rotation.y=p.yaw; }
      if(!R){ p.done=true; if(p.spot) _freeSpot(p); }
    }
  }
}
