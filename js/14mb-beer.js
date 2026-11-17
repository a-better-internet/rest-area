"use strict";
/* REST AREA · 14mb-beer.js
   Hollow Road, north off US 6N, and Edinboro Beer's drive-thru on it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. (After 14q: its clerk is one of the crowd.) */
/* ----------------------------------------------------------------------
   14mb · HOLLOW ROAD AND EDINBORO BEER
   Between the last of the farms and the fireworks outlet a road turns off
   US 6N to the north (a left, eastbound) and runs on up through the woods:
   two lanes and a double yellow, a stop sign at the mouth. The first thing
   on it, on the right, is Edinboro Beer: a long white block building with
   the drive-thru straight through it. You drive in the west end under IN,
   the cases stacked to head height either side under strings of pennants,
   the flags and the banners, the kid in the green shirt at the counter,
   and out the east end under OUT; round the back of the lot and away.
   Mulch and stone on pallets out front, the ice chest, the propane cage.
   Past it the road goes on into the woods and off the map.

   Everything on it is the place's own: the name, the brands on the cases
   and the banners are made up here.

   PLAN (world): EAST.beer (04): the road's centre x 732 from US 6N's north
   edge to z -1338, its clearing x 721..743; the lot x 735..800, z -1306..
   -1258 in its clearing x 733..812, z -1316..-1250; the building x 748..782,
   z -1290..-1276, its aisle z -1285.5..-1280.5 west to east. All level with
   the road (04 grades the clearings), on RING_EAST's 4 m ground.
   ---------------------------------------------------------------------- */
const BEER={routes:{}, served:false, aisle:null};
(function hollowRoad(){
  if(typeof EAST==="undefined" || !EAST.beer) return;
  const E=EDIN, Z=E.z, Y=E.y, HW=E.hw, Bq=EAST.beer, RX=Bq.rx, RW=3.4, END=Bq.end, LY=Y+PAVE_T+0.015;
  const LX0=735, LX1=800, LZ0=-1306, LZ1=-1258;
  const BX0=748, BX1=782, BZ0=-1290, BZ1=-1276, WT=0.25, FLS=LY, CEIL=FLS+4.4, TOPW=CEIL+0.55, AZ0=-1285.5, AZ1=-1280.5;
  const ME=[], PN=[];
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, gy=Terrain.groundAt(x, z); addCol(x-rr, x+rr, z-rr, z+rr, gy-0.5, gy+6); };
  const GREEN="#1f6a34", GOLD="#f2c230", WHITEW="#e4e2da";

  /* ---- the paving: the road, its mouth's rounded corners onto US 6N's shoulder, and the lot, as one surface; the building left out ---- */
  { const road=SD_rect(RX-RW, RX+RW, END, Z-HW+0.6), mouth=SD_rect(RX-14, RX+14, Z-HW, Z-HW+0.6), lot=SD_rect(LX0, LX1, LZ0, LZ1), bld=SD_rect(BX0, BX1, BZ0, BZ1);
    const U=sdUnion([road, mouth, lot], 6), sd=(x, z)=>Math.max(U(x, z), -bld(x, z));
    push("lotpave", sdPaveGeo(sd, RX-17, LX1+1, END-0.5, Z-HW+1, 0.25, 3), 0, LY, 0, 0, "#9a9a96");
    addPaveRect(RX-RW, RX+RW, END, Z-HW, Y); addPaveRect(LX0, LX1, LZ0, LZ1, Y); addPaveRect(RX-11, RX+11, Z-HW-6, Z-HW, Y); }
  // its lines: the double yellow up the middle, the white edges (open across the lot's mouth), the stop bar for the way out
  for(const o of [-0.12, 0.12]) stripe(RX+o, Z-HW-1.2, RX+o, END+0.6, 0.1, YELLOW_LINE, LY);
  stripe(RX-3.15, Z-HW-7.5, RX-3.15, END+0.6, 0.12, WHITE_LINE, LY);
  stripe(RX+3.15, Z-HW-7.5, RX+3.15, LZ1-1.5, 0.12, WHITE_LINE, LY); stripe(RX+3.15, LZ0+1.5, RX+3.15, END+0.6, 0.12, WHITE_LINE, LY);
  stripe(RX-3.05, Z-HW-3.2, RX-0.3, Z-HW-3.2, 0.45, WHITE_LINE, LY);
  // the lot's arrows, painted: in at the west door, out at the east
  for(const [x, ry] of [[742.5, -Math.PI/2],[788.5, -Math.PI/2]]){ stripe(x-1.2, (AZ0+AZ1)/2, x+0.6, (AZ0+AZ1)/2, 0.25, WHITE_LINE, LY);
    for(const s of [-1, 1]) stripe(x+0.6, (AZ0+AZ1)/2, x+0.05, (AZ0+AZ1)/2+s*0.6, 0.22, WHITE_LINE, LY+(s>0 ? 0.002 : 0.004)); }   // (each stroke its own height)

  /* ---- the walls of the world here, as far as you can push through the trees ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300), L=Bq.lot, R=Bq.road;
    W(R.x0-0.4, R.x0+0.4, END, R.z1); W(R.x1-0.4, R.x1+0.4, L.z1, R.z1); W(R.x1-0.4, R.x1+0.4, END, L.z0);
    W(R.x1, L.x1, L.z1-0.4, L.z1+0.4); W(L.x1-0.4, L.x1+0.4, L.z0, L.z1); W(R.x1, L.x1, L.z0-0.4, L.z0+0.4);
    W(R.x0, R.x1, END-0.4, END+0.4).msg="HOLLOW ROAD RUNS ON NORTH THROUGH THE WOODS FROM HERE. THIS IS AS FAR AS THE MAP GOES";
    addZone(R.x0, R.x1, END, R.z1, Y-2, Y+12, "HOLLOW ROAD"); addZone(L.x0, L.x1, L.z0, L.z1, Y-2, Y+12, "EDINBORO BEER"); }
  // the woods close in either side, real trees several rows deep (07 keeps the shell low behind them)
  if(typeof FOREST!=="undefined"){ const q=_trng(1607);
    const row=(x0, z0, x1, z1, nx, nz)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.round(L/6.4);
      for(let k=0;k<=n;k++) for(const [dep, sp] of [[1.8, "edge"],[6.5, null],[11.5, null],[16.5, null]]){ if(q()<0.15) continue;
        const t=(k+q()*0.6)/Math.max(1, n), x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(sp || (q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard"), x, z, 0.85+q()*0.4); } };
    const L=Bq.lot, R=Bq.road;
    row(R.x0, END, R.x0, R.z1-1, -1, 0); row(R.x1, L.z1+1, R.x1, R.z1-1, 1, 0); row(R.x1, END, R.x1, L.z0-1, 1, 0);
    row(L.x0+10, L.z1, L.x1, L.z1, 0, 1); row(L.x1, L.z0, L.x1, L.z1, 1, 0); row(L.x0+10, L.z0, L.x1, L.z0, 0, -1);
    // and across the road's end, deep: the road runs on into them, so they must be real well past where you can go
    for(const off of [0, 20, 40]) row(R.x0-30, END-off, R.x1+30, END-off, 0, -1); }

  /* ---- signs at the mouth: the stop sign and the road's name, and the place's own for traffic on US 6N ---- */
  const post=(x, z, top)=>{ const gy=Terrain.groundAt(x, z); B(0.06, top, 0.06, x, gy+top/2, z, "#a3a8aa"); addCol(x-0.06, x+0.06, z-0.06, z+0.06, gy-0.5, gy+top); return gy; };
  { const x=RX-4.6, z=Z-HW-3.0, gy=post(x, z, 2.95);
    const t=signTex(240, 240, (c, W, H)=>{ c.fillStyle="#b3191e"; c.beginPath(); for(let k=0;k<8;k++){ const a=Math.PI/8+k*Math.PI/4; c.lineTo(W/2+Math.cos(a)*W*0.49, H/2+Math.sin(a)*H*0.49); } c.fill();
      c.strokeStyle="#f4f2ec"; c.lineWidth=8; c.beginPath(); for(let k=0;k<8;k++){ const a=Math.PI/8+k*Math.PI/4; c.lineTo(W/2+Math.cos(a)*W*0.43, H/2+Math.sin(a)*H*0.43); } c.closePath(); c.stroke();
      c.fillStyle="#f4f2ec"; fitHwy(c, "STOP", W*0.62, H*0.26, W/2, H/2); });
    const m=new T.Mesh(new T.CircleGeometry(0.38, 8), new T.MeshStandardMaterial({map:t, roughness:0.6, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2}));
    m.geometry.rotateZ(Math.PI/8); m.position.set(x, gy+2.2, z-0.045); m.rotation.y=Math.PI; scene.add(m); B(0.62, 0.62, 0.02, x, gy+2.2, z-0.02, "#8d9294");   // (its face to the north, to the way out)
    for(const ry of [0, Math.PI/2]){ B(0.9, 0.17, 0.02, x, gy+2.85, z, "#8d9294", ry);
      for(const s of [-1, 1]) sign(0.88, 0.15, (c, W, H)=>{ c.fillStyle="#1f6a3a"; c.fillRect(0, 0, W, H); c.strokeStyle="#f4f2ec"; c.lineWidth=3; c.strokeRect(3, 3, W-6, H-6); c.fillStyle="#f4f2ec"; fitHwy(c, "HOLLOW RD", W*0.8, H*0.6, W/2, H/2); },
        x+(ry ? s*0.012 : 0), gy+2.85, z+(ry ? 0 : s*0.012), ry+(s<0 ? Math.PI : 0), false, 264); } }
  { const x=RX+6.0, z=Z-HW-2.6, gy=post(x-0.7, z, 2.9); post(x+0.7, z, 2.9); B(1.7, 0.9, 0.04, x, gy+2.4, z-0.03, "#2a2a2a");
    sign(1.66, 0.86, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); c.fillStyle=GREEN; c.fillRect(W*0.04, H*0.06, W*0.92, H*0.5);
        say(c, "EDINBORO BEER", W/2, H*0.31, W*0.8, H*0.3, GOLD); say(c, "DRIVE THRU · KEGS · ICE · NEXT RIGHT", W/2, H*0.76, W*0.8, H*0.16, "#1a1a1a", "700", "Arial"); },
      x, gy+2.4, z-0.008, 0, false, 400); }

  /* ---- the building: white painted block, a flat roof behind a parapet ---- */
  const wb=(x0, x1, z0, z1, y0, y1)=>wallBox("block", x0, x1, z0, z1, y0, y1, WHITEW, 0.6, FLS);
  // along x, the whole length; along z, between them. Openings: the drive-thru's at each end, the shop door and a window of glass block south
  const run=(ax, c0, c1, a, b, y0, y1, ops)=>{ let u=a;
    const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return; if(ax==="x") wb(p, q, c0, c1, h0, h1); else wb(c0, c1, p, q, h0, h1); };
    for(const o of ops.slice().sort((m, n)=>m.a-n.a)){ piece(u, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); u=o.b; } piece(u, b, y0, y1); };
  const DOOR={a:751.6, b:752.6, sill:FLS-0.3, head:FLS+2.15}, GB={a:771.0, b:773.4, sill:FLS+1.0, head:FLS+2.4}, LANE={a:AZ0+0.4, b:AZ1-0.4, sill:FLS-0.3, head:FLS+3.8};
  run("x", BZ0, BZ0+WT, BX0, BX1, FLS-0.3, TOPW, []);
  run("x", BZ1-WT, BZ1, BX0, BX1, FLS-0.3, TOPW, [DOOR, GB]);
  run("z", BX0, BX0+WT, BZ0+WT, BZ1-WT, FLS-0.3, TOPW, [LANE]);
  run("z", BX1-WT, BX1, BZ0+WT, BZ1-WT, FLS-0.3, TOPW, [LANE]);
  B(BX1-BX0-2*WT+0.04, 0.25, BZ1-BZ0-2*WT+0.04, (BX0+BX1)/2, CEIL+0.125, (BZ0+BZ1)/2, "#c8c4ba");
  for(const zc of [BZ0+WT/2, BZ1-WT/2]) B(BX1-BX0+0.08, 0.06, WT+0.08, (BX0+BX1)/2, TOPW+0.03, zc, "#8a8a86");
  for(const xc of [BX0+WT/2, BX1-WT/2]) B(WT+0.06, 0.06, BZ1-BZ0-2*WT-0.08, xc, TOPW+0.03, (BZ0+BZ1)/2, "#8a8a86");
  // the drive-thru's openings: steel jambs, the roll-up doors wound up in their hoods, IN and OUT over them, ENTER and EXIT down their sides
  for(const [xw, xo, word, side, nx] of [[BX0, BX0-0.02, "IN", "ENTER", -1],[BX1, BX1+0.02, "OUT", "EXIT", 1]]){
    for(const z of [LANE.a-0.04, LANE.b+0.04]) B(WT+0.06, 3.8, 0.08, xw+(nx<0 ? WT/2 : -WT/2), FLS+1.9, z, "#5a5e60");
    B(0.4, 0.42, LANE.b-LANE.a+0.5, xw-nx*(WT+0.2)+(nx<0 ? 0 : 0), FLS+4.04, (LANE.a+LANE.b)/2, "#6a6e70");          // (the door wound up in its hood, inside)
    const fx=xo+nx*0.01, ry=nx<0 ? -Math.PI/2 : Math.PI/2;
    B(0.03, 0.62, 1.4, xw+nx*0.015, FLS+4.15, (LANE.a+LANE.b)/2, "#f4f2ec");
    sign(1.36, 0.58, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); say(c, word, W/2, H/2, W*0.8, H*0.6, GREEN); }, xw+nx*0.033, FLS+4.15, (LANE.a+LANE.b)/2, ry, false, 270);
    for(const zz of [LANE.a-0.55, LANE.b+0.55]){ B(0.03, 2.6, 0.5, xw+nx*0.015, FLS+2.1, zz, "#f4f2ec");
      sign(0.46, 2.56, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); const n=side.length; c.fillStyle=GREEN;
          for(let k=0;k<n;k++){ c.font="900 10px Arial"; fitText(c, side[k], W*0.8, H/n*0.62, W/2, H*(k+0.5)/n, "900", "'Arial Black', Arial"); } },
        xw+nx*0.033, FLS+2.1, zz, ry, false, 92); } }
  // the front, to the south: the long sign (the name in gold boxes, the drive-thru painted), the number, a sale board; the shop door, glass block
  { B(23.0, 1.5, 0.04, 769.6, FLS+3.55, BZ1+0.02, "#f4f2ec");
    sign(22.9, 1.44, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H);
        const box=(x0, x1, txt)=>{ c.fillStyle=GOLD; c.fillRect(W*x0, H*0.1, W*(x1-x0), H*0.8); c.strokeStyle="#1a1a1a"; c.lineWidth=3; c.strokeRect(W*x0, H*0.1, W*(x1-x0), H*0.8); say(c, txt, W*(x0+x1)/2, H*0.5, W*(x1-x0)*0.8, H*0.62, GREEN); };
        box(0.03, 0.40, "EDINBORO"); box(0.43, 0.62, "BEER");
        c.fillStyle=GREEN; c.fillRect(W*0.66, H*0.24, W*0.31, H*0.52); say(c, "DRIVE THRU", W*0.815, H*0.5, W*0.31*0.8, H*0.4, "#f4f2ec");
        // a hop cone between the words
        c.fillStyle="#3a8a3a"; for(let k=0;k<5;k++) for(let j=0;j<=k%3;j++){ c.beginPath(); c.ellipse(W*0.415+(j-(k%3)/2)*H*0.08, H*(0.3+k*0.09), H*0.05, H*0.04, 0, 0, 7); c.fill(); } },
      769.6, FLS+3.55, BZ1+0.045, 0, false, 2400);
    B(0.62, 0.32, 0.03, 754.0, FLS+2.4, BZ1+0.015, "#f4f2ec");
    sign(0.6, 0.3, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); say(c, "2210", W/2, H/2, W*0.8, H*0.6, GREEN); }, 754.0, FLS+2.4, BZ1+0.032, 0, false, 200);
    B(0.9, 1.3, 0.03, 760.2, FLS+1.35, BZ1+0.015, "#f4f2ec");
    sign(0.88, 1.28, (c, W, H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0, 0, W, H); c.fillStyle="#c41a1a"; c.fillRect(W*0.06, H*0.05, W*0.88, H*0.26);
        say(c, "HOT SALE!", W/2, H*0.18, W*0.76, H*0.16, "#f4f2ec"); say(c, "LAKESHORE LIGHT", W/2, H*0.42, W*0.8, H*0.09, "#1a1a1a", "700", "Arial"); say(c, "30 CANS", W/2, H*0.53, W*0.8, H*0.08, "#1a1a1a", "700", "Arial");
        say(c, "$20.98", W/2, H*0.75, W*0.8, H*0.22, "#c41a1a"); }, 760.2, FLS+1.35, BZ1+0.032, 0, false, 240);
    // the shop door, steel with a wire-glass light; the glass block, its mortar lines drawn
    makeDoor(XF(DOOR.a+0.02, BZ1-WT/2, 0), 0, FLS+0.01, 0, "EDINBORO BEER", true, 0, "steel", 0x3a3e40);
    addFlat(DOOR.a, DOOR.b, BZ1-WT-0.02, BZ1+0.02, FLS);
    const gt=signTex(240, 160, (c, W, H)=>{ c.fillStyle="#bfd8d8"; c.fillRect(0, 0, W, H); c.fillStyle="#e8f2f2"; for(let i=0;i<8;i++) for(let j=0;j<5;j++){ c.fillRect(i*30+4, j*32+4, 22, 24); }
      c.strokeStyle="#9aa8a8"; c.lineWidth=4; for(let i=0;i<=8;i++){ c.beginPath(); c.moveTo(i*30, 0); c.lineTo(i*30, H); c.stroke(); } for(let j=0;j<=5;j++){ c.beginPath(); c.moveTo(0, j*32); c.lineTo(W, j*32); c.stroke(); } });
    for(const zf of [BZ1-0.04, BZ1-WT+0.04]){ const m=new T.Mesh(new T.PlaneGeometry(GB.b-GB.a, GB.head-GB.sill), new T.MeshStandardMaterial({map:gt, roughness:0.3, emissive:0x223030, emissiveIntensity:0.3}));
      m.position.set((GB.a+GB.b)/2, (GB.sill+GB.head)/2, zf); m.rotation.y=zf>BZ1-WT/2 ? 0 : Math.PI; scene.add(m); }
    B(GB.b-GB.a, 0.08, WT-0.1, (GB.a+GB.b)/2, (GB.sill+GB.head)/2, BZ1-WT/2, "#bfd8d8"); }
  // gooseneck lamps over the front and the IN end, lit after dark
  BEER.lamps=[];
  for(const [x, z, nx, nz] of [[757, BZ1, 0, 1],[768, BZ1, 0, 1],[779, BZ1, 0, 1],[BX0, -1288.4, -1, 0],[BX0, -1277.6, -1, 0]]){
    const y=FLS+2.62; C(0.02, 0.5, x+nx*0.25, y, z+nz*0.25, "#2a4a3a", 6, nz ? Math.PI/2 : 0, 0, nx ? Math.PI/2 : 0);
    ent(new T.ConeGeometry(0.2, 0.16, 14, 1, true), x+nx*0.52, y-0.04, z+nz*0.52, "#2a4a3a");
    push("rn_glow", new T.CircleGeometry(0.16, 12), x+nx*0.52, y-0.115, z+nz*0.52, 0, "#ffffff", Math.PI/2, 0);
    const L={x:x+nx*0.6, y:y-0.3, z:z+nz*0.6, color:0xffd8a0, intensity:0, dist:9, decay:1.5, mothy:true}; LAMPS.push(L); BEER.lamps.push(L); }

  /* ---- inside: a concrete floor, the lane's yellow edges, the stock either side, the counter, the coolers ---- */
  { const g=new T.PlaneGeometry(BX1-BX0, BZ1-BZ0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(BX1-BX0)/2, U.getY(i)*(BZ1-BZ0)/2);
    push("concrete", g, (BX0+BX1)/2, FLS, (BZ0+BZ1)/2, 0, "#a8a49a", -Math.PI/2, 0); }
  addFlat(BX0, BX1, BZ0, BZ1, FLS);
  for(const z of [AZ0+0.15, AZ1-0.15]) stripe(BX0+0.4, z, BX1-0.4, z, 0.12, "#e2b31c", FLS-0.001);
  for(let x=BX0+3; x<BX1-2; x+=4) stripe(x, (AZ0+AZ1)/2-0.9, x+1.6, (AZ0+AZ1)/2-0.9, 0.06, "#e8e6e0", FLS-0.001);
  addZone(BX0, BX1, BZ0, BZ1, FLS-0.5, CEIL, "EDINBORO BEER · THE DRIVE THRU", true);
  BEER.aisle={x0:BX0, x1:BX1, z0:AZ0, z1:AZ1};

  // the stock: cases stacked on pallets, a picture of the stacked cases on each block (an atlas of the house's brands)
  const BR=[["ALLEGHENY LAGER","#c8282a","#f4efe0"],["LAKESHORE LIGHT","#2a5aa8","#f4f2ec"],["FRENCH CREEK PALE","#2e7a3a","#f4e8c8"],["ERIE GOLD","#d8a020","#1a1a1a"],
            ["RUST BELT IPA","#8a3a1a","#f2e2c8"],["CONNEAUT CIDER","#7a1a3a","#f2e4c8"],["OLD NO. 6 STOUT","#1a1a1a","#e8c870"],["COUNTY LINE ICE","#4aa8c8","#0a1a2a"]];
  // (laid out inside a margin, so nothing painted on it comes near the canvas's edge)
  const AW=1024, AH=512, AP=40, APV=24, ACW=(AW-2*AP)/4, ACH=(AH-2*APV)/2;
  const atlas=signTex(AW, AH, (c, W, H)=>{ const cw=ACW, ch=ACH; c.fillStyle="#3a3a3a"; c.fillRect(0, 0, W, H);
    BR.forEach(([n, bg, fg], k)=>{ const ox=AP+(k%4)*cw, oy=APV+((k/4)|0)*ch;
      for(let r=0;r<6;r++) for(let q=0;q<3;q++){ const x=ox+q*cw/3, y=oy+r*ch/6, w=cw/3, h=ch/6;
        c.fillStyle=bg; c.fillRect(x, y, w, h); c.fillStyle="rgba(0,0,0,0.25)"; c.fillRect(x, y+h-3, w, 3); c.fillRect(x+w-2, y, 2, h);
        c.fillStyle=fg; c.fillRect(x+w*0.08, y+h*0.32, w*0.84, h*0.36); c.fillStyle=bg; fitText(c, n, w*0.78, h*0.3, x+w/2, y+h/2, "800", "Arial"); } }); });
  atlas.anisotropy=4;
  const ST=[], stack=(x, z, w, d, h, k)=>{ const g=boxGeo(w, h, d), U=g.attributes.uv, du=ACW/AW, dv=ACH/AH, u0=(AP+(k%4)*ACW)/AW, v0=1-(APV+(((k/4)|0)+1)*ACH)/AH;
      for(let i=0;i<U.count;i++) U.setXY(i, u0+U.getX(i)*du, v0+U.getY(i)*dv*Math.min(1, h/1.8));
      ST.push({geo:g, matrix:new T.Matrix4().makeTranslation(x, FLS+0.13+h/2, z), color:new T.Color("#ffffff")});
      B(w+0.04, 0.12, d+0.04, x, FLS+0.065, z, "#a8845a"); addCol(x-w/2-0.02, x+w/2+0.02, z-d/2-0.02, z+d/2+0.02, FLS-0.5, FLS+0.13+h); };
  { let k=0; for(let x=BX0+1.4; x<BX1-1.2; x+=1.5){ k++;
      for(const zr of [AZ0-0.75, AZ0-2.05, AZ0-3.35]) if(zr-0.6>BZ0+WT) stack(x, zr, 1.2, 1.0, 1.2+((k*7+zr*3)&3)*0.22, (k+Math.round(-zr))%8);
      if(x<749.9 || (x>754.5 && x<758) || (x>768 && x<777)) for(const zr of [AZ1+0.75, AZ1+2.05]) stack(x, zr, 1.2, 1.0, 1.1+((k*5)&3)*0.25, (k*3+1)%8); } }
  // the counter by the way in, on the south side of the lane, the register on it; the coolers along the south wall
  { RB(2.8, 1.02, 0.7, 762.0, FLS+0.51, AZ1+0.55, "#5a3a22", 0, 0.02); B(2.9, 0.05, 0.8, 762.0, FLS+1.045, AZ1+0.55, "#2a2a2a");
    RB(0.4, 0.25, 0.35, 761.2, FLS+1.2, AZ1+0.6, "#2a2c2e", 0, 0.03); B(0.3, 0.2, 0.02, 761.2, FLS+1.45, AZ1+0.5, "#3af06a");
    addCol(760.6, 763.4, AZ1+0.2, AZ1+0.9, FLS-0.5, FLS+1.08);
    addUse(762.0, AZ1-0.6, FLS, "BUY A CASE", ()=>toast(["“THIRTY OF THE LAKESHORE? TWENTY NINETY-EIGHT, ON SALE.”","“I'LL PUT IT IN YOUR TRUNK FOR YOU.” YOU WALKED","“ID? ...YEAH, YOU'RE GOOD.”"][(Math.random()*3)|0], "#c8e8b0"), 1.2);
    for(let k=0;k<5;k++){ const x=764.8+k*1.05; B(1.0, 2.1, 0.75, x, FLS+1.05, BZ1-WT-0.4, "#d8d8d4");
      push("lk_tvon", planeGeo(0.82, 1.7, 0), x, FLS+1.15, BZ1-WT-0.778, Math.PI, "#ffffff"); }
    addCol(764.3, 770.0, BZ1-WT-0.8, BZ1-WT, FLS-0.5, FLS+2.1);
    stack(766.2, AZ1+2.0, 1.1, 0.9, 0.9, 6);
    // kegs, a row by the east door, and an ice chest
    for(let k=0;k<4;k++) C(0.2, 0.58, 779.6-k*0.5, FLS+0.29, AZ1+1.4, "#b8bcbe", 16);
    addCol(777.9, 779.9, AZ1+1.15, AZ1+1.65, FLS-0.5, FLS+0.6); }
  // overhead: tube lights over the lane, strings of pennants across, banners and flags, the cider section's sign
  for(let x=BX0+2; x<BX1-1; x+=3.2){ push("tube", boxGeo(1.2, 0.02, 0.3, 0), x, CEIL-0.012, (AZ0+AZ1)/2, 0, "#ffffff");
  }
  for(const x of [754, 765, 776]) LAMPS.push({x:x, y:CEIL-0.4, z:(AZ0+AZ1)/2, color:0xf2f6ff, intensity:0.6, dist:8, decay:1.5, indoor:true});
  { const cols=["#c8282a","#f2c230","#2a5aa8","#f4f2ec","#2e7a3a"];
    for(let x=BX0+1.2; x<BX1-0.8; x+=1.6){ let k=0;
      for(let z=BZ0+WT+0.1; z<BZ1-WT-0.1; z+=0.36, k++){ const sag=0.25*Math.sin(Math.PI*(z-BZ0)/(BZ1-BZ0)), y=CEIL-0.25-sag;
        const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute([0, 0, -0.15, 0, 0, 0.15, 0, -0.32, 0], 3)); g.computeVertexNormals();
        ent(g, x, y, z+0.15, cols[(k+((x|0)%5))%5], 0, 0, 0, PN); } }
    const banner=(w, h, x, z, y, ry, draw)=>{ const m=new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({map:signTex(Math.round(w*200), Math.round(h*200), draw), roughness:0.85, side:T.DoubleSide}));
      m.position.set(x, y, z); m.rotation.y=ry; scene.add(m); };
    banner(2.6, 0.9, 755.0, AZ0-0.4, CEIL-0.75, 0, (c, W, H)=>{ c.fillStyle="#1a1a1a"; c.fillRect(0, 0, W, H); c.fillStyle=GOLD; c.fillRect(0, H*0.8, W, H*0.2); say(c, "GO BLACK & GOLD", W/2, H*0.42, W*0.8, H*0.4, GOLD); });
    banner(2.4, 0.8, 772.0, AZ1+0.4, CEIL-0.7, 0, (c, W, H)=>{ c.fillStyle="#2e7a3a"; c.fillRect(0, 0, W, H); say(c, "FRENCH CREEK PALE", W/2, H*0.38, W*0.8, H*0.34, "#f4e8c8"); say(c, "BREWED UP THE CREEK", W/2, H*0.76, W*0.7, H*0.16, "#f4e8c8", "700", "Arial"); });
    banner(1.8, 0.4, 776.0, (AZ0+AZ1)/2, CEIL-0.55, Math.PI/2, (c, W, H)=>{ c.fillStyle="#d8ccb0"; c.fillRect(0, 0, W, H); c.strokeStyle="#5a3a22"; c.lineWidth=6; c.strokeRect(3, 3, W-6, H-6); say(c, "CIDER SECTION", W/2, H/2, W*0.8, H*0.6, "#5a3a22", "800", "Georgia, serif"); });
    // two flags on short poles, out from the south stock over the lane
    for(const x of [770.0, 774.0]){ C(0.012, 1.4, x, CEIL-0.9, AZ1+0.5, "#c8a050", 6, 0.6, 0, 0);
      banner(0.9, 0.5, x, AZ1+0.05, CEIL-1.25, Math.PI/2, (c, W, H)=>{ for(let k=0;k<13;k++){ c.fillStyle=k%2 ? "#f4f2ec" : "#b3191e"; c.fillRect(0, k*H/13, W, H/13+1); }
        c.fillStyle="#1f2a5a"; c.fillRect(0, 0, W*0.4, H*7/13); c.fillStyle="#f4f2ec"; for(let i=0;i<5;i++) for(let j=0;j<4;j++) c.fillRect(W*(0.03+i*0.075), H*(0.04+j*0.12), 2, 2); }); } }

  /* ---- out front: mulch and stone on pallets, the ice chest, the propane cage ---- */
  { const bag=(x, z, col, h)=>{ B(1.2, 0.12, 1.0, x, LY+0.06, z, "#a8845a");
      for(let r=0;r<h;r++) for(let k=0;k<3;k++) RB(1.15, 0.16, 0.32, x, LY+0.2+r*0.16, z-0.33+k*0.33, r%2 ? col : col, 0, 0.06);
      addCol(x-0.62, x+0.62, z-0.52, z+0.52, LY-0.5, LY+0.12+h*0.16); };
    let k=0; for(const z of [-1302.5, -1301.2, -1299.9]) for(const x of [738.0, 739.4, 740.8, 742.2, 743.6]){ bag(x, z, ["#7a3a1a","#2a2a2a","#a8282a","#c8a040","#3a5a2a"][k%5], 4+(k%3)); k++; }
    for(const x of [738.0, 739.4, 740.8]) bag(x, -1262.0, ["#c8a040","#7a3a1a","#e8e4d8"][k++%3], 5);
    B(1.6, 1.3, 0.8, 765.0, LY+0.65, BZ1+0.6, "#e8eef2"); addCol(764.2, 765.8, BZ1+0.2, BZ1+1.0, LY-0.5, LY+1.3);
    sign(1.2, 0.36, (c, W, H)=>{ c.fillStyle="#2a6ab8"; c.fillRect(0, 0, W, H); say(c, "ICE", W/2, H/2, W*0.8, H*0.6, "#f4f2ec"); }, 765.0, LY+1.0, BZ1+1.012, 0, false, 240);
    for(const s of [-1, 1]) B(0.04, 1.6, 0.9, 777.5+s*0.7, LY+0.8, BZ1+0.5, "#8a8e90"); B(1.44, 0.04, 0.9, 777.5, LY+1.6, BZ1+0.5, "#8a8e90");
    for(let k=0;k<6;k++) C(0.15, 0.48, 777.0+(k%3)*0.5, LY+0.24+((k/3)|0)*0.6, BZ1+0.5, "#e8e8e0", 12);
    addCol(776.75, 778.25, BZ1+0.05, BZ1+0.95, LY-0.5, LY+1.6); }
  // the place's own sign by the road, two-sided, at the lot's mouth
  { const x=737.6, z=-1255.4, gy=Terrain.groundAt(x, z); for(const dz of [-0.9, 0.9]) B(0.14, 4.2, 0.14, x, gy+2.1, z+dz, "#2a2a2a");
    B(0.3, 1.5, 2.6, x, gy+4.6, z, "#2a2a2a"); addCol(x-0.15, x+0.15, z-1.0, z+1.0, gy-0.5, gy+5.4);
    for(const s of [-1, 1]) sign(2.5, 1.42, (c, W, H)=>{ c.fillStyle=GREEN; c.fillRect(0, 0, W, H); c.strokeStyle=GOLD; c.lineWidth=8; c.strokeRect(6, 6, W-12, H-12);
        say(c, "EDINBORO BEER", W/2, H*0.36, W*0.8, H*0.3, GOLD); say(c, "DRIVE THRU · KEGS · ICE", W/2, H*0.72, W*0.76, H*0.16, "#f4f2ec", "700", "Arial"); },
      x+s*0.17, gy+4.6, z, s*Math.PI/2, true, 480); }

  // the kid in the green shirt, behind the counter
  if(typeof crowdGroup==="function"){ const G=crowdGroup("edinboro beer", 765, -1283, 90);
    crowdAdd(G, {look:{h:1.02, skin:SKINS[1], hair:HAIRS[2], shirt:"#2e8a3a", pants:"#3b4a66", shoes:"#2a2a2a", cap:"#2e8a3a"}, x:762.0, z:AZ1+1.25, y:FLS, yaw:0, mode:"stand"}); }

  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.05});
  detailMesh(ME, mat, "edinboro-beer", true);
  detailMesh(ST, new T.MeshStandardMaterial({vertexColors:true, map:atlas, roughness:0.8}), "edinboro-beer-stock", true);
  if(PN.length) detailMesh(PN, new T.MeshStandardMaterial({vertexColors:true, roughness:0.8, side:T.DoubleSide}), "edinboro-beer-pennants", false);
  BEER.routes={"hollow road: off US 6N to Edinboro Beer, through the drive-thru and round":[[731.0, -1199.5],[731.0, -1212],[735.5, -1283],[742.0, -1283.0],[746.5, -1283.0],
    [752.0, -1283.0],[765.0, -1283.0],[780.0, -1283.0],[786.0, -1283.0],[792.0, -1272.0],[770.0, -1268.0],[753.5, -1269.0],[752.1, -1274.0],[752.1, -1277.0],[754.0, -1279.0]],
    "hollow road: on north to the end":[[733.5, -1215],[733.5, -1270],[733.5, -1320],[733.5, -1335]]};
})();
/* the lamps out front come on after dark; drive through slowly and the kid puts a case in */
function updateBeer(dt, dark){
  for(const L of BEER.lamps||[]) L.intensity=1.0*smoothstep(0.3, 0.6, dark);
  const A=BEER.aisle; if(!A) return;
  if(driving){ const p=driving.g.position, inA=p.x>A.x0 && p.x<A.x1 && p.z>A.z0 && p.z<A.z1;
    if(inA && !BEER.served && driving.veh && Math.hypot(driving.veh.body.velocity.x, driving.veh.body.velocity.z)<3.0){ BEER.served=true;
      toast(["THE KID IN THE GREEN SHIRT PUTS A THIRTY IN YOUR BACK SEAT. “HAVE A GOOD ONE.”","“ANYTHING ELSE? ICE? WE GOT ICE.”","A CASE OF THE LAKESHORE, IN THE BACK. YOU PAY THROUGH THE WINDOW"][(Math.random()*3)|0], "#c8e8b0"); }
    if(!inA && (p.x<A.x0-12 || p.x>A.x1+12)) BEER.served=false; }
}
