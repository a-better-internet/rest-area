"use strict";
/* REST AREA · 12b-hangout.js
   under the generator house: the stair down to the rooms the crew keeps
   there, and everything in them
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12b · THE ROOMS UNDER THE GENERATOR HOUSE
   The generator house was poured over a cellar, and nobody from the
   district has been down it in years. Inside the door, to the right, a
   plain grey door in a block partition; behind it a concrete stair with
   yellow nosings goes down along the south wall, and at the bottom, round
   the corner, the crew's room: walnut panelling somebody put up in the
   seventies, an octagonal poker table under a green shade with a hand
   still on it, mismatched chairs, the shelving, the ledger of who owes
   who. Somebody has since knocked through the old foundation wall to the
   west and dug out under the yard: a second room, with the plaid couch
   facing the television on its cart, a cable spool for a coffee table, a
   harvest-gold fridge full of lager, and a darts lane with its oche and a
   chalkboard (18d plays it). Christmas lights along both ceilings all
   year. A door in the far wall goes on down to a corridor (12c).
   The stair, the walls and the floors are real; the rooms are VOIDs (06)
   under the slab and the yard, the slab and the stone and the ground are
   cut where the stair comes through (00 GEN_PIT, 04, 12). They are
   BURIED: lit the same at any hour, by their own lamps only (19, 16).
   ---------------------------------------------------------------------- */
const HANGOUT={tvOn:false, tv:null, tvLamp:null, screen:null, dart:null, chalk:null, door:null};
/* the dartboard's numbers: the sectors clockwise from the top, and the
   rings' radii in metres, the regulation ones (the board here is drawn to
   them and 18d scores against them) */
const DART_ORDER=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
const DART_RINGS={bull:0.00635, outerBull:0.0159, trebleIn:0.099, trebleOut:0.107, doubleIn:0.162, doubleOut:0.170};
const DART_MAT=new T.MeshStandardMaterial({vertexColors:true, roughness:0.35, metalness:0.45});
// a dart: the steel point at the origin (a centimetre of it in whatever it hits), the barrel, the shaft, the flights, along +z
function dartGeometry(){
  const E=[], add=(g,z,c,rz)=>E.push({geo:g, matrix:new T.Matrix4().compose(V3(0,0,z), new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,0,rz||0)), V3(1,1,1)), color:new T.Color(c)});
  add(new T.CylinderGeometry(0.0022,0.0004,0.032,8), 0.004, "#c9cbcc");
  add(new T.CylinderGeometry(0.0034,0.0030,0.05,10), 0.045, "#8a8c90");
  for(let k=0;k<4;k++) add(new T.CylinderGeometry(0.00355,0.00355,0.003,10), 0.028+k*0.009, "#5a5c60");
  add(new T.CylinderGeometry(0.0022,0.0022,0.042,8), 0.090, "#1a1a1c");
  for(const r of [0, Math.PI/2]) E.push({geo:new T.BoxGeometry(0.034,0.0006,0.040), matrix:new T.Matrix4().compose(V3(0,0,0.122), new T.Quaternion().setFromEuler(new T.Euler(0,0,r)), V3(1,1,1)), color:new T.Color("#c42a1a")});
  return mergeEntries(E);
}
/* the chalkboard by the board: two names, a column of what is left for each */
function chalkDraw(c, names, colA, colB, note){
  const x=c.getContext("2d"), W=c.width, Hh=c.height, F="'Comic Sans MS', 'Marker Felt', cursive";
  x.fillStyle="#1f2a24"; x.fillRect(0,0,W,Hh);
  for(let i=0;i<40;i++){ x.fillStyle="rgba(230,235,228,"+(0.02+Math.random()*0.03)+")"; x.fillRect(Math.random()*W, Math.random()*Hh, 20+Math.random()*60, 2+Math.random()*6); }
  x.fillStyle="rgba(240,240,232,0.88)";
  fitText(x, names[0], W*0.40, 22, W*0.27, 26, "700", F); fitText(x, names[1], W*0.40, 22, W*0.73, 26, "700", F);
  x.fillRect(W/2-1.5, 42, 3, Hh-84); x.fillRect(14, 44, W-28, 2);
  const rows=Math.max(colA.length, colB.length), step=Math.min(28, (Hh-110)/Math.max(1,rows));
  colA.forEach((s,i)=>fitText(x, String(s), W*0.40, Math.min(20,step*0.8), W*0.27, 66+i*step, "500", F));
  colB.forEach((s,i)=>fitText(x, String(s), W*0.40, Math.min(20,step*0.8), W*0.73, 66+i*step, "500", F));
  if(note){ x.fillStyle="rgba(244,214,120,0.92)"; fitText(x, note, W*0.86, 16, W/2, Hh-22, "700", F); }
}
(function hangout(){
  const H={x0:77, x1:87, z0:-182, z1:-176}, T2=0.25, FY=SUB_G+0.15, FB=FY-2.65, CB=FY-0.40;
  const IX0=H.x0+T2, IX1=H.x1-T2, IZ0=H.z0+T2, IZ1=H.z1-T2;        // the first room's inside faces, the house's own
  const XX0=70.25, XX1=H.x0, XZ0=-183.4, XZ1=IZ1;                  // the dug-out to the west
  const OP={z0:-181.3, z1:-177.7, head:FB+2.10};                   // the hole knocked through the old wall
  const P=GEN_PIT, SX1=85.7, NS=12, RISE=(FY-FB)/(NS+1), RUN=(SX1-P.x0)/NS;
  const WZ0=P.z0-0.15, WZ1=P.z0;                                   // the stair's wall on the room side
  const WX0=82.05, WX1=82.20;                                      // and its end wall, where the door is
  const AD={x0:71.56, x1:72.44};                                   // the door on to the corridor (12c)
  const WALL="#d6cdb6", HOUSE="#dcd8cc";
  let _s=9137; const R=()=>{ _s=(_s*1664525+1013904223)&0x7fffffff; return _s/0x7fffffff; };
  const E=[];                                                      // everything plain, vertex-coloured, one mesh
  const ent=(geo, x,y,z, c, rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0, ry||0, rz||0, "YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d), x,y,z, c, rx,ry,rz);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12), x,y,z, c, rx,ry,rz);
  const tubeE=(a,b,r,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    E.push({geo:new T.CylinderGeometry(r,r,L,6), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  // a picture: a plane on a wall with its own texture, alpha-tested if it has a cut shape
  const pic=(w,h,draw,x,y,z,ry,cut,cw,ch)=>{
    const tex=signTex(cw||Math.round(w*400), ch||Math.round(h*400), draw);
    const m=new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshStandardMaterial({map:tex, roughness:0.7, transparent:!!cut, alphaTest:cut?0.5:0,
      polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(x,y,z); m.rotation.y=ry||0; m.receiveShadow=true; scene.add(m); return m;
  };
  // every line of lettering fitted to its own width and height, never past the edge it is painted inside
  const MARK="'Comic Sans MS', 'Marker Felt', cursive";
  const say=(x, s, cx, cy, w, h, col, weight, family)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"700", family); };
  const UNDER=[];                                                  // its lamps: on at any hour, seen only from down here
  const lamp=(o)=>{ o.under=true; o.indoor=true; o.circ="bldg"; LAMPS.push(o); UNDER.push(o); return o; };

  /* ---- the stair --------------------------------------------------------- */
  // the walls: the house's own carried down to the cellar floor, the stair's wall on the room side, its end wall
  wallBox("block", IX1, H.x1, H.z0, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", IX0, IX1, H.z0, IZ0, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", IX0, IX1, IZ1, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  // the house's own walls stand on the slab: their colliders stop at its underside, not a metre below
  // it in the cellar, where they would catch your head going through the hole under the west one
  for(const c of COL) if(c.x0>=H.x0-0.01 && c.x1<=H.x1+0.01 && c.z0>=H.z0-0.01 && c.z1<=H.z1+0.01 && Math.abs(c.y0-(FY-1.1))<0.01) c.y0=FY-0.6;
  // the old west foundation wall, a hole knocked through it and a steel lintel over the hole
  wallBox("block", H.x0, IX0, H.z0, OP.z0, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", H.x0, IX0, OP.z1, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", H.x0, IX0, OP.z0, OP.z1, OP.head, FY-0.6, WALL, 0.6, FB);
  B(0.27, 0.10, OP.z1-OP.z0+0.30, (H.x0+IX0)/2, OP.head+0.05-0.002, (OP.z0+OP.z1)/2, "#5a5048");
  wallBox("block", WX1, SX1, WZ0, WZ1, FB-0.1, CB, WALL, 0.6, FB);
  wallBox("block", WX0, WX1, WZ0, IZ1, FB-0.1, CB, WALL, 0.6, FB);
  // up in the generator house: the partition round the top of it, and the door in its end
  const DZ0=-177.24, DZ1=-176.30, DHEAD=FY+2.08;
  // (standing on the slab, not down through it: its cut edge shows in the stairwell, a face of its own)
  wallBox("block", WX1, IX1, WZ0, WZ1, FY, FY+3.0, HOUSE, 0.6, FY);
  wallBox("block", WX0, WX1, WZ0, DZ0, FY, FY+3.0, HOUSE, 0.6, FY);
  wallBox("block", WX0, WX1, DZ1, IZ1, FY, FY+3.0, HOUSE, 0.6, FY);
  wallBox("block", WX0, WX1, DZ0, DZ1, DHEAD, FY+3.0, HOUSE, 0.6, FY);
  for(const z of [DZ0-0.025, DZ1+0.025]) B(0.20, DHEAD-FY, 0.05, (WX0+WX1)/2, FY+(DHEAD-FY)/2, z, "#6e7474");
  B(0.21, 0.05, DZ1-DZ0+0.11, (WX0+WX1)/2, DHEAD+0.02, (DZ0+DZ1)/2, "#6e7474");          // (its underside below the wall's)
  makeDoor(XF((WX0+WX1)/2, DZ0+0.03, -Math.PI/2), 0, FY+0.02, 0, "THE BASEMENT", true, 0, "closet", 0x6f7a72);
  // the treads: solid concrete to the floor, a yellow nosing on each, and where your feet go
  for(let k=1;k<=NS;k++){
    const xa=P.x0+(k-1)*RUN, xb=xa+RUN, y=FY-k*RISE;
    bx("concrete", RUN, y-FB, P.z1-P.z0-0.004, (xa+xb)/2, (y+FB)/2, (P.z0+P.z1)/2, 0.5, 0, "#a8a49a");
    bx("paint", 0.05, 0.004, P.z1-P.z0-0.03, xb-0.022, y+0.002, (P.z0+P.z1)/2, 0, 0, "#e2b31c");     // at the edge you step down off, 3 mm proud of the riser
    addFlat(xa, xb, P.z0, P.z1, y);
  }
  bx("paint", 0.05, 0.004, P.z1-P.z0-0.006, P.x0-0.025, FY+0.006, (P.z0+P.z1)/2, 0, 0, "#e2b31c");
  // the rails: black pipe on brackets, down both sides
  for(const z of [P.z1-0.07, P.z0+0.07]){
    const a=V3(P.x0-0.25, FY+0.92, z), b=V3(SX1+0.10, FB+RISE+0.92-0.05, z);
    tubeE(a, b, 0.021, "#2a2c2e");
    for(const t of [0.08, 0.5, 0.92]){ const p=a.clone().lerp(b,t); tubeE(p, V3(p.x, p.y-0.07, z+(z>P.z0+0.5?0.06:-0.06)), 0.012, "#2a2c2e"); }
  }

  /* ---- the dug-out: block walls round it, its own ceiling under the yard - */
  const XT=CB+0.10;                                                 // its walls' tops: under the stone, never through it
  wallBox("block", XX0-0.25, XX0, XZ0-0.25, XZ1+0.25, FB-0.1, XT, WALL, 0.6, FB);
  wallBox("block", XX0, AD.x0-0.03, XZ0-0.25, XZ0, FB-0.1, XT, WALL, 0.6, FB);
  wallBox("block", AD.x1+0.03, IX0, XZ0-0.25, XZ0, FB-0.1, XT, WALL, 0.6, FB);
  wallBox("block", AD.x0-0.03, AD.x1+0.03, XZ0-0.25, XZ0, FB+2.10, XT, WALL, 0.6, FB);
  wallBox("block", H.x0, IX0, XZ0, H.z0, FB-0.1, XT, WALL, 0.6, FB);
  wallBox("block", XX0, H.x0, XZ1, XZ1+0.25, FB-0.1, XT, WALL, 0.6, FB);
  for(const x of [AD.x0-0.025, AD.x1+0.025]) B(0.05, 2.10, 0.30, x, FB+1.05, XZ0-0.125, "#6e7474");
  B(AD.x1-AD.x0+0.11, 0.05, 0.31, (AD.x0+AD.x1)/2, FB+2.12, XZ0-0.125, "#6e7474");
  makeDoor(XF(AD.x0+0.02, XZ0-0.125, 0), 0, FB+0.02, 0, "THE CORRIDOR", true, 0, "closet", 0x5f6a6e);
  HANGOUT.door={x0:AD.x0, x1:AD.x1, z:XZ0-0.25, y:FB};

  // where the stair lets you off: the cellar floor everywhere under the slab and the yard
  addVoid(IX0, IX1, IZ0, IZ1, FB-3, FY-0.05, FB);
  addVoid(XX0, IX0, XZ0, XZ1, FB-3, SUB_G-0.15, FB);

  /* ---- floors, ceilings, panelling --------------------------------------- */
  floorAt("concrete", IX0, IX1, IZ0, IZ1, FB+0.004, "#7c877a", 0.5);
  floorAt("concrete", XX0, XX1, XZ0, XZ1, FB+0.004, "#7c877a", 0.5);
  floorAt("concrete", XX1, IX0, OP.z0, OP.z1, FB+0.004, "#7c877a", 0.5);
  ceilAt("plaster", IX0, IX1, IZ0, WZ0, CB-0.004, "#cdcac2", 0.5);
  ceilAt("plaster", SX1, IX1, WZ0, P.z0, CB-0.004, "#cdcac2", 0.5);
  ceilAt("plaster", XX0, XX1, XZ0, XZ1, CB-0.004, "#cdcac2", 0.5);
  const panelTex=(function(){
    const c=cvs(512,512), x=c.getContext("2d");
    for(let i=0;i<8;i++){ const x0=i*64, t=R();
      x.fillStyle=`rgb(${(78+t*26)|0},${(50+t*16)|0},${(30+t*10)|0})`; x.fillRect(x0,0,64,512);
      for(let g=0;g<26;g++){ x.strokeStyle="rgba("+(R()<0.5?"40,24,12":"120,82,48")+","+(0.12+R()*0.2)+")"; x.lineWidth=1+R()*2;
        x.beginPath(); const gx=x0+R()*64; x.moveTo(gx,0); x.bezierCurveTo(gx+(R()-0.5)*20,170,gx+(R()-0.5)*20,340,gx+(R()-0.5)*14,512); x.stroke(); }
      x.fillStyle="rgba(20,12,6,0.85)"; x.fillRect(x0+(i%2?40:63),0,2,512); }
    for(let i=0;i<4;i++){ const sx=R()*512, sy=380+R()*80;
      const g=x.createRadialGradient(sx,sy,4,sx,sy,60); g.addColorStop(0,"rgba(30,22,14,0.25)"); g.addColorStop(1,"rgba(30,22,14,0)"); x.fillStyle=g; x.fillRect(sx-60,sy-60,120,120); }
    const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; return t;
  })();
  const panelM=new T.MeshStandardMaterial({map:panelTex, roughness:0.55, metalness:0.0});
  const panel=(x0,x1,z,gap)=>{                                      // a run of it on a north wall, broken round a door
    const runs=gap ? [[x0,gap[0]],[gap[1],x1]] : [[x0,x1]];
    for(const [a,b] of runs){ if(b-a<0.05) continue;
      const L=b-a, hh=CB-FB-0.004, g=new T.PlaneGeometry(L, hh), U=g.attributes.uv;
      for(let i=0;i<U.count;i++) U.setXY(i, (a+U.getX(i)*L)/1.22, U.getY(i)*hh/2.44);
      const m=new T.Mesh(g, panelM); m.position.set((a+b)/2, FB+0.002+hh/2, z+0.012); m.receiveShadow=true; scene.add(m);
      B(L, 0.10, 0.025, (a+b)/2, FB+0.05, z+0.025, "#3b2616"); } };
  panel(IX0, IX1, IZ0);
  panel(XX0, IX0-0.25, XZ0, [AD.x0-0.06, AD.x1+0.06]);
  // conduit along the ceilings to the lights and a junction box; a black iron pipe going through
  tubeE(V3(IX0+0.3, CB-0.03, -178.0), V3(IX1-0.2, CB-0.03, -178.0), 0.012, "#8f9496");
  tubeE(V3(80.9, CB-0.03, -178.0), V3(80.9, CB-0.03, -179.6), 0.012, "#8f9496");
  B(0.12, 0.05, 0.12, 80.9, CB-0.031, -179.6, "#8f9496");
  tubeE(V3(IX0, CB-0.12, -181.3), V3(IX1, CB-0.12, -181.3), 0.03, "#2b2b2c");
  tubeE(V3(XX0+0.2, CB-0.03, -180.4), V3(XX1-0.05, CB-0.03, -180.4), 0.012, "#8f9496");

  /* ---- the poker table: an octagon on a pedestal, felt in a black rail -- */
  const TX=81.0, TZ=-179.5, TY=FB+0.74;
  C(0.32, 0.04, TX, FB+0.02, TZ, "#2a1a10", 8, 0, Math.PI/8);
  C(0.08, 0.66, TX, FB+0.37, TZ, "#3a2416", 10);
  C(0.80, 0.05, TX, TY, TZ, "#4a2c1a", 8, 0, Math.PI/8);
  ent(new T.TorusGeometry(0.735, 0.055, 6, 8), TX, TY+0.045, TZ, "#151515", Math.PI/2, 0, Math.PI/8);
  C(0.70, 0.012, TX, TY+0.031, TZ, "#1f6b3a", 8, 0, Math.PI/8);
  addCol(TX-0.80, TX+0.80, TZ-0.80, TZ+0.80, FB-0.5, FB+0.82);
  // the chips, the cards. A stack is one cylinder and a white rim a hair wider round its side just under
  // its top, so no two caps share a plane; cards in a pair lie half a millimetre apart
  const chipC=["#b3191e","#1f4f9a","#ece8de","#2f7a3c","#1c1c1c"], top=TY+0.038;
  const stack=(x,z,n,c)=>{ const h=n*0.0034; C(0.020, h, x, top+h/2, z, c, 12); C(0.0206, 0.0012, x, top+h-0.0016, z, c==="#ece8de"?"#b3191e":"#f2efe6", 12); };
  const seatA=[], NSEAT=6;
  for(let i=0;i<NSEAT;i++) seatA.push(Math.PI/6+i*Math.PI/3+(R()-0.5)*0.12);
  seatA.forEach((a,i)=>{ const sx=TX+Math.sin(a)*0.55, sz=TZ+Math.cos(a)*0.55;
    for(let k=0;k<3;k++){ const ca=a+(k-1)*0.28; stack(TX+Math.sin(ca)*0.56, TZ+Math.cos(ca)*0.56, 3+((R()*14)|0), chipC[(i+k)%5]); }
    if(i!==4) for(let k=0;k<2;k++) B(0.063, 0.001, 0.088, sx-Math.sin(a)*0.12+Math.cos(a)*(k?0.02:-0.02), top+0.0010+k*0.0016, sz-Math.cos(a)*0.12-Math.sin(a)*(k?0.02:-0.02), "#8b1e24", a+(k?0.15:-0.1)); });
  for(let k=0;k<6;k++) stack(TX-0.08+(k%3)*0.06, TZ+0.10+((k/3)|0)*0.05, 4+((R()*10)|0), chipC[k%5]);          // the pot
  B(0.063, 0.02, 0.088, TX+0.30, top+0.0105, TZ-0.15, "#8b1e24", 0.3);                                            // the deck
  // the board: five cards face up across the middle
  const cardTex=signTex(400,112,(x,W,Hh)=>{ const cards=[["K","♠","#111"],["K","♥","#b3191e"],["7","♦","#b3191e"],["2","♣","#111"],["J","♠","#111"]];
    cards.forEach((c,i)=>{ const ox=i*80; x.fillStyle="#f6f4ee"; x.fillRect(ox+3,3,74,106); x.strokeStyle="#bdb9ae"; x.strokeRect(ox+3,3,74,106);
      x.fillStyle=c[2]; x.font="bold 26px Georgia, serif"; x.textAlign="left"; x.textBaseline="top"; x.fillText(c[0],ox+10,9);
      x.font="38px Georgia, serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(c[1],ox+40,64); }); });
  { const m=new T.Mesh(new T.PlaneGeometry(0.32, 0.088), new T.MeshStandardMaterial({map:cardTex, roughness:0.5, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(TX, top+0.0025, TZ-0.02); m.rotation.set(-Math.PI/2, 0, 0.05); scene.add(m); }
  // what is on the rail: cans, a bottle, the ashtray and the cigar in it
  for(const [a,c] of [[0.6,"#c8a23a"],[1.7,"#c8a23a"],[2.6,"#b9bcbd"],[3.9,"#c8a23a"],[5.1,"#c8a23a"]]){
    const x=TX+Math.sin(a)*0.74, z=TZ+Math.cos(a)*0.74;
    C(0.033, 0.122, x, TY+0.10+0.061, z, c, 12); C(0.034, 0.03, x, TY+0.10+0.07, z, "#9a1c1c", 12); }
  C(0.032, 0.20, TX+Math.sin(4.5)*0.74, TY+0.10+0.10, TZ+Math.cos(4.5)*0.74, "#4a2a10", 10);
  C(0.08, 0.03, TX+0.22, top+0.016, TZ+0.30, "#9fb4b8", 10);
  C(0.009, 0.13, TX+0.22, top+0.036, TZ+0.30, "#5a3a22", 6, 0, 0.6, Math.PI/2-0.15);
  // the green shade over it on its cord, and the bulb in it
  tubeE(V3(TX, CB, TZ), V3(TX, FB+1.80, TZ), 0.006, "#1a1a1a");
  const shade=new T.Mesh(new T.CylinderGeometry(0.10, 0.30, 0.20, 18, 1, true),
    new T.MeshStandardMaterial({color:0x2d5a3a, roughness:0.35, metalness:0.3, side:T.DoubleSide}));
  shade.position.set(TX, FB+1.70, TZ); scene.add(shade);
  push("tube", new T.SphereGeometry(0.06, 12, 8), TX, FB+1.66, TZ, 0, "#ffffff");
  lamp({x:TX, y:FB+1.55, z:TZ, color:0xffd29a, intensity:1.05, dist:7.5, decay:1.4});
  lamp({x:86.2, y:CB-0.25, z:-178.2, color:0xffe2b0, intensity:0.5, dist:6, decay:1.5});
  C(0.035, 0.05, 86.2, CB-0.025, -178.2, "#d8d4c6", 10);                      // the bare bulb by the stair, its pull chain
  push("tube", new T.SphereGeometry(0.035, 10, 8), 86.2, CB-0.08, -178.2, 0, "#ffffff");
  tubeE(V3(86.23, CB-0.05, -178.2), V3(86.23, CB-0.42, -178.2), 0.002, "#b8b4a0");

  /* the chairs, no two alike: folding, kitchen, an office chair gone flat, a stool */
  const chair=(kind, x, z, yaw)=>{
    const s=Math.sin(yaw), c=Math.cos(yaw), L=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];   // local +z is the way the sitter faces; the back is at -z
    const q=(w,h,d,lx,ly,lz,col,rx)=>{ const p=L(lx,lz); B(w,h,d,p[0],FB+ly,p[1],col,yaw,rx||0); };
    if(kind==="fold"){ const G="#7d8286";
      q(0.42,0.03,0.40, 0,0.45,0, "#5d6266");
      for(const sx of [-0.19,0.19]){ q(0.022,0.46,0.022, sx,0.23,0.17, G); q(0.022,0.86,0.022, sx,0.43,-0.18, G, -0.06); }
      q(0.40,0.20,0.025, 0,0.74,-0.20, "#5d6266", -0.06); }
    else if(kind==="kitchen"){ const W="#6b4426";
      q(0.42,0.04,0.40, 0,0.46,0, W);
      for(const [sx,sz] of [[-0.18,0.17],[0.18,0.17],[-0.18,-0.17],[0.18,-0.17]]) q(0.035,0.44,0.035, sx,0.22,sz, W);
      for(const sx of [-0.18,0.18]) q(0.035,0.50,0.035, sx,0.71,-0.18, W);
      for(const y of [0.62,0.80,0.92]) q(0.38,0.04,0.025, 0,y,-0.18, W); }
    else if(kind==="office"){ const K="#1d1d1e";
      q(0.48,0.08,0.46, 0,0.48,0, "#2a2a2c"); q(0.46,0.52,0.07, 0,0.80,-0.22, "#2a2a2c", -0.12);
      q(0.05,0.40,0.05, 0,0.25,0, "#8a8e90");
      for(let k=0;k<5;k++){ const a=k*1.2566, p=L(Math.sin(a)*0.15, Math.cos(a)*0.15); B(0.30,0.03,0.04,p[0],FB+0.06,p[1],K,yaw+a+Math.PI/2); } }
    else { q(0.34,0.04,0.34, 0,0.62,0, "#8a2a22"); for(const [sx,sz] of [[-0.13,0.13],[0.13,0.13],[-0.13,-0.13],[0.13,-0.13]]) q(0.03,0.62,0.03, sx,0.31,sz, "#9a9da0"); q(0.30,0.02,0.02, 0,0.22,0.13,"#9a9da0"); }
  };
  const kinds=["fold","kitchen","office","fold","stool","kitchen"];
  seatA.forEach((a,i)=>{ const r=i===2?1.18:1.02, x=TX+Math.sin(a)*r, z=TZ+Math.cos(a)*r;
    // each faces the table, a little askew; one pushed back and turned, its player gone for a beer
    const yaw=a+Math.PI+(R()-0.5)*0.25+(i===2?0.6:0);
    chair(kinds[i], x, z, yaw);
    addSeat(x, z, FB, a+(i===2?0.6:0), ["A FOLDING CHAIR","A KITCHEN CHAIR","AN OFFICE CHAIR","A FOLDING CHAIR","A STOOL","A KITCHEN CHAIR"][i]); });

  /* ---- in the dug-out: the couch against the far wall, the spool, the set facing it */
  const plaid=(function(){
    const c=cvs(128,128), x=c.getContext("2d");
    x.fillStyle="#7a4a24"; x.fillRect(0,0,128,128);
    for(const [p,w,col] of [[0,22,"rgba(196,140,60,0.55)"],[40,10,"rgba(230,214,170,0.55)"],[70,18,"rgba(60,36,18,0.6)"],[100,6,"rgba(150,40,26,0.6)"]]){
      x.fillStyle=col; x.fillRect(p,0,w,128); x.fillRect(0,p,128,w); }
    const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(3,3); return t;
  })();
  const fab=new T.MeshStandardMaterial({map:plaid, roughness:0.95});
  const CX=74.7, CZ=XZ0+0.46, CW=2.2;
  const cb=(w,h,d,x,y,z)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d), fab); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; scene.add(m); };
  cb(CW, 0.24, 0.86, CX, FB+0.22, CZ);                                   // the base
  for(const k of [-1,0,1]) cb(CW/3-0.03, 0.14, 0.62, CX+k*CW/3, FB+0.41, CZ+0.10);   // three cushions, sagging
  cb(CW, 0.48, 0.22, CX, FB+0.58, XZ0+0.13);                             // the back
  for(const sd of [-1,1]) cb(0.22, 0.36, 0.86, CX+sd*(CW/2-0.10), FB+0.42, CZ+0.01);   // the arms, a shade proud of the base
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.05,0.10,0.05, CX+sx*(CW/2-0.08), FB+0.05, CZ+sz*0.36, "#2a1a10");
  // the afghan thrown over the back, zigzag stripes
  { const afg=signTex(256,128,(x,W,Hh)=>{ const cols=["#c9662a","#e0b24a","#6b8f3a","#8a3a22","#e8dcc0"];
      for(let i=0;i<10;i++){ x.fillStyle=cols[i%5]; x.beginPath(); for(let j=0;j<=16;j++) x.lineTo(j*16, i*13+(j%2?0:8)); for(let j=16;j>=0;j--) x.lineTo(j*16, i*13+13+(j%2?0:8)); x.fill(); } });
    const m=new T.Mesh(new T.PlaneGeometry(0.9, 0.62), new T.MeshStandardMaterial({map:afg, roughness:1.0, side:T.DoubleSide}));
    m.position.set(CX-0.45, FB+0.74, XZ0+0.25); m.rotation.set(-0.5, 0, 0.04); scene.add(m); }
  addCol(CX-CW/2, CX+CW/2, XZ0, XZ0+0.90, FB-0.5, FB+0.55);
  for(const k of [-0.7, 0, 0.7]) addSeat(CX+k, CZ+0.12, FB, Math.PI, "THE COUCH");
  // a cable spool for a coffee table, what is on it
  const SPX=CX, SPZ=XZ0+1.55;
  C(0.46, 0.05, SPX, FB+0.545, SPZ, "#9a7a52", 20); C(0.46, 0.05, SPX, FB+0.025, SPZ, "#8a6a44", 20); C(0.20, 0.47, SPX, FB+0.285, SPZ, "#7a5a3a", 14);
  B(0.24, 0.12, 0.18, SPX-0.15, FB+0.63, SPZ+0.05, "#d8b22a", 0.4);                                      // a bag of chips, fallen over
  B(0.05, 0.02, 0.16, SPX+0.18, FB+0.58, SPZ-0.05, "#1b1b1b", -0.3);                                     // the remote
  C(0.033, 0.122, SPX+0.05, FB+0.631, SPZ-0.20, "#c8a23a"); C(0.07, 0.03, SPX+0.25, FB+0.586, SPZ+0.15, "#9fb4b8", 10);
  addCol(SPX-0.46, SPX+0.46, SPZ-0.46, SPZ+0.46, FB-0.5, FB+0.6);
  // the television: a wood-cased tube set on a cart, rolled out to face the couch, rabbit ears up for nothing
  const TVX=CX, TVZ=SPZ+1.45;
  B(0.80, 0.03, 0.52, TVX, FB+0.62, TVZ, "#3a3c3e"); B(0.80, 0.03, 0.52, TVX, FB+0.18, TVZ, "#3a3c3e");
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ B(0.03, 0.62, 0.03, TVX+sx*0.385, FB+0.36, TVZ+sz*0.245, "#3a3c3e"); C(0.03, 0.04, TVX+sx*0.385, FB+0.03, TVZ+sz*0.245, "#111", 8, 0, 0, Math.PI/2); }
  B(0.70, 0.52, 0.50, TVX, FB+0.90, TVZ, "#5a3a22");
  B(0.62, 0.42, 0.02, TVX+0.03, FB+0.92, TVZ-0.25, "#141414");
  for(let k=0;k<2;k++) C(0.022, 0.02, TVX-0.29, FB+1.02-k*0.10, TVZ-0.26, "#c9c2a8", 10, Math.PI/2);
  tubeE(V3(TVX-0.05, FB+1.16, TVZ), V3(TVX-0.30, FB+1.62, TVZ+0.05), 0.004, "#c6c9ca");
  tubeE(V3(TVX+0.05, FB+1.16, TVZ), V3(TVX+0.34, FB+1.58, TVZ-0.02), 0.004, "#c6c9ca");
  B(0.14, 0.04, 0.10, TVX, FB+1.18, TVZ, "#222");
  addCol(TVX-0.42, TVX+0.42, TVZ-0.27, TVZ+0.27, FB-0.5, FB+1.2);
  { const scr=signTex(256,192,(x,W,Hh)=>{                              // whatever the game is: a green field, a scoreline
      const g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#3a5a7a"); g.addColorStop(0.35,"#2f6b34"); g.addColorStop(1,"#26582a"); x.fillStyle=g; x.fillRect(0,0,W,Hh);
      x.strokeStyle="rgba(255,255,255,0.5)"; x.lineWidth=2; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(20+i*44,70); x.lineTo(-10+i*54,Hh); x.stroke(); }
      for(let i=0;i<14;i++){ x.fillStyle=i%2?"#f0c020":"#e8e8e8"; x.fillRect(30+R()*190, 90+R()*80, 5, 9); }
      x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(0,4,W,24); say(x, "PIT 17  ·  CLE 10   3RD  4:12", W/2, 16, W*0.84, 15, "#fff", "700", "Arial"); });
    const m=new T.MeshBasicMaterial({map:scr, color:0x000000, toneMapped:false});
    const s=new T.Mesh(new T.PlaneGeometry(0.56, 0.38), m); s.position.set(TVX+0.03, FB+0.92, TVZ-0.264); s.rotation.y=Math.PI; scene.add(s);
    HANGOUT.screen=m;
    HANGOUT.tvLamp=lamp({x:TVX, y:FB+1.0, z:TVZ-0.6, color:0x9fb8ff, intensity:0, dist:5, decay:1.6}); }
  addUse(TVX, TVZ-0.75, FB, "TURN THE TV ON", ()=>{ HANGOUT.tvOn=!HANGOUT.tvOn;
    if(typeof AUDIO!=="undefined") AUDIO.blip("tick", TVX, TVZ);
    if(HANGOUT.tvOn) toast("FOURTH QUARTER. SOMEBODY TAPED THE GAME","#cfe0d4"); }, 1.3);
  HANGOUT.tvUse=USES[USES.length-1];
  // a shop light on chains over the couch, and a bare bulb by the door on
  for(const sd of [-0.55,0.55]) tubeE(V3(CX+sd, CB, SPZ+0.4), V3(CX+sd, CB-0.36, SPZ+0.4), 0.003, "#8a8e90");
  B(1.22, 0.06, 0.16, CX, CB-0.39, SPZ+0.4, "#e8e6de"); push("tube", planeGeo(1.16, 0.10, 0), CX, CB-0.424, SPZ+0.4, 0, "#ffffff", Math.PI/2, 0);
  lamp({x:CX, y:CB-0.6, z:SPZ+0.4, color:0xeef2f0, intensity:0.85, dist:7, decay:1.4});
  C(0.035, 0.05, (AD.x0+AD.x1)/2, CB-0.025, XZ0+0.6, "#d8d4c6", 10);
  push("tube", new T.SphereGeometry(0.035, 10, 8), (AD.x0+AD.x1)/2, CB-0.08, XZ0+0.6, 0, "#ffffff");
  lamp({x:(AD.x0+AD.x1)/2, y:CB-0.3, z:XZ0+0.6, color:0xffe2b0, intensity:0.45, dist:5, decay:1.5});

  /* ---- the fridge and the beer: the dug-out's south wall ------------------- */
  const FX=75.7, FZ=XZ1-0.40;                                           // its front faces north, into the room
  B(0.74, 1.62, 0.72, FX, FB+0.81, FZ, "#c9a43a");
  B(0.70, 0.98, 0.02, FX, FB+1.10, FZ-0.37, "#c19c34"); B(0.70, 0.58, 0.02, FX, FB+0.31, FZ-0.37, "#c19c34");
  B(0.04, 0.42, 0.04, FX+0.30, FB+1.05, FZ-0.40, "#c9cbcc"); B(0.04, 0.24, 0.04, FX+0.30, FB+0.48, FZ-0.40, "#c9cbcc");
  for(let k=0;k<5;k++) B(0.05, 0.05, 0.012, FX-0.25+R()*0.35, FB+1.2+R()*0.4, FZ-0.386, ["#b3191e","#1f4f9a","#f2c418","#2f7a3c","#ece8de"][k]);
  pic(0.20, 0.28, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); x.fillStyle="#111"; x.fillRect(0,0,W,22);
    say(x, "BLACK & GOLD · 2026", W/2, 11, W-12, 13, "#f2c418", "700", "Arial");
    ["9/13 @ ATL","9/20 vs SEA","9/27 @ NE","10/4 vs MIN","10/18 BYE","10/25 vs GB","11/1 @ WAS","11/8 vs LAC"].forEach((s,i)=>say(x, s, W/2, 36+i*10, W-16, 9.5, "#222", "500", "Arial")); },
    FX-0.05, FB+1.32, FZ-0.384, Math.PI, false, 80, 112);
  B(0.66, 0.14, 0.28, FX, FB+1.69, FZ+0.05, "#2b2c2e");                                    // a radio on top
  C(0.05, 0.02, FX-0.17, FB+1.69, FZ-0.10, "#888", 12, Math.PI/2); C(0.05, 0.02, FX+0.17, FB+1.69, FZ-0.10, "#888", 12, Math.PI/2);
  addCol(FX-0.38, FX+0.38, FZ-0.42, XZ1, FB-0.5, FB+1.75);
  addUse(FX, FZ-1.1, FB, "OPEN THE FRIDGE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", FX, FZ);
    toast(["ALL ALLEGHENY LAGER. THE LAST ONE HAS “TERRY” ON IT IN MARKER","LAGER, A JAR OF PICKLED EGGS AND HALF A HOAGIE","IT HUMS LIKE IT'S THINKING ABOUT IT"][(Math.random()*3)|0],"#cfe0d4"); }, 1.4);
  for(let k=0;k<5;k++) B(0.40, 0.25, 0.27, FX-0.85+(k%2)*0.02, FB+0.125+k*0.2505, XZ1-0.20-(k%2)*0.03, k===4?"#a8823a":"#b98a3a", (R()-0.5)*0.1);
  B(0.46, 0.28, 0.32, FX-1.40, FB+0.14, XZ1-0.22, "#26467a");
  for(let k=0;k<12;k++) C(0.03, 0.20, FX-1.57+(k%4)*0.11, FB+0.38, XZ1-0.32+((k/4)|0)*0.10, "#4a2a10", 8);
  addCol(FX-1.65, FX-0.62, XZ1-0.40, XZ1, FB-0.5, FB+1.3);

  /* ---- the darts lane: the board on the west wall, regulation height and throw */
  const DZ=-179.6, DY=FB+1.73, DXF=XX0+0.045, R_BOARD=0.225;
  push("cork", boxGeo(0.03, 0.90, 0.90, 0.5), XX0+0.015, DY, DZ, 0, "#ffffff");
  // the board drawn to the regulation radii (18d scores against the same numbers)
  const DB=DART_RINGS;
  const dt=signTex(512,512,(x,W,Hh)=>{ const cx=W/2, cy=Hh/2, k=(W/2)/R_BOARD;
    x.fillStyle="#141414"; x.beginPath(); x.arc(cx,cy,W/2,0,7); x.fill();
    const wedge=(r0,r1,i,col)=>{ const t0=-Math.PI/2+(i-0.5)*Math.PI/10, t1=t0+Math.PI/10; x.fillStyle=col;
      x.beginPath(); x.arc(cx,cy,r1*k,t0,t1); x.arc(cx,cy,r0*k,t1,t0,true); x.closePath(); x.fill(); };
    for(let i=0;i<20;i++){ const dark=i%2===0;
      wedge(DB.outerBull, DB.trebleIn, i, dark?"#1a1a1a":"#efe2c4"); wedge(DB.trebleIn, DB.trebleOut, i, dark?"#c42a1a":"#2f7a3c");
      wedge(DB.trebleOut, DB.doubleIn, i, dark?"#1a1a1a":"#efe2c4"); wedge(DB.doubleIn, DB.doubleOut, i, dark?"#c42a1a":"#2f7a3c"); }
    x.fillStyle="#2f7a3c"; x.beginPath(); x.arc(cx,cy,DB.outerBull*k,0,7); x.fill(); x.fillStyle="#c42a1a"; x.beginPath(); x.arc(cx,cy,DB.bull*k,0,7); x.fill();
    x.strokeStyle="#b8b8b0"; x.lineWidth=1.5; for(const r of [DB.trebleIn,DB.trebleOut,DB.doubleIn,DB.doubleOut,DB.outerBull]){ x.beginPath(); x.arc(cx,cy,r*k,0,7); x.stroke(); }
    for(let i=0;i<20;i++){ const a=-Math.PI/2+(i-0.5)*Math.PI/10; x.beginPath(); x.moveTo(cx+Math.cos(a)*DB.outerBull*k, cy+Math.sin(a)*DB.outerBull*k); x.lineTo(cx+Math.cos(a)*DB.doubleOut*k, cy+Math.sin(a)*DB.doubleOut*k); x.stroke(); }
    x.fillStyle="#e8e4d8"; x.font="bold 26px Arial"; x.textAlign="center"; x.textBaseline="middle";
    DART_ORDER.forEach((n,i)=>{ const a=-Math.PI/2+i*Math.PI/10, rr=(DB.doubleOut+R_BOARD)/2*k; x.fillText(n, cx+Math.cos(a)*rr, cy+Math.sin(a)*rr); }); });
  { const m=new T.Mesh(new T.CircleGeometry(R_BOARD, 64), new T.MeshStandardMaterial({map:dt, roughness:0.8}));
    m.position.set(DXF, DY, DZ); m.rotation.y=Math.PI/2; scene.add(m);
    C(R_BOARD+0.006, 0.04, XX0+0.022, DY, DZ, "#141414", 48, 0, 0, Math.PI/2); }
  // a spot on it from the ceiling, the oche on the floor, the chalkboard the game keeps
  B(0.10, 0.08, 0.10, XX0+0.9, CB-0.04, DZ, "#1d1d1e"); C(0.04, 0.10, XX0+0.86, CB-0.12, DZ, "#1d1d1e", 10, 0, 0, -0.6);
  lamp({x:XX0+0.7, y:CB-0.25, z:DZ, color:0xfff0d8, intensity:0.6, dist:4, decay:1.6});
  const OCHE=DXF+2.37;
  bx("paint", 0.04, 0.004, 0.70, OCHE+0.02, FB+0.008, DZ, 0, 0, "#e2b31c");
  const chalkC=cvs(256,320), chalkTex=setSRGB(new T.CanvasTexture(chalkC));
  { const m=new T.Mesh(new T.PlaneGeometry(0.50, 0.62), new T.MeshStandardMaterial({map:chalkTex, roughness:0.85, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(XX0+0.016, FB+1.62, DZ+0.95); m.rotation.y=Math.PI/2; scene.add(m);
    B(0.012, 0.66, 0.54, XX0+0.006, FB+1.62, DZ+0.95, "#7a5a3a"); }
  HANGOUT.chalk={c:chalkC, tex:chalkTex};
  chalkDraw(chalkC, ["RICH","DALE"], ["301","261","180","140","61"], ["301","241","199","117"], "");
  HANGOUT.dart={x:DXF, y:DY, z:DZ, r:R_BOARD, oche:OCHE, wall:XX0, corkHalf:0.45};
  // three darts left in the board, until a game takes them
  HANGOUT.idleDarts=[];
  { const dg=dartGeometry();
    for(const [dz,dy,ry,rx] of [[0.03,0.05,0.05,0.04],[-0.08,-0.02,-0.06,0.02],[0.11,-0.12,0.08,-0.03]]){
      const m=new T.Mesh(dg, DART_MAT); m.position.set(DXF+0.002, DY+dy, DZ+dz); m.rotation.set(rx, Math.PI/2+ry, 0, "YXZ"); scene.add(m); HANGOUT.idleDarts.push(m); } }
  addUse(OCHE+0.3, DZ, FB, "PLAY DARTS", ()=>{ if(typeof DARTS!=="undefined") DARTS.start(); }, 1.0);

  // steel shelving on the east wall: what lives on it
  { const SX=IX1-0.22, SZ0=-181.45, SZ1=-180.35;
    for(const y of [0.05,0.55,1.05,1.55]) B(0.40, 0.025, SZ1-SZ0, SX, FB+y, (SZ0+SZ1)/2, "#7d8286");
    for(const z of [SZ0, SZ1]) for(const x of [SX-0.19, SX+0.19]) B(0.03, 1.80, 0.03, x, FB+0.90, z, "#6d7276");
    B(0.36, 0.30, 0.42, SX, FB+0.2135, SZ0+0.25, "#b98a58"); pic(0.30,0.10,(x,W,Hh)=>{ x.fillStyle="#b98a58"; x.fillRect(0,0,W,Hh);
      say(x, "XMAS", W/2, Hh/2, W*0.7, Hh*0.62, "#b3191e", "700", MARK); }, SX-0.186, FB+0.26, SZ0+0.25, -Math.PI/2);
    C(0.10, 0.14, SX, FB+0.6335, SZ0+0.70, "#9aa0a2"); C(0.10, 0.14, SX, FB+0.6335, SZ0+0.92, "#9aa0a2");
    ent(new T.SphereGeometry(0.15, 12, 8, 0, Math.PI*2, 0, Math.PI/2), SX, FB+1.0625, SZ0+0.25, "#f2c418");
    C(0.05, 0.36, SX, FB+1.25, SZ0+0.70, "#e8e4d8", 10); C(0.07, 0.06, SX, FB+1.10, SZ0+0.70, "#b3191e", 10);    // a bowling pin
    C(0.06, 0.10, SX, FB+1.1125, SZ0+0.92, "#c8b25a", 10); C(0.05, 0.16, SX, FB+1.24, SZ0+0.92, "#d8c46a", 10);    // a trophy
    C(0.06, 0.16, SX, FB+1.6425, SZ0+0.30, "#bcd4d8", 12); for(let k=0;k<6;k++) C(0.012, 0.004, SX+(R()-0.5)*0.05, FB+1.58+k*0.0125, SZ0+0.30, "#c8a85a", 10);
    pic(0.11,0.05,(x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); say(x, "POT FUND", W/2, Hh/2, W*0.84, Hh*0.6, "#222", "700", "Arial"); },
      SX-0.062, FB+1.64, SZ0+0.30, -Math.PI/2, false, 110, 50);
    addCol(SX-0.21, SX+0.22, SZ0-0.02, SZ1+0.02, FB-0.5, FB+1.8); }
  // a cooler by the table, the heater glowing at it, the dehumidifier in the corner
  B(0.56, 0.34, 0.36, 79.3, FB+0.17, IZ0+0.30, "#c23a2a"); B(0.58, 0.07, 0.38, 79.3, FB+0.375, IZ0+0.30, "#e8e4d8");
  addCol(79.0, 79.6, IZ0+0.10, IZ0+0.50, FB-0.5, FB+0.42);
  B(0.30, 0.52, 0.18, 79.25, FB+0.26, -180.85, "#d8d4c8", 0.5);
  { const g=new T.Mesh(new T.PlaneGeometry(0.22, 0.34), new T.MeshBasicMaterial({color:0xff6a1a, toneMapped:false}));
    g.position.set(79.25+Math.sin(0.5)*0.092, FB+0.30, -180.85+Math.cos(0.5)*0.092); g.rotation.y=0.5; scene.add(g);
    for(let k=0;k<5;k++) B(0.24, 0.008, 0.01, 79.25+Math.sin(0.5)*0.098, FB+0.17+k*0.065, -180.85+Math.cos(0.5)*0.098, "#3a3a3a", 0.5); }
  addCol(79.08, 79.42, -181.02, -180.68, FB-0.5, FB+0.55);
  B(0.36, 0.56, 0.28, IX0+0.22, FB+0.28, IZ1-0.45, "#ece8de"); B(0.30, 0.06, 0.02, IX0+0.22, FB+0.48, IZ1-0.30, "#5d6266");
  addCol(IX0, IX0+0.42, IZ1-0.62, IZ1-0.28, FB-0.5, FB+0.6);
  // braided oval rugs: under the table, and in front of the couch
  { const rt=signTex(256,256,(x,W,Hh)=>{ const cols=["#6a2a1e","#3d2a1e","#8a5a2e","#5a3e2a","#7a3a22","#2e3a2a"];
      for(let i=0;i<24;i++){ x.fillStyle=cols[i%6]; x.beginPath(); x.arc(W/2,Hh/2,W/2-i*5.2,0,7); x.fill(); } });
    for(const [x,z,sx,sz] of [[TX,TZ,1.45,1.10],[CX,SPZ+0.2,1.25,0.95]]){
      const g=new T.CircleGeometry(1, 40); g.scale(sx, sz, 1);
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:rt, roughness:1.0, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
      m.position.set(x, FB+0.010, z); m.rotation.x=-Math.PI/2; m.receiveShadow=true; scene.add(m); } }

  /* ---- what is on the walls ---------------------------------------------- */
  // the neon over the table: a beer nobody outside the county has heard of
  { const nt=signTex(512,160,(x,W,Hh)=>{ x.fillStyle="#000"; x.fillRect(0,0,W,Hh);
      x.shadowColor="#ff3a2a"; x.shadowBlur=16; x.strokeStyle="#ff5a3a"; x.lineWidth=6; x.textAlign="center"; x.textBaseline="middle";
      let s=60; do{ x.font="italic bold "+s+"px 'Brush Script MT', 'Comic Sans MS', cursive"; s-=2; } while(x.measureText("Allegheny").width>W*0.70 && s>20);
      x.strokeText("Allegheny", W/2, 62);
      x.shadowColor="#3a7aff"; x.strokeStyle="#6aa0ff"; x.lineWidth=4; x.font="bold 30px Arial"; x.strokeText("L A G E R", W/2, 120);
      x.beginPath(); x.ellipse(W/2, Hh/2, W/2-12, Hh/2-10, 0, 0, 7); x.stroke(); });
    const m=new T.Mesh(new T.PlaneGeometry(1.15, 0.36), new T.MeshBasicMaterial({map:nt, transparent:true, blending:T.AdditiveBlending, depthWrite:false, toneMapped:false}));
    m.position.set(TX, FB+1.78, IZ0+0.05); scene.add(m);
    B(1.10, 0.30, 0.02, TX, FB+1.78, IZ0+0.025, "#101010"); }
  // a pennant over the couch, the calendar by the stair, the dragway poster over the fridge, the ledger
  pic(0.95, 0.32, (x,W,Hh)=>{ x.fillStyle="#141414"; x.beginPath(); x.moveTo(0,0); x.lineTo(W,Hh/2); x.lineTo(0,Hh); x.closePath(); x.fill();
    x.fillStyle="#f2c418"; x.fillRect(0,0,W*0.12,Hh);
    // the lettering runs down the pennant's taper: fitted into the width it has while the cloth is still tall enough
    say(x, "PITTSBURGH", W*0.45, Hh/2, W*0.52, Hh*0.42, "#f2c418", "900", "'Arial Black', Arial"); },
    CX, FB+1.62, XZ0+0.03, 0, true);
  pic(0.42, 0.64, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh);
    const g=x.createLinearGradient(0,20,0,Hh*0.55); g.addColorStop(0,"#d9772a"); g.addColorStop(1,"#7a4a1e"); x.fillStyle=g; x.fillRect(10,10,W-20,Hh*0.52);
    x.fillStyle="#3a2412"; x.beginPath(); x.ellipse(W*0.5,Hh*0.38,W*0.16,Hh*0.07,0,0,7); x.fill(); x.fillRect(W*0.40,Hh*0.40,6,Hh*0.13); x.fillRect(W*0.58,Hh*0.40,6,Hh*0.13);
    x.beginPath(); x.ellipse(W*0.68,Hh*0.30,W*0.05,Hh*0.035,0.4,0,7); x.fill(); x.strokeStyle="#3a2412"; x.lineWidth=3; x.beginPath(); x.moveTo(W*0.70,Hh*0.28); x.lineTo(W*0.66,Hh*0.18); x.moveTo(W*0.72,Hh*0.28); x.lineTo(W*0.78,Hh*0.19); x.stroke();
    say(x, "OCTOBER 2026", W/2, Hh*0.60, W*0.84, 26, "#222", "700", "Arial");
    x.font="11px Arial"; x.textAlign="center"; x.textBaseline="middle";
    for(let r=0;r<5;r++) for(let c=0;c<7;c++){ const d=r*7+c-3, cw=(W-28)/7, chh=(Hh*0.25)/5, ox=14+c*cw, oy=Hh*0.65+r*chh;
      if(d>0 && d<=31){ x.strokeStyle="#bbb"; x.strokeRect(ox, oy, cw, chh); x.fillStyle="#333"; x.fillText(d, ox+cw/2, oy+chh/2); } }
    say(x, "WOLFE'S FEED & HARDWARE · TIOGA, PA", W/2, Hh-14, W*0.84, 12, "#222", "700", "Arial"); }, 85.2, FB+1.35, WZ0-0.012, Math.PI);
  pic(0.56, 0.78, (x,W,Hh)=>{ x.fillStyle="#1d1a2e"; x.fillRect(0,0,W,Hh); const g=x.createLinearGradient(0,0,0,Hh*0.6); g.addColorStop(0,"#e8582a"); g.addColorStop(1,"#f2c418");
    x.fillStyle=g; x.fillRect(0,Hh*0.08,W,Hh*0.5); x.fillStyle="#1d1a2e"; x.beginPath(); x.moveTo(W*0.08,Hh*0.5); x.lineTo(W*0.25,Hh*0.40); x.lineTo(W*0.62,Hh*0.38); x.lineTo(W*0.80,Hh*0.44); x.lineTo(W*0.94,Hh*0.47); x.lineTo(W*0.94,Hh*0.53); x.lineTo(W*0.08,Hh*0.55); x.fill();
    for(const wx of [0.25,0.78]){ x.beginPath(); x.arc(W*wx,Hh*0.55,W*0.07,0,7); x.fill(); }
    say(x, "SAT NITE", W/2, Hh*0.69, W*0.84, 42, "#f4f0e2", "400", "Impact, 'Arial Black'");
    say(x, "MUSKRAT FLATS DRAGWAY", W/2, Hh*0.80, W*0.86, 22, "#f4f0e2", "400", "Impact, Arial");
    say(x, "GATES 5 PM · RAIN OR SHINE · 1987", W/2, Hh*0.89, W*0.86, 14, "#f4f0e2", "500", "Arial"); },
    FX-1.0, FB+1.72, XZ1-0.012, Math.PI);
  pic(0.90, 0.62, (x,W,Hh)=>{ x.fillStyle="#f7f7f2"; x.fillRect(0,0,W,Hh); x.strokeStyle="#9a9da0"; x.lineWidth=10; x.strokeRect(0,0,W,Hh);
    say(x, "WHO OWES WHO", W*0.36, 36, W*0.62, 26, "#1f3f9a", "700", MARK);
    [["TERRY","$14"],["DALE","$6"],["RICH","PAID"],["BIG MIKE","$31 (!!)"],["SUPERVISOR","WHO?"]].forEach((r,i)=>{
      say(x, r[0], W*0.30, 72+i*26, W*0.46, 19, "#222", "500", MARK); say(x, r[1], W*0.76, 72+i*26, W*0.34, 19, "#222", "500", MARK); });
    x.strokeStyle="#c42a1a"; x.lineWidth=3; x.beginPath(); x.moveTo(26,124); x.lineTo(W-40,116); x.stroke();
    say(x, "FRI = GAME NIGHT", W/2, Hh-44, W*0.86, 16, "#c42a1a", "700", MARK);
    say(x, "BRING CHIPS (THE FOOD KIND)", W/2, Hh-22, W*0.86, 16, "#c42a1a", "700", MARK); },
    IX1-0.012, FB+1.50, -178.65, -Math.PI/2);
  addUse(IX1-0.9, -178.65, FB, "READ THE BOARD", ()=>toast("TERRY OWES FOURTEEN. BIG MIKE OWES THIRTY-ONE, UNDERLINED","#cfe0d4"), 1.4);
  // hand-lettered cardboard, over the way in from the stair, by the top of it, and on the corridor door
  pic(1.0, 0.24, (x,W,Hh)=>{ x.fillStyle="#b98a58"; x.fillRect(0,0,W,Hh);
    say(x, "WHAT HAPPENS IN THE GEN HOUSE", W/2, Hh*0.34, W*0.88, Hh*0.30, "#1d1b19", "700", MARK);
    say(x, "STAYS IN THE GEN HOUSE", W/2, Hh*0.73, W*0.70, Hh*0.28, "#1d1b19", "700", MARK); },
    (SX1+IX1)/2, CB-0.13, P.z0-0.006, Math.PI, false, 400, 96);
  pic(0.55, 0.28, (x,W,Hh)=>{ x.fillStyle="#c49a64"; x.fillRect(0,0,W,Hh);
    say(x, "NO SUPERVISORS", W/2, Hh*0.36, W*0.86, Hh*0.34, "#1d1b19", "700", MARK);
    say(x, "PAST THIS POINT", W/2, Hh*0.74, W*0.70, Hh*0.26, "#1d1b19", "500", MARK); },
    83.55, FY+1.55, WZ1+0.012, 0);
  pic(0.42, 0.20, (x,W,Hh)=>{ x.fillStyle="#d8cfa8"; x.fillRect(0,0,W,Hh);
    say(x, "← ARCADE", W/2, Hh*0.36, W*0.80, Hh*0.36, "#b3191e", "700", MARK);
    say(x, "(TOKENS IN THE JAR)", W/2, Hh*0.74, W*0.84, Hh*0.22, "#1d1b19", "500", MARK); },
    (AD.x0+AD.x1)/2+0.80, FB+1.60, XZ0+0.018, 0, false, 168, 80);

  /* the lights along the ceilings: a string of big old bulbs, swagged hook to hook, a few gone */
  { const pts=[], bulbs=[];
    for(const [x0,x1,z] of [[IX0+0.35, IX1-0.35, IZ0+0.22],[IX0+0.35, 81.9, WZ0-0.18],[XX0+0.35, XX1-0.35, XZ0+0.22],[XX0+0.35, XX1-0.35, XZ1-0.22]]){
      const n=Math.round((x1-x0)/1.4);
      for(let i=0;i<n;i++){ const a=x0+(x1-x0)*i/n, b=x0+(x1-x0)*(i+1)/n;
        for(let k=0;k<=8;k++){ const t=k/8, x=lerp(a,b,t), y=CB-0.05-Math.sin(Math.PI*t)*0.16; pts.push(V3(x,y,z));
          if(k%2===1) bulbs.push([x,y-0.035,z]); }
        B(0.02,0.03,0.02,a,CB-0.02,z,"#3a3a3a"); } }
    for(let i=1;i<pts.length;i++) if(pts[i].distanceTo(pts[i-1])<0.3) tubeE(pts[i-1], pts[i], 0.003, "#1e2a1e");
    const cols=[0xff3a2a,0x3aff5a,0x3a6aff,0xffaa22,0xfff2d0], mats=cols.map(c=>new T.MeshBasicMaterial({color:c, toneMapped:false}));
    const dead=new T.MeshStandardMaterial({color:0x3a3a3a, roughness:0.4});
    const geo=new T.SphereGeometry(0.022, 8, 6); geo.scale(1,1.35,1);
    bulbs.forEach((b,i)=>{ const m=new T.Mesh(geo, i%11===7?dead:mats[i%5]); m.position.set(b[0],b[1],b[2]); scene.add(m); }); }

  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  addZone(IX0, IX1, IZ0, IZ1, FB-0.5, CB, "THE BASEMENT", true);
  addZone(XX0, IX0, XZ0, XZ1, FB-0.5, CB, "THE BASEMENT", true);
  // below the ground: the rooms, and the stairwell from a little above the bottom of the slab
  addBuried(IX0, IX1, IZ0, IZ1, FB-0.5, CB+0.05, 0);
  addBuried(XX0, IX0, XZ0, XZ1, FB-0.5, CB+0.05, 0);
  addBuried(P.x0, P.x1, P.z0, P.z1, FB-0.5, FY-0.2, 0);
  HANGOUT.room={x0:XX0, x1:IX1, z0:XZ0, z1:IZ1, y:FB, ceil:CB};
})();
function updateHangout(){
  const H=HANGOUT; if(!H.screen) return;
  const on=H.tvOn && GRID.bldg>0.1;
  H.screen.color.setScalar(on ? 0.85+0.15*Math.random() : 0.0);
  H.tvLamp.intensity = on ? 0.30+0.08*Math.random() : 0;
  if(H.tvUse) H.tvUse.label = H.tvOn ? "TURN THE TV OFF" : "TURN THE TV ON";
}
