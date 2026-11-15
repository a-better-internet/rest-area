"use strict";
/* REST AREA · 14z2-ranch.js
   The stone house: a fieldstone-and-siding ranch in the woods past French Creek Pines
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14z2 · THE STONE HOUSE
   On west past the trailer park US 6N goes on through the woods, and on
   the south side a circle of concrete drive goes round an island of
   boulders and tall grass to a long brown ranch house: fieldstone on the
   garage's gable, round the front porch and on the bump-out of the
   bedroom wing, brown siding everywhere else, a dark shingle roof. A
   weeping cherry in a stone planter by the porch, a flag on its pole on
   the lawn, the woods all round.
   Everything is walkable. The two-car garage (lift doors, a car in one
   bay, the bench and the pegboard, the shelves, a kayak up on the rafters)
   steps up into the mudroom and laundry; the dining room and the living
   room with its stone fireplace are at the front, the kitchen with its
   island at the back; the bedroom wing has its hall, an office, two
   bedrooms and two baths. From the mudroom the stair goes down to the
   finished basement: a rec room with a sectional and a big TV, a wet bar,
   a card table, a pool table in the game room, a guest room and a bath, the mechanical room. It is
   underground and lit the same at every hour.
   Out the back the patio door opens on the pool deck: an oval in-ground
   pool inside a black aluminium fence, its water the lake's own kind
   (14n): the same wind-ripple normals read twice and drifting, the sky in
   it, but clear, so you see the plaster and the waterline tile under it.
   Built in world coordinates with 14z's wall kit (WESTPARK.kit).
   ---------------------------------------------------------------------- */
const RANCH={routes:{}, flow:new T.Vector4(), pool:null, lamps:[]};
(function stoneHouse(){
  const KT=WESTPARK.kit, R=WEST.ranch, Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw;
  const groups={}; let ME=null;
  const use=(k)=>{ ME=groups[k]||(groups[k]=[]); };
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.02,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||roundSegs(r)),x,y,z,c,rx,ry,rz);
  const CT=(r0,r1,h,x,y,z,c,seg)=>ent(new T.CylinderGeometry(r0,r1,h,seg||16),x,y,z,c);
  const S=(r,x,y,z,c,sx,sy,sz)=>{ const g=new T.SphereGeometry(r, 14, 10); if(sx) g.scale(sx, sy, sz); ent(g,x,y,z,c); };
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length(); if(L<1e-4) return;
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const q=_trng(4877);

  /* ---- the textures: brown lap siding, fieldstone, shingle-dark trim, hardwood, tile, carpet, concrete, the pool's plaster ---- */
  const tx=(k, w, h, draw, rough)=>bucketOf(k, ()=>{ const t=signTex(w, h, draw); t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial({map:t, roughness:rough||0.8}); });
  tx("rn_siding", 128, 128, (c,Wd,Hh)=>{ c.fillStyle="#f0ece6"; c.fillRect(0,0,Wd,Hh); const r=_trng(12);
    for(let y=0;y<Hh;y+=16){ const g=c.createLinearGradient(0,y,0,y+16); g.addColorStop(0,"#fbf8f2"); g.addColorStop(0.85,"#e2ddd4"); g.addColorStop(1,"#a8a198"); c.fillStyle=g; c.fillRect(0,y,Wd,16);
      for(let k=0;k<20;k++){ c.fillStyle="rgba(120,100,80,0.06)"; c.fillRect(r()*Wd, y+2+r()*10, 8+r()*30, 1); } } }, 0.62);
  tx("rn_stone", 256, 256, (c,Wd,Hh)=>{ const r=_trng(4877);
    // fieldstone: flat-faced river stones, browns and greys and rust, packed tight in grey mortar, each a little different
    c.fillStyle="#6a6258"; c.fillRect(0,0,Wd,Hh);
    const cols=["#8a7a64","#7a6a58","#9a8a72","#726a60","#a08060","#7c6e60","#66605a","#94785a","#867a6e","#a88a6a","#5e5852","#8e8478"];
    const stone=(x, y, rw, rh, a, col)=>{ c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle="#4a443e"; c.beginPath(); c.ellipse(0, 0, rw+2.5, rh+2.5, 0, 0, 7); c.fill();
      const g=c.createLinearGradient(-rw, -rh, rw, rh); g.addColorStop(0, col); g.addColorStop(1, "#4e4840"); c.fillStyle=col; c.beginPath(); c.ellipse(0, 0, rw, rh, 0, 0, 7); c.fill();
      c.globalAlpha=0.35; c.fillStyle=g; c.fill(); c.globalAlpha=1;
      for(let k=0;k<14;k++){ c.fillStyle="rgba("+(r()<0.5?"30,25,20":"240,225,200")+","+(0.08+r()*0.1).toFixed(2)+")"; c.fillRect((r()-0.5)*rw*1.4, (r()-0.5)*rh*1.4, 1+r()*3, 1+r()*2); }
      c.restore(); };
    for(let row=0, y=10; y<Hh+20; row++){ const rh=9+r()*6; let x=(row%2)*14-10;
      while(x<Wd+20){ const rw=12+r()*14, col=cols[(r()*cols.length)|0];
        for(const [ox, oy] of [[0,0],[Wd,0],[-Wd,0],[0,Hh],[0,-Hh],[Wd,Hh],[-Wd,-Hh]]) stone(x+rw+ox, y+(r()-0.5)*4+oy, rw, rh, (r()-0.5)*0.3, col);
        x+=rw*2+2+r()*3; }
      y+=rh*2+2; }
    for(let k=0;k<2000;k++){ c.fillStyle="rgba("+(r()<0.5?"0,0,0":"255,240,220")+","+(r()*0.06).toFixed(3)+")"; c.fillRect(r()*Wd, r()*Hh, 1, 1); } }, 0.92);
  tx("rn_wood", 256, 128, (c,Wd,Hh)=>{ const r=_trng(301); for(let y=0;y<Hh;y+=16){ const sh=["#a87a4a","#9a6c40","#b2824e","#94683c","#a47446"][(y/16)%5];
      c.fillStyle=sh; c.fillRect(0, y, Wd, 16); for(let k=0;k<30;k++){ c.fillStyle="rgba(60,30,10,"+(0.05+r()*0.1).toFixed(2)+")"; c.fillRect(r()*Wd, y+1+r()*14, 10+r()*50, 1); }
      c.fillStyle="rgba(40,20,8,0.45)"; c.fillRect(0, y+15, Wd, 1); const j=(y*37)%Wd; c.fillRect(j, y, 1, 16); c.fillRect((j+130)%Wd, y, 1, 16); } }, 0.45);
  tx("rn_tile", 128, 128, (c,Wd,Hh)=>{ const r=_trng(77); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ c.fillStyle=["#d8d2c4","#ccc6b8","#d2ccbe"][(i*3+j)%3]; c.fillRect(i*32, j*32, 32, 32);
      for(let k=0;k<40;k++){ c.fillStyle="rgba(120,110,90,0.08)"; c.fillRect(i*32+r()*32, j*32+r()*32, 2, 2); } }
    c.fillStyle="#9a9286"; for(let i=0;i<=4;i++){ c.fillRect(i*32-1, 0, 2, Hh); c.fillRect(0, i*32-1, Wd, 2); } }, 0.35);
  tx("rn_carpet", 64, 64, (c,Wd,Hh)=>{ const r=_trng(5); c.fillStyle="#c8bca8"; c.fillRect(0,0,Wd,Hh); for(let k=0;k<900;k++){ c.fillStyle=r()<0.5 ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)"; c.fillRect(r()*Wd, r()*Hh, 1, 1); } }, 1.0);
  tx("rn_conc", 256, 256, (c,Wd,Hh)=>{ const r=_trng(9); c.fillStyle="#9e9a90"; c.fillRect(0,0,Wd,Hh);
    for(let k=0;k<4000;k++){ c.fillStyle="rgba("+(r()<0.5?"60,55,45":"255,255,250")+","+(r()*0.10).toFixed(3)+")"; c.fillRect(r()*Wd, r()*Hh, 1+r()*2, 1); }
    c.strokeStyle="rgba(70,64,56,0.55)"; c.lineWidth=2; c.strokeRect(1, 1, Wd-2, Hh-2);
    c.strokeStyle="rgba(70,64,56,0.25)"; c.lineWidth=1; c.beginPath(); c.moveTo(40, 0); c.lineTo(70, 90); c.lineTo(58, 150); c.stroke(); }, 0.9);
  tx("rn_pool", 128, 256, (c,Wd,Hh)=>{ const r=_trng(33); c.fillStyle="#9ad6e4"; c.fillRect(0,0,Wd,Hh);
    for(let k=0;k<1500;k++){ c.fillStyle="rgba("+(r()<0.5?"40,110,140":"255,255,255")+","+(r()*0.12).toFixed(3)+")"; c.fillRect(r()*Wd, r()*Hh, 1+r()*3, 1+r()*3); }
    // the waterline tile: a band of small dark-blue squares along the top (v near 1, the wall's top)
    for(let i=0;i<8;i++) for(let j=0;j<2;j++){ c.fillStyle=(i+j)%2 ? "#1e4a7a" : "#265a8e"; c.fillRect(i*16+1, j*16+1, 14, 14); }
    c.fillStyle="#e8f2f2"; c.fillRect(0, 32, Wd, 2); }, 0.55);
  bucketOf("rn_drive", ()=>{ const t=signTex(256, 256, (c,Wd,Hh)=>{ const r=_trng(19); c.fillStyle="#9c988e"; c.fillRect(0,0,Wd,Hh);
      for(let k=0;k<5000;k++){ c.fillStyle="rgba("+(r()<0.5?"60,55,45":"255,255,250")+","+(r()*0.11).toFixed(3)+")"; c.fillRect(r()*Wd, r()*Hh, 1+r()*2, 1); }
      c.strokeStyle="rgba(60,56,50,0.5)"; c.lineWidth=2; c.beginPath(); c.moveTo(0,1); c.lineTo(Wd,1); c.moveTo(1,0); c.lineTo(1,Hh); c.stroke();
      c.strokeStyle="rgba(60,56,50,0.3)"; c.lineWidth=1; c.beginPath(); c.moveTo(30,40); c.lineTo(90,70); c.lineTo(120,140); c.moveTo(180,200); c.lineTo(230,180); c.stroke(); });
    t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial(Object.assign({map:t, roughness:0.92}, _po(-2))); });
  bucketOf("rn_drive2", ()=>{ const b=BUCKETS.get("rn_drive"); const m=b.makeMat(); m.polygonOffsetFactor=-3; m.polygonOffsetUnits=-6; return m; });
  bucketOf("rn_glow", ()=>emitMat(0xfff2dc, 0.95, "indoor"));
  bucketOf("rn_lamp", ()=>emitMat(0xffdca8, 1.0, "night"));

  /* ---- the wall kit: a wall t thick centred on c, its colliders round the openings; a liner; a window ---- */
  function wall(bk, ax, c, t, a, b, y0, y1, ops, col, floorY, uvs){
    KT.vslab(bk, ax, c-t/2, KT.pieces(a, b, y0, y1, KT.holesIn(ops, a, b, y0, y1)), t, 1, col, uvs||0.5);
    const sunk=floorY!==undefined && y0<=floorY+0.3 ? y0-0.5 : y0, cl=(p0, p1, q0, q1)=>ax==="x" ? addCol(p0, p1, c-t/2, c+t/2, q0, q1) : addCol(c-t/2, c+t/2, p0, p1, q0, q1);
    for(const sp of _spans(a, b, ops)){ if(!sp.o){ cl(sp.a, sp.b, sunk, y1); continue; }
      if(sp.o.sill>y0+0.01) cl(sp.a, sp.b, sunk, sp.o.sill); if(sp.o.head<y1-0.01) cl(sp.a, sp.b, sp.o.head, y1); } }
  const liner=(bk, ax, fc, dir, a, b, y0, y1, ops, col, uvs)=>KT.vliner(bk, ax, fc, KT.pieces(a, b, y0, y1, KT.holesIn(ops||[], a, b, y0, y1)), dir, col, uvs||0.5);
  const gable=(bk, ax, c, t, a, b, y0, apex, col, dir)=>KT.vslab(bk, ax, c-t/2, [[[a, y0], [b, y0], [(a+b)/2, apex]]], t, 1, col, 0.5);
  function win(ax, c, t, o, out, trim, cur){
    const w=o.b-o.a, h=o.head-o.sill, m=(o.a+o.b)/2, ym=(o.sill+o.head)/2, P=(s, d)=>ax==="x" ? [s, d] : [d, s];
    push("glass", planeGeo(w-0.02, h-0.02, 0), ax==="x" ? m : c, ym, ax==="x" ? c : m, ax==="x" ? 0 : Math.PI/2, "#ffffff");
    const fo=c+out*(t/2+0.032), fi=c-out*(t/2+0.02);
    for(const [ww, hh, ds, dy] of [[w+0.18, 0.08, 0, h/2+0.04],[w+0.18, 0.07, 0, -h/2-0.035],[0.08, h, -w/2-0.04, 0],[0.08, h, w/2+0.04, 0]]){
      const [px, pz]=P(m+ds, fo); RB(ax==="x" ? ww : 0.045, hh, ax==="x" ? 0.045 : ww, px, ym+dy, pz, trim, 0, 0.012); }
    // the muntins: a cross in each sash
    { const [px, pz]=P(m, c+out*0.022); B(ax==="x" ? w-0.04 : 0.02, 0.025, ax==="x" ? 0.02 : w-0.04, px, ym, pz, "#f2efe8"); B(ax==="x" ? 0.025 : 0.02, h-0.04, ax==="x" ? 0.02 : 0.025, px, ym, pz, "#f2efe8"); }
    { const [px, pz]=P(m, fi-out*0.035); RB(ax==="x" ? w+0.08 : 0.12, 0.035, ax==="x" ? 0.12 : w+0.08, px, o.sill-0.018, pz, "#efe9de", 0, 0.01); }
    if(cur) for(const sd of [-1,1]){ const [px, pz]=P(m+sd*(w/2-0.02), fi-out*0.07); RB(ax==="x" ? 0.30 : 0.05, h+0.3, ax==="x" ? 0.05 : 0.30, px, ym+0.08, pz, cur, 0, 0.02); }
    if(cur){ const [px, pz]=P(m, fi-out*0.09); C(0.012, w+0.7, px, o.head+0.2, pz, "#5a4a3a", 8, ax==="x" ? 0 : Math.PI/2, 0, ax==="x" ? Math.PI/2 : 0); } }
  // furniture in a frame of its own: x across, z out from its back, ry the way it faces (14z's F)
  const Fr=(x, z, ry, fy)=>{ const xf=XF(x, z, ry); return { b:(w,h,d,lx,ly,lz,c)=>B(w,h,d, xf.x(lx,lz), fy+ly, xf.z(lx,lz), c, ry),
    f:(w,h,d,lx,ly,lz,c,rad)=>RB(w,h,d, xf.x(lx,lz), fy+ly, xf.z(lx,lz), c, ry, rad||0.04),
    c:(r,h,lx,ly,lz,c,seg)=>C(r,h, xf.x(lx,lz), fy+ly, xf.z(lx,lz), c, seg),
    col:(w,dd,lx,lz,h)=>{ const px=xf.x(lx,lz), pz=xf.z(lx,lz), sw=Math.abs(Math.sin(ry))>0.5; addCol(px-(sw?dd:w)/2, px+(sw?dd:w)/2, pz-(sw?w:dd)/2, pz+(sw?w:dd)/2, fy-0.06, fy+(h||0.9)); },
    seat:(lx,lz,label,drop)=>addSeat(xf.x(lx,lz), xf.z(lx,lz), fy, ry+Math.PI, label, false, drop), x:(lx,lz)=>xf.x(lx,lz), z:(lx,lz)=>xf.z(lx,lz) }; };
  const faceN=Math.PI, faceS=0, faceE=Math.PI/2, faceW=-Math.PI/2;
  const lampIn=(x, y, z, vol, k, col)=>{ const o={x:x, y:y, z:z, color:col||0xffe6c4, intensity:k||0.55, dist:6, decay:1.5, indoor:true, vol:vol}; LAMPS.push(o); return o; };

  /* ======================================================================
     THE PLAN (world x east, z south; the front faces the road, north)
     ====================================================================== */
  const FY=Y+0.55, CL=FY+2.6, EV=CL+0.25, GY=Y+0.10, BF=Y-2.35, BCL=Y+0.12, WT=0.2, PT=0.12, PY=FY-0.17;
  const WX0=-1440, WX1=-1432, WZ0=-1164, WZ1=-1152;                      // the bedroom wing
  const CX0=-1432, CX1=-1420, CZ0=-1162, CZ1=-1152;                      // the middle: living, dining, kitchen, mudroom (the porch in front of it)
  const GX0=-1420, GX1=-1412.4, GZ0=-1164.8, GZ1=-1152;                  // the garage
  const BX0=-1439.4, BX1=-1435.4, BZ0=-1165.4;                           // the stone bump-out on the wing's front
  const SID="#6e5c52", STN="#ffffff", TRIM="#4a3a32", WALLC="#ece4d6";
  const SWX0=-1423.92, SWX1=-1422.78, SWZ0=-1156.6, SWZ1=-1152.3;        // the basement stair's well, in the mudroom
  RANCH.box={x0:WX0, x1:GX1, z0:BZ0, z1:WZ1, FY:FY, BF:BF, GY:GY};

  /* ---- the openings, by wall ---- */
  const o=(a, b, sill, head)=>({a:a, b:b, sill:sill, head:head});
  const W_WEST=[o(-1162.4, -1161.0, FY+0.9, FY+2.2), o(-1158.0, -1157.2, FY+1.5, FY+2.1), o(-1154.6, -1153.6, FY+1.5, FY+2.1)];
  const W_FRONT=[o(BX0+0.21, BX1-0.21, FY-0.01, CL-0.05), o(-1434.5, -1433.1, FY+0.9, FY+2.2)];
  const BACK_H=[o(-1439.3, -1438.4, FY+1.5, FY+2.1), o(-1435.6, -1433.6, FY+0.9, FY+2.2), o(-1430.2, -1428.6, FY+1.1, FY+2.1), o(-1427.2, -1425.2, FY-0.01, FY+2.1), o(-1422.6, -1421.7, FY-0.01, FY+2.05)];
  addZone(R.x0, R.x1, R.z0-3, R.z1, Y-3, Y+14, "THE STONE HOUSE · THE YARD");                  // (the general zone first: the house's own are added after it)
  const C_FRONT=[o(-1430.7, -1429.1, FY+0.9, FY+2.2), o(-1427.6, -1426.6, FY-0.01, FY+2.1), o(-1425.8, -1424.5, FY+0.9, FY+2.2), o(-1423.0, -1421.2, FY+0.9, FY+2.2)];
  const G_FRONT=[o(-1419.3, -1416.7, GY-0.01, GY+2.2), o(-1415.6, -1413.0, GY-0.01, GY+2.2)];
  const G_EAST=[o(-1161.5, -1160.3, GY+1.2, GY+2.1), o(-1157.2, -1156.3, GY-0.01, GY+2.05)];
  const G_BACK=[o(-1417.2, -1416.0, GY+1.3, GY+2.1)];
  const G_WEST=[o(-1156.6, -1155.7, FY-0.01, FY+2.05)];
  const B_FRONT=[o(-1437.85, -1436.95, FY+0.4, FY+2.3)];

  /* ======================================================================
     THE SHELL
     ====================================================================== */
  use("shell");
  // the foundation: fieldstone where it shows above the grade, block down to the basement floor (round 04's hole, WEST_HOLES)
  wall("rn_stone", "x", WZ0+WT/2, WT, WX0, WX1, BF-0.1, FY-0.15, [], STN, BF);
  wall("rn_stone", "x", WZ0+WT/2, WT, WX1, CX1, BF-0.1, PY-0.08, [], STN, BF);
  wall("rn_stone", "x", WZ1-WT/2, WT, WX0, CX1-0.1, BF-0.1, FY-0.15, [], STN, BF);
  wall("rn_stone", "z", WX0+WT/2, WT, WZ0+WT, WZ1-WT, BF-0.1, FY-0.15, [], STN, BF);
  wall("rn_stone", "z", CX1-0.1, WT, WZ0+WT, WZ1-WT, BF-0.1, GY-0.02, [], STN, BF);
  // the wing: siding, its front gable and back gable; the bump-out in fieldstone
  wall("rn_siding", "z", WX0+WT/2, WT, WZ0, WZ1, FY-0.15, EV, W_WEST, SID, FY);
  wall("rn_siding", "x", WZ0+WT/2, WT, WX0+WT, WX1, FY-0.15, EV, W_FRONT, SID, FY);
  wall("rn_siding", "z", WX1-WT/2, WT, WZ0+WT, CZ0, PY-0.1, EV, [], SID, FY);
  gable("rn_siding", "x", WZ0+WT/2, WT, WX0, WX1, EV, EV+2.30, SID);
  gable("rn_siding", "x", WZ1-WT/2, WT, WX0, WX1, EV, EV+2.30, SID);
  // the back, all along: the wing's, the kitchen's and mudroom's; the garage's lower, from its slab
  wall("rn_siding", "x", WZ1-WT/2, WT, WX0+WT, CX1, FY-0.15, EV, BACK_H, SID, FY);
  wall("rn_siding", "x", WZ1-WT/2, WT, GX0, GX1-WT, GY-0.15, EV, G_BACK, SID, GY);
  // the middle's front, under the porch roof: fieldstone
  wall("rn_stone", "x", CZ0+WT/2, WT, CX0, CX1-0.1, PY-0.1, EV, C_FRONT, STN, FY);
  // the garage: fieldstone front and gable, siding on its sides
  wall("rn_stone", "x", GZ0+WT/2, WT, GX0+0.1, GX1-WT, GY-0.15, EV, G_FRONT, STN, GY);
  wall("rn_siding", "z", GX1-WT/2, WT, GZ0, GZ1, GY-0.15, EV, G_EAST, SID, GY);
  wall("rn_siding", "z", GX0, WT, GZ0, GZ1-0.15, GY-0.16, EV-0.01, G_WEST, SID, GY);
  gable("rn_stone", "x", GZ0+WT/2, WT, GX0, GX1, EV, EV+2.10, STN);
  gable("rn_siding", "x", GZ1-WT/2, WT, GX0, GX1, EV, EV+2.10, SID);
  // the bump-out: three walls of fieldstone to a lower eave, its own little gable
  const EVB=CL+0.05;
  wall("rn_stone", "x", BZ0+WT/2, WT, BX0+WT, BX1-WT, FY-0.15, EVB, B_FRONT, STN, FY);
  wall("rn_stone", "z", BX0+WT/2, WT, BZ0, WZ0+0.1, Y-0.1, EVB, [], STN, FY);
  wall("rn_stone", "z", BX1-WT/2, WT, BZ0, WZ0+0.1, Y-0.1, EVB, [], STN, FY);
  B(BX1-BX0-2*WT, FY-0.15-(Y-0.1), WZ0-BZ0-WT-0.005, (BX0+BX1)/2, (FY-0.15+Y-0.1)/2, (BZ0+WT+WZ0-0.005)/2, "#7a6a5a");
  gable("rn_stone", "x", BZ0+WT/2, WT, BX0, BX1, EVB, EVB+1.08, STN);
  // stone wainscot round the wing's west side and the back, below the windows
  for(const [x0, x1, z0, z1] of [[WX0-0.09, WX0-0.01, WZ0+0.15, WZ1-0.15]]) push("rn_stone", boxGeo(x1-x0, FY+0.6-(Y-0.05), z1-z0, 0.5), (x0+x1)/2, (FY+0.6+Y-0.05)/2, (z0+z1)/2, 0, STN);

  /* ---- the roofs: the wing's gable along z, the garage's along z, the middle's along x between them meeting each in a
     valley; the bump-out's small gable. Shingles on top, a brown soffit under, fascia round the edges ---- */
  const shing=(Pp, n, along)=>{ const Gm={P:[],N:[],U:[]}; KT.addFace(Gm, Pp, n.clone().normalize(), along==="z" ? p=>[p.z*0.5, p.x*0.5+p.y*0.5] : p=>[p.x*0.5, p.z*0.5+p.y*0.5]); KT.flush(Gm, "shingle", "#6a5a52"); };
  const soff=(Pp, n)=>{ const Gm={P:[],N:[],U:[]}; KT.addFace(Gm, Pp.map(p=>V3(p.x, p.y-0.13, p.z)), n.clone().normalize(), p=>[p.x*0.5, p.z*0.5]); KT.flush(Gm, "paintm", "#4a3a32"); };
  function gableRoofZ(x0, x1, z0, z1, eave, pitch, ov, ovE){ const xm=(x0+x1)/2, half=(x1-x0)/2, rise=half*pitch, ye=eave-ov*pitch, top=eave+rise;
    const zA=z0-ovE, zB=z1+ovE;
    for(const s of [-1, 1]){ const xe=xm+s*(half+ov), P=[V3(xm, top, zA), V3(xm, top, zB), V3(xe, ye, zB), V3(xe, ye, zA)];
      shing(P, V3(s*pitch, 1, 0), "z"); soff(P, V3(-s*pitch, -1, 0));
      RB(0.05, 0.2, zB-zA+0.04, xe+s*0.02, ye-0.07, (zA+zB)/2, TRIM, 0, 0.012);                    // (the fascia)
      for(const ze of [zA, zB]){ const L=Math.hypot(half+ov, top-ye), ang=Math.atan2(top-ye, half+ov);
        ent(rboxGeo(L, 0.2, 0.05, 0.012, 2), (xm+xe)/2, (top+ye)/2-0.07, ze+(ze<zA+0.01 ? -0.02 : 0.02), TRIM, 0, 0, s<0 ? ang : -ang); } }
    RB(0.26, 0.07, zB-zA+0.02, xm, top+0.025, (zA+zB)/2, "#4a3e38", 0, 0.025); return top; }
  const topW=gableRoofZ(WX0, WX1, WZ0, WZ1, EV, 0.62, 0.42, 0.36);
  const topG=gableRoofZ(GX0, GX1, GZ0, GZ1, EV, 0.60, 0.42, 0.40);
  gableRoofZ(BX0, BX1, BZ0, WZ0+0.08, EVB, 0.62, 0.3, 0.3);
  // the middle: two slopes from the ridge along x, each cut at the wing's and the garage's roof in a valley
  { const pc=0.36, ov=0.45, zr=(CZ1+WZ0)/2, half=(CZ1-WZ0)/2, top=EV+half*pc, ye=EV-ov*pc;
    const vW=(dz)=>WX1-(pc/0.62)*dz, vG=(dz)=>GX0+(pc/0.60)*dz;                                  // (where the valleys run: dz up the slope from the eave)
    for(const s of [-1, 1]){ const ze=zr+s*(half+ov), P=[V3(vW(-ov), ye, ze), V3(vG(-ov), ye, ze), V3(vG(half), top, zr), V3(vW(half), top, zr)];
      shing(P, V3(0, 1, s*pc), "x"); soff(P, V3(0, -1, -s*pc)); RB(vG(-ov)-vW(-ov)+0.02, 0.2, 0.05, (vW(-ov)+vG(-ov))/2, ye-0.07, ze+s*0.02, TRIM, 0, 0.012); }
    RB(vG(half)-vW(half), 0.07, 0.26, (vW(half)+vG(half))/2, top+0.025, zr, "#4a3e38", 0, 0.025);
    // the gutters along the middle's eaves, the garage's and the wing's, and their downspouts at the corners
    for(const s of [-1, 1]){ const ze=zr+s*(half+ov+0.08); C(0.06, vG(-ov)-vW(-ov), (vW(-ov)+vG(-ov))/2, ye-0.12, ze, "#4a3a32", 10, 0, 0, Math.PI/2); } }
  for(const [x, z0, z1] of [[WX0-0.5, WZ0-0.36, WZ1+0.36],[GX1+0.5, GZ0-0.4, GZ1+0.4]]) C(0.06, z1-z0, x, EV-0.42*0.6-0.12, (z0+z1)/2, "#4a3a32", 10, Math.PI/2);
  for(const [x, z, zw] of [[WX0-0.5, WZ1+0.2, WZ1+0.06],[GX1+0.5, GZ0-0.3, GZ0-0.06],[GX1+0.5, GZ1+0.3, GZ1+0.06],[WX0-0.5, WZ0-0.2, WZ0-0.06]]){
    tubeE(V3(x, EV-0.38, z), V3(x, Y+0.3, z), 0.035, "#4a3a32"); tubeE(V3(x, Y+0.3, z), V3(x+(x<-1430 ? -0.35 : 0.35), Y+0.06, z), 0.035, "#4a3a32"); }
  // the porch: a slab under the middle's roof, two steps down to the walk, square posts, its ceiling of beadboard
  { const z0=WZ0-0.6, z1=CZ0;
    B(CX1-CX0-0.05, PY-(Y-0.1), z1-z0-0.05, (CX0+CX1)/2, (PY+Y-0.1)/2, (z0+z1)/2-0.025, "#c8c2b6");
    addFlat(CX0, CX1, z0, z1, PY);
    RB(1.3, FY-PY, 0.6, -1427.1, (FY+PY)/2, CZ0-0.3, "#c8c2b6", 0, 0.02); addRamp(-1427.75, -1426.45, CZ0-0.6, CZ0, "z", CZ0-0.6, CZ0, PY, FY);      // (the step up to the door's sill)
    for(let k=0;k<2;k++){ const h=(PY-Y)*(2-k)/3; RB(3.2, h, 0.32, -1427.1, Y+h/2, z0-0.16-k*0.32, "#c8c2b6", 0, 0.02); }
    addRamp(-1428.7, -1425.5, z0-0.64, z0, "z", z0-0.64, z0, Y+0.02, PY);
    for(const x of [CX0+0.35, -1428.9, -1425.3, CX1-0.35]){ RB(0.36, 0.5, 0.36, x, PY+0.25, WZ0-0.35, "#8a7a64", 0, 0.03); RB(0.16, EV-0.2-PY-0.5, 0.16, x, (PY+0.5+EV-0.2)/2, WZ0-0.35, "#5a4a3e", 0, 0.03);
      addCol(x-0.18, x+0.18, WZ0-0.53, WZ0-0.17, PY-0.2, EV); }
    B(CX1-CX0-0.3, 0.03, CZ0-WZ0+0.3, (CX0+CX1)/2, CL-0.15, (WZ0-0.3+CZ0)/2, "#e8e0d0");
    addRoof(CX0, CX1, WZ0-0.5, CZ0, EV);
    // two wicker chairs and a little table between them, a planter, the wreath on the door, the porch lights
    for(const x of [-1430.0, -1424.4]){ const f=Fr(x, -1163.0, faceN, PY); f.f(0.62, 0.42, 0.58, 0, 0.21, 0, "#8a6a4a", 0.06); f.f(0.62, 0.5, 0.12, 0, 0.62, -0.25, "#8a6a4a", 0.05);
      f.f(0.56, 0.1, 0.5, 0, 0.47, 0.02, "#b8a888", 0.04); f.col(0.66, 0.62, 0, 0, 0.9); f.seat(0, 0.05, "A WICKER CHAIR ON THE PORCH"); }
    C(0.22, 0.04, -1425.6, PY+0.5, -1163.1, "#8a6a4a", 16); C(0.04, 0.48, -1425.6, PY+0.24, -1163.1, "#6a4a32", 8); addCol(-1425.85, -1425.35, -1163.35, -1162.85, PY-0.1, PY+0.55);
    CT(0.24, 0.18, 0.4, -1421.0, PY+0.2, -1162.6, "#7a5a3a", 14); S(0.32, -1421.0, PY+0.58, -1162.6, "#3e6a2a"); for(let k=0;k<6;k++) S(0.06, -1421.0+Math.cos(k)*0.24, PY+0.75, -1162.6+Math.sin(k)*0.2, "#e85a8a");
    addCol(-1421.3, -1420.7, -1162.9, -1162.3, PY-0.1, PY+0.9);
    for(const x of [-1428.05, -1426.15]){ RB(0.13, 0.3, 0.1, x, FY+1.9, CZ0-0.07, "#1a1a1c", 0, 0.02); push("rn_lamp", new T.SphereGeometry(0.045, 10, 8), x, FY+1.88, CZ0-0.13, 0, "#ffffff");
      LAMPS.push({x:x, y:FY+1.85, z:CZ0-0.6, color:0xffd8a0, intensity:0.45, dist:7, decay:1.5}); } }
  // the garage's lights either side of its doors; the house number on a stone plaque (no number: the stone is blank but for a pine)
  for(const x of [GX0+0.35, -1416.15, GX1-0.35]){ RB(0.13, 0.3, 0.1, x, GY+2.0, GZ0-0.07, "#1a1a1c", 0, 0.02); push("rn_lamp", new T.SphereGeometry(0.045, 10, 8), x, GY+1.98, GZ0-0.13, 0, "#ffffff"); }
  LAMPS.push({x:-1416.2, y:GY+2.2, z:GZ0-1.2, color:0xffd8a0, intensity:0.6, dist:10, decay:1.5});
  // the garage doors: dark brown, four raised-panel sections each that go up their tracks (01's makeLiftDoor)
  RANCH.liftDoors=G_FRONT.map((op, k)=>makeLiftDoor(XF((op.a+op.b)/2, GZ0+0.1, Math.PI), GY+0.005, op.b-op.a, op.head-GY-0.01, "#5a3a30", k ? "THE RIGHT GARAGE DOOR" : "THE LEFT GARAGE DOOR",
    {x0:op.a, x1:op.b, z0:GZ0, z1:GZ0+0.2, y0:GY-0.5, y1:op.head}));
  for(const op of G_FRONT){ RB(op.b-op.a+0.2, 0.1, 0.06, (op.a+op.b)/2, op.head+0.05, GZ0-0.04, TRIM, 0, 0.015); for(const x of [op.a-0.05, op.b+0.05]) RB(0.1, op.head-GY, 0.06, x, (op.head+GY)/2, GZ0-0.04, TRIM, 0, 0.015); }

  /* ======================================================================
     THE FLOORS, THE CEILINGS, THE PARTITIONS
     ====================================================================== */
  use("house");
  // the floor's frame between the basement and the rooms (its underside the basement's ceiling), round the stair's well
  for(const [x0, x1, z0, z1] of [[WX0+WT, SWX0, CZ0+0.01, WZ1-WT],[SWX1, CX1-0.12, CZ0+0.01, WZ1-WT],[SWX0, SWX1, CZ0+0.01, SWZ0],[WX0+WT, WX1-0.01, WZ0+WT+0.01, CZ0-0.01]])
    B(x1-x0, FY-BCL-0.004, z1-z0, (x0+x1)/2, (FY+BCL)/2-0.002, (z0+z1)/2, "#f0ece4");
  B(CX1-WX1-0.15, PY-BCL-0.1, CZ0-WZ0-WT, (WX1+CX1-0.15)/2, (PY-0.1+BCL)/2, (WZ0+WT+CZ0)/2, "#f0ece4");
  const floor=(bk, x0, x1, z0, z1, col, s)=>{ const g=planeGeo(x1-x0, z1-z0, 0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(x1-x0)*(s||0.5), U.getY(i)*(z1-z0)*(s||0.5));
    push(bk, g, (x0+x1)/2, FY+0.004, (z0+z1)/2, 0, col||"#ffffff", -Math.PI/2, 0); };
  floor("rn_wood", WX1+0.06, CX1-0.1, CZ0+0.1, -1157.06);                                 // living and dining
  floor("rn_tile", WX1+0.06, -1424.06, -1156.94, WZ1-0.1, "#ffffff", 1.0);                 // the kitchen
  floor("rn_tile", -1423.94, CX1-0.1, -1156.94, SWZ0, "#ffffff", 1.0); floor("rn_tile", SWX1, CX1-0.1, SWZ0, WZ1-0.1, "#ffffff", 1.0);
  floor("rn_wood", -1434.94, WX1-0.06, WZ0+0.1, -1156.56);                                 // the wing's hall and the office
  floor("rn_carpet", WX0+0.1, -1435.06, WZ0+0.1, -1159.06, "#c8bca8"); floor("rn_carpet", BX0+0.2, BX1-0.2, BZ0+0.2, WZ0+0.1, "#c8bca8");
  floor("rn_tile", WX0+0.1, -1435.06, -1158.94, -1156.56, "#ffffff", 1.0);                 // the hall bath
  floor("rn_carpet", -1436.94, WX1-0.06, -1156.44, WZ1-0.1, "#b8b0a0"); floor("rn_tile", WX0+0.1, -1437.06, -1156.44, WZ1-0.1, "#ffffff", 1.0);
  // the walkable floor: everything at FY but the stair's well (a ramp)
  addFlat(WX0+0.1, WX1, WZ0+0.1, WZ1-0.1, FY); addFlat(BX0+0.2, BX1-0.2, BZ0+0.2, WZ0+0.2, FY);
  addFlat(CX0, SWX0, CZ0, CZ1-0.1, FY); addFlat(SWX1, CX1-0.1, CZ0, CZ1-0.1, FY); addFlat(SWX0, SWX1, CZ0, SWZ0, FY);
  addFlat(CX0+1, CX1-1, CZ0-0.15, CZ0+0.15, FY);                                          // (the front door's sill)
  // the ceilings
  for(const [x0, x1, z0, z1] of [[WX0+0.1, WX1-0.06, WZ0+0.1, WZ1-0.1],[WX1+0.06, CX1-0.1, CZ0+0.1, WZ1-0.1],[BX0+0.2, BX1-0.2, BZ0+0.2, WZ0-0.005]])
    push("wp_wall", planeGeo(x1-x0, z1-z0, 0.5), (x0+x1)/2, z0<WZ0 ? CL-0.05 : CL, (z0+z1)/2, 0, "#f6f2ea", Math.PI/2, 0);
  // the exterior walls' inner faces
  liner("wp_wall", "z", WX0+WT, 1, WZ0+WT, WZ1-WT, FY, CL, W_WEST, WALLC);
  liner("wp_wall", "x", WZ0+WT, 1, WX0+WT, WX1-WT, FY, CL, W_FRONT, WALLC);
  liner("wp_wall", "x", WZ1-WT, -1, WX0+WT, CX1-0.1, FY, CL, BACK_H, WALLC);
  liner("wp_wall", "x", CZ0+WT, 1, WX1+0.06, CX1-0.1, FY, CL, C_FRONT, WALLC);
  liner("wp_wall", "z", WX1-WT, -1, WZ0+WT, CZ0, FY, CL, [], WALLC);
  liner("wp_wall", "z", CX1-0.1, -1, CZ0+WT, WZ1-WT, FY, CL, G_WEST, WALLC);
  for(const [ax, c2, dir, a, b] of [["x", BZ0+WT, 1, BX0+WT, BX1-WT],["z", BX0+WT, 1, BZ0+WT, WZ0+0.1],["z", BX1-WT, -1, BZ0+WT, WZ0+0.1]])
    liner("wp_wall", ax, c2, dir, a, b, FY, CL-0.05, ax==="x" ? B_FRONT : [], WALLC);
  // the partitions
  const pw=(ax, c2, a, b, ops)=>wall("wp_wall", ax, c2, PT, a, b, FY, CL, ops, WALLC, FY);
  const D=(a, b)=>o(a, b, FY-0.01, FY+2.05);
  pw("z", -1435, WZ0+WT, -1156.56, [D(-1160.35, -1159.45), D(-1158.4, -1157.5)]);              // the wing's hall: to the second bedroom, to the bath
  pw("x", -1159, WX0+WT, -1435.06, []);                                                    // the second bedroom | the hall bath
  pw("x", -1160.5, -1434.94, WX1-0.06, [D(-1434.6, -1433.75)]);                            // the office | the hall
  pw("x", -1156.5, WX0+WT, WX1-0.06, [D(-1434.65, -1433.75)]);                                  // the hall and bath | the main bedroom and its bath (half a metre north of where it was: room past the bed)
  pw("z", -1437, -1156.44, WZ1-WT, [D(-1155.4, -1154.5)]);                                 // the main bedroom | its bath
  wall("wp_wall", "z", -1432, PT, CZ0+WT, WZ1-WT, FY, CL, [o(-1160.2, -1157.2, FY-0.01, FY+2.15)], WALLC, FY);   // the wing | the middle, a cased opening to the living room
  pw("x", -1157, WX1+0.06, CX1-0.1, [o(-1431.0, -1425.2, FY-0.01, FY+2.2), D(-1422.3, -1421.4)]);              // living | kitchen (open), dining | mudroom
  pw("z", -1424, CZ0+WT, -1157.06, [o(-1161.2, -1157.3, FY-0.01, FY+2.15)]); pw("z", -1424, -1156.94, WZ1-WT, []);                // living | dining (open), kitchen | mudroom (the stair against it)
  const doorIn=(xf, label, ajar)=>makeDoor(xf, 0, FY+0.01, 0, label, true, ajar===undefined ? 0.3 : ajar, "closet", 0xf2eee6);
  // (each door shut or standing well open, never a few degrees ajar)
  doorIn(XF(-1435, -1160.33, -Math.PI/2), "THE SECOND BEDROOM", 0.95); doorIn(XF(-1435, -1158.38, -Math.PI/2), "THE BATHROOM", 0);
  doorIn(XF(-1434.58, -1160.5, 0), "THE OFFICE", 0.95); doorIn(XF(-1433.77, -1156.5, Math.PI), "THE MAIN BEDROOM", 0.95); doorIn(XF(-1437, -1155.38, -Math.PI/2), "THE MAIN BATH", 0);
  doorIn(XF(-1422.28, -1157, 0), "THE MUDROOM", 0.95);
  { // the front door, and the wreath on it: hung on the leaf itself (its group), so it swings with the door
    const fd=makeDoor(XF(-1427.58, CZ0+WT/2, 0), 0, FY+0.01, 0, "THE FRONT DOOR", true, 0, null, 0x4a3a30);
    const W=[], add=(geo, x, y, z, c, rx)=>W.push({geo:geo, matrix:new T.Matrix4().compose(V3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(rx||0, 0, 0)), V3(1,1,1)), color:new T.Color(c)});
    const cx=0.46, cy=1.52, cz=-0.105;                                // (the leaf's middle; out from its face, the outside being -z)
    add(new T.TorusGeometry(0.19, 0.055, 8, 22), cx, cy, cz, "#3e5a2a");
    for(let k=0;k<14;k++){ const a=k/14*Math.PI*2; add(new T.SphereGeometry(0.045, 6, 5), cx+Math.cos(a)*0.19, cy+Math.sin(a)*0.19, cz-0.035, k%2 ? "#466a30" : "#35502a"); }
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+0.4; add(new T.SphereGeometry(0.018, 6, 5), cx+Math.cos(a)*0.2, cy+Math.sin(a)*0.2, cz-0.075, "#c82a22"); }
    add(new T.SphereGeometry(0.035, 8, 6), cx, cy-0.19, cz-0.06, "#b82a22");
    for(const sd of [-1,1]) add(new T.ConeGeometry(0.035, 0.12, 6), cx+sd*0.05, cy-0.26, cz-0.06, "#b82a22");
    add(new T.BoxGeometry(0.02, 0.08, 0.012), cx, cy+0.23, -0.034, "#c8a050");                            // (the hanger over the top)
    const wm=new T.Mesh(mergeEntries(W), new T.MeshStandardMaterial({vertexColors:true, roughness:0.85})); wm.castShadow=true; fd.add(wm); }
  makeDoor(XF(-1427.18, WZ1-WT/2, 0), 0, FY+0.01, 0, "THE PATIO DOOR", false, 0, "store", 0x3a2e28);
  makeDoor(XF(-1422.58, WZ1-WT/2, 0), 0, FY+0.01, 0, "THE BACK DOOR", false, 0, null, 0xe8e2d8);
  makeDoor(XF(GX0, -1156.58, -Math.PI/2), 0, FY+0.01, 0, "THE DOOR TO THE GARAGE", true, 0, "steel", 0xe8e2d8);
  makeDoor(XF(GX1-WT/2, -1157.18, -Math.PI/2), 0, GY+0.01, 0, "THE GARAGE'S SIDE DOOR", true, 0, "steel", 0x5a3a30);
  for(const [x, z] of [[-1427.1, CZ0], [-1426.2, WZ1], [-1422.15, WZ1]]) addFlat(x-0.55, x+0.55, z-0.2, z+0.2, FY);
  // a step down from the patio door and the back door to the deck; from the garage's side door to the lawn
  // (a landing at the floor's height outside each, then two steps down: the walker is up before it reaches the sill)
  for(const [x, w] of [[-1426.2, 2.2],[-1422.15, 1.2]]){ RB(w, FY-Y-0.06, 0.72, x, (FY+Y+0.06)/2, WZ1+0.36, "#c8c2b6", 0, 0.02); addFlat(x-w/2, x+w/2, WZ1-0.2, WZ1+0.72, FY);
    for(let k=0;k<2;k++){ const h=(FY-Y-0.06)*(2-k)/3; RB(w, h, 0.3, x, Y+0.06+h/2, WZ1+0.87+k*0.3, "#c8c2b6", 0, 0.02); }
    addRamp(x-w/2, x+w/2, WZ1+0.72, WZ1+1.32, "z", WZ1+1.32, WZ1+0.72, Y+0.07, FY); }
  push("glass", planeGeo(0.94, 2.04, 0), -1425.7, FY+1.05, WZ1-WT/2, 0, "#ffffff"); RB(0.05, 2.1, 0.08, -1426.2, FY+1.05, WZ1-WT/2, "#3a2e28", 0, 0.01);
  RB(1.0, 0.05, 0.08, -1425.7, FY+0.025, WZ1-WT/2, "#3a2e28", 0, 0.01); addCol(-1426.2, -1425.2, WZ1-WT, WZ1, FY-0.1, FY+2.1);
  // the windows: glass, trim, sills, curtains in the rooms
  for(const op of W_WEST) win("z", WX0+WT/2, WT, op, -1, "#efe9de", "#d8ccb4");
  win("x", WZ0+WT/2, WT, W_FRONT[1], -1, "#efe9de", "#8a9a7a");
  for(const op of BACK_H.filter(p=>p.sill>FY+0.5)) win("x", WZ1-WT/2, WT, op, 1, "#efe9de", "#c8b89a");
  for(const op of C_FRONT.filter(p=>p.sill>FY+0.5)) win("x", CZ0+WT/2, WT, op, -1, "#efe9de", "#7a3a2a");
  win("z", GX1-WT/2, WT, G_EAST[0], 1, "#efe9de"); win("x", WZ1-WT/2, WT, G_BACK[0], 1, "#efe9de");
  win("x", BZ0+WT/2, WT, B_FRONT[0], -1, "#efe9de", "#d8ccb4");
  // the rooms' zones (the general one first)
  addZone(WX0, GX1, BZ0, WZ1, BF-0.5, EV+3, "THE STONE HOUSE", true);
  for(const [x0, x1, z0, z1, n] of [[WX1, -1424, CZ0, -1157, "LIVING ROOM"],[-1424, CX1, CZ0, -1157, "DINING ROOM"],[WX1, -1424, -1157, WZ1, "KITCHEN"],[-1424, CX1, -1157, WZ1, "MUDROOM"],
      [WX0, -1435, BZ0, -1159, "BEDROOM"],[-1435, WX1, WZ0, -1160.5, "OFFICE"],[-1435, WX1, -1160.5, -1156.5, "HALL"],[WX0, -1435, -1159, -1156.5, "BATH"],[-1437, WX1, -1156.5, WZ1, "MAIN BEDROOM"],[WX0, -1437, -1156.5, WZ1, "MAIN BATH"],
      [GX0, GX1, GZ0, GZ1, "GARAGE"]])
    addZone(x0, x1, z0, z1, n==="GARAGE" ? GY-0.5 : FY-0.5, CL+0.3, "THE STONE HOUSE · "+n, true);

  /* ======================================================================
     THE ROOMS
     ====================================================================== */
  const RUG=["#7a2a22","#2a4a5a","#c8a070","#5a6a4a"];
  const rug=(x0, x1, z0, z1, c)=>push("wp_rug", boxGeo(x1-x0, 0.010, z1-z0), (x0+x1)/2, FY+0.017, (z0+z1)/2, 0, c||"#ffffff");
  const art=(ax, x, z, y, w, h, c, dir)=>{ if(ax==="x"){ RB(w+0.08, h+0.08, 0.03, x, y, z+dir*0.016, "#3a2a1a", 0, 0.01); B(w, h, 0.02, x, y, z+dir*0.032, c); }
    else { RB(0.03, h+0.08, w+0.08, x+dir*0.016, y, z, "#3a2a1a", 0, 0.01); B(0.02, h, w, x+dir*0.032, y, z, c); } };
  // ---- the living room: a stone fireplace on the wing's wall, the TV over it, the sectional, the coffee table, a rug, lamps ----
  { const fx=WX1+0.06, fz=-1161.05;
    push("rn_stone", boxGeo(0.49, CL-FY-0.02, 1.6, 0.5), fx+0.255, (FY+CL)/2, fz, 0, STN);
    RB(0.6, 0.1, 1.74, fx+0.32, FY+0.95, fz, "#5a3a22", 0, 0.03); B(0.06, 0.6, 0.9, fx+0.5, FY+0.42, fz, "#1a1612");
    RB(0.6, 0.12, 1.7, fx+0.3, FY+0.06, fz, "#8a7a64", 0, 0.02);
    B(0.04, 0.62, 1.12, fx+0.53, FY+1.62, fz, "#121416"); push("lk_tv", planeGeo(1.04, 0.56, 0), fx+0.556, FY+1.62, fz, Math.PI/2, "#ffffff");
    addCol(fx, fx+0.62, fz-0.92, fz+0.92, FY-0.06, CL);
    RANCH.fire={x:fx+0.62, y:FY+0.3, z:fz};
    const so=Fr(-1428.3, -1159.9, faceW, FY), sc="#6a5a4a";
    so.f(2.6, 0.44, 0.92, 0, 0.22, 0, sc, 0.08); so.f(2.6, 0.5, 0.22, 0, 0.66, -0.36, sc, 0.08); so.f(0.9, 0.44, 1.7, -0.85, 0.22, 1.1, sc, 0.08); so.f(0.22, 0.5, 1.7, -1.2, 0.66, 1.1, sc, 0.08);
    for(let k=0;k<3;k++) so.f(0.8, 0.12, 0.8, -0.85+k*0.86, 0.5, 0.05, "#7a6a5a", 0.06); for(const lx of [-0.6, 0.4]) so.f(0.45, 0.4, 0.14, lx, 0.82, -0.2, ["#c8a070","#2a4a5a"][lx>0?1:0], 0.06);
    so.col(2.6, 0.92, 0, 0, 0.9); addCol(so.x(-0.85, 1.1)-0.85, so.x(-0.85, 1.1)+0.85, so.z(-0.85, 1.1)-0.45, so.z(-0.85, 1.1)+0.45, FY-0.06, FY+0.9);
    for(const lx of [-0.8, 0.0, 0.8]) so.seat(lx, 0.1, "THE SECTIONAL");
    const ct=Fr(-1430.0, -1159.6, faceW, FY); ct.f(1.2, 0.08, 0.7, 0, 0.42, 0, "#5a3a22", 0.03); for(const a of [-0.5, 0.5]) for(const b of [-0.28, 0.28]) ct.f(0.06, 0.4, 0.06, a, 0.2, b, "#4a3020", 0.02);
    ct.col(1.2, 0.7, 0, 0, 0.46); ct.f(0.3, 0.04, 0.22, 0.2, 0.48, 0, "#2a4a6a", 0.01); S(0.1, ct.x(-0.3, 0), FY+0.52, ct.z(-0.3, 0), "#c8a050", 1, 0.5, 1);
    rug(-1431.4, -1427.2, -1161.4, -1157.8, "#e8d8c8");
    const lp=[-1431.5, -1157.6]; C(0.16, 0.03, lp[0], FY+0.015, lp[1], "#2a2a2c", 14); C(0.015, 1.5, lp[0], FY+0.76, lp[1], "#2a2a2c", 8); CT(0.13, 0.2, 0.28, lp[0], FY+1.58, lp[1], "#efe2c4", 16);
    lampIn(lp[0]+0.2, FY+1.6, lp[1], [WX1, -1424, CZ0, -1157, FY-0.5, CL+0.2], 0.45, 0xffd6a0);
    art("x", -1428.5, CZ0+WT, FY+1.6, 0.9, 0.6, "#5a7a8a", 1);
    lampIn(-1428, CL-0.25, -1159.5, [WX1, -1424, CZ0, -1157, FY-0.5, CL+0.2], 0.55);
    B(0.32, 1.9, 0.9, -1424.24, FY+0.95, -1161.6, "#5a3a22"); for(let k=0;k<5;k++){ B(0.3, 0.02, 0.86, -1424.24, FY+0.2+k*0.42, -1161.6, "#4a3020");
      for(let j=0;j<6;j++) B(0.2, 0.22+((j*k)%3)*0.03, 0.04, -1424.28, FY+0.33+k*0.42, -1161.95+j*0.12, ["#7a2a22","#2a4a6a","#c8a070","#3a5a3a","#e8e2d0"][(j+k)%5]); }
    addCol(-1424.42, -1424.06, -1162.05, -1161.15, FY-0.06, FY+1.9); }
  // ---- the dining room: a long table and six chairs, a hutch, the chandelier ----
  { const tx2=-1422.2, tz=-1160.15;
    RB(0.95, 0.05, 1.9, tx2, FY+0.75, tz, "#6a4428", 0, 0.02); for(const a of [-0.38, 0.38]) for(const b of [-0.82, 0.82]) RB(0.07, 0.72, 0.07, tx2+a, FY+0.36, tz+b, "#5a3a22", 0, 0.015);
    addCol(tx2-0.48, tx2+0.48, tz-0.95, tz+0.95, FY-0.06, FY+0.78); B(0.5, 0.008, 1.5, tx2, FY+0.778, tz, "#e8dcc4");
    for(const [dx, dz, ry] of [[-0.62, -0.5, faceE],[-0.62, 0.5, faceE],[0.62, -0.5, faceW],[0.62, 0.5, faceW],[0, -1.2, faceS]]){
      const f=Fr(tx2+dx, tz+dz, ry, FY); f.f(0.44, 0.06, 0.44, 0, 0.46, 0, "#6a4428", 0.02); f.f(0.42, 0.5, 0.05, 0, 0.74, -0.2, "#6a4428", 0.02);
      for(const a of [-0.18, 0.18]) for(const b of [-0.18, 0.18]) f.f(0.04, 0.44, 0.04, a, 0.22, b, "#5a3a22", 0.01); f.f(0.38, 0.05, 0.38, 0, 0.5, 0.01, "#a89878", 0.02);
      f.col(0.44, 0.44, 0, 0, 0.5); f.seat(0, 0.06, "A DINING CHAIR"); }
    C(0.012, 0.6, tx2, CL-0.3, tz, "#2a2a2c", 6); C(0.32, 0.03, tx2, CL-0.62, tz, "#2a2a2c", 18); for(let k=0;k<5;k++){ const a=k/5*Math.PI*2; CT(0.04, 0.06, 0.1, tx2+Math.cos(a)*0.3, CL-0.57, tz+Math.sin(a)*0.3, "#efe2c4", 10); }
    lampIn(tx2, CL-0.7, tz, [-1424, CX1, CZ0, -1157, FY-0.5, CL+0.2], 0.6, 0xffdcac);
    const h=Fr(-1420.4, -1160.6, faceW, FY); h.f(1.4, 0.85, 0.48, 0, 0.425, 0, "#5a3a22", 0.02); h.f(1.36, 1.0, 0.32, 0, 1.36, -0.08, "#5a3a22", 0.02); h.col(1.4, 0.5, 0, 0, 1.9);
    for(let k=0;k<5;k++) C(0.11, 0.015, h.x(-0.5+k*0.25, -0.06), FY+1.25, h.z(-0.5+k*0.25, -0.06), "#f2f0ea", 16, Math.PI/2, Math.PI/2); }
  // ---- the kitchen: counters along the back under the window, the range on the wing's wall, the fridge, an island with stools ----
  { const cab="#e8e2d6", top="#3a3a3c", bz=WZ1-WT;
    const run=(x0, x1)=>{ RB(x1-x0, 0.86, 0.62, (x0+x1)/2, FY+0.43, bz-0.31, cab, 0, 0.012); RB(x1-x0+0.02, 0.04, 0.65, (x0+x1)/2, FY+0.88, bz-0.325, top, 0, 0.01);
      for(let x=x0+0.3; x<x1-0.2; x+=0.6){ RB(0.56, 0.7, 0.02, x, FY+0.42, bz-0.625, cab, 0, 0.006); C(0.008, 0.12, x+0.2, FY+0.65, bz-0.645, "#3a3a3c", 6); }
      RB(x1-x0, 0.72, 0.34, (x0+x1)/2, FY+1.88, bz-0.17, cab, 0, 0.012); addCol(x0, x1, bz-0.64, bz, FY-0.06, FY+0.92); };
    run(WX1+0.06, -1430.3); run(-1428.5, -1427.4);
    RB(1.8, 0.86, 0.62, -1429.4, FY+0.43, bz-0.31, cab, 0, 0.012); RB(1.82, 0.04, 0.65, -1429.4, FY+0.88, bz-0.325, top, 0, 0.01); addCol(-1430.3, -1428.5, bz-0.64, bz, FY-0.06, FY+0.92);
    B(0.7, 0.012, 0.42, -1429.4, FY+0.905, bz-0.32, "#c8ccd0"); C(0.012, 0.3, -1429.4, FY+1.04, bz-0.1, "#c8ccd0", 8); tubeE(V3(-1429.4, FY+1.18, bz-0.1), V3(-1429.4, FY+1.18, bz-0.3), 0.012, "#c8ccd0");
    B(0.8, 0.5, 0.01, -1429.4, FY+1.15, bz-0.004, "#c8d8d4");
    // the range and its hood, on the wing's wall; the fridge by the mudroom wall
    const rx=WX1+0.06+0.33; RB(0.66, 0.92, 0.76, rx, FY+0.46, -1154.8, "#c8ccd0", 0, 0.02); B(0.6, 0.012, 0.7, rx+0.02, FY+0.926, -1154.8, "#1a1a1c"); for(const [a, b] of [[-0.15,-0.15],[0.15,0.15],[-0.15,0.15],[0.15,-0.15]]) C(0.08, 0.008, rx+0.02+a, FY+0.936, -1154.8+b, "#3a3a3c", 14);
    RB(0.5, 0.25, 0.8, rx-0.06, FY+1.95, -1154.8, "#c8ccd0", 0, 0.03); addCol(WX1+0.06, rx+0.38, -1155.2, -1154.4, FY-0.06, FY+0.95);
    for(const [z0, z1] of [[-1156.94, -1155.2],[-1154.4, -1153.0]]){ RB(0.62, 0.86, z1-z0, WX1+0.37, FY+0.43, (z0+z1)/2, cab, 0, 0.012); RB(0.65, 0.04, z1-z0+0.02, WX1+0.385, FY+0.88, (z0+z1)/2, top, 0, 0.01);
      RB(0.34, 0.72, z1-z0, WX1+0.23, FY+1.88, (z0+z1)/2, cab, 0, 0.012); addCol(WX1+0.06, WX1+0.7, z0, z1, FY-0.06, FY+0.92); }
    RB(0.82, 1.82, 0.74, -1424.55, FY+0.91, bz-0.37, "#c8ccd0", 0, 0.03); for(const x of [-1424.62, -1424.48]) B(0.012, 0.6, 0.02, x, FY+1.3, bz-0.75, "#8a8d90"); addCol(-1424.96, -1424.06, bz-0.76, bz, FY-0.06, FY+1.85);
    // the island, its overhang on the living room's side, three stools
    RB(2.5, 0.88, 0.95, -1428.75, FY+0.44, -1154.9, "#3a4a5a", 0, 0.02); RB(2.7, 0.04, 1.25, -1428.75, FY+0.9, -1155.05, "#e8e4dc", 0, 0.012); addCol(-1430.0, -1427.5, -1155.45, -1154.4, FY-0.06, FY+0.94);
    for(let k=0;k<3;k++){ const sx=-1429.7+k*0.95, sz=-1156.05; C(0.18, 0.06, sx, FY+0.66, sz, "#5a3a22", 16); C(0.025, 0.64, sx, FY+0.32, sz, "#2a2a2c", 8); C(0.16, 0.02, sx, FY+0.01, sz, "#2a2a2c", 14);
      addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, FY-0.06, FY+0.7); addSeat(sx, sz, FY, Math.PI, "A STOOL AT THE ISLAND", false, 0.34); }
    S(0.13, -1428.4, FY+0.97, -1154.9, "#e8e2d0", 1, 0.45, 1); for(let k=0;k<5;k++) S(0.04, -1428.4+Math.cos(k*1.3)*0.07, FY+1.0, -1154.9+Math.sin(k*1.3)*0.07, ["#c82a1a","#e8b030","#7ab02a"][k%3]);
    for(const x of [-1430.0, -1428.75, -1427.5]){ C(0.006, 0.7, x, CL-0.35, -1155.0, "#2a2a2c", 6); CT(0.06, 0.13, 0.18, x, CL-0.79, -1155.0, "#2a3a4a", 14); push("rn_glow", new T.SphereGeometry(0.05, 8, 6), x, CL-0.88, -1155.0, 0, "#ffffff"); }
    lampIn(-1428.75, CL-0.9, -1155.0, [WX1, -1424, -1157, WZ1, FY-0.5, CL+0.2], 0.6, 0xffe8c8); lampIn(-1430.5, CL-0.3, -1152.9, [WX1, -1424, -1157, WZ1, FY-0.5, CL+0.2], 0.35);
    RB(0.24, 0.32, 0.22, -1431.0, FY+1.06, bz-0.25, "#1a1a1c", 0, 0.02); RB(0.32, 0.2, 0.22, -1427.9, FY+1.0, bz-0.25, "#c8ccd0", 0, 0.02);
    C(0.15, 0.03, -1426.1, FY+2.2, bz-0.03, "#f2f0ea", 18, Math.PI/2); }
  // ---- the mudroom: washer and dryer, a bench and hooks, the stair down (its rail) ----
  { for(const z of [-1155.2, -1154.5]){ RB(0.66, 0.92, 0.66, -1420.45, FY+0.46, z, "#f2f0ea", Math.PI/2, 0.03); C(0.18, 0.02, -1420.79, FY+0.5, z, "#3a4a5a", 18, 0, 0, Math.PI/2); }
    addCol(-1420.8, -1420.1, -1155.55, -1154.15, FY-0.06, FY+0.95); RB(0.66, 0.6, 1.4, -1420.45, FY+1.9, -1154.85, "#e8e2d6", 0, 0.02);
    RB(1.2, 0.08, 0.4, -1421.6, FY+0.46, WZ1-0.42, "#6a4a2e", 0, 0.02); for(const x of [-1422.1, -1421.1]) RB(0.06, 0.44, 0.36, x, FY+0.22, WZ1-0.42, "#6a4a2e", 0, 0.01);
    addCol(-1422.2, -1421.0, WZ1-0.62, WZ1-0.2, FY-0.06, FY+0.5); addSeat(-1421.6, WZ1-0.45, FY, 0, "THE MUDROOM BENCH", false, 0.66);
    for(let k=0;k<4;k++) C(0.01, 0.08, -1422.0+k*0.26, FY+1.65, WZ1-0.24, "#3a3a3c", 6, Math.PI/2);
    RB(0.36, 0.7, 0.14, -1421.48, FY+1.28, WZ1-0.3, "#2a3a5a", 0, 0.05); RB(0.3, 0.14, 0.4, -1422.0, FY+0.07, WZ1-0.75, "#3a2a1a", 0, 0.04);
    lampIn(-1422, CL-0.25, -1154.5, [-1424, CX1, -1157, WZ1, BF-0.5, CL+0.2], 0.55); }
  // ---- the wing: the office, the second bedroom (the bump-out its reading nook), the baths, the main bedroom ----
  { // the office: a desk under the window, a chair, a bookcase, a computer
    const d=Fr(-1433.6, WZ0+WT+0.32, faceS, FY); d.f(1.4, 0.05, 0.64, 0, 0.75, 0, "#6a4428", 0.02); for(const a of [-0.62, 0.62]) d.f(0.05, 0.72, 0.6, a, 0.36, 0, "#5a3a22", 0.01); d.col(1.4, 0.64, 0, 0, 0.78);
    d.f(0.55, 0.34, 0.03, 0, 1.0, -0.12, "#141618", 0.01); d.f(0.45, 0.02, 0.15, 0, 0.785, 0.12, "#2a2a2c", 0.006); d.c(0.03, 0.2, 0, 0.87, -0.14, "#2a2a2c", 8);
    const ch=Fr(-1433.6, -1162.8, faceN, FY); ch.f(0.5, 0.08, 0.5, 0, 0.48, 0, "#1a1a1c", 0.04); ch.f(0.46, 0.6, 0.08, 0, 0.86, -0.22, "#1a1a1c", 0.04); ch.c(0.03, 0.42, 0, 0.22, 0, "#3a3a3c", 8); ch.c(0.26, 0.03, 0, 0.03, 0, "#3a3a3c", 10);
    ch.col(0.5, 0.5, 0, 0, 0.6); ch.seat(0, 0.05, "THE DESK CHAIR");
    B(0.34, 1.9, 0.9, -1434.74, FY+0.95, -1161.6, "#5a3a22"); for(let k=0;k<5;k++){ B(0.32, 0.02, 0.86, -1434.74, FY+0.2+k*0.42, -1161.6, "#4a3020");
      for(let j=0;j<6;j++) B(0.22, 0.24, 0.05, -1434.72, FY+0.34+k*0.42, -1161.95+j*0.13, ["#2a4a6a","#7a2a22","#c8a070","#3a5a3a","#e8e2d0","#5a3a6a"][(j*2+k)%6]); }
    addCol(-1434.94, -1434.56, -1162.05, -1161.15, FY-0.06, FY+1.9);
    lampIn(-1433.5, CL-0.25, -1162.3, [-1435, WX1, WZ0, -1160.5, FY-0.5, CL+0.2], 0.5);
    // the hall: a runner, two pictures, its light
    push("wp_rug", boxGeo(0.9, 0.01, 3.2), -1433.5, FY+0.017, -1158.5, 0, "#7a3a2a"); art("z", -1432.06, -1158.9, FY+1.55, 0.5, 0.7, "#8aa0a8", -1); art("z", -1434.94, -1156.9, FY+1.55, 0.4, 0.5, "#c8a070", 1);
    lampIn(-1433.5, CL-0.25, -1158.5, [-1435, WX1, -1160.5, -1156.5, FY-0.5, CL+0.2], 0.4);
    // the second bedroom: a bed against the hall wall, a dresser, the reading chair in the bump-out
    const bd=Fr(-1437.4, -1160.95, faceS, FY), qc="#2a4a6a";
    bd.f(1.5, 0.32, 2.0, 0, 0.18, 0, "#5a3a22", 0.03); bd.f(1.42, 0.22, 1.94, 0, 0.44, 0.02, "#f2f0ea", 0.07); bd.f(1.48, 0.07, 1.4, 0, 0.58, 0.32, qc, 0.03);
    for(const s2 of [-1,1]) bd.f(0.6, 0.14, 0.34, s2*0.36, 0.62, -0.72, "#f4f2ec", 0.06); bd.f(1.56, 1.0, 0.07, 0, 0.5, -1.02, "#5a3a22", 0.02); bd.col(1.56, 2.05, 0, 0, 0.7); bd.seat(0, 0.2, "THE BED");
    const dr=Fr(WX0+WT+0.27, -1162.6, faceE, FY); dr.f(1.0, 0.86, 0.48, 0, 0.43, 0, "#6a4428", 0.02); for(let k=0;k<3;k++) dr.b(0.9, 0.22, 0.012, 0, 0.15+k*0.26, 0.245, "#5a3a22"); dr.col(1.0, 0.48, 0, 0, 0.9);
    const rc=Fr(-1437.4, -1164.7, faceS, FY); rc.f(0.78, 0.42, 0.76, 0, 0.21, 0, "#8a7a5a", 0.07); rc.f(0.78, 0.6, 0.18, 0, 0.7, -0.3, "#8a7a5a", 0.07); for(const s2 of [-1,1]) rc.f(0.15, 0.24, 0.76, s2*0.32, 0.52, 0, "#8a7a5a", 0.05);
    rc.col(0.78, 0.76, 0, 0, 0.9); rc.seat(0, 0.08, "THE READING CHAIR");
    rug(-1439.2, -1435.6, -1163.6, -1161.8, "#c8b098"); lampIn(-1437.5, CL-0.25, -1161.5, [WX0, -1435, BZ0, -1159, FY-0.5, CL+0.2], 0.5);
    // the hall bath: a tub along the west wall, the toilet, the vanity with its mirror
    RB(0.74, 0.55, 1.6, WX0+WT+0.38, FY+0.275, -1157.85, "#f4f2ee", 0, 0.05); addCol(WX0+WT, WX0+WT+0.76, -1158.65, -1157.05, FY-0.06, FY+0.58);
    push("porcelain", new T.CylinderGeometry(0.19, 0.15, 0.40, 16).scale(1, 1, 1.2), -1435.45, FY+0.2, -1157.0, 0, "#ffffff"); B(0.2, 0.38, 0.44, -1435.2+0.0, FY+0.62, -1157.0, "#ffffff");
    addCol(-1435.7, -1435.07, -1157.3, -1156.7, FY-0.06, FY+0.8);
    RB(0.8, 0.82, 0.5, -1437.3, FY+0.41, -1158.68, "#e8e2d6", 0, 0.02); RB(0.84, 0.03, 0.54, -1437.3, FY+0.835, -1158.68, "#e8e4dc", 0, 0.01); push("mirror", planeGeo(0.7, 0.8, 0), -1437.3, FY+1.5, -1158.935, 0, "#ffffff");
    addCol(-1437.72, -1436.88, -1158.94, -1158.4, FY-0.06, FY+0.86);
    lampIn(-1437.5, CL-0.25, -1157.7, [WX0, -1435, -1159, -1156.5, FY-0.5, CL+0.2], 0.45, 0xfff4e4);
    // the main bedroom: a king bed against the back wall, nightstands and lamps, a dresser with a TV, a chair
    const mb=Fr(-1434.4, WZ1-WT-1.05, faceN, FY), mq="#7a5a3a";
    mb.f(1.95, 0.34, 2.1, 0, 0.19, 0, "#4a3020", 0.03); mb.f(1.88, 0.24, 2.04, 0, 0.47, 0.02, "#f2f0ea", 0.08); mb.f(1.94, 0.08, 1.5, 0, 0.62, 0.32, mq, 0.04);
    for(const s2 of [-1,1]) mb.f(0.75, 0.15, 0.36, s2*0.45, 0.66, -0.76, "#f4f2ec", 0.07); mb.f(2.0, 1.15, 0.08, 0, 0.58, -1.07, "#4a3020", 0.03); mb.col(2.0, 2.15, 0, 0, 0.7); mb.seat(0, 0.2, "THE BIG BED");
    for(const s2 of [-1,1]){ const n=Fr(-1434.4+s2*1.3, WZ1-WT-0.24, faceN, FY); n.f(0.48, 0.55, 0.42, 0, 0.275, 0, "#4a3020", 0.02); n.col(0.48, 0.42, 0, 0, 0.6);
      n.c(0.05, 0.12, 0, 0.61, 0, "#c8a050", 10); CT(0.1, 0.15, 0.2, n.x(0,0), FY+0.77, n.z(0,0), "#efe2c4"); }
    const md=Fr(-1436.2, -1156.44+0.26, faceS, FY); md.f(1.5, 0.82, 0.5, 0, 0.41, 0, "#4a3020", 0.02); md.col(1.5, 0.5, 0, 0, 0.9); md.f(0.95, 0.56, 0.05, 0, 1.15, -0.1, "#141618", 0.01);
    rug(-1436.4, -1432.4, -1154.6, -1152.8, "#d8c8b0"); lampIn(-1434.4, CL-0.25, -1154.2, [-1437, WX1, -1156.5, WZ1, FY-0.5, CL+0.2], 0.5);
    // the main bath: a walk-in shower, the toilet, a double vanity
    B(1.2, 0.08, 1.2, WX0+WT+0.6, FY+0.04, WZ1-WT-0.6, "#e8e4dc"); push("glass", planeGeo(1.15, 1.9, 0), WX0+WT+0.6, FY+1.05, WZ1-WT-1.2, 0, "#ffffff");
    C(0.08, 0.02, WX0+WT+0.4, FY+2.0, WZ1-WT-0.4, "#c8ccd0", 12); addCol(WX0+WT, WX0+WT+1.2, WZ1-WT-1.22, WZ1-WT, FY-0.06, FY+2.0);
    push("porcelain", new T.CylinderGeometry(0.19, 0.15, 0.40, 16).scale(1, 1, 1.2), -1438.4, FY+0.2, -1155.95, Math.PI/2, "#ffffff"); B(0.44, 0.38, 0.2, -1438.4, FY+0.62, -1156.32, "#ffffff");
    addCol(-1438.7, -1438.1, -1156.44, -1155.6, FY-0.06, FY+0.8);
    RB(0.52, 0.84, 1.5, WX0+WT+0.27, FY+0.42, -1154.7+0.0, "#4a3a2e", 0, 0.02); RB(0.56, 0.03, 1.54, WX0+WT+0.28, FY+0.855, -1154.7, "#e8e4dc", 0, 0.01);
    push("mirror", planeGeo(1.3, 0.8, 0), WX0+WT+0.012, FY+1.5, -1154.7, Math.PI/2, "#ffffff"); addCol(WX0+WT, WX0+WT+0.56, -1155.45, -1153.95, FY-0.06, FY+0.88);
    lampIn(-1438.5, CL-0.25, -1154.2, [WX0, -1437, -1156.5, WZ1, FY-0.5, CL+0.2], 0.45, 0xfff4e4); }

  /* ======================================================================
     THE GARAGE: a car in the left bay, the bench and pegboard on the east wall, shelves along the back, the fridge,
     the mower, bikes on hooks, a kayak up on the ceiling joists, the openers
     ====================================================================== */
  use("garage");
  { const gi0=GX0+0.1, gi1=GX1-WT, zi0=GZ0+WT, zi1=GZ1-WT, GC=GY+2.85;
    B(gi1-gi0, GY-(Y-0.12), zi1-zi0, (gi0+gi1)/2, (GY+Y-0.12)/2, (zi0+zi1)/2, "#a8a49c");
    { const g=planeGeo(gi1-gi0, zi1-zi0, 0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(gi1-gi0)/3, U.getY(i)*(zi1-zi0)/3); push("rn_conc", g, (gi0+gi1)/2, GY+0.004, (zi0+zi1)/2, 0, "#c8c4ba", -Math.PI/2, 0); }
    addFlat(gi0, gi1, GZ0, zi1, GY); push("wp_wall", planeGeo(gi1-gi0, zi1-zi0, 0.5), (gi0+gi1)/2, GC, (zi0+zi1)/2, 0, "#f0ece4", Math.PI/2, 0);
    for(const [ax, c2, dir, a, b, ops] of [["x", zi0, 1, gi0, gi1, G_FRONT],["x", zi1, -1, gi0, gi1, G_BACK],["z", gi1, -1, zi0, zi1, G_EAST],["z", gi0, 1, zi0, zi1, G_WEST]]) liner("wp_wall", ax, c2, dir, a, b, GY, GC, ops, "#e8e4da");
    // the steps up to the house door
    for(let k=0;k<3;k++){ const h=(FY-GY)*(3-k)/3; RB(0.36, h, 1.1, gi0+0.18+k*0.36, GY+h/2, -1156.15, "#a8a49c", 0, 0.02); }
    addRamp(gi0, gi0+1.08, -1156.7, -1155.6, "x", gi0+1.08, gi0, GY, FY); addFlat(GX0-0.12, gi0+0.02, -1156.6, -1155.7, FY);
    // a car in the left bay (drivable: open the door and back her out)
    parked(1, "#5a5e58", -1418.0, -1159.6, 0, GY);
    // the workbench and pegboard on the east wall
    RB(0.7, 0.06, 2.6, gi1-0.35, GY+0.92, -1159.0, "#9a7a52", 0, 0.01); for(const z of [-1160.2, -1157.8]) for(const x of [gi1-0.62, gi1-0.08]) B(0.06, 0.9, 0.06, x, GY+0.45, z, "#6a5a42");
    B(0.6, 0.04, 2.5, gi1-0.35, GY+0.25, -1159.0, "#8a6a42"); addCol(gi1-0.7, gi1, -1160.3, -1157.7, GY-0.06, GY+0.95);
    B(0.02, 1.0, 2.4, gi1-0.012, GY+1.55, -1159.0, "#b89a6a"); for(let k=0;k<14;k++) B(0.03, 0.12+((k*5)%4)*0.06, 0.03+((k*3)%3)*0.03, gi1-0.04, GY+1.3+((k*7)%5)*0.12, -1160.0+k*0.15, ["#c82a1a","#2a2a2c","#e8b030","#5a6a7a"][k%4]);
    RB(0.5, 0.3, 0.32, gi1-0.35, GY+1.1, -1158.3, "#c82a1a", 0, 0.03); C(0.06, 0.3, gi1-0.3, GY+1.1, -1159.8, "#e8b030", 10);
    // shelves along the back wall, bins on them
    for(const x0 of [gi0+1.4, gi0+3.4]){ for(const y of [0.05, 0.6, 1.15, 1.7]) B(1.8, 0.03, 0.5, x0+0.9, GY+y, zi1-0.26, "#8a8d90"); for(const x of [x0, x0+1.8]) for(const z of [zi1-0.5, zi1-0.02]) B(0.03, 1.75, 0.03, x, GY+0.87, z, "#5a5e60");
      for(let k=0;k<9;k++){ const bx2=x0+0.25+(k%3)*0.62, by=GY+[0.07, 0.62, 1.17][Math.floor(k/3)]; RB(0.5, 0.36, 0.42, bx2, by+0.19, zi1-0.26, ["#2a4a8a","#c8c4ba","#2a2a2c","#c84a2a"][(k+x0)%4|0], 0, 0.03); }
      addCol(x0, x0+1.8, zi1-0.52, zi1, GY-0.06, GY+1.75); }
    // the fridge and the chest freezer; the trash and the recycling
    RB(0.78, 1.7, 0.72, gi1-0.45, GY+0.85, zi1-1.0, "#f2f0ea", 0, 0.03); addCol(gi1-0.84, gi1, zi1-1.36, zi1-0.64, GY-0.06, GY+1.7);
    RB(1.2, 0.85, 0.7, gi1-0.42, GY+0.425, -1162.2, "#f2f0ea", 0, 0.04); addCol(gi1-0.78, gi1, -1162.8, -1161.6, GY-0.06, GY+0.9);
    for(const [z, c] of [[-1163.6, "#2a5a3a"],[-1162.95, "#2a4a8a"]]){ RB(0.6, 1.0, 0.6, gi1-0.32, GY+0.5, z, c, 0, 0.05); }
    addCol(gi1-0.64, gi1, -1163.95, -1162.6, GY-0.06, GY+1.0);
    // the mower in the right bay's corner; two bikes on hooks; the kayak overhead; the openers on their rails
    { const mx=-1413.8, mz=-1155.0; RB(0.55, 0.32, 0.8, mx, GY+0.3, mz, "#2a6a3a", 0, 0.06); for(const [a, b] of [[-0.25,-0.3],[0.25,-0.3],[-0.25,0.3],[0.25,0.3]]) C(0.1, 0.06, mx+a, GY+0.1, mz+b, "#1a1a1a", 12, 0, 0, Math.PI/2);
      tubeE(V3(mx-0.22, GY+0.45, mz+0.35), V3(mx-0.22, GY+1.0, mz+0.9), 0.015, "#2a2a2c"); tubeE(V3(mx+0.22, GY+0.45, mz+0.35), V3(mx+0.22, GY+1.0, mz+0.9), 0.015, "#2a2a2c"); tubeE(V3(mx-0.22, GY+1.0, mz+0.9), V3(mx+0.22, GY+1.0, mz+0.9), 0.015, "#2a2a2c");
      addCol(mx-0.32, mx+0.32, mz-0.45, mz+0.95, GY-0.06, GY+1.0); }
    for(const [x, c] of [[-1415.6, "#c82a1a"],[-1414.8, "#2a6ad8"]]){ const z=zi1-0.6; for(const dy of [0.6, 1.66]) ent(new T.TorusGeometry(0.33, 0.025, 6, 24), x, GY+1.0+dy, z, "#1a1a1a", 0, Math.PI/2, 0);
      tubeE(V3(x, GY+1.6, z), V3(x, GY+2.26, z+0.05), 0.02, c); C(0.01, 0.1, x, GY+2.65, z, "#8a8d90", 6); }
    addCol(-1415.9, -1414.5, zi1-0.95, zi1-0.25, GY+1.0, GY+2.7);
    { const k=new T.SphereGeometry(1, 16, 8); k.scale(0.32, 0.16, 1.8); ent(k, -1414.5, GC-0.32, -1160.0, "#e8862a"); for(const z of [-1161.2, -1158.8]) tubeE(V3(-1415, GC-0.4, z), V3(-1414, GC-0.4, z), 0.015, "#5a5e60"); }
    for(const op of G_FRONT){ const xm=(op.a+op.b)/2; B(0.06, 0.06, 3.2, xm, GC-0.2, -1161.8, "#8a8d90"); RB(0.36, 0.18, 0.5, xm, GC-0.28, -1160.0, "#e8e4dc", 0, 0.03); push("rn_glow", boxGeo(0.12, 0.02, 0.2), xm, GC-0.38, -1160.0, 0, "#ffffff"); }
    for(const x of [-1418.0, -1414.3]) for(const z of [-1161.0, -1155.5]){ push("tube", boxGeo(1.2, 0.03, 0.15, 0), x, GC-0.02, z, 0, "#ffffff"); }
    lampIn(-1416.2, GC-0.3, -1160.5, [GX0, GX1, GZ0, GZ1, GY-0.5, GC+0.2], 0.7, 0xf2f6f2); lampIn(-1416.2, GC-0.3, -1155.0, [GX0, GX1, GZ0, GZ1, GY-0.5, GC+0.2], 0.6, 0xf2f6f2);
    RANCH.radio={x:gi1-0.35, y:GY+1.05, z:-1158.3, station:2, house:"THE STONE HOUSE", zone:"THE STONE HOUSE · GARAGE", vol:0.5, reach:20}; WESTPARK.radios.push(RANCH.radio); }

  /* ======================================================================
     THE BASEMENT: the rec room (sectional and TV, the bar, the card table), the game room, the guest room, the bath, the mechanical room
     ====================================================================== */
  use("basement");
  const QX0=WX0+WT, QX1=CX1-0.1-WT/2, QZ0=WZ0+WT, QZ1=WZ1-WT;
  const lampU=(x, y, z, k, col, dist)=>{ const o2={x:x, y:y, z:z, color:col||0xfff0dc, intensity:(k||0.55)*1.6, dist:(dist||6)*1.2, decay:1.5, indoor:true, under:true, vol:[WX0, CX1, WZ0, WZ1, BF-0.5, FY+1.1]}; LAMPS.push(o2); return o2; };
  B(QX1-QX0, 0.2, QZ1-QZ0, (QX0+QX1)/2, BF-0.1, (QZ0+QZ1)/2, "#7a746c");
  const bfloor=(bk, x0, x1, z0, z1, col, s)=>{ const g=planeGeo(x1-x0, z1-z0, 0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(x1-x0)*(s||0.5), U.getY(i)*(z1-z0)*(s||0.5));
    push(bk, g, (x0+x1)/2, BF+0.004, (z0+z1)/2, 0, col||"#ffffff", -Math.PI/2, 0); };
  bfloor("rn_carpet", -1434.94, QX1, QZ0, -1157.0, "#7a6a58"); bfloor("rn_carpet", -1434.94, -1422.75, -1157.0, QZ1, "#7a6a58"); bfloor("rn_carpet", QX0, -1435.06, QZ0, -1158.56, "#b8ac98");
  bfloor("rn_tile", QX0, -1435.06, -1158.44, -1155.06, "#ffffff", 1.0); bfloor("rn_conc", QX0, -1435.06, -1154.94, QZ1, "#c8c4ba", 0.3);
  bfloor("rn_conc", -1422.63, QX1, -1156.94, QZ1, "#a8a49a", 0.3);
  addFlat(QX0, QX1, QZ0, QZ1, BF);
  addVoid(WX0, CX1, WZ0, WZ1, BF-3, FY-0.4, BF);
  addBuried(WX0, CX1, WZ0, WZ1, BF-0.5, BCL+0.4, 1.0, 0xb09a7a);
  addZone(WX0, CX1, WZ0, WZ1, BF-0.5, BCL+0.3, "THE STONE HOUSE · BASEMENT", true);
  // the foundation's inner faces, panelled in drywall; the partitions
  for(const [ax, c2, dir, a, b] of [["x", QZ0, 1, QX0, QX1],["x", QZ1, -1, QX0, QX1],["z", QX0, 1, QZ0, QZ1],["z", QX1, -1, QZ0, QZ1]]) liner("wp_wall", ax, c2, dir, a, b, BF, BCL, [], "#ece6da");
  const bw=(ax, c2, a, b, ops)=>wall("wp_wall", ax, c2, PT, a, b, BF, BCL, ops, "#ece6da", BF);
  const BD=(a, b)=>o(a, b, BF-0.01, BF+2.05);
  // (the rooms along the west side 4.8 m wide, a metre more than they were, so there is room to get round the bed, the bath and the shelves)
  bw("z", -1435, QZ0, QZ1, [BD(-1159.6, -1158.75), BD(-1156.4, -1155.55), BD(-1153.85, -1153.0)]);
  bw("x", -1158.5, QX0, -1435.06, []); bw("x", -1155, QX0, -1435.06, []);
  // (the old mechanical room opened into the rec room as its game room; the furnace and the rest in the pocket by the stair)
  bw("x", -1157, -1423.94, QX1, [BD(-1421.85, -1421.0)]);
  bw("z", -1422.69, -1156.94, QZ1, []);
  for(const [xf, l] of [[XF(-1435, -1159.58, -Math.PI/2), "THE GUEST ROOM"],[XF(-1435, -1156.38, -Math.PI/2), "THE BASEMENT BATH"],[XF(-1435, -1153.83, -Math.PI/2), "THE STORAGE ROOM"],[XF(-1421.83, -1157, 0), "THE MECHANICAL ROOM"]])
    makeDoor(xf, 0, BF+0.01, 0, l, true, l==="THE GUEST ROOM" ? 0.95 : 0, "closet", 0xf2eee6);   // (shut, or the guest room's standing open)
  // the stair down from the mudroom: treads and risers in oak, a rail on its open side
  // the trim: an oak wainscot round the rec room and the game room (panels, stiles, a chair rail, a tall base), painted baseboards
  // in the rest. Each run stops 7.5 cm past a doorway; an x wall's pieces stand 2 mm taller than a z wall's, so no tops meet in a plane.
  const runs=(a, b, gaps)=>{ const out=[]; let s0=a; for(const [g0, g1] of gaps.slice().sort((p, q)=>p[0]-q[0])){ if(g0-0.075>s0+0.02) out.push([s0, g0-0.075]); s0=Math.max(s0, g1+0.075); } if(b>s0+0.02) out.push([s0, b]); return out; };
  const along=(ax, fc, dir, u0, u1, d0, d1, y0, y1, col)=>{ const um=(u0+u1)/2, dm=fc+dir*(d0+d1)/2, L=u1-u0, D=d1-d0;
    if(ax==="x") B(L, y1-y0, D, um, (y0+y1)/2, dm, col); else B(D, y1-y0, L, dm, (y0+y1)/2, um, col); };
  const wains=(ax, fc, dir, a, b, gaps)=>{ const e=ax==="x" ? 0.002 : 0, oak="#6a4428";
    for(const [u0, u1] of runs(a, b, gaps)){ along(ax, fc, dir, u0, u1, -0.002, 0.012, BF, BF+0.95, "#7a5030");
      along(ax, fc, dir, u0, u1, -0.002, 0.034, BF+0.95, BF+1.0+e, oak); along(ax, fc, dir, u0, u1, -0.002, 0.024, BF, BF+0.14+e, oak);
      along(ax, fc, dir, u0, u1, -0.002, 0.02, BF+0.87, BF+0.9+e, oak);
      const n=Math.max(1, Math.round((u1-u0)/0.62)); for(let k=0;k<=n;k++){ const u=u0+0.035+(u1-u0-0.07)*k/n; along(ax, fc, dir, u-0.035, u+0.035, 0.012, 0.019, BF+0.14+e, BF+0.87, oak); } } };
  const based=(ax, fc, dir, a, b, gaps)=>{ const e=ax==="x" ? 0.002 : 0; for(const [u0, u1] of runs(a, b, gaps)){ along(ax, fc, dir, u0, u1, -0.002, 0.018, BF, BF+0.12+e, "#f4f0e6");
      along(ax, fc, dir, u0, u1, -0.002, 0.024, BF+0.12+e, BF+0.135+e*2, "#f4f0e6"); } };
  const WD=[[-1159.6, -1158.75],[-1156.4, -1155.55],[-1153.85, -1153.0]];
  wains("x", QZ0, 1, -1434.94, QX1, []); wains("x", QZ1, -1, -1434.94, -1422.75, []); wains("z", -1434.94, 1, QZ0, QZ1, WD);
  wains("z", QX1, -1, QZ0, -1157.06, []); wains("x", -1157.06, -1, -1423.94, QX1, [[-1421.85, -1421.0]]);
  based("x", QZ0, 1, QX0, -1435.06, []); based("x", QZ1, -1, QX0, -1435.06, []); based("z", QX0, 1, QZ0, QZ1, []); based("z", -1435.06, -1, QZ0, QZ1, WD);
  for(const zc of [-1158.5, -1155]) for(const sd of [-1, 1]) based("x", zc+sd*0.06, sd, QX0, -1435.06, []);
  // fifteen risers at a 24.5 cm run, so the foot of the stair leaves a landing before the back wall; the last two steps open to the rec room
  const NR=15, RS=(FY-BF)/NR, RUN=0.245, STZ1=SWZ0+NR*RUN, SX=(SWX0+SWX1)/2, SW=SWX1-SWX0, nose=z=>FY-(z-SWZ0)*RS/RUN;
  { for(let k=0;k<NR;k++){ const y=FY-(k+1)*RS, za=SWZ0+k*RUN, zb=za+RUN;
      B(SW-0.004, y-0.03-(BF-0.05), RUN, SX, (y-0.03+BF-0.05)/2, (za+zb)/2, "#f2eee4");                      // (the riser and the closed side, painted)
      RB(SW, 0.03, RUN+0.03, SX, y-0.015, (za+zb)/2+0.015, k%2 ? "#8a5a32" : "#84562e", 0, 0.01); }       // (the oak tread, its nose over the riser below)
    B(SW-0.004, BCL-BF-0.01, SWZ0-(-1156.94)-0.002, SX, (BCL+BF)/2-0.005, (SWZ0-1156.94)/2, "#f2eee4");     // (the slot under the stair's head closed)
    addRamp(SWX0, SWX1, SWZ0, STZ1, "z", STZ1, SWZ0, BF, FY);
    addVoid(SWX0, SWX1, SWZ0, SWZ1, BF-1, FY+0.6, BF);
    addBuried(SWX0-0.25, SWX1+0.25, SWZ0, SWZ1+0.1, BF+1.0, FY+1.6, 0.8, 0x9a8a72, [FY+1.55, BF+1.75]);   // (by degrees the whole way down)
    // the stringer along the rec room's side, over the steps' teeth
    { const ang=Math.atan(RS/RUN), L=Math.hypot(NR*RUN, NR*RS)+0.1, zm=(SWZ0+STZ1)/2; ent(boxGeo(0.035, (RS+0.1)*Math.cos(ang), L), SWX0-0.017, nose(zm)-RS/2, zm, "#6a4428", ang, 0, 0); }
    // the guard on that side: balusters on the stringer, the rail, a newel at the foot two steps up; a rail on the pocket wall
    const gz1=STZ1-2*RUN, rh=0.9;
    for(let z=SWZ0+0.3; z<gz1-0.05; z+=0.12){ const y0=nose(z)+0.03, y1=Math.min(nose(z)+rh, BCL); if(y1-y0>0.05) B(0.028, y1-y0, 0.028, SWX0-0.017, (y0+y1)/2, z, "#f2eee4"); }
    { const ze=SWZ0+(FY+rh-BCL)*RUN/RS, ang=Math.atan(RS/RUN), L=Math.hypot(gz1-ze, (gz1-ze)*RS/RUN), zm=(ze+gz1)/2;
      ent(rboxGeo(0.07, 0.05, L, 0.015, 2), SWX0-0.017, nose(zm)+rh+0.025, zm, "#5a3a22", ang, 0, 0); }
    { const top=nose(gz1)+rh+0.08; RB(0.1, top-BF, 0.1, SWX0-0.017, (top+BF)/2, gz1, "#5a3a22", 0, 0.015); }                  // (the newel, down to the floor) RB(0.13, 0.05, 0.13, SWX0-0.017, nose(gz1)+rh+0.1, gz1, "#4a2e1a", 0, 0.02);
    addCol(SWX0-0.06, SWX0, SWZ0-0.4, gz1+0.06, BF-0.5, FY+0.95);
    { const za=SWZ0+(FY+0.86-BCL+0.15)*RUN/RS, zb=STZ1+0.2; tubeE(V3(-1422.81, nose(za)+0.86, za), V3(-1422.81, BF+0.86, zb), 0.022, "#5a3a22");
      for(let z=za+0.3; z<zb; z+=1.1){ const y=nose(Math.min(z, STZ1))+0.86-0.06; C(0.008, 0.06, -1422.77, y, z, "#c8a050", 6, 0, 0, Math.PI/2); } }
    // upstairs, the rail on the mudroom's side: a newel, balusters close set, a cap
    B(0.05, 0.05, SWZ1-SWZ0-0.7, SWX1+0.03, FY+0.92, (SWZ0+0.7+SWZ1)/2, "#5a3a22"); for(let z=SWZ0+0.82; z<SWZ1-0.05; z+=0.12) B(0.025, 0.87, 0.025, SWX1+0.03, FY+0.465, z, "#f2eee4");
    RB(0.1, 1.05, 0.1, SWX1+0.03, FY+0.525, SWZ0+0.7, "#5a3a22", 0, 0.015); RB(0.13, 0.05, 0.13, SWX1+0.03, FY+1.07, SWZ0+0.7, "#4a2e1a", 0, 0.02);
    addCol(SWX1, SWX1+0.07, SWZ0+0.65, SWZ1, FY-0.2, FY+0.95);
    // a picture at the foot, on the back wall you come down facing
    RB(0.62, 0.82, 0.035, SX, BF+1.5, QZ1-0.0175, "#2a1e14", 0, 0.01);
    sign(0.52, 0.72, (c, W, H)=>{ const g=c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#c8a878"); g.addColorStop(0.55, "#e8d0a0"); g.addColorStop(1, "#5a6a3a"); c.fillStyle=g; c.fillRect(0, 0, W, H);
      c.fillStyle="#3a4a2a"; for(let i=0;i<5;i++){ const x=W*(0.15+i*0.18); c.beginPath(); c.moveTo(x, H*0.35+i%2*20); c.lineTo(x-W*0.09, H*0.78); c.lineTo(x+W*0.09, H*0.78); c.fill(); }
      c.fillStyle="#2a2a1a"; c.fillRect(0, H*0.78, W, H*0.22); c.strokeStyle="#f2ece0"; c.lineWidth=12; c.strokeRect(6, 6, W-12, H-12); }, SX, BF+1.5, QZ1-0.045, Math.PI, false, 300);
    lampU((SWX0+SWX1)/2, BCL-0.15, -1154.2, 0.45); }
  // the ceiling's recessed lights, and the rec room's lamps
  for(const [x, z] of [[-1433,-1162],[-1429,-1162],[-1425.5,-1162],[-1433,-1158],[-1429,-1158],[-1425.5,-1158],[-1433,-1154],[-1429,-1154],[-1425.5,-1154],[-1438,-1161],[-1438,-1156.7],[-1423.4,-1158.2],[-1423.4,-1162.6]])
    { C(0.09, 0.012, x, BCL-0.004, z, "#e8e4dc", 14); push("rn_glow", new T.CylinderGeometry(0.07, 0.07, 0.01, 14), x, BCL-0.012, z, 0, "#ffffff"); }
  for(const [x, z] of [[-1430, -1161.5],[-1426.5, -1158.6],[-1433, -1155.5]]) lampU(x, BCL-0.75, z, 0.6, 0xffe6c8);   // (well down, so the ceiling takes the light too)
  lampU(-1438, BCL-0.25, -1161, 0.45); lampU(-1438, BCL-0.25, -1156.7, 0.4, 0xfff4e4); 
  { // the sectional facing the TV on the front wall; a coffee table; a rug
    const tvx=-1430.0; B(1.8, 0.5, 0.45, tvx, BF+0.25, QZ0+0.23, "#3a2a1e"); B(1.64, 0.94, 0.05, tvx, BF+1.28, QZ0+0.04, "#121416"); push("lk_tvon", planeGeo(1.56, 0.86, 0), tvx, BF+1.28, QZ0+0.068, 0, "#ffffff");
    addCol(tvx-0.9, tvx+0.9, QZ0, QZ0+0.46, BF-0.5, BF+0.5);
    for(const sx of [tvx-0.6, tvx+0.6]) RB(0.2, 0.9, 0.2, sx, BF+0.95, QZ0+0.25, "#1a1a1c", 0, 0.04);
    const so=Fr(tvx, -1159.2, faceN, BF), sc="#4a4e56";
    so.f(3.0, 0.44, 0.95, 0, 0.22, 0, sc, 0.09); so.f(3.0, 0.5, 0.24, 0, 0.67, -0.36, sc, 0.09); so.f(0.95, 0.44, 1.8, 1.05, 0.22, 1.25, sc, 0.09); so.f(0.24, 0.5, 1.8, 1.42, 0.67, 1.25, sc, 0.09);
    so.col(3.0, 0.95, 0, 0, 0.9); addCol(so.x(1.05, 1.25)-0.48, so.x(1.05, 1.25)+0.48, so.z(1.05, 1.25)-0.9, so.z(1.05, 1.25)+0.9, BF-0.5, BF+0.9);
    for(const lx of [-1.0, 0, 1.0]) so.seat(lx, 0.1, "THE BIG SECTIONAL"); for(const lx of [-0.9, 0.3]) so.f(0.45, 0.4, 0.14, lx, 0.82, -0.2, "#c8a070", 0.06);
    RB(1.2, 0.4, 0.6, tvx+0.35, BF+0.2, -1160.6, "#5a3a22", 0, 0.05); addCol(tvx-0.25, tvx+0.95, -1160.9, -1160.3, BF-0.5, BF+0.42);
    push("wp_rug", boxGeo(3.4, 0.010, 2.6), tvx, BF+0.017, -1160.4, 0, "#c8b8a0");
    // the bar along the back wall: a counter with a padded front, stools, the back counter with a mini-fridge and shelves of glasses
    const bx0=-1434.4, bx1=-1431.0, bz=QZ1-1.4;
    RB(bx1-bx0, 1.04, 0.55, (bx0+bx1)/2, BF+0.52, bz, "#4a2e1a", 0, 0.02); push("wp_wood", boxGeo(bx1-bx0+0.1, 0.06, 0.7, 0.8), (bx0+bx1)/2, BF+1.07, bz+0.04, 0, "#ffffff");
    push("wp_vinylpad", boxGeo(bx1-bx0-0.06, 0.6, 0.04, 4), (bx0+bx1)/2, BF+0.6, bz-0.3, 0, "#3a4a6a");
    addCol(bx0, bx1, bz-0.32, bz+0.42, BF-0.5, BF+1.1);
    for(let k=0;k<3;k++){ const sx=bx0+0.6+k*1.1, sz=bz-0.75; C(0.19, 0.07, sx, BF+0.76, sz, "#1a1a1c", 18); C(0.025, 0.72, sx, BF+0.37, sz, "#c8ccd0", 8); C(0.17, 0.02, sx, BF+0.012, sz, "#c8ccd0", 16);
      addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, BF-0.5, BF+0.8); addSeat(sx, sz, BF, Math.PI, "A STOOL AT THE BAR", false, 0.34); }
    RB(bx1-bx0, 0.9, 0.5, (bx0+bx1)/2, BF+0.45, QZ1-0.26, "#3a2414", 0, 0.02); RB(0.5, 0.8, 0.5, bx1-0.4, BF+0.4, QZ1-0.27, "#1a1a1c", 0, 0.02);
    for(const y of [1.45, 1.85]) B(bx1-bx0-0.6, 0.03, 0.22, (bx0+bx1)/2, BF+y, QZ1-0.12, "#3a2414");
    for(let k=0;k<18;k++){ const x=bx0+0.5+k*0.2, y=k<9 ? 1.465 : 1.865; if(x>bx1-0.4) continue; CT(0.035, 0.03, 0.12, x, BF+y+0.06, QZ1-0.12, "#d8e8f0", 10); }
    addCol(bx0, bx1, QZ1-0.52, QZ1, BF-0.5, BF+2.0);
    sign(1.4, 0.4, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0,0,Wd,Hh); c.shadowColor="#ff7a2a"; c.shadowBlur=14; say(c, "BASEMENT BAR", Wd/2, Hh/2, Wd*0.80, Hh*0.55, "#ff9a3a", "800", "'Arial Black', Arial"); c.shadowBlur=0; },
      (bx0+bx1)/2, BF+2.12, QZ1-0.03, Math.PI, true, 420);
    lampU((bx0+bx1)/2, BF+2.0, bz, 0.35, 0xffb070, 4);
    // the card table between the bar and the sectional: felt in a wooden rail, chips and a hand dealt, four padded chairs, a pendant over it
    { const px=-1428.0, pz=-1155.5;
      C(0.74, 0.05, px, BF+0.745, pz, "#3a2414", 32); C(0.62, 0.012, px, BF+0.772, pz, "#1e5a3a", 32); C(0.075, 0.66, px, BF+0.38, pz, "#3a2414", 14); C(0.34, 0.05, px, BF+0.03, pz, "#3a2414", 24);
      addCol(px-0.74, px+0.74, pz-0.74, pz+0.74, BF-0.5, BF+0.78);
      for(let k=0;k<4;k++){ const a=k/4*Math.PI*2+Math.PI/4, sx=px+Math.sin(a)*1.0, sz=pz+Math.cos(a)*1.0, ry=Math.atan2(px-sx, pz-sz), f=Fr(sx, sz, ry, BF);
        f.f(0.46, 0.08, 0.46, 0, 0.47, 0, "#5a2e1a", 0.03); f.f(0.44, 0.5, 0.07, 0, 0.78, -0.2, "#5a2e1a", 0.03);
        for(const a2 of [-0.18, 0.18]) for(const b of [-0.18, 0.18]) f.f(0.045, 0.44, 0.045, a2, 0.22, b, "#3a2414", 0.012);
        f.col(0.46, 0.46, 0, 0, 0.5); f.seat(0, 0.06, "A CHAIR AT THE CARD TABLE");
        // each place: a stack or two of chips, two cards face down
        for(let j=0;j<2;j++) for(let h=0;h<3+((k+j)%3);h++) C(0.02, 0.0045, px+Math.sin(a)*0.42+Math.cos(a)*(j*0.05-0.03), BF+0.7815+h*0.005, pz+Math.cos(a)*0.42-Math.sin(a)*(j*0.05-0.03), ["#c82a1a","#1a1a1a","#2a4a9a","#f2f0ea"][(j+k)%4], 12);
        for(let j=0;j<2;j++) B(0.063, 0.003, 0.088, px+Math.sin(a)*0.3+Math.cos(a)*(j*0.03-0.015), BF+0.7815+j*0.004, pz+Math.cos(a)*0.3-Math.sin(a)*(j*0.03-0.015), j ? "#8a1a1a" : "#7a1a1a", ry+j*0.2); }
      for(let h=0;h<6;h++) C(0.022, 0.0045, px+0.05, BF+0.7815+h*0.005, pz-0.06, ["#c82a1a","#2a4a9a","#1a1a1a"][h%3], 12);
      B(0.063, 0.02, 0.088, px-0.08, BF+0.789, pz+0.05, "#7a1a1a");                                                   // (the deck)
      C(0.006, BCL-(BF+1.95), px, (BCL+BF+1.95)/2, pz, "#2a2a2c", 6); CT(0.12, 0.32, 0.24, px, BF+1.84, pz, "#3a2a1e", 24);
      push("rn_glow", new T.CylinderGeometry(0.26, 0.26, 0.01, 20), px, BF+1.715, pz, 0, "#ffffff"); lampU(px, BF+1.6, pz, 0.5, 0xffd6a0, 4.5); }
    // a dartboard on the wing's wall, a framed jersey, a shelf of board games, a mini arcade in the corner
    // (the dartboard on the rec room's side of the west partition, a clear oche in front of it; the jersey beside it)
    { const wx=-1434.94, dz=-1160.5, dy=BF+1.73;
      RB(0.04, 0.66, 0.66, wx+0.025, dy, dz, "#4a2e1a", 0, 0.012);                         // (the backer it hangs on)
      // the board itself, drawn: twenty black and cream wedges, the red and green doubles and trebles, the bull
      sign(0.5, 0.5, (c, W, H)=>{ const cx=W/2, cy=H/2, R=W*0.48; c.fillStyle="#4a2e1a"; c.fillRect(0, 0, W, H);
        c.fillStyle="#141414"; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
        const ring=(r0, r1, cols)=>{ for(let k=0;k<20;k++){ const a0=(k-0.5)/20*Math.PI*2-Math.PI/2, a1=a0+Math.PI*2/20; c.fillStyle=cols[k%2];
          c.beginPath(); c.arc(cx, cy, r1, a0, a1); c.arc(cx, cy, r0, a1, a0, true); c.closePath(); c.fill(); } };
        ring(R*0.10, R*0.78, ["#1a1a1a","#e8dcc0"]); ring(R*0.70, R*0.78, ["#c8281e","#1e7a3a"]); ring(R*0.42, R*0.48, ["#c8281e","#1e7a3a"]);
        ring(R*0.10, R*0.42, ["#1a1a1a","#e8dcc0"]); ring(R*0.48, R*0.70, ["#1a1a1a","#e8dcc0"]);
        c.fillStyle="#1e7a3a"; c.beginPath(); c.arc(cx, cy, R*0.10, 0, 7); c.fill(); c.fillStyle="#c8281e"; c.beginPath(); c.arc(cx, cy, R*0.045, 0, 7); c.fill();
        c.strokeStyle="#b8b8b0"; c.lineWidth=1; for(const r of [0.10, 0.42, 0.48, 0.70, 0.78]){ c.beginPath(); c.arc(cx, cy, R*r, 0, 7); c.stroke(); } },
        wx+0.058, dy, dz, Math.PI/2, false, 256);
      B(0.6, 0.02, 0.03, wx+2.37, BF+0.012, dz, "#c82a1a"); }                            // (the oche on the carpet, 2.37 m out)
    // two pictures on the front wall either side of the set: a lake under the hills, a farm in autumn, each in a dark frame
    for(const [px, k] of [[-1433.3, 0], [-1426.7, 1]]){ const py=BF+1.45, pz=QZ0;
      RB(0.92, 0.66, 0.035, px, py, pz+0.0175, "#2a1e14", 0, 0.01);
      sign(0.82, 0.56, (c, W, H)=>{ const g=c.createLinearGradient(0, 0, 0, H*0.6); g.addColorStop(0, k ? "#e8b878" : "#8ab0d0"); g.addColorStop(1, k ? "#f0d8a8" : "#d8e4e8");
        c.fillStyle=g; c.fillRect(0, 0, W, H);
        c.fillStyle=k ? "#8a6a4a" : "#5a6a7a"; c.beginPath(); c.moveTo(0, H*0.55); for(let x=0;x<=W;x+=W/12) c.lineTo(x, H*(0.40+0.12*Math.sin(x/W*7+k))); c.lineTo(W, H*0.62); c.lineTo(0, H*0.62); c.fill();
        c.fillStyle=k ? "#a86a2a" : "#3a5a3a"; c.beginPath(); c.moveTo(0, H*0.62); for(let x=0;x<=W;x+=W/10) c.lineTo(x, H*(0.55+0.06*Math.sin(x/W*11+2))); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        if(!k){ c.fillStyle="#6a90b0"; c.fillRect(0, H*0.66, W, H*0.12); c.fillStyle="rgba(255,255,255,0.35)"; for(let i=0;i<14;i++) c.fillRect((i*37)%W, H*0.68+(i%4)*5, 18, 1.5); }
        else { c.fillStyle="#8a2a1e"; c.fillRect(W*0.62, H*0.48, W*0.14, H*0.14); c.fillStyle="#5a2a1a"; c.beginPath(); c.moveTo(W*0.60, H*0.48); c.lineTo(W*0.69, H*0.40); c.lineTo(W*0.78, H*0.48); c.fill();
          for(let i=0;i<6;i++){ c.fillStyle=["#c8601e","#d8a030","#a8401e"][i%3]; c.beginPath(); c.arc(W*(0.12+i*0.08), H*0.58, W*0.035, 0, 7); c.fill(); } }
        c.strokeStyle="#f2ece0"; c.lineWidth=10; c.strokeRect(5, 5, W-10, H-10); },
        px, py, pz+0.045, 0, false, 340); }
    B(0.03, 0.9, 0.7, -1434.94+0.02, BF+1.5, -1162.4, "#3a2a1a"); B(0.02, 0.8, 0.6, -1434.94+0.04, BF+1.5, -1162.4, "#e8b030");
    // THE GAME ROOM (where the mechanical room was, open to the rec room): a pool table under its lamp, a cue rack, the wine rack,
    // the arcade cabinet, a shelf of board games, two leather club chairs and a lamp table between them
    { const tx=-1422.1, tz=-1160.4, wood="#4a2a16";
      RB(1.5, 0.16, 2.7, tx, BF+0.62, tz, wood, 0, 0.03); B(1.27, 0.06, 2.47, tx, BF+0.73, tz, "#1e6a3e");
      for(const sd of [-1,1]){ RB(0.13, 0.08, 2.7, tx+sd*0.69, BF+0.78, tz, wood, 0, 0.02); RB(1.25, 0.08, 0.13, tx, BF+0.78, tz+sd*1.285, wood, 0, 0.02);
        B(0.025, 0.05, 2.47, tx+sd*0.623, BF+0.785, tz, "#1a5a34"); B(1.22, 0.05, 0.025, tx, BF+0.785, tz+sd*1.223, "#1a5a34"); }
      for(const [a2, b2] of [[-1,-1],[1,-1],[-1,1],[1,1],[-1,0],[1,0]]) C(0.055, 0.012, tx+a2*0.64, BF+0.826, tz+b2*1.24, "#0e0e0e", 14);
      for(let k=0;k<6;k++) for(const sd of [-1,1]) C(0.008, 0.004, tx+sd*0.69, BF+0.8225, tz-1.0+k*0.4, "#e8e0c8", 8);
      for(const [a2, b2] of [[-1,-1],[1,-1],[-1,1],[1,1]]) RB(0.17, 0.56, 0.17, tx+a2*0.58, BF+0.27, tz+b2*1.15, wood, 0, 0.03);
      addCol(tx-0.76, tx+0.76, tz-1.36, tz+1.36, BF-0.5, BF+0.83);
      // the rack at the foot spot, the cue ball at the head
      const bc=["#e8c020","#1a3aa8","#c81e1e","#5a1e8a","#e86a1a","#1a7a3a","#7a1a1a","#111111","#e8c020","#1a3aa8","#c81e1e","#5a1e8a","#e86a1a","#1a7a3a","#7a1a1a"];
      let n=0; for(let r=0;r<5;r++) for(let c=0;c<=r;c++){ const g=new T.SphereGeometry(0.0285, 12, 8); ent(g, tx+(c-r/2)*0.058, BF+0.76+0.0285, tz+0.62+r*0.05, n>7 ? "#f2eee0" : bc[n]); if(n>7) S(0.0295, tx+(c-r/2)*0.058, BF+0.76+0.0285, tz+0.62+r*0.05, bc[n], 1, 0.45, 1); n++; }
      S(0.0285, tx+0.05, BF+0.7885, tz-0.65, "#f6f4ee"); B(0.3, 0.012, 0.27, tx, BF+0.802, tz+0.72, "#2a1a0e");    // (the cue ball; the rack lifted off, set by)
      tubeE(V3(tx+0.3, BF+0.795, tz-0.9), V3(tx-0.2, BF+0.795, tz+0.4), 0.007, "#c8a070");                             // (a cue left lying)
      // the lamp: three green shades on a brass bar
      for(const dz of [-0.6, 0.6]) C(0.005, BCL-(BF+1.86), tx, (BCL+BF+1.86)/2, tz+dz, "#3a3a3c", 6);
      RB(0.06, 0.05, 1.5, tx, BF+1.86, tz, "#b8902a", 0, 0.015);
      for(const dz of [-0.55, 0, 0.55]){ CT(0.06, 0.19, 0.17, tx, BF+1.75, tz+dz, "#1e4a2e", 20); push("rn_glow", new T.CylinderGeometry(0.16, 0.16, 0.01, 18), tx, BF+1.672, tz+dz, 0, "#ffffff"); }
      lampU(tx, BF+1.6, tz, 0.7, 0xffe2b0, 5);
      // the cue rack on the east wall
      RB(0.03, 1.2, 0.56, QX1-0.03, BF+1.05, tz, "#3a2414", 0, 0.01); for(let k=0;k<6;k++){ const z=tz-0.22+k*0.088; tubeE(V3(QX1-0.075, BF+0.12, z), V3(QX1-0.075, BF+1.5, z), 0.009, ["#c8a070","#3a2414","#8a5a32"][k%3]); }
      B(0.06, 0.05, 0.52, QX1-0.06, BF+0.13, tz, "#3a2414"); addCol(QX1-0.12, QX1, tz-0.3, tz+0.3, BF-0.5, BF+1.6);
      // the wine rack: a tall cabinet of cubbies, the bottles' ends showing
      { const wz=-1162.25; RB(0.38, 1.9, 0.9, QX1-0.19, BF+0.95, wz, "#3a2414", 0, 0.015);
        for(let r=0;r<7;r++) for(let c=0;c<6;c++) C(0.034, 0.05, QX1-0.395, BF+0.2+r*0.22, wz-0.35+c*0.14, ["#2a3a1e","#4a0e14","#1e2a1a","#3a0a10"][(r*3+c)%4], 10, 0, 0, Math.PI/2);
        addCol(QX1-0.42, QX1, wz-0.46, wz+0.46, BF-0.5, BF+1.9); }
      // the arcade cabinet in the north-east corner, facing in
      { const ax=QX1-0.32, az=-1163.42; RB(0.62, 1.7, 0.6, ax, BF+0.85, az, "#1a2a5a", 0, 0.04); B(0.02, 0.4, 0.46, ax-0.32, BF+1.3, az, "#121416"); push("rn_glow", planeGeo(0.42, 0.34, 0), ax-0.335, BF+1.3, az, -Math.PI/2, "#ffffff");
        addCol(ax-0.31, ax+0.31, az-0.3, az+0.3, BF-0.5, BF+1.7); }
      // the board games on the east wall by the mechanical room's door
      { const gx=QX1-0.16, gz=-1158.3; B(0.3, 1.6, 1.2, gx, BF+0.8, gz, "#5a3a22"); for(let k=0;k<4;k++){ B(0.28, 0.02, 1.16, gx-0.01, BF+0.2+k*0.4, gz, "#4a3020");
          for(let j=0;j<4;j++) B(0.24, 0.05+((j+k)%3)*0.02, 0.26, gx-0.02, BF+0.25+k*0.4, gz-0.4+j*0.27, ["#c82a1a","#2a4a8a","#e8b030","#2a8a3a"][(j+k)%4]); }
        addCol(gx-0.16, QX1, gz-0.6, gz+0.6, BF-0.5, BF+1.6); }
      // two leather club chairs on the front wall, watching the table, a lamp table between them
      for(const cx of [-1423.35, -1421.75]){ const f=Fr(cx, QZ0+0.47, faceS, BF), lc="#5a2a16";
        f.f(0.86, 0.3, 0.8, 0, 0.2, 0, lc, 0.06); f.f(0.58, 0.12, 0.62, 0, 0.41, 0.06, "#6a3420", 0.05); f.f(0.86, 0.5, 0.2, 0, 0.62, -0.3, lc, 0.08);
        for(const sd of [-1,1]) f.f(0.16, 0.36, 0.78, sd*0.35, 0.47, 0, lc, 0.07);
        for(const a2 of [-0.36, 0.36]) for(const b of [-0.32, 0.32]) f.c(0.025, 0.06, a2, 0.03, b, "#2a1a0e", 8);
        f.col(0.86, 0.8, 0, 0, 0.9); f.seat(0, 0.1, "A LEATHER CLUB CHAIR"); }
      { const lx=-1422.55, lz=QZ0+0.32; RB(0.44, 0.58, 0.44, lx, BF+0.29, lz, "#3a2414", 0, 0.02); C(0.05, 0.22, lx, BF+0.69, lz, "#b8902a", 10); CT(0.1, 0.17, 0.2, lx, BF+0.9, lz, "#efe0c0", 16);
        addCol(lx-0.22, lx+0.22, QZ0, lz+0.22, BF-0.5, BF+0.6); lampU(lx, BF+0.95, lz+0.1, 0.3, 0xffd6a0, 3.5); }
      push("wp_rug", boxGeo(2.6, 0.010, 3.6), tx, BF+0.017, tz, 0, "#8a2a22"); } }
  // the guest room: a bed, a nightstand, a lamp; the bath; the storage room's shelves
  { const g=Fr(-1437.6, QZ0+1.05, faceS, BF); g.f(1.4, 0.3, 2.0, 0, 0.17, 0, "#6a4428", 0.03); g.f(1.34, 0.22, 1.94, 0, 0.42, 0.02, "#f2f0ea", 0.07); g.f(1.4, 0.07, 1.4, 0, 0.56, 0.3, "#5a6a4a", 0.03);
    for(const s2 of [-1,1]) g.f(0.55, 0.13, 0.32, s2*0.33, 0.6, -0.72, "#f4f2ec", 0.06); g.col(1.42, 2.05, 0, 0, 0.7); g.seat(0, 0.2, "THE GUEST BED");
    // (the nightstand beside the bed's head, where a nightstand goes)
    { const nx=-1436.45, nz=QZ0+0.25; RB(0.42, 0.52, 0.38, nx, BF+0.26, nz, "#6a4428", 0, 0.02); CT(0.09, 0.14, 0.2, nx, BF+0.66, nz, "#efe2c4"); C(0.05, 0.1, nx, BF+0.57, nz, "#c8a050", 10);
      addCol(nx-0.22, nx+0.22, QZ0, nz+0.2, BF-0.5, BF+0.6); }
    RB(0.9, 0.8, 0.45, QX0+0.52, BF+0.4, -1158.8, "#6a4428", 0, 0.02); for(let k=0;k<3;k++) B(0.8, 0.2, 0.012, QX0+0.52, BF+0.15+k*0.25, -1159.03, "#5a3a22");
    addCol(QX0+0.05, QX0+0.99, -1159.04, -1158.56, BF-0.5, BF+0.82);                                                     // (and a dresser on the south wall)
    RB(0.8, 0.8, 1.6, QX0+0.4, BF+0.4, -1157.0, "#e8e4dc", 0, 0.03); push("glass", planeGeo(1.0, 1.9, 0), QX0+0.85, BF+0.95, -1156.0, Math.PI/2, "#ffffff"); addCol(QX0, QX0+0.82, -1157.8, -1156.2, BF-0.5, BF+2.0);
    push("porcelain", new T.CylinderGeometry(0.19, 0.15, 0.40, 16).scale(1, 1, 1.2), -1435.5, BF+0.2, -1157.7, Math.PI/2, "#ffffff"); addCol(-1435.8, -1435.07, -1158.0, -1157.4, BF-0.5, BF+0.8);
    RB(0.7, 0.82, 0.48, -1437.5, BF+0.41, -1155.3, "#e8e2d6", 0, 0.02); push("mirror", planeGeo(0.6, 0.7, 0), -1437.5, BF+1.45, -1155.07, Math.PI, "#ffffff"); addCol(-1437.85, -1437.15, -1155.6, -1155.06, BF-0.5, BF+0.85);
    for(const y of [0.05, 0.6, 1.15, 1.7]) B(3.3, 0.03, 0.45, -1438.05, BF+y, QZ1-0.24, "#8a8d90");
    for(const x of [-1439.68, -1436.42]) B(0.03, 1.75, 0.45, x, BF+0.875, QZ1-0.24, "#8a8d90");
    for(let k=0;k<12;k++) RB(0.48, 0.34, 0.4, -1439.35+(k%6)*0.56, BF+[0.24, 0.79][k>5?1:0], QZ1-0.24, ["#c8a070","#8a6a42","#e8e2d0"][k%3], 0, 0.02);
    addCol(-1439.75, -1436.35, QZ1-0.47, QZ1, BF-0.5, BF+1.8); }
  // the mechanical room, in the pocket east of the stair: the furnace and its duct, the water heater, the softener, the panel, the sump, a bare bulb
  { const fx=-1420.65, fz=-1153.0;
    RB(0.7, 1.5, 0.8, fx, BF+0.75, fz, "#d8d8d4", 0, 0.03); B(0.42, BCL-0.3-(BF+1.5), 0.42, fx, (BCL-0.3+BF+1.5)/2, fz, "#a8acb0"); B(0.42, 0.3, 0.42, fx, BCL-0.19, fz+0.0, "#a8acb0"); B(0.32, 0.28, 3.4, fx, BCL-0.19, -1155.0, "#a8acb0");
    C(0.28, 1.55, -1422.2, BF+0.78, -1152.62, "#e8e8e4", 18); C(0.04, BCL-(BF+1.55), -1422.2, (BCL+BF+1.55)/2, -1152.62, "#8a8d90", 8);
    C(0.16, 1.1, -1422.35, BF+0.55, -1153.55, "#2a3a5a", 14); C(0.2, 0.8, -1422.35, BF+0.4, -1154.1, "#2a2a2c", 14);
    B(0.1, 0.8, 0.5, QX1-0.05, BF+1.5, -1155.3, "#a8acb0"); C(0.24, 0.02, -1421.3, BF+0.012, -1154.5, "#3a3a3c", 16);
    addCol(fx-0.36, QX1, -1153.42, QZ1, BF-0.5, BF+2.0); addCol(-1422.63, -1421.9, -1154.32, QZ1, BF-0.5, BF+1.6); addCol(QX1-0.1, QX1, -1155.55, -1155.05, BF+1.1, BF+1.9);
    C(0.03, 0.08, -1421.4, BCL-0.04, -1155.4, "#3a3a3c", 8); push("rn_glow", new T.SphereGeometry(0.045, 8, 6), -1421.4, BCL-0.11, -1155.4, 0, "#ffffff");
    lampU(-1421.4, BCL-0.2, -1155.4, 0.4, 0xf2eee0, 4); }

  /* ======================================================================
     THE POOL: an oval in the deck behind the house, plaster under clear water with the lake's ripples in it, the
     waterline tile, steps at the shallow end, a ladder and a board at the deep end; the fence round the deck
     ====================================================================== */
  use("pool");
  const PCX=-1432.5, PCZ=-1146.2, PA=4.6, PB=2.3, DY=Y+0.06, WYP=DY-0.16;
  const depth=x=>{ const t=clamp((x-(PCX-PA))/(2*PA), 0, 1); return 2.2-1.2*smoothstep(0.35, 0.75, t); };   // (deep at the west end)
  { // the deck: a slab with an oval cut in it, its edges stood on the ground; the coping round the oval
    const dx0=-1440.6, dx1=-1423.4, dz0=WZ1, dz1=-1139.4, cx=(dx0+dx1)/2, cz=(dz0+dz1)/2;
    const sh=new T.Shape(); sh.moveTo(dx0-cx, -(dz0-cz)); sh.lineTo(dx1-cx, -(dz0-cz)); sh.lineTo(dx1-cx, -(dz1-cz)); sh.lineTo(dx0-cx, -(dz1-cz)); sh.closePath();
    const hole=new T.Path(); hole.absellipse(PCX-cx, -(PCZ-cz), PA+0.3, PB+0.3, 0, Math.PI*2, false); sh.holes.push(hole);
    const g=new T.ShapeGeometry(sh, 48), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*0.5, U.getY(i)*0.5);
    push("rn_conc", g, cx, DY, cz, 0, "#b8b2a6", -Math.PI/2, 0);
    for(const [w, d, x, z] of [[dx1-dx0, 0.04, cx, dz1-0.02],[0.04, dz1-dz0, dx0+0.02, cz],[0.04, dz1-dz0, dx1-0.02, cz]]) B(w, DY-(Y-0.3)-0.005, d, x, (DY-0.005+Y-0.3)/2, z, "#c8c2b6");
    addFlat(dx0, dx1, dz0, dz1, DY);
    const cs=new T.Shape(); cs.absellipse(0, 0, PA+0.36, PB+0.36, 0, Math.PI*2, false); const ch=new T.Path(); ch.absellipse(0, 0, PA-0.03, PB-0.03, 0, Math.PI*2, true); cs.holes.push(ch);
    const cg=new T.ExtrudeGeometry(cs, {depth:0.04, bevelEnabled:true, bevelThickness:0.012, bevelSize:0.012, bevelSegments:2, curveSegments:64}); cg.rotateX(-Math.PI/2);
    ent(cg, PCX, DY-0.03, PCZ, "#ece6da"); }
  { // the shell: the wall all round, inward, down to a floor that falls to the deep end; the plaster's waterline band at the top
    const n=72, P=[], Nn=[], Uv=[], idx=[]; let arc=0;
    for(let i=0;i<=n;i++){ const a=i/n*Math.PI*2, x=PCX+Math.cos(a)*PA, z=PCZ+Math.sin(a)*PB, nx=-Math.cos(a)/PA, nz=-Math.sin(a)/PB, L=Math.hypot(nx, nz);
      if(i>0){ const ap=(i-1)/n*Math.PI*2; arc+=Math.hypot(Math.cos(a)*PA-Math.cos(ap)*PA, Math.sin(a)*PB-Math.sin(ap)*PB); }
      const yb=WYP-depth(x)+0.0, yt=DY-0.02;
      P.push(x, yt, z, x, yb, z); Nn.push(nx/L, 0, nz/L, nx/L, 0, nz/L); Uv.push(arc*0.5, 1, arc*0.5, 1-(yt-yb)*0.5); }
    for(let i=0;i<n;i++){ const a=i*2, b=a+1, c=a+2, d2=a+3; idx.push(a, c, b, b, c, d2); }
    const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("normal", new T.Float32BufferAttribute(Nn, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(Uv, 2)); g.setIndex(idx);
    push("rn_pool", g.toNonIndexed(), 0, 0, 0, 0, "#ffffff");
    const fg=new T.CircleGeometry(1, 72); fg.rotateX(-Math.PI/2); fg.scale(PA+0.01, 1, PB+0.01); const FP=fg.attributes.position, FU=fg.attributes.uv;
    for(let i=0;i<FP.count;i++){ const x=PCX+FP.getX(i); FP.setY(i, WYP-depth(x)); FU.setXY(i, FP.getX(i)*0.4, FP.getZ(i)*0.4+0.2); }
    fg.computeVertexNormals(); fg.translate(PCX, 0, PCZ); push("rn_pool", fg, 0, 0, 0, 0, "#d8eef4");
    // the dark lane line down the middle of the floor, a hand's width above it
    const lg=new T.PlaneGeometry(2*PA-1.6, 0.25, 12, 1); lg.rotateX(-Math.PI/2); const LP=lg.attributes.position; for(let i=0;i<LP.count;i++){ const x=PCX+LP.getX(i); LP.setY(i, WYP-depth(x)+0.012); }
    lg.computeVertexNormals(); lg.translate(PCX, 0, PCZ); ent(lg, 0, 0, 0, "#1e4a7a");
    // the steps at the shallow (east) end, curved to the oval
    for(let k=0;k<3;k++){ const x=PCX+PA-0.45-k*0.42, top=WYP-0.26-k*0.26, hz=PB*Math.sqrt(Math.max(0, 1-Math.pow((x-PCX)/PA, 2)))-0.06;
      RB(0.44, top-(WYP-depth(x)), hz*2*0.92, x, (top+WYP-depth(x))/2, PCZ, "#e8f4f8", 0, 0.04); }
    // the ladder at the deep end's north side, the diving board
    for(const dz of [-0.28, 0.28]){ const lx=PCX-2.2+dz, lz=PCZ-PB*0.92; tubeE(V3(lx, DY+0.75, lz-0.25), V3(lx, DY+0.75, lz+0.02), 0.022, "#d8dce0"); tubeE(V3(lx, DY+0.75, lz+0.02), V3(lx, WYP-1.0, lz+0.12), 0.022, "#d8dce0");
      tubeE(V3(lx, DY+0.75, lz-0.25), V3(lx, DY+0.02, lz-0.32), 0.022, "#d8dce0"); }
    for(let k=0;k<3;k++) B(0.5, 0.03, 0.09, PCX-2.2, WYP-0.25-k*0.3, PCZ-PB*0.92+0.08+k*0.012, "#d8dce0");
    RB(0.7, 0.35, 0.6, PCX-PA-0.75, DY+0.17, PCZ, "#d8dce0", 0, 0.05); RB(2.4, 0.07, 0.5, PCX-PA+0.55, DY+0.4, PCZ, "#2a6a9a", 0, 0.03); addCol(PCX-PA-1.1, PCX-PA-0.35, PCZ-0.35, PCZ+0.35, DY-0.2, DY+0.45);
    // the pool's light in the deep end's wall, lit at night; its skimmer lid on the deck
    push("rn_lamp", new T.SphereGeometry(0.12, 12, 8).scale(0.4, 1, 1), PCX-PA+0.05, WYP-0.6, PCZ, 0, "#ffffff"); C(0.15, 0.02, PCX+1.5, DY+0.01, PCZ-PB-0.6, "#e8e4dc", 16);
    RANCH.poolLamp={x:PCX-PA+0.6, y:WYP-0.5, z:PCZ, color:0x6ad0ff, intensity:0.0, dist:9, decay:1.4}; LAMPS.push(RANCH.poolLamp);
    // keep out of the water: the oval's inside is solid (you go round it)
    for(let k=-4;k<=4;k++){ const z0=PCZ+k*PB/4.5-PB/9, z1=z0+2*PB/9, zz=Math.min(Math.abs(z0-PCZ), Math.abs(z1-PCZ)), hx=PA*Math.sqrt(Math.max(0, 1-Math.pow(zz/PB, 2)))-0.05;
      if(hx>0.1) addCol(PCX-hx, PCX+hx, z0, z1, WYP-3, DY+1.0); }
    addUse(PCX+PA+0.2, PCZ, DY, "THE POOL", ()=>toast(["YOU DIP A HAND IN. IT'S PERFECT. NOT IN YOUR CLOTHES, THOUGH","A LEAF TURNS SLOWLY ON THE SURFACE","THE FILTER HUMS SOMEWHERE UNDER THE DECK"][(Math.random()*3)|0], "#8ad8f2"), 1.6); }
  { // the water: an oval sheet, the lake's ripple normals read twice and drifting, the sky in it, clear over the plaster
    const lakeN=(typeof LAKESIDE!=="undefined" && LAKESIDE.water) ? LAKESIDE.water.material.normalMap : null;
    let nrm=null; if(lakeN){ nrm=lakeN.clone(); nrm.needsUpdate=true; nrm.wrapS=nrm.wrapT=T.RepeatWrapping; nrm.repeat.set(2.6, 1.3); }
    const m=envOut(new T.MeshStandardMaterial({color:0x2a9cc0, roughness:0.04, metalness:0.2, transparent:true, opacity:0.6, depthWrite:false,
      normalMap:nrm, normalScale:new T.Vector2(0.28, 0.28)}), 1.25);
    if(nrm) m.onBeforeCompile=(sh)=>{ sh.uniforms.uFlow={value:RANCH.flow};
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec4 uFlow;")
        .replace("#include <normal_fragment_maps>", `{ vec3 nA=texture2D(normalMap, vUv+uFlow.xy).xyz*2.0-1.0, nB=texture2D(normalMap, vUv*0.47+uFlow.zw).xyz*2.0-1.0;
  vec3 mapN=normalize(vec3(nA.xy+nB.xy, nA.z*nB.z)); mapN.xy*=normalScale;
  normal=perturbNormal2Arb(-vViewPosition, normal, mapN, faceDirection); }`); };
    const g=new T.CircleGeometry(1, 72); g.scale(PA, PB, 1);
    const w=new T.Mesh(g, m); w.rotation.x=-Math.PI/2; w.position.set(PCX, WYP, PCZ); w.renderOrder=3; w.receiveShadow=true; w.name="ranch-pool"; scene.add(w); RANCH.pool=w;
    // a float on the water, turning slowly
    const fl=new T.Mesh(new T.TorusGeometry(0.34, 0.11, 10, 24), new T.MeshStandardMaterial({color:0xf26a8a, roughness:0.45})); fl.rotation.x=-Math.PI/2; fl.position.set(PCX+1.2, WYP+0.05, PCZ+0.6); scene.add(fl); RANCH.float=fl; }
  { // the fence: black aluminium, pickets between rails, round the deck's three open sides, a gate on the east
    const FX0=-1440.5, FX1=-1423.5, FZ1=-1139.5, h=1.2, run=(a, b, ax, c, gap)=>{ const L=Math.abs(b-a), n=Math.ceil(L/1.8);
      for(let k=0;k<=n;k++){ const s=a+(b-a)*k/n; if(gap && s>gap[0]-0.05 && s<gap[1]+0.05) continue; const [x, z]=ax==="x" ? [s, c] : [c, s]; B(0.05, h+0.05, 0.05, x, DY+(h+0.05)/2, z, "#1a1a1c"); }
      const segs=gap ? [[a, gap[0]],[gap[1], b]] : [[a, b]];
      for(const [s0, s1] of segs){ const m2=(s0+s1)/2, L2=Math.abs(s1-s0); for(const y of [0.1, h-0.05]){ if(ax==="x") B(L2, 0.03, 0.025, m2, DY+y, c, "#1a1a1c"); else B(0.025, 0.03, L2, c, DY+y, m2, "#1a1a1c"); }
        for(let s=Math.min(s0, s1)+0.12; s<Math.max(s0, s1)-0.05; s+=0.12){ if(ax==="x") B(0.016, h-0.15, 0.016, s, DY+h/2+0.02, c, "#1a1a1c"); else B(0.016, h-0.15, 0.016, c, DY+h/2+0.02, s, "#1a1a1c"); }
        if(ax==="x") addCol(Math.min(s0, s1), Math.max(s0, s1), c-0.04, c+0.04, DY-0.3, DY+h); else addCol(c-0.04, c+0.04, Math.min(s0, s1), Math.max(s0, s1), DY-0.3, DY+h); } };
    run(FX0, FX1, "x", FZ1); run(WZ1+0.1, FZ1, "z", FX0); run(WZ1+0.1, FZ1, "z", FX1, [-1146.6, -1145.4]); }
  { // on the deck: three lounges facing the water, a table under an umbrella, a grill by the house, planters, towels
    for(let k=0;k<3;k++){ const lx=-1438.6+k*2.0, lz=-1150.2, f=Fr(lx, lz, faceS, DY);
      f.f(0.7, 0.08, 1.4, 0, 0.32, 0.25, "#f2f0ea", 0.03); f.f(0.7, 0.08, 0.75, 0, 0.6, -0.6, "#f2f0ea", 0.03); B(0.7, 0.05, 0.75, f.x(0, -0.62), DY+0.62, f.z(0, -0.62), "#f2f0ea");
      f.f(0.66, 0.05, 1.36, 0, 0.385, 0.25, ["#2a8ab0","#e8c030","#2a8ab0"][k], 0.025);
      for(const a of [-0.3, 0.3]) for(const b of [-0.85, 0.85]) f.f(0.05, 0.3, 0.05, a, 0.15, b, "#e8e4dc", 0.015);
      f.col(0.72, 1.9, 0, 0, 0.7); addSeat(lx, lz+0.3, DY, Math.PI, "A LOUNGE BY THE POOL", true); }
    const tx2=-1430.6, tz=-1141.6; C(0.6, 0.04, tx2, DY+0.74, tz, "#e8e4dc", 24); C(0.04, 0.72, tx2, DY+0.37, tz, "#2a2a2c", 8); C(0.3, 0.03, tx2, DY+0.02, tz, "#2a2a2c", 16);
    C(0.025, 2.3, tx2, DY+1.15, tz, "#e8e4dc", 8); { const u=new T.ConeGeometry(1.4, 0.45, 8, 1, true); ent(u, tx2, DY+2.05, tz, "#2a6a8a");
      const ui=new T.ConeGeometry(1.38, 0.44, 8, 1, true).scale(-1, 1, 1), nn=ui.attributes.normal; for(let i=0;i<nn.count;i++) nn.setXYZ(i, -nn.getX(i), -nn.getY(i), -nn.getZ(i));
      ent(ui, tx2, DY+2.035, tz, "#5a8aa0"); for(let k=0;k<8;k++){ const a2=k/8*Math.PI*2+Math.PI/8; tubeE(V3(tx2, DY+2.2, tz), V3(tx2+Math.cos(a2)*1.3, DY+1.84, tz+Math.sin(a2)*1.3), 0.008, "#e8e4dc"); } }
    addCol(tx2-0.6, tx2+0.6, tz-0.6, tz+0.6, DY-0.2, DY+0.78); addRoof(tx2-1.3, tx2+1.3, tz-1.3, tz+1.3, DY+2.0);
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+0.4, sx=tx2+Math.cos(a)*0.95, sz=tz+Math.sin(a)*0.95, ry=Math.atan2(tx2-sx, tz-sz), f=Fr(sx, sz, ry, DY);
      f.f(0.48, 0.05, 0.46, 0, 0.44, 0, "#e8e4dc", 0.02); f.f(0.48, 0.5, 0.05, 0, 0.72, -0.22, "#e8e4dc", 0.02); for(const s2 of [-1,1]) f.f(0.04, 0.44, 0.44, s2*0.22, 0.22, 0, "#d8d4cc", 0.01);
      f.col(0.48, 0.48, 0, 0, 0.5); addSeat(sx, sz, DY, ry+Math.PI, "A CHAIR BY THE POOL"); }
    { const gx=-1424.3, gz=-1149.2; RB(1.2, 0.85, 0.6, gx, DY+0.45, gz, "#2a2a2c", 0, 0.03); RB(1.0, 0.35, 0.55, gx, DY+1.05, gz, "#c8ccd0", 0, 0.08); for(const s2 of [-1,1]) RB(0.35, 0.04, 0.5, gx+s2*0.72, DY+0.88, gz, "#2a2a2c", 0, 0.01);
      C(0.17, 0.5, gx+0.45, DY+0.25, gz+0.42, "#e8e8e4", 14); addCol(gx-0.9, gx+0.9, gz-0.32, gz+0.6, DY-0.2, DY+1.2); }
    for(const x of [-1440.1, -1424.0]){ CT(0.3, 0.24, 0.5, x, DY+0.25, -1140.0, "#c8b8a0", 16); S(0.35, x, DY+0.7, -1140.0, "#3e6a2a"); for(let k=0;k<5;k++) S(0.07, x+Math.cos(k*1.3)*0.25, DY+0.92, -1140.0+Math.sin(k*1.3)*0.22, "#e8282a"); addCol(x-0.32, x+0.32, -1140.3, -1139.7, DY-0.2, DY+1.0); }
    RB(0.5, 0.02, 1.2, -1436.6, DY+0.4, -1149.85, "#e85a3a", 0, 0.01); }

  /* ======================================================================
     THE GROUNDS: the circle of drive and its island, the walk to the porch, the weeping cherry, the flagpole, the
     boulders, the lawn's trees, the woods all round; the walls round the lot
     ====================================================================== */
  use("site");
  const DCX=-1425.0, DCZ=-1180.6, DA0=12.6, DB0=7.6, DA1=8.4, DB1=3.6;
  /* the circle of drive, its two mouths from the road, the apron to the garage and the walks, laid as one surface
     (01's sdPaveGeo): a fillet wherever two pieces meet, its joints running on unbroken */
  { const sd=sdUnion([SD_ring(DCX, DCZ, DA0, DB0, DA1, DB1),
      SD_rect(-1436.6, -1432.4, Z+HW-0.2, DCZ-2.6), SD_rect(-1417.6, -1413.4, Z+HW-0.2, DCZ-2.6),        // the two mouths, from the road
      SD_rect(GX0-0.2, GX1, DCZ+3.3, GZ0-0.02),                                                       // the apron to the garage,
      SD_rect(DCX+9.0, GX1, DCZ, DCZ+3.6),                                                            //  its east edge carried down to the ring's tip
      SD_rect(-1428.1, -1426.1, DCZ+4.4, WZ0-1.25),                                                   // the walk to the porch steps
      SD_rect(-1424.2, -1420.6, WZ1-0.02, WZ1+1.0)], 2.0);                                            // the step out of the back
    push("rn_drive", sdPaveGeo(sd, -1442, -1408, Z+HW-0.4, WZ1+1.4, 0.2, 3), 0, Y+0.03, 0, 0, "#86817a"); }
  // the island: three boulders, the tall ornamental grass, a few lower plants
  for(const [bx2, bz, s, sd] of [[-1428.5, -1180.0, 0.95, 11],[-1424.0, -1181.6, 0.7, 12],[-1420.8, -1179.6, 0.55, 13],[-1438.9, -1186.4, 0.45, 14],[-1411.6, -1187.0, 0.6, 15],[-1440.5, -1172.0, 0.5, 16],[-1410.0, -1171.0, 0.42, 17]]){
    const g=rockGeo(s, sd); g.scale(1.2, 1.0, 0.9); push("rock", g, bx2, Y+s*0.45, bz, sd*0.7, "#8a847a"); addCol(bx2-s, bx2+s, bz-s*0.8, bz+s*0.8, Y-0.5, Y+s*0.9); }
  { const gx=-1425.4, gz=-1179.4; for(let k=0;k<40;k++){ const a=k*2.4, r2=(k%7)*0.06, tilt=0.15+(k%5)*0.06; const g=new T.ConeGeometry(0.03, 1.3+(k%4)*0.15, 4); g.translate(0, 0.65, 0);
      ent(g, gx+Math.cos(a)*r2, Y, gz+Math.sin(a)*r2, ["#7a8a4a","#8a9a5a","#9aa060"][k%3], Math.sin(a)*tilt, 0, Math.cos(a)*tilt); }
    addCol(gx-0.35, gx+0.35, gz-0.35, gz+0.35, Y-0.5, Y+1.2); }
  // the weeping cherry in its stone planter by the porch: a short trunk and a crown that falls in curtains
  { const tx2=-1433.6, tz=-1167.2; push("rn_stone", boxGeo(1.6, 0.42, 1.6, 0.6), tx2, Y+0.21, tz, 0.3, STN); B(1.4, 0.05, 1.4, tx2, Y+0.43, tz, "#4a3424", 0.3);
    C(0.09, 1.4, tx2, Y+1.1, tz, "#4a3a2e", 10); addCol(tx2-0.85, tx2+0.85, tz-0.85, tz+0.85, Y-0.5, Y+0.45);
    S(0.7, tx2, Y+1.95, tz, "#4e7a3a", 1.2, 0.7, 1.2);
    for(let k=0;k<22;k++){ const a=k/22*Math.PI*2, r2=0.75+(k%3)*0.12; const g=new T.SphereGeometry(0.22, 8, 6); g.scale(0.7, 2.6, 0.7);
      ent(g, tx2+Math.cos(a)*r2, Y+1.45-(k%4)*0.08, tz+Math.sin(a)*r2, ["#4e7a3a","#5a8a44","#466e34"][k%3]); } }
  // the flagpole on the west lawn, its flag; a ring of stones at its foot
  { const fx=-1452, fz=-1158; C(0.05, 7.0, fx, Y+3.5, fz, "#d8dce0", 10); S(0.07, fx, Y+7.05, fz, "#c8a050");
    sign(1.5, 0.95, (c,Wd,Hh)=>{ for(let k=0;k<13;k++){ c.fillStyle=k%2 ? "#f2f0ea" : "#b22234"; c.fillRect(0, k*Hh/13, Wd, Hh/13+1); }
      c.fillStyle="#3c3b6e"; c.fillRect(0, 0, Wd*0.4, Hh*7/13); c.fillStyle="#f2f0ea"; for(let i=0;i<5;i++) for(let j=0;j<4;j++){ c.beginPath(); c.arc(8+i*18, 8+j*16, 2.2, 0, 7); c.fill(); } }, fx+0.76, Y+6.4, fz, 0, false, 360);
    for(let k=0;k<9;k++){ const a=k/9*Math.PI*2; push("rock", rockGeo(0.16, 600+k), fx+Math.cos(a)*0.6, Y+0.07, fz+Math.sin(a)*0.6, a, "#8a847a"); }
    addCol(fx-0.1, fx+0.1, fz-0.1, fz+0.1, Y-0.5, Y+7); }
  // the mailbox by the west mouth; a lamp post by the walk
  { const mx=-1438.2, mz=Z+HW+1.4; B(0.1, 1.05, 0.1, mx, Y+0.52, mz, "#3a2a1e"); RB(0.24, 0.24, 0.5, mx, Y+1.17, mz, "#1a1a1c", 0, 0.1); addCol(mx-0.15, mx+0.15, mz-0.3, mz+0.3, Y-0.5, Y+1.3); }
  { const lx=-1429.0, lz=-1169.0; C(0.05, 1.9, lx, Y+0.95, lz, "#1a1a1c", 10); RB(0.24, 0.32, 0.24, lx, Y+2.05, lz, "#1a1a1c", 0, 0.03); push("rn_lamp", new T.SphereGeometry(0.08, 10, 8), lx, Y+2.03, lz, 0, "#ffffff");
    addCol(lx-0.1, lx+0.1, lz-0.1, lz+0.1, Y-0.5, Y+2.2); LAMPS.push({x:lx, y:Y+2.0, z:lz, color:0xffd8a0, intensity:0.5, dist:9, decay:1.5}); }
  // the cars: two in the drive, nosed toward the garage (both drivable)
  parked(0, "#14161a", -1417.4, -1170.0, 0, Y+0.03); parked(1, "#6a6458", -1414.2, -1169.2, 0, Y+0.03);
  // the side yard: a shed on the east, a woodpile by it (well clear of any fire: there is none here)
  { const sx=-1404.5, sz=-1148.0; B(3.0, 2.2, 2.6, sx, Y+1.1, sz, "#6e5c52"); B(3.4, 0.08, 3.0, sx, Y+2.25, sz, "#4a3a32");
    ent(new T.CylinderGeometry(0.01, 2.0, 0.8, 4, 1).rotateY(Math.PI/4).scale(0.85, 1, 0.75), sx, Y+2.65, sz, "#4a3a32");
    B(0.04, 1.9, 1.1, sx-1.52, Y+0.95, sz, "#4a3a32"); addCol(sx-1.5, sx+1.5, sz-1.3, sz+1.3, Y-0.5, Y+2.6);
    // (lying across x, side by side along z a centimetre apart, each row sat in the hollows of the one under it)
    for(let k=0;k<17;k++){ const row=k<6 ? 0 : k<11 ? 1 : 2, i=row===0 ? k : row===1 ? k-6 : k-11;
      push("logbark", FOREST.barkCyl(0.078, 0.08, 0.44+((k*7)%5)*0.012, 7), sx+2.0+(((k*13)%7)-3)*0.008, Y+0.085+row*0.14, sz-0.6+row*0.085+i*0.17, 0, ["#7a6a5a","#6e5e4e","#84725e"][k%3], 0, Math.PI/2); }
    addCol(sx+1.7, sx+2.3, sz-0.7, sz+0.4, Y-0.5, Y+0.5); }
  // the lawn's trees and the woods round the lot, rows deep, and along the road both ways (07's shell stays low behind them)
  { const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const g=Terrain.groundAt(x,z), rr=0.22*s; addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const qt=_trng(1437);
    for(const [x, z, s] of [[-1462, -1178, 1.35],[-1466, -1146, 1.25],[-1402, -1178, 1.2],[-1398, -1130, 1.3],[-1458, -1124, 1.2]]) tree("hard", x, z, s);
    const inLot=(x, z)=>x>R.x0-1 && x<R.x1+1 && z>R.z0-4 && z<R.z1+1;
    const nearHouse=(x, z)=>x>WX0-14 && x<GX1+16 && z>DCZ-10 && z<-1134;
    for(let x=WEST.corr.x0-30; x<WEST.park.x0-38; x+=6.5) for(let z=WEST.corr.z0-50; z<R.z1+44; z+=6.5){
      const xx=x+(qt()-0.5)*3, zz=z+(qt()-0.5)*3; if(Math.abs(zz-Z)<HW+7 || qt()<0.18) continue;
      if(inLot(xx, zz)){ if(nearHouse(xx, zz) || qt()<0.82) continue; if(Math.abs(xx-DCX)<16 && zz<-1160) continue; }
      if(zz>WEST.corr.z1 && xx>WEST.park.x0-40) continue;
      tree(qt()<0.35 ? "hemlock" : "hard", xx, zz, 0.9+qt()*0.5); } }
  // the lot's walls: its sides and back (the road's side is open along the corridor, 14z)
  addCol(R.x0-0.4, R.x0+0.4, WEST.corr.z1, R.z1, -40, 300); addCol(R.x1-0.4, R.x1+0.4, WEST.corr.z1, R.z1, -40, 300); addCol(R.x0, R.x1, R.z1-0.4, R.z1+0.4, -40, 300);

  /* ---- the walking test's routes: up the drive to the porch and in, through to the kitchen and out to the pool;
     down the wing's hall; through the mudroom to the garage; down the stair to the basement ---- */
  RANCH.routes={
    "the stone house: drive, porch, living room, kitchen, pool":[[-1434.5, Z+HW+1],[-1434.5, DCZ-5.0],[-1427.1, DCZ+5.5],[-1427.1, WZ0-1.6],[-1427.1, WZ0-0.3],[-1427.1, CZ0+0.6],[-1426.0, -1158.4],[-1426.0, -1156.3],
      [-1426.7, -1153.0],[-1426.7, WZ1+0.4],[-1426.7, -1150.3],[-1426.0, -1147.6]],
    "the stone house: the wing":[[-1427.1, WZ0-1.6],[-1427.1, CZ0+0.6],[-1426.4, -1158.0],[-1430.8, -1158.0],[-1433.5, -1158.0],[-1433.5, -1157.4],[-1434.2, -1157.1],[-1434.2, -1155.5],[-1436.0, -1155.5],[-1432.8, -1155.5]],
    "the stone house: mudroom, garage":[[-1427.1, WZ0-1.6],[-1427.1, CZ0+0.6],[-1426.4, -1159.0],[-1421.85, -1157.9],[-1421.85, -1156.3],[-1421.0, -1156.15],[-1419.2, -1156.15],[-1417.5, -1156.15],[-1415.2, -1156.6],[-1415.2, -1160.0]],
    "the stone house: down to the basement":[[-1427.1, WZ0-1.6],[-1427.1, CZ0+0.6],[-1426.4, -1159.0],[-1421.85, -1157.9],[-1421.85, -1156.3],[-1423.35, -1156.3],[-1423.35, -1155.0],[-1423.35, -1152.56],[-1425.2, -1152.56],[-1425.6, -1157.6],[-1429.0, -1157.6]],
    "the stone house: the basement's guest room and bath":[[-1427.1, WZ0-1.6],[-1427.1, CZ0+0.6],[-1426.4, -1159.0],[-1421.85, -1157.9],[-1421.85, -1156.3],[-1423.35, -1156.3],[-1423.35, -1155.0],[-1423.35, -1152.56],[-1425.2, -1152.56],[-1425.6, -1157.6],
      [-1433.6, -1157.8],[-1433.6, -1159.2],[-1436.2, -1159.2],[-1436.6, -1160.6],[-1436.2, -1159.2],[-1433.6, -1159.2],[-1433.6, -1155.95],[-1436.2, -1155.95],[-1437.0, -1156.8]],
    "the stone house: the game room and the mechanical room":[[-1427.1, WZ0-1.6],[-1427.1, CZ0+0.6],[-1426.4, -1159.0],[-1421.85, -1157.9],[-1421.85, -1156.3],[-1423.35, -1156.3],[-1423.35, -1155.0],
      [-1423.35, -1152.56],[-1424.4, -1152.56],[-1424.4, -1156.4],[-1423.6, -1157.6],[-1423.6, -1161.0],[-1424.0, -1162.4],[-1421.1, -1162.45],[-1420.95, -1159.6],[-1421.45, -1157.6],[-1421.45, -1156.3],[-1421.2, -1155.4]]};

  { const rm=new T.MeshStandardMaterial({vertexColors:true, roughness:0.68, metalness:0.04});
    for(const k in groups) if(groups[k].length) detailMesh(groups[k], rm, "ranch-"+k, k!=="basement"); }
})();
/* the stone house's frame: the pool's ripples drift, its light comes on after dark, the float turns */
function updateRanch(dt, dark){
  if(!RANCH.pool) return; const t=typeof CROWD!=="undefined" ? CROWD.t : performance.now()/1000;
  const cam=camera.position; if(Math.abs(cam.x+1430)>220 || Math.abs(cam.z+1150)>200) return;
  RANCH.flow.set(t*0.011, t*0.006, -t*0.008, t*0.0045);
  if(RANCH.poolLamp) RANCH.poolLamp.intensity=0.9*smoothstep(0.3, 0.6, dark);
  if(RANCH.float){ RANCH.float.rotation.z+=dt*0.05; RANCH.float.position.y=RANCH.pool.position.y+0.05+Math.sin(t*0.9)*0.008; }
}
