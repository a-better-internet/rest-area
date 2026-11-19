"use strict";
/* REST AREA · 14mc-pretzel.js
   The Edinboro Pretzel Company's works, up Hollow Road past Edinboro Beer
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. (After 14mb: Hollow Road runs on up to
   it; after 14q: the people working there are its crowd.) */
/* ----------------------------------------------------------------------
   14mc · THE PRETZEL WORKS
   A third of a kilometre on up Hollow Road from the beer distributor the
   woods open on the right onto the Edinboro Pretzel Company: a long low
   works in pale block, a brown band round its top, its name along the
   front, three flour silos behind it and a truck court down the south
   side, and out by the road on two steel legs a pretzel nine metres
   across, ringed with bulbs that come on at dusk.

   The lobby is a glass front up a few steps from the car lot, with a
   window through onto the floor for the tours. On the floor three lines
   run west to east: the mixer, the twister, the lye bath, the salter, the
   long tunnel oven, the cooling run and the bagger, the belts moving and
   the pretzels going down them raw, dark from the bath and baked brown.
   Through two wide openings in the wall at the end is the warehouse: rows
   of pallet racking to the roof, cartons on every pallet, the staging
   lanes in front of five dock doors, a trailer backed in at one of them
   half loaded, and a forklift going round its loop.

   Everything here is the works' own: the name, the cartons, the people
   are made up here.

   PLAN (world): EAST.pretz.site (04) x 743..892, z -1652..-1496, graded
   level with the road, on RING_PRETZ's 4 m ground. The mouth off Hollow
   Road z -1552..-1536; the lot x 748..764; the building x 780..880, z
   -1615..-1545, its floor 1.2 m up on a plinth (dock height); the floor
   x 780..835 and the warehouse x 835..880; the lobby x 768..780, z
   -1592..-1568; the truck court z -1545..-1500; the silos at z -1630.
   ---------------------------------------------------------------------- */
const PRETZ={routes:{}, lamps:[], bulbs:null, belt:null, lines:null};
(function pretzelWorks(){
  if(typeof EAST==="undefined" || !EAST.pretz) return;
  const E=EDIN, Y=E.y, P=EAST.pretz.site, M=EAST.pretz.mouth, Bq=EAST.beer, RX=Bq.rx, RW=3.4, END=Bq.end, PEND=-1338, LY=Y+PAVE_T+0.015;
  const ME=[], ST=[], r=_trng(4410);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz);
  const S=(r0,x,y,z,c)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c);
  const tubeE=(a, b, rr, c)=>{ const d=b.clone().sub(a), L=d.length(); ME.push({geo:new T.CylinderGeometry(rr, rr, L, 8),
      matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const BROWN="#7a4220", GOLDEN="#d89a3a", CREAM="#f4ead6", RED="#b8281e", WALLC="#c2b292", STEEL="#b8bcc0", DKSTEEL="#5a6066";

  /* ---- the pretzel: one rope, the belly at the bottom, the arms up and over and crossed, the ends laid on the belly ---- */
  const PZ=[[-0.56,-0.6,0.08],[-0.32,-0.26,0.06],[0,0.08,0.085],[0.24,0.34,0.03],[0.46,0.56,0],[0.72,0.64,0],[0.93,0.46,0],[0.97,0.1,0],[0.82,-0.3,0],
            [0.48,-0.64,0],[0,-0.8,0],[-0.48,-0.64,0],[-0.82,-0.3,0],[-0.97,0.1,0],[-0.93,0.46,0],[-0.72,0.64,0],[-0.46,0.56,0],[-0.24,0.34,-0.03],
            [0,0.08,-0.085],[0.32,-0.26,0.06],[0.56,-0.6,0.08]];
  const pretzelCurve=(s)=>new T.CatmullRomCurve3(PZ.map(p=>V3(p[0]*s, p[1]*s, p[2]*s)), false, "centripetal");
  const pretzelGeo=(s, rr, tub, rad)=>new T.TubeGeometry(pretzelCurve(s), tub, rr, rad, false);

  /* ---- the ground: Hollow Road on north from where it used to stop, the mouth, the lot, the walk, the truck court ---- */
  // (the road from here north, past the office park's mouth, is 14md's: one surface with that mouth's rounding)
  { const road=SD_rect(RX-RW, RX+RW, -1660, -1496), mouth=SD_rect(RX+RW-0.6, 750, M.z0, M.z1), lot=SD_rect(748, 764, -1600, -1506),
      walk=SD_rect(763, 768.2, -1592, -1568), court=SD_rect(763, 890, -1545, -1500);
    push("lotpave", sdPaveGeo(sdUnion([road, mouth, lot, walk, court], 4), RX-RW-1, 891, -1660, -1496, 0.5, 3), 0, LY, 0, 0, "#9a9a96");
    // (and on south to the beer distributor; Hollow Run Marina's drive off it, its mouth rounded, and the marina's lot, one surface with it: 14mg)
    { const MA=EAST.marina, mz=(MA.mouth.z0+MA.mouth.z1)/2;
      push("lotpave", sdPaveGeo(sdUnion([SD_rect(RX-RW, RX+RW, -1496, PEND), SD_rect(RX+RW-0.6, 864, mz-3.5, mz+3.5), SD_rect(862, 892, -1440, -1376)], 4), RX-RW-1, 893, -1496, PEND, 0.5, 3), 0, LY, 0, 0, "#9a9a96");
      addPaveRect(RX+RW-0.6, 864, mz-3.5, mz+3.5, Y); addPaveRect(862, 892, -1440, -1376, Y); }
    addPaveRect(RX+RW-0.6, 750, M.z0, M.z1, Y); addPaveRect(748, 764, -1600, -1506, Y); addPaveRect(763, 768.2, -1592, -1568, Y); addPaveRect(763, 890, -1545, -1500, Y); }
  // the lot's stalls, two rows, kept six metres clear of the way in
  for(const [xa, xb] of [[748.3, 753.5],[758.7, 763.7]]) for(const [z0, z1] of [[-1598.6, -1558.0],[-1530.0, -1507.0]])
    for(let z=z0; z<=z1+0.01; z+=2.7) stripe(xa, z, xb, z, 0.1, WHITE_LINE, LY);
  // (the cars in them are drivable, 14k's parked)
  if(typeof parked==="function"){ parked(0, "#5a6a7a", 761.2, -1594.55, Math.PI/2, Y); parked(2, "#8a2a22", 761.2, -1589.15, Math.PI/2, Y);
    parked(1, "#e8e2d0", 750.9, -1575.65, -Math.PI/2, Y); parked(3, "#2a3a2a", 761.2, -1520.55, Math.PI/2, Y); }

  /* ---- the building: a plinth at dock height, pale block walls, the parapet, the roof ---- */
  const BX0=780, BX1=880, BZ0=-1615, BZ1=-1545, WT=0.3, FLS=LY+1.2, CEIL=FLS+9.0, TOPW=CEIL+0.9, DX=835;
  const LX0=768, LZ0=-1592, LZ1=-1568, LWT=0.25, LC=FLS+3.3, LTOP=FLS+3.9;
  PRETZ.FLS=FLS;
  const wb=(x0, x1, z0, z1, y0, y1, col)=>wallBox("block", x0, x1, z0, z1, y0, y1, col||WALLC, 0.6, FLS);
  const runW=(ax, c0, c1, a, b, y0, y1, ops, col)=>{ let u=a;
    const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return; if(ax==="x") wb(p, q, c0, c1, h0, h1, col); else wb(c0, c1, p, q, h0, h1, col); };
    for(const o of ops.slice().sort((m, n)=>m.a-n.a)){ piece(u, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); u=o.b; }
    piece(u, b, y0, y1); };
  const CLR=(c)=>({a:c-3, b:c+3, sill:FLS+5.6, head:FLS+7.4});                        // (a clerestory's band of glass)
  const DOCKS=[842, 850, 858, 866, 874], OPEN=858;
  const dockOp=(c)=>({a:c-1.5, b:c+1.5, sill:FLS-0.3, head:FLS+3.0});
  const LD={a:-1576.7, b:-1575.3, sill:FLS-0.3, head:FLS+2.2}, VW={a:-1590.0, b:-1580.0, sill:FLS+0.9, head:FLS+2.6};
  const O1={a:-1597.5, b:-1590.5, sill:FLS-0.3, head:FLS+4.5}, O2={a:-1579.5, b:-1572.5, sill:FLS-0.3, head:FLS+4.5};
  const HALLC=[787, 797, 807, 817, 827], WHC=[847, 859, 871];
  runW("x", BZ0, BZ0+WT, BX0, BX1, FLS-0.05, TOPW, HALLC.concat(WHC).map(CLR));
  runW("x", BZ1-WT, BZ1, BX0, BX1, FLS-0.05, TOPW, HALLC.map(CLR).concat(DOCKS.map(dockOp)));
  runW("z", BX0, BX0+WT, BZ0+WT, BZ1-WT, FLS-0.05, TOPW, [LD, VW]);
  runW("z", BX1-WT, BX1, BZ0+WT, BZ1-WT, FLS-0.05, TOPW, []);
  runW("z", DX, DX+WT, BZ0+WT, BZ1-WT, FLS-0.05, CEIL+0.02, [O1, O2], "#e2ddd0");
  // the plinth, five centimetres proud of the walls all round (a ledge, so no face of it lies in theirs); the floor on it
  B(BX1-BX0+0.1, FLS-0.012-(LY-0.3), BZ1-BZ0+0.1, (BX0+BX1)/2, (FLS-0.012+LY-0.3)/2, (BZ0+BZ1)/2, "#a8a49a");
  addCol(BX0-0.05, BX1+0.05, BZ0-0.05, BZ1+0.05, LY-0.8, FLS-0.05);
  { const g=new T.PlaneGeometry(BX1-BX0, BZ1-BZ0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(BX1-BX0)/2, U.getY(i)*(BZ1-BZ0)/2);
    push("concrete", g, (BX0+BX1)/2, FLS, (BZ0+BZ1)/2, 0, "#a8a49a", -Math.PI/2, 0); }
  addFlat(BX0, BX1, BZ0, BZ1, FLS);
  // the roof deck (its edges let into the walls), the coping, the brown band round the top, the units and the oven's stacks up through it
  B(BX1-BX0-2*WT+0.04, 0.3, BZ1-BZ0-2*WT+0.04, (BX0+BX1)/2, CEIL+0.15, (BZ0+BZ1)/2, "#c8c4ba");
  for(const zc of [BZ0+WT/2, BZ1-WT/2]) B(BX1-BX0+0.08, 0.06, WT+0.08, (BX0+BX1)/2, TOPW+0.03, zc, "#6a3a1c");
  for(const xc of [BX0+WT/2, BX1-WT/2]) B(WT+0.06, 0.06, BZ1-BZ0-2*WT-0.08, xc, TOPW+0.03, (BZ0+BZ1)/2, "#6a3a1c");
  for(const [zf, sd] of [[BZ0, -1],[BZ1, 1]]) B(BX1-BX0+0.04, 0.6, 0.02, (BX0+BX1)/2, FLS+8.3, zf+sd*0.01, BROWN);
  for(const [xf, sd] of [[BX0, -1],[BX1, 1]]) B(0.025, 0.6, BZ1-BZ0, xf+sd*0.0125, FLS+8.3, (BZ0+BZ1)/2, BROWN);
  for(const [x, z] of [[792, -1600],[812, -1560],[850, -1590],[868, -1570]]){ B(3.0, 1.6, 2.2, x, CEIL+0.3+0.8, z, "#9aa0a4"); B(2.6, 0.1, 1.8, x, CEIL+1.95, z, "#7a8084"); }
  // its name along the front, over the lobby's roof
  sign(30, 2.4, (c, W, H)=>{ c.fillStyle=CREAM; c.fillRect(0, 0, W, H); c.fillStyle=BROWN; c.fillRect(0, H*0.82, W, H*0.18);
      say(c, "EDINBORO PRETZEL CO.", W/2, H*0.42, W*0.82, H*0.5, BROWN, "900", "Georgia, 'Times New Roman', serif"); },
    BX0-0.03, FLS+5.7, -1580, -Math.PI/2, false, 2400);
  B(0.02, 2.5, 30.1, BX0-0.01, FLS+5.7, -1580, "#8a7a62");

  /* ---- the clerestories' glass, the dock doors ---- */
  for(const [zc, list] of [[BZ0+WT/2, HALLC.concat(WHC)],[BZ1-WT/2, HALLC]]) for(const c of list){ const o=CLR(c);
    push("glass", planeGeo(o.b-o.a-0.02, o.head-o.sill-0.02, 0), c, (o.sill+o.head)/2, zc, 0, "#ffffff");
    for(const dx of [-1.5, 0, 1.5]) B(0.08, o.head-o.sill-0.01, WT-0.08, c+dx, (o.sill+o.head)/2, zc, "#4a4e52");
    B(o.b-o.a, 0.04, WT+0.1, c, o.sill+0.02, zc, "#8a8e90"); }
  for(const c of DOCKS){ const o=dockOp(c), zw=BZ1-WT/2;
    if(c===OPEN){ B(3.0, 0.08, 3.0, c, FLS+3.4, zw-1.7, "#c8ccd0"); for(const s of [-1, 1]) B(0.06, 0.1, 3.1, c+s*1.53, FLS+3.4, zw-1.75, "#6a6e70"); }
    else { B(2.98, o.head-FLS-0.01, 0.06, c, (FLS+o.head)/2, zw, "#c8ccd0");
      for(let k=1;k<5;k++) for(const s of [-1, 1]) B(2.9, 0.025, 0.012, c, FLS+k*0.6, zw+s*0.036, "#a8acb0"); }
    // the seal round it outside, the bumpers, the light on its arm, the guide lines on the court
    for(const s of [-1, 1]) B(0.25, 2.95, 0.28, c+s*1.68, FLS+1.475, BZ1+0.14, "#1a1a1a"); B(3.61, 0.4, 0.3, c, FLS+3.15, BZ1+0.15, "#1a1a1a");
    for(const s of [-1, 1]) B(0.25, 0.42, 0.15, c+s*1.1, FLS-0.3, BZ1+0.125, "#1a1a1a");
    C(0.03, 0.9, c+2.3, FLS+3.6, BZ1+0.45, "#3a3a3a", 6, Math.PI/2, 0, 0); RB(0.3, 0.2, 0.25, c+2.3, FLS+3.55, BZ1+0.95, "#3a3a3a", 0, 0.03);
    for(const s of [-1, 1]) stripe(c+s*1.45, BZ1+0.8, c+s*1.45, BZ1+16, 0.12, "#e2b31c", LY); }

  /* ---- the lobby: up five steps from the walk, a glass front, the desk, the case of everything they make, a window onto the floor ---- */
  const FD={a:-1580.5, b:-1579.5, sill:FLS-0.3, head:FLS+2.2}, W1={a:-1590.6, b:-1582.0, sill:FLS+0.75, head:FLS+2.6}, W2={a:-1578.0, b:-1569.4, sill:FLS+0.75, head:FLS+2.6};
  runW("z", LX0, LX0+LWT, LZ0, LZ1, FLS-0.05, LTOP, [FD, W1, W2]);
  runW("x", LZ0, LZ0+LWT, LX0+LWT, BX0, FLS-0.05, LTOP, []);
  runW("x", LZ1-LWT, LZ1, LX0+LWT, BX0, FLS-0.05, LTOP, []);
  B(BX0-LX0, FLS-0.012-(LY-0.3), LZ1-LZ0+0.1, (LX0-0.05+BX0-0.05)/2, (FLS-0.012+LY-0.3)/2, (LZ0+LZ1)/2, "#a8a49a");
  addCol(LX0-0.05, BX0, LZ0-0.05, LZ1+0.05, LY-0.8, FLS-0.05);
  { const g=new T.PlaneGeometry(BX0-LX0, LZ1-LZ0); push("concrete", g, (LX0+BX0)/2, FLS, (LZ0+LZ1)/2, 0, "#b4ab98", -Math.PI/2, 0); }
  addFlat(LX0-2.4, BX0+WT+0.02, LZ0, LZ1, FLS);
  B(BX0-LX0-2*LWT+0.04, 0.25, LZ1-LZ0-2*LWT+0.04, (LX0+BX0)/2, LC+0.125, (LZ0+LZ1)/2, "#e8e4d8");
  for(const zc of [LZ0+LWT/2, LZ1-LWT/2]) B(BX0-LX0+0.04, 0.06, LWT+0.08, (LX0+BX0)/2-0.02, LTOP+0.03, zc, "#6a3a1c");
  B(LWT+0.06, 0.06, LZ1-LZ0-2*LWT-0.08, LX0+LWT/2, LTOP+0.03, (LZ0+LZ1)/2, "#6a3a1c");
  for(const o of [W1, W2]){ const xm=LX0+LWT/2;
    push("glass", planeGeo(o.b-o.a-0.02, o.head-o.sill-0.02, 0), xm, (o.sill+o.head)/2, (o.a+o.b)/2, Math.PI/2, "#ffffff");
    for(let z=o.a+0.04; z<o.b; z+=(o.b-o.a-0.08)/4) B(LWT-0.06, o.head-o.sill-0.01, 0.07, xm, (o.sill+o.head)/2, z, "#3b3029");
    B(LWT+0.08, 0.05, o.b-o.a, xm, o.sill+0.025, (o.a+o.b)/2, "#3b3029"); }
  makeDoor(XF(LX0+LWT/2, FD.b-0.02, Math.PI/2), 0, FLS+0.01, 0, "EDINBORO PRETZEL CO.", true, 0, "store");
  // the canopy over the door, its name on the front
  B(1.8, 0.16, 4.4, LX0-0.9, FLS+2.68, -1580, BROWN);
  sign(4.2, 0.13, (c, W, H)=>{ c.fillStyle=BROWN; c.fillRect(0, 0, W, H); say(c, "THE WORKS · VISITORS", W/2, H/2, W*0.8, H*0.6, CREAM, "800", "Georgia, serif"); }, LX0-1.815, FLS+2.68, -1580, -Math.PI/2, false, 840);
  // the steps: a landing at the door, five risers down to the walk, a rail each side
  B(LX0-0.05-765.6, FLS-(LY-0.05), 6.0, (765.6+LX0-0.05)/2, (FLS+LY-0.05)/2, -1580, "#a8a49a");
  for(let k=0;k<5;k++){ const x0=765.6-(5-k)*0.3, top=LY+0.2*(k+1); B(0.3, top-(LY-0.05), 6.0, x0+0.15, (top+LY-0.05)/2, -1580, "#a8a49a"); }
  addRamp(764.1, 765.6, -1583, -1577, "x", 764.1, 765.6, LY, FLS);
  for(const s of [-1, 1]){ const z=-1580+s*2.9;
    tubeE(V3(764.2, LY+1.0, z), V3(765.6, FLS+0.9, z), 0.025, "#3a3a3a"); tubeE(V3(765.6, FLS+0.9, z), V3(767.8, FLS+0.9, z), 0.025, "#3a3a3a");
    for(const [x, y0, y1] of [[764.25, LY, LY+1.0],[765.6, FLS-0.6, FLS+0.9],[767.7, FLS, FLS+0.9]]) C(0.022, y1-y0, x, (y0+y1)/2, z, "#3a3a3a", 8); }
  // inside: the desk and the woman at it, the case, the bench by the window, the photographs, the plants, the logo over the desk
  RB(0.7, 1.05, 2.4, 773.4, FLS+0.525, -1572.6, "#7a4a2a", 0, 0.03); RB(0.86, 0.05, 2.56, 773.4, FLS+1.075, -1572.6, "#3a2a1e", 0, 0.015);
  RB(0.36, 0.26, 0.04, 773.7, FLS+1.28, -1572.2, "#1a1a1a", 0, 0.01); push("lk_tvon", planeGeo(0.32, 0.2, 0), 773.7-0.0, FLS+1.28, -1572.2+0.022, 0, "#ffffff");
  addCol(772.95, 773.85, -1573.9, -1571.3, FLS-0.5, FLS+1.1);
  sign(5.0, 1.3, (c, W, H)=>{ c.fillStyle=BROWN; c.fillRect(0, 0, W, H); c.strokeStyle=GOLDEN; c.lineWidth=6; c.strokeRect(8, 8, W-16, H-16);
      say(c, "EDINBORO PRETZEL CO.", W/2, H*0.42, W*0.8, H*0.36, CREAM, "900", "Georgia, serif"); say(c, "TWISTED BY HAND SINCE 1931 · BY MACHINE SINCE 1958", W/2, H*0.74, W*0.78, H*0.13, GOLDEN, "700", "Georgia, serif"); },
    774.0, FLS+2.2, LZ1-LWT-0.02, Math.PI, false, 900);
  { const x0=770.0, x1=776.0, z=LZ0+LWT+0.35;
    B(x1-x0, 0.8, 0.6, (x0+x1)/2, FLS+0.4, z, "#3a2a1e"); B(x1-x0, 0.05, 0.62, (x0+x1)/2, FLS+2.0, z, "#3a2a1e");
    for(const x of [x0, x1]) B(0.05, 1.2, 0.6, x, FLS+1.4, z, "#3a2a1e");
    for(const y of [FLS+1.2, FLS+1.6]) B(x1-x0-0.05, 0.025, 0.56, (x0+x1)/2, y, z, "#e8e4d8");
    push("glass", planeGeo(x1-x0-0.06, 1.18, 0), (x0+x1)/2, FLS+1.4, z+0.3, 0, "#ffffff");
    for(let k=0;k<14;k++){ const x=x0+0.3+(k%7)*0.82, y=(k<7 ? FLS+0.8 : FLS+1.2)+0.025+0.14, col=["#c8282a",GOLDEN,"#2a5aa8",BROWN,"#2e7a3a","#e8c870","#7a1a3a"][k%7];
      RB(0.26, 0.28, 0.12, x, y, z-0.05, col, 0, 0.03); RB(0.2, 0.26, 0.1, x+0.24, y-0.01, z+0.02, col, 0, 0.03); }
    addCol(x0, x1, z-0.3, z+0.31, FLS-0.5, FLS+2.05); }
  { const x=770.4; RB(0.5, 0.06, 2.4, x, FLS+0.45, -1586.2, "#6a4a2e", 0, 0.02); RB(0.08, 0.5, 2.4, x-0.22, FLS+0.72, -1586.2, "#6a4a2e", 0, 0.02);
    for(const dz of [-1.1, 1.1]) B(0.44, 0.42, 0.06, x, FLS+0.21, -1586.2+dz, "#3a2a1e");
    addCol(x-0.3, x+0.27, -1587.45, -1584.95, FLS-0.5, FLS+0.5); for(const dz of [-0.7, 0, 0.7]) addSeat(x+0.04, -1586.2+dz, FLS, -Math.PI/2, "THE BENCH BY THE WINDOW"); }
  [["THE WORKS · 1931", 770.6],["THE FIRST OVEN", 772.6],["THE TWISTERS · 1958", 777.2]].forEach(([t, x])=>{ const z=LZ0+LWT;
    B(1.3, 0.95, 0.03, x, FLS+2.55, z+0.015, "#3a2a1e");
    sign(1.18, 0.83, (c, W, H)=>{ c.fillStyle="#d8c8a8"; c.fillRect(0, 0, W, H); c.fillStyle="#6a5a44"; c.fillRect(W*0.08, H*0.08, W*0.84, H*0.6);
        c.fillStyle="#8a7a62"; for(let k=0;k<6;k++) c.fillRect(W*(0.12+k*0.13), H*(0.36-(k%2)*0.08), W*0.08, H*(0.3+(k%2)*0.08));
        say(c, t, W/2, H*0.82, W*0.8, H*0.11, "#3a2a1e", "700", "Georgia, serif"); }, x, FLS+2.55, z+0.042, 0, false, 240); });
  for(const [x, z] of [[769.0, -1569.0],[779.1, -1569.0]]){ C(0.22, 0.4, x, FLS+0.2, z, "#8a4a2a", 14); S(0.42, x, FLS+0.75, z, "#3a5a2a"); addCol(x-0.25, x+0.25, z-0.25, z+0.25, FLS-0.5, FLS+1.0); }
  // the window onto the floor, a rail at it; the way through, its sign
  push("glass", planeGeo(VW.b-VW.a-0.02, VW.head-VW.sill-0.02, 0), BX0+WT/2, (VW.sill+VW.head)/2, (VW.a+VW.b)/2, Math.PI/2, "#ffffff");
  B(0.36, 0.05, VW.b-VW.a, BX0+WT/2-0.03, VW.sill+0.025, (VW.a+VW.b)/2, "#3b3029");
  for(const [o, x] of [[LD, BX0-0.03]]){ for(const z of [o.a-0.05, o.b+0.05]) B(WT+0.1, o.head-FLS+0.05, 0.08, BX0+WT/2, FLS+(o.head-FLS+0.05)/2, z, "#3b3029");
    B(WT+0.116, 0.08, o.b-o.a+0.18, BX0+WT/2, o.head-0.03, (o.a+o.b)/2, "#3b3029"); }      // (the head a little deeper than the jambs, so no face of one lies in one of the other)
  sign(0.9, 0.5, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); c.fillStyle="#1f5aa8"; c.fillRect(0, 0, W, H*0.32);
      say(c, "NOTICE", W/2, H*0.16, W*0.7, H*0.2, "#f4f2ec"); say(c, "HAIRNETS PAST THIS POINT", W/2, H*0.5, W*0.8, H*0.13, "#1a1a1a", "700", "Arial"); say(c, "WASH YOUR HANDS", W/2, H*0.74, W*0.8, H*0.13, "#1a1a1a", "700", "Arial"); },
    BX0-0.02, FLS+1.6, -1574.0, -Math.PI/2, false, 216);
  push("tube", boxGeo(0.3, 0.02, 1.2, 0), 774.0, LC-0.012, -1580, 0, "#ffffff"); push("tube", boxGeo(0.3, 0.02, 1.2, 0), 774.0, LC-0.012, -1574, 0, "#ffffff");
  LAMPS.push({x:774.0, y:LC-0.3, z:-1578, color:0xfff2e0, intensity:0.55, dist:8, decay:1.5, indoor:true});

  /* ---- the floor: three lines west to east, each mixer, twister, lye bath, salter, tunnel oven, cooling run, bagger ---- */
  const LINES=[-1603, -1585, -1567], BH=FLS+0.95, B0=792, B1=830, BW=0.9;
  PRETZ.lines=LINES; PRETZ.BH=BH;
  const beltG=[];
  for(const L of LINES){
    // the mixer: a steel bowl on its stand, the head over it and the paddle down into it, the flour coming down from the silos
    { const x=785.2; for(const [dx, dz] of [[-0.7,-0.7],[0.7,-0.7],[-0.7,0.7],[0.7,0.7]]) B(0.1, 0.9, 0.1, x+dx, FLS+0.45, L+dz, DKSTEEL);
      C(1.0, 1.2, x, FLS+1.5, L, STEEL, 24); C(1.04, 0.06, x, FLS+2.1, L, "#9aa0a4", 24);
      C(0.12, 2.0, x+0.95, FLS+1.9, L, DKSTEEL, 10); RB(1.6, 0.5, 0.6, x+0.3, FLS+3.0, L, "#e8e4d8", 0, 0.05); C(0.06, 1.0, x, FLS+2.4, L, STEEL, 8);
      C(0.15, CEIL-(FLS+3.25), x-0.3, (CEIL+FLS+3.25)/2, L-0.2, "#c8ccd0", 10);
      addCol(x-1.1, x+1.15, L-1.1, L+1.1, FLS-0.5, FLS+3.3); }
    // the twister: a long stainless cabinet, its hopper, its panel lit
    { const x=789.9; RB(3.6, 1.7, 1.8, x, FLS+0.85, L, STEEL, 0, 0.05);
      ent(new T.CylinderGeometry(0.6, 0.18, 0.7, 14), x-1.0, FLS+2.05, L, "#c8ccd0");
      RB(0.6, 0.45, 0.08, x+0.6, FLS+1.35, L+0.94, "#2a2c2e", 0, 0.01); push("lk_tvon", planeGeo(0.5, 0.33, 0), x+0.6, FLS+1.35, L+0.983, 0, "#ffffff");
      for(let k=0;k<3;k++) S(0.035, x+1.1+k*0.12, FLS+1.2, L+0.92, ["#3ac83a","#e8c81a","#c8281a"][k]);
      addCol(x-1.82, x+1.82, L-0.92, L+0.92, FLS-0.5, FLS+2.4); }
    // the belt's frame the whole way, its legs, the return run under it
    for(const s of [-1, 1]) B(B1-B0, 0.14, 0.05, (B0+B1)/2, BH-0.03, L+s*(BW/2+0.03), "#9aa0a4");
    B(B1-B0, 0.04, BW-0.05, (B0+B1)/2, BH-0.22, L, "#3a3a3a");
    for(let x=B0+0.4; x<B1; x+=2.0) for(const s of [-1, 1]) B(0.06, BH-0.1-FLS, 0.06, x, FLS+(BH-0.1-FLS)/2, L+s*0.4, DKSTEEL);
    addCol(B0, B1, L-0.55, L+0.55, FLS-0.5, BH+0.08);
    { const g=new T.PlaneGeometry(B1-B0, BW), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(B1-B0)/0.5, U.getY(i));
      beltG.push({geo:g, matrix:new T.Matrix4().compose(V3((B0+B1)/2, BH, L), new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2, 0, 0)), V3(1,1,1)), color:new T.Color("#ffffff")}); }
    // the lye bath: an open steel trough the belt dips through, the hood over it
    { const x0=795.9, x1=799.1, xm=(x0+x1)/2;
      B(x1-x0-0.04, 0.05, 1.3, xm, BH-0.3, L, "#8a9094");      // (the bottom inside the end walls)
      for(const s of [-1, 1]){ B(x1-x0, 0.62, 0.05, xm, BH, L+s*0.65, "#8a9094"); B(0.05, 0.62, 1.25, s<0 ? x0 : x1, BH-0.06+(s<0 ? 0 : 0), L, "#8a9094"); }
      ent(new T.PlaneGeometry(x1-x0-0.1, 1.2), xm, BH+0.16, L, "#4a5248", -Math.PI/2, 0, 0);
      B(x1-x0+0.2, 0.08, 1.5, xm, BH+1.35, L, "#9aa0a4"); C(0.2, CEIL-(BH+1.4), xm, (CEIL+BH+1.4)/2, L, "#9aa0a4", 10);
      for(const s of [-1, 1]) B(0.06, 1.05, 0.06, xm+s*1.6, BH+0.82, L+0.7, DKSTEEL);
      sign(0.5, 0.36, (c, W, H)=>{ c.fillStyle="#f2c41c"; c.fillRect(0, 0, W, H); c.fillStyle="#1a1a1a"; c.fillRect(0, 0, W, H*0.3); say(c, "CAUTION", W/2, H*0.15, W*0.7, H*0.18, "#f2c41c");
          say(c, "LYE BATH", W/2, H*0.6, W*0.8, H*0.24, "#1a1a1a"); }, xm, BH+0.12, L+0.68, 0, false, 120); }
    // the salter: a hopper on two legs over the belt
    { const x=800.6; RB(0.9, 0.55, 1.1, x, BH+1.05, L, STEEL, 0, 0.03); ent(new T.CylinderGeometry(0.42, 0.08, 0.35, 4, 1, false, Math.PI/4), x, BH+0.6, L, STEEL);
      for(const s of [-1, 1]) B(0.06, 1.3, 0.06, x, FLS+(BH+0.8-FLS)/2+0.02, L+s*0.62, DKSTEEL);
      for(let k=0;k<14;k++) B(0.006, 0.006, 0.006, x+(r()-0.5)*0.3, BH+0.12+r()*0.3, L+(r()-0.5)*0.6, "#f4f4f0"); }
    // the tunnel oven: eighteen metres of it, its mouths glowing, a row of spy windows each side, the burners' pipes, three stacks through the roof
    { const x0=803.0, x1=821.0, xm=(x0+x1)/2;
      RB(x1-x0, 2.0, 2.4, xm, FLS+1.6, L, "#9aa0a4", 0, 0.06); RB(x1-x0+0.1, 0.12, 2.5, xm, FLS+2.66, L, "#7a8084", 0, 0.03);
      for(let x=x0+1.0; x<x1; x+=2.0) for(const s of [-1, 1]) B(0.08, 0.5, 0.08, x, FLS+0.3, L+s*1.0, DKSTEEL);
      for(const [xe, ry] of [[x0, -Math.PI/2],[x1, Math.PI/2]]) push("rn_glow", planeGeo(BW-0.05, 0.22, 0), xe+(ry<0 ? -0.008 : 0.008), BH+0.13, L, ry, "#ff8a3a");
      for(let k=0;k<4;k++) for(const s of [-1, 1]){ const x=x0+2.5+k*4.3;
        B(0.62, 0.42, 0.02, x, FLS+1.75, L+s*1.205, "#3a3a3a"); push("rn_glow", planeGeo(0.5, 0.3, 0), x, FLS+1.75, L+s*1.222, s>0 ? 0 : Math.PI, "#ff9a4a"); }
      for(const s of [-1, 1]) tubeE(V3(x0+0.5, FLS+0.75, L+s*1.3), V3(x1-0.5, FLS+0.75, L+s*1.3), 0.04, "#e8c81a");
      for(let k=0;k<3;k++){ const x=x0+3+k*6; C(0.22, CEIL+1.6-(FLS+2.7), x, (CEIL+1.6+FLS+2.7)/2, L, "#8a8e90", 12); C(0.36, 0.05, x, CEIL+1.75, L, "#8a8e90", 12);
        for(const s of [-1, 1]) B(0.03, 0.3, 0.03, x+s*0.25, CEIL+1.6, L, "#8a8e90"); }
      { const x=x0+1.2, z=L+1.65; B(0.9, 1.9, 0.5, x, FLS+0.95, z, "#d8d4c8"); RB(0.5, 0.38, 0.04, x, FLS+1.45, z+0.26, "#1a1a1a", 0, 0.01);
        push("lk_tvon", planeGeo(0.44, 0.32, 0), x, FLS+1.45, z+0.282, 0, "#ffffff"); addCol(x-0.46, x+0.46, z-0.26, z+0.26, FLS-0.5, FLS+1.9); }
      addCol(x0, x1, L-1.25, L+1.25, FLS-0.5, FLS+2.75); }
    // the bagger at the end, its film on the roll, and the cases going off on rollers
    { const x=829.4; RB(3.0, 2.0, 1.7, x, FLS+1.0, L, "#e8e4d8", 0, 0.05); C(0.25, 1.2, x+0.6, FLS+2.25, L, "#c8d8e0", 14, Math.PI/2, 0, 0);
      RB(0.8, 0.6, 0.05, x-0.6, FLS+1.3, L+0.86, "#1a1a1a", 0, 0.01); push("glass", planeGeo(0.72, 0.52, 0), x-0.6, FLS+1.3, L+0.892, 0, "#ffffff");
      const rx0=830.9, rx1=833.0;
      for(const s of [-1, 1]) B(rx1-rx0, 0.08, 0.04, (rx0+rx1)/2, FLS+0.74, L+s*0.36, "#9aa0a4");
      for(let xx=rx0+0.06; xx<rx1; xx+=0.12) C(0.03, 0.68, xx, FLS+0.72, L, "#c8ccd0", 8, Math.PI/2, 0, 0);
      for(const s of [-1, 1]) for(const xx of [rx0+0.2, rx1-0.2]) B(0.05, 0.7, 0.05, xx, FLS+0.35, L+s*0.36, DKSTEEL);
      addCol(x-1.52, rx1+0.05, L-0.88, L+0.88, FLS-0.5, FLS+2.4); }
    // the cases on the rollers and stacked on a pallet at the end
    caseBox(832.0, FLS+0.75+0.02, L, 0.5, 0.32, 0.4); caseBox(832.65, FLS+0.75+0.02, L, 0.5, 0.32, 0.4);
  }
  // overhead: the trusses across, the strip lights in rows, the flour line along the north wall to each mixer
  for(let x=BX0+3; x<DX; x+=6) B(0.2, 0.7, BZ1-BZ0-2*WT+0.02, x, CEIL-0.35, (BZ0+BZ1)/2, "#5a6a7a");
  for(let x=BX0+6; x<DX-2; x+=7) for(const z of [-1594, -1576, -1556, -1610]) push("tube", boxGeo(0.3, 0.02, 1.6, 0), x, CEIL-0.72, z, 0, "#ffffff");
  for(const [x, z] of [[790, -1585],[812, -1585],[828, -1572],[804, -1556]]) LAMPS.push({x:x, y:FLS+6.5, z:z, color:0xf2f6ff, intensity:0.9, dist:24, decay:1.5, indoor:true});
  tubeE(V3(784.9, FLS+6.0, BZ0+WT+0.3), V3(784.9, FLS+6.0, LINES[2]-0.2), 0.15, "#c8ccd0");
  // the walkways painted on the floor, yellow
  for(const z of [-1597.9, -1590.1, -1579.9, -1572.1]) stripe(BX0+1.2, z, DX-1.2, z, 0.1, "#e2b31c", FLS-0.001);
  // a wash station by the way in from the lobby, a rack of hairnets
  { const x=BX0+WT+0.35, z=-1573.0; B(0.6, 0.85, 1.4, x, FLS+0.425, z, STEEL); B(0.62, 0.04, 1.42, x, FLS+0.87, z, "#c8ccd0");
    for(const dz of [-0.35, 0.35]) C(0.012, 0.3, x+0.2, FLS+1.02, z+dz, "#c8ccd0", 6);
    addCol(x-0.31, x+0.31, z-0.71, z+0.71, FLS-0.5, FLS+0.9);
    B(0.04, 0.5, 0.8, BX0+WT+0.02, FLS+1.6, -1571.0, "#e8e4d8"); }

  /* ---- the warehouse: racking to the roof in back-to-back rows, cartons on every pallet, the staging lanes, the docks ---- */
  // (a carton atlas: kraft cartons, the name in red with a pretzel by it, stretch wrap catching the light)
  const CTEX=signTex(512, 256, (c, W, H)=>{ c.fillStyle="#b0864e"; c.fillRect(0, 0, W, H);
    for(let rr=0; rr<4; rr++) for(let q=0;q<4;q++){ const x=q*W/4, y=rr*H/4, w=W/4, h=H/4;
      c.fillStyle=(rr+q)%2 ? "#b88e56" : "#a87e48"; c.fillRect(x, y, w, h); c.fillStyle="rgba(0,0,0,0.3)"; c.fillRect(x, y+h-3, w, 3); c.fillRect(x+w-2, y, 2, h);
      c.fillStyle="#c8a46a"; c.fillRect(x+w*0.46, y, w*0.08, h*0.2);
      c.fillStyle=RED; fitText(c, "EDINBORO", w*0.62, h*0.2, x+w*0.58, y+h*0.42, "900", "Georgia, serif"); fitText(c, "PRETZEL", w*0.62, h*0.16, x+w*0.58, y+h*0.64, "800", "Georgia, serif");
      c.strokeStyle=RED; c.lineWidth=3; c.beginPath(); c.arc(x+w*0.16, y+h*0.48, w*0.07, 0, 7); c.stroke(); c.beginPath(); c.arc(x+w*0.16, y+h*0.6, w*0.05, 0, 7); c.stroke(); }
    c.fillStyle="rgba(255,255,255,0.12)"; for(let k=-H;k<W;k+=34){ c.beginPath(); c.moveTo(k, H); c.lineTo(k+H, 0); c.lineTo(k+H+10, 0); c.lineTo(k+10, H); c.fill(); } });
  CTEX.anisotropy=4;
  function caseBox(x, y0, z, w, h, d){ const g=boxGeo(w, h, d), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, 0.02+U.getX(i)*0.22, 0.76+U.getY(i)*0.22);
    ST.push({geo:g, matrix:new T.Matrix4().makeTranslation(x, y0+h/2, z), color:new T.Color("#ffffff")}); }
  const load=(x, y0, z, w, d, h)=>{ B(w+0.04, 0.14, d+0.04, x, y0+0.07, z, "#a8845a");
    const g=boxGeo(w, h, d), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i), U.getY(i)*Math.min(1, h/1.6));
    ST.push({geo:g, matrix:new T.Matrix4().makeTranslation(x, y0+0.14+h/2, z), color:new T.Color("#ffffff")}); };
  const RZ0=-1607.8, BAY=2.8, NB=16, RZ1=RZ0+BAY*NB, LEV=[0, 1.65, 3.3, 4.95], RH=6.6;
  const rackRow=(rx)=>{ for(let k=0;k<=NB;k++) for(const s of [-1, 1]) B(0.09, RH, 0.09, rx+s*0.5, FLS+RH/2, RZ0+k*BAY, "#2a5aa8");
    for(let k=0;k<NB;k++){ const zm=RZ0+(k+0.5)*BAY;
      for(const lv of LEV){ if(lv>0) for(const s of [-1, 1]) B(0.06, 0.12, BAY-0.09, rx+s*0.5, FLS+lv-0.06, zm, "#e8701a");
        for(const dz of [-0.68, 0.68]) if(r()<0.86) load(rx, FLS+lv, zm+dz, 0.96, 1.16, 0.9+r()*0.55); }
      for(const s of [-1, 1]) for(const y of [0.9, 2.6, 4.2, 5.9]) B(0.03, 0.03, BAY-0.09, rx+s*0.5, FLS+y+0.15, zm, "#2a5aa8"); }
    addCol(rx-0.56, rx+0.56, RZ0-0.05, RZ1+0.05, FLS-0.5, FLS+RH); };
  for(const s of [840.5, 846.3, 852.1, 857.9, 863.7, 869.5]){ rackRow(s+0.55); rackRow(s+1.75); }
  rackRow(878.9);
  // the staging lanes in front of the docks (the one with the trailer in it kept clear), striped
  for(const c of DOCKS){ if(c===OPEN) continue;
    for(const [dz, n] of [[-1555.2, 2],[-1553.0, 2],[-1550.8, 1]]) for(let k=0;k<n;k++) load(c-0.65+k*1.3, FLS, dz, 1.0, 1.16, 0.8+r()*0.6);
    for(const s of [-1, 1]) stripe(c+s*1.45, -1557.0, c+s*1.45, BZ1-WT-0.4, 0.1, "#e2b31c", FLS-0.001);
    addCol(c-1.35, c+1.35, -1556.0, -1550.1, FLS-0.5, FLS+1.6); }
  for(const z of [-1557.6, -1561.0]) stripe(DX+WT+0.6, z, BX1-WT-0.6, z, 0.12, "#e2b31c", FLS-0.001);
  // the shipping desk by the door from the floor, its terminal and printer, a stack of bills of lading
  { const x=837.3, z=-1548.6; RB(1.6, 0.05, 0.75, x, FLS+0.9, z, "#7a7e80", 0, 0.01); for(const dx of [-0.75, 0.75]) B(0.05, 0.88, 0.7, x+dx, FLS+0.44, z, "#5a5e60");
    RB(0.44, 0.3, 0.05, x+0.2, FLS+1.15, z+0.25, "#1a1a1a", 0, 0.01); push("lk_tvon", planeGeo(0.4, 0.26, 0), x+0.2, FLS+1.15, z+0.222, Math.PI, "#ffffff");
    RB(0.38, 0.18, 0.32, x-0.45, FLS+1.02, z+0.1, "#e8e4d8", 0, 0.02); for(let k=0;k<4;k++) B(0.22, 0.004, 0.29, x-0.1+k*0.012, FLS+0.93+k*0.005, z-0.15, "#f2f0ea");
    addCol(x-0.82, x+0.82, z-0.38, z+0.38, FLS-0.5, FLS+0.95);
    sign(1.4, 0.4, (c, W, H)=>{ c.fillStyle="#1a3a6a"; c.fillRect(0, 0, W, H); say(c, "SHIPPING", W/2, H/2, W*0.8, H*0.6, "#f4f2ec"); }, x, FLS+2.6, BZ1-WT-0.02, Math.PI, false, 280); }
  for(const [x, z] of [[850, -1585],[870, -1585],[860, -1556]]) LAMPS.push({x:x, y:FLS+7.0, z:z, color:0xf2f6ff, intensity:0.85, dist:24, decay:1.5, indoor:true});
  for(let x=DX+4; x<BX1-2; x+=6) for(const z of [-1611.2, -1585, -1559]) push("tube", boxGeo(0.3, 0.02, 1.6, 0), x, CEIL-0.72, z, 0, "#ffffff");
  for(let x=DX+3; x<BX1; x+=6) B(0.2, 0.7, BZ1-BZ0-2*WT+0.02, x, CEIL-0.35, (BZ0+BZ1)/2, "#5a6a7a");

  /* ---- a forklift: the yellow body, the counterweight, the overhead guard, the mast and the forks; the seat at its origin ---- */
  const fork=(withLoad)=>(ent2, B2, C2)=>{ const Y0="#e8a21a";
    B2(1.1, 0.62, 1.9, 0, 0.55, -0.15, Y0); B2(1.12, 0.62, 0.5, 0, 0.78, -1.15, "#3a3a3a"); B2(1.0, 0.08, 1.3, 0, 0.9, 0.15, "#2a2a2a");
    for(const s of [-1, 1]){ C2(0.32, 0.24, s*0.48, 0.32, 0.55, "#1a1a1a", 14, 0, 0, Math.PI/2); C2(0.26, 0.22, s*0.48, 0.26, -0.9, "#1a1a1a", 14, 0, 0, Math.PI/2); }
    for(const [x, z] of [[-0.5, 0.55],[0.5, 0.55],[-0.5, -0.8],[0.5, -0.8]]) B2(0.06, 1.3, 0.06, x, 1.5, z, "#2a2a2a");
    B2(1.08, 0.05, 1.42, 0, 2.15, -0.12, "#2a2a2a");
    B2(0.46, 0.1, 0.46, 0, 0.98, -0.05, "#2a2a2a"); B2(0.46, 0.5, 0.08, 0, 1.25, -0.3, "#2a2a2a");
    C2(0.16, 0.03, 0, 1.45, 0.42, "#1a1a1a", 12, -0.9, 0, 0); C2(0.02, 0.4, 0, 1.25, 0.5, "#2a2a2a", 6, -0.9, 0, 0);
    for(const s of [-1, 1]) B2(0.08, 2.4, 0.12, s*0.36, 1.25, 1.0, "#3a3a3a"); B2(0.8, 0.08, 0.1, 0, 2.4, 1.0, "#3a3a3a");
    B2(0.92, 0.5, 0.06, 0, 0.42, 1.1, "#3a3a3a"); for(const s of [-1, 1]) B2(0.12, 0.05, 1.1, s*0.28, 0.14, 1.68, "#3a3a3a");
    if(withLoad){ B2(1.0, 0.14, 1.2, 0, 0.24, 1.72, "#a8845a"); B2(0.96, 0.8, 1.16, 0, 0.71, 1.72, "#b0864e"); } };
  for(const [x, z, yaw] of [[877.4, -1559.8, Math.PI],[875.0, -1559.8, Math.PI]]){ const m=crowdProp(fork(false)); m.position.set(x, FLS, z); m.rotation.y=yaw; m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m);
    addColOB(x-Math.sin(yaw)*0.2, z-Math.cos(yaw)*0.2, yaw, 0.6, 1.45, FLS-0.3, FLS+2.2); }
  B(0.6, 1.4, 0.4, BX1-WT-0.22, FLS+0.7, -1559.6, "#3a4a5a"); push("lk_tvon", planeGeo(0.2, 0.1, 0), BX1-WT-0.42-0.001, FLS+1.1, -1559.6, -Math.PI/2, "#ffffff");
  // a pallet jack left in the staging
  { const x=846.0, z=-1559.0; for(const s of [-1, 1]) B(0.16, 0.08, 1.15, x+s*0.27, FLS+0.05, z, "#c8281a"); B(0.73, 0.3, 0.3, x, FLS+0.2, z+0.72, "#c8281a");
    tubeE(V3(x, FLS+0.35, z+0.8), V3(x, FLS+1.15, z+1.1), 0.02, "#1a1a1a"); addCol(x-0.36, x+0.36, z-0.6, z+0.9, FLS-0.5, FLS+0.5); }

  /* ---- the trailers at the docks: one shut, one backed in with its doors open, half loaded, its floor at the dock's ---- */
  const TZ0=-1544.7, TZ1=-1528.7, TWo=1.3, TB=FLS-0.25, TT=FLS+2.7;
  const trailerSide=(x, sd)=>sign(10.5, 1.5, (c, W, H)=>{ c.fillStyle="#d6cbb2"; c.fillRect(0, 0, W, H); c.fillStyle=BROWN; c.fillRect(0, H*0.82, W, H*0.18);
      say(c, "EDINBORO PRETZEL CO.", W*0.56, H*0.4, W*0.66, H*0.42, BROWN, "900", "Georgia, serif");
      c.strokeStyle=GOLDEN; c.lineWidth=10; c.beginPath(); c.arc(W*0.12, H*0.36, H*0.2, 0, 7); c.stroke(); c.beginPath(); c.arc(W*0.12, H*0.58, H*0.14, 0, 7); c.stroke(); },
    x+sd*(TWo+0.012), FLS+1.45, (TZ0+TZ1)/2, sd*Math.PI/2, false, 1260);
  const running=(x)=>{ for(const z of [TZ0+2.5, TZ0+3.8]) for(const s of [-1, 1]) C(0.5, 0.3, x+s*1.0, LY+0.5, z, "#1a1a1a", 16, 0, 0, Math.PI/2);
    B(1.0, 0.25, TZ1-TZ0-0.4, x, TB-0.12, (TZ0+TZ1)/2, "#3a3a3a");
    for(const s of [-1, 1]){ B(0.12, TB-0.25-LY, 0.12, x+s*0.85, (TB-0.25+LY)/2, TZ1-3.5, "#3a3a3a"); B(0.3, 0.05, 0.3, x+s*0.85, LY+0.025, TZ1-3.5, "#3a3a3a"); }
    for(const s of [-1, 1]) B(0.12, 0.12, 2.0, x+s*1.2, TB-0.4, TZ0+3.15, "#3a3a3a"); };
  { const x=874; B(2*TWo, TT-TB, TZ1-TZ0, x, (TT+TB)/2, (TZ0+TZ1)/2, "#d6cbb2"); running(x);
    for(const s of [-1, 1]) trailerSide(x, s); for(const s of [-1, 1]) B(0.04, 2.7, 0.04, x+s*0.02, (TT+TB)/2, TZ0-0.02, "#a8acb0");
    addCol(x-TWo, x+TWo, TZ0, TZ1, LY-0.5, TT); }
  { const x=OPEN, iw=TWo-0.06;
    B(2*TWo, 0.25, TZ1-TZ0, x, TB+0.125-0.0, (TZ0+TZ1)/2, "#8a8e90");
    for(const s of [-1, 1]) B(0.06, TT-0.06-FLS, TZ1-TZ0, x+s*(TWo-0.03), (TT-0.06+FLS)/2, (TZ0+TZ1)/2, "#d6cbb2");      // (up to the roof's underside: no face of one in the other's)
    B(2*TWo, 0.06, TZ1-TZ0, x, TT-0.03, (TZ0+TZ1)/2, "#d6cbb2"); B(2*TWo-0.12, TT-FLS-0.06, 0.06, x, (TT+FLS-0.06)/2, TZ1-0.03, "#c8bca2");
    { const g=new T.PlaneGeometry(2*iw, TZ1-TZ0-0.06); push("wood", g, x, FLS+0.002, (TZ0+TZ1)/2, 0, "#8a6a4a", -Math.PI/2, 0); }
    running(x); for(const s of [-1, 1]) trailerSide(x, s);
    // its doors swung back flat against its sides
    for(const s of [-1, 1]) B(0.04, TT-TB-0.1, 1.28, x+s*(TWo+0.05), (TT+TB)/2, TZ0+0.66, "#e8e6e0");
    addFlat(x-iw, x+iw, TZ0, TZ1-0.06, FLS);
    for(const s of [-1, 1]) addCol(x+s*(TWo-0.03)-0.05, x+s*(TWo-0.03)+0.05, TZ0, TZ1, FLS-0.5, TT);
    addCol(x-TWo, x+TWo, TZ1-0.08, TZ1+0.02, FLS-0.5, TT); addCol(x-TWo-0.1, x+TWo+0.1, TZ0, TZ1, LY-0.5, FLS-0.25);
    for(const z of [TZ1-1.0, TZ1-2.3, TZ1-3.6]) for(const dx of [-0.6, 0.6]) load(x+dx, FLS, z, 1.0, 1.16, 1.2+r()*0.3);
    addCol(x-iw, x+iw, TZ1-4.25, TZ1-0.06, FLS-0.5, FLS+1.6);
    // the dock plate over the gap, its lip on the trailer's floor
    B(2.0, 0.03, 1.9, x, FLS+0.0, -1545.35, "#7a7e80"); addFlat(x-1.0, x+1.0, -1546.3, -1544.4, FLS+0.015);
    addZone(x-TWo, x+TWo, TZ0, TZ1, FLS-0.5, TT, "EDINBORO PRETZEL CO. · A TRAILER AT THE DOCK", true); }
  for(const c of DOCKS) if(c!==OPEN) addCol(c-1.5, c+1.5, BZ1-WT, BZ1, FLS-0.5, FLS+3.0);

  /* ---- the silos behind: three, on legs, the flour piped from each into the floor's north wall ---- */
  for(const x of [792, 801, 810]){ const z=-1630, gy=Terrain.groundAt(x, z);
    for(const [dx, dz] of [[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){ B(0.22, 4.4, 0.22, x+dx, gy+2.2, z+dz, "#8a8e90"); addCol(x+dx-0.13, x+dx+0.13, z+dz-0.13, z+dz+0.13, gy-0.5, gy+4.4); }
    for(const [y, w] of [[1.2, 3.2],[3.0, 3.2]]) for(const [dx, dz, ry] of [[0,-1.6,0],[0,1.6,0],[-1.6,0,Math.PI/2],[1.6,0,Math.PI/2]]) B(w, 0.08, 0.06, x+dx, gy+y, z+dz, "#8a8e90", ry);
    ent(new T.CylinderGeometry(2.6, 0.35, 2.2, 24), x, gy+5.3, z, "#d8dcdc");
    C(2.6, 12.0, x, gy+12.4, z, "#e8ecec", 28); ent(new T.CylinderGeometry(0.4, 2.66, 0.9, 28), x, gy+18.85, z, "#c8ccd0");
    for(const y of [8.4, 12.4, 16.4]) C(2.63, 0.06, x, gy+y, z, "#c8ccd0", 28);
    addCol(x-2.6, x+2.6, z-2.6, z+2.6, gy+3.2, gy+19.3);
    // the ladder up its east side and the flour's pipe in
    for(const s of [-1, 1]) B(0.05, 13.0, 0.05, x+2.68, gy+12.5, z+s*0.22, "#8a8e90");
    for(let y=6.2; y<19; y+=0.32) B(0.03, 0.03, 0.44, x+2.68, gy+y, z, "#8a8e90");
    tubeE(V3(x, gy+4.25, z), V3(x, FLS+6.0, z), 0.13, "#c8ccd0"); tubeE(V3(x, FLS+6.0, z), V3(x, FLS+6.0, BZ0-0.02), 0.13, "#c8ccd0"); }
  // the catwalk across their tops
  B(18.0, 0.08, 0.9, 801, Terrain.groundAt(801, -1630)+19.35, -1630, "#8a8e90");

  /* ---- the sign by the road: the pretzel on its legs, ringed with bulbs; the board under it ---- */
  { const sx=745.2, sz=-1522.0, gy=Terrain.groundAt(sx, sz), SC=4.4, cy=gy+8.7, legZ=SC*1.06;
    const g=pretzelGeo(SC, 0.32, 220, 14), m=new T.Mesh(g, new T.MeshStandardMaterial({color:new T.Color("#9a5a24"), roughness:0.45, metalness:0.0}));
    m.position.set(sx, cy, sz); m.rotation.y=Math.PI/2; m.castShadow=true; m.updateMatrix(); m.matrixAutoUpdate=false; m.userData.noCull=true; scene.add(m);
    // (its salt: flakes on the crust)
    { const cv=pretzelCurve(SC), SL=[], up=V3(0, 1, 0);
      for(let k=0;k<220;k++){ const t=r(), p=cv.getPointAt(t), tg=cv.getTangentAt(t), n=new T.Vector3().crossVectors(tg, up).normalize();
        const a=r()*Math.PI*2, d=n.clone().multiplyScalar(Math.cos(a)).add(V3(0, Math.sin(a), 0)).multiplyScalar(0.33);
        const w=V3(p.x+d.x, p.y+d.y, p.z+d.z);
        SL.push({geo:boxGeo(0.07, 0.05, 0.07), matrix:new T.Matrix4().compose(V3(sx+w.z, cy+w.y, sz-w.x), new T.Quaternion().setFromEuler(new T.Euler(r()*3, r()*3, 0)), V3(1,1,1)), color:new T.Color("#f4f2ec")}); }
      const sm=new T.Mesh(mergeEntries(SL), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6})); sm.updateMatrix(); sm.matrixAutoUpdate=false; sm.userData.noCull=true; scene.add(sm);
      // the bulbs, both faces, lit after dark (their colour, not shown and hidden)
      const BL=[]; for(let k=0;k<96;k++){ const p=cv.getPointAt((k+0.5)/96); for(const sd of [-1, 1]) BL.push({geo:new T.SphereGeometry(0.075, 8, 6), matrix:new T.Matrix4().makeTranslation(sx+p.z+sd*0.34, cy+p.y, sz-p.x), color:new T.Color("#ffffff")}); }
      const bm=new T.MeshBasicMaterial({vertexColors:true, color:new T.Color("#6a604c"), toneMapped:false}), bmesh=new T.Mesh(mergeEntries(BL), bm);
      bmesh.updateMatrix(); bmesh.matrixAutoUpdate=false; bmesh.userData.noCull=true; scene.add(bmesh); PRETZ.bulbs=bm; }
    // the legs either side of it, a truss behind (to the east, away from the road), the arms out to it
    for(const s of [-1, 1]){ B(0.36, 13.0, 0.36, sx+0.5, gy+6.5, sz+s*legZ, "#3a3e42"); addCol(sx+0.3, sx+0.7, sz+s*legZ-0.2, sz+s*legZ+0.2, gy-0.5, gy+13);
      B(0.7, 0.1, 0.7, sx+0.5, gy+0.05, sz+s*legZ, "#8a8e90");
      // (the arms from the rope's outer lobes to the leg at the height where each lobe is widest)
      for(const y of [cy+0.4, cy-1.2]){ const a=SC*0.9, b=legZ-0.18; B(0.4, 0.12, b-a+0.04, sx+0.3, y, sz+s*(a+b)/2, "#3a3e42"); } }
    B(0.2, 0.2, 2*legZ, sx+0.5, gy+12.9, sz, "#3a3e42"); B(0.2, 0.2, 2*legZ, sx+0.5, gy+4.75, sz, "#3a3e42");
    for(const s of [-1, 1]) tubeE(V3(sx+0.62, gy+4.8, sz-s*legZ), V3(sx+0.62, gy+12.8, sz+s*legZ), 0.07, "#3a3e42");
    // the board: two faces either side of its plate, the legs beyond its ends
    const bw=7.6, bh=1.7, by=gy+3.55;
    B(0.12, bh+0.08, bw+0.08, sx, by, sz, "#3a3e42"); for(const s of [-1, 1]) B(0.14, 0.12, legZ-bw/2+0.25, sx+0.2, by, sz+s*(bw/2+(legZ-bw/2)/2), "#3a3e42");
    for(const sd of [-1, 1]) sign(bw, bh, (c, W, H)=>{ c.fillStyle=BROWN; c.fillRect(0, 0, W, H); c.strokeStyle=GOLDEN; c.lineWidth=10; c.strokeRect(10, 10, W-20, H-20);
        say(c, "EDINBORO PRETZEL CO.", W/2, H*0.38, W*0.8, H*0.32, CREAM, "900", "Georgia, serif"); say(c, "THE WORKS · FACTORY STORE · TOURS", W/2, H*0.72, W*0.76, H*0.15, GOLDEN, "700", "Georgia, serif"); },
      sx+sd*0.075, by, sz, sd*Math.PI/2, true, 1520); }

  /* ---- the lot's lamps on their poles, lit after dark ---- */
  for(const [x, z, ax] of [[746.6, -1590, 1],[746.6, -1560, 1],[746.6, -1516, 1],[790, -1498.6, 0],[830, -1498.6, 0],[870, -1498.6, 0]]){ const gy=Terrain.groundAt(x, z);
    C(0.08, 8.0, x, gy+4.0, z, "#5a5e60", 10); addCol(x-0.1, x+0.1, z-0.1, z+0.1, gy-0.5, gy+8);
    const hx=x+(ax ? 1.0 : 0), hz=z-(ax ? 0 : 1.0);
    B(ax ? 1.1 : 0.1, 0.08, ax ? 0.1 : 1.1, (x+hx)/2, gy+7.9, (z+hz)/2, "#5a5e60"); RB(0.6, 0.14, 0.4, hx, gy+7.85, hz, "#3a3e42", ax ? 0 : Math.PI/2, 0.03);
    push("rn_glow", planeGeo(0.5, 0.3, 0), hx, gy+7.775, hz, ax ? 0 : Math.PI/2, "#ffffff", Math.PI/2, 0);
    const L={x:hx, y:gy+7.5, z:hz, color:0xffd8a0, intensity:0, dist:20, decay:1.4}; LAMPS.push(L); PRETZ.lamps.push(L); }

  /* ---- along the south wall, past the last line: the break room and its lockers, the time clock, the QA lab behind glass,
     the film and the empty cases, the maintenance cage; the safety board on the break room's wall ---- */
  { const PART="#a49c8a", Z1=BZ1-WT, ZW=-1560.0;
    const wallX=(x0, x1, z, h, gaps)=>{ let p=x0; for(const g of (gaps||[]).concat([[x1, x1]])){ if(g[0]-p>0.02){ B(g[0]-p, h, 0.14, (p+g[0])/2, FLS+h/2, z, PART); addCol(p, g[0], z-0.07, z+0.07, FLS-0.05, FLS+h); } p=g[1]; } };
    const wallZ=(x, z0, z1, h, gaps)=>{ let p=z0; for(const g of (gaps||[]).concat([[z1, z1]])){ if(g[0]-p>0.02){ B(0.14, h+0.002, g[0]-p, x, FLS+(h+0.002)/2, (p+g[0])/2, PART); addCol(x-0.07, x+0.07, p, g[0], FLS-0.05, FLS+h); } p=g[1]; } };
    // the break room: x 780..793, its door on the aisle, a window onto the floor
    wallX(BX0+WT+0.05, 793.0, ZW, 3.0, [[788.6, 789.8]]); wallZ(793.0, ZW+0.07, Z1-0.05, 3.0, [[-1555.4, -1553.0]]);
    push("glass", planeGeo(2.36, 1.2, 0), 793.0, FLS+1.6, -1554.2, Math.PI/2, "#ffffff"); B(0.18, 0.06, 2.42, 793.0, FLS+0.97, -1554.2, "#8a8478"); B(0.18, 0.08, 2.42, 793.0, FLS+2.24, -1554.2, "#8a8478");
    B(0.14, 0.94, 2.4, 793.0, FLS+0.47, -1554.2, PART); B(0.14, 0.72, 2.4, 793.0, FLS+2.645, -1554.2, PART); addCol(792.93, 793.07, -1555.4, -1553.0, FLS-0.05, FLS+0.97);
    // lockers down the west wall, a bench in front of them
    for(let k=0;k<14;k++){ const z=-1559.4+k*0.42; B(0.5, 1.9, 0.4, BX0+WT+0.3, FLS+0.95, z, k%2 ? "#4a6a8a" : "#466686");
      for(let j=0;j<3;j++) B(0.012, 0.012, 0.22, BX0+WT+0.556, FLS+1.55+j*0.04, z, "#2a3a4a"); B(0.02, 0.06, 0.03, BX0+WT+0.56, FLS+1.1, z+0.12, "#b8bcc0"); }
    addCol(BX0+WT+0.05, BX0+WT+0.56, -1559.65, -1553.55, FLS-0.05, FLS+1.9);
    B(0.36, 0.06, 3.4, BX0+WT+1.1, FLS+0.45, -1556.6, "#8a6a44"); for(const z of [-1558, -1555.2]) B(0.3, 0.42, 0.06, BX0+WT+1.1, FLS+0.21, z, "#5a5e62");
    addCol(BX0+WT+0.9, BX0+WT+1.3, -1558.3, -1554.9, FLS-0.05, FLS+0.48); addSeat(BX0+WT+1.1, -1556.6, FLS, -Math.PI/2, "THE BENCH IN THE BREAK ROOM");
    // a table, its chairs facing in; the counter, the microwave and the coffee; the vending machine; the clock
    { const tx=787.6, tz=-1551.6; RB(1.6, 0.04, 0.9, tx, FLS+0.74, tz, "#c8b89a", 0, 0.01); for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.05, 0.72, 0.05, tx+a*0.7, FLS+0.36, tz+b*0.35, "#3a3a3a");
      addCol(tx-0.8, tx+0.8, tz-0.45, tz+0.45, FLS-0.05, FLS+0.76);
      for(const [cx, cz, yaw] of [[tx-0.4, tz-0.85, Math.PI],[tx+0.4, tz-0.85, Math.PI],[tx-0.4, tz+0.85, 0],[tx+0.4, tz+0.85, 0]]){ const fz=-Math.cos(yaw);
        B(0.42, 0.05, 0.42, cx, FLS+0.46, cz, "#2a5a8a"); for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.03, 0.45, 0.03, cx+a*0.18, FLS+0.225, cz+b*0.18, "#3a3a3a");
        B(0.42, 0.4, 0.04, cx, FLS+0.72, cz-fz*0.2, "#2a5a8a"); addSeat(cx, cz, FLS, yaw, "A CHAIR IN THE BREAK ROOM"); } }
    { const z=Z1-0.32; B(4.2, 0.9, 0.6, 786.8, FLS+0.45, z, "#8a6a44"); B(4.24, 0.04, 0.64, 786.8, FLS+0.92, z, "#b8ae98"); addCol(784.7, 788.9, z-0.32, Z1, FLS-0.05, FLS+0.95);
      RB(0.5, 0.3, 0.38, 785.2, FLS+1.09, z, "#d4ccb8", 0, 0.02); B(0.3, 0.2, 0.012, 785.15, FLS+1.09, z-0.196, "#1a1a1a");
      RB(0.24, 0.36, 0.28, 787.4, FLS+1.12, z, "#1a1a1a", 0, 0.03); C(0.06, 0.12, 787.4, FLS+1.0, z-0.04, "#6a4a2a", 10); }
    { const x=791.8, z=Z1-0.45; RB(0.9, 1.85, 0.8, x, FLS+0.925, z, "#2a4a8a", 0, 0.03); push("lk_tvon", planeGeo(0.6, 1.1, 0), x, FLS+1.15, z-0.405, Math.PI, "#ffffff"); addCol(x-0.46, x+0.46, z-0.41, Z1, FLS-0.05, FLS+1.85); }
    { const x=786.0; C(0.17, 0.04, x, FLS+2.4, ZW+0.09, "#2a2a2a", 20, Math.PI/2, 0, 0); C(0.15, 0.01, x, FLS+2.4, ZW+0.113, "#d4ccb8", 20, Math.PI/2, 0, 0); }
    // on the aisle side of the break room's wall: the time clock, its card racks, the safety board
    { const z=ZW-0.08; RB(0.3, 0.4, 0.16, 785.2, FLS+1.35, z-0.04, "#8a8478", 0, 0.02);
      for(const s of [-1, 1]){ B(0.3, 0.9, 0.06, 785.2+s*0.45, FLS+1.35, z-0.01, "#5a5e62"); for(let k=0;k<12;k++) B(0.07, 0.12, 0.01, 785.2+s*0.45+((k%3)-1)*0.09, FLS+1.0+((k/3)|0)*0.21, z-0.045, "#d4ccb8"); }
      sign(1.6, 1.0, (c, W, H)=>{ c.fillStyle="#1a4a2a"; c.fillRect(0, 0, W, H); c.fillStyle="#f2f0e4"; c.fillRect(W*0.06, H*0.08, W*0.88, H*0.84);
          say(c, "THIS PLANT HAS WORKED", W/2, H*0.22, W*0.78, H*0.1, "#1a4a2a", "800", "Arial"); say(c, "214", W/2, H*0.5, W*0.4, H*0.34, "#c8281a", "800", "'Arial Black', Arial");
          say(c, "DAYS WITHOUT A LOST-TIME ACCIDENT", W/2, H*0.8, W*0.78, H*0.08, "#1a4a2a", "700", "Arial"); }, 790.4, FLS+1.75, ZW-0.085, Math.PI, false, 400); }
    // the QA lab: glass to the floor on two sides, its bench along the wall, the microscope and the balance, the sample trays, a stool
    { const x0=803.0, x1=813.0, z0=-1559.0;
      const pane=(cx, cz, w, ry)=>{ push("glass", planeGeo(w-0.04, 2.2, 0), cx, FLS+1.2, cz, ry, "#ffffff"); };
      for(let x=x0; x<x1-0.01; x+=2.0){ if(x>=807 && x<809) continue; pane(x+1.0, z0, 2.0, 0); } for(let z=z0; z<Z1-0.4; z+=2.0) pane(x0, Math.min(z+1.0, (z+Z1)/2), Math.min(2.0, Z1-z), Math.PI/2);
      for(let x=x0; x<=x1+0.01; x+=2.0) B(0.08, 2.4, 0.08, x, FLS+1.2, z0, "#5a5e62"); for(let z=z0+2.0; z<Z1; z+=2.0) B(0.08, 2.4, 0.08, x0, FLS+1.2, z, "#5a5e62");
      B(x1-x0+0.08, 0.1, 0.1, (x0+x1)/2, FLS+2.45, z0, "#5a5e62"); B(0.1, 0.1, Z1-z0, x0, FLS+2.452, (z0+Z1)/2, "#5a5e62");
      addCol(x0, 807.0, z0-0.05, z0+0.05, FLS-0.05, FLS+2.5); addCol(809.0, x1, z0-0.05, z0+0.05, FLS-0.05, FLS+2.5); addCol(x0-0.05, x0+0.05, z0, Z1, FLS-0.05, FLS+2.5);
      wallZ(x1, z0+0.05, Z1-0.05, 2.5);
      sign(1.6, 0.36, (c, W, H)=>{ c.fillStyle="#1a3a6a"; c.fillRect(0, 0, W, H); say(c, "QUALITY ASSURANCE", W/2, H/2, W*0.82, H*0.56, "#f2f0e4", "700", "Arial"); }, 808.0, FLS+2.75, z0-0.06, Math.PI, false, 320);
      const bz=Z1-0.4; B(8.0, 0.05, 0.75, 808.0, FLS+0.9, bz, "#3a3a3e"); B(7.96, 0.86, 0.7, 808.0, FLS+0.44, bz, "#c8c2b4"); addCol(804.0, 812.0, bz-0.38, Z1, FLS-0.05, FLS+0.93);
      { const x=806.0; B(0.22, 0.06, 0.26, x, FLS+0.955, bz, "#2a2a2e"); B(0.05, 0.36, 0.05, x, FLS+1.13, bz+0.09, "#2a2a2e"); C(0.035, 0.22, x, FLS+1.16, bz-0.02, "#2a2a2e", 10, 0.6, 0, 0); C(0.02, 0.1, x, FLS+1.33, bz+0.0, "#1a1a1a", 8); }
      { const x=809.2; RB(0.3, 0.1, 0.32, x, FLS+0.98, bz, "#d4ccb8", 0, 0.02); C(0.06, 0.004, x, FLS+1.033, bz, "#b8bcc0", 14); B(0.14, 0.04, 0.012, x, FLS+0.98, bz-0.166, "#2a3a2a"); }
      for(let k=0;k<4;k++){ const x=804.6+k*0.5; B(0.4, 0.02, 0.3, x, FLS+0.935, bz-0.1, "#b8bcc0"); for(let j=0;j<3;j++) C(0.04, 0.02, x-0.12+j*0.12, FLS+0.955, bz-0.1, "#a8622a", 10); }
      { const x=810.8; RB(0.4, 0.34, 0.36, x, FLS+1.1, bz, "#c4b89c", 0, 0.03); push("lk_tvon", planeGeo(0.3, 0.22, 0), x, FLS+1.12, bz-0.183, Math.PI, "#ffffff"); }
      { const x=808.0, z=bz-0.95; C(0.18, 0.04, x, FLS+0.75, z, "#2a2a2a", 14); C(0.025, 0.72, x, FLS+0.37, z, "#8a8e92", 8); C(0.2, 0.012, x, FLS+0.3, z, "#8a8e92", 12); C(0.22, 0.03, x, FLS+0.015, z, "#3a3a3a", 12);
        addSeat(x, z, FLS, Math.PI, "THE STOOL AT THE QA BENCH", false, 0.34); PRETZ.qa={x:x, z:z}; } }
    // the film for the baggers on its rack, the empty cases folded flat on a pallet
    { for(let k=0;k<3;k++){ for(const dy of [0.45, 1.3]) C(0.28, 0.7, 796.2+k*1.0, FLS+dy, -1550.0, k%2 ? "#c8d8e0" : "#d8c8a8", 16, Math.PI/2, 0, 0); }
      for(const x of [795.5, 799.1]) for(const z of [-1550.45, -1549.55]) B(0.06, 1.8, 0.06, x, FLS+0.9, z, "#2a4a8a"); for(const y of [0.12, 0.98]) for(const z of [-1550.45, -1549.55]) B(3.6, 0.06, 0.045, 797.3, FLS+y, z, "#e8962a");
      addCol(795.4, 799.2, -1550.6, -1549.4, FLS-0.05, FLS+1.8);
      B(1.2, 0.14, 1.0, 800.6, FLS+0.07, -1547.2, "#9a7a4a"); for(let k=0;k<10;k++) B(1.1, 0.012, 0.9, 800.6, FLS+0.15+k*0.014, -1547.2, k%2 ? "#a8845a" : "#9a7a52"); addCol(800.0, 801.2, -1547.7, -1546.7, FLS-0.05, FLS+0.3); }
    // the maintenance cage: chain-link on posts, its gate open; a bench with a vise, the red tool chest, shelves of parts, a motor on a pallet
    { const x0=818.0, x1=832.0, z0=-1561.0, chain=signTex(64, 64, (c, W, H)=>{ c.clearRect(0, 0, W, H); c.strokeStyle="#8a9094"; c.lineWidth=2;
          for(let k=-W;k<W*2;k+=10){ c.beginPath(); c.moveTo(k, 0); c.lineTo(k+H, H); c.stroke(); c.beginPath(); c.moveTo(k+H, 0); c.lineTo(k, H); c.stroke(); } });
      chain.wrapS=chain.wrapT=T.RepeatWrapping; const cm=new T.MeshStandardMaterial({map:chain, transparent:true, alphaTest:0.4, side:T.DoubleSide, roughness:0.6, metalness:0.4});
      const fence=(ax, bx, az, bz)=>{ const L=Math.hypot(bx-ax, bz-az), t=chain.clone(); t.needsUpdate=true; t.repeat.set(L/0.5, 2.4/0.5); const m=new T.Mesh(new T.PlaneGeometry(L, 2.4), cm.clone()); m.material.map=t;
        m.position.set((ax+bx)/2, FLS+1.25, (az+bz)/2); m.rotation.y=Math.atan2(-(bz-az), bx-ax); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m);
        Math.abs(bx-ax)>Math.abs(bz-az) ? addCol(Math.min(ax, bx), Math.max(ax, bx), az-0.04, az+0.04, FLS-0.05, FLS+2.5) : addCol(ax-0.04, ax+0.04, Math.min(az, bz), Math.max(az, bz), FLS-0.05, FLS+2.5); };
      fence(x0, 823.0, z0, z0); fence(824.4, x1, z0, z0); fence(x0, x0, z0, Z1-0.05);
      for(let x=x0; x<=x1+0.01; x+=2.0) if(x<823.05 || x>824.35) C(0.03, 2.5, x, FLS+1.25, z0, "#6a7074", 8); C(0.03, 2.5, 823.0, FLS+1.25, z0, "#6a7074", 8); C(0.03, 2.5, 824.4, FLS+1.25, z0, "#6a7074", 8);
      for(let z=z0+2.0; z<Z1; z+=2.0) C(0.03, 2.5, x0, FLS+1.25, z, "#6a7074", 8); B(x1-x0, 0.05, 0.05, (x0+x1)/2, FLS+2.48, z0, "#6a7074"); B(0.05, 0.05, Z1-z0, x0, FLS+2.482, (z0+Z1)/2, "#6a7074");
      sign(1.6, 0.36, (c, W, H)=>{ c.fillStyle="#c8281a"; c.fillRect(0, 0, W, H); say(c, "MAINTENANCE · AUTHORIZED ONLY", W/2, H/2, W*0.84, H*0.5, "#f2f0e4", "700", "Arial"); }, 820.5, FLS+2.0, z0-0.03, Math.PI, false, 320);
      wallZ(x1, z0+0.05, Z1-0.05, 2.6);
      { const bz=Z1-0.4; B(3.0, 0.06, 0.75, 821.0, FLS+0.9, bz, "#6a5a3a"); B(2.96, 0.84, 0.7, 821.0, FLS+0.45, bz, "#4a5e4a"); addCol(819.5, 822.5, bz-0.38, Z1, FLS-0.05, FLS+0.93);
        B(0.2, 0.12, 0.22, 820.0, FLS+0.99, bz-0.2, "#2a4a8a"); B(0.22, 0.06, 0.04, 820.0, FLS+1.06, bz-0.33, "#5a5e62"); B(2.8, 1.2, 0.04, 821.0, FLS+1.6, Z1-0.03, "#a88a5a");
        for(let k=0;k<12;k++) B(0.04, 0.22, 0.03, 819.8+k*0.2, FLS+1.6+((k%3)-1)*0.25, Z1-0.07, ["#c8281a","#2a2a2a","#2a4a8a"][k%3]); }
      { const x=823.6, z=Z1-0.45; RB(0.95, 1.1, 0.6, x, FLS+0.55, z, "#b82a1e", 0, 0.03); for(let k=0;k<6;k++) B(0.85, 0.012, 0.012, x, FLS+0.2+k*0.16, z-0.306, "#c8ccd0"); RB(0.95, 0.4, 0.6, x, FLS+1.33, z, "#b82a1e", 0, 0.03);
        addCol(x-0.48, x+0.48, z-0.31, Z1, FLS-0.05, FLS+1.55); }
      for(let k=0;k<2;k++){ const x=826.6+k*2.4; for(const y of [0.05, 0.75, 1.45, 2.15]) B(2.0, 0.04, 0.6, x, FLS+y, Z1-0.35, "#2a4a8a"); for(const dx of [-0.98, 0.98]) for(const dz of [-0.6, -0.08]) B(0.05, 2.2, 0.05, x+dx, FLS+1.1, Z1+dz, "#2a4a8a");
        for(let j=0;j<9;j++) RB(0.3, 0.22, 0.3, x-0.75+(j%3)*0.75, FLS+0.18+((j/3)|0)*0.7, Z1-0.35, ["#5a5e62","#8a7a4a","#3a5a3a"][j%3], 0, 0.02); addCol(x-1.02, x+1.02, Z1-0.65, Z1, FLS-0.05, FLS+2.2); }
      { const x=826.0, z=-1557.0; B(1.2, 0.14, 1.0, x, FLS+0.07, z, "#9a7a4a"); C(0.32, 0.6, x, FLS+0.5, z, "#3a5a8a", 16, 0, 0, Math.PI/2); B(0.4, 0.28, 0.5, x+0.45, FLS+0.4, z, "#3a5a8a"); addCol(x-0.62, x+0.62, z-0.52, z+0.52, FLS-0.05, FLS+0.85); } } }
  addZone(780.3, 793, -1560, -1545.3, FLS-0.5, FLS+3.0, "THE PRETZEL WORKS · THE BREAK ROOM", true);
  addZone(803, 813, -1559, -1545.3, FLS-0.5, FLS+2.5, "THE PRETZEL WORKS · QUALITY ASSURANCE", true);

  /* ---- the people: the line hands in white caps, the man going round, the forklift's driver, the woman at the desk ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("pretzel works", 820, -1580, 120);
    // (the QA tech on her stool at the bench, facing it; the maintenance man at his vise)
    if(PRETZ.qa) crowdAdd(G, {look:{h:0.97, skin:SKINS[2], hair:HAIRS[1], shirt:"#e8e4d8", pants:"#2a3a5a", shoes:"#2a2a2a", cap:"#f4f4f2", female:true}, x:PRETZ.qa.x, z:PRETZ.qa.z, y:FLS, yaw:0, mode:"sit", sitY:0.805, sway:0.3});
    crowdAdd(G, {look:{h:1.02, skin:SKINS[0], hair:HAIRS[4], shirt:"#3a4a6a", pants:"#2a2a2a", shoes:"#2a2a2a", cap:"#2a4a8a"}, x:821.0, z:BZ1-WT-1.2, y:FLS, yaw:0, mode:"stand", sway:0.4});
    const hand=(sk, hr, pants)=>({h:1.0, skin:SKINS[sk], hair:HAIRS[hr], shirt:"#ecebe6", pants:pants||"#3b4a66", shoes:"#2a2a2a", cap:"#f4f4f2"});
    for(const [x, z, sk, hr] of [[785.2, -1583.4, 0, 1],[790.4, -1601.0, 2, 3],[806.2, -1564.6, 1, 0],[824.0, -1569.0, 3, 2],[829.4, -1601.2, 0, 4],[812.0, -1583.5, 2, 1]])
      crowdAdd(G, {look:hand(sk, hr), x:x, z:z, y:FLS, yaw:Math.PI, mode:"stand", sway:0.3});
    crowdAdd(G, {look:hand(1, 2, "#2a2a2a"), mode:"walk", path:[[783.5, -1594, FLS],[834.2, -1594, FLS, 4],[834.2, -1576, FLS],[783.5, -1576, FLS, 5]], loop:true, yAt:()=>FLS});
    crowdAdd(G, {look:{h:0.98, skin:SKINS[0], hair:HAIRS[5], shirt:"#7a4220", pants:"#2a2a2a", shoes:"#2a2a2a"}, x:774.4, z:-1572.6, y:FLS, yaw:-Math.PI/2, mode:"stand", sway:0.4});
    crowdAdd(G, {look:{h:1.03, skin:SKINS[2], hair:HAIRS[1], shirt:"#f2c41c", pants:"#3b4a66", shoes:"#2a2a2a"}, x:837.3, z:-1547.6, y:FLS, yaw:Math.PI, mode:"stand", sway:0.4});
    // the forklift going round its loop: down the west cross aisle, along the back, up an aisle and back across the staging;
    // it stops for anybody who walks up to it, and its rig is its own collider
    const rig=addColOB(0, 0, 0, 0.62, 1.75, FLS-0.3, FLS+2.2, COL_DYN);
    const placeRig=(p)=>{ const s=Math.sin(p.yawS), c=Math.cos(p.yawS), cx=p.x+s*0.45, cz=p.z+c*0.45, o=_ob(cx, cz, p.yawS, 0.62, 1.75);
      rig.ob=o; rig.x0=cx-o.ex; rig.x1=cx+o.ex; rig.z0=cz-o.ez; rig.z1=cz+o.ez; };
    const loop=crowdRound([[838.0, -1559.6, FLS],[838.0, -1588.0, FLS, 4],[838.0, -1611.0, FLS],[867.75, -1611.0, FLS],[867.75, -1586.0, FLS, 4],[867.75, -1559.6, FLS]], 2.6, true);
    crowdAdd(G, {look:{h:1.0, skin:SKINS[1], hair:HAIRS[0], shirt:"#f2c41c", pants:"#3b4a66", shoes:"#2a2a2a", cap:"#2a2a2a"}, mode:"sit", job:"drive", sitY:1.03,
      path:loop, loop:true, speed:1.9, prop:crowdProp(fork(true)), yAt:()=>FLS+0.005,
      yield:(p)=>{ const s=Math.sin(p.yawS), c=Math.cos(p.yawS); return Math.hypot(player.pos.x-(p.x+s*0.9), player.pos.z-(p.z+c*0.9))<4.2; },
      onShow:(p, on)=>{ rig.y1=on ? FLS+2.2 : -9999; },
      tick:(p)=>placeRig(p)}); }

  /* ---- the trail out the back to the lake: shredded bark through the woods, a sign at the fence, the clearing on the shore ---- */
  { const TR=EAST.pretz.trail, LK=EAST.pretz.lake;
    for(const p of TR) p.y=Terrain.groundAt(p.x, p.z);
    layRibbon("mulchbed", TR, -0.65, 0.65, 0.045, 0.6, "#c4b4a2");
    // (the sign faces back into the yard; its post behind it)
    { const sx=889.6, sz=-1602.2, g=Terrain.groundAt(sx, sz); B(0.1, 1.5, 0.1, sx+0.12, g+0.75, sz, "#5a4430"); addCol(sx+0.06, sx+0.18, sz-0.06, sz+0.06, g-0.5, g+1.5);
      B(0.04, 0.32, 0.7, sx+0.05, g+1.25, sz, "#6a5238");
      sign(0.64, 0.28, (c, W, H)=>{ c.fillStyle="#7a5e40"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(40,24,10,0.25)"; for(let k=0;k<6;k++) c.fillRect(0, k*H/6+4, W, 2);
          say(c, "TO THE LAKE", W/2, H*0.4, W*0.78, H*0.3, "#f2e8d0", "800", "Georgia, serif"); say(c, "EMPLOYEES' LUNCH SPOT", W/2, H*0.74, W*0.7, H*0.14, "#f2e8d0", "700", "Arial"); },
        sx+0.02, g+1.25, sz, -Math.PI/2, false, 300); }
    // the clearing: a bench looking out over the water, a picnic table, two kayaks turned over on the bank
    { const bx=950.5, bz=-1596.5, g=Terrain.groundAt(bx, bz);
      for(const dz of [-0.75, 0.75]) B(0.4, 0.42, 0.08, bx, g+0.21, bz+dz, "#3a3a3a");
      for(let k=0;k<3;k++) B(0.12, 0.04, 1.8, bx-0.14+k*0.14, g+0.44, bz, "#8a6a4a"); for(let k=0;k<2;k++) B(0.04, 0.11, 1.8, bx+0.21, g+0.62+k*0.14, bz, "#8a6a4a");
      addCol(bx-0.22, bx+0.26, bz-0.9, bz+0.9, g-0.5, g+0.9); for(const dz of [-0.45, 0.45]) addSeat(bx-0.02, bz+dz, g, -Math.PI/2, "A BENCH BY THE LAKE"); }
    { const px=940.0, pz=-1612.0, g=Terrain.groundAt(px, pz);
      B(0.8, 0.05, 1.9, px, g+0.76, pz, "#9a7a52"); for(const s of [-1, 1]){ B(0.26, 0.04, 1.9, px+s*0.62, g+0.45, pz, "#9a7a52");
        for(const dz of [-0.75, 0.75]) B(1.5, 0.06, 0.06, px, g+0.38, pz+dz, "#7a5a3a", 0); }
      for(const dz of [-0.75, 0.75]) for(const s of [-1, 1]) tubeE(V3(px+s*0.72, g, pz+dz), V3(px+s*0.1, g+0.74, pz+dz), 0.03, "#7a5a3a");
      addCol(px-0.76, px+0.76, pz-0.98, pz+0.98, g-0.5, g+0.8); for(const s of [-1, 1]) addSeat(px+s*0.62, pz, g, s<0 ? -Math.PI/2 : Math.PI/2, "THE PICNIC TABLE"); }
    for(const [x, z, col] of [[953.0, -1618.5, "#c8401a"],[954.6, -1617.6, "#2a6ab8"]]){ const g=Terrain.groundAt(x, z);
      ent(new T.SphereGeometry(1, 14, 8, 0, Math.PI*2, 0, Math.PI/2), x, g+0.04, z, col, Math.PI, 0.25, 0); ME[ME.length-1].matrix.multiply(new T.Matrix4().makeScale(0.32, 0.3, 1.6));
      addColOB(x, z, 0.25, 0.35, 1.6, g-0.5, g+0.4); }
    addZone(P.x1, LK.x0, EAST.pretz.woods.z0, EAST.pretz.woods.z1, Y-2, Y+20, "THE TRAIL TO THE LAKE");
    addZone(LK.x0, LK.x1, LK.z0, LK.z1, Y-4, Y+20, "THE LAKE BEHIND THE PRETZEL WORKS"); }

  /* ---- the zones: the works' ground, then the rooms in it ---- */
  addZone(P.x0, P.x1, P.z0, P.z1, Y-2, Y+25, "EDINBORO PRETZEL CO.");
  addZone(LX0, BX0, LZ0, LZ1, FLS-0.5, LC, "EDINBORO PRETZEL CO. · THE LOBBY", true);
  addZone(BX0, DX+WT/2, BZ0, BZ1, FLS-0.5, CEIL, "EDINBORO PRETZEL CO. · THE FLOOR", true);
  addZone(DX+WT/2, BX1, BZ0, BZ1, FLS-0.5, CEIL, "EDINBORO PRETZEL CO. · THE WAREHOUSE", true);
  addZone(OPEN-TWo, OPEN+TWo, TZ0, TZ1, FLS-0.5, TT, "EDINBORO PRETZEL CO. · A TRAILER AT THE DOCK", true);

  /* ---- the walls of the world round the works' clearing, and the woods close in on three sides ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300);
    const WD=EAST.pretz.woods, LK=EAST.pretz.lake;
    W(P.x0, P.x1, P.z0-0.4, P.z0+0.4); W(P.x0, P.x1, P.z1-0.4, P.z1+0.4);
    W(P.x1-0.4, P.x1+0.4, P.z0, WD.z0); W(P.x1-0.4, P.x1+0.4, WD.z1, P.z1);            // (the back fence open onto the trail's woods)
    // the woods the trail goes through, and the clearing on the shore it comes out in
    W(P.x1, LK.x0, WD.z0-0.4, WD.z0+0.4); W(P.x1, LK.x0, WD.z1-0.4, WD.z1+0.4);
    W(LK.x0-0.4, LK.x0+0.4, LK.z0, WD.z0); W(LK.x0-0.4, LK.x0+0.4, WD.z1, LK.z1);
    W(LK.x0, LK.x1, LK.z0-0.4, LK.z0+0.4); W(LK.x0, LK.x1, LK.z1-0.4, LK.z1+0.4);
    // the bank: a step short of the water all along the clearing (where the lake's edge is a metre and a half off)
    const BANK="THE BANK DROPS STRAIGHT INTO THE LAKE HERE";
    const shoreX=(z)=>{ let x=LK.x0; while(x<LK.x1+30 && Terrain.lakeSD(x, z)>1.5) x+=0.25; return x; };
    for(let z=LK.z0; z<LK.z1-0.01; z+=2){ const a=shoreX(z), b=shoreX(Math.min(LK.z1, z+2)); W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, z, Math.min(LK.z1, z+2)).msg=BANK; } }
  if(typeof FOREST!=="undefined"){ const q=_trng(1931);
    const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, gy=Terrain.groundAt(x, z); addCol(x-rr, x+rr, z-rr, z+rr, gy-0.5, gy+6); };
    const row=(x0, z0, x1, z1, nx, nz)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.round(L/6.4);
      for(let k=0;k<=n;k++) for(const [dep, sp] of [[1.8, "edge"],[6.5, null],[11.5, null],[16.5, null],[22.0, null]]){ if(q()<0.15) continue;
        const t=(k+q()*0.6)/Math.max(1, n), x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(sp || (q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard"), x, z, 0.85+q()*0.4); } };
    const WD=EAST.pretz.woods, LK=EAST.pretz.lake, TR=EAST.pretz.trail;
    row(P.x0+6, P.z0, P.x1, P.z0, 0, -1); row(P.x1, P.z0, P.x1, WD.z0-1, 1, 0); row(P.x1, WD.z1+1, P.x1, P.z1, 1, 0); row(P.x0+6, P.z1, P.x1, P.z1, 0, 1);
    // the trail's woods: a jittered lattice of real trees, clear of the path; more beyond its walls; the clearing's edges
    const dry=(x, z)=>Terrain.lakeSD(x, z)>3.5;
    for(let x=WD.x0+2.2; x<WD.x1-1; x+=4.4) for(let z=WD.z0+2; z<WD.z1-1; z+=4.4){ const jx=x+(q()-0.5)*2.4, jz=z+(q()-0.5)*2.4;
      if(distToPath(TR, jx, jz).d<2.3) continue; tree(q()<0.3 ? "hemlock" : q()<0.4 ? "pine" : "hard", jx, jz, 0.8+q()*0.4);
      if(q()<0.4){ const fx=jx+(q()-0.5)*2, fz=jz+(q()-0.5)*2; if(distToPath(TR, fx, fz).d>1.2) FOREST.plant(q()<0.5 ? "fern" : "shrub", fx, fz, {scale:0.8+q()*0.5, solid:false}); } }
    row(P.x1+2, WD.z0, LK.x0, WD.z0, 0, -1); row(P.x1+2, WD.z1, LK.x0, WD.z1, 0, 1);
    for(const [z, nz] of [[LK.z0, -1],[LK.z1, 1]]) for(let x=LK.x0; x<LK.x1+10; x+=6.2) for(const dep of [1.8, 6.5, 11.5, 16.5]){
      const xx=x+(q()-0.5)*2.4, zz=z+nz*(dep+q()*2); if(dry(xx, zz) && q()>0.12) tree(dep<2 ? "edge" : q()<0.3 ? "hemlock" : "hard", xx, zz, 0.85+q()*0.4); } }

  /* ---- what is built: the works, its cartons, the belts that move, the pretzels going down them ---- */
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, metalness:0.08});
  detailMesh(ME, mat, "pretzel-works", true);
  detailMesh(ST, new T.MeshStandardMaterial({vertexColors:true, map:CTEX, roughness:0.85}), "pretzel-works-cartons", true);
  { const bt=signTex(64, 32, (c, W, H)=>{ c.fillStyle="#d8d6cc"; c.fillRect(0, 0, W, H); c.fillStyle="#b8b6ac"; for(let k=0;k<4;k++) c.fillRect(k*16, 0, 3, H);
      c.fillStyle="#c8c6bc"; for(let j=0;j<4;j++) c.fillRect(0, j*8, W, 1); });
    bt.wrapS=T.RepeatWrapping; bt.anisotropy=4;
    const bm=new T.Mesh(mergeEntries(beltG), new T.MeshStandardMaterial({vertexColors:true, map:bt, roughness:0.8}));
    bm.receiveShadow=true; scene.add(bm); PRETZ.belt=bt; }
  // (three kinds on every line: raw dough to the bath, dark and salted from it to the oven, baked brown out of it to the bagger)
  { const pg=pretzelGeo(0.075, 0.012, 20, 3); pg.rotateX(-Math.PI/2); pg.translate(0, 0.013, 0);
    pg.boundingSphere=new T.Sphere(V3(810, FLS+1, -1585), 34);
    const KINDS=[{c:"#eadcc0", a:792.3, b:795.7, rough:0.8},{c:"#4a2810", a:799.3, b:802.7, rough:0.3},{c:"#9a5a22", a:821.3, b:827.7, rough:0.55}];
    PRETZ.kinds=KINDS.map(K=>{ const n=Math.floor((K.b-K.a)/0.24), N=n*3*LINES.length;
      const im=new T.InstancedMesh(pg, new T.MeshStandardMaterial({color:new T.Color(K.c), roughness:K.rough}), N);
      const items=[]; for(const L of LINES) for(let i=0;i<n;i++) for(const dz of [-0.27, 0, 0.27]) items.push({z:L+dz+(r()-0.5)*0.04, ph:i*0.24+(r()-0.5)*0.05, yaw:(r()-0.5)*0.5});
      scene.add(im); return {im:im, items:items, a:K.a, len:K.b-K.a}; });
    PRETZ.t=0; updatePretzelWorks(0, 0); }

  PRETZ.routes={
    "pretzel works: up Hollow Road from Edinboro Beer to the works' mouth":[[733.5, -1320],[733.5, -1420],[733.5, -1500],[733.5, -1544]],
    "pretzel works: in at the mouth, across the lot, up the steps and into the lobby":[[734.0, -1544.0],[742.0, -1544.0],[756.0, -1556.0],[756.0, -1580.0],[763.5, -1580.0],
      [766.5, -1580.0],[769.5, -1580.0],[772.0, -1578.0]],
    "pretzel works: from the lobby onto the floor, along the lines and through to the warehouse":{y0:FLS+0.1, pts:[[771.5, -1576.0],[778.5, -1576.0],[782.0, -1576.0],[800.0, -1576.0],
      [832.5, -1576.0],[836.5, -1576.0],[838.6, -1576.0]]},
    "pretzel works: across the warehouse's staging, into the trailer at the dock":{y0:FLS+0.1, pts:[[838.6, -1560.5],[850.0, -1560.0],[858.0, -1559.0],[858.0, -1548.0],[858.0, -1544.0],[858.0, -1538.0]]},
    "pretzel works: down the warehouse's aisles":{y0:FLS+0.1, pts:[[838.6, -1576.0],[838.6, -1611.0],[856.15, -1611.0],[856.15, -1590.0],[856.15, -1562.0]]},
    "pretzel works: out the back and down the trail to the lake":[[886.0, -1600.0],[892.0, -1600.0],[899.0, -1596.0],[906.0, -1599.0],[913.0, -1605.0],[919.0, -1604.0],
      [925.0, -1600.0],[935.0, -1600.0],[948.0, -1600.0]],
    "pretzel works: round the outside, the court and the silos":[[766.0, -1540.0],[790.0, -1525.0],[884.0, -1525.0],[886.0, -1600.0],[886.0, -1622.0],[820.0, -1640.0],[784.0, -1640.0],[775.0, -1625.0],[760.0, -1600.0]]};
})();
/* the bulbs on the sign and the lamps in the lot come on after dark; the belts run and the pretzels go down them while you are near */
function updatePretzelWorks(dt, dark){
  if(PRETZ.bulbs) PRETZ.bulbs.color.setRGB(0.42+0.58*smoothstep(0.3, 0.6, dark), 0.38+0.54*smoothstep(0.3, 0.6, dark), 0.30+0.30*smoothstep(0.3, 0.6, dark));
  for(const L of PRETZ.lamps) L.intensity=1.1*smoothstep(0.3, 0.6, dark);
  if(!PRETZ.kinds) return;
  const c=camera.position; if(dt>0 && Math.hypot(c.x-812, c.z+1585)>110) return;
  const SPD=0.18; PRETZ.t+=dt;
  if(PRETZ.belt){ PRETZ.belt.offset.x=-((PRETZ.t*SPD/0.5)%1); }
  const m4=new T.Matrix4(), q=new T.Quaternion(), up=V3(0,1,0), one=V3(1,1,1), p=V3(0,0,0);
  for(const K of PRETZ.kinds){ for(let i=0;i<K.items.length;i++){ const it=K.items[i];
      p.set(K.a+((it.ph+PRETZ.t*SPD)%K.len), PRETZ.BH, it.z); q.setFromAxisAngle(up, it.yaw); m4.compose(p, q, one); K.im.setMatrixAt(i, m4); }
    K.im.instanceMatrix.needsUpdate=true; }
}
