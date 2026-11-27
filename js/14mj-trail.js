"use strict";
/* REST AREA · 14mj-trail.js
   ----------------------------------------------------------------------
   Ridge Lane and Hollow Ridge Trail (EAST.lane, 04). The lane leaves
   Hollow Road south of the bookstore, runs west along its south side, then
   north behind the bookstore and the apartments to a small trailhead lot.
   From the lot's west edge the trail climbs the hillside in long legs and
   switchbacks, about 11 in 100 (04 lays it out on the ground's own grading:
   EAST.lane.trail), to Hollow Ridge Overlook, a level shelf looking east
   over the valley and the lake.

   The lane's paving is in 14md's road paving union; 14mb opens the road's
   west wall and breaks its edge line at the lane's mouth; 14me keeps the
   pole line out of the mouth and lights it. The hillside is its own 4 m
   ground (RING_TRAIL) under its own canopy shell (EAST.tcan), held down out
   of sight across the woods, which are real trees from wall to wall.

   Signs: at the road (the lane's name, and the trail's for drivers both
   ways), the kiosk at the trailhead with a map drawn from the trail itself,
   the trail's own sign at its foot, blazes along it, a mile post half way,
   and the overlook's.
   ---------------------------------------------------------------------- */
const RIDGE={routes:{}, lamps:[], look:null};
(function hollowRidge(){
  if(typeof EAST==="undefined" || !EAST.lane || !EAST.lane.trail) return;
  const Y=EDIN.y, LY=Y+PAVE_T+0.015, L=EAST.lane, TR=L.trail, LK=L.look, SM=L.summit, WD=L.woods, ME=[], r=_trng(4610);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family||"Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z);
  const BROWN="#5a3e26", CREAM="#d8ccae", POST="#5a4430";
  const tube=(a, b, r0, c)=>{ const d=b.clone().sub(a), Ld=d.length(); ME.push({geo:new T.CylinderGeometry(r0, r0, Ld, 8),
    matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  // a brown parks board: cream lettering in a cream rule, every line fitted with its padding
  const parkBoard=(lines)=>(c, W, H)=>{ c.fillStyle="#4a3422"; c.fillRect(0, 0, W, H); c.strokeStyle=CREAM; c.lineWidth=Math.max(3, H*0.03); c.strokeRect(W*0.04, H*0.06, W*0.92, H*0.88);
    const n=lines.length; lines.forEach((t, i)=>{ const big=i===0; say(c, t, W/2, H*(n===1 ? 0.5 : 0.26+0.48*i/(n-1)), W*0.78, H*(big ? 0.2 : 0.12)*(n>3 ? 0.8 : 1), CREAM, big ? "800" : "600", big ? "Georgia, serif" : "Arial"); }); };

  /* ---- the trail on the ground: a ribbon of bark mulch a metre and a half wide, each edge on the ground under it ---- */
  // (it starts a metre on, over the lot's edge, so the bark runs onto the paving with no strip of grass between)
  const PTS=[]; { const TRL=[{x:TR[0].x+1.1, z:TR[0].z}].concat(TR); for(let i=0;i<TRL.length-1;i++){ const a=TRL[i], b=TRL[i+1], n=Math.max(1, Math.ceil(Math.hypot(b.x-a.x, b.z-a.z)/0.8));
      for(let k=0;k<n;k++) PTS.push({x:a.x+(b.x-a.x)*k/n, z:a.z+(b.z-a.z)*k/n}); } PTS.push({x:TRL[TRL.length-1].x, z:TRL[TRL.length-1].z}); }
  let LEN=0; PTS.forEach((p, i)=>{ if(i) LEN+=Math.hypot(p.x-PTS[i-1].x, p.z-PTS[i-1].z); p.s=LEN; p.y=gy(p.x, p.z); });
  // (the trail runs on past the overlook to the summit since round 50: where along it the overlook is)
  let iLK=0; { let bd=1e9; PTS.forEach((p, i)=>{ const d=Math.hypot(p.x-LK.x, p.z-LK.z); if(d<bd){ bd=d; iLK=i; } }); }
  const LEN_LK=PTS[iLK].s;
  if(typeof FOREST!=="undefined") FOREST.trail(PTS, 0.75);               // (no tree set down after this covers it, 07)
  { const P=[], U=[], I=[], HW=0.75;
    PTS.forEach((p, i)=>{ const a=PTS[Math.max(0, i-1)], b=PTS[Math.min(PTS.length-1, i+1)], tx=b.x-a.x, tz=b.z-a.z, tl=Math.hypot(tx, tz)||1, nx=-tz/tl, nz=tx/tl;
      for(const o of [-HW, 0, HW]){ const x=p.x+nx*o, z=p.z+nz*o; P.push(x, gy(x, z)+0.04, z); U.push(o*0.8, p.s*0.8); } });
    for(let i=0;i<PTS.length-1;i++) for(let j=0;j<2;j++){ const a=i*3+j, b=a+1, c=a+3, d=a+4; I.push(a, c, b, b, c, d); }
    const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(U, 2)); g.setIndex(I); g.computeVertexNormals();
    if(g.attributes.normal.getY(0)<0){ for(let i=0;i<I.length;i+=3){ const t=I[i]; I[i]=I[i+1]; I[i+1]=t; } g.setIndex(I); g.computeVertexNormals(); }
    push("trailbed", g, 0, 0, 0, 0, "#7e705e"); }
  // log steps across it wherever it runs steeper than about one in six, a stake either end
  { let last=-9; PTS.forEach((p, i)=>{ if(i===0 || i===PTS.length-1 || p.s-last<0.7) return; const a=PTS[i-1], b=PTS[i+1], gr=Math.abs(b.y-a.y)/Math.max(0.1, b.s-a.s);
      if(gr<0.17) return; last=p.s; const ry=Math.atan2(b.x-a.x, b.z-a.z);
      ent(new T.CylinderGeometry(0.075, 0.075, 1.35, 8), p.x, p.y+0.03, p.z, "#5e4a34", 0, ry, Math.PI/2);
      for(const o of [-0.7, 0.7]){ const x=p.x+Math.cos(ry)*o, z=p.z-Math.sin(ry)*o; B(0.04, 0.24, 0.04, x, gy(x, z)+0.06, z, "#4a3828"); } }); }

  /* ---- the walls of the world: round the lane, the lot and the trail's woods ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300), EW=L.ew, NS=L.ns;
    W(NS.x0-2, EW.x1-1, EW.z1-0.4, EW.z1+0.4);                         // (the lane's south side, out to the road's own wall)
    W(WD.x1, NS.x1, NS.z0-0.4, NS.z0+0.4); W(NS.x1-0.4, NS.x1+0.4, NS.z0, EAST.apts.site.z0);      // (north of the lot)
    W(WD.x0-0.4, WD.x0+0.4, WD.z0, WD.z1); W(WD.x0, WD.x1, WD.z0-0.4, WD.z0+0.4); W(WD.x0, NS.x0, WD.z1-0.4, WD.z1+0.4);
    W(WD.x1-0.4, WD.x1+0.4, WD.z0, NS.z0); }
  addZone(L.ns.x0, L.ns.x1, L.ns.z0, L.ns.z1, Y-4, Y+14, "RIDGE LANE"); addZone(L.ew.x0, L.ew.x1, L.ew.z0, L.ew.z1, Y-4, Y+14, "RIDGE LANE");
  addZone(WD.x0, WD.x1, WD.z0, WD.z1, Y-4, Y+120, "HOLLOW RIDGE TRAIL");
  addZone(L.lot.x0, L.lot.x1, L.lot.z0, L.lot.z1, Y-4, Y+14, "HOLLOW RIDGE TRAILHEAD");
  addZone(LK.x-10, LK.x+10, LK.z-10, LK.z+10, LK.y-4, LK.y+20, "HOLLOW RIDGE OVERLOOK");

  /* ---- the lot: timber wheel stops along its east side, the kiosk, the trail's sign, a bench, a can; two hikers' cars ---- */
  const LT=L.lot;
  for(let i=0;i<5;i++){ const z=LT.z0+1.8+i*2.8; B(0.2, 0.14, 1.6, LT.x1-0.6, LY+0.07, z, "#6a5038"); }
  if(typeof parked==="function"){ parked(3, "#5a6a4a", LT.x1-3.0, LT.z0+1.8+2.8, Math.PI/2, Y); parked(0, "#8a6a3a", LT.x1-3.0, LT.z0+1.8+4*2.8, Math.PI/2, Y); }
  // the kiosk: a board under a little shingled roof on two posts beyond its ends, the map on it, facing the lot
  { const x=LT.x0+1.4, z=LT.z1-0.9, g=gy(x, z), w=1.9, h=1.2, yc=g+1.55;
    for(const dz of [-w/2-0.12, w/2+0.12]){ B(0.14, 2.6, 0.14, x, g+1.3, z+dz, POST); addCol(x-0.08, x+0.08, z+dz-0.08, z+dz+0.08, g-0.5, g+2.6); }
    B(0.06, h+0.1, w+0.1, x-0.03, yc, z, BROWN);
    for(const s of [-1, 1]) ent(boxGeo(0.9, 0.06, w+0.8+(s>0 ? 0.02 : 0)), x+s*0.38, g+2.72+(s>0 ? 0.004 : 0), z, "#3a3634", 0, 0, -s*0.45);
    const MW=512, MH=Math.round(512*h/w);
    sign(w-0.08, h-0.08, (c, W, H)=>{ c.fillStyle="#d4c8a8"; c.fillRect(0, 0, W, H); c.strokeStyle="#4a3422"; c.lineWidth=4; c.strokeRect(6, 6, W-12, H-12);
        say(c, "HOLLOW RIDGE TRAIL", W/2, H*0.12, W*0.8, H*0.11, "#3a2a1a", "800", "Georgia, serif");
        // the map: the trail itself, its foot and its top, drawn to scale in the board's middle
        const xs=TR.map(p=>p.x), zs=TR.map(p=>p.z), x0=Math.min(...xs), x1=Math.max(...xs), z0=Math.min(...zs), z1=Math.max(...zs);
        const bx=W*0.1, by=H*0.22, bw=W*0.62, bh=H*0.62, sc=Math.min(bw/(z1-z0), bh/(x1-x0));
        const mp=(p)=>[bx+bw/2+((p.z-(z0+z1)/2))*sc, by+bh/2+((p.x-(x0+x1)/2))*sc];
        c.fillStyle="#b8c4a0"; c.fillRect(bx-6, by-6, bw+12, bh+12);
        for(let k=0;k<7;k++){ c.strokeStyle="rgba(90,110,70,0.5)"; c.lineWidth=1; c.beginPath(); c.moveTo(bx-6, by+bh*(1-k/7)); c.lineTo(bx+bw+6, by+bh*(1-k/7)+bh*0.05); c.stroke(); }
        c.strokeStyle="#8a3a22"; c.lineWidth=4; c.setLineDash([9, 5]); c.beginPath(); TR.forEach((p, i)=>{ const [u, v]=mp(p); i ? c.lineTo(u, v) : c.moveTo(u, v); }); c.stroke(); c.setLineDash([]);
        { const [u, v]=mp(TR[0]); c.fillStyle="#2a5a8a"; c.fillRect(u-7, v-7, 14, 14); } { const [u, v]=mp(TR[TR.length-1]); c.fillStyle="#3a2a1a"; c.beginPath(); c.moveTo(u, v-11); c.lineTo(u+10, v+8); c.lineTo(u-10, v+8); c.fill(); }
        { const [u, v]=mp(LK); c.fillStyle="#8a3a22"; c.beginPath(); c.arc(u, v, 8, 0, 7); c.fill(); }
        const tx=W*0.86;
        say(c, "OVERLOOK", tx, H*0.25, W*0.2, H*0.055, "#3a2a1a", "800"); say(c, (LEN_LK/1609).toFixed(2)+" MI", tx, H*0.32, W*0.2, H*0.05, "#3a2a1a", "600");
        say(c, "SUMMIT", tx, H*0.41, W*0.2, H*0.055, "#3a2a1a", "800"); say(c, (LEN/1609).toFixed(2)+" MI", tx, H*0.48, W*0.2, H*0.05, "#3a2a1a", "600");
        say(c, "CLIMB "+Math.round((SM.y-Y)*3.28)+" FT", tx, H*0.55, W*0.2, H*0.05, "#3a2a1a", "600");
        say(c, "■ YOU ARE HERE", tx, H*0.64, W*0.2, H*0.045, "#2a5a8a", "700"); say(c, "● OVERLOOK", tx, H*0.71, W*0.2, H*0.045, "#8a3a22", "700"); say(c, "▲ SUMMIT", tx, H*0.78, W*0.2, H*0.045, "#3a2a1a", "700");
        say(c, "STAY ON THE TRAIL  ·  CARRY IN, CARRY OUT  ·  NO FIRES", W/2, H*0.92, W*0.8, H*0.06, "#3a2a1a", "700"); },
      x+0.012, yc, z, Math.PI/2, false, MW); }
  // the trail's own sign at its foot, on a post behind it, read coming across the lot
  { const p=PTS[3], x=p.x+0.4, z=p.z-1.6, g=gy(x, z); B(0.12, 1.9, 0.12, x-0.1, g+0.95, z, POST); addCol(x-0.16, x-0.04, z-0.06, z+0.06, g-0.5, g+1.9);
    B(0.05, 0.62, 0.86, x-0.025, g+1.5, z, BROWN);
    sign(0.8, 0.56, parkBoard(["HOLLOW RIDGE TRAIL", "OVERLOOK  "+(LEN_LK/1609).toFixed(2)+" MI", "SUMMIT  "+(LEN/1609).toFixed(2)+" MI", "FOLLOW THE BLUE BLAZES"]), x+0.012, g+1.5, z, Math.PI/2, false, 320); }
  // a bench by the kiosk, looking along the lot; a can
  { const x=LT.x0+1.0, z=LT.z0+4.0, g=gy(x, z); B(0.42, 0.05, 1.5, x, g+0.45, z, "#6a5038"); B(0.05, 0.42, 1.5, x-0.19, g+0.7, z, "#6a5038");
    for(const dz of [-0.65, 0.65]) B(0.4, 0.43, 0.06, x, g+0.215, z+dz, "#3a2a1a"); addCol(x-0.23, x+0.23, z-0.78, z+0.78, g-0.5, g+0.5);
    for(const dz of [-0.4, 0.4]) addSeat(x, z+dz, g, -Math.PI/2, "THE BENCH AT THE TRAILHEAD");
    C(0.28, 0.9, LT.x0+0.9, g+0.45, LT.z0+6.4, "#3a4a3a", 16); addCol(LT.x0+0.6, LT.x0+1.2, LT.z0+6.1, LT.z0+6.7, g-0.5, g+0.9); }

  /* ---- blazes: a post at every turn and every forty metres, a blue band round its top; a mile post half way ---- */
  { let next=18, side=1; PTS.forEach((p, i)=>{ if(i===0 || i===PTS.length-1) return; const a=PTS[i-1], b=PTS[i+1];
      const turn=Math.abs(Math.atan2(b.x-p.x, b.z-p.z)-Math.atan2(p.x-a.x, p.z-a.z));
      if(p.s<next && !(turn>0.6 && p.s>next-30)) return; next=p.s+40; side=-side;
      const tl=Math.hypot(b.x-a.x, b.z-a.z)||1, x=p.x-(b.z-a.z)/tl*side*1.45, z=p.z+(b.x-a.x)/tl*side*1.45, g=gy(x, z);
      // (not on another leg of the trail: on a tight switchback the post beside one leg can stand on the next)
      if(PTS.some(t=>Math.abs(t.x-x)<1.4 && Math.abs(t.z-z)<1.4 && Math.hypot(t.x-x, t.z-z)<1.4)){ next=p.s+6; side=-side; return; }
      B(0.1, 1.1, 0.1, x, g+0.55, z, POST); B(0.104, 0.14, 0.104, x, g+0.9, z, "#2a5a9a"); B(0.12, 0.03, 0.12, x, g+1.115, z, "#3a2a1a");
      addCol(x-0.06, x+0.06, z-0.06, z+0.06, g-0.4, g+1.1); }); }
  { const p=PTS.find(q=>q.s>LEN/2 && !PTS.some(t=>Math.abs(t.s-q.s)>4 && Math.hypot(t.x-q.x, t.z-q.z)<4)) || PTS[1], i=PTS.indexOf(p), a=PTS[i-1], b=PTS[i+1], tl=Math.hypot(b.x-a.x, b.z-a.z)||1, x=p.x+(b.z-a.z)/tl*1.2, z=p.z-(b.x-a.x)/tl*1.2, g=gy(x, z);
    const ry=Math.atan2(a.x-p.x, a.z-p.z); B(0.14, 1.3, 0.14, x, g+0.65, z, POST); addCol(x-0.08, x+0.08, z-0.08, z+0.08, g-0.4, g+1.3);
    const fx=Math.sin(ry), fz=Math.cos(ry); B(0.36, 0.26, 0.04, x+fx*0.09, g+1.05, z+fz*0.09, BROWN, ry);
    sign(0.32, 0.22, parkBoard(["HALF WAY", (LEN/2/1609).toFixed(2)+" MI TO GO"]), x+fx*0.122, g+1.05, z+fz*0.122, ry, false, 200); }

  /* ---- Hollow Ridge Overlook: a gravel shelf, a split-rail fence along its downhill edge, two benches looking east,
     a viewer on a post, the sign; the view cut open east down over the valley to the lake ---- */
  { const x=LK.x, z=LK.z, g=LK.y;
    C(6.2, 0.1, x, g+0.0, z, "#8e8676", 40);      // (the shelf's gravel: a slab in the detail mesh, not a paving bucket, so no verge is laid round it)
    // the fence: posts round the east half, two rails between each pair
    const R=6.6, posts=[]; for(let k=0;k<=8;k++){ const a=-Math.PI/2+k*Math.PI/8, px=x+Math.cos(a)*R, pz=z+Math.sin(a)*R; posts.push(V3(px, gy(px, pz), pz)); }
    // (open where the trail comes in: no rail, and no post, within a couple of metres of it)
    const onTrail=(x, z, m)=>PTS.some(t=>Math.hypot(t.x-x, t.z-z)<m);
    posts.forEach((p, k)=>{ const postHere=!onTrail(p.x, p.z, 1.3);
      if(postHere){ C(0.07, 1.1, p.x, p.y+0.55, p.z, "#6a5038", 8); addCol(p.x-0.08, p.x+0.08, p.z-0.08, p.z+0.08, p.y-0.5, p.y+1.1); }
      if(k){ const q=posts[k-1], mx=(p.x+q.x)/2, mz=(p.z+q.z)/2; if(onTrail(mx, mz, 2.2) || !postHere || onTrail(q.x, q.z, 1.3)) return;
        for(const hh of [0.5, 0.95]) tube(V3(q.x, q.y+hh, q.z), V3(p.x, p.y+hh, p.z), 0.045, "#7a5e40");
        addColOB(mx, mz, Math.atan2(p.x-q.x, p.z-q.z), 0.06, Math.hypot(p.x-q.x, p.z-q.z)/2, Math.min(p.y, q.y)-0.2, Math.max(p.y, q.y)+1.0); } });
    // two benches facing east, their backs to the hill
    const BENCH=[-2.0, 2.0, 3.8, -3.8].filter(dz=>![-0.75, 0, 0.75].some(o=>onTrail(x+1.2, z+dz+o, 1.4))).slice(0, 2); RIDGE.bench=BENCH;
    for(const dz of BENCH){ const bx=x+1.2, bz=z+dz; B(0.42, 0.05, 1.5, bx, g+0.45, bz, "#6a5038"); B(0.05, 0.42, 1.5, bx-0.19, g+0.72, bz, "#6a5038");
      for(const o of [-0.65, 0.65]) B(0.4, 0.43, 0.06, bx, g+0.215, bz+o, "#3a2a1a"); addCol(bx-0.23, bx+0.23, bz-0.78, bz+0.78, g-0.5, g+0.5);
      for(const o of [-0.4, 0.4]) addSeat(bx, bz+o, g, -Math.PI/2, "A BENCH AT THE OVERLOOK"); }
    // the viewer on its post, by the fence
    { const vx=x+4.6, vz=z-1.0; C(0.06, 1.1, vx, g+0.55, vz, "#3a4a3a", 10); ent(new T.CylinderGeometry(0.11, 0.13, 0.36, 12), vx, g+1.25, vz, "#3a5a4a", 0, 0, Math.PI/2);
      for(const o of [-0.07, 0.07]) C(0.035, 0.1, vx+0.2, g+1.27, vz+o, "#2a2a2a", 10, 0, 0, Math.PI/2); addCol(vx-0.1, vx+0.1, vz-0.1, vz+0.1, g-0.5, g+1.3); }
    // the sign on two posts beyond its ends, on the uphill side, read from the shelf
    { const sx=x-4.6, sz=z+1.5, g2=gy(sx, sz), w=1.5, h=0.8, yc=g2+1.35;
      for(const dz of [-w/2-0.1, w/2+0.1]){ B(0.12, 1.85, 0.12, sx, g2+0.92, sz+dz, POST); addCol(sx-0.07, sx+0.07, sz+dz-0.07, sz+dz+0.07, g2-0.5, g2+1.85); }
      B(0.06, h+0.06, w+0.06, sx-0.03, yc, sz, BROWN);
      sign(w, h, parkBoard(["HOLLOW RIDGE OVERLOOK", "ELEV. "+Math.round(1180+(LK.y-Y)*3.28)+" FT", "EDINBORO LAKE AND HOLLOW ROAD BELOW"]), sx+0.012, yc, sz, Math.PI/2, false, 480); }
    RIDGE.look={x:x, y:g, z:z}; }

  /* ---- Hollow Ridge Summit (round 50): the trail's end on the bald top of the ridge; boulders, a cairn with the survey's
     disc on the biggest stone, the sign on two posts beyond its ends, two benches looking east down the whole valley to
     the lake; the view cut open east ---- */
  { const x=SM.x, z=SM.z, g=SM.y, STONE=["#6e6a62","#625e58","#76726a","#5a5650"];      // (sandstone gone grey; darker than it looks, in full sun)
    const onTrail=(px, pz, m)=>PTS.some(t=>Math.hypot(t.x-px, t.z-pz)<m);
    const rock=(px, pz, rr, hh, col)=>{ const gg=gy(px, pz), geo=new T.SphereGeometry(rr, 10, 7); geo.scale(1, hh/rr, 0.85); ent(geo, px, gg+hh*0.35, pz, col, 0, (px*7+pz*3)%3, 0);
      addCol(px-rr*0.8, px+rr*0.8, pz-rr*0.7, pz+rr*0.7, gg-0.5, gg+hh*1.2); };
    // the outcrop the top is: a few big stones on its west side, clear of the trail's way in and the benches
    for(const [dx, dz, rr, hh] of [[-6.5, -2.5, 1.5, 0.9],[-7.2, 1.8, 1.1, 0.7],[-4.8, 4.6, 0.9, 0.55],[-3.6, -5.8, 1.2, 0.6],[5.5, -6.5, 0.8, 0.45],[6.8, 5.2, 0.7, 0.4]])
      if(!onTrail(x+dx, z+dz, rr+1.4)) rock(x+dx, z+dz, rr, hh, STONE[((dx*3+dz)|0)&3]);
    // the cairn: flat stones, smaller as it goes up
    { const cx=x-1.5, cz=z-3.0, gg=gy(cx, cz); let yy=gg;
      for(let k=0;k<6;k++){ const rr=0.55-k*0.075, hh=0.16-k*0.012, geo=new T.SphereGeometry(rr, 9, 6); geo.scale(1, hh/rr, 0.9); ent(geo, cx+((k%2)-0.5)*0.05, yy+hh*0.6, cz, STONE[k&3], 0, k*0.9, 0); yy+=hh*1.1; }
      addCol(cx-0.45, cx+0.45, cz-0.45, cz+0.45, gg-0.5, yy+0.1); }
    // the disc on the big stone
    { const bx=x-6.5, bz=z-2.5, gg=gy(bx, bz); C(0.05, 0.02, bx, gg+0.9*0.35+0.9*0.62, bz, "#a8803a", 14); }
    // two benches facing east, backs to the outcrop
    // (east of the trail's way onto the top, which comes up along its east side)
    const BX=4.5, BENCH=[-2.2, 2.2, 4.0, -4.0, 0].filter(dz=>![-0.75, 0, 0.75].some(o=>onTrail(x+BX, z+dz+o, 1.4))).slice(0, 2);
    for(const dz of BENCH){ const bx=x+BX, bz=z+dz, gg=gy(bx, bz); B(0.42, 0.05, 1.5, bx, gg+0.45, bz, "#6a5038"); B(0.05, 0.42, 1.5, bx-0.19, gg+0.72, bz, "#6a5038");
      for(const o of [-0.65, 0.65]) B(0.4, 0.43, 0.06, bx, gg+0.215, bz+o, "#3a2a1a"); addCol(bx-0.23, bx+0.23, bz-0.78, bz+0.78, gg-0.5, gg+0.5);
      for(const o of [-0.4, 0.4]) addSeat(bx, bz+o, gg, -Math.PI/2, "A BENCH ON THE SUMMIT"); }
    // the sign: on the outcrop's side, read from the top, its posts beyond its ends
    { const sx=x-3.4, sz=z+0.6, g2=gy(sx, sz), w=1.5, h=0.8, yc=g2+1.35;
      if(!onTrail(sx, sz, 1.6)){
        for(const dz of [-w/2-0.1, w/2+0.1]){ B(0.12, 1.85, 0.12, sx, g2+0.92, sz+dz, POST); addCol(sx-0.07, sx+0.07, sz+dz-0.07, sz+dz+0.07, g2-0.5, g2+1.85); }
        B(0.06, h+0.06, w+0.06, sx-0.03, yc, sz, BROWN);
        sign(w, h, parkBoard(["HOLLOW RIDGE SUMMIT", "ELEV. "+Math.round(1180+(g-Y)*3.28)+" FT", (LEN/1609).toFixed(2)+" MI FROM THE TRAILHEAD"]), sx+0.012, yc, sz, Math.PI/2, false, 480); } }
    addZone(x-15, x+15, z-15, z+15, g-6, g+20, "HOLLOW RIDGE SUMMIT");
    RIDGE.summit={x:x, y:g, z:z}; }

  /* ---- at Hollow Road: the lane's street blade on its pole at the corner, the trail's sign for traffic both ways ---- */
  { const M=L.mouth, x=RX_()-4.6, z=M.z1+1.2, g=gy(x, z), top=2.6;
    C(0.035, top, x, g+top/2, z, "#8d9294", 10); addCol(x-0.05, x+0.05, z-0.05, z+0.05, g-0.5, g+top);
    B(0.9, 0.17, 0.02, x, g+top+0.1, z, "#8d9294");
    for(const s of [-1, 1]) sign(0.88, 0.15, (c, W, H)=>{ c.fillStyle="#1f6a3a"; c.fillRect(0, 0, W, H); c.strokeStyle="#d8d0c0"; c.lineWidth=3; c.strokeRect(3, 3, W-6, H-6); c.fillStyle="#d8d0c0"; fitHwy(c, "RIDGE LN", W*0.8, H*0.6, W/2, H/2); },
      x, g+top+0.1, z+s*0.012, s<0 ? Math.PI : 0, false, 264); }
  { const x=RX_()-5.8, z=L.mouth.z1+5.5, g=gy(x, z), w=1.8, h=0.9, top=g+2.2;
    for(const dx of [-w/2-0.1, w/2+0.1]){ B(0.12, top+0.1-g, 0.12, x+dx, (top+0.1+g)/2, z, POST); addCol(x+dx-0.07, x+dx+0.07, z-0.07, z+0.07, g-0.5, top); }
    B(w+0.06, h+0.06, 0.08, x, top-h/2, z, BROWN);
    const draw=(arrowRight)=>(c, W, H)=>{ parkBoard(["HOLLOW RIDGE TRAIL", "TRAILHEAD PARKING", "SUMMIT "+(LEN/1609).toFixed(2)+" MI"])(c, W, H);
      c.fillStyle=CREAM; const ax=arrowRight ? W*0.88 : W*0.12, ay=H*0.5, s=H*0.12; c.beginPath(); c.moveTo(ax+(arrowRight ? s : -s), ay); c.lineTo(ax, ay-s); c.lineTo(ax, ay+s); c.fill(); };
    sign(w, h, draw(false), x, top-h/2, z+0.052, 0, false, 480); sign(w, h, draw(true), x, top-h/2, z-0.052, Math.PI, false, 480); }

  /* ---- the woods: real trees from wall to wall, clear of the trail, the overlook's shelf and its view east; more past the walls ---- */
  if(typeof FOREST!=="undefined"){ const q=_trng(4611);
    const tree=(sp, x, z, s)=>{ if(FOREST.plant(sp, x, z, {scale:s})===false) return; const rr=0.24*s, g=gy(x, z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const nearTrail=(x, z, m)=>{ for(let i=0;i<PTS.length;i+=2){ const p=PTS[i]; if(Math.abs(p.x-x)<m+1 && Math.abs(p.z-z)<m+1 && Math.hypot(p.x-x, p.z-z)<m) return true; } return false; };
    const inView=(x, z)=>{ const dx=x-LK.x, dz=z-LK.z, ex=x-SM.x, ez=z-SM.z; return Math.hypot(dx, dz)<11 || (dx>0 && dx<80 && Math.abs(dz)<dx*0.55+4)
      || Math.hypot(ex, ez)<17 || (ex>0 && ex<110 && Math.abs(ez)<ex*0.5+6); };
    // (the woods as they were, every five metres; the mountain above them, opened in round 50, a little sparser)
    const lat=[]; for(let x=WD.x0+2.4; x<WD.x1-1.5; x+=5.0) for(let z=-1934+2.4; z<WD.z1-1.5; z+=5.0) if(x>=402) lat.push([x, z]);
    for(let x=WD.x0+2.4; x<WD.x1-1.5; x+=5.8) for(let z=WD.z0+2.4; z<WD.z1-1.5; z+=5.8) if(x<402 || z<-1934) lat.push([x, z]);
    for(const [x, z] of lat){ const jx=x+(q()-0.5)*3.0, jz=z+(q()-0.5)*3.0;
      if(Terrain.siteDist(jx, jz)<2.5 || nearTrail(jx, jz, 2.6) || inView(jx, jz)) continue;
      tree(q()<0.32 ? "hemlock" : q()<0.45 ? "pine" : "hard", jx, jz, 0.8+q()*0.45);
      if(q()<0.35){ const fx=jx+(q()-0.5)*2.2, fz=jz+(q()-0.5)*2.2; if(!nearTrail(fx, fz, 1.3) && !inView(fx, fz)) FOREST.plant(q()<0.55 ? "fern" : "shrub", fx, fz, {scale:0.7+q()*0.5, solid:false}); } }
    // past the walls: three rows more on the west, the north and the south, and north of the lot
    const row=(x0, z0, x1, z1, nx, nz)=>{ const Ln=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(Ln/6.0));
      for(let k=0;k<=n;k++) for(const dep of [2.0, 7.0, 12.5]){ if(q()<0.12) continue; const t=(k+q()*0.6)/n, x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(q()<0.35 ? "hemlock" : q()<0.5 ? "pine" : "hard", x, z, 0.85+q()*0.4); } };
    row(WD.x0, WD.z0, WD.x0, WD.z1, -1, 0); row(WD.x0, WD.z0, L.ns.x1, WD.z0, 0, -1); row(WD.x0, WD.z1, L.ew.x1-2, WD.z1, 0, 1);
    row(L.ns.x1, WD.z0, L.ns.x1, L.ns.z0, 1, 0);                    // (and east, past the strip below, along the mountain's foot south of the lane)
    for(let x=WD.x1+1.5; x<L.ns.x1-1; x+=4.6) for(let z=WD.z0+2; z<L.ns.z0-1.5; z+=4.6){ const jx=x+(q()-0.5)*2, jz=z+(q()-0.5)*2; if(Terrain.siteDist(jx, jz)>2.5) tree(q()<0.4 ? "hemlock" : "hard", jx, jz, 0.85+q()*0.35); }
    // between the lane and the back yards, a loose row of maples and a lilac or two
    for(let z=L.ns.z0+6; z<L.ns.z1-6; z+=9.5){ const x=663.2+(q()-0.5)*1.2; if(z>L.lot.z0-2 && z<L.lot.z1+2) continue; tree("edge", x, z+(q()-0.5)*2, 0.8+q()*0.3); } }

  /* ---- a hiker on the trail by day, going up and coming back down; another on the overlook's bench ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("hollow ridge trail", (WD.x0+WD.x1)/2, (WD.z0+WD.z1)/2, 160);
    const path=[]; for(let i=0;i<PTS.length;i+=6) path.push([PTS[i].x, PTS[i].z]); path.push([PTS[PTS.length-1].x, PTS[PTS.length-1].z]);
    const loop=path.concat(path.slice(0, -1).reverse());
    crowdAdd(G, {look:{h:0.98, female:true, skin:SKINS[1], hair:HAIRS[2], hairStyle:"pony", shirt:"#8a3a2a", pants:"#3a3e2e", shoes:"#3a2a1a", cap:"#2a4a3a"}, mode:"walk", path:loop, loop:true, speed:0.95, dayOnly:true});
    if(RIDGE.bench && RIDGE.bench.length){ const bx=LK.x+1.2+0.05, bz=LK.z+RIDGE.bench[0]+0.4; crowdAdd(G, {look:{h:1.0, skin:SKINS[3], hair:HAIRS[5], beard:HAIRS[5], beardStyle:"short", shirt:"#3a5a7a", pants:"#5c5a52", shoes:"#3a2a1a"},
        x:bx, z:bz, y:LK.y, yaw:-Math.PI/2+Math.PI, mode:"sit", sitY:0.515, sway:0.2, dayOnly:true}); } }

  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.85, metalness:0.02}), "hollow-ridge", true);

  /* ---- the ways round it, for tools/walk.js ---- */
  const MZ=(L.mouth.z0+L.mouth.z1)/2, up=[]; for(let i=0;i<PTS.length;i+=3) up.push([PTS[i].x, PTS[i].z]); up.push([PTS[PTS.length-1].x, PTS[PTS.length-1].z]);
  RIDGE.routes={
    "hollow ridge: in off Hollow Road along Ridge Lane to the trailhead":[[731.0, MZ],[722.0, MZ],[700.0, -1798.0],[660.0, -1798.0],[653.5, -1806.0],[653.5, -1850.0],[653.5, -1866.0],[649.0, -1871.5]],
    "hollow ridge: up the trail to the overlook":[[652.0, -1871.5]].concat(up.filter(p=>PTS.findIndex(t=>t.x===p[0] && t.z===p[1])<=iLK), [[PTS[iLK].x, PTS[iLK].z]]),
    "hollow ridge: on up from the overlook to the summit":[[PTS[iLK].x, PTS[iLK].z]].concat(up.filter(p=>PTS.findIndex(t=>t.x===p[0] && t.z===p[1])>iLK)),
    // (round 50: the bookstore, the apartments and the lane are one place, with no walls between them)
    "hollow ridge: from the bookstore round the back of the apartments onto the lane":[[690.0, -1809.0],[676.0, -1809.0],[676.0, -1840.0],[676.0, -1858.0],[656.0, -1858.0],[656.0, -1820.0],[660.0, -1798.0]],
    "hollow ridge: round the summit":[[SM.x+1.0, SM.z+0.0],[SM.x+2.8, SM.z-1.0],[SM.x+2.8, SM.z+1.2],[SM.x+0.5, SM.z+3.5],[SM.x-1.5, SM.z+1.0]],
    "hollow ridge: out onto the overlook to the fence":[[LK.x-2.5, LK.z],[LK.x+3.0, LK.z+0.4],[LK.x+4.2, LK.z+2.6]]};
  function RX_(){ return EAST.beer.rx-3.4; }
})();
