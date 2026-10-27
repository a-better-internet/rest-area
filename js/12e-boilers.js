"use strict";
/* REST AREA · 12e-boilers.js
   behind the wheel door at the end of the sub-basement (12d): the boiler hall
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12e · THE BOILER HALL
   The wheel on the steel door at the end of the sub-basement turns now.
   E puts your hands on it: it gives, spins three times round as the dogs
   draw back out of the frame, clunks, and the door swings slowly in on a
   hall the size of a church dug out of the hill, three storeys of it, lit
   red. You come out on a grating catwalk under the ceiling's height; a
   steel stair goes down the wall and turns at a landing to the floor.
   Down there: three Scotch marine boilers on their saddles, side by side,
   fronts to the stair, burners roaring and the fire showing round their
   doors and in their sight glasses; each one's steam stop with a red
   handwheel, the header they feed running the width of the hall under
   the ceiling, their stacks up into the breeching. Against the east wall
   the deaerator on its platform and the two feed pumps under it; on the
   west wall the control panel, its dials lit, a red beacon going round
   on top, and at the desk in front of it a logbook somebody is still
   keeping. One stop valve weeps steam.
   All of it BURIED (06), with a fill held at half of underground's and
   tinted red; its lamps are red cages on the walls, the fires' glow and
   the beacon, under:true, and only while you are in the hall or at the
   door. The hall is dug well under the hill (seven metres of rock over
   its ceiling), so the ground needs no hole, only the VOID that puts its
   floor under you.
   ---------------------------------------------------------------------- */
const BOILERS={t:0, roar:0, wheel:null, door:null, fires:[], fireMat:null, gauges:[], beacon:null, steamT:0.4, hissT:18, inHall:false, told:false};
(function boilerHall(){
  const WD=SUBBASE.wheelDoor; if(!WD) return;
  const SB=SUBBASE.y, SH=SUBBASE.h, HF=SB-5.0, HC=SB+5.6, RH=(SB-HF)/26, RUN=0.28;
  const X0=86.0, X1=112.0, Z0=-280.6, Z1=-258.64;                  // the hall's inside faces (its south wall 4 cm past the doorway's end)
  BOILERS.hall={x0:X0, x1:X1, z0:Z0, z1:Z1, y0:HF, y1:HC};
  const VOL=[X0-0.3, X1+0.3, Z0-0.3, Z1+0.05, HF-0.5, HC+0.2];     // its lamps: lit for you only in here (the rock is between them and anywhere else)
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const CZ=(r,len,x,y,z,c,seg)=>C(r,len,x,y,z,c,seg,Math.PI/2,0,0);            // a cylinder lying along z
  const CX=(r,len,x,y,z,c,seg)=>C(r,len,x,y,z,c,seg,0,0,Math.PI/2);            // and along x
  const tubeE=(a,b,r,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    E.push({geo:new T.CylinderGeometry(r,r,L,seg||10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x, s, cx, cy, w, h, col, weight, family)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const lamp=(o)=>{ o.under=true; o.indoor=true; o.circ=null; o.vol=VOL; LAMPS.push(o); return o; };
  const STEEL="#4a4e52", DARK="#2a2c2e", RAIL="#b8921c", CONC="#6a625c";

  // the bar grating of the catwalk, the landing and the treads: see-through, the light coming up through it
  const grate=(function(){ const S=128, c=cvs(S,S), x=c.getContext("2d");
    x.clearRect(0,0,S,S); x.fillStyle="#5a5e62"; for(let i=0;i<S;i+=16) x.fillRect(i, 0, 5, S);
    x.fillStyle="#4a4e52"; for(let j=0;j<S;j+=32) x.fillRect(0, j, S, 3);
    const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; })();
  bucketOf("bp_grate", ()=>new T.MeshStandardMaterial({map:grate, alphaTest:0.5, side:T.DoubleSide, roughness:0.55, metalness:0.55}));

  /* ---- the hall: walls, floor, ceiling ------------------------------------ */
  // the south wall round the wheel door's opening (1 cm inside its jambs, which cover the cut); the north
  // wall the width of the hall; the east and west between them, a little thinner and lower so that no face of
  // one lies in a face of the other
  const WC2="#6e6660", HO={x0:WD.a+0.01, x1:WD.b-0.01, y0:SB-0.03, y1:SB+SH+0.12};
  for(const [x0,x1,y0,y1] of [[X0-0.30, HO.x0, HF-0.1, HC+0.1], [HO.x1, X1+0.30, HF-0.1, HC+0.1], [HO.x0, HO.x1, HO.y1, HC+0.1], [HO.x0, HO.x1, HF-0.1, HO.y0]])
    wallBox("concrete", x0, x1, Z1, Z1+0.25, y0, y1, WC2, 0.5, HF);
  wallBox("concrete", X0-0.30, X1+0.30, Z0-0.30, Z0, HF-0.1, HC+0.1, WC2, 0.5, HF);
  wallBox("concrete", X0-0.28, X0, Z0-0.01, Z1+0.01, HF-0.09, HC+0.09, WC2, 0.5, HF);
  wallBox("concrete", X1, X1+0.28, Z0-0.01, Z1+0.01, HF-0.09, HC+0.09, WC2, 0.5, HF);
  floorAt("concrete", X0, X1, Z0, Z1, HF+0.004, "#4e4642", 0.5); addFlat(X0, X1, Z0, Z1, HF);
  ceilAt("concrete", X0, X1, Z0, Z1, HC, "#3a3432", 0.5);
  // the ceiling's beams across it, every four metres
  for(let x=89.0; x<X1; x+=4.0) B(0.30, 0.50, Z1-Z0+0.02, x, HC-0.25, (Z0+Z1)/2, "#4a4440");
  addVoid(X0-0.05, X1+0.05, Z0-0.05, Z1+0.02, HF-3, HC+0.3, HF);
  addBuried(X0-0.05, X1+0.05, Z0-0.05, Z1+0.02, HF-0.5, HC+0.05, 0.55, 0xff3a26);
  addZone(X0, X1, Z0, Z1+0.02, HF-0.5, HC, "THE BOILER HALL", true);

  /* ---- the catwalk at the door, the stair down the wall, the landing -------- */
  const CW={x0:94.6, x1:103.0, z0:-261.4, z1:Z1};
  bx("bp_grate", CW.x1-CW.x0, 0.04, CW.z1-CW.z0, (CW.x0+CW.x1)/2, SB-0.02, (CW.z0+CW.z1)/2, 3.0, 0, "#ffffff");
  addFlat(CW.x0-0.01, CW.x1, CW.z0, CW.z1+0.03, SB);
  // under it: a channel along its open edge, joists back to the wall, two columns to the floor
  B(CW.x1-CW.x0, 0.30, 0.10, (CW.x0+CW.x1)/2, SB-0.19, CW.z0+0.05, STEEL);
  for(let x=CW.x0+0.4; x<CW.x1; x+=2.0) B(0.08, 0.24, CW.z1-CW.z0-0.10, x, SB-0.16, (CW.z0+CW.z1)/2+0.05, STEEL);
  for(const x of [CW.x0+0.15, CW.x1-0.15]){ B(0.20, SB-0.34-HF, 0.20, x, (HF+SB-0.34)/2, CW.z0+0.15, STEEL); addCol(x-0.1, x+0.1, CW.z0+0.05, CW.z0+0.25, HF-0.5, SB-0.34); }
  // a rail: posts, a top rail, a mid rail, a kick plate, between two points at height y (the posts every 1.4 m or so)
  // (a run that starts or ends on another's corner post leaves that post out: skip 1 the first, 2 the last, 3 both)
  const railRun=(x0,z0,x1,z1,y0,y1,skip)=>{ const L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/1.4));
    for(let k=0;k<=n;k++){ if((k===0 && (skip&1)) || (k===n && (skip&2))) continue;
      const t=k/n, x=x0+(x1-x0)*t, z=z0+(z1-z0)*t, y=y0+(y1-y0)*t; B(0.05, 1.06, 0.05, x, y+0.53, z, RAIL); }
    for(const h of [1.04, 0.54]) tubeE(V3(x0, y0+h, z0), V3(x1, y1+h, z1), 0.022, RAIL, 8);
    if(y0===y1){ const dx=x1-x0, dz=z1-z0, alongX=Math.abs(dx)>0.01;
      B(alongX ? L : 0.012, alongX ? 0.10 : 0.104, alongX ? 0.012 : L, (x0+x1)/2, y0+(alongX ? 0.06 : 0.062), (z0+z1)/2, "#3a3c3e"); } };
  railRun(CW.x0+0.03, CW.z0+0.03, CW.x1-0.03, CW.z0+0.03, SB, SB); railRun(CW.x1-0.03, CW.z0+0.03, CW.x1-0.03, CW.z1-0.03, SB, SB, 1);
  railRun(CW.x0+0.03, CW.z0+0.03, CW.x0+0.03, -259.89, SB, SB, 1);
  addCol(CW.x0, CW.x1, CW.z0, CW.z0+0.08, SB, SB+1.1); addCol(CW.x1-0.08, CW.x1, CW.z0, CW.z1, SB, SB+1.1); addCol(CW.x0, CW.x0+0.08, CW.z0, -259.90, SB, SB+1.1);
  // the stair: thirteen risers down west along the wall to a landing, thirteen more down north to the floor
  const A={z0:-259.86, z1:-258.66, x0:CW.x0}, LD={x0:89.96, x1:91.26, z0:-261.10, z1:-258.66, y:SB-13*RH}, Bf={x0:90.0, x1:91.2, z0:LD.z0};
  for(let k=1;k<=12;k++){ const xb=A.x0-(k-1)*RUN, xa=xb-RUN, y=SB-k*RH;
    bx("bp_grate", RUN+0.02, 0.04, A.z1-A.z0, (xa+xb)/2, y-0.02, (A.z0+A.z1)/2, 3.0, 0, "#ffffff");
    B(0.03, 0.03, A.z1-A.z0-0.02, xa+0.015, y-0.02, (A.z0+A.z1)/2, "#c9a21c");                  // (a yellow nosing, inside the grating's edge)
    addFlat(xa-0.01, xb+0.01, A.z0, A.z1, y);
    addCol(xa, xb, A.z0, A.z1, HF-0.5, y-0.45);                                                  // (nothing walks in under it; low enough that a heel two treads on clears it)
    addCol(xa-0.01, xb+0.01, A.z0-0.06, A.z0, y, y+1.05); }
  { const a=V3(A.x0, SB-0.15, 0), b=V3(LD.x1, LD.y-0.15, 0);
    for(const z of [A.z0-0.025, A.z1+0.025]){ a.z=b.z=z; const d=b.clone().sub(a), L=d.length();
      E.push({geo:boxGeo(L, 0.26, 0.04), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromEuler(new T.Euler(0,0,Math.atan2(d.y,d.x))), V3(1,1,1)), color:new T.Color(STEEL)}); } }
  railRun(CW.x0+0.03, -259.89, LD.x1-0.03, -259.89, SB, LD.y, 3);
  tubeE(V3(A.x0, SB+0.92, Z1-0.07), V3(LD.x1, LD.y+0.92, Z1-0.07), 0.021, DARK);                // (a pipe rail on the wall)
  // the landing, its rail round the open sides, and one column under it at the wall end
  bx("bp_grate", LD.x1-LD.x0, 0.04, LD.z1-LD.z0, (LD.x0+LD.x1)/2, LD.y-0.02, (LD.z0+LD.z1)/2, 3.0, 0, "#ffffff");
  B(LD.x1-LD.x0, 0.20, 0.08, (LD.x0+LD.x1)/2, LD.y-0.14, LD.z0+0.04, STEEL); B(0.07, 0.20, LD.z1-LD.z0-0.005, LD.x0+0.04, LD.y-0.14, (LD.z0+LD.z1)/2+0.0025, STEEL);
  addFlat(LD.x0, LD.x1+0.01, LD.z0-0.01, LD.z1, LD.y);
  B(0.18, LD.y-0.24-HF, 0.18, LD.x0+0.12, (HF+LD.y-0.24)/2, -259.9, STEEL); addCol(LD.x0+0.03, LD.x0+0.21, -259.99, -259.81, HF-0.5, LD.y-0.26);
  railRun(LD.x0+0.03, LD.z1-0.03, LD.x0+0.03, LD.z0+0.03, LD.y, LD.y); railRun(LD.x1-0.03, LD.z0+0.03, LD.x1-0.03, -259.89, LD.y, LD.y);
  addCol(LD.x0, LD.x0+0.07, LD.z0, LD.z1, LD.y, LD.y+1.1); addCol(LD.x1-0.07, LD.x1, LD.z0, A.z0, LD.y, LD.y+1.1);
  for(let k=1;k<=12;k++){ const za=Bf.z0-(k-1)*RUN, zb=za-RUN, y=LD.y-k*RH;
    bx("bp_grate", Bf.x1-Bf.x0, 0.04, RUN+0.02, (Bf.x0+Bf.x1)/2, y-0.02, (za+zb)/2, 3.0, 0, "#ffffff");
    B(Bf.x1-Bf.x0-0.02, 0.03, 0.03, (Bf.x0+Bf.x1)/2, y-0.02, zb+0.015, "#c9a21c");
    addFlat(Bf.x0, Bf.x1, zb-0.01, za+0.01, y);
    addCol(Bf.x0, Bf.x1, zb, za, HF-0.5, y-0.45);
    addCol(Bf.x0-0.06, Bf.x0, zb-0.01, za+0.01, y, y+1.05); addCol(Bf.x1, Bf.x1+0.06, zb-0.01, za+0.01, y, y+1.05); }
  { const zEnd=Bf.z0-12*RUN;
    for(const x of [Bf.x0-0.025, Bf.x1+0.025]){ const a=V3(x, LD.y-0.15, Bf.z0), b=V3(x, HF+RH-0.15, zEnd), d=b.clone().sub(a), L=d.length();
      E.push({geo:boxGeo(0.04, 0.26, L), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromEuler(new T.Euler(Math.atan2(-d.y,d.z),0,0)), V3(1,1,1)), color:new T.Color(STEEL)}); }
    railRun(LD.x0+0.03, Bf.z0+0.03, LD.x0+0.03, zEnd, LD.y, HF+RH, 1); railRun(Bf.x1+0.03, Bf.z0+0.03, Bf.x1+0.03, zEnd, LD.y, HF+RH, 1); }
  BOILERS.stair={top:[[96.2,-259.26],[94.8,-259.26],[91.0,-259.26],[90.6,-259.4],[90.6,-261.2],[90.6,-264.7],[90.6,-265.4]], SB:SB, HF:HF};
  // under the upper flight, a cage of chain-link for the drums of treatment chemical
  { const x0=LD.x1+0.10, x1=A.x0-0.10, z=A.z0-0.04;
    for(let x=x0; x<=x1+0.01; x+=(x1-x0)/3) B(0.05, 2.3, 0.05, x, HF+1.15, z, "#7a7e82");
    B(x1-x0, 0.05, 0.05, (x0+x1)/2, HF+2.3, z, "#7a7e82");
    bx("chainlink", x1-x0, 2.2, 0.01, (x0+x1)/2, HF+1.12, z+0.03, 0.5, 0, "#c8ccd0");
    for(const [x,col] of [[92.2,"#2a5a8a"],[92.9,"#2a5a8a"],[93.6,"#c8a81c"]]){ C(0.29, 0.88, x, HF+0.44, -259.2, col, 20); C(0.295, 0.03, x, HF+0.30, -259.2, DARK, 20); }
    addCol(x0, x1, z, Z1, HF-0.5, LD.y); }

  /* ---- the three boilers -------------------------------------------------- */
  // a scotch marine boiler each: the shell on two saddles, its front with the furnace door and the burner in it,
  // the smokebox doors over that, a water column, its gauge, the steam stop on top, the safety valves, the stack
  const fireMat=new T.MeshBasicMaterial({color:0xff7a2a, toneMapped:false}); BOILERS.fireMat=fireMat;
  const fireG=[];                                              // (the sight glasses and the glow round the doors, one mesh)
  const dialTex=signTex(256,256,(c,W,H)=>{ c.fillStyle="#efe9da"; c.beginPath(); c.arc(W/2,H/2,W/2-4,0,7); c.fill();
    c.strokeStyle="#1a1a1a"; c.lineWidth=3; for(let k=0;k<=12;k++){ const a=(-225+k*22.5)*Math.PI/180; c.beginPath(); c.moveTo(W/2+Math.cos(a)*(W*0.40), H/2+Math.sin(a)*(W*0.40)); c.lineTo(W/2+Math.cos(a)*(W*0.33), H/2+Math.sin(a)*(W*0.33)); c.stroke(); }
    c.strokeStyle="#c42a1a"; c.lineWidth=8; c.beginPath(); c.arc(W/2,H/2,W*0.37,(-225+9*22.5)*Math.PI/180,(-225+12*22.5)*Math.PI/180); c.stroke();
    c.fillStyle="#1a1a1a"; fitText(c, "PSI", W*0.3, H*0.08, W/2, H*0.70, "700", "Arial"); fitText(c, "0     150     300", W*0.62, H*0.06, W/2, H*0.83, "700", "Arial"); });
  const dialMat=new T.MeshStandardMaterial({map:dialTex, emissive:0xffffff, emissiveMap:dialTex, emissiveIntensity:0.25, roughness:0.5});
  const R=1.5, L=7.5, zf=-266.5, zb=zf-L;
  [95.5, 101.5, 107.5].forEach((cx, i)=>{
    const cy=HF+2.1;
    for(const z of [zf-1.3, zb+1.3]){ B(3.2, 0.30, 0.9, cx, HF+0.15, z, "#5a5450"); B(2.6, 0.55, 0.45, cx, HF+0.575, z, "#3a3634"); }
    CZ(R, L, cx, cy, (zf+zb)/2, "#6a3e32", 44);
    for(let k=1;k<6;k++) CZ(R+0.02, 0.07, cx, cy, zb+k*1.25, "#4a2c24", 44);
    CZ(R+0.03, 0.08, cx, cy, zf+0.04, "#3a3634", 44);
    ent(new T.TorusGeometry(R-0.08, 0.022, 6, 48), cx, cy, zf+0.085, "#2a2624");
    // the furnace door and the burner in it; the fire round the door's edge and in its sight glass
    CZ(0.48, 0.10, cx, cy-0.55, zf+0.13, "#2a2624", 32);
    CZ(0.24, 0.42, cx, cy-0.55, zf+0.39, "#5a5e60", 20); CZ(0.27, 0.04, cx, cy-0.55, zf+0.62, "#3a3c3e", 20);
    B(0.36, 0.36, 0.40, cx+0.48, cy-1.02, zf+0.42, "#3a5a7a"); B(0.20, cy-1.20-HF, 0.20, cx+0.48, (HF+cy-1.20)/2, zf+0.42, DARK);
    tubeE(V3(cx+0.48, cy-0.84, zf+0.42), V3(cx+0.16, cy-0.66, zf+0.42), 0.06, "#3a5a7a");
    fireG.push({geo:new T.TorusGeometry(0.485, 0.010, 6, 40), matrix:new T.Matrix4().makeTranslation(cx, cy-0.55, zf+0.081), color:new T.Color(0xffffff)});
    fireG.push({geo:boxGeo(0.14, 0.07, 0.012), matrix:new T.Matrix4().makeTranslation(cx-0.30, cy-0.42, zf+0.186), color:new T.Color(0xffffff)});
    // the smokebox doors above, their dogs; the nameplate between
    for(const sd of [-1,1]){ B(1.06, 0.56, 0.05, cx+sd*0.57, cy+0.76, zf+0.105, "#3e3a38");
      for(const dy of [-0.16, 0.16]) B(0.12, 0.05, 0.05, cx+sd*0.96, cy+0.76+dy, zf+0.15, DARK); }
    sign(0.70, 0.20, (c,W,H)=>{ c.fillStyle="#c9a21c"; c.fillRect(0,0,W,H); c.strokeStyle="#2a2624"; c.lineWidth=4; c.strokeRect(3,3,W-6,H-6);
        say(c, "BOILER No. "+(i+1), W/2, H/2, W*0.80, H*0.60, "#2a2624", "800", "'Arial Black', Arial"); }, cx, cy+0.20, zf+0.092, 0, false, 320);
    // the water column on the right, its gauge glass, its blowdown down to the floor
    C(0.05, 1.3, cx+1.20, cy+0.25, zf+0.30, DARK, 12);
    for(const dy of [-0.35, 0.85]) tubeE(V3(cx+1.20, cy+dy, zf+0.04), V3(cx+1.20, cy+dy, zf+0.30), 0.025, DARK);
    B(0.035, 0.46, 0.035, cx+1.31, cy+0.25, zf+0.30, "#9ad0d8");
    tubeE(V3(cx+1.20, cy-0.40, zf+0.30), V3(cx+1.20, HF+0.15, zf+0.30), 0.025, DARK);
    // the gauge on its siphon, its needle on its own (it moves)
    tubeE(V3(cx+0.70, cy+1.25, zf+0.04), V3(cx+0.70, cy+1.25, zf+0.24), 0.015, "#b87333");
    CZ(0.24, 0.07, cx+0.70, cy+1.25, zf+0.275, "#2a2624", 28);
    { const m=new T.Mesh(new T.CircleGeometry(0.205, 32), dialMat); m.position.set(cx+0.70, cy+1.25, zf+0.316); scene.add(m);
      const nd=new T.Mesh(boxGeo(0.012, 0.17, 0.006), new T.MeshBasicMaterial({color:0x1a1a1a})); nd.geometry.translate(0, 0.07, 0);
      nd.position.set(cx+0.70, cy+1.25, zf+0.322); scene.add(nd); BOILERS.gauges.push({m:nd, ph:i*2.1}); }
    // on top: the steam stop with its red handwheel, the pipe up into the header; the safety valves venting up
    const zs=-269.5, top=cy+R;
    C(0.20, 0.30, cx, top+0.05, zs, "#4a2c24", 20);
    C(0.17, HF+7.6-(top+0.2), cx, (top+0.2+HF+7.6)/2, zs, "#5a5450", 20);
    B(0.46, 0.46, 0.46, cx, top+0.95, zs, "#3e3a38"); CZ(0.03, 0.62, cx, top+0.95, zs+0.54, "#9a9a94", 8);
    ent(new T.TorusGeometry(0.32, 0.025, 8, 28), cx, top+0.95, zs+0.84, "#a8221a");
    for(let k=0;k<3;k++) B(0.62, 0.025, 0.025, cx, top+0.95, zs+0.84, "#a8221a", 0, 0, k*Math.PI/3);
    for(const dx of [-0.32, 0.32]){ C(0.07, 0.40, cx+dx, top+0.15, -271.6, "#9a8a6a", 12); C(0.10, 0.16, cx+dx, top+0.40, -271.6, "#7a6a50", 12);
      tubeE(V3(cx+dx, top+0.48, -271.6), V3(cx+dx, HC+0.02, -271.6), 0.05, "#5a5450"); }
    // the stack, up out of the back of it into the breeching
    C(0.46, HF+8.7-(top-0.2), cx, (top-0.2+HF+8.7)/2, -273.2, "#3a3432", 24);
    C(0.50, 0.12, cx, top+0.30, -273.2, "#2a2624", 24);
    addCol(cx-1.6, cx+1.6, zb-0.1, zf+0.65, HF-0.5, top+0.3);
    addUse(cx, zf+1.5, HF, "BOILER No. "+(i+1), ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", cx, zf);
      toast([["HOT TO STAND NEAR. THE BURNER ROARS BEHIND ITS DOOR","THE GAUGE SAYS 120 AND HOLDS THERE","WATER IN THE GLASS AT HALF. SOMEBODY BLEW IT DOWN TODAY"],
             ["THE STOP VALVE OVER IT WEEPS STEAM. THE SAME DRIP FOR YEARS, BY THE STAIN","WARM TO THE TOUCH THROUGH THE LAGGING","A TAG ON THE DOOR: INSPECTED · STATE OF PA · 1961"],
             ["THIS ONE'S BURNER KICKS ON AND OFF. YOU FEEL IT IN YOUR CHEST","A NAMEPLATE: ERIE CITY IRON WORKS · 1959 · 150 PSI","THE FIRE THROUGH THE SIGHT GLASS IS WHITE AT ITS HEART"]][i][(Math.random()*3)|0], "#ffb08a"); }, 1.4);
    const fl=lamp({x:cx, y:cy-0.45, z:zf+1.1, color:0xff6a1a, intensity:1.1, dist:7.5, decay:1.5});
    BOILERS.fires.push({l:fl, base:1.1, ph:i*1.7});
  });
  { const m=new T.Mesh(mergeEntries(fireG), fireMat); scene.add(m); }
  // the steam header across the hall under the ceiling, on hangers, into the east wall through a big stop of its own
  CX(0.26, X1+0.15-93.6, (93.6+X1+0.15)/2, HF+7.6, -269.5, "#5a5450", 24);
  ent(new T.SphereGeometry(0.26, 16, 12), 93.6, HF+7.6, -269.5, "#5a5450");
  for(let x=94.5; x<X1; x+=3.0) tubeE(V3(x, HF+7.86, -269.5), V3(x, HC+0.02, -269.5), 0.02, DARK, 6);
  B(0.62, 0.62, 0.62, 110.6, HF+7.6, -269.5, "#3e3a38"); C(0.035, 0.7, 110.6, HF+8.25, -269.5, "#9a9a94", 8);
  ent(new T.TorusGeometry(0.42, 0.03, 8, 28), 110.6, HF+8.60, -269.5, "#a8221a", Math.PI/2, 0, 0);
  for(let k=0;k<3;k++) B(0.82, 0.03, 0.03, 110.6, HF+8.60, -269.5, "#a8221a", k*Math.PI/3);
  // the breeching the stacks go up into: a duct the width of the hall into the east wall
  B(X1+0.15-94.2, 1.4, 1.2, (94.2+X1+0.15)/2, HF+9.3, -273.2, "#2e2a28");
  for(let x=95.0; x<X1; x+=1.5) B(0.04, 1.44, 1.24, x, HF+9.3, -273.2, "#3a3432");
  // the feed line: from the pumps, along in front of the boilers' tops, a drop into each
  CX(0.08, 110.4-94.0, (94.0+110.4)/2, HF+3.95, -266.1, "#3a5a7a", 12);
  for(const cx of [95.5, 101.5, 107.5]) tubeE(V3(cx-0.9, HF+3.95, -266.1), V3(cx-0.9, HF+3.0, -266.6), 0.06, "#3a5a7a");
  tubeE(V3(110.4, HF+3.95, -266.1), V3(110.4, HF+0.75, -266.1), 0.08, "#3a5a7a");

  /* ---- the deaerator and the feed pumps against the east wall ------------------- */
  { const tx=110.7, tz=-277.6, py=HF+4.2;
    B(2.46, 0.10, 5.4, tx+0.03, py-0.05, tz-0.05, STEEL);
    for(const [dx,dz] of [[-1.15,-2.6],[1.15,-2.6],[-1.15,2.5],[1.15,2.5]]){ B(0.16, py-0.10-HF, 0.16, tx+0.05+dx, (HF+py-0.10)/2, tz-0.05+dz, STEEL);
      addCol(tx+0.05+dx-0.08, tx+0.05+dx+0.08, tz-0.05+dz-0.08, tz-0.05+dz+0.08, HF-0.5, py); }
    for(const dz of [-1.3, 1.3]) B(1.4, 0.40, 0.30, tx, py+0.20, tz+dz, "#3a3634");
    CZ(0.90, 4.0, tx, py+1.15, tz, "#7a7470", 32); for(const dz of [-2.0, 2.0]) ent(new T.SphereGeometry(0.90, 24, 12).scale(1,1,0.35), tx, py+1.15, tz+dz, "#7a7470");
    C(0.35, 1.1, tx, py+2.45, tz+0.8, "#7a7470", 20); tubeE(V3(tx, py+3.0, tz+0.8), V3(tx, HC+0.02, tz+0.8), 0.06, "#5a5450");
    // a ladder up its side
    for(const dz of [-0.24, 0.24]) B(0.05, py+1.0-HF, 0.05, tx-1.35, (HF+py+1.0)/2, -275.4+dz, "#7a7e82");
    for(let y=HF+0.3; y<py+0.9; y+=0.3) B(0.03, 0.03, 0.48, tx-1.35, y, -275.4, "#7a7e82");
    // the two pumps on their pads, each a motor coupled to a volute
    for(const pz of [-271.0, -268.4]){ B(1.7, 0.18, 0.80, 110.5, HF+0.09, pz, "#5a5450");
      CX(0.24, 0.70, 110.9, HF+0.50, pz, "#3a6a4a", 20); CX(0.26, 0.06, 111.27, HF+0.50, pz, "#2a4a34", 20);
      CX(0.10, 0.20, 110.45, HF+0.50, pz, DARK, 12); CX(0.28, 0.22, 110.05, HF+0.48, pz, "#3a5a7a", 20);
      tubeE(V3(110.05, HF+0.48, pz+0.15), V3(110.05, HF+0.48, -266.1), 0.07, "#3a5a7a");
      addCol(109.6, 111.4, pz-0.42, pz+0.42, HF-0.5, HF+0.8); }
    tubeE(V3(110.05, HF+0.48, -266.1), V3(110.4, HF+0.75, -266.1), 0.07, "#3a5a7a");
    addCol(109.95, 110.5, -270.9, -265.98, HF-0.5, HF+0.85); addCol(109.3, 109.4, -275.7, -275.1, HF-0.5, py+1.0);
    tubeE(V3(110.3, py+0.30, -276.2), V3(110.3, HF+0.90, -276.2), 0.08, "#3a5a7a"); tubeE(V3(110.3, HF+0.90, -276.2), V3(110.3, HF+0.90, -268.4), 0.08, "#3a5a7a");
    addCol(110.2, 110.4, -276.3, -268.3, HF-0.5, HF+1.0); }

  /* ---- the control panel on the west wall, the desk, the beacon -------------- */
  { const px=X0+0.32, z0=-276.0, z1=-270.0;
    B(0.62, 2.2, z1-z0, px, HF+1.1, (z0+z1)/2, "#5a6064");
    B(0.64, 0.06, z1-z0+0.04, px, HF+2.23, (z0+z1)/2, "#3a3e42");
    addCol(X0, px+0.31, z0-0.02, z1+0.02, HF-0.5, HF+2.3);
    bucketOf("bp_dials", ()=>emitMat(0xffe8c8, 0.55, "always"));
    for(let k=0;k<6;k++){ const z=z0+0.55+k*0.98;
      push("bp_dials", new T.CylinderGeometry(0.13, 0.13, 0.02, 20), px+0.335, HF+1.75, z, 0, "#ffffff", 0, Math.PI/2);
      CX(0.15, 0.02, px+0.32, HF+1.75, z, DARK, 20);
      for(let j=0;j<4;j++) push(["redled","ledgreen","ledamber","ledgreen"][(j+k)%4], boxGeo(0.02, 0.04, 0.04, 0), px+0.32, HF+1.40, z-0.27+j*0.18, 0, "#ffffff");
      B(0.03, 0.10, 0.06, px+0.325, HF+1.15, z, "#1a1a1a"); }
    // the chart recorder, its paper; the big red stop
    B(0.04, 0.40, 0.50, px+0.33, HF+1.15, -271.4, "#e8e4d8"); B(0.05, 0.44, 0.54, px+0.315, HF+1.15, -271.4, DARK);
    C(0.06, 0.05, px+0.335, HF+1.10, -275.4, "#c42a1a", 16, 0, 0, Math.PI/2); B(0.02, 0.18, 0.18, px+0.315, HF+1.10, -275.4, "#d8b81c");
    // the desk, the logbook open on it, a thermos and a lunch pail, the phone; a stool
    const dx=X0+1.35, dz=-273.0;
    B(0.80, 0.04, 1.40, dx, HF+0.76, dz, "#5a5248"); for(const sx of [-0.36,0.36]) for(const sz of [-0.66,0.66]) B(0.04, 0.74, 0.04, dx+sx, HF+0.37, dz+sz, DARK);
    B(0.32, 0.02, 0.44, dx, HF+0.79, dz-0.15, "#ece4cc"); B(0.004, 0.03, 0.44, dx, HF+0.79, dz-0.15, "#8a6a44");
    C(0.045, 0.30, dx+0.20, HF+0.93, dz+0.35, "#2a5a3a", 14); B(0.24, 0.16, 0.18, dx-0.15, HF+0.86, dz+0.45, "#3a3c40");
    B(0.18, 0.08, 0.22, dx+0.22, HF+0.82, dz-0.50, "#1a1a1a");
    C(0.17, 0.04, dx+0.85, HF+0.62, dz, "#3a3c40", 16); C(0.03, 0.60, dx+0.85, HF+0.30, dz, DARK, 8);
    addCol(dx-0.42, dx+0.42, dz-0.72, dz+0.72, HF-0.5, HF+0.8);
    addUse(dx+0.95, dz, HF, "THE LOGBOOK", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("tick", dx, dz);
      const d=new Date(), ds=(d.getMonth()+1)+"/"+d.getDate();
      toast(["THE LAST ENTRY IS TODAY'S, IN PENCIL: "+ds+" · ALL THREE ON LINE · 120 PSI · D.","PAGE AFTER PAGE IN ONE HAND. THE FIRST IS DATED OCTOBER 1962","THE THERMOS BESIDE IT IS STILL WARM"][(Math.random()*3)|0], "#ffb08a"); }, 1.1);
    // the beacon on top of the panel: a red dome, a mirror going round in it
    C(0.10, 0.08, px, HF+2.30, -273.0, DARK, 16); C(0.02, 0.06, px, HF+2.37, -273.0, DARK, 8);
    const mir=new T.Group(); mir.position.set(px, HF+2.43, -273.0); scene.add(mir);
    for(const sd of [-1,1]){ const m=new T.Mesh(boxGeo(0.12, 0.10, 0.012), new T.MeshBasicMaterial({color:0xff3020, toneMapped:false})); m.position.z=sd*0.05; mir.add(m); }
    BOILERS.beacon={m:mir, l:lamp({x:px+0.4, y:HF+2.6, z:-273.0, color:0xff2010, intensity:1.0, dist:9, decay:1.4})}; }

  /* ---- the light: red cages on the walls ------------------------------------ */
  const cage=(x,y,z,ry)=>{ const f=XF(x,z,ry), P=(lx,ly,lz)=>V3(f.x(lx,lz), y+ly, f.z(lx,lz));
    B(0.12, 0.20, 0.12, f.x(0,0.06), y+0.05, f.z(0,0.06), DARK, ry);
    push("exitsign", new T.SphereGeometry(0.10, 14, 10), f.x(0,0.24), y, f.z(0,0.24), 0, "#ffffff");
    for(const a of [0, Math.PI/2, Math.PI, Math.PI*1.5]) tubeE(P(Math.cos(a)*0.13, -0.12, 0.24+Math.sin(a)*0.13), P(Math.cos(a)*0.13, 0.14, 0.24+Math.sin(a)*0.13), 0.008, DARK, 5);
    for(const h of [-0.12, 0.14]) ent(new T.TorusGeometry(0.13, 0.008, 5, 16), f.x(0,0.24), y+h, f.z(0,0.24), DARK, Math.PI/2, 0, 0);
    lamp({x:f.x(0,0.5), y:y, z:f.z(0,0.5), color:0xff2a14, intensity:1.5, dist:15, decay:1.2}); };
  for(const x of [96.4, 102.6]) cage(x, SB+2.7, Z1, Math.PI);                 // over the catwalk
  for(const x of [89.5, 107.5]) cage(x, HF+3.2, Z1, Math.PI);                 // the south wall low, either end
  for(const x of [90.0, 99.0, 108.0]) cage(x, HF+6.0, Z0, 0);                 // the north wall
  for(const z of [-264.0, -278.0]) cage(X0, HF+6.0, z, Math.PI/2);            // the west wall
  for(const z of [-262.5, -272.5]) cage(X1, HF+6.0, z, -Math.PI/2);           // and the east

  /* ---- the floor: walkways painted, water standing, the signs ------------------- */
  for(const z of [-263.2, -265.95]) bx("paint", 22.0, 0.004, 0.08, 100.0, HF+0.006, z, 0, 0, "#c9a21c");
  for(const x of [92.0, 98.5, 104.5, 110.0]) bx("paint", 0.08, 0.004, 2.67, x, HF+0.006, -264.575, 0, 0, "#c9a21c");
  for(const [x,z,sx,sz,ry] of [[98.6,-265.2,0.9,0.5,0.3],[104.8,-264.8,0.6,0.4,1.0],[109.2,-270.0,0.7,0.45,0.4],[88.2,-268.5,0.5,0.35,0.2]]){
    const g=new T.CircleGeometry(1, 24); g.scale(sx, sz, 1); push("puddle", g, x, HF+0.010, z, ry, "#ffffff", -Math.PI/2, 0); }
  sign(2.4, 0.42, (c,W,H)=>{ c.fillStyle="#d8d2c0"; c.fillRect(0,0,W,H); c.fillStyle="#b8201a"; c.fillRect(0,0,W,H*0.36);
      say(c, "DANGER", W/2, H*0.18, W*0.80, H*0.26, "#f4efe2", "900", "'Arial Black', Arial");
      say(c, "HIGH PRESSURE STEAM · EAR PROTECTION REQUIRED", W/2, H*0.66, W*0.80, H*0.22, "#1a1a1a", "800", "Arial"); }, 92.6, SB+3.2, Z1-0.012, Math.PI, false, 900);
  sign(6.0, 0.9, (c,W,H)=>{ c.fillStyle="#5e5650"; c.fillRect(0,0,W,H); say(c, "LEVEL 3 · BOILER PLANT", W/2, H/2, W*0.84, H*0.62, "#d8d2c0", "900", "'Arial Black', Arial"); },
    99.0, HF+7.1, Z0+0.012, 0, false, 1200);
  sign(1.1, 0.34, (c,W,H)=>{ c.fillStyle="#2a5a3a"; c.fillRect(0,0,W,H); say(c, "EMERGENCY SHUTOFF", W/2, H*0.36, W*0.80, H*0.26, "#f4efe2", "800", "Arial");
      say(c, "PULL · DO NOT RESET", W/2, H*0.72, W*0.80, H*0.20, "#f4efe2", "700", "Arial"); }, X0+0.012, HF+2.7, -275.4, Math.PI/2, false, 360);

  /* ---- the wheel door: its leaf, the two wheels, hung on the doorway 12d cut ---- */
  { const r=WD.r, cz=WD.c, hx=WD.b-WD.jw-0.03, LW=0.98, LH=2.04, LT=0.10;
    const G=new T.Group(); G.position.set(hx, SB+0.02, cz); G.rotation.y=Math.PI; scene.add(G);
    const LE=[], le=(geo,x,y,z,c,rx,ry,rz)=>LE.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
    le(boxGeo(LW, LH, LT), LW/2, LH/2, 0, "#4e5254");
    for(const sd of [-1,1]){ const zz=sd*(LT/2+0.008);
      le(boxGeo(LW, 0.07, 0.016), LW/2, 0.035, zz, "#5e6264"); le(boxGeo(LW, 0.07, 0.016), LW/2, LH-0.035, zz, "#5e6264");
      le(boxGeo(0.07, LH-0.14, 0.016), 0.035, LH/2, zz, "#5e6264"); le(boxGeo(0.07, LH-0.14, 0.016), LW-0.035, LH/2, zz, "#5e6264");
      le(boxGeo(LW-0.14, 0.10, 0.008), LW/2, 1.62, sd*(LT/2+0.004), "#8a2a22"); }
    for(const y of [0.30, 1.02, 1.74]) le(new T.CylinderGeometry(0.05, 0.05, 0.26, 14), -0.015, y, 0.0, "#3a3c3e");
    for(const y of [0.25, 0.75, 1.30, 1.80]) le(boxGeo(0.14, 0.05, 0.05), LW-0.10, y, -(LT/2+0.035), DARK);
    const leaf=new T.Mesh(mergeEntries(LE), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:0.4}));
    leaf.castShadow=true; leaf.receiveShadow=true; G.add(leaf);
    const wheelGeo=(()=>{ const W=[], w=(geo,x,y,z,c,rz)=>W.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z), new T.Quaternion().setFromEuler(new T.Euler(0,0,rz||0)), V3(1,1,1)), color:new T.Color(c)});
      w(new T.TorusGeometry(0.26, 0.024, 10, 36), 0, 0, 0, "#a8221a");
      for(let k=0;k<3;k++) w(boxGeo(0.50, 0.032, 0.032), 0, 0, 0, "#a8221a", k*Math.PI/3);
      w(new T.CylinderGeometry(0.055, 0.055, 0.08, 16).rotateX(Math.PI/2), 0, 0, 0, "#6a2a22");
      w(new T.CylinderGeometry(0.026, 0.026, 0.10, 10).rotateX(Math.PI/2), 0, 0, 0.06, "#8a8d90");
      return mergeEntries(W); })();
    const wm=new T.MeshStandardMaterial({vertexColors:true, roughness:0.45, metalness:0.35}), wheels=[];
    for(const sd of [-1,1]){ const m=new T.Mesh(wheelGeo, wm); m.position.set(LW/2, 1.15, sd*(LT/2+0.11)); if(sd>0) m.rotation.y=Math.PI; G.add(m); wheels.push(m); }
    const gc={x0:r.x0, x1:r.x1, z0:cz-0.12, z1:cz+0.12, y0:SB-0.5, y1:SB+2.3}; COL_DYN.push(gc);
    const W={wheels:wheels, ang:0, busy:false, t:0, T:2.6, dir:1, from:0};
    const D={g:G, open:0, target:0, x:hx-LW/2, z:cz, y:SB, base:Math.PI, manual:0, ajar:0, swing:-1.45, label:"THE WHEEL", reach:2.5,
             manualOnly:true, sticky:true, rate:0.55, blockCol:gc, blockTop:SB+2.3};
    D.promptFn=d=>W.busy ? "THE WHEEL IS TURNING" : d.target>0.5 ? "E  ·  SHUT THE DOOR" : "E  ·  TURN THE WHEEL";
    D.onUse=d=>{
      if(W.busy) return;
      if(d.target<0.5){ W.busy=true; W.t=0; W.dir=1; W.from=W.ang; W.then="open";
        if(typeof AUDIO!=="undefined") AUDIO.blip("wheel", d.x, d.z);
        if(!BOILERS.told){ BOILERS.told=true; toast("IT TURNS. STIFF, THEN FREE. SOMETHING ON THE OTHER SIDE IS RUNNING", "#ffb08a"); } }
      else { d.manual=-1; W.then="dog"; W.wait=1.6; } };
    DOORS.push(D); BOILERS.wheel=W; BOILERS.door=D;
    // and what of the hall's red comes out through the door into the vestibule as it opens
    BOILERS.spill=lamp({x:(r.x0+r.x1)/2, y:SB+1.6, z:Z1-0.6, color:0xff3418, intensity:0, dist:7, decay:1.4});
    BOILERS.spill.vol=[97.6, 99.6, Z1-1.0, -254.6, SB-0.5, SB+SH+0.2]; }

  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.25}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();
// every frame: the wheel and what follows it, the fires, the gauges, the beacon, the steam, and how loud it is
function updateBoilers(dt){
  const W=BOILERS.wheel, D=BOILERS.door; if(!W) return;
  BOILERS.t+=dt; const t=BOILERS.t, H=BOILERS.hall;
  // the wheel: three turns, eased, then the dogs are out and the door swings; or, shut, three turns back
  if(W.busy){ W.t+=dt; const u=Math.min(1, W.t/W.T), e=u<0.5 ? 2*u*u : 1-Math.pow(-2*u+2,2)/2;
    W.ang=W.from+W.dir*Math.PI*6*e;
    if(u>=1){ W.busy=false;
      if(W.dir>0){ D.manual=1; if(typeof AUDIO!=="undefined"){ AUDIO.blip("clunk", D.x, D.z); AUDIO.blip("vault", D.x, D.z); } }
      else if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", D.x, D.z); } }
  else if(W.then==="dog"){ W.wait-=dt; if(W.wait<=0 && D.open<0.03){ W.then=null; W.busy=true; W.t=0; W.dir=-1; W.from=W.ang;
      if(typeof AUDIO!=="undefined"){ AUDIO.blip("slam", D.x, D.z); AUDIO.blip("wheel", D.x, D.z); } } }
  // (the gate route of tools/walk.js swings it open without the wheel: let the wheel catch up)
  if(!W.busy && D.open>0.5 && W.dir<0){ W.dir=1; W.ang=Math.PI*6; }
  for(const m of W.wheels) m.rotation.z=(m.rotation.y ? -1 : 1)*W.ang;
  const c=camera.position, inHall=c.x>H.x0 && c.x<H.x1 && c.z>H.z0 && c.z<H.z1+0.02 && c.y>H.y0-0.5 && c.y<H.y1;
  BOILERS.inHall=inHall;
  const dd=Math.hypot(c.x-D.x, c.z-D.z), atDoor=c.y<H.y1 && c.y>H.y0-0.5 && dd<14;
  // how much of the roar reaches you: all of it in the hall, the door's worth of it near the door
  const want=inHall ? 1 : atDoor ? (0.10+0.55*D.open)/(1+dd*dd/18) : 0;
  BOILERS.roar+=(want-BOILERS.roar)*Math.min(1, dt*2.5);
  if(BOILERS.spill) BOILERS.spill.intensity=1.3*D.open;
  if(!inHall && !atDoor) return;
  // the fires: each burner's own flicker in its lamp, and the sight glasses' together
  for(const f of BOILERS.fires){ const n=Math.sin(t*13.1+f.ph)*0.5+Math.sin(t*7.3+f.ph*2.0)*0.35+Math.sin(t*23.7+f.ph*0.7)*0.15;
    f.l.intensity=f.base*(0.82+0.18*n); }
  { const n=0.85+0.15*Math.sin(t*17.0)*Math.sin(t*5.3); BOILERS.fireMat.color.setRGB(1.0*n, 0.48*n+0.05*Math.sin(t*31), 0.16*n); }
  for(const g of BOILERS.gauges) g.m.rotation.z=-(0.42+0.05*Math.sin(t*0.7+g.ph)+0.012*Math.sin(t*9.0+g.ph));
  // the beacon: its mirror going round, the light sweeping
  if(BOILERS.beacon){ const a=t*4.2; BOILERS.beacon.m.rotation.y=a; BOILERS.beacon.l.intensity=0.35+0.95*Math.pow(Math.max(0, Math.cos(a)), 3); }
  // the weeping stop valve on No. 2, and now and then a safety valve lifting with a roar of steam
  if(inHall && typeof PUFFS!=="undefined"){
    BOILERS.steamT-=dt;
    while(BOILERS.steamT<=0){ BOILERS.steamT+=0.16+Math.random()*0.10;
      PUFFS.emit(101.5+0.24, H.y0+2.1+1.5+0.95, -269.5+(Math.random()-0.5)*0.1, 0.25+Math.random()*0.15, 0.30, (Math.random()-0.5)*0.12, 0.10, 0.85, 2.4, 0.20, 0.85, 0.55); }
    BOILERS.hissT-=dt;
    if(BOILERS.hissT<=0){ BOILERS.hissT=24+Math.random()*30; const x=[95.5,101.5,107.5][(Math.random()*3)|0]+(Math.random()<0.5?-0.32:0.32);
      if(typeof AUDIO!=="undefined") AUDIO.blip("hiss", x, -271.6);
      for(let k=0;k<26;k++) PUFFS.emit(x+(Math.random()-0.5)*0.2, H.y0+3.6+0.5, -271.6+(Math.random()-0.5)*0.2, (Math.random()-0.5)*0.6, 1.2+Math.random()*1.0, (Math.random()-0.5)*0.6, 0.25, 2.2, 2.4+Math.random(), 0.30, 0.9, 0.6); } }
}
