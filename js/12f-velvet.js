"use strict";
/* REST AREA · 12f-velvet.js
   the velvet room behind the man cave's locked door
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   12f · THE VELVET ROOM
   The poker room under the generator house (12b) has a steel door in its
   south wall, under the house's own front door, that nobody has seen
   open. It has a keypad. Type the word (the last can in the fridge has it
   on in marker) and it opens on a room dug out under the yard: crimson
   velvet hung on every wall, a carpet you sink into, a chesterfield and
   two wing chairs, a bar cart of decanters, a record console playing the
   jazz trio, gold frames, a little chandelier, and the name over it all
   in pink neon. Behind a curtain of beads at the back is the back room:
   a round bed in red satin under a mirror, a little stage with a brass
   pole and a mirror ball over it, champagne on ice, a rack of the kind of
   magazines kept behind the counter, prints of a lady in silhouette, an
   AFTER HOURS heart in neon, and Violet on the chaise with a coupe of
   champagne, who has seen everybody come through that curtain.

   From the poker room there is no door to see: the opening is faced with
   the same painted block as the wall round it (TEX.block, its courses run
   on from the wall's), on the leaf, so it swings with it. One block by it
   sits a little proud; E there brings up the keypad.

   The door is 01's makeDoor, latched (latchDoor), with its own `onUse`:
   while it is locked E brings up the keypad (VELVET.ask), a box you type
   into; ENTER tries the word, ESC lets it be. Once it is open it opens and
   shuts with E like any latched door. The keypad takes the keyboard while
   it is up (17's keydown chain asks VELVET.typing first).

   PLAN (world): the room x 77.5..82.5, z -176.0..-168.4 (the lounge to the
   partition at z -171.4, the back room behind it), its floor the
   poker room's (FB) and its ceiling the same (CB), under the yard's ground
   (2.6): it is a VOID, BURIED and lit by under lamps only.
   ---------------------------------------------------------------------- */
const VELVET={open:false, typing:false, door:null, radios:[], el:null};
(function velvetRoom(){
  const FY=SUB_G+0.15, FB=FY-2.65, CB=FY-0.40, WT=0.25;
  const X0=77.5, X1=82.5, Z0=-176.0, Z1=-168.4, ZP=-171.4, DA=79.5, DB=80.46, DH=FB+2.10;
  const BA=81.35, BB=82.35;                                    // (the beaded opening through the partition to the back room)
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const CT=(r0,r1,h,x,y,z,c,seg)=>ent(new T.CylinderGeometry(r0,r1,h,seg||12),x,y,z,c);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family); };
  const lamp=(x, y, z, k, col, dist)=>{ const o={x:x, y:y, z:z, color:col||0xffb878, intensity:k, dist:dist||5, decay:1.5, indoor:true, under:true, circ:"bldg"}; LAMPS.push(o); return o; };
  const plane=(w, h, mat, x, y, z, ry, rx)=>{ const m=new T.Mesh(new T.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx||0, ry||0, 0, "YXZ"); m.receiveShadow=true; scene.add(m); return m; };

  /* ---- the shell: block walls round it (the north one is the poker room's, cut for the door in 12b), a slab under, a slab over */
  wallBox("block", X0-WT+0.01, X0, Z0-0.02, Z1+WT, FB-0.1, CB+0.1, "#d6cdb6", 0.6, FB);
  wallBox("block", X1, X1+WT-0.01, Z0-0.02, Z1+WT, FB-0.1, CB+0.1, "#d6cdb6", 0.6, FB);
  wallBox("block", X0, X1, Z1, Z1+WT, FB-0.1, CB+0.1, "#d6cdb6", 0.6, FB);
  // the partition between the lounge and the back room, open at its east end under a header
  wallBox("block", X0, BA, ZP, ZP+WT, FB-0.1, CB+0.1, "#d6cdb6", 0.6, FB); wallBox("block", BB, X1, ZP, ZP+WT, FB-0.1, CB+0.1, "#d6cdb6", 0.6, FB);
  wallBox("block", BA, BB, ZP, ZP+WT, DH, CB+0.1, "#d6cdb6", 0.6, FB);
  B(X1-X0+0.02, 0.2, Z1-Z0, (X0+X1)/2, FB-0.1, (Z0+Z1)/2, "#5a5048"); B(X1-X0+0.02, 0.12, Z1-Z0, (X0+X1)/2, CB+0.05, (Z0+Z1)/2, "#2a0a10");      // (its underside 1 cm under the house slab's, which it meets by the north wall)
  addFlat(X0, X1, Z0, Z1, FB); addFlat(DA, DB, Z0-0.27, Z0+0.02, FB);
  B(DB-DA-0.004, 0.02, WT, (DA+DB)/2, FB+0.002, Z0-WT/2, "#b8963a");                         // (the brass threshold across the wall)
  addVoid(X0, X1, Z0, Z1, FB-3, FB+1.5, FB); addVoid(DA, DB, Z0-0.27, Z0+0.02, FB-3, FB+1.5, FB);   // (only as high as feet go down here: the yard's ground is 20 cm over the ceiling)   // (and the doorway through the wall: not the yard's ground over it)
  addZone(X0, X1, Z0, Z1, FB-0.5, CB, "THE VELVET ROOM", true);
  addZone(X0, X1, ZP+WT, Z1, FB-0.5, CB, "THE VELVET ROOM · THE BACK ROOM", true);
  addBuried(X0, X1, Z0, Z1, FB-0.5, CB+0.05, 0.3, 0x8a2a3a);

  /* ---- velvet on the walls: crimson, hung in pleats, 2 cm off the block; the north wall round the door. A carpet; a ceiling of it ---- */
  const pleat=signTex(512, 256, (c, W, H)=>{ for(let x=0;x<W;x++){ const t=Math.sin(x/W*Math.PI*2*12), v=0.55+0.45*t*Math.abs(t);
      c.fillStyle="rgb("+Math.round(70+60*v)+","+Math.round(6+10*v)+","+Math.round(18+18*v)+")"; c.fillRect(x, 0, 1, H); }
    const g=c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(0,0,0,0.35)"); g.addColorStop(0.15, "rgba(0,0,0,0)"); g.addColorStop(0.9, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.3)"); c.fillStyle=g; c.fillRect(0, 0, W, H); });
  pleat.wrapS=T.RepeatWrapping;
  const vel=(w)=>{ const t=pleat.clone(); t.needsUpdate=true; t.wrapS=T.RepeatWrapping; t.repeat.set(w/1.2, 1); return new T.MeshStandardMaterial({map:t, roughness:0.95, color:0xffffff}); };
  const H=CB-FB-0.02, YM=FB+H/2+0.01;
  plane(X1-X0-0.04, H, vel(X1-X0), (X0+X1)/2, YM, Z1-0.02, Math.PI);                  // the south wall
  plane(Z1-Z0-0.04, H, vel(Z1-Z0), X0+0.02, YM, (Z0+Z1)/2, Math.PI/2);                // the west
  plane(Z1-Z0-0.04, H, vel(Z1-Z0), X1-0.02, YM, (Z0+Z1)/2, -Math.PI/2);               // the east
  for(const [a, b] of [[X0+0.02, DA-0.06],[DB+0.06, X1-0.02]]) plane(b-a, H, vel(b-a), (a+b)/2, YM, Z0+0.02, 0);   // the north, either side of the door
  // the partition: velvet on both faces either side of the beads, and over them
  for(const [zf, ry] of [[ZP-0.02, Math.PI],[ZP+WT+0.02, 0]]){ for(const [a, b] of [[X0+0.02, BA-0.06],[BB+0.06, X1-0.02]]) if(b-a>0.05) plane(b-a, H, vel(b-a), (a+b)/2, YM, zf, ry);
    plane(BB-BA+0.12, CB-DH-0.07, vel(1.1), (BA+BB)/2, (DH+0.05+CB)/2, zf, ry);
    for(const x of [BA-0.035, BB+0.035]) B(0.06, DH-FB+0.02, 0.05, x, FB+(DH-FB+0.02)/2, zf+(ry ? -0.005 : 0.005), "#b8963a");
    B(BB-BA+0.14, 0.06, 0.05, (BA+BB)/2, DH+0.05, zf+(ry ? -0.006 : 0.006), "#b8963a"); }
  plane(DB-DA+0.12, CB-DH-0.07, vel(1.1), (DA+DB)/2, (DH+0.05+CB)/2, Z0+0.02, 0);
  // the door's casing: brass, standing proud of the velvet
  for(const x of [DA-0.035, DB+0.035]) B(0.06, DH-FB+0.02, 0.05, x, FB+(DH-FB+0.02)/2, Z0+0.025, "#b8963a");      // (up to the head's underside)
  B(DB-DA+0.14, 0.06, 0.05, (DA+DB)/2, DH+0.05, Z0+0.026, "#b8963a");                                              // (5 mm past the jambs each end)
  // the carpet: deep red with a gold diamond, wall to wall; the ceiling dark wine, a rose round the chandelier
  { const t=signTex(512, 512, (c, W, Hh)=>{ c.fillStyle="#4a0c14"; c.fillRect(0, 0, W, Hh); c.strokeStyle="rgba(200,160,70,0.35)"; c.lineWidth=3;
      for(let k=-8;k<16;k++){ c.beginPath(); c.moveTo(k*64, 0); c.lineTo(k*64+Hh, Hh); c.stroke(); c.beginPath(); c.moveTo(k*64, Hh); c.lineTo(k*64+Hh, 0); c.stroke(); }
      for(let i=0;i<3000;i++){ c.fillStyle="rgba(0,0,0,"+(0.04+((i*37)%10)/100).toFixed(2)+")"; c.fillRect((i*131.7)%W, (i*71.3)%Hh, 2, 2); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set((X1-X0)/1.6, (Z1-Z0)/1.6);
    plane(X1-X0, Z1-Z0, new T.MeshStandardMaterial({map:t, roughness:1.0}), (X0+X1)/2, FB+0.006, (Z0+Z1)/2, 0, -Math.PI/2); }
  C(0.25, 0.04, (X0+X1)/2, CB-0.02, -173.7, "#c8a050", 24);

  /* ---- the door: steel, latched, a keypad by it on the poker room's side ---- */
  const leaf=makeDoor(XF(DA+0.02, Z0-0.125, 0), 0, FB+0.02, 0, "THE VELVET ROOM", true, 0, "steel", 0x5a5e60);
  // (the false face: painted block like the wall's, its uvs taken from where it stands shut, so its courses run on from the
  //  wall either side; 5 mm back from the wall's face, so no face of it lies in the wall's)
  { const w=DB-DA-0.006, h=DH-FB-0.008, d=0.087, g=new T.BoxGeometry(w, h, d), P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv;
    const lx=(DA+DB)/2-(DA+0.02), ly=FB+0.004+h/2-(FB+0.02), lz=-0.0765, wx0=DA+0.02, wy0=FB+0.02, wz0=Z0-0.125;
    for(let i=0;i<P.count;i++){ const x=P.getX(i)+lx+wx0, y=P.getY(i)+ly+wy0, z=P.getZ(i)+lz+wz0;
      if(Math.abs(N.getZ(i))>0.5) U.setXY(i, (N.getZ(i)>0 ? x : -x)*0.6, y*0.6); else if(Math.abs(N.getX(i))>0.5) U.setXY(i, -z*0.6, y*0.6); else U.setXY(i, x*0.6, z*0.6); }
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:TEX.block, color:new T.Color("#d6cdb6"), roughness:0.8}));
    m.position.set(lx, ly, lz); m.castShadow=true; m.receiveShadow=true; leaf.add(m); }
  const D=latchDoor({x0:DA, x1:DB, z0:Z0-WT, z1:Z0, y0:FB, y1:FB+2.1}); VELVET.door=D;
  D.onUse=(d)=>{ if(!VELVET.open){ VELVET.ask(); return; } d.manual=d.target>0.5 ? -1 : 1; if(typeof AUDIO!=="undefined") AUDIO.blip("latch", d.x||80, d.z||-176); };
  D.promptFn=(d)=>VELVET.open ? "E  ·  "+(d.target>0.5 ? "CLOSE" : "OPEN")+" THE WALL" : "E  ·  A LOOSE BLOCK";
  // the one block that sits a little proud of the wall, by the false face: the keypad is behind it
  { const g=new T.BoxGeometry(0.39, 0.19, 0.03), U=g.attributes.uv, P=g.attributes.position, x0=DB+0.4, y0=FB+1.3, z0=Z0-WT-0.012;
    for(let i=0;i<P.count;i++) U.setXY(i, -(P.getX(i)+x0)*0.6, (P.getY(i)+y0)*0.6);
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:TEX.block, color:new T.Color("#cfc6ae"), roughness:0.85})); m.position.set(x0, y0, z0); m.receiveShadow=true; scene.add(m); }

  /* ---- the furniture ---- */
  // the chesterfield on the south wall, buttoned green velvet; two wing chairs facing it; a low table between
  { const sx=79.85, sz=ZP-0.48, G="#1c3a2c";
    RB(2.2, 0.42, 0.86, sx, FB+0.21, sz, G, 0, 0.06); RB(2.2, 0.36, 0.24, sx, FB+0.6, sz+0.34, G, 0, 0.08);
    for(const s of [-1, 1]) RB(0.24, 0.62, 0.86, sx+s*1.0, FB+0.31, sz, G, 0, 0.1);
    for(let k=0;k<3;k++) RB(0.62, 0.12, 0.62, sx-0.66+k*0.66, FB+0.48, sz-0.06, "#24483a", 0, 0.05);
    for(let i=0;i<9;i++) for(let j=0;j<2;j++) ent(new T.SphereGeometry(0.012, 6, 4), sx-0.9+i*0.225, FB+0.55+j*0.12, sz+0.215, "#c8a050");
    for(const x of [sx-1.0, sx+1.0]) for(const z of [sz-0.36, sz+0.36]) C(0.025, 0.06, x, FB+0.03, z, "#2a1a10", 8);
    addCol(sx-1.12, sx+1.12, sz-0.43, ZP, FB-0.5, FB+0.62); for(let k=0;k<3;k++) addSeat(sx-0.66+k*0.66, sz-0.1, FB, 0, "THE CHESTERFIELD");
    RB(1.0, 0.06, 0.55, sx, FB+0.42, sz-1.25, "#3a1a10", 0, 0.02); for(const a of [-0.42, 0.42]) for(const b of [-0.2, 0.2]) C(0.022, 0.4, sx+a, FB+0.2, sz-1.25+b, "#c8a050", 8);
    addCol(sx-0.5, sx+0.5, sz-1.53, sz-0.97, FB-0.5, FB+0.46);
    ent(new T.CylinderGeometry(0.035, 0.05, 0.16, 12), sx-0.2, FB+0.53, sz-1.25, "#7a1a2a"); B(0.22, 0.03, 0.16, sx+0.22, FB+0.465, sz-1.2, "#e8e2d0");
    for(const [cx, ry] of [[78.4, 0.47],[81.6, -0.47]]){                    // (each turned in toward the chesterfield)
      const cz=sz-2.5, f=XF(cx, cz, ry), W="#6a0e1e";             // (far enough up the room that the way round to the beads is clear)
      const q=(w, h, d, lx, ly, lz, c)=>RB(w, h, d, f.x(lx, lz), FB+ly, f.z(lx, lz), c, ry, 0.05);
      q(0.74, 0.44, 0.7, 0, 0.22, 0, W); q(0.74, 0.9, 0.16, 0, 0.62, -0.3, W); for(const s of [-1, 1]){ q(0.12, 0.3, 0.6, s*0.33, 0.55, -0.02, W); q(0.08, 0.55, 0.28, s*0.36, 0.86, -0.22, W); }
      q(0.6, 0.1, 0.56, 0, 0.48, 0.04, "#7a1424");
      addCol(cx-0.4, cx+0.4, cz-0.4, cz+0.4, FB-0.5, FB+0.5); addSeat(cx, cz, FB, ry+Math.PI, "A WING CHAIR"); } }
  // the bar cart by the east wall: brass, glass shelves, decanters, glasses
  { const bx=X1-0.45, bz=-174.4;
    for(const y of [0.25, 0.75]) B(0.42, 0.012, 0.72, bx, FB+y, bz, "#9ab8c0");
    for(const a of [-0.2, 0.2]) for(const b of [-0.34, 0.34]) C(0.012, 0.85, bx+a, FB+0.43, bz+b, "#c8a050", 8);
    for(const [dz, col, h] of [[-0.24, "#a85a18", 0.22],[-0.06, "#7a2a0a", 0.26],[0.12, "#d8a030", 0.2]]){ ent(new T.CylinderGeometry(0.045, 0.055, h*0.7, 12), bx, FB+0.76+h*0.35, bz+dz, col);
      CT(0.02, 0.045, h*0.18, bx, FB+0.76+h*0.79, bz+dz, col, 10); ent(new T.SphereGeometry(0.028, 10, 8), bx, FB+0.76+h+0.02, bz+dz, "#d8e8f0"); }
    for(let k=0;k<4;k++) CT(0.03, 0.026, 0.07, bx-0.08+(k%2)*0.16, FB+0.29, bz-0.2+((k/2)|0)*0.3, "#d8e8f0", 10);
    addCol(bx-0.24, X1, bz-0.38, bz+0.38, FB-0.5, FB+0.9); }
  // the record console by the west wall, a turntable spinning on it; the jazz trio from it (20)
  { const rx=X0+0.32, rz=-174.4;
    RB(0.5, 0.62, 1.3, rx, FB+0.31, rz, "#4a2a14", 0, 0.03); for(const z of [-0.3, 0.3]) B(0.012, 0.42, 0.5, rx+0.252, FB+0.33, rz+z, "#2a1a0e");
    C(0.15, 0.02, rx, FB+0.64, rz+0.25, "#1a1a1a", 24); C(0.05, 0.004, rx, FB+0.652, rz+0.25, "#c82a2a", 16); B(0.02, 0.02, 0.18, rx+0.14, FB+0.66, rz+0.3, "#c8c8c0");
    addCol(X0, rx+0.26, rz-0.66, rz+0.66, FB-0.5, FB+0.66);
    VELVET.radios.push({x:rx, y:FB+0.7, z:rz, station:3, house:"THE VELVET ROOM", zone:"THE VELVET ROOM", vol:0.6, reach:14}); }
  // a floor lamp with a fringed shade in the north-west corner, a potted palm in the north-east
  { const lx=X0+0.35, lz=Z0+0.4; C(0.13, 0.02, lx, FB+0.01, lz, "#c8a050", 16); C(0.014, 1.5, lx, FB+0.76, lz, "#c8a050", 8);
    ent(new T.CylinderGeometry(0.16, 0.24, 0.26, 18, 1, true), lx, FB+1.55, lz, "#e8a088"); for(let k=0;k<24;k++){ const a=k/24*Math.PI*2; B(0.008, 0.06, 0.008, lx+Math.cos(a)*0.24, FB+1.39, lz+Math.sin(a)*0.24, "#c8a050"); }
    addCol(lx-0.15, lx+0.15, lz-0.15, lz+0.15, FB-0.5, FB+1.7); lamp(lx, FB+1.45, lz, 0.35, 0xffa070, 3.5);
    const px=X1-0.4, pz=Z0+0.4; CT(0.17, 0.13, 0.32, px, FB+0.16, pz, "#2a2a2c", 14);
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2; ent(new T.ConeGeometry(0.08, 0.7, 4), px+Math.cos(a)*0.2, FB+0.75, pz+Math.sin(a)*0.2, "#2e5a2a", Math.cos(a)*0.8, 0, -Math.sin(a)*0.8); }
    addCol(px-0.2, px+0.2, pz-0.2, pz+0.2, FB-0.5, FB+1.0); }
  // gold frames on the velvet: a still life and a lake at night, painted here
  for(const [x, z, ry, w, h, k] of [[X0+0.03, -173.0, Math.PI/2, 0.7, 0.55, 0],[X1-0.03, -172.7, -Math.PI/2, 0.6, 0.8, 1]]){
    const f=XF(x, z, ry); B(0.05, h+0.1, w+0.1, x, FB+1.45, z, "#c8a050", ry+Math.PI/2);
    const t=signTex(Math.round(w*400), Math.round(h*400), (c, W, Hh)=>{ if(k===0){ c.fillStyle="#2a1a12"; c.fillRect(0, 0, W, Hh); c.fillStyle="#7a2a1a"; c.fillRect(W*0.1, Hh*0.7, W*0.8, Hh*0.2);
        for(const [cx, cy, r, col] of [[0.35, 0.58, 0.12, "#c84a1a"],[0.55, 0.6, 0.1, "#e8b030"],[0.7, 0.55, 0.08, "#6a8a2a"]]){ c.fillStyle=col; c.beginPath(); c.arc(W*cx, Hh*cy, W*r, 0, 7); c.fill(); }
        c.fillStyle="#3a5a6a"; c.fillRect(W*0.18, Hh*0.3, W*0.1, Hh*0.4); }
      else { const g=c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, "#0a1028"); g.addColorStop(0.55, "#1a2a4a"); g.addColorStop(0.56, "#0a1424"); g.addColorStop(1, "#060a14"); c.fillStyle=g; c.fillRect(0, 0, W, Hh);
        c.fillStyle="#e8e4d0"; c.beginPath(); c.arc(W*0.7, Hh*0.2, W*0.06, 0, 7); c.fill(); c.fillStyle="rgba(232,228,208,0.25)"; for(let i=0;i<18;i++) c.fillRect(W*0.62+((i*13)%10)/100*W, Hh*(0.58+i*0.02), W*0.16, 2);
        c.fillStyle="#0a140e"; c.beginPath(); c.moveTo(0, Hh*0.56); for(let x=0;x<=W;x+=W/10) c.lineTo(x, Hh*(0.5-0.05*Math.sin(x/W*7))); c.lineTo(W, Hh*0.56); c.fill(); } });
    plane(w, h, new T.MeshStandardMaterial({map:t, roughness:0.6}), f.x(0, 0.032), FB+1.45, f.z(0, 0.032), ry); }
  // the name over the chesterfield, in pink neon on a black board
  { B(1.3, 0.42, 0.03, 79.85, FB+1.62, ZP-0.065, "#0a0a0c");
    const t=signTex(620, 200, (c, W, Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0, 0, W, Hh); c.shadowColor="#ff4ab0"; c.shadowBlur=18;
      say(c, "Terry's", W/2, Hh*0.5, W*0.80, Hh*0.6, "#ffb0dc", "700", "'Brush Script MT', 'Segoe Script', cursive"); c.shadowBlur=0; });
    plane(1.24, 0.38, new T.MeshBasicMaterial({map:t, toneMapped:false}), 79.85, FB+1.62, ZP-0.085, Math.PI);
    lamp(79.85, FB+1.62, ZP-0.5, 0.25, 0xff5ab8, 2.5); }
  // the chandelier: a brass ring, candle bulbs, drops of crystal
  { const cx=(X0+X1)/2, cz=-173.7, cy=CB-0.42; C(0.008, 0.3, cx, CB-0.17, cz, "#c8a050", 6); ent(new T.TorusGeometry(0.22, 0.012, 6, 28), cx, cy, cz, "#c8a050", Math.PI/2);
    for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, x=cx+Math.cos(a)*0.22, z=cz+Math.sin(a)*0.22; C(0.012, 0.06, x, cy+0.04, z, "#f2ecd8", 8);
      push("rn_glow", new T.SphereGeometry(0.018, 8, 6), x, cy+0.09, z, 0, "#ffffff"); ent(new T.OctahedronGeometry(0.018), x, cy-0.06, z, "#e8f0f8"); }
    ent(new T.OctahedronGeometry(0.04), cx, cy-0.12, cz, "#e8f0f8");
    lamp(cx, cy, cz, 0.75, 0xffc890, 6); }
  // a velvet rope on two brass posts, just inside the door, to keep the riff-raff out
  { for(const x of [DA-0.2, DB+0.2]){ C(0.15, 0.03, x, FB+0.015, Z0+0.5, "#c8a050", 16); C(0.02, 0.9, x, FB+0.47, Z0+0.5, "#c8a050", 8); ent(new T.SphereGeometry(0.04, 10, 8), x, FB+0.95, Z0+0.5, "#c8a050"); addCol(x-0.12, x+0.12, Z0+0.38, Z0+0.62, FB-0.5, FB+0.95); }
    const a=V3(DA-0.2, FB+0.86, Z0+0.5), b=V3(DB+0.2, FB+0.86, Z0+0.5); for(let k=0;k<10;k++){ const t0=k/10, t1=(k+1)/10, p=a.clone().lerp(b, t0), q=a.clone().lerp(b, t1);
      p.y-=0.16*4*t0*(1-t0); q.y-=0.16*4*t1*(1-t1); const d=new T.Vector3().subVectors(q, p), L=d.length();
      ME.push({geo:new T.CylinderGeometry(0.018, 0.018, L, 6, 1, true), matrix:new T.Matrix4().compose(p.clone().add(q).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()), V3(1, 1, 1)), color:new T.Color("#8a0a1e")}); } }
  /* ---- the back room: the bed, the stage and its pole, the chaise, the champagne, the magazines, the prints, the neon ---- */
  const BZ0=ZP+WT, BZM=(BZ0+Z1)/2;
  // the beads hung across the opening: strands of garnet and gold, nothing solid
  for(let k=0;k<22;k++){ const x=BA+0.03+k*(BB-BA-0.06)/21, col=k%3 ? "#8a0a2a" : "#c8a050";
    for(let j=0;j<16;j++) ent(new T.SphereGeometry(0.011, 6, 4), x, DH-0.06-j*0.125, ZP+WT/2, j%4===3 ? "#c8a050" : col);
    C(0.002, DH-FB-0.12, x, (DH+FB+0.06)/2, ZP+WT/2, "#3a0a14", 3); }
  // the bed: round, red satin, a tufted headboard against the south wall, heart pillows; the mirror over it
  { const bx=78.75, bz=Z1-1.1, br=1.02;
    C(br, 0.36, bx, FB+0.18, bz, "#3a0a14", 32); C(br-0.02, 0.18, bx, FB+0.45, bz, "#b8142a", 32); C(br+0.01, 0.06, bx, FB+0.37, bz, "#c8a050", 32);
    ent(new T.CylinderGeometry(br+0.08, br+0.08, 0.9, 32, 1, false, -Math.PI/2-0.9, 1.8), bx, FB+0.65, bz, "#6a0a1e");
    for(let k=0;k<7;k++){ const a=-0.75+k*0.25; ent(new T.SphereGeometry(0.018, 6, 4), bx+Math.sin(a)*(br+0.1), FB+0.8, bz+Math.cos(a)*(br+0.1), "#c8a050"); }
    for(const [dx, col] of [[-0.32, "#e8a0b8"],[0.3, "#f2f0ea"]]){ const hx=bx+dx, hz=bz+0.6;
      for(const s of [-1, 1]) ent(new T.SphereGeometry(0.11, 10, 8), hx+s*0.07, FB+0.62, hz, col); ent(new T.ConeGeometry(0.15, 0.2, 10), hx, FB+0.52, hz, col, 0, 0, Math.PI); }
    addCol(bx-br, bx+br, bz-br, Math.min(Z1, bz+br), FB-0.5, FB+0.55); addSeat(bx+0.2, bz-0.5, FB, Math.PI, "THE ROUND BED", false, 0.5);
    push("mirror", new T.CircleGeometry(0.9, 32), bx, CB-0.012, bz, 0, "#ffffff", Math.PI/2, 0); C(0.92, 0.02, bx, CB-0.012, bz, "#c8a050", 32); }
  // the stage: a little round platform, a brass pole to the ceiling, a mirror ball over it, a pink light on it
  { const sx=80.75, sz=Z1-1.05;
    C(0.62, 0.15, sx, FB+0.075, sz, "#1a1a1e", 28); C(0.64, 0.03, sx, FB+0.15, sz, "#c8a050", 28);
    C(0.025, CB-FB-0.15, sx, (CB+FB+0.15)/2, sz, "#d8b060", 12); C(0.06, 0.03, sx, CB-0.015, sz, "#c8a050", 12);
    addCol(sx-0.6, sx+0.6, sz-0.6, sz+0.6, FB-0.5, FB+0.15); addFlat(sx-0.42, sx+0.42, sz-0.42, sz+0.42, FB+0.15);
    ent(new T.IcosahedronGeometry(0.13, 1), sx+0.55, CB-0.3, sz-0.55, "#d8dce0"); C(0.004, 0.18, sx+0.55, CB-0.09, sz-0.55, "#8a8a8a", 4);
    lamp(sx, CB-0.25, sz, 0.45, 0xff4aa8, 3.2); }
  // the chaise against the east wall, red velvet, a gold side table by it: the champagne on ice, two coupes
  { const cx=X1-0.42, cz=BZM+0.25;
    RB(0.62, 0.4, 1.35, cx, FB+0.2, cz, "#8a0a1e", 0, 0.06); RB(0.2, 0.55, 1.35, cx+0.22, FB+0.55, cz, "#8a0a1e", 0, 0.08);
    RB(0.6, 0.4, 0.22, cx, FB+0.6, cz+0.6, "#8a0a1e", 0, 0.08);
    addCol(cx-0.32, X1, cz-0.68, cz+0.72, FB-0.5, FB+0.42);
    const tx=80.0, tz=Z1-0.3;                                        // (in the corner between the bed and the stage, clear of the way in) C(0.2, 0.025, tx, FB+0.58, tz, "#c8a050", 18); C(0.018, 0.56, tx, FB+0.29, tz, "#c8a050", 8); C(0.14, 0.02, tx, FB+0.01, tz, "#c8a050", 14);
    ent(new T.CylinderGeometry(0.09, 0.07, 0.2, 16, 1, true), tx-0.05, FB+0.695, tz, "#c8ccd0"); C(0.07, 0.01, tx-0.05, FB+0.6, tz, "#c8ccd0", 14);
    C(0.035, 0.24, tx-0.05, FB+0.76, tz, "#1a3a1a", 12); C(0.014, 0.06, tx-0.05, FB+0.91, tz, "#c8a050", 8);
    for(const dz of [-0.07, 0.07]){ C(0.004, 0.09, tx+0.09, FB+0.64, tz+dz, "#e8eef0", 6); ent(new T.CylinderGeometry(0.05, 0.012, 0.03, 14, 1, true), tx+0.09, FB+0.7, tz+dz, "#e8eef0"); }
    addCol(tx-0.21, tx+0.21, tz-0.21, tz+0.21, FB-0.5, FB+0.6);
    VELVET.chaise={x:cx-0.04, z:cz-0.15, y:FB}; }
  // the magazine rack against the partition, by the bed: the kind kept behind the counter, their covers made up here
  { const rx=78.25, rz=BZ0+0.14, mags=["VELVET","SATIN SHEETS","AFTER DARK","BOUDOIR","PEARLS","MIDNIGHT"];
    B(1.1, 0.95, 0.24, rx, FB+0.475, rz, "#3a1a10"); for(const y of [0.3, 0.62, 0.92]) B(1.12, 0.03, 0.26, rx, FB+y, rz, "#c8a050");
    addCol(rx-0.56, rx+0.56, BZ0, rz+0.13, FB-0.5, FB+0.95);
    mags.forEach((t, k)=>{ const x=rx-0.4+(k%3)*0.4, y=FB+(k<3 ? 0.46 : 0.78);
      const cv=signTex(120, 160, (c, W, Hh)=>{ const bg=["#c8143a","#2a0a2a","#e86a9a","#0a0a0a","#7a0a4a","#1a1a3a"][k]; c.fillStyle=bg; c.fillRect(0, 0, W, Hh);
          // (a lady in silhouette on every cover: a curve of hip and shoulder, a hat, nothing more)
          c.fillStyle="rgba(0,0,0,0.55)"; c.beginPath(); c.ellipse(W*0.5, Hh*0.4, W*0.08, Hh*0.06, 0, 0, 7); c.fill();
          c.beginPath(); c.moveTo(W*0.42, Hh*0.48); c.quadraticCurveTo(W*0.3, Hh*0.66, W*0.46, Hh*0.8); c.quadraticCurveTo(W*0.62, Hh*0.92, W*0.6, Hh*0.98); c.lineTo(W*0.72, Hh*0.98);
          c.quadraticCurveTo(W*0.72, Hh*0.8, W*0.58, Hh*0.66); c.quadraticCurveTo(W*0.66, Hh*0.55, W*0.58, Hh*0.48); c.fill();
          c.fillRect(W*0.36, Hh*0.33, W*0.28, Hh*0.025);
          say(c, t, W/2, Hh*0.16, W*0.8, Hh*0.16, "#f4e8c8", "800", "Georgia, serif"); });
      plane(0.24, 0.32, new T.MeshStandardMaterial({map:cv, roughness:0.4}), x, y, rz+0.128, (k%2 ? 0.06 : -0.05)); }); }
  // prints of a lady in silhouette, gold framed, over the bed on the west wall
  for(const [z, k] of [[Z1-1.55, 0],[Z1-0.65, 1]]){ const x=X0+0.03;
    B(0.05, 0.62, 0.48, x, FB+1.55, z, "#c8a050");
    const t=signTex(200, 260, (c, W, Hh)=>{ c.fillStyle=k ? "#e8b0c0" : "#f2d8a0"; c.fillRect(0, 0, W, Hh); c.fillStyle="#1a0a10";
      if(!k){ c.beginPath(); c.ellipse(W*0.32, Hh*0.3, W*0.07, Hh*0.06, 0, 0, 7); c.fill();
        c.beginPath(); c.moveTo(W*0.3, Hh*0.36); c.quadraticCurveTo(W*0.22, Hh*0.5, W*0.34, Hh*0.6); c.quadraticCurveTo(W*0.62, Hh*0.66, W*0.86, Hh*0.58); c.lineTo(W*0.88, Hh*0.62);
        c.quadraticCurveTo(W*0.6, Hh*0.74, W*0.3, Hh*0.7); c.quadraticCurveTo(W*0.16, Hh*0.56, W*0.24, Hh*0.4); c.fill(); }
      else { c.beginPath(); c.ellipse(W*0.5, Hh*0.2, W*0.07, Hh*0.055, 0, 0, 7); c.fill(); c.fillRect(W*0.34, Hh*0.14, W*0.32, Hh*0.02);
        c.beginPath(); c.moveTo(W*0.44, Hh*0.26); c.quadraticCurveTo(W*0.34, Hh*0.42, W*0.46, Hh*0.55); c.quadraticCurveTo(W*0.36, Hh*0.75, W*0.42, Hh*0.96); c.lineTo(W*0.5, Hh*0.96);
        c.quadraticCurveTo(W*0.5, Hh*0.75, W*0.6, Hh*0.58); c.quadraticCurveTo(W*0.62, Hh*0.42, W*0.56, Hh*0.26); c.fill(); } });
    plane(0.42, 0.56, new T.MeshStandardMaterial({map:t, roughness:0.6}), x+0.032, FB+1.55, z, Math.PI/2); }
  // the heart in neon over the stage on the south wall, AFTER HOURS in it
  { B(1.0, 0.62, 0.03, 80.75, FB+1.62, Z1-0.065, "#0a0a0c");
    const t=signTex(400, 248, (c, W, Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0, 0, W, Hh); c.shadowColor="#ff3a8a"; c.shadowBlur=16; c.strokeStyle="#ff8ac0"; c.lineWidth=7;
      c.beginPath(); c.moveTo(W*0.5, Hh*0.9); c.bezierCurveTo(W*0.08, Hh*0.6, W*0.12, Hh*0.08, W*0.5, Hh*0.3); c.bezierCurveTo(W*0.88, Hh*0.08, W*0.92, Hh*0.6, W*0.5, Hh*0.9); c.stroke();
      say(c, "AFTER HOURS", W/2, Hh*0.5, W*0.5, Hh*0.14, "#ffd0e8", "700", "'Brush Script MT', 'Segoe Script', cursive"); c.shadowBlur=0; });
    plane(0.96, 0.58, new T.MeshBasicMaterial({map:t, toneMapped:false}), 80.75, FB+1.62, Z1-0.085, Math.PI); }
  // a leopard rug at the foot of the bed, a lava lamp on the rack
  { const t=signTex(256, 256, (c, W, Hh)=>{ c.fillStyle="#c89a4a"; c.fillRect(0, 0, W, Hh);
      for(let i=0;i<90;i++){ const x=(i*97.3)%W, y=(i*53.7)%Hh, r=6+(i%5)*2; c.fillStyle="#3a2210"; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle="#8a5a22"; c.beginPath(); c.arc(x, y, r*0.5, 0, 7); c.fill(); } });
    plane(1.4, 0.9, new T.MeshStandardMaterial({map:t, roughness:1.0}), 79.0, FB+0.014, BZ0+1.0, 0, -Math.PI/2);
    ent(new T.CylinderGeometry(0.035, 0.06, 0.28, 12), 78.65, FB+1.1, BZ0+0.14, "#ff4a8a"); C(0.06, 0.06, 78.65, FB+0.96, BZ0+0.14, "#c8a050", 12);
    lamp(78.7, FB+1.6, BZM, 0.35, 0xff6a90, 3.5); }

  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, metalness:0.08});
  detailMesh(ME, mat, "velvet-room", true);
  VELVET.routes={"the velvet room (its door unlocked)":{gate:true, y0:FB, pts:[[79.6, -178.3],[79.98, -177.2],[79.98, -176.1],[79.98, -175.0],[80.0, -174.4],[80.3, -174.6]]},
    "the velvet room, through the beads to the back room":{gate:true, y0:FB, pts:[[79.98, -175.2],[80.0, -174.6],[80.78, -174.0],[80.78, -173.2],[81.0, -172.85],[81.85, -172.75],[81.85, -171.6],
      [81.85, -170.9],[81.3, -170.65],[80.4, -170.6]]}};
  /* ---- Violet, on the chaise: one of 14q's crowd (added by 14q once it is built, VELVET.people) ---- */
  VELVET.people=function(){ const C=VELVET.chaise; if(!C || typeof crowdGroup!=="function") return;
    const G=crowdGroup("the velvet room", 80, -172, 26);
    const p=crowdAdd(G, {look:{h:0.98, female:true, skin:SKINS[1], hair:HAIRS[5], shirt:"#a8102a", pants:"#a8102a", shoes:"#0a0a0a"}, x:C.x, z:C.z, y:C.y, yaw:-Math.PI/2,
      mode:"sit", sitY:0.455, job:"lounge", held:"coupe", drink:true, sway:0.35});
    VELVET.violet=p;
    const LINES=["“FIRST TIME AT TERRY'S, SUGAR? THE CHAMPAGNE'S ON THE HOUSE. I'M NOT.”","“YOU FOUND THE LOOSE BLOCK ALL BY YOURSELF? I'M IMPRESSED.”",
      "“SIT DOWN, HONEY, YOU'RE MAKING THE BEADS NERVOUS.”","“TERRY SAYS I'M THE BEST THING ON THE PROPERTY. TERRY'S RIGHT.”",
      "“THE BED'S FOR CUSTOMERS. THE CHAISE IS MINE. YOU CAN LOOK AT EITHER.”","“WHAT HAPPENS UNDER THE YARD STAYS UNDER THE YARD, DARLING.”",
      "“POUR YOURSELF A GLASS. I'LL TELL YOU ABOUT THE TIME THE MAYOR CAME DOWN HERE.”"];
    let k=0; addUse(C.x-0.75, C.z, C.y, "TALK TO VIOLET", ()=>{ toast(LINES[k%LINES.length], "#ff9ad0"); k++; }, 1.3); };
})();

/* ---- the keypad: a box you type the word into ---- */
(function velvetKeypad(){
  const st=document.createElement("style");
  st.textContent="#velvetpad{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:45;display:none;background:rgba(16,10,12,.94);"+
    "border:1px solid #6a2a3a;border-radius:6px;padding:18px 22px;font-family:'Oswald',Arial,sans-serif;color:#f2e4e8;letter-spacing:.1em;text-align:center;"+
    "max-width:calc(100vw - 32px);box-sizing:border-box}#velvetpad h4{margin:0 0 10px;font-size:15px;letter-spacing:.3em;color:#ff9ad0;font-weight:600}"+
    "#velvetpad input{font:600 22px 'JetBrains Mono',monospace;letter-spacing:.2em;text-transform:uppercase;width:220px;max-width:100%;padding:6px 10px;"+
    "background:#0a0a0c;color:#3af06a;border:1px solid #3a3a3e;border-radius:4px;text-align:center;outline:none}"+
    "#velvetpad p{margin:10px 0 0;font-size:11px;opacity:.65;letter-spacing:.18em}#velvetpad .no{color:#ff6a5a;min-height:16px;font-size:12px;margin-top:8px}";
  document.head.appendChild(st);
  const el=document.createElement("div"); el.id="velvetpad";
  el.innerHTML='<h4>THE KEYPAD</h4><input type="text" maxlength="16" autocomplete="off" spellcheck="false"><div class="no"></div><p>TYPE THE WORD · ENTER TO TRY IT · ESC TO LEAVE IT</p>';
  document.body.appendChild(el); VELVET.el=el;
  const inp=el.querySelector("input"), no=el.querySelector(".no");
  const close=()=>{ VELVET.typing=false; el.style.display="none"; inp.blur(); if(typeof clearKeys==="function") clearKeys(); };
  VELVET.ask=function(){ if(VELVET.open) return; VELVET.typing=true; if(typeof clearKeys==="function") clearKeys(); if(document.exitPointerLock) document.exitPointerLock();
    inp.value=""; no.textContent=""; el.style.display="block"; setTimeout(()=>inp.focus(), 0); };
  inp.addEventListener("keydown", e=>{ e.stopPropagation();
    if(e.code==="Escape"){ e.preventDefault(); close(); return; }
    if(e.code==="Enter" || e.code==="NumpadEnter"){ e.preventDefault();
      if(inp.value.trim().toLowerCase()==="terry"){ VELVET.open=true; close(); const d=VELVET.door; d.manual=1;
        if(typeof AUDIO!=="undefined") AUDIO.blip("latch", 80, -176); toast("THE LOCK CLICKS. VELVET, AND SOMEBODY'S RECORDS","#ff9ad0"); }
      else { no.textContent="THE KEYPAD BUZZES. NOT THAT WORD"; inp.select(); if(typeof AUDIO!=="undefined") AUDIO.blip("tick", 80, -176); } } });
  inp.addEventListener("keyup", e=>e.stopPropagation());
})();
