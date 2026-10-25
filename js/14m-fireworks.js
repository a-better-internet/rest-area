"use strict";
/* REST AREA · 14m-fireworks.js
   US 6N on east of Edinboro's fields: through the woods, and the fireworks
   outlet in its clearing, which you can walk into
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14m · THROUGH THE WOODS, AND FRENCH CREEK FIREWORKS

   THE WOODS. Past the last hay field the road goes on into the trees for a
   quarter mile and more (EAST.corr): second growth close on both sides,
   hemlock and maple at the edge with shrubs at their feet, the poles and
   the wires going on alongside (14y). A 45 sign, a deer crossing, and a
   board for the fireworks place, which you can see before you get there.

   FRENCH CREEK FIREWORKS. In its own clearing on the north side
   (EAST.store): a long white block building on an asphalt lot, three
   roll-up doors at its west end with yellow bollards in front of them, the
   glass doors and a display window at its east end under the lit sign, a
   banner on the front. At the road the red pole sign, lit at night, and a
   big yew on its bed of mulch. A container out back, a dumpster.
   Inside, one big sales floor under the bare joists: five gondolas of
   cakes, shells, rockets, fountains and sparklers down the middle, each
   aisle signed overhead; cases of the big cakes stacked on pallets inside
   the roll-up doors; the shelving to the ceiling along the back wall; the
   counter by the door with the register, the lighters and the ID notice.
   ---------------------------------------------------------------------- */
const FIREWORKS={};
(function fireworks(){
  const E=EDIN, A=EAST, Z=E.z, Y=E.y, HW=E.hw, r=_trng(7272);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||12),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  // several lines at one size: the smallest any of them needs to fit
  const sizeAll=(x, L, maxW, size, weight, family)=>{ let s=Math.min(size, x.canvas.height*0.62);
    for(const t of L){ for(;;){ x.font=weight+" "+s+"px "+family; if(x.measureText(t).width<=Math.min(maxW, x.canvas.width*0.84) || s<=7) break; s-=1; } }
    return s; };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,lit);
  const tree=(sp, x, z, s, col)=>{ FOREST.plant(sp, x, z, {scale:s}); if(col){ const rr=0.24*s, gy=Terrain.groundAt(x,z); addCol(x-rr, x+rr, z-rr, z+rr, gy-0.5, gy+6); } };
  const pave=(bk, x0,x1,z0,z1, y, color)=>{ const TL=7.4;
    for(let x=x0; x<x1-0.02; x+=TL) for(let z=z0; z<z1-0.02; z+=TL){ const w=Math.min(TL,x1-x), d=Math.min(TL,z1-z); if(w<0.06||d<0.06) continue;
      const g=new T.PlaneGeometry(w,d), U=g.attributes.uv, ou=r()*97, ov=r()*97;
      for(let i=0;i<U.count;i++) U.setXY(i, ou+U.getX(i)*w*0.62, ov+U.getY(i)*d*0.62);
      push(bk, g, x+w/2, y, z+d/2, 0, color, -Math.PI/2, 0); } };
  const EASTW=-Math.PI/2, WESTW=Math.PI/2;                     // a face read by traffic heading east (+x), west (-x)

  /* ---- the woods either side of the road --------------------------------------------------------------------- */
  // ragged rows of real trees from the clearing's edge back to the canopy, a hedge of shrubs at the front
  { const C0=A.corr, S=A.store;
    for(let x=C0.x0+30; x<A.town.x0-2; x+=5.4) for(const sd of [-1,1]) for(const row of [1.2, 5.0, 9.6, 14.5]){
      const xx=x+(hash2(x, row*sd)-0.5)*3.6, zz=Z+sd*(13+row+(hash2(row, x*sd)-0.5)*2.6);
      if(sd<0 && xx>S.x0-6 && xx<S.x1+6) continue;                                  // (the outlet's clearing)
      const q=hash2(xx*0.9, zz*1.1);
      tree(row<2 ? (q<0.2 ? "hemlock" : "edge") : (q<0.22 ? "hemlock" : q<0.30 ? "pine" : "hard"), xx, zz, 0.85+hash2(xx*3,zz)*0.35);
      if(row<2 && q<0.55) FOREST.plant("shrub", xx-1.4, Z+sd*(12.0+q), {scale:0.9+q, solid:false}); }
    // round the back and sides of the outlet's clearing
    for(let k=0;k<70;k++){ const w=S.x1-S.x0, h=(Z-13)-S.z0, d=k/70*(2*h+w);
      let x, z;
      if(d<h){ x=S.x0; z=Z-13-d; } else if(d<h+w){ x=S.x0+(d-h); z=S.z0; } else { x=S.x1; z=S.z0+(d-h-w); }
      for(const row of [1.5, 6.0]){ const nx=x===S.x0 ? -1 : x===S.x1 ? 1 : 0, nz=nx ? 0 : -1;
        const xx=x+nx*(row+hash2(k,row)*2)+(nz?(hash2(row,k)-0.5)*3:0), zz=z+nz*(row+hash2(row*2,k)*2)+(nx?(hash2(k*3,row)-0.5)*3:0);
        tree(row<2 ? "edge" : (hash2(xx,zz)<0.25 ? "hemlock" : "hard"), xx, zz, 0.85+hash2(zz,xx)*0.3); } }
    // and the walls: as far as you can push through, the trees' edge either side, round the outlet's clearing
    const W=(x0,x1,z0,z1)=>addCol(x0, x1, z0, z1, -40, 300);
    W(E.plain.x1, S.x0, C0.z0-0.4, C0.z0+0.4); W(S.x1, A.town.x0, C0.z0-0.4, C0.z0+0.4);
    W(S.x0-0.4, S.x0+0.4, S.z0, C0.z0); W(S.x0, S.x1, S.z0-0.4, S.z0+0.4); W(S.x1-0.4, S.x1+0.4, S.z0, C0.z0);
    W(E.plain.x1, A.town.x0, C0.z1-0.4, C0.z1+0.4);
    addZone(C0.x0+24, A.town.x0, C0.z0, C0.z1, Y-2, Y+12, "US 6N"); }

  /* ---- signs along the way ------------------------------------------------------------------------------------- */
  // a plain sign on a post, its face toward (sin ry, cos ry)
  const postSign=(x, z, w, h, ry, draw, top, diamond)=>{ const f=XF(x, z, ry), gy=Terrain.groundAt(x,z), y=gy+(top||2.3);
    B(0.07, y-gy+h/2, 0.07, f.x(0,-0.05), gy+(y-gy+h/2)/2, f.z(0,-0.05), "#a3a8aa", ry);
    B(w+0.02, h+0.02, 0.03, f.x(0,-0.025), y, f.z(0,-0.025), "#8d9294", ry, 0, diamond ? Math.PI/4 : 0);
    const m=signPanel(w, h, signTex(Math.round(w*240), Math.round(h*240), draw), f.x(0,0.002), y, f.z(0,0.002), ry); if(diamond) m.rotation.z=Math.PI/4;
    addCol(f.x(0,-0.05)-0.06, f.x(0,-0.05)+0.06, f.z(0,-0.05)-0.06, f.z(0,-0.05)+0.06, gy-0.5, y); };
  postSign(632, Z+HW+2.4, 0.76, 0.96, EASTW, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); c.strokeStyle="#1a1a1a"; c.lineWidth=6; c.strokeRect(8,8,W-16,H-16);
    c.fillStyle="#1a1a1a"; const s=sizeAll(c, ["SPEED","LIMIT"], W*0.76, H*0.17, "700", "Arial"); say(c, "SPEED", W/2, H*0.21, W*0.76, s, "#1a1a1a", "700", "Arial"); say(c, "LIMIT", W/2, H*0.38, W*0.76, s, "#1a1a1a", "700", "Arial");
    fitHwy(c, "45", W*0.70, H*0.40, W/2, H*0.68); });
  postSign(1050, Z-HW-2.4, 0.76, 0.96, WESTW, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); c.strokeStyle="#1a1a1a"; c.lineWidth=6; c.strokeRect(8,8,W-16,H-16);
    const s=sizeAll(c, ["SPEED","LIMIT"], W*0.76, H*0.17, "700", "Arial"); say(c, "SPEED", W/2, H*0.21, W*0.76, s, "#1a1a1a", "700", "Arial"); say(c, "LIMIT", W/2, H*0.38, W*0.76, s, "#1a1a1a", "700", "Arial");
    c.fillStyle="#1a1a1a"; fitHwy(c, "45", W*0.70, H*0.40, W/2, H*0.68); });
  for(const [x, z, ry] of [[712, Z+HW+2.4, EASTW], [990, Z-HW-2.4, WESTW]])
    postSign(x, z, 0.80, 0.80, ry, (c,W,H)=>{ c.fillStyle="#f2c230"; c.fillRect(0,0,W,H); c.save(); c.translate(W/2,H/2); c.rotate(-Math.PI/4);
      c.strokeStyle="#1a1a1a"; c.lineWidth=7; c.strokeRect(-W*0.36,-H*0.36,W*0.72,H*0.72);
      // the leaping buck, black on the yellow
      c.fillStyle="#1a1a1a"; c.beginPath(); c.ellipse(-W*0.02, H*0.02, W*0.17, H*0.075, -0.25, 0, 7); c.fill();
      c.beginPath(); c.moveTo(W*0.12,-H*0.05); c.lineTo(W*0.22,-H*0.15); c.lineTo(W*0.25,-H*0.12); c.lineTo(W*0.17,-H*0.02); c.fill();
      c.lineWidth=5; c.beginPath(); c.moveTo(W*0.22,-H*0.15); c.lineTo(W*0.20,-H*0.24); c.moveTo(W*0.22,-H*0.15); c.lineTo(W*0.28,-H*0.22); c.stroke();
      c.beginPath(); c.moveTo(-W*0.10,H*0.06); c.lineTo(-W*0.20,H*0.18); c.moveTo(-W*0.13,H*0.05); c.lineTo(-W*0.24,H*0.12); c.moveTo(W*0.08,H*0.05); c.lineTo(W*0.17,H*0.16); c.moveTo(W*0.05,H*0.06); c.lineTo(W*0.12,H*0.19); c.stroke();
      c.restore(); }, 2.3, true);
  // a board on two posts coming up to it, eastbound: the place's own advertising
  { const x=780, z=Z+HW+5.5, f=XF(x, z, EASTW), gy=Terrain.groundAt(x,z), w=4.8, h=2.4, y=gy+2.2+h/2;
    for(const lx of [-1.6, 1.6]){ bx("wood", 0.20, y+h/2-gy, 0.20, f.x(lx,-0.16), gy+(y+h/2-gy)/2, f.z(lx,-0.16), 0.4, EASTW, "#6d5c48"); addCol(f.x(lx,-0.16)-0.12, f.x(lx,-0.16)+0.12, f.z(lx,-0.16)-0.12, f.z(lx,-0.16)+0.12, gy-0.5, y+h/2); }
    B(w+0.10, h+0.10, 0.08, f.x(0,-0.05), y, f.z(0,-0.05), "#e8e4da", EASTW);
    sign(w, h, (c,W,H)=>{ const g=c.createLinearGradient(0,0,0,H); g.addColorStop(0,"#0f1d4a"); g.addColorStop(1,"#1d3a8a"); c.fillStyle=g; c.fillRect(0,0,W,H);
        for(let k=0;k<9;k++){ const bx0=W*(0.08+0.84*r()), by=H*(0.10+0.30*r()), rad=H*(0.06+0.08*r()), col=["#ff4a2a","#ffd247","#4af0ff","#ff5ad2","#7cff6a"][k%5];
          c.strokeStyle=col; c.lineWidth=3; for(let a=0;a<14;a++){ const t=a/14*Math.PI*2; c.beginPath(); c.moveTo(bx0+Math.cos(t)*rad*0.3, by+Math.sin(t)*rad*0.3); c.lineTo(bx0+Math.cos(t)*rad, by+Math.sin(t)*rad); c.stroke(); } }
        say(c, "FIREWORKS", W/2, H*0.52, W*0.80, H*0.26, "#ffd247", "900", "'Arial Black', Arial");
        const L=["FRENCH CREEK FIREWORKS · AHEAD ON LEFT"], s=sizeAll(c, L, W*0.80, H*0.10, "700", "Arial");
        say(c, L[0], W/2, H*0.80, W*0.80, s, "#f4f2ec", "700", "Arial"); },
      f.x(0,-0.005), y, f.z(0,-0.005), EASTW, false, 960); }

  /* ======================================================================
     FRENCH CREEK FIREWORKS
     ====================================================================== */
  const S=A.store, LY=Y+PAVE_T+0.015;
  // the lot, lapping a little onto the road's shoulder; its lines; a curb at its back corners
  pave("lotpave", S.x0+2, S.x1-2, Z-62, Z-HW+0.05, LY, "#a2a2a0");
  addPaveRect(S.x0+2, S.x1-2, Z-62, Z-HW+0.05, Y);
  A.noPole.push([S.x0-4, S.x1+4]);
  const line=(x, z, w, d, y, col)=>push("paint", planeGeo(w, d, 0), x, y, z, 0, col, -Math.PI/2, 0);
  for(let x=931.4; x<=962; x+=2.8) line(x, Z-55.4, 0.11, 5.0, LY+0.008, "#eceae2");
  for(let x=878; x<=890; x+=2.8) line(x, Z-55.4, 0.11, 5.0, LY+0.008, "#eceae2");
  line(960.8, Z-55.4, 2.5, 4.8, LY+0.012, "#3a62b8");                                               // (the accessible stall, in blue, over its lines)
  addZone(S.x0, S.x1, S.z0, S.z1, Y-2, Y+12, "FRENCH CREEK FIREWORKS");

  /* ---- the building ---- */
  const BX0=893.0, BX1=925.0, BZ0=Z-74.0, BZ1=Z-58.0, WT=0.25, FLS=Y+0.15, CEIL=FLS+4.6, TOPW=FLS+5.4;
  const IX0=BX0+WT, IX1=BX1-WT, IZ0=BZ0+WT, IZ1=BZ1-WT;
  const ROLL=[[895.0, 898.2],[899.4, 902.6],[903.8, 907.0]].map(([a,b])=>({a:a, b:b, sill:FLS-0.004, head:FLS+3.4}));
  const DOOR={a:912.98, b:914.94, sill:FLS-0.004, head:FLS+2.25};
  const GLASS=[{a:910.6, b:912.75, sill:FLS+0.55, head:FLS+2.50}, {a:915.17, b:923.6, sill:FLS+0.55, head:FLS+2.50}];
  const front=ROLL.concat([DOOR], GLASS);
  // the slab, and the walk along the front at the floor's level, a step up off the lot; its curb painted yellow
  bx("concrete", BX1-BX0+0.02, FLS-Y+0.3, BZ1-BZ0+0.02, (BX0+BX1)/2, (FLS+Y-0.3)/2, (BZ0+BZ1)/2, 0.5, 0, "#b3afa6");
  bx("concrete", 20.0, FLS-Y+0.3, 2.6, 916.0, (FLS+Y-0.3)/2-0.004, BZ1+1.3+0.01, 0.6, 0, "#c3c0b8");
  B(20.02, 0.10, 0.03, 916.0, FLS-0.062, BZ1+2.612, "#e6c21c");
  addFlat(906.0, 926.0, BZ1-0.2, BZ1+2.61, FLS);
  addFlat(IX0, IX1, IZ0, IZ1, FLS);
  for(const o of ROLL) addFlat(o.a, o.b, BZ1-WT-0.01, BZ1+0.01, FLS);
  addFlat(DOOR.a, DOOR.b, BZ1-WT-0.01, BZ1+0.01, FLS);
  // the walls: painted block, white, a red band round the top; the parapet's cap; inside, painted block too
  runX("block", BZ1-WT/2, WT, BX0, BX1, Y-0.1, TOPW, front, "#f2f0ea", 0.6);
  runX("block", BZ0+WT/2, WT, BX0, BX1, Y-0.1, TOPW, [], "#f2f0ea", 0.6);
  runZ("block", BX0+WT/2, WT, IZ0, IZ1, Y-0.1, TOPW, [], "#f2f0ea", 0.6);
  runZ("block", BX1-WT/2, WT, IZ0, IZ1, Y-0.1, TOPW, [], "#f2f0ea", 0.6);
  for(const [x0,x1,z0,z1] of [[BX0-0.03, BX1+0.03, BZ1-0.02, BZ1+0.03], [BX0-0.03, BX1+0.03, BZ0-0.03, BZ0+0.02], [BX0-0.03, BX0+0.02, BZ0+0.02, BZ1-0.02], [BX1-0.02, BX1+0.03, BZ0+0.02, BZ1-0.02]])
    B(x1-x0, 0.55, z1-z0, (x0+x1)/2, TOPW-0.55, (z0+z1)/2, "#c42a1a");
  B(BX1-BX0+0.16, 0.10, BZ1-BZ0+0.16, (BX0+BX1)/2, TOPW+0.05, (BZ0+BZ1)/2, "#d8d6d0");
  for(const [y0,y1,col] of [[FLS, FLS+2.4, "#ecebe6"],[FLS+2.4, CEIL, "#f4f3ee"]]){
    lineX("block", IZ1, -1, IX0, IX1, y0, y1, front, col, 0.6);
    lineX("block", IZ0, 1, IX0, IX1, y0, y1, [], col, 0.6);
    lineZ("block", IX0, 1, IZ0, IZ1, y0, y1, [], col, 0.6);
    lineZ("block", IX1, -1, IZ0, IZ1, y0, y1, [], col, 0.6); }
  // a red stripe round the inside at shoulder height, sunk into the wall
  for(const [f, dir] of [[IZ0, 1],[IZ1, -1]]) for(const [a,b] of dir>0 ? [[IX0, IX1]] : [[IX0, ROLL[0].a-0.06],[ROLL[2].b+0.06, GLASS[0].a-0.06],[GLASS[1].b+0.06, IX1]])
    if(b-a>0.1) B(b-a, 0.16, 0.03, (a+b)/2, FLS+2.48, f+dir*0.01, "#c42a1a");
  for(const [f, dir] of [[IX0, 1],[IX1, -1]]) B(0.03, 0.175, IZ1-IZ0-0.01, f+dir*0.01, FLS+2.4825, (IZ0+IZ1)/2, "#c42a1a");      // (taller than the runs along x, so no faces meet in the corners)
  floorAt("concrete", IX0, IX1, IZ0, IZ1, FLS+0.004, "#9a9894", 0.5);
  ceilAt("plaster", IX0, IX1, IZ0, IZ1, CEIL, "#e8e6e0", 0.5);
  // the bare joists under the deck, across the short way, and a beam down the middle on two columns
  for(let x=IX0+1.0; x<IX1-0.5; x+=1.5){ B(0.08, 0.36, IZ1-IZ0-0.02, x, CEIL-0.18, (IZ0+IZ1)/2, "#8a8d90"); B(0.20, 0.04, IZ1-IZ0-0.02, x, CEIL-0.36, (IZ0+IZ1)/2, "#7a7d80"); }
  B(IX1-IX0-0.02, 0.40, 0.22, (IX0+IX1)/2, CEIL-0.58, (IZ0+IZ1)/2, "#7a7d80");
  for(const x of [905.6, 916.4]){ C(0.11, CEIL-0.78-FLS, x, (FLS+CEIL-0.78)/2, (IZ0+IZ1)/2, "#c42a1a", 14); addCol(x-0.13, x+0.13, (IZ0+IZ1)/2-0.13, (IZ0+IZ1)/2+0.13, FLS-0.5, CEIL); }
  addZone(IX0, IX1, IZ0, IZ1, FLS-0.5, CEIL, "FRENCH CREEK FIREWORKS", true);
  // the lights: strip fixtures in three rows under the joists
  for(const z of [IZ0+3.2, (IZ0+IZ1)/2+1.4, IZ1-3.0]) for(let x=IX0+3.0; x<IX1-2; x+=5.2){
    B(0.22, 0.08, 2.44, x, CEIL-0.95, z, "#d8dad6"); push("tube", boxGeo(0.14, 0.012, 2.36, 0), x, CEIL-1.004, z, 0, "#ffffff");
    tubeE(V3(x, CEIL-0.91, z-0.9), V3(x, CEIL-0.40, z-0.9), 0.004, "#2a2a2a"); tubeE(V3(x, CEIL-0.91, z+0.9), V3(x, CEIL-0.40, z+0.9), 0.004, "#2a2a2a"); }
  for(const [x,z] of [[899, IZ0+4.5],[911, IZ0+4.5],[899, IZ1-4.0],[911, IZ1-4.0],[920.5, (IZ0+IZ1)/2]])
    LAMPS.push({x:x, y:CEIL-1.3, z:z, color:0xf4f6f0, intensity:0.85, dist:11, decay:1.4, indoor:true, vol:[IX0, IX1, IZ0, IZ1, FLS-0.5, CEIL]});

  // the roll-up doors: ribbed steel, white, down; a track up each side inside, the coil's hood over the head
  for(const o of ROLL){ const w=o.b-o.a, xc=(o.a+o.b)/2, zc=BZ1-WT/2;
    B(w+0.04, o.head-FLS, 0.05, xc, (FLS+o.head)/2, zc, "#eeeee8");
    for(let y=FLS+0.18; y<o.head-0.05; y+=0.19) for(const sd of [-1,1]) B(w, 0.018, 0.012, xc, y, zc+sd*0.031, "#d6d6d0");
    for(const sd of [-1,1]) B(0.12, 0.06, 0.012, xc+0.6, FLS+0.12, zc+sd*0.031, "#2a2a2c");
    for(const x of [o.a-0.04, o.b+0.04]) B(0.06, o.head-FLS+0.3, 0.10, x, (FLS+o.head+0.3)/2, IZ1-0.06, "#9a9da0");
    B(w+0.3, 0.42, 0.42, xc, o.head+0.26, IZ1-0.22, "#b8bab8");
    addCol(o.a, o.b, BZ1-WT, BZ1, FLS-0.5, o.head);
    // the bollards in front of it outside: yellow pipe, capped
    for(const x of [o.a+0.3, o.b-0.3]){ C(0.08, 1.05, x, LY+0.52, BZ1+0.9, "#e6c21c", 14); ent(new T.SphereGeometry(0.08, 12, 6, 0, Math.PI*2, 0, Math.PI/2), x, LY+1.045, BZ1+0.9, "#e6c21c");
      addCol(x-0.09, x+0.09, BZ1+0.81, BZ1+0.99, Y-0.5, LY+1.1); } }
  // the storefront: dark bronze frames, the glass, the doors
  for(const o of GLASS){ push("glass", planeGeo(o.b-o.a-0.04, o.head-o.sill-0.04, 0), (o.a+o.b)/2, (o.sill+o.head)/2, BZ1-WT/2, 0, "#ffffff");
    for(const x of [o.a+0.025, o.b-0.025]) B(0.05, o.head-o.sill-0.01, WT+0.06, x, (o.sill+o.head)/2, BZ1-WT/2, "#3b3029");
    for(const y of [o.sill+0.025, o.head-0.025]) B(o.b-o.a-0.04, 0.05, WT+0.05, (o.a+o.b)/2, y, BZ1-WT/2, "#3b3029");
    addCol(o.a, o.b, BZ1-WT, BZ1, o.sill, o.head);
    for(let x=o.a+2.1; x<o.b-0.5; x+=2.1) B(0.05, o.head-o.sill-0.08, 0.06, x, (o.sill+o.head)/2, BZ1-WT/2, "#3b3029"); }
  frX(BZ1-WT/2, WT, DOOR.a, DOOR.b, FLS, DOOR.head, "#3b3029");
  makeDoor(XF(DOOR.a+0.02, BZ1-WT/2, 0), 0, FLS+0.01, 0, "FRENCH CREEK FIREWORKS", true, 0, "store");
  makeDoor(XF(DOOR.b-0.02, BZ1-WT/2, Math.PI), 0, FLS+0.01, 0, "FRENCH CREEK FIREWORKS", false, 0, "store");
  B(DOOR.b-DOOR.a+0.004, 0.016, WT+0.03, (DOOR.a+DOOR.b)/2, FLS+0.008, BZ1-WT/2, "#8a8a86");
  // posters in the window, on the inside of the glass facing out: a burst, a deal; their backs
  for(const [x, t1, t2, bg] of [[917.4, "BUY 1", "GET 2 FREE", "#c42a1a"], [920.6, "NEW!", "500 GRAM CAKES", "#1d3a8a"]]){
    B(1.5, 1.0, 0.006, x, FLS+1.55, BZ1-WT/2-0.045, "#f4f2ec");
    sign(1.5, 1.0, (c,W,H)=>{ c.fillStyle=bg; c.fillRect(0,0,W,H); c.strokeStyle="#ffd247"; c.lineWidth=8; c.strokeRect(8,8,W-16,H-16);
        const s=sizeAll(c, [t1], W*0.76, H*0.30, "900", "'Arial Black', Arial"); say(c, t1, W/2, H*0.36, W*0.76, s, "#ffd247", "900", "'Arial Black', Arial");
        say(c, t2, W/2, H*0.70, W*0.76, H*0.17, "#f4f2ec", "800", "Arial"); }, x, FLS+1.55, BZ1-WT/2-0.03, 0, false, 360); }
  // over the doors, outside: the lit sign; a banner on the front over the roll-up doors
  B(9.0, 1.3, 0.30, 917.0, FLS+3.55, BZ1+0.15, "#f4f2ec");
  sign(8.8, 1.1, (c,W,H)=>{ c.fillStyle="#f6f4ee"; c.fillRect(0,0,W,H); c.strokeStyle="#c42a1a"; c.lineWidth=10; c.strokeRect(10,10,W-20,H-20);
      const s=sizeAll(c, ["FRENCH CREEK FIREWORKS"], W*0.80, H*0.48, "900", "'Arial Black', Arial");
      say(c, "FRENCH CREEK FIREWORKS", W/2, H*0.53, W*0.80, s, "#c42a1a", "900", "'Arial Black', Arial"); }, 917.0, FLS+3.55, BZ1+0.31, 0, true, 1400);
  sign(9.4, 1.3, (c,W,H)=>{ c.fillStyle="#1d3a8a"; c.fillRect(0,0,W,H); c.fillStyle="#c42a1a"; c.fillRect(0,0,W,H*0.18); c.fillRect(0,H*0.82,W,H*0.18);
      for(let k=0;k<26;k++){ c.fillStyle="#f4f2ec"; const x=W*0.04+k*W*0.0355; c.beginPath(); for(let i=0;i<10;i++){ const a=i*Math.PI/5-Math.PI/2, rr=i%2?3:7; c.lineTo(x+Math.cos(a)*rr, H*0.09+Math.sin(a)*rr); } c.fill(); }
      const L=["OPEN 7 DAYS · ALL YEAR"], s=sizeAll(c, L, W*0.78, H*0.34, "900", "'Arial Black', Arial");
      say(c, L[0], W/2, H*0.50, W*0.78, s, "#ffd247", "900", "'Arial Black', Arial"); }, 901.0, FLS+4.15, BZ1+0.02, 0, false, 1200);
  // the yew at the corner of the walk, on its bed of mulch, edged
  bucketOf("mulch", ()=>new T.MeshStandardMaterial(Object.assign({color:0xffffff, roughness:1.0}, _po(-4))));
  { const mx=880.5, mz=Z-12.0;
    push("mulch", new T.CircleGeometry(3.4, 28), mx, LY+0.012, mz, 0, "#4a3020", -Math.PI/2, 0);
    for(let k=0;k<26;k++){ const a=k/26*Math.PI*2; B(0.82, 0.10, 0.06, mx+Math.cos(a)*3.42, LY+0.03, mz+Math.sin(a)*3.42, "#8a867c", -a+Math.PI/2); }
    FOREST.plant("shrub", mx, mz, {scale:3.2, solid:false, y:LY});
    for(const [dx,dz,s] of [[1.6,0.9,1.6],[-1.4,1.2,1.4],[0.4,-1.7,1.5]]) FOREST.plant("shrub", mx+dx, mz+dz, {scale:s, solid:false, y:LY});
    addCol(mx-1.9, mx+1.9, mz-1.9, mz+1.9, Y-0.5, Y+2.6); }

  /* ---- the pole sign at the road: two red posts, the cabinet, lit at night ---- */
  { const px=876.4, pz=Z-HW-3.0, gy=Y, H0=gy+6.2, W=5.4, H=2.6;
    for(const dz of [-1.7, 1.7]){ C(0.17, H0+H-gy+0.2, px, gy+(H0+H+0.2-gy)/2, pz+dz, "#b82418", 16); addCol(px-0.2, px+0.2, pz+dz-0.2, pz+dz+0.2, gy-0.5, H0+H); }
    B(0.42, H+0.16, W+0.16, px, H0+H/2, pz, "#b82418");
    B(0.36, 1.1, W-0.4, px, H0-0.75, pz, "#f4f2ec");
    const face=(c,W2,H2)=>{ c.fillStyle="#c42a1a"; c.fillRect(0,0,W2,H2);
      for(let k=0;k<5;k++){ const bx0=W2*(0.1+0.2*k), by=H2*0.22; c.strokeStyle=["#ffd247","#f4f2ec","#4af0ff","#ffd247","#f4f2ec"][k]; c.lineWidth=3;
        for(let a=0;a<12;a++){ const t=a/12*Math.PI*2; c.beginPath(); c.moveTo(bx0+Math.cos(t)*8, by+Math.sin(t)*8); c.lineTo(bx0+Math.cos(t)*22, by+Math.sin(t)*22); c.stroke(); } }
      say(c, "FIREWORKS", W2/2, H2*0.62, W2*0.82, H2*0.40, "#f4f2ec", "900", "'Arial Black', Arial"); };
    const sub=(c,W2,H2)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W2,H2); const L=["WHOLESALE PRICES","OPEN 7 DAYS"], s=sizeAll(c, L, W2*0.80, H2*0.30, "800", "Arial");
      L.forEach((t,k)=>say(c, t, W2/2, H2*(0.30+k*0.40), W2*0.80, s, "#1d3a8a", "800", "Arial")); };
    for(const sd of [-1,1]){ const ry=sd>0 ? Math.PI/2 : -Math.PI/2;
      sign(W, H, face, px+sd*0.215, H0+H/2, pz, ry, true, 900);
      sign(W-0.5, 1.0, sub, px+sd*0.185, H0-0.75, pz, ry, false, 700); }
    LAMPS.push({x:px, y:H0-1.6, z:pz, color:0xfff0e0, intensity:0.5, dist:9, decay:1.6, mothy:true});
    // and two lot lights, shoeboxes on poles
    for(const [x,z] of [[900, Z-30],[946, Z-30]]){ C(0.09, 7.6, x, Y+3.8, z, "#5a5e60", 12); B(0.7, 0.16, 0.4, x, Y+7.6, z+0.25, "#3a3e40"); push("tube", boxGeo(0.56, 0.012, 0.3, 0), x, Y+7.515, z+0.25, 0, "#ffffff");
      bx("concrete", 0.6, 0.5, 0.6, x, Y+0.2, z, 0.5, 0, "#a8a49a"); addCol(x-0.32, x+0.32, z-0.32, z+0.32, Y-0.5, Y+7.6);
      LAMPS.push({x:x, y:Y+7.3, z:z+0.25, color:0xf8f0e0, intensity:0.9, dist:24, decay:1.3, mothy:true}); } }
  // out back: a shipping container for the stock, a dumpster by the east wall
  { B(12.2, 2.6, 2.45, 898.6, Y+1.3, BZ0-3.2, "#7a2a1e"); for(let k=0;k<30;k++) for(const sd of [-1,1]) B(0.08, 2.4, 0.03, 892.7+k*0.4, Y+1.3, BZ0-3.2+sd*1.235, "#6a2418");
    for(const sd of [-1,1]) B(0.03, 2.4, 1.1, 904.72, Y+1.3, BZ0-3.2+sd*0.6, "#6a2418");
    addCol(892.5, 904.75, BZ0-4.45, BZ0-1.95, Y-0.5, Y+2.6);
    B(1.9, 1.3, 1.6, BX1+1.6, Y+0.68, BZ0+4.0, "#2a5a3a"); B(2.0, 0.08, 1.7, BX1+1.6, Y+1.37, BZ0+4.0, "#1e4a2e");
    addCol(BX1+0.6, BX1+2.6, BZ0+3.2, BZ0+4.8, Y-0.5, Y+1.4); }

  /* ---- inside: the goods ---------------------------------------------------------------------------------------- */
  // what's on the shelves, drawn as rows of packages along a strip: one sheet each for the big cakes, the mid
  // stuff (fountains, shells, rockets), the small things; tinted per shelf
  const NAMES=[["THUNDER KING","SKY RAIDER","PATRIOT","NIGHT HAWK","LOST IN SPACE","BIG DADDY","WAR PARTY","MONSTER"],
               ["FOUNTAIN","SHELLS","ROCKETS","MISSILE","COMET","BOMBARD","SPINNER","SALUTE"],
               ["SPARKLER","SNAPPER","SMOKE","POPPER","FLASHER","GLOW","CRACKLE","SNAKES"]];
  const goods=(k)=>{ const t=signTex(1024, 128, (c,W,H)=>{ const q=_trng(311+k*17); c.fillStyle="#1a1410"; c.fillRect(0,0,W,H);
      let x=6; while(x<W-6){ const w=k===0 ? 110+q()*40 : k===1 ? 60+q()*30 : 34+q()*16, h=k===0 ? H-14 : H*(0.55+q()*0.35);
        const col=["#c42a1a","#1d3a8a","#1a1a1a","#e6a21c","#2a7a3a","#7a2aa8","#d8d4c8"][(q()*7)|0];
        if(x+w>W-6) break;
        c.fillStyle=col; c.fillRect(x, H-6-h, w-3, h);
        for(let a=0;a<10;a++){ const t2=a/10*Math.PI*2, cx=x+w/2, cy=H-6-h*0.62, rr=Math.min(w,h)*0.34; c.strokeStyle=["#ffd247","#4af0ff","#ff5ad2","#f4f2ec"][(a+k)%4]; c.lineWidth=2;
          c.beginPath(); c.moveTo(cx+Math.cos(t2)*rr*0.25, cy+Math.sin(t2)*rr*0.25); c.lineTo(cx+Math.cos(t2)*rr, cy+Math.sin(t2)*rr); c.stroke(); }
        if(w>40){ c.fillStyle="#f4f2ec"; fitText(c, NAMES[k][(q()*8)|0], (w-3)*0.80, Math.min(h*0.16, 16), x+(w-3)/2, H-6-h*0.18, "800", "Arial"); }
        x+=w; } });
    t.wrapS=T.RepeatWrapping; return t; };
  for(let k=0;k<3;k++) bucketOf("fw_goods"+k, ()=>new T.MeshStandardMaterial({map:goods(k), roughness:0.55}));
  // a strip of goods standing on a shelf, facing ry: a sheet a centimetre in front of the dark box behind it
  const strip=(k, x, y, z, L, h, ry, dpt)=>{ const g=new T.PlaneGeometry(L, h), U=g.attributes.uv, u0=r()*7;
    for(let i=0;i<U.count;i++) U.setXY(i, u0+U.getX(i)*L/2.6, U.getY(i));
    const nx=Math.sin(ry), nz=Math.cos(ry);
    push("fw_goods"+k, g, x+nx*0.012, y+h/2, z+nz*0.012, ry, "#ffffff");
    const dx=Math.abs(nx)>0.5 ? dpt : L, dz=Math.abs(nx)>0.5 ? L : dpt;
    B(dx, h-0.02, dz, x-nx*dpt/2, y+h/2-0.01, z-nz*dpt/2, "#2a221c"); };
  // the gondolas: down the middle, north to south, a pegboard spine, three shelves a side
  const GZ0=IZ0+2.4, GZ1=IZ1-3.6, GL=GZ1-GZ0;
  [896.6, 900.2, 903.8, 907.4, 911.0].forEach((gx, i)=>{
    B(1.06, 0.12, GL, gx, FLS+0.06, (GZ0+GZ1)/2, "#3a3c40"); B(0.05, 1.72, GL, gx, FLS+0.98, (GZ0+GZ1)/2, "#8a8a84");
    for(const sd of [-1,1]){ const ry=sd>0 ? Math.PI/2 : -Math.PI/2;
      [[0.12, 0, 0.42],[0.66, 1, 0.34],[1.18, 2, 0.26]].forEach(([y, k, h])=>{
        B(0.48, 0.03, GL, gx+sd*0.27, FLS+y, (GZ0+GZ1)/2, "#c8c8c2");
        strip(k, gx+sd*0.47, FLS+y+0.015, (GZ0+GZ1)/2, GL-0.1, h, ry, 0.40); });
      B(0.02, 0.07, GL, gx+sd*0.51, FLS+0.18, (GZ0+GZ1)/2, "#e6c21c"); }
    // an end cap at the front of each, toward the door: a stack of the week's special
    strip(i%3, gx, FLS+0.12, GZ1+0.06, 1.0, 0.9, 0, 0.30);
    addCol(gx-0.53, gx+0.53, GZ0, GZ1+0.4, FLS-0.5, FLS+1.9);
    // and its sign overhead: two-sided, on chains
    const lab=["CAKES · REPEATERS","ARTILLERY SHELLS","ROCKETS · MISSILES","FOUNTAINS","SPARKLERS · NOVELTIES"][i], sy=FLS+3.1, sz=(GZ0+GZ1)/2;
    for(const sd of [-1,1]) sign(1.9, 0.42, (c,W,H)=>{ c.fillStyle="#c42a1a"; c.fillRect(0,0,W,H); c.strokeStyle="#f4f2ec"; c.lineWidth=4; c.strokeRect(5,5,W-10,H-10);
        say(c, lab, W/2, H*0.54, W*0.78, H*0.42, "#f4f2ec", "800", "Arial"); }, gx, sy, sz+sd*0.011, sd>0 ? 0 : Math.PI, false, 560);
    B(1.92, 0.44, 0.012, gx, sy, sz, "#c42a1a");
    for(const dx of [-0.8, 0.8]) tubeE(V3(gx+dx, sy+0.22, sz), V3(gx+dx, CEIL-0.40, sz), 0.004, "#2a2a2a"); });
  // the shelving up the back wall: four high, the big cases, the assortments
  for(const [y, k, h] of [[0.12, 0, 0.55],[0.85, 0, 0.55],[1.58, 1, 0.42],[2.22, 0, 0.55]]){
    B(16.0, 0.04, 0.70, 902.0, FLS+y, IZ0+0.40, "#c8c8c2");
    strip(k, 902.0, FLS+y+0.02, IZ0+0.74, 15.8, h, 0, 0.6); }
  for(const x of [894.0, 902.0, 910.0]) B(0.08, 2.9, 0.06, x, FLS+1.45, IZ0+0.74, "#2a5aa8");
  addCol(893.9, 910.1, IZ0, IZ0+0.8, FLS-0.5, FLS+2.9);
  sign(4.0, 0.6, (c,W,H)=>{ c.fillStyle="#1d3a8a"; c.fillRect(0,0,W,H); say(c, "ASSORTMENTS · 500 GRAM CAKES", W/2, H*0.54, W*0.80, H*0.44, "#ffd247", "800", "Arial"); },
    902.0, FLS+3.15, IZ0+0.012, 0, false, 900);
  // inside the roll-up doors: pallets of cases, shrink-wrapped, two high
  for(const [px, pz, n] of [[896.6, IZ1-1.6, 2],[900.4, IZ1-1.6, 3],[904.4, IZ1-1.7, 2]]){
    B(1.2, 0.14, 1.0, px, FLS+0.07, pz, "#9a7a4a");
    for(let l=0;l<n;l++) for(const [dx,dz] of [[-0.3,-0.25],[0.3,-0.25],[-0.3,0.25],[0.3,0.25]]){
      const y=FLS+0.14+l*0.42+0.21; B(0.56, 0.40, 0.46, px+dx, y, pz+dz, l%2 ? "#b8925a" : "#c49e66");
      if(dz>0) push("fw_goods0", (()=>{ const g=new T.PlaneGeometry(0.50, 0.30), U=g.attributes.uv, u0=r()*7; for(let i=0;i<U.count;i++) U.setXY(i, u0+U.getX(i)*0.5/2.6, U.getY(i)); return g; })(), px+dx, y, pz+dz+0.241, 0, "#ffffff"); }
    addCol(px-0.62, px+0.62, pz-0.52, pz+0.52, FLS-0.5, FLS+0.14+n*0.42); }
  // the counter by the door: an L of laminate, the register, a case of lighters, the notice
  { const cx0=917.6, cx1=922.8, cz=IZ1-3.0;
    B(cx1-cx0, 0.95, 0.70, (cx0+cx1)/2, FLS+0.475, cz, "#3a3c40"); B(cx1-cx0+0.06, 0.04, 0.76, (cx0+cx1)/2, FLS+0.97, cz, "#d8d4c8");
    B(0.70, 0.95, 2.0, cx1-0.35, FLS+0.475, cz-1.35, "#3a3c40"); B(0.76, 0.04, 2.0, cx1-0.35, FLS+0.97, cz-1.38, "#d8d4c8");
    B(0.40, 0.14, 0.34, 919.4, FLS+1.06, cz, "#2a2a2c"); B(0.30, 0.22, 0.03, 919.4, FLS+1.24, cz-0.05, "#1a2a3a", 0, -0.3);
    B(0.50, 0.30, 0.34, 921.2, FLS+1.14, cz, "#c8dcd4"); for(let k=0;k<12;k++) C(0.010, 0.08, 920.98+(k%6)*0.085, FLS+1.04, cz-0.08+((k/6)|0)*0.14, ["#c42a1a","#1d3a8a","#e6a21c","#2a7a3a"][k%4], 8);
    addCol(cx0, cx1, cz-0.36, cz+0.36, FLS-0.5, FLS+1.0); addCol(cx1-0.7, cx1, cz-2.36, cz, FLS-0.5, FLS+1.0);
    sign(0.42, 0.30, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); c.strokeStyle="#c42a1a"; c.lineWidth=5; c.strokeRect(6,6,W-12,H-12);
        const L=["YOU MUST BE 21","PHOTO ID REQUIRED"], s=sizeAll(c, L, W*0.76, H*0.18, "800", "Arial");
        L.forEach((t,k)=>say(c, t, W/2, H*(0.36+k*0.30), W*0.76, s, k ? "#1a1a1a" : "#c42a1a", "800", "Arial")); }, 918.3, FLS+1.15, cz+0.262, 0, false, 300);
    B(0.44, 0.32, 0.02, 918.3, FLS+1.15, cz+0.24, "#d8d4c8");
    addUse(919.4, cz+1.0, FLS, "THE COUNTER", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("tone", 919.4, cz);
      toast(["NOBODY AT THE REGISTER. A BELL, AND A NOTE: “RING FOR SERVICE · BACK IN 5”","A STACK OF CATALOGUES. ON THE COVER A CAKE CALLED “NEIGHBOR'S ENVY”","THE TOWNSHIP'S ORDINANCE TAPED TO THE COUNTER: NO AERIALS AFTER 10 PM"][(Math.random()*3)|0], "#ffd8a0"); }, 1.0); }
  // a cart corral by the door; the safety posters
  { for(let k=0;k<4;k++){ const x=915.6+k*0.22, z=IZ1-1.0;
      B(0.52, 0.02, 0.80, x, FLS+0.55+k*0.004, z, "#c42a1a"); for(const sd of [-1,1]) B(0.02, 0.40, 0.80, x+sd*0.26, FLS+0.75, z, "#b8bab8");
      for(const dz of [-0.3, 0.3]) C(0.04, 0.03, x, FLS+0.06, z+dz, "#1a1a1a", 10, 0, 0, Math.PI/2); }
    addCol(915.2, 916.6, IZ1-1.45, IZ1-0.55, FLS-0.5, FLS+1.0); }
  for(const [x, L, bg, fg] of [[IX0+0.012, ["NO SMOKING","NO OPEN FLAME"], "#c42a1a", "#f4f2ec"], [IX0+0.012, ["LIGHT ONE","AT A TIME"], "#f2c230", "#1a1a1a"]]){
    const z=L[0]==="NO SMOKING" ? IZ0+5.0 : IZ0+9.0;
    sign(1.1, 0.7, (c,W,H)=>{ c.fillStyle=bg; c.fillRect(0,0,W,H); c.strokeStyle=fg; c.lineWidth=5; c.strokeRect(7,7,W-14,H-14);
        const s=sizeAll(c, L, W*0.76, H*0.24, "900", "Arial"); L.forEach((t,k)=>say(c, t, W/2, H*(0.34+k*0.32), W*0.76, s, fg, "900", "Arial")); }, x, FLS+1.9, z, Math.PI/2, false, 360); }
  // bunting along the front wall inside, over the windows
  for(let k=0;k<12;k++){ const x=910.8+k*1.05, y=FLS+2.85;
    ent(new T.CylinderGeometry(0.30, 0.30, 0.008, 16, 1, false, 0, Math.PI).rotateX(Math.PI/2).rotateZ(Math.PI), x, y, IZ1-0.03, ["#c42a1a","#f4f2ec","#1d3a8a"][k%3]); }
  addUse(903.8, (GZ0+GZ1)/2, FLS, "BROWSE THE SHELVES", ()=>toast(["A 500-GRAM CAKE CALLED “BACKYARD BLITZKRIEG”: 49 SHOTS, $89.99, BUY ONE GET TWO","A BOX OF SPARKLERS, THE SAME BOX AS WHEN YOU WERE SEVEN","“NIGHT HAWK”: AERIAL REPEATER. THE BACK OF THE BOX SAYS ONLY “MOVE AWAY”"][(Math.random()*3)|0], "#ffd8a0"), 2.2);
  FIREWORKS.store={x0:BX0, x1:BX1, z0:BZ0, z1:BZ1, floor:FLS, door:(DOOR.a+DOOR.b)/2};

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, metalness:0.1}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();
