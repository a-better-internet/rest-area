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
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
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
  // the restrooms' door, the ATM, the ice cream chest, a rack of papers by the door
  { const zc=(REST.a+REST.b)/2;
    frZ(IX1+WT/2-0.0, WT, REST.a, REST.b, FLS, FLS+2.12, "#5a5d60");
    B(0.05, 2.06, REST.b-REST.a-0.02, IX1-0.03, FLS+1.04, zc, "#8a8d90");
    sign(0.36, 0.14, (c,W,Hh)=>{ c.fillStyle="#1f4fd8"; c.fillRect(0,0,W,Hh); say(c,"RESTROOMS",W/2,Hh/2,W*0.84,Hh*0.6,"#fff","800","Arial"); }, IX1-0.062, FLS+1.62, zc, -Math.PI/2, false, 180);
    addUse(IX1-0.8, zc, FLS, "TRY THE RESTROOM", ()=>toast("LOCKED. “KEY AT COUNTER”. THE KEY'S ON A HUBCAP","#cfe0d4"), 1.0);
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
  // the store's zone
  addZone(IX0, IX1, IZ0, IZ1, FLS-0.5, CEIL, "FRENCH CREEK FUEL · MART", true);
  EDIN_PLACES.store={x0:IX0, x1:IX1, z0:IZ0, z1:IZ1, y:FLS, door:(D.a+D.b)/2, zf:S.z1};

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ======================================================================
   THE FARM
   ====================================================================== */
(function weirPlace(){
  const E=EDIN, Z=E.z, Y=E.y, r=_trng(7723);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,6), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const slab=(bk, pts, t, color)=>push(bk, new FaceGeo().slab(pts, t, 0.5).geo(), 0,0,0, 0, color);
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s; addCol(x-rr, x+rr, z-rr, z+rr, Y-0.5, Y+6); };

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
    for(let k=0;k<5;k++) C(0.30+r()*0.06, 0.06, 121.9+(r()-0.5)*0.3, Y+0.02, Z+27.95+k*0.62, "#9a968c", 9, 0, r()*3, 0);
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

  /* ---- the farmhouse ---- */
  const H={x0:118, x1:130, z0:Z+34, z1:Z+44}, WT=0.2, FF=Y+0.65, CL=FF+2.55, EAV=FF+5.3, RID=FF+7.4;
  const IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT, PX=125.0, WHT="#f2f0ea", TRM="#e8e6de";
  const win=(a,b)=>({a:a, b:b, sill:FF+0.80, head:FF+2.10}), dor=(a,b)=>({a:a, b:b, sill:FF-0.03, head:FF+2.10});
  const up=(a,b)=>({a:a, b:b, sill:FF+3.30, head:FF+4.55});
  const FRONT=[win(119.2,120.4), dor(121.4,122.32), win(123.2,124.4), win(126.0,127.2), win(128.0,129.2), up(119.6,120.6), up(122.8,123.8), up(126.4,127.4), up(128.4,129.2)];
  const BACK =[win(119.5,120.7), win(121.8,123.0), win(125.6,126.6), dor(127.6,128.52), up(120.0,121.0), up(126.0,127.0)];
  const WEST =[win(Z+36.6,Z+37.8), win(Z+40.2,Z+41.4), up(Z+38.4,Z+39.6)];
  const EAST =[{a:Z+38.4, b:Z+39.6, sill:FF+1.06, head:FF+2.10}, up(Z+38.4,Z+39.6)];          // (the one over the sink clears the counter)
  // the stone it stands on, the walls (white clapboard outside, plaster in), the floors and ceilings
  bx("rock", H.x1-H.x0+0.10, FF-0.01-(Y-0.4), H.z1-H.z0+0.10, (H.x0+H.x1)/2, (FF-0.01+Y-0.4)/2, (H.z0+H.z1)/2, 0.6, 0, "#8d877b");   // (its top a centimetre under the floor)
  // (each wall in two bands, a storey each, so a window upstairs never fills in the one under it)
  const MID=FF+2.8, dn=L=>L.filter(o=>o.sill<CL), upr=L=>L.filter(o=>o.sill>CL);
  for(const [y0,y1,f] of [[FF-0.15, MID, dn],[MID, EAV, upr]]){
    runX("siding", H.z0+WT/2, WT, H.x0, H.x1, y0, y1, f(FRONT), WHT, 0.5);
    runX("siding", H.z1-WT/2, WT, H.x0, H.x1, y0, y1, f(BACK), WHT, 0.5);
    runZ("siding", H.x0+WT/2, WT, IZ0, IZ1, y0, y1, f(WEST), WHT, 0.5);
    runZ("siding", H.x1-WT/2, WT, IZ0, IZ1, y0, y1, f(EAST), WHT, 0.5); }
  const LIV="#d9cfb4", KIT="#e6dcae";
  lineX("plaster", IZ0, 1, IX0, PX-0.06, FF, CL, dn(FRONT), LIV, 0.5); lineX("plaster", IZ0, 1, PX+0.06, IX1, FF, CL, dn(FRONT), KIT, 0.5);
  lineX("plaster", IZ1, -1, IX0, PX-0.06, FF, CL, dn(BACK), LIV, 0.5); lineX("plaster", IZ1, -1, PX+0.06, IX1, FF, CL, dn(BACK), KIT, 0.5);
  lineZ("plaster", IX0, 1, IZ0, IZ1, FF, CL, dn(WEST), LIV, 0.5); lineZ("plaster", IX1, -1, IZ0, IZ1, FF, CL, dn(EAST), KIT, 0.5);
  // the partition between the rooms, a wide cased opening in it, the stairs' door near the front
  const OPN={a:Z+38.4, b:Z+40.1, sill:FF-0.004, head:FF+2.12}, STD={a:Z+34.9, b:Z+35.8};
  runZ("plaster", PX, 0.12, IZ0, IZ1, FF, CL, [OPN], LIV, 0.5);
  lineZ("plaster", PX+0.06, 1, IZ0, IZ1, FF, CL, [OPN], KIT, 0.5, 0.01);
  B(0.04, 2.04, STD.b-STD.a-0.02, PX-0.08, FF+1.02, (STD.a+STD.b)/2, "#e8e2d2");                      // the stairs' door, shut
  C(0.025, 0.06, PX-0.115, FF+1.0, STD.b-0.12, "#b8963a", 10, 0, 0, Math.PI/2);
  for(const z of [STD.a-0.04, STD.b+0.04]) B(0.03, 2.10, 0.07, PX-0.075, FF+1.05, z, TRM);
  B(0.03, 0.07, STD.b-STD.a+0.16, PX-0.075, FF+2.135, (STD.a+STD.b)/2, TRM);
  addUse(PX-0.7, (STD.a+STD.b)/2, FF, "OPEN THE STAIRS' DOOR", ()=>toast(["THE STAIRS, STEEP, A RUNNER UP THEM. A VOICE FROM UP THERE: “WHO'S THAT?”","THE KIDS' ROOMS ARE UP THERE. NOBODY ASKED YOU UP","YOU THINK BETTER OF IT AND SHUT IT AGAIN"][(Math.random()*3)|0],"#cfe0d4"), 1.0);
  frZ(PX, 0.12, OPN.a, OPN.b, FF, OPN.head, TRM);
  floorAt("wood", IX0, PX-0.06, IZ0, IZ1, FF+0.004, "#9a7450", 0.6);
  floorAt("quarry", PX+0.06, IX1, IZ0, IZ1, FF+0.004, "#c8c2b2", 0.8);
  addFlat(IX0, IX1, IZ0, IZ1, FF);
  for(const [o,z0,z1] of [[FRONT[1], H.z0-0.01, IZ0+0.01],[BACK[3], IZ1-0.01, H.z1+0.01]]) addFlat(o.a, o.b, z0, z1, FF-0.01);   // over the stone in the doorways
  ceilAt("plaster", IX0, PX-0.06, IZ0, IZ1, CL, "#efece4", 0.5); ceilAt("plaster", PX+0.06, IX1, IZ0, IZ1, CL, "#f2efe6", 0.5);
  // the floor between the storeys, inside: a slab over both rooms so the upstairs is a lid, dark above it
  bx("beam", IX1-IX0-0.02, 0.24, IZ1-IZ0-0.02, (IX0+IX1)/2, CL+0.13, (IZ0+IZ1)/2, 0.5, 0, "#5a4a38");
  // the windows: white trim round each outside, the glass, a dark room behind the upstairs ones (a lamp in one at night)
  const glaze=(axis, f, o, out)=>{ const w=o.b-o.a, h=o.head-o.sill, cy=(o.sill+o.head)/2, c=(o.a+o.b)/2;
    if(axis==="x"){ push("glass", planeGeo(w-0.06, h-0.06, 0), c, cy, f, 0, "#ffffff");
      for(const x of [o.a-0.05, o.b+0.05]) B(0.10, h+0.18, 0.05, x, cy, f+out*(WT/2+0.025), TRM);
      B(w+0.30, 0.10, 0.06, c, o.head+0.05, f+out*(WT/2+0.03), TRM); B(w+0.24, 0.05, 0.12, c, o.sill-0.017, f+out*(WT/2+0.05), TRM); }
    else { push("glass", planeGeo(w-0.06, h-0.06, 0), f, cy, c, Math.PI/2, "#ffffff");
      for(const z of [o.a-0.05, o.b+0.05]) B(0.05, h+0.18, 0.10, f+out*(WT/2+0.025), cy, z, TRM);
      B(0.06, 0.10, w+0.30, f+out*(WT/2+0.03), o.head+0.05, c, TRM); B(0.12, 0.05, w+0.24, f+out*(WT/2+0.05), o.sill-0.017, c, TRM); } };
  for(const o of FRONT) if(o.sill>FF) glaze("x", H.z0+WT/2, o, -1);
  for(const o of BACK)  if(o.sill>FF) glaze("x", H.z1-WT/2, o, 1);
  for(const o of WEST)  glaze("z", H.x0+WT/2, o, -1);
  for(const o of EAST)  glaze("z", H.x1-WT/2, o, 1);
  // upstairs, behind the glass: a dark room, and the warm glow of a lamp in two of them after dark
  for(const [o,f,dir] of [[FRONT[5],H.z0+WT,1],[FRONT[6],H.z0+WT,1],[FRONT[7],H.z0+WT,1],[FRONT[8],H.z0+WT,1],[BACK[4],H.z1-WT,-1],[BACK[5],H.z1-WT,-1]]){
    const w=o.b-o.a, h=o.head-o.sill, c=(o.a+o.b)/2, cy=(o.sill+o.head)/2;
    B(w+0.02, h+0.02, 0.02, c, cy, f+dir*0.20, "#1a1814"); }
  for(const o of [FRONT[6], BACK[5]]){ const w=o.b-o.a, h=o.head-o.sill, c=(o.a+o.b)/2, cy=(o.sill+o.head)/2, f=o===FRONT[6]?H.z0+WT+0.18:H.z1-WT-0.18;
    push("winwarm", planeGeo(w-0.08, h-0.08, 0), c, cy, f, o===FRONT[6]?Math.PI:0, "#ffffff"); }
  for(const o of WEST.slice(2)) B(0.02, o.head-o.sill+0.02, o.b-o.a+0.02, H.x0+WT+0.20, (o.sill+o.head)/2, (o.a+o.b)/2, "#1a1814");
  for(const o of EAST.slice(1)) B(0.02, o.head-o.sill+0.02, o.b-o.a+0.02, H.x1-WT-0.20, (o.sill+o.head)/2, (o.a+o.b)/2, "#1a1814");
  for(const o of [...FRONT, ...BACK]) if(o.sill>FF) addCol(o.a, o.b, (FRONT.includes(o)?H.z0:H.z1-WT), (FRONT.includes(o)?H.z0+WT:H.z1), o.sill, o.head);
  for(const o of [...WEST, ...EAST]) addCol((WEST.includes(o)?H.x0:H.x1-WT), (WEST.includes(o)?H.x0+WT:H.x1), o.a, o.b, o.sill, o.head);
  // the doors: the front into the living room, the back out of the kitchen; their frames
  frX(H.z0+WT/2, WT, FRONT[1].a, FRONT[1].b, FF, FRONT[1].head, TRM);
  frX(H.z1-WT/2, WT, BACK[3].a, BACK[3].b, FF, BACK[3].head, TRM);
  makeDoor(XF(FRONT[1].a+0.02, H.z0+WT/2, 0), 0, FF+0.01, 0, "THE FARMHOUSE", true, 0, "closet", 0x4a6a8a);
  makeDoor(XF(BACK[3].b-0.02, H.z1-WT/2, Math.PI), 0, FF+0.01, 0, "THE BACK DOOR", true, 0, "closet", 0xe8e2d2);
  // the stoop out the back door, a landing and three steps down to the yard
  { const a=BACK[3].a-0.40, b=BACK[3].b+0.40, LT=FF-0.02;
    B(b-a, LT-Y+0.1, 1.0, (a+b)/2, (LT+Y-0.1)/2, H.z1+0.5, "#8d877b"); addFlat(a, b, H.z1-0.005, H.z1+1.005, LT);
    for(let k=1;k<=3;k++){ const y=Y+(LT-Y)*(4-k)/4, zz=H.z1+1.15+(k-1)*0.30;
      B(b-a-0.10, y-Y+0.1, 0.30, (a+b)/2, (y+Y-0.1)/2, zz, "#8d877b"); addFlat(a+0.05, b-0.05, zz-0.155, zz+0.155, y); } }
  // the roof: a gable along the house, shingled, its eaves out over the walls, the gable ends in clapboard, a chimney
  { const ov=0.45, xa=H.x0-0.35, xb=H.x1+0.35, zm=(H.z0+H.z1)/2;
    for(const [z0,z1,e] of [[H.z0-ov, zm, 0],[H.z1+ov, zm, 0.012]]){ const yo=EAV-(RID-EAV)/((H.z1-H.z0)/2)*ov;
      slab("shingle", [V3(xa-e, yo, z0), V3(xb+e, yo, z0), V3(xb+e, RID, z1), V3(xa-e, RID, z1)], 0.12, "#5a4e48"); }
    for(const x of [H.x0+WT/2, H.x1-WT/2]){
      const tri=[V3(x, EAV, H.z0+0.01), V3(x, EAV, H.z1-0.01), V3(x, RID-0.10, zm)];
      push("siding", new FaceGeo().slab(tri.map(p=>p.clone().add(V3(WT/2,0,0))), WT, 0.5).geo(), 0,0,0, 0, WHT); }
    B(H.x1-H.x0+0.66, 0.18, 0.04, (H.x0+H.x1)/2, EAV-0.09, H.z0-ov+0.02, TRM); B(H.x1-H.x0+0.66, 0.18, 0.04, (H.x0+H.x1)/2, EAV-0.09, H.z1+ov-0.02, TRM);
    bx("brick", 0.70, RID-EAV+1.6, 0.70, H.x0+3.0, (EAV+RID+1.6)/2, zm+0.9, 0.83, 0, "#8a4a36");
    bx("concrete", 0.80, 0.08, 0.80, H.x0+3.0, RID+0.84, zm+0.9, 0.5, 0, "#8d8b86"); }
  // the porch along the front: boards, posts, a rail, its own roof, the steps down to the walk
  { const PZ0=H.z0-2.4, PY=FF-0.02, xa=H.x0-0.6, xb=H.x1+0.6, ST={a:121.0, b:122.8};
    B(xb-xa, 0.20, H.z0-PZ0, (xa+xb)/2, PY-0.10, (PZ0+H.z0)/2-0.002, "#8a7a64");
    for(let k=0;k<Math.round((xb-xa)/0.14);k++) bx("paint", 0.006, 0.012, H.z0-PZ0-0.04, xa+0.07+k*0.14, PY, (PZ0+H.z0)/2, 0, 0, "#6e604c");
    addFlat(xa, xb, PZ0, H.z0, PY);
    for(const x of [xa+0.12, ST.a-0.08, ST.b+0.08, xb-0.12]){ B(0.14, 2.42, 0.14, x, PY+1.21, PZ0+0.12, WHT); addCol(x-0.08, x+0.08, PZ0+0.04, PZ0+0.20, PY-0.5, PY+2.4); }
    for(const [a,b] of [[xa+0.19, ST.a-0.15],[ST.b+0.15, xb-0.19]]){ B(b-a, 0.06, 0.08, (a+b)/2, PY+0.92, PZ0+0.12, WHT); B(b-a, 0.05, 0.06, (a+b)/2, PY+0.12, PZ0+0.12, WHT);
      for(let x=a+0.08; x<b-0.04; x+=0.14) B(0.035, 0.76, 0.035, x, PY+0.52, PZ0+0.12, WHT);
      addCol(a, b, PZ0+0.04, PZ0+0.20, PY-0.5, PY+0.96); }
    slab("roofmetal", [V3(xa-0.3, PY+2.90, H.z0+0.02), V3(xb+0.3, PY+2.90, H.z0+0.02), V3(xb+0.3, PY+2.46, PZ0-0.35), V3(xa-0.3, PY+2.46, PZ0-0.35)], 0.06, "#6a7076");
    B(xb-xa+0.20, 0.16, 0.10, (xa+xb)/2, PY+2.36, PZ0+0.12, WHT);
    // three steps down, four equal risers, each a block from the ground up
    for(let k=1;k<=3;k++){ const y=Y+(PY-Y)*(4-k)/4, zz=PZ0-0.15-(k-1)*0.30;
      B(ST.b-ST.a, y-Y+0.1, 0.30, (ST.a+ST.b)/2, (y+Y-0.1)/2, zz, k%2?"#8a7a64":"#84745e");
      addFlat(ST.a, ST.b, zz-0.155, zz+0.155, y); }                  // (each lapping the next, so no seam drops you to the ground)
    // the skirt round under the porch, so it doesn't float: front and ends, set in from its edge
    B(xb-xa-0.12, PY-0.18-(Y-0.1), 0.04, (xa+xb)/2, (PY-0.18+Y-0.1)/2, PZ0+0.06, TRM);
    for(const x of [xa+0.06, xb-0.06]) B(0.04, PY-0.18-(Y-0.1), H.z0-PZ0-0.12, x, (PY-0.18+Y-0.1)/2, (PZ0+H.z0)/2, TRM);
    // the swing at the west end, on chains; two rockers; the light by the door
    { const sx=xa+1.4, sz=PZ0+1.0;
      B(1.30, 0.06, 0.48, sx, PY+0.48, sz, "#7a5a3a"); B(1.30, 0.42, 0.05, sx, PY+0.72, sz+0.24, "#7a5a3a");
      for(const dx of [-0.62,0.62]) tubeE(V3(sx+dx, PY+0.50, sz), V3(sx+dx, PY+2.40, sz), 0.008, "#6a6a66");
      addSeat(sx, sz, PY+0.04, 0, "THE PORCH SWING"); addCol(sx-0.7, sx+0.7, sz-0.3, sz+0.3, PY-0.5, PY+0.9); }
    for(const x of [124.6, 126.0]){ const z=PZ0+0.9;
      B(0.50, 0.05, 0.46, x, PY+0.44, z, "#5a3a22"); B(0.50, 0.55, 0.05, x, PY+0.74, z+0.22, "#5a3a22");
      for(const dx of [-0.22,0.22]) for(const dz of [-0.2,0.2]) B(0.04, 0.42, 0.04, x+dx, PY+0.21, z+dz, "#5a3a22");
      for(const dx of [-0.22,0.22]) ent(new T.TorusGeometry(0.40, 0.02, 4, 16, 1.2), x+dx, PY+0.30, z-0.02, "#5a3a22", 0, Math.PI/2, -0.6);
      addSeat(x, z, PY+0.04, 0, "A ROCKER"); addCol(x-0.28, x+0.28, z-0.26, z+0.26, PY-0.5, PY+0.6); }
    B(0.14, 0.20, 0.10, FRONT[1].b+0.35, FF+2.0, H.z0-0.06, "#2a2a2c"); push("lamplens", new T.SphereGeometry(0.06, 10, 8), FRONT[1].b+0.35, FF+1.92, H.z0-0.14, 0, "#ffffff");
    LAMPS.push({x:FRONT[1].b+0.35, y:FF+1.85, z:H.z0-0.5, color:0xffd8a0, intensity:0.6, dist:8, decay:1.6, mothy:true});
    addZone(xa, xb, PZ0, H.z0, PY-1, PY+3, "THE PORCH"); }

  /* ---- inside: the living room ---- */
  { // the couch against the west wall, the afghan on it; a recliner; the stove; the set; a rug
    const sx=IX0+0.48, sz=Z+39.0;
    B(0.86, 0.42, 2.10, sx, FF+0.21, sz, "#6a4a3a"); B(0.22, 0.48, 2.10, sx-0.32, FF+0.66, sz, "#6a4a3a");
    for(const dz of [-1.0,1.0]) B(0.86, 0.26, 0.20, sx, FF+0.55, sz+dz*1.08, "#6a4a3a");
    for(const dz of [-0.5,0.5]) B(0.62, 0.12, 0.96, sx+0.08, FF+0.48, sz+dz, "#7a5a48");
    { const af=signTex(256,128,(c,W,Hh)=>{ const cols=["#c9662a","#e0b24a","#6b8f3a","#8a3a22","#e8dcc0"]; for(let i=0;i<10;i++){ c.fillStyle=cols[i%5]; c.fillRect(i*26,0,26,Hh); } });
      const am=new T.MeshStandardMaterial({map:af, roughness:1.0});
      // (down the back cushion's face, clear of it and of the seat, and over its top)
      const hang=new T.Mesh(boxGeo(0.02, 0.34, 0.92), am); hang.position.set(sx-0.194, FF+0.73, sz+0.45); scene.add(hang);
      const top=new T.Mesh(boxGeo(0.27, 0.02, 0.92), am); top.position.set(sx-0.32, FF+0.916, sz+0.45); scene.add(top); }
    addCol(IX0, sx+0.45, sz-1.20, sz+1.20, FF-0.5, FF+0.6);
    for(const dz of [-0.6, 0.6]) addSeat(sx+0.12, sz+dz, FF, -Math.PI/2, "THE COUCH");
    // the rug, braided, a coffee table on it
    { const rt=signTex(256,256,(x,W,Hh)=>{ const cols=["#6a2a1e","#3d4a2e","#8a6a3e","#5a3e2a","#2e3a5a"]; for(let i=0;i<24;i++){ x.fillStyle=cols[i%5]; x.beginPath(); x.arc(W/2,Hh/2,W/2-i*5.2,0,7); x.fill(); } });
      const g=new T.CircleGeometry(1, 40); g.scale(1.3, 1.0, 1);
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:rt, roughness:1.0, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.position.set(121.6, FF+0.012, sz); m.rotation.set(-Math.PI/2, 0, Math.PI/2); scene.add(m); }
    B(0.60, 0.05, 1.10, 121.5, FF+0.43, sz, "#7a5434"); for(const dx of [-0.25,0.25]) for(const dz of [-0.48,0.48]) B(0.05, 0.40, 0.05, 121.5+dx, FF+0.20, sz+dz, "#6a4428");
    B(0.30, 0.02, 0.22, 121.45, FF+0.465, sz-0.2, "#c8b88a"); C(0.04, 0.10, 121.6, FF+0.505, sz+0.25, "#e8e2d2", 10);
    addCol(121.15, 121.85, sz-0.58, sz+0.58, FF-0.5, FF+0.48);
    // the recliner by the front window, and the set on its stand against the partition, back of the way through
    { const rx=123.4, rz=Z+36.4;
      B(0.82, 0.40, 0.84, rx, FF+0.20, rz, "#4a5a3a"); B(0.82, 0.70, 0.22, rx, FF+0.75, rz-0.32, "#4a5a3a"); for(const dx of [-0.36,0.36]) B(0.12, 0.30, 0.84, rx+dx, FF+0.55, rz, "#4a5a3a");
      addCol(rx-0.43, rx+0.43, rz-0.44, rz+0.44, FF-0.5, FF+0.6); addSeat(rx, rz+0.08, FF, Math.PI, "THE RECLINER"); }
    const tz=OPN.b+1.45;                                                                // (clear of the cased opening to the kitchen)
    B(0.42, 0.62, 1.10, PX-0.30, FF+0.31, tz, "#5a3a22"); B(0.16, 0.62, 1.04, PX-0.26, FF+0.94, tz, "#141414");
    push("pic:vend:soda", planeGeo(0.94, 0.54, 0), PX-0.342, FF+0.94, tz, -Math.PI/2, "#3a5a7a");                  // the picture on it: the weather
    addCol(PX-0.52, PX-0.06, tz-0.58, tz+0.58, FF-0.5, FF+1.3);
    // the wood stove in the back corner, its pipe up through the ceiling, a box of splits
    { const wx=IX0+0.55, wz=IZ1-0.65;
      B(0.62, 0.66, 0.52, wx, FF+0.44, wz, "#1d1d1e"); for(const dx of [-0.25,0.25]) for(const dz of [-0.2,0.2]) B(0.05, 0.12, 0.05, wx+dx, FF+0.06, wz+dz, "#1d1d1e");
      B(0.02, 0.26, 0.32, wx+0.32, FF+0.48, wz, "#ff7a2a"); C(0.08, CL-FF-0.77, wx, (FF+0.77+CL)/2, wz, "#1d1d1e", 12);
      B(1.0, 0.03, 0.8, wx+0.1, FF+0.012, wz-0.05, "#7a7a76");
      for(let k=0;k<6;k++) C(0.05, 0.40, wx+0.62, FF+0.06+(k%3)*0.10, wz-0.55+((k/3)|0)*0.11, "#7a5a3a", 7, 0, 0, Math.PI/2);
      addCol(wx-0.35, wx+0.35, wz-0.30, wz+0.30, FF-0.5, CL); }
    // a floor lamp, the bookcase, pictures on the walls
    C(0.13, 0.03, IX0+0.4, FF+0.015, Z+36.2, "#3a3a3c", 14); C(0.012, 1.45, IX0+0.4, FF+0.75, Z+36.2, "#3a3a3c", 8);
    ent(new T.CylinderGeometry(0.12, 0.20, 0.24, 14, 1, true), IX0+0.4, FF+1.55, Z+36.2, "#e8dcc0");
    LAMPS.push({x:IX0+0.45, y:FF+1.45, z:Z+36.3, color:0xffd29a, intensity:0.55, dist:6, decay:1.5, indoor:true, vol:[IX0, PX, IZ0, IZ1, FF-0.5, CL]});
    // (against the back wall between the window and the partition, its open front to the room)
    B(1.00, 1.80, 0.30, 124.0, FF+0.90, IZ1-0.17, "#6a4428");
    for(let s2=0;s2<4;s2++) for(let k=0;k<9;k++) B(0.04+((k+s2)%3)*0.01, 0.20+((k*7+s2*3)%4)*0.02, 0.20, 124.0-0.40+k*0.095, FF+0.25+s2*0.42, IZ1-0.24, ["#7a1a12","#1f3f6a","#2f5a2a","#c8a23a","#5a3a22"][(k+s2)%5]);
    addCol(123.48, 124.52, IZ1-0.36, IZ1, FF-0.5, FF+1.8);
    const frame=(w,h,x,y,z,ry,draw)=>{ const cw=Math.round(w*400), ch=Math.round(h*400);
      const t=signTex(cw,ch,(c,W,Hh)=>{ c.fillStyle="#5a3a22"; c.fillRect(0,0,W,Hh); c.save(); c.beginPath(); c.rect(W*0.08,Hh*0.08,W*0.84,Hh*0.84); c.clip(); c.translate(W*0.08,Hh*0.08); draw(c,W*0.84,Hh*0.84); c.restore(); });
      signPanel(w, h, t, x, y, z, ry, false); };
    frame(0.50, 0.40, IX0+0.012, FF+1.60, sz-0.5, Math.PI/2, (c,W,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#8ab0d0"); g.addColorStop(0.6,"#c8d8c0"); g.addColorStop(1,"#5a7a3a"); c.fillStyle=g; c.fillRect(0,0,W,Hh);
      c.fillStyle="#8a2a1e"; c.fillRect(W*0.55,Hh*0.45,W*0.30,Hh*0.30); c.fillStyle="#5a5a5a"; c.beginPath(); c.moveTo(W*0.52,Hh*0.45); c.lineTo(W*0.70,Hh*0.30); c.lineTo(W*0.88,Hh*0.45); c.fill(); });
    frame(0.36, 0.46, IX0+0.012, FF+1.62, sz+0.55, Math.PI/2, (c,W,Hh)=>{ c.fillStyle="#d8ccb4"; c.fillRect(0,0,W,Hh);
      for(const [px,ph,col] of [[0.3,0.55,"#3a3a5a"],[0.55,0.62,"#5a3a2a"],[0.75,0.45,"#7a2a2a"]]){ c.fillStyle=col; c.fillRect(W*(px-0.08),Hh*(1-ph),W*0.16,Hh*ph); c.fillStyle="#e8c8a8"; c.beginPath(); c.arc(W*px,Hh*(0.95-ph),W*0.07,0,7); c.fill(); } }); }

  /* ---- inside: the kitchen ---- */
  { const KX0=PX+0.06, KC="#c9b98a", TOPC="#e8e2d2";
    // counters along the east wall under the window, upper cabinets either side of it; the sink in the counter
    const cz0=IZ0+0.1, cz1=IZ1-1.05, kx=IX1-0.31;
    B(0.62, 0.88, cz1-cz0, kx, FF+0.44, (cz0+cz1)/2, KC); B(0.66, 0.04, cz1-cz0+0.02, kx-0.02, FF+0.90, (cz0+cz1)/2, TOPC);
    for(let z=cz0+0.30; z<cz1-0.2; z+=0.60) B(0.02, 0.70, 0.54, kx-0.32, FF+0.45, z, "#b9a87a");
    B(0.46, 0.04, 0.70, kx-0.05, FF+0.925, (EAST[0].a+EAST[0].b)/2, "#c9cbcc"); B(0.40, 0.03, 0.62, kx-0.05, FF+0.905, (EAST[0].a+EAST[0].b)/2, "#9a9da0");
    C(0.012, 0.26, kx+0.18, FF+1.05, (EAST[0].a+EAST[0].b)/2, "#c9cbcc", 8); C(0.012, 0.18, kx+0.10, FF+1.17, (EAST[0].a+EAST[0].b)/2, "#c9cbcc", 8, 0, 0, Math.PI/2);
    for(const [a,b] of [[cz0, EAST[0].a-0.15],[EAST[0].b+0.15, cz1]]) if(b-a>0.3) B(0.34, 0.72, b-a, IX1-0.18, FF+1.80, (a+b)/2, KC);
    addCol(kx-0.33, IX1, cz0, cz1, FF-0.5, FF+0.92);
    // the range and the fridge along the back wall
    B(0.76, 0.92, 0.66, 128.9, FF+0.46, IZ1-0.34, "#f2f0ea"); B(0.76, 0.06, 0.66, 128.9, FF+0.95, IZ1-0.34, "#1d1d1e");
    for(const [dx,dz] of [[-0.2,-0.15],[0.2,-0.15],[-0.2,0.15],[0.2,0.15]]) C(0.09, 0.012, 128.9+dx, FF+0.986, IZ1-0.34+dz, "#3a3a3a", 14);
    B(0.76, 0.22, 0.06, 128.9, FF+1.07, IZ1-0.04, "#f2f0ea"); C(0.10, 0.12, 128.7, FF+1.04, IZ1-0.40, "#5a5a5c", 14);    // a pot on it
    B(0.80, 1.72, 0.72, IX1-0.42, FF+0.86, IZ1-0.38, "#e8e2d0"); B(0.04, 0.50, 0.04, IX1-0.76, FF+1.10, IZ1-0.76, "#c9cbcc");
    addCol(128.5, IX1, IZ1-0.75, IZ1, FF-0.5, FF+1.75);
    // the table, four chairs, a pie under a towel, the coffee
    { const tx=127.2, tz=Z+39.6;
      B(0.92, 0.05, 1.40, tx, FF+0.76, tz, "#8a6a48"); for(const dx of [-0.40,0.40]) for(const dz of [-0.62,0.62]) B(0.06, 0.74, 0.06, tx+dx, FF+0.37, tz+dz, "#7a5a3a");
      C(0.13, 0.05, tx+0.1, FF+0.81, tz-0.2, "#c8843a", 18); C(0.135, 0.01, tx+0.1, FF+0.795, tz-0.2, "#e8e2d2", 18);
      C(0.045, 0.10, tx-0.2, FF+0.84, tz+0.35, "#e8e2d2", 10);
      addCol(tx-0.48, tx+0.48, tz-0.72, tz+0.72, FF-0.5, FF+0.8);
      for(const [dx,dz,ry] of [[0,-0.95,0],[0,0.95,Math.PI],[-0.72,-0.3,Math.PI/2],[0.72,0.3,-Math.PI/2]]){
        const cx=tx+dx, cz=tz+dz, s=Math.sin(ry), c=Math.cos(ry);
        B(0.42, 0.04, 0.40, cx, FF+0.46, cz, "#7a5a3a");
        for(const [a,b] of [[-0.18,-0.17],[0.18,-0.17],[-0.18,0.17],[0.18,0.17]]) B(0.035, 0.44, 0.035, cx+a*c+b*s, FF+0.22, cz-a*s+b*c, "#6a4a2a");
        B(0.40, 0.48, 0.035, cx-0.19*s, FF+0.74, cz-0.19*c, "#7a5a3a", ry);
        addSeat(cx, cz, FF, ry+Math.PI, "A KITCHEN CHAIR"); } }
    // the calendar from the feed store, the clock, the radio on the sill
    sign(0.36, 0.54, (c,W,Hh)=>{ c.fillStyle="#f4f0e2"; c.fillRect(0,0,W,Hh); c.fillStyle="#2a6a2a"; c.fillRect(0,0,W,Hh*0.42);
        say(c,"OCTOBER",W/2,Hh*0.15,W*0.7,Hh*0.10,"#f4f0e2","800","Arial"); c.fillStyle="#c8a23a"; c.beginPath(); c.arc(W/2,Hh*0.30,W*0.14,0,7); c.fill();
        for(let r2=0;r2<5;r2++) for(let k=0;k<7;k++){ c.strokeStyle="#bbb"; c.strokeRect(W*0.06+k*W*0.126, Hh*0.46+r2*Hh*0.085, W*0.126, Hh*0.085); }
        say(c,"MILLER FEED & SEED · EDINBORO",W/2,Hh*0.94,W*0.84,Hh*0.06,"#2a2a2a","700","Arial"); }, KX0+0.02, FF+1.55, Z+37.0, Math.PI/2, false, 180);
    C(0.16, 0.03, KX0+0.032, FF+2.05, Z+41.6, "#f2f0ea", 24, 0, 0, Math.PI/2);
    B(0.12, 0.18, 0.32, IX1-0.12, FF+0.92+0.09+0.006, EAST[0].b+0.30, "#7a1a12");                    // the radio, on the counter by the window
    // the light over the table
    tubeE(V3(127.2, CL, Z+39.6), V3(127.2, CL-0.45, Z+39.6), 0.006, "#2a2a2a");
    ent(new T.CylinderGeometry(0.08, 0.22, 0.16, 16, 1, true), 127.2, CL-0.52, Z+39.6, "#e8e2c8");
    push("tube", new T.SphereGeometry(0.05, 10, 8), 127.2, CL-0.56, Z+39.6, 0, "#ffffff");
    LAMPS.push({x:127.2, y:CL-0.7, z:Z+39.6, color:0xffd8a8, intensity:0.85, dist:7, decay:1.4, indoor:true, vol:[PX, IX1, IZ0, IZ1, FF-0.5, CL]});
    addUse(127.2, Z+38.0, FF, "HAVE SOME PIE", ()=>toast(["APPLE, STILL WARM. A NOTE: “FOR AFTER SUPPER. MEANS YOU, DALE”","YOU CUT A SLIVER. NOBODY WILL NOTICE A SLIVER","A FORK'S ALREADY IN IT"][(Math.random()*3)|0],"#e8c46a"), 1.0); }
  addZone(IX0, PX, IZ0, IZ1, FF-0.5, CL, "THE WEIRS' FRONT ROOM", true);
  addZone(PX, IX1, IZ0, IZ1, FF-0.5, CL, "THE WEIRS' KITCHEN", true);
  // the yard round the house: maples, a windbreak of spruce, the clothesline, the woodpile by the back door
  tree("lawn", 113.0, Z+28.0, 1.10); tree("lawn", 136.5, Z+27.0, 0.95); tree("lawn", 114.0, Z+52.0, 1.05); tree("lawn", 133.0, Z+52.0, 0.85);
  for(let z=Z+18; z<Z+78; z+=4.4) tree("spruce", 106.5+(r()-0.5)*1.5, z+(r()-0.5)*1.2, 0.75+r()*0.25);
  { const ax=120.5, bx2=127.5, cz=Z+51.5;
    for(const x of [ax, bx2]){ B(0.10, 2.2, 0.10, x, Y+1.1, cz, "#7a6448"); B(0.9, 0.08, 0.08, x, Y+2.1, cz, "#7a6448"); addCol(x-0.08, x+0.08, cz-0.08, cz+0.08, Y-0.5, Y+2.2); }
    for(const dz of [-0.38,0.38]) tubeE(V3(ax, Y+2.06, cz+dz), V3(bx2, Y+2.06, cz+dz), 0.005, "#d8d8d0");
    for(let k=0;k<6;k++){ const x=ax+0.8+k*1.0, c2=["#f2f0ea","#3a5a8a","#c41a1a","#e8e2c8","#5a7a3a","#f2f0ea"][k];
      const m=new T.Mesh(new T.PlaneGeometry(0.62, 0.78), new T.MeshStandardMaterial({color:c2, roughness:1.0, side:T.DoubleSide}));
      m.position.set(x, Y+1.66, cz+(k%2?0.38:-0.38)); m.rotation.y=0.02*(k-3); scene.add(m); } }
  { const wx=BACK[3].a-1.6, wz=H.z1+1.0;
    for(let row=0;row<4;row++) for(let k=0;k<9;k++) C(0.08, 0.42, wx-0.7+k*0.17+(row%2)*0.08, Y+0.09+row*0.155, wz, "#8a6a48", 7, Math.PI/2);
    addCol(wx-0.85, wx+0.85, wz-0.25, wz+0.25, Y-0.5, Y+0.7); }

  /* ---- the barn and the silos ---- */
  { const BX0=168, BX1=194, BZ0=Z+48, BZ1=Z+68, BE=Y+5.2, BK=Y+8.0, BR=Y+10.6, IN=3.6, RED="#8a2a1e";
    bx("rock", BX1-BX0+0.2, 1.4, BZ1-BZ0+0.2, (BX0+BX1)/2, Y+0.5, (BZ0+BZ1)/2, 0.6, 0, "#8d877b");
    for(const [x0,x1,z0,z1] of [[BX0-0.02,BX1+0.02,BZ0,BZ0+0.18],[BX0-0.02,BX1+0.02,BZ1-0.18,BZ1],[BX0,BX0+0.18,BZ0+0.18,BZ1-0.18],[BX1-0.18,BX1,BZ0+0.18,BZ1-0.18]])
      wallBox("wood", x0, x1, z0, z1, Y+1.2, BE+(x1-x0>1?0.01:0), RED, 0.4, Y);     // (the long walls a centimetre over the ends at the top)
    // the gambrel: steep below, shallow above, along the barn
    const zm=(BZ0+BZ1)/2, ov=0.5;
    for(const sd of [-1,1]){ const ze=sd<0?BZ0-ov:BZ1+ov, zk=zm+sd*((BZ1-BZ0)/2-IN);
      slab("roofmetal", [V3(BX0-0.4, BE-0.25, ze), V3(BX1+0.4, BE-0.25, ze), V3(BX1+0.4, BK, zk), V3(BX0-0.4, BK, zk)], 0.08, "#7a7e80");
      const e=sd<0?0.42:0.44;                                            // (the upper slabs past the lower, and past each other at the ridge)
      slab("roofmetal", [V3(BX0-e, BK, zk), V3(BX1+e, BK, zk), V3(BX1+e, BR, zm), V3(BX0-e, BR, zm)], 0.08, "#7a7e80"); }
    // the gable ends: clapboard up to the roof's line, the big doors in the west one, the mow door over them
    for(const x of [BX0+0.09, BX1-0.09]){
      const pts=[[BZ0+0.01,BE],[BZ0+IN,BK],[zm,BR-0.12],[BZ1-IN,BK],[BZ1-0.01,BE]];
      for(let k=0;k<3;k++){ const a=pts[0], b=pts[k+1], c=pts[k+2];
        push("wood", new FaceGeo().slab([V3(x+0.09,a[1],a[0]), V3(x+0.09,b[1],b[0]), V3(x+0.09,c[1],c[0])], 0.18, 0.4).geo(), 0,0,0, 0, RED); } }
    for(const dz of [-1.6, 1.6]){ B(0.06, 4.0, 3.1, BX0-0.03, Y+3.2, zm+dz, "#7a2418");
      for(const t of [-1,1]) ent(boxGeo(0.07, 4.6, 0.12), BX0-0.06, Y+3.2, zm+dz, "#f2f0ea", 0.70*t, 0, 0);
      B(0.08, 0.12, 3.14, BX0-0.065, Y+5.17, zm+dz, "#f2f0ea"); B(0.08, 0.12, 3.14, BX0-0.065, Y+1.23, zm+dz, "#f2f0ea"); }
    B(0.06, 1.8, 2.0, BX0-0.03, Y+6.9, zm, "#7a2418"); B(0.08, 1.9, 0.10, BX0-0.065, Y+6.9, zm-1.0, "#f2f0ea"); B(0.08, 1.9, 0.10, BX0-0.065, Y+6.9, zm+1.0, "#f2f0ea");
    B(0.10, 0.10, 0.6, BX0-0.30, Y+8.1, zm, "#3a3a3c");                                     // the hay hook's beam
    sign(2.2, 0.50, (c,W,H)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,H); say(c,"WEIR · 1911",W/2,H/2,W*0.8,H*0.62,RED,"900","Georgia, serif"); }, BX0-0.01, Y+8.9, zm, -Math.PI/2, false, 440);
    addCol(BX0-0.1, BX1+0.1, BZ0-0.1, BZ1+0.1, Y-0.5, BR);
    addUse(BX0-1.0, zm, Y, "TRY THE BARN DOORS", ()=>toast(["THE DOORS ARE ON A ROLLER AND CHAINED. INSIDE, A COW SAYS SOMETHING","HAY, DIESEL, MANURE. THE SMELL GETS OUT EVEN WITH THE DOORS SHUT","A HAND-PAINTED NOTE ON THE CHAIN: “MILKING 5 AM AND 5 PM”"][(Math.random()*3)|0],"#cfe0d4"), 1.6);
    for(const [sx,sz] of [[BX1+3.6, BZ0+5.0],[BX1+3.6, BZ0+12.0]]){
      C(3.0, 15.5, sx, Y+7.75, sz, "#b8b2a4", 28);
      for(let k=0;k<11;k++) ent(new T.TorusGeometry(3.02, 0.025, 4, 32), sx, Y+0.8+k*1.4, sz, "#5a5a58", Math.PI/2, 0, 0);
      ent(new T.SphereGeometry(3.05, 24, 10, 0, Math.PI*2, 0, Math.PI/2), sx, Y+15.5, sz, "#9aa0a2");
      B(0.5, 15.0, 0.5, sx-3.15, Y+7.8, sz, "#9a9490");
      addCol(sx-3.05, sx+3.05, sz-3.05, sz+3.05, Y-0.5, Y+16); }
    // a hay wagon by the barn, loaded
    { const wx=BX0-7.0, wz=BZ1-2.5;
      B(2.4, 0.10, 4.8, wx, Y+0.95, wz, "#8a6a48"); for(const dz of [-1.6,1.6]) for(const dx of [-1.1,1.1]) C(0.36, 0.20, wx+dx, Y+0.38, wz+dz, "#1d1d1e", 16, 0, 0, Math.PI/2);
      for(let row=0;row<3;row++) for(let k=0;k<(row===2?4:6);k++) B(1.0, 0.40, 0.48, wx-0.55+(k%2)*1.1, Y+1.22+row*0.41, wz-1.9+((k/2)|0)*0.98+(row===2?0.49:0), "#b9a463");
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

  /* ---- the cows, out in the pasture behind ---- */
  const cow=(x, z, ry, graze)=>{ const g=new T.Group(); g.position.set(x, Y, z); g.rotation.y=ry; scene.add(g);
    const M=[], add=(geo,px,py,pz,c,rx)=>M.push({geo:geo, matrix:new T.Matrix4().compose(V3(px,py,pz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,0)), V3(1,1,1)), color:new T.Color(c)});
    const W="#f2f0ea", K="#1a1a1a", spot=()=>r()<0.5?W:K;
    add(new T.SphereGeometry(0.5, 14, 10).scale(0.95, 0.95, 1.65), 0, 1.15, 0, spot());
    for(const [px,pz] of [[0.2,0.4],[-0.25,-0.3],[0.15,-0.6]]) add(new T.SphereGeometry(0.30, 10, 8).scale(1.0, 0.9, 1.3), px*1.4, 1.2+r()*0.15, pz, r()<0.5?K:W);
    for(const [lx,lz] of [[-0.26,0.55],[0.26,0.55],[-0.26,-0.55],[0.26,-0.55]]) add(new T.CylinderGeometry(0.075,0.065,0.85,8), lx, 0.43, lz, r()<0.6?W:K);
    add(new T.SphereGeometry(0.16, 10, 8).scale(1.0,0.7,1.0), 0, 0.68, -0.25, "#e8b8a8");
    const hy=graze?0.42:1.25, hz=graze?1.05:1.0, hr=graze?0.9:0.15;
    add(new T.BoxGeometry(0.30, 0.34, 0.50), 0, hy, hz, spot(), hr);
    add(new T.BoxGeometry(0.24, 0.16, 0.14), 0, hy-(graze?0.12:0.08), hz+(graze?0.14:0.26), "#e8b8a8", hr);
    for(const sd of [-1,1]) add(new T.BoxGeometry(0.16, 0.05, 0.08), sd*0.20, hy+0.10, hz-0.12, K, hr);
    add(new T.CylinderGeometry(0.02,0.03,0.7,6), 0, 0.95, -0.82, K, 0.25);
    const m=new T.Mesh(mergeEntries(M), new T.MeshStandardMaterial({vertexColors:true, roughness:0.8})); m.castShadow=true; g.add(m);
    addColOB(x, z, ry, 0.5, 1.1, Y-0.5, Y+1.6);
    EDIN_PLACES.cows.push({g:g, x:x, z:z, ry:ry, t:r()*10}); };
  for(const [x,z,ry,gz] of [[150,Z+178,0.4,1],[158,Z+184,2.0,1],[171,Z+176,-1.2,0],[186,Z+192,0.9,1],[197,Z+181,2.6,1],[214,Z+200,-0.4,0],[176,Z+206,1.5,1],[205,Z+222,-2.2,1]]) cow(x, z, ry, gz);

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.08}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  EDIN_PLACES.farm={house:H, ff:FF, door:FRONT[1], lane:LX};
})();
// the cows: one in a while lifts its head, flicks, puts it down again; they turn a little as they graze
function updateEdinboro(dt){
  for(const c of EDIN_PLACES.cows){ c.t+=dt; c.g.rotation.y=c.ry+Math.sin(c.t*0.05)*0.25; }
}
