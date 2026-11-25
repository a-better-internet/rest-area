/* REST AREA · 14mf-dive.js
   ----------------------------------------------------------------------
   The Lakeside Dive, past the office park on the shore (EAST.dive, 04):
   a one-room bar in stained board siding under a shingled gable, a deck
   off its lake side with chairs looking out over the water, picnic tables
   on the grass going down to the bank, and a food truck parked by the
   gravel lot, its awning up. The service drive (14md) comes along the
   north side of Midland Mutual into the gravel.

   Inside: the bar along the north wall (six stools, the taps, the back
   bar's bottles and its mirror, the till, the TV in the corner), the pool
   table under its green lamp, the jukebox on the station-0 country (20's
   nearRadio, DIVE.radios), a dartboard and its chalkboard, two tables,
   the restrooms' door, beer neon in the windows, paneling, a linoleum
   floor of worn squares.

   The truck is a step van: frame rails, six wheels (duals behind), the
   cab with its windshield, grille, lamps and mirrors, the box with its
   serving window cut in the curb side (the counter, the griddle, the
   fryer, the hood and the cook inside), the awning propped on struts,
   the menu board, the roof's vents and hood stack, propane on the front
   rack, a generator on the hitch, levelling jacks and chocks.

   All in world coordinates. Building x 914..925, z -1904..-1895; the deck
   x 925..931; the lot x 905..928, z -1893.5..-1874.5; the truck at
   (930.6, -1882.5), its length along z, its window facing east.
   ---------------------------------------------------------------------- */
const DIVE={routes:{}, lamps:[], radios:[], glow:null, fire:null};
const DOCKZ=[-1906.2, -1903.8];                                   // (the Dive's dock, out from the bank: its walk's sides, 14mf)
(function lakesideDive(){
  if(typeof EAST==="undefined" || !EAST.dive) return;
  const Y=EDIN.y, S0=EAST.dive.site, ME=[], CH=[], r=_trng(1986);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const RB=(w,h,d,x,y,z,c,ry,rad,list)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const S=(r0,x,y,z,c,list)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c,0,0,0,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gyAt=(x, z)=>Terrain.groundAt(x, z);

  const BX0=914, BX1=925, BZ0=-1904, BZ1=-1895, WT=0.2, GY=gyAt(919.5, -1899.5), FL=GY+0.25, EH=FL+3.0, ZM=(BZ0+BZ1)/2, RISE=1.6, RIDGE=EH+RISE;
  const SIDING="#6a4232", TRIM="#3a2a20", PANEL="#5a3a24", ROOF="#3a3634";
  DIVE.FL=FL;

  /* ---- the ground: the gravel lot and the truck's pad, one surface ---- */
  { const lot=SD_rect(905.5, 928, -1893.5, -1874.5), pad=SD_rect(926, 934.5, -1888.5, -1876.5);
    const LG=GY+0.012; push("gravelbed", sdPaveGeo(sdUnion([lot, pad], 1.5), 904, 936, -1895, -1873, 0.5, 2), 0, LG, 0, 0, "#8a8478");
    addFlat(905.5, 928, -1893.5, -1874.5, LG); addFlat(926, 934.5, -1888.5, -1876.5, LG); DIVE.LG=LG;
    if(typeof parked==="function"){ parked(2, "#5a3a2a", 908.6, -1887.5, 0, LG-PAVE_T); parked(0, "#2a3a5a", 912.2, -1886.8, 0.04, LG-PAVE_T); parked(1, "#4a4a44", 921.0, -1879.0, Math.PI-0.05, LG-PAVE_T); }
    for(const x of [906.6, 910.4, 914.2]){ B(1.8, 0.12, 0.14, x, LG+0.06, -1891.2, "#8a8680"); }     // (wheel stops: old railroad ties, by the look of them)
  }

  /* ---- the bar: a slab, walls of board siding round their openings, a liner of paneling inside, a gable of shingles ---- */
  wallBox("concrete", BX0-0.06, BX1+0.06, BZ0-0.06, BZ1+0.06, GY-0.4, FL, "#8a867e", 0.6, FL);
  // the openings, each wall's own: [from, to, sill, head, kind]
  const OP={s:[[916.6, 917.6, FL, FL+2.12, "door"],[919.4, 921.4, FL+1.0, FL+2.0, "win"],[922.6, 924.0, FL+1.0, FL+2.0, "win"]],
            e:[[-1900.4, -1899.4, FL, FL+2.12, "door"],[-1897.8, -1896.2, FL+1.0, FL+2.0, "win"],[-1903.2, -1901.8, FL+1.0, FL+2.0, "win"]],
            n:[[920.6, 921.4, FL+1.7, FL+2.2, "win"]], w:[]};
  // one wall run: pieces of `bk` round the openings along a (x or z), across c0..c1, y0..y1, colliders with them
  // (in a liner, in: which way the room is, +1 or -1 across c; the pieces over and under an opening stand a centimetre further in
  //  than the ones beside them, so where they meet no face of one lies in the other's, even after the bake grows them)
  const run=(bk, ax, c0, c1, a, b, y0, y1, ops, col, solid, inn)=>{ let u=a;
    const piece=(p, q, h0, h1, deep)=>{ if(q-p<0.005 || h1-h0<0.005) return; let d0=c0, d1=c1; if(deep && inn){ if(inn>0) d1+=0.01; else d0-=0.01; }
      if(ax==="x") wallBox(bk, p, q, d0, d1, h0, h1, col, 0.6, FL); else wallBox(bk, d0, d1, p, q, h0, h1, col, 0.6, FL);
      if(solid) (ax==="x" ? addCol(p, q, c0, c1, h0, h1) : addCol(c0, c1, p, q, h0, h1)); };
    for(const o of ops.slice().sort((m, n)=>m[0]-n[0])){ piece(u, o[0], y0, y1); piece(o[0], o[1], y0, o[2], true); piece(o[0], o[1], o[3], y1-0.002, true); u=o[1]; }
    piece(u, b, y0, y1); };
  run("siding", "x", BZ1-WT, BZ1, BX0, BX1, FL-0.15, EH, OP.s, SIDING, true);
  run("siding", "x", BZ0, BZ0+WT, BX0, BX1, FL-0.15, EH, OP.n, SIDING, true);
  run("siding", "z", BX1-WT, BX1, BZ0+WT, BZ1-WT, FL-0.15, EH+0.002, OP.e, SIDING, true);
  run("siding", "z", BX0, BX0+WT, BZ0+WT, BZ1-WT, FL-0.15, EH+0.002, OP.w, SIDING, true);
  // the paneling inside, 2 cm off the walls, its runs across z stopped 1 cm short of the runs across x
  const IN={x0:BX0+WT, x1:BX1-WT, z0:BZ0+WT, z1:BZ1-WT};
  run("wood", "x", IN.z1-0.02, IN.z1, IN.x0, IN.x1, FL, EH-0.06, OP.s, PANEL, false, -1);
  run("wood", "x", IN.z0, IN.z0+0.02, IN.x0, IN.x1, FL, EH-0.06, OP.n, PANEL, false, 1);
  run("wood", "z", IN.x1-0.02, IN.x1, IN.z0+0.03, IN.z1-0.03, FL, EH-0.072, OP.e, PANEL, false, -1);
  run("wood", "z", IN.x0, IN.x0+0.02, IN.z0+0.03, IN.z1-0.03, FL, EH-0.072, OP.w, PANEL, false, 1);
  // the gables, east and west: a triangle of siding over each end wall (a slab extruded out of the wall's line)
  for(const [x1, col] of [[BX0+WT, SIDING],[BX1, SIDING]]){ const sh=new T.Shape(); sh.moveTo(BZ0, EH+0.002); sh.lineTo(BZ1, EH+0.002); sh.lineTo(ZM, RIDGE-0.1); sh.lineTo(BZ0, EH+0.002);      // (on the end walls' tops, not overlapping them)
    const g=new T.ExtrudeGeometry(sh, {depth:WT, bevelEnabled:false}); g.applyMatrix4(new T.Matrix4().set(0,0,-1,x1, 0,1,0,0, 1,0,0,0, 0,0,0,1)); push("siding", g, 0, 0, 0, 0, col); }
  // the roof: two slopes of shingle meeting at the ridge, a cap along it, a fascia and a gutter on each eave
  { const th=Math.atan(RISE/((BZ1-BZ0)/2)), OV=0.45, run2=(BZ1-BZ0)/2+OV, L=run2/Math.cos(th);
    for(const s of [1, -1]){ const ez=ZM+s*run2, ey=RIDGE-run2*Math.tan(th), mz=(ZM+ez)/2, my=(RIDGE+ey)/2, nz=s*Math.sin(th), ny=Math.cos(th);
      push("shingle", boxGeo(BX1-BX0+0.9+(s<0 ? 0.014 : 0), 0.12, L), (BX0+BX1)/2, my-ny*0.06, mz-nz*0.06, 0, ROOF, s*th);      // (one a little longer: their ends meet at the ridge)
      B(BX1-BX0+0.94, 0.2, 0.04, (BX0+BX1)/2, ey-0.12, ez+s*0.03, TRIM);
      C(0.06, BX1-BX0+0.9, (BX0+BX1)/2, ey-0.2, ez+s*0.1, "#6a6a62", 10, 0, 0, Math.PI/2);
      C(0.04, ey-0.2-GY, BX1+0.4, (ey-0.2+GY)/2, ez+s*0.1, "#6a6a62", 8); }
    B(BX1-BX0+0.97, 0.1, 0.36, (BX0+BX1)/2, RIDGE+0.03, ZM, "#2a2826");          // (past the shingles' ends, which grow at bake)
    // the rakes: a board up each gable's edge, standing proud of the siding
    for(const x0 of [BX0-0.03, BX1+0.03]) for(const s of [1, -1]){ const x=x0+(s<0 ? Math.sign(x0-919.5)*0.012 : 0), a=V3(x, EH-OV*Math.tan(th)-0.02, ZM+s*run2), b=V3(x, RIDGE+0.02, ZM), d=b.clone().sub(a), Lr=d.length();
      ME.push({geo:boxGeo(0.04, Lr, 0.2), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(TRIM)}); }
    addZone(BX0, BX1, BZ0, BZ1, FL-0.5, EH, "LAKESIDE DIVE · THE BAR", true); }
  // corner boards and the trim round every opening, proud of the siding
  for(const [x, z] of [[BX0, BZ0],[BX1, BZ0],[BX0, BZ1],[BX1, BZ1]]) B(0.16, EH-FL+0.15-0.014, 0.16, x, (FL-0.15+EH-0.014)/2, z, TRIM);      // (their tops short of the walls')
  for(const o of OP.s) for(const [p, q] of [[o[0]-0.06, o[0]],[o[1], o[1]+0.06]]) B(q-p, o[3]-o[2]+0.06, 0.03, (p+q)/2, (o[2]+o[3]+0.06)/2, BZ1+0.015, TRIM);
  for(const o of OP.s) B(o[1]-o[0]+0.16, 0.08, 0.04, (o[0]+o[1])/2, o[3]+0.04, BZ1+0.02, TRIM);
  for(const o of OP.e) for(const [p, q] of [[o[0]-0.06, o[0]],[o[1], o[1]+0.06]]) B(0.03, o[3]-o[2]+0.06, q-p, BX1+0.015, (o[2]+o[3]+0.06)/2, (p+q)/2, TRIM);
  for(const o of OP.e) B(0.04, 0.08, o[1]-o[0]+0.16, BX1+0.02, o[3]+0.04, (o[0]+o[1])/2, TRIM);
  // the glass, set back in the walls, a sill under each window
  for(const o of OP.s) if(o[4]==="win"){ push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), (o[0]+o[1])/2, (o[2]+o[3])/2, BZ1-0.08, 0, "#ffffff"); B(o[1]-o[0]+0.12, 0.05, 0.12, (o[0]+o[1])/2, o[2]-0.03, BZ1+0.04, TRIM); }
  for(const o of OP.e) if(o[4]==="win"){ push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), BX1-0.08, (o[2]+o[3])/2, (o[0]+o[1])/2, Math.PI/2, "#ffffff"); B(0.12, 0.05, o[1]-o[0]+0.12, BX1+0.04, o[2]-0.03, (o[0]+o[1])/2, TRIM); }
  for(const o of OP.n) push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), (o[0]+o[1])/2, (o[2]+o[3])/2, BZ0+0.08, Math.PI, "#ffffff");
  // the doors: the front one steel with a little window, the deck's a wood one; each a walkable sill across the wall
  makeDoor(XF(916.62, BZ1-WT/2, 0), 0, FL+0.01, 0, "LAKESIDE DIVE", true, 0, "steel", 0x5a3a2a); addFlat(916.6, 917.6, BZ1-WT-0.02, BZ1+0.02, FL);
  makeDoor(XF(BX1-WT/2, -1899.42, Math.PI/2), 0, FL+0.01, 0, "LAKESIDE DIVE", false, 0, "vision", 0x6a4a2a); addFlat(BX1-WT-0.02, BX1+0.02, -1900.4, -1899.4, FL);
  // the stoop at the front: a slab of concrete, flush with the floor, a step down to the gravel
  push("concrete", boxGeo(2.0, FL-GY+0.3-0.012, 1.13), 917.1, (FL-0.012+GY-0.3)/2, BZ1+0.635, 0, "#8a867e"); addFlat(916.1, 918.1, BZ1, BZ1+1.2, FL);      // (a hair under the slab's top, and off its edge; a step, not a wall: no collider)
  { const L={x:917.1, y:FL+2.45, z:BZ1+0.5, color:0xffd8a0, intensity:0, dist:9, decay:1.6, mothy:true}; LAMPS.push(L); DIVE.lamps.push(L);
    B(0.18, 0.12, 0.2, 917.1, FL+2.5, BZ1+0.1, "#2a2a2a"); C(0.07, 0.1, 917.1, FL+2.39, BZ1+0.16, "#e8d8a0", 10); }
  // the name over the door: a painted board, a little weathered, its lamp's gooseneck
  { B(5.2, 1.0, 0.06, 919.6, EH-0.62, BZ1+0.04, "#2a3a3a");
    sign(5.0, 0.86, (c, W, H)=>{ c.fillStyle="#2a3a3a"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(255,255,255,0.05)"; for(let i=0;i<40;i++) c.fillRect((i*97)%W, (i*53)%H, 30, 2);
        say(c, "LAKESIDE DIVE", W/2, H*0.42, W*0.82, H*0.48, "#e8c87a", "800", "'Cooper Black', Georgia, serif"); say(c, "COLD BEER  ·  POOL  ·  FOOD TRUCK", W/2, H*0.8, W*0.7, H*0.16, "#c8d8c8", "700", "Arial"); },
      919.6, EH-0.62, BZ1+0.082, 0, false, 1000); }
  // the neon in the windows, facing out (and its glow on the sill inside)
  sign(1.4, 0.6, (c, W, H)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0, 0, W, H); c.shadowColor="#ff3a3a"; c.shadowBlur=18; say(c, "COLD BEER", W/2, H*0.42, W*0.8, H*0.5, "#ff6a5a", "800", "'Brush Script MT', cursive"); c.shadowColor="#3ac8ff"; say(c, "ON TAP", W/2, H*0.8, W*0.5, H*0.2, "#8ae0ff", "700", "Arial"); c.shadowBlur=0; },
    920.4, FL+1.5, BZ1-WT-0.06, 0, true, 420);
  sign(1.0, 0.45, (c, W, H)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0, 0, W, H); c.shadowColor="#ff3a3a"; c.shadowBlur=16; say(c, "OPEN", W/2, H/2, W*0.7, H*0.6, "#ff5a4a", "800", "Arial"); c.shadowBlur=0; },
    923.3, FL+1.5, BZ1-WT-0.06, 0, true, 300);
  sign(1.2, 0.5, (c, W, H)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0, 0, W, H); c.shadowColor="#ffd83a"; c.shadowBlur=16; say(c, "ERIE LAGER", W/2, H/2, W*0.8, H*0.5, "#ffe08a", "800", "Georgia, serif"); c.shadowBlur=0; },
    BX1-WT-0.06, FL+1.5, -1897.0, Math.PI/2, true, 360);

  /* ---- inside ---- */
  addFlat(IN.x0, IN.x1, IN.z0, IN.z1, FL);
  { // the floor: worn linoleum squares, oxblood and cream gone grey, on the slab
    const t=signTex(256, 256, (c, W, H)=>{ for(let i=0;i<8;i++) for(let j=0;j<8;j++){ c.fillStyle=(i+j)%2 ? "#5a2a24" : "#a49884"; c.fillRect(i*32, j*32, 32, 32); }
      for(let k=0;k<900;k++){ c.fillStyle="rgba(0,0,0,"+(0.03+((k*37)%10)/200)+")"; c.fillRect((k*71)%W, (k*113)%H, 3+(k%5), 2+(k%3)); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set((IN.x1-IN.x0)/0.6, (IN.z1-IN.z0)/0.6);
    const m=new T.Mesh(new T.PlaneGeometry(IN.x1-IN.x0, IN.z1-IN.z0), new T.MeshStandardMaterial({map:t, roughness:0.55, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
    m.rotation.x=-Math.PI/2; m.position.set((IN.x0+IN.x1)/2, FL+0.006, (IN.z0+IN.z1)/2); m.receiveShadow=true; m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m);
    // the ceiling: stained tiles, low
    const ct=signTex(512, 512, (c, W, H)=>{ c.fillStyle="#a49a86"; c.fillRect(0, 0, W, H); for(let i=0;i<300;i++){ c.fillStyle="rgba(0,0,0,0.05)"; c.fillRect((i*97)%W, (i*61)%H, 2, 2); }
      for(const [x, y, rr] of [[150, 300, 34],[390, 120, 22]]){ const g=c.createRadialGradient(x, y, 2, x, y, rr); g.addColorStop(0, "rgba(110,80,40,0.22)"); g.addColorStop(1, "rgba(110,80,40,0)"); c.fillStyle=g; c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); }
      c.fillStyle="#7a7262"; for(let k=0;k<4;k++){ c.fillRect(0, k*128, W, 3); c.fillRect(k*128, 0, 3, H); } });
    ct.wrapS=ct.wrapT=T.RepeatWrapping; ct.repeat.set((IN.x1-IN.x0)/4.8, (IN.z1-IN.z0)/4.8);      // (four tiles to the picture; a water stain or two among them, soft-edged)
    const cm=new T.Mesh(new T.PlaneGeometry(IN.x1-IN.x0, IN.z1-IN.z0), new T.MeshStandardMaterial({map:ct, roughness:0.95}));
    cm.rotation.x=Math.PI/2; cm.position.set((IN.x0+IN.x1)/2, EH-0.08, (IN.z0+IN.z1)/2); cm.updateMatrix(); cm.matrixAutoUpdate=false; scene.add(cm); }
  // the bar along the north wall: the front of it padded, a rail at the foot, the top in dark wood, the gap at the east end
  const BZF=-1901.75, BAR0=915.0, BAR1=921.6;
  { RB(BAR1-BAR0, 1.02, 0.6, (BAR0+BAR1)/2, FL+0.51, BZF-0.3, "#4a2a1a", 0, 0.03); RB(BAR1-BAR0+0.06, 0.06, 0.76, (BAR0+BAR1)/2, FL+1.05, BZF-0.34, "#2a1a10", 0, 0.015);
    B(BAR1-BAR0-0.1, 0.16, 0.04, (BAR0+BAR1)/2, FL+0.85, BZF+0.02, "#3a2014");                                   // (the padded arm rest)
    C(0.025, BAR1-BAR0-0.2, (BAR0+BAR1)/2, FL+0.22, BZF+0.22, "#b0904c", 10, 0, 0, Math.PI/2, CH);             // (the foot rail)
    for(let x=BAR0+0.4; x<BAR1-0.2; x+=1.2) B(0.04, 0.2, 0.2, x, FL+0.15, BZF+0.11, "#8a7a4a", 0, CH);
    addCol(BAR0, BAR1, BZF-0.64, BZF+0.02, FL-0.05, FL+1.1);
    // the taps: a tower of five handles, each its own colour; the drip tray
    B(0.7, 0.3, 0.12, 918.4, FL+1.23, BZF-0.4, "#c8ccd0", 0, CH); for(let k=0;k<5;k++){ C(0.018, 0.2, 918.15+k*0.12, FL+1.48, BZF-0.34, ["#c8282a","#2a6a2a","#d8a82a","#2a2a2a","#3a5aa8"][k], 8); }
    B(0.66, 0.025, 0.16, 918.4, FL+1.095, BZF-0.22, "#3a3a3e", 0, CH);
    // on the bar: a till, a jar of tips, coasters, two glasses left, a bowl of pretzels, the lottery tickets' box
    RB(0.38, 0.22, 0.34, 920.9, FL+1.19, BZF-0.4, "#2a2a2e", 0, 0.02); B(0.2, 0.1, 0.03, 920.9, FL+1.34, BZF-0.24, "#6af06a");
    C(0.06, 0.14, 916.0, FL+1.15, BZF-0.25, "#c8d8e0", 12); for(const [x, h] of [[915.6, 0.14],[917.1, 0.16]]){ C(0.04, h, x, FL+1.08+h/2+0.005, BZF-0.22, "#d8a83a", 10); }
    C(0.1, 0.06, 919.6, FL+1.115, BZF-0.25, "#7a5a3a", 14);
    for(let k=0;k<6;k++) C(0.05, 0.004, 915.6+k*1.0, FL+1.083, BZF-0.12, "#d4ccb8", 12); }
  // the stools, six, swivelling on chrome, their seats in red vinyl, facing the bar
  for(let k=0;k<6;k++){ const x=915.55+k*1.0, z=BZF+0.62; C(0.22, 0.03, x, FL+0.015, z, "#3a3a3e", 14, 0, 0, 0, CH); C(0.03, 0.7, x, FL+0.38, z, "#b8bcc0", 8, 0, 0, 0, CH);
    C(0.2, 0.012, x, FL+0.32, z, "#b8bcc0", 14, 0, 0, 0, CH); C(0.2, 0.08, x, FL+0.76, z, "#8a1a1a", 16); addSeat(x, z, FL, 0, "A STOOL AT THE BAR", false, 0.34); }
  // the back bar: shelves of bottles stepped up the wall, a mirror behind them, the cooler doors under; the TV up in the corner
  { const z=IN.z0+0.02; B(BAR1-BAR0, 0.95, 0.5, (BAR0+BAR1)/2, FL+0.475, z+0.26, "#3a2014"); addCol(BAR0, BAR1, IN.z0, z+0.52, FL-0.05, FL+0.95);
    for(let k=0;k<4;k++) B(1.1, 0.7, 0.02, 915.7+k*1.55, FL+0.42, z+0.52, "#4a4a4e");                          // (the coolers' doors)
    for(let k=0;k<4;k++) B(0.9, 0.5, 0.008, 915.7+k*1.55, FL+0.47, z+0.534, "#6a8a9a");                         // (and their glass)
    B(BAR1-BAR0-0.6, 0.9, 0.012, (BAR0+BAR1)/2, FL+1.75, z+0.016, "#8a9298", 0, CH);                            // (the mirror)
    for(let s=0;s<2;s++){ B(BAR1-BAR0-0.4, 0.03, 0.22, (BAR0+BAR1)/2, FL+1.36+s*0.42, z+0.13, "#3a2014");
      for(let x=BAR0+0.35; x<BAR1-0.3; x+=0.13){ if(r()<0.12) continue; const h=0.22+r()*0.12, col=["#3a5a2a","#6a3a1a","#d8c89a","#2a2a2a","#8a2a1a","#c8a85a","#5a7a8a"][(r()*7)|0];
        C(0.035, h, x, FL+1.375+s*0.42+h/2+0.003, z+0.12, col, 8); C(0.012, 0.07, x, FL+1.375+s*0.42+h+0.035, z+0.12, col, 6); } }
    // the TV on its bracket, up in the corner, the game on
    B(0.1, 0.4, 0.3, BAR1+0.4, EH-0.5, IN.z0+0.22, "#2a2a2a"); RB(0.86, 0.52, 0.1, BAR1+0.4, EH-0.62, IN.z0+0.45, "#1a1a1a", 0, 0.02);
    sign(0.78, 0.44, (c, W, H)=>{ c.fillStyle="#2a6a2a"; c.fillRect(0, 0, W, H); c.strokeStyle="#d8e8d8"; c.lineWidth=2; for(let i=1;i<6;i++){ c.beginPath(); c.moveTo(W*i/6, 0); c.lineTo(W*i/6, H); c.stroke(); }
        c.fillStyle="#1a1a2a"; c.fillRect(0, 0, W, H*0.16); c.fillStyle="#e8e8e8"; c.font="bold 10px Arial"; c.fillText("ERIE 14 · PITT 10  3RD 6:12", 6, 11); }, BAR1+0.4, EH-0.62, IN.z0+0.506, 0, true, 180); }
  // the pool table under its lamp: the slate's felt, the rails, the pockets, the legs; two cues and a rack on the wall
  { const px=919.6, pz=-1898.3, PW=2.5, PD=1.4; RB(PW+0.2, 0.18, PD+0.2, px, FL+0.71, pz, "#4a2a18", 0, 0.03); B(PW, 0.02, PD, px, FL+0.81, pz, "#1e5a32");
    for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]]) C(0.055, 0.03, px+a*PW/2, FL+0.81, pz+b*PD/2, "#141414", 10);
    for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.14, 0.62, 0.14, px+a*(PW/2-0.1), FL+0.31, pz+b*(PD/2-0.1), "#3a2014");
    for(let k=0;k<8;k++) S(0.028, px-0.6+(k%4)*0.08+((k/4)|0)*0.04, FL+0.848, pz+((k/4)|0)*0.07-0.03, ["#e8d8a0","#d8b82a","#2a4aa8","#c82a2a","#5a2a8a","#d8762a","#2a7a3a","#141414"][k]);
    S(0.028, px+0.7, FL+0.848, pz+0.1, "#e8e0c8");
    C(0.005, 1.35, px+0.2, FL+0.85, pz+0.4, "#c8a868", 6, 0, 0.3, Math.PI/2);
    addCol(px-PW/2-0.1, px+PW/2+0.1, pz-PD/2-0.1, pz+PD/2+0.1, FL-0.05, FL+0.84);
    // the lamp: a long green shade on two chains
    B(1.4, 0.14, 0.34, px, EH-1.15, pz, "#1e4a2a"); B(1.36, 0.02, 0.3, px, EH-1.225, pz, "#e8d8a0");
    for(const s of [-1, 1]) C(0.006, 0.96, px+s*0.5, EH-0.6, pz, "#3a3a3a", 4);
    const L={x:px, y:EH-1.3, z:pz, color:0xffe2b0, intensity:0.9, dist:7, decay:1.6, indoor:true}; LAMPS.push(L);
    // the cue rack on the west wall
    B(0.04, 1.1, 0.5, IN.x0+0.04, FL+1.2, -1898.3, "#3a2014"); for(let k=0;k<4;k++) C(0.012, 1.45, IN.x0+0.08, FL+0.85, -1898.5+k*0.13, "#c8a868", 6, 0.05, 0, 0); }
  // the jukebox against the west wall: wood and chrome, its arch lit, playing the country station
  { const x=IN.x0+0.42, z=-1896.4; RB(0.7, 1.2, 0.65, x, FL+0.6, z, "#5a2a1a", Math.PI/2, 0.06); B(0.04, 0.5, 0.56, x+0.34, FL+1.0, z, "#2a2a2e");
    ent(new T.CylinderGeometry(0.3, 0.3, 0.62, 18, 1, false, 0, Math.PI), x, FL+1.2, z, "#c8a868", 0, 0, Math.PI/2);
    sign(0.5, 0.3, (c, W, H)=>{ const g=c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#ff4a8a"); g.addColorStop(0.5, "#ffd84a"); g.addColorStop(1, "#4ac8ff"); c.fillStyle=g; c.fillRect(0, 0, W, H);
        c.fillStyle="#1a1a1a"; for(let i=0;i<5;i++) c.fillRect(8+i*W/5, H*0.25, W/5-14, H*0.5); }, x+0.37, FL+1.0, z, Math.PI/2, true, 150);
    addCol(x-0.33, x+0.36, z-0.36, z+0.36, FL-0.05, FL+1.4); DIVE.radios.push({x:x+0.3, y:FL+1.0, z:z, station:0, house:"LAKESIDE DIVE", zone:"LAKESIDE DIVE · THE BAR", vol:0.7, reach:16}); }
  // the dartboard and its chalkboard on the west wall, by the restrooms' door
  { const z=-1900.6; C(0.24, 0.04, IN.x0+0.05, FL+1.73, z, "#1a1a1a", 24, 0, 0, Math.PI/2);
    sign(0.4, 0.4, (c, W, H)=>{ const cx=W/2, cy=H/2; for(let i=0;i<20;i++){ c.fillStyle=i%2 ? "#1a1a1a" : "#d8c890"; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, W*0.46, i*Math.PI/10, (i+1)*Math.PI/10); c.fill(); }
      c.strokeStyle="#2a8a3a"; c.lineWidth=5; c.beginPath(); c.arc(cx, cy, W*0.44, 0, 7); c.stroke(); c.strokeStyle="#a82a2a"; c.beginPath(); c.arc(cx, cy, W*0.28, 0, 7); c.stroke(); c.fillStyle="#a82a2a"; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill(); },
      IN.x0+0.075, FL+1.73, z, Math.PI/2, false, 120);
    B(0.02, 0.6, 0.5, IN.x0+0.03, FL+1.6, z+0.9, "#1a1a1a"); sign(0.44, 0.54, (c, W, H)=>{ c.fillStyle="#222a24"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(230,230,220,0.8)"; c.font="13px 'Comic Sans MS', cursive";
      c.fillText("DUKE  301", 10, 30); c.fillText("SHEILA 87", 10, 56); c.fillText("WED: DARTS", 10, 90); c.fillText("7 PM", 10, 110); }, IN.x0+0.045, FL+1.6, z+0.9, Math.PI/2, false, 120); }
  // the restrooms' door in the north-west corner, a sign on it
  { const x=IN.x0+0.75, z=IN.z0+0.04; B(0.96, 2.06, 0.05, x, FL+1.03, z, "#4a3020"); B(0.08, 0.08, 0.06, x+0.36, FL+1.0, z+0.03, "#b0904c");
    sign(0.5, 0.16, (c, W, H)=>{ c.fillStyle="#d8d0c0"; c.fillRect(0, 0, W, H); say(c, "RESTROOMS", W/2, H/2, W*0.8, H*0.6, "#2a2a2a", "700", "Arial"); }, x, FL+1.6, z+0.032, 0, false, 120); }
  // two tables with chairs by the front windows, a high table by the deck door
  const chair=(x, z, yaw)=>{ const fx=-Math.sin(yaw), fz=-Math.cos(yaw);
    B(0.42, 0.05, 0.42, x, FL+0.46, z, "#3a2014", yaw); for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const lx=a*0.18, lz=b*0.18; B(0.03, 0.45, 0.03, x+lx*Math.cos(yaw)+lz*Math.sin(yaw), FL+0.225, z-lx*Math.sin(yaw)+lz*Math.cos(yaw), "#2a1a10", yaw); }
    B(0.42, 0.42, 0.04, x-fx*0.2, FL+0.72, z-fz*0.2, "#3a2014", yaw); addSeat(x, z, FL, yaw, "A CHAIR AT THE TABLE"); };
  for(const tx of [920.4, 923.3]){ const tz=-1896.5; C(0.38, 0.04, tx, FL+0.74, tz, "#3a2014", 18); C(0.04, 0.72, tx, FL+0.36, tz, "#2a2a2a", 8); C(0.24, 0.03, tx, FL+0.015, tz, "#2a2a2a", 12);
    addCol(tx-0.38, tx+0.38, tz-0.38, tz+0.38, FL-0.05, FL+0.76); chair(tx-0.72, tz, -Math.PI/2); chair(tx+0.72, tz, Math.PI/2); chair(tx, tz-0.72, Math.PI); }      // (each facing the table)
  { const tx=923.6, tz=-1902.6; C(0.32, 0.04, tx, FL+1.05, tz, "#3a2014", 16); C(0.04, 1.03, tx, FL+0.52, tz, "#2a2a2a", 8); C(0.22, 0.03, tx, FL+0.015, tz, "#2a2a2a", 12);
    addCol(tx-0.32, tx+0.32, tz-0.32, tz+0.32, FL-0.05, FL+1.07);
    for(const [dx, dz, yaw] of [[-0.62, 0, -Math.PI/2],[0, 0.62, 0]]){ const x=tx+dx, z=tz+dz; C(0.17, 0.05, x, FL+0.76, z, "#8a1a1a", 14); C(0.025, 0.74, x, FL+0.38, z, "#b8bcc0", 8, 0, 0, 0, CH); C(0.18, 0.012, x, FL+0.3, z, "#b8bcc0", 12, 0, 0, 0, CH);
      addSeat(x, z, FL, yaw, "A STOOL AT THE HIGH TABLE", false, 0.34); } }
  // the paneling's own: a framed photo of the lake frozen, a pennant, a muskie mounted over the door to the deck
  { sign(0.7, 0.5, (c, W, H)=>{ c.fillStyle="#a8b8c8"; c.fillRect(0, 0, W, H); c.fillStyle="#e0e4e8"; c.fillRect(0, H*0.55, W, H*0.45); c.fillStyle="#3a4a3a"; c.fillRect(0, H*0.42, W, H*0.14); c.fillStyle="#2a2a2a"; for(let i=0;i<5;i++) c.fillRect(W*(0.2+i*0.13), H*0.62, 4, 8); }, 922.6, FL+1.85, IN.z1-0.058, Math.PI, false, 160);
    B(0.78, 0.58, 0.02, 922.6, FL+1.85, IN.z1-0.042, "#2a1a10");          // (clear of the paneling, which the bake thickens)
    { const x=IN.x1-0.08, z=-1899.9; RB(0.06, 0.2, 0.9, x, FL+2.5, z, "#4a5a3a", 0, 0.08); B(0.04, 0.3, 0.4, x+0.02, FL+2.5, z, "#3a2014"); } }
  // the lights: tubes in a fixture over the bar, a lamp over each table
  { for(let x=915.6; x<921.5; x+=2.0) B(1.2, 0.08, 0.3, x, EH-0.12, BZF-0.6, "#d8ccb0");
    LAMPS.push({x:918.3, y:EH-0.4, z:BZF-0.6, color:0xffe8c8, intensity:0.75, dist:8, decay:1.6, indoor:true});
    for(const tx of [920.4, 923.3]){ C(0.2, 0.16, tx, EH-0.75, -1896.5, "#7a2a1a", 14); C(0.006, 0.6, tx, EH-0.38, -1896.5, "#3a3a3a", 4); }
    LAMPS.push({x:921.9, y:EH-0.9, z:-1896.5, color:0xffd8a0, intensity:0.6, dist:6, decay:1.6, indoor:true}); }

  /* ---- the deck off the lake side: boards on posts, a rail round it, steps down to the grass; chairs looking out ---- */
  const DX0=BX1, DX1=BX1+6.0, DZ0=-1903.4, DZ1=-1896.0, DY=FL-0.01;
  { const nb=Math.round((DZ1-DZ0)/0.15); for(let k=0;k<nb;k++){ const z=DZ0+(k+0.5)*(DZ1-DZ0)/nb; B(DX1-DX0-0.04, 0.04, (DZ1-DZ0)/nb-0.012, (DX0+DX1)/2+0.02, DY-0.02, z, k%3 ? "#7a6448" : "#6e5a40"); }
    addFlat(DX0, DX1, DZ0, DZ1, DY);
    for(const x of [DX0+0.6, (DX0+DX1)/2, DX1-0.1]) for(const z of [DZ0+0.1, (DZ0+DZ1)/2, DZ1-0.1]){ const g=gyAt(x, z); B(0.14, DY-0.04-g+0.3, 0.14, x, (DY-0.04+g-0.3)/2, z, "#5a4a36"); }
    for(const z of [DZ0+0.4, (DZ0+DZ1)/2, DZ1-0.4]) B(DX1-DX0-0.6, 0.16, 0.06, (DX0+DX1)/2+0.2, DY-0.13, z, "#5a4a36");
    // the rail: east and north whole, the south open for the steps
    const rail=(x0, z0, x1, z1)=>{ const along=Math.abs(x1-x0)>Math.abs(z1-z0), L=along ? Math.abs(x1-x0) : Math.abs(z1-z0), mx=(x0+x1)/2, mz=(z0+z1)/2;
      B(along ? L : 0.07, 0.05, along ? 0.07 : L, mx, DY+1.0, mz, "#6a5640"); B(along ? L : 0.05, 0.05, along ? 0.05 : L, mx, DY+0.12, mz, "#6a5640");
      const n=Math.round(L/0.12); for(let k=0;k<=n;k++){ const t=k/n; B(0.04, 0.86, 0.04, x0+(x1-x0)*t, DY+0.56, z0+(z1-z0)*t, "#6e5a42"); }
      along ? addCol(Math.min(x0, x1), Math.max(x0, x1), mz-0.06, mz+0.06, DY-0.05, DY+1.05) : addCol(mx-0.06, mx+0.06, Math.min(z0, z1), Math.max(z0, z1), DY-0.05, DY+1.05); };
    rail(DX1-0.05, DZ0+0.05, DX1-0.05, DZ1-0.05); rail(DX0+0.1, DZ0+0.05, DX1-0.1, DZ0+0.05); rail(DX0+0.1, DZ1-0.05, DX0+2.4, DZ1-0.05); rail(DX0+4.0, DZ1-0.05, DX1-0.1, DZ1-0.05);
    // the steps down to the grass, between the rails on the south
    const g=gyAt(DX0+3.2, DZ1+1.0), n=Math.max(1, Math.ceil((DY-g)/0.19));
    for(let k=0;k<n;k++){ const top=DY-(k+1)*(DY-g)/(n+0.001), z=DZ1+0.15+k*0.28; B(1.5, 0.05, 0.3, DX0+3.2, top-0.025, z, "#7a6448"); addFlat(DX0+2.45, DX0+3.95, z-0.15, z+0.15, top); B(1.46, Math.max(0.05, top-g), 0.04, DX0+3.2, (top+g)/2-0.03, z+0.115, "#5a4a36"); }
    // two chairs and a table between them, looking east at the lake; a string of lights from the eave out to a post
    const adk=(x, z, yaw)=>{ const fx=-Math.sin(yaw), fz=-Math.cos(yaw), q=(lx, lz)=>[x+lx*Math.cos(yaw)+lz*Math.sin(yaw), z-lx*Math.sin(yaw)+lz*Math.cos(yaw)];
      for(let k=0;k<5;k++){ const [sx, sz]=q(-0.25+k*0.125, -0.05); ent(boxGeo(0.1, 0.03, 0.62), sx, DY+0.36, sz, "#2a6a6a", 0.18, yaw, 0); }
      for(let k=0;k<6;k++){ const [sx, sz]=q(-0.3+k*0.12, 0.34); ent(boxGeo(0.1, 0.9, 0.025), sx, DY+0.72, sz, "#2a6a6a", -0.35, yaw, 0); }
      for(const s of [-1, 1]){ const [ax, az]=q(s*0.36, 0.0); B(0.12, 0.025, 0.78, ax, DY+0.6, az, "#2a6a6a", yaw); for(const lz of [-0.32, 0.25]){ const [lx2, lz2]=q(s*0.36, lz); B(0.05, 0.6, 0.05, lx2, DY+0.3, lz2, "#2a5a5a", yaw); } }
      addSeat(x, z, DY, yaw, "A CHAIR ON THE DECK LOOKING OUT OVER THE LAKE", false, 0.76); addCol(x-0.4, x+0.4, z-0.4, z+0.4, DY-0.05, DY+0.5); };
    adk(DX1-1.0, -1901.2, -Math.PI/2); adk(DX1-1.0, -1898.6, -Math.PI/2);
    { const x=DX1-1.0, z=-1899.9; C(0.25, 0.03, x, DY+0.5, z, "#2a6a6a", 14); C(0.03, 0.48, x, DY+0.25, z, "#2a5a5a", 6); C(0.04, 0.12, x+0.05, DY+0.575, z, "#d8a83a", 8); addCol(x-0.26, x+0.26, z-0.26, z+0.26, DY-0.05, DY+0.52); }
    addRoof(DX0, DX0+0.45, DZ0, DZ1, EH); }

  /* ---- picnic tables on the grass going down to the bank, the string of lights over them ---- */
  const picnic=(x, z, yaw, lbl)=>{ const g=gyAt(x, z), q=(lx, lz)=>[x+lx*Math.cos(yaw)+lz*Math.sin(yaw), z-lx*Math.sin(yaw)+lz*Math.cos(yaw)];
    for(let k=0;k<5;k++){ const [sx, sz]=q(0, -0.36+k*0.18); B(1.8, 0.04, 0.16, sx, g+0.76, sz, "#7a6448", yaw); }
    for(const s of [-1, 1]){ for(let k=0;k<2;k++){ const [bx, bz]=q(0, s*(0.62+k*0.13)); B(1.8, 0.04, 0.12, bx, g+0.45, bz, "#7a6448", yaw); }
      for(const lx of [-0.65, 0.65]){ const [ax, az]=q(lx, s*0.35); const a=V3(ax, g+0.74, az), [bx, bz]=q(lx, s*0.8), b=V3(bx, g, bz), d=b.clone().sub(a), L=d.length();
        ME.push({geo:boxGeo(0.08, L, 0.12), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#5e4c36")}); } }
    for(const lx of [-0.65, 0.65]){ const [cx, cz]=q(lx, 0); B(0.06, 0.08, 1.7, cx, g+0.42, cz, "#5e4c36", yaw); }
    const [c0x, c0z]=q(-0.95, -0.95), [c1x, c1z]=q(0.95, 0.95); addCol(Math.min(c0x, c1x), Math.max(c0x, c1x), Math.min(c0z, c1z), Math.max(c0z, c1z), g-0.05, g+0.47);
    for(const s of [-1, 1]) for(const lx of [-0.45, 0.45]){ const [sx, sz]=q(lx, s*0.68); addSeat(sx, sz, g, yaw+(s>0 ? 0 : Math.PI), lbl); }
    return g; };
  const PICNIC=[[940.5, -1892.0],[946.5, -1888.5],[942.0, -1883.0],[948.5, -1896.0]];
  for(const [x, z] of PICNIC) picnic(x, z, 0, "A PICNIC TABLE BY THE FOOD TRUCK");
  // the lights: poles at the corners of the tables, a string between them and back to the deck's corner, bulbs that glow after dark
  { const POLES=[[937.0, -1898.5],[952.0, -1898.5],[952.0, -1880.0],[937.0, -1880.0]], H=3.2, bulbs=[];
    for(const [x, z] of POLES){ const g=gyAt(x, z); C(0.06, H+0.3, x, g+(H+0.3)/2-0.3, z, "#4a3a2a", 8); addCol(x-0.07, x+0.07, z-0.07, z+0.07, g-0.5, g+H); }
    const lines=POLES.map((p, i)=>[p, POLES[(i+1)%POLES.length]]).concat([[[DX1-0.05, DZ0+0.05], POLES[0]]]);
    for(const [a, b] of lines){ const ga=gyAt(a[0], a[1])+H-0.05, gb=(b===POLES[0] && a[0]===DX1-0.05) ? 0 : 0, yA=a[0]===DX1-0.05 ? DY+1.0+1.2 : ga, yB=gyAt(b[0], b[1])+H-0.05;
      const n=Math.max(4, Math.round(Math.hypot(b[0]-a[0], b[1]-a[1])/0.9)), P=[];
      for(let k=0;k<=n;k++){ const t=k/n, sag=Math.sin(Math.PI*t)*0.45; P.push(V3(a[0]+(b[0]-a[0])*t, yA+(yB-yA)*t-sag, a[1]+(b[1]-a[1])*t)); }
      for(let k=0;k<n;k++){ const d=P[k+1].clone().sub(P[k]), L=d.length(); ME.push({geo:new T.CylinderGeometry(0.006, 0.006, L, 4), matrix:new T.Matrix4().compose(P[k].clone().add(P[k+1]).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#1a1a1a")});
        if(k>0){ C(0.012, 0.05, P[k].x, P[k].y-0.03, P[k].z, "#2a2a2a", 6); S(0.035, P[k].x, P[k].y-0.08, P[k].z, "#d8c8a0"); bulbs.push(P[k]); } } }
    // (the glow: one mesh of halos over the bulbs, its opacity up after dark, 19's GLOW)
    const hg=new T.SphereGeometry(0.06, 8, 6), list=bulbs.map(p=>({geo:hg, matrix:new T.Matrix4().makeTranslation(p.x, p.y-0.08, p.z), color:new T.Color("#ffd890")}));
    const gm=new T.MeshBasicMaterial({vertexColors:true, transparent:true, opacity:0, toneMapped:false, depthWrite:false});
    const gmesh=new T.Mesh(mergeEntries(list), gm); gmesh.matrixAutoUpdate=false; gmesh.updateMatrix(); scene.add(gmesh); GLOW.push({m:gm, basic:true, max:1.0});
    const L1={x:944.5, y:gyAt(944.5, -1889)+2.8, z:-1889.0, color:0xffcf90, intensity:0, dist:14, decay:1.6, mothy:true}; LAMPS.push(L1); DIVE.lamps.push(L1); }

  /* ---- the food truck: a step van, its length along z, its nose to the south, its window on the curb side facing east ---- */
  const TX=930.6, TZ=-1882.5, TG=gyAt(TX, TZ);
  { const yaw=0, q=(lx, lz)=>[TX+lx*Math.cos(yaw)+lz*Math.sin(yaw), TZ-lx*Math.sin(yaw)+lz*Math.cos(yaw)];
    const b=(w, h, d, lx, ly, lz, c, list)=>{ const [x, z]=q(lx, lz); B(w, h, d, x, TG+ly, z, c, yaw, list); };
    const rb=(w, h, d, lx, ly, lz, c, rad, list)=>{ const [x, z]=q(lx, lz); RB(w, h, d, x, TG+ly, z, c, yaw, rad, list); };
    const cyl=(rr, h, lx, ly, lz, c, seg, rx, rz, list)=>{ const [x, z]=q(lx, lz); C(rr, h, x, TG+ly, z, c, seg, rx||0, yaw, rz||0, list); };
    const CREAM="#d8ccae", TEALV="#2a7a7a", STEELV="#b8bcc0";
    const Y0=1.0, Y1=3.3, HW=1.17, ZR=-3.4, ZF=1.5;                     // (the box: floor to roof, half width, rear and front ends)
    // the frame and the running gear: rails, axles, six wheels (duals behind), mud flaps, the fuel tank
    for(const s of [-1, 1]) b(0.12, 0.22, 6.3, s*0.48, 0.72, -0.6, "#1a1a1a");
    const wheel=(lx, lz)=>{ cyl(0.46, 0.27, lx, 0.46, lz, "#1a1a1a", 20, 0, Math.PI/2); cyl(0.27, 0.285, lx, 0.46, lz, "#8a8e92", 14, 0, Math.PI/2, CH); cyl(0.09, 0.3, lx, 0.46, lz, "#c8ccd0", 10, 0, Math.PI/2, CH); };
    for(const s of [-1, 1]){ wheel(s*0.98, 0.95); wheel(s*0.98, -2.15); wheel(s*0.68, -2.15); b(0.02, 0.5, 0.36, s*1.04, 0.4, -2.75, "#1a1a1a"); }
    for(const lz of [0.95, -2.15]) cyl(0.06, 2.0, 0, 0.46, lz, "#2a2a2a", 8, 0, Math.PI/2);
    cyl(0.25, 0.9, -0.85, 0.72, -0.6, "#8a8e92", 14, Math.PI/2, 0, CH);
    // the box: a floor pan, the street side whole, the curb side round its window, the back with its door, the roof
    b(2*HW-0.03, 0.12, ZF-ZR, 0, Y0+0.06, (ZF+ZR)/2, "#3a3a3a");      // (inside the sides, not in their faces)
    rb(0.06, Y1-Y0, ZF-ZR, -HW+0.03, (Y0+Y1)/2, (ZF+ZR)/2, CREAM, 0.02);
    const WZ0=-2.4, WZ1=-0.2, WY0=2.0, WY1=2.95;                   // (the serving window in the curb side)
    rb(0.06, WY0-Y0, ZF-ZR, HW-0.03, (Y0+WY0)/2, (ZF+ZR)/2, CREAM, 0.02);
    rb(0.06, Y1-WY1, ZF-ZR, HW-0.03, (WY1+Y1)/2, (ZF+ZR)/2, CREAM, 0.02);
    rb(0.06, WY1-WY0, WZ0-ZR, HW-0.03, (WY0+WY1)/2, (ZR+WZ0)/2, CREAM, 0.02); rb(0.06, WY1-WY0, ZF-WZ1, HW-0.03, (WY0+WY1)/2, (WZ1+ZF)/2, CREAM, 0.02);
    rb(2*HW-0.12, Y1-Y0, 0.06, 0, (Y0+Y1)/2, ZR+0.03, CREAM, 0.02); rb(2*HW+0.04, 0.1, ZF-ZR+0.06, 0, Y1+0.04, (ZF+ZR)/2, "#c8c0a8", 0.04);
    // the paint: a teal skirt, a pinstripe, along both sides and round the back
    for(const s of [-1, 1]){ b(0.012, 0.62, ZF-ZR-0.02, s*(HW+0.006), Y0+0.33, (ZF+ZR)/2, TEALV); b(0.012, 0.05, ZF-ZR-0.02, s*(HW+0.008), Y0+0.7, (ZF+ZR)/2, "#c84a3a"); }
    b(2*HW-0.04, 0.62, 0.012, 0, Y0+0.33, ZR-0.006, TEALV);
    // the cab: a step van's flat face, the windshield in two panes, the grille, the lamps, the bumper, the mirrors, the door's step
    const CF=ZF+1.15;
    rb(2*HW, 1.05, CF-ZF, 0, 1.45, (ZF+CF)/2, CREAM, 0.04); rb(2*HW-0.04, Y1-1.95, CF-ZF-0.25, 0, (1.95+Y1)/2, (ZF+CF-0.25)/2, CREAM, 0.05);
    b(2*HW-0.06, 0.6, 0.012, 0, 1.25, CF+0.006, TEALV);
    { const [x, z]=q(0, CF-0.24); for(const s of [-1, 1]) push("glass", planeGeo(0.98, 0.9, 0), x+s*0.53, TG+2.45, z+0.005, 0, "#ffffff"); }
    b(0.08, 0.95, 0.04, 0, 2.45, CF-0.22, "#2a2a2a");
    b(1.1, 0.42, 0.04, 0, 1.4, CF+0.02, "#2a2a2a"); for(let k=0;k<5;k++) b(1.04, 0.025, 0.02, 0, 1.24+k*0.08, CF+0.045, "#c8ccd0", CH);
    for(const s of [-1, 1]){ cyl(0.11, 0.05, s*0.82, 1.4, CF+0.02, "#c8ccd0", 14, Math.PI/2, 0, CH); cyl(0.085, 0.02, s*0.82, 1.4, CF+0.048, "#e8e0c0", 14, Math.PI/2); b(0.14, 0.08, 0.02, s*0.82, 1.62, CF+0.015, "#e8962a"); }
    b(2*HW+0.1, 0.2, 0.16, 0, 0.78, CF+0.1, "#c8ccd0", CH); b(0.32, 0.16, 0.02, 0, 0.78, CF+0.19, "#d8d0c0");
    for(const s of [-1, 1]){ b(0.05, 0.05, 0.4, s*(HW+0.2), 2.3, CF-0.4, "#2a2a2a"); b(0.04, 0.38, 0.2, s*(HW+0.38), 2.3, CF-0.45, "#1a1a1a"); b(0.006, 0.34, 0.16, s*(HW+0.36), 2.3, CF-0.45, "#8a9aa8", CH); }
    b(0.5, 0.06, 0.3, HW-0.3, 0.55, ZF+0.6, "#5a5e62", CH);
    // the curb side's door into the cab, its handle and window
    b(0.012, 1.7, 0.75, HW+0.007, 1.95, ZF+0.55, "#c8c0a8"); { const [x, z]=q(HW+0.015, ZF+0.55); push("glass", planeGeo(0.55, 0.55, 0), x, TG+2.5, z, Math.PI/2, "#ffffff"); }
    b(0.03, 0.03, 0.16, HW+0.02, 1.85, ZF+0.3, "#c8ccd0", CH);
    // the serving window: the counter inside, the shelf outside, the slider half open, the awning up on its struts, lights under it
    b(0.42, 0.05, WZ1-WZ0+0.1, HW+0.2, WY0-0.03, (WZ0+WZ1)/2, STEELV, CH); for(const lz of [WZ0+0.2, WZ1-0.2]) b(0.03, 0.3, 0.03, HW+0.32, WY0-0.2, lz, "#8a8e92", CH);
    b(0.06, 0.06, WZ1-WZ0+0.04, HW+0.0, WY0-0.01, (WZ0+WZ1)/2, "#8a8e92", CH); b(0.06, 0.06, WZ1-WZ0+0.04, HW+0.0, WY1+0.01, (WZ0+WZ1)/2, "#8a8e92", CH);
    { const [x, z]=q(HW-0.05, WZ0+(WZ1-WZ0)*0.3); push("glass", planeGeo((WZ1-WZ0)*0.55, WY1-WY0-0.06, 0), x, TG+(WY0+WY1)/2, z, Math.PI/2, "#ffffff"); }
    { // (hinged along the window's head, swung out and up till it slopes a little down and away; two struts hold it from the shelf)
      const th=0.22, len=1.2, hy=TG+WY1+0.06, ox=Math.cos(th)*len, oy=-Math.sin(th)*len, [x, z]=q(HW+0.03+ox/2, (WZ0+WZ1)/2), y=hy+oy/2;
      ent(boxGeo(WZ1-WZ0+0.3, 0.04, len), x, y, z, CREAM, th, yaw+Math.PI/2, 0);
      ent(boxGeo(WZ1-WZ0+0.3, 0.012, len-0.02), x, y-0.027, z, TEALV, th, yaw+Math.PI/2, 0);
      for(const lz of [WZ0+0.1, WZ1-0.1]){ const [sx, sz]=q(HW+0.36, lz), [ex, ez]=q(HW+0.03+ox*0.92, lz); const A=V3(sx, TG+WY0-0.02, sz), Bp=V3(ex, hy+oy*0.92-0.05, ez), d=Bp.clone().sub(A);
        CH.push({geo:new T.CylinderGeometry(0.012, 0.012, d.length(), 6), matrix:new T.Matrix4().compose(A.clone().add(Bp).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#8a8e92")}); }
      // (and a strip of lights under its edge, warm, lit after dark with the rest)
      { const [lx, lz]=q(HW+0.03+ox*0.96, (WZ0+WZ1)/2); B(0.03, 0.03, WZ1-WZ0, lx, hy+oy*0.96-0.06, lz, "#e8d8a0"); }
      addRoof(TX+HW, TX+HW+ox, TZ+WZ0-0.15, TZ+WZ1+0.15, hy); }
    // inside: the counter under the window, the griddle and the fryer on the back wall, the hood over them, shelves, the cook's lamp
    b(0.6, 0.95, WZ1-WZ0+0.6, HW-0.36, Y0+0.12+0.475, (WZ0+WZ1)/2, STEELV, CH);
    b(0.7, 0.9, 1.2, -HW+0.42, Y0+0.12+0.45, -1.0, STEELV, CH); b(0.66, 0.02, 1.1, -HW+0.42, Y0+0.12+0.91, -1.0, "#2a2a2a");
    b(0.6, 0.9, 0.5, -HW+0.38, Y0+0.12+0.45, -2.0, STEELV, CH); b(0.4, 0.04, 0.36, -HW+0.38, Y0+0.12+0.92, -2.0, "#a8822a");
    b(0.8, 0.5, 2.0, -HW+0.46, Y1-0.4, -1.4, "#9a9ea2", CH);
    for(const ly of [2.4, 2.75]) b(0.3, 0.03, 1.2, -HW+0.2, ly, 0.6, STEELV, CH);
    for(let k=0;k<6;k++) b(0.12, 0.2, 0.12, -HW+0.2, 2.53+((k/3)|0)*0.35, 0.2+(k%3)*0.3, ["#c82a2a","#d8b82a","#e8d8b0"][k%3]);
    { const [x, z]=q(0, -1.3); LAMPS.push({x:x, y:TG+Y1-0.25, z:z, color:0xfff0d8, intensity:0.7, dist:5, decay:1.6, indoor:true}); B(0.9, 0.04, 0.2, x, TG+Y1-0.06, z, "#d8d0c0"); }
    // the menu board beside the window, the truck's name along the top of both sides
    { const [x, z]=q(HW+0.04, 0.55); B(0.02, 1.1, 0.9, x, TG+2.2, z, "#1a1a1a");
      sign(0.84, 1.04, (c, W, H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0, 0, W, H); say(c, "MENU", W/2, H*0.08, W*0.5, H*0.08, "#f2d8a0", "800", "Arial");
          const items=[["PERCH SANDWICH","12"],["PIEROGIES (6)","8"],["BURGER","9"],["CHEESEBURGER","10"],["HAND-CUT FRIES","5"],["FRIED PICKLES","6"],["FUNNEL CAKE","7"],["POP","2"]];
          items.forEach(([n, p], i)=>{ say(c, n, W*0.4, H*(0.2+i*0.095), W*0.62, H*0.06, "#e8e8d8", "700", "Arial"); say(c, p, W*0.86, H*(0.2+i*0.095), W*0.14, H*0.06, "#f2c46a", "700", "Arial"); }); },
        x+0.011, TG+2.2, z, Math.PI/2, false, 240); }
    for(const s of [-1, 1]){ const [x, z]=q(s*(HW+0.02), (ZR+ZF)/2-0.4);
      sign(3.6, 0.42, (c, W, H)=>{ c.fillStyle=CREAM; c.fillRect(0, 0, W, H); c.shadowColor="rgba(0,0,0,0.3)"; c.shadowBlur=4; say(c, "LAKE EFFECT EATS", W*0.38, H/2, W*0.62, H*0.7, TEALV, "800", "'Cooper Black', Georgia, serif");
          c.shadowBlur=0; say(c, "PERCH · PIEROGIES · BURGERS", W*0.83, H/2, W*0.3, H*0.36, "#c84a3a", "700", "Arial"); }, x+s*0.003, TG+3.05, z, s>0 ? Math.PI/2 : -Math.PI/2, false, 900); }
    // the back: its door and window, tail lamps, the bumper and plate, a ladder up the corner; a generator on the hitch
    b(0.86, 1.95, 0.012, 0.35, Y0+1.05, ZR-0.012, "#c8c0a8"); { const [x, z]=q(0.35, ZR-0.02); push("glass", planeGeo(0.5, 0.45, 0), x, TG+2.55, z, Math.PI, "#ffffff"); }
    for(const s of [-1, 1]) b(0.14, 0.26, 0.03, s*(HW-0.12), 1.3, ZR-0.016, "#a8201a");
    b(2*HW, 0.16, 0.18, 0, 0.82, ZR-0.12, "#2a2a2a"); b(0.32, 0.16, 0.012, -0.5, 1.1, ZR-0.008, "#d8d0c0");
    for(const s of [0, 1]) b(0.03, 2.4, 0.03, -HW+0.12+s*0.36, 2.1, ZR-0.05, "#8a8e92", CH); for(let k=0;k<7;k++) b(0.36, 0.025, 0.025, -HW+0.3, 1.2+k*0.3, ZR-0.05, "#8a8e92", CH);
    b(0.9, 0.06, 0.6, 0, 0.62, ZR-0.62, "#2a2a2a"); rb(0.8, 0.5, 0.5, 0, 0.9, ZR-0.62, "#c8b82a", 0.04); for(let k=0;k<4;k++) b(0.5, 0.02, 0.012, 0.0, 0.82+k*0.06, ZR-0.37, "#2a2a2a");
    cyl(0.025, 0.4, 0.3, 1.2, ZR-0.62, "#3a3a3a", 6);
    // the propane: two tanks on a rack ahead of the curb side's wheels
    for(const s of [0, 1]) cyl(0.16, 0.6, HW+0.2, 0.62, -0.35+s*0.36, "#d8d0c0", 14);
    for(const s of [0, 1]){ const [x, z]=q(HW+0.2, -0.35+s*0.36); S(0.155, x, TG+0.92, z, "#d8d0c0"); C(0.05, 0.12, x, TG+1.1, z, "#8a8e92", 8, 0, 0, 0, CH); }
    b(0.08, 0.04, 0.9, HW+0.2, 0.3, -0.17, "#2a2a2a");
    // on the roof: a vent fan, the hood's stack, the air conditioner
    rb(0.9, 0.3, 0.7, -0.3, Y1+0.24, 0.3, "#c8c0a8", 0.05); cyl(0.14, 0.6, -0.6, Y1+0.38, -1.4, "#8a8e92", 12, 0, 0, CH); cyl(0.22, 0.04, -0.6, Y1+0.7, -1.4, "#8a8e92", 12, 0, 0, CH);
    b(0.5, 0.14, 0.5, 0.5, Y1+0.16, -2.6, "#9a9ea2", CH);
    // the jacks down at the corners, chocks at the front wheels, a cord off to the bar
    for(const [lx, lz] of [[-HW+0.2, ZR+0.3],[HW-0.2, ZR+0.3],[-HW+0.2, ZF-0.3],[HW-0.2, ZF-0.3]]){ b(0.08, 0.9, 0.08, lx, 0.5, lz, "#c8b82a"); b(0.25, 0.04, 0.25, lx, 0.02, lz, "#5a5e62"); }
    for(const s of [-1, 1]) b(0.18, 0.12, 0.2, s*0.98, 0.06, 0.95+0.52, "#c8b82a");
    // a collider for the whole of it, and the ground under the window kept walkable to its shelf
    { const [a0, a1]=q(-HW-0.5, ZR-0.95), [b0, b1]=q(HW+0.06, CF+0.25); addCol(Math.min(a0, b0), Math.max(a0, b0), Math.min(a1, b1), Math.max(a1, b1), TG-0.5, TG+Y1+0.8); }
    // the trash can and a sign on a board by the window
    { const [x, z]=q(HW+1.6, ZF+0.3); C(0.28, 0.9, x, TG+0.45, z, "#3a5a3a", 14); addCol(x-0.3, x+0.3, z-0.3, z+0.3, TG-0.05, TG+0.9); }
    { const [x, z]=q(HW+1.3, WZ0-0.8); B(0.6, 0.9, 0.04, x, TG+0.5, z, "#3a3a3a", 0.4); }
    DIVE.truck={x:TX, z:TZ, g:TG, HW:HW}; }

  /* ---- the walls of the world round the clearing; the bank a step short of the water; trees round the edges, deep ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300);
    const shoreX=(z)=>{ let x=930; while(x<S0.x1+40 && Terrain.lakeSD(x, z)>1.5) x+=0.25; return x; };
    W(S0.x0-0.4, S0.x0+0.4, S0.z0, S0.z1); W(S0.x0, shoreX(S0.z0)+0.4, S0.z0-0.4, S0.z0+0.4);
    const BANK="THE BANK DROPS STRAIGHT INTO THE LAKE HERE";
    for(let z=S0.z0; z<S0.z1-0.01; z+=2){ const z2=Math.min(S0.z1, z+2); if(z2>DOCKZ[0]+0.05 && z<DOCKZ[1]-0.05) continue; const a=shoreX(z), b=shoreX(z2); W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, z, z2).msg=BANK; }   // (open where the dock goes out)
    { const a=shoreX(DOCKZ[0]-1), b=shoreX(DOCKZ[1]+1); W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, DOCKZ[0]-1.0, DOCKZ[0]).msg=BANK; W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, DOCKZ[1], DOCKZ[1]+1.0).msg=BANK; }
    addZone(S0.x0, S0.x1, S0.z0, S0.z1, Y-4, Y+20, "THE LAKESIDE DIVE"); }
  if(typeof FOREST!=="undefined"){ const q=_trng(1979);
    const tree=(sp, x, z, s)=>{ if(Terrain.lakeSD(x, z)<3.5) return; FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, gy=gyAt(x, z); addCol(x-rr, x+rr, z-rr, z+rr, gy-0.5, gy+6); };
    for(let z=S0.z0+2; z<S0.z1-2; z+=6.2) for(const dep of [1.8, 6.5, 11.5, 16.5]) if(q()>0.12) tree(dep<2 ? "edge" : q()<0.3 ? "hemlock" : "hard", S0.x0-dep-q()*2, z+(q()-0.5)*2.4, 0.85+q()*0.4);
    for(let x=S0.x0-18; x<S0.x1+12; x+=6.2) for(const dep of [1.8, 6.5, 11.5, 16.5]) if(q()>0.12) tree(dep<2 ? "edge" : q()<0.3 ? "hemlock" : "hard", x+(q()-0.5)*2.4, S0.z0-dep-q()*2, 0.85+q()*0.4);
    // a few in the open: by the lot, behind the bar, one down by the water
    for(const [x, z] of [[907.5, -1898],[908.5, -1906],[912, -1914],[921, -1913],[931, -1912],[958, -1906],[962, -1872],[972, -1915]]) tree(q()<0.6 ? "lawn" : "edge", x, z, 0.85+q()*0.3);
    for(const [x, z] of [[913.2, -1896.0],[913.2, -1902.6],[926.5, -1894.4]]) FOREST.plant("shrub", x, z, {scale:0.9, solid:false}); }

  /* ---- the people: the bartender, two on stools, the cook in the truck, a few at the tables, one in a chair on the deck ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("lakeside dive", 930, -1892, 90);
    const L=(o)=>Object.assign({h:1.0, skin:SKINS[(r()*5)|0], hair:HAIRS[(r()*6)|0], shirt:"#5a5a5a", pants:"#2a2e3a", shoes:"#2a2a2a"}, o);
    crowdAdd(G, {look:L({shirt:"#2a2a2a", hair:HAIRS[3]}), x:918.6, z:BZF-1.0, y:FL, yaw:0, mode:"stand", sway:0.4});
    crowdAdd(G, {look:L({shirt:"#7a2a2a", cap:"#2a3a5a"}), x:916.55, z:BZF+0.62, y:FL, yaw:Math.PI, mode:"sit", sitY:0.815, held:"pint", drink:true, sway:0.3});
    crowdAdd(G, {look:L({female:true, shirt:"#3a5a7a", long:true}), x:919.55, z:BZF+0.62, y:FL, yaw:Math.PI, mode:"sit", sitY:0.815, held:"can", drink:true, sway:0.3});
    crowdAdd(G, {look:L({shirt:"#d8d0c0", cap:"#c84a3a"}), x:TX+0.2, z:TZ-1.3, y:TG+1.12, yaw:Math.PI/2, mode:"stand", sway:0.3, yAt:()=>TG+1.12, inside:true});      // (inside: the cook in the truck, whose collider is all of it)
    { const [x, z]=[PICNIC[0][0]-0.45, PICNIC[0][1]+0.68], g=gyAt(x, z); crowdAdd(G, {look:L({shirt:"#4a6a3a"}), x:x, z:z, y:g, yaw:Math.PI, mode:"sit", sitY:0.515, held:"can", drink:true, sway:0.3}); }
    { const [x, z]=[PICNIC[0][0]+0.45, PICNIC[0][1]-0.68], g=gyAt(x, z); crowdAdd(G, {look:L({female:true, shirt:"#c88a5a"}), x:x, z:z, y:g, yaw:0, mode:"sit", sitY:0.515, held:"cup", drink:true, sway:0.3}); }
    { const [x, z]=[PICNIC[1][0]+0.45, PICNIC[1][1]+0.68], g=gyAt(x, z); crowdAdd(G, {look:L({shirt:"#2a4a6a", cap:"#2a2a2a"}), x:x, z:z, y:g, yaw:Math.PI, mode:"sit", sitY:0.515, sway:0.3}); }
    crowdAdd(G, {look:L({shirt:"#8a7a5a"}), x:DX1-1.0, z:-1901.2, y:DY, yaw:Math.PI/2, mode:"sit", sitY:0.42, held:"pint", drink:true, sway:0.2}); }

  /* ---- what is built ---- */
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.05});
  detailMesh(ME, mat, "lakeside-dive", true);
  detailMesh(CH, new T.MeshStandardMaterial({vertexColors:true, roughness:0.3, metalness:0.75}), "lakeside-dive-metal", true);

  /* ---- the ways round it, for tools/walk.js ---- */
  const LG=DIVE.LG;
  DIVE.routes={
    "lakeside dive: down the service drive from the office lot":[[801, -1850, ], [801, -1858.5], [850, -1858.5], [919, -1858.5], [919, -1870], [919, -1880]],
    "lakeside dive: across the gravel and in the front door":[[919, -1880], [917.1, -1890], [917.1, -1894.0], [917.1, -1895.8], [917.1, -1897.0], [917.2, -1900.0]],
    "lakeside dive: through the bar and out onto the deck":[[921.8, -1899.6], [923.6, -1899.9], [924.6, -1899.9], [925.8, -1899.9], [927.8, -1899.9], [928.2, -1897.0], [928.2, -1896.2]],
    "lakeside dive: down the deck's steps to the tables":[[DX0+3.2, -1896.6], [DX0+3.2, -1895.4], [DX0+3.2, -1894.0], [935.0, -1894.2], [943.2, -1894.2], [944.0, -1890.2]],
    "lakeside dive: up to the food truck's window":[[935.5, -1880.0], [933.6, -1882.0], [932.4, -1883.2]],
    "lakeside dive: from the office park's lawn to the tables":[[950, -1820], [950, -1845], [950, -1862], [950, -1880], [944.5, -1886]]};
})();
/* the lamps over the door and the tables come on after dark */
/* ---- round 42: the Dive's dock, where a boat ties up to come in for a beer; the fire pit and its chairs; the horseshoe pit ---- */
(function diveExtras(){
  if(typeof EAST==="undefined" || !EAST.dive || typeof LAKESIDE==="undefined" || !LAKESIDE.DY) return;
  const S0=EAST.dive.site, WY=LAKESIDE.WY, DY=LAKESIDE.DY, ME=[], CH=[], r=_trng(1987);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z), shoreX=(z)=>{ let x=930; while(x<S0.x1+40 && Terrain.lakeSD(x, z)>1.5) x+=0.25; return x; };
  /* the dock: a walk out from the bank, a T across its end; both LAKESIDE.docks, so a boat taken anywhere on the lake ties up here */
  const ZM=(DOCKZ[0]+DOCKZ[1])/2, SX=shoreX(ZM), X0=SX-1.2, X1=SX+11.0, TE=[X1, X1+2.4, ZM-7.0, ZM+7.0];
  const deck=(x0, x1, z0, z1)=>{ LAKESIDE.docks.push({x0:x0, x1:x1, z0:z0, z1:z1, y:DY}); addFlat(x0, x1, z0, z1, DY);
    const along=(x1-x0)>(z1-z0), n=Math.floor((along ? x1-x0 : z1-z0)/0.16);
    for(let k=0;k<n;k++){ const t=(k+0.5)/n; along ? B(0.145, 0.05, z1-z0, x0+(x1-x0)*t, DY-0.025, (z0+z1)/2, k%5 ? "#8a7a62" : "#7a6a54") : B(x1-x0, 0.05, 0.145, (x0+x1)/2, DY-0.025, z0+(z1-z0)*t, k%5 ? "#8a7a62" : "#7a6a54"); }
    for(const sd of [0, 1]) along ? B(x1-x0, 0.2, 0.08, (x0+x1)/2, DY-0.15, sd ? z1+0.04 : z0-0.04, "#5a4a36") : B(0.08, 0.2, z1-z0, sd ? x1+0.04 : x0-0.04, DY-0.15, (z0+z1)/2, "#5a4a36"); };
  deck(X0, X1, DOCKZ[0], DOCKZ[1]); deck(TE[0], TE[1], TE[2], TE[3]);
  const piling=(x, z)=>{ const bed=Math.min(gy(x, z), WY-0.5); C(0.12, DY+0.6-bed, x, (DY+0.6+bed)/2, z, "#5a4a36", 12); C(0.13, 0.04, x, DY+0.62, z, "#4a3a2a", 12); addCol(x-0.13, x+0.13, z-0.13, z+0.13, DY-1.2, DY+0.62); };
  for(let x=X0+2.5; x<X1-0.5; x+=4.0) for(const z of [DOCKZ[0]-0.16, DOCKZ[1]+0.16]) piling(x, z);
  for(const z of [TE[2], TE[2]+4.6, TE[3]-4.6, TE[3]]) for(const x of [TE[0]-0.16, TE[1]+0.16]) if(Math.abs(z-ZM)>2) piling(x, z);
  for(let z=TE[2]+1.2; z<TE[3]-1; z+=3.0) for(const x of [TE[1]-0.12, TE[0]+0.12]) if(Math.abs(z-ZM)>1.6){ B(0.3, 0.04, 0.06, x, DY+0.06, z, "#8a8d90", Math.PI/2, CH); }
  // its edges: walls you cannot step off, low; the bank's own rocks either side of where it leaves the shore
  { const E=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, DY-1.2, DY+0.9);
    E(X0+1.4, X1, DOCKZ[0]-0.07, DOCKZ[0]+0.07); E(X0+1.4, X1, DOCKZ[1]-0.07, DOCKZ[1]+0.07);
    E(TE[0]-0.07, TE[0]+0.07, TE[2], DOCKZ[0]); E(TE[0]-0.07, TE[0]+0.07, DOCKZ[1], TE[3]); E(TE[1]-0.07, TE[1]+0.07, TE[2], TE[3]);
    E(TE[0], TE[1], TE[2]-0.07, TE[2]+0.07); E(TE[0], TE[1], TE[3]-0.07, TE[3]+0.07);
    for(const z of [DOCKZ[0]-0.6, DOCKZ[1]+0.6]) for(let k=0;k<3;k++){ const s=0.3+r()*0.2; ent(new T.DodecahedronGeometry(s, 0), SX-1.5+k*0.7, WY+0.1+s*0.3, z+(r()-0.5)*0.3, ["#8a847a","#7a7468","#6a665e"][k%3], r()*3, r()*3); } }
  // a sign at the end for anyone coming in by water, and a lamp on a post at the T
  { const x=TE[1]-0.1, z=ZM; B(0.1, 1.6, 0.1, x, DY+0.8, z+0.9, "#5a4a36"); B(0.1, 1.6, 0.1, x, DY+0.8, z-0.9, "#5a4a36"); addCol(x-0.06, x+0.06, z-0.96, z+0.96, DY-0.5, DY+1.6);
    B(0.06, 0.66, 1.9, x-0.07, DY+1.25, z, "#3a2a20");
    sign(1.8, 0.56, (c, W, H)=>{ c.fillStyle="#3a2a20"; c.fillRect(0, 0, W, H); say(c, "LAKESIDE DIVE", W/2, H*0.38, W*0.8, H*0.34, "#e8c878", "800", "Georgia, serif"); say(c, "BOATERS WELCOME · TIE UP 2 HRS", W/2, H*0.76, W*0.8, H*0.16, "#d8ccb0", "700"); },
      x+0.0, DY+1.25, z, Math.PI/2, false, 520);
    C(0.05, 2.3, TE[0]+0.2, DY+1.15, TE[3]-0.4, "#2a2a2e", 8); ent(new T.SphereGeometry(0.11, 10, 8), TE[0]+0.2, DY+2.35, TE[3]-0.4, "#2a2a2e");
    push("rn_glow", new T.SphereGeometry(0.08, 10, 8), TE[0]+0.2, DY+2.25, TE[3]-0.4, 0, "#ffffff");
    const L={x:TE[0]+0.2, y:DY+2.1, z:TE[3]-0.4, color:0xffd8a0, intensity:0, dist:10, decay:1.6, mothy:true}; LAMPS.push(L); DIVE.lamps.push(L);
    addCol(TE[0]+0.13, TE[0]+0.27, TE[3]-0.47, TE[3]-0.33, DY-0.5, DY+2.4); }
  addZone(X0, TE[1], TE[2], TE[3], WY-1, WY+6, "THE LAKESIDE DIVE · THE DOCK");
  /* the fire pit on the grass toward the water: a ring of stones, the logs, the embers that glow after dark; four Adirondack chairs round it */
  { const fx=SX-13.0, fz=-1914.0, g=gy(fx, fz);
    for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; ent(new T.DodecahedronGeometry(0.17, 0), fx+Math.cos(a)*0.62, g+0.08, fz+Math.sin(a)*0.62, ["#7a7468","#6a665e","#8a847a"][k%3], r()*3, a, r()); }
    for(let k=0;k<4;k++){ const a=k*1.4+0.3; ent(new T.CylinderGeometry(0.06, 0.07, 0.7, 8), fx+Math.cos(a)*0.08, g+0.12+(k%2)*0.06, fz+Math.sin(a)*0.08, "#3a2a1a", Math.PI/2, a, 0.25); }
    push("rn_glow", new T.CircleGeometry(0.34, 16).rotateX(-Math.PI/2), fx, g+0.06, fz, 0, "#ffffff");
    addCol(fx-0.75, fx+0.75, fz-0.75, fz+0.75, g-0.3, g+0.25);
    const L={x:fx, y:g+0.7, z:fz, color:0xff8a3a, intensity:0, dist:9, decay:1.4, fire:true}; LAMPS.push(L); DIVE.fire=L;
    const adk=(a, col)=>{ const x=fx+Math.cos(a)*2.1, z=fz+Math.sin(a)*2.1, s=Math.atan2(Math.cos(a), Math.sin(a)), gg=gy(x, z);     // (s: the seat's yaw, facing the fire)
      const c=Math.cos(s), sn=Math.sin(s), P=(lx, lz)=>[x+lx*c+lz*sn, z-lx*sn+lz*c];
      for(let k=0;k<5;k++){ const [px, pz]=P(-0.24+k*0.12, 0.02); ent(boxGeo(0.1, 0.025, 0.56), px, gg+0.36-0.0, pz, col, -0.12, s, 0); }               // the seat's slats, tipped back
      for(let k=0;k<5;k++){ const [px, pz]=P(-0.24+k*0.12, 0.36); ent(boxGeo(0.1, 0.8+(k===2 ? 0.1 : k%4===0 ? -0.08 : 0), 0.025), px, gg+0.72, pz, col, 0.32, s, 0); }   // the back, raked
      for(const sd of [-1, 1]){ const [px, pz]=P(sd*0.38, 0.05); ent(boxGeo(0.14, 0.025, 0.74), px, gg+0.58, pz, col, 0, s, 0);
        const [lx, lz]=P(sd*0.38, -0.22); ent(boxGeo(0.06, 0.56, 0.06), lx, gg+0.28, lz, col, 0, s, 0); const [kx, kz]=P(sd*0.33, 0.32); ent(boxGeo(0.06, 0.42, 0.06), kx, gg+0.21, kz, col, 0, s, 0); }
      const [cx, cz]=P(0, 0.08); addColOB(cx, cz, s, 0.42, 0.45, gg-0.05, gg+0.6);
      addSeat(x, z, gg, s, "AN ADIRONDACK CHAIR BY THE FIRE", false, 0.76); return [x, z, s, gg]; };
    DIVE.adk=[adk(0.4, "#a8423a"), adk(1.9, "#3a6a8a"), adk(3.5, "#d8b84a"), adk(5.0, "#4a7a4a")]; }
  /* the horseshoe pit: two boxes of sand on the grass forty feet apart, a stake in each, the shoes lying where they fell */
  { const hx=936.0;
    for(const z of [-1903.4, -1915.6]){ const g=gy(hx, z); B(1.2, 0.12, 1.8, hx, g+0.04, z, "#5a4a36"); B(1.04, 0.012, 1.64, hx, g+0.10, z, "#c8b48a");
      C(0.015, 0.36, hx, g+0.27, z, "#5a5a5e", 6); addCol(hx-0.6, hx+0.6, z-0.9, z+0.9, g-0.3, g+0.11);
      for(let k=0;k<2;k++){ const a=r()*6.28, d=0.15+r()*0.3; ent(new T.TorusGeometry(0.08, 0.012, 4, 10, Math.PI*1.4), hx+Math.cos(a)*d, g+0.12+k*0.012, z+Math.sin(a)*d, "#6a6a70", Math.PI/2, 0, a, CH); } } }
  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.8, metalness:0.02}), "lakeside-dive-yard", true);
  detailMesh(CH, new T.MeshStandardMaterial({vertexColors:true, roughness:0.35, metalness:0.7}), "lakeside-dive-yard-metal", true);
  DIVE.routes["lakeside dive: down the grass and out the dock to the T"]=[[944.0, -1905.0],[SX-4.0, ZM],[SX-1.0, ZM],[SX+3.0, ZM],[X1-0.6, ZM],[TE[0]+1.2, ZM],[TE[0]+1.2, TE[2]+1.0],[TE[0]+1.2, TE[3]-1.0]];
  DIVE.routes["lakeside dive: round the fire pit"]=[[SX-16.2, -1917.0],[SX-16.2, -1911.0],[SX-10.0, -1911.0],[SX-10.0, -1917.0]];
})();
function updateDive(dt, dark){ for(const L of DIVE.lamps) L.intensity=(L.dist>10 ? 0.9 : 0.8)*smoothstep(0.3, 0.6, dark);
  if(DIVE.fire){ const k=smoothstep(0.25, 0.55, dark), t=performance.now()*0.001; DIVE.fire.intensity=k*(0.9+0.2*Math.sin(t*9.1)+0.12*Math.sin(t*23.7)); } }
