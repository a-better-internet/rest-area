"use strict";
/* REST AREA · 12c-arcade.js
   past the crew's rooms (12b): a stair down, the old shelter corridor
   under the yard and the hill, and the arcade at the end of it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12c · THE CORRIDOR AND THE ARCADE
   The door in the dug-out's far wall opens on six concrete steps down
   to a corridor somebody built in 1962 as a fallout shelter and nobody
   has listed since: block walls painted green below and cream above, a
   yellow stripe, conduit and a cable tray overhead, vapour-tight tubes
   every few metres (one of them going), two locked steel doors, the
   shelter's yellow sign. Twenty-five metres on, under the hill, it opens
   into a small room the crew filled with what came out of a closed arcade
   in Erie: a cosmic carpet, black walls with pink and blue neon along
   them, four upright cabinets spread round the walls running their attract
   screens, a token changer, an air hockey table in the middle and a hoops
   machine against the back wall, both of which you can play (18e). All of
   it BURIED: the same at any hour (19).
   ---------------------------------------------------------------------- */
const ARCADE={screens:null, puck:null, t:0, acc:0, games:[], room:null};
(function arcade(){
  const D=HANGOUT.door; if(!D) return;
  const FB=D.y, SR=0.19, NS=6, FH=FB-NS*SR;                       // the corridor floor, six risers under the cellar's
  const CX0=71.0, CX1=73.0, LZ0=D.z, LZ1=D.z-0.80;                 // the corridor's width; the landing inside the door
  const STZ1=LZ1-(NS-1)*0.30;                                      // the foot of the stair
  const CZ1=-211.0;                                                // where the corridor meets the room
  const A={x0:67.5, x1:76.5, z0:-219.5, z1:CZ1, y:FH, h:3.0};      // the room: nine metres by eight and a half
  const CEIL_HI=FB+2.05, CEIL_LO=FH+2.75, SOFFIT=LZ1-1.0;          // the ceiling over the landing, the corridor's, where it steps
  const LOW="#7d8f86", HIGH="#d9d4c4";
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,r,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    E.push({geo:new T.CylinderGeometry(r,r,L,6), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x, s, cx, cy, w, h, col, weight, family)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const lamp=(o)=>{ o.under=true; o.indoor=true; o.circ="bldg"; LAMPS.push(o); return o; };

  /* ---- the stair down ------------------------------------------------------ */
  const WT=0.25, TOP=FB+2.4;
  // (they start a centimetre into the arcade's wall, so their ends are inside it rather than in its face)
  wallBox("block", CX0-WT, CX0, CZ1+0.01, LZ0, FH-0.1, TOP, LOW, 0.6, FH);
  wallBox("block", CX1, CX1+WT, CZ1+0.01, LZ0, FH-0.1, TOP, LOW, 0.6, FH);
  for(let k=1;k<NS;k++){
    const za=LZ1-(k-1)*0.30, zb=za-0.30, y=FB-k*SR;
    bx("concrete", CX1-CX0-0.004, y-FH, 0.30, (CX0+CX1)/2, (y+FH)/2, (za+zb)/2, 0.5, 0, "#a8a49a");
    bx("paint", CX1-CX0-0.03, 0.004, 0.05, (CX0+CX1)/2, y+0.002, zb+0.022, 0, 0, "#e2b31c");   // (3 mm proud of the riser)
    addFlat(CX0, CX1, zb, za, y);
  }
  bx("paint", CX1-CX0-0.03, 0.004, 0.05, (CX0+CX1)/2, FB+0.006, LZ1+0.022, 0, 0, "#e2b31c");
  for(const x of [CX0+0.07, CX1-0.07]){
    const a=V3(x, FB+0.92, LZ1+0.3), b=V3(x, FH+0.92, STZ1-0.4);
    tubeE(a, b, 0.021, "#2a2c2e");
    for(const t of [0.1, 0.9]){ const p=a.clone().lerp(b,t); tubeE(p, V3(x+(x<72?-0.06:0.06), p.y-0.07, p.z), 0.012, "#2a2c2e"); } }
  floorAt("concrete", CX0, CX1, LZ1, LZ0, FB+0.004, "#8a8d84", 0.5);
  floorAt("concrete", CX0, CX1, CZ1, STZ1, FH+0.004, "#8a8d84", 0.5);
  // the ceiling: high over the landing, stepped down once your head is past it (the soffit has a face of its own)
  ceilAt("plaster", CX0, CX1, SOFFIT, LZ0, CEIL_HI, "#d8d4ca", 0.5);
  ceilAt("plaster", CX0, CX1, CZ1, SOFFIT, CEIL_LO, "#d8d4ca", 0.5);
  wallBox("block", CX0, CX1, SOFFIT-0.12, SOFFIT, CEIL_LO, CEIL_HI+0.1, HIGH, 0.6, FH);
  addVoid(CX0, CX1, LZ1, LZ0+0.25, FB-3, SUB_G-0.15, FB);
  addVoid(CX0, CX1, CZ1, LZ1, FH-3, SUB_G-0.15, FH);

  /* ---- the corridor --------------------------------------------------------- */
  // painted: green below, cream above, a yellow stripe between (liners, so the block's own colour is the green)
  for(const [f,dir] of [[CX0,1],[CX1,-1]]){
    lineZ("block", f, dir, CZ1, STZ1, FH+1.2, CEIL_LO, [], HIGH, 0.6);
    lineZ("block", f, dir, STZ1, LZ0, FB+1.2, CEIL_HI, [], HIGH, 0.6);
    bx("paint", 0.006, 0.08, STZ1-CZ1, f+dir*0.008, FH+1.2, (CZ1+STZ1)/2, 0, 0, "#e2b31c"); }
  // overhead: a cable tray on hangers, two conduits, a duct; the tubes every five metres
  for(let z=STZ1-0.5; z>CZ1+0.5; z-=1.5){ tubeE(V3(CX0+0.25, CEIL_LO, z), V3(CX0+0.25, CEIL_LO-0.18, z), 0.006, "#7d8286"); }
  B(0.30, 0.05, STZ1-CZ1-0.6, CX0+0.25, CEIL_LO-0.20, (CZ1+STZ1)/2, "#8d9194");
  for(const dx of [0.6, 0.66]) tubeE(V3(CX0+dx, CEIL_LO-0.04, STZ1), V3(CX0+dx, CEIL_LO-0.04, CZ1+0.02), 0.012, "#8f9496");
  B(0.45, 0.30, STZ1-CZ1-0.02, CX1-0.30, CEIL_LO-0.16, (CZ1+0.02+STZ1)/2, "#a6a9aa");      // (ending in the lintel, not in its face)
  for(const z of [-187.5, -192.5, -197.5, -202.5, -207.5]){
    B(0.18, 0.08, 1.30, (CX0+CX1)/2, CEIL_LO-0.04, z, "#c8cac6");
    push("tube", planeGeo(0.10, 1.20, 0), (CX0+CX1)/2, CEIL_LO-0.083, z, 0, "#ffffff", Math.PI/2, 0);
    lamp({x:(CX0+CX1)/2, y:CEIL_LO-0.3, z:z, color:0xeef4ee, intensity:0.6, dist:6.5, decay:1.5});
  }
  lamp({x:(CX0+CX1)/2, y:CEIL_HI-0.3, z:LZ1-0.2, color:0xffe8c8, intensity:0.5, dist:5, decay:1.5});
  C(0.035, 0.05, (CX0+CX1)/2, CEIL_HI-0.025, LZ1-0.2, "#d8d4c6", 10); push("tube", new T.SphereGeometry(0.035,10,8), (CX0+CX1)/2, CEIL_HI-0.08, LZ1-0.2, 0, "#ffffff");
  // a water line along the west wall on brackets, a floor drain, the extinguisher, two locked doors
  tubeE(V3(CX0+0.06, FH+0.35, STZ1), V3(CX0+0.06, FH+0.35, CZ1), 0.025, "#2f5f9a");
  for(let z=STZ1-1; z>CZ1; z-=3) B(0.04, 0.06, 0.03, CX0+0.03, FH+0.35, z, "#5a5d60");
  B(0.30, 0.006, 0.30, (CX0+CX1)/2, FH+0.013, -199.0, "#3a3c3e");                       // (clear of the floor's skin)
  B(0.22, 0.60, 0.14, CX1-0.08, FH+1.25, -195.0, "#b3151b"); C(0.07, 0.42, CX1-0.12, FH+1.23, -195.0, "#c41a1a", 12);
  for(const [z,name] of [[-191.0,"MECH 2"],[-203.5,"STORAGE · NO ENTRY"]]){
    B(0.05, 2.10, 1.00, CX1-0.025, FH+1.05, z, "#5f6a6e");
    for(const zz of [z-0.53, z+0.53]) B(0.08, 2.16, 0.06, CX1-0.04, FH+1.08, zz, "#4a4f52");
    B(0.08, 0.06, 1.12, CX1-0.04, FH+2.19, z, "#4a4f52");
    B(0.06, 0.10, 0.03, CX1-0.08, FH+1.02, z+0.36, "#c9cbcc");
    sign(0.40, 0.12, (x,W,Hh)=>{ x.fillStyle="#f2f0e8"; x.fillRect(0,0,W,Hh); say(x, name, W/2, Hh/2, W*0.86, Hh*0.6, "#1a1a1a", "700", "Arial"); },
      CX1-0.056, FH+1.62, z, -Math.PI/2, false, 240);
    addUse(CX1-0.7, z, FH, "TRY THE DOOR", ()=>toast("LOCKED. A PADLOCK, AND A STICKER: KEEP OUT","#cfe0d4"), 1.1); }
  // the shelter sign at the top of the stair, and the way on painted on the wall
  sign(0.46, 0.34, (x,W,Hh)=>{ x.fillStyle="#f2c418"; x.fillRect(0,0,W,Hh); x.fillStyle="#141414"; x.fillRect(W*0.04,Hh*0.05,W*0.92,Hh*0.62);
      const cx=W*0.18, cy=Hh*0.36, r=Hh*0.25; x.fillStyle="#f2c418"; x.beginPath(); x.arc(cx,cy,r,0,7); x.fill(); x.fillStyle="#141414";
      for(let k=0;k<3;k++){ const a=-Math.PI/2+k*2*Math.PI/3; x.beginPath(); x.moveTo(cx,cy); x.arc(cx,cy,r*0.86,a-0.52,a+0.52); x.closePath(); x.fill(); }
      x.fillStyle="#f2c418"; x.beginPath(); x.arc(cx,cy,r*0.18,0,7); x.fill();
      say(x, "FALLOUT", W*0.63, Hh*0.24, W*0.56, Hh*0.20, "#f2c418", "700", "Arial");
      say(x, "SHELTER", W*0.63, Hh*0.48, W*0.56, Hh*0.20, "#f2c418", "700", "Arial");
      say(x, "CAPACITY 40", W/2, Hh*0.83, W*0.80, Hh*0.17, "#141414", "700", "Arial"); },
    CX0+0.016, FB+1.65, LZ1-0.2, Math.PI/2);
  sign(1.10, 0.30, (x,W,Hh)=>{ x.fillStyle=HIGH; x.fillRect(0,0,W,Hh);
      say(x, "ARCADE  →", W/2, Hh/2, W*0.84, Hh*0.62, "#b3151b", "700", "'Comic Sans MS', 'Marker Felt', cursive"); },
    CX0+0.016, FH+1.75, -196.0, Math.PI/2);
  addZone(CX0, CX1, CZ1, LZ0, FH-0.5, CEIL_HI, "THE CORRIDOR", true);
  addBuried(CX0, CX1, CZ1, LZ0, FH-0.5, CEIL_HI+0.05, 0);

  /* ---- the arcade room -------------------------------------------------------- */
  const ATOP=A.y+A.h+0.1, WALLC="#2a2236";
  wallBox("block", A.x0-WT, A.x0, A.z0-WT, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  wallBox("block", A.x1, A.x1+WT, A.z0-WT, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  wallBox("block", A.x0, A.x1, A.z0-WT, A.z0, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  // (the two either side of the way in stop a few mm into the corridor's walls, not in their faces)
  wallBox("block", A.x0, CX0-0.006, A.z1, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  wallBox("block", CX1+0.006, A.x1, A.z1, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  wallBox("block", CX0, CX1, A.z1, A.z1+WT, A.y+2.45, ATOP, WALLC, 0.6, A.y);
  ceilAt("paintm", A.x0, A.x1, A.z0, A.z1, A.y+A.h, "#141218", 0.5);
  addVoid(A.x0, A.x1, A.z0, A.z1, A.y-3, SUB_G-0.15, A.y);
  // the carpet: black, with the shapes and squiggles every arcade carpet has
  const carpet=(function(){
    const c=cvs(512,512), x=c.getContext("2d"); let s=4242; const r=()=>{ s=(s*1664525+1013904223)&0x7fffffff; return s/0x7fffffff; };
    x.fillStyle="#120d1e"; x.fillRect(0,0,512,512);
    const cols=["#ff3fae","#3fe0ff","#f2e23a","#7a5cff","#3aff7a","#ff7a2a"];
    for(let i=0;i<70;i++){ x.strokeStyle=x.fillStyle=cols[i%6]; x.lineWidth=3; const px=r()*512, py=r()*512, sz=10+r()*18, k=i%4;
      x.save(); x.translate(px,py); x.rotate(r()*6.28);
      if(k===0){ x.beginPath(); x.arc(0,0,sz*0.6,0,7); x.stroke(); }
      else if(k===1){ x.beginPath(); x.moveTo(-sz,sz*0.6); x.lineTo(0,-sz*0.7); x.lineTo(sz,sz*0.6); x.closePath(); x.stroke(); }
      else if(k===2){ x.beginPath(); x.moveTo(-sz,0); for(let j=1;j<=6;j++) x.lineTo(-sz+j*sz/3, (j%2?-1:1)*sz*0.35); x.stroke(); }
      else { x.fillRect(-2,-2,4,4); x.beginPath(); x.arc(0,0,3,0,7); x.fill(); }
      x.restore(); }
    const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=8; return t; })();
  { const g=new T.PlaneGeometry(A.x1-A.x0, A.z1-A.z0), U=g.attributes.uv;
    for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(A.x1-A.x0)/1.6, U.getY(i)*(A.z1-A.z0)/1.6);
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:carpet, roughness:1.0}));
    m.rotation.x=-Math.PI/2; m.position.set((A.x0+A.x1)/2, A.y+0.004, (A.z0+A.z1)/2); m.receiveShadow=true; scene.add(m); }
    // (the corridor's own floor runs on through the doorway)
  // neon along the walls, pink and blue, at the height the old place had it
  { const pink=new T.MeshBasicMaterial({color:0xff4fbf, toneMapped:false}), blue=new T.MeshBasicMaterial({color:0x4fd8ff, toneMapped:false});
    const run=(x0,x1,z0,z1,y,m)=>{ const g=new T.BoxGeometry(Math.max(0.025,x1-x0), 0.025, Math.max(0.025,z1-z0)); const o=new T.Mesh(g,m); o.position.set((x0+x1)/2,y,(z0+z1)/2); scene.add(o); };
    for(const [y,m] of [[A.y+2.35,pink],[A.y+2.47,blue]]){
      run(A.x0+0.02, A.x0+0.045, A.z0+0.05, A.z1-0.05, y, m); run(A.x1-0.045, A.x1-0.02, A.z0+0.05, A.z1-0.05, y, m);   // (the sides stop short of the ends' strips)
      run(A.x0, A.x1, A.z0+0.02, A.z0+0.045, y, m); run(A.x0, CX0-0.1, A.z1-0.045, A.z1-0.02, y, m); run(CX1+0.1, A.x1, A.z1-0.045, A.z1-0.02, y, m); } }
  // GAME ROOM in neon over the way in, inside
  { const nt=signTex(512,160,(x,W,Hh)=>{ x.fillStyle="#000"; x.fillRect(0,0,W,Hh);
      x.textAlign="center"; x.textBaseline="middle"; x.shadowBlur=18;
      x.shadowColor="#ff4fbf"; x.strokeStyle="#ff7ad0"; x.lineWidth=6; let s=74;
      do{ x.font="italic 900 "+s+"px 'Arial Black', Arial"; s-=2; } while(x.measureText("GAME ROOM").width>W*0.80 && s>20);
      x.strokeText("GAME ROOM", W/2, Hh*0.44);
      x.shadowColor="#4fd8ff"; x.strokeStyle="#7ae4ff"; x.lineWidth=3; x.beginPath(); x.moveTo(W*0.12,Hh*0.80); x.lineTo(W*0.88,Hh*0.80); x.stroke(); });
    const m=new T.Mesh(new T.PlaneGeometry(1.8, 0.56), new T.MeshBasicMaterial({map:nt, transparent:true, blending:T.AdditiveBlending, depthWrite:false, toneMapped:false}));
    m.position.set((CX0+CX1)/2, A.y+2.70, A.z1-0.06); m.rotation.y=Math.PI; scene.add(m);
    B(1.70, 0.46, 0.02, (CX0+CX1)/2, A.y+2.70, A.z1-0.021, "#0a0a0c"); }
  // the light: low, coloured, from the ceiling corners; a white one over each game; and the screens themselves
  for(const [x,z,c] of [[69.0,-212.8,0x9a5cff],[75.4,-212.8,0x4fb8ff],[69.0,-218.2,0xff5fb0],[72.6,-218.0,0x7a6cff],[72.4,-214.2,0xfff0e0],[74.4,-217.6,0xfff0e0]])
    lamp({x:x, y:A.y+2.25, z:z, color:c, intensity:c===0xfff0e0?0.62:0.80, dist:8, decay:1.4});

  /* ---- the cabinets: four of them, a good stride apart ---------------------------- */
  const NAMES=["ASTRO RAIDERS","MAZE MUNCHER","TURNPIKE RACER","BLOCK DROP"];
  const KIND=[0,1,2,3];                                               // which attract screen each runs
  const SIDE=["#1f3fa0","#c42a1a","#1a1a1c","#2f7a3c"];
  const scrC=cvs(512,128), scrTex=setSRGB(new T.CanvasTexture(scrC)); scrTex.minFilter=T.LinearFilter;
  const marC=cvs(512,96), mx=marC.getContext("2d");
  NAMES.forEach((n,i)=>{ const ox=i*128, oy=0, g=mx.createLinearGradient(0,oy,0,oy+96);
    g.addColorStop(0,["#1a0a2e","#2e0a0a","#0a1a2e"][i%3]); g.addColorStop(1,"#000"); mx.fillStyle=g; mx.fillRect(ox,oy,128,96);
    mx.strokeStyle=["#ff4fbf","#4fd8ff","#f2e23a","#7aff7a"][i%4]; mx.lineWidth=3; mx.strokeRect(ox+4,oy+4,120,88);
    mx.shadowColor=mx.strokeStyle; mx.shadowBlur=8; mx.fillStyle="#fff6e8";
    const words=n.split(" "); words.forEach((w,j)=>fitText(mx, w, 104, 30, ox+64, oy+48+(j-(words.length-1)/2)*30, "900", "'Arial Black', Arial"));
    mx.shadowBlur=0; });
  const marTex=setSRGB(new T.CanvasTexture(marC));
  const scrM=new T.MeshBasicMaterial({map:scrTex, toneMapped:false}), marM=new T.MeshBasicMaterial({map:marTex, toneMapped:false});
  const cellGeo=(w,h,i,rows,cols)=>{ const g=new T.PlaneGeometry(w,h), U=g.attributes.uv, cu=i%cols, cv=(i/cols)|0;
    for(let k=0;k<U.count;k++) U.setXY(k, (cu+0.02+U.getX(k)*0.96)/cols, 1-(cv+1)/rows+(0.02+U.getY(k)*0.96)/rows); return g; };
  const scrG=[], marG=[];
  const cab=(i, x, z, ry)=>{
    const c=Math.cos(ry), s=Math.sin(ry), L=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];     // local +z: out of the cabinet's front
    const q=(w,h,d,lx,ly,lz,col,rx)=>{ const p=L(lx,lz); ent(boxGeo(w,h,d), p[0], A.y+ly, p[1], col, rx||0, ry, 0); };
    const K="#141416", side=SIDE[i];
    for(const sx of [-0.315,0.315]) q(0.03, 1.86, 0.80, sx, 0.93, 0, side);
    q(0.60, 1.80, 0.70, 0, 0.90, -0.04, K);                            // the box behind it all
    q(0.60, 0.80, 0.02, 0, 0.40, 0.37, K);                             // the kick panel
    q(0.30, 0.30, 0.01, 0, 0.52, 0.385, "#2a2a2e");                    // the coin door
    for(const sx of [-0.05,0.05]) q(0.02, 0.04, 0.012, sx, 0.58, 0.392, "#ff4a1a");
    q(0.64, 0.05, 0.30, 0, 0.94, 0.47, side, -0.18);                   // the control panel, its face tilted to you
    const pj=L(-0.14, 0.50);
    if(i===0){ // (this one is played: its stick a part of its own, so it can lean with your hand)
      const st=new T.Group(); st.position.set(pj[0], A.y+0.965, pj[1]); st.rotation.order="YXZ"; st.rotation.y=ry; scene.add(st);
      const sm=new T.Mesh(new T.CylinderGeometry(0.008,0.008,0.10,8), new T.MeshStandardMaterial({color:0x1a1a1a, roughness:0.5})); sm.position.y=0.045; st.add(sm);
      const bm=new T.Mesh(new T.SphereGeometry(0.022,14,10), new T.MeshStandardMaterial({color:0xc42a1a, roughness:0.35})); bm.position.y=0.105; st.add(bm);
      ARCADE.stick=st; }
    else { C(0.008, 0.10, pj[0], A.y+1.01, pj[1], "#1a1a1a", 6); ent(new T.SphereGeometry(0.022,10,8), pj[0], A.y+1.07, pj[1], "#c42a1a"); }
    for(let b=0;b<3;b++){ const pb=L(0.04+b*0.07, 0.50-b*0.01); C(0.016, 0.02, pb[0], A.y+0.985, pb[1], ["#f2e23a","#3fa0ff","#ff3a3a"][b], 12); }
    q(0.60, 0.06, 0.40, 0, 1.79, 0.18, K);                             // the marquee's hood
    q(0.56, 0.02, 0.06, 0, 1.30-0.24, 0.355, K);                       // the bezel's lip
    // the screen tipped back a little, the marquee lit over it
    const ps=L(0, 0.40), pm=L(0, 0.392);                               // (the screen's top, tipped back, still clear of the box)
    const scrQ=new T.Quaternion().setFromEuler(new T.Euler(-0.20, ry, 0, "YXZ"));
    if(i===0){ // Astro Raiders is played (18f): a screen of its own, sharper than an attract cell
      const c=cvs(336,280), tex=setSRGB(new T.CanvasTexture(c)); tex.minFilter=T.LinearFilter;
      const m=new T.Mesh(new T.PlaneGeometry(0.48, 0.40), new T.MeshBasicMaterial({map:tex, toneMapped:false}));
      m.position.set(ps[0], A.y+1.30, ps[1]); m.quaternion.copy(scrQ); scene.add(m);
      const pf=L(0, 1.02);
      ARCADE.raiders={c:c, x:c.getContext("2d"), tex:tex, mesh:m, stand:{x:pf[0], z:pf[1]}, ry:ry, screenY:A.y+1.30, screen:{x:ps[0], z:ps[1]}, floor:A.y}; }
    else scrG.push({geo:cellGeo(0.48, 0.40, KIND[i], 1, 4), matrix:new T.Matrix4().compose(V3(ps[0], A.y+1.30, ps[1]), scrQ, V3(1,1,1)), color:new T.Color(0xffffff)});
    marG.push({geo:cellGeo(0.56, 0.16, i, 1, 4), matrix:new T.Matrix4().compose(V3(pm[0], A.y+1.68, pm[1]), new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0, "YXZ")), V3(1,1,1)), color:new T.Color(0xffffff)});
    const a0=L(-0.34,-0.42), a1=L(0.34,0.62);
    addCol(Math.min(a0[0],a1[0]), Math.max(a0[0],a1[0]), Math.min(a0[1],a1[1]), Math.max(a0[1],a1[1]), A.y-0.5, A.y+1.86);
    const pu=L(0, 1.15);
    addUse(pu[0], pu[1], A.y, "PLAY "+NAMES[i], ()=>{ if(i===0 && typeof RAIDERS!=="undefined"){ RAIDERS.start(); return; }
      if(typeof AUDIO!=="undefined") AUDIO.blip("coin", pu[0], pu[1]);
      toast([`A TOKEN IN. NINETY SECONDS LATER: GAME OVER. HI SCORE STILL "MKE"`, "IT EATS THE TOKEN AND KEEPS RUNNING ITS ATTRACT MODE", "YOU GET TO THE SECOND LEVEL. THE JOYSTICK STICKS LEFT"][(Math.random()*3)|0], "#cfe0d4"); }, 0.9);
    ARCADE.games.push({name:NAMES[i], x:pu[0], z:pu[1]});
  };
  // two on the west wall facing in, two on the back wall facing the door
  cab(0, A.x0+0.45, -213.4, Math.PI/2); cab(1, A.x0+0.45, -216.0, Math.PI/2);
  cab(2, 69.5, A.z0+0.45, 0);           cab(3, 71.7, A.z0+0.45, 0);
  // the screens and marquees: two meshes, two textures, every cabinet a cell of them
  scene.add(new T.Mesh(mergeEntries(scrG), scrM)); scene.add(new T.Mesh(mergeEntries(marG), marM));
  ARCADE.screens={c:scrC, x:scrC.getContext("2d"), tex:scrTex};

  /* ---- the token changer by the door ---------------------------------------------- */
  { const x=A.x1-0.24, z=-212.2;
    B(0.46, 1.50, 0.40, x, A.y+0.75, z, "#7d8286");
    sign(0.38, 0.30, (cx,W,Hh)=>{ cx.fillStyle="#1a1c1e"; cx.fillRect(0,0,W,Hh); say(cx, "TOKENS", W/2, Hh*0.30, W*0.80, Hh*0.30, "#f4c430", "900", "'Arial Black', Arial");
        say(cx, "4 FOR $1 · 25 FOR $5", W/2, Hh*0.66, W*0.86, Hh*0.16, "#e8e8e2", "600", "Arial"); }, x-0.238, A.y+1.20, z, -Math.PI/2, true, 240);
    B(0.12, 0.08, 0.22, x-0.26, A.y+0.48, z, "#b9bcbd");
    addCol(x-0.25, A.x1, z-0.22, z+0.22, A.y-0.5, A.y+1.5);
    addUse(x-0.9, z, A.y, "GET TOKENS", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("coins", x, z); toast("FOUR BRASS TOKENS. “GOOD FOR ONE PLAY · NO CASH VALUE”","#cfe0d4"); }, 1.0); }

  /* ---- the air hockey table (18e plays it) ------------------------------------------ */
  // long way east-west in the middle of the room: you at the east end, the table's CPU at the west
  { const x=72.4, z=-214.2, L=2.20, W=1.16, top=A.y+0.80;
    B(L, 0.24, W, x, top-0.12, z, "#1d2a6a");
    for(const [lx,lz] of [[-0.95,-0.45],[0.95,-0.45],[-0.95,0.45],[0.95,0.45]]) B(0.10, top-0.24-A.y, 0.10, x+lx, A.y+(top-0.24-A.y)/2, z+lz, "#1a1a1c");
    // the rails, the end rails cut through at the goal slots
    for(const sd of [-1,1]) B(L, 0.06, 0.06, x, top+0.03, z+sd*(W/2-0.03), "#c42a1a");
    const GW=0.30, ER=(W-0.12-GW)/2;
    for(const sd of [-1,1]) for(const gz of [-1,1]) B(0.06, 0.058, ER, x+sd*(L/2-0.03), top+0.029, z+gz*(GW/2+ER/2), "#c42a1a");
    // the slots' throats: the puck drops into a box under each end
    for(const sd of [-1,1]) B(0.10, 0.10, GW+0.02, x+sd*(L/2+0.02), top-0.07, z, "#141416");
    const field=signTex(512,256,(c,Wd,Hh)=>{ c.fillStyle="#eef2f6"; c.fillRect(0,0,Wd,Hh);
      c.fillStyle="rgba(120,130,150,0.5)"; for(let i=8;i<Wd;i+=14) for(let j=8;j<Hh;j+=14) c.fillRect(i,j,2,2);
      c.strokeStyle="#c42a1a"; c.lineWidth=4; c.beginPath(); c.moveTo(Wd/2,0); c.lineTo(Wd/2,Hh); c.stroke(); c.beginPath(); c.arc(Wd/2,Hh/2,40,0,7); c.stroke();
      c.strokeStyle="#1f4fd8"; for(const gx of [Wd*0.25,Wd*0.75]){ c.beginPath(); c.moveTo(gx,0); c.lineTo(gx,Hh); c.stroke(); }
      for(const gx of [0,Wd]){ c.beginPath(); c.arc(gx,Hh/2,64,0,7); c.stroke(); }
      c.fillStyle="#1a1a1a"; const gh=Hh*GW/(W-0.12); c.fillRect(0,Hh/2-gh/2,8,gh); c.fillRect(Wd-8,Hh/2-gh/2,8,gh); });
    const f=new T.Mesh(new T.PlaneGeometry(L-0.12, W-0.12), new T.MeshStandardMaterial({map:field, roughness:0.25}));
    f.rotation.x=-Math.PI/2; f.position.set(x, top+0.008, z); scene.add(f);
    // the score, hung from the ceiling over the middle of it, a face to each end
    tubeE(V3(x, A.y+A.h, z-0.25), V3(x, A.y+2.42, z-0.25), 0.006, "#5a5a5e"); tubeE(V3(x, A.y+A.h, z+0.25), V3(x, A.y+2.42, z+0.25), 0.006, "#5a5a5e");
    B(0.10, 0.28, 0.74, x, A.y+2.28, z, "#141416");
    const scoreC=cvs(256,96), scoreTex=setSRGB(new T.CanvasTexture(scoreC));
    const faceE=new T.Mesh(new T.PlaneGeometry(0.66, 0.24), new T.MeshBasicMaterial({map:scoreTex, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    faceE.position.set(x+0.056, A.y+2.28, z); faceE.rotation.y=Math.PI/2; scene.add(faceE);
    const faceW=faceE.clone(); faceW.position.x=x-0.056; faceW.rotation.y=-Math.PI/2; scene.add(faceW);
    // the mallets and the puck, live (18e moves them; idle, the puck drifts on the air)
    const malletGeo=(()=>{ const E2=[], add=(g,y,c)=>E2.push({geo:g, matrix:new T.Matrix4().makeTranslation(0,y,0), color:new T.Color(c)});
      add(new T.CylinderGeometry(0.048,0.050,0.022,20), 0.011, "#ffffff"); add(new T.CylinderGeometry(0.030,0.034,0.016,16), 0.030, "#ffffff");
      add(new T.CylinderGeometry(0.019,0.021,0.050,12), 0.063, "#ffffff"); add(new T.SphereGeometry(0.021,12,8), 0.088, "#ffffff"); return mergeEntries(E2); })();
    const mallet=(col, lx, lz)=>{ const m=new T.Mesh(malletGeo, new T.MeshStandardMaterial({color:col, roughness:0.35, vertexColors:true}));
      m.position.set(x+lx, top+0.009, z+lz); m.castShadow=true; scene.add(m); return m; };
    const mY=mallet(0xd8241a, L/2-0.32, 0.10), mC=mallet(0x1f4fd8, -(L/2-0.32), -0.10);
    const puck=new T.Mesh(new T.CylinderGeometry(0.031,0.031,0.008,16), new T.MeshStandardMaterial({color:0xf2c418, roughness:0.4}));
    puck.position.set(x, top+0.016, z); scene.add(puck);                          // riding its air, a few millimetres up
    ARCADE.puck={m:puck, x:x, z:z, vx:0.35, vz:0.22, hx:L/2-0.12, hz:W/2-0.10, cx:x, cz:z, y:top+0.016};
    ARCADE.hockey={x:x, z:z, L:L, W:W, top:top, goal:GW, puck:puck, you:mY, cpu:mC, score:{c:scoreC, tex:scoreTex}, floor:A.y};
    addCol(x-L/2, x+L/2, z-W/2, z+W/2, A.y-0.5, top+0.06);
    addUse(x+L/2+0.55, z, A.y, "PLAY AIR HOCKEY", ()=>{ if(typeof HOCKEY!=="undefined") HOCKEY.start(); }, 1.0); }

  /* ---- the hoops machine on the back wall (18e plays it) ------------------------------ */
  // a long ramp running back to a backboard, nets down both sides, the balls rolling back to you
  { const X=74.4, ZF=-216.75, LEN=2.70, ZB=ZF-LEN, HW=0.50;
    const yF=A.y+0.80, yB=A.y+1.04, rampY=(z)=>yF+(ZF-z)/LEN*(yB-yF);             // the ramp: down toward you
    const RIM={x:X, y:A.y+2.08, z:ZB+0.45, r:0.16}, BOARD={z:ZB+0.20, x0:X-0.45, x1:X+0.45, y0:A.y+1.86, y1:A.y+2.52};
    // the cabinet under the ramp, its side skirts, the front with the tray
    for(const sd of [-1,1]){ const xs=X+sd*(HW+0.015), ang=Math.atan2(yB-yF, LEN);
      // a side skirt cut to the ramp: a wedge, the ramp's height at each end, three centimetres thick
      const q=[V3(xs, A.y, ZF), V3(xs, yF, ZF), V3(xs, yB, ZB), V3(xs, A.y, ZB)];
      E.push({geo:new FaceGeo().slab(q, 0.03, 0.5).geo(), matrix:new T.Matrix4().makeTranslation(-0.015, 0, 0), color:new T.Color("#7a1a1a")});   // (centred on xs either side)
      ent(boxGeo(0.034, 0.06, LEN/Math.cos(ang)+0.02), xs, (yF+yB)/2+0.0, ZF-LEN/2, "#e8e4d8", ang, 0, 0); }
    // the ramp's playing surface, tilted: dark green with white lines, and the edge strips
    { const rt=signTex(128,384,(c,Wd,Hh)=>{ c.fillStyle="#1e4a2a"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="rgba(240,240,232,0.6)"; c.lineWidth=3;
        for(let k=1;k<6;k++){ c.beginPath(); c.moveTo(0,k*Hh/6); c.lineTo(Wd,k*Hh/6); c.stroke(); } });
      const ang=Math.atan2(yB-yF, LEN), g=new T.PlaneGeometry(HW*2, LEN/Math.cos(ang));
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:rt, roughness:0.8}));
      m.rotation.set(-Math.PI/2+ang, 0, 0, "YXZ"); m.position.set(X, (yF+yB)/2+0.005, ZF-LEN/2); m.receiveShadow=true; scene.add(m); }
    // a box under it all so nothing shows through underneath
    B(HW*2-0.02, yF-A.y-0.04, LEN-0.02, X, A.y+(yF-A.y-0.04)/2, ZF-LEN/2, "#2a0e0e");
    // the front: a lit panel with the name, the tray the balls come back to, the coin door
    B(HW*2+0.06, yF-A.y+0.10, 0.06, X, A.y+(yF-A.y+0.10)/2, ZF+0.03, "#c42a1a");
    sign(0.86, 0.30, (c,Wd,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#ff7a1a"); g.addColorStop(1,"#c42a1a"); c.fillStyle=g; c.fillRect(0,0,Wd,Hh);
        c.fillStyle="#1a1a1a"; c.beginPath(); c.arc(Wd*0.15,Hh/2,Hh*0.32,0,7); c.fill(); c.strokeStyle="#ff9a3a"; c.lineWidth=3; c.beginPath(); c.arc(Wd*0.15,Hh/2,Hh*0.32,0,7); c.stroke();
        say(c, "HOOPS", Wd*0.58, Hh*0.42, Wd*0.62, Hh*0.50, "#fff6d0", "900", "'Arial Black', Arial");
        say(c, "2 PTS · 3 IN THE LAST 10 SEC", Wd*0.58, Hh*0.80, Wd*0.62, Hh*0.16, "#fff6d0", "700", "Arial"); }, X, A.y+0.42, ZF+0.062, 0, true, 320);
    B(HW*2+0.06, 0.05, 0.30, X, yF+0.025, ZF-0.12, "#1a1a1c");                   // the tray's floor
    B(HW*2+0.06, 0.12, 0.04, X, yF+0.07, ZF+0.04, "#1a1a1c");                    // its lip
    // the frame: square tube up the four corners, across the top, and the nets
    const fz0=ZF-0.62, frameY=A.y+2.80, roofZ=ZB+0.95;                         // the roof net only over the hoop's end
    for(const sd of [-1,1]) for(const zz of [fz0, ZB+0.04]) tubeE(V3(X+sd*(HW+0.02), rampY(zz), zz), V3(X+sd*(HW+0.02), frameY, zz), 0.02, "#2a2a2e");
    for(const zz of [fz0, ZB+0.04]) tubeE(V3(X-HW-0.035, frameY, zz), V3(X+HW+0.035, frameY, zz), 0.02, "#2a2a2e");   // (their ends past the nets' planes)
    for(const sd of [-1,1]) tubeE(V3(X+sd*(HW+0.02), frameY, fz0), V3(X+sd*(HW+0.02), frameY, ZB+0.04), 0.02, "#2a2a2e");
    { const nt=signTex(128,128,(c,Wd,Hh)=>{ c.clearRect(0,0,Wd,Hh); c.strokeStyle="rgba(230,230,230,0.9)"; c.lineWidth=3;
        for(let k=-Wd;k<Wd*2;k+=21){ c.beginPath(); c.moveTo(k,0); c.lineTo(k+Hh,Hh); c.stroke(); c.beginPath(); c.moveTo(k,Hh); c.lineTo(k+Hh,0); c.stroke(); } });
      nt.wrapS=nt.wrapT=T.RepeatWrapping;
      const netM=new T.MeshStandardMaterial({map:nt, transparent:true, alphaTest:0.4, side:T.DoubleSide, roughness:0.9});
      const netPlane=(w,h,px,py,pz,ry,rx)=>{ const g=new T.PlaneGeometry(w,h), U=g.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*w*5, U.getY(k)*h*5);
        const m=new T.Mesh(g, netM); m.position.set(px,py,pz); m.rotation.set(rx||0, ry||0, 0, "YXZ"); scene.add(m); };
      const nl=(ZB+0.04)-fz0, nh=frameY-rampY(fz0);
      for(const sd of [-1,1]) netPlane(-nl, nh, X+sd*(HW+0.02), (frameY+rampY((fz0+ZB)/2))/2, (fz0+ZB+0.04)/2, Math.PI/2);
      netPlane(HW*2+0.04, -(roofZ-(ZB+0.04)), X, frameY-0.01, (roofZ+ZB+0.04)/2, 0, -Math.PI/2);
      tubeE(V3(X-HW-0.035, frameY, roofZ), V3(X+HW+0.035, frameY, roofZ), 0.015, "#2a2a2e"); }
    // the backboard: white, an orange square, on the frame; the scoreboard over it
    B(0.92, 0.68, 0.035, X, (BOARD.y0+BOARD.y1)/2, BOARD.z-0.018, "#f2f0e8");
    for(const [w,h,dy] of [[0.30,0.02,0.10],[0.30,0.02,-0.10]]) B(w, h, 0.004, X, RIM.y+0.13+dy, BOARD.z+0.0015, "#e86a1a");
    for(const sd of [-1,1]) B(0.02, 0.22, 0.004, X+sd*0.14, RIM.y+0.13, BOARD.z+0.0015, "#e86a1a");
    B(0.92, 0.06, 0.20, X, BOARD.y1+0.03, BOARD.z-0.06, "#1a1a1c");
    // the scoreboard sits on the board's top rail, under the frame
    B(0.94, 0.20, 0.12, X, BOARD.y1+0.16, BOARD.z-0.08, "#141416");
    const hoopsC=cvs(256,64), hoopsTex=setSRGB(new T.CanvasTexture(hoopsC));
    { const m=new T.Mesh(new T.PlaneGeometry(0.88, 0.18), new T.MeshBasicMaterial({map:hoopsTex, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      m.position.set(X, BOARD.y1+0.16, BOARD.z-0.08+0.066); scene.add(m); }
    // the rim on its bracket, the net hanging off it
    ent(new T.TorusGeometry(RIM.r, 0.009, 8, 32), RIM.x, RIM.y, RIM.z, "#e8581a", Math.PI/2, 0, 0);
    B(0.06, 0.02, RIM.z-RIM.r-BOARD.z+0.01, X, RIM.y-0.01, (RIM.z-RIM.r+BOARD.z)/2, "#e8581a");
    // the net: a cord mesh round a tapering sleeve, narrower at its foot than a ball, so a ball going
    // through stretches it; 18e moves its rings (the bulge round the ball, the snap down, the sway after)
    const NET={rows:7, segs:18, len:0.30, r0:RIM.r-0.006, r1:0.082};
    { const nt=signTex(256,128,(c,Wd,Hh)=>{ c.clearRect(0,0,Wd,Hh); c.strokeStyle="rgba(246,246,240,1)"; c.lineWidth=5; c.lineCap="round";
        const n=6; for(let k=-n;k<=2*n;k++){ c.beginPath(); c.moveTo(k*Wd/n,0); c.lineTo(k*Wd/n+Wd/n*1.0,Hh); c.stroke(); c.beginPath(); c.moveTo(k*Wd/n,Hh); c.lineTo(k*Wd/n+Wd/n*1.0,0); c.stroke(); } });
      nt.wrapS=T.RepeatWrapping; nt.repeat.set(3,1);
      const g=new T.CylinderGeometry(NET.r0, NET.r1, NET.len, NET.segs, NET.rows-1, true);
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:nt, transparent:true, alphaTest:0.45, side:T.DoubleSide, roughness:0.9}));
      m.position.set(RIM.x, RIM.y-0.012-NET.len/2, RIM.z); scene.add(m);
      NET.mesh=m; NET.base=Float32Array.from(g.attributes.position.array); }
    // the balls: four, in the tray (18e throws them)
    const ballTex=signTex(256,128,(c,Wd,Hh)=>{ c.fillStyle="#d8641e"; c.fillRect(0,0,Wd,Hh);
      for(let k=0;k<900;k++){ c.fillStyle="rgba(90,30,10,0.25)"; c.fillRect(Math.random()*Wd, Math.random()*Hh, 1.5, 1.5); }
      c.strokeStyle="#1a0e08"; c.lineWidth=3; c.beginPath(); c.moveTo(0,Hh/2); c.lineTo(Wd,Hh/2); c.stroke();
      for(const xx of [Wd*0.25, Wd*0.75]){ c.beginPath(); c.moveTo(xx,0); c.lineTo(xx,Hh); c.stroke(); }
      for(const xx of [0, Wd/2]){ c.beginPath(); c.ellipse(xx+Wd/4, Hh/2, Wd*0.14, Hh/2, 0, 0, 7); c.stroke(); } });
    const ballM=new T.MeshStandardMaterial({map:ballTex, roughness:0.65}), BR=0.089, balls=[];
    for(let k=0;k<4;k++){ const m=new T.Mesh(new T.SphereGeometry(BR, 20, 14), ballM); m.castShadow=true;
      m.position.set(X-0.30+k*0.20, yF+0.05+BR, ZF-0.14); scene.add(m); balls.push(m); }
    ARCADE.hoops={x:X, zf:ZF, zb:ZB, hw:HW, len:LEN, yF:yF, yB:yB, rampY:rampY, rim:RIM, board:BOARD, top:frameY, roofZ:roofZ, netZ0:fz0, net:NET,
                  balls:balls, br:BR, tray:{y:yF+0.05+BR, z:ZF-0.14}, score:{c:hoopsC, tex:hoopsTex}, floor:A.y};
    addCol(X-HW-0.05, X+HW+0.05, ZB, ZF+0.07, A.y-0.5, frameY+0.4);
    addUse(X, ZF+0.70, A.y, "PLAY HOOPS", ()=>{ if(typeof HOOPS!=="undefined") HOOPS.start(); }, 0.9); }

  // stools by the cabinets, a can by the door, the rules on the east wall
  for(const [x,z] of [[69.3,-214.7],[70.6,-217.6]]){ C(0.17, 0.05, x, A.y+0.66, z, "#c42a1a", 16); C(0.025, 0.62, x, A.y+0.33, z, "#9a9da0", 8); C(0.20, 0.02, x, A.y+0.01, z, "#9a9da0", 16); }
  // (the can a stride south of the token changer, not in it)
  swingCan(A.x1-0.4, A.z1-2.25, -Math.PI/2, A.y);
  addCol(A.x1-0.65, A.x1, A.z1-2.50, A.z1-2.00, A.y-0.5, A.y+0.9);
  sign(0.70, 0.46, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); x.strokeStyle="#c42a1a"; x.lineWidth=6; x.strokeRect(5,5,W-10,Hh-10);
      const F="'Comic Sans MS', 'Marker Felt', cursive";
      say(x, "HOUSE RULES", W/2, Hh*0.16, W*0.80, Hh*0.15, "#c42a1a", "700", F);
      ["NO DRINKS ON THE MACHINES","WINNER STAYS ON (AIR HOCKEY)","NO HANGING ON THE RIM, DALE","WHAT'S DOWN HERE STAYS DOWN HERE"].forEach((s,i)=>say(x, s, W/2, Hh*(0.36+i*0.15), W*0.86, Hh*0.10, "#1a1a1a", "600", F)); },
    A.x1-0.012, A.y+1.70, -215.0, -Math.PI/2);

  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.15}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  addZone(A.x0, A.x1, A.z0, A.z1+WT, A.y-0.5, A.y+A.h, "THE ARCADE", true);
  addBuried(A.x0, A.x1, A.z0, A.z1+WT, A.y-0.5, A.y+A.h+0.05, 0);
  ARCADE.room=A;
})();

/* the attract screens: twelve cells of one canvas, redrawn a dozen times a
   second while you are near enough to see them, each one its game's loop */
function _arcadeScreen(x, k, ox, oy, t, seed){
  const W=128, H=128; x.save(); x.beginPath(); x.rect(ox,oy,W,H); x.clip(); x.translate(ox,oy);
  x.fillStyle="#000"; x.fillRect(0,0,W,H);
  const ph=t+seed*3.1;
  if(k===0){                                                         // invaders: a block of them stepping, a ship, its shot
    const sx=Math.round(Math.sin(ph*0.8)*12);
    for(let r=0;r<4;r++) for(let c=0;c<7;c++){ x.fillStyle=["#ff4fbf","#4fd8ff","#7aff7a","#f2e23a"][r]; const px=18+c*14+sx, py=16+r*12+((ph*2|0)%2)*2;
      x.fillRect(px,py,8,5); x.fillRect(px+1,py+5,2,2); x.fillRect(px+5,py+5,2,2); }
    const shx=64+Math.sin(ph*1.3)*40; x.fillStyle="#7aff7a"; x.fillRect(shx-6,112,12,5); x.fillRect(shx-1,108,2,4);
    x.fillStyle="#fff"; x.fillRect(shx-1, 104-((ph*120)%90), 2, 5);
  }else if(k===1){                                                   // a maze, its dots, and the muncher round it
    x.strokeStyle="#2a3aff"; x.lineWidth=3; for(let i=0;i<5;i++){ x.strokeRect(10+i*6,10+i*6,108-i*12,108-i*12); }
    x.fillStyle="#f2e2a0"; for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; x.fillRect(64+Math.cos(a)*40, 64+Math.sin(a)*40, 2, 2); }
    const a=ph*1.4, px=64+Math.cos(a)*40, py=64+Math.sin(a)*40, m=Math.abs(Math.sin(ph*10))*0.6;
    x.fillStyle="#f2e23a"; x.beginPath(); x.moveTo(px,py); x.arc(px,py,7,a+Math.PI/2+m,a+Math.PI/2-m+Math.PI*2); x.fill();
    x.fillStyle="#ff3a3a"; const b=a-0.9; x.fillRect(64+Math.cos(b)*40-6, 64+Math.sin(b)*40-6, 12, 10);
  }else if(k===2){                                                   // a road running at you, a car on it
    const g=x.createLinearGradient(0,0,0,60); g.addColorStop(0,"#0a0a3a"); g.addColorStop(1,"#3a1a5a"); x.fillStyle=g; x.fillRect(0,0,W,60);
    x.fillStyle="#1a3a1a"; x.fillRect(0,60,W,68);
    x.fillStyle="#3a3a3a"; x.beginPath(); x.moveTo(60,60); x.lineTo(68,60); x.lineTo(124,128); x.lineTo(4,128); x.fill();
    for(let i=0;i<6;i++){ const u=((ph*1.5+i/6)%1), y=60+u*u*68, w=2+u*8; x.fillStyle="#fff"; x.fillRect(64-w/2, y, w, 2+u*6); }
    x.fillStyle="#ff3a3a"; const cx=64+Math.sin(ph)*22; x.fillRect(cx-12,104,24,12); x.fillStyle="#222"; x.fillRect(cx-14,112,6,6); x.fillRect(cx+8,112,6,6);
  }else if(k===3){                                                   // blocks falling into a well
    x.strokeStyle="#888"; x.strokeRect(34,6,60,116);
    const cols=["#ff4fbf","#4fd8ff","#f2e23a","#7aff7a","#ff7a2a"];
    for(let r=0;r<5;r++) for(let c=0;c<6;c++) if((r*7+c*3+seed)%4) { x.fillStyle=cols[(r+c)%5]; x.fillRect(35+c*10, 112-r*10, 9, 9); }
    const y=((ph*30)%60)|0; x.fillStyle="#f2e23a"; for(const [dx,dy] of [[0,0],[10,0],[20,0],[10,-10]]) x.fillRect(55+dx, 10+y*1+dy+10, 9, 9);
  }else if(k===4){                                                   // lanes of traffic and a frog trying it
    for(let r=0;r<6;r++){ x.fillStyle=r%3===0?"#1a3a1a":"#222"; x.fillRect(0,10+r*18,W,18);
      for(let c=0;c<3;c++){ const px=((ph*(20+r*9)*(r%2?1:-1)+c*50+r*13)%160+160)%160-16; x.fillStyle=["#ff3a3a","#3fa0ff","#f2e23a"][(r+c)%3]; x.fillRect(px, 14+r*18, 20, 10); } }
    x.fillStyle="#7aff7a"; x.fillRect(58, 118-((ph*12|0)%6)*18, 10, 8);
  }else{                                                             // a wall of bricks, a ball, a bat
    const cols=["#ff3a3a","#ff7a2a","#f2e23a","#7aff7a","#4fd8ff"];
    for(let r=0;r<5;r++) for(let c=0;c<8;c++) if((r*8+c+seed)%5) { x.fillStyle=cols[r]; x.fillRect(4+c*15, 14+r*7, 14, 6); }
    const bx=64+Math.sin(ph*2.1)*56, by=80+Math.sin(ph*3.3)*30; x.fillStyle="#fff"; x.fillRect(bx-2,by-2,4,4);
    x.fillStyle="#4fd8ff"; x.fillRect(bx-14,118,28,4);
  }
  // the score line, and the CRT's own light
  x.fillStyle="#fff"; x.font="bold 9px 'Courier New', monospace"; x.textAlign="left"; x.textBaseline="top";
  x.fillText("1UP "+String(((t*731+seed*977)|0)%100000).padStart(5,"0"), 10, 14); x.textAlign="right"; x.fillText("CREDIT 0", W-10, 14);
  if(((t*2)|0)%2) { x.textAlign="center"; x.fillStyle="#f2e23a"; x.fillText("INSERT COIN", W/2, H-24); }
  x.fillStyle="rgba(0,0,0,0.25)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);
  x.restore();
}
function updateArcade(dt){
  const A=ARCADE; if(!A.room) return;
  const cam=camera.position, R=A.room, near=cam.x>R.x0-6 && cam.x<R.x1+6 && cam.z>R.z0-6 && cam.z<R.z1+8 && cam.y<R.y+4;
  A.t+=dt;
  // the puck drifts on the air, off the rails
  const P=A.puck; if(P && !(typeof HOCKEY!=="undefined" && HOCKEY.on)){ P.x+=P.vx*dt; P.z+=P.vz*dt;
    if(Math.abs(P.x-P.cx)>P.hx){ P.vx=-P.vx; P.x=P.cx+Math.sign(P.x-P.cx)*P.hx; }
    if(Math.abs(P.z-P.cz)>P.hz){ P.vz=-P.vz; P.z=P.cz+Math.sign(P.z-P.cz)*P.hz; }
    P.m.position.set(P.x, P.y, P.z); }
  if(!near || !A.screens) return;
  A.acc+=dt; if(A.acc<1/12) return; A.acc=0;
  const x=A.screens.x;
  for(let i=1;i<4;i++) _arcadeScreen(x, i, i*128, 0, A.t, i);       // (the first cabinet's screen is its own: 18f draws it)
  A.screens.tex.needsUpdate=true;
}
