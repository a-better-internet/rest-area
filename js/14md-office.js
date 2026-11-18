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

   One Hollow Road, by the lot, is French Creek Financial: brown brick,
   bands of smoked glass, a glass pyramid on the roof. Two Hollow Road, at
   the north side of the plaza, is Midland Mutual: five storeys of dark
   reflective glass on a black granite band, a steel canopy over the
   doors. Three Hollow Road, at the south side, is Lakeshore Data Systems:
   two long storeys of white precast and dark ribbon windows, a mirrored
   glass bay at the door.

   You can go in every one. Each has a lobby of polished stone (black and
   white marble at Midland, travertine at French Creek, pink granite at
   Lakeshore) with a brass-trimmed desk and somebody at it, leather
   sofas, ficus in planters, a felt-letter directory and a bank of brass
   elevator doors; and through the gap in the elevator wall the office:
   fabric cubicles in fours with beige terminals on the desks, a glass
   conference room with its long table, the copier, the water cooler.

   Everything here is made up here: the companies, the names, the art.

   PLAN (world): EAST.office (04): the site x 743..990, z -1862..-1690,
   graded level with the road and out to the shore; the mouth off Hollow
   Road z -1782..-1766; the lot x 750..806; One x 822..852, z -1795..
   -1755, its door west; Two x 860..912, z -1850..-1815, its door south;
   Three x 860..912, z -1735..-1702, its door north; the plaza between,
   the fountain at x 893, z -1775; the lawn to the water east of it.
   ---------------------------------------------------------------------- */
const OFFICE={routes:{}, lamps:[], water:null, spray:null, t:0};
(function officePark(){
  if(typeof EAST==="undefined" || !EAST.office) return;
  const E=EDIN, Y=E.y, O=EAST.office.site, M=EAST.office.mouth, Bq=EAST.beer, RX=Bq.rx, RW=3.4, END=Bq.end, LY=Y+PAVE_T+0.015;
  const FL=LY+0.05;                                         // (every ground floor: a step you do not notice up off the walk)
  OFFICE.FL=FL;
  const ME=[], r=_trng(1984);
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz);
  const S=(r0,x,y,z,c)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"800", family||"'Arial Black', Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const BRASS="#c8a050", GRAN="#2a2a2e";

  /* ---- the ground: Hollow Road from the pretzel works on north to its end, the mouth, the lot, the walks, the plaza ---- */
  { const road=SD_rect(RX-RW, RX+RW, END, -1660), mouth=SD_rect(RX+RW-0.6, 752, M.z0, M.z1), lot=SD_rect(750, 806, -1848, -1702),
      front=SD_rect(804, 822.05, -1800, -1750), nwalk=SD_rect(820, 856, -1804, -1798.5), swalk=SD_rect(820, 856, -1751.5, -1746),
      plaza=SD_rect(852, 936, -1812, -1738), lawnwalk=SD_rect(934, 968, -1777.5, -1772.5);
    push("lotpave", sdPaveGeo(sdUnion([road, mouth, lot, front, nwalk, swalk, plaza, lawnwalk], 3), RX-RW-1, 969, END, -1660, 0.5, 3), 0, LY, 0, 0, "#9a9a96");
    for(const b of [[RX+RW-0.6, 752, M.z0, M.z1],[750, 806, -1848, -1702],[804, 822.05, -1800, -1750],[820, 856, -1804, -1798.5],[820, 856, -1751.5, -1746],[852, 936, -1812, -1738],[934, 968, -1777.5, -1772.5]])
      addPaveRect(b[0], b[1], b[2], b[3], Y); }
  // the plaza laid in pale concrete squares, a dark joint round each (paint over the paving, 08's ladder), clear of the fountain's basin
  for(let x=852.2; x<935.9; x+=3.0) for(let z=-1811.8; z<-1738.1; z+=3.0){ const cx=x+1.45, cz=z+1.45; if(Math.hypot(cx-893, cz+1775)<4.9) continue;
    stripe(cx, z, cx, Math.min(z+2.9, -1738.05), Math.min(2.9, 935.95-x), (((x-852.2)/3+(z+1811.8)/3)|0)%2 ? "#b4b0a6" : "#aaa69c", LY); }
  // the lot's stalls: rows back to back down its length, kept six metres clear of the way in; islands with a lamp at the ends
  for(const [xa, xb] of [[750.3, 755.8],[762.0, 767.5],[767.5, 773.0],[779.5, 785.0],[785.0, 790.5],[797.0, 802.5]])
    for(const [z0, z1] of [[-1846.0, -1789.0],[-1759.0, -1704.0]]) for(let z=z0; z<=z1+0.01; z+=2.7) stripe(xa, z, xb, z, 0.1, WHITE_LINE, LY);
  if(typeof parked==="function"){ parked(0, "#8a8e92", 764.75, -1801.45, Math.PI/2, Y); parked(2, "#2a3a5a", 770.25, -1817.65, -Math.PI/2, Y);
    parked(1, "#c8b89a", 782.25, -1831.15, Math.PI/2, Y); parked(3, "#6a1a1a", 787.75, -1752.25, -Math.PI/2, Y); parked(0, "#e8e2d0", 753.05, -1744.15, -Math.PI/2, Y);
    parked(2, "#3a4a3a", 799.75, -1717.15, Math.PI/2, Y); }

  /* ---- the stone, the carpet, the ceiling: canvas textures made here ---- */
  const marble=(base, vein, tile, check)=>{ const t=signTex(512, 512, (c, W, H)=>{
      for(let i=0;i<2;i++) for(let j=0;j<2;j++){ c.fillStyle=check && (i+j)%2 ? check : base; c.fillRect(i*W/2, j*H/2, W/2, H/2); }
      for(let k=0;k<26;k++){ c.strokeStyle=vein; c.globalAlpha=0.18+((k*37)%10)/40; c.lineWidth=0.6+(k%3)*0.7; c.beginPath();
        let x=(k*97)%W, y=(k*53)%H; c.moveTo(x, y); for(let s=0;s<6;s++){ x+=((k*s*13)%60)-22; y+=40+(s*k)%30; c.lineTo(x, y); } c.stroke(); }
      c.globalAlpha=1; if(tile){ c.strokeStyle="rgba(0,0,0,0.25)"; c.lineWidth=2; c.strokeRect(1, 1, W/2-2, H/2-2); c.strokeRect(W/2+1, 1, W/2-2, H/2-2); c.strokeRect(1, H/2+1, W/2-2, H/2-2); c.strokeRect(W/2+1, H/2+1, W/2-2, H/2-2); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  const granite=(base, specks)=>{ const t=signTex(256, 256, (c, W, H)=>{ c.fillStyle=base; c.fillRect(0, 0, W, H);
      for(let i=0;i<2600;i++){ c.fillStyle=specks[i%specks.length]; c.fillRect((i*131.7)%W, (i*71.3+i*0.37)%H, 1+(i%3), 1+(i%2)); }
      c.strokeStyle="rgba(0,0,0,0.25)"; c.lineWidth=2; c.strokeRect(1, 1, W-2, H-2); });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  const STONE={A:marble("#e8e6e0", "#4a4a50", true, "#1a1a1e"), B:marble("#d8c8a8", "#a88a5a", true), C:granite("#c89a8a", ["#7a4a4a","#e8d0c8","#3a2a2a","#a87a6a"])};
  const CEILT=signTex(128, 128, (c, W, H)=>{ c.fillStyle="#e8e6de"; c.fillRect(0, 0, W, H); c.fillStyle="rgba(0,0,0,0.08)"; for(let i=0;i<220;i++) c.fillRect((i*37)%W, (i*91)%H, 2, 2);
    c.fillStyle="#b8b6ae"; c.fillRect(0, 0, W, 3); c.fillRect(0, 0, 3, H); });
  CEILT.wrapS=CEILT.wrapT=T.RepeatWrapping;
  const floorPlane=(x0, x1, z0, z1, y, tex, rep)=>{ const t=tex.clone(); t.needsUpdate=true; t.repeat.set((x1-x0)/rep, (z1-z0)/rep);
    const m=new T.Mesh(new T.PlaneGeometry(x1-x0, z1-z0), new T.MeshStandardMaterial({map:t, roughness:0.22, metalness:0.05}));
    m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2, y, (z0+z1)/2); m.receiveShadow=true; m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); return m; };
  const ceilPlane=(x0, x1, z0, z1, y)=>{ const t=CEILT.clone(); t.needsUpdate=true; t.repeat.set((x1-x0)/0.61, (z1-z0)/0.61);
    const m=new T.Mesh(new T.PlaneGeometry(x1-x0, z1-z0), new T.MeshStandardMaterial({map:t, roughness:0.95}));
    m.rotation.x=Math.PI/2; m.position.set((x0+x1)/2, y, (z0+z1)/2); m.updateMatrix(); m.matrixAutoUpdate=false; scene.add(m); };

  /* ---- a wall with its openings, and glass in them ---- */
  const runW=(bk, col, ax, c0, c1, a, b, y0, y1, ops)=>{ let u=a;
    const piece=(p, q, h0, h1)=>{ if(q-p<0.005 || h1-h0<0.005) return; if(ax==="x") wallBox(bk, p, q, c0, c1, h0, h1, col, 0.6, FL); else wallBox(bk, c0, c1, p, q, h0, h1, col, 0.6, FL); };
    for(const o of ops.slice().sort((m, n)=>m.a-n.a)){ piece(u, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); u=o.b; }
    piece(u, b, y0, y1); };
  const glaze=(ax, cm, o, frame)=>{ const w=o.b-o.a, h=o.head-o.sill, mid=(o.a+o.b)/2, y=(o.sill+o.head)/2;
    if(ax==="x"){ push("glass", planeGeo(w-0.02, h-0.02, 0), mid, y, cm, 0, "#ffffff"); for(let k=1;k<Math.round(w/1.6);k++) B(0.06, h, 0.1, o.a+k*w/Math.round(w/1.6), y, cm, frame); }
    else { push("glass", planeGeo(w-0.02, h-0.02, 0), cm, y, mid, Math.PI/2, "#ffffff"); for(let k=1;k<Math.round(w/1.6);k++) B(0.1, h, 0.06, cm, y, o.a+k*w/Math.round(w/1.6), frame); } };

  /* ---- a building's interior, laid out in its own frame: u across the front from its middle, v in from the front wall ---- */
  // (side: the face the door is in; o: the middle of that wall's inner face)
  const frame=(side, ox, oz)=>{
    if(side==="s") return {P:(u, v)=>[ox+u, oz-v], swap:false, ry:0};
    if(side==="n") return {P:(u, v)=>[ox-u, oz+v], swap:false, ry:Math.PI};
    if(side==="w") return {P:(u, v)=>[ox+v, oz+u], swap:true, ry:-Math.PI/2};
    return {P:(u, v)=>[ox-v, oz-u], swap:true, ry:Math.PI/2}; };
  function fitout(F, W, D, st){
    const LB=(uw, h, vd, u, y, v, c)=>{ const [x, z]=F.P(u, v); B(F.swap ? vd : uw, h, F.swap ? uw : vd, x, y, z, c); };
    const LRB=(uw, h, vd, u, y, v, c, rad)=>{ const [x, z]=F.P(u, v); RB(F.swap ? vd : uw, h, F.swap ? uw : vd, x, y, z, c, 0, rad); };
    const LCOL=(u0, u1, v0, v1, y0, y1)=>{ const a=F.P(u0, v0), b=F.P(u1, v1); addCol(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1]), y0, y1); };
    const LP=(u, v)=>F.P(u, v), CH=FL+3.2, LV=Math.min(10, D*0.38);
    // the lobby: the desk and the one at it, two sofas and a table, ficus in the corners, the directory, the elevators
    { const du=W*0.2, dv=LV*0.55;
      LRB(3.8, 1.05, 0.8, du, FL+0.525, dv, st.desk, 0.03); LRB(3.96, 0.05, 0.96, du, FL+1.08, dv-0.05, st.top, 0.015);
      LB(3.84, 0.06, 0.02, du, FL+0.9, dv-0.415, BRASS); LCOL(du-1.95, du+1.95, dv-0.5, dv+0.45, FL-0.5, FL+1.1);
      { const [x, z]=LP(du+0.6, dv+0.15), fy=F.ry+Math.PI; RB(0.36, 0.3, 0.32, x, FL+1.26, z, "#d8d0bc", fy, 0.03); push("lk_tvon", planeGeo(0.26, 0.18, 0), x+Math.sin(fy)*0.165, FL+1.28, z+Math.cos(fy)*0.165, fy, "#ffffff"); }
      st.desk_at=LP(du, dv+1.0);
      for(const [sv, face] of [[2.4, 1],[5.6, -1]]){ const su=-W*0.24, [x, z]=LP(su, sv), ry=F.ry+(face>0 ? Math.PI : 0);
        const fx=XF(x, z, ry), q=(w, h, d, lx, ly, lz, c)=>RB(w, h, d, fx.x(lx, lz), FL+ly, fx.z(lx, lz), c, ry, 0.05);
        q(2.2, 0.42, 0.85, 0, 0.21, 0, st.sofa); q(2.2, 0.5, 0.2, 0, 0.62, -0.34, st.sofa); for(const s of [-1, 1]) q(0.2, 0.62, 0.85, s*1.0, 0.31, 0, st.sofa);
        for(const s of [-1, 1]) C(0.02, 0.12, fx.x(s*0.95, 0.3), FL+0.06, fx.z(s*0.95, 0.3), "#c8ccd0", 8);
        const a=LP(su-1.15, sv-0.45), b=LP(su+1.15, sv+0.45); addCol(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1]), FL-0.5, FL+0.6);
        for(const du2 of [-0.6, 0.6]){ const p=LP(su+du2, sv+face*0.05); addSeat(p[0], p[1], FL, ry+Math.PI, "A SOFA IN THE LOBBY"); } }
      { const [x, z]=LP(-W*0.24, 4.0); RB(1.2, 0.04, 0.7, x, FL+0.42, z, "#1a1a1e", F.ry, 0.01); for(const s of [-1, 1]) B(F.swap ? 0.6 : 0.04, 0.4, F.swap ? 0.04 : 0.6, x+(F.swap ? 0 : s*0.55), FL+0.2, z+(F.swap ? s*0.55 : 0), "#c8ccd0");
        addCol(x-0.62, x+0.62, z-0.62, z+0.62, FL-0.5, FL+0.44); }
      for(const [pu, pv] of [[-W/2+0.9, 0.9],[W/2-0.9, 0.9],[-3.0, LV-0.9],[3.0, LV-0.9]]){ const [x, z]=LP(pu, pv);
        RB(0.7, 0.62, 0.7, x, FL+0.31, z, st.planter, 0, 0.04); C(0.04, 1.1, x, FL+1.1, z, "#5a4430", 8);
        for(let k=0;k<7;k++){ const a=k*0.9, rr=0.2+(k%3)*0.08; S(0.26, x+Math.cos(a)*rr, FL+1.45+(k%3)*0.22, z+Math.sin(a)*rr, k%2 ? "#3a5a2a" : "#2e4a22"); }
        addCol(x-0.36, x+0.36, z-0.36, z+0.36, FL-0.5, FL+0.65); }
    }
    // the elevator wall across the lobby's back, a gap through it in the middle to the office; two elevators, their call buttons, the directory
    { const v=LV, t=0.2, h=CH-FL+0.02;
      for(const [a, b] of [[-W/2, -1.4],[1.4, W/2]]){ LB(b-a, h, t, (a+b)/2, FL+h/2, v+t/2, st.wall); LCOL(a, b, v, v+t, FL-0.5, FL+h); }
      for(const u of [-1.45, 1.45]) LB(0.08, 2.5, t+0.06, u, FL+1.25, v+t/2, BRASS); LB(2.98, 0.08, t+0.06, 0, FL+2.54, v+t/2, BRASS);
      for(const u of [-4.2, 4.2]){ LB(1.3, 2.3, 0.04, u, FL+1.15, v-0.02, "#b8964a"); LB(0.012, 2.25, 0.05, u, FL+1.15, v-0.02, "#8a6a2a");
        LB(1.5, 0.12, 0.05, u, FL+2.36, v-0.025, BRASS); LB(1.5, 0.16, 0.03, u, FL+2.52, v-0.015, "#1a1a1e");
        LB(0.1, 0.22, 0.03, u+0.95, FL+1.15, v-0.015, BRASS); }
      st.lift=LP(4.2, v-0.6);
      // the directory: black felt, white letters, a brass frame
      { const [x, z]=LP(-8.0, v-0.03); LB(1.5, 1.1, 0.04, -8.0, FL+1.6, v-0.02, BRASS);
        sign(1.4, 1.0, (c, Wd, Hh)=>{ c.fillStyle="#141416"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="rgba(255,255,255,0.05)"; for(let y=0;y<Hh;y+=6) c.fillRect(0, y, Wd, 2);
            say(c, st.name, Wd/2, Hh*0.12, Wd*0.8, Hh*0.09, "#f2f0ea", "700", "Arial");
            st.tenants.forEach((n, k)=>{ say(c, n[0], Wd*0.45, Hh*(0.27+k*0.1), Wd*0.62, Hh*0.06, "#f2f0ea", "600", "'Courier New', monospace"); say(c, n[1], Wd*0.86, Hh*(0.27+k*0.1), Wd*0.16, Hh*0.06, "#f2f0ea", "600", "'Courier New', monospace"); }); },
          x+Math.sin(F.ry)*0.025, FL+1.6, z+Math.cos(F.ry)*0.025, F.ry, false, 420); } }
    // the office: cubicles in fours, a glass conference room in the far corner, the copier and the water cooler by the way in
    { const v0=LV+0.2, cu0=W/2-8.5, cv0=D-6.6;
      // the conference room: glass on its two open sides (a door left in one), the long table and its chairs, a whiteboard
      { const gh=CH-FL-0.02;
        for(const [a, b] of [[cu0, cu0+1.6],[cu0+2.6, W/2]]){ const [x, z]=LP((a+b)/2, cv0); push("glass", planeGeo(b-a-0.04, gh-0.04, 0), x, FL+gh/2, z, F.ry, "#ffffff");
          LB(b-a, 0.06, 0.08, (a+b)/2, FL+0.03, cv0, "#8a8e90"); LB(b-a, 0.06, 0.08, (a+b)/2, CH-0.03, cv0, "#8a8e90"); LCOL(a, b, cv0-0.04, cv0+0.04, FL-0.5, CH); }
        for(const u of [cu0+1.6, cu0+2.6]) LB(0.06, gh, 0.1, u, FL+gh/2, cv0, "#8a8e90");
        { const [x, z]=LP(cu0, (cv0+D)/2); push("glass", planeGeo(D-cv0-0.04, gh-0.04, 0), x, FL+gh/2, z, F.ry+Math.PI/2, "#ffffff"); LB(0.08, 0.06, D-cv0, cu0, FL+0.03, (cv0+D)/2, "#8a8e90"); LCOL(cu0-0.04, cu0+0.04, cv0, D, FL-0.5, CH); }
        const tu=(cu0+W/2)/2, tv=(cv0+D)/2;
        LRB(1.4, 0.05, 4.0, tu, FL+0.74, tv, st.desk, 0.02); LB(0.5, 0.72, 2.6, tu, FL+0.36, tv, "#3a3a3a"); LCOL(tu-0.72, tu+0.72, tv-2.02, tv+2.02, FL-0.5, FL+0.78);
        for(let k=0;k<4;k++) for(const s of [-1, 1]){ const [x, z]=LP(tu+s*1.05, tv-1.5+k*1.0); RB(0.5, 0.5, 0.5, x, FL+0.25, z, st.chair, 0, 0.06); RB(0.5, 0.55, 0.1, x+(F.swap ? 0 : s*0.25), FL+0.75, z+(F.swap ? s*0.25 : 0), st.chair, 0, 0.04); }
        { const [x, z]=LP(tu, D-0.03); LB(2.4, 1.2, 0.04, tu, FL+1.5, D-0.03, "#f4f4f0"); LB(2.5, 0.06, 0.08, tu, FL+0.88, D-0.05, "#8a8e90"); } }
      // the cubicles: four to a cluster, fabric panels shoulder high, a desk and a terminal in each
      for(let cu=-W/2+3.2; cu<W/2-3; cu+=7.0) for(let cv=v0+3.4; cv<D-3; cv+=7.0){
        if(Math.abs(cu)<4.4) continue; if(cu+3>cu0-0.6 && cv+3>cv0-0.6) continue;
        const ph=1.45;
        LB(5.6, ph, 0.06, cu, FL+ph/2, cv-2.8, st.fabric); LB(5.6, ph, 0.06, cu, FL+ph/2, cv+2.8, st.fabric);
        LB(0.06, ph, 5.6, cu-2.8, FL+ph/2, cv, st.fabric); LB(0.06, ph, 5.6, cu, FL+ph/2, cv, st.fabric); LB(5.6, ph, 0.06, cu, FL+ph/2, cv, st.fabric);
        LB(0.06, ph, 2.0, cu+2.8, FL+ph/2, cv-1.8, st.fabric); LB(0.06, ph, 2.0, cu+2.8, FL+ph/2, cv+1.8, st.fabric);
        for(const [a, b] of [[-2.83, 2.83]]) for(const vv of [cv-2.8, cv, cv+2.8]) LB(5.66, 0.04, 0.08, cu, FL+ph+0.02, vv, "#8a8e90");
        LCOL(cu-2.84, cu+0.04, cv-2.84, cv+2.84, FL-0.5, FL+ph); LCOL(cu+0.04, cu+2.84, cv-2.84, cv-0.8, FL-0.5, FL+ph); LCOL(cu+0.04, cu+2.84, cv+0.8, cv+2.84, FL-0.5, FL+ph);
        for(const [qu, qv] of [[-1.4, -1.4],[1.4, -1.4],[-1.4, 1.4],[1.4, 1.4]]){ const du=cu+qu, dv=cv+qv;
          LRB(2.4, 0.04, 0.75, du, FL+0.74, dv+(qv<0 ? -0.95 : 0.95), st.desk, 0.01);
          const [mx, mz]=LP(du, dv+(qv<0 ? -1.0 : 1.0)), fy=F.ry+(qv<0 ? Math.PI : 0);
          RB(0.4, 0.34, 0.38, mx, FL+0.95, mz, "#d8d0bc", fy, 0.04); push("lk_tvon", planeGeo(0.28, 0.2, 0), mx+Math.sin(fy)*0.193, FL+0.97, mz+Math.cos(fy)*0.193, fy, "#ffffff");
          const [kx, kz]=LP(du, dv+(qv<0 ? -0.62 : 0.62)); RB(0.42, 0.03, 0.15, kx, FL+0.775, kz, "#c8c0ac", fy, 0.008);
          const [cx, cz]=LP(du+0.2, dv+(qv<0 ? -0.1 : 0.1)); C(0.25, 0.04, cx, FL+0.03, cz, "#2a2a2a", 5); C(0.025, 0.36, cx, FL+0.22, cz, "#8a8e90", 8); RB(0.46, 0.08, 0.44, cx, FL+0.46, cz, st.chair, fy, 0.03);
          if(r()<0.4 && st.sitters.length<4) st.sitters.push({x:cx, z:cz, yaw:fy+Math.PI}); } }
      // the copier, the water cooler, a coat rack by the way in from the lobby
      { const [x, z]=LP(-4.0, v0+0.6); RB(1.0, 1.0, 0.65, x, FL+0.5, z, "#d8d4c8", F.ry, 0.04); RB(1.0, 0.1, 0.65, x, FL+1.05, z, "#b8b4a8", F.ry, 0.02); addCol(x-0.55, x+0.55, z-0.55, z+0.55, FL-0.5, FL+1.1); }
      { const [x, z]=LP(1.2, v0+0.4); B(0.34, 0.95, 0.34, x, FL+0.475, z, "#e8e4d8"); C(0.15, 0.42, x, FL+1.16, z, "#9ac8e8", 14); addCol(x-0.2, x+0.2, z-0.2, z+0.2, FL-0.5, FL+1.4); }
      // a poster on the elevator wall's back: the kind every office had
      { const [x, z]=LP(-6.0, v0+0.015);
        sign(0.8, 1.05, (c, Wd, Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0, 0, Wd, Hh); c.fillStyle=st.poster[1]; c.fillRect(Wd*0.08, Hh*0.08, Wd*0.84, Hh*0.6);
            c.fillStyle="#f4f2ec"; c.beginPath(); c.moveTo(Wd*0.2, Hh*0.62); c.lineTo(Wd*0.5, Hh*0.2); c.lineTo(Wd*0.8, Hh*0.62); c.fill();
            say(c, st.poster[0], Wd/2, Hh*0.78, Wd*0.8, Hh*0.09, "#f4f2ec", "700", "Georgia, serif"); say(c, st.poster[2], Wd/2, Hh*0.89, Wd*0.8, Hh*0.04, "#c8c4b8", "400", "Georgia, serif"); },
          x, FL+1.6, z, F.ry+Math.PI, false, 240); } }
    // the drop ceiling, its lights, two lamps in the pool
    { const a=LP(-W/2, 0), b=LP(W/2, D); ceilPlane(Math.min(a[0], b[0]), Math.max(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[1], b[1]), CH);
      for(let u=-W/2+2; u<W/2-1; u+=3.6) for(let v=1.8; v<D-1; v+=3.6){ const [x, z]=LP(u, v); push("tube", boxGeo(F.swap ? 1.2 : 0.6, 0.02, F.swap ? 0.6 : 1.2, 0), x, CH-0.012, z, 0, "#ffffff"); }
      for(const [u, v] of [[0, LV*0.5],[0, (LV+D)/2]]){ const [x, z]=LP(u, v); LAMPS.push({x:x, y:CH-0.3, z:z, color:0xfff4e6, intensity:0.7, dist:16, decay:1.5, indoor:true}); } }
  }

  /* ---- the three buildings ---- */
  function building(K){
    const {x0, x1, z0, z1, side, WT}=K, H=K.FH0+K.FHU*(K.floors-1), top=FL+H, ox=side==="s" || side==="n" ? (x0+x1)/2 : (side==="w" ? x0+WT : x1-WT), oz=side==="w" || side==="e" ? (z0+z1)/2 : (side==="s" ? z1-WT : z0+WT);
    const F=frame(side, ox, oz), W=(side==="s" || side==="n" ? x1-x0 : z1-z0)-2*WT, D=(side==="s" || side==="n" ? z1-z0 : x1-x0)-2*WT;
    // the slab, its edge, the floor of stone, the walkable floor
    B(x1-x0+0.1, FL-(LY-0.2), z1-z0+0.1, (x0+x1)/2, (FL+LY-0.2)/2-0.006, (z0+z1)/2, "#8a8680");
    floorPlane(x0+WT, x1-WT, z0+WT, z1-WT, FL, STONE[K.id], K.id==="C" ? 0.6 : 1.2);
    addFlat(x0, x1, z0, z1, FL);
    const dc=K.dc;                                    // (the door's middle along the front)
    const DOP={a:dc-1.0, b:dc+1.0, sill:FL-0.3, head:FL+2.4};
    // the ground floor's walls and windows, by kind; the storeys over it a solid with its skin
    const G=FL+K.FH0;
    const opsAlong=(a, b, pitch, ww, sill, head, skip)=>{ const L=[]; for(let c=a+pitch/2; c<b-pitch/2+0.01; c+=pitch) if(!skip || Math.abs(c-skip)>ww/2+1.4) L.push({a:c-ww/2, b:c+ww/2, sill:sill, head:head}); return L; };
    const sides=[["x", z0, z0+WT, x0, x1, "n"],["x", z1-WT, z1, x0, x1, "s"],["z", x0, x0+WT, z0+WT, z1-WT, "w"],["z", x1-WT, x1, z0+WT, z1-WT, "e"]];
    for(const [ax, c0, c1, a, b, sd] of sides){
      const front=sd===side, ops=K.glassBox ? [] : opsAlong(a, b, K.pitch, K.win, FL+0.75, FL+3.0, front ? dc : null);
      if(front) ops.push(DOP);
      if(K.glassBox){
        // (Two: the ground floor all glass between dark mullions, a granite band over it; its colliders the glass line's)
        const cm=(c0+c1)/2, n=Math.round((b-a)/2.6);
        for(let k=0;k<n;k++){ const pa=a+k*(b-a)/n, pb=a+(k+1)*(b-a)/n; if(front && pb>dc-1.05 && pa<dc+1.05){
            if(pa<dc-1.05) push("glass", planeGeo(dc-1.05-pa-0.02, 3.0, 0), ax==="x" ? (pa+dc-1.05)/2 : cm, FL+1.55, ax==="x" ? cm : (pa+dc-1.05)/2, ax==="x" ? 0 : Math.PI/2, "#ffffff");
            if(pb>dc+1.05) push("glass", planeGeo(pb-dc-1.05-0.02, 3.0, 0), ax==="x" ? (pb+dc+1.05)/2 : cm, FL+1.55, ax==="x" ? cm : (pb+dc+1.05)/2, ax==="x" ? 0 : Math.PI/2, "#ffffff");
            continue; }
          push("glass", planeGeo(pb-pa-0.02, 3.0, 0), ax==="x" ? (pa+pb)/2 : cm, FL+1.55, ax==="x" ? cm : (pa+pb)/2, ax==="x" ? 0 : Math.PI/2, "#ffffff"); }
        for(let k=0;k<=n;k++){ const p=a+k*(b-a)/n; if(ax==="x") B(0.12, 3.1, WT+0.04, p, FL+1.55, cm, "#1a1e22"); else B(WT+0.04, 3.1, 0.12, cm, FL+1.55, p, "#1a1e22"); }
        if(ax==="x"){ B(b-a+0.02, 0.1, WT+0.06, (a+b)/2, FL+0.05, cm, "#1a1e22"); } else B(WT+0.06, 0.1, b-a+0.02, cm, FL+0.05, (a+b)/2, "#1a1e22");
        wallBox("block", ax==="x" ? a : c0, ax==="x" ? b : c1, ax==="x" ? c0 : a, ax==="x" ? c1 : b, FL+3.1, G, GRAN, 0.6, FL);
        // (the glass line is solid but where the doors are)
        if(front){ if(ax==="x"){ addCol(a, dc-1.0, c0, c1, FL-0.5, G); addCol(dc+1.0, b, c0, c1, FL-0.5, G); } else { addCol(c0, c1, a, dc-1.0, FL-0.5, G); addCol(c0, c1, dc+1.0, b, FL-0.5, G); } }
        else if(ax==="x") addCol(a, b, c0, c1, FL-0.5, G); else addCol(c0, c1, a, b, FL-0.5, G); }
      else {
        runW(K.bk, K.col, ax, c0, c1, a, b, FL-0.05, G, ops);
        for(const o of ops){ if(o===DOP) continue; glaze(ax, (c0+c1)/2, o, K.frame); } } }
    // the doors: a pair of store doors in the opening
    { const L=side==="s" || side==="n" ? [[dc-0.98, 0],[dc+0.98, Math.PI]] : [[dc-0.98, -Math.PI/2],[dc+0.98, Math.PI/2]];
      const cm=side==="s" ? z1-WT/2 : side==="n" ? z0+WT/2 : side==="w" ? x0+WT/2 : x1-WT/2;
      for(const [h, ry] of L){ if(side==="s" || side==="n") makeDoor(XF(h, cm, ry), 0, FL+0.01, 0, K.name, side==="n", 0, "store");
        else makeDoor(XF(cm, h, ry), 0, FL+0.01, 0, K.name, side==="e", 0, "store"); } }
    // the storeys over: a solid, its skin (the kind's), the bands of tinted glass, the parapet's coping
    const hx=(x1-x0)/2, hz=(z1-z0)/2, cx=(x0+x1)/2, cz=(z0+z1)/2;
    if(K.id==="A"){
      B(x1-x0-0.04, H-K.FH0, z1-z0-0.04, cx, G+(H-K.FH0)/2, cz, "#141a20");
      for(let f=1; f<K.floors; f++){ const y0=FL+K.FH0+(f-1)*K.FHU;
        for(const [ax, c, a, b, ry] of [["x", z0-0.012, x0, x1, 0],["x", z1+0.012, x0, x1, Math.PI],["z", x0-0.012, z0, z1, -Math.PI/2],["z", x1+0.012, z0, z1, Math.PI/2]]){
          const n=Math.round((b-a)/2.6);
          for(let k=0;k<n;k++){ const m=a+(k+0.5)*(b-a)/n; push("tint", boxGeo((b-a)/n-0.14, K.FHU-0.9, 0.03), ax==="x" ? m : c, y0+0.45+(K.FHU-0.9)/2, ax==="x" ? c : m, ax==="x" ? 0 : Math.PI/2, "#8aa0b0"); }
          for(let k=0;k<=n;k++){ const m=a+k*(b-a)/n; if(ax==="x") B(0.1, K.FHU, 0.06, m, y0+K.FHU/2, c, "#20262c"); else B(0.06, K.FHU, 0.1, c, y0+K.FHU/2, m, "#20262c"); }
          if(ax==="x") B(b-a+0.06, 0.45, 0.05, (a+b)/2, y0+0.225, c, "#20262c"); else B(0.05, 0.45, b-a+0.06, c, y0+0.225, (a+b)/2, "#20262c"); } }
      B(x1-x0+0.16, 0.5, z1-z0+0.16, cx, top+0.25, cz, "#20262c");
      // the canopy over the doors: a steel frame with glass on it, on two round columns
      { const [dx, dz]=[dc, z1]; B(6.0, 0.12, 3.2, dx, FL+3.3, dz+1.6, "#2a2e32"); push("glass", boxGeo(5.6, 0.03, 2.9), dx, FL+3.385, dz+1.6, 0, "#ffffff");
        for(const s of [-1, 1]){ C(0.1, 3.3, dx+s*2.7, FL+1.65, dz+3.0, "#2a2e32", 12); addCol(dx+s*2.7-0.11, dx+s*2.7+0.11, dz+2.89, dz+3.11, FL-0.5, FL+3.3); }
        addRoof(dx-3, dx+3, dz, dz+3.2, FL+3.36); }
      sign(14, 1.1, (c, Wd, Hh)=>{ c.fillStyle=GRAN; c.fillRect(0, 0, Wd, Hh); say(c, "MIDLAND MUTUAL", Wd/2, Hh/2, Wd*0.8, Hh*0.56, "#d8b868", "700", "Optima, Palatino, 'Palatino Linotype', serif"); },
        dc, FL+3.65, z1+0.012, 0, false, 1680); }
    else {
      // (One and Three: the storeys' walls the kind's material over a dark solid, a band of glass at each storey's window height)
      B(x1-x0-2*WT+0.04, H-K.FH0-0.3, z1-z0-2*WT+0.04, cx, G+(H-K.FH0-0.3)/2, cz, "#1a1c20");          // (up to the roof's slab, which caps it)
      for(const [ax, c0, c1, a, b] of sides){
        const bands=[]; for(let f=1; f<K.floors; f++){ const y0=FL+K.FH0+(f-1)*K.FHU; bands.push({y0:y0, s:y0+K.bandS, h:y0+K.bandH}); }
        let y=G; for(const bd of bands){ if(ax==="x") wallBox(K.bk, a, b, c0, c1, y, bd.s, K.col, 0.6, FL); else wallBox(K.bk, c0, c1, a, b, y, bd.s, K.col, 0.6, FL);
          const cm=(c0+c1)/2, ry=ax==="x" ? 0 : Math.PI/2;
          push("tint", boxGeo(b-a-0.3, bd.h-bd.s, 0.04), ax==="x" ? (a+b)/2 : cm, (bd.s+bd.h)/2, ax==="x" ? cm : (a+b)/2, ry, "#7a8a8a");
          for(let m=a+3.0; m<b-1.0; m+=3.0) if(ax==="x") B(0.08, bd.h-bd.s, WT-0.06, m, (bd.s+bd.h)/2, cm, K.frame); else B(WT-0.06, bd.h-bd.s, 0.08, cm, (bd.s+bd.h)/2, m, K.frame);
          // (the ends of the band: the wall's, so its jambs are the wall's)
          if(ax==="x"){ wallBox(K.bk, a, a+0.15, c0, c1, bd.s, bd.h, K.col, 0.6, FL); wallBox(K.bk, b-0.15, b, c0, c1, bd.s, bd.h, K.col, 0.6, FL); }
          else { wallBox(K.bk, c0, c1, a, a+0.15, bd.s, bd.h, K.col, 0.6, FL); wallBox(K.bk, c0, c1, b-0.15, b, bd.s, bd.h, K.col, 0.6, FL); }
          y=bd.h; }
        if(ax==="x") wallBox(K.bk, a, b, c0, c1, y, top+0.9, K.col, 0.6, FL); else wallBox(K.bk, c0, c1, a, b, y, top+0.9, K.col, 0.6, FL); }
      for(const zc of [z0+WT/2, z1-WT/2]) B(x1-x0+0.08, 0.08, WT+0.1, cx, top+0.94, zc, K.cap);
      for(const xc of [x0+WT/2, x1-WT/2]) B(WT+0.08, 0.08, z1-z0-2*WT-0.1, xc, top+0.94, cz, K.cap);
      B(x1-x0-2*WT+0.04, 0.3, z1-z0-2*WT+0.04, cx, top-0.15, cz, "#9a968c");
      if(K.id==="B"){
        // the pyramid: a skylight of smoked glass on a steel frame, over the middle of the roof
        const ph=3.2, pr=5.0, pc=V3(cx, top, cz);
        const pg=new T.ConeGeometry(pr*Math.SQRT2, ph, 4, 1, true); pg.rotateY(Math.PI/4);
        const pm=new T.Mesh(pg, new T.MeshStandardMaterial({color:0x5a6a6a, metalness:0.6, roughness:0.15, transparent:true, opacity:0.75})); pm.position.set(cx, top+ph/2+0.02, cz); pm.updateMatrix(); pm.matrixAutoUpdate=false; scene.add(pm);
        for(const [sx, sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]){ const a=V3(cx+sx*pr, top+0.02, cz+sz*pr), b=V3(cx, top+ph+0.02, cz), d=b.clone().sub(a), L=d.length();
          ME.push({geo:boxGeo(0.12, L, 0.12), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#2a2e32")}); }
        B(2*pr+0.2, 0.2, 2*pr+0.2, cx, top+0.1, cz, "#2a2e32"); }
      // the name over the door
      { const fy=side==="w" ? -Math.PI/2 : side==="n" ? Math.PI : side==="e" ? Math.PI/2 : 0;
        const fx=side==="w" ? x0-0.03 : side==="e" ? x1+0.03 : dc, fz=side==="n" ? z0-0.03 : side==="s" ? z1+0.03 : dc;
        sign(10, 0.9, (c, Wd, Hh)=>{ c.fillStyle=K.col; c.fillRect(0, 0, Wd, Hh); say(c, K.name, Wd/2, Hh/2, Wd*0.8, Hh*0.55, K.letters, "700", K.font); },
          fx, K.signY, fz, fy, false, 1200);
        if(side==="w") B(0.02, 1.0, 10.1, x0-0.01, K.signY, dc, K.col); else if(side==="n") B(10.1, 1.0, 0.02, dc, K.signY, z0-0.01, K.col); }
      // Three's mirrored bay at the door: a glass box out from the front, the doors in its face
      if(K.bay){ const by=FL, bd=2.6;
        // (its glass dark and mirrored, a box a few centimetres thick, so it reads from inside the bay as well as out)
        for(const s of [-1, 1]){ push("tint", boxGeo(0.04, 3.4, bd-0.02), dc+s*3.0, by+1.7, z0-bd/2, 0, "#4a5a60"); addCol(dc+s*3.0-0.06, dc+s*3.0+0.06, z0-bd, z0, FL-0.5, FL+3.5); }
        for(const s of [-1, 1]) push("tint", boxGeo(1.9, 3.4, 0.04), dc+s*2.05, by+1.7, z0-bd, 0, "#4a5a60");
        push("tint", boxGeo(2.2, 1.0, 0.04), dc, by+2.9, z0-bd, 0, "#4a5a60");
        for(const x of [dc-3.0, dc-1.1, dc+1.1, dc+3.0]) B(0.08, 3.42, 0.08, x, by+1.71, z0-bd, "#2a2e32");
        addCol(dc-3.0, dc-1.1, z0-bd-0.06, z0-bd+0.06, FL-0.5, FL+3.5); addCol(dc+1.1, dc+3.0, z0-bd-0.06, z0-bd+0.06, FL-0.5, FL+3.5);
        B(6.2, 0.2, bd+0.1, dc, FL+3.5, z0-bd/2, "#e8e4d8"); B(6.2, 0.05, bd, dc, FL-0.02, z0-bd/2, "#b8b4aa"); addFlat(dc-3.0, dc+3.0, z0-bd, z0, FL);
        addZone(dc-3.0, dc+3.0, z0-bd, z0, FL-0.5, FL+3.4, K.name+" · THE BAY", true); } }
    const st={name:K.name, tenants:K.tenants, desk:K.desk, top:K.top, sofa:K.sofa, planter:K.planter, wall:K.wall, fabric:K.fabric, chair:K.chair, poster:K.poster, sitters:[]};
    fitout(F, W, D, st);
    K.st=st; K.F=F;
    return K; }

  const ONE=building({id:"B", name:"FRENCH CREEK FINANCIAL", x0:822, x1:852, z0:-1795, z1:-1755, side:"w", dc:-1775, WT:0.3, signY:FL+3.6, floors:3, FH0:4.2, FHU:3.6,
    bk:"brick", col:"#8a5a42", frame:"#2a2420", cap:"#5a4a3e", pitch:3.6, win:2.4, bandS:0.9, bandH:2.6, letters:"#e8d8b8", font:"Optima, Palatino, serif",
    desk:"#5a3a22", top:"#d8c8a8", sofa:"#5a2a1a", planter:"#b8a888", wall:"#c8b89a", fabric:"#b8a888", chair:"#5a4a3e",
    poster:["PERSEVERANCE", "#3a5a7a", "THE SUMMIT IS EARNED ONE STEP AT A TIME"],
    tenants:[["FRENCH CREEK FINANCIAL", "100"],["ALLEGHENY TITLE & ABSTRACT", "210"],["KOVACH, REESE & PARTNERS", "220"],["DR. L. ANTONELLI, D.D.S.", "300"],["ERIE VALLEY TRAVEL", "310"]]});
  const TWO=building({id:"A", name:"MIDLAND MUTUAL", x0:860, x1:912, z0:-1850, z1:-1815, side:"s", dc:886, WT:0.25, floors:5, FH0:4.4, FHU:3.7, glassBox:true,
    desk:"#1a1a1e", top:"#e8e6e0", sofa:"#1a1a1a", planter:"#e8e6e0", wall:"#d8d6d0", fabric:"#6a7a8a", chair:"#2a2a2e",
    poster:["TEAMWORK", "#7a2a2a", "TOGETHER EVERYONE ACHIEVES MORE"],
    tenants:[["MIDLAND MUTUAL INSURANCE", "1-4"],["MIDLAND MUTUAL · CLAIMS", "2"],["MIDLAND MUTUAL · UNDERWRITING", "3"],["NORTHCOAST PAYROLL INC.", "5"],["THE EXECUTIVE SUITE", "5"]]});
  const THREE=building({id:"C", name:"LAKESHORE DATA SYSTEMS", x0:860, x1:912, z0:-1735, z1:-1702, side:"n", dc:886, WT:0.3, signY:FL+4.55, floors:2, FH0:4.2, FHU:3.8, bay:true,
    bk:"concrete", col:"#d8d4c8", frame:"#3a3e42", cap:"#b8b4aa", pitch:3.0, win:2.4, bandS:0.8, bandH:2.9, letters:"#3a6a7a", font:"'Avenir Next', 'Trebuchet MS', sans-serif",
    desk:"#e8e2d4", top:"#c89a8a", sofa:"#5a7a7a", planter:"#c89a8a", wall:"#d8c8c8", fabric:"#8a6a7a", chair:"#3a6a6a",
    poster:["EXCELLENCE", "#2a6a6a", "THE DIFFERENCE IS IN THE DETAILS"],
    tenants:[["LAKESHORE DATA SYSTEMS", "100"],["LDS · CUSTOMER SUPPORT", "110"],["LDS · MAINFRAME SERVICES", "200"],["TRI-COUNTY TEMPS", "210"],["CONFERENCE CENTER", "220"]]});

  /* ---- the plaza: the fountain, planters with trees in them, benches, lamps on posts ---- */
  const FX=893, FZ=-1775, FR=4.5;
  { // the basin's wall: a ring of granite blocks (each faced inside and out), its coping; the bowl's floor; the water
    const n=40; for(let k=0;k<n;k++){ const a=(k+0.5)/n*Math.PI*2, x=FX+Math.cos(a)*(FR-0.18), z=FZ+Math.sin(a)*(FR-0.18), w=2*Math.PI*FR/n+0.02;
      B(0.36, 0.5, w, x, LY+0.25, z, "#5a5a5e", -a); B(0.5, 0.06, w+0.04, x, LY+0.53, z, "#8a8a8e", -a); }
    for(let k=0;k<16;k++){ const a=(k+0.5)/16*Math.PI*2; addColOB(FX+Math.cos(a)*(FR-0.18), FZ+Math.sin(a)*(FR-0.18), -a+Math.PI/2, 0.95, 0.25, LY-0.5, LY+0.56); }
    for(let k=0;k<10;k++){ const a=(k+0.5)/10*Math.PI*2; addSeat(FX+Math.cos(a)*(FR+0.05), FZ+Math.sin(a)*(FR+0.05), LY+0.1, Math.atan2(-Math.cos(a), -Math.sin(a)), "THE FOUNTAIN'S EDGE", false, 0.4); }
    ent(new T.CircleGeometry(FR-0.3, 40), FX, LY+0.06, FZ, "#2a4a5a", -Math.PI/2, 0, 0);
    const wt=signTex(128, 128, (c, W, H)=>{ c.fillStyle="#4a7a8a"; c.fillRect(0, 0, W, H); for(let i=0;i<60;i++){ c.strokeStyle="rgba(220,240,250,"+(0.1+(i%5)*0.04)+")"; c.lineWidth=1+(i%3); c.beginPath(); c.arc((i*37)%W, (i*61)%H, 6+(i%7)*3, 0, Math.PI*(0.6+(i%3)*0.2)); c.stroke(); } });
    wt.wrapS=wt.wrapT=T.RepeatWrapping; wt.repeat.set(3, 3);
    const wm=new T.Mesh(new T.CircleGeometry(FR-0.3, 40), new T.MeshStandardMaterial({map:wt, color:0xa8c8d0, transparent:true, opacity:0.78, roughness:0.08, metalness:0.2}));
    wm.rotation.x=-Math.PI/2; wm.position.set(FX, LY+0.4, FZ); scene.add(wm); OFFICE.water=wt;
    // the middle: a pedestal, two bowls, the jet; the water coming down off each bowl's lip, and the ring of arcs from the rim
    C(0.45, 1.5, FX, LY+0.75, FZ, "#8a8a8e", 16); ent(new T.CylinderGeometry(1.5, 0.35, 0.35, 28), FX, LY+1.55, FZ, "#8a8a8e");
    C(0.25, 0.9, FX, LY+2.1, FZ, "#8a8a8e", 14); ent(new T.CylinderGeometry(0.8, 0.2, 0.22, 24), FX, LY+2.62, FZ, "#8a8a8e");
    addCol(FX-0.5, FX+0.5, FZ-0.5, FZ+0.5, LY-0.5, LY+2.7);
    const st=signTex(32, 128, (c, W, H)=>{ c.fillStyle="rgba(255,255,255,0)"; c.clearRect(0, 0, W, H); for(let y=0;y<H;y+=8){ c.fillStyle="rgba(235,245,250,"+(0.35+((y/8)%3)*0.15)+")"; c.fillRect(0, y, W, 5); } });
    st.wrapS=st.wrapT=T.RepeatWrapping;
    const sm=new T.MeshStandardMaterial({map:st, transparent:true, opacity:0.8, depthWrite:false, side:T.DoubleSide, roughness:0.1});
    const SPR=[];
    const add=(geo, x, y, z)=>{ const m=new T.Mesh(geo, sm); m.position.set(x, y, z); scene.add(m); SPR.push(m); };
    add(new T.CylinderGeometry(1.5, 1.62, 1.15, 28, 1, true), FX, LY+0.95, FZ);
    add(new T.CylinderGeometry(0.8, 0.86, 0.95, 24, 1, true), FX, LY+2.05, FZ);
    add(new T.CylinderGeometry(0.04, 0.07, 1.6, 8, 1, true), FX, LY+3.5, FZ);
    for(let k=0;k<10;k++){ const a=k/10*Math.PI*2, p0=V3(FX+Math.cos(a)*(FR-0.4), LY+0.5, FZ+Math.sin(a)*(FR-0.4)), p2=V3(FX+Math.cos(a)*1.9, LY+0.4, FZ+Math.sin(a)*1.9),
        p1=V3(FX+Math.cos(a)*3.2, LY+2.1, FZ+Math.sin(a)*3.2);
      add(new T.TubeGeometry(new T.QuadraticBezierCurve3(p0, p1, p2), 16, 0.025, 5, false), 0, 0, 0); }
    OFFICE.spray=st; }
  // planters with a tree in each, benches between, lamps on posts round the edge
  for(const [x, z] of [[866, -1803],[920, -1803],[866, -1747],[920, -1747]]){ B(3.0, 0.55, 3.0, x, LY+0.275, z, "#b8b4aa"); B(2.6, 0.04, 2.6, x, LY+0.53, z, "#4a3a2a");
    addCol(x-1.5, x+1.5, z-1.5, z+1.5, LY-0.5, LY+0.56); if(typeof FOREST!=="undefined") FOREST.plant("lawn", x, z, {scale:0.75});
    for(const [dx, dz, ry] of [[0, 1.55, Math.PI],[0, -1.55, 0]]) addSeat(x+dx, z+dz*1.0, LY+0.1, ry, "A PLANTER'S EDGE", false, 0.4); }
  for(const [x, z, ry] of [[880, -1790, 0],[906, -1790, 0],[880, -1760, Math.PI],[906, -1760, Math.PI]]){
    for(const s of [-1, 1]) B(0.08, 0.42, 0.42, x+s*0.85, LY+0.21, z, "#2a2a2e");
    B(1.9, 0.06, 0.46, x, LY+0.45, z, "#8a6a4a"); B(1.9, 0.4, 0.06, x, LY+0.7, z+(ry ? -0.22 : 0.22), "#8a6a4a");
    addCol(x-0.95, x+0.95, z-0.26, z+0.26, LY-0.5, LY+0.9); for(const dx of [-0.5, 0.5]) addSeat(x+dx, z, LY+0.1, ry, "A BENCH ON THE PLAZA"); }
  for(const [x, z] of [[856, -1808],[930, -1808],[856, -1742],[930, -1742],[893, -1810],[893, -1740]]){
    C(0.07, 3.6, x, LY+1.8, z, "#2a2a2e", 10); S(0.24, x, LY+3.75, z, "#f4f0e8"); addCol(x-0.09, x+0.09, z-0.09, z+0.09, LY-0.5, LY+3.6);
    push("rn_glow", new T.SphereGeometry(0.2, 10, 8), x, LY+3.75, z, 0, "#ffffff");
    const L={x:x, y:LY+3.5, z:z, color:0xffe2b0, intensity:0, dist:14, decay:1.5}; LAMPS.push(L); OFFICE.lamps.push(L); }
  // three flags on poles at the plaza's lake end
  for(const [k, z] of [[0, -1782],[1, -1775],[2, -1768]]){ const x=933.5; C(0.06, 10, x, LY+5, z, "#c8ccd0", 10); S(0.09, x, LY+10.05, z, BRASS); addCol(x-0.08, x+0.08, z-0.08, z+0.08, LY-0.5, LY+10);
    sign(1.6, 1.0, (c, Wd, Hh)=>{ if(k===0){ for(let i=0;i<13;i++){ c.fillStyle=i%2 ? "#f4f2ec" : "#b3191e"; c.fillRect(0, i*Hh/13, Wd, Hh/13+1); } c.fillStyle="#1f2a5a"; c.fillRect(0, 0, Wd*0.4, Hh*7/13); }
        else if(k===1){ c.fillStyle="#1f3f7a"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#d8b048"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.12, Hh*0.22, 0, 0, 7); c.fill(); }
        else { c.fillStyle="#f4f2ec"; c.fillRect(0, 0, Wd, Hh); c.fillStyle="#3a6a7a"; c.fillRect(0, Hh*0.4, Wd, Hh*0.2); say(c, "HRCP", Wd/2, Hh*0.5, Wd*0.5, Hh*0.16, "#f4f2ec", "800", "Arial"); } },
      x, LY+9.3, z+0.82, Math.PI/2, false, 320); }
  // the lawn down to the water: a walk out to a rail at the bank, benches looking out
  { const g=Terrain.groundAt(966, -1775);
    for(const dz of [-3, 3]) for(const y of [0.5, 1.0]) B(0.06, 0.06, 1.0, 967.6, LY+y, -1775+dz, "#2a2a2e");
    B(0.06, 0.06, 8.0, 967.6, LY+1.0, -1775, "#2a2a2e"); B(0.06, 0.06, 8.0, 967.6, LY+0.5, -1775, "#2a2a2e");
    for(let z=-1779; z<=-1771; z+=2) B(0.06, 1.02, 0.06, 967.6, LY+0.51, z, "#2a2a2e");
    addCol(967.4, 967.8, -1779.1, -1770.9, LY-0.5, LY+1.05);
    for(const z of [-1790, -1760]){ const gz=Terrain.groundAt(960, z); for(const s of [-1, 1]) B(0.42, 0.42, 0.08, 960, gz+0.21, z+s*0.85, "#2a2a2e");
      B(0.46, 0.06, 1.9, 960, gz+0.45, z, "#8a6a4a"); B(0.06, 0.4, 1.9, 959.78, gz+0.7, z, "#8a6a4a");
      addCol(959.74, 960.26, z-0.95, z+0.95, gz-0.5, gz+0.9); for(const dz of [-0.5, 0.5]) addSeat(960.02, z+dz, gz, -Math.PI/2, "A BENCH LOOKING OUT OVER THE LAKE"); } }
  // lamps in the lot
  for(const [x, z] of [[759, -1775],[776.25, -1825],[776.25, -1725],[793.75, -1775]]){ const gy=LY; C(0.08, 8.0, x, gy+4.0, z, "#5a5e60", 10); addCol(x-0.1, x+0.1, z-0.1, z+0.1, gy-0.5, gy+8);
    for(const s of [-1, 1]){ B(1.0, 0.08, 0.1, x+s*0.5, gy+7.9, z, "#5a5e60"); RB(0.6, 0.14, 0.4, x+s*1.0, gy+7.85, z, "#3a3e42", 0, 0.03);
      push("rn_glow", planeGeo(0.5, 0.3, 0), x+s*1.0, gy+7.775, z, 0, "#ffffff", Math.PI/2, 0);
      const L={x:x+s*1.0, y:gy+7.5, z:z, color:0xffd8a0, intensity:0, dist:20, decay:1.4}; LAMPS.push(L); OFFICE.lamps.push(L); } }
  // the park's name by the road on a low wall of brick (no post to stand in front of it), the tenants under it
  { const sx=746.0, sz=-1758.0, gy=Terrain.groundAt(sx, sz);
    wallBox("brick", sx-0.3, sx+0.3, sz-3.6, sz+3.6, gy-0.3, gy+1.9, "#8a5a42", 0.6, gy); B(0.74, 0.08, 7.4, sx, gy+1.94, sz, "#b8b4aa");
    for(const sd of [-1, 1]) sign(6.6, 1.6, (c, Wd, Hh)=>{ c.fillStyle="#2a2a2e"; c.fillRect(0, 0, Wd, Hh); c.strokeStyle="#c8a050"; c.lineWidth=6; c.strokeRect(8, 8, Wd-16, Hh-16);
        say(c, "HOLLOW ROAD CORPORATE PARK", Wd/2, Hh*0.3, Wd*0.8, Hh*0.2, "#e8d8a8", "700", "Optima, Palatino, serif");
        say(c, "FRENCH CREEK FINANCIAL · MIDLAND MUTUAL · LAKESHORE DATA SYSTEMS", Wd/2, Hh*0.62, Wd*0.8, Hh*0.1, "#f4f2ec", "600", "Arial");
        say(c, "ONE · TWO · THREE HOLLOW ROAD", Wd/2, Hh*0.8, Wd*0.6, Hh*0.08, "#c8c4b8", "600", "Arial"); },
      sx+sd*0.32, gy+1.05, sz, sd*Math.PI/2, false, 1320); }

  /* ---- the people: one at each desk by day, a few at their terminals, lunch on the plaza, somebody walking the lake ---- */
  if(typeof crowdGroup==="function"){
    const G=crowdGroup("hollow road corporate park", 860, -1775, 150);
    const lk=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#e8e4d8", pants:"#2a2e3a", shoes:"#1a1a1a"}, o);
    for(const [K, look] of [[ONE, lk({female:true, skin:SKINS[0], hair:HAIRS[3], shirt:"#8a3a5a", pants:"#2a2a3a"})],[TWO, lk({skin:SKINS[3], hair:HAIRS[5], shirt:"#f2f0ea", pants:"#1a1a2a", long:true})],
                           [THREE, lk({female:true, skin:SKINS[2], hair:HAIRS[0], shirt:"#3a6a7a", pants:"#2a2a2a"})]]){
      const [x, z]=K.st.desk_at; crowdAdd(G, {look:look, x:x, z:z, y:FL, yaw:K.F.ry, mode:"stand", sway:0.4, dayOnly:true});
      K.st.sitters.forEach((s, k)=>crowdAdd(G, {look:lk({female:k%2===0, skin:SKINS[(k+1)%5], hair:HAIRS[(k*2)%6], shirt:["#d8d0e8","#e8e0c8","#c8d8e8","#f2e8e8"][k%4], long:true}),
        x:s.x, z:s.z, y:FL, yaw:s.yaw, mode:"sit", sitY:0.515, dayOnly:true, sway:0.2})); }
    crowdAdd(G, {look:lk({shirt:"#c8d8e8", long:true, pants:"#3a3a3a"}), x:880.4, z:-1790.0, y:LY+0.1, yaw:Math.PI, mode:"sit", sitY:0.515, dayOnly:true, sway:0.3});
    crowdAdd(G, {look:lk({female:true, shirt:"#e8a0b0", hair:HAIRS[2]}), x:906.4, z:-1760.0, y:LY+0.1, yaw:0, mode:"sit", sitY:0.515, dayOnly:true, sway:0.3, held:"cup", drink:true});
    crowdAdd(G, {look:lk({shirt:"#3a4a6a", long:true}), mode:"walk", path:[[812, -1801, LY],[935, -1801, LY, 3],[962, -1785, undefined],[962, -1765, undefined, 6],[935, -1749, LY],[812, -1749, LY, 4]],
      loop:true, dayOnly:true}); }

  /* ---- the zones; the walls of the world round the park; the woods on its north and south, none toward the lake ---- */
  addZone(O.x0, O.x1, O.z0, O.z1, Y-4, Y+30, "HOLLOW ROAD CORPORATE PARK");
  addZone(852, 936, -1812, -1738, Y-1, Y+20, "HOLLOW ROAD CORPORATE PARK · THE PLAZA");
  for(const K of [ONE, TWO, THREE]) addZone(K.x0, K.x1, K.z0, K.z1, FL-0.5, FL+3.2, K.name+" · THE LOBBY", true);
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
    // a few on the lawn, standing alone (edge trees, never the woods' bare-trunked kind)
    for(const [x, z] of [[945, -1820],[952, -1730],[940, -1845],[948, -1712]]) tree("lawn", x, z, 0.9); }

  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.08});
  detailMesh(ME, mat, "office-park", true);

  OFFICE.routes={
    "office park: up Hollow Road from the pretzel works to the end":[[733.5, -1660],[733.5, -1720],[733.5, -1800],[733.5, -1870]],
    "office park: in at the mouth, across the lot to One Hollow Road's door":[[734.0, -1774.0],[745.0, -1774.0],[758.0, -1776.0],[776.25, -1786.0],[795.0, -1786.0],[805.0, -1776.0],[815.0, -1775.0],[819.5, -1775.0]],
    "office park: into French Creek Financial, its lobby and through to the office":{y0:FL+0.1, pts:[[819.5, -1775.0],[821.0, -1775.0],[823.0, -1775.0],[826.0, -1778.0],[831.0, -1775.0],[835.0, -1775.0],[840.0, -1775.0]]},
    "office park: round One to the plaza and the fountain":[[812.0, -1801.0],[840.0, -1801.0],[856.0, -1801.0],[870.0, -1795.0],[886.0, -1787.0]],
    "office park: from the plaza into Midland Mutual":[[886.0, -1810.0],[886.0, -1813.0],[886.0, -1815.5],[886.0, -1818.0],[886.0, -1823.0],[886.0, -1826.0]],
    "office park: from the plaza into Lakeshore Data Systems":[[886.0, -1745.0],[886.0, -1740.0],[886.0, -1736.0],[886.0, -1733.0],[886.0, -1730.0],[886.0, -1725.0]],
    "office park: across the lawn to the rail at the water":[[930.0, -1775.0],[945.0, -1775.0],[960.0, -1775.0],[966.5, -1775.0]]};
})();
/* the lamps come on after dark; the fountain runs while you are near it */
function updateOfficePark(dt, dark){
  for(const L of OFFICE.lamps) L.intensity=1.1*smoothstep(0.3, 0.6, dark);
  const c=camera.position; if(Math.hypot(c.x-893, c.z+1775)>150) return;
  OFFICE.t+=dt;
  if(OFFICE.spray) OFFICE.spray.offset.y=-(OFFICE.t*1.6)%1;
  if(OFFICE.water){ OFFICE.water.offset.x=(OFFICE.t*0.03)%1; OFFICE.water.offset.y=(OFFICE.t*0.021)%1; }
}
