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
// the lots: a step over the ramps they run into, so the overlap shows the lot
bucketOf("lotpave",  ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.asphalt, roughness:0.97}, _po(-3))));
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
bucketOf("soot",     ()=>new T.MeshBasicMaterial(Object.assign({color:0xffffff, transparent:true, opacity:0.18,
                          map:TEX.soot, depthWrite:false}, _po(-5))));

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
// a ribbon whose edges are worked out at each point: f0(i,p,n) and f1(i,p,n) are its two offsets
// (left positive, as ribbonGeo's); it faces up whichever way they run, and a point can pinch to nothing
function ribbonGeoVar(P, f0, f1, yOff, uv){
  const pos=[], uvs=[], idx=[], s=uv||0.35;
  for(let i=0;i<P.length;i++){
    const n=pathSide(P,i), p=P[i], o0=f0(i,p,n), o1=f1(i,p,n);
    pos.push(p.x+n.x*o0, (p.y||0)+yOff, p.z+n.z*o0,  p.x+n.x*o1, (p.y||0)+yOff, p.z+n.z*o1);
    uvs.push(o0*s, p.s*s,  o1*s, p.s*s);
    if(i){ const a=(i-1)*2, b=a+1, c=a+2, d=a+3; idx.push(a,c,b, b,c,d); }
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos,3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uvs,2));
  g.setIndex(idx); g.computeVertexNormals();
  let up=0; const nr=g.attributes.normal; for(let k=0;k<nr.count;k++) up+=nr.getY(k);
  if(up<0){ const ix=g.index.array; for(let k=0;k<ix.length;k+=3){ const t=ix[k+1]; ix[k+1]=ix[k+2]; ix[k+2]=t; } g.computeVertexNormals(); }
  return g;
}
function layRibbonVar(bk, P, f0, f1, yOff, uv, color){
  const g=ribbonGeoVar(P, f0, f1, yOff, uv);
  g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x, -c.y, -c.z);
  push(bk, g, c.x, c.y, c.z, 0, color);
}
/* A RAMP WHERE IT MEETS THE INTERSTATE. P is its centre line, RW its half
   width; X is the interstate's pavement edge on the ramp's side and s which
   side of it the ramp is (+1 east of it, -1 west). The ramp is paved only
   outside that edge, never over the lanes, so where it runs alongside it is
   the strip between the edge and its own far side; and it widens out of
   nothing along a taper of `taper` metres, before its first point (an exit,
   at="start") or after its last (an entrance, at="end"). Where it parts from
   the road the gore between them is paved to its nose (G wide), edged in
   white and chevroned; past the nose it is grass. The ramp's left line is
   yellow from the nose on, its right line white the whole way. `stop(p)`
   says where its lines give out (at the far end's crossroad). Returns the
   whole line, taper and all, and the gore's points. */
function rampPave(P0, RW, X, s, at, taper, color, stop){
  const G=3.6, nT=Math.max(2, Math.round(taper/6));
  const end=at==="start" ? P0[0] : P0[P0.length-1], nb=at==="start" ? P0[1] : P0[P0.length-2];
  const dir=Math.sign(end.z-nb.z)||1;                                      // along the road, out into the taper
  const xo0=end.x+s*RW, tp=[];
  for(let k=1;k<=nT;k++){ const t=k/nT, z=end.z+dir*taper*t, xo=lerp(xo0, X, t);
    tp.push({x:xo-s*RW, z:z, y:roadY(z)}); }
  const Q=(at==="start" ? tp.reverse().concat(P0) : P0.concat(tp)).map(p=>({x:p.x, z:p.z, y:p.y}));   // (copies: the path is the traffic's too)
  Q.forEach((q,i)=>{ q.s=i ? Q[i-1].s+Math.hypot(q.x-Q[i-1].x, q.z-Q[i-1].z) : 0; });
  // how far left the paving may come at each point before it would be on the interstate's (offsets + to the left)
  const room=(p,n)=>{ const k=-s*n.x; return k>0.2 ? (s*(p.x-X)+0.03)/k : 1e9; };
  const inner=(i,p,n)=>clamp(room(p,n), -RW, RW);
  layRibbonVar("asphalt", Q, ()=>-RW, inner, PAVE_T, 0.40, color);
  addPaveRibbon(Q, -RW, RW);
  // the gore: the run of points where the ramp has parted from the road but not by G yet
  const gap=Q.map((p,i)=>room(p, pathSide(Q,i))-RW);                       // > 0: grass (or gore) between them
  // (a run of points between nothing and G apart, with the shared paving at one end of it: after it for an
  //  exit, which parts from the road, before it for an entrance, which closes on it; the clipped point included)
  let g0=-1, g1=-1;
  for(let i=0;i<Q.length;){
    if(!(gap[i]>0.02 && gap[i]<G)){ i++; continue; }
    let j=i; while(j+1<Q.length && gap[j+1]>0.02 && gap[j+1]<G) j++;
    const before=i>0 && gap[i-1]<=0.02, after=j+1<Q.length && gap[j+1]<=0.02;
    if((at==="start" && before) || (at==="end" && after)){ g0=before ? i-1 : i; g1=after ? j+1 : j; break; }
    i=j+1; }
  const gore=g0>=0 ? Q.slice(g0, g1+1) : [];
  if(gore.length>1){
    layRibbonVar("asphalt", gore, ()=>RW-0.01, (i,p,n)=>clamp(room(p,n), RW-0.01, RW+G), PAVE_T, 0.40, color);
    // (its road-side line clear of the road's own edge line, not on it; pinched to nothing until the gore is
    //  40 cm wide, so at the tip it does not lie on the ramp-side line it meets there)
    const gw=(p,n)=>clamp(room(p,n), RW, RW+G);
    layRibbonVar("paint", gore, (i,p,n)=>gw(p,n)-(gw(p,n)-RW<0.40 ? 0.22 : 0.36), (i,p,n)=>gw(p,n)-0.22, PAVE_T+0.002, 1, WHITE_LINE);
    layRibbonVar("paint", gore, ()=>RW-0.30, ()=>RW-0.16, PAVE_T+0.002, 1, WHITE_LINE);
    // chevrons across it, every six metres, pointing the way traffic goes, stopping short of both its lines
    let last=-1e9;
    for(let i=0;i<gore.length;i++){ const p=gore[i], n=pathSide(gore,i), w=clamp(room(p,n), RW, RW+G)-RW;
      if(w<1.4 || p.s-last<6) continue; last=p.s;
      const a=V3(p.x+n.x*(RW+0.25), 0, p.z+n.z*(RW+0.25)), b=V3(p.x+n.x*(RW+w-0.58), 0, p.z+n.z*(RW+w-0.58));
      const back=(at==="start" ? -1 : 1)*dir*Math.min(2.2, w*0.8);           // the chevron's tail upstream
      stripe(a.x, a.z+back, b.x, b.z, 0.30, WHITE_LINE, p.y+PAVE_T); }
  }
  // the ramp's own lines: white on the right all the way, yellow on the left from the gore's nose on
  const live=(p)=>!(stop && stop(p));
  const right=Q.filter(live); if(right.length>2) layRibbon("paint", right, -RW+0.18, -RW+0.32, PAVE_T+0.002, 1, WHITE_LINE);
  const nose=gore.length ? (at==="start" ? gore[gore.length-1] : gore[0]) : null;
  const left=Q.filter((p,i)=>live(p) && gap[i]>=G-0.05 && (!nose || (at==="start" ? p.s>=nose.s : p.s<=nose.s)));
  if(left.length>2) layRibbon("paint", left, RW-0.32, RW-0.18, PAVE_T+0.002, 1, YELLOW_LINE);
  return {line:Q, gore:gore, nose:nose};
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
    // the shoulders, and between them the travel lanes a shade darker: that
    // is where the binder is still on the stone. Side by side, not stacked:
    // a millimetre between layers is nothing to the depth buffer at 200 m
    roadRun("road", cx, -HWY.len/2, HWY.len/2, x0-cx, -HWY.lane+0.2, PAVE_T, 0.40, "#9c9c9a");
    roadRun("road", cx, -HWY.len/2, HWY.len/2, HWY.lane-0.2, x1-cx, PAVE_T, 0.40, "#9c9c9a");
    roadRun("road", cx, -HWY.len/2, HWY.len/2, -HWY.lane+0.2, HWY.lane-0.2, PAVE_T, 0.40, "#8a8a88");
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
    bx("metal", 0.06,1.4,0.06, x, y+0.55, z+(ry===0?-0.06:0.06), 0.5, 0, "#9aa0a2");   // behind the plate
    bx("metal", 0.28,0.84,0.02, x, y+1.22, z+(ry===0?-0.02:0.02), 0.5, 0, "#7e8486");
    signPanel(0.26,0.80,tex, x, y+1.22, z+(ry===0?0.002:-0.002), ry);
  };
  for(let z=-1450; z<1450; z+=160.9){
    if(Math.abs(z)<6) continue;
    mm(NB_X1+1.6, z, 0);
    mm(SB_X0-1.6, z+40, Math.PI);
  }
})();

/* ---- the crossovers --------------------------------------------------------
   A paved cut through the median every so often (CROSSOVERS), level with
   the road on its berm across the swale, for the troopers and the plows.
   Each way in is signed for them and nobody else, on the median shoulder
   just before it: NO U TURN over AUTHORIZED VEHICLES ONLY, black on white.
   You can walk it or drive it all the same. */
(function crossovers(){
  const W=240, H=420;
  const tex=signTex(W, H, (c)=>{
    c.fillStyle="#f2f0ea"; rrect(c,0,0,W,H,14); c.fill();
    c.strokeStyle="#1a1a1a"; c.lineWidth=6; rrect(c,9,9,W-18,H-18,10); c.stroke();
    // the U-turn arrow: up the right, over the top, down the left to the head; the red ring and bar over it
    const cx=W/2, cy=W*0.52, r=W*0.13;
    c.strokeStyle="#1a1a1a"; c.lineWidth=W*0.07; c.lineCap="butt";
    c.beginPath(); c.moveTo(cx+r, cy+W*0.20); c.lineTo(cx+r, cy-W*0.02); c.arc(cx, cy-W*0.02, r, 0, Math.PI, true); c.lineTo(cx-r, cy+W*0.08); c.stroke();
    c.fillStyle="#1a1a1a"; c.beginPath(); c.moveTo(cx-r-W*0.09, cy+W*0.07); c.lineTo(cx-r+W*0.09, cy+W*0.07); c.lineTo(cx-r, cy+W*0.21); c.closePath(); c.fill();
    c.strokeStyle="#b3151b"; c.lineWidth=W*0.065;
    c.beginPath(); c.arc(cx, cy, W*0.33, 0, Math.PI*2); c.stroke();
    c.beginPath(); c.moveTo(cx-W*0.233, cy-W*0.233); c.lineTo(cx+W*0.233, cy+W*0.233); c.stroke();
    c.fillStyle="#1a1a1a";
    const t0=W*0.97;
    for(const [i,L] of ["AUTHORIZED","VEHICLES","ONLY"].entries()) fitHwy(c, L, W*0.80, H*0.085, W/2, t0+i*(H-t0-24)/3+(H-t0-24)/6);
  });
  const sign=(x, z, ry)=>{
    const y=roadY(z), f=ry===0?1:-1, sw=0.72, sh=1.26, cy=y+1.55+sh/2;
    bx("metal", 0.07, cy+sh/2-y-0.06, 0.07, x, (y+cy+sh/2-0.06)/2, z-f*0.07, 0.5, 0, "#a3a8aa");   // behind the plate
    bx("metal", sw, sh, 0.03, x, cy, z-f*0.018, 0.4, 0, "#8d9294");
    signPanel(sw, sh, tex, x, cy, z+f*0.002, ry);
    addCol(x-0.06, x+0.06, z-f*0.07-0.06, z-f*0.07+0.06, y-1, cy+sh/2);
  };
  for(const c of CROSSOVERS){
    paveRect("asphalt", SB_X1-0.05, NB_X0+0.05, c.z-c.hw, c.z+c.hw, "#9a9a98");
    sign(NB_X0-1.4, c.z+c.hw+4, 0);          // read by northbound traffic, coming from +z
    sign(SB_X1+1.4, c.z-c.hw-4, Math.PI);    // and southbound, from -z
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
    bx("metal", 0.12, top-y0-0.03, 0.12, px, (y0+top-0.03)/2, cz-f*0.115, 0.6, 0, "#a3a8aa");   // behind the plate, not through its face
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
  guideSign(east, -1540, 4.4, 2.2, 0, ["Erie   37","N.Y. Line   54"]);     // past Edinboro's interchange (08b)
  guideSign(west, -380, 4.6, 2.2, Math.PI, ["Meadville   6","Pittsburgh   89"]);
  // speed limits, black on white
  const limit=(x,z,ry)=>guideSign(x, z, 0.92, 1.18, ry, ["SPEED","LIMIT","70"],
                                  {bg:"#ecebe4", fg:"#1a1a1a", clear:1.6, posts:1});
  limit(east, -1500, 0); limit(west, 640, Math.PI);
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
// each widens out of the northbound shoulder along a taper, or narrows back into it, and is never laid over the lanes
(function ramps(){
  RAMP_EXIT.meet =rampPave(RAMP_EXIT,  4.2, NB_X1, 1, "start", 110, "#9a9a98");
  RAMP_ENTRY.meet=rampPave(RAMP_ENTRY, 4.2, NB_X1, 1, "end",   120, "#9a9a98");
})();

/* ---- the lots ----------------------------------------------------------- */
const ADA_SIGNS=[], ADA_TEX={};
(function lots(){
  const Tk=SITE.truck, Cr=SITE.car, Is=SITE.island;
  paveRect("lotpave", Tk.x0, Tk.x1, Tk.z0, Tk.z1, "#a8a8a6");
  paveRect("lotpave", Cr.x0, Cr.x1, Cr.z0, Cr.z1, "#b2b2b0");
  paveRect("lotpave", Is.x0, Is.x1, Is.z1, Tk.z1, "#acacaa");      // south link
  paveRect("lotpave", Is.x0, Is.x1, Tk.z0, Is.z0, "#acacaa");      // north link
  addZone(Tk.x0, Tk.x1, Tk.z0, Tk.z1, -1, 6, "TRUCK PARKING");
  addZone(Cr.x0, Cr.x1, Cr.z0, Cr.z1, -1, 4, "CAR PARKING");

  // ---- car stalls: two rows of ninety-degree stalls on a two-way aisle
  const C=CARLOT;
  for(let z=C.stallZ0; z<=C.stallZ1+0.01; z+=C.stallW){
    stripe(Cr.x0+0.3, z, C.aisle0, z, 0.11, WHITE_LINE);
    stripe(C.aisle1, z, Cr.x1-0.3, z, 0.11, WHITE_LINE);
  }
  /* accessible stalls by the walk (CARLOT.ada), each inside its own pair of
     lines: a blue field with the symbol on it, a hatched access aisle
     between each pair with NO PARKING across it, a sign at the head of
     every stall, and the curb painted blue the length of them */
  const zLine=k=>C.stallZ0+k*C.stallW, xa=C.aisle1, xb=Cr.x1-0.3;
  const isa=signTex(256,256,(c,W,H)=>{ c.clearRect(0,0,W,H); drawISA(c,W/2,H/2+8,150,"#f2f0ea"); });
  const noPark=signTex(512,128,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle="#f2f0ea"; fitText(c,"NO PARKING",W*0.92,H*0.7,W/2,H/2,"700"); });
  const deco=(tex)=>new T.MeshStandardMaterial({map:tex, transparent:true, roughness:0.7, depthWrite:false,
                     polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12});
  const isaMat=deco(isa), npMat=deco(noPark);
  const flat=(mat,w,h,x,z)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h), mat);
    m.rotation.order="YXZ"; m.rotation.set(-Math.PI/2, -Math.PI/2, 0); m.position.set(x, PAVE_T+0.004, z); scene.add(m); };
  const sign=signTex(240,360,(c,W,H)=>{ c.fillStyle="#f4f3ee"; c.fillRect(0,0,W,H); c.strokeStyle="#1f4fa0"; c.lineWidth=8; c.strokeRect(6,6,W-12,H-12);
    c.fillStyle="#1f4fa0"; c.fillRect(W*0.22,H*0.07,W*0.56,W*0.56); drawISA(c,W/2,H*0.07+W*0.29,W*0.44,"#f4f3ee");
    c.fillStyle="#1f4fa0"; fitText(c,"RESERVED",W*0.82,H*0.10,W/2,H*0.56,"700"); fitText(c,"PARKING",W*0.82,H*0.10,W/2,H*0.67,"700");
    c.fillStyle="#b3151b"; fitText(c,"PENALTY $50 – $200",W*0.84,H*0.065,W/2,H*0.80,"600");
    c.fillStyle="#222"; fitText(c,"Violators towed",W*0.7,H*0.05,W/2,H*0.89,"500"); });
  const van=signTex(240,90,(c,W,H)=>{ c.fillStyle="#1f4fa0"; c.fillRect(0,0,W,H); c.fillStyle="#f4f3ee";
    fitText(c,"VAN",W*0.6,H*0.38,W/2,H*0.30,"700"); fitText(c,"ACCESSIBLE",W*0.86,H*0.34,W/2,H*0.72,"700"); });
  for(const key in C.ada){
    const k=+key, kind=C.ada[k], za=zLine(k)+0.07, zb=zLine(k+1)-0.07, zc=(za+zb)/2;
    if(kind==="aisle"){
      // diagonal hatching clipped to the aisle, and the words across it
      // (held 4 cm inside the stall lines and the end bar, so the 45-degree
      // ends of the stripes never lie over another line)
      const za2=za+0.04, h=zb-za-0.08;
      for(let x0=xa-h; x0<xb; x0+=0.62){
        const t0=Math.max(0, xa+0.15-x0), t1=Math.min(h, xb-0.20-x0);
        if(t1-t0>0.15) stripe(x0+t0, za2+t0, x0+t1, za2+t1, 0.10, "#e6e4dc");
      }
      stripe(xb-0.06, za, xb-0.06, zb, 0.10, "#e6e4dc");
      flat(npMat, 2.4, 0.6, -30.6, zc);
      continue;
    }
    push("paint", planeGeo(xb-xa-0.05, zb-za, 0), (xa+xb)/2, PAVE_T+0.0015, zc, 0, "#2c56a8", -Math.PI/2, 0);
    flat(isaMat, 1.5, 1.5, -28.6, zc);
    ADA_SIGNS.push({z:zc, van:kind==="van"});
  }
  ADA_TEX.sign=sign; ADA_TEX.van=van;
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
    // to the lot's west edge, or its north curb, whichever it reaches first
    const L=Math.min((TL.aisle0-Tk.x0-0.6)/sa, (z-Tk.z0-0.6)/ca);
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
  curb(Is.x0, Is.x0+0.18, Is.z0+0.18, Is.z1-0.18); curb(Is.x1-0.18, Is.x1, Is.z0+0.18, Is.z1-0.18);   // between the ends
  curb(Is.x0, Is.x1, Is.z0, Is.z0+0.18); curb(Is.x0, Is.x1, Is.z1-0.18, Is.z1);
  addZone(Is.x0, Is.x1, Is.z0, Is.z1, -1, 4, "THE ISLAND");
  for(let z=Is.z0+8; z<Is.z1-6; z+=14.5){
    if(z>VENDHUT.apron.z0-3 && z<VENDHUT.apron.z1+3) continue;      // where the vending room stands (13b)
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
  slab(P.x1, -5.0, P.z0, -5.65, "#c9c6be");            // to the lobby's side walls, not into them
  slab(P.x1, -5.0, 5.65, P.z1, "#c9c6be");
  // blue curb in front of the accessible stalls (photo 2)
  { const z0=CARLOT.stallZ0+35*CARLOT.stallW, z1=CARLOT.stallZ0+40*CARLOT.stallW;
    bx("paint", 0.04, 0.16, z1-z0, W.x0-0.015, PLAZA_Y-0.08, (z0+z1)/2, 0, 0, "#2b5fb8"); }
  // the sign at the head of each accessible stall, on a post at the walk's edge
  for(const s of ADA_SIGNS){
    const sx=W.x0+0.30;
    bx("paintm", 0.06, 2.20, 0.06, sx, PLAZA_Y+1.10-0.15, s.z, 0, 0, "#8d9194");
    signPanel(0.30, 0.45, ADA_TEX.sign, sx-0.04, PLAZA_Y+1.65, s.z, -Math.PI/2);
    if(s.van) signPanel(0.30, 0.11, ADA_TEX.van, sx-0.04, PLAZA_Y+1.31, s.z, -Math.PI/2);
    addCol(sx-0.05, sx+0.05, s.z-0.05, s.z+0.05, PLAZA_Y-0.3, PLAZA_Y+2.1);
  }
  for(const [ze,dir] of [[W.z0,-1],[W.z1,1]]){
    const z2=ze+dir*1.6, g=new FaceGeo().slab([V3(W.x0,PLAZA_Y,ze),V3(W.x1,PLAZA_Y,ze),V3(W.x1,0.012,z2),V3(W.x0,0.012,z2)],0.3,0.66).geo();
    push("concrete", g, 0,0,0, 0, "#c3c0b8");
    addRamp(W.x0, W.x1, Math.min(ze,z2), Math.max(ze,z2), "z", ze, z2, PLAZA_Y, 0.012); }
  addZone(W.x0, W.x1, W.z0, W.z1, -1, 4, "THE WALK");
  addZone(P.x0, -5, P.z0, P.z1, -1, 5, "THE PLAZA");
  // paths across the lawn, flush with it: north to the picnic grove,
  // south round to the pet area, and the long way round the back
  const path=(pts, w)=>{
    const S=smoothPath(pts, 1.5);
    layRibbon("walkflat", S, -w/2, w/2, 0.035, 0.66, "#c3c0b8");
  };
  // (each ends somewhere: the grove's at the shelter's slab, the pet area's in
  // a round pad by the bag dispenser, the loop back at the plaza)
  path([{x:-14,z:-19},{x:-13,z:-26},{x:-9,z:-36},{x:-1,z:-46},{x:7,z:-54},{x:12.9,z:-57.4}], 2.2);
  path([{x:-14,z:19},{x:-12,z:28},{x:-6,z:40},{x:2,z:52},{x:7.5,z:62},{x:11.6,z:66.2}], 2.0);
  push("walkflat", discGeo(1.45, 32, 0.66), 12.6, 0.039, 66.6, 0, "#c3c0b8");
  path([{x:-5,z:-19},{x:4,z:-21},{x:12,z:-20},{x:16,z:-10},{x:17,z:0},{x:16,z:10},{x:12,z:20},{x:4,z:21},{x:-5,z:19}], 1.8);
})();

/* ---- lights: the mushroom posts round the walks, taller poles in the lots --
   A grey pole, a flat round hat, a lit drum under it. The lens glows from
   the clock; the light itself is a pool lamp when it is near enough to
   matter, and a faint disc on the ground when it is not. */
bucketOf("lamplens", ()=>emitMat(0xffd7a0, 0.9, "warm", "site"));
bucketOf("lightpool",()=>{ const m=new T.MeshBasicMaterial({color:0xffd9a8, map:TEX.soot, transparent:true,
                          opacity:0, depthWrite:false, blending:T.AdditiveBlending,
                          polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12});
                          GLOW.push({m:m, basic:true, max:0.30, circ:"site"}); return m; });
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
              dist: big?26:18, decay:1.5, mothy:true, circ:"site"});
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
  FOREST.plant("spruce", -7.0, 27.5, {scale:0.9});              // beside the path to the pet area, not on it
  FOREST.plant("spruce", 21, 34, {scale:1.0});
  FOREST.plant("sapling", -16, 58, {scale:0.8, color:"#7e9e4a", autumn:"#c8342a"});
  FOREST.plant("sapling", -2, 30, {scale:0.7, color:"#86a24e", autumn:"#d9a62c"});
  // by the building: a maple each side of the plaza, the one with the flag
  FOREST.plant("lawn", -18, -29, {scale:0.85});
  FOREST.plant("lawn", 24, -6, {scale:1.1});
  FOREST.plant("spruce", 24, 16, {scale:0.8});
})();

/* ---- the beds in front of the pavilion --------------------------------
   River rock, a few boulders the size of a sheep, clipped shrubs in round
   lumps, the way every rest area in the state is landscaped (photos 1, 2). */
(function beds(){
  const bed=(x0,x1,z0,z1,y)=>{
    push("bed", planeGeo(x1-x0, z1-z0, 0.95), (x0+x1)/2, y+0.012, (z0+z1)/2, 0, "#a89f92", -Math.PI/2, 0);
    KEEP_OFF.push({x0:x0, x1:x1, z0:z0, z1:z1});
    // a steel edging strip round it
    // the long runs past the corners, the short ones between them
    for(const [a,b,c2,d] of [[x0-0.022,x1+0.022,z0,z0],[x0-0.022,x1+0.022,z1,z1],[x0,x0,z0+0.015,z1-0.015],[x1,x1,z0+0.015,z1-0.015]])
      bx("paintm", Math.max(0.03,b-a), a===b?0.054:0.06, Math.max(0.03,d-c2), (a+b)/2, y+(a===b?0.027:0.03), (c2+d)/2, 0, 0, "#3a3a36");
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
