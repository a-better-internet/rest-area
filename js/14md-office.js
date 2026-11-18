"use strict";
/* REST AREA · 14md-office.js
   Hollow Road Corporate Park, up the road past the pretzel works
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. (After 14mc: Hollow Road's paving from
   the works north is this file's; after 14q: its people are the crowd.) */
/* ----------------------------------------------------------------------
   14md · HOLLOW ROAD CORPORATE PARK
   Somebody in 1984 decided Edinboro needed an office park, and here it
   is: past the pretzel works the woods open on the right onto a car lot,
   three buildings round a plaza with a fountain in it, and the lake
   beyond them across a lawn that runs down to the water.

   One Hollow Road, by the lot, is French Creek Financial: brown brick
   with cast stone bands, smoked brown glass, a glass pyramid on the
   roof. Two Hollow Road, north of the plaza, is Midland Mutual: five
   storeys of bronze reflective glass over bronze spandrels on a black
   granite base, its name in red letters along the parapet. Three Hollow
   Road, south of the plaza, is Lakeshore Data Systems: two long storeys
   of sandstone precast with teal bands, glass block up the corners, its
   initials in neon, a tinted bay at the door.

   Every floor of every building is there, and every building has an
   elevator that works: call it, step in, E for the next floor up or a
   number for any floor. (The other car in each lobby is out of order.)
   Each building and each floor is its own: Midland's claims counter and
   file room, its bullpen of desks in rows, its cubicle farm and break
   room, its executive floor with the boardroom, its computer room and
   cafeteria; French Creek's bank with the teller line and the vault
   door, its loan officers' glass offices, the law firm upstairs in
   walnut with its library; Lakeshore's showroom of personal computers
   and its network board, the software pit upstairs with the arcade
   machine in the break room and the server room behind glass. Mauve and
   teal, brass and smoked glass, carpet with confetti in it, art with
   squiggles in it, beige terminals everywhere.

   Everything here is made up here: the companies, the names, the art.

   PLAN (world): EAST.office (04): the site x 743..990, z -1862..-1690,
   graded level with the road and out to the shore; the mouth off Hollow
   Road z -1782..-1766; the lot x 750..806; One x 822..852, z -1795..
   -1755, its door west; Two x 860..912, z -1850..-1815, its door south;
   Three x 860..912, z -1735..-1702, its door north; the plaza between,
   the fountain at x 893, z -1775; the lawn to the water east of it.
   Inside, each building is laid out in its own frame (`frame`): u across
   the front from its middle, v in from the front wall. The elevator's
   shaft is at u 3.25..5.15, v 10..11.9 in every one.
   ---------------------------------------------------------------------- */
const OFFICE={routes:{}, lamps:[], water:null, t:0, flow:new T.Vector4(), elevs:[], drops:null};
(function officePark(){
  if(typeof EAST==="undefined" || !EAST.office) return;
  const E=EDIN, Y=E.y, O=EAST.office.site, M=EAST.office.mouth, Bq=EAST.beer, RX=Bq.rx, RW=3.4, END=Bq.end, LY=Y+PAVE_T+0.015;
  const FL=LY+0.05;                                         // (every ground floor: a step you do not notice up off the walk)
  OFFICE.FL=FL;
  const ME=[], r=_trng(1984), DQ=_trng(4242);   // (DQ: the clutter on the desks, its own stream so nobody moves seats)
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz);
  const S=(r0,x,y,z,c)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const BRASS="#b8944a", GRAN="#2a2a2e", BEIGE="#c8bca0", MAUVE="#8a5a6a", TEAL="#2a7a7a";

  /* ---- the ground: Hollow Road from the pretzel works on north to its end, the mouth, the lot, the walks, the plaza ---- */
  { const road=SD_rect(RX-RW, RX+RW, END, -1660), mouth=SD_rect(RX+RW-0.6, 752, M.z0, M.z1), lot=SD_rect(750, 806, -1848, -1702),
      front=SD_rect(804, 822.05, -1800, -1750), nwalk=SD_rect(820, 856, -1804, -1798.5), swalk=SD_rect(820, 856, -1751.5, -1746),
      plaza=SD_rect(852, 936, -1812, -1738), lawnwalk=SD_rect(934, 968, -1777.5, -1772.5);
    push("lotpave", sdPaveGeo(sdUnion([road, mouth, lot, front, nwalk, swalk, plaza, lawnwalk], 3), RX-RW-1, 969, END, -1660, 0.5, 3), 0, LY, 0, 0, "#9a9a96");
    for(const b of [[RX+RW-0.6, 752, M.z0, M.z1],[750, 806, -1848, -1702],[804, 822.05, -1800, -1750],[820, 856, -1804, -1798.5],[820, 856, -1751.5, -1746],[852, 936, -1812, -1738],[934, 968, -1777.5, -1772.5]])
      addPaveRect(b[0], b[1], b[2], b[3], Y); }
  // the plaza laid in squares of buff concrete and terra cotta pavers, a joint round each (paint over the paving, 08's ladder), clear of the basin
  for(let x=852.2; x<935.9; x+=3.0) for(let z=-1811.8; z<-1738.1; z+=3.0){ const cx=x+1.45, cz=z+1.45; if(Math.hypot(cx-893, cz+1775)<5.0) continue;
    const ring=Math.abs(Math.hypot(cx-893, cz+1775)-9)<1.6;
    stripe(cx, z, cx, Math.min(z+2.9, -1738.05), Math.min(2.9, 935.95-x), ring ? "#6a4630" : (((x-852.2)/3+(z+1811.8)/3)|0)%2 ? "#7a7062" : "#72685a", LY); }
  // the lot's stalls: rows back to back down its length, kept six metres clear of the way in
  for(const [xa, xb] of [[750.3, 755.8],[762.0, 767.5],[767.5, 773.0],[779.5, 785.0],[785.0, 790.5],[797.0, 802.5]])
    for(const [z0, z1] of [[-1846.0, -1789.0],[-1759.0, -1704.0]]) for(let z=z0; z<=z1+0.01; z+=2.7) stripe(xa, z, xb, z, 0.1, WHITE_LINE, LY);
  if(typeof parked==="function"){ parked(0, "#8a8e92", 764.75, -1801.45, Math.PI/2, Y); parked(2, "#2a3a5a", 770.25, -1817.65, -Math.PI/2, Y);
    parked(1, "#a89a7a", 782.25, -1831.15, Math.PI/2, Y); parked(3, "#6a1a1a", 787.75, -1752.25, -Math.PI/2, Y); parked(0, "#7a5a3a", 753.05, -1744.15, -Math.PI/2, Y);
    parked(2, "#3a4a3a", 799.75, -1717.15, Math.PI/2, Y); parked(1, "#4a2a4a", 776.25+(-1.25), -1717.15+2.7*3, Math.PI/2, Y);
    // a working day's lot: fuller by the buildings and the way in, thinning toward the far rows; a few stalls left by the doors.
    // (seeded, so the same cars are in the same stalls every time; the paint is what was on the road then: maroons, browns,
    // champagne, navy, two greys, a sage, a gold; nose in, each a hand off true)
    const taken=new Set(["764.75|-1801.45","770.25|-1817.65","782.25|-1831.15","787.75|-1752.25","753.05|-1744.15","799.75|-1717.15","775.00|-1709.05"]);
    let sd=19841; const rnd=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; };
    const PAINT=["#5a1a1e","#6a2a22","#5a4030","#7a5a3a","#a89a7a","#9a8a64","#1e2a44","#2a3a5a","#6a6c70","#4a4c50","#4a5a44","#8a7030","#2a2a2e","#3a2a3a","#7a6a5a"];
    const COLS=[[750.3, 755.8, -Math.PI/2],[762.0, 767.5, Math.PI/2],[767.5, 773.0, -Math.PI/2],[779.5, 785.0, Math.PI/2],[785.0, 790.5, -Math.PI/2],[797.0, 802.5, Math.PI/2]];
    COLS.forEach(([xa, xb, yaw], ci)=>{ for(const [z0, z1] of [[-1846.0, -1789.0],[-1759.0, -1704.0]]) for(let z=z0; z+2.7<=z1+0.01; z+=2.7){
      const cx=(xa+xb)/2, cz=z+1.35; if(taken.has(cx.toFixed(2)+"|"+cz.toFixed(2))) continue;
      const near=Math.min(Math.abs(cz+1789), Math.abs(cz+1759));              // (metres from the way in)
      const p=0.06+0.035*ci+0.24*Math.exp(-near/14);
      if(rnd()>p) continue;
      const k=rnd(), kind=k<0.5 ? 0 : k<0.78 ? 1 : k<0.92 ? 3 : 2;
      parked(kind, PAINT[(rnd()*PAINT.length)|0], cx+(rnd()-0.5)*0.3, cz+(rnd()-0.5)*0.25, yaw+(rnd()-0.5)*0.06, Y); } }); }

  /* ---- textures made here: stone, carpet with confetti in it, the ceiling's tiles, art with squiggles in it, glass block ---- */
  const marble=(base, vein, check)=>{ const t=signTex(512, 512, (c, W, H)=>{
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ c.fillStyle=check && (i+j)%2 ? check : base; c.fillRect(i*W/2, j*H/2, W/2, H/2); }
      for(let k=0;k<26;k++){ c.strokeStyle=vein; c.globalAlpha=0.18+((k*37)%10)/40; c.lineWidth=0.6+(k%3)*0.7; c.beginPath();
        let x=(k*97)%W, y=(k*53)%H; c.moveTo(x, y); for(let s=0;s<6;s++){ x+=((k*s*13)%60)-22; y+=40+(s*k)%30; c.lineTo(x, y); } c.stroke(); }
      c.globalAlpha=1; c.strokeStyle="rgba(0,0,0,0.25)"; c.lineWidth=2; for(let i=0;i<2;i++) for(let j=0;j<2;j++) c.strokeRect(i*W/2+1, j*H/2+1, W/2-2, H/2-2); });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  const granite=(base, specks)=>{ const t=signTex(256, 256, (c, W, H)=>{ c.fillStyle=base; c.fillRect(0, 0, W, H);
      for(let i=0;i<2600;i++){ c.fillStyle=specks[i%specks.length]; c.fillRect((i*131.7)%W, (i*71.3+i*0.37)%H, 1+(i%3), 1+(i%2)); }
      c.strokeStyle="rgba(0,0,0,0.25)"; c.lineWidth=2; c.strokeRect(1, 1, W-2, H-2); });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  // (carpet: a ground and a scatter of the period's shapes, squiggles, triangles, dashes and dots)
  const carpet=(base, cols, seed)=>{ const q=_trng(seed), t=signTex(256, 256, (c, W, H)=>{ c.fillStyle=base; c.fillRect(0, 0, W, H);
      for(let i=0;i<5000;i++){ c.fillStyle="rgba(0,0,0,"+(q()*0.08).toFixed(3)+")"; c.fillRect(q()*W, q()*H, 1, 1); }
      for(let i=0;i<46;i++){ const x=q()*W, y=q()*H, col=cols[(q()*cols.length)|0], k=(q()*4)|0; c.fillStyle=col; c.strokeStyle=col; c.lineWidth=2;
        if(k===0){ c.beginPath(); c.moveTo(x, y); for(let s=1;s<5;s++) c.lineTo(x+s*5, y+(s%2 ? 5 : -5)); c.stroke(); }
        else if(k===1){ c.beginPath(); c.moveTo(x, y); c.lineTo(x+8, y+2); c.lineTo(x+3, y+9); c.fill(); }
        else if(k===2) c.fillRect(x, y, 9, 2); else { c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); } } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  const STONE={A:marble("#cfc6b4", "#4a4a50", "#1a1a1e"), B:marble("#c8b494", "#8a6a3a"), C:granite("#b88a7a", ["#6a3a3a","#d8b8a8","#3a2a2a","#a07060"])};
  const CEILT=signTex(128, 128, (c, W, H)=>{ c.fillStyle="#cfc6b4"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(0,0,0,0.09)"; for(let i=0;i<220;i++) c.fillRect((i*37)%W, (i*91)%H, 2, 2);
    c.fillStyle="#a8a090"; c.fillRect(0, 0, W, 3); c.fillRect(0, 0, 3, H); });
  CEILT.wrapS=CEILT.wrapT=T.RepeatWrapping;
  const ART=(k)=>(c, W, H)=>{ const pal=[["#e8c0c8","#2a8a8a","#f2c41c","#1a1a2a","#c84a8a"],["#c8d8d0","#8a4a8a","#e8743a","#1a3a5a","#f2d8a0"],["#d8c8e0","#3a6aa8","#ff6a8a","#2a2a2a","#7ac8a8"]][((k%3)+3)%3];
    c.fillStyle=pal[0]; c.fillRect(0, 0, W, H); c.lineWidth=W*0.03;
    c.fillStyle=pal[1]; c.beginPath(); c.arc(W*0.32, H*0.36, W*0.18, 0, 7); c.fill();
    c.fillStyle=pal[2]; c.beginPath(); c.moveTo(W*0.55, H*0.8); c.lineTo(W*0.88, H*0.3); c.lineTo(W*0.92, H*0.82); c.fill();
    c.strokeStyle=pal[3]; c.beginPath(); c.moveTo(W*0.1, H*0.7); for(let s=1;s<8;s++) c.lineTo(W*(0.1+s*0.06), H*(s%2 ? 0.6 : 0.75)); c.stroke();
    c.fillStyle=pal[4]; for(let i=0;i<14;i++) c.fillRect(W*(0.05+((i*37)%90)/100), H*(0.05+((i*53)%40)/100), W*0.03, W*0.03);
    c.strokeStyle=pal[3]; c.lineWidth=W*0.012; for(let i=0;i<5;i++){ c.beginPath(); c.moveTo(W*(0.6+i*0.06), H*0.1); c.lineTo(W*(0.6+i*0.06), H*0.24); c.stroke(); } };
  const GBLOCK=signTex(128, 128, (c, W, H)=>{ c.fillStyle="#8aa8ac"; c.fillRect(0, 0, W, H); c.fillStyle="#b4ccd0"; for(let i=0;i<4;i++) for(let j=0;j<4;j++){ c.fillRect(i*32+4, j*32+4, 24, 24); }
    c.fillStyle="rgba(255,255,255,0.18)"; for(let i=0;i<4;i++) for(let j=0;j<4;j++) c.fillRect(i*32+8, j*32+6, 6, 18); });
  GBLOCK.wrapS=GBLOCK.wrapT=T.RepeatWrapping;
  const texPlane=(w, h, tex, rep, x, y, z, rx, ry, rough)=>{ const t=tex.clone(); t.needsUpdate=true; t.repeat.set(w/rep, h/rep);
    const m=new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({map:t, roughness:rough===undefined ? 0.9 : rough}));
    m.rotation.set(rx||0, ry||0, 0, "YXZ"); m.position.set(x, y, z); m.receiveShadow=true; m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); return m; };

  /* ---- walls with their openings, and glass in them ---- */
  const runW=(bk, col, ax, c0, c1, a, b, y0, y1, ops)=>{ let u=a;
    const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return; if(ax==="x") wallBox(bk, p, q, c0, c1, h0, h1, col, 0.6, FL); else wallBox(bk, c0, c1, p, q, h0, h1, col, 0.6, FL); };
    for(const o of ops.slice().sort((m, n)=>m.a-n.a)){ piece(u, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); u=o.b; }
    piece(u, b, y0, y1); };
  const glaze=(ax, cm, o, frame)=>{ const w=o.b-o.a, h=o.head-o.sill, mid=(o.a+o.b)/2, y=(o.sill+o.head)/2;
    if(ax==="x"){ push("glass", planeGeo(w-0.02, h-0.02, 0), mid, y, cm, 0, "#ffffff"); for(let k=1;k<Math.round(w/1.6);k++) B(0.06, h, 0.1, o.a+k*w/Math.round(w/1.6), y, cm, frame); }
    else { push("glass", planeGeo(w-0.02, h-0.02, 0), cm, y, mid, Math.PI/2, "#ffffff"); for(let k=1;k<Math.round(w/1.6);k++) B(0.1, h, 0.06, cm, y, o.a+k*w/Math.round(w/1.6), frame); } };

  /* ---- a building's own frame: u across the front from its middle, v in from the front wall's inner face ---- */
  const frame=(side, ox, oz)=>{
    if(side==="s") return {P:(u, v)=>[ox+u, oz-v], swap:false, ry:0};
    if(side==="n") return {P:(u, v)=>[ox-u, oz+v], swap:false, ry:Math.PI};
    if(side==="w") return {P:(u, v)=>[ox+v, oz+u], swap:true, ry:-Math.PI/2};
    return {P:(u, v)=>[ox-v, oz-u], swap:true, ry:Math.PI/2}; };
  /* The kit, in a frame: boxes, colliders and floors by (u, v); and the furniture, each facing one of the frame's four ways
     ("front" toward the front wall, "back" away from it, "+u", "-u"): what you sit in faces that way, its seat with it. */
  function kit(F){
    const P=F.P, ryOf=(d)=>F.ry+(d==="front" ? 0 : d==="back" ? Math.PI : d==="+u" ? Math.PI/2 : -Math.PI/2);
    const K={F:F, P:P, ryOf:ryOf, sitters:[]};
    K.box=(uw, h, vd, u, y, v, c)=>{ const [x, z]=P(u, v); B(F.swap ? vd : uw, h, F.swap ? uw : vd, x, y, z, c); };
    K.rbox=(uw, h, vd, u, y, v, c, rad)=>{ const [x, z]=P(u, v); RB(F.swap ? vd : uw, h, F.swap ? uw : vd, x, y, z, c, 0, rad); };
    K.rect=(u0, u1, v0, v1)=>{ const a=P(u0, v0), b=P(u1, v1); return [Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1])]; };
    K.col=(u0, u1, v0, v1, y0, y1)=>{ const R=K.rect(u0, u1, v0, v1); addCol(R[0], R[1], R[2], R[3], y0, y1); };
    K.flat=(u0, u1, v0, v1, y)=>{ const R=K.rect(u0, u1, v0, v1); addFlat(R[0], R[1], R[2], R[3], y); };
    // an object at (u, v) facing d: its own boxes by its own x (across) and z (toward its front)
    K.obj=(u, v, d, y)=>{ const [x, z]=P(u, v), ry=ryOf(d), f=XF(x, z, ry);
      return {x:x, z:z, ry:ry, at:(lx, lz)=>[f.x(lx, lz), f.z(lx, lz)],
        b:(w, h, dd, lx, ly, lz, c)=>B(w, h, dd, f.x(lx, lz), y+ly, f.z(lx, lz), c, ry),
        rb:(w, h, dd, lx, ly, lz, c, rad)=>RB(w, h, dd, f.x(lx, lz), y+ly, f.z(lx, lz), c, ry, rad),
        c:(rr, h, lx, ly, lz, c, seg)=>C(rr, h, f.x(lx, lz), y+ly, f.z(lx, lz), c, seg)}; };
    // a straight wall in the frame, on the floor at y, h high, its collider with it; gaps along it left open
    K.wall=(u0, v0, u1, v1, y, h, c, gaps, t)=>{ t=t||0.12; const along=Math.abs(u1-u0)>Math.abs(v1-v0), a0=(along ? Math.min(u0, u1) : Math.min(v0, v1))+0.055, a1=(along ? Math.max(u0, u1) : Math.max(v0, v1))-0.055;   // (its ends inside what it meets, or short of a glass line)
      let p=a0; for(const g of (gaps||[]).concat([[a1, a1]]).sort((m, n)=>m[0]-n[0])){ if(g[0]-p>0.02){
          if(along){ K.box(g[0]-p, h, t, (p+g[0])/2, y+h/2, v0, c); K.col(p, g[0], v0-t/2, v0+t/2, y-0.05, y+h); }
          else { K.box(t, h, g[0]-p, u0, y+h/2, (p+g[0])/2, c); K.col(u0-t/2, u0+t/2, p, g[0], y-0.05, y+h); } }
        p=Math.max(p, g[1]); } };
    K.glassWall=(u0, v0, u1, v1, y, h, gaps)=>{ const along=Math.abs(u1-u0)>Math.abs(v1-v0), a0=along ? Math.min(u0, u1) : Math.min(v0, v1), a1=along ? Math.max(u0, u1) : Math.max(v0, v1);
      let p=a0; for(const g of (gaps||[]).concat([[a1, a1]]).sort((m, n)=>m[0]-n[0])){ if(g[0]-p>0.05){ const m=(p+g[0])/2;
          const [x, z]=along ? P(m, v0) : P(u0, m); push("glass", planeGeo(g[0]-p-0.04, h-0.06, 0), x, y+h/2, z, F.ry+(along ? 0 : Math.PI/2), "#ffffff");
          if(along){ K.box(g[0]-p, 0.06, 0.08, m, y+0.035, v0, "#3a3a3e"); K.box(g[0]-p, 0.06, 0.08, m, y+h-0.035, v0, "#3a3a3e"); K.col(p, g[0], v0-0.04, v0+0.04, y-0.05, y+h); }
          else { K.box(0.08, 0.06, g[0]-p, u0, y+0.035, m, "#3a3a3e"); K.box(0.08, 0.06, g[0]-p, u0, y+h-0.035, m, "#3a3a3e"); K.col(u0-0.04, u0+0.04, p, g[0], y-0.05, y+h); }
          for(const e of [p, g[0]]) along ? K.box(0.06, h-0.004, 0.1, e, y+h/2, v0, "#3a3a3e") : K.box(0.1, h-0.004, 0.06, u0, y+h/2, e, "#3a3a3e"); }   // (rails and posts never flush: rails 5 mm in, posts 2 mm short)
        p=Math.max(p, g[1]); } };
    // an office chair on its star, facing d; the seat goes with it, and (if asked) the one who sits in it
    K.chair=(u, v, y, d, col, label, who)=>{ const o=K.obj(u, v, d, y);
      o.c(0.27, 0.035, 0, 0.03, 0, "#2a2a2a", 5); o.c(0.025, 0.38, 0, 0.22, 0, "#6a6e72", 8);
      o.rb(0.48, 0.08, 0.46, 0, 0.46, 0, col, 0.03); o.rb(0.44, 0.5, 0.07, 0, 0.82, -0.22, col, 0.03);
      for(const s of [-1, 1]) o.b(0.04, 0.2, 0.3, s*0.23, 0.6, -0.02, "#2a2a2a");
      addSeat(o.x, o.z, y, o.ry+Math.PI, label || "A CHAIR", false, 0.66);
      if(who) K.sitters.push({x:o.x, z:o.z, y:y, yaw:o.ry, look:who}); return o; };
    // a chrome sled chair with a cushion, for visitors, facing d
    K.guest=(u, v, y, d, col, label)=>{ const o=K.obj(u, v, d, y);
      for(const s of [-1, 1]){ o.b(0.028, 0.025, 0.46, s*0.2, 0.012, 0, "#b8bcc0"); o.b(0.02, 0.46, 0.02, s*0.2, 0.24, 0.19, "#b8bcc0"); o.b(0.02, 0.8, 0.02, s*0.2, 0.4, -0.24, "#b8bcc0"); }   // (the frame inside the seat's and the back's edges: no face of it in theirs)
      o.rb(0.48, 0.08, 0.48, 0, 0.46, 0, col, 0.03); o.rb(0.46, 0.38, 0.07, 0, 0.74, -0.24, col, 0.03);
      addSeat(o.x, o.z, y, o.ry+Math.PI, label || "A CHAIR", false, 0.66); return o; };
    // a desk you sit at facing d: the top, the pedestal, the modesty panel; a beige terminal on it facing you, its keyboard; the chair
    K.desk=(u, v, y, d, w, col, opt)=>{ opt=opt||{}; const o=K.obj(u, v, d, y), dd=opt.deep||0.78;
      o.rb(w, 0.04, dd, 0, 0.74, 0, col, 0.012); o.b(0.42, 0.7, dd-0.04, w/2-0.23, 0.36, 0, opt.ped||col); o.b(w-0.06, 0.45, 0.025, 0, 0.45, dd/2-0.03, opt.ped||col);
      if(w>1.0) o.b(0.04, 0.7, dd-0.06, -w/2+0.03, 0.36, 0, opt.ped||col);
      for(let k=0;k<3;k++) o.b(0.36, 0.16, 0.012, w/2-0.23, 0.2+k*0.2, -dd/2-0.002, "#7a7468");
      const [ax, az]=o.at(-w/2, -dd/2), [bx2, bz2]=o.at(w/2, dd/2); addCol(Math.min(ax, bx2), Math.max(ax, bx2), Math.min(az, bz2), Math.max(az, bz2), y-0.05, y+0.76);
      if(opt.term!==false){ const [mx, mz]=o.at(opt.tx||0, 0.12); RB(0.42, 0.36, 0.4, mx, y+0.94, mz, "#c4b89c", o.ry, 0.04); RB(0.36, 0.06, 0.32, mx, y+0.77, mz, "#b4a88c", o.ry, 0.02);
        push("lk_tvon", planeGeo(0.3, 0.22, 0), mx-Math.sin(o.ry)*0.203, y+0.96, mz-Math.cos(o.ry)*0.203, o.ry+Math.PI, "#ffffff");
        const [kx, kz]=o.at(opt.tx||0, -0.18); RB(0.44, 0.03, 0.16, kx, y+0.775, kz, "#b4a88c", o.ry, 0.008); }
      if(opt.phone!==false){ const [px, pz]=o.at(-w/2+0.25, 0.05); RB(0.2, 0.08, 0.2, px, y+0.8, pz, opt.phoneCol||"#8a2a2a", o.ry, 0.02); }
      // what is on it: a pile of paper, a mug, an in-tray by the phone; on a desk with no terminal a blotter, a banker's lamp, a nameplate; a basket under it
      if(w>=1.3 && opt.clutter!==false){ const top=y+0.766;
        if(DQ()<0.8){ const n=1+((DQ()*4)|0), [ax, az]=o.at(w/2-0.34, 0.1); for(let k=0;k<n;k++) B(0.22, 0.012, 0.29, ax, top+0.006+k*0.014, az, k%2 ? "#d4ccb8" : "#c8c0a8", o.ry+(DQ()-0.5)*0.3); }
        if(DQ()<0.7){ const [mx, mz]=o.at(DQ()<0.5 ? 0.42 : -0.42, -0.22); C(0.04, 0.095, mx, top+0.048, mz, ["#8a2a2a","#2a4a6a","#c8b890","#2a6a4a","#5a3a5a"][(DQ()*5)|0], 10); }
        if(opt.term===false){ const [bx2, bz2]=o.at(0, -0.08); B(0.62, 0.006, 0.42, bx2, top+0.003, bz2, "#2a3a2a", o.ry);
          const [lx, lz]=o.at(-w/2+0.32, 0.26); C(0.07, 0.02, lx, top+0.01, lz, BRASS, 12); C(0.012, 0.3, lx, top+0.17, lz, BRASS, 6); B(0.3, 0.08, 0.12, lx, top+0.34, lz, "#1a5a3a", o.ry);
          const [nx, nz]=o.at(0, dd/2-0.12), [px2, pz2]=o.at(0, dd/2-0.12+0.024); B(0.26, 0.06, 0.04, nx, top+0.03, nz, "#3a2a1a", o.ry); B(0.2, 0.03, 0.006, px2, top+0.035, pz2, BRASS, o.ry); }
        else if(DQ()<0.6){ const [tx, tz]=o.at(-w/2+0.25, 0.28); B(0.24, 0.05, 0.18, tx, top+0.025, tz, "#4a4a4e", o.ry); B(0.2, 0.01, 0.15, tx, top+0.058, tz, "#d4ccb8", o.ry); }
        if(DQ()<0.6){ const [wx, wz]=o.at(-0.12, 0.12); C(0.12, 0.3, wx, y+0.155, wz, "#5a5a5e", 10); } }
      return o; };
    // (desk(): the chair is where you sit, the desk 0.75 in front of it, so a desk is placed by its chair)
    K.station=(u, v, y, d, w, col, opt)=>{ const o=K.obj(u, v, d, y), [cx, cz]=o.at(0, 0), [dx2, dz2]=o.at(0, 0.78);
      const du=uvOf(F, dx2, dz2); K.desk(du[0], du[1], y, d, w, col, Object.assign({chair:false}, opt||{}));
      if(!(opt && opt.chair===false)) K.chair(u, v, y, d, (opt && opt.chairCol) || "#3a3a40", opt && opt.label, opt && opt.who); };
    K.sofa=(u, v, y, d, len, col, label)=>{ const o=K.obj(u, v, d, y);
      o.rb(len, 0.42, 0.85, 0, 0.21, 0, col, 0.06); o.rb(len-0.4, 0.5, 0.2, 0, 0.62, -0.32, col, 0.08); for(const s of [-1, 1]) o.rb(0.2, 0.62, 0.87, s*(len/2-0.1), 0.31, 0, col, 0.08);   // (the arms a centimetre proud of the seat front and back)
      for(const s of [-1, 1]) o.c(0.02, 0.1, s*(len/2-0.15), 0.05, 0.3, "#b8bcc0", 8);
      const [ax, az]=o.at(-len/2, -0.43), [bx2, bz2]=o.at(len/2, 0.43); addCol(Math.min(ax, bx2), Math.max(ax, bx2), Math.min(az, bz2), Math.max(az, bz2), y-0.05, y+0.6);
      for(let k=0;k<Math.max(1, Math.round((len-0.4)/0.7));k++){ const lx=-(len-0.4)/2+(k+0.5)*(len-0.4)/Math.max(1, Math.round((len-0.4)/0.7)), [sx, sz]=o.at(lx, 0.05); addSeat(sx, sz, y, o.ry+Math.PI, label || "A SOFA"); }
      return o; };
    // a table (uw by vd) with chairs round it, all facing in to it
    K.table=(u, v, y, uw, vd, col, n, chairCol, round)=>{
      if(round){ const [x, z]=P(u, v); C(Math.min(uw, vd)/2, 0.04, x, y+0.74, z, col, 24); C(0.05, 0.72, x, y+0.36, z, "#3a3a3a", 10); C(0.3, 0.03, x, y+0.015, z, "#3a3a3a", 16); }
      else { K.rbox(uw, 0.05, vd, u, y+0.74, v, col, 0.015); for(const [a, b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) K.box(0.06, 0.72, 0.06, u+a*(uw/2-0.15), y+0.36, v+b*(vd/2-0.15), "#3a3a3a"); }
      K.col(u-uw/2, u+uw/2, v-vd/2, v+vd/2, y-0.05, y+0.76);
      const cc=chairCol || "#5a4a5a";
      if(round){ for(let k=0;k<n;k++){ const a=k/n*Math.PI*2, cu=u+Math.cos(a)*(uw/2+0.45), cv=v+Math.sin(a)*(vd/2+0.45);
          const d=Math.abs(Math.cos(a))>Math.abs(Math.sin(a)) ? (Math.cos(a)>0 ? "-u" : "+u") : (Math.sin(a)>0 ? "front" : "back"); K.guest(cu, cv, y, d, cc, "A CHAIR AT THE TABLE"); } }
      else { const per=Math.max(1, Math.floor(uw/0.75));
        for(let k=0;k<per && k<n;k++){ const cu=u-uw/2+(k+0.5)*uw/per; K.guest(cu, v-vd/2-0.45, y, "back", cc, "A CHAIR AT THE TABLE"); K.guest(cu, v+vd/2+0.45, y, "front", cc, "A CHAIR AT THE TABLE"); }
        if(n>per*2 && vd>1.2) for(const s of [-1, 1]) K.guest(u+s*(uw/2+0.45), v, y, s<0 ? "+u" : "-u", cc, "A CHAIR AT THE TABLE"); } };
    K.plant=(u, v, y, big, pot)=>{ const [x, z]=P(u, v), s=big ? 1.3 : 0.9;
      RB(0.55*s, 0.55*s, 0.55*s, x, y+0.275*s, z, pot || "#8a6a4a", 0, 0.04); C(0.035, 0.9*s, x, y+0.55*s+0.45*s, z, "#5a4430", 8);
      for(let k=0;k<8;k++){ const a=k*0.8, rr=(0.15+(k%3)*0.08)*s; S(0.2*s, x+Math.cos(a)*rr, y+(1.1+(k%3)*0.2)*s, z+Math.sin(a)*rr, k%2 ? "#3a5a2a" : "#2e4a22"); }
      addCol(x-0.3*s, x+0.3*s, z-0.3*s, z+0.3*s, y-0.05, y+0.6*s); };
    // a framed picture on a wall, facing d, its face 1.5 cm off its frame's
    K.art=(u, v, y, d, w, h, k)=>{ const o=K.obj(u, v, d, y); o.b(w+0.08, h+0.08, 0.03, 0, 0, 0, "#2a2a2e");
      const [ax, az]=o.at(0, 0.03); sign(w, h, ART(k), ax, y, az, o.ry, false, 240); };
    K.files=(u, v, y, d, n, col)=>{ for(let k=0;k<n;k++){ const o=K.obj(u+(d==="front" || d==="back" ? (k-(n-1)/2)*0.48 : 0), v+(d==="+u" || d==="-u" ? (k-(n-1)/2)*0.48 : 0), d, y);
        o.b(0.46, 1.32, 0.62, 0, 0.66, 0, col || "#7a7468"); for(let j=0;j<4;j++){ o.b(0.4, 0.28, 0.012, 0, 0.18+j*0.32, 0.316, "#8a8478"); o.b(0.12, 0.02, 0.03, 0, 0.27+j*0.32, 0.33, "#b8b4a8"); }
        const [ax, az]=o.at(-0.23, -0.31), [bx2, bz2]=o.at(0.23, 0.31); addCol(Math.min(ax, bx2), Math.max(ax, bx2), Math.min(az, bz2), Math.max(az, bz2), y-0.05, y+1.33); } };
    K.shelf=(u, v, y, d, len, col)=>{ const o=K.obj(u, v, d, y), q=_trng(Math.abs((u*13+v*7)|0)+3);   // (a positive seed: a negative one gives _trng negative draws, and books of negative width)
      // (an open case: its back, its sides, a top a hair wider than them; the boards sink into the sides and the back, the books stand on them)
      o.b(len-0.04, 2.08, 0.02, 0, 1.04, -0.166, col); for(const s of [-1, 1]) o.b(0.025, 2.09, 0.36, s*(len/2-0.0125), 1.045, 0, col); o.b(len+0.004, 0.025, 0.364, 0, 2.0875, 0, col);
      for(let k=0;k<5;k++){ o.b(len-0.04, 0.025, 0.34, 0, 0.12+k*0.44, 0.012, col); if(k===4) continue;
        for(let x=-len/2+0.06; x<len/2-0.05;){ const bw=0.03+q()*0.04, bh=0.24+q()*0.1; const lift=0.004+q()*0.006, bd=0.2+q()*0.04; o.b(bw, bh, bd, x+bw/2, 0.1325+lift+k*0.44+bh/2, 0.03+(0.24-bd)/2, ["#6a2a1a","#2a3a5a","#3a5a2a","#7a5a2a","#4a2a3a","#2a2a2a"][(q()*6)|0]); x+=bw+0.005; } }
      const [ax, az]=o.at(-len/2, -0.18), [bx2, bz2]=o.at(len/2, 0.18); addCol(Math.min(ax, bx2), Math.max(ax, bx2), Math.min(az, bz2), Math.max(az, bz2), y-0.05, y+2.1); };
    K.cooler=(u, v, y)=>{ const [x, z]=P(u, v); B(0.34, 0.95, 0.34, x, y+0.475, z, "#b8ae98"); C(0.15, 0.42, x, y+1.16, z, "#7ab0d0", 14); addCol(x-0.2, x+0.2, z-0.2, z+0.2, y-0.05, y+1.4); };
    K.copier=(u, v, y, d)=>{ const o=K.obj(u, v, d, y); o.rb(1.0, 1.0, 0.65, 0, 0.5, 0, "#bcb4a2", 0.04); o.rb(1.0, 0.1, 0.65, 0, 1.05, 0, "#a49c8a", 0.02); o.b(0.3, 0.12, 0.012, 0.25, 0.9, 0.33, "#2a6a3a");
      const [ax, az]=o.at(-0.5, -0.33), [bx2, bz2]=o.at(0.5, 0.33); addCol(Math.min(ax, bx2), Math.max(ax, bx2), Math.min(az, bz2), Math.max(az, bz2), y-0.05, y+1.1); };
    K.clock=(u, v, y, d)=>{ const o=K.obj(u, v, d, y), [x, z]=o.at(0, 0.02), [fx, fz]=o.at(0, 0.043);      // (a wall clock: its rim, its face, its hands at ten past two)
      ent(new T.CylinderGeometry(0.2, 0.2, 0.04, 24), x, y, z, "#2a2a2a", Math.PI/2, o.ry, 0); ent(new T.CylinderGeometry(0.175, 0.175, 0.008, 24), fx, y, fz, "#d4ccb8", Math.PI/2, o.ry, 0);
      o.b(0.012, 0.11, 0.005, 0.0, 0.045, 0.05, "#1a1a1a"); o.b(0.09, 0.014, 0.005, 0.045, 0.0, 0.055, "#1a1a1a"); };
    return K; }
  const uvOf=(F, x, z)=>{ // (the inverse of F.P, for the four frames)
    const P0=F.P(0, 0), Pu=F.P(1, 0), Pv=F.P(0, 1), ux=Pu[0]-P0[0], uz=Pu[1]-P0[1], vx=Pv[0]-P0[0], vz=Pv[1]-P0[1], dx=x-P0[0], dz=z-P0[1];
    return [dx*ux+dz*uz, dx*vx+dz*vz]; };

  /* ---- the elevator: a shaft up every floor, a car that rides it, doors that slide, a button on every floor ---- */
  const UC=4.2, VF=10.0, VB=11.9, CAR_V0=10.2, CAR_V1=11.78;
  function elevator(K, name, levels, top){
    const F=K.F, N=levels.length, E={name:name, levels:levels, f:0, y:levels[0], target:0, state:"idle", door:1, dwell:0, F:F};
    const DH=2.2;
    // the shaft: its sides and back the whole height; its front a wall on every floor, the opening in it framed in brass
    // (its sides start behind the front wall: no face of one in the other's)
    K.box(0.12, top-levels[0]+0.05, VB-VF-0.2, UC-0.89, (top+levels[0])/2, (VF+0.2+VB)/2, "#8a8478"); K.box(0.12, top-levels[0]+0.05, VB-VF-0.2, UC+0.89, (top+levels[0])/2, (VF+0.2+VB)/2, "#8a8478");
    K.box(1.66, top-levels[0]+0.05, 0.12, UC, (top+levels[0])/2, VB-0.06, "#8a8478");          // (between the sides, not across their ends)
    K.col(UC-0.95, UC-0.83, VF, VB, levels[0]-0.5, top); K.col(UC+0.83, UC+0.95, VF, VB, levels[0]-0.5, top); K.col(UC-0.95, UC+0.95, VB-0.12, VB, levels[0]-0.5, top);
    E.doorCols=[]; E.land=[];
    const bm=new T.MeshStandardMaterial({color:new T.Color("#b0904c"), metalness:0.7, roughness:0.32});
    const leafG=new T.BoxGeometry(0.52, DH-0.02, 0.04);
    for(let f=0;f<N;f++){ const y=levels[f], yn=f<N-1 ? levels[f+1]-0.3 : top;
      if(f>0){ K.box(0.45, yn-y, 0.2, UC-0.725, (y+yn)/2, VF+0.1, "#8a8478"); K.box(0.45, yn-y, 0.2, UC+0.725, (y+yn)/2, VF+0.1, "#8a8478"); K.box(1.0, yn-y-DH, 0.2, UC, y+DH+(yn-y-DH)/2, VF+0.1, "#8a8478");
        K.col(UC-0.95, UC-0.5, VF, VF+0.2, y-0.05, yn); K.col(UC+0.5, UC+0.95, VF, VF+0.2, y-0.05, yn); }
      // the brass frame round the opening, the call buttons, the floor's number over it
      K.box(0.08, DH, 0.06, UC-0.54, y+DH/2, VF-0.025, BRASS); K.box(0.08, DH, 0.06, UC+0.54, y+DH/2, VF-0.025, BRASS); K.box(1.18, 0.08, 0.06, UC, y+DH+0.04, VF-0.026, BRASS);
      K.box(0.1, 0.22, 0.03, UC+0.78, y+1.1, VF-0.015, BRASS); K.box(0.26, 0.14, 0.03, UC, y+DH+0.28, VF-0.015, "#1a1a1e");
      { const [nx, nz]=F.P(UC, VF-0.032); sign(0.22, 0.12, (c, W, H)=>{ c.fillStyle="#1a1a1e"; c.fillRect(0, 0, W, H); say(c, f===0 ? "L" : String(f+1), W/2, H/2, W*0.6, H*0.62, "#ff8a3a", "700", "Arial"); }, nx, y+DH+0.28, nz, F.ry, true, 88); }
      // the sill: a floor across the doorway's depth, from the landing's slab to the car's, or you drop through the gap between them
      K.flat(UC-0.5, UC+0.5, VF-0.02, CAR_V0+0.03, y); K.box(0.99, 0.028, CAR_V0-VF-0.015, UC, y-0.006, (VF+0.01+CAR_V0-0.005)/2, BRASS);
      const cb={}; const R=K.rect(UC-0.5, UC+0.5, VF, VF+0.2); Object.assign(cb, {x0:R[0], x1:R[1], z0:R[2], z1:R[3], y0:y-0.3, y1:y+DH}); COL_DYN.push(cb); E.doorCols.push(cb);
      // the landing doors: two leaves in the opening, sliding apart into the wall either side
      const g=new T.Group(); const [gx, gz]=F.P(UC, VF+0.1); g.position.set(gx, y+DH/2, gz); g.rotation.y=F.ry; scene.add(g);
      const L=[new T.Mesh(leafG, bm), new T.Mesh(leafG, bm)]; L[0].position.x=-0.25; L[1].position.x=0.25; for(const m of L){ m.castShadow=true; g.add(m); }
      E.land.push(L);
      const [ux, uz]=F.P(UC+0.95+0.3, VF-0.45); addUse(ux, uz, y, "E  ·  CALL THE ELEVATOR", ()=>{ call(E, f); }, 1.3);
      const [ix, iz]=F.P(UC, 11.3); addUse(ix, iz, y, "E  ·  THE NEXT FLOOR UP   ·   1–"+N+"  ·  ANY FLOOR", ()=>{ call(E, (E.f+1)%N); }, 0.9, ()=>E.state==="idle" && E.f===f);
      addZone(...K.rect(UC-0.83, UC+0.83, CAR_V0, CAR_V1).slice(0, 4), y-0.4, y+2.6, name+" · THE ELEVATOR", true); }
    // the car: a floor, walnut sides, a mirror at the back, a brass rail, a lit ceiling, its panel of buttons, its own doors
    const car=new T.Group(); const [cx, cz]=F.P(UC, (CAR_V0+CAR_V1)/2); car.position.set(cx, levels[0], cz); car.rotation.y=F.ry; scene.add(car);
    const cm=(c, extra)=>new T.MeshStandardMaterial(Object.assign({color:new T.Color(c), roughness:0.55}, extra||{}));
    const add=(geo, mat, x, y, z)=>{ const m=new T.Mesh(geo, mat); m.position.set(x, y, z); m.receiveShadow=true; car.add(m); return m; };
    const D=CAR_V1-CAR_V0;                                         // (along the car's own z: +z out of its door)
    add(new T.BoxGeometry(1.64, 0.06, D-0.02), cm("#3a3236"), 0, -0.03, 0);
    for(const s of [-1, 1]) add(new T.BoxGeometry(0.03, 2.4, D-0.04), cm("#5a3a22"), s*0.8, 1.2, 0);
    add(new T.BoxGeometry(1.58, 2.4, 0.03), cm("#8a9298", {metalness:0.6, roughness:0.12}), 0, 1.2, -D/2+0.03);
    add(new T.BoxGeometry(1.64, 0.05, D-0.02), cm("#2a2a2e"), 0, 2.45, 0);
    add(new T.BoxGeometry(1.2, 0.02, D-0.4), new T.MeshBasicMaterial({color:new T.Color("#e8dcc0"), toneMapped:false}), 0, 2.42, 0);
    for(const s of [-1, 1]) add(new T.CylinderGeometry(0.02, 0.02, D-0.2, 8).rotateX(Math.PI/2), cm("#b0904c", {metalness:0.7, roughness:0.3}), s*0.74, 0.92, -0.05);
    add(new T.BoxGeometry(0.02, 0.6, 0.22), cm("#b0904c", {metalness:0.7, roughness:0.3}), 0.775, 1.25, D/2-0.25);
    { const t=signTex(64, 176, (c, W, H)=>{ c.fillStyle="#b0904c"; c.fillRect(0, 0, W, H); for(let k=0;k<N;k++){ const y=H-20-k*(H-36)/Math.max(1, N-1)*(N>1 ? 1 : 0);
          c.fillStyle="#2a2a2a"; c.beginPath(); c.arc(W/2, y, 12, 0, 7); c.fill(); c.fillStyle="#f2c06a"; c.font="bold 14px Arial"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(k===0 ? "L" : String(k+1), W/2, y+1); } });
      const m=add(new T.PlaneGeometry(0.2, 0.55), new T.MeshBasicMaterial({map:t, toneMapped:false}), 0.763, 1.25, D/2-0.25); m.rotation.y=-Math.PI/2; }
    const cl=[new T.Mesh(leafG, bm), new T.Mesh(leafG, bm)]; for(const m of cl){ m.position.set(0, DH/2, D/2+0.03); car.add(m); }
    E.car=car; E.carL=cl;
    // the car's floor, a surface that rides up and down with it
    { const R=K.rect(UC-0.83, UC+0.83, CAR_V0, CAR_V1); addFlat(R[0], R[1], R[2], R[3], levels[0]); E.surf=SURF[SURF.length-1]; E.rect=R; }
    E.doorCols[0].y1=-9999;                                         // (it starts at the lobby, its doors open)
    OFFICE.elevs.push(E); return E; }
  function call(E, f){ if(f===E.f && (E.state==="idle" || E.state==="opening")){ E.state="opening"; return; } E.target=f; if(E.state==="idle" || E.state==="opening") E.state="closing"; }

  /* ---- the buildings ---- */
  function building(Kd){
    const {x0, x1, z0, z1, side, WT}=Kd, nF=Kd.floors, levels=[]; for(let f=0;f<nF;f++) levels.push(FL+(f ? Kd.FH0+(f-1)*Kd.FHU : 0));
    const H=Kd.FH0+Kd.FHU*(nF-1), top=FL+H;
    const ox=side==="s" || side==="n" ? (x0+x1)/2 : (side==="w" ? x0+WT : x1-WT), oz=side==="w" || side==="e" ? (z0+z1)/2 : (side==="s" ? z1-WT : z0+WT);
    const F=frame(side, ox, oz), W=(side==="s" || side==="n" ? x1-x0 : z1-z0)-2*WT, D=(side==="s" || side==="n" ? z1-z0 : x1-x0)-2*WT, K=kit(F);
    Kd.levels=levels; Kd.top=top; Kd.F=F; Kd.K=K; Kd.W=W; Kd.D=D;
    const cx=(x0+x1)/2, cz=(z0+z1)/2, dc=Kd.dc, G=FL+Kd.FH0;
    // the slab and its edge, the ground floor's stone, the walkable floor
    B(x1-x0+0.1, FL-(LY-0.2), z1-z0+0.1, cx, (FL+LY-0.2)/2-0.006, cz, "#8a8680");
    texPlane(x1-x0-2*WT, z1-z0-2*WT, STONE[Kd.id], Kd.id==="C" ? 0.6 : 1.2, cx, FL, cz, -Math.PI/2, 0, 0.22);
    addFlat(x0, x1, z0, z1, FL);
    // the floors above: a slab each (open over the shaft), carpet on it, its ceiling, its lamps, its zone; every floor its own carpet
    const shaft=K.rect(UC-0.95, UC+0.95, VF, VB);
    const around=[[-W/2, W/2, 0, VF],[-W/2, W/2, VB, D],[-W/2, UC-0.95, VF, VB],[UC+0.95, W/2, VF, VB]];
    for(let f=0;f<nF;f++){ const y=levels[f], ch=f ? y+2.95 : FL+3.2;
      if(f){ for(const [u0, u1, v0, v1] of around){ K.box(u1-u0, 0.3, v1-v0, (u0+u1)/2, y-0.15, (v0+v1)/2, "#7a7468"); K.flat(u0, u1, v0, v1, y);
          const R=K.rect(u0, u1, v0, v1); texPlane(R[1]-R[0], R[3]-R[2], Kd.carpets[f-1], 1.6, (R[0]+R[1])/2, y+0.006, (R[2]+R[3])/2, -Math.PI/2, 0, 1.0); } }
      for(const [u0, u1, v0, v1] of around){ const R=K.rect(u0, u1, v0, v1); texPlane(R[1]-R[0], R[3]-R[2], CEILT, 0.61, (R[0]+R[1])/2, ch, (R[2]+R[3])/2, Math.PI/2, 0, 0.95); }
      for(let u=-W/2+2; u<W/2-1; u+=3.6) for(let v=1.8; v<D-1; v+=3.6){ if(u>UC-1.4 && u<UC+1.4 && v>VF-0.6 && v<VB+0.6) continue; const [x, z]=F.P(u, v); push("tube", boxGeo(F.swap ? 1.2 : 0.6, 0.02, F.swap ? 0.6 : 1.2, 0), x, ch-0.012, z, 0, "#ffffff"); }
      for(const [u, v] of [[-W/4, D*0.5],[W/4, D*0.5]]){ const [x, z]=F.P(u, v); LAMPS.push({x:x, y:ch-0.3, z:z, color:0xfff2e0, intensity:0.75, dist:20, decay:1.5, indoor:true}); }
      addZone(x0, x1, z0, z1, y-0.4, ch, Kd.name+" · "+(f ? (["","2ND","3RD","4TH","5TH"][f])+" FLOOR" : "THE LOBBY"), true); }
    // ---- the outside, by kind ----
    const sides=[["x", z0, z0+WT, x0, x1, "n"],["x", z1-WT, z1, x0, x1, "s"],["z", x0, x0+WT, z0+WT, z1-WT, "w"],["z", x1-WT, x1, z0+WT, z1-WT, "e"]];
    const DOP={a:dc-1.0, b:dc+1.0, sill:FL-0.3, head:FL+2.4};
    if(Kd.id==="A"){
      // (Two: the ground floor all glass between dark mullions, a granite band over it; the storeys bronze glass over bronze spandrels)
      for(const [ax, c0, c1, a, b, sd] of sides){ const front=sd===side, cm=(c0+c1)/2, n=Math.round((b-a)/2.6);
        for(let k=0;k<n;k++){ const pa=a+k*(b-a)/n, pb=a+(k+1)*(b-a)/n;
          const seg=(p, q)=>{ if(q-p<0.1) return; push("glass", planeGeo(q-p-0.02, 3.0, 0), ax==="x" ? (p+q)/2 : cm, FL+1.55, ax==="x" ? cm : (p+q)/2, ax==="x" ? 0 : Math.PI/2, "#ffffff"); };
          if(front && pb>dc-1.05 && pa<dc+1.05){ seg(pa, dc-1.05); seg(dc+1.05, pb); } else seg(pa, pb); }
        for(let k=0;k<=n;k++){ const p=a+k*(b-a)/n; if(ax==="x") B(0.12, 3.1, WT+0.04, p, FL+1.55, cm, "#1a1e22"); else B(WT+0.04, 3.1, 0.12, cm, FL+1.55, p, "#1a1e22"); }
        if(ax==="x") B(b-a+0.02, 0.1, WT+0.06, (a+b)/2, FL+0.05, cm, "#1a1e22"); else B(WT+0.06, 0.1, b-a+0.02, cm, FL+0.05, (a+b)/2, "#1a1e22");
        wallBox("block", ax==="x" ? a : c0, ax==="x" ? b : c1, ax==="x" ? c0 : a, ax==="x" ? c1 : b, FL+3.1, G-0.3, GRAN, 0.6, FL);      // (up to the first spandrel)
        if(front){ if(ax==="x"){ addCol(a, dc-1.0, c0, c1, FL-0.5, G); addCol(dc+1.0, b, c0, c1, FL-0.5, G); } else { addCol(c0, c1, a, dc-1.0, FL-0.5, G); addCol(c0, c1, dc+1.0, b, FL-0.5, G); } }
        else if(ax==="x") addCol(a, b, c0, c1, FL-0.5, G); else addCol(c0, c1, a, b, FL-0.5, G);
        for(let f=1; f<nF; f++){ const y=levels[f], yn=f<nF-1 ? levels[f+1] : top;
          // the spandrel over the slab's edge, then the glass to the next one; bronze mullions; the line solid
          if(ax==="x") B(b-a, 1.2, WT, (a+b)/2, y+0.3, cm, "#4a3826"); else B(WT, 1.2, b-a, cm, y+0.3, (a+b)/2, "#4a3826");
          const gh=yn-0.3-(y+0.9);
          for(let k=0;k<n;k++){ const m=a+(k+0.5)*(b-a)/n; push("tint", boxGeo((b-a)/n-0.12, gh-0.02, 0.03), ax==="x" ? m : cm, y+0.9+gh/2, ax==="x" ? cm : m, ax==="x" ? 0 : Math.PI/2, "#a07a4a"); }
          for(let k=(ax==="x" ? 0 : 1);k<=(ax==="x" ? n : n-1);k++){ const m=a+k*(b-a)/n; if(ax==="x") B(0.1, gh, WT+0.04, m, y+0.9+gh/2, cm, "#3a2c1e"); else B(WT+0.04, gh, 0.1, cm, y+0.9+gh/2, m, "#3a2c1e"); }
          if(ax==="x") addCol(a, b, c0, c1, y-0.05, yn); else addCol(c0, c1, a, b, y-0.05, yn); }
        // the parapet: granite, the coping
        if(ax==="x") B(b-a, 1.1, WT, (a+b)/2, top-0.3+0.55, cm, GRAN); else B(WT, 1.1, b-a, cm, top-0.3+0.55, (a+b)/2, GRAN); }
      B(x1-x0+0.12, 0.08, z1-z0+0.12, cx, top+0.84, cz, "#4a3826");
      B(x1-x0-2*WT+0.02, 0.3, z1-z0-2*WT+0.02, cx, top-0.15, cz, "#6a645a");
      // the canopy over the doors: a bronze frame and glass on two round columns; the name on the granite band; red letters along the top
      { const dz=z1; B(6.0, 0.14, 3.2, dc, FL+3.3, dz+1.6, "#4a3826"); push("glass", boxGeo(5.6, 0.03, 2.9), dc, FL+3.39, dz+1.6, 0, "#ffffff");
        for(const s of [-1, 1]){ C(0.12, 3.3, dc+s*2.7, FL+1.65, dz+3.0, "#4a3826", 14); addCol(dc+s*2.7-0.13, dc+s*2.7+0.13, dz+2.87, dz+3.13, FL-0.5, FL+3.3); }
        addRoof(dc-3, dc+3, dz, dz+3.2, FL+3.38); }
      sign(14, 1.1, (c, Wd, Hh)=>{ c.fillStyle=GRAN; c.fillRect(0, 0, Wd, Hh); say(c, "MIDLAND MUTUAL", Wd/2, Hh/2, Wd*0.8, Hh*0.56, "#c8a868", "700", "Optima, Palatino, 'Palatino Linotype', serif"); },
        dc, FL+3.65, z1+0.012, 0, false, 1680);
      sign(24, 1.0, (c, Wd, Hh)=>{ c.fillStyle=GRAN; c.fillRect(0, 0, Wd, Hh); c.shadowColor="#ff3a2a"; c.shadowBlur=14; say(c, "MIDLAND MUTUAL", Wd/2, Hh/2, Wd*0.84, Hh*0.6, "#ff5a3a", "800", "Helvetica, Arial, sans-serif"); c.shadowBlur=0; },
        cx, top+0.25, z1+0.012, 0, true, 2400); }
    else {
      // (One and Three: the ground floor's wall with its windows, then for each storey a solid band, a band of glass, the wall over it)
      const G0=G;
      for(const [ax, c0, c1, a, b, sd] of sides){
        const front=sd===side, ops=[]; for(let c=a+Kd.pitch/2; c<b-Kd.pitch/2+0.01; c+=Kd.pitch) if(!front || Math.abs(c-dc)>Kd.win/2+1.4) ops.push({a:c-Kd.win/2, b:c+Kd.win/2, sill:FL+0.75, head:FL+3.0});
        if(front) ops.push(DOP);
        runW(Kd.bk, Kd.col, ax, c0, c1, a, b, FL-0.05, G0, ops); for(const o of ops) if(o!==DOP) glaze(ax, (c0+c1)/2, o, Kd.frame);
        let y=G0; const cm=(c0+c1)/2;
        for(let f=1; f<nF; f++){ const fy=levels[f], s=fy+Kd.bandS, h=fy+Kd.bandH;
          if(ax==="x") wallBox(Kd.bk, a, b, c0, c1, y, s, Kd.col, 0.6, FL); else wallBox(Kd.bk, c0, c1, a, b, y, s, Kd.col, 0.6, FL);
          push("tint", boxGeo(b-a-0.32, h-s-0.02, 0.04), ax==="x" ? (a+b)/2 : cm, (s+h)/2, ax==="x" ? cm : (a+b)/2, ax==="x" ? 0 : Math.PI/2, Kd.glass);
          for(let m=a+3.0; m<b-1.0; m+=3.0) if(ax==="x") B(0.08, h-s, WT-0.06, m, (s+h)/2, cm, Kd.frame); else B(WT-0.06, h-s, 0.08, cm, (s+h)/2, m, Kd.frame);
          if(ax==="x"){ wallBox(Kd.bk, a, a+0.15, c0, c1, s, h, Kd.col, 0.6, FL); wallBox(Kd.bk, b-0.15, b, c0, c1, s, h, Kd.col, 0.6, FL); addCol(a, b, c0, c1, s-0.1, h); }
          else { wallBox(Kd.bk, c0, c1, a, a+0.15, s, h, Kd.col, 0.6, FL); wallBox(Kd.bk, c0, c1, b-0.15, b, s, h, Kd.col, 0.6, FL); addCol(c0, c1, a, b, s-0.1, h); }
          // a band on the face at each floor: cast stone at One, teal at Three
          if(ax==="x") B(b-a+0.04, 0.24, 0.025, (a+b)/2, h+0.2, sd==="n" ? c0-0.0125 : c1+0.0125, Kd.band); else B(0.03, 0.24, b-a, sd==="w" ? c0-0.015 : c1+0.015, h+0.2, (a+b)/2, Kd.band);
          y=h; }
        if(ax==="x") wallBox(Kd.bk, a, b, c0, c1, y, top+0.9, Kd.col, 0.6, FL); else wallBox(Kd.bk, c0, c1, a, b, y, top+0.9, Kd.col, 0.6, FL); }
      for(const zc of [z0+WT/2, z1-WT/2]) B(x1-x0+0.08, 0.08, WT+0.1, cx, top+0.94, zc, Kd.cap);
      for(const xc of [x0+WT/2, x1-WT/2]) B(WT+0.08, 0.08, z1-z0-2*WT-0.1, xc, top+0.94, cz, Kd.cap);
      B(x1-x0-2*WT+0.04, 0.3, z1-z0-2*WT+0.04, cx, top-0.15, cz, "#6a645a");
      if(Kd.id==="B"){
        // the pyramid: a skylight of smoked glass on a dark frame over the middle of the roof
        const ph=3.2, pr=5.0;
        const pg=new T.ConeGeometry(pr*Math.SQRT2, ph, 4, 1, true); pg.rotateY(Math.PI/4);
        const pm=new T.Mesh(pg, new T.MeshStandardMaterial({color:0x5a4a3a, metalness:0.6, roughness:0.15, transparent:true, opacity:0.78})); pm.position.set(cx, top+ph/2+0.02, cz); pm.updateMatrix(); pm.matrixAutoUpdate=false; scene.add(pm);
        for(const [sx, sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ const a=V3(cx+sx*pr, top+0.02, cz+sz*pr), b=V3(cx, top+ph+0.02, cz), d=b.clone().sub(a), L=d.length();
          ME.push({geo:boxGeo(0.12, L, 0.12), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#2a2420")}); }
        B(2*pr+0.2, 0.2, 2*pr+0.2, cx, top+0.1, cz, "#2a2420");
        // brick piers either side of the door, a cast stone cap on each
        for(const s of [-1, 1]){ wallBox("brick", x0-0.5, x0+0.02, dc+s*1.9-0.35, dc+s*1.9+0.35, FL-0.05, FL+2.9, Kd.col, 0.6, FL); B(0.62, 0.12, 0.82, x0-0.24, FL+2.96, dc+s*1.9, Kd.band); } }
      // the name over the door
      { const fy=side==="w" ? -Math.PI/2 : side==="n" ? Math.PI : side==="e" ? Math.PI/2 : 0;
        const fx=side==="w" ? x0-0.03 : side==="e" ? x1+0.03 : dc, fz=side==="n" ? z0-0.03 : side==="s" ? z1+0.03 : dc;
        sign(10, 0.9, (c, Wd, Hh)=>{ c.fillStyle=Kd.signBg; c.fillRect(0, 0, Wd, Hh); say(c, Kd.name, Wd/2, Hh/2, Wd*0.8, Hh*0.55, Kd.letters, "700", Kd.font); },
          fx, Kd.signY, fz, fy, false, 1200);
        if(side==="w") B(0.02, 1.0, 10.1, x0-0.01, Kd.signY, dc, Kd.signBg); else if(side==="n") B(10.1, 1.0, 0.02, dc, Kd.signY, z0-0.01, Kd.signBg); }
      if(Kd.id==="C"){
        // glass block up the four corners; its initials in neon on the front; the tinted bay at the door
        for(const [px, pz, a] of [[x0, z0, "x"],[x1, z0, "x"],[x0, z1, "x"],[x1, z1, "x"]]){ const sx=px===x0 ? 1 : -1, sz=pz===z0 ? 1 : -1;
          const gb0=G+0.1, gb1=top-0.2;       // (from the storey up: the ground floor's windows stay clear)
          texPlane(1.6, gb1-gb0, GBLOCK, 0.4, px+sx*0.8, (gb0+gb1)/2, pz-sz*0.012, 0, sz<0 ? 0 : Math.PI, 0.3);
          texPlane(1.6, gb1-gb0, GBLOCK, 0.4, px-sx*0.012, (gb0+gb1)/2, pz+sz*0.8, 0, sx<0 ? Math.PI/2 : -Math.PI/2, 0.3); }
        sign(6, 1.6, (c, Wd, Hh)=>{ c.fillStyle="#1a1a22"; c.fillRect(0, 0, Wd, Hh); c.shadowColor="#ff4ab0"; c.shadowBlur=20;
            say(c, "LDS", Wd*0.3, Hh/2, Wd*0.4, Hh*0.62, "#ff8ad0", "800", "'Eurostile', 'Arial Black', Arial"); c.shadowColor="#3ae8e8";
            say(c, "LAKESHORE DATA", Wd*0.72, Hh*0.4, Wd*0.42, Hh*0.18, "#8af0f0", "700", "Arial"); say(c, "SYSTEMS", Wd*0.72, Hh*0.64, Wd*0.42, Hh*0.18, "#8af0f0", "700", "Arial"); c.shadowBlur=0; },
          dc+16, top-1.4, z0-0.03, Math.PI, true, 720);
        B(6.1, 1.7, 0.02, dc+16, top-1.4, z0-0.01, "#1a1a22");
        const by=FL, bd=2.6;
        for(const s of [-1, 1]){ push("tint", boxGeo(0.04, 3.4, bd-0.02), dc+s*3.0, by+1.7, z0-bd/2, 0, "#3a6a6a"); addCol(dc+s*3.0-0.06, dc+s*3.0+0.06, z0-bd, z0, FL-0.5, FL+3.5); }
        for(const s of [-1, 1]) push("tint", boxGeo(1.9, 3.4, 0.04), dc+s*2.05, by+1.7, z0-bd, 0, "#3a6a6a");
        push("tint", boxGeo(2.2, 1.0, 0.04), dc, by+2.9, z0-bd, 0, "#3a6a6a");
        for(const x of [dc-3.0, dc-1.1, dc+1.1, dc+3.0]) B(0.08, 3.42, 0.08, x, by+1.71, z0-bd, TEAL);
        addCol(dc-3.0, dc-1.1, z0-bd-0.06, z0-bd+0.06, FL-0.5, FL+3.5); addCol(dc+1.1, dc+3.0, z0-bd-0.06, z0-bd+0.06, FL-0.5, FL+3.5);
        B(6.2, 0.2, bd+0.1, dc, FL+3.5, z0-bd/2, TEAL); B(6.2, 0.05, bd, dc, FL-0.02, z0-bd/2, "#9a8a7a"); addFlat(dc-3.0, dc+3.0, z0-bd, z0, FL);
        addZone(dc-3.0, dc+3.0, z0-bd, z0, FL-0.5, FL+3.4, Kd.name+" · THE BAY", true); } }
    // the doors: a pair of store doors in the opening
    { const L=side==="s" || side==="n" ? [[dc-0.98, 0],[dc+0.98, Math.PI]] : [[dc-0.98, -Math.PI/2],[dc+0.98, Math.PI/2]];
      const cm=side==="s" ? z1-WT/2 : side==="n" ? z0+WT/2 : side==="w" ? x0+WT/2 : x1-WT/2;
      for(const [h, ry] of L){ if(side==="s" || side==="n") makeDoor(XF(h, cm, ry), 0, FL+0.01, 0, Kd.name, side==="n", 0, "store");
        else makeDoor(XF(cm, h, ry), 0, FL+0.01, 0, Kd.name, side==="e", 0, "store"); } }
    // the lobby, which every building has: the desk and the one at it, sofas, a table, ficus, the directory, the elevators
    lobby(Kd, K, W, D);
    Kd.E=elevator(K, Kd.name, levels, top-0.3);
    for(let f=0; f<nF; f++) Kd.plans[f](K, levels[f], W, D, Kd);
    // on every floor above the lobby, a board hung from the ceiling over the way out of the elevator: the floor and who is on it, read both ways
    for(let f=1; f<nF; f++){ const nm=(Kd.floorNames||[])[f]; if(!nm) continue; const y=levels[f], hy=y+2.45, hv=VF-2.4;
      K.box(2.6, 0.46, 0.05, UC, hy, hv, "#2a2a2e"); for(const s of [-1, 1]){ const [rx, rz]=K.P(UC+s*1.0, hv); C(0.008, 0.27, rx, y+2.81, rz, BRASS, 6); }
      const draw=(c, Wd, Hh)=>{ c.fillStyle="#2a2a2e"; c.fillRect(0, 0, Wd, Hh); say(c, String(f+1), Wd*0.1, Hh/2, Wd*0.12, Hh*0.62, "#c8a868", "700", "Optima, Palatino, serif");
        c.fillStyle="#c8a868"; c.fillRect(Wd*0.19, Hh*0.2, 2, Hh*0.6); say(c, nm, Wd*0.58, Hh/2, Wd*0.72, Hh*0.42, "#d8d0c0", "600", "Arial"); };
      for(const s of [-1, 1]){ const [x, z]=K.P(UC, hv+s*0.036); sign(2.5, 0.4, draw, x, hy, z, K.F.ry+(s>0 ? Math.PI : 0), false, 640); } }
    return Kd; }

  function lobby(Kd, K, W, D){
    const y=FL, LV=VF;
    { const du=-W*0.2, dv=LV*0.55;
      K.rbox(3.8, 1.05, 0.8, du, y+0.525, dv, Kd.desk, 0.03); K.rbox(3.96, 0.05, 0.96, du, y+1.08, dv-0.05, Kd.top, 0.015);
      K.box(3.84, 0.06, 0.02, du, y+0.9, dv-0.415, BRASS); K.col(du-1.95, du+1.95, dv-0.5, dv+0.45, y-0.5, y+1.1);
      { const o=K.obj(du+0.6, dv+0.15, "back", y); o.rb(0.36, 0.3, 0.32, 0, 1.26, 0, "#c4b89c", 0.03); const [sx, sz]=o.at(0, 0.165); push("lk_tvon", planeGeo(0.26, 0.18, 0), sx, y+1.28, sz, o.ry, "#ffffff"); }
      K.chair(du, dv+1.0, y, "front", Kd.chairCol, "THE CHAIR BEHIND THE DESK", Kd.receptionist); }
    K.sofa(W*0.24, 2.4, y, "back", 2.4, Kd.sofa, "A SOFA IN THE LOBBY"); K.sofa(W*0.24, 5.8, y, "front", 2.4, Kd.sofa, "A SOFA IN THE LOBBY");
    K.rbox(1.2, 0.04, 0.7, W*0.24, y+0.42, 4.1, "#1a1a1e", 0.01); for(const s of [-1, 1]) K.box(0.04, 0.4, 0.6, W*0.24+s*0.55, y+0.2, 4.1, "#b8bcc0"); K.col(W*0.24-0.62, W*0.24+0.62, 3.75, 4.45, y-0.5, y+0.44);
    for(const [pu, pv] of [[-W/2+0.9, 0.9],[W/2-0.9, 0.9],[-2.6, LV-0.9],[UC+2.6, LV-0.9]]) K.plant(pu, pv, y, true, Kd.planter);   // (the right one past the elevator, clear of the way to it)
    // the wall across the lobby's back: the way through it in the middle, the working car at UC (its own front) and the other one out of order
    { const t=0.2, h=FL+3.2-y+0.02;
      for(const [a, b] of [[-W/2, -1.4],[1.4, UC-0.95],[UC+0.95, W/2]]){ K.box(b-a, h, t, (a+b)/2, y+h/2, LV+t/2, Kd.wall); K.col(a, b, LV, LV+t, y-0.5, y+h); }
      K.box(0.45, h, t, UC-0.725, y+h/2, LV+t/2, Kd.wall); K.box(0.45, h, t, UC+0.725, y+h/2, LV+t/2, Kd.wall); K.box(1.0, h-2.2, t, UC, y+2.2+(h-2.2)/2, LV+t/2, Kd.wall);
      K.col(UC-0.95, UC-0.5, LV, LV+t, y-0.5, y+h); K.col(UC+0.5, UC+0.95, LV, LV+t, y-0.5, y+h);
      for(const u of [-1.45, 1.45]) K.box(0.08, 2.5, t+0.06, u, y+1.25, LV+t/2, BRASS); K.box(2.98, 0.08, t+0.06, 0, y+2.54, LV+t/2, BRASS);
      { const u=-4.2; K.box(1.3, 2.3, 0.04, u, y+1.15, LV-0.02, "#a8884a"); K.box(0.012, 2.25, 0.05, u, y+1.15, LV-0.02, "#7a5a2a"); K.box(1.5, 0.12, 0.05, u, y+2.36, LV-0.025, BRASS);
        const [sx, sz]=K.P(u, LV-0.05); sign(0.5, 0.36, (c, Wd, Hh)=>{ c.fillStyle="#d8c88a"; c.fillRect(0, 0, Wd, Hh); say(c, "OUT OF", Wd/2, Hh*0.35, Wd*0.8, Hh*0.26, "#2a2a2a", "700", "'Marker Felt', 'Comic Sans MS', cursive"); say(c, "ORDER", Wd/2, Hh*0.68, Wd*0.8, Hh*0.26, "#2a2a2a", "700", "'Marker Felt', 'Comic Sans MS', cursive"); }, sx, y+1.4, sz, K.F.ry, false, 120); }
      // the directory: black felt, the letters, a brass frame
      { const [x, z]=K.P(-8.0, LV-0.03); K.box(1.5, 1.1, 0.04, -8.0, y+1.6, LV-0.02, BRASS);
        sign(1.4, 1.0, (c, Wd, Hh)=>{ c.fillStyle="#141416"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="rgba(255,255,255,0.05)"; for(let yy=0;yy<Hh;yy+=6) c.fillRect(0, yy, Wd, 2);
            say(c, Kd.name, Wd/2, Hh*0.12, Wd*0.8, Hh*0.09, "#d8d0c0", "700", "Arial");
            Kd.tenants.forEach((n, k)=>{ say(c, n[0], Wd*0.45, Hh*(0.27+k*0.1), Wd*0.62, Hh*0.06, "#d8d0c0", "600", "'Courier New', monospace"); say(c, n[1], Wd*0.86, Hh*(0.27+k*0.1), Wd*0.16, Hh*0.06, "#d8d0c0", "600", "'Courier New', monospace"); }); },
          x+Math.sin(K.F.ry)*0.025, y+1.6, z+Math.cos(K.F.ry)*0.025, K.F.ry, false, 420); } }
    K.art(-W/2+0.05, 4.0, y+1.7, "+u", 1.6, 1.1, Kd.artK); K.art(W/2-0.05, 4.0, y+1.7, "-u", 1.6, 1.1, Kd.artK+1);
  }

  /* ---- the floors, building by building: each its own ---- */
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[(r()*5)|0], hair:HAIRS[(r()*6)|0], shirt:"#c8c0a8", pants:"#2a2e3a", shoes:"#1a1a1a", long:true}, o);
  const cubes=(K, y, u0, u1, v0, v1, fabric, desk, skip)=>{ // clusters of four, fabric shoulder high, each with its desk, terminal and chair
    for(let cu=u0+2.84; cu<u1-2.8; cu+=7.0) for(let cv=v0+2.84; cv<v1-2.8; cv+=7.0){ if(skip && skip(cu, cv)) continue; const ph=1.45;
      for(const vv of [cv-2.8, cv, cv+2.8]) K.box(5.6, ph, 0.06, cu, y+ph/2, vv, fabric);
      K.box(0.06, ph, 5.6, cu-2.8, y+ph/2, cv, fabric); K.box(0.06, ph, 5.6, cu, y+ph/2, cv, fabric);
      K.box(0.06, ph, 2.0, cu+2.8, y+ph/2, cv-1.8, fabric); K.box(0.06, ph, 2.0, cu+2.8, y+ph/2, cv+1.8, fabric);
      for(const vv of [cv-2.8, cv, cv+2.8]) K.box(5.66, 0.04, 0.08, cu, y+ph+0.02, vv, "#8a8478");
      K.col(cu-2.84, cu+0.04, cv-2.84, cv+2.84, y-0.05, y+ph); K.col(cu+0.04, cu+2.84, cv-2.84, cv-0.8, y-0.05, y+ph); K.col(cu+0.04, cu+2.84, cv+0.8, cv+2.84, y-0.05, y+ph);
      for(const [qu, qv] of [[-1.4, -1.4],[1.4, -1.4],[-1.4, 1.4],[1.4, 1.4]]){ const d=qv<0 ? "front" : "back";
        K.station(cu+qu, cv+qv+(qv<0 ? 0.55 : -0.55), y, d, 2.2, desk, {who:r()<0.3 ? look({}) : null, label:"A CHAIR IN A CUBICLE"}); } } };
  // pinwheel pods (LDS): a cross of low panels, a desk in each quarter against its arm, the fabric by turns
  const pods=(K, y, u0, u1, v0, v1, fabs, desk)=>{ let n=0;
    for(let cu=u0+2.0; cu<=u1-2.0; cu+=5.0) for(let cv=v0+2.0; cv<=v1-2.0; cv+=5.0){ const fab=fabs[(n++)%fabs.length], ph=1.2;
      K.box(3.4, ph, 0.06, cu, y+ph/2, cv, fab); for(const s of [-1, 1]) K.box(0.06, ph, 1.69, cu, y+ph/2, cv+s*0.855, fab);      // (the arms across sink a centimetre into the long one)
      K.box(3.44, 0.03, 0.08, cu, y+ph+0.015, cv, "#8a8478"); for(const s of [-1, 1]) K.box(0.08, 0.03, 1.68, cu, y+ph+0.017, cv+s*0.88, "#8a8478");
      K.col(cu-1.7, cu+1.7, cv-0.03, cv+0.03, y-0.05, y+ph); K.col(cu-0.03, cu+0.03, cv-1.7, cv+1.7, y-0.05, y+ph);
      for(const [su, sv] of [[-1,-1],[1,-1],[-1,1],[1,1]]) K.station(cu+su*1.45, cv+sv*0.95, y, su>0 ? "-u" : "+u", 1.3, desk, {who:r()<0.3 ? look({shirt:["#b8d8d8","#e8c8d8","#d8d0b0"][n%3]}) : null, label:"A CHAIR IN A POD"});
      { const [x, z]=K.P(cu, cv); C(0.05, 0.5, x, y+ph+0.28, z, "#5a4430", 6); S(0.26, x, y+ph+0.62, z, n%2 ? "#3a5a2a" : "#2e4a22"); } } };   // (a spider plant on the cross)
  // a travel poster: a sky in bands, a sun, the land in front, the place's name
  const poster=(sky, land, sun, name, sub)=>(c, W, H)=>{ for(let i=0;i<8;i++){ c.fillStyle=sky[i%sky.length]; c.fillRect(0, i*H*0.08, W, H*0.08+1); }
    c.fillStyle=sun; c.beginPath(); c.arc(W*0.68, H*0.5, W*0.14, 0, 7); c.fill(); c.fillStyle=land; c.beginPath(); c.moveTo(0, H*0.66);
    for(let x=0;x<=W;x+=W/10) c.lineTo(x, H*(0.6+((x*7)%5)*0.012)); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    say(c, name, W/2, H*0.78, W*0.8, H*0.13, "#f2e4c0", "800", "'Arial Black', Arial"); say(c, sub, W/2, H*0.9, W*0.7, H*0.06, "#f2e4c0", "600", "Arial"); };
  const breakRoom=(K, y, u0, u1, v0, v1, wallCol, gaps)=>{ // a counter with a coffee maker and a sink, a fridge, a vending machine, round tables
    K.rbox(Math.min(4, u1-u0-1), 0.92, 0.62, (u0+u1)/2, y+0.46, v1-0.34, "#8a6a4a", 0.02); K.col((u0+u1)/2-2, (u0+u1)/2+2, v1-0.66, v1, y-0.05, y+0.95);
    { const [x, z]=K.P((u0+u1)/2-1, v1-0.4); RB(0.25, 0.38, 0.28, x, y+1.12, z, "#1a1a1a", 0, 0.03); C(0.06, 0.12, x, y+1.0, z, "#8ab0c8", 12); }
    { const o=K.obj(u0+0.45, v1-1.4, "+u", y); o.rb(0.8, 1.75, 0.72, 0, 0.875, 0, "#a89a7a", 0.03); o.b(0.03, 0.6, 0.03, 0.3, 1.3, 0.37, "#8a8478"); K.col(u0+0.04, u0+0.86, v1-1.8, v1-1.0, y-0.05, y+1.75); }
    { const o=K.obj(u0+0.5, v1-2.6, "+u", y); o.rb(0.95, 1.85, 0.8, 0, 0.925, 0, "#7a1a1a", 0.03); const [sx, sz]=o.at(0, 0.41); push("lk_tvon", planeGeo(0.6, 1.1, 0), sx, y+1.15, sz, o.ry, "#ffffff"); K.col(u0+0.06, u0+0.94, v1-3.1, v1-2.1, y-0.05, y+1.85); }
    for(let k=0;k<2;k++) K.table((u0+u1)/2+(k ? 1.6 : -1.6), (v0+v1)/2-0.4, y, 0.9, 0.9, "#c8b89a", 4, "#2a7a7a", true); };

  // MIDLAND MUTUAL (A, door south): the claims floor; the bullpen; the cubicle farm and break room; the executive floor; the computer room and cafeteria
  const PLANS_A=[
    (K, y, W, D)=>{ // the lobby's back: the claims counter, its clerks, the waiting rows; the file room behind
      const cv=15.0; K.rbox(16, 1.05, 0.7, -12, y+0.525, cv, "#4a3a3a", 0.03); K.rbox(16.2, 0.05, 0.86, -12, y+1.08, cv, "#cfc6b4", 0.015); K.col(-20, -4, cv-0.36, cv+0.36, y-0.05, y+1.1);
      { const [x, z]=K.P(-12, cv-0.37); sign(4, 0.5, (c, Wd, Hh)=>{ c.fillStyle="#1a2a4a"; c.fillRect(0, 0, Wd, Hh); say(c, "CLAIMS · PLEASE TAKE A NUMBER", Wd/2, Hh/2, Wd*0.84, Hh*0.5, "#d8c890", "700", "Arial"); }, x, y+2.4, z, K.F.ry, false, 600); }
      for(let k=0;k<4;k++) K.station(-18+k*4, cv+2.0, y, "front", 1.4, "#6a5a4a", {who:look({shirt:["#c8b8d8","#d8c8a8","#a8c8c8","#d8b8b8"][k]}), label:"A CLAIMS CLERK'S CHAIR"});
      for(const v of [12.0, 13.3]) for(let k=0;k<6;k++) K.guest(-18+k*1.0+(k>2 ? 0.6 : 0), v, y, "back", "#5a6a8a", "A WAITING CHAIR");
      // the file room: rows of cabinets, a high window of glass between
      K.glassWall(6.5, 14.5, W/2, 14.5, y, 2.6, [[8.0, 9.2]]); K.glassWall(6.5, 14.5, 6.5, D, y, 2.6);
      for(let v=17.5; v<D-1.5; v+=3.0) K.files(15.5, v, y, "front", 14, "#7a7468");
      K.copier(2.0, 13.4, y, "front"); K.cooler(-1.9, 12.6, y); K.plant(-3, D-1, y, true); K.art(-W/2+0.05, 22, y+1.6, "+u", 1.6, 1.1, 2); },
    (K, y, W, D)=>{ // the bullpen: desks in rows facing the front, the managers' glass offices along the back
      for(let v=13.6; v<=25.6; v+=3.0) for(const side of [-1, 1]) for(let k=0;k<5;k++){ const u=side*(3.8+k*3.4); if(side>0 && k<1 && v<16) continue;
        K.station(u, v, y, "front", 1.5, "#6a5a4a", {who:r()<0.3 ? look({}) : null, label:"A DESK IN THE BULLPEN"}); }
      for(let u=-W/2; u<W/2-5.9; u+=6.4){ K.glassWall(u, 29.0, u+6.4, 29.0, y, 2.7, [[u+2.6, u+3.6]]); if(u>-W/2) K.wall(u, 29.0, u, D, y, 2.7, "#b8ac94");
        K.station(u+3.2, 31.5, y, "front", 1.8, "#4a3a2a", {label:"A MANAGER'S CHAIR"}); K.guest(u+2.6, 29.9, y, "back", "#5a6a8a"); K.guest(u+3.8, 29.9, y, "back", "#5a6a8a");
        K.plant(u+5.8, D-0.6, y, false); K.art(u+3.2, D-0.06, y+1.7, "front", 1.2, 0.8, (u|0)); }
      K.copier(-3.0, 11.0, y, "front"); K.cooler(1.2, 10.6, y); },
    (K, y, W, D)=>{ // policy services: private offices down the west wall, the typing pool in facing pairs, the training room, the mail room, the break room
      const PW="#a89e8a", oe=-W/2+5.0, t0=W/2-12;
      // the offices: five along the side wall, each with its door, a desk facing it, two chairs for visitors, a cabinet, a picture
      const og=[]; for(let v=12.0; v<D-4.4; v+=4.5) og.push([v+1.6, v+2.6]); K.wall(oe, 12.0, oe, D, y, 2.94, PW, og);
      for(let v=12.0; v<D-4.4; v+=4.5){ K.wall(-W/2, v, oe, v, y, 2.94, PW);
        K.station(-W/2+1.4, v+2.25, y, "+u", 1.6, "#5a4a3a", {chairCol:"#2a2a40", label:"AN UNDERWRITER'S CHAIR", who:r()<0.4 ? look({}) : null});
        for(const s of [-1, 1]) K.guest(-W/2+3.5, v+2.25+s*0.6, y, "-u", "#5a6a8a", "A CHAIR IN THE OFFICE");
        K.files(-W/2+0.4, v+0.45, y, "+u", 1, "#6a6458"); K.art(oe-0.07, v+3.7, y+1.6, "-u", 0.9, 0.6, (v|0)); }
      // the typing pool: desks in benches back to back, each pair facing across
      for(const vp of [14.5, 20.0, 25.5]) for(const [ua, n] of [[-18.4, 7],[-5.6, 7],[6.4, 4]]) for(let k=0;k<n;k++){ const u=ua+k*1.6;
        K.station(u, vp, y, "back", 1.5, "#8a7a64", {chairCol:"#2a5a6a", label:"A CHAIR IN THE TYPING POOL", who:r()<0.3 ? look({female:r()<0.7}) : null});
        K.station(u, vp+2.36, y, "front", 1.5, "#8a7a64", {chairCol:"#2a5a6a", label:"A CHAIR IN THE TYPING POOL", who:r()<0.3 ? look({female:r()<0.7}) : null}); }
      // the training room: tables in rows facing the screen, the projector on its cart, the lectern, a whiteboard
      K.wall(t0, 14.0, W/2, 14.0, y, 2.94, PW, [[t0+1.0, t0+2.2]]); K.wall(t0, 14.0, t0, D, y, 2.94, PW);
      for(let v=17.5; v<D-3.5; v+=2.4) for(const uc of [t0+3.2, t0+8.6]){ K.rbox(3.0, 0.04, 0.6, uc, y+0.74, v, "#c8b89a", 0.01);
        for(const s of [-1, 1]) K.box(0.05, 0.72, 0.5, uc+s*1.42, y+0.36, v, "#3a3a3a"); K.col(uc-1.5, uc+1.5, v-0.3, v+0.3, y-0.05, y+0.76);
        for(let k=-1;k<=1;k++) K.guest(uc+k*0.95, v-0.75, y, "back", "#2a6a8a", "A CHAIR IN THE TRAINING ROOM"); }
      { const sc=(t0+W/2)/2; K.box(4.2, 0.12, 0.14, sc, y+2.8, D-0.1, "#3a3a3e"); K.box(4.0, 2.3, 0.02, sc, y+1.62, D-0.1, "#cfc8b6");
        { const o=K.obj(sc, D-4.2, "back", y); o.rb(0.6, 0.72, 0.45, 0, 0.36, 0, "#4a4a4e", 0.02); o.rb(0.42, 0.14, 0.42, 0, 0.79, 0, "#2a2a2e", 0.02); o.c(0.02, 0.32, 0, 1.02, 0.1, "#3a3a3e", 6); o.b(0.2, 0.06, 0.2, 0, 1.2, 0.1, "#2a2a2e");
          K.col(sc-0.32, sc+0.32, D-4.45, D-3.95, y-0.05, y+0.86); }
        { const o=K.obj(W/2-1.6, D-2.4, "front", y); o.rb(0.6, 1.15, 0.5, 0, 0.575, 0, "#5a3a24", 0.02); o.b(0.66, 0.04, 0.5, 0, 1.17, -0.04, "#4a2e1c"); K.col(W/2-1.92, W/2-1.28, D-2.66, D-2.14, y-0.05, y+1.2); }
        K.box(0.03, 1.2, 3.6, t0+0.075, y+1.55, 24.0, "#d4d0c4"); K.box(0.08, 0.03, 3.6, t0+0.1, y+0.93, 24.0, "#8a8478"); K.clock(W/2-0.06, 22.0, y+2.3, "-u"); }
      // the mail room at the back: pigeonholes, the sorting table, the cart
      K.wall(-6, D-4.2, 4, D-4.2, y, 2.94, PW, [[-1.6, -0.4]]); K.wall(-6, D-4.2, -6, D, y, 2.94, PW); K.wall(4, D-4.2, 4, D, y, 2.94, PW);
      K.box(5.0, 1.8, 0.36, -1.0, y+1.3, D-0.24, "#8a6a4a"); K.col(-3.5, 1.5, D-0.42, D, y-0.05, y+2.2);
      for(let i=0;i<10;i++) for(let j=0;j<6;j++){ K.box(0.44, 0.24, 0.012, -3.27+i*0.505, y+0.53+j*0.28, D-0.427, "#3a2a1a"); if((i*7+j*3)%4===0) K.box(0.3, 0.1, 0.01, -3.27+i*0.505, y+0.5+j*0.28, D-0.44, "#d4ccb8"); }
      K.rbox(2.4, 0.9, 1.0, -1.0, y+0.45, D-2.4, "#8a7a64", 0.02); K.col(-2.2, 0.2, D-2.9, D-1.9, y-0.05, y+0.92);
      { const o=K.obj(2.6, D-1.6, "-u", y); o.b(0.6, 0.6, 0.9, 0, 0.55, 0, "#5a6a7a"); for(const s of [-1,1]) for(const t of [-1,1]) o.c(0.05, 0.04, s*0.25, 0.08, t*0.38, "#2a2a2a", 8, Math.PI/2);
        for(let k=0;k<3;k++) o.b(0.5, 0.1, 0.28, 0, 0.906+k*0.002, -0.3+k*0.3, ["#c8a868","#b88a5a","#d4ccb8"][k]); K.col(2.15, 3.05, D-1.9, D-1.3, y-0.05, y+0.95); }
      // the front: the floor's desk facing the elevator, a waiting corner at the windows, the break room
      K.station(-3.0, 5.0, y, "back", 1.6, "#5a4a3a", {chairCol:"#2a2a40", label:"THE FLOOR'S RECEPTIONIST'S CHAIR", who:look({female:true, shirt:"#c8a8b8"})});
      K.sofa(12.0, 2.2, y, "back", 2.4, "#3a5a6a", "A SOFA BY THE WINDOWS"); K.sofa(15.6, 4.0, y, "-u", 2.0, "#3a5a6a", "A SOFA BY THE WINDOWS");
      K.rbox(1.1, 0.04, 0.7, 12.0, y+0.42, 4.0, "#1a1a1e", 0.01); for(const s of [-1, 1]) K.box(0.04, 0.4, 0.6, 12.0+s*0.5, y+0.2, 4.0, "#b8bcc0"); K.col(11.44, 12.56, 3.64, 4.36, y-0.05, y+0.44);
      K.wall(-W/2, 8.2, -W/2+11, 8.2, y, 2.7, "#b8a888", [[-W/2+8.6, -W/2+9.8]]); K.wall(-W/2+11, 0, -W/2+11, 8.2, y, 2.7, "#b8a888");
      breakRoom(K, y, -W/2+0.2, -W/2+10.9, 0.2, 8.1, "#b8a888"); K.art(-W/2+0.05, 4, y+1.6, "+u", 1.2, 0.9, 1);
      K.copier(-2.8, 11.0, y, "front"); K.cooler(1.2, 10.6, y); for(const u of [W/2-1, 8.5]) K.plant(u, 0.9, y, true); },
    (K, y, W, D)=>{ // the executive floor: four corner offices in walnut, the boardroom, the secretaries' desks by the elevator
      const WAL="#4a2e1c";
      for(const [su, sv] of [[-1, 0],[1, 0],[-1, 1],[1, 1]]){ const u0=su<0 ? -W/2 : W/2-9, u1=su<0 ? -W/2+9 : W/2, v0=sv ? D-8.5 : 0, v1=sv ? D : 8.5;
        const iu=su<0 ? u1 : u0, iv=sv ? v0 : v1; K.wall(u0, iv, u1, iv, y, 2.75, WAL, [[(u0+u1)/2-0.5, (u0+u1)/2+0.5]], 0.14); K.wall(iu, v0, iu, v1, y, 2.75, WAL, null, 0.14);
        const du=(u0+u1)/2, dv=sv ? D-3.6 : 3.6, d=sv ? "front" : "back";
        K.station(du, dv+(sv ? 1.0 : -1.0), y, d, 2.2, "#3a2014", {deep:1.0, term:false, phoneCol:"#1a1a1a", chairCol:"#2a1a14", label:"A CORNER OFFICE'S CHAIR", who:su<0 && sv ? look({shirt:"#f2ecd8", pants:"#1a1a2a"}) : null});
        for(const s of [-1, 1]) K.guest(du+s*0.6, dv+(sv ? -1.1 : 1.1), y, sv ? "back" : "front", "#5a1a1a", "A CHAIR IN THE CORNER OFFICE");
        K.sofa(u0+(su<0 ? 1.0 : 8.0), (v0+v1)/2, y, su<0 ? "+u" : "-u", 2.2, "#5a1a1a"); K.plant(su<0 ? u1-0.6 : u0+0.6, sv ? D-0.6 : 0.6, y, true);
        K.art(du, sv ? D-0.06 : 0.06+0.3, y+1.7, sv ? "front" : "back", 1.6, 1.0, su+2); }
      // the boardroom: walnut on three sides, glass on the fourth, the long table, twelve chairs, the painting at its head
      K.wall(-7, 20, -7, D, y, 2.75, WAL, null, 0.14); K.wall(7, 20, 7, D, y, 2.75, WAL, null, 0.14); K.glassWall(-7, 20, 7, 20, y, 2.75, [[-0.6, 0.6]]);
      K.table(0, 27.5, y, 6.0, 1.6, "#3a2014", 16, "#2a1a14"); K.art(0, D-0.06, y+1.7, "front", 2.2, 1.4, 0);
      K.station(-4.0, 8.0, y, "front", 1.6, "#5a3a24", {who:look({female:true, shirt:"#d8b8c8"}), label:"THE SECRETARY'S CHAIR"}); K.plant(UC+3, 8.5, y, true); K.cooler(UC-1.5, VF-0.4, y); },
    (K, y, W, D)=>{ // the computer room behind glass on its raised floor; the cafeteria in front
      K.glassWall(-W/2, 13.2, W/2, 13.2, y, 2.75, [[-1.0, 0.2]]);
      const RF=signTex(128, 128, (c, Wd, Hh)=>{ c.fillStyle="#a8a294"; c.fillRect(0, 0, Wd, Hh); c.strokeStyle="#7a7468"; c.lineWidth=3; c.strokeRect(1, 1, Wd-2, Hh-2); }); RF.wrapS=RF.wrapT=T.RepeatWrapping;
      { const R=K.rect(-W/2, W/2, 13.3, D); texPlane(R[1]-R[0], R[3]-R[2], RF, 0.6, (R[0]+R[1])/2, y+0.008, (R[2]+R[3])/2, -Math.PI/2, 0, 0.6); }
      for(let v=16.5; v<D-2; v+=3.6) for(let u=-W/2+3; u<W/2-3; u+=2.0){ if(Math.abs(u-UC)<2.4 && v<17) continue; const big=((u*7+v)|0)%3===0, o=K.obj(u, v, "front", y);
        o.rb(1.6, 1.8, 0.85, 0, 0.9, 0, big ? "#2a4a7a" : "#b4a88c", 0.02); o.b(1.5, 0.2, 0.02, 0, 1.6, 0.43, big ? "#1a2a4a" : "#8a7e64");
        if(!big) for(const s of [-1, 1]){ o.c(0.17, 0.03, s*0.38, 1.25, 0.44, "#3a3a3a", 18); o.c(0.05, 0.035, s*0.38, 1.25, 0.445, "#b8b0a0", 12); }
        else for(let k=0;k<5;k++) o.b(0.04, 0.04, 0.02, -0.5+k*0.25, 1.35, 0.44, ["#ff4a3a","#3aff6a","#ffd83a"][k%3]);
        K.col(u-0.82, u+0.82, v-0.45, v+0.45, y-0.05, y+1.8); }
      K.station(-6, 14.6, y, "back", 2.4, "#8a7e64", {who:look({shirt:"#f2ecd8"}), label:"THE OPERATOR'S CHAIR"});
      { const o=K.obj(6, 15.2, "back", y); o.rb(1.6, 1.0, 0.8, 0, 0.5, 0, "#b4a88c", 0.03); o.b(1.4, 0.02, 0.5, 0, 1.01, -0.1, "#d8cca0"); K.col(5.2, 6.8, 14.8, 15.6, y-0.05, y+1.0); }
      // the cafeteria: the serving line along the front, tables of four
      K.rbox(12, 0.95, 0.75, -W/2+7.5, y+0.475, 1.2, "#8a7a64", 0.02); K.box(12, 0.04, 0.3, -W/2+7.5, y+0.98, 1.65, "#b8bcc0"); K.col(-W/2+1.5, -W/2+13.5, 0.8, 1.6, y-0.05, y+1.0);
      for(let u=-W/2+16; u<W/2-3; u+=4.4) for(const v of [4.2, 8.6]){ if(Math.abs(u-UC)<3.2 && v>7) continue; K.table(u, v, y, 1.2, 1.2, "#c8b89a", 2, "#c84a3a"); } },
  ];
  // FRENCH CREEK FINANCIAL (B, door west): the bank; the loan officers; the law firm
  const PLANS_B=[
    (K, y, W, D)=>{ // the teller line, its five windows behind glass, the queue's ropes, the vault door, two loan desks
      // Erie Valley Travel behind glass in the lobby's front corner: two agents' desks, the posters, the brochures, its name over the glass
      { const gu=-11.0, LV=VF; K.glassWall(gu, -0.05, gu, LV+0.05, y, 2.6, [[6.4, 7.6]]);
        K.box(0.14, 0.56, LV-0.04, gu, y+2.88, LV/2, "#2a4a6a");
        { const [x, z]=K.P(gu+0.08, LV/2); sign(6.0, 0.4, (c, Wd, Hh)=>{ c.fillStyle="#2a4a6a"; c.fillRect(0, 0, Wd, Hh); say(c, "ERIE VALLEY TRAVEL  ·  CRUISES  ·  TOURS  ·  AIRLINE TICKETS", Wd/2, Hh/2, Wd*0.84, Hh*0.5, "#f2d8a0", "700", "'Avenir Next', 'Trebuchet MS', sans-serif"); }, x, y+2.88, z, K.ryOf("+u"), false, 900); }
        for(const [v, who] of [[3.0, look({female:true, shirt:"#f2c8a0"})],[6.8, null]]){ K.station(-W/2+1.5, v, y, "+u", 1.5, "#c8b494", {chairCol:"#2a4a6a", label:"A TRAVEL AGENT'S CHAIR", who:who});
          for(const s of [-1, 1]) K.guest(-W/2+3.45, v+s*0.55, y, "-u", "#c86a4a", "A CHAIR AT THE TRAVEL AGENT'S DESK"); }
        { const [gx, gz]=K.obj(-W/2+2.28, 3.0, "+u", y).at(0.62, 0.3); C(0.05, 0.02, gx, y+0.776, gz, BRASS, 10); C(0.008, 0.14, gx, y+0.85, gz, BRASS, 6); S(0.11, gx, y+1.0, gz, "#2a5a8a"); }   // (a globe on the first desk)
        const PO=[[["#f2a060","#f2b878","#e8c890"], "#2a6a6a", "#f2e070", "FLORIDA", "FLY EASTERN · PACKAGES FROM $399"],[["#3a5a8a","#5a7aa8","#8aa8c8"], "#3a4a3a", "#e8e0c0", "NIAGARA FALLS", "A WEEKEND BY MOTORCOACH"],
          [["#a83a5a","#d86a6a","#f2a070"], "#4a2a2a", "#f2d050", "LAS VEGAS", "THREE NIGHTS · TWO SHOWS"],[["#2a8ab8","#5ab0d0","#a8d8e0"], "#c8b078", "#f2f0a0", "THE BAHAMAS", "SAIL FROM MIAMI"]];
        PO.forEach((P, k)=>{ const u=-W/2+1.4+k*2.05, [x, z]=K.P(u, LV-0.03); K.box(1.36, 1.86, 0.02, u, y+1.6, LV-0.01, "#2a2a2e"); sign(1.3, 1.8, poster(P[0], P[1], P[2], P[3], P[4]), x, y+1.6, z, K.F.ry, false, 260); });
        { const o=K.obj(gu-0.4, 1.6, "-u", y); o.b(0.9, 1.5, 0.28, 0, 0.75, 0, "#5a3a24"); for(let i=0;i<4;i++) for(let j=0;j<4;j++) o.b(0.18, 0.24, 0.012, -0.3+i*0.2, 0.35+j*0.32, 0.147, ["#c84a3a","#2a8ab8","#f2c41c","#3a8a5a","#a85aa8"][(i+j*3)%5]);
          K.col(gu-0.56, gu-0.24, 1.13, 2.07, y-0.05, y+1.5); } }
      const tv=16.0; K.rbox(W-8, 1.1, 0.75, 0, y+0.55, tv, "#5a3a24", 0.03); K.rbox(W-7.8, 0.05, 0.9, 0, y+1.12, tv, "#c8b494", 0.015);
      K.col(-W/2+4, W/2-4, tv-0.38, tv+0.38, y-0.05, y+1.15);
      for(let k=0;k<6;k++){ const u=-W/2+4+k*(W-8)/5; K.box(0.04, 1.0, 0.75, u, y+1.65, tv, BRASS); }
      for(let k=0;k<5;k++){ const u=-W/2+4+(k+0.5)*(W-8)/5, [gx, gz]=K.P(u, tv-0.1); push("glass", planeGeo((W-8)/5-0.1, 0.95, 0), gx, y+1.66, gz, K.F.ry, "#ffffff");
        K.chair(u, tv+1.1, y, "front", "#3a3a40", "A TELLER'S STOOL", k%2 ? null : look({female:k===2, shirt:"#c8d8c8"})); }
      { const [x, z]=K.P(0, tv-0.4); sign(3.2, 0.42, (c, Wd, Hh)=>{ c.fillStyle="#2a1a10"; c.fillRect(0, 0, Wd, Hh); say(c, "TELLERS", Wd/2, Hh/2, Wd*0.6, Hh*0.55, "#c8a868", "700", "Optima, Palatino, serif"); }, x, y+2.55, z, K.F.ry, false, 480); }
      for(let k=0;k<6;k++){ const u=-6+k*2.4, v=13.2; K.c && 0; const [x, z]=K.P(u, v); C(0.05, 0.95, x, y+0.475, z, BRASS, 10); C(0.16, 0.03, x, y+0.015, z, BRASS, 14); S(0.055, x, y+0.97, z, BRASS); }
      { const [a0, a1]=[K.P(-6, 13.2), K.P(6, 13.2)]; for(let k=0;k<5;k++){ const p=V3(a0[0]+(a1[0]-a0[0])*k/5, y+0.88, a0[1]+(a1[1]-a0[1])*k/5), q=V3(a0[0]+(a1[0]-a0[0])*(k+1)/5, y+0.88, a0[1]+(a1[1]-a0[1])*(k+1)/5), m=p.clone().add(q).multiplyScalar(0.5); m.y-=0.12;
          const d=q.clone().sub(p); ME.push({geo:new T.CylinderGeometry(0.02, 0.02, d.length(), 6), matrix:new T.Matrix4().compose(m, new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#7a1a2a")}); } }
      // the vault door on the back wall: round, steel, its wheel
      { const o=K.obj(-8, D-0.2, "front", y), disc=(rr, h, lz, c)=>{ const [x, z]=o.at(0, lz); ent(new T.CylinderGeometry(rr, rr, h, 32), x, y+1.45, z, c, Math.PI/2, o.ry, 0); };
        disc(1.35, 0.3, 0, "#7a7e82"); disc(1.15, 0.32, 0.01, "#9a9ea2"); disc(0.14, 0.12, 0.22, "#c8a050");
        for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; o.b(0.05, 0.6, 0.05, Math.cos(a)*0.3, 1.45+Math.sin(a)*0.3, 0.22, "#3a3a3a"); } }
      { const [vx, vz]=K.P(-8, D-0.12); sign(1.6, 0.3, (c, Wd, Hh)=>{ c.fillStyle="#2a1a10"; c.fillRect(0, 0, Wd, Hh); say(c, "VAULT", Wd/2, Hh/2, Wd*0.6, Hh*0.6, "#c8a868", "700", "Optima, serif"); }, vx-Math.sin(K.F.ry)*0.02, y+3.05, vz-Math.cos(K.F.ry)*0.02, K.F.ry, false, 240); }
      for(const u of [8, 14]){ K.station(u, 24.5, y, "front", 1.8, "#5a3a24", {term:false, chairCol:"#3a2a1a", label:"A LOAN OFFICER'S CHAIR", who:u===8 ? look({shirt:"#e8dcc8"}) : null});
        for(const s of [-1, 1]) K.guest(u+s*0.55, 22.7, y, "back", "#7a3a2a", "A CHAIR AT THE LOAN DESK"); }
      K.plant(W/2-1, D-1, y, true); K.plant(-W/2+1, D-1, y, true); K.clock(0, D-0.02, y+2.6, "front"); },
    (K, y, W, D)=>{ // two suites across a wall: FCF's loans on the elevator's side; Allegheny Title & Abstract across it, its records, its map files, its closing room
      const DW=-1.5, PW="#a89070", T2="#7a6a54";
      K.wall(DW, 0, DW, D, y, 2.94, PW, [[7.8, 9.0]]);
      { const [x, z]=K.P(DW+0.075, 4.0); sign(3.0, 0.5, (c, Wd, Hh)=>{ c.fillStyle="#3a2418"; c.fillRect(0, 0, Wd, Hh); say(c, "FCF · LOANS & MORTGAGES", Wd/2, Hh/2, Wd*0.8, Hh*0.5, "#c8a868", "700", "Optima, Palatino, serif"); }, x, y+2.0, z, K.ryOf("+u"), false, 480);
        const [x2, z2]=K.P(DW-0.075, 4.0); sign(3.0, 0.5, (c, Wd, Hh)=>{ c.fillStyle="#2a3a4a"; c.fillRect(0, 0, Wd, Hh); say(c, "ALLEGHENY TITLE & ABSTRACT", Wd/2, Hh/2, Wd*0.8, Hh*0.5, "#d8d0c0", "700", "Georgia, serif"); }, x2, y+2.0, z2, K.ryOf("-u"), false, 480); }
      // the loans: officers in glass along the back, their secretaries in two rows, a waiting corner at the windows
      for(let u=DW; u<W/2-4.9; u+=5.3){ K.glassWall(u, D-6, u+5.3, D-6, y, 2.6, [[u+2.1, u+3.1]]); if(u>DW) K.wall(u, D-6, u, D, y, 2.6, PW);
        K.station(u+2.65, D-2.4, y, "front", 1.6, "#5a3a24", {term:false, chairCol:"#3a2a1a", label:"A LOAN OFFICER'S CHAIR", who:r()<0.4 ? look({}) : null});
        for(const s of [-1, 1]) K.guest(u+2.65+s*0.55, D-4.2, y, "back", "#9a5a2a", "A CHAIR AT THE LOAN DESK"); K.art(u+2.65, D-0.06, y+1.7, "front", 1.0, 0.7, (u|0)+3); }
      for(let k=0;k<4;k++) for(const v of [16, 19.5]) K.station(2.0+k*4.2, v, y, "front", 1.5, "#8a6a4a", {who:r()<0.4 ? look({female:true}) : null, label:"A SECRETARY'S CHAIR"});
      K.sofa(12, 2.4, y, "back", 2.4, "#9a5a2a", "A SOFA IN THE WAITING CORNER"); K.sofa(12, 5.8, y, "front", 2.4, "#9a5a2a", "A SOFA IN THE WAITING CORNER");
      K.rbox(1.2, 0.04, 0.7, 12, y+0.42, 4.1, "#3a2014", 0.01); K.col(11.38, 12.62, 3.74, 4.46, y-0.05, y+0.44); K.plant(W/2-1, 0.9, y, true); K.plant(16.5, 4.1, y, false);
      K.copier(8.0, 11.0, y, "front"); K.cooler(1.2, 10.6, y);
      // the title company: the counter by its door, the record room's shelves of deed books, map cabinets down the wall, a microfiche reader, the abstractors
      K.rbox(0.8, 1.05, 2.6, -5.0, y+0.525, 5.0, T2, 0.03); K.rbox(0.96, 0.05, 2.76, -5.0, y+1.08, 5.0, "#c8b494", 0.015); K.col(-5.42, -4.58, 3.68, 6.32, y-0.05, y+1.1);
      K.chair(-6.1, 5.0, y, "+u", "#2a3a4a", "THE TITLE COUNTER'S CHAIR", look({female:true, shirt:"#a8b8c8"}));
      for(let v=12.0; v<23; v+=2.6) K.shelf(-10.0, v, y, "front", 7.0, "#5a4430");
      for(let k=0;k<11;k++){ const o=K.obj(-W/2+0.55, 11.2+k*1.3, "+u", y); o.b(1.24, 0.9, 0.95, 0, 0.45, 0, "#6a6a62"); for(let j=0;j<6;j++) o.b(1.16, 0.11, 0.012, 0, 0.1+j*0.14, 0.481, "#7a7a70");
        for(let j=0;j<6;j++) o.b(0.16, 0.02, 0.02, 0, 0.13+j*0.14, 0.495, "#b8b4a8"); if(k%3===1) o.b(1.0, 0.01, 0.8, 0.05, 0.906, -0.02, "#d4ccb8");
        K.col(-W/2+0.07, -W/2+1.03, 11.2+k*1.3-0.63, 11.2+k*1.3+0.63, y-0.05, y+0.92); }
      { K.station(-4.6, 14.0, y, "-u", 1.4, T2, {term:false, clutter:false, phone:false, label:"THE MICROFICHE READER'S CHAIR"}); const o=K.obj(-5.38, 14.0, "-u", y); o.rb(0.46, 0.5, 0.5, 0, 1.01, 0.1, "#3a3a3e", 0.04);
        const [sx, sz]=o.at(0, -0.152); push("lk_tvon", planeGeo(0.34, 0.26, 0), sx, y+1.06, sz, o.ry+Math.PI, "#ffffff"); }
      for(const u of [-16, -11, -6]) K.station(u, D-2.0, y, "front", 1.8, T2, {term:false, label:"AN ABSTRACTOR'S CHAIR", who:r()<0.5 ? look({}) : null});
      // the closing room in the front corner: the round table, its chairs, the plat on the wall
      K.wall(-11.5, 0, -11.5, 8.0, y, 2.94, PW, [[6.0, 7.0]]); K.wall(-W/2, 8.0, -11.5, 8.0, y, 2.94, PW);
      K.table(-15.6, 4.0, y, 1.8, 1.8, "#5a3a24", 6, "#7a3a2a", true);
      { const [x, z]=K.P(-15.6, 8.0-0.097); sign(3.0, 1.6, (c, Wd, Hh)=>{ c.fillStyle="#d4c8a8"; c.fillRect(0, 0, Wd, Hh); c.strokeStyle="#4a3a2a"; c.lineWidth=2;
          c.strokeRect(Wd*0.05, Hh*0.08, Wd*0.9, Hh*0.84); c.beginPath(); for(let i=1;i<8;i++){ c.moveTo(Wd*(0.05+i*0.1125), Hh*0.08); c.lineTo(Wd*(0.05+i*0.1125), Hh*0.92); } c.moveTo(Wd*0.05, Hh*0.5); c.lineTo(Wd*0.95, Hh*0.5); c.stroke();
          c.fillStyle="#8a7a5a"; c.fillRect(Wd*0.05, Hh*0.46, Wd*0.9, Hh*0.08); c.fillStyle="#4a3a2a"; c.font="bold 14px Arial"; c.textAlign="center"; c.textBaseline="middle";
          for(let i=0;i<8;i++){ c.fillText(String(i+1), Wd*(0.106+i*0.1125), Hh*0.3); c.fillText(String(i+9), Wd*(0.106+i*0.1125), Hh*0.72); } }, x, y+1.55, z, K.F.ry, false, 600);
        K.box(3.08, 1.68, 0.03, -15.6, y+1.55, 8.0-0.07, "#3a2a1a"); }
      K.plant(-12.3, 0.9, y, true); K.art(-W/2+0.05, 4.0, y+1.6, "+u", 1.0, 0.7, 4); },
    (K, y, W, D)=>{ // Kovach, Reese & Partners: walnut, the reception desk, the library, the conference room, the partners' offices on the front
      const WAL="#4a2e1c";
      K.rbox(3.4, 1.05, 0.8, -1, y+0.525, 7.0, "#3a2014", 0.03); K.col(-2.7, 0.7, 6.6, 7.4, y-0.05, y+1.1); K.chair(-1, 6.0, y, "back", "#2a1a14", "THE RECEPTIONIST'S CHAIR", look({female:true, shirt:"#3a2a4a"}));
      { const [x, z]=K.P(-10, 13.0-0.09); sign(4.2, 0.6, (c, Wd, Hh)=>{ c.fillStyle="#3a2014"; c.fillRect(0, 0, Wd, Hh); say(c, "KOVACH, REESE & PARTNERS", Wd/2, Hh/2, Wd*0.84, Hh*0.42, "#c8a868", "700", "Georgia, serif"); }, x, y+2.0, z, K.F.ry, false, 600); }
      // the library: shelves in rows, a long reading table
      K.wall(-W/2, 13.0, -2, 13.0, y, 2.6, WAL, [[-4.6, -3.4]], 0.14); K.wall(-2, 13.0, -2, D, y, 2.6, WAL, null, 0.14);
      for(let v=15.5; v<D-1.5; v+=2.6) K.shelf(-W/2+6.5, v, y, "front", 8.0, "#4a2e1c");
      K.table(-6.0, 22, y, 1.0, 4.0, "#3a2014", 8, "#5a1a1a");
      // the conference room
      K.wall(2, 15, W/2, 15, y, 2.6, WAL, [[3.0, 4.0]], 0.14); K.wall(2, 15, 2, D, y, 2.6, WAL, null, 0.14);
      K.table((2+W/2)/2, 22.5, y, 8.0, 1.8, "#3a2014", 20, "#2a1a14"); K.art((2+W/2)/2, D-0.06, y+1.7, "front", 2.0, 1.2, 1);
      // the partners' offices along the front windows
      for(const [u0, u1] of [[-W/2, -W/2+8],[W/2-8, W/2]]){ K.wall(u0, 6.0, u1, 6.0, y, 2.6, WAL, [[(u0+u1)/2-0.5, (u0+u1)/2+0.5]], 0.14);
        K.wall(u0<0 ? u1 : u0, 0, u0<0 ? u1 : u0, 6.0, y, 2.6, WAL, null, 0.14);
        K.station((u0+u1)/2, 2.0, y, "back", 2.0, "#3a2014", {term:false, chairCol:"#2a1a14", label:"A PARTNER'S CHAIR"}); for(const s of [-1, 1]) K.guest((u0+u1)/2+s*0.6, 4.0, y, "front", "#5a1a1a"); } },
  ];
  // LAKESHORE DATA SYSTEMS (C, door north): the showroom and the network board; the software pit, its break room and the server room
  const PLANS_C=[
    (K, y, W, D)=>{ // the showroom: personal computers on angled desks in rows; the network board on the back wall, its console facing it
      for(let v=13.5; v<=19.5; v+=3.0) for(let k=0;k<7;k++){ const u=-W/2+4+k*3.6; if(Math.abs(u-UC)<2.6) continue; K.station(u, v, y, "front", 1.4, "#c8b8a8", {chairCol:"#3a6a6a", label:"A CHAIR IN THE SHOWROOM", who:r()<0.25 ? look({shirt:"#b8d8d8"}) : null}); }
      { const [x, z]=K.P(0, D-0.06); const t=signTex(1200, 360, (c, Wd, Hh)=>{ c.fillStyle="#0a0e18"; c.fillRect(0, 0, Wd, Hh); c.strokeStyle="#2a5a8a"; c.lineWidth=2;
          c.beginPath(); for(let i=0;i<14;i++){ c.moveTo(Wd*(0.08+((i*37)%84)/100), Hh*(0.2+((i*53)%60)/100)); c.lineTo(Wd*(0.08+((i*71)%84)/100), Hh*(0.2+((i*29)%60)/100)); } c.stroke();
          for(let i=0;i<14;i++){ c.fillStyle=i%4 ? "#3af06a" : "#ff6a3a"; c.beginPath(); c.arc(Wd*(0.08+((i*37)%84)/100), Hh*(0.2+((i*53)%60)/100), 6, 0, 7); c.fill(); }
          say(c, "LDS NETWORK · 14 NODES · ALL SYSTEMS NORMAL", Wd/2, Hh*0.09, Wd*0.8, Hh*0.08, "#8af0f0", "700", "'Courier New', monospace"); });
        const m=new T.Mesh(new T.PlaneGeometry(10, 3), new T.MeshBasicMaterial({map:t, toneMapped:false})); m.position.set(x, y+1.9, z); m.rotation.y=K.F.ry; scene.add(m);
        K.box(10.2, 3.2, 0.04, 0, y+1.9, D-0.03, "#1a1a22"); }
      for(let k=0;k<3;k++) K.station(-3+k*3, D-4, y, "back", 2.6, "#c8b8a8", {chairCol:"#5a3a5a", label:"A CHAIR AT THE NETWORK CONSOLE", who:k===1 ? look({shirt:"#e8d8b8"}) : null});
      K.sofa(W/2-5, 23, y, "-u", 2.6, "#8a5a6a"); K.sofa(W/2-9, 23, y, "+u", 2.6, "#2a7a7a"); K.plant(W/2-7, 26, y, true); K.art(W/2-0.05, 20, y+1.7, "-u", 1.6, 1.1, 2); },
    (K, y, W, D)=>{ // the software pit (mauve cubicles), the break room with its games, the server room behind glass
      pods(K, y, -W/2+3.0, W/2-15.5, 15.0, D-2.5, ["#7a4a5a","#2a6a6a","#8a6a3a"], "#c8b8a8");
      // the big screen at the windows: a projection set in its cabinet, a sofa and two beanbags facing it
      { const o=K.obj(-4.0, 1.0, "back", y); o.rb(1.5, 1.45, 0.75, 0, 0.725, 0, "#2a2a2e", 0.04); o.rb(1.3, 0.12, 0.2, 0, 0.12, 0.33, "#3a3a3e", 0.02);
        const [sx, sz]=o.at(0, 0.38); push("lk_tvon", planeGeo(1.15, 0.86, 0), sx, y+0.95, sz, o.ry, "#ffffff"); K.col(-4.78, -3.22, 0.6, 1.4, y-0.05, y+1.45); }
      K.sofa(-4.0, 4.6, y, "front", 2.4, "#2a7a7a", "A SOFA BY THE BIG SCREEN");
      for(const [bu, bc] of [[-6.4, "#c84a6a"],[-1.6, "#f2c41c"]]){ const [x, z]=K.P(bu, 3.4); S(0.42, x, y+0.3, z, bc); addSeat(x, z, y, K.ryOf("front")+Math.PI, "A BEANBAG", false, 0.95); addCol(x-0.35, x+0.35, z-0.35, z+0.35, y-0.05, y+0.5); }
      // Tri-County Temps in the front corner past the elevator: its counter, the typing test, the waiting chairs, the board of jobs
      { const tu=9.0, tv=8.8, TW="#8a6a7a"; K.wall(tu, 0, tu, tv, y, 2.94, TW); K.wall(tu, tv, W/2, tv, y, 2.94, TW, [[tu+1.0, tu+2.2]]);
        { const [x, z]=K.P(tu+9, tv-0.075); sign(4.0, 0.7, (c, Wd, Hh)=>{ c.fillStyle="#2a4a5a"; c.fillRect(0, 0, Wd, Hh); say(c, "TRI-COUNTY TEMPS", Wd/2, Hh*0.36, Wd*0.8, Hh*0.34, "#f2d8a0", "800", "'Avenir Next', 'Trebuchet MS', sans-serif");
            say(c, "TYPISTS  ·  KEYPUNCH  ·  WORD PROCESSING  ·  RECEPTION", Wd/2, Hh*0.72, Wd*0.8, Hh*0.16, "#d8d0c0", "600", "Arial"); }, x, y+2.1, z, K.F.ry, false, 600); }
        K.rbox(3.0, 1.05, 0.7, tu+6.0, y+0.525, 5.6, "#8a5a6a", 0.03); K.rbox(3.16, 0.05, 0.86, tu+6.0, y+1.08, 5.6, "#c8b8a8", 0.015); K.col(tu+4.48, tu+7.52, 5.23, 5.97, y-0.05, y+1.1);
        K.chair(tu+6.0, 4.6, y, "back", "#2a6a6a", "THE TEMP AGENCY'S CHAIR", look({female:true, shirt:"#e8b8c8"}));
        for(let k=0;k<4;k++) K.guest(tu+0.5, 2.0+k*0.75, y, "+u", "#c84a6a", "A WAITING CHAIR");
        for(let k=0;k<3;k++){ const u=tu+10.5+k*2.4; K.station(u, 1.2, y, "back", 1.5, "#c8b8a8", {term:false, clutter:false, label:"A CHAIR AT THE TYPING TEST", who:k===1 ? look({shirt:"#d8c8e8"}) : null});
          const o=K.obj(u, 1.98, "back", y); o.rb(0.46, 0.14, 0.38, 0, 0.836, -0.02, "#6a5a4a", 0.03); o.b(0.4, 0.06, 0.012, 0, 0.94, 0.12, "#d4ccb8"); }
        K.box(0.03, 1.0, 2.4, W/2-0.015, y+1.5, 4.4, "#7a5a3a"); for(let k=0;k<9;k++) K.box(0.01, 0.2, 0.15, W/2-0.036, y+1.2+(k%3)*0.3, 3.5+((k/3)|0)*0.8+(k%2)*0.1, ["#d4ccb8","#c8d8a8","#e8c8a0"][k%3]);
        K.plant(tu+0.6, 0.6, y, false); K.clock(tu+0.06, 6.5, y+2.3, "+u"); }
      K.glassWall(W/2-13.5, 12.4, W/2, 12.4, y, 2.7, [[W/2-12.5, W/2-11.5]]); K.glassWall(W/2-13.5, 12.4, W/2-13.5, D, y, 2.7);
      for(let v=15; v<D-1.5; v+=2.6) for(let u=W/2-11; u<W/2-1; u+=1.0){ const o=K.obj(u, v, "front", y); o.rb(0.62, 2.0, 0.9, 0, 1.0, 0, "#2a2a30", 0.02);
        for(let k=0;k<8;k++) o.b(0.03, 0.03, 0.02, -0.2+((k*37)%40)/100, 0.3+k*0.2, 0.46, ["#3aff6a","#ffd83a","#3a8aff"][k%3]); K.col(u-0.32, u+0.32, v-0.46, v+0.46, y-0.05, y+2.0); }
      K.wall(-W/2, 8.2, -W/2+12, 8.2, y, 2.7, "#8a6a7a", [[-W/2+9.6, -W/2+10.8]]); K.wall(-W/2+12, 0, -W/2+12, 8.2, y, 2.7, "#8a6a7a");
      breakRoom(K, y, -W/2+0.2, -W/2+11.9, 0.2, 8.1, "#8a6a7a");
      { const o=K.obj(-W/2+11.4, 2.0, "-u", y); o.rb(0.7, 1.75, 0.75, 0, 0.875, 0, "#1a1a2a", 0.03); const [sx, sz]=o.at(0, 0.3); push("lk_tvon", planeGeo(0.48, 0.38, 0), sx, y+1.3, sz, o.ry, "#ffffff"); K.col(-W/2+10.9, -W/2+11.9, 1.6, 2.4, y-0.05, y+1.75); }
      { const [x, z]=K.P(-W/2+6, 5.6); B(1.4, 0.8, 0.8, x, y+0.4, z, "#2a6a3a"); for(let k=0;k<4;k++) C(0.012, 1.2, x, y+0.75, z-0.3+k*0.2, "#b8bcc0", 6, 0, 0, Math.PI/2); addCol(x-0.72, x+0.72, z-0.42, z+0.42, y-0.05, y+0.85); }
      K.sofa(-W/2+3.5, 5.6, y, "+u", 2.0, "#2a7a7a"); K.art(-W/2+0.05, 3, y+1.6, "+u", 1.2, 0.9, 0);
      K.copier(-2.8, 11.0, y, "front"); K.cooler(1.2, 10.6, y); },
  ];

  const ONE=building({id:"B", name:"FRENCH CREEK FINANCIAL", x0:822, x1:852, z0:-1795, z1:-1755, side:"w", dc:-1775, WT:0.3, signY:FL+3.6, floors:3, FH0:4.2, FHU:3.6,
    bk:"brick", col:"#7a4a36", frame:"#2a2420", cap:"#5a4a3e", band:"#b4a488", glass:"#6a5040", pitch:3.6, win:2.4, bandS:0.9, bandH:2.6, letters:"#d8c8a8", font:"Optima, Palatino, serif", signBg:"#5a3426",
    desk:"#5a3a22", top:"#c8b494", sofa:"#5a2a1a", planter:"#b4a488", wall:"#b8a07a", chairCol:"#3a2a1a", artK:1, receptionist:look({female:true, shirt:"#8a3a5a", pants:"#2a2a3a"}),
    carpets:[carpet("#6a4a32", ["#c8a868","#3a2a1a","#a86a3a"], 11), carpet("#3a2a2a", ["#6a1a1a","#c8a868"], 12)],
    floorNames:[null, "LOANS & MORTGAGES  ·  ALLEGHENY TITLE & ABSTRACT", "KOVACH, REESE & PARTNERS"],
    tenants:[["FRENCH CREEK FINANCIAL", "L"],["FCF · LOANS & MORTGAGES", "2"],["KOVACH, REESE & PARTNERS", "3"],["ALLEGHENY TITLE & ABSTRACT", "2"],["ERIE VALLEY TRAVEL", "L"]], plans:PLANS_B});
  const TWO=building({id:"A", name:"MIDLAND MUTUAL", x0:860, x1:912, z0:-1850, z1:-1815, side:"s", dc:886, WT:0.25, floors:5, FH0:4.4, FHU:3.7,
    desk:"#1a1a1e", top:"#cfc6b4", sofa:"#1a1a1a", planter:"#2a2a2e", wall:"#a89e8a", chairCol:"#2a2a2e", artK:0, receptionist:look({skin:SKINS[3], hair:HAIRS[5], shirt:"#d8d0c0", pants:"#1a1a2a"}),
    carpets:[carpet("#5a6474", ["#2a7a7a","#c84a6a","#e8c070","#1a1a2a"], 21), carpet("#4a6a6a", ["#c87a9a","#e8d8a8","#1a3a4a"], 22), carpet("#5a1a24", ["#c8a868","#2a0a10"], 23), carpet("#6a6460", ["#3a8aa8","#d8a040"], 24)],
    floorNames:[null, "UNDERWRITING", "POLICY SERVICES  ·  TRAINING  ·  MAIL", "THE EXECUTIVE SUITE", "DATA PROCESSING  ·  CAFETERIA"],
    tenants:[["MIDLAND MUTUAL INSURANCE", "L-5"],["MIDLAND MUTUAL · CLAIMS", "L"],["MIDLAND MUTUAL · UNDERWRITING", "2"],["MIDLAND MUTUAL · POLICY SERVICES", "3"],["THE EXECUTIVE SUITE", "4"],["DATA PROCESSING · CAFETERIA", "5"]], plans:PLANS_A});
  const THREE=building({id:"C", name:"LAKESHORE DATA SYSTEMS", x0:860, x1:912, z0:-1735, z1:-1702, side:"n", dc:886, WT:0.3, signY:FL+4.55, floors:2, FH0:4.2, FHU:3.8,
    bk:"concrete", col:"#b49a78", frame:"#2a4a4a", cap:"#8a7458", band:TEAL, glass:"#3a6a6a", pitch:3.0, win:2.4, bandS:0.8, bandH:2.9, letters:"#2a5a5a", font:"'Avenir Next', 'Trebuchet MS', sans-serif", signBg:"#b49a78",
    desk:"#c8b8a8", top:"#b88a7a", sofa:"#8a5a6a", planter:"#b88a7a", wall:"#a88a8a", chairCol:"#3a6a6a", artK:2, receptionist:look({female:true, skin:SKINS[2], hair:HAIRS[0], shirt:"#3a6a7a", pants:"#2a2a2a"}),
    carpets:[carpet("#6a5a6a", ["#2ac8c8","#ff8ab8","#f2d84a","#2a2a3a"], 31)],
    floorNames:[null, "SOFTWARE  ·  TRI-COUNTY TEMPS"],
    tenants:[["LAKESHORE DATA SYSTEMS", "L"],["LDS · SHOWROOM", "L"],["LDS · NETWORK OPERATIONS", "L"],["LDS · SOFTWARE", "2"],["TRI-COUNTY TEMPS", "2"]], plans:PLANS_C});

  /* ---- the plaza: the fountain, planters with trees, benches facing it, lamps on posts ---- */
  const FX=893, FZ=-1775, FR=4.5;
  { // the basin's wall: a ring of granite blocks (each faced inside and out), its coping; the bowl's floor; the water, rippled
    const n=40; for(let k=0;k<n;k++){ const a=(k+0.5)/n*Math.PI*2, x=FX+Math.cos(a)*(FR-0.18), z=FZ+Math.sin(a)*(FR-0.18), w=2*Math.PI*FR/n+0.02;
      B(0.36, 0.5, w, x, LY+0.25, z, "#5a544e", -a); B(0.5, k%2 ? 0.06 : 0.064, w+0.04, x, LY+0.53, z, "#8a8076", -a); }
    for(let k=0;k<16;k++){ const a=(k+0.5)/16*Math.PI*2; addColOB(FX+Math.cos(a)*(FR-0.18), FZ+Math.sin(a)*(FR-0.18), -a+Math.PI/2, 0.95, 0.25, LY-0.5, LY+0.56); }
    for(let k=0;k<10;k++){ const a=(k+0.5)/10*Math.PI*2; addSeat(FX+Math.cos(a)*(FR+0.05), FZ+Math.sin(a)*(FR+0.05), LY+0.1, Math.atan2(-Math.cos(a), -Math.sin(a)), "THE FOUNTAIN'S EDGE", false, 0.4); }
    // (the basin's floor: dark pebbled, seen through the water)
    { const t=signTex(256, 256, (c, W, H)=>{ c.fillStyle="#3a4a48"; c.fillRect(0, 0, W, H); for(let i=0;i<900;i++){ c.fillStyle=["#2a3634","#4a5a56","#5a6862","#323e3c"][i%4]; c.beginPath(); c.arc((i*61.7)%W, (i*37.3+i*0.7)%H, 2+(i%4), 0, 7); c.fill(); } });
      t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(4, 4); const m=new T.Mesh(new T.CircleGeometry(FR-0.3, 40), new T.MeshStandardMaterial({map:t, roughness:0.9})); m.rotation.x=-Math.PI/2; m.position.set(FX, LY+0.06, FZ); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); }
    const lakeN=(typeof LAKESIDE!=="undefined" && LAKESIDE.water) ? LAKESIDE.water.material.normalMap : null;
    let nrm=null; if(lakeN){ nrm=lakeN.clone(); nrm.needsUpdate=true; nrm.wrapS=nrm.wrapT=T.RepeatWrapping; nrm.repeat.set(2.4, 2.4); }
    const wm=envOut(new T.MeshStandardMaterial({color:0x3a7a8a, roughness:0.03, metalness:0.15, transparent:true, opacity:0.62, depthWrite:false, normalMap:nrm, normalScale:new T.Vector2(0.45, 0.45)}), 1.2);
    if(nrm) wm.onBeforeCompile=(sh)=>{ sh.uniforms.uFlow={value:OFFICE.flow};
      sh.fragmentShader=sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform vec4 uFlow;")
        .replace("#include <normal_fragment_maps>", `{ vec3 nA=texture2D(normalMap, vUv+uFlow.xy).xyz*2.0-1.0, nB=texture2D(normalMap, vUv*0.53+uFlow.zw).xyz*2.0-1.0;
  vec3 mapN=normalize(vec3(nA.xy+nB.xy, nA.z*nB.z)); mapN.xy*=normalScale;
  normal=perturbNormal2Arb(-vViewPosition, normal, mapN, faceDirection); }`); };
    const w=new T.Mesh(new T.CircleGeometry(FR-0.3, 48), wm); w.rotation.x=-Math.PI/2; w.position.set(FX, LY+0.42, FZ); w.renderOrder=3; scene.add(w); OFFICE.water=w;
    // the middle: a fluted pedestal, two bowls, a finial
    C(0.42, 1.5, FX, LY+0.75, FZ, "#7a746a", 16); ent(new T.CylinderGeometry(1.5, 0.35, 0.32, 28), FX, LY+1.55, FZ, "#7a746a"); C(1.52, 0.06, FX, LY+1.72, FZ, "#8a8076", 28);
    C(0.24, 0.9, FX, LY+2.1, FZ, "#7a746a", 14); ent(new T.CylinderGeometry(0.8, 0.2, 0.22, 24), FX, LY+2.62, FZ, "#7a746a"); C(0.82, 0.05, FX, LY+2.74, FZ, "#8a8076", 24);
    ent(new T.SphereGeometry(0.12, 12, 10), FX, LY+2.86, FZ, "#7a746a");
    // (the water standing in each bowl)
    for(const [rr, yy] of [[1.44, 1.69],[0.76, 2.71]]){ const m=new T.Mesh(new T.CircleGeometry(rr, 28), wm); m.rotation.x=-Math.PI/2; m.position.set(FX, LY+yy, FZ); m.renderOrder=3; scene.add(m); }
    addCol(FX-0.5, FX+0.5, FZ-0.5, FZ+0.5, LY-0.5, LY+2.7);
    // the water in the air: drops thrown from the jet and the rim's nozzles, falling off each bowl's lip; a splash where they land
    const NP=2600, pos=new Float32Array(NP*3), vel=new Float32Array(NP*3), life=new Float32Array(NP), kind=new Uint8Array(NP);
    const dropT=signTex(32, 32, (c, W, H)=>{ const g=c.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2); g.addColorStop(0, "rgba(220,236,240,0.9)"); g.addColorStop(0.5, "rgba(190,214,222,0.45)"); g.addColorStop(1, "rgba(190,214,222,0)"); c.fillStyle=g; c.fillRect(0, 0, W, H); });
    const pg=new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pos, 3)); pg.boundingSphere=new T.Sphere(V3(FX, LY+2, FZ), 7);
    const pm=new T.PointsMaterial({map:dropT, size:0.07, sizeAttenuation:true, transparent:true, depthWrite:false, color:0xc8d8dc, opacity:0.85});
    const pts=new T.Points(pg, pm); pts.frustumCulled=true; scene.add(pts);
    OFFICE.drops={pts:pts, pos:pos, vel:vel, life:life, kind:kind, NP:NP, at:0, cx:FX, cz:FZ, y:LY};
    for(let i=0;i<NP;i++){ life[i]=0; pos[i*3+1]=-999; } }
  // planters with a tree in each, benches round the fountain facing it, lamps on posts round the edge
  for(const [x, z] of [[866, -1803],[920, -1803],[866, -1747],[920, -1747]]){ B(3.0, 0.55, 3.0, x, LY+0.275, z, "#9a8a74"); B(2.6, 0.03, 2.6, x, LY+0.545, z, "#4a3a2a");
    addCol(x-1.5, x+1.5, z-1.5, z+1.5, LY-0.5, LY+0.56); if(typeof FOREST!=="undefined") FOREST.plant("lawn", x, z, {scale:0.75});
    for(const [dz, ry] of [[1.55, Math.PI],[-1.55, 0]]) addSeat(x, z+dz, LY+0.1, ry, "A PLANTER'S EDGE", false, 0.4); }
  // (a bench's back is on the far side from the fountain, so whoever sits on it looks at the water)
  for(const [x, z] of [[880, -1790],[906, -1790],[880, -1760],[906, -1760]]){ const toF=Math.sign(FZ-z), ry=toF>0 ? Math.PI : 0;
    for(const s of [-1, 1]) B(0.08, 0.42, 0.42, x+s*0.85, LY+0.21, z, "#2a2a2e");
    B(1.9, 0.06, 0.46, x, LY+0.45, z, "#8a6a4a"); B(1.9, 0.4, 0.06, x, LY+0.7, z-toF*0.22, "#8a6a4a");
    addCol(x-0.95, x+0.95, z-0.26, z+0.26, LY-0.5, LY+0.9); for(const dx of [-0.5, 0.5]) addSeat(x+dx, z, LY+0.1, ry, "A BENCH BY THE FOUNTAIN"); }
  for(const [x, z] of [[856, -1808],[930, -1808],[856, -1742],[930, -1742],[893, -1810],[893, -1740]]){
    C(0.07, 3.6, x, LY+1.8, z, "#2a2a2e", 10); S(0.24, x, LY+3.75, z, "#c8bca0"); addCol(x-0.09, x+0.09, z-0.09, z+0.09, LY-0.5, LY+3.6);
    push("rn_glow", new T.SphereGeometry(0.2, 10, 8), x, LY+3.75, z, 0, "#ffffff");
    const L={x:x, y:LY+3.5, z:z, color:0xffe2b0, intensity:0, dist:14, decay:1.5}; LAMPS.push(L); OFFICE.lamps.push(L); }
  // three flags at the plaza's lake end, on proper poles: stout, dark, a base and a gold ball, so they never seem to hang in the air
  for(const [k, z] of [[0, -1791],[1, -1787],[2, -1783]]){ const x=933.5;
    C(0.11, 10, x, LY+5, z, "#4a4e52", 12); C(0.3, 0.3, x, LY+0.15, z, "#6a645a", 16); S(0.14, x, LY+10.1, z, "#c8a050"); addCol(x-0.32, x+0.32, z-0.32, z+0.32, LY-0.5, LY+10);
    for(const yy of [9.75, 8.85]) C(0.02, 0.14, x, LY+yy, z+0.15, "#8a8e92", 6, Math.PI/2, 0, 0);
    sign(1.6, 1.0, (c, Wd, Hh)=>{ if(k===0){ for(let i=0;i<13;i++){ c.fillStyle=i%2 ? "#d8d0c0" : "#b3191e"; c.fillRect(0, i*Hh/13, Wd, Hh/13+1); } c.fillStyle="#1f2a5a"; c.fillRect(0, 0, Wd*0.4, Hh*7/13); }
        else if(k===1){ c.fillStyle="#1f3f7a"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#d8b048"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.12, Hh*0.22, 0, 0, 7); c.fill(); }
        else { c.fillStyle="#2a7a7a"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#c8b48a"; c.fillRect(0, Hh*0.4, Wd, Hh*0.2); say(c, "HRCP", Wd/2, Hh*0.5, Wd*0.5, Hh*0.16, "#2a2a2a", "800", "Arial"); } },
      x+0.003, LY+9.3, z+0.94, Math.PI/2, false, 320);
    sign(1.6, 1.0, (c, Wd, Hh)=>{ if(k===0){ for(let i=0;i<13;i++){ c.fillStyle=i%2 ? "#d8d0c0" : "#b3191e"; c.fillRect(0, i*Hh/13, Wd, Hh/13+1); } c.fillStyle="#1f2a5a"; c.fillRect(Wd*0.6, 0, Wd*0.4, Hh*7/13); }
        else if(k===1){ c.fillStyle="#1f3f7a"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#d8b048"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.12, Hh*0.22, 0, 0, 7); c.fill(); }
        else { c.fillStyle="#2a7a7a"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#c8b48a"; c.fillRect(0, Hh*0.4, Wd, Hh*0.2); say(c, "HRCP", Wd/2, Hh*0.5, Wd*0.5, Hh*0.16, "#2a2a2a", "800", "Arial"); } },
      x-0.003, LY+9.3, z+0.94, -Math.PI/2, false, 320); }
  // the lawn down to the water: a walk out to a rail at the bank, benches looking out
  { for(const dz of [-3, 3]) for(const y of [0.5, 1.0]) B(0.06, 0.06, 1.0, 967.6, LY+y, -1775+dz, "#2a2a2e");
    B(0.06, 0.06, 8.0, 967.6, LY+1.0, -1775, "#2a2a2e"); B(0.06, 0.06, 8.0, 967.6, LY+0.5, -1775, "#2a2a2e");
    for(let z=-1779; z<=-1771; z+=2) B(0.075, 1.02, 0.075, 967.6, LY+0.51, z, "#2a2a2e");
    addCol(967.4, 967.8, -1779.1, -1770.9, LY-0.5, LY+1.05);
    for(const z of [-1790, -1760]){ const gz=Terrain.groundAt(960, z); for(const s of [-1, 1]) B(0.42, 0.42, 0.08, 960, gz+0.21, z+s*0.85, "#2a2a2e");
      B(0.46, 0.06, 1.9, 960, gz+0.45, z, "#8a6a4a"); B(0.06, 0.4, 1.9, 959.78, gz+0.7, z, "#8a6a4a");
      addCol(959.74, 960.26, z-0.95, z+0.95, gz-0.5, gz+0.9); for(const dz of [-0.5, 0.5]) addSeat(960.02, z+dz, gz, -Math.PI/2, "A BENCH LOOKING OUT OVER THE LAKE"); } }
  // lamps in the lot
  for(const [x, z] of [[759, -1775],[776.25, -1825],[776.25, -1725],[793.75, -1775]]){ const gy=LY; C(0.08, 8.0, x, gy+4.0, z, "#5a5e60", 10); addCol(x-0.1, x+0.1, z-0.1, z+0.1, gy-0.5, gy+8);
    for(const s of [-1, 1]){ B(1.0, 0.08, 0.1, x+s*0.5, gy+7.9, z, "#5a5e60"); RB(0.6, 0.14, 0.4, x+s*1.0, gy+7.85, z, "#3a3e42", 0, 0.03);
      push("rn_glow", planeGeo(0.5, 0.3, 0), x+s*1.0, gy+7.775, z, 0, "#ffffff", Math.PI/2, 0);
      const L={x:x+s*1.0, y:gy+7.5, z:z, color:0xffd8a0, intensity:0, dist:20, decay:1.4}; LAMPS.push(L); OFFICE.lamps.push(L); } }
  // the park's name by the road on a low wall of brick, the tenants under it
  { const sx=746.0, sz=-1758.0, gy=Terrain.groundAt(sx, sz);
    wallBox("brick", sx-0.3, sx+0.3, sz-3.6, sz+3.6, gy-0.3, gy+1.9, "#7a4a36", 0.6, gy); B(0.74, 0.08, 7.4, sx, gy+1.94, sz, "#9a8a74");
    for(const sd of [-1, 1]) sign(6.6, 1.6, (c, Wd, Hh)=>{ c.fillStyle="#2a2a2e"; c.fillRect(0, 0, Wd, Hh); c.strokeStyle="#c8a050"; c.lineWidth=6; c.strokeRect(8, 8, Wd-16, Hh-16);
        say(c, "HOLLOW ROAD CORPORATE PARK", Wd/2, Hh*0.3, Wd*0.8, Hh*0.2, "#e8d8a8", "700", "Optima, Palatino, serif");
        say(c, "FRENCH CREEK FINANCIAL · MIDLAND MUTUAL · LAKESHORE DATA SYSTEMS", Wd/2, Hh*0.62, Wd*0.8, Hh*0.1, "#d8d0c0", "600", "Arial");
        say(c, "ONE · TWO · THREE HOLLOW ROAD", Wd/2, Hh*0.8, Wd*0.6, Hh*0.08, "#b8b0a0", "600", "Arial"); },
      sx+sd*0.32, gy+1.05, sz, sd*Math.PI/2, false, 1320);
    // a bed of junipers and red mulch along its foot
    for(let k=0;k<6;k++) for(const s of [-1, 1]) if(typeof FOREST!=="undefined") FOREST.plant("shrub", sx+s*1.1, sz-3+k*1.2, {scale:0.7, solid:false}); }

  /* ---- the people: one at each desk by day, the ones at their desks upstairs, lunch on the plaza ---- */
  if(typeof crowdGroup==="function"){
    for(const Kd of [ONE, TWO, THREE]){ const [gx, gz]=Kd.F.P(0, Kd.D/2), G=crowdGroup(Kd.name.toLowerCase(), gx, gz, 70);
      for(const s of Kd.K.sitters) crowdAdd(G, {look:s.look, x:s.x, z:s.z, y:s.y, yaw:s.yaw, mode:"sit", sitY:0.515, dayOnly:true, sway:0.2}); }
    const G=crowdGroup("hollow road corporate park", 880, -1775, 150);
    crowdAdd(G, {look:look({shirt:"#a8b8c8", pants:"#3a3a3a"}), x:880.4, z:-1790.0, y:LY+0.1, yaw:Math.PI, mode:"sit", sitY:0.515, dayOnly:true, sway:0.3});
    crowdAdd(G, {look:look({female:true, shirt:"#c88a9a", hair:HAIRS[2], long:false}), x:906.4, z:-1760.0, y:LY+0.1, yaw:0, mode:"sit", sitY:0.515, dayOnly:true, sway:0.3, held:"cup", drink:true});
    crowdAdd(G, {look:look({shirt:"#3a4a6a"}), mode:"walk", path:[[812, -1801, LY],[935, -1801, LY, 3],[962, -1785, undefined],[962, -1765, undefined, 6],[935, -1749, LY],[812, -1749, LY, 4]], loop:true, dayOnly:true}); }

  /* ---- the zones; the walls of the world round the park; trees, lots of them, everywhere but toward the lake ---- */
  addZone(O.x0, O.x1, O.z0, O.z1, Y-4, Y+30, "HOLLOW ROAD CORPORATE PARK");
  addZone(852, 936, -1812, -1738, Y-1, Y+20, "HOLLOW ROAD CORPORATE PARK · THE PLAZA");
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300);
    const shoreX=(z)=>{ let x=930; while(x<O.x1+40 && Terrain.lakeSD(x, z)>1.5) x+=0.25; return x; };
    const xs=shoreX(O.z0), xn=shoreX(O.z1);
    W(O.x0, xs+0.4, O.z0-0.4, O.z0+0.4); W(O.x0, xn+0.4, O.z1-0.4, O.z1+0.4);
    const BANK="THE BANK DROPS STRAIGHT INTO THE LAKE HERE";
    for(let z=O.z0; z<O.z1-0.01; z+=2){ const a=shoreX(z), b=shoreX(Math.min(O.z1, z+2)); W(Math.min(a, b)-0.4, Math.max(a, b)+0.4, z, Math.min(O.z1, z+2)).msg=BANK; } }
  if(typeof FOREST!=="undefined"){ const q=_trng(1984);
    const tree=(sp, x, z, s)=>{ if(Terrain.lakeSD(x, z)<3.5) return; FOREST.plant(sp, x, z, {scale:s}); const rr=0.24*s, gy=Terrain.groundAt(x, z); addCol(x-rr, x+rr, z-rr, z+rr, gy-0.5, gy+6); };
    for(const [z, nz] of [[O.z0, -1],[O.z1, 1]]) for(let x=O.x0+4; x<O.x1+12; x+=6.2) for(const [dep, sp] of [[1.8, "edge"],[6.5, null],[11.5, null],[16.5, null]]){ if(q()<0.15) continue;
      tree(sp || (q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard"), x+(q()-0.5)*2.4, z+nz*(dep+q()*2.2), 0.85+q()*0.4); }
    // trees in the open: along the lot's edges and the road, round the buildings, on the lawn (edge and lawn trees, never the woods' kind)
    const open=[[747.5, -1845],[747.5, -1830],[747.5, -1815],[747.5, -1800],[747.5, -1745],[747.5, -1730],[747.5, -1715],[747.5, -1700],
      [808.5, -1845],[808.5, -1830],[808.5, -1815],[808.5, -1735],[808.5, -1720],[808.5, -1705],
      [776.25, -1795],[776.25, -1755],[758.9, -1700.5],[793.9, -1700.5],[758.9, -1849.5],[793.9, -1849.5],
      [818, -1812],[838, -1812],[856, -1857],[876, -1857],[896, -1857],[916, -1857],[925, -1832],[925, -1820],
      [818, -1738],[838, -1738],[856, -1695],[876, -1695],[896, -1695],[916, -1695],[925, -1720],[925, -1708],
      [945, -1820],[952, -1730],[940, -1845],[948, -1712],[950, -1800],[944, -1752],[956, -1840],[958, -1700]];
    for(const [x, z] of open) tree(q()<0.6 ? "lawn" : "edge", x+(q()-0.5)*0.8, z+(q()-0.5)*0.8, 0.85+q()*0.3);
    // and shrubs along the buildings' feet
    for(const Kd of [ONE, TWO, THREE]){ for(let x=Kd.x0+1.5; x<Kd.x1-1; x+=2.2) for(const z of [Kd.z0-1.2, Kd.z1+1.2]){ if(Math.abs(x-Kd.dc)<4 && (Kd.side==="s" || Kd.side==="n")) continue; if(Terrain.lakeSD(x, z)<3) continue;
        if(z>-1812 && z<-1738 && x>852 && x<936) continue; FOREST.plant("shrub", x, z, {scale:0.65+q()*0.3, solid:false}); } } }

  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.08});
  detailMesh(ME, mat, "office-park", true);

  OFFICE.routes={
    "office park: up Hollow Road from the pretzel works to the end":[[733.5, -1660],[733.5, -1720],[733.5, -1800],[733.5, -1870]],
    "office park: in at the mouth, across the lot to One Hollow Road's door":[[734.0, -1774.0],[745.0, -1774.0],[758.0, -1776.0],[776.25, -1786.0],[795.0, -1786.0],[805.0, -1776.0],[815.0, -1775.0],[819.5, -1775.0]],
    "office park: round One to the plaza and the fountain":[[812.0, -1801.0],[840.0, -1801.0],[856.0, -1801.0],[870.0, -1796.0],[886.0, -1796.0],[886.0, -1787.0]],
    "office park: from the plaza into Midland Mutual":[[886.0, -1810.0],[886.0, -1813.0],[886.0, -1815.5],[886.0, -1818.0],[886.0, -1823.0]],
    "office park: from the plaza into Lakeshore Data Systems":[[886.0, -1745.0],[886.0, -1740.0],[886.0, -1736.0],[886.0, -1733.0],[886.0, -1730.0]],
    "office park: across the lawn to the rail at the water":[[930.0, -1775.0],[945.0, -1775.0],[960.0, -1775.0],[966.5, -1775.0]]};
  // and in each building, from the door to the elevator, and round every floor from the elevator
  for(const Kd of [ONE, TWO, THREE]){ const P=Kd.F.P, nm=Kd.name.toLowerCase();
    OFFICE.routes["office park: "+nm+", the door to the elevator"]={y0:FL+0.1, pts:[P(0, -0.6), P(0, 3.0), P(0, 8.5), P(UC, 9.0), P(UC, 9.6)]};
    for(let f=1; f<Kd.levels.length; f++) OFFICE.routes["office park: "+nm+", floor "+(f+1)+" from the elevator"]={y0:Kd.levels[f]+0.1, pts:[P(UC, 9.4), P(UC, 8.0), P(UC, 7.0), P(1.7, 7.0)]};
    OFFICE.routes["office park: "+nm+", into the elevator"]={y0:FL+0.1, pts:[P(UC, 9.2), P(UC, 9.8), P(UC, 10.6), P(UC, 11.1)]}; }
  // and into the rooms off each floor: the travel agency, the title company's closing room, the training room, the temp agency
  { const R=(Kd, f, nm, uv)=>{ OFFICE.routes["office park: "+Kd.name.toLowerCase()+", "+nm]={y0:Kd.levels[f]+0.1, pts:uv.map(([u, v])=>Kd.F.P(u, v))}; };
    R(ONE, 0, "into Erie Valley Travel", [[0, 3.0],[-6, 7.0],[-10, 7.0],[-12, 7.0],[-14.5, 5.0]]);
    R(ONE, 1, "floor 2, into the title company's closing room", [[UC, 9.4],[UC, 8.4],[0, 8.4],[-3.0, 8.4],[-8, 7.4],[-11.0, 6.5],[-12.5, 6.5]]);
    R(TWO, 2, "floor 3, into the training room", [[UC, 9.4],[UC, 8.0],[15.3, 8.0],[15.3, 12.5],[15.3, 15.5],[15.3, 16.2]]);
    R(THREE, 1, "floor 2, into Tri-County Temps", [[UC, 9.4],[7.0, 9.6],[10.6, 9.6],[10.6, 8.0],[11.0, 6.5]]); }
  OFFICE.bldg=[ONE, TWO, THREE];
})();

/* ---- the elevators: each a little machine run here; a number while you are in an idle car is a floor (17's keydown) ---- */
OFFICE.elevKey=function(e){
  if(typeof player==="undefined") return false;
  const m=/^(Digit|Numpad)([1-9])$/.exec(e.code); if(!m) return false;
  for(const E of OFFICE.elevs){ const R=E.rect, p=player.pos;
    if(p.x>R[0] && p.x<R[1] && p.z>R[2] && p.z<R[3] && Math.abs(player.feetY-E.y)<0.5){ const f=(+m[2])-1; if(f<E.levels.length){ if(f!==E.f || E.state!=="idle"){ E.target=f; if(E.state==="idle" || E.state==="opening") E.state="closing"; } } return true; } }
  return false; };
function updateElevators(dt){
  for(const E of OFFICE.elevs){
    const lv=E.levels;
    if(E.state==="opening"){ E.door=Math.min(1, E.door+dt*0.9); if(E.door>=1) E.state="idle"; }
    else if(E.state==="closing"){ E.door=Math.max(0, E.door-dt*0.9); if(E.door<=0) E.state="moving"; }
    else if(E.state==="moving"){ const goal=lv[E.target], d=goal-E.y, sp=Math.min(2.0, 0.35+Math.abs(d)*1.2);
      if(Math.abs(d)<0.004){ E.y=goal; E.f=E.target; E.state="opening"; if(typeof AUDIO!=="undefined"){ const [x, z]=E.F.P(UC_ELEV, 9.5); AUDIO.blip("bell", x, z); } }
      else E.y+=Math.sign(d)*Math.min(Math.abs(d), sp*dt); }
    E.car.position.y=E.y; E.surf.y=E.y;
    const open=E.state==="moving" ? 0 : E.door;
    E.carL[0].position.x=-0.25-open*0.5; E.carL[1].position.x=0.25+open*0.5;
    for(let f=0; f<lv.length; f++){ const o=(f===E.f && E.state!=="moving") ? open : 0, L=E.land[f]; L[0].position.x=-0.25-o*0.5; L[1].position.x=0.25+o*0.5;
      E.doorCols[f].y1=o>0.7 ? -9999 : lv[f]+2.2; } } }
const UC_ELEV=4.2;
/* the lamps come on after dark; the fountain runs and its water drifts while you are near it */
function updateOfficePark(dt, dark){
  for(const L of OFFICE.lamps) L.intensity=1.1*smoothstep(0.3, 0.6, dark);
  updateElevators(dt);
  const c=camera.position; if(Math.hypot(c.x-893, c.z+1775)>130) return;
  OFFICE.t+=dt; const t=OFFICE.t;
  OFFICE.flow.set((t*0.031)%1, (t*0.022)%1, (-t*0.017)%1, (t*0.026)%1);
  const Dr=OFFICE.drops; if(!Dr || dt<=0) return;
  const {pos, vel, life, kind, NP}=Dr, y0=Dr.y, cx=Dr.cx, cz=Dr.cz;
  // (each frame a few drops leave each source: the jet, the ten rim nozzles, each bowl's lip; a drop that lands makes a little splash)
  const emit=(n, f)=>{ for(let k=0;k<n;k++){ const i=Dr.at; Dr.at=(Dr.at+1)%NP; f(i); } };
  const h=Math.min(dt, 0.05);
  const per=h*60;
  emit(Math.round(8*per), (i)=>{ pos[i*3]=cx+(Math.random()-0.5)*0.04; pos[i*3+1]=y0+2.95; pos[i*3+2]=cz+(Math.random()-0.5)*0.04;
    vel[i*3]=(Math.random()-0.5)*0.35; vel[i*3+1]=6.2+Math.random()*0.6; vel[i*3+2]=(Math.random()-0.5)*0.35; life[i]=2.5; kind[i]=0; });
  emit(Math.round(20*per), (i)=>{ const a=((Math.random()*10)|0)/10*Math.PI*2+0.314, rr=4.05;
    pos[i*3]=cx+Math.cos(a)*rr; pos[i*3+1]=y0+0.55; pos[i*3+2]=cz+Math.sin(a)*rr; const s=0.95+Math.random()*0.1;
    vel[i*3]=-Math.cos(a)*2.05*s; vel[i*3+1]=4.3*s; vel[i*3+2]=-Math.sin(a)*2.05*s; life[i]=2.5; kind[i]=0; });
  emit(Math.round(8*per), (i)=>{ const a=Math.random()*Math.PI*2, upper=Math.random()<0.4, rr=upper ? 0.82 : 1.53, yy=upper ? 2.75 : 1.73;
    pos[i*3]=cx+Math.cos(a)*rr; pos[i*3+1]=y0+yy; pos[i*3+2]=cz+Math.sin(a)*rr; vel[i*3]=Math.cos(a)*0.35; vel[i*3+1]=-0.1; vel[i*3+2]=Math.sin(a)*0.35; life[i]=2; kind[i]=0; });
  for(let i=0;i<NP;i++){ if(life[i]<=0) continue; life[i]-=h; vel[i*3+1]-=9.8*h; pos[i*3]+=vel[i*3]*h; pos[i*3+1]+=vel[i*3+1]*h; pos[i*3+2]+=vel[i*3+2]*h;
    const x=pos[i*3], z=pos[i*3+2], dd=Math.hypot(x-cx, z-cz), floor=dd<0.82 ? y0+2.73 : dd<1.5 ? y0+1.71 : y0+0.42;
    if(pos[i*3+1]<floor && vel[i*3+1]<0){ if(kind[i]===0 && Math.random()<0.35){ kind[i]=1; vel[i*3]*=0.2; vel[i*3+2]*=0.2; vel[i*3+1]=0.6+Math.random()*0.8; pos[i*3+1]=floor+0.01; life[i]=0.25; }
      else { life[i]=0; pos[i*3+1]=-999; } }
    if(life[i]<=0) pos[i*3+1]=-999; }
  Dr.pts.geometry.attributes.position.needsUpdate=true;
}
