"use strict";
/* REST AREA · 13c-wastewater.js
   the rest area's own water and sewage: the well house, the tank on its
   tower, the treatment plant down the hill, and the creek it drains to
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   13c · WATER IN, WATER OUT
   No city water or sewer comes out this far into Crawford County, so the
   rest area has its own (where they are, and the ground under them: 04).

   THE WELL HOUSE: a block hut west of the service track over the well.
   Inside are the casing with its sanitary cap, the pressure tank, the
   switch and gauge on the tee, a chlorine solution tank with its little
   pump, a heater, and a light on a pull chain.

   THE TANK ON ITS TOWER: a steel tank of a few thousand gallons on four
   battered legs on the rise above, with cross-bracing, a balcony, a caged
   ladder (its bottom locked behind a shield), and the riser down the
   middle.

   THE PLANT: a fenced compound downhill from everything, east of the
   track, at the end of a gravel spur. Inside the gate:
   - the control building, block, where the blowers run and the operator
     keeps the logbook. Two blowers on the east wall, two pumps, the
     motor control panel with its run lights, the lab bench with sample
     bottles, a pH meter and the logbook open on it;
   - the headworks box where the sewer comes in;
   - the aeration tank: a long concrete box of brown, working water with
     a little foam on it, a stair up to a grating catwalk across it, and
     the air drops with their handwheels;
   - the round clarifier, its skimmer arm going round under the bridge;
   - the sand filter bed;
   - the chlorine contact tank, baffled back and forth, the tablet tube at
     its head.
   From the contact tank the water goes out a pipe, under the fill, to a
   concrete headwall on the creek bank (OUTFALL 001). The red light on
   the roof turns when something is wrong: in a power cut, in a hard
   rain, and once in a long while for no reason anybody can find.
   Walk up the stairs, read the logbook (E), stand at the rail.
   ---------------------------------------------------------------------- */
const PLANT_RT={arm:null, foamTex:null, creekTex:null, trickleTex:null, beacon:null, beaconLamp:null, panel:[], alarm:0, alarmT:0, nextAlarm:900+Math.random()*1800};
(function plant(){
  const Y=WWTP.y, G=Y+0.04;                       // the ground, and the crushed stone on it
  // a surface turned inside out, for the inside of a round wall or a trough seen from within
  const inward=g=>{ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i]; ix[i]=ix[i+2]; ix[i+2]=t; }
    const n=g.attributes.normal; for(let i=0;i<n.count;i++) n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i)); return g; };
  // a few materials of its own
  const grate=(function(){ const c=cvs(64,64), x=c.getContext("2d");
    x.clearRect(0,0,64,64); x.fillStyle="#8e9295";
    for(let i=0;i<64;i+=8){ x.fillRect(i,0,2,64); } for(let j=0;j<64;j+=16) x.fillRect(0,j,64,3);
    const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
  bucketOf("grating", ()=>new T.MeshStandardMaterial({map:grate, alphaTest:0.5, side:T.DoubleSide, roughness:0.6, metalness:0.5}));
  const foam=(function(){ const S=256, c=cvs(S,S), x=c.getContext("2d"), r=_trng(4411);
    x.fillStyle="#4f4330"; x.fillRect(0,0,S,S);
    for(let i=0;i<500;i++){ x.fillStyle=r()<0.5?"#5b4d37":"#43392a"; x.globalAlpha=0.5; x.beginPath(); x.arc(r()*S, r()*S, 2+r()*9, 0, 7); x.fill(); }
    // the foam: a little of it, tan and off-white rafts in drifts, the brown water showing between
    for(let i=0;i<26;i++){ const cx=r()*S, cy=r()*S, n=3+((r()*5)|0);
      for(let k=0;k<n;k++){ x.fillStyle=r()<0.5?"#d9d0ba":"#b2a584"; x.globalAlpha=0.45+r()*0.35;
        x.beginPath(); x.arc(cx+(r()-0.5)*18, cy+(r()-0.5)*10, 2+r()*6, 0, 7); x.fill(); } }
    x.globalAlpha=1;
    const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
  PLANT_RT.foamTex=foam;
  bucketOf("aerwater", ()=>new T.MeshStandardMaterial({map:foam, roughness:0.35, metalness:0.05}));
  const clear=(function(){ const S=128, c=cvs(S,S), x=c.getContext("2d"), r=_trng(77);
    x.fillStyle="#37402f"; x.fillRect(0,0,S,S);
    for(let i=0;i<220;i++){ x.strokeStyle=r()<0.5?"#46503b":"#2f3729"; x.globalAlpha=0.5; x.lineWidth=1+r()*2;
      x.beginPath(); const y=r()*S, x0=r()*S; x.moveTo(x0,y); x.quadraticCurveTo(x0+10,y-3,x0+22,y); x.stroke(); }
    x.globalAlpha=1; const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
  bucketOf("clearwater", ()=>new T.MeshStandardMaterial({map:clear, roughness:0.12, metalness:0.15}));
  const sand=(function(){ const S=128, c=cvs(S,S), x=c.getContext("2d"), r=_trng(901);
    x.fillStyle="#b5a37c"; x.fillRect(0,0,S,S);
    for(let i=0;i<2600;i++){ x.fillStyle=["#a8946a","#c4b48c","#9c8a62","#cdbf9a"][(r()*4)|0]; x.fillRect(r()*S, r()*S, 1, 1); }
    const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
  bucketOf("sand", ()=>new T.MeshStandardMaterial(Object.assign({map:sand, roughness:1.0}, _po(-2))));

  /* ---- the compound: crushed stone, chain-link, the gate ------------------ */
  const W=WWTP, GT=W.gate;
  floorAt("gravelbed", W.x0, W.x1, W.z0, W.z1, G, "#a5a196", 0.25);
  addPaveRect(W.x0, W.x1, W.z0, W.z1, Y+0.01);
  const FH=1.85;
  const fenceRun=(x0,z0,x1,z1,shared)=>{          // as the substation's (12): left of travel is out
    const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/3)), ry=Math.atan2(x1-x0, z1-z0);
    const dx=(x1-x0)/L, dz=(z1-z0)/L, ox=dz, oz=-dx;
    for(let k=0;k<=(shared?n-1:n);k++){
      const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, corner=(k===0||k===n);
      cyl("metal", corner?0.05:0.035, corner?0.05:0.035, FH+0.4, 8, px, Y+FH/2-0.15, pz, "#a7adb0");
      push("metal", boxGeo(0.04,0.04,0.50,0), px+ox*0.16, Y+FH+0.16, pz+oz*0.16, ry+Math.PI/2, "#a7adb0", 0.78, 0);
    }
    push("chainlink", planeGeo(L, FH-0.05, 3.2), (x0+x1)/2, Y+(FH-0.05)/2+0.03, (z0+z1)/2, ry+Math.PI/2, "#ffffff");
    tube("metal", V3(x0,Y+FH,z0), V3(x1,Y+FH,z1), 0.024, 8, "#a7adb0");
    for(let s=0;s<3;s++){ const h=Y+FH+0.11+s*0.13, o=0.09+s*0.12;
      tube("paintm", V3(x0+ox*o,h,z0+oz*o), V3(x1+ox*o,h,z1+oz*o), 0.006, 4, "#5c6062"); }
    addCol(Math.min(x0,x1)-0.06, Math.max(x0,x1)+0.06, Math.min(z0,z1)-0.06, Math.max(z0,z1)+0.06, Y-0.5, Y+FH+0.5);
  };
  // clockwise seen from above, so "left" is out
  fenceRun(W.x0, W.z1, W.x0, GT.z1);
  fenceRun(W.x0, GT.z0, W.x0, W.z0, true);
  fenceRun(W.x0, W.z0, W.x1, W.z0, true);
  fenceRun(W.x1, W.z0, W.x1, W.z1, true);
  fenceRun(W.x1, W.z1, W.x0, W.z1, true);
  for(const z of [GT.z0, GT.z1]) cyl("metal", 0.06,0.06, FH+0.5, 10, GT.x, Y+FH/2, z, "#a7adb0");
  makeDoor(XF(GT.x, GT.z0+0.02, -Math.PI/2), 0, G+0.04, 0, "THE PLANT GATE", false, 0, "gate");
  makeDoor(XF(GT.x, GT.z1-0.02,  Math.PI/2), 0, G+0.04, 0, "THE PLANT GATE", true, 0, "gate");
  { const gc={x0:GT.x-0.12, x1:GT.x+0.12, z0:GT.z0, z1:GT.z1, y0:G, y1:G+2.3}; COL_DYN.push(gc);
    const A=DOORS[DOORS.length-2], B=DOORS[DOORS.length-1];
    for(const d of [A,B]){ d.manualOnly=true; d.sticky=true; d.blockCol=gc; d.blockTop=G+2.3; }
    A.partner=B; B.partner=A; }
  // the sign on the gate
  { const tex=signTex(600,360,(c,W2,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W2,H);
      c.strokeStyle="#1d3b8a"; c.lineWidth=10; c.strokeRect(10,10,W2-20,H-20);
      c.fillStyle="#1d3b8a"; fitHwy(c,"REST AREA 154",W2*0.78,H*0.12,W2/2,H*0.17);
      c.fillStyle="#1a1a1a"; fitHwy(c,"WASTEWATER",W2*0.78,H*0.15,W2/2,H*0.37); fitHwy(c,"TREATMENT FACILITY",W2*0.80,H*0.12,W2/2,H*0.53);
      c.fillStyle="#b3151b"; fitHwy(c,"AUTHORIZED PERSONNEL ONLY",W2*0.80,H*0.085,W2/2,H*0.71);
      c.fillStyle="#3a3a3a"; fitText(c,"In an emergency call 814-555-0142",W2*0.78,H*0.07,W2/2,H*0.86,"500"); });
    signPanel(0.90, 0.54, tex, GT.x-0.08, Y+1.35, GT.z0-1.1, -Math.PI/2);
    bx("metal", 0.03, 0.56, 0.92, GT.x-0.055, Y+1.35, GT.z0-1.1, 0.5, 0, "#8d9294"); }
  addZone(W.x0, W.x1, W.z0, W.z1, Y-3, Y+8, "THE TREATMENT PLANT");

  /* ---- the tanks ------------------------------------------------------------ */
  const TOP=Y+1.25;                                   // the rims of the aeration tank and the clarifier
  const RAIL="#d9b52a";                               // safety yellow
  // a guardrail between two points at a level: posts every metre and a half, the top and mid rails, a collider
  const posts=new Set();                              // a corner post two rails share is put up once
  const rail=(x0,z0,x1,z1,y,noCol)=>{
    const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(L/1.5));
    for(let k=0;k<=n;k++){ const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, key=px.toFixed(2)+","+pz.toFixed(2)+","+y.toFixed(2);
      if(posts.has(key)) continue; posts.add(key); tube("paintm", V3(px,y,pz), V3(px,y+1.07,pz), 0.022, 6, RAIL); }
    tube("paintm", V3(x0,y+1.07,z0), V3(x1,y+1.07,z1), 0.024, 6, RAIL);
    tube("paintm", V3(x0,y+0.55,z0), V3(x1,y+0.55,z1), 0.018, 6, RAIL);
    if(!noCol) addCol(Math.min(x0,x1)-0.05, Math.max(x0,x1)+0.05, Math.min(z0,z1)-0.05, Math.max(z0,z1)+0.05, y-0.1, y+1.1);
  };
  // a steel stair up the -z way, from the ground at z=za to a landing at y1 at z=zb (za>zb), x from x0 to x1
  const stair=(x0,x1,za,zb,y1)=>{
    const rise=y1-G, n=Math.max(2,Math.round(rise/0.18)), h=rise/n, run=(za-zb)/n;
    for(let i=1;i<n;i++){ const z=za-run*(i-0.5), y=G+h*i;                 // (the last step up is the landing itself)
      push("grating", boxGeo(x1-x0, 0.03, run+0.02, 0), (x0+x1)/2, y-0.015, z, 0, "#ffffff"); }
    for(const x of [x0-0.03, x1+0.03]){
      const a=V3(x, G, za), b=V3(x, y1, zb); tube("paintm", a, b, 0.05, 4, "#6d7376");          // the stringers
      tube("paintm", V3(x, G+1.0, za), V3(x, y1+1.0, zb), 0.022, 6, RAIL);
      for(const t of [0, 0.5, 1]) tube("paintm", V3(x, lerp(G,y1,t), lerp(za,zb,t)), V3(x, lerp(G,y1,t)+1.0, lerp(za,zb,t)), 0.02, 6, RAIL);
      addCol(x-0.05, x+0.05, zb, za, G-0.2, y1+1.05);
    }
    addRamp(x0, x1, zb, za, "z", za, zb, G, y1);
  };
  // a flat of grating you walk on, at y (its top)
  const deck=(x0,x1,z0,z1,y)=>{ push("grating", boxGeo(x1-x0, 0.04, z1-z0, 0), (x0+x1)/2, y-0.02, (z0+z1)/2, 0, "#ffffff"); addFlat(x0,x1,z0,z1,y); };
  // a handwheel on a stem: a rim, four spokes, the hub
  const handwheel=(x,y,z,r)=>{ push("paintm", new T.TorusGeometry(r, 0.012, 6, 18), x, y, z, 0, "#b3191e", Math.PI/2, 0);
    for(let k=0;k<4;k++){ const a=k*Math.PI/2; tube("paintm", V3(x,y,z), V3(x+Math.cos(a)*r, y, z+Math.sin(a)*r), 0.007, 4, "#b3191e"); }
    cyl("metal", 0.025, 0.025, 0.05, 8, x, y, z, "#6d7376"); };

  // THE AERATION TANK: x 132..146, z 92..100, walls 0.3, its water a little under the rim
  const AT={x0:132, x1:146, z0:92, z1:100, wl:Y+0.95};
  wallBox("concrete", AT.x0, AT.x1, AT.z0, AT.z0+0.3, Y-0.4, TOP, "#b9b5ab", 0.5, Y);
  wallBox("concrete", AT.x0, AT.x1, AT.z1-0.3, AT.z1, Y-0.4, TOP, "#b9b5ab", 0.5, Y);
  wallBox("concrete", AT.x0, AT.x0+0.3, AT.z0+0.3, AT.z1-0.3, Y-0.4, TOP, "#b9b5ab", 0.5, Y);
  wallBox("concrete", AT.x1-0.3, AT.x1, AT.z0+0.3, AT.z1-0.3, Y-0.4, TOP, "#b9b5ab", 0.5, Y);
  { const g=planeGeo(AT.x1-AT.x0-0.6, AT.z1-AT.z0-0.6, 0.22);
    push("aerwater", g, (AT.x0+AT.x1)/2, AT.wl, (AT.z0+AT.z1)/2, 0, "#ffffff", -Math.PI/2, 0); }
  // the stair up the south side to a landing, and the catwalk across the tank at x 138.5..139.5
  const CWx0=138.5, CWx1=139.5;
  stair(CWx0, CWx1, AT.z1+3.05, AT.z1+1.15, TOP+0.03);
  deck(CWx0-1.0, CWx1+1.0, AT.z1, AT.z1+1.15, TOP+0.03);
  deck(CWx0, CWx1, AT.z0+0.3, AT.z1-0.012, TOP+0.03);                        // (short of the landing's edge)
  rail(CWx0-1.0, AT.z1+1.15, CWx0-1.0, AT.z1, TOP+0.03); rail(CWx1+1.0, AT.z1+1.15, CWx1+1.0, AT.z1, TOP+0.03);
  rail(CWx0-1.0, AT.z1, CWx0, AT.z1, TOP+0.03); rail(CWx1, AT.z1, CWx1+1.0, AT.z1, TOP+0.03);
  rail(CWx0, AT.z1, CWx0, AT.z0+0.3, TOP+0.03); rail(CWx1, AT.z1, CWx1, AT.z0+0.3, TOP+0.03);
  rail(CWx0, AT.z0+0.3, CWx1, AT.z0+0.3, TOP+0.03);                                    // across the far end
  // the air: a header along the catwalk's east rail, drops down into the water, a valve and a wheel on each
  tube("metal", V3(CWx1+0.18, TOP+0.45, AT.z1+0.54), V3(CWx1+0.18, TOP+0.45, AT.z0+0.4), 0.05, 10, "#8d9396");   // (its end inside the main's drop, below)
  for(const z of [93.4, 95.1, 96.8, 98.5]){
    tube("metal", V3(CWx1+0.18, TOP+0.45, z), V3(CWx1+0.55, TOP+0.45, z), 0.035, 8, "#8d9396");
    tube("metal", V3(CWx1+0.55, TOP+0.45, z), V3(CWx1+0.55, AT.wl-0.6, z), 0.035, 8, "#8d9396");
    cyl("paintm", 0.06, 0.06, 0.14, 10, CWx1+0.55, TOP+0.62, z, "#3d4a55");
    tube("metal", V3(CWx1+0.55, TOP+0.69, z), V3(CWx1+0.55, TOP+0.86, z), 0.012, 6, "#9aa0a2");
    handwheel(CWx1+0.55, TOP+0.86, z, 0.11);
    // where the air comes up: a boil of lighter water round the drop
    push("aerwater", new T.CircleGeometry(0.55, 14), CWx1+0.55, AT.wl+0.02, z, 0, "#c9bea4", -Math.PI/2, 0);
  }
  // the air main from the blowers: out of the control building's east wall, up on posts over the yard,
  // over the landing well above anybody's head, and down beside the catwalk into the header
  const AM=Y+3.7, ax=CWx1+0.18, az=AT.z1+0.5;
  tube("metal", V3(128.9, Y+2.1, 114.0), V3(131.0, Y+2.1, 114.0), 0.075, 10, "#8d9396");               // (out of the wall, not from its face)
  tube("metal", V3(131.0, Y+2.1, 114.0), V3(131.0, AM, 114.0), 0.075, 10, "#8d9396");
  tube("metal", V3(131.0, AM, 114.0), V3(131.0, AM, az), 0.075, 10, "#8d9396");
  tube("metal", V3(131.0, AM, az), V3(ax, AM, az), 0.075, 10, "#8d9396");
  tube("metal", V3(ax, AM, az), V3(ax, TOP+0.45, az), 0.075, 10, "#8d9396");
  for(const [x,z] of [[131.0,108],[131.0,103],[135.0,az]]) tube("metal", V3(x,G,z), V3(x,AM-0.08,z), 0.04, 6, "#8d9396");

  // THE HEADWORKS: a concrete box where the sewer comes in, a grating over it, a bar screen in it
  bx("concrete", 2.0, 1.0, 2.4, 130.2-0.0, Y+0.35, 94.2, 0.5, 0, "#b3afa5");
  addCol(129.2, 131.2, 93.0, 95.4, Y-0.5, Y+0.85);
  push("grating", boxGeo(1.6, 0.03, 2.0, 0), 130.2, Y+0.865, 94.2, 0, "#ffffff");
  tube("metal", V3(131.2, Y+0.6, 94.2), V3(AT.x0, Y+0.6, 94.2), 0.10, 10, "#7b7f80");

  // THE CLARIFIER: round, the water clear and dark, a bridge to the centre well, the arm going round
  const CL={x:152.6, z:96.0, r:3.8, wl:Y+1.06};
  { const ro=CL.r+0.25;
    push("concrete", new T.CylinderGeometry(ro, ro, TOP-Y+0.4, 40, 1, true), CL.x, (TOP+Y-0.4)/2, CL.z, 0, "#b9b5ab");
    push("concrete", inward(new T.CylinderGeometry(CL.r, CL.r, TOP-CL.wl+0.3, 40, 1, true)), CL.x, (TOP+CL.wl-0.3)/2, CL.z, 0, "#a9a59b");
    push("concrete", new T.RingGeometry(CL.r, ro, 40, 1), CL.x, TOP, CL.z, 0, "#c3bfb5", -Math.PI/2, 0);
    push("clearwater", new T.CircleGeometry(CL.r+0.02, 40), CL.x, CL.wl, CL.z, 0, "#ffffff", -Math.PI/2, 0);
    // the effluent trough round inside the wall, its weir a little over the water
    push("paintm", new T.RingGeometry(CL.r-0.42, CL.r-0.02, 40, 1), CL.x, CL.wl+0.04, CL.z, 0, "#3a3d33", -Math.PI/2, 0);
    push("metal", new T.CylinderGeometry(CL.r-0.42, CL.r-0.42, 0.16, 40, 1, true), CL.x, CL.wl+0.07, CL.z, 0, "#8d9396");
    push("metal", inward(new T.CylinderGeometry(CL.r-0.425, CL.r-0.425, 0.16, 40, 1, true)), CL.x, CL.wl+0.07, CL.z, 0, "#8d9396");
    // a wall you cannot walk through: sixteen turned boxes round it
    for(let k=0;k<16;k++){ const a=(k+0.5)*Math.PI/8, cx=CL.x+Math.sin(a)*(CL.r+0.12), cz=CL.z+Math.cos(a)*(CL.r+0.12);
      addColOB(cx, cz, a, (CL.r+0.3)*Math.PI/16+0.05, 0.18, Y-0.5, TOP); }
    // the centre well and the drive on top of it
    cyl("metal", 0.75, 0.75, 1.0, 20, CL.x, CL.wl+0.1, CL.z, "#7b8285");
    cyl("paintm", 0.45, 0.5, 0.55, 14, CL.x, TOP+0.33, CL.z, "#3e5d7a");
    // the bridge from the south rim to the drive, a stair up to it like the tank's
    deck(CL.x-0.45, CL.x+0.45, CL.z+0.6, CL.z+CL.r+0.24, TOP+0.03);
    deck(CL.x-1.0, CL.x+1.0, CL.z+CL.r+0.25, CL.z+CL.r+1.35, TOP+0.03);
    stair(CL.x-0.45, CL.x+0.45, CL.z+CL.r+3.25, CL.z+CL.r+1.35, TOP+0.03);
    rail(CL.x-0.45, CL.z+CL.r+0.25, CL.x-0.45, CL.z+0.7, TOP+0.03); rail(CL.x+0.45, CL.z+CL.r+0.25, CL.x+0.45, CL.z+0.7, TOP+0.03);
    rail(CL.x-1.0, CL.z+CL.r+1.35, CL.x-1.0, CL.z+CL.r+0.25, TOP+0.03); rail(CL.x+1.0, CL.z+CL.r+1.35, CL.x+1.0, CL.z+CL.r+0.25, TOP+0.03);
    rail(CL.x-1.0, CL.z+CL.r+0.25, CL.x-0.45, CL.z+CL.r+0.25, TOP+0.03); rail(CL.x+0.45, CL.z+CL.r+0.25, CL.x+1.0, CL.z+CL.r+0.25, TOP+0.03);
    addCol(CL.x-0.55, CL.x+0.55, CL.z-0.55, CL.z+0.62, TOP-0.2, TOP+0.9);                   // the drive, at the bridge's end
    addCol(CL.x-0.45, CL.x+0.45, CL.z+0.6, CL.z+CL.r, Y-0.5, TOP-0.1);   // (under the bridge: the water, not a way through)
    // the arm: a truss out to the wall, a skimmer blade on the water, turning (updatePlant)
    const arm=new T.Group(), am=new T.MeshStandardMaterial({color:0x6d7376, roughness:0.55, metalness:0.4});
    const bar=(w,h,d,x,y,z)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d), am); m.position.set(x,y,z); arm.add(m); };
    bar(0.08, 0.08, CL.r-0.9, 0, 0.08, (CL.r-0.9)/2+0.78);
    bar(0.05, 0.05, CL.r-0.9, 0, -0.12, (CL.r-0.9)/2+0.78);
    for(let z=0.9; z<CL.r-0.1; z+=0.6) bar(0.03, 0.22, 0.03, 0, -0.02, z);
    bar(0.02, 0.18, CL.r-1.0, 0.10, -0.06, (CL.r-1.0)/2+0.85);
    arm.position.set(CL.x, CL.wl+0.06, CL.z); scene.add(arm); PLANT_RT.arm=arm;
  }

  // THE SAND FILTER: a curbed bed of sand, the troughs that spread the water on it, the cleanouts
  const SF={x0:131, x1:141, z0:105, z1:112};
  for(const [x0,x1,z0,z1] of [[SF.x0,SF.x1,SF.z0,SF.z0+0.25],[SF.x0,SF.x1,SF.z1-0.25,SF.z1],[SF.x0,SF.x0+0.25,SF.z0+0.25,SF.z1-0.25],[SF.x1-0.25,SF.x1,SF.z0+0.25,SF.z1-0.25]]){
    bx("concrete", x1-x0, 0.85, z1-z0, (x0+x1)/2, Y+0.125, (z0+z1)/2, 0.5, 0, "#b3afa5");
    addFlat(x0, x1, z0, z1, Y+0.55); }
  floorAt("sand", SF.x0+0.25, SF.x1-0.25, SF.z0+0.25, SF.z1-0.25, Y+0.30, "#ffffff", 0.6);
  addFlat(SF.x0+0.25, SF.x1-0.25, SF.z0+0.25, SF.z1-0.25, Y+0.30);
  for(const z of [107.2, 109.8]){
    push("paintm", new T.CylinderGeometry(0.16, 0.16, SF.x1-SF.x0-1.0, 12, 1, true, 0, Math.PI), (SF.x0+SF.x1)/2, Y+0.62, z, 0, "#8d9396", 0, -Math.PI/2);
    push("paintm", inward(new T.CylinderGeometry(0.155, 0.155, SF.x1-SF.x0-1.0, 12, 1, true, 0, Math.PI)), (SF.x0+SF.x1)/2, Y+0.62, z, 0, "#7d8386", 0, -Math.PI/2);
    for(let x=SF.x0+1.0; x<SF.x1-0.6; x+=2.2) tube("metal", V3(x, Y+0.30, z), V3(x, Y+0.48, z), 0.02, 4, "#6d7376");
  }
  tube("paintm", V3(SF.x0+0.5, Y+0.62, 107.2), V3(SF.x0+0.5, Y+0.62, 109.8), 0.05, 8, "#e8e6df");
  tube("paintm", V3(SF.x0+0.5, Y+0.62, 108.5), V3(SF.x0-0.4, Y+0.62, 108.5), 0.05, 8, "#e8e6df");
  for(const [x,z] of [[SF.x0+0.6,SF.z0+0.6],[SF.x1-0.6,SF.z0+0.6],[SF.x0+0.6,SF.z1-0.6],[SF.x1-0.6,SF.z1-0.6]]){
    cyl("paintm", 0.05, 0.05, 0.42, 10, x, Y+0.48, z, "#e8e6df"); cyl("paintm", 0.065, 0.065, 0.04, 10, x, Y+0.70, z, "#e8e6df"); }

  // THE CHLORINE CONTACT TANK: x 145..157, z 105..110, baffled so the water goes back and forth
  const CC={x0:145, x1:157, z0:105, z1:110, top:Y+1.0, wl:Y+0.78};
  wallBox("concrete", CC.x0, CC.x1, CC.z0, CC.z0+0.25, Y-0.4, CC.top, "#b9b5ab", 0.5, Y);
  wallBox("concrete", CC.x0, CC.x1, CC.z1-0.25, CC.z1, Y-0.4, CC.top, "#b9b5ab", 0.5, Y);
  wallBox("concrete", CC.x0, CC.x0+0.25, CC.z0+0.25, CC.z1-0.25, Y-0.4, CC.top, "#b9b5ab", 0.5, Y);
  wallBox("concrete", CC.x1-0.25, CC.x1, CC.z0+0.25, CC.z1-0.25, Y-0.4, CC.top, "#b9b5ab", 0.5, Y);
  bx("concrete", CC.x1-CC.x0-2.3, CC.top-0.05-(CC.wl-0.6), 0.15, CC.x0+0.25+(CC.x1-CC.x0-2.3)/2, (CC.top-0.05+CC.wl-0.6)/2, 106.65, 0.5, 0, "#aaa69c");
  bx("concrete", CC.x1-CC.x0-2.3, CC.top-0.05-(CC.wl-0.6), 0.15, CC.x1-0.25-(CC.x1-CC.x0-2.3)/2, (CC.top-0.05+CC.wl-0.6)/2, 108.35, 0.5, 0, "#aaa69c");
  push("clearwater", planeGeo(CC.x1-CC.x0-0.5, CC.z1-CC.z0-0.5, 0.3), (CC.x0+CC.x1)/2, CC.wl, (CC.z0+CC.z1)/2, 0, "#c8d6cf", -Math.PI/2, 0);
  // the tablet chlorinator at its head: a white tube standing in the inlet box, its cap, a dechlor tube at the far end
  bx("concrete", 1.0, 0.9, 1.0, CC.x0-0.5, Y+0.35, 105.8, 0.5, 0, "#b3afa5");
  addCol(CC.x0-1.0, CC.x0, 105.3, 106.3, Y-0.5, Y+0.8);
  for(const [x,z,lab] of [[CC.x0-0.62,105.65,0],[CC.x0-0.35,105.95,1]]){
    cyl("paintm", 0.055, 0.055, 0.85, 12, x, Y+1.05, z, "#f2f0ea"); cyl("paintm", 0.07, 0.07, 0.06, 12, x, Y+1.50, z, lab?"#2d6a3a":"#e8e6df"); }
  // the outlet box, and the pipe away to the creek
  bx("concrete", 1.0, 0.9, 1.0, CC.x1+0.5, Y+0.35, 109.3, 0.5, 0, "#b3afa5");
  addCol(CC.x1, CC.x1+1.0, 108.8, 109.8, Y-0.5, Y+0.8);

  /* ---- the control building -------------------------------------------------- */
  const CB={x0:121, x1:129, z0:112, z1:118}, TW=0.2, FY=Y+0.15, CH=FY+2.75;
  const DR={a:122.2, b:123.16, sill:FY-0.6, head:FY+2.06}, WN={a:125.0, b:126.4, sill:FY+1.05, head:FY+2.0}, WE={a:114.4, b:115.8, sill:FY+1.05, head:FY+2.0};
  bx("concrete", CB.x1-CB.x0+0.3, 0.4, CB.z1-CB.z0+0.3, (CB.x0+CB.x1)/2, FY-0.206, (CB.z0+CB.z1)/2, 0.5, 0, "#b3afa6");   // (a centimetre under the floor's finish)
  addFlat(CB.x0-0.15, CB.x1+0.15, CB.z0-0.15, CB.z1+0.15, FY);
  floorAt("concrete", CB.x0+TW, CB.x1-TW, CB.z0+TW, CB.z1-TW, FY+0.004, "#a29e95", 0.5);
  bx("concrete", 1.6, FY-G+0.15, 1.2, (DR.a+DR.b)/2, (FY+G-0.15)/2, CB.z0-0.6-0.15, 0.5, 0, "#b7b3aa");   // the stoop
  addFlat(DR.a-0.4, DR.b+0.4, CB.z0-1.35, CB.z0, FY);
  const BLK="#c4beb0";
  runX("block", CB.z0+TW/2, TW, CB.x0, CB.x1, Y-0.3, CH, [DR, WN], BLK, 0.6);
  runX("block", CB.z1-TW/2, TW, CB.x0, CB.x1, Y-0.3, CH, [], BLK, 0.6);
  runZ("block", CB.x0+TW/2, TW, CB.z0+TW, CB.z1-TW, Y-0.3, CH, [], BLK, 0.6);
  runZ("block", CB.x1-TW/2, TW, CB.z0+TW, CB.z1-TW, Y-0.3, CH, [WE], BLK, 0.6);
  // the roof: a flat slab with a little overhang, a fascia, a vent
  bx("concrete", CB.x1-CB.x0+0.5, 0.22, CB.z1-CB.z0+0.5, (CB.x0+CB.x1)/2, CH+0.11, (CB.z0+CB.z1)/2, 0.5, 0, "#8f8b84");
  bx("paintm", CB.x1-CB.x0+0.56, 0.16, 0.04, (CB.x0+CB.x1)/2, CH+0.12, CB.z0-0.27, 0, 0, "#5a5048");
  bx("paintm", CB.x1-CB.x0+0.56, 0.16, 0.04, (CB.x0+CB.x1)/2, CH+0.12, CB.z1+0.27, 0, 0, "#5a5048");
  cyl("metal", 0.22, 0.22, 0.45, 12, 127.4, CH+0.44, 116.4, "#9aa0a2"); cyl("metal", 0.3, 0.3, 0.08, 12, 127.4, CH+0.70, 116.4, "#9aa0a2");
  ceilAt("plaster", CB.x0+TW, CB.x1-TW, CB.z0+TW, CB.z1-TW, CH-0.02, "#d9d6cd", 0.5);
  // the door, its frame, the windows
  for(const x of [DR.a-0.035, DR.b+0.035]) bx("paintm", 0.07, DR.head-FY, TW+0.12, x, FY+(DR.head-FY)/2, CB.z0+TW/2, 0, 0, "#5a5048");
  bx("paintm", DR.b-DR.a+0.15, 0.07, TW+0.13, (DR.a+DR.b)/2, DR.head+0.035, CB.z0+TW/2, 0, 0, "#5a5048");
  makeDoor(XF(DR.a+0.02, CB.z0+TW/2, 0), 0, FY+0.02, 0, "THE CONTROL BUILDING", false, 0, "steel", 0x6f7a80);
  addFlat(DR.a, DR.b, CB.z0-0.05, CB.z0+TW+0.05, FY);
  const win=(axis, f, o)=>{
    const w=o.b-o.a, h=o.head-o.sill, cx=(o.a+o.b)/2, cy=(o.sill+o.head)/2;
    if(axis==="x"){ push("glass", boxGeo(w-0.04, h-0.04, 0.02, 0), cx, cy, f, 0, "#cfd8d8");
      for(const d of [-1,1]) bx("paintm", w+0.08, 0.05, TW+0.06, cx, d<0?o.sill-0.025:o.head+0.025, f, 0, 0, "#5a5048");
      bx("paintm", 0.04, h, 0.05, cx, cy, f, 0, 0, "#5a5048"); }
    else { push("glass", boxGeo(0.02, h-0.04, w-0.04, 0), f, cy, cx, 0, "#cfd8d8");
      for(const d of [-1,1]) bx("paintm", TW+0.06, 0.05, w+0.08, f, d<0?o.sill-0.025:o.head+0.025, cx, 0, 0, "#5a5048");
      bx("paintm", 0.05, h, 0.04, f, cy, cx, 0, 0, "#5a5048"); }
  };
  win("x", CB.z0+TW/2, WN); win("z", CB.x1-TW/2, WE);
  addZone(CB.x0, CB.x1, CB.z0, CB.z1, FY-0.6, CH+0.4, "THE CONTROL BUILDING", true);
  wallSign(1.3, 0.26, (c,W2,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W2,H); c.fillStyle="#1a1a1a";
    fitHwy(c,"CONTROL BUILDING",W2*0.84,H*0.55,W2/2,H/2); }, (DR.b+WN.a)/2+0.3, FY+2.3, CB.z0-0.012, Math.PI);

  // inside: the lights, two tubes
  bucketOf("ptube", ()=>emitMat(0xeef2f0, 0.85, "indoor", "site"));
  for(const z of [113.9, 116.2]){
    bx("paintm", 2.4, 0.08, 0.30, 125.0, CH-0.05, z, 0, 0, "#e6e6e2");
    push("ptube", boxGeo(2.3, 0.02, 0.22, 0), 125.0, CH-0.095, z, 0, "#ffffff"); }
  LAMPS.push({x:125.0, y:CH-0.5, z:115.0, color:0xf2f6f2, intensity:0.9, dist:8.5, decay:1.4, indoor:true, circ:"site",
              vol:[CB.x0+0.1, CB.x1-0.1, CB.z0+0.1, CB.z1-0.1, FY-1, CH+0.5]});
  // the wall pack over the door, for the yard at night
  bx("paintm", 0.30, 0.24, 0.20, (DR.a+DR.b)/2, DR.head+0.45, CB.z0-0.10, 0, 0, "#3e332b");
  push("lamplens", boxGeo(0.22, 0.14, 0.02, 0), (DR.a+DR.b)/2, DR.head+0.43, CB.z0-0.205, 0, "#ffffff");
  LAMPS.push({x:(DR.a+DR.b)/2, y:DR.head+0.2, z:CB.z0-0.8, color:0xffd9a8, intensity:1.0, dist:16, decay:1.5, circ:"site"});
  push("lightpool", discGeo(5.5, 24, 0), (DR.a+DR.b)/2, G+0.004, CB.z0-3.0, 0, "#ffe2b8");

  // the blowers, on the east wall: a skid, the blower, its motor and belt guard, the inlet silencer, the discharge up to the main
  for(const z of [113.1, 115.9]){
    const x=127.9;
    bx("paintm", 1.0, 0.16, 1.3, x, FY+0.08, z, 0, 0, "#4a5560");
    bx("paintm", 0.55, 0.50, 0.50, x, FY+0.41, z-0.22, 0, 0, "#3d6a8a");
    cyl("paintm", 0.17, 0.17, 0.45, 14, x, FY+0.36, z+0.36, "#2f5a3a", Math.PI/2, 0, 0);
    bx("paintm", 0.12, 0.46, 0.60, x-0.30, FY+0.40, z+0.08, 0, 0, "#e0b51f");
    cyl("paintm", 0.16, 0.16, 0.70, 14, x, FY+1.01, z-0.22, "#8d9396");
    cyl("paintm", 0.19, 0.19, 0.08, 14, x, FY+1.40, z-0.22, "#5a6064");
    tube("metal", V3(x+0.18, FY+0.45, z-0.22), V3(x+0.38, FY+0.45, z-0.22), 0.06, 8, "#8d9396");
    tube("metal", V3(x+0.38, FY+0.45, z-0.22), V3(x+0.38, Y+2.1, z-0.22), 0.06, 8, "#8d9396");
    cyl("paintm", 0.09, 0.09, 0.12, 10, x+0.38, FY+1.15, z-0.22, "#3d4a55");                        // the check valve
    addCol(x-0.5, x+0.6, z-0.65, z+0.65, FY-0.1, FY+1.5);
  }
  tube("metal", V3(128.3, Y+2.1, 112.88), V3(128.3, Y+2.1, 115.68), 0.075, 10, "#8d9396");
  tube("metal", V3(128.3, Y+2.1, 114.0), V3(128.9, Y+2.1, 114.0), 0.075, 10, "#8d9396");
  // the pumps, in the south-east corner: return sludge, two of them, on a pad
  bx("concrete", 1.6, 0.12, 0.9, 127.6, FY+0.06, 117.15, 0.5, 0, "#b3afa6");
  for(const x of [127.1, 128.1]){
    cyl("paintm", 0.16, 0.16, 0.36, 14, x, FY+0.30, 117.15, "#9a2a1e", Math.PI/2, 0, 0);
    cyl("paintm", 0.12, 0.12, 0.32, 12, x, FY+0.30, 116.85, "#2f5a3a", Math.PI/2, 0, 0);
    tube("metal", V3(x, FY+0.46, 117.3), V3(x, CH-0.4, 117.3), 0.04, 8, "#8d9396"); }
  tube("metal", V3(126.9, CH-0.4, 117.3), V3(128.6, CH-0.4, 117.3), 0.04, 8, "#8d9396");
  addCol(126.8, 128.6, 116.6, 117.8, FY-0.1, FY+0.6);
  // the motor control panel on the west wall, its run lights, the alarm annunciator
  bx("paintm", 0.45, 2.0, 1.7, CB.x0+TW+0.225, FY+1.0, 114.6, 0, 0, "#9ea4a6");
  addCol(CB.x0+TW, CB.x0+TW+0.45, 113.75, 115.45, FY-0.1, FY+2.0);
  for(const dz of [-0.42, 0.42]) bx("paintm", 0.012, 1.8, 0.012, CB.x0+TW+0.456, FY+1.0, 114.6+dz, 0, 0, "#6d7376");
  { const lights=[];
    for(let k=0;k<6;k++){ const m=new T.Mesh(new T.CircleGeometry(0.022, 10), new T.MeshBasicMaterial({color:k<4?0x2fd04a:0xffa21c, toneMapped:false}));
      m.position.set(CB.x0+TW+0.456, FY+1.55-(k%2)*0.12, 114.0+Math.floor(k/2)*0.4); m.rotation.y=Math.PI/2; scene.add(m); lights.push(m); }
    // the annunciator: a little red window that lights with the beacon
    const an=new T.Mesh(new T.PlaneGeometry(0.16, 0.08), new T.MeshBasicMaterial({color:0x3a0a08, toneMapped:false}));
    an.position.set(CB.x0+TW+0.456, FY+1.80, 114.6); an.rotation.y=Math.PI/2; scene.add(an);
    PLANT_RT.panel=lights; PLANT_RT.annun=an; }
  // the lab bench along the south wall: a counter with a sink, a cabinet under, the bottles, the meter, the logbook
  const BZ=CB.z1-TW-0.33, BT=FY+0.92;
  bx("paintm", 4.2, 0.86, 0.62, 123.4, FY+0.43, BZ, 0, 0, "#d9d6cd");
  bx("paintm", 4.26, 0.04, 0.66, 123.4, BT-0.02, BZ, 0, 0, "#2f3a34");
  addCol(121.3, 125.5, BZ-0.33, BZ+0.33, FY-0.1, BT);
  for(let x=121.85; x<125.4; x+=0.7) bx("paintm", 0.012, 0.6, 0.02, x, FY+0.45, BZ-0.311, 0, 0, "#9a968c");
  push("steel", boxGeo(0.46, 0.02, 0.36, 0), 121.95, BT+0.001, BZ, 0, "#ffffff");                    // the sink
  push("paintm", boxGeo(0.40, 0.004, 0.30, 0), 121.95, BT+0.020, BZ, 0, "#7d8185");                       // the basin, clear of the rim
  tube("chrome", V3(121.95, BT, BZ+0.22), V3(121.95, BT+0.32, BZ+0.22), 0.012, 6, "#ffffff");
  tube("chrome", V3(121.95, BT+0.32, BZ+0.22), V3(121.95, BT+0.30, BZ+0.06), 0.011, 6, "#ffffff");
  // sample bottles in a rack: clear, with white caps; and the amber ones for the lab that picks them up
  bx("paintm", 0.62, 0.05, 0.22, 122.85, BT+0.025, BZ+0.12, 0, 0, "#3c6e8f");
  for(let k=0;k<8;k++){ const x=122.6+(k%4)*0.16, z=BZ+0.06+Math.floor(k/4)*0.12;
    push("glass", new T.CylinderGeometry(0.035, 0.035, 0.16, 10), x, BT+0.13, z, 0, "#e8eef0");
    cyl("paintm", 0.03, 0.03, 0.03, 10, x, BT+0.225, z, "#f2f0ea"); }
  for(let k=0;k<3;k++){ cyl("paintm", 0.05, 0.05, 0.20, 12, 123.45+k*0.13, BT+0.10, BZ+0.16, "#7a4a12"); cyl("paintm", 0.032, 0.032, 0.03, 10, 123.45+k*0.13, BT+0.215, BZ+0.16, "#1d1d1f"); }
  // the pH meter and its probe in a beaker; a thermometer
  bx("paintm", 0.20, 0.07, 0.16, 124.1, BT+0.035, BZ+0.08, 0, 0, "#e6e3da");
  push("paintm", boxGeo(0.10, 0.006, 0.05, 0), 124.1, BT+0.078, BZ+0.07, 0, "#1e3d2a");             // its display, a raised bezel
  push("glass", new T.CylinderGeometry(0.04, 0.04, 0.10, 12), 124.35, BT+0.05, BZ+0.12, 0, "#e8eef0");
  tube("paintm", V3(124.35, BT+0.03, BZ+0.12), V3(124.33, BT+0.26, BZ+0.10), 0.006, 5, "#1d1d1f");
  // the logbook, open, and a pen across it
  const logTex=signTex(512, 340, (c,W2,H)=>{
    c.fillStyle="#efe9d8"; c.fillRect(0,0,W2,H); c.fillStyle="#d8d0bb"; c.fillRect(W2/2-3,0,6,H);
    c.strokeStyle="#9fb4c8"; c.lineWidth=1.5; for(let y=46;y<H-10;y+=22){ c.beginPath(); c.moveTo(14,y); c.lineTo(W2/2-14,y); c.moveTo(W2/2+14,y); c.lineTo(W2-14,y); c.stroke(); }
    c.strokeStyle="#d48a8a"; c.beginPath(); c.moveTo(56,10); c.lineTo(56,H-8); c.moveTo(W2/2+56,10); c.lineTo(W2/2+56,H-8); c.stroke();
    c.fillStyle="#26324a"; c.textAlign="left";
    fitText(c,"PLANT LOG · OCT",W2/2*0.80,20,W2/4,24,"700","'Bradley Hand','Segoe Print',cursive");
    const L=["14 0710 DO 2.3 pH 7.1 Cl .9","14 1530 flow 4,610 gal  RT","15 0705 DO 2.1 pH 7.0 Cl 1.0","15 1520 blower 2 belt sqk","16 0715 DO 2.4 pH 7.2 Cl .8",
             "16 1540 hosed weirs  RT","17 0700 DO 1.9 pH 7.1 Cl .9","17 1510 pulled samples","18 0720 DO 2.2 pH 7.1 Cl .9","18 1535 HI LVL alarm, reset",
             "19 0705 DO 2.3 pH 7.2 Cl 1.0","19 ____"];
    L.forEach((s,i)=>{ const col=i<6?0:1, row=i%6;
      fitText(c, s, W2/2*0.82, 15, col*W2/2+W2/4+4, 62+row*44, "500", "'Bradley Hand','Segoe Print',cursive"); });
  });
  push("paintm", boxGeo(0.44, 0.02, 0.30, 0), 124.85, BT+0.011, BZ+0.02, 0, "#5a2a1e");
  signPanel(0.42, 0.28, logTex, 124.85, BT+0.028, BZ+0.02, 0, false, -Math.PI/2);
  tube("paintm", V3(124.78, BT+0.026, BZ-0.08), V3(124.98, BT+0.026, BZ+0.06), 0.004, 5, "#1d3b8a");
  addUse(124.85, BZ-0.45, FY, "READ THE LOGBOOK", ()=>{
    const DO=(1.9+Math.random()*0.6).toFixed(1), pH=(6.9+Math.random()*0.4).toFixed(1), cl=(0.7+Math.random()*0.4).toFixed(1);
    toast("LOGBOOK, LAST ENTRY:  DO "+DO+" mg/L · pH "+pH+" · Cl₂ "+cl+" mg/L · FLOW "+(4300+((Math.random()*700)|0)).toLocaleString()+" GAL", "#cfe0d4");
  }, 1.1);
  // a stool at the bench; a sample fridge under the far end; an eye wash by the door; the chemicals
  cyl("paintm", 0.17, 0.17, 0.05, 14, 123.9, FY+0.64, BZ-0.62, "#2a2a2a");
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+0.4; tube("metal", V3(123.9+Math.cos(a)*0.06, FY+0.62, BZ-0.62+Math.sin(a)*0.06), V3(123.9+Math.cos(a)*0.2, FY, BZ-0.62+Math.sin(a)*0.2), 0.012, 5, "#6d7376"); }
  bx("paintm", 0.56, 0.84, 0.56, 125.95, FY+0.42, BZ, 0, 0, "#ecebe6");
  addCol(125.67, 126.23, BZ-0.28, BZ+0.28, FY-0.1, FY+0.84);
  bx("paintm", 0.30, 0.42, 0.14, 121.55, FY+1.35, CB.z0+TW+0.07, 0, 0, "#e7c21f");
  for(const [x,c,l] of [[124.2,"#e8e6df",0.62],[124.8,"#e8e6df",0.62],[125.4,"#d9b52a",0.42]]){
    cyl("paintm", 0.20, 0.20, l, 16, x, FY+l/2, CB.z0+TW+0.28, c); }
  addCol(123.95, 125.65, CB.z0+TW, CB.z0+TW+0.5, FY-0.1, FY+0.62);

  // the alarm beacon on the roof: a red dome on a short mast, turning when something is wrong (updatePlant)
  cyl("metal", 0.03, 0.03, 0.6, 8, CB.x0+0.6, CH+0.5, CB.z0+0.6, "#9aa0a2");
  cyl("paintm", 0.09, 0.09, 0.06, 12, CB.x0+0.6, CH+0.83, CB.z0+0.6, "#2a2a2a");
  { const bm=new T.MeshBasicMaterial({color:0x5a0d08, toneMapped:false});
    const b=new T.Mesh(new T.SphereGeometry(0.085, 14, 8, 0, Math.PI*2, 0, Math.PI/2), bm); b.scale.y=1.6;
    b.position.set(CB.x0+0.6, CH+0.86, CB.z0+0.6); scene.add(b);
    const glow=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff2010, transparent:true, opacity:0, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
    glow.scale.set(1.6,1.6,1); glow.position.copy(b.position); glow.position.y+=0.06; scene.add(glow);
    const L={x:CB.x0+0.6, y:CH+0.9, z:CB.z0+0.6, color:0xff2414, intensity:0, dist:14, decay:1.6};   // on its own battery: it is the power cut it shows
    LAMPS.push(L);
    PLANT_RT.beacon={m:bm, glow:glow, lamp:L}; }

  /* ---- the outfall: the pipe out of the fill to a headwall on the creek bank ---- */
  { let best=null, bd=1e9;
    for(const p of CREEK){ const d=Math.hypot(p.x-176, p.z-109); if(d<bd){ bd=d; best=p; } }
    const i=CREEK.indexOf(best), n=pathSide(CREEK,i);
    // the bank on the plant's side (the side toward smaller x)
    const sd=n.x<0 ? 1 : -1, hx=best.x+n.x*sd*2.3, hz=best.z+n.z*sd*2.3, ry=Math.atan2(-n.x*sd, -n.z*sd);
    const f=XF(hx, hz, ry);
    bx("concrete", 2.2, 1.5, 0.35, hx, best.y+0.45, hz, 0.5, ry, "#a9a59b");
    for(const s of [-1,1]) bx("concrete", 0.3, 1.2, 1.1, f.x(s*1.1, 0.4), best.y+0.3, f.z(s*1.1, 0.4), 0.5, ry, "#a9a59b");
    const pe=V3(f.x(0, 0.25), best.y+0.25, f.z(0, 0.25));
    push("paintm", new T.CylinderGeometry(0.2, 0.2, 0.3, 14, 1, true), pe.x, pe.y, pe.z, ry, "#6d6a62", Math.PI/2, 0);
    push("paintm", new T.CircleGeometry(0.19, 14), f.x(0, 0.18), pe.y, f.z(0, 0.18), ry, "#141414");
    // a trickle out of it down the riprap into the creek
    const tr=(function(){ const c=cvs(32,128), x=c.getContext("2d"); x.fillStyle="#9fb2b0"; x.fillRect(0,0,32,128);
      for(let k=0;k<40;k++){ x.fillStyle=k%2?"#e8f0ee":"#7f9694"; x.globalAlpha=0.6; x.fillRect(Math.random()*32, Math.random()*128, 2+Math.random()*4, 6+Math.random()*10); }
      const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
    PLANT_RT.trickleTex=tr;
    const tm=new T.Mesh(new T.PlaneGeometry(0.22, 1.2), new T.MeshBasicMaterial({map:tr, transparent:true, opacity:0.75, depthWrite:false}));
    tm.position.set(f.x(0, 0.85), best.y+0.08, f.z(0, 0.85)); tm.rotation.order="YXZ"; tm.rotation.y=ry; tm.rotation.x=-Math.PI/2+0.25;
    scene.add(tm);
    for(let k=0;k<9;k++){ const a=(k/8-0.5)*1.6, rr=0.9+(k%3)*0.25;
      push("rock", rockGeo(0.25+(k%4)*0.08, 50+k), f.x(Math.sin(a)*rr, 0.6+Math.cos(a)*rr*0.6), best.y+0.05, f.z(Math.sin(a)*rr, 0.6+Math.cos(a)*rr*0.6), k, "#8d887c"); }
    addCol(Math.min(f.x(-1.25,0),f.x(1.25,0))-0.2, Math.max(f.x(-1.25,0),f.x(1.25,0))+0.2, Math.min(f.z(-1.25,0),f.z(1.25,0))-0.2, Math.max(f.z(-1.25,0),f.z(1.25,0))+0.2, best.y-0.5, best.y+1.2);
    // the permit sign on its post
    const ps=signTex(300,240,(c,W2,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W2,H); c.strokeStyle="#1a1a1a"; c.lineWidth=6; c.strokeRect(8,8,W2-16,H-16);
      c.fillStyle="#1a1a1a"; fitHwy(c,"OUTFALL 001",W2*0.80,H*0.15,W2/2,H*0.20);
      fitText(c,"NPDES PERMIT No. PA0262154",W2*0.80,H*0.09,W2/2,H*0.42,"600");
      fitText(c,"TREATED SEWAGE EFFLUENT",W2*0.80,H*0.085,W2/2,H*0.60,"600");
      fitText(c,"Rest Area 154 · I-79",W2*0.78,H*0.08,W2/2,H*0.78,"500"); });
    const sx=f.x(1.9, -0.62), sz=f.z(1.9, -0.62), sgy=Terrain.groundAt(sx, sz);
    bx("wood", 0.08, 1.5, 0.08, sx, sgy+0.6, sz, 0.4, ry, "#6d5c48");
    bx("wood", 0.40, 0.33, 0.02, f.x(1.9, -0.572), sgy+1.12, f.z(1.9, -0.572), 0.4, ry, "#7a6a52");      // its board, on the post
    signPanel(0.36, 0.29, ps, f.x(1.9, -0.552), sgy+1.12, f.z(1.9, -0.552), ry);
    addCol(sx-0.06, sx+0.06, sz-0.06, sz+0.06, sgy-0.5, sgy+1.4);
  }

  /* ---- the creek ------------------------------------------------------------- */
  { const tex=(function(){ const S=128, c=cvs(S,S*2), x=c.getContext("2d"), r=_trng(3301);
      x.fillStyle="#2f3a2f"; x.fillRect(0,0,S,S*2);
      for(let i=0;i<260;i++){ x.strokeStyle=r()<0.55?"#56665c":"#232e25"; x.globalAlpha=0.35+r()*0.4; x.lineWidth=1+r()*1.5;
        const px=r()*S, py=r()*S*2; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px+4, py+8, px+1, py+16+r()*14); x.stroke(); }
      for(let i=0;i<40;i++){ x.fillStyle="#c8d4cc"; x.globalAlpha=0.35; x.fillRect(r()*S, r()*S*2, 2+r()*3, 1); }
      x.globalAlpha=1; const t=_tex(c); t.wrapS=t.wrapT=T.RepeatWrapping; return t; })();
    PLANT_RT.creekTex=tex;
    // dark, brown-green water in the shade of the woods: a little gloss, not a mirror of the sky
    bucketOf("creek", ()=>new T.MeshStandardMaterial({map:tex, color:0x6f7c70, roughness:0.32, metalness:0.0, transparent:true, opacity:0.90}));
    for(let a=0; a<CREEK.length-1; a+=40){
      const P=CREEK.slice(a, Math.min(CREEK.length, a+41));
      layRibbon("creek", P, -1.25, 1.25, 0.0, 0.5, "#ffffff");
    }
    // stones along it, some in it, some up on the banks
    for(let i=2;i<CREEK.length-2;i+=2){
      const p=CREEK[i], n=pathSide(CREEK,i), h=hash2(p.x*0.7, p.z*1.3);
      if(h<0.35) continue;
      const o=(h-0.68)*3.4, s=0.18+hash2(p.z,p.x)*0.32, x=p.x+n.x*o, z=p.z+n.z*o;
      push("rock", rockGeo(s, 90+(i%30)), x, Math.max(p.y-0.15, Terrain.groundAt(x,z)-s*0.3), z, h*9, "#7e796d");
    }
  }

  /* ---- the sewer: manholes along the way down -------------------------------- */
  { const tex=signTex(128,128,(c,W2,H)=>{ c.fillStyle="#3b3a37"; c.beginPath(); c.arc(W2/2,H/2,W2/2-1,0,7); c.fill();
      c.strokeStyle="#55534e"; c.lineWidth=5; for(let r=12;r<60;r+=11){ c.beginPath(); c.arc(W2/2,H/2,r,0,7); c.stroke(); }
      c.fillStyle="#6a6862"; fitHwy(c,"SANITARY",W2*0.62,13,W2/2,H/2-8); fitHwy(c,"SEWER",W2*0.5,13,W2/2,H/2+10); });
    bucketOf("manhole", ()=>new T.MeshStandardMaterial({map:tex, roughness:0.6, metalness:0.4}));
    for(const [x,z] of [[47.2,49.6],[61.5,58.0],[69.6,71.4],[76.0,86.0],[82.6,104.0],[88.6,124.4],[101.5,115.6],[119.6,110.2]]){
      const gy=Terrain.groundAt(x,z);
      cyl("concrete", 0.62, 0.66, 0.30, 18, x, gy-0.05, z, "#a9a59b");
      push("manhole", new T.CircleGeometry(0.5, 18), x, gy+0.112, z, 0, "#ffffff", -Math.PI/2, 0);
    }
  }

  /* ---- the tracks: gravel on the spur and the two paths ------------------------ */
  PLANT_TRACKS.forEach((P,k)=>{
    const w=k ? 0.75 : 1.5, g=ribbonGeo(P, -w, w, 0.045, 0.5); g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c);
    g.translate(-c.x,-c.y,-c.z); push("gravelbed", g, c.x, c.y, c.z, 0, "#9a968c");
  });

  /* ---- the well house -------------------------------------------------------------- */
  { const H=WELLH, FW=H.y+0.12, TH=0.2, EV=FW+2.35, RG=EV+0.55, XM=(H.x0+H.x1)/2;
    const D={a:99.0, b:99.96, sill:FW-0.6, head:FW+2.06};
    bx("concrete", H.x1-H.x0+0.3, 0.4, H.z1-H.z0+0.3, XM, FW-0.206, (H.z0+H.z1)/2, 0.5, 0, "#b3afa6");
    addFlat(H.x0-0.15, H.x1+0.15, H.z0-0.15, H.z1+0.15, FW);
    floorAt("concrete", H.x0+TH, H.x1-TH, H.z0+TH, H.z1-TH, FW+0.004, "#a29e95", 0.5);
    runX("block", H.z0+TH/2, TH, H.x0, H.x1, H.y-0.3, EV, [], "#c9c3b4", 0.6);
    runX("block", H.z1-TH/2, TH, H.x0, H.x1, H.y-0.3, EV, [], "#c9c3b4", 0.6);
    runZ("block", H.x0+TH/2, TH, H.z0+TH, H.z1-TH, H.y-0.3, EV, [], "#c9c3b4", 0.6);
    runZ("block", H.x1-TH/2, TH, H.z0+TH, H.z1-TH, H.y-0.3, EV, [D], "#c9c3b4", 0.6);
    // gables and a little steel roof, ridge along z
    for(const z of [H.z0+TH/2, H.z1-TH/2]) push("block", prismGeo([[H.x0+0.02,EV],[H.x1-0.02,EV],[XM,RG-0.06]], TH, 0.6), 0, 0, z, 0, "#c9c3b4");
    { const OH=0.25, eY=EV-OH*(RG-EV)/((H.x1-H.x0)/2);
      for(const sd of [-1,1]){ const xe=sd<0?H.x0-OH:H.x1+OH;
        const o2=OH+(sd>0?0.006:0);                                  // (the two slabs' ends a few mm apart, not one plane)
        push("roofmetal", new FaceGeo().slab([V3(xe,eY,H.z0-o2), V3(XM,RG,H.z0-o2), V3(XM,RG,H.z1+o2), V3(xe,eY,H.z1+o2)], 0.06, 0.5).geo(), 0,0,0, 0, "#5f6a5c"); }
      bx("roofmetal", 0.3, 0.05, H.z1-H.z0+2*OH, XM, RG+0.025, (H.z0+H.z1)/2, 0.5, 0, "#4c5649"); }
    ceilAt("plaster", H.x0+TH, H.x1-TH, H.z0+TH, H.z1-TH, EV-0.02, "#d9d6cd", 0.5);
    for(const z of [D.a-0.035, D.b+0.035]) bx("paintm", TH+0.12, D.head-FW, 0.07, H.x1-TH/2, FW+(D.head-FW)/2, z, 0, 0, "#4c5649");
    bx("paintm", TH+0.13, 0.07, D.b-D.a+0.15, H.x1-TH/2, D.head+0.035, (D.a+D.b)/2, 0, 0, "#4c5649");
    makeDoor(XF(H.x1-TH/2, D.b-0.02, Math.PI/2), 0, FW+0.02, 0, "THE WELL HOUSE", true, 0, "steel", 0x6c7660);   // (out: local +z is east here)
    addFlat(H.x1-TH-0.05, H.x1+0.05, D.a, D.b, FW);
    bx("concrete", 1.0, FW-H.y+0.1, 1.3, H.x1+0.5, (FW+H.y-0.1)/2, (D.a+D.b)/2, 0.5, 0, "#b7b3aa");
    addFlat(H.x1, H.x1+1.0, D.a-0.35, D.b+0.35, FW);
    addZone(H.x0, H.x1, H.z0, H.z1, FW-0.6, RG+0.3, "THE WELL HOUSE", true);
    wallSign(0.9, 0.34, (c,W2,H2)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W2,H2); c.fillStyle="#1d3b8a";
      fitHwy(c,"WELL No. 1",W2*0.80,H2*0.42,W2/2,H2*0.38); c.fillStyle="#3a3a3a"; fitText(c,"PWS ID 6200154",W2*0.78,H2*0.20,W2/2,H2*0.76,"600"); },
      H.x1+0.012, FW+1.75, D.b+0.62, Math.PI/2);
    // the well: the casing up through the slab, its cap, the drop pipe and the wire out of it
    cyl("metal", 0.085, 0.085, 0.48, 14, H.x0+0.75, FW+0.24, H.z0+0.75, "#5d6466");
    cyl("paintm", 0.11, 0.11, 0.08, 14, H.x0+0.75, FW+0.52, H.z0+0.75, "#2e3a44");
    tube("metal", V3(H.x0+0.75, FW+0.56, H.z0+0.75), V3(H.x0+0.75, FW+0.85, H.z0+0.75), 0.03, 8, "#8d9396");
    tube("paintm", V3(H.x0+0.80, FW+0.56, H.z0+0.72), V3(H.x0+0.30, FW+1.40, H.z0+0.30), 0.012, 5, "#1d1d1f");
    tube("metal", V3(H.x0+0.75, FW+0.85, H.z0+0.75), V3(H.x0+0.75, FW+0.85, H.z1-0.95), 0.03, 8, "#8d9396");
    // the tee: the gauge and the pressure switch on it, then into the tank
    cyl("paintm", 0.05, 0.05, 0.02, 14, H.x0+0.75, FW+0.97, H.z0+1.6, "#e6e3da", Math.PI/2, 0, 0);
    tube("metal", V3(H.x0+0.75, FW+0.85, H.z0+1.6), V3(H.x0+0.75, FW+0.95, H.z0+1.6), 0.008, 5, "#c9a24a");
    bx("paintm", 0.10, 0.12, 0.08, H.x0+0.75, FW+1.0, H.z0+2.0, 0, 0, "#6d7376");
    // the pressure tank: tall, blue, a dome on it
    cyl("paintm", 0.30, 0.30, 1.15, 20, H.x0+0.62, FW+0.66, H.z1-0.62, "#2f5f9a");
    push("paintm", new T.SphereGeometry(0.30, 20, 8, 0, Math.PI*2, 0, Math.PI/2), H.x0+0.62, FW+1.235, H.z1-0.62, 0, "#2f5f9a");
    cyl("paintm", 0.22, 0.26, 0.10, 16, H.x0+0.62, FW+0.05, H.z1-0.62, "#2a2a2a");
    tube("metal", V3(H.x0+0.75, FW+0.85, H.z1-0.95), V3(H.x0+0.75, FW+0.85, H.z1-0.6), 0.03, 8, "#8d9396");
    tube("metal", V3(H.x0+0.75, FW+0.85, H.z1-0.6), V3(H.x1-TH, FW+0.85, H.z1-0.6), 0.03, 8, "#8d9396");
    addCol(H.x0+0.3, H.x0+0.95, H.z1-0.95, H.z1-0.25, FW-0.1, FW+1.5);
    addCol(H.x0+0.6, H.x0+0.9, H.z0+0.6, H.z0+0.9, FW-0.1, FW+0.6);
    // the chlorinator: a white solution tank, its pump on the lid, the tube to the line
    cyl("paintm", 0.22, 0.22, 0.75, 16, H.x1-0.55, FW+0.375, H.z0+0.6, "#e8e6df");
    bx("paintm", 0.16, 0.14, 0.12, H.x1-0.55, FW+0.82, H.z0+0.6, 0, 0, "#c33b28");
    tube("paintm", V3(H.x1-0.55, FW+0.88, H.z0+0.6), V3(H.x0+0.8, FW+0.88, H.z0+0.85), 0.006, 4, "#f2f0ea");
    addCol(H.x1-0.8, H.x1-0.3, H.z0+0.35, H.z0+0.85, FW-0.1, FW+0.9);
    // a heater, the switch box, a bulb on a pull chain
    bx("paintm", 0.5, 0.35, 0.12, XM, FW+0.30, H.z1-TH-0.07, 0, 0, "#d8d4c8");
    bx("paintm", 0.25, 0.32, 0.12, H.x0+TH+0.07, FW+1.5, H.z0+1.9, 0, 0, "#9ea4a6");
    cyl("porcelain", 0.06, 0.06, 0.06, 10, XM, EV-0.04, (H.z0+H.z1)/2, "#ffffff");
    push("ptube", new T.SphereGeometry(0.05, 10, 8), XM, EV-0.12, (H.z0+H.z1)/2, 0, "#ffffff");
    LAMPS.push({x:XM, y:EV-0.3, z:(H.z0+H.z1)/2, color:0xffe2b8, intensity:0.7, dist:5, decay:1.4, indoor:true, circ:"site",
                vol:[H.x0+0.1, H.x1-0.1, H.z0+0.1, H.z1-0.1, FW-1, EV+0.5]});
  }

  /* ---- the tank on its tower ---------------------------------------------------------- */
  { const X=WTOWER.x, Z=WTOWER.z, B=WTOWER.y, LH=7.0, R=2.2, TH=3.2, C="#c8d4cc";
    // four legs, battered in toward the top, on concrete piers
    const foot=1.9, head=1.45;
    for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      cyl("concrete", 0.28, 0.32, 0.5, 10, X+sx*foot, B+0.1, Z+sz*foot, "#b3afa5");
      tube("paintm", V3(X+sx*foot, B+0.3, Z+sz*foot), V3(X+sx*head, B+LH, Z+sz*head), 0.11, 10, C);
      addCol(X+sx*foot-0.3, X+sx*foot+0.3, Z+sz*foot-0.3, Z+sz*foot+0.3, B-0.5, B+2.5);
    }
    // cross-bracing: a horizontal strut and an X of rods on each face, two tiers
    const at=(sx,sz,t)=>V3(X+sx*lerp(foot,head,t), B+0.3+(LH-0.3)*t, Z+sz*lerp(foot,head,t));
    const faces=[[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]];
    for(const [[ax,az],[bx2,bz]] of faces) for(const [t0,t1] of [[0.05,0.5],[0.5,0.95]]){
      tube("paintm", at(ax,az,t1), at(bx2,bz,t1), 0.05, 6, C);
      tube("paintm", at(ax,az,t0), at(bx2,bz,t1), 0.018, 4, C); tube("paintm", at(bx2,bz,t0), at(ax,az,t1), 0.018, 4, C); }
    // the riser up the middle
    cyl("paintm", 0.22, 0.22, LH+0.3, 14, X, B+LH/2, Z, C);
    // the balcony: a deck ring under the tank and its rail
    push("grating", new T.RingGeometry(R-0.05, R+0.75, 36, 1), X, B+LH+0.01, Z, 0, "#ffffff", -Math.PI/2, 0);
    push("paintm", new T.TorusGeometry(R+0.72, 0.022, 6, 48), X, B+LH+1.07, Z, 0, C, Math.PI/2, 0);
    push("paintm", new T.TorusGeometry(R+0.72, 0.016, 6, 48), X, B+LH+0.55, Z, 0, C, Math.PI/2, 0);
    for(let k=0;k<16;k++){ const a=k*Math.PI/8; tube("paintm", V3(X+Math.cos(a)*(R+0.72), B+LH, Z+Math.sin(a)*(R+0.72)), V3(X+Math.cos(a)*(R+0.72), B+LH+1.07, Z+Math.sin(a)*(R+0.72)), 0.016, 4, C); }
    // the tank: a drum, a shallow cone of roof, the vent on top; its name in blue on the side to the track
    cyl("paintm", R, R, TH, 40, X, B+LH+TH/2+0.02, Z, C);
    push("paintm", new T.ConeGeometry(R+0.06, 0.8, 40, 1, true), X, B+LH+TH+0.42, Z, 0, "#b9c6bd");
    cyl("paintm", 0.16, 0.2, 0.3, 12, X, B+LH+TH+0.95, Z, "#b9c6bd");
    const nm=signTex(512,128,(c,W2,H)=>{ c.clearRect(0,0,W2,H); c.fillStyle="#2a5f9a"; fitHwy(c,"REST AREA 154",W2*0.82,H*0.62,W2/2,H/2); });
    { const a=Math.atan2(90-X, 128-Z), m=new T.Mesh(new T.CylinderGeometry(R+0.012, R+0.012, 0.75, 40, 1, true, a-0.62, 1.24),
        new T.MeshStandardMaterial({map:nm, transparent:true, roughness:0.5, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      m.position.set(X, B+LH+TH*0.62, Z); scene.add(m); }
    // the ladder up the east leg's face, with its cage, and the locked shield over the bottom of it
    const lx=X+head+0.1, lz=Z;
    for(const dz of [-0.22, 0.22]) tube("paintm", V3(lx+0.35, B+0.3, lz+dz), V3(lx, B+LH, lz+dz), 0.02, 5, C);
    for(let t=0.03; t<1; t+=0.05){ const y=B+0.3+(LH-0.3)*t, x=lerp(lx+0.35, lx, t); tube("paintm", V3(x, y, lz-0.22), V3(x, y, lz+0.22), 0.012, 4, C); }
    for(let t=0.35; t<1; t+=0.12){ const y=B+0.3+(LH-0.3)*t, x=lerp(lx+0.35, lx, t);
      push("paintm", new T.TorusGeometry(0.38, 0.012, 4, 16, Math.PI), x+0.22, y, lz, Math.PI/2, C, Math.PI/2, 0); }
    bx("paintm", 0.04, 2.2, 0.62, lx+0.36, B+1.6, lz, 0.5, 0, "#9aa29c");
    cyl("paintm", 0.03, 0.03, 0.05, 8, lx+0.39, B+1.4, lz, "#b8a046", Math.PI/2, 0, 0);
    addZone(X-4, X+4, Z-4, Z+4, B-1, B+14, "THE WATER TANK");
  }

  PLANT_RT.ready=true;
})();
/* ---- the end of the service track, and the edge of the woods --------------------
   Past the plant the gravel goes on a quarter mile, down through the trees
   to a turnaround where the plough trucks swing round. Beyond it the old
   logging track carries on into the state's game lands, a pipe gate across
   it, chained, and the woods closing in: spruce and hemlock come up thick
   where the track used to be. That is as far as anybody goes on foot, and
   so it is all the way round the woods' edge: a belt of young conifers and
   brush, close set, just past where the walking stops, so the last thing
   you see is woods too thick to push into, not the end of anything. */
(function trackEnd(){
  const r=_trng(3301), T0=TURN, gy=SERVICE[SERVICE.length-1].y;
  // the turnaround: a gravel round, a hair under the track's own ribbon where the two overlap
  { const g=new T.CircleGeometry(T0.r, 36), U=g.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*T0.r, U.getY(k)*T0.r);
    push("gravelbed", g, T0.x, gy+0.035, T0.z, 0, "#9a968c", -Math.PI/2, 0);
    addPaveRect(T0.x-T0.r*0.7, T0.x+T0.r*0.7, T0.z-T0.r*0.7, T0.z+T0.r*0.7, gy); }
  addZone(T0.x-T0.r, T0.x+T0.r, T0.z-T0.r, T0.z+T0.r, gy-2, gy+8, "THE TURNAROUND");
  // the gate across the old track: two posts, a pipe leaf shut and chained, a sign on it
  const GZ=T0.z+T0.r+1.6, gx0=T0.x-3.4, gx1=T0.x+3.4, YEL="#d9a922";
  for(const x of [gx0, gx1]){ const y=Terrain.groundAt(x, GZ);
    cyl("paintm", 0.075, 0.075, 1.75, 12, x, y+0.62, GZ, YEL); cyl("paintm", 0.087, 0.087, 0.03, 12, x, y+1.505, GZ, YEL);
    addCol(x-0.1, x+0.1, GZ-0.1, GZ+0.1, y-0.5, y+1.5); }
  { const y=Terrain.groundAt(T0.x, GZ), L=gx1-gx0-0.20, xa=gx0+0.10;
    tube("paintm", V3(xa, y+1.08, GZ), V3(xa+L, y+1.08, GZ), 0.032, 10, YEL);
    tube("paintm", V3(xa, y+0.40, GZ), V3(xa+L, y+0.40, GZ), 0.028, 10, YEL);
    for(const t of [0, 0.5, 1]) tube("paintm", V3(xa+L*t, y+0.36, GZ), V3(xa+L*t, y+1.12, GZ), 0.03, 10, YEL);
    tube("paintm", V3(xa+0.05, y+0.44, GZ), V3(xa+L*0.5-0.05, y+1.04, GZ), 0.022, 8, YEL);
    tube("paintm", V3(xa+L*0.5+0.05, y+0.44, GZ), V3(xa+L-0.05, y+1.04, GZ), 0.022, 8, YEL);
    // the chain and its padlock at the latch end
    for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; tube("metal", V3(gx1-0.02+Math.cos(a)*0.1, y+1.0+Math.sin(a)*0.06, GZ-0.02), V3(gx1-0.02+Math.cos(a+1.26)*0.1, y+1.0+Math.sin(a+1.26)*0.06, GZ-0.02), 0.006, 4, "#6a6a66"); }
    bx("metal", 0.05, 0.065, 0.025, gx1-0.12, y+0.92, GZ-0.05, 0.4, 0, "#b8963a");
    addColOB(T0.x, GZ, 0, (gx1-gx0)/2, 0.08, y-0.3, y+1.2);
    // its sign, on a plate wired to the top rail, facing back up the track
    const sg=signTex(300,200,(c,W,H)=>{ c.fillStyle="#f2c418"; c.fillRect(0,0,W,H); c.strokeStyle="#1a1a1a"; c.lineWidth=7; c.strokeRect(9,9,W-18,H-18);
      c.fillStyle="#1a1a1a"; fitHwy(c,"STATE GAME LANDS",W*0.80,H*0.17,W/2,H*0.25); fitHwy(c,"ROAD CLOSED",W*0.70,H*0.20,W/2,H*0.52);
      fitHwy(c,"BEYOND THIS GATE",W*0.70,H*0.13,W/2,H*0.76); });
    bx("metal", 0.62, 0.42, 0.02, T0.x, y+0.76, GZ-0.045, 0.4, 0, "#8d9294");
    signPanel(0.58, 0.39, sg, T0.x, y+0.76, GZ-0.066, Math.PI); }      // (clear of the plate once the bake has grown it)
  // the old track on past it, two ruts going under the spruce
  for(const o of [-0.8, 0.8]){ const P=[]; for(let k=0;k<=8;k++){ const z=GZ+0.4+k*1.5, x=T0.x+o+Math.sin(k*0.7)*0.3; P.push({x:x, z:z, y:Terrain.groundAt(x,z)}); }
    P.forEach((q,i)=>q.s=i*1.5); const g=ribbonGeo(P, -0.22, 0.22, 0.03, 0.5); g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c);
    g.translate(-c.x,-c.y,-c.z); push("paintm", g, c.x, c.y, c.z, 0, "#6e6452"); }
  // the thicket the track goes into: young spruce and hemlock close as a hedge, brush under them
  const thick=(x, z, k)=>{ const u=r();
    if(u<0.40) FOREST.plant("spruce", x, z, {scale:0.45+r()*0.35});
    else if(u<0.62) FOREST.plant("hemlock", x, z, {scale:0.40+r()*0.30});
    else if(u<0.82) FOREST.plant("sapling", x, z, {scale:0.65+r()*0.4});
    else FOREST.plant("shrub", x, z, {scale:0.9+r()*0.5, solid:false}); };
  for(let z=GZ+2.2; z<T0.z+40; z+=1.9) for(let x=T0.x-16; x<T0.x+16; x+=2.0){
    const jx=x+(r()-0.5)*1.4, jz=z+(r()-0.5)*1.2;
    if(Math.abs(jx-T0.x)<1.4 && jz<GZ+5) continue;                             // the track's mouth stays open a few metres
    thick(jx, jz); }
  // and the same belt all round the woods' edge, just past where you stop: two rows, staggered,
  // on the north, south and west (the east is the posted line, where the woods are open and you see through)
  const I=SITE.walkInset, Zn=SITE.zone, W={x0:Zn.x0+I, x1:Zn.x1-(SITE.walkInsetE||I), z0:Zn.z0+I, z1:Zn.z1-I};
  const road=x=>Math.min(Math.abs(x-HWY.nb), Math.abs(x-HWY.sb))<21;
  const belt=(x,z)=>{ if(road(x) || Terrain.clearDist(x,z)<0.5 && Math.hypot(x-T0.x, z-GZ)>40) return; if(Math.abs(x-T0.x)<20 && z>GZ) return; thick(x, z); };
  for(const [z, dz] of [[W.z0, -1], [W.z1, 1]]) for(const row of [1.6, 4.2]) for(let x=W.x0+2; x<W.x1; x+=2.6) belt(x+(r()-0.5)*1.2+(row>2?1.3:0), z+dz*row+(r()-0.5)*0.8);
  for(const row of [1.6, 4.2]) for(let z=W.z0+2; z<W.z1; z+=2.6) belt(W.x0-row+(r()-0.5)*0.8, z+(r()-0.5)*1.2+(row>2?1.3:0));
})();
/* ---- what moves: the clarifier's arm, the foam, the creek, the alarm ---------- */
function updatePlant(dt){
  const R=PLANT_RT; if(!R.ready) return;
  if(R.arm) R.arm.rotation.y-=dt*0.026;                                       // about once in four minutes
  if(R.foamTex){ R.foamTex.offset.x+=dt*0.006; R.foamTex.offset.y+=dt*0.004; }
  if(R.creekTex) R.creekTex.offset.y-=dt*0.18;
  if(R.trickleTex) R.trickleTex.offset.y-=dt*0.6;
  // the alarm: the power off, a hard rain, or now and then a high level nobody can explain
  const out=typeof GRID!=="undefined" && GRID.site<0.5;
  const wet=typeof WEATHER!=="undefined" && ((WEATHER.storm||0)>0.5 || (WEATHER.rain||0)>0.65);
  R.nextAlarm-=dt;
  if(R.nextAlarm<=0){ R.alarmT=90+Math.random()*120; R.nextAlarm=1500+Math.random()*2400; }
  if(R.alarmT>0) R.alarmT-=dt;
  const on=out || wet || R.alarmT>0;
  const was=R.alarm>0; R.alarm=on?1:0;
  if(on && !was && typeof AUDIO!=="undefined" && Math.hypot(player.pos.x-125, player.pos.z-112)<60) AUDIO.blip("tone", 125, 112);
  const B=R.beacon;
  if(B){ const t=performance.now()/1000, f=on ? Math.pow(Math.max(0, Math.sin(t*6.2)), 3) : 0;
    B.m.color.setRGB(0.35+0.65*f, 0.05+0.1*f, 0.03+0.05*f);
    B.glow.material.opacity=0.85*f; B.lamp.intensity=1.6*f; }
  if(R.annun) R.annun.material.color.setHex(on && (performance.now()%700)<350 ? 0xff2a14 : 0x3a0a08);
  // the run lights go out with the power
  for(let k=0;k<R.panel.length;k++) R.panel[k].visible=!out;
}
