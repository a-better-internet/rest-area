"use strict";
/* REST AREA · 14me-hollow.js
   Hollow Road, dressed: everything along it that is not one of its places
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. (After 14md: the places are built, so
   this can run its wires to them and keep its things off their ground.) */
/* ----------------------------------------------------------------------
   14me · HOLLOW ROAD, DRESSED
   A county road that three businesses use looks it: a pole line down
   the west side with the wires sagging between, a drop across to each
   place, a cobra-head light over each mouth; the signs a road like it
   has (the speed limit each way, a deer crossing, trucks entering at the
   pretzel works, the office park a quarter mile ahead, the end of
   county maintenance); reflector posts down both edges; a guardrail
   where the road crosses Hollow Run in its culvert; the county's bus
   shelter by the office park; the mown verge going to chicory and
   goldenrod against the trees. And at the places themselves the small
   things: the beer distributor's neon in its front and a bench by the
   door, the pretzel works' flags out front, its beds along the lobby,
   a bench and a bike rack, steam off the oven stacks.

   Every sign stands in front of what holds it up; nothing here is plain
   white. Everything is the county's own and made up here.
   ---------------------------------------------------------------------- */
const HOLLOW={lamps:[], steam:[]};
(function hollowRoad(){
  if(typeof EAST==="undefined" || !EAST.beer || !EAST.pretz || !EAST.office) return;
  const E=EDIN, Y=E.y, Bq=EAST.beer, RX=Bq.rx, RW=3.4, END=Bq.end, Z=E.z, HW=E.hw, LY=Y+PAVE_T+0.015;
  const ME=[], q=_trng(5150);
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz);
  const S=(r0,x,y,z,c)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c);
  const tubeE=(a, b, rr, c, seg)=>{ const d=b.clone().sub(a), L=d.length(); ME.push({geo:new T.CylinderGeometry(rr, rr, L, seg||6),
      matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family||"Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z);
  const P=EAST.pretz.site, O=EAST.office.site, L=Bq.lot;
  const onPlace=(x, z, m)=>[P, O, L, Bq.lot].some(b=>x>b.x0-(m||0) && x<b.x1+(m||0) && z>b.z0-(m||0) && z<b.z1+(m||0));
  const mouths=[[L.z0, L.z1],[EAST.marina.mouth.z0-6, EAST.marina.mouth.z1+6],[EAST.pretz.mouth.z0-6, EAST.pretz.mouth.z1+6],[EAST.office.mouth.z0-6, EAST.office.mouth.z1+6]];
  const inMouth=(z)=>mouths.some(([a, b])=>z>a-2 && z<b+2);

  /* ---- the pole line down the west side, its wires; a drop to each place; a light over each mouth ---- */
  { const WOOD="#5e4e3c", WIRE="#2a2a2a", PX=RX-RW-3.4, PH=12.5;
    const pole=(x, z, h)=>{ const g=gy(x, z); ent(new T.CylinderGeometry(0.12, 0.18, h, 12), x, g+h/2, z, WOOD);
      B(2.2, 0.1, 0.12, x, g+h-0.35, z, WOOD); for(const dx of [-0.95, 0, 0.95]) C(0.035, 0.12, x+dx, g+h-0.24, z, "#6a7a5e", 10);
      addCol(x-0.17, x+0.17, z-0.17, z+0.17, g-0.5, g+h); return g+h; };
    const wire=(a, b, sag, rr)=>{ const n=10; let p=a.clone(); for(let k=1;k<=n;k++){ const t=k/n, w=new T.Vector3().lerpVectors(a, b, t); w.y-=sag*4*t*(1-t); tubeE(p, w, rr||0.01, WIRE, 5); p=w; } };
    const tops=[]; for(let z=Z-HW-14; z>END+8; z-=42){ const t=pole(PX, z, PH); tops.push([z, t]); }
    for(let i=1;i<tops.length;i++){ const [z0, t0]=tops[i-1], [z1, t1]=tops[i];
      for(const dx of [-0.95, 0, 0.95]) wire(V3(PX+dx, t0-0.18, z0), V3(PX+dx, t1-0.18, z1), 0.7);
      wire(V3(PX, t0-2.0, z0), V3(PX, t1-2.0, z1), 0.85, 0.012); }
    // (the first pole fed from US 6N's line, across the road at its mouth)
    { const [z0, t0]=tops[0]; wire(V3(PX, t0-0.18, z0), V3(Math.min(RX-18, PX-14), t0-0.4, Z-8.2), 0.6); }
    // a drop to each place, from the pole nearest its mouth to a can on the building's corner
    const nearest=(z)=>tops.reduce((m, p)=>Math.abs(p[0]-z)<Math.abs(m[0]-z) ? p : m, tops[0]);
    for(const [mz, to] of [[(L.z0+L.z1)/2, V3(748.0, Y+4.6, -1276.2)],[ (EAST.pretz.mouth.z0+EAST.pretz.mouth.z1)/2, V3(767.9, Y+5.3, -1568.2)],[(EAST.office.mouth.z0+EAST.office.mouth.z1)/2, V3(821.95, Y+5.0, -1756.0)]]){
      const [pz, pt]=nearest(mz); C(0.24, 0.7, PX+0.35, pt-2.6, pz, "#7a7d7a", 18); wire(V3(PX+0.35, pt-2.3, pz), to, 1.2, 0.014); S(0.05, to.x, to.y, to.z, "#4a4a4a"); }
    // a cobra-head light out over the road at each mouth, on the nearest pole
    for(const [a, b] of mouths){ const mz=(a+b)/2, [pz, pt]=nearest(mz);
      tubeE(V3(PX, pt-4.2, pz), V3(PX+4.2, pt-3.6, pz), 0.045, "#7a7d80"); RB(0.62, 0.16, 0.32, PX+4.5, pt-3.62, pz, "#6a6d70", 0, 0.05);
      push("lk_porch", boxGeo(0.44, 0.012, 0.22, 0), PX+4.5, pt-3.705, pz, 0, "#ffffff");
      const Lm={x:PX+4.5, y:pt-3.9, z:pz, color:0xffd8a0, intensity:0, dist:24, decay:1.3, mothy:true}; LAMPS.push(Lm); HOLLOW.lamps.push(Lm); }
    addZone(PX-1, PX+1, END, Z-HW, Y-1, Y+14, "HOLLOW ROAD"); }

  /* ---- the signs: posts behind their boards from the side they are read ---- */
  // (a sign read by traffic going north (−z) faces +z, its post on its −z side; going south it faces −z, its post on +z)
  const roadSign=(x, z, faceN, w, h, draw, top)=>{ const g=gy(x, z), dz=faceN ? -1 : 1, py=g+(top||2.3);
    B(0.065, (top||2.3)+h/2-0.05, 0.065, x, g+((top||2.3)+h/2-0.05)/2, z+dz*0.05, "#8d9294"); addCol(x-0.05, x+0.05, z+dz*0.05-0.05, z+dz*0.05+0.05, g-0.5, py+h/2);
    B(w+0.02, h+0.02, 0.02, x, py, z, "#8d9294");
    sign(w, h, draw, x, py, z-dz*0.022, faceN ? 0 : Math.PI, false, Math.round(w*260)); };
  const diamond=(word1, word2, pic)=>(c, W, H)=>{ c.clearRect(0, 0, W, H); c.fillStyle="#2a2a2a"; c.beginPath(); c.moveTo(W/2, 0); c.lineTo(W, H/2); c.lineTo(W/2, H); c.lineTo(0, H/2); c.fill();
    c.fillStyle="#e8b818"; c.beginPath(); c.moveTo(W/2, H*0.04); c.lineTo(W*0.96, H/2); c.lineTo(W/2, H*0.96); c.lineTo(W*0.04, H/2); c.fill();
    if(pic) pic(c, W, H); else { say(c, word1, W/2, H*0.42, W*0.5, H*0.12, "#1a1a1a", "800"); if(word2) say(c, word2, W/2, H*0.58, W*0.5, H*0.12, "#1a1a1a", "800"); } };
  const deer=(c, W, H)=>{ c.fillStyle="#1a1a1a"; c.beginPath(); c.ellipse(W*0.48, H*0.52, W*0.16, H*0.07, -0.15, 0, 7); c.fill();
    for(const [x0, x1] of [[0.38, 0.33],[0.44, 0.42],[0.55, 0.58],[0.6, 0.66]]){ c.fillRect(W*x0, H*0.55, W*0.025, H*0.16); }
    c.beginPath(); c.moveTo(W*0.6, H*0.48); c.lineTo(W*0.66, H*0.33); c.lineTo(W*0.7, H*0.36); c.lineTo(W*0.65, H*0.5); c.fill();
    c.beginPath(); c.ellipse(W*0.68, H*0.33, W*0.045, H*0.03, 0.4, 0, 7); c.fill(); c.lineWidth=W*0.012; c.strokeStyle="#1a1a1a";
    c.beginPath(); c.moveTo(W*0.66, H*0.31); c.lineTo(W*0.62, H*0.24); c.moveTo(W*0.64, H*0.27); c.lineTo(W*0.6, H*0.27); c.moveTo(W*0.68, H*0.3); c.lineTo(W*0.7, H*0.22); c.stroke(); };
  const speed=(n)=>(c, W, H)=>{ c.fillStyle="#d8d0c0"; c.fillRect(0, 0, W, H); c.strokeStyle="#1a1a1a"; c.lineWidth=W*0.03; c.strokeRect(W*0.05, H*0.04, W*0.9, H*0.92);
    say(c, "SPEED", W/2, H*0.2, W*0.66, H*0.13, "#1a1a1a", "700"); say(c, "LIMIT", W/2, H*0.36, W*0.66, H*0.13, "#1a1a1a", "700"); say(c, String(n), W/2, H*0.66, W*0.6, H*0.34, "#1a1a1a", "700"); };
  const guide=(lines)=>(c, W, H)=>{ c.fillStyle="#1f5a34"; c.fillRect(0, 0, W, H); c.strokeStyle="#d8d0c0"; c.lineWidth=W*0.02; c.strokeRect(W*0.03, H*0.06, W*0.94, H*0.88);
    lines.forEach((l, k)=>say(c, l, W/2, H*((k+1)/(lines.length+1)), W*0.8, H*0.5/lines.length, "#d8d0c0", "600")); };
  const xE=RX+RW+1.8, xW=RX-RW-1.8;
  roadSign(xE, Z-HW-22, true, 0.62, 0.78, speed(35)); roadSign(xW, END+30, false, 0.62, 0.78, speed(35));
  roadSign(xE, -1420, true, 0.76, 0.76, diamond(null, null, deer), 2.1); roadSign(xW, -1470, false, 0.76, 0.76, diamond(null, null, deer), 2.1);
  roadSign(xE, EAST.pretz.mouth.z1+70, true, 0.76, 0.76, diamond("TRUCKS", "ENTERING"), 2.1); roadSign(xW, EAST.pretz.mouth.z0-60, false, 0.76, 0.76, diamond("TRUCKS", "ENTERING"), 2.1);
  roadSign(xE, EAST.office.mouth.z1+120, true, 1.9, 0.9, guide(["HOLLOW ROAD", "CORPORATE PARK  ¼ MI"]), 2.2);
  roadSign(xE, EAST.office.mouth.z0-40, true, 1.1, 0.7, guide(["END", "COUNTY MAINT."]), 2.1);

  /* ---- reflector posts down both edges; the guardrail over Hollow Run ---- */
  { const RUN=-1430;
    for(let z=Z-HW-30; z>END+6; z-=30) for(const [x, s] of [[RX+RW+1.0, 1],[RX-RW-1.0, -1]]){
      if(s>0 && (inMouth(z) || onPlace(x+3, z, 2))) continue; if(Math.abs(z-RUN)<22) continue;
      const g=gy(x, z); B(0.08, 1.2, 0.05, x, g+0.6, z, "#3a5a3a"); B(0.07, 0.16, 0.006, x, g+1.02, z+0.028, "#e8a418"); B(0.07, 0.16, 0.006, x, g+1.02, z-0.028, "#c8c0b0");
      addCol(x-0.05, x+0.05, z-0.04, z+0.04, g-0.3, g+1.2); }
    // (the culvert's guardrail both sides: galvanised W-beam on wood posts, a reflector on every other post, ends turned down)
    for(const [x, s] of [[RX+RW+0.9, 1],[RX-RW-0.9, -1]]){ const z0=RUN+18, z1=RUN-18;
      for(let z=z0; z>=z1-0.01; z-=1.9){ const g=gy(x, z); B(0.15, 0.95, 0.15, x+s*0.1, g+0.47, z, "#5e4e3c"); addCol(x+s*0.1-0.08, x+s*0.1+0.08, z-0.08, z+0.08, g-0.3, g+0.8); }
      for(let z=z0; z>z1; z-=4.0){ const za=z, zb=Math.max(z1, z-4.0), g=gy(x, (za+zb)/2); B(0.06, 0.32, za-zb+0.02, x-s*0.02, g+0.62, (za+zb)/2, "#9aa0a2"); B(0.04, 0.06, za-zb+0.02, x-s*0.055, g+0.62, (za+zb)/2, "#8a9092"); }
      addCol(x-0.06, x+0.06, z1, z0, gy(x, RUN)-0.3, gy(x, RUN)+0.78);
      for(const ze of [z0, z1]){ const g=gy(x, ze); tubeE(V3(x-s*0.02, g+0.62, ze), V3(x-s*0.02, g+0.05, ze+(ze===z0 ? 3 : -3)), 0.06, "#9aa0a2", 6); } }
    // (its name, by the rail)
    { const x=RX+RW+1.6, z=RUN+20, g=gy(x, z); B(0.065, 1.4, 0.065, x, g+0.7, z-0.05, "#8d9294"); addCol(x-0.05, x+0.05, z-0.1, z, g-0.3, g+1.4);
      sign(0.9, 0.24, (c, W, H)=>{ c.fillStyle="#1f4a7a"; c.fillRect(0, 0, W, H); say(c, "HOLLOW RUN", W/2, H/2, W*0.8, H*0.6, "#d8d0c0", "700"); }, x, g+1.3, z-0.013+0.0, 0, false, 216);
      B(0.92, 0.26, 0.02, x, g+1.3, z-0.03, "#8d9294"); } }

  /* ---- the county's bus shelter by the office park's mouth, its bench facing the road ---- */
  { const x=RX-RW-3.0, z=(EAST.office.mouth.z0+EAST.office.mouth.z1)/2+12, g=gy(x, z);
    B(1.8, 0.08, 3.4, x-0.1, g+0.04, z, "#8a8478");                                    // (its pad)
    for(const [dx, dz] of [[-0.85, -1.6],[-0.85, 1.6],[0.6, -1.6],[0.6, 1.6]]) B(0.06, 2.3, 0.06, x+dx, g+1.19, z+dz, "#2a3a4a");
    push("tint", boxGeo(0.03, 1.9, 3.1), x-0.85, g+1.15, z, 0, "#5a6a6a"); for(const s of [-1, 1]) push("tint", boxGeo(1.3, 1.9, 0.03), x-0.15, g+1.15, z+s*1.6, 0, "#5a6a6a");
    B(1.7, 0.08, 3.5, x-0.1, g+2.38, z, "#2a3a4a"); addRoof(x-0.95, x+0.75, z-1.75, z+1.75, g+2.42);
    addCol(x-0.9, x-0.8, z-1.65, z+1.65, g-0.3, g+2.3); for(const s of [-1, 1]) addCol(x-0.9, x+0.62, z+s*1.6-0.05, z+s*1.6+0.05, g-0.3, g+2.3);
    B(0.4, 0.05, 2.4, x-0.55, g+0.46, z, "#6a4a32"); for(const dz of [-1.0, 1.0]) B(0.05, 0.44, 0.38, x-0.55, g+0.22, z+dz, "#2a3a4a"); addCol(x-0.76, x-0.34, z-1.2, z+1.2, g-0.3, g+0.5);
    for(const dz of [-0.6, 0, 0.6]) addSeat(x-0.52, z+dz, g+0.02, -Math.PI/2, "THE BUS SHELTER'S BENCH");
    { const sx=x+0.85, sz=z-1.8, sg=gy(sx, sz); B(0.065, 2.6, 0.065, sx+0.06, sg+1.3, sz, "#8d9294"); addCol(sx+0.01, sx+0.11, sz-0.05, sz+0.05, sg-0.3, sg+2.6);
      sign(0.5, 0.6, (c, W, H)=>{ c.fillStyle="#2a4a8a"; c.fillRect(0, 0, W, H); say(c, "LAKE AREA", W/2, H*0.2, W*0.8, H*0.12, "#e8c858", "800"); say(c, "TRANSIT", W/2, H*0.36, W*0.8, H*0.12, "#e8c858", "800");
          say(c, "BUS STOP", W/2, H*0.62, W*0.8, H*0.16, "#d8d0c0", "800"); say(c, "ROUTE 9", W/2, H*0.84, W*0.6, H*0.1, "#d8d0c0", "700"); }, sx-0.022, sg+2.2, sz, -Math.PI/2, false, 150);
      B(0.02, 0.62, 0.52, sx-0.0, sg+2.2, sz, "#8d9294"); }
    addZone(x-0.95, x+0.75, z-1.75, z+1.75, g-1, g+3, "HOLLOW ROAD · THE BUS SHELTER"); }

  /* ---- the verges going to chicory and goldenrod against the trees ---- */
  if(typeof FOREST!=="undefined") for(let z=Z-HW-20; z>END+5; z-=5.5) for(const x of [RX-RW-5.5-q()*1.5, RX+RW+5.0+q()*1.5]){
    if(onPlace(x, z, 4) || inMouth(z) || Math.abs(z+1430)<20) continue; if(q()<0.35) continue;
    FOREST.plant(q()<0.6 ? "shrub" : "fern", x, z, {scale:0.55+q()*0.4, solid:false}); }

  /* ---- at the beer distributor: neon in the front, a bench by the shop door, the sandwich board ---- */
  { const FLS=LY, BZ1=-1276;
    for(const [x, txt, col, glow] of [[757.0, "COLD BEER", "#ff5a4a", "#ff3a2a"],[775.0, "KEGS · ICE", "#5ad8ff", "#3ab8ff"]]){
      B(2.3, 0.62, 0.03, x, FLS+3.0, BZ1+0.015, "#1a1a1e");
      sign(2.2, 0.56, (c, W, H)=>{ c.fillStyle="#1a1a1e"; c.fillRect(0, 0, W, H); c.shadowColor=glow; c.shadowBlur=16; say(c, txt, W/2, H/2, W*0.8, H*0.5, col, "700", "'Brush Script MT', 'Segoe Script', cursive"); c.shadowBlur=0; },
        x, FLS+3.0, BZ1+0.042, 0, true, 440); }
    { const x=750.0, z=BZ1+1.1; for(const s of [-1, 1]) B(0.06, 0.44, 0.42, x+s*0.8, FLS+0.22, z, "#2a2a2e"); B(1.8, 0.05, 0.42, x, FLS+0.45, z, "#6a4a32"); B(1.8, 0.36, 0.05, x, FLS+0.72, z-0.2, "#6a4a32");
      addCol(x-0.9, x+0.9, z-0.24, z+0.22, FLS-0.3, FLS+0.9); for(const dx of [-0.45, 0.45]) addSeat(x+dx, z+0.02, FLS, Math.PI, "THE BENCH BY THE BEER STORE"); }
    { const x=754.6, z=BZ1+2.0; for(const s of [-1, 1]) tubeE(V3(x-0.32, FLS, z+s*0.3), V3(x-0.32, FLS+1.0, z+s*0.02), 0.012, "#4a3a2a", 4);
      B(0.02, 0.9, 0.62, x-0.32, FLS+0.5, z, "#2a2a2a");
      sign(0.58, 0.86, (c, W, H)=>{ c.fillStyle="#1e2a24"; c.fillRect(0, 0, W, H); c.strokeStyle="#6a4a32"; c.lineWidth=10; c.strokeRect(5, 5, W-10, H-10);
          say(c, "KEGS", W/2, H*0.2, W*0.7, H*0.12, "#e8d8a8", "700", "'Marker Felt', 'Comic Sans MS', cursive"); say(c, "FOR GRAD", W/2, H*0.36, W*0.7, H*0.1, "#e8d8a8", "700", "'Marker Felt', 'Comic Sans MS', cursive");
          say(c, "PARTIES", W/2, H*0.5, W*0.7, H*0.1, "#e8d8a8", "700", "'Marker Felt', 'Comic Sans MS', cursive"); say(c, "ORDER EARLY!", W/2, H*0.72, W*0.7, H*0.09, "#ff8a6a", "700", "'Marker Felt', 'Comic Sans MS', cursive"); },
        x-0.298, FLS+0.5, z, Math.PI/2, false, 140);
      addCol(x-0.4, x-0.24, z-0.32, z+0.32, FLS-0.3, FLS+1.0); } }

  /* ---- at the pretzel works: flags out front, beds along the lobby, a bench and a bike rack, steam off the oven stacks ---- */
  { const FLS=PRETZ.FLS;
    for(const [k, z] of [[0, -1594],[1, -1590.5]]){ const x=765.0, g=gy(x, z);
      C(0.1, 9.0, x, g+4.5, z, "#4a4e52", 12); C(0.28, 0.3, x, g+0.15, z, "#6a645a", 16); S(0.12, x, g+9.05, z, "#c8a050"); addCol(x-0.3, x+0.3, z-0.3, z+0.3, g-0.5, g+9);
      for(const yy of [8.65, 7.75]) C(0.018, 0.13, x, g+yy, z-0.14, "#8a8e92", 6, Math.PI/2, 0, 0);
      sign(1.5, 0.95, (c, W, H)=>{ if(k===0){ for(let i=0;i<13;i++){ c.fillStyle=i%2 ? "#d8d0c0" : "#b3191e"; c.fillRect(0, i*H/13, W, H/13+1); } c.fillStyle="#1f2a5a"; c.fillRect(0, 0, W*0.4, H*7/13); }
          else { c.fillStyle="#7a4220"; c.fillRect(0, 0, W, H); c.strokeStyle="#d89a3a"; c.lineWidth=10; c.beginPath(); c.arc(W*0.5, H*0.42, H*0.2, 0, 7); c.stroke(); c.beginPath(); c.arc(W*0.5, H*0.62, H*0.14, 0, 7); c.stroke(); } },
        x+0.003, g+8.2, z-0.87, Math.PI/2, false, 300);
      // (and the same on its other side, four millimetres off: a flag is read from both)
      sign(1.5, 0.95, (c, W, H)=>{ if(k===0){ for(let i=0;i<13;i++){ c.fillStyle=i%2 ? "#d8d0c0" : "#b3191e"; c.fillRect(0, i*H/13, W, H/13+1); } c.fillStyle="#1f2a5a"; c.fillRect(W*0.6, 0, W*0.4, H*7/13); }
          else { c.fillStyle="#7a4220"; c.fillRect(0, 0, W, H); c.strokeStyle="#d89a3a"; c.lineWidth=10; c.beginPath(); c.arc(W*0.5, H*0.42, H*0.2, 0, 7); c.stroke(); c.beginPath(); c.arc(W*0.5, H*0.62, H*0.14, 0, 7); c.stroke(); } },
        x-0.003, g+8.2, z-0.87, -Math.PI/2, false, 300); }
    if(typeof FOREST!=="undefined") for(let z=-1591; z<-1569; z+=1.6){ if(z>-1584 && z<-1576) continue; FOREST.plant("shrub", 766.8, z, {scale:0.6+q()*0.2, solid:false}); }
    for(const z of [-1588.5, -1571.5]){ const x=764.4; B(1.4, 0.4, 3.0, x-0.2, LY+0.2, z, "#6a4a32"); B(1.3, 0.04, 2.9, x-0.2, LY+0.41, z, "#5a2a1a"); addCol(x-0.9, x+0.5, z-1.5, z+1.5, LY-0.3, LY+0.42);
      if(typeof FOREST!=="undefined") for(let k=0;k<3;k++) FOREST.plant("shrub", x-0.2, z-1+k, {scale:0.55, solid:false}); }
    { const x=760.5, z=-1566.0; for(const s of [-1, 1]) B(0.42, 0.44, 0.06, x, LY+0.22, z+s*0.8, "#2a2a2e"); B(0.42, 0.05, 1.8, x, LY+0.45, z, "#6a4a32"); B(0.05, 0.36, 1.8, x+0.2, LY+0.72, z, "#6a4a32");
      addCol(x-0.22, x+0.24, z-0.9, z+0.9, LY-0.3, LY+0.9); for(const dz of [-0.45, 0.45]) addSeat(x-0.02, z+dz, LY, Math.PI/2, "A BENCH BY THE PRETZEL WORKS"); }
    { const x=760.5, z=-1595.0; for(let k=0;k<5;k++){ const a=V3(x, LY, z-1+k*0.5); tubeE(a, V3(x, LY+0.8, z-1+k*0.5), 0.02, "#2a2a2e", 6); tubeE(V3(x, LY+0.8, z-1+k*0.5), V3(x+0.6, LY+0.8, z-1+k*0.5), 0.02, "#2a2a2e", 6); tubeE(V3(x+0.6, LY+0.8, z-1+k*0.5), V3(x+0.6, LY, z-1+k*0.5), 0.02, "#2a2a2e", 6); }
      addCol(x-0.05, x+0.65, z-1.05, z+1.05, LY-0.3, LY+0.82); }
    // steam: puffs off the oven stacks on the roof, now and then
    for(const L of (PRETZ.lines||[])) for(let k=0;k<3;k++) HOLLOW.steam.push([803+3+k*6, FLS+9.0+1.75, L]); }

  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.72, metalness:0.08}), "hollow-road", true);
})();
/* the lights over the mouths after dark; steam off the pretzel works while you are near */
function updateHollowRoad(dt, dark){
  for(const L of HOLLOW.lamps) L.intensity=1.0*smoothstep(0.3, 0.6, dark);
  if(!HOLLOW.steam.length || typeof PUFFS==="undefined") return;
  const c=camera.position; if(Math.hypot(c.x-820, c.z+1580)>260) return;
  HOLLOW._t=(HOLLOW._t||0)-dt; if(HOLLOW._t>0) return; HOLLOW._t=0.18;
  const s=HOLLOW.steam[(Math.random()*HOLLOW.steam.length)|0];
  PUFFS.emit(s[0]+(Math.random()-0.5)*0.2, s[1], s[2]+(Math.random()-0.5)*0.2, (Math.random()-0.5)*0.2, 0.8+Math.random()*0.4, (Math.random()-0.5)*0.2, 0.35, 1.6, 3.5, 0.18, 0.78);
}
