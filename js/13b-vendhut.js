"use strict";
/* REST AREA · 13b-vendhut.js
   the vending room on the island by the truck lot
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   13b · THE VENDING ROOM
   A driver wants coffee at three in the morning without walking the
   length of the car lot, so on the island, across a painted crosswalk
   from the truck aisle, there is a small brick room with a glass front
   and a light that never goes off: a hot-drink machine (cups drop, a
   BREWING lamp; it is out of cups, and has been), a refrigerated sandwich
   machine, the cold drinks and the snacks again, a change machine, a pay
   phone, the 511 board over a bench, a can and a recycling bin, all of it
   under two flat fluorescent fixtures. The machines are on the state's
   Business Enterprise Program, and carry its sticker. The keypads are
   18b's; the coffee machine's own way of going wrong is there too. At
   night a trucker in slippers comes over from his rig for a cup (14i).
   ---------------------------------------------------------------------- */
const VENDHUT_RT={brew:0, pour:0, mugUnder:false, board:null, flick:null, lamp:null, t:0};
(function vendHut(){
  const V=VENDHUT, WT=0.2, FLV=0.17, CEIL=FLV+2.90, ROOF=3.35;
  const IX0=V.x0+WT, IX1=V.x1-WT, IZ0=V.z0+WT, IZ1=V.z1-WT, DZ0=-0.05, DZ1=1.05;
  const BRK="#a8624a", INW="#cdc8bd", BRZ="#3e332b";             // (the block inside painted a dull cream, not white: under two tubes a metre and a half off it, white glared)
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const sign=(w,h,draw,x,y,z,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*500), Math.round((cw||w*500)*h/w), draw), x,y,z,ry,lit);

  /* ---- the walk round it, the slab, the walls ---------------------------- */
  const Is=SITE.island, A=V.apron;
  // (in pieces round the room, not under it: the walk's joints would show through its floor)
  for(const [a,b,c,d] of _rectLess(Is.x0+0.18, Is.x1-0.18, A.z0, A.z1, V)){
    bx("concrete", b-a, 0.30, d-c, (a+b)/2, 0.0, (c+d)/2, 0.66, 0, "#c3c0b8");
    for(let z=A.z0+1.5; z<A.z1; z+=1.5) if(z>c+0.05 && z<d-0.05) bx("paint", b-a-0.04, 0.004, 0.012, (a+b)/2, 0.152, z, 0, 0, "#9c9890"); }
  addFlat(Is.x0-0.02, Is.x1+0.02, A.z0, A.z1, 0.15);
  bx("concrete", V.x1-V.x0-0.02, FLV-0.01, V.z1-V.z0-0.02, (V.x0+V.x1)/2, (FLV-0.01)/2, (V.z0+V.z1)/2, 0.5, 0, "#a9a59c");
  addFlat(V.x0, V.x1, V.z0, V.z1, FLV);
  floorAt("quarry", IX0, IX1, IZ0, IZ1, FLV+0.003, "#9a6452", 0.6);
  // the front, west, to the trucks: a brick knee wall under a storefront, the door in the middle of it
  const GL={sill:FLV+0.45, head:FLV+2.45};
  runZ("brick", V.x0+WT/2, WT, IZ0, IZ1, 0, ROOF, [{a:IZ0+0.35, b:DZ0, sill:GL.sill, head:GL.head}, {a:DZ0, b:DZ1, sill:FLV-0.004, head:FLV+2.22},
       {a:DZ1, b:IZ1-0.35, sill:GL.sill, head:GL.head}], BRK, 0.83);
  runZ("brick", V.x1-WT/2, WT, IZ0, IZ1, 0, ROOF, [{a:DZ0, b:DZ1, sill:FLV-0.004, head:FLV+2.22}], BRK, 0.83);
  runX("brick", V.z0+WT/2, WT, V.x0, V.x1, 0, ROOF, [], BRK, 0.83);
  runX("brick", V.z1-WT/2, WT, V.x0, V.x1, 0, ROOF, [], BRK, 0.83);
  // inside, painted block
  lineZ("block", IX0, 1, IZ0, IZ1, FLV, CEIL, [{a:IZ0+0.35, b:DZ0, sill:GL.sill, head:GL.head},{a:DZ0, b:DZ1, sill:FLV, head:FLV+2.22},{a:DZ1, b:IZ1-0.35, sill:GL.sill, head:GL.head}], INW, 0.6);
  lineZ("block", IX1, -1, IZ0, IZ1, FLV, CEIL, [{a:DZ0, b:DZ1, sill:FLV, head:FLV+2.22}], INW, 0.6);
  lineX("block", IZ0, 1, IX0, IX1, FLV, CEIL, [], INW, 0.6);
  lineX("block", IZ1, -1, IX0, IX1, FLV, CEIL, [], INW, 0.6);
  bx("paintm", IX1-IX0, 0.10, 0.012, (IX0+IX1)/2, FLV+0.05, IZ0+0.012, 0, 0, "#3a3a38");
  bx("paintm", IX1-IX0, 0.10, 0.012, (IX0+IX1)/2, FLV+0.05, IZ1-0.012, 0, 0, "#3a3a38");
  // the storefront: bronze frame, glass, a mullion every metre or so, its own solid line for you
  for(const [a,b] of [[IZ0+0.35, DZ0],[DZ1, IZ1-0.35]]){
    const n=Math.max(1, Math.round((b-a)/1.1));
    for(let k=0;k<n;k++){ const za=a+(b-a)*k/n, zb=a+(b-a)*(k+1)/n;
      push("glass", planeGeo(zb-za-0.05, GL.head-GL.sill-0.05, 0), V.x0+WT/2, (GL.sill+GL.head)/2, (za+zb)/2, Math.PI/2, "#ffffff"); }
    for(let k=0;k<=n;k++) bx("paintm", WT+0.04, GL.head-GL.sill-0.006, 0.05, V.x0+WT/2, (GL.sill+GL.head)/2, a+(b-a)*k/n, 0, 0, BRZ);
    for(const y of [GL.sill+0.025, GL.head-0.025]) bx("paintm", WT+0.036, 0.05, b-a, V.x0+WT/2, y, (a+b)/2, 0, 0, BRZ);
    addCol(V.x0, V.x0+WT, a, b, GL.sill, GL.head);
  }
  // the doors: aluminium and glass, closers on them, out to either lot
  for(const [x,ry,hz] of [[V.x0+WT/2, -Math.PI/2, DZ0+0.04],[V.x1-WT/2, Math.PI/2, DZ1-0.04]]){
    for(const z of [DZ0+0.02, DZ1-0.02]) bx("paintm", WT+0.05, 2.22, 0.05, x, FLV+1.11, z, 0, 0, BRZ);
    bx("paintm", WT+0.06, 0.06, DZ1-DZ0+0.11, x, FLV+2.22+0.03, (DZ0+DZ1)/2, 0, 0, BRZ);   // the head deeper and longer than the posts it caps
    makeDoor(XF(x, hz, ry), 0, FLV+0.01, 0, "VENDING", true, 0, "store");
    push("mat", planeGeo(1.1, 0.8, 1.0), x+(ry<0?0.65:-0.65), FLV+0.006, (DZ0+DZ1)/2, Math.PI/2, "#2a2a2a", -Math.PI/2, 0);
  }
  ceilAt("plaster", IX0, IX1, IZ0, IZ1, CEIL, "#ebe9e2", 0.5);
  // the roof: a flat slab and its bronze fascia, run out over the front as a canopy on two posts
  const RX0=V.x0-1.5, SX0=RX0-0.15, SX1=V.x1+0.15, SZ0=V.z0-0.3, SZ1=V.z1+0.3;
  bx("concrete", SX1-SX0, 0.26, SZ1-SZ0, (SX0+SX1)/2, ROOF+0.13, (SZ0+SZ1)/2, 0.5, 0, "#8d8b86");
  for(const [w,d,x,z] of [[SX1-SX0+0.066, 0.03, (SX0+SX1)/2, SZ0-0.015],[SX1-SX0+0.066, 0.03, (SX0+SX1)/2, SZ1+0.015],   // (the long runs 3 mm past the ends')
                          [0.03, SZ1-SZ0, SX0-0.015, (SZ0+SZ1)/2],[0.03, SZ1-SZ0, SX1+0.015, (SZ0+SZ1)/2]])
    bx("paintm", w, d===0.03 ? 0.346 : 0.34, d, x, ROOF+0.12, z, 0, 0, BRZ);   // (the long runs 3 mm deeper at top and bottom than the ends)
  ceilAt("paintm", SX0, V.x0, SZ0, SZ1, ROOF-0.002, "#d9d6cf");
  for(const z of [SZ0+0.15, SZ1-0.15]){ cyl("paintm", 0.05,0.05, ROOF-0.15, 10, SX0+0.15, 0.15+(ROOF-0.15)/2, z, BRZ); addCol(SX0+0.09, SX0+0.21, z-0.06, z+0.06, -0.5, ROOF); }
  for(const z of [-1.4, 2.4]){                                               // two cans in the soffit, on with the dark
    cyl("lamplens", 0.10,0.10,0.02,14, RX0+0.6, ROOF-0.012, z, "#ffffff");
    LAMPS.push({x:RX0+0.6, y:ROOF-0.15, z:z, color:0xe8f0ff, intensity:0.70, dist:10, decay:1.5, mothy:true, circ:"site"});
    push("lightpool", discGeo(1.6, 24, 0), V.x0-1.4, 0.168, z, 0, "#e8f0ff"); }
  // a wall pack over the back door, to the cars
  bx("paintm", 0.18, 0.22, 0.14, V.x1+0.07, FLV+2.55, 0.5, 0, 0, BRZ);
  push("lamplens", boxGeo(0.02, 0.12, 0.10, 0), V.x1+0.145, FLV+2.53, 0.5, 0, "#ffffff");
  LAMPS.push({x:V.x1+0.6, y:FLV+2.4, z:0.5, color:0xffe2b8, intensity:0.6, dist:9, decay:1.6, mothy:true, circ:"site"});
  // brown signs, the way the state does them: VENDING, front and back
  const brown=(c,W,H)=>{ c.fillStyle="#5a3a22"; c.fillRect(0,0,W,H); c.strokeStyle="#f2f0e8"; c.lineWidth=H*0.06; c.strokeRect(H*0.08,H*0.08,W-H*0.16,H-H*0.16);
    c.fillStyle="#f2f0e8"; fitHwy(c,"VENDING",W*0.78,H*0.56,W/2,H*0.53); };
  sign(1.6, 0.30, brown, SX0-0.045, ROOF+0.12, 0.5, -Math.PI/2);
  sign(1.3, 0.28, brown, SX1+0.045, ROOF+0.12, 0.5, Math.PI/2);
  // and across the truck aisle to its door, a crosswalk
  for(let x=TRUCKLOT.aisle0+0.5; x<TRUCKLOT.aisle1-0.2; x+=0.9)
    push("paint", planeGeo(0.45, 2.2, 0), x, PAVE_T+0.004, 0.5, 0, "#eceae2", -Math.PI/2, 0);
  addZone(IX0, IX1, IZ0, IZ1, FLV-0.5, CEIL, "VENDING", true);

  /* ---- the light: two flat fixtures, cold, and one tube in them going ---- */
  // (behind prismatic lenses, and no brighter than a room this size wants: at full strength a metre and a half
  // over a pale floor they burned the walls and the tile out to flat white and orange)
  for(const z of [-1.3, 2.3]){
    B(0.64, 0.06, 1.24, (IX0+IX1)/2, CEIL-0.03, z, "#d9dbd8");
    push("vendlens", planeGeo(0.56, 1.16, 0), (IX0+IX1)/2, CEIL-0.062, z, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:(IX0+IX1)/2, y:CEIL-0.3, z:z, color:0xf2f0e8, intensity:0.52, dist:7, decay:1.7, indoor:true, circ:"bldg",
                vol:[IX0-0.2, IX1+0.2, IZ0-0.2, IZ1+0.2, FLV-1, CEIL+0.5]});
  }
  bucketOf("vendlens", ()=>emitMat(0xe8ecea, 0.52, "indoor"));
  // and at night the glass throws it out over the walk, the way a lit room does (from just outside the glass,
  // so that it lights the walk and not the room a second time)
  LAMPS.push({x:IX0-0.9, y:FLV+2.0, z:0.5, color:0xeaf0f4, intensity:0.40, dist:6, decay:1.8, circ:"bldg"});
  // the one with the bad ballast: a tube of its own that the update flickers
  { const m=new T.MeshBasicMaterial({color:0xeaf2ff, toneMapped:false});
    const t=new T.Mesh(new T.PlaneGeometry(0.12, 1.12), m); t.position.set((IX0+IX1)/2+0.20, CEIL-0.064, 2.3); t.rotation.x=Math.PI/2; scene.add(t);
    VENDHUT_RT.flick=m; }

  /* ---- the machines ------------------------------------------------------ */
  const sticker=(x,y,z,ry)=>sign(0.13, 0.085, (c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#1f3f8a"; c.fillRect(0,0,W,H*0.32);
      c.fillStyle="#fff"; fitText(c,"BUSINESS ENTERPRISE PROGRAM",W*0.92,H*0.20,W/2,H*0.17,"700");
      c.fillStyle="#222"; fitText(c,"OPERATED BY A LICENSED",W*0.9,H*0.16,W/2,H*0.48,"600"); fitText(c,"VENDOR WHO IS BLIND",W*0.9,H*0.16,W/2,H*0.68,"600");
      c.fillStyle="#1f3f8a"; fitText(c,"REFUNDS 1-800-555-0144",W*0.9,H*0.14,W/2,H*0.88,"600"); }, x,y,z,ry,false,260);
  // cold drinks and snacks along the south wall, facing in: the lobby's machines again
  const box2=(kind, x, label)=>{
    const z=IZ1-0.50;
    bx("paintm", 0.86, 1.86, 0.98, x, FLV+0.93, z, 0, 0, "#1d1e21");
    push(kind==="snack"?"pic:vend:snack":"pic:vend:soda", planeGeo(0.80, 1.50, 0), x, FLV+1.04, z-0.492, Math.PI, "#ffffff");
    bx("paintm", 0.10, 0.20, 0.06, x-0.33, FLV+1.10, z-0.50, 0, 0, "#3a3b3e");
    bx("paintm", 0.62, 0.14, 0.04, x+0.06, FLV+0.18, z-0.50, 0, 0, "#0e0e10");
    sticker(x+0.30, FLV+1.70, z-0.497, Math.PI);
    addCol(x-0.48, x+0.48, z-0.50, IZ1, FLV-0.5, FLV+1.9);
    addUse(x, z-1.0, FLV, label, ()=>VEND.openAt("hut"+kind, kind), 1.3);
  };
  box2("soda", IX0+0.62, "BUY A DRINK"); box2("snack", IX0+1.62, "BUY A SNACK");
  swingCan(IX1-1.0, IZ1-0.32, Math.PI, FLV);
  addCol(IX1-1.25, IX1-0.75, IZ1-0.57, IZ1, FLV-0.5, FLV+0.9);
  B(0.44, 0.80, 0.44, IX1-0.42, FLV+0.40, IZ1-0.30, "#1f4f9a");
  B(0.46, 0.04, 0.46, IX1-0.42, FLV+0.82, IZ1-0.30, "#163a74");
  addCol(IX1-0.66, IX1-0.18, IZ1-0.54, IZ1, FLV-0.5, FLV+0.9);
  sign(0.30, 0.12, (c,W,H)=>{ c.fillStyle="#1f4f9a"; c.fillRect(0,0,W,H); c.fillStyle="#fff"; fitText(c,"CANS · BOTTLES",W*0.86,H*0.5,W/2,H/2,"700"); },
    IX1-0.42, FLV+0.60, IZ1-0.524, Math.PI);

  // the hot drinks: a cabinet with the lit picture, the panel, the bay with its grate, and the two lamps
  const CX=IX0+0.58, CZ=IZ0+0.42, CF=CZ+0.40;
  bx("paintm", 0.86, 1.83, 0.80, CX, FLV+0.915, CZ, 0, 0, "#2a211c");
  push("pic:vend:coffee", planeGeo(0.78, 0.82, 0), CX, FLV+1.37, CF+0.003, 0, "#ffffff");
  bx("paintm", 0.70, 0.24, 0.02, CX, FLV+0.83, CF+0.01, 0, 0, "#1a1715");
  for(let k=0;k<8;k++) B(0.07, 0.04, 0.015, CX-0.27+(k%4)*0.18, FLV+0.90-((k/4)|0)*0.09, CF+0.025, "#d8d2c2");
  B(0.10, 0.12, 0.03, CX+0.30, FLV+0.66, CF+0.02, "#3a3b3e"); B(0.06, 0.01, 0.01, CX+0.30, FLV+0.69, CF+0.036, "#0a0a0a");
  // the bay: dark inside, a drip grate, the nozzle, and the stream when it runs
  B(0.36, 0.40, 0.02, CX-0.10, FLV+0.50, CF+0.01, "#9a9da0");
  B(0.31, 0.35, 0.004, CX-0.10, FLV+0.50, CF+0.022, "#0c0b0a");
  for(let k=0;k<6;k++) B(0.30, 0.008, 0.012, CX-0.10, FLV+0.335, CF+0.03+k*0.022, "#8a8e90");
  B(0.05, 0.03, 0.08, CX-0.10, FLV+0.66, CF+0.06, "#5a5d60");
  { const RT=VENDHUT_RT, st=new T.Mesh(new T.CylinderGeometry(0.004,0.005,0.30,6), new T.MeshStandardMaterial({color:0x3a1f0e, roughness:0.2}));
    st.position.set(CX-0.10, FLV+0.495, CF+0.07); st.visible=false; scene.add(st); RT.stream=st;
    // the lamps: BREWING (amber, while it runs) and SORRY OUT OF CUPS (red, always)
    RT.brewM=new T.MeshBasicMaterial({color:0x2a1a06, toneMapped:false});
    const bl=new T.Mesh(new T.BoxGeometry(0.11,0.035,0.01), RT.brewM); bl.position.set(CX+0.24, FLV+0.56, CF+0.012); scene.add(bl);
    const cl=new T.Mesh(new T.BoxGeometry(0.11,0.035,0.01), new T.MeshBasicMaterial({color:0xff2a1a, toneMapped:false})); cl.position.set(CX+0.24, FLV+0.50, CF+0.012); scene.add(cl);
    sign(0.12, 0.03, (c,W,H)=>{ c.fillStyle="#141210"; c.fillRect(0,0,W,H); c.fillStyle="#e8e2d0"; fitText(c,"BREWING",W*0.9,H*0.8,W/2,H/2,"600"); }, CX+0.24, FLV+0.595, CF+0.006, 0, false, 120);
    sign(0.12, 0.03, (c,W,H)=>{ c.fillStyle="#141210"; c.fillRect(0,0,W,H); c.fillStyle="#e8e2d0"; fitText(c,"OUT OF CUPS",W*0.9,H*0.8,W/2,H/2,"600"); }, CX+0.24, FLV+0.465, CF+0.006, 0, false, 120);
    // a travel mug, when there is one under the nozzle (14i's trucker brings his own)
    const mug=new T.Mesh(new T.CylinderGeometry(0.042,0.036,0.17,12), new T.MeshStandardMaterial({color:0x9aa0a4, roughness:0.3, metalness:0.7}));
    mug.position.set(CX-0.10, FLV+0.43, CF+0.07); mug.visible=false; scene.add(mug); RT.mug=mug; }
  // somebody's note, taped on crooked
  { const n=signPanel(0.22, 0.16, signTex(220,160,(c,W,H)=>{ c.fillStyle="#fbf8ec"; c.fillRect(0,0,W,H);
      c.fillStyle="#1f2f8a"; c.font="bold 30px 'Comic Sans MS', 'Marker Felt', cursive"; c.textAlign="center"; c.fillText("OUT OF", W/2, 52); c.fillText("CUPS!!", W/2, 92);
      c.font="18px 'Comic Sans MS', cursive"; c.fillText("bring ur own", W/2, 132); c.fillStyle="rgba(230,220,180,0.7)"; c.fillRect(W*0.35,0,W*0.3,14); }),
      CX+0.18, FLV+1.12, CF+0.008, 0);
    n.rotation.z=0.07; }
  sticker(CX-0.30, FLV+1.86-0.07, CF+0.005, 0);
  addCol(CX-0.45, CX+0.45, IZ0, CF, FLV-0.5, FLV+1.85);
  addUse(CX, CF+0.75, FLV, "BUY A COFFEE", ()=>VEND.openAt("hutcoffee", "coffee"), 1.2);
  VENDHUT_RT.coffee={x:CX, z:CF};

  // the sandwiches: a white refrigerated cabinet, its window on five lit shelves of wedges on coils
  // a coil: wire wound on a helix the depth of the shelf, one geometry for every slot
  const COIL=(function(){ const pts=[]; for(let i=0;i<=96;i++){ const a=i/96*Math.PI*2*9; pts.push(V3(Math.cos(a)*0.032, Math.sin(a)*0.032, -0.31+0.62*i/96)); }
    return new T.TubeGeometry(new T.CatmullRomCurve3(pts), 96, 0.003, 4, false); })();
  { const SX=CX+0.98, SZ=IZ0+0.44, SF=SZ+0.42, W2=1.0, CW=0.74, cx2=SX-W2/2+0.04+CW/2;
    B(W2, 0.32, 0.84, SX, FLV+0.16, SZ, "#d8d8d2"); B(W2, 0.12, 0.84, SX, FLV+1.77, SZ, "#d8d8d2");
    B(0.04, 1.30, 0.84, SX-W2/2+0.02, FLV+0.97, SZ, "#d8d8d2"); B(0.22, 1.30, 0.84, SX+W2/2-0.11, FLV+0.97, SZ, "#d0d0ca");
    B(CW, 1.30, 0.02, cx2, FLV+0.97, SZ-0.40, "#e8ecef");
    push("vendglow", planeGeo(CW-0.02, 1.26, 0), cx2, FLV+0.97, SZ-0.388, 0, "#ffffff");
    push("vendglow", planeGeo(CW-0.04, 0.02, 0), cx2, FLV+1.60, SF-0.06, 0, "#ffffff");
    for(let s=0;s<5;s++){ const y=FLV+0.40+s*0.25;
      B(CW-0.01, 0.012, 0.70, cx2, y, SZ+0.02, "#b9bcbd");
      for(let k=0;k<4;k++){ const x=cx2-CW/2+0.10+k*0.18;
        ent(COIL, x, y+0.045, SZ+0.04, "#9a9fa3");
        if((s*4+k)%7===3) continue;                                          // an empty coil or two
        const wedge=new T.CylinderGeometry(0.075,0.075,0.07,3); wedge.rotateX(Math.PI/2);
        const fill=["#e9d9b0","#e2c896","#efe0bf"][(s+k)%3], meat=["#e8a6a0","#c9d47a","#f0e2a8","#d68a6a","#e8c2b8"][(s*3+k)%5];
        ent(wedge, x, y+0.075, SF-0.10, fill, 0, 0, Math.PI);
        ent(new T.BoxGeometry(0.11, 0.012, 0.072), x, y+0.04, SF-0.10, meat, 0, 0, 0);
        B(0.12, 0.03, 0.005, x, y+0.02, SF-0.06, "#f4f2ea"); } }
    push("glass", planeGeo(CW, 1.30, 0), cx2, FLV+0.97, SF+0.002, 0, "#ffffff");
    B(0.18, 0.30, 0.02, SX+W2/2-0.11, FLV+1.22, SF+0.01, "#1a1a1c");
    for(let k=0;k<12;k++) B(0.035, 0.025, 0.01, SX+W2/2-0.17+(k%3)*0.06, FLV+1.30-((k/3)|0)*0.05, SF+0.022, "#c9c6bc");
    B(0.10, 0.10, 0.02, SX+W2/2-0.11, FLV+0.92, SF+0.01, "#3a3b3e");
    B(0.58, 0.12, 0.04, cx2, FLV+0.22, SF+0.01, "#0e0e10");
    sign(0.18, 0.05, (c,W,H)=>{ c.fillStyle="#1d4f91"; c.fillRect(0,0,W,H); c.fillStyle="#fff"; fitText(c,"FRESH FOOD",W*0.9,H*0.7,W/2,H/2,"700"); },
      SX+W2/2-0.11, FLV+1.62, SF+0.022, 0, false, 180);
    sticker(SX+W2/2-0.11, FLV+0.65, SF+0.022, 0);
    addCol(SX-W2/2, SX+W2/2, IZ0, SF, FLV-0.5, FLV+1.85);
    addUse(SX, SF+0.75, FLV, "BUY A SANDWICH", ()=>VEND.openAt("hutsand", "sandwich"), 1.2);
  }
  // the change machine: a narrow grey cabinet, a bill slot, a cup
  { const MX=CX+1.98, MZ=IZ0+0.24, MF=MZ+0.22;
    B(0.52, 1.50, 0.44, MX, FLV+0.75, MZ, "#7d8286");
    sign(0.42, 0.30, (c,W,H)=>{ c.fillStyle="#1a1c1e"; c.fillRect(0,0,W,H); c.fillStyle="#f4c430"; fitText(c,"CHANGE",W*0.8,H*0.30,W/2,H*0.24,"700");
      c.fillStyle="#e8e8e2"; fitText(c,"$1 · $5 BILLS → QUARTERS",W*0.9,H*0.14,W/2,H*0.56,"600"); fitText(c,"FACE UP · NO TORN BILLS",W*0.9,H*0.12,W/2,H*0.78,"500"); },
      MX, FLV+1.22, MF+0.005, 0, true, 300);
    B(0.16, 0.05, 0.02, MX, FLV+0.92, MF+0.01, "#0a0a0a");
    B(0.22, 0.10, 0.12, MX, FLV+0.45, MF+0.05, "#b9bcbd");
    sticker(MX+0.14, FLV+0.70, MF+0.005, 0);
    addCol(MX-0.27, MX+0.27, IZ0, MF+0.12, FLV-0.5, FLV+1.5);
    addUse(MX, MF+0.7, FLV, "BREAK A FIVE", ()=>{
      const r=Math.random();
      if(typeof AUDIO!=="undefined") AUDIO.blip(r<0.35?"bill":"coins", MX, MZ);
      toast(r<0.35 ? "IT TAKES THE FIVE, THINKS ABOUT IT, AND PUSHES IT BACK OUT" : "TWENTY QUARTERS RATTLE INTO THE CUP", "#cfe0d4"); }, 1.2); }

  // the bench along the east wall, the board over it
  { const bx0=IX1-0.24, z0=-2.55, z1=-0.55;
    for(const z of [z0+0.12, z1-0.12]){ B(0.40, 0.04, 0.05, bx0, FLV+0.42, z, "#3a3b3d"); B(0.04, 0.42, 0.05, bx0-0.16, FLV+0.21, z, "#3a3b3d"); B(0.04, 0.42, 0.05, bx0+0.16, FLV+0.21, z, "#3a3b3d"); }
    for(let k=0;k<4;k++) B(0.08, 0.035, z1-z0, bx0-0.15+k*0.10, FLV+0.46, (z0+z1)/2, "#8a6a48");
    for(let k=0;k<2;k++) B(0.035, 0.09, z1-z0, IX1-0.035, FLV+0.62+k*0.14, (z0+z1)/2, "#8a6a48");
    addCol(bx0-0.22, IX1, z0, z1, FLV-0.5, FLV+0.48);
    addSeat(bx0, (z0+z1)/2-0.5, FLV, Math.PI/2, "THE BENCH"); addSeat(bx0, (z0+z1)/2+0.5, FLV, Math.PI/2, "THE BENCH"); }
  { const W=512, H=384, c=cvs(W,H), x=c.getContext("2d"), tex=setSRGB(new T.CanvasTexture(c));
    x.fillStyle="#0e1a2b"; x.fillRect(0,0,W,H);
    B(0.06, 0.66, 1.06, IX1-0.03, FLV+1.86, -1.55, "#151618");
    const mat=new T.MeshBasicMaterial({map:tex, toneMapped:false});
    const s=new T.Mesh(new T.PlaneGeometry(0.98, 0.60), mat); s.position.set(IX1-0.062, FLV+1.86, -1.55); s.rotation.y=-Math.PI/2; scene.add(s);
    VENDHUT_RT.board={c:c, x:x, tex:tex, mat:mat, seg:0, t:0, acc:1, crawl:0};
    addUse(IX1-0.9, -1.55, FLV, "WATCH THE BOARD", ()=>{ const b=VENDHUT_RT.board; b.seg=(b.seg+1)%2; b.t=0; b.acc=1; }, 1.0); }

  // the pay phone, south of the back door, under its little hood, the book on its chain
  { const PZ=2.70, PX=IX1;
    B(0.30, 0.66, 0.60, PX-0.15, FLV+1.55, PZ, "#c8cacb");
    B(0.12, 0.52, 0.30, PX-0.35, FLV+1.45, PZ, "#9fa3a5");
    B(0.08, 0.22, 0.08, PX-0.44, FLV+1.48, PZ+0.18, "#1a1a1a");
    B(0.34, 0.04, 0.66, PX-0.17, FLV+1.92, PZ, "#8a8c8e");
    B(0.34, 0.03, 0.50, PX-0.17, FLV+1.02, PZ, "#8a8c8e");
    B(0.24, 0.05, 0.30, PX-0.20, FLV+1.07, PZ-0.02, "#e8c21e");
    sign(0.36, 0.10, (c,W,H)=>{ c.fillStyle="#1f4f9a"; c.fillRect(0,0,W,H); c.fillStyle="#fff"; fitText(c,"TELEPHONE",W*0.85,H*0.7,W/2,H/2,"700"); },
      PX-0.012, FLV+2.10, PZ, -Math.PI/2, false, 360);
    addCol(PX-0.48, PX, PZ-0.33, PZ+0.33, FLV+0.9, FLV+2.0);
    addUse(PX-0.9, PZ, FLV, "PICK UP THE PHONE", ()=>{
      toast(["…A DIAL TONE. NOBODY TO CALL","…THE COIN RETURN IS JAMMED WITH SOMEBODY'S GUM","…A RECORDING: TO PLACE A COLLECT CALL, DIAL ZERO"][(Math.random()*3)|0],"#cfe0d4");
      if(typeof AUDIO!=="undefined") AUDIO.blip("tone"); }, 1.2); }

  // what is on the walls: the vendor's notice, no loitering, the camera
  sign(0.46, 0.34, (c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#1f3f8a"; c.fillRect(0,0,W,H*0.24);
    c.fillStyle="#fff"; fitText(c,"BUSINESS ENTERPRISE PROGRAM",W*0.9,H*0.13,W/2,H*0.12,"700");
    c.fillStyle="#222"; ["THESE MACHINES ARE OPERATED","BY A LICENSED VENDOR WHO IS BLIND,","UNDER THE STATE'S PROGRAM FOR","VENDING ON PUBLIC PROPERTY."].forEach((s,i)=>fitText(c,s,W*0.9,H*0.085,W/2,H*(0.36+i*0.11),"500"));
    c.fillStyle="#1f3f8a"; fitText(c,"LOST MONEY? REFUNDS 1-800-555-0144",W*0.9,H*0.09,W/2,H*0.88,"700"); }, IX1-0.012, FLV+1.62, 3.85, -Math.PI/2);
  sign(0.40, 0.26, (c,W,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H); c.fillStyle="#b3151b"; c.fillRect(0,0,W,H*0.30);
    c.fillStyle="#fff"; fitHwy(c,"NOTICE",W*0.6,H*0.20,W/2,H*0.16); c.fillStyle="#1a1a1a";
    fitHwy(c,"NO LOITERING",W*0.84,H*0.18,W/2,H*0.50); fitText(c,"NO SLEEPING ON BENCHES · 24 HR VIDEO",W*0.9,H*0.10,W/2,H*0.78,"600"); },
    IX1-0.012, FLV+2.45, -1.55, -Math.PI/2);
  ent(new T.SphereGeometry(0.07, 12, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2), IX0+0.5, CEIL, IZ1-0.5, "#1a1c1e");
  B(0.18, 0.02, 0.18, IX0+0.5, CEIL-0.01, IZ1-0.5, "#d8d8d4");

  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.15}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();
// the hot drinks' lit picture: a cup steaming on a dark ground
bucketOf("pic:vend:coffee", ()=>picGlowMat("vend:coffee", 512, (x,W,H)=>{
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#3a1f12"); g.addColorStop(1,"#120a06"); x.fillStyle=g; x.fillRect(0,0,W,H);
  x.fillStyle="#f6f1e2"; fitText(x,"FRESH BREWED",W*0.8,H*0.09,W/2,H*0.10,"700");
  x.fillStyle="#d9a85a"; fitText(x,"HOT DRINKS",W*0.6,H*0.06,W/2,H*0.19,"600");
  x.fillStyle="#f2efe6"; x.beginPath(); x.moveTo(W*0.32,H*0.42); x.lineTo(W*0.68,H*0.42); x.lineTo(W*0.63,H*0.82); x.lineTo(W*0.37,H*0.82); x.closePath(); x.fill();
  x.fillStyle="#c42a1a"; x.fillRect(W*0.34,H*0.55,W*0.32,H*0.08);
  x.fillStyle="#4a2610"; x.beginPath(); x.ellipse(W*0.5,H*0.42,W*0.18,H*0.025,0,0,7); x.fill();
  x.strokeStyle="rgba(255,255,255,0.55)"; x.lineWidth=W*0.018;
  for(const dx of [-0.08,0,0.08]){ x.beginPath(); x.moveTo(W*(0.5+dx),H*0.39); x.bezierCurveTo(W*(0.46+dx),H*0.33,W*(0.54+dx),H*0.30,W*(0.5+dx),H*0.24); x.stroke(); }
  x.fillStyle="#f6f1e2"; fitText(x,"COFFEE · CAPPUCCINO · COCOA",W*0.88,H*0.05,W/2,H*0.90,"600");
}));
function updateVendHut(dt, now){
  const RT=VENDHUT_RT; if(!RT.board) return;
  const on=GRID.bldg>0.5;
  RT.t+=dt;
  // the bad tube: mostly on, now and then a stutter, off in a power cut
  const k=Math.sin(RT.t*1.7)*Math.sin(RT.t*0.37);
  RT.flick.color.setHex(0xeaf2ff).multiplyScalar(0.72*(on ? (k>0.92 ? (Math.random()<0.5?0.15:0.9) : 1) : 0.03));
  // the coffee: BREWING while it runs, the stream for the pour, the mug if somebody brought one
  if(RT.brew>0) RT.brew=Math.max(0, RT.brew-dt);
  if(RT.pour>0) RT.pour=Math.max(0, RT.pour-dt);
  RT.brewM.color.setHex(on && RT.brew>0 ? 0xffb020 : 0x2a1a06);
  RT.stream.visible=on && RT.pour>0;
  RT.mug.visible=RT.mugUnder;
  // the board: 511's traffic and the weather in turn, redrawn while anybody is near enough to read it
  const b=RT.board;
  if(!on){ b.mat.color.setScalar(0.02); return; }
  b.mat.color.setScalar(1);
  b.t+=dt; b.acc+=dt; if(b.t>12){ b.t=0; b.seg=(b.seg+1)%2; }
  if(b.acc<0.25 || Math.hypot(camera.position.x+51.2, camera.position.z+1.5)>30) return;
  const W=512, H=384, d=b.acc; b.acc=0;
  if(b.seg===0) _tvTraffic(b.x,W,H); else _tvNow(b.x,W,H);
  const msg="I-79 · 511PA.COM   ◆   TRUCK PARKING: THIS LOT 40 SPACES · NEXT REST AREA 31 MI   ◆   DON'T DRIVE DROWSY   ◆   ";
  b.x.fillStyle="#0a0a0a"; b.x.fillRect(0,H-28,W,28); b.x.fillStyle="#f4c430"; b.x.fillRect(0,H-28,W,2);
  b.x.font="500 14px 'JetBrains Mono', monospace"; b.x.fillStyle="#ffffff"; b.x.textAlign="left"; b.x.textBaseline="middle";
  const w=b.x.measureText(msg).width; b.crawl=(b.crawl+d*70)%w; b.x.fillText(msg, -b.crawl, H-13); b.x.fillText(msg, w-b.crawl, H-13);
  b.tex.needsUpdate=true;
}
