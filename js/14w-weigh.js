"use strict";
/* REST AREA · 14w-weigh.js
   the weigh station north of Edinboro (08w lays its road): the scale house
   and the officer in it, the scale and its readout, the signal, the sign
   on the interstate that says whether it is open, the lights, the trucks
   pulled over on the apron, the woods round it; and the trucks that come
   off the interstate, over the scale and back on
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14w · THE WEIGH STATION
   A mile on from the bridge, in the valley bottom on the northbound side.
   The scale house stands beside the scale lane: block, a flat roof, four
   rooms. The scale room down the lane side, a long window along the lane so
   the officer at the desk sees each truck as it rolls on, the readout and
   the camera on the screens in front of him, the radio base, the vests and
   hard hats, the wheel-load scales; the lobby the drivers come into from
   the apron, with the service window through to him, a bench, a cooler,
   the map of the truck routes and the limits, a snack machine; a restroom
   off it; and the break room behind, round the restroom, its kitchenette,
   table, lockers and couch, and the back door.
   Out back, a block shed of salt, cones, the mower and the snow blower.
   Behind a plain door in it a stair goes down to the listening room: walnut
   and green, a fire, a rug, an oxblood leather recliner with a man in it
   and a scotch in his hand, the cart of bottles beside him, a record going
   round on the console with a jazz trio on it (20's station 3), the
   records in their shelves, books, a club chair for you. It is under the
   ground (04 holes RING_WEIGH under the shed; BURIED, under lamps).
   Past the scale, the signal on its pole: red while a truck is on the
   scale, then green and BYPASS to go back out onto the interstate. On the
   apron two rigs are pulled over, and an inspector goes round one with a
   clipboard while its driver waits. A sign back on the interstate says
   OPEN, its beacons going, from six in the morning to eleven at night;
   then it says CLOSED and the trucks go on by.
   While it is open, now and then a rig in the right lane is flagged to come
   in (updateWeighTrucks, from 14's updateVisitors): down the ramp, onto the
   scale, a few seconds on it while the number comes up on the board, out
   along the lane when the light goes green and down the on-ramp, merging
   back in as the rest area's visitors do (14's stepVisitor drives it; a leg
   with y rides the road's grade). One in four has a transponder and takes
   the bypass lane past without stopping.
   ---------------------------------------------------------------------- */
const WEIGH_RT={active:0, max:3, open:true, onScale:null, sig:"", sigT:0, t:0, flagT:4};
(function weighStation(){
  if(typeof WEIGH==="undefined") return;
  const W=WEIGH, H=W.house;
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx)=>ent(boxGeo(w,h,d),x,y,z,c,rx||0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const CT=(r0,r1,h,x,y,z,c,seg)=>ent(new T.CylinderGeometry(r0,r1,h,seg||16),x,y,z,c);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03, Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const tubeE=(a,b,rad,c,seg)=>{ const dv=new T.Vector3().subVectors(b,a), L=dv.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), dv.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const PV=z=>roadY(z)+PAVE_T+0.015;                                 // the station's paving, a lot layer over the road
  // the station first, so the scale house (added after it) names itself inside
  addZone(W.pad.x0-8, W.pad.x1+20, W.pad.z0-40, W.pad.z1+40, roadY(W.pad.z0)-12, roadY(W.pad.z0)+20, "I-79 WEIGH STATION");

  /* ---- the scale: two steel decks end to end in the scale lane, in a frame of angle painted yellow, a dozen millimetres
     proud of the paving and tilted with it; the load cells' junction box at the side ---- */
  { const S=W.scale, L=S.z1-S.z0, cz=(S.z0+S.z1)/2;
    for(const k of [0,1]){ const za=S.z0+L*k/2, zb=za+L/2, zc=(za+zb)/2, ya=PV(za), yb=PV(zb), rx=-Math.atan2(yb-ya, zb-za), top=(ya+yb)/2+0.012;
      push("metal", boxGeo(S.w-0.10, 0.030, L/2-0.08, 0.6), S.x, top-0.015, zc, 0, "#5a5e60", rx, 0);
      for(let j=1;j<8;j++){ const z=za+j*(L/2)/8; B(S.w-0.3, 0.004, 0.03, S.x, lerp(ya, yb, (z-za)/(L/2))+0.014, z, "#4a4e50", 0, rx); }
      for(const sd of [-1,1]) B(0.07, 0.034, L/2+0.04, S.x+sd*(S.w/2-0.01), top-0.013, zc, "#e6c21c", 0, rx); }
    for(const zz of [S.z0, (S.z0+S.z1)/2, S.z1]) B(S.w-0.075, 0.034, 0.07, S.x, PV(zz)-0.001, zz, "#e6c21c");
    const yb=roadY(cz); B(0.40, 0.55, 0.22, S.x+S.w/2+0.9, yb+0.28, cz, "#8a8e90"); B(0.30, 0.06, 0.12, S.x+S.w/2+0.9, yb+0.58, cz, "#5a5e60");
    addCol(S.x+S.w/2+0.7, S.x+S.w/2+1.1, cz-0.11, cz+0.11, yb-0.5, yb+0.6); }

  /* ---- the scale house ----
     block, a flat roof, four rooms. The scale room down the lane side, the long window on the scale, the officer's desk at
     it; the lobby the drivers come into from the apron (the north door), with the service window through to the officer;
     a restroom off the lobby; and the break room behind, L-shaped round the restroom, its kitchenette under the south
     window and the back door out to the shed. Partitions are plaster boxes 12 cm thick, up 2 cm into the ceiling */
  const Y=roadY((H.z0+H.z1)/2), WT=0.20, FF=Y+0.36, CL=FF+2.8, TOPW=FF+3.05, IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT;
  const BLK="#d2cdbf", INW="#ecebe6", TRIM="#4a4e52", PT=0.12;
  const PX=-60.4, PZ=-2941.8, RX=-56.2, RZ=-2939.0;                                  // the partitions: scale room | east; lobby | south; restroom's two
  const WIN={a:IZ0+0.6, b:IZ1-0.6, sill:FF+0.95, head:FF+2.15};                      // the long window on the lane
  const ND={a:-57.9, b:-56.9, sill:FF-0.03, head:FF+2.10}, BD={a:-55.9, b:-54.9, sill:FF-0.03, head:FF+2.10};
  const NW1={a:-63.2, b:-61.4, sill:FF+1.0, head:FF+2.1}, NW2={a:-56.3, b:-55.0, sill:FF+1.0, head:FF+2.1};
  const SW1={a:-63.2, b:-61.4, sill:FF+1.0, head:FF+2.1}, SW2={a:-59.2, b:-57.8, sill:FF+1.15, head:FF+2.05};
  const EW1={a:-2944.6, b:-2943.0, sill:FF+1.0, head:FF+2.1}, EW2={a:-2941.0, b:-2940.2, sill:FF+1.55, head:FF+2.05}, EW3={a:-2937.8, b:-2936.0, sill:FF+1.0, head:FF+2.1};
  const SVC={a:-2944.9, b:-2943.5, sill:FF+0.95, head:FF+1.95};                       // the service window, scale room to lobby
  const D1={a:-2936.3, b:-2935.4, sill:FF-0.03, head:FF+2.05}, D2={a:-59.6, b:-58.7, sill:FF-0.03, head:FF+2.05}, D3={a:-55.95, b:-55.15, sill:FF-0.03, head:FF+2.05};
  const NDX=(ND.a+ND.b)/2, BDX=(BD.a+BD.b)/2;
  { // the slab it stands on; a stoop at the front door and one at the back
    bx("concrete", H.x1-H.x0+0.30, FF-(Y-0.10), H.z1-H.z0+0.30, (H.x0+H.x1)/2, (FF+Y-0.10)/2, (H.z0+H.z1)/2, 0.5, 0, "#b8b4aa");
    addFlat(H.x0-0.15, H.x1+0.15, H.z0-0.15, H.z1+0.15, FF);
    for(const [x, sd] of [[NDX, -1],[BDX, 1]]){ const zf=sd<0 ? H.z0-0.15 : H.z1+0.15;
      bx("concrete", 1.8, 0.28, 0.62, x, Y+0.04, zf+sd*0.30, 0.5, 0, "#b8b4aa"); addFlat(x-0.9, x+0.9, Math.min(zf, zf+sd*0.61), Math.max(zf, zf+sd*0.61), Y+0.18); }
    // the outer walls, block; inside, plaster
    runX("block", H.z0+WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [NW1, ND, NW2], BLK, 0.5);
    runX("block", H.z1-WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [SW1, SW2, BD], BLK, 0.5);
    runZ("block", H.x0+WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [WIN], BLK, 0.5);
    runZ("block", H.x1-WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [EW1, EW2, EW3], BLK, 0.5);
    lineX("plaster", IZ0, 1, IX0, IX1, FF, CL, [NW1, ND, NW2], INW); lineX("plaster", IZ1, -1, IX0, IX1, FF, CL, [SW1, SW2, BD], INW);
    lineZ("plaster", IX0, 1, IZ0, IZ1, FF, CL, [WIN], INW); lineZ("plaster", IX1, -1, IZ0, IZ1, FF, CL, [EW1, EW2, EW3], INW);
    ceilAt("plaster", IX0, IX1, IZ0, IZ1, CL, "#f2f0ea");
    floorAt("mosaic", IX0, IX1, IZ0, IZ1, FF+0.01, "#a8a49a", 0.6);
    floorAt("mosaic", RX+PT/2, IX1, PZ+PT/2, RZ-PT/2, FF+0.017, "#e2e0da", 0.9);   // (the restroom's, lighter, 7 mm over the rest)
    // the partitions: plaster both faces, with their doors and the service window
    runZ("plaster", PX, PT, IZ0, IZ1, FF-0.01, CL+0.02, [SVC, D1], INW, 0.5);
    runX("plaster", PZ, PT, PX+PT/2, IX1, FF-0.01, CL+0.02, [D2, D3], INW, 0.5);
    runZ("plaster", RX, PT, PZ+PT/2, RZ+PT/2, FF-0.01, CL+0.02, [], INW, 0.5);
    runX("plaster", RZ, PT, RX+PT/2, IX1, FF-0.01, CL+0.02, [], INW, 0.5);
    // the roof, out over the walls on every side, its fascia (sunk a little into its edge)
    bx("concrete", H.x1-H.x0+1.10, 0.22, H.z1-H.z0+1.10, (H.x0+H.x1)/2, TOPW-0.02+0.11, (H.z0+H.z1)/2, 0.5, 0, "#6a6a68");
    for(const sd of [-1,1]){ B(H.x1-H.x0+1.16, 0.16, 0.03, (H.x0+H.x1)/2, TOPW+0.10, sd>0 ? H.z1+0.56 : H.z0-0.56, TRIM);
      B(0.03, 0.15, H.z1-H.z0+1.12, sd>0 ? H.x1+0.56 : H.x0-0.56, TOPW+0.10, (H.z0+H.z1)/2, TRIM); }
    // the glass, frames and sills: the lane window in bays, the others single
    push("glass", planeGeo(WIN.b-WIN.a-0.04, WIN.head-WIN.sill-0.04, 0), H.x0+WT/2, (WIN.sill+WIN.head)/2, (WIN.a+WIN.b)/2, Math.PI/2, "#ffffff");
    for(let z=WIN.a+1.6; z<WIN.b-0.3; z+=1.6) bx("paintm", WT+0.04, WIN.head-WIN.sill, 0.06, H.x0+WT/2, (WIN.sill+WIN.head)/2, z, 0, 0, TRIM);
    frZ(H.x0+WT/2, WT, WIN.a, WIN.b, WIN.sill, WIN.head, TRIM); bx("paintm", WT+0.16, 0.05, WIN.b-WIN.a+0.2, H.x0+WT/2, WIN.sill-0.015, (WIN.a+WIN.b)/2, 0, 0, "#b8b4aa");
    const winX=(zf, o)=>{ push("glass", planeGeo(o.b-o.a-0.04, o.head-o.sill-0.04, 0), (o.a+o.b)/2, (o.sill+o.head)/2, zf, 0, "#ffffff");
      frX(zf, WT, o.a, o.b, o.sill, o.head, TRIM); bx("paintm", o.b-o.a+0.2, 0.05, WT+0.16, (o.a+o.b)/2, o.sill-0.015, zf, 0, 0, "#b8b4aa"); };
    const winZ=(xf, o, frost)=>{ push("glass", planeGeo(o.b-o.a-0.04, o.head-o.sill-0.04, 0), xf, (o.sill+o.head)/2, (o.a+o.b)/2, Math.PI/2, "#ffffff");
      if(frost) B(0.012, o.head-o.sill-0.06, o.b-o.a-0.06, xf-0.02, (o.sill+o.head)/2, (o.a+o.b)/2, "#dfe6e8");
      frZ(xf, WT, o.a, o.b, o.sill, o.head, TRIM); bx("paintm", WT+0.16, 0.05, o.b-o.a+0.2, xf, o.sill-0.015, (o.a+o.b)/2, 0, 0, "#b8b4aa"); };
    winX(H.z0+WT/2, NW1); winX(H.z0+WT/2, NW2); winX(H.z1-WT/2, SW1); winX(H.z1-WT/2, SW2);
    winZ(H.x1-WT/2, EW1); winZ(H.x1-WT/2, EW2, true); winZ(H.x1-WT/2, EW3);
    // the doors: the front and the back in steel-and-glass, the inside ones plain; their frames
    frX(H.z0+WT/2, WT, ND.a, ND.b, ND.sill, ND.head, TRIM); frX(H.z1-WT/2, WT, BD.a, BD.b, BD.sill, BD.head, TRIM);
    makeDoor(XF(ND.a+0.02, H.z0+WT/2, 0), 0, FF+0.01, 0, "THE SCALE HOUSE", true, 0, "vision", 0x6a7076);
    makeDoor(XF(BD.b-0.02, H.z1-WT/2, Math.PI), 0, FF+0.01, 0, "THE BACK DOOR", true, 0, "steel", 0x6a7076);
    frZ(PX, PT, D1.a, D1.b, D1.sill, D1.head, TRIM); frX(PZ, PT, D2.a, D2.b, D2.sill, D2.head, TRIM); frX(PZ, PT, D3.a, D3.b, D3.sill, D3.head, TRIM);
    makeDoor(XF(PX, D1.a+0.02, -Math.PI/2), 0, FF+0.01, 0, "THE BREAK ROOM", true, 0, "closet", 0xb8b0a0);
    makeDoor(XF(D2.a+0.02, PZ, 0), 0, FF+0.01, 0, "STAFF ONLY", true, 0, "closet", 0xb8b0a0);
    makeDoor(XF(D3.a+0.02, PZ, 0), 0, FF+0.01, 0, "RESTROOM", true, 0, "closet", 0xb8b0a0);
    for(const o of [ND, BD]) addFlat(o.a, o.b, (o===ND ? H.z0 : IZ1)-0.01, (o===ND ? IZ0 : H.z1)+0.01, FF);
    addFlat(PX-PT/2-0.01, PX+PT/2+0.01, D1.a, D1.b, FF); for(const o of [D2, D3]) addFlat(o.a, o.b, PZ-PT/2-0.01, PZ+PT/2+0.01, FF);
    // the service window: a ledge each side, a glass slider half open, the slot under it
    B(0.30, 0.04, SVC.b-SVC.a+0.10, PX+PT/2+0.15, SVC.sill+0.02, (SVC.a+SVC.b)/2, "#8a7a62"); B(0.30, 0.04, SVC.b-SVC.a+0.10, PX-PT/2-0.15, SVC.sill+0.02, (SVC.a+SVC.b)/2, "#8a7a62");
    push("glass", planeGeo((SVC.b-SVC.a)/2, SVC.head-SVC.sill-0.06, 0), PX+0.02, (SVC.sill+SVC.head)/2, SVC.a+(SVC.b-SVC.a)*0.25, Math.PI/2, "#ffffff");
    frZ(PX, PT, SVC.a, SVC.b, SVC.sill, SVC.head, TRIM);
    // the colliders: the outer walls round their doors, the partitions round theirs (the service window solid)
    const cX=(z0, z1, a, b, gaps)=>{ let u=a; for(const [g0,g1] of gaps){ if(g0>u) addCol(u, g0, z0, z1, FF-0.5, TOPW); u=g1; } if(b>u) addCol(u, b, z0, z1, FF-0.5, TOPW); };
    const cZ=(x0, x1, a, b, gaps)=>{ let u=a; for(const [g0,g1] of gaps){ if(g0>u) addCol(x0, x1, u, g0, FF-0.5, TOPW); u=g1; } if(b>u) addCol(x0, x1, u, b, FF-0.5, TOPW); };
    cX(H.z0, IZ0, H.x0, H.x1, [[ND.a, ND.b]]); cX(IZ1, H.z1, H.x0, H.x1, [[BD.a, BD.b]]);
    cZ(H.x0, IX0, IZ0, IZ1, []); cZ(IX1, H.x1, IZ0, IZ1, []);
    cZ(PX-PT/2, PX+PT/2, IZ0, IZ1, [[D1.a, D1.b]]); cX(PZ-PT/2, PZ+PT/2, PX, IX1, [[D2.a, D2.b],[D3.a, D3.b]]);
    cZ(RX-PT/2, RX+PT/2, PZ, RZ, []); cX(RZ-PT/2, RZ+PT/2, RX, IX1, []);
    // the zones: the house, then its rooms
    addZone(IX0, IX1, IZ0, IZ1, FF-0.5, CL, "THE SCALE HOUSE", true);
    addZone(PX, IX1, IZ0, PZ, FF-0.5, CL, "THE SCALE HOUSE · LOBBY", true);
    addZone(PX, IX1, PZ, IZ1, FF-0.5, CL, "THE SCALE HOUSE · BREAK ROOM", true);
    addZone(RX, IX1, PZ, RZ, FF-0.5, CL, "THE SCALE HOUSE · RESTROOM", true);
    // on the roof: the air handler, the mast with its antennas, the camera on it looking down the scale
    B(1.4, 0.8, 1.0, -57.6, TOPW+0.60, H.z1-3.0, "#b8bcc0"); B(1.2, 0.04, 0.8, -57.6, TOPW+1.01, H.z1-3.0, "#8a8e90");
    tube("metal", V3(H.x0+0.4, TOPW+0.19, H.z0+0.6), V3(H.x0+0.4, TOPW+3.2, H.z0+0.6), 0.03, 8, "#9a9ea2");
    for(const [dy, L] of [[2.9, 0.9],[2.5, 0.6]]) tube("metal", V3(H.x0+0.4-L/2, TOPW+dy, H.z0+0.6), V3(H.x0+0.4+L/2, TOPW+dy, H.z0+0.6), 0.012, 6, "#9a9ea2");
    B(0.30, 0.18, 0.18, H.x0+0.20, TOPW+2.2, H.z0+0.6, "#e8e6de"); B(0.08, 0.06, 0.06, H.x0+0.37, TOPW+2.2, H.z0+0.6, "#5a5e62");
    B(0.08, 0.13, 0.15, H.x0+0.03, TOPW+2.2, H.z0+0.6, "#1d1d1e");
    // and you can get up there: a ladder up the back wall, out past the eave, between the two windows
    { const RT=TOPW+0.20, fx=-60.3, fz=H.z1;
      roofLadder({x:fx, z:fz, nx:0, nz:1, g:surfaceY(fx, fz+0.9, groundY(fx, fz+0.9)+0.6), edge:RT, roof:RT, off:0.75, soffit:TOPW-0.02, land:0.10, label:"THE SCALE HOUSE'S LADDER", walk:[H.x0-0.55, H.x1+0.55, H.z0-0.55, H.z1+0.55]});
      addZone(H.x0-0.55, H.x1+0.55, H.z0-0.55, H.z1+0.55, TOPW, TOPW+4, "THE SCALE HOUSE · ROOF");
      addCol(-58.32, -56.88, H.z1-3.52, H.z1-2.48, RT-0.05, TOPW+1.03); addCol(H.x0+0.32, H.x0+0.48, H.z0+0.52, H.z0+0.68, RT-0.05, TOPW+3.2); }
    // the lights over the doors; over the lane window two floods on the scale
    for(const [x, zf, sd] of [[NDX, H.z0, -1],[BDX, H.z1, 1]]){ B(0.24, 0.12, 0.18, x, ND.head+0.34, zf+sd*0.085, "#2a2a2c"); push("lamplens", planeGeo(0.18, 0.12, 0), x, ND.head+0.275, zf+sd*0.085, 0, "#ffffff", Math.PI/2, 0);
      LAMPS.push({x:x, y:ND.head+0.2, z:zf+sd*0.7, color:0xffe2b8, intensity:0.6, dist:9, decay:1.5, mothy:true}); }
    for(const zz of [H.z0+1.6, H.z1-1.6]){ B(0.10, 0.05, 0.05, H.x0-0.04, TOPW-0.25, zz, "#2a2a2c"); B(0.30, 0.18, 0.24, H.x0-0.22, TOPW-0.25, zz, "#2a2a2c");
      push("lamplens", planeGeo(0.24, 0.18, 0), H.x0-0.22, TOPW-0.345, zz, 0, "#ffffff", Math.PI/2, 0); }
    LAMPS.push({x:W.scale.x+0.5, y:TOPW-0.6, z:(W.scale.z0+W.scale.z1)/2, color:0xf2f6ff, intensity:0.9, dist:16, decay:1.4, mothy:true});
    // the name on the lane side, under the eave, on stand-offs; DRIVERS over the front door
    bx("metal", 4.62, 0.62, 0.05, H.x0-0.04, TOPW-0.40, (H.z0+H.z1)/2, 0.5, Math.PI/2, "#1f4f8c");
    sign(4.5, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh); say(c, "WEIGH STATION · ALL TRUCKS", Wd/2, Hh/2, Wd*0.84, Hh*0.6, "#f4f2ec", "800", "Arial"); },
      H.x0-0.08, TOPW-0.40, (H.z0+H.z1)/2, -Math.PI/2, false, 1080);
    bx("metal", 1.82, 0.32, 0.04, NDX, ND.head+0.62, H.z0-0.035, 0.5, 0, "#1f4f8c");
    sign(1.76, 0.28, (c,Wd,Hh)=>{ c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh); say(c, "DRIVERS · BRING PAPERS IN", Wd/2, Hh/2, Wd*0.82, Hh*0.58, "#f4f2ec", "800", "Arial"); },
      NDX, ND.head+0.62, H.z0-0.067, Math.PI, false, 700);
    // by the front door: a bench, the butt can; a walk of slabs out back to the shed
    { const x=NDX-1.8, z=H.z0-0.75, g=Y; for(const dx of [-0.7, 0.7]) B(0.06, 0.42, 0.36, x+dx, g+0.21, z, "#3a3c3e");
      for(let k=0;k<3;k++) B(1.6, 0.04, 0.10, x, g+0.44, z-0.12+k*0.12, "#7a5a3a"); B(1.6, 0.30, 0.04, x, g+0.66, z+0.18, "#7a5a3a");
      addCol(x-0.8, x+0.8, z-0.2, z+0.22, g-0.5, g+0.5); addSeat(x, z, g, 0, "THE BENCH BY THE DOOR");
      C(0.13, 0.9, NDX+1.2, g+0.45, H.z0-0.45, "#3a3c3e", 14); C(0.15, 0.03, NDX+1.2, g+0.91, H.z0-0.45, "#5a5e62", 14); addCol(NDX+1.06, NDX+1.34, H.z0-0.6, H.z0-0.3, g-0.5, g+0.9); }
    { const za=H.z1+0.95, zb=W.shed.z0-0.9, n=Math.max(2, Math.round((zb-za)/1.25));     // (a pace apart, all the way out)
      for(let k=0;k<=n;k++){ const t=k/n, x=lerp(BDX, -57.9, smoothstep(0, 1, t)), z=lerp(za, zb, t); B(0.62, 0.06, 0.52, x, Terrain.groundAt(x, z)+0.012, z, "#b8b4aa"); } } }

  /* ---- the scale room: the desk along the lane window and its screens (the readout, the camera on the scale, the log),
     the officer in his chair; the ledge at the service window with the stamp and the ticket printer; the radio base by the
     north window; hard hats and vests on their hooks, the wheel-load scales stacked by them; a TV with the cameras ---- */
  { const dx=IX0+0.38, dz0=-2943.6, dz1=-2937.0, dzc=(dz0+dz1)/2;
    B(0.72, 0.04, dz1-dz0, dx, FF+0.74, dzc, "#8a7a62"); B(0.66, 0.72, 0.04, dx, FF+0.36, dz0+0.02, "#5a5e62"); B(0.66, 0.72, 0.04, dx, FF+0.36, dz1-0.02, "#5a5e62");
    B(0.60, 0.70, 0.40, dx, FF+0.355, dzc-1.6, "#5a5e62"); for(let k=0;k<3;k++) B(0.012, 0.18, 0.34, dx+0.305, FF+0.15+k*0.22, dzc-1.6, "#3a3e42");
    addCol(IX0, dx+0.37, dz0, dz1, FF-0.5, FF+0.78);
    const scr=(z, ry, draw)=>{ B(0.06, 0.20, 0.06, dx-0.10, FF+0.86, z, "#1d1d1e"); B(0.20, 0.02, 0.18, dx-0.10, FF+0.77, z, "#1d1d1e");
      const cx=dx-0.13; B(0.04, 0.34, 0.56, cx, FF+1.10, z, "#1d1d1e", ry);
      return signPanel(0.52, 0.30, signTex(260, 150, draw), cx+Math.cos(ry)*0.031, FF+1.10, z-Math.sin(ry)*0.031, Math.PI/2+ry, true); };
    WEIGH_RT.screen=scr(dzc-0.62, -0.20, (c,Wd,Hh)=>{ c.fillStyle="#0a1a10"; c.fillRect(0,0,Wd,Hh); say(c, "SCALE 1", Wd/2, Hh*0.18, Wd*0.7, Hh*0.14, "#3aff7a", "700", "monospace");
      say(c, "-- ---- LB", Wd/2, Hh*0.55, Wd*0.84, Hh*0.30, "#3aff7a", "700", "monospace"); });
    scr(dzc, 0, (c,Wd,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0, "#6a7a8a"); g.addColorStop(0.5, "#5a5e5a"); g.addColorStop(1, "#3a3c3a"); c.fillStyle=g; c.fillRect(0,0,Wd,Hh);
      c.fillStyle="#2a2c2a"; c.beginPath(); c.moveTo(Wd*0.30, Hh); c.lineTo(Wd*0.45, Hh*0.45); c.lineTo(Wd*0.55, Hh*0.45); c.lineTo(Wd*0.70, Hh); c.fill();
      c.fillStyle="#e6c21c"; for(let k=0;k<4;k++) c.fillRect(Wd*0.40+k*0.02*Wd, Hh*(0.62+k*0.09), Wd*(0.2-0.04*k), 2);
      c.fillStyle="#f4f2ec"; c.font="10px monospace"; c.fillText("CAM 2  SCALE", 12, 18); });
    scr(dzc+0.62, 0.20, (c,Wd,Hh)=>{ c.fillStyle="#f2f2ee"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,20); c.fillStyle="#f4f2ec"; c.font="11px Arial"; c.fillText("INSPECTION LOG", 12, 14);
      c.fillStyle="#3a3a3a"; c.font="9px monospace"; ["06:12 PA 74K  OK","06:40 OH 79K  OK","07:05 NY 81K  OVR","07:31 PA 62K  OK","08:02 ON 77K  OK","08:15 PA 78K  INSP","08:44 MI 71K  OK","09:10 PA 80K  OK","09:22 IN 66K  OK"].forEach((s,k)=>c.fillText(s, 12, 34+k*12)); });
    B(0.16, 0.02, 0.40, dx+0.05, FF+0.77, dzc, "#2a2a2c");
    B(0.10, 0.04, 0.16, dx+0.05, FF+0.78, dzc+1.05, "#2a2a2c"); C(0.012, 0.12, dx+0.05, FF+0.86, dzc+1.0, "#2a2a2c", 6);
    B(0.22, 0.012, 0.30, dx+0.08, FF+0.766, dzc-1.05, "#f2efe6"); C(0.04, 0.10, dx+0.14, FF+0.81, dzc-1.40, "#f2efe6", 12);
    C(0.24, 0.05, dx+0.75, FF+0.435, dzc, "#2a2a2c", 16); C(0.03, 0.40, dx+0.75, FF+0.21, dzc, "#5a5e62", 8); B(0.06, 0.48, 0.42, dx+1.0, FF+0.76, dzc, "#2a2a2c");
    B(0.04, 0.30, 0.04, dx+0.98, FF+0.54, dzc, "#5a5e62");
    for(let k=0;k<5;k++){ const a=k*1.2566; B(0.30, 0.03, 0.04, dx+0.75+Math.cos(a)*0.15, FF+0.04, dzc-Math.sin(a)*0.15, "#2a2a2c", a); }
    WEIGH_RT.desk={x:dx+0.75, z:dzc, y:FF};
    // at the service window: the ledge on this side carries the stamp, the ticket printer, the intercom; a stool
    { const lx=PX-PT/2-0.15, lz=(SVC.a+SVC.b)/2;
      B(0.20, 0.10, 0.24, lx, SVC.sill+0.09, lz+0.35, "#e8e6de"); B(0.16, 0.004, 0.10, lx, SVC.sill+0.142, lz+0.35, "#f6f4ee");
      C(0.03, 0.06, lx, SVC.sill+0.07, lz-0.25, "#1d1d1e", 10); C(0.045, 0.02, lx, SVC.sill+0.05, lz-0.25, "#5a3a2a", 12);
      B(0.10, 0.12, 0.06, PX-PT/2-0.04, SVC.head+0.18, lz, "#2a2a2c");
      C(0.18, 0.04, PX-0.75, FF+0.70, lz, "#2a2a2c", 14); C(0.025, 0.68, PX-0.75, FF+0.34, lz, "#5a5e62", 8); C(0.18, 0.02, PX-0.75, FF+0.012, lz, "#5a5e62", 14);
      addCol(PX-0.94, PX-0.56, lz-0.19, lz+0.19, FF-0.5, FF+0.72); addSeat(PX-0.75, lz, FF, -Math.PI/2, "THE STOOL AT THE SERVICE WINDOW", false, 0.34); }
    // the radio base by the north window: a set on a little table, the handset, the mic on its stalk
    { const x=-62.3, z=IZ0+0.32; B(0.9, 0.04, 0.5, x, FF+0.74, z, "#8a7a62"); for(const dx2 of [-0.42, 0.42]) B(0.04, 0.72, 0.46, x+dx2, FF+0.36, z, "#5a5e62");
      B(0.40, 0.14, 0.28, x-0.15, FF+0.83, z, "#1d1d1e"); B(0.30, 0.06, 0.004, x-0.15, FF+0.85, z+0.142, "#3aff7a"); C(0.008, 0.18, x+0.25, FF+0.85, z, "#2a2a2c", 6); ent(new T.SphereGeometry(0.025, 10, 8), x+0.25, FF+0.95, z, "#2a2a2c");
      addCol(x-0.45, x+0.45, IZ0, z+0.26, FF-0.5, FF+0.78); }
    // the hooks by the break room door: hard hats, vests; the wheel-load scales stacked on the floor under them
    { const z0=D1.b+0.25; B(0.04, 0.06, 0.9, PX-PT/2-0.02, FF+1.70, z0+0.45, "#5a5e62");
      for(let k=0;k<3;k++){ const z=z0+0.15+k*0.3; B(0.025, 0.08, 0.025, PX-PT/2-0.05, FF+1.66, z, "#5a5e62");
        RB(0.06, 0.62, 0.40, PX-PT/2-0.09, FF+1.30, z, k%2 ? "#e8f040" : "#ff7a1a", 0, 0.02);
        ent(new T.SphereGeometry(0.13, 14, 8, 0, Math.PI*2, 0, Math.PI/2), PX-PT/2-0.20, FF+1.76, z, k ? "#f4f2ec" : "#e6c21c"); }
      for(let k=0;k<4;k++) B(0.62, 0.05, 0.42, PX-0.62, FF+0.04+k*0.055, IZ1-0.42, "#e6c21c"); B(0.10, 0.06, 0.30, PX-0.95, FF+0.255, IZ1-0.42, "#1d1d1e");
      addCol(PX-0.94, PX-0.30, IZ1-0.64, IZ1, FF-0.5, FF+0.25); }
    // the TV over the desk's south end, the cameras up on it
    { const z=-2939.4, y=FF+1.95; B(0.06, 0.40, 0.70, PX-PT/2-0.03, y, z, "#1d1d1e");
      signPanel(0.64, 0.36, signTex(320, 180, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0,0,Wd,Hh);
          for(let k=0;k<4;k++){ const x=(k%2)*Wd/2, yy=Math.floor(k/2)*Hh/2, g=c.createLinearGradient(0,yy,0,yy+Hh/2); g.addColorStop(0,"#5a6a7a"); g.addColorStop(1,"#3a3c3a");
            c.fillStyle=g; c.fillRect(x+3, yy+3, Wd/2-6, Hh/2-6); c.fillStyle="#2a2c2a"; c.beginPath(); c.moveTo(x+Wd*0.10, yy+Hh/2-3); c.lineTo(x+Wd*0.22, yy+Hh*0.22); c.lineTo(x+Wd*0.28, yy+Hh*0.22); c.lineTo(x+Wd*0.40, yy+Hh/2-3); c.fill();
            c.fillStyle="#f4f2ec"; c.font="9px monospace"; c.fillText("CAM "+(k+1), x+8, yy+14); } }), PX-PT/2-0.071, y, z, -Math.PI/2, true); }
    // the lights
    for(const zz of [IZ0+2.4, (IZ0+IZ1)/2, IZ1-2.4]){ bx("paintm", 0.34, 0.08, 1.24, (IX0+PX)/2, CL-0.04, zz, 0, 0, "#e6e6e2"); push("tube", boxGeo(0.28, 0.02, 1.16, 0), (IX0+PX)/2, CL-0.09, zz, 0, "#ffffff"); }
    for(const zz of [IZ0+3.0, IZ1-3.0]) LAMPS.push({x:(IX0+PX)/2, y:CL-0.25, z:zz, color:0xf2f6f2, intensity:0.75, dist:6, decay:1.4, indoor:true, vol:[IX0-0.2, PX, IZ0-0.2, IZ1+0.2, FF-1, CL+0.5]}); }

  /* ---- the lobby: the counter at the service window and its sign, a bench under the east window, the water cooler, the
     map of the truck routes, the limits on the north wall, a snack machine, the bin; the rules by the door ---- */
  { const vx=PX+PT/2;
    sign(0.9, 0.34, (c,Wd,Hh)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh*0.36);
        say(c, "DRIVERS", Wd/2, Hh*0.18, Wd*0.7, Hh*0.22, "#f4f2ec", "900", "Arial"); say(c, "LICENSE · LOG · REGISTRATION", Wd/2, Hh*0.62, Wd*0.80, Hh*0.17, "#1a1a1a", "800", "Arial"); },
      vx+0.012, SVC.head+0.30, (SVC.a+SVC.b)/2, Math.PI/2, false, 450);
    B(0.10, 0.06, 0.10, vx+0.20, SVC.sill+0.07, SVC.a+0.25, "#c8a050");
    // the bench under the east window
    { const x=IX1-0.28, z=(EW1.a+EW1.b)/2; for(const dz of [-0.75, 0.75]) B(0.36, 0.42, 0.06, x, FF+0.21, z+dz, "#3a3c3e");
      for(let k=0;k<3;k++) B(0.10, 0.04, 1.6, x-0.12+k*0.12, FF+0.44, z, "#7a5a3a"); addCol(x-0.2, IX1, z-0.82, z+0.82, FF-0.5, FF+0.46);
      for(const dz of [-0.4, 0.4]) addSeat(x, z+dz, FF, Math.PI/2, "THE BENCH IN THE LOBBY"); }
    // the water cooler
    { const x=IX1-0.28, z=PZ-PT/2-0.32; B(0.32, 0.95, 0.32, x, FF+0.475, z, "#e8e6de"); B(0.004, 0.10, 0.18, x-0.162, FF+0.82, z, "#2a2a2c");
      push("glass", new T.CylinderGeometry(0.13, 0.13, 0.42, 16), x, FF+1.17, z, 0, "#ffffff"); C(0.12, 0.38, x, FF+1.16, z, "#8ac0e0", 16);
      addCol(x-0.17, x+0.17, z-0.17, z+0.17, FF-0.5, FF+1.4); }
    // the map on the partition between the doors, the limits on the north wall
    { const mx=(D2.b+D3.a)/2, mz=PZ-PT/2; bx("paintm", 2.06, 1.16, 0.03, mx, FF+1.55, mz-0.016, 0.5, 0, "#3a2a1c");
      sign(2.0, 1.1, (c,Wd,Hh)=>{ c.fillStyle="#f2efe2"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh*0.15);
          say(c, "PENNSYLVANIA · TRUCK ROUTES", Wd/2, Hh*0.08, Wd*0.7, Hh*0.07, "#f4f2ec", "900", "Arial");
          c.fillStyle="#e2dcc4"; c.beginPath(); c.moveTo(Wd*0.08, Hh*0.2); c.lineTo(Wd*0.30, Hh*0.18); c.lineTo(Wd*0.34, Hh*0.24); c.lineTo(Wd*0.92, Hh*0.22); c.lineTo(Wd*0.94, Hh*0.86); c.lineTo(Wd*0.08, Hh*0.88); c.closePath(); c.fill();
          c.strokeStyle="#c41a1a"; c.lineWidth=5; c.beginPath(); c.moveTo(Wd*0.20, Hh*0.22); c.lineTo(Wd*0.22, Hh*0.86); c.stroke();
          c.beginPath(); c.moveTo(Wd*0.08, Hh*0.62); c.bezierCurveTo(Wd*0.4, Hh*0.58, Wd*0.6, Hh*0.66, Wd*0.94, Hh*0.60); c.stroke();
          c.strokeStyle="#1f4f8c"; c.lineWidth=3; c.beginPath(); c.moveTo(Wd*0.5, Hh*0.22); c.lineTo(Wd*0.55, Hh*0.86); c.stroke(); c.beginPath(); c.moveTo(Wd*0.08, Hh*0.40); c.lineTo(Wd*0.94, Hh*0.44); c.stroke();
          c.fillStyle="#1a1a1a"; for(const [px, py, n] of [[0.20,0.24,"ERIE"],[0.21,0.70,"PITTSBURGH"],[0.56,0.60,"HARRISBURG"],[0.88,0.66,"PHILADELPHIA"],[0.50,0.40,"WILLIAMSPORT"]]){
            c.beginPath(); c.arc(Wd*px, Hh*py, 5, 0, 7); c.fill(); }
          c.fillStyle="#c41a1a"; c.beginPath(); c.arc(Wd*0.205, Hh*0.30, 8, 0, 7); c.fill();
          say(c, "YOU ARE HERE · I-79", Wd*0.40, Hh*0.30, Wd*0.26, Hh*0.06, "#c41a1a", "800", "Arial"); }, mx, FF+1.55, mz-0.044, Math.PI, false, 800);
      bx("paintm", 0.86, 1.06, 0.03, -58.75, FF+1.55, IZ0+0.022, 0.5, 0, "#3a2a1c");
      sign(0.80, 1.0, (c,Wd,Hh)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh*0.14);
          say(c, "SIZE & WEIGHT", Wd/2, Hh*0.07, Wd*0.7, Hh*0.08, "#f4f2ec", "900", "Arial");
          const L=[["GROSS","80,000 LB"],["SINGLE AXLE","20,000 LB"],["TANDEM","34,000 LB"],["WIDTH","8 FT 6 IN"],["HEIGHT","13 FT 6 IN"],["TRAILER","53 FT"]];
          L.forEach(([a,b],k)=>{ say(c, a, Wd*0.30, Hh*(0.24+k*0.12), Wd*0.34, Hh*0.05, "#1a1a1a", "800", "Arial"); say(c, b, Wd*0.70, Hh*(0.24+k*0.12), Wd*0.34, Hh*0.05, "#c41a1a", "800", "Arial"); }); },
        -58.75, FF+1.55, IZ0+0.050, 0, false, 400); }
    // the snack machine in the north-west corner, its window lit
    { const x=vx+0.48, z=IZ0+0.42; B(0.92, 1.80, 0.78, x, FF+0.90, z, "#2a3a5a");
      signPanel(0.62, 1.10, signTex(186, 330, (c,Wd,Hh)=>{ c.fillStyle="#1a1a1e"; c.fillRect(0,0,Wd,Hh);
          for(let r=0;r<5;r++) for(let k=0;k<4;k++){ c.fillStyle=["#c41a1a","#f2c418","#2f7a3c","#1f4f8c","#e8641a"][(r+k)%5]; c.fillRect(14+k*42, 16+r*62, 30, 40); c.fillStyle="#c8ccd0"; c.fillRect(10+k*42, 60+r*62, 38, 3); } }),
        x-0.1, FF+1.05, z+0.40, 0, true);
      B(0.20, 0.50, 0.012, x+0.33, FF+1.1, z+0.396, "#3a3c3e"); addCol(x-0.46, x+0.46, IZ0, z+0.39, FF-0.5, FF+1.8); }
    C(0.18, 0.62, NDX+0.9, FF+0.31, IZ0+0.30, "#5a5e62", 14); addCol(NDX+0.72, NDX+1.08, IZ0+0.12, IZ0+0.48, FF-0.5, FF+0.62);
    for(const xx of [-58.4, -55.9]){ bx("paintm", 0.34, 0.08, 1.24, xx, CL-0.04, (IZ0+PZ)/2, 0, 0, "#e6e6e2"); push("tube", boxGeo(0.28, 0.02, 1.16, 0), xx, CL-0.09, (IZ0+PZ)/2, 0, "#ffffff"); }
    LAMPS.push({x:-57.4, y:CL-0.25, z:(IZ0+PZ)/2, color:0xf2f6f2, intensity:0.7, dist:6, decay:1.4, indoor:true, vol:[PX, IX1+0.2, IZ0-0.2, PZ, FF-1, CL+0.5]}); }

  /* ---- the restroom: the toilet, the sink and its mirror, the towels, the grab bar ---- */
  { const x1=IX1, z0=PZ+PT/2, z1=RZ-PT/2, xm=(RX+PT/2+x1)/2;
    RB(0.38, 0.40, 0.60, x1-0.32, FF+0.21, z1-0.55, "#f6f6f2", Math.PI/2, 0.08); RB(0.20, 0.38, 0.52, x1-0.11, FF+0.62, z1-0.55, "#f6f6f2", Math.PI/2, 0.04);
    C(0.19, 0.02, x1-0.34, FF+0.42, z1-0.55, "#f2f2ee", 16);
    tubeE(V3(x1-0.03, FF+0.85, z1-0.95), V3(x1-0.03, FF+0.85, z1-0.20), 0.016, "#c8ccd0");
    RB(0.38, 0.14, 0.46, RX+PT/2+0.20, FF+0.82, z0+1.45, "#f6f6f2", 0, 0.04); C(0.012, 0.12, RX+PT/2+0.08, FF+0.94, z0+1.45, "#c8ccd0", 8);
    B(0.012, 0.56, 0.42, RX+PT/2+0.008, FF+1.40, z0+1.45, "#c8d4dc"); B(0.12, 0.30, 0.20, RX+PT/2+0.07, FF+1.30, z0+2.10, "#e8e6de");
    addCol(x1-0.62, x1, z1-0.86, z1-0.24, FF-0.5, FF+0.8); addCol(RX, RX+PT/2+0.40, z0+1.21, z0+1.69, FF-0.5, FF+0.9);
    bx("paintm", 0.28, 0.06, 0.8, xm, CL-0.03, (z0+z1)/2, 0, 0, "#e6e6e2"); push("tube", boxGeo(0.22, 0.02, 0.72, 0), xm, CL-0.07, (z0+z1)/2, 0, "#ffffff");
    LAMPS.push({x:xm, y:CL-0.3, z:(z0+z1)/2, color:0xf2f6f2, intensity:0.45, dist:4, decay:1.5, indoor:true, vol:[RX, IX1+0.2, PZ, RZ, FF-1, CL+0.5]}); }

  /* ---- the break room: the kitchenette under the south window (the fridge, the cabinets, the sink, the microwave, the
     coffee), the table and its chairs, the lockers, the couch by the partition, the time clock, the back door ---- */
  { const kz=IZ1-0.31, kx0=PX+PT/2+0.02, kx1=-56.9;
    B(0.72, 1.72, 0.64, kx0+0.36, FF+0.86, IZ1-0.33, "#e8e6de"); B(0.02, 0.50, 0.02, kx0+0.69, FF+1.25, IZ1-0.64, "#b8bcc0"); B(0.02, 0.30, 0.02, kx0+0.69, FF+0.50, IZ1-0.64, "#b8bcc0");
    B(kx1-kx0-0.74, 0.86, 0.58, (kx0+0.74+kx1)/2, FF+0.43, kz+0.02, "#6a5a48"); B(kx1-kx0-0.70, 0.04, 0.62, (kx0+0.74+kx1)/2, FF+0.88, kz, "#c8c0b0");
    for(let x=kx0+0.95; x<kx1-0.1; x+=0.55) B(0.012, 0.70, 0.45, x, FF+0.42, kz-0.29, "#5a4a3a");
    B(0.50, 0.012, 0.36, (SW2.a+SW2.b)/2, FF+0.904, kz, "#9a9ea2"); tubeE(V3((SW2.a+SW2.b)/2, FF+0.90, kz+0.22), V3((SW2.a+SW2.b)/2, FF+1.18, kz+0.22), 0.012, "#c8ccd0");
    tubeE(V3((SW2.a+SW2.b)/2, FF+1.18, kz+0.22), V3((SW2.a+SW2.b)/2, FF+1.18, kz+0.06), 0.012, "#c8ccd0");
    B(0.50, 0.30, 0.38, kx1-0.40, FF+1.05, kz, "#2a2a2c"); B(0.004, 0.20, 0.26, kx1-0.40, FF+1.05, kz-0.192, "#1a1a1e");
    B(0.20, 0.30, 0.22, kx1-0.90, FF+1.05, kz, "#1d1d1e"); C(0.06, 0.14, kx1-0.88, FF+0.97, kz-0.12, "#5a4a3a", 12);
    B(0.62, 0.62, 0.34, -57.35, FF+1.85, IZ1-0.18, "#6a5a48"); B(0.70, 0.46, 0.34, kx0+0.36, FF+2.05, IZ1-0.18, "#6a5a48");
    addCol(kx0, kx1, IZ1-0.66, IZ1, FF-0.5, FF+0.92);
    // the table and four chairs
    { const tx=-58.4, tz=-2938.6; B(1.2, 0.04, 0.8, tx, FF+0.74, tz, "#d8d0c0"); C(0.04, 0.72, tx, FF+0.36, tz, "#5a5e62", 8); B(0.6, 0.02, 0.5, tx, FF+0.012, tz, "#5a5e62");
      addCol(tx-0.6, tx+0.6, tz-0.4, tz+0.4, FF-0.5, FF+0.76);
      for(const [sx, sz, ry] of [[tx-0.35, tz-0.62, 0],[tx+0.35, tz-0.62, 0],[tx-0.35, tz+0.62, Math.PI],[tx+0.35, tz+0.62, Math.PI]]){
        const f=XF(sx, sz, ry), q=(w,h,d,lx,ly,lz,c)=>ent(boxGeo(w,h,d), f.x(lx,lz), FF+ly, f.z(lx,lz), c, 0, ry, 0);
        q(0.42, 0.04, 0.42, 0, 0.45, 0, "#1f4f8c"); for(const ax of [-0.18, 0.18]) for(const az of [-0.18, 0.18]) q(0.025, 0.45, 0.025, ax, 0.225, az, "#5a5e62");
        q(0.42, 0.30, 0.03, 0, 0.75, -0.19, "#1f4f8c"); addSeat(sx, sz, FF, ry+Math.PI, "A CHAIR IN THE BREAK ROOM"); } }
    // the lockers along the scale room's wall
    { const x=PX+PT/2+0.22; for(let k=0;k<5;k++){ const z=-2941.4+k*0.38; B(0.42, 1.82, 0.36, x, FF+0.91, z, "#5a6a7a");
        for(let j=0;j<4;j++) B(0.004, 0.02, 0.22, x+0.212, FF+1.55+j*0.04, z, "#3a4a5a"); B(0.02, 0.10, 0.03, x+0.215, FF+1.0, z+0.12, "#c8ccd0"); }
      addCol(PX, x+0.21, -2941.6, -2939.6, FF-0.5, FF+1.82); }
    // the couch along the partition, facing the table
    { const cx=-57.3, cz=PZ+PT/2+0.42; RB(1.7, 0.42, 0.78, cx, FF+0.21, cz, "#4a5a4a", 0, 0.06); RB(1.7, 0.50, 0.20, cx, FF+0.62, cz-0.30, "#4a5a4a", 0, 0.06);
      for(const sd of [-1,1]) RB(0.18, 0.26, 0.78, cx+sd*0.78, FF+0.50, cz, "#4a5a4a", 0, 0.06);
      addCol(cx-0.88, cx+0.88, cz-0.4, cz+0.4, FF-0.5, FF+0.6); for(const dx2 of [-0.4, 0.4]) addSeat(cx+dx2, cz+0.05, FF, Math.PI, "THE COUCH IN THE BREAK ROOM", false, 0.72); }
    // the time clock and its card rack on the restroom's wall
    { const z=RZ+PT/2; B(0.26, 0.32, 0.12, -55.3, FF+1.40, z+0.06, "#d8d4c8"); C(0.07, 0.01, -55.3, FF+1.48, z+0.125, "#f4f2ec", 16, Math.PI/2);
      B(0.40, 0.50, 0.04, -54.85, FF+1.35, z+0.02, "#8a8e90"); for(let k=0;k<5;k++) B(0.08, 0.10, 0.006, -54.95+(k%3)*0.10, FF+1.48-Math.floor(k/3)*0.16, z+0.045, "#f2efe2"); }
    for(const [xx, zz] of [[-58.4, -2940.0],[-58.4, -2936.4],[-55.3, -2936.4]]){ bx("paintm", 0.34, 0.08, 1.24, xx, CL-0.04, zz, 0, 0, "#e6e6e2"); push("tube", boxGeo(0.28, 0.02, 1.16, 0), xx, CL-0.09, zz, 0, "#ffffff"); }
    for(const [xx, zz] of [[-58.4, -2939.0],[-55.6, -2936.4]]) LAMPS.push({x:xx, y:CL-0.25, z:zz, color:0xf2f6f2, intensity:0.65, dist:6, decay:1.4, indoor:true, vol:[PX, IX1+0.2, PZ, IZ1+0.2, FF-1, CL+0.5]}); }

  /* ---- the shed out back: block, a flat roof, a steel door facing the scale house's back door. Salt, cones, the mower,
     the snow blower, shovels, a bench; and along its south wall, behind a plain door, the stair down ---- */
  const SH=W.shed, zq=z=>z+(SH.z0+2930), Ys=roadY((SH.z0+SH.z1)/2), SF=Ys+0.15, SWT=0.2, SX0=SH.x0+SWT, SX1=SH.x1-SWT, SZ0=SH.z0+SWT, SZ1=SH.z1-SWT, STOP=SF+2.45;
  const DN=W.den, DF=Ys-2.75, DCL=Ys-0.31;                                         // the room under it: its floor, its ceiling
  const STZ0=zq(-2927.30), STZ1=SZ1, LX=-58.75, NR=11, RS=(SF-DF)/NR, RN=(SX1-LX)/(NR-1);   // the stair: its strip, the landing's end, its risers
  const SPZ=STZ0-0.06;                                                             // (the partition between the shed and the stair)
  const SDR={a:-58.4, b:-57.4, sill:SF-0.02, head:SF+2.05}, SWN={a:-59.6, b:-58.9, sill:SF+1.15, head:SF+1.75}, BDR={a:-59.74, b:-58.82, sill:SF-0.02, head:SF+2.05};
  { // the slab, round the stair's opening (the ground is holed under all of it, 04's WEIGH_HOLES)
    const sb=Ys-0.30, sl=(x0,x1,z0,z1)=>bx("concrete", x1-x0, SF-sb, z1-z0, (x0+x1)/2, (SF+sb)/2, (z0+z1)/2, 0.5, 0, "#b8b4aa");
    sl(SH.x0-0.1, SH.x1+0.1, SH.z0-0.1, STZ0); sl(SH.x0-0.1, LX, STZ0, SH.z1+0.1); sl(LX, SH.x1+0.1, STZ1, SH.z1+0.1); sl(SX1, SH.x1+0.1, STZ0, STZ1);
    addFlat(SH.x0-0.1, SH.x1+0.1, SH.z0-0.1, STZ0, SF); addFlat(SH.x0-0.1, LX, STZ0, SH.z1+0.1, SF);
    bx("concrete", 1.2, 0.17, 0.5, (SDR.a+SDR.b)/2, Ys+0.0, SH.z0-0.35, 0.5, 0, "#b8b4aa"); addFlat(SDR.a-0.1, SDR.b+0.1, SH.z0-0.6, SH.z0-0.1, Ys+0.085);
    // the walls, the roof, the door, the window
    runX("block", SH.z0+SWT/2, SWT, SH.x0, SH.x1, SF-0.02, STOP, [SWN, SDR], "#b8bca8", 0.5);
    runX("block", SH.z1-SWT/2, SWT, SH.x0, SH.x1, SF-0.02, STOP, [], "#b8bca8", 0.5);
    runZ("block", SH.x0+SWT/2, SWT, SZ0, SZ1, SF-0.02, STOP, [], "#b8bca8", 0.5);
    runZ("block", SH.x1-SWT/2, SWT, SZ0, SZ1, SF-0.02, STOP, [], "#b8bca8", 0.5);
    bx("concrete", SH.x1-SH.x0+0.6, 0.2, SH.z1-SH.z0+0.6, (SH.x0+SH.x1)/2, STOP-0.02+0.10, (SH.z0+SH.z1)/2, 0.5, 0, "#6a6a68");
    ceilAt("plaster", SX0, SX1, SZ0, SZ1, STOP-0.03, "#c8c4b8");
    frX(SH.z0+SWT/2, SWT, SDR.a, SDR.b, SDR.sill, SDR.head, TRIM);
    makeDoor(XF(SDR.a+0.02, SH.z0+SWT/2, 0), 0, SF+0.01, 0, "THE SHED", true, 0, "steel", 0x5a6a5a);
    addFlat(SDR.a, SDR.b, SH.z0-0.01, SZ0+0.01, SF);
    push("glass", planeGeo(SWN.b-SWN.a-0.04, SWN.head-SWN.sill-0.04, 0), (SWN.a+SWN.b)/2, (SWN.sill+SWN.head)/2, SH.z0+SWT/2, 0, "#ffffff");
    frX(SH.z0+SWT/2, SWT, SWN.a, SWN.b, SWN.sill, SWN.head, TRIM);
    // the partition between the shed and the stair, and the plain door in it at the landing
    runX("plaster", SPZ, 0.12, SX0, SX1, SF-0.01, STOP-0.01, [BDR], "#d8d4c8", 0.5);
    frX(SPZ, 0.12, BDR.a, BDR.b, BDR.sill, BDR.head, "#3a2a1c");
    makeDoor(XF(BDR.a+0.02, SPZ, 0), 0, SF+0.01, 0, "THE BASEMENT", true, 0, "closet", 0x5a3a24);
    addFlat(BDR.a, BDR.b, SPZ-0.07, SPZ+0.07, SF);
    // colliders: the walls round the door, the partition round its door
    addCol(SH.x0, SDR.a, SH.z0, SZ0, SF-0.5, STOP); addCol(SDR.b, SH.x1, SH.z0, SZ0, SF-0.5, STOP); addCol(SH.x0, SH.x1, SZ1, SH.z1, SF-0.5, STOP);
    addCol(SH.x0, SX0, SZ0, SZ1, SF-0.5, STOP); addCol(SX1, SH.x1, SZ0, SZ1, SF-0.5, STOP);
    addCol(BDR.b, SX1, SPZ-0.06, SPZ+0.06, SF-0.5, STOP);
    addZone(SX0, SX1, SZ0, SZ1, SF-0.5, STOP, "THE SHED", true);
    // a bare bulb in a cage; the light over the door outside
    C(0.05, 0.05, (SX0+SX1)/2, STOP-0.06, (SZ0+SPZ)/2, "#2a2a2c", 10); push("cafe_bulb", new T.SphereGeometry(0.045, 10, 8), (SX0+SX1)/2, STOP-0.14, (SZ0+SPZ)/2, 0, "#ffffff");
    LAMPS.push({x:(SX0+SX1)/2, y:STOP-0.3, z:(SZ0+SPZ)/2, color:0xffe2b8, intensity:0.45, dist:5, decay:1.6, indoor:true, vol:[SX0, SX1, SZ0, SZ1, SF-1, STOP]});
    B(0.20, 0.12, 0.16, (SDR.a+SDR.b)/2, SDR.head+0.28, SH.z0-0.075, "#2a2a2c"); push("lamplens", planeGeo(0.16, 0.10, 0), (SDR.a+SDR.b)/2, SDR.head+0.215, SH.z0-0.075, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:(SDR.a+SDR.b)/2, y:SDR.head+0.1, z:SH.z0-0.6, color:0xffe2b8, intensity:0.45, dist:7, decay:1.6, mothy:true});
    // inside: steel shelving down the west wall (salt, paint, boxes), the mower and the snow blower, cones, the tools on
    // the east wall, a little bench
    { const x=SX0+0.24, ze=zq(-2928.35);                                    // (stopping short of the partition: the basement door wants room)
      for(const z of [SZ0+0.05, ze]) for(const dx of [-0.2, 0.2]) B(0.03, 1.8, 0.03, x+dx, SF+0.9, z, "#8a8e90");
      for(const y of [0.12, 0.62, 1.12, 1.62]) B(0.46, 0.02, ze-SZ0, x, SF+y, (SZ0+ze)/2+0.025, "#9a9ea2");
      for(let k=0;k<3;k++) RB(0.40, 0.16, 0.30, x, SF+0.215, SZ0+0.35+k*0.42, "#e8e4d8", 0, 0.06);
      for(let k=0;k<4;k++) C(0.09, 0.20, x-0.1+(k%2)*0.2, SF+0.73, SZ0+0.3+Math.floor(k/2)*0.6, ["#e8e4d8","#2f5a3a","#c8a050"][k%3], 14);
      for(let k=0;k<2;k++) B(0.40, 0.28, 0.42, x, SF+1.27, SZ0+0.35+k*0.62, "#b8986a");
      addCol(SX0, x+0.23, SZ0, ze+0.02, SF-0.5, SF+1.8); }
    // the mower against the east wall, its handle folded back toward the room; the snow blower beside it, handles up
    { const mx=-56.6, mz=zq(-2929.4); B(0.50, 0.26, 0.60, mx, SF+0.25, mz, "#c41a1a"); C(0.10, 0.22, mx, SF+0.45, mz, "#2a2a2c", 12);
      for(const [dx2, dz2] of [[-0.24,-0.26],[0.24,-0.26],[-0.24,0.26],[0.24,0.26]]) C(0.09, 0.05, mx+dx2, SF+0.09, mz+dz2, "#1d1d1e", 12, 0, 0, Math.PI/2);
      for(const dz2 of [-0.2, 0.2]) tubeE(V3(mx-0.25, SF+0.35, mz+dz2), V3(mx-0.75, SF+0.80, mz+dz2), 0.012, "#2a2a2c");
      tubeE(V3(mx-0.75, SF+0.80, mz-0.2), V3(mx-0.75, SF+0.80, mz+0.2), 0.014, "#2a2a2c");
      addCol(mx-0.78, mx+0.26, mz-0.32, mz+0.32, SF-0.5, SF+0.85); }
    { const bx0=-56.62, bz0=zq(-2928.15); RB(0.62, 0.60, 0.72, bx0, SF+0.36, bz0, "#e8641a", 0, 0.05); B(0.66, 0.24, 0.20, bx0, SF+0.28, bz0-0.46, "#3a3c3e");
      for(const dx2 of [-0.2, 0.2]) tubeE(V3(bx0+dx2, SF+0.60, bz0+0.30), V3(bx0+dx2, SF+1.02, bz0+0.48), 0.012, "#2a2a2c");
      tubeE(V3(bx0-0.2, SF+1.02, bz0+0.48), V3(bx0+0.2, SF+1.02, bz0+0.48), 0.014, "#2a2a2c");
      addCol(bx0-0.33, bx0+0.33, bz0-0.56, bz0+0.5, SF-0.5, SF+1.05); }
    // a stack of cones by the window
    for(let k=0;k<4;k++) ent(new T.ConeGeometry(0.16, 0.62, 12), -59.0, SF+0.33+k*0.08, SZ0+0.32, "#ff6a1a");
    B(0.36, 0.03, 0.36, -59.0, SF+0.017, SZ0+0.32, "#1d1d1e"); addCol(-59.2, -58.8, SZ0, SZ0+0.52, SF-0.5, SF+0.9);
    B(0.04, 0.08, 1.4, SX1-0.03, SF+1.55, zq(-2928.7), "#6a4a2a");
    for(let k=0;k<4;k++){ const z=zq(-2929.25)+k*0.36; tubeE(V3(SX1-0.08, SF+0.25, z), V3(SX1-0.08, SF+1.55, z), 0.014, "#8a6a48");
      B(0.04, 0.22+((k%2)*0.06), 0.24, SX1-0.08, SF+0.16, z, k%2 ? "#8a8e90" : "#3a3c3e"); } }

  /* ---- the stair down: wood treads on solid risers, a rail on posts along its open side ---- */
  { addVoid(LX, SX1, STZ0, STZ1, DF-3, Ys+0.6, DF);
    for(let k=1;k<NR;k++){ const xa=LX+(k-1)*RN, xb=LX+k*RN+(k===NR-1 ? 0.01 : 0), y=SF-k*RS;
      bx("paintm", xb-xa, y-(DF-0.05), STZ1-STZ0-0.004, (xa+xb)/2, (y+DF-0.05)/2, (STZ0+STZ1)/2, 0.5, 0, k%2 ? "#5a3a24" : "#55361f");
      B(xb-xa+0.02, 0.03, STZ1-STZ0-0.006, (xa+xb)/2+0.01, y+0.012, (STZ0+STZ1)/2, "#7a5434");          // (the tread, its nosing over the step below)
      addFlat(xa, LX+k*RN, STZ0, STZ1, y+0.027); }
    addFlat(SX1-0.005, DN.x1, STZ0, STZ1, DF);
    // the rail along the stair's open (north) side, below the shed's floor: posts on the treads, a rail to the floor
    const rz=STZ0+0.05; for(const k of [2, 5, 8]){ const x=LX+(k-0.5)*RN, y=SF-k*RS; tubeE(V3(x, y+0.02, rz), V3(x, y+0.92, rz), 0.022, "#3a2a1c"); }
    tubeE(V3(LX+1.5*RN, SF-2*RS+0.92, rz), V3(LX+8.5*RN, SF-8*RS+0.92, rz), 0.03, "#3a2a1c");
    // a little light on the landing, and the skirt of plaster under the shed's partition down to the room's ceiling
    LAMPS.push({x:LX-0.4, y:SF+1.9, z:(STZ0+STZ1)/2, color:0xffd2a0, intensity:0.35, dist:4, decay:1.6, indoor:true, vol:[SX0, SX1, STZ0, STZ1, DF, STOP]});
    B(0.12, 0.05, 0.12, LX-0.4, STOP-0.05, (STZ0+STZ1)/2, "#3a2a1c"); push("cafe_bulb", new T.SphereGeometry(0.04, 10, 8), LX-0.4, STOP-0.12, (STZ0+STZ1)/2, 0, "#ffffff"); }

  /* ======================================================================
     THE LISTENING ROOM, under the shed. Walnut to the chair rail and a deep green over it, a coffered ceiling, a rug on the
     dark boards; the fire in its surround on the north wall, a print over it; the oxblood leather recliner in front of it,
     its lamp and its table; the cart of scotch beside it; the record console on the east wall with the turntable going,
     its speakers either side and the records in their shelves; a club chair for whoever comes down; books to the west.
     Someone in the recliner with a glass, listening. BURIED (06), its lamps under ones: the same at any hour.
     ====================================================================== */
  { const lampU=(o)=>{ o.under=true; o.indoor=true; LAMPS.push(o); return o; };
    bucketOf("den_walnut", ()=>{ const t=signTex(128, 128, (c,Wd,Hh)=>{ const q=_trng(2323); c.fillStyle="#5a3a22"; c.fillRect(0,0,Wd,Hh);
        for(let k=0;k<60;k++){ c.strokeStyle="rgba(40,24,12,"+(0.1+q()*0.25).toFixed(2)+")"; c.lineWidth=1+q()*2; const x=q()*Wd; c.beginPath(); c.moveTo(x,0); c.bezierCurveTo(x+q()*6-3, Hh*0.3, x+q()*6-3, Hh*0.7, x+q()*4-2, Hh); c.stroke(); }
        for(let k=0;k<4;k++){ c.fillStyle="rgba(20,12,6,0.6)"; c.fillRect(k*32, 0, 2, Hh); c.fillStyle="rgba(255,220,180,0.10)"; c.fillRect(k*32+2, 0, 1, Hh); } });
      t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial({map:t, roughness:0.45}); });
    bucketOf("den_green", ()=>new T.MeshStandardMaterial({map:TEX.drywall, roughness:0.9}));
    bucketOf("den_fire", ()=>{ const t=signTex(128, 64, (c,Wd,Hh)=>{ const g=c.createLinearGradient(0,Hh,0,0); g.addColorStop(0,"#ffcf6a"); g.addColorStop(0.5,"#ff7a1a"); g.addColorStop(1,"#3a0a00"); c.fillStyle=g; c.fillRect(0,0,Wd,Hh);
        c.fillStyle="#1a0a04"; for(let k=0;k<7;k++){ c.beginPath(); c.ellipse(10+k*18, Hh-6, 10, 5, 0, 0, Math.PI*2); c.fill(); } });
      return glowMat({color:0xffffff, map:t, emissive:0xffffff, emissiveMap:t, emissiveIntensity:1.0, roughness:0.6}, "indoor", null); });
    bucketOf("den_rug", ()=>new T.MeshStandardMaterial({roughness:0.95, map:signTex(512, 360, (c,Wd,Hh)=>{
        c.fillStyle="#6a1a1a"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#c8a050"; c.lineWidth=10; c.strokeRect(14,14,Wd-28,Hh-28); c.strokeStyle="#1a2a4a"; c.lineWidth=18; c.strokeRect(36,36,Wd-72,Hh-72);
        c.fillStyle="#1a2a4a"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.22, Hh*0.24, 0, 0, Math.PI*2); c.fill();
        c.fillStyle="#c8a050"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.12, Hh*0.13, 0, 0, Math.PI*2); c.fill();
        const q=_trng(4545); for(let k=0;k<160;k++){ c.fillStyle=["#c8a050","#e8d8b0","#1a2a4a","#8a2a2a"][k%4]; const a=q()*Math.PI*2, r=0.28+q()*0.12; c.fillRect(Wd/2+Math.cos(a)*Wd*r-3, Hh/2+Math.sin(a)*Hh*r-3, 6, 6); }
        for(const [x,y] of [[60,60],[Wd-60,60],[60,Hh-60],[Wd-60,Hh-60]]){ c.fillStyle="#c8a050"; c.beginPath(); c.arc(x, y, 18, 0, 7); c.fill(); c.fillStyle="#6a1a1a"; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); } })}));
    const X0=DN.x0, X1=DN.x1, Z0=DN.z0, Z1=DN.z1, RAIL=DF+1.0;
    // the shell: walls of block round it (in the ground: only their faces in here are seen), the liners, the floor, the ceiling
    runX("block", Z0-0.1, 0.2, X0-0.2, X1+0.2, DF-0.1, DCL+0.03, [], "#8a8478", 0.5); runX("block", Z1+0.1, 0.2, X0-0.2, X1+0.2, DF-0.1, DCL+0.03, [], "#8a8478", 0.5);
    runZ("block", X0-0.1, 0.2, Z0, Z1, DF-0.1, DCL+0.03, [], "#8a8478", 0.5); runZ("block", X1+0.1, 0.2, Z0, Z1, DF-0.1, DCL+0.03, [], "#8a8478", 0.5);
    for(const [y0, y1, bk, col, uv] of [[DF, RAIL, "den_walnut", "#ffffff", 1/0.5],[RAIL, DCL, "den_green", "#2f4a3a", 0.5]]){
      lineX(bk, Z0, 1, X0, X1, y0, y1, [], col, uv); lineX(bk, Z1, -1, X0, X1, y0, y1, [], col, uv);
      lineZ(bk, X0, 1, Z0, Z1, y0, y1, [], col, uv); lineZ(bk, X1, -1, Z0, Z1, y0, y1, [], col, uv); }
    // the chair rail and the baseboard: walnut, proud of the walls, the runs along z a little longer so the corners overlap
    for(const [f, dir] of [[Z0, 1],[Z1, -1]]){ B(X1-X0, 0.06, 0.04, (X0+X1)/2, RAIL, f+dir*0.022, "#3a2414"); B(X1-X0, 0.12, 0.025, (X0+X1)/2, DF+0.06, f+dir*0.014, "#2a1a0e"); }
    for(const [f, dir] of [[X0, 1],[X1, -1]]){ B(0.04, 0.064, Z1-Z0-0.01, f+dir*0.022, RAIL+0.001, (Z0+Z1)/2, "#3a2414"); B(0.025, 0.124, Z1-Z0-0.01, f+dir*0.014, DF+0.061, (Z0+Z1)/2, "#2a1a0e"); }
    floorAt("wood", X0, X1, Z0, Z1, DF+0.004, "#4a2e1c", 0.6);
    // the ceiling, round the stair's opening; dark beams across it in a grid, coffered
    for(const [a, b, c, d] of [[X0, X1, Z0, STZ0],[X0, LX, STZ0, STZ1],[SX1, X1, STZ0, STZ1],[X0, X1, STZ1, Z1]]) ceilAt("den_walnut", a, b, c, d, DCL, "#a07a5a", 1/0.5);
    for(let x=X0+1.07; x<X1-0.5; x+=1.07){ if(x>LX-0.1 && x<SX1+0.1) continue; B(0.14, 0.16, Z1-Z0-0.01, x, DCL-0.075, (Z0+Z1)/2, "#3a2414"); }
    for(let z=Z0+1.55; z<Z1-0.6; z+=1.55) if(z<STZ0-0.15 || z>STZ1+0.15) B(X1-X0-0.01, 0.15, 0.14, (X0+X1)/2, DCL-0.08, z, "#3a2414");
    // the opening's own sides, down from the shed's slab to the ceiling
    B(SX1-LX, 0.06, 0.04, (LX+SX1)/2, DCL+0.02, STZ0-0.02, "#3a2414");
    addVoid(X0, X1, Z0, Z1, DF-3, DF+1.2, DF); addFlat(X0, X1, Z0, Z1, DF);
    addBuried(X0, X1, Z0, Z1, DF-0.5, DCL+0.05, 0.6);
    addZone(X0, X1, Z0, Z1, DF-0.5, DCL, "THE LISTENING ROOM", true);
    // the rug
    push("den_rug", new T.PlaneGeometry(3.4, 2.4), -57.0, DF+0.012, zq(-2929.0), 0, "#ffffff", -Math.PI/2, 0);
    // the fire on the north wall: a stone surround, the mantel, the firebox and its glow; a print over it
    { const fx=-57.0, fz=Z0; B(1.7, 1.12, 0.32, fx, DF+0.56, fz+0.16, "#8a8070"); B(1.86, 0.08, 0.40, fx, DF+1.16, fz+0.20, "#3a2414");
      B(0.92, 0.56, 0.04, fx, DF+0.48, fz+0.31, "#1a1410"); push("den_fire", planeGeo(0.84, 0.46, 0), fx, DF+0.46, fz+0.335, 0, "#ffffff");
      for(let k=0;k<3;k++) C(0.05, 0.6, fx-0.22+k*0.22, DF+0.27+(k%2)*0.06, fz+0.40, "#3a2414", 8, 0, 0, Math.PI/2);
      addCol(fx-0.85, fx+0.85, fz, fz+0.46, DF-0.5, DF+1.2);
      lampU({x:fx, y:DF+0.6, z:fz+0.9, color:0xff9a4a, intensity:0.5, dist:5, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]});
      bx("paintm", 0.88, 0.66, 0.03, fx, DF+1.75, fz+0.022, 0.5, 0, "#c8a050");
      sign(0.80, 0.58, (c,Wd,Hh)=>{ c.fillStyle="#1a1e2a"; c.fillRect(0,0,Wd,Hh);
          c.fillStyle="#e8a03a"; c.beginPath(); c.arc(Wd*0.72, Hh*0.30, Hh*0.16, 0, Math.PI*2); c.fill();
          c.fillStyle="#0a0a0e"; c.beginPath(); c.ellipse(Wd*0.30, Hh*0.62, Wd*0.06, Hh*0.18, 0, 0, Math.PI*2); c.fill(); c.beginPath(); c.arc(Wd*0.30, Hh*0.38, Hh*0.06, 0, Math.PI*2); c.fill();
          c.strokeStyle="#c8a050"; c.lineWidth=5; c.beginPath(); c.moveTo(Wd*0.34, Hh*0.42); c.quadraticCurveTo(Wd*0.48, Hh*0.40, Wd*0.52, Hh*0.30); c.stroke();
          c.beginPath(); c.ellipse(Wd*0.54, Hh*0.26, Wd*0.03, Hh*0.06, -0.6, 0, Math.PI*2); c.stroke();
          say(c, "BLUE NOTES AT MIDNIGHT", Wd/2, Hh*0.86, Wd*0.80, Hh*0.08, "#e8d8b0", "700", "Georgia, serif"); }, fx, DF+1.75, fz+0.05, 0, false, 320); }
    // the recliner: oxblood leather, the back laid back, the footrest out; the lamp and the table by it; somebody in it
    { const rx=-57.0, rz=zq(-2929.35), f=XF(rx, rz, 0), L="#5a2218", q=(w,h,d,lx,ly,lz,rot)=>ent(rboxGeo(w,h,d,Math.min(0.06, Math.min(w,h,d)*0.3),2), f.x(lx,lz), DF+ly, f.z(lx,lz), L, rot||0, 0, 0);
      q(0.72, 0.30, 0.66, 0, 0.30, 0); q(0.66, 0.12, 0.56, 0, 0.47, -0.02); q(0.72, 0.74, 0.20, 0, 0.82, 0.36, 0.32);
      for(const sd of [-1,1]) q(0.16, 0.42, 0.74, sd*0.36, 0.42, 0.02);
      q(0.62, 0.10, 0.46, 0, 0.38, -0.52, -0.12); B(0.60, 0.05, 0.40, rx, DF+0.025, rz, "#1a1410");
      addCol(rx-0.45, rx+0.45, rz-0.78, rz+0.48, DF-0.5, DF+0.6);
      WEIGH_RT.recliner={x:rx, z:rz+0.02, y:DF};
      const tx=rx+0.72, tz=rz+0.05; C(0.22, 0.03, tx, DF+0.58, tz, "#3a2414", 18); C(0.03, 0.56, tx, DF+0.29, tz, "#3a2414", 8); C(0.16, 0.02, tx, DF+0.01, tz, "#3a2414", 14);
      C(0.07, 0.03, tx+0.08, DF+0.61, tz-0.05, "#e8eef0", 12); C(0.06, 0.012, tx-0.05, DF+0.60, tz+0.06, "#2a2a2c", 12);
      C(0.025, 0.42, tx-0.06, DF+0.81, tz+0.04, "#c8a050", 8); CT(0.11, 0.17, 0.20, tx-0.06, DF+1.10, tz+0.04, "#e8d8b0", 18); push("cafe_bulb", new T.SphereGeometry(0.035, 8, 6), tx-0.06, DF+1.03, tz+0.04, 0, "#ffffff");
      addCol(tx-0.23, tx+0.23, tz-0.23, tz+0.23, DF-0.5, DF+0.62);
      lampU({x:tx-0.06, y:DF+1.1, z:tz+0.04, color:0xffc890, intensity:0.6, dist:5, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]}); }
    // the cart of scotch: brass, two glass shelves; eight bottles with their labels, a decanter, the glasses, the ice
    { const cx=-58.25, cz=zq(-2929.55), Bc="#c8a050";
      for(const dx2 of [-0.36, 0.36]) for(const dz2 of [-0.20, 0.20]) tubeE(V3(cx+dx2, DF+0.06, cz+dz2), V3(cx+dx2, DF+0.86, cz+dz2), 0.012, Bc);
      tubeE(V3(cx-0.36, DF+0.86, cz-0.20), V3(cx+0.36, DF+0.86, cz-0.20), 0.012, Bc); tubeE(V3(cx-0.36, DF+0.86, cz+0.20), V3(cx+0.36, DF+0.86, cz+0.20), 0.012, Bc);
      for(const y of [0.30, 0.78]) push("glass", boxGeo(0.72, 0.012, 0.40, 0), cx, DF+y, cz, 0, "#ffffff");
      for(const y of [0.30, 0.78]) for(const dz2 of [-0.20, 0.20]) tubeE(V3(cx-0.36, DF+y, cz+dz2), V3(cx+0.36, DF+y, cz+dz2), 0.008, Bc);
      for(const [dx2, dz2] of [[-0.36,-0.22],[0.36,-0.22]]) C(0.05, 0.03, cx+dx2, DF+0.05, cz+dz2, "#1d1d1e", 12, 0, 0, Math.PI/2);
      const LB=[["GLEN LOON","12 YEARS","#e8d8b0","#3a1a0a"],["ERIE PEAT","18 YEARS","#1a2a1a","#e8d8b0"],["OLD PRESQUE","BLENDED","#f2efe2","#6a1a1a"],["HIGHLAND DOCK","15 YEARS","#1a2a4a","#e8d8b0"],
                ["ARDNALOON","ISLAY","#2a2a2a","#c8a050"],["SPEY MIST","SINGLE MALT","#e8e0c8","#2a4a3a"],["FRENCH CREEK","RYE","#c8a050","#2a1a0a"],["LAKE EFFECT","CASK","#5a1a1a","#f2efe2"]];
      const atlas=signTex(1024, 128, (c,Wd,Hh)=>{ LB.forEach(([n, s, bg, fg], k)=>{ const x0=k*128; c.fillStyle=bg; c.fillRect(x0+2, 0, 124, Hh); c.strokeStyle=fg; c.lineWidth=3; c.strokeRect(x0+8, 8, 112, Hh-16);
          c.fillStyle=fg; fitText(c, n, 96, 22, x0+64, Hh*0.40, "800", "Georgia, serif"); fitText(c, s, 96, 15, x0+64, Hh*0.68, "700", "Arial"); }); });
      const LBM=[]; const bottle=(x, y, z, k, tall)=>{ const h=tall ? 0.30 : 0.24, col=["#7a4a1a","#3a5a2a","#8a5a2a","#2a3a2a","#3a2a1a","#9a6a2a","#6a3a12","#5a2a12"][k];
          ent(new T.CylinderGeometry(0.038, 0.038, h, 14), x, y+h/2, z, col); ent(new T.CylinderGeometry(0.014, 0.03, 0.06, 12), x, y+h+0.03, z, col); C(0.016, 0.03, x, y+h+0.075, z, "#c8a050", 10);
          const g=new T.CylinderGeometry(0.0395, 0.0395, h*0.42, 14, 1, true, -Math.PI*0.40, Math.PI*0.80), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setX(i, (k+U.getX(i))/8);
          LBM.push({geo:g, matrix:new T.Matrix4().makeTranslation(x, y+h*0.45, z), color:new T.Color("#ffffff")}); };
      for(let k=0;k<5;k++) bottle(cx-0.28+k*0.14, DF+0.786, cz+(k%2 ? 0.06 : -0.06), k, k%2===0);
      for(let k=5;k<8;k++) bottle(cx-0.22+(k-5)*0.16, DF+0.306, cz-0.08, k, true);
      push("glass", new T.CylinderGeometry(0.06, 0.07, 0.20, 16), cx+0.20, DF+0.406, cz+0.10, 0, "#ffffff"); ent(new T.CylinderGeometry(0.055, 0.065, 0.10, 16), cx+0.20, DF+0.36, cz+0.10, "#b8742a");
      ent(new T.SphereGeometry(0.035, 12, 8), cx+0.20, DF+0.54, cz+0.10, "#e8eef0");
      for(let k=0;k<3;k++) push("glass", new T.CylinderGeometry(0.036, 0.032, 0.08, 14), cx+0.28-k*0.09, DF+0.826, cz+0.15, 0, "#ffffff");
      C(0.07, 0.12, cx-0.25, DF+0.37, cz+0.12, "#c8ccd0", 16); for(let k=0;k<4;k++) B(0.03, 0.03, 0.03, cx-0.25+(k%2-0.5)*0.03, DF+0.44, cz+0.12+(k>1?0.02:-0.02), "#e8f4f8");
      const lm=new T.Mesh(mergeEntries(LBM), new T.MeshStandardMaterial({map:atlas, roughness:0.6})); scene.add(lm);
      addCol(cx-0.40, cx+0.40, cz-0.26, cz+0.26, DF-0.5, DF+0.9); }
    // the record console on the east wall: walnut, the turntable on it going round, the receiver's dial lit; a speaker each
    // side of it on the floor; the records in their shelves south of it
    { const cx=X1-0.26, cz=zq(-2929.6); B(0.46, 0.62, 1.6, cx, DF+0.31, cz, "#4a2e1a"); B(0.48, 0.03, 1.62, cx, DF+0.635, cz, "#3a2414");
      for(let k=0;k<3;k++) B(0.012, 0.44, 0.48, cx-0.235, DF+0.30, cz-0.52+k*0.52, "#5a3a22");
      B(0.40, 0.10, 0.48, cx, DF+0.70, cz-0.36, "#5a3a22"); C(0.15, 0.025, cx, DF+0.762, cz-0.38, "#1a1a1a", 28);
      const plat=new T.Mesh(new T.CylinderGeometry(0.148, 0.148, 0.006, 32), new T.MeshStandardMaterial({color:0x0e0e0e, roughness:0.25, metalness:0.1}));
      const lab=new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.002, 20), new T.MeshStandardMaterial({color:0xc8241a, roughness:0.6})); lab.position.y=0.007; plat.add(lab);
      const mk=new T.Mesh(new T.BoxGeometry(0.018, 0.0022, 0.004), new T.MeshStandardMaterial({color:0xe8d8b0})); mk.position.set(0.03, 0.0085, 0); plat.add(mk);
      plat.position.set(cx, DF+0.778, cz-0.38); scene.add(plat); WEIGH_RT.platter=plat;
      tubeE(V3(cx-0.13, DF+0.79, cz-0.16), V3(cx-0.04, DF+0.79, cz-0.40), 0.006, "#c8ccd0"); C(0.02, 0.04, cx-0.13, DF+0.77, cz-0.16, "#c8ccd0", 10);
      B(0.38, 0.10, 0.40, cx, DF+0.70, cz+0.30, "#2a2a2c"); signPanel(0.30, 0.05, signTex(240, 40, (c,Wd,Hh)=>{ c.fillStyle="#f2a640"; c.fillRect(0,0,Wd,Hh);
          c.fillStyle="#3a1a0a"; for(let k=0;k<12;k++) c.fillRect(10+k*19, Hh*0.3, 2, Hh*0.4); c.fillStyle="#c41a1a"; c.fillRect(Wd*0.62, 4, 3, Hh-8); }), cx-0.205, DF+0.72, cz+0.30, -Math.PI/2, true);
      for(const dz2 of [-0.06, 0.06]) C(0.018, 0.02, cx-0.205, DF+0.67, cz+0.30+dz2, "#c8ccd0", 10, 0, 0, Math.PI/2);
      addCol(cx-0.24, X1, cz-0.8, cz+0.8, DF-0.5, DF+0.82);
      for(const sz2 of [cz-1.08, cz+1.08]){ B(0.34, 0.92, 0.30, X1-0.22, DF+0.46, sz2, "#3a2414"); B(0.012, 0.80, 0.24, X1-0.396, DF+0.48, sz2, "#2a2a22");
        for(const yy of [0.70, 0.36]) C(yy>0.5 ? 0.05 : 0.09, 0.01, X1-0.404, DF+yy, sz2, "#1a1a16", 18, 0, 0, Math.PI/2);
        addCol(X1-0.39, X1, sz2-0.15, sz2+0.15, DF-0.5, DF+0.92); }
      // the records: low shelves of cubes, the spines in every colour
      const q2=_trng(9191), rz0=zq(-2927.6), rz1=Z1-0.05;
      B(0.40, 0.90, rz1-rz0, X1-0.21, DF+0.45, (rz0+rz1)/2, "#3a2414");
      for(const y of [0.06, 0.46]){ let z=rz0+0.04; while(z<rz1-0.06){ const w=0.006+q2()*0.006; B(0.30, 0.31, w, X1-0.24, DF+y+0.17, z+w/2, ["#c41a1a","#1f4f8c","#e8d8b0","#2a2a2a","#e8a03a","#2f5a3a","#7a3a8a","#f2efe2"][(q2()*8)|0]); z+=w+0.0015; } }
      for(const y of [0.04, 0.44, 0.86]) B(0.405, 0.02, rz1-rz0+0.005, X1-0.21, DF+y, (rz0+rz1)/2, "#2a1a0e");
      addCol(X1-0.41, X1, rz0, rz1, DF-0.5, DF+0.9);
      WEIGH_RT.radio={x:cx, z:cz, y:DF+0.8, station:3, house:"THE LISTENING ROOM", zone:"THE LISTENING ROOM", vol:0.55};
      if(typeof LAKE_HOUSES!=="undefined") LAKE_HOUSES.radios.push(WEIGH_RT.radio);
      // the record goes round while he is down here; when he isn't, you can put one on yourself (and lift it off again)
      const u=addUse(cx-0.55, cz-0.38, DF+0.8, "PLAY A RECORD", ()=>{
        if(WEIGH_RT.here){ toast("HE RAISES A FINGER WITHOUT LOOKING ROUND. THE SOLO ISN'T OVER", "#e8d8b0"); return; }
        WEIGH_RT.spin=!WEIGH_RT.spin;
        toast(WEIGH_RT.spin ? "YOU DROP THE NEEDLE. A CRACKLE, AND THE TRIO COMES IN" : "YOU LIFT THE NEEDLE. THE ROOM GOES QUIET", "#e8d8b0"); }, 1.3,
        ()=>{ u.label=WEIGH_RT.here ? "THE RECORD" : WEIGH_RT.spin ? "LIFT THE NEEDLE" : "PLAY A RECORD"; return true; }); }
    // the club chair for whoever comes down, angled at the fire; a floor lamp by it
    { const cx=-55.35, cz=zq(-2928.35), ry=-0.65, f=XF(cx, cz, ry), L="#6a3a1e", q=(w,h,d,lx,ly,lz)=>ent(rboxGeo(w,h,d,Math.min(0.07, Math.min(w,h,d)*0.3),2), f.x(lx,lz), DF+ly, f.z(lx,lz), L, 0, ry, 0);
      q(0.80, 0.42, 0.78, 0, 0.21, 0); q(0.80, 0.50, 0.20, 0, 0.62, 0.30); for(const sd of [-1,1]) q(0.18, 0.30, 0.78, sd*0.36, 0.52, 0);
      addCol(cx-0.48, cx+0.48, cz-0.48, cz+0.48, DF-0.5, DF+0.6); addSeat(cx, cz, DF, ry+Math.PI, "THE CLUB CHAIR", false, 0.68);
      const lx=cx+0.62, lz=cz+0.30; C(0.15, 0.02, lx, DF+0.012, lz, "#2a2a2c", 14); C(0.012, 1.45, lx, DF+0.75, lz, "#c8a050", 6); CT(0.12, 0.19, 0.24, lx, DF+1.55, lz, "#e8d8b0", 18);
      push("cafe_bulb", new T.SphereGeometry(0.035, 8, 6), lx, DF+1.47, lz, 0, "#ffffff"); addCol(lx-0.15, lx+0.15, lz-0.15, lz+0.15, DF-0.5, DF+1.6);
      lampU({x:lx, y:DF+1.5, z:lz, color:0xffc890, intensity:0.45, dist:5, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]}); }
    // the books down the west wall, walnut shelves; a globe on top; a humidor on the shelf under the landing
    { const bx0=X0+0.18, za=Z0+0.35, zb=STZ0-0.2, q3=_trng(7171);
      B(0.34, 2.0, zb-za, bx0, DF+1.0, (za+zb)/2, "#3a2414");
      for(let k=0;k<5;k++){ const y=DF+0.08+k*0.40; B(0.345, 0.025, zb-za+0.005, bx0, y, (za+zb)/2, "#2a1a0e");
        if(k<4){ let z=za+0.04; while(z<zb-0.08){ const w=0.025+q3()*0.03, hh=0.22+q3()*0.08; B(0.22, hh, w, bx0+0.02, y+0.0125+hh/2+0.004, z+w/2, ["#5a1a1a","#1a2a4a","#2a3a2a","#c8a050","#3a2a1a","#e8d8b0"][(q3()*6)|0]); z+=w+0.004; } } }
      ent(new T.SphereGeometry(0.15, 18, 12), bx0, DF+2.18, (za+zb)/2, "#3a6a8a"); C(0.10, 0.03, bx0, DF+2.015, (za+zb)/2, "#c8a050", 14);
      addCol(X0, bx0+0.17, za, zb, DF-0.5, DF+2.0);
      B(0.36, 0.14, 0.24, -59.4, DF+0.60, Z1-0.5, "#5a3a22"); B(0.42, 0.56, 0.36, -59.4, DF+0.27, Z1-0.5, "#3a2414"); addCol(-59.62, -59.18, Z1-0.7, Z1-0.3, DF-0.5, DF+0.7); }
    /* the room's other end, dug out under the yard: a bar along the west wall past the books, a card table, a pool table
       under its lamp, the piano in the corner by the fireplace, a loveseat, and the sleeves of the records he plays most
       framed along the south wall */
    { // the bar: a walnut counter running north and south, three stools, a back bar of bottles against the wall
      const bx=-62.6, za=-2914.4, zb=-2909.4, zc=(za+zb)/2;
      B(0.56, 1.02, zb-za, bx, DF+0.51, zc, "#4a2e1a"); B(0.66, 0.05, zb-za+0.10, bx+0.03, DF+1.045, zc, "#2a1a0e");
      B(0.03, 0.06, zb-za, bx+0.30, DF+0.18, zc, "#c8a050");                                                     // (the brass foot rail)
      addCol(bx-0.30, bx+0.36, za-0.05, zb+0.05, DF-0.5, DF+1.07);
      for(let k=0;k<3;k++){ const sz=za+0.9+k*1.6, sx=bx+0.82;
        C(0.19, 0.06, sx, DF+0.76, sz, "#5a2218", 18); C(0.025, 0.72, sx, DF+0.37, sz, "#2a2a2c", 8); C(0.16, 0.02, sx, DF+0.012, sz, "#2a2a2c", 16);
        addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, DF-0.5, DF+0.8); addSeat(sx, sz, DF, Math.PI/2, "A STOOL AT THE BAR", false, 0.34); }
      const wx=X0+0.20; B(0.36, 0.86, zb-za, wx, DF+0.43, zc, "#3a2414"); B(0.40, 0.04, zb-za+0.04, wx, DF+0.88, zc, "#2a1a0e");
      for(const y of [1.30, 1.72]) B(0.26, 0.03, zb-za-0.4, X0+0.14, DF+y, zc, "#2a1a0e");
      push("mirror", planeGeo(zb-za-0.6, 0.70, 0), X0+0.012, DF+1.52, zc, Math.PI/2, "#ffffff");
      const q4=_trng(4141); for(const y of [0.906, 1.322, 1.742]) for(let z=za+0.35; z<zb-0.3; z+=0.16+q4()*0.08){ const h=0.22+q4()*0.12;
        ent(new T.CylinderGeometry(0.035, 0.038, h, 10), X0+0.16, DF+y+h/2, z, ["#3a5a2a","#6a3a12","#2a2018","#c8b088","#7a1a1a","#e8e2d0"][(q4()*6)|0]); }
      addCol(X0, X0+0.40, za, zb, DF-0.5, DF+2.0);
      lampU({x:bx+0.3, y:DCL-0.3, z:zc, color:0xffc070, intensity:0.45, dist:5, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]}); }
    { // the card table: green baize, four chairs, a deck and the chips out
      const tx=-62.4, tz=-2920.4; C(0.62, 0.04, tx, DF+0.76, tz, "#1e5a32", 28); C(0.66, 0.05, tx, DF+0.74, tz, "#3a2414", 28); C(0.06, 0.72, tx, DF+0.37, tz, "#3a2414", 10); C(0.30, 0.03, tx, DF+0.015, tz, "#3a2414", 18);
      addCol(tx-0.66, tx+0.66, tz-0.66, tz+0.66, DF-0.5, DF+0.8);
      for(let k=0;k<4;k++){ const a=k*Math.PI/2+0.3, sx=tx+Math.sin(a)*0.98, sz=tz+Math.cos(a)*0.98, ry=a+Math.PI, f=XF(sx, sz, ry);
        const q=(w,h,d,lx,ly,lz,c)=>ent(boxGeo(w,h,d), f.x(lx,lz), DF+ly, f.z(lx,lz), c, 0, ry, 0);
        q(0.44, 0.05, 0.42, 0, 0.46, 0, "#5a2218"); q(0.42, 0.46, 0.04, 0, 0.72, -0.20, "#3a2414");
        for(const ax of [-0.18, 0.18]) for(const az of [-0.17, 0.17]) q(0.03, 0.44, 0.03, ax, 0.22, az, "#3a2414");
        addCol(sx-0.24, sx+0.24, sz-0.24, sz+0.24, DF-0.5, DF+0.5); addSeat(sx, sz, DF, ry+Math.PI, "A CHAIR AT THE CARD TABLE"); }
      const q5=_trng(5151); for(let k=0;k<14;k++){ const a=q5()*6.28, r=0.1+q5()*0.35; C(0.02, 0.006, tx+Math.cos(a)*r, DF+0.786+(k%3)*0.006, tz+Math.sin(a)*r, ["#c41a1a","#1f4f8c","#e8e2d0","#2a2a2a"][k%4], 12); }
      B(0.06, 0.02, 0.09, tx+0.2, DF+0.792, tz-0.15, "#e8e2d0");
      lampU({x:tx, y:DCL-0.35, z:tz, color:0xffd0a0, intensity:0.5, dist:4.5, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]});
      C(0.012, 0.42, tx, DCL-0.21, tz, "#2a2a2c", 6); CT(0.14, 0.26, 0.16, tx, DCL-0.48, tz, "#1e5a32", 18); push("cafe_bulb", new T.SphereGeometry(0.035, 8, 6), tx, DCL-0.55, tz, 0, "#ffffff"); }
    { // the pool table: walnut rails, green cloth, the balls racked, a cue on it and two in a rack on the wall
      const px=-55.0, pz=-2910.7, L=2.40, Wd=1.32;
      B(L, 0.62, Wd, px, DF+0.47, pz, "#3a2414"); B(L-0.24, 0.02, Wd-0.24, px, DF+0.79, pz, "#1e6a3a");
      for(const [w, d, ox, oz] of [[L, 0.12, 0, Wd/2-0.06],[L, 0.12, 0, -Wd/2+0.06],[0.12, Wd-0.24, L/2-0.06, 0],[0.12, Wd-0.24, -L/2+0.06, 0]]) B(w, 0.06, d, px+ox, DF+0.81, pz+oz, "#4a2e1a");
      for(const sx of [-1,1]) for(const sz of [-1,1]) B(0.16, 0.16, 0.16, px+sx*(L/2-0.14), DF+0.08, pz+sz*(Wd/2-0.14), "#2a1a0e");
      const BALLS=["#f2e23a","#1f4f8c","#c41a1a","#5a1a6a","#e8862a","#1e6a3a","#7a1a1a","#1a1a1a","#f2e23a","#1f4f8c","#c41a1a","#5a1a6a","#e8862a","#1e6a3a","#7a1a1a"];
      let k=0; for(let row=0;row<5;row++) for(let i=0;i<=row;i++){ ent(new T.SphereGeometry(0.028, 12, 8), px+0.55+row*0.049, DF+0.828, pz+(i-row/2)*0.057, BALLS[k++]); }
      ent(new T.SphereGeometry(0.028, 12, 8), px-0.6, DF+0.828, pz, "#f4f2ec");
      tubeE(V3(px-0.9, DF+0.85, pz+0.30), V3(px+0.3, DF+0.83, pz+0.42), 0.008, "#c8a070");
      addCol(px-L/2, px+L/2, pz-Wd/2, pz+Wd/2, DF-0.5, DF+0.84);
      B(1.2, 0.04, 0.04, px, DCL-0.62, pz, "#3a2414"); for(const dx2 of [-0.45, 0, 0.45]){ CT(0.08, 0.20, 0.16, px+dx2, DCL-0.72, pz, "#1e5a32", 16);
        push("cafe_bulb", new T.SphereGeometry(0.03, 8, 6), px+dx2, DCL-0.78, pz, 0, "#ffffff"); }
      for(const dx2 of [-0.5, 0.5]) C(0.006, 0.6, px+dx2, DCL-0.31, pz, "#2a2a2c", 6);
      lampU({x:px, y:DCL-0.8, z:pz, color:0xfff0d0, intensity:0.7, dist:5, decay:1.5, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]});
      B(0.60, 0.80, 0.06, -51.6, DF+1.25, Z1-0.04, "#3a2414"); for(const dx2 of [-0.18, 0, 0.18]) tubeE(V3(-51.6+dx2, DF+0.92, Z1-0.10), V3(-51.6+dx2, DF+1.62, Z1-0.10), 0.009, "#c8a070"); }
    { // the piano in the north-east corner, its bench; a lamp on it
      const nx=-52.2, nz=Z0+0.32; B(1.48, 1.18, 0.58, nx, DF+0.59, nz, "#1a1410"); B(1.40, 0.05, 0.30, nx, DF+0.74, nz+0.42, "#1a1410");
      B(1.24, 0.03, 0.14, nx, DF+0.765, nz+0.36, "#f4f2ec"); for(let k=0;k<20;k++) if(k%7!==2 && k%7!==6) B(0.018, 0.012, 0.08, nx-0.58+k*0.062, DF+0.786, nz+0.33, "#1a1a1a");
      B(0.90, 0.06, 0.36, nx, DF+0.48, nz+0.92, "#1a1410"); for(const sd of [-1,1]) B(0.05, 0.46, 0.30, nx+sd*0.40, DF+0.23, nz+0.92, "#1a1410");
      addCol(nx-0.75, nx+0.75, Z0, nz+0.62, DF-0.5, DF+1.2); addCol(nx-0.46, nx+0.46, nz+0.74, nz+1.10, DF-0.5, DF+0.5); addSeat(nx, nz+0.92, DF, 0, "THE PIANO BENCH");
      C(0.07, 0.03, nx-0.5, DF+1.195, nz, "#c8a050", 12); C(0.01, 0.30, nx-0.5, DF+1.34, nz, "#c8a050", 6); CT(0.07, 0.12, 0.12, nx-0.5, DF+1.52, nz, "#e8d8b0", 14);
      lampU({x:nx-0.5, y:DF+1.5, z:nz+0.2, color:0xffc890, intensity:0.35, dist:4, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]});
      addUse(nx, nz+1.4, DF, "PLAY THE PIANO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", nx, nz);
        toast(["A FEW BARS OF 'ROUND MIDNIGHT', MOSTLY RIGHT","THE B FLAT STICKS","YOU PLAY THE BASS LINE OFF THE RECORD. IT ALMOST WORKS"][(Math.random()*3)|0], "#e8d8b0"); }, 1.1); }
    { // a loveseat in the south-east, toward the pool table
      const lx=X1-0.55, lz=-2911.3, f=XF(lx, lz, -Math.PI/2), L="#3a4a5a", q=(w,h,d,ax,ay,az)=>ent(rboxGeo(w,h,d,Math.min(0.06, Math.min(w,h,d)*0.3),2), f.x(ax,az), DF+ly0+ay, f.z(ax,az), L, 0, -Math.PI/2, 0), ly0=0;
      q(1.5, 0.40, 0.82, 0, 0.22, 0); q(1.5, 0.48, 0.18, 0, 0.62, -0.32); for(const sd of [-1,1]) q(0.16, 0.26, 0.82, sd*0.67, 0.52, 0);
      addCol(lx-0.42, lx+0.42, lz-0.76, lz+0.76, DF-0.5, DF+0.6); for(const d2 of [-0.35, 0.35]) addSeat(lx-0.05, lz+d2, DF, Math.PI/2, "THE LOVESEAT", false, 0.72); }
    { // the sleeves framed along the south wall, between the pool table's lamp and the corner
      const q6=_trng(6161);
      for(let k=0;k<6;k++){ const x=-61.2+k*0.95; if(x>-60.2 && x<-58.6) continue; B(0.34, 0.34, 0.02, x, DF+1.62, Z1-0.012, "#1a1410");
        const c1=["#c84a2a","#1f4f8c","#e8b040","#2a6a5a","#5a2a6a","#d8d0c0"][(q6()*6)|0], c2=["#1a1a1a","#f4f0e6","#7a1a1a"][(q6()*3)|0];
        B(0.30, 0.30, 0.008, x, DF+1.62, Z1-0.026, c1); B(0.18, 0.12, 0.004, x+(q6()-0.5)*0.06, DF+1.58+(q6()-0.5)*0.08, Z1-0.032, c2); } }
    // the sconces on the walls: brass, a shade each, the light thrown up and down
    for(const [x, z, ry] of [[X0+0.05, zq(-2926.0), Math.PI/2],[X1-0.05, zq(-2927.2), -Math.PI/2],[-58.6, Z0+0.05, 0],[-55.4, Z0+0.05, 0]]){
      const fx=Math.sin(ry), fz=Math.cos(ry); B(0.10, 0.16, 0.02, x, DF+1.75, z, "#c8a050", ry);
      tubeE(V3(x, DF+1.75, z), V3(x+fx*0.12, DF+1.78, z+fz*0.12), 0.008, "#c8a050");
      CT(0.07, 0.10, 0.14, x+fx*0.14, DF+1.85, z+fz*0.14, "#e8d8b0", 14); push("cafe_bulb", new T.SphereGeometry(0.025, 8, 6), x+fx*0.14, DF+1.80, z+fz*0.14, 0, "#ffffff"); }
    lampU({x:(X0+X1)/2, y:DCL-0.4, z:(Z0+Z1)/2, color:0xffc890, intensity:0.35, dist:7, decay:1.6, vol:[X0, X1, Z0, Z1, DF-0.5, DCL+0.3]}); }

  /* ---- the signal past the scale: a pole on the scale lane's right, the three lights facing the trucks, the board under
     them that says BYPASS or PULL IN; the readout over the lane before it; and where the lanes part, which is which ---- */
  { const sx=W.scale.x+W.lw/2+0.55, sz=W.scale.z0-6.0, y0=roadY(sz);
    tube("metal", V3(sx, y0, sz-0.12), V3(sx, y0+4.6, sz-0.12), 0.07, 10, "#8a8e90");
    B(0.36, 1.02, 0.30, sx, y0+3.95, sz, "#1d1d1e");
    const lamp=(col)=>new T.MeshBasicMaterial({color:col, toneMapped:false});
    const L={red:lamp(0x2a0806), amb:lamp(0x2a1a04), grn:lamp(0x062a10)};
    [["red", 4.27],["amb", 3.95],["grn", 3.63]].forEach(([k, y])=>{ const m=new T.Mesh(new T.CircleGeometry(0.11, 18), L[k]); m.position.set(sx, y0+y, sz+0.16); scene.add(m);
      B(0.30, 0.04, 0.14, sx, y0+y+0.13, sz+0.21, "#1d1d1e"); });
    WEIGH_RT.lamps=L;
    B(1.30, 0.46, 0.12, sx, y0+3.05, sz, "#1d1d1e");
    const mk=(s, col)=>signTex(260, 92, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0,0,Wd,Hh); if(s) say(c, s, Wd/2, Hh/2, Wd*0.80, Hh*0.58, col, "800", "monospace"); });
    WEIGH_RT.boardTex={by:mk("BYPASS", "#3aff7a"), pull:mk("PULL IN", "#ff4a2a"), off:mk("", "#000")};
    WEIGH_RT.board=signPanel(1.20, 0.38, WEIGH_RT.boardTex.off, sx, y0+3.05, sz+0.072, 0, true);
    addCol(sx-0.1, sx+0.1, sz-0.2, sz+0.15, y0-1, y0+4.6);
    // the readout over the lane: an arm off a second pole, the number in red figures
    const rx=W.scale.x+W.lw/2+0.6, rz=W.scale.z1+3.0, ry0=roadY(rz), bxC=W.scale.x+0.4;
    tube("metal", V3(rx, ry0, rz-0.2), V3(rx, ry0+5.4, rz-0.2), 0.08, 10, "#8a8e90"); tube("metal", V3(rx+0.05, ry0+5.3, rz-0.2), V3(W.scale.x-0.6, ry0+5.3, rz-0.2), 0.05, 8, "#8a8e90");
    for(const dxh of [-0.9, 0.9]) tube("metal", V3(bxC+dxh, ry0+5.15, rz-0.2), V3(bxC+dxh, ry0+5.3, rz-0.2), 0.02, 6, "#8a8e90");
    B(2.4, 0.70, 0.18, bxC, ry0+4.85, rz-0.2, "#1d1d1e");
    WEIGH_RT.readCan=cvs(320, 92); WEIGH_RT.readTex=setSRGB(new T.CanvasTexture(WEIGH_RT.readCan));
    signPanel(2.30, 0.62, WEIGH_RT.readTex, bxC, ry0+4.85, rz-0.2+0.10, 0, true);
    addCol(rx-0.1, rx+0.1, rz-0.3, rz-0.1, ry0-1, ry0+5.4);
    // where the lanes part
    const lz=W.z0-10, ly=roadY(lz);
    for(const [xx, lines] of [[W.lx-W.lw-0.9, ["BYPASS","PREPASS ONLY"]], [W.lx+W.lw+0.9, ["ALL OTHER","TRUCKS · SCALE"]]]){
      tube("metal", V3(xx, ly, lz-0.10), V3(xx, ly+2.6, lz-0.10), 0.04, 8, "#a3a8aa"); bx("metal", 1.42, 0.92, 0.04, xx, ly+2.15, lz-0.03, 0.5, 0, "#8d9294");
      sign(1.40, 0.90, (c,Wd,Hh)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#1a1a1a"; c.lineWidth=5; c.strokeRect(8,8,Wd-16,Hh-16);
        say(c, lines[0], Wd/2, Hh*0.38, Wd*0.78, Hh*0.24, "#1a1a1a", "800", "Arial"); say(c, lines[1], Wd/2, Hh*0.66, Wd*0.78, Hh*0.16, "#1a1a1a", "700", "Arial"); }, xx, ly+2.15, lz+0.002, 0, false, 280);
      addCol(xx-0.06, xx+0.06, lz-0.16, lz-0.04, ly-1, ly+2.6); }
    // STOP ON RED by the stop bar
    { const xx=W.scale.x+W.lw/2+0.55, zz=W.scale.z0-2.2, gy=roadY(zz); tube("metal", V3(xx, gy, zz-0.08), V3(xx, gy+2.4, zz-0.08), 0.035, 8, "#a3a8aa");
      bx("metal", 0.62, 0.82, 0.03, xx, gy+2.0, zz-0.025, 0.5, 0, "#8d9294");
      sign(0.60, 0.80, (c,Wd,Hh)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#1a1a1a"; c.lineWidth=5; c.strokeRect(8,8,Wd-16,Hh-16);
        say(c, "STOP", Wd/2, Hh*0.33, Wd*0.76, Hh*0.22, "#1a1a1a", "800", "Arial"); say(c, "ON RED", Wd/2, Hh*0.62, Wd*0.76, Hh*0.18, "#c41a1a", "800", "Arial"); }, xx, gy+2.0, zz+0.002, 0, false, 160);
      addCol(xx-0.05, xx+0.05, zz-0.13, zz-0.03, gy-1, gy+2.4); } }

  /* ---- back on the interstate: OPEN or CLOSED over the board, and two amber beacons on top that flash while it is open ---- */
  { const X=W.signOpenX, Z=W.signOpenZ, y0=roadY(Z), clear=2.8, h=3.0;
    guideSign(X, Z, 5.4, h, 0, ["WEIGH STATION","ALL TRUCKS MUST ENTER","WHEN FLASHING"], {clear:clear});
    const top=y0+clear+h;
    for(const dxs of [-0.6, 0.6]) bx("metal", 0.08, 0.86, 0.05, X+dxs, top+0.22, Z-0.10, 0.5, 0, "#a3a8aa");    // the straps behind it, down onto the board's back
    bx("metal", 1.82, 0.62, 0.05, X, top+0.40, Z-0.05, 0.4, 0, "#8d9294");
    const mk=(s, bg, fg)=>signTex(240, 80, (c,Wd,Hh)=>{ c.fillStyle=bg; c.fillRect(0,0,Wd,Hh); say(c, s, Wd/2, Hh/2, Wd*0.80, Hh*0.60, fg, "900", "Arial"); });
    WEIGH_RT.openTex={open:mk("OPEN", "#f2f0ea", "#1a1a1a"), closed:mk("CLOSED", "#1a1a1a", "#f2f0ea")};
    WEIGH_RT.openPanel=signPanel(1.80, 0.60, WEIGH_RT.openTex.open, X, top+0.40, Z-0.05+0.037, 0, true);
    const bm=new T.MeshBasicMaterial({color:0x2a1a04, toneMapped:false}), bm2=new T.MeshBasicMaterial({color:0x2a1a04, toneMapped:false});
    for(const [sd, m] of [[-1, bm],[1, bm2]]){ B(0.24, 0.10, 0.24, X+sd*2.1, top+0.06, Z-0.03, "#2a2a2c");
      const s=new T.Mesh(new T.SphereGeometry(0.11, 14, 10, 0, Math.PI*2, 0, Math.PI/2), m); s.position.set(X+sd*2.1, top+0.105, Z-0.03); s.scale.set(1, 1.6, 1); scene.add(s); }
    WEIGH_RT.beacons=[bm, bm2]; }

  /* ---- the lights over it all: tall poles with a head each, down the bypass lane's side, the apron's far side, the ramps ---- */
  { const fo=W.off[Math.floor(W.off.length*0.7)], no=W.on[Math.floor(W.on.length*0.3)];
    for(const [x, z, sd] of [[W.lx-W.lw-1.6, -2908, 1],[W.lx-W.lw-1.6, -2952, 1],[W.lx-W.lw-1.6, -2996, 1],[W.apron.x1+1.4, -2970, -1],[W.apron.x1+1.4, -2998, -1],
                              [fo.x+3.6, fo.z, -1],[no.x+3.6, no.z, -1]]){
      const g=roadY(z);
      tube("metal", V3(x, g, z), V3(x, g+9.2, z), 0.10, 10, "#8a8e90"); tube("metal", V3(x, g+9.1, z), V3(x+sd*1.6, g+9.3, z), 0.05, 8, "#8a8e90");
      B(0.70, 0.16, 0.36, x+sd*1.9, g+9.25, z, "#3a3c3e"); push("lamplens", planeGeo(0.60, 0.28, 0), x+sd*1.9, g+9.165, z, 0, "#ffffff", Math.PI/2, 0);
      bx("concrete", 0.6, 0.5, 0.6, x, g+0.2, z, 0.4, 0, "#a9a59b"); addCol(x-0.3, x+0.3, z-0.3, z+0.3, g-1, g+9.3);
      LAMPS.push({x:x+sd*1.9, y:g+8.6, z:z, color:0xffd9a8, intensity:1.0, dist:26, decay:1.3, mothy:true}); } }

  /* ---- the apron: two rigs pulled over nose to the north, chocks under one, cones round it, the inspector's tool cart ---- */
  { const AP=W.apron, ry=Math.PI;                                    // nose to the north (−z)
    [[AP.x0+6.5+4.6*0.5, 7], [AP.x0+6.5+4.6*2.5, 5]].forEach(([x, kind], k)=>{
      const m=buildVehicleMesh(kind, TRUCK_PAINTS[(k*5+2)%TRUCK_PAINTS.length], ["#e8e7e2","#c9c9c4"][k], k%2);
      const S=m.spec, zc=AP.z0+3.5+S.nose, mid=zc-(S.nose+S.tail)/2, gy=PV(mid);   // its nose three and a half metres short of the apron's head
      m.g.position.set(x, gy, zc); m.g.rotation.y=ry; scene.add(m.g);
      WHEEL_POOL.register({g:m.g, lod:m.lod, spin:0}, S);
      addColOB(x, mid, ry, S.hw+0.03, (S.nose-S.tail)/2, gy, gy+S.ht);
      if(k===0){ const az=zc-S.axles[S.axles.length-1]+S.wr+0.10;
        for(const sd of [-1,1]) B(0.20, 0.14, 0.24, x+sd*(S.hw-0.20), PV(az)+0.075, az, "#e6c21c");
        WEIGH_RT.rig={x:x, z:zc, S:S, gy:gy}; } });
    const R=WEIGH_RT.rig;
    for(const [dx, dz] of [[-2.4, -1.5],[2.4, -1.5],[2.4, R.S.nose-R.S.tail+1.0],[-2.4, R.S.nose-R.S.tail+1.0]]){ const x=R.x+dx, z=R.z-R.S.nose+dz, g=PV(z)+0.005;
      B(0.36, 0.03, 0.36, x, g+0.015, z, "#1d1d1e"); ent(new T.ConeGeometry(0.16, 0.62, 12), x, g+0.34, z, "#ff6a1a"); ent(new T.CylinderGeometry(0.115, 0.13, 0.10, 12), x, g+0.40, z, "#f2f0ea"); }
    { const x=R.x+2.7, z=R.z+2.0, g=PV(z);
      B(0.80, 0.70, 0.46, x, g+0.48, z, "#c41a1a"); for(let k=0;k<4;k++) B(0.012, 0.13, 0.42, x-0.405, g+0.30+k*0.16, z, "#8a1a12");
      for(const [ax, az] of [[-0.32,-0.18],[0.32,-0.18],[-0.32,0.18],[0.32,0.18]]) C(0.06, 0.04, x+ax, g+0.065, z+az, "#1d1d1e", 10, 0, 0, Math.PI/2);
      addCol(x-0.42, x+0.42, z-0.25, z+0.25, g-0.5, g+0.85); } }

  /* ---- the woods round its clearing: rows of real trees between the paving and the walls (07 keeps the canopy's shell
     low over the same ground), shrubs along their edge ---- */
  { const P=W.pad;
    for(let x=P.x0-10; x<P.x1+52; x+=5.4) for(let z=P.z0-150; z<P.z1+110; z+=5.4){
      const jx=x+(hash2(x, z)-0.5)*3.0, jz=z+(hash2(z, x)-0.5)*3.0, d=Terrain.clearDist(jx, jz);
      if(d<0.8 || d>40) continue;
      const qq=hash2(jx*0.9, jz*1.1), edge=d<6;
      FOREST.plant(edge ? (qq<0.2 ? "hemlock" : "edge") : (qq<0.25 ? "hemlock" : qq<0.33 ? "pine" : "hard"), jx, jz, {scale:0.85+hash2(jx*3, jz)*0.35});
      if(edge && qq<0.5){ const sx=jx+(hash2(jz, jx)-0.5)*2, sz=jz+(hash2(jx, jz*2)-0.5)*2; if(Terrain.clearDist(sx, sz)>0.5) FOREST.plant("shrub", sx, sz, {scale:0.9+qq, solid:false}); } } }

  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2}), "14w-weigh");
})();

/* ---- the people: the officer at the desk; on the apron the inspector going round the rig with his clipboard, and its
   driver waiting by his cab with a coffee ---- */
(function weighFolk(){
  if(typeof crowdGroup!=="function" || !WEIGH_RT.desk) return;
  const D=WEIGH_RT.desk, G=crowdGroup("the weigh station", -58, -2955, 160);
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#4a6a8a", pants:"#3b4a66", shoes:"#1d1d1e"}, o);
  crowdAdd(G, {look:look({skin:SKINS[2], hair:HAIRS[4], shirt:"#5a6a7a", pants:"#2c3446", long:true}), x:D.x+0.02, z:D.z, y:D.y, yaw:-Math.PI/2, mode:"sit", sitY:0.515, sway:0.25});
  // down in the listening room, in the recliner with a scotch, his eyes on the fire, the record going
  // He isn't always there: most evenings he comes down after supper and stays till past midnight, and some afternoons;
  // whether he is decided only while you are well away, so he never comes or goes in front of you
  if(WEIGH_RT.recliner){ const Q=WEIGH_RT.recliner;
    const when=(p)=>{ const c=camera.position;
      if(p.here===undefined || Math.hypot(c.x-Q.x, c.z-Q.z)>16){ const h=DayNight.state.hour, r=hash2((DayNight.state.day||0)*1.7+0.31, 3.1);
        p.here=(h>=18.5 || h<0.75) ? r<0.8 : (h>=13 && h<16.5) ? r<0.3 : false; }
      WEIGH_RT.here=p.here; return p.here; };
    crowdAdd(G, {look:look({h:1.0, skin:SKINS[1], hair:HAIRS[4], beard:"#8d8a86", shirt:"#5a3a2a", pants:"#2a2a2c", shoes:"#3a2414", long:true}), x:Q.x, z:Q.z, y:Q.y, yaw:Math.PI, mode:"sit", job:"recline", sitY:0.585, held:"rocks", drink:true, sway:0.12, when:when}); }
  const R=WEIGH_RT.rig; if(!R) return;
  const S=R.S, x=R.x, nz=R.z-S.nose, tz=R.z-S.tail, gy=(px, pz)=>roadY(pz)+PAVE_T+0.015;
  // round the rig: down its right side from the cab to the back, across behind it, up the left, and across the front; a
  // stop at each corner to write
  const path=[[x+S.hw+1.0, nz+2.5, undefined, 4],[x+S.hw+1.0, (nz+tz)/2, undefined, 3],[x+S.hw+1.0, tz+1.0, undefined, 4],[x, tz+1.6, undefined, 3],
              [x-S.hw-1.0, tz+1.0, undefined, 4],[x-S.hw-1.0, (nz+tz)/2+3, undefined, 2],[x-S.hw-1.0, nz+5.5, undefined, 2],[x-S.hw-1.0, nz-1.4, undefined, 3],[x+S.hw+1.0, nz-1.4, undefined, 2]];
  crowdAdd(G, {look:look({skin:SKINS[0], hair:HAIRS[2], shirt:"#c8b890", pants:"#3b4a66", cap:"#2a3a5a", long:true}), mode:"walk", path:path, loop:true, speed:0.7, held:"clip", yAt:gy});
  crowdAdd(G, {look:look({skin:SKINS[3], hair:HAIRS[0], shirt:"#7a1a1a", pants:"#3b4a66", cap:"#1d1d1e", beard:"#2a1a10"}), x:x-S.hw-1.3, z:nz+3.6, y:gy(0, nz+3.6), yaw:Math.PI/2, mode:"stand", held:"cup", sway:0.4});
  G.bounds={x0:WEIGH.apron.x0, x1:WEIGH.apron.x1+20, z0:WEIGH.apron.z0-2, z1:WEIGH.house.z1+4};
})();

/* ---- each frame: open or closed, the beacons, the signal and its board, the readout (from 14's updateVisitors) ---- */
function updateWeighStation(dt, dark){
  const R=WEIGH_RT; if(!R.lamps) return;
  R.t+=dt;
  // the record plays while he is down here, or while you have one on; the platter spins up and runs down
  { const on=!!(R.here || R.spin); R.pv=(R.pv||0)+clamp((on ? 3.49 : 0)-(R.pv||0), -2.5*dt, 2.5*dt);
    if(R.platter) R.platter.rotation.y-=dt*R.pv;                         // (33⅓)
    if(R.radio) R.radio.station=on ? 3 : -1; }
  const h=DayNight.state.hour, open=h>=6 && h<23;
  if(open!==R.open){ R.open=open; R.openPanel.material.map=open ? R.openTex.open : R.openTex.closed; R.openPanel.material.needsUpdate=true; }
  const ph=(R.t*0.8)%1;
  R.beacons[0].color.setHex(open && ph<0.5 ? 0xffb020 : 0x2a1a04); R.beacons[1].color.setHex(open && ph>=0.5 ? 0xffb020 : 0x2a1a04);
  // the signal: red while a truck sits on the scale, green and BYPASS otherwise; dark when it is closed
  const on=R.onScale, weighing=!!(on && on.route && on.route.dwell>0), want=!open ? "off" : weighing ? "red" : "green";
  if(want!==R.sig){ R.sig=want; R.sigT=0;
    R.lamps.red.color.setHex(want==="red" ? 0xff2a14 : 0x2a0806);
    R.lamps.grn.color.setHex(want==="green" ? 0x2aff6a : 0x062a10);
    const bt=want==="red" ? R.boardTex.pull : want==="green" ? R.boardTex.by : R.boardTex.off;
    R.board.material.map=bt; R.board.material.needsUpdate=true; }
  R.sigT+=dt;
  // the readout: the weight coming up as the truck settles on the scale, held while it sits there, dashes between
  const w=weighing ? on.route.wt*(1-Math.exp(-R.sigT*2.2)) : 0;
  const txt=!open ? "CLOSED" : w>100 ? (Math.round(w/20)*20).toLocaleString("en-US")+" LB" : "– – – –";
  if(txt!==R.readTxt){ R.readTxt=txt; const c=R.readCan.getContext("2d"), Wd=c.canvas.width, Hh=c.canvas.height;
    c.fillStyle="#0a0a0a"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#ff3a1a"; fitText(c, txt, Wd*0.80, Hh*0.60, Wd/2, Hh/2, "700", "monospace"); R.readTex.needsUpdate=true;
    if(R.screen){ const sc=R.screen.material.map.image.getContext("2d"), SW=sc.canvas.width, SH=sc.canvas.height;
      sc.fillStyle="#0a1a10"; sc.fillRect(0,0,SW,SH); sc.fillStyle="#3aff7a"; fitText(sc, "SCALE 1", SW*0.7, SH*0.14, SW/2, SH*0.18, "700", "monospace");
      fitText(sc, w>100 ? txt : "-- ---- LB", SW*0.84, SH*0.30, SW/2, SH*0.55, "700", "monospace"); R.screen.material.map.needsUpdate=true; } }
}
/* the trucks: while it is open, now and then a rig in the right lane a few hundred metres short of the ramp is flagged
   to come in; at the ramp it is given its route, and 14's stepVisitor drives it */
const _WLEG=(pts, speed, opts)=>{ const P=smoothPath(pts.map(p=>({x:p[0], z:p[1]})), 1.0, true);
  P.forEach((p,i)=>{ p.y=roadY(p.z); p.s=i ? P[i-1].s+Math.hypot(p.x-P[i-1].x, p.z-P[i-1].z) : 0; });
  return Object.assign({P:P, speed:speed, rev:false, y:true}, opts||{}); };
function _weighRoute(v){
  const W=WEIGH, by=Math.random()<0.25, e=W.off[W.off.length-1], s=W.on[0], xb=W.lx-W.lw/2, xs=W.scale.x;
  const zs=(W.scale.z0+W.scale.z1)/2+(v.spec.nose+v.spec.tail)/2;            // (its middle over the scale's middle)
  const legs=[{P:W.off, speed:15, rev:false, ramp:true, y:true}];
  if(by) legs.push(_WLEG([[e.x, e.z],[e.x, e.z-6],[xb, e.z-20],[xb, W.z1+24],[s.x, s.z+6],[s.x, s.z]], 11));
  else { legs.push(_WLEG([[e.x, e.z],[e.x, e.z-6],[xs, e.z-18],[xs, zs]], 7, {stop:true, dwell:4+Math.random()*4, scale:true}));
         legs.push(_WLEG([[xs, zs],[xs, zs-12],[xs, W.z1+24],[s.x, s.z+6],[s.x, s.z]], 8)); }
  legs.push({P:W.on, speed:24, rev:false, ramp:true, merge:true, y:true});
  return {legs:legs, li:0, s:0, weigh:true, wt:62000+Math.random()*18000, release:()=>{}};
}
function updateWeighTrucks(dt){
  const R=WEIGH_RT, W=typeof WEIGH!=="undefined" ? WEIGH : null; if(!W || !W.off || !R.lamps) return;
  const z0=W.off[0].z;
  R.flagT-=dt;
  if(R.open && R.active<R.max && R.flagT<=0){
    for(const v of TRAFFIC){
      if(v.dir>0 || v.route || v.exiting || v.lane!==0 || v.laneT<1 || !v.big) continue;
      if(v.z>z0+700 || v.z<z0+250) continue;
      v.exiting=true; v.weigh=true; R.active++; R.flagT=10+Math.random()*16; break; } }
  let sc=null;
  for(const v of TRAFFIC){
    if(!v.weigh) continue;
    if(!v.route){
      if(v.z>z0+760 || v.z<z0-30){ v.weigh=false; v.exiting=false; R.active--; continue; }     // wrapped round the loop, or missed it
      if(v.z<=z0+0.5){ const RT=_weighRoute(v); v.route=RT; RT.x0=v.x-W.off[0].x; RT.seq=++_visitSeq; } }
    if(v.route){ const L=v.route.legs[v.route.li]; if(L && L.scale && v.route.s>=L.P[L.P.length-1].s-0.05) sc=v; }
  }
  R.onScale=sc;
}
