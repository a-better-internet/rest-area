"use strict";
/* REST AREA · 14v-lakewoods.js
   the woods behind Lake Street's back yards: the trees, a trail through
   them, and what has washed up in them from the lake over the years; and
   the soft pretzel cart down by the water in Lakeside Park
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14v · THE WOODS BEHIND LAKE STREET
   South of the street the back yards run out into the woods (EAST.woods,
   04; 14n walls them at their far side, seventy metres in). Maple, oak,
   beech, hemlock and pine, real trees several rows deep with solid trunks
   (07 keeps the canopy's shell low under them), ferns and shrubs between.
   A trail starts behind the yard between Nos. s4 and s5 (a sign on a post)
   and goes round in a loop, a worn strip of dirt and leaves. Along it,
   the things boats leave behind when nobody wants them any more: a
   rowboat turned over and gone green, a canoe up on sawhorses, a jon boat
   half sunk in the leaves with its anchor and chain, an old trailer the
   ferns have got into, a rusted outboard on a stump, oars against a tree,
   a string of floats hung from a branch, a life ring nailed up.
   ---------------------------------------------------------------------- */
const LAKEWOODS={};
(function lakeWoods(){
  if(typeof EAST==="undefined" || !EAST.woods) return;
  const WD=EAST.woods, gy=(x,z)=>Terrain.groundAt(x,z), r=_trng(6464);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx||0,ry||0,rz||0);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, g=gy(x,z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
  // (a point in a local frame turned ry: lx across, lz along)
  const at=(x, z, ry, lx, lz)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry), z-lx*Math.sin(ry)+lz*Math.cos(ry)];

  /* ---- the trail: out from the back of the yard between Nos. s4 and s5, round in a loop and back ---- */
  const TR=smoothPath([[1246,-1137],[1244,-1128],[1236,-1118],[1222,-1110],[1204,-1104],[1186,-1100],[1170,-1092],[1160,-1082],[1168,-1074],[1188,-1072],
                       [1212,-1078],[1236,-1084],[1258,-1090],[1282,-1088],[1306,-1080],[1330,-1076],[1352,-1084],[1360,-1098],[1350,-1110],[1330,-1118],
                       [1306,-1122],[1282,-1124],[1262,-1126],[1250,-1131],[1246,-1137]].map(p=>({x:p[0], z:p[1]})), 1.5, true);
  for(const p of TR) p.y=gy(p.x, p.z);
  layRibbon("mulchbed", TR, -0.62, 0.62, 0.045, 0.6, "#c4b4a2");      // (shredded bark, 08's bed under the shrubs)
  const trailD=(x, z)=>{ let d=1e9; for(let i=1;i<TR.length;i++){ const a=TR[i-1], b=TR[i], ex=b.x-a.x, ez=b.z-a.z, L2=ex*ex+ez*ez;
    const t=L2>0 ? clamp(((x-a.x)*ex+(z-a.z)*ez)/L2, 0, 1) : 0; d=Math.min(d, Math.hypot(x-a.x-ex*t, z-a.z-ez*t)); } return d; };
  LAKEWOODS.trail=TR;
  // the sign where it starts, at the back of the yard
  { const sx=1249.2, sz=-1138.5, g=gy(sx, sz); B(0.10, 1.4, 0.10, sx, g+0.7, sz, "#5a4430"); addCol(sx-0.06, sx+0.06, sz-0.06, sz+0.06, g-0.5, g+1.4);
    B(0.66, 0.30, 0.04, sx, g+1.22, sz-0.07, "#6a5238");
    signPanel(0.60, 0.26, signTex(300, 130, (c,W,H)=>{ c.fillStyle="#7a5e40"; c.fillRect(0,0,W,H); c.fillStyle="rgba(40,24,10,0.25)"; for(let k=0;k<6;k++) c.fillRect(0, k*22+4, W, 2);
        say(c, "THE BACK WOODS", W/2, H*0.38, W*0.78, H*0.28, "#f2e8d0", "800", "Georgia, serif"); say(c, "KEEP TO THE PATH", W/2, H*0.72, W*0.70, H*0.16, "#f2e8d0", "700", "Arial"); }),
      sx, g+1.22, sz-0.102, Math.PI); }

  /* ---- what is out there, at the stops along the trail ---- */
  const SPOTS=[];
  // a rowboat turned over beside the trail, its green paint gone chalky, moss on the keel
  { const x=1194.5, z=-1096.6, ry=0.35, g=gy(x, z); SPOTS.push([x, z, 3.2]);
    ent(new T.SphereGeometry(1, 22, 10, 0, Math.PI*2, 0, Math.PI/2).scale(0.64, 0.42, 1.78), x, g-0.03, z, "#4e6a5a", 0, ry, 0.05);
    ent(new T.TorusGeometry(1, 0.035, 6, 30).scale(0.64, 1.78, 1), x, g+0.0, z, "#e8e2d0", Math.PI/2, ry, 0);
    { const [kx, kz]=at(x, z, ry, 0, 0); B(0.07, 0.05, 3.1, kx, g+0.39, kz, "#3a3020", ry, 0, 0.05); }
    for(let k=0;k<6;k++){ const [mx, mz]=at(x, z, ry, (r()-0.5)*0.4, -1.2+k*0.5); ent(new T.SphereGeometry(0.14+r()*0.08, 8, 6).scale(1, 0.25, 1.4), mx, g+0.37-Math.abs(k-2.5)*0.025, mz, "#4a6a2a"); }
    { const [ox, oz]=at(x, z, ry, 0.9, 0.4); B(0.08, 0.03, 2.2, ox, g+0.02, oz, "#8a6a48", ry+0.25); }
    addColOB(x, z, ry, 0.66, 1.8, g-0.5, g+0.45); }
  // a canoe up on two sawhorses, turned over to keep the rain out of it; a paddle under it
  { const x=1153.5, z=-1078.0, ry=-0.3, g=gy(x, z); SPOTS.push([x, z, 3.0]);
    for(const lz of [-0.9, 0.9]){ const [sx, sz]=at(x, z, ry, 0, lz);
      for(const lx of [-0.35, 0.35]) for(const dz of [-0.12, 0.12]){ const [ax, az]=at(sx, sz, ry, lx*0.8, dz), [bx2, bz2]=at(sx, sz, ry, lx*1.15, dz); tubeE(V3(ax, g+0.72, az), V3(bx2, g, bz2), 0.025, "#8a6a48"); }
      B(0.9, 0.08, 0.10, sx, g+0.74, sz, "#8a6a48", ry); }
    ent(new T.SphereGeometry(1, 22, 10, 0, Math.PI*2, 0, Math.PI/2).scale(0.42, 0.34, 2.45), x, g+0.785, z, "#a8321c", 0, ry, 0);
    { const [px, pz]=at(x, z, ry, 0.25, -0.2); B(0.16, 0.02, 1.4, px, g+0.02, pz, "#c8a878", ry+0.1); }
    addColOB(x, z, ry, 0.5, 1.3, g-0.5, g+1.15); }
  // an old trailer the ferns have got into: the frame, the tongue, two flat tyres, rust
  { const x=1176.0, z=-1068.6, ry=1.25, g=gy(x, z); SPOTS.push([x, z, 3.0]);
    for(const lx of [-0.55, 0.55]){ const [a0x, a0z]=at(x, z, ry, lx, -1.8), [a1x, a1z]=at(x, z, ry, lx, 1.6); tubeE(V3(a0x, g+0.42, a0z), V3(a1x, g+0.38, a1z), 0.045, "#6a4a3a"); }
    for(const lz of [-1.6, -0.4, 0.8]){ const [c0x, c0z]=at(x, z, ry, -0.55, lz), [c1x, c1z]=at(x, z, ry, 0.55, lz); tubeE(V3(c0x, g+0.40, c0z), V3(c1x, g+0.40, c1z), 0.035, "#6a4a3a"); }
    { const [t0x, t0z]=at(x, z, ry, -0.55, 1.6), [t1x, t1z]=at(x, z, ry, 0, 2.8), [t2x, t2z]=at(x, z, ry, 0.55, 1.6); tubeE(V3(t0x, g+0.38, t0z), V3(t1x, g+0.12, t1z), 0.04, "#6a4a3a"); tubeE(V3(t2x, g+0.38, t2z), V3(t1x, g+0.12, t1z), 0.04, "#6a4a3a");
      C(0.06, 0.08, t1x, g+0.10, t1z, "#3a3a3a", 10); }
    for(const lx of [-0.72, 0.72]){ const [wx, wz]=at(x, z, ry, lx, 0.0); C(0.27, 0.16, wx, g+0.22, wz, "#1d1d1e", 16, 0, ry, Math.PI/2); C(0.13, 0.17, wx, g+0.24, wz, "#8a6a4a", 12, 0, ry, Math.PI/2); }
    for(let k=0;k<5;k++){ const [fx, fz]=at(x, z, ry, (r()-0.5)*1.6, -1.4+k*0.7); FOREST.plant("fern", fx, fz, {scale:0.8+r()*0.4, solid:false}); }
    addColOB(x, z, ry, 0.8, 2.3, g-0.5, g+0.55); }
  // a jon boat half sunk in the leaves, a hole in her side; the anchor by her, its chain run out
  { const x=1291.0, z=-1080.4, ry=2.6, g=gy(x, z); SPOTS.push([x, z, 3.4]);
    const col="#8a9096", f=(lx, ly, lz)=>{ const [px, pz]=at(x, z, ry, lx, lz); return [px, g+ly, pz]; };
    { const [bx2, by, bz2]=f(0, -0.06, 0); B(1.24, 0.04, 3.5, bx2, by, bz2, col, ry, 0.10, 0.06); }
    for(const sd of [-1,1]){ const [sx, sy, sz]=f(sd*0.63, 0.10, 0); B(0.03, 0.36, 3.5, sx, sy, sz, col, ry, 0.10, sd*0.18+0.06); B(0.05, 0.04, 3.52, sx+0, sy+0.19, sz, "#6a7076", ry, 0.10, 0.06); }
    { const [tx, ty, tz]=f(0, 0.06, -1.72); B(1.24, 0.36, 0.03, tx, ty, tz, col, ry, 0.10, 0.06); const [qx, qy, qz]=f(0, 0.30, 1.85); B(1.1, 0.03, 0.5, qx, qy, qz, col, ry, -0.45, 0.06); }
    { const [hx, hy, hz]=f(0.66, 0.08, 0.6); B(0.035, 0.12, 0.22, hx, hy, hz, "#1a1a1a", ry, 0.10, 0.24); }
    { const [lx2, ly2, lz2]=f(0, -0.03, 0.2); ent(new T.CylinderGeometry(0.5, 0.5, 0.01, 16).scale(1, 1, 2.6), lx2, ly2, lz2, "#6a4a2a", 0.10, ry, 0.06); }
    // the anchor, a fluke in the ground, and its chain back to the bow
    { const [ax, , az]=f(1.6, 0, 2.6), ag=gy(ax, az); tubeE(V3(ax, ag-0.05, az), V3(ax+0.25, ag+0.55, az+0.1), 0.025, "#4a3a32"); ent(new T.TorusGeometry(0.06, 0.012, 6, 14), ax+0.27, ag+0.62, az+0.1, "#4a3a32", 0, 0, 0.4);
      B(0.40, 0.04, 0.10, ax-0.02, ag+0.02, az, "#4a3a32", 0, 0, 0.5); B(0.10, 0.04, 0.30, ax-0.12, ag+0.04, az, "#4a3a32", 0.3, 0, 0);
      const [bwx, , bwz]=f(0.3, 0, 1.8); for(let k=0;k<12;k++){ const t=k/11, cx=lerp(ax+0.25, bwx, t), cz=lerp(az+0.1, bwz, t), cy=lerp(ag+0.55, g+0.25, t)-Math.sin(t*Math.PI)*0.45;
        ent(new T.TorusGeometry(0.035, 0.009, 5, 10), cx, Math.max(gy(cx, cz)+0.02, cy), cz, "#4a3a32", k%2 ? Math.PI/2 : 0, ry, 0); } }
    addColOB(x, z, ry, 0.7, 1.9, g-0.5, g+0.4); }
  // round a big old oak: a rusted outboard on a stump, two oars against the trunk, floats hung from a branch, a life ring
  { const ox=1351.5, oz=-1100.5, g=gy(ox, oz); SPOTS.push([ox, oz, 3.6]); tree("hard", ox, oz, 1.35);
    const sx=ox+1.4, sz=oz+0.9, sg=gy(sx, sz); C(0.34, 0.48, sx, sg+0.22, sz, "#6a5238", 14); C(0.30, 0.012, sx, sg+0.465, sz, "#c8a878", 14); addCol(sx-0.34, sx+0.34, sz-0.34, sz+0.34, sg-0.5, sg+0.5);
    { const OM=[[0.40, 0.50, 0.42, 0, 0.30, 0, "#5a3a2a"],[0.14, 0.70, 0.18, 0, -0.30, 0.02, "#4a3226"],[0.30, 0.10, 0.12, 0, -0.68, 0.02, "#4a3226"]];
      for(const [w,h,d,lx,ly,lz,c] of OM) B(w, h, d, sx+lx*0.9+0.08, sg+0.48+0.40+ly*0.9, sz+lz, c, 0.3, 0, -0.35); }
    for(const k of [0,1]){ const a=0.6+k*0.25, bx2=ox+Math.cos(a)*0.45, bz2=oz-0.2+Math.sin(a)*0.45; tubeE(V3(bx2+0.5, gy(bx2+0.5, bz2)+0.02, bz2+0.15*k), V3(bx2, g+1.9, bz2), 0.022, "#c8a878");
      B(0.16, 0.5, 0.02, bx2+0.42, gy(bx2+0.42, bz2)+0.26, bz2+0.15*k, "#c8a878", 0, 0, 0.26); }
    { const by=g+3.2; tubeE(V3(ox-0.25, by, oz), V3(ox-1.6, by+0.4, oz-0.3), 0.06, "#4a3a2a");
      tubeE(V3(ox-1.3, by+0.34, oz-0.24), V3(ox-1.3, by-1.1, oz-0.24), 0.008, "#d8d0b8");
      for(let k=0;k<4;k++) ent(new T.SphereGeometry(0.11, 12, 8).scale(1, 1.25, 1), ox-1.3, by-0.25-k*0.27, oz-0.24, ["#e8641a","#f2efe2","#e8641a","#2a5aa8"][k]); }
    ent(new T.TorusGeometry(0.30, 0.07, 8, 20), ox+0.02, g+1.55, oz-0.42, "#e6531c", 0, 0.1, 0); for(let k=0;k<4;k++) B(0.10, 0.15, 0.10, ox+0.02+Math.cos(k*Math.PI/2)*0.30, g+1.55+Math.sin(k*Math.PI/2)*0.30, oz-0.42, "#f2efe2", 0.1); }
  LAKEWOODS.spots=SPOTS;

  /* ---- the trees: a jittered lattice four and a half metres apart, clear of the trail, the stops and the yards, several
     rows deep to the wall; edge trees where the yards end; ferns and shrubs between ---- */
  { const SP=4.6, nearSpot=(x, z)=>SPOTS.some(([sx, sz, rr])=>Math.hypot(x-sx, z-sz)<rr+1.2);
    for(let x=WD.x0+2.0; x<WD.x1-2.0; x+=SP) for(let z=WD.z0-4; z<WD.z1-2.0; z+=SP){
      const jx=x+(hash2(x*0.7, z)-0.5)*3.2, jz=z+(hash2(z, x*0.9)-0.5)*3.2;
      if(jz>WD.z1-2.2 || jx<WD.x0+1.6 || jx>WD.x1-1.6) continue;
      const cd=Terrain.clearDist(jx, jz); if(cd<1.2) continue;
      if(trailD(jx, jz)<1.9 || nearSpot(jx, jz)) continue;
      const q=hash2(jx*1.3, jz*0.7), edge=cd<7;
      tree(edge ? (q<0.3 ? "hemlock" : "edge") : (q<0.22 ? "hemlock" : q<0.32 ? "pine" : q<0.45 ? "beech" : "hard"), jx, jz, 0.85+hash2(jx*3, jz)*0.4);
      if(q>0.55){ const fx=jx+(hash2(jz, jx)-0.5)*2.4, fz=jz+(hash2(jx, jz*2)-0.5)*2.4; if(trailD(fx, fz)>1.1) FOREST.plant(q>0.8 ? "shrub" : "fern", fx, fz, {scale:0.8+q*0.5, solid:false}); } } }

  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.8, metalness:0.1}), "14v-lakewoods");
  addZone(WD.x0, WD.x1, WD.z0, WD.z1, -20, 40, "THE WOODS BEHIND LAKE STREET");
})();

/* ----------------------------------------------------------------------
   and by the water in Lakeside Park: THE PRETZEL CART. On the grass on the
   street side of the shore path, a few steps east of where the path from
   the lot comes down: a stainless cart under a striped umbrella, the case
   on top lit and warm with soft pretzels hung on its pegs, the price board
   on its front, the mustard and the napkins on its ledge, a cooler of drinks
   by it. Rich runs it by day in his red shirt and white cap; E at the cart
   buys one. After dark the cart is shut and he has gone home.
   ---------------------------------------------------------------------- */
const PRETZEL={};
(function pretzelCart(){
  if(typeof EAST==="undefined") return;
  const SH=EAST.shore, SPZ=SH+5.5, x=1309.0, z=SPZ+2.7, g=Terrain.groundAt(x, z);
  const ME=[];
  const ent=(geo,px,py,pz,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(px,py,pz),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,px,py,pz,c,ry)=>ent(boxGeo(w,h,d),px,py,pz,c,0,ry||0,0);
  const C=(rad,h,px,py,pz,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),px,py,pz,c,rx,ry,rz);
  const say=(c2,s,cx,cy,w,h,col,weight,family)=>{ c2.fillStyle=col; fitText(c2,s,w,h,cx,cy,weight||"700",family); };
  const ST="#c8ccd0";
  // the cart: the steel body, its two wheels and the push bar, the ledge along the front
  B(1.40, 0.62, 0.72, x, g+0.55, z, ST); B(1.44, 0.03, 0.76, x, g+0.875, z, "#b8bcc0");
  for(const sd of [-1,1]){ C(0.24, 0.06, x+sd*0.55, g+0.24, z+0.40, "#1d1d1e", 18, 0, 0, Math.PI/2); C(0.10, 0.07, x+sd*0.55, g+0.24, z+0.40, "#8a8e90", 12, 0, 0, Math.PI/2); }
  for(const sd of [-1,1]) B(0.04, 0.24, 0.04, x+sd*0.62, g+0.12, z-0.32, "#5a5e62");
  B(0.04, 0.04, 0.80, x+0.78, g+0.92, z, "#5a5e62"); for(const sd of [-1,1]) B(0.12, 0.04, 0.04, x+0.72, g+0.92, z+sd*0.38, "#5a5e62");
  B(1.30, 0.03, 0.22, x, g+0.86, z-0.47, ST);
  // the case on top: a steel frame round glass, the pretzels on their pegs inside, a warm light in it
  const cy=g+0.89+0.28;
  for(const [dx, dz] of [[-0.46,-0.24],[0.46,-0.24],[-0.46,0.24],[0.46,0.24]]) B(0.03, 0.56, 0.03, x+dx, cy, z+dz, ST);
  B(0.96, 0.03, 0.52, x, cy+0.28, z, ST);
  push("glass", boxGeo(0.92, 0.52, 0.48, 0), x, cy, z, 0, "#ffffff");
  for(const zz of [-0.08, 0.10]) B(0.86, 0.012, 0.012, x, cy+0.18, z+zz, "#8a8e90");
  for(let k=0;k<8;k++){ const px=x-0.33+(k%4)*0.22, pz=z+(k<4 ? -0.08 : 0.10);
    ent(new T.TorusKnotGeometry(0.055, 0.017, 40, 6, 2, 3), px, cy+0.08, pz, "#b8742a", 0, k*0.3, 0); }
  for(let k=0;k<5;k++) ent(new T.TorusKnotGeometry(0.055, 0.017, 40, 6, 2, 3), x-0.2+k*0.1, cy-0.20, z+(k%2)*0.06, "#a8641e", Math.PI/2, 0, k*0.6);
  B(0.86, 0.008, 0.40, x, cy-0.255, z, "#f2efe2");
  push("cafe_bulb", new T.SphereGeometry(0.03, 8, 6), x, cy+0.24, z, 0, "#ffffff");
  // the board on its front: what there is and what it costs
  B(1.16, 0.46, 0.02, x, g+0.56, z-0.372, "#1f3a5a");
  signPanel(1.12, 0.42, signTex(560, 210, (c2,W,H)=>{ c2.fillStyle="#1f3a5a"; c2.fillRect(0,0,W,H); c2.strokeStyle="#f2c418"; c2.lineWidth=6; c2.strokeRect(9,9,W-18,H-18);
      say(c2, "SOFT PRETZELS", W/2, H*0.27, W*0.76, H*0.24, "#f2c418", "900", "Georgia, serif");
      const L=["SALTED · 3.00","CINNAMON SUGAR · 3.50","CHEESE CUP · 1.00   LEMONADE · 2.00"];
      L.forEach((s,k)=>say(c2, s, W/2, H*(0.53+k*0.15), W*0.76, H*0.10, "#f4f2ec", "800", "Arial")); }), x, g+0.56, z-0.388, Math.PI);
  // the mustard and the napkins on the ledge; the cooler beside the cart
  C(0.045, 0.16, x-0.45, g+0.955, z-0.47, "#e8c418", 12); C(0.012, 0.08, x-0.45, g+1.075, z-0.47, "#2a2a2c", 6); B(0.06, 0.012, 0.012, x-0.42, g+1.11, z-0.47, "#2a2a2c");
  B(0.12, 0.14, 0.08, x+0.40, g+0.945, z-0.47, "#2a2a2c"); B(0.10, 0.10, 0.004, x+0.40, g+0.95, z-0.512, "#f6f3ec");
  { const kx=x-1.05, kz=z+0.1; B(0.62, 0.40, 0.40, kx, g+0.20, kz, "#2a5aa8"); B(0.64, 0.06, 0.42, kx, g+0.43, kz, "#f2efe2"); addCol(kx-0.32, kx+0.32, kz-0.21, kz+0.21, g-0.5, g+0.46); }
  // the umbrella over it: a pole from the cart's corner, eight panels red and white
  { const ux=x+0.55, uz=z+0.22; C(0.02, 2.3, ux, g+1.15, uz, "#d8dade", 8);
    for(let k=0;k<8;k++){ const a0=k*Math.PI/4, g2=new T.CylinderGeometry(0.0, 1.15, 0.36, 2, 1, true, a0, Math.PI/4);
      ent(g2, ux, g+2.12, uz, k%2 ? "#f4f2ec" : "#c8241a"); } C(0.03, 0.06, ux, g+2.33, uz, "#d8dade", 8); }
  addCol(x-0.74, x+0.82, z-0.40, z+0.40, g-0.5, g+1.45);
  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.4, metalness:0.35, side:T.DoubleSide}), "14v-lakewoods");
  // the cover that goes over the case at night
  const cover=new T.Mesh(boxGeo(1.0, 0.58, 0.56, 0), new T.MeshStandardMaterial({color:0x2a4a6a, roughness:0.9})); cover.position.set(x, cy+0.005, z); cover.visible=false; scene.add(cover);
  Object.assign(PRETZEL, {x:x, z:z, g:g, cover:cover, steam:{x:x, y:cy+0.30, z:z}, n:0});
  // E at the cart (from the path side): a pretzel, by day
  const LINES=[["ONE SALTED, WARM. HE PUTS SOME MUSTARD ON THE PAPER. $3.","“BEST ONES ARE STRAIGHT OUT OF THE CASE.”"],
               ["CINNAMON SUGAR, STILL HOT. $3.50.","“CAREFUL, THAT ONE'S HOT.”"],
               ["SALTED, AND A CHEESE CUP FOR DIPPING. $4.","“ENJOY THE LAKE.”"],
               ["ANOTHER ONE? HE'S ALREADY REACHING FOR IT. $3.","“THEY DON'T LAST, HUH?”"]];
  addUse(x, z-0.9, g, "BUY A SOFT PRETZEL", ()=>{
    if(DayNight.state.dark>0.35){ toast("THE CART IS COVERED UP FOR THE NIGHT · BACK TOMORROW", "#cfe0d4"); return; }
    const L=LINES[Math.min(PRETZEL.n, LINES.length-1)]; PRETZEL.n++;
    toast(L[0]+"   "+L[1], "#f2c418"); if(typeof AUDIO!=="undefined") AUDIO.blip && AUDIO.blip("clunk", x, z); }, 1.4).pri=true;
  // Rich, behind the cart
  if(typeof crowdGroup==="function"){ const G=crowdGroup("the pretzel cart", x, z, 140);
    crowdAdd(G, {look:{h:1.0, skin:SKINS[2], hair:HAIRS[0], shirt:"#c8241a", pants:"#2c3446", shoes:"#1d1d1f", cap:"#f4f2ec", beard:"#2a1a10", belly:true},
      x:x, z:z+0.82, y:g, yaw:Math.PI, mode:"stand", dayOnly:true, sway:0.45}); }
})();
// each frame (14n's updateLakeside, by way of 19): the cover at night, a wisp off the warm case by day
function updatePretzel(dt, dark){
  const P=PRETZEL; if(!P.cover) return;
  const c=camera.position; if(Math.hypot(c.x-P.x, c.z-P.z)>140) return;
  P.cover.visible=dark>0.35;
  if(!P.cover.visible && typeof PUFFS!=="undefined" && Math.random()<dt*1.2){ const S=P.steam;
    PUFFS.emit(S.x+(Math.random()-0.5)*0.3, S.y, S.z+(Math.random()-0.5)*0.2, 0.06, 0.4, 0.02, 0.12, 0.9, 2.0, 0.12, 0.97, 0); }
}
