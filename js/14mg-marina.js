/* REST AREA · 14mg-marina.js
   ----------------------------------------------------------------------
   Hollow Run Marina, down the coast between the pretzel works and the
   beer distributor (EAST.marina, 04): a drive in off Hollow Road through
   the woods, a lot with a few trucks and their trailers, the boathouse
   (rentals, bait, ice: a counter and the one at it, life jackets on
   pegs, rods in a rack, the lake's chart on the wall), a gravel path down
   the bank to the pier, the pier out into the lake with a T at its end,
   pilings, cleats, lamps and the fuel pump, and the rental pontoons tied
   along it. Woods several rows deep close it in, so it is its own place,
   apart from the works and the office park up the shore.

   The pier and the T are LAKESIDE.docks (14n), so a boat taken here can
   be tied up at Lake Street's docks across the lake, and a boat taken
   there can be tied up here. Its pontoons are 14n's (LAKESIDE.pontoon),
   moored by 14p's BOAT.moor, each with its TAKE THIS BOAT.

   PLAN (world): the drive z -1423.5..-1416.5 from Hollow Road to x 864;
   the lot x 862..892, z -1446..-1394 (both paved with Hollow Road, 14mc);
   the boathouse x 894..906, z -1442..-1432; the path along z -1420 down
   to the pier, which runs out from the bank at x 957 to 990, the T across
   its end x 990..992.4, z -1437..-1403.
   ---------------------------------------------------------------------- */
const MARINA={routes:{}, lamps:[], radios:[]};
(function hollowRunMarina(){
  if(typeof EAST==="undefined" || !EAST.marina || typeof LAKESIDE==="undefined" || !LAKESIDE.pontoon) return;
  const Y=EDIN.y, LY=Y+PAVE_T+0.015, MA=EAST.marina, S0=MA.site, WY=LAKESIDE.WY, DY=LAKESIDE.DY, ME=[], CH=[], r=_trng(1988);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const RB=(w,h,d,x,y,z,c,ry,rad,list)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const S=(r0,x,y,z,c,list)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c,0,0,0,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z);
  const shoreX=(z)=>{ let x=930; while(x<S0.x1+60 && Terrain.lakeSD(x, z)>1.5) x+=0.25; return x; };
  const RX=EAST.beer.rx, RW=3.4, MZ=(MA.mouth.z0+MA.mouth.z1)/2;
  const NAVY="#1e3a5a", RED="#a8281e", SIDE="#3a6a7a";

  /* ---- the sign by the road: a board on two posts beyond its ends, read both ways along the road ---- */
  { const x=742.6, z=MA.mouth.z0-3.4, g=gy(x, z), W2=2.6, H2=1.3, top=g+2.5;
    for(const dz of [-W2/2-0.08, W2/2+0.08]){ B(0.12, top+0.1-g, 0.12, x, (top+0.1+g)/2, z+dz, "#5a4a36"); addCol(x-0.07, x+0.07, z+dz-0.07, z+dz+0.07, g-0.5, top); }
    B(0.1, H2+0.08, W2+0.08, x, top-H2/2, z, "#3a2a1a");
    const draw=(c, W, H)=>{ c.fillStyle=NAVY; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a868"; c.lineWidth=6; c.strokeRect(10, 10, W-20, H-20);
      say(c, "HOLLOW RUN MARINA", W/2, H*0.32, W*0.78, H*0.2, "#e8d8a8", "800", "Georgia, serif"); say(c, "BOAT RENTALS · BAIT · ICE · GAS DOCK", W/2, H*0.6, W*0.78, H*0.11, "#d8d0c0", "700", "Arial");
      say(c, "OPEN 7 AM TO DUSK  ·  TURN HERE", W/2, H*0.8, W*0.6, H*0.08, "#c8b898", "600", "Arial"); };
    for(const s of [-1, 1]) sign(W2, H2, draw, x+s*0.065, top-H2/2, z, s<0 ? -Math.PI/2 : Math.PI/2, false, 640); }

  /* ---- the lot: stalls painted along its north and south, the trucks and their boat trailers ---- */
  for(let x=864; x<=890.5; x+=2.7){ stripe(x, -1440+0.3, x, -1434.8, 0.1, WHITE_LINE, LY); if(x>870) stripe(x, -1376-0.3, x, -1381.2, 0.1, WHITE_LINE, LY); }   // (the north row starts past the way in)
  if(typeof parked==="function"){ parked(2, "#5a2a1e", 866.65, -1437.4, Math.PI, LY-PAVE_T); parked(1, "#3a4a5a", 874.75, -1437.4, Math.PI, LY-PAVE_T); parked(0, "#7a6a4a", 882.85, -1378.6, 0, LY-PAVE_T); }
  // (a trailer behind each truck, a small boat on it under its cover)
  for(const [x, z, ry] of [[866.65, -1431.0, Math.PI],[874.75, -1431.0, Math.PI]]){ const g=LY;
    for(const s of [-1, 1]){ B(0.08, 0.1, 4.6, x+s*0.55, g+0.5, z+0.3, "#5a5e62"); C(0.3, 0.18, x+s*0.85, g+0.3, z+1.0, "#1a1a1a", 14, 0, 0, Math.PI/2); }
    B(0.08, 0.08, 1.4, x, g+0.5, z-2.6, "#5a5e62");
    ent(new T.CylinderGeometry(0.75, 0.75, 4.4, 12, 1, false, Math.PI/2, Math.PI), x, g+0.95, z+0.3, x<870 ? "#2a5a7a" : "#8a2a1e", Math.PI/2, 0, 0);
    B(1.5, 0.05, 4.36, x, g+0.96, z+0.3, "#d4ccb8"); addCol(x-0.9, x+0.9, z-3.3, z+2.6, g-0.5, g+1.3); }

  /* ---- the boathouse: board and batten on a slab, a shed roof, the door and windows on the lot side; inside the counter ---- */
  const BX0=894.0, BX1=906.0, BZ0=-1442.0, BZ1=-1432.0, WT=0.2, GB=Math.max(gy(BX0, BZ0), gy(BX1, BZ1), gy(BX0, BZ1), gy(BX1, BZ0)), FL=GB+0.22, EH=FL+3.0, EH2=FL+3.6;
  { wallBox("concrete", BX0-0.06, BX1+0.06, BZ0-0.06, BZ1+0.06, GB-0.6, FL, "#8a867e", 0.6, FL);
    const OPW=[[-1438.6, -1437.6, FL, FL+2.12],[-1441.2, -1439.6, FL+1.0, FL+2.0],[-1435.6, -1433.0, FL+1.0, FL+2.0]];      // (the west side, onto the lot: the door and two windows)
    const OPE=[[-1438.0, -1436.0, FL+1.0, FL+2.0]];                                                                // (the east side: a window down to the water)
    const run=(ax, c0, c1, a, b, y0, y1, ops)=>{ let u=a; const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return;
        ax==="x" ? wallBox("siding", p, q, c0, c1, h0, h1, SIDE, 0.6, FL) : wallBox("siding", c0, c1, p, q, h0, h1, SIDE, 0.6, FL); ax==="x" ? addCol(p, q, c0, c1, h0, h1) : addCol(c0, c1, p, q, h0, h1); };
      for(const o of ops.slice().sort((m, n)=>m[0]-n[0])){ piece(u, o[0], y0, y1); piece(o[0], o[1], y0, o[2]); piece(o[0], o[1], o[3], y1-0.002); u=o[1]; } piece(u, b, y0, y1); };
    run("z", BX0, BX0+WT, BZ0, BZ1, FL-0.15, EH2, OPW); run("z", BX1-WT, BX1, BZ0, BZ1, FL-0.15, EH, OPE);
    run("x", BZ0, BZ0+WT, BX0+WT, BX1-WT, FL-0.15, EH, []); run("x", BZ1-WT, BZ1, BX0+WT, BX1-WT, FL-0.15, EH, []);
    // the side walls' tops up under the shed roof's slope: a slab each, its top sloped
    for(const z0 of [BZ0, BZ1-WT]){ const sh=new T.Shape(); sh.moveTo(BX0+WT, EH); sh.lineTo(BX1-WT, EH); sh.lineTo(BX0+WT, EH2-0.05); sh.lineTo(BX0+WT, EH);
      const g=new T.ExtrudeGeometry(sh, {depth:WT, bevelEnabled:false}); g.translate(0, 0, z0); push("siding", g, 0, 0, 0, 0, SIDE); }
    // the roof: one slope of standing-seam metal down to the water side, overhanging every edge
    { const th=Math.atan((EH2-EH)/(BX1-BX0)), L=(BX1-BX0+1.0)/Math.cos(th); push("metal", boxGeo(L, 0.08, BZ1-BZ0+1.0), (BX0+BX1)/2, (EH+EH2)/2+0.04, (BZ0+BZ1)/2, 0, "#5a1e1a", 0, -th);
      for(let k=0;k<12;k++) ent(boxGeo(L, 0.03, 0.03), (BX0+BX1)/2, (EH+EH2)/2+0.095, BZ0-0.4+k*(BZ1-BZ0+0.8)/11, "#4a1a16", 0, 0, -th); }
    // the trim, the glass, the door
    for(const o of OPW){ for(const zz of [o[0]-0.05, o[1]+0.05]) B(0.03, o[3]-o[2]+0.06, 0.1, BX0-0.015, (o[2]+o[3])/2, zz, "#d4ccb8"); B(0.04, 0.08, o[1]-o[0]+0.2, BX0-0.02, o[3]+0.04, (o[0]+o[1])/2, "#d4ccb8");
      if(o[2]>FL) push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), BX0+0.06, (o[2]+o[3])/2, (o[0]+o[1])/2, Math.PI/2, "#ffffff"); }
    for(const o of OPE) push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), BX1-0.06, (o[2]+o[3])/2, (o[0]+o[1])/2, Math.PI/2, "#ffffff");
    makeDoor(XF(BX0+WT/2, -1437.62, Math.PI/2), 0, FL+0.01, 0, "HOLLOW RUN MARINA", true, 0, "vision", 0x2a4a6a); addFlat(BX0-0.02, BX0+WT+0.02, -1438.6, -1437.6, FL);
    // the step up from the lot, a landing at the door
    push("concrete", boxGeo(1.13, FL-LY+0.3-0.012, 2.0), BX0-0.635, (FL-0.012+LY-0.3)/2, -1438.1, 0, "#8a867e"); addFlat(BX0-1.2, BX0, -1439.1, -1437.1, FL);      // (its top a hair under the slab's, and short of it)
    if(FL-LY>0.25) addRamp(BX0-2.2, BX0-1.2, -1439.1, -1437.1, "x", BX0-2.2, BX0-1.2, LY, FL);
    // the name along the west side, under the eave
    B(0.06, 0.66, 6.2, BX0-0.04, EH2-0.57, (BZ0+BZ1)/2, NAVY);
    sign(6.0, 0.6, (c, W, H)=>{ c.fillStyle=NAVY; c.fillRect(0, 0, W, H); say(c, "HOLLOW RUN MARINA  ·  BOAT RENTALS  ·  BAIT  ·  ICE", W/2, H/2, W*0.84, H*0.5, "#e8d8a8", "700", "Georgia, serif"); },
      BX0-0.08, EH2-0.55, (BZ0+BZ1)/2, -Math.PI/2, false, 1200);
    addZone(BX0, BX1, BZ0, BZ1, FL-0.5, EH, "HOLLOW RUN MARINA · THE BOATHOUSE", true);
    addFlat(BX0+WT, BX1-WT, BZ0+WT, BZ1-WT, FL);
    // inside: the floor, the ceiling, the counter and the till, the bait cooler, life jackets on pegs, rods in a rack, the chart of the lake, a lamp
    { const ft=signTex(128, 128, (c, W, H)=>{ c.fillStyle="#6a5a44"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(0,0,0,0.12)"; for(let k=0;k<8;k++) c.fillRect(0, k*16, W, 1); for(let k=0;k<60;k++) c.fillRect((k*37)%W, (k*53)%H, 6, 1); });
      ft.wrapS=ft.wrapT=T.RepeatWrapping; ft.repeat.set((BX1-BX0)/2, (BZ1-BZ0)/2);
      const m=new T.Mesh(new T.PlaneGeometry(BX1-BX0-2*WT, BZ1-BZ0-2*WT), new T.MeshStandardMaterial({map:ft, roughness:0.7, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.rotation.x=-Math.PI/2; m.position.set((BX0+BX1)/2, FL+0.008, (BZ0+BZ1)/2); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m);
      B(BX1-BX0-2*WT, 0.04, BZ1-BZ0-2*WT, (BX0+BX1)/2, EH-0.05, (BZ0+BZ1)/2, "#8a7a62"); }
    { const cx=899.6; RB(0.7, 1.0, 4.0, cx, FL+0.5, -1438.6, "#5a3a24", 0, 0.02); RB(0.82, 0.05, 4.1, cx, FL+1.03, -1438.6, "#8a6a44", 0, 0.01); addCol(cx-0.35, cx+0.35, -1440.6, -1436.6, FL-0.05, FL+1.06);
      RB(0.4, 0.22, 0.36, cx, FL+1.17, -1437.4, "#2a2a2e", 0, 0.02); for(let k=0;k<5;k++) B(0.08, 0.1, 0.06, cx-0.05, FL+1.1, -1439.6+k*0.15, ["#c8281a","#2a6a3a","#d8a82a"][k%3]);
      addUse(cx-0.6, -1438.6, FL, "E  ·  RENT A BOAT", ()=>toast("A PONTOON IS FORTY-FIVE DOLLARS THE AFTERNOON. THE KEYS ARE IN THEM: TAKE ANY ONE OFF THE PIER. TIE IT UP AT ANY DOCK ON THE LAKE", "#e8d8a8"), 1.4); }
    { const x=BX1-WT-0.45, z=-1440.6; RB(0.85, 1.0, 1.1, x, FL+0.5, z, "#d4ccb8", 0, 0.03); B(0.8, 0.02, 1.0, x, FL+1.01, z, "#2a2a2e");
      sign(0.7, 0.2, (c, W, H)=>{ c.fillStyle="#1e5a7a"; c.fillRect(0, 0, W, H); say(c, "LIVE BAIT", W/2, H/2, W*0.8, H*0.6, "#f2e8c8", "800", "Arial"); }, x-0.43, FL+0.75, z, -Math.PI/2, false, 140);
      addCol(x-0.43, x+0.43, z-0.55, z+0.55, FL-0.05, FL+1.02); }
    for(let k=0;k<6;k++){ const z=BZ1-WT-0.4-k*0.7; C(0.012, 0.15, BX1-WT-0.1, FL+1.85, z, "#8a8e92", 6, 0, 0, Math.PI/2); RB(0.4, 0.55, 0.1, BX1-WT-0.17, FL+1.5, z, ["#e8762a","#c8281a","#e8c03a"][k%3], Math.PI/2, 0.03); }
    { const z=BZ0+WT+0.15; B(2.4, 0.06, 0.2, 902.0, FL+0.4, z+0.05, "#5a3a24"); B(2.4, 0.06, 0.2, 902.0, FL+1.5, z+0.05, "#5a3a24");
      for(let k=0;k<10;k++) C(0.008, 2.0, 901.0+k*0.22, FL+1.15, z+0.05, ["#2a2a2a","#8a6a3a","#3a5a8a"][k%3], 6, 0.06, 0, 0); }
    sign(1.4, 1.0, (c, W, H)=>{ c.fillStyle="#c8d8d0"; c.fillRect(0, 0, W, H); c.fillStyle="#8ab0c8"; c.beginPath(); c.ellipse(W*0.56, H*0.5, W*0.36, H*0.38, 0.2, 0, 7); c.fill();
        c.strokeStyle="#5a7a9a"; c.lineWidth=1; for(let k=1;k<5;k++){ c.beginPath(); c.ellipse(W*0.56, H*0.5, W*0.36*k/5, H*0.38*k/5, 0.2, 0, 7); c.stroke(); }
        c.fillStyle="#2a2a2a"; c.font="bold 13px Georgia"; c.fillText("THE LAKE", W*0.46, H*0.5); c.fillStyle="#c8281a"; c.beginPath(); c.arc(W*0.24, H*0.42, 5, 0, 7); c.fill(); c.fillStyle="#2a2a2a"; c.font="10px Georgia"; c.fillText("YOU ARE HERE", W*0.08, H*0.34); },
      898.2, FL+1.7, BZ1-WT-0.02, Math.PI, false, 240);
    B(1.5, 1.1, 0.02, 898.2, FL+1.7, BZ1-WT-0.008, "#3a2a1a");
    LAMPS.push({x:900, y:EH-0.3, z:-1437, color:0xffe8c8, intensity:0.7, dist:8, decay:1.6, indoor:true}); B(1.2, 0.06, 0.3, 900, EH-0.12, -1437, "#d8ccb0");
    // outside: the ice chest and the pop machine by the door, a picnic table and a grill on the grass
    { const x=BX0-0.6, z=-1434.2; RB(1.1, 1.0, 0.7, x, LY+0.5, z, "#d4ccb8", Math.PI/2, 0.04); sign(0.8, 0.3, (c, W, H)=>{ c.fillStyle="#2a6aa8"; c.fillRect(0, 0, W, H); say(c, "ICE", W/2, H/2, W*0.6, H*0.62, "#f2f0e4", "800", "Arial"); }, x-0.36, LY+0.75, z, -Math.PI/2, false, 160);
      addCol(x-0.36, x+0.36, z-0.56, z+0.56, LY-0.5, LY+1.0); }
    { const x=BX0-0.5, z=-1441.0; RB(0.8, 1.85, 0.75, x, LY+0.925, z, "#a8281e", Math.PI/2, 0.03); push("lk_tvon", planeGeo(0.5, 1.0, 0), x-0.385, LY+1.15, z, -Math.PI/2, "#ffffff"); addCol(x-0.38, x+0.38, z-0.41, z+0.41, LY-0.5, LY+1.85); } }

  /* ---- the path down the bank to the pier: gravel laid on the ground as it falls ---- */
  const PZ0=-1421.2, PZ1=-1418.8, PX0=892.0, PX1=957.8;
  { const n=Math.round(PX1-PX0), P=[], I=[];
    for(let k=0;k<=n;k++){ const x=PX0+(PX1-PX0)*k/n; for(const z of [PZ0-0.2, PZ1+0.2]) P.push(x, gy(x, z)+0.03, z); }
    for(let k=0;k<n;k++){ const a=k*2; I.push(a, a+1, a+2, a+1, a+3, a+2); }
    const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setIndex(I);
    const U=[]; for(let i=0;i<P.length/3;i++) U.push(P[i*3]*0.5, P[i*3+2]*0.5); g.setAttribute("uv", new T.Float32BufferAttribute(U, 2)); g.computeVertexNormals();
    push("gravelbed", g, 0, 0, 0, 0, "#8a8478"); }

  /* ---- the pier: out from the bank, the T across its end; boards on stringers, pilings, cleats, lamps, the fuel pump; its edges a rail
     you cannot walk off. Both are LAKESIDE.docks, so a boat ties up along any edge of them ---- */
  const PIER=[PX1-0.8, 990.0, PZ0, PZ1], TEE=[990.0, 992.4, -1437.0, -1403.0];
  const deck=(x0, x1, z0, z1)=>{ LAKESIDE.docks.push({x0:x0, x1:x1, z0:z0, z1:z1, y:DY}); addFlat(x0, x1, z0, z1, DY);
    const along=(x1-x0)>(z1-z0), n=Math.floor((along ? x1-x0 : z1-z0)/0.16);
    for(let k=0;k<n;k++){ const t=(k+0.5)/n; along ? B(0.145, 0.05, z1-z0, x0+(x1-x0)*t, DY-0.025, (z0+z1)/2, k%4 ? "#8a7a62" : "#7e6e58") : B(x1-x0, 0.05, 0.145, (x0+x1)/2, DY-0.025, z0+(z1-z0)*t, k%4 ? "#8a7a62" : "#7e6e58"); }
    for(const s of [0, 1]) along ? B(x1-x0, 0.2, 0.08, (x0+x1)/2, DY-0.15, s ? z1+0.04 : z0-0.04, "#5a4a36") : B(0.08, 0.2, z1-z0, s ? x1+0.04 : x0-0.04, DY-0.15, (z0+z1)/2, "#5a4a36"); };
  deck(...PIER); deck(...TEE);
  const piling=(x, z)=>{ const bed=Math.min(gy(x, z), WY-0.5); C(0.12, DY+0.6-bed, x, (DY+0.6+bed)/2, z, "#5a4a36", 12); C(0.13, 0.04, x, DY+0.62, z, "#4a3a2a", 12); addCol(x-0.13, x+0.13, z-0.13, z+0.13, DY-1.2, DY+0.62); };
  for(let x=PIER[0]+1.5; x<PIER[1]; x+=4.0) for(const z of [PZ0-0.16, PZ1+0.16]) piling(x, z);
  for(let z=TEE[2]; z<=TEE[3]+0.01; z+=4.25) for(const x of [TEE[0]-0.16, TEE[1]+0.16]) if(Math.abs(z-(PZ0+PZ1)/2)>2) piling(x, z);
  const cleat=(x, z, ry)=>{ B(0.3, 0.04, 0.06, x, DY+0.06, z, "#8a8d90", ry, CH); for(const sd of [-1, 1]) B(0.05, 0.05, 0.05, x+Math.cos(ry)*sd*0.08, DY+0.025, z-Math.sin(ry)*sd*0.08, "#8a8d90", ry, CH); };
  for(let x=PIER[0]+4; x<PIER[1]-1; x+=3.6) for(const z of [PZ0+0.12, PZ1-0.12]) cleat(x, z, 0);
  for(let z=TEE[2]+1.5; z<TEE[3]-1; z+=3.6) cleat(TEE[1]-0.12, z, Math.PI/2);
  // the rail along every edge: low posts and a rope between, colliders the length of it (a boat comes alongside and you board it with E)
  { const rail=(x0, z0, x1, z1)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/2.0)), along=Math.abs(x1-x0)>Math.abs(z1-z0);
      for(let k=0;k<=n;k++){ const x=x0+(x1-x0)*k/n, z=z0+(z1-z0)*k/n; B(0.08, 0.9, 0.08, x, DY+0.45, z, "#6a5a44"); }
      along ? B(L, 0.04, 0.04, (x0+x1)/2, DY+0.85, z0, "#c8b898") : B(0.04, 0.04, L, x0, DY+0.85, (z0+z1)/2, "#c8b898");
      along ? addCol(Math.min(x0, x1), Math.max(x0, x1), z0-0.07, z0+0.07, DY-1.2, DY+0.9) : addCol(x0-0.07, x0+0.07, Math.min(z0, z1), Math.max(z0, z1), DY-1.2, DY+0.9); };
    rail(PIER[0]+1.4, PZ0+0.04, TEE[0]+0.04, PZ0+0.04); rail(PIER[0]+1.4, PZ1-0.04, TEE[0]+0.04, PZ1-0.04);
    rail(TEE[0]+0.04, TEE[2]+0.04, TEE[1]-0.04, TEE[2]+0.04); rail(TEE[0]+0.04, TEE[3]-0.04, TEE[1]-0.04, TEE[3]-0.04);
    rail(TEE[1]-0.04, TEE[2]+0.04, TEE[1]-0.04, TEE[3]-0.04);
    rail(TEE[0]+0.04, TEE[2]+0.04, TEE[0]+0.04, PZ0-0.02); rail(TEE[0]+0.04, PZ1+0.02, TEE[0]+0.04, TEE[3]-0.04); }
  // lamps on posts along the pier, lit after dark; a life ring; the fuel pump on the T, its hose; a bench at the end
  for(const [x, z] of [[966, PZ1-0.2],[978, PZ0+0.2],[992.15, -1430],[992.15, -1410]]){ C(0.05, 2.2, x, DY+1.1, z, "#2a2a2e", 8); RB(0.22, 0.28, 0.22, x, DY+2.3, z, "#2a2a2e", 0, 0.04);
    push("rn_glow", new T.SphereGeometry(0.09, 10, 8), x, DY+2.12, z, 0, "#ffffff"); addCol(x-0.07, x+0.07, z-0.07, z+0.07, DY-0.5, DY+2.3);
    const L={x:x, y:DY+2.0, z:z, color:0xffd8a0, intensity:0, dist:10, decay:1.6, mothy:true}; LAMPS.push(L); MARINA.lamps.push(L); }
  { const x=972, z=PZ1-0.14; B(0.06, 0.6, 0.06, x, DY+0.3, z, "#6a5a44"); ent(new T.TorusGeometry(0.3, 0.07, 8, 20), x, DY+0.8, z+0.04, "#e8762a"); }
  { const x=992.0, z=-1424; RB(0.6, 1.4, 0.45, x, DY+0.7, z, "#c8281a", Math.PI/2, 0.04); B(0.4, 0.3, 0.02, x-0.235, DY+1.1, z, "#1a1a1a", Math.PI/2);
    sign(0.36, 0.12, (c, W, H)=>{ c.fillStyle="#f2e8c8"; c.fillRect(0, 0, W, H); say(c, "MARINE GAS", W/2, H/2, W*0.8, H*0.6, "#c8281a", "800", "Arial"); }, x-0.24, DY+1.32, z, -Math.PI/2, false, 120);
    C(0.025, 0.9, x+0.0, DY+0.65, z+0.32, "#1a1a1a", 6, 0.5, 0, 0); addCol(x-0.3, x+0.3, z-0.25, z+0.25, DY-0.5, DY+1.4); }
  { const x=TEE[0]+0.7, z=-1434.5; B(0.42, 0.06, 1.6, x, DY+0.45, z, "#8a7a62"); B(0.06, 0.4, 1.6, x-0.2, DY+0.7, z, "#8a7a62"); for(const dz of [-0.7, 0.7]) B(0.4, 0.42, 0.06, x, DY+0.21, z+dz, "#5a4a36");
    addCol(x-0.25, x+0.25, z-0.8, z+0.8, DY-0.5, DY+0.9); for(const dz of [-0.35, 0.35]) addSeat(x, z+dz, DY, -Math.PI/2, "A BENCH ON THE PIER, LOOKING OUT"); }
  addZone(PIER[0], TEE[1], TEE[2], TEE[3], WY-1, WY+6, "HOLLOW RUN MARINA · THE PIER");

  /* ---- the rental pontoons, tied along the pier and the T (14n's, moored by 14p: TAKE THIS BOAT) ---- */
  { const SEATS=["#2a4a6a","#7a2a2a","#2a6a5a","#6a5a2a"], put=(x, z, ry, k)=>{ const n=LAKESIDE.boats.length; LAKESIDE.pontoon(x, z, ry, SEATS[k%4]); const Sb=LAKESIDE.boats[n];
      if(Sb && typeof BOAT!=="undefined" && BOAT.moor) BOAT.moor(Sb); };
    put(968.5, PZ0-1.52, Math.PI/2, 0); put(980.5, PZ0-1.52, Math.PI/2, 1); put(974.0, PZ1+1.52, Math.PI/2, 2);
    put(TEE[1]+1.52, -1431.0, 0, 3); put(TEE[1]+1.52, -1409.0, Math.PI, 0); }

  /* ---- the shore: a launch ramp of concrete down into the water, kayaks on a rack, a bench looking out ---- */
  { const z0=-1440.0, z1=-1436.0, xa=shoreX(-1438)-6, xb=shoreX(-1438)+3, ya=gy(xa, -1438)+0.02, yb=WY-0.4, L=Math.hypot(xb-xa, ya-yb), th=Math.atan2(ya-yb, xb-xa);
    push("concrete", boxGeo(L, 0.2, z1-z0), (xa+xb)/2, (ya+yb)/2-0.1, (z0+z1)/2, 0, "#8a867e", 0, -th); }
  { const x=946.0, z=-1446.0, g=gy(x, z); for(const dx of [-1.2, 1.2]){ B(0.08, 1.4, 0.08, x+dx, g+0.7, z-0.5, "#5a4a36"); B(0.08, 1.4, 0.08, x+dx, g+0.7, z+0.5, "#5a4a36"); }
    for(const y of [0.5, 1.1]) for(const dz of [-0.5, 0.5]) B(2.5, 0.06, 0.06, x, g+y, z+dz, "#5a4a36");
    for(let k=0;k<4;k++){ const y=g+0.58+((k/2)|0)*0.6, dx=(k%2)*0.0; ent(new T.SphereGeometry(0.3, 12, 8).scale(5.4, 0.55, 1), x, y+0.2, z+(k%2 ? 0.25 : -0.25), ["#e8762a","#c8281a","#2a8ab8","#e8c03a"][k]); }
    addCol(x-1.7, x+1.7, z-0.6, z+0.6, g-0.5, g+1.5); }
  { const x=950.0, z=-1405.0, g=gy(x, z); B(0.46, 0.06, 1.8, x, g+0.45, z, "#8a6a4a"); B(0.06, 0.4, 1.8, x-0.22, g+0.7, z, "#8a6a4a"); for(const dz of [-0.75, 0.75]) B(0.42, 0.42, 0.06, x, g+0.21, z+dz, "#2a2a2e");
    addCol(x-0.26, x+0.26, z-0.9, z+0.9, g-0.5, g+0.9); for(const dz of [-0.45, 0.45]) addSeat(x, z+dz, g, -Math.PI/2, "A BENCH LOOKING OUT OVER THE MARINA"); }

  /* ---- the walls of the world round it, the bank a step short of the water (open where the pier goes out), the zones ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300), DR=MA.drive;
    W(S0.x0-0.4, S0.x0+0.4, S0.z0, DR.z0); W(S0.x0-0.4, S0.x0+0.4, DR.z1, S0.z1);
    W(DR.x0, S0.x0+0.4, DR.z0-0.4, DR.z0+0.4); W(DR.x0, S0.x0+0.4, DR.z1-0.4, DR.z1+0.4);
    W(S0.x0, shoreX(S0.z0)+0.4, S0.z0-0.4, S0.z0+0.4); W(S0.x0, shoreX(S0.z1)+0.4, S0.z1-0.4, S0.z1+0.4);
    const BANK="THE BANK DROPS STRAIGHT INTO THE LAKE HERE";
    for(let z=S0.z0; z<S0.z1-0.01; z+=1){ const z2=Math.min(S0.z1, z+1); if(z2>PZ0-0.3 && z<PZ1+0.3) continue; const a=shoreX(z), b=shoreX(z2); W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, z, z2).msg=BANK; }
    addZone(S0.x0, S0.x1+40, S0.z0, S0.z1, Y-6, Y+20, "HOLLOW RUN MARINA"); addZone(DR.x0, DR.x1, DR.z0, DR.z1, Y-4, Y+12, "HOLLOW RUN MARINA · THE DRIVE"); }

  /* ---- the woods: several rows deep round the marina's north, south and west, and both sides of the drive; a few in the open ---- */
  if(typeof FOREST!=="undefined"){ const q=_trng(1990), DR=MA.drive;
    const tree=(sp, x, z, s)=>{ if(Terrain.lakeSD(x, z)<3.5) return; FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, g=gy(x, z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const row=(x0, z0, x1, z1, nx, nz)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/6.2));
      for(let k=0;k<=n;k++) for(const dep of [1.8, 6.5, 11.5, 16.5]){ if(q()<0.12) continue; const t=(k+q()*0.6)/n, x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(dep<2 ? "edge" : q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard", x, z, 0.85+q()*0.4); } };
    row(S0.x0, S0.z0, S0.x1+30, S0.z0, 0, -1); row(S0.x0, S0.z1, S0.x1+40, S0.z1, 0, 1);                // (between it and the pretzel works, and toward the beer distributor)
    row(S0.x0, S0.z0, S0.x0, DR.z0, -1, 0); row(S0.x0, DR.z1, S0.x0, S0.z1, -1, 0);
    row(DR.x0+12, DR.z0, DR.x1, DR.z0, 0, -1); row(DR.x0+12, DR.z1, DR.x1, DR.z1, 0, 1);
    for(const [x, z] of [[868, -1455],[880, -1462],[896, -1455],[912, -1462],[882, -1371],[900, -1380],[915, -1365],[925, -1450],[932, -1390],[918, -1408]]) tree(q()<0.6 ? "lawn" : "edge", x, z, 0.85+q()*0.3);
    for(const [x, z] of [[893.4, -1430.4],[893.4, -1443.6],[907, -1444]]) FOREST.plant("shrub", x, z, {scale:0.9, solid:false}); }

  /* ---- the people: the one at the counter, a man fishing off the T, a couple at the bench ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("hollow run marina", 930, -1420, 110);
    const L=(o)=>Object.assign({h:1.0, skin:SKINS[(r()*5)|0], hair:HAIRS[(r()*6)|0], shirt:"#5a5a5a", pants:"#2a2e3a", shoes:"#2a2a2a"}, o);
    crowdAdd(G, {look:L({shirt:"#1e3a5a", cap:"#1e3a5a"}), x:900.4, z:-1438.4, y:FL, yaw:-Math.PI/2, mode:"stand", sway:0.4, dayOnly:true});
    crowdAdd(G, {look:L({shirt:"#7a8a5a", pants:"#5c5a52", cap:"#7a6a3a", beard:"#6b4a2b"}), x:TEE[1]-0.5, z:-1418.0, y:DY, yaw:Math.PI/2, mode:"stand", job:"fish", held:"rod", sway:0.2});
    { const g=gy(950.0, -1405.45); crowdAdd(G, {look:L({female:true, shirt:"#c88a5a"}), x:950.0, z:-1405.45, y:g, yaw:Math.PI/2, mode:"sit", sitY:0.515, sway:0.3, held:"cup", drink:true}); } }

  /* ---- what is built ---- */
  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.05}), "hollow-run-marina", true);
  detailMesh(CH, new T.MeshStandardMaterial({vertexColors:true, roughness:0.3, metalness:0.75}), "hollow-run-marina-metal", true);

  /* ---- the ways round it, for tools/walk.js ---- */
  MARINA.routes={
    "hollow run marina: in off Hollow Road, down the drive to the lot":[[733.5, -1400.0],[733.5, -1383.0],[745.0, -1383.0],[800.0, -1383.0],[862.0, -1383.0],[878.0, -1390.0],[878.0, -1420.0]],
    "hollow run marina: into the boathouse, to the counter":[[878.0, -1438.1],[890.0, -1438.1],[893.0, -1438.1],[894.6, -1438.1],[896.5, -1438.1],[898.6, -1438.6]],
    "hollow run marina: down the path to the end of the pier":[[890.0, -1420.0],[910.0, -1420.0],[935.0, -1420.0],[955.0, -1420.0],[958.5, -1420.0],[970.0, -1420.0],[989.0, -1420.0],[991.2, -1420.0],[991.2, -1428.0]],
    "hollow run marina: along the T":[[991.2, -1404.2],[991.2, -1420.0],[991.2, -1432.6]]};
  MARINA.FL=FL; MARINA.DY=DY;
})();
/* the lamps on the pier come on after dark */
function updateMarina(dt, dark){ for(const L of MARINA.lamps) L.intensity=0.8*smoothstep(0.3, 0.6, dark); }
