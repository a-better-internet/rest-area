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
   A full diamond, a ramp in each corner. The northbound exit leaves the
   right lane and climbs the side of the cut to merge into US 6N eastbound;
   its mirror on the west side takes you from US 6N down onto southbound.
   North of the road the other pair: on to northbound from US 6N between
   the bridge and the fuel stop, and off southbound up into US 6N westbound,
   so you can go back the way you came either way. The ramps are
   asphalt over the road's own surface (one polygon-offset step up, 08),
   with a white edge on the right and a yellow one on the left from the
   gore to the crossroad.
   The fields: corn, hay with round bales, soybeans, a pasture. Each is a
   textured plane laid over the level ground (the ground is exactly at
   EDIN.y under every one of them). The hedgerows between are 07's.
   ---------------------------------------------------------------------- */
const EDIN_RT={};
// the west farms' crops, a mesh a 64 m tile; a tile further off than its kind's `far` is not drawn (from 19's frame)
const CROP_TILES=[];
function updateCrops(p){ const k=p.y-Terrain.heightAt(p.x, p.z)>40 ? 1.5 : 1;        // (further from the air)
  for(const t of CROP_TILES) t.m.visible=Math.hypot(t.x-p.x, t.z-p.z)-t.r<t.far*k; }
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
  // (the white edges are laid below, once the ramps have said where they meet them)
  // you stand on it: on the ground either side, and on the deck over the interstate (a surface,
  // so that under the bridge you are on the interstate and not up on the deck, 06)
  addPaveRect(E.x0, E.bw0, Z-HW, Z+HW, Y);
  addPaveRect(E.bw1, E.x1, Z-HW, Z+HW, Y);
  addFlat(E.bw0-0.5, E.bw1+0.5, Z-DW, Z+DW, Y+PAVE_T);

  /* ---- the ramps ---------------------------------------------------------- */
  // (08's rampPave: each out of, or back into, the interstate's shoulder along a taper, never over its lanes)
  // (each ramp joins US 6N along it, a slip road: paved to its edge line, its lines run on to meet that line, and
  //  where they meet it is kept, mouth.meet, 08's rampPave)
  const RW=E.rw, MOUTHS=[], onX=()=>{ const f=p=>Math.abs(p.z-Z)<HW+RW+0.2; f.mouth={z:Z, e:3.6, hw:HW, meet:[]}; MOUTHS.push(f.mouth); return f; };
  const offM=rampPave(E.off, RW, NB_X1,  1, "start", 0, "#9a9a98", onX());       // (the rest area's entrance lane runs on into it)
  rampPave(E.on, RW, SB_X0, -1, "end", 110, "#929290", onX());
  rampPave(E.onN, RW, NB_X1, 1, "end", 110, "#929290", onX());
  const offSM=rampPave(E.offS, RW, SB_X0, -1, "start", 100, "#929290", onX());
  // the white edges: solid the length of the road, and dotted across each mouth, from where the ramp's one line
  // meets the edge to where its other does (the dots stop short of the far one, which comes in along the edge)
  for(const o of [3.6, -3.6]){ const sd=o>0 ? -1 : 1, br=[];             // (o > 0 is the north side, z under Z)
    for(const m of MOUTHS){ if(m.meet.length<2 || m.side!==sd) continue;
      const lo=Math.min(...m.meet), hi=Math.max(...m.meet), far=m.tail===undefined ? 0 : m.tail<=lo+0.01 ? -1 : 1;
      // (the dots run from the gore to where the other line has come within a metre of the edge, not beside it)
      const nr=m.near===undefined ? (far<0 ? lo+8 : hi-8) : far<0 ? Math.max(lo+1, m.near) : Math.min(hi-1, m.near);
      br.push([lo, hi, far, nr]); }
    br.sort((a,b)=>a[0]-b[0]);
    let a=E.x0;
    for(const [b0,b1,far,nr] of br){ runX("paint", a, b0, o-0.075, o+0.075, PAVE_T+0.002, 1, WHITE_LINE);
      const d0=far<0 ? nr : b0+1.0, d1=far<0 ? b1-1.0 : nr;                     // (no dots where the eased line comes in)
      for(let x=d0; x+1.2<=d1; x+=3.6) runX("paint", x, x+1.2, o-0.075, o+0.075, PAVE_T+0.002, 1, WHITE_LINE);
      a=b1; }
    runX("paint", a, E.x1, o-0.075, o+0.075, PAVE_T+0.002, 1, WHITE_LINE); }
  // the exit number on a post just past each gore's nose, in the grass between the road and the ramp
  { const q=offM.nose || E.off.find(p=>p.x-RW-NB_X1>3.0), z=q.z-2.5, xin=q.x-RW;
    guideSign((NB_X1+xin)/2, z, 1.5, 1.5, 0, ["EXIT","166","↗"], {clear:1.3, posts:1, y:roadY(z)}); }
  { const q=offSM.nose || E.offS.find(p=>SB_X0-(p.x+RW)>3.0), z=q.z+2.5, xin=q.x+RW;
    guideSign((SB_X0+xin)/2, z, 1.5, 1.5, Math.PI, ["EXIT","166","↗"], {clear:1.3, posts:1, y:roadY(z)}); }

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
    // and W-beam guiderail off each end, tied into the parapet, on posts; on the north side only as far as the
    // ramps' mouths, which leave the road there
    const run=s>0 ? 26 : 9;
    for(const [xa, xb] of [[E.bw1-0.3, E.bw1+run], [E.bw0-run, E.bw0+0.3]]){          // (its end inside the parapet's)
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
      hwyLegend(c, W, H, lines, opts);
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
  // westbound: north is the right turn this side of the bridge, south over the bridge and left
  xSign(40, Z-HW-3.2, 3.2, 1.9, WEST, ["I-79 NORTH","Erie  ↗"], {clear:1.8});
  xSign(70, Z-HW-3.2, 4.0, 2.0, WEST, ["I-79 SOUTH","OVER BRIDGE · LEFT"], {clear:1.8});
  xSign(-196, Z-HW-3.2, 3.2, 1.9, WEST, ["I-79 SOUTH","↖"], {clear:1.8});
  // eastbound, off the bridge's west end: north is the left turn on the far side
  xSign(-200, Z+HW+3.2, 3.6, 2.0, EAST, ["I-79 NORTH","OVER BRIDGE · LEFT"], {clear:1.8});
  // southbound I-79: the advance sign, before the taper
  guideSign(SB_X0-5.0, Z-565, 6.0, 3.2, Math.PI, ["EXIT 166","US 6N  Edinboro","NEXT RIGHT"]);
  // the route itself, both ways, black on white
  xSign(-2, Z+HW+2.6, 1.1, 1.3, EAST, ["EAST","US 6N"], {bg:"#ecebe4", fg:"#1a1a1a", clear:1.5});
  xSign(-300, Z-HW-2.6, 1.1, 1.3, WEST, ["WEST","US 6N"], {bg:"#ecebe4", fg:"#1a1a1a", clear:1.5});
  // a yellow MERGE diamond where each exit ramp comes in, on its outside: eastbound south of the road, westbound north
  { // a square blank turned on its corner: the face drawn square with its lettering turned back level
    const tex=signTex(240,240,(c,W,H)=>{ c.fillStyle="#f2c230"; c.fillRect(0,0,W,H);
      c.strokeStyle="#1a1a1a"; c.lineWidth=7; rrect(c,12,12,W-24,H-24,10); c.stroke();
      c.save(); c.translate(W/2,H/2); c.rotate(-Math.PI/4); c.fillStyle="#1a1a1a"; fitHwy(c,"MERGE",W*0.62,H*0.17,0,0); c.restore(); });
    for(const [P, k, ry] of [[E.off, 1, EAST], [E.offS, -1, WEST]]){
      const mz=P.find(p=>Math.abs(p.z-Z)<HW+RW+6);
      const x=mz.x+k*1.0, z=mz.z+k*(RW+2.2), f=XF(x,z,ry);
      bx("metal", 0.07, 2.6, 0.07, f.x(0,-0.06), Y+1.3, f.z(0,-0.06), 0.5, ry, "#a3a8aa");
      push("metal", boxGeo(0.64, 0.64, 0.03, 0), f.x(0,-0.018), Y+2.15, f.z(0,-0.018), ry, "#8d9294", 0, Math.PI/4);
      const ms=signPanel(0.62, 0.62, tex, f.x(0,0.002), Y+2.15, f.z(0,0.002), ry); ms.rotation.z=Math.PI/4;
      addCol(f.x(0,-0.06)-0.06, f.x(0,-0.06)+0.06, f.z(0,-0.06)-0.06, f.z(0,-0.06)+0.06, Y-1, Y+2.6); } }
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
        bx("wood", 9.6, 0.20, 0.03, f.x(0,-0.024), Y+h, f.z(0,-0.024), 0.4, ry, "#d8d4c8"); }       // (back far enough that the bake's growth keeps it behind the stripes)
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
    const base={corn:"#4c6a25", soy:"#3d5c24", hay:"#7c8244", pasture:"#4a6234",
                grape:"#55683a", pumpkin:"#3f5726", sunflower:"#4a5e28", xmas:"#5a6c3a"}[kind];
    x.fillStyle=base; x.fillRect(0,0,S,S);
    if(kind==="pumpkin"){
      // the vines sprawled every way over dark soil, big leaves, the odd yellow flower and a few small pumpkins in the leaves
      x.fillStyle="#4e3e2a"; x.globalAlpha=0.35; for(let k=0;k<60;k++) x.fillRect(r()*S, r()*S, 10+r()*30, 4+r()*10); x.globalAlpha=1;
      for(let k=0;k<420;k++){ x.fillStyle=["#3e6a2a","#2e5420","#567a32","#4a6a2a"][(r()*4)|0]; x.globalAlpha=0.7; x.beginPath(); x.ellipse(r()*S, r()*S, 4+r()*7, 3+r()*5, r()*3, 0, 7); x.fill(); }
      for(let k=0;k<40;k++){ x.fillStyle="#e8c030"; x.globalAlpha=0.8; x.beginPath(); x.arc(r()*S, r()*S, 1.5+r()*1.5, 0, 7); x.fill(); }
      for(let k=0;k<14;k++){ x.fillStyle=r()<0.7 ? "#d8701a" : "#c8501a"; x.globalAlpha=0.9; x.beginPath(); x.ellipse(r()*S, r()*S, 3+r()*3, 2.5+r()*2, 0, 0, 7); x.fill(); }
    }else if(kind==="sunflower"){
      // seen from above: a sea of heads, gold petals round brown middles, leaves between
      for(let k=0;k<500;k++){ x.fillStyle=r()<0.5 ? "#3e5a22" : "#56742c"; x.globalAlpha=0.6; x.beginPath(); x.ellipse(r()*S, r()*S, 3+r()*4, 2+r()*3, r()*3, 0, 7); x.fill(); }
      for(let k=0;k<180;k++){ const px=r()*S, py=r()*S, rr=3+r()*2.5; x.globalAlpha=0.95; x.fillStyle=r()<0.8 ? "#f2c41c" : "#e8a812"; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill();
        x.fillStyle="#5a3a1a"; x.beginPath(); x.arc(px, py, rr*0.45, 0, 7); x.fill(); }
    }else if(kind==="grape" || kind==="xmas"){
      // mown grass between the rows (the rows themselves stand up out of it)
      for(let k=0;k<2600;k++){ x.strokeStyle=["#5f763c","#4a6134","#6c7644","#566634"][(r()*4)|0]; x.globalAlpha=0.4; x.lineWidth=1;
        const px=r()*S, py=r()*S; x.beginPath(); x.moveTo(px,py); x.lineTo(px+(r()-0.5)*3, py-2-r()*4); x.stroke(); }
      if(kind==="grape"){ x.fillStyle="#6a5a3e"; x.globalAlpha=0.35; for(let i=0;i<4;i++) x.fillRect(0, i*S/4, S, 6); }
    }else if(kind==="corn" || kind==="soy"){
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
      // grazed grass: short blades every way, clover, the odd thistle, no blobs to repeat
      for(let k=0;k<5200;k++){ const px=r()*S, py=r()*S, L=2+r()*5, a=-1.57+(r()-0.5)*1.6;
        x.strokeStyle=["#5f763c","#4a6134","#6c7644","#566634","#42582c"][(r()*5)|0]; x.globalAlpha=0.45; x.lineWidth=1;
        x.beginPath(); x.moveTo(px,py); x.lineTo(px+Math.cos(a)*L, py+Math.sin(a)*L); x.stroke(); }
      for(let k=0;k<90;k++){ x.fillStyle=r()<0.8?"#76845a":"#9a8aa8"; x.globalAlpha=0.35; x.beginPath(); x.arc(r()*S, r()*S, 1+r()*1.5, 0, 7); x.fill(); }
    }
    x.globalAlpha=1;
    const t=_tex(c); t.anisotropy=MAXANISO; return t;
  };
  const TILE={corn:6.1, soy:4.6, hay:22, pasture:9, grape:10.4, pumpkin:7, sunflower:5.2, xmas:9};
  /* Each crop's green is held down (in full sun the raw ones read lime) and pulled a little toward its own: the
     corn a deep blue-green, the beans darker, the hay gone to gold and olive, the pasture grazed dull. And across a
     field the crop is never one even colour: broad soft patches where it is doing better or worse, a wetter
     corner, the headlands trodden, go over it in the world's own terms (no repeat to see from the bridge). */
  const FIELD_TINT={corn:0x9ca394, soy:0x989f92, hay:0xb9a888, pasture:0xa0a290, grape:0xa0a492, pumpkin:0xa4a294, sunflower:0xb4ac94, xmas:0x9ea290};
  for(const kind of ["corn","soy","hay","pasture","grape","pumpkin","sunflower","xmas"]){
    const tex=cropTex(kind);
    bucketOf("field_"+kind, ()=>{ const m=new T.MeshStandardMaterial(Object.assign({map:tex, roughness:1.0, color:FIELD_TINT[kind]}, _po(-2)));
      m.onBeforeCompile=(sh)=>{
        sh.vertexShader=sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vFieldW;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFieldW=(modelMatrix*vec4(transformed, 1.0)).xyz;");
        sh.fragmentShader=sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vFieldW;")
          .replace("#include <map_fragment>", `#include <map_fragment>
  { vec2 p=vFieldW.xz;
    float n=0.50*sin(p.x*0.031+1.3)*sin(p.y*0.027+0.4)+0.30*sin(p.x*0.083-p.y*0.061+2.1)+0.20*sin(p.x*0.013+p.y*0.019+0.7);
    diffuseColor.rgb*=0.93+0.11*n;
    diffuseColor.rgb=mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.30, 0.55, 0.15)))*vec3(1.04, 1.0, 0.92), 0.12+0.10*max(-n, 0.0)); }`);
      };
      m.customProgramCacheKey=()=>"field-"+kind; return m; });
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
  /* ---- the corn and the beans, standing ----
     East of the interchange the fields were paint on the ground: corn you looked across the top of from the road.
     Corn in August is over your head. So each corn field is what it looks like from outside one: the outer ten rows
     real rows, a card to each the length of the field with stalks, leaves, ears and tassels cut out of it (and the
     last eight metres of every row along the two ends where the rows come out at you); behind them a wall of the
     same, close-set and dark, where the eye gives up; and over the middle of the field a lid of leaf and tassel at
     the height of the crop, which is all a corn field is from the bridge or the air. The middle is solid: nobody
     walks through standing corn past the first rows. The cards take one normal, up and a little out, on both
     faces, so a row is lit as a mass of leaf and not as a board.
     The beans are knee high: a lid of leaf over the whole field at that height, and a ragged skirt of it round the
     edge. You wade through them; so does a car. */
  { const H=2.3, SP=0.76, NB=10, ENDS=8.0;
    const rowTex=signTex(512, 256, (c, W, Hh)=>{ const q=_trng(9191); c.clearRect(0, 0, W, Hh);
      // eleven plants along 2.4 m, seen side on: the stalk, a leaf every hand's breadth arching out and down each way,
      // an ear at the waist, the tassel; the bottom leaves gone dry
      // (a leaf goes up and out from the stalk, arches over and hangs: long and narrow, to a point)
      const leaf=(x0, y0, dir, L, w, col)=>{ const x1=x0+dir*L*0.45, y1=y0-L*0.50, x2=x0+dir*L, y2=y0+L*0.22;
        c.fillStyle=col; c.beginPath(); c.moveTo(x0, y0+w*0.5); c.quadraticCurveTo(x1, y1+w*0.9, x2, y2); c.quadraticCurveTo(x1, y1-w*0.5, x0, y0-w*0.5); c.fill(); };
      for(let pass=0;pass<2;pass++) for(let k=0;k<11;k++){ const x=(k+0.5)*W/11+(q()-0.5)*14, top=Hh*(0.10+q()*0.07), dk=pass ? 1 : 0.72;
        const G=(l)=>"rgb("+((50+l*44)*dk|0)+","+((82+l*52)*dk|0)+","+((30+l*22)*dk|0)+")";
        c.strokeStyle=G(0.5); c.lineWidth=5; c.beginPath(); c.moveTo(x, Hh); c.lineTo(x+(q()-0.5)*5, top+10); c.stroke();
        for(let y=Hh-10; y>top+30; y-=15+q()*9){ const t=(Hh-y)/Hh, dry=t<0.20 && q()<0.6, dir=q()<0.5 ? -1 : 1;
          leaf(x, y+(q()-0.5)*6, dir, (62+q()*52)*(1-t*0.35), 9+q()*4, dry ? "rgb("+((128+q()*26)*dk|0)+","+((112+q()*20)*dk|0)+","+((62+q()*14)*dk|0)+")" : G(q()));
          if(q()<0.55) leaf(x, y-6+(q()-0.5)*6, -dir, (54+q()*46)*(1-t*0.35), 8+q()*4, G(q())); }
        if(q()<0.75){ const ey=Hh*(0.50+q()*0.12), dir=q()<0.5 ? -1 : 1;                      // the ear, in its husk, silk at the tip
          c.fillStyle="rgb("+((112*dk)|0)+","+((132*dk)|0)+","+((62*dk)|0)+")"; c.beginPath(); c.ellipse(x+dir*7, ey, 6, 17, dir*0.35, 0, 7); c.fill();
          c.strokeStyle="rgb("+((112*dk)|0)+","+((72*dk)|0)+","+((36*dk)|0)+")"; c.lineWidth=2; c.beginPath(); c.moveTo(x+dir*10, ey-15); c.lineTo(x+dir*15, ey-24); c.stroke(); }
        c.strokeStyle="rgb("+((188*dk)|0)+","+((166*dk)|0)+","+((98*dk)|0)+")"; c.lineWidth=2.5;                 // the tassel
        for(let i=0;i<7;i++){ c.beginPath(); c.moveTo(x, top+16); c.lineTo(x+(i-3)*5+(q()-0.5)*4, top-2+Math.abs(i-3)*3); c.stroke(); } } });
    rowTex.wrapS=T.RepeatWrapping; rowTex.anisotropy=MAXANISO;
    const massTex=signTex(256, 256, (c, W, Hh)=>{ const q=_trng(9292);
      const g=c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, "#40582a"); g.addColorStop(0.5, "#2c3f1e"); g.addColorStop(1, "#3a3622"); c.fillStyle=g; c.fillRect(0, 0, W, Hh);
      for(let k=0;k<900;k++){ const y=q()*Hh, t=y/Hh; c.strokeStyle=t>0.8 && q()<0.5 ? "rgba(150,130,74,0.5)" : "rgba("+(52+q()*50|0)+","+(84+q()*56|0)+","+(30+q()*24|0)+",0.6)"; c.lineWidth=2+q()*4;
        const x=q()*W, L=10+q()*22, d=q()<0.5 ? -1 : 1; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x+d*L*0.5, y-L*0.4, x+d*L, y+L*0.15); c.stroke(); }
      for(let k=0;k<26;k++){ c.strokeStyle="rgba(170,152,90,0.7)"; c.lineWidth=2; const x=q()*W; c.beginPath(); c.moveTo(x, 4+q()*8); c.lineTo(x+(q()-0.5)*10, 20+q()*8); c.stroke(); } });
    massTex.wrapS=T.RepeatWrapping; massTex.anisotropy=MAXANISO;
    const topTex=(kind)=>{ const t=signTex(256, 256, (c, W, Hh)=>{ const q=_trng(kind==="corn" ? 9393 : 9494), corn=kind==="corn", n=corn ? 8 : 12;
      c.fillStyle=corn ? "#3e5a26" : "#365426"; c.fillRect(0, 0, W, Hh);
      for(let i=0;i<n;i++){ const y=(i+0.5)*Hh/n;
        c.fillStyle="rgba(24,34,14,0.55)"; c.fillRect(0, y+Hh/n*0.30, W, Hh/n*0.22);                         // the shade between two rows
        for(let k=0;k<(corn ? 90 : 120);k++){ const px=q()*W, py=y+(q()-0.5)*Hh/n*0.8, l=q();
          c.fillStyle="rgb("+(70+l*58|0)+","+(104+l*62|0)+","+(38+l*28|0)+")"; c.globalAlpha=0.85;
          if(corn){ c.save(); c.translate(px, py); c.rotate(q()*6.28); c.beginPath(); c.ellipse(0, 0, 9+q()*7, 2.2+q()*1.6, 0, 0, 7); c.fill(); c.restore(); }
          else { c.beginPath(); c.arc(px, py, 2.5+q()*3, 0, 7); c.fill(); } }
        c.globalAlpha=1;
        if(corn) for(let k=0;k<26;k++){ c.fillStyle=q()<0.5 ? "#c8b06a" : "#b89a56"; c.fillRect(q()*W, y+(q()-0.5)*8, 3+q()*3, 2); } } });   // tassels, down each row
      t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=MAXANISO; return t; };
    // (their colour held down as the fields' own is, FIELD_TINT: in full sun raw leaf green reads lime)
    const leafy=(tex, tint)=>{ const m=new T.MeshStandardMaterial({map:tex, alphaTest:0.45, side:T.DoubleSide, roughness:0.95, color:tint});
      // (one normal on both faces, as the woods' crowns have, 07)
      m.onBeforeCompile=(sh)=>{ sh.fragmentShader=sh.fragmentShader.replace("#include <normal_fragment_begin>",
        T.ShaderChunk.normal_fragment_begin.replace("normal = normal * faceDirection;", "")); };
      m.customProgramCacheKey=()=>"crop-card"; return m; };
    const skirtTex=signTex(256, 64, (c, W, Hh)=>{ const q=_trng(9595); c.clearRect(0, 0, W, Hh);
      for(let k=0;k<520;k++){ const px=q()*W, py=Hh*(0.12+Math.pow(q(), 0.6)*0.88), l=q();
        c.fillStyle="rgb("+(54+l*56|0)+","+(88+l*60|0)+","+(32+l*26|0)+")"; c.beginPath(); c.ellipse(px, py, 4+q()*5, 3+q()*3.5, q()*3, 0, 7); c.fill(); }
      c.fillStyle="#2e4a20"; c.fillRect(0, Hh*0.55, W, Hh*0.45); for(let k=0;k<160;k++){ const l=q(); c.fillStyle="rgb("+(50+l*50|0)+","+(84+l*56|0)+","+(30+l*24|0)+")"; c.beginPath(); c.ellipse(q()*W, Hh*(0.5+q()*0.5), 4+q()*4, 3+q()*3, q()*3, 0, 7); c.fill(); } });
    skirtTex.wrapS=T.RepeatWrapping; skirtTex.anisotropy=MAXANISO;
    bucketOf("corn_row", ()=>leafy(rowTex, 0xa2a898)); bucketOf("soy_skirt", ()=>leafy(skirtTex, 0x8e9588));
    bucketOf("corn_mass", ()=>new T.MeshStandardMaterial({map:massTex, roughness:1.0}));
    const cornTop=topTex("corn"), soyTop=topTex("soy");
    bucketOf("corn_top", ()=>new T.MeshStandardMaterial({map:cornTop, roughness:1.0, color:0x888e7e}));        // (a shade under the fields' own tint: it is seen beside its rows' shaded sides)
    bucketOf("soy_top", ()=>new T.MeshStandardMaterial({map:soyTop, roughness:1.0, color:FIELD_TINT.soy}));
    // a standing card L long and h high, its face across `ax` ("x": it runs along z), lit from above and from the side it faces
    const card=(bk, ax, a, b0, b1, y0, h, rep, uo, out, col)=>{ const L=b1-b0, g=new T.PlaneGeometry(L, h), uv=g.attributes.uv, nr=g.attributes.normal;
      for(let i=0;i<uv.count;i++) uv.setX(i, uv.getX(i)*L/rep+uo);
      for(let i=0;i<nr.count;i++) nr.setXYZ(i, 0, 0.86, 0.5*out);                         // (in the plane's own frame: +z is its face)
      if(ax==="x") push(bk, g, a, y0+h/2, (b0+b1)/2, Math.PI/2, col||"#ffffff"); else push(bk, g, (b0+b1)/2, y0+h/2, a, 0, col||"#ffffff"); };
    // a level sheet at y over a rectangle, its rows laid the way the field's are
    const lid=(bk, x0, x1, z0, z1, y, tile, turn)=>{ const w=x1-x0, d=z1-z0, g=new T.PlaneGeometry(w, d), a=g.attributes.uv;
      for(let i=0;i<a.count;i++){ const u=a.getX(i)*w/tile+x0/tile, v=a.getY(i)*d/tile-z0/tile; a.setXY(i, turn ? v : u, turn ? u : v); }
      push(bk, g, (x0+x1)/2, y, (z0+z1)/2, 0, "#ffffff", -Math.PI/2, 0); };
    for(const F of E.fields.filter(f=>f.crop==="corn")){
      const turn=F.z0>Z, G=0.55;                             // (rows north-south south of the road, east-west north of it; G: the headland left bare round the field)
      // in the field's own terms: `a` across the rows, `b` along them
      const a0=(turn ? F.x0 : F.z0)+G, a1=(turn ? F.x1 : F.z1)-G, b0=(turn ? F.z0 : F.x0)+G, b1=(turn ? F.z1 : F.x1)-G, ax=turn ? "x" : "z";
      const n=Math.floor((a1-a0)/SP), wall=(NB-0.5)*SP;      // (the wall stands between the tenth row and the eleventh)
      for(let i=0;i<=n;i++){ const a=a0+i*SP, h=H*(0.93+0.12*hash2(a, b0)), uo=hash2(b0, a)*7, out=i<n/2 ? -1 : 1;
        const tone=["#ffffff","#f0f2e8","#e6ecd8"][(hash2(a*1.7, b1)*3)|0];
        if(i<NB || i>n-NB) card("corn_row", ax, a, b0, b1, Y+0.02, h, 2.4, uo, out, tone);
        else { card("corn_row", ax, a, b0, b0+ENDS+0.3, Y+0.02, h, 2.4, uo, out, tone); card("corn_row", ax, a, b1-ENDS-0.3, b1, Y+0.02, h, 2.4, uo+3.1, out, tone); } }
      // the wall behind them, facing out all four ways, and the lid over what it encloses
      const wa0=a0+wall, wa1=a0+n*SP-wall, wb0=b0+ENDS, wb1=b1-ENDS, hw=H-0.16;
      const X0=turn ? wa0 : wb0, X1=turn ? wa1 : wb1, Z0=turn ? wb0 : wa0, Z1=turn ? wb1 : wa1;
      const face=(x, z, L, ry)=>{ const g=new T.PlaneGeometry(L, hw), uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setX(i, uv.getX(i)*L/2.6);
        push("corn_mass", g, x, Y+0.02+hw/2, z, ry, "#ffffff"); };
      face((X0+X1)/2, Z0, X1-X0, Math.PI); face((X0+X1)/2, Z1, X1-X0, 0); face(X0, (Z0+Z1)/2, Z1-Z0, -Math.PI/2); face(X1, (Z0+Z1)/2, Z1-Z0, Math.PI/2);
      lid("corn_top", X0, X1, Z0, Z1, Y+hw, TILE.corn, turn);
      addCol(X0+0.3, X1-0.3, Z0+0.3, Z1-0.3, Y-0.5, Y+H);
    }
    for(const F of E.fields.filter(f=>f.crop==="soy")){
      const turn=F.z0>Z, G=0.5, hh=0.56, x0=F.x0+G, x1=F.x1-G, z0=F.z0+G, z1=F.z1-G;
      lid("soy_top", x0+0.2, x1-0.2, z0+0.2, z1-0.2, Y+hh, TILE.soy, turn);
      // the skirt: two ragged rows of leaf round the edge, the outer a little lower
      for(const [d, h] of [[0, hh-0.06], [0.42, hh+0.05]]){
        card("soy_skirt", "z", z0+d, x0+d, x1-d, Y+0.02, h, 1.9, d*3, -1); card("soy_skirt", "z", z1-d, x0+d, x1-d, Y+0.02, h, 1.9, d*3+0.7, 1);
        card("soy_skirt", "x", x0+d, z0+d, z1-d, Y+0.02, h, 1.9, d*3+1.3, -1); card("soy_skirt", "x", x1-d, z0+d, z1-d, Y+0.02, h, 1.9, d*3+0.4, 1); }
    }
  }
  /* ---- the west farms' crops, standing up out of their fields ----
     The vineyard in rows running north and south, a post every seven metres and the vines trained along the wires
     between in a hedge of leaf; the pumpkins lying out in the vines, orange and here and there a white one; the
     sunflowers a band of tall stalks along the front and through the middle, the rest seen as heads from above; the
     Christmas trees in rows, every size from last year's whips to this year's, with blocks already cut. The many small
     things are instanced, a draw each kind, and cast no shadow. */
  { const W=E.fields.filter(f=>["grape","pumpkin","sunflower","xmas"].includes(f.crop));
    const leaf=signTex(128, 64, (c,Wd,Hh)=>{ const q=_trng(5757); c.fillStyle="#3e5a22"; c.fillRect(0,0,Wd,Hh);
      for(let k=0;k<420;k++){ c.fillStyle=["#4e6e2a","#2e4a1a","#5e7e34","#3a5620","#6a8a3c"][(q()*5)|0]; c.globalAlpha=0.8; c.beginPath(); c.ellipse(q()*Wd, q()*Hh, 3+q()*5, 2+q()*4, q()*3, 0, 7); c.fill(); }
      for(let k=0;k<26;k++){ c.fillStyle=q()<0.5 ? "#3a1a3a" : "#4a2a4a"; c.globalAlpha=0.9; c.beginPath(); c.arc(q()*Wd, Hh*0.55+q()*Hh*0.35, 2+q()*1.5, 0, 7); c.fill(); } });
    leaf.wrapS=leaf.wrapT=T.RepeatWrapping;
    bucketOf("vine_leaf", ()=>new T.MeshStandardMaterial({map:leaf, roughness:0.95}));
    /* Each kind is cut into 64 m tiles, a mesh a tile with its own bounding sphere (r128 culls an InstancedMesh by
       its geometry's sphere and knows nothing of where its instances are), and a tile further off than `far` is not
       drawn at all (updateCrops, from 19). Uncut, the five kinds were 1.4 million triangles every frame wherever you
       stood. */
    const inst=(geo, mat, list, far)=>{ if(!list.length) return; const tiles=new Map(), M=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler();
      for(const o of list){ const k=Math.floor(o.x/64)+","+Math.floor(o.z/64); let L=tiles.get(k); if(!L){ L=[]; tiles.set(k, L); } L.push(o); }
      for(const L of tiles.values()){ let x0=1e9, x1=-1e9, z0=1e9, z1=-1e9, y0=1e9, y1=-1e9;
        for(const o of L){ x0=Math.min(x0, o.x); x1=Math.max(x1, o.x); z0=Math.min(z0, o.z); z1=Math.max(z1, o.z); y0=Math.min(y0, o.y); y1=Math.max(y1, o.y); }
        const g=new T.BufferGeometry(); for(const k2 in geo.attributes) g.setAttribute(k2, geo.attributes[k2]); g.setIndex(geo.index);
        const c=V3((x0+x1)/2, (y0+y1)/2, (z0+z1)/2); g.boundingSphere=new T.Sphere(c, Math.hypot(x1-x0, y1-y0+3, z1-z0)/2+3);
        const m=new T.InstancedMesh(g, mat, L.length);
        L.forEach((o,i)=>{ e.set(o.rx||0, o.ry||0, 0); q.setFromEuler(e); M.compose(V3(o.x, o.y, o.z), q, V3(o.s, o.sy||o.s, o.s)); m.setMatrixAt(i, M); if(o.c) m.setColorAt(i, new T.Color(o.c)); });
        m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; m.castShadow=false; m.receiveShadow=true; m.name="crops";
        CROP_TILES.push({m, x:c.x, z:c.z, r:g.boundingSphere.radius, far}); scene.add(m); } };
    const pumpkins=[], heads=[], stalks=[], trees=[], trunks=[];
    for(const F of W){ const q=_trng(Math.round(-F.x0*7+F.z0)), fw=F.x1-F.x0, fd=F.z1-F.z0, front=F.z0>Z ? F.z0 : F.z1, back=F.z0>Z ? F.z1 : F.z0, sd=F.z0>Z ? 1 : -1;
      if(F.crop==="grape"){
        // rows north and south, 2.8 m apart, headlands at the ends
        for(let x=F.x0+3; x<F.x1-2; x+=2.8){ const z0=F.z0+6, z1=F.z1-6, L=z1-z0, zc=(z0+z1)/2;
          push("vine_leaf", boxGeo(0.62, 0.95, L, 0.5), x, Y+1.18, zc, 0, "#ffffff");
          bx("wood", 0.05, 0.62, L, x, Y+0.40, zc, 0.4, 0, "#5a4a36");                       // (the trunks, a low hedge of them under the leaf)
          for(let z=z0; z<=z1+0.01; z+=7) bx("wood", 0.08, 1.9, 0.08, x+0.36, Y+0.95, z, 0.4, 0, "#6d5c48");
          addCol(x-0.32, x+0.32, z0, z1, Y-0.5, Y+1.7); } }
      else if(F.crop==="pumpkin"){
        for(let k=0;k<Math.round(fw*fd/38);k++){ const x=F.x0+3+q()*(fw-6), z=F.z0+3+q()*(fd-6), s=0.8+q()*0.7;
          pumpkins.push({x:x, y:Y+0.15*s+0.03, z:z, s:s, sy:s*0.78, ry:q()*6, c:q()<0.1 ? "#e8e2cc" : ["#e0701a","#d8601a","#e8821e"][(q()*3)|0]}); } }
      else if(F.crop==="sunflower"){
        // a band twelve metres deep along the front and a strip down the middle, a stalk every half metre in rows 0.8 apart
        const band=(za, zb)=>{ for(let z=za; z<zb; z+=0.8) for(let x=F.x0+1.5; x<F.x1-1.5; x+=0.5+q()*0.15){ const h=1.6+q()*0.7, xx=x+(q()-0.5)*0.2, zz=z+(q()-0.5)*0.2;
          stalks.push({x:xx, y:Y+h/2, z:zz, s:1, sy:h}); heads.push({x:xx, y:Y+h+0.02, z:zz-sd*0.06, s:0.85+q()*0.35, rx:-sd*1.2, ry:F.z0>Z ? Math.PI : 0, c:q()<0.15 ? "#e8a812" : "#f2c41c"}); } };
        band(sd>0 ? front+1 : front-13, sd>0 ? front+13 : front-1);
        const mid=(F.z0+F.z1)/2; band(mid-4, mid+4);
        addCol(F.x0+1, F.x1-1, Math.min(front+sd*1, front+sd*13), Math.max(front+sd*1, front+sd*13), Y-0.5, Y+2.4); addCol(F.x0+1, F.x1-1, mid-4, mid+4, Y-0.5, Y+2.4); }
      else if(F.crop==="xmas"){
        for(let x=F.x0+3; x<F.x1-2; x+=3.2) for(let z=F.z0+4; z<F.z1-3; z+=3.2){
          const blk=hash2(Math.floor((x-F.x0)/22), Math.floor((z-F.z0)/30)+F.x0); if(blk<0.22) continue;     // (a block cut last December)
          const age=hash2(Math.floor((x-F.x0)/22)+7, Math.floor((z-F.z0)/30)), h=0.6+age*2.4+(q()-0.5)*0.4;
          trees.push({x:x+(q()-0.5)*0.4, y:Y+0.12+h/2, z:z+(q()-0.5)*0.4, s:h*0.36, sy:h, ry:q()*6, c:["#2e4a2a","#3a5a32","#28442a","#33502e"][(q()*4)|0]});
          trunks.push({x:x, y:Y+0.06, z:z, s:1, sy:1});
          if(h>1.4) addCol(x-0.3, x+0.3, z-0.3, z+0.3, Y-0.5, Y+h); } } }
    inst(new T.SphereGeometry(0.24, 10, 7), new T.MeshStandardMaterial({roughness:0.6}), pumpkins, 260);
    inst(new T.CylinderGeometry(0.018, 0.026, 1, 5, 1, true), new T.MeshStandardMaterial({color:0x4e6e2a, roughness:0.9}), stalks, 220);
    inst(new T.CylinderGeometry(0.16, 0.13, 0.05, 10), new T.MeshStandardMaterial({roughness:0.8, emissive:0x2a1a00}), heads, 420);
    inst(new T.ConeGeometry(1, 1, 8), new T.MeshStandardMaterial({roughness:0.95}), trees, 700);
    inst(new T.CylinderGeometry(0.05, 0.06, 0.12, 6, 1, true), new T.MeshStandardMaterial({color:0x5a4030, roughness:0.9}), trunks, 120); }
  /* the farm stand by the road between the pumpkins and the grapes: a shed roof on posts over a counter and bins, the
     sign on the front, pumpkins and mums along the front, hay bales either side; an honour box on the counter */
  { const sx=E.stand.x, sz=E.stand.z, f=XF(sx, sz, Math.PI), q=(w,h,d,lx,ly,lz,c,bk)=>lbx(f, bk||"wood", w,h,d, lx,Y+ly,lz, 0.4, c);
    for(const lx of [-2.2, 2.2]) for(const lz of [-1.2, 1.2]) q(0.12, lz<0 ? 2.6 : 2.3, 0.12, lx, lz<0 ? 1.3 : 1.15, lz, "#7a6248");
    q(5.0, 0.06, 3.0, 0, 2.48, 0, "#8a5a3a"); q(5.1, 0.04, 3.1, 0, 2.53, 0, "#5a3e2a", "metal");
    q(4.4, 0.90, 0.7, 0, 0.45, 0.6, "#a87a52"); q(4.5, 0.04, 0.8, 0, 0.92, 0.6, "#7a5a3a");
    for(const lx of [-1.5, 0, 1.5]) q(1.2, 0.6, 0.8, lx, 0.3, -0.6, "#8a6a4a");
    const st=signTex(400, 120, (c,Wd,Hh)=>{ c.fillStyle="#f2ece0"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#7a2a1a"; c.lineWidth=6; c.strokeRect(6,6,Wd-12,Hh-12);
      c.fillStyle="#7a2a1a"; fitText(c, "HOLLOWAY FARM STAND", Wd*0.80, Hh*0.30, Wd/2, Hh*0.36, "800", "Georgia, serif");
      c.fillStyle="#3a5a2a"; fitText(c, "PUMPKINS · MUMS · CIDER · HONEY · CUT YOUR OWN TREE", Wd*0.82, Hh*0.18, Wd/2, Hh*0.70, "700", "Arial"); });
    const sp=V3(f.x(0, 1.62), Y+2.0, f.z(0, 1.62)); bx("wood", 2.8, 0.86, 0.04, sp.x, sp.y, sp.z+0.02, 0.4, 0, "#5a3e2a");
    signPanel(2.7, 0.80, st, sp.x, sp.y, sp.z-0.004, Math.PI);
    const q2=_trng(4242); for(let k=0;k<14;k++){ const lx=-2.0+k*0.3+(q2()-0.5)*0.1, s=0.25+q2()*0.12; push("paintm", new T.SphereGeometry(s, 12, 8).scale(1, 0.78, 1), f.x(lx, 1.4), Y+s*0.78, 0, f.z(lx, 1.4), ["#e0701a","#d8601a","#e8821e","#e8e2cc"][(q2()*4)|0]); }
    for(const lx of [-1.5, 0, 1.5]) for(let k=0;k<6;k++) push("paintm", new T.SphereGeometry(0.16, 10, 8), f.x(lx+(k%3-1)*0.3, -0.6+(k>2?0.2:-0.2)), Y+0.66, 0, f.z(lx+(k%3-1)*0.3, -0.6+(k>2?0.2:-0.2)), "#e0701a");
    for(const lx of [-2.0, 2.0]){ push("paintm", new T.CylinderGeometry(0.2, 0.18, 0.22, 12), f.x(lx, 1.9), Y+0.11, 0, f.z(lx, 1.9), "#7a4a2a");
      push("paintm", new T.SphereGeometry(0.28, 12, 8), f.x(lx, 1.9), Y+0.34, 0, f.z(lx, 1.9), lx<0 ? "#c84a8a" : "#e8b030"); }
    for(const lx of [-3.0, 3.0]) bx("wood", 0.9, 0.5, 0.5, f.x(lx, 0.2), Y+0.25, f.z(lx, 0.2), 0.4, 0, "#c8b06a");
    q(0.22, 0.16, 0.16, 1.4, 1.02, 0.6, "#3a5a8a", "metal");
    addCol(sx-3.4, sx+3.4, sz-1.4, sz+2.2, Y-0.5, Y+1.0);
    addUse(sx, sz-3.0, Y, "THE HONOUR BOX", ()=>toast(["PUMPKINS $5 · BIG ONES $8 · MUMS $10 · PAY IN THE BOX, GOD IS WATCHING","A HANDWRITTEN NOTE: 'BACK AT 4 · CIDER IN THE COOLER'","YOU DROP A DOLLAR IN FOR LUCK"][(Math.random()*3)|0], "#e8c070"), 1.6); }
  // a farm fence along the road's right of way, posts and three strands, in front of each field
  for(const F of E.fields){
    const zf=F.z0>Z ? F.z0-3 : F.z1+3;
    for(let x=F.x0; x<=F.x1+0.01; x+=4.0) bx("wood", 0.12, 1.25, 0.12, x, Y+0.55, zf, 0.4, 0, "#6d5c48");
    for(const h of [0.45, 0.80, 1.10]) bx("metal", F.x1-F.x0, 0.012, 0.012, (F.x0+F.x1)/2, Y+h, zf, 1, 0, "#8a8d8e");
    addCol(F.x0, F.x1, zf-0.08, zf+0.08, Y-0.5, Y+1.2);
  }
  EDIN_RT.ready=true;
})();
// the interstate's outside edge lines and rumble strips, now that every ramp has said where it joins (08)
interstateEdges();
mileMarkers();                                   // (08: after every ramp is laid, so none stands on one)
checkRoadSigns();
