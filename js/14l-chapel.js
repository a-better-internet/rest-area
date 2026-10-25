"use strict";
/* REST AREA · 14l-chapel.js
   at Edinboro's exit, north of US 6N past the fuel stop: a white frame
   chapel you can walk into, its gravel lot, and the old graveyard by it
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14l · FRENCH CREEK UNION CHAPEL
   Set back off the road in its own mown yard (EDIN.chapel), with the corn
   behind it: a gravel lot, a sign at the road with this week's letters on
   it, and the chapel itself, white clapboard on a fieldstone foundation,
   gable to the road, a steeple on the front of the ridge with the bell in
   its louvred belfry and a spire over that. Red double doors up four steps
   under a transom. Down each side four tall windows of coloured glass with
   pointed caps over them outside; they glow at night, when the lamps inside
   are left on.
   Inside, one room: the floor in oak, wainscot to the chair rail, plaster
   over it. Pews either side of the aisle with its runner, eight rows. At
   the front the chancel up two steps: the pulpit, the table with its cloth,
   candles and the open Bible, the cross on the wall, the piano, the hymn
   board. At the back the bell rope (E rings it), the guest book (E), the
   coat pegs.
   East of it, behind a dry-stone wall along the road, the graveyard: two
   hundred-odd stones in rows, the oldest at the back, slate-grey and
   leaning, a few with a flag by them; three old maples, a bench.
   ---------------------------------------------------------------------- */
(function chapel(){
  const E=EDIN, Z=E.z, Y=E.y, CH=E.chapel, r=_trng(5150);
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
  const slab=(bk, pts, t, color)=>push(bk, new FaceGeo().slab(pts, t, 0.5).geo(), 0,0,0, 0, color);
  const tree=(sp, x, z, s)=>{ FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s; addCol(x-rr, x+rr, z-rr, z+rr, Y-0.5, Y+6); };

  /* ---- the chapel ----
       walls  x 84..93, z Z-38..Z-22, the front (the door) at Z-22 facing the road
       floor  FF; the chancel up two steps across the north end */
  const H={x0:84.0, x1:93.0, z0:Z-38.0, z1:Z-22.0}, WT=0.2, FF=Y+0.76, CL=FF+4.0, EAV=FF+4.3, RID=EAV+3.6, xm=(H.x0+H.x1)/2;
  const IX0=H.x0+WT, IX1=H.x1-WT, IZ0=H.z0+WT, IZ1=H.z1-WT, TRM="#eeece4", OAK="#7a5634", WAIN="#8a6440";
  const DOOR={a:87.58, b:89.42, sill:FF-0.03, head:FF+2.62};
  const FRONT=[{a:85.1, b:85.8, sill:FF+1.1, head:FF+3.2}, DOOR, {a:91.2, b:91.9, sill:FF+1.1, head:FF+3.2}];
  const SIDE=[-35.0, -31.6, -28.2, -24.8].map(c=>({a:Z+c-0.475, b:Z+c+0.475, sill:FF+1.0, head:FF+3.3}));
  // the coloured glass: a lancet in leading, a border of ruby and cobalt round pale quarries, a gold roundel with a
  // cross in it; outside the arch the frame's dark wood. One sheet for every window, lit from inside at night
  const glassTex=signTex(128, 320, (c,W,Hh)=>{ const q=_trng(88);
    c.fillStyle="#2a2018"; c.fillRect(0,0,W,Hh);
    c.save(); c.beginPath(); c.moveTo(6, Hh-6); c.lineTo(6, 70); c.quadraticCurveTo(8, 18, W/2, 6); c.quadraticCurveTo(W-8, 18, W-6, 70); c.lineTo(W-6, Hh-6); c.closePath(); c.clip();
    c.fillStyle="#1e1a16"; c.fillRect(0,0,W,Hh);
    for(let y=0;y<Hh;y+=16) for(let x=0;x<W;x+=16){ const k=((x/16)+(y/16))%2; c.fillStyle=k ? "#9a2028" : "#1f3f8a"; c.fillRect(x+1, y+1, 14, 14); }
    c.fillStyle="#1e1a16"; c.fillRect(17, 17, W-34, Hh-34);
    for(let y=17, row=0; y<Hh-17; y+=22, row++) for(let x=17+(row%2)*11-11; x<W-17; x+=22){
      c.save(); c.beginPath(); c.rect(17, 17, W-34, Hh-34); c.clip();
      c.fillStyle=["#e8d8a0","#d8e0b0","#f0d0b8","#e0e4c8"][(q()*4)|0]; c.beginPath(); c.moveTo(x+11, y+1); c.lineTo(x+21, y+11); c.lineTo(x+11, y+21); c.lineTo(x+1, y+11); c.closePath(); c.fill(); c.restore(); }
    const cy=Hh*0.52; c.fillStyle="#1e1a16"; c.beginPath(); c.arc(W/2, cy, 30, 0, 7); c.fill();
    c.fillStyle="#d8a830"; c.beginPath(); c.arc(W/2, cy, 27, 0, 7); c.fill();
    c.fillStyle="#1e1a16"; c.fillRect(W/2-5, cy-21, 10, 42); c.fillRect(W/2-16, cy-10, 32, 10);
    c.fillStyle="#f4ecd0"; c.fillRect(W/2-3, cy-19, 6, 38); c.fillRect(W/2-14, cy-8, 28, 6);
    c.restore(); });
  bucketOf("stainglass", ()=>{ const m=new T.MeshStandardMaterial({map:glassTex, emissive:0xffffff, emissiveMap:glassTex, emissiveIntensity:0.3, roughness:0.35, side:T.DoubleSide});
    GLOW.push({m:m, base:new T.Color(0xffe2b8), kind:"indoor", baseInt:0.30}); return m; });
  bucketOf("chapel_globe", ()=>emitMat(0xffe6c0, 0.9, "indoor"));

  // the stone it stands on, its top a centimetre under the floor: four walls round the fellowship hall under it (below),
  // the white door into that in the back one and two small windows down each side just over the grass; then the
  // walls, clapboard; corner boards
  const BF=Y+0.03-12*0.19, CL2=BF+2.70, FT=0.35;                  // the hall's floor (twelve risers under the ground), its drop ceiling
  const F={x0:H.x0-0.05, x1:H.x1+0.05, z0:H.z0-0.05, z1:H.z1+0.05}, HX0=F.x0+FT, HX1=F.x1-FT, HZ0=F.z0+FT, HZ1=F.z1-FT;
  const BDOOR={a:85.54, b:86.46, sill:BF, head:BF+2.10};
  const BWIN=[Z-33.6, Z-27.6].map(c=>({a:c-0.36, b:c+0.36, sill:Y+0.08, head:Y+0.36}));
  runX("fh_stone", F.z0+FT/2, FT, F.x0, F.x1, BF-0.25, FF-0.01, [BDOOR], "#ffffff", 0.6);
  runX("fh_stone", F.z1-FT/2, FT, F.x0, F.x1, BF-0.25, FF-0.01, [], "#ffffff", 0.6);
  runZ("fh_stone", F.x0+FT/2, FT, HZ0, HZ1, BF-0.25, FF-0.01, BWIN, "#ffffff", 0.6);
  runZ("fh_stone", F.x1-FT/2, FT, HZ0, HZ1, BF-0.25, FF-0.01, BWIN, "#ffffff", 0.6);
  runX("fh_clap", H.z1-WT/2, WT, H.x0, H.x1, FF-0.15, EAV, FRONT, "#ffffff", 0.5);
  runX("fh_clap", H.z0+WT/2, WT, H.x0, H.x1, FF-0.15, EAV, [], "#ffffff", 0.5);
  runZ("fh_clap", H.x0+WT/2, WT, IZ0, IZ1, FF-0.15, EAV, SIDE, "#ffffff", 0.5);
  runZ("fh_clap", H.x1-WT/2, WT, IZ0, IZ1, FF-0.15, EAV, SIDE, "#ffffff", 0.5);
  for(const [cx, sx] of [[H.x0, 1],[H.x1, -1]]) for(const [cz, sz] of [[H.z0, 1],[H.z1, -1]]){
    B(0.15, EAV-0.06-(FF-0.03), 0.035, cx+sx*(0.13-0.15/2), (EAV-0.06+FF-0.03)/2, cz-sz*0.0075, TRM);
    B(0.035, EAV-0.055-(FF-0.03), 0.17, cx-sx*0.0075, (EAV-0.055+FF-0.03)/2, cz+sz*(0.15-0.17/2), TRM); }
  // inside: oak wainscot to the chair rail, plaster over it to the ceiling
  for(const [y0,y1,bk,col] of [[FF, FF+1.0, "wood", WAIN],[FF+1.0, CL, "plaster", "#efe9dc"]]){
    lineX(bk, IZ0, 1, IX0, IX1, y0, y1, [], col, bk==="wood"?1:0.5);
    lineX(bk, IZ1, -1, IX0, IX1, y0, y1, FRONT, col, bk==="wood"?1:0.5);
    lineZ(bk, IX0, 1, IZ0, IZ1, y0, y1, SIDE, col, bk==="wood"?1:0.5);
    lineZ(bk, IX1, -1, IZ0, IZ1, y0, y1, SIDE, col, bk==="wood"?1:0.5); }
  // the chair rail, the baseboard and the crown: sunk into the wall, proud of the liners; the runs along x a few
  // millimetres lower than those along z, so where they meet in a corner no faces lie together
  { const runs=(a, b, L, y)=>{ const out=[]; let q=a;
      for(const o of (L||[]).filter(o=>o.sill<y && o.head>y && o.b>a && o.a<b).sort((p,q2)=>p.a-q2.a)){ if(o.a-0.06>q+0.05) out.push([q, o.a-0.06]); q=Math.max(q, o.b+0.06); }
      if(b>q+0.05) out.push([q, b]); return out; };
    for(const [f, dir, L] of [[IZ0, 1, []], [IZ1, -1, FRONT]]){
      for(const [a,b] of runs(IX0, IX1, L, FF+0.07)) B(b-a, 0.144, 0.035, (a+b)/2, FF+0.068, f+dir*0.0125, OAK);
      for(const [a,b] of runs(IX0, IX1, L, FF+1.01)) B(b-a, 0.06, 0.05, (a+b)/2, FF+1.0, f+dir*0.02, OAK);
      B(IX1-IX0, 0.10, 0.06, xm, CL-0.048, f+dir*0.025, TRM); }
    for(const [f, dir] of [[IX0, 1], [IX1, -1]]){
      for(const [a,b] of runs(IZ0+0.005, IZ1-0.005, SIDE, FF+0.07)) B(0.035, 0.149, b-a, f+dir*0.0125, FF+0.0705, (a+b)/2, OAK);
      for(const [a,b] of runs(IZ0+0.005, IZ1-0.005, SIDE, FF+1.01)) B(0.05, 0.065, b-a, f+dir*0.02, FF+1.0025, (a+b)/2, OAK);
      B(0.06, 0.105, IZ1-IZ0-0.01, f+dir*0.025, CL-0.0505, (IZ0+IZ1)/2, TRM); } }
  floorAt("fh_floor", IX0, IX1, IZ0, IZ1, FF+0.004, "#e0c49c", 0.9);
  addFlat(IX0, IX1, IZ0, IZ1, FF);
  addFlat(DOOR.a, DOOR.b, H.z1-WT-0.01, H.z1+0.01, FF-0.01);
  ceilAt("plaster", IX0, IX1, IZ0, IZ1, CL, "#f4f0e6", 0.5);
  bx("beam", IX1-IX0, 0.12, IZ1-IZ0, xm, CL+0.075, (IZ0+IZ1)/2, 0.5, 0, "#5a4a38");
  B(DOOR.b-DOOR.a+0.004, 0.016, WT+0.03, (DOOR.a+DOOR.b)/2, FF+0.009, H.z1-WT/2, "#8a6a44");

  // the windows: casings, a stool inside, the glass, and outside a pointed cap over each
  const glaze=(axis, f, o, out)=>{ const w=o.b-o.a, h=o.head-o.sill, cy=(o.sill+o.head)/2, c=(o.a+o.b)/2, rise=0.42, L=Math.hypot(w/2+0.14, rise), th=Math.atan2(rise, w/2+0.14);
    if(axis==="x"){ push("stainglass", planeGeo(w-0.04, h-0.04, 0), c, cy, f, 0, "#ffffff");
      for(const x of [o.a-0.05, o.b+0.05]) B(0.10, h+0.18, 0.05, x, cy, f+out*(WT/2+0.025), TRM);
      B(w+0.30, 0.10, 0.06, c, o.head+0.05, f+out*(WT/2+0.03), TRM); B(w+0.24, 0.05, 0.12, c, o.sill-0.017, f+out*(WT/2+0.05), TRM);
      B(w+0.10, 0.04, 0.12, c, o.sill+0.02, f-out*(WT/2+0.05), OAK);
      for(const sd of [-1,1]) B(L, 0.10, 0.05, c+sd*(w/2+0.14)/2, o.head+0.10+rise/2, f+out*(WT/2+0.04+(sd>0?0.004:0)), TRM, 0, 0, -sd*th); }
    else { push("stainglass", planeGeo(w-0.04, h-0.04, 0), f, cy, c, Math.PI/2, "#ffffff");
      for(const z of [o.a-0.05, o.b+0.05]) B(0.05, h+0.18, 0.10, f+out*(WT/2+0.025), cy, z, TRM);
      B(0.06, 0.10, w+0.30, f+out*(WT/2+0.03), o.head+0.05, c, TRM); B(0.12, 0.05, w+0.24, f+out*(WT/2+0.05), o.sill-0.017, c, TRM);
      B(0.12, 0.04, w+0.10, f-out*(WT/2+0.05), o.sill+0.02, c, OAK);
      for(const sd of [-1,1]) B(0.05, 0.10, L, f+out*(WT/2+0.04+(sd>0?0.004:0)), o.head+0.10+rise/2, c+sd*(w/2+0.14)/2, TRM, 0, sd*th, 0); } };
  glaze("x", H.z1-WT/2, FRONT[0], 1); glaze("x", H.z1-WT/2, FRONT[2], 1);
  for(const o of SIDE){ glaze("z", H.x0+WT/2, o, -1); glaze("z", H.x1-WT/2, o, 1); }
  for(const o of SIDE) for(const x of [H.x0, H.x1-WT]) addCol(x, x+WT, o.a, o.b, o.sill, o.head);
  for(const o of [FRONT[0], FRONT[2]]) addCol(o.a, o.b, H.z1-WT, H.z1, o.sill, o.head);

  // the doors: red, a pair under a transom, each opening in; their frame
  frX(H.z1-WT/2, WT, DOOR.a, DOOR.b, FF, DOOR.head, TRM);
  B(DOOR.b-DOOR.a+0.01, 0.10, WT+0.04, (DOOR.a+DOOR.b)/2, FF+2.11, H.z1-WT/2, TRM);
  push("glass", planeGeo(DOOR.b-DOOR.a-0.04, DOOR.head-FF-2.18, 0), (DOOR.a+DOOR.b)/2, (FF+2.16+DOOR.head)/2, H.z1-WT/2, 0, "#ffffff");
  makeDoor(XF(DOOR.a+0.02, H.z1-WT/2, 0), 0, FF+0.01, 0, "THE CHAPEL", false, 0, "closet", 0x8a2418);
  makeDoor(XF(DOOR.b-0.02, H.z1-WT/2, Math.PI), 0, FF+0.01, 0, "THE CHAPEL", true, 0, "closet", 0x8a2418);
  // the lantern over them
  B(0.10, 0.10, 0.20, xm, FF+2.98, H.z1+0.10, "#2a2a2c"); push("chapel_globe", new T.SphereGeometry(0.10, 14, 10), xm, FF+2.84, H.z1+0.22, 0, "#ffffff");
  C(0.11, 0.03, xm, FF+2.96, H.z1+0.22, "#2a2a2c", 14);
  LAMPS.push({x:xm, y:FF+2.7, z:H.z1+0.6, color:0xffd8a0, intensity:0.6, dist:9, decay:1.6, mothy:true});

  // the stoop, four equal risers to it; a pipe rail down each side
  { const SA={a:87.0, b:90.0}, LT=FF-0.02, D0=H.z1+1.6;
    B(SA.b-SA.a, LT-Y+0.1, 1.6, xm, (LT+Y-0.1)/2, H.z1+0.8, "#a8a49a"); addFlat(SA.a, SA.b, H.z1-0.005, D0+0.005, LT);
    for(let k=1;k<=3;k++){ const y=Y+(LT-Y)*(4-k)/4, zz=D0+0.15+(k-1)*0.30;
      B(2.6, y-Y+0.1, 0.30, xm, (y+Y-0.1)/2, zz, k%2?"#a8a49a":"#a29e94"); addFlat(87.25, 89.75, zz-0.155, zz+0.155, y); }
    for(const x of [87.12, 89.88]){ const a=V3(x, LT+0.90, H.z1+0.25), b=V3(x, LT+0.90, D0), c=V3(x, Y+0.90+0.06, D0+0.95);
      tubeE(a, b, 0.02, "#1e1e20"); tubeE(b, c, 0.02, "#1e1e20"); ent(new T.SphereGeometry(0.02, 8, 6), b.x, b.y, b.z, "#1e1e20");
      for(const p of [a, b, c]) tubeE(V3(p.x, p.y, p.z), V3(p.x, p.z<D0+0.5 ? LT : Y+0.13, p.z), 0.016, "#1e1e20");
      addCol(x-0.05, x+0.05, H.z1, D0+1.0, Y-0.5, LT+0.95); }
    // the walk: down to the road, and across to the lot
    bx("concrete", 1.5, 0.12, Z-5.3-(D0+0.85), xm, Y-0.01, (D0+0.85+Z-5.3)/2, 0.5, 0, "#bab6ac");
    addFlat(xm-0.75, xm+0.75, D0+0.85, Z-5.3, Y+0.05);
    bx("concrete", 87.8-78.0, 0.11, 1.2, (78.0+87.8)/2, Y-0.015, Z-17.8, 0.5, 0, "#b4b0a6");
    addFlat(78.0, xm-0.75, Z-18.4, Z-17.2, Y+0.04); }

  // the roof: steep, shingled, the ridge along the nave; gable ends in clapboard; fascias up the rakes
  { const ov=0.40, xa=H.x0-ov, xb=H.x1+ov, za=H.z0-0.30, zb=H.z1+0.30, yo=EAV-(RID-EAV)/((H.x1-H.x0)/2)*ov, e=0.012;
    slab("shingle", [V3(xa, yo, za), V3(xa, yo, zb), V3(xm, RID, zb), V3(xm, RID, za)], 0.15, "#4e5256");
    slab("shingle", [V3(xb, yo, zb+e), V3(xb, yo, za-e), V3(xm, RID, za-e), V3(xm, RID, zb+e)], 0.15, "#4e5256");
    B(0.22, 0.08, zb-za+0.06, xm, RID+0.02, (za+zb)/2, "#3e4246");
    for(const z of [H.z1-WT/2, H.z0+WT/2]){
      const tri=[V3(H.x0+0.01, EAV, z+WT/2), V3(H.x1-0.01, EAV, z+WT/2), V3(xm, RID-0.12, z+WT/2)];
      push("fh_clap", new FaceGeo().slab(tri, WT, 0.5).geo(), 0,0,0, 0, "#ffffff"); }
    const L=Math.hypot(xm-xa, RID-yo), th=Math.atan2(RID-yo, xm-xa);
    for(const z of [za-0.02, zb+0.02]) for(const sd of [-1,1])
      B(L, 0.20, 0.04+(sd>0?0.008:0), xm+sd*(xm-xa)/2, (RID+yo)/2-0.10, z, TRM, 0, 0, -sd*th);
    for(const x of [xa-0.02, xb+0.02]) B(0.04, 0.18, zb-za, x, yo-0.08, (za+zb)/2, TRM);
    // a round louvred vent high in the back gable
    C(0.36, 0.05, xm, EAV+1.7, H.z0-0.02, TRM, 24, Math.PI/2); C(0.29, 0.05, xm, EAV+1.7, H.z0-0.035, "#5a5e60", 24, Math.PI/2); }

  // the steeple: a square tower up through the front of the roof, the belfry with its louvres and the bell
  // hanging in it, a cornice, the spire, the cross
  { const tz=H.z1-1.5, h0=RID-1.3, h1=RID+1.5, h2=RID+3.3, TW=2.2;
    bx("fh_clap", TW, h1-h0, TW, xm, (h0+h1)/2, tz, 0.5, 0, "#ffffff");
    for(const sx of [-1,1]) for(const sz of [-1,1]) B(0.16, h1-0.01-(RID-1.2), 0.16, xm+sx*TW/2, (h1-0.01+RID-1.2)/2, tz+sz*TW/2, TRM);
    B(TW+0.24, 0.14, TW+0.24, xm, h1+0.05, tz, TRM);
    for(const sx of [-1,1]) for(const sz of [-1,1]) B(0.22, h2-h1-0.1, 0.22, xm+sx*(TW/2-0.11), (h1+0.12+h2-0.02)/2, tz+sz*(TW/2-0.11), TRM);
    for(let y=h1+0.24; y<h2-0.12; y+=0.16) for(const sd of [-1,1]){
      B(TW-0.42, 0.025, 0.14, xm, y, tz+sd*(TW/2-0.10), "#e2e0d8", 0, sd*0.65);
      B(0.14, 0.025, TW-0.42, xm+sd*(TW/2-0.10), y, tz, "#e2e0d8", 0, 0, -sd*0.65); }
    B(TW-0.30, 0.10, TW-0.30, xm, h1+0.175, tz, "#6a6a66");
    ent(new T.CylinderGeometry(0.26, 0.40, 0.56, 22), xm, h1+1.00, tz, "#7a6034"); ent(new T.SphereGeometry(0.26, 18, 10, 0, Math.PI*2, 0, Math.PI/2), xm, h1+1.28, tz, "#7a6034");
    B(0.10, 0.20, 0.50, xm, h1+1.46, tz, "#3a3028"); B(0.06, 0.06, TW-0.5, xm, h1+1.56, tz, "#3a3028");
    B(TW+0.40, 0.22, TW+0.40, xm, h2+0.11, tz, TRM);
    { const g=new T.ConeGeometry(TW/2*Math.SQRT2+0.06, 5.2, 4, 1), U=g.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, U.getX(k)*4.6, U.getY(k)*2.6);
      push("shingle", g, xm, h2+0.20+2.6, tz, Math.PI/4, "#4e5256"); }
    B(0.09, 1.10, 0.09, xm, h2+0.22+5.2+0.45, tz, "#c9a34a"); B(0.56, 0.09, 0.09, xm, h2+0.22+5.2+0.62, tz, "#c9a34a"); }

  // inside: the chancel across the north end, up two steps, its carpet
  const PZ=IZ0+3.4, PY=FF+0.38;
  bx("wood", IX1-IX0-0.02, PY-(FF-0.1), PZ-(IZ0+0.01), xm, (PY+FF-0.1)/2, (IZ0+0.01+PZ)/2, 0.5, 0, "#7a5634");
  bx("wood", 5.0, FF+0.19-(FF-0.08), 0.34, xm, (FF+0.19+FF-0.08)/2, PZ+0.16, 0.5, 0, "#7a5634");
  B(5.0, 0.006, 3.0, xm, PY+0.010, IZ0+1.85, "#8a1e22");
  addFlat(IX0, IX1, IZ0, PZ, PY); addFlat(xm-2.5, xm+2.5, PZ-0.01, PZ+0.33, FF+0.19);
  // the runner up the aisle
  B(1.0, 0.006, (IZ1-0.3)-(PZ+0.38), xm, FF+0.012, (IZ1-0.3+PZ+0.38)/2, "#8a1e22");
  // the cross on the back wall
  B(0.10, 1.40, 0.06, xm, FF+2.95, IZ0+0.045, "#b08a4a"); B(0.70, 0.10, 0.06, xm, FF+3.25, IZ0+0.045, "#b08a4a");
  // the table, its cloth, the candles and the book
  { const tx=xm, tz=IZ0+1.25;
    B(1.80, 0.05, 0.75, tx, PY+0.85, tz, OAK);
    for(const dx of [-0.84,0.84]) for(const dz of [-0.32,0.32]) B(0.06, 0.83, 0.06, tx+dx, PY+0.415, tz+dz, OAK);
    B(1.86, 0.012, 0.81, tx, PY+0.881, tz, "#f4f2ea"); B(0.40, 0.55, 0.012, tx, PY+0.60, tz+0.411, "#7a1e22");
    for(const dx of [-0.62, 0.62]){ C(0.05, 0.03, tx+dx, PY+0.902, tz-0.12, "#c9a34a", 14); C(0.018, 0.28, tx+dx, PY+1.03, tz-0.12, "#c9a34a", 10);
      C(0.014, 0.20, tx+dx, PY+1.27, tz-0.12, "#f4f0e2", 10); }
    for(const sd of [-1,1]) B(0.20, 0.025, 0.26, tx+sd*0.105, PY+0.905, tz+0.05, "#f2ecd8", 0, 0, sd*0.12);
    addCol(tx-0.95, tx+0.95, tz-0.42, tz+0.42, PY-0.5, PY+1.0); }
  // the pulpit, a cross let into its front; the hymn board on the east wall; the piano
  { const px=IX0+1.3, pz=IZ0+2.55;
    B(0.85, 1.05, 0.65, px, PY+0.525, pz, OAK); B(0.95, 0.05, 0.75, px, PY+1.08, pz, "#6a4628", 0, -0.18);
    B(0.06, 0.42, 0.012, px, PY+0.60, pz+0.329, "#c9a34a"); B(0.26, 0.06, 0.012, px, PY+0.70, pz+0.329, "#c9a34a");
    addCol(px-0.45, px+0.45, pz-0.36, pz+0.36, PY-0.5, PY+1.1);
    addUse(px, pz+0.9, PY, "THE PULPIT", ()=>toast(["THE BIBLE ON IT IS OPEN TO RUTH. HYMN NUMBERS PENCILLED IN THE MARGIN","A GLASS OF WATER, A LONG TIME POURED. A NOTE: “CALL THE WEIRS RE: SUPPER”","FROM UP HERE THE PEWS LOOK FULLER THAN THEY ARE"][(Math.random()*3)|0], "#e8dcc0"), 0.9); }
  { const hx=IX1-0.035, hz=IZ0+4.6;
    B(0.04, 0.90, 0.56, hx, FF+2.05, hz, "#3a2418");
    sign(0.50, 0.84, (c,W,Hh)=>{ c.fillStyle="#2a1a10"; c.fillRect(0,0,W,Hh); c.strokeStyle="#c9a34a"; c.lineWidth=4; c.strokeRect(5,5,W-10,Hh-10);
        say(c, "HYMNS", W/2, Hh*0.15, W*0.74, Hh*0.09, "#e8d8a8", "700", "Georgia, serif");
        const N=["128","403","92"], s=sizeAll(c, N, W*0.70, Hh*0.17, "700", "Georgia, serif");
        N.forEach((t,k)=>say(c, t, W/2, Hh*(0.37+k*0.22), W*0.70, s, "#f4ecd8", "700", "Georgia, serif")); },
      hx-0.031, FF+2.05, hz, -Math.PI/2, false, 200); }
  { const px=IX1-0.40, pz=IZ0+1.9;
    B(0.58, 1.26, 1.50, px, PY+0.63, pz, "#3a2418"); B(0.30, 0.04, 1.46, px-0.40, PY+0.74, pz, "#3a2418");
    B(0.16, 0.02, 1.22, px-0.36, PY+0.765, pz, "#f4f0e2"); for(let k=0;k<26;k++) if(k%7!==2 && k%7!==6) B(0.10, 0.02, 0.012, px-0.33, PY+0.782, pz-0.58+k*0.046, "#141414");
    B(0.02, 0.24, 0.40, px-0.305, PY+1.08, pz, "#f0e8d4");
    B(0.36, 0.48, 0.90, px-0.85, PY+0.24, pz, "#3a2418");
    addCol(px-0.42, IX1, pz-0.76, pz+0.76, PY-0.5, PY+1.3); addCol(px-1.05, px-0.65, pz-0.46, pz+0.46, PY-0.5, PY+0.5);
    addSeat(px-0.85, pz, PY, -Math.PI/2, "THE PIANO BENCH");
    addUse(px-1.1, pz, PY, "PLAY THE PIANO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", px, pz); toast(["“AMAZING GRACE”, ONE FINGER, THE FIRST LINE","THE LOW E IS OUT OF TUNE. SOMEBODY'S TAPED A NOTE TO IT: “WE KNOW”","“IN THE GARDEN”, FROM THE HYMNAL ON THE STAND, SLOWLY"][(Math.random()*3)|0], "#e8c46a"); }, 0.9); }

  // the pews: eight rows either side of the aisle, a rack on each back for the hymnals
  for(let k=0;k<8;k++){ const pz=Z-32.6+k*0.95;
    for(const [x0,x1] of [[84.9, 87.7],[89.3, 92.1]]){ const L=x1-x0, cx=(x0+x1)/2;
      B(L-0.06, 0.05, 0.42, cx, FF+0.45, pz, OAK); B(L-0.06, 0.52, 0.05, cx, FF+0.78, pz+0.215, OAK, 0, 0.10);
      for(const x of [x0+0.03, x1-0.03]) B(0.06, 0.95, 0.52, x, FF+0.475, pz+0.03, "#6a4628");
      B(L-0.16, 0.16, 0.09, cx, FF+0.70, pz+0.26, "#6a4628");
      for(let b=0;b<Math.floor((L-0.3)/0.5);b++) B(0.14, 0.20, 0.035, x0+0.30+b*0.5+(k%3)*0.07, FF+0.80, pz+0.30, ["#1f3f6a","#7a1a12","#1f3f6a"][b%3]);
      addCol(x0, x1, pz-0.23, pz+0.35, FF-0.5, FF+0.98);
      if(k%2===0){ const sx=x0<xm ? x1-0.42 : x0+0.42; addSeat(sx, pz, FF, 0, "A PEW"); } } }
  // at the back: the bell rope through the ceiling, the guest book on its table, pegs by the door
  { const bxr=90.7, bzr=IZ1-0.9;
    tubeE(V3(bxr, CL+0.05, bzr), V3(bxr, FF+1.05, bzr), 0.012, "#c8b48a");
    C(0.03, 0.36, bxr, FF+1.28, bzr, "#9a2a2a", 12); B(0.12, 0.10, 0.12, bxr, CL-0.02, bzr, "#6a6a66");
    addUse(bxr, bzr+0.6, FF, "PULL THE BELL ROPE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("bell", xm, H.z1-1.5);
      toast(["THE ROPE GOES UP, AND UP THERE THE BELL SPEAKS. THE CORN HEARS IT FOR MILES","ONCE, AND AGAIN. A DOG ON THE NEXT FARM ANSWERS","IT RINGS. NOBODY COMES. IT ISN'T SUNDAY"][(Math.random()*3)|0], "#e8dcc0"); }, 0.9); }
  { const gx=IX0+0.30, gz=IZ1-1.2;
    B(0.50, 0.04, 0.90, gx, FF+0.78, gz, OAK); for(const dz of [-0.40,0.40]) for(const dx of [-0.20,0.20]) B(0.04, 0.76, 0.04, gx+dx, FF+0.38, gz+dz, OAK);
    for(const sd of [-1,1]) B(0.20, 0.025, 0.26, gx, FF+0.815, gz+sd*0.105, "#f2ecd8", 0, sd*0.12);
    tubeE(V3(gx+0.10, FF+0.83, gz-0.20), V3(gx+0.14, FF+0.83, gz-0.33), 0.006, "#1a1a1a");
    B(0.22, 0.03, 0.22, gx, FF+0.815, gz+0.33, "#c9a34a");
    addCol(gx-0.27, gx+0.27, gz-0.47, gz+0.47, FF-0.5, FF+0.85);
    addUse(gx+0.7, gz, FF, "THE GUEST BOOK", ()=>toast(["THE LAST NAME IN IT IS FROM OHIO, LAST WEEK. YOU ADD YOURS: “PASSING THROUGH”","“MARRIED HERE 1968, BACK FOR THE FIRST TIME.” TWO NAMES, ONE HAND","A CHILD HAS DRAWN THE STEEPLE. IT IS TALLER THAN THE CORN, WHICH IS TRUE"][(Math.random()*3)|0], "#e8dcc0"), 0.9);
    B(1.4, 0.10, 0.03, 86.65, FF+1.65, IZ1-0.032, OAK);
    for(let k=0;k<5;k++) C(0.012, 0.09, 86.1+k*0.28, FF+1.65, IZ1-0.08, "#3a2a1a", 8, Math.PI/2); }
  // the lamps: three schoolhouse globes down the nave on their rods
  for(const z of [Z-34.5, Z-30.0, Z-25.5]){
    tubeE(V3(xm, CL+0.02, z), V3(xm, CL-0.75, z), 0.012, "#2a2a2c"); C(0.13, 0.04, xm, CL-0.77, z, "#2a2a2c", 16);
    push("chapel_globe", new T.SphereGeometry(0.17, 18, 12), xm, CL-0.93, z, 0, "#ffffff");
    LAMPS.push({x:xm, y:CL-1.1, z:z, color:0xffe2b8, intensity:0.8, dist:9, decay:1.5, indoor:true, vol:[IX0, IX1, IZ0, IZ1, FF-0.5, CL]}); }
  addZone(E.chapel.x0, E.chapel.x1, E.chapel.z0, E.chapel.z1, Y-2, Y+14, "FRENCH CREEK UNION CHAPEL");
  addZone(IX0, IX1, IZ0, IZ1, FF-0.5, CL, "THE CHAPEL", true);

  /* ---- the fellowship hall under it ----
       inside the foundation, x HX0..HX1, z HZ0..HZ1, floor BF, a drop ceiling at CL2; the only way in is the outside
       stair behind the chapel, down to the white door in the back wall. Set out for Saturday's harvest supper: six
       folding tables in checked cloths, the chairs round them, yellow balloons on the columns down the middle, the
       kitchen across the south end behind its counter. BURIED (06): its light is the same at any hour */
  { const lamp=(o)=>{ o.under=true; o.indoor=true; o.circ="bldg"; LAMPS.push(o); return o; };
    const tex=(w, h, draw)=>{ const t=signTex(w, h, draw); t.wrapS=t.wrapT=T.RepeatWrapping; return t; };
    // the floor in speckled vinyl tile, a foot square; the wainscot in grooved tan panelling; the ceiling's tiles in their grid
    bucketOf("hall_vct", ()=>new T.MeshStandardMaterial({roughness:0.5, map:tex(256, 256, (c,W,Hh)=>{ const q=_trng(808);
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ c.fillStyle=(i+j)%2 ? "#d6cab0" : "#e6dcc4"; c.fillRect(i*128, j*128, 128, 128);
        for(let k=0;k<170;k++){ c.fillStyle=q()<0.5 ? "rgba(120,98,66,0.28)" : "rgba(255,255,255,0.40)"; c.fillRect(i*128+q()*126, j*128+q()*126, 1+q()*3, 1+q()*2); } }
      c.fillStyle="rgba(90,78,58,0.30)"; for(const v of [0,127]){ c.fillRect(v, 0, 1, Hh); c.fillRect(0, v, W, 1); } })}));
    bucketOf("hall_wains", ()=>new T.MeshStandardMaterial({roughness:0.65, map:tex(128, 128, (c,W,Hh)=>{ const q=_trng(717);
      c.fillStyle="#c9a676"; c.fillRect(0,0,W,Hh);
      for(let k=0;k<40;k++){ c.strokeStyle="rgba(110,78,42,"+(0.05+q()*0.12).toFixed(2)+")"; c.lineWidth=1+q()*2; const x=q()*W; c.beginPath(); c.moveTo(x,0); c.lineTo(x+(q()-0.5)*4, Hh); c.stroke(); }
      for(let k=0;k<4;k++){ c.fillStyle="rgba(70,46,22,0.55)"; c.fillRect(k*32, 0, 2, Hh); c.fillStyle="rgba(255,240,210,0.25)"; c.fillRect(k*32+2, 0, 1, Hh); } })}));
    bucketOf("hall_ceil", ()=>new T.MeshStandardMaterial({roughness:0.95, map:tex(128, 128, (c,W,Hh)=>{ const q=_trng(909);
      c.fillStyle="#f2f0ea"; c.fillRect(0,0,W,Hh);
      for(let k=0;k<520;k++){ c.fillStyle="rgba(120,114,104,"+(0.10+q()*0.25).toFixed(2)+")"; c.fillRect(q()*W, q()*Hh, 1+q()*1.5, 1); }
      c.fillStyle="#dcdad4"; c.fillRect(0,0,W,4); c.fillRect(0,0,4,Hh); c.fillStyle="#aeaca6"; c.fillRect(0,4,W,1); c.fillRect(4,0,1,Hh); })}));
    // the cloths: gingham, white and one colour, three of them
    const GING={b:"#3a62a8", y:"#e0b020", g:"#7c8088"};
    for(const k in GING) bucketOf("hall_ging_"+k, ()=>new T.MeshStandardMaterial({roughness:0.92, map:tex(64, 64, (c,W,Hh)=>{
      c.fillStyle="#f6f4ee"; c.fillRect(0,0,W,Hh); c.fillStyle=GING[k]; c.globalAlpha=0.5;
      for(let i=0;i<8;i+=2){ c.fillRect(i*8, 0, 8, Hh); c.fillRect(0, i*8, W, 8); } c.globalAlpha=1; })}));
    bucketOf("hall_balloon", ()=>new T.MeshStandardMaterial({roughness:0.22, metalness:0.0}));

    // the shell: the floor, the walls lined (panelling to the chair rail, paint over it), the ceiling
    floorAt("hall_vct", HX0, HX1, HZ0, HZ1, BF+0.004, "#ffffff", 1/0.6);
    for(const [y0,y1,bk,col,uv] of [[BF, BF+0.95, "hall_wains", "#ffffff", 1/0.6],[BF+0.95, CL2, "plaster", "#f1ede4", 0.5]]){
      lineX(bk, HZ0, 1, HX0, HX1, y0, y1, [BDOOR], col, uv);
      lineX(bk, HZ1, -1, HX0, HX1, y0, y1, [], col, uv);
      lineZ(bk, HX0, 1, HZ0, HZ1, y0, y1, BWIN, col, uv);
      lineZ(bk, HX1, -1, HZ0, HZ1, y0, y1, BWIN, col, uv); }
    ceilAt("hall_ceil", HX0, HX1, HZ0, HZ1, CL2, "#ffffff", 1/0.6);
    // the chair rail and the cove base: sunk 5 mm into the wall; the runs along z a few millimetres taller than those
    // along x, so where they meet in a corner no faces lie together
    { const runs=(a, b, L, y)=>{ const out=[]; let q=a;
        for(const o of (L||[]).filter(o=>o.sill<y && o.head>y && o.b>a && o.a<b).sort((p,q2)=>p.a-q2.a)){ if(o.a-0.06>q+0.05) out.push([q, o.a-0.06]); q=Math.max(q, o.b+0.06); }
        if(b>q+0.05) out.push([q, b]); return out; };
      for(const [f, dir, L] of [[HZ0, 1, [BDOOR]], [HZ1, -1, []]]){
        for(const [a,b] of runs(HX0, HX1, L, BF+0.05)) B(b-a, 0.10, 0.025, (a+b)/2, BF+0.05, f+dir*0.0075, "#4a3a2c");
        for(const [a,b] of runs(HX0, HX1, L, BF+0.95)) B(b-a, 0.06, 0.04, (a+b)/2, BF+0.95, f+dir*0.015, "#f4f2ec"); }
      for(const [f, dir] of [[HX0, 1], [HX1, -1]]){
        for(const [a,b] of runs(HZ0+0.005, HZ1-0.005, BWIN, BF+0.05)) B(0.025, 0.105, b-a, f+dir*0.0075, BF+0.0525, (a+b)/2, "#4a3a2c");
        for(const [a,b] of runs(HZ0+0.005, HZ1-0.005, BWIN, BF+0.95)) B(0.04, 0.065, b-a, f+dir*0.015, BF+0.9525, (a+b)/2, "#f4f2ec"); } }
    addFlat(HX0, HX1, HZ0, HZ1, BF);
    addVoid(HX0, HX1, HZ0, HZ1, BF-3, Y-0.15, BF);
    addBuried(HX0, HX1, HZ0, HZ1, BF-0.5, CL2+0.05, 0);
    addZone(HX0, HX1, HZ0, HZ1, BF-0.5, CL2, "THE FELLOWSHIP HALL", true);

    // the windows: small, high, just over the grass outside; frosted, white jambs lining the stone, a checked valance
    for(const o of BWIN) for(const [f, out] of [[F.x0+FT/2, -1],[F.x1-FT/2, 1]]){
      const c=(o.a+o.b)/2, w=o.b-o.a, h=o.head-o.sill, inn=f-out*(FT/2+0.012);
      B(0.012, h-0.04, w-0.04, f+out*0.06, (o.sill+o.head)/2, c, "#c4cec9");
      B(FT+0.024, 0.02, w+0.008, f, o.sill+0.01, c, "#f4f2ec"); B(FT+0.024, 0.02, w+0.008, f, o.head-0.01, c, "#f4f2ec");
      for(const z of [o.a+0.01, o.b-0.01]) B(FT+0.024, h-0.04, 0.02, f, (o.sill+o.head)/2, z, "#f4f2ec");
      B(0.05, 0.03, w+0.14, inn-out*0.02, o.sill-0.012, c, "#f4f2ec");
      push("hall_ging_y", boxGeo(0.008, 0.12, w+0.10, 4), inn-out*0.03, o.head-0.04, c, 0, "#ffffff");
      tubeE(V3(inn-out*0.02, o.head+0.03, c-w/2-0.08), V3(inn-out*0.02, o.head+0.03, c+w/2+0.08), 0.006, "#c9b07a"); }

    // the door in from the stair: white, in a white frame; the threshold; the clock over it
    frX(F.z0+FT/2, FT, BDOOR.a, BDOOR.b, BF, BDOOR.head, "#f4f2ec");
    makeDoor(XF(BDOOR.a+0.02, F.z0+FT/2, 0), 0, BF+0.01, 0, "THE FELLOWSHIP HALL", true, 0, "closet", 0xf2f0e8);
    B(BDOOR.b-BDOOR.a+0.004, 0.016, FT+0.03, (BDOOR.a+BDOOR.b)/2, BF+0.008, F.z0+FT/2, "#8a6a44");
    addFlat(BDOOR.a, BDOOR.b, F.z0-0.01, HZ0+0.01, BF);
    addVoid(BDOOR.a, BDOOR.b, F.z0-0.02, HZ0+0.02, BF-3, Y-0.15, BF);
    C(0.16, 0.04, 86.0, BF+2.45, HZ0+0.026, "#2a2a2c", 24, Math.PI/2); C(0.145, 0.006, 86.0, BF+2.45, HZ0+0.049, "#f6f4ec", 24, Math.PI/2);
    for(const [th, L, w, d] of [[1.05, 0.12, 0.010, 0.055],[-2.0, 0.08, 0.012, 0.059]]) B(w, L, 0.004, 86.0+Math.sin(th)*L/2, BF+2.45+Math.cos(th)*L/2, HZ0+d, "#1a1a1a", 0, 0, -th);

    // the lights: fluorescent troffers in the grid, their prismatic lenses a centimetre under the frames
    for(const z of [Z-35.0, Z-31.1, Z-27.2]) for(const x of [86.4, 90.6]){
      B(0.62, 0.035, 1.22, x, CL2-0.0075, z, "#e8e6e0"); push("tube", boxGeo(0.54, 0.008, 1.14, 0), x, CL2-0.031, z, 0, "#ffffff"); }
    B(1.22, 0.035, 0.62, 86.9, CL2-0.0075, Z-23.6, "#e8e6e0"); push("tube", boxGeo(1.14, 0.008, 0.54, 0), 86.9, CL2-0.031, Z-23.6, 0, "#ffffff");
    for(const z of [Z-34.8, Z-30.4, Z-26.2]) lamp({x:88.5, y:CL2-0.35, z:z, color:0xf2f4ee, intensity:0.72, dist:9, decay:1.5});
    lamp({x:86.9, y:CL2-0.35, z:Z-23.6, color:0xf4f2ea, intensity:0.55, dist:6, decay:1.5});

    // the columns down the middle, white, a square plate top and bottom; yellow balloons tied to each
    const balloon=(x, y, z, col, s)=>{ push("hall_balloon", new T.SphereGeometry(0.13*(s||1), 16, 12).scale(1, 1.16, 1), x, y, z, 0, col);
      ent(new T.ConeGeometry(0.018, 0.035, 8), x, y-0.15*(s||1)-0.012, z, col, Math.PI); };
    const ribbon=(a, b)=>{ const m=a.clone().lerp(b, 0.5).add(V3(0.03, 0, -0.02)); tubeE(a, m, 0.003, "#f4f2ea"); tubeE(m, b, 0.003, "#f4f2ea"); };
    const q=_trng(3131);
    for(const z of [Z-32.6, Z-29.6, Z-26.6]){ const x=88.5;
      B(0.26, 0.04, 0.26, x, BF+0.01, z, "#e8e6e0"); B(0.26, 0.04, 0.26, x, CL2-0.01, z, "#e8e6e0");
      C(0.09, CL2-BF-0.06, x, (BF+CL2)/2, z, "#f4f2ee", 18); C(0.105, 0.05, x, BF+0.055, z, "#e8e6e0", 18);
      addCol(x-0.14, x+0.14, z-0.14, z+0.14, BF-0.5, CL2);
      const tie=V3(x+0.09, BF+1.55, z);
      for(let k=0;k<3;k++){ const a=k*2.1+q()*0.6, bx0=x+Math.cos(a)*0.24, bz0=z+Math.sin(a)*0.24, by=BF+2.08+q()*0.30;
        balloon(bx0, by, bz0, k===2 && z===Z-29.6 ? "#f6f4ea" : "#f2c41a"); ribbon(V3(bx0, by-0.19, bz0), tie); }
      B(0.03, 0.03, 0.03, tie.x, tie.y, tie.z, "#f2c41a"); }
    // two that got away, up against the tiles; one gone soft on the floor by the wall
    for(const [x,z] of [[91.9, Z-30.9],[85.2, Z-28.0]]){ balloon(x, CL2-0.17, z, "#f2c41a"); tubeE(V3(x, CL2-0.33, z), V3(x+0.05, BF+1.20, z+0.04), 0.003, "#f4f2ea"); }
    push("hall_balloon", new T.SphereGeometry(0.10, 14, 10).scale(1.2, 0.55, 1), 92.35, BF+0.065, Z-34.4, 0.4, "#e8b81a");

    // the tables: six of them in three rows, a checked cloth over each hanging a hand's length, folding legs under;
    // the chairs round them, steel, putty-coloured, three a side; a jar of asters and a gourd on each
    const chair=(x, z, ry)=>{ const f=XF(x, z, ry), P=(lx,ly,lz)=>V3(f.x(lx,lz), BF+ly, f.z(lx,lz)),
        qq=(w,h,d,lx,ly,lz,c,rx)=>ent(boxGeo(w,h,d), f.x(lx,lz), BF+ly, f.z(lx,lz), c, rx||0, ry, 0);
      qq(0.40, 0.025, 0.38, 0, 0.455, 0.01, "#c4b89e");
      qq(0.36, 0.16, 0.022, 0, 0.80, -0.205, "#c4b89e", -0.10);
      for(const sx of [-0.19, 0.19]){ tubeE(P(sx, 0.01, -0.21), P(sx, 0.89, -0.235), 0.011, "#8a8476"); tubeE(P(sx, 0.01, 0.20), P(sx, 0.445, 0.17), 0.011, "#8a8476");
        ent(new T.CylinderGeometry(0.014, 0.014, 0.02, 8), f.x(sx, 0.20), BF+0.01, f.z(sx, 0.20), "#2a2a2a"); ent(new T.CylinderGeometry(0.014, 0.014, 0.02, 8), f.x(sx, -0.21), BF+0.01, f.z(sx, -0.21), "#2a2a2a"); }
      tubeE(P(-0.19, 0.13, 0.19), P(0.19, 0.13, 0.19), 0.008, "#8a8476"); tubeE(P(-0.19, 0.30, -0.215), P(0.19, 0.30, -0.215), 0.008, "#8a8476");
      addCol(x-0.22, x+0.22, z-0.22, z+0.22, BF-0.5, BF+0.92); };
    const CLOTH=["b","y","g","y","g","b"];
    [[86.2, Z-32.6],[90.8, Z-32.6],[86.2, Z-29.6],[90.8, Z-29.6],[86.2, Z-26.6],[90.8, Z-26.6]].forEach(([tx, tz], i)=>{
      const top=BF+0.75;
      push("hall_ging_"+CLOTH[i], boxGeo(2.52, 0.27, 0.86, 4), tx, top-0.135, tz, 0, "#ffffff");
      for(const sx of [-1,1]){ for(const sz of [-1,1]) tubeE(V3(tx+sx*1.05, top-0.20, tz+sz*0.30), V3(tx+sx*1.05, BF+0.01, tz+sz*0.30), 0.012, "#5a5c60");
        tubeE(V3(tx+sx*1.05, BF+0.12, tz-0.30), V3(tx+sx*1.05, BF+0.12, tz+0.30), 0.009, "#5a5c60"); }
      addCol(tx-1.26, tx+1.26, tz-0.43, tz+0.43, BF-0.5, top);
      // on it: a canning jar of asters, a little gourd, salt and pepper
      C(0.045, 0.13, tx-0.15, top+0.067, tz, "#c8dcd4", 14); C(0.040, 0.008, tx-0.15, top+0.136, tz, "#c9a34a", 14);
      for(let k=0;k<5;k++){ const a=k*1.26, fx=tx-0.15+Math.cos(a)*0.035, fz=tz+Math.sin(a)*0.035;
        tubeE(V3(tx-0.15, top+0.12, tz), V3(fx, top+0.22+k%2*0.03, fz), 0.003, "#4a6a2a");
        ent(new T.SphereGeometry(0.022, 8, 6), fx, top+0.23+k%2*0.03, fz, ["#8a5ab8","#f4f2ea","#b85a9a"][k%3]); }
      ent(new T.SphereGeometry(0.06, 12, 8).scale(1, 0.7, 1), tx+0.20, top+0.044, tz+0.08, i%2 ? "#d8781e" : "#e0c25a");
      C(0.015, 0.08, tx+0.20, top+0.10, tz+0.08, "#5a6a2a", 6);
      for(const [dx,col] of [[0.42,"#f4f2ec"],[0.47,"#3a3a3a"]]){ C(0.016, 0.06, tx+dx, top+0.032, tz-0.12, "#d8dcdc", 10); C(0.017, 0.012, tx+dx, top+0.068, tz-0.12, col, 10); }
      for(const sx of [-0.8, 0, 0.8]){
        const j1=(q()-0.5)*0.06, j2=(q()-0.5)*0.06;
        chair(tx+sx+j1, tz-0.64, (q()-0.5)*0.14); chair(tx+sx+j2, tz+0.64, Math.PI+(q()-0.5)*0.14);
        if(sx===0){ addSeat(tx+j1, tz-0.64, BF, Math.PI, "A FOLDING CHAIR"); addSeat(tx+j2, tz+0.64, BF, 0, "A FOLDING CHAIR"); } } });

    // the north end, by the door: the coat rail, the bulletin board, the banner, the offering table, the chair cart
    { B(1.6, 0.10, 0.025, HX0+0.0175, BF+1.62, Z-36.0, "#6a4a2c", Math.PI/2);
      for(let k=0;k<6;k++) C(0.010, 0.08, HX0+0.06, BF+1.63, Z-36.6+k*0.24, "#2a2a2a", 8, 0, 0, Math.PI/2);
      for(const [z, col] of [[Z-36.36, "#3a4a2a"],[Z-35.4, "#8a2a22"]]){
        ent(rboxGeo(0.12, 0.82, 0.46, 0.04, 2), HX0+0.11, BF+1.18, z, col); ent(new T.SphereGeometry(0.09, 10, 8).scale(0.8, 0.6, 2.2), HX0+0.11, BF+1.58, z, col); }
      B(0.40, 0.02, 0.9, HX0+0.24, BF+0.01, Z-36.0, "#1e1e1e");
      addCol(HX0, HX0+0.45, Z-36.9, Z-35.1, BF-0.5, BF+1.7);
      B(1.44, 0.96, 0.03, 87.62, BF+1.50, HZ0+0.021, "#6a4a2c"); B(1.36, 0.88, 0.012, 87.62, BF+1.50, HZ0+0.042, "#b48858");
      sign(1.32, 0.84, (c,W,Hh)=>{ c.fillStyle="#b48858"; c.fillRect(0,0,W,Hh); const q2=_trng(52); for(let k=0;k<900;k++){ c.fillStyle=q2()<0.5 ? "rgba(90,58,30,0.30)" : "rgba(230,190,140,0.30)"; c.fillRect(q2()*W, q2()*Hh, 2, 2); }
          const note=(x,y,w,h,bg,L,col,rot)=>{ c.save(); c.translate(x+w/2,y+h/2); c.rotate(rot||0); c.fillStyle=bg; c.fillRect(-w/2,-h/2,w,h);
            const s=sizeAll(c, L, w*0.82, h*0.62/L.length, "700", "Arial");
            L.forEach((t,k)=>say(c, t, 0, -h/2+h*(k+0.5)/L.length, w*0.82, s, col, "700", "Arial")); c.fillStyle="#c42a1a"; c.beginPath(); c.arc(0, -h/2+5, 4, 0, 7); c.fill(); c.restore(); };
          note(W*0.04, Hh*0.06, W*0.40, Hh*0.40, "#f8f2c8", ["HARVEST SUPPER","SAT 5 PM","HAM · BEANS · PIE"], "#7a2a12", -0.03);
          note(W*0.50, Hh*0.05, W*0.44, Hh*0.30, "#f4f4f2", ["PRAYER LIST","THE WEIRS · DOT K.","EARL'S HIP"], "#1a2a5a", 0.02);
          note(W*0.52, Hh*0.42, W*0.24, Hh*0.30, "#c8e0f4", ["QUILT","RAFFLE","$1"], "#1a1a1a", 0.05);
          note(W*0.80, Hh*0.42, W*0.16, Hh*0.26, "#f4c8d8", ["VBS","JULY"], "#5a1a3a", -0.06);
          note(W*0.06, Hh*0.54, W*0.38, Hh*0.38, "#e8f0d0", ["CHOIR PRACTICE","WEDNESDAYS 7","ALL VOICES"], "#2a4a1a", 0.03);
          note(W*0.50, Hh*0.76, W*0.44, Hh*0.18, "#f8e0b0", ["FOR SALE: CHEST FREEZER"], "#3a2a1a", -0.01); },
        87.62, BF+1.50, HZ0+0.062, 0, false, 520);
      sign(3.0, 0.42, (c,W,Hh)=>{ c.fillStyle="#f6f0dc"; c.fillRect(0,0,W,Hh); c.strokeStyle="#c47a1a"; c.lineWidth=6; c.strokeRect(5,5,W-10,Hh-10);
          for(let k=0;k<14;k++){ c.fillStyle=["#c4501a","#e0a020","#8a3a1a"][k%3]; c.beginPath(); c.moveTo(14+k*(W-28)/13, 9); c.lineTo(24+k*(W-28)/13, 9); c.lineTo(19+k*(W-28)/13, 22); c.fill(); }
          say(c, "HARVEST SUPPER", W/2, Hh*0.58, W*0.78, Hh*0.50, "#7a2a12", "700", "Georgia, serif"); },
        90.85, BF+2.22, HZ0+0.02, 0, false, 900);
      B(0.80, 0.03, 0.50, 89.4, BF+0.74, HZ0+0.32, "#7a5634");
      for(const dx of [-0.36,0.36]) for(const dz of [-0.21,0.21]) B(0.03, 0.725, 0.03, 89.4+dx, BF+0.3625, HZ0+0.32+dz, "#5a4028");
      C(0.15, 0.10, 89.25, BF+0.805, HZ0+0.32, "#b88a4a", 16); C(0.12, 0.012, 89.25, BF+0.851, HZ0+0.32, "#7a5a2a", 16);
      B(0.20, 0.03, 0.26, 89.62, BF+0.772, HZ0+0.30, "#f4f2ea", 0.1);
      sign(0.24, 0.12, (c,W,Hh)=>{ c.fillStyle="#f6f2e4"; c.fillRect(0,0,W,Hh); const L=["FREE WILL","OFFERING"], s=sizeAll(c, L, W*0.80, Hh*0.30, "700", "Georgia, serif");
          L.forEach((t,k)=>say(c, t, W/2, Hh*(0.32+k*0.38), W*0.80, s, "#3a2a1a", "700", "Georgia, serif")); }, 89.62, BF+0.83, HZ0+0.112, 0, false, 200);
      B(0.24, 0.14, 0.012, 89.62, BF+0.83, HZ0+0.098, "#f6f2e4");
      addCol(88.98, 89.82, HZ0, HZ0+0.58, BF-0.5, BF+0.9);
      addUse(89.4, HZ0+1.1, BF, "THE OFFERING BASKET", ()=>toast(["A FEW DOLLARS, A CHECK MADE OUT IN PENCIL, A BUTTON. YOU ADD WHAT YOU HAVE","AN ENVELOPE: “FOR THE FURNACE FUND”. IT IS THICK","EMPTY BUT FOR A NOTE: “IOU · PIE · DOT”"][(Math.random()*3)|0], "#e8dcc0"), 0.9);
      addUse(87.62, HZ0+0.9, BF, "THE BULLETIN BOARD", ()=>toast(["THE CHEST FREEZER IS STILL FOR SALE. IT HAS BEEN SINCE MARCH","THE QUILT IN THE RAFFLE IS A DOUBLE WEDDING RING. TICKETS FROM DOT","SOMEONE HAS PENCILLED “AMEN” UNDER EARL'S HIP"][(Math.random()*3)|0], "#e8dcc0"), 0.9);
      // the cart of spare chairs in the corner, folded and stacked against its back
      const cx=92.05, cz=HZ0+0.5;
      B(0.56, 0.05, 0.86, cx, BF+0.08, cz, "#3a3c40"); for(const dz of [-0.36, 0.36]) for(const dx of [-0.22, 0.22]) C(0.04, 0.03, cx+dx, BF+0.04, cz+dz, "#1a1a1a", 10, 0, 0, Math.PI/2);
      B(0.04, 1.0, 0.86, cx+0.26, BF+0.60, cz, "#3a3c40");
      for(let k=0;k<9;k++) B(0.03, 0.86, 0.44, cx+0.215-k*0.034, BF+0.55, cz, k%2 ? "#c4b89e" : "#bcb096", 0, 0, 0.06);
      addCol(cx-0.3, cx+0.3, cz-0.45, cz+0.45, BF-0.5, BF+1.1); }

    // the south end: the kitchen behind its counter, the pass-through over it under a soffit; a wall at its east end
    { const KZ=Z-24.85, KX1=89.60;
      B(88.30-84.29, 0.84, 0.56, (84.29+88.30)/2, BF+0.46, KZ, "#a2865a"); B(88.30-84.29, 0.08, 0.50, (84.29+88.30)/2, BF+0.04, KZ, "#2a2420");
      B(88.34-84.29, 0.04, 0.66, (84.29+88.34)/2, BF+0.90, KZ, "#e6dcc4");
      for(let k=0;k<6;k++){ const x=84.65+k*0.62; for(const sd of [-1,1]) B(0.56, 0.62, 0.012, x, BF+0.47, KZ+sd*0.285, "#ae9266"); }
      addCol(84.29, 88.34, KZ-0.33, KZ+0.33, BF-0.5, BF+0.92);
      B(KX1-HX0+0.01, CL2-(BF+2.20)+0.01, 0.30, (HX0-0.005+KX1)/2, (BF+2.20+CL2+0.01)/2, KZ, "#f1ede4");
      // (the wall stands a centimetre proud of the soffit's face, its panelling and rail proud of it in turn)
      const pw=(w, h, y, z0, c)=>B(w, h, HZ1+0.005-z0, KX1+0.06, y, (z0+HZ1+0.005)/2, c);
      pw(0.12, CL2-BF+0.01, (BF+CL2+0.01)/2, KZ-0.16, "#f1ede4"); pw(0.13, 0.95, BF+0.475, KZ-0.165, "#c9a676"); pw(0.15, 0.06, BF+0.95, KZ-0.17, "#f4f2ec");
      addCol(KX1, KX1+0.12, KZ-0.16, HZ1, BF-0.5, CL2);
      // behind it: the fridge, the base cabinets with the range and the sink in them, the cupboards over, the hood
      const BZ=HZ1-0.30;
      B(0.78, 1.72, 0.72, HX0+0.40, BF+0.86, HZ1-0.37, "#e6dfc8"); B(0.78, 0.012, 0.006, HX0+0.40, BF+1.20, HZ1-0.733, "#b8b098");
      B(0.03, 0.24, 0.03, HX0+0.70, BF+1.40, HZ1-0.745, "#c9cbcc"); B(0.03, 0.36, 0.03, HX0+0.70, BF+0.92, HZ1-0.745, "#c9cbcc");
      addCol(HX0, HX0+0.80, HZ1-0.74, HZ1, BF-0.5, BF+1.75);
      B(KX1-85.15, 0.84, 0.58, (85.15+KX1)/2, BF+0.46, BZ+0.01, "#a2865a"); B(KX1-85.15, 0.08, 0.52, (85.15+KX1)/2, BF+0.04, BZ+0.02, "#2a2420");
      for(const [a,b] of [[85.15, 85.88],[86.68, KX1]]) B(b-a, 0.04, 0.64, (a+b)/2, BF+0.90, BZ-0.01, "#e6dcc4");
      for(const x of [85.5, 87.0, 87.62, 88.86, 89.30]) B(0.40, 0.60, 0.012, x, BF+0.47, BZ-0.285, "#ae9266");
      for(const x of [85.5, 87.0, 87.62, 88.86, 89.30]) B(0.10, 0.02, 0.02, x, BF+0.70, BZ-0.30, "#c9cbcc");
      // the range: white enamel, four coils, its clock at the back
      B(0.76, 0.92, 0.64, 86.28, BF+0.46, BZ-0.01, "#efece2"); B(0.70, 0.006, 0.56, 86.28, BF+0.923, BZ-0.02, "#1e1e1e");
      for(const [dx,dz] of [[-0.18,-0.12],[0.18,-0.12],[-0.18,0.14],[0.18,0.14]]) ent(new T.TorusGeometry(0.075, 0.008, 6, 18), 86.28+dx, BF+0.93, BZ-0.02+dz, "#3a3a3a", Math.PI/2);
      B(0.76, 0.22, 0.06, 86.28, BF+1.03, BZ+0.27, "#efece2"); for(let k=0;k<4;k++) C(0.018, 0.03, 85.98+k*0.2, BF+1.0, BZ+0.235, "#2a2a2a", 10, Math.PI/2);
      B(0.60, 0.40, 0.012, 86.28, BF+0.45, BZ-0.336, "#2a2a2a");
      B(0.76, 0.14, 0.46, 86.28, BF+1.80, HZ1-0.23, "#d8d4c8");
      // the sink: steel, two bowls, the faucet up out of the back
      B(0.82, 0.006, 0.50, 88.24, BF+0.923, BZ-0.02, "#b8bcc0");
      for(const dx of [-0.2, 0.2]) B(0.34, 0.004, 0.38, 88.24+dx, BF+0.928, BZ-0.03, "#6a6e72");
      tubeE(V3(88.24, BF+0.92, BZ+0.17), V3(88.24, BF+1.20, BZ+0.17), 0.014, "#c9cbcc"); tubeE(V3(88.24, BF+1.20, BZ+0.17), V3(88.24, BF+1.16, BZ-0.05), 0.012, "#c9cbcc");
      for(const dx of [-0.10, 0.10]) C(0.02, 0.05, 88.24+dx, BF+0.95, BZ+0.17, "#c9cbcc", 10);
      // the cupboards over the counter, east of the hood
      B(KX1-86.80, 0.70, 0.34, (86.80+KX1)/2, BF+1.80, HZ1-0.17, "#a2865a");
      for(const x of [87.15, 87.85, 88.55, 89.25]) B(0.62, 0.62, 0.012, x, BF+1.80, HZ1-0.346, "#ae9266");
      addCol(85.1, KX1, BZ-0.34, HZ1, BF-0.5, BF+0.94);
      // on the counters: the coffee urn on the pass-through, cups; crock-pots, a stock-pot on the range, plates, a pie
      C(0.17, 0.48, 87.85, BF+0.92+0.30, KZ, "#c8ccd0", 20); C(0.18, 0.06, 87.85, BF+0.92+0.03, KZ, "#1e1e1e", 20); C(0.12, 0.04, 87.85, BF+0.92+0.56, KZ, "#1e1e1e", 18);
      B(0.04, 0.05, 0.08, 87.85, BF+1.04, KZ-0.20, "#1e1e1e"); ent(new T.SphereGeometry(0.02, 8, 6), 87.85, BF+1.53, KZ, "#f2c41a");
      for(let k=0;k<3;k++) C(0.04, 0.28, 87.40+k*0.10, BF+0.92+0.14, KZ-0.10, "#f4f4f0", 12);
      for(let k=0;k<2;k++) C(0.13, 0.08, 86.2+k*0.36, BF+0.92+0.04, KZ+0.02, "#f6f6f2", 20);
      ent(new T.CylinderGeometry(0.13, 0.11, 0.05, 20), 85.4, BF+0.92+0.025, KZ, "#c8a060"); C(0.12, 0.005, 85.4, BF+0.92+0.052, KZ, "#a0562a", 20);
      for(const x of [87.15, 89.10]){ ent(new T.CylinderGeometry(0.17, 0.15, 0.20, 18).scale(1, 1, 0.75), x, BF+0.92+0.10, BZ-0.05, "#5a3a22");
        ent(new T.SphereGeometry(0.16, 16, 8, 0, Math.PI*2, 0, Math.PI/2).scale(1, 0.35, 0.75), x, BF+0.92+0.20, BZ-0.05, "#a8b0b0"); ent(new T.SphereGeometry(0.02, 8, 6), x, BF+0.92+0.26, BZ-0.05, "#1e1e1e"); }
      C(0.17, 0.26, 86.10, BF+0.93+0.13, BZ-0.12, "#b8bcc0", 20); C(0.175, 0.012, 86.10, BF+0.93+0.262, BZ-0.12, "#a8acb0", 20);
      addUse(87.85, KZ-0.75, BF, "THE COFFEE URN", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("pour", 87.85, KZ);
        toast(["YOU DRAW A CUP. CHURCH COFFEE: HOT, BROWN, AND THAT'S ALL YOU CAN SAY FOR IT","A CARD TAPED TO IT: “DECAF IS THE GREEN ONE.” THERE IS NO GREEN ONE","IT PERKS AND SIGHS. THE CUP IS STYROFOAM AND SQUEAKS"][(Math.random()*3)|0], "#e8d0a8"); }, 0.9);
      addUse(HX0+0.40, HZ1-1.3, BF, "THE FRIDGE", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("door", HX0+0.4, HZ1-0.4);
        toast(["A HAM UNDER FOIL, THREE JELLO SALADS AND A NOTE: “HANDS OFF · DOT”","CREAMERS, A SHEET CAKE THAT SAYS “50 YEARS PASTOR JIM”, HALF GONE","PICKLED EGGS IN A JAR NOBODY WILL ADMIT TO"][(Math.random()*3)|0], "#d8e4e8"); }, 0.9);
      addUse(87.15, BZ-0.9, BF, "THE CROCK-POTS", ()=>toast(["BAKED BEANS, LOW. SMELLS OF MOLASSES AND BACON","SLOPPY JOES, KEEPING WARM FOR TOMORROW","THE LID IS FOGGED. WHATEVER IT IS, IT HAS ONIONS IN IT"][(Math.random()*3)|0], "#e8d0a8"), 0.9);
      // the sign-up sheet on its clipboard on the west wall by the counter
      B(0.25, 0.34, 0.012, HX0+0.013, BF+1.42, Z-26.05, "#6a5038", Math.PI/2);
      sign(0.22, 0.29, (c,W,Hh)=>{ c.fillStyle="#f6f4ee"; c.fillRect(0,0,W,Hh);
          say(c, "SIGN-UP · SAT", W/2, Hh*0.08, W*0.80, Hh*0.07, "#1a1a1a", "700", "Arial");
          c.strokeStyle="rgba(60,90,160,0.35)"; c.lineWidth=1; for(let y=Hh*0.16;y<Hh-6;y+=Hh*0.09){ c.beginPath(); c.moveTo(6,y); c.lineTo(W-6,y); c.stroke(); }
          ["DOT · HAM","BEV · SCALLOPED","THE WEIRS · PIE x2","KANTZ · ROLLS","EARL · ICE","JUNE · JELLO","???"].forEach((t,k)=>say(c, t, W/2, Hh*(0.20+k*0.105), W*0.80, Hh*0.06, "#1a2a6a", "600", "'Comic Sans MS', cursive")); },
        HX0+0.026, BF+1.41, Z-26.05, Math.PI/2, false, 160);
      addUse(HX0+0.6, Z-26.05, BF, "THE SIGN-UP SHEET", ()=>toast(["SEVEN NAMES, SEVEN DISHES. THREE OF THEM ARE JELLO","AT THE BOTTOM, IN A CHILD'S HAND: “CANDY”","YOU WRITE YOUR NAME. NEXT TO IT: “CHIPS”. THE PEN IS ON A STRING"][(Math.random()*3)|0], "#e8dcc0"), 0.9); }

    // east of the kitchen: the old upright piano against the south wall, its bench, the picture over it; the fountain
    { const px=91.2, pz=HZ1-0.30;
      ent(rboxGeo(1.46, 1.22, 0.58, 0.02, 2), px, BF+0.61, pz, "#4a2c1a"); B(1.30, 0.04, 0.30, px, BF+0.74, pz-0.40, "#3a2214");
      B(1.22, 0.02, 0.15, px, BF+0.765, pz-0.36, "#f4f0e2"); for(let k=0;k<24;k++) if(k%7!==2 && k%7!==6) B(0.022, 0.02, 0.09, px-0.58+k*0.05, BF+0.782, pz-0.33, "#141414");
      B(1.30, 0.14, 0.03, px, BF+0.84, pz-0.31, "#4a2c1a"); B(0.36, 0.24, 0.012, px, BF+1.04, pz-0.30, "#f0e8d4", 0, -0.2);
      for(const sd of [-1,1]) B(0.06, 0.74, 0.06, px+sd*0.62, BF+0.37, pz-0.42, "#4a2c1a");
      B(0.90, 0.48, 0.36, px, BF+0.24, pz-0.95, "#4a2c1a");
      addCol(px-0.74, px+0.74, pz-0.48, HZ1, BF-0.5, BF+1.25); addCol(px-0.47, px+0.47, pz-1.14, pz-0.76, BF-0.5, BF+0.5);
      addSeat(px, pz-0.95, BF, Math.PI, "THE PIANO BENCH");
      addUse(px, pz-1.35, BF, "PLAY THE OLD PIANO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", px, pz);
        toast(["“WHAT A FRIEND WE HAVE IN JESUS”, AND HALF THE KEYS STICK","CHOPSTICKS. THE ONLY THING ANYONE HAS EVER PLAYED ON IT DOWN HERE","IT IS A HALF-STEP FLAT AND HAS BEEN SINCE THE FLOOD OF '72"][(Math.random()*3)|0], "#e8c46a"); }, 0.9);
      B(0.84, 0.58, 0.03, px, BF+1.78, HZ1-0.021, "#6a4a2c");
      sign(0.76, 0.50, (c,W,Hh)=>{ const g=c.createLinearGradient(0,0,0,Hh); g.addColorStop(0,"#c8d8e0"); g.addColorStop(1,"#e8e0c8"); c.fillStyle=g; c.fillRect(0,0,W,Hh);
          c.fillStyle="#8a9a5a"; c.fillRect(0, Hh*0.72, W, Hh*0.28);
          c.fillStyle="#f4f2ea"; c.fillRect(W*0.38, Hh*0.42, W*0.26, Hh*0.32); c.beginPath(); c.moveTo(W*0.36, Hh*0.43); c.lineTo(W*0.51, Hh*0.26); c.lineTo(W*0.66, Hh*0.43); c.fill();
          c.fillRect(W*0.475, Hh*0.14, W*0.07, Hh*0.16); c.fillStyle="#5a5e60"; c.beginPath(); c.moveTo(W*0.465, Hh*0.15); c.lineTo(W*0.51, Hh*0.03); c.lineTo(W*0.555, Hh*0.15); c.fill();
          c.fillStyle="#8a2418"; c.fillRect(W*0.485, Hh*0.60, W*0.05, Hh*0.14);
          say(c, "FRENCH CREEK · 1891", W/2, Hh*0.88, W*0.70, Hh*0.10, "#2a2a1a", "700", "Georgia, serif"); },
        px, BF+1.78, HZ1-0.044, Math.PI, false, 300);
      // the drinking fountain on the east wall
      B(0.36, 0.30, 0.34, HX1-0.18, BF+0.86, Z-24.3, "#b8bcc0"); B(0.30, 0.02, 0.26, HX1-0.20, BF+1.015, Z-24.3, "#9a9ea2");
      C(0.012, 0.05, HX1-0.30, BF+1.04, Z-24.3, "#c9cbcc", 8); B(0.03, 0.07, 0.07, HX1-0.03, BF+0.95, Z-24.12, "#c9cbcc");
      addCol(HX1-0.36, HX1, Z-24.47, Z-24.13, BF-0.5, BF+1.05);
      // the children's hand turkeys, taped up between the windows on the east wall
      sign(1.40, 0.36, (c,W,Hh)=>{ c.fillStyle="#f1ede4"; c.fillRect(0,0,W,Hh);
          for(let k=0;k<5;k++){ const ox=k*W/5+6, w=W/5-12, cx=ox+w/2, cy=Hh*0.58; c.fillStyle=["#f6f4ee","#f4e8c8","#e8f0f4","#f6f4ee","#f4e0e8"][k]; c.fillRect(ox, 4, w, Hh-8);
            for(let f=0;f<5;f++){ const a=-Math.PI*0.85+f*Math.PI*0.17; c.fillStyle=["#c4301a","#e08a1a","#e0c21a","#3a8a2a","#7a3ab8"][(f+k)%5];
              c.beginPath(); c.ellipse(cx+Math.cos(a)*w*0.22, cy+Math.sin(a)*w*0.22, w*0.07, w*0.16, a+Math.PI/2, 0, 7); c.fill(); }
            c.fillStyle="#7a4a22"; c.beginPath(); c.ellipse(cx, cy, w*0.16, w*0.20, 0, 0, 7); c.fill(); c.beginPath(); c.arc(cx+w*0.12, cy-w*0.20, w*0.08, 0, 7); c.fill();
            c.fillStyle="#e0a020"; c.beginPath(); c.moveTo(cx+w*0.19, cy-w*0.21); c.lineTo(cx+w*0.27, cy-w*0.18); c.lineTo(cx+w*0.19, cy-w*0.15); c.fill(); } },
        HX1-0.018, BF+1.55, Z-30.6, -Math.PI/2, false, 700); }

    // the stair: outside, behind the chapel, a concrete areaway dug down along its back wall, twelve risers from the
    // grass; walls either side with a pipe rail on them, the concrete apron round its head, a light over the door
    { const SX0=85.2, SX1=86.8, LZ=F.z0-1.2, RS=0.19, RN=0.28, TZ=LZ-11*RN, PT=Y+0.03, AZ=Z-44.05;
      bx("concrete", SX1-SX0-0.004, 0.25, F.z0-LZ+0.004, (SX0+SX1)/2, BF-0.125, (LZ+F.z0)/2-0.002, 0.5, 0, "#a8a49a");
      addFlat(SX0, SX1, LZ, F.z0+0.01, BF);
      B(0.26, 0.006, 0.26, 86.0, BF+0.003, LZ+0.5, "#3a3a3a");
      for(let k=1;k<=11;k++){ const za=LZ-k*RN-(k===11?0.01:0), zb=LZ-(k-1)*RN, y=BF+k*RS;
        bx("concrete", SX1-SX0-0.004, y-(BF-0.1), zb-za, (SX0+SX1)/2, (y+BF-0.1)/2, (za+zb)/2, 0.5, 0, k%2 ? "#b0aca2" : "#aaa69c");
        addFlat(SX0, SX1, LZ-k*RN, zb, y); }
      for(const [a,b] of [[85.0, SX0],[SX1, 87.0]]) bx("concrete", b-a, Y+0.12-(BF-0.3), F.z0+0.10-TZ, (a+b)/2, (Y+0.12+BF-0.3)/2, (F.z0+0.10+TZ)/2, 0.5, 0, "#b4b0a6");
      // the apron at the grass's level: down each side, and across the stair's head
      bx("concrete", 85.05-83.95, PT-(Y-0.25), F.z0-AZ, (83.95+85.05)/2, (PT+Y-0.25)/2, (AZ+F.z0)/2, 0.5, 0, "#bab6ac");
      bx("concrete", 88.05-86.95, PT-(Y-0.25), F.z0-AZ, (86.95+88.05)/2, (PT+Y-0.25)/2, (AZ+F.z0)/2, 0.5, 0, "#bab6ac");
      bx("concrete", 86.95-85.05, PT-(Y-0.25), TZ-AZ, (85.05+86.95)/2, (PT+Y-0.25)/2, (AZ+TZ)/2, 0.5, 0, "#bab6ac");
      addFlat(83.95, 85.05, AZ, F.z0, PT); addFlat(86.95, 88.05, AZ, F.z0, PT); addFlat(85.05, 86.95, AZ, TZ, PT);
      addVoid(SX0, SX1, TZ, F.z0, BF-3, Y+0.6, BF);
      // the rails on the walls, and one down the east wall inside
      for(const x of [85.1, 86.9]){ const top=Y+0.12;
        for(const z of [TZ+0.06, (TZ+F.z0)/2, F.z0-0.10]) tubeE(V3(x, top, z), V3(x, top+0.94, z), 0.02, "#1e1e20");
        tubeE(V3(x, top+0.94, TZ+0.06), V3(x, top+0.94, F.z0-0.10), 0.022, "#1e1e20"); tubeE(V3(x, top+0.48, TZ+0.06), V3(x, top+0.48, F.z0-0.10), 0.016, "#1e1e20");
        for(const z of [TZ+0.06, F.z0-0.10]) ent(new T.SphereGeometry(0.022, 8, 6), x, top+0.94, z, "#1e1e20"); }
      addCol(85.0, SX0, TZ, F.z0, BF-0.5, Y+1.2); addCol(SX1, 87.0, TZ, F.z0, BF-0.5, Y+1.2);
      { const a=V3(SX1-0.06, PT+0.86, TZ-0.05), b=V3(SX1-0.06, BF+0.86, LZ+0.15); tubeE(a, b, 0.019, "#1e1e20");
        for(const t of [0.08, 0.5, 0.92]){ const p=a.clone().lerp(b, t); tubeE(p, V3(SX1-0.004, p.y-0.06, p.z), 0.011, "#1e1e20"); } }
      // the light over the door, the door's frame outside is frX's; a mat
      B(0.12, 0.12, 0.07, 86.0, BF+2.32, F.z0-0.035, "#2a2a2c"); push("chapel_globe", new T.CylinderGeometry(0.05, 0.05, 0.12, 12), 86.0, BF+2.26, F.z0-0.11, 0, "#ffffff");
      C(0.06, 0.02, 86.0, BF+2.33, F.z0-0.11, "#2a2a2c", 12);
      LAMPS.push({x:86.0, y:BF+2.1, z:F.z0-0.5, color:0xffd8a0, intensity:0.45, dist:6, decay:1.6, mothy:true});
      B(0.80, 0.012, 0.50, 86.0, BF+0.006, LZ+0.75+0.20, "#2e2a26");
      // and the sign at the top for anybody looking for it
      B(0.06, 1.05, 0.06, 84.40, Y+0.555, Z-43.4, "#f4f2ec"); addCol(84.36, 84.44, Z-43.44, Z-43.36, Y-0.5, Y+1.1);
      B(0.62, 0.36, 0.04, 84.40, Y+1.05, Z-43.35, "#f4f2ec");
      sign(0.56, 0.30, (c,W,Hh)=>{ c.fillStyle="#f6f4ec"; c.fillRect(0,0,W,Hh); c.strokeStyle="#24402e"; c.lineWidth=5; c.strokeRect(5,5,W-10,Hh-10);
          const L=["FELLOWSHIP HALL","DOWNSTAIRS · ALL WELCOME"], s=sizeAll(c, L, W*0.78, Hh*0.20, "700", "Georgia, serif");
          L.forEach((t,k)=>say(c, t, W/2, Hh*(0.36+k*0.32), W*0.78, s, "#24402e", "700", "Georgia, serif")); },
        84.40, Y+1.05, Z-43.318, 0, false, 300);
      // crushed stone along the foundation either side, where the mown ground stops short of it
      // (a box of its own, not the polygon-offset flat layer: that offset pulls a side face seen edge-on in front of the wall)
      bucketOf("kirk_gravel", ()=>new T.MeshStandardMaterial({map:TEX.crushed, roughness:1.0}));
      for(const [a,b] of [[F.x0-1.0, F.x0],[F.x1, F.x1+1.0]]){ bx("kirk_gravel", b-a, 0.225, F.z1-F.z0, (a+b)/2, Y+0.025-0.1125, (F.z0+F.z1)/2, 0.5, 0, "#a29d92");
        addFlat(a, b, F.z0, F.z1, Y+0.025); } }
  }

  /* ---- the lot, the car, the sign at the road ---- */
  // (back off the road behind the I-79 SOUTH sign, 08b, a drive out to the road west of it)
  { for(const [x0,x1,z0,z1] of [[54.0, 78.0, Z-38.2, Z-11.0],[58.0, 64.0, Z-11.0, Z-5.2]]){
      const w=x1-x0, d=z1-z0, g=new T.PlaneGeometry(w, d), U=g.attributes.uv; for(let k=0;k<U.count;k++) U.setXY(k, (x0+U.getX(k)*w)*0.5, (z0+U.getY(k)*d)*0.5);
      push("gravelbed", g, (x0+x1)/2, Y+0.032, (z0+z1)/2, 0, "#a29d92", -Math.PI/2, 0); }
    for(let x=56.4; x<77; x+=3.0) B(1.6, 0.12, 0.20, x+1.3, Y+0.06, Z-37.2, "#b8b4aa");
    parked(0, "#3a4f6a", 59.7, Z-34.2, Math.PI, Y+0.005); }
  { const sx=81.6, sz=Z-9.4, W=2.3, Hh=1.45, cy=Y+1.55;
    for(const dz of [-(W/2+0.07), W/2+0.07]){ B(0.12, cy+Hh/2+0.08-Y+0.2, 0.12, sx, (cy+Hh/2+0.08+Y-0.2)/2, sz+dz, TRM); addCol(sx-0.07, sx+0.07, sz+dz-0.07, sz+dz+0.07, Y-0.5, cy+Hh/2); }
    B(0.10, Hh, W, sx, cy, sz, "#f4f2ea"); B(0.30, 0.08, W+0.30, sx, cy+Hh/2+0.06, sz, "#4e5256");
    const tex=signTex(460, 290, (c,Wc,Hc)=>{ c.fillStyle="#f6f4ec"; c.fillRect(0,0,Wc,Hc);
      c.fillStyle="#24402e"; c.fillRect(0,0,Wc,Hc*0.38); c.strokeStyle="#24402e"; c.lineWidth=8; c.strokeRect(4,4,Wc-8,Hc-8);
      const top=["FRENCH CREEK","UNION CHAPEL"], s1=sizeAll(c, top, Wc*0.78, Hc*0.13, "700", "Georgia, serif");
      top.forEach((t,k)=>say(c, t, Wc/2, Hc*(0.12+k*0.15), Wc*0.78, s1, "#f4ecd8", "700", "Georgia, serif"));
      c.strokeStyle="rgba(0,0,0,0.10)"; c.lineWidth=1; for(let y=Hc*0.42;y<Hc-10;y+=9){ c.beginPath(); c.moveTo(12,y); c.lineTo(Wc-12,y); c.stroke(); }
      const L=["HARVEST SUPPER SAT 5 PM","ALL WELCOME","WORSHIP SUNDAY 10:30"], s2=sizeAll(c, L, Wc*0.78, Hc*0.11, "700", "Arial");
      L.forEach((t,k)=>say(c, t, Wc/2, Hc*(0.52+k*0.15), Wc*0.78, s2, "#1a1a1a", "700", "Arial")); });
    for(const sd of [-1,1]) signPanel(W-0.08, Hh-0.08, tex, sx+sd*0.062, cy, sz, sd*Math.PI/2); }

  /* ---- the graveyard ---- */
  const G={x0:97.0, x1:124.0, z0:Z-86.0, z1:Z-20.0};
  // the wall along its front, laid dry, a gap at the gate; its two piers
  for(const [a,b] of [[G.x0, 100.2],[101.6, G.x1]]) bx("fh_stone", b-a, 0.75, 0.55, (a+b)/2, Y+0.375-0.1, G.z1+0.3, 0.6, 0, "#ffffff");
  for(const x of [100.2-0.16, 101.6+0.16]) bx("fh_stone", 0.44, 1.05, 0.66, x, Y+0.425, G.z1+0.3, 0.6, 0, "#ffffff");
  addCol(G.x0, 100.06, G.z1+0.02, G.z1+0.58, Y-0.5, Y+0.65); addCol(101.74, G.x1, G.z1+0.02, G.z1+0.58, Y-0.5, Y+0.65);
  for(const x of [100.2-0.16, 101.6+0.16]) addCol(x-0.22, x+0.22, G.z1-0.03, G.z1+0.63, Y-0.5, Y+1.0);
  // a face for the stones: four inscriptions on one sheet, each stone a cell of it, the lettering cut in grey
  const faceTex=signTex(512, 512, (c,W,Hh)=>{ c.fillStyle="#ffffff"; c.fillRect(0,0,W,Hh);
    const cells=[["MOTHER","MARY E.","1861 · 1924"],["J. H. WEIR","1849 · 1911","AT REST"],["INFANT SON","OF J. & M.","1889"],["FATHER","AMOS","1838 · 1903"]];
    cells.forEach((L,i)=>{ const ox=(i%2)*256, oy=((i/2)|0)*256;
      c.strokeStyle="#9a9a96"; c.lineWidth=3; c.strokeRect(ox+30, oy+30, 196, 196);
      const s=sizeAll(c, L, 150, 36, "700", "Georgia, serif");
      L.forEach((t,k)=>{ c.fillStyle="#5a5a58"; c.font="700 "+s+"px Georgia, serif"; c.textAlign="center"; c.textBaseline="middle";
        fitText(c, t, 150, s, ox+128, oy+78+k*52, "700", "Georgia, serif"); }); }); });
  bucketOf("stoneface", ()=>new T.MeshStandardMaterial(Object.assign({map:faceTex, roughness:0.75, metalness:0.08}, _po(-2))));
  const GREYS=["#8e8c86","#a09e98","#7a7872","#b8b6ae","#6e6c66","#9a8e86","#c4c0b6","#5e605e"];
  const stone=(x, z, ry, kind, age)=>{
    const tx=(r()-0.5)*0.12*age, tz=(r()-0.5)*0.10*age, M=new T.Matrix4().compose(V3(x, Y, z), new T.Quaternion().setFromEuler(new T.Euler(tx, ry, tz, "YXZ")), V3(1,1,1));
    const col=age>0.7 ? ["#6e6c66","#5e605e","#7a7872"][(r()*3)|0] : GREYS[(r()*GREYS.length)|0];
    const P=(geo, lx, ly, lz, rx, rz, c)=>ME.push({geo:geo, matrix:M.clone().multiply(new T.Matrix4().compose(V3(lx,ly,lz), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,rz||0)), V3(1,1,1))), color:new T.Color(c||col)});
    const face=(w, h, ly, d)=>{ const g=cellGeo(w, h, 2, 2, ((x*13+z*7)|0)+1); bucketOf("stoneface").entries.push({geo:g, matrix:M.clone().multiply(new T.Matrix4().makeTranslation(0, ly, d/2+0.006)), color:new T.Color(col)}); };
    let hx=0.4, hz=0.2, top=1.0;
    if(kind<0.42){ const w=0.48+r()*0.3, h=0.55+r()*0.4, d=0.09+r()*0.04;
      P(boxGeo(w, h-0.1+0.06, d), 0, (h-0.1+0.06)/2-0.06, 0); P(new T.CylinderGeometry(w/2, w/2, d-0.004, 20), 0, h-0.1-w/2+0.02+w/2-0.02, 0, Math.PI/2);
      if(age<0.8) face(w*0.78, Math.min(h*0.62, w*0.78), h*0.45, d); hx=w/2; hz=d/2; top=h+w/2; }
    else if(kind<0.62){ P(boxGeo(0.80, 0.16, 0.42), 0, 0.05, 0); P(boxGeo(0.62, 0.74, 0.15), 0, 0.13+0.37, 0);
      face(0.50, 0.46, 0.13+0.42, 0.15); hx=0.42; hz=0.22; top=0.9; }
    else if(kind<0.78){ P(boxGeo(0.72, 0.32, 0.36), 0, 0.12, 0, -0.0); P(boxGeo(0.70, 0.06, 0.30), 0, 0.30, -0.02, 0.35); hx=0.38; hz=0.2; top=0.4; }
    else if(kind<0.86){ P(boxGeo(0.60, 0.30, 0.60), 0, 0.12, 0); P(boxGeo(0.46, 0.20, 0.46), 0, 0.36, 0);
      P(new T.CylinderGeometry(0.15, 0.21, 1.6, 4, 1).rotateY(Math.PI/4), 0, 0.46+0.8, 0); P(new T.ConeGeometry(0.15, 0.24, 4, 1).rotateY(Math.PI/4), 0, 2.06+0.12-0.002, 0);
      hx=0.32; hz=0.32; top=2.2; }
    else if(kind<0.94){ P(boxGeo(0.62, 0.10, 0.36), 0, 0.0, 0); hx=0; top=0; }
    else { P(boxGeo(0.32, 0.36, 0.12), 0, 0.16, 0); P(new T.SphereGeometry(0.13, 12, 8).scale(1.3, 0.8, 0.9), 0, 0.40, 0, 0, 0, "#d8d6ce"); hx=0.17; hz=0.07; top=0.5; }
    if(hx) addCol(x-hx-0.03, x+hx+0.03, z-hz-0.03, z+hz+0.03, Y-0.5, Y+Math.min(top, 1.2)); };
  // the rows, east-west across the yard, the stones facing the road; the oldest at the back and leaning
  const TREES=[[103.5,Z-48.0,1.35],[120.5,Z-31.0,1.15],[110.5,Z-74.0,1.25]];
  const clear=(x,z)=>TREES.every(t=>Math.hypot(t[0]-x, t[1]-z)>2.4) && !(x>99.6 && x<102.2 && z>Z-30) && Math.hypot(x-105.4, z-(Z-46.2))>2.2;
  let nst=0;
  for(let row=0, z=Z-24.5; z>G.z0+2; row++, z-=2.6){
    const age=clamp((Z-24.5-z)/58, 0, 1);
    for(let x=G.x0+1.6+(row%2)*0.5; x<G.x1-1.2; x+=1.45){
      if(r()<0.30 || !clear(x, z)) continue;
      stone(x+(r()-0.5)*0.25, z+(r()-0.5)*0.2, (r()-0.5)*0.06, age>0.8 ? r()*0.5 : r(), age); nst++;
      // a flag by a veteran's stone
      if(r()<0.05){ const fx=x+0.45, fz=z+0.25; tubeE(V3(fx, Y, fz), V3(fx, Y+0.62, fz), 0.006, "#c8c4b8");
        B(0.005, 0.18, 0.28, fx, Y+0.53, fz+0.145, "#b22234"); B(0.006, 0.09, 0.12, fx, Y+0.575, fz+0.065, "#2a3a6a"); } } }
  for(const [x,z,s] of TREES) tree("hard", x, z, s);
  // a bench under the near maple, looking over them
  { const bx0=105.4, bz0=Z-46.2;
    B(1.5, 0.05, 0.42, bx0, Y+0.45, bz0, "#6a5038"); B(1.5, 0.30, 0.04, bx0, Y+0.70, bz0+0.21, "#6a5038");
    for(const dx of [-0.65,0.65]) for(const dz of [-0.17,0.17]) B(0.05, 0.43, 0.05, bx0+dx, Y+0.215, bz0+dz, "#2a2a2c");
    for(const dx of [-0.65,0.65]) B(0.05, 0.42, 0.05, bx0+dx, Y+0.64, bz0+0.21, "#2a2a2c");
    addCol(bx0-0.77, bx0+0.77, bz0-0.23, bz0+0.25, Y-0.5, Y+0.85); addSeat(bx0, bz0, Y, 0, "THE BENCH"); }
  addUse(101.0, Z-24.0, Y, "READ THE STONES", ()=>toast(["ELIAS WEIR · 1838–1911 · HE BROKE THIS GROUND","INFANT SON · 1889 · BUDDED ON EARTH TO BLOOM IN HEAVEN","PVT. AMOS HUBBARD · 83RD PA INF. · 1841–1863",
    "MARTHA J., WIFE OF THOMAS · 1855–1902 · GONE HOME","DOROTHY & EARL KANTZ · 1921–2008 · 1919–2011 · TOGETHER","THE OLDEST ONES AT THE BACK HAVE WEATHERED SMOOTH. NOBODY KNOWS WHOSE THEY ARE"][(Math.random()*6)|0], "#d8d4c8"), 1.4);
  addZone(G.x0, G.x1, G.z0, G.z1+0.6, Y-2, Y+10, "THE OLD GRAVEYARD");

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.75, metalness:0.08}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
  EDIN_PLACES.chapel={stones:nst};
})();
