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

  // the stone it stands on, its top a centimetre under the floor; the walls, clapboard; corner boards
  bx("fh_stone", H.x1-H.x0+0.10, FF-0.01-(Y-0.4), H.z1-H.z0+0.10, xm, (FF-0.01+Y-0.4)/2, (H.z0+H.z1)/2, 0.6, 0, "#ffffff");
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
