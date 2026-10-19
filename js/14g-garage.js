"use strict";
/* REST AREA · 14g-garage.js
   the maintenance garage east of the building, its gravel yard and the
   track out of the back of it; what is kept in it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14g · THE MAINTENANCE GARAGE
   A rest area is kept by a custodial and grounds contractor, and their
   gear has to live somewhere. Behind the building, past the loop walk and
   the two spruces, a tan block garage with a low brown roof stands on a
   gravel yard cut back into the woods: two roll-up doors and a steel man
   door facing the building, a light over each. In the first bay, nose out,
   the pickup with the plow on it, a light bar on the cab and a spreader on
   the hitch; in the second the zero-turn mower and a walk-behind spreader.
   At the back: the workbench under a pegboard, the parts washer, steel
   shelving full of cases of roll towel and tissue, the cleaning carts, a
   cot along the wall, a coffee maker that is never off, and a jobsite radio
   on the bench playing to nobody. Out in the yard: the three-sided salt and
   sand bin, a pallet of ice melt, the fuel tank, the dumpster, and in the
   back corner the gravel track that goes off through a pipe gate to the
   township road. 14h is the person who works out of it.
   ---------------------------------------------------------------------- */
const GARAGE_RT={doors:[], lights:0, radio:null, cart:null, mower:null, blower:null};
// a few things drawn here and moved about in 14h
const _GAR_MAT=new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.18});
function _garMesh(E, mat){ const m=new T.Mesh(mergeEntries(E), mat||_GAR_MAT); m.castShadow=true; m.receiveShadow=true; return m; }
function _ge(E, geo, x,y,z, c, rx,ry,rz){
  E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z), new T.Quaternion().setFromEuler(new T.Euler(rx||0, ry||0, rz||0, "YXZ")), V3(1,1,1)),
          color:new T.Color(c)});
}
// a tube between two local points, for the frames of things
function _gt(E, a, b, r, c){
  const d=new T.Vector3().subVectors(b,a), L=d.length(), g=new T.CylinderGeometry(r, r, L, 6);
  const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize());
  E.push({geo:g, matrix:new T.Matrix4().compose(new T.Vector3().addVectors(a,b).multiplyScalar(0.5), q, V3(1,1,1)), color:new T.Color(c)});
}
/* ---- the cleaning cart: a platform on casters, shelves at the handle end,
   the vinyl bag on the far end, the mop bucket docked ahead of it. Its own
   +z is the way it is pushed; the handle is at -z. */
function cartEntries(E, spare){
  const Y="#d6ae22", G="#4a4c4e", K="#1d1d1e";
  _ge(E, boxGeo(0.54, 0.06, 1.12, 0), 0, 0.16, 0.0, G);
  for(const [x,z] of [[-0.22,-0.48],[0.22,-0.48],[-0.22,0.48],[0.22,0.48]]){
    _ge(E, new T.CylinderGeometry(0.065,0.065,0.04,10), x, 0.065, z, K, 0, 0, Math.PI/2);
    _ge(E, boxGeo(0.03, 0.07, 0.05, 0), x, 0.12, z, G); }
  // the shelves at the handle end, and the handle
  _ge(E, boxGeo(0.52, 0.02, 0.46, 0), 0, 0.56, -0.30, Y);
  _ge(E, boxGeo(0.52, 0.02, 0.46, 0), 0, 0.92, -0.30, Y);
  for(const x of [-0.25,0.25]) for(const z of [-0.52,-0.08]) _ge(E, boxGeo(0.03, 0.78, 0.03, 0), x, 0.55, z, Y);
  _gt(E, V3(-0.25,0.94,-0.53), V3(-0.25,1.02,-0.62), 0.016, G); _gt(E, V3(0.25,0.94,-0.53), V3(0.25,1.02,-0.62), 0.016, G);
  _gt(E, V3(-0.27,1.02,-0.62), V3(0.27,1.02,-0.62), 0.018, G);
  // what is on them: spray bottles, a caddy with the brush, a stack of roll towel and tissue
  for(let k=0;k<4;k++){ const c=["#3f8fd0","#3aa35a","#e8e4d4","#d84a2a"][k];
    _ge(E, new T.CylinderGeometry(0.035,0.04,0.17,8), -0.17+k*0.11, 1.015, -0.38, c);
    _ge(E, boxGeo(0.03,0.05,0.05,0), -0.17+k*0.11, 1.12, -0.38, "#e9e6dc"); }
  _ge(E, boxGeo(0.30, 0.12, 0.18, 0), 0.05, 0.99, -0.16, "#2a5d9a");
  _gt(E, V3(0.12,0.95,-0.16), V3(0.14,1.22,-0.16), 0.012, "#e9e6dc");
  _ge(E, new T.SphereGeometry(0.045,8,6), 0.14, 0.98, -0.16, "#e9e6dc");
  for(let k=0;k<3;k++) _ge(E, new T.CylinderGeometry(0.11,0.11,0.24,12), -0.13+k*0.13, 0.69, -0.30, "#f2efe6", 0, 0, Math.PI/2);
  // the bag: yellow vinyl, a black liner turned over its top
  _ge(E, boxGeo(0.48, 0.70, 0.44, 0), 0, 0.53, 0.31, Y);
  _ge(E, boxGeo(0.50, 0.05, 0.46, 0), 0, 0.905, 0.31, K);
  if(!spare){ _ge(E, new T.IcosahedronGeometry(0.14, 1), 0.04, 0.95, 0.33, K); }
  // the mop bucket docked ahead, its wringer and the mop
  _ge(E, boxGeo(0.40, 0.34, 0.36, 0), 0, 0.27, 0.78, Y);
  _ge(E, boxGeo(0.36, 0.02, 0.32, 0), 0, 0.42, 0.78, "#6a7a7c");
  _ge(E, boxGeo(0.30, 0.16, 0.16, 0), 0, 0.53, 0.70, "#2c2c2c");
  _gt(E, V3(0.10,0.45,0.86), V3(0.06,1.30,0.66), 0.014, "#c9cbcc");
  _ge(E, boxGeo(0.12, 0.10, 0.10, 0), 0.10, 0.47, 0.86, "#e9e6dc");
  // the yellow sign, folded, clipped to the side
  _ge(E, boxGeo(0.02, 0.62, 0.30, 0), 0.28, 0.55, 0.30, "#e8c21e");
}
/* ---- the zero-turn: deck under the middle, big drive tyres at the back,
   casters at the front, the seat over the engine, the hoop behind it. */
function mowerParts(){
  const E=[], O="#c9541c", D="#2f3032", K="#1b1b1c", S="#3a3a3a";
  _ge(E, boxGeo(1.32, 0.13, 0.72, 0), 0, 0.20, 0.22, D);                      // the deck
  _ge(E, boxGeo(0.22, 0.10, 0.30, 0), -0.74, 0.19, 0.22, D, 0, 0, 0.35);       // the chute, to the right
  _ge(E, boxGeo(0.86, 0.10, 1.70, 0), 0, 0.36, -0.02, S);                     // the frame
  _ge(E, boxGeo(0.62, 0.04, 0.40, 0), 0, 0.42, 0.62, "#55575a");              // the footplate
  _ge(E, boxGeo(0.76, 0.34, 0.52, 0), 0, 0.60, -0.62, O);                     // the engine's tin
  for(const x of [-0.50,0.50]) _ge(E, boxGeo(0.26, 0.14, 0.44, 0), x, 0.66, -0.46, O);   // the tanks over the tyres
  _ge(E, boxGeo(0.50, 0.08, 0.44, 0), 0, 0.72, -0.20, K);                     // the seat
  _ge(E, boxGeo(0.50, 0.44, 0.08, 0), 0, 0.95, -0.42, K, -0.15);
  for(const x of [-0.52,0.52]) _gt(E, V3(x,0.55,-0.72), V3(x,1.72,-0.72), 0.03, S);   // the hoop
  _gt(E, V3(-0.52,1.72,-0.72), V3(0.52,1.72,-0.72), 0.03, S);
  for(const x of [-0.32,0.32]){ _gt(E, V3(x,0.62,-0.05), V3(x,0.92,0.12), 0.016, S);   // the lap bars
    _gt(E, V3(x,0.92,0.12), V3(x*0.55,0.92,0.18), 0.016, S);
    _ge(E, boxGeo(0.10,0.04,0.04,0), x*0.78, 0.92, 0.16, K); }
  for(const x of [-0.42,0.42]){ _ge(E, boxGeo(0.03, 0.22, 0.05, 0), x, 0.24, 0.66, S); }   // caster forks
  for(const x of [-0.42,0.42]) _ge(E, new T.CylinderGeometry(0.115,0.115,0.08,12), x, 0.115, 0.66, K, 0, 0, Math.PI/2);
  const body=_garMesh(E);
  // the drive tyres are their own, so they turn
  const tg=new T.CylinderGeometry(0.29,0.29,0.24,18); tg.rotateZ(Math.PI/2);
  const tm=new T.MeshStandardMaterial({color:0x1d1d1e, roughness:0.9});
  const g=new T.Group(); g.add(body); const tyres=[];
  for(const x of [-0.53,0.53]){ const t=new T.Mesh(tg, tm); t.position.set(x, 0.29, -0.45); t.castShadow=true; g.add(t); tyres.push(t); }
  g.rotation.order="YXZ";
  return {g:g, tyres:tyres};
}
/* ---- the backpack blower: the engine on its frame, the tube round the
   right hip and out in front. Hung on the wall, or worn. */
function blowerParts(){
  const E=[], O="#d86a1c", G="#4a4c4e", K="#1d1d1e";
  _ge(E, boxGeo(0.34, 0.40, 0.08, 0), 0, 0, 0, K);                            // the back pad
  _ge(E, boxGeo(0.30, 0.30, 0.26, 0), 0, -0.02, -0.17, O);                     // the engine
  _ge(E, new T.CylinderGeometry(0.15,0.15,0.08,16), 0, -0.04, -0.33, G, Math.PI/2, 0, 0);   // the fan housing
  _gt(E, V3(-0.10,-0.18,-0.25), V3(-0.24,-0.30,-0.05), 0.045, G);
  for(const x of [-0.12,0.12]) _ge(E, boxGeo(0.05, 0.50, 0.03, 0), x, 0.02, 0.06, K, 0.2);   // the straps
  const m=_garMesh(E), F=[];
  _gt(F, V3(0,0,0), V3(-0.02,-0.06,0.40), 0.045, "#6b6d70");
  _gt(F, V3(-0.02,-0.06,0.40), V3(-0.02,-0.32,1.00), 0.040, "#e8e4d8");
  _ge(F, boxGeo(0.05,0.10,0.10,0), 0.04, 0.0, 0.35, K);                          // the throttle grip
  const tube=_garMesh(F); tube.position.set(-0.24,-0.30,-0.05); m.add(tube); m.userData.tube=tube;
  return m;
}

(function garage(){
  const n0=scene.children.length;
  const X0=GARAGE.x0, X1=GARAGE.x1, Z0=GARAGE.z0, Z1=GARAGE.z1, Y=GARAGE.yard;
  const GF=FL, T2=0.20, EV=GF+4.0, XM=(X0+X1)/2, RIDGE=EV+1.15;
  const BLK="#cbbd98", TRIM="#5b4a3a", ROOF="#5d4a3a";
  const r=_trng(4479);
  GARAGE.GF=GF; GARAGE.EV=EV;
  const gy=(x,z)=>Terrain.groundAt(x,z);

  /* ---- the yard ---------------------------------------------------------- */
  push("gravelbed", planeGeo(Y.x1-Y.x0, Y.z1-Y.z0, 0.5), (Y.x0+Y.x1)/2, 0.012, (Y.z0+Y.z1)/2, 0, "#a29d92", -Math.PI/2, 0);
  addZone(Y.x0, Y.x1, Y.z0, Y.z1, -1, 6, "THE MAINTENANCE YARD");
  // ruts worn into it from the doors to the track, and puddles in them
  { const R=[]; for(let k=0;k<=12;k++){ const t=k/12; R.push({x:30.0+(40.5-30.0)*t+Math.sin(t*3)*1.2, z:29.0+(43.5-29.0)*t*t}); }
    const P=smoothPath(R, 1.0);
    for(const [o,y] of [[-0.85,0.018],[0.85,0.021]]){ const g=ribbonGeo(P, o-0.24, o+0.24, y, 0.5);
      g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x,-c.y,-c.z);
      push("paintm", g, c.x, c.y, c.z, 0, "#7d786c"); } }
  for(let k=0;k<4;k++) push("paintm", new T.CircleGeometry(0.3+r()*0.4, 12), 33+r()*6, 0.024+k*0.0003, 32+r()*9, r()*3, "#5a5a54", -Math.PI/2, 0);
  // the track's gravel, out through the gate and away under the trees
  { const P=SERVICE;
    const g=ribbonGeo(P, -1.5, 1.5, 0.045, 0.5); g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c);
    g.translate(-c.x,-c.y,-c.z); push("gravelbed", g, c.x, c.y, c.z, 0, "#9a968c"); }

  /* ---- the slab and the apron ------------------------------------------- */
  bx("concrete", X1-X0+0.1, 0.5, Z1-Z0+0.1, XM, GF-0.25, (Z0+Z1)/2, 0.6, 0, "#b3afa6");
  addFlat(X0+T2, X1-T2, Z0+T2, Z1-T2, GF);
  floorAt("concrete", X0+T2, X1-T2, Z0+T2, Z1-T2, GF+0.004, "#a9a59c", 0.5);
  // the apron in front of the bays, and the stoop at the man door
  bx("concrete", 3.8, GF+0.196, 7.9, X0-1.9, (GF-0.204)/2, 28.55, 0.6, 0, "#b7b3aa");
  addFlat(X0-3.8, X0, 24.6, 32.5, GF);
  bx("concrete", 1.3, GF+0.196, 1.6, X0-0.65, (GF-0.204)/2, 33.68, 0.6, 0, "#b7b3aa");
  addFlat(X0-1.3, X0, 32.88, 34.48, GF);
  // oil where the truck stands, and under the mower
  [[34.6,26.5,0.9],[35.6,26.1,0.5],[38.6,26.9,0.4],[35.3,30.95,0.6]].forEach(([x,z,s],k)=>
    push("paintm", new T.CircleGeometry(s,14), x, GF+0.008+k*0.0016, z, 0, "#55524a", -Math.PI/2, 0));
  push("steel", new T.CircleGeometry(0.16,12), 37.2, GF+0.009, 30.4, 0, "#5a5e60", -Math.PI/2, 0);       // the floor drain

  /* ---- the walls ---------------------------------------------------------- */
  const BAYA={a:24.9, b:28.1, sill:GF-0.6, head:GF+3.2}, BAYB={a:29.0, b:32.2, sill:GF-0.6, head:GF+3.2},
        MAN={a:33.2, b:34.15, sill:GF-0.6, head:GF+2.14}, WINW={a:35.5, b:36.8, sill:GF+1.0, head:GF+2.2},
        WINE={a:28.6, b:30.0, sill:GF+1.3, head:GF+2.3}, WINS={a:35.0, b:36.3, sill:GF+1.15, head:GF+2.25};
  runZ("block", X0+T2/2, T2, Z0, Z1, GF-0.4, EV, [BAYA, BAYB, MAN, WINW], BLK, 0.6);
  runZ("block", X1-T2/2, T2, Z0, Z1, GF-0.4, EV, [WINE], BLK, 0.6);
  runX("block", Z0+T2/2, T2, X0+T2, X1-T2, GF-0.4, EV, [], BLK, 0.6);
  runX("block", Z1-T2/2, T2, X0+T2, X1-T2, GF-0.4, EV, [WINS], BLK, 0.6);
  // the gables, block to the roof
  for(const z of [Z0+T2/2, Z1-T2/2])
    push("block", prismGeo([[X0+0.02,EV],[X1-0.02,EV],[XM,RIDGE-0.08]], T2, 0.6), 0, 0, z, 0, BLK);
  // a band of darker paint along the foot of the walls, where the splash goes
  lineZ("paintm", X0, -1, Z0, Z1, GF-0.05, GF+0.35, [BAYA, BAYB, MAN], "#8a7d62", 0.5, 0.006);
  lineZ("paintm", X1, 1, Z0, Z1, GF-0.05, GF+0.35, [], "#8a7d62", 0.5, 0.006);
  lineX("paintm", Z0, -1, X0, X1, GF-0.05, GF+0.35, [], "#8a7d62", 0.5, 0.006);
  lineX("paintm", Z1, 1, X0, X1, GF-0.05, GF+0.35, [], "#8a7d62", 0.5, 0.006);
  // the windows: a steel sash, wired glass
  const win=(axis, f, o, out)=>{
    const w=o.b-o.a, h=o.head-o.sill, cx=(o.a+o.b)/2, cy=(o.sill+o.head)/2;
    if(axis==="z"){ push("glass", boxGeo(0.02, h-0.04, w-0.04, 0), f, cy, cx, 0, "#cfd8d8");
      for(const d of [-1,1]) bx("paintm", T2+0.06, 0.05, w+0.08, f, d<0?o.sill-0.025:o.head+0.025, cx, 0, 0, TRIM);
      bx("paintm", 0.05, h, 0.04, f, cy, cx, 0, 0, TRIM); bx("paintm", 0.044, 0.04, w, f, cy, cx, 0, 0, TRIM);
      bx("concrete", 0.16, 0.06, w+0.12, f+out*0.13, o.sill-0.045, cx, 0.6, 0, "#b7b3aa"); }
    else { push("glass", boxGeo(w-0.04, h-0.04, 0.02, 0), cx, cy, f, 0, "#cfd8d8");
      for(const d of [-1,1]) bx("paintm", w+0.08, 0.05, T2+0.06, cx, d<0?o.sill-0.025:o.head+0.025, f, 0, 0, TRIM);
      bx("paintm", 0.04, h, 0.05, cx, cy, f, 0, 0, TRIM); bx("paintm", w, 0.04, 0.044, cx, cy, f, 0, 0, TRIM);
      bx("concrete", w+0.12, 0.06, 0.16, cx, o.sill-0.045, f+out*0.13, 0.6, 0, "#b7b3aa"); }
  };
  win("z", X0+T2/2, WINW, -1); win("z", X1-T2/2, WINE, 1); win("x", Z1-T2/2, WINS, 1);

  /* ---- the roof: brown steel, low, the ridge running north-south --------- */
  { const OH=0.35, RT=0.07, slopeY=x=>EV+(RIDGE-EV)*(1-Math.abs(x-XM)/((X1-X0)/2));
    const eY=slopeY(X0-OH);
    for(const sd of [-1,1]){
      const xe=sd<0?X0-OH:X1+OH;
      const o2=OH+(sd>0?0.006:0);                    // (the two slabs' gable ends a few mm apart where they meet at the ridge)
      push("roofmetal", new FaceGeo().slab([V3(xe,eY,Z0-o2), V3(XM,RIDGE,Z0-o2), V3(XM,RIDGE,Z1+o2), V3(xe,eY,Z1+o2)], RT, 0.5).geo(), 0,0,0, 0, ROOF);
      // the ribs down it
      for(let z=Z0-OH+0.3; z<Z1+OH-0.1; z+=0.6){
        const a=V3(xe, eY+0.025, z), b=V3(XM-sd*0.05, RIDGE+0.022, z);
        tube("roofmetal", a, b, 0.018, 3, ROOF); }
      // the fascia and a gutter, a downspout at each end
      bx("paintm", 0.04, 0.18, Z1-Z0+2*OH, xe, eY-0.10, (Z0+Z1)/2, 0, 0, TRIM);
      push("paintm", boxGeo(0.12, 0.10, Z1-Z0+2*OH+0.012, 0), xe+sd*0.07, eY-0.13, (Z0+Z1)/2, 0, "#6a5a48");   // (its ends past the fascia's)
      for(const z of [Z0+0.15, Z1-0.15]){ const x=sd<0?X0-0.06:X1+0.06;
        bx("paintm", 0.08, eY-0.15, 0.08, x, (eY-0.15)/2, z, 0, 0, "#6a5a48");
        push("paintm", boxGeo(0.10, 0.06, 0.30, 0), x+sd*0.05, 0.05, z, 0, "#6a5a48"); }
    }
    bx("roofmetal", 0.42, 0.06, Z1-Z0+2*OH, XM, RIDGE+0.03, (Z0+Z1)/2, 0.5, 0, "#4e3e30");
    // the rakes at the gables
    for(const z of [Z0-OH, Z1+OH]) for(const sd of [-1,1]){
      const xe=sd<0?X0-OH:X1+OH;
      tube("paintm", V3(xe, eY-0.02, z), V3(XM, RIDGE-0.02, z), 0.05, 4, TRIM); }
    // inside: the trusses, and the purlins they carry
    const under=x=>slopeY(x)-RT-0.06;
    for(let z=Z0+1.0; z<Z1-0.5; z+=2.0){
      bx("beam", X1-X0-2*T2, 0.16, 0.05, XM, EV-0.10, z, 0.6, 0, "#8a6e4c");
      tube("beam", V3(X0+T2, EV-0.02, z), V3(XM, under(XM), z), 0.05, 4, "#8a6e4c");
      tube("beam", V3(X1-T2, EV-0.02, z), V3(XM, under(XM), z), 0.05, 4, "#8a6e4c");
      bx("beam", 0.05, under(XM)-EV+0.05, 0.04, XM, (under(XM)+EV-0.05)/2, z, 0.6, 0, "#8a6e4c");
      for(const sd of [-1,1]) tube("beam", V3(XM+sd*2.15, EV-0.02, z), V3(XM, under(XM)-0.05, z), 0.03, 4, "#8a6e4c");
    }
    for(const sd of [-1,1]) for(const f of [0.25,0.6,0.9]){ const x=XM+sd*(X1-X0)/2*(1-f);
      bx("beam", 0.10, 0.06, Z1-Z0-2*T2, x, under(x)-0.01, (Z0+Z1)/2, 0.6, 0, "#7a6046"); }
  }

  /* ---- the bay doors: a drum over each opening inside, tracks down the
     jambs, and the curtain, which rolls up into the drum by day ----------- */
  const slat=(function(){ const c=cvs(32,64), x=c.getContext("2d");
    x.fillStyle="#ddd7c6"; x.fillRect(0,0,32,64);
    x.fillStyle="#a39c8a"; x.fillRect(0,0,32,7); x.fillStyle="#f1ede2"; x.fillRect(0,7,32,4);
    x.fillStyle="rgba(0,0,0,0.06)"; x.fillRect(0,40,32,24);
    return c; })();
  for(const [o,lab] of [[BAYA,"THE TRUCK BAY"],[BAYB,"THE MOWER BAY"]]){
    const w=o.b-o.a, top=o.head, xi=X0+T2+0.05;
    cyl("metal", 0.24, 0.24, w+0.30, 14, X0+T2+0.30, top+0.32, (o.a+o.b)/2, "#9aa0a2", Math.PI/2, 0, 0);
    for(const z of [o.a-0.02, o.b+0.02]){
      bx("metal", 0.10, top-GF+0.05, 0.06, xi, (GF+top)/2, z, 0.5, 0, "#8d9396");
      bx("metal", 0.06, 0.40, 0.06, X0+T2+0.18, top+0.25, z, 0.5, 0, "#8d9396"); }
    bx("paintm", 0.06, 0.22, 0.10, X0+T2+0.04, GF+1.25, o.b+0.25, 0, 0, "#3a3a3a");          // the switch: up, down, stop
    for(const k of [0,1,2]) bx("paintm", 0.02, 0.04, 0.04, X0+T2+0.075, GF+1.32-k*0.065, o.b+0.25, 0, 0, ["#2a8a3a","#b02a1a","#d9a520"][k]);
    // the curtain: its own mesh, cut to however much of it is down
    const tex=setSRGB(new T.CanvasTexture(slat)); tex.wrapS=tex.wrapT=T.RepeatWrapping;
    const mat=new T.MeshStandardMaterial({map:tex, roughness:0.55, metalness:0.25});
    const cur=new T.Mesh(new T.BoxGeometry(0.035, 1, w), mat); cur.castShadow=true; cur.receiveShadow=true;
    const bar=new T.Mesh(new T.BoxGeometry(0.06, 0.05, w-0.012), new T.MeshStandardMaterial({color:0x2a2a2a, roughness:0.8}));
    const g=new T.Group(); g.add(cur); g.add(bar); scene.add(g);
    const col={x0:X0+0.02, x1:X0+0.12, z0:o.a, z1:o.b, y0:top, y1:top};
    COL_DYN.push(col);
    const D={o:o, top:top, h:0.14, want:0.14, cur:cur, bar:bar, tex:tex, col:col, x:X0+0.07, label:lab, moving:false};
    D.set=function(h){ D.h=h; cur.scale.y=h; cur.position.set(D.x, top-h/2, (o.a+o.b)/2); bar.position.set(D.x, top-h, (o.a+o.b)/2);
      tex.repeat.set(1, h/0.075); col.y0=top-h; col.y1=top+0.1; };
    D.set(0.14);
    GARAGE_RT.doors.push(D);
  }
  // the man door, steel, opening out, and its frame
  frameZ(X0+T2/2, T2, MAN.a, MAN.b, MAN.head, TRIM);
  makeDoor(XF(X0+T2/2, MAN.b-0.04, Math.PI/2), 0, GF+0.02, 0, "MAINTENANCE · STAFF ONLY", false, 0, "steel", 0x7c7464);
  addFlat(X0-0.05, X0+T2+0.05, MAN.a, MAN.b, GF);
  for(const o of [BAYA, BAYB]) addFlat(X0-0.05, X0+T2+0.05, o.a, o.b, GF);
  GARAGE_RT.man={out:{x:X0-0.75, z:(MAN.a+MAN.b)/2}, in:{x:X0+T2+0.65, z:(MAN.a+MAN.b)/2}};
  addZone(X0, X1, Z0, Z1, GF-0.6, EV+1.3, "THE MAINTENANCE GARAGE", true);

  /* ---- lights: tubes under the trusses, wall packs over the doors -------- */
  bucketOf("gtube", ()=>emitMat(0xeef2f0, 0.85, "indoor", "garage"));
  for(const z of [27.0, 34.0]) for(const x of [35.2, 38.8]){
    bx("paintm", 0.30, 0.08, 1.24, x, EV-0.36, z, 0, 0, "#e6e6e2");
    push("gtube", boxGeo(0.24, 0.02, 1.16, 0), x, EV-0.405, z, 0, "#ffffff");
    for(const dz of [-0.5,0.5]) tube("metal", V3(x, EV-0.32, z+dz), V3(x, EV-0.18, z+dz), 0.006, 3, "#8a8a8a"); }
  for(const z of [27.0, 34.0]) LAMPS.push({x:37.0, y:EV-0.6, z:z, color:0xf2f6f2, intensity:0.85, dist:9.5, decay:1.4, indoor:true, circ:"garage",
              vol:[X0+0.1, X1-0.1, Z0+0.1, Z1-0.1, GF-1, EV+1.5]});
  for(const [z,y] of [[28.55, GF+3.62],[33.68, GF+2.55]]){
    bx("paintm", 0.20, 0.24, 0.30, X0-0.10, y, z, 0, 0, "#3e332b");
    push("lamplens", boxGeo(0.02, 0.14, 0.22, 0), X0-0.205, y-0.02, z, 0, "#ffffff");
    LAMPS.push({x:X0-0.6, y:y-0.2, z:z, color:0xffd9a8, intensity:z<30?1.15:0.8, dist:z<30?17:10, decay:1.5, circ:"site"});
    push("lightpool", discGeo(z<30?6.5:3.5, 24, 0), X0-(z<30?3.2:1.6), z<30?0.03:0.034, z, 0, "#ffe2b8"); }

  /* ---- signs -------------------------------------------------------------- */
  wallSign(2.6, 0.52, (c,W,H)=>{ c.fillStyle="#f4f2ea"; rrect(c,0,0,W,H,12); c.fill(); c.fillStyle="#1d3b8a"; rrect(c,8,8,W-16,H-16,10); c.fill();
      c.fillStyle="#f2c230"; c.beginPath(); const kx=H*0.62, ky=H/2;            // a keystone
      c.moveTo(kx-H*0.30,ky-H*0.32); c.lineTo(kx+H*0.30,ky-H*0.32); c.lineTo(kx+H*0.20,ky+H*0.32); c.lineTo(kx-H*0.20,ky+H*0.32); c.closePath(); c.fill();
      c.fillStyle="#f4f2ea"; fitHwy(c,"PENNDOT · I-79 NB REST AREA",W*0.66,H*0.30,W*0.58,H*0.36); fitHwy(c,"MAINTENANCE",W*0.5,H*0.26,W*0.58,H*0.70); },
    X0-0.012, GF+3.66, (BAYA.a+BAYA.b)/2, -Math.PI/2);
  wallSign(0.62, 0.34, (c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#b3151b"; c.fillRect(0,0,W,H*0.36);
      c.fillStyle="#f4f2ea"; fitHwy(c,"NOTICE",W*0.6,H*0.24,W/2,H*0.18); c.fillStyle="#1a1a1a";
      fitHwy(c,"AUTHORIZED",W*0.86,H*0.20,W/2,H*0.55); fitHwy(c,"PERSONNEL ONLY",W*0.86,H*0.18,W/2,H*0.80); },
    X0-0.012, GF+2.42, MAN.a-0.42, -Math.PI/2);
  wallSign(0.70, 0.40, (c,W,H)=>{ c.fillStyle="#f6f4ec"; c.fillRect(0,0,W,H); c.fillStyle="#2f5d3a"; c.fillRect(0,0,W,H*0.3);
      c.fillStyle="#f6f4ec"; fitHwy(c,"ALLEGHENY GROUNDS",W*0.9,H*0.18,W/2,H*0.15);
      c.fillStyle="#2a2a2a"; fitText(c,"& CUSTODIAL, INC.",W*0.8,H*0.13,W/2,H*0.45,"600");
      fitText(c,"MEADVILLE · 814-555-0177",W*0.8,H*0.11,W/2,H*0.66,"500"); fitText(c,"ON SITE 24 HRS",W*0.6,H*0.11,W/2,H*0.85,"700"); },
    X0-0.012, GF+1.55, MAN.a-0.42, -Math.PI/2);

  /* ---- the pickup with the plow, nose out in the first bay --------------- */
  { const tx=36.8, tz=(BAYA.a+BAYA.b)/2;
    const V=standingVehicle(2, "#e4e2dc", tx, tz, -Math.PI/2, GF);
    const E=[], YEL="#d8a51c", K="#1d1d1e", G="#3a3c3e";
    // the blade: a curved moldboard of five strips, the cutting edge, ribs behind
    const zz=[3.74,3.66,3.62,3.64,3.72], rx=[-0.45,-0.20,0.0,0.22,0.50];
    for(let k=0;k<5;k++) _ge(E, boxGeo(2.46, 0.17, 0.04, 0), 0, 0.20+k*0.16, zz[k], YEL, rx[k]);
    _ge(E, boxGeo(2.46, 0.09, 0.05, 0), 0, 0.09, 3.77, K);
    for(const x of [-1.0,-0.35,0.35,1.0]) _ge(E, boxGeo(0.05, 0.74, 0.14, 0), x, 0.50, 3.56, YEL);
    for(const sd of [-1,1]){ _ge(E, boxGeo(0.10, 0.10, 0.70, 0), sd*0.42, 0.42, 3.18, G, 0, sd*0.12);
      _gt(E, V3(sd*1.20,0.88,3.70), V3(sd*1.20,1.62,3.70), 0.010, "#2a2a2a");
      _ge(E, new T.SphereGeometry(0.03,6,5), sd*1.20, 1.63, 3.70, "#e85a1a"); }
    _ge(E, boxGeo(0.14, 0.62, 0.14, 0), 0, 0.78, 3.20, G);
    _ge(E, boxGeo(0.10, 0.36, 0.10, 0), 0.12, 0.78, 3.28, "#c9cbcc", 0.3);
    // its own lights, up on a bar over the grille
    _ge(E, boxGeo(1.50, 0.05, 0.05, 0), 0, 1.38, 2.66, K);
    for(const sd of [-1,1]){ _ge(E, boxGeo(0.24, 0.15, 0.12, 0), sd*0.60, 1.43, 2.70, K); _ge(E, boxGeo(0.20, 0.11, 0.01, 0), sd*0.60, 1.43, 2.765, "#e8e6dc"); }
    // the light bar on the cab, amber
    _ge(E, boxGeo(1.14, 0.06, 0.28, 0), 0, 1.95, -0.30, K);
    for(let k=0;k<4;k++) _ge(E, boxGeo(0.24, 0.08, 0.24, 0), -0.42+k*0.28, 2.012, -0.30, "#e8962a");
    // the spreader on the hitch: a hopper, its spinner, the motor
    _ge(E, boxGeo(0.12, 0.10, 0.50, 0), 0, 0.48, -3.15, G);
    _ge(E, boxGeo(0.92, 0.50, 0.58, 0), 0, 1.02, -3.48, "#2a2a2a");
    _ge(E, boxGeo(0.60, 0.22, 0.36, 0), 0, 0.68, -3.48, "#2a2a2a", 0.12);
    _ge(E, new T.CylinderGeometry(0.22,0.22,0.03,14), 0, 0.50, -3.50, "#3a3a3a");
    _ge(E, boxGeo(0.14, 0.14, 0.14, 0), 0, 1.33, -3.48, "#3a3c3e");
    const m=_garMesh(E); V.g.add(m);
    // the contractor's name on both doors
    const dt=signTex(512,160,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle="#2f5d3a"; fitHwy(c,"ALLEGHENY GROUNDS",W*0.92,H*0.34,W/2,H*0.30);
      c.fillStyle="#2a2a2a"; fitText(c,"& CUSTODIAL · MEADVILLE PA",W*0.86,H*0.20,W/2,H*0.66,"600"); fitText(c,"UNIT 4",W*0.3,H*0.16,W/2,H*0.9,"700"); });
    for(const sd of [-1,1]){ const p=new T.Mesh(new T.PlaneGeometry(0.92,0.29), new T.MeshStandardMaterial({map:dt, transparent:true, roughness:0.5,
        polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      p.position.set(sd*1.03, 0.98, 0.30); p.rotation.y=sd*Math.PI/2; V.g.add(p); }
    addCol(tx-2.95, tx+2.98, tz-1.02, tz+1.02, GF-0.5, GF+1.95);
    addCol(tx-3.82, tx-2.95, tz-1.25, tz+1.25, GF-0.5, GF+0.95);
    addCol(tx+2.98, tx+3.80, tz-0.48, tz+0.48, GF-0.5, GF+1.30);
    addUse(tx-1.0, tz-1.6, GF, "LOOK IN THE TRUCK", ()=>toast("KEYS IN THE CUPHOLDER. A CLIPBOARD OF SALT TICKETS, A SCRAPER, A DOZEN EMPTY COFFEE CUPS","#cfe0d4"), 1.1);
    GARAGE_RT.truck=V;
  }

  /* ---- the mower, parked in the second bay, and its place ---------------- */
  { const M=mowerParts(), x=35.3, z=(BAYB.a+BAYB.b)/2+0.35;          // to the south side of the bay: a way past it on the other
    M.g.position.set(x, GF, z); M.g.rotation.y=-Math.PI/2; scene.add(M.g);
    M.col={x0:x-1.05, x1:x+1.05, z0:z-0.78, z1:z+0.78, y0:GF-0.5, y1:GF+1.75}; COL_DYN.push(M.col);
    M.home={x:x, z:z, yaw:-Math.PI/2}; M.x=x; M.z=z; M.yaw=-Math.PI/2; M.y=GF;
    GARAGE_RT.mower=M; }
  // a walk-behind spreader beside it
  { const E=[], x=38.9, z=31.5;
    _ge(E, new T.CylinderGeometry(0.30, 0.10, 0.42, 14), 0, 0.62, 0, "#c42a1a");
    _ge(E, new T.CylinderGeometry(0.31, 0.31, 0.04, 14), 0, 0.84, 0, "#2a2a2a");
    _ge(E, new T.CylinderGeometry(0.14, 0.14, 0.02, 12), 0, 0.36, 0, "#2a2a2a");
    for(const sd of [-1,1]){ _ge(E, new T.CylinderGeometry(0.17,0.17,0.06,14), sd*0.30, 0.17, -0.05, "#1d1d1e", 0, 0, Math.PI/2);
      _gt(E, V3(sd*0.27,0.17,-0.05), V3(sd*0.20,0.45,0), 0.012, "#5a5c5e");
      _gt(E, V3(sd*0.20,0.45,0), V3(sd*0.22,1.00,-0.62), 0.014, "#5a5c5e"); }
    _gt(E, V3(-0.22,1.0,-0.62), V3(0.22,1.0,-0.62), 0.016, "#2a2a2a");
    const m=_garMesh(E); m.position.set(x, GF, z); m.rotation.y=-Math.PI/2; scene.add(m);
    addCol(x-0.75, x+0.45, z-0.36, z+0.36, GF-0.5, GF+1.0); }

  /* ---- the shop end: the bench, the washer, the shelving ------------------ */
  // the workbench along the east wall, the pegboard over it, the vise, the radio
  { const x0=X1-T2-0.80, x1=X1-T2, z0=32.8, z1=35.7, top=GF+0.90;
    bx("beam", x1-x0, 0.05, z1-z0, (x0+x1)/2, top-0.025, (z0+z1)/2, 0.6, 0, "#8a6a48");
    bx("beam", x1-x0-0.1, 0.03, z1-z0-0.1, (x0+x1)/2+0.05, GF+0.25, (z0+z1)/2, 0.6, 0, "#7a5e40");
    for(const z of [z0+0.06, z1-0.06]) for(const x of [x0+0.06, x1-0.06]) bx("paintm", 0.06, top-GF-0.05, 0.06, x, (GF+top-0.05)/2, z, 0, 0, "#4a4c4e");
    const peg=signTex(512,192,(c,W,H)=>{ c.fillStyle="#9a7a52"; c.fillRect(0,0,W,H); c.fillStyle="#6a5236";
      for(let j=6;j<H;j+=12) for(let i=6;i<W;i+=12){ c.beginPath(); c.arc(i,j,1.6,0,7); c.fill(); }
      c.strokeStyle="#2a2a2a"; c.lineWidth=7; c.lineCap="round";
      const L=(a,b,cc,dd,col,w)=>{ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); c.moveTo(a,b); c.lineTo(cc,dd); c.stroke(); };
      for(let k=0;k<7;k++) L(40+k*18, 30, 40+k*18, 30+60+k*6, "#7d8186", 7);                                 // wrenches
      for(let k=0;k<5;k++){ L(190+k*20, 28, 190+k*20, 70, ["#c42a1a","#d9a520","#2a5d9a","#c42a1a","#2a2a2a"][k], 9); L(190+k*20, 70, 190+k*20, 110, "#9a9ea2", 3); }
      L(330, 30, 330, 120, "#6a4a2a", 8); L(316, 36, 350, 36, "#4a4c4e", 14);                                  // a hammer
      L(380, 30, 380, 140, "#d86a1c", 6); L(410, 34, 450, 120, "#2a5d9a", 6); L(470, 40, 470, 150, "#9a9ea2", 5);
      c.fillStyle="#2a2a2a"; c.fillRect(30,140,120,30); c.fillStyle="#f2f0ea"; fitText(c,"PUT IT BACK",110,22,90,155,"700"); });
    signPanel(z1-z0-0.1, 1.05, peg, x1-0.012, top+0.70, (z0+z1)/2, -Math.PI/2);
    // the vise at the south end; a coffee can of bolts; a drop light coiled
    bx("paintm", 0.22, 0.12, 0.14, x0+0.18, top+0.06, z0+0.30, 0, 0, "#2a5d9a");
    bx("paintm", 0.06, 0.10, 0.20, x0+0.04, top+0.07, z0+0.30, 0, 0, "#2a5d9a");
    cyl("paintm", 0.08, 0.08, 0.16, 12, x0+0.45, top+0.08, z0+1.1, "#b8231e");
    push("paintm", new T.TorusGeometry(0.14, 0.02, 6, 16), x0+0.45, top+0.02, z0+1.7, 0, "#e0a020", Math.PI/2, 0);
    { const laid=[];                                   // (none laid over another: on the bench they would share a plane)
      for(let k=0;k<6;k++){ const x=x0+0.25+r()*0.4, z=z0+0.6+r()*1.8, ry=r()*3;
        if(laid.some(q=>Math.hypot(q[0]-x, q[1]-z)<0.13)) continue; laid.push([x,z]);
        bx("paintm", 0.05, 0.02, 0.10, x, top+0.01, z, 0, ry, "#7d8186"); } }
    addCol(x0, x1, z0, z1, GF-0.5, top+0.05);
    // the radio: a yellow jobsite box in a roll cage, the dial lit
    const rx=x0+0.40, rz=z1-0.40;
    bx("paintm", 0.30, 0.26, 0.42, rx, top+0.13, rz, 0, 0, "#d8a51c");
    for(const sd of [-1,1]) for(const dz of [-0.24,0.24]) tube("paintm", V3(rx+sd*0.17, top+0.01, rz+dz), V3(rx+sd*0.17, top+0.30, rz+dz), 0.014, 4, "#1d1d1e");
    for(const dz of [-0.24,0.24]) tube("paintm", V3(rx-0.17, top+0.30, rz+dz), V3(rx+0.17, top+0.30, rz+dz), 0.014, 4, "#1d1d1e");
    bx("paintm", 0.012, 0.18, 0.15, rx-0.154, top+0.13, rz-0.10, 0, 0, "#2a2a2a");
    bx("paintm", 0.012, 0.18, 0.15, rx-0.154, top+0.13, rz+0.12, 0, 0, "#2a2a2a");
    bucketOf("dial", ()=>emitMat(0x9fe8a8, 0.9, "indoor", "garage"));
    push("dial", boxGeo(0.012, 0.04, 0.10, 0), rx-0.158, top+0.21, rz+0.01, 0, "#ffffff");
    tube("chrome", V3(rx+0.10, top+0.28, rz+0.18), V3(rx+0.02, top+0.75, rz+0.32), 0.004, 3, "#c9cbcc");
    GARAGE_RT.radio={x:rx, y:top+0.15, z:rz, station:0};
    addUse(rx-0.6, rz, GF, "CHANGE THE STATION", ()=>{ const R=GARAGE_RT.radio; R.station=(R.station+1)%3;
      toast(["WFRA, FRANKLIN · COUNTRY, AND THE FARM REPORT AT THE TOP OF THE HOUR","AM TALK OUT OF ERIE · SOMEBODY CALLING IN ABOUT DEER","THE PIRATES, BOTTOM OF THE SIXTH, DOWN BY TWO"][R.station],"#cfe0d4");
      if(typeof AUDIO!=="undefined") AUDIO.blip("tick", rx, rz); }, 1.0);
  }
  // the parts washer beside it, lid up
  { const x=X1-T2-0.36, z=36.5;
    bx("paintm", 0.62, 0.78, 0.86, x, GF+0.39, z, 0, 0, "#b8231e");
    bx("paintm", 0.56, 0.06, 0.80, x, GF+0.80, z, 0, 0, "#9a1d18");
    push("paintm", boxGeo(0.62, 0.04, 0.86, 0), x+0.29, GF+1.18, z, 0, "#b8231e", 0, 1.15);
    tube("chrome", V3(x+0.18, GF+0.82, z+0.25), V3(x+0.05, GF+1.10, z+0.10), 0.012, 4, "#c9cbcc");
    push("paintm", planeGeo(0.48, 0.70, 0), x, GF+0.815, z, 0, "#4a3e24", -Math.PI/2, 0);
    wallSign(0.34, 0.16, (c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#1a1a1a"; fitHwy(c,"SOLVENT · NO SMOKING",W*0.9,H*0.5,W/2,H/2); },
      x-0.312, GF+0.55, z, -Math.PI/2);
    addCol(x-0.31, x+0.31, z-0.43, z+0.43, GF-0.5, GF+0.85);
    addUse(x-0.8, z, GF, "LOOK IN THE PARTS WASHER", ()=>toast("A MOWER BLADE SOAKING IN SOLVENT, AND A SOCKET SOMEBODY DROPPED IN LAST WINTER","#cfe0d4"), 1.0); }
  // steel shelving along the south wall: cases of roll towel and tissue, jugs, bags
  bucketOf("carton", ()=>{
    const c=cvs(256,256), x=c.getContext("2d"); x.fillStyle="#b48c5a"; x.fillRect(0,0,256,256);
    x.fillStyle="rgba(70,50,30,0.25)"; x.fillRect(0,124,256,8);
    x.fillStyle="#3a5d8a"; fitText(x,"ROLL TOWEL",210,34,128,62,"700","Arial"); fitText(x,"6 × 800 FT · NATURAL",200,22,128,98,"600","Arial");
    x.fillStyle="#2a2a2a"; fitText(x,"JUMBO TISSUE",210,30,128,178,"700","Arial"); fitText(x,"2-PLY · 12 ROLLS",200,20,128,210,"600","Arial");
    const t=setSRGB(new T.CanvasTexture(c)); return new T.MeshStandardMaterial({map:t, roughness:0.9}); });
  { const x0=37.2, x1=39.6, z0=Z1-T2-0.56, z1=Z1-T2-0.04, cz=(z0+z1)/2;
    for(const x of [x0+0.016, x1-0.016]) for(const z of [z0+0.016, z1-0.016]) bx("metal", 0.04, 1.95, 0.04, x, GF+0.975, z, 0.5, 0, "#7d8389");
    const shelves=[GF+0.12, GF+0.60, GF+1.08, GF+1.56, GF+1.94];
    for(const y of shelves) bx("metal", x1-x0-0.012, 0.03, z1-z0-0.012, (x0+x1)/2, y, cz, 0.5, 0, "#8d9396");
    for(let s=0;s<4;s++) for(let k=0;k<5;k++){
      const y=shelves[s]+0.015, x=x0+0.27+k*0.47, q=r();
      if(s<3 || q<0.6){ const h=s===3?0.28:0.40; push("carton", boxGeo(0.44, h, 0.44, 0), x, y+h/2, cz, (r()-0.5)*0.08, "#ffffff"); }
      else{ for(let j=0;j<3;j++) cyl("paintm", 0.06, 0.07, 0.30, 10, x-0.12+j*0.12, y+0.15, cz, ["#2a6ac0","#3aa35a","#e8e4d4"][j]); } }
    // and a stack of them on the floor beside, one opened
    for(let k=0;k<3;k++) push("carton", boxGeo(0.44, 0.40, 0.44, 0), X1-T2-0.34, GF+0.2+k*0.40, z0+0.02, (r()-0.5)*0.1, "#ffffff");
    addCol(x0, x1, z0, z1, GF-0.5, GF+1.96);
    addCol(X1-T2-0.58, X1-T2, z0-0.2, z0+0.24, GF-0.5, GF+1.2);
    addUse((x0+x1)/2, z0-0.7, GF, "TAKE A ROLL OF TOWEL", ()=>toast("YOU TAKE ONE. NOBODY IS GOING TO COUNT","#cfe0d4"), 1.1); }

  /* ---- the break corner: the cot, the coffee, a folding chair ------------ */
  { const x0=X0+T2+0.30, x1=x0+2.0, z1=Z1-T2-0.05, z0=z1-0.74, cz=(z0+z1)/2, y=GF+0.42;
    for(const z of [z0+0.04, z1-0.04]) tube("metal", V3(x0, y, z), V3(x1, y, z), 0.018, 5, "#8a8f8a");
    for(const x of [x0+0.15, (x0+x1)/2, x1-0.15]){
      tube("metal", V3(x, GF, z0+0.04), V3(x, y, z1-0.04), 0.012, 4, "#8a8f8a");
      tube("metal", V3(x, GF, z1-0.04), V3(x, y, z0+0.04), 0.012, 4, "#8a8f8a"); }
    bx("paintm", x1-x0-0.04, 0.03, z1-z0-0.12, (x0+x1)/2, y+0.005, cz, 0, 0, "#4f5a3a");
    // a sleeping bag kicked down to the foot, a pillow, a paperback
    push("paintm", new T.CylinderGeometry(0.16, 0.18, 0.62, 10), x1-0.40, y+0.14, cz, 0, "#2f4a6a", 0, Math.PI/2);
    bx("paintm", 0.44, 0.10, 0.34, x0+0.30, y+0.07, cz, 0, 0.1, "#e8e4d8");
    bx("paintm", 0.13, 0.03, 0.19, (x0+x1)/2-0.1, y+0.03, cz+0.1, 0, 0.6, "#a83a2a");
    addCol(x0, x1, z0, z1, GF-0.5, y+0.06);
    addSeat((x0+x1)/2, cz, y+0.02, Math.PI, "THE COT", true);
    GARAGE_RT.cot={x:(x0+x1)/2, z:cz, y:y+0.04, x0:x0, x1:x1, stand:{x:(x0+x1)/2, z:z0-0.55}}; }
  { const x0=35.55, x1=36.75, z1=Z1-T2-0.04, z0=z1-0.56, top=GF+0.90, cz=(z0+z1)/2;
    bx("paintm", x1-x0, 0.04, z1-z0, (x0+x1)/2, top-0.02, cz, 0, 0, "#8d8478");
    bx("paintm", x1-x0-0.04, top-GF-0.04, z1-z0-0.04, (x0+x1)/2, (GF+top-0.04)/2, cz, 0, 0, "#6a6458");
    // the coffee maker: black, a glass pot with an inch in it, the red light
    const cx=x0+0.30;
    bx("paintm", 0.22, 0.34, 0.24, cx, top+0.17, cz+0.04, 0, 0, "#1d1d1e");
    bx("paintm", 0.22, 0.04, 0.30, cx, top+0.36, cz+0.01, 0, 0, "#1d1d1e");
    push("glass", new T.CylinderGeometry(0.075, 0.085, 0.16, 12, 1, true), cx, top+0.09, cz-0.08, 0, "#dfe6e2");
    cyl("paintm", 0.08, 0.08, 0.04, 12, cx, top+0.03, cz-0.08, "#2a1a10");
    bucketOf("redled", ()=>emitMat(0xff3a2a, 1.0, "always"));
    push("redled", boxGeo(0.02, 0.02, 0.01, 0), cx+0.07, top+0.06, cz-0.081, 0, "#ffffff");
    // cups, a can of coffee, sugar, a mug, the creamer
    cyl("paintm", 0.042, 0.035, 0.22, 10, cx+0.24, top+0.11, cz-0.06, "#f4f2ea");
    cyl("paintm", 0.075, 0.075, 0.17, 14, cx+0.42, top+0.085, cz+0.06, "#b8231e");
    cyl("paintm", 0.045, 0.045, 0.10, 10, cx+0.60, top+0.05, cz-0.08, "#e8e4d8");
    cyl("paintm", 0.042, 0.038, 0.10, 10, cx+0.74, top+0.05, cz+0.02, "#2a5d9a");
    addCol(x0, x1, z0, z1, GF-0.5, top+0.4);
    addUse((x0+x1)/2, z0-0.6, GF, "POUR A CUP OF COFFEE", ()=>toast("IT HAS BEEN ON THE BURNER SINCE FIVE THIS MORNING, AND IT TASTES LIKE IT","#cfe0d4"), 1.1);
    GARAGE_RT.coffee={x:cx, z:z0-0.42, yaw:0};
    // the folding chair, turned to the room
    const fx=x0-0.45, fz=z0-0.55;
    bx("paintm", 0.42, 0.03, 0.40, fx, GF+0.45, fz, 0, 0, "#7d8186");
    bx("paintm", 0.42, 0.30, 0.03, fx, GF+0.72, fz+0.21, 0, 0, "#7d8186");
    for(const sd of [-1,1]){ tube("metal", V3(fx+sd*0.19, GF, fz-0.20), V3(fx+sd*0.19, GF+0.88, fz+0.22), 0.012, 4, "#5a5e62");
      tube("metal", V3(fx+sd*0.19, GF, fz+0.22), V3(fx+sd*0.19, GF+0.45, fz-0.05), 0.012, 4, "#5a5e62"); }
    addCol(fx-0.22, fx+0.22, fz-0.22, fz+0.24, GF-0.5, GF+0.5);
    addSeat(fx, fz, GF+0.47, Math.PI, "THE FOLDING CHAIR");
    GARAGE_RT.chair={x:fx, z:fz, y:GF+0.47, yaw:Math.PI}; }
  // a calendar, a schedule on a clipboard, the time card rack, a safety poster
  wallSign(0.40, 0.56, (c,W,H)=>{ c.fillStyle="#f6f4ec"; c.fillRect(0,0,W,H); c.fillStyle="#2f5d3a"; c.fillRect(0,0,W,H*0.42);
      c.fillStyle="#f6f4ec"; fitText(c,"OCTOBER",W*0.7,H*0.10,W/2,H*0.22,"700"); c.fillStyle="#222";
      c.strokeStyle="#bbb"; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(W*0.08,H*(0.52+i*0.075)); c.lineTo(W*0.92,H*(0.52+i*0.075)); c.stroke(); }
      c.fillStyle="#b3151b"; for(let k=0;k<9;k++){ c.beginPath(); c.arc(W*(0.14+(k%7)*0.12), H*(0.56+((k/7)|0)*0.075+((k*3)%4)*0.075), 3, 0, 7); c.fill(); } },
    36.3, GF+1.75, Z0+T2+0.012, 0);
  wallSign(0.30, 0.42, (c,W,H)=>{ c.fillStyle="#7a5a3a"; c.fillRect(0,0,W,H); c.fillStyle="#f6f4ec"; c.fillRect(W*0.06,H*0.12,W*0.88,H*0.84);
      c.fillStyle="#9aa0a2"; c.fillRect(W*0.3,0,W*0.4,H*0.12); c.fillStyle="#1a1a1a";
      fitText(c,"ROUNDS",W*0.7,H*0.07,W/2,H*0.22,"700");
      ["6A  BLDG / CANS","12P  BLDG / CANS","6P  BLDG / CANS","2+ MESSES: GO OVER","MOW: SUMMER, AM + PM","LEAVES: OCT–NOV"].forEach((s,i)=>fitText(c,s,W*0.8,H*0.05,W/2,H*(0.36+i*0.1),"500")); },
    X0+T2+0.012, GF+1.55, 35.1, Math.PI/2);
  wallSign(0.56, 0.74, (c,W,H)=>{ c.fillStyle="#f2b418"; c.fillRect(0,0,W,H); c.fillStyle="#1a1a1a";
      fitHwy(c,"HEARING",W*0.8,H*0.10,W/2,H*0.12); fitHwy(c,"PROTECTION",W*0.86,H*0.10,W/2,H*0.24); fitHwy(c,"REQUIRED",W*0.8,H*0.10,W/2,H*0.36);
      c.beginPath(); c.arc(W/2,H*0.66,W*0.22,Math.PI,0); c.lineWidth=12; c.stroke(); c.fillRect(W*0.22,H*0.62,W*0.12,H*0.16); c.fillRect(W*0.66,H*0.62,W*0.12,H*0.16); },
    X1-T2-0.012, GF+1.8, 27.4, -Math.PI/2);

  /* ---- the carts: the one in use parks by the bench; a spare between the bays */
  { const E=[]; cartEntries(E, false); const m=_garMesh(E);
    const c={g:m, home:{x:38.4, z:33.7, yaw:Math.PI/2}, x:38.4, z:33.7, yaw:Math.PI/2, y:GF, bags:0};
    m.position.set(c.x, GF, c.z); m.rotation.y=c.yaw; scene.add(m);
    c.col={x0:c.x-0.66, x1:c.x+0.99, z0:c.z-0.32, z1:c.z+0.32, y0:GF-0.5, y1:GF+1.1}; COL_DYN.push(c.col);
    // its bag, which fills over a round
    c.bag=new T.Mesh(new T.IcosahedronGeometry(0.5, 1), new T.MeshStandardMaterial({color:0x1d1d1e, roughness:0.35, metalness:0.1}));
    c.bag.visible=false; m.add(c.bag);
    GARAGE_RT.cart=c; }
  { const E=[]; cartEntries(E, true); const m=_garMesh(E), x=39.6, z=28.6;
    m.position.set(x, GF, z); m.rotation.y=Math.PI/2; scene.add(m);
    addCol(x-0.66, x+0.99, z-0.32, z+0.32, GF-0.5, GF+1.1); }
  // the tools on the north wall: rakes, shovels, a push broom, the trimmer; the blower's hook
  { const z=Z0+T2+0.05;
    for(let k=0;k<6;k++){ const x=38.2+k*0.42, kind=k%3;
      tube("beam", V3(x, GF+0.08, z+0.06), V3(x+0.05, GF+1.65, z+0.02), 0.016, 5, "#a07a4a");
      if(kind===0) bx("metal", 0.36, 0.40, 0.03, x, GF+0.22, z+0.07, 0.5, 0, "#3a3c3e");
      else if(kind===1) bx("paintm", 0.34, 0.06, 0.06, x+0.05, GF+1.66, z+0.04, 0, 0, "#6a3a2a");
      else for(let j=0;j<7;j++) tube("metal", V3(x, GF+0.25, z+0.06), V3(x-0.2+j*0.067, GF+0.05, z+0.08), 0.005, 3, "#5a5c5e"); }
    tube("paintm", V3(41.0, GF+0.25, z+0.05), V3(41.05, GF+1.85, z+0.02), 0.018, 5, "#d86a1c");
    bx("paintm", 0.14, 0.18, 0.12, 41.0, GF+1.5, z+0.08, 0, 0, "#d86a1c");
  }
  // the blower on its hook on the east wall, between the window and the bench
  { const hx=X1-T2-0.10, hz=31.25;
    bx("metal", 0.10, 0.06, 0.06, X1-T2-0.03, GF+1.80, hz, 0.5, 0, "#5a5c5e");
    const B=blowerParts(); B.position.set(hx, GF+1.55, hz); B.rotation.y=Math.PI/2; B.userData.tube.rotation.x=1.5; scene.add(B);
    GARAGE_RT.blower={g:B, hook:{x:hx, y:GF+1.55, z:hz, yaw:Math.PI/2, stand:{x:hx-0.75, z:hz}, face:Math.PI/2}}; }

  /* ---- the yard: salt and sand bin, ice melt, fuel, the dumpster ---------- */
  { const x0=26.0, x1=31.6, z0=18.8, z1=23.2, h=1.8;
    wallBox("block", x0, x1, z0, z0+0.25, -0.3, h, "#b9b2a2", 0.6, 0);
    wallBox("block", x0, x0+0.25, z0+0.25, z1, -0.3, h, "#b9b2a2", 0.6, 0);
    wallBox("block", x1-0.25, x1, z0+0.25, z1, -0.3, h, "#b9b2a2", 0.6, 0);
    // a shed roof over it on two posts, the pile under it
    for(const x of [x0+0.12, x1-0.12]) bx("beam", 0.14, 2.9, 0.14, x, 1.45, z1-0.05, 0.6, 0, "#7a6046");
    push("roofmetal", new FaceGeo().slab([V3(x0-0.3,3.3,z0-0.3), V3(x1+0.3,3.3,z0-0.3), V3(x1+0.3,2.95,z1+0.4), V3(x0-0.3,2.95,z1+0.4)], 0.05, 0.5).geo(), 0,0,0, 0, "#7d8389");
    for(const x of [x0+0.12, (x0+x1)/2, x1-0.12]) bx("beam", 0.10, 3.2-h, 0.10, x, (h+3.2)/2, z0+0.12, 0.6, 0, "#7a6046");
    const pile=new T.SphereGeometry(1, 18, 10, 0, Math.PI*2, 0, Math.PI/2); pile.scale(2.2, 1.25, 1.7);
    push("concrete", pile, (x0+x1)/2, 0.0, z0+1.9, 0, "#8f8578");
    for(let k=0;k<8;k++) push("concrete", new T.SphereGeometry(0.3+r()*0.3, 8, 5, 0, Math.PI*2, 0, Math.PI/2), x0+1+r()*3.6, 0, z0+2.8+r()*1.1, 0, "#978d80");
    addCol((x0+x1)/2-1.6, (x0+x1)/2+1.6, z0+0.6, z0+3.0, -0.5, 1.0);
    addZone(x0, x1, z0, z1, -1, 3.5, "THE SALT BIN");
    addUse((x0+x1)/2, z1+0.6, 0, "LOOK AT THE PILE", ()=>toast("SALT AND ANTISKID, MIXED, GONE TO A CRUST. A SHOVEL STUCK IN IT SINCE MARCH","#cfe0d4"), 1.6);
    tube("beam", V3((x0+x1)/2+0.6, 0.6, z0+2.6), V3((x0+x1)/2+0.75, 1.65, z0+3.0), 0.018, 5, "#a07a4a");
    bx("metal", 0.28, 0.04, 0.32, (x0+x1)/2+0.58, 0.52, z0+2.5, 0.5, 0.2, "#3a3c3e"); }
  { const x=24.6, z=21.4;                                                       // a pallet of ice melt, shrink-wrapped
    bx("beam", 1.0, 0.12, 1.2, x, 0.06, z, 0.6, 0, "#a08058");
    for(let l=0;l<5;l++) for(let k=0;k<4;k++) push("paintm", boxGeo(0.46, 0.13, 0.56, 0), x-0.24+(k%2)*0.48, 0.19+l*0.13, z-0.29+((k/2)|0)*0.58, (l%2)*0.04, l%2?"#2a6ac0":"#2f62b2");
    push("glass", boxGeo(1.0, 0.7, 1.2, 0), x, 0.47, z, 0, "#e8ecee");
    addCol(x-0.5, x+0.5, z-0.6, z+0.6, -0.5, 0.85); }
  { const x=39.5, z=21.6;                                                       // the gas tank on its stand
    for(const dx of [-0.55,0.55]) for(const dz of [-0.25,0.25]) bx("metal", 0.06, 0.62, 0.06, x+dx, 0.31, z+dz, 0.5, 0, "#5a5e62");
    push("paintm", new T.CylinderGeometry(0.38, 0.38, 1.5, 18, 1, true), x, 0.98, z, 0, "#b8231e", 0, Math.PI/2);   // (open: the heads are its own)
    for(const sd of [-1,1]) push("paintm", new T.CircleGeometry(0.38, 18), x+sd*0.75, 0.98, z, sd*Math.PI/2, "#a01e1a");
    bx("paintm", 0.20, 0.32, 0.18, x+0.4, 1.38, z, 0, 0, "#2a2a2a");
    tube("paintm", V3(x+0.45, 1.25, z+0.08), V3(x+0.62, 0.55, z+0.32), 0.016, 5, "#1d1d1e");
    const t=signTex(256,64,(c,W,H)=>{ c.fillStyle="#b8231e"; c.fillRect(0,0,W,H); c.fillStyle="#f4f2ea"; fitHwy(c,"GASOLINE · NO SMOKING",W*0.92,H*0.55,W/2,H/2); });
    signPanel(0.9, 0.22, t, x, 0.98, z-0.383, Math.PI);
    addCol(x-0.78, x+0.78, z-0.42, z+0.42, -0.5, 1.45); }
  { const x=26.6, z=41.6;                                                       // the dumpster
    const E=[], B="#2f5a7a", K="#1d1d1e";
    _ge(E, boxGeo(1.95, 1.05, 1.62, 0), 0, 0.62, 0, B);
    _ge(E, boxGeo(1.95, 0.30, 0.50, 0), 0, 1.0, -0.70, B, 0.55);
    _ge(E, boxGeo(2.02, 0.05, 0.80, 0), 0, 1.20, 0.38, K, -0.06);
    _ge(E, boxGeo(2.02, 0.05, 0.80, 0), 0, 1.20, -0.42, K, 0.04);
    for(const sd of [-1,1]) _ge(E, boxGeo(0.12, 0.12, 1.70, 0), sd*1.0, 0.82, 0, "#2a4e6a");
    for(const sd of [-1,1]) for(const dz of [-0.6,0.6]) _ge(E, new T.CylinderGeometry(0.06,0.06,0.05,8), sd*0.8, 0.06, dz, K, 0, 0, Math.PI/2);
    const m=_garMesh(E); m.position.set(x, 0, z); m.rotation.y=Math.PI/2; scene.add(m);
    const t=signTex(256,96,(c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#1a1a1a"; fitHwy(c,"WASTE MANAGEMENT",W*0.9,H*0.34,W/2,H*0.3);
      fitText(c,"KEEP LIDS CLOSED",W*0.8,H*0.24,W/2,H*0.72,"700"); });
    signPanel(0.7, 0.26, t, x-0.82, 0.75, z, -Math.PI/2);
    addCol(x-0.84, x+0.84, z-1.02, z+1.02, -0.5, 1.25);
    GARAGE_RT.dumpster={x:x, z:z, stand:{x:x-1.45, z:z}};
    addUse(x-1.3, z, 0, "LIFT THE LID", ()=>toast("BLACK BAGS, A BROKEN CHAIR, A CAR BUMPER. THE SMELL OF A WEEK OF IT","#cfe0d4"), 1.2); }

  /* ---- the gate on the track ---------------------------------------------- */
  { const P=SERVICE; let i=1; while(i<P.length-1 && P[i].s<7.5) i++;
    const p=P[i], n=pathSide(P,i), w=2.1, y=Terrain.groundAt(p.x, p.z);
    const a={x:p.x+n.x*w, z:p.z+n.z*w}, b={x:p.x-n.x*w, z:p.z-n.z*w};
    for(const q of [a,b]){ const qy=Terrain.groundAt(q.x,q.z);
      cyl("paintm", 0.07, 0.07, 1.25, 10, q.x, qy+0.55, q.z, "#d8a51c");
      cyl("paintm", 0.08, 0.08, 0.04, 10, q.x, qy+1.19, q.z, "#d8a51c");
      addCol(q.x-0.1, q.x+0.1, q.z-0.1, q.z+0.1, qy-0.5, qy+1.2); }
    tube("paintm", V3(a.x, y+0.98, a.z), V3(b.x, y+0.98, b.z), 0.05, 8, "#d8a51c");
    tube("paintm", V3(a.x+(b.x-a.x)*0.05, y+0.98, a.z+(b.z-a.z)*0.05), V3(a.x+(b.x-a.x)*0.5, y+0.62, a.z+(b.z-a.z)*0.5), 0.03, 6, "#d8a51c");
    tube("paintm", V3(a.x+(b.x-a.x)*0.5, y+0.62, a.z+(b.z-a.z)*0.5), V3(a.x+(b.x-a.x)*0.95, y+0.98, a.z+(b.z-a.z)*0.95), 0.03, 6, "#d8a51c");
    for(let k=0;k<=12;k++){ const t=k/12, x=a.x+(b.x-a.x)*t, z=a.z+(b.z-a.z)*t; addCol(x-0.18, x+0.18, z-0.18, z+0.18, y+0.55, y+1.05); }
    const st=signTex(320,200,(c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#b3151b"; c.fillRect(0,0,W,H*0.3);
      c.fillStyle="#f4f2ea"; fitHwy(c,"NO TRESPASSING",W*0.9,H*0.2,W/2,H*0.15);
      c.fillStyle="#1a1a1a"; fitHwy(c,"AUTHORIZED VEHICLES",W*0.9,H*0.14,W/2,H*0.45); fitHwy(c,"ONLY",W*0.4,H*0.14,W/2,H*0.62);
      fitText(c,"COMMONWEALTH OF PENNSYLVANIA",W*0.86,H*0.09,W/2,H*0.85,"600"); });
    const ang=Math.atan2(b.x-a.x, b.z-a.z);
    for(const sd of [-1,1]) signPanel(0.48, 0.30, st, p.x+Math.sin(ang+Math.PI/2)*0.06*sd, y+0.78, p.z+Math.cos(ang+Math.PI/2)*0.06*sd, ang+Math.PI/2+(sd<0?Math.PI:0));
    addUse(p.x+n.x*0.0+(P[i-1].x-p.x)*0.25, p.z+(P[i-1].z-p.z)*0.25, y, "TRY THE GATE", ()=>toast("PADLOCKED. THE TRACK GOES ON THROUGH THE TREES TOWARD THE TOWNSHIP ROAD","#cfe0d4"), 1.4);
    GARAGE.gate={x:p.x, z:p.z}; }
  // and a little planting to tie the yard into the woods: brush at its edges
  for(let k=0;k<16;k++){ const side=k%4; let x, z;
    if(side===0){ x=Y.x1+1.2+r()*1.6; z=Y.z0+r()*(Y.z1-Y.z0-6); }
    else if(side===1){ x=Y.x0+8+r()*(Y.x1-Y.x0-8); z=Y.z0-1.2-r()*1.4; }
    else if(side===2){ x=Y.x0+9+r()*(Y.x1-Y.x0-14); z=Y.z1+1.2+r()*1.6; }
    else { x=Y.x1+1.0+r()*2; z=Y.z0+r()*8; }
    FOREST.plant(r()<0.5?"shrub":"sapling", x, z, {scale:0.5+r()*0.5, solid:false}); }
  GARAGE_RT.n0=n0;
})();

/* ---- the doors and the lights, from what the custodian is doing (14h) --- */
function updateGarage(dt){
  const R=GARAGE_RT;
  for(const D of R.doors){
    const d=D.want-D.h;
    if(Math.abs(d)>0.002){
      if(!D.moving){ D.moving=true; if(typeof AUDIO!=="undefined") AUDIO.blip("whirr", D.x, (D.o.a+D.o.b)/2); }
      D.set(D.h+Math.sign(d)*Math.min(Math.abs(d), dt*0.32));
    }else if(D.moving){ D.moving=false; D.set(D.want); }
  }
  // the tubes take a moment to strike, and are off in a cut
  R.lights+=((R.lightsWant?1:0)-R.lights)*Math.min(1, dt*(R.lightsWant?2.5:6));
  GRID.garage=R.lights*Math.min(1, GRID.site/0.3);                // it is on the site's supply, not the standby set
}
