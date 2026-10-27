"use strict";
/* REST AREA · 14s-edinsub.js
   at Edinboro's exit, out behind the fuel stop and the chapel: the
   utility's substation, its fenced yard and its control house, both of
   which you can walk into
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14s · FRENCH CREEK SUBSTATION
   Where the line north up the power cut (POWER, 12) comes down to the
   village's distribution. A tap off it on two wood poles west across the
   corn to a steel dead-end frame at the yard's east end; under that the
   air-break switch, then the fuses on their stand; the transformer on its
   pad in an oil curb, radiators down both sides with fans under them, the
   conservator on top, the bushings and arresters; west of it the low-side
   frame with the bus along the top and the three regulators under it; and
   three feeder breakers, their cables going down into the ground at the
   riser frame. All on crushed stone inside a chain-link fence with the
   wire on top. A gravel lane comes up from the back of the fuel stop's
   lot to the gate (E opens it, as the rest area's does).
   The control house in the south-west corner: block, a flat roof, a steel
   door (E). Inside, the relay panels across the north wall with their
   meters and lamps, the battery rack on the west and its charger, the RTU
   blinking, a desk with the log on it (E), the one-line on the wall, the
   window unit. A lineman out by the transformer with his clipboard by day.
   PLAN (world): the fence x -16..36, z -1416..-1376, on the plain at EDIN.y
     GATE      south fence, x 10.03..12.97, the lane up to it x 10..13
     HOUSE     x -14..-6, z -1388..-1381; door east, z -1384.9..-1383.9
     DEAD-END  x 33,  phases at z -1404.5, -1402, -1399.5 (all the way west)
     SWITCH    x 29;  FUSES x 25;  TRANSFORMER x 15..19;  LOW SIDE x 4..10
     FEEDERS   breakers at x 0, z -1408, -1402, -1396; risers at x -3.6
   ---------------------------------------------------------------------- */
const EDIN_SUB={};
const HUM_POS=[];                                   // transformers that hum and have no diesel by them (20-audio)
(function edinSub(){
  const E=EDIN, Y=E.y, r=_trng(4242);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx)=>ent(boxGeo(w,h,d),x,y,z,c,rx||0,ry||0,0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const beam=(a, b, w, h, c)=>{ const dx=b.x-a.x, dy=b.y-a.y, dz=b.z-a.z, hz=Math.hypot(dx, dz);
    ent(boxGeo(w, h, Math.hypot(hz, dy)), (a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2, c, -Math.atan2(dy, hz), Math.atan2(dx, dz), 0); };
  // a conductor between two points, hanging in a shallow curve
  const wire=(A, Bp, sag, rad, n)=>{ let p=A; const N=n||6;
    for(let k=1;k<=N;k++){ const t=k/N, q=V3(lerp(A.x,Bp.x,t), lerp(A.y,Bp.y,t)-Math.sin(t*Math.PI)*sag, lerp(A.z,Bp.z,t)); tubeE(p, q, rad||0.014, "#3a3c3e"); p=q; } };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const GAL="#a7adb0", POR="#6e4a32", GRY="#8f9a9c", DK="#2a2a2c";
  // a porcelain post on its cap: the core and its sheds, from y up h
  const post=(x, y, z, h, rd)=>{ const R=rd||0.11, n=Math.max(3, Math.round(h/0.11));
    C(R*0.5, h, x, y+h/2, z, POR, 10); for(let k=0;k<n;k++) C(R, 0.035, x, y+0.07+k*(h-0.14)/(n-1), z, POR, 12);
    C(R*0.8, 0.07, x, y+h+0.03, z, "#8a8d90", 10); C(R*0.8, 0.06, x, y+0.03, z, "#8a8d90", 10); };
  // a column of tubular steel on its footing, and a box beam
  const col=(x, z, h)=>{ C(0.20, h, x, Y+h/2, z, GAL, 14); C(0.36, 0.30, x, Y+0.12, z, "#a8a49a", 14); addCol(x-0.24, x+0.24, z-0.24, z+0.24, Y-0.5, Y+h); };
  const PH=[-1404.5, -1402.0, -1399.5];                            // the phases, south of north
  const F={x0:-16, x1:36, z0:-1416, z1:-1376}, GX=11.5, GW=1.47;

  /* ---- the stone, the lane, the fence and the gate ---- */
  { const pl=(x0,x1,z0,z1,y,c)=>{ const g=new T.PlaneGeometry(x1-x0, z1-z0), U=g.attributes.uv;
      for(let k=0;k<U.count;k++) U.setXY(k, (x0+U.getX(k)*(x1-x0))*0.5, (z0+U.getY(k)*(z1-z0))*0.5);
      push("gravelbed", g, (x0+x1)/2, y, (z0+z1)/2, 0, c, -Math.PI/2, 0); };
    pl(F.x0-1.5, F.x1+1.5, F.z0-1.5, F.z1+1.5, Y+0.034, "#b2aea4");
    pl(GX-1.6, GX+1.6, F.z1+1.5, E.station.z0+0.05, Y+0.032, "#a29d92"); }        // (up from the back of the lot)
  addZone(F.x0, F.x1, F.z0, F.z1, Y-2, Y+14, "FRENCH CREEK SUBSTATION");
  const FH=2.1;
  const fenceRun=(x0,z0,x1,z1,shared)=>{                         // as 12's: posts, the mesh, the rail, three strands out on arms
    const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/3)), ry=Math.atan2(x1-x0, z1-z0);
    const dx=(x1-x0)/L, dz=(z1-z0)/L, ox=dz, oz=-dx;
    for(let k=0;k<=(shared?n-1:n);k++){
      const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, corner=(k===0||k===n);
      cyl("metal", corner?0.05:0.035, corner?0.05:0.035, FH+0.4, 8, px, Y+FH/2-0.15, pz, GAL);
      push("metal", boxGeo(0.04,0.04,0.55,0), px+ox*0.18, Y+FH+0.18, pz+oz*0.18, ry+Math.PI/2, GAL, 0.78, 0); }
    push("chainlink", planeGeo(L, FH-0.05, 3.2), (x0+x1)/2, Y+(FH-0.05)/2+0.03, (z0+z1)/2, ry+Math.PI/2, "#ffffff");
    tube("metal", V3(x0,Y+FH,z0), V3(x1,Y+FH,z1), 0.024, 8, GAL);
    tube("metal", V3(x0,Y+0.06,z0), V3(x1,Y+0.06,z1), 0.006, 4, "#8a9092");
    for(let s=0;s<3;s++){ const h=Y+FH+0.12+s*0.14, o=0.10+s*0.13; tube("paintm", V3(x0+ox*o,h,z0+oz*o), V3(x1+ox*o,h,z1+oz*o), 0.006, 4, "#5c6062"); }
    addCol(Math.min(x0,x1)-0.06, Math.max(x0,x1)+0.06, Math.min(z0,z1)-0.06, Math.max(z0,z1)+0.06, Y-0.5, Y+FH+0.5); };
  // clockwise from above (x east, z south), so the arms lean out
  // (each run leaves its last post to the next; the gate's own posts stand at the ends of the south runs)
  fenceRun(F.x0, F.z0, F.x1, F.z0, true);
  fenceRun(F.x1, F.z0, F.x1, F.z1, true);
  fenceRun(F.x1, F.z1, GX+GW, F.z1, true);
  fenceRun(GX-GW, F.z1, F.x0, F.z1, true);
  fenceRun(F.x0, F.z1, F.x0, F.z0, true);
  for(const x of [GX-GW, GX+GW]) cyl("metal", 0.06,0.06, FH+0.5, 10, x, Y+FH/2, F.z1, GAL);
  makeDoor(XF(GX-GW+0.02, F.z1, 0), 0, Y+0.09, 0, "THE GATE", false, 0, "gate");
  makeDoor(XF(GX+GW-0.02, F.z1, Math.PI), 0, Y+0.09, 0, "THE GATE", true, 0, "gate");
  { const gc={x0:GX-GW, x1:GX+GW, z0:F.z1-0.12, z1:F.z1+0.12, y0:Y, y1:Y+2.3}; COL_DYN.push(gc);
    const gA=DOORS[DOORS.length-2], gB=DOORS[DOORS.length-1];
    for(const d of [gA, gB]){ d.manualOnly=true; d.sticky=true; d.blockCol=gc; d.blockTop=Y+2.3; }
    gA.partner=gB; gB.partner=gA; }
  // what is wired to the fence: the danger signs, and the utility's own by the gate
  { const warn=signTex(360,240,(c,W,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H);
      c.fillStyle="#c8102e"; rrect(c,W*0.06,H*0.06,W*0.88,H*0.30,10); c.fill();
      c.fillStyle="#f2f0e8"; fitHwy(c,"DANGER",W*0.7,H*0.22,W/2,H*0.21);
      c.fillStyle="#1a1a1a"; fitHwy(c,"HIGH VOLTAGE",W*0.84,H*0.16,W/2,H*0.52);
      fitHwy(c,"KEEP OUT",W*0.6,H*0.14,W/2,H*0.74); fitText(c,"Authorized personnel only",W*0.8,H*0.08,W/2,H*0.90,"500"); });
    signPanel(0.54,0.36,warn, GX-GW-1.0, Y+1.35, F.z1+0.05, 0);
    for(const x of [F.x0+10, F.x1-10]){ signPanel(0.54,0.36,warn, x, Y+1.3, F.z1+0.05, 0); signPanel(0.54,0.36,warn, x, Y+1.3, F.z0-0.05, Math.PI); }
    for(const z of [-1406, -1386]){ signPanel(0.54,0.36,warn, F.x0-0.05, Y+1.3, z, -Math.PI/2); signPanel(0.54,0.36,warn, F.x1+0.05, Y+1.3, z, Math.PI/2); }
    sign(1.20, 0.80, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); c.fillStyle="#1f4a7a"; c.fillRect(0,0,W,H*0.36);
        say(c,"FRENCH CREEK SUBSTATION",W/2,H*0.18,W*0.80,H*0.17,"#f4f2ec","800","Arial");
        say(c,"NORTHWEST PENN ELECTRIC",W/2,H*0.50,W*0.76,H*0.12,"#1f4a7a","800","Arial");
        say(c,"IN AN EMERGENCY CALL",W/2,H*0.68,W*0.60,H*0.08,"#1a1a1a","600","Arial");
        say(c,"1-800-555-0142",W/2,H*0.82,W*0.60,H*0.12,"#c8102e","800","Arial"); }, GX+GW+1.6, Y+1.25, F.z1+0.06, 0, false, 480); }

  /* ---- the tap: off the line up the power cut, west across the corn on two poles to the dead-end ---- */
  const DEX=33.0, DEY=Y+9.4;
  { const dx=POWER.x1-POWER.x0, dz=POWER.z1-POWER.z0, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L, ry=Math.atan2(ux, uz);
    let src=null;
    for(let s=4; s<L; s+=90){ const x=POWER.x0+ux*s, z=POWER.z0+uz*s; if(Math.hypot(x,z)>1500) break; if(!src || Math.abs(z+1402)<Math.abs(src.z+1402)) src={x:x, z:z}; }
    src.y=Terrain.groundAt(src.x, src.z);
    const top=[-1.1, 0, 1.1].map(o=>V3(src.x+Math.cos(ry)*o, src.y+12.5-0.84+(o===0?0.3:0), src.z-Math.sin(ry)*o));
    top.sort((a,b)=>a.z-b.z);
    // two poles, the crossarm along z, three pins
    const poles=[lerp(src.x, DEX, 0.36), lerp(src.x, DEX, 0.70)].map(x=>{ const z=-1402.0, y=Terrain.groundAt(x, z), H=12.0;
      cyl("pole", 0.15, 0.19, H, 8, x, y+H/2-0.8, z, "#7a6248"); push("pole", boxGeo(0.12, 0.12, 6.0, 0.5), x, y+H-1.4, z, 0, "#6e5840");
      for(const sd of [-1,1]) tube("pole", V3(x, y+H-2.3, z), V3(x, y+H-1.47, z+sd*1.3), 0.03, 4, "#6e5840");
      addCol(x-0.22, x+0.22, z-0.22, z+0.22, y-1, y+H);
      return PH.map(pz=>{ cyl("paintm", 0.05, 0.07, 0.28, 8, x, y+H-1.2, pz, "#8fa6a8"); return V3(x, y+H-1.04, pz); }); });
    const dead=PH.map(pz=>V3(DEX+1.40, DEY, pz));
    for(let k=0;k<3;k++){ wire(top[k], poles[0][k], 1.0, 0.012, 8); wire(poles[0][k], poles[1][k], 0.9, 0.012, 8); wire(poles[1][k], dead[k], 0.6, 0.012, 8); }
    EDIN_SUB.tapPoles=poles.map(p=>p[1]); }

  /* ---- the dead-end frame, the switch, the fuses ---- */
  for(const z of [-1406.6, -1397.4]) col(DEX, z, 9.9);
  B(0.40, 0.40, 9.9, DEX, DEY+0.10, -1402, GAL);
  for(const z of [-1406.6, -1397.4]) beam(V3(DEX, Y+7.6, z), V3(DEX, DEY-0.1, z+(z<-1402 ? 1.4 : -1.4)), 0.12, 0.12, GAL);      // (knee braces)
  for(const pz of PH){
    for(let k=0;k<7;k++) C(0.13, 0.03, DEX+0.30+k*0.16, DEY, pz, POR, 12, 0, 0, Math.PI/2);       // the strain string, out to the clamp
    tubeE(V3(DEX+0.20, DEY, pz), V3(DEX+1.40, DEY, pz), 0.012, "#8a8d90");
    // the jumper: from the clamp, round under the beam and down to the switch
    const s0=V3(DEX+1.40, DEY-0.05, pz), s1=V3(DEX+0.6, DEY-1.6, pz), s2=V3(29.7, Y+6.55, pz);
    wire(s0, s1, 0.1, 0.014, 3); wire(s1, s2, 0.35, 0.014, 5); }
  const stand=(x, h)=>{ for(const z of [-1406.4, -1397.6]) col(x, z, h-0.03); B(0.30, 0.30, 9.3, x, Y+h-0.15, -1402, GAL);
    for(const pz of PH) B(1.70, 0.10, 0.20, x, Y+h+0.045, pz, GAL); };
  stand(29.0, 5.0);
  for(const pz of PH){ post(28.3, Y+5.1, pz, 1.25); post(29.7, Y+5.1, pz, 1.25); post(29.0, Y+5.1, pz, 1.25);
    B(1.50, 0.05, 0.10, 29.0, Y+6.44, pz, "#c8ccc8"); C(0.06, 0.12, 28.3, Y+6.48, pz, "#c8ccc8", 8); }   // (the blade closed across them)
  tubeE(V3(29.0, Y+0.9, -1397.0), V3(29.0, Y+5.0, -1397.0), 0.03, GAL); tubeE(V3(29.0, Y+5.0, -1397.0), V3(29.0, Y+5.15, -1399.5), 0.03, GAL);
  B(0.06, 0.06, 0.70, 29.0, Y+0.95, -1396.7, GAL); B(0.30, 0.40, 0.20, 29.0, Y+1.30, -1396.85, "#5a5d60");                 // the operating handle, its padlocked box
  stand(25.0, 5.0);
  for(const pz of PH){ post(24.3, Y+5.1, pz, 1.10); post(25.7, Y+5.1, pz, 1.10);
    beam(V3(24.35, Y+6.30, pz), V3(25.55, Y+6.05, pz), 0.10, 0.10, "#4a4a4c"); C(0.05, 0.10, 25.62, Y+6.08, pz, "#8a8d90", 8);
    wire(V3(28.3, Y+6.45, pz), V3(25.7, Y+6.30, pz), 0.12, 0.014, 4); }

  /* ---- the transformer: on its pad in the oil curb, radiators down both sides ---- */
  const TX0=15.0, TX1=19.0, TZ0=-1403.4, TZ1=-1400.6, TB=Y+0.30, TT=TB+3.0;
  { for(const [x0,x1,z0,z1] of [[12.4,21.6,-1406.7,-1406.4],[12.4,21.6,-1397.6,-1397.3],[12.4,12.7,-1406.4,-1397.6],[21.3,21.6,-1406.4,-1397.6]])
      bx("concrete", x1-x0, 0.38, z1-z0, (x0+x1)/2, Y+0.15, (z0+z1)/2, 0.5, 0, "#a8a49a");
    { const g=new T.PlaneGeometry(8.6, 8.8), U=g.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*4.3, U.getY(k)*4.4);
      push("gravelbed", g, 17.0, Y+0.12, -1402.0, 0, "#7e7a72", -Math.PI/2, 0); }                    // (the curb's stone, darker, wet with oil once)
    bx("concrete", 5.0, 0.36, 4.0, 17.0, Y+0.12, -1402.0, 0.5, 0, "#b4b0a6");
    B(TX1-TX0, TT-TB+0.02, TZ1-TZ0, (TX0+TX1)/2, (TB-0.02+TT)/2, (TZ0+TZ1)/2, GRY);
    B(TX1-TX0+0.12, 0.08, TZ1-TZ0+0.12, (TX0+TX1)/2, TT+0.04, (TZ0+TZ1)/2, GRY);
    for(const x of [TX0+0.3, TX1-0.3]) for(const z of [TZ0, TZ1]) B(0.16, TT-TB-0.4, 0.06, x, (TB+TT)/2, z+(z<TZ1-1?-0.025:0.025), "#87918f");     // (the stiffeners)
    // the radiators: five a side, a dozen fins each between their headers; a fan under each pair
    for(const sd of [-1,1]){ const zf=sd<0 ? TZ0 : TZ1;
      for(let k=0;k<5;k++){ const rx=TX0+0.45+k*0.775, zc=zf+sd*0.62;
        for(let j=0;j<10;j++) B(0.018, 2.30, 0.80, rx-0.34+j*0.075, TB+1.45, zc, "#8a9496");
        for(const y of [TB+0.25, TB+2.65]){ C(0.07, 0.80, rx, y, zc, "#7e8888", 8, Math.PI/2); C(0.06, 0.26, rx, y, zf+sd*0.12, "#7e8888", 8, Math.PI/2); } }
      for(let k=0;k<2;k++){ const fx=TX0+1.2+k*1.6, fz=zf+sd*0.62; C(0.42, 0.20, fx, TB+0.05, fz, DK, 18); C(0.40, 0.21, fx, TB+0.05, fz, "#4a4c4e", 6); }
      tubeE(V3(TX0+0.2, TB+0.05, zf+sd*0.62), V3(TX1-0.2, TB+0.05, zf+sd*0.62), 0.03, "#7e8888"); }
    // the conservator on its legs, the bushings, the arresters, the control cabinet, the nameplate
    C(0.42, 2.6, 16.6, TT+0.95, -1400.75, GRY, 18, 0, 0, Math.PI/2); for(const x of [15.6, 17.6]) B(0.08, 0.60, 0.08, x, TT+0.37, -1400.75, GRY);
    tubeE(V3(16.6, TT+0.55, -1400.75), V3(16.6, TT+0.07, -1401.3), 0.03, GRY); C(0.10, 0.30, 15.1, TT+0.5, -1400.6, "#5a5d60", 10);
    for(const pz of PH){ const z=-1402+(pz+1402)*0.40;
      C(0.14, 0.25, 18.5, TT+0.18, z, GRY, 12); post(18.5, TT+0.25, z, 1.55, 0.13);
      C(0.09, 1.0, 19.35, TT+0.25+0.5, z, "#9a9e9c", 10); for(let k=0;k<6;k++) C(0.12, 0.03, 19.35, TT+0.35+k*0.14, z, "#9a9e9c", 10);
      B(0.85, 0.06, 0.10, 19.025, TT+0.22, z, GRY);
      wire(V3(25.0-0.66, Y+6.10, pz), V3(18.5, TT+1.86, z), 0.25, 0.014, 6); tubeE(V3(18.5, TT+1.86, z), V3(19.35, TT+1.30, z), 0.008, "#3a3c3e"); }
    for(let k=0;k<4;k++){ const z=-1402.9+k*0.45; C(0.11, 0.18, 15.4, TT+0.13, z, GRY, 12); post(15.4, TT+0.22, z, 0.75, 0.10); }
    B(0.40, 1.20, 0.80, TX0-0.19, TB+1.4, -1402.6, "#87918f"); B(0.02, 0.10, 0.04, TX0-0.40, TB+1.4, -1402.85, DK);
    sign(0.50, 0.32, (c,W,H)=>{ c.fillStyle="#d8d6cc"; c.fillRect(0,0,W,H); c.strokeStyle="#4a4a4a"; c.lineWidth=3; c.strokeRect(6,6,W-12,H-12);
        say(c,"TRANSFORMER T1",W/2,H*0.24,W*0.76,H*0.15,"#1a1a1a","800","Arial");
        say(c,"69 kV · 12.47 kV",W/2,H*0.46,W*0.70,H*0.12,"#1a1a1a","700","Arial");
        say(c,"10 / 12.5 MVA · OA/FA",W/2,H*0.64,W*0.70,H*0.11,"#1a1a1a","600","Arial");
        say(c,"OIL 4,850 GAL",W/2,H*0.80,W*0.60,H*0.10,"#1a1a1a","600","Arial"); }, TX0-0.012, TB+2.3, -1401.6, -Math.PI/2, false, 300);
    addCol(12.4, 21.6, -1406.7, -1397.3, Y-0.5, TT+2.0);
    HUM_POS.push({x:17.0, z:-1402.0}); EDIN_SUB.xfmr={x:17.0, z:-1402.0}; }

  /* ---- the low side: its frame and bus, the three regulators under it ---- */
  // (four columns, a beam along each side at the top and another at five metres; across those, the two that carry the bus)
  { for(const x of [4.0, 10.0]) for(const z of [-1406.8, -1397.2]) col(x, z, 5.97);
    for(const z of [-1406.8, -1397.2]){ B(6.4, 0.26, 0.26, 7.0, Y+5.87, z, GAL); B(6.4, 0.26, 0.26, 7.0, Y+5.0, z, GAL); }
    for(const x of [4.6, 9.4]) B(0.24, 0.24, 9.9, x, Y+4.99, -1402, GAL);
    for(const pz of PH){ for(const x of [4.6, 9.4]) post(x, Y+5.105, pz, 0.75, 0.10);
      tubeE(V3(3.4, Y+5.96, pz), V3(10.4, Y+5.96, pz), 0.045, "#c8ccc8");                     // the bus, aluminium pipe
      const z=-1402+(pz+1402)*0.18; wire(V3(15.4, TT+0.98, z), V3(10.4, Y+5.96, pz), 0.3, 0.016, 5); }
    // the regulators: a tank each on the platform, its bushings up to the bus, the control box on a stand by it
    B(1.80, 0.10, 8.2, 7.0, Y+1.0, -1402, GAL); for(const z of [-1405.8, -1398.2]) for(const x of [6.3, 7.7]) B(0.12, 0.95, 0.12, x, Y+0.48, z, GAL);
    for(const pz of PH){ C(0.55, 2.1, 7.0, Y+2.09, pz, GRY, 20); C(0.57, 0.08, 7.0, Y+3.18, pz, GRY, 20); ent(new T.SphereGeometry(0.55, 16, 6, 0, Math.PI*2, 0, Math.PI/2).scale(1, 0.3, 1), 7.0, Y+3.20, pz, GRY);
      for(let k=0;k<3;k++) for(let j=0;j<8;j++) B(0.012, 1.4, 0.18, 7.0+Math.cos(j*0.785+0.39)*0.62, Y+2.1, pz+Math.sin(j*0.785+0.39)*0.62, "#8a9496", -(j*0.785+0.39));
      for(const dx of [-0.25, 0.25]){ post(7.0+dx, Y+3.30, pz, 0.62, 0.09); wire(V3(7.0+dx, Y+3.95, pz), V3(7.0+dx*6, Y+5.96, pz), 0.05, 0.012, 3); }
      B(0.36, 0.06, 0.20, 7.0, Y+2.6, pz+0.62, GRY);
      B(0.40, 0.55, 0.25, 5.2, Y+1.35, pz, "#87918f"); B(0.06, 1.05, 0.06, 5.2, Y+0.52, pz, GAL); tubeE(V3(5.4, Y+1.2, pz), V3(6.45, Y+1.8, pz), 0.015, DK); }
    addCol(3.6, 10.4, -1407.2, -1396.8, Y-0.5, Y+3.4); }

  /* ---- the feeders: a breaker each off the bus, the cables down at the riser frame ---- */
  { const FZ=[-1408.0, -1402.0, -1396.0];
    FZ.forEach((fz, i)=>{
      for(const dx of [-0.6, 0.6]) for(const dz of [-0.6, 0.6]) B(0.10, 1.25, 0.10, 0.0+dx, Y+0.62, fz+dz, GAL);
      B(1.40, 1.50, 1.50, 0.0, Y+1.95, fz, GRY); B(1.46, 0.06, 1.56, 0.0, Y+2.73, fz, GRY);
      B(0.70, 1.10, 0.40, 0.0, Y+1.55, fz+0.94, "#87918f"); B(0.04, 0.12, 0.02, 0.22, Y+1.6, fz+1.15, DK);
      sign(0.40, 0.20, (c,W,H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H); say(c,["FEEDER 1 · VILLAGE","FEEDER 2 · ROUTE 6N","FEEDER 3 · LAKE"][i],W/2,H/2,W*0.80,H*0.42,"#1a1a1a","800","Arial"); },
        0.0, Y+2.35, fz+0.762, 0, false, 200);
      for(let k=0;k<3;k++){ const z=fz-0.45+k*0.45;
        for(const [x, to] of [[0.45, V3(3.4, Y+5.96, PH[k])],[-0.45, null]]){ post(x, Y+2.76, z, 0.80, 0.08);
          if(to) wire(V3(x, Y+3.6, z), to, 0.2, 0.012, 5);
          else { wire(V3(x, Y+3.6, z), V3(-3.6, Y+3.45, z), 0.15, 0.012, 4);
            C(0.07, 0.55, -3.6, Y+3.15, z, "#5a3a2a", 10); for(let j=0;j<4;j++) C(0.10, 0.025, -3.6, Y+3.0+j*0.12, z, "#5a3a2a", 10);
            tubeE(V3(-3.6, Y+2.88, z), V3(-3.6, Y+0.9, z), 0.03, "#141414"); } } }
      tubeE(V3(-3.6, Y+0.9, fz), V3(-3.6, Y-0.1, fz), 0.08, "#8a8d90");
      addCol(-0.8, 0.8, fz-0.8, fz+1.2, Y-0.5, Y+2.8); });
    // the riser frame the cables come down: two columns, a beam along it at three metres, the terminators on brackets
    for(const z of [-1409.4, -1394.6]) col(-3.85, z, 3.6);
    B(0.24, 0.24, 15.2, -3.85, Y+2.80, -1402, GAL);
    for(const fz of FZ){ B(0.16, 0.10, 1.40, -3.70, Y+2.98, fz, GAL);
      for(let k=0;k<3;k++) tubeE(V3(-3.6, Y+0.9, fz-0.45+k*0.45), V3(-3.6, Y+0.95, fz), 0.03, "#141414");
      addCol(-3.9, -3.3, fz-0.7, fz+0.7, Y-0.5, Y+2.9); } }

  /* ---- lights on two poles, the station service transformer, the lineman's truck ---- */
  for(const [x, z, ry] of [[-10.0, -1404.0, -0.6],[26.0, -1385.0, 2.4]]){
    C(0.12, 9.0, x, Y+4.5, z, GAL, 10); addCol(x-0.16, x+0.16, z-0.16, z+0.16, Y-0.5, Y+9);
    const hx=x+Math.sin(ry)*0.5, hz=z+Math.cos(ry)*0.5; B(0.40, 0.20, 0.55, hx, Y+8.9, hz, "#5a5d60", ry); push("tube", planeGeo(0.32, 0.44, 0), hx, Y+8.795, hz, ry, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:hx, y:Y+8.6, z:hz, color:0xffd9a8, intensity:1.1, dist:28, decay:1.3, mothy:true}); }
  B(1.20, 1.05, 1.00, -3.0, Y+0.53, -1390.2, "#2f5a3a"); B(1.24, 0.04, 1.04, -3.0, Y+1.07, -1390.2, "#2a4e33"); addCol(-3.65, -2.35, -1390.75, -1389.65, Y-0.5, Y+1.1);
  parked(2, "#f2f0ea", 21.0, -1380.4, Math.PI/2, Y+0.034-PAVE_T);

  /* ======================================================================
     THE CONTROL HOUSE
     ====================================================================== */
  const H={x0:-14.0, x1:-6.0, z0:-1388.0, z1:-1381.0}, WT=0.20, FF=Y+0.22, CL=FF+3.0, TOPW=FF+3.27;
  const IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT, BLK="#cfc6b0", INW="#e8e6de";
  const DOOR={a:-1384.9, b:-1383.9, sill:FF-0.03, head:FF+2.10};
  { bx("concrete", H.x1-H.x0+0.30, FF-(Y-0.15), H.z1-H.z0+0.30, (H.x0+H.x1)/2, (FF+Y-0.15)/2, (H.z0+H.z1)/2, 0.5, 0, "#b4b0a6");
    addFlat(H.x0-0.15, H.x1+0.15, H.z0-0.15, H.z1+0.15, FF);
    // the stoop at the door, a step down to the stone
    bx("concrete", 1.0, 0.14, 1.6, H.x1+0.63, Y+0.07+0.02, (DOOR.a+DOOR.b)/2, 0.5, 0, "#b4b0a6"); addFlat(H.x1+0.15, H.x1+1.13, DOOR.a-0.3, DOOR.b+0.3, Y+0.16);
    runX("block", H.z0+WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [], BLK, 0.5);
    runX("block", H.z1-WT/2, WT, H.x0, H.x1, FF-0.02, TOPW, [], BLK, 0.5);
    runZ("block", H.x0+WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [], BLK, 0.5);
    runZ("block", H.x1-WT/2, WT, IZ0, IZ1, FF-0.02, TOPW, [DOOR], BLK, 0.5);
    lineX("plaster", IZ0, 1, IX0, IX1, FF, CL, [], INW); lineX("plaster", IZ1, -1, IX0, IX1, FF, CL, [], INW);
    lineZ("plaster", IX0, 1, IZ0, IZ1, FF, CL, [], INW); lineZ("plaster", IX1, -1, IZ0, IZ1, FF, CL, [DOOR], INW);
    ceilAt("plaster", IX0, IX1, IZ0, IZ1, CL, "#f2f0ea");
    bx("concrete", H.x1-H.x0+0.50, 0.20, H.z1-H.z0+0.50, (H.x0+H.x1)/2, TOPW-0.02+0.10, (H.z0+H.z1)/2, 0.5, 0, "#6a6a68");     // the roof, the walls a couple of centimetres up into it
    B(H.x1-H.x0+0.56, 0.12, 0.03, (H.x0+H.x1)/2, TOPW+0.10, H.z1+0.26, "#8a6a48"); B(H.x1-H.x0+0.56, 0.12, 0.03, (H.x0+H.x1)/2, TOPW+0.10, H.z0-0.26, "#8a6a48");
    B(0.03, 0.11, H.z1-H.z0+0.52, H.x0-0.26, TOPW+0.095, (H.z0+H.z1)/2, "#8a6a48"); B(0.03, 0.11, H.z1-H.z0+0.52, H.x1+0.26, TOPW+0.095, (H.z0+H.z1)/2, "#8a6a48");
    frZ(H.x1-WT/2, WT, DOOR.a, DOOR.b, FF-0.03, DOOR.head, "#5a5d60");
    makeDoor(XF(H.x1-WT/2, DOOR.a+0.02, -Math.PI/2), 0, FF+0.01, 0, "THE CONTROL HOUSE", true, 0, "steel", 0x7d8286);
    for(const [x0,x1,z0,z1] of [[H.x0, H.x1, H.z0, IZ0],[H.x0, H.x1, IZ1, H.z1],[H.x0, IX0, IZ0, IZ1],[IX1, H.x1, IZ0, DOOR.a],[IX1, H.x1, DOOR.b, IZ1]]) addCol(x0, x1, z0, z1, FF-0.5, TOPW);
    addZone(IX0, IX1, IZ0, IZ1, FF-0.5, CL, "THE CONTROL HOUSE", true);
    // outside: the light over the door, the window unit through the south wall, a louvre on the north, the signs
    B(0.24, 0.12, 0.18, H.x1+0.085, DOOR.head+0.32, (DOOR.a+DOOR.b)/2, "#2a2a2c"); push("tube", planeGeo(0.18, 0.12, 0), H.x1+0.12, DOOR.head+0.255, (DOOR.a+DOOR.b)/2, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:H.x1+0.6, y:DOOR.head+0.1, z:(DOOR.a+DOOR.b)/2, color:0xffe2b8, intensity:0.6, dist:9, decay:1.5, mothy:true});
    B(0.70, 0.45, 0.42, -10.0, FF+1.55, H.z1+0.19, "#d8d6cc"); B(0.62, 0.36, 0.02, -10.0, FF+1.55, H.z1+0.412, "#9a9a96");
    B(0.62, 0.40, 0.03, -10.0, FF+1.55, IZ1-0.03, "#e8e6de"); for(let k=0;k<6;k++) B(0.56, 0.012, 0.012, -10.0, FF+1.40+k*0.06, IZ1-0.045, "#9a9a96");
    B(0.60, 0.60, 0.05, -8.0, FF+2.3, H.z0-0.02, "#8a8d90"); for(let k=0;k<6;k++) B(0.54, 0.012, 0.03, -8.0, FF+2.06+k*0.09, H.z0-0.055, "#6a6d70");
    sign(0.70, 0.40, (c,W,H2)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0,0,W,H2); c.fillStyle="#c8102e"; c.fillRect(0,0,W,H2*0.34);
        say(c,"DANGER",W/2,H2*0.17,W*0.6,H2*0.22,"#f2f0e8","900","Arial");
        say(c,"BATTERY ROOM · NO SMOKING",W/2,H2*0.55,W*0.80,H2*0.13,"#1a1a1a","800","Arial");
        say(c,"NO OPEN FLAMES OR SPARKS",W/2,H2*0.78,W*0.80,H2*0.11,"#1a1a1a","700","Arial"); }, H.x1+0.012, FF+1.55, DOOR.b+0.62, Math.PI/2, false, 280); }
  // inside: the relay panels across the north wall, one face of meters and lamps and switches over the whole lineup
  { const PZ=IZ0+0.04, PD=0.60, PX0=-13.4, PX1=-8.6, PH2=2.30;
    B(PX1-PX0, PH2, PD, (PX0+PX1)/2, FF+PH2/2, PZ+PD/2, "#a8aca8");
    for(let k=1;k<6;k++) B(0.02, PH2-0.04, 0.012, PX0+k*0.8, FF+PH2/2, PZ+PD+0.004, "#6a6d70");
    const face=signTex(1200, 560, (c,W,H2)=>{ c.fillStyle="#b4b8b4"; c.fillRect(0,0,W,H2);
      const names=["69 kV LINE","T1 DIFF","T1 LOW SIDE","FEEDER 1","FEEDER 2","FEEDER 3"];
      for(let p=0;p<6;p++){ const ox=p*W/6, w=W/6;
        c.strokeStyle="#7a7d80"; c.lineWidth=3; c.strokeRect(ox+3, 3, w-6, H2-6);
        c.fillStyle="#2a3a5a"; c.fillRect(ox+18, 18, w-36, 34); say(c, names[p], ox+w/2, 35, (w-48), 24, "#f2f0e8", "800", "Arial");
        // the meters: two round ones, a row of digital ones
        for(const mx of [0.30, 0.70]){ c.fillStyle="#1a1a1a"; c.beginPath(); c.arc(ox+w*mx, 108, 34, 0, 7); c.fill(); c.fillStyle="#f4f2ec"; c.beginPath(); c.arc(ox+w*mx, 108, 29, 0, 7); c.fill();
          c.strokeStyle="#c8102e"; c.lineWidth=2; c.beginPath(); c.moveTo(ox+w*mx, 120); const a=-2.4+r()*1.6; c.lineTo(ox+w*mx+Math.cos(a)*24, 120+Math.sin(a)*24); c.stroke(); }
        for(let k=0;k<3;k++){ c.fillStyle="#0e1a12"; c.fillRect(ox+18+k*(w-36)/3+4, 160, (w-36)/3-8, 26); c.fillStyle="#7af08a"; c.fillRect(ox+26+k*(w-36)/3, 168, (w-36)/3-24, 10); }
        // the relays: black cases in two rows with their little windows
        for(let row=0;row<2;row++) for(let k=0;k<2;k++){ const rx=ox+22+k*(w-44)/2, ry=210+row*96;
          c.fillStyle="#1a1a1a"; c.fillRect(rx, ry, (w-44)/2-10, 80); c.fillStyle="#3a4a5a"; c.fillRect(rx+8, ry+10, (w-44)/2-26, 26);
          for(let j=0;j<4;j++){ c.fillStyle=["#c8102e","#2ac84a","#e6c21c","#2ac84a"][j]; c.beginPath(); c.arc(rx+14+j*16, ry+56, 5, 0, 7); c.fill(); } }
        // the lamps and the control switch: red closed, green open
        for(const [lx, cc] of [[0.30,"#e8332a"],[0.70,"#2ac84a"]]){ c.fillStyle="#2a2a2a"; c.beginPath(); c.arc(ox+w*lx, 430, 16, 0, 7); c.fill(); c.fillStyle=cc; c.beginPath(); c.arc(ox+w*lx, 430, 11, 0, 7); c.fill(); }
        c.fillStyle="#1a1a1a"; c.beginPath(); c.arc(ox+w/2, 485, 24, 0, 7); c.fill(); c.fillStyle="#f2f0e8"; c.fillRect(ox+w/2-4, 465, 8, 40);
        say(c, "TRIP · CLOSE", ox+w/2, 530, w*0.6, 16, "#1a1a1a", "700", "Arial"); } });
    signPanel(PX1-PX0-0.02, PH2-0.12, face, (PX0+PX1)/2, FF+PH2/2, PZ+PD+0.012, 0);
    addCol(PX0, PX1, IZ0, PZ+PD+0.02, FF-0.5, FF+PH2); EDIN_SUB.panels={x0:PX0, x1:PX1}; }
  // the battery rack on the west wall, two tiers of cells and their straps; the charger cabinet by it; the eyewash
  { const bx0=IX0+0.08, z0=-1386.9, z1=-1384.5;
    for(const z of [z0, z1]) for(const dx of [0.05, 0.65]) B(0.05, 1.10, 0.05, bx0+dx, FF+0.55, z, "#3a5a8a");
    for(const y of [0.30, 0.80]){ B(0.68, 0.04, z1-z0+0.06, bx0+0.35, FF+y, (z0+z1)/2, "#3a5a8a");
      for(let k=0;k<11;k++){ const z=z0+0.14+k*0.22; B(0.26, 0.30, 0.18, bx0+0.35, FF+y+0.175, z, "#e8e4d8");
        for(const dx of [-0.07, 0.07]) C(0.018, 0.04, bx0+0.35+dx, FF+y+0.34, z, dx<0 ? "#c41a1a" : "#1a1a1a", 6);
        if(k<10) B(0.03, 0.01, 0.20, bx0+0.35, FF+y+0.36, z+0.11, "#c8a050"); } }
    B(0.45, 1.60, 0.70, IX0+0.25, FF+0.80, -1383.6, "#a8aca8"); B(0.02, 0.24, 0.30, IX0+0.481, FF+1.30, -1383.6, "#0e1a12");
    B(0.02, 0.05, 0.10, IX0+0.481, FF+1.05, -1383.75, "#2ac84a");
    B(0.30, 0.42, 0.14, IX0+0.07, FF+1.30, -1382.3, "#e6c21c");
    addCol(IX0, bx0+0.72, z0-0.1, z1+0.1, FF-0.5, FF+1.2); addCol(IX0, IX0+0.50, -1384.0, -1383.2, FF-0.5, FF+1.6);
    sign(0.40, 0.18, (c,W,H2)=>{ c.fillStyle="#2a6a2a"; c.fillRect(0,0,W,H2); say(c,"125 VDC BATTERY",W/2,H2/2,W*0.80,H2*0.50,"#f2f0e8","800","Arial"); }, IX0+0.012, FF+1.50, (z0+z1)/2, Math.PI/2, false, 200); }
  // the RTU cabinet, its lamps blinking (live), in the north-east corner
  { const rx=IX1-0.40, rz=IZ0+0.36;
    B(0.70, 2.0, 0.60, rx, FF+1.0, rz, "#a8aca8"); B(0.50, 0.70, 0.012, rx, FF+1.40, rz+0.306, "#1a1f26");
    const led=new T.Mesh(boxGeo(0.30, 0.02, 0.01), new T.MeshBasicMaterial({color:0x40ff70}));
    led.position.set(rx, FF+1.60, rz+0.318); scene.add(led); EDIN_SUB.led=led;
    const led2=new T.Mesh(boxGeo(0.30, 0.02, 0.01), new T.MeshBasicMaterial({color:0xffb030}));
    led2.position.set(rx, FF+1.52, rz+0.318); scene.add(led2); EDIN_SUB.led2=led2;
    addCol(rx-0.36, rx+0.36, IZ0, rz+0.32, FF-0.5, FF+2.0); }
  // the desk on the south wall: a laptop open on the log, a phone, the chair; the one-line by it; the hard hat on its hook
  { const dx=-11.6, dz=IZ1-0.38;
    B(1.60, 0.04, 0.72, dx, FF+0.74, dz, "#8a8d90"); for(const ex of [-0.75, 0.75]) B(0.04, 0.72, 0.66, dx+ex, FF+0.36, dz, "#6a6d70");
    B(0.36, 0.02, 0.25, dx-0.2, FF+0.775, dz-0.05, "#2a2a2c"); B(0.36, 0.24, 0.02, dx-0.2, FF+0.90, dz+0.07, "#2a2a2c", 0, 0.25);
    const scr=new T.Mesh(planeGeo(0.32, 0.20, 0), new T.MeshBasicMaterial({color:0x3a7ac8})); scr.position.set(dx-0.2, FF+0.904, dz+0.055); scr.rotation.set(0.25, Math.PI, 0); scene.add(scr);
    B(0.30, 0.02, 0.40, dx+0.35, FF+0.775, dz-0.02, "#2a5a3a"); B(0.18, 0.06, 0.20, dx+0.70, FF+0.795, dz+0.05, "#1a1a1a");
    B(0.46, 0.06, 0.46, dx, FF+0.48, dz-0.62, "#2a2a2c"); B(0.46, 0.50, 0.06, dx, FF+0.78, dz-0.88, "#2a2a2c"); C(0.03, 0.45, dx, FF+0.23, dz-0.62, "#5a5d60", 8);
    addCol(dx-0.82, dx+0.82, dz-0.38, IZ1, FF-0.5, FF+0.78);
    addSeat(dx, dz-0.62, FF, Math.PI, "THE DESK CHAIR");
    addUse(dx+0.35, dz-0.6, FF, "READ THE LOG", ()=>toast(["“0610 · T1 TOP OIL 41°C · ALL FANS OFF · BATT 132 V FLOAT · R.K.”","“FDR 2 TRIPPED 0214, RECLOSED, HELD. TREE ON THE LINE AT McKEAN RD AGAIN”","“REG B STUCK ON STEP 9 — HAND-RAISED IT. TELL THE OFFICE”","“GROUNDHOG UNDER THE CONTROL HOUSE. NOT MY JOB”","“CHECKED THE GATE LOCK. SOMEBODY'S BEEN CUTTING THROUGH TO THE CHURCH”"][(Math.random()*5)|0],"#d8e4f0"), 1.2);
    // the one-line diagram, framed, on the east wall south of the door
    sign(0.90, 0.64, (c,W,H2)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H2); c.strokeStyle="#1a1a1a"; c.lineWidth=4; c.strokeRect(8,8,W-16,H2-16);
        say(c,"FRENCH CREEK SUB · ONE-LINE",W/2,H2*0.10,W*0.80,H2*0.07,"#1a1a1a","800","Arial");
        c.lineWidth=3; c.strokeStyle="#c8102e"; c.beginPath(); c.moveTo(W*0.5, H2*0.18); c.lineTo(W*0.5, H2*0.40); c.stroke();
        c.beginPath(); c.arc(W*0.5, H2*0.44, H2*0.045, 0, 7); c.stroke(); c.beginPath(); c.arc(W*0.5, H2*0.51, H2*0.045, 0, 7); c.stroke();
        c.strokeStyle="#1f4a7a"; c.beginPath(); c.moveTo(W*0.5, H2*0.555); c.lineTo(W*0.5, H2*0.64); c.moveTo(W*0.18, H2*0.64); c.lineTo(W*0.82, H2*0.64); c.stroke();
        for(const fx of [0.25, 0.5, 0.75]){ c.beginPath(); c.moveTo(W*fx, H2*0.64); c.lineTo(W*fx, H2*0.86); c.stroke(); c.fillStyle="#1f4a7a"; c.fillRect(W*fx-9, H2*0.72, 18, 18); }
        say(c,"69 kV",W*0.62,H2*0.26,W*0.14,H2*0.06,"#c8102e","700","Arial"); say(c,"12.47 kV",W*0.70,H2*0.60,W*0.18,H2*0.06,"#1f4a7a","700","Arial"); },
      IX1-0.012, FF+1.60, -1382.4, -Math.PI/2, false, 360);
    // the hard hat and the hot stick on the west wall's hooks, the extinguisher by the door
    ent(new T.SphereGeometry(0.15, 14, 8, 0, Math.PI*2, 0, Math.PI/2).scale(1.1, 0.9, 1.25), IX0+0.18, FF+1.72, -1382.0, "#f2f0ea");
    B(0.04, 0.04, 0.10, IX0+0.03, FF+1.70, -1382.0, "#5a5d60");
    tubeE(V3(IX0+0.10, FF+0.30, -1381.6), V3(IX0+0.10, FF+2.50, -1381.6), 0.025, "#e6c21c");
    C(0.08, 0.50, IX1-0.15, FF+0.55, DOOR.b+0.45, "#c41a1a", 12); C(0.03, 0.10, IX1-0.15, FF+0.85, DOOR.b+0.45, "#1a1a1a", 8); }
  // the light: two fixtures with their tubes, and the lamps under them
  for(const x of [-11.8, -8.4]){ B(1.24, 0.08, 0.30, x, CL-0.045, -1384.5, "#e8e8e4"); push("tube", planeGeo(1.16, 0.22, 0), x, CL-0.092, -1384.5, 0, "#ffffff", Math.PI/2, 0);
    LAMPS.push({x:x, y:CL-0.3, z:-1384.5, color:0xeef4ff, intensity:0.85, dist:7, decay:1.5, indoor:true, vol:[IX0, IX1, IZ0, IZ1, FF-0.5, CL]}); }

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.25}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  EDIN_SUB.house=H; EDIN_SUB.gate={x:GX, z:F.z1}; EDIN_SUB.fence=F; EDIN_SUB.door=DOOR; EDIN_SUB.ff=FF;

  // a lineman out by the transformer, checking the gauges on his clipboard, by day; his truck the white one by the gate
  if(typeof crowdAdd==="function"){ const G=crowdGroup("the substation", 10, -1396, 160);
    crowdAdd(G, {look:{h:1.0, skin:SKINS[1], hair:HAIRS[4], shirt:"#d8e83a", pants:"#3b4a66", shoes:"#4a3a2a", long:true, cap:"#f2f0ea", vest:"#f26a1a", boots:true},
                 x:17.6, z:-1396.6, yaw:Math.PI, mode:"read", held:"paper", heldL:true, dayOnly:true}); }
})();
// the RTU's lamps: one blinking with the polls, one on now and then
function updateEdinSub(dt, now){
  if(!EDIN_SUB.led) return;
  const c=camera.position; if(Math.abs(c.x+10)>30 || Math.abs(c.z+1384)>30) return;
  EDIN_SUB.led.visible=(now*2.2)%1<0.5; EDIN_SUB.led2.visible=Math.sin(now*0.7)>0.6;
}
