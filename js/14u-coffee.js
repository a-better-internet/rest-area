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
   on the shelf. Nana the barista; somebody in the armchair, somebody at
   the window, people out on the patio.
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
    B(IX1-1436.3, 0.92, 0.588, (1436.3+IX1)/2, FF+0.46, bz-0.006, "#f6f3ec");                 // (its back 6 mm clear of the plaster) B(IX1-1436.3+0.04, 0.04, 0.64, (1436.3+IX1)/2, FF+0.94, bz, "#b8864e");
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
  if(typeof PUFFS!=="undefined" && Math.random()<dt*3.5){ const S=C.steam;
    PUFFS.emit(S.x+(Math.random()-0.5)*0.3, S.y, S.z+(Math.random()-0.5)*0.3, 0.08, 0.5+Math.random()*0.25, 0.02, 0.18, 1.1, 3.0, 0.22, 0.97, 0); }
}
