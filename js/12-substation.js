"use strict";
/* REST AREA · 12-substation.js
   the service drive, and the fenced compound in the woods at the end of it:
   the generator house, two standby sets, the transformer, the pole line
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12 · THE SUBSTATION
   A rest area is a small town that has to keep its own lights on: a
   service drive off the back of the car lot runs east into the trees and
   climbs a couple of metres to a fenced compound — crushed stone, a block
   generator house, two diesel standby sets in their sound enclosures, a
   pad-mounted transformer, a fuel tank, a sodium flood on a pole, and the
   utility's line coming in on wooden poles down a cut through the woods.

   PLAN (world): compound x 60..90, z -184..-154, at y = SITE.sub.y.
     GATE     west fence, z -170.5..-167.5, two leaves, swinging in
     HOUSE    x 77..87, z -182..-176, door south at x 79.5..80.46
     GEN A/B  x 69.5..74.5 at z -160.5 and -166.0
     XFMR     x 83..85, z -165..-163
     TANK     x 82..86, z -159..-157
   LANE: the gate to the house door, kept clear.
   ---------------------------------------------------------------------- */
bucketOf("chainlink", ()=>new T.MeshStandardMaterial({map:TEX.chain, alphaTest:0.5, side:T.DoubleSide,
                          roughness:0.5, metalness:0.4}));
bucketOf("roofmetal", ()=>new T.MeshStandardMaterial({map:TEX.galv, roughness:0.5, metalness:0.45}));
bucketOf("pole",      ()=>new T.MeshStandardMaterial({map:TEX.wood, roughness:0.95}));
const SUB_Y=SITE.sub.y, SUB_G=SUB_Y+PAVE_T;   // the stone's surface
const GATE={x:60, z0:-170.47, z1:-167.53};
const GEN_POS=[];                                   // where the hum comes from (20-audio)

/* ---- the drive ----------------------------------------------------------- */
(function drive(){
  layRibbon("asphalt", DRIVE, -2.6, 2.6, PAVE_T, 0.40, "#8c8c88");
  addPaveRibbon(DRIVE, -2.6, 2.6);
  // patched where the plough caught it, and the edges gone to gravel
  layRibbon("gravelbed", DRIVE, -3.4, -2.5, PAVE_T-0.002, 0.6, "#9a968c");
  layRibbon("gravelbed", DRIVE, 2.5, 3.4, PAVE_T-0.002, 0.6, "#9a968c");
  addZone(-28, 60, -175, -132, -2, 8, "SERVICE DRIVE");
  // the yellow pipe gate at the bottom of it, swung open and chained back
  const gx=-16, gz=-148.6;
  for(const dz of [0, 4.6]) cyl("paintm", 0.07,0.07,1.1,10, gx, 0.55, gz+dz*0+(dz?0:0), "#d9a922");
  cyl("paintm", 0.07,0.07,1.1,10, gx+4.4, 0.55, gz-1.3, "#d9a922");
  push("paintm", new T.CylinderGeometry(0.045,0.045,4.6,10), gx+2.2, 0.98, gz-0.65, Math.atan2(4.4,-1.3), "#d9a922", 0, Math.PI/2);
  addCol(gx-0.1,gx+0.1,gz-0.1,gz+0.1,-1,1.1);
  const sign=signTex(300,220,(c,W,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H);
    c.strokeStyle="#1a1a1a"; c.lineWidth=8; c.strokeRect(6,6,W-12,H-12); c.fillStyle="#1a1a1a";
    fitHwy(c,"AUTHORIZED",W*0.8,H*0.22,W/2,H*0.30); fitHwy(c,"VEHICLES",W*0.8,H*0.22,W/2,H*0.53);
    fitHwy(c,"ONLY",W*0.6,H*0.22,W/2,H*0.76); });
  bx("metal",0.06,2.2,0.06, -21, 1.1, -146.2, 0.5, 0, "#a3a8aa");
  signPanel(0.6,0.44,sign, -21, 1.9, -146.16, 0);
  addCol(-21.1,-20.9,-146.3,-146.1,-1,2.3);
})();

/* ---- the compound -------------------------------------------------------- */
(function compound(){
  const S=SITE.sub, Y=SUB_Y;
  push("gravelbed", planeGeo(S.x1-S.x0+3, S.z1-S.z0+3, 0.5), (S.x0+S.x1)/2, Y+PAVE_T, (S.z0+S.z1)/2, 0,
       "#b2aea4", -Math.PI/2, 0);
  addPaveRect(S.x0-1.5, S.x1+1.5, S.z0-1.5, S.z1+1.5, Y);
  addZone(S.x0, S.x1, S.z0, S.z1, Y-2, Y+8, "THE SUBSTATION");

  /* the fence: 2.1 m of chain-link on galvanised posts every three metres,
     a top rail, and three strands of barbed wire canted out on arms. */
  const FH=2.1;
  const fenceRun=(x0,z0,x1,z1)=>{
    const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/3)), ry=Math.atan2(x1-x0, z1-z0);
    const dx=(x1-x0)/L, dz=(z1-z0)/L, ox=dz, oz=-dx;              // outward is to the left of travel
    for(let k=0;k<=n;k++){
      const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, corner=(k===0||k===n);
      cyl("metal", corner?0.05:0.035, corner?0.05:0.035, FH+0.4, 8, px, Y+FH/2-0.15, pz, "#a7adb0");
      push("metal", boxGeo(0.04,0.04,0.55,0), px+ox*0.18, Y+FH+0.18, pz+oz*0.18, ry+Math.PI/2, "#a7adb0", 0.78, 0);
    }
    const g=planeGeo(L, FH-0.05, 3.2);
    push("chainlink", g, (x0+x1)/2, Y+(FH-0.05)/2+0.03, (z0+z1)/2, ry+Math.PI/2, "#ffffff");
    tube("metal", V3(x0,Y+FH,z0), V3(x1,Y+FH,z1), 0.024, 8, "#a7adb0");
    tube("metal", V3(x0,Y+0.06,z0), V3(x1,Y+0.06,z1), 0.006, 4, "#8a9092");
    for(let s=0;s<3;s++){
      const h=Y+FH+0.12+s*0.14, o=0.10+s*0.13;
      tube("paintm", V3(x0+ox*o,h,z0+oz*o), V3(x1+ox*o,h,z1+oz*o), 0.006, 4, "#5c6062");
    }
    addCol(Math.min(x0,x1)-0.06, Math.max(x0,x1)+0.06, Math.min(z0,z1)-0.06, Math.max(z0,z1)+0.06, Y-0.5, Y+FH+0.5);
  };
  // corners run clockwise seen from above (x east, z south), so "left" is out
  fenceRun(S.x0, S.z1, S.x0, GATE.z1);                    // west, south of the gate
  fenceRun(S.x0, GATE.z0, S.x0, S.z0);                    // west, north of it
  fenceRun(S.x0, S.z0, S.x1, S.z0);                       // north
  fenceRun(S.x1, S.z0, S.x1, S.z1);                       // east
  fenceRun(S.x1, S.z1, S.x0, S.z1);                       // south
  // gate posts, heavier, and the two leaves
  for(const z of [GATE.z0, GATE.z1]) cyl("metal", 0.06,0.06, FH+0.5, 10, GATE.x, Y+FH/2, z, "#a7adb0");
  const gA=makeDoor(XF(GATE.x, GATE.z0+0.02, -Math.PI/2), 0, SUB_G+0.05, 0, "THE GATE", false, 0, "gate");
  const gB=makeDoor(XF(GATE.x, GATE.z1-0.02,  Math.PI/2), 0, SUB_G+0.05, 0, "THE GATE", true, 0, "gate");
  // it is a padlocked gate, not an automatic door: it opens when you open
  // it and stays as you leave it, and while it is shut it is solid
  const gc={x0:GATE.x-0.12, x1:GATE.x+0.12, z0:GATE.z0, z1:GATE.z1, y0:SUB_G, y1:SUB_G+2.3};
  COL_DYN.push(gc);
  for(const d of [DOORS[DOORS.length-2], DOORS[DOORS.length-1]]){ d.manualOnly=true; d.sticky=true; d.blockCol=gc; d.blockTop=SUB_G+2.3; }
  DOORS[DOORS.length-2].partner=DOORS[DOORS.length-1]; DOORS[DOORS.length-1].partner=DOORS[DOORS.length-2];
  // what is wired to the gate
  const warn=signTex(360,240,(c,W,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H);
    c.fillStyle="#c8102e"; rrect(c,W*0.06,H*0.06,W*0.88,H*0.30,10); c.fill();
    c.fillStyle="#f2f0e8"; fitHwy(c,"DANGER",W*0.7,H*0.22,W/2,H*0.21);
    c.fillStyle="#1a1a1a"; fitHwy(c,"HIGH VOLTAGE",W*0.84,H*0.16,W/2,H*0.52);
    fitHwy(c,"KEEP OUT",W*0.6,H*0.14,W/2,H*0.74); fitText(c,"Authorized personnel only",W*0.8,H*0.08,W/2,H*0.90,"500"); });
  signPanel(0.54,0.36,warn, GATE.x-0.06, SUB_G+1.35, -169.0-0.75, -Math.PI/2);
  signPanel(0.54,0.36,warn, S.x0+12, SUB_G+1.3, S.z1+0.05, 0);
  signPanel(0.54,0.36,warn, S.x0+12, SUB_G+1.3, S.z0-0.05, Math.PI);

  /* ---- the generator house --------------------------------------------- */
  const H={x0:77, x1:87, z0:-182, z1:-176, h:3.4}, FY=SUB_G+0.15, T2=0.25;
  const DR={a:79.5, b:80.46, sill:FY-0.6, head:FY+2.14};
  bx("concrete", H.x1-H.x0+0.4, 0.4, H.z1-H.z0+0.4, (H.x0+H.x1)/2, FY-0.2, (H.z0+H.z1)/2, 0.5, 0, "#a9a59c");
  addFlat(H.x0-0.25, H.x1+0.25, H.z0-0.25, H.z1+0.25, FY);
  const blockC="#cbbfa6";
  runX("block", H.z1-T2/2, T2, H.x0, H.x1, FY-0.6, FY+H.h, [DR], blockC, 0.6);
  runX("block", H.z0+T2/2, T2, H.x0, H.x1, FY-0.6, FY+H.h, [], blockC, 0.6);
  runZ("block", H.x0+T2/2, T2, H.z0, H.z1, FY-0.6, FY+H.h, [], blockC, 0.6);
  const LV={a:-180.2, b:-178.0, sill:FY+1.2, head:FY+2.4};
  runZ("block", H.x1-T2/2, T2, H.z0, H.z1, FY-0.6, FY+H.h, [LV], blockC, 0.6);
  // the louvre in the east wall, and the hood over it
  for(let k=0;k<8;k++) push("paintm", boxGeo(0.06,0.04,2.2,0), H.x1-0.12, LV.sill+0.08+k*0.15, (LV.a+LV.b)/2, 0, "#8a8576", 0, 0.6);
  bx("paintm", 0.30, 0.05, 2.4, H.x1+0.12, LV.head+0.05, (LV.a+LV.b)/2, 0, 0, "#8a8576");
  // a low-slope standing-seam roof, falling to the north
  const rg=new FaceGeo().slab([V3(H.x0-0.4,FY+H.h+0.32,H.z1+0.4), V3(H.x1+0.4,FY+H.h+0.32,H.z1+0.4),
                               V3(H.x1+0.4,FY+H.h+0.05,H.z0-0.4), V3(H.x0-0.4,FY+H.h+0.05,H.z0-0.4)], 0.12, 0.8).geo();
  push("roofmetal", rg, 0,0,0, 0, "#9ea3a3");
  for(const sg of [1]) bx("paintm", H.x1-H.x0+0.9, 0.12, 0.08, (H.x0+H.x1)/2, FY+H.h+0.26, H.z1+0.42, 0, 0, "#7d8282");
  // the door, the light over it, the signs on it
  frameX(H.z1-T2/2, T2, DR.a, DR.b, DR.head, "#6e7474");
  makeDoor(XF(DR.a+0.0, H.z1-T2/2, 0), 0, FY+0.02, 0, "GENERATOR HOUSE", true, 0, "steel");
  bx("paintm", 0.30, 0.18, 0.18, (DR.a+DR.b)/2, DR.head+0.45, H.z1+0.09, 0, 0, "#2c2c2a");
  push("lamplens", boxGeo(0.22,0.02,0.10,0), (DR.a+DR.b)/2, DR.head+0.355, H.z1+0.12, 0, "#ffffff");
  LAMPS.push({x:(DR.a+DR.b)/2, y:DR.head+0.2, z:H.z1+0.5, color:0xffd29a, intensity:0.7, dist:9, decay:1.6, mothy:true});
  const auth=signTex(300,200,(c,W,H2)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H2); c.fillStyle="#f2b418";
    c.fillRect(0,0,W,H2*0.34); c.fillStyle="#1a1a1a"; fitHwy(c,"NOTICE",W*0.6,H2*0.24,W/2,H2*0.17);
    fitText(c,"AUTHORIZED",W*0.8,H2*0.18,W/2,H2*0.52,"700"); fitText(c,"PERSONNEL ONLY",W*0.8,H2*0.18,W/2,H2*0.78,"700"); });
  signPanel(0.45,0.30,auth, 81.4, FY+1.55, H.z1+0.01, 0);
  addZone(H.x0, H.x1, H.z0, H.z1, FY-0.5, FY+H.h, "GENERATOR HOUSE", true);
  // inside: concrete floor, the switchgear along the back wall, the transfer
  // switch with its lamps, a battery charger, a logbook on a shelf
  floorAt("concrete", H.x0+T2, H.x1-T2, H.z0+T2, H.z1-T2, FY+0.004, "#bdb8ae", 0.6);
  ceilAt("plaster", H.x0+T2, H.x1-T2, H.z0+T2, H.z1-T2, FY+3.0, "#d8d6cf", 0.5);
  for(const [f,dir,a,b] of [[H.z1-T2,-1,H.x0+T2,H.x1-T2],[H.z0+T2,1,H.x0+T2,H.x1-T2]])
    lineX("block", f, dir, a, b, FY, FY+3.0, f===H.z1-T2?[DR]:[], "#dcd8cc", 0.6);
  for(const [f,dir] of [[H.x0+T2,1],[H.x1-T2,-1]])
    lineZ("block", f, dir, H.z0+T2, H.z1-T2, FY, FY+3.0, f===H.x1-T2?[LV]:[], "#dcd8cc", 0.6);
  for(let k=0;k<6;k++){
    const x=78.0+k*0.92;
    bx("paintm", 0.88, 2.20, 0.80, x, FY+1.10, H.z0+T2+0.42, 0, 0, k===3?"#8c9a8a":"#9aa0a2");
    bx("paintm", 0.60, 0.36, 0.02, x, FY+1.70, H.z0+T2+0.83, 0, 0, "#7e8486");
    if(k===3) for(let j=0;j<3;j++) push(j===1?"ledamber":"ledgreen", new T.SphereGeometry(0.022,8,6), x-0.2+j*0.2, FY+1.95, H.z0+T2+0.84, 0, "#ffffff");
    bx("paintm", 0.06, 0.20, 0.03, x+0.32, FY+1.1, H.z0+T2+0.83, 0, 0, "#3a3a3a");
  }
  addCol(77.5, 83.9, H.z0, H.z0+T2+0.85, FY-0.5, FY+2.2);
  bx("paintm", 1.2, 1.4, 0.45, 85.6, FY+0.7, -178.4, 0, 0, "#6d7578");
  addCol(84.95, 86.25, -178.7, -178.1, FY-0.5, FY+1.4);
  bx("beam", 0.8, 0.04, 0.35, 85.9, FY+1.1, H.z1-T2-0.2, 0.6, 0, "#7a5a3a");
  bx("paintm", 0.3, 0.04, 0.22, 85.9, FY+1.14, H.z1-T2-0.2, 0, 0, "#2b4fa0");
  bx("tube", 0.26, 0.04, 1.2, 82, FY+2.96, -179, 0, 0, "#ffffff");
  LAMPS.push({x:82, y:FY+2.7, z:-179, color:0xeef4f0, intensity:0.75, dist:8, decay:1.4, indoor:true,
              vol:[H.x0, H.x1, H.z0, H.z1, FY-1, FY+4]});
  addUse(80.9, -178.2, FY, "READ THE LOGBOOK", ()=>toast("WEEKLY GEN TEST — RAN 30 MIN — OK — NO ISSUES","#cfe0d4"), 1.2);

  /* ---- the standby sets ------------------------------------------------ */
  const gen=(cx,cz,running)=>{
    const L=5.0, W=1.8;
    bx("concrete", L+0.6, 0.20, W+0.8, cx, SUB_G+0.10, cz, 0.5, 0, "#a6a298");
    bx("paintm", L, 0.62, W, cx, SUB_G+0.51, cz, 0, 0, "#8c8676");                    // sub-base fuel tank
    bx("paintm", L, 1.80, W, cx, SUB_G+1.72, cz, 0, 0, "#c9c2ab");                    // the enclosure
    bx("paintm", L+0.08, 0.06, W+0.08, cx, SUB_G+2.65, cz, 0, 0, "#b8b19a");
    for(const sd of [-1,1]){
      for(let k=0;k<7;k++) bx("paintm", 0.70, 0.03, 0.03, cx-1.6+(k%7)*0.0, SUB_G+1.2+k*0.12, cz+sd*(W/2+0.012), 0, 0, "#8f8a78");
      for(let k=0;k<7;k++) bx("paintm", 0.70, 0.03, 0.03, cx+1.6, SUB_G+1.2+k*0.12, cz+sd*(W/2+0.012), 0, 0, "#8f8a78");
      bx("paintm", 1.10, 1.40, 0.02, cx, SUB_G+1.66, cz+sd*(W/2+0.008), 0, 0, "#c2bba3");
      bx("paintm", 0.06, 0.16, 0.03, cx+0.45, SUB_G+1.66, cz+sd*(W/2+0.02), 0, 0, "#3a3a3a");
    }
    cyl("metal", 0.10,0.10,0.9,10, cx-1.9, SUB_G+3.05, cz, "#8a8f91");               // exhaust stack
    push("metal", boxGeo(0.24,0.02,0.24,0), cx-1.9, SUB_G+3.52, cz+0.06, 0, "#8a8f91", 0.5, 0);
    push(running?"ledgreen":"ledamber", new T.SphereGeometry(0.025,8,6), cx+2.4, SUB_G+2.2, cz-W/2-0.01, 0, "#ffffff");
    addCol(cx-L/2, cx+L/2, cz-W/2, cz+W/2, SUB_G-0.5, SUB_G+2.7);
    for(const [bxp,bzp] of [[cx-L/2-0.6,cz-W/2-0.5],[cx-L/2-0.6,cz+W/2+0.5]]){         // bollards
      cyl("paintm", 0.08,0.08,1.1,10, bxp, SUB_G+0.55, bzp, "#e3b81e");
      addCol(bxp-0.09,bxp+0.09,bzp-0.09,bzp+0.09,SUB_G-0.5,SUB_G+1.1);
    }
    addUse(cx-L/2-0.8, cz, SUB_G, "CHECK THE GENERATOR", ()=>toast(running?"READY · AUTO · 87% FUEL":"READY · AUTO · 92% FUEL","#9fd36a"), 1.6);
  };
  gen(72.0, -160.5, true); gen(72.0, -166.0, false);
  GEN_POS.push({x:72, z:-163.2});
  // the pad-mounted transformer: utility green, cooling fins at the back
  bx("concrete", 2.4, 0.18, 2.2, 84, SUB_G+0.09, -164, 0.5, 0, "#a6a298");
  bx("paintm", 2.0, 1.60, 1.70, 84, SUB_G+0.98, -164, 0, 0, "#566f52");
  for(let k=0;k<9;k++) bx("paintm", 0.04, 1.2, 0.22, 83.1+k*0.22, SUB_G+0.95, -164.96, 0, 0, "#4c6448");
  const xf=signTex(220,140,(c,W,H2)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H2); c.fillStyle="#c8102e";
    c.fillRect(0,0,W,H2*0.36); c.fillStyle="#f2f0e8"; fitHwy(c,"DANGER",W*0.7,H2*0.26,W/2,H2*0.19);
    c.fillStyle="#1a1a1a"; fitText(c,"Hazardous voltage",W*0.84,H2*0.18,W/2,H2*0.58,"700");
    fitText(c,"inside",W*0.5,H2*0.16,W/2,H2*0.82,"600"); });
  signPanel(0.36,0.23,xf, 84, SUB_G+1.25, -163.14, 0);
  addCol(83.0, 85.0, -165.1, -163.15, SUB_G-0.5, SUB_G+1.8);
  // the day tank: a horizontal cylinder on two saddles, with its placard
  push("paintm", new T.CylinderGeometry(0.75,0.75,3.6,20), 84, SUB_G+1.25, -158, 0, "#d9d6cc", 0, 0, Math.PI/2);
  for(const dx of [-1.2,1.2]) bx("paintm", 0.25, 0.6, 1.2, 84+dx, SUB_G+0.3, -158, 0, 0, "#6e6e68");
  const dsl=signTex(240,120,(c,W,H2)=>{ c.fillStyle="#c8102e"; c.fillRect(0,0,W,H2); c.fillStyle="#f2f0e8";
    fitHwy(c,"DIESEL FUEL",W*0.84,H2*0.36,W/2,H2*0.34); fitText(c,"NO SMOKING · NO OPEN FLAME",W*0.86,H2*0.14,W/2,H2*0.72,"600"); });
  signPanel(0.7,0.35,dsl, 84, SUB_G+1.25, -157.24, 0);
  addCol(82.1, 85.9, -158.8, -157.2, SUB_G-0.5, SUB_G+2.0);
  // conduit from the transformer over to the house, on stanchions
  tube("metal", V3(84,SUB_G+1.9,-165.1), V3(84,SUB_G+2.5,-165.1), 0.05, 8, "#9aa0a2");
  tube("metal", V3(84,SUB_G+2.5,-165.1), V3(84,SUB_G+2.5,-175.8), 0.05, 8, "#9aa0a2");
  for(const z of [-168,-171,-174]) cyl("metal", 0.03,0.03,2.5,6, 84.2, SUB_G+1.25, z, "#9aa0a2");
  // the flood on its pole, sodium orange after dark
  cyl("metal", 0.08,0.10,6.0,10, 62.0, SUB_G+3.0, -182.0, "#9aa0a2");
  push("paintm", boxGeo(0.5,0.3,0.4,0), 62.3, SUB_G+5.9, -181.7, -0.8, "#3a3a38", 0.4, 0);
  push("lamplens", boxGeo(0.4,0.02,0.3,0), 62.4, SUB_G+5.74, -181.6, -0.8, "#ffffff", 0.4, 0);
  LAMPS.push({x:63.5, y:SUB_G+5.6, z:-180.5, color:0xffb466, intensity:1.25, dist:30, decay:1.4, mothy:true});
  push("lightpool", discGeo(11, 24, 0), 70, SUB_G+0.06, -172, 0, "#ffb466");
  addCol(61.9,62.1,-182.1,-181.9,SUB_G-0.5,SUB_G+6);
})();

/* ---- the pole line --------------------------------------------------------
   Wooden poles every ninety metres up the right-of-way, a crossarm with
   three insulators each, and three conductors sagging between them. The
   first pole carries the transformers and the riser down into the yard. */
(function poleLine(){
  const dx=POWER.x1-POWER.x0, dz=POWER.z1-POWER.z0, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L;
  const poles=[];
  for(let s=4; s<L; s+=90){
    const x=POWER.x0+ux*s, z=POWER.z0+uz*s, y=Terrain.groundAt(x,z);
    poles.push({x:x, z:z, y:y});
  }
  const ry=Math.atan2(ux, uz);
  poles.forEach((p,i)=>{
    const H=12.5;
    cyl("pole", 0.16,0.20,H,8, p.x, p.y+H/2-0.8, p.z, "#7a6248");
    push("pole", boxGeo(2.6,0.12,0.12,0.5), p.x, p.y+H-1.2, p.z, ry, "#6e5840");
    for(const o of [-1.1,0,1.1]){
      const ox=Math.cos(ry)*o, oz=-Math.sin(ry)*o;
      cyl("paintm", 0.05,0.07,0.28,8, p.x+ox, p.y+H-1.0+(o===0?0.3:0), p.z+oz, "#8fa6a8");
      p["w"+o]=V3(p.x+ox, p.y+H-0.84+(o===0?0.3:0), p.z+oz);
    }
    if(p.x>SITE.zone.x0 && p.x<SITE.zone.x1 && p.z>SITE.zone.z0 && p.z<SITE.zone.z1)
      addCol(p.x-0.22,p.x+0.22,p.z-0.22,p.z+0.22,p.y-1,p.y+H);
    if(i===0){
      for(const o of [-0.5,0,0.5]){
        const ox=Math.cos(ry)*o, oz=-Math.sin(ry)*o;
        cyl("paintm", 0.24,0.24,0.8,12, p.x+ox+0.3, p.y+H-3.0, p.z+oz, "#9ea4a6");
      }
      tube("paintm", V3(p.x+0.25,p.y+0.0,p.z), V3(p.x+0.25,p.y+H-3.6,p.z), 0.05, 8, "#8a8f91");
    }
  });
  for(let i=1;i<poles.length;i++){
    const a=poles[i-1], b=poles[i];
    if(Math.hypot(a.x,a.z)>1500) break;
    for(const o of [-1.1,0,1.1]){
      const A=a["w"+o], B=b["w"+o], N=6;
      let prev=A;
      for(let k=1;k<=N;k++){
        const t=k/N, sag=Math.sin(t*Math.PI)*1.6;
        const Pt=V3(A.x+(B.x-A.x)*t, A.y+(B.y-A.y)*t-sag, A.z+(B.z-A.z)*t);
        tube("paintm", prev, Pt, 0.012, 3, "#2a2a2a"); prev=Pt;
      }
    }
  }
})();
