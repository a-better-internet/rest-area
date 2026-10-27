"use strict";
/* REST AREA · 13-grounds.js
   the picnic grove, its tables and grills and its shelter; the flagpole and
   its flags; the Blue Star marker; the pet area; the bins
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   13 · THE GROUNDS
   North of the pavilion the lawn runs back to the trees under a dozen big
   maples and oaks, with picnic tables scattered on round pads and a charcoal
   grill on a post beside most of them (photographs 8, 9, 13). Somebody has
   had a fire in one of them today.
   ---------------------------------------------------------------------- */
bucketOf("padflat", ()=>new T.MeshStandardMaterial({map:TEX.asphalt, roughness:0.97,
                        polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
bucketOf("char",    ()=>new T.MeshStandardMaterial({map:TEX.rubber, roughness:0.9, metalness:0.2}));
const PICNIC=[];                       // the tables, for the plan and for the ants
/* A classic A-frame table: three planks on two A-frames, the benches bolted
   to the cross-braces. Modelled facing its own +z; the benches are at ±0.62. */
function picnicTable(x, z, ry, color, y0){
  const y=y0||0, c=Math.cos(ry), s=Math.sin(ry);
  const P=(lx,lz)=>[x+lx*c+lz*s, z-lx*s+lz*c];
  const col=color||"#94573a";
  for(const pz of [-0.24,0,0.24]){                                  // the top, three planks, a finger's gap between
    const [px,qz]=P(0,pz); push("wood", boxGeo(1.86, 0.045, 0.222, 1.2), px, y+0.76, qz, ry, col);
  }
  for(const bz of [-0.62,0.62]){                                    // the benches
    const [px,qz]=P(0,bz); push("wood", boxGeo(1.86, 0.045, 0.26, 1.2), px, y+0.45, qz, ry, col);
  }
  for(const lx of [-0.62,0.62]){
    for(const sd of [-1,1]){                                        // the A, both legs
      const [px,qz]=P(lx, sd*0.47);
      push("wood", boxGeo(0.06, 0.86, 0.09, 1.2), px, y+0.37, qz, ry, col, -sd*0.58, 0);
    }
    // the bench brace thinner than the legs and short of the benches' edges, the
    // top cleat short of the planks': no two faces in one plane
    const [bxp,bzp]=P(lx,0); push("wood", boxGeo(0.05, 0.09, 1.44, 1.2), bxp, y+0.39, bzp, ry, col);
    const [tx2,tz2]=P(lx,0); push("wood", boxGeo(0.07, 0.06, 0.64, 1.2), tx2, y+0.71, tz2, ry, col);
  }
  const hx=Math.abs(c)*0.95+Math.abs(s)*0.78, hz=Math.abs(s)*0.95+Math.abs(c)*0.78;
  addCol(x-hx, x+hx, z-hz, z+hz, y-0.5, y+0.80);
  for(const [lx,lz,face] of [[-0.45,0.62,0],[0.45,0.62,0],[-0.45,-0.62,1],[0.45,-0.62,1]]){
    const [px,qz]=P(lx,lz);
    addSeat(px, qz, y+0.48, ry+(face?Math.PI:0), "A PICNIC TABLE");
  }
  PICNIC.push({x:x, z:z, ry:ry});
}
// a charcoal grill on a pipe: firebox, grate, a fist of rust, and ash
function grill(x, z, ry, lit){
  const y=Terrain.groundAt(x,z);
  bx("concrete", 0.36, 0.08, 0.36, x, y+0.02, z, 0.6, 0, "#9a968c");
  cyl("char", 0.045,0.05,0.82,10, x, y+0.45, z, "#3a2e26");
  push("char", boxGeo(0.62, 0.20, 0.44, 0.8), x, y+0.92, z, ry, "#2c241f");
  push("char", boxGeo(0.66, 0.03, 0.48, 0.8), x, y+1.03, z, ry, "#4a3b30");
  for(let k=0;k<6;k++) push("metal", boxGeo(0.01,0.012,0.42,0), x+Math.cos(ry)*(-0.25+k*0.1), y+1.05, z-Math.sin(ry)*(-0.25+k*0.1), ry, "#5a5550");
  push("char", boxGeo(0.64, 0.30, 0.03, 0.8), x-Math.sin(ry)*0.23, y+1.12, z-Math.cos(ry)*0.23, ry, "#2c241f");
  addCol(x-0.33, x+0.33, z-0.33, z+0.33, y-0.5, y+1.1);
  if(lit){ EMBERS.push({x:x, y:y+1.04, z:z}); }
  addUse(x+0.8, z, y, lit?"WARM YOUR HANDS":"LOOK IN THE GRILL",
         ()=>toast(lit?"SOMEBODY'S BRIQUETTES, STILL GOING":"COLD ASH AND A BOTTLE CAP","#cfe0d4"), 1.4);
}
const EMBERS=[];
(function grove(){
  addZone(-22, 30, -104, -21, -2, 8, "PICNIC GROVE");
  const pad=(x,z,r)=>{ push("padflat", discGeo(r||1.9, 28, 0.5), x, Terrain.groundAt(x,z)+0.035, z, 0, "#7d7d7a");
                       addPaveRect(x-r*0.7, x+r*0.7, z-r*0.7, z+r*0.7, Terrain.groundAt(x,z)); };
  const T2=[[-8,-30,0.4],[4,-33,-0.2],[16,-39,0.9],[-13,-47,0.1],[10,-50,1.4],[21,-56,0.3],
            [-7,-63,1.1],[13,-69,-0.5],[2,-80,0.2],[22,-83,1.2],[-11,-79,-0.3],[-2,-94,0.7]];
  T2.forEach(([x,z,r],i)=>{
    pad(x,z,1.95);
    picnicTable(x, z, r, i%4===2 ? "#7c705f" : "#94573a", Terrain.groundAt(x,z)+0.035);
  });
  grill(-4.6,-27.4,0.4,true); grill(19.0,-43.0,0.9); grill(-10.2,-60.2,1.1); grill(16.2,-72.6,-0.5);
  grill(5.4,-91.2,0.7); grill(-14.6,-82.0,-0.3);
  // the shade: big maples and red oaks, open-grown, crowned low
  for(const [x,z,s] of [[-2,-40,1.15],[11,-45,1.05],[-15,-61,1.1],[6,-69,1.2],[25,-65,1.0],
                        [-6,-87,1.15],[16,-91,1.05],[26,-44,0.95],[-17,-36,0.9],[-5,-55,0.85]])
    FOREST.plant("lawn", x, z, {scale:s});
  // two bins at the grove, black domes
  for(const [x,z] of [[0.6,-44],[9.6,-76.5],[-12.2,-72]]){
    const y=Terrain.groundAt(x,z);
    cyl("paintm", 0.32,0.30,0.92,16, x, y+0.46, z, "#2b2d2e");
    push("paintm", domeGeo(0.33,0.22,16), x, y+0.92, z, 0, "#2b2d2e", Math.PI, 0);
    addCol(x-0.34,x+0.34,z-0.34,z+0.34,y-0.5,y+1.2);
  }

  /* --- the shelter: six timber posts, a gable roof, two tables under it ---
     Every grove of any size has one, for the family reunion it rains on. */
  const SX=17.5, SZ=-58.5, W=9.0, D=6.4, H=2.7;
  const y=Terrain.groundAt(SX,SZ);
  bx("concrete", W+0.8, 0.30, D+0.8, SX, y+0.0, SZ, 0.6, 0, "#bcb8ae");
  addFlat(SX-W/2-0.45, SX+W/2+0.45, SZ-D/2-0.45, SZ+D/2+0.45, y+0.15);
  addZone(SX-W/2, SX+W/2, SZ-D/2, SZ+D/2, y-1, y+5, "PICNIC SHELTER", true);
  for(const px of [-W/2+0.2, 0, W/2-0.2]) for(const pz of [-D/2+0.2, D/2-0.2]){
    bx("beam", 0.20, H, 0.20, SX+px, y+0.15+H/2, SZ+pz, 0.6, 0, "#6e5038");
    addCol(SX+px-0.11, SX+px+0.11, SZ+pz-0.11, SZ+pz+0.11, y-0.5, y+H);
  }
  for(const pz of [-D/2+0.2, D/2-0.2]) bx("beam", W+0.2, 0.28, 0.20, SX, y+0.15+H+0.14, SZ+pz, 0.6, 0, "#6e5038");
  const RY=y+0.15+H+0.28, RH=1.9, ov=0.6;
  for(const sg of [-1,1]){
    const o2=ov-(sg>0?0.012:0);                         // the two planes end a centimetre apart at the gables
    const g=new FaceGeo().slab([V3(SX-W/2-o2, RY+RH, SZ), V3(SX+W/2+o2, RY+RH, SZ),
                                V3(SX+W/2+o2, RY-0.3, SZ+sg*(D/2+ov)), V3(SX-W/2-o2, RY-0.3, SZ+sg*(D/2+ov))], 0.14, 0.5).geo();
    push("shingle", g, 0,0,0, 0, "#c9c2b9");
    push("beam", planeGeo(W+2*ov, Math.hypot(D/2+ov, RH+0.3), 0.8), SX, RY+RH/2-0.25, SZ+sg*(D/2+ov)/2, 0, "#8a6a4a",
         Math.PI/2+sg*Math.atan2(RH+0.3, D/2+ov), 0);
  }
  /* the frame under the roof: a king-post truss over each pair of posts (a tie beam across on the plates, the king
     post up from it to the ridge beam, a strut each side up to the rafters, the rafters under the boards); the
     ridge beam the length of the roof, and barge boards along the open gables' edges. Every piece is laid under the
     roof boards' underside, which falls from RY+1.80 at the ridge at the roof's pitch */
  const TAN=(RH+0.3)/(D/2+ov), COS=Math.cos(Math.atan(TAN)), TIM="#6e5038";
  const under=dz=>RY+0.70+(1.9-Math.abs(dz))*TAN;                   // the boards' underside, |dz| from the ridge
  const slope=(x, za, zb, top, deep, w)=>{                          // a timber along the pitch, its top a hair under the boards
    const ya=under(za)-0.012-deep/(2*COS), yb=under(zb)-0.012-deep/(2*COS), L=Math.hypot(zb-za, yb-ya);
    push("beam", boxGeo(w, deep, L, 0.6), x, (ya+yb)/2, SZ+(za+zb)/2, 0, TIM, Math.atan2(ya-yb, zb-za), 0); };
  for(const px of [-W/2+0.2, 0, W/2-0.2]){
    const x=SX+px;
    bx("beam", 0.20, 0.22, D-0.4+0.26, x, RY+0.11, SZ, 0.6, 0, TIM);                                   // the tie, 3 cm past the plates
    bx("beam", 0.14, under(0)-0.012-0.24-(RY+0.22)+0.03, 0.14, x, (RY+0.22+under(0)-0.252+0.03)/2, SZ, 0.6, 0, TIM);
    for(const sg of [-1,1]){
      slope(x, sg*(D/2-0.2+0.30), sg*0.08, 0, 0.20, 0.12);                                            // the rafter, tail out over the plate
      const a=V3(x, RY+0.30, SZ+sg*0.07), b=V3(x, under(1.7)-0.012-0.20/COS-0.02, SZ+sg*1.7), d=b.clone().sub(a);
      push("beam", boxGeo(0.10, 0.12, d.length(), 0.6), x, (a.y+b.y)/2, (a.z+b.z)/2, 0, TIM, Math.atan2(-d.y, d.z), 0); } }
  bx("beam", W+2*ov-0.06, 0.24, 0.16, SX, under(0)-0.012-0.12, SZ, 0.6, 0, TIM);                       // the ridge beam
  for(const gx of [-1,1]) for(const sg of [-1,1]) slope(SX+gx*(W/2+ov-0.05-(sg>0 ? 0.006 : 0)), sg*(D/2+ov-0.02), 0, 0, 0.24, 0.04);   // barge boards (the pair 6 mm apart where they cross at the ridge)
  picnicTable(SX-2.3, SZ, 0, "#94573a", y+0.15);
  picnicTable(SX+2.3, SZ, 0, "#94573a", y+0.15);
  LAMPS.push({x:SX, y:RY-0.25, z:SZ+0.5, color:0xffdcb0, intensity:0.6, dist:9, decay:1.5, mothy:true, circ:"site"});
  bx("paintm", 0.16, 0.05, 0.16, SX, RY-0.025, SZ+0.5, 0, 0, "#3a3a38");
  push("lamplens", new T.SphereGeometry(0.10,10,8), SX, RY-0.10, SZ+0.5, 0, "#ffffff");
})();

/* ---- the flagpole: the national flag over the commonwealth's ------------- */
const FLAGS=[];
(function flagpole(){
  const x=-17.4, z=23.2, y=0, H=9.6;
  bx("concrete", 0.9, 0.24, 0.9, x, y+0.06, z, 0.6, 0, "#b9b5ab");
  cyl("metal", 0.05,0.085,H,12, x, y+H/2, z, "#cfd2d3");
  push("paintm", new T.SphereGeometry(0.10,12,8), x, y+H+0.08, z, 0, "#c9a23a");
  addCol(x-0.45,x+0.45,z-0.45,z+0.45,y-0.5,y+H);
  const us=signTex(380,200,(c,W,H2)=>{
    for(let i=0;i<13;i++){ c.fillStyle=i%2?"#f4f2ec":"#b22234"; c.fillRect(0,i*H2/13,W,H2/13+1); }
    c.fillStyle="#3c3b6e"; c.fillRect(0,0,W*0.4,H2*7/13);
    c.fillStyle="#f4f2ec";
    for(let r=0;r<9;r++) for(let k=0;k<(r%2?5:6);k++){
      const sx=W*0.4*((k+(r%2?1:0.5))/6), sy=H2*7/13*((r+0.5)/9);
      c.beginPath(); for(let p=0;p<5;p++){ const a=-Math.PI/2+p*4*Math.PI/5; c.lineTo(sx+Math.cos(a)*4, sy+Math.sin(a)*4); } c.fill();
    }
  });
  const pa=signTex(380,240,(c,W,H2)=>{
    c.fillStyle="#1f3b86"; c.fillRect(0,0,W,H2);
    // the coat of arms, simplified: two horses supporting a shield, an eagle over it
    c.fillStyle="#c9a23a"; c.beginPath(); c.ellipse(W/2,H2*0.52,W*0.10,H2*0.20,0,0,7); c.fill();
    c.fillStyle="#6b4a2a"; c.beginPath(); c.ellipse(W*0.36,H2*0.55,W*0.06,H2*0.16,0.2,0,7); c.fill();
    c.beginPath(); c.ellipse(W*0.64,H2*0.55,W*0.06,H2*0.16,-0.2,0,7); c.fill();
    c.fillStyle="#3a2a1c"; c.beginPath(); c.ellipse(W/2,H2*0.24,W*0.08,H2*0.06,0,0,7); c.fill();
    c.fillStyle="#d9b54a"; c.fillRect(W*0.28,H2*0.78,W*0.44,H2*0.06);
  });
  const mk=(tex, top)=>{
    const g=new T.PlaneGeometry(1.52, 0.86, 18, 8);
    const m=new T.Mesh(g, new T.MeshStandardMaterial({map:tex, side:T.DoubleSide, roughness:0.85}));
    m.position.set(x+0.80, y+top-0.43, z); m.castShadow=true; scene.add(m);
    FLAGS.push({m:m, base:g.attributes.position.array.slice(), ph:FLAGS.length*1.3});
  };
  mk(us, H-0.08); mk(pa, H-1.10);
  addZone(x-2,x+2,z-2,z+2,-1,12,"THE FLAGPOLE");
})();
function updateGrounds(dt, now, dark){
  // the flags stream downwind, more in a gust; the free edge does the most
  const g=0.35+Wind.gust*0.9;
  for(const f of FLAGS){
    const p=f.m.geometry.attributes.position, b=f.base;
    for(let i=0;i<p.count;i++){
      const bx2=b[i*3], by=b[i*3+1], u=(bx2+0.76)/1.52;
      const w=Math.sin(bx2*4.2-now*(5+g*3)+f.ph)*0.09*u*(0.6+g) + Math.sin(by*3.0-now*3.1)*0.03*u;
      p.setXYZ(i, bx2*(1-0.04*u*(1-g)), by-u*u*0.10*(1-g), w);
    }
    p.needsUpdate=true; f.m.geometry.computeVertexNormals();
  }
  // somebody's briquettes, still going
  for(const e of EMBERS){ if(!e.s) continue; e.s.material.opacity=0.55+0.35*Math.sin(now*3.3+e.x)*Math.sin(now*1.7); }
}

/* ---- the Blue Star Memorial Highway marker, in the bed by the walk ------- */
(function marker(){
  const x=-18.6, z=-9.6, y=PLAZA_Y;
  cyl("paintm", 0.05,0.05,1.5,10, x, y+0.75, z, "#5a5e5a");
  const tex=signTex(300,330,(c,W,H)=>{
    c.fillStyle="#1d2b22"; c.beginPath(); c.moveTo(0,H*0.22); c.quadraticCurveTo(W/2,-H*0.08,W,H*0.22);
    c.lineTo(W,H); c.lineTo(0,H); c.closePath(); c.fill();
    c.strokeStyle="#c9b46a"; c.lineWidth=6; c.stroke();
    c.fillStyle="#3c6ad0"; c.beginPath();
    for(let p=0;p<10;p++){ const a=-Math.PI/2+p*Math.PI/5, r=p%2?18:42; c.lineTo(W/2+Math.cos(a)*r, H*0.25+Math.sin(a)*r); }
    c.fill();
    c.fillStyle="#d9c98a";
    fitText(c,"BLUE STAR",W*0.7,H*0.09,W/2,H*0.46,"700");
    fitText(c,"MEMORIAL HIGHWAY",W*0.84,H*0.07,W/2,H*0.56,"700");
    ["A tribute to the Armed Forces","that have defended the","United States of America"].forEach((t,i)=>
      fitText(c,t,W*0.84,H*0.045,W/2,H*(0.67+i*0.065),"400"));
    fitText(c,"Garden clubs of Pennsylvania",W*0.8,H*0.04,W/2,H*0.89,"400");
  });
  bx("paintm", 0.06, 0.82, 0.78, x-0.02, y+1.42, z, 0, 0, "#1d2b22");
  signPanel(0.74, 0.80, tex, x-0.06, y+1.42, z, -Math.PI/2);
  addCol(x-0.1,x+0.1,z-0.4,z+0.4,y-0.5,y+1.9);
  addUse(x-1.0, z, y, "READ THE MARKER", ()=>toast("BLUE STAR MEMORIAL HIGHWAY","#8fb4ff"), 1.6);
})();

/* ---- the pet area, the rules, the bins out in the lots --------------------- */
(function petArea(){
  const brown=(w,h,lines,x,z,ry,y0)=>{
    const tex=signTex(Math.round(w*220),Math.round(h*220),(c,W,H)=>{
      c.fillStyle="#5b3a24"; rrect(c,0,0,W,H,10); c.fill(); c.strokeStyle="#efe9d8"; c.lineWidth=5;
      rrect(c,6,6,W-12,H-12,8); c.stroke(); c.fillStyle="#efe9d8";
      lines.forEach((L,i)=>fitHwy(c,L,W*0.84,H*0.7/lines.length,W/2,H*(0.5+(i-(lines.length-1)/2)*0.8/lines.length)));
    });
    const y=(y0===undefined?Terrain.groundAt(x,z):y0);
    bx("metal",0.06,1.9,0.06, x, y+0.95, z, 0.5, 0, "#8a6a4a");
    signPanel(w,h,tex, x+Math.sin(ry)*0.035, y+1.6, z+Math.cos(ry)*0.035, ry);
    addCol(x-0.08,x+0.08,z-0.08,z+0.08,y-0.5,y+1.9);
  };
  brown(1.0,0.56,["PET","EXERCISE AREA"], 12.6, 64.6, Math.PI*0.85);
  brown(0.9,0.34,["NO PETS"], -21.0, -20.0, -Math.PI/2, PLAZA_Y);
  brown(0.9,0.34,["PETS  →"], -21.0, 20.4, -Math.PI/2, PLAZA_Y);
  addZone(8, 30, 60, 100, -2, 6, "PET EXERCISE AREA");
  // the bag dispenser and its bin, on a green post
  const x=15.4, z=67.2, y=Terrain.groundAt(x,z);
  cyl("paintm", 0.04,0.04,1.4,8, x, y+0.7, z, "#2f6a3a");
  bx("paintm", 0.22, 0.30, 0.12, x, y+1.25, z+0.06, 0, 0, "#2f6a3a");
  bx("paintm", 0.34, 0.50, 0.34, x+0.45, y+0.25, z, 0, 0, "#2f6a3a");
  addCol(x-0.1,x+0.65,z-0.2,z+0.2,y-0.5,y+1.4);
  addUse(x, z+0.9, y, "TAKE A BAG", ()=>toast("THE DISPENSER IS EMPTY","#cfe0d4"), 1.2);
  // brown slatted bins on the island, and black domes by the posts (photograph 18)
  for(const z2 of [-62, -10, 40]){
    const x2=-50.6, y2=0;
    bx("beam", 0.80, 1.05, 0.80, x2, y2+0.53, z2, 0.9, 0, "#6a4630");
    bx("paintm", 0.86, 0.06, 0.86, x2, y2+1.08, z2, 0, 0, "#3a2a20");
    addCol(x2-0.42,x2+0.42,z2-0.42,z2+0.42,y2-0.5,y2+1.1);
  }
})();
