"use strict";
/* REST AREA · 14mh-books.js
   ----------------------------------------------------------------------
   Hollow Road Books, on the west side of Hollow Road across from the
   office park (EAST.books, 04): a small used-book shop in a green
   clapboard house, gable to the road, under a porch with a bench, a cart
   of dollar books and the chalkboard by the steps. Inside, every wall is
   books to the ceiling, two freestanding cases down the middle, the
   counter by the door with its old till, a wood stove on the back wall
   with two armchairs drawn up to it, a rug, a lamp, the cat. The owner at
   the counter, someone browsing, someone reading by the stove.

   The shelves' books are blocks, one to a shelf, their fronts the spines
   (one atlas, BOOKS.tex: four bands of spines over a band of page cream),
   so a wall of books is a few hundred boxes in one draw.

   PLAN (world): the drive in from the road z -1832..-1820; the lot x
   700..716, z -1844..-1810 (paved with the road, 14md); the shop x
   686..696, z -1833..-1821, its door in the middle of the east front, the
   porch x 696..698.6.
   ---------------------------------------------------------------------- */
const BOOKS={routes:{}, lamps:[], radios:[], FL:0};
(function hollowRoadBooks(){
  if(typeof EAST==="undefined" || !EAST.books) return;
  const Y=EDIN.y, LY=Y+PAVE_T+0.015, BK=EAST.books, S0=BK.site, ME=[], r=_trng(1951);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const RB=(w,h,d,x,y,z,c,ry,rad,list)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const S=(r0,x,y,z,c,list)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c,0,0,0,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"Georgia, serif"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z);

  const BX0=686, BX1=696, BZ0=-1833, BZ1=-1821, WT=0.2, ZM=(BZ0+BZ1)/2, GY=gy(691, ZM), FL=Math.max(GY, LY)+0.45, EH=FL+3.0, RISE=2.2, RIDGE=EH+RISE;
  const GREEN="#3e5a46", TRIM="#cfc4a6", PANEL="#6a4a30", ROOF="#3a3634", RED="#7a2a22";
  BOOKS.FL=FL;

  /* ---- the books' atlas: four bands of spines (each band a different run of heights and colours), page cream over them ---- */
  const tex=(()=>{ const W=1024, H=640, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const c=cv.getContext("2d"), q=_trng(77);
    const PAL=["#6a2a22","#2a3a5a","#3a5a3a","#7a5a2a","#4a2a3a","#2a4a4a","#8a6a3a","#5a3a2a","#3a3a3a","#7a3a2a","#2a2a4a","#5a5a3a","#9a7a4a","#4a4a5a","#6a4a5a","#a89070"];
    c.fillStyle="#a89c82"; c.fillRect(0, 0, W, H);                                     // (the pages' edges: a shaded cream, not a bright one)
    for(let b=0;b<4;b++){ const y0=b*128; c.fillStyle="#1e1810"; c.fillRect(0, y0, W, 128);
      let x=0; while(x<W){ const w=Math.round(10+q()*22), h=Math.round(128*(0.62+q()*0.36)), col=PAL[(q()*PAL.length)|0];
        const ww=Math.min(w, W-x); c.fillStyle=col; c.fillRect(x, y0+128-h, ww-1, h);
        c.fillStyle="rgba(0,0,0,0.25)"; c.fillRect(x+ww-2, y0+128-h, 1, h);                                  // (the shade between two)
        c.fillStyle="rgba(255,255,255,0.08)"; c.fillRect(x+1, y0+128-h, 2, h);
        if(q()<0.6){ c.fillStyle=q()<0.5 ? "#c8a85a" : "#d8ccb0"; const by=y0+128-h+8+q()*10; c.fillRect(x+2, by, ww-5, 2); if(q()<0.6) c.fillRect(x+2, by+h*0.55, ww-5, 2); }
        if(q()<0.7){ c.fillStyle="rgba(216,204,176,0.55)"; for(let k=0;k<3+((q()*4)|0);k++) c.fillRect(x+ww/2-1, y0+128-h+22+k*7, 2, 4); }    // (the title, too small to read)
        if(q()<0.05 && x+40<W){ c.fillStyle="#1e1810"; x+=Math.round(6+q()*8); }                               // (a gap now and then)
        x+=ww; } }
    const t=new T.CanvasTexture(cv); t.wrapS=T.RepeatWrapping; t.wrapT=T.ClampToEdgeWrapping; t.anisotropy=4; return t; })();
  BOOKS.tex=tex;
  const BE=[], BW=new T.Color("#ffffff");
  // a block of books w along its own x, h tall, d deep, its front (+z of its own) the spines from band `band`
  const books=(w, h, d, x, y, z, ry, band)=>{ const g=new T.BoxGeometry(w, h, d), uv=g.attributes.uv, u0=r()*4;
    for(let i=0;i<uv.count;i++){ const f=(i/4)|0;
      if(f===4){ const lu=uv.getX(i), lv=uv.getY(i); uv.setXY(i, u0+lu*w/0.62, (3-band)/5+0.2*(0.03+lv*0.94)+0.2); }          // (the spines)
      else uv.setXY(i, 0.5+uv.getX(i)*0.01, 0.06+uv.getY(i)*0.02); }                                                       // (the pages and covers: cream)
    BE.push({geo:g, matrix:new T.Matrix4().compose(V3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(0, ry, 0)), V3(1,1,1)), color:BW}); };
  // a case of shelves: along `ax` ("x" or "z") from a0 to a1, its back at c, open toward n (±1), h tall, d deep; every shelf filled.
  // `low`: [a, b, top] a stretch kept low (under a window)
  const WOOD="#5a3e26", WOOD2="#4a321e";
  const shelves=(ax, a0, a1, c, n, h, d, low, solid)=>{
    const put=(w, hh, dd, a, y, cc, col)=>ax==="x" ? B(w, hh, dd, a, y, cc, col) : B(dd, hh, w, cc, y, a, col);
    const ryF=ax==="x" ? (n>0 ? 0 : Math.PI) : (n>0 ? Math.PI/2 : -Math.PI/2);
    const seg=(s0, s1, top)=>{ const L=s1-s0, am=(s0+s1)/2;
      put(L, top-0.02, 0.02, am, FL+(top-0.02)/2, c+n*0.01, WOOD2);                                                      // the back
      for(const e of [s0+0.012, s1-0.012]) put(0.024, top-0.02, d, e, FL+(top-0.02)/2, c+n*d/2, WOOD);                  // the ends (both up under the top)
      put(L+0.004, 0.03, d+0.02, am, FL+top-0.015, c+n*(d/2+0.01), WOOD);                                                // the top
      put(L-0.05, 0.08, 0.02, am, FL+0.04, c+n*(d-0.01), WOOD);                                                          // the kick
      for(let y=0.10; y<top-0.25; y+=0.34){ put(L-0.05, 0.022, d-0.03, am, FL+y, c+n*(0.02+(d-0.03)/2), WOOD);          // a shelf, and its books
        const bh=Math.min(0.27, top-y-0.06); if(bh<0.12) continue;
        const ww=L-0.07, bc=c+n*(0.03+(d-0.09)/2);
        ax==="x" ? books(ww, bh, d-0.09, am, FL+y+0.011+bh/2, bc, ryF, (r()*4)|0) : books(ww, bh, d-0.09, bc, FL+y+0.011+bh/2, am, ryF, (r()*4)|0); }
      if(solid!==false) ax==="x" ? addCol(s0, s1, Math.min(c, c+n*d), Math.max(c, c+n*d), FL-0.05, FL+top) : addCol(Math.min(c, c+n*d), Math.max(c, c+n*d), s0, s1, FL-0.05, FL+top); };
    if(low){ seg(a0, low[0], h); seg(low[0]+0.006, low[1]-0.006, low[2]); seg(low[1], a1, h); } else seg(a0, a1, h); };

  /* ---- the ground: the porch's walk to the lot (the lot and the drive are the road's paving, 14md), grass round the house ---- */
  { const LG=LY;
    // the steps down off the porch to the lot: three risers
    const n=3, rise=(FL-LG)/n; for(let k=0;k<n;k++){ const x0=698.6+k*0.32; push("concrete", boxGeo(0.32+0.004, FL-k*rise-LG+0.3-0.012, 2.4), x0+0.16, (FL-k*rise-0.012+LG-0.3)/2, -1827, 0, "#8a867e"); }
    addRamp(698.6, 699.56, -1828.2, -1825.8, "x", 698.6, 699.56, FL, LG); }

  /* ---- the shop: a slab, clapboard round the openings, paneling inside, the gable to the road ---- */
  wallBox("concrete", BX0-0.06, BX1+0.06, BZ0-0.06, BZ1+0.06, GY-0.5, FL, "#8a867e", 0.6, FL);
  const OP={e:[[-1832.2, -1829.0, FL+0.45, FL+2.35],[-1827.5, -1826.5, FL, FL+2.12],[-1825.0, -1821.8, FL+0.45, FL+2.35]],
            n:[[689.0, 690.4, FL+0.95, FL+2.25]], s:[[688.4, 690.0, FL+0.75, FL+2.25],[692.6, 693.8, FL+0.95, FL+2.25]], w:[]};
  const run=(bk, ax, c0, c1, a, b, y0, y1, ops, col, solid, inn)=>{ let u=a;
    const piece=(p, q, h0, h1, deep)=>{ if(q-p<0.005 || h1-h0<0.005) return; let d0=c0, d1=c1; if(deep && inn){ if(inn>0) d1+=0.01; else d0-=0.01; }
      if(ax==="x") wallBox(bk, p, q, d0, d1, h0, h1, col, 0.6, FL); else wallBox(bk, d0, d1, p, q, h0, h1, col, 0.6, FL);
      if(solid) (ax==="x" ? addCol(p, q, c0, c1, h0, h1) : addCol(c0, c1, p, q, h0, h1)); };
    for(const o of ops.slice().sort((m, n)=>m[0]-n[0])){ piece(u, o[0], y0, y1); piece(o[0], o[1], y0, o[2]-(o[2]<=FL+0.001 ? 0.004 : 0), true); piece(o[0], o[1], o[3], y1-0.002, true); u=o[1]; }   // (under a door, a hair under the slab's top)
    piece(u, b, y0, y1); };
  run("siding", "x", BZ1-WT, BZ1, BX0, BX1, FL-0.2, EH, OP.n, GREEN, true);
  run("siding", "x", BZ0, BZ0+WT, BX0, BX1, FL-0.2, EH, OP.s, GREEN, true);
  run("siding", "z", BX1-WT, BX1, BZ0+WT, BZ1-WT, FL-0.2, EH+0.002, OP.e, GREEN, true);
  run("siding", "z", BX0, BX0+WT, BZ0+WT, BZ1-WT, FL-0.2, EH+0.002, OP.w, GREEN, true);
  const IN={x0:BX0+WT, x1:BX1-WT, z0:BZ0+WT, z1:BZ1-WT};
  run("wood", "x", IN.z1-0.02, IN.z1, IN.x0, IN.x1, FL, EH-0.06, OP.n, PANEL, false, -1);
  run("wood", "x", IN.z0, IN.z0+0.02, IN.x0, IN.x1, FL, EH-0.06, OP.s, PANEL, false, 1);
  run("wood", "z", IN.x1-0.02, IN.x1, IN.z0+0.03, IN.z1-0.03, FL, EH-0.072, OP.e, PANEL, false, -1);
  run("wood", "z", IN.x0, IN.x0+0.02, IN.z0+0.03, IN.z1-0.03, FL, EH-0.072, OP.w, PANEL, false, 1);
  // the gables, east and west, over the end walls: the ridge runs east to west, the front gable to the road
  for(const x1 of [BX0+WT, BX1]){ const sh=new T.Shape(); sh.moveTo(BZ0, EH+0.002); sh.lineTo(BZ1, EH+0.002); sh.lineTo(ZM, RIDGE-0.1); sh.lineTo(BZ0, EH+0.002);
    const g=new T.ExtrudeGeometry(sh, {depth:WT, bevelEnabled:false}); g.applyMatrix4(new T.Matrix4().set(0,0,-1,x1, 0,1,0,0, 1,0,0,0, 0,0,0,1)); push("siding", g, 0, 0, 0, 0, GREEN); }
  // the roof: two slopes of shingle, the ridge cap, the fascia; the chimney of the stove's pipe through the north slope
  { const th=Math.atan(RISE/((BZ1-BZ0)/2)), OV=0.4, run2=(BZ1-BZ0)/2+OV, L=run2/Math.cos(th);
    for(const s of [1, -1]){ const ez=ZM+s*run2, ey=RIDGE-run2*Math.tan(th), mz=(ZM+ez)/2, my=(RIDGE+ey)/2, nz=s*Math.sin(th), ny=Math.cos(th);
      push("shingle", boxGeo(BX1-BX0+0.8+(s<0 ? 0.014 : 0), 0.12, L), (BX0+BX1)/2, my-ny*0.06, mz-nz*0.06, 0, ROOF, s*th);
      B(BX1-BX0+0.84, 0.2, 0.04, (BX0+BX1)/2, ey-0.12, ez+s*0.03, TRIM); }
    B(BX1-BX0+0.86, 0.1, 0.34, (BX0+BX1)/2, RIDGE+0.03, ZM, "#2a2826");
    for(const x0 of [BX0-0.03, BX1+0.03]) for(const s of [1, -1]){ const x=x0+(s<0 ? Math.sign(x0-691)*0.012 : 0), a=V3(x, EH-OV*Math.tan(th)-0.02, ZM+s*run2), b=V3(x, RIDGE+0.02, ZM), d=b.clone().sub(a), Lr=d.length();
      ME.push({geo:boxGeo(0.04, Lr, 0.2), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(TRIM)}); }
    // the stove's pipe up through the roof, a cap on it
    C(0.09, RIDGE+0.9-(EH-0.3), 687.0, (RIDGE+0.9+EH-0.3)/2, -1825.6, "#2a2a2c", 12); C(0.16, 0.05, 687.0, RIDGE+0.92, -1825.6, "#2a2a2c", 12); C(0.11, 0.14, 687.0, RIDGE+1.0, -1825.6, "#2a2a2c", 12);
    addZone(BX0, BX1, BZ0, BZ1, FL-0.5, EH, "HOLLOW ROAD BOOKS · THE SHOP", true); }
  // the name across the front gable, on a board of its own
  { const y=EH+0.75; B(0.05, 0.62, 3.4, BX1+0.03, y, ZM, "#2a3a2a");
    sign(3.3, 0.54, (c, W, H)=>{ c.fillStyle="#2a3a2a"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a868"; c.lineWidth=5; c.strokeRect(9, 9, W-18, H-18);
        c.fillStyle="#d8ccae"; fitText(c, "HOLLOW ROAD BOOKS", W*0.8, H*0.52, W/2, H/2, "700", "Georgia, serif"); }, BX1+0.06, y, ZM, Math.PI/2, false, 900); }
  // corner boards, the trim round every opening, the sills
  for(const [x, z] of [[BX0, BZ0],[BX1, BZ0],[BX0, BZ1],[BX1, BZ1]]) B(0.16, EH-FL+0.2-0.014, 0.16, x, (FL-0.2+EH-0.014)/2, z, TRIM);
  for(const o of OP.e){ for(const [p, q] of [[o[0]-0.08, o[0]],[o[1], o[1]+0.08]]) B(0.03, o[3]-o[2]+0.08, q-p, BX1+0.015, (o[2]+o[3]+0.08)/2, (p+q)/2, TRIM);
    B(0.05, 0.1, o[1]-o[0]+0.22, BX1+0.025, o[3]+0.05, (o[0]+o[1])/2, TRIM); if(o[2]>FL) B(0.08, 0.04, o[1]-o[0]+0.24, BX1+0.04, o[2]-0.02, (o[0]+o[1])/2, TRIM); }
  for(const [o, z, s] of [[OP.n[0], BZ1, 1],[OP.s[0], BZ0, -1],[OP.s[1], BZ0, -1]]){ for(const [p, q] of [[o[0]-0.08, o[0]],[o[1], o[1]+0.08]]) B(q-p, o[3]-o[2]+0.08, 0.03, (p+q)/2, (o[2]+o[3]+0.08)/2, z+s*0.015, TRIM);
    B(o[1]-o[0]+0.22, 0.1, 0.05, (o[0]+o[1])/2, o[3]+0.05, z+s*0.025, TRIM); B(o[1]-o[0]+0.24, 0.04, 0.08, (o[0]+o[1])/2, o[2]-0.02, z+s*0.04, TRIM); }
  // the glass, set into the walls; small panes in the display windows (muntins either side of the glass)
  for(const o of OP.e) if(o[2]>FL){ push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), BX1-0.1, (o[2]+o[3])/2, (o[0]+o[1])/2, Math.PI/2, "#ffffff");
    for(const dx of [-0.06, -0.14]){ for(let k=1;k<4;k++) B(0.025, o[3]-o[2]-0.02, 0.025, BX1+dx, (o[2]+o[3])/2, o[0]+(o[1]-o[0])*k/4, TRIM);
      B(0.025, 0.025, o[1]-o[0]-0.02, BX1+dx, o[2]+(o[3]-o[2])*0.62, (o[0]+o[1])/2, TRIM); } }
  for(const [o, z] of [[OP.n[0], BZ1-0.1],[OP.s[0], BZ0+0.1],[OP.s[1], BZ0+0.1]]){ push("glass", planeGeo(o[1]-o[0]-0.02, o[3]-o[2]-0.02, 0), (o[0]+o[1])/2, (o[2]+o[3])/2, z, 0, "#ffffff");
    for(const dz of [-0.06, 0.06]) B(0.025, o[3]-o[2]-0.02, 0.025, (o[0]+o[1])/2, (o[2]+o[3])/2, z+dz, TRIM); }
  // the door: a red one with a pane in it, a bell over it inside
  makeDoor(XF(BX1-WT/2, -1826.52, Math.PI/2), 0, FL+0.01, 0, "HOLLOW ROAD BOOKS", false, 0, "vision", 0x7a2a22); addFlat(BX1-WT-0.02, BX1+0.02, -1827.5, -1826.5, FL);
  S(0.035, BX1-WT-0.12, FL+2.25, -1827.3, "#b8944a");
  // the floor, the ceiling
  { const ft=signTex(256, 256, (c, W, H)=>{ c.fillStyle="#5e4430"; c.fillRect(0, 0, W, H); for(let k=0;k<16;k++){ c.fillStyle=k%3 ? "rgba(0,0,0,0.10)" : "rgba(255,240,220,0.05)"; c.fillRect(0, k*16, W, 15); c.fillStyle="rgba(0,0,0,0.3)"; c.fillRect(0, k*16+15, W, 1); c.fillRect(((k*97)%W), k*16, 1, 16); } });
    ft.wrapS=ft.wrapT=T.RepeatWrapping; ft.repeat.set((IN.z1-IN.z0)/2.2, (IN.x1-IN.x0)/2.2);
    const m=new T.Mesh(new T.PlaneGeometry(IN.z1-IN.z0, IN.x1-IN.x0), new T.MeshStandardMaterial({map:ft, roughness:0.75, polygonOffset:true, polygonOffsetFactor:-1, polygonOffsetUnits:-2}));
    m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set((IN.x0+IN.x1)/2, FL+0.01, (IN.z0+IN.z1)/2); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m);
    B(IN.x1-IN.x0-0.03, 0.04, IN.z1-IN.z0-0.03, (IN.x0+IN.x1)/2, EH-0.09, (IN.z0+IN.z1)/2, "#a8987a");
    for(let x=IN.x0+1.2; x<IN.x1-0.5; x+=1.8) B(0.12, 0.14, IN.z1-IN.z0-0.08, x, EH-0.19, (IN.z0+IN.z1)/2, "#5a3e26"); }   // (beams across the ceiling)
  addFlat(IN.x0, IN.x1, IN.z0, IN.z1, FL);

  /* ---- the books: the walls, the cases down the middle; the counter, the stove and the armchairs ---- */
  const D=0.32, H=2.45;
  shelves("z", IN.z0+0.04, -1828.7, IN.x0+0.025, 1, H, D);                                       // the back wall, south of the stove
  shelves("z", -1825.3, IN.z1-0.04, IN.x0+0.025, 1, H, D);                                       // and north of it
  shelves("x", IN.x0+0.36, 692.0, IN.z1-0.025, -1, H, D, [OP.n[0][0]-0.1, OP.n[0][1]+0.1, 0.86]);      // the north wall, low under its window
  shelves("x", IN.x0+0.36, IN.x1-0.5, IN.z0+0.025, 1, H, D, [OP.s[0][0]-0.1, OP.s[1][1]+0.1, 0.70]);   // the south wall, low under the nook's windows
  // the two cases down the middle, books both sides
  for(const [a0, a1, z] of [[689.4, 693.4, -1830.0],[689.4, 692.0, -1824.6]]){ shelves("x", a0, a1, z, 1, 1.75, 0.30, null, false); shelves("x", a0, a1, z, -1, 1.75, 0.30, null, false);
    addCol(a0, a1, z-0.31, z+0.31, FL-0.05, FL+1.75); }
  // the display in each front window: a low step of books face out, a lamp
  for(const o of [OP.e[0], OP.e[2]]){ const zm=(o[0]+o[1])/2; B(0.5, 0.36, o[1]-o[0]-0.3, IN.x1-0.30, FL+0.18, zm, WOOD);
    for(let k=0;k<5;k++){ const z=o[0]+0.4+k*(o[1]-o[0]-0.8)/4; ent(boxGeo(0.03, 0.24, 0.17), IN.x1-0.38, FL+0.48, z, ["#7a2a22","#2a3a5a","#3a5a3a","#8a6a3a","#4a2a3a"][k], 0, Math.PI/2, -0.18); }
    addCol(IN.x1-0.56, IN.x1-0.04, o[0]+0.15, o[1]-0.15, FL-0.05, FL+0.4); }
  // the counter by the door, on its north side: the till, a lamp, a pile of books waiting to be priced, a bell
  { const x0=692.6, x1=695.0, z0=-1823.5, z1=-1822.9;
    RB(x1-x0, 0.95, z1-z0, (x0+x1)/2, FL+0.475, (z0+z1)/2, "#5a3e26", 0, 0.02); RB(x1-x0+0.06, 0.05, z1-z0+0.1, (x0+x1)/2, FL+0.975, (z0+z1)/2-0.02, "#7a5a3a", 0, 0.012);
    addCol(x0, x1, z0, z1+0.02, FL-0.05, FL+1.0);
    RB(0.36, 0.22, 0.30, 694.4, FL+1.11, -1823.15, "#3a3a3a", 0, 0.03); B(0.30, 0.06, 0.12, 694.4, FL+1.25, -1823.27, "#b8944a");             // (the old till)
    for(let k=0;k<6;k++) B(0.17, 0.035, 0.24, 693.3+(k%2)*0.04, FL+1.02+k*0.037, -1823.2, ["#7a2a22","#2a3a5a","#c8b890","#3a5a3a","#5a3a2a","#2a4a4a"][k], (r()-0.5)*0.4);
    C(0.012, 0.36, 692.9, FL+1.18, -1823.15, "#2a2a2c"); ent(new T.CylinderGeometry(0.05, 0.11, 0.12, 14, 1, true), 692.9, FL+1.36, -1823.15, "#2a5a3a");
    S(0.03, 694.85, FL+1.02, -1823.4, "#b8944a");
    C(0.05, 0.16, 692.68, FL+1.08, -1822.98, "#6a4a2a", 10); BOOKS.wandAt=[692.68, -1822.98, FL+1.0]; }        // (the jar the feather wand stands in)
  // the stove on the back wall between the shelves, on a hearth of brick; its pipe; a basket of logs
  { const x=IN.x0+0.55, z=-1827.0;
    B(1.0, 0.06, 1.3, x+0.05, FL+0.03, z, "#6a3a2a"); RB(0.58, 0.62, 0.55, x, FL+0.40, z, "#2a2a2c", 0, 0.04); B(0.62, 0.04, 0.6, x, FL+0.73, z, "#2a2a2c");
    for(const s of [-1, 1]) B(0.05, 0.12, 0.05, x+s*0.24, FL+0.12, z+s*0.2, "#2a2a2c");
    push("rn_glow", planeGeo(0.30, 0.20, 0), x+0.297, FL+0.40, z, Math.PI/2, "#ffffff");      // (the fire through its door, just proud of the front)
    C(0.09, EH-0.3-(FL+0.75), x, (EH-0.3+FL+0.75)/2, z, "#2a2a2c", 12); { const a=V3(x, EH-0.3, z), b=V3(687.0, EH-0.3, -1825.6); const d=b.clone().sub(a), Ld=d.length();
      ME.push({geo:new T.CylinderGeometry(0.09, 0.09, Ld+0.1, 12), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#2a2a2c")}); }
    addCol(x-0.32, x+0.32, z-0.3, z+0.3, FL-0.05, FL+0.8);
    ent(new T.CylinderGeometry(0.22, 0.18, 0.3, 14, 1, true), x+0.2, FL+0.15, z+0.85, "#8a6a3a"); for(let k=0;k<4;k++) C(0.05, 0.5, x+0.12+k*0.06, FL+0.3, z+0.85+(k%2)*0.05, "#6a4a2e", 8, 0, 0, Math.PI/2);
    const L={x:x+0.5, y:FL+0.4, z:z, color:0xff9a4a, intensity:0.55, dist:5, decay:1.6, indoor:true}; LAMPS.push(L); BOOKS.stove=L; }
  // the rug, the armchairs drawn up to the stove, a side table with a lamp between them, the cat asleep on one
  { const rugT=signTex(256, 160, (c, W, H)=>{ c.fillStyle="#6a2a22"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a868"; c.lineWidth=6; c.strokeRect(10, 10, W-20, H-20); c.strokeStyle="#2a3a4a"; c.lineWidth=4; c.strokeRect(24, 24, W-48, H-48);
      c.fillStyle="#2a3a4a"; c.beginPath(); c.ellipse(W/2, H/2, W*0.22, H*0.22, 0, 0, 7); c.fill(); c.fillStyle="#c8a868"; c.beginPath(); c.ellipse(W/2, H/2, W*0.1, H*0.1, 0, 0, 7); c.fill(); });
    const m=new T.Mesh(new T.PlaneGeometry(2.4, 1.7), new T.MeshStandardMaterial({map:rugT, roughness:0.95, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.rotation.x=-Math.PI/2; m.rotation.z=Math.PI/2; m.position.set(688.7, FL+0.022, -1827.0); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); }
  const chair=(x, z, s, col)=>{ const c=Math.cos(s), sn=Math.sin(s), P=(lx, lz)=>[x+lx*c+lz*sn, z-lx*sn+lz*c];
    { const [px, pz]=P(0, 0.05); RB(0.74, 0.22, 0.66, px, FL+0.30, pz, col, s, 0.06); }
    { const [px, pz]=P(0, 0.33); RB(0.74, 0.62, 0.16, px, FL+0.60, pz, col, s, 0.06); }
    for(const sd of [-1, 1]){ const [px, pz]=P(sd*0.34, 0.07); RB(0.13, 0.30, 0.68, px, FL+0.49, pz, col, s, 0.05); }
    { const [px, pz]=P(0, 0.0); RB(0.6, 0.07, 0.55, px, FL+0.445, pz, col, s, 0.03); }
    for(const [lx, lz] of [[-0.3, -0.25],[0.3, -0.25],[-0.3, 0.33],[0.3, 0.33]]){ const [px, pz]=P(lx, lz); C(0.025, 0.2, px, FL+0.1, pz, "#2a1a10", 8); }
    const [cx, cz]=P(0, 0.08); addColOB(cx, cz, s, 0.4, 0.38, FL-0.05, FL+0.9);
    addSeat(x, z, FL, s, "A CHAIR BY THE STOVE", false, 0.66); };
  const SA=Math.atan2(0.73, -0.68), SB=Math.atan2(0.73, 0.68);
  chair(688.35, -1828.55, SA, "#6a4a2a"); chair(688.35, -1825.45, SB, "#3a4a3a");
  { const x=688.9, z=-1827.0; C(0.24, 0.03, x, FL+0.55, z, "#5a3e26", 16); C(0.03, 0.52, x, FL+0.27, z, "#4a321e", 8); C(0.16, 0.03, x, FL+0.03, z, "#4a321e", 14);
    C(0.012, 0.42, x, FL+0.78, z, "#b8944a", 8); ent(new T.CylinderGeometry(0.09, 0.17, 0.2, 16, 1, true), x, FL+1.0, z, "#c8a86a");
    B(0.18, 0.04, 0.24, x+0.05, FL+0.585, z-0.05, "#2a3a5a", 0.3); C(0.04, 0.09, x-0.1, FL+0.61, z+0.08, "#d4ccb8", 10);                         // (a book down open, a mug)
    addCol(x-0.25, x+0.25, z-0.25, z+0.25, FL-0.05, FL+0.6);
    const L={x:x, y:FL+0.95, z:z, color:0xffd8a0, intensity:0.45, dist:4.5, decay:1.6, indoor:true}; LAMPS.push(L); }
  BOOKS.perch={chair:[688.35, -1825.45, FL+0.48, SB+Math.PI], window:[IN.x1-0.26, -1823.7, FL+0.36, -Math.PI/2], counter:[693.85, -1823.2, FL+1.0, Math.PI]}; BOOKS.IN=IN;   // (where the cats that keep to one place lie: 14mh's cats, below)
  // a ladder on the back wall's shelves; the lamps hanging from the beams; a sign that says where things are
  { const x=IN.x0+0.42; for(const dz of [-0.2, 0.2]) B(0.04, 2.5, 0.04, x+0.18, FL+1.2, -1831.2+dz, "#7a5a3a", 0); for(let k=0;k<7;k++) B(0.03, 0.03, 0.42, x+0.18-k*0.0, FL+0.3+k*0.32, -1831.2, "#7a5a3a"); }
  for(const [x, z] of [[690.8, -1830.0],[690.8, -1824.6],[694.3, -1827.0]]){ C(0.006, 0.5, x, EH-0.4, z, "#2a2a2c", 6); ent(new T.CylinderGeometry(0.06, 0.2, 0.18, 16, 1, true), x, EH-0.7, z, "#2a4a3a");
    push("rn_glow", new T.SphereGeometry(0.05, 8, 6), x, EH-0.74, z, 0, "#ffffff");
    LAMPS.push({x:x, y:EH-0.85, z:z, color:0xffdcaa, intensity:0.55, dist:6, decay:1.6, indoor:true}); }
  for(const [z, words] of [[-1830.0, "FICTION · POETRY"],[-1824.6, "HISTORY · PENNSYLVANIA"]]) sign(0.9, 0.18, (c, W, H)=>{ c.fillStyle="#2a3a2a"; c.fillRect(0, 0, W, H); say(c, words, W/2, H/2, W*0.84, H*0.62, "#d8ccae", "700"); },
    689.4-0.035, FL+2.10, z, -Math.PI/2, false, 300);
  { for(const z of [-1830.0, -1824.6]){ C(0.006, EH-0.11-(FL+2.21), 689.39, (EH-0.11+FL+2.21)/2, z, "#2a2a2c", 6); B(0.02, 0.22, 0.94, 689.39, FL+2.10, z, "#5a3e26"); } }
  // the radio on the shelf behind the counter: quiet jazz
  { const x=694.0, z=IN.z1-0.2; B(0.7, 0.03, 0.24, x, FL+1.185, IN.z1-0.14, WOOD); RB(0.32, 0.2, 0.16, x, FL+1.3, z, "#6a4a2a", 0, 0.04); B(0.24, 0.1, 0.01, x, FL+1.3, z-0.085, "#c8b898");
    BOOKS.radios.push({x:x, y:FL+1.3, z:z, station:3, house:"HOLLOW ROAD BOOKS", zone:"HOLLOW ROAD BOOKS · THE SHOP", vol:0.35, reach:9}); }

  /* ---- the porch: a deck the width of the front, posts, a shed roof; the bench, the dollar cart, the hanging sign, the lamp ---- */
  { const PX0=BX1+0.07, PX1=698.6, PZ0=-1832.4, PZ1=-1821.6;          // (the boards start past the slab's edge)
    for(let k=0;;k++){ const x=PX0+0.07+k*0.15; if(x>PX1-0.06) break; B(0.13, 0.04, PZ1-PZ0, x, FL-0.02, (PZ0+PZ1)/2, k%3 ? "#7a6448" : "#6e5a40"); }
    B(PX1-PX0, FL-0.2-GY, 0.06, (PX0+PX1)/2, (FL-0.2+GY)/2, PZ0-0.03, "#4a3a2a"); B(PX1-PX0, FL-0.2-GY, 0.06, (PX0+PX1)/2, (FL-0.2+GY)/2, PZ1+0.03, "#4a3a2a");
    addFlat(BX1, PX1, PZ0, PZ1, FL);
    for(const z of [PZ0+0.1, -1829.0, -1825.0, PZ1-0.1]){ B(0.12, 2.55, 0.12, PX1-0.12, FL+1.275, z, TRIM); addCol(PX1-0.18, PX1-0.06, z-0.06, z+0.06, FL-0.05, FL+2.55); }
    // the rail between the posts, but for the steps
    for(const [z0, z1] of [[PZ0+0.16, -1829.06],[-1824.94, PZ1-0.16]]){ B(0.06, 0.06, z1-z0, PX1-0.12, FL+0.9, (z0+z1)/2, TRIM); B(0.04, 0.04, z1-z0, PX1-0.12, FL+0.12, (z0+z1)/2, TRIM);
      for(let z=z0+0.12; z<z1-0.06; z+=0.14) B(0.035, 0.74, 0.035, PX1-0.12, FL+0.51, z, TRIM); addCol(PX1-0.18, PX1-0.06, z0, z1, FL-0.05, FL+0.95); }
    for(const z of [PZ0-0.03, PZ1+0.03]) addCol(PX0, PX1, z-0.04, z+0.04, FL-0.05, FL+0.95);
    // the shed roof over it, from under the eave down to the posts
    { const XA=BX1-0.12, y0=EH-0.25, y1=FL+2.62, th=Math.atan2(y0-y1, PX1+0.3-XA), L=(PX1+0.3-XA)/Math.cos(th);      // (its upper end into the wall, not flush with it)
      push("shingle", boxGeo(L, 0.1, PZ1-PZ0+0.5), (XA+PX1+0.3)/2, (y0+y1)/2+0.05, (PZ0+PZ1)/2, 0, ROOF, 0, -th);
      B(0.14, 0.18, PZ1-PZ0+0.2, PX1-0.12, FL+2.62, (PZ0+PZ1)/2, TRIM);
      addRoof(BX1, PX1+0.3, PZ0-0.25, PZ1+0.25, y1); }
    // the bench under the south window, facing the road
    { const x=BX1+0.5, z=-1831.0; B(0.42, 0.05, 1.5, x, FL+0.45, z, "#5a3e26"); B(0.05, 0.42, 1.5, x-0.19, FL+0.7, z, "#5a3e26"); for(const dz of [-0.65, 0.65]) B(0.4, 0.43, 0.05, x, FL+0.215, z+dz, "#3a2a1a");
      addCol(x-0.23, x+0.23, z-0.78, z+0.78, FL-0.05, FL+0.5); for(const dz of [-0.4, 0.4]) addSeat(x, z+dz, FL, -Math.PI/2, "THE BENCH ON THE PORCH"); }
    // the cart of dollar books, north of the door
    { const x=BX1+0.62, z=-1823.2; B(0.6, 0.04, 1.2, x, FL+0.72, z, WOOD); B(0.6, 0.3, 0.02, x, FL+0.87, z-0.59, WOOD); B(0.6, 0.3, 0.02, x, FL+0.87, z+0.59, WOOD);
      for(const dz of [-0.55, 0.55]) for(const dx of [-0.25, 0.25]) B(0.04, 0.7, 0.04, x+dx, FL+0.35, z+dz, "#2a2a2c");
      for(const dz of [-0.45, 0.45]) C(0.08, 0.04, x, FL+0.08, z+dz, "#1a1a1a", 12, 0, 0, Math.PI/2);
      books(1.12, 0.22, 0.5, x, FL+0.85, z, Math.PI/2, 2);
      sign(0.36, 0.18, (c, W, H)=>{ c.fillStyle="#d8ccae"; c.fillRect(0, 0, W, H); say(c, "$1 EACH", W/2, H/2, W*0.8, H*0.6, "#2a2a2a", "800"); }, x+0.31, FL+0.95, z, Math.PI/2, false, 120);
      addCol(x-0.32, x+0.32, z-0.62, z+0.62, FL-0.05, FL+1.0); }
    // the hanging sign under the porch roof, by the steps, read from the lot
    { const x=PX1-0.12, z=-1827.0; for(const dz of [-0.5, 0.5]) C(0.006, 0.08, x, FL+2.49, z+dz, "#2a2a2c", 6);
      B(0.04, 0.5, 1.2, x, FL+2.2, z, "#2a3a2a");
      for(const s of [-1, 1]) sign(1.12, 0.42, (c, W, H)=>{ c.fillStyle="#2a3a2a"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a868"; c.lineWidth=4; c.strokeRect(8, 8, W-16, H-16);
          say(c, "HOLLOW ROAD BOOKS", W/2, H*0.42, W*0.8, H*0.36, "#d8ccae", "700"); say(c, "USED · RARE · LOCAL", W/2, H*0.74, W*0.6, H*0.16, "#c8a868", "600"); }, x+s*0.025, FL+2.2, z, s>0 ? Math.PI/2 : -Math.PI/2, false, 520); }
    // the lamp by the door, on after dark
    { const x=BX1+0.08, z=-1828.0; RB(0.14, 0.24, 0.14, x, FL+2.15, z, "#2a2a2c", 0, 0.03); push("lk_porch", new T.SphereGeometry(0.05, 8, 6), x+0.03, FL+2.08, z, 0, "#ffffff");
      const L={x:x+0.25, y:FL+2.0, z:z, color:0xffd8a0, intensity:0, dist:8, decay:1.6, mothy:true}; LAMPS.push(L); BOOKS.lamps.push(L); }
    // the window boxes under the front windows, flowers in them
    for(const o of [OP.e[0], OP.e[2]]){ const zm=(o[0]+o[1])/2, L=o[1]-o[0]; B(0.22, 0.2, L, BX1+0.13, o[2]-0.16, zm, "#5a3e26");
      for(let k=0;k<Math.round(L/0.16);k++) S(0.06+r()*0.03, BX1+0.13+(r()-0.5)*0.08, o[2]-0.02+r()*0.04, o[0]+0.08+k*0.16, ["#c84a3a","#d8a83a","#8a4ab8","#c8c0a0"][(r()*4)|0]); } }
  // the chalkboard at the foot of the steps
  { const x=700.2, z=-1829.4, g=LY; for(const s of [-1, 1]) B(0.04, 0.9, 0.6, x+s*0.03, g+0.45, z, "#5a3e26");
    for(const s of [-1, 1]) sign(0.5, 0.62, (c, W, H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0, 0, W, H); say(c, "BOOKS", W/2, H*0.2, W*0.8, H*0.18, "#e8e0c8", "700", "'Comic Sans MS', cursive");
        say(c, "bought & sold", W/2, H*0.42, W*0.8, H*0.12, "#e8d088", "600", "'Comic Sans MS', cursive"); say(c, "coffee's on", W/2, H*0.62, W*0.8, H*0.12, "#d8a8c8", "600", "'Comic Sans MS', cursive");
        say(c, "six cats · pet them", W/2, H*0.82, W*0.8, H*0.1, "#a8c8d8", "600", "'Comic Sans MS', cursive"); }, x+s*0.06, g+0.52, z, s>0 ? Math.PI/2 : -Math.PI/2, false, 200);
    addCol(x-0.26, x+0.26, z-0.32, z+0.32, g-0.3, g+0.9); }

  // two cars in the lot
  if(typeof parked==="function"){ parked(0, "#4a5a3a", 703.6, -1839.2, 0, LY-PAVE_T); parked(2, "#6a3a2a", 711.4, -1813.4, Math.PI, LY-PAVE_T); }

  /* ---- the sign at the road, on two posts beyond its ends, read both ways along it ---- */
  { const x=719.6, z=BK.mouth.z1+3.2, g=gy(x, z), W2=2.2, H2=1.1, top=g+2.3;
    for(const dz of [-W2/2-0.08, W2/2+0.08]){ B(0.12, top+0.1-g, 0.12, x, (top+0.1+g)/2, z+dz, "#4a3a2a"); addCol(x-0.07, x+0.07, z+dz-0.07, z+dz+0.07, g-0.5, top); }
    B(0.1, H2+0.08, W2+0.08, x, top-H2/2, z, "#2a3a2a");
    const draw=(c, W, H)=>{ c.fillStyle="#2a3a2a"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8a868"; c.lineWidth=5; c.strokeRect(10, 10, W-20, H-20);
      say(c, "HOLLOW ROAD BOOKS", W/2, H*0.36, W*0.78, H*0.22, "#d8ccae", "700"); say(c, "USED & RARE  ·  COFFEE  ·  OPEN 10 – 6", W/2, H*0.68, W*0.74, H*0.12, "#c8a868", "600"); };
    for(const s of [-1, 1]) sign(W2, H2, draw, x+s*0.065, top-H2/2, z, s<0 ? -Math.PI/2 : Math.PI/2, false, 560); }

  /* ---- the walls of the world round it, the woods close round three sides ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300);
    W(S0.x0-0.4, S0.x0+0.4, S0.z0, S0.z1); W(S0.x0, S0.x1, S0.z0-0.4, S0.z0+0.4); W(S0.x0, S0.x1, S0.z1-0.4, S0.z1+0.4);
    addZone(S0.x0, S0.x1, S0.z0, S0.z1, Y-4, Y+14, "HOLLOW ROAD BOOKS"); }
  if(typeof FOREST!=="undefined"){ const q=_trng(1952);
    const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, g=gy(x, z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const row=(x0, z0, x1, z1, nx, nz)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/6.2));
      for(let k=0;k<=n;k++) for(const dep of [1.8, 6.5, 11.5, 16.5]){ if(q()<0.12) continue; const t=(k+q()*0.6)/n, x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(dep<2 ? "edge" : q()<0.35 ? "hemlock" : q()<0.5 ? "pine" : "hard", x, z, 0.85+q()*0.4); } };
    row(S0.x0, S0.z0, S0.x1, S0.z0, 0, -1); row(S0.x0, S0.z1, S0.x1, S0.z1, 0, 1); row(S0.x0, S0.z0, S0.x0, S0.z1, -1, 0);
    // and a few in the yard: a maple over the north side, a pair of lilacs by the porch
    tree("lawn", 680.5, -1814.5, 1.0); tree("lawn", 677.0, -1841.0, 0.9);
    for(const [x, z] of [[697.6, -1834.4],[697.6, -1819.6],[684.6, -1835.0]]) FOREST.plant("shrub", x, z, {scale:0.9, solid:false}); }

  /* ---- the people: the owner at the counter, someone browsing the fiction, someone reading by the stove ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("hollow road books", 691, -1827, 80);
    const L=(o)=>Object.assign({h:1.0, skin:SKINS[(r()*4)|0], hair:HAIRS[(r()*6)|0], shirt:"#5a5a5a", pants:"#2a2e3a", shoes:"#2a2a2a"}, o);
    crowdAdd(G, {look:L({skin:SKINS[0], hair:"#8d8a86", beard:"#9a958e", beardStyle:"full", shirt:"#6a5a3a", pants:"#4a4a3a", long:true}), x:693.9, z:-1822.15, y:FL, yaw:Math.PI, mode:"read", sway:0.3, dayOnly:true, held:"book"});
    crowdAdd(G, {look:L({female:true, h:0.96, hair:"#4a3020", hairStyle:"long", shirt:"#7a4a5a", long:true}), x:691.6, z:-1829.15, y:FL, yaw:Math.PI, mode:"read", sway:0.2, dayOnly:true, held:"book"});
    crowdAdd(G, {look:L({hair:"#2b1e14", beard:"#2b1e14", beardStyle:"short", shirt:"#3a4a5a", pants:"#3b4a66", long:true}), x:688.35, z:-1828.55, y:FL, yaw:SA+Math.PI, mode:"sit", sitY:0.535, sway:0.2, held:"book"}); }

  /* ---- what is built ---- */
  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.78, metalness:0.03}), "hollow-road-books", true);
  { const m=new T.Mesh(mergeEntries(BE), new T.MeshStandardMaterial({map:tex, vertexColors:true, roughness:0.85})); m.name="hollow-road-books-shelves"; m.castShadow=true; m.receiveShadow=true;
    m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); }

  /* ---- the ways round it, for tools/walk.js ---- */
  const MZ=(BK.mouth.z0+BK.mouth.z1)/2;
  BOOKS.routes={
    "hollow road books: in off Hollow Road, up the steps to the door":[[732.0, MZ],[725.0, MZ],[712.0, MZ],[704.0, -1827.0],[700.4, -1827.0],[699.0, -1827.0],[697.8, -1827.0],[696.6, -1827.0]],
    "hollow road books: through the door, past the cases to the stove":[[697.6, -1827.0],[696.4, -1827.0],[695.2, -1827.0],[692.0, -1827.0],[689.6, -1827.0]],
    "hollow road books: down the aisle by the south wall":[[694.6, -1827.6],[694.6, -1831.3],[690.0, -1831.3],[688.9, -1831.3]],
    "hollow road books: round to the counter":[[694.7, -1826.6],[694.7, -1824.0],[692.2, -1823.9]],
    "hollow road books: the porch, end to end":[[697.4, -1831.9],[697.4, -1827.0],[697.4, -1822.2]]};
})();
/* the porch lamp comes on after dark; the stove flickers */
function updateBooks(dt, dark){ for(const L of BOOKS.lamps) L.intensity=0.75*smoothstep(0.3, 0.6, dark);
  if(typeof updateCats==="function") updateCats(dt);
  if(BOOKS.stove) BOOKS.stove.intensity=0.45+0.12*Math.sin(performance.now()*0.011)+0.06*Math.sin(performance.now()*0.027); }

/* ---- the shop's cats: six of them, each a few parts on its own (body, head, two of tail, four legs) so it can move.
   Pepper, Mabel and Biscuit have the run of the floor: they wander, sit, wash, lie down. Moby sleeps in the green chair,
   Juniper keeps the front window and Doris the counter. E by any of them pets it (it sits up into your hand and purrs).
   The feather wand stands in a jar on the counter: take it and the feather dangles where you look on the floor; the cats
   on the floor stalk it, crouch, wiggle and pounce, and the ones on their perches follow it with their heads ---- */
const CATS={list:[], wand:false, lure:new T.Vector3(), wandG:null, t:0};
(function shopCats(){
  if(typeof BOOKS==="undefined" || !BOOKS.perch) return;
  const IN=BOOKS.IN, FL=BOOKS.FL, P=BOOKS.perch, r=_trng(4040);
  const MATS={}, mat=(c)=>MATS[c]||(MATS[c]=new T.MeshStandardMaterial({color:c, roughness:0.9}));
  const part=(geo, c, x, y, z, sx, sy, sz, rx)=>{ const m=new T.Mesh(geo, mat(c)); m.position.set(x, y, z); if(sx) m.scale.set(sx, sy, sz); if(rx) m.rotation.x=rx; m.castShadow=true; return m; };
  const SPH=new T.SphereGeometry(1, 14, 10), CYL=new T.CylinderGeometry(1, 1, 1, 8), CONE=new T.ConeGeometry(1, 1, 6);
  const build=(name, coat, belly, eyes)=>{
    const g=new T.Group(); scene.add(g);
    const body=new T.Group(); body.position.set(0, 0.2, 0); g.add(body);
    body.add(part(SPH, coat, 0, 0, 0, 0.105, 0.095, 0.21));
    body.add(part(SPH, belly, 0, -0.03, 0.05, 0.085, 0.07, 0.15));
    const head=new T.Group(); head.position.set(0, 0.075, 0.2); body.add(head);
    head.add(part(SPH, coat, 0, 0.02, 0.03, 0.072, 0.064, 0.07));
    head.add(part(SPH, belly, 0, -0.008, 0.085, 0.034, 0.028, 0.026));
    head.add(part(SPH, "#3a2a2a", 0, 0.006, 0.108, 0.009, 0.007, 0.006));
    for(const s of [-1, 1]){ const e=part(CONE, coat, s*0.04, 0.08, 0.02, 0.025, 0.05, 0.016); e.rotation.z=-s*0.25; head.add(e);
      head.add(part(SPH, eyes, s*0.026, 0.03, 0.088, 0.011, 0.009, 0.006)); }
    const tail=new T.Group(); tail.position.set(0, 0.03, -0.2); body.add(tail);
    const t1=part(CYL, coat, 0, 0.09, 0, 0.018, 0.18, 0.018); tail.add(t1);
    const tail2=new T.Group(); tail2.position.set(0, 0.18, 0); tail.add(tail2); tail2.add(part(CYL, coat, 0, 0.08, 0, 0.016, 0.16, 0.016)); tail2.add(part(SPH, coat, 0, 0.16, 0, 0.017, 0.017, 0.017));
    const legs=[]; for(const [lx, lz] of [[-0.055, 0.12],[0.055, 0.12],[-0.055, -0.12],[0.055, -0.12]]){ const L=new T.Group(); L.position.set(lx, -0.02, lz); body.add(L);
      L.add(part(CYL, coat, 0, -0.08, 0, 0.022, 0.16, 0.022)); L.add(part(SPH, belly, 0, -0.165, 0.01, 0.024, 0.014, 0.03)); legs.push(L); }
    const C={name:name, g:g, body:body, head:head, tail:tail, tail2:tail2, legs:legs, x:0, z:0, y:FL, yaw:0, st:"sit", t:0, ph:r()*6, tx:0, tz:0, sp:0, perch:null, pet:0, look:0, hop:0};
    CATS.list.push(C); return C; };
  // the three that wander, and where they start
  for(const [n, coat, belly, eyes, x, z] of [["PEPPER", "#24201e", "#3a3430", "#c8b030", 690.8, -1827.6],["MABEL", "#7a7a76", "#a8a49c", "#5a9a4a", 693.6, -1831.2],["BISCUIT", "#c89a5a", "#d8c0a0", "#b88a2a", 691.0, -1822.6]]){
    const c=build(n, coat, belly, eyes); c.x=x; c.z=z; c.yaw=r()*6.28; c.st=r()<0.5 ? "sit" : "lie"; c.t=2+r()*6; }
  // the three that keep to a perch
  for(const [n, coat, belly, eyes, key, st] of [["MOBY", "#c8843a", "#d8b080", "#c8a030", "chair", "sleep"],["JUNIPER", "#c8b8a0", "#d4ccb8", "#6a9ac8", "window", "sit"],["DORIS", "#6a4a32", "#a88a6a", "#c8a030", "counter", "sleep"]]){
    const c=build(n, coat, belly, eyes), q=P[key]; c.x=q[0]; c.z=q[1]; c.y=q[2]; c.yaw=q[3]; c.perch=key; c.st=st; c.t=1e9; }
  // the wand: a cane stick, its string, a tuft of feathers at the end; drawn from your hand to the feather while you hold it
  { const G=new T.Group(); G.visible=false; scene.add(G);
    const stick=new T.Mesh(new T.CylinderGeometry(0.004, 0.006, 1, 6), mat("#6a4a2a")), str=new T.Mesh(new T.CylinderGeometry(0.0015, 0.0015, 1, 4), mat("#d4ccb8"));
    const fe=new T.Group(); for(let k=0;k<5;k++){ const f=part(CONE, ["#c8281a","#2a6ab8","#e8c03a","#3a8a4a","#c84a8a"][k], 0, -0.05, 0, 0.012, 0.1, 0.012); f.rotation.z=(k-2)*0.35; f.position.x=(k-2)*0.012; fe.add(f); }
    G.add(stick); G.add(str); G.add(fe); CATS.wandG={g:G, stick:stick, str:str, fe:fe}; G.userData.noCull=true;        // (built at the origin and moved about: never culled where it was made)
    const W=BOOKS.wandAt, stand=new T.Group(); stand.position.set(W[0], W[2]+0.1, W[1]); scene.add(stand);
    const s2=new T.Mesh(new T.CylinderGeometry(0.006, 0.008, 0.62, 6), mat("#a8844a")); s2.position.y=0.31; s2.rotation.z=0.12; stand.add(s2);
    const f2=fe.clone(); f2.position.set(0.04, 0.62, 0); stand.add(f2); CATS.wandStand=stand;
    addUse(W[0]+0.6, W[1]-0.6, FL, "TAKE THE FEATHER WAND", ()=>CATS.toggle(), 1.6, ()=>{ const u=CATS.wandUse; if(u) u.label=CATS.wand ? "PUT THE FEATHER WAND BACK" : "TAKE THE FEATHER WAND"; return true; });
    CATS.wandUse=USES[USES.length-1]; }
  // petting: a use that follows each cat about
  for(const c of CATS.list){ const u=addUse(c.x, c.z, c.y, "PET "+c.name, ()=>CATS.pet(c), 1.3, ()=>{ u.x=c.x; u.z=c.z; u.y=c.y; return c.st!=="pounce"; }); c.use=u; }
  CATS.FL=FL; CATS.IN=IN;
})();
// a little sound: a purr (noise, low-passed, beating at about 26 a second) or a chirp
CATS.sound=function(kind, x, z){ if(typeof AUDIO==="undefined" || !AUDIO.ctx) return; const ctx=AUDIO.ctx(), out=AUDIO.outLP ? AUDIO.outLP() : null; if(!ctx || !out) return;
  const d=Math.hypot(x-camera.position.x, z-camera.position.z), v=Math.max(0, 1-d/9); if(v<=0) return; const t0=ctx.currentTime;
  if(kind==="purr"){ const s=ctx.createBufferSource(); s.buffer=AUDIO.noise(2.6, "brown"); const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=260;
    const g=ctx.createGain(); g.gain.value=0; const am=ctx.createGain(); am.gain.value=0.5; const lfo=ctx.createOscillator(); lfo.frequency.value=25+Math.random()*4; const lg=ctx.createGain(); lg.gain.value=0.5;
    lfo.connect(lg); lg.connect(am.gain); s.connect(lp); lp.connect(am); am.connect(g); g.connect(out);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.5*v, t0+0.3); g.gain.setValueAtTime(0.5*v, t0+2.0); g.gain.linearRampToValueAtTime(0, t0+2.5);
    s.start(t0); s.stop(t0+2.6); lfo.start(t0); lfo.stop(t0+2.6); }
  else { const o=ctx.createOscillator(); o.type="triangle"; const g=ctx.createGain(); const f0=kind==="mew" ? 620 : 900;
    o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f0*1.6, t0+0.12); o.frequency.linearRampToValueAtTime(f0*0.9, t0+(kind==="mew" ? 0.4 : 0.16));
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.12*v, t0+0.03); g.gain.linearRampToValueAtTime(0, t0+(kind==="mew" ? 0.42 : 0.18));
    o.connect(g); g.connect(out); o.start(t0); o.stop(t0+0.45); } };
CATS.pet=function(c){ c.st="pet"; c.t=2.6; c.pet=0; CATS.sound("purr", c.x, c.z);
  toast(c.name+(c.perch==="chair" ? " STRETCHES, AND PUSHES HIS HEAD INTO YOUR HAND" : c.perch ? " LEANS INTO YOUR HAND AND PURRS" : [" ROLLS OVER FOR YOU", " PURRS LIKE A LITTLE ENGINE", " BUMPS YOUR HAND WITH HER HEAD"][(Math.random()*3)|0]), "#e8d8a8"); };
CATS.toggle=function(){ CATS.wand=!CATS.wand; if(CATS.wandStand) CATS.wandStand.visible=!CATS.wand; if(CATS.wandG) CATS.wandG.g.visible=CATS.wand;
  if(CATS.wand){ toast("YOU TAKE THE FEATHER WAND. LOOK AT THE FLOOR AND THE CATS WILL COME FOR IT", "#e8d8a8"); CATS.sound("chirp", player.pos.x, player.pos.z); }
  else toast("YOU PUT THE WAND BACK IN ITS JAR", "#e8d8a8"); };
// can a cat stand here: on the shop's floor, clear of anything at its height
function _catFree(x, z){ const IN=CATS.IN, FL=CATS.FL; if(x<IN.x0+0.2 || x>IN.x1-0.2 || z<IN.z0+0.2 || z>IN.z1-0.2) return false;
  return !hitsAny(colsNear(x, z), x, z, 0.12, FL+0.05, FL+0.32); }
// a new place to wander to: somewhere free on the floor, with a free line to it
function _catPick(c){ for(let k=0;k<20;k++){ const IN=CATS.IN, x=IN.x0+0.4+Math.random()*(IN.x1-IN.x0-0.8), z=IN.z0+0.4+Math.random()*(IN.z1-IN.z0-0.8);
    if(!_catFree(x, z)) continue; let ok=true; const d=Math.hypot(x-c.x, z-c.z), n=Math.ceil(d/0.2); for(let i=1;i<=n && ok;i++) ok=_catFree(c.x+(x-c.x)*i/n, c.z+(z-c.z)*i/n);
    if(ok){ c.tx=x; c.tz=z; return true; } } return false; }
// the way across the shop's floor from one point to another: a breadth-first search over a 20 cm grid of the places a cat
// can stand (made once), its corners cut; null if there is none
function _catPath(x0, z0, x1, z1){ const IN=CATS.IN, S=0.2;
  if(!CATS.grid){ const nx=Math.floor((IN.x1-IN.x0)/S), nz=Math.floor((IN.z1-IN.z0)/S), ok=new Uint8Array(nx*nz);
    for(let i=0;i<nx;i++) for(let j=0;j<nz;j++) ok[i*nz+j]=_catFree(IN.x0+(i+0.5)*S, IN.z0+(j+0.5)*S) ? 1 : 0; CATS.grid={nx:nx, nz:nz, ok:ok}; }
  const G=CATS.grid, cell=(x, z)=>[clamp(Math.floor((x-IN.x0)/S), 0, G.nx-1), clamp(Math.floor((z-IN.z0)/S), 0, G.nz-1)];
  const [ai, aj]=cell(x0, z0); let [bi, bj]=cell(x1, z1);
  if(!G.ok[bi*G.nz+bj]){ let best=null, bd=1e9; for(let di=-3;di<=3;di++) for(let dj=-3;dj<=3;dj++){ const i=bi+di, j=bj+dj; if(i<0 || j<0 || i>=G.nx || j>=G.nz || !G.ok[i*G.nz+j]) continue; const d=di*di+dj*dj; if(d<bd){ bd=d; best=[i, j]; } } if(!best) return null; [bi, bj]=best; }
  const prev=new Int32Array(G.nx*G.nz).fill(-1), q=[ai*G.nz+aj]; prev[q[0]]=q[0];
  for(let h=0;h<q.length;h++){ const k=q[h]; if(k===bi*G.nz+bj) break; const i=(k/G.nz)|0, j=k%G.nz;
    for(const [di, dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){ const ii=i+di, jj=j+dj; if(ii<0 || jj<0 || ii>=G.nx || jj>=G.nz) continue; const kk=ii*G.nz+jj;
      if(prev[kk]>=0 || !G.ok[kk] || (di && dj && (!G.ok[ii*G.nz+j] || !G.ok[i*G.nz+jj]))) continue; prev[kk]=k; q.push(kk); } }
  let k=bi*G.nz+bj; if(prev[k]<0) return null; const P=[]; while(k!==prev[k]){ P.push([IN.x0+((k/G.nz)|0)*S+S/2, IN.z0+(k%G.nz)*S+S/2]); k=prev[k]; }
  P.reverse(); P.push([x1, z1]); return P; }
function updateCats(dt){
  if(!CATS.list.length) return; const IN=CATS.IN, FL=CATS.FL;
  const near=Math.hypot(camera.position.x-(IN.x0+IN.x1)/2, camera.position.z-(IN.z0+IN.z1)/2)<45;
  for(const c of CATS.list) c.g.visible=near; if(CATS.wandStand) CATS.wandStand.visible=near && !CATS.wand;
  if(!near){ if(CATS.wand) CATS.toggle(); return; }
  CATS.t+=dt; const t=CATS.t;
  // the wand: the feather where you look on the floor (within reach), bobbing; leave the shop and it goes back in its jar
  if(CATS.wand){ const inside=player.pos.x>IN.x0 && player.pos.x<IN.x1 && player.pos.z>IN.z0 && player.pos.z<IN.z1;
    if(!inside){ CATS.toggle(); }
    else { const d=new T.Vector3(); camera.getWorldDirection(d); const e=camera.position; let k=d.y< -0.05 ? (FL+0.04-e.y)/d.y : 2.0; k=clamp(k, 0.7, 3.0);
      let lx=e.x+d.x*k, lz=e.z+d.z*k; lx=clamp(lx, IN.x0+0.25, IN.x1-0.25); lz=clamp(lz, IN.z0+0.25, IN.z1-0.25);
      const bob=Math.abs(Math.sin(t*4.2))*0.14+Math.sin(t*9.0)*0.02; CATS.lure.set(lx, FL+0.05+bob, lz);
      const W=CATS.wandG, right=new T.Vector3().crossVectors(d, V3(0,1,0)).normalize(), hand=e.clone().addScaledVector(right, 0.22).addScaledVector(d, 0.35); hand.y-=0.3;
      const tip=hand.clone().addScaledVector(d, 0.55); tip.y+=0.2; const place=(m, a, b)=>{ const v=b.clone().sub(a), L=v.length(); m.position.copy(a).addScaledVector(v, 0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(V3(0,1,0), v.normalize()); };
      place(W.stick, hand, tip); const top=V3(CATS.lure.x, CATS.lure.y+0.06, CATS.lure.z); place(W.str, tip, top); W.fe.position.copy(top); W.fe.rotation.y=t*2; } }
  for(const c of CATS.list){ c.t-=dt; c.ph+=dt;
    let walk=0, sit=0, lie=0, crouch=0, petU=0, lookYaw=Math.sin(c.ph*0.4)*0.4, lookUp=0;
    if(c.st==="pet"){ petU=1; if(c.t<=0){ c.st=c.perch ? (c.perch==="window" ? "sit" : "sleep") : "sit"; c.t=3+Math.random()*4; } }
    else if(c.perch){ // the percher: asleep or sat; with the wand out, watching the feather
      if(CATS.wand){ const a=Math.atan2(CATS.lure.x-c.x, CATS.lure.z-c.z)-c.yaw; lookYaw=Math.atan2(Math.sin(a), Math.cos(a)); lookYaw=clamp(lookYaw, -1.1, 1.1); lookUp=0.35; if(c.st==="sleep" && Math.random()<dt*0.3){ c.st="sit"; } } }
    else if(CATS.wand && c.st!=="lie2"){ // stalking the feather, each from its own side of it
      const k=CATS.list.indexOf(c), oa=k*2.1+Math.sin(t*0.3+k)*0.4, ox=CATS.lure.x+Math.sin(oa)*0.5, oz=CATS.lure.z+Math.cos(oa)*0.5;
      const dx=ox-c.x, dz=oz-c.z, d=Math.hypot(dx, dz), want=Math.atan2(CATS.lure.x-c.x, CATS.lure.z-c.z);
      if(c.st==="pounce"){ c.hop+=dt/0.45; const k=Math.min(1, c.hop); c.x=c.px+(c.qx-c.px)*k; c.z=c.pz+(c.qz-c.pz)*k; c.yo=Math.sin(k*Math.PI)*0.22;
        if(k>=1){ c.st="bat"; c.t=0.8+Math.random()*0.6; c.yo=0; if(Math.random()<0.4) CATS.sound("chirp", c.x, c.z); } }
      else if(c.st==="crouch"){ crouch=1; if(c.t<=0){ const lx=CATS.lure.x-c.x, lz=CATS.lure.z-c.z, ld=Math.hypot(lx, lz), k=Math.max(0, Math.min(ld-0.3, 0.7)), ex=c.x+lx/(ld||1)*k, ez=c.z+lz/(ld||1)*k; if(_catFree(ex, ez)){ c.st="pounce"; c.hop=0; c.px=c.x; c.pz=c.z; c.qx=ex; c.qz=ez; } else { c.st="chase"; } } }
      else if(c.st==="bat"){ sit=1; lookUp=0.2; if(c.t<=0) c.st="chase"; }
      else { c.st="chase"; if(d<0.75){ c.st="crouch"; c.t=0.5+Math.random()*0.8; }
        else { const sp=1.4; let moved=false;
          // round the cases, not into them: a path over the floor's grid to the feather, worked out again every little while
          c.repT=(c.repT||0)-dt; if(c.repT<=0 || !c.path){ c.path=_catPath(c.x, c.z, ox, oz); c.repT=0.4; }
          let gx=ox, gz=oz; if(c.path){ while(c.path.length>1 && Math.hypot(c.path[0][0]-c.x, c.path[0][1]-c.z)<0.18) c.path.shift(); [gx, gz]=c.path[0]; }
          const ga=Math.atan2(gx-c.x, gz-c.z);
          for(const da of [0, 0.5, -0.5, 1.0, -1.0, 1.6, -1.6]){ const a=ga+da, nx=c.x+Math.sin(a)*sp*dt, nz=c.z+Math.cos(a)*sp*dt; if(_catFree(nx, nz)){ c.x=nx; c.z=nz; c.yaw=_turnToward(c.yaw, a, dt*6); moved=true; break; } }
          walk=moved ? 1.6 : 0; } }
      if(c.st==="crouch" || c.st==="bat") c.yaw=_turnToward(c.yaw, want, dt*8); }
    else { // by itself: sit, wash, lie, wander
      if(c.st==="chase" || c.st==="crouch" || c.st==="bat" || c.st==="pounce"){ c.st="sit"; c.t=2; c.yo=0; }
      if(c.st==="walk"){ const dx=c.tx-c.x, dz=c.tz-c.z, d=Math.hypot(dx, dz);
        if(d<0.08 || c.t<=0){ c.st=Math.random()<0.6 ? "sit" : "lie"; c.t=4+Math.random()*10; }
        else { const a=Math.atan2(dx, dz); c.yaw=_turnToward(c.yaw, a, dt*3); const nx=c.x+Math.sin(c.yaw)*0.45*dt, nz=c.z+Math.cos(c.yaw)*0.45*dt; if(_catFree(nx, nz)){ c.x=nx; c.z=nz; walk=1; } else c.t=0; } }
      else if(c.t<=0){ if(_catPick(c)){ c.st="walk"; c.t=12; } else c.t=2; } }
    // the pose: sitting, lying, crouched, petted or on its feet; then the legs, the tail, the head
    if(c.st==="sit" || c.st==="bat") sit=1; if(c.st==="lie" || c.st==="sleep") lie=1;
    const by=c.y+(c.yo||0); c.g.position.set(c.x, by, c.z); c.g.rotation.y=c.yaw;
    const B=c.body, L=c.legs;
    if(lie){ B.position.y=0.09; B.rotation.x=0; for(const l of L) l.rotation.x=-1.45; c.head.rotation.set(c.st==="sleep" ? 0.35 : 0, lookYaw*0.5, c.st==="sleep" ? 0.25 : 0); B.scale.y=1+Math.sin(c.ph*1.6)*0.03;
      c.tail.rotation.set(0.2, 0, 1.5); c.tail2.rotation.set(0, 0, 0.9+Math.sin(c.ph*0.5)*0.15); }      // (curled along its side)
    else if(sit || petU){ B.position.y=0.17; B.rotation.x=-0.55; L[0].rotation.x=L[1].rotation.x=0.5; L[2].rotation.x=L[3].rotation.x=-0.9;
      if(c.st==="bat"){ L[0].rotation.x=-0.6-Math.max(0, Math.sin(c.ph*14))*0.8; }
      c.head.rotation.set(0.45-lookUp-petU*0.35, lookYaw, petU*Math.sin(c.ph*2)*0.2);
      c.tail.rotation.set(petU ? -0.15 : 0.2, 0, petU ? 0 : 1.45); c.tail2.rotation.set(petU ? 0.4 : 0, 0, petU ? 0 : 0.8+Math.sin(c.ph*1.3)*0.3); B.scale.y=1; }      // (round its feet, or straight up when it is petted)
    else if(crouch){ B.position.y=0.12; B.rotation.x=0.05; for(const l of L) l.rotation.x=0; L[0].rotation.x=L[1].rotation.x=-0.5; c.head.rotation.set(-0.15, 0, 0);
      B.rotation.z=Math.sin(c.ph*18)*0.06; c.tail.rotation.set(-1.3, 0, Math.sin(c.ph*12)*0.3); c.tail2.rotation.set(-0.2, 0, Math.sin(c.ph*15)*0.4); }      // (low behind, the tip twitching)
    else { const sw=walk ? Math.sin(c.ph*(walk>1 ? 16 : 8)) : 0; B.position.y=0.2+Math.abs(sw)*0.01*walk; B.rotation.set(c.st==="pounce" ? -0.3 : 0, 0, 0);
      L[0].rotation.x=L[3].rotation.x=sw*0.5; L[1].rotation.x=L[2].rotation.x=-sw*0.5; c.head.rotation.set(walk>1 ? -0.1 : 0.1, walk>1 ? 0 : lookYaw*0.6, 0);
      c.tail.rotation.set(-0.4+Math.sin(c.ph*2)*0.1, 0, Math.sin(c.ph*1.7)*0.25); c.tail2.rotation.set(0.6, 0, Math.sin(c.ph*2.3)*0.3); B.scale.y=1; }      // (up, the tip hooked over)
    if(!crouch) B.rotation.z=0; }
}
function _turnToward(a, b, k){ let d=b-a; while(d>Math.PI) d-=Math.PI*2; while(d<-Math.PI) d+=Math.PI*2; return a+clamp(d, -k, k); }
