"use strict";
/* REST AREA · 14s3-tuning.js
   the tuning house by the tower, its cellar, and the shelter under that
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14s3 · THE TUNING HOUSE
   Every AM tower has a little house at its foot: the feed line from the
   station comes in one side, and the antenna tuning unit (a big copper
   coil, vacuum capacitors, the meters) matches it to the mast, which goes
   out the other side on a copper strap. French Creek's is red brick with
   a flat roof, west of the tower's fence, its door toward the station.

   Under it the cellar, in block: the station's first transmitter retired
   down there in 1949, a workbench, shelves of spare tubes. And under the
   cellar, down a second stair and behind a steel door, the shelter the
   station dug in 1953, when every broadcaster on the CONELRAD plan was
   to keep a studio going through an attack: the emergency desk and its
   microphone, the receiver rack, a typewriter, the clock; water drums,
   crackers and a hand-crank generator; through a partition, the bunks.

   PLAN (world): the hut x 85.8..94.2, z -1520.2..-1513.8, on RADIO.hut's
   level pad (04) at RADIO.ty, on TUNE_RING's 2 m patch, holed over the
   cellar (TUNE_HOLES). The cellar under the hut at TUNE.BF; the shelter
   x 80..87.88, z -1520..-1509 at TUNE.SF, under the whole ground, west of
   the hut and partly under it. The upper stair runs east down the north
   wall, the lower one west down the south wall to the steel door.
   ---------------------------------------------------------------------- */
const TUNE={};
(function tuningHouse(){
  if(typeof RADIO==="undefined" || typeof RADIO_ST==="undefined") return;
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const tube=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length(); if(L<1e-4) return;
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||6,1,true), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  // a box that is solid too
  const S=(x0, x1, y0, y1, z0, z1, c)=>{ B(x1-x0, y1-y0, z1-z0, (x0+x1)/2, (y0+y1)/2, (z0+z1)/2, c); addCol(x0, x1, z0, z1, y0, y1); };
  const lamp=(x, y, z, k, col, dist, under)=>{ const o={x:x, y:y, z:z, color:col||0xffe2b0, intensity:k, dist:dist||6, decay:1.5, indoor:true}; if(under) o.under=true; LAMPS.push(o); return o; };
  const bulb=(x, y, z)=>{ C(0.006, 0.3, x, y+0.15, z, "#2a2a2c", 6); C(0.045, 0.05, x, y-0.02, z, "#3a3a3c", 10);
    push("rn_glow", new T.SphereGeometry(0.045, 10, 8), x, y-0.08, z, 0, "#ffffff");
    for(let k=0;k<4;k++){ const a=k*Math.PI/2; tube(V3(x+Math.cos(a)*0.06, y-0.03, z+Math.sin(a)*0.06), V3(x+Math.cos(a)*0.02, y-0.15, z+Math.sin(a)*0.02), 0.004, "#3a3a3c", 4); } };

  const T0=RADIO.tower, TY=Terrain.groundAt(T0.x, T0.z), FL=TY+0.2, CEIL=TY+3.2, BCL=FL-0.25, BF=FL-3.0, SF=BF-3.0, SCL=SF+2.6;
  const X0=85.8, X1=94.2, Z0=-1520.2, Z1=-1513.8, TW=0.25, IX0=X0+TW, IX1=X1-TW, IZ0=Z0+TW, IZ1=Z1-TW;
  const BRICK="#d8c8bc", BLOCK="#9e9a90", PAINT="#d6c9ae", STEEL="#6a6e70", COPPER="#b8703a";
  Object.assign(TUNE, {FL:FL, BF:BF, SF:SF, TY:TY});

  /* ---- the shell: brick walls from the cellar's ceiling up past the roof to a parapet, block below them down to the cellar's floor.
     The walls along x run the whole length; those along z stand exactly between them (their outer faces never meet the x walls' ends). Each piece round an opening is its own box. */
  const brick=(w, h, d, x, y, z)=>push("brick", boxGeo(w, h, d, 0.83), x, y, z, 0, BRICK);
  const wall=(ax, c0, c1, a, b, y0, y1, ops, put, col)=>{
    const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return;
      if(ax==="x"){ put(q-p, h1-h0, c1-c0, (p+q)/2, (h0+h1)/2, (c0+c1)/2); addCol(p, q, c0, c1, h0<=FL+0.05 && h0>=FL-0.3 ? h0-0.5 : h0, h1); }
      else { put(c1-c0, h1-h0, q-p, (c0+c1)/2, (h0+h1)/2, (p+q)/2); addCol(c0, c1, p, q, h0<=FL+0.05 && h0>=FL-0.3 ? h0-0.5 : h0, h1); } };
    let u=a; for(const o of ops.slice().sort((m, n)=>m.a-n.a)){ piece(u, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); u=o.b; } piece(u, b, y0, y1); };
  const blk=(w, h, d, x, y, z)=>B(w, h, d, x, y, z, BLOCK);
  const DOOR={a:86.88, b:87.88, sill:FL-0.02, head:FL+2.1}, WIN={a:-1517.4, b:-1516.4, sill:FL+1.0, head:FL+2.0};
  wall("x", Z0, Z0+TW, X0, X1, BCL, CEIL+0.55, [], brick); wall("x", Z1-TW, Z1, X0, X1, BCL, CEIL+0.55, [DOOR], brick);
  wall("z", X0, X0+TW, Z0+TW, Z1-TW, BCL, CEIL+0.55, [WIN], brick); wall("z", X1-TW, X1, Z0+TW, Z1-TW, BCL, CEIL+0.55, [], brick);
  wall("x", Z0, Z0+TW, X0, X1, BF-0.25, BCL, [], blk); wall("x", Z1-TW, Z1, X0, X1, BF-0.25, BCL, [], blk);
  wall("z", X0, X0+TW, Z0+TW, Z1-TW, BF-0.25, BCL, [], blk); wall("z", X1-TW, X1, Z0+TW, Z1-TW, BF-0.25, BCL, [], blk);
  // the roof: a deck between the walls, its underside the ceiling, the membrane on it; a coping on the parapet (those along z 1 cm in from those along x)
  B(IX1-IX0+0.04, 0.2, IZ1-IZ0+0.04, (IX0+IX1)/2, CEIL+0.1, (IZ0+IZ1)/2, PAINT); B(IX1-IX0, 0.02, IZ1-IZ0, (IX0+IX1)/2, CEIL+0.21, (IZ0+IZ1)/2, "#4a4a4c");
  for(const zc of [Z0+TW/2, Z1-TW/2]) B(X1-X0+0.08, 0.06, TW+0.08, (X0+X1)/2, CEIL+0.58, zc, "#b8b4aa");
  for(const xc of [X0+TW/2, X1-TW/2]) B(TW+0.06, 0.06, Z1-Z0-2*TW-0.08, xc, CEIL+0.58, (Z0+Z1)/2, "#b8b4aa");
  // the stoop and its step, the door (steel, painted green), a lamp over it; a cast name plate by it
  B(1.6, 0.36, 1.0, 87.38, TY-0.02, Z1+0.5, "#a8a49a"); addFlat(86.58, 88.18, Z1, Z1+1.0, TY+0.16); addFlat(DOOR.a, DOOR.b, Z1-TW-0.02, Z1+0.02, FL);
  makeDoor(XF(86.9, Z1-TW/2, 0), 0, FL+0.01, 0, "THE TUNING HOUSE", true, 0, "steel", 0x5a6a5a);
  C(0.08, 0.12, 87.38, FL+2.35, Z1+0.08, "#3a3a3c", 10); push("rn_glow", new T.SphereGeometry(0.05, 10, 8), 87.38, FL+2.27, Z1+0.1, 0, "#ffffff");
  TUNE.porch=lamp(87.38, FL+2.2, Z1+0.4, 0, 0xffd8a0, 6); delete TUNE.porch.indoor;
  B(0.5, 0.3, 0.03, 88.6, FL+1.5, Z1+0.015, "#3a2a1a");
  sign(0.46, 0.26, (c, W, H)=>{ c.fillStyle="#2a1e14"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a050"; c.lineWidth=5; c.strokeRect(5, 5, W-10, H-10);
      say(c, "1340 KC", W/2, H*0.36, W*0.76, H*0.28, "#e8c870", "800", "Georgia, serif"); say(c, "ANTENNA TUNING HOUSE", W/2, H*0.68, W*0.80, H*0.16, "#e8c870", "700", "Georgia, serif"); },
    88.6, FL+1.5, Z1+0.04, 0, false, 300);
  // the window in the west wall: a steel sash, two panes
  push("glass", boxGeo(0.02, 0.96, 0.46), X0+TW/2, (WIN.sill+WIN.head)/2, WIN.a+0.25, 0, "#ffffff"); push("glass", boxGeo(0.02, 0.96, 0.46), X0+TW/2, (WIN.sill+WIN.head)/2, WIN.b-0.25, 0, "#ffffff");
  B(0.06, 1.0, 0.04, X0+TW/2, (WIN.sill+WIN.head)/2, (WIN.a+WIN.b)/2, STEEL); B(0.32, 0.05, 1.06, X0+TW/2-0.03, WIN.sill-0.025, (WIN.a+WIN.b)/2, "#a8a49a");

  /* ---- the ground floor: a floor slab round the stair's well, the stair down the north wall, the tuning unit, the meters, the desk ---- */
  const UA=87.0, UB=90.9, U0=IZ0, U1=IZ0+1.0, URUN=(UB-UA)/15, RS=0.2;
  const LA=92.6, LB=89.0, L0=-1515.25, L1=IZ1, LRUN=(LA-LB)/15;
  for(const [a, b, c, d] of [[IX0, IX1, U1, IZ1],[IX0, UA, U0, U1],[UB, IX1, U0, U1]]){ B(b-a, 0.25, d-c, (a+b)/2, FL-0.125, (c+d)/2, "#a8a49a"); addFlat(a, b, c, d, FL);
    B(b-a, 0.01, d-c, (a+b)/2, FL+0.005, (c+d)/2, "#7a6a58"); }
  // the upper stair: fifteen steps solid to the cellar's floor, oak treads; the guard on the well's open sides
  for(let k=0;k<15;k++){ const y=FL-(k+1)*RS, xa=UA+k*URUN, xb=xa+URUN;
    B(URUN, y-0.03-(BF-0.02), U1-U0-0.004, (xa+xb)/2, (y-0.03+BF-0.02)/2, (U0+U1)/2, "#8a867c");
    RB(URUN+0.03, 0.03, U1-U0, (xa+xb)/2-0.015, y-0.015, (U0+U1)/2, k%2 ? "#7a5a36" : "#74552f", 0, 0.01);
    if(y-0.3>BF+0.15) addCol(xa, xb, U0, U1, BF-0.5, y-0.3); }
  addRamp(UA-0.02, UB+0.02, U0, U1, "x", UA, UB, FL, BF);                                         // (2 cm onto the floors at each end, so no seam drops you)
  { const rail=(x0, z0, x1, z1)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(2, Math.round(L/0.12));
      for(let k=0;k<=n;k++){ const x=x0+(x1-x0)*k/n, z=z0+(z1-z0)*k/n; B(0.024, 0.9, 0.024, x, FL+0.45, z, STEEL); }
      tube(V3(x0, FL+0.92, z0), V3(x1, FL+0.92, z1), 0.022, "#3a3a3c", 8); };
    rail(UA+0.05, U1+0.03, UB, U1+0.03); rail(UB+0.03, U1+0.03, UB+0.03, U0+0.02);
    addCol(UA, UB+0.06, U1, U1+0.06, FL-0.1, FL+1.0); addCol(UB, UB+0.06, U0, U1+0.06, FL-0.1, FL+1.0);
    tube(V3(UA+0.2, FL+0.9, U0+0.05), V3(UB, BF+0.9, U0+0.05), 0.02, "#3a3a3c", 8); }               // (a pipe rail on the north wall, the whole way down)
  // the tuning unit, in a cage of wire on a steel frame against the east wall: the coil on its standoffs, the vacuum capacitors, the straps
  { const cx0=92.3, cz0=-1518.6, cz1=-1515.6, H=2.1;
    for(const [x, z] of [[cx0, cz0],[cx0, cz1],[IX1-0.03, cz0],[IX1-0.03, cz1]]) B(0.04, H, 0.04, x, FL+H/2, z, STEEL);
    for(const y of [FL+0.04, FL+H]) { B(0.04, 0.04, cz1-cz0, cx0, y, (cz0+cz1)/2, STEEL); B(IX1-0.03-cx0, 0.04, 0.04, (cx0+IX1-0.03)/2, y, cz0, STEEL); B(IX1-0.03-cx0, 0.04, 0.04, (cx0+IX1-0.03)/2, y, cz1, STEEL); }
    push("chainlink", planeGeo(cz1-cz0-0.04, H-0.08, 3.2), cx0, FL+H/2, (cz0+cz1)/2, Math.PI/2, "#ffffff");
    for(const z of [cz0, cz1]) push("chainlink", planeGeo(IX1-0.03-cx0-0.04, H-0.08, 3.2), (cx0+IX1-0.03)/2, FL+H/2, z, 0, "#ffffff");
    addCol(cx0-0.04, IX1, cz0-0.04, cz1+0.04, FL-0.5, FL+H+0.05);
    B(0.9, 0.04, 2.6, 93.35, FL+0.62, -1517.1, "#5a3a22");                                                   // (the shelf it all stands on)
    // the coil: nine turns of copper tube on two ceramic standoffs
    const coil=new (class extends T.Curve{ getPoint(t, o){ const a=t*9*Math.PI*2; return (o||new T.Vector3()).set(Math.cos(a)*0.22, Math.sin(a)*0.22, (t-0.5)*0.95); } })();
    ent(new T.TubeGeometry(coil, 360, 0.009, 6, false), 93.25, FL+1.05, -1517.1, COPPER);
    for(const z of [-1517.62, -1516.58]){ C(0.03, 0.2, 93.25, FL+0.74, z, "#ece6d8", 10); C(0.012, 0.5, 93.25, FL+1.05, z, "#d8d2c4", 8, Math.PI/2); }
    // two vacuum capacitors: glass, their copper ends
    for(const z of [-1518.2, -1516.0]){ C(0.07, 0.32, 93.45, FL+0.84, z, "#c8dce4", 14); C(0.075, 0.04, 93.45, FL+0.66, z, COPPER, 14); C(0.075, 0.04, 93.45, FL+1.02, z, COPPER, 14); }
    // the straps: the coil to the capacitors, up and out through the east wall to the tower; the ground strap along the floor
    B(0.02, 0.5, 0.05, 93.25, FL+1.55, -1517.1, COPPER); B(0.6, 0.02, 0.05, 93.55, FL+1.8, -1517.1, COPPER);
    B(0.05, 0.003, 3.6, 93.75, FL+0.012, -1516.9, COPPER); B(0.02, 0.3, 0.05, 93.92, FL+0.15, -1518.6, COPPER); }
  // the coax and the strap through the east wall: the feed line in from the last pole, the strap out to the mast
  { const pg=Terrain.groundAt(85.0, -1511.6), top=V3(85.0, pg+3.3, -1511.6);                        // (the feed line's last pole, 14s2, by the hut's south-west corner)
    tube(top, V3(86.3, FL+2.65, Z1+0.04), 0.018, "#2a2a2c", 6); C(0.05, 0.12, 86.3, FL+2.65, Z1+0.06, "#ece6d8", 10, Math.PI/2);
    tube(V3(86.3, FL+2.65, Z1+0.02), V3(86.3, FL+2.65, IZ1-0.12), 0.04, "#2a2a2c", 8);                   // (in through the south wall, and along under the ceiling to the cage)
    tube(V3(86.3, FL+2.65, IZ1-0.12), V3(93.4, FL+2.65, IZ1-0.12), 0.04, "#2a2a2c", 8); tube(V3(93.4, FL+2.65, IZ1-0.12), V3(93.4, FL+2.65, -1515.8), 0.04, "#2a2a2c", 8);
    tube(V3(93.4, FL+2.65, -1515.8), V3(93.4, FL+2.14, -1515.8), 0.04, "#2a2a2c", 8); for(let x=87.0; x<93.3; x+=1.2) B(0.03, 0.08, 0.12, x, FL+2.67, IZ1-0.07, STEEL); }
  tube(V3(X1, FL+2.35, -1517.6), V3(T0.x-0.2, TY+3.0, T0.z+0.3), 0.03, "#b8bcc0", 6); C(0.06, 0.14, X1+0.07, FL+2.35, -1517.6, "#ece6d8", 10, 0, 0, Math.PI/2);
  // the meter panel on the east wall: the common-point and the antenna current, the plate; a knife switch under them
  { const pz=-1514.85; B(0.04, 0.9, 1.1, IX1-0.02, FL+1.6, pz, "#1a1a1c");
    sign(1.04, 0.84, (c, W, H)=>{ c.fillStyle="#1a1a1c"; c.fillRect(0, 0, W, H);
        const meter=(cx, cy, r, n, v)=>{ c.fillStyle="#f2ecd8"; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); c.strokeStyle="#5a5a5c"; c.lineWidth=r*0.12; c.stroke();
          c.strokeStyle="#1a1a1a"; c.lineWidth=2; c.beginPath(); c.arc(cx, cy+r*0.3, r*0.68, Math.PI*1.2, Math.PI*1.8); c.stroke();
          for(let k=0;k<=10;k++){ const a=Math.PI*1.2+k*Math.PI*0.06; c.beginPath(); c.moveTo(cx+Math.cos(a)*r*0.68, cy+r*0.3+Math.sin(a)*r*0.68); c.lineTo(cx+Math.cos(a)*r*(k%5 ? 0.6 : 0.54), cy+r*0.3+Math.sin(a)*r*(k%5 ? 0.6 : 0.54)); c.stroke(); }
          const a=Math.PI*1.2+v*Math.PI*0.6; c.strokeStyle="#b02018"; c.lineWidth=2.5; c.beginPath(); c.moveTo(cx, cy+r*0.3); c.lineTo(cx+Math.cos(a)*r*0.72, cy+r*0.3+Math.sin(a)*r*0.72); c.stroke();
          say(c, n, cx, cy+r*0.62, r*1.3, r*0.22, "#1a1a1a", "700", "Arial"); };
        meter(W*0.22, H*0.30, W*0.13, "ANTENNA A", 0.62); meter(W*0.5, H*0.30, W*0.13, "COMMON PT", 0.58); meter(W*0.78, H*0.30, W*0.13, "PLATE KV", 0.71);
        say(c, "FRENCH CREEK BROADCASTING · 1340 KC", W/2, H*0.62, W*0.80, H*0.07, "#c8a050", "700", "Arial");
        say(c, "DO NOT OPEN THE CAGE WITH THE CARRIER ON", W/2, H*0.80, W*0.80, H*0.07, "#e8e2d4", "700", "Arial"); },
      IX1-0.05, FL+1.6, pz, -Math.PI/2, false, 520);
    B(0.06, 0.3, 0.22, IX1-0.03, FL+0.95, pz, "#2a2a2c"); B(0.03, 0.03, 0.2, IX1-0.13, FL+1.06, pz, "#d8d2c4", 0); C(0.012, 0.22, IX1-0.08, FL+0.95, pz, COPPER, 6, Math.PI/2); }
  // the engineer's desk on the south wall: the log, the telephone, a lamp; his chair; a calendar from the feed store; the extinguisher
  { const dx0=89.6, dx1=91.4, dz=IZ1-0.3;
    RB(dx1-dx0, 0.04, 0.6, (dx0+dx1)/2, FL+0.74, dz, "#5a4a3a", 0, 0.01); for(const sx of [dx0+0.04, dx1-0.04]) B(0.04, 0.72, 0.56, sx, FL+0.36, dz, "#4a4a4c");
    B(0.5, 0.6, 0.55, dx1-0.3, FL+0.42, dz, "#4a4a4c"); for(let k=0;k<3;k++) B(0.04, 0.02, 0.16, dx1-0.3, FL+0.62-k*0.19, dz-0.3, "#c8c8c0");
    addCol(dx0, dx1, IZ1-0.62, IZ1, FL-0.5, FL+0.78);
    B(0.32, 0.03, 0.24, 90.3, FL+0.775, dz, "#2a3a5a"); B(0.3, 0.004, 0.22, 90.3, FL+0.792, dz, "#ece6d0");                                   // (the log)
    RB(0.2, 0.08, 0.22, 91.0, FL+0.80, dz+0.05, "#1a1a1a", 0, 0.02); RB(0.2, 0.04, 0.05, 91.0, FL+0.86, dz+0.05, "#1a1a1a", 0, 0.015);        // (the telephone)
    C(0.07, 0.02, 89.85, FL+0.77, dz+0.12, "#2a4a3a", 12); C(0.008, 0.36, 89.85, FL+0.95, dz+0.12, "#2a4a3a", 6); ent(new T.CylinderGeometry(0.05, 0.11, 0.12, 14, 1, true), 89.85, FL+1.1, dz+0.04, "#2a5a3a", 0.4);
    const f=XF(90.5, -1515.25, Math.PI); RB(0.44, 0.06, 0.44, f.x(0, 0), FL+0.47, f.z(0, 0), "#3a2a1e", 0, 0.02); RB(0.44, 0.5, 0.05, f.x(0, -0.21), FL+0.75, f.z(0, -0.21), "#3a2a1e", 0, 0.02);
    for(const a of [-0.18, 0.18]) for(const b of [-0.18, 0.18]) B(0.035, 0.45, 0.035, f.x(a, b), FL+0.225, f.z(a, b), "#3a2a1e");
    addCol(90.27, 90.73, -1515.48, -1515.02, FL-0.5, FL+0.5); addSeat(90.5, -1515.25, FL, Math.PI, "THE ENGINEER'S CHAIR");
    B(0.36, 0.5, 0.02, 88.7, FL+1.6, IZ1-0.01, "#3a2a1e");
    sign(0.34, 0.48, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.fillRect(0, 0, W, H); c.fillStyle="#3a6a3a"; c.fillRect(W*0.08, H*0.06, W*0.84, H*0.36);
        say(c, "CRAWFORD COUNTY FEED", W/2, H*0.24, W*0.76, H*0.1, "#f2ecd8", "800", "Georgia, serif"); say(c, "OCTOBER 1958", W/2, H*0.52, W*0.76, H*0.08, "#1a1a1a", "700", "Georgia, serif");
        c.strokeStyle="#8a8a80"; c.lineWidth=1; for(let i=0;i<6;i++) for(let j=0;j<7;j++) c.strokeRect(W*0.1+j*W*0.114, H*0.6+i*H*0.06, W*0.114, H*0.06); },
      88.7, FL+1.6, IZ1-0.035, Math.PI, false, 200);
    C(0.08, 0.5, IX0+0.15, FL+0.3, IZ1-0.15, "#c82a1a", 12); C(0.03, 0.06, IX0+0.15, FL+0.58, IZ1-0.15, "#1a1a1a", 8); }
  bulb(89.0, CEIL-0.3, -1516.8); bulb(92.0, CEIL-0.3, -1515.2);
  lamp(89.0, CEIL-0.5, -1516.8, 0.55, 0xffdcaa, 6); lamp(92.0, CEIL-0.5, -1515.2, 0.45, 0xffdcaa, 5);
  addZone(X0, X1, Z0, Z1, FL-0.5, CEIL, "THE TUNING HOUSE", true);
  addVoid(X0, X1, Z0, Z1, SF-1, FL+2.0, SF);                                                     // (to head height: over the well the ground is not under you)

  /* ---- the cellar: block walls, a concrete floor round the lower stair's well, the ground floor's slab its ceiling ---- */
  for(const [a, b, c, d] of [[IX0, IX1, IZ0, L0],[IX0, LB, L0, IZ1],[LA, IX1, L0, IZ1]]){ B(b-a, 0.25, d-c, (a+b)/2, BF-0.125, (c+d)/2, "#8e8a80"); addFlat(a, b, c, d, BF); }
  // the lower stair: fifteen steps solid to the shelter's floor, its well railed round on the cellar's side
  for(let k=0;k<15;k++){ const y=BF-(k+1)*RS, xb=LA-k*LRUN, xa=xb-LRUN;
    B(LRUN, y-0.03-(SF-0.02), L1-L0-0.004, (xa+xb)/2, (y-0.03+SF-0.02)/2, (L0+L1)/2, "#8e8a80");
    RB(LRUN+0.03, 0.03, L1-L0, (xa+xb)/2+0.015, y-0.015, (L0+L1)/2, "#6a6a64", 0, 0.01);
    if(y-0.3>SF+0.15) addCol(xa, xb, L0, L1, SF-0.5, y-0.3); }
  addRamp(LB-0.02, LA+0.02, L0, L1, "x", LA, LB, BF, SF);
  { const rail=(x0, z0, x1, z1)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(2, Math.round(L/0.6));
      for(let k=0;k<=n;k++){ const x=x0+(x1-x0)*k/n, z=z0+(z1-z0)*k/n; B(0.04, 0.95, 0.04, x, BF+0.475, z, "#c8a018"); }
      tube(V3(x0, BF+0.95, z0), V3(x1, BF+0.95, z1), 0.022, "#c8a018", 8); tube(V3(x0, BF+0.5, z0), V3(x1, BF+0.5, z1), 0.018, "#c8a018", 8); };
    rail(LB-0.03, L0-0.03, LA, L0-0.03); rail(LB-0.03, L0-0.03, LB-0.03, L1-0.02);
    addCol(LB-0.06, LA, L0-0.06, L0, BF-0.1, BF+1.0); addCol(LB-0.06, LB, L0-0.06, L1, BF-0.1, BF+1.0);
    B(0.62, 0.3, 0.03, 90.8, BF+0.75, L0-0.065, "#1a1a1c");
    sign(0.58, 0.26, (c, W, H)=>{ c.fillStyle="#f2c818"; c.fillRect(0, 0, W, H); c.fillStyle="#1a1a1a"; c.fillRect(W*0.04, H*0.08, W*0.92, H*0.84);
        say(c, "SHELTER BELOW", W/2, H*0.38, W*0.80, H*0.3, "#f2c818", "800", "Arial"); say(c, "STATION STAFF ONLY · 1953", W/2, H*0.72, W*0.76, H*0.16, "#f2ecd8", "700", "Arial"); },
      90.8, BF+0.75, L0-0.085, Math.PI, false, 260); }
  // the station's first transmitter, retired down here in 1949: a tall grey cabinet, its meters and its dials
  { const tx=87.3, tz=IZ1-0.36; S(86.2, 88.4, BF, BF+1.9, IZ1-0.7, IZ1, "#7a7e78"); B(2.24, 0.06, 0.74, tx, BF+1.93, tz, "#5a5e5a");
    sign(2.0, 0.8, (c, W, H)=>{ c.fillStyle="#6a6e68"; c.fillRect(0, 0, W, H);
        for(let k=0;k<4;k++){ const cx=W*(0.14+k*0.24), cy=H*0.3, r=H*0.15; c.fillStyle="#f2ecd8"; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill(); c.strokeStyle="#2a2a2a"; c.lineWidth=3; c.stroke();
          c.strokeStyle="#1a1a1a"; c.lineWidth=2; c.beginPath(); c.moveTo(cx, cy+r*0.4); c.lineTo(cx-r*0.5+k*r*0.3, cy-r*0.6); c.stroke();
          c.fillStyle="#1a1a1a"; c.beginPath(); c.arc(cx, H*0.72, H*0.07, 0, 7); c.fill(); }
        c.fillStyle="#c8b890"; c.fillRect(W*0.3, H*0.86, W*0.4, H*0.1); say(c, "COMPOSITE 250 W · 1940", W/2, H*0.91, W*0.38, H*0.08, "#2a2a2a", "700", "Arial"); },
      tx, BF+1.3, IZ1-0.715, Math.PI, false, 520); }
  // the workbench on the west wall: the vise, a scope, tubes in their boxes; a pegboard over it
  { const wx=IX0+0.35; RB(0.7, 0.05, 2.4, wx, BF+0.9, -1517.4, "#7a5a36", 0, 0.01); for(const z of [-1518.5, -1516.3]) B(0.6, 0.88, 0.05, wx, BF+0.44, z, "#5a5a5c");
    B(0.6, 0.03, 2.3, wx, BF+0.25, -1517.4, "#5a5a5c"); addCol(IX0, IX0+0.72, -1518.62, -1516.18, BF-0.5, BF+0.95);
    B(0.04, 0.9, 2.2, IX0+0.02, BF+1.55, -1517.4, "#a88a5a"); for(let k=0;k<8;k++) B(0.02, 0.12+(k%3)*0.06, 0.03, IX0+0.06, BF+1.6-(k%2)*0.2, -1518.3+k*0.25, ["#c82a1a","#3a3a3c","#c8a050"][k%3]);
    B(0.16, 0.12, 0.2, wx-0.1, BF+0.985, -1518.2, "#3a4a5a"); B(0.36, 0.26, 0.3, wx, BF+1.055, -1517.3, "#5a6a6a"); B(0.01, 0.16, 0.2, wx+0.18, BF+1.07, -1517.3, "#3af06a");
    for(let k=0;k<6;k++) B(0.08, 0.13, 0.08, wx+0.2-(k%2)*0.12, BF+0.99, -1516.8+Math.floor(k/2)*0.12, ["#e8dcc0","#d8c8a0"][k%2]); }
  // shelves on the east wall by the stair's foot: boxed tubes, coils of wire, a lantern
  { const sx=IX1-0.25; for(const y of [0.05, 0.6, 1.15, 1.7]) B(0.48, 0.03, 1.9, sx, BF+y, -1518.95, "#8a8d90");
    for(const z of [IZ0+0.03, -1518.03]) B(0.48, 1.75, 0.03, sx, BF+0.875, z, "#8a8d90");
    for(let k=0;k<15;k++){ const lv=k%3, z=-1519.7+Math.floor(k/3)*0.33; B(0.3, 0.14+((k*7)%3)*0.04, 0.24, sx, BF+[0.08, 0.63, 1.18][lv]+0.09, z, ["#e8dcc0","#c8a070","#5a7a8a","#d8c8a0"][k%4]); }
    addCol(IX1-0.5, IX1, IZ0, -1518.0, BF-0.5, BF+1.8); }
  // the sump in the corner, a dehumidifier humming by it, a drum of oil
  C(0.2, 0.02, IX0+0.25, BF+0.012, IZ0+0.4, "#3a3a3c", 16); RB(0.3, 0.52, 0.26, IX0+0.68, BF+0.26, IZ0+0.18, "#e8e4d8", 0, 0.03); addCol(IX0+0.52, IX0+0.84, IZ0, IZ0+0.32, BF-0.5, BF+0.55);
  bulb(88.8, BCL-0.15, -1516.8); bulb(92.4, BCL-0.15, -1517.3);
  lamp(88.8, BCL-0.4, -1516.8, 0.5, 0xffe0b0, 6, true); lamp(92.4, BCL-0.4, -1517.3, 0.4, 0xffe0b0, 5, true);
  addZone(X0, X1, Z0, Z1, BF-0.5, BCL, "THE TUNING HOUSE · THE CELLAR", true);
  addBuried(IX0, IX1, IZ0, IZ1, BF-0.5, BCL+0.2, 0.85, 0xb0a080);
  addBuried(UA, UB, U0, U1, BF+1.0, FL+1.8, 0.8, 0xb0a080, [FL+1.55, BF+1.75]);                  // (by degrees, the whole way down from the hut)

  /* ---- the shelter: under the ground west of the cellar and partly under it, block walls, a concrete ceiling, a partition with the bunks ---- */
  const QX0=80.0, QX1=87.88, QZ0=-1520.0, QZ1=-1509.0, PZ=-1513.0, PT=0.12, SW="#a6a296";
  const q=(w, h, d, x, y, z)=>B(w, h, d, x, y, z, SW);
  // its walls: along x the whole length, along z between them; the east one with the steel door at the stair's landing
  const SDOOR={a:-1515.19, b:-1514.19, sill:SF-0.02, head:SF+2.08};
  wall("x", QZ0-TW, QZ0, QX0-TW, QX1+PT, SF-0.2, BF-0.25, [], q); wall("x", QZ1, QZ1+TW, QX0-TW, QX1+PT, SF-0.2, BF-0.25, [], q);
  wall("z", QX0-TW, QX0, QZ0, QZ1, SF-0.2, BF-0.25, [], q); wall("z", QX1, QX1+PT, QZ0, QZ1, SF-0.2, BF-0.25, [SDOOR], q);
  wall("x", PZ-PT/2, PZ+PT/2, QX0-0.02, QX1+0.02, SF-0.2, SCL+0.02, [{a:83.5, b:84.4, sill:SF-0.02, head:SF+2.06}], q);
  B(QX1-QX0+0.04, 0.1, QZ1-QZ0+0.04, (QX0+QX1)/2, SCL+0.05, (QZ0+QZ1)/2, "#c8c4ba");
  // the lower stair's own walls and its landing, down from the cellar's slab to the shelter's floor
  q(LA+PT-(QX1+PT)+0.02, BF-0.25-(SF-0.2), PT, (QX1+PT-0.02+LA+PT)/2, (BF-0.25+SF-0.2)/2, L0-PT/2); addCol(QX1+PT, LA+PT, L0-PT, L0, SF-0.2, BF-0.25);
  q(PT, BF-0.25-(SF-0.2), L1-L0+2*PT, LA+PT/2, (BF-0.25+SF-0.2)/2, (L0+L1)/2);
  q(LA-(QX1+PT)+0.02, BF-0.25-(SF-0.2), 0.1, (QX1+PT-0.02+LA)/2, (BF-0.25+SF-0.2)/2, L1+0.05); addCol(QX1+PT, LA, L1, L1+0.1, SF-0.2, BF-0.25);
  addFlat(QX1-0.02, LB, L0, L1, SF); addFlat(QX0, QX1, QZ0, QZ1, SF); addFlat(QX1-0.02, QX1+PT+0.02, SDOOR.a, SDOOR.b, SF);
  B(QX1-QX0, 0.01, QZ1-QZ0, (QX0+QX1)/2, SF+0.005, (QZ0+QZ1)/2, "#7a7468");
  // the steel door, latched: you open it
  makeDoor(XF(QX1+PT/2, SDOOR.a+0.02, -Math.PI/2), 0, SF+0.01, 0, "THE SHELTER", true, 0, "steel", 0x6a7a6a);
  latchDoor({x0:QX1, x1:QX1+PT, z0:SDOOR.a, z1:SDOOR.b, y0:SF, y1:SF+2.1});
  makeDoor(XF(83.52, PZ, 0), 0, SF+0.01, 0, "THE BUNK ROOM", true, 0.95, "closet", 0x6a7060);
  // the emergency studio on the north wall: the desk and its console, the microphone, the typewriter; the board over it and the clock
  { const dz=QZ0+0.38; RB(3.0, 0.05, 0.76, 83.7, SF+0.75, dz, "#5a5a54", 0, 0.01); for(const x of [82.25, 85.15]) B(0.06, 0.73, 0.7, x, SF+0.365, dz, "#4a4a46");
    addCol(82.2, 85.2, QZ0, QZ0+0.78, SF-0.5, SF+0.8);
    RB(1.2, 0.18, 0.4, 83.7, SF+0.86, QZ0+0.24, "#3a4a46", 0, 0.02); for(let k=0;k<6;k++){ C(0.022, 0.03, 83.2+k*0.2, SF+0.96, QZ0+0.3, "#1a1a1a", 10); B(0.02, 0.06, 0.02, 83.2+k*0.2, SF+0.98, QZ0+0.18, "#c8c8c0"); }
    for(let k=0;k<2;k++) B(0.16, 0.08, 0.004, 83.45+k*0.5, SF+0.9, QZ0+0.441, "#f2ecd8");
    C(0.06, 0.02, 83.7, SF+0.785, dz+0.12, "#2a2a2c", 14); C(0.008, 0.3, 83.7, SF+0.94, dz+0.12, "#9a9a9c", 6); RB(0.07, 0.14, 0.05, 83.7, SF+1.15, dz+0.12, "#9a9a9c", 0, 0.02);
    for(let k=0;k<5;k++) B(0.072, 0.006, 0.052, 83.7, SF+1.09+k*0.03, dz+0.12, "#3a3a3c");
    RB(0.42, 0.12, 0.34, 84.7, SF+0.83, dz+0.05, "#2a2a2c", 0, 0.03); B(0.36, 0.06, 0.003, 84.7, SF+0.93, dz-0.07, "#f2ecd8"); C(0.025, 0.42, 84.7, SF+0.9, dz-0.04, "#1a1a1a", 10, 0, 0, Math.PI/2);
    B(0.22, 0.03, 0.3, 82.75, SF+0.79, dz, "#e8e2d0");
    const f=XF(83.7, QZ0+1.05, 0); RB(0.44, 0.06, 0.44, f.x(0, 0), SF+0.47, f.z(0, 0), "#3a3a3c", 0, 0.02); RB(0.44, 0.42, 0.05, f.x(0, 0.21), SF+0.75, f.z(0, 0.21), "#3a3a3c", 0, 0.02);
    for(const a of [-0.18, 0.18]) for(const b of [-0.18, 0.18]) B(0.03, 0.45, 0.03, f.x(a, b), SF+0.225, f.z(a, b), "#8a8a8c");
    addCol(83.47, 83.93, QZ0+0.82, QZ0+1.28, SF-0.5, SF+0.5); addSeat(83.7, QZ0+1.05, SF, 0, "THE EMERGENCY DESK");
    B(1.5, 0.66, 0.03, 83.7, SF+1.75, QZ0+0.015, "#1a1a1c");
    sign(1.44, 0.6, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.fillRect(0, 0, W, H); c.fillStyle="#1a2a5a"; c.fillRect(W*0.04, H*0.06, W*0.92, H*0.38);
        say(c, "CONELRAD", W/2, H*0.25, W*0.66, H*0.28, "#f2ecd8", "800", "Arial"); say(c, "IN AN ALERT TUNE ONLY 640 OR 1240", W/2, H*0.58, W*0.80, H*0.11, "#1a2a5a", "800", "Arial");
        say(c, "STAY ON THE AIR · READ THE CARD · NO NAMES OF PLACES", W/2, H*0.80, W*0.80, H*0.09, "#3a3a3a", "700", "Arial"); },
      83.7, SF+1.75, QZ0+0.035, 0, false, 520);
    B(0.36, 0.36, 0.03, 85.6, SF+1.85, QZ0+0.015, "#1a1a1c");
    sign(0.32, 0.32, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.beginPath(); c.arc(W/2, H/2, W*0.46, 0, 7); c.fill(); c.strokeStyle="#1a1a1a"; c.lineWidth=2;
        for(let k=0;k<12;k++){ const a=k*Math.PI/6; c.beginPath(); c.moveTo(W/2+Math.cos(a)*W*0.36, H/2+Math.sin(a)*W*0.36); c.lineTo(W/2+Math.cos(a)*W*0.42, H/2+Math.sin(a)*W*0.42); c.stroke(); }
        c.lineWidth=4; c.beginPath(); c.moveTo(W/2, H/2); c.lineTo(W/2+W*0.2, H/2-W*0.08); c.stroke(); c.lineWidth=2.5; c.beginPath(); c.moveTo(W/2, H/2); c.lineTo(W/2-W*0.05, H/2-W*0.33); c.stroke(); },
      85.6, SF+1.85, QZ0+0.035, 0, false, 160); }
  // the receiver rack on the west wall; the hand-crank generator by it
  { RB(0.6, 1.9, 0.62, QX0+0.31, SF+0.95, -1517.5, "#3a3e40", 0, 0.02); addCol(QX0, QX0+0.62, -1517.82, -1517.18, SF-0.5, SF+1.95);
    sign(0.56, 1.7, (c, W, H)=>{ c.fillStyle="#2a2e30"; c.fillRect(0, 0, W, H);
        for(let k=0;k<5;k++){ const y=H*(0.04+k*0.19); c.fillStyle="#5a5e60"; c.fillRect(W*0.05, y, W*0.9, H*0.17); c.fillStyle="#1a1a1a"; c.fillRect(W*0.1, y+H*0.03, W*0.5, H*0.07);
          c.fillStyle=k%2 ? "#f2a030" : "#7ad87a"; c.fillRect(W*0.12, y+H*0.05, W*0.46*(0.3+((k*37)%60)/100), H*0.03);
          for(let j=0;j<3;j++){ c.fillStyle="#c8c8c0"; c.beginPath(); c.arc(W*(0.68+j*0.1), y+H*0.1, W*0.035, 0, 7); c.fill(); } } },
      QX0+0.625, SF+0.95, -1517.5, Math.PI/2, false, 120);
    const gx=QX0+0.45, gz=-1516.2; RB(0.6, 0.5, 0.5, gx, SF+0.25, gz, "#4a6a4a", 0, 0.03); C(0.18, 0.04, gx+0.32, SF+0.55, gz, "#3a3a3c", 16, 0, 0, Math.PI/2);
    B(0.03, 0.2, 0.03, gx+0.35, SF+0.62, gz+0.1, "#c8c8c0"); addCol(gx-0.3, gx+0.36, gz-0.25, gz+0.25, SF-0.5, SF+0.75); }
  // supplies along the partition: shelves of crackers, candy and the medical kit; water drums by the east wall; a table and two chairs
  { for(const y of [0.05, 0.55, 1.05, 1.55]) B(2.8, 0.03, 0.45, 81.6, SF+y, PZ-PT/2-0.24, "#8a8d90");
    for(const x of [80.22, 82.98]) B(0.03, 1.7, 0.45, x, SF+0.85, PZ-PT/2-0.24, "#8a8d90");
    for(let k=0;k<18;k++){ const lv=k%3, x=80.55+Math.floor(k/3)*0.42; B(0.38, 0.26, 0.36, x, SF+[0.2, 0.7, 1.2][lv], PZ-PT/2-0.24, ["#c8a070","#a8a070","#d8d0b8"][k%3]); }
    addCol(80.0, 83.02, PZ-PT/2-0.48, PZ-PT/2, SF-0.5, SF+1.7);
    sign(0.9, 0.26, (c, W, H)=>{ c.fillStyle="#d8c8a0"; c.fillRect(0, 0, W, H); say(c, "SURVIVAL CRACKERS · 10 IN 1", W/2, H/2, W*0.8, H*0.46, "#3a2a1a", "800", "Arial"); },
      81.6, SF+1.42, PZ-PT/2-0.475, Math.PI, false, 260);
    for(const z of [-1519.5, -1518.8, -1518.1]){ C(0.29, 0.86, 87.45, SF+0.43, z, "#2a4a8a", 18); C(0.3, 0.03, 87.45, SF+0.86, z, "#24407a", 18); }
    addCol(87.15, QX1, -1519.8, -1517.8, SF-0.5, SF+0.9);
    const tx=82.4, tz=-1516.3; RB(1.0, 0.04, 0.7, tx, SF+0.74, tz, "#6a6a5e", 0, 0.01); for(const a of [-0.44, 0.44]) for(const b of [-0.3, 0.3]) B(0.03, 0.72, 0.03, tx+a, SF+0.36, tz+b, "#8a8a8c");
    addCol(tx-0.5, tx+0.5, tz-0.35, tz+0.35, SF-0.5, SF+0.76);
    for(let k=0;k<4;k++) B(0.063, 0.003, 0.088, tx-0.2+k*0.12, SF+0.762+k*0.0035, tz+0.05*(k%2), k%2 ? "#f2f0ea" : "#eae6dc", k*0.3);
    B(0.12, 0.2, 0.12, tx+0.3, SF+0.86, tz-0.15, "#c8a018"); push("rn_glow", new T.SphereGeometry(0.04, 8, 6), tx+0.3, SF+0.93, tz-0.15, 0, "#ffffff");
    for(const [cx, ry] of [[tx-0.85, Math.PI/2],[tx+0.85, -Math.PI/2]]){ const f=XF(cx, tz, ry); RB(0.42, 0.05, 0.42, cx, SF+0.46, tz, "#5a5e5a", 0, 0.02);
      RB(0.42, 0.4, 0.04, f.x(0, -0.2), SF+0.72, f.z(0, -0.2), "#5a5e5a", ry, 0.02); for(const a of [-0.17, 0.17]) for(const b of [-0.17, 0.17]) B(0.025, 0.44, 0.025, f.x(a, b), SF+0.22, f.z(a, b), "#8a8a8c");
      addCol(cx-0.22, cx+0.22, tz-0.22, tz+0.22, SF-0.5, SF+0.48); addSeat(cx, tz, SF, ry+Math.PI, "A CHAIR IN THE SHELTER"); }
    // the shelter sign by the door, and the air: a duct along the ceiling to a blower
    B(0.03, 0.4, 0.46, QX1-0.015, SF+1.7, -1516.0, "#1a1a1c");
    sign(0.4, 0.4, (c, W, H)=>{ c.fillStyle="#f2c818"; c.fillRect(0, 0, W, H); c.fillStyle="#1a1a1a"; c.fillRect(W*0.04, H*0.04, W*0.92, H*0.66);
        const cx=W/2, cy=H*0.37, r=H*0.27; c.fillStyle="#f2c818"; c.beginPath(); c.arc(cx, cy, r*0.18, 0, 7); c.fill();
        for(let k=0;k<3;k++){ const a=-Math.PI/2+k*Math.PI*2/3; c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, r, a-0.52, a+0.52); c.closePath(); c.fill(); }
        c.fillStyle="#1a1a1a"; c.beginPath(); c.arc(cx, cy, r*0.3, 0, 7); c.fill(); c.fillStyle="#f2c818"; c.beginPath(); c.arc(cx, cy, r*0.18, 0, 7); c.fill();
        say(c, "FALLOUT SHELTER", W/2, H*0.84, W*0.80, H*0.16, "#1a1a1a", "800", "Arial"); },
      QX1-0.035, SF+1.7, -1516.0, -Math.PI/2, false, 200);
    B(0.3, 0.3, QZ1-QZ0-1.0, 86.9, SCL-0.18, (QZ0+QZ1)/2+0.2, "#9a9a94"); RB(0.5, 0.4, 0.5, 86.9, SCL-0.5, QZ0+0.35, "#5a6a5a", 0, 0.03);
    bulb(83.7, SCL-0.15, -1518.0); bulb(84.4, SCL-0.15, -1515.0); bulb(88.5, BF-0.4, -1514.65);
    lamp(83.7, SCL-0.4, -1518.0, 0.7, 0xffe4b8, 6.5, true); lamp(84.4, SCL-0.4, -1515.0, 0.6, 0xffe4b8, 6, true); lamp(88.5, BF-0.6, -1514.65, 0.3, 0xffe0b0, 4, true); }
  // the bunks: three high each side, a footlocker at each, a lamp
  { for(const bx of [QX0+0.45, QX1-0.45]){ for(const a of [-0.38, 0.38]) for(const b of [-1.0, 1.0]) B(0.04, 2.1, 0.04, bx+a, SF+1.05, -1511.3+b, "#5a6a5a");
      for(const y of [0.32, 1.02, 1.72]){ B(0.8, 0.04, 2.0, bx, SF+y, -1511.3, "#5a6a5a"); RB(0.74, 0.12, 1.9, bx, SF+y+0.08, -1511.3, "#7a7a5a", 0, 0.04);
        RB(0.5, 0.08, 0.3, bx, SF+y+0.18, -1512.05, "#e8e4d8", 0, 0.03); }
      addCol(bx-0.42, bx+0.42, -1512.34, -1510.26, SF-0.5, SF+2.15);
      RB(0.7, 0.36, 0.4, bx, SF+0.18, -1509.3, "#4a5a3a", 0, 0.02); addCol(bx-0.36, bx+0.36, QZ1-0.42, QZ1, SF-0.5, SF+0.4); }
    bulb(84.0, SCL-0.15, -1510.8); lamp(84.0, SCL-0.4, -1510.8, 0.75, 0xffe0b0, 6, true); }
  // up top over it: the shelter's air vent, a mushroom on a pipe in the grass west of the hut
  { const vx=82.0, vz=-1514.5, gy=Terrain.groundAt(vx, vz); C(0.09, 1.0, vx, gy+0.45, vz, "#7a7e78", 12); ent(new T.ConeGeometry(0.28, 0.2, 16), vx, gy+1.05, vz, "#6a6e68"); C(0.28, 0.04, vx, gy+0.94, vz, "#6a6e68", 16);
    addCol(vx-0.15, vx+0.15, vz-0.15, vz+0.15, gy-0.5, gy+1.1); }
  addVoid(QX0-TW, LA+PT, QZ0-TW, QZ1+TW, SF-1, SCL+0.5, SF);
  addZone(QX0-TW, LA+PT, QZ0-TW, PZ, SF-0.5, BF-0.3, "THE TUNING HOUSE · THE SHELTER", true);
  addZone(QX0-TW, QX1+PT, PZ, QZ1+TW, SF-0.5, SCL+0.1, "THE TUNING HOUSE · THE BUNKS", true);
  addBuried(QX0, LB, QZ0, QZ1, SF-0.5, SCL+0.2, 0.42, 0xa8b0a0);
  addBuried(LB, LA, L0, L1, SF+1.0, BF+1.8, 0.6, 0xa8b0a0, [BF+1.55, SF+1.75]);

  // the walking test's routes: in at the door, down the stair, round the cellar; down to the shelter (the steel door opened) and into the bunks
  Object.assign(RADIO_ST.routes, {
    "the tuning house: in, and down to the cellar":[[88.0, -1503.0],[87.4, -1510.0],[87.38, -1512.6],[87.38, -1514.0],[87.38, -1515.3],[86.55, -1516.2],[86.55, -1519.4],[87.6, -1519.45],
      [89.5, -1519.45],[91.6, -1519.45],[91.6, -1518.2],[93.25, -1516.6],[93.25, -1515.7]],
    "the tuning house: down to the shelter and the bunks":{gate:true, y0:BF, pts:[[91.6, -1517.6],[93.25, -1516.0],[93.25, -1514.65],[92.4, -1514.65],[90.6, -1514.65],[89.4, -1514.65],[88.5, -1514.65],
      [86.6, -1514.7],[85.5, -1515.6],[83.96, -1514.0],[83.96, -1512.6],[84.0, -1511.0]]}});
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.05});
  detailMesh(ME, mat, "tuning-house", true);
})();
/* its porch lamp comes on after dark */
function updateTuningHouse(dark){ if(TUNE.porch) TUNE.porch.intensity=0.8*smoothstep(0.3, 0.6, dark); }
