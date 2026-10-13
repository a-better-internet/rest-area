"use strict";
/* REST AREA · 09-building.js
   the pavilion: brick, a tall gable with its glass, two low wings; the
   lobby, the men's room, the women's room, the family room, the staff room
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   9 · THE BUILDING
   A state rest-area pavilion of a certain age, built in red brick with deep
   dark-brown eaves: a tall lobby under a steep gable whose end is cream
   siding round a great trapezoid of tinted glass, and a low wing either
   side of it holding the restrooms (photographs 1, 2, 7, 12).

   THE PLAN, in world metres; the building is square to the axes, centred
   on the origin, front (west) to the lot.
     lobby        x -6..6,   z -5.5..5.5     floor FL, walls to 4.4, gable to 8.7
     men's wing   x -5..7,   z -14.5..-5.5   ceiling FL+2.9, eaves 3.1
     women's wing x -5..7,   z 5.5..14.5     the same, mirrored
     in each wing: the restroom x -4.7..3.2; a small room off the lobby
     x 3.5..6.7 next to the lobby (family room north, staff office south),
     and a service room behind it with its own door out the back.
   Walls are named and built as rings of pieces; every doorway is a hole in
   every course: structure, tile, plaster, brick lining, trim.
   ---------------------------------------------------------------------- */
const FL=PLAZA_Y;                     // finished floor, flush with the plaza
const CEIL=FL+2.90;                   // the restrooms' ceiling
const BLD={ lx0:-6, lx1:6, lz:5.5, wx0:-5, wx1:7, wz:14.5,
            eaveL:4.70, ridge:8.90, eaveW:3.40, ridgeW:3.95 };
// the clerestory over the wings' roofs: glass between CL0 and CL1
const CL0=BLD.ridgeW+0.05, CL1=BLD.ridgeW+0.45;
const PITCH=Math.atan((BLD.ridge-BLD.eaveL)/BLD.lz);
const roofLY=z=>BLD.ridge-Math.abs(z)*Math.tan(PITCH);       // top of the lobby roof
const WT=0.30;                        // exterior and party walls
const Y0=FL-0.40;                     // every wall starts in the slab

bucketOf("brick",    ()=>new T.MeshStandardMaterial({map:TEX.brick,   roughness:0.92}));
bucketOf("siding",   ()=>new T.MeshStandardMaterial({map:TEX.siding,  roughness:0.70}));
bucketOf("shingle",  ()=>new T.MeshStandardMaterial({map:TEX.shingle, roughness:0.90}));
bucketOf("block",    ()=>new T.MeshStandardMaterial({map:TEX.block,   roughness:0.80}));
bucketOf("ytile",    ()=>new T.MeshStandardMaterial({map:TEX.ytile,   roughness:0.30, metalness:0.02}));
bucketOf("mosaic",   ()=>new T.MeshStandardMaterial({map:TEX.mosaic,  roughness:0.55}));
bucketOf("quarry",   ()=>new T.MeshStandardMaterial({map:TEX.quarry,  roughness:0.50}));
bucketOf("plaster",  ()=>new T.MeshStandardMaterial({map:TEX.drywall, roughness:0.88}));
bucketOf("porcelain",()=>envIn(new T.MeshStandardMaterial({color:0xffffff,  roughness:0.16, metalness:0.02}), 0.8));
bucketOf("steel",    ()=>envIn(new T.MeshStandardMaterial({map:TEX.brushed, roughness:0.30, metalness:0.75}), 1.0));
bucketOf("chrome",   ()=>envIn(new T.MeshStandardMaterial({color:0xffffff,  roughness:0.12, metalness:0.92}), 1.0));
bucketOf("beam",     ()=>new T.MeshStandardMaterial({map:TEX.wood,    roughness:0.80}));
bucketOf("cork",     ()=>new T.MeshStandardMaterial({map:TEX.cork,    roughness:0.95}));
bucketOf("mat",      ()=>new T.MeshStandardMaterial(Object.assign({map:TEX.rubber, roughness:1.0},
                          {polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4})));
const BRICK="#d4cfc8", BRICK_IN="#bdb4aa", FASCIA="#3b2e26", BRONZE="#3e332b", CREAM="#e6e0cf",
      TILE="#ffffff", BLOCKC="#c9cac6", PART="#c7b998", PORC="#ebe9e3";

/* ---- wall builders ------------------------------------------------------
   runX / runZ: a structural wall along x (at z = c) or along z (at x = c),
   in solid pieces round its openings {a, b, sill, head}. lineX / lineZ: a
   finish on one face of it, a few millimetres proud, cut round the same
   openings, with its UVs anchored to the world so the courses run on
   across a doorway instead of restarting at each piece.                */
function _spans(a,b,open){
  const ops=(open||[]).filter(o=>o.b>a && o.a<b).sort((p,q)=>p.a-q.a), out=[];
  let x=a;
  for(const o of ops){
    if(o.a>x) out.push({a:x, b:o.a, o:null});
    out.push({a:Math.max(o.a,a), b:Math.min(o.b,b), o:o});
    x=o.b;
  }
  if(b>x) out.push({a:x, b:b, o:null});
  return out;
}
function runX(bk, c, t, a, b, y0, y1, open, color, uv){
  for(const s of _spans(a,b,open)){
    if(!s.o){ wallBox(bk, s.a, s.b, c-t/2, c+t/2, y0, y1, color, uv, y0); continue; }
    if(s.o.sill>y0+0.01) wallBox(bk, s.a, s.b, c-t/2, c+t/2, y0, s.o.sill, color, uv, y0);
    if(s.o.head<y1-0.01) wallBox(bk, s.a, s.b, c-t/2, c+t/2, s.o.head, y1, color, uv, y0);
  }
}
function runZ(bk, c, t, a, b, y0, y1, open, color, uv){
  for(const s of _spans(a,b,open)){
    if(!s.o){ wallBox(bk, c-t/2, c+t/2, s.a, s.b, y0, y1, color, uv, y0); continue; }
    if(s.o.sill>y0+0.01) wallBox(bk, c-t/2, c+t/2, s.a, s.b, y0, s.o.sill, color, uv, y0);
    if(s.o.head<y1-0.01) wallBox(bk, c-t/2, c+t/2, s.a, s.b, s.o.head, y1, color, uv, y0);
  }
}
function _liner(bk, axis, f, dir, a, b, y0, y1, open, color, uv, inset){
  const s=uv||0.5, off=inset===undefined?0.006:inset;
  const piece=(pa,pb,qa,qb)=>{
    if(pb-pa<0.005||qb-qa<0.005) return;
    const g=new T.PlaneGeometry(pb-pa, qb-qa), U=g.attributes.uv;
    const flip = axis==="x" ? dir<0 : dir>0;
    for(let i=0;i<U.count;i++)
      U.setXY(i, ((flip?-pb:pa)+U.getX(i)*(pb-pa))*s, (qa+U.getY(i)*(qb-qa))*s);
    U.needsUpdate=true;
    if(axis==="x") push(bk, g, (pa+pb)/2, (qa+qb)/2, f+dir*off, dir>0?0:Math.PI, color);
    else           push(bk, g, f+dir*off, (qa+qb)/2, (pa+pb)/2, dir>0?Math.PI/2:-Math.PI/2, color);
  };
  for(const sp of _spans(a,b,open)){
    if(!sp.o){ piece(sp.a, sp.b, y0, y1); continue; }
    if(sp.o.sill>y0) piece(sp.a, sp.b, y0, Math.min(y1, sp.o.sill));
    if(sp.o.head<y1) piece(sp.a, sp.b, Math.max(y0, sp.o.head), y1);
  }
}
const lineX=(bk,f,dir,a,b,y0,y1,open,color,uv,inset)=>_liner(bk,"x",f,dir,a,b,y0,y1,open,color,uv,inset);
const lineZ=(bk,f,dir,a,b,y0,y1,open,color,uv,inset)=>_liner(bk,"z",f,dir,a,b,y0,y1,open,color,uv,inset);
function floorAt(bk, x0,x1,z0,z1, y, color, uv){
  const s=uv||0.5, g=new T.PlaneGeometry(x1-x0, z1-z0), U=g.attributes.uv;
  for(let i=0;i<U.count;i++) U.setXY(i, (x0+U.getX(i)*(x1-x0))*s, (-z1+U.getY(i)*(z1-z0))*s);
  U.needsUpdate=true;
  push(bk, g, (x0+x1)/2, y, (z0+z1)/2, 0, color, -Math.PI/2, 0);
}
function ceilAt(bk, x0,x1,z0,z1, y, color, uv){
  push(bk, planeGeo(x1-x0, z1-z0, uv||0.5), (x0+x1)/2, y, (z0+z1)/2, 0, color, Math.PI/2, 0);
}
// a door frame: two posts and a head, proud of both faces of a wall t thick
function frameX(c, t, a, b, head, color){
  for(const x of [a-0.035, b+0.035]) bx("paintm", 0.07, head-FL+0.07, t+0.12, x, FL+(head-FL+0.07)/2, c, 0, 0, color||BRONZE);
  bx("paintm", b-a+0.14, 0.07, t+0.12, (a+b)/2, head+0.035, c, 0, 0, color||BRONZE);
}
function frameZ(c, t, a, b, head, color){
  for(const z of [a-0.035, b+0.035]) bx("paintm", t+0.12, head-FL+0.07, 0.07, c, FL+(head-FL+0.07)/2, z, 0, 0, color||BRONZE);
  bx("paintm", t+0.12, 0.07, b-a+0.14, c, head+0.035, (a+b)/2, 0, 0, color||BRONZE);
}
// a small printed sign on a wall face: lit=false, a centimetre proud
function wallSign(w,h,draw,x,y,z,ry){
  return signPanel(w,h, signTex(Math.round(w*300),Math.round(h*300),draw), x,y,z, ry);
}

/* a grey swing-top can: a square bin, a hood on it with a peaked lid, and the
   swinging door in the front of the hood, facing ry (local +z out) */
function swingCan(x, z, ry, y0){
  const f=XF(x, z, ry), Y=(y0===undefined?FL:y0), G="#9aa0a3";
  lbx(f, "paintm", 0.44, 0.76, 0.44, 0, Y+0.38, 0, 0, G);
  lbx(f, "paintm", 0.47, 0.035, 0.47, 0, Y+0.775, 0, 0, "#868c8f");
  lbx(f, "paintm", 0.45, 0.20, 0.45, 0, Y+0.89, 0, 0, G);
  for(const s of [-1,1]) push("paintm", boxGeo(0.47, 0.03, 0.27, 0), f.x(0,s*0.11), Y+1.035, f.z(0,s*0.11), ry, "#8e9497", -s*0.42, 0);
  lbx(f, "paintm", 0.47, 0.025, 0.04, 0, Y+1.085, 0, 0, "#7f8588");
  // the door: a dark slot, the flap hanging in it, a push plate
  lbx(f, "paintm", 0.34, 0.15, 0.012, 0, Y+0.895, 0.226, 0, "#161616");
  push("paintm", boxGeo(0.32, 0.135, 0.014, 0), f.x(0,0.231), Y+0.90, f.z(0,0.231), ry, "#7a8084", -0.10, 0);
  lbx(f, "paintm", 0.12, 0.03, 0.01, 0, Y+0.85, 0.24, 0, "#5d6266");
  bx("rubber", 0.52, 0.02, 0.52, x, Y+0.01, z, 0, ry, "#2a2a2a");
  lcol(f, 0.48, 0.48, 0, 0, Y-0.5, Y+1.05);
}
/* ---- porcelain --------------------------------------------------------------
   A floor-mounted elongated bowl turned on a lathe and stretched front to
   back, an open-front seat, the chrome flushometer out of the wall behind
   it; a wall-hung urinal extruded from its side profile with its edges
   rounded off, the inside of it painted on, its own flush valve. Each takes
   a frame on the wall: (x, z) there, ry turning local +z out into the room. */
const _bowlGeo=(function(){
  const pts=[[0.125,0.0],[0.118,0.04],[0.100,0.13],[0.108,0.21],[0.145,0.29],[0.178,0.345],[0.190,0.375],[0.186,0.392],
             [0.168,0.398],[0.150,0.388],[0.128,0.345],[0.090,0.300],[0.040,0.284],[0.001,0.282]];
  const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])), 28);
  g.scale(1, 1, 1.32);
  return g;
})();
const _seatGeo=(function(){
  const arc=Math.PI*2*0.86, g=new T.TorusGeometry(0.150, 0.021, 6, 24, arc);
  g.rotateZ(Math.PI*1.5-(arc+(Math.PI*2-arc)/2));
  g.rotateX(-Math.PI/2); g.scale(1, 0.6, 1.32);
  return g;
})();
const _waterGeo=(function(){ const g=new T.CircleGeometry(0.085, 20); g.rotateX(-Math.PI/2); g.scale(1,1,1.32); return g; })();
function toiletFix(x, z, ry, seatC){
  const f=XF(x, z, ry), P=(lx,ly,lz)=>[f.x(lx,lz), FL+ly, f.z(lx,lz)];
  const at=(bk,geo,lx,ly,lz,c,rx,rz)=>{ const p=P(lx,ly,lz); push(bk, geo, p[0],p[1],p[2], ry, c, rx||0, rz||0); };
  at("porcelain", _bowlGeo, 0, 0, 0.44, PORC);
  at("paintm", _waterGeo, 0, 0.300, 0.46, "#8ea4ad");
  at("porcelain", boxGeo(0.25, 0.15, 0.17, 0), 0, 0.33, 0.11, PORC);                   // the neck, to the wall
  at("paintm", _seatGeo, 0, 0.405, 0.45, seatC||"#f4f3ef");
  for(const s of [-1,1]) at("chrome", new T.CylinderGeometry(0.012,0.012,0.04,8), s*0.09, 0.40, 0.21, "#c9cbcc");
  // the flushometer: stop valve off the wall, the body, the handle, the tube to the spud
  at("chrome", new T.CylinderGeometry(0.03,0.03,0.012,12), 0.14, 0.80, 0.006, "#c9cbcc", Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.014,0.014,0.10,8), 0.14, 0.80, 0.05, "#c9cbcc", Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.016,0.016,0.14,8), 0.07, 0.80, 0.10, "#c9cbcc", 0, Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.036,0.036,0.13,14), 0, 0.77, 0.10, "#d0d3d4");
  at("chrome", new T.SphereGeometry(0.036,12,8,0,Math.PI*2,0,Math.PI/2), 0, 0.835, 0.10, "#d0d3d4");
  at("chrome", boxGeo(0.13, 0.018, 0.018, 0), 0.075, 0.725, 0.10, "#c9cbcc", 0, -0.35);
  at("chrome", new T.CylinderGeometry(0.016,0.016,0.30,8), 0, 0.56, 0.10, "#c9cbcc");
  at("chrome", new T.CylinderGeometry(0.03,0.03,0.03,12), 0, 0.41, 0.10, "#c9cbcc");
  // the seat-cover dispenser on the wall over it
  at("steel", boxGeo(0.42, 0.28, 0.035, 0.8), 0, 1.18, 0.018, "#cfd2d3");
  at("paintm", boxGeo(0.30, 0.10, 0.006, 0), 0, 1.20, 0.037, "#3a3c3e");
}
const _urinalGeo=(function(){
  const sh=new T.Shape();
  sh.moveTo(0.02,0.44); sh.lineTo(0.0,1.10); sh.quadraticCurveTo(0.0,1.14, 0.06,1.14); sh.lineTo(0.24,1.12);
  sh.quadraticCurveTo(0.30,1.11, 0.30,1.04); sh.lineTo(0.32,0.80); sh.quadraticCurveTo(0.34,0.66, 0.37,0.62);
  sh.quadraticCurveTo(0.38,0.56, 0.33,0.52); sh.quadraticCurveTo(0.22,0.43, 0.10,0.42); sh.lineTo(0.02,0.44);
  const g=new T.ExtrudeGeometry(sh, {depth:0.26, bevelEnabled:true, bevelThickness:0.05, bevelSize:0.04, bevelSegments:4, curveSegments:8});
  g.rotateY(-Math.PI/2); g.translate(0.13, 0, 0);
  g.deleteAttribute("uv");
  return g;
})();
bucketOf("urinal_in", ()=>envIn(new T.MeshStandardMaterial({roughness:0.18, metalness:0.02,
  map:setSRGB(new T.CanvasTexture((function(){ const c=cvs(128,256), x=c.getContext("2d");
    x.fillStyle="#f3f2ed"; x.fillRect(0,0,128,256);
    x.save(); x.translate(64,150); x.scale(1,2.1);
    const g=x.createRadialGradient(0,0,4,0,0,56); g.addColorStop(0,"rgba(120,122,118,0.85)"); g.addColorStop(0.7,"rgba(170,170,165,0.55)"); g.addColorStop(1,"rgba(243,242,237,0)");
    x.fillStyle=g; x.beginPath(); x.arc(0,0,56,0,7); x.fill(); x.restore();
    x.fillStyle="#d8d7d1"; for(let i=0;i<5;i++) for(let j=0;j<3;j++){ x.beginPath(); x.arc(48+i*8,214+j*7,2.2,0,7); x.fill(); }
    x.fillStyle="rgba(90,90,86,0.5)"; x.fillRect(10,6,108,5);
    return c; })()))}), 0.6));
function urinalFix(x, z, ry, drop){
  const f=XF(x, z, ry), dy=-(drop||0), P=(lx,ly,lz)=>[f.x(lx,lz), FL+ly+dy, f.z(lx,lz)];
  const at=(bk,geo,lx,ly,lz,c,rx,rz)=>{ const p=P(lx,ly,lz); push(bk, geo, p[0],p[1],p[2], ry, c, rx||0, rz||0); };
  at("porcelain", _urinalGeo, 0, 0, 0, PORC);
  at("urinal_in", planeGeo(0.25, 0.46, 0), 0, 0.83, 0.392, "#ffffff", 0.165);
  // the flush valve over it
  at("chrome", new T.CylinderGeometry(0.03,0.03,0.012,12), 0.11, 1.36, 0.006, "#c9cbcc", Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.014,0.014,0.10,8), 0.11, 1.36, 0.05, "#c9cbcc", Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.016,0.016,0.11,8), 0.055, 1.36, 0.10, "#c9cbcc", 0, Math.PI/2);
  at("chrome", new T.CylinderGeometry(0.034,0.034,0.12,14), 0, 1.33, 0.10, "#d0d3d4");
  at("chrome", new T.SphereGeometry(0.034,12,8,0,Math.PI*2,0,Math.PI/2), 0, 1.39, 0.10, "#d0d3d4");
  at("chrome", boxGeo(0.12, 0.016, 0.016, 0), 0.07, 1.29, 0.10, "#c9cbcc", 0, -0.35);
  at("chrome", new T.CylinderGeometry(0.014,0.014,0.13,8), 0, 1.21, 0.10, "#c9cbcc");
}
// a yellow A-frame CAUTION WET FLOOR sign
const _wetTex=signTex(160,256,(c,W,H)=>{
  c.fillStyle="#f2c418"; c.fillRect(0,0,W,H); c.fillStyle="#1a1a1a";
  fitText(c,"CAUTION",W*0.8,H*0.10,W/2,H*0.12,"700"); fitText(c,"Wet Floor",W*0.8,H*0.08,W/2,H*0.23,"500");
  c.beginPath(); c.moveTo(W/2,H*0.32); c.lineTo(W*0.78,H*0.64); c.lineTo(W*0.22,H*0.64); c.closePath();
  c.strokeStyle="#1a1a1a"; c.lineWidth=6; c.stroke();
  c.fillRect(W*0.47,H*0.44,W*0.06,H*0.12);
  fitText(c,"Cuidado",W*0.8,H*0.07,W/2,H*0.76,"700"); fitText(c,"Piso Mojado",W*0.8,H*0.06,W/2,H*0.86,"400");
});
function wetFloor(x,z,ry){
  const m=new T.MeshStandardMaterial({map:_wetTex, roughness:0.4, side:T.DoubleSide});
  for(const s of [-1,1]){
    const p=new T.Mesh(new T.PlaneGeometry(0.30,0.62), m);
    p.position.set(x+Math.sin(ry)*s*0.09, FL+0.31, z+Math.cos(ry)*s*0.09);
    p.rotation.order="YXZ"; p.rotation.set(-s*0.28, ry, 0);
    p.castShadow=true; scene.add(p);
  }
}

/* =======================================================================
   THE SHELL
   ======================================================================= */
(function shell(){
  const L=BLD;
  // the slab, and the one floor every room stands on
  bx("concrete", 13.0, 0.40, 29.0, 0.5, FL-0.20-0.002, 0, 0.5, 0, "#a9a59c");
  addFlat(-6.1, 7.1, -14.6, 14.6, FL);

  /* --- the lobby ------------------------------------------------------- */
  // west (front): brick to 3.0 round the storefront; the gable above
  const SF={a:-1.90, b:1.90, sill:Y0, head:FL+2.62};
  runZ("brick", -5.85, WT, -5.65, 5.65, Y0, 3.0, [SF], BRICK, 0.83);
  // east (back): the rear door
  const RD={a:1.20, b:2.18, sill:Y0, head:FL+2.14};
  runZ("brick", 5.85, WT, -5.35, 5.35, Y0, 3.0, [RD], BRICK, 0.83);
  // north and south: party walls with the wings; the restroom entries and
  // the small rooms' doors; a clerestory band above the wings' roofs
  const ENT={a:-1.00, b:0.20, sill:Y0, head:FL+2.20};
  const SMD={a:4.20, b:5.16, sill:Y0, head:FL+2.14};
  for(const sg of [-1,1]){
    const zc=sg*L.lz;
    runX("block", zc, WT, -6.0, 6.0, Y0, CL0, [ENT, SMD], BLOCKC, 0.6);
    runX("block", zc, WT, 6.0, 7.0, Y0, L.eaveW, [], BLOCKC, 0.6);
    // above the wing roof: brick piers at the ends, glass between, a beam on top
    wallBox("brick", -6.0, -4.9, zc-WT/2, zc+WT/2, CL0, L.eaveL, BRICK, 0.83);
    wallBox("brick", 5.5, 6.0, zc-WT/2, zc+WT/2, CL0, L.eaveL, BRICK, 0.83);
    wallBox("brick", -4.9, 5.5, zc-WT/2, zc+WT/2, CL1, L.eaveL, BRICK, 0.83);
    wallBox("paintm", -4.9, 5.5, zc-0.05, zc+0.05, CL0, CL0+0.04, BRONZE, 0.3);
    push("tint", boxGeo(10.4, CL1-CL0-0.04, 0.02, 0), 0.3, (CL0+CL1)/2, zc, 0, "#5d6e74");
    for(let x=-4.9+1.04; x<5.5; x+=1.04) bx("paintm", 0.05, CL1-CL0, 0.12, x, (CL0+CL1)/2, zc, 0, 0, BRONZE);
    // the faces of the party wall that are outdoors: brick them
    lineX("brick", zc+sg*WT/2, sg, -6.0, -5.0, Y0, CL0, [], BRICK, 0.83);
    lineX("brick", zc-sg*WT/2, -sg, 6.0, 7.0, Y0, L.eaveW, [], BRICK, 0.83);
  }

  /* --- the wings ------------------------------------------------------- */
  for(const sg of [-1,1]){
    const zIn=sg*5.65, zEnd=sg*14.35, zOut=sg*14.5;
    const lo=Math.min(zIn, zOut), hi=Math.max(zIn, zOut);
    // west: a band of high obscure glass under the eave, over the urinals
    const HW={a:Math.min(sg*6.6, sg*13.6), b:Math.max(sg*6.6, sg*13.6), sill:FL+2.25, head:FL+2.78};
    runZ("brick", -4.85, WT, lo, hi, Y0, L.eaveW, [HW], BRICK, 0.83);
    push("glass", boxGeo(0.04, 0.53, HW.b-HW.a, 0), -4.85, FL+2.515, (HW.a+HW.b)/2, 0, "#dfe6e4");
    // the reveal, lined inside so the window reads as a window and not a slot
    bx("paintm", 0.17, 0.03, HW.b-HW.a, -4.79, HW.sill+0.015, (HW.a+HW.b)/2, 0, 0, "#d9d6cc");
    bx("paintm", 0.17, 0.03, HW.b-HW.a, -4.79, HW.head-0.015, (HW.a+HW.b)/2, 0, 0, "#d9d6cc");
    for(const ze of [HW.a, HW.b]) bx("paintm", 0.17, HW.head-HW.sill, 0.03, -4.79, (HW.sill+HW.head)/2, ze+(ze===HW.a?0.015:-0.015), 0, 0, "#d9d6cc");
    for(let z=HW.a+1.0; z<HW.b; z+=1.0) bx("paintm", 0.14, 0.53, 0.05, -4.85, FL+2.515, z, 0, 0, BRONZE);
    // east: the service room's own door
    const SV={a:Math.min(sg*11.0, sg*11.96), b:Math.max(sg*11.0, sg*11.96), sill:Y0, head:FL+2.14};
    runZ("brick", 6.85, WT, lo, hi, Y0, L.eaveW, [SV], BRICK, 0.83);
    frameZ(6.85, WT, SV.a, SV.b, SV.head);
    makeDoor(XF(6.85, sg>0?SV.b-0.04:SV.a+0.04, sg>0?Math.PI/2:-Math.PI/2), 0, FL+0.02, 0,
             sg<0?"JANITOR · STAFF ONLY":"MECHANICAL · STAFF ONLY", false, 0, "steel", 0x7d6a58);
    // the end wall
    runX("brick", zEnd, WT, -5.0, 7.0, Y0, L.eaveW, [], BRICK, 0.83);
    // inside: the restroom's east wall, and the wall between the small rooms
    runZ("block", 3.35, WT, lo, hi, Y0, CEIL+0.02, [], BLOCKC, 0.6);
    runX("block", sg*8.55, WT, 3.5, 6.7, Y0, CEIL+0.02, [], BLOCKC, 0.6);
    // ceilings
    ceilAt("plaster", -4.7, 6.7, lo+(sg<0?0.15:0), hi-(sg>0?0.15:0), CEIL, "#e9e9e4", 0.4);
  }

  /* --- the lobby's gable ends: siding round the great window --------------
     A pentagon of siding with a hole in it the shape of the glass, laid in
     the plane of the wall's outer face, the glass in the hole, and the
     mullions over that: a frame, a transom, and the two diagonals that
     follow the roof down (photograph 12). */
  const gy=(z)=>roofLY(z)-0.06;
  function gable(xFace, dir, glass){
    const sh=new T.Shape();
    sh.moveTo(-5.65, 3.0); sh.lineTo(5.65, 3.0); sh.lineTo(5.65, gy(5.65)); sh.lineTo(0, gy(0)); sh.lineTo(-5.65, gy(5.65));
    if(glass){
      const h=new T.Path(), gw=2.30, top=(z)=>gy(z)-0.32;
      h.moveTo(-gw, 3.18); h.lineTo(-gw, top(gw)); h.lineTo(0, top(0)); h.lineTo(gw, top(gw)); h.lineTo(gw, 3.18);
      h.lineTo(-gw, 3.18);
      sh.holes.push(h);
    }
    const g=new T.ExtrudeGeometry(sh, {depth:0.20, bevelEnabled:false});
    const U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*0.62, U.getY(i)*0.62); U.needsUpdate=true;
    g.rotateY(Math.PI/2);                       // shape x -> -z, extrusion -> +x
    push("siding", g, dir<0 ? xFace-0.05 : xFace-0.15, 0, 0, 0, CREAM);
    // the cap where brick stops and siding starts
    bx("paintm", 0.34, 0.10, 11.5, xFace+dir*0.0-dir*0.12, 3.0, 0, 0, 0, FASCIA);
    if(!glass){
      // the back gable: a louvred vent
      bx("paintm", 0.05, 1.0, 1.4, xFace+dir*0.03, 6.2, 0, 0, 0, "#cfc9b8");
      for(let k=0;k<6;k++) bx("paintm", 0.06, 0.04, 1.3, xFace+dir*0.06, 5.78+k*0.16, 0, 0, 0, "#9a9484");
      return;
    }
    const gw=2.30, top=(z)=>gy(z)-0.32;
    const pane=new T.Shape(); pane.moveTo(-gw,3.18); pane.lineTo(gw,3.18); pane.lineTo(gw,top(gw)); pane.lineTo(0,top(0)); pane.lineTo(-gw,top(gw));
    const pg=new T.ShapeGeometry(pane); pg.rotateY(Math.PI/2);
    push("tint", pg, xFace-dir*0.10, 0, 0, 0, "#3c4a50");
    // mullions, dark bronze, both faces
    const mul=(z0,y0,z1,y1,w)=>{
      const L2=Math.hypot(z1-z0,y1-y0);
      push("paintm", boxGeo(0.22, L2, w||0.09, 0), xFace-dir*0.10, (y0+y1)/2, (z0+z1)/2, 0, BRONZE,
           Math.atan2(z1-z0, y1-y0), 0);
    };
    mul(-gw,3.18, gw,3.18, 0.12); mul(-gw,3.18,-gw,top(gw)); mul(gw,3.18,gw,top(gw));
    mul(-gw,top(gw),0,top(0)); mul(gw,top(gw),0,top(0));
    mul(-gw,4.55, gw,4.55); mul(0,3.18,0,top(0));
    mul(-gw*0.5,4.55,-gw*0.5,3.18); mul(gw*0.5,4.55,gw*0.5,3.18);
    // the diagonals: from the transom's ends up toward the peak
    mul(-gw,4.55, -0.5, top(0.5)); mul(gw,4.55, 0.5, top(0.5));
  }
  gable(-6.0, -1, true);
  gable(6.0, 1, false);

  /* --- roofs --------------------------------------------------------------
     The lobby's: two steep planes from the ridge down to eaves at 4.4,
     running out past the gables as a deep rake. The wings': low-pitched,
     ridged north-south, eaves deep on the front where they shelter the
     walk. Shingle on top, a dark fascia round every edge, soffit under. */
  const OH=0.95, RT=0.24;
  const tz=Math.tan(PITCH);
  const eaveZ=L.lz+0.90, eaveY=L.ridge-eaveZ*tz;
  for(const sg of [-1,1]){
    const g=new FaceGeo().slab([V3(-6.0-OH, L.ridge+0.02, 0), V3(6.0+OH, L.ridge+0.02, 0),
                                V3(6.0+OH, eaveY, sg*eaveZ), V3(-6.0-OH, eaveY, sg*eaveZ)], RT, 0.5).geo();
    push("shingle", g, 0,0,0, 0, "#cfc6bd");
    // fascia along the eave, and the rake boards up both gables
    bx("paintm", 12.0+OH*2+0.1, 0.26, 0.06, 0, eaveY-0.13, sg*(eaveZ+0.03), 0, 0, FASCIA);
    for(const xe of [-6.0-OH, 6.0+OH]){
      const L3=Math.hypot(eaveZ, L.ridge-eaveY);
      push("paintm", boxGeo(0.07, 0.34, L3, 0), xe+(xe<0?-0.035:0.035), (L.ridge+eaveY)/2-0.12, sg*eaveZ/2, 0, FASCIA,
           sg*PITCH, 0);
    }
  }
  bx("paintm", 12.0+OH*2+0.1, 0.12, 0.30, 0, L.ridge+0.10, 0, 0, 0, "#2f2621");          // ridge cap
  // the wings
  const wsl=(L.ridgeW-(L.eaveW+0.05))/6.0;
  for(const sg of [-1,1]){
    const zA=sg*5.42, zB=sg*(L.wz+0.75);
    const xW=-6.25, xE=7.85, yW=L.ridgeW-(1-xW)*wsl, yE=L.ridgeW-(xE-1)*wsl;
    for(const [xa,ya] of [[xW,yW],[xE,yE]]){
      const g=new FaceGeo().slab([V3(1, L.ridgeW+0.02, zA), V3(1, L.ridgeW+0.02, zB), V3(xa, ya, zB), V3(xa, ya, zA)], 0.20, 0.5).geo();
      push("shingle", g, 0,0,0, 0, "#cfc6bd");
      bx("paintm", 0.06, 0.24, Math.abs(zB-zA)+0.1, xa+(xa<0?-0.03:0.03), ya-0.12, (zA+zB)/2, 0, 0, FASCIA);
    }
    // soffit under the deep front eave, with downlights, and the gable end
    const sz0=Math.min(zA,zB), sz1=Math.max(zA,zB);
    push("paintm", planeGeo(1.25, sz1-sz0, 0), -5.62, yW-0.21, (sz0+sz1)/2, 0, "#5a4a3e", Math.PI/2, 0);
    push("paintm", planeGeo(0.85, sz1-sz0, 0), 7.42, yE-0.21, (sz0+sz1)/2, 0, "#5a4a3e", Math.PI/2, 0);
    const tri=new T.Shape([new T.Vector2(-5.0,L.eaveW-0.02), new T.Vector2(7.0,L.eaveW-0.02), new T.Vector2(1,L.ridgeW-0.04)]);
    const tg=new T.ShapeGeometry(tri);
    push("siding", tg, sg>0?0:2, 0, sg*(L.wz+0.002), sg>0?0:Math.PI, CREAM);
    bx("paintm", 14.2, 0.24, 0.06, 0.8, L.eaveW-0.12+0.02, zB, 0, 0, FASCIA);
    for(let z=sg*7.5; Math.abs(z)<13.8; z+=sg*3.0){
      push("lamplens", new T.CylinderGeometry(0.09,0.09,0.03,12), -5.62, yW-0.23, z, 0, "#ffffff");
      LAMPS.push({x:-5.62, y:yW-0.35, z:z, color:0xffe2b8, intensity:0.55, dist:7.5, decay:1.6, mothy:true});
    }
    // brick piers holding the corners of the front eave
    for(const z of [sg*14.2, sg*9.8]){
      wallBox("brick", -6.05, -5.55, z-0.25, z+0.25, Y0, L.eaveW-0.02, BRICK, 0.83);
    }
    // gutters and a downspout at each end
    bx("paintm", 0.12, 0.12, Math.abs(zB-zA), xW-0.08, yW-0.18, (zA+zB)/2, 0, 0, FASCIA);
    cyl("paintm", 0.045,0.045, yW-0.1, 8, xW-0.08, yW/2, zB-sg*0.12, FASCIA);
  }
  // soffit under the lobby's rake, front and back, and the porch out back
  for(const xe of [-6.0-OH/2, 6.0+OH/2]){
    for(const sg of [-1,1]){
      const L3=Math.hypot(eaveZ, L.ridge-eaveY);
      push("paintm", planeGeo(OH, L3, 0), xe, (L.ridge+eaveY)/2-RT-0.02, sg*eaveZ/2, 0, "#5a4a3e",
           Math.PI/2+sg*PITCH, 0);
    }
  }
  addZone(6.0, 7.0, -5.5, 5.5, FL-0.5, 4, "THE BACK PORCH");
  // a light on the gable's brick each side of the glass, and one out back
  for(const z of [-3.2, 3.2]){
    bx("paintm", 0.16, 0.12, 0.22, -6.08, 2.88, z, 0, 0, "#2c2c2a");
    push("lamplens", boxGeo(0.02,0.08,0.16,0), -6.17, 2.86, z, 0, "#ffffff");
    LAMPS.push({x:-6.4, y:2.7, z:z, color:0xfff0d8, intensity:0.85, dist:12, decay:1.5, mothy:true});
  }
  LAMPS.push({x:6.5, y:3.3, z:0, color:0xffe2b8, intensity:0.6, dist:8, decay:1.6, mothy:true});
})();

/* ---- lit windows: after dark the glass glows from the room behind it ----
   A plane just inside each pane, facing out and only out, so from inside
   it is culled and you look through the glass at the night. */
bucketOf("winwarm", ()=>{ const m=basicGlowMat(0xffd7a0, "warm", T.AdditiveBlending); GLOW[GLOW.length-1].max=0.42; return m; });
bucketOf("wincool", ()=>glowMat({color:0xb9c3c3, emissive:0xe6f0ff, emissiveIntensity:0.16, roughness:0.45}, "warm"));
(function litWindows(){
  const gw=2.30, top=(z)=>roofLY(z)-0.06-0.32;
  const pane=new T.Shape(); pane.moveTo(-gw,3.18); pane.lineTo(gw,3.18); pane.lineTo(gw,top(gw)); pane.lineTo(0,top(0)); pane.lineTo(-gw,top(gw));
  const pg=new T.ShapeGeometry(pane); pg.rotateY(-Math.PI/2);
  push("winwarm", pg, -5.80, 0, 0, 0, "#ffffff");
  for(const [za,zb] of [[-1.85,-1.03],[1.03,1.85]])
    push("winwarm", planeGeo(zb-za, 2.30, 0), -5.78, FL+1.30, (za+zb)/2, -Math.PI/2, "#ffffff");
  for(const sg of [-1,1])
    push("winwarm", planeGeo(10.4, CL1-CL0-0.06, 0), 0.3, (CL0+CL1)/2, sg*5.40, sg<0?Math.PI:0, "#ffffff");
  for(const sg of [-1,1])
    push("wincool", planeGeo(6.9, 0.50, 0), -4.76, FL+2.515, sg*10.1, -Math.PI/2, "#ffffff");
})();

/* =======================================================================
   THE LOBBY
   Named anchors first. LANE is the strip from the front doors to the back
   door and to both restroom entries: nothing stands in it.
   ======================================================================= */
const LOBBY={x0:-5.70, x1:5.70, z0:-5.35, z1:5.35};
(function lobby(){
  const R=LOBBY, top=CL0;
  const LANE=[-5.7, 5.7, -1.2, 2.4];              // front door to back door
  // floor: red quarry tile, with mats at both doors
  floorAt("quarry", R.x0, R.x1, R.z0, R.z1, FL+0.004, "#ffffff", 0.75);
  for(const sg of [-1,1]) floorAt("quarry", -1.0, 0.2, sg>0?R.z1:-5.65, sg>0?5.65:R.z0, FL+0.003, "#d9cfc6", 0.75);
  floorAt("quarry", 4.2, 5.16, -5.65, R.z0, FL+0.003, "#d9cfc6", 0.75);
  floorAt("quarry", 4.2, 5.16, R.z1, 5.65, FL+0.003, "#d9cfc6", 0.75);
  push("mat", planeGeo(1.6, 2.4, 0.8), -4.75, FL+0.010, 0, 0, "#3a3a38", -Math.PI/2, 0);
  push("mat", planeGeo(1.2, 1.5, 0.8), 4.95, FL+0.010, 1.69, 0, "#3a3a38", -Math.PI/2, 0);
  addZone(R.x0-0.3, R.x1+0.3, R.z0-0.3, R.z1+0.3, FL-0.5, 9, "LOBBY", true);

  // walls: face brick to 2.4, cream plaster above, a stained trim board between
  const SF={a:-1.90, b:1.90, sill:Y0, head:FL+2.62}, RD={a:1.20, b:2.18, sill:Y0, head:FL+2.14};
  const ENT={a:-1.00, b:0.20, sill:Y0, head:FL+2.20}, SMD={a:4.20, b:5.16, sill:Y0, head:FL+2.14};
  const BR=FL+2.40;
  lineZ("brick", R.x0, 1, R.z0, R.z1, FL, BR, [SF], BRICK_IN, 0.83);
  lineZ("plaster", R.x0, 1, R.z0, R.z1, BR, 3.0, [SF], CREAM, 0.5);
  lineZ("brick", R.x1, -1, R.z0, R.z1, FL, BR, [RD], BRICK_IN, 0.83);
  lineZ("plaster", R.x1, -1, R.z0, R.z1, BR, 3.0, [RD], CREAM, 0.5);
  for(const sg of [-1,1]){
    const f=sg*R.z1;
    lineX("brick", f, -sg, R.x0, R.x1, FL, BR, [ENT,SMD], BRICK_IN, 0.83);
    lineX("plaster", f, -sg, R.x0, R.x1, BR, top, [ENT,SMD], CREAM, 0.5);
    bx("beam", R.x1-R.x0, 0.08, 0.05, 0, BR+0.02, f-sg*0.03, 0.6, 0, "#6a4a32");
    frameX(sg*BLD.lz, WT, ENT.a, ENT.b, ENT.head, "#6a4a32");
    frameX(sg*BLD.lz, WT, SMD.a, SMD.b, SMD.head);
  }
  for(const x of [R.x0, R.x1]) bx("beam", 0.05, 0.08, R.z1-R.z0, x+(x<0?0.03:-0.03), BR+0.02, 0, 0.6, 0, "#6a4a32");
  // the gable walls inside, above the brick: plaster, up to the ceiling
  // the storefront: dark bronze frame, glass, a pair of doors
  {
    const x=-5.85;
    for(const z of [-1.90,-0.98,0.98,1.90]) bx("paintm", 0.20, 2.47, 0.10, x, FL+1.235, z+(z<0?0.05:-0.05)*(Math.abs(z)>1.5?1:0), 0, 0, BRONZE);
    bx("paintm", 0.20, 0.14, 3.80, x, FL+2.55, 0, 0, 0, BRONZE);
    for(const [za,zb] of [[-1.85,-1.03],[1.03,1.85]]){
      push("glass", boxGeo(0.02, 2.30, zb-za, 0), x, FL+1.30, (za+zb)/2, 0, "#cfd9da");
      bx("paintm", 0.20, 0.10, zb-za, x, FL+0.10, (za+zb)/2, 0, 0, BRONZE);
    }
    // a pair of doors, swinging out
    makeDoor(XF(x+0.0, -0.98, -Math.PI/2), 0, FL+0.02, 0, "FRONT DOORS", true, 0, "store");
    makeDoor(XF(x+0.0, 0.98, Math.PI/2), 0, FL+0.02, 0, "FRONT DOORS", false, 0, "store");
  }
  frameZ(5.85, WT, RD.a, RD.b, RD.head);
  makeDoor(XF(5.85, RD.a+0.04, -Math.PI/2), 0, FL+0.02, 0, "BACK DOOR", false, 0, "vision");

  /* --- the ceiling: it follows the roof, cream boards between dark beams -- */
  const tz=Math.tan(PITCH), cy=z=>BLD.ridge-Math.abs(z)*tz-0.42;
  for(const sg of [-1,1]){
    // the "inside" point is above the boards, so they face down into the room
    const g=new FaceGeo().poly([V3(R.x0,cy(0),0), V3(R.x1,cy(0),0), V3(R.x1,cy(5.35),sg*5.35), V3(R.x0,cy(5.35),sg*5.35)],
                               V3(0,30,0), 0.5).geo();
    push("plaster", g, 0,0,0, 0, "#e3dccb");
  }
  // the gable walls' inner face above the brick, as far as the ceiling
  for(const [xf,dir] of [[R.x0,1],[R.x1,-1]]){
    const sh=new T.Shape([new T.Vector2(-5.35,3.0), new T.Vector2(5.35,3.0), new T.Vector2(5.35,cy(5.35)+0.02),
                          new T.Vector2(0,cy(0)+0.02), new T.Vector2(-5.35,cy(5.35)+0.02)]);
    if(dir>0){ const gw=2.30, top2=(z)=>roofLY(z)-0.38;
      const h=new T.Path(); h.moveTo(-gw,3.18); h.lineTo(-gw,top2(gw)); h.lineTo(0,Math.min(top2(0),cy(0))); h.lineTo(gw,top2(gw)); h.lineTo(gw,3.18); h.lineTo(-gw,3.18);
      sh.holes.push(h); }
    const g=new T.ShapeGeometry(sh), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,U.getX(i)*0.5,U.getY(i)*0.5);
    g.rotateY(dir>0?Math.PI/2:-Math.PI/2);
    push("plaster", g, xf+dir*0.006, 0, 0, 0, CREAM);
  }
  // trusses: a tie beam across at 4.9 and rafters up both slopes
  for(const x of [-3.4, 0, 3.4]){
    bx("beam", 0.16, 0.22, 10.7, x, 4.9, 0, 0.6, 0, "#5a3e2a");
    for(const sg of [-1,1]){
      const L2=Math.hypot(5.35, cy(0)-cy(5.35));
      push("beam", boxGeo(0.16, 0.24, L2, 0.6), x, (cy(0)+cy(5.35))/2-0.12, sg*5.35/2, 0, "#5a3e2a", sg*PITCH, 0);
    }
    bx("beam", 0.12, cy(0)-4.9-0.1, 0.12, x, (cy(0)+4.9)/2, 0, 0.6, 0, "#5a3e2a");
  }
  // pendant lights: white enamel domes on long rods (photographs 5, 15)
  for(const [x,z] of [[-2.6,-2.0],[1.8,-2.0],[-2.6,2.2],[1.8,2.2]]){
    cyl("chrome", 0.012,0.012, 4.9-3.35, 6, x, (4.9+3.35)/2, z, "#9a9a96");
    push("paintm", domeGeo(0.34, 0.22, 20), x, 3.38, z, 0, "#efeee8");
    push("ceilfix", new T.SphereGeometry(0.12, 12, 8), x, 3.22, z, 0, "#ffffff");
    LAMPS.push({x:x, y:3.1, z:z, color:0xfff1dc, intensity:0.75, dist:9, decay:1.4, indoor:true,
                vol:[R.x0-0.4, R.x1+0.4, R.z0-0.4, R.z1+0.4, FL-1, 9]});
  }

  /* --- along the east wall: the machines (photograph 15) ----------------- */
  const vend=(z, kind)=>{
    const x=R.x1-0.46;
    bx("paintm", 0.86, 1.86, 0.98, x, FL+0.93, z, 0, 0, "#1d1e21");
    const key=kind==="snack" ? "pic:vend:snack" : "pic:vend:soda";
    push(key, planeGeo(0.80, 1.50, 0), x-0.432, FL+1.04, z, -Math.PI/2, "#ffffff");
    bx("paintm", 0.06, 0.20, 0.30, x-0.44, FL+1.10, z+0.33, 0, 0, "#3a3b3e");       // coin panel
    bx("paintm", 0.04, 0.14, 0.62, x-0.44, FL+0.18, z-0.06, 0, 0, "#0e0e10");       // the flap
    addCol(x-0.48, x+0.48, z-0.50, z+0.50, FL-0.5, FL+1.9);
    addUse(x-0.9, z, FL, kind==="snack"?"BUY A SNACK":"BUY A DRINK", ()=>{
      const items=kind==="snack" ? ["PRETZELS","PEANUT BUTTER CRACKERS","CHIPS","A CANDY BAR","TRAIL MIX"]
                                 : ["BOTTLED WATER","A COLA","ICED TEA","A LEMON-LIME","AN ENERGY DRINK"];
      toast("CLUNK — "+items[(Math.random()*items.length)|0], "#cfe0d4");
      if(typeof AUDIO!=="undefined") AUDIO.blip("clunk");
    }, 1.4);
    LAMPS.push({x:x-0.7, y:FL+1.2, z:z, color:0xdfe9ff, intensity:0.25, dist:3.5, decay:1.6, indoor:true,
                vol:[R.x0-0.4, R.x1+0.4, R.z0-0.4, R.z1+0.4, FL-1, 9]});
  };
  vend(-3.35,"soda"); vend(-2.25,"snack"); vend(-1.15,"soda");
  wallSign(0.9,0.5,(c,W,H)=>{ c.fillStyle="#f1efe6"; c.fillRect(0,0,W,H);
    c.fillStyle="#b3151b"; fitText(c,"TURN OFF",W*0.8,H*0.34,W/2,H*0.32,"700");
    c.fillStyle="#222"; fitText(c,"YOUR ENGINE",W*0.8,H*0.28,W/2,H*0.70,"600"); }, R.x1-0.01, FL+2.0, 3.3, -Math.PI/2);
  // exit signs over both doors
  for(const [x,z,ry] of [[R.x0+0.02,0,Math.PI/2],[R.x1-0.02,1.69,-Math.PI/2]]){
    bx("paintm", 0.10, 0.20, 0.36, x+(ry>0?0.05:-0.05), FL+2.85, z, 0, 0, "#e9e6dc");
    push("exitsign", planeGeo(0.30,0.14,0), x+(ry>0?0.105:-0.105), FL+2.85, z, ry, "#ffffff");
  }

  /* --- the north wall: the men's room, the map, the payphone, the clock --- */
  const mapTex=artTex("map", 720, drawPAMap);
  const mapMat=new T.MeshStandardMaterial({map:mapTex, roughness:0.5});
  const mm=new T.Mesh(new T.PlaneGeometry(1.95,1.30), mapMat);
  mm.position.set(-3.3, FL+1.62, R.z0+0.025); scene.add(mm);
  bx("paintm", 2.07, 1.42, 0.02, -3.3, FL+1.62, R.z0+0.008, 0, 0, "#8a6a48");      // the frame, behind the map
  wallSign(0.86,0.34,(c,W,H)=>{ c.fillStyle="#7a5432"; c.fillRect(0,0,W,H); c.fillStyle="#f2f0ea";
    c.fillRect(W*0.07,H*0.14,W*0.86,H*0.72); c.fillStyle="#24408e"; fitText(c,"MEN",W*0.6,H*0.6,W/2,H/2,"700"); },
    -0.4, FL+2.68, R.z0+0.012, 0);
  wallSign(0.86,0.34,(c,W,H)=>{ c.fillStyle="#7a5432"; c.fillRect(0,0,W,H); c.fillStyle="#f2f0ea";
    c.fillRect(W*0.07,H*0.14,W*0.86,H*0.72); c.fillStyle="#24408e"; fitText(c,"WOMEN",W*0.7,H*0.6,W/2,H/2,"700"); },
    -0.4, FL+2.68, R.z1-0.012, Math.PI);
  for(const sg of [-1,1]) wallSign(0.20,0.28,(c,W,H)=>{ c.fillStyle="#6a6c6e"; c.fillRect(0,0,W,H);
      c.fillStyle="#f2f0ea"; c.font="bold "+(H*0.12|0)+"px Arial"; c.textAlign="center";
      c.fillText(sg<0?"MEN":"WOMEN", W/2, H*0.88);
      c.beginPath(); c.arc(W/2,H*0.20,W*0.09,0,7); c.fill(); c.fillRect(W*0.4,H*0.32,W*0.2,H*0.38); },
    0.55, FL+1.5, sg*(R.z1-0.012), sg<0?0:Math.PI);
  // the family room's door, and its sign
  wallSign(0.62,0.22,(c,W,H)=>{ c.fillStyle="#24408e"; c.fillRect(0,0,W,H); c.fillStyle="#f2f0ea";
    fitText(c,"FAMILY RESTROOM",W*0.85,H*0.5,W/2,H/2,"600"); }, 4.68, FL+2.62, R.z0+0.012, 0);
  // a payphone that still has a dial tone, under a little hood
  bx("steel", 0.62, 0.70, 0.30, 2.5, FL+1.55, R.z0+0.16, 0.8, 0, "#c8cacb");
  bx("steel", 0.30, 0.52, 0.12, 2.5, FL+1.45, R.z0+0.36, 0.8, 0, "#9fa3a5");
  bx("paintm", 0.08, 0.22, 0.08, 2.32, FL+1.48, R.z0+0.45, 0, 0, "#1a1a1a");
  bx("paintm", 0.66, 0.04, 0.34, 2.5, FL+1.92, R.z0+0.17, 0, 0, "#8a8c8e");
  addUse(2.5, R.z0+1.0, FL, "PICK UP THE PHONE", ()=>{
    toast(Math.random()<0.5?"…A DIAL TONE. NOBODY TO CALL":"…STATIC, AND A RECORDING ABOUT ROAD CONDITIONS","#cfe0d4");
    if(typeof AUDIO!=="undefined") AUDIO.blip("tone");
  }, 1.3);
  addCol(2.15, 2.85, R.z0, R.z0+0.45, FL+0.9, FL+2.0);
  // the clock: it keeps the game's time
  const clockC=cvs(256,256), clockTex=setSRGB(new T.CanvasTexture(clockC));
  ANIM.push({tex:clockTex, c:clockC, draw:(c)=>{
    const x=c.getContext("2d"), h=DayNight.state.hour, m=(h%1)*60;
    x.fillStyle="#f7f6f0"; x.beginPath(); x.arc(128,128,124,0,7); x.fill();
    x.lineWidth=10; x.strokeStyle="#1b1b1b"; x.stroke();
    x.fillStyle="#1b1b1b";
    for(let i=0;i<12;i++){ const a=i/12*6.283; x.save(); x.translate(128+Math.sin(a)*100,128-Math.cos(a)*100); x.rotate(a);
      x.fillRect(-3,-10,6,20); x.restore(); }
    const hand=(a,L,w)=>{ x.save(); x.translate(128,128); x.rotate(a); x.fillRect(-w/2,-L,w,L+10); x.restore(); };
    hand(((h%12)+m/60)/12*6.283, 62, 9); hand(m/60*6.283, 92, 6);
    x.fillStyle="#b3151b"; hand((Date.now()/1000%60)/60*6.283, 96, 2);
  }});
  const ck=new T.Mesh(new T.CircleGeometry(0.19, 28), new T.MeshStandardMaterial({map:clockTex, roughness:0.4}));
  ck.position.set(1.0, FL+2.95, R.z0+0.03); scene.add(ck);
  cyl("paintm", 0.20,0.20,0.04,28, 1.0, FL+2.95, R.z0+0.02, "#1b1b1b", Math.PI/2);
  // a camera dome in the corner, because there always is one
  push("paintm", domeGeo(0.09,0.07,12), -5.3, 3.5, -4.9, 0, "#f0efe9");

  /* --- the south wall: the women's room, the bulletin board, the fountain -- */
  // the board under its glass: notices, the state map, the travel line
  {
    const z=R.z1-0.05, x0=1.2, x1=3.9, y0=FL+1.0, y1=FL+2.25;
    bx("paintm", x1-x0+0.12, y1-y0+0.12, 0.06, (x0+x1)/2, (y0+y1)/2, z+0.02, 0, 0, "#d2d0c8");
    push("cork", planeGeo(x1-x0, y1-y0, 1.2), (x0+x1)/2, (y0+y1)/2, z-0.012, Math.PI, "#ffffff");
    const notices=[["KNOW BEFORE YOU GO","#1f4fa0","Dial 511 for road conditions"],
                   ["STAY HEALTHY","#2f7a3c","Wash your hands"],["SEASONAL HIRING","#b3151b","Highway maintenance"],
                   ["TICKS","#6a4a2a","Check yourself after the woods"],["DRIVE SAFE","#24408e","Rest when tired"],
                   ["LITTER","#2f7a3c","Fine up to $300"]];
    notices.forEach((n,i)=>{
      const nx=x0+0.28+(i%3)*0.62, ny=y0+0.36+Math.floor(i/3)*0.56;
      wallSign(0.46,0.40,(c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle=n[1]; c.fillRect(0,0,W,H*0.32);
        c.fillStyle="#f4f2ea"; fitText(c,n[0],W*0.86,H*0.16,W/2,H*0.16,"700");
        c.fillStyle="#333"; fitText(c,n[2],W*0.86,H*0.10,W/2,H*0.55,"400");
        c.fillStyle="#999"; for(let k=0;k<4;k++) c.fillRect(W*0.12,H*(0.68+k*0.07),W*0.76*(0.6+0.4*Math.random()),H*0.025); },
        nx, ny, z-0.018, Math.PI);
    });
    wallSign(1.30,0.40,(c,W,H)=>{ c.fillStyle="#24408e"; c.fillRect(0,0,W,H); c.strokeStyle="#7a5432"; c.lineWidth=H*0.08;
      c.strokeRect(0,0,W,H); c.fillStyle="#f2f0ea"; fitText(c,"WELCOME TO",W*0.6,H*0.22,W/2,H*0.30,"500");
      fitText(c,"CRAWFORD",W*0.8,H*0.40,W/2,H*0.62,"600"); fitText(c,"COUNTY",W*0.5,H*0.16,W/2,H*0.86,"500"); },
      (x0+x1)/2, FL+2.70, R.z1-0.012, Math.PI);
    push("glass", boxGeo(x1-x0, y1-y0, 0.01, 0), (x0+x1)/2, (y0+y1)/2, z-0.03, 0, "#e8f0f0");
  }
  // the fountain: stainless, bi-level (photograph 5)
  for(const [x,h] of [[2.15,FL+0.98],[2.85,FL+0.80]]){
    const zw=R.z1;
    bx("steel", 0.46, 0.14, 0.30, x, h-0.07, zw-0.15, 0.8, 0, "#dadcdd");                     // the basin, square at the wall
    push("steel", new T.CylinderGeometry(0.23,0.23,0.14,20,1,false,Math.PI/2,Math.PI), x, h-0.07, zw-0.30, 0, "#dadcdd");   // rounded front
    push("paintm", new T.CylinderGeometry(0.19,0.19,0.01,20,1,false,Math.PI/2,Math.PI), x, h+0.002, zw-0.30, 0, "#5f6467");
    bx("paintm", 0.38, 0.01, 0.20, x, h+0.002, zw-0.17, 0, 0, "#5f6467");                    // the bowl, dark
    cyl("chrome", 0.012,0.016, 0.07, 10, x+0.06, h+0.03, zw-0.26, "#d0d3d4");               // bubbler
    push("chrome", new T.SphereGeometry(0.018,8,6), x+0.06, h+0.065, zw-0.26, 0, "#d0d3d4");
    bx("steel", 0.30, 0.04, 0.03, x, h-0.06, zw-0.54, 0.8, 0, "#c8cbcc");                     // push bar
    bx("steel", 0.40, h-FL-0.30, 0.10, x, (h-0.14+FL+0.16)/2, zw-0.05, 0.8, 0, "#bfc2c4");   // the wall box under it
  }
  bx("steel", 0.36, 0.42, 0.22, 2.15, FL+0.21, R.z1-0.11, 0.8, 0, "#b4b7b9");                // the chiller cabinet
  for(let k=0;k<6;k++) bx("paintm", 0.30, 0.012, 0.01, 2.15, FL+0.08+k*0.05, R.z1-0.225, 0, 0, "#6b7073");
  addCol(1.88, 3.12, R.z1-0.5, R.z1, FL-0.5, FL+1.1);
  addUse(2.5, R.z1-0.9, FL, "TAKE A DRINK", ()=>toast("COLD, AND IT TASTES LIKE THE PIPE","#cfe0d4"), 1.2);

  /* --- the information desk, the racks (photographs 5, 16) ---------------- */
  {
    const x0=-5.30, x1=-2.40, z0=3.90, z1=4.60;
    bx("paintm", x1-x0, 1.00, z1-z0, (x0+x1)/2, FL+0.50, (z0+z1)/2, 0, 0, "#7f98ab");         // blue-grey front
    bx("paintm", x1-x0+0.10, 0.05, z1-z0+0.14, (x0+x1)/2, FL+1.025, (z0+z1)/2-0.04, 0, 0, "#b8473a"); // red top
    bx("paintm", x1-x0, 0.10, 0.03, (x0+x1)/2, FL+0.05, z0-0.015, 0, 0, "#4a3a30");           // kick
    addCol(x0, x1, z0-0.1, z1, FL-0.5, FL+1.05);
    // the chair behind it, pushed in, and the panels on the wall over it
    bx("paintm", 0.48, 0.06, 0.46, -3.85, FL+0.50, 4.98, 0, 0, "#2a2a2c");
    bx("paintm", 0.46, 0.55, 0.06, -3.85, FL+0.82, 5.22, 0, 0, "#2a2a2c");
    cyl("chrome", 0.025,0.025, 0.44, 6, -3.85, FL+0.25, 4.98, "#9a9a96");
    addSeat(-3.85, 4.98, FL+0.55, 0, "THE ATTENDANT'S CHAIR");
    const panels=[["PLAN THE PERFECT GETAWAY","#1f4fa0"],["WELCOME · ERIE","#1f4fa0"]];
    panels.forEach((p,i)=>wallSign(1.30,0.62,(c,W,H)=>{ c.fillStyle=p[1]; c.fillRect(0,0,W,H);
      for(let k=0;k<6;k++){ c.fillStyle=["#3a7bd5","#e0a52a","#3f8a4c","#c3562f","#5aa0d8","#d9d2c0"][k];
        c.fillRect(W*(0.05+(k%3)*0.31),H*(0.36+Math.floor(k/3)*0.30),W*0.27,H*0.25); }
      c.fillStyle="#f2f0ea"; fitText(c,p[0],W*0.9,H*0.18,W/2,H*0.16,"600"); },
      -4.6+i*1.42, FL+1.85, R.z1-0.012, Math.PI));
  }
  // the blue revolving rack, full of brochures
  {
    const x=-4.6, z=-3.6;
    cyl("paintm", 0.30,0.30,0.06,16, x, FL+0.03, z, "#2b4fa0");
    cyl("paintm", 0.04,0.04,1.85,8, x, FL+0.98, z, "#2b4fa0");
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2;
      push("paintm", boxGeo(0.02, 1.70, 0.46, 0), x+Math.cos(a)*0.12, FL+1.0, z+Math.sin(a)*0.12, -a, "#2b4fa0");
      for(let s=0;s<5;s++) for(let j=0;j<2;j++)
        push("pic:brochure", boxGeo(0.02, 0.28, 0.13, 0), x+Math.cos(a)*0.24+Math.sin(a)*(j?0.09:-0.09)*0.0,
             FL+0.42+s*0.32, z+Math.sin(a)*0.24+(j?0.08:-0.08)*Math.cos(a), -a, ["#ffffff","#f0e6d8","#e6eef6"][(s+j+k)%3]);
    }
    push("paintm", boxGeo(0.62,0.28,0.62,0), x, FL+1.98, z, 0.3, "#2b4fa0");
    addCol(x-0.34, x+0.34, z-0.34, z+0.34, FL-0.5, FL+2.1);
    addUse(x+0.6, z, FL, "TAKE A BROCHURE", ()=>{
      const b=["PRESQUE ISLE STATE PARK","PYMATUNING SPILLWAY · FEED THE CARP","DRAKE WELL MUSEUM","CONNEAUT LAKE",
               "ERIE'S BAYFRONT","ALLEGHENY NATIONAL FOREST","COVERED BRIDGES OF CRAWFORD COUNTY","THE KINZUA BRIDGE"];
      toast(b[(Math.random()*b.length)|0],"#f4c430");
    }, 1.3);
  }
  // a wall rack of them by the front door, wood, three tiers
  {
    const x=R.x0+0.08, z0=-4.9, z1=-2.6;
    bx("beam", 0.12, 1.30, z1-z0, x+0.04, FL+1.25, (z0+z1)/2, 0.6, 0, "#8a6a48");
    for(let t=0;t<3;t++) for(let k=0;k<6;k++)
      push("pic:brochure", boxGeo(0.02, 0.24, 0.30, 0), x+0.13, FL+0.80+t*0.40, z0+0.22+k*0.37, 0,
           ["#ffffff","#f0e6d8","#e6eef6","#f6eadf"][(t*6+k)%4]);
  }
  // trash cans by the entries: grey, swing-top (photograph 4)
  swingCan(-1.7, -4.9, 0); swingCan(0.9, 4.85, Math.PI); swingCan(3.62, 4.88, Math.PI);
  // the floor sign that is always out
  wetFloor(-0.1, -4.6, 0.5);
})();

/* the state, on a wall: the outline, the interstates, the counties */
function drawPAMap(x,W,H){
  x.fillStyle="#d8e6ef"; x.fillRect(0,0,W,H);
  const P=[[0.08,0.10],[0.16,0.10],[0.22,0.03],[0.24,0.10],[0.78,0.10],[0.80,0.16],[0.86,0.24],[0.90,0.30],
           [0.88,0.40],[0.93,0.48],[0.92,0.56],[0.96,0.64],[0.90,0.72],[0.86,0.82],[0.80,0.90],[0.08,0.90]];
  x.beginPath(); P.forEach((p,i)=>{ const X=p[0]*W, Y=p[1]*H; i?x.lineTo(X,Y):x.moveTo(X,Y); }); x.closePath();
  x.fillStyle="#f3eccb"; x.fill(); x.strokeStyle="#5a5040"; x.lineWidth=3; x.stroke();
  x.save(); x.clip();
  x.strokeStyle="rgba(120,110,90,0.35)"; x.lineWidth=1;
  for(let i=0;i<40;i++){ x.beginPath(); x.moveTo(Math.random()*W, Math.random()*H);
    for(let k=0;k<4;k++) x.lineTo(Math.random()*W, Math.random()*H); x.stroke(); }
  // interstates: 79 north-south in the west, 80 across, 81 and 76
  const road=(pts,c,w)=>{ x.strokeStyle=c; x.lineWidth=w; x.beginPath();
    pts.forEach((p,i)=>i?x.lineTo(p[0]*W,p[1]*H):x.moveTo(p[0]*W,p[1]*H)); x.stroke(); };
  road([[0.19,0.06],[0.18,0.30],[0.16,0.55],[0.17,0.92]],"#b3151b",5);
  road([[0.06,0.38],[0.40,0.36],[0.70,0.40],[0.92,0.46]],"#24408e",5);
  road([[0.06,0.68],[0.30,0.70],[0.55,0.72],[0.82,0.62],[0.94,0.62]],"#24408e",4);
  road([[0.62,0.92],[0.70,0.60],[0.82,0.30],[0.86,0.18]],"#24408e",4);
  x.restore();
  x.fillStyle="#b3151b"; x.beginPath(); x.arc(0.185*W,0.22*H,7,0,7); x.fill();
  x.fillStyle="#222"; x.font="bold "+(H*0.045|0)+"px Arial"; x.fillText("YOU ARE HERE", 0.22*W, 0.225*H);
  x.font="bold "+(H*0.07|0)+"px Georgia"; x.fillStyle="#3a3428"; x.fillText("PENNSYLVANIA", 0.34*W, 0.62*H);
}
/* =======================================================================
   THE RESTROOMS — one plan, mirrored. sg = -1 is the men's (north),
   +1 the women's (south). Named anchors:
     ENTRY    the opening from the lobby, x -1.0..0.2
     SCREEN   the privacy wall, |z| 7.55..7.75, x -1.9..3.2: you come in,
              face tile, and turn west round its end
     VANITY   on the screen's lobby side, x 0.6..3.0, in the alcove
     STALLS   along the far wall, |z| 12.65..14.2
     URINALS  the men's west wall, |z| 10.6..13.6
     DRYERS   the east wall (x = 3.2), |z| 8.8..11.6, with the white
              panels between them and the changing station (photograph 18)
   LANE: x -4.7..-1.9 from the alcove into the room, kept clear.
   ======================================================================= */
(function restrooms(){
  for(const sg of [-1,1]){
    const Z=v=>sg*v;                                   // |z| to world z
    const zr=(a,b)=>[Math.min(Z(a),Z(b)), Math.max(Z(a),Z(b))];
    const men=sg<0, name=men?"MEN'S ROOM":"WOMEN'S ROOM";
    const X0=-4.70, X1=3.20, ZI=5.65, ZF=14.20, SCR0=7.55, SCR1=7.75;
    const ENT={a:-1.00, b:0.20, sill:Y0, head:FL+2.20};
    const TT=FL+2.10;                                 // top of the tile
    const [za,zb]=zr(ZI,ZF);
    addZone(X0, X1, za, zb, FL-0.5, CEIL+0.3, name, true);
    // floor, and the drain in the middle of it
    floorAt("mosaic", X0, X1, za, zb, FL+0.004, "#ffffff", 0.8);
    push("steel", new T.CircleGeometry(0.09,16), -0.8, FL+0.006, Z(11.0), 0, "#8e9294", -Math.PI/2, 0);
    // tile to 2.1 on every face, painted block over it (photograph 18)
    const wallFace=(axis,f,dir,a,b,open)=>{
      (axis==="x"?lineX:lineZ)("ytile", f, dir, a, b, FL, TT, open, TILE, 1.16);
      (axis==="x"?lineX:lineZ)("block", f, dir, a, b, TT, CEIL, open, BLOCKC, 0.6, 0.004);
      // a cove base of darker tile, and the bullnose cap at the top of the tile
      (axis==="x"?lineX:lineZ)("ytile", f, dir, a, b, FL, FL+0.12, open, "#d8c48c", 1.16, 0.010);
      const capOpen=(open||[]).map(o=>({a:o.a,b:o.b,sill:-9,head:99}));
      (axis==="x"?lineX:lineZ)("ytile", f, dir, a, b, TT-0.03, TT+0.012, capOpen, "#e8d9a8", 1.16, 0.012);
    };
    wallFace("x", Z(ZI), sg, X0, X1, [ENT]);          // the lobby side
    wallFace("x", Z(ZF), -sg, X0, X1, []);            // the far wall
    wallFace("z", X0, 1, za, zb, [{a:Math.min(Z(6.6),Z(13.6)), b:Math.max(Z(6.6),Z(13.6)), sill:FL+2.25, head:FL+2.78}]);
    wallFace("z", X1, -1, za, zb, []);
    // the privacy screen: a short wall the full height, tiled both faces
    runX("block", Z((SCR0+SCR1)/2), SCR1-SCR0, -1.9, X1, Y0, CEIL+0.02, [], BLOCKC, 0.6);
    wallFace("x", Z(SCR0), -sg, -1.9, X1, []);
    wallFace("x", Z(SCR1), sg, -1.9, X1, []);
    lineZ("ytile", -1.9, -1, ...zr(SCR0,SCR1), FL, TT, [], TILE, 1.16);
    lineZ("block", -1.9, -1, ...zr(SCR0,SCR1), TT, CEIL, [], BLOCKC, 0.6);
    // lights: wrap-around fluorescents; the men's has the bad ballast
    const fix=(x,z,flick)=>{
      bx("paintm", 0.34, 0.08, 1.24, x, CEIL-0.04, z, 0, 0, "#e6e6e2");
      push("tube", boxGeo(0.28, 0.02, 1.16, 0), x, CEIL-0.085, z, 0, "#ffffff");
      LAMPS.push({x:x, y:CEIL-0.25, z:z, color:0xf2f6f2, intensity:0.82, dist:7.5, decay:1.4, indoor:true,
                  flicker:!!flick, vol:[X0-0.2, X1+0.2, za-0.2, zb+0.2, FL-1, CEIL+0.5]});
    };
    fix(1.6, Z(6.6)); fix(-3.3, Z(9.6), men); fix(-0.4, Z(11.2)); fix(1.6, Z(13.3));

    /* --- the vanity, in the alcove behind the screen -------------------- */
    {
      const zf=Z(SCR0), d=sg*-0.56, cz=zf+d/2;
      bx("paintm", 2.40, 0.05, 0.58, 1.80, FL+0.86, cz, 0, 0, "#d9cfba");               // the top
      bx("paintm", 2.40, 0.16, 0.04, 1.80, FL+0.79, zf+d, 0, 0, "#cbbf9f");             // apron
      for(const x of [0.95, 1.80, 2.65]){
        push("porcelain", new T.CylinderGeometry(0.19,0.15,0.10,18,1,true), x, FL+0.83, cz-sg*0.02, 0, PORC);
        push("porcelain", new T.CircleGeometry(0.16,18), x, FL+0.79, cz-sg*0.02, 0, "#d8d6d0", -Math.PI/2, 0);
        cyl("chrome", 0.022,0.026, 0.16, 8, x, FL+0.95, zf-sg*0.08, "#c9cbcc");
        push("chrome", new T.CylinderGeometry(0.018,0.018,0.12,8), x, FL+1.02, zf-sg*0.13, 0, "#c9cbcc", Math.PI/2, 0);
        addUse(x, zf+sg*-1.1, FL, "WASH YOUR HANDS", ()=>toast("THE SENSOR TAKES A SECOND TO NOTICE YOU","#cfe0d4"), 0.7);
      }
      push("mirror", planeGeo(2.30, 0.92, 0), 1.80, FL+1.52, zf-sg*0.012, sg<0?0:Math.PI, "#ffffff");
      bx("steel", 2.36, 0.98, 0.012, 1.80, FL+1.52, zf-sg*0.006, 0.8, 0, "#cfd2d3");
      bx("paintm", 0.10, 0.30, 0.10, 0.45, FL+1.20, zf-sg*0.05, 0, 0, "#e8e8e4");        // soap
      addCol(0.55, 3.2, Math.min(zf,zf+d), Math.max(zf,zf+d), FL-0.5, FL+0.9);
    }
    /* --- the stalls, along the far wall ---------------------------------- */
    const SD=1.70, zfrt=ZF-SD;                              // stall depth, front line
    const stalls = men ? [[-0.40,0.55],[0.55,1.50],[1.50,3.20]]
                       : [[-3.25,-2.30],[-2.30,-1.35],[-1.35,-0.40],[-0.40,0.55],[0.55,1.50],[1.50,3.20]];
    const PY0=FL+0.30, PY1=FL+1.80;
    stalls.forEach(([a,b],i)=>{
      // the dividing panel on the west side of each stall (and the east side of the last)
      for(const x of (i===0?[a]:[]).concat(b<X1-0.01?[b]:[]))
        push("paintm", boxGeo(0.026, PY1-PY0, SD-0.05, 0), x, (PY0+PY1)/2, Z(ZF-SD/2-0.02), 0, PART);
      // pilasters each side of the door, a headrail across
      const wide=(b-a)>1.2, dw=wide?0.90:0.64, da=b-0.04-dw-0.03;
      for(const x of [a+0.06, da-0.03, b-0.04])
        if(x<X1-0.05) bx("paintm", 0.06, 1.85, 0.04, x, FL+0.925, Z(zfrt), 0, 0, PART);
      bx("paintm", Math.max(0.05,da-0.06-a), PY1-PY0, 0.026, (a+0.03+da-0.03)/2, (PY0+PY1)/2, Z(zfrt), 0, 0, PART);
      bx("steel", b-a, 0.04, 0.05, (a+b)/2, FL+1.87, Z(zfrt), 0.8, 0, "#c4c7c8");
      // the door, opening in, resting a little open the way they do
      makeDoor(sg<0 ? XF(da+dw, Z(zfrt), Math.PI) : XF(da, Z(zfrt), 0), 0, PY0, 0, "STALL", true,
               0.12+((i*7)%5)*0.06, wide?"stallw":"stall", 0xbcae90);
      // what is in it: the bowl and its flushometer, the paper, and in the
      // women's a little steel bin on the partition
      const tx=(a+b)/2+(wide?0.25:0);
      toiletFix(tx, Z(ZF), sg<0?0:Math.PI, men?"#1d1d1e":"#f4f3ef");
      push("paintm", new T.CylinderGeometry(0.17,0.17,0.12,20), a+0.09, FL+0.70, Z(ZF-0.66), 0, "#b9bdc0", 0, 0, Math.PI/2);
      push("paintm", new T.CylinderGeometry(0.11,0.11,0.01,16), a+0.155, FL+0.70, Z(ZF-0.66), 0, "#3a3d40", 0, 0, Math.PI/2);
      push("paintm", boxGeo(0.06,0.10,0.24,0), a+0.10, FL+0.55, Z(ZF-0.66), 0, "#e9e8e3");
      if(!men){ bx("steel", 0.10, 0.28, 0.26, b-0.07, FL+0.62, Z(ZF-0.40), 0.8, 0, "#cfd2d3");
                bx("paintm", 0.012, 0.04, 0.22, b-0.124, FL+0.74, Z(ZF-0.40), 0, 0, "#8a8d90"); }
      if(wide){ // grab bars, and a sign on the door that says so
        push("steel", new T.CylinderGeometry(0.02,0.02,0.9,8), X1-0.05, FL+0.86, Z(ZF-0.75), 0, "#c8cacb", Math.PI/2, 0);
        push("steel", new T.CylinderGeometry(0.02,0.02,0.9,8), tx, FL+0.86, Z(ZF-0.05), 0, "#c8cacb", 0, Math.PI/2);
        for(const dx of [-0.42,0.42]) push("steel", new T.CylinderGeometry(0.035,0.035,0.05,10), tx+dx, FL+0.86, Z(ZF-0.025), 0, "#c8cacb", Math.PI/2, 0);
      }
      addCol(tx-0.2, tx+0.2, Math.min(Z(ZF),Z(ZF-0.68)), Math.max(Z(ZF),Z(ZF-0.68)), FL-0.5, FL+0.45);
      if(wide) addSeat(tx, Z(ZF-0.44), FL+0.45, sg<0?Math.PI:0, "THE ACCESSIBLE STALL");
      // the partitions' hardware: chrome shoes on the pilasters, brackets at the wall
      for(const x of [a+0.06, da-0.03, b-0.04]) if(x<X1-0.05) bx("chrome", 0.09, 0.10, 0.07, x, FL+0.05, Z(zfrt), 0, 0, "#c9cbcc");
      for(const x of (i===0?[a]:[]).concat(b<X1-0.01?[b]:[])) for(const y of [PY0+0.18, PY1-0.18]){
        bx("chrome", 0.06, 0.05, 0.05, x, y, Z(ZF-0.03), 0, 0, "#c9cbcc");
        bx("chrome", 0.06, 0.05, 0.05, x, y, Z(zfrt+0.04), 0, 0, "#c9cbcc");
      }
      // the partitions are solid; the doors are leaves and are not
      addCol(a-0.02, a+0.02, ...zr(zfrt, ZF), PY0, PY1);
    });
    addCol(X1-0.05, X1, ...zr(zfrt,ZF), PY0, PY1);
    for(const [a,b] of stalls){
      const dw=((b-a)>1.2?0.90:0.64), da=b-0.04-dw-0.03;
      addCol(a, da-0.03, ...zr(zfrt-0.03, zfrt+0.03), FL-0.5, PY1);
      addCol(b-0.07, b, ...zr(zfrt-0.03, zfrt+0.03), FL-0.5, PY1+0.05);
    }
    /* --- urinals, the men's west wall; a bench and changer in the women's -- */
    if(men){
      for(let k=0;k<3;k++){
        const z=Z(10.9+k*1.05);
        urinalFix(X0+0.008, z, Math.PI/2, k===0?0.17:0);                     // the near one low, for a child or a chair
        if(k<2){
          const zs=Z(11.42+k*1.05);
          push("paintm", boxGeo(0.48, 1.10, 0.03, 0), X0+0.25, FL+0.97, zs, 0, PART);
          push("paintm", boxGeo(0.012, 1.10, 0.034, 0), X0+0.49, FL+0.97, zs, 0, "#a99c7e");
          for(const y of [FL+0.62, FL+1.32]) bx("chrome", 0.05, 0.06, 0.07, X0+0.03, y, zs, 0, 0, "#c9cbcc");
        }
        addCol(X0, X0+0.42, z-0.22, z+0.22, FL+0.2, FL+1.25);
      }
      wetFloor(-3.2, Z(8.6), 1.2);
    }else{
      bx("beam", 0.40, 0.06, 1.2, -4.48, FL+0.46, Z(11.0), 0.6, 0, "#8a6a48");
      for(const z of [10.5,11.5]) bx("steel", 0.36, 0.44, 0.05, -4.48, FL+0.22, Z(z), 0.8, 0, "#b9bcbe");
      addCol(-4.70, -4.26, ...zr(10.38,11.62), FL-0.5, FL+0.5);
      addSeat(-4.48, Z(11.0), FL+0.50, -Math.PI/2, "THE BENCH");
    }
    /* --- the east wall: dryers between white panels, the changing station -- */
    {
      const x=X1-0.006;
      for(const z of [8.75, 10.25, 11.75]) bx("paintm", 0.02, 2.30, 0.42, x-0.01, FL+1.15, Z(z), 0, 0, "#eceae4");
      for(const z of [9.5, 11.0]){
        bx("steel", 0.012, 0.50, 0.62, x-0.006, FL+1.30, Z(z), 0.8, 0, "#c9ccce");
        push("steel", new FaceGeo().slab([V3(x-0.02,FL+1.48,Z(z)-0.15),V3(x-0.02,FL+1.48,Z(z)+0.15),V3(x-0.20,FL+1.40,Z(z)+0.15),V3(x-0.20,FL+1.40,Z(z)-0.15)],0.30).geo(),
             0,0,0, 0, "#d6d9da");
        bx("paintm", 0.10, 0.03, 0.18, x-0.10, FL+1.10, Z(z), 0, 0, "#3a3c3e");
        addUse(x-0.7, Z(z), FL, "DRY YOUR HANDS", ()=>{ toast("WHRRRRRRRRRR","#cfe0d4");
          if(typeof AUDIO!=="undefined") AUDIO.blip("dryer"); }, 0.9);
        addCol(x-0.22, x, Z(z)-0.18, Z(z)+0.18, FL+1.1, FL+1.55);
      }
      // the changing station, folded up, with a pictogram where the brand goes
      const cz=Z(12.0);
      bx("paintm", 0.12, 0.92, 0.56, x-0.07, FL+1.10, Math.max(-14,Math.min(14,cz)), 0, 0, "#e9e6dc");
      const pic=signTex(128,128,(c,W,H)=>{ c.fillStyle="#2d5fb0"; c.beginPath(); c.arc(W/2,H/2,W*0.46,0,7); c.fill();
        c.fillStyle="#f4f2ea"; c.beginPath(); c.arc(W*0.36,H*0.32,W*0.08,0,7); c.fill();
        c.fillRect(W*0.30,H*0.42,W*0.12,H*0.30); c.fillRect(W*0.40,H*0.55,W*0.34,H*0.06);
        c.beginPath(); c.arc(W*0.70,H*0.48,W*0.06,0,7); c.fill(); });
      signPanel(0.18,0.18,pic, x-0.135, FL+1.30, cz, -Math.PI/2);
      addCol(x-0.15, x, cz-0.3, cz+0.3, FL+0.6, FL+1.6);
      // the bins: a white step can and the grey swing-top (photograph 18)
      bx("paintm", 0.30, 0.50, 0.30, x-0.30, FL+0.25, Z(10.25), 0, 0, "#efeee9");
      bx("rubber", 0.40, 0.02, 0.40, x-0.30, FL+0.01, Z(10.25), 0, 0, "#262626");
      addCol(x-0.48, x-0.12, Z(10.25)-0.18, Z(10.25)+0.18, FL-0.5, FL+0.52);
      swingCan(x-0.30, Z(8.3), -Math.PI/2);
    }
    // the convector cabinet low on the west wall, by the way in (photograph 18)
    bx("paintm", 0.22, 0.62, 1.10, X0+0.11, FL+0.40, Z(8.4), 0, 0, "#e8e6df");
    for(let k=0;k<5;k++) bx("paintm", 0.03, 0.03, 0.9, X0+0.23, FL+0.18+k*0.05, Z(8.4), 0, 0, "#b8b6ae");
    addCol(X0, X0+0.24, Z(8.4)-0.56, Z(8.4)+0.56, FL-0.5, FL+0.72);
  }
})();

/* =======================================================================
   THE SMALL ROOMS: the family restroom (north) and the staff office (south),
   off the lobby; the janitor's closet and the mechanical room behind them,
   with doors to the back.
   ======================================================================= */
(function smallRooms(){
  for(const sg of [-1,1]){
    const Z=v=>sg*v, zr=(a,b)=>[Math.min(Z(a),Z(b)), Math.max(Z(a),Z(b))];
    const fam=sg<0;
    // front room: x 3.5..6.7, |z| 5.65..8.4
    const [a0,a1]=zr(5.65,8.4);
    addZone(3.5, 6.7, a0, a1, FL-0.5, CEIL+0.3, fam?"FAMILY RESTROOM":"STAFF ONLY", true);
    floorAt(fam?"mosaic":"quarry", 3.5, 6.7, a0, a1, FL+0.004, "#ffffff", 0.8);
    for(const [axis,f,dir,a,b] of [["x",Z(5.65),sg,3.5,6.7],["x",Z(8.4),-sg,3.5,6.7],["z",3.5,1,a0,a1],["z",6.7,-1,a0,a1]]){
      const open = (axis==="x" && Math.abs(f)<6) ? [{a:4.2,b:5.16,sill:Y0,head:FL+2.14}] : [];
      (axis==="x"?lineX:lineZ)(fam?"ytile":"plaster", f, dir, a, b, FL, fam?FL+2.1:CEIL, open, fam?TILE:"#d9d4c4", fam?1.16:0.5);
      if(fam) (axis==="x"?lineX:lineZ)("block", f, dir, a, b, FL+2.1, CEIL, open, BLOCKC, 0.6, 0.004);
    }
    const fx=5.1, fz=Z(7.0);
    bx("paintm", 0.34, 0.08, 1.24, fx, CEIL-0.04, fz, 0, 0, "#e6e6e2");
    push("tube", boxGeo(0.28, 0.02, 1.16, 0), fx, CEIL-0.085, fz, 0, "#ffffff");
    LAMPS.push({x:fx, y:CEIL-0.25, z:fz, color:0xf2f6f2, intensity:0.7, dist:5.5, decay:1.4, indoor:true,
                vol:[3.4, 6.8, a0-0.1, a1+0.1, FL-1, CEIL+0.5]});
    if(fam){
      // a toilet, a sink, a changing table that folds down, grab bars
      push("porcelain", new T.CylinderGeometry(0.18,0.14,0.36,16), 6.3, FL+0.22, Z(7.4), 0, PORC);
      push("porcelain", boxGeo(0.24,0.62,0.40,0), 6.58, FL+0.75, Z(7.4), 0, PORC);
      push("porcelain", new T.TorusGeometry(0.17,0.035,8,18), 6.26, FL+0.41, Z(7.4), 0, "#f4f3ef", Math.PI/2, 0);
      addCol(6.1, 6.7, Z(7.4)-0.22, Z(7.4)+0.22, FL-0.5, FL+0.5);
      addSeat(6.26, Z(7.4), FL+0.45, Math.PI/2, "THE FAMILY ROOM'S TOILET");
      push("porcelain", boxGeo(0.50,0.18,0.42,0), 3.78, FL+0.84, Z(7.6), 0, PORC);
      push("mirror", planeGeo(0.6,0.9,0), 3.507, FL+1.55, Z(7.6), Math.PI/2, "#ffffff");
      addCol(3.5, 4.0, Z(7.6)-0.27, Z(7.6)+0.27, FL+0.5, FL+0.95);
      bx("steel", 0.04,0.04,0.9, 6.66, FL+0.86, Z(6.6), 0.8, 0, "#c8cacb");
      bx("paintm", 0.12, 0.92, 0.56, 4.4, FL+1.10, Z(8.33), 0, 0, "#e9e6dc");
    }else{
      // the attendant's office: a desk, a chair, a monitor of the cameras,
      // lockers, a calendar nobody has turned since spring
      bx("beam", 1.40, 0.04, 0.70, 5.9, FL+0.76, Z(7.8), 0.6, 0, "#8a6a48");
      for(const [x,z] of [[5.25,7.5],[6.55,7.5],[5.25,8.1],[6.55,8.1]]) bx("paintm",0.04,0.74,0.04,x,FL+0.37,Z(z),0,0,"#3a3a3a");
      bx("paintm", 0.52, 0.34, 0.04, 5.9, FL+1.02, Z(8.06), 0, 0, "#1a1a1a");
      push("cctv", planeGeo(0.47,0.29,0), 5.9, FL+1.02, Z(8.06)-sg*0.022, sg<0?0:Math.PI, "#ffffff");
      bx("paintm", 0.06, 0.16, 0.06, 5.9, FL+0.85, Z(8.10), 0, 0, "#1a1a1a");
      bx("paintm", 0.22, 0.015, 0.16, 5.9, FL+0.785, Z(8.10), 0, 0, "#1a1a1a");
      addCol(5.15, 6.65, ...zr(7.4,8.2), FL-0.5, FL+0.8);
      // what is on the desk: keyboard, mouse, a phone, a mug, the papers, the radios charging
      bx("paintm", 0.44, 0.02, 0.15, 5.9, FL+0.79, Z(7.66), 0, 0, "#2a2a2a");
      bx("paintm", 0.06, 0.025, 0.10, 6.25, FL+0.79, Z(7.66), 0, 0, "#2a2a2a");
      bx("paintm", 0.19, 0.06, 0.21, 5.38, FL+0.81, Z(7.80), 0, 0, "#2b2b2b");
      bx("paintm", 0.05, 0.04, 0.20, 5.32, FL+0.86, Z(7.80), 0, 0, "#1f1f1f");
      cyl("porcelain", 0.04,0.035,0.10,12, 6.42, FL+0.83, Z(7.62), "#f2f0ea");
      push("paintm", new T.CircleGeometry(0.034,12), 6.42, FL+0.875, Z(7.62), 0, "#3a2414", -Math.PI/2, 0);
      for(let k=0;k<5;k++) bx("paintm", 0.22, 0.006, 0.30, 5.50+(k%2)*0.02, FL+0.785+k*0.007, Z(8.0)+(k%3)*0.01*sg, 0, 0.05*k, k===4?"#f6e8a8":"#f4f3ee");
      bx("paintm", 0.30, 0.06, 0.12, 6.40, FL+0.81, Z(8.17), 0, 0, "#2a2b2d");
      for(const dx of [-0.08,0.0,0.08]) bx("paintm", 0.05, 0.20, 0.04, 6.40+dx, FL+0.92, Z(8.17), 0, 0, "#181818");
      // the drawers under it
      bx("paintm", 0.40, 0.70, 0.60, 6.38, FL+0.36, Z(7.85), 0, 0, "#5d6266");
      for(let k=0;k<3;k++) bx("paintm", 0.14, 0.02, 0.02, 6.38, FL+0.20+k*0.22, Z(7.54), 0, 0, "#b9bcbe");
      // a proper office chair on its mat: five legs, a cylinder, the seat and its back
      bx("paintm", 1.0, 0.006, 1.0, 5.9, FL+0.006, Z(7.05), 0, 0, "#4a4c4e");
      for(let k=0;k<5;k++){ const a=k/5*Math.PI*2;
        push("paintm", boxGeo(0.30,0.03,0.04,0), 5.9+Math.cos(a)*0.15, FL+0.06, Z(7.1)+Math.sin(a)*0.15, -a, "#1d1d1f");
        push("paintm", new T.SphereGeometry(0.028,8,6), 5.9+Math.cos(a)*0.29, FL+0.03, Z(7.1)+Math.sin(a)*0.29, 0, "#1d1d1f"); }
      cyl("chrome", 0.025,0.025, 0.36, 10, 5.9, FL+0.25, Z(7.1), "#9a9a96");
      bx("paintm", 0.48, 0.08, 0.46, 5.9, FL+0.48, Z(7.1), 0, 0, "#2a2a2c");
      bx("paintm", 0.44, 0.50, 0.06, 5.9, FL+0.86, Z(7.1)-sg*0.25, 0, 0, "#2a2a2c");
      bx("paintm", 0.04, 0.30, 0.04, 5.9, FL+0.58, Z(7.1)-sg*0.24, 0, 0, "#1d1d1f");
      for(const s of [-1,1]) bx("paintm", 0.04, 0.04, 0.26, 5.9+s*0.25, FL+0.66, Z(7.1), 0, 0, "#1d1d1f");
      addSeat(5.9, Z(7.1), FL+0.52, sg>0?Math.PI:0, "THE ATTENDANT'S OTHER CHAIR");
      // a four-drawer file in the corner, a fridge and a microwave on the west wall
      bx("paintm", 0.62, 1.32, 0.38, 6.38, FL+0.66, Z(5.94), 0, 0, "#8c9396");
      for(let k=0;k<4;k++){ bx("paintm", 0.01, 0.005, 0.36, 6.065, FL+0.33+k*0.33, Z(5.94), 0, 0, "#5f6568");
        bx("chrome", 0.03, 0.03, 0.12, 6.055, FL+0.20+k*0.33, Z(5.94), 0, 0, "#c9cbcc"); }
      addCol(6.06, 6.7, ...zr(5.74,6.14), FL-0.5, FL+1.35);
      bx("paintm", 0.48, 0.84, 0.50, 3.75, FL+0.42, Z(8.06), 0, 0, "#e9e8e2");
      bx("paintm", 0.02, 0.40, 0.03, 3.995, FL+0.55, Z(7.88), 0, 0, "#9fa3a5");
      bx("paintm", 0.44, 0.27, 0.36, 3.75, FL+0.98, Z(8.06), 0, 0, "#2b2c2e");
      bx("paintm", 0.01, 0.18, 0.24, 3.97, FL+0.98, Z(8.10), 0, 0, "#0e0f10");
      addCol(3.5, 4.0, ...zr(7.80,8.32), FL-0.5, FL+1.1);
      // on the walls: the whiteboard by the door, a safety poster, a clock, first aid, the keys, an extinguisher
      wallSign(1.20,0.80,(c,W,H)=>{ c.fillStyle="#fbfbf8"; c.fillRect(0,0,W,H); c.strokeStyle="#9a9c9e"; c.lineWidth=10; c.strokeRect(0,0,W,H);
        c.fillStyle="#1d3b8a"; c.font="600 "+(H*0.085|0)+"px Arial"; c.textAlign="left";
        ["ROUNDS: 6A · 10A · 2P · 6P · 10P","MEN'S #2 — FLUSH VALVE, CALLED IN","MOW THE GROVE — FRI","DUMPSTER PICKUP TUES / SAT"].forEach((s,i)=>c.fillText(s,W*0.06,H*(0.18+i*0.16)));
        c.fillStyle="#b3151b"; c.fillText("PENNDOT D-1 MAINT: 814-555-0142",W*0.06,H*0.86); },
        5.95, FL+1.55, Z(5.65)+sg*0.012, sg>0?0:Math.PI);
      wallSign(0.60,0.80,(c,W,H)=>{ c.fillStyle="#f2b418"; c.fillRect(0,0,W,H); c.fillStyle="#1a1a1a";
        fitHwy(c,"WORK ZONE",W*0.86,H*0.12,W/2,H*0.14); fitHwy(c,"SAFETY",W*0.7,H*0.12,W/2,H*0.28);
        c.beginPath(); c.moveTo(W/2,H*0.40); c.lineTo(W*0.82,H*0.80); c.lineTo(W*0.18,H*0.80); c.closePath(); c.fill();
        c.fillStyle="#f2b418"; c.fillRect(W*0.47,H*0.52,W*0.06,H*0.16); c.fillRect(W*0.47,H*0.71,W*0.06,H*0.05);
        c.fillStyle="#1a1a1a"; fitText(c,"Slow down. Our workers' lives depend on it.",W*0.9,H*0.04,W/2,H*0.92,"600"); },
        5.0, FL+1.65, Z(8.4)-sg*0.012, sg>0?Math.PI:0);
      bx("paintm", 0.30, 0.36, 0.10, 6.64, FL+1.45, Z(6.45), 0, 0, "#f4f3ee");
      bx("paintm", 0.012, 0.16, 0.05, 6.585, FL+1.47, Z(6.45), 0, 0, "#c41a1a");
      bx("paintm", 0.012, 0.05, 0.16, 6.585, FL+1.47, Z(6.45), 0, 0, "#c41a1a");
      bx("steel", 0.08, 0.40, 0.30, 6.66, FL+1.55, Z(7.95), 0.8, 0, "#cfd2d3");
      cyl("paintm", 0.075,0.075, 0.46, 14, 3.62, FL+0.95, Z(5.98), "#b3151b");
      cyl("paintm", 0.03,0.03, 0.08, 8, 3.62, FL+1.22, Z(5.98), "#1a1a1a");
      for(let k=0;k<3;k++) bx("paintm", 0.45, 1.80, 0.40, 3.75, FL+0.90, Z(6.5+k*0.42), 0, 0, "#6f7c84");
      addCol(3.5, 4.0, ...zr(6.28,7.56), FL-0.5, FL+1.85);
      wallSign(0.42,0.56,(c,W,H)=>{ c.fillStyle="#f6f4ec"; c.fillRect(0,0,W,H); c.fillStyle="#3f6f3a";
        c.fillRect(0,0,W,H*0.42); c.fillStyle="#222"; fitText(c,"APRIL",W*0.6,H*0.1,W/2,H*0.5,"600");
        c.strokeStyle="#bbb"; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(W*0.08,H*(0.58+i*0.07)); c.lineTo(W*0.92,H*(0.58+i*0.07)); c.stroke(); } },
        6.69, FL+1.6, Z(7.0), -Math.PI/2);
    }
    // hinged at the end that lets the leaf swing into the room, not the lobby
    makeDoor(sg<0 ? XF(5.12, Z(BLD.lz), Math.PI) : XF(4.24, Z(BLD.lz), 0), 0, FL+0.02, 0,
             fam?"FAMILY RESTROOM":"STAFF ONLY", true, fam?0:0.28, "closet", fam?0x8a7a68:0x7a6a5a);
    if(!fam) wallSign(0.56,0.20,(c,W,H)=>{ c.fillStyle="#6a5a48"; c.fillRect(0,0,W,H); c.fillStyle="#f2f0ea";
      fitText(c,"STAFF ONLY",W*0.85,H*0.5,W/2,H/2,"600"); }, 4.68, FL+2.62, LOBBY.z1-0.012, Math.PI);
    // back room: x 3.5..6.7, |z| 8.7..14.2
    const [b0,b1]=zr(8.7,14.2);
    addZone(3.5, 6.7, b0, b1, FL-0.5, CEIL+0.3, fam?"JANITOR'S CLOSET":"MECHANICAL ROOM", true);
    floorAt("concrete", 3.5, 6.7, b0, b1, FL+0.004, "#bdb8ae", 0.6);
    for(const [axis,f,dir,a,b] of [["x",Z(8.7),sg,3.5,6.7],["x",Z(14.2),-sg,3.5,6.7],["z",3.5,1,b0,b1],["z",6.7,-1,b0,b1]]){
      const open = (axis==="z" && f>6) ? [{a:Math.min(Z(11.0),Z(11.96)), b:Math.max(Z(11.0),Z(11.96)), sill:Y0, head:FL+2.14}] : [];
      (axis==="x"?lineX:lineZ)("block", f, dir, a, b, FL, CEIL, open, "#b7b8b4", 0.6);
    }
    const bxz=Z(11.4);
    bx("paintm", 0.34, 0.08, 1.24, 4.6, CEIL-0.04, bxz, 0, 0, "#e6e6e2");
    push("tube", boxGeo(0.28, 0.02, 1.16, 0), 4.6, CEIL-0.085, bxz, 0, "#ffffff");
    LAMPS.push({x:4.6, y:CEIL-0.25, z:bxz, color:0xeef4f0, intensity:0.55, dist:6, decay:1.4, indoor:true,
                vol:[3.4, 6.8, b0-0.1, b1+0.1, FL-1, CEIL+0.5]});
    if(fam){
      /* the janitor's closet: the mop sink in the corner with its faucet and
         hose, the rack of mops and brooms, the wringer bucket, shelves of
         paper and soap and chemicals, the cart, a ladder, the water heater */
      bx("paintm", 0.72, 0.28, 0.72, 3.95, FL+0.14, Z(13.75), 0, 0, "#d2cfc6");
      bx("paintm", 0.60, 0.012, 0.60, 3.95, FL+0.285, Z(13.75), 0, 0, "#5b5953");
      cyl("chrome", 0.016,0.016, 0.22, 8, 3.95, FL+1.00, Z(14.13), "#c9cbcc", Math.PI/2);
      cyl("chrome", 0.025,0.025, 0.16, 10, 3.95, FL+0.92, Z(14.03), "#c9cbcc");
      for(const dx of [-0.10,0.10]) push("paintm", new T.CylinderGeometry(0.025,0.025,0.03,8), 3.95+dx, FL+1.0, Z(14.13), 0, dx<0?"#b3151b":"#24408e", Math.PI/2, 0);
      push("paintm", new T.TorusGeometry(0.16,0.018,6,16), 4.42, FL+1.05, Z(14.17), 0, "#2a5a3a");
      bx("paintm", 1.20, 0.05, 0.05, 5.10, FL+1.52, Z(14.15), 0, 0, "#8a8c8e");
      [["mop",4.65],["broom",4.95],["mop",5.25],["push",5.55]].forEach(([k,x])=>{
        cyl("beam", 0.014,0.014, 1.40, 6, x, FL+0.80, Z(14.10), "#c8a676");
        if(k==="mop") bx("paintm", 0.20, 0.22, 0.10, x, FL+0.12, Z(14.08), 0, 0, "#e9e4d4");
        else if(k==="broom") bx("paintm", 0.30, 0.16, 0.06, x, FL+0.10, Z(14.10), 0, 0, "#c06a2a");
        else bx("paintm", 0.46, 0.06, 0.08, x, FL+0.06, Z(14.08), 0, 0, "#2a2a2a");
      });
      bx("paintm", 0.42, 0.36, 0.34, 4.95, FL+0.27, Z(13.30), 0, 0, "#e3b81e");
      bx("paintm", 0.30, 0.18, 0.20, 4.95, FL+0.52, Z(13.22), 0, 0, "#6a6e70");
      cyl("beam", 0.014,0.014, 1.10, 6, 5.05, FL+0.95, Z(13.36), "#c8c8c4", 0.15);
      for(const [dx,dz] of [[-0.16,-0.12],[0.16,-0.12],[-0.16,0.12],[0.16,0.12]]) push("paintm", new T.SphereGeometry(0.03,6,5), 4.95+dx, FL+0.03, Z(13.30)+dz, 0, "#1d1d1f");
      addCol(4.7, 5.2, ...zr(13.08,13.52), FL-0.5, FL+0.7);
      for(let k=0;k<4;k++) bx("paintm", 0.40, 0.03, 1.6, 3.75, FL+0.4+k*0.45, Z(11.6), 0, 0, "#8a8c8e");
      for(const [x,z] of [[3.57,10.82],[3.93,10.82],[3.57,12.38],[3.93,12.38]]) bx("paintm", 0.03, 1.80, 0.03, x, FL+0.90, Z(z), 0, 0, "#7c7e80");
      // stock: jumbo rolls, towel rolls, soap cases, jugs and spray bottles, cardboard
      for(let s=0;s<4;s++) for(let k=0;k<4;k++){
        const y=FL+0.415+s*0.45, z=Z(10.98+k*0.40), kind=(s*4+k)%5;
        if(kind===0){ for(const dz of [-0.09,0.09]) push("paintm", new T.CylinderGeometry(0.11,0.11,0.09,14), 3.75, y+0.055, z+dz, 0, "#f6f5f0", Math.PI/2, 0); }
        else if(kind===1){ for(const dz of [-0.08,0.08]) cyl("paintm", 0.08,0.08,0.22,12, 3.75, y+0.11, z+dz, "#f1ede2"); }
        else if(kind===2){ bx("paintm", 0.30, 0.24, 0.34, 3.75, y+0.12, z, 0, 0, "#b48d5c"); bx("paintm", 0.31, 0.06, 0.20, 3.75, y+0.16, z, 0, 0, "#e9e4d4"); }
        else if(kind===3){ for(const [dz,c] of [[-0.11,"#e07a1f"],[0.0,"#2d7fc2"],[0.11,"#3d9a4a"]]){ bx("paintm", 0.12, 0.24, 0.09, 3.75, y+0.12, z+dz, 0, 0, c); cyl("paintm",0.02,0.02,0.03,6, 3.75, y+0.255, z+dz, "#f2f0ea"); } }
        else { for(const [dz,c] of [[-0.10,"#d23a3a"],[0.0,"#2f9a8a"],[0.10,"#e8c22a"]]){ cyl("paintm", 0.04,0.045,0.20,10, 3.75, y+0.10, z+dz, c); bx("paintm", 0.03, 0.06, 0.05, 3.77, y+0.23, z+dz, 0, 0, "#f2f0ea"); } }
      }
      // the cart by the end wall: a grey body, its yellow bag hoop, bottles on it
      bx("paintm", 0.95, 0.70, 0.45, 6.15, FL+0.45, Z(13.85), 0, 0, "#6f7376");
      push("paintm", new T.CylinderGeometry(0.22,0.22,0.62,16,1,true), 5.55, FL+0.42, Z(13.85), 0, "#e3c21e");
      for(const [dx,c] of [[-0.2,"#2d7fc2"],[0.0,"#e07a1f"],[0.2,"#d23a3a"]]) cyl("paintm", 0.04,0.045,0.20,10, 6.15+dx, FL+0.90, Z(13.85), c);
      addCol(5.30, 6.65, ...zr(13.6,14.1), FL-0.5, FL+0.85);
      // the ladder, leaning, and the wet-floor signs folded by the shelves
      for(const dx of [-0.20,0.20]) push("paintm", boxGeo(0.04, 2.10, 0.06, 0), 5.40+dx, FL+1.03, Z(8.90), 0, "#c9a227", -sg*0.20, 0);
      for(let k=0;k<7;k++){ const y=0.20+k*0.27; push("paintm", boxGeo(0.40, 0.025, 0.03, 0), 5.40, FL+y, Z(8.90)+(y-1.03)*Math.sin(-sg*0.20), 0, "#b8911f", -sg*0.20, 0); }
      addCol(5.15, 5.65, ...zr(8.72,9.15), FL-0.5, FL+2.0);
      for(const dz of [0.0,0.05]) push("paintm", boxGeo(0.02, 0.62, 0.30, 0), 3.58+dz, FL+0.31, Z(10.30), 0, "#f2c418", 0, 0.12);
      push("paintm", new T.CircleGeometry(0.09,16), 4.6, FL+0.006, Z(12.6), 0, "#6a6c6e", -Math.PI/2, 0);
      wallSign(0.30,0.40,(c,W,H)=>{ c.fillStyle="#c41a1a"; c.fillRect(0,0,W,H); c.fillStyle="#f2f0ea"; fitText(c,"SDS",W*0.7,H*0.24,W/2,H*0.30,"700");
        fitText(c,"SAFETY DATA",W*0.86,H*0.10,W/2,H*0.62,"600"); fitText(c,"SHEETS",W*0.7,H*0.10,W/2,H*0.76,"600"); }, 3.51, FL+1.55, Z(9.6), Math.PI/2);
      cyl("paintm", 0.30,0.30,1.6,16, 6.25, FL+0.8, Z(9.2), "#d9d6cd");
      for(const dx of [-0.12,0.12]) cyl("paintm", 0.02,0.02,1.0,8, 6.25+dx, FL+2.1, Z(9.2), dx<0?"#b5763a":"#b5763a");
      addCol(3.6, 4.3, ...zr(13.35,14.2), FL-0.5, FL+0.4);
      addCol(5.95, 6.7, ...zr(8.9,9.5), FL-0.5, FL+1.7);
      addCol(3.5, 4.0, ...zr(10.7,12.5), FL-0.5, FL+2.0);
    }else{
      // a pressure tank, the electrical panels, a sewage alarm with its red lamp
      cyl("paintm", 0.32,0.32,1.4,18, 4.0, FL+0.7, Z(13.6), "#3b5a8a");
      for(let k=0;k<3;k++) bx("paintm", 0.12, 0.90, 0.55, 6.62, FL+1.4, Z(9.4+k*0.7), 0, 0, "#9a9e9f");
      push("ledamber", boxGeo(0.04,0.06,0.06,0), 6.55, FL+1.9, Z(9.4), 0, "#ffffff");
      push("exitsign", new T.SphereGeometry(0.05,8,6), 6.6, FL+2.1, Z(10.8), 0, "#ffffff");
      addCol(3.65, 4.35, ...zr(13.25,14.2), FL-0.5, FL+1.5);
    }
  }
})();

/* =======================================================================
   OUTSIDE THE DOORS: the planters, the bench, the notices (photographs
   7, 10, 11)
   ======================================================================= */
(function outside(){
  // a low brick planter either side of the storefront, flowers in it
  for(const sg of [-1,1]){
    const z0=sg*2.5, z1=sg*5.4, za=Math.min(z0,z1), zb=Math.max(z0,z1), x0=-8.9, x1=-6.25;
    const H=FL+0.62;
    wallBox("brick", x0, x1, za, za+0.24, FL-0.1, H, BRICK, 0.83);
    wallBox("brick", x0, x1, zb-0.24, zb, FL-0.1, H, BRICK, 0.83);
    wallBox("brick", x0, x0+0.24, za, zb, FL-0.1, H, BRICK, 0.83);
    bx("concrete", x1-x0+0.06, 0.06, 0.32, (x0+x1)/2, H+0.03, za+0.12, 0.6, 0, "#b9b5ab");
    bx("concrete", x1-x0+0.06, 0.06, 0.32, (x0+x1)/2, H+0.03, zb-0.12, 0.6, 0, "#b9b5ab");
    bx("concrete", 0.32, 0.06, zb-za, x0+0.12, H+0.03, (za+zb)/2, 0.6, 0, "#b9b5ab");
    push("mulchbed", planeGeo(x1-x0-0.24, zb-za-0.48, 0.5), (x0+x1)/2+0.12, H-0.06, (za+zb)/2, 0, "#ffffff", -Math.PI/2, 0);
    addCol(x0, x1, za, zb, FL-0.5, H+0.05);
    FOREST.plant("bush", -7.9, sg*3.4, {y:H-0.06, scale:0.8, solid:false, lean:false});
    FOREST.plant("bush", -7.4, sg*4.6, {y:H-0.06, scale:0.7, solid:false, lean:false});
    // impatiens: red, white, pink, in a band along the front
    for(let k=0;k<26;k++){
      const fx=x0+0.35+hash2(k,sg)*0.5, fz=za+0.35+((k*0.11)%(zb-za-0.7));
      push("paintm", new T.SphereGeometry(0.07,6,4), fx, H+0.02, fz, 0, ["#d8203a","#f3f0ea","#e86a9a","#c8102e"][k%4]);
    }
  }
  // the notices by the door, on the brick
  wallSign(0.66,0.66,(c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.strokeStyle="#24408e";
    c.lineWidth=W*0.03; c.strokeRect(W*0.03,H*0.03,W*0.94,H*0.94); c.fillStyle="#24408e";
    ["RESTROOMS","VENDING","TELEPHONES","INSIDE"].forEach((t,i)=>fitText(c,t,W*0.8,H*0.15,W/2,H*(0.2+i*0.2),"600")); },
    -6.012, FL+1.75, -2.35, -Math.PI/2);
  wallSign(0.34,0.24,(c,W,H)=>{ c.fillStyle="#f4f2ea"; c.fillRect(0,0,W,H); c.fillStyle="#b3151b";
    c.fillRect(0,0,W,H*0.04); c.fillStyle="#222";
    ["This Building Observes","⊘ No Smoking","⊘ No Pets","Shirt & Shoes Required"].forEach((t,i)=>fitText(c,t,W*0.86,H*0.15,W/2,H*(0.18+i*0.22),i?"500":"700")); },
    -6.012, FL+1.55, 2.3, -Math.PI/2);
  // a bench under the eave and a cigarette post by the door
  const bench=(x,z,ry)=>{
    const c=Math.cos(ry), s=Math.sin(ry);
    push("paintm", boxGeo(1.8, 0.05, 0.42, 0), x, FL+0.46, z, ry, "#4b3b2f");
    push("paintm", boxGeo(1.8, 0.40, 0.04, 0), x-s*0.20, FL+0.70, z-c*0.20, ry, "#4b3b2f");
    for(const d of [-0.8,0.8]) push("paintm", boxGeo(0.05, 0.46, 0.42, 0), x+c*d, FL+0.23, z-s*d, ry, "#2c2622");
    const hx=Math.abs(c)*0.9+Math.abs(s)*0.25, hz=Math.abs(s)*0.9+Math.abs(c)*0.25;
    addCol(x-hx, x+hx, z-hz, z+hz, FL-0.5, FL+0.5);
    addSeat(x, z, FL+0.50, ry+Math.PI, "THE BENCH BY THE DOOR");
  };
  bench(-5.55, -8.2, -Math.PI/2);
  bench(-5.55, 8.2, -Math.PI/2);
  cyl("paintm", 0.12,0.14,0.95,12, -6.6, FL+0.48, -2.2, "#3a3a38");
  addCol(-6.75,-6.45,-2.35,-2.05,FL-0.5,FL+1.0);
  // the domed bins out front (photograph 6)
  for(const [x,z] of [[-9.6,6.8],[-9.6,-6.8],[-20.4,0]]){
    cyl("paintm", 0.32,0.30,0.92,16, x, FL+0.46, z, "#2b2d2e");
    push("paintm", domeGeo(0.33,0.22,16), x, FL+0.92, z, 0, "#2b2d2e", Math.PI, 0);
    bx("paintm", 0.30,0.14,0.05, x-0.31, FL+0.98, z, 0, 0, "#141516");
    addCol(x-0.34,x+0.34,z-0.34,z+0.34,FL-0.5,FL+1.2);
  }
  // orange cones: the photographs are full of them
  const cone=(x,z,y)=>{
    push("paintm", new T.ConeGeometry(0.15,0.70,14), x, (y||FL)+0.37, z, 0, "#e4571c");
    push("paintm", new T.CylinderGeometry(0.105,0.126,0.10,14), x, (y||FL)+0.42, z, 0, "#efede6");
    bx("paintm", 0.38,0.03,0.38, x, (y||FL)+0.015, z, 0, 0, "#c9471a");
  };
  cone(-8.6,-1.8); cone(-8.4,2.0); cone(-21.2,-11.5,PLAZA_Y); cone(-6.4,-12.2); cone(-34.0,-12.5,PAVE_T);
  // a concrete walk from the back porch out to the loop path
  bx("concrete", 9.0, 0.30, 1.4, 11.5, FL-0.15, 0, 0.66, 0, "#c3c0b8");
  addFlat(6.9, 16.1, -0.75, 0.75, FL);
})();

// the vending fronts: pictures that light up, the artwork itself what glows
const vendArt=(head,tint,rows,snack)=>(x,W,H)=>{
  x.fillStyle="#141518"; x.fillRect(0,0,W,H);
  const g=x.createLinearGradient(0,0,W,0); g.addColorStop(0,tint); g.addColorStop(1,"#2b1a4a");
  x.fillStyle=g; x.fillRect(W*0.04,H*0.03,W*0.92,H*0.16);
  x.fillStyle="#f6f1e2"; fitText(x,head, W*0.8, H*0.08, W/2, H*0.11, "700");
  for(let r=0;r<rows;r++) for(let c2=0;c2<(snack?5:4);c2++){
    const n=snack?5:4, bw=W*0.78/n, bh=H*(0.60/rows)*0.62;
    const px2=W*0.10+c2*bw, py=H*0.24+r*(H*0.62/rows);
    x.fillStyle=["#c3562f","#3f6ea8","#4f9a4a","#e0b52a","#8a3f9e","#d8d2c0","#2a8ad0"][(r*5+c2)%7];
    if(snack) x.fillRect(px2+bw*0.1, py, bw*0.8, bh);
    else { x.beginPath(); x.roundRect ? x.roundRect(px2+bw*0.25, py, bw*0.5, bh, 6) : x.rect(px2+bw*0.25, py, bw*0.5, bh); x.fill();
           x.fillStyle="rgba(255,255,255,0.35)"; x.fillRect(px2+bw*0.30, py+bh*0.1, bw*0.08, bh*0.7); }
    x.fillStyle="#3a3c40"; x.fillRect(px2, py+bh+H*0.01, bw*0.95, H*0.012);
  }
  x.fillStyle="#26282b"; x.fillRect(W*0.06,H*0.90,W*0.88,H*0.07);
};
const picGlowMat=(key,long,draw,kind)=>{
  const tex=artTex(key,long,draw);
  const m=new T.MeshStandardMaterial({color:0xffffff, roughness:0.35, map:tex,
    emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0});
  GLOW.push({m:m, base:new T.Color(0xffffff), kind:kind||"indoor", baseInt:0.30});
  return m;
};
bucketOf("pic:vend:soda",  ()=>picGlowMat("vend:soda", 512, vendArt("COLD DRINKS","#7a2fb0",4,false)));
bucketOf("pic:vend:snack", ()=>picGlowMat("vend:snack", 512, vendArt("SNACKS","#b8332a",5,true)));
bucketOf("pic:brochure",   ()=>new T.MeshStandardMaterial({map:artTex("brochure",256,(x,W,H)=>{
  const r=_trng(71);
  for(let i=0;i<4;i++){ x.fillStyle=["#2f6aa8","#3f8a4c","#c3562f","#e0a52a"][i]; x.fillRect(0,i*H/4,W,H/4);
    x.fillStyle="rgba(255,255,255,0.8)"; x.fillRect(W*0.1,i*H/4+H*0.03,W*0.8,H*0.04); }
}), roughness:0.6}));
