"use strict";
/* REST AREA · 14mi-apts.js
   ----------------------------------------------------------------------
   Birch Hollow Apartments, on the west side of Hollow Road past the
   bookstore (EAST.apts, 04): one two-storey building of four units in grey
   lap siding with off-white trim, a breezeway let into the middle of its
   front with all four doors in it (101 and 102 at the back of it, 201 and
   202 off the landing over them, up an open stair along its north side),
   and each unit's sliding glass door out to a patio below or a railed
   balcony above. A small lot of seven stalls in front, the dumpster in its
   fenced corral at the north end of it, the sign out by the road.

   The tenants all work at the office park across the road, and each unit
   is theirs: its own paint, floors, furniture and things.
     101  Dale Pruitt, claims adjuster at Midland Mutual: a plaid sofa, the
          console TV, his recliner, a buck on the wall, rods by the door, a
          kettle grill and a lawn chair out on the patio.
     102  Gina Reyes, programmer at Lakeshore Data Systems: a futon and a bean
          bag, a home computer on a door laid over two file cabinets, a board
          and block bookcase, posters, a guitar, pizza boxes, a bike outside.
     201  the Hallorans, at French Creek Financial: tidy, a glass table set
          for two, a leather loveseat, a bookcase, framed prints, a rug,
          plants, a bistro set among the flower boxes on the balcony.
     202  Ray Dombrowski, in sales at Lakeshore: the aquarium, a stereo and
          crates of records, an exercise bike, a lava lamp, the Erie Otters,
          an Adirondack chair and a bird feeder on the balcony.

   PLAN (world): the building x 688..700 (its front at x 700, to the road),
   z -1874..-1856 about ZC -1865; the breezeway z ±1.6 about ZC and 5 m
   deep. In a unit's own terms p runs out from ZC (s = -1 the north unit,
   +1 the south) and d back from the front wall's face: the living room at
   the front (d 0.2..6), the kitchen behind the entry (p 0..4.6, d 6..8.5),
   the bath behind that, the bedroom along the end wall (p 4.6..8.8, d 6..12).
   ---------------------------------------------------------------------- */
const APTS={routes:{}, lamps:[], radios:[], FL0:0, FL1:0, ZC:-1865};
(function birchHollow(){
  if(typeof EAST==="undefined" || !EAST.apts) return;
  const Y=EDIN.y, LY=Y+PAVE_T+0.015, AP=EAST.apts, S0=AP.site, ME=[], CH=[], r=_trng(1979);
  const ent=(geo,x,y,z,c,rx,ry,rz,list)=>(list||ME).push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,list)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0,list);
  const RB=(w,h,d,x,y,z,c,ry,rad,list)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0,list);
  const C=(r0,h,x,y,z,c,seg,rx,ry,rz,list)=>ent(new T.CylinderGeometry(r0,r0,h,seg||12),x,y,z,c,rx,ry,rz,list);
  const S=(r0,x,y,z,c,list)=>ent(new T.SphereGeometry(r0,10,8),x,y,z,c,0,0,0,list);
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family||"Arial"); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*240), Math.round((cw||w*240)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x, z)=>Terrain.groundAt(x, z);

  const XFR=700, XB=688, ZC=APTS.ZC, HL=9, ZS=ZC-HL, ZN=ZC+HL, WT=0.2, CW=1.6, CD=5.0;
  const FL0=LY+0.18, FL1=FL0+2.9, EH=FL1+2.75, RISE=1.5, XR=(XB+XFR)/2, HS=(XFR-XB)/2, RT=0.13;
  const GREY="#6a6c68", TRIM="#cfcac0", ROOF="#3a3a3c", DOORC=0x2a2c30, RAIL="#33373a";
  APTS.FL0=FL0; APTS.FL1=FL1;
  const X=(d)=>XFR-d, Z=(s, p)=>ZC+s*p;
  const zr=(s, p0, p1)=>[Math.min(Z(s, p0), Z(s, p1)), Math.max(Z(s, p0), Z(s, p1))];
  const NUM={"-1,0":"101", "1,0":"102", "-1,1":"201", "1,1":"202"};
  // the zone over the whole place first, so the rooms and the breezeway, added after it, name where you are
  addZone(S0.x0, S0.x1, S0.z0, S0.z1, Y-4, Y+14, "BIRCH HOLLOW APARTMENTS");

  // one wall run: pieces of `bk` round the openings along a (x or z), across c0..c1, y0..y1, colliders with them;
  // in a liner, `inn` is which way the room is, and the pieces over and under an opening stand a centimetre further in
  const run=(bk, ax, c0, c1, a, b, y0, y1, ops, col, inn)=>{ let u=a;
    const piece=(p, q, h0, h1, deep)=>{ if(q-p<0.005 || h1-h0<0.005) return; let d0=c0, d1=c1; if(deep && inn){ if(inn>0) d1+=0.01; else d0-=0.01; }
      if(ax==="x") wallBox(bk, p, q, d0, d1, h0, h1, col, 0.6, FL0); else wallBox(bk, d0, d1, p, q, h0, h1, col, 0.6, FL0); };
    for(const o of ops.slice().sort((m, n)=>m[0]-n[0])){ piece(u, o[0], y0, y1); if(o[2]>y0+0.21) piece(o[0], o[1], y0, o[2], true); piece(o[0], o[1], o[3], y1-0.002, true); u=o[1]; }
    piece(u, b, y0, y1); };

  /* ---- the ground: the slab, the walk out to the lot, the patios (the lot and its drive are the road's paving, 14md) ---- */
  wallBox("concrete", XB-0.06, XFR+0.06, ZS-0.06, ZN+0.06, gy(XR, ZC)-0.6, FL0, "#8a867e", 0.6, FL0);
  { const top=FL0-0.012, w=2*CW-0.1; push("concrete", boxGeo(3.3, top-LY+0.3, w), XFR+0.07+1.65, (top+LY-0.3)/2, ZC, 0, "#8a867e");
    addFlat(XFR, XFR+3.37, ZC-CW+0.05, ZC+CW-0.05, FL0); addRamp(XFR+3.37, XFR+4.1, ZC-CW+0.05, ZC+CW-0.05, "x", XFR+3.37, XFR+4.1, FL0, LY);
    const th=Math.atan2(FL0-LY, 0.73); ent(boxGeo(0.76/Math.cos(th), 0.12, w-0.02), XFR+3.735, (FL0+LY)/2-0.06, ZC, "#8a867e", 0, 0, -th); }
  for(const s of [-1, 1]){ const [z0, z1]=zr(s, 2.0, 8.95), top=FL0-0.1;
    push("concrete", boxGeo(1.7, top-LY+0.3, z1-z0), XFR+0.07+0.85, (top+LY-0.3)/2, (z0+z1)/2, 0, "#8a867e"); addFlat(XFR, XFR+1.77, z0, z1, top); }

  /* ---- the walls: siding outside round each storey's own openings; plaster inside each unit in its own paint ---- */
  const SL=[3.8, 6.2], SM=5.0, PAINT={"-1,0":"#c4b496", "1,0":"#98a696", "-1,1":"#b8b0a2", "1,1":"#a6a2b2"};
  const BACKW=[[6.0, 7.6, 0.95, 2.1],[1.6, 2.4, 1.55, 2.1]], ENDW=[[1.6, 3.2],[8.0, 9.6]];
  for(const [k, F, top] of [[0, FL0, FL1],[1, FL1, EH]]){ const y0=k ? FL1 : FL0-0.15, tl=k ? EH+0.04 : top;
    // the front of each unit with its slider; the back with each unit's bedroom window and its bath's high one
    for(const s of [-1, 1]){ const [a, b]=zr(s, CW+0.2, HL), [o0, o1]=zr(s, SL[0], SL[1]); run("siding", "z", XFR-WT, XFR, a, b, y0, tl, [[o0, o1, F, F+2.15]], GREY); }
    { const ops=[]; for(const s of [-1, 1]) for(const [p0, p1, sl, hd] of BACKW){ const [a, b]=zr(s, p0, p1); ops.push([a, b, F+sl, F+hd]); }
      run("siding", "z", XB, XB+WT, ZS, ZN, y0, tl, ops, GREY); }
    // the ends: the living room's window to the front, the bedroom's to the back
    for(const [z0, z1] of [[ZS, ZS+WT],[ZN-WT, ZN]]) run("siding", "x", z0, z1, XB+WT, XFR-WT, y0, top, ENDW.map(([d0, d1])=>[X(d1), X(d0), F+0.95, F+2.1]), GREY);
    // the breezeway: its side walls, its back wall with the two doors in it, the wall between the units behind it
    for(const s of [-1, 1]){ const [a, b]=zr(s, CW, CW+0.2); wallBox("siding", X(CD), XFR+0.001, a, b, y0, top, GREY, 0.6, FL0); }
    { const ops=[]; for(const s of [-1, 1]){ const [a, b]=zr(s, 0.25, 1.21); ops.push([a, b, F, F+2.12]); }
      run("siding", "z", X(CD)-WT, X(CD), ZC-CW-0.2, ZC+CW+0.2, y0, top, ops, GREY); }
    wallBox("plaster", XB+WT, X(CD)-WT, ZC-0.05, ZC+0.05, F, k ? EH : FL1-0.3, "#b0a898", 0.6, FL0);
    // each unit's liners, in its own paint, to its ceiling
    for(const s of [-1, 1]){ const P=PAINT[s+","+k], LT=F+2.6, ln=0.02;
      { const [a, b]=zr(s, CW+0.2, HL-WT), [o0, o1]=zr(s, SL[0], SL[1]); run("plaster", "z", XFR-WT-ln, XFR-WT, a, b, F, LT, [[o0, o1, F, F+2.15]], P, -1); }
      { const [a, b]=zr(s, 0.05, HL-WT), ops=BACKW.map(([p0, p1, sl, hd])=>zr(s, p0, p1).concat([F+sl, F+hd])); run("plaster", "z", XB+WT, XB+WT+ln, a, b, F, LT, ops, P, 1); }
      { const zz=s<0 ? ZS+WT : ZN-WT, sd=s<0 ? 1 : -1; run("plaster", "x", sd>0 ? zz : zz-ln, sd>0 ? zz+ln : zz, XB+WT+0.03, XFR-WT-0.03, F, LT, ENDW.map(([d0, d1])=>[X(d1), X(d0), F+0.95, F+2.1]), P, sd); }
      { const [a, b]=zr(s, CW+0.2, CW+0.2+ln); wallBox("plaster", X(CD)-WT-0.04, XFR-WT-0.03, a, b, F, LT, P, 0.6, FL0); }
      { const [a, b]=zr(s, 0.07, CW+0.2), [o0, o1]=zr(s, 0.25, 1.21); run("plaster", "z", X(CD)-WT-ln, X(CD)-WT, a, b, F, LT, [[o0, o1, F, F+2.12]], P, -1); }
      { const [a, b]=zr(s, 0.05, 0.05+ln); wallBox("plaster", XB+WT+0.03, X(CD)-WT-0.03, a, b, F, LT, P, 0.6, FL0); } } }
  // the trim: boards at the corners, pilasters either side of the breezeway, a band at the floor line
  for(const z of [ZS, ZN]) for(const x of [XB, XFR]) B(0.26, EH-FL0+0.16-0.012, 0.26, x, (FL0-0.16+EH-0.012)/2, z, TRIM);
  for(const s of [-1, 1]){ B(0.13, EH-FL0+0.16, 0.32, XFR+0.055, (FL0-0.16+EH)/2, Z(s, CW+0.1), TRIM);
    const [a, b]=zr(s, CW+0.25, HL); B(0.11, 0.3, b-a, XFR+0.045, FL1-0.12, (a+b)/2, TRIM);
    const [c, d]=zr(s, 0.05, HL); B(0.09, 0.26, d-c, XB-0.035, FL1-0.12, (c+d)/2, TRIM);
    B(XFR-XB-0.3, 0.26, 0.08, XR, FL1-0.12, s<0 ? ZS-0.04 : ZN+0.04, TRIM); }
  // the floor between the storeys, the landing's slab over the breezeway's back, and each unit's ceiling
  for(const s of [-1, 1]){ const [a, b]=zr(s, CW+0.01, HL-0.01); B(XFR-XB-0.02, 0.28, b-a, XR, FL1-0.14, (a+b)/2, "#8a8478"); }
  B(X(3.6)-XB-0.02, 0.28, 2*CW, (XB+X(3.6))/2, FL1-0.14, ZC, "#8a8478");
  for(const F of [FL0, FL1]) for(const s of [-1, 1]){
    // (one L-shaped slab a unit: its living room's ceiling runs on round the breezeway without a seam)
    { const xa=XB+WT+0.02, xb=X(CD)-WT, xc=XFR-WT-0.02, pa=0.07, pb=CW+0.22, pc=HL-WT-0.02, sh=new T.Shape();
      sh.moveTo(xa, Z(s, pa)); sh.lineTo(xb, Z(s, pa)); sh.lineTo(xb, Z(s, pb)); sh.lineTo(xc, Z(s, pb)); sh.lineTo(xc, Z(s, pc)); sh.lineTo(xa, Z(s, pc)); sh.lineTo(xa, Z(s, pa));
      const g=new T.ExtrudeGeometry(sh, {depth:0.04, bevelEnabled:false}); g.rotateX(Math.PI/2); ent(g, 0, F+2.64, 0, "#c8c2b4"); } }
  addFlat(XB+WT, XFR, ZS+WT, ZN-WT, FL0);
  addFlat(XB+WT, XFR, ZS+WT, ZC-CW, FL1); addFlat(XB+WT, XFR, ZC+CW, ZN-WT, FL1); addFlat(XB+WT, X(3.6), ZC-CW, ZC+CW, FL1);
  // the gables, the roof (out deep over the balconies at the front), its ridge, fascia and the soffit under the eave
  const TH=Math.atan2(RISE, HS), yTop=(x)=>EH+RT+RISE*(1-Math.abs(x-XR)/HS);
  for(const z0 of [ZS-0.01, ZN-WT]){ const sh=new T.Shape(); sh.moveTo(XB, EH); sh.lineTo(XFR, EH); sh.lineTo(XR, EH+RISE-0.03); sh.lineTo(XB, EH);
    const g=new T.ExtrudeGeometry(sh, {depth:WT+0.01, bevelEnabled:false}); g.translate(0, 0, z0); push("siding", g, 0, 0, 0, 0, GREY); }
  { const XE0=XB-0.5, XE1=XFR+1.9, ZL=ZN-ZS+0.6;
    for(const [xa, xb, sg] of [[XR-0.04, XE1, -1],[XE0, XR+0.04, 1]]){ const xm=(xa+xb)/2, L=(xb-xa)/Math.cos(TH), nx=-sg*Math.sin(TH), ny=Math.cos(TH);
      const ym=(yTop(xa)+yTop(xb))/2;
      push("shingle", boxGeo(L, 0.12, ZL+(sg>0 ? 0.014 : 0)), xm-nx*0.06, ym-ny*0.06, ZC, 0, ROOF, 0, sg*TH); }
    B(0.34, 0.09, ZL+0.03, XR, yTop(XR)+0.025, ZC, "#2e2e30");
    for(const [x, sg] of [[XE1+0.02, -1],[XE0-0.02, 1]]) B(0.04, 0.22, ZL+0.02, x, yTop(x)-0.12, ZC, TRIM);
    { const x0=XFR+0.03, x1=XE1-0.04, L=(x1-x0)/Math.cos(TH), y=(yTop(x0)+yTop(x1))/2-RT/Math.cos(TH)-0.03; ent(boxGeo(L, 0.02, ZL-0.06), (x0+x1)/2, y, ZC, "#c4beb2", 0, 0, -TH); }
    addRoof(XE0, XE1, ZS-0.3, ZN+0.3, EH-0.45); }
  B(XFR-X(CD)-0.01, 0.04, 2*CW-0.02, (XFR+X(CD))/2, EH-0.06, ZC, "#c4beb2");

  /* ---- the glass: each slider a fixed pane and one that slides (E) with its screen; the windows, framed; vertical blinds ---- */
  const BLIND={"-1,0":0.5, "1,0":0.3, "-1,1":0.45, "1,1":0.12};
  for(const [k, F] of [[0, FL0],[1, FL1]]) for(const s of [-1, 1]){ const [o0, o1]=zr(s, SL[0], SL[1]), [f0, f1]=zr(s, SM, SL[1]), [m0, m1]=zr(s, SL[0], SM+0.03);
    // the fixed half on the outer track, glazed into the frame; the frame round the whole opening
    push("glass", planeGeo(f1-f0-0.06, 2.04, 0), XFR-0.06, F+1.07, (f0+f1)/2, Math.PI/2, "#ffffff");
    for(const z of [o0+0.025, o1-0.025]) B(0.16, 2.15, 0.05, XFR-0.1, F+1.075, z, "#8a8e90", 0, CH);
    B(0.16, 0.05, o1-o0-0.1, XFR-0.1, F+2.125, (o0+o1)/2, "#8a8e90", 0, CH); B(0.18, 0.03, o1-o0-0.1, XFR-0.1, F+0.015, (o0+o1)/2, "#8a8e90", 0, CH);
    B(0.04, 2.05, 0.05, XFR-0.06, F+1.075, s<0 ? f1-0.02 : f0+0.02, "#8a8e90", 0, CH);
    // the leaf that slides, on the inner track, and its screen outside: one group, run out over the fixed half
    { const g=new T.Group(), E=[], w=m1-m0-0.1, H=2.06, fr="#8a8e90";
      const add=(bw, bh, bd, x, y, z, c)=>E.push({geo:boxGeo(bw, bh, bd, 0), matrix:new T.Matrix4().makeTranslation(x, y, z), color:new T.Color(c)});
      add(0.04, H, 0.05, 0, H/2, -w/2+0.025, fr); add(0.04, H, 0.05, 0, H/2, w/2-0.025, fr); add(0.04, 0.05, w-0.1, 0, H-0.025, 0, fr); add(0.04, 0.07, w-0.1, 0, 0.035, 0, fr);
      add(0.03, 0.2, 0.025, -0.035, 1.0, s<0 ? -w/2+0.07 : w/2-0.07, "#5a5e60");
      add(0.02, H, 0.03, 0.16, H/2, -w/2+0.015, fr); add(0.02, H, 0.03, 0.16, H/2, w/2-0.015, fr); add(0.02, 0.03, w-0.06, 0.16, H-0.015, 0, fr); add(0.02, 0.03, w-0.06, 0.16, 0.015, 0, fr);
      const m=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.45, metalness:0.4})); m.castShadow=true; g.add(m);
      const gl=new T.Mesh(new T.PlaneGeometry(w-0.08, H-0.12), DOOR_GLASS_MAT); gl.rotation.y=Math.PI/2; gl.position.set(0, H/2+0.01, 0); g.add(gl);
      const scr=new T.Mesh(new T.PlaneGeometry(w-0.06, H-0.06), APTS.screenMat||(APTS.screenMat=new T.MeshStandardMaterial({color:0x2a2c2e, transparent:true, opacity:0.4, roughness:0.9, depthWrite:false, side:T.DoubleSide})));
      scr.rotation.y=Math.PI/2; scr.position.set(0.16, H/2, 0); g.add(scr);
      const z0=(m0+m1)/2; g.position.set(XFR-0.15, F+0.03, z0); g.userData.noCull=true; scene.add(g);
      const bc={x0:XFR-WT, x1:XFR, z0:m0, z1:m1, y0:F-0.5, y1:F+2.15}; COL_DYN.push(bc);
      DOORS.push({g:g, slide:[{g:g, x0:z0, dx:s*(SM-SL[0]-0.05), ax:"z"}], rate:2.4, open:0, target:0, x:XFR-0.1, z:z0, y:F, base:0, manual:0, ajar:0, swing:0,
        label:"THE SLIDING DOOR", reach:1.8, manualOnly:true, sticky:true, blockCol:bc, blockTop:F+2.15}); }
    // vertical blinds, drawn part way across from the fixed end, the rest stacked; a valance over them
    { const n=Math.round((o1-o0)/0.09), m=Math.round(n*BLIND[s+","+k]), col=["#cfc6b0","#c4bca4","#c0c4bc","#ccc0ae"][(s+1)/2+2*k];
      for(let i=0;i<m;i++){ const p=SL[1]-0.06-i*0.088; B(0.006, 2.02, 0.085, XFR-WT-0.12, F+1.1, Z(s, p), col, 1.15); }
      { const p=SL[1]-0.06-m*0.088-0.07; B(0.09, 2.02, 0.12, XFR-WT-0.12, F+1.1, Z(s, p), col); }
      B(0.08, 0.1, o1-o0+0.12, XFR-WT-0.07, F+2.2, (o0+o1)/2, "#c8c0b0"); } }
  for(const [k, F] of [[0, FL0],[1, FL1]]){
    for(const s of [-1, 1]) for(const [p0, p1, sl, hd] of BACKW){ const [a, b]=zr(s, p0, p1);
      push("glass", planeGeo(b-a-0.02, hd-sl-0.02, 0), XB+0.1, F+(sl+hd)/2, (a+b)/2, Math.PI/2, "#ffffff");
      for(const zz of [a-0.06, b+0.06]) B(0.04, hd-sl+0.12, 0.1, XB-0.01, F+(sl+hd)/2, zz, TRIM);
      B(0.05, 0.1, b-a+0.24, XB-0.015, F+hd+0.056, (a+b)/2, TRIM); B(0.09, 0.04, b-a+0.28, XB-0.035, F+sl-0.014, (a+b)/2, TRIM);
      B(0.06, 0.04, b-a, XB+WT+0.05, F+sl-0.014, (a+b)/2, "#c8c0b0"); }
    for(const [zz, sd] of [[ZS, -1],[ZN, 1]]) for(const [d0, d1] of ENDW){ const xm=(X(d0)+X(d1))/2;
      push("glass", planeGeo(d1-d0-0.02, 1.13, 0), xm, F+1.525, zz-sd*0.1, 0, "#ffffff");
      for(const xx of [X(d1)-0.06, X(d0)+0.06]) B(0.1, 1.27, 0.04, xx, F+1.525, zz+sd*0.01, TRIM);
      B(d1-d0+0.24, 0.1, 0.05, xm, F+2.156, zz+sd*0.015, TRIM); B(d1-d0+0.28, 0.04, 0.09, xm, F+0.936, zz+sd*0.035, TRIM);
      B(d1-d0, 0.04, 0.06, xm, F+0.936, zz-sd*(WT+0.05), "#c8c0b0"); } }

  /* ---- the breezeway: the open stair, the landing and its rail, the four doors, their numbers and lamps, the mailboxes ---- */
  const SP0=0.45, SP1=1.5, SX0=X(3.6), SX1=XFR+1.2, SRUN=SX1-SX0, sH=(x)=>FL0+(FL1-FL0)*(SX1-x)/SRUN;
  { const n=16, [a, b]=zr(-1, SP0, SP1);
    for(let i=0;i<n-1;i++){ const xa=SX1-SRUN*(i+1)/n, xb=SX1-SRUN*i/n; B(xb-xa+0.03, 0.04, b-a-0.07, (xa+xb)/2, FL0+(FL1-FL0)*(i+1)/n-0.02, (a+b)/2, "#55595c", 0, CH); }
    const th=Math.atan2(FL1-FL0, SRUN), L=Math.hypot(SRUN, FL1-FL0);
    for(const z of [a+0.025, b-0.025]) ent(boxGeo(L+0.1, 0.26, 0.05), (SX0+SX1)/2, (FL0+FL1)/2-0.13, z, "#44484a", 0, 0, -th, CH);
    addRamp(SX0, SX1, a, b, "x", SX0, SX1, FL1, FL0);
    // under it: solid wherever it is too low to walk under
    for(let x=SX1; x>SX0; x-=0.35){ const top=sH(x)-0.25; if(top-FL0>1.85) break; if(top>FL0+0.1) addCol(Math.max(SX0, x-0.35), x, a, b, FL0-0.1, top); }      // (top: under the stringers, low enough that one climbing over it never touches it)
    // its rails: square bars under a cap, the open side's run in pieces that each start just under the stair over them
    const rail=(x0, x1, z, lo)=>{ const L2=Math.hypot(x1-x0, sH(x1)-sH(x0)), an=Math.atan2(sH(x1)-sH(x0), x1-x0), n2=Math.round(Math.abs(x1-x0)/0.115);
      ent(boxGeo(L2+0.04, 0.05, 0.05), (x0+x1)/2, (sH(x0)+sH(x1))/2+0.95, z, RAIL, 0, 0, an, CH);
      for(let i=0;i<=n2;i++){ const x=x0+(x1-x0)*i/n2; B(0.018, 0.92, 0.018, x, sH(x)+0.47, z, RAIL, 0, CH); }
      const st=0.35; for(let x=Math.min(x0, x1); x<Math.max(x0, x1)-0.01; x+=st){ const xe=Math.min(x+st, Math.max(x0, x1));
        addCol(x, xe, z-0.06, z+0.06, (lo ? FL0-0.2 : Math.min(sH(x), sH(xe))-0.15), Math.max(sH(x), sH(xe))+1.0); } };
    rail(SX1-0.04, SX0+0.02, b, false); rail(SX1-0.04, XFR+0.15, a, true);      // (b: the open side, p 0.45; a: the wall side, outside the breezeway)
    // the landing's rail across the breezeway at the stair's head, open where the stair comes up
    { const [c, d]=zr(-1, -CW+0.04, SP0-0.03), n3=Math.round((d-c)/0.115), x=SX0+0.03;
      B(0.05, 0.05, d-c, x, FL1+0.95, (c+d)/2, RAIL, 0, CH); for(let i=0;i<=n3;i++) B(0.018, 0.92, 0.018, x, FL1+0.47, c+(d-c)*i/n3, RAIL, 0, CH);
      addCol(x-0.06, x+0.06, c, d, FL1-0.15, FL1+1.0); B(0.06, 0.3, 2*CW-0.02, SX0+0.03, FL1-0.15, ZC, TRIM); } }
  // the four doors: a dark leaf with six raised panels, opening in; casings, a sill, its number, a lamp beside it
  for(const [k, F] of [[0, FL0],[1, FL1]]) for(const s of [-1, 1]){ const [o0, o1]=zr(s, 0.25, 1.21), xw=X(CD)-WT/2, id=NUM[s+","+k];
    const g=makeDoor(XF(xw, o1-0.02, Math.PI/2), 0, F+0.012, 0, "APT "+id, false, 0, null, DOORC);
    { const E=[], pc=new T.Color(DOORC).multiplyScalar(1.12);
      for(const sd of [-1, 1]) for(const [u, w] of [[0.27, 0.3],[0.65, 0.3]]) for(const [y, h] of [[0.42, 0.62],[1.24, 0.78],[1.82, 0.26]])
        E.push({geo:boxGeo(w, h, 0.012, 0), matrix:new T.Matrix4().makeTranslation(u, y, sd*0.038), color:pc});
      const m=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.1})); m.castShadow=true; g.add(m); }
    addFlat(X(CD)-WT-0.02, X(CD)+0.02, o0, o1, F);
    for(const zz of [o0-0.045, o1+0.045]) B(0.03, 2.18, 0.09, X(CD)+0.015, F+1.09, zz, TRIM);
    B(0.035, 0.09, o1-o0+0.18, X(CD)+0.0175, F+2.165, (o0+o1)/2, TRIM);
    { const pz=Z(s, 1.42); B(0.012, 0.11, 0.16, X(CD)+0.006, F+1.62, pz, "#2a2a2c");
      sign(0.15, 0.1, (c, W, H)=>{ c.fillStyle="#b8a068"; c.fillRect(0, 0, W, H); say(c, id, W/2, H/2, W*0.8, H*0.6, "#1a1a1a", "700", "Georgia, serif"); }, X(CD)+0.019, F+1.62, pz, Math.PI/2, false, 150); }
    { const lz=Z(s, 1.45); RB(0.1, 0.22, 0.12, X(CD)+0.06, F+2.0, lz, "#2a2a2c", 0, 0.02); push("rn_glow", new T.CylinderGeometry(0.035, 0.035, 0.12, 10), X(CD)+0.13, F+1.98, lz, 0, "#ffffff");
      const L={x:X(CD)+0.45, y:F+1.9, z:lz, color:0xffd8a0, intensity:0, dist:6, decay:1.6, mothy:true}; LAMPS.push(L); APTS.lamps.push(L); } }
  // on the breezeway's south wall: the mailboxes, a fire extinguisher's cabinet; a mat at each door
  { const z=Z(1, CW), x=X(1.7);
    B(0.9, 0.62, 0.1, x, FL0+1.3, z-0.05, "#8a8e90", 0, CH);
    for(let i=0;i<4;i++){ const bx=x-0.21+(i%2)*0.42, by=FL0+1.42-((i/2)|0)*0.28; B(0.38, 0.24, 0.012, bx, by, z-0.106, "#9a9ea2", 0, CH); B(0.06, 0.02, 0.012, bx+0.12, by-0.06, z-0.118, "#3a3a3a", 0, CH); }
    sign(0.84, 0.08, (c, W, H)=>{ c.fillStyle="#8a8e90"; c.fillRect(0, 0, W, H); say(c, "101   102   201   202", W/2, H/2, W*0.8, H*0.6, "#1a1a1a", "700"); }, x, FL0+1.665, z-0.108, Math.PI, false, 300);
    addCol(x-0.46, x+0.46, z-0.12, z, FL0+0.9, FL0+1.62);
    const fx=X(0.55); B(0.34, 0.56, 0.16, fx, FL0+1.25, z-0.08, "#b8281a"); B(0.26, 0.4, 0.01, fx, FL0+1.24, z-0.166, "#2a2226"); C(0.065, 0.32, fx, FL0+1.22, z-0.18, "#c8281a", 12);
    sign(0.3, 0.09, (c, W, H)=>{ c.fillStyle="#d0c8b8"; c.fillRect(0, 0, W, H); say(c, "FIRE EXTINGUISHER", W/2, H/2, W*0.84, H*0.56, "#b8281a", "800"); }, fx, FL0+1.62, z-0.012, Math.PI, false, 200);
    addCol(fx-0.18, fx+0.18, z-0.26, z, FL0+0.95, FL0+1.55); }
  for(const [k, F] of [[0, FL0],[1, FL1]]) for(const s of [-1, 1]){ const [o0, o1]=zr(s, 0.2, 1.26); B(0.55, 0.012, o1-o0, X(CD)+0.35, F+0.012, (o0+o1)/2, ["#4a3a2a","#3a4a3a","#5a3a3a","#3a3a4a"][(s+1)/2+2*k]); }
  addZone(X(CD), XFR+1.4, ZC-CW, ZC+CW, FL0-0.5, EH, "BIRCH HOLLOW · THE BREEZEWAY"); addRoof(X(CD), XFR, ZC-CW, ZC+CW, EH-0.1);

  /* ---- the balconies over the patios: a slab, a fascia, a rail of dark bars; posts down to the patios, screens between them ---- */
  const BD=1.6;
  for(const s of [-1, 1]){ const [z0, z1]=zr(s, 2.0, 8.95), zm=(z0+z1)/2;
    B(BD, 0.22, z1-z0, XFR+BD/2+0.01, FL1-0.11, zm, "#8a8478"); B(0.06, 0.32, z1-z0+0.04, XFR+BD+0.04, FL1-0.12, zm, TRIM);
    addFlat(XFR, XFR+BD, z0, z1, FL1);
    const rl=(ax, a0, a1, c)=>{ const n=Math.round((a1-a0)/0.12);
      ax==="z" ? B(0.05, 0.05, a1-a0, c, FL1+1.0, (a0+a1)/2, RAIL, 0, CH) : B(a1-a0, 0.044, 0.05, (a0+a1)/2, FL1+0.995, c, RAIL, 0, CH);
      for(let i=0;i<=n;i++){ const a=a0+(a1-a0)*i/n; ax==="z" ? B(0.018, 0.98, 0.018, c, FL1+0.5, a, RAIL, 0, CH) : B(0.018, 0.98, 0.018, a, FL1+0.5, c, RAIL, 0, CH); }
      ax==="z" ? addCol(c-0.06, c+0.06, a0, a1, FL1-0.2, FL1+1.05) : addCol(a0, a1, c-0.06, c+0.06, FL1-0.2, FL1+1.05); };
    rl("z", z0+0.03, z1-0.03, XFR+BD-0.08); rl("x", XFR+0.03, XFR+BD-0.1, z0+0.04); rl("x", XFR+0.03, XFR+BD-0.1, z1-0.04);
    for(const z of [z0+0.12, z1-0.12]){ B(0.16, FL1-0.22-FL0+0.1, 0.16, XFR+BD-0.1, (FL1-0.22+FL0-0.1)/2, z, TRIM); addCol(XFR+BD-0.18, XFR+BD-0.02, z-0.08, z+0.08, FL0-0.2, FL1-0.22); }
    for(const z of [z0+0.03, z1-0.03]){ B(1.3, 1.2, 0.04, XFR+0.75, FL0-0.1+0.6, z, "#6a5a44"); addCol(XFR+0.1, XFR+1.4, z-0.04, z+0.04, FL0-0.2, FL0+1.1); }
    addZone(XFR, XFR+BD, z0, z1, FL0-0.5, FL1-0.22, "BIRCH HOLLOW · APT "+NUM[s+",0"]+" · THE PATIO");
    addZone(XFR, XFR+BD, z0, z1, FL1-0.2, EH, "BIRCH HOLLOW · APT "+NUM[s+",1"]+" · THE BALCONY"); }

  /* ---- inside: the floors, the partitions, the fittings, and each tenant's things ---- */
  // the floor coverings, gathered by kind and laid as one mesh a kind, their uvs in world metres; kitchens and baths a step up the ladder
  const FLOORS={};
  const floorAt=(kind, x0, x1, z0, z1, F)=>{ (FLOORS[kind]||(FLOORS[kind]=[])).push([x0, x1, z0, z1, F]); };
  const FK={carpet1:[0, 1.2], carpet2:[0, 1.2], carpet3:[0, 1.2], wood:[0, 1.6], shag:[0, 1.0], vinylA:[1, 0.6], vinylB:[1, 0.6], vinylC:[1, 0.6], tile:[1, 0.45]};
  const floorTex=(kind)=>{ const t=signTex(256, 256, (c, W, H)=>{
      if(kind.startsWith("carpet") || kind==="shag"){ c.fillStyle={carpet1:"#6a5a46", carpet2:"#566470", carpet3:"#76665a", shag:"#8a6a2a"}[kind]; c.fillRect(0, 0, W, H);
        const q=_trng(kind.length*7); for(let i=0;i<(kind==="shag" ? 5200 : 2600);i++){ c.fillStyle=q()<0.5 ? "rgba(0,0,0,0.09)" : "rgba(255,240,220,0.06)"; c.fillRect(q()*W, q()*H, 2, kind==="shag" ? 3 : 2); } }
      else if(kind==="wood"){ c.fillStyle="#76563a"; c.fillRect(0, 0, W, H); const q=_trng(5);
        for(let k=0;k<12;k++){ const y=k*W/12; c.fillStyle=k%3 ? "rgba(0,0,0,0.08)" : "rgba(255,230,200,0.06)"; c.fillRect(0, y, W, W/12); c.fillStyle="rgba(0,0,0,0.32)"; c.fillRect(0, y+W/12-1.4, W, 1.4); c.fillRect((q()*W)|0, y, 1.4, W/12);
          for(let g=0;g<6;g++){ c.fillStyle="rgba(40,24,10,0.12)"; c.fillRect(0, y+3+q()*(W/12-6), W, 0.8); } } }
      else if(kind==="vinylA"){ for(let i=0;i<8;i++) for(let j=0;j<8;j++){ c.fillStyle=(i+j)%2 ? "#b4aa94" : "#8a6a4a"; c.fillRect(i*32, j*32, 32, 32); } }
      else if(kind==="vinylB" || kind==="vinylC"){ c.fillStyle=kind==="vinylB" ? "#a8a698" : "#b4a888"; c.fillRect(0, 0, W, H); const q=_trng(9);
        for(let i=0;i<300;i++){ c.fillStyle="rgba(0,0,0,0.06)"; c.fillRect(q()*W, q()*H, 3, 3); }
        c.strokeStyle="rgba(0,0,0,0.18)"; for(let i=0;i<=4;i++){ c.beginPath(); c.moveTo(i*64, 0); c.lineTo(i*64, H); c.moveTo(0, i*64); c.lineTo(W, i*64); c.stroke(); } }
      else { c.fillStyle="#98a0a4"; c.fillRect(0, 0, W, H); c.strokeStyle="rgba(40,40,40,0.35)"; c.lineWidth=2; for(let i=0;i<=8;i++){ c.beginPath(); c.moveTo(i*32, 0); c.lineTo(i*32, H); c.moveTo(0, i*32); c.lineTo(W, i*32); c.stroke(); } } });
    t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; };
  const buildFloors=()=>{ for(const kind in FLOORS){ const [lift, rep]=FK[kind], P=[], UV=[], I=[];
      for(const [x0, x1, z0, z1, F] of FLOORS[kind]){ const y=F+0.012+0.005*lift, b=P.length/3;
        P.push(x0, y, z0,  x1, y, z0,  x1, y, z1,  x0, y, z1); UV.push(x0/rep, -z0/rep,  x1/rep, -z0/rep,  x1/rep, -z1/rep,  x0/rep, -z1/rep); I.push(b, b+2, b+1, b, b+3, b+2); }
      const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(UV, 2)); g.setIndex(I); g.computeVertexNormals();
      const m=new T.Mesh(g, new T.MeshStandardMaterial({map:floorTex(kind), roughness:kind==="wood" || kind==="tile" ? 0.55 : 0.92, polygonOffset:true, polygonOffsetFactor:-1-lift, polygonOffsetUnits:-2-2*lift}));
      m.receiveShadow=true; m.matrixAutoUpdate=false; m.updateMatrix(); scene.add(m); } };
  // in a unit's own terms: a box w across (along p), h tall, dd deep (along d), at (p, d) and height y
  const U=(s)=>({ b:(w, h, dd, p, d, y, c, list)=>B(dd, h, w, X(d), y, Z(s, p), c, 0, list), rb:(w, h, dd, p, d, y, c, rad, list)=>RB(dd, h, w, X(d), y, Z(s, p), c, 0, rad, list),
    c:(r0, h, p, d, y, c, seg)=>C(r0, h, X(d), y, Z(s, p), c, seg), sph:(r0, p, d, y, c)=>S(r0, X(d), y, Z(s, p), c),
    col:(p0, p1, d0, d1, y0, y1)=>{ const [a, b]=zr(s, p0, p1); addCol(X(d1), X(d0), a, b, y0, y1); },
    // a seat's yaw facing toward the front (+x), the back, out along p (to the end wall), or in (to the breezeway)
    yaw:(dir)=>({front:-Math.PI/2, back:Math.PI/2, out:s>0 ? Math.PI : 0, in:s>0 ? 0 : Math.PI}[dir]),
    // a facing as a world direction
    dir:(dir)=>({front:[1, 0], back:[-1, 0], out:[0, s], in:[0, -s]}[dir]) });
  // a chair or a sofa at (p, d) facing `dir`, its back behind it, its seats
  const seatAt=(s, F, p, d, dir, w, col, label, sofa, dep)=>{ const u=U(s), yaw=u.yaw(dir), fx=-Math.sin(yaw), fz=-Math.cos(yaw), x=X(d), z=Z(s, p);
    const alongX=Math.abs(fz)>0.5, D=dep||(sofa ? 0.85 : 0.6), sx=alongX ? w : D, sz=alongX ? D : w;
    RB(sx, 0.4, sz, x, F+0.2, z, col, 0, 0.05);
    RB(alongX ? w : 0.18, 0.52, alongX ? 0.18 : w, x-fx*(D/2-0.09), F+0.64, z-fz*(D/2-0.09), col, 0, 0.05);
    for(const sd of [-1, 1]) RB(alongX ? 0.16 : D, 0.24, alongX ? D : 0.16, x+(alongX ? sd*(w/2-0.08) : 0), F+0.52, z+(alongX ? 0 : sd*(w/2-0.08)), col, 0, 0.05);
    addCol(x-sx/2, x+sx/2, z-sz/2, z+sz/2, F-0.05, F+0.48);
    const n=sofa ? Math.max(1, Math.round((w-0.3)/0.62)) : 1;
    for(let i=0;i<n;i++){ const o=(i-(n-1)/2)*0.62; addSeat(x+(alongX ? o : 0)+fx*0.05, z+(alongX ? 0 : o)+fz*0.05, F, yaw, label, false, 0.66); }
    return {x:x, z:z, yaw:yaw}; };
  // a plain chair (no arms), facing `dir`
  const chairAt=(s, F, p, d, dir, col, label)=>{ const u=U(s), yaw=u.yaw(dir), fx=-Math.sin(yaw), fz=-Math.cos(yaw), x=X(d), z=Z(s, p);
    RB(0.42, 0.05, 0.42, x, F+0.45, z, col, 0, 0.015);
    for(const [a, b] of [[-1, -1],[1, -1],[-1, 1],[1, 1]]) B(0.035, 0.45, 0.035, x+a*0.18, F+0.225, z+b*0.18, col);
    const bx=x-fx*0.19, bz=z-fz*0.19; B(Math.abs(fx)>0.5 ? 0.03 : 0.4, 0.45, Math.abs(fx)>0.5 ? 0.4 : 0.03, bx, F+0.72, bz, col);
    addCol(x-0.22, x+0.22, z-0.22, z+0.22, F-0.05, F+0.46); addSeat(x, z, F, yaw, label, false, 0.66); return {x:x, z:z, yaw:yaw}; };
  // a picture on a wall at (p, d) (the wall's face), facing `dir`
  const pic=(s, F, p, d, y, dir, w, h, frame, draw)=>{ const [fx, fz]=U(s).dir(dir), x=X(d), z=Z(s, p), ry=Math.atan2(fx, fz);
    B(Math.abs(fx)>0.5 ? 0.03 : w, h, Math.abs(fx)>0.5 ? w : 0.03, x+fx*0.022, F+y, z+fz*0.022, frame);
    sign(w-0.08, h-0.08, draw, x+fx*0.045, F+y, z+fz*0.045, ry, false, Math.round(w*220)); };
  const lamp=(x, y, z, I)=>LAMPS.push({x:x, y:y, z:z, color:0xffe0b8, intensity:I||0.5, dist:6, decay:1.6, indoor:true});
  const door=(x, zh, F, label)=>makeDoor(XF(x, zh, Math.PI/2), 0, F+0.012, 0, label, false, 0.95, "closet", 0xc8bea8);

  const UNIT=(s, k, look)=>{ const F=k ? FL1 : FL0, u=U(s), P=PAINT[s+","+k], id=NUM[s+","+k], name="BIRCH HOLLOW · APT "+id;
    // the partitions: living room | bedroom (its door), the bedroom | kitchen and bath, the kitchen | bath (its door)
    { const x=X(6.0), [a, b]=zr(s, 4.55, HL-WT), [o0, o1]=zr(s, 5.0, 5.9); run("plaster", "z", x-0.05, x+0.05, a, b, F, F+2.6, [[o0, o1, F, F+2.05]], P);
      door(x, o1-0.01, F, "THE BEDROOM DOOR"); }
    { const z=Z(s, 4.6); run("plaster", "x", z-0.035, z+0.035, XB+WT, X(6.05), F, F+2.6, [], P); }
    { const x=X(8.5), [a, b]=zr(s, 0.07, 4.565), [o0, o1]=zr(s, 3.35, 4.27); run("plaster", "z", x-0.05, x+0.05, a, b, F, F+2.6, [[o0, o1, F, F+2.05]], P);
      door(x, o1-0.01, F, "THE BATHROOM DOOR"); }
    // the zones: the whole unit, then its rooms
    { const [a, b]=zr(s, 0.05, HL-WT); addZone(XB+WT, XFR-WT, a, b, F-0.4, F+2.62, name, true); }
    { const [a, b]=zr(s, 4.6, HL-WT); addZone(XB+WT, X(6.0), a, b, F-0.4, F+2.62, name+" · THE BEDROOM", true); }
    { const [a, b]=zr(s, 0.05, 4.6); addZone(XB+WT, X(8.5), a, b, F-0.4, F+2.62, name+" · THE BATH", true); }
    { const [a, b]=zr(s, 0.05, 4.6); addZone(X(8.5), X(6.0), a, b, F-0.4, F+2.62, name+" · THE KITCHEN", true); }
    // the floors
    { const [a, b]=zr(s, CW+0.22, HL-WT-0.02); floorAt(look.floor, X(6.05), XFR-WT-0.02, a, b, F); }
    { const [a, b]=zr(s, 4.635, HL-WT-0.02); floorAt(look.bedfloor||look.floor, XB+WT+0.02, X(6.05), a, b, F); }
    { const [a, b]=zr(s, 0.07, 4.565); floorAt(look.kfloor, X(8.55), X(6.05), a, b, F); }
    { const [a, b]=zr(s, 0.07, CW+0.2); floorAt(look.kfloor, X(6.05), X(CD)-WT-0.02, a, b, F); }
    { const [a, b]=zr(s, 0.07, 4.565); floorAt("tile", XB+WT+0.02, X(8.55), a, b, F); }
    // the kitchen: base cupboards and the counter along the party wall, the sink, the range and its hood, the wall cupboards, the fridge
    { const KC=look.kitchen;
      u.b(0.6, 0.86, 1.6, 0.39, 6.95, F+0.43, KC[0]); u.b(0.66, 0.04, 1.64, 0.4, 6.95, F+0.88, KC[1]); u.col(0.07, 0.73, 6.13, 7.77, F-0.05, F+0.9);
      for(const d of [6.35, 6.75, 7.15, 7.55]){ u.b(0.012, 0.7, 0.37, 0.695, d, F+0.42, KC[2]); u.b(0.02, 0.03, 0.1, 0.71, d, F+0.7, "#8a8a88"); }
      u.b(0.4, 0.035, 0.5, 0.38, 6.5, F+0.888, "#8a8e90"); u.c(0.012, 0.28, 0.12, 6.5, F+1.04, "#8a8e90"); u.b(0.02, 0.012, 0.16, 0.2, 6.5, F+1.17, "#8a8e90");
      u.b(0.6, 0.018, 0.56, 0.4, 7.4, F+0.91, "#2a2a2a"); for(const dd of [7.25, 7.55]) for(const pp of [0.27, 0.53]) u.c(0.075, 0.012, pp, dd, F+0.925, "#3a3a3a", 14);
      u.b(0.012, 0.1, 0.5, 0.715, 7.4, F+0.86, "#2a2a2a");
      u.b(0.36, 0.7, 1.6, 0.25, 6.95, F+1.95, KC[0]); u.col(0.07, 0.43, 6.15, 7.75, F+1.6, F+2.3);
      for(const d of [6.35, 6.75, 7.15, 7.55]) u.b(0.012, 0.64, 0.37, 0.435, d, F+1.95, KC[2]);
      u.rb(0.7, 1.72, 0.66, 0.46, 8.13, F+0.86, look.fridge, 0.03); u.b(0.02, 0.5, 0.03, 0.82, 7.85, F+1.2, "#8a8a88"); u.col(0.1, 0.82, 7.79, 8.45, F-0.05, F+1.72);
      // the bath: the tub along the back wall and its curtain, the toilet, the vanity and its mirror, a towel
      u.b(1.5, 0.5, 0.74, 0.86, 11.4, F+0.25, "#cfc6b2"); u.b(1.36, 0.02, 0.6, 0.86, 11.4, F+0.49, "#b8b4a8"); u.col(0.08, 1.62, 11.02, 11.78, F-0.05, F+0.5);
      u.c(0.012, 1.5, 1.62, 11.4, F+2.0, "#9a9ea2", 8, Math.PI/2, 0, 0); u.b(0.02, 1.5, 0.8, 1.64, 11.4, F+1.3, look.curtain);
      u.rb(0.38, 0.4, 0.56, 2.7, 11.48, F+0.2, "#cfc6b2", 0.08); u.rb(0.42, 0.36, 0.18, 2.7, 11.68, F+0.6, "#cfc6b2", 0.04); u.col(2.49, 2.91, 11.18, 11.78, F-0.05, F+0.6);
      u.b(0.9, 0.8, 0.5, 3.9, 11.52, F+0.4, KC[0]); u.b(0.94, 0.04, 0.54, 3.9, 11.52, F+0.82, KC[1]); u.c(0.16, 0.02, 3.9, 11.5, F+0.84, "#cfc6b2", 16);
      u.b(0.62, 0.72, 0.02, 3.9, 11.765, F+1.45, "#9aa8ae"); u.col(3.44, 4.36, 11.26, 11.78, F-0.05, F+0.84);
      u.b(0.5, 0.02, 0.04, 2.0, 11.74, F+1.15, "#8a8e90"); u.b(0.4, 0.5, 0.03, 2.0, 11.71, F+0.92, look.towel); u.b(0.6, 0.012, 0.4, 2.2, 10.9, F+0.016, look.towel); }
    // a light in each room's ceiling: a frosted dome, and its lamp
    for(const [d, p, I] of [[3.0, 5.3, 0.55],[8.9, 6.7, 0.4],[7.2, 2.4, 0.42],[10.2, 2.4, 0.3]]){ u.c(0.17, 0.06, p, d, F+2.57, "#d8d0bc", 16); push("rn_glow", new T.SphereGeometry(0.12, 12, 6, 0, Math.PI*2, Math.PI/2, Math.PI/2), X(d), F+2.55, Z(s, p), 0, "#ffffff"); lamp(X(d), F+2.25, Z(s, p), I); }
    // the bedroom: the bed under the window, its nightstand and lamp, a dresser on the end wall, the closet along the partition
    { const w=look.bed, p=6.8;
      u.b(w, 0.3, 2.02, p, 10.75, F+0.24, look.wood); u.b(w+0.06, 0.92, 0.06, p, 11.74, F+0.46, look.wood);
      u.rb(w-0.04, 0.2, 1.96, p, 10.75, F+0.49, "#cfc6b4", 0.05); u.rb(w+0.02, 0.07, 1.52, p, 10.52, F+0.61, look.quilt, 0.03);
      for(const o of [-1, 1]) u.rb(w*0.4, 0.12, 0.38, p+o*w*0.24, 11.42, F+0.66, "#cfc6b4", 0.05);
      u.col(p-w/2-0.03, p+w/2+0.03, 9.73, 11.78, F-0.05, F+0.68);
      const ns=p-w/2-0.3; u.b(0.45, 0.55, 0.42, ns, 11.55, F+0.275, look.wood); u.c(0.07, 0.03, ns, 11.55, F+0.565, "#8a7a5a", 12); u.c(0.012, 0.3, ns, 11.55, F+0.72, "#8a7a5a", 6);
      u.c(0.11, 0.17, ns, 11.55, F+0.94, "#d4c8a8", 14); u.col(ns-0.23, ns+0.23, 11.33, 11.78, F-0.05, F+0.6);
      lamp(X(11.4), F+0.95, Z(s, ns), 0.18);
      u.b(0.5, 0.85, 1.2, 8.52, 7.0, F+0.425, look.wood); for(let i=0;i<3;i++){ u.b(0.012, 0.24, 1.12, 8.265, 7.0, F+0.17+i*0.27, look.wood); u.b(0.02, 0.025, 0.12, 8.25, 7.0, F+0.17+i*0.27, "#b8a068"); }
      u.col(8.26, 8.78, 6.4, 7.6, F-0.05, F+0.86);
      u.b(0.6, 2.2, 1.8, 4.94, 8.0, F+1.1, "#c4bca8"); for(const d of [7.55, 8.45]) u.b(0.012, 2.1, 0.88, 5.245, d, F+1.08, "#d0c8b4"); u.b(0.014, 0.02, 0.02, 5.255, 8.0, F+1.08, "#8a8a88");
      u.col(4.64, 5.25, 7.1, 8.9, F-0.05, F+2.2); }
    return {F:F, u:u, s:s, k:k, name:name}; };

  /* 101: Dale's. Plaid and oak; the console TV against the breezeway's wall, the sofa facing it, his recliner, a buck on the wall */
  { const s=-1, R=UNIT(s, 0, {floor:"carpet1", kfloor:"vinylA", kitchen:["#7a5a3a","#b0a080","#6a4a30"], fridge:"#b8ac8a", curtain:"#6a8a5a", towel:"#7a3a2a",
      bed:1.4, wood:"#6a4a2c", quilt:"#7a3a2a"}), {F, u}=R;
    seatAt(s, F, 8.32, 3.0, "in", 2.1, "#7a4a32", "DALE'S PLAID SOFA", true);
    for(let i=0;i<5;i++) u.b(0.012, 0.36, 0.3, 7.885, 2.2+i*0.4, F+0.2, i%2 ? "#5a2a1e" : "#7a4a32");
    u.b(0.6, 0.06, 1.2, 5.9, 3.0, F+0.42, "#8a6a44"); for(const [pp, dd] of [[5.65, 2.45],[6.15, 2.45],[5.65, 3.55],[6.15, 3.55]]) u.b(0.05, 0.39, 0.05, pp, dd, F+0.195, "#6a4a30");
    u.col(5.6, 6.2, 2.4, 3.6, F-0.05, F+0.45); u.b(0.28, 0.015, 0.21, 5.85, 2.8, F+0.458, "#b8281a"); u.b(0.26, 0.015, 0.2, 5.95, 3.2, F+0.46, "#2a5a7a");
    // the console TV: a cabinet with the set in it, its screen on
    u.b(0.55, 0.6, 1.3, 2.2, 3.0, F+0.3, "#6a4a30"); u.b(0.5, 0.52, 1.0, 2.2, 3.0, F+0.86, "#4a3424"); u.b(0.012, 0.44, 0.78, 2.455, 3.0, F+0.87, "#1a1a1a");
    push("lk_tvon", planeGeo(0.7, 0.4, 0), X(3.0), F+0.87, Z(s, 2.468), Math.PI, "#ffffff");
    u.c(0.008, 0.35, 2.2, 2.75, F+1.27, "#8a8e90", 6); u.c(0.008, 0.35, 2.2, 3.25, F+1.27, "#8a8e90", 6); u.col(1.9, 2.5, 2.33, 3.67, F-0.05, F+1.12);
    lamp(X(3.0), F+0.9, Z(s, 2.9), 0.12);
    seatAt(s, F, 6.9, 5.05, "in", 0.9, "#5a3a24", "DALE'S RECLINER", false, 0.9);
    pic(s, F, 7.4, 5.95, 1.85, "front", 0.7, 0.5, "#5a3a24", (c, W, H)=>{ c.fillStyle="#4a3a2a"; c.fillRect(0, 0, W, H); c.fillStyle="#8a6a44"; c.beginPath(); c.ellipse(W/2, H*0.6, W*0.18, H*0.3, 0, 0, 7); c.fill(); c.fillStyle="#3a2a1a"; c.beginPath(); c.arc(W*0.44, H*0.55, W*0.02, 0, 7); c.arc(W*0.56, H*0.55, W*0.02, 0, 7); c.fill(); });
    { const x=X(5.92), z=Z(s, 7.4); S(0.11, x+0.09, F+1.82, z, "#7a5a3a"); for(const o of [-1, 1]) for(let t=0;t<4;t++) C(0.012, 0.18, x+0.08, F+2.0+t*0.05, z+o*(0.06+t*0.05), "#c8bc98", 6, 0, 0, o*0.6); }
    pic(s, F, HL-WT-0.02, 2.9, 1.55, "in", 0.8, 0.55, "#5a3a24", (c, W, H)=>{ c.fillStyle="#6a88a0"; c.fillRect(0, 0, W, H); c.fillStyle="#3a5a3a"; c.fillRect(0, H*0.55, W, H*0.45); c.fillStyle="#2a3a2a"; for(let i=0;i<6;i++){ c.beginPath(); c.moveTo(W*(0.1+i*0.16), H*0.6); c.lineTo(W*(0.16+i*0.16), H*0.25); c.lineTo(W*(0.22+i*0.16), H*0.6); c.fill(); } });
    // his rods and waders by the door, the boots, a cap on the hook
    for(const [pp, dd] of [[1.55, 5.75],[1.62, 5.82]]) ent(new T.CylinderGeometry(0.006, 0.012, 2.1, 6), X(dd), F+1.02, Z(s, pp), "#2a2a2a", 0, 0, 0.08);
    u.rb(0.14, 0.32, 0.3, 1.45, 5.45, F+0.16, "#3a2a1a", 0.04); u.rb(0.14, 0.32, 0.3, 1.25, 5.45, F+0.16, "#3a2a1a", 0.04);
    // the table in the kitchen and two chairs, the mail on it; a calendar from the bait shop
    u.b(1.0, 0.04, 0.8, 2.6, 7.2, F+0.74, "#8a6a44"); for(const [pp, dd] of [[2.15, 6.85],[3.05, 6.85],[2.15, 7.55],[3.05, 7.55]]) u.b(0.05, 0.72, 0.05, pp, dd, F+0.36, "#6a4a30");
    u.col(2.08, 3.12, 6.78, 7.62, F-0.05, F+0.76); u.b(0.24, 0.02, 0.3, 2.4, 7.1, F+0.77, "#d0c8b4"); u.b(0.3, 0.28, 0.2, 2.85, 7.3, F+0.9, "#a88a5a");
    chairAt(s, F, 2.3, 7.95, "front", "#6a4a30", "A CHAIR AT DALE'S TABLE"); chairAt(s, F, 2.9, 6.45, "back", "#6a4a30", "A CHAIR AT DALE'S TABLE");
    pic(s, F, 4.565, 7.5, 1.5, "in", 0.35, 0.5, "#8a8a88", (c, W, H)=>{ c.fillStyle="#d0c8b4"; c.fillRect(0, 0, W, H); c.fillStyle="#2a5a3a"; c.fillRect(0, 0, W, H*0.42); c.fillStyle="#b8281a"; say(c, "JUNE", W/2, H*0.56, W*0.6, H*0.08, "#b8281a", "800");
      c.strokeStyle="rgba(0,0,0,0.3)"; for(let i=0;i<=7;i++){ c.beginPath(); c.moveTo(W*0.1+i*W*0.8/7, H*0.64); c.lineTo(W*0.1+i*W*0.8/7, H*0.94); c.stroke(); } });
    // the patio: the kettle grill, a lawn chair looking out, a cooler
    { const zg=Z(s, 3.0), zc=Z(s, 6.4), y=FL0-0.1;
      S(0.27, XFR+0.85, y+0.75, zg, "#1a1a1a"); for(let i=0;i<3;i++){ const a=i*2.09; ent(new T.CylinderGeometry(0.012, 0.012, 0.7, 6), XFR+0.85+Math.sin(a)*0.15, y+0.33, zg+Math.cos(a)*0.15, "#2a2a2a", Math.cos(a)*0.2, 0, -Math.sin(a)*0.2); }
      addCol(XFR+0.55, XFR+1.15, zg-0.3, zg+0.3, y-0.1, y+1.0);
      B(0.5, 0.04, 0.5, XFR+0.85, y+0.4, zc, "#2a6a3a"); B(0.05, 0.55, 0.5, XFR+0.62, y+0.66, zc, "#2a6a3a"); for(const o of [-0.23, 0.23]) B(0.5, 0.4, 0.025, XFR+0.85, y+0.2, zc+o, "#a8acae");
      addSeat(XFR+0.88, zc, y, U(s).yaw("front"), "A LAWN CHAIR ON DALE'S PATIO", false, 0.66); addCol(XFR+0.6, XFR+1.1, zc-0.26, zc+0.26, y-0.1, y+0.42);
      u.rb(0.35, 0.4, 0.55, 8.2, -1.2, y+0.2, "#c8281a", 0.04); u.col(8.02, 8.38, -1.48, -0.92, y-0.1, y+0.4); }
    APTS.radios.push({x:X(7.3), y:F+1.0, z:Z(s, 0.4), station:1, house:R.name, zone:R.name+" · THE KITCHEN", vol:0.3, reach:7}); u.b(0.14, 0.16, 0.3, 0.4, 7.6, F+0.98, "#3a3a3a"); }

  /* 102: Gina's. A futon and a bean bag, her computer on a door over two file cabinets, a board and block bookcase, posters, a guitar */
  { const s=1, R=UNIT(s, 0, {floor:"carpet2", kfloor:"vinylB", kitchen:["#c4b48c","#a8a498","#b8a880"], fridge:"#8a8e90", curtain:"#3a5a8a", towel:"#5a3a6a",
      bed:1.4, wood:"#4a4a4a", quilt:"#3a5a8a", bedfloor:"carpet2"}), {F, u}=R;
    seatAt(s, F, 8.3, 3.0, "in", 1.9, "#2a3a4a", "GINA'S FUTON", true, 0.9);
    u.rb(0.8, 0.42, 0.8, 5.8, 4.4, F+0.21, "#b8442e", 0.28); addSeat(X(4.4), Z(s, 5.8), F, U(s).yaw("in"), "THE BEAN BAG", false, 0.86); u.col(5.4, 6.2, 4.0, 4.8, F-0.05, F+0.35);
    // the desk: a door laid on two file cabinets against the breezeway's wall, the computer, its monitor, a printer, a lamp
    u.b(0.75, 0.04, 1.7, 2.22, 3.7, F+0.74, "#8a6a44"); for(const d of [3.05, 4.35]) u.b(0.62, 0.72, 0.4, 2.15, d, F+0.36, "#7a7e80"); u.col(1.83, 2.6, 2.85, 4.55, F-0.05, F+0.76);
    for(const d of [3.05, 4.35]) for(const y of [0.2, 0.55]) u.b(0.012, 0.03, 0.14, 2.465, d, F+y, "#3a3a3a");
    u.rb(0.42, 0.1, 0.5, 2.15, 3.7, F+0.81, "#c4b89c", 0.02); u.rb(0.36, 0.32, 0.38, 2.12, 3.7, F+1.02, "#c4b89c", 0.03); u.b(0.18, 0.03, 0.46, 2.48, 3.7, F+0.775, "#c4b89c");
    u.b(0.32, 0.12, 0.4, 2.2, 4.4, F+0.82, "#b8b0a0"); u.b(0.012, 0.3, 0.5, 2.03, 3.2, F+0.9, "#d0c8b8");
    { const scr=signTex(160, 120, (c, W, H)=>{ c.fillStyle="#08140a"; c.fillRect(0, 0, W, H); c.fillStyle="#5ae07a"; c.font="9px monospace"; c.textAlign="left";
        ["] 10 REM LEDGER RECONCILE","] 20 OPEN \"ACCTS\",1","] 30 INPUT#1,A$,B","] 40 IF B<0 THEN 200","] 50 T=T+B","] 60 GOTO 30","] RUN","?SYNTAX ERROR IN 40","] _"].forEach((t, i)=>c.fillText(t, 7, 14+i*12)); });
      const m=new T.Mesh(new T.PlaneGeometry(0.27, 0.2), new T.MeshBasicMaterial({map:scr, toneMapped:false})); m.position.set(X(3.7), F+1.03, Z(s, 2.305)); m.rotation.y=0; scene.add(m); }
    chairAt(s, F, 2.95, 3.7, "in", "#3a3a3a", "GINA'S DESK CHAIR");
    pic(s, F, HL-WT-0.02, 1.8, 1.55, "in", 0.6, 0.85, "#1a1a1a", (c, W, H)=>{ c.fillStyle="#141430"; c.fillRect(0, 0, W, H); const q=_trng(3); for(let i=0;i<50;i++){ c.fillStyle="#d8d0b8"; c.fillRect(q()*W, q()*H*0.7, 2, 2); }
      c.fillStyle="#d8a83a"; c.beginPath(); c.arc(W*0.62, H*0.3, W*0.07, 0, 7); c.fill(); c.strokeStyle="#d8a83a"; c.lineWidth=3; c.beginPath(); c.moveTo(W*0.6, H*0.32); c.lineTo(W*0.2, H*0.5); c.stroke(); say(c, "COMET 86", W/2, H*0.84, W*0.76, H*0.1, "#d8d0b8", "800"); });
    pic(s, F, HL-WT-0.02, 4.3, 1.55, "in", 0.6, 0.85, "#1a1a1a", (c, W, H)=>{ c.fillStyle="#2a5a8a"; c.fillRect(0, 0, W, H); c.fillStyle="#1a2a3a"; c.beginPath(); c.ellipse(W/2, H*0.45, W*0.32, H*0.12, -0.2, 0, 7); c.fill();
      say(c, "SAVE THE", W/2, H*0.72, W*0.72, H*0.09, "#d0c8b4", "900"); say(c, "WHALES", W/2, H*0.84, W*0.72, H*0.1, "#d0c8b4", "900"); });
    pic(s, F, CW+0.22, 1.2, 1.6, "out", 0.5, 0.7, "#8a2a22", (c, W, H)=>{ c.fillStyle="#1a1a1a"; c.fillRect(0, 0, W, H); for(let i=0;i<5;i++){ c.fillStyle=["#c8281a","#d8a83a","#2a8a5a","#2a5ab8","#8a2a8a"][i]; c.fillRect(0, H*(0.15+i*0.1), W, H*0.06); } say(c, "NEW WAVE NITE", W/2, H*0.82, W*0.76, H*0.08, "#d0c8b4", "800"); });
    // the bookcase of boards on cinder blocks along the front wall, a little TV on it, a boom box
    { const p0=6.45, p1=8.6, pm=(p0+p1)/2; for(const y of [0, 0.42, 0.84]){ for(const pp of [p0+0.15, p1-0.15]) u.b(0.2, 0.4, 0.3, pp, 0.4, F+y+0.2, "#8a8a86"); u.b(p1-p0, 0.025, 0.32, pm, 0.4, F+y+0.4125, "#9a7a52"); }
      for(let i=0;i<14;i++) u.b(0.04+((i*7)%3)*0.01, 0.24, 0.2, p0+0.35+i*0.1, 0.42, F+0.55, ["#2a4a6a","#b8442e","#3a6a3a","#c8a03a","#5a3a6a"][i%5]);
      u.rb(0.42, 0.32, 0.36, pm, 0.42, F+1.04, "#3a3a3a", 0.02); push("lk_tvon", planeGeo(0.24, 0.18, 0), X(0.6)-0.005, F+1.05, Z(s, pm), -Math.PI/2, "#ffffff");
      u.b(0.5, 0.2, 0.14, pm+0.6, 0.42, F+0.53, "#2a2a2a"); u.col(p0, p1, 0.22, 0.6, F-0.05, F+1.2); }
    // the guitar on its stand, pizza boxes, a laundry basket in the bedroom, a plant that needs water
    u.b(0.32, 0.04, 0.3, 7.1, 5.6, F+0.02, "#2a2a2a"); ent(boxGeo(0.36, 0.5, 0.1), X(5.6), F+0.32, Z(s, 7.1), "#9a5a2a", 0, 0, 0.12); ent(boxGeo(0.06, 0.55, 0.04), X(5.6)-0.06, F+0.82, Z(s, 7.1), "#3a2a1a", 0, 0, 0.12);
    u.col(6.9, 7.3, 5.4, 5.8, F-0.05, F+1.1);
    for(let i=0;i<3;i++) u.b(0.42, 0.045, 0.42, 4.1, 2.0+i*0.02, F+0.025+i*0.047, "#c4a878");
    u.b(0.65, 0.3, 0.45, 8.2, 9.0, F+0.15, "#9a9a8a"); u.c(0.15, 0.25, 7.2, 1.0, F+0.13, "#a8542a"); u.sph(0.2, 7.2, 1.0, F+0.4, "#6a6a3a");
    // the kitchen: a breakfast bar's two stools at the counter's end, a coffee maker, a stack of dishes
    u.b(1.0, 0.04, 0.5, 1.95, 7.75, F+0.9, "#b8a880"); u.b(0.06, 0.86, 0.42, 2.4, 7.75, F+0.44, "#c4b48c"); u.col(1.45, 2.45, 7.5, 8.0, F-0.05, F+0.92);
    for(const pp of [1.65, 2.2]){ u.c(0.17, 0.04, pp, 8.2, F+0.79, "#b8442e", 14); u.c(0.02, 0.77, pp, 8.2, F+0.39, "#8a8e90", 6); addSeat(X(8.2), Z(s, pp), F, U(s).yaw("front"), "A STOOL AT GINA'S COUNTER", false, 0.34); }
    u.b(0.2, 0.32, 0.22, 0.3, 6.25, F+1.06, "#2a2a2a"); u.b(0.28, 0.12, 0.24, 0.4, 7.0, F+0.96, "#c4b89c");
    // the patio: her bike against the screen, a hammock chair hung from the balcony, plants
    { const zb=Z(s, 7.9), y=FL0-0.1; for(const o of [-0.52, 0.52]) ent(new T.TorusGeometry(0.33, 0.022, 6, 22), XFR+0.75+o, y+0.35, zb, "#1a1a1a", 0, 0, 0);
      ent(boxGeo(1.0, 0.04, 0.04), XFR+0.75, y+0.62, zb, "#2a5ab8", 0, 0, 0.08); ent(boxGeo(0.6, 0.04, 0.04), XFR+0.55, y+0.5, zb, "#2a5ab8", 0, 0, -0.9); B(0.22, 0.05, 0.1, XFR+0.42, y+0.85, zb, "#1a1a1a");
      addCol(XFR+0.15, XFR+1.35, zb-0.12, zb+0.12, y-0.1, y+0.95);
      for(const pp of [3.0, 3.6]){ C(0.15, 0.3, XFR+1.3, y+0.15, Z(s, pp), "#a8542a", 12); S(0.22, XFR+1.3, y+0.45, Z(s, pp), "#3a6a3a"); } u.col(2.8, 3.8, -1.48, -1.12, y-0.1, y+0.6); }
    APTS.radios.push({x:X(0.42), y:F+0.53, z:Z(s, 8.15), station:2, house:R.name, zone:R.name, vol:0.38, reach:8}); }

  /* 201: the Hallorans'. Tidy; a glass table set for two, the leather loveseat, a bookcase, prints, a rug, plants */
  { const s=-1, R=UNIT(s, 1, {floor:"wood", kfloor:"vinylC", kitchen:["#5a3e28","#c0b8a8","#4a3220"], fridge:"#b0aa96", curtain:"#c8b8a0", towel:"#3a5a7a",
      bed:1.6, wood:"#4a2e1e", quilt:"#b8a888", bedfloor:"carpet3"}), {F, u}=R;
    seatAt(s, F, 8.32, 3.0, "in", 1.6, "#4a2a1e", "THE HALLORANS' LOVESEAT", true);
    seatAt(s, F, 5.6, 5.1, "out", 0.85, "#6a5a3a", "THE WING CHAIR", false, 0.8);
    { const rg=signTex(256, 180, (c, W, H)=>{ c.fillStyle="#2a3650"; c.fillRect(0, 0, W, H); c.strokeStyle="#b8a070"; c.lineWidth=6; c.strokeRect(10, 10, W-20, H-20); c.strokeStyle="#7a3426"; c.lineWidth=4; c.strokeRect(26, 26, W-52, H-52);
        c.fillStyle="#7a3426"; c.beginPath(); c.ellipse(W/2, H/2, W*0.16, H*0.16, 0, 0, 7); c.fill(); });
      const [a, b]=zr(s, 4.4, 7.4); const m=new T.Mesh(new T.PlaneGeometry(2.2, b-a), new T.MeshStandardMaterial({map:rg, roughness:0.95, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-6}));
      m.rotation.x=-Math.PI/2; m.position.set(X(3.0), F+0.028, (a+b)/2); m.matrixAutoUpdate=false; m.updateMatrix(); m.receiveShadow=true; scene.add(m); }
    u.b(0.55, 0.02, 1.05, 5.95, 3.0, F+0.42, "#9ab0b4"); for(const o of [-0.45, 0.45]) for(const q of [-0.22, 0.22]) u.b(0.03, 0.4, 0.03, 5.95+q, 3.0+o, F+0.2, "#b8944a");
    u.col(5.66, 6.24, 2.46, 3.54, F-0.05, F+0.44); u.b(0.3, 0.03, 0.22, 5.9, 3.2, F+0.445, "#3a5a7a"); u.c(0.06, 0.1, 6.0, 2.75, F+0.48, "#d0c8b4", 12);
    // the cabinet the TV lives in, doors shut; the bookcase; prints over the loveseat
    u.b(0.5, 1.4, 1.2, 2.1, 3.0, F+0.7, "#4a2e1e"); for(const o of [-0.29, 0.29]) u.b(0.012, 0.9, 0.56, 2.355, 3.0+o, F+0.9, "#5a3a26"); u.col(1.83, 2.37, 2.38, 3.62, F-0.05, F+1.4);
    u.c(0.08, 0.26, 2.1, 3.3, F+1.53, "#3a5a6a"); u.c(0.06, 0.04, 2.1, 2.7, F+1.42, "#b8944a"); u.c(0.012, 0.3, 2.1, 2.7, F+1.59, "#b8944a", 6); u.c(0.14, 0.18, 2.1, 2.7, F+1.8, "#d0c4a4", 16);
    u.b(1.0, 1.9, 0.03, 7.55, 5.925, F+0.95, "#4a2e1e"); for(const pp of [7.065, 8.035]) u.b(0.03, 1.9, 0.34, pp, 5.77, F+0.95, "#4a2e1e"); u.b(1.0, 0.03, 0.34, 7.55, 5.77, F+1.915, "#4a2e1e");
    u.col(7.03, 8.07, 5.57, 5.94, F-0.05, F+1.9);
    for(let i=0;i<5;i++){ u.b(0.96, 0.02, 0.3, 7.55, 5.76, F+0.06+i*0.38, "#5a3a26"); for(let j=0;j<8;j++) if((i*8+j)%7) u.b(0.08+((i+j)%3)*0.015, 0.26, 0.22, 7.15+j*0.11, 5.72, F+0.21+i*0.38, ["#6a2a22","#2a3a5a","#3a5a3a","#8a6a3a","#4a2a3a"][(i+j*2)%5]); }
    pic(s, F, HL-WT-0.02, 2.4, 1.6, "in", 0.62, 0.8, "#b8944a", (c, W, H)=>{ c.fillStyle="#d0c4a8"; c.fillRect(0, 0, W, H); c.fillStyle="#6a88a0"; c.fillRect(W*0.12, H*0.12, W*0.76, H*0.48); c.fillStyle="#4a6a4a"; c.fillRect(W*0.12, H*0.6, W*0.76, H*0.24); c.fillStyle="#2a2a2a"; c.fillRect(W*0.62, H*0.38, W*0.04, H*0.26); });
    pic(s, F, HL-WT-0.02, 3.6, 1.6, "in", 0.62, 0.8, "#b8944a", (c, W, H)=>{ c.fillStyle="#c8b898"; c.fillRect(0, 0, W, H); c.fillStyle="#8a3a2a"; c.beginPath(); c.arc(W/2, H*0.42, W*0.24, 0, 7); c.fill(); c.fillStyle="#3a5a3a"; c.fillRect(W*0.48, H*0.6, W*0.04, H*0.3); });
    pic(s, F, CW+0.22, 4.6, 1.55, "out", 0.5, 0.4, "#2a2a2a", (c, W, H)=>{ c.fillStyle="#d0c8b4"; c.fillRect(0, 0, W, H); c.fillStyle="#3a3a3a"; c.beginPath(); c.arc(W*0.38, H*0.5, H*0.26, 0, 7); c.arc(W*0.64, H*0.52, H*0.24, 0, 7); c.fill(); });
    // the glass table and its two chairs in the kitchen's end, two places laid and a candle; a wine rack
    u.b(0.9, 0.02, 1.2, 2.6, 7.2, F+0.74, "#9ab0b4"); for(const [pp, dd] of [[2.2, 6.65],[3.0, 6.65],[2.2, 7.75],[3.0, 7.75]]) u.b(0.03, 0.73, 0.03, pp, dd, F+0.365, "#b8944a"); u.col(2.13, 3.07, 6.58, 7.82, F-0.05, F+0.76);
    for(const dd of [6.85, 7.55]){ u.c(0.13, 0.012, 2.6, dd, F+0.758, "#d0c8b4", 18); u.b(0.18, 0.008, 0.02, 2.82, dd, F+0.756, "#a8acae"); }
    u.c(0.02, 0.22, 2.6, 7.2, F+0.86, "#d4c8a0", 8); u.c(0.05, 0.02, 2.6, 7.2, F+0.76, "#b8944a", 10);
    chairAt(s, F, 2.6, 6.3, "back", "#4a2a1e", "A CHAIR AT THE HALLORANS' TABLE"); chairAt(s, F, 2.6, 8.13, "front", "#4a2a1e", "A CHAIR AT THE HALLORANS' TABLE");
    for(const [pp, dd] of [[2.1, 5.7],[8.35, 0.65],[5.1, 11.4]]){ u.c(0.17, 0.4, pp, dd, F+0.2, "#9a4a2a", 14); u.sph(0.3, pp, dd, F+0.7, "#3a5a2e"); }
    // the balcony: a bistro table and two chairs, flower boxes along the rail
    { const y=FL1, zt=Z(s, 5.4);
      C(0.3, 0.025, XFR+0.85, y+0.72, zt, "#2a2a2c", 18); C(0.02, 0.7, XFR+0.85, y+0.36, zt, "#2a2a2c", 8); C(0.18, 0.02, XFR+0.85, y+0.01, zt, "#2a2a2c", 14); addCol(XFR+0.55, XFR+1.15, zt-0.3, zt+0.3, y-0.05, y+0.75);
      chairAt(s, y, 4.65, -0.85, "out", "#2a2a2c", "A CHAIR ON THE HALLORANS' BALCONY"); chairAt(s, y, 6.15, -0.85, "in", "#2a2a2c", "A CHAIR ON THE HALLORANS' BALCONY");
      const [a, b]=zr(s, 2.2, 8.75); B(0.2, 0.16, b-a, XFR+BD-0.22, y+1.0-0.1, (a+b)/2, "#6a4a30");
      for(let i=0;i<26;i++){ const z=a+0.15+i*(b-a-0.3)/25; S(0.045+r()*0.025, XFR+BD-0.22+(i%2 ? 0.04 : -0.04), y+1.0+0.03+r()*0.04, z, ["#b8442e","#d0a03a","#b8609a","#cfc6b4"][i%4]); }
      for(let i=0;i<9;i++) S(0.09, XFR+BD-0.22, y+0.98, a+0.3+i*(b-a-0.6)/8, "#3a5a2e"); }
    APTS.radios.push({x:X(3.0), y:F+1.3, z:Z(s, 2.1), station:3, house:R.name, zone:R.name, vol:0.22, reach:7, low:true}); }

  /* 202: Ray's. The aquarium on its stand, the stereo and crates of records, an exercise bike, a lava lamp, the Otters */
  { const s=1, R=UNIT(s, 1, {floor:"shag", kfloor:"vinylA", kitchen:["#6e6a4e","#b0a890","#5a5640"], fridge:"#6a7a4e", curtain:"#c8a03a", towel:"#2a6a6a",
      bed:1.4, wood:"#5a4a34", quilt:"#5a6a3a", bedfloor:"carpet3"}), {F, u}=R;
    seatAt(s, F, 7.7, 3.0, "in", 0.95, "#6a5a3a", "RAY'S RECLINER", false, 0.95);
    seatAt(s, F, 8.3, 4.6, "in", 1.6, "#4a5a3a", "RAY'S COUCH", true, 0.85);
    u.b(0.42, 0.5, 0.42, 7.7, 1.9, F+0.25, "#5a4a34"); u.c(0.06, 0.06, 7.7, 1.9, F+0.53, "#2a2a2a", 10); u.c(0.045, 0.22, 7.7, 1.9, F+0.67, "#b8509a", 10);
    push("rn_glow", new T.SphereGeometry(0.04, 8, 6), X(1.9), F+0.66, Z(s, 7.7), 0, "#ffffff"); u.col(7.49, 7.91, 1.69, 2.11, F-0.05, F+0.8); lamp(X(1.9), F+0.75, Z(s, 7.7), 0.1);
    // the aquarium against the breezeway's wall, lit, the fish in it
    u.b(0.45, 0.7, 1.25, 2.1, 3.0, F+0.35, "#2a2a2a"); u.b(0.42, 0.06, 1.22, 2.1, 3.0, F+1.24, "#2a2a2a"); u.b(0.4, 0.05, 1.18, 2.1, 3.0, F+0.73, "#8a7a5a");
    u.b(0.38, 0.46, 1.16, 2.07, 3.0, F+0.98, "#2e5a66"); push("lk_tvon", planeGeo(1.12, 0.42, 0), X(3.0), F+0.98, Z(s, 2.27), 0, "#ffffff");
    for(let i=0;i<6;i++) u.sph(0.022, 2.262, 2.6+i*0.16, F+0.86+(i%3)*0.1, ["#e8762a","#d8b03a","#3a8ab8"][i%3]); u.b(0.06, 0.2, 0.04, 2.0, 2.7, F+0.86, "#3a7a3a"); u.b(0.06, 0.26, 0.04, 2.05, 3.3, F+0.89, "#3a7a3a");
    u.col(1.85, 2.35, 2.36, 3.64, F-0.05, F+1.28);
    // the stereo cabinet on the front wall, the turntable on it, the speakers, crates of records
    u.b(0.48, 0.66, 1.3, 7.6, 0.48, F+0.33, "#5a4a34"); u.b(0.42, 0.1, 0.44, 7.4, 0.48, F+0.71, "#2a2a2a"); u.c(0.15, 0.012, 7.4, 0.48, F+0.765, "#1a1a1a", 20);
    u.b(0.4, 0.12, 0.36, 7.9, 0.48, F+0.72, "#8a8e90"); for(const pp of [6.65, 8.5]){ u.b(0.4, 0.8, 0.32, pp, 0.42, F+0.4, "#4a3a2a"); u.c(0.1, 0.012, pp, 0.58, F+0.55, "#1a1a1a", 14, Math.PI/2, 0, 0); }
    u.col(6.45, 8.7, 0.22, 0.73, F-0.05, F+0.8);
    for(let i=0;i<2;i++){ const pp=7.0+i*0.48; u.b(0.42, 0.32, 0.36, pp, 1.0, F+0.16, "#9a7a4a"); for(let j=0;j<6;j++) u.b(0.32, 0.31, 0.008, pp, 0.86+j*0.05, F+0.2, ["#b8442e","#2a4a8a","#d0a83a","#1a1a1a"][(i+j)%4]); }
    u.col(6.78, 7.7, 0.82, 1.2, F-0.05, F+0.34);
    // the exercise bike by the bedroom door, a jacket over it; the Otters on the wall
    { const x=X(7.3), z=Z(s, 7.1); B(0.9, 0.08, 0.3, x, F+0.04, z, "#3a3a3e"); ent(boxGeo(0.08, 0.95, 0.08), x-0.15, F+0.5, z, "#3a3a3e", 0, 0, 0.25); B(0.2, 0.06, 0.26, x-0.27, F+0.98, z, "#1a1a1a");
      C(0.22, 0.06, x+0.22, F+0.35, z, "#2a2a2a", 18, Math.PI/2, 0, 0); ent(boxGeo(0.06, 0.6, 0.06), x+0.25, F+0.7, z, "#3a3a3e", 0, 0, -0.3); B(0.06, 0.04, 0.5, x+0.33, F+1.02, z, "#3a3a3e"); addCol(x-0.48, x+0.48, z-0.25, z+0.25, F-0.05, F+1.05); }
    pic(s, F, 6.6, 5.95, 1.7, "front", 0.9, 0.6, "#2a2a2a", (c, W, H)=>{ c.fillStyle="#1e1e1e"; c.fillRect(0, 0, W, H); say(c, "ERIE OTTERS", W/2, H*0.4, W*0.76, H*0.22, "#d0a83a", "900"); say(c, "SEASON TICKET HOLDER", W/2, H*0.72, W*0.72, H*0.1, "#cfc6b4", "700"); });
    pic(s, F, HL-WT-0.02, 2.0, 1.6, "in", 0.7, 0.5, "#6a4a30", (c, W, H)=>{ c.fillStyle="#5a8aa8"; c.fillRect(0, 0, W, H); c.fillStyle="#3a6a8a"; c.fillRect(0, H*0.55, W, H*0.45); c.fillStyle="#cfc6b4"; c.beginPath(); c.moveTo(W*0.3, H*0.55); c.lineTo(W*0.5, H*0.2); c.lineTo(W*0.5, H*0.55); c.fill(); });
    // the kitchen: the table and two chairs, the bowling trophy on the fridge
    u.b(0.9, 0.04, 0.9, 2.6, 7.2, F+0.74, "#7a7458"); for(const [pp, dd] of [[2.2, 6.8],[3.0, 6.8],[2.2, 7.6],[3.0, 7.6]]) u.b(0.04, 0.72, 0.04, pp, dd, F+0.36, "#5a5444"); u.col(2.13, 3.07, 6.73, 7.67, F-0.05, F+0.76);
    chairAt(s, F, 2.6, 6.33, "back", "#5a5444", "A CHAIR AT RAY'S TABLE"); chairAt(s, F, 2.6, 8.07, "front", "#5a5444", "A CHAIR AT RAY'S TABLE");
    u.b(0.1, 0.24, 0.1, 0.46, 8.13, F+1.84, "#c8a03a"); u.b(0.16, 0.04, 0.16, 0.46, 8.13, F+1.74, "#2a2a2a");
    // the balcony: an Adirondack chair looking out, a little table, the bird feeder on its arm off the rail, a wind chime
    { const y=FL1, z=Z(s, 6.0);
      for(let i=0;i<6;i++) B(0.55, 0.025, 0.09, XFR+0.85, y+0.34, z-0.25+i*0.1, "#3a6a8a"); for(let i=0;i<5;i++) ent(boxGeo(0.09, 0.8, 0.025), XFR+0.52, y+0.62, z-0.2+i*0.1, "#3a6a8a", 0, 0, -0.35);
      for(const o of [-0.33, 0.33]) B(0.6, 0.025, 0.12, XFR+0.85, y+0.56, z+o, "#3a6a8a"); for(const o of [-0.33, 0.33]) for(const q of [0.6, 1.08]) B(0.04, q<1 ? 0.56 : 0.38, 0.04, XFR+q, (q<1 ? 0.28 : 0.19)+y, z+o, "#3a6a8a");
      addSeat(XFR+0.88, z, y, U(s).yaw("front"), "THE ADIRONDACK ON RAY'S BALCONY", false, 0.76); addCol(XFR+0.45, XFR+1.12, z-0.38, z+0.38, y-0.05, y+0.56);
      B(0.4, 0.04, 0.4, XFR+0.85, y+0.45, Z(s, 6.75), "#3a6a8a"); u.c(0.035, 0.12, 6.75, -0.85, y+0.53, "#8a5a2a", 10); u.col(6.55, 6.95, -1.05, -0.65, y-0.05, y+0.47);
      const fz=Z(s, 3.2); B(0.04, 0.04, 0.5, XFR+BD-0.08, y+1.05, fz+0.25*s, RAIL); C(0.006, 0.18, XFR+BD-0.08, y+0.95, fz+0.48*s, "#2a2a2a", 6);
      B(0.18, 0.16, 0.18, XFR+BD-0.08, y+0.78, fz+0.48*s, "#8a6a44"); B(0.24, 0.03, 0.24, XFR+BD-0.08, y+0.875, fz+0.48*s, "#6a4a30");
      for(let i=0;i<5;i++) C(0.006, 0.22+i*0.04, XFR+0.6+i*0.035, y+2.15-i*0.02, Z(s, 8.2), "#a8acae", 6); }
    APTS.radios.push({x:X(0.48), y:F+0.8, z:Z(s, 7.4), station:3, house:R.name, zone:R.name, vol:0.4, reach:8}); }
  buildFloors();

  /* ---- the lot: seven stalls in front, curb stops, the light on its pole, the dumpster in its corral, the sign at the road ---- */
  const SX=703.4, SXE=708.9;
  for(const z of [-1867.0, -1869.7, -1872.4, -1875.1, -1877.8, -1863.0, -1860.3, -1857.6, -1854.9]) stripe(SX+0.3, z, SXE, z, 0.1, WHITE_LINE, LY);
  for(const z of [-1868.35, -1871.05, -1873.75, -1876.45, -1861.65, -1858.95, -1856.25]){ B(0.16, 0.12, 1.7, SX+0.5, LY+0.06, z, "#8a867e"); addCol(SX+0.42, SX+0.58, z-0.85, z+0.85, LY-0.2, LY+0.12); }
  for(const z of [-1866.7, -1863.3]) stripe(SX+0.3, z, SX+2.2, z, 0.1, "#c8a03a", LY+0.002);
  if(typeof parked==="function"){ parked(1, "#3a4a5a", 706.4, -1871.05, -Math.PI/2, Y); parked(0, "#6a2a22", 706.4, -1876.45, -Math.PI/2, Y); parked(2, "#5a5a4a", 706.4, -1858.95, -Math.PI/2, Y); }
  { const x=717.6, z=-1855.6, g=gy(x, z); C(0.07, 6.2, x, g+3.1, z, "#5a5e60", 12); B(0.62, 0.12, 0.3, x-0.32, g+6.2, z, "#3a3e40"); push("rn_glow", boxGeo(0.42, 0.02, 0.2, 0), x-0.36, g+6.13, z, 0, "#ffffff");
    addCol(x-0.08, x+0.08, z-0.08, z+0.08, g-0.5, g+6.2); const L={x:x-0.36, y:g+5.9, z:z, color:0xffd8a0, intensity:0, dist:18, decay:1.4, mothy:true}; LAMPS.push(L); APTS.lamps.push(L); }
  { const x0=711.2, x1=715.8, z0=-1878.95, z1=-1875.5, g=LY;
    B(x1-x0, 0.1, z1-z0, (x0+x1)/2, g+0.05, (z0+z1)/2, "#8a867e");
    for(const [ax, a0, a1, c] of [["x", x0, x1, z0+0.04],["z", z0+0.08, z1-1.4, x0+0.04],["z", z0+0.08, z1-1.4, x1-0.04]]){ const L=a1-a0, n=Math.round(L/0.14);
      for(let i=0;i<n;i++){ const a=a0+L*(i+0.5)/n; ax==="x" ? B(0.13, 1.7, 0.03, a, g+0.95, c, i%2 ? "#6a5a44" : "#5e5040") : B(0.03, 1.7, 0.13, c, g+0.95, a, i%2 ? "#6a5a44" : "#5e5040"); }
      for(const y of [0.4, 1.5]) ax==="x" ? B(L, 0.08, 0.04, (a0+a1)/2, g+y, c+0.035, "#4a3e30") : B(0.04, 0.08, L, c+(c<(x0+x1)/2 ? 0.035 : -0.035), g+y, (a0+a1)/2, "#4a3e30");
      ax==="x" ? addCol(a0, a1, c-0.05, c+0.05, g-0.3, g+1.8) : addCol(c-0.05, c+0.05, a0, a1, g-0.3, g+1.8); }
    for(const x of [x0+0.04, x1-0.04]) for(const z of [z0+0.04, z1-1.4]) B(0.1, 1.85, 0.1, x, g+0.93, z, "#4a3e30");
    const dx=(x0+x1)/2-0.1, dz=z0+0.95; RB(2.0, 1.2, 1.5, dx, g+0.72, dz, "#2a5a3a", 0, 0.05, CH); for(const o of [-0.5, 0.5]) ent(boxGeo(0.98, 0.04, 1.56), dx+o, g+1.36, dz-0.02, "#1a3a2a", 0.06, 0, 0, CH);
    B(2.04, 0.08, 0.06, dx, g+1.0, dz+0.78, "#1a3a2a", 0, CH); for(const o of [-0.85, 0.85]) B(0.1, 0.1, 1.4, dx+o, g+0.2, dz, "#1a3a2a", 0, CH);
    sign(0.8, 0.22, (c, W, H)=>{ c.fillStyle="#cfc6b4"; c.fillRect(0, 0, W, H); say(c, "TRI-COUNTY HAULING", W/2, H*0.4, W*0.8, H*0.36, "#1a3a2a", "800"); say(c, "814-734-2200", W/2, H*0.76, W*0.6, H*0.2, "#1a3a2a", "700"); }, dx, g+0.82, dz+0.761, 0, false, 220);
    addCol(dx-1.0, dx+1.0, dz-0.75, dz+0.8, g-0.3, g+1.42);
    RB(0.55, 0.95, 0.6, x1-0.45, g+0.575, z1-1.2, "#2a2a2c", 0, 0.06); addCol(x1-0.75, x1-0.15, z1-1.5, z1-0.9, g-0.3, g+1.05);
    RB(0.55, 0.95, 0.6, x1-0.45, g+0.575, dz, "#2a4a7a", 0, 0.06); addCol(x1-0.75, x1-0.15, dz-0.3, dz+0.3, g-0.3, g+1.05);
    B(0.6, 0.35, 0.45, x0+0.5, g+0.27, z1-0.3, "#a88a5a"); }
  // the sign at the road, on two posts beyond its ends, read both ways along the road
  { const x=719.8, z=AP.mouth.z0-3.2, g=gy(x, z), W2=2.4, H2=1.0, top=g+2.1;
    for(const dz of [-W2/2-0.1, W2/2+0.1]){ B(0.14, top+0.12-g, 0.14, x, (top+0.12+g)/2, z+dz, "#cfc6b4"); C(0.1, 0.04, x, top+0.14, z+dz, "#3a4a3a", 4); addCol(x-0.08, x+0.08, z+dz-0.08, z+dz+0.08, g-0.5, top+0.1); }
    B(0.1, H2+0.08, W2+0.08, x, top-H2/2, z, "#3a4a3a"); B(0.08, 0.06, W2+0.2, x, top-H2-0.12, z, "#3a4a3a");
    const draw=(c, W, H)=>{ c.fillStyle="#3a4a3a"; c.fillRect(0, 0, W, H); c.strokeStyle="#cfcac0"; c.lineWidth=4; c.strokeRect(10, 10, W-20, H-20);
      say(c, "BIRCH HOLLOW", W/2, H*0.38, W*0.76, H*0.3, "#d8d0c0", "700", "Georgia, serif"); say(c, "APARTMENTS  ·  RESIDENT PARKING ONLY", W/2, H*0.72, W*0.72, H*0.12, "#c4bca4", "600"); };
    for(const sd of [-1, 1]) sign(W2, H2, draw, x+sd*0.065, top-H2/2, z, sd<0 ? -Math.PI/2 : Math.PI/2, false, 560);
    if(typeof FOREST!=="undefined") for(const o of [-1.9, 1.9]) FOREST.plant("shrub", x+0.2, z+o, {scale:0.6, solid:false}); }
  if(typeof FOREST!=="undefined"){ for(const z of [-1873.2, -1867.8, -1862.2, -1856.8]) FOREST.plant("shrub", XFR+2.35, z, {scale:0.75, solid:false});
    for(const x of [690, 693, 696]) FOREST.plant("shrub", x, ZS-1.3, {scale:0.7, solid:false}); }

  /* ---- the walls of the world round it (the bookstore's along its south edge), the woods close behind ---- */
  { const W=(x0, x1, z0, z1)=>addCol(x0, x1, z0, z1, -40, 300); W(S0.x0-0.4, S0.x0+0.4, S0.z0, S0.z1); W(S0.x0, S0.x1, S0.z0-0.4, S0.z0+0.4); }
  if(typeof FOREST!=="undefined"){ const q=_trng(1980);
    const tree=(sp, x, z, sc)=>{ FOREST.plant(sp, x, z, {scale:sc}); const rr=0.24*sc, g=gy(x, z); addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const row=(x0, z0, x1, z1, nx, nz)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/6.2));
      for(let k=0;k<=n;k++) for(const dep of [1.8, 6.5, 11.5, 16.5]){ if(q()<0.12) continue; const t=(k+q()*0.6)/n, x=x0+(x1-x0)*t+nx*(dep+q()*2.2), z=z0+(z1-z0)*t+nz*(dep+q()*2.2);
        tree(dep<2 ? "edge" : q()<0.35 ? "hemlock" : q()<0.5 ? "pine" : "hard", x, z, 0.85+q()*0.4); } };
    row(S0.x0, S0.z0, S0.x0, S0.z1, -1, 0); row(S0.x0, S0.z0, 700, S0.z0, 0, -1);
    tree("lawn", 677.0, -1872.5, 0.95); tree("lawn", 680.5, -1859.0, 0.9); tree("edge", 674.0, -1866.0, 1.0); }

  /* ---- the people: Gina at her computer after work, Dale back in his recliner, Ray out on the balcony of an afternoon,
     Mrs. Halloran with a book in the wing chair; each decided only while you are well away ---- */
  if(typeof crowdGroup==="function"){ const G=crowdGroup("birch hollow", XR, ZC, 70);
    const home=(x, z, a, b)=>(p)=>{ const c=camera.position;
      if(p.here===undefined || Math.hypot(c.x-x, c.z-z)>16){ const h=DayNight.state.hour; p.here=a<b ? (h>=a && h<b) : (h>=a || h<b); } return p.here; };
    const L=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#5a5a5a", pants:"#2a2e3a", shoes:"#2a2a2a"}, o);
    { const s=1, x=X(3.7), z=Z(s, 2.95); crowdAdd(G, {look:L({female:true, h:0.96, skin:SKINS[2], hair:"#1a1716", hairStyle:"pony", shirt:"#5a3a6a", long:true}),
        x:x, z:z, y:FL0, yaw:U(s).yaw("in")+Math.PI, mode:"sit", sitY:0.515, sway:0.12, when:home(x, z, 18.5, 1.5)}); }
    { const s=-1, x=X(5.05), z=Z(s, 6.9); crowdAdd(G, {look:L({skin:SKINS[1], hair:"#4a3020", beard:"#4a3020", beardStyle:"full", shirt:"#7a2a22", pants:"#3b4a66", belly:true}),
        x:x, z:z, y:FL0, yaw:U(s).yaw("in")+Math.PI, mode:"sit", job:"recline", sitY:0.585, held:"can", drink:true, sway:0.1, when:home(x, z, 18, 23.5)}); }
    { const s=1, x=XFR+0.88, z=Z(s, 6.0); crowdAdd(G, {look:L({skin:SKINS[0], hair:"#8d8a86", hairStyle:"recede", beard:"#9a958e", beardStyle:"short", shirt:"#6a7a5a", pants:"#5c5a52"}),
        x:x, z:z, y:FL1, yaw:U(s).yaw("front")+Math.PI, mode:"sit", sitY:0.4, sway:0.2, held:"can", drink:true, when:home(x, z, 13, 19.5)}); }
    { const s=-1, x=X(5.1), z=Z(s, 5.6); crowdAdd(G, {look:L({female:true, h:0.95, skin:SKINS[0], hair:"#6b4a2b", hairStyle:"bun", shirt:"#4a6a8a", long:true}),
        x:x, z:z, y:FL1, yaw:U(s).yaw("out")+Math.PI, mode:"sit", sitY:0.515, sway:0.15, held:"book", when:home(x, z, 19, 22.5)}); } }

  /* ---- what is built ---- */
  detailMesh(ME, new T.MeshStandardMaterial({vertexColors:true, roughness:0.8, metalness:0.03}), "birch-hollow", true);
  detailMesh(CH, new T.MeshStandardMaterial({vertexColors:true, roughness:0.55, metalness:0.3}), "birch-hollow-metal", true);

  /* ---- the ways round it, for tools/walk.js ---- */
  const MZ=(AP.mouth.z0+AP.mouth.z1)/2, FR=ZC+0.9;                    // (FR: up the breezeway's free side, clear of the stair)
  const IN=(sd)=>[[695.6, Z(sd, 0.73)],[X(5.75), Z(sd, 0.73)]];             // (through a unit's door, and clear of the counter before turning)
  APTS.routes={
    "birch hollow: in off Hollow Road, across the lot, up the walk to the breezeway":[[731.0, MZ],[722.0, MZ],[712.5, MZ],[712.5, ZC],[705.0, ZC],[701.0, FR],[696.4, FR]],
    "birch hollow: round the lot to the dumpster":[[712.5, ZC],[710.0, -1870.0],[710.0, -1874.6],[713.4, -1874.6]],
    "birch hollow: into 102, the kitchen, the bath":[[697.5, FR],[695.6, FR]].concat(IN(1), [[X(5.75), Z(1, 1.2)],[X(5.65), Z(1, 1.3)],[X(5.65), Z(1, 4.05)],[X(7.9), Z(1, 4.05)],[X(8.1), Z(1, 3.81)],[X(9.6), Z(1, 3.81)],[X(9.8), Z(1, 3.2)]]),
    "birch hollow: into 102, the living room, the bedroom":[[695.6, FR]].concat(IN(1), [[X(5.6), Z(1, 2.4)],[X(5.3), Z(1, 5.45)],[X(6.6), Z(1, 5.45)],[X(6.6), Z(1, 6.15)],[X(7.7), Z(1, 6.15)]]),
    "birch hollow: under the landing, into 101":[[697.5, FR],[695.6, FR],[695.6, Z(-1, 0.73)]].concat(IN(-1), [[X(5.6), Z(-1, 2.6)],[X(5.3), Z(-1, 5.45)],[X(6.6), Z(-1, 5.45)],[X(6.6), Z(-1, 6.15)],[X(7.7), Z(-1, 6.15)]]),
    "birch hollow: up the stair to the landing, into 201":[[703.0, Z(-1, 0.98)],[701.6, Z(-1, 0.98)],[697.0, Z(-1, 0.98)],[695.7, Z(-1, 0.98)]].concat(IN(-1), [[X(5.75), Z(-1, 1.2)],[X(5.65), Z(-1, 1.3)],[X(5.65), Z(-1, 4.05)],[X(7.9), Z(-1, 4.05)],[X(8.1), Z(-1, 3.81)],[X(9.6), Z(-1, 3.81)]]),
    "birch hollow: from the landing into 202, the bedroom":{y0:FL1+0.05, pts:[[695.7, Z(-1, 0.6)],[695.6, Z(1, 0.73)]].concat(IN(1).slice(1), [[X(5.6), Z(1, 2.4)],[X(5.3), Z(1, 5.45)],[X(6.6), Z(1, 5.45)],[X(6.6), Z(1, 6.15)],[X(7.7), Z(1, 6.15)]])}};
})();
/* the breezeway's lamps and the lot's light come on after dark */
function updateApts(dt, dark){ const k=smoothstep(0.3, 0.6, dark); for(const L of APTS.lamps) L.intensity=(L.dist>10 ? 0.9 : 0.55)*k; }
