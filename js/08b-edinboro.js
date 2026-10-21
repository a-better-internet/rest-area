"use strict";
/* REST AREA · 08b-edinboro.js
   exit 166: US 6N over the interstate, the ramps, the fields either side
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   8b · EDINBORO
   Two thirds of a mile north of the rest area, US 6N crosses over I-79 on
   a four-span bridge: a concrete deck on steel girders, three piers (one in
   the median, one off each outside shoulder), and a block abutment at each
   end set into the top of the cut. The crossroad is level, at the height
   of the farm country either side (EDIN, 04), and goes out east and west
   to where the fields end. For now it stops there, at barricades.
   The northbound exit leaves the right lane and climbs the side of the
   cut to merge into US 6N eastbound. Its mirror on the west side takes you
   from US 6N down onto southbound, so you can get back. The ramps are
   asphalt over the road's own surface (one polygon-offset step up, 08),
   with a white edge on the right and a yellow one on the left from the
   gore to the crossroad.
   The fields: corn, hay with round bales, soybeans, a pasture. Each is a
   textured plane laid over the level ground (the ground is exactly at
   EDIN.y under every one of them). The hedgerows between are 07's.
   ---------------------------------------------------------------------- */
const EDIN_RT={};
(function edinboro(){
  const E=EDIN, Z=E.z, Y=E.y, HW=E.hw, DW=HW+0.45;            // DW: the deck's half width, parapets and all
  /* ---- US 6N -------------------------------------------------------------- */
  // a straight run along x at z, level at Y, in pieces the bake can cull
  const runX=(bk, x0, x1, o0, o1, yOff, uv, color)=>{
    for(let a=x0; a<x1-0.01; a+=192){
      const b=Math.min(x1, a+192), P=[];
      for(let x=a; x<=b+0.01; x+=8) P.push({x:Math.min(x,b), z:Z, y:Y, s:Math.min(x,b)-x0});
      if(P[P.length-1].x<b) P.push({x:b, z:Z, y:Y, s:b-x0});
      layRibbon(bk, P, o0, o1, yOff, uv, color);
    }
  };
  // shoulders a shade lighter than the lanes, side by side
  runX("road", E.x0, E.x1, -HW, -3.6, PAVE_T, 0.40, "#9c9c9a");
  runX("road", E.x0, E.x1, 3.6, HW, PAVE_T, 0.40, "#9c9c9a");
  runX("road", E.x0, E.x1, -3.6, 3.6, PAVE_T, 0.40, "#8a8a88");
  // the double yellow, and the white edges (broken where a ramp comes in on the eastbound side)
  for(const o of [-0.13, 0.13]) runX("paint", E.x0, E.x1, o-0.05, o+0.05, PAVE_T+0.002, 1, YELLOW_LINE);
  runX("paint", E.x0, E.x1, -3.6-0.075, -3.6+0.075, PAVE_T+0.002, 1, WHITE_LINE);     // the north edge (westbound)
  { const breaks=[[-64,-4], [-266,-206]];                                              // the two ramp mouths
    let a=E.x0; for(const [b0,b1] of breaks.sort((p,q)=>q[0]-p[0]).reverse()){ runX("paint", a, b0, 3.6-0.075, 3.6+0.075, PAVE_T+0.002, 1, WHITE_LINE); a=b1; }
    runX("paint", a, E.x1, 3.6-0.075, 3.6+0.075, PAVE_T+0.002, 1, WHITE_LINE); }
  // you stand on it: on the ground either side, and on the deck over the interstate (a surface,
  // so that under the bridge you are on the interstate and not up on the deck, 06)
  addPaveRect(E.x0, E.bw0, Z-HW, Z+HW, Y);
  addPaveRect(E.bw1, E.x1, Z-HW, Z+HW, Y);
  addFlat(E.bw0-0.5, E.bw1+0.5, Z-DW, Z+DW, Y+PAVE_T);

  /* ---- the ramps ---------------------------------------------------------- */
  // (08's rampPave: each out of, or back into, the interstate's shoulder along a taper, never over its lanes)
  const RW=E.rw, onX=p=>Math.abs(p.z-Z)<HW+RW+0.2;
  const offM=rampPave(E.off, RW, NB_X1,  1, "start", 100, "#929290", onX);
  rampPave(E.on, RW, SB_X0, -1, "end", 110, "#929290", onX);
  // the exit number on a post just past the gore's nose, in the grass between the road and the ramp
  { const q=offM.nose || E.off.find(p=>p.x-RW-NB_X1>3.0), z=q.z-2.5, xin=q.x-RW;
    guideSign((NB_X1+xin)/2, z, 1.5, 1.5, 0, ["EXIT","166","↗"], {clear:1.3, posts:1, y:roadY(z)}); }

  /* ---- the bridge --------------------------------------------------------- */
  const deckT=0.30, girD=1.05, under=Y-deckT, girB=under-girD;   // under the deck; the girders' bottom
  const ab0=E.bw0+5, ab1=E.bw1-5;                                 // the abutments' faces (blocks 5 m deep)
  // the deck, the length of the bridge and over the abutment blocks, its top 5 mm under the road's skin
  bx("concrete", E.bw1-E.bw0, deckT, 2*DW, (E.bw0+E.bw1)/2, Y-0.005-deckT/2, Z, 0.4, 0, "#b8b4aa");
  // parapets: a Jersey wall each side, set a centimetre into the deck
  for(const s of [-1,1]){
    const zc=Z+s*(HW+0.215);                                     // (its outer face 2 cm in from the deck's edge)
    bx("concrete", E.bw1-E.bw0+0.04, 0.86, 0.43, (E.bw0+E.bw1)/2, Y-0.01+0.43, zc, 0.4, 0, "#c3bfb5");   // (2 cm past the deck's ends)
    addCol(E.bw0, E.bw1, zc-0.225, zc+0.225, Y-0.5, Y+0.86);
    // and W-beam guiderail off each end, tied into the parapet, on posts
    for(const [xa, xb] of [[E.bw1-0.3, E.bw1+26], [E.bw0-26, E.bw0+0.3]]){          // (its end inside the parapet's)
      const zr=Z+s*(HW+0.35);
      bx("metal", xb-xa, 0.31, 0.06, (xa+xb)/2, Y+0.62, zr, 0.5, 0, "#b9bdbe");
      for(let x=xa+1.9; x<xb-0.5; x+=1.905) bx("wood", 0.15, 0.95, 0.15, x, Y+0.40, zr+s*0.14, 0.4, 0, "#6d5c48");
      addCol(xa, xb, Math.min(zr, zr+s*0.2)-0.1, Math.max(zr, zr+s*0.2)+0.1, Y-0.5, Y+0.78);
    }
  }
  // four plate girders, weathering steel, between the abutments, set a centimetre up into the deck
  for(const dz of [-4.2, -1.4, 1.4, 4.2]){
    bx("paintm", ab1-ab0+0.6, girD+0.01, 0.46, (ab0+ab1)/2, girB+(girD+0.01)/2, Z+dz, 0.5, 0, "#6e4a33");   // ends into the blocks
  }
  // the piers: a cap beam under the girders on three round columns down to the ground
  for(const px of E.piers){
    bx("concrete", 1.3, 1.0, 2*DW+0.4, px, girB-0.5+0.005, Z, 0.4, 0, "#b3afa5");
    for(const dz of [-3.7, 0, 3.7]){
      const gy=Terrain.groundAt(px, Z+dz)-0.4, top=girB-1.0+0.01;
      cyl("concrete", 0.45, 0.45, top-gy, 16, px, (gy+top)/2, Z+dz, "#bcb8ae");
      addCol(px-0.45, px+0.45, Z+dz-0.45, Z+dz+0.45, gy, top);
    }
  }
  // the abutments: a block under each end of the deck, its face down into the cut slope
  for(const [a, b] of [[E.bw0, ab0], [ab1, E.bw1]]){
    const top=under-0.01, bot=Math.min(Terrain.groundAt((a+b)/2, Z), Terrain.groundAt(a===E.bw0?b:a, Z))-1.5;
    bx("concrete", b-a, top-bot, 2*DW+0.6, (a+b)/2, (top+bot)/2, Z, 0.4, 0, "#a9a59b");
    addCol(a, b, Z-DW-0.3, Z+DW+0.3, bot, top);
  }

  /* ---- signs ---------------------------------------------------------------
     guideSign reads one way or the other along z; along US 6N they face
     along x, so a sign is built here turned with XF: the face toward
     (sin ry, cos ry), the posts behind it. */
  const xSign=(x, z, w, h, ry, lines, opts)=>{
    opts=opts||{};
    const y0=opts.y===undefined ? Y : opts.y, clear=opts.clear||2.0, f=XF(x, z, ry), top=y0+clear+h;
    const tex=signTex(Math.round(w*80), Math.round(h*80), (c,W,H)=>{
      c.fillStyle=opts.bg||HWY_GREEN; rrect(c,0,0,W,H,Math.min(W,H)*0.06); c.fill();
      c.strokeStyle=opts.fg||"#eeece4"; c.lineWidth=Math.max(3,H*0.03);
      rrect(c,H*0.04,H*0.04,W-H*0.08,H-H*0.08,Math.min(W,H)*0.05); c.stroke();
      c.fillStyle=opts.fg||"#eeece4";
      const n=lines.length, sz=H*(n===1?0.5:0.68/n*1.25);
      // one size for every line (the smallest any of them needs), inside the border with room to spare
      c.font="600 "+sz+"px Arial"; let s=sz;
      for(const L of lines){ const wd=c.measureText(L).width; if(wd>W*0.80) s=Math.min(s, sz*W*0.80/wd); }
      lines.forEach((L,i)=>fitHwy(c, L, W*0.80, s, W/2, H*(n===1?0.5:(0.28+0.44*i/(n-1)))));
    });
    const posts=w>2.4 ? 2 : 1;
    for(let k=0;k<posts;k++){
      const lx=posts===1 ? 0 : (k?1:-1)*w*0.32;
      bx("metal", 0.12, top-y0-0.03, 0.12, f.x(lx,-0.115), (y0+top-0.03)/2, f.z(lx,-0.115), 0.6, ry, "#a3a8aa");
      bx("concrete", 0.36, 0.20, 0.36, f.x(lx,-0.06), y0+0.06, f.z(lx,-0.06), 0.4, ry, "#9a978f");
      addCol(f.x(lx,-0.115)-0.1, f.x(lx,-0.115)+0.1, f.z(lx,-0.115)-0.1, f.z(lx,-0.115)+0.1, y0-1, top);
    }
    bx("metal", w, h, 0.05, f.x(0,-0.03), y0+clear+h/2, f.z(0,-0.03), 0.4, ry, "#8d9294");
    signPanel(w, h, tex, f.x(0,0.002), y0+clear+h/2, f.z(0,0.002), ry);
  };
  const EAST=-Math.PI/2, WEST=Math.PI/2;                    // read by traffic heading east (+x), west (-x)
  // northbound I-79: the advance sign, a quarter mile out
  guideSign(NB_X1+5.0, -600, 6.0, 3.2, 0, ["EXIT 166","US 6N  Edinboro","NEXT RIGHT"]);
  // on US 6N eastbound, past the merge: how far
  xSign(32, Z+HW+3.2, 4.4, 2.0, EAST, ["Edinboro   3","Union City   14"]);
  xSign(-292, Z+HW+3.2, 3.6, 2.0, EAST, ["I-79 SOUTH","Pittsburgh"], {clear:1.8});     // coming from the west: the on-ramp is just ahead on the right
  // westbound: the way back south is over the bridge and left
  xSign(70, Z-HW-3.2, 4.0, 2.0, WEST, ["I-79 SOUTH","OVER BRIDGE · LEFT"], {clear:1.8});
  xSign(-196, Z-HW-3.2, 3.2, 1.9, WEST, ["I-79 SOUTH","↖"], {clear:1.8});
  // the route itself, both ways, black on white
  xSign(-2, Z+HW+2.6, 1.1, 1.3, EAST, ["EAST","US 6N"], {bg:"#ecebe4", fg:"#1a1a1a", clear:1.5});
  xSign(-300, Z-HW-2.6, 1.1, 1.3, WEST, ["WEST","US 6N"], {bg:"#ecebe4", fg:"#1a1a1a", clear:1.5});
  // a yellow MERGE diamond where the ramp comes in
  { const mz=E.off.find(p=>Math.abs(p.z-Z)<HW+RW+6);
    // a square blank turned on its corner: the face drawn square with its lettering turned back level
    const tex=signTex(240,240,(c,W,H)=>{ c.fillStyle="#f2c230"; c.fillRect(0,0,W,H);
      c.strokeStyle="#1a1a1a"; c.lineWidth=7; rrect(c,12,12,W-24,H-24,10); c.stroke();
      c.save(); c.translate(W/2,H/2); c.rotate(-Math.PI/4); c.fillStyle="#1a1a1a"; fitHwy(c,"MERGE",W*0.62,H*0.17,0,0); c.restore(); });
    const x=mz.x+1.0, z=mz.z+RW+2.2, f=XF(x,z,EAST);
    bx("metal", 0.07, 2.6, 0.07, f.x(0,-0.06), Y+1.3, f.z(0,-0.06), 0.5, EAST, "#a3a8aa");
    push("metal", boxGeo(0.64, 0.64, 0.03, 0), f.x(0,-0.018), Y+2.15, f.z(0,-0.018), EAST, "#8d9294", 0, Math.PI/4);
    const ms=signPanel(0.62, 0.62, tex, f.x(0,0.002), Y+2.15, f.z(0,0.002), EAST); ms.rotation.z=Math.PI/4;
    addCol(f.x(0,-0.06)-0.06, f.x(0,-0.06)+0.06, f.z(0,-0.06)-0.06, f.z(0,-0.06)+0.06, Y-1, Y+2.6); }
  // the ends of the road, for now: a type III barricade across, ROAD CLOSED
  { const tex=signTex(360,120,(c,W,H)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,H); c.strokeStyle="#1a1a1a"; c.lineWidth=5; c.strokeRect(6,6,W-12,H-12);
      c.fillStyle="#1a1a1a"; fitHwy(c,"ROAD CLOSED",W*0.80,H*0.48,W/2,H/2); });
    const rails=signTex(256,32,(c,W,H)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,H); c.fillStyle="#e2581b";
      for(let x=-H;x<W+H;x+=40){ c.beginPath(); c.moveTo(x,H); c.lineTo(x+20,H); c.lineTo(x+20+H,0); c.lineTo(x+H,0); c.closePath(); c.fill(); } });
    for(const [x, ry] of [[E.x1-6, EAST], [E.x0+6, WEST]]){
      const f=XF(x, Z, ry);
      for(const lx of [-4.6, 4.6]) bx("metal", 0.10, 1.6, 0.10, f.x(lx,-0.06), Y+0.80, f.z(lx,-0.06), 0.5, ry, "#a3a8aa");
      for(const h of [0.55, 0.95, 1.35]){ const m=signPanel(9.6, 0.20, rails, f.x(0,0.002), Y+h, f.z(0,0.002), ry);
        m.material.map.wrapS=T.RepeatWrapping; m.material.map.repeat.set(4,1);
        bx("wood", 9.6, 0.20, 0.03, f.x(0,-0.017), Y+h, f.z(0,-0.017), 0.4, ry, "#d8d4c8"); }
      signPanel(1.5, 0.5, tex, f.x(0,0.03), Y+1.85, f.z(0,0.03), ry);
      bx("wood", 1.5, 0.5, 0.03, f.x(0,0.012), Y+1.85, f.z(0,0.012), 0.4, ry, "#d8d4c8");
      bx("metal", 0.06, 0.62, 0.06, f.x(0,-0.02), Y+1.52, f.z(0,-0.02), 0.5, ry, "#a3a8aa");
    }
  }

  /* ---- the fields ----------------------------------------------------------
     A plane over each, three centimetres up and one polygon-offset step over
     the ground; a texture per crop, tiled every few metres. */
  const cropTex=(kind)=>{
    const S=256, c=cvs(S,S), x=c.getContext("2d"), r=_trng(kind.length*97+13);
    const base={corn:"#4c6a25", soy:"#3d5c24", hay:"#868b45", pasture:"#5c7634"}[kind];
    x.fillStyle=base; x.fillRect(0,0,S,S);
    if(kind==="corn" || kind==="soy"){
      // rows: thirty inches apart for corn, fifteen for beans, the dirt between showing
      const n=kind==="corn" ? 8 : 14;
      for(let i=0;i<n;i++){ const y=i*S/n;
        x.fillStyle=kind==="corn" ? "#6b5a3e" : "#5e5038"; x.globalAlpha=0.55; x.fillRect(0, y, S, S/n*0.38); x.globalAlpha=1;
        for(let k=0;k<160;k++){ x.fillStyle=r()<0.5 ? "#75993a" : "#4f7027"; x.globalAlpha=0.6;
          x.beginPath(); x.arc(r()*S, y+S/n*(0.55+r()*0.4), 1.5+r()*3.5, 0, 7); x.fill(); } }
      x.globalAlpha=1;
    }else if(kind==="hay"){
      // cut and raked: windrows, darker, across the lighter stubble
      for(let i=0;i<4;i++){ const y=i*S/4+S/8;
        x.fillStyle="#666c33"; x.globalAlpha=0.8; x.fillRect(0, y-9, S, 18);
        for(let k=0;k<120;k++){ x.fillStyle=r()<0.5?"#787c3c":"#5a612c"; x.globalAlpha=0.5; x.fillRect(r()*S, y-10+r()*20, 6+r()*10, 2); } }
      for(let k=0;k<900;k++){ x.fillStyle=r()<0.5?"#9a9a52":"#76803c"; x.globalAlpha=0.35; x.fillRect(r()*S, r()*S, 1, 3+r()*4); }
    }else{
      for(let k=0;k<1400;k++){ x.fillStyle=["#7c9a47","#5d7a33","#8f9a52","#6d7d3a"][(r()*4)|0]; x.globalAlpha=0.4;
        x.beginPath(); x.arc(r()*S, r()*S, 1+r()*4, 0, 7); x.fill(); }
    }
    x.globalAlpha=1;
    const t=_tex(c); t.anisotropy=MAXANISO; return t;
  };
  const TILE={corn:6.1, soy:4.6, hay:22, pasture:9};
  for(const kind of ["corn","soy","hay","pasture"]){
    const tex=cropTex(kind);
    bucketOf("field_"+kind, ()=>new T.MeshStandardMaterial(Object.assign({map:tex, roughness:1.0}, _po(-2))));
  }
  for(const F of E.fields){
    const w=F.x1-F.x0, d=F.z1-F.z0, g=new T.PlaneGeometry(w, d), a=g.attributes.uv, t=TILE[F.crop];
    // rows run east-west on the north side of the road and north-south on the south
    const turn=F.z0>Z;
    for(let i=0;i<a.count;i++){ const u=a.getX(i)*w/t, v=a.getY(i)*d/t; a.setXY(i, turn?v:u, turn?u:v); }
    push("field_"+F.crop, g, (F.x0+F.x1)/2, Y+0.03, (F.z0+F.z1)/2, 0, "#ffffff", -Math.PI/2, 0);
  }
  // round bales left in the hay, in the lines the baler dropped them
  { const tex=signTex(128,128,(c,W,H)=>{ c.fillStyle="#b29a5a"; c.fillRect(0,0,W,H);
      c.strokeStyle="#8a7442"; c.lineWidth=3; for(let r=4;r<62;r+=5){ c.beginPath(); c.arc(W/2,H/2,r,0,7); c.stroke(); } });
    bucketOf("baleend", ()=>new T.MeshStandardMaterial({map:tex, roughness:0.95}));
    for(const F of E.fields.filter(f=>f.crop==="hay")){
      let n=0;
      for(let i=0;i<40 && n<14;i++){
        const h=hash2(F.x0+i*3.1, F.z0), x=F.x0+12+h*(F.x1-F.x0-24), z=F.z0+14+hash2(i*1.7,F.x1)*(F.z1-F.z0-28), ry=h*6.28;
        const c=Math.cos(ry), s=Math.sin(ry), R=0.78, L=1.25;
        cyl("wood", R, R, L, 18, x, Y+R, z, "#b9a463", 0, ry, Math.PI/2);
        for(const e of [-1,1]) push("baleend", new T.CircleGeometry(R-0.004, 18), x+c*e*(L/2+0.002), Y+R, z-s*e*(L/2+0.002), ry+e*Math.PI/2, "#ffffff");
        const hx=Math.abs(c)*L/2+Math.abs(s)*R, hz=Math.abs(s)*L/2+Math.abs(c)*R;
        addCol(x-hx, x+hx, z-hz, z+hz, Y-0.2, Y+2*R); n++;
      }
    }
  }
  // a farm fence along the road's right of way, posts and three strands, in front of each field
  for(const F of E.fields){
    const zf=F.z0>Z ? F.z0-3 : F.z1+3;
    for(let x=F.x0; x<=F.x1+0.01; x+=4.0) bx("wood", 0.12, 1.25, 0.12, x, Y+0.55, zf, 0.4, 0, "#6d5c48");
    for(const h of [0.45, 0.80, 1.10]) bx("metal", F.x1-F.x0, 0.012, 0.012, (F.x0+F.x1)/2, Y+h, zf, 1, 0, "#8a8d8e");
    addCol(F.x0, F.x1, zf-0.08, zf+0.08, Y-0.5, Y+1.2);
  }
  EDIN_RT.ready=true;
})();
