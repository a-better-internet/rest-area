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
   corner, the kitchen with the table on its side, and a boxed stair up the
   east wall, one tread cracked. Upstairs, off a hall with a runner down
   it: the big bedroom with the iron bed and a hole through the floor to
   the parlour, a sewing room, a child's room with the pencil marks still
   on the wall, a box room, and the bathroom with the clawfoot tub, open to
   the sky where the roof has gone. Out in the yard: the well, the pump, a
   shed lying on its face, the swing set, the lilacs, the mailbox at the
   end of the drive. The kids' flagging tape leads here from the fire.
   ---------------------------------------------------------------------- */
const HOUSE={};
// faded paper: a stripe and a sprig, gone brown at the seams; the room tints it
bucketOf("wallpaper", ()=>{
  const c=cvs(256,256), x=c.getContext("2d"), q=_trng(1951);
  x.fillStyle="#e8dfc8"; x.fillRect(0,0,256,256);
  for(let i=0;i<4;i++){ x.fillStyle="rgba(170,150,110,0.35)"; x.fillRect(i*64+26,0,12,256); x.fillStyle="rgba(140,120,90,0.18)"; x.fillRect(i*64+2,0,3,256); }
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){ const px=i*64+(j%2?32:0)+8, py=j*64+20;
    x.fillStyle="rgba(150,90,90,0.55)"; x.beginPath(); x.arc(px,py,5,0,7); x.fill(); x.arc(px+6,py+3,4,0,7); x.fill();
    x.strokeStyle="rgba(90,110,70,0.6)"; x.lineWidth=2; x.beginPath(); x.moveTo(px,py+4); x.quadraticCurveTo(px-6,py+14,px-2,py+22); x.stroke();
    x.fillStyle="rgba(90,110,70,0.5)"; x.beginPath(); x.ellipse(px-6,py+14,4,2,0.6,0,7); x.fill(); }
  for(let k=0;k<26;k++){ const g=x.createRadialGradient(0,0,0,0,0,1); const px=q()*256, py=q()*256, rr=10+q()*40;
    x.fillStyle="rgba(120,100,70,"+(0.04+q()*0.08).toFixed(2)+")"; x.beginPath(); x.arc(px,py,rr,0,7); x.fill(); }
  const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4;
  return new T.MeshStandardMaterial({map:t, roughness:0.92});
});
(function homestead(){
  const n0=scene.children.length;
  const HX=HOMESTEAD.x, HZ=HOMESTEAD.z, HY=HOMESTEAD.y;
  const FF=HY+0.72;                                     // the ground floor
  const W2=6.2, D2=4.6, x0=HX-W2, x1=HX+W2, z0=HZ-D2, z1=HZ+D2, T2=0.20;
  const EAVE=FF+5.45, RIDGE=FF+8.7;
  const CL=FF+2.6, UF=FF+2.86;                          // the ground floor's ceiling; the upstairs floor
  // the stair: up the east wall from a landing inside the front wall, thirteen risers to the hall
  const SX0=x1-T2-1.1, SX1=x1-T2, SZB=z0+T2+1.15, NRIS=13, RISE=(UF-FF)/NRIS, RUN=0.25,
        SZT=SZB+RUN*(NRIS-1), SZO=SZB+RUN*2;            // top of the flight; where the opening over it starts
  const SID="#8c877c", SID2="#7a756b", TRIM="#55524c", BARE="#635d54";
  const r=_trng(1987);
  Object.assign(HOUSE, {x0:x0, x1:x1, z0:z0, z1:z1, FF:FF, HY:HY, UF:UF, stair:{x0:SX0, x1:SX1, zb:SZB, zt:SZT, run:RUN}});
  // a rectangle less some holes in it, as a few rectangles
  const minus=(R, holes)=>{
    const xs=[R.x0,R.x1], zs=[R.z0,R.z1];
    for(const h of holes){ for(const v of [h.x0,h.x1]) if(v>R.x0 && v<R.x1) xs.push(v); for(const v of [h.z0,h.z1]) if(v>R.z0 && v<R.z1) zs.push(v); }
    xs.sort((a,b)=>a-b); zs.sort((a,b)=>a-b);
    const out=[];
    for(let j=0;j<zs.length-1;j++){ let cur=null;
      for(let i=0;i<xs.length-1;i++){
        const cx=(xs[i]+xs[i+1])/2, cz=(zs[j]+zs[j+1])/2;
        if(holes.some(h=>cx>h.x0 && cx<h.x1 && cz>h.z0 && cz<h.z1)){ cur=null; continue; }
        if(cur && cur.x1===xs[i]) cur.x1=xs[i+1]; else { cur={x0:xs[i], x1:xs[i+1], z0:zs[j], z1:zs[j+1]}; out.push(cur); }
      } }
    return out;
  };
  // the stone it stands on
  for(const [a,b,c,d] of [[x0,x1,z0,z0+0.3],[x0,x1,z1-0.3,z1],[x0,x0+0.3,z0+0.3,z1-0.3],[x1-0.3,x1,z0+0.3,z1-0.3]])   // (the ends between the sides, not over them)
    wallBox("rock", a, b, c, d, HY-0.6, FF, "#8d877b", 0.5, HY-0.6);
  // the ground floor, and the boards under it (seen through the holes)
  floorAt("beam", x0+T2, x1-T2, z0+T2, z1-T2, FF+0.004, "#7a6a54", 0.9);
  addFlat(x0+T2, x1-T2, z0+T2, z1-T2, FF);
  addZone(x0, x1, z0, z1, FF-0.6, FF+6, "THE OLD HOUSE", true);

  /* ---- the walls ------------------------------------------------------- */
  const DOOR={a:HX-0.55, b:HX+0.40, sill:FF-0.6, head:FF+2.12};
  const win=(a,b,lo)=>({a:a, b:b, sill:lo?FF+0.86:FF+3.45, head:lo?FF+2.14:FF+4.72});
  const FRONT=[DOOR, win(HX-4.4,HX-3.4,1), win(HX-2.4,HX-1.4,1), win(HX+2.2,HX+3.2,1),
               win(HX-4.6,HX-3.8,0), win(HX-2.2,HX-1.4,0), win(HX+0.2,HX+1.0,0), win(HX+2.6,HX+3.4,0)];
  const BDOOR={a:HX+4.2, b:HX+5.1, sill:FF-0.6, head:FF+2.08};
  const BACK=[BDOOR, win(HX+1.7,HX+2.5,1), win(HX-3.0,HX-2.0,1), win(HX-5.4,HX-4.6,1),
              win(HX-4.4,HX-3.6,0), win(HX-0.6,HX+0.2,0), win(HX+2.0,HX+2.8,0)];
  const WEST=[win(HZ-2.4,HZ-1.4,1), win(HZ+1.6,HZ+2.6,1), win(HZ-2.6,HZ-1.6,0), win(HZ+2.0,HZ+2.8,0)];
  const EAST=[win(HZ+1.2,HZ+2.2,1), win(HZ-2.4,HZ-1.6,0), win(HZ+2.0,HZ+2.8,0)];
  // each wall in two runs, a storey each, so a window over a door is its own opening
  const lo=L=>L.filter(o=>o.head<FF+2.6), hi=L=>L.filter(o=>o.sill>FF+2.6), MID=FF+2.6;
  // a patch of w by h centred at (along, y) on a wall, kept off its openings and their casings
  const clearOf=(L, along, w, y, h)=>!L.some(o=>along+w/2>o.a-0.16 && along-w/2<o.b+0.16 && y+h/2>o.sill-0.12 && y-h/2<o.head+0.12);
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
  // inside: plaster on the ground floor (lath showing where it is off), paper upstairs
  const lin=(axis,f,dir,a,b,open)=>{ (axis==="x"?lineX:lineZ)("plaster", f, dir, a, b, FF, CL, lo(open), "#9e927a", 0.5);
                                     (axis==="x"?lineX:lineZ)("wallpaper", f, dir, a, b, UF, EAVE-0.02, hi(open), "#b8ab92", 1.6); };
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
  ivy(x0-0.014, FF-0.6, HZ-3.6, -Math.PI/2, 1.6, 3.4);
  ivy(x0-0.014, FF-0.6, HZ+3.7, -Math.PI/2, 1.0, 5.2);
  ivy(x0+0.5, FF-0.6, z0-0.014, Math.PI, 1.1, 2.6);
  ivy(x1-0.6, FF-0.6, z1+0.014, 0, 1.4, 2.2);
  // the upstairs ceiling, and over the bathroom a hole in it under the hole in the roof
  const HB={x0:HX+2.4, x1:HX+3.4, z0:HZ+1.9, z1:HZ+2.9};
  for(const q of minus({x0:x0+T2, x1:x1-T2, z0:z0+T2, z1:z1-T2}, [HB])) ceilAt("plaster", q.x0, q.x1, q.z0, q.z1, EAVE-0.02, "#a39886", 0.5);
  // the attic over it: joists, the boards from above, lath hanging at the hole's edges
  for(const q of minus({x0:x0+T2, x1:x1-T2, z0:z0+T2, z1:z1-T2}, [HB])) floorAt("beam", q.x0, q.x1, q.z0, q.z1, EAVE+0.05, "#4a4032", 0.6);
  for(const z of [HB.z0-0.03, HB.z1+0.03]) bx("beam", HB.x1-HB.x0+0.5, 0.12, 0.05, (HB.x0+HB.x1)/2, EAVE+0.005, z, 0.6, 0, "#4a3e30");
  for(const x of [HB.x0-0.03, HB.x1+0.03]) bx("beam", 0.05, 0.10, HB.z1-HB.z0, x, EAVE+0.0, (HB.z0+HB.z1)/2, 0.6, 0, "#4a3e30");
  for(let k=0;k<6;k++){ const x=HB.x0+0.1+r()*(HB.x1-HB.x0-0.2), z=r()<0.5?HB.z0+0.02:HB.z1-0.02;
    push("beam", boxGeo(0.03, 0.26+r()*0.3, 0.008, 0.6), x, EAVE-0.15-r()*0.1, z, r()*0.4, "#8a7a62", (r()-0.5)*0.5, (r()-0.5)*0.4); }
  // rafters under the back slope, either side of the hole, seen from below
  { const under=z=>eY+(RIDGE-eY)*(z1+OHZ-z)/(z1+OHZ-HZ)-RT-0.07;
    for(let x=HB.x0-0.9; x<HB.x1+1.0; x+=0.6){ if(x>hb0-0.05 && x<hb1+0.05) continue;
      tube("beam", V3(x, under(z1-T2-0.02), z1-T2-0.02), V3(x, under(HZ+0.1), HZ+0.1), 0.045, 4, "#5a4a38"); } }

  /* ---- the chimney up the west gable, its top fallen in ------------------ */
  { const cx=x0-0.34, cz=HZ+0.2;
    wallBox("brick", cx-0.33, cx+0.33, cz-0.45, cz+0.45, HY-0.3, RIDGE+0.4, "#6a3c30", 0.8, HY-0.3);
    bx("brick", 0.55, 0.36, 0.40, cx+0.05, RIDGE+0.58, cz-0.18, 0.8, 0, "#6a3c30");
    // soot down the face of it, and white bloom where the water comes through
    for(let k=0;k<5;k++) push("paintm", planeGeo(0.3+r()*0.3, 0.6+r()*1.4, 0), cx-0.334-k*0.0018, FF+1+r()*6, cz-0.3+r()*0.6, -Math.PI/2, r()<0.6?"#3a2a24":"#9a8a80");
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
  for(const x of [x0+0.3, HX-2.2, HX+2.2, x1-0.3]) wallBox("rock", x-0.2, x+0.2, pz0+0.05, pz0+0.45, HY-0.3, pY-0.02, "#8d877b", 0.5, HY-0.3);
  // a skirt of lattice, mostly kicked in
  for(let k=0;k<16;k++){ if(r()<0.55) continue; push("paintm", boxGeo(0.70, 0.45, 0.02, 0), x0+0.4+k*0.75, HY+0.26, pz0+0.04+r()*0.1, 0, "#5a564e", (r()-0.5)*0.5, 0); }
  // the steps: two, the lower one split
  const sx0=HX-0.85, sx1=HX+0.75;
  bx("beam", sx1-sx0, 0.05, 0.32, (sx0+sx1)/2, HY+0.47, pz0-0.17, 0.6, 0, "#7a6a54");
  push("beam", boxGeo((sx1-sx0)/2, 0.05, 0.32, 0.6), sx0+(sx1-sx0)*0.25, HY+0.22, pz0-0.50, 0, "#7a6a54", 0.15, 0);
  push("beam", boxGeo((sx1-sx0)/2, 0.05, 0.32, 0.6), sx0+(sx1-sx0)*0.75, HY+0.20, pz0-0.50, 0, "#73644f", -0.05, 0.12);
  for(const x of [sx0+0.05, sx1-0.05]) push("beam", boxGeo(0.05, 0.55, 0.75, 0.6), x, HY+0.24, pz0-0.36, 0, "#6a5a44", -0.6, 0);
  addFlat(sx0, sx1, pz0-0.33, pz0, HY+0.49); addFlat(sx0, sx1, pz0-0.68, pz0-0.33, HY+0.24);
  // the posts: three standing; the corner one down in the grass
  const postY0=pY+0.02, roofAt=x=>x<x1-1.5 ? FF+2.48 : FF+2.48-(x-(x1-1.5))/1.7*0.62;
  for(const x of [x0+0.18, HX-2.2, HX+2.2]){ bx("paintm", 0.13, roofAt(x)-postY0, 0.13, x, (postY0+roofAt(x))/2, pz0+0.18, 0, 0, "#7d786e");
    addCol(x-0.08, x+0.08, pz0+0.1, pz0+0.26, pY-0.5, roofAt(x)); }
  push("paintm", boxGeo(0.13, 2.4, 0.13, 0), x1+0.6, HY+0.09, pz0-0.7, 0.4, "#8f8a7e", Math.PI/2, 0);
  // its roof: a shed off the wall, down to the beam over the posts, sagging at the east end
  { const xs=x1-1.4;
    push("roofmetal", new FaceGeo().slab([V3(x0-0.2,FF+2.95,z0), V3(xs,FF+2.95,z0), V3(xs,FF+2.46,pz0-0.2), V3(x0-0.2,FF+2.46,pz0-0.2)], 0.10, 0.6).geo(), 0,0,0, 0, "#6e665a");
    push("roofmetal", new FaceGeo().slab([V3(xs,FF+2.95,z0), V3(x1+0.2,FF+2.95,z0), V3(x1+0.2,FF+1.82,pz0-0.2), V3(xs,FF+2.46,pz0-0.2)], 0.10, 0.6).geo(), 0,0,0, 0, "#6e665a");
    tube("paintm", V3(x0+0.05,FF+2.42,pz0+0.18), V3(x1-1.395,FF+2.42,pz0+0.18), 0.07, 4, "#8f8a7e");   // (its end 5 mm past the roof's seam, not in it)
    tube("paintm", V3(x1-1.4,FF+2.42,pz0+0.18), V3(x1+0.1,FF+1.80,pz0+0.18), 0.07, 4, "#8f8a7e"); }
  // what is left of the rail: a few balusters and the top rail on the west side
  for(let k=0;k<14;k++){ if(r()<0.4) continue; bx("paintm", 0.04, 0.72, 0.04, x0+0.4+k*0.2, pY+0.38, pz0+0.06, 0, 0, "#7d786e"); }
  bx("paintm", 2.9, 0.06, 0.08, x0+1.75, pY+0.76, pz0+0.06, 0, 0, "#7d786e");
  addCol(x0, x0+3.2, pz0-0.02, pz0+0.12, pY-0.3, pY+0.8);
  // an old glider on the porch, rusted, one cushion
  { const gx=HX+3.8, gz=z0-0.75;
    for(const sd of [-1,1]) tube("metal", V3(gx+sd*0.7, pY, gz-0.25), V3(gx+sd*0.7, pY+0.85, gz+0.10), 0.02, 5, "#7a4a32");
    bx("paintm", 1.45, 0.05, 0.50, gx, pY+0.42, gz, 0, 0, "#7a4a32"); bx("paintm", 1.45, 0.45, 0.05, gx, pY+0.70, gz+0.25, 0, 0, "#7a4a32");
    bx("paintm", 0.62, 0.10, 0.46, gx-0.36, pY+0.50, gz, 0, 0, "#6a7a5a");
    addCol(gx-0.75, gx+0.75, gz-0.3, gz+0.3, pY-0.3, pY+0.9); }

  /* ---- inside ------------------------------------------------------------ */
  // the wall between the parlour and the kitchen, with its doorway
  const PX=HX+1.2, PD={a:HZ+0.0, b:HZ+1.2, sill:FF-0.6, head:FF+2.08}, PD2={a:HZ-3.7, b:HZ-2.7, sill:FF-0.6, head:FF+2.08};
  const inDoor=z=>(z>PD.a-0.25 && z<PD.b+0.25) || (z>PD2.a-0.25 && z<PD2.b+0.25);
  runZ("block", PX, 0.20, z0+T2, z1-T2, FF, FF+2.62, [PD, PD2], "#3e362c", 0.5);
  lineZ("plaster", PX-0.10, -1, z0+T2, z1-T2, FF, FF+2.6, [PD, PD2], "#9a8c72", 0.5);
  lineZ("plaster", PX+0.10, 1, z0+T2, z1-T2, FF, FF+2.6, [PD, PD2], "#958a74", 0.5);
  // wallpaper coming away in strips, lath showing behind the plaster
  for(let k=0;k<12;k++){ const onW=k%2, z=z0+0.5+r()*(z1-z0-1), y=FF+0.6+r()*1.7, h=0.3+r()*0.6, o=k*0.003;
    if(onW){ const w=0.18+r()*0.3; if(clearOf(WEST, z, w, y, h)) push("paintm", planeGeo(w, h, 0), x0+T2+0.012+o, y, z, Math.PI/2, "#6a5c48"); }
    else if(!inDoor(z)) push("paintm", planeGeo(0.12, h, 0), PX-0.112-o, y, z, -Math.PI/2, "#7a6a52", 0, (r()-0.5)*0.12); }
  // water stains down from the ceiling, and damp coming up the walls
  const _so=new Map();   // each stain on a wall a few mm proud of the last on it, so two that overlap never share a plane
  const stain=(x,z,ry,y,w,h,c)=>{ const key=ry.toFixed(2)+"|"+(Math.abs(Math.sin(ry))>0.5?x:z).toFixed(2), o=(_so.get(key)||0)+0.003; _so.set(key, o);
    push("paintm", new T.CircleGeometry(0.5,10).scale(w,h,1), x+Math.sin(ry)*o, y, z+Math.cos(ry)*o, ry, c); };
  for(let k=0;k<16;k++){ const side=(r()*4)|0, w=0.4+r()*0.9, h=0.5+r()*1.2, c=r()<0.6?"#6e604a":"#5a5444";
    const y=r()<0.5 ? FF+2.6-h*0.45 : FF+h*0.4;
    const xx=x0+0.4+r()*(x1-x0-0.8), zz=z0+0.5+r()*(z1-z0-1);
    if(side===0){ if(clearOf(FRONT, xx, w, y, h)) stain(xx, z0+T2+0.024, 0, y, w, h, c); }
    else if(side===1){ if(clearOf(BACK, xx, w, y, h)) stain(xx, z1-T2-0.024, Math.PI, y, w, h, c); }
    else if(side===2){ if(clearOf(WEST, zz, w, y, h)) stain(x0+T2+0.024, zz, Math.PI/2, y, w, h, c); }
    else { const zz=z0+0.5+r()*(z1-z0-1); if(!inDoor(zz-w/2) && !inDoor(zz+w/2)) stain(PX+0.114, zz, Math.PI/2, y, w, h, c); } }
  // dirt and leaves blown in across the floor
  // (one where it would lie over another is left out: flat on the floor, two cannot share a plane;
  //  the draws from r() are the same either way, so nothing after this moves)
  { const laid=[];
    for(let k=0;k<40;k++){ const x=x0+0.4+r()*(x1-x0-0.8), z=z0+0.4+r()*(z1-z0-0.8), rad=0.08+r()*0.35, dy=r()*0.002, col=["#4a3a28","#6a4a2a","#3e3428","#7a5a30"][(r()*4)|0];
      if(laid.some(q=>Math.hypot(q[0]-x, q[1]-z)<q[2]+rad)) continue;
      if(x+rad>HX+3.0 && x-rad<HX+3.7 && z+rad>HZ+2.6 && z-rad<HZ+3.4) continue;            // nor over the hole in the kitchen floor
      laid.push([x, z, rad]); push("paintm", new T.CircleGeometry(rad, 7), x, FF+0.007+dy, z, 0, col, -Math.PI/2, 0); } }
  // the ceiling, down in one corner of the parlour: joists showing, the rest on the floor
  const ch={x0:HX-2.6, x1:HX-1.0, z0:HZ-2.4, z1:HZ-0.9};
  const STW={x0:SX0, x1:SX1, z0:SZO, z1:SZT+0.03};           // the stairwell, open to the hall above
  // and through the upstairs floor too, a smaller hole, over the pile of it
  const FHU={x0:HX-2.3, x1:HX-1.3, z0:HZ-2.1, z1:HZ-1.25};
  for(const q of minus({x0:x0+T2, x1:x1-T2, z0:z0+T2, z1:z1-T2}, [ch, STW])) ceilAt("plaster", q.x0, q.x1, q.z0, q.z1, CL, "#b8b0a0", 0.5);
  for(let x=ch.x0+0.15; x<ch.x1; x+=0.4) bx("beam", 0.06, 0.20, ch.z1-ch.z0+0.3, x, FF+2.72, (ch.z0+ch.z1)/2, 0.6, 0, "#5a4a38");
  for(const q of minus(ch, [FHU])) ceilAt("beam", q.x0, q.x1, q.z0, q.z1, UF-0.03, "#2a2420", 0.6);
  // the ends of the boards round the hole up there, snapped off and hanging
  for(let k=0;k<9;k++){ const sd=k%3, along=r();
    const x=sd===0 ? FHU.x0+along*(FHU.x1-FHU.x0) : sd===1 ? FHU.x0+0.02 : FHU.x1-0.02,
          z=sd===0 ? (k%2?FHU.z0+0.03:FHU.z1-0.03) : FHU.z0+along*(FHU.z1-FHU.z0);
    push("beam", boxGeo(sd?0.24:0.12, 0.022, sd?0.12:0.22, 0.6), x, UF-0.06-r()*0.06, z, 0, "#6a5a44", (r()-0.5)*0.9, (r()-0.5)*0.9); }
  for(let k=0;k<16;k++){ const x=ch.x0+r()*(ch.x1-ch.x0), z=ch.z0+r()*(ch.z1-ch.z0);
    push("paintm", boxGeo(0.12+r()*0.3, 0.03, 0.10+r()*0.25, 0), x, FF+0.03+r()*0.04, z, r()*3, r()<0.5?"#cfc7b6":"#9a8a70", (r()-0.5)*0.3, (r()-0.5)*0.3); }
  for(let k=0;k<6;k++) tube("beam", V3(ch.x0+r()*1.4, FF+0.03, ch.z0+r()*1.5), V3(ch.x0+r()*1.4, FF+0.05+r()*0.4, ch.z0+r()*1.5), 0.012, 3, "#7a6a54");
  // a hole in the kitchen floor: the boards gone, dark under
  const fh={x0:HX+3.0, x1:HX+3.7, z0:HZ+2.6, z1:HZ+3.4};
  push("paintm", planeGeo(fh.x1-fh.x0, fh.z1-fh.z0, 0), (fh.x0+fh.x1)/2, FF+0.008, (fh.z0+fh.z1)/2, 0, "#0c0a08", -Math.PI/2, 0);
  for(const z of [fh.z0, fh.z1]) push("beam", boxGeo(fh.x1-fh.x0+0.1, 0.03, 0.06, 0.6), (fh.x0+fh.x1)/2, FF+0.012, z, 0, "#5a4a38", 0, z===fh.z0?0.1:-0.08);
  addCol(fh.x0, fh.x1, fh.z0, fh.z1, FF-0.6, FF+0.25);
  /* the stair: boxed in against the east wall, open for its first four steps
     on the kitchen side, a newel there, a rail on the wall the rest of the
     way. Thirteen risers; the eighth tread is split down its length and
     sags, and you keep to the wall side of it. A ramp under it all for
     your feet (06-collision), the treads for your eyes. */
  { const W=SX1-SX0, cx=(SX0+SX1)/2;
    for(let k=0;k<NRIS-1;k++){
      const ty=FF+RISE*(k+1), za=SZB+RUN*k, col=k%3?"#7a6a54":"#73634e";
      if(k===7){                                       // the cracked one
        push("beam", boxGeo(W/2-0.05, 0.035, RUN+0.03, 0.6), SX0+0.03+(W/2-0.05)/2, ty-0.03, za+RUN/2-0.015, 0, "#6e5e48", 0, -0.07);
        push("beam", boxGeo(W/2-0.05, 0.035, RUN+0.03, 0.6), SX1-0.03-(W/2-0.05)/2, ty-0.026, za+RUN/2-0.015, 0, "#6a5a44", 0, 0.05);
      }else bx("beam", W-0.06, 0.035, RUN+0.03, cx, ty-0.0175, za+RUN/2-0.015, 0.6, 0, col);
      bx("beam", W-0.07, RISE-0.036, 0.02, cx, FF+RISE*k+(RISE-0.036)/2, za+0.012, 0.6, 0, "#5e5040");
    }
    bx("beam", W-0.07, RISE-0.012, 0.02, cx, FF+RISE*(NRIS-1)+(RISE-0.012)/2-0.004, SZT+0.012, 0.6, 0, "#5e5040");
    // stringers both sides, along the line of the nosings
    const ang=Math.atan2(UF-FF, SZT-SZB+RUN), L=Math.hypot(SZT-SZB+RUN+0.3, UF-FF+0.25);
    for(const x of [SX0+0.025, SX1-0.025])
      push("beam", boxGeo(0.04, 0.26, L, 0.6), x, (FF+UF)/2+RISE-0.11, (SZB+SZT)/2-0.02, 0, "#5a4a38", -ang, 0);
    // the newel at the foot, its cap; the short rail to the wall; two balusters
    bx("beam", 0.10, 1.12, 0.10, SX0+0.05, FF+0.56, SZB+0.03, 0.6, 0, "#5a4836");
    push("beam", new T.SphereGeometry(0.065,10,8), SX0+0.05, FF+1.17, SZB+0.03, 0, "#5a4836");
    tube("beam", V3(SX0+0.05, FF+1.02, SZB+0.03), V3(SX0+0.05, FF+RISE*4+0.86, SZB+0.98), 0.028, 6, "#5a4836");
    for(const k of [1,2,3]){ const z=SZB+RUN*k-0.03; tube("beam", V3(SX0+0.05, FF+RISE*(k+1), z), V3(SX0+0.05, FF+RISE*(k+1)+0.84, z), 0.016, 5, "#6a5642"); }
    addCol(SX0, SX0+0.10, SZB-0.02, SZB+0.08, FF-0.5, FF+1.2);
    // the rail up the wall of the stairwell, on brackets
    tube("beam", V3(SX0+0.065, FF+RISE*4+0.88, SZB+0.98), V3(SX0+0.065, UF+0.88, SZT+0.05), 0.026, 6, "#5a4836");
    for(let k=4;k<NRIS;k+=3){ const z=SZB+RUN*k, y=FF+RISE*(k+1)+0.84; bx("metal", 0.07, 0.03, 0.03, SX0+0.035, y, z, 0.5, 0, "#3a3430"); }
    // the wall that boxes it in, kitchen side (open for the first two steps), then all the way up
    runZ("plaster", SX0-0.05, 0.10, SZB+0.95, SZT, FF, UF-0.004, [], "#958a74", 0.5);       // its top just under the floorboards it meets
    // the landing at its foot: you come into it from the kitchen and turn up the stair
    addZone(SX0, SX1, z0+T2, SZB, FF-0.3, FF+2.4, "THE FOOT OF THE STAIRS", true);
    runZ("wallpaper", SX0-0.05, 0.112, z0+T2, SZT+0.025, UF, EAVE-0.02, [], "#a89c84", 1.6);
    bx("plaster", 0.094, UF-0.004-CL, SZB+0.95-(z0+T2)-0.006, SX0-0.05, (CL+UF-0.004)/2, (z0+T2+SZB+0.95)/2+0.003, 0.5, 0, "#958a74");
    addCol(SX0-0.10, SX0, z0+T2, SZB+0.95, CL-0.02, UF);      // over your head as you step on: solid only where it is
    bx("paintm", 0.13, CL-FF, 0.04, SX0-0.05, (FF+CL)/2, SZB+0.945, 0, 0, TRIM);
    // under the landing, the end of the closet under the stair: boards, a little door
    for(let x=SX0+0.06, k=0; x<SX1-0.02; x+=0.13, k++) bx("beam", 0.12, UF-0.30-FF, 0.025, x, (FF+UF-0.30)/2, SZT+0.035+(k%2)*0.005, 0.6, 0, x%0.26<0.13?"#6a5a46":"#625240");   // (every other board set back, so neighbours' faces are not one plane)
    bx("paintm", 0.62, 1.30, 0.035, SX0+0.50, FF+0.67, SZT+0.06, 0, 0, "#5a5048");
    push("chrome", new T.SphereGeometry(0.025,8,6), SX0+0.25, FF+0.75, SZT+0.085, 0, "#8a7a5a");
    addCol(SX0, SX1, SZT, SZT+0.07, FF-0.5, FF+2.45);
    addUse(SX0+0.5, SZT+0.75, FF, "OPEN THE CLOSET UNDER THE STAIRS", ()=>toast("A BROOM, A BOX OF MASON JARS, GALOSHES. A CHILD'S HANDPRINT IN PAINT ON THE INSIDE OF THE DOOR","#cfe0d4"), 0.9);
    // the edge of the hall floor over the stair, at the top
    bx("beam", W, UF-CL, 0.05, cx, (CL+UF)/2, SZO-0.025, 0.6, 0, "#4e4234");
    // for your feet: one ramp from the floor to the hall
    addRamp(SX0+0.01, SX1-0.01, SZB-0.04, SZT+0.002, "z", SZB, SZT, FF+0.02, UF);
  }
  /* ---- upstairs ------------------------------------------------------------
     A hall across the middle from the stairhead; the two big rooms in
     front, the child's room, the box room and the bathroom behind. */
  { const IN={x0:x0+T2, x1:x1-T2, z0:z0+T2, z1:z1-T2};
    // the floor: boards, and under the bit over the stair's foot nothing you can reach
    for(const q of minus(IN, [{x0:SX0-0.10, x1:SX1, z0:z0+T2, z1:SZT}, FHU])){ floorAt("beam", q.x0, q.x1, q.z0, q.z1, UF+0.004, "#6e5e48", 0.9); addFlat(q.x0, q.x1, q.z0, q.z1, UF); }
    // a ring you cannot step through round the hole in the bedroom floor
    addCol(FHU.x0-0.03, FHU.x1+0.03, FHU.z0-0.03, FHU.z1+0.03, UF-0.2, UF+0.45);
    addZone(x0, x1, z0, z1, UF-0.4, EAVE, "THE OLD HOUSE · UPSTAIRS", true);
    // the hall is just past the stairhead; the front rooms are deep, the back ones less so
    const HS=SZT+0.015, HN=HS+1.2, PW=HX-0.8, PE=HX+1.0, PK=HX-1.6, t=0.10, DH=UF+2.02;
    const dr=(a,b)=>({a:a, b:b, sill:UF-0.6, head:DH});
    const D_BED=dr(HX-3.4,HX-2.5), D_SEW=dr(HX+1.0,HX+1.9), D_KID=dr(HX-3.4,HX-2.5), D_BOX=dr(HX-0.7,HX+0.2), D_BATH=dr(HX+1.6,HX+2.5);
    // the walls: the hall's two sides, the cross walls front and back
    runX("wallpaper", HS+t/2, t, x0+T2, SX0-0.10, UF, EAVE-0.02, [D_BED, D_SEW], "#b4a68a", 1.6);
    runX("wallpaper", HN+t/2, t, x0+T2, x1-T2, UF, EAVE-0.02, [D_KID, D_BOX, D_BATH], "#b4a68a", 1.6);
    runZ("wallpaper", PW, t, z0+T2, HS, UF, EAVE-0.02, [], "#bba98c", 1.6);
    runZ("wallpaper", PK, t, HN+t, z1-T2, UF, EAVE-0.02, [], "#9fb2c4", 1.6);
    runZ("plaster", PE, t, HN+t, z1-T2, UF, EAVE-0.02, [], "#a9b8a2", 0.5);
    // the bathroom is painted, not papered: its own face on the walls it has
    lineX("plaster", HN+t, 1, PE+t/2, x1-T2, UF, EAVE-0.02, [D_BATH], "#a9b8a2", 0.5, 0.006);
    lineZ("plaster", x1-T2, -1, HN+t, z1-T2, UF, EAVE-0.02, [EAST[2]], "#a9b8a2", 0.5, 0.010);
    lineX("plaster", z1-T2, -1, PE+t/2, x1-T2, UF, EAVE-0.02, hi(BACK).filter(o=>o.b>PE), "#a9b8a2", 0.5, 0.010);
    // door trim and the leaves: standing open, one off its hinges
    const trimX=(c,o)=>{ bx("paintm", 0.07, DH-UF-0.002, t+0.04, o.a-0.031, (UF+DH)/2-0.001, c, 0, 0, TRIM); bx("paintm", 0.07, DH-UF-0.002, t+0.04, o.b+0.031, (UF+DH)/2-0.001, c, 0, 0, TRIM);
      bx("paintm", o.b-o.a+0.16, 0.08, t+0.056, (o.a+o.b)/2, DH+0.04, c, 0, 0, TRIM); };   // (the head 8 mm proud of the posts each side)
    for(const o of [D_BED,D_SEW]) trimX(HS+t/2, o);
    for(const o of [D_KID,D_BOX,D_BATH]) trimX(HN+t/2, o);
    const leaf=(hx,hz,ang,c)=>push("paintm", boxGeo(0.78, 1.98, 0.04, 0), hx+Math.cos(ang)*0.39, UF+1.0, hz-Math.sin(ang)*0.39, ang, c);
    // swung back nearly to the wall, the way a door is left in an empty house
    leaf(D_BED.a+0.03, HS-0.03, Math.PI-0.30, "#6a5a48"); leaf(D_SEW.b-0.03, HS-0.03, 0.30, "#6a5a48");
    leaf(D_KID.a+0.03, HN+t+0.03, -(Math.PI-0.30), "#7a8a96"); leaf(D_BOX.b-0.03, HN+t+0.03, -0.66, "#6a5a48");
    push("paintm", boxGeo(0.76, 1.96, 0.04, 0), D_BATH.b+0.48, UF+0.98, HN+t+0.25, 0.04, "#6a5a48", 0.22, 0);    // the bathroom's, off its hinges and leant on the wall
    addCol(D_BATH.b+0.09, D_BATH.b+0.87, HN+t, HN+t+0.48, UF-0.3, UF+1.9);
    // wallpaper coming away, water down it, the damp
    // (one that would lie over another on the same wall is left out: flat on the wall, they would share its plane)
    const _laid=[[],[],[],[]], put=(sd, along, y, w, h, ...a)=>{
      if(_laid[sd].some(q=>Math.abs(q[0]-along)<(q[2]+w)/2+0.02 && Math.abs(q[1]-y)<(q[3]+h)/2+0.02)) return;
      _laid[sd].push([along, y, w, h]); push(...a); };
    for(let k=0;k<18;k++){ const w=0.15+r()*0.35, h=0.4+r()*1.2, y=UF+0.3+r()*1.6, o=0.016;
      const side=(r()*4)|0;
      if(side===0){ const zz=z0+0.5+r()*(z1-z0-1), c=r()<0.5?"#8a7a62":"#6a5c48";
        if(clearOf(WEST, zz, w, y, h)) put(0, zz, y, w, h, "paintm", planeGeo(w,h,0), x0+T2+o, y, zz, Math.PI/2, c, 0, (r()-0.5)*0.15); }
      else if(side===1){ const xx=HX-5.5+r()*5; if(!(xx>D_BED.a-0.3 && xx<D_BED.b+0.3)) put(1, xx, y, w, h, "paintm", planeGeo(w,h,0), xx, y, HS+t+o-0.008, 0, r()<0.5?"#8a7a62":"#6a5c48", 0, (r()-0.5)*0.15); }
      else if(side===2){ const xx=HX-5.5+r()*4.5; if(!(xx>D_KID.a-0.3 && xx<D_KID.b+0.3) && !(xx>D_BOX.a-0.3 && xx<D_BOX.b+0.3)) put(2, xx, y, w, h, "paintm", planeGeo(w,h,0), xx, y, HN-o+0.008, Math.PI, "#7a6a52", 0, (r()-0.5)*0.15); }
      else { const xx=HX-5.8+r()*5; if(clearOf(FRONT, xx, w, y, h)) put(3, xx, y, w, h, "paintm", planeGeo(w,h,0), xx, y, z0+T2+o, 0, "#6e604a", 0, (r()-0.5)*0.15); } }
    // the hall: a runner down it, a little table, a picture down on the floor, the hatch to the attic
    push("paintm", planeGeo(9.0, 0.62, 0), HX-0.6, UF+0.008, (HS+HN+t)/2, 0, "#6a3a32", -Math.PI/2, 0);
    push("paintm", planeGeo(8.8, 0.46, 0), HX-0.6, UF+0.010, (HS+HN+t)/2, 0, "#7e4a3c", -Math.PI/2, 0);
    { const tx=x0+T2+0.30, tz=(HS+HN+t)/2;
      bx("beam", 0.40, 0.03, 0.55, tx, UF+0.74, tz, 0.6, 0, "#6a4a32");
      for(const [dx,dz] of [[-0.16,-0.22],[0.16,-0.22],[-0.16,0.22],[0.16,0.22]]) bx("beam", 0.03, 0.73, 0.03, tx+dx, UF+0.365, tz+dz, 0.6, 0, "#5a3e2a");
      push("glass", new T.CylinderGeometry(0.05,0.07,0.16,10,1,true), tx, UF+0.86, tz, 0, "#dfe6e2");
      push("paintm", new T.CylinderGeometry(0.08,0.09,0.07,12), tx, UF+0.79, tz, 0, "#7a6a3a");
      addCol(tx-0.24, tx+0.24, tz-0.3, tz+0.3, UF-0.3, UF+0.9); }
    push("paintm", boxGeo(0.46, 0.36, 0.03, 0), HX-1.0, UF+0.04, HN-0.30, 0.4, "#3a2a1a", -Math.PI/2+0.08, 0);
    const AH={x0:HX+0.4, x1:HX+1.2, z0:HS+0.22, z1:HN-0.12};
    bx("paintm", AH.x1-AH.x0, 0.03, AH.z1-AH.z0, (AH.x0+AH.x1)/2, EAVE-0.05, (AH.z0+AH.z1)/2, 0, 0, "#7a7060");
    tube("paintm", V3((AH.x0+AH.x1)/2, EAVE-0.06, AH.z1-0.08), V3((AH.x0+AH.x1)/2, UF+1.85, AH.z1-0.08), 0.004, 3, "#d8d0c0");
    push("paintm", new T.SphereGeometry(0.02,6,5), (AH.x0+AH.x1)/2, UF+1.84, AH.z1-0.08, 0, "#c8b890");
    addUse((AH.x0+AH.x1)/2, (AH.z0+AH.z1)/2, UF, "PULL THE ATTIC CORD", ()=>{ toast("IT DOESN'T COME DOWN. OVER YOUR HEAD SOMETHING ROLLS ACROSS THE BOARDS AND STOPS","#cfe0d4");
      if(typeof AUDIO!=="undefined") AUDIO.creak(); }, 0.9);
    { const tg=signTex(420,140,(c,W,H)=>{ c.clearRect(0,0,W,H); c.fillStyle="rgba(30,30,30,0.85)"; c.font="bold 54px Arial"; c.textAlign="center"; c.textBaseline="middle";
        c.fillText("DONT GO IN",W/2,H*0.30); c.fillText("THE ATTIC",W/2,H*0.74); });
      const m=new T.Mesh(new T.PlaneGeometry(0.84,0.28), new T.MeshStandardMaterial({map:tg, transparent:true, roughness:0.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      m.position.set(HX+0.8, UF+1.55, HN-0.004); m.rotation.y=Math.PI; scene.add(m); }

    /* the big bedroom: the iron bed, the dresser and its glass, a rocker, a suitcase */
    { const bx0=x0+T2, bx1=x0+T2+1.95, bz0=z0+T2+0.35, bz1=bz0+1.4, my=UF+0.50;
      for(const [x,h] of [[bx0+0.06,1.25],[bx1-0.04,0.85]]){
        for(const z of [bz0+0.03,bz1-0.03]) tube("metal", V3(x,UF,z), V3(x,UF+h,z), 0.022, 6, "#2e2a28");
        for(const y of [h-0.04, h*0.55, 0.30]) tube("metal", V3(x,UF+y,bz0+0.03), V3(x,UF+y,bz1-0.03), 0.014, 5, "#2e2a28");
        for(let k=1;k<6;k++){ const z=bz0+(bz1-bz0)*k/6; tube("metal", V3(x,UF+0.30,z), V3(x,UF+h-0.04,z), 0.008, 4, "#3a3430"); } }
      for(const z of [bz0+0.05,bz1-0.05]) tube("metal", V3(bx0+0.06,UF+0.32,z), V3(bx1-0.04,UF+0.32,z), 0.018, 5, "#2e2a28");
      bx("paintm", bx1-bx0-0.18, 0.20, bz1-bz0-0.10, (bx0+bx1)/2, my-0.08, (bz0+bz1)/2, 0, 0, "#b4a688");
      push("paintm", new T.CircleGeometry(0.32,10), (bx0+bx1)/2+0.2, my+0.022, (bz0+bz1)/2-0.1, 0, "#8a7656", -Math.PI/2, 0);
      // a quilt half off it onto the floor
      push("paintm", boxGeo(1.2, 0.03, 0.9, 0), (bx0+bx1)/2+0.15, my+0.04, bz1-0.40, 0, "#8a4a42", 0.0, 0);
      push("paintm", boxGeo(1.2, 0.03, 0.55, 0), (bx0+bx1)/2+0.15, UF+0.26, bz1+0.06, 0, "#7a4038", -1.3, 0);
      push("paintm", boxGeo(1.25, 0.03, 0.45, 0), (bx0+bx1)/2+0.18, UF+0.02, bz1+0.38, 0, "#8a4a42", 0.06, 0);
      addCol(bx0, bx1, bz0, bz1, UF-0.3, UF+0.8);
      // the dresser against the cross wall, a mirror over it, cracked
      const dx=PW-t/2-0.25, dz=z0+T2+1.6;
      bx("beam", 0.48, 0.86, 1.10, dx, UF+0.43, dz, 0.6, 0, "#5e4430");
      for(let k=0;k<3;k++){ bx("beam", 0.02, 0.22, 1.00, dx-0.245, UF+0.17+k*0.26, dz, 0.6, 0, "#6a4e36");
        for(const s2 of [-0.25,0.25]) bx("chrome", 0.03, 0.03, 0.08, dx-0.265, UF+0.17+k*0.26, dz+s2, 0.4, 0, "#8a7a5a"); }
      push("beam", boxGeo(0.04, 0.03, 0.9, 0.6), dx-0.33, UF+0.38, dz, 0, "#6a4e36", 0, 0.5);                  // a drawer pulled and left
      bx("beam", 0.05, 0.85, 0.80, dx+0.10, UF+1.32, dz, 0.6, 0, "#5e4430");
      push("mirror", planeGeo(0.66, 0.70, 0), dx+0.062, UF+1.32, dz, -Math.PI/2, "#ffffff");
      for(let k=0;k<5;k++){ const a=r()*Math.PI, L=0.15+r()*0.25; push("paintm", boxGeo(0.002, 0.006, L, 0), dx+0.059-k*0.002, UF+1.32+Math.cos(a)*L/2-0.1, dz+Math.sin(a)*0.1, 0, "#1a1a1a", a, 0); }
      addCol(dx-0.26, dx+0.25, dz-0.56, dz+0.56, UF-0.3, UF+1.8);
      addUse(dx-0.75, dz, UF, "OPEN THE DRESSER", ()=>toast("MOTHBALLS. A MAN'S SUNDAY SHIRT, FOLDED. A WEDDING PICTURE, 1951, THE GLASS CRACKED ACROSS THE BRIDE","#cfe0d4"), 1.0);
      // the rocker by the window, the suitcase open on the floor, clothes
      { const cx=HX-2.6, cz=z0+T2+0.9, a=0.6;
        for(const sd of [-1,1]){ const ox=Math.cos(a)*sd*0.22, oz=-Math.sin(a)*sd*0.22;
          tube("beam", V3(cx+ox-Math.sin(a)*0.35, UF+0.03, cz+oz-Math.cos(a)*0.35), V3(cx+ox+Math.sin(a)*0.35, UF+0.08, cz+oz+Math.cos(a)*0.35), 0.02, 5, "#5a3e2a");
          tube("beam", V3(cx+ox, UF+0.05, cz+oz), V3(cx+ox+Math.sin(a)*0.05, UF+0.95, cz+oz+Math.cos(a)*0.28), 0.018, 5, "#5a3e2a"); }
        push("beam", boxGeo(0.46, 0.04, 0.44, 0.6), cx, UF+0.42, cz, a, "#6a4a32");
        push("beam", boxGeo(0.44, 0.50, 0.03, 0.6), cx+Math.sin(a)*0.22, UF+0.72, cz+Math.cos(a)*0.22, a, "#6a4a32", -0.2, 0);
        addCol(cx-0.35, cx+0.35, cz-0.35, cz+0.35, UF-0.3, UF+1.0); }
      { const sx=HX-4.0, sz=HZ-1.2;
        bx("paintm", 0.62, 0.16, 0.42, sx, UF+0.08, sz, 0, 0.3, "#5a4a3a");
        push("paintm", boxGeo(0.62, 0.42, 0.04, 0), sx+0.06, UF+0.20, sz+0.27, 0.3, "#5a4a3a", -1.9, 0);
        for(let k=0;k<4;k++) push("paintm", boxGeo(0.3+r()*0.3, 0.02, 0.2+r()*0.3, 0), sx-0.6+r()*1.2, UF+0.02+k*0.004, sz-0.2+r()*0.6, r()*3, ["#6a6a7a","#9a8a6a","#5a3a3a","#c8c0b0"][k]);
        addCol(sx-0.36, sx+0.36, sz-0.32, sz+0.32, UF-0.3, UF+0.3); }
    }
    /* the sewing room: the treadle machine under the window, a dress form, the trunk of letters */
    { const mx=HX+0.6, mz=z0+T2+0.30;
      bx("beam", 0.92, 0.04, 0.46, mx, UF+0.76, mz, 0.6, 0, "#5a3e2a");
      bx("beam", 0.30, 0.40, 0.42, mx+0.28, UF+0.54, mz, 0.6, 0, "#5a3e2a");
      for(const sd of [-1,1]){ push("metal", boxGeo(0.04, 0.70, 0.40, 0.5), mx+sd*0.40, UF+0.38, mz, 0, "#1e1c1a");
        push("metal", new T.TorusGeometry(0.16,0.015,5,16), mx+sd*0.40, UF+0.30, mz, 0, "#1e1c1a", 0, Math.PI/2); }
      bx("metal", 0.80, 0.03, 0.30, mx, UF+0.10, mz, 0.5, 0, "#1e1c1a");
      // the head of it: black, the gold gone dull
      bx("paintm", 0.42, 0.13, 0.16, mx-0.05, UF+0.85, mz, 0, 0, "#141414");
      bx("paintm", 0.10, 0.28, 0.14, mx+0.16, UF+0.98, mz, 0, 0, "#141414");
      bx("paintm", 0.34, 0.09, 0.12, mx, UF+1.08, mz, 0, 0, "#141414");
      push("chrome", new T.CylinderGeometry(0.05,0.05,0.03,14), mx+0.24, UF+1.02, mz, 0, "#8a8070", 0, Math.PI/2);
      addCol(mx-0.48, mx+0.48, mz-0.26, mz+0.26, UF-0.3, UF+1.1);
      // the dress form, in the middle of the room, facing the door
      const fx=HX+1.6, fz=HZ-1.6;
      // a torso on a turned post: the bust, a waist, the hips, a cap where the neck would be
      const sc=(sx,sy,sz)=>bucketOf("paintm").entries[bucketOf("paintm").entries.length-1].matrix.scale(V3(sx,sy,sz));
      push("paintm", new T.SphereGeometry(0.5,16,12), fx, UF+1.36, fz, 0.4, "#c8b89a"); sc(0.36,0.30,0.24);
      push("paintm", new T.CylinderGeometry(0.135,0.115,0.26,16), fx, UF+1.17, fz, 0.4, "#c8b89a"); sc(1,1,0.78);
      push("paintm", new T.CylinderGeometry(0.115,0.165,0.20,16), fx, UF+0.97, fz, 0.4, "#c8b89a"); sc(1,1,0.80);
      push("paintm", new T.SphereGeometry(0.5,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2), fx, UF+0.875, fz, 0.4, "#b8a88a"); sc(0.33,0.10,0.27);
      push("paintm", new T.CylinderGeometry(0.045,0.06,0.07,12), fx, UF+1.53, fz, 0, "#b8a88a");
      push("paintm", new T.CylinderGeometry(0.02,0.02,0.012,8), fx, UF+1.572, fz, 0, "#5a4a3a");
      tube("metal", V3(fx,UF+0.10,fz), V3(fx,UF+0.88,fz), 0.015, 6, "#2a2826");
      for(let k=0;k<3;k++){ const a=k*2.094; tube("metal", V3(fx,UF+0.12,fz), V3(fx+Math.cos(a)*0.28,UF+0.01,fz+Math.sin(a)*0.28), 0.012, 5, "#2a2826"); }
      addCol(fx-0.22, fx+0.22, fz-0.22, fz+0.22, UF-0.3, UF+1.6);
      // the trunk, lid up, letters in it and out of it
      const kx=HX+1.95, kz=z0+T2+0.40;
      bx("beam", 0.95, 0.52, 0.55, kx, UF+0.26, kz, 0.6, 0, "#4a3426");
      for(const y of [0.10,0.42]) bx("metal", 0.97, 0.04, 0.57, kx, UF+y, kz, 0.5, 0, "#6a5a3a");
      push("beam", boxGeo(0.95, 0.06, 0.55, 0.6), kx, UF+0.70, kz-0.30, 0, "#4a3426", 1.25, 0);
      for(let k=0;k<7;k++) push("paintm", boxGeo(0.16, 0.003, 0.11, 0), kx-0.6+r()*1.4, UF+0.008+k*0.004, kz+0.3+r()*0.8, r()*3, r()<0.5?"#e6dcc4":"#d8ccb0");   // (each a few mm over the last)
      push("paintm", boxGeo(0.80, 0.05, 0.42, 0), kx, UF+0.50, kz, 0, "#d8ccb0");
      addCol(kx-0.5, kx+0.5, kz-0.3, kz+0.3, UF-0.3, UF+0.6);
      addUse(kx, kz+0.75, UF, "READ THE LETTERS", ()=>toast("FROM A SON IN THE ARMY, 1969 TO 1971. THE LAST ONE SAYS HE'LL BE HOME FOR THE HAYING","#cfe0d4"), 1.0);
      // boxes against the stairwell wall
      for(const [z,y,s2] of [[HZ-2.6,0.2,0.4],[HZ-2.0,0.2,0.4],[HZ-2.3,0.6,0.36]]){ bx("paintm", s2, s2, s2+0.1, SX0-0.10-s2/2-0.03, UF+y, z, 0, 0, "#8a7a5a"); }
      addCol(SX0-0.58, SX0-0.10, HZ-2.85, HZ-1.75, UF-0.3, UF+0.8);
    }
    /* the child's room: a small bed and the bear on it, the rocking horse, the toy box, the marks by the door */
    { const bx0=x0+T2+0.03, bx1=x0+T2+1.5, bz0=z1-T2-1.2, bz1=z1-T2-0.03;
      bx("beam", bx1-bx0, 0.30, bz1-bz0, (bx0+bx1)/2, UF+0.15, (bz0+bz1)/2, 0.6, 0, "#7a6a54");
      bx("paintm", bx1-bx0-0.06, 0.12, bz1-bz0-0.06, (bx0+bx1)/2, UF+0.36, (bz0+bz1)/2, 0, 0, "#c0b8a0");
      bx("beam", 0.05, 0.75, bz1-bz0, bx0+0.012, UF+0.375, (bz0+bz1)/2, 0.6, 0, "#7a6a54");
      push("paintm", boxGeo(0.7, 0.03, 0.8, 0), bx0+0.95, UF+0.44, (bz0+bz1)/2, 0, "#7a96b0");
      // the bear, slumped against the headboard
      { const tx=bx0+0.22, ty=UF+0.52, tz=(bz0+bz1)/2;
        push("paintm", new T.SphereGeometry(0.11,10,8), tx, ty, tz, 0, "#8a6a44");
        push("paintm", new T.SphereGeometry(0.08,10,8), tx+0.02, ty+0.15, tz, 0, "#8a6a44");
        for(const sd of [-1,1]){ push("paintm", new T.SphereGeometry(0.03,6,5), tx, ty+0.22, tz+sd*0.06, 0, "#7a5a3a");
          push("paintm", new T.SphereGeometry(0.04,6,5), tx+0.08, ty-0.07, tz+sd*0.08, 0, "#8a6a44"); }
        push("paintm", new T.SphereGeometry(0.012,5,4), tx+0.095, ty+0.16, tz, 0, "#1a1a1a"); }
      addCol(bx0, bx1, bz0, bz1, UF-0.3, UF+0.6);
      // the rocking horse
      { const hx=HX-3.0, hz=HZ+3.0;
        for(const sd of [-1,1]){ const g=new T.TorusGeometry(0.55,0.02,4,24,1.4); push("beam", g, hx, UF+0.56, hz+sd*0.16, 0, "#8a2a22", 0, -Math.PI/2-0.7); }
        bx("paintm", 0.52, 0.20, 0.18, hx, UF+0.52, hz, 0, 0, "#d8cfc0");
        push("paintm", boxGeo(0.12, 0.30, 0.12, 0), hx+0.30, UF+0.70, hz, 0, "#d8cfc0", 0, -0.5);
        bx("paintm", 0.22, 0.10, 0.10, hx+0.40, UF+0.84, hz, 0, 0, "#d8cfc0");
        for(const [dx,dz] of [[-0.2,-0.07],[0.2,-0.07],[-0.2,0.07],[0.2,0.07]]) tube("beam", V3(hx+dx,UF+0.44,hz+dz), V3(hx+dx*1.3,UF+0.13,hz+dz*2), 0.02, 4, "#d8cfc0");
        push("paintm", boxGeo(0.06, 0.14, 0.03, 0), hx-0.30, UF+0.60, hz, 0, "#3a2a1a", 0, 0.5);
        addCol(hx-0.5, hx+0.55, hz-0.25, hz+0.25, UF-0.3, UF+0.9); }
      bx("beam", 0.70, 0.42, 0.40, PK-t/2-0.40, UF+0.21, z1-T2-0.25, 0.6, 0, "#6a7a5a");
      push("beam", boxGeo(0.70, 0.03, 0.40, 0.6), PK-t/2-0.40, UF+0.60, z1-T2-0.42, 0, "#6a7a5a", -1.1, 0);
      push("paintm", new T.SphereGeometry(0.06,8,6), PK-t/2-0.85, UF+0.06, z1-T2-0.6, 0, "#c03a2a");
      addCol(PK-t/2-0.76, PK-t/2-0.04, z1-T2-0.47, z1-T2, UF-0.3, UF+0.5);
      const marks=signTex(120,420,(c,W,H)=>{ c.clearRect(0,0,W,H); c.strokeStyle="rgba(40,40,40,0.85)"; c.fillStyle="rgba(40,40,40,0.9)"; c.lineWidth=3; c.font="bold 15px Arial";
        const L=[["DANNY 4",0.70],["MARIE 3",0.62],["DANNY 5",0.55],["MARIE 4",0.49],["DANNY 6",0.41],["MARIE 5",0.36],["DANNY 7",0.28]];
        for(const [s2,f] of L){ c.beginPath(); c.moveTo(6,H*f); c.lineTo(40,H*f); c.stroke(); c.fillText(s2,44,H*f+6); } });
      const mm=new T.Mesh(new T.PlaneGeometry(0.32,1.10), new T.MeshStandardMaterial({map:marks, transparent:true, roughness:0.9, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
      mm.position.set(D_KID.b+0.27, UF+0.95, HN+t+0.004); scene.add(mm);
      addUse(D_KID.b+0.27, HN+t+0.6, UF, "LOOK AT THE PENCIL MARKS", ()=>toast("PENCIL LINES UP THE WALL BY THE DOOR. DANNY 4, 5, 6, 7. MARIE 3, 4, 5. THEN NOTHING","#cfe0d4"), 0.9);
    }
    /* the box room: what nobody threw out */
    { const cx=(PK+PE)/2;
      for(const [dx,dz,y,s2] of [[-0.5,1.5,0.2,0.4],[-0.05,1.55,0.2,0.4],[-0.3,1.55,0.6,0.36],[0.45,1.5,0.16,0.32],[0.5,1.0,0.16,0.32]])
        bx("paintm", s2+0.08, s2, s2, cx+dx, UF+y, HN+t+dz, 0, 0, ["#8a7a5a","#7e6e50","#958560"][((dx+dz)*10|0)%3]);
      addCol(cx-0.78, cx+0.72, HN+t+0.75, z1-T2, UF-0.3, UF+0.8);
      push("beam", boxGeo(0.70, 1.10, 0.04, 0.6), PE-t/2-0.06, UF+0.56, HN+t+0.70, Math.PI/2, "#7a6a54", 0, 0.12);
      push("glass", planeGeo(0.56, 0.94, 0), PE-t/2-0.098, UF+0.56, HN+t+0.70, -Math.PI/2, "#dfe6e2");
      push("paintm", new T.CylinderGeometry(0.11,0.11,1.25,10), cx-0.2, UF+0.12, HN+t+0.45, 0, "#7a5a4a", 0, Math.PI/2);
    }
    /* the bathroom: the clawfoot tub under the window, the toilet with its high tank, a pedestal sink,
       and the hole over it all, with what has come in through it */
    { const tx=x1-T2-0.37, tz=HZ+2.6, prof=[[0.0,0.17],[0.25,0.17],[0.31,0.24],[0.345,0.45],[0.36,0.58],[0.345,0.605],[0.325,0.585],[0.30,0.47],[0.25,0.23],[0.0,0.22]];
      const lg=new T.LatheGeometry(prof.map(([a,b])=>new T.Vector2(a,b)), 28); lg.scale(1,1,2.05);
      push("porcelain", lg, tx, UF, tz, 0, "#e2ddd2");
      push("paintm", (()=>{ const g=new T.CircleGeometry(0.29,20); g.rotateX(-Math.PI/2); g.scale(1,1,2.0); return g; })(), tx, UF+0.30, tz, 0, "#3e3626");
      for(let k=0;k<9;k++) push("paintm", new T.CircleGeometry(0.04+r()*0.03,5), tx+(r()-0.5)*0.35, UF+0.305+k*0.001, tz+(r()-0.5)*0.9, 0, ["#8a5a2a","#a06a2a","#6a4a28"][k%3], -Math.PI/2, 0);
      for(const [dx,dz] of [[-0.24,-0.55],[0.24,-0.55],[-0.24,0.55],[0.24,0.55]]){
        push("metal", new T.SphereGeometry(0.045,8,6), tx+dx, UF+0.10, tz+dz, 0, "#3a3430");
        push("metal", boxGeo(0.06,0.10,0.08,0.5), tx+dx, UF+0.04, tz+dz+(dz>0?0.02:-0.02), 0, "#3a3430"); }
      addCol(tx-0.37, tx+0.37, tz-0.75, tz+0.75, UF-0.3, UF+0.62);
      // the toilet: an old one, the tank up on the wall with its chain
      const wx=HX+3.6, wz=z1-T2;
      push("porcelain", _bowlGeo, wx, UF, wz, Math.PI, "#e2ddd2");
      push("porcelain", _neckGeo, wx, UF, wz, Math.PI, "#e2ddd2");
      push("paintm", _waterGeo, wx, UF+0.301, wz-0.472, Math.PI, "#5a5a40");
      bx("beam", 0.52, 0.30, 0.22, wx, UF+1.95, wz-0.12, 0.6, 0, "#4a3426");
      tube("metal", V3(wx-0.1, UF+1.80, wz-0.10), V3(wx-0.04, UF+0.45, wz-0.10), 0.02, 6, "#6a6050");
      tube("metal", V3(wx+0.15, UF+1.80, wz-0.18), V3(wx+0.15, UF+1.30, wz-0.18), 0.003, 3, "#5a5040");
      push("paintm", new T.CylinderGeometry(0.018,0.018,0.10,8), wx+0.15, UF+1.25, wz-0.18, 0, "#d8d0bc");
      addCol(wx-0.22, wx+0.22, wz-0.72, wz, UF-0.3, UF+0.42);
      // the sink, on its pedestal, against the box room's wall; the cabinet over it, its mirror gone black
      const sx=PE+t/2, sz=HZ+2.4;
      push("porcelain", new T.CylinderGeometry(0.07,0.11,0.74,12), sx+0.24, UF+0.37, sz, 0, "#e2ddd2");
      push("porcelain", new T.CylinderGeometry(0.27,0.20,0.14,18), sx+0.26, UF+0.80, sz, 0, "#e2ddd2");
      bx("paintm", 0.12, 0.56, 0.44, sx+0.07, UF+1.45, sz, 0, 0, "#c8c0b0");
      push("paintm", planeGeo(0.36, 0.46, 0), sx+0.131, UF+1.45, sz, Math.PI/2, "#2a2a28");
      addCol(sx, sx+0.52, sz-0.28, sz+0.28, UF-0.3, UF+0.9);
      addUse(sx+0.85, sz, UF, "OPEN THE MEDICINE CABINET", ()=>toast("AN EMPTY BROWN BOTTLE, A RAZOR RUSTED SHUT, A LIPSTICK WORN DOWN TO THE TUBE","#cfe0d4"), 0.9);
      // under the hole: the floor gone dark, moss, bits of shingle and lath, leaves
      push("paintm", new T.CircleGeometry(0.75, 14), (HB.x0+HB.x1)/2, UF+0.009, (HB.z0+HB.z1)/2, 0, "#3a3426", -Math.PI/2, 0);
      bucketOf("paintm").entries[bucketOf("paintm").entries.length-1].matrix.multiply(new T.Matrix4().makeScale(1.0,1.35,1.0));
      push("paintm", new T.CircleGeometry(0.38, 11), (HB.x0+HB.x1)/2-0.15, UF+0.011, (HB.z0+HB.z1)/2+0.1, 0, "#4f5a34", -Math.PI/2, 0);
      for(let k=0;k<10;k++) push(k%2?"shingle":"beam", boxGeo(0.12+r()*0.25, 0.012, 0.06+r()*0.2, 0.6), HB.x0+r()*(HB.x1-HB.x0), UF+0.015+k*0.004, HB.z0+r()*(HB.z1-HB.z0), r()*3, k%2?"#5b544b":"#7a6a54");
      for(let k=0;k<20;k++) push("paintm", new T.CircleGeometry(0.03+r()*0.03,5), HB.x0-0.4+r()*(HB.x1-HB.x0+0.8), UF+0.012+r()*0.003, HB.z0-0.4+r()*(HB.z1-HB.z0+0.8), 0, ["#8a5a2a","#a06a2a","#6a4a28","#7a7a3a"][k%4], -Math.PI/2, 0);
    }
  }
  // the parlour: the stove and its pipe, an armchair gone through, a mattress, the calendar, a picture
  { const sx=x0+T2+0.55, sz=HZ+0.2;
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
  { const mx=HX-4.6, mz=HZ-2.8; bx("paintm", 1.35, 0.16, 1.9, mx, FF+0.08, mz, 0, 0.15, "#b8ab90");
    push("paintm", new T.CircleGeometry(0.3,10), mx+0.2, FF+0.165, mz+0.3, 0, "#8a7a58", -Math.PI/2, 0); }
  // the back of the parlour, where they ate: a china hutch between the windows, the glass out of it,
  // a table and one chair, the other on its back
  { const hx=HX-3.85, hz=z1-T2-0.25;
    bx("beam", 1.25, 0.90, 0.48, hx, FF+0.45, hz, 0.6, 0, "#5a3e2a");
    bx("beam", 1.18, 0.95, 0.34, hx, FF+1.38, hz+0.06, 0.6, 0, "#5a3e2a");
    for(const dx of [-0.29,0.29]) bx("paintm", 0.54, 0.84, 0.012, hx+dx, FF+1.38, hz-0.115, 0, 0, "#2a2420");
    for(let k=0;k<4;k++) push("porcelain", new T.CylinderGeometry(0.08,0.06,0.03,12), hx-0.4+k*0.27, FF+1.12, hz+0.02, 0, "#e8e2d4", 1.3, 0);
    bx("beam", 1.30, 0.04, 0.52, hx, FF+1.87, hz+0.02, 0.6, 0, "#4a3020");
    addCol(hx-0.65, hx+0.65, hz-0.26, hz+0.25, FF-0.5, FF+1.9);
    const dx=HX-3.6, dz=HZ+2.2;
    bx("beam", 1.30, 0.04, 0.85, dx, FF+0.74, dz, 0.6, 0, "#6a4a32");
    for(const [ex,ez] of [[-0.58,-0.36],[0.58,-0.36],[-0.58,0.36],[0.58,0.36]]) bx("beam", 0.05, 0.72, 0.05, dx+ex, FF+0.36, dz+ez, 0.6, 0, "#5a3e2a");
    addCol(dx-0.67, dx+0.67, dz-0.45, dz+0.45, FF-0.5, FF+0.78);
    bx("paintm", 0.42, 0.04, 0.42, dx+0.95, FF+0.45, dz-0.1, 0, 0.2, "#6a4a32");
    for(const [ex,ez] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]]) bx("paintm", 0.035, 0.45, 0.035, dx+0.95+ex, FF+0.225, dz-0.1+ez, 0, 0, "#5a3e2a");
    push("paintm", boxGeo(0.42, 0.04, 0.42, 0), dx-0.9, FF+0.21, dz+0.65, 0.4, "#6a4a32", 1.45, 0);
    push("paintm", boxGeo(0.42, 0.5, 0.035, 0), dx-0.9, FF+0.02, dz+0.98, 0.4, "#5a3e2a", -1.5, 0); }
  // the calendar, the picture
  const calTex=signTex(240,300,(c,W,H)=>{ c.fillStyle="#efe6cf"; c.fillRect(0,0,W,H);
    c.fillStyle="#7a8a5a"; c.fillRect(0,0,W,H*0.42); c.fillStyle="#3a4a2a"; c.fillRect(W*0.1,H*0.08,W*0.8,H*0.26);
    c.fillStyle="#2a2a2a"; fitText(c,"CONNEAUT LAKE FEED & SUPPLY",W*0.92,H*0.06,W/2,H*0.47,"700");
    fitText(c,"OCTOBER  1987",W*0.7,H*0.07,W/2,H*0.56,"700");
    c.fillStyle="#555"; for(let k=0;k<5;k++) for(let j=0;j<7;j++) c.fillRect(W*0.08+j*W*0.12, H*0.62+k*H*0.07, W*0.09, H*0.05);
    c.fillStyle="#b3151b"; c.font="bold 22px Arial"; c.fillText("X",W*0.08+3*W*0.12+2,H*0.62+2*H*0.07+18); });
  signPanel(0.30,0.38,calTex, PX-0.116, FF+1.55, HZ-1.6, -Math.PI/2);
  const picTex=signTex(200,160,(c,W,H)=>{ c.fillStyle="#3a2a1a"; c.fillRect(0,0,W,H); c.fillStyle="#b8a890"; c.fillRect(14,14,W-28,H-28);
    c.fillStyle="#6a5a48"; c.fillRect(14,H*0.62,W-28,H*0.3);
    for(const [px,h] of [[0.30,0.55],[0.42,0.62],[0.55,0.45],[0.66,0.50]]){ c.fillStyle="#3a3028"; c.fillRect(W*px,H*(0.9-h),W*0.07,H*h-14); c.beginPath(); c.arc(W*px+W*0.035,H*(0.9-h),W*0.04,0,7); c.fill(); }
    c.fillStyle="#5a4a3a"; c.fillRect(W*0.75,H*0.72,W*0.1,H*0.08); });
  { const m=signPanel(0.36,0.29,picTex, x0+T2+0.012, FF+1.65, HZ-0.8, Math.PI/2); m.rotation.z=0.09; }
  addUse(PX-0.6, HZ-1.6, FF, "READ THE CALENDAR", ()=>toast("OCTOBER 1987, FROM THE FEED STORE. THE 15TH IS CROSSED OFF. NOTHING AFTER","#cfe0d4"), 1.1);
  addUse(x0+T2+0.7, HZ-0.8, FF, "LOOK AT THE PICTURE", ()=>toast("A FAMILY ON THIS PORCH, IN THEIR SUNDAY CLOTHES. NOBODY IS SMILING BUT THE DOG","#cfe0d4"), 1.1);
  // the kids have been in: a tag on the wall, cans, a candle stub on the sill
  { const tagTex=signTex(400,160,(c,W,H)=>{ c.clearRect(0,0,W,H); c.strokeStyle="rgba(40,90,200,0.85)"; c.lineWidth=10; c.lineCap="round";
      c.fillStyle="rgba(40,90,200,0.85)"; fitText(c,"TY + JESS",W*0.84,84,W/2,H*0.42,"bold","Arial");
      c.fillStyle="rgba(200,40,40,0.8)"; fitText(c,"GET OUT",W*0.42,36,W*0.68,H*0.82,"bold","Arial"); });
    const m=new T.Mesh(new T.PlaneGeometry(1.4,0.56), new T.MeshStandardMaterial({map:tagTex, transparent:true, roughness:0.8, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4}));
    m.position.set(PX+0.116, FF+1.45, HZ-1.4); m.rotation.y=Math.PI/2; scene.add(m); HOUSE.tag=m;
    for(let k=0;k<5;k++){ const x=HX+1.7+r()*2.6, z=z0+0.6+r()*1.5; push("paintm", new T.CylinderGeometry(0.033,0.033,0.04,10), x, FF+0.022, z, r()*3, ["#c8202a","#b8bcc0","#2b5aa8"][k%3], Math.PI/2, 0.4); } }
  // the kitchen: the table on its side, a chair, the sink, a cabinet door hanging, the old fridge
  { const tx=HX+3.0, tz=HZ-1.4;
    push("beam", boxGeo(1.2, 0.05, 0.85, 0.6), tx, FF+0.43, tz, 0.2, "#8a6a48", 0, Math.PI/2);
    for(const [dx,dz] of [[-0.5,-0.35],[0.5,-0.35],[-0.5,0.35],[0.5,0.35]]){ const p=V3(dx,0,dz).applyAxisAngle(V3(0,1,0),0.2);
      tube("beam", V3(tx-0.02+p.x*0.05, FF+0.43+p.x*0.85, tz+p.z), V3(tx+0.68, FF+0.43+p.x*0.85, tz+p.z), 0.025, 5, "#7a5a3a"); }
    addCol(tx-0.6, tx+0.75, tz-0.55, tz+0.55, FF-0.5, FF+0.9);
    const cx=HX+2.2, cz=HZ+1.9; bx("paintm", 0.42, 0.04, 0.42, cx, FF+0.45, cz, 0, 0.5, "#8a6a48");
    for(const [dx,dz] of [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]]) bx("paintm", 0.035, 0.45, 0.035, cx+dx, FF+0.225, cz+dz, 0, 0, "#7a5a3a");
    bx("paintm", 0.42, 0.5, 0.035, cx, FF+0.72, cz+0.2, 0, 0.5, "#7a5a3a");
    // the sink under the back window, in its run of cabinets; one cabinet door down on the floor
    const kx=PX+0.10+0.82;
    bx("paintm", 1.6, 0.86, 0.58, kx, FF+0.43, z1-T2-0.30, 0, 0, "#8a8270");
    bx("porcelain", 0.80, 0.08, 0.50, kx+0.18, FF+0.90, z1-T2-0.30, 0, 0, "#d8d0bc");
    push("paintm", planeGeo(0.62,0.36,0), kx+0.18, FF+0.946, z1-T2-0.30, 0, "#5a5446", -Math.PI/2, 0);   // the basin, 6 mm over the top
    tube("chrome", V3(kx+0.18, FF+0.94, z1-T2-0.08), V3(kx+0.18, FF+1.12, z1-T2-0.14), 0.015, 6, "#9a9080");
    addCol(kx-0.8, kx+0.8, z1-T2-0.6, z1-T2, FF-0.5, FF+0.95);
    push("paintm", boxGeo(0.45, 0.62, 0.02, 0), kx-0.3, FF+0.02, z1-T2-0.95, 0.5, "#8a8270", -Math.PI/2, 0);
    // the fridge: a rounded fifties one against the back wall, the door hanging open
    const fx=HX+3.6, fz=z1-T2-0.36;
    bx("paintm", 0.70, 1.55, 0.66, fx, FF+0.78, fz, 0, 0, "#d6d0bc");
    push("paintm", domeGeo(0.36, 0.12, 16), fx, FF+1.55, fz, 0, "#d6d0bc");
    push("paintm", boxGeo(0.70, 1.2, 0.06, 0), fx+0.22, FF+0.9, fz-0.69, 1.94, "#d6d0bc");
    push("paintm", planeGeo(0.6,1.1,0), fx, FF+0.85, fz-0.336, Math.PI, "#3a3630");
    addCol(fx-0.36, fx+0.36, fz-0.34, fz+0.34, FF-0.5, FF+1.6);
    addUse(kx-0.3, z1-T2-1.0, FF, "OPEN THE DRAWER", ()=>toast("RECEIPTS FROM THE FEED STORE, A ROSARY, SEED PACKETS FOR 1988 THAT NOBODY PLANTED","#cfe0d4"), 1.2); }
  // inside the door, the hall: a coat still on its hook
  bx("paintm", 0.06, 0.06, 0.08, HX-0.9, FF+1.75, z0+T2+0.04, 0, 0, "#3a3028");
  push("paintm", boxGeo(0.44, 0.9, 0.08, 0), HX-0.9, FF+1.30, z0+T2+0.07, 0, "#4a3a2c", 0.04, 0);
  addUse(HX-0.1, z0-1.2, pY, "LOOK THROUGH THE DOOR", ()=>toast("IT SMELLS OF MOUSE AND OLD RAIN. THE FLOOR CREAKS BEFORE YOU STEP ON IT","#cfe0d4"), 1.4);

  /* ---- the yard ----------------------------------------------------------- */
  const gy=(x,z)=>Terrain.groundAt(x,z);
  // the well, fieldstone, its wooden cover half rotted away
  { const wx=HX-10.5, wz=HZ-8.2, y=gy(wx,wz);
    push("rock", new T.CylinderGeometry(0.72,0.78,0.72,14,1,true), wx, y+0.30, wz, 0, "#8d877b");
    push("rock", new T.CylinderGeometry(0.58,0.58,0.70,14,1,true), wx, y+0.30, wz, 0, "#6d685e");
    push("rock", new T.RingGeometry(0.58,0.74,14), wx, y+0.665, wz, 0, "#9a9488", -Math.PI/2, 0);
    push("paintm", new T.CircleGeometry(0.58,14), wx, y-0.2, wz, 0, "#050505", -Math.PI/2, 0);
    for(let k=0;k<3;k++) bx("beam", 0.2, 0.04, 1.5-k*0.25, wx-0.36+k*0.22, y+0.70+k*0.012, wz-0.1*k, 0.6, 0.1*k, "#6a5a44");   // (each a little over the last where they cross)
    for(const sd of [-1,1]) bx("beam", 0.09, 1.5, 0.09, wx+sd*0.85, y+0.75, wz, 0.6, 0, "#5a4a38");
    tube("metal", V3(wx-0.94, y+1.35, wz), V3(wx+0.94, y+1.35, wz), 0.04, 6, "#5a3a2a");          // (out past the posts, an axle)
    addCol(wx-0.85, wx+0.85, wz-0.85, wz+0.85, y-0.5, y+0.7);
    addUse(wx, wz-1.2, y, "LOOK DOWN THE WELL", ()=>toast("YOU DROP A PEBBLE. IT TAKES A LONG TIME, AND THEN NOT A SPLASH","#cfe0d4"), 1.3); }
  // the pump by the back step
  { const px=HX+8.3, pz=HZ+6.6, y=gy(px,pz);
    bx("concrete", 0.9, 0.12, 0.9, px, y+0.06, pz, 0.5, 0.2, "#9a968c");
    tube("paintm", V3(px,y+0.1,pz), V3(px,y+1.0,pz), 0.05, 8, "#2c2a28");
    tube("paintm", V3(px,y+0.85,pz), V3(px+0.3,y+0.78,pz), 0.03, 6, "#2c2a28");
    tube("paintm", V3(px,y+1.0,pz), V3(px-0.55,y+1.25,pz), 0.02, 5, "#2c2a28");
    addCol(px-0.12, px+0.12, pz-0.12, pz+0.12, y-0.5, y+1.1);
    addUse(px-0.6, pz-0.5, y, "WORK THE PUMP", ()=>toast("IT SQUEALS. A COUPLE OF COUGHS OF RUST-COLOURED WATER, THEN NOTHING","#cfe0d4"), 1.2); }
  // the shed, down on its face: two corner posts still up, its tin roof lying across the rest
  { const sx=HX+12.6, sz=HZ+3.6, y=gy(sx,sz);
    for(const [dx,dz] of [[-1.4,-1.2],[-1.4,1.2]]){ bx("beam", 0.12, 1.9, 0.12, sx+dx, y+0.95, sz+dz, 0.6, 0, "#5a4a38"); addCol(sx+dx-0.08, sx+dx+0.08, sz+dz-0.08, sz+dz+0.08, y-0.5, y+1.9); }
    const g=new FaceGeo().slab([V3(sx-1.5,y+1.85,sz-1.4), V3(sx-1.5,y+1.85,sz+1.4), V3(sx+1.6,y+0.15,sz+1.6), V3(sx+1.6,y+0.15,sz-1.2)], 0.03, 0.6).geo();
    push("roofmetal", g, 0,0,0, 0, "#7a4a2a");
    for(let k=0;k<6;k++) push("beam", boxGeo(0.14, 0.03, 2.2, 0.6), sx-0.6+k*0.4, y+0.05+r()*0.1, sz+(r()-0.5)*0.8, r()*0.6, "#6a5a44");
    addCol(sx-1.5, sx+1.6, sz-1.4, sz+1.6, y-0.5, y+0.6); }
  // the swing set: rust, one seat on one chain
  { const sx=HX-10.8, sz=HZ+6.2, y=gy(sx,sz);
    for(const dx of [-1.3,1.3]) for(const dz of [-0.7,0.7]) tube("metal", V3(sx+dx,y,sz+dz), V3(sx+dx*0.95,y+2.1,sz), 0.035, 6, "#7a4a32");
    tube("metal", V3(sx-1.3,y+2.1,sz), V3(sx+1.3,y+2.1,sz), 0.04, 6, "#7a4a32");
    tube("metal", V3(sx-0.4,y+2.08,sz), V3(sx-0.4,y+0.55,sz), 0.006, 3, "#4a3a2a");
    push("paintm", boxGeo(0.45, 0.03, 0.16, 0), sx-0.42, y+0.48, sz, 0.1, "#2a2a2a", 0, 1.2);
    addCol(sx-1.4, sx+1.4, sz-0.8, sz+0.8, y-0.5, y+0.3); }
  // the mailbox at the end of the drive, its door down, a name still on it
  { const mx=HX+4.6, mz=HZ+15.0, y=gy(mx,mz);
    bx("beam", 0.1, 1.05, 0.1, mx, y+0.52, mz, 0.6, 0, "#5a4a38");
    bx("paintm", 0.2, 0.18, 0.46, mx, y+1.13, mz, 0, 0, "#6a6660"); push("paintm", new T.CylinderGeometry(0.1,0.1,0.46,10,1,false,0,Math.PI), mx, y+1.22, mz, 0, "#6a6660", Math.PI/2, Math.PI/2);
    push("paintm", boxGeo(0.2, 0.26, 0.02, 0), mx, y+1.02, mz-0.3, 0, "#6a6660", -1.2, 0);
    const nm=signTex(200,60,(c,W,H)=>{ c.fillStyle="#6a6660"; c.fillRect(0,0,W,H); c.fillStyle="#8e8a80"; fitText(c,"KOVALCHICK",W*0.9,H*0.6,W/2,H/2,"700"); });
    signPanel(0.30,0.09,nm, mx+0.105, y+1.13, mz, Math.PI/2);
    addCol(mx-0.08, mx+0.08, mz-0.08, mz+0.08, y-0.5, y+1.3);
    addUse(mx-0.6, mz, y, "READ THE MAILBOX", ()=>toast("KOVALCHICK. INSIDE, A WASPS' NEST AND A SEED CATALOGUE FROM 1988","#cfe0d4"), 1.1); }
  // the lilacs by the porch corners, the apple tree gone wild, the saplings coming in
  for(const [dx,dz,s] of [[-8.4,-6.4,1.5],[8.6,-6.8,1.3],[-8.2,3.4,1.2]]) FOREST.plant("shrub", HX+dx, HZ+dz, {scale:s, solid:true, color:"#5a7a3c", autumn:"#8a7a3a"});
  FOREST.plant("edge", HX-12.8, HZ-1.0, {scale:0.42, color:"#6a8a40", autumn:"#c9a02a"});
  for(let k=0;k<14;k++){
    const a=r()*Math.PI*2, d=9.5+r()*8, x=HX+Math.cos(a)*d, z=HZ+Math.sin(a)*d*1.15;
    if(Terrain.boxDist(HOMESTEAD.box,x,z)<2.5) continue;
    FOREST.plant(r()<0.65?"sapling":"shrub", x, z, {scale:0.5+r()*0.7, solid:false});
  }
  for(let k=0;k<26;k++){ const a=r()*Math.PI*2, d=13+r()*6, x=HX+Math.cos(a)*d, z=HZ+Math.sin(a)*d*1.15; FOREST.plant("fern", x, z, {scale:0.8+r()*0.6, solid:false}); }
  // a creak now and then while you are in it (20-audio)
  HOUSE.zone={x0:x0, x1:x1, z0:z0, z1:z1, y0:FF-0.6, y1:FF+6};
  for(const o of scene.children.slice(n0)) BACKWOODS.deep.push(o);
})();
/* the eighth step gives a little and says so, now and then; and the first
   time you come up into the hall, the cold of it */
const _HOUSE_T={step:0, up:false};
function updateHouse(dt){
  if(!HOUSE.stair || droneMode || driving) return;
  const S=HOUSE.stair, p=player.pos, k=7;
  _HOUSE_T.step=Math.max(0,_HOUSE_T.step-dt);
  if(p.x>S.x0 && p.x<S.x1 && p.z>S.zb+S.run*k && p.z<S.zb+S.run*(k+1) && _HOUSE_T.step<=0){
    _HOUSE_T.step=45;
    if(typeof AUDIO!=="undefined") AUDIO.creak();
    toast("THE EIGHTH STEP GIVES UNDER YOU. KEEP TO THE WALL SIDE","#cfe0d4");
  }
  if(!_HOUSE_T.up && player.feetY>HOUSE.UF-0.2 && p.x>HOUSE.x0 && p.x<HOUSE.x1 && p.z>HOUSE.z0 && p.z<HOUSE.z1){
    _HOUSE_T.up=true; toast("UPSTAIRS. IT IS COLDER UP HERE, AND IT SMELLS OF RAIN","#cfe0d4"); }
}
