"use strict";
/* REST AREA · 14k-edinboro.js
   at Edinboro's exit: the fuel stop by the bridge, and a farm, both of
   which you can walk into
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14k · FRENCH CREEK FUEL & MART, AND THE WEIR PLACE

   THE FUEL STOP. North of US 6N where it comes off the bridge (EDIN.station):
   a lot, a canopy over two pump islands, a price sign at the road, and a
   block store with a glass front facing the pumps. Inside: the counter by
   the door with the clerk behind it, the cigarettes and the lottery behind
   him, a roller grill; three aisles of shelving; the cooler wall across the
   back, lit; the coffee bar on the east wall; the ATM, the ice cream chest,
   the restrooms (key at the counter). Open all night, lit all night.

   THE FARM. South of the road (EDIN.farm), up a gravel lane: a white
   two-storey farmhouse with a porch along the front, the living room and
   the kitchen downstairs (the stairs are behind a door; nobody asked you
   up). Across the yard the red bank barn and its two silos, a pole shed
   with the tractor in it, a farm stand at the road on the honour system,
   and the cows out in the pasture behind.
   ---------------------------------------------------------------------- */
const EDIN_PLACES={clerk:null, cows:[]};
// a door frame on a wall along x (frX) or along z (frZ), proud of both faces, head longer and deeper than the posts;
// the posts stand 4 mm into the opening and the head comes 4 mm down into it, so none of their faces lies in the wall's
const frX=(c, t, a, b, y0, head, col)=>{ for(const x of [a-0.031, b+0.031]) bx("paintm", 0.07, head-y0, t+0.12, x, y0+(head-y0)/2, c, 0, 0, col);
  bx("paintm", b-a+0.15, 0.07, t+0.13, (a+b)/2, head+0.031, c, 0, 0, col); };
const frZ=(c, t, a, b, y0, head, col)=>{ for(const z of [a-0.031, b+0.031]) bx("paintm", t+0.12, head-y0, 0.07, c, y0+(head-y0)/2, z, 0, 0, col);
  bx("paintm", t+0.13, 0.07, b-a+0.15, c, head+0.031, (a+b)/2, 0, 0, col); };
// a car parked, its wheels on the pool, its body a collider
const parked=(kind, paint, x, z, yaw, y)=>{ const m=buildVehicleMesh(kind, paint, "#e8e7e2", 0);
  m.g.position.set(x, y+PAVE_T, z); m.g.rotation.y=yaw; scene.add(m.g);
  WHEEL_POOL.register({g:m.g, lod:m.lod, spin:0}, m.spec);
  const S=m.spec, mid=(S.nose+S.tail)/2;
  addColOB(x+Math.sin(yaw)*mid, z+Math.cos(yaw)*mid, yaw, S.hw+0.03, (S.nose-S.tail)/2, y, y+S.ht); return m; };
(function edinboroPlaces(){
  const E=EDIN, Z=E.z, Y=E.y, HW=E.hw, r=_trng(6611);
  const ME=[];                                                     // the small stuff, vertex-coloured, one mesh
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw,rx)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit,rx);
  // paving at the plain's level, laid as tiles the way 08's lots are (one map over a big lot reads as a pattern)
  const pave=(bk, x0,x1,z0,z1, y, color)=>{ const TL=7.4;
    for(let x=x0; x<x1-0.02; x+=TL) for(let z=z0; z<z1-0.02; z+=TL){ const w=Math.min(TL,x1-x), d=Math.min(TL,z1-z); if(w<0.06||d<0.06) continue;
      const g=new T.PlaneGeometry(w,d), U=g.attributes.uv, ou=r()*97, ov=r()*97;
      for(let i=0;i<U.count;i++) U.setXY(i, ou+U.getX(i)*w*0.62, ov+U.getY(i)*d*0.62);
      push(bk, g, x+w/2, y, z+d/2, 0, color, -Math.PI/2, 0); } };

  /* ======================================================================
     THE FUEL STOP
     ====================================================================== */
  const L=E.station, BRZ="#3e332b", GRN="#1f6a4a", CRM="#f2efe6";
  const LY=Y+PAVE_T+0.015;                                         // (a centimetre and a half over US 6N, where it laps onto the road)
  pave("lotpave", L.x0, L.x1, L.z0, L.z1, LY, "#a6a6a3");
  addPaveRect(L.x0, L.x1, L.z0, L.z1, Y);
  addZone(L.x0, L.x1, L.z0, L.z1, Y-2, Y+8, "FRENCH CREEK FUEL");
  // parking lines along the store's front and its east side
  for(let x=-8; x<=L.x1-2; x+=2.8) bx("paint", 0.11, 0.004, 5.2, x, LY+0.008, Z-58.0, 0, 0, "#eceae2");

  /* ---- the store ---- */
  const S={x0:-40, x1:-12, z0:Z-64, z1:Z-50}, WT=0.25, FLS=Y+0.18, CEIL=FLS+3.0, TOPW=FLS+3.9;
  const IX0=S.x0+WT, IX1=S.x1-WT, IZ0=S.z0+WT, IZ1=S.z1-WT;
  const D={a:-27.0, b:-25.0}, GL={sill:FLS+0.45, head:FLS+2.55};
  const front=[{a:IX0+0.45, b:D.a-0.12, sill:GL.sill, head:GL.head}, {a:D.a, b:D.b, sill:FLS-0.004, head:FLS+2.22}, {a:D.b+0.12, b:IX1-0.45, sill:GL.sill, head:GL.head}];
  const REST={a:Z-56.3, b:Z-55.4};                                   // the restrooms' door in the east wall
  // the slab, the walk along the front with its curb
  bx("concrete", S.x1-S.x0+0.02, FLS-Y+0.3, S.z1-S.z0+0.02, (S.x0+S.x1)/2, (FLS+Y-0.3)/2, (S.z0+S.z1)/2, 0.5, 0, "#b3afa6");
  bx("concrete", S.x1-S.x0+4.0, FLS-Y+0.3, 2.6, (S.x0+S.x1)/2, (FLS+Y-0.3)/2-0.004, S.z1+1.3+0.01, 0.6, 0, "#c3c0b8");
  addFlat(S.x0-2.0, S.x1+2.0, S.z0, S.z1+2.61, FLS);
  for(let x=S.x0-1.5; x<S.x1+2; x+=1.5) bx("paint", 0.012, 0.004, 2.56, x, FLS+0.004, S.z1+1.31, 0, 0, "#9c9890");
  // the walls: brick outside, painted block inside; the front a storefront round the doors
  runX("brick", S.z1-WT/2, WT, S.x0, S.x1, Y-0.1, TOPW, front, "#9a5a44", 0.83);
  runX("brick", S.z0+WT/2, WT, S.x0, S.x1, Y-0.1, TOPW, [], "#9a5a44", 0.83);
  runZ("brick", S.x0+WT/2, WT, IZ0, IZ1, Y-0.1, TOPW, [], "#9a5a44", 0.83);
  runZ("brick", S.x1-WT/2, WT, IZ0, IZ1, Y-0.1, TOPW, [{a:REST.a, b:REST.b, sill:FLS-0.004, head:FLS+2.12}], "#9a5a44", 0.83);
  lineX("block", IZ1, -1, IX0, IX1, FLS, CEIL, front, "#e8e4da", 0.6);
  lineX("block", IZ0, 1, IX0, IX1, FLS, CEIL, [], "#e8e4da", 0.6);
  lineZ("block", IX0, 1, IZ0, IZ1, FLS, CEIL, [], "#e8e4da", 0.6);
  lineZ("block", IX1, -1, IZ0, IZ1, FLS, CEIL, [{a:REST.a, b:REST.b, sill:FLS, head:FLS+2.12}], "#e8e4da", 0.6);
  floorAt("quarry", IX0, IX1, IZ0, IZ1, FLS+0.003, "#e6e0d6", 0.7);
  addFlat(IX0, IX1, IZ0, IZ1, FLS);
  ceilAt("plaster", IX0, IX1, IZ0, IZ1, CEIL, "#efede6", 0.5);
  // the roof: a slab inside the parapet, its coping; the band across the front with the name on it
  bx("concrete", IX1-IX0-0.01, 0.20, IZ1-IZ0-0.01, (IX0+IX1)/2, CEIL+0.12, (IZ0+IZ1)/2, 0.5, 0, "#7d7b76");
  for(const [w,d,x,z] of [[S.x1-S.x0+0.10, 0.36, (S.x0+S.x1)/2, S.z0+WT/2],[S.x1-S.x0+0.10, 0.36, (S.x0+S.x1)/2, S.z1-WT/2],
                          [0.36, S.z1-S.z0-0.30, S.x0+WT/2, (S.z0+S.z1)/2],[0.36, S.z1-S.z0-0.30, S.x1-WT/2, (S.z0+S.z1)/2]])
    bx("paintm", w, 0.06, d, x, TOPW+0.03+(w<1?0.006:0), z, 0, 0, "#e8e4da");             // (the sides 6 mm over the ends where they cross)
  B(18.0, 0.95, 0.10, (S.x0+S.x1)/2, FLS+3.32, S.z1+0.05, GRN);
  sign(17.6, 0.80, (c,W,H)=>{ c.fillStyle=GRN; c.fillRect(0,0,W,H); c.fillStyle="#f2c418"; c.fillRect(0,H*0.84,W,H*0.08);
      say(c, "FRENCH CREEK  FUEL · MART", W/2, H*0.44, W*0.84, H*0.56, CRM, "900", "'Arial Black', Arial"); },
    (S.x0+S.x1)/2, FLS+3.34, S.z1+0.106, 0, true, 1760);
  // the storefront glass, its bronze mullions, a sill and head
  for(const [a,b] of [[front[0].a, front[0].b],[front[2].a, front[2].b]]){
    const n=Math.max(1, Math.round((b-a)/1.6));
    for(let k=0;k<n;k++){ const xa=a+(b-a)*k/n, xb=a+(b-a)*(k+1)/n;
      push("glass", planeGeo(xb-xa-0.05, GL.head-GL.sill-0.05, 0), (xa+xb)/2, (GL.sill+GL.head)/2, S.z1-WT/2, 0, "#ffffff"); }
    for(let k=0;k<=n;k++) bx("paintm", 0.05, GL.head-GL.sill-0.006, WT+0.04, a+(b-a)*k/n, (GL.sill+GL.head)/2, S.z1-WT/2, 0, 0, BRZ);
    for(const y of [GL.sill+0.025, GL.head-0.025]) bx("paintm", b-a, 0.05, WT+0.02, (a+b)/2, y, S.z1-WT/2, 0, 0, BRZ);
    addCol(a, b, S.z1-WT, S.z1, GL.sill, GL.head); }
  // the doors: a pair of storefront doors, out to the pumps, and the frame they hang in
  frX(S.z1-WT/2, WT, D.a, D.b, FLS, FLS+2.22, BRZ);
  makeDoor(XF(D.a+0.02, S.z1-WT/2, 0), 0, FLS+0.01, 0, "FUEL & MART", true, 0, "store");
  makeDoor(XF(D.b-0.02, S.z1-WT/2, Math.PI), 0, FLS+0.01, 0, "FUEL & MART", false, 0, "store");
  push("mat", planeGeo(2.2, 1.2, 1.0), (D.a+D.b)/2, FLS+0.008, IZ1-0.75, 0, "#2a2a2a", -Math.PI/2, 0);
  // the hours, the card stickers, on the glass by the door
  sign(0.42, 0.30, (c,W,H)=>{ c.fillStyle="#141414"; c.fillRect(0,0,W,H); say(c,"OPEN",W/2,H*0.30,W*0.6,H*0.30,"#ff3a2a","900","'Arial Black', Arial");
      say(c,"24 HOURS",W/2,H*0.68,W*0.70,H*0.22,CRM,"700","Arial"); }, D.b+0.45, FLS+1.75, S.z1-WT/2-0.012, 0, true, 210);   // inside the glass, read from out

  /* ---- the inside ---- */
  // the light: flat panels in the ceiling, on all night
  for(const x of [-35, -26, -17]) for(const z of [Z-61.5, Z-55.5]){
    B(0.62, 0.05, 1.22, x, CEIL-0.026, z, "#e2e2de");
    push("tube", planeGeo(0.56, 1.16, 0), x, CEIL-0.052, z, 0, "#ffffff", Math.PI/2, 0); }
  for(const [x,z] of [[-33, Z-58],[-20, Z-58]])
    LAMPS.push({x:x, y:CEIL-0.4, z:z, color:0xf2f6ff, intensity:1.0, dist:12, decay:1.2, indoor:true, vol:[IX0-0.2, IX1+0.2, IZ0-0.2, IZ1+0.2, FLS-1, CEIL+0.5]});
  LAMPS.push({x:(D.a+D.b)/2, y:FLS+2.3, z:IZ1-0.6, color:0xf2f6ff, intensity:0.55, dist:9, decay:1.6});      // out through the glass at night
  // the cooler wall across the back: a lit case of drinks behind glass doors
  { const x0=-34.2, x1=-14.0, d=0.95, zf=IZ0+d, nD=Math.round((x1-x0)/0.78), H=2.25;
    // a hollow case: its back, top, bottom and ends, the front open behind the doors
    B(x1-x0+0.06, H+0.52, 0.06, (x0+x1)/2, FLS+(H+0.52)/2, IZ0+0.026, "#2a2c2e");
    B(x1-x0+0.06, 0.12, d-0.06, (x0+x1)/2, FLS+0.06, IZ0+0.056+(d-0.06)/2-0.004, "#2a2c2e");
    B(x1-x0+0.06, 0.40, d-0.06, (x0+x1)/2, FLS+0.12+H+0.20, IZ0+0.056+(d-0.06)/2-0.004, "#2a2c2e");
    for(const xe of [x0-0.01, x1+0.01]) B(0.04, H+0.52, d-0.06, xe, FLS+(H+0.52)/2, IZ0+0.056+(d-0.06)/2-0.004, "#2a2c2e");
    const drinks=signTex(1024,256,(c,W,Hh)=>{ c.fillStyle="#f4f6f8"; c.fillRect(0,0,W,Hh);
      const cols=["#c41a1a","#1f4fd8","#f2c418","#2f9a3c","#e8e4d8","#ff7a1a","#7a2a8a","#141414","#3fc8e8"];
      for(let row=0;row<5;row++){ const y=8+row*50; c.fillStyle="#b9bec2"; c.fillRect(0,y+42,W,4);
        for(let x=4;x<W-10;x+=11){ const k=((x*7+row*13)/11|0)%cols.length; c.fillStyle=cols[k]; c.fillRect(x, y+(row%2?6:2), 8, 38-(row%2?4:0)); c.fillStyle="rgba(255,255,255,0.35)"; c.fillRect(x+1, y+8, 2, 22); } } });
    drinks.wrapS=T.RepeatWrapping; drinks.repeat.set(2,1);
    const m=new T.Mesh(new T.PlaneGeometry(x1-x0-0.04, H-0.10), new T.MeshBasicMaterial({map:drinks, toneMapped:false}));
    m.position.set((x0+x1)/2, FLS+0.12+H/2, zf-0.12); scene.add(m);
    for(let k=0;k<nD;k++){ const xa=x0+(x1-x0)*k/nD, xb=x0+(x1-x0)*(k+1)/nD;
      push("glass", planeGeo(xb-xa-0.06, H-0.12, 0), (xa+xb)/2, FLS+0.12+H/2, zf+0.012, 0, "#ffffff");
      B(0.022, 0.62, 0.035, xb-0.10, FLS+1.15, zf+0.04, "#c9cbcc"); }
    for(let k=0;k<=nD;k++) B(0.045, H, 0.05, x0+(x1-x0)*k/nD, FLS+0.12+H/2, zf+0.004, "#3a3c3e");
    for(const y of [FLS+0.10, FLS+0.12+H+0.01]) B(x1-x0+0.04, 0.05, 0.05, (x0+x1)/2, y, zf+0.004, "#3a3c3e");
    sign(8.0, 0.30, (c,W,Hh)=>{ c.fillStyle="#1f4fd8"; c.fillRect(0,0,W,Hh); say(c, "COLD DRINKS  ·  DAIRY  ·  WATER  ·  ICE", W/2, Hh/2, W*0.84, Hh*0.60, "#ffffff", "800", "Arial"); },
      (x0+x1)/2, FLS+0.12+H+0.20, zf+0.002, 0, true, 1600);
    addCol(x0-0.05, x1+0.05, IZ0, zf+0.06, FLS-0.5, FLS+H+0.4);
    addUse((x0+x1)/2, zf+0.9, FLS, "GRAB A DRINK", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", (x0+x1)/2, zf);
      toast(["A COLD ONE, A SWEAT OF FROST ON IT","CHOCOLATE MILK, THE QUART. NOBODY'S WATCHING","A TALL CAN OF ICED TEA, THE ARIZONA PRICE STILL ON IT"][(Math.random()*3)|0],"#cfe0d4"); }, 2.4); }
  // three aisles of shelving, double-sided, endcaps at the front
  { const pal=["#c41a1a","#f2c418","#1f4fd8","#2f9a3c","#ff7a1a","#7a2a8a","#e8e4d8","#8a5a2a","#3fc8e8","#141414"];
    for(const gx of [-31.2, -26.4, -21.6]){ const z0=Z-61.4, z1=Z-54.4, mz=(z0+z1)/2;
      B(0.62, 0.12, z1-z0, gx, FLS+0.06, mz, "#3a3c3e"); B(0.06, 1.48, z1-z0, gx, FLS+0.74, mz, "#c9cbcc");
      for(const sd of [-1,1]) for(const y of [0.40, 0.75, 1.10, 1.45]){
        B(0.30, 0.02, z1-z0, gx+sd*0.17, FLS+y, mz, "#d8dadc");
        for(let z=z0+0.06; z<z1-0.10;){ const w=0.08+r()*0.14, h=0.12+r()*0.18, c=pal[(r()*pal.length)|0];
          B(0.18+r()*0.06, h, w, gx+sd*0.20, FLS+y+0.015+h/2, z+w/2, c); z+=w+0.012; } }
      // the endcap toward the door: a rack of chips
      B(0.62, 1.30, 0.42, gx, FLS+0.65, z1+0.22, "#c9cbcc");
      for(let k=0;k<4;k++) for(let j=0;j<3;j++) B(0.17, 0.24, 0.05, gx-0.19+j*0.19, FLS+0.42+k*0.27, z1+0.455, pal[(k*3+j+((gx*7)|0))%pal.length]);
      addCol(gx-0.36, gx+0.36, z0, z1+0.46, FLS-0.5, FLS+1.5); }
    addUse(-24.0, Z-57.8, FLS, "LOOK AT THE SNACKS", ()=>toast(["BEEF JERKY, TEN KINDS. THE GOOD KIND IS BEHIND THE COUNTER","CHIPS, THE LOCAL KIND, IN THE YELLOW BAG","MOTOR OIL, WINDSHIELD FLUID, A PHONE CHARGER THAT WON'T"][(Math.random()*3)|0],"#cfe0d4"), 2.2); }
  // the counter by the door: the register, the lottery, a roller grill; the clerk behind it
  { const cx=-35.6, z0=Z-58.4, z1=Z-52.2, cz=(z0+z1)/2;
    B(0.72, 1.00, z1-z0, cx, FLS+0.50, cz, "#5a3a22");
    B(0.80, 0.05, z1-z0+0.10, cx, FLS+1.025, cz, "#d8d4c8");
    B(0.36, 0.30, 0.42, cx-0.05, FLS+1.20, cz+0.6, "#1a1a1c"); B(0.30, 0.20, 0.02, cx+0.055, FLS+1.27, cz+0.6, "#0e2e3a", Math.PI/2);    // the register and its screen
    B(0.12, 0.16, 0.08, cx+0.22, FLS+1.13, cz-0.2, "#2a2a2c");                                                                  // the card reader
    // the roller grill: hot dogs turning under a light, at the counter's far end
    B(0.50, 0.12, 0.70, cx, FLS+1.11, z0+0.6, "#9a9da0"); for(let k=0;k<6;k++) C(0.016, 0.42, cx-0.15+k*0.06, FLS+1.19, z0+0.6, "#b8542a", 10, Math.PI/2);
    B(0.50, 0.04, 0.70, cx, FLS+1.42, z0+0.6, "#c9cbcc"); for(const sz of [-1,1]) B(0.02, 0.26, 0.02, cx+0.22, FLS+1.28, z0+0.6+sz*0.32, "#c9cbcc");
    // the lottery case, the scratch-offs in rolls
    B(0.60, 0.42, 0.20, cx+0.10, FLS+1.26, z1-0.45, "#e8e8f2");
    for(let k=0;k<8;k++) B(0.06, 0.32, 0.012, cx+0.21, FLS+1.26, z1-0.70+k*0.07, ["#f2c418","#c41a1a","#2f9a3c","#1f4fd8"][k%4]);
    // behind it: the back counter, the cigarette wall, a clock
    B(0.60, 0.90, z1-z0+1.2, IX0+0.30, FLS+0.45, cz, "#5a3a22");
    B(0.30, 1.30, z1-z0+0.6, IX0+0.16, FLS+1.75, cz, "#2a2c2e");
    for(let row=0;row<6;row++) for(let k=0;k<22;k++) B(0.02, 0.15, 0.05, IX0+0.33, FLS+1.20+row*0.20, z0+0.10+k*0.27, ["#c41a1a","#e8e4d8","#1f4fd8","#2f7a3c","#f2c418","#141414"][(row+k)%6]);
    sign(1.4, 0.26, (c,W,Hh)=>{ c.fillStyle="#141414"; c.fillRect(0,0,W,Hh); say(c,"WE CARD UNDER 30",W/2,Hh/2,W*0.84,Hh*0.56,"#f2c418","800","Arial"); },
      IX0+0.012, FLS+2.62, cz, Math.PI/2, true, 420);
    addCol(cx-0.40, cx+0.40, z0-0.05, z1+0.05, FLS-0.5, FLS+1.1);
    addCol(IX0, IX0+0.62, z0-0.6, z1+0.6, FLS-0.5, FLS+2.5);
    // the clerk
    const P=randomPerson(r); P.g.position.set(cx-1.85, FLS, cz); P.g.rotation.y=Math.PI/2;
    PEOPLE.push({kind:"stand", mode:"stand", P:P, x:cx-1.85, z:cz, y:FLS, yaw:Math.PI/2, seed:r()*10});
    EDIN_PLACES.clerk=P;
    addUse(cx+0.75, cz+0.6, FLS, "TALK TO THE CLERK", ()=>toast(["“PUMP FOUR'S SLOW. USE TWO”","“COFFEE'S FRESH AT SIX AND AT TWO. IT'S FOUR”","“YOU CAME OFF 79? THE REST AREA'S GOT BETTER BATHROOMS, HONESTLY”","“THE CORN AT THE WEIRS' STAND IS GOOD THIS WEEK”","“FOUR DOLLARS ON PUMP TWO? GO AHEAD”"][(Math.random()*5)|0],"#cfe0d4"), 1.2);
    addUse(cx+0.75, z1-0.45, FLS, "BUY A SCRATCH-OFF", ()=>{ const w=Math.random(); toast(w<0.12?"A WINNER. FIVE DOLLARS. YOU BUY TWO MORE":w<0.2?"FREE TICKET. IT LOSES":"NOTHING. NOTHING. NOT EVEN CLOSE","#f4c430"); }, 0.9); }
  // the coffee bar on the east wall
  { const x=IX1-0.33, z0=Z-62.6, z1=Z-58.8;
    B(0.66, 0.92, z1-z0, x, FLS+0.46, (z0+z1)/2, "#5a3a22"); B(0.70, 0.04, z1-z0+0.04, x, FLS+0.94, (z0+z1)/2, "#d8d4c8");
    for(let k=0;k<3;k++){ const zz=z0+0.55+k*1.1;
      B(0.40, 0.62, 0.36, x+0.08, FLS+1.27, zz, "#1a1a1c"); C(0.075, 0.18, x-0.08, FLS+1.06, zz, "#3a2a1a", 14); C(0.077, 0.02, x-0.08, FLS+1.16, zz, "#141414", 14); }
    for(const [zz,h] of [[z1-0.25,0.42],[z1-0.40,0.36]]) C(0.045, h, x-0.12, FLS+0.96+h/2, zz, "#f2efe6", 12);
    sign(1.6, 0.36, (c,W,Hh)=>{ c.fillStyle="#3a2412"; c.fillRect(0,0,W,Hh); say(c,"FRESH COFFEE",W/2,Hh*0.36,W*0.80,Hh*0.36,CRM,"900","Georgia, serif");
        say(c,"ANY SIZE $1.29",W/2,Hh*0.74,W*0.6,Hh*0.24,"#f2c418","700","Arial"); }, IX1-0.012, FLS+2.15, (z0+z1)/2, -Math.PI/2, false, 480);
    addCol(x-0.35, IX1, z0, z1, FLS-0.5, FLS+1.6);
    addUse(x-0.9, (z0+z1)/2, FLS, "POUR A COFFEE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("pour", x, (z0+z1)/2);
      toast(["THE BIG ONE, BLACK. IT'S BEEN ON THE BURNER A WHILE","FRENCH VANILLA FROM THE MACHINE. IT'S MOSTLY SUGAR","HALF CAF. THE POT'S LABELLED IN MARKER"][(Math.random()*3)|0],"#cfe0d4"); }, 1.2); }
  // the restroom's door (the room itself is below), the ATM, the ice cream chest, a rack of papers by the door
  { const zc=(REST.a+REST.b)/2;
    frZ(IX1+WT/2-0.0, WT, REST.a, REST.b, FLS, FLS+2.12, "#5a5d60");
    sign(0.36, 0.14, (c,W,Hh)=>{ c.fillStyle="#1f4fd8"; c.fillRect(0,0,W,Hh); say(c,"RESTROOMS",W/2,Hh/2,W*0.84,Hh*0.6,"#fff","800","Arial"); }, IX1-0.062, FLS+1.62, zc, -Math.PI/2, false, 180);
    B(0.60, 1.55, 0.50, IX1-0.30, FLS+0.775, Z-52.6, "#3a3c3e"); B(0.02, 0.30, 0.40, IX1-0.61, FLS+1.25, Z-52.6, "#0e2e3a");   // the ATM, its screen to the room
    addCol(IX1-0.60, IX1, Z-52.85, Z-52.35, FLS-0.5, FLS+1.6);
    B(1.10, 0.82, 0.62, -33.2, FLS+0.41, Z-52.0, "#f2f2f0"); push("glass", planeGeo(1.02, 0.54, 0), -33.2, FLS+0.825, Z-52.0, 0, "#ffffff", -Math.PI/2, 0);
    addCol(-33.8, -32.6, Z-52.32, Z-51.68, FLS-0.5, FLS+0.85);
    B(0.50, 1.00, 0.30, D.a-0.9, FLS+0.5, IZ1-0.22, "#1f4fd8"); }

  /* ---- the canopy, the islands, the pumps ---- */
  const CN={x0:-36, x1:-16, z0:Z-38, z1:Z-22}, CY=Y+5.0;
  B(CN.x1-CN.x0, 0.80, CN.z1-CN.z0, (CN.x0+CN.x1)/2, CY+0.40, (CN.z0+CN.z1)/2, "#f2f0ea");
  for(const [w,d,x,z] of [[CN.x1-CN.x0+0.06, 0.02, (CN.x0+CN.x1)/2, CN.z0-0.01],[CN.x1-CN.x0+0.06, 0.02, (CN.x0+CN.x1)/2, CN.z1+0.01],
                          [0.02, CN.z1-CN.z0, CN.x0-0.01, (CN.z0+CN.z1)/2],[0.02, CN.z1-CN.z0, CN.x1+0.01, (CN.z0+CN.z1)/2]]){
    B(w, 0.22, d, x, CY+0.30, z, GRN); B(w, 0.06, d, x, CY+0.58, z, "#f2c418"); }
  sign(6.0, 0.50, (c,W,Hh)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,Hh); say(c,"FRENCH CREEK",W/2,Hh/2,W*0.84,Hh*0.60,GRN,"900","'Arial Black', Arial"); },
    (CN.x0+CN.x1)/2, CY+0.64, CN.z1+0.026, 0, false, 1200);
  ceilAt("plaster", CN.x0, CN.x1, CN.z0, CN.z1, CY-0.002, "#f2f0ea", 0.5);
  for(const x of [-32, -26, -20]) for(const z of [Z-34, Z-26]){ B(0.80, 0.03, 0.80, x, CY-0.017, z, "#e6e6e2"); push("tube", planeGeo(0.72, 0.72, 0), x, CY-0.034, z, 0, "#ffffff", Math.PI/2, 0); }
  for(const [x,z] of [[-30, Z-30],[-22, Z-30]]) LAMPS.push({x:x, y:CY-0.4, z:z, color:0xf4f8ff, intensity:1.3, dist:16, decay:1.3, mothy:true});
  // two islands, two pumps each, a column at each end
  for(const iz of [Z-33.5, Z-26.5]){
    B(7.2, 0.18, 1.2, -26.0, Y+PAVE_T+0.09, iz, "#c3c0b8"); addFlat(-29.6, -22.4, iz-0.6, iz+0.6, Y+PAVE_T+0.18);
    for(const cx of [-29.9, -22.1]){ B(0.42, CY-Y, 0.42, cx, Y+(CY-Y)/2, iz, "#f2f0ea"); addCol(cx-0.22, cx+0.22, iz-0.22, iz+0.22, Y-0.5, CY); }
    for(const bxx of [-29.3, -22.7]){ C(0.08, 1.0, bxx, Y+0.68, iz-0.45, "#f2c418", 12); C(0.08, 1.0, bxx, Y+0.68, iz+0.45, "#f2c418", 12); }
    for(const px of [-28.0, -24.0]){
      B(1.05, 1.80, 0.52, px, Y+0.21+0.90, iz, "#c9cbcc"); B(1.08, 0.38, 0.56, px, Y+0.21+1.62, iz, GRN);   // (the band a centimetre over the body's top)
      for(const sd of [-1,1]){
        sign(0.96, 0.30, (c,W,Hh)=>{ c.fillStyle=GRN; c.fillRect(0,0,W,Hh); say(c,"FRENCH CREEK",W/2,Hh/2,W*0.84,Hh*0.56,CRM,"900","'Arial Black', Arial"); }, px, Y+0.21+1.62, iz+sd*0.285, sd>0?0:Math.PI, false, 300);
        B(0.40, 0.24, 0.02, px-0.15, Y+0.21+1.22, iz+sd*0.27, "#0e2e3a");
        sign(0.30, 0.16, (c,W,Hh)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0,0,W,Hh); say(c,"$ 0.00",W/2,Hh/2,W*0.80,Hh*0.56,"#ff3a2a","700","'Courier New', monospace"); }, px-0.15, Y+0.21+1.22, iz+sd*0.282, sd>0?0:Math.PI, true, 150);
        for(let k=0;k<3;k++){ const nx=px+0.22+k*0.11; B(0.07, 0.20, 0.06, nx, Y+0.21+0.95, iz+sd*0.29, ["#141414","#f2c418","#2f7a3c"][k]);
          tube("rubber", V3(nx, Y+0.21+0.85, iz+sd*0.31), V3(nx+0.05, Y+0.40, iz+sd*0.45), 0.018, 6, "#141414"); } }
      addCol(px-0.55, px+0.55, iz-0.30, iz+0.30, Y-0.5, Y+2.2); }
    addZone(CN.x0, CN.x1, CN.z0, CN.z1, Y-2, CY, "THE PUMPS"); }
  addUse(-26.0, Z-30.0, Y, "PUMP SOME GAS", ()=>toast(["PREPAY INSIDE, IT SAYS. ON A STICKY NOTE. ON EVERY PUMP","THE NOZZLE CLICKS OFF AT NINE-FIFTY. EVERY TIME","YOU DON'T HAVE A CAR HERE. YOU WALKED A MILE FOR THIS"][(Math.random()*3)|0],"#cfe0d4"), 2.0);
  // somebody filling up, and a pickup nosed in by the store
  parked(0, CAR_PAINTS[4%CAR_PAINTS.length], -26.0, Z-30.0, Math.PI/2, LY-PAVE_T);
  parked(2, CAR_PAINTS[1%CAR_PAINTS.length], -6.6, Z-58.0, 0, LY-PAVE_T);
  // ice and propane along the front, an air pump at the lot's corner, a can by each island
  { B(1.40, 1.30, 0.72, D.b+2.4, FLS+0.65, S.z1+0.42, "#f2f2f0"); sign(1.0, 0.36, (c,W,Hh)=>{ c.fillStyle="#1f6ad8"; c.fillRect(0,0,W,Hh); say(c,"ICE",W/2,Hh/2,W*0.6,Hh*0.66,"#fff","900","'Arial Black', Arial"); }, D.b+2.4, FLS+0.98, S.z1+0.786, 0, false, 300);
    addCol(D.b+1.7, D.b+3.1, S.z1+0.06, S.z1+0.78, FLS-0.5, FLS+1.3);
    const px=S.x1-1.4; for(const x of [px-0.7, px+0.7]) for(const z of [S.z1+0.10, S.z1+0.95]) B(0.04, 1.4, 0.04, x, FLS+0.7, z, "#7d8286");
    for(const y of [0.05, 0.7, 1.4]) B(1.44, 0.03, 0.89, px, FLS+y, S.z1+0.525, "#7d8286");
    for(let k=0;k<6;k++) C(0.15, 0.46, px-0.48+(k%3)*0.48, FLS+0.31+((k/3)|0)*0.66, S.z1+0.52, "#e8e8e8", 14);
    addCol(px-0.75, px+0.75, S.z1+0.05, S.z1+1.0, FLS-0.5, FLS+1.45);
    B(0.40, 1.30, 0.30, L.x1-3, Y+0.65, Z-44, "#c41a1a"); addCol(L.x1-3.2, L.x1-2.8, Z-44.15, Z-43.85, Y-0.5, Y+1.3);
    for(const iz of [Z-33.5, Z-26.5]){ swingCan(-26.0, iz, 0, Y+PAVE_T+0.18); } }
  // the price sign at the road, both ways
  { const sx=L.x0+4, sz=Z-9.5, top=Y+7.0;
    for(const dz of [-0.6, 0.6]){ C(0.12, top-Y-1.0, sx, Y+(top-Y-1.0)/2, sz+dz, "#7d8286", 12); addCol(sx-0.14, sx+0.14, sz+dz-0.14, sz+dz+0.14, Y-0.5, top); }
    B(0.36, 2.6, 2.4, sx, top-1.3, sz, "#2a2c2e");
    const face=(c,W,H)=>{ c.fillStyle=GRN; c.fillRect(0,0,W,H*0.30); c.fillStyle="#f2c418"; c.fillRect(0,H*0.29,W,H*0.025);
      say(c,"FRENCH CREEK",W/2,H*0.15,W*0.82,H*0.16,CRM,"900","'Arial Black', Arial");
      c.fillStyle="#f4f2ea"; c.fillRect(0,H*0.315,W,H*0.685);
      [["REGULAR","3.39"],["PLUS","3.59"],["DIESEL","3.89"]].forEach((p,i)=>{ const y=H*(0.43+i*0.20);
        c.fillStyle="#141414"; c.fillRect(W*0.52,y-H*0.075,W*0.40,H*0.15);
        say(c,p[0],W*0.28,y,W*0.38,H*0.10,"#141414","800","Arial");
        say(c,p[1]+"⁹",W*0.72,y,W*0.34,H*0.11,"#ff3a2a","700","'Courier New', monospace"); }); };
    sign(2.3, 2.5, face, sx+0.186, top-1.3, sz, Math.PI/2, true, 460);
    sign(2.3, 2.5, face, sx-0.186, top-1.3, sz, -Math.PI/2, true, 460); }
  /* ---- the restroom: through the grey door by the coffee, a room built on the store's east side.
     Tile to the shoulder, painted block over it, one tube with a bad ballast, and the wall by the
     toilet written on by everybody who ever came off 79 here ---- */
  { const R={x0:S.x1, x1:S.x1+3.4, z0:Z-58.6, z1:Z-53.0}, RW=0.2, RF=FLS+2.5, RT=FLS+3.0;
    const rx0=R.x0, rx1=R.x1-RW, rz0=R.z0+RW, rz1=R.z1-RW, HI={a:-10.9, b:-9.9, sill:FLS+1.85, head:FLS+2.25};
    bx("concrete", R.x1-R.x0+0.015, FLS-Y+0.3, R.z1-R.z0+0.02, (R.x0+R.x1)/2+0.0125, (FLS+Y-0.3)/2-0.003, (R.z0+R.z1)/2, 0.5, 0, "#b3afa6");
    runX("brick", R.z0+RW/2, RW, R.x0, R.x1, Y-0.1, RT, [], "#9a5a44", 0.83);
    runX("brick", R.z1-RW/2, RW, R.x0, R.x1, Y-0.1, RT, [HI], "#9a5a44", 0.83);
    runZ("brick", R.x1-RW/2, RW, rz0, rz1, Y-0.1, RT, [], "#9a5a44", 0.83);
    push("glass", planeGeo(HI.b-HI.a-0.04, HI.head-HI.sill-0.04, 0), (HI.a+HI.b)/2, (HI.sill+HI.head)/2, R.z1-RW/2, 0, "#ffffff");
    B(HI.b-HI.a, 0.03, 0.03, (HI.a+HI.b)/2, (HI.sill+HI.head)/2, R.z1-RW/2+0.03, "#d8d8d4");
    for(const [w,d,x,z] of [[R.x1-R.x0+0.04, 0.26, (R.x0+R.x1)/2, R.z0+RW/2],[R.x1-R.x0+0.04, 0.26, (R.x0+R.x1)/2, R.z1-RW/2],[0.26, R.z1-R.z0-0.2, R.x1-RW/2, (R.z0+R.z1)/2]])
      bx("paintm", w, 0.06, d, x, RT+0.03+(w<1?0.006:0), z, 0, 0, "#e8e4da");
    bx("concrete", rx1-rx0-0.01, 0.20, rz1-rz0-0.01, (rx0+rx1)/2, RF+0.11, (rz0+rz1)/2, 0.5, 0, "#7d7b76");
    // tile to the shoulder, a bullnose along its top, block above
    const TL=FLS+1.25, DR=[{a:REST.a, b:REST.b, sill:FLS, head:FLS+2.12}];
    for(const [bk,y0,y1,col] of [["ytile",FLS,TL,"#d8d2c0"],["block",TL,RF,"#e2ded2"]]){
      lineX(bk, rz0, 1, rx0, rx1, y0, y1, [], col, 0.6); lineX(bk, rz1, -1, rx0, rx1, y0, y1, [HI], col, 0.6);
      lineZ(bk, rx1, -1, rz0, rz1, y0, y1, [], col, 0.6); lineZ(bk, rx0, 1, rz0, rz1, y0, y1, DR, col, 0.6); }
    for(const [w,d,x,z] of [[rx1-rx0-0.02, 0.03, (rx0+rx1)/2, rz0+0.02],[rx1-rx0-0.02, 0.03, (rx0+rx1)/2, rz1-0.02],[0.03, rz1-rz0-0.04, rx1-0.02, (rz0+rz1)/2]]) B(w, 0.04, d, x, TL, z, "#b8b0a0");
    for(const [a,b] of [[rz0+0.04, REST.a-0.08],[REST.b+0.08, rz1-0.04]]) B(0.03, 0.04, b-a, rx0+0.02, TL, (a+b)/2, "#b8b0a0");
    floorAt("quarry", R.x0-0.25, rx1, rz0, rz1, FLS+0.003, "#c8c0b0", 0.7);
    addFlat(R.x0-0.26, rx1, rz0, rz1, FLS);
    ceilAt("plaster", rx0, rx1, rz0, rz1, RF, "#e8e6e0", 0.5);
    // the light: one tube, and it flickers
    B(0.20, 0.06, 1.25, -10.4, RF-0.03, Z-55.8, "#e2e2de"); push("tube", planeGeo(0.14, 1.20, 0), -10.4, RF-0.064, Z-55.8, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:-10.4, y:RF-0.3, z:Z-55.8, color:0xf2f6ee, intensity:0.85, dist:7, decay:1.4, indoor:true, flicker:true, vol:[R.x0-0.25, R.x1, R.z0, R.z1, FLS-0.5, RF]});
    // the toilet against the east wall, a grab bar, the paper; a sign over it nobody reads
    { const zt=Z-57.3;
      B(0.22, 0.40, 0.48, rx1-0.13, FLS+0.62, zt, "#f2f2ee"); B(0.24, 0.04, 0.50, rx1-0.13, FLS+0.84, zt, "#f2f2ee");
      ent(new T.CylinderGeometry(0.20, 0.15, 0.40, 24).scale(1.35, 1, 1), rx1-0.44, FLS+0.20, zt, "#f2f2ee");
      ent(new T.CylinderGeometry(0.21, 0.21, 0.03, 24).scale(1.35, 1, 1), rx1-0.44, FLS+0.42, zt, "#1a1a1a");
      B(0.03, 0.04, 0.06, rx1-0.10, FLS+0.80, zt-0.20, "#c9cbcc");
      tubeE(V3(-10.1, FLS+0.85, rz0+0.06), V3(-9.0, FLS+0.85, rz0+0.06), 0.02, "#c9cbcc");
      for(const x of [-10.1, -9.0]) tubeE(V3(x, FLS+0.85, rz0+0.06), V3(x, FLS+0.85, rz0+0.012), 0.02, "#c9cbcc");
      B(0.16, 0.13, 0.10, -9.45, FLS+0.66, rz0+0.06, "#c9cbcc"); C(0.06, 0.11, -9.45, FLS+0.58, rz0+0.07, "#f4f4f0", 16, 0, 0, Math.PI/2);
      addCol(rx1-0.72, rx1, zt-0.30, zt+0.30, FLS-0.5, FLS+0.85);
      sign(0.36, 0.24, (c,W,Hh)=>{ c.fillStyle="#f4f4f0"; c.fillRect(0,0,W,Hh); c.strokeStyle="#c41a1a"; c.lineWidth=5; c.strokeRect(5,5,W-10,Hh-10);
          say(c,"PLEASE DO NOT",W/2,Hh*0.36,W*0.78,Hh*0.24,"#c41a1a","800","Arial"); say(c,"FLUSH PAPER TOWELS",W/2,Hh*0.66,W*0.78,Hh*0.20,"#141414","700","Arial"); },
        rx1-0.012, FLS+1.62, zt, -Math.PI/2, false, 240); }
    // the sink on the north wall, the mirror over it gone cloudy at the edges, soap, towels, the can
    { const sx=-11.0;
      B(0.50, 0.18, 0.42, sx, FLS+0.80, rz0+0.22, "#f2f2ee"); B(0.36, 0.012, 0.28, sx, FLS+0.895, rz0+0.24, "#a8acae");
      C(0.015, 0.16, sx, FLS+0.97, rz0+0.06, "#c9cbcc", 12); C(0.012, 0.10, sx, FLS+1.04, rz0+0.10, "#c9cbcc", 12, Math.PI/2);
      tubeE(V3(sx, FLS+0.71, rz0+0.20), V3(sx, FLS+0.45, rz0+0.20), 0.02, "#c9cbcc"); tubeE(V3(sx, FLS+0.45, rz0+0.20), V3(sx, FLS+0.45, rz0+0.012), 0.02, "#c9cbcc");
      B(0.52, 0.70, 0.02, sx, FLS+1.62, rz0+0.022, "#8a8d90"); push("glass", planeGeo(0.46, 0.64, 0), sx, FLS+1.62, rz0+0.038, 0, "#ffffff");
      B(0.10, 0.18, 0.09, sx+0.40, FLS+1.15, rz0+0.06, "#e8e8e4"); B(0.30, 0.38, 0.12, sx+0.85, FLS+1.35, rz0+0.07, "#c9cbcc"); B(0.20, 0.02, 0.02, sx+0.85, FLS+1.18, rz0+0.12, "#f4f4f0");
      C(0.20, 0.55, sx+0.65, FLS+0.28, rz0+0.30, "#5a5d60", 22); addCol(sx+0.44, sx+0.86, rz0, rz0+0.52, FLS-0.5, FLS+0.6);
      addCol(sx-0.27, sx+0.27, rz0, rz0+0.45, FLS-0.5, FLS+0.9);
      sign(0.40, 0.16, (c,W,Hh)=>{ c.fillStyle="#1f4fd8"; c.fillRect(0,0,W,Hh); say(c,"EMPLOYEES MUST",W/2,Hh*0.34,W*0.80,Hh*0.26,"#fff","800","Arial"); say(c,"WASH HANDS",W/2,Hh*0.68,W*0.80,Hh*0.26,"#fff","800","Arial"); },
        sx, FLS+2.12, rz0+0.014, 0, false, 240);
      addUse(sx, rz0+0.9, FLS, "WASH YOUR HANDS", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("pour", sx, rz0);
        toast(["THE COLD SIDE IS HOT AND THE HOT SIDE IS OFF","THE SOAP IS PINK AND SMELLS LIKE A BUBBLEGUM MACHINE","NO TOWELS. YOU USE YOUR JEANS LIKE EVERYBODY ELSE"][(Math.random()*3)|0],"#cfe0d4"); }, 1.0); }
    // the hand dryer, a fold-up changing table, a mop and its bucket in the corner, the drain
    B(0.26, 0.24, 0.16, -11.3, FLS+1.15, rz1-0.09, "#c9cbcc"); C(0.03, 0.06, -11.3, FLS+1.00, rz1-0.12, "#8a8d90", 12);
    addUse(-11.3, rz1-0.8, FLS, "THE HAND DRYER", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("dryer", -11.3, rz1);
      toast(["IT RUNS FOR FORTY SECONDS AND YOUR HANDS ARE WETTER","IT SOUNDS LIKE A JAKE BRAKE","SOMEBODY SCRATCHED “PUSH BUTTON RECEIVE NOTHING” ON IT"][(Math.random()*3)|0],"#cfe0d4"); }, 0.9);
    B(0.12, 0.55, 0.85, rx1-0.07, FLS+1.10, Z-54.6, "#8a8d90"); addCol(rx1-0.14, rx1, Z-55.05, Z-54.15, FLS+0.8, FLS+1.4);
    C(0.17, 0.30, rx1-0.30, FLS+0.16, rz1-0.32, "#f2c418", 20); tubeE(V3(rx1-0.30, FLS+0.20, rz1-0.32), V3(rx1-0.42, FLS+1.35, rz1-0.24), 0.014, "#c8a86a");
    addCol(rx1-0.50, rx1, rz1-0.52, rz1, FLS-0.5, FLS+0.5);
    C(0.07, 0.006, -10.4, FLS+0.011, Z-56.2, "#3a3a3a", 16);
    // the wall by the toilet, written on
    { const t=signTex(512,384,(c,W,Hh)=>{ c.clearRect(0,0,W,Hh);
        const tag=(s,x,y,w,h,col,font,rot)=>{ c.save(); c.translate(x,y); c.rotate(rot||0); c.fillStyle=col; fitText(c,s,w,h,0,0,"700",font); c.restore(); };
        tag("DALE WAS HERE", W*0.30, Hh*0.18, W*0.40, Hh*0.12, "#1a1a1a", "'Comic Sans MS', cursive", -0.08);
        tag("KC + JM", W*0.72, Hh*0.26, W*0.26, Hh*0.12, "#c41a1a", "'Brush Script MT', cursive", 0.05);
        tag("GO STEELERS", W*0.40, Hh*0.48, W*0.42, Hh*0.12, "#1a1a1a", "Impact, sans-serif", 0.03);
        tag("FOR A GOOD TIME TRY THE REST AREA ON 79", W*0.50, Hh*0.70, W*0.72, Hh*0.08, "#2a3a8a", "Arial", -0.02);
        tag("EDINBORO '09", W*0.76, Hh*0.86, W*0.30, Hh*0.10, "#3a3a3a", "Georgia, serif", 0.06);
        c.strokeStyle="#c41a1a"; c.lineWidth=3; c.beginPath(); c.arc(W*0.72, Hh*0.26, Hh*0.12, 0, 7); c.stroke(); });
      const m=new T.Mesh(new T.PlaneGeometry(1.4, 1.05), new T.MeshStandardMaterial({map:t, transparent:true, roughness:0.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      m.position.set(rx1-0.014, FLS+1.85, Z-56.6); m.rotation.y=-Math.PI/2; scene.add(m);
      addUse(rx1-0.8, Z-56.4, FLS, "READ THE WALL", ()=>toast(["UNDER “DALE WAS HERE” SOMEBODY ADDED “DALE OWES ME 5 BUCKS”","A PHONE NUMBER, CROSSED OUT, AND “DON'T CALL IT” UNDER IT","“PITT 21 PSU 17”. NOBODY HAS DISPUTED IT"][(Math.random()*3)|0],"#cfe0d4"), 0.9); }
    makeDoor(XF(S.x1-WT/2, REST.a+0.02, -Math.PI/2), 0, FLS+0.01, 0, "RESTROOM", false, 0, "closet", 0x8a8d90);
    addZone(R.x0-0.25, R.x1, R.z0, R.z1, FLS-0.5, RF, "THE RESTROOM", true); }

  /* ---- the fountain and the slushies, on a counter between the coffee and the restroom's door ---- */
  { const x=IX1-0.33, z0=Z-58.62, z1=Z-56.62, zc=(z0+z1)/2;
    B(0.66, 0.92, z1-z0, x, FLS+0.46, zc, "#5a3a22"); B(0.70, 0.04, z1-z0+0.04, x, FLS+0.94, zc, "#d8d4c8");
    // the fountain: a lit header, six valves over the drip tray, the ice lever
    const fz=Z-58.0, fx=IX1-0.30;
    B(0.55, 0.78, 0.80, fx, FLS+1.355, fz, "#2a2c2e"); B(0.12, 0.04, 0.72, fx-0.33, FLS+0.985, fz, "#8a8d90");
    for(let k=0;k<6;k++){ const vz=fz-0.30+k*0.12; B(0.06, 0.08, 0.07, fx-0.30, FLS+1.22, vz, "#c9cbcc"); B(0.02, 0.10, 0.05, fx-0.345, FLS+1.13, vz, "#5a5d60");
      B(0.006, 0.08, 0.09, fx-0.278, FLS+1.36, vz, ["#c41a1a","#1f4fd8","#2f9a3c","#f2c418","#141414","#ff7a1a"][k]); }
    sign(0.76, 0.20, (c,W,Hh)=>{ c.fillStyle="#c41a1a"; c.fillRect(0,0,W,Hh); say(c,"FOUNTAIN DRINKS",W/2,Hh/2,W*0.84,Hh*0.56,"#fff","900","'Arial Black', Arial"); }, fx-0.282, FLS+1.62, fz, -Math.PI/2, true, 380);
    // the slushie machine: two bowls turning, blue raspberry and cherry
    const sz=Z-57.0;
    B(0.45, 0.30, 0.56, fx, FLS+1.11, sz, "#c9cbcc");
    for(const [dz,col] of [[-0.13,"#2a7ae8"],[0.13,"#e83a3a"]]){ C(0.12, 0.40, fx-0.02, FLS+1.465, sz+dz, col, 24); ent(new T.SphereGeometry(0.12, 20, 10, 0, Math.PI*2, 0, Math.PI/2), fx-0.02, FLS+1.665, sz+dz, col);
      B(0.06, 0.06, 0.06, fx-0.23, FLS+1.20, sz+dz, "#1a1a1c"); }
    sign(0.50, 0.14, (c,W,Hh)=>{ c.fillStyle="#141414"; c.fillRect(0,0,W,Hh); say(c,"SLUSH  99¢",W/2,Hh/2,W*0.82,Hh*0.60,"#3fc8e8","900","'Arial Black', Arial"); }, fx-0.231, FLS+1.88, sz, -Math.PI/2, true, 250);
    B(0.04, 0.18, 0.50, fx-0.20, FLS+1.88, sz, "#2a2c2e");
    // cups, lids, straws at the front edge
    for(let k=0;k<3;k++) C(0.045+k*0.01, 0.30, x-0.20, FLS+1.11, z1-0.18-k*0.15, "#f2efe6", 16);
    B(0.16, 0.10, 0.12, x-0.20, FLS+1.01, z1-0.66, "#e8e8e4"); B(0.06, 0.20, 0.06, x-0.20, FLS+1.06, z1-0.82, "#d8d4c8");
    addCol(x-0.35, IX1, z0, z1, FLS-0.5, FLS+1.9);
    addUse(x-0.9, sz, FLS, "GET A SLUSHIE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("pour", fx, sz);
      toast(["HALF BLUE, HALF RED. YOUR TONGUE IS PURPLE FOR AN HOUR","THE BLUE ONE. BRAIN FREEZE ON THE FIRST PULL","THE CHERRY'S STILL THAWING. YOU GET A CUP OF RED SYRUP"][(Math.random()*3)|0],"#cfe0d4"); }, 1.0); }

  /* ---- on the counter: a case of donuts by the register; a candy rack along the front ---- */
  { const cx=-35.6, z0=Z-58.4, z1=Z-52.2, cz=(z0+z1)/2, zD=Z-56.6, ty=FLS+1.05;
    B(0.50, 0.04, 0.60, cx+0.05, ty+0.02, zD, "#3a3a3c");
    const glz=(w,h,x,y,z,ry,rx)=>push("glass", planeGeo(w, h, 0), x, y, z, ry, "#ffffff", rx||0, 0);
    glz(0.60, 0.30, cx+0.30, ty+0.19, zD, Math.PI/2); glz(0.60, 0.30, cx-0.20, ty+0.19, zD, -Math.PI/2);
    glz(0.50, 0.30, cx+0.05, ty+0.19, zD+0.30, 0); glz(0.50, 0.30, cx+0.05, ty+0.19, zD-0.30, Math.PI); glz(0.50, 0.60, cx+0.05, ty+0.34, zD, 0, -Math.PI/2);
    for(const [x,z] of [[cx+0.30,zD-0.30],[cx+0.30,zD+0.30],[cx-0.20,zD-0.30],[cx-0.20,zD+0.30]]) B(0.016, 0.29, 0.016, x, ty+0.185, z, "#3a3a3c");
    for(let k=0;k<8;k++) ent(new T.TorusGeometry(0.048, 0.022, 10, 20), cx-0.07+(k%2)*0.20, ty+0.067, zD-0.21+((k/2)|0)*0.14, ["#e8c890","#5a3018","#f0a0b8","#e8c890"][k%4], Math.PI/2, 0, 0);
    // the candy rack hung on the counter's customer side
    B(0.12, 0.62, 2.6, cx+0.43, FLS+0.42, cz-0.6, "#c9cbcc");
    const cand=["#c41a1a","#f2c418","#5a3018","#1f4fd8","#ff7a1a","#2f9a3c","#e8e4d8","#7a2a8a"];
    for(let row=0;row<4;row++) for(let k=0;k<18;k++) B(0.03, 0.10, 0.12, cx+0.505, FLS+0.20+row*0.14, cz-1.82+k*0.14, cand[(k*3+row*5)%cand.length]);
    addCol(cx+0.36, cx+0.53, cz-1.92, cz+0.72, FLS-0.5, FLS+0.75); }

  /* ---- along the front, inside: a magazine rack under the glass; a camera, a mirror, a wet floor sign ---- */
  { const pal=["#c41a1a","#1f4fd8","#f2c418","#2f9a3c","#e8e4d8","#7a2a8a","#141414","#ff7a1a"];
    B(1.60, 1.10, 0.30, -31.2, FLS+0.55, IZ1-0.17, "#c9cbcc");
    for(let row=0;row<3;row++){ B(1.56, 0.02, 0.08, -31.2, FLS+0.30+row*0.32, IZ1-0.36, "#b9bbbc");
      for(let k=0;k<7;k++) B(0.20, 0.27, 0.012, -31.86+k*0.22, FLS+0.45+row*0.32, IZ1-0.33, pal[(k+row*3)%pal.length]); }
    addCol(-32.05, -30.35, IZ1-0.40, IZ1, FLS-0.5, FLS+1.1);
    sign(0.80, 0.18, (c,W,Hh)=>{ c.fillStyle="#141414"; c.fillRect(0,0,W,Hh); say(c,"SMILE · YOU'RE ON CAMERA",W/2,Hh/2,W*0.84,Hh*0.56,"#f2c418","800","Arial"); },
      D.a-0.9, FLS+2.78, IZ1-0.014, Math.PI, false, 400);
    ent(new T.SphereGeometry(0.09, 18, 10, 0, Math.PI*2, 0, Math.PI/2), -26.0, CEIL-0.006, Z-57.5, "#1a1a1c", Math.PI, 0, 0);
    { const d=V3(1,-0.5,1).normalize(), p=V3(IX0+0.32, CEIL-0.45, IZ0+0.32);
      ME.push({geo:new T.SphereGeometry(0.26, 24, 10, 0, Math.PI*2, 0, Math.PI*0.32), matrix:new T.Matrix4().compose(p, new T.Quaternion().setFromUnitVectors(V3(0,1,0), d), V3(1,1,1)), color:new T.Color("#c8ccd0")});
      tubeE(V3(IX0+0.02, CEIL-0.40, IZ0+0.02), V3(IX0+0.28, CEIL-0.44, IZ0+0.28), 0.012, "#3a3a3c"); }
    { const wx=-22.9, wz=Z-56.0;
      for(const t of [-1,1]) ent(boxGeo(0.32, 0.62, 0.012), wx, FLS+0.315, wz+t*0.07, "#f2c418", -t*0.22, 0, 0);       // (leaning together at the top)
      sign(0.24, 0.14, (c,W,Hh)=>{ c.fillStyle="#f2c418"; c.fillRect(0,0,W,Hh); say(c,"CAUTION",W/2,Hh*0.34,W*0.80,Hh*0.28,"#141414","900","Arial"); say(c,"WET FLOOR",W/2,Hh*0.70,W*0.80,Hh*0.24,"#141414","800","Arial"); },
        wx, FLS+0.40, wz-0.063, Math.PI, false, 160, -0.22);
      addCol(wx-0.18, wx+0.18, wz-0.18, wz+0.18, FLS-0.5, FLS+0.6); } }

  /* ---- out front: a bench, the papers, pumpkins on bales for October, firewood and bait by the ice ---- */
  { const fz=S.z1;
    { const bx2=-36.6, bz=fz+0.55;
      for(let k=0;k<3;k++) B(1.80, 0.03, 0.10, bx2, FLS+0.45, bz-0.13+k*0.13, "#8a6a48");
      for(let k=0;k<2;k++) B(1.80, 0.10, 0.03, bx2, FLS+0.62+k*0.14, bz+0.25, "#8a6a48");
      for(const dx of [-0.80,0.80]){ B(0.05, 0.44, 0.40, bx2+dx, FLS+0.22, bz, "#2a2a2c"); B(0.05, 0.40, 0.05, bx2+dx, FLS+0.64, bz+0.25, "#2a2a2c"); }
      addSeat(bx2, bz, FLS, Math.PI, "THE BENCH"); addCol(bx2-0.92, bx2+0.92, bz-0.22, bz+0.30, FLS-0.5, FLS+0.6); }
    for(const [x,col,name] of [[-35.1,"#1f4fd8","ERIE TIMES-NEWS"],[-34.55,"#f2c418","MEADVILLE TRIBUNE"]]){
      B(0.10, 0.48, 0.10, x, FLS+0.24, fz+0.35, "#3a3a3c"); B(0.44, 0.55, 0.40, x, FLS+0.755, fz+0.35, col);
      B(0.30, 0.16, 0.012, x, FLS+0.84, fz+0.556, "#a8b8c0");
      sign(0.38, 0.10, (c,W,Hh)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,Hh); say(c,name,W/2,Hh/2,W*0.84,Hh*0.56,"#141414","900","Georgia, serif"); }, x, FLS+0.96, fz+0.556, 0, false, 200); }
    addCol(-35.35, -34.30, fz+0.13, fz+0.57, FLS-0.5, FLS+1.05);
    // two bales, pumpkins on them and in front, mums in pots, a sign on a stake
    for(const bxx of [-30.6, -29.5]){ B(1.0, 0.42, 0.48, bxx, FLS+0.215, fz+0.48, "#c4ac64");
      for(const y of [0.12, 0.30]) B(1.01, 0.012, 0.485, bxx, FLS+y, fz+0.48, "#8a744a"); }
    for(const [x,y,z,s,col] of [[-30.9,0.43,0.45,0.17,"#e07a1a"],[-30.4,0.43,0.52,0.13,"#d86a12"],[-29.7,0.43,0.42,0.20,"#e8841e"],[-29.2,0.43,0.55,0.11,"#f0f0e0"],
                                 [-31.4,0.0,0.85,0.19,"#e07a1a"],[-30.8,0.0,0.98,0.14,"#c86a1a"],[-28.9,0.0,0.90,0.16,"#e8841e"]]){
      ent(new T.SphereGeometry(s, 20, 14).scale(1, 0.78, 1), x, FLS+y+s*0.78+0.004, fz+z, col); C(0.016, 0.06, x, FLS+y+s*1.56+0.03, fz+z, "#4a5a2a", 8); }
    for(const [x,col] of [[-29.95,"#c84a7a"],[-28.4,"#e8b82a"]]){ C(0.16, 0.20, x, FLS+0.10, fz+0.95, "#7a4a2a", 18); ent(new T.SphereGeometry(0.21, 16, 10).scale(1, 0.7, 1), x, FLS+0.27, fz+0.95, col); }
    C(0.015, 0.90, -28.6, FLS+0.45, fz+0.40, "#8a6a48", 8);
    sign(0.40, 0.22, (c,W,Hh)=>{ c.fillStyle="#f4ecd8"; c.fillRect(0,0,W,Hh); say(c,"PUMPKINS",W/2,Hh*0.36,W*0.80,Hh*0.30,"#c86a12","900","Georgia, serif"); say(c,"$5 · ANY SIZE",W/2,Hh*0.72,W*0.76,Hh*0.22,"#3a2a1a","700","Arial"); },
      -28.6, FLS+0.98, fz+0.416, 0, false, 200);
    addCol(-31.65, -28.15, fz+0.20, fz+1.20, FLS-0.5, FLS+0.8);
    // firewood, shrink-wrapped, and the state's word on moving it; the bait cooler
    { const wx=-19.9; for(const dx of [-0.66,0.66]) B(0.05, 1.10, 0.50, wx+dx, FLS+0.55, fz+0.40, "#3a3a3c"); for(const y of [0.06, 0.55]) B(1.36, 0.04, 0.50, wx, FLS+y, fz+0.40, "#3a3a3c");
      for(let k=0;k<6;k++) B(0.38, 0.40, 0.40, wx-0.42+(k%3)*0.42, FLS+0.285+((k/3)|0)*0.49, fz+0.40, "#9a7a52");
      sign(1.20, 0.30, (c,W,Hh)=>{ c.fillStyle="#2f5a2a"; c.fillRect(0,0,W,Hh); say(c,"FIREWOOD $6",W/2,Hh*0.36,W*0.82,Hh*0.34,"#f4ecd8","900","'Arial Black', Arial");
          say(c,"BUY IT WHERE YOU BURN IT",W/2,Hh*0.74,W*0.80,Hh*0.22,"#f2c418","700","Arial"); }, wx, FLS+1.27, fz+0.40, 0, false, 480);
      addCol(wx-0.72, wx+0.72, fz+0.13, fz+0.67, FLS-0.5, FLS+1.15); }
    { const bx2=-17.8; B(0.95, 0.80, 0.60, bx2, FLS+0.40, fz+0.40, "#f2f2f0"); B(0.97, 0.06, 0.62, bx2, FLS+0.83, fz+0.40, "#2f6aa8");
      sign(0.80, 0.30, (c,W,Hh)=>{ c.fillStyle="#2f6aa8"; c.fillRect(0,0,W,Hh); say(c,"LIVE BAIT",W/2,Hh*0.38,W*0.80,Hh*0.36,"#fff","900","'Arial Black', Arial");
          say(c,"NIGHTCRAWLERS · MINNOWS",W/2,Hh*0.76,W*0.80,Hh*0.20,"#f2c418","700","Arial"); }, bx2, FLS+0.48, fz+0.706, 0, false, 400);
      addCol(bx2-0.50, bx2+0.50, fz+0.08, fz+0.72, FLS-0.5, FLS+0.9);
      addUse(bx2, fz+1.4, FLS, "LOOK IN THE BAIT COOLER", ()=>toast(["NIGHTCRAWLERS, A DOZEN TO A TUB. FRENCH CREEK'S RUNNING HIGH","STYROFOAM CUPS OF DIRT. ONE IS LABELLED “DALE — DO NOT SELL”","THE MINNOW TANK HUMS. ONE FISH IS CLEARLY IN CHARGE"][(Math.random()*3)|0],"#cfe0d4"), 1.0); }
    // the decals in the glass, read from outside
    for(const [x,top,sub,bg,fg] of [[-37.02,"PA LOTTERY","PLAY HERE","#1f4fd8","#f2c418"],[-32.46,"WE ACCEPT","EBT · WIC","#f4f2ea","#1f6a4a"],
                                     [-21.08,"ATM","INSIDE","#2f9a3c","#ffffff"],[-15.0,"ICE · BAIT","PROPANE","#c41a1a","#ffffff"]])
      sign(0.56, 0.36, (c,W,Hh)=>{ c.fillStyle=bg; c.fillRect(0,0,W,Hh); say(c,top,W/2,Hh*0.38,W*0.80,Hh*0.34,fg,"900","'Arial Black', Arial"); say(c,sub,W/2,Hh*0.74,W*0.74,Hh*0.22,fg,"700","Arial"); },
        x, FLS+1.95, S.z1-WT/2-0.012, 0, false, 280);
    // at each island: a squeegee in its bucket, the towel box on the column
    for(const iz of [Z-33.5, Z-26.5]) for(const [bxx,cx,sd] of [[-29.0,-29.9,1],[-23.0,-22.1,-1]]){
      C(0.13, 0.30, bxx, Y+PAVE_T+0.18+0.155, iz, "#2a6ac8", 20); tubeE(V3(bxx, Y+PAVE_T+0.30, iz), V3(bxx-sd*0.04, Y+PAVE_T+0.95, iz+0.05), 0.012, "#3a3a3c");
      B(0.12, 0.05, 0.30, bxx-sd*0.06, Y+PAVE_T+0.97, iz+0.06, "#1a1a1c");
      B(0.07, 0.40, 0.28, cx+sd*0.245, Y+1.30, iz, "#c9cbcc"); }
    // the dumpster enclosure at the lot's back corner: block on three sides, the can, the cardboard bin, bags
    { const ex0=1.0, ex1=6.2, ez0=Z-65.7, ez1=Z-61.4, EH=Y+1.9;
      for(const [x0,x1,z0,z1] of [[ex0,ex1,ez0,ez0+0.2],[ex0,ex0+0.2,ez0+0.2,ez1],[ex1-0.2,ex1,ez0+0.2,ez1]]){
        wallBox("block", x0, x1, z0, z1, Y-0.1, EH, "#b8b4aa", 0.6, Y);
        bx("concrete", x1-x0+(x1-x0>1?0.10:0.06), 0.06, z1-z0+0.06, (x0+x1)/2, EH+0.03+(x1-x0>1?0.006:0), (z0+z1)/2, 0.5, 0, "#c8c4ba"); }
      const dy=LY;
      B(1.90, 1.10, 1.25, 2.6, dy+0.66, Z-64.7, "#2f5a3a"); for(const dx of [-0.92,0.92]) B(0.06, 0.12, 1.10, 2.6+dx, dy+0.80, Z-64.7, "#264a30");
      for(const dx of [-0.48,0.48]) ent(boxGeo(0.94, 0.04, 1.34), 2.6+dx, dy+1.25, Z-64.72, "#1a1a1c", -0.10, 0, 0);
      for(const [dx,dz] of [[-0.8,-0.5],[0.8,-0.5],[-0.8,0.5],[0.8,0.5]]) C(0.05, 0.07, 2.6+dx, dy+0.055, Z-64.7+dz, "#2a2a2a", 14, 0, 0, Math.PI/2);
      B(1.20, 1.25, 1.00, 4.9, dy+0.63, Z-64.9, "#2a4a8a");
      sign(0.80, 0.22, (c,W,Hh)=>{ c.fillStyle="#2a4a8a"; c.fillRect(0,0,W,Hh); say(c,"CARDBOARD ONLY",W/2,Hh/2,W*0.84,Hh*0.56,"#ffffff","900","Arial"); }, 4.9, dy+0.95, Z-64.394, 0, false, 320);
      for(const [x,z,s] of [[3.9,Z-63.4,0.26],[4.3,Z-63.2,0.22],[1.6,Z-62.6,0.24]]) ent(new T.SphereGeometry(s, 16, 12).scale(1, 0.8, 1), x, dy+s*0.8+0.004, z, "#1a1a1c");
      addCol(1.6, 3.6, Z-65.35, Z-64.05, Y-0.5, Y+1.4); addCol(4.25, 5.55, Z-65.45, Z-64.35, Y-0.5, Y+1.3); } }

  // the store's zone
  addZone(IX0, IX1, IZ0, IZ1, FLS-0.5, CEIL, "FRENCH CREEK FUEL · MART", true);
  EDIN_PLACES.store={x0:IX0, x1:IX1, z0:IZ0, z1:IZ1, y:FLS, door:(D.a+D.b)/2, zf:S.z1};

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ======================================================================
   THE FARM
   ====================================================================== */
// the Holstein hide: white with black patches, ragged at the edges, tiling both ways; a short coat over it.
// The square in the top-left corner is kept white for the plain parts (14k's cow), which take its uv
const COW_HIDE=(function(){
  const S=512, c=cvs(S,S), x=c.getContext("2d"), r=_trng(4409);
  x.fillStyle="#f2f0eb"; x.fillRect(0,0,S,S);
  x.fillStyle="#161517";
  const blob=(cx,cy,R,ph)=>{ x.beginPath();
    for(let i=0;i<=48;i++){ const a=i/48*Math.PI*2, k=1+0.24*Math.sin(a*3+ph[0])+0.13*Math.sin(a*5+ph[1])+0.06*Math.sin(a*11+ph[2]);
      const px=cx+Math.cos(a)*R*k*1.2, py=cy+Math.sin(a)*R*k; i?x.lineTo(px,py):x.moveTo(px,py); }
    x.closePath(); x.fill(); };
  // (toroidal distance to the white corner's centre, so the wrapped copies keep off it too)
  const td=(ax,ay)=>{ let dx=Math.abs(ax-40)%S, dy=Math.abs(ay-40)%S; dx=Math.min(dx,S-dx); dy=Math.min(dy,S-dy); return Math.hypot(dx,dy); };
  let n=0;
  for(let k=0;k<200 && n<12;k++){ const cx=r()*S, cy=r()*S, R=S*(0.06+r()*0.10);
    if(td(cx,cy)<R*1.55+60) continue; n++;
    const ph=[r()*6.3, r()*6.3, r()*6.3];
    for(const dx of [-S,0,S]) for(const dy of [-S,0,S]) blob(cx+dx, cy+dy, R, ph); }
  // the coat: short strokes, lighter and darker, every way but mostly down the hide
  for(let k=0;k<14000;k++){ const px=r()*S, py=r()*S, a=1.57+(r()-0.5)*0.8, L=2+r()*4;
    x.strokeStyle=r()<0.5 ? "rgba(255,255,255,0.10)" : "rgba(60,50,40,0.10)"; x.lineWidth=1;
    x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*L, py+Math.sin(a)*L); x.stroke(); }
  x.fillStyle="#f2f0eb"; x.fillRect(4,4,56,56);
  const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=MAXANISO; return t;
})();
const COW_MAT=new T.MeshStandardMaterial({map:COW_HIDE, vertexColors:true, roughness:0.85});
(function weirPlace(){
  const E=EDIN, Z=E.z, Y=E.y, r=_trng(7723);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const slab=(bk, pts, t, color)=>push(bk, new FaceGeo().slab(pts, t, 0.5).geo(), 0,0,0, 0, color);
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s; addCol(x-rr, x+rr, z-rr, z+rr, Y-0.5, Y+6); };
  /* a Holstein. The hide is a tiling texture (COW_HIDE, below) laid over lofted shapes: the barrel of the
     body from the pin bones to the brisket, with the hooks standing out at the hips and the spine narrowing
     to a ridge; legs jointed at the elbow and knee, the stifle and the hock, white below the knee, on dark
     cloven hooves; the udder, the tail hanging to the hocks with its switch. The neck and head are a group of
     their own that dips as she grazes, the tail another that swishes. Each cow takes the hide at its own
     offset, so no two are marked alike. pose: "graze" (head to the grass), "stand", "manger" (in a stanchion) */
  const cow=(x, z, ry, graze, y, sway, sc, pose)=>{ const s=sc||1, gy=y===undefined?Y:y, g=new T.Group(); g.position.set(x, gy, z); g.rotation.y=ry; g.scale.set(s,s,s); scene.add(g);
    pose=pose||(graze ? "graze" : "stand");
    const uo=r(), vo=r(), WUV=[0.06, 0.94];                           // (WUV: the hide's white corner, for the plain parts)
    const body=[], head=[], tail=[];
    // a tube through centres C with half widths a (sideways) and b (the other way) at each, its rings square to it
    const tube=(L, C, A, Bb, seg, col, uv, shape)=>{
      const n=C.length, P=[], U=[], CO=[], I=[], cc=new T.Color(col);
      let sAcc=0;
      for(let i=0;i<n;i++){
        if(i) sAcc+=C[i].distanceTo(C[i-1]);
        const t=new T.Vector3().subVectors(C[Math.min(n-1,i+1)], C[Math.max(0,i-1)]).normalize();
        const ref=Math.abs(t.y)>0.9 ? V3(0,0,1) : V3(0,1,0);
        const sd=new T.Vector3().crossVectors(t, ref).normalize(), up=new T.Vector3().crossVectors(sd, t).normalize();
        for(let j=0;j<=seg;j++){ const th=j/seg*Math.PI*2, f=shape ? shape(th, i/(n-1)) : [Math.cos(th), Math.sin(th)];
          const p=C[i].clone().addScaledVector(sd, f[0]*A[i]).addScaledVector(up, f[1]*Bb[i]);
          P.push(p.x, p.y, p.z); CO.push(cc.r, cc.g, cc.b);
          if(uv) U.push(uv[0]+j/seg*uv[2], uv[1]+sAcc/1.9); else U.push(WUV[0], WUV[1]); } }
      for(let i=0;i<n-1;i++) for(let j=0;j<seg;j++){ const a=i*(seg+1)+j, b=a+1, c=a+seg+2, d=a+seg+1; I.push(a,d,b, b,d,c); }
      const gm=new T.BufferGeometry(); gm.setAttribute("position", new T.Float32BufferAttribute(P,3));
      gm.setAttribute("uv", new T.Float32BufferAttribute(U,2)); gm.setAttribute("color", new T.Float32BufferAttribute(CO,3));
      gm.setIndex(I); gm.computeVertexNormals(); L.push({geo:gm, matrix:new T.Matrix4(), color:null}); };
    // a plain shape (hooves, udder, eyes, the switch) in a flat colour off the hide's white corner
    const plain=(L, geo, px, py, pz, c, rx, rz)=>{ const u=geo.attributes.uv; for(let i=0;i<u.count;i++) u.setXY(i, WUV[0], WUV[1]);
      L.push({geo:geo, matrix:new T.Matrix4().compose(V3(px,py,pz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,rz||0)), V3(1,1,1)), color:new T.Color(c)}); };
    const W="#f3f1ec", HOOF="#2c2824", PINK="#e3ada0";
    // the barrel: [z, top, bottom, half width] from the pins to the brisket
    // (closed at both ends: the first and last sections come to nothing, at the pin bones and inside the neck)
    const top=crv([[-0.975,1.24],[-0.95,1.30],[-0.90,1.40],[-0.78,1.45],[-0.60,1.47],[-0.35,1.44],[-0.05,1.43],[0.25,1.44],[0.48,1.49],[0.66,1.45],[0.80,1.34],[0.90,1.20],[0.96,1.10],[0.985,1.07]]);
    const bot=crv([[-0.975,1.20],[-0.95,1.08],[-0.90,0.94],[-0.78,0.81],[-0.60,0.70],[-0.35,0.63],[-0.05,0.59],[0.25,0.61],[0.48,0.67],[0.66,0.75],[0.80,0.86],[0.90,0.97],[0.96,1.03],[0.985,1.06]]);
    const wid=crv([[-0.975,0.004],[-0.95,0.05],[-0.90,0.15],[-0.78,0.22],[-0.60,0.28],[-0.35,0.31],[-0.05,0.33],[0.25,0.32],[0.48,0.28],[0.66,0.24],[0.80,0.19],[0.90,0.12],[0.96,0.04],[0.985,0.004]]);
    { const C=[], A=[], Bb=[], zs=[-0.975];
      for(let zz=-0.96; zz<0.96; zz+=0.06) zs.push(zz);
      zs.push(0.96, 0.985);
      for(const zz of zs){ C.push(V3(0, (top(zz)+bot(zz))/2, zz)); A.push(wid(zz)); Bb.push((top(zz)-bot(zz))/2); }
      // the section: a rounded box, the back narrowing to the spine, the hooks and pins standing out at the top corners
      const hipK=zz=>0.07*Math.exp(-Math.pow((zz+0.62)/0.10,2))+0.035*Math.exp(-Math.pow((zz+0.88)/0.05,2));
      const shape=(th, f)=>{ const zz=zs[Math.round(f*(zs.length-1))], c=Math.cos(th), sn=Math.sin(th);
        let px=Math.sign(c)*Math.pow(Math.abs(c), 2/2.5), py=Math.sign(sn)*Math.pow(Math.abs(sn), 2/2.5);
        if(py>0) px*=1-0.32*Math.pow(py,3); else px*=1-0.06*Math.abs(py);
        const w=wid(zz); px+=Math.sign(c)*hipK(zz)/Math.max(0.05,w)*Math.exp(-Math.pow((py-0.80)/0.13,2));
        return [px, py]; };
      // (the tube's side axis is to the cow's left as it runs nose-ward, so the seam and the hide's u start on her right)
      tube(body, C, A, Bb, 28, W, [uo, vo, 1], shape); }
    // the legs: patched above the knee and the hock, white below, each segment over-lapping the next
    for(const sd of [-1,1]){
      const fr=[[0.19,1.00,0.52,0.09,0.15],[0.18,0.75,0.50,0.08,0.11],[0.17,0.46,0.53,0.056,0.062]];
      const fl=[[0.17,0.50,0.53,0.052,0.058],[0.17,0.44,0.53,0.055,0.060],[0.17,0.13,0.55,0.040,0.045],[0.17,0.075,0.57,0.046,0.052]];
      const hr=[[0.22,1.06,-0.62,0.11,0.21],[0.22,0.80,-0.56,0.095,0.15],[0.19,0.52,-0.76,0.055,0.07]];
      const hl=[[0.19,0.56,-0.75,0.050,0.062],[0.19,0.50,-0.76,0.054,0.066],[0.18,0.13,-0.66,0.040,0.045],[0.18,0.075,-0.63,0.046,0.052]];
      for(const [Lg, uvOn] of [[fr,true],[fl,false],[hr,true],[hl,false]])
        tube(body, Lg.map(q=>V3(sd*q[0], q[1], q[2])), Lg.map(q=>q[3]), Lg.map(q=>q[4]), 10, W, uvOn ? [uo+0.3+sd*0.2, vo+0.4, 0.22] : null);
      for(const hz of [0.585, -0.615]){
        plain(body, new T.CylinderGeometry(0.048, 0.064, 0.08, 12), sd*(hz>0?0.17:0.18), 0.04, hz, HOOF);
        plain(body, new T.BoxGeometry(0.008, 0.06, 0.05), sd*(hz>0?0.17:0.18), 0.035, hz+0.045, "#141210"); }    // the cleft, in front
    }
    // the udder and its four teats, between the hind legs
    plain(body, new T.SphereGeometry(1, 16, 12).scale(0.17, 0.13, 0.23), 0, 0.66, -0.43, PINK);
    for(const tx of [-0.065, 0.065]) for(const tz of [-0.34, -0.50]) plain(body, new T.CylinderGeometry(0.016, 0.019, 0.075, 8), tx, 0.525, tz, "#d99a8e");
    // the neck and head, in a group pivoting at the withers
    const ph=new T.Group(); ph.position.set(0, 1.18, 0.62); g.add(ph);
    const NK={graze:[[0,0,0],[0,-0.30,0.34],[0,-0.66,0.52]], stand:[[0,0,0],[0,0.06,0.33],[0,0.14,0.55]], manger:[[0,0,0],[0,-0.10,0.32],[0,-0.22,0.50]]}[pose];
    const HD={graze:[0.25,-1.0], stand:[0.62,-0.78], manger:[0.30,-0.95]}[pose];      // the face's direction (z, y) from the poll
    { const C=NK.map(q=>V3(q[0],q[1],q[2])), poll=C[2];
      // the neck, deep with the dewlap under it
      tube(head, [V3(0,0.02,-0.12), C[0], C[1], poll], [0.17, 0.155, 0.115, 0.085], [0.27, 0.25, 0.18, 0.12], 16, W, [uo+0.5, vo+0.6, 0.6],
           (th)=>{ const sn=Math.sin(th); return [Math.cos(th), sn<0 ? sn*1.25 : sn]; });
      // the head: forehead to muzzle, wide across the eyes, narrow at the face, the muzzle flaring
      const hd=V3(0, HD[1], HD[0]).normalize(), hp=[0, 0.07, 0.17, 0.30, 0.42, 0.47].map(t=>poll.clone().addScaledVector(hd, t));
      tube(head, hp, [0.075, 0.105, 0.095, 0.072, 0.080, 0.05], [0.09, 0.10, 0.085, 0.07, 0.068, 0.04], 14, W, [uo+0.15, vo+0.2, 0.35]);
      // the nose pad, the nostrils
      const nz=poll.clone().addScaledVector(hd, 0.465);
      plain(head, new T.SphereGeometry(1, 12, 8).scale(0.075, 0.05, 0.05), nz.x, nz.y, nz.z, "#8e6c66", Math.atan2(hd.y, hd.z)+Math.PI/2);
      // the eyes, either side of the forehead; the ears out level from the poll, a little back
      const fe=poll.clone().addScaledVector(hd, 0.11), fu=new T.Vector3(0, hd.z, -hd.y);   // fu: up the face
      for(const sd of [-1,1]){
        plain(head, new T.SphereGeometry(0.022, 8, 6), fe.x+sd*0.098, fe.y+fu.y*0.02, fe.z+fu.z*0.02, "#141210");
        plain(head, new T.SphereGeometry(1, 10, 6).scale(0.11, 0.022, 0.055), poll.x+sd*0.15, poll.y+fu.y*0.02, poll.z+fu.z*0.02-0.03, r()<0.7?"#1c1b1d":W, 0, sd*0.25); }
    }
    // the tail from its head, hanging down the rump, the switch at its end; it swishes from the tailhead
    const pt=new T.Group(); pt.position.set(0, 1.36, -0.93); g.add(pt);
    tube(tail, [V3(0,0.02,0.02), V3(0,0.05,-0.04), V3(0,-0.10,-0.08), V3(0,-0.40,-0.07), V3(0,-0.68,-0.05), V3(0,-0.86,-0.04)],
         [0.04,0.035,0.028,0.022,0.018,0.016], [0.04,0.035,0.028,0.022,0.018,0.016], 8, W, [uo+0.8, vo, 0.1]);
    plain(tail, new T.SphereGeometry(1, 10, 8).scale(0.032, 0.11, 0.032), 0, -0.93, -0.04, r()<0.5?"#e8e4da":"#1c1b1d");
    const mk=(L, parent)=>{ const m=new T.Mesh(mergeEntries(L), COW_MAT); m.castShadow=true; m.receiveShadow=true; parent.add(m); };
    mk(body, g); mk(head, ph); mk(tail, pt);
    addColOB(x, z, ry, 0.42*s, 1.05*s, gy-0.5, gy+1.5*s);
    EDIN_PLACES.cows.push({g:g, head:ph, tail:pt, x:x, z:z, ry:ry, t:r()*10, sway:sway===undefined?0.25:sway, pose:pose}); };

  /* ---- the lane, the yard ---- */
  const LX=150, YARD={x0:138, x1:202, z0:Z+44, z1:Z+74};
  { const P=[]; for(let z=Z+E.hw-0.2; z<=YARD.z0+2.01; z+=2) P.push({x:LX, z:z, y:Y}); P.forEach((q,i)=>q.s=i*2);
    const g=ribbonGeo(P, -1.8, 1.8, 0.04, 0.5); g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x,-c.y,-c.z);
    push("gravelbed", g, c.x, c.y, c.z, 0, "#a29d92");
    const g2=new T.PlaneGeometry(YARD.x1-YARD.x0, YARD.z1-YARD.z0), U=g2.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*(YARD.x1-YARD.x0)*0.5, U.getY(k)*(YARD.z1-YARD.z0)*0.5);
    push("gravelbed", g2, (YARD.x0+YARD.x1)/2, Y+0.032, (YARD.z0+YARD.z1)/2, 0, "#a29d92", -Math.PI/2, 0); }
  // a spur off the lane west to the house, where the pickup lives, and stepping stones up to the porch
  { const x0=119.0, x1=LX-1.75, z0=Z+24.6, z1=Z+27.4, g=new T.PlaneGeometry(x1-x0, z1-z0), U=g.attributes.uv;
    for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*(x1-x0)*0.5, U.getY(k)*(z1-z0)*0.5);
    push("gravelbed", g, (x0+x1)/2, Y+0.033, (z0+z1)/2, 0, "#a29d92", -Math.PI/2, 0);
    for(let k=0;k<5;k++) C(0.30+r()*0.06, 0.06, 123.5+(r()-0.5)*0.3, Y+0.02, Z+27.95+k*0.62, "#9a968c", 9, 0, r()*3, 0);
    parked(2, "#6a2a22", 133.5, Z+26.0, Math.PI/2, Y+0.005); }
  addZone(E.farm.x0, E.farm.x1, E.farm.z0, E.farm.z1, Y-2, Y+14, "THE WEIR PLACE");
  // the mailbox at the end of the lane, and the farm stand by the road
  { const mx=LX-2.6, mz=Z+E.hw+1.6;
    B(0.10, 1.10, 0.10, mx, Y+0.55, mz, "#6d5c48"); B(0.24, 0.22, 0.48, mx, Y+1.21, mz, "#2a2a2c");
    C(0.12, 0.48, mx, Y+1.32, mz, "#2a2a2c", 12, Math.PI/2); B(0.02, 0.14, 0.04, mx+0.13, Y+1.36, mz+0.12, "#c41a1a");
    sign(0.36, 0.10, (c,W,H)=>{ c.fillStyle="#f2efe6"; c.fillRect(0,0,W,H); say(c,"WEIR · 11400",W/2,H/2,W*0.84,H*0.6,"#141414","800","Arial"); }, mx-0.126, Y+1.24, mz, -Math.PI/2, false, 180);
    addCol(mx-0.13, mx+0.13, mz-0.26, mz+0.26, Y-0.5, Y+1.4);
    const sx=LX+9, sz=Z+E.hw+3.6;
    for(const [dx,dz] of [[-1.3,-0.8],[1.3,-0.8],[-1.3,0.8],[1.3,0.8]]) B(0.10, 2.2, 0.10, sx+dx, Y+1.1, sz+dz, "#7a6448");
    slab("roofmetal", [V3(sx-1.6,Y+2.35,sz-1.15), V3(sx+1.6,Y+2.35,sz-1.15), V3(sx+1.6,Y+2.10,sz+1.15), V3(sx-1.6,Y+2.10,sz+1.15)], 0.04, "#7a7e80");
    B(2.7, 0.06, 1.0, sx, Y+0.86, sz-0.30, "#8a7050"); for(const dx of [-1.25,1.25]) B(0.08, 0.86, 0.9, sx+dx, Y+0.43, sz-0.30, "#7a6448");
    for(let k=0;k<3;k++){ B(0.62, 0.22, 0.42, sx-0.85+k*0.85, Y+1.005, sz-0.30, "#9a7a52");
      for(let j=0;j<5;j++) ent(new T.CylinderGeometry(0.03,0.026,0.24,8), sx-1.05+k*0.85+j*0.09, Y+1.13, sz-0.30+(j%2?0.07:-0.07), "#5a7a2a", Math.PI/2, 0, 0.3); }
    B(0.20, 0.14, 0.16, sx+1.05, Y+0.96, sz-0.62, "#3a3a3c");
    sign(1.8, 0.50, (c,W,H)=>{ c.fillStyle="#f4f0e2"; c.fillRect(0,0,W,H); c.strokeStyle="#2a6a2a"; c.lineWidth=6; c.strokeRect(5,5,W-10,H-10);
        say(c,"SWEET CORN  $5 DOZ",W/2,H*0.38,W*0.80,H*0.32,"#2a6a2a","900","Georgia, serif");
        say(c,"HONOR SYSTEM · MONEY IN THE BOX",W/2,H*0.74,W*0.80,H*0.20,"#5a3a22","700","Arial"); }, sx, Y+1.80, sz-1.208, Math.PI, false, 540);
    B(1.9, 0.56, 0.04, sx, Y+1.80, sz-1.17, "#8a7050");
    addCol(sx-1.4, sx+1.4, sz-1.0, sz+1.0, Y-0.5, Y+1.0);
    addUse(sx, sz-1.9, Y, "TAKE SOME CORN", ()=>toast(["A DOZEN EARS, FIVE DOLLARS IN THE BOX. IT'S PICKED THIS MORNING","SOMEBODY LEFT AN IOU IN THE BOX: “DALE — OWE U 5”","THE BOX IS A COFFEE CAN WITH A SLOT CUT IN THE LID"][(Math.random()*3)|0],"#cfe0d4"), 1.4); }

  /* ---- the farmhouse ----
     An I-house, the way they were built round here: two storeys, sixteen
     metres by ten and a half, a hall through the middle front to back with
     the stair up its east side, the parlour west of the hall and the kitchen
     east of it. Upstairs, off the upper hall: the front bedroom and the kids'
     room on the west, the sewing room at the front east, the bath at the
     back, and a storeroom through the sewing room.
       walls     x 116..132, z Z+34..Z+44.4; the hall's walls at x 122.6 and 125.4
       stair     x 124.36..125.32, first riser at Z+35.5, fifteen risers up to the floor at Z+39.28
       upstairs  the cross wall at Z+39.16; the bath x 125.46..128.6 behind it, the storeroom east of that */
  const H={x0:116.0, x1:132.0, z0:Z+34.0, z1:Z+44.4}, WT=0.2, FF=Y+0.65, CL=FF+2.55, FF2=FF+2.80, UC=FF2+2.40, EAV=FF+5.32, RID=FF+7.6;
  const IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT, WHT="#f2f0ea", TRM="#e8e6de", SHUT="#2f4a3a", PLS="#e6e0d0";
  const HW=[122.6, 125.4], HT=0.12, ZM=Z+39.16, BW=128.66, PIN=0.012;      // the hall's walls, the cross wall upstairs, the bath's east wall; liners off thin walls
  const ST={x0:124.36, x1:125.32, z0:Z+35.5, n:15, run:0.27}; ST.rise=(FF2-FF)/ST.n; ST.z1=ST.z0+(ST.n-1)*ST.run;
  const win=(a,b)=>({a:a, b:b, sill:FF+0.80, head:FF+2.10});
  const up=(a,b,s,h)=>({a:a, b:b, sill:FF2+(s||0.78), head:FF2+(h||2.05)});
  const FDOOR={a:123.05, b:123.97, sill:FF-0.03, head:FF+2.52}, BDOOR={a:127.0, b:127.92, sill:FF-0.03, head:FF+2.12};     // (the front one with its transom)
  const FRONT=[win(117.6,118.8), win(120.3,121.5), FDOOR, win(126.8,128.0), win(129.6,130.8),
               up(117.6,118.8), up(120.3,121.5), up(123.1,124.1), up(126.8,128.0), up(129.6,130.8)];
  const BACK =[win(118.6,119.8), win(120.6,121.8), win(123.1,124.1), BDOOR,
               up(117.8,119.0), up(120.4,121.6), up(123.1,124.1), up(126.6,127.5,1.10,2.0), up(129.8,131.0)];
  const WEST =[win(Z+40.8,Z+42.0), up(Z+36.0,Z+37.2), up(Z+41.0,Z+42.2)];
  const EAST =[{a:Z+35.6, b:Z+36.8, sill:FF+1.06, head:FF+2.10}, {a:Z+38.2, b:Z+39.4, sill:FF+1.06, head:FF+2.10}, up(Z+36.0,Z+37.2), up(Z+41.0,Z+42.2)];   // (the two downstairs clear the counter)
  // the papers and the floors: their own maps, tiled, each in its own bucket
  const tileTex=(W,Hh,draw)=>{ const t=signTex(W,Hh,draw); t.wrapS=t.wrapT=T.RepeatWrapping; return t; };
  const paper=(name, bg, draw)=>bucketOf(name, ()=>new T.MeshStandardMaterial({map:tileTex(128,128,(c,W,Hh)=>{ c.fillStyle=bg; c.fillRect(0,0,W,Hh); draw(c,W,Hh); }), roughness:0.9}));
  paper("fh_rose", "#e8dcc4", (c,W,Hh)=>{ c.fillStyle="rgba(150,120,90,0.22)"; for(let x=0;x<W;x+=16) c.fillRect(x,0,1,Hh);
    for(const [x,y] of [[32,32],[96,96]]){ c.fillStyle="#7a9a6a"; c.beginPath(); c.ellipse(x+9,y+5,6,3,0.6,0,7); c.fill(); c.beginPath(); c.ellipse(x-9,y+5,6,3,-0.6,0,7); c.fill();
      c.fillStyle="#b86a6a"; c.beginPath(); c.arc(x,y,7,0,7); c.fill(); c.fillStyle="#d89a8a"; c.beginPath(); c.arc(x-2,y-2,3,0,7); c.fill(); } });
  paper("fh_stripe", "#dfe6ea", (c,W,Hh)=>{ for(let x=0;x<W;x+=32){ c.fillStyle="#9ab4c8"; c.fillRect(x,0,10,Hh); c.fillStyle="#c8d6e0"; c.fillRect(x+16,0,3,Hh); } });
  paper("fh_kids", "#f2ead2", (c,W,Hh)=>{ c.fillStyle="#d8a24a"; for(let y=16;y<Hh;y+=64) for(const x0 of [16, 80]){ const x=x0+((y/64)%2)*32;
    c.beginPath(); for(let k=0;k<10;k++){ const a=k*Math.PI/5-Math.PI/2, rr=k%2?3.5:8; c.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } c.fill(); }
    c.fillStyle="#7aa0c8"; for(let y=48;y<Hh;y+=64) for(const x of [48, 112]){ c.beginPath(); c.arc(x,y,4,0,7); c.fill(); } });
  paper("fh_sage", "#c8cfb4", (c,W,Hh)=>{ c.fillStyle="rgba(255,255,255,0.18)"; for(let y=0;y<Hh;y+=32) for(let x=(y/32%2)*16;x<W;x+=32){ c.beginPath(); c.moveTo(x,y+6); c.lineTo(x+6,y); c.lineTo(x+12,y+6); c.lineTo(x+6,y+12); c.fill(); } });
  bucketOf("fh_floor", ()=>new T.MeshStandardMaterial({map:tileTex(128,256,(c,W,Hh)=>{ for(let k=0;k<4;k++){ const g=c.createLinearGradient(k*32,0,k*32+32,0), b=96+((k*37)%30);
      g.addColorStop(0,"rgb("+(b+60)+","+(b+18)+","+(b-30)+")"); g.addColorStop(1,"rgb("+(b+48)+","+(b+8)+","+(b-38)+")"); c.fillStyle=g; c.fillRect(k*32,0,32,Hh);
      c.strokeStyle="rgba(60,36,16,0.18)"; for(let j=0;j<5;j++){ c.beginPath(); c.moveTo(k*32+4+j*5, 0); c.bezierCurveTo(k*32+8+j*5, Hh*0.3, k*32+j*5, Hh*0.6, k*32+5+j*5, Hh); c.stroke(); }
      c.fillStyle="rgba(40,24,10,0.55)"; c.fillRect(k*32,0,1,Hh); c.fillRect(k*32, (k*97)%Hh, 32, 1); } }), roughness:0.55}));
  bucketOf("fh_check", ()=>new T.MeshStandardMaterial({map:tileTex(64,64,(c,W,Hh)=>{ c.fillStyle="#f0eee8"; c.fillRect(0,0,W,Hh); c.fillStyle="#1e1e20"; c.fillRect(0,0,32,32); c.fillRect(32,32,32,32); }), roughness:0.35}));
  bucketOf("fh_lino", ()=>new T.MeshStandardMaterial({map:tileTex(128,128,(c,W,Hh)=>{ c.fillStyle="#d8ccb0"; c.fillRect(0,0,W,Hh); c.fillStyle="#b8a882";
      for(let i=0;i<4;i++) for(let j=0;j<4;j++) if((i+j)%2) c.fillRect(i*32+2,j*32+2,28,28);
      const q=_trng(31); c.fillStyle="rgba(0,0,0,0.06)"; for(let k=0;k<300;k++) c.fillRect(q()*W, q()*Hh, 2, 2); }), roughness:0.5}));

  // the clapboard: painted wood, twelve-centimetre courses each lapped over the one under it, a shadow along
  // every lap; the grain under the paint, the butt joints staggered, the paint worn thin to grey here and there
  bucketOf("fh_clap", ()=>new T.MeshStandardMaterial({map:tileTex(256,256,(c,W,Hh)=>{ const q=_trng(919);
      c.fillStyle="#f3f1ea"; c.fillRect(0,0,W,Hh);
      for(let k=0;k<16;k++){ const y=k*16, g=c.createLinearGradient(0,y,0,y+16);
        g.addColorStop(0,"rgba(55,50,42,0.42)"); g.addColorStop(0.18,"rgba(55,50,42,0.10)"); g.addColorStop(0.55,"rgba(255,255,255,0)");
        g.addColorStop(0.90,"rgba(255,255,255,0.12)"); g.addColorStop(1,"rgba(40,36,30,0.26)"); c.fillStyle=g; c.fillRect(0,y,W,16);
        for(let j=0;j<6;j++){ const yy=y+3+q()*11; c.strokeStyle="rgba(120,110,95,0.10)"; c.lineWidth=1; c.beginPath(); c.moveTo(0,yy); c.lineTo(W,yy+(q()-0.5)*2); c.stroke(); }
        for(let j=0;j<2;j++){ c.fillStyle="rgba(50,45,38,0.35)"; c.fillRect((k*97+j*131)%W, y+2, 1, 13); } }
      for(let k=0;k<90;k++){ c.fillStyle=q()<0.6 ? "rgba(150,140,125,0.22)" : "rgba(105,96,84,0.20)"; c.fillRect(q()*W, q()*Hh, 2+q()*7, 1+q()*2); } }), roughness:0.82}));
  // the foundation: fieldstone laid up in courses, grey mortar, each stone its own shade
  bucketOf("fh_stone", ()=>new T.MeshStandardMaterial({map:tileTex(256,256,(c,W,Hh)=>{ const q=_trng(4243);
      c.fillStyle="#77726a"; c.fillRect(0,0,W,Hh);
      for(let row=0;row<6;row++){ let x=q()*20; const y0=row*Hh/6;
        while(x<W){ const w=24+q()*40, h=Hh/6-5-q()*6, cx=x+w/2, cy=y0+Hh/12+(q()-0.5)*4, t=q(), ph=q()*9;
          for(const ox of [-W, 0, W]){
            c.fillStyle="rgb("+(118+t*52|0)+","+(110+t*46|0)+","+(96+t*38|0)+")"; c.beginPath();
            for(let i=0;i<12;i++){ const a=i/12*Math.PI*2, rr=1+0.10*Math.sin(a*3+ph); c.lineTo(cx+ox+Math.cos(a)*w/2*rr*0.94, cy+Math.sin(a)*h/2*rr); }
            c.closePath(); c.fill(); c.fillStyle="rgba(255,255,255,0.12)"; c.fillRect(cx+ox-w*0.28, cy-h*0.34, w*0.4, 2);
            c.fillStyle="rgba(0,0,0,0.16)"; c.fillRect(cx+ox-w*0.3, cy+h*0.34, w*0.55, 2); }
          x+=w+3; } } }), roughness:0.95}));
  // the curtains: cloth in folds, tinted by the room
  bucketOf("fh_curtain", ()=>new T.MeshStandardMaterial({map:tileTex(128,64,(c,W,Hh)=>{
      for(let x=0;x<W;x++){ const v=0.80+0.17*Math.cos(x/W*Math.PI*8)+0.04*Math.sin(x/W*Math.PI*22), g=Math.round(255*Math.min(1,v));
        c.fillStyle="rgb("+g+","+g+","+g+")"; c.fillRect(x,0,1,Hh); }
      const q=_trng(77); for(let k=0;k<500;k++){ c.fillStyle="rgba(0,0,0,0.05)"; c.fillRect(q()*W, q()*Hh, 1, 1); } }), roughness:0.95, side:T.DoubleSide}));

  // the stone it stands on, its top a centimetre under the floor
  bx("fh_stone", H.x1-H.x0+0.10, FF-0.01-(Y-0.4), H.z1-H.z0+0.10, (H.x0+H.x1)/2, (FF-0.01+Y-0.4)/2, (H.z0+H.z1)/2, 0.6, 0, "#ffffff");
  // the walls: white clapboard, a band a storey so a window upstairs never fills in the one under it
  const dn=L=>L.filter(o=>o.sill<CL), upr=L=>L.filter(o=>o.sill>CL);
  for(const [y0,y1,f] of [[FF-0.15, FF2, dn],[FF2, EAV, upr]]){
    runX("fh_clap", H.z0+WT/2, WT, H.x0, H.x1, y0, y1, f(FRONT), "#ffffff", 0.5);
    runX("fh_clap", H.z1-WT/2, WT, H.x0, H.x1, y0, y1, f(BACK), "#ffffff", 0.5);
    runZ("fh_clap", H.x0+WT/2, WT, IZ0, IZ1, y0, y1, f(WEST), "#ffffff", 0.5);
    runZ("fh_clap", H.x1-WT/2, WT, IZ0, IZ1, y0, y1, f(EAST), "#ffffff", 0.5); }
  // corner boards, a pair at each corner standing proud of the clapboard, from the stone up into the roof's eave;
  // at the corner each one's edge is inside the other's, and they stop at different heights
  for(const [cx, sx] of [[H.x0, 1],[H.x1, -1]]) for(const [cz, sz] of [[H.z0, 1],[H.z1, -1]]){
    B(0.15, EAV-0.06-(FF-0.03), 0.035, cx+sx*(0.13-0.15/2), (EAV-0.06+FF-0.03)/2, cz-sz*0.0075, TRM);
    B(0.035, EAV-0.055-(FF-0.03), 0.17, cx-sx*0.0075, (EAV-0.055+FF-0.03)/2, cz+sz*(0.15-0.17/2), TRM); }
  // the walls inside: the hall's two, downstairs and up; the cross wall upstairs; the bath's
  const PARL={a:Z+36.0, b:Z+37.8, sill:FF-0.004, head:FF+2.14}, KITO={a:Z+40.2, b:Z+41.7, sill:FF-0.004, head:FF+2.14};
  const dU=(a,b)=>({a:a, b:b, sill:FF2-0.004, head:FF2+2.06});
  const D_NW=dU(Z+37.92,Z+38.84), D_SW=dU(Z+40.0,Z+40.92), D_NE=dU(Z+34.4,Z+35.32), D_BA=dU(Z+40.0,Z+40.92), D_ST=dU(130.2,131.12);
  runZ("plaster", HW[0], HT, IZ0, IZ1, FF, CL, [PARL], PLS, 0.5);
  runZ("plaster", HW[1], HT, IZ0, IZ1, FF, CL, [KITO], PLS, 0.5);
  runZ("plaster", HW[0], HT, IZ0, IZ1, FF2, UC, [D_NW, D_SW], PLS, 0.5);
  runZ("plaster", HW[1], HT, IZ0, IZ1, FF2, UC, [D_NE, D_BA], PLS, 0.5);
  runX("plaster", ZM, HT, IX0, HW[0]-HT/2-0.004, FF2, UC, [], PLS, 0.5);
  runX("plaster", ZM, HT, HW[1]+HT/2+0.004, IX1, FF2, UC, [D_ST], PLS, 0.5);
  runZ("plaster", BW, HT, ZM+HT/2+0.004, IZ1, FF2, UC, [], PLS, 0.5);
  // each room's faces, a paper or a paint (on a thin wall 12 mm proud, clear of its growth at the bake)
  const room=(bk, x0, x1, z0, z1, y0, y1, col, op)=>{
    const pick=(L, lo, hi)=>(L||[]).filter(o=>o.b>lo && o.a<hi && o.sill<y1 && o.head>y0);
    lineX(bk, z0, 1, x0, x1, y0, y1, pick(op.n, x0, x1), col, 1, op.inN);
    lineX(bk, z1, -1, x0, x1, y0, y1, pick(op.s, x0, x1), col, 1, op.inS);
    lineZ(bk, x0, 1, z0, z1, y0, y1, pick(op.w, z0, z1), col, 1, op.inW);
    lineZ(bk, x1, -1, z0, z1, y0, y1, pick(op.e, z0, z1), col, 1, op.inE); };
  const HA=HW[0]+HT/2, HB=HW[1]-HT/2, KA=HW[1]+HT/2, PA=HW[0]-HT/2;      // the hall's two faces, the kitchen's west face, the parlour's east face
  room("fh_sage",   IX0, PA, IZ0, IZ1, FF, CL, "#ffffff", {n:FRONT, s:BACK, w:WEST, e:[PARL], inE:PIN});
  room("plaster",   HA, HB, IZ0, IZ1, FF, CL, "#efe6d2", {n:FRONT, s:BACK, w:[PARL], e:[KITO], inW:PIN, inE:PIN});
  room("plaster",   KA, IX1, IZ0, IZ1, FF, CL, "#f0e2b0", {n:FRONT, s:BACK, w:[KITO], e:EAST, inW:PIN});
  room("fh_rose",   IX0, PA, IZ0, ZM-HT/2, FF2, UC, "#ffffff", {n:FRONT, w:WEST, e:[D_NW], inE:PIN, inS:PIN});
  room("fh_kids",   IX0, PA, ZM+HT/2, IZ1, FF2, UC, "#ffffff", {s:BACK, w:WEST, e:[D_SW], inE:PIN, inN:PIN});
  room("plaster",   HA, HB, IZ0, IZ1, FF2, UC, "#efe6d2", {n:FRONT, s:BACK, w:[D_NW, D_SW], e:[D_NE, D_BA], inW:PIN, inE:PIN});
  room("fh_stripe", KA, IX1, IZ0, ZM-HT/2, FF2, UC, "#ffffff", {n:FRONT, e:EAST, w:[D_NE], s:[D_ST], inW:PIN, inS:PIN});
  room("plaster",   KA, BW-HT/2, ZM+HT/2, IZ1, FF2, UC, "#e2ecec", {s:BACK, w:[D_BA], inW:PIN, inN:PIN, inE:PIN});
  room("plaster",   BW+HT/2, IX1, ZM+HT/2, IZ1, FF2, UC, "#e8e2d4", {s:BACK, e:EAST, n:[D_ST], inW:PIN, inN:PIN});
  // trim round every room: a painted baseboard, broken at the doors (into their casings) and carried on under
  // the windows, and a crown along the ceiling; each sunk into its wall, proud of the paper; the north and
  // south runs a few millimetres lower than the east and west, so where they cross at a corner no faces meet
  const trimRoom=(x0, x1, z0, z1, y0, y1, op)=>{
    const runs=(a, b, L)=>{ const out=[]; let q=a;
      for(const o of (L||[]).filter(o=>o.sill<y0+0.1 && o.b>a && o.a<b).sort((p,q2)=>p.a-q2.a)){ if(o.a-0.06>q+0.05) out.push([q, o.a-0.06]); q=Math.max(q, o.b+0.06); }
      if(b>q+0.05) out.push([q, b]); return out; };
    for(const [f, dir, L] of [[z0, 1, op.n], [z1, -1, op.s]]){
      for(const [a,b] of runs(x0, x1, L)) B(b-a, 0.144, 0.035, (a+b)/2, y0+0.068, f+dir*0.0125, TRM);      // (its foot 4 mm into the floor)
      B(x1-x0, 0.07, 0.05, (x0+x1)/2, y1-0.033, f+dir*0.02, TRM); }
    // (the east and west runs stop 5 mm short of each corner, inside the north and south ones, so their ends
    //  are not in the faces of the walls they butt against)
    for(const [f, dir, L] of [[x0, 1, op.w], [x1, -1, op.e]]){
      for(const [a,b] of runs(z0+0.005, z1-0.005, L)) B(0.035, 0.149, b-a, f+dir*0.0125, y0+0.0705, (a+b)/2, TRM);
      B(0.05, 0.075, z1-z0-0.01, f+dir*0.02, y1-0.0365, (z0+z1)/2, TRM); } };
  const WELL={a:ST.z0-0.10, b:ST.z1+0.10, sill:FF2-1};                     // (no baseboard along the stairwell's edge upstairs)
  trimRoom(IX0, PA, IZ0, IZ1, FF, CL, {n:FRONT, s:BACK, w:WEST, e:[PARL]});
  trimRoom(HA, HB, IZ0, IZ1, FF, CL, {n:FRONT, s:BACK, w:[PARL], e:[KITO]});
  trimRoom(KA, IX1, IZ0, IZ1, FF, CL, {n:FRONT, s:BACK, w:[KITO], e:EAST});
  trimRoom(IX0, PA, IZ0, ZM-HT/2, FF2, UC, {n:FRONT, w:WEST, e:[D_NW]});
  trimRoom(IX0, PA, ZM+HT/2, IZ1, FF2, UC, {s:BACK, w:WEST, e:[D_SW]});
  trimRoom(HA, HB, IZ0, IZ1, FF2, UC, {n:FRONT, s:BACK, w:[D_NW, D_SW], e:[D_NE, D_BA, WELL]});
  trimRoom(KA, IX1, IZ0, ZM-HT/2, FF2, UC, {n:FRONT, e:EAST, w:[D_NE], s:[D_ST]});
  trimRoom(KA, BW-HT/2, ZM+HT/2, IZ1, FF2, UC, {s:BACK, w:[D_BA]});
  trimRoom(BW+HT/2, IX1, ZM+HT/2, IZ1, FF2, UC, {s:BACK, e:EAST, n:[D_ST]});
  // the floors and ceilings; between the storeys a deck round the stairwell, plastered where it shows
  floorAt("fh_floor", IX0, PA, IZ0, IZ1, FF+0.004, "#ffffff", 0.9);
  floorAt("fh_floor", HA, HB, IZ0, IZ1, FF+0.004, "#e8dccc", 0.9);
  floorAt("fh_lino", KA, IX1, IZ0, IZ1, FF+0.004, "#ffffff", 0.7);
  addFlat(IX0, IX1, IZ0, IZ1, FF);
  for(const [o,z0,z1] of [[FDOOR, H.z0-0.01, IZ0+0.01],[BDOOR, IZ1-0.01, H.z1+0.01]]) addFlat(o.a, o.b, z0, z1, FF-0.01);    // over the stone in the doorways
  ceilAt("plaster", IX0, PA, IZ0, IZ1, CL, "#f2efe8", 0.5); ceilAt("plaster", KA, IX1, IZ0, IZ1, CL, "#f2efe8", 0.5);
  ceilAt("plaster", HA, ST.x0, IZ0, IZ1, CL, "#f2efe8", 0.5);
  ceilAt("plaster", ST.x0, HB, IZ0, ST.z0, CL, "#f2efe8", 0.5); ceilAt("plaster", ST.x0, HB, ST.z1, IZ1, CL, "#f2efe8", 0.5);
  const SLB=(x0,x1,z0,z1)=>bx("plaster", x1-x0, FF2-0.006-(CL+0.01), z1-z0, (x0+x1)/2, (CL+0.01+FF2-0.006)/2, (z0+z1)/2, 0.5, 0, PLS);
  SLB(IX0, ST.x0, IZ0, IZ1); SLB(ST.x0, IX1, IZ0, ST.z0); SLB(ST.x0, IX1, ST.z1, IZ1); SLB(HB, IX1, ST.z0, ST.z1);
  for(const [x0,x1,z0,z1,bk,col,uv] of [[IX0,PA,IZ0,ZM-HT/2,"fh_floor","#ffffff",0.9],[IX0,PA,ZM+HT/2,IZ1,"fh_floor","#f0e4d0",0.9],
      [KA,IX1,IZ0,ZM-HT/2,"fh_floor","#ffffff",0.9],[KA,BW-HT/2,ZM+HT/2,IZ1,"fh_check","#ffffff",2.5],[BW+HT/2,IX1,ZM+HT/2,IZ1,"fh_floor","#d8ccbc",0.9],
      [HA,ST.x0,IZ0,IZ1,"fh_floor","#e8dccc",0.9],[ST.x0,HB,IZ0,ST.z0,"fh_floor","#e8dccc",0.9],[ST.x0,HB,ST.z1,IZ1,"fh_floor","#e8dccc",0.9]])
    floorAt(bk, x0, x1, z0, z1, FF2, col, uv);
  addFlat(IX0, ST.x0, IZ0, IZ1, FF2); addFlat(ST.x0, IX1, IZ0, ST.z0, FF2); addFlat(ST.x0, IX1, ST.z1-0.005, IZ1, FF2); addFlat(HB, IX1, ST.z0, ST.z1, FF2);
  ceilAt("plaster", IX0, IX1, IZ0, IZ1, UC, "#f4f2ec", 0.5);
  bx("beam", IX1-IX0, 0.12, IZ1-IZ0, (IX0+IX1)/2, UC+0.066, (IZ0+IZ1)/2, 0.5, 0, "#5a4a38");          // (the attic's floor over it, so it's dark from below)
  // the openings' frames, and a threshold across each wall's thickness
  frZ(HW[0], HT, PARL.a, PARL.b, FF, PARL.head, TRM); frZ(HW[1], HT, KITO.a, KITO.b, FF, KITO.head, TRM);
  for(const [x,o] of [[HW[0],D_NW],[HW[0],D_SW],[HW[1],D_NE],[HW[1],D_BA]]) frZ(x, HT, o.a, o.b, FF2, o.head, TRM);
  frX(ZM, HT, D_ST.a, D_ST.b, FF2, D_ST.head, TRM);
  for(const [x,o,y] of [[HW[0],PARL,FF],[HW[1],KITO,FF],[HW[0],D_NW,FF2],[HW[0],D_SW,FF2],[HW[1],D_NE,FF2],[HW[1],D_BA,FF2]]) B(HT+0.03, 0.016, o.b-o.a, x, y+0.006, (o.a+o.b)/2, "#8a6a44");
  B(D_ST.b-D_ST.a, 0.016, HT+0.03, (D_ST.a+D_ST.b)/2, FF2+0.006, ZM, "#8a6a44");
  // the stairwell's edges trimmed in oak, a few millimetres proud of the plaster
  B(0.06, 0.25, ST.z1-ST.z0, ST.x0-0.025, CL+0.115, (ST.z0+ST.z1)/2, "#8a6a44"); B(HB-ST.x0+0.06, 0.25, 0.06, (ST.x0+HB)/2, CL+0.115, ST.z0-0.025, "#8a6a44");

  /* the stair: oak treads with a nosing over white risers, a closed string up the open side and the
     panel under it, a turned newel at the foot, a rail on balusters, and round the well upstairs */
  { const R=ST.rise, pitch=R/ST.run, RX=ST.x0+0.01, nose=z=>FF+R+(z-ST.z0)*pitch;    // (the line through the treads' noses)
    for(let k=1;k<ST.n;k++){
      const z0=ST.z0+(k-1)*ST.run, z1=z0+ST.run, top=FF+k*R;
      B(ST.x1-ST.x0-0.04, top-0.025-FF, ST.run, (ST.x0+ST.x1)/2, FF+(top-0.025-FF)/2, (z0+z1)/2, "#f0ece2");     // the riser and the mass under it
      B(ST.x1-ST.x0, 0.025, ST.run+0.025, (ST.x0+ST.x1)/2-0.01, top-0.0125, (z0+z1)/2-0.0125, "#9a6a3c");             // the tread, its nose out over the riser
      B(0.56, 0.006, ST.run-0.03, (ST.x0+ST.x1)/2+0.02, top+0.003, (z0+z1)/2-0.0125, "#7a2a22");                       // a runner up the middle
      addFlat(ST.x0, ST.x1, z0-0.005, z1+0.005, top); }
    addFlat(ST.x0, HB, ST.z1-0.005, ST.z1+0.30, FF2);
    { const a=V3(ST.x0-0.028, FF-0.12, ST.z0-ST.run), b=V3(ST.x0-0.028, FF2-0.12, ST.z1), d=new T.Vector3().subVectors(b,a), Lg=d.length();
      ME.push({geo:boxGeo(0.045, Lg, 0.30), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#e8e2d4")}); }
    const railY=z=>nose(z)+0.86;
    B(0.11, 1.10, 0.11, RX, FF+0.55, ST.z0-0.10, "#7a5230"); ent(new T.SphereGeometry(0.07, 16, 12), RX, FF+1.16, ST.z0-0.10, "#7a5230");
    B(0.13, 0.06, 0.13, RX, FF+1.07, ST.z0-0.10, "#7a5230");
    tubeE(V3(RX, railY(ST.z0-0.06), ST.z0-0.06), V3(RX, railY(ST.z1), ST.z1+0.02), 0.028, "#7a5230");
    for(let k=1;k<ST.n;k++){ const zc=ST.z0+(k-0.5)*ST.run; tubeE(V3(RX, FF+k*R, zc), V3(RX, railY(zc)-0.01, zc), 0.014, "#f4f0e6"); }
    // upstairs: a newel at each corner of the well, a rail on a shoe along its open side and across its front
    const uy=FF2+0.92, zf=ST.z0-0.05, zb=ST.z1+0.05;
    for(const z of [zf, zb]){ B(0.09, 1.00, 0.09, RX, FF2+0.50, z, "#7a5230"); ent(new T.SphereGeometry(0.055, 14, 10), RX, FF2+1.04, z, "#7a5230"); }
    tubeE(V3(RX, uy, zf), V3(RX, uy, zb), 0.028, "#7a5230"); tubeE(V3(RX, uy, zf), V3(HB-0.03, uy, zf), 0.028, "#7a5230");
    B(0.06, 0.05, zb-zf, RX, FF2+0.03, (zf+zb)/2, "#7a5230"); B(HB-RX, 0.05, 0.06, (RX+HB)/2, FF2+0.03, zf, "#7a5230");
    for(let z=zf+0.13; z<zb-0.06; z+=0.13) tubeE(V3(RX, FF2+0.05, z), V3(RX, uy-0.01, z), 0.012, "#f4f0e6");
    for(let x=RX+0.13; x<HB-0.06; x+=0.13) tubeE(V3(x, FF2+0.05, zf), V3(x, uy-0.01, zf), 0.012, "#f4f0e6");
    // the open side is the rail all the way up and round the well; across the front of the well upstairs;
    // and the back of the stair, from the hall behind it, is a wall you go round
    addCol(RX-0.06, RX+0.04, ST.z0-0.16, zb+0.05, FF-0.5, FF2+1.0);
    addCol(RX, HB, zf-0.04, zf+0.04, FF2-0.2, FF2+1.0);
    addCol(ST.x0, HB, ST.z1-0.10, ST.z1+0.02, FF-0.5, FF+1.9); }

  // the windows: trim and glass, a cross of muntins in each sash, a stool inside; green shutters on the front
  const glaze=(axis, f, o, out)=>{ const w=o.b-o.a, h=o.head-o.sill, cy=(o.sill+o.head)/2, c=(o.a+o.b)/2;
    if(axis==="x"){ push("glass", planeGeo(w-0.06, h-0.06, 0), c, cy, f, 0, "#ffffff");
      for(const x of [o.a-0.05, o.b+0.05]) B(0.10, h+0.18, 0.05, x, cy, f+out*(WT/2+0.025), TRM);
      B(w+0.30, 0.10, 0.06, c, o.head+0.05, f+out*(WT/2+0.03), TRM); B(w+0.24, 0.05, 0.12, c, o.sill-0.017, f+out*(WT/2+0.05), TRM);
      B(0.03, h-0.08, 0.03, c, cy, f+out*0.025, TRM); B(w-0.08, 0.03, 0.03, c, cy, f+out*0.025, TRM);
      B(w+0.10, 0.04, 0.12, c, o.sill+0.02, f-out*(WT/2+0.05), TRM); }
    else { push("glass", planeGeo(w-0.06, h-0.06, 0), f, cy, c, Math.PI/2, "#ffffff");
      for(const z of [o.a-0.05, o.b+0.05]) B(0.05, h+0.18, 0.10, f+out*(WT/2+0.025), cy, z, TRM);
      B(0.06, 0.10, w+0.30, f+out*(WT/2+0.03), o.head+0.05, c, TRM); B(0.12, 0.05, w+0.24, f+out*(WT/2+0.05), o.sill-0.017, c, TRM);
      B(0.03, h-0.08, 0.03, f+out*0.025, cy, c, TRM); B(0.03, 0.03, w-0.08, f+out*0.025, cy, c, TRM);
      B(0.12, 0.04, w+0.10, f-out*(WT/2+0.05), o.sill+0.02, c, TRM); } };
  for(const o of FRONT) if(o.sill>FF){ glaze("x", H.z0+WT/2, o, -1);
    for(const x of [o.a-0.48, o.b+0.48]){ B(0.40, o.head-o.sill+0.06, 0.035, x, (o.sill+o.head)/2, H.z0-0.03, SHUT);
      for(let y=o.sill+0.12; y<o.head-0.06; y+=0.09) B(0.34, 0.012, 0.012, x, y, H.z0-0.050, "#263c30"); } }
  for(const o of BACK)  if(o.sill>FF) glaze("x", H.z1-WT/2, o, 1);
  for(const o of WEST)  glaze("z", H.x0+WT/2, o, -1);
  for(const o of EAST)  glaze("z", H.x1-WT/2, o, 1);
  // curtains inside every window, a panel drawn back either side of it on a rod, in the room's colour:
  // gold in the parlour, lace in the hall, red in the kitchen; upstairs each bedroom its own
  { const col=(x, z, upst)=>!upst ? (x<PA ? "#b89a6a" : x<HB ? "#e2dccf" : "#c25a4a")
                                  : (x<PA ? (z<ZM ? "#d0bcaa" : "#8eb0d4") : x<HB ? "#e2dccf" : (z<ZM ? "#bccfa2" : x<BW ? "#e8e8e4" : "#d4ccbc"));
    const drape=(axis, f, dir, o, c)=>{ const top=o.head+0.12, h=top-o.sill, cy=(top+o.sill)/2;
      for(const m of [o.a-0.22, o.b+0.22]){
        if(axis==="x") push("fh_curtain", planeGeo(0.30, h, 1.67), m, cy, f+dir*0.07, 0, c);
        else push("fh_curtain", planeGeo(0.30, h, 1.67), f+dir*0.07, cy, m, Math.PI/2, c); }
      const a=V3(0,0,0), b=V3(0,0,0);
      if(axis==="x"){ a.set(o.a-0.38, o.head+0.15, f+dir*0.08); b.set(o.b+0.38, o.head+0.15, f+dir*0.08); }
      else { a.set(f+dir*0.08, o.head+0.15, o.a-0.38); b.set(f+dir*0.08, o.head+0.15, o.b+0.38); }
      tubeE(a, b, 0.011, "#5a4a36"); for(const e of [a,b]) ent(new T.SphereGeometry(0.022, 10, 8), e.x, e.y, e.z, "#5a4a36"); };
    for(const o of FRONT) if(o.sill>FF) drape("x", IZ0, 1, o, col((o.a+o.b)/2, H.z0, o.sill>CL));
    for(const o of BACK)  if(o.sill>FF) drape("x", IZ1, -1, o, col((o.a+o.b)/2, H.z1, o.sill>CL));
    for(const o of WEST)  drape("z", IX0, 1, o, col(H.x0, (o.a+o.b)/2, o.sill>CL));
    for(const o of EAST)  drape("z", IX1, -1, o, col(H.x1, (o.a+o.b)/2, o.sill>CL)); }
  for(const o of [...FRONT, ...BACK]) if(o.sill>FF) addCol(o.a, o.b, (FRONT.includes(o)?H.z0:H.z1-WT), (FRONT.includes(o)?H.z0+WT:H.z1), o.sill, o.head);
  for(const o of [...WEST, ...EAST]) addCol((WEST.includes(o)?H.x0:H.x1-WT), (WEST.includes(o)?H.x0+WT:H.x1), o.a, o.b, o.sill, o.head);
  // at night, a lamp left on in two of the rooms upstairs, seen from the road
  for(const [o,f,ry] of [[FRONT[6], H.z0+WT+0.18, Math.PI],[FRONT[8], H.z0+WT+0.18, Math.PI]])
    push("winwarm", planeGeo(o.b-o.a-0.08, o.head-o.sill-0.08, 0), (o.a+o.b)/2, (o.sill+o.head)/2, f, ry, "#ffffff");
  // the doors: the front into the hall under its transom, the back out of the kitchen; their frames
  frX(H.z0+WT/2, WT, FDOOR.a, FDOOR.b, FF, FDOOR.head, TRM); frX(H.z1-WT/2, WT, BDOOR.a, BDOOR.b, FF, BDOOR.head, TRM);
  B(FDOOR.b-FDOOR.a+0.01, 0.10, WT+0.04, (FDOOR.a+FDOOR.b)/2, FF+2.11, H.z0+WT/2, TRM);
  push("glass", planeGeo(FDOOR.b-FDOOR.a-0.04, FDOOR.head-FF-2.18, 0), (FDOOR.a+FDOOR.b)/2, (FF+2.16+FDOOR.head)/2, H.z0+WT/2, 0, "#ffffff");
  makeDoor(XF(FDOOR.a+0.02, H.z0+WT/2, 0), 0, FF+0.01, 0, "THE FARMHOUSE", true, 0, "closet", 0x2f4a3a);
  makeDoor(XF(BDOOR.b-0.02, H.z1-WT/2, Math.PI), 0, FF+0.01, 0, "THE BACK DOOR", true, 0, "closet", 0xe8e2d2);
  // the rooms' doors upstairs, standing half open, each swung into its room
  for(const [x,o,lab] of [[HW[0],D_NW,"THE FRONT BEDROOM"],[HW[0],D_SW,"THE KIDS' ROOM"],[HW[1],D_NE,"THE SEWING ROOM"],[HW[1],D_BA,"THE BATHROOM"]])
    makeDoor(XF(x, o.a+0.02, -Math.PI/2), 0, FF2+0.01, 0, lab, x===HW[0], 0.55, "closet", 0xf0ece2);
  makeDoor(XF(D_ST.a+0.02, ZM, 0), 0, FF2+0.01, 0, "THE STOREROOM", true, 0, "closet", 0xf0ece2);
  // the stoop out the back door, a landing and three steps down to the yard; the boot scraper
  { const a=BDOOR.a-0.40, b=BDOOR.b+0.40, LT=FF-0.02;
    B(b-a, LT-Y+0.1, 1.0, (a+b)/2, (LT+Y-0.1)/2, H.z1+0.5, "#8d877b"); addFlat(a, b, H.z1-0.005, H.z1+1.005, LT);
    for(let k=1;k<=3;k++){ const y=Y+(LT-Y)*(4-k)/4, zz=H.z1+1.15+(k-1)*0.30;
      B(b-a-0.10, y-Y+0.1, 0.30, (a+b)/2, (y+Y-0.1)/2, zz, "#8d877b"); addFlat(a+0.05, b-0.05, zz-0.155, zz+0.155, y); }
    B(0.30, 0.02, 0.06, a-0.30, Y+0.15, H.z1+1.4, "#3a3a3c"); for(const dx of [-0.13,0.13]) B(0.02, 0.15, 0.02, a-0.30+dx, Y+0.075, H.z1+1.4, "#3a3a3c"); }
  // the roof: a gable along the house, shingled; the gable ends in clapboard with a louvred vent; the chimney up the west end
  { const ov=0.45, xa=H.x0-0.35, xb=H.x1+0.35, zm=(H.z0+H.z1)/2;
    for(const [z0,z1,e] of [[H.z0-ov, zm, 0],[H.z1+ov, zm, 0.012]]){ const yo=EAV-(RID-EAV)/((H.z1-H.z0)/2)*ov;
      slab("shingle", [V3(xa-e, yo, z0), V3(xb+e, yo, z0), V3(xb+e, RID, z1), V3(xa-e, RID, z1)], 0.12, "#5a4e48"); }
    for(const x of [H.x0+WT/2, H.x1-WT/2]){
      const tri=[V3(x, EAV, H.z0+0.01), V3(x, EAV, H.z1-0.01), V3(x, RID-0.10, zm)];
      push("fh_clap", new FaceGeo().slab(tri.map(p=>p.clone().add(V3(-WT/2,0,0))), WT, 0.5).geo(), 0,0,0, 0, "#ffffff");
      const ox=x<(H.x0+H.x1)/2 ? -1 : 1;
      B(0.04, 0.70, 0.60, x+ox*(WT/2+0.02), EAV+1.10, zm, TRM); for(let k=0;k<6;k++) B(0.03, 0.035, 0.52, x+ox*(WT/2+0.05), EAV+0.82+k*0.11, zm, "#c8c4b8"); }
    // the fascia over each slab's lower edge, and a gutter hung on it; the downspouts off the gutters' ends,
    // back in to the wall and down it, onto the porch roof in front and to splash blocks behind
    const yo=EAV-(RID-EAV)/((H.z1-H.z0)/2)*ov, GW="#ecebe6";
    for(const [zf, sd] of [[H.z0-ov, -1],[H.z1+ov, 1]]){
      B(H.x1-H.x0+0.78, 0.16, 0.04, (H.x0+H.x1)/2, yo-0.065, zf+sd*0.005, TRM);
      B(H.x1-H.x0+0.74, 0.11, 0.12, (H.x0+H.x1)/2, yo-0.07, zf+sd*0.089, GW);
      for(const x of [H.x0+0.30, H.x1-0.30]){
        const zw=(sd<0 ? H.z0 : H.z1)+sd*0.065, bot=sd<0 ? FF+2.98 : Y+0.25;
        const P=[V3(x, yo-0.12, zf+sd*0.089), V3(x, yo-0.30, zf+sd*0.089), V3(x, yo-0.62, zw), V3(x, bot, zw),
                 V3(x, sd<0 ? FF+2.93 : Y+0.08, zw+sd*(sd<0 ? 0.0 : 0.28)+(sd<0 ? -0.25 : 0))];
        for(let i=1;i<P.length;i++){ tubeE(P[i-1], P[i], 0.035, GW); if(i<P.length-1) ent(new T.SphereGeometry(0.035, 10, 8), P[i].x, P[i].y, P[i].z, GW); }
        if(sd>0){ B(0.26, 0.04, 0.50, x, Y+0.015, H.z1+0.42, "#a8a49a"); addCol(x-0.06, x+0.06, H.z1, H.z1+0.12, Y-0.5, EAV); } } }
    // the chimney: brick up the outside of the west gable, stepped in under the eave, on up through the rake past the ridge
    const cz=Z+38.4;
    bx("brick", 0.62, EAV-0.5-(Y-0.2), 1.30, H.x0-0.33, (EAV-0.5+Y-0.2)/2, cz, 0.83, 0, "#8a4a36");
    bx("brick", 0.56, RID+1.2-(EAV-0.5)+0.02, 0.72, H.x0-0.31, (RID+1.2+EAV-0.5)/2-0.01, cz, 0.83, 0, "#8a4a36");
    bx("concrete", 0.66, 0.08, 0.82, H.x0-0.31, RID+1.24, cz, 0.5, 0, "#8d8b86");
    addCol(H.x0-0.65, H.x0-0.02, cz-0.66, cz+0.66, Y-0.5, EAV);
    // lightning rods along the ridge, a blue glass ball on each; the dish on the back slope
    for(const x of [H.x0+2.0, (H.x0+H.x1)/2, H.x1-2.0]){ tubeE(V3(x, RID+0.06, zm), V3(x, RID+0.90, zm), 0.008, "#8a8d90"); ent(new T.SphereGeometry(0.05, 14, 10), x, RID+0.45, zm, "#3a6ac8"); }
    tubeE(V3(H.x0+2.0, RID+0.10, zm), V3(H.x1-2.0, RID+0.10, zm), 0.006, "#8a8d90");
    { const dx=H.x1-3.0, dz=Z+42.6, dy=EAV+(RID-EAV)*(1-(dz-zm)/((H.z1-H.z0)/2))+0.12;
      tubeE(V3(dx, dy, dz), V3(dx, dy+0.55, dz), 0.025, "#8a8d90");
      ent(new T.CylinderGeometry(0.34, 0.28, 0.05, 28), dx, dy+0.62, dz-0.04, "#e8e8e4", -1.0, 0, 0);
      tubeE(V3(dx, dy+0.62, dz-0.04), V3(dx, dy+0.80, dz-0.40), 0.012, "#8a8d90"); B(0.06, 0.06, 0.08, dx, dy+0.80, dz-0.42, "#3a3a3c"); } }
  // the porch along the front: boards, posts, a rail, its own roof with a beadboard ceiling, the steps down to the walk
  { const PZ0=H.z0-2.4, PY=FF-0.02, xa=H.x0-0.6, xb=H.x1+0.6, SA={a:122.7, b:124.3};
    B(xb-xa, 0.20, H.z0-PZ0, (xa+xb)/2, PY-0.10, (PZ0+H.z0)/2-0.002, "#8a7a64");
    for(let k=0;k<Math.round((xb-xa)/0.14);k++) bx("paint", 0.006, 0.012, H.z0-PZ0-0.04, xa+0.07+k*0.14, PY, (PZ0+H.z0)/2, 0, 0, "#6e604c");
    addFlat(xa, xb, PZ0, H.z0, PY);
    const posts=[xa+0.12, (xa+SA.a)/2, SA.a-0.08, SA.b+0.08, (SA.b+xb)/2, xb-0.12];
    for(const x of posts){ B(0.14, 2.42, 0.14, x, PY+1.21, PZ0+0.12, WHT); addCol(x-0.08, x+0.08, PZ0+0.04, PZ0+0.20, PY-0.5, PY+2.4); }
    for(const [a,b] of [[xa+0.19, SA.a-0.15],[SA.b+0.15, xb-0.19]]){ B(b-a, 0.06, 0.08, (a+b)/2, PY+0.92, PZ0+0.12, WHT); B(b-a, 0.05, 0.06, (a+b)/2, PY+0.12, PZ0+0.12, WHT);
      for(let x=a+0.08; x<b-0.04; x+=0.14) if(posts.every(p=>Math.abs(p-x)>0.11)) B(0.035, 0.76, 0.035, x, PY+0.52, PZ0+0.12, WHT);
      addCol(a, b, PZ0+0.04, PZ0+0.20, PY-0.5, PY+0.96); }
    const rz0=PZ0-0.35, rf=z=>PY+2.46+(z-rz0)*0.44/(H.z0+0.02-rz0);                     // (the roof's top along its fall; it hangs 6 cm under that)
    slab("roofmetal", [V3(xa-0.3, PY+2.90, H.z0+0.02), V3(xb+0.3, PY+2.90, H.z0+0.02), V3(xb+0.3, PY+2.46, rz0), V3(xa-0.3, PY+2.46, rz0)], 0.06, "#6a7076");
    B(xb-xa+0.20, 0.22, 0.10, (xa+xb)/2, PY+2.40, PZ0+0.12, WHT);
    // the porch ceiling, beadboard painted the blue that keeps the wasps off, a hand under the roof
    push("paintm", new FaceGeo().slab([V3(xa, rf(PZ0+0.18)-0.075, PZ0+0.18), V3(xb, rf(PZ0+0.18)-0.075, PZ0+0.18), V3(xb, rf(H.z0-0.02)-0.075, H.z0-0.02), V3(xa, rf(H.z0-0.02)-0.075, H.z0-0.02)], 0.02, 1).geo(), 0,0,0, 0, "#a8c8d0");
    // three steps down, four equal risers, each a block from the ground up
    for(let k=1;k<=3;k++){ const y=Y+(PY-Y)*(4-k)/4, zz=PZ0-0.15-(k-1)*0.30;
      B(SA.b-SA.a, y-Y+0.1, 0.30, (SA.a+SA.b)/2, (y+Y-0.1)/2, zz, k%2?"#8a7a64":"#84745e");
      addFlat(SA.a, SA.b, zz-0.155, zz+0.155, y); }                  // (each lapping the next, so no seam drops you to the ground)
    // the skirt round under the porch so it doesn't float
    B(xb-xa-0.12, PY-0.18-(Y-0.1), 0.04, (xa+xb)/2, (PY-0.18+Y-0.1)/2, PZ0+0.06, TRM);
    for(const x of [xa+0.06, xb-0.06]) B(0.04, PY-0.18-(Y-0.1), H.z0-PZ0-0.12, x, (PY-0.18+Y-0.1)/2, (PZ0+H.z0)/2, TRM);
    // the swing at the west end on its chains; two rockers either side of the door; a fern on a stand
    { const sx=xa+1.4, sz=PZ0+1.0;
      B(1.30, 0.06, 0.48, sx, PY+0.48, sz, "#7a5a3a"); B(1.30, 0.42, 0.05, sx, PY+0.72, sz+0.24, "#7a5a3a");
      for(const dx of [-0.62,0.62]) tubeE(V3(sx+dx, PY+0.50, sz), V3(sx+dx, PY+2.40, sz), 0.008, "#6a6a66");
      addSeat(sx, sz, PY+0.04, 0, "THE PORCH SWING"); addCol(sx-0.7, sx+0.7, sz-0.3, sz+0.3, PY-0.5, PY+0.9); }
    for(const x of [121.4, 125.6]){ const z=PZ0+0.9;
      B(0.50, 0.05, 0.46, x, PY+0.44, z, "#5a3a22"); B(0.50, 0.55, 0.05, x, PY+0.74, z+0.22, "#5a3a22");
      for(const dx of [-0.22,0.22]) for(const dz of [-0.2,0.2]) B(0.04, 0.42, 0.04, x+dx, PY+0.21, z+dz, "#5a3a22");
      for(const dx of [-0.22,0.22]) ent(new T.TorusGeometry(0.40, 0.02, 6, 24, 1.2), x+dx, PY+0.30, z-0.02, "#5a3a22", 0, Math.PI/2, -0.6);
      addSeat(x, z, PY+0.04, 0, "A ROCKER"); addCol(x-0.28, x+0.28, z-0.26, z+0.26, PY-0.5, PY+0.6); }
    { const x=xb-1.0, z=PZ0+0.6; C(0.16, 0.62, x, PY+0.31, z, "#5a3a22", 16);
      for(let k=0;k<9;k++){ const a=k*0.7; ent(new T.SphereGeometry(0.16, 12, 8).scale(1.6, 0.5, 0.7), x+Math.cos(a)*0.16, PY+0.78+(k%3)*0.05, z+Math.sin(a)*0.16, k%2?"#4a6a2a":"#557a30", 0, -a, 0.5); }
      addCol(x-0.25, x+0.25, z-0.25, z+0.25, PY-0.5, PY+1.1); }
    // the light by the door; the house number; the transom over it
    B(0.14, 0.20, 0.10, FDOOR.b+0.35, FF+2.0, H.z0-0.06, "#2a2a2c"); push("lamplens", new T.SphereGeometry(0.06, 14, 10), FDOOR.b+0.35, FF+1.92, H.z0-0.14, 0, "#ffffff");
    LAMPS.push({x:FDOOR.b+0.35, y:FF+1.85, z:H.z0-0.5, color:0xffd8a0, intensity:0.6, dist:8, decay:1.6, mothy:true});
    B(0.34, 0.16, 0.02, FDOOR.b+0.42, FF+1.25, H.z0-0.015, "#b8963a");
    sign(0.28, 0.12, (c,W,Hh)=>{ c.fillStyle="#2a2a2c"; c.fillRect(0,0,W,Hh); say(c,"11400",W/2,Hh/2,W*0.8,Hh*0.6,"#e8d8a8","700","Georgia, serif"); }, FDOOR.b+0.42, FF+1.25, H.z0-0.032, Math.PI, false, 140);
    // pumpkins on the steps' cheeks for October, a pot of mums
    for(const [x,z,s,col] of [[SA.a-0.30, PZ0+0.30, 0.20, "#e07a1a"],[SA.a-0.62, PZ0+0.36, 0.15, "#d86a12"],[SA.b+0.32, PZ0+0.30, 0.17, "#e8841e"]]){
      ent(new T.SphereGeometry(s, 18, 12).scale(1, 0.78, 1), x, PY+s*0.78, z, col); C(0.018, 0.06, x, PY+s*1.56+0.02, z, "#4a5a2a", 8); }
    C(0.17, 0.20, SA.b+0.75, PY+0.10, PZ0+0.32, "#7a4a2a", 16); ent(new T.SphereGeometry(0.22, 14, 10).scale(1, 0.7, 1), SA.b+0.75, PY+0.28, PZ0+0.32, "#c84a7a");
    addCol(SA.a-0.85, SA.a-0.08, PZ0+0.10, PZ0+0.58, PY-0.5, PY+0.4); addCol(SA.b+0.12, SA.b+0.98, PZ0+0.10, PZ0+0.56, PY-0.5, PY+0.4);
    addZone(xa, xb, PZ0, H.z0, PY-1, PY+3, "THE PORCH");
    // a row of shrubs along the front of the porch either side of the steps, and down the house's ends
    for(let x=xa+0.5; x<xb-0.3; x+=1.25) if(x<SA.a-0.7 || x>SA.b+0.7)
      FOREST.plant("bush", x, PZ0-0.75, {y:Y, scale:0.55+hash2(x, PZ0)*0.25, solid:false, lean:false});
    for(const [x, z0, z1] of [[H.x0-0.95, H.z0+0.7, Z+37.4], [H.x0-0.95, Z+39.5, H.z1-0.6], [H.x1+0.95, H.z0+0.7, H.z1-0.6]])
      for(let z=z0; z<z1; z+=1.5) FOREST.plant("bush", x, z, {y:Y, scale:0.5+hash2(x, z)*0.25, solid:false, lean:false}); }

  /* ---- downstairs: the parlour ---- */
  { // the stove on its hearth against the west wall, its pipe into the chimney's thimble, a box of splits
    { const wz=Z+38.4, wx=IX0+0.48;
      B(0.92, 0.04, 1.30, IX0+0.48, FF+0.03, wz, "#8a4a36");
      B(0.56, 0.62, 0.62, wx, FF+0.44, wz, "#1d1d1e"); for(const dx of [-0.23,0.23]) for(const dz of [-0.25,0.25]) B(0.05, 0.13, 0.05, wx+dx, FF+0.11, wz+dz, "#1d1d1e");
      B(0.02, 0.26, 0.34, wx+0.29, FF+0.46, wz, "#ff7a2a"); B(0.04, 0.03, 0.46, wx+0.30, FF+0.62, wz, "#3a3a3a");
      C(0.08, 0.70, wx, FF+1.10, wz, "#1d1d1e", 16); ent(new T.TorusGeometry(0.10, 0.08, 12, 16, Math.PI/2), wx-0.10, FF+1.45, wz, "#1d1d1e");
      C(0.08, 0.42, IX0+0.18, FF+1.55, wz, "#1d1d1e", 16, 0, 0, Math.PI/2); C(0.13, 0.03, IX0+0.017, FF+1.55, wz, "#c9c6be", 18, 0, 0, Math.PI/2);
      for(let k=0;k<7;k++) C(0.05, 0.40, wx+0.15, FF+0.10+(k%3)*0.10, wz+0.53+((k/3)|0)*0.11, "#7a5a3a", 10, 0, 0, Math.PI/2);
      addCol(IX0, wx+0.32, wz-0.40, wz+0.40, FF-0.5, FF+1.5);
      LAMPS.push({x:wx+0.4, y:FF+0.5, z:wz, color:0xff8a3a, intensity:0.35, dist:4, decay:2, fire:true, vol:[IX0, PA, IZ0, IZ1, FF-0.5, CL]}); }
    // the couch facing the set, the afghan over its back, two pillows; a coffee table on a braided rug; the recliner
    const cx=118.4, cz=Z+41.4;
    B(0.86, 0.42, 2.10, cx, FF+0.21, cz, "#6a4a3a"); B(0.22, 0.48, 2.10, cx-0.32, FF+0.66, cz, "#6a4a3a");
    for(const dz of [-1.0,1.0]) B(0.86, 0.26, 0.20, cx, FF+0.55, cz+dz*1.08, "#6a4a3a");
    for(const dz of [-0.5,0.5]) B(0.62, 0.12, 0.96, cx+0.08, FF+0.48, cz+dz, "#7a5a48");
    for(const dz of [-0.66,0.66]) ent(new T.CylinderGeometry(0.11, 0.11, 0.16, 16), cx-0.13, FF+0.66, cz+dz, "#c8a86a", 0, 0, 0.35);
    { const af=signTex(256,128,(c,W,Hh)=>{ const cols=["#c9662a","#e0b24a","#6b8f3a","#8a3a22","#e8dcc0"]; for(let i=0;i<10;i++){ c.fillStyle=cols[i%5]; c.fillRect(i*26,0,26,Hh); } c.fillStyle="rgba(255,255,255,0.15)"; for(let y=0;y<Hh;y+=8) c.fillRect(0,y,W,2); });
      const am=new T.MeshStandardMaterial({map:af, roughness:1.0});
      const hang=new T.Mesh(boxGeo(0.02, 0.34, 0.92), am); hang.position.set(cx-0.194, FF+0.73, cz-0.30); scene.add(hang);
      const top=new T.Mesh(boxGeo(0.27, 0.02, 0.92), am); top.position.set(cx-0.32, FF+0.916, cz-0.30); scene.add(top); }
    addCol(cx-0.45, cx+0.45, cz-1.20, cz+1.20, FF-0.5, FF+0.6);
    for(const dz of [-0.6, 0.6]) addSeat(cx+0.12, cz+dz, FF, -Math.PI/2, "THE COUCH");
    { const rt=signTex(256,256,(x,W,Hh)=>{ const cols=["#6a2a1e","#3d4a2e","#8a6a3e","#5a3e2a","#2e3a5a"]; for(let i=0;i<24;i++){ x.fillStyle=cols[i%5]; x.beginPath(); x.arc(W/2,Hh/2,W/2-i*5.2,0,7); x.fill(); } });
      const g=new T.CircleGeometry(1, 48); g.scale(1.5, 1.1, 1);
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:rt, roughness:1.0, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.position.set(120.0, FF+0.012, cz); m.rotation.set(-Math.PI/2, 0, Math.PI/2); scene.add(m); }
    B(0.60, 0.05, 1.10, 119.9, FF+0.43, cz, "#7a5434"); for(const dx of [-0.25,0.25]) for(const dz of [-0.48,0.48]) B(0.05, 0.40, 0.05, 119.9+dx, FF+0.20, cz+dz, "#6a4428");
    B(0.30, 0.02, 0.22, 119.85, FF+0.465, cz-0.2, "#c8b88a"); C(0.04, 0.10, 120.0, FF+0.509, cz+0.25, "#e8e2d2", 14); B(0.16, 0.025, 0.06, 119.8, FF+0.4685, cz+0.05, "#1a1a1c");
    addCol(119.55, 120.25, cz-0.58, cz+0.58, FF-0.5, FF+0.48);
    { const rx=120.9, rz=Z+43.3, ry=-0.6, s=Math.sin(ry), c=Math.cos(ry), P=(lx,lz)=>[rx+lx*c+lz*s, rz-lx*s+lz*c];
      const q=(w,h,d,lx,ly,lz)=>{ const p=P(lx,lz); B(w,h,d,p[0],FF+ly,p[1],"#4a5a3a",ry); };
      q(0.82,0.40,0.84,0,0.20,0); q(0.82,0.70,0.22,0,0.75,0.32); q(0.12,0.30,0.84,-0.36,0.55,0); q(0.12,0.30,0.84,0.36,0.55,0);
      addColOB(rx, rz, ry, 0.43, 0.44, FF-0.5, FF+0.6); addSeat(rx-s*0.08, rz-c*0.08, FF, ry, "THE RECLINER"); }
    // the set on its stand against the hall wall, the rabbit ears on it
    { const tz=Z+41.4;
      B(0.42, 0.62, 1.10, PA-0.24, FF+0.31, tz, "#5a3a22"); B(0.46, 0.62, 0.96, PA-0.30, FF+0.93, tz, "#2a2420");
      push("pic:vend:soda", planeGeo(0.80, 0.50, 0), PA-0.537, FF+0.95, tz, -Math.PI/2, "#3a5a7a");
      for(const sd of [-1,1]) tubeE(V3(PA-0.30, FF+1.24, tz), V3(PA-0.20, FF+1.60, tz+sd*0.25), 0.004, "#c9cbcc");
      addCol(PA-0.54, PA, tz-0.58, tz+0.58, FF-0.5, FF+1.3); }
    // the piano against the west wall at the front, its stool, the hymnal open on it
    { const pz=Z+35.8, px=IX0+0.32;
      B(0.58, 1.26, 1.50, px, FF+0.63, pz, "#3a2418"); B(0.30, 0.04, 1.46, px+0.40, FF+0.74, pz, "#3a2418");
      B(0.16, 0.02, 1.22, px+0.36, FF+0.765, pz, "#f4f0e2"); for(let k=0;k<26;k++) if(k%7!==2 && k%7!==6) B(0.10, 0.02, 0.012, px+0.33, FF+0.782, pz-0.58+k*0.046, "#141414");
      B(0.02, 0.24, 0.40, px+0.305, FF+1.08, pz, "#f0e8d4");
      C(0.17, 0.48, px+0.85, FF+0.24, pz, "#3a2418", 18); addCol(IX0, px+0.42, pz-0.76, pz+0.76, FF-0.5, FF+1.3);
      addSeat(px+0.85, pz, FF, Math.PI/2, "THE PIANO STOOL");
      addUse(px+1.1, pz, FF, "PLAY THE PIANO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", px, pz); toast(["“HEART AND SOUL”, THE TOP HALF, WRONG","THE MIDDLE C STICKS. IT HAS SINCE 1987","A HYMN FROM THE OPEN BOOK, SLOWLY"][(Math.random()*3)|0],"#e8c46a"); }, 0.9); }
    // a rocker by the front window, the grandfather clock by the hall, a floor lamp, the bookcase in the back corner
    { const rx=121.3, rz=Z+35.3; B(0.50, 0.05, 0.46, rx, FF+0.44, rz, "#6a4428"); B(0.50, 0.70, 0.05, rx, FF+0.82, rz-0.22, "#6a4428");
      for(const dx of [-0.22,0.22]) ent(new T.TorusGeometry(0.40, 0.02, 6, 24, 1.2), rx+dx, FF+0.30, rz+0.02, "#6a4428", 0, Math.PI/2, -0.6);
      addSeat(rx, rz, FF, Math.PI, "A ROCKING CHAIR"); addCol(rx-0.28, rx+0.28, rz-0.26, rz+0.26, FF-0.5, FF+0.6); }
    { const gx=PA-0.24, gz=Z+38.4;
      B(0.40, 2.05, 0.52, gx, FF+1.025, gz, "#4a2a18"); B(0.44, 0.08, 0.56, gx, FF+2.09, gz, "#4a2a18");
      C(0.15, 0.03, gx-0.215, FF+1.72, gz, "#f4ecd8", 28, 0, 0, Math.PI/2); B(0.02, 0.50, 0.30, gx-0.21, FF+0.95, gz, "#c8a24a");
      addCol(gx-0.22, PA, gz-0.28, gz+0.28, FF-0.5, FF+2.1); }
    C(0.14, 0.03, IX0+0.40, FF+0.019, Z+43.4, "#3a3a3c", 18); C(0.012, 1.45, IX0+0.40, FF+0.75, Z+43.4, "#3a3a3c", 10);
    ent(new T.CylinderGeometry(0.13, 0.21, 0.26, 20, 1, true), IX0+0.40, FF+1.55, Z+43.4, "#e8dcc0");
    LAMPS.push({x:IX0+0.45, y:FF+1.45, z:Z+43.3, color:0xffd29a, intensity:0.55, dist:7, decay:1.5, indoor:true, vol:[IX0, PA, IZ0, IZ1, FF-0.5, CL]});
    B(1.00, 1.80, 0.30, 117.2, FF+0.90, IZ1-0.17, "#6a4428");
    for(let s2=0;s2<4;s2++) for(let k=0;k<9;k++) B(0.04+((k+s2)%3)*0.01, 0.20+((k*7+s2*3)%4)*0.02, 0.20, 117.2-0.40+k*0.095, FF+0.25+s2*0.42, IZ1-0.24, ["#7a1a12","#1f3f6a","#2f5a2a","#c8a23a","#5a3a22"][(k+s2)%5]);
    addCol(116.68, 117.72, IZ1-0.36, IZ1, FF-0.5, FF+1.8);
    // pictures: a barn in a field over the piano, the family at the fair, the farm from the air (every farm has that one)
    const frame=(w,h,x,y,z,ry,draw)=>{ const cw=Math.round(w*400), ch=Math.round(h*400);
      const t=signTex(cw,ch,(c,W,Hh)=>{ c.fillStyle="#5a3a22"; c.fillRect(0,0,W,Hh); c.save(); c.beginPath(); c.rect(W*0.08,Hh*0.08,W*0.84,Hh*0.84); c.clip(); c.translate(W*0.08,Hh*0.08); draw(c,W*0.84,Hh*0.84); c.restore(); });
      signPanel(w, h, t, x, y, z, ry, false); };
    frame(0.50, 0.40, IX0+0.014, FF+1.75, Z+35.8, Math.PI/2, (c,W,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#8ab0d0"); g.addColorStop(0.6,"#c8d8c0"); g.addColorStop(1,"#5a7a3a"); c.fillStyle=g; c.fillRect(0,0,W,Hh);
      c.fillStyle="#8a2a1e"; c.fillRect(W*0.55,Hh*0.45,W*0.30,Hh*0.30); c.fillStyle="#5a5a5a"; c.beginPath(); c.moveTo(W*0.52,Hh*0.45); c.lineTo(W*0.70,Hh*0.30); c.lineTo(W*0.88,Hh*0.45); c.fill(); });
    frame(0.36, 0.46, IX0+0.014, FF+1.62, Z+42.7, Math.PI/2, (c,W,Hh)=>{ c.fillStyle="#d8ccb4"; c.fillRect(0,0,W,Hh);
      for(const [px,ph,col] of [[0.3,0.55,"#3a3a5a"],[0.55,0.62,"#5a3a2a"],[0.75,0.45,"#7a2a2a"]]){ c.fillStyle=col; c.fillRect(W*(px-0.08),Hh*(1-ph),W*0.16,Hh*ph); c.fillStyle="#e8c8a8"; c.beginPath(); c.arc(W*px,Hh*(0.95-ph),W*0.07,0,7); c.fill(); } });
    frame(0.80, 0.56, PA-PIN-0.014, FF+1.70, Z+39.75, -Math.PI/2, (c,W,Hh)=>{ c.fillStyle="#6a8a3a"; c.fillRect(0,0,W,Hh); c.fillStyle="#8a9a4a"; c.fillRect(0,0,W*0.4,Hh); c.fillStyle="#a29d92"; c.fillRect(W*0.45,0,W*0.06,Hh);
      c.fillStyle="#f2f0ea"; c.fillRect(W*0.20,Hh*0.40,W*0.14,Hh*0.12); c.fillStyle="#8a2a1e"; c.fillRect(W*0.60,Hh*0.30,W*0.18,Hh*0.20); c.fillStyle="#b8b2a4"; c.beginPath(); c.arc(W*0.84,Hh*0.36,W*0.04,0,7); c.fill(); });
    addZone(IX0, PA, IZ0, IZ1, FF-0.5, CL, "THE WEIRS' PARLOUR", true); }

  /* ---- downstairs: the hall ---- */
  { const hx=(HA+ST.x0)/2;
    { const m=new T.Mesh(new T.PlaneGeometry(0.90, IZ1-IZ0-0.8), new T.MeshStandardMaterial({map:signTex(64,256,(c,W,Hh)=>{ c.fillStyle="#6a2a22"; c.fillRect(0,0,W,Hh); c.strokeStyle="#c8a86a"; c.lineWidth=4; c.strokeRect(6,6,W-12,Hh-12); for(let y=20;y<Hh;y+=24){ c.fillStyle="#2a4a5a"; c.fillRect(W/2-6,y,12,12); } }), roughness:1, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.rotation.x=-Math.PI/2; m.position.set(hx, FF+0.012, (IZ0+IZ1)/2); scene.add(m); }
    // the coats on a peg rail by the door, the boots under them; the telephone table; the light
    B(0.04, 0.10, 1.00, HA+PIN+0.028, FF+1.70, Z+35.0, "#6a4428");
    for(let k=0;k<4;k++){ C(0.012, 0.10, HA+PIN+0.09, FF+1.70, Z+34.65+k*0.24, "#3a3a3a", 8, 0, 0, Math.PI/2);
      if(k!==2) B(0.20+k*0.012, 0.70, 0.21, HA+PIN+0.16+k*0.006, FF+1.30, Z+34.65+k*0.24, ["#3a4a6a","#6a3a22","","#c4a43a"][k]); }
    for(const [dx,c] of [[0,"#2a2a24"],[0.18,"#3a2a1a"]]) B(0.14, 0.36, 0.28, HA+PIN+0.11+dx, FF+0.18, Z+35.65, c);
    B(0.36, 0.72, 0.60, HA+PIN+0.20, FF+0.36, Z+42.6, "#6a4428"); B(0.20, 0.08, 0.12, HA+PIN+0.20, FF+0.76, Z+42.5, "#1a1a1c");
    C(0.05, 0.22, HA+PIN+0.20, FF+0.83, Z+42.85, "#c8b88a", 14);
    addCol(HA, HA+0.42, Z+42.28, Z+42.92, FF-0.5, FF+0.8);
    tubeE(V3(hx, CL, Z+37.0), V3(hx, CL-0.25, Z+37.0), 0.006, "#8a7a5a"); ent(new T.SphereGeometry(0.13, 18, 12), hx, CL-0.38, Z+37.0, "#f4ecd8");
    LAMPS.push({x:hx, y:CL-0.5, z:Z+37.0, color:0xffd8a8, intensity:0.6, dist:7, decay:1.4, indoor:true, vol:[HW[0], HW[1], IZ0, IZ1, FF-0.5, CL]});
    addZone(HA, HB, IZ0, IZ1, FF-0.5, CL, "THE WEIRS' HALL", true); }

  /* ---- downstairs: the kitchen ---- */
  { const KC="#c9b98a", TOPC="#e8e2d2", cz0=Z+35.2, cz1=Z+42.2, kx=IX1-0.31, SZ=(EAST[1].a+EAST[1].b)/2;
    // counters down the east wall, the sink under the window, upper cabinets either side of the windows
    B(0.62, 0.88, cz1-cz0, kx, FF+0.44, (cz0+cz1)/2, KC); B(0.66, 0.04, cz1-cz0+0.02, kx-0.02, FF+0.90, (cz0+cz1)/2, TOPC);
    for(let z=cz0+0.30; z<cz1-0.2; z+=0.60){ B(0.02, 0.70, 0.54, kx-0.32, FF+0.45, z, "#b9a87a"); B(0.03, 0.02, 0.10, kx-0.345, FF+0.72, z, "#8a8d90"); }
    B(0.50, 0.02, 0.84, kx-0.04, FF+0.915, SZ, "#c9cbcc");
    for(const dz of [-0.2,0.2]) B(0.40, 0.012, 0.36, kx-0.04, FF+0.924, SZ+dz, "#6a6d70");
    C(0.012, 0.26, kx+0.20, FF+1.05, SZ, "#c9cbcc", 10); C(0.012, 0.18, kx+0.12, FF+1.17, SZ, "#c9cbcc", 10, 0, 0, Math.PI/2);
    for(const [a,b] of [[cz0, EAST[0].a-0.12],[EAST[0].b+0.12, EAST[1].a-0.12],[EAST[1].b+0.12, cz1]]) if(b-a>0.3){
      B(0.34, 0.72, b-a, IX1-0.185, FF+1.80, (a+b)/2, KC);
      const n=Math.max(1, Math.round((b-a)/0.5)), dw=(b-a)/n;
      for(let i=0;i<n;i++) B(0.02, 0.66, dw-0.03, IX1-0.365, FF+1.80, a+dw*(i+0.5), "#b9a87a"); }
    // on the counter: the dish rack, the canisters, the cookie jar, the paper towels, the radio
    B(0.30, 0.10, 0.44, kx-0.02, FF+0.975, SZ-0.75, "#e8e8e4");
    for(let k=0;k<4;k++) C(0.07-k*0.008, 0.20-k*0.03, kx+0.12, FF+0.925+(0.20-k*0.03)/2, cz0+0.3+k*0.17, "#d8d0b8", 16);
    C(0.10, 0.22, kx+0.05, FF+1.035, cz1-0.4, "#8a5a8a", 18); C(0.05, 0.28, IX1-0.10, FF+1.38, cz1-0.9, "#f4f2ec", 14, Math.PI/2);
    B(0.12, 0.18, 0.32, IX1-0.12, FF+1.015, EAST[1].b+0.30, "#7a1a12");
    addCol(kx-0.33, IX1, cz0, cz1, FF-0.5, FF+0.92);
    // gingham valances over the two windows
    for(const o of [EAST[0], EAST[1]]){ const t=signTex(64,64,(c,W,Hh)=>{ c.fillStyle="#f4f0e8"; c.fillRect(0,0,W,Hh); c.fillStyle="rgba(196,42,26,0.5)"; for(let k=0;k<W;k+=16){ c.fillRect(k,0,8,Hh); c.fillRect(0,k,W,8); } });
      const m=new T.Mesh(new T.PlaneGeometry(o.b-o.a+0.10, 0.40), new T.MeshStandardMaterial({map:t, roughness:1, side:T.DoubleSide})); m.position.set(IX1-0.06, o.head-0.22, (o.a+o.b)/2); m.rotation.y=-Math.PI/2; scene.add(m);
      tubeE(V3(IX1-0.05, o.head-0.02, o.a-0.08), V3(IX1-0.05, o.head-0.02, o.b+0.08), 0.008, "#c9cbcc"); }
    // the range under its hood, and the fridge, on the back wall
    const RX=130.4, RZ=IZ1-0.345;
    B(0.76, 0.92, 0.66, RX, FF+0.46, RZ, "#f2f0ea"); B(0.76, 0.06, 0.66, RX, FF+0.95, RZ, "#1d1d1e");
    for(const [dx,dz] of [[-0.2,-0.15],[0.2,-0.15],[-0.2,0.15],[0.2,0.15]]) C(0.09, 0.012, RX+dx, FF+0.986, RZ+dz, "#3a3a3a", 20);
    B(0.76, 0.22, 0.06, RX, FF+1.07, IZ1-0.045, "#f2f0ea"); B(0.60, 0.30, 0.04, RX, FF+0.45, RZ-0.35, "#2a2a2c");
    C(0.10, 0.12, RX-0.2, FF+1.058, RZ-0.15, "#5a5a5c", 18); C(0.13, 0.025, RX+0.2, FF+1.01, RZ+0.15, "#1a1a1c", 20);
    B(0.80, 0.30, 0.50, RX, FF+1.80, IZ1-0.265, "#d8d4c8");
    B(0.80, 1.72, 0.72, IX1-0.42, FF+0.86, IZ1-0.38, "#9a9a6a"); B(0.04, 0.50, 0.04, IX1-0.76, FF+1.20, IZ1-0.76, "#c9cbcc"); B(0.04, 0.30, 0.04, IX1-0.76, FF+0.55, IZ1-0.76, "#c9cbcc");
    for(let k=0;k<5;k++) B(0.10, 0.08, 0.006, IX1-0.42+(k%3-1)*0.2, FF+1.30+((k/3)|0)*0.12, IZ1-0.745, ["#c41a1a","#f2c418","#1f4fd8","#2f9a3c","#f2f0ea"][k]);
    addCol(RX-0.40, IX1, IZ1-0.75, IZ1, FF-0.5, FF+1.75);
    // the hutch between the front windows, the good plates stood up in it
    { const hx=128.9, hz=IZ0+0.24;
      B(1.20, 0.86, 0.46, hx, FF+0.43, hz, "#7a5434"); B(1.20, 0.04, 0.50, hx, FF+0.88, hz, "#8a6444"); B(1.12, 1.10, 0.30, hx, FF+1.45, hz-0.06, "#7a5434");
      for(let k=0;k<4;k++) C(0.12, 0.012, hx-0.39+k*0.26, FF+1.25, hz+0.06, "#f2f0ea", 20, Math.PI/2-0.25, 0, 0);
      for(let k=0;k<5;k++) C(0.04, 0.09, hx-0.44+k*0.22, FF+1.62, hz+0.02, "#e8e2d2", 12);
      addCol(hx-0.61, hx+0.61, IZ0, hz+0.26, FF-0.5, FF+2.0); }
    // the pantry cupboard on the hall wall; the coats and boots by the back door; the dog's bed and bowls
    B(0.50, 2.10, 1.00, KA+PIN+0.27, FF+1.05, Z+35.6, KC); for(const dz of [-0.25,0.25]) B(0.02, 1.96, 0.46, KA+PIN+0.53, FF+1.05, Z+35.6+dz, "#b9a87a");
    addCol(KA, KA+0.56, Z+35.08, Z+36.12, FF-0.5, FF+2.1);
    B(0.80, 0.08, 0.03, 126.2, FF+1.65, IZ1-0.03, "#6a4428");
    for(let k=0;k<3;k++){ C(0.012, 0.10, 125.9+k*0.3, FF+1.62, IZ1-0.07, "#3a3a3a", 8, Math.PI/2); B(0.27, 0.80, 0.14, 125.9+k*0.3, FF+1.24, IZ1-0.13-k*0.006, ["#4a5a3a","#7a5a3a","#3a4a6a"][k]); }
    for(let k=0;k<2;k++) for(const dx of [-0.07,0.07]) B(0.11, 0.34, 0.28, 125.85+k*0.38+dx, FF+0.17, IZ1-0.45, "#2a2a24");
    { const t=signTex(64,64,(c,W,Hh)=>{ c.fillStyle="#6a4a3a"; c.fillRect(0,0,W,Hh); c.fillStyle="#8a6a5a"; c.beginPath(); c.ellipse(W/2,Hh/2,W*0.38,Hh*0.38,0,0,7); c.fill(); });
      const m=new T.Mesh(new T.CylinderGeometry(0.40, 0.42, 0.10, 32), new T.MeshStandardMaterial({map:t, roughness:1})); m.position.set(126.3, FF+0.056, Z+42.2); scene.add(m);
      C(0.09, 0.05, 126.9, FF+0.032, Z+42.9, "#9a9da0", 18); C(0.09, 0.05, 127.12, FF+0.032, Z+42.9, "#9a9da0", 18); }
    // the table, four chairs, oilcloth on it, a pie under a towel, the coffee
    { const tx=128.4, tz=Z+38.2;
      B(0.92, 0.05, 1.40, tx, FF+0.76, tz, "#8a6a48"); for(const dx of [-0.40,0.40]) for(const dz of [-0.62,0.62]) B(0.06, 0.74, 0.06, tx+dx, FF+0.37, tz+dz, "#7a5a3a");
      { const t=signTex(64,64,(c,W,Hh)=>{ c.fillStyle="#f4f0e8"; c.fillRect(0,0,W,Hh); c.fillStyle="rgba(42,90,160,0.55)"; for(let k=0;k<W;k+=16){ c.fillRect(k,0,8,Hh); c.fillRect(0,k,W,8); } }); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(3,4);
        const m=new T.Mesh(boxGeo(1.00, 0.008, 1.48), new T.MeshStandardMaterial({map:t, roughness:0.6})); m.position.set(tx, FF+0.789, tz); scene.add(m); }
      C(0.135, 0.01, tx+0.1, FF+0.800, tz-0.2, "#e8e2d2", 24); C(0.13, 0.05, tx+0.1, FF+0.825, tz-0.2, "#c8843a", 24);
      ent(new T.SphereGeometry(0.15, 16, 8, 0, Math.PI*2, 0, Math.PI/2).scale(1, 0.4, 1), tx+0.1, FF+0.848, tz-0.2, "#f4f0e8");      // (the towel over it)
      C(0.045, 0.10, tx-0.2, FF+0.848, tz+0.35, "#e8e2d2", 16); C(0.06, 0.16, tx-0.25, FF+0.875, tz-0.4, "#3a3a3c", 16);
      addCol(tx-0.48, tx+0.48, tz-0.72, tz+0.72, FF-0.5, FF+0.8);
      for(const [dx,dz,ry] of [[0,-0.95,0],[0,0.95,Math.PI],[-0.72,-0.3,Math.PI/2],[0.72,0.3,-Math.PI/2]]){
        const cx=tx+dx, cz=tz+dz, s=Math.sin(ry), c=Math.cos(ry);
        B(0.42, 0.04, 0.40, cx, FF+0.46, cz, "#7a5a3a");
        for(const [a,b] of [[-0.18,-0.17],[0.18,-0.17],[-0.18,0.17],[0.18,0.17]]) B(0.035, 0.44, 0.035, cx+a*c+b*s, FF+0.22, cz-a*s+b*c, "#6a4a2a");
        B(0.40, 0.48, 0.035, cx-0.19*s, FF+0.74, cz-0.19*c, "#7a5a3a", ry);
        addSeat(cx, cz, FF, ry+Math.PI, "A KITCHEN CHAIR"); }
      addUse(tx, tz-1.4, FF, "HAVE SOME PIE", ()=>toast(["APPLE, STILL WARM. A NOTE: “FOR AFTER SUPPER. MEANS YOU, DALE”","YOU CUT A SLIVER. NOBODY WILL NOTICE A SLIVER","A FORK'S ALREADY IN IT"][(Math.random()*3)|0],"#e8c46a"), 1.0);
      tubeE(V3(tx, CL, tz), V3(tx, CL-0.45, tz), 0.006, "#2a2a2a");
      ent(new T.CylinderGeometry(0.08, 0.22, 0.16, 24, 1, true), tx, CL-0.52, tz, "#e8e2c8");
      push("tube", new T.SphereGeometry(0.05, 14, 10), tx, CL-0.56, tz, 0, "#ffffff");
      LAMPS.push({x:tx, y:CL-0.7, z:tz, color:0xffd8a8, intensity:0.85, dist:8, decay:1.4, indoor:true, vol:[HW[1], IX1, IZ0, IZ1, FF-0.5, CL]}); }
    // the feed store's calendar, the clock over the back door, the wall phone with its long cord
    sign(0.36, 0.54, (c,W,Hh)=>{ c.fillStyle="#f4f0e2"; c.fillRect(0,0,W,Hh); c.fillStyle="#2a6a2a"; c.fillRect(0,0,W,Hh*0.42);
        say(c,"OCTOBER",W/2,Hh*0.15,W*0.7,Hh*0.10,"#f4f0e2","800","Arial"); c.fillStyle="#c8a23a"; c.beginPath(); c.arc(W/2,Hh*0.30,W*0.14,0,7); c.fill();
        for(let r2=0;r2<5;r2++) for(let k=0;k<7;k++){ c.strokeStyle="#bbb"; c.strokeRect(W*0.06+k*W*0.126, Hh*0.46+r2*Hh*0.085, W*0.126, Hh*0.085); }
        say(c,"MILLER FEED & SEED · EDINBORO",W/2,Hh*0.94,W*0.84,Hh*0.06,"#2a2a2a","700","Arial"); }, KA+PIN+0.008, FF+1.55, Z+38.2, Math.PI/2, false, 180);
    C(0.16, 0.03, 127.46, FF+2.36, IZ1-0.032, "#f2f0ea", 28, Math.PI/2, 0, 0);
    B(0.10, 0.22, 0.08, KA+PIN+0.05, FF+1.45, Z+42.4, "#c8b88a");
    for(let k=0;k<6;k++) tubeE(V3(KA+PIN+0.06, FF+1.34-k*0.10, Z+42.4+(k%2?0.03:-0.03)), V3(KA+PIN+0.06, FF+1.24-k*0.10, Z+42.4+(k%2?-0.03:0.03)), 0.004, "#c8b88a");
    addZone(KA, IX1, IZ0, IZ1, FF-0.5, CL, "THE WEIRS' KITCHEN", true); }

  /* ---- upstairs ---- */
  { const ux=(HA+ST.x0)/2;
    // the upper hall: a runner, the photographs up the wall, a little table with a lamp, the light
    { const m=new T.Mesh(new T.PlaneGeometry(0.80, IZ1-IZ0-0.6), new T.MeshStandardMaterial({map:signTex(64,256,(c,W,Hh)=>{ c.fillStyle="#3a4a6a"; c.fillRect(0,0,W,Hh); c.strokeStyle="#c8a86a"; c.lineWidth=4; c.strokeRect(6,6,W-12,Hh-12); }), roughness:1, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.rotation.x=-Math.PI/2; m.position.set(ux, FF2+0.012, (IZ0+IZ1)/2); scene.add(m); }
    { const tx=HA+PIN+0.22, tz=IZ0+0.45;
      B(0.40, 0.72, 0.60, tx, FF2+0.36, tz, "#6a4428"); C(0.08, 0.30, tx, FF2+0.87, tz, "#c8b88a", 16);
      ent(new T.CylinderGeometry(0.10, 0.16, 0.18, 20, 1, true), tx, FF2+1.11, tz, "#f0e8d4"); addCol(HA, tx+0.22, tz-0.32, tz+0.32, FF2-0.5, FF2+0.8); }
    for(let k=0;k<5;k++){ const pz=Z+41.4+k*0.5, py=FF2+1.45+(k%2)*0.22, fx=HA+PIN+0.018;
      B(0.02, 0.30, 0.24, fx, py, pz, "#3a2a1a"); B(0.006, 0.22, 0.16, fx+0.013, py, pz, ["#8a9aaa","#aa9a8a","#9aaa8a","#aaa08a","#8a8aaa"][k]); }
    ent(new T.SphereGeometry(0.14, 18, 10, 0, Math.PI*2, 0, Math.PI/2), ux, UC-0.005, Z+38.0, "#f4ecd8", Math.PI, 0, 0);
    LAMPS.push({x:ux, y:UC-0.3, z:Z+38.0, color:0xffd8a8, intensity:0.6, dist:8, decay:1.4, indoor:true, vol:[HW[0], HW[1], IZ0, IZ1, FF2-0.5, UC]});
    addZone(HA, HB, IZ0, IZ1, FF2-0.5, UC, "THE UPSTAIRS HALL", true);
    // a bed: rails and posts, a mattress, a quilt in squares over it, the pillows, a headboard against the wall it backs on
    const quilt=(cols)=>{ const t=signTex(128,128,(c,W,Hh)=>{ for(let i=0;i<8;i++) for(let j=0;j<8;j++){ c.fillStyle=cols[(i*3+j*5)%cols.length]; c.fillRect(i*16,j*16,16,16); c.strokeStyle="rgba(255,255,255,0.35)"; c.strokeRect(i*16+1,j*16+1,14,14); } }); return new T.MeshStandardMaterial({map:t, roughness:1}); };
    const bed=(x, z, w, L, ry, cols, wood)=>{ const s=Math.sin(ry), c=Math.cos(ry), P=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];
      const q=(bw,bh,bd,lx,ly,lz,col)=>{ const p=P(lx,lz); B(bw,bh,bd,p[0],FF2+ly,p[1],col,ry); };
      q(w+0.06, 0.22, L+0.06, 0, 0.20, 0, wood);
      for(const [lx,lz] of [[-w/2,-L/2],[w/2,-L/2],[-w/2,L/2],[w/2,L/2]]) q(0.07, 0.30, 0.07, lx, 0.15, lz, wood);
      q(w, 0.20, L, 0, 0.41, 0, "#f4f2ea");
      q(w*0.36, 0.10, 0.32, -w*0.24, 0.565, -L/2+0.24, "#f4f2ec"); if(w>1.2) q(w*0.36, 0.10, 0.32, w*0.24, 0.565, -L/2+0.24, "#f4f2ec");
      q(w+0.10, 1.05, 0.06, 0, 0.52, -L/2-0.06, wood);
      const p=P(0, 0.14), m=new T.Mesh(boxGeo(w+0.12, 0.03, L*0.80), quilt(cols)); m.position.set(p[0], FF2+0.525, p[1]); m.rotation.y=ry; scene.add(m);
      addColOB(x-0.03*s, z-0.03*c, ry, w/2+0.06, L/2+0.07, FF2-0.5, FF2+0.6); };
    // the front west room, theirs: the bed against the cross wall, nightstands and lamps, the dresser and its mirror, the cedar chest
    { const bx2=119.3, bz=ZM-1.20;
      bed(bx2, bz, 1.52, 2.0, Math.PI, ["#8a2a22","#e8dcc0","#3a5a8a","#c8a23a","#5a7a3a"], "#6a4428");
      addSeat(bx2-0.50, bz-0.3, FF2+0.08, Math.PI/2, "THE BED");
      for(const dx of [-1.15, 1.15]){ B(0.46, 0.60, 0.40, bx2+dx, FF2+0.30, ZM-HT/2-0.24, "#6a4428"); C(0.07, 0.26, bx2+dx, FF2+0.73, ZM-HT/2-0.24, "#c8b88a", 16);
        ent(new T.CylinderGeometry(0.10, 0.15, 0.17, 20, 1, true), bx2+dx, FF2+0.95, ZM-HT/2-0.24, "#f0e8d4"); addCol(bx2+dx-0.24, bx2+dx+0.24, ZM-HT/2-0.45, ZM-HT/2, FF2-0.5, FF2+0.62); }
      B(1.10, 0.46, 0.50, bx2, FF2+0.23, bz-1.30, "#8a5a3a"); B(1.12, 0.03, 0.52, bx2, FF2+0.475, bz-1.30, "#7a4a2a");
      addCol(bx2-0.56, bx2+0.56, bz-1.56, bz-1.04, FF2-0.5, FF2+0.5);
      { const dx=PA-PIN-0.26; B(0.50, 0.90, 1.30, dx, FF2+0.45, Z+35.6, "#6a4428"); for(let k=0;k<3;k++) for(const dz of [-0.32,0.32]) B(0.02, 0.24, 0.56, dx-0.255, FF2+0.17+k*0.28, Z+35.6+dz, "#7a5434");
        B(0.04, 0.80, 0.70, PA-PIN-0.05, FF2+1.40, Z+35.6, "#6a4428"); push("glass", planeGeo(0.62, 0.72, 0), PA-PIN-0.077, FF2+1.40, Z+35.6, -Math.PI/2, "#ffffff");
        addCol(PA-0.54, PA, Z+34.95, Z+36.25, FF2-0.5, FF2+0.92); }
      { const rt=signTex(128,128,(x,W,Hh)=>{ const cols=["#6a4a8a","#c8a86a","#3a6a5a","#8a3a3a"]; for(let i=0;i<10;i++){ x.fillStyle=cols[i%4]; x.fillRect(0,i*13,W,13); } });
        const m=new T.Mesh(new T.PlaneGeometry(1.4, 0.9), new T.MeshStandardMaterial({map:rt, roughness:1, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2})); m.rotation.x=-Math.PI/2; m.position.set(120.9, FF2+0.012, Z+36.0); scene.add(m); }
      LAMPS.push({x:bx2-1.15, y:FF2+1.0, z:ZM-0.4, color:0xffd29a, intensity:0.5, dist:7, decay:1.5, indoor:true, vol:[IX0, HW[0], IZ0, ZM, FF2-0.5, UC]});
      addZone(IX0, PA, IZ0, ZM-HT/2, FF2-0.5, UC, "THE FRONT BEDROOM", true); }
    // the back west room, the kids': two beds, the desk between, a toy chest, the tractor on the wall, the fair's ribbons
    { const bz=ZM+HT/2+PIN+0.04+1.035+0.03;
      for(const [bx2,cols,sy] of [[117.25,["#2a4a8a","#c41a1a","#f2f0ea","#3a6a3a"],-Math.PI/2],[120.7,["#c86a8a","#f2e2a0","#6a8ac8","#f2f0ea"],Math.PI/2]]){
        bed(bx2, bz, 0.98, 1.95, 0, cols, "#c8a878"); addSeat(bx2-0.42*Math.sin(sy), bz+0.2, FF2+0.08, sy, "A BED"); }
      B(0.90, 0.48, 0.48, 118.95, FF2+0.24, IZ1-0.30, "#5a7aa8"); B(0.92, 0.04, 0.50, 118.95, FF2+0.50, IZ1-0.30, "#4a6a98");
      addCol(118.48, 119.42, IZ1-0.56, IZ1, FF2-0.5, FF2+0.52);
      { const dz=ZM+HT/2+PIN+0.30; B(1.00, 0.04, 0.55, 119.0, FF2+0.74, dz, "#c8a878"); for(const dx of [-0.46,0.46]) B(0.04, 0.72, 0.50, 119.0+dx, FF2+0.37, dz, "#c8a878");
        addCol(118.48, 119.52, ZM+HT/2, dz+0.30, FF2-0.5, FF2+0.78);
        C(0.05, 0.18, 118.75, FF2+0.852, dz+0.05, "#c41a1a", 14); B(0.30, 0.02, 0.22, 119.2, FF2+0.772, dz, "#f4f0e2"); }
      sign(0.60, 0.42, (c,W,Hh)=>{ c.fillStyle="#f2e8c8"; c.fillRect(0,0,W,Hh); c.fillStyle="#2f6a2a"; c.fillRect(W*0.2,Hh*0.35,W*0.4,Hh*0.28); c.fillRect(W*0.5,Hh*0.22,W*0.16,Hh*0.20);
          c.fillStyle="#141414"; c.beginPath(); c.arc(W*0.32,Hh*0.70,Hh*0.14,0,7); c.fill(); c.beginPath(); c.arc(W*0.62,Hh*0.72,Hh*0.09,0,7); c.fill();
          c.fillStyle="#f2c418"; c.beginPath(); c.arc(W*0.32,Hh*0.70,Hh*0.06,0,7); c.fill(); say(c,"NOTHING RUNS LIKE A DEERE",W/2,Hh*0.13,W*0.80,Hh*0.13,"#2f6a2a","800","Arial"); },
        117.8, FF2+1.55, ZM+HT/2+PIN+0.012, 0, false, 240);
      for(let k=0;k<3;k++){ const col=["#1f4fd8","#c41a1a","#f2f0ea"][k];
        C(0.05, 0.012, 120.3+k*0.16, FF2+1.62, ZM+HT/2+PIN+0.014, col, 18, Math.PI/2); B(0.05, 0.16, 0.006, 120.3+k*0.16, FF2+1.50, ZM+HT/2+PIN+0.012, col); }
      ent(new T.SphereGeometry(0.09, 16, 12), 120.7, FF2+0.62, bz+0.6, "#8a5a2a");                                // a ball glove left on the bed
      LAMPS.push({x:119.0, y:UC-0.3, z:Z+41.6, color:0xffd8a8, intensity:0.5, dist:7, decay:1.5, indoor:true, vol:[IX0, HW[0], ZM, IZ1, FF2-0.5, UC]});
      addZone(IX0, PA, ZM+HT/2, IZ1, FF2-0.5, UC, "THE KIDS' ROOM", true); }
    // the front east room, the sewing room: the daybed, the treadle machine at the window, a dress form, the shelves of cloth, the ironing board
    { const DX=KA+PIN;
      bed(DX+0.52, Z+36.9, 0.92, 1.95, 0, ["#e8dcc0","#8aa8c8","#c8a86a","#f2f0ea"], "#e8e2d4");
      addSeat(DX+0.92, Z+37.1, FF2+0.08, -Math.PI/2, "THE DAYBED");
      const mx=IX1-0.30, mz=(EAST[2].a+EAST[2].b)/2;
      B(0.46, 0.04, 0.90, mx, FF2+0.76, mz, "#5a3a22"); for(const dz of [-0.40,0.40]) B(0.40, 0.70, 0.04, mx, FF2+0.38, mz+dz, "#2a2a2c");
      B(0.30, 0.04, 0.50, mx, FF2+0.10, mz, "#2a2a2c"); B(0.22, 0.24, 0.40, mx+0.02, FF2+0.905, mz, "#1a1a1c"); B(0.08, 0.18, 0.10, mx+0.02, FF2+1.115, mz-0.12, "#1a1a1c");
      C(0.04, 0.03, mx+0.02, FF2+1.0, mz+0.22, "#c8b88a", 14, 0, 0, Math.PI/2);
      addCol(mx-0.24, IX1, mz-0.46, mz+0.46, FF2-0.5, FF2+1.0);
      { const fx=IX1-0.36, fz=IZ0+0.36; C(0.12, 0.03, fx, FF2+0.02, fz, "#3a3a3a", 16); C(0.012, 1.10, fx, FF2+0.57, fz, "#3a3a3a", 8);
        ent(new T.SphereGeometry(0.20, 18, 14).scale(1, 1.6, 0.8), fx, FF2+1.32, fz, "#c8b8a0"); addCol(fx-0.20, fx+0.20, fz-0.18, fz+0.18, FF2-0.5, FF2+1.7); }
      { const sx=129.4, sz=ZM-HT/2-PIN-0.18;
        B(1.36, 1.50, 0.02, sx, FF2+0.75, ZM-HT/2-PIN-0.02, "#d8d2c4"); for(const dx of [-0.665,0.665]) B(0.03, 1.50, 0.34, sx+dx, FF2+0.75, sz, "#e8e2d4");
        for(const y of [0.06, 0.52, 1.00, 1.485]) B(1.30, 0.03, 0.32, sx, FF2+y, sz, "#e8e2d4");
        for(let s2=0;s2<3;s2++) for(let k=0;k<6;k++) B(0.18, 0.30, 0.26, sx-0.55+k*0.22, FF2+0.075+s2*0.475+0.165, sz+0.01, ["#c86a6a","#6a8ac8","#e8d8a8","#7aa86a","#a86ac8","#f2f0ea"][(k+s2*2)%6]);
        addCol(sx-0.70, sx+0.70, ZM-HT/2-0.38, ZM-HT/2, FF2-0.5, FF2+1.5); }
      { const ix=128.8, iz=Z+35.6, ia=0.15;
        ent(boxGeo(1.20, 0.025, 0.34), ix, FF2+0.82, iz, "#e8e2d4", 0, ia, 0); for(const t of [-1,1]) ent(boxGeo(0.02, 0.86, 0.02), ix+t*0.15, FF2+0.40, iz, "#8a8d90", 0, ia, t*0.35);
        B(0.16, 0.10, 0.08, ix+0.4, FF2+0.885, iz, "#c9cbcc", ia); addCol(ix-0.62, ix+0.62, iz-0.26, iz+0.26, FF2-0.5, FF2+0.9); }
      LAMPS.push({x:IX1-0.6, y:FF2+1.6, z:mz, color:0xfff0d8, intensity:0.5, dist:7, decay:1.5, indoor:true, vol:[HW[1], IX1, IZ0, ZM, FF2-0.5, UC]});
      addZone(KA, IX1, IZ0, ZM-HT/2, FF2-0.5, UC, "THE SEWING ROOM", true); }
    // the bath: the clawfoot tub under the window, the pedestal sink and its cabinet, the toilet, the towels, the hamper
    { const BX1=BW-HT/2-PIN, tz=IZ1-0.46;
      { const g=new T.CylinderGeometry(0.40, 0.34, 0.52, 32, 1, false); g.scale(2.1, 1, 1); ent(g, 126.85, FF2+0.40, tz, "#f4f2ec");
        ent(new T.CylinderGeometry(0.34, 0.34, 0.01, 32).scale(2.05, 1, 1), 126.85, FF2+0.672, tz, "#b8ccd2");
        for(const dx of [-0.62,0.62]) for(const dz of [-0.22,0.22]) ent(new T.SphereGeometry(0.06, 12, 10), 126.85+dx, FF2+0.08, tz+dz, "#b8963a");
        C(0.015, 0.30, 127.62, FF2+0.82, tz, "#c9cbcc", 12); C(0.012, 0.14, 127.55, FF2+0.96, tz, "#c9cbcc", 12, 0, 0, Math.PI/2);
        addCol(126.0, 127.72, tz-0.42, IZ1, FF2-0.5, FF2+0.68); }
      C(0.07, 0.72, BX1-0.30, FF2+0.36, Z+42.6, "#f4f2ec", 18); B(0.46, 0.14, 0.40, BX1-0.24, FF2+0.79, Z+42.6, "#f4f2ec"); B(0.30, 0.012, 0.26, BX1-0.26, FF2+0.866, Z+42.6, "#b8ccd2");
      B(0.12, 0.60, 0.46, BX1-0.07, FF2+1.42, Z+42.6, "#f0ece2"); push("glass", planeGeo(0.40, 0.54, 0), BX1-0.137, FF2+1.42, Z+42.6, -Math.PI/2, "#ffffff");
      addCol(BX1-0.46, BX1, Z+42.36, Z+42.84, FF2-0.5, FF2+0.86);
      B(0.22, 0.42, 0.40, BX1-0.12, FF2+0.66, Z+41.3, "#f4f2ec"); ent(new T.CylinderGeometry(0.20, 0.15, 0.40, 22).scale(1.3, 1, 1), BX1-0.42, FF2+0.20, Z+41.3, "#f4f2ec");
      ent(new T.CylinderGeometry(0.21, 0.21, 0.03, 22).scale(1.3, 1, 1), BX1-0.42, FF2+0.415, Z+41.3, "#f0ece2");
      addCol(BX1-0.70, BX1, Z+41.06, Z+41.54, FF2-0.5, FF2+0.85);
      { const tx=KA+PIN+0.04; tubeE(V3(tx, FF2+1.20, Z+42.4), V3(tx, FF2+1.20, Z+43.0), 0.012, "#c9cbcc"); B(0.03, 0.50, 0.50, tx+0.012, FF2+0.96, Z+42.7, "#6a9ac8"); }
      C(0.18, 0.55, 127.9, FF2+0.28, ZM+HT/2+0.40, "#c8b88a", 18); addCol(127.7, 128.1, ZM+HT/2+0.2, ZM+HT/2+0.6, FF2-0.5, FF2+0.6);
      LAMPS.push({x:127.0, y:UC-0.3, z:Z+41.6, color:0xfff4e8, intensity:0.5, dist:6, decay:1.5, indoor:true, vol:[HW[1], BW, ZM, IZ1, FF2-0.5, UC]});
      addZone(KA, BW-HT/2, ZM+HT/2, IZ1, FF2-0.5, UC, "THE BATHROOM", true); }
    // the storeroom through the sewing room: boxes, the crib, a trunk, a bare bulb
    { const sx0=BW+HT/2+PIN, rnd=_trng(808);
      for(let k=0;k<14;k++){ const w=0.40+rnd()*0.25, h=0.30+rnd()*0.22, x=sx0+0.35+(k%4)*0.62, z=IZ1-0.35-((k/4)|0)*0.62;
        B(w, h, w*0.9, x, FF2+h/2+0.004, z, ["#b8946a","#a88a62","#c8a87a"][k%3], rnd()*0.4-0.2); }
      addCol(sx0, IX1, IZ1-2.55, IZ1, FF2-0.5, FF2+0.6);
      { const cx=sx0+0.33; B(0.55, 0.06, 1.00, cx, FF2+0.45, ZM+HT/2+1.1, "#e8e2d4");
        for(const dx of [-0.26,0.26]) for(let k=0;k<9;k++) B(0.02, 0.50, 0.02, cx+dx, FF2+0.70, ZM+HT/2+0.65+k*0.11, "#e8e2d4");
        for(const dx of [-0.26,0.26]) B(0.03, 0.03, 1.00, cx+dx, FF2+0.95, ZM+HT/2+1.1, "#e8e2d4");
        for(const dz of [-0.48,0.48]) for(const dx of [-0.26,0.26]) B(0.04, 0.45, 0.04, cx+dx, FF2+0.225, ZM+HT/2+1.1+dz, "#e8e2d4");
        addCol(cx-0.30, cx+0.30, ZM+HT/2+0.58, ZM+HT/2+1.62, FF2-0.5, FF2+1.0); }
      B(0.90, 0.48, 0.48, IX1-0.50, FF2+0.24, Z+41.02, "#5a3a22"); B(0.92, 0.04, 0.50, IX1-0.50, FF2+0.50, Z+41.02, "#4a2a18");
      addCol(IX1-0.96, IX1, Z+40.76, Z+41.28, FF2-0.5, FF2+0.75);
      tubeE(V3(130.3, UC, Z+41.6), V3(130.3, UC-0.20, Z+41.6), 0.005, "#3a3a3a"); push("tube", new T.SphereGeometry(0.035, 12, 10), 130.3, UC-0.24, Z+41.6, 0, "#ffffff");
      LAMPS.push({x:130.3, y:UC-0.35, z:Z+41.6, color:0xffe0b0, intensity:0.4, dist:5, decay:1.6, indoor:true, vol:[BW, IX1, ZM, IZ1, FF2-0.5, UC]});
      addZone(BW+HT/2, IX1, ZM+HT/2, IZ1, FF2-0.5, UC, "THE STOREROOM", true); } }

  // the yard round the house: maples, a windbreak of spruce, the clothesline, the woodpile by the back door
  tree("lawn", 112.6, Z+28.0, 1.10); tree("lawn", 137.0, Z+29.5, 0.95); tree("lawn", 113.0, Z+52.0, 1.05); tree("lawn", 134.5, Z+52.0, 0.85);
  for(let z=Z+18; z<Z+78; z+=4.4) tree("spruce", 106.5+(r()-0.5)*1.5, z+(r()-0.5)*1.2, 0.75+r()*0.25);
  { const ax=119.5, bx2=126.5, cz=Z+52.0;
    for(const x of [ax, bx2]){ B(0.10, 2.2, 0.10, x, Y+1.1, cz, "#7a6448"); B(0.9, 0.08, 0.08, x, Y+2.1, cz, "#7a6448"); addCol(x-0.08, x+0.08, cz-0.08, cz+0.08, Y-0.5, Y+2.2); }
    for(const dz of [-0.38,0.38]) tubeE(V3(ax, Y+2.06, cz+dz), V3(bx2, Y+2.06, cz+dz), 0.005, "#d8d8d0");
    for(let k=0;k<6;k++){ const x=ax+0.8+k*1.0, c2=["#f2f0ea","#3a5a8a","#c41a1a","#e8e2c8","#5a7a3a","#f2f0ea"][k];
      const m=new T.Mesh(new T.PlaneGeometry(0.62, 0.78), new T.MeshStandardMaterial({color:c2, roughness:1.0, side:T.DoubleSide}));
      m.position.set(x, Y+1.66, cz+(k%2?0.38:-0.38)); m.rotation.y=0.02*(k-3); scene.add(m); } }
  { const wx=BDOOR.a-1.8, wz=H.z1+1.0;
    for(let row=0;row<4;row++) for(let k=0;k<9;k++) C(0.08, 0.42, wx-0.7+k*0.17+(row%2)*0.08, Y+0.09+row*0.155, wz, "#8a6a48", 10, Math.PI/2);
    addCol(wx-0.85, wx+0.85, wz-0.25, wz+0.25, Y-0.5, Y+0.7); }
  // the cellar's bulkhead on the east end: a concrete curb, slanted steel doors, cheeks either side
  { const cx=H.x1+0.65, cz=Z+41.0;
    bx("concrete", 1.30, 0.40, 1.70, cx, Y+0.18, cz, 0.5, 0, "#a8a49a");
    slab("roofmetal", [V3(cx+0.55, Y+0.40, cz-0.75), V3(cx+0.55, Y+0.40, cz+0.75), V3(H.x1+0.06, Y+1.05, cz+0.75), V3(H.x1+0.06, Y+1.05, cz-0.75)], 0.03, "#3a5a3a");
    for(const [z,sd] of [[cz-0.75, 1],[cz+0.75, -1]]){ const a=V3(cx+0.60, Y+0.38, z), b=V3(H.x1+0.02, Y+1.04, z), c=V3(H.x1+0.02, Y+0.38, z);
      slab("concrete", sd>0?[a,b,c]:[a,c,b], 0.08, "#a8a49a"); }
    B(0.04, 0.10, 0.10, cx-0.05, Y+0.76, cz, "#2a2a2a");
    addCol(H.x1, cx+0.66, cz-0.86, cz+0.86, Y-0.5, Y+1.05); }

  /* ---- the barn: walk in at the bank doors ----
     A bank barn on a stone foundation, its main floor at Y+1.2, reached up an earth ramp to the
     big doors in the west gable, which stand slid open on their track. Inside, under the gambrel's
     timbers: the threshing floor down the middle, the hay mow stacked to the north, the cows'
     stanchions along the south wall, a calf pen in the corner, the workbench at the east end. */
  { const BX0=168, BX1=194, BZ0=Z+48, BZ1=Z+68, BF=Y+1.2, BE=Y+5.2, BK=Y+8.0, BR=Y+10.6, IN=3.6, RED="#8a2a1e", OAK="#6a5038", zm=(BZ0+BZ1)/2;
    const BI0=BX0+0.18, BI1=BX1-0.18, BJ0=BZ0+0.18, BJ1=BZ1-0.18, DW={a:zm-3.0, b:zm+3.0, sill:BF-0.04, head:Y+4.9};
    const beamE=(a,b,w,d,c)=>{ const v=new T.Vector3().subVectors(b,a), Lb=v.length();
      ME.push({geo:boxGeo(w, Lb, d), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), v.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
    bucketOf("fh_bale", ()=>new T.MeshStandardMaterial({map:tileTex(256,256,(c,W,Hh)=>{ const q=_trng(77);
      for(const [y0,off] of [[0,128],[128,0]]){ c.fillStyle="#c4ac64"; c.fillRect(0,y0,W,128);
        for(let k=0;k<420;k++){ const x=q()*W, y=y0+4+q()*120, L2=6+q()*22; c.strokeStyle=q()<0.5?"rgba(236,214,140,0.55)":"rgba(140,116,54,0.45)"; c.lineWidth=1+q()*1.5; c.beginPath(); c.moveTo(x,y); c.lineTo(x+L2,y+(q()-0.5)*6); c.stroke(); }
        c.fillStyle="rgba(70,52,20,0.75)"; c.fillRect(0,y0,W,3); c.fillRect(off,y0,4,128); if(!off) c.fillRect(W-4,y0,4,128);
        c.fillStyle="rgba(90,74,40,0.7)"; c.fillRect(0,y0+38,W,2); c.fillRect(0,y0+90,W,2); } }), roughness:1}));
    // the foundation, its top a centimetre under the floor; the walls, red outside and bare boards in
    bx("rock", BX1-BX0+0.2, 1.39, BZ1-BZ0+0.2, (BX0+BX1)/2, Y+0.495, zm, 0.6, 0, "#8d877b");
    wallBox("wood", BX0-0.02, BX1+0.02, BZ0, BZ0+0.18, BF-0.03, BE+0.01, RED, 0.4, Y);
    wallBox("wood", BX0-0.02, BX1+0.02, BZ1-0.18, BZ1, BF-0.03, BE+0.01, RED, 0.4, Y);
    wallBox("wood", BX1-0.18, BX1, BJ0, BJ1, BF-0.04, BE, RED, 0.4, Y);
    runZ("wood", BX0+0.09, 0.18, BJ0, BJ1, BF-0.04, BE, [DW], RED, 0.4);
    const BRD="#7d6c58";
    lineX("wood", BJ0, 1, BI0, BI1, BF, BE, [], BRD, 0.4, 0.012); lineX("wood", BJ1, -1, BI0, BI1, BF, BE, [], BRD, 0.4, 0.012);
    lineZ("wood", BI1, -1, BJ0, BJ1, BF, BE, [], BRD, 0.4, 0.012); lineZ("wood", BI0, 1, BJ0, BJ1, BF, BE, [DW], BRD, 0.4, 0.012);
    // boards up from the long walls' tops to the roof inside, so the eaves aren't open to the sky
    for(const z of [BJ0+0.04, BJ1-0.04]) B(BI1-BI0-0.02, 0.24, 0.03, (BI0+BI1)/2, BE+0.07, z, BRD);
    // the floors: planks down the threshing floor and under the mow, concrete under the cows, a gutter behind them
    floorAt("wood", BX0, BI1, BJ0, zm+3.2, BF+0.004, "#8a7458", 0.5);
    floorAt("concrete", BI0, BI1, zm+3.2, BJ1, BF+0.004, "#9a968c", 0.5);
    addFlat(BX0-0.02, BX1, BZ0, BZ1, BF);
    // the gambrel: steep below, shallow above, along the barn
    for(const sd of [-1,1]){ const ze=sd<0?BZ0-0.5:BZ1+0.5, zk=zm+sd*((BZ1-BZ0)/2-IN);
      slab("roofmetal", [V3(BX0-0.4, BE-0.25, ze), V3(BX1+0.4, BE-0.25, ze), V3(BX1+0.4, BK, zk), V3(BX0-0.4, BK, zk)], 0.08, "#7a7e80");
      const e=sd<0?0.42:0.44;                                            // (the upper slabs past the lower, and past each other at the ridge)
      slab("roofmetal", [V3(BX0-e, BK, zk), V3(BX1+e, BK, zk), V3(BX1+e, BR, zm), V3(BX0-e, BR, zm)], 0.08, "#7a7e80"); }
    // the gable ends, clapboard up to the roof's line, flush with the walls under them (each slab pushed back from its points)
    for(const x of [BX0+0.09, BX1-0.09]){
      const pts=[[BZ0+0.01,BE],[BZ0+IN,BK],[zm,BR-0.12],[BZ1-IN,BK],[BZ1-0.01,BE]];
      for(let k=0;k<3;k++){ const a=pts[0], b=pts[k+1], c=pts[k+2];
        push("wood", new FaceGeo().slab([V3(x+0.09,a[1],a[0]), V3(x+0.09,b[1],b[0]), V3(x+0.09,c[1],c[0])], 0.18, 0.4).geo(), 0,0,0, 0, RED); }
      // and inside, bare boards like the walls under them, a hair in from the paint's back, a little inside its outline
      const xi=x<(BX0+BX1)/2 ? BI0+0.012 : BI1-0.012, q=[[BZ0+0.20,BE],[BZ0+IN,BK-0.06],[zm,BR-0.20],[BZ1-IN,BK-0.06],[BZ1-0.20,BE]];
      for(let k=0;k<3;k++) push("wood", new FaceGeo().slab([V3(xi,q[0][1],q[0][0]), V3(xi,q[k+1][1],q[k+1][0]), V3(xi,q[k+2][1],q[k+2][0])], 0.004, 0.4).geo(), 0,0,0, 0, BRD); }
    // the timbers: a bent every five metres, posts either side of the threshing floor, a tie beam across,
    // purlin posts up to the knee of the roof, rafters under it, all of it gone grey-brown
    const roofY=(z)=>{ const d=Math.abs(z-zm), k=(BZ1-BZ0)/2-IN; return d>k ? BE-0.25+((BZ1-BZ0)/2+0.5-d)*(BK-BE+0.25)/((BZ1-BZ0)/2+0.5-k) : BK+(k-d)*(BR-BK)/k; };
    const under=(z)=>roofY(z)-0.10-0.012;                                  // (the slabs hang their thickness below their line)
    const KZ=[zm-((BZ1-BZ0)/2-IN), zm+((BZ1-BZ0)/2-IN)];
    for(const x of [173.2, 178.4, 183.6, 188.8]){
      for(const z of [zm-3.25, zm+3.25]){ B(0.22, BE-0.26-BF, 0.22, x, (BF+BE-0.26)/2, z, OAK); addCol(x-0.12, x+0.12, z-0.12, z+0.12, BF-0.5, BE); }
      B(0.20, 0.26, BJ1-BJ0+0.10, x, BE-0.13, zm, OAK);
      for(const z of KZ){ B(0.18, BK-0.48-BE, 0.18, x, (BE+BK-0.48)/2, z, OAK);
        beamE(V3(x, BE, z+(z<zm?2.0:-2.0)), V3(x, BK-0.9, z), 0.10, 0.12, OAK); }
      beamE(V3(x, BE, zm-3.25), V3(x, BE-1.1, zm-4.35), 0.10, 0.12, OAK); beamE(V3(x, BE, zm+3.25), V3(x, BE-1.1, zm+4.35), 0.10, 0.12, OAK); }
    for(const z of KZ) B(BI1-BI0, 0.20, 0.20, (BI0+BI1)/2, BK-0.40, z, OAK);
    for(let x=BI0+0.6; x<BI1-0.3; x+=1.30) for(const sd of [-1,1]){
      const zw=sd<0?BJ0+0.05:BJ1-0.05, zk=KZ[sd<0?0:1], d=0.09/Math.cos(Math.atan((BK-BE)/IN));
      beamE(V3(x, under(zw)-d, zw), V3(x, under(zk)-d, zk), 0.08, 0.14, OAK);
      beamE(V3(x, under(zk)-0.10, zk), V3(x, under(zm)-0.10, zm), 0.08, 0.14, OAK); }
    // the hay track along the ridge, its carrier, the rope down to the fork
    B(BI1-BI0-1.0, 0.10, 0.08, (BI0+BI1)/2, BR-0.55, zm, "#3a3a3c"); B(0.40, 0.22, 0.16, 180.0, BR-0.72, zm, "#5a5a5c");
    tubeE(V3(180.0, BR-0.83, zm), V3(180.0, BE+0.8, zm), 0.012, "#b8a882");
    for(const dx of [-0.10, 0.10]) tubeE(V3(180.0, BE+0.8, zm), V3(180.0+dx, BE+0.1, zm), 0.015, "#5a5a5c");
    // the big doors, slid open on their track either side of the opening; the mow door shut over them
    B(0.10, 0.08, 13.2, BX0-0.10, Y+5.10, zm, "#3a3a3c");
    for(const sd of [-1,1]){ const zc=zm+sd*(3.05+1.55);
      B(0.06, 3.8, 3.1, BX0-0.04, Y+3.1, zc, "#7a2418");
      for(const t of [-1,1]) ent(boxGeo(0.07, 4.4, 0.12), BX0-0.06, Y+3.1, zc, "#f2f0ea", 0.68*t, 0, 0);
      for(const y of [Y+1.26, Y+4.94]) B(0.08, 0.12, 3.14, BX0-0.065, y, zc, "#f2f0ea");
      for(const dz of [-1.1, 1.1]){ B(0.03, 0.22, 0.05, BX0-0.09, Y+5.02, zc+dz, "#3a3a3c"); C(0.05, 0.04, BX0-0.12, Y+5.10, zc+dz, "#2a2a2c", 14, 0, 0, Math.PI/2); } }
    B(0.06, 1.8, 2.0, BX0-0.03, Y+6.9, zm, "#7a2418"); B(0.08, 1.9, 0.10, BX0-0.065, Y+6.9, zm-1.0, "#f2f0ea"); B(0.08, 1.9, 0.10, BX0-0.065, Y+6.9, zm+1.0, "#f2f0ea");
    B(0.10, 0.10, 0.6, BX0-0.30, Y+8.1, zm, "#3a3a3c");
    sign(2.2, 0.50, (c,W,Hh)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,Hh); say(c,"WEIR · 1911",W/2,Hh/2,W*0.8,Hh*0.62,RED,"900","Georgia, serif"); }, BX0-0.01, Y+8.9, zm, -Math.PI/2, false, 440);
    // the bank: an earth ramp up to the doors between dry-stone cheeks
    { const xa=BX0-8.2, w=3.2;
      slab("gravelbed", [V3(xa, Y+0.06, zm-w), V3(BX0, BF, zm-w), V3(BX0, BF, zm+w), V3(xa, Y+0.06, zm+w)], 0.30, "#a29d92");      // (it hangs under its top)
      for(const sd of [-1,1]){ const z=zm+sd*w, a=V3(xa-0.2, Y-0.05, z), b=V3(BX0-0.12, BF+0.22, z), c=V3(BX0-0.12, Y-0.05, z);
        push("rock", new FaceGeo().slab(sd<0?[a,c,b]:[a,b,c], 0.40, 0.6).geo(), 0,0,0, 0, "#8d877b"); }          // (each pushed outward from the ramp's edge)
      addRamp(xa, BX0+0.01, zm-w, zm+w, "x", xa, BX0+0.01, Y+0.032, BF); }
    // the walls stand round it; the doorway between the bank doors is open
    addZone(BX0, BX1, BZ0, BZ1, BF-0.5, BR, "THE BARN", true);
    // the hay mow to the north: square bales stacked to the eaves, stepped where they've been taken from, and an elevator up to them
    const bale=(x0,x1,z0,z1,h)=>bx("fh_bale", x1-x0, h, z1-z0, (x0+x1)/2, BF+0.01+h/2, (z0+z1)/2, 1.0, 0, "#ffffff");
    bale(170.5, 177.0, BJ0+0.25, zm-3.6, 2.0); bale(177.0, 185.5, BJ0+0.25, zm-4.1, 3.5); bale(185.5, BI1-0.33, BJ0+0.25, zm-3.6, 4.5); bale(178.0, 183.0, zm-4.1, zm-3.6, 1.0);
    addCol(170.5, BI1-0.33, BJ0+0.25, zm-3.6, BF-0.5, BF+4.6);
    for(const [x,z,ry] of [[172.2, zm-1.6, 0.2],[175.0, zm+1.9, -0.4],[176.1, zm+1.7, 0.1]]){ bx("fh_bale", 1.0, 0.5, 0.46, x, BF+0.26, z, 1.0, ry, "#ffffff"); addColOB(x, z, ry, 0.52, 0.25, BF-0.5, BF+0.5); }
    bx("fh_bale", 1.0, 0.5, 0.46, 175.5, BF+0.77, zm+1.8, 1.0, -0.15, "#ffffff");
    { const a=V3(183.0, BF+0.5, zm+0.4), b=V3(183.0, BF+3.9, zm-4.4);
      for(const dx of [-0.24,0.24]) beamE(V3(a.x+dx,a.y,a.z), V3(b.x+dx,b.y,b.z), 0.06, 0.12, "#8a2a1e");
      for(let t=0.04;t<0.98;t+=0.06) B(0.48, 0.02, 0.04, a.x, a.y+(b.y-a.y)*t+0.07, a.z+(b.z-a.z)*t, "#5a5a5c");
      for(const dx of [-0.30,0.30]){ beamE(V3(a.x+dx, BF, zm-0.4), V3(a.x+dx, BF+1.7, zm-1.6), 0.05, 0.05, "#8a2a1e"); C(0.20, 0.08, a.x+dx+(dx>0?0.04:-0.04), BF+0.20, zm-0.4, "#1d1d1e", 18, 0, 0, Math.PI/2); }
      addCol(182.6, 183.4, zm-1.7, zm+0.5, BF-0.5, BF+1.6); }
    // pitchforks and a broom against the first post, a wheelbarrow, a scoop shovel
    for(let k=0;k<3;k++) beamE(V3(173.05+k*0.07, BF+0.02, zm-3.0), V3(173.10+k*0.07, BF+1.55, zm-3.12), 0.025, 0.025, k===2?"#c8a86a":"#9a7a52");
    { const wx=177.6, wz=zm-2.0; B(0.62, 0.30, 0.90, wx, BF+0.52, wz, "#5a7a5a", 0.3); C(0.17, 0.08, wx+0.13, BF+0.17, wz-0.46, "#1d1d1e", 18, 0, 0.3, Math.PI/2);
      for(const dx of [-0.22,0.22]) beamE(V3(wx+dx-0.10, BF+0.70, wz+0.35), V3(wx+dx+0.12, BF+0.50, wz+1.05), 0.03, 0.03, "#8a6a48"); addColOB(wx, wz+0.1, 0.3, 0.36, 0.62, BF-0.5, BF+0.8); }
    // the stanchions along the south wall: the manger, the neck pipes, the stall dividers; the cows in three of them
    { const zMg=BJ1-0.012-0.02-0.32, x0=175.5, x1=187.5;
      bx("concrete", x1-x0, 0.45, 0.64, (x0+x1)/2, BF+0.225, zMg+0.03, 0.5, 0, "#a8a49a");
      bx("concrete", x1-x0+0.08, 0.68, 0.12, (x0+x1)/2, BF+0.34, zMg-0.29, 0.5, 0, "#a8a49a");
      B(x1-x0-0.2, 0.06, 0.40, (x0+x1)/2, BF+0.485, zMg+0.05, "#b8a463");
      floorAt("concrete", x0-0.5, x1+0.5, zMg-2.25, zMg-1.90, BF+0.012, "#5a564c", 0.5);
      tubeE(V3(x0, BF+1.65, zMg-0.40), V3(x1, BF+1.65, zMg-0.40), 0.03, "#8a8d90");
      for(let k=0;k<=10;k++){ const x=x0+k*1.2;
        tubeE(V3(x, BF+0.68, zMg-0.40), V3(x, BF+1.66, zMg-0.40), 0.03, "#8a8d90");
        if(k>0 && k<10){ tubeE(V3(x, BF+1.05, zMg-0.40), V3(x, BF+1.05, zMg-1.60), 0.025, "#8a8d90"); tubeE(V3(x, BF+1.05, zMg-1.60), V3(x, BF+0.30, zMg-1.80), 0.025, "#8a8d90"); }
        if(k<10) for(const dx of [0.42, 0.78]) tubeE(V3(x+dx, BF+0.68, zMg-0.40), V3(x+dx, BF+1.64, zMg-0.40), 0.018, "#9a9da0"); }
      addCol(x0-0.05, x1+0.05, zMg-0.42, BJ1, BF-0.5, BF+1.7);
      for(const k of [2,3,6]) cow(x0+k*1.2+0.6, zMg-1.30, 0, 0, BF, 0.03, 1, "manger");
      addUse(x0+3.6, zMg-2.6, BF, "PAT THE COW", ()=>toast(["SHE LEANS INTO IT. HER NAME'S ON THE STANCHION IN MARKER: “DOT”","WARM, AND A LOT BIGGER UP CLOSE","SHE LOOKS AT YOU THE WAY COWS DO, WHICH IS TO SAY NOT MUCH"][(Math.random()*3)|0],"#cfe0d4"), 1.6);
      // milk cans by the door, the strainer on a nail, the barn radio on a shelf with the farm report on
      for(let k=0;k<4;k++){ const x=170.0+k*0.42, z=zm+4.0;
        C(0.15, 0.48, x, BF+0.25, z, "#c9cbcc", 24); ent(new T.CylinderGeometry(0.07, 0.15, 0.14, 24), x, BF+0.56, z, "#c9cbcc"); C(0.075, 0.10, x, BF+0.68, z, "#b9bbbc", 20); }
      addCol(169.8, 171.6, zm+3.8, zm+4.2, BF-0.5, BF+0.75);
      B(0.60, 0.03, 0.25, 170.4, BF+1.55, BJ1-0.145, "#6a5038"); B(0.30, 0.18, 0.12, 170.3, BF+1.66, BJ1-0.14, "#3a2a1a"); C(0.04, 0.012, 170.38, BF+1.66, BJ1-0.20, "#c9cbcc", 14, Math.PI/2);
      addUse(170.4, BJ1-1.0, BF, "THE BARN RADIO", ()=>toast(["“...CORN AT FOUR-TWELVE, BEANS UP A NICKEL. AND NOW THE WEATHER FOR ERIE AND CRAWFORD...”","A POLKA, FROM A STATION OUT OF MEADVILLE","STATIC, THEN A PREACHER, THEN STATIC"][(Math.random()*3)|0],"#cfe0d4"), 1.4); }
    // the calf pen in the corner, board fence, a calf in the straw
    { const px0=189.0, pz0=zm+5.0;
      for(const y of [0.35, 0.75, 1.10]){ B(0.04, 0.14, BJ1-pz0, px0, BF+y, (pz0+BJ1)/2, "#8a7458"); B(BI1-px0, 0.14, 0.04, (px0+BI1)/2, BF+y, pz0, "#8a7458"); }
      for(const z of [pz0, (pz0+BJ1)/2]) B(0.10, 1.20, 0.10, px0, BF+0.60, z, OAK);
      floorAt("concrete", px0+0.05, BI1-0.01, pz0+0.05, BJ1-0.01, BF+0.012, "#c8b070", 0.5);
      addCol(px0-0.05, px0+0.05, pz0, BJ1, BF-0.5, BF+1.2); addCol(px0, BI1, pz0-0.05, pz0+0.05, BF-0.5, BF+1.2);
      cow(191.4, pz0+1.3, -2.2, 1, BF, 0.12, 0.6); }
    // the workbench across the east end: the vise, the coffee can of bolts, the tools on nails, the feed store's calendar again
    { const wx=BI1-0.40;
      B(0.70, 0.06, 3.0, wx, BF+0.90, zm, "#7a6448"); for(const dz of [-1.4,1.4]) for(const dx of [-0.30,0.30]) B(0.08, 0.87, 0.08, wx+dx, BF+0.435, zm+dz, "#6a5438");
      B(0.12, 0.12, 0.20, wx-0.25, BF+0.99, zm-1.0, "#3a4a6a"); C(0.07, 0.14, wx, BF+1.00, zm+0.6, "#9a7a3a", 18);
      for(let k=0;k<6;k++) B(0.03, 0.40+(k%3)*0.12, 0.06, BI1-0.03, BF+1.55, zm-1.2+k*0.45, ["#8a8d90","#c41a1a","#6a5038","#8a8d90","#2a4a8a","#6a5038"][k]);
      tubeE(V3(BI1-0.06, BF+1.95, zm+1.3), V3(BI1-0.06, BF+1.20, zm+1.3), 0.03, "#2f2f30");
      addCol(wx-0.36, BI1, zm-1.5, zm+1.5, BF-0.5, BF+0.95); }
    // the light: bulbs on cords over the floor and the stalls
    for(const [x,z] of [[175.0, zm],[183.0, zm],[190.0, zm],[181.0, zm+4.6]]){
      tubeE(V3(x, BE-0.26, z), V3(x, BE-0.95, z), 0.005, "#2a2a2a"); push("tube", new T.SphereGeometry(0.04, 12, 10), x, BE-1.0, z, 0, "#ffffff");
      LAMPS.push({x:x, y:BE-1.1, z:z, color:0xffd8a0, intensity:0.75, dist:12, decay:1.4, indoor:true, vol:[BX0, BX1, BZ0, BZ1, BF-0.5, BR]}); }
    // the silos east of it, and a hay wagon by the bank
    for(const [sx,sz] of [[BX1+3.6, BZ0+5.0],[BX1+3.6, BZ0+12.0]]){
      C(3.0, 15.5, sx, Y+7.75, sz, "#b8b2a4", 40);
      for(let k=0;k<11;k++) ent(new T.TorusGeometry(3.02, 0.025, 6, 48), sx, Y+0.8+k*1.4, sz, "#5a5a58", Math.PI/2, 0, 0);
      ent(new T.SphereGeometry(3.05, 32, 12, 0, Math.PI*2, 0, Math.PI/2), sx, Y+15.5, sz, "#9aa0a2");
      B(0.5, 15.0, 0.5, sx-3.15, Y+7.8, sz, "#9a9490");
      addCol(sx-3.05, sx+3.05, sz-3.05, sz+3.05, Y-0.5, Y+16); }
    { const wx=BX0-7.0, wz=BZ1-2.5;
      B(2.4, 0.10, 4.8, wx, Y+0.95, wz, "#8a6a48"); for(const dz of [-1.6,1.6]) for(const dx of [-1.1,1.1]) C(0.36, 0.20, wx+dx, Y+0.38, wz+dz, "#1d1d1e", 24, 0, 0, Math.PI/2);
      for(let row=0;row<3;row++) for(let k=0;k<(row===2?4:6);k++) bx("fh_bale", 1.0, 0.40, 0.48, wx-0.55+(k%2)*1.1, Y+1.21+row*0.41, wz-1.9+((k/2)|0)*0.98+(row===2?0.49:0), 1.0, 0, "#ffffff");
      addCol(wx-1.25, wx+1.25, wz-2.45, wz+2.45, Y-0.5, Y+2.4); } }

  /* ---- the pole shed and the tractor in it ---- */
  { const SX0=140, SX1=164, SZ0=Z+80, SZ1=Z+92, SH=Y+4.6;
    for(const [x0,x1,z0,z1] of [[SX0-0.02,SX1+0.02,SZ1-0.08,SZ1],[SX0,SX0+0.08,SZ0,SZ1-0.08],[SX1-0.08,SX1,SZ0,SZ1-0.08]]) wallBox("roofmetal", x0, x1, z0, z1, Y, SH-(z0>SZ0+1?0.5:0.52), "#6a7e6a", 0.5, Y);
    for(let x=SX0+0.2; x<SX1; x+=4.0){ B(0.18, SH-Y, 0.18, x, Y+(SH-Y)/2, SZ0+0.12, "#7a6448"); addCol(x-0.1, x+0.1, SZ0+0.02, SZ0+0.22, Y-0.5, SH); }
    slab("roofmetal", [V3(SX0-0.3, SH+0.02, SZ0-0.6), V3(SX1+0.3, SH+0.02, SZ0-0.6), V3(SX1+0.3, SH-0.48, SZ1+0.3), V3(SX0-0.3, SH-0.48, SZ1+0.3)], 0.06, "#6a7076");
    // the tractor: green, yellow wheels, the big tyres behind, a cab frame
    const tx=148, tz=Z+86, G="#2f6a2a";
    B(1.0, 0.80, 2.2, tx, Y+1.25, tz-0.6, G); B(0.9, 0.12, 2.0, tx, Y+1.70, tz-0.6, "#3a7a32");
    for(const sd of [-1,1]){ C(0.80, 0.42, tx+sd*0.85, Y+0.80, tz+0.7, "#1d1d1e", 22, 0, 0, Math.PI/2); C(0.46, 0.44, tx+sd*0.85, Y+0.80, tz+0.7, "#f2c418", 16, 0, 0, Math.PI/2);
      C(0.42, 0.26, tx+sd*0.62, Y+0.42, tz-1.5, "#1d1d1e", 18, 0, 0, Math.PI/2); C(0.24, 0.28, tx+sd*0.62, Y+0.42, tz-1.5, "#f2c418", 14, 0, 0, Math.PI/2); }
    B(1.2, 0.50, 1.0, tx, Y+1.45, tz+0.7, G); B(0.5, 0.10, 0.5, tx, Y+1.95, tz+0.7, "#1d1d1e");
    for(const [dx,dz] of [[-0.6,0.25],[0.6,0.25],[-0.6,1.15],[0.6,1.15]]) B(0.06, 1.3, 0.06, tx+dx, Y+2.35, tz+dz, "#1d1d1e");
    B(1.4, 0.06, 1.1, tx, Y+3.03, tz+0.7, G); C(0.05, 0.9, tx+0.35, Y+2.15, tz-1.2, "#1d1d1e", 8);
    ent(new T.TorusGeometry(0.16, 0.015, 6, 16), tx, Y+2.05, tz+0.3, "#1d1d1e", -0.9, 0, 0);
    addCol(tx-1.3, tx+1.3, tz-1.9, tz+1.6, Y-0.5, Y+3.1);
    addZone(SX0, SX1, SZ0, SZ1, Y-1, SH, "THE MACHINE SHED"); }

  // the cows, out in the pasture behind
  for(const [x,z,ry,gz] of [[150,Z+178,0.4,1],[158,Z+184,2.0,1],[171,Z+176,-1.2,0],[186,Z+192,0.9,1],[197,Z+181,2.6,1],[214,Z+200,-0.4,0],[176,Z+206,1.5,1],[205,Z+222,-2.2,1]]) cow(x, z, ry, gz);

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.08}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  EDIN_PLACES.farm={house:H, ff:FF, ff2:FF2, door:FDOOR, lane:LX};
})();
// the cows: they turn a little as they graze, the head working at the grass and now and then coming up
// to look round; the tail swishing at the flies, harder some times than others
function updateEdinboro(dt){
  for(const c of EDIN_PLACES.cows){ c.t+=dt; const t=c.t;
    c.g.rotation.y=c.ry+Math.sin(t*0.05)*c.sway;
    if(c.pose==="graze"){ const up=smoothstep(0.80, 0.97, Math.sin(t*0.11+c.ry*3));     // a while with her head up, now and then
      c.head.rotation.x=-0.55*up+0.05*Math.sin(t*2.3)*(1-up); c.head.rotation.y=0.18*up*Math.sin(t*0.4); }
    else c.head.rotation.x=0.04*Math.sin(t*0.7);
    const sw=0.5+0.5*Math.sin(t*0.23+c.ry);
    c.tail.rotation.z=Math.sin(t*(2.2+sw))*0.28*sw; c.tail.rotation.x=0.08*Math.sin(t*1.3)*sw; }
}
