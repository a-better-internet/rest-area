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
   into a room the crew filled with what came out of a closed arcade in
   Erie: a cosmic carpet, black walls with pink and blue neon along them,
   a dozen upright cabinets running their attract screens, two pinball
   machines, a token changer, and an air hockey table in the middle with
   its puck riding the air. All of it BURIED: the same at any hour (19).
   ---------------------------------------------------------------------- */
const ARCADE={screens:null, puck:null, t:0, acc:0, games:[], room:null};
(function arcade(){
  const D=HANGOUT.door; if(!D) return;
  const FB=D.y, SR=0.19, NS=6, FH=FB-NS*SR;                       // the corridor floor, six risers under the cellar's
  const CX0=71.0, CX1=73.0, LZ0=D.z, LZ1=D.z-0.80;                 // the corridor's width; the landing inside the door
  const STZ1=LZ1-(NS-1)*0.30;                                      // the foot of the stair
  const CZ1=-211.0;                                                // where the corridor meets the room
  const A={x0:63.5, x1:80.5, z0:-224.0, z1:CZ1, y:FH, h:3.0};      // the room
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
  wallBox("block", CX0-WT, CX0, CZ1, LZ0, FH-0.1, TOP, LOW, 0.6, FH);
  wallBox("block", CX1, CX1+WT, CZ1, LZ0, FH-0.1, TOP, LOW, 0.6, FH);
  for(let k=1;k<NS;k++){
    const za=LZ1-(k-1)*0.30, zb=za-0.30, y=FB-k*SR;
    bx("concrete", CX1-CX0-0.004, y-FH, 0.30, (CX0+CX1)/2, (y+FH)/2, (za+zb)/2, 0.5, 0, "#a8a49a");
    bx("paint", CX1-CX0-0.03, 0.004, 0.05, (CX0+CX1)/2, y+0.002, zb+0.026, 0, 0, "#e2b31c");
    addFlat(CX0, CX1, zb, za, y);
  }
  bx("paint", CX1-CX0-0.03, 0.004, 0.05, (CX0+CX1)/2, FB+0.006, LZ1+0.026, 0, 0, "#e2b31c");
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
  for(const dx of [0.6, 0.66]) tubeE(V3(CX0+dx, CEIL_LO-0.04, STZ1), V3(CX0+dx, CEIL_LO-0.04, CZ1), 0.012, "#8f9496");
  B(0.45, 0.30, STZ1-CZ1, CX1-0.30, CEIL_LO-0.16, (CZ1+STZ1)/2, "#a6a9aa");
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
  wallBox("block", A.x0, CX0, A.z1, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
  wallBox("block", CX1, A.x1, A.z1, A.z1+WT, A.y-0.1, ATOP, WALLC, 0.6, A.y);
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
    m.rotation.x=-Math.PI/2; m.position.set((A.x0+A.x1)/2, A.y+0.004, (A.z0+A.z1)/2); m.receiveShadow=true; scene.add(m);
    floorAt("concrete", CX0, CX1, A.z1, A.z1+WT, A.y+0.004, "#8a8d84", 0.5); }
  // neon along the walls, pink and blue, at the height the old place had it
  { const pink=new T.MeshBasicMaterial({color:0xff4fbf, toneMapped:false}), blue=new T.MeshBasicMaterial({color:0x4fd8ff, toneMapped:false});
    const run=(x0,x1,z0,z1,y,m)=>{ const g=new T.BoxGeometry(Math.max(0.025,x1-x0), 0.025, Math.max(0.025,z1-z0)); const o=new T.Mesh(g,m); o.position.set((x0+x1)/2,y,(z0+z1)/2); scene.add(o); };
    for(const [y,m] of [[A.y+2.35,pink],[A.y+2.47,blue]]){
      run(A.x0+0.02, A.x0+0.045, A.z0, A.z1, y, m); run(A.x1-0.045, A.x1-0.02, A.z0, A.z1, y, m);
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
  // the light: low, coloured, from the ceiling corners, and the screens themselves
  for(const [x,z,c] of [[66.5,-214.0,0x9a5cff],[77.5,-214.0,0x4fb8ff],[66.5,-221.0,0xff5fb0],[77.5,-221.0,0x7a6cff],[72.0,-217.5,0xfff0e0],[69.0,-222.0,0xd8c8ff],[65.2,-217.0,0xc8d8ff]])
    lamp({x:x, y:A.y+2.25, z:z, color:c, intensity:c===0xfff0e0?0.70:0.85, dist:10, decay:1.4});

  /* ---- the cabinets ------------------------------------------------------------- */
  const NAMES=["ASTRO RAIDERS","MAZE MUNCHER","TURNPIKE RACER","BLOCK DROP","TOAD CROSSING","BRICK BUSTER",
               "STAR DUEL","MOLE PATROL","KNIGHT FLIGHT","HAYMAKER","LIGHT CYCLES","NIGHT DRIVER"];
  const KIND=[0,1,2,3,4,5,0,1,4,5,2,3];                              // which attract screen each runs
  const SIDE=["#1f3fa0","#c42a1a","#1a1a1c","#2f7a3c","#3fa0a8","#c48a1a","#5a2a8a","#a8281a","#2a5a9a","#7a1a1a","#1a6a7a","#3a3a40"];
  const scrC=cvs(512,384), scrTex=setSRGB(new T.CanvasTexture(scrC)); scrTex.minFilter=T.LinearFilter;
  const marC=cvs(512,384), mx=marC.getContext("2d");
  NAMES.forEach((n,i)=>{ const ox=(i%4)*128, oy=((i/4)|0)*96, g=mx.createLinearGradient(0,oy,0,oy+96);
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
    const pj=L(-0.14, 0.50); C(0.008, 0.10, pj[0], A.y+1.01, pj[1], "#1a1a1a", 6); ent(new T.SphereGeometry(0.022,10,8), pj[0], A.y+1.07, pj[1], "#c42a1a");
    for(let b=0;b<3;b++){ const pb=L(0.04+b*0.07, 0.50-b*0.01); C(0.016, 0.02, pb[0], A.y+0.985, pb[1], ["#f2e23a","#3fa0ff","#ff3a3a"][b], 12); }
    q(0.60, 0.06, 0.40, 0, 1.79, 0.18, K);                             // the marquee's hood
    q(0.56, 0.02, 0.06, 0, 1.30-0.24, 0.355, K);                       // the bezel's lip
    // the screen tipped back a little, the marquee lit over it
    const ps=L(0, 0.40), pm=L(0, 0.392);                               // (the screen's top, tipped back, still clear of the box)
    scrG.push({geo:cellGeo(0.48, 0.40, KIND[i]+ (i>=6?6:0), 3, 4), matrix:new T.Matrix4().compose(V3(ps[0], A.y+1.30, ps[1]), new T.Quaternion().setFromEuler(new T.Euler(-0.20, ry, 0, "YXZ")), V3(1,1,1)), color:new T.Color(0xffffff)});
    marG.push({geo:cellGeo(0.56, 0.16, i, 4, 4), matrix:new T.Matrix4().compose(V3(pm[0], A.y+1.68, pm[1]), new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0, "YXZ")), V3(1,1,1)), color:new T.Color(0xffffff)});
    const a0=L(-0.34,-0.42), a1=L(0.34,0.62);
    addCol(Math.min(a0[0],a1[0]), Math.max(a0[0],a1[0]), Math.min(a0[1],a1[1]), Math.max(a0[1],a1[1]), A.y-0.5, A.y+1.86);
    const pu=L(0, 1.15);
    addUse(pu[0], pu[1], A.y, "PLAY "+NAMES[i], ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("coin", pu[0], pu[1]);
      toast([`A TOKEN IN. NINETY SECONDS LATER: GAME OVER. HI SCORE STILL "MKE"`, "IT EATS THE TOKEN AND KEEPS RUNNING ITS ATTRACT MODE", "YOU GET TO THE SECOND LEVEL. THE JOYSTICK STICKS LEFT"][(Math.random()*3)|0], "#cfe0d4"); }, 0.9);
    ARCADE.games.push({name:NAMES[i], x:pu[0], z:pu[1]});
  };
  // five down the west wall facing in, seven along the back wall facing the door
  for(let k=0;k<5;k++) cab(k, A.x0+0.45, -213.2-k*0.78*1.15, Math.PI/2);
  for(let k=0;k<7;k++) cab(5+k, 66.2+k*0.80*1.15, A.z0+0.45, 0);
  // the screens and marquees: two meshes, two textures, every cabinet a cell of them
  scene.add(new T.Mesh(mergeEntries(scrG), scrM)); scene.add(new T.Mesh(mergeEntries(marG), marM));
  ARCADE.screens={c:scrC, x:scrC.getContext("2d"), tex:scrTex};

  /* ---- two pinball tables and the token changer, down the east wall ----------- */
  const pinArt=(title, a, b)=>signTex(256,256,(x,W,Hh)=>{ const g=x.createLinearGradient(0,0,W,Hh); g.addColorStop(0,a); g.addColorStop(1,b); x.fillStyle=g; x.fillRect(0,0,W,Hh);
    for(let i=0;i<14;i++){ x.fillStyle="rgba(255,255,255,"+(0.06+Math.random()*0.1)+")"; x.beginPath(); x.arc(Math.random()*W, Math.random()*Hh, 6+Math.random()*30, 0, 7); x.fill(); }
    x.shadowColor="#000"; x.shadowBlur=6; const w=title.split(" ");
    w.forEach((s,j)=>say(x, s, W/2, Hh*(0.38+j*0.22), W*0.84, Hh*0.20, "#fff6d0", "900", "'Arial Black', Arial")); });
  for(const [z,title,a,b] of [[-213.6,"THUNDER ROAD","#c42a1a","#2a0a5a"],[-215.9,"HAUNTED HOLLOW","#2a8a3a","#1a0a2a"]]){
    const x=A.x1-0.80;                                                              // long way out from the wall, you at the west end
    B(1.40, 0.30, 0.75, x, A.y+0.88, z, "#1a1a1c");
    for(const [lx,lz] of [[-0.62,-0.33],[0.62,-0.33],[-0.62,0.33],[0.62,0.33]]) B(0.05, 0.73, 0.05, x+lx, A.y+0.365, z+lz, "#9a9da0");
    const pf=new T.Mesh(new T.PlaneGeometry(1.28, 0.66), new T.MeshBasicMaterial({map:pinArt(title,a,b), toneMapped:false}));
    pf.rotation.x=-Math.PI/2; pf.position.set(x-0.04, A.y+1.042, z); scene.add(pf);
    B(0.16, 0.75, 0.75, x+0.62, A.y+1.405, z, "#1a1a1c");                         // the backbox at the wall end
    const bg=new T.Mesh(new T.PlaneGeometry(0.66, 0.62), new T.MeshBasicMaterial({map:pinArt(title,b,a), toneMapped:false}));
    bg.position.set(x+0.53, A.y+1.405, z); bg.rotation.y=-Math.PI/2; scene.add(bg);
    addCol(x-0.72, x+0.72, z-0.40, z+0.40, A.y-0.5, A.y+1.9);
    addUse(x-0.95, z, A.y, "PLAY "+title, ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("coin", x, z);
      toast(["THE BALL DRAINS DOWN THE LEFT OUTLANE. TILT WARNING ON THE THIRD","REPLAY AT 3,400,000. YOU GET 1,210,850"][(Math.random()*2)|0], "#cfe0d4"); }, 1.0); }
  { const x=A.x1-0.24, z=-219.0;
    B(0.46, 1.50, 0.40, x, A.y+0.75, z, "#7d8286");
    sign(0.38, 0.30, (cx,W,Hh)=>{ cx.fillStyle="#1a1c1e"; cx.fillRect(0,0,W,Hh); say(cx, "TOKENS", W/2, Hh*0.30, W*0.80, Hh*0.30, "#f4c430", "900", "'Arial Black', Arial");
        say(cx, "4 FOR $1 · 25 FOR $5", W/2, Hh*0.66, W*0.86, Hh*0.16, "#e8e8e2", "600", "Arial"); }, x-0.238, A.y+1.20, z, -Math.PI/2, true, 240);
    B(0.12, 0.08, 0.22, x-0.26, A.y+0.48, z, "#b9bcbd");
    addCol(x-0.25, A.x1, z-0.22, z+0.22, A.y-0.5, A.y+1.5);
    addUse(x-0.9, z, A.y, "GET TOKENS", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("coins", x, z); toast("FOUR BRASS TOKENS. “GOOD FOR ONE PLAY · NO CASH VALUE”","#cfe0d4"); }, 1.0); }

  /* ---- the air hockey table, its puck on its cushion of air ---------------------- */
  { const x=72.0, z=-217.6, L=2.20, W=1.16, top=A.y+0.80;
    B(L, 0.24, W, x, top-0.12, z, "#1d2a6a");
    for(const [lx,lz] of [[-0.95,-0.45],[0.95,-0.45],[-0.95,0.45],[0.95,0.45]]) B(0.10, top-0.24-A.y, 0.10, x+lx, A.y+(top-0.24-A.y)/2, z+lz, "#1a1a1c");
    for(const sd of [-1,1]){ B(L, 0.06, 0.06, x, top+0.03, z+sd*(W/2-0.03), "#c42a1a"); B(0.06, 0.058, W-0.12, x+sd*(L/2-0.03), top+0.029, z, "#c42a1a"); }
    const field=signTex(512,256,(c,Wd,Hh)=>{ c.fillStyle="#eef2f6"; c.fillRect(0,0,Wd,Hh);
      c.fillStyle="rgba(120,130,150,0.5)"; for(let i=8;i<Wd;i+=14) for(let j=8;j<Hh;j+=14) c.fillRect(i,j,2,2);
      c.strokeStyle="#c42a1a"; c.lineWidth=4; c.beginPath(); c.moveTo(Wd/2,0); c.lineTo(Wd/2,Hh); c.stroke(); c.beginPath(); c.arc(Wd/2,Hh/2,40,0,7); c.stroke();
      c.strokeStyle="#1f4fd8"; for(const gx of [Wd*0.25,Wd*0.75]){ c.beginPath(); c.moveTo(gx,0); c.lineTo(gx,Hh); c.stroke(); }
      for(const gx of [0,Wd]){ c.beginPath(); c.arc(gx,Hh/2,64,0,7); c.stroke(); }
      c.fillStyle="#1a1a1a"; c.fillRect(0,Hh/2-34,8,68); c.fillRect(Wd-8,Hh/2-34,8,68); });
    const f=new T.Mesh(new T.PlaneGeometry(L-0.12, W-0.12), new T.MeshStandardMaterial({map:field, roughness:0.25}));
    f.rotation.x=-Math.PI/2; f.position.set(x, top+0.008, z); scene.add(f);
    // the overhead score: two red counts on a post at the end
    B(0.06, 1.5, 0.06, x+L/2+0.10, A.y+0.75+0.8, z, "#1a1a1c");
    B(0.10, 0.30, 0.70, x+L/2+0.10, A.y+2.20, z, "#141416");
    sign(0.62, 0.24, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0a"; c.fillRect(0,0,Wd,Hh); c.shadowColor="#ff2a1a"; c.shadowBlur=10;
        say(c, "0  ·  0", Wd/2, Hh/2, Wd*0.80, Hh*0.66, "#ff3a2a", "700", "'Courier New', monospace"); }, x+L/2+0.044, A.y+2.20, z, -Math.PI/2, true, 240);
    // the mallets and the puck (the puck is moved by updateArcade)
    for(const sd of [-1,1]){ C(0.045, 0.03, x+sd*(L/2-0.30), top+0.016, z+sd*0.12, sd<0?"#c42a1a":"#1f4fd8", 16); C(0.018, 0.05, x+sd*(L/2-0.30), top+0.055, z+sd*0.12, "#1a1a1a", 10); }
    const puck=new T.Mesh(new T.CylinderGeometry(0.031,0.031,0.008,16), new T.MeshStandardMaterial({color:0xd8241a, roughness:0.4}));
    puck.position.set(x, top+0.016, z); scene.add(puck);                          // riding its air, a few millimetres up
    ARCADE.puck={m:puck, x:x, z:z, vx:0.35, vz:0.22, hx:L/2-0.12, hz:W/2-0.10, cx:x, cz:z, y:top+0.016};
    addCol(x-L/2, x+L/2, z-W/2, z+W/2, A.y-0.5, top+0.06);
    addUse(x, z+W/2+0.6, A.y, "PLAY AIR HOCKEY", ()=>toast("NOBODY ON THE OTHER END. THE PUCK FLOATS ON ITS AIR","#cfe0d4"), 1.2); }
  // stools, a can, the rules
  for(const [x,z] of [[67.6,-214.5],[67.6,-216.8],[70.1,-221.8]]){ C(0.17, 0.05, x, A.y+0.66, z, "#c42a1a", 16); C(0.025, 0.62, x, A.y+0.33, z, "#9a9da0", 8); C(0.20, 0.02, x, A.y+0.01, z, "#9a9da0", 16); }
  swingCan(A.x1-0.4, A.z1-0.40, Math.PI, A.y);
  addCol(A.x1-0.65, A.x1, A.z1-0.65, A.z1, A.y-0.5, A.y+0.9);
  sign(0.70, 0.46, (x,W,Hh)=>{ x.fillStyle="#f4f0e2"; x.fillRect(0,0,W,Hh); x.strokeStyle="#c42a1a"; x.lineWidth=6; x.strokeRect(5,5,W-10,Hh-10);
      const F="'Comic Sans MS', 'Marker Felt', cursive";
      say(x, "HOUSE RULES", W/2, Hh*0.16, W*0.80, Hh*0.15, "#c42a1a", "700", F);
      ["NO DRINKS ON THE MACHINES","WINNER STAYS ON (AIR HOCKEY)","DON'T TILT THE PINBALL, DALE","WHAT'S DOWN HERE STAYS DOWN HERE"].forEach((s,i)=>say(x, s, W/2, Hh*(0.36+i*0.15), W*0.86, Hh*0.10, "#1a1a1a", "600", F)); },
    A.x1-0.012, A.y+1.70, -222.6, -Math.PI/2);

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
  x.fillText("1UP "+String(((t*731+seed*977)|0)%100000).padStart(5,"0"), 4, 2); x.textAlign="right"; x.fillText("CREDIT 0", W-4, 2);
  if(((t*2)|0)%2) { x.textAlign="center"; x.fillStyle="#f2e23a"; x.fillText("INSERT COIN", W/2, H-12); }
  x.fillStyle="rgba(0,0,0,0.25)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);
  x.restore();
}
function updateArcade(dt){
  const A=ARCADE; if(!A.room) return;
  const cam=camera.position, R=A.room, near=cam.x>R.x0-6 && cam.x<R.x1+6 && cam.z>R.z0-6 && cam.z<R.z1+8 && cam.y<R.y+4;
  A.t+=dt;
  // the puck drifts on the air, off the rails
  const P=A.puck; if(P){ P.x+=P.vx*dt; P.z+=P.vz*dt;
    if(Math.abs(P.x-P.cx)>P.hx){ P.vx=-P.vx; P.x=P.cx+Math.sign(P.x-P.cx)*P.hx; }
    if(Math.abs(P.z-P.cz)>P.hz){ P.vz=-P.vz; P.z=P.cz+Math.sign(P.z-P.cz)*P.hz; }
    P.m.position.set(P.x, P.y, P.z); }
  if(!near || !A.screens) return;
  A.acc+=dt; if(A.acc<1/12) return; A.acc=0;
  const x=A.screens.x;
  for(let i=0;i<12;i++) _arcadeScreen(x, i%6, (i%4)*128, ((i/4)|0)*128, A.t, i);
  A.screens.tex.needsUpdate=true;
}
