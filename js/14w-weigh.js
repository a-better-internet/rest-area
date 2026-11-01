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
   The scale house stands beside the scale lane: block, a flat roof, a long
   window along the lane so the officer at the desk sees each truck as it
   rolls on, the readout and the camera on the screens in front of him.
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

  /* ---- the scale house ---- */
  const Y=roadY((H.z0+H.z1)/2), WT=0.20, FF=Y+0.36, CL=FF+2.8, TOPW=FF+3.05, IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT;
  const BLK="#d2cdbf", INW="#ecebe6", TRIM="#4a4e52";
  const WIN={a:IZ0+0.6, b:IZ1-0.6, sill:FF+0.95, head:FF+2.15};                      // the long window on the lane
  const DOOR={a:-2942.4, b:-2941.4, sill:FF-0.03, head:FF+2.10}, EWIN={a:-2938.6, b:-2936.6, sill:FF+1.0, head:FF+2.1};
  const NWIN={a:H.x0+1.2, b:H.x1-1.6, sill:FF+1.1, head:FF+2.1};
  const DZ=(DOOR.a+DOOR.b)/2;
  { // the slab it stands on, and a step up at the door
    bx("concrete", H.x1-H.x0+0.30, FF-(Y-0.10), H.z1-H.z0+0.30, (H.x0+H.x1)/2, (FF+Y-0.10)/2, (H.z0+H.z1)/2, 0.5, 0, "#b8b4aa");
    addFlat(H.x0-0.15, H.x1+0.15, H.z0-0.15, H.z1+0.15, FF);
    bx("concrete", 0.64, 0.28, 1.8, H.x1+0.46, Y+0.04, DZ, 0.5, 0, "#b8b4aa"); addFlat(H.x1+0.15, H.x1+0.78, DZ-0.9, DZ+0.9, Y+0.18);
    // the walls, block; the openings; inside, plaster
    runX("block", H.z0+WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [NWIN], BLK, 0.5);
    runX("block", H.z1-WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [NWIN], BLK, 0.5);
    runZ("block", H.x0+WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [WIN], BLK, 0.5);
    runZ("block", H.x1-WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [DOOR, EWIN], BLK, 0.5);
    lineX("plaster", IZ0, 1, IX0, IX1, FF, CL, [NWIN], INW); lineX("plaster", IZ1, -1, IX0, IX1, FF, CL, [NWIN], INW);
    lineZ("plaster", IX0, 1, IZ0, IZ1, FF, CL, [WIN], INW); lineZ("plaster", IX1, -1, IZ0, IZ1, FF, CL, [DOOR, EWIN], INW);
    ceilAt("plaster", IX0, IX1, IZ0, IZ1, CL, "#f2f0ea");
    floorAt("mosaic", IX0, IX1, IZ0, IZ1, FF+0.01, "#a8a49a", 0.6);
    // the roof, out over the walls on every side, its fascia (sunk a little into its edge)
    bx("concrete", H.x1-H.x0+1.10, 0.22, H.z1-H.z0+1.10, (H.x0+H.x1)/2, TOPW-0.02+0.11, (H.z0+H.z1)/2, 0.5, 0, "#6a6a68");
    for(const sd of [-1,1]){ B(H.x1-H.x0+1.16, 0.16, 0.03, (H.x0+H.x1)/2, TOPW+0.10, sd>0 ? H.z1+0.56 : H.z0-0.56, TRIM);
      B(0.03, 0.15, H.z1-H.z0+1.12, sd>0 ? H.x1+0.56 : H.x0-0.56, TOPW+0.10, (H.z0+H.z1)/2, TRIM); }
    // the glass, its frames and sills
    push("glass", planeGeo(WIN.b-WIN.a-0.04, WIN.head-WIN.sill-0.04, 0), H.x0+WT/2, (WIN.sill+WIN.head)/2, (WIN.a+WIN.b)/2, Math.PI/2, "#ffffff");
    for(let z=WIN.a+1.6; z<WIN.b-0.3; z+=1.6) bx("paintm", WT+0.04, WIN.head-WIN.sill, 0.06, H.x0+WT/2, (WIN.sill+WIN.head)/2, z, 0, 0, TRIM);
    frZ(H.x0+WT/2, WT, WIN.a, WIN.b, WIN.sill, WIN.head, TRIM); bx("paintm", WT+0.16, 0.05, WIN.b-WIN.a+0.2, H.x0+WT/2, WIN.sill-0.015, (WIN.a+WIN.b)/2, 0, 0, "#b8b4aa");
    push("glass", planeGeo(EWIN.b-EWIN.a-0.04, EWIN.head-EWIN.sill-0.04, 0), H.x1-WT/2, (EWIN.sill+EWIN.head)/2, (EWIN.a+EWIN.b)/2, -Math.PI/2, "#ffffff");
    frZ(H.x1-WT/2, WT, EWIN.a, EWIN.b, EWIN.sill, EWIN.head, TRIM); bx("paintm", WT+0.16, 0.05, EWIN.b-EWIN.a+0.2, H.x1-WT/2, EWIN.sill-0.015, (EWIN.a+EWIN.b)/2, 0, 0, "#b8b4aa");
    for(const zf of [H.z0+WT/2, H.z1-WT/2]){ push("glass", planeGeo(NWIN.b-NWIN.a-0.04, NWIN.head-NWIN.sill-0.04, 0), (NWIN.a+NWIN.b)/2, (NWIN.sill+NWIN.head)/2, zf, 0, "#ffffff");
      frX(zf, WT, NWIN.a, NWIN.b, NWIN.sill, NWIN.head, TRIM); bx("paintm", NWIN.b-NWIN.a+0.2, 0.05, WT+0.16, (NWIN.a+NWIN.b)/2, NWIN.sill-0.015, zf, 0, 0, "#b8b4aa"); }
    frZ(H.x1-WT/2, WT, DOOR.a, DOOR.b, DOOR.sill, DOOR.head, TRIM);
    makeDoor(XF(H.x1-WT/2, DOOR.a+0.02, -Math.PI/2), 0, FF+0.01, 0, "THE SCALE HOUSE", true, 0, "steel", 0x6a7076);
    addFlat(H.x1-WT, H.x1, DOOR.a, DOOR.b, FF);
    for(const [x0,x1,z0,z1] of [[H.x0, H.x1, H.z0, IZ0],[H.x0, H.x1, IZ1, H.z1],[H.x0, IX0, IZ0, IZ1],[IX1, H.x1, IZ0, DOOR.a],[IX1, H.x1, DOOR.b, IZ1]]) addCol(x0, x1, z0, z1, FF-0.5, TOPW);
    addZone(IX0, IX1, IZ0, IZ1, FF-0.5, CL, "THE SCALE HOUSE", true);
    // on the roof: the air handler, the mast with its antennas, the camera on it looking down the scale
    B(1.4, 0.8, 1.0, (H.x0+H.x1)/2+0.6, TOPW+0.60, H.z1-3.0, "#b8bcc0"); B(1.2, 0.04, 0.8, (H.x0+H.x1)/2+0.6, TOPW+1.01, H.z1-3.0, "#8a8e90");
    tube("metal", V3(H.x0+0.4, TOPW+0.19, H.z0+0.6), V3(H.x0+0.4, TOPW+3.2, H.z0+0.6), 0.03, 8, "#9a9ea2");
    for(const [dy, L] of [[2.9, 0.9],[2.5, 0.6]]) tube("metal", V3(H.x0+0.4-L/2, TOPW+dy, H.z0+0.6), V3(H.x0+0.4+L/2, TOPW+dy, H.z0+0.6), 0.012, 6, "#9a9ea2");
    B(0.30, 0.18, 0.18, H.x0+0.20, TOPW+2.2, H.z0+0.6, "#e8e6de"); B(0.08, 0.06, 0.06, H.x0+0.37, TOPW+2.2, H.z0+0.6, "#5a5e62");
    B(0.08, 0.13, 0.15, H.x0+0.03, TOPW+2.2, H.z0+0.6, "#1d1d1e");
    // the light over the door, and over the lane window two floods on the scale
    B(0.24, 0.12, 0.18, H.x1+0.085, DOOR.head+0.34, DZ, "#2a2a2c"); push("lamplens", planeGeo(0.18, 0.12, 0), H.x1+0.085, DOOR.head+0.275, DZ, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:H.x1+0.7, y:DOOR.head+0.2, z:DZ, color:0xffe2b8, intensity:0.6, dist:9, decay:1.5, mothy:true});
    for(const zz of [H.z0+1.6, H.z1-1.6]){ B(0.10, 0.05, 0.05, H.x0-0.04, TOPW-0.25, zz, "#2a2a2c"); B(0.30, 0.18, 0.24, H.x0-0.22, TOPW-0.25, zz, "#2a2a2c");
      push("lamplens", planeGeo(0.24, 0.18, 0), H.x0-0.22, TOPW-0.345, zz, 0, "#ffffff", Math.PI/2, 0); }
    LAMPS.push({x:W.scale.x+0.5, y:TOPW-0.6, z:(W.scale.z0+W.scale.z1)/2, color:0xf2f6ff, intensity:0.9, dist:16, decay:1.4, mothy:true});
    // the name on the lane side, under the eave, on stand-offs a centimetre and a half off the block
    bx("metal", 4.62, 0.62, 0.05, H.x0-0.04, TOPW-0.40, (H.z0+H.z1)/2, 0.5, Math.PI/2, "#1f4f8c");
    sign(4.5, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#1f4f8c"; c.fillRect(0,0,Wd,Hh); say(c, "WEIGH STATION · ALL TRUCKS", Wd/2, Hh/2, Wd*0.84, Hh*0.6, "#f4f2ec", "800", "Arial"); },
      H.x0-0.08, TOPW-0.40, (H.z0+H.z1)/2, -Math.PI/2, false, 1080); }

  /* ---- inside: the desk along the window, its screens (the readout, the camera on the scale, the log), the chair and the
     officer in it; a filing cabinet with the printer on it, a table with the coffee maker, a fridge, the board, a clock ---- */
  { const dx=IX0+0.38, dz0=WIN.a+0.2, dz1=WIN.b-0.2, dzc=(dz0+dz1)/2;
    B(0.72, 0.04, dz1-dz0, dx, FF+0.74, dzc, "#8a7a62"); B(0.66, 0.72, 0.04, dx, FF+0.36, dz0+0.02, "#5a5e62"); B(0.66, 0.72, 0.04, dx, FF+0.36, dz1-0.02, "#5a5e62");
    B(0.60, 0.70, 0.40, dx, FF+0.355, dzc-1.6, "#5a5e62"); for(let k=0;k<3;k++) B(0.012, 0.18, 0.34, dx+0.305, FF+0.15+k*0.22, dzc-1.6, "#3a3e42");
    addCol(IX0, dx+0.37, dz0, dz1, FF-0.5, FF+0.78);
    // three screens on stands, the outer two turned in toward the chair: the scale's readout, the camera, the log
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
    B(0.16, 0.02, 0.40, dx+0.05, FF+0.77, dzc, "#2a2a2c");                              // the keyboard
    B(0.10, 0.04, 0.16, dx+0.05, FF+0.78, dzc+1.05, "#2a2a2c"); C(0.012, 0.12, dx+0.05, FF+0.86, dzc+1.0, "#2a2a2c", 6);   // the radio in its charger
    B(0.22, 0.012, 0.30, dx+0.08, FF+0.766, dzc-1.05, "#f2efe6"); C(0.04, 0.10, dx+0.14, FF+0.81, dzc-1.40, "#f2efe6", 12);   // papers, a mug
    // the chair (the officer is in it)
    C(0.24, 0.05, dx+0.75, FF+0.435, dzc, "#2a2a2c", 16); C(0.03, 0.40, dx+0.75, FF+0.21, dzc, "#5a5e62", 8); B(0.06, 0.48, 0.42, dx+1.0, FF+0.76, dzc, "#2a2a2c");
    B(0.04, 0.30, 0.04, dx+0.98, FF+0.54, dzc, "#5a5e62");
    for(let k=0;k<5;k++){ const a=k*1.2566; B(0.30, 0.03, 0.04, dx+0.75+Math.cos(a)*0.15, FF+0.04, dzc-Math.sin(a)*0.15, "#2a2a2c", a); }
    // the filing cabinet, the printer on it
    B(0.46, 1.32, 0.62, IX1-0.26, FF+0.67, IZ0+0.36, "#7a7e82"); for(let k=0;k<4;k++){ B(0.012, 0.28, 0.54, IX1-0.495, FF+0.21+k*0.32, IZ0+0.36, "#6a6e72"); B(0.02, 0.025, 0.12, IX1-0.505, FF+0.31+k*0.32, IZ0+0.36, "#c8ccd0"); }
    B(0.42, 0.22, 0.46, IX1-0.26, FF+1.44, IZ0+0.36, "#e8e6de"); B(0.30, 0.012, 0.24, IX1-0.26, FF+1.556, IZ0+0.36, "#2a2a2c"); addCol(IX1-0.5, IX1, IZ0, IZ0+0.68, FF-0.5, FF+1.55);
    // the table with the coffee maker, the fridge by it
    B(0.55, 0.04, 0.80, IX1-0.30, FF+0.82, IZ1-1.1, "#8a7a62"); for(const zz of [IZ1-1.45, IZ1-0.75]) B(0.04, 0.80, 0.04, IX1-0.30, FF+0.40, zz, "#5a5e62");
    B(0.20, 0.30, 0.22, IX1-0.32, FF+0.99, IZ1-1.30, "#1d1d1e"); C(0.06, 0.14, IX1-0.30, FF+0.91, IZ1-1.14, "#5a4a3a", 12);
    B(0.56, 0.86, 0.58, IX1-0.30, FF+0.44, IZ1-0.35, "#e8e6de"); B(0.02, 0.30, 0.02, IX1-0.585, FF+0.62, IZ1-0.12, "#b8bcc0");
    addCol(IX1-0.6, IX1, IZ1-1.5, IZ1, FF-0.5, FF+0.9);
    // the board, the day's notices pinned up; the clock over the door
    bx("paintm", 0.03, 0.72, 1.06, IX1-0.025, FF+1.55, (DOOR.b+EWIN.a)/2, 0.5, 0, "#b8946a");
    sign(1.0, 0.66, (c,Wd,Hh)=>{ c.fillStyle="#c8a47a"; c.fillRect(0,0,Wd,Hh);
      [["#f4f2ec",0.08,0.10,0.38,0.40],["#f2e88a",0.54,0.08,0.38,0.36],["#f4f2ec",0.10,0.56,0.36,0.34],["#c8e0f4",0.54,0.52,0.38,0.38]].forEach(([col,x,y,w,h], k)=>{
        c.fillStyle=col; c.fillRect(Wd*x, Hh*y, Wd*w, Hh*h); c.fillStyle="#c41a1a"; c.beginPath(); c.arc(Wd*(x+w/2), Hh*y+5, 4, 0, 7); c.fill();
        say(c, ["OUT OF SERVICE","SHIFT ROTA","BRIDGE LAWS","PREPASS"][k], Wd*(x+w/2), Hh*(y+0.10), Wd*w*0.8, Hh*0.07, "#1a1a1a", "800", "Arial");
        c.fillStyle="#5a5a5a"; for(let j=0;j<4;j++) c.fillRect(Wd*(x+0.04), Hh*(y+0.18+j*0.04), Wd*(w-0.08)*(0.6+0.4*((j*7+k)%3)/2), 2); }); },
      IX1-0.052, FF+1.55, (DOOR.b+EWIN.a)/2, -Math.PI/2, false, 360);
    C(0.13, 0.03, IX1-0.022, DOOR.head+0.35, DZ, "#f4f2ec", 20, 0, 0, Math.PI/2); B(0.012, 0.09, 0.012, IX1-0.04, DOOR.head+0.37, DZ, "#1a1a1a"); B(0.012, 0.012, 0.07, IX1-0.04, DOOR.head+0.35, DZ+0.03, "#1a1a1a");
    // the lights in the ceiling
    for(const zz of [IZ0+3.0, IZ1-3.0]){ bx("paintm", 0.34, 0.08, 1.24, (IX0+IX1)/2, CL-0.04, zz, 0, 0, "#e6e6e2"); push("tube", boxGeo(0.28, 0.02, 1.16, 0), (IX0+IX1)/2, CL-0.09, zz, 0, "#ffffff");
      LAMPS.push({x:(IX0+IX1)/2, y:CL-0.25, z:zz, color:0xf2f6f2, intensity:0.75, dist:6, decay:1.4, indoor:true, vol:[IX0-0.2, IX1+0.2, IZ0-0.2, IZ1+0.2, FF-1, CL+0.5]}); }
    WEIGH_RT.desk={x:dx+0.75, z:dzc, y:FF}; }

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

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ---- the people: the officer at the desk; on the apron the inspector going round the rig with his clipboard, and its
   driver waiting by his cab with a coffee ---- */
(function weighFolk(){
  if(typeof crowdGroup!=="function" || !WEIGH_RT.desk) return;
  const D=WEIGH_RT.desk, G=crowdGroup("the weigh station", -58, -2955, 160);
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#4a6a8a", pants:"#3b4a66", shoes:"#1d1d1e"}, o);
  crowdAdd(G, {look:look({skin:SKINS[2], hair:HAIRS[4], shirt:"#5a6a7a", pants:"#2c3446", long:true}), x:D.x+0.02, z:D.z, y:D.y, yaw:-Math.PI/2, mode:"sit", sitY:0.515, sway:0.25});
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
      if(v.z<=z0+0.5){ const RT=_weighRoute(v); v.route=RT; RT.x0=v.x-W.off[0].x; RT.seq=++_visitSeq; v.speed=Math.min(v.speed, 26); } }
    if(v.route){ const L=v.route.legs[v.route.li]; if(L && L.scale && v.route.s>=L.P[L.P.length-1].s-0.05) sc=v; }
  }
  R.onScale=sc;
}
