"use strict";
/* REST AREA · 08-site.js
   the interstate, the ramps, the lots, curbs, walks and the plaza, the
   signs, the lights, the planting round it all
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   8 · SITE
   ---------------------------------------------------------------------- */
// Paving is a skin a few centimetres over graded ground, and it has to win
// the depth test against that ground at every range — so every surface laid
// flat on another carries a polygon offset, each a step stronger than the
// thing it lies on: terrain, road, lots and ramps, paint.
const _po=(f)=>({polygonOffset:true, polygonOffsetFactor:f, polygonOffsetUnits:f*2});
bucketOf("road",     ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.road, roughness:0.96}, _po(-1))));
bucketOf("asphalt",  ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.asphalt, roughness:0.97}, _po(-2))));
bucketOf("paint",    ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.enamel,  roughness:0.68}, _po(-4))));
bucketOf("walkflat", ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.concrete,roughness:0.95}, _po(-2))));
bucketOf("bed",      ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.riverRock,roughness:1.0}, _po(-3))));
bucketOf("mulchbed", ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.mulch,   roughness:1.0}, _po(-3))));
bucketOf("gravelbed",()=>new T.MeshStandardMaterial(Object.assign({map:TEX.crushed, roughness:1.0}, _po(-2))));
bucketOf("concrete", ()=>new T.MeshStandardMaterial({map:TEX.concrete, roughness:0.94}));
bucketOf("metal",    ()=>new T.MeshStandardMaterial({map:TEX.galv,     roughness:0.42, metalness:0.55}));
bucketOf("paintm",   ()=>new T.MeshStandardMaterial({map:TEX.enamel,   roughness:0.62, metalness:0.15}));
bucketOf("rock",     ()=>new T.MeshStandardMaterial({map:TEX.rock, roughness:0.96, flatShading:true}));
bucketOf("wood",     ()=>new T.MeshStandardMaterial({map:TEX.wood, roughness:0.86}));
bucketOf("rubber",   ()=>new T.MeshStandardMaterial({map:TEX.rubber, roughness:0.95}));
bucketOf("soot",     ()=>new T.MeshBasicMaterial({color:0xffffff, transparent:true, opacity:0.18,
                          map:TEX.soot, depthWrite:false}));

const WHITE_LINE="#e6e4dc", YELLOW_LINE="#d9a925", HWY_GREEN="#0f6a43";

// a ribbon, built in world space and then re-centred, so the bake can tile
// it by where it actually is rather than lumping it in at the origin
function layRibbon(bk, P, o0, o1, yOff, uv, color){
  const g=ribbonGeo(P, o0, o1, yOff, uv);
  g.computeBoundingBox();
  const c=new T.Vector3(); g.boundingBox.getCenter(c);
  g.translate(-c.x, -c.y, -c.z);
  push(bk, g, c.x, c.y, c.z, 0, color);
}
// a straight run along z at x, following the road's grade, in pieces
function roadRun(bk, x, z0, z1, o0, o1, yOff, uv, color, step){
  const S=step||192;
  for(let a=z0; a<z1-0.01; a+=S){
    const b=Math.min(z1, a+S), P=[];
    for(let z=a; z<=b+0.01; z+=8) P.push({x:x, z:Math.min(z,b), y:roadY(Math.min(z,b))});
    if(P[P.length-1].z<b) P.push({x:x, z:b, y:roadY(b)});
    let s=0; P[0].s=0; for(let i=1;i<P.length;i++){ s+=P[i].z-P[i-1].z; P[i].s=s+a; }
    P[0].s=a;
    layRibbon(bk, P, o0, o1, yOff, uv, color);
  }
}
// an asphalt rectangle laid as 7.4 m tiles, each with its own UV offset and
// a quarter turn: one map over a hundred metres reads as a pattern otherwise
function paveRect(bk, x0,x1,z0,z1, color){
  const TL=7.4, UVS=0.62;
  let sd=(Math.round(Math.abs(x0)*131+Math.abs(z0)*77)|0)*7919 % 2147483647;
  const r2=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
  for(let x=x0; x<x1-0.02; x+=TL) for(let z=z0; z<z1-0.02; z+=TL){
    const w=Math.min(TL, x1-x), d=Math.min(TL, z1-z);
    if(w<0.06||d<0.06) continue;
    const g=new T.PlaneGeometry(w,d), a=g.attributes.uv;
    const ou=r2()*97, ov=r2()*97, rot=(r2()*4)|0;
    for(let i=0;i<a.count;i++){
      let u=a.getX(i)*w*UVS, v=a.getY(i)*d*UVS;
      for(let k=0;k<rot;k++){ const t=u; u=v; v=-t; }
      a.setXY(i, u+ou, v+ov);
    }
    a.needsUpdate=true;
    push(bk, g, x+w/2, PAVE_T, z+d/2, 0, color||"#ffffff", -Math.PI/2, 0);
  }
  addPaveRect(x0,x1,z0,z1,0);
}
// a painted line from (x0,z0) to (x1,z1) on flat paving
function stripe(x0,z0,x1,z1,w,color,y){
  const L=Math.hypot(x1-x0,z1-z0);
  push("paint", planeGeo(w, L, 0), (x0+x1)/2, (y===undefined?PAVE_T:y)+0.002, (z0+z1)/2,
       Math.atan2(x1-x0, z1-z0), color||WHITE_LINE, -Math.PI/2, 0);
}

/* ---- the interstate ---------------------------------------------------- */
(function interstate(){
  for(const [cx, x0, x1, dir] of [[HWY.nb, NB_X0, NB_X1, -1], [HWY.sb, SB_X0, SB_X1, 1]]){
    roadRun("road", cx, -HWY.len/2, HWY.len/2, x0-cx, x1-cx, PAVE_T, 0.40, "#9c9c9a");
    // the travel lanes a shade darker than the shoulders: that is where the
    // binder is still on the stone
    roadRun("road", cx, -HWY.len/2, HWY.len/2, -HWY.lane+0.2, HWY.lane-0.2, PAVE_T+0.001, 0.40, "#8a8a88");
    // edge lines: white on the outside, yellow along the median
    const outer = dir<0 ? cx+HWY.lane : cx-HWY.lane, inner = dir<0 ? cx-HWY.lane : cx+HWY.lane;
    roadRun("paint", outer, -HWY.len/2, HWY.len/2, -0.075, 0.075, PAVE_T+0.002, 1, WHITE_LINE);
    roadRun("paint", inner, -HWY.len/2, HWY.len/2, -0.075, 0.075, PAVE_T+0.002, 1, YELLOW_LINE);
    // the lane line: ten-foot dashes on forty-foot centres
    for(let z=-HWY.len/2; z<HWY.len/2; z+=12.2){
      const P=[{x:cx,z:z,y:roadY(z),s:0},{x:cx,z:z+3.05,y:roadY(z+3.05),s:3.05}];
      layRibbon("paint", P, -0.075, 0.075, PAVE_T+0.002, 1, WHITE_LINE);
    }
    // rumble strips cut into the outside shoulder, ghosted
    for(let z=-HWY.len/2; z<HWY.len/2; z+=24){
      const xs = dir<0 ? cx+HWY.lane+1.0 : cx-HWY.lane-1.0;
      const P=[{x:xs,z:z,y:roadY(z),s:0},{x:xs,z:z+16,y:roadY(z+16),s:16}];
      layRibbon("soot", P, -0.20, 0.20, PAVE_T+0.003, 1, "#30302e");
    }
  }
  /* Mile markers every tenth of a mile, both sides. The rest area is at
     milepost 154; northbound counts up as you go north (toward -z). */
  const mm=(x, z, ry)=>{
    const mile=154+(-z)/1609.34;
    const tex=signTex(64,192,(c,W,H)=>{
      c.fillStyle=HWY_GREEN; c.fillRect(0,0,W,H);
      c.strokeStyle="#eceae2"; c.lineWidth=3; rrect(c,3,3,W-6,H-6,6); c.stroke();
      c.fillStyle="#eceae2";
      fitHwy(c,"79",W*0.7,34,W/2,34);
      fitHwy(c,ry===0?"N":"S",W*0.6,28,W/2,72);
      fitHwy(c,String(Math.floor(mile)),W*0.8,36,W/2,118);
      fitHwy(c,"."+String(Math.round((mile%1)*10)%10),W*0.7,30,W/2,156);
    });
    const y=roadY(z);
    bx("metal", 0.06,1.4,0.06, x, y+0.55, z, 0.5, 0, "#9aa0a2");
    bx("metal", 0.28,0.84,0.02, x, y+1.22, z+(ry===0?-0.02:0.02), 0.5, 0, "#7e8486");
    signPanel(0.26,0.80,tex, x, y+1.22, z+(ry===0?0.002:-0.002), ry);
  };
  for(let z=-1450; z<1450; z+=160.9){
    if(Math.abs(z)<6) continue;
    mm(NB_X1+1.6, z, 0);
    mm(SB_X0-1.6, z+40, Math.PI);
  }
})();

/* ---- guide signs --------------------------------------------------------
   Green, white legend, a white border inset from the edge, on two
   galvanised posts with breakaway bases. Lettering is the plainest wide
   face the browser has. A sign that faces +z is read by northbound
   traffic, which comes from the south. */
function guideSign(x, z, w, h, ry, lines, opts){
  opts=opts||{};
  const y0=(opts.y===undefined ? roadY(z) : opts.y);
  const clear=opts.clear||2.2;
  const tex=signTex(Math.round(w*80), Math.round(h*80), (c,W,H)=>{
    c.fillStyle=opts.bg||HWY_GREEN; rrect(c,0,0,W,H,Math.min(W,H)*0.06); c.fill();
    c.strokeStyle=opts.fg||"#eeece4"; c.lineWidth=Math.max(3,H*0.03);
    rrect(c,H*0.04,H*0.04,W-H*0.08,H-H*0.08,Math.min(W,H)*0.05); c.stroke();
    c.fillStyle=opts.fg||"#eeece4";
    const n=lines.length;
    lines.forEach((L,i)=>{
      const cy=H*(n===1?0.5:(0.30+0.42*i/(n-1)));
      if(L==="↑" || L==="↖" || L==="↗"){
        c.save(); c.translate(W/2, cy); c.rotate(L==="↖"?-0.785:L==="↗"?0.785:0);
        const s=H*0.16; c.beginPath(); c.moveTo(0,-s*1.4); c.lineTo(s,0); c.lineTo(s*0.36,0);
        c.lineTo(s*0.36,s*1.2); c.lineTo(-s*0.36,s*1.2); c.lineTo(-s*0.36,0); c.lineTo(-s,0);
        c.closePath(); c.fill(); c.restore();
      }else fitHwy(c, L, W*0.84, H*(n===1?0.5:0.68/n*1.25), W/2, cy);
    });
  });
  const f=ry===0?1:-1, cz=z;
  const top=y0+clear+h;
  const posts=opts.posts===undefined ? (w>2.4?2:1) : opts.posts;
  for(let k=0;k<posts;k++){
    const px= posts===1 ? x : x+(k?1:-1)*w*0.32;
    bx("metal", 0.12, top-y0, 0.12, px, (y0+top)/2, cz-f*0.06, 0.6, 0, "#a3a8aa");
    bx("concrete", 0.36, 0.20, 0.36, px, y0+0.06, cz-f*0.06, 0.4, 0, "#9a978f");
    addCol(px-0.1, px+0.1, cz-f*0.06-0.1, cz-f*0.06+0.1, y0-1, top);
  }
  bx("metal", w, h, 0.05, x, y0+clear+h/2, cz-f*0.03, 0.4, 0, "#8d9294");
  signPanel(w, h, tex, x, y0+clear+h/2, cz+f*0.002, ry);
}
(function highwaySigns(){
  const east=NB_X1+5.0, west=SB_X0-5.0;
  guideSign(east, 1250, 5.6, 2.6, 0, ["REST AREA","1/2 MILE"]);
  guideSign(east, 800, 5.2, 2.6, 0, ["REST AREA","NEXT RIGHT"]);
  // the blue services panel the state hangs under a rest area sign
  guideSign(east+0.1, 760, 3.0, 1.9, 0, ["RESTROOMS","VENDING · INFO"], {bg:"#1f4fa0", clear:1.6});
  guideSign(-103.4, 440, 2.6, 1.9, 0, ["REST AREA","↗"], {clear:1.5});
  guideSign(east, -640, 4.4, 2.2, 0, ["Erie   37","N.Y. Line   54"]);
  guideSign(west, -380, 4.6, 2.2, Math.PI, ["Meadville   6","Pittsburgh   89"]);
  // speed limits, black on white
  const limit=(x,z,ry)=>guideSign(x, z, 0.92, 1.18, ry, ["SPEED","LIMIT","70"],
                                  {bg:"#ecebe4", fg:"#1a1a1a", clear:1.6, posts:1});
  limit(east, -760, 0); limit(west, 640, Math.PI);
  // on the ramp: where the trucks go and where the cars go
  guideSign(-85.2, 140, 2.4, 1.5, 0, ["TRUCKS","↑"], {y:0, clear:1.5, posts:1});
  guideSign(-68.6, 140, 2.4, 1.5, 0, ["CARS","↗"], {y:0, clear:1.5, posts:1});
  guideSign(-85.0, -168, 3.2, 2.2, 0, ["I-79 NORTH","Erie"], {y:0, clear:1.6});
  // and the one nobody reads until they need to
  const dne=signTex(240,240,(c,W,H)=>{
    c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,H);
    c.fillStyle="#b3151b"; c.beginPath(); c.arc(W/2,H/2,W*0.46,0,7); c.fill();
    c.fillStyle="#f2f0ea"; c.fillRect(W*0.16,H*0.43,W*0.68,H*0.14);
    fitHwy(c,"DO NOT",W*0.6,H*0.13,W/2,H*0.30); fitHwy(c,"ENTER",W*0.6,H*0.13,W/2,H*0.71);
  });
  bx("metal",0.08,2.6,0.08, -82.2, 1.3, 112, 0.5, 0, "#a3a8aa");
  addCol(-82.3,-82.1,111.9,112.1,-1,2.6);
  signPanel(0.9,0.9,dne, -82.2, 2.2, 111.95, Math.PI);
})();

/* ---- the ramps ----------------------------------------------------------- */
(function ramps(){
  for(const P of [RAMP_EXIT, RAMP_ENTRY]){
    layRibbon("asphalt", P, -4.2, 4.2, PAVE_T, 0.40, "#9a9a98");
    addPaveRibbon(P, -4.2, 4.2);
    // a solid white line at the right edge (east) and yellow at the left
    layRibbon("paint", P, -3.85, -3.70, PAVE_T+0.003, 1, WHITE_LINE);
    layRibbon("paint", P,  3.70,  3.85, PAVE_T+0.003, 1, YELLOW_LINE);
  }
  // white chevrons in the gores where each ramp parts from the road
  for(const [z0,dz] of [[470,-1],[-505,1]]){
    for(let k=0;k<5;k++){
      const z=z0+dz*k*7;
      stripe(NB_X1-0.2, z, NB_X1+1.8, z+dz*2.4, 0.3, WHITE_LINE);
    }
  }
})();

/* ---- the lots ----------------------------------------------------------- */
(function lots(){
  const Tk=SITE.truck, Cr=SITE.car, Is=SITE.island;
  paveRect("asphalt", Tk.x0, Tk.x1, Tk.z0, Tk.z1, "#a8a8a6");
  paveRect("asphalt", Cr.x0, Cr.x1, Cr.z0, Cr.z1, "#b2b2b0");
  paveRect("asphalt", Is.x0, Is.x1, Is.z1, Tk.z1, "#acacaa");      // south link
  paveRect("asphalt", Is.x0, Is.x1, Tk.z0, Is.z0, "#acacaa");      // north link
  addZone(Tk.x0, Tk.x1, Tk.z0, Tk.z1, -1, 6, "TRUCK PARKING");
  addZone(Cr.x0, Cr.x1, Cr.z0, Cr.z1, -1, 4, "CAR PARKING");

  // ---- car stalls: two rows of ninety-degree stalls on a two-way aisle
  const C=CARLOT;
  for(let z=C.stallZ0; z<=C.stallZ1+0.01; z+=C.stallW){
    stripe(Cr.x0+0.3, z, C.aisle0, z, 0.11, WHITE_LINE);
    stripe(C.aisle1, z, Cr.x1-0.3, z, 0.11, WHITE_LINE);
  }
  // accessible stalls by the walk: the blue field, the hatched aisle, the
  // symbol, and the curb painted blue in front of them
  const ADA=[[-6.875,-4.125],[-1.375,1.375],[4.125,6.875]];
  for(const [za,zb] of ADA){
    push("paint", planeGeo(5.6, zb-za-0.2, 0), (C.aisle1+Cr.x1)/2, PAVE_T+0.0015, (za+zb)/2, 0, "#2c56a8", -Math.PI/2, 0);
  }
  const isa=signTex(256,256,(c,W,H)=>{ c.clearRect(0,0,W,H); drawISA(c,W/2,H/2+8,150,"#f2f0ea"); });
  const isaMat=new T.MeshStandardMaterial({map:isa, transparent:true, roughness:0.7, depthWrite:false,
                     polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12});
  for(const [za,zb] of ADA){
    const m=new T.Mesh(new T.PlaneGeometry(1.5,1.5), isaMat);
    m.rotation.order="YXZ"; m.rotation.set(-Math.PI/2, -Math.PI/2, 0);
    m.position.set(-28.6, PAVE_T+0.004, (za+zb)/2); scene.add(m);
  }
  // the hatched access aisle between the first two
  for(let k=0;k<6;k++) stripe(C.aisle1+0.5+k*0.9, -4.1, C.aisle1+1.4+k*0.9, -1.4, 0.12, "#e6e4dc");
  // crosswalks over the aisle to the walk, zebra
  for(const zc of [-14.5, 14.5]) for(let k=0;k<8;k++)
    push("paint", planeGeo(0.42, 2.8, 0), C.aisle0+0.6+k*1.05, PAVE_T+0.002, zc, 0, WHITE_LINE, -Math.PI/2, 0);
  // and an arrow down the aisle every so often: the lot runs north
  const arrow=(x,z,len)=>{
    stripe(x, z+len*0.5, x, z-len*0.2, 0.16, WHITE_LINE);
    const g=new T.ShapeGeometry(new T.Shape([new T.Vector2(-0.45,0), new T.Vector2(0.45,0), new T.Vector2(0,0.9)]));
    push("paint", g, x, PAVE_T+0.002, z-len*0.2, 0, WHITE_LINE, -Math.PI/2, 0);
  };
  for(const z of [-90,-45,25,70]) arrow((C.aisle0+C.aisle1)/2, z, 3.6);
  for(const z of [-120,-60,0,60]) arrow((TRUCKLOT.aisle0+TRUCKLOT.aisle1)/2, z, 4.6);

  // ---- truck stalls, angled off the aisle to the north-west
  const TL=TRUCKLOT, sa=Math.sin(TL.angle), ca=Math.cos(TL.angle);
  for(let z=TL.stallZ1; z>=TL.stallZ0; z-=TL.pitch){
    const L=(TL.aisle0-Tk.x0-0.6)/sa;
    stripe(TL.aisle0, z, TL.aisle0-sa*L, z-ca*L, 0.14, "#e2e0d8");
  }
  stripe(TL.aisle0, Tk.z0+6, TL.aisle0, Tk.z1-6, 0.14, "#e2e0d8");
  // the lane they drive in, worn dark down the wheel paths
  for(const dx of [-1.0,1.0]){
    push("soot", planeGeo(1.1, Tk.z1-Tk.z0-12, 0), (TL.aisle0+TL.aisle1)/2+dx, PAVE_T+0.004,
         (Tk.z0+Tk.z1)/2, 0, "#3a3936", -Math.PI/2, 0);
  }
  // oil under where the trucks stand
  for(let z=TL.stallZ1-3; z>=TL.stallZ0; z-=TL.pitch){
    push("soot", planeGeo(2.0, 4.2, 0), TL.aisle0-sa*10, PAVE_T+0.005+((z|0)%5)*0.0005, z-ca*10, TL.angle,
         "#262522", -Math.PI/2, 0);
  }
  // ---- the island: curbed, grassed, planted
  const curb=(x0,x1,z0,z1)=>{ bx("concrete", x1-x0, 0.30, z1-z0, (x0+x1)/2, 0.0, (z0+z1)/2, 0.6, 0, "#a9a69e"); };
  curb(Is.x0, Is.x0+0.18, Is.z0, Is.z1); curb(Is.x1-0.18, Is.x1, Is.z0, Is.z1);
  curb(Is.x0, Is.x1, Is.z0, Is.z0+0.18); curb(Is.x0, Is.x1, Is.z1-0.18, Is.z1);
  addZone(Is.x0, Is.x1, Is.z0, Is.z1, -1, 4, "THE ISLAND");
  for(let z=Is.z0+8; z<Is.z1-6; z+=14.5){
    FOREST.plant("lawn", -53+(hash2(z,1)-0.5)*3.0, z+(hash2(1,z)-0.5)*3, {scale:0.72+hash2(z,2)*0.25});
  }
  // curbs at the lot edges, broken where traffic goes in and out
  curb(Tk.x0-0.18, Tk.x0, Tk.z0+2, Tk.z1-2);
  curb(Cr.x1, Cr.x1+0.18, Cr.z0+14, SITE.walk.z0);
  curb(Cr.x1, Cr.x1+0.18, SITE.walk.z1, Cr.z1-2);
  curb(Tk.x0, -82, Tk.z1, Tk.z1+0.18);                             // south, west of the ramp
  curb(-68, Cr.x1, Tk.z1, Tk.z1+0.18);                             // south, east of it
  curb(Tk.x0, -82, Tk.z0-0.18, Tk.z0);                             // north, west of the ramp
  curb(-68, -30, Tk.z0-0.18, Tk.z0);                               // north, east of it
})();

/* ---- the walk, the plaza, the paths ------------------------------------- */
const PLAZA_Y=0.15;
(function walks(){
  const W=SITE.walk, P=SITE.plaza;
  // raised slabs: a 30 cm box whose top is the walking surface
  const slab=(x0,x1,z0,z1,c)=>{
    bx("concrete", x1-x0, 0.30, z1-z0, (x0+x1)/2, PLAZA_Y-0.15, (z0+z1)/2, 0.66, 0, c||"#c6c3bb");
    addFlat(x0-0.05, x1+0.05, z0-0.05, z1+0.05, PLAZA_Y);
  };
  slab(W.x0, W.x1, W.z0, -16.0);
  slab(W.x0, W.x1, 16.0, W.z1);
  // the curb cuts where the crosswalks land: a ramp down to the lot
  for(const [za,zb] of [[-16,-13],[13,16]]){
    const g=new FaceGeo().slab([V3(W.x0,PAVE_T+0.01,za),V3(W.x0,PAVE_T+0.01,zb),V3(W.x0+1.2,PLAZA_Y,zb),V3(W.x0+1.2,PLAZA_Y,za)],0.2,0.66).geo();
    push("concrete", g, 0,0,0, 0, "#bdb9b0");
    addRamp(W.x0, W.x0+1.25, za, zb, "x", W.x0, W.x0+1.2, PAVE_T, PLAZA_Y);
    slab(W.x0+1.2, W.x1, za, zb);
    // truncated domes, the yellow warning pad at the foot of every cut
    push("paint", planeGeo(0.6, zb-za-0.3, 0), W.x0+0.45, PAVE_T+0.06, (za+zb)/2, 0, "#c99a2a", -Math.PI/2+0.12, 0);
  }
  slab(W.x0, W.x1, -13, 13);
  slab(P.x0, P.x1, P.z0, P.z1, "#c9c6be");
  slab(P.x1, -5.0, P.z0, -5.5, "#c9c6be");
  slab(P.x1, -5.0, 5.5, P.z1, "#c9c6be");
  // blue curb in front of the accessible stalls (photo 2)
  bx("paint", 0.04, 0.16, 13.6, W.x0-0.015, PLAZA_Y-0.08, 0, 0, 0, "#2b5fb8");
  addZone(W.x0, W.x1, W.z0, W.z1, -1, 4, "THE WALK");
  addZone(P.x0, -5, P.z0, P.z1, -1, 5, "THE PLAZA");
  // paths across the lawn, flush with it: north to the picnic grove,
  // south round to the pet area, and the long way round the back
  const path=(pts, w)=>{
    const S=smoothPath(pts, 1.5);
    layRibbon("walkflat", S, -w/2, w/2, 0.035, 0.66, "#c3c0b8");
  };
  path([{x:-14,z:-19},{x:-13,z:-26},{x:-9,z:-36},{x:-2,z:-48},{x:6,z:-62},{x:12,z:-78}], 2.2);
  path([{x:-14,z:19},{x:-12,z:28},{x:-6,z:40},{x:2,z:52},{x:8,z:66}], 2.0);
  path([{x:-5,z:-19},{x:4,z:-21},{x:12,z:-20},{x:16,z:-10},{x:17,z:0},{x:16,z:10},{x:12,z:20},{x:4,z:21},{x:-5,z:19}], 1.8);
})();

/* ---- lights: the mushroom posts round the walks, taller poles in the lots --
   A grey pole, a flat round hat, a lit drum under it. The lens glows from
   the clock; the light itself is a pool lamp when it is near enough to
   matter, and a faint disc on the ground when it is not. */
bucketOf("lamplens", ()=>emitMat(0xffd7a0, 0.9, "warm"));
bucketOf("lightpool",()=>{ const m=new T.MeshBasicMaterial({color:0xffd9a8, map:TEX.soot, transparent:true,
                          opacity:0, depthWrite:false, blending:T.AdditiveBlending,
                          polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12});
                          GLOW.push({m:m, basic:true, max:0.30}); return m; });
function lampPost(x, z, h, y0){
  const y=y0===undefined ? 0 : y0;
  const big=h>6;
  if(big){ cyl("concrete", 0.32,0.36,0.6,12, x, y+0.25, z, "#a6a39b"); }
  cyl("paintm", big?0.075:0.06, big?0.11:0.08, h, 10, x, y+h/2, z, "#8a8f91");
  cyl("paintm", 0.10,0.10,0.10,10, x, y+h+0.02, z, "#7c8183");
  cyl("lamplens", 0.17,0.17,0.24,14, x, y+h+0.19, z, "#ffffff");
  cyl("paintm", 0.40,0.24,0.08,18, x, y+h+0.35, z, "#8d9294");          // the hat
  cyl("paintm", 0.10,0.22,0.06,14, x, y+h+0.42, z, "#868b8d");
  addCol(x-0.12, x+0.12, z-0.12, z+0.12, y-0.5, y+h);
  LAMPS.push({x:x, y:y+h+0.1, z:z, color: big?0xffc98a:0xffdcb0, intensity: big?1.25:0.95,
              dist: big?26:18, decay:1.5, mothy:true});
  push("lightpool", discGeo(big?8.5:5.5, 24, 0), x, y+0.045, z, 0, big?"#ffc98a":"#ffe2b8");
}
(function lights(){
  for(let z=-96; z<=72; z+=24) if(Math.abs(z)>18) lampPost(-22.2, z, 4.6, PLAZA_Y);
  for(const [x,z] of [[-18.5,-17.5],[-18.5,17.5],[-9,-18],[-9,18],[10,-26],[14,22]])
    lampPost(x, z, 4.6, x<-6?PLAZA_Y:0);
  for(let z=-118; z<=78; z+=33) lampPost(-53, z+6, 8.6, 0);
  for(let z=-140; z<=100; z+=40) lampPost(-91.2, z, 8.6, 0);
})();

/* ---- the planting round the lots ---------------------------------------- */
(function planting(){
  // the mown strip between the road and the truck lot
  for(const z of [-132,-84,-30,22,74]) FOREST.plant("lawn", -96+(hash2(z,3)-0.5)*4, z, {scale:0.8+hash2(z,4)*0.2});
  // south lawn, east of the walk: a pin oak, two spruce, a crabapple or two
  FOREST.plant("lawn", 2, 44, {scale:0.95});
  FOREST.plant("lawn", 22, 76, {scale:1.05});
  FOREST.plant("spruce", -12, 26, {scale:0.9});
  FOREST.plant("spruce", 21, 34, {scale:1.0});
  FOREST.plant("sapling", -16, 58, {scale:0.8, color:"#7e9e4a", autumn:"#c8342a"});
  FOREST.plant("sapling", -2, 30, {scale:0.7, color:"#86a24e", autumn:"#d9a62c"});
  // by the building: a maple each side of the plaza, the one with the flag
  FOREST.plant("lawn", -15, -27, {scale:0.85});
  FOREST.plant("lawn", 24, -6, {scale:1.1});
  FOREST.plant("spruce", 24, 16, {scale:0.8});
})();

/* ---- the beds in front of the pavilion --------------------------------
   River rock, a few boulders the size of a sheep, clipped shrubs in round
   lumps, the way every rest area in the state is landscaped (photos 1, 2). */
(function beds(){
  const bed=(x0,x1,z0,z1,y)=>{
    push("bed", planeGeo(x1-x0, z1-z0, 0.95), (x0+x1)/2, y+0.012, (z0+z1)/2, 0, "#a89f92", -Math.PI/2, 0);
    // a steel edging strip round it
    for(const [a,b,c2,d] of [[x0,x1,z0,z0],[x0,x1,z1,z1],[x0,x0,z0,z1],[x1,x1,z0,z1]])
      bx("paintm", Math.max(0.03,b-a), 0.06, Math.max(0.03,d-c2), (a+b)/2, y+0.03, (c2+d)/2, 0, 0, "#3a3a36");
  };
  const boulder=(x,z,s,y,seed)=>{
    push("rock", rockGeo(s, seed), x, y+s*0.32, z, seed, "#aaa498");
    addCol(x-s*0.8, x+s*0.8, z-s*0.8, z+s*0.8, y, y+s*0.8);
  };
  const Y=PLAZA_Y;
  bed(-20.6,-15.0, -15.5,-4.5, Y); bed(-20.6,-15.0, 4.5,15.5, Y);
  bed(-12.5,-7.5, -16.5,-11.0, Y); bed(-12.5,-7.5, 11.0,16.5, Y);
  boulder(-19.0,-12.5,0.9,Y,3); boulder(-16.4,-7.0,0.7,Y,5); boulder(-18.8,9.6,1.0,Y,7);
  boulder(-16.0,13.2,0.65,Y,9); boulder(-10.6,-14.8,0.75,Y,11); boulder(-9.4,13.4,0.85,Y,13);
  for(const [x,z] of [[-17.6,-10.4],[-19.4,-6.4],[-15.8,-13.8],[-17.4,6.8],[-19.6,12.6],[-15.6,10.4],
                      [-11.2,-12.4],[-8.6,-15.4],[-11.4,12.6],[-8.4,15.2]])
    FOREST.plant("bush", x, z, {y:Y, scale:0.85+hash2(x,z)*0.4, solid:false, lean:false});
  // a boulder or two out on the lawn, because a glacier left them there
  boulder(26,-34,1.4,0,21); boulder(-4,62,1.2,0,23); boulder(-97,-44,1.6,0,25); boulder(30,48,1.1,0,27);
})();
