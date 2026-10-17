"use strict";
/* REST AREA · 12b-hangout.js
   under the generator house: the stair down to the room the crew keeps
   there, and everything in it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12b · THE ROOM UNDER THE GENERATOR HOUSE
   The generator house was poured over a cellar, and nobody from the
   district has been down it in years. Inside the door, to the right, a
   plain grey door in a block partition; behind it a concrete stair with
   yellow nosings goes down along the south wall, and at the bottom, round
   the corner, the crew's room: walnut panelling somebody put up in the
   seventies, an octagonal poker table under a green shade with a hand
   still on it, mismatched chairs, a plaid couch facing a television on a
   cart, a cable spool for a coffee table, a harvest-gold fridge full of
   lager, a dartboard, a neon sign, Christmas lights along the ceiling all
   year, and the ledger of who owes who. The stair, the walls and the
   floor are real; the room is a VOID (06) under the slab, the slab and
   the stone and the ground are cut where the stair comes through
   (00 GEN_PIT, 04, 12).
   ---------------------------------------------------------------------- */
const HANGOUT={tvOn:false, tv:null, tvLamp:null, screen:null};
(function hangout(){
  const H={x0:77, x1:87, z0:-182, z1:-176}, T2=0.25, FY=SUB_G+0.15, FB=FY-2.65, CB=FY-0.40;
  const IX0=H.x0+T2, IX1=H.x1-T2, IZ0=H.z0+T2, IZ1=H.z1-T2;        // the room's inside faces, the house's own
  const P=GEN_PIT, SX1=85.7, NS=12, RISE=(FY-FB)/(NS+1), RUN=(SX1-P.x0)/NS;
  const WZ0=P.z0-0.15, WZ1=P.z0;                                   // the stair's wall on the room side
  const WX0=82.05, WX1=82.20;                                      // and its end wall, where the door is
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

  /* ---- the stair --------------------------------------------------------- */
  // the walls: the house's own carried down to the cellar floor, the stair's wall on the room side, its end wall
  wallBox("block", H.x0, IX0, H.z0, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", IX1, H.x1, H.z0, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", IX0, IX1, H.z0, IZ0, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", IX0, IX1, IZ1, H.z1, FB-0.1, FY-0.6, WALL, 0.6, FB);
  wallBox("block", WX0, SX1, WZ0, WZ1, FB-0.1, CB, WALL, 0.6, FB);
  wallBox("block", WX0, WX1, WZ0, IZ1, FB-0.1, CB, WALL, 0.6, FB);
  // up in the generator house: the partition round the top of it, and the door in its end
  const DZ0=-177.24, DZ1=-176.30, DHEAD=FY+2.08;
  wallBox("block", WX0, IX1, WZ0, WZ1, FY-0.4, FY+3.0, HOUSE, 0.6, FY-0.4);
  wallBox("block", WX0, WX1, WZ0, DZ0, FY-0.4, FY+3.0, HOUSE, 0.6, FY-0.4);
  wallBox("block", WX0, WX1, DZ1, IZ1, FY-0.4, FY+3.0, HOUSE, 0.6, FY-0.4);
  wallBox("block", WX0, WX1, DZ0, DZ1, DHEAD, FY+3.0, HOUSE, 0.6, FY-0.4);
  for(const z of [DZ0-0.025, DZ1+0.025]) B(0.20, DHEAD-FY, 0.05, (WX0+WX1)/2, FY+(DHEAD-FY)/2, z, "#6e7474");
  B(0.21, 0.05, DZ1-DZ0+0.11, (WX0+WX1)/2, DHEAD+0.025, (DZ0+DZ1)/2, "#6e7474");
  makeDoor(XF((WX0+WX1)/2, DZ0+0.03, -Math.PI/2), 0, FY+0.02, 0, "THE BASEMENT", true, 0, "closet", 0x6f7a72);
  // the treads: solid concrete to the floor, a yellow nosing on each, and where your feet go
  for(let k=1;k<=NS;k++){
    const xa=P.x0+(k-1)*RUN, xb=xa+RUN, y=FY-k*RISE;
    bx("concrete", RUN, y-FB, P.z1-P.z0-0.004, (xa+xb)/2, (y+FB)/2, (P.z0+P.z1)/2, 0.5, 0, "#a8a49a");
    bx("paint", 0.05, 0.004, P.z1-P.z0-0.006, xa+0.025, y+0.002, (P.z0+P.z1)/2, 0, 0, "#e2b31c");
    addFlat(xa, xb, P.z0, P.z1, y);
  }
  bx("paint", 0.05, 0.004, P.z1-P.z0-0.006, P.x0-0.025, FY+0.006, (P.z0+P.z1)/2, 0, 0, "#e2b31c");
  // the rails: black pipe on brackets, down both sides
  for(const z of [P.z1-0.07, P.z0+0.07]){
    const a=V3(P.x0-0.25, FY+0.92, z), b=V3(SX1+0.10, FB+RISE+0.92-0.05, z);
    tubeE(a, b, 0.021, "#2a2c2e");
    for(const t of [0.08, 0.5, 0.92]){ const p=a.clone().lerp(b,t); tubeE(p, V3(p.x, p.y-0.07, z+(z>P.z0+0.5?0.06:-0.06)), 0.012, "#2a2c2e"); }
  }
  // where the stair lets you off: the cellar floor everywhere under the slab
  addVoid(IX0, IX1, IZ0, IZ1, FB-3, FY-0.05, FB);

  /* ---- the room: floor, ceiling, panelling ------------------------------- */
  floorAt("concrete", IX0, IX1, IZ0, IZ1, FB+0.004, "#7c877a", 0.5);
  ceilAt("plaster", IX0, IX1, IZ0, WZ0, CB-0.004, "#cdcac2", 0.5);
  ceilAt("plaster", SX1, IX1, WZ0, P.z0, CB-0.004, "#cdcac2", 0.5);
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
  { const L=IX1-IX0, Hh=CB-FB-0.004, g=new T.PlaneGeometry(L, Hh), U=g.attributes.uv;
    for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*L/1.22, U.getY(i)*Hh/2.44);
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:panelTex, roughness:0.55, metalness:0.0}));
    m.position.set((IX0+IX1)/2, FB+0.002+Hh/2, IZ0+0.012); m.receiveShadow=true; scene.add(m); }
  B(IX1-IX0, 0.10, 0.025, (IX0+IX1)/2, FB+0.05, IZ0+0.025, "#3b2616");
  // conduit along the ceiling to the light and a junction box; a black iron pipe going through
  tubeE(V3(IX0+0.3, CB-0.03, -178.0), V3(IX1-0.2, CB-0.03, -178.0), 0.012, "#8f9496");
  tubeE(V3(80.9, CB-0.03, -178.0), V3(80.9, CB-0.03, -179.6), 0.012, "#8f9496");
  B(0.12, 0.05, 0.12, 80.9, CB-0.03, -179.6, "#8f9496");
  tubeE(V3(IX0, CB-0.12, -181.3), V3(IX1, CB-0.12, -181.3), 0.03, "#2b2b2c");

  /* ---- the poker table: an octagon on a pedestal, felt in a black rail -- */
  const TX=80.9, TZ=-179.6, TY=FB+0.74;
  C(0.32, 0.04, TX, FB+0.02, TZ, "#2a1a10", 8, 0, Math.PI/8);
  C(0.08, 0.66, TX, FB+0.37, TZ, "#3a2416", 10);
  C(0.80, 0.05, TX, TY, TZ, "#4a2c1a", 8, 0, Math.PI/8);
  ent(new T.TorusGeometry(0.735, 0.055, 6, 8), TX, TY+0.045, TZ, "#151515", Math.PI/2, 0, Math.PI/8);
  C(0.70, 0.012, TX, TY+0.031, TZ, "#1f6b3a", 8, 0, Math.PI/8);
  addCol(TX-0.80, TX+0.80, TZ-0.80, TZ+0.80, FB-0.5, FB+0.82);
  // the felt's own colour, the dealer's line, the chips and the cards
  const chipC=["#b3191e","#1f4f9a","#ece8de","#2f7a3c","#1c1c1c"], top=TY+0.038;
  const stack=(x,z,n,c)=>{ C(0.02, n*0.0034, x, top+n*0.0017, z, c, 12); C(0.0205, 0.002, x, top+n*0.0034-0.001, z, "#f2efe6", 12); };
  const seatA=[], NSEAT=6;
  for(let i=0;i<NSEAT;i++) seatA.push(Math.PI/6+i*Math.PI/3+(R()-0.5)*0.12);
  seatA.forEach((a,i)=>{ const sx=TX+Math.sin(a)*0.55, sz=TZ+Math.cos(a)*0.55;
    for(let k=0;k<3;k++){ const ca=a+(k-1)*0.28; stack(TX+Math.sin(ca)*0.56, TZ+Math.cos(ca)*0.56, 3+((R()*14)|0), chipC[(i+k)%5]); }
    if(i!==4) for(let k=0;k<2;k++) B(0.063, 0.0012, 0.088, sx-Math.sin(a)*0.12+Math.cos(a)*(k?0.02:-0.02), top+0.001+k*0.0012, sz-Math.cos(a)*0.12-Math.sin(a)*(k?0.02:-0.02), "#8b1e24", a+(k?0.15:-0.1)); });
  for(let k=0;k<6;k++) stack(TX-0.08+(k%3)*0.06, TZ+0.10+((k/3)|0)*0.05, 4+((R()*10)|0), chipC[k%5]);          // the pot
  B(0.063, 0.02, 0.088, TX+0.30, top+0.01, TZ-0.15, "#8b1e24", 0.3);                                              // the deck
  // the board: five cards face up across the middle
  const cardTex=signTex(400,112,(x,W,Hh)=>{ const cards=[["K","♠","#111"],["K","♥","#b3191e"],["7","♦","#b3191e"],["2","♣","#111"],["J","♠","#111"]];
    cards.forEach((c,i)=>{ const ox=i*80; x.fillStyle="#f6f4ee"; x.fillRect(ox+2,2,76,108); x.strokeStyle="#bdb9ae"; x.strokeRect(ox+2,2,76,108);
      x.fillStyle=c[2]; x.font="bold 30px Georgia, serif"; x.textAlign="left"; x.textBaseline="top"; x.fillText(c[0],ox+8,6);
      x.font="40px Georgia, serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(c[1],ox+40,64); }); });
  { const m=new T.Mesh(new T.PlaneGeometry(0.32, 0.088), new T.MeshStandardMaterial({map:cardTex, roughness:0.5, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(TX, top+0.002, TZ-0.02); m.rotation.set(-Math.PI/2, 0, 0.05); scene.add(m); }
  // what is on the rail: cans, a bottle, the ashtray and the cigar in it
  for(const [a,c] of [[0.6,"#c8a23a"],[1.7,"#c8a23a"],[2.6,"#b9bcbd"],[3.9,"#c8a23a"],[5.1,"#c8a23a"]]){
    const x=TX+Math.sin(a)*0.74, z=TZ+Math.cos(a)*0.74;
    C(0.033, 0.122, x, TY+0.10+0.061, z, c, 12); C(0.034, 0.03, x, TY+0.10+0.07, z, "#9a1c1c", 12); }
  C(0.032, 0.20, TX+Math.sin(4.5)*0.74, TY+0.10+0.10, TZ+Math.cos(4.5)*0.74, "#4a2a10", 10);
  C(0.08, 0.03, TX+0.22, top+0.015, TZ+0.30, "#9fb4b8", 10);
  C(0.009, 0.13, TX+0.22, top+0.035, TZ+0.30, "#5a3a22", 6, 0, 0.6, Math.PI/2-0.15);
  // the green shade over it on its cord, and the bulb in it
  tubeE(V3(TX, CB, TZ), V3(TX, FB+1.80, TZ), 0.006, "#1a1a1a");
  const shade=new T.Mesh(new T.CylinderGeometry(0.10, 0.30, 0.20, 18, 1, true),
    new T.MeshStandardMaterial({color:0x2d5a3a, roughness:0.35, metalness:0.3, side:T.DoubleSide}));
  shade.position.set(TX, FB+1.70, TZ); scene.add(shade);
  push("tube", new T.SphereGeometry(0.06, 12, 8), TX, FB+1.66, TZ, 0, "#ffffff");
  const VOL=[IX0, IX1, IZ0, IZ1, FB-0.5, CB+0.3];
  LAMPS.push({x:TX, y:FB+1.55, z:TZ, color:0xffd29a, intensity:1.05, dist:7.5, decay:1.4, indoor:true, circ:"bldg", vol:VOL});
  LAMPS.push({x:86.2, y:CB-0.25, z:-178.2, color:0xffe2b0, intensity:0.5, dist:6, decay:1.5, indoor:true, circ:"bldg", vol:VOL});
  C(0.035, 0.05, 86.2, CB-0.025, -178.2, "#d8d4c6", 10);                      // the bare bulb by the stair, its pull chain
  push("tube", new T.SphereGeometry(0.035, 10, 8), 86.2, CB-0.08, -178.2, 0, "#ffffff");
  tubeE(V3(86.23, CB-0.05, -178.2), V3(86.23, CB-0.42, -178.2), 0.002, "#b8b4a0");

  /* the chairs, no two alike: folding, kitchen, an office chair gone flat, a stool */
  const chair=(kind, x, z, yaw)=>{
    const s=Math.sin(yaw), c=Math.cos(yaw), L=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];   // local +z is where the sitter faces... away from: the back is at -z
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

  /* ---- the couch, the spool, the television ------------------------------ */
  const plaid=(function(){
    const c=cvs(128,128), x=c.getContext("2d");
    x.fillStyle="#7a4a24"; x.fillRect(0,0,128,128);
    for(const [p,w,col] of [[0,22,"rgba(196,140,60,0.55)"],[40,10,"rgba(230,214,170,0.55)"],[70,18,"rgba(60,36,18,0.6)"],[100,6,"rgba(150,40,26,0.6)"]]){
      x.fillStyle=col; x.fillRect(p,0,w,128); x.fillRect(0,p,128,w); }
    const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(3,3); return t;
  })();
  const fab=new T.MeshStandardMaterial({map:plaid, roughness:0.95});
  const CX=84.4, CZ=IZ0+0.46, CW=2.2;
  const cb=(w,h,d,x,y,z)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d), fab); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; scene.add(m); };
  cb(CW, 0.24, 0.86, CX, FB+0.22, CZ);                                   // the base
  for(const k of [-1,0,1]) cb(CW/3-0.03, 0.14, 0.62, CX+k*CW/3, FB+0.41, CZ+0.10);   // three cushions, sagging
  cb(CW, 0.48, 0.22, CX, FB+0.58, IZ0+0.13);                             // the back
  for(const sd of [-1,1]) cb(0.20, 0.36, 0.86, CX+sd*(CW/2-0.10), FB+0.42, CZ);   // the arms
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) B(0.05,0.10,0.05, CX+sx*(CW/2-0.08), FB+0.05, CZ+sz*0.36, "#2a1a10");
  // the afghan thrown over the back, zigzag stripes
  { const afg=signTex(256,128,(x,W,Hh)=>{ const cols=["#c9662a","#e0b24a","#6b8f3a","#8a3a22","#e8dcc0"];
      for(let i=0;i<10;i++){ x.fillStyle=cols[i%5]; x.beginPath(); for(let j=0;j<=16;j++) x.lineTo(j*16, i*13+(j%2?0:8)); for(let j=16;j>=0;j--) x.lineTo(j*16, i*13+13+(j%2?0:8)); x.fill(); } });
    const m=new T.Mesh(new T.PlaneGeometry(0.9, 0.62), new T.MeshStandardMaterial({map:afg, roughness:1.0, side:T.DoubleSide}));
    m.position.set(CX-0.45, FB+0.74, IZ0+0.25); m.rotation.set(-0.5, 0, 0.04); scene.add(m); }
  addCol(CX-CW/2, CX+CW/2, IZ0, IZ0+0.90, FB-0.5, FB+0.55);
  for(const k of [-0.7, 0, 0.7]) addSeat(CX+k, CZ+0.12, FB, Math.PI, "THE COUCH");
  // a cable spool for a coffee table, what is on it
  const SPX=84.4, SPZ=-180.25;
  C(0.46, 0.05, SPX, FB+0.545, SPZ, "#9a7a52", 20); C(0.46, 0.05, SPX, FB+0.025, SPZ, "#8a6a44", 20); C(0.20, 0.47, SPX, FB+0.285, SPZ, "#7a5a3a", 14);
  B(0.24, 0.12, 0.18, SPX-0.15, FB+0.63, SPZ+0.05, "#d8b22a", 0.4);                                      // a bag of chips, fallen over
  B(0.05, 0.02, 0.16, SPX+0.18, FB+0.58, SPZ-0.05, "#1b1b1b", -0.3);                                     // the remote
  C(0.033, 0.122, SPX+0.05, FB+0.63, SPZ-0.20, "#c8a23a"); C(0.07, 0.03, SPX+0.25, FB+0.585, SPZ+0.15, "#9fb4b8", 10);
  addCol(SPX-0.46, SPX+0.46, SPZ-0.46, SPZ+0.46, FB-0.5, FB+0.6);
  // the television: a wood-cased tube set on a cart against the stair wall, rabbit ears up for nothing
  const TVX=84.4, TVZ=WZ0-0.30;
  B(0.80, 0.03, 0.52, TVX, FB+0.62, TVZ, "#3a3c3e"); B(0.80, 0.03, 0.52, TVX, FB+0.18, TVZ, "#3a3c3e");
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ B(0.03, 0.62, 0.03, TVX+sx*0.385, FB+0.36, TVZ+sz*0.245, "#3a3c3e"); C(0.03, 0.04, TVX+sx*0.385, FB+0.03, TVZ+sz*0.245, "#111", 8, 0, 0, Math.PI/2); }
  B(0.70, 0.52, 0.50, TVX, FB+0.90, TVZ, "#5a3a22");
  B(0.62, 0.42, 0.02, TVX-0.03, FB+0.92, TVZ-0.25, "#141414");
  for(let k=0;k<2;k++) C(0.022, 0.02, TVX+0.29, FB+1.02-k*0.10, TVZ-0.26, "#c9c2a8", 10, Math.PI/2);
  tubeE(V3(TVX-0.05, FB+1.16, TVZ), V3(TVX-0.30, FB+1.62, TVZ+0.05), 0.004, "#c6c9ca");
  tubeE(V3(TVX+0.05, FB+1.16, TVZ), V3(TVX+0.34, FB+1.58, TVZ-0.02), 0.004, "#c6c9ca");
  B(0.14, 0.04, 0.10, TVX, FB+1.18, TVZ, "#222");
  addCol(TVX-0.42, TVX+0.42, TVZ-0.27, WZ0, FB-0.5, FB+1.2);
  { const scr=signTex(256,192,(x,W,Hh)=>{                              // whatever the game is: a green field, a scoreline
      const g=x.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#3a5a7a"); g.addColorStop(0.35,"#2f6b34"); g.addColorStop(1,"#26582a"); x.fillStyle=g; x.fillRect(0,0,W,Hh);
      x.strokeStyle="rgba(255,255,255,0.5)"; x.lineWidth=2; for(let i=0;i<6;i++){ x.beginPath(); x.moveTo(20+i*44,70); x.lineTo(-10+i*54,Hh); x.stroke(); }
      for(let i=0;i<14;i++){ x.fillStyle=i%2?"#f0c020":"#e8e8e8"; x.fillRect(30+R()*190, 90+R()*80, 5, 9); }
      x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(0,4,W,22); x.fillStyle="#fff"; x.font="bold 14px Arial"; x.fillText("PIT 17  ·  CLE 10   3RD  4:12", 12, 20); });
    const m=new T.MeshBasicMaterial({map:scr, color:0x000000, toneMapped:false});
    const s=new T.Mesh(new T.PlaneGeometry(0.56, 0.38), m); s.position.set(TVX-0.03, FB+0.92, TVZ-0.262); s.rotation.y=Math.PI; scene.add(s);
    HANGOUT.screen=m;
    HANGOUT.tvLamp={x:TVX, y:FB+1.0, z:TVZ-0.6, color:0x9fb8ff, intensity:0, dist:5, decay:1.6, indoor:true, circ:"bldg", vol:VOL};
    LAMPS.push(HANGOUT.tvLamp); }
  addUse(TVX, TVZ-0.75, FB, "TURN THE TV ON", ()=>{ HANGOUT.tvOn=!HANGOUT.tvOn;
    if(typeof AUDIO!=="undefined") AUDIO.blip("tick", TVX, TVZ);
    if(HANGOUT.tvOn) toast("FOURTH QUARTER. SOMEBODY TAPED THE GAME","#cfe0d4"); }, 1.3);
  HANGOUT.tvUse=USES[USES.length-1];

  /* ---- the fridge, the beer, the dartboard, the shelf --------------------- */
  const FX0=IX0+0.02, FZ0=IZ0+0.04;
  B(0.74, 1.62, 0.72, FX0+0.37, FB+0.81, FZ0+0.36, "#c9a43a");
  B(0.02, 0.98, 0.70, FX0+0.745, FB+1.10, FZ0+0.36, "#c19c34"); B(0.02, 0.58, 0.70, FX0+0.745, FB+0.31, FZ0+0.36, "#c19c34");
  B(0.04, 0.42, 0.04, FX0+0.77, FB+1.05, FZ0+0.66, "#c9cbcc"); B(0.04, 0.24, 0.04, FX0+0.77, FB+0.48, FZ0+0.66, "#c9cbcc");
  for(let k=0;k<5;k++) B(0.012, 0.05, 0.05, FX0+0.76, FB+1.2+R()*0.4, FZ0+0.15+R()*0.4, ["#b3191e","#1f4f9a","#f2c418","#2f7a3c","#ece8de"][k]);
  pic(0.20, 0.28, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); x.fillStyle="#111"; x.fillRect(0,0,W,22);
    x.fillStyle="#f2c418"; x.font="bold 14px Arial"; x.textAlign="center"; x.fillText("BLACK & GOLD · 2026", W/2, 16);
    x.fillStyle="#222"; x.font="11px Arial"; x.textAlign="left"; ["9/13 @ ATL","9/20 vs SEA","9/27 @ NE","10/4 vs MIN","10/18 BYE","10/25 vs GB","11/1 @ WAS","11/8 vs LAC"].forEach((s,i)=>x.fillText(s,10,42+i*12)); },
    FX0+0.758, FB+1.32, FZ0+0.42, Math.PI/2, false, 80, 112);
  B(0.66, 0.14, 0.28, FX0+0.37, FB+1.69, FZ0+0.30, "#2b2c2e");                                    // a radio on top
  C(0.05, 0.02, FX0+0.20, FB+1.69, FZ0+0.15, "#888", 12, Math.PI/2); C(0.05, 0.02, FX0+0.54, FB+1.69, FZ0+0.15, "#888", 12, Math.PI/2);
  addCol(FX0, FX0+0.80, FZ0-0.04, FZ0+0.74, FB-0.5, FB+1.75);
  addUse(FX0+1.2, FZ0+0.36, FB, "OPEN THE FRIDGE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("clunk", FX0, FZ0);
    toast(["ALL ALLEGHENY LAGER. THE LAST ONE HAS “TERRY” ON IT IN MARKER","LAGER, A JAR OF PICKLED EGGS AND HALF A HOAGIE","IT HUMS LIKE IT'S THINKING ABOUT IT"][(Math.random()*3)|0],"#cfe0d4"); }, 1.4);
  // cases of it by the fridge, and the empties
  for(let k=0;k<5;k++) B(0.40, 0.25, 0.27, FX0+0.25+(k%2)*0.02, FB+0.125+k*0.25, FZ0+1.00+(k%2)*0.03, k===4?"#a8823a":"#b98a3a", (R()-0.5)*0.1);
  B(0.46, 0.28, 0.32, FX0+0.30, FB+0.14, FZ0+1.40, "#26467a");
  for(let k=0;k<12;k++) C(0.03, 0.20, FX0+0.13+(k%4)*0.11, FB+0.30, FZ0+1.30+((k/4)|0)*0.10, "#4a2a10", 8);
  addCol(FX0, FX0+0.56, FZ0+0.84, FZ0+1.58, FB-0.5, FB+1.3);
  // the dartboard on its corkboard, the line on the floor, the chalk scores
  const DZ=-178.55, DY=FB+1.73;
  push("cork", boxGeo(0.03, 0.80, 0.80, 0.5), IX0+0.015, DY, DZ, 0, "#ffffff");
  { const dt=signTex(256,256,(x,W,Hh)=>{ const cx=W/2, cy=Hh/2, r=W*0.47;
      x.fillStyle="#141414"; x.beginPath(); x.arc(cx,cy,r,0,7); x.fill();
      const ring=(r0,r1,a,b)=>{ for(let i=0;i<20;i++){ const t0=(i-0.5)*Math.PI/10, t1=t0+Math.PI/10; x.fillStyle=i%2?a:b;
        x.beginPath(); x.arc(cx,cy,r1,t0,t1); x.arc(cx,cy,r0,t1,t0,true); x.fill(); } };
      ring(0.06*W,0.36*W,"#efe2c4","#1a1a1a"); ring(0.22*W,0.24*W,"#c42a1a","#2f7a3c"); ring(0.36*W,0.38*W,"#c42a1a","#2f7a3c");
      x.fillStyle="#2f7a3c"; x.beginPath(); x.arc(cx,cy,0.06*W,0,7); x.fill(); x.fillStyle="#c42a1a"; x.beginPath(); x.arc(cx,cy,0.025*W,0,7); x.fill();
      x.fillStyle="#e8e4d8"; x.font="bold 11px Arial"; x.textAlign="center"; x.textBaseline="middle";
      [20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5].forEach((n,i)=>{ const a=-Math.PI/2+i*Math.PI/10; x.fillText(n, cx+Math.cos(a)*0.43*W, cy+Math.sin(a)*0.43*W); }); });
    const m=new T.Mesh(new T.CircleGeometry(0.23, 40), new T.MeshStandardMaterial({map:dt, roughness:0.8}));
    m.position.set(IX0+0.045, DY, DZ); m.rotation.y=Math.PI/2; scene.add(m);
    C(0.235, 0.04, IX0+0.022, DY, DZ, "#141414", 32, 0, 0, Math.PI/2); }
  for(const [dz,dy] of [[0.03,0.05],[-0.08,-0.02],[0.11,-0.12]]){
    tubeE(V3(IX0+0.07, DY+dy, DZ+dz), V3(IX0+0.20, DY+dy+0.02, DZ+dz+0.01), 0.006, "#c9cbcc");
    B(0.06, 0.03, 0.002, IX0+0.22, DY+dy+0.02, DZ+dz+0.01, "#c42a1a", Math.PI/2); }
  bx("paint", 0.04, 0.004, 0.70, IX0+2.37, FB+0.008, DZ, 0, 0, "#e2b31c");
  pic(0.50, 0.62, (x,W,Hh)=>{ x.fillStyle="#1f2a24"; x.fillRect(0,0,W,Hh); x.strokeStyle="#7a5a3a"; x.lineWidth=12; x.strokeRect(0,0,W,Hh);
    x.fillStyle="rgba(240,240,232,0.85)"; x.font="bold 20px 'Comic Sans MS', 'Marker Felt', cursive"; x.textAlign="center";
    x.fillText("RICH   DALE", W/2, 34); x.fillRect(W/2-2,44,3,Hh-60); x.fillRect(16,46,W-32,2);
    x.font="18px 'Comic Sans MS', cursive"; ["301","261","180","140","61"].forEach((s,i)=>x.fillText(s, W*0.3, 72+i*26));
    ["301","241","199","117"].forEach((s,i)=>x.fillText(s, W*0.72, 72+i*26)); }, IX0+0.012, FB+1.62, -177.86, Math.PI/2);
  addUse(IX0+2.5, DZ, FB, "THROW THE DARTS", ()=>{ const s=[3,5,20,1,18,60,25,50,12,0][(Math.random()*10)|0];
    toast(s===0?"OFF THE BOARD. INTO THE PANELLING":s===50?"BULL. NOBODY SAW IT":s===60?"TREBLE TWENTY. SAY SOMETHING TO SOMEBODY":"YOU SCORE "+s,"#cfe0d4"); }, 1.4);
  // steel shelving on the east wall: what lives on it
  { const SX=IX1-0.22, SZ0=-181.45, SZ1=-180.35;
    for(const y of [0.05,0.55,1.05,1.55]) B(0.40, 0.025, SZ1-SZ0, SX, FB+y, (SZ0+SZ1)/2, "#7d8286");
    for(const z of [SZ0, SZ1]) for(const x of [SX-0.19, SX+0.19]) B(0.03, 1.80, 0.03, x, FB+0.90, z, "#6d7276");
    B(0.36, 0.30, 0.42, SX, FB+0.22, SZ0+0.25, "#b98a58"); pic(0.30,0.10,(x,W,Hh)=>{ x.fillStyle="#b98a58"; x.fillRect(0,0,W,Hh); x.fillStyle="#b3191e";
      x.font="bold 30px 'Comic Sans MS', cursive"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("XMAS", W/2, Hh/2); }, SX-0.181, FB+0.26, SZ0+0.25, -Math.PI/2);
    C(0.10, 0.14, SX, FB+0.64, SZ0+0.70, "#9aa0a2"); C(0.10, 0.14, SX, FB+0.64, SZ0+0.92, "#9aa0a2");
    ent(new T.SphereGeometry(0.15, 12, 8, 0, Math.PI*2, 0, Math.PI/2), SX, FB+1.07, SZ0+0.25, "#f2c418");
    C(0.05, 0.36, SX, FB+1.25, SZ0+0.70, "#e8e4d8", 10); C(0.07, 0.06, SX, FB+1.10, SZ0+0.70, "#b3191e", 10);    // a bowling pin
    C(0.06, 0.10, SX, FB+1.12, SZ0+0.92, "#c8b25a", 10); C(0.05, 0.16, SX, FB+1.25, SZ0+0.92, "#d8c46a", 10);    // a trophy
    C(0.06, 0.16, SX, FB+1.65, SZ0+0.30, "#bcd4d8", 12); for(let k=0;k<6;k++) C(0.012, 0.004, SX+(R()-0.5)*0.05, FB+1.58+k*0.012, SZ0+0.30, "#c8a85a", 10);
    pic(0.11,0.05,(x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); x.fillStyle="#222"; x.font="bold 16px Arial"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("POT FUND",W/2,Hh/2); },
      SX-0.062, FB+1.64, SZ0+0.30, -Math.PI/2, false, 110, 50);
    addCol(SX-0.21, SX+0.22, SZ0-0.02, SZ1+0.02, FB-0.5, FB+1.8); }
  // a cooler by the couch, the heater glowing at the table, the dehumidifier in the corner
  B(0.56, 0.34, 0.36, 82.75, FB+0.17, IZ0+0.30, "#c23a2a"); B(0.58, 0.07, 0.38, 82.75, FB+0.37, IZ0+0.30, "#e8e4d8");
  addCol(82.45, 83.05, IZ0+0.10, IZ0+0.50, FB-0.5, FB+0.42);
  B(0.30, 0.52, 0.18, 79.15, FB+0.26, -180.85, "#d8d4c8", 0.5);
  { const g=new T.Mesh(new T.PlaneGeometry(0.22, 0.34), new T.MeshBasicMaterial({color:0xff6a1a, toneMapped:false}));
    g.position.set(79.15+Math.sin(0.5)*0.092, FB+0.30, -180.85+Math.cos(0.5)*0.092); g.rotation.y=0.5; scene.add(g);
    for(let k=0;k<5;k++) B(0.24, 0.008, 0.01, 79.15+Math.sin(0.5)*0.098, FB+0.17+k*0.065, -180.85+Math.cos(0.5)*0.098, "#3a3a3a", 0.5); }
  addCol(78.98, 79.32, -181.02, -180.68, FB-0.5, FB+0.55);
  B(0.36, 0.56, 0.28, 77.48, FB+0.28, -177.85, "#ece8de"); B(0.30, 0.06, 0.02, 77.48, FB+0.48, -177.70, "#5d6266");
  addCol(77.28, 77.68, -178.0, -177.70, FB-0.5, FB+0.6);
  // a braided oval rug under the table
  { const rt=signTex(256,256,(x,W,Hh)=>{ const cols=["#6a2a1e","#3d2a1e","#8a5a2e","#5a3e2a","#7a3a22","#2e3a2a"];
      for(let i=0;i<24;i++){ x.fillStyle=cols[i%6]; x.beginPath(); x.arc(W/2,Hh/2,W/2-i*5.2,0,7); x.fill(); } });
    const g=new T.CircleGeometry(1, 40); g.scale(1.45, 1.10, 1);
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:rt, roughness:1.0, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
    m.position.set(TX, FB+0.010, TZ); m.rotation.x=-Math.PI/2; m.receiveShadow=true; scene.add(m); }

  /* ---- what is on the walls ---------------------------------------------- */
  // the neon over the table: a beer nobody outside the county has heard of
  { const nt=signTex(512,160,(x,W,Hh)=>{ x.fillStyle="#000"; x.fillRect(0,0,W,Hh);
      x.shadowColor="#ff3a2a"; x.shadowBlur=16; x.strokeStyle="#ff5a3a"; x.lineWidth=6; x.font="italic bold 64px 'Brush Script MT', 'Comic Sans MS', cursive";
      x.textAlign="center"; x.textBaseline="middle"; x.strokeText("Allegheny", W/2, 62);
      x.shadowColor="#3a7aff"; x.strokeStyle="#6aa0ff"; x.lineWidth=4; x.font="bold 34px Arial"; x.strokeText("L A G E R", W/2, 124);
      x.beginPath(); x.ellipse(W/2, Hh/2, W/2-10, Hh/2-8, 0, 0, 7); x.stroke(); });
    const m=new T.Mesh(new T.PlaneGeometry(1.15, 0.36), new T.MeshBasicMaterial({map:nt, transparent:true, blending:T.AdditiveBlending, depthWrite:false, toneMapped:false}));
    m.position.set(TX, FB+1.78, IZ0+0.05); scene.add(m);
    B(1.10, 0.30, 0.02, TX, FB+1.78, IZ0+0.025, "#101010"); }
  // a pennant over the couch, the calendar by the stair, the dragway poster, the ledger
  pic(0.95, 0.32, (x,W,Hh)=>{ x.fillStyle="#141414"; x.beginPath(); x.moveTo(0,0); x.lineTo(W,Hh/2); x.lineTo(0,Hh); x.closePath(); x.fill();
    x.fillStyle="#f2c418"; x.fillRect(0,0,W*0.12,Hh); x.font="bold 54px Arial Black, Arial"; x.textBaseline="middle"; x.fillText("PITTSBURGH", W*0.15, Hh/2); },
    CX, FB+1.62, IZ0+0.03, 0, true);
  pic(0.42, 0.64, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh);
    const g=x.createLinearGradient(0,20,0,Hh*0.55); g.addColorStop(0,"#d9772a"); g.addColorStop(1,"#7a4a1e"); x.fillStyle=g; x.fillRect(10,10,W-20,Hh*0.52);
    x.fillStyle="#3a2412"; x.beginPath(); x.ellipse(W*0.5,Hh*0.38,W*0.16,Hh*0.07,0,0,7); x.fill(); x.fillRect(W*0.40,Hh*0.40,6,Hh*0.13); x.fillRect(W*0.58,Hh*0.40,6,Hh*0.13);
    x.beginPath(); x.ellipse(W*0.68,Hh*0.30,W*0.05,Hh*0.035,0.4,0,7); x.fill(); x.strokeStyle="#3a2412"; x.lineWidth=3; x.beginPath(); x.moveTo(W*0.70,Hh*0.28); x.lineTo(W*0.66,Hh*0.18); x.moveTo(W*0.72,Hh*0.28); x.lineTo(W*0.78,Hh*0.19); x.stroke();
    x.fillStyle="#222"; x.font="bold 30px Arial"; x.textAlign="center"; x.fillText("OCTOBER 2026", W/2, Hh*0.62);
    x.font="11px Arial"; for(let r=0;r<5;r++) for(let c=0;c<7;c++){ const d=r*7+c-3; if(d>0 && d<=31){ x.strokeStyle="#bbb"; x.strokeRect(14+c*((W-28)/7), Hh*0.66+r*((Hh*0.28)/5), (W-28)/7, (Hh*0.28)/5); x.fillText(d, 14+c*((W-28)/7)+12, Hh*0.66+r*((Hh*0.28)/5)+12); } }
    x.font="bold 13px Arial"; x.fillText("WOLFE'S FEED & HARDWARE · TIOGA, PA", W/2, Hh-10); }, 85.2, FB+1.35, WZ0-0.012, Math.PI);
  pic(0.56, 0.78, (x,W,Hh)=>{ x.fillStyle="#1d1a2e"; x.fillRect(0,0,W,Hh); const g=x.createLinearGradient(0,0,0,Hh*0.6); g.addColorStop(0,"#e8582a"); g.addColorStop(1,"#f2c418");
    x.fillStyle=g; x.fillRect(0,Hh*0.08,W,Hh*0.5); x.fillStyle="#1d1a2e"; x.beginPath(); x.moveTo(W*0.08,Hh*0.5); x.lineTo(W*0.25,Hh*0.40); x.lineTo(W*0.62,Hh*0.38); x.lineTo(W*0.80,Hh*0.44); x.lineTo(W*0.94,Hh*0.47); x.lineTo(W*0.94,Hh*0.53); x.lineTo(W*0.08,Hh*0.55); x.fill();
    for(const wx of [0.25,0.78]){ x.beginPath(); x.arc(W*wx,Hh*0.55,W*0.07,0,7); x.fill(); }
    x.fillStyle="#f4f0e2"; x.font="bold 44px Impact, Arial Black"; x.textAlign="center"; x.fillText("SAT NITE", W/2, Hh*0.72);
    x.font="bold 24px Impact, Arial"; x.fillText("MUSKRAT FLATS DRAGWAY", W/2, Hh*0.82); x.font="16px Arial"; x.fillText("GATES 5 PM · RAIN OR SHINE · 1987", W/2, Hh*0.90); },
    IX0+0.012, FB+1.68, -180.30, Math.PI/2);
  pic(0.90, 0.62, (x,W,Hh)=>{ x.fillStyle="#f7f7f2"; x.fillRect(0,0,W,Hh); x.strokeStyle="#9a9da0"; x.lineWidth=10; x.strokeRect(0,0,W,Hh);
    x.fillStyle="#1f3f9a"; x.font="bold 28px 'Comic Sans MS', 'Marker Felt', cursive"; x.textAlign="left"; x.fillText("WHO OWES WHO", 22, 42);
    x.fillStyle="#222"; x.font="20px 'Comic Sans MS', cursive";
    [["TERRY","$14"],["DALE","$6"],["RICH","PAID"],["BIG MIKE","$31 (!!)"],["SUPERVISOR","WHO?"]].forEach((r,i)=>{ x.fillText(r[0], 30, 76+i*28); x.fillText(r[1], W-150, 76+i*28); });
    x.strokeStyle="#c42a1a"; x.lineWidth=3; x.beginPath(); x.moveTo(26,128); x.lineTo(W-40,120); x.stroke();
    x.fillStyle="#c42a1a"; x.font="bold 17px 'Comic Sans MS', cursive"; x.fillText("FRI = GAME NIGHT", 24, Hh-36); x.fillText("BRING CHIPS (THE FOOD KIND)", 24, Hh-14); },
    IX1-0.012, FB+1.50, -178.65, -Math.PI/2);
  addUse(IX1-0.9, -178.65, FB, "READ THE BOARD", ()=>toast("TERRY OWES FOURTEEN. BIG MIKE OWES THIRTY-ONE, UNDERLINED","#cfe0d4"), 1.4);
  // hand-lettered cardboard, over the way in from the stair, and one by the top of it
  pic(1.0, 0.24, (x,W,Hh)=>{ x.fillStyle="#b98a58"; x.fillRect(0,0,W,Hh); x.fillStyle="#1d1b19"; x.font="bold 30px 'Comic Sans MS', 'Marker Felt', cursive";
    x.textAlign="center"; x.textBaseline="middle"; x.fillText("WHAT HAPPENS IN THE GEN HOUSE", W/2, Hh*0.35); x.font="bold 26px 'Comic Sans MS', cursive"; x.fillText("STAYS IN THE GEN HOUSE", W/2, Hh*0.75); },
    (SX1+IX1)/2, CB-0.13, P.z0-0.006, Math.PI, false, 400, 96);
  pic(0.55, 0.28, (x,W,Hh)=>{ x.fillStyle="#c49a64"; x.fillRect(0,0,W,Hh); x.fillStyle="#1d1b19"; x.font="bold 34px 'Comic Sans MS', 'Marker Felt', cursive";
    x.textAlign="center"; x.textBaseline="middle"; x.fillText("NO SUPERVISORS", W/2, Hh*0.36); x.font="24px 'Comic Sans MS', cursive"; x.fillText("PAST THIS POINT", W/2, Hh*0.74); },
    83.55, FY+1.55, WZ1+0.012, 0);

  /* the lights along the ceiling: a string of big old bulbs, swagged hook to hook, a few gone */
  { const pts=[], bulbs=[];
    for(const [x0,x1,z] of [[IX0+0.35, IX1-0.35, IZ0+0.22],[IX0+0.35, 81.9, WZ0-0.18]]){
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
  addBuried(IX0, IX1, IZ0, IZ1, FB-0.5, CB+0.05, 0);
  HANGOUT.room={x0:IX0, x1:IX1, z0:IZ0, z1:IZ1, y:FB};
})();
function updateHangout(){
  const H=HANGOUT; if(!H.screen) return;
  const on=H.tvOn && GRID.bldg>0.1;
  H.screen.color.setScalar(on ? 0.85+0.15*Math.random() : 0.0);
  H.tvLamp.intensity = on ? 0.30+0.08*Math.random() : 0;
  if(H.tvUse) H.tvUse.label = H.tvOn ? "TURN THE TV OFF" : "TURN THE TV ON";
}
