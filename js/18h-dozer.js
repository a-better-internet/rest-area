"use strict";
/* REST AREA · 18h-dozer.js
   the coin dozer on the arcade's east wall (12c): its cabinet, and the game
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18h · COIN DOZER
   After the reference game the crew had on a laptop (a pusher machine in
   three.js and cannon.js), cut down to what fits this room: a cabinet in
   purple with pink and cyan neon, a deck of brass tokens under the glass,
   the pusher going back and forth at the back of it, the lip at the front
   the tokens go over, and the bonus bucket running along under the lip.
   It plays as the cabinets do. E stands you at it, looking down through
   the glass. A and D (or the arrows, or the mouse) move the chute along the
   back, Space or a click drops a token, X shakes the machine (once every
   few seconds), N empties it and starts again, and Esc or E steps away.
   The hopper holds fifty and fills back up by one every three seconds;
   anything that goes over the lip is won, and into the bucket three more
   tokens besides. Now and then the chute drops a prize instead: a big
   coin (10), a die (15), a gem (25) or a toy car (50).
   The tokens are not a rigid-body world. Each is a disc on the deck that
   slides and slows, pushes the ones it overlaps out of its way (the
   heavier pushing harder) and is shoved by the pusher's face; a second
   layer rides on top of the first and drops down when nothing holds it up.
   That is enough for the pile to creep forward and spill over the lip.
   A dropped token falls under gravity from the chute. If the pusher is
   under it, it lands on the pusher's shelf and rides it; the back wall
   holds it as the shelf goes back under, so it is scraped off the front
   edge onto the deck. Otherwise it lands on the deck in front of the face.
   What you've won and the tokens left are lit on the backglass, where you
   are looking, as well as on the readout under the marquee.
   ---------------------------------------------------------------------- */
const DOZER={on:false, g:null, keys:{}, t:0, acc:0, hi:0, shake:0, demoT:0};
(function dozerCabinet(){
  const A=ARCADE.room; if(!A) return;
  // the cabinet's own frame: local +z out of its front (west, into the room), +x along the wall (south)
  const D={x:A.x1-0.485, z:-214.75, ry:-Math.PI/2, y:A.y};
  const G=new T.Group(); G.position.set(D.x, D.y, D.z); G.rotation.y=D.ry; scene.add(G);
  const E=[], ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,rx)=>ent(boxGeo(w,h,d),x,y,z,c,rx||0,0,0);
  const RB=(w,h,d,x,y,z,c,r)=>ent(rboxGeo(w,h,d,r||0.02,2),x,y,z,c);
  const W=1.10, DP=0.95, DECK=0.98, HX=0.40, BACK=-0.38, EDGE=0.30, TOP=1.62;
  const PUR="#2a0f3a", PUR2="#3b1452", PINK=0xff3ecb, CYAN=0x3df3ff;
  // the base: purple, rounded, its side art
  RB(W, 0.92, DP, 0, 0.46, 0, PUR, 0.03);
  const art=signTex(256,256,(c,Wc,Hc)=>{ c.fillStyle="#1a0828"; c.fillRect(0,0,Wc,Hc);
    for(let i=0;i<8;i++){ c.fillStyle=i%2?"rgba(255,62,203,0.55)":"rgba(61,243,255,0.45)"; c.beginPath(); c.moveTo(0,Hc*0.12+i*30); c.lineTo(Wc/2,Hc*0.12+i*30+28); c.lineTo(Wc,Hc*0.12+i*30); c.lineTo(Wc,Hc*0.12+i*30+10); c.lineTo(Wc/2,Hc*0.12+i*30+38); c.lineTo(0,Hc*0.12+i*30+10); c.closePath(); c.fill(); }
    c.fillStyle="#ffd247"; fitText(c, "COIN DOZER", Wc*0.80, Hc*0.10, Wc/2, Hc*0.86, "900", "'Arial Black', Arial"); });
  for(const sd of [-1,1]){ const m=new T.Mesh(new T.PlaneGeometry(DP-0.12, 0.80), new T.MeshStandardMaterial({map:art, roughness:0.6, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(sd*(W/2+0.006), 0.48, 0); m.rotation.y=sd*Math.PI/2; G.add(m); }
  // the front: the payout tray in a lit recess, the coin door, the control deck with its two domes
  B(0.70, 0.04, 0.16, 0, 0.30, DP/2+0.05, "#141018"); B(0.70, 0.10, 0.02, 0, 0.35, DP/2+0.125, "#141018");
  for(const sd of [-1,1]) B(0.02, 0.10, 0.16, sd*0.36, 0.35, DP/2+0.05, "#141018");
  const trayGlow=new T.Mesh(new T.PlaneGeometry(0.66, 0.12), new T.MeshBasicMaterial({color:0xffd247, toneMapped:false, transparent:true, opacity:0.35}));
  trayGlow.position.set(0, 0.36, DP/2+0.006); G.add(trayGlow);
  B(0.26, 0.22, 0.012, 0, 0.62, DP/2+0.006, "#1a1420"); for(const sd of [-1,1]) B(0.02, 0.04, 0.012, sd*0.05, 0.68, DP/2+0.012, "#ff4a1a");
  ent(boxGeo(W-0.04, 0.05, 0.20), 0, 0.93, DP/2+0.08, PUR2, -0.25, 0, 0);
  const domes=[];
  for(const [dx,col] of [[-0.18,0xffd247],[0.18,0x3df3ff]]){ ent(new T.CylinderGeometry(0.05, 0.055, 0.03, 20), dx, 0.965, DP/2+0.09, "#141018", -0.25);
    const m=new T.Mesh(new T.SphereGeometry(0.045, 18, 10, 0, Math.PI*2, 0, Math.PI/2), new T.MeshBasicMaterial({color:col, toneMapped:false}));
    m.position.set(dx, 0.985, DP/2+0.085); m.rotation.x=-0.25; G.add(m); domes.push(m); }
  // the playfield's box: the back, the sides, a roof over it; the glass in front and down the sides
  B(0.88, TOP-DECK+0.04, 0.03, 0, (TOP+DECK)/2, BACK-0.035, "#140a1e");
  for(const sd of [-1,1]) B(0.03, TOP-0.92, DP, sd*(W/2-0.015), (TOP+0.92)/2, 0, PUR);
  B(W, 0.08, DP, 0, TOP+0.04, 0, PUR2);
  const glass=new T.MeshStandardMaterial({color:0xcfe8ff, transparent:true, opacity:0.12, roughness:0.05, metalness:0.2, depthWrite:false, side:T.DoubleSide});
  { const m=new T.Mesh(new T.PlaneGeometry(W-0.08, TOP-DECK-0.06), glass); m.position.set(0, (TOP+DECK)/2+0.01, 0.44); G.add(m); }
  // the backglass: a sunburst, the name faint over it
  // (its top band is the player's readout, redrawn over this base in _dzReadout)
  const bgBase=cvs(512,320), bgc=cvs(512,320), bgTex=setSRGB(new T.CanvasTexture(bgc));
  { const c=bgBase.getContext("2d"), Wc=512, Hc=320, g=c.createLinearGradient(0,0,0,Hc); g.addColorStop(0,"#3b0f52"); g.addColorStop(1,"#12041f"); c.fillStyle=g; c.fillRect(0,0,Wc,Hc);
    c.save(); c.translate(Wc/2, Hc*0.95); for(let i=0;i<24;i++){ c.rotate(Math.PI*2/24); c.fillStyle=i%2?"rgba(255,62,203,0.16)":"rgba(61,243,255,0.12)"; c.beginPath(); c.moveTo(0,0); c.lineTo(Wc,-Hc*0.2); c.lineTo(Wc,Hc*0.2); c.closePath(); c.fill(); } c.restore();
    c.globalAlpha=0.35; c.fillStyle="#8fd6ff"; fitText(c, "COIN DOZER", Wc*0.62, Hc*0.16, Wc/2, Hc*0.70, "900", "'Arial Black', Arial"); c.globalAlpha=1;
    // the readout's panel: a dark bezel across the top
    c.fillStyle="#05040a"; c.strokeStyle="rgba(255,62,203,0.7)"; c.lineWidth=4; c.beginPath(); c.rect(28, 18, Wc-56, 104); c.fill(); c.stroke();
    bgc.getContext("2d").drawImage(bgBase, 0, 0); }
  { const m=new T.Mesh(new T.PlaneGeometry(0.86, TOP-DECK-0.02), new T.MeshBasicMaterial({map:bgTex, toneMapped:false}));
    m.position.set(0, (TOP+DECK)/2, BACK-0.012); G.add(m); }
  // the deck: dark plate, chevrons pointing at the lip, a rail of yellow neon along it
  { const dk=signTex(256,256,(c,Wc,Hc)=>{ c.fillStyle="#14131c"; c.fillRect(0,0,Wc,Hc);
      c.strokeStyle="rgba(150,170,210,0.10)"; c.lineWidth=2; for(let i=-Wc;i<Wc;i+=18){ c.beginPath(); c.moveTo(i,0); c.lineTo(i+Wc,Hc); c.stroke(); c.beginPath(); c.moveTo(i,Hc); c.lineTo(i+Wc,0); c.stroke(); }
      for(let i=0;i<4;i++){ c.strokeStyle=i%2?"rgba(61,243,255,0.45)":"rgba(255,62,203,0.40)"; c.lineWidth=6; const y=Hc*0.45+i*30; c.beginPath(); c.moveTo(Wc*0.25,y); c.lineTo(Wc/2,y+22); c.lineTo(Wc*0.75,y); c.stroke(); }
      c.strokeStyle="rgba(255,210,71,0.45)"; c.lineWidth=6; c.strokeRect(4,4,Wc-8,Hc-8); });
    const m=new T.Mesh(new T.PlaneGeometry(HX*2, EDGE-BACK), new T.MeshStandardMaterial({map:dk, roughness:0.45, metalness:0.3}));
    m.rotation.x=-Math.PI/2; m.position.set(0, DECK, (EDGE+BACK)/2); G.add(m); }
  B(HX*2+0.02, DECK-0.92, EDGE-BACK+0.04, 0, (DECK+0.92)/2-0.006, (EDGE+BACK)/2, "#100c16");                // (its top 6 mm under the deck's plate)
  const neon=(col, w, h, d, x, y, z)=>{ const m=new T.Mesh(boxGeo(w,h,d), new T.MeshBasicMaterial({color:col, toneMapped:false})); m.position.set(x,y,z); m.userData.base=new T.Color(col); G.add(m); return m; };
  const neons=[neon(0xffd247, HX*2, 0.010, 0.010, 0, DECK+0.006, EDGE+0.006),
               neon(PINK, 0.010, 0.010, EDGE-BACK-0.012, -HX-0.01, DECK+0.056, (EDGE+BACK)/2), neon(CYAN, 0.010, 0.010, EDGE-BACK-0.012, HX+0.01, DECK+0.056, (EDGE+BACK)/2),     // (along the tops of the deck's walls)
               neon(PINK, 0.010, TOP-DECK-0.10, 0.010, -HX-0.012, (TOP+DECK)/2, BACK+0.01), neon(CYAN, 0.010, TOP-DECK-0.10, 0.010, HX+0.012, (TOP+DECK)/2, BACK+0.01)];
  // the deck's walls either side, low, so nothing leaves but over the lip
  for(const sd of [-1,1]) B(0.02, 0.05, EDGE-BACK, sd*(HX+0.01), DECK+0.025, (EDGE+BACK)/2, "#2a2436");
  // the pusher: brushed steel, its leading edge hazard-striped
  // (fully back, its face is at the back wall, so whatever rides its shelf is scraped off)
  const pz0=-0.375, pz1=-0.205, PD=0.21;
  const pusher=new T.Group(); G.add(pusher);
  { const st=signTex(256,32,(c,Wc,Hc)=>{ c.fillStyle="#12101a"; c.fillRect(0,0,Wc,Hc); for(let i=-2;i<20;i++){ c.save(); c.translate(i*16,0); c.rotate(0.5); c.fillStyle=i%2?"#ffd247":"#171320"; c.fillRect(0,-20,8,80); c.restore(); } });
    const steel=new T.Mesh(boxGeo(HX*2-0.004, 0.06, PD), new T.MeshStandardMaterial({color:0xb8bcc8, metalness:0.7, roughness:0.25})); steel.position.set(0, DECK+0.032, -PD/2); pusher.add(steel);
    const lip=new T.Mesh(boxGeo(HX*2-0.008, 0.022, 0.012), new T.MeshStandardMaterial({map:st, roughness:0.5})); lip.position.set(0, DECK+0.05, -0.004); pusher.add(lip); }     // (2 mm proud of the face)
  // the chute along the back, over the deck: where the next token falls from
  const chute=new T.Group(); G.add(chute);
  { const m=new T.Mesh(boxGeo(0.07, 0.05, 0.06), new T.MeshStandardMaterial({color:0x8a8d98, metalness:0.6, roughness:0.3})); chute.add(m);
    const mk=new T.Mesh(new T.ConeGeometry(0.018, 0.035, 10), new T.MeshBasicMaterial({color:0xffd247, toneMapped:false})); mk.position.y=-0.045; mk.rotation.x=Math.PI; chute.add(mk); }
  const CHZ=-0.30; chute.position.set(0, DECK+0.36, CHZ);
  // the bonus bucket's pad, lit, running along under the lip
  const bucket=new T.Mesh(new T.PlaneGeometry(0.13, 0.05), new T.MeshBasicMaterial({color:0x6fc41c, toneMapped:false, transparent:true, opacity:0.6}));
  bucket.position.set(0, DECK-0.012, EDGE+0.07); bucket.rotation.x=-0.6; G.add(bucket);
  B(HX*2+0.02, 0.012, 0.12, 0, DECK-0.04, EDGE+0.075, "#0a0810", -0.6);
  // the marquee: lit, the name in neon, a row of chase bulbs round it
  RB(W, 0.42, 0.42, 0, TOP+0.29, -0.26, PUR, 0.03);
  { const mq=signTex(512,192,(c,Wc,Hc)=>{ const g=c.createLinearGradient(0,0,0,Hc); g.addColorStop(0,"#3b0f52"); g.addColorStop(0.5,"#12041f"); g.addColorStop(1,"#2a0842"); c.fillStyle=g; c.fillRect(0,0,Wc,Hc);
      c.globalAlpha=0.5; for(let i=0;i<4;i++){ c.fillStyle=i%2?"#ff3ecb":"#3df3ff"; c.fillRect(20+i*20,0,10,Hc); c.fillRect(Wc-30-i*20,0,10,Hc); } c.globalAlpha=1;
      c.shadowColor="#3df3ff"; c.shadowBlur=18; c.fillStyle="#ffffff"; fitText(c, "COIN DOZER", Wc*0.62, Hc*0.34, Wc/2, Hc*0.42, "900", "'Arial Black', Arial");
      c.shadowColor="#ff9500"; c.fillStyle="#ffd247"; fitText(c, "PUSH YOUR LUCK", Wc*0.50, Hc*0.16, Wc/2, Hc*0.76, "800", "Arial"); c.shadowBlur=0;
      c.strokeStyle="rgba(255,255,255,0.55)"; c.lineWidth=6; c.strokeRect(3,3,Wc-6,Hc-6); });
    const m=new T.Mesh(new T.PlaneGeometry(W-0.10, 0.36), new T.MeshBasicMaterial({map:mq, toneMapped:false})); m.position.set(0, TOP+0.29, -0.05+0.006); G.add(m); }
  const bulbs=[], bA=new T.MeshBasicMaterial({color:0xffe08a, toneMapped:false}), bB=new T.MeshBasicMaterial({color:0x3a2a18, toneMapped:false});
  for(let k=0;k<14;k++){ const t=k/13, m=new T.Mesh(new T.SphereGeometry(0.014, 10, 8), bA);
    m.position.set(-W/2+0.05+t*(W-0.10), TOP+0.50, -0.044); G.add(m); bulbs.push(m); }
  // the readout under the marquee: what you've won, the tokens in the hopper, the next one coming
  const rc=cvs(512,64), rtex=setSRGB(new T.CanvasTexture(rc));
  { const m=new T.Mesh(new T.PlaneGeometry(0.86, 0.10), new T.MeshBasicMaterial({map:rtex, toneMapped:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(0, TOP+0.045, DP/2+0.007); G.add(m); }
  // the coins: one mesh of brass tokens, a star struck on each face. Not an InstancedMesh: some
  // graphics cards drew nothing of one here, so each frame the tokens on the deck are written
  // straight into one plain mesh's buffers, the way every other thing in the world is drawn
  const face=signTex(128,128,(c,Wc,Hc)=>{ const g=c.createRadialGradient(Wc/2,Hc/2,8,Wc/2,Hc/2,Wc/2); g.addColorStop(0,"#ffe08a"); g.addColorStop(0.8,"#d99516"); g.addColorStop(1,"#8a5a0e");
    c.fillStyle=g; c.fillRect(0,0,Wc,Hc); c.strokeStyle="#7a4a0a"; c.lineWidth=5; c.beginPath(); c.arc(Wc/2,Hc/2,Wc/2-10,0,7); c.stroke();
    c.fillStyle="#b87a10"; c.beginPath(); for(let k=0;k<10;k++){ const a=k*Math.PI/5-Math.PI/2, r=k%2?14:32; c.lineTo(Wc/2+Math.cos(a)*r, Hc/2+Math.sin(a)*r); } c.closePath(); c.fill(); });
  const RC=0.024, TH=0.007, MAXC=260;
  const coinM=new T.MeshStandardMaterial({map:face, vertexColors:true, metalness:0.2, roughness:0.42, emissive:0xffffff, emissiveMap:face, emissiveIntensity:0.5});      // (brass under the glass: lit a little from within, or the pile reads as dark beans)
  const one=new T.CylinderGeometry(RC, RC, TH, 18), oP=one.attributes.position.array, oN=one.attributes.normal.array, oU=one.attributes.uv.array, oI=one.index.array;
  const nv=oP.length/3, ni=oI.length, cg=new T.BufferGeometry();
  const aP=new T.BufferAttribute(new Float32Array(MAXC*nv*3), 3), aN=new T.BufferAttribute(new Float32Array(MAXC*nv*3), 3), aC=new T.BufferAttribute(new Float32Array(MAXC*nv*3), 3);
  const uv=new Float32Array(MAXC*nv*2), ix=new Uint16Array(MAXC*ni);
  for(let k=0;k<MAXC;k++){ uv.set(oU, k*nv*2); for(let i=0;i<ni;i++) ix[k*ni+i]=oI[i]+k*nv; }
  for(const a of [aP,aN,aC]) a.setUsage(T.DynamicDrawUsage);
  cg.setAttribute("position", aP); cg.setAttribute("normal", aN); cg.setAttribute("color", aC); cg.setAttribute("uv", new T.BufferAttribute(uv, 2)); cg.setIndex(new T.BufferAttribute(ix, 1));
  cg.setDrawRange(0, 0); cg.boundingSphere=new T.Sphere(V3(0, DECK, 0), 1.2);
  const coins=new T.Mesh(cg, coinM); coins.frustumCulled=false; G.add(coins);
  coins.userData={nv:nv, ni:ni, oP:oP, oN:oN, aP:aP, aN:aN, aC:aC};
  // the prizes, a mesh each, made as they drop
  const prizeMesh=(type)=>{
    if(type==="gem") return new T.Mesh(new T.OctahedronGeometry(0.028), new T.MeshStandardMaterial({color:0x3ae8ff, metalness:0.5, roughness:0.1, emissive:0x0a3a44, emissiveIntensity:0.8}));
    if(type==="die"){ const t=signTex(64,64,(c,Wc,Hc)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,Wc,Hc); c.fillStyle="#c42a1a"; for(const [px,py] of [[0.25,0.25],[0.5,0.5],[0.75,0.75]]){ c.beginPath(); c.arc(Wc*px,Hc*py,6,0,7); c.fill(); } });
      return new T.Mesh(rboxGeo(0.04,0.04,0.04,0.008,2), new T.MeshStandardMaterial({map:t, roughness:0.4})); }
    if(type==="car"){ const E2=[], add=(g,x,y,z,c)=>E2.push({geo:g, matrix:new T.Matrix4().makeTranslation(x,y,z), color:new T.Color(c)});
      add(rboxGeo(0.045,0.018,0.085,0.006,1),0,0.016,0,"#c42a1a"); add(rboxGeo(0.038,0.016,0.040,0.006,1),0,0.030,-0.004,"#8fd6ff");
      for(const sx of [-0.022,0.022]) for(const sz of [-0.028,0.028]) add(new T.CylinderGeometry(0.009,0.009,0.008,10).rotateZ(Math.PI/2),sx,0.009,sz,"#141414");
      return new T.Mesh(mergeEntries(E2), new T.MeshStandardMaterial({vertexColors:true, roughness:0.35, metalness:0.3})); }
    return new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 0.010, 28), new T.MeshStandardMaterial({color:0xc8ccd4, map:face, metalness:0.6, roughness:0.3, emissive:0x2a2a30, emissiveIntensity:0.5})); };
  // its light, inside under the roof (BURIED: the arcade's, 12c)
  LAMPS.push({x:D.x-0.10, y:D.y+TOP-0.06, z:D.z, color:0xfff0d8, intensity:0.75, dist:2.6, decay:1.6, under:true, indoor:true, circ:"bldg"});
  const mesh=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:0.15}));
  mesh.castShadow=true; mesh.receiveShadow=true; G.add(mesh);
  // in world terms: the stand in front of it, the screen to look at, its collider
  const W2=(lx,lz)=>[D.x+lx*Math.cos(D.ry)+lz*Math.sin(D.ry), D.z-lx*Math.sin(D.ry)+lz*Math.cos(D.ry)];
  const st=W2(0, 1.02), look=W2(0, -0.02), a0=W2(-W/2, -DP/2), a1=W2(W/2, DP/2+0.20);
  addCol(Math.min(a0[0],a1[0]), Math.max(a0[0],a1[0]), Math.min(a0[1],a1[1]), Math.max(a0[1],a1[1]), A.y-0.5, A.y+TOP+0.5);
  addUse(st[0], st[1], A.y, "PLAY COIN DOZER", ()=>DOZER.start(), 0.9);
  ARCADE.games.push({name:"COIN DOZER", x:st[0], z:st[1]});
  DOZER.cab={G:G, D:D, coins:coins, prizeMesh:prizeMesh, pusher:pusher, chute:chute, bucket:bucket, trayGlow:trayGlow, bulbs:bulbs, bA:bA, bB:bB, domes:domes, neons:neons,
             read:{c:rc, x:rc.getContext("2d"), tex:rtex}, back:{c:bgc, x:bgc.getContext("2d"), base:bgBase, tex:bgTex},
             stand:{x:st[0], z:st[1]}, look:{x:look[0], z:look[1]}, floor:A.y,
             DECK:DECK, HX:HX, BACK:BACK, EDGE:EDGE, pz0:pz0, pz1:pz1, RC:RC, TH:TH, MAXC:MAXC,
             WALL:BACK-0.010, SHELF:DECK+0.062, CHZ:CHZ, CHY:DECK+0.32};
})();

/* ---- the game ------------------------------------------------------------ */
const _DZ={HOP:50, REGEN:3.0, SHAKE:4.0,
  VAL:{coin:1, big:10, die:15, gem:25, car:50}, R:{coin:0.024, big:0.045, die:0.026, gem:0.026, car:0.045}};
function _dzSnd(k){ const C=DOZER.cab; if(typeof AUDIO!=="undefined" && C) AUDIO.blip(k, C.D.x, C.D.z); }
// a body: a disc of radius r, mass by its area. On the deck, layer 0, or 1 on top of the tokens under
// it; or riding the pusher's shelf (shelf); or in the air (drop>=0, its height y and speed vy); or gone
// over the lip (fall>=0)
function _dzBody(type, x, z, layer){ const r=_DZ.R[type]; return {type:type, x:x, z:z, vx:0, vz:0, r:r, m:r*r/(0.024*0.024), layer:layer||0, y:0, vy:0, fall:-1, drop:-1, shelf:false, hop:false, tip:0, mesh:null, rot:Math.random()*6.28}; }
DOZER.newGame=function(){
  const C=DOZER.cab, g={items:[], won:0, hop:30, regen:0, shakeCD:0, t:0, aim:0, last:"", flash:0, bonusX:0};
  // a deck already well covered: a jittered grid of tokens, a few riding on top, two prizes to aim at
  const sp=C.RC*2.08;
  for(let z=C.EDGE-C.RC-0.004; z>C.pz1+C.RC+0.02; z-=sp*0.88) for(let x=-C.HX+C.RC+0.003+((z*97|0)%2)*sp*0.5; x<C.HX-C.RC; x+=sp)
    if(Math.random()<0.86) g.items.push(_dzBody("coin", x+(Math.random()-0.5)*0.004, z+(Math.random()-0.5)*0.004, 0));
  for(let k=0;k<26;k++) g.items.push(_dzBody("coin", (Math.random()-0.5)*(C.HX*2-0.06), C.pz1+0.06+Math.random()*(C.EDGE-C.pz1-0.10), 1));
  g.items.push(_dzBody("big", -0.12, 0.10, 1)); g.items.push(_dzBody("car", 0.16, 0.02, 1));
  for(const it of g.items) _dzMesh(it);
  return g;
};
function _dzMesh(it){ if(it.type==="coin" || it.mesh) return; const C=DOZER.cab; it.mesh=C.prizeMesh(it.type); C.G.add(it.mesh); }
function _dzDrop(g, type){
  const C=DOZER.cab, it=_dzBody(type, g.aim+(Math.random()-0.5)*0.01, C.CHZ+(Math.random()-0.5)*0.01, 0);
  it.drop=0; it.y=C.CHY; it.vy=-0.15; it.tip=0.9+Math.random()*0.6; g.items.push(it); _dzMesh(it); return it; }
// where something coming down lands: the shelf if the pusher is under it, else the deck, or the tokens on it
function _dzLand(g, it, pz){
  const C=DOZER.cab; it.drop=-1; it.vy=0; it.tip=0; it.vx=0; it.vz=0;
  if(it.shelf) return;
  if(it.z-it.r<pz) it.z=pz+it.r+0.001;
  let on=0; for(const o of g.items) if(o!==it && o.layer===0 && !o.shelf && o.fall<0 && o.drop<0 && Math.hypot(o.x-it.x, o.z-it.z)<(o.r+it.r)*0.8) on++;
  it.layer=on>0 && it.type==="coin" ? 1 : 0; }
DOZER.dropCoin=function(){
  const g=DOZER.g; if(!g) return;
  if(g.hop<=0){ g.last="HOPPER EMPTY"; _dzSnd("tick"); return; }
  g.hop--; const q=Math.random();
  const type=q>0.990 ? "car" : q>0.978 ? "gem" : q>0.962 ? "die" : q>0.946 ? "big" : "coin";
  _dzDrop(g, type); _dzSnd("coin");
  if(type!=="coin"){ g.last="A PRIZE: "+({big:"BIG COIN",die:"A DIE",gem:"A GEM",car:"A TOY CAR"})[type]; }
};
DOZER.doShake=function(){
  const g=DOZER.g; if(!g) return;
  if(g.shakeCD>0){ g.last="SHAKE IN "+Math.ceil(g.shakeCD)+"s"; return; }
  g.shakeCD=_DZ.SHAKE; DOZER.shake=0.35; _dzSnd("thump");
  for(const it of g.items) if(it.fall<0 && it.drop<0){ const k=0.10/Math.sqrt(it.m); it.vx+=(Math.random()-0.5)*k; it.vz+=(Math.random()-0.2)*k*0.8; if(it.layer===1 && Math.random()<0.4) it.layer=0; }
};
// one step of the deck: the pusher, the slide, the shoves, the second layer, the lip
function _dzStep(g, dt, live){
  const C=DOZER.cab, t=g.t+=dt;
  const ph=t*Math.PI*2/2.6, pz=C.pz0+(C.pz1-C.pz0)*(0.5-0.5*Math.cos(ph)), vp=(C.pz1-C.pz0)*0.5*Math.sin(ph)*Math.PI*2/2.6;
  const dpz=g.pz===undefined ? 0 : pz-g.pz;
  g.pz=pz; g.bonusX=Math.sin(t*1.3)*(C.HX-0.08);
  const L0=[], L1=[], SH=[], fr=Math.exp(-9*dt), hs=C.TH/2+0.0015;
  for(const it of g.items){
    if(it.drop>=0){ it.drop+=dt;
      // coming down under gravity: onto the shelf if the pusher is under it, else past its face to the deck
      it.vy-=6.5*dt; it.y+=it.vy*dt; it.z+=it.vz*dt;
      const over=it.z<pz-0.004, floor=over ? C.SHELF : C.DECK;
      if(!over && it.y<C.SHELF+hs && it.z-it.r<pz) it.z=pz+it.r;          // below the shelf, the face shoves it
      if(it.y<=floor+hs){ it.y=floor+hs;
        if(!it.hop && it.vy<-0.8){ it.hop=true; it.vy*=-0.22; _dzSnd("tick"); }  // one small bounce, then down
        else { it.shelf=over; _dzLand(g, it, pz); } }
      continue; }
    if(it.fall>=0){ it.fall+=dt; continue; }
    if(it.shelf){ it.z+=dpz; SH.push(it); continue; }
    it.ox=it.x; it.oz=it.z;
    if(it.layer===0){ it.x+=it.vx*dt; it.z+=it.vz*dt; it.vx*=fr; it.vz*=fr; L0.push(it); } else L1.push(it);
  }
  // the shelf: what rides it is held by the back wall as it goes under, and by each other,
  // and whatever finds itself past the front edge tips off it onto the deck
  for(let pass=0;pass<2;pass++){
    for(const a of SH){ if(a.z-a.r<C.WALL) a.z=C.WALL+a.r; if(a.x<-C.HX+a.r) a.x=-C.HX+a.r; else if(a.x>C.HX-a.r) a.x=C.HX-a.r; }
    for(let i=0;i<SH.length;i++) for(let j=i+1;j<SH.length;j++){ const a=SH[i], b=SH[j], dx=b.x-a.x, dz=b.z-a.z, R=a.r+b.r, d2=dx*dx+dz*dz;
      if(d2>=R*R || d2<1e-10) continue; const d=Math.sqrt(d2), o=R-d, nx=dx/d, nz=dz/d;
      let wa=0.5, wb=0.5; if(a.z-a.r<=C.WALL+0.0005 && nz>0){ wa=0; wb=1; } else if(b.z-b.r<=C.WALL+0.0005 && nz<0){ wa=1; wb=0; }
      a.x-=nx*o*wa; a.z-=nz*o*wa; b.x+=nx*o*wb; b.z+=nz*o*wb; } }
  for(const a of SH) if(a.z>pz){ a.shelf=false; a.drop=0; a.hop=true; a.y=C.SHELF+hs; a.vy=0; a.vz=0.06; a.tip=0.5; }
  // the deck's tokens: the pusher's face, the walls, each other (three passes)
  for(let pass=0;pass<3;pass++){
    for(const a of L0){ if(a.z-a.r<pz){ a.z=pz+a.r; if(vp>0 && a.vz<vp) a.vz=vp; }
      if(a.x<-C.HX+a.r) a.x=-C.HX+a.r; else if(a.x>C.HX-a.r) a.x=C.HX-a.r; }
    for(let i=0;i<L0.length;i++){ const a=L0[i];
      for(let j=i+1;j<L0.length;j++){ const b=L0[j], dx=b.x-a.x; if(dx>a.r+b.r || dx<-(a.r+b.r)) continue;
        const dz=b.z-a.z, R=a.r+b.r, d2=dx*dx+dz*dz; if(d2>=R*R || d2<1e-10) continue;
        const d=Math.sqrt(d2), o=(R-d), nx=dx/d, nz=dz/d;
        // whoever is against the pusher's face cannot be shoved back into it
        let wa=b.m/(a.m+b.m), wb=a.m/(a.m+b.m);
        if(a.z-a.r<=pz+0.0005 && nz>0){ wa=0; wb=1; } else if(b.z-b.r<=pz+0.0005 && nz<0){ wa=1; wb=0; }
        a.x-=nx*o*wa; a.z-=nz*o*wa; b.x+=nx*o*wb; b.z+=nz*o*wb; } } }
  // what a shove moved, part of it carried on as a slide
  for(const a of L0){ const ddx=a.x-a.ox, ddz=a.z-a.oz; a.dx=ddx; a.dz=ddz;
    a.vx+=(ddx/dt-a.vx)*0.25; a.vz+=(ddz/dt-a.vz)*0.25; const s=Math.hypot(a.vx,a.vz); if(s>0.5){ a.vx*=0.5/s; a.vz*=0.5/s; } }
  // the second layer: each rides on what is under it, or comes down off it
  for(const u of L1){ let sx=0, sz=0, n=0;
    for(const a of L0){ const dx=a.x-u.x, dz=a.z-u.z; if(dx*dx+dz*dz<(a.r+u.r)*(a.r+u.r)*0.42){ sx+=a.dx; sz+=a.dz; n++; } }
    if(n){ u.x+=sx/n; u.z+=sz/n; } else u.layer=0;
    if(u.z-u.r<pz){ u.z=pz+u.r; }
    if(u.x<-C.HX+u.r) u.x=-C.HX+u.r; else if(u.x>C.HX-u.r) u.x=C.HX-u.r; }
  for(let i=0;i<L1.length;i++) for(let j=i+1;j<L1.length;j++){ const a=L1[i], b=L1[j], dx=b.x-a.x, dz=b.z-a.z, R=a.r+b.r, d2=dx*dx+dz*dz;
    if(d2<R*R && d2>1e-10){ const d=Math.sqrt(d2), o=(R-d)/2; a.x-=dx/d*o; a.z-=dz/d*o; b.x+=dx/d*o; b.z+=dz/d*o; } }
  // over the lip: it is won (and into the bucket, three more tokens)
  for(const it of g.items) if(it.fall<0 && it.drop<0 && it.z>C.EDGE){ it.fall=0; it.layer=0; it.vz=Math.max(it.vz, 0.12);
    if(live){ const v=_DZ.VAL[it.type]; g.won+=v; g.flash=1;
      if(Math.abs(it.x-g.bonusX)<0.065){ g.hop=Math.min(_DZ.HOP+10, g.hop+3); g.last="BONUS! +3 TOKENS"; _dzSnd("line"); }
      else if(v>=10){ g.last="+"+v+" · "+({big:"BIG COIN",die:"THE DIE",gem:"THE GEM",car:"THE TOY CAR"})[it.type]; _dzSnd("jingle"); }
      else _dzSnd("coins"); } }
  // done falling: gone (a prize back in the chute's bin for later)
  g.items=g.items.filter(it=>{ if(it.fall>0.7){ if(it.mesh){ DOZER.cab.G.remove(it.mesh); it.mesh=null; } return false; } return true; });
  // the hopper fills back up, one every three seconds
  if(g.hop<_DZ.HOP){ g.regen+=dt; if(g.regen>=_DZ.REGEN){ g.regen=0; g.hop++; } } else g.regen=0;
  g.shakeCD=Math.max(0, g.shakeCD-dt); g.flash=Math.max(0, g.flash-dt*2);
}
// where everything is drawn: the tokens' instances, the prizes, the pusher, the chute, the bulbs, the readout
const _dzM=new T.Matrix4(), _dzQ=new T.Quaternion(), _dzE=new T.Euler(), _dzV=new T.Vector3(), _dzS=new T.Vector3(1,1,1), _dzC=new T.Color();
// one token into the coins' buffers, at slot n: the disc's points and normals turned and moved by m
function _dzPut(C, n, m, col){
  const U=C.coins.userData, e=m.elements, nv=U.nv, P=U.aP.array, N=U.aN.array, K=U.aC.array, oP=U.oP, oN=U.oN;
  for(let i=0, o=n*nv*3; i<nv*3; i+=3, o+=3){ const x=oP[i], y=oP[i+1], z=oP[i+2], a=oN[i], b=oN[i+1], c=oN[i+2];
    P[o]=e[0]*x+e[4]*y+e[8]*z+e[12]; P[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; P[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
    N[o]=e[0]*a+e[4]*b+e[8]*c; N[o+1]=e[1]*a+e[5]*b+e[9]*c; N[o+2]=e[2]*a+e[6]*b+e[10]*c;
    K[o]=col.r; K[o+1]=col.g; K[o+2]=col.b; } }
function _dzDraw(g){
  const C=DOZER.cab; let n=0;
  for(const it of g.items){
    let y=C.DECK+C.TH/2+0.0015+(it.layer===1 ? C.TH+0.0006 : 0), x=it.x, z=it.z, tilt=0;
    if(it.shelf) y=C.SHELF+C.TH/2+0.0015;
    if(it.drop>=0){ y=it.y; tilt=it.tip*Math.max(0, Math.cos(it.drop*9)); }       // (it tumbles a little on the way down)
    if(it.fall>=0){ z=it.z+it.fall*0.10; y=C.DECK+0.004-it.fall*it.fall*1.4; tilt=Math.min(1.2, it.fall*4); }
    if(it.type==="coin"){ if(n>=C.MAXC) continue;
      _dzE.set(tilt, it.rot, 0, "YXZ"); _dzQ.setFromEuler(_dzE); _dzV.set(x, y, z); _dzM.compose(_dzV, _dzQ, _dzS);
      _dzC.setRGB(1, 0.94+((it.rot*7)%1)*0.06, 0.88+((it.rot*3)%1)*0.12); _dzPut(C, n, _dzM, _dzC); n++; }
    else if(it.mesh){ const h=it.type==="big" ? 0.005 : it.type==="car" ? 0.0 : 0.02;
      it.mesh.position.set(x, y-C.TH/2+h+(it.type==="die"?0.0:0), z); it.mesh.rotation.set(tilt, it.rot, 0); }
  }
  { const U=C.coins.userData; C.coins.geometry.setDrawRange(0, n*U.ni);
    for(const a of [U.aP, U.aN, U.aC]){ a.updateRange.offset=0; a.updateRange.count=n*U.nv*3; a.needsUpdate=true; } }
  C.pusher.position.z=g.pz-0.0;
  C.chute.position.x=g.aim; C.bucket.position.x=g.bonusX;
  C.trayGlow.material.opacity=0.25+0.6*g.flash;
  const k=Math.floor(DOZER.t*8);
  C.bulbs.forEach((b,i)=>{ b.material=((i+k)%3===0) ? C.bA : C.bB; });
  C.neons.forEach((m,i)=>{ const f=i ? 0.75+0.25*Math.sin(DOZER.t*3+i)+g.flash*0.5 : 0.8+0.6*g.flash; m.material.color.copy(m.userData.base).multiplyScalar(Math.min(1.4, f)); });
}
function _dzReadout(g, live){
  const R=DOZER.cab.read, x=R.x, W=512, H=64;
  x.fillStyle="#03060c"; x.fillRect(0,0,W,H);
  x.textAlign="center"; x.textBaseline="middle"; x.font="bold 26px 'Courier New', monospace";
  if(live){
    x.fillStyle="#ffd247"; x.fillText("WON "+("0000"+g.won).slice(-4), W*0.18, H/2);
    x.fillStyle="#3df3ff"; x.fillText("TOKENS "+("00"+g.hop).slice(-2), W*0.50, H/2);
    x.fillStyle=g.last ? "#ff3ecb" : "#8a8aa0"; x.font="bold 18px 'Courier New', monospace";
    x.fillText(g.last || (g.hop<_DZ.HOP ? "NEXT IN "+Math.ceil(_DZ.REGEN-g.regen)+"s" : "HOPPER FULL"), W*0.83, H/2);
  } else {
    x.fillStyle=((DOZER.t*2)|0)%2 ? "#ffd247" : "#ff3ecb"; x.fillText("E TO PLAY · HI "+("0000"+DOZER.hi).slice(-4), W/2, H/2);
  }
  R.tex.needsUpdate=true;
  // and the same on the backglass, in the band across its top, where you look while you play
  const B=DOZER.cab.back, b=B.x, put=(t, px, py, size, w, col)=>{ let f=size; b.font="bold "+f+"px 'Courier New', monospace";
    while(f>10 && b.measureText(t).width>w){ f-=2; b.font="bold "+f+"px 'Courier New', monospace"; } b.fillStyle=col; b.fillText(t, px, py); };
  b.drawImage(B.base, 0, 0); b.textAlign="center"; b.textBaseline="middle";
  if(live){
    put("WON "+("0000"+g.won).slice(-4), 150, 52, 36, 196, g.flash>0 ? "#fff3b0" : "#ffd247");
    put("TOKENS "+("00"+g.hop).slice(-2), 362, 52, 36, 196, g.hop>0 ? "#3df3ff" : "#ff5a3a");
    put(g.last || (g.hop<_DZ.HOP ? "NEXT TOKEN IN "+Math.ceil(_DZ.REGEN-g.regen)+"s" : "HOPPER FULL"), 256, 98, 24, 400, g.last ? "#ff3ecb" : "#8a8aa0");
  } else {
    put("E TO PLAY", 256, 52, 36, 400, ((DOZER.t*2)|0)%2 ? "#ffd247" : "#ff3ecb");
    put("HIGH SCORE "+("0000"+DOZER.hi).slice(-4), 256, 98, 24, 400, "#3df3ff");
  }
  B.tex.needsUpdate=true;
}
DOZER.start=function(){
  const C=DOZER.cab; if(!C || DOZER.on) return;
  if(typeof DARTS!=="undefined" && DARTS.on) DARTS.stop();
  if(typeof HOCKEY!=="undefined" && HOCKEY.on) HOCKEY.stop();
  if(typeof HOOPS!=="undefined" && HOOPS.on) HOOPS.stop();
  if(typeof RAIDERS!=="undefined" && RAIDERS.on) RAIDERS.stop();
  if(typeof CABS!=="undefined" && CABS.on) CABS.stop();
  if(seated) standUp();
  DOZER.on=true; DOZER.keys={}; clearKeys();
  if(!DOZER.g) DOZER.g=DOZER.newGame();
  DOZER.g.last=""; _dzSnd("coin");
  toast("A D · AIM   SPACE · DROP A TOKEN   X · SHAKE   N · EMPTY IT   ESC · STEP AWAY","#ffd247");
};
DOZER.stop=function(){ DOZER.on=false; DOZER.keys={}; player.pitch=-0.1; if(DOZER.g) DOZER.g.last=""; };
DOZER.key=function(e){
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ if(!e.repeat) DOZER.stop(); return; }
  if(e.code==="KeyN" && !e.repeat){ const C=DOZER.cab; for(const it of DOZER.g.items) if(it.mesh) C.G.remove(it.mesh); DOZER.g=DOZER.newGame(); toast("A FRESH DECK · THIRTY TOKENS","#ffd247"); return; }
  if(e.code==="Space" && !e.repeat) DOZER.dropCoin();
  if(e.code==="KeyX" && !e.repeat) DOZER.doShake();
  DOZER.keys[e.code]=true;
};
DOZER.mouse=function(dx){ const g=DOZER.g, C=DOZER.cab; if(!g) return; g.aim=clamp(g.aim+dx*0.0009, -C.HX+0.04, C.HX-0.04); };
addEventListener("keyup", e=>{ DOZER.keys[e.code]=false; });
// a click drops a token: at once under pointer lock, and without it on letting go, if the mouse
// hardly moved (a drag is the chute's, as the mouse is everywhere else)
let _dzDown=null;
renderer.domElement.addEventListener("mousedown", e=>{ if(!DOZER.on || e.button!==0) return;
  if(document.pointerLockElement===renderer.domElement) DOZER.dropCoin(); else _dzDown=[e.clientX, e.clientY]; });
addEventListener("mouseup", e=>{ if(DOZER.on && _dzDown && Math.hypot(e.clientX-_dzDown[0], e.clientY-_dzDown[1])<6) DOZER.dropCoin(); _dzDown=null; });
function updateDozer(dt){
  const C=DOZER.cab; if(!C) return;
  DOZER.t+=dt; DOZER.shake=Math.max(0, DOZER.shake-dt);
  const cam=camera.position, near=Math.hypot(cam.x-C.D.x, cam.z-C.D.z)<12 && Math.abs(cam.y-(C.floor+1.5))<3;
  if(!DOZER.on && !near) return;
  if(!DOZER.g) DOZER.g=DOZER.newGame();
  const g=DOZER.g, live=DOZER.on;
  if(live){ const K=DOZER.keys, s=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0); g.aim=clamp(g.aim+s*0.45*dt, -C.HX+0.04, C.HX-0.04); }
  else { // nobody at it: the chute wanders and drops one now and then, so the deck keeps moving
    DOZER.demoT-=dt; g.aim=Math.sin(DOZER.t*0.4)*(C.HX-0.08);
    if(DOZER.demoT<=0){ DOZER.demoT=2.2+Math.random()*1.5; if(g.items.length<170) _dzDrop(g, "coin"); } }
  if(dt>0){ const n=Math.max(1, Math.min(6, Math.ceil(dt*90))), h=Math.min(dt, 0.1)/n;
    for(let k=0;k<n;k++) _dzStep(g, h, live);
    // nothing on the deck is ever lost to a bad number: anything that went wrong goes back in the hopper
    g.items=g.items.filter(it=>{ if(isFinite(it.x) && isFinite(it.z) && isFinite(it.vx) && isFinite(it.vz) && isFinite(it.y)) return true;
      if(it.mesh){ C.G.remove(it.mesh); it.mesh=null; } g.hop=Math.min(_DZ.HOP, g.hop+1); return false; }); }
  if(live) DOZER.hi=Math.max(DOZER.hi, g.won);
  _dzDraw(g);
  DOZER.acc+=dt; if(DOZER.acc>1/10){ DOZER.acc=0; _dzReadout(g, live); }
  if(live){
    // you, at the cabinet, looking down through the glass at the deck (and the shake in your hands)
    player.pos.set(C.stand.x, 0, C.stand.z); player.feetY=C.floor; player.yaw=C.D.ry;
    const d=Math.hypot(C.stand.x-C.look.x, C.stand.z-C.look.z);
    player.pitch=Math.atan2(C.floor+C.DECK-(C.floor+EYE), d)+Math.sin(DOZER.t*60)*DOZER.shake*0.03;
  }
}
if(DOZER.cab){ DOZER.g=DOZER.newGame(); _dzDraw(DOZER.g); _dzReadout(DOZER.g, false); }
