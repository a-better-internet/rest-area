"use strict";
/* REST AREA · 14u-coffee.js
   the coffee shop on Lake Street, across from the brewery: the little
   house it is in, its porch and its patio, the room inside, and the
   people in it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14u · THE PERKY LOON
   On the south side of the street at its east end, across from the
   brewery's lot: a little house the size of the others, built the way
   they are (lap siding, a shingled gable, white trim) but painted sea
   green with coral doors and window boxes, a porthole in its gable, and a
   giant coffee cup up on the ridge with steam coming off it. A covered
   porch across the front with two rockers; down a step, a brick patio
   inside a white picket fence, four bistro tables with chairs that do not
   match, and strings of bulbs over it. A chalkboard by the gate, a bike in
   the rack, three spaces of gravel to the east.
   Inside, one room: plaster walls, a pine ceiling, a wood floor. The
   counter across the back (butcher block, sea green front), the pastry
   case lit at its west end, the espresso machine, the grinder, the cups
   and the syrups behind; the menu chalked on the wall over them and a
   loon painted beside it. Two little tables by the west window, a bar
   along the front window with stools, and in the back corner an old
   armchair, a lamp and a shelf of paperbacks. Pendant bulbs; the radio
   on the shelf. The beans for sale on a shelf by the counter, a board of
   notices by the door, three photographs of the lake over the armchair, a
   cake under glass, a pour-over bar and the cold brew behind the counter,
   a fan turning, ferns hanging in the front windows. Nana the barista;
   somebody in the armchair, somebody at the window, somebody choosing a
   bag of beans, people out on the patio.
   The roastery is under the house: round the back, down a concrete stair
   to a coral door. The roaster against the west wall with the cooling tray
   in front of it and the arm going round, the chaff cyclone, the duct out
   to the stack up the back wall; sacks of green coffee from six countries
   on pallets, the roasted coffee bagged at a steel table and shelved, a
   cupping table, the roast log, the furnace and the water heater. The
   ground is a half-metre patch (LOON_RING, 04) holed over it and the
   stair; it is BURIED (06), its lamps under ones.
   ---------------------------------------------------------------------- */
const COFFEE={};
(function perkyLoon(){
  const Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw, gy=(x,z)=>Terrain.groundAt(x,z), r=_trng(7373);
  const CX0=1433.5, CX1=1441.5, CZ0=-1186.5, CZ1=-1179.5, WT=0.2, FF=Y+0.24, EAVE=FF+2.7, RIDGE=FF+4.4, CEIL=FF+2.6, XM=(CX0+CX1)/2;
  const IX0=CX0+WT, IX1=CX1-WT, IZ0=CZ0+WT, IZ1=CZ1-WT;               // (the room's inner faces)
  Object.assign(COFFEE, {x0:CX0, x1:CX1, z0:CZ0, z1:CZ1, FF:FF});
  const SEA="#9fd2bf", CORAL="#e8705e", TRIM="#f6f3ec", CREAM="#f2e6cc";
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03, Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const CT=(r0,r1,h,x,y,z,c,seg)=>ent(new T.CylinderGeometry(r0,r1,h,seg||16),x,y,z,c);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const CHALK="'Comic Sans MS', 'Marker Felt', cursive";
  bucketOf("cafe_bulb", ()=>emitMat(0xffd9a0, 1.0, "indoor", null));
  bucketOf("cafe_string", ()=>emitMat(0xffd9a0, 0.9, "night", null));

  /* ---- the house: lap siding on solid walls, plaster inside, the openings in both ---------------------------------------- */
  const D0=1437.0, D1=1438.0, DH=FF+2.15;                                  // (the door)
  const front=[{a:1434.1, b:1436.5, sill:FF+0.78, head:FF+2.15}, {a:D0, b:D1, sill:FF-0.004, head:DH}, {a:1438.5, b:1440.9, sill:FF+0.78, head:FF+2.15}];
  const west=[{a:-1184.7, b:-1182.7, sill:FF+0.9, head:FF+2.1}], east=[{a:-1185.3, b:-1183.5, sill:FF+0.9, head:FF+2.1}];
  const back=[];                                                            // (the back wall is the counter's: no window)
  runX("lk_lap", CZ0+WT/2, WT, CX0, CX1, FF-0.3, EAVE, front, SEA, 1/1.28);
  runX("lk_lap", CZ1-WT/2, WT, CX0, CX1, FF-0.3, EAVE, back, SEA, 1/1.28);
  runZ("lk_lap", CX0+WT/2, WT, IZ0, IZ1, FF-0.3, EAVE, west, SEA, 1/1.28);
  runZ("lk_lap", CX1-WT/2, WT, IZ0, IZ1, FF-0.3, EAVE, east, SEA, 1/1.28);
  // the room's walls: warm white, the back wall (behind the counter) sea green
  lineX("plaster", IZ0, 1, IX0, IX1, FF, CEIL, front, CREAM, 0.6); lineX("plaster", IZ1, -1, IX0, IX1, FF, CEIL, back, "#7fbfaa", 0.6);
  lineZ("plaster", IX0, 1, IZ0, IZ1, FF, CEIL, west, CREAM, 0.6); lineZ("plaster", IX1, -1, IZ0, IZ1, FF, CEIL, east, CREAM, 0.6);
  // the foundation under it, a coral band at the sill line, the corner boards
  bx("concrete", CX1-CX0+0.1, FF-Y+0.2, CZ1-CZ0+0.1, XM, Y-0.1+(FF-Y)/2-0.006, (CZ0+CZ1)/2, 0.6, 0, "#b8b2a6");
  for(const [x, z] of [[CX0, CZ0],[CX1, CZ0],[CX0, CZ1],[CX1, CZ1]]) B(0.16, EAVE-FF+0.04, 0.16, x, (FF+EAVE)/2, z, TRIM);
  addCol(CX0, CX1, CZ1-WT, CZ1, FF-1, EAVE); addCol(CX0, CX0+WT, CZ0, CZ1, FF-1, EAVE); addCol(CX1-WT, CX1, CZ0, CZ1, FF-1, EAVE);
  addCol(CX0, D0, CZ0, CZ0+WT, FF-1, EAVE); addCol(D1, CX1, CZ0, CZ0+WT, FF-1, EAVE); addCol(D0, D1, CZ0, CZ0+WT, DH, EAVE);
  // the floor, the ceiling, the doorway's threshold
  floorAt("wood", IX0, IX1, IZ0, IZ1, FF+0.004, "#8a5a3a", 0.6); addFlat(IX0, IX1, IZ0, IZ1, FF);
  addFlat(D0, D1, CZ0-0.02, IZ0+0.02, FF); ceilAt("brw_pine", IX0, IX1, IZ0, IZ1, CEIL, "#ffffff", 0.5);
  addZone(CX0, CX1, CZ0, CZ1, FF-0.5, CEIL, "THE PERKY LOON", true);
  // the glass, white sash and casings round each window, a coral box of flowers under the two in front
  const pane=(ax, c, o)=>{ const w=o.b-o.a, h=o.head-o.sill, mid=(o.a+o.b)/2, y=(o.sill+o.head)/2;
    if(ax==="x"){ push("glass", planeGeo(w-0.02, h-0.02, 0), mid, y, c, 0, "#ffffff");
      for(const u of [o.a+0.035, o.b-0.035]) B(0.06, h-0.01, 0.08, u, y, c, TRIM); B(w-0.01, 0.06, 0.08, mid, o.sill+0.035, c, TRIM); B(w-0.01, 0.06, 0.08, mid, o.head-0.035, c, TRIM); B(0.04, h-0.1, 0.06, mid, y, c, TRIM);       // (5 mm in from the opening's faces)
      for(const sd of [-1,1]){ const f=c+sd*(WT/2+0.009); B(w+0.2, 0.1, 0.024, mid, o.head+0.045, f, TRIM); B(0.1, h+0.1, 0.024, o.a-0.045, y, f, TRIM); B(0.1, h+0.1, 0.024, o.b+0.045, y, f, TRIM); B(w+0.16, 0.05, 0.05, mid, o.sill-0.02, f+sd*0.015, TRIM); } }       // (the casings 3 mm into the wall and 5 mm into the opening, so none lies in the reveal's planes)
    else { push("glass", planeGeo(w-0.02, h-0.02, 0), c, y, mid, Math.PI/2, "#ffffff");
      for(const u of [o.a+0.035, o.b-0.035]) B(0.08, h-0.01, 0.06, c, y, u, TRIM); B(0.08, 0.06, w-0.01, c, o.sill+0.035, mid, TRIM); B(0.08, 0.06, w-0.01, c, o.head-0.035, mid, TRIM); B(0.06, h-0.1, 0.04, c, y, mid, TRIM);
      for(const sd of [-1,1]){ const f=c+sd*(WT/2+0.009); B(0.024, 0.1, w+0.2, f, o.head+0.045, mid, TRIM); B(0.024, h+0.1, 0.1, f, y, o.a-0.045, TRIM); B(0.024, h+0.1, 0.1, f, y, o.b+0.045, TRIM); B(0.05, 0.05, w+0.16, f+sd*0.015, o.sill-0.02, mid, TRIM); } } };
  for(const o of front) if(o!==front[1]) pane("x", CZ0+WT/2, o);
  pane("z", CX0+WT/2, west[0]); pane("z", CX1-WT/2, east[0]);
  for(const o of [front[0], front[2]]){ const mid=(o.a+o.b)/2, z=CZ0-0.2;
    B(o.b-o.a, 0.22, 0.24, mid, o.sill-0.24, z, CORAL); for(const sd of [-1,1]) B(0.04, 0.16, 0.04, mid+sd*(o.b-o.a)*0.35, o.sill-0.38, z+0.08, TRIM);
    for(let k=0;k<16;k++){ const x=o.a+0.12+k*(o.b-o.a-0.24)/15; ent(new T.DodecahedronGeometry(0.06, 0), x, o.sill-0.10+(k%3)*0.02, z+(k%2-0.5)*0.08, "#3a7a2a", k, k*2);
      if(k%2) ent(new T.SphereGeometry(0.035, 6, 5), x+0.03, o.sill-0.04, z-0.04, ["#f4c430","#e8483a","#f4f2ec","#c86ab8"][k%4]); } }
  // the door: coral, a narrow light in it, a white frame
  makeDoor(XF(D0+0.04, CZ0+WT/2, 0), 0, FF+0.006, 0, "THE PERKY LOON", true, 0, "vision", 0xd8604e);
  for(const sd of [-1,1]){ const f=CZ0+WT/2+sd*(WT/2+0.009); B(0.1, DH-FF+0.05, 0.024, D0-0.045, (FF+DH)/2+0.025, f, TRIM); B(0.1, DH-FF+0.05, 0.024, D1+0.045, (FF+DH)/2+0.025, f, TRIM); B(1.2, 0.1, 0.024, (D0+D1)/2, DH+0.045, f, TRIM); }

  /* ---- the roof: a shingled gable, its ends on the street and the back; the porthole; the cup on the ridge ---------------- */
  { const ov=0.45, xa=CX0-ov, xb=CX1+ov, za=CZ0-0.35, zb=CZ1+0.35, k=(RIDGE-EAVE)/((CX1-CX0)/2), ye=EAVE-ov*k;
    push("shingle", new FaceGeo().slab([V3(xa, ye, za), V3(xa, ye, zb), V3(XM, RIDGE, zb), V3(XM, RIDGE, za)], 0.14, 0.5).geo(), 0,0,0, 0, "#4e5256");
    push("shingle", new FaceGeo().slab([V3(xb, ye, zb+0.005), V3(xb, ye, za-0.005), V3(XM, RIDGE-0.004, za-0.005), V3(XM, RIDGE-0.004, zb+0.005)], 0.14, 0.5).geo(), 0,0,0, 0, "#4e5256");
    B(0.12, 0.10, zb-za+0.02, XM, RIDGE+0.02, (za+zb)/2, "#3e4246");
    for(const [z, fwd] of [[CZ0+0.004, true],[CZ1-0.004, false]]){                 // (4 mm inside the walls' outer faces, as 14r's)
      const pts=fwd ? [V3(CX1, EAVE-0.006, z), V3(CX0, EAVE-0.006, z), V3(XM, RIDGE-0.14, z)] : [V3(CX0, EAVE-0.006, z), V3(CX1, EAVE-0.006, z), V3(XM, RIDGE-0.14, z)];
      push("lk_lap", new FaceGeo().slab(pts, WT, 1/1.28).geo(), 0,0,0, 0, SEA); }
    // white bargeboards along the gables' edges
    for(const z of [za+0.03, zb-0.03]) for(const sd of [-1,1]){ const xo=sd<0 ? xa : xb, L=Math.hypot(XM-xo, RIDGE-ye);
      B(L, 0.16, 0.04, (xo+XM)/2, (ye+RIDGE)/2-0.1, z, TRIM, 0, 0, sd<0 ? Math.atan2(RIDGE-ye, XM-xo) : -Math.atan2(RIDGE-ye, xo-XM)); }
    addRoof(xa, xb, za, zb, EAVE-0.2);
    // the porthole in the front gable (on its face; the attic's behind it), a brass ring round dark glass
    { const py=EAVE+0.95, z=CZ0-0.012; ent(new T.CylinderGeometry(0.30, 0.30, 0.02, 28), XM, py, z, "#2a3a44", Math.PI/2);
      ent(new T.TorusGeometry(0.31, 0.045, 10, 32), XM, py, z-0.02, "#c8a050"); for(let k=0;k<8;k++){ const a=k*Math.PI/4; ent(new T.SphereGeometry(0.018, 6, 5), XM+Math.cos(a)*0.31, py+Math.sin(a)*0.31, z-0.06, "#a88038"); } }
    // the name on a board over the porch, the loon on it with her cup
    { const sy=EAVE+0.28, z=CZ0-0.025;
      B(2.9, 0.50, 0.04, XM, sy, z, "#2a4a44");
      sign(2.8, 0.44, (c,W,H)=>{ c.fillStyle="#f6efdc"; c.fillRect(0,0,W,H); c.strokeStyle=CORAL; c.lineWidth=8; c.strokeRect(10,10,W-20,H-20);
          // the loon, swimming, a cup on her back
          const lx=W*0.14, ly=H*0.58, s=H*0.30;
          c.fillStyle="#1d1f22"; c.beginPath(); c.ellipse(lx, ly, s*1.05, s*0.42, 0, 0, Math.PI*2); c.fill();
          c.beginPath(); c.ellipse(lx+s*0.95, ly-s*0.55, s*0.30, s*0.26, 0, 0, Math.PI*2); c.fill(); c.fillRect(lx+s*0.75, ly-s*0.55, s*0.22, s*0.5);
          c.fillStyle="#f6efdc"; for(let k=0;k<9;k++) c.fillRect(lx-s*0.6+k*s*0.13, ly-s*0.12+(k%2)*s*0.12, s*0.06, s*0.06);
          c.fillRect(lx+s*0.74, ly-s*0.30, s*0.25, s*0.05);
          c.fillStyle="#d8261c"; c.beginPath(); c.arc(lx+s*1.02, ly-s*0.6, s*0.06, 0, Math.PI*2); c.fill();
          c.fillStyle="#3a3a3c"; c.beginPath(); c.moveTo(lx+s*1.2, ly-s*0.58); c.lineTo(lx+s*1.6, ly-s*0.5); c.lineTo(lx+s*1.2, ly-s*0.45); c.fill();
          c.fillStyle="#f6efdc"; c.strokeStyle=CORAL; c.lineWidth=4; c.fillRect(lx-s*0.45, ly-s*0.95, s*0.5, s*0.45); c.strokeRect(lx-s*0.45, ly-s*0.95, s*0.5, s*0.45);
          c.beginPath(); c.arc(lx+s*0.08, ly-s*0.73, s*0.12, -1.2, 1.2); c.stroke();
          c.strokeStyle="#7a8a90"; c.lineWidth=3; for(const dx of [-0.32,-0.12]){ c.beginPath(); c.moveTo(lx+s*dx, ly-s*1.02); c.quadraticCurveTo(lx+s*(dx+0.1), ly-s*1.2, lx+s*dx, ly-s*1.35); c.stroke(); }
          c.strokeStyle="#5aa8c8"; c.lineWidth=3; c.beginPath(); c.moveTo(lx-s*1.2, ly+s*0.5); for(let x=0;x<=s*2.5;x+=6) c.lineTo(lx-s*1.2+x, ly+s*0.5+Math.sin(x/9)*3); c.stroke();
          say(c, "The Perky Loon", W*0.6, H*0.42, W*0.6, H*0.40, "#2a4a44", "900", "Georgia, 'Times New Roman', serif");
          say(c, "COFFEE · PASTRY · GOOD COMPANY", W*0.6, H*0.74, W*0.58, H*0.13, CORAL, "800", "Arial"); }, XM, sy, z-0.032, Math.PI, false, 1120); }        // (1.2 cm proud of its board)
    // the cup on the ridge, toward the street: a saddle over the ridge, the saucer, the cup with a coral band, the handle,
    // the coffee in it; steam off it (updateCoffee)
    { const cz=CZ0+1.0, base=RIDGE+0.06;
      for(const sd of [-1,1]) B(0.9, 0.12, 0.95, XM+sd*0.36, base-0.16, cz, "#3e4246", 0, 0, sd*-Math.atan(k));
      C(0.85, 0.07, XM, base+0.025, cz, TRIM, 32); CT(0.6, 0.45, 1.0, XM, base+0.56, cz, TRIM, 32); CT(0.578, 0.548, 0.2, XM, base+0.76, cz, CORAL, 32);
      C(0.56, 0.02, XM, base+1.05, cz, "#5a3216", 28); ent(new T.TorusGeometry(0.24, 0.07, 10, 20), XM+0.6, base+0.58, cz, TRIM);
      COFFEE.steam={x:XM, y:base+1.1, z:cz}; } }

  /* ---- the porch: boards, posts, a shed roof, two rockers; down a step to the patio --------------------------------------- */
  const PZ=CZ0-1.9;
  bx("lk_deck", CX1-CX0+0.2, 0.06, CZ0-PZ-0.02, XM, FF-0.03, (PZ+CZ0-0.02)/2, 0.7, 0, "#a89a86");      // (2 cm short of the wall: the bake grows it)
  B(CX1-CX0+0.24, FF-Y+0.04, 0.06, XM, (FF+Y)/2-0.03, PZ+0.03, "#e8e4d8");
  addFlat(CX0-0.1, CX1+0.1, PZ, CZ0+0.02, FF);
  B(2.2, 0.12, 0.42, (D0+D1)/2, Y+0.06, PZ-0.21, "#d8d2c4"); addFlat((D0+D1)/2-1.1, (D0+D1)/2+1.1, PZ-0.42, PZ, Y+0.12);
  for(const x of [CX0+0.08, CX1-0.08, D0-0.5, D1+0.5]){ B(0.12, 2.36, 0.12, x, FF+1.18, PZ+0.1, TRIM); addCol(x-0.07, x+0.07, PZ+0.03, PZ+0.17, FF-0.5, FF+2.36); }
  push("shingle", new FaceGeo().slab([V3(CX0-0.2, FF+2.38, PZ-0.25), V3(CX1+0.2, FF+2.38, PZ-0.25), V3(CX1+0.2, FF+2.62, CZ0-0.01), V3(CX0-0.2, FF+2.62, CZ0-0.01)], 0.08, 0.5).geo(), 0,0,0, 0, "#4e5256");
  B(CX1-CX0+0.41, 0.14, 0.05, XM, FF+2.25, PZ-0.25, TRIM); addRoof(CX0-0.2, CX1+0.2, PZ-0.25, CZ0, FF+2.3);
  // a porch light either side of the door, and bulbs in a string along the porch roof's edge and out over the patio
  for(const x of [D0-0.25, D1+0.25]){ B(0.12, 0.2, 0.05, x, FF+1.8, CZ0-0.02, "#1d1d1e"); push("lk_porch", new T.SphereGeometry(0.05, 10, 8), x, FF+1.76, CZ0-0.1, 0, "#ffffff"); }
  LAMPS.push({x:XM, y:FF+2.1, z:PZ+0.5, color:0xffd8a8, intensity:0.45, dist:7, decay:1.6, mothy:true});
  // the rockers, at either end of the porch, looking out at the street
  const rocker=(x, z, ry, col)=>{ const f=XF(x, z, ry), q=(w,h,d,lx,ly,lz,c,rx)=>ent(boxGeo(w,h,d), f.x(lx,lz), FF+ly, f.z(lx,lz), c, rx||0, ry, 0);
    for(const sd of [-1,1]){ q(0.035, 0.04, 0.84, sd*0.25, 0.035, 0.0, col); q(0.035, 0.04, 0.18, sd*0.25, 0.06, 0.45, col, 0.35); q(0.035, 0.04, 0.18, sd*0.25, 0.06, -0.45, col, -0.35);
      q(0.04, 0.42, 0.04, sd*0.25, 0.25, 0.18, col); q(0.04, 0.95, 0.04, sd*0.25, 0.5, -0.22, col, -0.12); q(0.05, 0.03, 0.5, sd*0.27, 0.62, 0.0, col); }
    for(let k=0;k<4;k++) q(0.5, 0.025, 0.09, 0, 0.45, -0.17+k*0.11, col);
    for(let k=0;k<5;k++) q(0.06, 0.55, 0.02, -0.18+k*0.09, 0.78, -0.25, col, -0.12);
    addCol(x-0.35, x+0.35, z-0.35, z+0.35, FF-0.5, FF+0.5); addSeat(x, z, FF, ry+Math.PI, "A ROCKER ON THE PORCH"); };
  rocker(CX0+1.0, PZ+0.85, Math.PI, "#f6f3ec"); rocker(CX1-1.0, PZ+0.85, Math.PI, "#f6f3ec");

  /* ---- the patio: brick, a white picket fence round it, four bistro tables, a sign, the bike ------------------------------ */
  const PX0=CX0-1.7, PX1=CX1+2.3, PZ0=-1193.2, GA=D0-0.4, GB=D1+0.4;      // (its front fence; the gate in it, in line with the step)
  bucketOf("cafe_brick", ()=>{ const t=signTex(128, 128, (c,W,H)=>{ const q=_trng(818); c.fillStyle="#8a7a6a"; c.fillRect(0,0,W,H);
      for(let j=0;j<8;j++) for(let i=-1;i<5;i++){ const x=i*32+(j%2)*16+1, y=j*16+1, l=0.8+q()*0.3; c.fillStyle="rgb("+((170*l)|0)+","+((96*l)|0)+","+((72*l)|0)+")"; c.fillRect(x, y, 30, 14); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial(Object.assign({map:t, roughness:0.9}, _po(-3))); });
  { const w=PX1-PX0, d=PZ-PZ0, g=new T.PlaneGeometry(w, d), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w*0.6, U.getY(i)*d*0.6);
    push("cafe_brick", g, (PX0+PX1)/2, Y+0.04, (PZ0+PZ)/2, 0, "#ffffff", -Math.PI/2, 0); addPaveRect(PX0, PX1, PZ0, PZ, Y); }
  // the pickets: posts with caps, two rails, a picket every eleven centimetres, a third of a metre clear of the brick's edge
  const picket=(ax, az, bx, bz)=>{ const L=Math.hypot(bx-ax, bz-az), along=Math.abs(bx-ax)>0.01, n=Math.max(1, Math.round(L/1.8));
    for(let k=0;k<=n;k++){ const t=k/n, x=ax+(bx-ax)*t, z=az+(bz-az)*t; B(0.09, 1.0, 0.09, x, Y+0.48, z, TRIM); B(0.12, 0.03, 0.12, x, Y+1.0, z, TRIM); }
    for(const y of [0.25, 0.7]) B(along ? L : 0.05, 0.06, along ? 0.05 : L, (ax+bx)/2, Y+y, (az+bz)/2, TRIM);
    const m=Math.floor(L/0.11); for(let k=1;k<m;k++){ const t=k/m, x=ax+(bx-ax)*t, z=az+(bz-az)*t;
      B(along ? 0.07 : 0.022, 0.82, along ? 0.022 : 0.07, x, Y+0.43, z+(along ? 0.04 : 0), TRIM); ent(new T.ConeGeometry(0.05, 0.08, 4), x, Y+0.88, z+(along ? 0.04 : 0), TRIM, 0, Math.PI/4); }
    addCol(Math.min(ax,bx)-0.06, Math.max(ax,bx)+0.06, Math.min(az,bz)-0.06, Math.max(az,bz)+0.06, Y-0.5, Y+1.0); };
  picket(PX0, PZ0, GA, PZ0); picket(GB, PZ0, PX1, PZ0); picket(PX0, PZ0, PX0, CZ0+0.6); picket(PX1, PZ0, PX1, CZ0+0.6);
  // the bistro tables, round and black, two chairs at each that do not match
  COFFEE.patio=[];
  const bistroChair=(x, z, ry, col)=>{ const f=XF(x, z, ry), y=gy(x,z);
    C(0.2, 0.03, x, Y+0.46, z, col, 16); for(const [lx, lz] of [[-0.14,-0.14],[0.14,-0.14],[-0.14,0.14],[0.14,0.14]]) tubeE(V3(f.x(lx*1.15,lz*1.15), Y+0.012, f.z(lx*1.15,lz*1.15)), V3(f.x(lx*0.8,lz*0.8), Y+0.45, f.z(lx*0.8,lz*0.8)), 0.012, col, 5);
    ent(new T.TorusGeometry(0.17, 0.016, 6, 14, Math.PI), f.x(0, -0.17), Y+0.62, f.z(0, -0.17), col, 0, ry, 0);
    for(const sd of [-1,1]) tubeE(V3(f.x(sd*0.17, -0.17), Y+0.47, f.z(sd*0.17, -0.17)), V3(f.x(sd*0.17, -0.17), Y+0.62, f.z(sd*0.17, -0.17)), 0.012, col, 5); };
  for(const [tx, tz] of [[PX0+1.6, -1190.0],[PX0+2.6, -1192.0],[PX1-2.2, -1190.0],[PX1-1.3, -1192.0]]){
    C(0.32, 0.03, tx, Y+0.735, tz, "#1d1d1e", 20); C(0.025, 0.7, tx, Y+0.38, tz, "#2a2a2c", 8); C(0.2, 0.02, tx, Y+0.05, tz, "#2a2a2c", 16);
    addCol(tx-0.32, tx+0.32, tz-0.32, tz+0.32, Y-0.5, Y+0.75);
    const cols=[["#e8705e","#9fd2bf"],["#f4c430","#7ab8e0"],["#9fd2bf","#f6f3ec"],["#7ab8e0","#e8705e"]][COFFEE.patio.length];
    const seats=[[tx-0.56, tz, Math.PI/2],[tx+0.56, tz, -Math.PI/2]];
    seats.forEach(([sx, sz, ry], k)=>bistroChair(sx, sz, ry, cols[k]));
    // a cup and saucer, a little vase of flowers
    C(0.05, 0.008, tx+0.1, Y+0.758, tz+0.08, TRIM, 14); CT(0.035, 0.028, 0.07, tx+0.1, Y+0.799, tz+0.08, TRIM, 12);
    CT(0.025, 0.035, 0.1, tx-0.08, Y+0.806, tz-0.06, "#7ab8e0", 10); ent(new T.SphereGeometry(0.03, 6, 5), tx-0.08, Y+0.874, tz-0.06, CORAL);
    COFFEE.patio.push({x:tx, z:tz, seats:seats}); }
  // strings of bulbs from the porch roof's edge out to two poles at the patio's front corners, and across
  { const poles=[[PX0+0.2, PZ0+0.25],[PX1-0.2, PZ0+0.25]], H=2.9, BM=[], bulb=new T.SphereGeometry(0.04, 8, 6);
    for(const [x, z] of poles){ B(0.09, H, 0.09, x, Y+H/2, z, "#2a2a2c"); addCol(x-0.06, x+0.06, z-0.06, z+0.06, Y-0.5, Y+H); }
    const str=(a, b)=>{ const L=Math.hypot(b[0]-a[0], b[2]-a[2]), n=Math.max(2, Math.round(L/0.6)), sag=Math.min(0.5, L*0.06); let prev=null;
      for(let k=0;k<=n;k++){ const t=k/n, x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t-sag*4*t*(1-t), z=a[2]+(b[2]-a[2])*t, p=V3(x,y,z);
        if(prev) tubeE(prev, p, 0.004, "#1a1a1a", 3); if(k>0 && k<n) BM.push({geo:bulb, matrix:new T.Matrix4().makeTranslation(x, y-0.06, z), color:new T.Color("#ffffff")}); prev=p; } };
    const eL=[CX0, FF+2.3, PZ-0.25], eR=[CX1, FF+2.3, PZ-0.25], pL=[poles[0][0], Y+H-0.05, poles[0][1]], pR=[poles[1][0], Y+H-0.05, poles[1][1]];
    str(eL, pL); str(eR, pR); str(pL, pR); str(eL, pR); str(eR, pL);
    const m=new T.Mesh(mergeEntries(BM), new T.MeshBasicMaterial({color:0xffd9a0, toneMapped:false})); scene.add(m); COFFEE.bulbs=m.material;
    LAMPS.push({x:XM, y:Y+2.4, z:(PZ0+PZ)/2, color:0xffd8a8, intensity:0.5, dist:9, decay:1.5, mothy:true}); }
  // the chalkboard by the gate, a loon doodled on it
  { const sx=GA-0.6, sz=PZ0+0.55;
    for(const sd of [-1,1]) ent(boxGeo(0.6, 0.9, 0.03), sx, Y+0.43, sz+sd*0.12, "#3a2a1c", -sd*0.13);
    for(const [sd, lines] of [[-1, ["TODAY","LOON LATTE","(MAPLE + OAT)","BLUEBERRY","SCONES"]], [1, ["COLD BREW","IS COLD","THE WIFI","IS FREE","THE LOON IS JUDGING YOU"]]])
      sign(0.52, 0.78, (c,W,H)=>{ c.fillStyle="#1e2420"; c.fillRect(0,0,W,H);
          lines.forEach((s,k)=>say(c, s, W/2, H*(0.12+k*0.13), W*0.78, H*(k ? 0.07 : 0.09), k ? "#f2efe6" : "#f4c430", "700", CHALK));
          c.fillStyle="#f2efe6"; c.beginPath(); c.ellipse(W*0.45, H*0.86, W*0.16, H*0.04, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(W*0.63, H*0.81, W*0.05, 0, Math.PI*2); c.fill(); },
        sx, Y+0.45, sz+sd*0.142, sd>0 ? 0 : Math.PI, false, 220).rotation.x=-0.13;
    addCol(sx-0.33, sx+0.33, sz-0.3, sz+0.3, Y-0.5, Y+0.95); }
  // the bike rack west of the patio, a blue cruiser in it with a basket on the front
  { const rx=PX0-0.9, rz=PZ0+1.8;
    for(let k=0;k<3;k++){ const z=rz-0.6+k*0.6; tubeE(V3(rx-0.35, Y, z), V3(rx-0.35, Y+0.7, z), 0.02, "#8a8d90", 6); tubeE(V3(rx+0.35, Y, z), V3(rx+0.35, Y+0.7, z), 0.02, "#8a8d90", 6);
      ent(new T.TorusGeometry(0.35, 0.02, 6, 14, Math.PI), rx, Y+0.7, z, "#8a8d90", 0, 0, 0); }
    addCol(rx-0.4, rx+0.4, rz-0.7, rz+0.7, Y-0.5, Y+1.05);
    const bz=rz+0.3, BL="#3a7ab8", wh=(x)=>{ ent(new T.TorusGeometry(0.33, 0.025, 8, 24), x, Y+0.34, bz, "#1d1d1e", 0, 0, 0); ent(new T.TorusGeometry(0.31, 0.006, 4, 24), x, Y+0.34, bz, "#c8ccd0"); C(0.03, 0.06, x, Y+0.34, bz, "#c8ccd0", 8, Math.PI/2); };
    wh(rx-0.55); wh(rx+0.55);
    tubeE(V3(rx-0.55, Y+0.34, bz), V3(rx-0.05, Y+0.36, bz), 0.02, BL); tubeE(V3(rx-0.05, Y+0.36, bz), V3(rx-0.12, Y+0.8, bz), 0.02, BL); tubeE(V3(rx-0.12, Y+0.8, bz), V3(rx+0.42, Y+0.76, bz), 0.02, BL);
    tubeE(V3(rx-0.05, Y+0.36, bz), V3(rx+0.45, Y+0.74, bz), 0.02, BL); tubeE(V3(rx+0.55, Y+0.34, bz), V3(rx+0.45, Y+0.9, bz), 0.02, BL);
    tubeE(V3(rx-0.55, Y+0.34, bz), V3(rx-0.12, Y+0.8, bz), 0.015, BL); RB(0.24, 0.06, 0.12, rx-0.14, Y+0.86, bz, "#6b4a2b", 0, 0.02);
    tubeE(V3(rx+0.45, Y+0.95, bz-0.28), V3(rx+0.45, Y+0.95, bz+0.28), 0.014, "#c8ccd0"); RB(0.30, 0.22, 0.34, rx+0.68, Y+0.92, bz, "#c8a878", 0, 0.03); }

  /* ---- the gravel lot to the east: three spaces, nose in ---------------------------------------------------------------- */
  { const LX0=PX1+1.2, LX1=1462.5, LZ0=Z+HW+0.05, LZ1=-1180.5, w=LX1-LX0, d=LZ1-LZ0, g=new T.PlaneGeometry(w, d), U=g.attributes.uv;
    for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w*0.5, U.getY(i)*d*0.5);
    push("gravelbed", g, (LX0+LX1)/2, Y+0.03, (LZ0+LZ1)/2, 0, "#c8beae", -Math.PI/2, 0); addPaveRect(LX0, LX1, LZ0, LZ1, Y);
    EAST.noPole.push([LX0-1.5, LX1+1.5]);
    for(let k=0;k<3;k++) B(1.6, 0.10, 0.15, LX0+1.0+(k+0.5)*(w-2.0)/3, Y+0.05, LZ1-0.6, "#a8a49a");
    [[0, "#9fd2bf"],[2, "#c8b890"]].forEach(([k, paint], i)=>parkCar(LX0+1.0+(k+0.5)*(w-2.0)/3, LZ1-2.9, 0, i ? 3 : 1, paint, Y+0.03));
    { const sx=LX1-0.4, sz=LZ0+1.0; B(0.07, 1.6, 0.07, sx, Y+0.8, sz, "#5a5e60"); addCol(sx-0.05, sx+0.05, sz-0.05, sz+0.05, Y-0.5, Y+1.6);
      B(0.5, 0.36, 0.03, sx, Y+1.4, sz-0.05, TRIM);
      sign(0.46, 0.32, (c,W,H)=>{ c.fillStyle="#f6f3ec"; c.fillRect(0,0,W,H); c.fillStyle="#2a4a44"; c.fillRect(0,0,W,H*0.3);
          say(c, "PERKY LOON", W/2, H*0.15, W*0.78, H*0.17, "#f6f3ec", "800", "Arial"); say(c, "PARKING", W/2, H*0.48, W*0.78, H*0.2, "#2a4a44", "900", "Arial");
          say(c, "LOONS ONLY", W/2, H*0.76, W*0.7, H*0.14, CORAL, "800", "Arial"); }, sx, Y+1.4, sz-0.077, Math.PI, false, 200); } }

  /* ---- inside ---------------------------------------------------------------------------------------------------------- */
  // the counter across the back: butcher block on a sea green front, a coral kick; the pastry case lit at its west end
  const KZ0=-1182.1, KZ1=-1181.45, KX0=1436.0;
  B(IX1-KX0+0.01, 0.98, KZ1-KZ0, (KX0+IX1)/2+0.005, FF+0.49, (KZ0+KZ1)/2, "#7fbfaa"); B(IX1-KX0+0.02, 0.1, 0.02, (KX0+IX1)/2+0.005, FF+0.05, KZ0-0.005, CORAL);
  B(IX1-KX0+0.06, 0.05, KZ1-KZ0+0.08, (KX0+IX1)/2-0.015, FF+1.005, (KZ0+KZ1)/2-0.01, "#b8864e");
  for(let k=0;k<6;k++) B(0.012, 0.86, 0.006, KX0+0.6+k*0.8, FF+0.48, KZ0-0.003, "#6faf9a");
  addCol(KX0, IX1, KZ0-0.04, KZ1, FF-0.5, FF+1.03);
  bucketOf("cafe_case", ()=>{ const t=signTex(256, 128, (c,W,H)=>{ c.fillStyle="#f6efe0"; c.fillRect(0,0,W,H);
      for(let r2=0;r2<2;r2++){ c.fillStyle="#d8d2c4"; c.fillRect(0, r2*64+56, W, 6);
        for(let k=0;k<6;k++){ const x=14+k*40, y=r2*64+30, col=["#c8803a","#e8b860","#8a4a2a","#d8a050","#f2d8a0","#b85a3a"][(k+r2*2)%6];
          c.fillStyle=col; c.beginPath(); c.ellipse(x, y+8, 16, 12, 0, 0, Math.PI*2); c.fill(); c.fillStyle="rgba(255,255,255,0.35)"; c.beginPath(); c.ellipse(x-4, y+4, 6, 3, 0, 0, Math.PI*2); c.fill();
          if((k+r2)%3===0){ c.fillStyle="#3a5aa8"; for(let b=0;b<4;b++) c.fillRect(x-8+b*5, y+6+(b%2)*3, 3, 3); } } } });
    return glowMat({color:0xffffff, map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:0.3, roughness:0.2}, "indoor", null); });
  { const x0=KX0+0.05, x1=KX0+1.25, z=KZ0-0.01;
    push("cafe_case", new T.PlaneGeometry(x1-x0-0.06, 0.5), (x0+x1)/2, FF+1.29, z+0.11, Math.PI, "#ffffff");
    push("glass", new T.PlaneGeometry(x1-x0, 0.56), (x0+x1)/2, FF+1.32, z-0.01, Math.PI, "#ffffff");
    B(x1-x0+0.02, 0.03, 0.34, (x0+x1)/2, FF+1.61, z+0.15, "#c8ccd0"); for(const x of [x0, x1]) B(0.03, 0.6, 0.34, x, FF+1.32, z+0.15, "#c8ccd0"); }
  // on the counter: the register, the tip jar, a stack of cups; behind it the back counter, the espresso machine, the grinder,
  // the syrups, the mugs on a shelf; the menu over them and the loon painted on the wall
  B(0.32, 0.18, 0.28, 1438.6, FF+1.125, -1181.75, "#2a2a2c"); B(0.26, 0.12, 0.02, 1438.6, FF+1.25, -1181.84, "#3a5a6a", 0, -0.4);
  push("glass", new T.CylinderGeometry(0.06, 0.055, 0.16, 14), 1439.1, FF+1.115, -1181.85, 0, "#ffffff"); B(0.08, 0.06, 0.03, 1439.1, FF+1.072, -1181.85, "#4a8a4a");
  sign(0.14, 0.06, (c,W,H)=>{ c.fillStyle="#f6efdc"; c.fillRect(0,0,W,H); say(c, "TIPS FOR THE LOON", W/2, H/2, W*0.84, H*0.6, CORAL, "800", "Arial"); }, 1439.1, FF+1.1, -1181.922, Math.PI, false, 160);
  for(let k=0;k<5;k++) CT(0.042, 0.034, 0.1, 1440.4, FF+1.085+k*0.07, -1181.75, k%2 ? "#f6f3ec" : "#efe8d8", 12);
  { const bz=IZ1-0.3;
    B(IX1-1436.3, 0.92, 0.588, (1436.3+IX1)/2, FF+0.46, bz-0.006, "#f6f3ec");                 // (its back 6 mm clear of the plaster)
    B(IX1-1436.3+0.04, 0.04, 0.64, (1436.3+IX1)/2, FF+0.94, bz, "#b8864e");
    addCol(1436.3, IX1, bz-0.3, IZ1, FF-0.5, FF+0.96);
    // the espresso machine: brushed steel, two group heads, the cups warming on top, a red light
    RB(0.78, 0.46, 0.5, 1439.2, FF+1.195, bz, "#c8ccd0", 0, 0.04); B(0.8, 0.05, 0.52, 1439.2, FF+1.445, bz, "#9a9ea2");
    for(const dx of [-0.2, 0.2]){ C(0.045, 0.06, 1439.2+dx, FF+1.0, bz-0.2, "#2a2a2c", 12); B(0.03, 0.03, 0.16, 1439.2+dx, FF+0.98, bz-0.3, "#1d1d1e"); CT(0.04, 0.032, 0.07, 1439.2+dx, FF+0.995, bz-0.2, TRIM, 12); }
    ent(new T.SphereGeometry(0.014, 8, 6), 1438.86, FF+1.36, bz-0.255, "#e8281c");
    for(let k=0;k<4;k++) CT(0.04, 0.034, 0.08, 1438.95+k*0.16, FF+1.515, bz, ["#e8705e","#9fd2bf","#f4c430","#f6f3ec"][k], 12);
    // the grinder, beans in its hopper
    B(0.2, 0.32, 0.24, 1440.4, FF+1.125, bz, "#1d1d1e"); CT(0.09, 0.06, 0.2, 1440.4, FF+1.385, bz, "#5a3216", 14); CT(0.095, 0.095, 0.02, 1440.4, FF+1.493, bz, "#c8ccd0", 14);
    // the syrups
    for(let k=0;k<6;k++){ const x=1436.6+k*0.12; C(0.03, 0.24, x, FF+1.085, bz+0.08, ["#a8321c","#e8b84a","#6a3a1a","#c86ab8","#3a8a3a","#e8e4d8"][k], 10); C(0.012, 0.06, x, FF+1.235, bz+0.08, "#1d1d1e", 6); }
    // the mug shelf, the mugs that do not match on it
    B(2.0, 0.03, 0.22, 1437.4, FF+1.72, IZ1-0.12, "#b8864e"); for(const dx of [-0.9, 0.9]) B(0.03, 0.15, 0.2, 1437.4+dx, FF+1.65, IZ1-0.11, "#2a2a2c");
    for(let k=0;k<8;k++) CT(0.042, 0.038, 0.1, 1437.0+k*0.19, FF+1.79, IZ1-0.12, ["#e8705e","#9fd2bf","#f4c430","#7ab8e0","#f6f3ec","#c86ab8","#2a4a44"][(k*3)%7], 12); }
  sign(1.9, 0.82, (c,W,H)=>{ c.fillStyle="#1e2420"; c.fillRect(0,0,W,H); c.strokeStyle="#b8864e"; c.lineWidth=12; c.strokeRect(6,6,W-12,H-12);
      say(c, "THE MENU", W/2, H*0.13, W*0.7, H*0.1, "#f4c430", "700", CHALK);
      const L=[["DRIP","2.5"],["LOON LATTE","5"],["CORTADO","4"],["COLD BREW","4.5"],["CHAI","4.5"],["HOT CHOC","3.5"]], R=[["BLUEBERRY SCONE","3.5"],["CINNAMON ROLL","4"],["HAND PIE","5"],["DONUT (1)","2"],["DONUT (DOZ.)","18"],["DOG BISCUIT","FREE"]];
      for(const [col, X] of [[L, 0.27],[R, 0.73]]) col.forEach(([a,b],k)=>{ say(c, a, W*(X-0.04), H*(0.32+k*0.11), W*0.30, H*0.06, "#f2efe6", "700", CHALK); say(c, b, W*(X+0.17), H*(0.32+k*0.11), W*0.07, H*0.06, "#9fd2bf", "700", CHALK); }); },
    1439.6, FF+2.12, IZ1-0.012, Math.PI, false, 900);
  sign(1.0, 0.7, (c,W,H)=>{ c.fillStyle="#7fbfaa"; c.fillRect(0,0,W,H);
      c.fillStyle="#2a4a44"; c.beginPath(); c.ellipse(W*0.45, H*0.62, W*0.32, H*0.12, 0, 0, Math.PI*2); c.fill();
      c.beginPath(); c.ellipse(W*0.74, H*0.4, W*0.09, H*0.08, 0, 0, Math.PI*2); c.fill(); c.fillRect(W*0.68, H*0.40, W*0.07, H*0.22);
      c.fillStyle="#f6f3ec"; for(let k=0;k<11;k++) c.fillRect(W*0.2+k*W*0.042, H*(0.57+(k%2)*0.05), 5, 5);
      c.fillStyle="#d8261c"; c.beginPath(); c.arc(W*0.77, H*0.38, 4, 0, Math.PI*2); c.fill();
      c.fillStyle="#2a4a44"; c.beginPath(); c.moveTo(W*0.82, H*0.39); c.lineTo(W*0.95, H*0.42); c.lineTo(W*0.82, H*0.44); c.fill();
      c.strokeStyle="#f6f3ec"; c.lineWidth=3; for(let k=0;k<3;k++){ c.beginPath(); c.moveTo(W*0.1, H*(0.8+k*0.06)); for(let x=0;x<=W*0.8;x+=8) c.lineTo(W*0.1+x, H*(0.8+k*0.06)+Math.sin(x/10+k)*3); c.stroke(); }
      say(c, "good morning, lake", W/2, H*0.15, W*0.8, H*0.12, "#f6f3ec", "700", "Georgia, serif"); }, 1437.4, FF+2.2, IZ1-0.012, Math.PI, false, 440);
  // two little tables by the west window, a chair either side
  COFFEE.tables=[];
  const cafeChair=(x, z, ry, col)=>{ const f=XF(x, z, ry), q=(w,h,d,lx,ly,lz,c,rx)=>ent(boxGeo(w,h,d), f.x(lx,lz), FF+ly, f.z(lx,lz), c, rx||0, ry, 0);
    q(0.40, 0.04, 0.40, 0, 0.45, 0, col); for(const sx of [-0.17, 0.17]){ q(0.035, 0.45, 0.035, sx, 0.225, 0.17, "#3a2a1c"); q(0.035, 0.88, 0.035, sx, 0.44, -0.17, "#3a2a1c"); }
    for(let k=0;k<3;k++) q(0.03, 0.4, 0.02, -0.1+k*0.1, 0.68, -0.17, "#3a2a1c"); q(0.38, 0.05, 0.03, 0, 0.88, -0.17, "#3a2a1c"); };
  for(const [tx, tz] of [[1435.0, -1185.3],[1435.0, -1183.4]]){
    C(0.32, 0.035, tx, FF+0.74, tz, "#b8864e", 20); C(0.03, 0.72, tx, FF+0.37, tz, "#2a2a2c", 8); C(0.18, 0.02, tx, FF+0.012, tz, "#2a2a2c", 14);
    addCol(tx-0.32, tx+0.32, tz-0.32, tz+0.32, FF-0.5, FF+0.76);
    const seats=[[tx-0.55, tz, Math.PI/2],[tx+0.55, tz, -Math.PI/2]];
    seats.forEach(([sx, sz, ry], k)=>cafeChair(sx, sz, ry, k ? CORAL : "#7ab8e0"));
    C(0.09, 0.01, tx, FF+0.763, tz, "#f6f3ec", 14); CT(0.025, 0.03, 0.09, tx, FF+0.812, tz, "#e8b84a", 8); ent(new T.SphereGeometry(0.04, 8, 6), tx, FF+0.87, tz, "#3a7a2a");
    COFFEE.tables.push({x:tx, z:tz, seats:seats}); }
  // the bar along the front window, east of the door, three stools at it looking out at the street
  { const z=IZ0+0.2;
    B(2.3, 0.04, 0.4, 1439.7, FF+1.04, z, "#b8864e"); for(const x of [1438.7, 1440.7]) B(0.04, 0.24, 0.04, x, FF+0.94, IZ0+0.04, "#2a2a2c");
    addCol(1438.55, 1440.85, IZ0, z+0.2, FF+0.6, FF+1.06);
    COFFEE.stools=[];
    for(const x of [1438.95, 1439.7, 1440.45]){ const sz=z+0.62;
      C(0.17, 0.05, x, FF+0.77, sz, "#e8705e", 16); C(0.022, 0.75, x, FF+0.375, sz, "#2a2a2c", 8); ent(new T.TorusGeometry(0.14, 0.01, 6, 16), x, FF+0.28, sz, "#2a2a2c", Math.PI/2); C(0.18, 0.02, x, FF+0.012, sz, "#2a2a2c", 16);
      addCol(x-0.18, x+0.18, sz-0.18, sz+0.18, FF-0.5, FF+0.79); COFFEE.stools.push([x, sz]); } }
  // the back corner: an old green armchair, a lamp, a shelf of paperbacks, a rug, a fern
  { const ax=1434.4, az=-1180.75, ry=Math.PI*0.78;
    const f=XF(ax, az, ry), q=(w,h,d,lx,ly,lz,c)=>RB(w,h,d, f.x(lx,lz), FF+ly, f.z(lx,lz), c, ry, 0.05);
    q(0.84, 0.42, 0.8, 0, 0.21, 0, "#4a6a4a"); q(0.84, 0.62, 0.2, 0, 0.66, -0.3, "#4a6a4a"); for(const sd of [-1,1]) q(0.16, 0.28, 0.76, sd*0.36, 0.52, 0.01, "#4a6a4a");
    q(0.54, 0.12, 0.58, 0, 0.47, 0.06, "#5a7a5a");
    addCol(ax-0.48, ax+0.48, az-0.48, az+0.48, FF-0.5, FF+0.6); COFFEE.armchair=[ax, az, ry];
    B(1.6, 0.012, 1.2, ax+0.4, FF+0.015, az-0.2, "#a8463a"); B(1.4, 0.014, 1.0, ax+0.4, FF+0.022, az-0.2, "#d8b06a");
    const lx=IX0+0.25, lz=IZ1-0.25; C(0.14, 0.02, lx, FF+0.016, lz, "#2a2a2c", 14); C(0.012, 1.45, lx, FF+0.75, lz, "#c8a050", 6);
    CT(0.12, 0.18, 0.22, lx, FF+1.5, lz, "#f2e2b8", 18); push("cafe_bulb", new T.SphereGeometry(0.04, 8, 6), lx, FF+1.43, lz, 0, "#ffffff");
    const bz0=-1182.0; B(0.02, 1.8, 1.4, IX0+0.025, FF+0.9, bz0, "#5a3a20"); for(const sd of [-1,1]) B(0.3, 1.8, 0.03, IX0+0.17, FF+0.9, bz0+sd*0.685, "#6b4a2b");
    for(let k=0;k<5;k++){ const y=FF+0.1+k*0.42; B(0.28, 0.025, 1.34, IX0+0.18, y, bz0, "#6b4a2b");
      if(k<4) for(let b=0;b<13;b++){ const bh=0.2+((b*7+k*3)%5)*0.025; B(0.2, bh, 0.06+((b+k)%3)*0.012, IX0+0.15, y+0.0125+bh/2+0.005, bz0-0.6+b*0.095, ["#a8321c","#2a4a7a","#e8b84a","#3a6a3a","#e8e4d8","#6b3a6a","#d8703a"][(b*3+k)%7]); } }
    addCol(IX0, IX0+0.35, bz0-0.7, bz0+0.7, FF-0.5, FF+1.8);
    CT(0.18, 0.14, 0.32, IX1-0.3, FF+0.17, IZ0+0.35, CORAL, 14);
    for(let k=0;k<12;k++){ const a=k*0.52; ent(new T.ConeGeometry(0.05, 0.6, 4), IX1-0.3+Math.cos(a)*0.12, FF+0.55+(k%3)*0.06, IZ0+0.35+Math.sin(a)*0.12, "#3a7a2a", Math.cos(a)*0.5, 0, Math.sin(a)*0.5); }
    addCol(IX1-0.5, IX1-0.1, IZ0+0.15, IZ0+0.55, FF-0.5, FF+0.8); }
  // the pendant bulbs over the counter and the tables; the lamps that light the room; OPEN in the window
  for(const [x, z] of [[1437.2, -1181.9],[1438.8, -1181.9],[1440.4, -1181.9],[1435.0, -1185.3],[1435.0, -1183.4]]){
    tubeE(V3(x, CEIL, z), V3(x, FF+1.95, z), 0.005, "#1a1a1a", 4); CT(0.04, 0.13, 0.12, x, FF+1.9, z, "#2a4a44", 14); push("cafe_bulb", new T.SphereGeometry(0.045, 10, 8), x, FF+1.82, z, 0, "#ffffff"); }
  for(const [x, z, i] of [[1438.8, -1182.6, 0.55],[1435.0, -1184.4, 0.5],[1439.7, -1185.2, 0.4]])
    LAMPS.push({x:x, y:FF+1.8, z:z, color:0xffd2a0, intensity:i, dist:6, decay:1.6, indoor:true, vol:[CX0, CX1, CZ0-2, CZ1, FF-0.5, CEIL+0.5]});
  { const t=signTex(256, 96, (c,W,H)=>{ c.save(); c.shadowColor="#ff5a8a"; c.shadowBlur=16; c.strokeStyle="#ffd8e4"; c.lineWidth=7; c.beginPath(); c.ellipse(W/2, H/2, W*0.44, H*0.38, 0, 0, Math.PI*2); c.stroke();
      c.fillStyle="#fff0f4"; fitText(c, "OPEN", W*0.6, H*0.55, W/2, H/2+2, "800", "Arial"); c.restore(); });
    const m=new T.Mesh(new T.PlaneGeometry(0.6, 0.225), new T.MeshBasicMaterial({map:t, transparent:true, depthWrite:false, toneMapped:false}));
    m.position.set(1434.72, FF+1.85, CZ0+WT/2+0.06); m.rotation.y=Math.PI; scene.add(m); COFFEE.neon=m; }
  // the radio on the mug shelf: the street's country station, low (20's nearRadio; heard muffled from out front)
  if(typeof LAKE_HOUSES!=="undefined") LAKE_HOUSES.radios.push({x:1436.68, z:IZ1-0.12, y:FF+1.9, station:0, house:"THE PERKY LOON", zone:"THE PERKY LOON", vol:0.5});
  B(0.26, 0.15, 0.1, 1436.68, FF+1.815, IZ1-0.12, "#8a3a2a"); C(0.04, 0.012, 1436.62, FF+1.815, IZ1-0.175, "#c8b890", 12, Math.PI/2);


  /* ---- more in the room: the beans for sale by the counter, the board by the door, the photographs over the armchair, a
     cake under glass and the milk and sugar on the counter, the pour-over bar and the cold brew behind it, a fan turning
     in the ceiling, two hanging ferns in the front windows, the bin by the door ---------------------------------------- */
  // the bags: kraft, the label printed on the front from one sheet of the five roasts (upstairs and down)
  const ROASTS=[["LOON ROAST","MEDIUM · HOUSE BLEND","#2a4a44","#f6efdc"],["LAKE EFFECT","DARK · SMOKY + BOLD","#1e2a3a","#e8d8b0"],
                ["DECAF DOCK","SWISS WATER DECAF","#7fbfaa","#1e2420"],["SUNRISE","LIGHT · BRIGHT · FRUITY","#e8705e","#fff4e0"],["PRESQUE ISLE","MED-DARK · CHOCOLATE","#6b3a2a","#f2e2c0"]];
  const LBL=[], labelTex=signTex(1000, 240, (c,W,H)=>{ ROASTS.forEach(([nm, sub, bg, fg], k)=>{ const x0=k*200, cx=x0+100;
      c.fillStyle=bg; c.fillRect(x0, 0, 200, H); c.strokeStyle=fg; c.lineWidth=4; c.strokeRect(x0+10, 10, 180, H-20);
      c.fillStyle=fg; c.beginPath(); c.ellipse(cx, 70, 46, 30, 0, 0, Math.PI*2); c.fill();
      c.fillStyle=bg; c.beginPath(); c.ellipse(cx-6, 78, 30, 10, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+20, 64, 8, 0, Math.PI*2); c.fill();
      c.beginPath(); c.moveTo(cx+26, 64); c.lineTo(cx+40, 67); c.lineTo(cx+26, 70); c.fill();
      c.fillStyle=fg; fitText(c, nm, 150, 30, cx, 132, "900", "Georgia, serif");
      fitText(c, sub, 150, 15, cx, 162, "700", "Arial"); fitText(c, "WHOLE BEAN · 12 OZ", 150, 13, cx, 190, "700", "Arial"); }); });
  const bag=(x, y, z, ry, k)=>{ const s=Math.sin(ry), c=Math.cos(ry);                            // (y its bottom; its front along (sin ry, cos ry))
    B(0.14, 0.22, 0.085, x, y+0.11, z, "#b08a5a", ry); B(0.142, 0.03, 0.03, x, y+0.235, z, "#a07a4a", ry); B(0.15, 0.008, 0.012, x+s*0.016, y+0.236, z+c*0.016, "#c8a050", ry);
    const g=new T.PlaneGeometry(0.11, 0.132), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setX(i, (k+U.getX(i))/5);
    LBL.push({geo:g, matrix:new T.Matrix4().compose(V3(x+s*0.0485, y+0.105, z+c*0.0485), new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0)), V3(1,1,1)), color:new T.Color("#ffffff")}); };
  // the shelf of them on the east wall, between the window and the counter, facing into the room
  { const sx=IX1-0.17, za=-1183.35, zb=-1182.2, zc=(za+zb)/2;
    for(const z of [za+0.015, zb-0.015]) B(0.34, 1.95, 0.03, sx, FF+0.975, z, "#6b4a2b"); B(0.02, 1.9, zb-za-0.03, IX1-0.018, FF+0.97, zc, "#5a3a20");
    for(const y of [0.06, 0.48, 0.90, 1.32]){ B(0.33, 0.025, zb-za-0.03, sx-0.005, FF+y, zc, "#6b4a2b"); B(0.012, 0.05, zb-za-0.03, sx-0.17, FF+y+0.012, zc, "#c8a050"); }
    B(0.36, 0.18, zb-za+0.02, sx-0.01, FF+1.86, zc, "#2a4a44");
    for(const [row, y] of [[0, 0.4925],[1, 0.9125],[2, 1.3325]]) for(let j=0;j<6;j++) bag(sx-0.06, FF+y+0.0005, za+0.12+j*0.18, -Math.PI/2, (j+row*2)%5);
    for(let j=0;j<4;j++){ const z=za+0.16+j*0.24; B(0.20, 0.16, 0.20, sx-0.03, FF+0.0725+0.08+0.0005, z, "#e8e2d4"); B(0.004, 0.10, 0.12, sx-0.132, FF+0.0725+0.08, z, ["#e8705e","#9fd2bf","#f4c430","#7ab8e0"][j]); }
    sign(1.12, 0.16, (c,W,H)=>{ c.fillStyle="#2a4a44"; c.fillRect(0,0,W,H); say(c, "ROASTED RIGHT HERE · DOWNSTAIRS, OUT BACK", W/2, H/2, W*0.84, H*0.6, "#f6efdc", "800", "Arial"); },
      sx-0.20, FF+1.86, zc, -Math.PI/2, false, 1120);
    addCol(IX1-0.36, IX1, za, zb, FF-0.5, FF+1.95); }
  // the board by the front door on the west wall, notices pinned to it
  { const z=-1185.6;
    bx("paintm", 0.03, 0.66, 1.0, IX0+0.022, FF+1.62, z, 0.5, 0, "#8a6a48");
    sign(0.96, 0.62, (c,W,H)=>{ c.fillStyle="#c8a47a"; c.fillRect(0,0,W,H); const q=_trng(4242);
      for(let k=0;k<900;k++){ c.fillStyle="rgba(120,84,44,"+(0.12+q()*0.2).toFixed(2)+")"; c.fillRect(q()*W, q()*H, 2, 2); }
      const N=[["LOST CAT","PICKLES · ORANGE","#f4f2ec",0.05,0.08,0.28,0.38,-0.04],["YOGA ON","THE DOCK · SAT 8AM","#c8e0f4",0.37,0.06,0.28,0.36,0.03],
               ["GUITAR","LESSONS · ASK DAVE","#f2e88a",0.69,0.09,0.26,0.36,-0.02],["ROASTERY","TOURS · SAT 10AM","#f6efdc",0.06,0.54,0.28,0.38,0.02],
               ["FIDDLE NIGHT","THURSDAYS · 7PM","#f4c8b8",0.38,0.52,0.28,0.38,-0.03],["BOAT","FOR SALE · CALL","#f4f2ec",0.70,0.55,0.25,0.36,0.04]];
      for(const [a, b, col, x, y, w, h, rot] of N){ c.save(); c.translate(W*(x+w/2), H*(y+h/2)); c.rotate(rot); c.fillStyle=col; c.fillRect(-W*w/2, -H*h/2, W*w, H*h);
        c.fillStyle="#1a1a1a"; fitText(c, a, W*w*0.8, H*h*0.24, 0, -H*h*0.18, "800", "Arial"); fitText(c, b, W*w*0.8, H*h*0.14, 0, H*h*0.12, "700", "Arial");
        c.fillStyle="#5a5a5a"; for(let j=0;j<2;j++) c.fillRect(-W*w*0.36, H*h*(0.26+j*0.09), W*w*0.72*(0.7+0.3*j), 2);
        c.fillStyle="#c41a1a"; c.beginPath(); c.arc(0, -H*h/2+6, 4, 0, 7); c.fill(); c.restore(); } },
      IX0+0.05, FF+1.62, z, Math.PI/2, false, 480); }
  // the photographs over the armchair: the lake at three times of day, in dark frames
  { const pic=(draw)=>(c,W,H)=>{ draw(c,W,H); c.strokeStyle="#f2efe6"; c.lineWidth=10; c.strokeRect(5,5,W-10,H-10); };
    const lake=(sky0, sky1, hill, water, sun)=>pic((c,W,H)=>{ const g=c.createLinearGradient(0,0,0,H*0.6); g.addColorStop(0, sky0); g.addColorStop(1, sky1); c.fillStyle=g; c.fillRect(0,0,W,H);
      if(sun){ c.fillStyle=sun; c.beginPath(); c.arc(W*0.68, H*0.5, H*0.1, 0, Math.PI*2); c.fill(); }
      c.fillStyle=hill; c.beginPath(); c.moveTo(0, H*0.55); for(let x=0;x<=W;x+=8) c.lineTo(x, H*0.55-Math.sin(x/W*5+1)*H*0.06-Math.sin(x/W*13)*H*0.02); c.lineTo(W, H*0.6); c.lineTo(0, H*0.6); c.fill();
      c.fillStyle=water; c.fillRect(0, H*0.6, W, H*0.4); c.strokeStyle="rgba(255,255,255,0.25)"; c.lineWidth=2; for(let k=0;k<6;k++){ c.beginPath(); c.moveTo(W*0.2+k*13, H*(0.68+k*0.05)); c.lineTo(W*0.5+k*21, H*(0.68+k*0.05)); c.stroke(); } });
    const draws=[lake("#9ec8e8","#e8eef0","#4a6a4a","#5a8aa8",null), lake("#3a3a6a","#e8a070","#2a3a3a","#6a5a6a","#f8d070"),
                 pic((c,W,H)=>{ c.fillStyle="#8ab8d8"; c.fillRect(0,0,W,H); c.fillStyle="#4a7aa0"; c.fillRect(0, H*0.5, W, H*0.5);
                   c.fillStyle="#1d1f22"; c.beginPath(); c.ellipse(W*0.45, H*0.62, W*0.22, H*0.08, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.ellipse(W*0.66, H*0.48, W*0.06, H*0.06, 0, 0, Math.PI*2); c.fill();
                   c.fillRect(W*0.62, H*0.48, W*0.05, H*0.14); c.fillStyle="#f2efe6"; for(let k=0;k<10;k++) c.fillRect(W*0.3+k*W*0.025, H*(0.59+(k%2)*0.03), 3, 3);
                   c.fillStyle="#d8261c"; c.beginPath(); c.arc(W*0.68, H*0.47, 3, 0, 7); c.fill(); })];
    draws.forEach((d, k)=>{ const x=1434.35+k*0.55; B(0.42, 0.32, 0.025, x, FF+1.65, IZ1-0.02, "#3a2a1c"); sign(0.36, 0.26, d, x, FF+1.65, IZ1-0.044, Math.PI, false, 260); }); }
  // on the counter: a cake under a glass dome; at its east end the milk, the sugar, the napkins and the stirrers
  { const x=1437.62, z=-1181.78, t=FF+1.03;
    C(0.06, 0.012, x, t+0.006, z, TRIM, 16); C(0.016, 0.10, x, t+0.06, z, TRIM, 10); C(0.155, 0.012, x, t+0.116, z, TRIM, 24);
    CT(0.105, 0.105, 0.09, x, t+0.167, z, "#5a3216", 22); C(0.107, 0.012, x, t+0.216, z, "#f2e6cc", 22); for(let k=0;k<8;k++){ const a=k*Math.PI/4; ent(new T.SphereGeometry(0.012, 6, 5), x+Math.cos(a)*0.085, t+0.226, z+Math.sin(a)*0.085, "#c8243a"); }
    push("glass", new T.SphereGeometry(0.145, 18, 9, 0, Math.PI*2, 0, Math.PI/2), x, t+0.123, z, 0, "#ffffff"); ent(new T.SphereGeometry(0.02, 8, 6), x, t+0.272, z, "#c8ccd0");
    const ex=1440.98; B(0.10, 0.14, 0.08, ex+0.1, t+0.07, z+0.06, "#2a2a2c"); B(0.08, 0.10, 0.004, ex+0.1, t+0.075, z+0.018, "#f6f3ec");
    B(0.14, 0.06, 0.09, ex, t+0.03, z-0.10, "#b8864e"); for(let k=0;k<4;k++) B(0.025, 0.05, 0.07, ex-0.045+k*0.03, t+0.066, z-0.10, ["#f6f3ec","#f4c430","#e8a0b8","#7ab8e0"][k]);
    for(const dx of [-0.13, -0.24]){ CT(0.035, 0.042, 0.15, ex+dx+0.1, t+0.075, z+0.0, "#c8ccd0", 14); B(0.06, 0.02, 0.02, ex+dx+0.1, t+0.13, z-0.045, "#c8ccd0"); }
    CT(0.03, 0.025, 0.08, ex-0.08, t+0.04, z+0.10, "#f6f3ec", 10); for(let k=0;k<6;k++) B(0.004, 0.11, 0.004, ex-0.08+(k%3-1)*0.01, t+0.085, z+0.10+(k>2?0.008:-0.008), "#c8a878"); }
  // behind it, on the back counter: a pour-over stand with two cones, the kettle and its scale; the cold brew in its jar
  { const bz=IZ1-0.3, t=FF+0.96;
    B(0.52, 0.03, 0.16, 1437.95, t+0.20, bz+0.02, "#6b4a2b"); for(const dx of [-0.24, 0.24]) B(0.03, 0.2, 0.14, 1437.95+dx, t+0.10, bz+0.02, "#6b4a2b");
    for(const dx of [-0.12, 0.12]){ CT(0.07, 0.025, 0.08, 1437.95+dx, t+0.255, bz+0.02, "#f6f3ec", 16); push("glass", new T.CylinderGeometry(0.05, 0.055, 0.13, 14), 1437.95+dx, t+0.07, bz+0.02, 0, "#ffffff");
      C(0.048, 0.04, 1437.95+dx, t+0.03, bz+0.02, "#3a1e0e", 14); }
    B(0.16, 0.02, 0.16, 1438.5, t+0.015, bz, "#1d1d1e"); C(0.065, 0.14, 1438.5, t+0.095, bz, "#2a2a2c", 16); C(0.03, 0.02, 1438.5, t+0.175, bz, "#2a2a2c", 10);
    tubeE(V3(1438.44, t+0.06, bz-0.04), V3(1438.34, t+0.18, bz-0.10), 0.008, "#2a2a2c"); tubeE(V3(1438.34, t+0.18, bz-0.10), V3(1438.30, t+0.17, bz-0.13), 0.006, "#2a2a2c");
    tubeE(V3(1438.56, t+0.13, bz+0.02), V3(1438.6, t+0.06, bz+0.06), 0.012, "#2a2a2c");
    push("glass", new T.CylinderGeometry(0.11, 0.11, 0.40, 18), 1440.98, t+0.205, bz+0.02, 0, "#ffffff"); C(0.10, 0.30, 1440.98, t+0.16, bz+0.02, "#2a160a", 16);
    C(0.115, 0.03, 1440.98, t+0.42, bz+0.02, "#c8ccd0", 18); C(0.12, 0.012, 1440.98, t+0.006, bz+0.02, "#c8ccd0", 18);
    B(0.03, 0.03, 0.07, 1440.98, t+0.06, bz-0.12, "#c8ccd0"); B(0.03, 0.05, 0.02, 1440.98, t+0.09, bz-0.15, "#1d1d1e"); }
  // the fan: a downrod, the motor, five blades (turned in updateCoffee)
  { const fx=1437.6, fz=-1184.3, fy=CEIL-0.42;
    tubeE(V3(fx, CEIL+0.01, fz), V3(fx, fy+0.08, fz), 0.015, "#3a2a1c"); CT(0.07, 0.05, 0.04, fx, CEIL-0.02, fz, "#3a2a1c", 14); CT(0.10, 0.13, 0.12, fx, fy+0.02, fz, "#3a2a1c", 18);
    const FB=[]; for(let k=0;k<5;k++){ const a=k*Math.PI*2/5;
      FB.push({geo:boxGeo(0.56, 0.012, 0.13), matrix:new T.Matrix4().compose(V3(Math.cos(a)*0.43, 0, -Math.sin(a)*0.43), new T.Quaternion().setFromEuler(new T.Euler(0.08, a, 0, "YXZ")), V3(1,1,1)), color:new T.Color("#8a5a3a")});
      FB.push({geo:boxGeo(0.12, 0.02, 0.04), matrix:new T.Matrix4().compose(V3(Math.cos(a)*0.13, 0.005, -Math.sin(a)*0.13), new T.Quaternion().setFromEuler(new T.Euler(0, a, 0)), V3(1,1,1)), color:new T.Color("#2a2a2c")}); }
    const fan=new T.Mesh(mergeEntries(FB), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6})); fan.position.set(fx, fy-0.045, fz); fan.castShadow=true; scene.add(fan); COFFEE.fan=fan; }
  // the ferns hanging in the front windows, in macramé
  for(const [hx, hz] of [[1435.95, -1185.92],[1440.5, -1185.92]]){ const py=FF+1.98;
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3; tubeE(V3(hx, CEIL, hz), V3(hx+Math.cos(a)*0.11, py+0.06, hz+Math.sin(a)*0.11), 0.004, "#e8dcc0", 4); }
    CT(0.12, 0.09, 0.14, hx, py, hz, "#d8c8a8", 16);
    for(let k=0;k<14;k++){ const a=k*0.45; ent(new T.ConeGeometry(0.035, 0.42, 4), hx+Math.cos(a)*0.12, py-0.02, hz+Math.sin(a)*0.12, k%2 ? "#4a8a3a" : "#3a7a2a", Math.sin(a)*2.3, 0, -Math.cos(a)*2.3); } }
  // the bin by the door
  { const x=1438.34, z=IZ0+0.23; B(0.36, 0.95, 0.40, x, FF+0.475, z, "#2a4a44"); B(0.38, 0.03, 0.42, x, FF+0.965, z, "#b8864e"); B(0.24, 0.14, 0.004, x, FF+0.78, z+0.202, "#1d2a28");
    sign(0.26, 0.08, (c,W,H)=>{ c.fillStyle="#2a4a44"; c.fillRect(0,0,W,H); say(c, "THANK YOU", W/2, H/2, W*0.8, H*0.6, "#f6efdc", "800", "Arial"); }, x, FF+0.6, z+0.212, 0, false, 200);
    addCol(x-0.18, x+0.18, z-0.2, z+0.2, FF-0.5, FF+0.98); }

  /* ======================================================================
     THE ROASTERY, under the house: down the stair behind it, in at the coral door. The coffee is roasted here: the
     roaster against the west wall, its drum turning, the beans cooling in the tray in front of it with the arm going
     round; the chaff cyclone beside it, the duct up into the joists and out to the stack up the back wall. Sacks of
     green coffee on pallets along the front wall, from six countries; the roasted coffee bagged at the steel table and
     shelved by the east wall; a cupping table, the roast log, the furnace and the water heater. BURIED (06): its light
     is the same at any hour.
     ====================================================================== */
  const BF=Y-2.65, BCL=Y-0.216, BX0=CX0+0.2, BX1=CX1-0.2, BZ0=CZ0+0.2, BZ1=CZ1-0.2, BD={a:1439.2, b:1440.2, sill:BF-0.004, head:BF+2.05};
  Object.assign(COFFEE, {BF:BF, bx0:BX0, bx1:BX1, bz0:BZ0, bz1:BZ1});
  const lampU=(o)=>{ o.under=true; o.indoor=true; LAMPS.push(o); return o; };
  bucketOf("loon_glow", ()=>emitMat(0xff8a2a, 1.0, "indoor", null));
  { const BW="#d6d2c6";
    // the foundation: block, whitewashed inside; the door in the back wall; a concrete floor; the subfloor's boards overhead
    runX("block", CZ0+0.1, 0.2, CX0, CX1, BF-0.1, Y-0.20, [], BW, 0.5);
    runX("block", CZ1-0.1, 0.2, CX0, CX1, BF-0.1, Y-0.20, [BD], BW, 0.5);
    runZ("block", CX0+0.1, 0.2, BZ0, BZ1, BF-0.1, Y-0.20, [], BW, 0.5);
    runZ("block", CX1-0.1, 0.2, BZ0, BZ1, BF-0.1, Y-0.20, [], BW, 0.5);
    floorAt("concrete", BX0, BX1, BZ0, BZ1, BF+0.004, "#a29e96", 0.5);
    ceilAt("brw_pine", BX0, BX1, BZ0, BZ1, BCL, "#c8b898", 0.5);
    // the joists across it, the steel beam under them down the middle on two columns
    for(let x=BX0+0.2; x<BX1-0.1; x+=0.4) B(0.045, 0.19, BZ1-BZ0-0.01, x, BCL-0.091, (BZ0+BZ1)/2, "#c8b088");
    B(BX1-BX0-0.01, 0.20, 0.10, (BX0+BX1)/2, BCL-0.29, -1183.0, "#7a3a2a"); B(BX1-BX0-0.01, 0.012, 0.16, (BX0+BX1)/2, BCL-0.396, -1183.0, "#7a3a2a");
    for(const x of [1436.9, 1439.1]){ C(0.055, BCL-0.402-BF, x, (BF+BCL-0.402)/2, -1183.0, "#5a5e62", 14); B(0.16, 0.012, 0.16, x, BF+0.012, -1183.0, "#5a5e62"); B(0.16, 0.012, 0.16, x, BCL-0.408, -1183.0, "#5a5e62");
      addCol(x-0.08, x+0.08, -1183.08, -1182.92, BF-0.5, BCL); }
    addFlat(BX0, BX1, BZ0, BZ1, BF);
    addVoid(BX0, BX1, BZ0, BZ1, BF-3, Y-0.15, BF);
    addBuried(BX0, BX1, BZ0, BZ1, BF-0.5, BCL+0.05, 0);
    addZone(BX0, BX1, BZ0, BZ1, BF-0.5, BCL, "THE ROASTERY", true);
    // the door in from the stair: coral, a light in it like the one at the front, a white frame, a threshold
    frX(CZ1-0.1, 0.2, BD.a, BD.b, BF, BD.head, TRIM);
    makeDoor(XF(BD.b-0.02, CZ1-0.1, Math.PI), 0, BF+0.01, 0, "THE ROASTERY", true, 0, "vision", 0xd8604e);
    B(BD.b-BD.a+0.004, 0.016, 0.23, (BD.a+BD.b)/2, BF+0.008, CZ1-0.1, "#8a6a44");
    addFlat(BD.a, BD.b, CZ1-0.21, CZ1+0.01, BF); addVoid(BD.a, BD.b, CZ1-0.22, CZ1+0.02, BF-3, Y-0.15, BF);
    // the lights: caged bulbs on cords down from the joists
    for(const [x, z] of [[1435.7, -1182.4],[1438.1, -1181.9],[1437.4, -1185.0],[1440.3, -1184.2],[1438.9, -1180.4]]){
      tubeE(V3(x, BCL, z), V3(x, BCL-0.48, z), 0.005, "#1a1a1a", 4); CT(0.03, 0.03, 0.04, x, BCL-0.50, z, "#2a2a2c", 10); push("cafe_bulb", new T.SphereGeometry(0.04, 10, 8), x, BCL-0.56, z, 0, "#ffffff");
      for(let k=0;k<4;k++){ const a=k*Math.PI/2; tubeE(V3(x+Math.cos(a)*0.055, BCL-0.52, z+Math.sin(a)*0.055), V3(x+Math.cos(a)*0.055, BCL-0.62, z+Math.sin(a)*0.055), 0.003, "#1a1a1a", 3); } }
    for(const [x, z, i] of [[1435.8, -1182.6, 0.7],[1438.3, -1182.2, 0.6],[1437.6, -1185.0, 0.5],[1438.9, -1180.6, 0.45]])
      lampU({x:x, y:BCL-0.7, z:z, color:0xffd2a0, intensity:i, dist:7, decay:1.5, vol:[BX0, BX1, BZ0, BZ1+0.3, BF-0.5, BCL+0.2]}); }

  // the roaster: a black base, the drum's housing, brass at its face, the hopper of green coffee on top, the window onto
  // the beans, the burner's glow under; the cooling tray in front, its arm going round (updateCoffee)
  { const rx=1434.55, rz=-1183.4, fx=1435.1;
    RB(1.1, 0.78, 0.78, rx, BF+0.39, rz, "#1d1d1e", 0, 0.04);
    C(0.36, 0.95, rx, BF+1.12, rz, "#2a2a2c", 28, 0, 0, Math.PI/2); C(0.37, 0.05, rx+0.47, BF+1.12, rz, "#c8a050", 28, 0, 0, Math.PI/2);
    B(0.05, 0.80, 0.84, fx, BF+1.08, rz, "#3a3a3c");
    ent(new T.TorusGeometry(0.11, 0.022, 10, 24), fx+0.03, BF+1.22, rz+0.18, "#c8a050", 0, Math.PI/2); push("loon_glow", new T.CircleGeometry(0.095, 20), fx+0.032, BF+1.22, rz+0.18, Math.PI/2, "#ffffff");
    for(const dz of [-0.22, 0.02]){ C(0.065, 0.03, fx+0.04, BF+1.40, rz+dz, "#c8a050", 18, 0, 0, Math.PI/2); C(0.055, 0.004, fx+0.057, BF+1.40, rz+dz, "#f6f3ec", 18, 0, 0, Math.PI/2);
      B(0.004, 0.045, 0.006, fx+0.061, BF+1.41, rz+dz+0.01, "#c41a1a", 0, 0.6); }
    tubeE(V3(fx+0.02, BF+1.0, rz-0.2), V3(fx+0.22, BF+1.0, rz-0.2), 0.014, "#c8a050"); ent(new T.SphereGeometry(0.03, 10, 8), fx+0.24, BF+1.0, rz-0.2, "#1d1d1e");
    B(0.04, 0.16, 0.26, fx+0.035, BF+1.0, rz+0.02, "#2a2a2c"); ent(boxGeo(0.30, 0.03, 0.22), fx+0.16, BF+0.93, rz+0.02, "#9a9ea2", 0, 0, -0.45);
    C(0.08, 0.14, rx+0.1, BF+1.54, rz, "#3a3a3c", 14); CT(0.30, 0.08, 0.42, rx+0.1, BF+1.82, rz, "#c8ccd0", 22); CT(0.30, 0.20, 0.04, rx+0.1, BF+2.05, rz, "#9a9a5a", 22);
    for(let k=0;k<30;k++){ const a=k*2.4, r=0.03+((k*37)%25)/100; ent(new T.SphereGeometry(0.012, 5, 4), rx+0.1+Math.cos(a)*r*0.8, BF+2.072, rz+Math.sin(a)*r*0.8, k%3 ? "#8a8a52" : "#a0a068"); }
    push("loon_glow", new T.PlaneGeometry(0.46, 0.05), fx+0.011, BF+0.40, rz, Math.PI/2, "#ffffff"); B(0.50, 0.012, 0.012, fx+0.006, BF+0.43, rz, "#3a3a3c", Math.PI/2);
    tubeE(V3(BX0+0.06, BF+0.1, rz-0.6), V3(rx-0.3, BF+0.1, rz-0.6), 0.018, "#e6c21c"); tubeE(V3(rx-0.3, BF+0.1, rz-0.6), V3(rx-0.3, BF+0.1, rz-0.39), 0.018, "#e6c21c");
    tubeE(V3(BX0+0.06, BF+0.1, rz-0.6), V3(BX0+0.06, BF+1.6, rz-0.6), 0.018, "#e6c21c");
    sign(0.40, 0.10, (c,W,H)=>{ c.fillStyle="#1d1d1e"; c.fillRect(0,0,W,H); say(c, "LOON · 5 KG", W/2, H/2, W*0.8, H*0.6, "#c8a050", "800", "Georgia, serif"); }, fx+0.012, BF+0.62, rz, Math.PI/2, false, 240);
    // the control screen on its stalk at the roaster's side: the roast's curves
    tubeE(V3(rx+0.3, BF, rz+0.46), V3(rx+0.3, BF+1.32, rz+0.46), 0.02, "#3a3a3c"); C(0.10, 0.012, rx+0.3, BF+0.012, rz+0.46, "#3a3a3c", 14); B(0.05, 0.30, 0.40, rx+0.32, BF+1.45, rz+0.46, "#2a2a2c");
    signPanel(0.36, 0.26, signTex(360, 260, (c,W,H)=>{ c.fillStyle="#0e1418"; c.fillRect(0,0,W,H); c.strokeStyle="#2a3a44"; c.lineWidth=1;
        for(let k=1;k<6;k++){ c.beginPath(); c.moveTo(20, 20+k*36); c.lineTo(W-14, 20+k*36); c.stroke(); c.beginPath(); c.moveTo(20+k*56, 20); c.lineTo(20+k*56, H-34); c.stroke(); }
        const plot=(f, col, w)=>{ c.strokeStyle=col; c.lineWidth=w; c.beginPath(); for(let i=0;i<=100;i++){ const t=i/100, x=20+t*(W-40), y=H-34-f(t)*(H-60); i ? c.lineTo(x,y) : c.moveTo(x,y); } c.stroke(); };
        plot(t=>0.55+0.35*Math.pow(t,0.6), "#f0a030", 2); plot(t=>t<0.08 ? 0.5-t*4 : 0.18+0.62*Math.pow((t-0.08)/0.92,0.75), "#e8483a", 2.5); plot(t=>0.75*Math.exp(-t*2.2)+0.05, "#4aa8e8", 1.5);
        c.fillStyle="#e8483a"; c.fillRect(20+0.74*(W-40), 24, 2, H-58); c.fillStyle="#f4f2ec"; c.font="bold 12px monospace";
        c.fillText("BT 401  ET 438  RoR 14.2", 24, H-14); c.fillText("1C", 20+0.74*(W-40)+4, 36); c.fillText("8:42", W-50, 36); }), rx+0.355, BF+1.45, rz+0.46, Math.PI/2, true);
    // the cooling tray: steel on three legs, the beans in it, the arm that stirs them, the chute down to it from the drum's door
    const tx=fx+0.68, ty=BF+0.84;
    C(0.48, 0.18, tx, ty-0.09, rz, "#c8ccd0", 32); ent(new T.TorusGeometry(0.475, 0.016, 8, 40), tx, ty+0.012, rz, "#b8bcc0", Math.PI/2);
    C(0.45, 0.012, tx, ty+0.012, rz, "#5a3216", 32);
    for(let k=0;k<60;k++){ const a=k*2.4, r=0.06+((k*53)%38)/100; ent(new T.SphereGeometry(0.014, 5, 4), tx+Math.cos(a)*r, ty+0.024, rz+Math.sin(a)*r, k%3 ? "#4a2a12" : "#6a3a1a"); }
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3+0.5; tubeE(V3(tx+Math.cos(a)*0.38, BF+0.005, rz+Math.sin(a)*0.38), V3(tx+Math.cos(a)*0.3, ty-0.18, rz+Math.sin(a)*0.3), 0.02, "#5a5e62"); }
    B(0.20, 0.12, 0.18, tx+0.30, ty-0.26, rz+0.30, "#9a9ea2");
    const AR=[]; AR.push({geo:new T.CylinderGeometry(0.025, 0.025, 0.12, 10), matrix:new T.Matrix4().makeTranslation(0, 0.05, 0), color:new T.Color("#9a9ea2")});
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3; AR.push({geo:boxGeo(0.40, 0.035, 0.012), matrix:new T.Matrix4().compose(V3(Math.cos(a)*0.22, 0.018, -Math.sin(a)*0.22), new T.Quaternion().setFromEuler(new T.Euler(0, a, 0)), V3(1,1,1)), color:new T.Color("#b8bcc0")}); }
    const arm=new T.Mesh(mergeEntries(AR), new T.MeshStandardMaterial({vertexColors:true, roughness:0.35, metalness:0.6})); arm.position.set(tx, ty+0.02, rz); scene.add(arm); COFFEE.arm=arm;
    addCol(rx-0.6, tx+0.5, rz-0.5, rz+0.66, BF-0.5, BF+2.0);
    // the chaff cyclone beside it, and the duct: drum to cyclone, under the beam, up into the joists and out the back wall
    const cx=1434.4, cz=-1184.75;
    C(0.24, 0.70, cx, BF+1.35, cz, "#9a9ea2", 22); CT(0.24, 0.06, 0.45, cx, BF+0.775, cz, "#9a9ea2", 22); C(0.14, 0.25, cx, BF+0.40, cz, "#5a5e62", 16);
    for(let k=0;k<3;k++){ const a=k*Math.PI*2/3; tubeE(V3(cx+Math.cos(a)*0.3, BF+0.005, cz+Math.sin(a)*0.3), V3(cx+Math.cos(a)*0.24, BF+1.05, cz+Math.sin(a)*0.24), 0.018, "#5a5e62"); }
    addCol(cx-0.32, cx+0.32, cz-0.32, cz+0.32, BF-0.5, BF+1.8);
    const D=0.075, j=(p)=>ent(new T.SphereGeometry(D*1.02, 12, 8), p.x, p.y, p.z, "#b8bcc0");
    const P=[V3(cx, BF+1.40, rz-0.30), V3(cx, BF+1.40, cz+0.22), V3(cx, BF+1.70, cz), V3(cx, BCL-0.49, cz), V3(cx, BCL-0.49, -1182.8), V3(cx, BCL-0.30, -1182.8), V3(cx, BCL-0.30, BZ1+0.01)];
    tubeE(P[0], P[1], D*0.8, "#b8bcc0"); tubeE(P[2], P[3], D, "#b8bcc0"); j(P[3]); tubeE(P[3], P[4], D, "#b8bcc0"); j(P[4]); tubeE(P[4], P[5], D, "#b8bcc0"); j(P[5]); tubeE(P[5], P[6], D, "#b8bcc0");
    B(0.26, 0.26, 0.012, cx, BCL-0.30, BZ1-0.006, "#9a9ea2");
    // and outside, the stack up the back wall past the eave, on brackets, a cap on it (the smoke off it: updateCoffee)
    const sz=CZ1+0.55, top=EAVE+1.3;
    tubeE(V3(cx, Y-0.05, sz), V3(cx, top, sz), 0.08, "#b8bcc0", 14); CT(0.16, 0.16, 0.02, cx, top+0.14, sz, "#9a9ea2", 16); ent(new T.ConeGeometry(0.18, 0.10, 16), cx, top+0.20, sz, "#9a9ea2");
    for(const k of [0,1,2]) tubeE(V3(cx, top+0.02, sz), V3(cx+Math.cos(k*2.1)*0.1, top+0.14, sz+Math.sin(k*2.1)*0.1), 0.008, "#9a9ea2");
    for(const y of [Y+0.9, FF+1.8]) tubeE(V3(cx, y, CZ1+0.005), V3(cx, y, sz-0.07), 0.015, "#5a5e62");
    addCol(cx-0.1, cx+0.1, sz-0.1, sz+0.1, Y-0.5, Y+2.5);
    COFFEE.stack={x:cx, y:top+0.25, z:sz}; }

  // the green coffee: jute sacks on two pallets along the front wall, each stencilled with where it came from
  bucketOf("loon_jute", ()=>{ const t=signTex(128, 128, (c,W,H)=>{ c.fillStyle="#b89a6a"; c.fillRect(0,0,W,H);
      for(let i=0;i<W;i+=4){ c.fillStyle=(i/4)%2 ? "rgba(90,66,36,0.35)" : "rgba(230,210,170,0.25)"; c.fillRect(i, 0, 2, H); c.fillRect(0, i, W, 2); }
      const q=_trng(6262); for(let k=0;k<300;k++){ c.fillStyle="rgba(70,50,26,"+(q()*0.25).toFixed(2)+")"; c.fillRect(q()*W, q()*H, 1+q()*2, 1); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(4, 4); return new T.MeshStandardMaterial({map:t, roughness:0.95}); });
  const ORIG=[["ETHIOPIA","YIRGACHEFFE · WASHED","#2a3a6a"],["COLOMBIA","HUILA · SUPREMO","#8a1a12"],["GUATEMALA","ANTIGUA · SHB","#1e4a2a"],
              ["SUMATRA","MANDHELING · GR. 1","#3a2a1a"],["BRAZIL","CERRADO · NATURAL","#1e5a3a"],["KENYA","NYERI · AA","#6a1a3a"]];
  const STN=[], stencil=signTex(1024, 600, (c,W,H)=>{ c.clearRect(0,0,W,H); ORIG.forEach(([nm, sub, ink], k)=>{ const x0=(k%2)*512, y0=Math.floor(k/2)*200, cx=x0+256;
      c.globalAlpha=0.85; c.strokeStyle=ink; c.lineWidth=5; c.strokeRect(x0+40, y0+18, 432, 164); c.fillStyle=ink;
      fitText(c, nm, 380, 70, cx, y0+78, "900", "'Arial Black', Arial"); fitText(c, sub, 380, 30, cx, y0+130, "800", "Arial"); fitText(c, "60 KG NET · GREEN COFFEE", 380, 20, cx, y0+162, "700", "Arial");
      c.globalAlpha=1; }); });
  const sack=(x, y, z, ry, k, top)=>{ push("loon_jute", rboxGeo(0.58, 0.24, 0.9, 0.05, 2), x, y+0.12, z, ry, "#ffffff");
    const s=Math.sin(ry), c=Math.cos(ry), cell=(g)=>{ const U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, ((k%2)+U.getX(i))/2, 1-(Math.floor(k/2)+1-U.getY(i))/3); return g; };
    STN.push({geo:cell(new T.PlaneGeometry(0.42, 0.164)), matrix:new T.Matrix4().compose(V3(x+s*0.456, y+0.12, z+c*0.456), new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0)), V3(1,1,1)), color:new T.Color("#ffffff")});
    if(top) STN.push({geo:cell(new T.PlaneGeometry(0.42, 0.164)), matrix:new T.Matrix4().compose(V3(x, y+0.246, z+c*0.12), new T.Quaternion().setFromEuler(new T.Euler(-Math.PI/2, ry, 0, "YXZ")), V3(1,1,1)), color:new T.Color("#ffffff")}); };
  { const pallet=(x0, z0)=>{ const x1=x0+1.2, z1=z0+1.0, xm=(x0+x1)/2, zm=(z0+z1)/2;
      for(let k=0;k<3;k++) B(0.09, 0.09, 1.0, x0+0.045+k*0.555, BF+0.05, zm, "#a8865a");
      for(let k=0;k<5;k++) B(1.2, 0.022, 0.14, xm, BF+0.106, z0+0.07+k*0.215, k%2 ? "#b8966a" : "#a8865a");
      addCol(x0, x1, z0, z1, BF-0.5, BF+0.9); return BF+0.117; };
    const ya=pallet(1435.55, BZ0+0.05), yb=pallet(1436.95, BZ0+0.05);
    [[1435.55, ya, 0],[1436.95, yb, 3]].forEach(([x0, y0, k0])=>{ for(let L=0;L<3;L++) for(let i=0;i<2;i++){ const j=(k0+L+i*2)%6;
      sack(x0+0.3+i*0.6+((L*7+i*3)%5-2)*0.01, y0+L*0.24, BZ0+0.55, ((L+i)%3-1)*0.03, j, L===2); } });
    sack(1438.62, BF+0.006, BZ0+0.6, 0.35, 5, true); addCol(1438.2, 1439.05, BZ0+0.1, BZ0+1.1, BF-0.5, BF+0.25); }
  // the roasted coffee: bagged on steel shelves by the east wall, the boxes of bags and labels on the next
  { const shelf=(z0, z1)=>{ const x0=BX1-0.44, x1=BX1-0.02, zm=(z0+z1)/2;
      for(const x of [x0+0.02, x1-0.02]) for(const z of [z0+0.02, z1-0.02]) B(0.025, 1.84, 0.025, x, BF+0.92, z, "#b8bcc0");
      for(const y of [0.14, 0.62, 1.10, 1.58]) B(x1-x0, 0.02, z1-z0, (x0+x1)/2, BF+y, zm, "#c8ccd0");
      addCol(x0, BX1, z0, z1, BF-0.5, BF+1.84); return {x:(x0+x1)/2, z0:z0, z1:z1}; };
    const S1=shelf(-1184.95, -1183.75), S2=shelf(-1183.55, -1182.35);
    for(const [row, y] of [[0, 0.15],[1, 0.63],[2, 1.11],[3, 1.59]]) for(let j=0;j<7;j++) bag(S1.x-0.08, BF+y+0.0005, S1.z0+0.12+j*0.162, -Math.PI/2, (j+row)%5);
    for(const y of [0.15, 0.63, 1.11]) for(let j=0;j<3;j++) B(0.34, 0.26, 0.34, S2.x, BF+y+0.13+0.0005, S2.z0+0.22+j*0.38, j%2 ? "#c8a878" : "#b8986a");
    B(0.30, 0.10, 0.20, S2.x, BF+1.59+0.05+0.0005, S2.z0+0.3, "#e8e2d4"); C(0.07, 0.18, S2.x, BF+1.59+0.0705, S2.z1-0.35, "#f6f3ec", 18, Math.PI/2); }
  // the steel table where it is bagged: the scale, the sealer, a scoop in a bin of roasted beans, flat bags, a few filled
  { const tx=1438.1, tz=-1181.95, t=BF+0.90;
    B(1.2, 0.03, 0.7, tx, t-0.015, tz, "#c8ccd0"); B(1.16, 0.02, 0.66, tx, BF+0.25, tz, "#b8bcc0");
    for(const dx of [-0.57, 0.57]) for(const dz of [-0.32, 0.32]) B(0.035, 0.885, 0.035, tx+dx, BF+0.4425, tz+dz, "#b8bcc0");
    B(0.30, 0.06, 0.26, tx-0.35, t+0.03, tz, "#2a2a2c"); B(0.22, 0.008, 0.20, tx-0.35, t+0.064, tz, "#9a9ea2"); B(0.10, 0.04, 0.004, tx-0.35, t+0.03, tz+0.131, "#3aff7a");
    B(0.36, 0.08, 0.14, tx+0.17, t+0.04, tz-0.18, "#3a3a3c"); B(0.34, 0.03, 0.02, tx+0.17, t+0.095, tz-0.24, "#c41a1a");
    B(0.40, 0.18, 0.28, tx+0.38, t+0.09, tz+0.12, "#c8ccd0");
    B(0.36, 0.012, 0.24, tx+0.38, t+0.186, tz+0.12, "#4a2a12"); tubeE(V3(tx+0.32, t+0.17, tz+0.08), V3(tx+0.22, t+0.26, tz+0.02), 0.012, "#c8ccd0"); C(0.045, 0.08, tx+0.34, t+0.21, tz+0.10, "#c8ccd0", 12, 0.4);
    B(0.16, 0.027, 0.26, tx-0.11, t+0.0135, tz-0.21, "#b08a5a"); B(0.16, 0.003, 0.26, tx-0.10, t+0.0285, tz-0.20, "#c09a6a", 0.06);
    [-0.32, -0.15, 0.02].forEach((dx, k)=>bag(tx+dx, t, tz+0.24, 0, k));
    addCol(tx-0.6, tx+0.6, tz-0.35, tz+0.35, BF-0.5, t+0.1); }
  // the cupping table: round, six bowls, a spoon at each, a kettle; two stools
  { const ux=1434.65, uz=-1180.75, t=BF+0.92;
    C(0.48, 0.035, ux, t-0.018, uz, "#b8864e", 28); C(0.05, 0.88, ux, BF+0.44, uz, "#2a2a2c", 10); C(0.26, 0.02, ux, BF+0.01, uz, "#2a2a2c", 18);
    for(let k=0;k<6;k++){ const a=k*Math.PI/3; CT(0.045, 0.035, 0.05, ux+Math.cos(a)*0.32, t+0.025, uz+Math.sin(a)*0.32, "#f6f3ec", 14); C(0.04, 0.004, ux+Math.cos(a)*0.32, t+0.048, uz+Math.sin(a)*0.32, "#3a1e0e", 14);
      B(0.012, 0.006, 0.12, ux+Math.cos(a)*0.2, t+0.003, uz+Math.sin(a)*0.2, "#c8ccd0", -a+Math.PI/2); }
    C(0.06, 0.13, ux, t+0.065, uz, "#2a2a2c", 14); tubeE(V3(ux+0.05, t+0.06, uz), V3(ux+0.13, t+0.15, uz), 0.006, "#2a2a2c");
    addCol(ux-0.48, ux+0.48, uz-0.48, uz+0.48, BF-0.5, t);
    for(const [sx, sz] of [[ux+0.72, uz+0.2],[ux+0.5, uz-0.62]]){ C(0.16, 0.04, sx, BF+0.64, sz, "#6b4a2b", 16); for(let k=0;k<3;k++){ const a=k*2.1; tubeE(V3(sx+Math.cos(a)*0.17, BF+0.005, sz+Math.sin(a)*0.17), V3(sx+Math.cos(a)*0.11, BF+0.62, sz+Math.sin(a)*0.11), 0.012, "#2a2a2c"); }
      addCol(sx-0.17, sx+0.17, sz-0.17, sz+0.17, BF-0.5, BF+0.66); addSeat(sx, sz, BF, Math.atan2(ux-sx, uz-sz)+Math.PI, "A STOOL AT THE CUPPING TABLE", false, 0.46); } }
  // the desk by the back wall, the laptop on it with the roast up; the roast log chalked on the wall over it; a radio
  { const dx=1436.65, dz=BZ1-0.3, t=BF+0.75;
    B(1.3, 0.035, 0.58, dx, t-0.0175, dz, "#8a6a48"); for(const sd of [-1,1]) B(0.04, 0.73, 0.54, dx+sd*0.62, BF+0.365, dz, "#6b4a2b");
    B(0.32, 0.015, 0.22, dx-0.2, t+0.0075, dz+0.02, "#3a3a3c");
    const sp=new T.Mesh(new T.BoxGeometry(0.32, 0.21, 0.01), new T.MeshStandardMaterial({color:0x3a3a3c, roughness:0.5})); sp.position.set(dx-0.2, t+0.117, dz+0.156); sp.rotation.x=0.25; scene.add(sp);
    signPanel(0.29, 0.18, signTex(290, 180, (c,W,H)=>{ c.fillStyle="#0e1418"; c.fillRect(0,0,W,H); c.strokeStyle="#e8483a"; c.lineWidth=2; c.beginPath(); for(let i=0;i<=60;i++){ const t2=i/60; c.lineTo(10+t2*(W-20), H-20-(0.15+0.7*Math.pow(t2,0.75))*(H-40)); } c.stroke();
        c.strokeStyle="#4aa8e8"; c.beginPath(); for(let i=0;i<=60;i++){ const t2=i/60; c.lineTo(10+t2*(W-20), H-20-(0.7*Math.exp(-t2*2.2)+0.05)*(H-40)); } c.stroke(); }),
      dx-0.2, t+0.117+0.0027, dz+0.156-0.0107, Math.PI, true, -0.25);
    B(0.16, 0.10, 0.08, dx+0.35, t+0.05, dz-0.05, "#8a3a2a"); C(0.03, 0.01, dx+0.30, t+0.05, dz-0.091, "#c8b890", 12, Math.PI/2);
    if(typeof LAKE_HOUSES!=="undefined") LAKE_HOUSES.radios.push({x:dx+0.35, z:dz-0.05, y:t+0.1, station:0, house:"THE PERKY LOON", zone:"THE ROASTERY", vol:0.4});
    addCol(dx-0.66, dx+0.66, dz-0.3, BZ1, BF-0.5, t);
    bx("paintm", 0.03, 0.84, 1.24, dx, BF+1.62, BZ1-0.02, 0.5, Math.PI/2, "#6b4a2b");
    sign(1.18, 0.78, (c,W,H)=>{ c.fillStyle="#1e2420"; c.fillRect(0,0,W,H); say(c, "ROAST LOG", W/2, H*0.12, W*0.6, H*0.1, "#f4c430", "700", CHALK);
        const L=["MON · LOON ROAST · 4 × 5 KG","TUE · LAKE EFFECT · 3 × 5 KG","WED · SUNRISE · 2 × 5 KG","THU · DECAF DOCK · 2 × 5 KG","FRI · PRESQUE ISLE · 3 × 5 KG","SAT · TOURS AT 10 · CUPPING AT 11"];
        let s=H*0.075; c.font="700 "+s+"px "+CHALK; for(const t2 of L){ while(c.measureText(t2).width>W*0.8 && s>6){ s-=1; c.font="700 "+s+"px "+CHALK; } }
        L.forEach((t2,k)=>say(c, t2, W/2, H*(0.28+k*0.115), W*0.8, s, "#f2efe6", "700", CHALK)); },
      dx, BF+1.62, BZ1-0.046, Math.PI, false, 560); }
  // the house's own: the furnace and its flue, the water heater, the sink, a dehumidifier, the extinguisher by the door
  { B(0.62, 1.45, 0.78, 1440.85, BF+0.725, BZ0+0.44, "#c8c4b8"); B(0.012, 0.5, 0.6, 1440.535, BF+0.5, BZ0+0.44, "#a8a49a"); tubeE(V3(1440.85, BF+1.45, BZ0+0.44), V3(1440.85, BCL-0.02, BZ0+0.44), 0.08, "#9a9ea2");
    addCol(1440.5, BX1, BZ0, BZ0+0.85, BF-0.5, BF+1.5);
    C(0.27, 1.5, 1439.75, BF+0.76, BZ0+0.35, "#e8e4d8", 22); C(0.275, 0.02, 1439.75, BF+1.52, BZ0+0.35, "#c8c4b8", 22); tubeE(V3(1439.75, BF+1.53, BZ0+0.35), V3(1439.75, BCL-0.02, BZ0+0.35), 0.05, "#9a9ea2");
    for(const dx of [-0.10, 0.10]) tubeE(V3(1439.75+dx, BF+1.4, BZ0+0.35), V3(1439.75+dx, BCL-0.02, BZ0+0.35), 0.012, "#c8783a");
    addCol(1439.45, 1440.05, BZ0, BZ0+0.65, BF-0.5, BF+1.55);
    B(0.46, 0.30, 0.50, BX1-0.24, BF+0.88, -1181.2, "#e8e8e4"); B(0.40, 0.02, 0.44, BX1-0.24, BF+1.034, -1181.2, "#9a9ea2");
    for(const dz of [-0.2, 0.2]) B(0.04, 0.73, 0.04, BX1-0.42, BF+0.365, -1181.2+dz, "#b8bcc0"); tubeE(V3(BX1-0.08, BF+1.03, -1181.2), V3(BX1-0.08, BF+1.25, -1181.2), 0.012, "#c8ccd0"); tubeE(V3(BX1-0.08, BF+1.25, -1181.2), V3(BX1-0.2, BF+1.25, -1181.2), 0.012, "#c8ccd0");
    addCol(BX1-0.48, BX1, -1181.45, -1180.95, BF-0.5, BF+1.04);
    B(0.32, 0.55, 0.26, BX1-0.2, BF+0.275, -1182.0, "#f2f0ea"); B(0.24, 0.04, 0.004, BX1-0.2, BF+0.48, -1181.868, "#2a4a44"); addCol(BX1-0.36, BX1, -1182.13, -1181.87, BF-0.5, BF+0.56);
    C(0.075, 0.42, 1438.85, BF+1.05, BZ1-0.09, "#c41a1a", 14); C(0.03, 0.06, 1438.85, BF+1.29, BZ1-0.09, "#2a2a2c", 10); B(0.10, 0.08, 0.03, 1438.85, BF+1.24, BZ1-0.015, "#2a2a2c"); }
  // somebody's coat on a hook by the door, a broom against the wall
  { B(0.04, 0.04, 0.08, 1438.5, BF+1.7, BZ1-0.04, "#2a2a2c"); RB(0.36, 0.7, 0.14, 1438.5, BF+1.32, BZ1-0.10, "#3a5a7a", 0, 0.05);
    tubeE(V3(BX0+0.08, BF+0.02, -1181.9), V3(BX0+0.03, BF+1.3, -1182.05), 0.012, "#c8a878"); B(0.05, 0.12, 0.24, BX0+0.1, BF+0.07, -1181.88, "#c8a050"); }

  // the stair: outside, behind the house, a concrete areaway down along the back wall; thirteen risers from the grass,
  // walls with a pipe rail along them, a concrete apron round its head; a light over the door; the sign by it
  { const SX0=1439.0, SX1=1440.4, LZ=CZ1+1.0, RN=0.27, RS=(Y+0.03-BF)/13, TZ=LZ+12*RN, PT=Y+0.03, AZ=-1174.95, xm=(SX0+SX1)/2;
    bx("concrete", SX1-SX0-0.004, 0.25, LZ-CZ1+0.004, xm, BF-0.125, (CZ1+LZ)/2+0.002, 0.5, 0, "#a8a49a");
    addFlat(SX0, SX1, CZ1-0.01, LZ, BF);
    for(let k=1;k<=12;k++){ const za=LZ+(k-1)*RN, zb=LZ+k*RN+(k===12?0.01:0), y=BF+k*RS;
      bx("concrete", SX1-SX0-0.004, y-(BF-0.1), zb-za, xm, (y+BF-0.1)/2, (za+zb)/2, 0.5, 0, k%2 ? "#b0aca2" : "#aaa69c");
      addFlat(SX0, SX1, za, LZ+k*RN, y); }
    for(const [a,b] of [[SX0-0.2, SX0],[SX1, SX1+0.2]]) bx("concrete", b-a, Y+0.12-(BF-0.3), TZ-(CZ1-0.10), (a+b)/2, (Y+0.12+BF-0.3)/2, (TZ+CZ1-0.10)/2, 0.5, 0, "#b4b0a6");
    bx("concrete", 0.40, PT-(Y-0.25), AZ-CZ1, SX0-0.40/2-0.15, (PT+Y-0.25)/2, (CZ1+AZ)/2, 0.5, 0, "#bab6ac");
    bx("concrete", 0.50, PT-(Y-0.25), AZ-CZ1, SX1+0.15+0.50/2, (PT+Y-0.25)/2, (CZ1+AZ)/2, 0.5, 0, "#bab6ac");
    bx("concrete", SX1-SX0+0.30, PT-(Y-0.25), AZ-TZ, xm, (PT+Y-0.25)/2, (TZ+AZ)/2, 0.5, 0, "#bab6ac");
    addFlat(SX0-0.55, SX0-0.15, CZ1, AZ, PT); addFlat(SX1+0.15, SX1+0.65, CZ1, AZ, PT); addFlat(SX0-0.15, SX1+0.15, TZ, AZ, PT);
    addVoid(SX0, SX1, CZ1, TZ, BF-3, Y+0.6, BF);
    for(const x of [SX0-0.1, SX1+0.1]){ const top=Y+0.12;
      for(const z of [TZ-0.06, (TZ+CZ1)/2, CZ1+0.10]) tubeE(V3(x, top, z), V3(x, top+0.94, z), 0.02, "#1e1e20");
      tubeE(V3(x, top+0.94, TZ-0.06), V3(x, top+0.94, CZ1+0.10), 0.022, "#1e1e20"); tubeE(V3(x, top+0.48, TZ-0.06), V3(x, top+0.48, CZ1+0.10), 0.016, "#1e1e20");
      for(const z of [TZ-0.06, CZ1+0.10]) ent(new T.SphereGeometry(0.022, 8, 6), x, top+0.94, z, "#1e1e20"); }
    addCol(SX0-0.2, SX0, CZ1, TZ, BF-0.5, Y+1.2); addCol(SX1, SX1+0.2, CZ1, TZ, BF-0.5, Y+1.2);
    { const a=V3(SX1-0.06, PT+0.86, TZ+0.05), b=V3(SX1-0.06, BF+0.86, LZ-0.15); tubeE(a, b, 0.019, "#1e1e20");
      for(const t of [0.08, 0.5, 0.92]){ const p=a.clone().lerp(b, t); tubeE(p, V3(SX1-0.004, p.y-0.06, p.z), 0.011, "#1e1e20"); } }
    B(0.12, 0.12, 0.07, xm, BF+2.32, CZ1+0.035, "#2a2a2c"); push("cafe_bulb", new T.SphereGeometry(0.045, 10, 8), xm, BF+2.24, CZ1+0.09, 0, "#ffffff");
    LAMPS.push({x:xm, y:BF+2.1, z:CZ1+0.5, color:0xffd8a0, intensity:0.45, dist:6, decay:1.6, mothy:true});
    B(0.80, 0.012, 0.50, xm, BF+0.006, CZ1+0.35, "#6a5a3a");
    // the sign at the top, on the east side, for anybody coming round the house from the lot
    { const px=SX1+0.75, pz=TZ-0.6; B(0.06, 1.05, 0.06, px, Y+0.525, pz, TRIM); addCol(px-0.04, px+0.04, pz-0.04, pz+0.04, Y-0.5, Y+1.1);
      B(0.04, 0.38, 0.64, px+0.05, Y+1.05, pz, TRIM);
      sign(0.58, 0.32, (c,W,H)=>{ c.fillStyle="#2a4a44"; c.fillRect(0,0,W,H); c.strokeStyle=CORAL; c.lineWidth=5; c.strokeRect(6,6,W-12,H-12);
          const L=["LOON ROASTING CO.","THE ROASTERY · DOWNSTAIRS"], s=Math.min(H*0.18, ...L.map(t2=>{ let q=H*0.18; c.font="800 "+q+"px Arial"; while(c.measureText(t2).width>W*0.78 && q>6){ q-=1; c.font="800 "+q+"px Arial"; } return q; }));
          L.forEach((t2,k)=>say(c, t2, W/2, H*(0.36+k*0.3), W*0.78, s, k ? "#f6efdc" : "#f4c430", "800", "Arial")); },
        px+0.082, Y+1.05, pz, Math.PI/2, false, 300); }
    // stepping stones to it from the lot, round the east side of the house
    for(let k=0;k<9;k++){ const t=k/8, x=lerp(CX1+1.6, SX1+1.2, t), z=lerp(-1183.0, TZ+0.4, t)+Math.sin(k*1.3)*0.15;
      C(0.21+((k*7)%3)*0.02, 0.05, x, Y+0.012, z, k%2 ? "#a8a49a" : "#9a968c", 10); } }

  const labels=new T.Mesh(mergeEntries(LBL), new T.MeshStandardMaterial({map:labelTex, roughness:0.55})); labels.receiveShadow=true; scene.add(labels);
  const stn=new T.Mesh(mergeEntries(STN), new T.MeshStandardMaterial({map:stencil, roughness:0.95, alphaTest:0.4})); scene.add(stn);

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ---- the people: Nana behind the counter, two inside, three out on the patio ---------------------------------------------- */
(function perkyLoonFolk(){
  if(typeof crowdGroup!=="function" || !COFFEE.tables) return;
  const G=crowdGroup("the Perky Loon", 1438, -1186, 150), FF=COFFEE.FF, Y=EDIN.y, q=_trng(5151);
  const pick=a=>a[(q()*a.length)|0];
  const guest=(o)=>Object.assign({h:0.96+q()*0.08, skin:pick(SKINS), hair:pick(HAIRS), shirt:pick(["#2f5f8f","#e8e4d8","#3d6e44","#c99a2a","#7a4f8a","#5d6a73","#d77a3a","#8aa8c8","#e8c8a0","#a83a4a"]),
    pants:pick(PANTS), shoes:pick(["#f2f0ea","#1d1d1f","#6b4a2b"]), long:q()<0.4}, o);
  crowdAdd(G, {look:{h:0.95, female:true, skin:SKINS[2], hair:HAIRS[0], shirt:"#2a4a44", pants:"#1d1f22", shoes:"#1d1d1f", beanie:"#e8705e"}, x:1438.4, z:-1180.85, y:FF, yaw:Math.PI, mode:"stand", job:"pour"});
  // in the armchair with a paperback; at the window bar looking out at the street
  { const [ax, az, ry]=COFFEE.armchair; crowdAdd(G, {look:guest({long:true}), x:ax, z:az, y:FF, yaw:ry, mode:"sit", sitY:0.50, held:"paper", heldL:true}); }
  { const [sx, sz]=COFFEE.stools[0]; crowdAdd(G, {look:guest({}), x:sx, z:sz, y:FF+0.30, yaw:Math.PI, mode:"sit", sitY:0.525, held:"cup", drink:true}); }
  for(const [sx, sz] of COFFEE.stools.slice(1)) addSeat(sx, sz, FF, 0, "A STOOL AT THE WINDOW", false, 0.36);
  // the tables inside, one taken
  COFFEE.tables.forEach((t, i)=>t.seats.forEach(([x, z, ry], j)=>{ if(i===1 && j===0) crowdAdd(G, {look:guest({}), x:x, z:z, y:FF, yaw:ry, mode:"sit", sitY:0.515, held:"cup", drink:true});
    else addSeat(x, z, FF, ry+Math.PI, "A CHAIR AT THE PERKY LOON"); }));
  // at the shelf of beans by the counter, choosing; and downstairs the roaster, watching the beans go round in the tray
  crowdAdd(G, {look:guest({}), x:1440.55, z:-1182.75, y:FF, yaw:Math.PI/2, mode:"stand", sway:0.5});
  if(COFFEE.BF!==undefined) crowdAdd(G, {look:{h:1.0, skin:SKINS[1], hair:HAIRS[2], beard:"#6b4a2b", shirt:"#5a6a4a", pants:"#2c3446", shoes:"#3a2a1c", cap:"#2a4a44", long:true},
    x:1435.95, z:-1182.4, y:COFFEE.BF, yaw:Math.PI, mode:"stand", sway:0.6});
  // the patio: two at the first table, one at the last with the paper
  COFFEE.patio.forEach((t, i)=>t.seats.forEach(([x, z, ry], j)=>{
    if(i===0) crowdAdd(G, {look:guest({}), x:x, z:z, y:Y, yaw:ry, mode:"sit", sitY:0.515, held:"cup", drink:true, dayOnly:true, sway:0.25});
    else if(i===3 && j===1) crowdAdd(G, {look:guest({}), x:x, z:z, y:Y, yaw:ry, mode:"sit", sitY:0.515, held:"paper", heldL:true, dayOnly:true});
    else addSeat(x, z, Y, ry+Math.PI, "A CHAIR ON THE PATIO"); }));
})();
// the steam off the cup on the roof, and the patio's bulbs as the light goes
function updateCoffee(dt, dark){
  const C=COFFEE; if(!C.steam) return;
  const c=camera.position; if(Math.hypot(c.x-1438, c.z+1186)>200) return;
  if(C.bulbs) C.bulbs.color.setHex(0xffd9a0).multiplyScalar(0.72+0.48*smoothstep(0.2, 0.7, dark));
  if(C.neon) C.neon.material.color.setScalar(0.75+0.25*smoothstep(0.1, 0.6, dark));
  if(C.fan) C.fan.rotation.y-=dt*2.6;                                   // (the fan, slow)
  if(C.arm) C.arm.rotation.y+=dt*1.4;                                   // (the cooling tray's arm)
  if(C.stack && typeof PUFFS!=="undefined" && Math.random()<dt*1.6){ const S=C.stack;             // (thin smoke off the roaster's stack)
    PUFFS.emit(S.x+(Math.random()-0.5)*0.1, S.y, S.z+(Math.random()-0.5)*0.1, 0.10, 0.6+Math.random()*0.3, 0.03, 0.22, 1.4, 3.5, 0.16, 0.97, 0); }
  if(typeof PUFFS!=="undefined" && Math.random()<dt*3.5){ const S=C.steam;
    PUFFS.emit(S.x+(Math.random()-0.5)*0.3, S.y, S.z+(Math.random()-0.5)*0.3, 0.08, 0.5+Math.random()*0.25, 0.02, 0.18, 1.1, 3.0, 0.22, 0.97, 0); }
}
