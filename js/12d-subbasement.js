"use strict";
/* REST AREA · 12d-subbasement.js
   behind the two steel doors in the shelter corridor (12c): MECH 2, and
   the stair down to the sub-basement
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12d · MECH 2 AND THE SUB-BASEMENT
   MECH 2 is what its name says: the air handler that breathes for the
   corridor and the arcade, a water heater, the sump pump under its grate,
   the panel, a shelf of filters and the log on its clipboard.
   The door marked STORAGE · NO ENTRY opens on a little room of the
   shelter's old stores (water drums, cracker tins) and a straight concrete
   stair going down, eighteen risers, to the sub-basement: block hallways
   not much wider than your shoulders, running out under the hill in a long
   loop with dead ends off it, lit by a bare bulb every so often, some of
   them out and one going. Pipes along the ceiling, water standing on the
   floor, chalk on the walls. Off them the old boiler room, a bunk room the
   shelter never needed, a chair at the end of a passage facing the wall,
   and at the far end, under a red light, a steel door with a wheel on it
   that does not turn.
   All of it BURIED (06). Down here the fill light is a fraction of the rest
   of underground's (19, the volume's dimming), so bring a light (L). The
   walls are worked out from the hallways' rectangles on a 20 cm grid: a
   wall wherever open floor meets rock, carried round the outside corners
   and stopped at the openings.
   ---------------------------------------------------------------------- */
const SUBBASE={drip:2.5, vols:[]};
(function subbasement(){
  const K=ARCADE.corr; if(!K) return;
  const FH=K.y, WT=0.25, XW=K.x1+K.wt, CEIL=K.ceil;                 // XW: the corridor wall's back face
  const RS=0.19, NS=18, SB=FH-NS*RS, SH=2.4;                        // eighteen risers down; the hallways' height
  const DIM=0.22;                                                   // the sub-basement's share of underground's fill light
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,r,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    E.push({geo:new T.CylinderGeometry(r,r,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x, s, cx, cy, w, h, col, weight, family)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const lamp=(o)=>{ o.under=true; o.indoor=true; o.circ="bldg"; LAMPS.push(o); return o; };
  // chalk on a wall: a sheet of its own a centimetre off the block, the lettering fitted inside it
  const chalk=(lines, w, h, x, y, z, ry, col)=>{
    const tex=signTex(Math.round(w*220), Math.round(h*220), (c,W,Hh)=>{ c.clearRect(0,0,W,Hh); c.globalAlpha=0.8;
      lines.forEach((L,k)=>say(c, L, W/2, Hh*(k+0.5)/lines.length, W*0.84, Hh*0.62/lines.length, col||"#e2ded2", "700", "'Comic Sans MS', 'Marker Felt', cursive")); });
    const m=new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshStandardMaterial({map:tex, transparent:true, alphaTest:0.04, depthWrite:false, roughness:1,
      polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(x,y,z); m.rotation.y=ry; scene.add(m); };
  // a bare bulb on its cord: lit, out, or going
  const bulb=(x, z, y0, state, col)=>{
    tubeE(V3(x, y0, z), V3(x, y0-0.32, z), 0.006, "#1a1a1a", 6); C(0.024, 0.06, x, y0-0.35, z, "#3a3226", 10);
    if(state) push("tube", new T.SphereGeometry(0.042, 12, 10), x, y0-0.41, z, 0, "#ffffff");
    else ent(new T.SphereGeometry(0.042, 12, 10), x, y0-0.41, z, "#6a665c");
    if(state) lamp({x:x, y:y0-0.45, z:z, color:col||0xffc888, intensity:state===3?0.8:0.62, dist:7.5, decay:1.8, flicker:state===2}); };

  /* ---- MECH 2 ------------------------------------------------------------- */
  { const M={x0:XW, x1:78.25, z0:-193.75, z1:-188.25}, WC="#8a8c88", top=CEIL;
    // (the north and south walls start 5 mm into the corridor's, the east one between them)
    wallBox("block", XW-0.005, M.x1+WT, M.z0-WT, M.z0, FH-0.1, top+0.1, WC, 0.6, FH);
    wallBox("block", XW-0.005, M.x1+WT, M.z1, M.z1+WT, FH-0.1, top+0.1, WC, 0.6, FH);
    wallBox("block", M.x1, M.x1+WT, M.z0, M.z1, FH-0.1, top+0.1, WC, 0.6, FH);
    lineZ("block", XW, 1, M.z0, M.z1, FH, top, [K.mech], "#a2a49e", 0.6);
    floorAt("concrete", M.x0, M.x1, M.z0, M.z1, FH+0.004, "#7a7d78", 0.5); addFlat(M.x0, M.x1, M.z0, M.z1, FH);
    ceilAt("plaster", M.x0, M.x1, M.z0, M.z1, top, "#b8b4aa", 0.5);
    addVoid(K.x1, M.x1, M.z0, M.z1, FH-3, SUB_G-0.15, FH);
    addBuried(K.x1-0.05, M.x1, M.z0, M.z1, FH-0.5, top+0.05, 0);                     // (from in the doorway)
    addZone(M.x0, M.x1, M.z0, M.z1, FH-0.5, top, "MECH 2", true);
    // the air handler: a cabinet of grey panels on the north side, its fan's housing, the duct up out of it and
    // away west along the ceiling into the corridor wall
    const ax0=76.4, ax1=78.0, az0=-193.5, az1=-191.2;
    B(ax1-ax0, 1.85, az1-az0, (ax0+ax1)/2, FH+0.925, (az0+az1)/2, "#8d9496");
    for(const zz of [-193.0, -192.3, -191.65]) B(0.02, 1.6, 0.58, ax0-0.008, FH+0.95, zz, "#7d8486");          // its access panels
    for(const zz of [-193.0, -192.3, -191.65]) B(0.03, 0.05, 0.10, ax0-0.03, FH+1.0, zz+0.18, "#2a2c2e");
    C(0.36, 0.08, ax0-0.045, FH+1.30, -192.3, "#5a6062", 24, 0, 0, Math.PI/2);
    B(0.60, top-FH-1.85+0.02, 0.40, 77.2, (FH+1.85+top)/2, -192.6, "#a6a9aa");
    B(77.5-XW+0.005, 0.40, 0.40, (XW-0.005+77.5)/2, top-0.22, -192.6, "#a6a9aa");
    addCol(ax0, ax1, az0, az1, FH-0.5, FH+1.85);
    addUse(ax0-0.8, -192.3, FH, "THE AIR HANDLER", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("whirr", 77.2, -192.3);
      toast(["IT BREATHES FOR THE CORRIDOR AND THE ARCADE. ONE BELT SQUEALS WHEN IT STARTS","A STICKER: FILTER 20×25×2 · CHANGE QUARTERLY","WARM AIR OFF THE MOTOR, AND THE SMELL OF DUST COOKING"][(Math.random()*3)|0], "#cfe0d4"); }, 1.2);
    // the water heater in the south-east corner, its flue up through the ceiling, its pipes
    C(0.30, 1.50, 77.6, FH+0.76, -188.95, "#c9c7c0", 24); C(0.31, 0.04, 77.6, FH+1.53, -188.95, "#9a9890", 24);
    C(0.06, top-FH-1.55+0.02, 77.6, (FH+1.55+top)/2, -188.95, "#8a8d90", 12);
    for(const dx of [-0.15, 0.15]) tubeE(V3(77.6+dx, FH+1.55, -189.05), V3(77.6+dx, top-0.05, -189.05), 0.018, "#b87333");
    B(0.10, 0.10, 0.06, 77.6, FH+0.35, -189.27, "#c42a1a");
    addCol(77.28, 77.92, -189.27, -188.63, FH-0.5, FH+1.6);
    // the sump: its grate in the floor, the pump's discharge up the wall
    B(0.60, 0.012, 0.60, 75.6, FH+0.010, -189.0, "#3a3c3e");
    for(let k=-2;k<=2;k++) B(0.56, 0.014, 0.02, 75.6, FH+0.012, -189.0+k*0.11, "#2a2c2e");
    tubeE(V3(75.6, FH+0.02, -188.5), V3(75.6, top-0.10, -188.5), 0.03, "#2a2c2e");
    // the panel on the north wall, its conduit up; the clipboard by it
    B(0.60, 0.90, 0.12, 74.6, FH+1.45, M.z0+0.06, "#9aa0a2"); B(0.56, 0.86, 0.01, 74.6, FH+1.45, M.z0+0.125, "#8a9092");
    tubeE(V3(74.45, FH+1.90, M.z0+0.06), V3(74.45, top, M.z0+0.06), 0.02, "#7d8286"); tubeE(V3(74.75, FH+1.90, M.z0+0.06), V3(74.75, top, M.z0+0.06), 0.02, "#7d8286");
    B(0.24, 0.32, 0.012, 75.35, FH+1.50, M.z0+0.008, "#6a5038");
    sign(0.21, 0.26, (x,W,Hh)=>{ x.fillStyle="#f2efe6"; x.fillRect(0,0,W,Hh);
        ["MECH 2 · LOG","FILTERS 3/14 · 6/9","BELT ADJ. 8/2","PUMP STICKS:","LIFT FLOAT","— D."].forEach((s,k)=>say(x, s, W/2, Hh*(0.12+k*0.155), W*0.82, Hh*0.09, "#2a2a6a", "600", "'Comic Sans MS', cursive")); },
      75.35, FH+1.49, M.z0+0.022, 0, false, 160);
    // the shelf along the south wall: boxed filters, a jug, the mop bucket under it
    for(const y of [0.40, 0.95, 1.50]) B(1.20, 0.03, 0.40, 74.9, FH+y, M.z1-0.22, "#7d8286");
    for(const xx of [74.32, 75.48]) for(const zz of [M.z1-0.40, M.z1-0.04]) B(0.03, 1.55, 0.03, xx, FH+0.775, zz, "#5a5e60");
    for(let k=0;k<3;k++) B(0.36, 0.48, 0.30, 74.55+k*0.36, FH+1.205, M.z1-0.22, k%2?"#b8a27a":"#c8b48a");
    B(0.18, 0.26, 0.12, 74.6, FH+0.545, M.z1-0.22, "#d8d4c8"); C(0.16, 0.30, 75.6, FH+0.15, M.z1-0.45, "#e2b31c", 16);
    addCol(74.3, 75.5, M.z1-0.42, M.z1, FH-0.5, FH+1.6);
    // the light: one fixture of two tubes, one of them gone grey
    B(0.20, 0.07, 1.25, 75.9, top-0.04, -191.0, "#c8cac6");
    push("tube", boxGeo(0.04, 0.02, 1.16, 0), 75.85, top-0.105, -191.0, 0, "#ffffff");
    B(0.04, 0.03, 1.16, 75.95, top-0.105, -191.0, "#8a8c88");
    lamp({x:75.9, y:top-0.3, z:-191.0, color:0xeef4ee, intensity:0.5, dist:6.5, decay:1.5}); }

  /* ---- the storeroom and the stair ---------------------------------------- */
  const V={x0:XW, x1:75.4, z0:-205.4, z1:-201.6}, S={x0:75.4, x1:80.2, z0:-204.4, z1:-202.8}, VC="#7a786e";
  { // the room's walls: north and south, and its east side either side of the stairwell's mouth
    wallBox("block", XW-0.005, V.x1+WT, V.z0-WT, V.z0, FH-0.1, CEIL+0.1, VC, 0.6, FH);
    wallBox("block", XW-0.005, V.x1+WT, V.z1, V.z1+WT, FH-0.1, CEIL+0.1, VC, 0.6, FH);
    wallBox("block", V.x1, V.x1+WT, V.z0, S.z0, FH-0.1, CEIL+0.1, VC, 0.6, FH);
    wallBox("block", V.x1, V.x1+WT, S.z1, V.z1, FH-0.1, CEIL+0.1, VC, 0.6, FH);
    lineZ("block", XW, 1, V.z0, V.z1, FH, CEIL, [K.stair], "#8a877c", 0.6);
    floorAt("concrete", V.x0, V.x1, V.z0, V.z1, FH+0.004, "#6e6c66", 0.5); addFlat(V.x0, V.x1, V.z0, V.z1, FH);
    ceilAt("plaster", V.x0, V.x1, V.z0, V.z1, CEIL, "#8a867c", 0.5);
    // the stairwell's walls, from the bottom of the stair up past the room's ceiling (abutting the stubs, not in them)
    wallBox("block", V.x1+WT, S.x1, S.z0-WT, S.z0, SB-0.1, CEIL+0.1, VC, 0.6, SB);
    wallBox("block", V.x1+WT, S.x1, S.z1, S.z1+WT, SB-0.1, CEIL+0.1, VC, 0.6, SB);
    // the treads: seventeen of them between the room and the floor below, each a block down to the bottom,
    // a yellow nosing a few millimetres proud on each; the ceiling over them a slab falling with them
    const RUN=(S.x1-S.x0)/(NS-1);
    for(let k=1;k<NS;k++){
      const xa=S.x0+(k-1)*RUN, xb=xa+RUN, y=FH-k*RS;
      bx("concrete", RUN, y-(SB-0.1), S.z1-S.z0-0.004, (xa+xb)/2, (y+SB-0.1)/2, (S.z0+S.z1)/2, 0.5, 0, "#8a877e");
      bx("paint", 0.05, 0.004, S.z1-S.z0-0.03, xb-0.033, y+0.002, (S.z0+S.z1)/2, 0, 0, "#c9a21c");          // (8 mm back from the edge, clear of the riser's face)
      addFlat(xa, xb, S.z0, S.z1, y); }
    bx("paint", 0.05, 0.004, S.z1-S.z0-0.03, S.x0-0.025, FH+0.006, (S.z0+S.z1)/2, 0, 0, "#c9a21c");
    bx("concrete", 0.31, 0.40, S.z1-S.z0-0.008, S.x0-0.145, FH-0.202, (S.z0+S.z1)/2, 0.5, 0, "#8a877e");      // the first riser, under the floor's edge
    push("plaster", new FaceGeo().slab([V3(S.x0, CEIL+0.15, S.z0+0.002), V3(S.x1, SB+SH+0.15, S.z0+0.002), V3(S.x1, SB+SH+0.15, S.z1-0.002), V3(S.x0, CEIL+0.15, S.z1-0.002)], 0.15, 0.5).geo(), 0,0,0, 0, "#6a665c");
    // a pipe rail down the south wall on brackets
    { const a=V3(S.x0-0.2, FH+0.92, S.z1-0.07), b=V3(S.x1+0.3, SB+0.92, S.z1-0.07); tubeE(a, b, 0.021, "#2a2c2e");
      for(const t of [0.1, 0.5, 0.9]){ const p=a.clone().lerp(b,t); tubeE(p, V3(p.x, p.y-0.07, S.z1-0.005), 0.012, "#2a2c2e"); } }
    addVoid(K.x1, V.x1+0.05, V.z0, V.z1, FH-3, SUB_G-0.15, FH);
    addVoid(S.x0, S.x1+0.05, S.z0, S.z1, SB-3, SUB_G-0.15, SB);
    const vb={x0:K.x1-0.05, x1:S.x1, z0:V.z0, z1:V.z1, y0:SB-0.5, y1:CEIL+0.05}; addBuried(vb.x0, vb.x1, vb.z0, vb.z1, vb.y0, vb.y1, 0.5);
    addZone(V.x0, S.x1, V.z0, V.z1, SB-0.5, CEIL, "THE STAIR DOWN", true);
    // the shelter's stores: a steel shelf of cracker tins, the water drums, a broom
    for(const y of [0.42, 1.02, 1.62]) B(1.60, 0.03, 0.42, 74.3, FH+y, V.z0+0.24, "#6e7275");
    for(const xx of [73.52, 75.08]) for(const zz of [V.z0+0.04, V.z0+0.44]) B(0.03, 1.66, 0.03, xx, FH+0.83, zz, "#4a4e50");
    for(let k=0;k<4;k++) for(let r=0;r<2;r++){ const x=73.75+k*0.36, y=FH+[0.435,1.035][r];
      B(0.30, 0.34, 0.30, x, y+0.17, V.z0+0.24, "#8a8e6a");
      if(r===0 && k<2) sign(0.26, 0.12, (c,W,Hh)=>{ c.fillStyle="#d8d2b0"; c.fillRect(0,0,W,Hh);
          say(c, "SURVIVAL", W/2, Hh*0.32, W*0.84, Hh*0.28, "#1a1a1a", "700", "Arial"); say(c, "CRACKERS", W/2, Hh*0.70, W*0.84, Hh*0.28, "#1a1a1a", "700", "Arial"); },
        x, y+0.20, V.z0+0.392, 0, false, 160); }
    addCol(73.5, 75.1, V.z0, V.z0+0.46, FH-0.5, FH+1.7);
    for(const [x,z] of [[74.4,-201.95],[74.95,-201.95]]){ C(0.27, 0.86, x, FH+0.43, z, "#5a6a4a", 20); C(0.275, 0.03, x, FH+0.30, z, "#4a5a3a", 20); C(0.275, 0.03, x, FH+0.62, z, "#4a5a3a", 20); }
    sign(0.30, 0.18, (c,W,Hh)=>{ c.fillStyle="#5a6a4a"; c.fillRect(0,0,W,Hh); say(c, "WATER", W/2, Hh*0.32, W*0.84, Hh*0.30, "#e8e4c8", "700", "Arial");
        say(c, "CIVIL DEFENSE", W/2, Hh*0.72, W*0.84, Hh*0.22, "#e8e4c8", "700", "Arial"); }, 74.4, FH+0.62, -202.236, Math.PI, false, 180);
    addCol(74.1, 75.25, -202.25, V.z1, FH-0.5, FH+0.9);
    tubeE(V3(73.32, FH+0.02, -202.3), V3(73.38, FH+1.4, -202.38), 0.014, "#8a6a44");
    bulb(74.3, -203.5, CEIL, 1);
    bulb((S.x0+S.x1)/2, (S.z0+S.z1)/2, (CEIL+SB+SH)/2+0.05, 1);
  }

  /* ---- the hallways ------------------------------------------------------------ */
  // every room and hallway down here a rectangle on the 20 cm grid; the stair is one of them, so its foot opens
  // straight on to the first hallway
  const RECTS=[
    {x0:S.x0, x1:S.x1, z0:S.z0, z1:S.z1, stair:true},
    {x0:80.2, x1:100.8, z0:-204.4, z1:-202.8},                        // east from the stair's foot
    {x0:91.2, x1:92.8, z0:-242.0, z1:-204.4},                         // north under the hill, to the door at the end
    {x0:99.2, x1:100.8, z0:-202.8, z1:-185.2},                        // south at the far end
    {x0:84.6, x1:99.2, z0:-186.8, z1:-185.2},                         // and back west
    {x0:80.6, x1:84.6, z0:-188.6, z1:-183.4, name:"THE BOILER ROOM"},
    {x0:62.0, x1:91.2, z0:-232.8, z1:-231.2},                         // west along the north
    {x0:74.4, x1:76.0, z0:-231.2, z1:-226.0},                         // the passage with the chair at the end
    {x0:62.0, x1:63.6, z0:-231.2, z1:-214.0},                         // south to the bunks
    {x0:58.4, x1:66.4, z0:-214.0, z1:-207.2, name:"THE BUNK ROOM"}];
  const GS=0.2, GX=56.0, GZ=-246.0, NXg=Math.round((102.0-GX)/GS), NZg=Math.round((-182.0-GZ)/GS);
  const open=new Uint8Array(NXg*NZg), ci=x=>Math.round((x-GX)/GS), cj=z=>Math.round((z-GZ)/GS);
  for(const r of RECTS) for(let i=ci(r.x0); i<ci(r.x1); i++) for(let j=cj(r.z0); j<cj(r.z1); j++) open[j*NXg+i]=1;
  const O=(i,j)=>i>=0 && j>=0 && i<NXg && j<NZg && open[j*NXg+i]===1;
  const WC="#5e5c55", y0=SB-0.1, y1=SB+SH+0.12;
  const st=(i,j)=>i>=ci(S.x0) && i<ci(S.x1) && j>=cj(S.z0) && j<cj(S.z1);       // the stair's walls are its own (above)
  // walls along x, on the north (s=-1) or south (s=1) side of a run of open cells with rock beside them. Round an
  // outside corner one runs on to 5 mm inside the wall along z there; at an opening it stops where that wall begins
  for(let j=0;j<NZg;j++) for(const s of [-1,1]){
    const edge=i=>O(i,j) && !O(i,j+s) && !st(i,j), end=n=>!O(n,j) && !O(n,j+s) ? WT-0.005 : O(n,j) && O(n,j+s) ? -WT : 0;
    for(let i=0;i<NXg;){
      if(!edge(i)){ i++; continue; }
      let i2=i; while(i2+1<NXg && edge(i2+1)) i2++;
      const xa=GX+i*GS-end(i-1), xb=GX+(i2+1)*GS+end(i2+1), zf=GZ+(s<0 ? j : j+1)*GS;
      wallBox("block", xa, xb, s<0 ? zf-WT : zf, s<0 ? zf : zf+WT, y0+0.005, y1-0.005, WC, 0.6, SB);
      i=i2+1; } }
  // and along z, on the west and east sides: round an outside corner 5 mm past the wall along x, and to the end of
  // the run at an opening, where the wall along x stopped short of it
  for(let i=0;i<NXg;i++) for(const s of [-1,1]){
    const edge=j=>O(i,j) && !O(i+s,j) && !st(i,j), end=n=>!O(i,n) && !O(i+s,n) ? WT+0.005 : 0;
    for(let j=0;j<NZg;){
      if(!edge(j)){ j++; continue; }
      let j2=j; while(j2+1<NZg && edge(j2+1)) j2++;
      const za=GZ+j*GS-end(j-1), zb=GZ+(j2+1)*GS+end(j2+1), xf=GX+(s<0 ? i : i+1)*GS;
      wallBox("block", s<0 ? xf-WT : xf, s<0 ? xf : xf+WT, za, zb, y0, y1, WC, 0.6, SB);
      j=j2+1; } }
  // the floor and the ceiling: east of the stair's foot, and the west part beyond the stair, each one plane
  for(const [x0,x1,z0,z1] of [[S.x1, 100.8, -242.0, -183.4], [58.4, S.x1, -232.8, -207.2]]){
    floorAt("concrete", x0, x1, z0, z1, SB+0.004, "#4e4c47", 0.5);
    ceilAt("plaster", x0, x1, z0, z1, SB+SH, "#45433e", 0.5); }
  // (each one's volumes lapping its neighbours' by 5 cm, so the seam between two is never in neither)
  for(const r of RECTS){ if(r.stair) continue;
    const a=r.x0-0.05, b=r.x1+0.05, c=r.z0-0.05, d=r.z1+0.05;
    addFlat(r.x0, r.x1, r.z0, r.z1, SB);
    addVoid(a, b, c, d, SB-3, SB+SH+0.3, SB);
    addBuried(a, b, c, d, SB-0.5, SB+SH+0.05, DIM);
    addZone(a, b, c, d, SB-0.5, SB+SH, r.name||"THE SUB-BASEMENT", true);
    SUBBASE.vols.push(r);
    // pipes along the ceiling of every hallway, a big one and a small near one wall, down out of the ceiling at one
    // end and back up into it at the other
    if(!r.name){ const along=r.x1-r.x0>r.z1-r.z0;
      for(const [o,rad,col] of [[0.48,0.055,"#5a4a3a"],[0.62,0.028,"#7a5a3a"]]){
        const y=SB+SH-(rad>0.04?0.14:0.26), m=0.12+rad;
        const a=along ? V3(r.x0+m, y, (r.z0+r.z1)/2-o) : V3((r.x0+r.x1)/2+o, y, r.z0+m);
        const b=along ? V3(r.x1-m, y, (r.z0+r.z1)/2-o) : V3((r.x0+r.x1)/2+o, y, r.z1-m);
        tubeE(a, b, rad, col, 10);
        for(const p of [a,b]){ tubeE(V3(p.x, y-rad*0.9, p.z), V3(p.x, SB+SH+0.02, p.z), rad, col, 10);
          ent(new T.SphereGeometry(rad*1.02, 10, 8), p.x, y, p.z, col); } } } }
  SUBBASE.y=SB; SUBBASE.h=SH;

  // the bulbs: lit (1), out (0), going (2); a red one over the door at the end
  for(const [x,z,st] of [[81.0,-203.6,1],[86.0,-203.6,0],[92.0,-203.6,1],[92.0,-212.0,1],[92.0,-220.0,0],[92.0,-227.0,2],[92.0,-232.0,1],
                         [100.0,-196.0,1],[100.0,-190.0,0],[92.0,-186.0,1],[82.6,-185.4,1],[84.0,-232.0,0],[75.2,-232.0,1],[68.0,-232.0,0],
                         [62.8,-232.0,1],[62.8,-222.0,1],[62.4,-210.6,3]]) bulb(x, z, SB+SH, st);
  bulb(92.0, -240.6, SB+SH, 1, 0xff3a2a);

  // water standing on the floor, a few millimetres proud of it
  bucketOf("puddle", ()=>new T.MeshStandardMaterial({color:0x0c0e10, roughness:0.05, metalness:0.65, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
  for(const [x,z,sx,sz,ry] of [[92.0,-215.5,0.62,0.42,0.3],[92.3,-224.6,0.44,0.30,1.1],[80.8,-232.0,0.55,0.35,-0.4],[100.0,-193.2,0.40,0.28,0.8],[62.8,-226.0,0.50,0.30,0.2]]){
    const g=new T.CircleGeometry(1, 24); g.scale(sx, sz, 1); push("puddle", g, x, SB+0.010, z, ry, "#ffffff", -Math.PI/2, 0); }

  // the shelter's stencil at the stair's foot; chalk further in
  sign(1.00, 0.24, (c,W,Hh)=>{ c.fillStyle="#2a2824"; c.fillRect(0,0,W,Hh); say(c, "SHELTER AREA B  →", W/2, Hh/2, W*0.84, Hh*0.60, "#c9a21c", "700", "'Arial Black', Arial"); },
    84.0, SB+1.55, -204.388, 0, false, 360);
  chalk(["DON'T GO", "PAST THE RED LIGHT"], 1.10, 0.46, 91.212, SB+1.45, -229.9, Math.PI/2);
  chalk(["TURN BACK"], 0.80, 0.26, 70.0, SB+1.30, -231.212, Math.PI);
  chalk(["OCT 27 1962", "STILL WAITING"], 0.90, 0.42, 66.388, SB+1.40, -210.6, -Math.PI/2);
  chalk(["OUT →"], 0.50, 0.24, 92.788, SB+1.20, -205.8, -Math.PI/2);
  // tally marks over the chair, row after row of them
  { const tex=signTex(220, 110, (c,W,Hh)=>{ c.clearRect(0,0,W,Hh); c.strokeStyle="rgba(226,222,210,0.8)"; c.lineWidth=3;
      for(let r=0;r<4;r++) for(let g=0;g<6;g++){ const ox=12+g*34, oy=10+r*25;
        for(let k=0;k<4;k++){ c.beginPath(); c.moveTo(ox+k*6, oy); c.lineTo(ox+k*6+1, oy+18); c.stroke(); }
        c.beginPath(); c.moveTo(ox-3, oy+15); c.lineTo(ox+24, oy+3); c.stroke(); } });
    const m=new T.Mesh(new T.PlaneGeometry(0.9, 0.45), new T.MeshStandardMaterial({map:tex, transparent:true, alphaTest:0.04, depthWrite:false, roughness:1, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(75.2, SB+1.55, -226.012); m.rotation.y=Math.PI; scene.add(m); }
  // the chair at the end of the passage, facing the wall
  { const x=75.2, z=-226.55, W="#6a5038";
    B(0.42, 0.04, 0.40, x, SB+0.45, z, W); B(0.42, 0.42, 0.03, x, SB+0.68, z-0.19, W);
    for(const dx of [-0.18,0.18]) for(const dz of [-0.17,0.17]) B(0.035, 0.43, 0.035, x+dx, SB+0.215, z+dz, W);
    addCol(x-0.22, x+0.22, z-0.22, z+0.22, SB-0.5, SB+0.9);
    addUse(x, z-1.0, SB, "THE CHAIR", ()=>toast(["SOMEBODY SAT HERE A LONG TIME. THE SEAT IS WORN PALE","IT IS FACING THE WALL. YOU DON'T TURN IT ROUND","STILL WARM. NO. IT'S NOT"][(Math.random()*3)|0], "#d8d0c0"), 1.0); }

  // the boiler room: the old riveted boiler on its saddles, its firebox door, the pipes up, a gauge, coal
  { const x=82.4, z=-187.7, y=SB+0.95;
    C(0.75, 2.6, x, y, z, "#3a3430", 24, 0, 0, Math.PI/2);
    for(const dx of [-1.25, 1.25]) C(0.77, 0.06, x+dx, y, z, "#2a2420", 24, 0, 0, Math.PI/2);
    for(const dx of [-0.8, 0.8]) B(0.16, 0.30, 1.2, x+dx, SB+0.15, z, "#4a4440");
    B(0.04, 0.42, 0.50, x+1.32, y-0.15, z, "#1a1614"); B(0.03, 0.06, 0.20, x+1.35, y-0.10, z, "#5a5450");
    tubeE(V3(x-0.6, y+0.74, z), V3(x-0.6, SB+SH+0.02, z), 0.10, "#2a2420"); tubeE(V3(x+0.4, y+0.74, z+0.2), V3(x+0.4, SB+SH+0.02, z+0.2), 0.05, "#5a4a3a");
    C(0.08, 0.03, x+0.4, y+0.95, z+0.46, "#c9cbcc", 16, Math.PI/2, 0, 0);
    for(let k=0;k<7;k++) ent(new T.SphereGeometry(0.10+(k%3)*0.04, 8, 6).scale(1,0.6,1), 81.1+(k%3)*0.22, SB+0.05, -184.0-((k/3)|0)*0.2, "#1a1a1c");
    tubeE(V3(81.6, SB+0.02, -184.6), V3(81.75, SB+1.25, -184.2), 0.015, "#6a5038");
    addCol(x-1.35, x+1.4, z-0.8, z+0.8, SB-0.5, SB+1.8);
    addUse(x+1.9, z, SB, "THE BOILER", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", x, z);
      toast(["COLD. NOBODY HAS FIRED IT SINCE THE SIXTIES","THE GAUGE READS ZERO. THE NEEDLE TWITCHES WHEN YOU TAP IT","A NAMEPLATE: ERIE CITY IRON WORKS · 1958"][(Math.random()*3)|0], "#d8d0c0"); }, 1.2); }

  // the bunk room: four cots, a table with the radio and a lantern, the calendar, more drums
  { const R0={x0:58.4, x1:66.4, z0:-214.0, z1:-207.2}, CAN="#7a7a5a", FR="#5a5e60";
    for(const [x,z,ry] of [[59.4,-209.0,0],[60.6,-209.0,0],[64.2,-208.0,Math.PI/2],[64.2,-209.6,Math.PI/2]]){
      const f=XF(x, z, ry), q=(w,h,d,lx,ly,lz,c)=>B(w,h,d,f.x(lx,lz),SB+ly,f.z(lx,lz),c,ry);
      q(0.72, 0.03, 1.90, 0, 0.42, 0, CAN);
      for(const sd of [-1,1]) q(0.03, 0.03, 1.94, sd*0.37, 0.42, 0, FR);
      for(const sd of [-1,1]) for(const e of [-1,1]) q(0.03, 0.42, 0.03, sd*0.37, 0.21, e*0.93, FR);
      q(0.60, 0.10, 0.34, 0, 0.485, -0.70, "#8a8a6a");
      const hx=Math.abs(Math.cos(ry))*0.40+Math.abs(Math.sin(ry))*0.98, hz=Math.abs(Math.sin(ry))*0.40+Math.abs(Math.cos(ry))*0.98;
      addCol(x-hx, x+hx, z-hz, z+hz, SB-0.5, SB+0.55); }
    const tx=62.0, tz=-211.0;
    B(1.10, 0.04, 0.70, tx, SB+0.74, tz, "#7a6a50");
    for(const dx of [-0.5,0.5]) for(const dz of [-0.3,0.3]) B(0.04, 0.72, 0.04, tx+dx, SB+0.36, tz+dz, "#5a4a36");
    B(0.36, 0.20, 0.16, tx-0.2, SB+0.86, tz, "#3a3028"); C(0.05, 0.012, tx-0.12, SB+0.86, tz+0.086, "#c9cbcc", 14, Math.PI/2);
    C(0.07, 0.22, tx+0.3, SB+0.87, tz+0.1, "#7a2a1a", 12); C(0.05, 0.02, tx+0.3, SB+0.99, tz+0.1, "#2a2a2a", 12);
    addCol(tx-0.58, tx+0.58, tz-0.38, tz+0.38, SB-0.5, SB+0.8);
    addUse(tx-0.2, tz-0.9, SB, "THE RADIO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("static", tx, tz);
      toast(["STATIC. UNDER IT, SOMEBODY READING NUMBERS","STATIC, AND A STATION FROM A LONG WAY OFF PLAYING SOMETHING SLOW","ONLY STATIC. THE DIAL'S LIGHT COMES ON, THOUGH THE CORD ISN'T PLUGGED IN"][(Math.random()*3)|0], "#d8d0c0"); }, 1.1);
    sign(0.42, 0.56, (c,W,Hh)=>{ c.fillStyle="#efe8d4"; c.fillRect(0,0,W,Hh); c.fillStyle="#7a2a1a"; c.fillRect(0,0,W,Hh*0.24);
        say(c, "OCTOBER 1962", W/2, Hh*0.12, W*0.84, Hh*0.14, "#efe8d4", "700", "Georgia, serif");
        c.strokeStyle="#8a8478"; c.lineWidth=1; for(let r=0;r<5;r++) for(let k=0;k<7;k++) c.strokeRect(W*0.08+k*W*0.12, Hh*0.30+r*Hh*0.13, W*0.12, Hh*0.13);
        c.strokeStyle="#c42a1a"; c.lineWidth=2; for(let d=0;d<27;d++){ const k=(d+1)%7, r=((d+1)/7)|0; c.beginPath(); c.moveTo(W*0.09+k*W*0.12, Hh*0.31+r*Hh*0.13); c.lineTo(W*0.19+k*W*0.12, Hh*0.42+r*Hh*0.13); c.stroke(); } },
      R0.x0+0.014, SB+1.45, -212.6, Math.PI/2, false, 200);
    for(const [x,z] of [[65.8,-213.4],[65.2,-213.4],[65.8,-212.8]]){ C(0.27, 0.86, x, SB+0.43, z, "#5a6a4a", 20); C(0.275, 0.03, x, SB+0.30, z, "#4a5a3a", 20); }
    addCol(64.9, R0.x1, R0.z0, -212.5, SB-0.5, SB+0.9); }

  // the door at the end: a heavy steel leaf with a wheel on it in the north wall, LEVEL 3 stencilled over it
  { const x=92.0, zf=-242.0;
    B(1.30, 2.10, 0.06, x, SB+1.05, zf+0.025, "#4a4e50");
    B(1.14, 1.94, 0.03, x, SB+1.05, zf+0.065, "#5a6062");
    for(const dy of [0.5, 1.6]) for(const sd of [-1,1]) B(0.12, 0.22, 0.05, x+sd*0.62, SB+dy, zf+0.075, "#3a3c3e");
    ent(new T.TorusGeometry(0.22, 0.025, 8, 24), x, SB+1.20, zf+0.16, "#8a8d90");
    for(let k=0;k<3;k++) B(0.44, 0.03, 0.03, x, SB+1.20, zf+0.16, "#8a8d90", 0, 0, k*Math.PI/3);
    C(0.04, 0.10, x, SB+1.20, zf+0.11, "#6a6d70", 12, Math.PI/2, 0, 0);
    sign(0.70, 0.16, (c,W,Hh)=>{ c.fillStyle="#4a4e50"; c.fillRect(0,0,W,Hh); say(c, "LEVEL 3 · NO ADMITTANCE", W/2, Hh/2, W*0.86, Hh*0.60, "#d8d2c0", "700", "'Arial Black', Arial"); },
      x, SB+2.25, zf+0.012, 0, false, 360);
    addCol(x-0.66, x+0.66, zf, zf+0.20, SB-0.5, SB+2.3);
    addUse(x, zf+1.0, SB, "TRY THE WHEEL", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("knock", x, zf);
      toast(["IT WON'T TURN. FROM THE OTHER SIDE, THREE KNOCKS","IT WON'T BUDGE. SOMETHING ON THE OTHER SIDE KNOCKS BACK","LOCKED FROM THE OTHER SIDE. YOU HEAR THE WHEEL THERE TURN, A LITTLE, AND STOP"][(Math.random()*3)|0], "#e0c0c0"); }, 1.2); }

  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();
// the drips: now and then, somewhere near, while you are down there
function updateSubbasement(dt){
  if(!SUBBASE.vols.length) return;
  const c=camera.position, v=buriedVolAt(c.x, c.z, c.y);
  if(!v || c.y>SUBBASE.y+SUBBASE.h) return;
  SUBBASE.drip-=dt; if(SUBBASE.drip>0) return;
  SUBBASE.drip=1.4+Math.random()*4.5;
  if(typeof AUDIO!=="undefined") AUDIO.blip("drip", c.x+(Math.random()-0.5)*12, c.z+(Math.random()-0.5)*12);
}
