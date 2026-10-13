"use strict";
/* REST AREA · 14f-homestead.js
   the old house in the woods: a farmhouse nobody has lived in since the
   eighties, in a yard the trees are taking back
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14f · THE OLD HOUSE
   A two-storey frame farmhouse of the kind that stands empty all over
   this part of the state: clapboard gone grey where the paint has let go,
   a fieldstone foundation, a steep roof with a hole in the back of it, a
   brick chimney up the west end with its top fallen in, and a porch
   across the front whose corner post is lying in the grass so the roof
   sags to meet it. The windows are broken or boarded; the front door is
   standing open. Inside, the ground floor: the parlour with a stove and
   a calendar that stopped in October 1987, the ceiling come down in one
   corner, the kitchen with the table on its side and the stairs rotted
   through halfway up. Out in the yard: the well, the pump, a shed lying
   on its face, the swing set, the lilacs, the mailbox at the end of the
   drive. The kids' flagging tape leads here from the fire.
   ---------------------------------------------------------------------- */
const HOUSE={};
(function homestead(){
  const n0=scene.children.length;
  const HX=HOMESTEAD.x, HZ=HOMESTEAD.z, HY=HOMESTEAD.y;
  const FF=HY+0.72;                                     // the ground floor
  const W2=4.6, D2=3.3, x0=HX-W2, x1=HX+W2, z0=HZ-D2, z1=HZ+D2, T2=0.20;
  const EAVE=FF+5.45, RIDGE=FF+8.35;
  const SID="#8c877c", SID2="#7a756b", TRIM="#55524c", BARE="#635d54";
  const r=_trng(1987);
  Object.assign(HOUSE, {x0:x0, x1:x1, z0:z0, z1:z1, FF:FF, HY:HY});
  // the stone it stands on
  for(const [a,b,c,d] of [[x0,x1,z0,z0+0.3],[x0,x1,z1-0.3,z1],[x0,x0+0.3,z0,z1],[x1-0.3,x1,z0,z1]])
    wallBox("rock", a, b, c, d, HY-0.6, FF, "#8d877b", 0.5, HY-0.6);
  // the ground floor, and the boards under it (seen through the holes)
  floorAt("beam", x0+T2, x1-T2, z0+T2, z1-T2, FF+0.004, "#7a6a54", 0.9);
  addFlat(x0+T2, x1-T2, z0+T2, z1-T2, FF);
  addZone(x0, x1, z0, z1, FF-0.6, FF+6, "THE OLD HOUSE", true);

  /* ---- the walls ------------------------------------------------------- */
  const DOOR={a:HX-0.55, b:HX+0.40, sill:FF-0.6, head:FF+2.12};
  const win=(a,b,lo)=>({a:a, b:b, sill:lo?FF+0.86:FF+3.45, head:lo?FF+2.14:FF+4.72});
  const FRONT=[DOOR, win(HX-3.5,HX-2.5,1), win(HX+1.9,HX+2.9,1), win(HX-3.4,HX-2.6,0), win(HX-0.45,HX+0.35,0), win(HX+2.0,HX+2.8,0)];
  const BDOOR={a:HX+2.4, b:HX+3.3, sill:FF-0.6, head:FF+2.08};
  const BACK=[BDOOR, win(HX-2.8,HX-1.8,1), win(HX-2.7,HX-1.9,0), win(HX+1.6,HX+2.4,0)];
  const WEST=[win(HZ-1.0,HZ+0.0,1), win(HZ-1.0,HZ+0.0,0)];
  const EAST=[win(HZ-1.9,HZ-0.9,1), win(HZ-1.0,HZ-0.2,0), win(HZ+0.9,HZ+1.7,0)];
  // each wall in two runs, a storey each, so a window over a door is its own opening
  const lo=L=>L.filter(o=>o.head<FF+2.6), hi=L=>L.filter(o=>o.sill>FF+2.6), MID=FF+2.6;
  for(const [L,y0,y1] of [[lo,FF,MID],[hi,MID,EAVE]]){
    runX("siding", z0+T2/2, T2, x0, x1, y0, y1, L(FRONT), SID, 0.5);
    runX("siding", z1-T2/2, T2, x0, x1, y0, y1, L(BACK), SID, 0.5);
    runZ("siding", x0+T2/2, T2, z0+T2, z1-T2, y0, y1, L(WEST), SID, 0.5);
    runZ("siding", x1-T2/2, T2, z0+T2, z1-T2, y0, y1, L(EAST), SID, 0.5);
  }
  // the gables, up to the ridge
  for(const [x,sd] of [[x0,-1],[x1,1]]){
    const g=new FaceGeo().slab([V3(x+(sd<0?T2:0), EAVE, z0-0.002), V3(x+(sd<0?T2:0), EAVE, z1+0.002), V3(x+(sd<0?T2:0), RIDGE-0.08, HZ)], T2, 0.5).geo();
    push("siding", g, 0,0,0, 0, SID);
  }
  // inside: plaster on the ground floor (lath showing where it is off), dark above
  const lin=(axis,f,dir,a,b,open)=>{ (axis==="x"?lineX:lineZ)("plaster", f, dir, a, b, FF, FF+2.6, lo(open), "#9e927a", 0.5);
                                     (axis==="x"?lineX:lineZ)("beam", f, dir, a, b, FF+2.62, EAVE, hi(open), "#3e362c", 0.6); };
  lin("x", z0+T2, 1, x0+T2, x1-T2, FRONT); lin("x", z1-T2, -1, x0+T2, x1-T2, BACK);
  lin("z", x0+T2, 1, z0+T2, z1-T2, WEST); lin("z", x1-T2, -1, z0+T2, z1-T2, EAST);
  // the weather on the outside: bare grey boards where the paint has gone, mildew low down
  const placed=[[],[],[],[]];
  for(let k=0;k<150;k++){
    const side=(r()*4)|0, w=0.4+r()*1.9, h=0.12+((r()*5)|0)*0.13, y=FF+0.2+r()*4.6, off=0.006;
    const q=r(), col=q<0.55?BARE:q<0.75?(y<FF+1.6?"#5f6a48":"#6a6458"):q<0.88?"#4e463c":SID2;
    const along=side<2 ? x0+0.4+r()*(x1-x0-0.8) : z0+0.4+r()*(z1-z0-0.8);
    // never over a window, and never over another patch (one plane each)
    if((side===0?FRONT:side===1?BACK:side===2?WEST:EAST).some(o=>along+w/2>o.a-0.1 && along-w/2<o.b+0.1 && y+h/2>o.sill-0.1 && y-h/2<o.head+0.1)) continue;
    if(placed[side].some(p=>Math.abs(p[0]-along)<(p[2]+w)/2+0.02 && Math.abs(p[1]-y)<(p[3]+h)/2+0.02)) continue;
    placed[side].push([along,y,w,h]);
    if(side===0) push("paintm", planeGeo(w,h,0), along, y, z0-off, Math.PI, col);
    else if(side===1) push("paintm", planeGeo(w,h,0), along, y, z1+off, 0, col);
    else if(side===2) push("paintm", planeGeo(w,h,0), x0-off, y, along, -Math.PI/2, col);
    else push("paintm", planeGeo(w,h,0), x1+off, y, along, Math.PI/2, col);
  }
  // corner boards and the frieze under the eaves
  for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]]) bx("paintm", 0.16, EAVE-FF+0.7, 0.16, x+(x<HX?-0.01:0.01), (FF-0.7+EAVE)/2+0.35, z+(z<HZ?-0.01:0.01), 0, 0, TRIM);
  for(const z of [z0,z1]) bx("paintm", x1-x0+0.1, 0.22, 0.05, HX, EAVE-0.12, z+(z<HZ?-0.03:0.03), 0, 0, TRIM);

  /* ---- the openings: frames; glass broken or gone; boards over some ----- */
  const glassShard=(w,h,seed)=>{ const q=_trng(seed), s=new T.Shape();
    // what is left in the frame: a jagged tooth from one corner
    s.moveTo(-w/2,-h/2); s.lineTo(-w/2+w*(0.3+q()*0.6),-h/2); s.lineTo(-w/2+w*(0.1+q()*0.3),-h/2+h*(0.2+q()*0.3));
    s.lineTo(-w/2+w*(0.25+q()*0.2),-h/2+h*(0.4+q()*0.2)); s.lineTo(-w/2,-h/2+h*(0.5+q()*0.4)); s.lineTo(-w/2,-h/2);
    return new T.ShapeGeometry(s); };
  const framed=(o, axis, f, out)=>{                     // out: +1 the outside is +z / +x
    const cx=(o.a+o.b)/2, cy=(o.sill+o.head)/2, w=o.b-o.a, h=o.head-o.sill, door=o.sill<FF;
    const P=(along,y,depth,ww,hh,dd)=>axis==="x" ? bx("paintm", ww, hh, dd, along, y, f+out*depth, 0, 0, TRIM)
                                                : bx("paintm", dd, hh, ww, f+out*depth, y, along, 0, 0, TRIM);
    P(o.a-0.05, door?(FF+o.head)/2:cy, 0.02, 0.10, door?o.head-FF:h+0.1, T2+0.06);
    P(o.b+0.05, door?(FF+o.head)/2:cy, 0.02, 0.10, door?o.head-FF:h+0.1, T2+0.06);
    P(cx, o.head+0.07, 0.02, w+0.3, 0.14, T2+0.07);
    if(!door) P(cx, o.sill-0.03, 0.05, w+0.22, 0.06, T2+0.14);
    if(door) return;
    const k=r();
    if(k<0.38){                                          // boarded over from outside
      for(let j=0;j<3;j++){ const yy=o.sill+h*(0.2+j*0.3), rz=(r()-0.5)*0.25;
        if(axis==="x") push("beam", boxGeo(w+0.25, 0.20, 0.02, 0.6), cx, yy, f+out*(T2/2+0.03), 0, "#7a7060", 0, rz);
        else push("beam", boxGeo(0.02, 0.20, w+0.25, 0.6), f+out*(T2/2+0.03), yy, cx, 0, "#7a7060", rz, 0); }
    }else{
      // a sash with most of its glass gone: muntins, and a shard or two
      const sx=f-out*0.02;
      for(const fr of [0.5]){ if(axis==="x") bx("paintm", w, 0.04, 0.04, cx, o.sill+h*fr, sx, 0, 0, "#8e8a80"); else bx("paintm", 0.04, 0.04, w, sx, o.sill+h*fr, cx, 0, 0, "#8e8a80"); }
      if(axis==="x") bx("paintm", 0.035, h, 0.032, cx, cy, sx, 0, 0, "#8e8a80"); else bx("paintm", 0.032, h, 0.035, sx, cy, cx, 0, 0, "#8e8a80");
      for(const [qx,qy] of [[-1,-1],[1,1]]) if(r()<0.6){
        const g=glassShard(w/2-0.04, h/2-0.04, (r()*1e5)|0);
        const px=cx+qx*w/4, py=cy+qy*h/4;
        if(axis==="x") push("glass", g, px, py, sx, qx<0?0:Math.PI, "#dfe6e2"); else push("glass", g, sx, py, px, out>0?Math.PI/2:-Math.PI/2, "#dfe6e2");
      }
      // a shutter, hanging off one hinge
      if(k>0.72){ const sw=(w/2+0.08), along=o.b+sw/2+0.05, tilt=0.35;
        if(axis==="x") push("paintm", boxGeo(sw*1.0, h, 0.03, 0), along, cy-0.15, f+out*(T2/2+0.04), 0, "#3e4a3a", 0, tilt);
        else push("paintm", boxGeo(0.03, h, sw, 0), f+out*(T2/2+0.04), cy-0.15, along, 0, "#3e4a3a", tilt, 0); }
    }
  };
  FRONT.forEach(o=>framed(o,"x",z0+T2/2,-1)); BACK.forEach(o=>framed(o,"x",z1-T2/2,1));
  WEST.forEach(o=>framed(o,"z",x0+T2/2,-1)); EAST.forEach(o=>framed(o,"z",x1-T2/2,1));
  // the front door, standing open into the hall and down off its top hinge
  { const a=1.42, hx=DOOR.a, hz=z0+T2/2;
    push("paintm", boxGeo(0.92, 2.04, 0.045, 0), hx+Math.cos(a)*0.46, FF+1.02, hz+Math.sin(a)*0.46, -a, "#56664f", 0, 0.03);
    push("chrome", new T.SphereGeometry(0.03,8,6), hx+Math.cos(a)*0.84, FF+1.0, hz+Math.sin(a)*0.84-0.03, 0, "#8a7a5a"); }
  // the thresholds, so the floor runs on through both doorways; a block for a step out the back
  addFlat(DOOR.a, DOOR.b, z0-0.05, z0+T2+0.05, FF);
  // out the back: a sill stone, then a cinder block to step down on
  bx("rock", BDOOR.b-BDOOR.a+0.1, 0.12, 0.40, (BDOOR.a+BDOOR.b)/2, FF-0.06, z1+0.20, 0.5, 0, "#8d877b");
  addFlat(BDOOR.a, BDOOR.b, z1-T2-0.05, z1+0.40, FF);
  bx("block", 0.9, 0.36, 0.42, (BDOOR.a+BDOOR.b)/2+0.05, HY+0.16, z1+0.62, 0.5, 0.05, "#8a8780");
  addFlat(BDOOR.a-0.05, BDOOR.b+0.05, z1+0.40, z1+0.83, HY+0.34);
  // the back door is gone altogether; a sheet of plywood leans against the wall beside the opening
  push("beam", boxGeo(0.95, 1.9, 0.02, 0.6), BDOOR.a-0.62, HY+0.95, z1+0.24, 0, "#6e6450", -0.16, 0);

  /* ---- the roof, with the hole in the back of it ------------------------ */
  const OHX=0.38, OHZ=0.48, RT=0.13;
  const slope=(zA, zB, yA, yB, xa, xb)=>new FaceGeo().slab([V3(xa,yA,zA),V3(xb,yA,zA),V3(xb,yB,zB),V3(xa,yB,zB)], RT, 0.6).geo();
  const eY=EAVE-OHZ*(RIDGE-EAVE)/D2;
  // front: whole
  push("shingle", slope(z0-OHZ, HZ, eY, RIDGE, x0-OHX, x1+OHX), 0,0,0, 0, "#5b544b");
  // back: in four pieces round the hole (x HX+1.7..HX+3.5, from 30% to 72% of the way up)
  const hb0=HX+1.7, hb1=HX+3.5, f0=0.30, f1=0.72, zAt=f=>z1+OHZ-(z1+OHZ-HZ)*f, yAt=f=>eY+(RIDGE-eY)*f;
  push("shingle", slope(z1+OHZ, HZ, eY, RIDGE, x0-OHX+0.004, hb0), 0,0,0, 0, "#5b544b");     // a few mm short of the front slope's ends
  push("shingle", slope(z1+OHZ, HZ, eY, RIDGE, hb1, x1+OHX-0.004), 0,0,0, 0, "#5b544b");
  push("shingle", slope(z1+OHZ, zAt(f0), eY, yAt(f0), hb0, hb1), 0,0,0, 0, "#5b544b");
  push("shingle", slope(zAt(f1), HZ, yAt(f1), RIDGE, hb0, hb1), 0,0,0, 0, "#5b544b");
  // the rafters across it, one of them broken and hanging
  for(let x=hb0+0.2; x<hb1; x+=0.45){
    const broken=Math.abs(x-(hb0+1.1))<0.2;
    const A=V3(x, yAt(f0-0.02)-RT, zAt(f0-0.02)), B=V3(x, yAt(broken?0.52:f1+0.02)-RT, zAt(broken?0.52:f1+0.02));
    tube("beam", A, B, 0.045, 4, "#6a5a44");
    if(broken) tube("beam", V3(x, yAt(f1+0.02)-RT, zAt(f1+0.02)), V3(x+0.05, yAt(0.6)-RT-0.55, zAt(0.6)), 0.045, 4, "#6a5a44");
  }
  // the ridge cap, the fascia, moss on the north side
  bx("paintm", x1-x0+2*OHX, 0.10, 0.22, HX, RIDGE+0.03, HZ, 0, 0, "#4a443c");
  for(const [z,y] of [[z0-OHZ,eY],[z1+OHZ,eY]]) bx("paintm", x1-x0+2*OHX, 0.20, 0.04, HX, y-0.12, z+(z<HZ?-0.01:0.01), 0, 0, TRIM);
  for(let k=0;k<9;k++){ const f=0.05+r()*0.85; if(f>f0-0.05 && f<f1+0.05) continue; const xx=x0+r()*(x1-x0);
    if(xx>hb0-0.3 && xx<hb1+0.3) continue;
    const g=new T.CircleGeometry(0.35+r()*0.6, 9); g.scale(1,0.55,1);
    const ang=Math.atan2(RIDGE-eY, z1+OHZ-HZ);
    push("paintm", g, xx, yAt(f)+0.005+k*0.003, zAt(f), 0, "#4f5a34", -(Math.PI/2-ang), 0); }
  // shingles gone in patches on the front slope: the dark felt under them
  { const ang=Math.atan2(RIDGE-eY, HZ-(z0-OHZ));
    for(let k=0;k<7;k++){ const f=0.1+r()*0.75, xx=x0+0.3+r()*(x1-x0-0.6), zz=z0-OHZ+(HZ-(z0-OHZ))*f, yy=eY+(RIDGE-eY)*f;
      push("paintm", planeGeo(0.3+r()*0.6, 0.18+r()*0.3, 0), xx, yy+0.006, zz-0.004, 0, "#2a2622", -(Math.PI/2+ang), 0); } }
  // ivy up the west end and the front corner, and over the porch post
  const IVY_TEX=(function(){ const c=cvs(256,512), x2=c.getContext("2d"), q=_trng(77);
    for(let k=0;k<900;k++){ const b=Math.pow(q(),0.7), px=128+(q()-0.5)*240*(1-b*0.55), py=512-b*500, rr=6+q()*10;
      x2.fillStyle=["#2a4422","#35552a","#41652f","#4e7236"][(q()*4)|0]; x2.beginPath();
      x2.ellipse(px,py,rr,rr*0.75,q()*3,0,7); x2.fill(); }
    x2.strokeStyle="#4a3a28"; x2.lineWidth=3; for(let k=0;k<6;k++){ x2.beginPath(); x2.moveTo(128+(q()-0.5)*60,512); x2.bezierCurveTo(128+(q()-0.5)*200,380,128+(q()-0.5)*200,200,128+(q()-0.5)*160,40); x2.stroke(); }
    return setSRGB(new T.CanvasTexture(c)); })();
  const ivyMat=new T.MeshStandardMaterial({map:IVY_TEX, alphaTest:0.5, roughness:0.85, side:T.DoubleSide});
  const ivy=(x,y,z,ry,w,h)=>{ const m=new T.Mesh(new T.PlaneGeometry(w,h), ivyMat);
    m.position.set(x+Math.sin(ry)*0.012, y+h/2, z+Math.cos(ry)*0.012); m.rotation.y=ry; scene.add(m); };
  ivy(x0-0.014, FF-0.6, HZ-1.9, -Math.PI/2, 1.6, 3.4);
  ivy(x0-0.014, FF-0.6, HZ+0.6, -Math.PI/2, 1.0, 5.2);
  ivy(x0+0.5, FF-0.6, z0-0.014, Math.PI, 1.1, 2.6);
  ivy(x1-0.6, FF-0.6, z1+0.014, 0, 1.4, 2.2);
  // the attic floor under the roof, so the upstairs is dark and not open to the sky
  ceilAt("beam", x0+T2, x1-T2, z0+T2, z1-T2, EAVE-0.02, "#2e2822", 0.6);

  /* ---- the chimney up the west gable, its top fallen in ------------------ */
  { const cx=x0-0.34, cz=HZ+1.55;
    wallBox("brick", cx-0.33, cx+0.33, cz-0.45, cz+0.45, HY-0.3, RIDGE+0.4, "#6a3c30", 0.8, HY-0.3);
    bx("brick", 0.55, 0.36, 0.40, cx+0.05, RIDGE+0.58, cz-0.18, 0.8, 0, "#6a3c30");
    // soot down the face of it, and white bloom where the water comes through
    for(let k=0;k<5;k++) push("paintm", planeGeo(0.3+r()*0.3, 0.6+r()*1.4, 0), cx-0.334, FF+1+r()*6, cz-0.3+r()*0.6, -Math.PI/2, r()<0.6?"#3a2a24":"#9a8a80");
    for(let k=0;k<7;k++){ const bxp=cx-1.2+r()*2.4, bzp=cz-1.3+r()*2.6;
      bx("brick", 0.22, 0.07, 0.10, bxp, Terrain.groundAt(bxp,bzp)+0.035, bzp, 0.8, r()*3, "#7d4434"); } }

  /* ---- the porch -------------------------------------------------------- */
  const pz0=z0-2.30, pY=FF-0.07;
  // the deck: boards running out from the house, three missing
  for(let k=0, x=x0+0.07; x<x1; x+=0.14, k++){
    if(k===23 || k===24 || k===51) continue;
    bx("beam", 0.125, 0.04, 2.25, x, pY, (pz0+z0)/2-0.02, 0.6, 0, k%5?"#6a6156":(k%3?"#5d564c":"#73695b"));
  }
  addFlat(x0, x1, pz0, z0, pY+0.02);
  // under it: dark, on stone piers
  bx("paintm", x1-x0, 0.02, 2.2, HX, HY+0.15, (pz0+z0)/2, 0, 0, "#1a1714");
  for(const x of [x0+0.3, HX-1.6, HX+1.6, x1-0.3]) wallBox("rock", x-0.2, x+0.2, pz0+0.05, pz0+0.45, HY-0.3, pY-0.02, "#8d877b", 0.5, HY-0.3);
  // a skirt of lattice, mostly kicked in
  for(let k=0;k<12;k++){ if(r()<0.55) continue; push("paintm", boxGeo(0.70, 0.45, 0.02, 0), x0+0.4+k*0.75, HY+0.26, pz0+0.04+r()*0.1, 0, "#5a564e", (r()-0.5)*0.5, 0); }
  // the steps: two, the lower one split
  const sx0=HX-0.85, sx1=HX+0.75;
  bx("beam", sx1-sx0, 0.05, 0.32, (sx0+sx1)/2, HY+0.47, pz0-0.17, 0.6, 0, "#7a6a54");
  push("beam", boxGeo((sx1-sx0)/2, 0.05, 0.32, 0.6), sx0+(sx1-sx0)*0.25, HY+0.22, pz0-0.50, 0, "#7a6a54", 0.15, 0);
  push("beam", boxGeo((sx1-sx0)/2, 0.05, 0.32, 0.6), sx0+(sx1-sx0)*0.75, HY+0.20, pz0-0.50, 0, "#73644f", -0.05, 0.12);
  for(const x of [sx0+0.05, sx1-0.05]) push("beam", boxGeo(0.05, 0.55, 0.75, 0.6), x, HY+0.24, pz0-0.36, 0, "#6a5a44", -0.6, 0);
  addFlat(sx0, sx1, pz0-0.33, pz0, HY+0.49); addFlat(sx0, sx1, pz0-0.68, pz0-0.33, HY+0.24);
  // the posts: three standing; the corner one down in the grass
  const postY0=pY+0.02, roofAt=x=>x<x1-1.5 ? FF+2.48 : FF+2.48-(x-(x1-1.5))/1.7*0.62;
  for(const x of [x0+0.18, HX-1.6, HX+1.6]){ bx("paintm", 0.13, roofAt(x)-postY0, 0.13, x, (postY0+roofAt(x))/2, pz0+0.18, 0, 0, "#7d786e");
    addCol(x-0.08, x+0.08, pz0+0.1, pz0+0.26, pY-0.5, roofAt(x)); }
  push("paintm", boxGeo(0.13, 2.4, 0.13, 0), x1+0.6, HY+0.09, pz0-0.7, 0.4, "#8f8a7e", Math.PI/2, 0);
  // its roof: a shed off the wall, down to the beam over the posts, sagging at the east end
  { const g=new FaceGeo().slab([V3(x0-0.2,FF+2.95,z0), V3(x1+0.2,FF+2.95,z0), V3(x1+0.2,FF+1.82,pz0-0.2), V3(x0-0.2,FF+2.46,pz0-0.2)], 0.10, 0.6).geo();
    push("roofmetal", g, 0,0,0, 0, "#6e665a");
    tube("paintm", V3(x0+0.05,FF+2.42,pz0+0.18), V3(x1-1.4,FF+2.42,pz0+0.18), 0.07, 4, "#8f8a7e");
    tube("paintm", V3(x1-1.4,FF+2.42,pz0+0.18), V3(x1+0.1,FF+1.80,pz0+0.18), 0.07, 4, "#8f8a7e"); }
  // what is left of the rail: a few balusters and the top rail on the west side
  for(let k=0;k<14;k++){ if(r()<0.4) continue; bx("paintm", 0.04, 0.72, 0.04, x0+0.4+k*0.2, pY+0.38, pz0+0.06, 0, 0, "#7d786e"); }
  bx("paintm", 2.9, 0.06, 0.08, x0+1.75, pY+0.76, pz0+0.06, 0, 0, "#7d786e");
  addCol(x0, x0+3.2, pz0-0.02, pz0+0.12, pY-0.3, pY+0.8);
  // an old glider on the porch, rusted, one cushion
  { const gx=HX+2.9, gz=z0-0.75;
    for(const sd of [-1,1]) tube("metal", V3(gx+sd*0.7, pY, gz-0.25), V3(gx+sd*0.7, pY+0.85, gz+0.10), 0.02, 5, "#7a4a32");
    bx("paintm", 1.45, 0.05, 0.50, gx, pY+0.42, gz, 0, 0, "#7a4a32"); bx("paintm", 1.45, 0.45, 0.05, gx, pY+0.70, gz+0.25, 0, 0, "#7a4a32");
    bx("paintm", 0.62, 0.10, 0.46, gx-0.36, pY+0.50, gz, 0, 0, "#6a7a5a");
    addCol(gx-0.75, gx+0.75, gz-0.3, gz+0.3, pY-0.3, pY+0.9); }

  /* ---- inside ------------------------------------------------------------ */
  // the wall between the parlour and the kitchen, with its doorway
  const PX=HX+0.9, PD={a:HZ-0.45, b:HZ+0.65, sill:FF-0.6, head:FF+2.08};
  runZ("block", PX, 0.20, z0+T2, z1-T2, FF, FF+2.62, [PD], "#3e362c", 0.5);
  lineZ("plaster", PX-0.10, -1, z0+T2, z1-T2, FF, FF+2.6, [PD], "#9a8c72", 0.5);
  lineZ("plaster", PX+0.10, 1, z0+T2, z1-T2, FF, FF+2.6, [PD], "#958a74", 0.5);
  // wallpaper coming away in strips, lath showing behind the plaster
  for(let k=0;k<12;k++){ const onW=k%2, z=z0+0.5+r()*(z1-z0-1), y=FF+0.6+r()*1.7, h=0.3+r()*0.6;
    if(onW) push("paintm", planeGeo(0.18+r()*0.3, h, 0), x0+T2+0.012, y, z, Math.PI/2, "#6a5c48");
    else push("paintm", planeGeo(0.12, h, 0), PX-0.112, y, z, -Math.PI/2, "#7a6a52", 0, (r()-0.5)*0.12); }
  // water stains down from the ceiling, and damp coming up the walls
  const stain=(x,z,ry,y,w,h,c)=>push("paintm", new T.CircleGeometry(0.5,10).scale(w,h,1), x, y, z, ry, c);
  for(let k=0;k<16;k++){ const side=(r()*4)|0, w=0.4+r()*0.9, h=0.5+r()*1.2, c=r()<0.6?"#6e604a":"#5a5444";
    const y=r()<0.5 ? FF+2.6-h*0.45 : FF+h*0.4;
    if(side===0) stain(x0+0.4+r()*(x1-x0-0.8), z0+T2+0.024, 0, y, w, h, c);
    else if(side===1) stain(x0+0.4+r()*(x1-x0-0.8), z1-T2-0.024, Math.PI, y, w, h, c);
    else if(side===2) stain(x0+T2+0.024, z0+0.5+r()*(z1-z0-1), Math.PI/2, y, w, h, c);
    else stain(PX+0.114, z0+0.5+r()*(z1-z0-1), Math.PI/2, y, w, h, c); }
  // dirt and leaves blown in across the floor
  for(let k=0;k<40;k++){ const x=x0+0.4+r()*(x1-x0-0.8), z=z0+0.4+r()*(z1-z0-0.8);
    push("paintm", new T.CircleGeometry(0.08+r()*0.35, 7), x, FF+0.006+r()*0.002, z, 0, ["#4a3a28","#6a4a2a","#3e3428","#7a5a30"][(r()*4)|0], -Math.PI/2, 0); }
  // the ceiling, down in one corner of the parlour: joists showing, the rest on the floor
  const ch={x0:HX-2.5, x1:HX-1.1, z0:HZ-0.7, z1:HZ+0.8};
  ceilAt("plaster", x0+T2, x1-T2, z0+T2, ch.z0, FF+2.6, "#b8b0a0", 0.5);
  ceilAt("plaster", x0+T2, x1-T2, ch.z1, z1-T2, FF+2.6, "#b8b0a0", 0.5);
  ceilAt("plaster", x0+T2, ch.x0, ch.z0, ch.z1, FF+2.6, "#b8b0a0", 0.5);
  ceilAt("plaster", ch.x1, x1-T2, ch.z0, ch.z1, FF+2.6, "#b8b0a0", 0.5);
  for(let x=ch.x0+0.15; x<ch.x1; x+=0.4) bx("beam", 0.06, 0.20, ch.z1-ch.z0+0.3, x, FF+2.72, (ch.z0+ch.z1)/2, 0.6, 0, "#5a4a38");
  ceilAt("beam", ch.x0, ch.x1, ch.z0, ch.z1, FF+2.86, "#2a2420", 0.6);
  for(let k=0;k<16;k++){ const x=ch.x0+r()*(ch.x1-ch.x0), z=ch.z0+r()*(ch.z1-ch.z0);
    push("paintm", boxGeo(0.12+r()*0.3, 0.03, 0.10+r()*0.25, 0), x, FF+0.03+r()*0.04, z, r()*3, r()<0.5?"#cfc7b6":"#9a8a70", (r()-0.5)*0.3, (r()-0.5)*0.3); }
  for(let k=0;k<6;k++) tube("beam", V3(ch.x0+r()*1.4, FF+0.03, ch.z0+r()*1.5), V3(ch.x0+r()*1.4, FF+0.05+r()*0.4, ch.z0+r()*1.5), 0.012, 3, "#7a6a54");
  // a hole in the kitchen floor: the boards gone, dark under
  const fh={x0:HX+1.2, x1:HX+1.9, z0:HZ+1.6, z1:HZ+2.5};
  push("paintm", planeGeo(fh.x1-fh.x0, fh.z1-fh.z0, 0), (fh.x0+fh.x1)/2, FF+0.008, (fh.z0+fh.z1)/2, 0, "#0c0a08", -Math.PI/2, 0);
  for(const z of [fh.z0, fh.z1]) push("beam", boxGeo(fh.x1-fh.x0+0.1, 0.03, 0.06, 0.6), (fh.x0+fh.x1)/2, FF+0.012, z, 0, "#5a4a38", 0, z===fh.z0?0.1:-0.08);
  addCol(fh.x0, fh.x1, fh.z0, fh.z1, FF-0.6, FF+0.25);
  // the stairs up the east wall: rotted through half way, and you are not going up them
  { const sx0=x1-T2-0.95, sx1=x1-T2, zb=z0+T2+0.25, run=0.29, rise=0.215;
    for(let k=0;k<12;k++){ if(k===6||k===7) continue;
      bx("beam", sx1-sx0-0.08, 0.04, 0.27, (sx0+sx1)/2, FF+rise*(k+1), zb+run*k+0.14, 0.6, 0, "#7a6a54");
      bx("beam", sx1-sx0-0.11, rise-0.012, 0.02, (sx0+sx1)/2, FF+rise*k+rise/2-0.006, zb+run*k+0.01, 0.6, 0, "#6a5a44"); }
    tube("beam", V3(sx0+0.03, FF, zb), V3(sx0+0.03, FF+rise*12, zb+run*12), 0.05, 4, "#5a4a38");
    tube("beam", V3(sx0+0.03, FF+rise*7, zb+run*6.5), V3(sx0+0.35, FF+0.05, zb+run*6.5+0.4), 0.025, 4, "#6a5a44");
    addCol(sx0-0.05, sx1, zb-0.05, zb+run*12+0.1, FF-0.5, FF+3.0);
    addUse(sx0-0.5, zb+0.7, FF, "LOOK UP THE STAIRS", ()=>toast("THEY ARE ROTTED THROUGH HALF WAY UP. SOMETHING UP THERE SHIFTS, AND IS STILL","#cfe0d4"), 1.2); }
  // the parlour: the stove and its pipe, an armchair gone through, a mattress, the calendar, a picture
  { const sx=x0+T2+0.55, sz=HZ+1.55;
    push("paintm", new T.CylinderGeometry(0.28,0.30,0.62,14), sx, FF+0.47, sz, 0, "#1d1c1b");
    for(const [dx,dz] of [[-0.2,-0.2],[0.2,-0.2],[-0.2,0.2],[0.2,0.2]]) bx("paintm", 0.05, 0.16, 0.05, sx+dx, FF+0.08, sz+dz, 0, 0, "#1d1c1b");
    tube("metal", V3(sx, FF+0.78, sz), V3(sx, FF+1.6, sz), 0.07, 8, "#2a2826");
    tube("metal", V3(sx, FF+1.6, sz), V3(x0+T2, FF+1.95, sz), 0.07, 8, "#2a2826");
    addCol(sx-0.32, sx+0.32, sz-0.32, sz+0.32, FF-0.5, FF+0.8); }
  { const cx=HX-1.6, cz=HZ+2.4;
    bx("paintm", 0.80, 0.30, 0.78, cx, FF+0.28, cz, 0, 0.3, "#6a4a3a");
    push("paintm", boxGeo(0.80, 0.65, 0.18, 0), cx+0.1, FF+0.62, cz+0.35, 0.3, "#5e4234", -0.45, 0);
    bx("paintm", 0.18, 0.40, 0.70, cx-0.40, FF+0.45, cz+0.1, 0, 0.3, "#5e4234");
    addCol(cx-0.5, cx+0.5, cz-0.45, cz+0.5, FF-0.5, FF+0.7); }
  { const mx=HX-3.0, mz=HZ-1.9; bx("paintm", 1.35, 0.16, 1.9, mx, FF+0.08, mz, 0, 0.15, "#b8ab90");
    push("paintm", new T.CircleGeometry(0.3,10), mx+0.2, FF+0.165, mz+0.3, 0, "#8a7a58", -Math.PI/2, 0); }
  // the calendar, the picture
  const calTex=signTex(240,300,(c,W,H)=>{ c.fillStyle="#efe6cf"; c.fillRect(0,0,W,H);
    c.fillStyle="#7a8a5a"; c.fillRect(0,0,W,H*0.42); c.fillStyle="#3a4a2a"; c.fillRect(W*0.1,H*0.08,W*0.8,H*0.26);
    c.fillStyle="#2a2a2a"; fitText(c,"CONNEAUT LAKE FEED & SUPPLY",W*0.92,H*0.06,W/2,H*0.47,"700");
    fitText(c,"OCTOBER  1987",W*0.7,H*0.07,W/2,H*0.56,"700");
    c.fillStyle="#555"; for(let k=0;k<5;k++) for(let j=0;j<7;j++) c.fillRect(W*0.08+j*W*0.12, H*0.62+k*H*0.07, W*0.09, H*0.05);
    c.fillStyle="#b3151b"; c.font="bold 22px Arial"; c.fillText("X",W*0.08+3*W*0.12+2,H*0.62+2*H*0.07+18); });
  signPanel(0.30,0.38,calTex, PX-0.116, FF+1.55, HZ-2.2, -Math.PI/2);
  const picTex=signTex(200,160,(c,W,H)=>{ c.fillStyle="#3a2a1a"; c.fillRect(0,0,W,H); c.fillStyle="#b8a890"; c.fillRect(14,14,W-28,H-28);
    c.fillStyle="#6a5a48"; c.fillRect(14,H*0.62,W-28,H*0.3);
    for(const [px,h] of [[0.30,0.55],[0.42,0.62],[0.55,0.45],[0.66,0.50]]){ c.fillStyle="#3a3028"; c.fillRect(W*px,H*(0.9-h),W*0.07,H*h-14); c.beginPath(); c.arc(W*px+W*0.035,H*(0.9-h),W*0.04,0,7); c.fill(); }
    c.fillStyle="#5a4a3a"; c.fillRect(W*0.75,H*0.72,W*0.1,H*0.08); });
  { const m=signPanel(0.36,0.29,picTex, x0+T2+0.012, FF+1.65, HZ-1.6, Math.PI/2); m.rotation.z=0.09; }
  addUse(PX-0.6, HZ-2.2, FF, "READ THE CALENDAR", ()=>toast("OCTOBER 1987, FROM THE FEED STORE. THE 15TH IS CROSSED OFF. NOTHING AFTER","#cfe0d4"), 1.1);
  addUse(x0+T2+0.7, HZ-1.6, FF, "LOOK AT THE PICTURE", ()=>toast("A FAMILY ON THIS PORCH, IN THEIR SUNDAY CLOTHES. NOBODY IS SMILING BUT THE DOG","#cfe0d4"), 1.1);
  // the kids have been in: a tag on the wall, cans, a candle stub on the sill
  { const tagTex=signTex(400,160,(c,W,H)=>{ c.clearRect(0,0,W,H); c.strokeStyle="rgba(40,90,200,0.85)"; c.lineWidth=10; c.lineCap="round";
      c.font="bold 84px Arial"; c.fillStyle="rgba(40,90,200,0.85)"; c.textAlign="center"; c.textBaseline="middle"; c.fillText("TY + JESS",W/2,H*0.45);
      c.fillStyle="rgba(200,40,40,0.8)"; c.font="bold 36px Arial"; c.fillText("GET OUT",W*0.7,H*0.85); });
    const m=new T.Mesh(new T.PlaneGeometry(1.4,0.56), new T.MeshStandardMaterial({map:tagTex, transparent:true, roughness:0.8, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(PX+0.116, FF+1.45, HZ-1.8); m.rotation.y=Math.PI/2; scene.add(m); HOUSE.tag=m;
    for(let k=0;k<5;k++){ const x=HX+1.4+r()*2.2, z=z0+0.6+r()*1.5; push("paintm", new T.CylinderGeometry(0.033,0.033,0.04,10), x, FF+0.022, z, r()*3, ["#c8202a","#b8bcc0","#2b5aa8"][k%3], Math.PI/2, 0.4); } }
  // the kitchen: the table on its side, a chair, the sink, a cabinet door hanging, the old fridge
  { const tx=HX+2.4, tz=HZ-0.95;
    push("beam", boxGeo(1.2, 0.05, 0.85, 0.6), tx, FF+0.43, tz, 0.2, "#8a6a48", 0, Math.PI/2);
    for(const [dx,dz] of [[-0.5,-0.35],[0.5,-0.35],[-0.5,0.35],[0.5,0.35]]){ const p=V3(dx,0,dz).applyAxisAngle(V3(0,1,0),0.2);
      tube("beam", V3(tx-0.02+p.x*0.05, FF+0.43+p.x*0.85, tz+p.z), V3(tx+0.68, FF+0.43+p.x*0.85, tz+p.z), 0.025, 5, "#7a5a3a"); }
    addCol(tx-0.6, tx+0.75, tz-0.55, tz+0.55, FF-0.5, FF+0.9);
    const cx=HX+3.4, cz=HZ+0.6; bx("paintm", 0.42, 0.04, 0.42, cx, FF+0.45, cz, 0, 0.5, "#8a6a48");
    for(const [dx,dz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]]) bx("paintm", 0.035, 0.45, 0.035, cx+dx, FF+0.225, cz+dz, 0, 0, "#7a5a3a");
    bx("paintm", 0.42, 0.5, 0.035, cx, FF+0.72, cz+0.2, 0, 0.5, "#7a5a3a");
    // the sink under the back window, and the cabinets
    bx("paintm", 1.6, 0.86, 0.58, HX-2.3, FF+0.43, z1-T2-0.30, 0, 0, "#8a8270");
    bx("porcelain", 0.80, 0.08, 0.50, HX-2.3, FF+0.90, z1-T2-0.30, 0, 0, "#d8d0bc");
    push("paintm", planeGeo(0.62,0.36,0), HX-2.3, FF+0.945, z1-T2-0.30, 0, "#5a5446", -Math.PI/2, 0);
    tube("chrome", V3(HX-2.3, FF+0.94, z1-T2-0.08), V3(HX-2.3, FF+1.12, z1-T2-0.14), 0.015, 6, "#9a9080");
    addCol(HX-3.1, HX-1.5, z1-T2-0.6, z1-T2, FF-0.5, FF+0.95);
    bx("paintm", 1.4, 0.7, 0.32, HX-2.3, FF+1.95, z1-T2-0.17, 0, 0, "#8a8270");
    push("paintm", boxGeo(0.45, 0.62, 0.02, 0), HX-2.95, FF+1.85, z1-T2-0.55, 0.9, "#8a8270", 0, 0.25);
    // the fridge: a rounded fifties one, the door open
    const fx=HX+3.75, fz=z1-T2-1.0;
    bx("paintm", 0.70, 1.55, 0.66, fx, FF+0.78, fz, 0, 0, "#d6d0bc");
    push("paintm", domeGeo(0.36, 0.12, 16), fx, FF+1.55, fz, 0, "#d6d0bc");
    push("paintm", boxGeo(0.70, 1.2, 0.06, 0), fx-0.62, FF+0.9, fz-0.55, 1.2, "#d6d0bc");
    push("paintm", planeGeo(0.6,1.1,0), fx-0.36, FF+0.85, fz, -Math.PI/2, "#3a3630");
    addCol(fx-0.36, fx+0.36, fz-0.34, fz+0.34, FF-0.5, FF+1.6);
    addUse(HX+2.6, HZ+0.9, FF, "OPEN THE DRAWER", ()=>toast("RECEIPTS FROM THE FEED STORE, A ROSARY, SEED PACKETS FOR 1988 THAT NOBODY PLANTED","#cfe0d4"), 1.2); }
  // inside the door, the hall: a coat still on its hook
  bx("paintm", 0.06, 0.06, 0.08, HX-0.9, FF+1.75, z0+T2+0.04, 0, 0, "#3a3028");
  push("paintm", boxGeo(0.44, 0.9, 0.08, 0), HX-0.9, FF+1.30, z0+T2+0.07, 0, "#4a3a2c", 0.04, 0);
  addUse(HX-0.1, z0-1.2, pY, "LOOK THROUGH THE DOOR", ()=>toast("IT SMELLS OF MOUSE AND OLD RAIN. THE FLOOR CREAKS BEFORE YOU STEP ON IT","#cfe0d4"), 1.4);

  /* ---- the yard ----------------------------------------------------------- */
  const gy=(x,z)=>Terrain.groundAt(x,z);
  // the well, fieldstone, its wooden cover half rotted away
  { const wx=HX-7.2, wz=HZ-6.8, y=gy(wx,wz);
    push("rock", new T.CylinderGeometry(0.72,0.78,0.72,14,1,true), wx, y+0.30, wz, 0, "#8d877b");
    push("rock", new T.CylinderGeometry(0.58,0.58,0.70,14,1,true), wx, y+0.30, wz, 0, "#6d685e");
    push("rock", new T.RingGeometry(0.58,0.74,14), wx, y+0.665, wz, 0, "#9a9488", -Math.PI/2, 0);
    push("paintm", new T.CircleGeometry(0.58,14), wx, y-0.2, wz, 0, "#050505", -Math.PI/2, 0);
    for(let k=0;k<3;k++) bx("beam", 0.2, 0.04, 1.5-k*0.25, wx-0.36+k*0.22, y+0.70, wz-0.1*k, 0.6, 0.1*k, "#6a5a44");
    for(const sd of [-1,1]) bx("beam", 0.09, 1.5, 0.09, wx+sd*0.85, y+0.75, wz, 0.6, 0, "#5a4a38");
    tube("metal", V3(wx-0.9, y+1.35, wz), V3(wx+0.9, y+1.35, wz), 0.04, 6, "#5a3a2a");
    addCol(wx-0.85, wx+0.85, wz-0.85, wz+0.85, y-0.5, y+0.7);
    addUse(wx, wz-1.2, y, "LOOK DOWN THE WELL", ()=>toast("YOU DROP A PEBBLE. IT TAKES A LONG TIME, AND THEN NOT A SPLASH","#cfe0d4"), 1.3); }
  // the pump by the back step
  { const px=HX+5.6, pz=HZ+4.6, y=gy(px,pz);
    bx("concrete", 0.9, 0.12, 0.9, px, y+0.06, pz, 0.5, 0.2, "#9a968c");
    tube("paintm", V3(px,y+0.1,pz), V3(px,y+1.0,pz), 0.05, 8, "#2c2a28");
    tube("paintm", V3(px,y+0.85,pz), V3(px+0.3,y+0.78,pz), 0.03, 6, "#2c2a28");
    tube("paintm", V3(px,y+1.0,pz), V3(px-0.55,y+1.25,pz), 0.02, 5, "#2c2a28");
    addCol(px-0.12, px+0.12, pz-0.12, pz+0.12, y-0.5, y+1.1);
    addUse(px-0.6, pz-0.5, y, "WORK THE PUMP", ()=>toast("IT SQUEALS. A COUPLE OF COUGHS OF RUST-COLOURED WATER, THEN NOTHING","#cfe0d4"), 1.2); }
  // the shed, down on its face: two corner posts still up, its tin roof lying across the rest
  { const sx=HX+9.6, sz=HZ+3.0, y=gy(sx,sz);
    for(const [dx,dz] of [[-1.4,-1.2],[-1.4,1.2]]){ bx("beam", 0.12, 1.9, 0.12, sx+dx, y+0.95, sz+dz, 0.6, 0, "#5a4a38"); addCol(sx+dx-0.08, sx+dx+0.08, sz+dz-0.08, sz+dz+0.08, y-0.5, y+1.9); }
    const g=new FaceGeo().slab([V3(sx-1.5,y+1.85,sz-1.4), V3(sx-1.5,y+1.85,sz+1.4), V3(sx+1.6,y+0.15,sz+1.6), V3(sx+1.6,y+0.15,sz-1.2)], 0.03, 0.6).geo();
    push("roofmetal", g, 0,0,0, 0, "#7a4a2a");
    for(let k=0;k<6;k++) push("beam", boxGeo(0.14, 0.03, 2.2, 0.6), sx-0.6+k*0.4, y+0.05+r()*0.1, sz+(r()-0.5)*0.8, r()*0.6, "#6a5a44");
    addCol(sx-1.5, sx+1.6, sz-1.4, sz+1.6, y-0.5, y+0.6); }
  // the swing set: rust, one seat on one chain
  { const sx=HX-8.4, sz=HZ+5.2, y=gy(sx,sz);
    for(const dx of [-1.3,1.3]) for(const dz of [-0.7,0.7]) tube("metal", V3(sx+dx,y,sz+dz), V3(sx+dx*0.95,y+2.1,sz), 0.035, 6, "#7a4a32");
    tube("metal", V3(sx-1.3,y+2.1,sz), V3(sx+1.3,y+2.1,sz), 0.04, 6, "#7a4a32");
    tube("metal", V3(sx-0.4,y+2.08,sz), V3(sx-0.4,y+0.55,sz), 0.006, 3, "#4a3a2a");
    push("paintm", boxGeo(0.45, 0.03, 0.16, 0), sx-0.42, y+0.48, sz, 0.1, "#2a2a2a", 0, 1.2);
    addCol(sx-1.4, sx+1.4, sz-0.8, sz+0.8, y-0.5, y+0.3); }
  // the mailbox at the end of the drive, its door down, a name still on it
  { const mx=HX+4.6, mz=HZ+13.2, y=gy(mx,mz);
    bx("beam", 0.1, 1.05, 0.1, mx, y+0.52, mz, 0.6, 0, "#5a4a38");
    bx("paintm", 0.2, 0.18, 0.46, mx, y+1.13, mz, 0, 0, "#6a6660"); push("paintm", new T.CylinderGeometry(0.1,0.1,0.46,10,1,false,0,Math.PI), mx, y+1.22, mz, 0, "#6a6660", Math.PI/2, Math.PI/2);
    push("paintm", boxGeo(0.2, 0.26, 0.02, 0), mx, y+1.02, mz-0.3, 0, "#6a6660", -1.2, 0);
    const nm=signTex(200,60,(c,W,H)=>{ c.fillStyle="#6a6660"; c.fillRect(0,0,W,H); c.fillStyle="#8e8a80"; fitText(c,"KOVALCHICK",W*0.9,H*0.6,W/2,H/2,"700"); });
    signPanel(0.30,0.09,nm, mx+0.105, y+1.13, mz, Math.PI/2);
    addCol(mx-0.08, mx+0.08, mz-0.08, mz+0.08, y-0.5, y+1.3);
    addUse(mx-0.6, mz, y, "READ THE MAILBOX", ()=>toast("KOVALCHICK. INSIDE, A WASPS' NEST AND A SEED CATALOGUE FROM 1988","#cfe0d4"), 1.1); }
  // the lilacs by the porch corners, the apple tree gone wild, the saplings coming in
  for(const [dx,dz,s] of [[-6.2,-4.2,1.5],[6.4,-4.6,1.3],[-6.0,2.6,1.2]]) FOREST.plant("shrub", HX+dx, HZ+dz, {scale:s, solid:true, color:"#5a7a3c", autumn:"#8a7a3a"});
  FOREST.plant("edge", HX-10.5, HZ-1.0, {scale:0.42, color:"#6a8a40", autumn:"#c9a02a"});
  for(let k=0;k<14;k++){
    const a=r()*Math.PI*2, d=7+r()*8, x=HX+Math.cos(a)*d, z=HZ+Math.sin(a)*d*1.15;
    if(Terrain.boxDist(HOMESTEAD.box,x,z)<2.5) continue;
    FOREST.plant(r()<0.65?"sapling":"shrub", x, z, {scale:0.5+r()*0.7, solid:false});
  }
  for(let k=0;k<26;k++){ const a=r()*Math.PI*2, d=11+r()*6, x=HX+Math.cos(a)*d, z=HZ+Math.sin(a)*d*1.15; FOREST.plant("fern", x, z, {scale:0.8+r()*0.6, solid:false}); }
  // a creak now and then while you are in it (20-audio)
  HOUSE.zone={x0:x0, x1:x1, z0:z0, z1:z1, y0:FF-0.6, y1:FF+6};
  for(const o of scene.children.slice(n0)) BACKWOODS.deep.push(o);
})();
