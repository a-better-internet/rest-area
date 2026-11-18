"use strict";
/* REST AREA · 14s2-radio.js
   north of the substation, at the foot of the hills: French Creek
   Broadcasting, a radio station built in 1940, and its tower on the hill
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14s2 · FRENCH CREEK BROADCASTING · 1340 KC
   The station: one storey of white stucco in the streamlined way of its
   day, the east end round, three speed lines run round it under the
   coping, a polished dark base. A ribbon of glass block along the front
   wraps the round end, lit warm from inside after dark. The doors under a
   round-nosed canopy, and beside them a fin standing up past the roof with
   RADIO down both its faces in neon and a ball on its top; over the window
   the station's name in steel letters, an ON AIR lamp by the door. A gravel
   lot in front with the manager's car, a flagpole, a drive round the
   substation's east fence from its lane.
   The tower: a guyed mast 124 m tall, a triangle of lattice the same
   width all the way up on a porcelain base insulator, guyed in three
   directions at four heights, the guys broken by strain insulators.
   Painted in seven bands, orange and white, a red beacon at its top and its
   thirds, flashing after dark. At its
   foot the tuning house in a fenced square, and the feed line coming in
   on short poles from the station, two wires on each crossarm.
   PLAN (world): RADIO (04): the pad x -6..48, z -1500..-1458 at EDIN.y; the
   building x 2..26, z -1486..-1474 (the round end centred x 20); the tower
   at (100, -1522), its footing level at RADIO.ty. The tuning house by it,
   its cellar and the shelter under that are 14s3's.
   ---------------------------------------------------------------------- */
const RADIO_ST={beacons:[], glow:null, glowIn:null, lamp:null, t:0, radios:[], dj:null};
(function radioStation(){
  if(typeof RADIO==="undefined") return;
  const Y=EDIN.y, ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||12),x,y,z,c,rx,ry,rz);
  const tube=(a,b,rad,c,seg,list)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length(); if(L<1e-4) return;
    (list||ME).push({geo:new T.CylinderGeometry(rad,rad,L,seg||6,1,true), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const g=(x,z)=>Terrain.groundAt(x,z);

  /* ---- the building ---- */
  const X0=2, XR=20, R=6, ZC=-1480, FZ=ZC+R, HT=5.0, WALL="#d2c3a2";               // (cream stucco gone a little golden: never plain white)
  // its plan (x across, -z up the shape), grown by o: a rectangle with a half round on its east end
  const plan=(o)=>{ const s=new T.Shape(); s.moveTo(X0-o, -(ZC+R+o)+ZC); s.lineTo(XR, -(ZC+R+o)+ZC); s.absarc(XR, 0, R+o, -Math.PI/2, Math.PI/2, false); s.lineTo(X0-o, R+o); s.closePath(); return s; };
  const slab=(o, y0, y1, c)=>{ const gg=new T.ExtrudeGeometry(plan(o), {depth:y1-y0, bevelEnabled:false, curveSegments:28}); gg.rotateX(-Math.PI/2); ent(gg, 0, y0, ZC, c); };
  // the shell: walls a quarter metre thick round a hollow, the round end a ring; the base, the speed lines and the coping are rings too
  // (outside the wall's face and a little into it), so nothing of them is in the rooms
  const TW=0.25, FL=Y+0.2, CEIL=Y+3.6;
  const ring=(o, i, y0, y1, c)=>{ const sh=plan(o); sh.holes.push(new T.Path(plan(i).getPoints(28).reverse())); const gg=new T.ExtrudeGeometry(sh, {depth:y1-y0, bevelEnabled:false, curveSegments:28});
    gg.rotateX(-Math.PI/2); ent(gg, 0, y0, ZC, c); };
  ring(0.06, -0.1, Y-0.3, Y+0.5, "#1f3a3c");                           // (the polished base, dark green granite)
  for(const y of [3.92, 4.22, 4.52]) ring(0.035, -0.1, Y+y, Y+y+0.1, "#2f7a78");  // (the speed lines, in the teal of the day)
  ring(0.16, -TW-0.02, Y+HT, Y+HT+0.32, "#e4dccb");                    // (the coping, over the parapet)
  { const sh=new T.Shape(); sh.moveTo(XR, -R); sh.absarc(XR, 0, R, -Math.PI/2, Math.PI/2, false); sh.lineTo(XR, R-TW); sh.absarc(XR, 0, R-TW, Math.PI/2, -Math.PI/2, true); sh.closePath();
    const gg=new T.ExtrudeGeometry(sh, {depth:HT+0.3, bevelEnabled:false, curveSegments:36}); gg.rotateX(-Math.PI/2); ent(gg, 0, Y-0.3, ZC, WALL);
    // (its colliders: a box along each tenth of the arc, turned to it)
    const rc=R-TW/2; for(let k=0;k<10;k++){ const p0=-Math.PI/2+k*Math.PI/10, p1=p0+Math.PI/10, pm=(p0+p1)/2, cx=XR+Math.cos(pm)*rc, cz=ZC+Math.sin(pm)*rc;
      addColOB(cx, cz, Math.atan2(-Math.cos(pm), -Math.sin(pm)), rc*Math.sin(Math.PI/20)+0.06, 0.18, Y-1, Y+HT+0.4); } }
  // the straight walls: boxes in pieces round each opening (its sill and its head), and their colliders
  const wallX=(z0, z1, x0, x1, y0, y1, ops, c)=>{ let x=x0; const zc=(z0+z1)/2, d=z1-z0;
    const piece=(a, b, q0, q1)=>{ if(b-a<0.005 || q1-q0<0.005) return; B(b-a, q1-q0, d, (a+b)/2, (q0+q1)/2, zc, c); addCol(a, b, z0, z1, q0<=FL+0.05 ? q0-0.5 : q0, q1); };
    for(const o of ops.slice().sort((p, q)=>p.a-q.a)){ piece(x, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); x=o.b; } piece(x, x1, y0, y1); };
  const wallZ=(x0, x1, z0, z1, y0, y1, ops, c)=>{ let z=z0; const xc=(x0+x1)/2, d=x1-x0;
    const piece=(a, b, q0, q1)=>{ if(b-a<0.005 || q1-q0<0.005) return; B(d, q1-q0, b-a, xc, (q0+q1)/2, (a+b)/2, c); addCol(x0, x1, a, b, q0<=FL+0.05 ? q0-0.5 : q0, q1); };
    for(const o of ops.slice().sort((p, q)=>p.a-q.a)){ piece(z, o.a, y0, y1); piece(o.a, o.b, y0, o.sill); piece(o.a, o.b, o.head, y1); z=o.b; } piece(z, z1, y0, y1); };
  const op=(a, b, sill, head)=>({a:a, b:b, sill:sill, head:head});
  wallX(FZ-TW, FZ, X0, XR+0.02, Y-0.3, Y+HT, [op(7.04, 8.96, FL-0.02, Y+2.62)], WALL);              // the front, the doors in it
  wallX(ZC-R, ZC-R+TW, X0, XR+0.02, Y-0.3, Y+HT, [], WALL);                                         // the back
  wallZ(X0, X0+TW, ZC-R+TW, FZ-TW, Y-0.3, Y+HT, [], WALL);                                          // the west end
  // the floor slab and the roof's deck, inside the walls; the deck's underside the ceiling; the membrane on top, inside the parapet
  { const inner=plan(-TW+0.005), ex=(y0, y1, c)=>{ const gg=new T.ExtrudeGeometry(inner, {depth:y1-y0, bevelEnabled:false, curveSegments:28}); gg.rotateX(-Math.PI/2); ent(gg, 0, y0, ZC, c); };
    ex(Y-0.3, FL-0.004, "#8a8678"); ex(CEIL, Y+3.95, "#f2eee4"); ex(Y+3.95, Y+3.99, "#5a5a5e"); }
  addFlat(X0+TW, XR+R-TW, ZC-R+TW, FZ-TW, FL); addFlat(7.04, 8.96, FZ-TW-0.02, FZ+0.02, FL);
  // the glass block: a texture of blocks, lit from inside at night; the ribbon along the front and round the end, the panel west of the door
  const gbTex=(()=>{ const c=cvs(256, 128), x=c.getContext("2d"); x.fillStyle="#c8ccc4"; x.fillRect(0, 0, 256, 128);
    for(let i=0;i<8;i++) for(let j=0;j<4;j++){ const gx=i*32+2, gy=j*32+2, gr=x.createRadialGradient(gx+14, gy+14, 2, gx+14, gy+14, 20);
      gr.addColorStop(0, "#f2f6ee"); gr.addColorStop(0.6, "#d8e4dc"); gr.addColorStop(1, "#a8b8b0"); x.fillStyle=gr; x.fillRect(gx, gy, 28, 28);
      x.strokeStyle="rgba(255,255,255,0.5)"; x.beginPath(); x.moveTo(gx+5, gy+20); x.lineTo(gx+20, gy+5); x.stroke(); }
    const t=setSRGB(new T.CanvasTexture(c)); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; })();
  const gbMat=new T.MeshStandardMaterial({map:gbTex, emissiveMap:gbTex, emissive:new T.Color(0xffd8a0), emissiveIntensity:0, roughness:0.25, metalness:0.05});
  RADIO_ST.glow=gbMat;
  const WY0=Y+1.6, WY1=Y+2.75;
  const gbPlane=(x0, x1)=>{ const w=x1-x0, gg=new T.PlaneGeometry(w, WY1-WY0), U=gg.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w/1.28, U.getY(i)*(WY1-WY0)/0.64);
    const m=new T.Mesh(gg, gbMat); m.position.set((x0+x1)/2, (WY0+WY1)/2, FZ+0.012); m.receiveShadow=true; scene.add(m);
    B(w+0.16, 0.08, 0.14, (x0+x1)/2, WY0-0.04, FZ+0.07, "#d8d0bc"); B(w+0.16, 0.06, 0.1, (x0+x1)/2, WY1+0.03, FZ+0.05, "#d8d0bc"); };
  gbPlane(3.2, 6.0); gbPlane(11.4, XR);
  { const arc=Math.PI*0.62, gg=new T.CylinderGeometry(R+0.012, R+0.012, WY1-WY0, 40, 1, true, 0, arc), U=gg.attributes.uv;
    for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*arc*R/1.28, U.getY(i)*(WY1-WY0)/0.64);
    const m=new T.Mesh(gg, gbMat); m.position.set(XR, (WY0+WY1)/2, ZC); scene.add(m); }
  // the doors: a pair of steel and glass doors in a chrome frame, set in a little; the round-nosed canopy over them; the step
  { const dx=8.0, dw=1.8, dh=2.4;
    // (a chrome frame round the opening; the door you go in by, glass in steel, and a fixed light of the same beside it)
    for(const xx of [7.0, 9.0]) B(0.08, 2.66, 0.3, xx, FL+1.31, FZ-0.125, "#b8bcc0"); B(2.08, 0.08, 0.3, dx, Y+2.66, FZ-0.125, "#b8bcc0");
    makeDoor(XF(7.06, FZ-0.125, 0), 0, FL+0.01, 0, "THE STATION'S DOOR", true, 0, "store", 0x8a8d90);
    RB(0.9, 2.4, 0.05, 8.5, FL+1.21, FZ-0.125, "#9a9da0", 0, 0.01); push("glass", planeGeo(0.72, 2.1, 0), 8.5, FL+1.25, FZ-0.125+0.03, 0, "#ffffff");
    addCol(8.04, 8.96, FZ-0.2, FZ-0.05, FL-0.5, Y+2.62);
    const cs=new T.Shape(); cs.moveTo(-1.9, 0); cs.lineTo(1.9, 0); cs.lineTo(1.9, 0.4); cs.absarc(0, 0.4, 1.9, 0, Math.PI, false); cs.closePath();
    const cg=new T.ExtrudeGeometry(cs, {depth:0.2, bevelEnabled:true, bevelThickness:0.02, bevelSize:0.02, bevelSegments:1, curveSegments:20}); cg.rotateX(Math.PI/2);
    ent(cg, dx, Y+3.15, FZ-0.05, WALL);
    RB(3.2, 0.03, 0.7, dx, Y+2.9, FZ+1.0, "#f2ecd8", 0, 0.01);
    B(3.4, 0.16, 1.4, dx, Y+0.08, FZ+0.7, "#a8a49a"); addFlat(dx-1.7, dx+1.7, FZ, FZ+1.4, Y+0.16);
    RADIO_ST.lamp={x:dx, y:Y+2.8, z:FZ+1.4, color:0xffe2b0, intensity:0, dist:9, decay:1.6}; LAMPS.push(RADIO_ST.lamp);
  }
  // the fin: up past the roof, RADIO down both faces in neon, a ball on its top
  { const fx=10.25, fz=FZ+0.55, fh=9.4;
    const fd=FZ+0.45;                                                   // (its middle: a metre and a bit out, sunk ten centimetres into the wall)
    B(0.42, fh, 1.3, fx, Y+fh/2, fd, WALL); B(0.5, 0.2, 1.4, fx, Y+fh+0.1, fd, "#2f7a78");
    for(const yy of [8.62, 8.92, 9.22]) B(0.5, 0.1, 1.4, fx, Y+yy, fd, "#2f7a78");                     // (three fins of its own at the top)
    S(0.32, fx, Y+fh+0.52, fd); C(0.05, 0.6, fx, Y+fh+0.95, fd, "#b8bcc0", 8);
    for(const sd of [-1,1]) sign(0.92, 5.6, (c, W, H)=>{ c.fillStyle="#1a1e28"; c.fillRect(0, 0, W, H); c.strokeStyle="#ff6a4a"; c.lineWidth=6; c.shadowColor="#ff6a4a"; c.shadowBlur=12; c.strokeRect(10, 10, W-20, H-20);
        const L="RADIO"; for(let k=0;k<5;k++){ c.shadowColor="#ff9a5a"; c.shadowBlur=16; say(c, L[k], W/2, H*(0.12+k*0.19), W*0.72, H*0.15, "#ffd2a0", "900", "'Arial Black', Arial"); } c.shadowBlur=0; },
      fx+sd*0.222, Y+5.6, fz+0.05, sd>0 ? Math.PI/2 : -Math.PI/2, true, 160);
    addCol(fx-0.25, fx+0.25, FZ, FZ+1.1, Y-1, Y+fh); }
  function S(r, x, y, z){ ent(new T.SphereGeometry(r, 16, 12), x, y, z, "#d8d0bc"); }
  function S2(r, x, y, z, c){ ent(new T.SphereGeometry(r, 12, 9), x, y, z, c); }
  function CT_(r0, r1, h, x, y, z, c){ ent(new T.CylinderGeometry(r0, r1, h, 16), x, y, z, c); }
  // the name over the window in steel letters; the frequency; the ON AIR lamp by the door
  sign(8.2, 0.62, (c, W, H)=>{ c.clearRect(0, 0, W, H); c.fillStyle=WALL; c.fillRect(0, 0, W, H);
      c.shadowColor="rgba(0,0,0,0.35)"; c.shadowOffsetX=2; c.shadowOffsetY=3; c.shadowBlur=3;
      say(c, "FRENCH CREEK BROADCASTING", W/2, H/2, W*0.80, H*0.66, "#5a6068", "800", "Futura, 'Century Gothic', 'Trebuchet MS', Arial"); c.shadowColor="transparent"; },
    15.7, Y+3.42, FZ+0.012, 0, false, 1400);
  sign(2.6, 0.5, (c, W, H)=>{ c.fillStyle=WALL; c.fillRect(0, 0, W, H); say(c, "1340 KC", W/2, H/2, W*0.80, H*0.66, "#b83a22", "900", "Futura, 'Century Gothic', 'Trebuchet MS', Arial"); },
    4.6, Y+3.42, FZ+0.012, 0, false, 520);
  { RB(0.62, 0.3, 0.12, 6.4, Y+2.25, FZ+0.06, "#2a2a30", 0, 0.03);
    sign(0.54, 0.22, (c, W, H)=>{ c.fillStyle="#3a0606"; c.fillRect(0, 0, W, H); c.shadowColor="#ff3a2a"; c.shadowBlur=10; say(c, "ON AIR", W/2, H/2, W*0.78, H*0.6, "#ff5a3a", "900", "'Arial Black', Arial"); c.shadowBlur=0; },
      6.4, Y+2.25, FZ+0.125, 0, true, 260); }
  // on the roof: a vent, a little aerial for the remote pickups
  RB(1.2, 0.7, 0.9, 6, Y+3.99+0.35, ZC-2, "#b8bcc0", 0, 0.05); C(0.03, 4.2, 15, Y+3.99+2.1, ZC-3, "#8a8d90", 6);
  for(let k=0;k<4;k++) tube(V3(15, Y+3.99+3.9, ZC-3), V3(15+Math.cos(k*1.57)*2.2, Y+HT+0.33, ZC-3+Math.sin(k*1.57)*2.2), 0.008, "#6a6d70");
  // the lot: gravel in front, wheel stops, the manager's car, a flagpole; the drive round the substation's east fence
  { const pl=(x0,x1,z0,z1,y,c)=>{ const gg=new T.PlaneGeometry(x1-x0, z1-z0), U=gg.attributes.uv;
      for(let k=0;k<U.count;k++) U.setXY(k, (x0+U.getX(k)*(x1-x0))*0.5, (z0+U.getY(k)*(z1-z0))*0.5);
      push("gravelbed", gg, (x0+x1)/2, y, (z0+z1)/2, 0, c, -Math.PI/2, 0); };
    pl(-2, 34, FZ+1.6, -1461.5, Y+0.035, "#a6a196"); pl(38.4, 41.6, -1461.5, -1373.6, Y+0.033, "#a29d92"); pl(13.1, 41.6, -1373.6, -1370.4, Y+0.034, "#a29d92");
    pl(34, 38.4, -1465, -1461.5, Y+0.034, "#a29d92");
    for(const x of [16, 19.5, 23]){ B(1.6, 0.12, 0.18, x, Y+0.06, FZ+2.4, "#a8a49a"); }
    if(typeof parked==="function") parked(2, "#3a3a2a", 19.5, FZ+4.6, Math.PI, Y);
    C(0.06, 9.5, 27.5, Y+4.75, -1466, "#c8ccd0", 10); S(0.12, 27.5, Y+9.56, -1466); B(0.6, 0.2, 0.6, 27.5, Y+0.1, -1466, "#a8a49a");
    addCol(27.2, 27.8, -1466.3, -1465.7, Y-1, Y+9.5);
    // a bench by the door, and the station's own mailbox
    B(1.6, 0.05, 0.4, 3.6, Y+0.45, FZ+0.6, "#7a5a3a"); for(const sd of [-0.65, 0.65]) B(0.06, 0.45, 0.36, 3.6+sd, Y+0.225, FZ+0.6, "#2a2a2c");
    addCol(2.75, 4.45, FZ+0.35, FZ+0.85, Y-1, Y+0.6); addSeat(3.6, FZ+0.6, Y, Math.PI, "THE STATION'S BENCH"); }
  addZone(RADIO.pad.x0, RADIO.pad.x1, RADIO.pad.z0, RADIO.pad.z1, Y-3, Y+20, "THE RADIO STATION");

  /* ======================================================================
     INSIDE: the lobby by the front doors, Studio A behind it with a window from the lobby to watch the broadcast, the control room
     beside the studio with its own window in, the manager's office with the record library, and the transmitter in the round end
     PLAN (world): the lobby x 2.25..10, z -1480..-1474.25; the studio x 2.25..12, z -1485.75..-1480; the control room x 12..16,
     z -1485.75..-1480; the office x 10..16, z -1480..-1474.25; the transmitter room x 16 to the round end
     ====================================================================== */
  { const PT=0.12, PH=CEIL, IN=FZ-TW, BK=ZC-R+TW, PC="#e8e2d2";
    const pane=(x, y, z, w, h, ry)=>push("glass", planeGeo(w-0.04, h-0.04, 0), x, y, z, ry, "#ffffff");
    // the partitions (their pieces round their doors and windows), the doors hung in them, the glass in the windows
    wallX(-1480-PT/2, -1480+PT/2, X0+TW, 16-PT/2+0.004, FL-0.004, PH, [op(4.2, 5.1, FL-0.02, FL+2.06), op(5.8, 8.2, FL+0.95, FL+2.05), op(13.2, 14.1, FL-0.02, FL+2.06)], PC);
    wallZ(10-PT/2, 10+PT/2, -1480+PT/2-0.004, IN, FL-0.004, PH, [op(-1477.6, -1476.7, FL-0.02, FL+2.06)], PC);
    wallZ(12-PT/2, 12+PT/2, BK, -1480-PT/2+0.004, FL-0.004, PH, [op(-1484.6, -1481.2, FL+0.85, FL+1.95)], PC);
    wallZ(16-PT/2, 16+PT/2, BK, IN, FL-0.004, PH, [op(-1477.9, -1477.0, FL-0.02, FL+2.06)], PC);
    pane(7.0, FL+1.5, -1480, 2.4, 1.1, 0); pane(12, FL+1.4, -1482.9, 3.4, 1.1, Math.PI/2);
    for(const [x0, x1] of [[5.8, 8.2]]) for(const sd of [-1,1]){ B(x1-x0+0.1, 0.06, 0.16, (x0+x1)/2, FL+0.95+(sd<0 ? -0.03 : 1.13), -1480, "#5a3a22"); }
    for(const sd of [-1,1]) B(0.16, 0.06, 3.5, 12, FL+0.85+(sd<0 ? -0.03 : 1.13), -1482.9, "#5a3a22");
    const dIn=(xf, label, ajar)=>makeDoor(xf, 0, FL+0.01, 0, label, true, ajar, "vision", 0x5a3a22);
    dIn(XF(4.22, -1480, 0), "STUDIO A", 0); dIn(XF(13.22, -1480, 0), "THE CONTROL ROOM", 0);
    dIn(XF(10, -1477.58, -Math.PI/2), "THE OFFICE", 0.95); dIn(XF(16, -1477.88, -Math.PI/2), "THE TRANSMITTER ROOM", 0);
    for(const [a, b] of [[4.2, 5.1],[13.2, 14.1]]) addFlat(a, b, -1480-PT/2-0.02, -1480+PT/2+0.02, FL);
    addFlat(10-PT/2-0.02, 10+PT/2+0.02, -1477.6, -1476.7, FL); addFlat(16-PT/2-0.02, 16+PT/2+0.02, -1477.9, -1477.0, FL);
    // the floors: terrazzo in the lobby with a lightning flash let into it, carpet in the studio, linoleum elsewhere (each 5 mm up)
    const floorTex=(draw, w, h)=>{ const t=signTex(w, h, draw); t.anisotropy=4; return t; };
    const fl=(x0, x1, z0, z1, tex, rep)=>{ const gg=new T.PlaneGeometry(x1-x0, z1-z0), U=gg.attributes.uv; if(rep) for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(x1-x0)/rep, U.getY(i)*(z1-z0)/rep);
      if(rep){ tex.wrapS=tex.wrapT=T.RepeatWrapping; } const m=new T.Mesh(gg, new T.MeshStandardMaterial({map:tex, roughness:0.55})); m.rotation.x=-Math.PI/2; m.position.set((x0+x1)/2, FL+0.005, (z0+z1)/2); m.receiveShadow=true; scene.add(m); };
    fl(X0+TW, 10-PT/2, -1480+PT/2, IN, floorTex((c, W, H)=>{ const r=_trng(31); c.fillStyle="#d8d0c0"; c.fillRect(0, 0, W, H);
        for(let i=0;i<9000;i++){ c.fillStyle=["#a89a84","#7a6e5e","#f2ece0","#b8a88c","#5a5a5a"][(r()*5)|0]; c.fillRect(r()*W, r()*H, 1+r()*2, 1+r()*2); }
        c.strokeStyle="#2f7a78"; c.lineWidth=10; c.strokeRect(18, 18, W-36, H-36); c.strokeStyle="#b8902a"; c.lineWidth=3; c.strokeRect(34, 34, W-68, H-68);
        c.fillStyle="#2f7a78"; c.beginPath(); c.arc(W/2, H/2, H*0.24, 0, 7); c.fill(); c.fillStyle="#d8d0c0"; c.beginPath(); c.arc(W/2, H/2, H*0.2, 0, 7); c.fill();
        c.fillStyle="#b8902a"; c.beginPath(); c.moveTo(W/2+H*0.05, H/2-H*0.17); c.lineTo(W/2-H*0.07, H/2+H*0.02); c.lineTo(W/2+H*0.01, H/2+H*0.02); c.lineTo(W/2-H*0.05, H/2+H*0.17); c.lineTo(W/2+H*0.08, H/2-H*0.03); c.lineTo(W/2, H/2-H*0.03); c.closePath(); c.fill(); }, 768, 576));
    fl(X0+TW, 12-PT/2, BK, -1480-PT/2, floorTex((c, W, H)=>{ const r=_trng(32); c.fillStyle="#4a3a3a"; c.fillRect(0, 0, W, H); for(let i=0;i<4000;i++){ c.fillStyle="rgba(0,0,0,"+(r()*0.15).toFixed(2)+")"; c.fillRect(r()*W, r()*H, 2, 2); } }, 128, 128), 1.0);
    const lino=floorTex((c, W, H)=>{ for(let i=0;i<8;i++) for(let j=0;j<8;j++){ c.fillStyle=(i+j)%2 ? "#2a3a34" : "#c8c0a8"; c.fillRect(i*W/8, j*H/8, W/8, H/8); } }, 256, 256);
    fl(12+PT/2, 16-PT/2, BK, -1480-PT/2, lino, 2.4); fl(10+PT/2, 16-PT/2, -1480+PT/2, IN, lino.clone(), 2.4); { const t=lino.clone(); t.needsUpdate=true; fl(16+PT/2, XR+R-TW-0.02, BK, IN, t, 2.4); }
    // a baseboard of dark wood round every room (proud of its wall, stopped short of doors), and the walls' colour above it
    const base=(ax, c0, dir, a, b, gaps)=>{ let s0=a; for(const [g0, g1] of (gaps||[]).concat([[b+1, b+1]])){ const e=Math.min(g0-0.04, b); if(e>s0+0.02){
        if(ax==="x") B(e-s0, 0.14, 0.02, (s0+e)/2, FL+0.07, c0+dir*0.008, "#3a2a1e"); else B(0.02, 0.142, e-s0, c0+dir*0.008, FL+0.071, (s0+e)/2, "#3a2a1e"); } s0=Math.max(s0, g1+0.04); } };
    base("x", IN, -1, X0+TW, 10-PT/2, [[7.04, 8.96]]); base("x", -1480+PT/2, 1, X0+TW, 10-PT/2, [[4.2, 5.1]]); base("z", X0+TW, 1, -1480+PT/2, IN);
    base("z", 10-PT/2, -1, -1480+PT/2, IN, [[-1477.6, -1476.7]]); base("x", -1480+PT/2, 1, 10+PT/2, 16-PT/2, []); base("x", IN, -1, 10+PT/2, 16-PT/2, []);
    base("z", 10+PT/2, 1, -1480+PT/2, IN, [[-1477.6, -1476.7]]); base("z", 16-PT/2, -1, -1480+PT/2, IN, [[-1477.9, -1477.0]]);
    base("x", BK, 1, 12+PT/2, 16-PT/2, []); base("x", -1480-PT/2, -1, 12+PT/2, 16-PT/2, [[13.2, 14.1]]); base("z", 16-PT/2, -1, BK, -1480-PT/2, []);
    // the glass block from inside: the same blocks on the inner faces, lit by the rooms
    { const gi=(x0, x1)=>{ const w=x1-x0, gg=new T.PlaneGeometry(w, WY1-WY0), U=gg.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w/1.28, U.getY(i)*(WY1-WY0)/0.64);
        const m=new T.Mesh(gg, gbMat); m.position.set((x0+x1)/2, (WY0+WY1)/2, IN-0.012); m.rotation.y=Math.PI; scene.add(m); };
      gi(3.2, 6.0); gi(11.4, 15.88); gi(16.12, XR);
      const arc=Math.PI*0.62, gg=new T.CylinderGeometry(R-TW-0.012, R-TW-0.012, WY1-WY0, 40, 1, true, 0, arc), U=gg.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*arc*R/1.28, U.getY(i)*(WY1-WY0)/0.64);
      const bm=gbMat.clone(); bm.side=T.BackSide; RADIO_ST.glowIn=bm; const m=new T.Mesh(gg, bm); m.position.set(XR, (WY0+WY1)/2, ZC); scene.add(m); }
    const lamp=(x, y, z, k, vol, col)=>{ const o={x:x, y:y, z:z, color:col||0xffe2b8, intensity:k, dist:7, decay:1.5, indoor:true, vol:vol}; LAMPS.push(o); return o; };
    const pend=(x, z, r)=>{ C(0.01, 0.5, x, CEIL-0.25, z, "#b8902a", 6); ent(new T.CylinderGeometry(r*0.5, r, 0.18, 20, 1, true), x, CEIL-0.58, z, "#f2ecd8");
      push("rn_glow", new T.CircleGeometry(r*0.95, 20), x, CEIL-0.665, z, 0, "#ffffff", Math.PI/2, 0); C(r*0.52, 0.02, x, CEIL-0.49, z, "#b8902a", 20); };
    const VB=(x0, x1, z0, z1)=>[x0, x1, z0, z1, FL-0.5, CEIL+0.2];

    /* -- the lobby: a reception desk in the corner by the studio, a settee on the west wall, a console radio, the station's photographs,
       a clock, ON AIR over the studio's door, a palm, the call sign on the wall behind the desk -- */
    { const V=VB(X0+TW, 10, -1480, IN);
      // the desk: a counter with a rounded end in walnut and a band of chrome, the girl's chair behind it, a telephone, the visitors' book
      RB(1.5, 1.02, 0.6, 9.05, FL+0.51, -1478.65, "#5a3a22", 0, 0.08); RB(1.56, 0.04, 0.66, 9.05, FL+1.04, -1478.65, "#2a1a10", 0, 0.02);
      for(const y of [0.3, 0.6]) B(1.52, 0.025, 0.02, 9.05, FL+y, -1478.34, "#d8dce0");
      addCol(8.28, 9.82, -1478.97, -1478.33, FL-0.5, FL+1.06);
      const ch=(x, z, ry, c, lab)=>{ const f=XF(x, z, ry); const q=(w,h,d,lx,ly,lz,cc)=>RB(w, h, d, f.x(lx, lz), FL+ly, f.z(lx, lz), cc, ry, 0.03);
        q(0.48, 0.08, 0.46, 0, 0.46, 0, c); q(0.46, 0.46, 0.07, 0, 0.74, -0.2, c); C(0.025, 0.4, x, FL+0.22, z, "#c8ccd0", 8); C(0.22, 0.03, x, FL+0.02, z, "#c8ccd0", 14);
        addCol(x-0.26, x+0.26, z-0.26, z+0.26, FL-0.5, FL+0.5); if(lab) addSeat(x, z, FL, ry+Math.PI, lab); };
      ch(9.05, -1479.4, 0, "#2f6a68", null);                                   // (hers: she sits in it by day, 14q)
      RB(0.2, 0.08, 0.22, 8.55, FL+1.1, -1478.75, "#141414", 0, 0.02); C(0.012, 0.16, 8.55, FL+1.2, -1478.85, "#141414", 6);
      RB(0.32, 0.03, 0.24, 9.35, FL+1.075, -1478.6, "#7a1a1a", 0, 0.01);
      // the call sign and the frequency behind her, in chrome on a teal panel
      RB(1.8, 0.7, 0.04, 9.05, FL+2.5, -1479.92, "#2f7a78", 0, 0.01);
      sign(1.6, 0.56, (c, W, H)=>{ c.fillStyle="#2f7a78"; c.fillRect(0, 0, W, H); c.strokeStyle="#d8dce0"; c.lineWidth=4; c.strokeRect(8, 8, W-16, H-16);
        say(c, "FRENCH CREEK", W/2, H*0.36, W*0.78, H*0.28, "#e8ecef", "800", "Futura, 'Century Gothic', 'Trebuchet MS', Arial"); say(c, "1340 ON YOUR DIAL", W/2, H*0.70, W*0.70, H*0.20, "#f2d48a", "700", "Futura, 'Century Gothic', 'Trebuchet MS', Arial"); },
        9.05, FL+2.5, -1479.885, 0, false, 640);
      // the settee on the west wall in green leather, buttoned
      { const sx=X0+TW+0.36, sz=-1478.6; RB(0.66, 0.42, 2.0, sx, FL+0.21, sz, "#2a4a3a", 0, 0.06); RB(0.2, 0.5, 2.0, sx-0.24, FL+0.62, sz, "#2a4a3a", 0, 0.06);
        for(const e of [-1,1]) RB(0.66, 0.6, 0.16, sx, FL+0.3, sz+e*1.0, "#244236", 0, 0.05); for(let k=0;k<3;k++) RB(0.5, 0.1, 0.6, sx+0.04, FL+0.46, sz-0.62+k*0.62, "#305a46", 0, 0.04);
        addCol(X0+TW, sx+0.34, sz-1.08, sz+1.08, FL-0.5, FL+0.9); for(const e of [-0.6, 0.6]) addSeat(sx+0.05, sz+e, FL, -Math.PI/2, "THE SETTEE"); }
      // the console radio in the corner by the front: a walnut cabinet, the dial lit, the cloth of the speaker, four knobs
      { const rx=X0+TW+0.4, rz=IN-0.35; RB(0.72, 1.05, 0.42, rx+0.02, FL+0.525, rz, "#6a4428", Math.PI/2, 0.05);
        B(0.02, 0.36, 0.5, rx+0.235, FL+0.55, rz, "#c8b48a"); push("rn_glow", planeGeo(0.06, 0.32, 0), rx+0.243, FL+0.85, rz, Math.PI/2, "#ffffff");
        for(let k=0;k<4;k++) C(0.022, 0.03, rx+0.24, FL+0.74, rz-0.15+k*0.1, "#2a1a10", 10, 0, 0, Math.PI/2); addCol(rx-0.2, rx+0.25, rz-0.37, rz+0.37, FL-0.5, FL+1.1); }
      // the photographs: the station going on the air in 1940, the tower going up, a band in the studio; the clock over the window
      for(const [z, k] of [[-1477.2, 0],[-1478.0, 1],[-1478.8, 2],[-1479.55, 0]]){ RB(0.03, 0.5, 0.62, X0+TW+0.015, FL+1.75, z, "#1a1a1a", 0, 0.01);
        sign(0.54, 0.42, (c, W, H)=>{ const r=_trng(50+z*10|0); c.fillStyle="#d8cfb8"; c.fillRect(0, 0, W, H); c.fillStyle="#4a4438"; c.fillRect(W*0.08, H*0.08, W*0.84, H*0.84);
            const g2=c.createLinearGradient(0, H*0.08, 0, H*0.92); g2.addColorStop(0, "#a8a090"); g2.addColorStop(1, "#5a5448"); c.fillStyle=g2; c.fillRect(W*0.1, H*0.1, W*0.8, H*0.8);
            c.fillStyle="#2a2620"; if(k===1){ c.fillRect(W*0.48, H*0.15, W*0.04, H*0.7); for(let i=0;i<6;i++) c.fillRect(W*(0.44+i*0.0), H*(0.2+i*0.1), W*0.12, 2); }
            else for(let i=0;i<(k ? 5 : 8);i++){ const px=W*(0.18+i*(k ? 0.15 : 0.09)), py=H*0.62; c.beginPath(); c.arc(px, py-H*0.18, W*0.03, 0, 7); c.fill(); c.fillRect(px-W*0.035, py-H*0.14, W*0.07, H*0.24); }
            for(let i=0;i<900;i++){ c.fillStyle="rgba(0,0,0,"+(r()*0.12).toFixed(2)+")"; c.fillRect(r()*W, r()*H, 1, 1); } },
          X0+TW+0.032, FL+1.75, z, Math.PI/2, false, 220); }
      { const cx=7.0, cy=FL+2.62; C(0.24, 0.05, cx, cy, -1479.92, "#b8902a", 28, Math.PI/2);
        sign(0.4, 0.4, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.beginPath(); c.arc(W/2, H/2, W*0.48, 0, 7); c.fill(); c.strokeStyle="#1a1a1a"; c.lineWidth=3;
          for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; c.beginPath(); c.moveTo(W/2+Math.cos(a)*W*0.36, H/2+Math.sin(a)*H*0.36); c.lineTo(W/2+Math.cos(a)*W*0.42, H/2+Math.sin(a)*H*0.42); c.stroke(); }
          c.lineWidth=5; c.beginPath(); c.moveTo(W/2, H/2); c.lineTo(W/2+W*0.18, H/2-H*0.12); c.stroke(); c.lineWidth=3; c.beginPath(); c.moveTo(W/2, H/2); c.lineTo(W/2-W*0.02, H/2-H*0.34); c.stroke(); },
          cx, cy, -1479.89, 0, false, 200); }
      // ON AIR over the studio's door, lit
      RB(0.7, 0.24, 0.1, 4.65, FL+2.3, -1479.89, "#2a2a30", 0, 0.02);
      sign(0.62, 0.18, (c, W, H)=>{ c.fillStyle="#3a0606"; c.fillRect(0, 0, W, H); c.shadowColor="#ff3a2a"; c.shadowBlur=10; say(c, "ON AIR", W/2, H/2, W*0.78, H*0.6, "#ff5a3a", "900", "'Arial Black', Arial"); c.shadowBlur=0; },
        4.65, FL+2.3, -1479.835, 0, true, 300);
      // a palm in a brass pot by the doors; an ashtray stand
      { const px=6.4, pz=IN-0.4; CT_(0.2, 0.16, 0.42, px, FL+0.21, pz, "#b8902a"); for(let k=0;k<7;k++){ const a=k*0.9; tube(V3(px, FL+0.45, pz), V3(px+Math.cos(a)*0.55, FL+1.25+(k%3)*0.15, pz+Math.sin(a)*0.55), 0.03, "#3a6a2e", 4); S2(0.12, px+Math.cos(a)*0.55, FL+1.28+(k%3)*0.15, pz+Math.sin(a)*0.55, "#2e5a26"); }
        addCol(px-0.22, px+0.22, pz-0.22, pz+0.22, FL-0.5, FL+0.8); C(0.02, 0.62, 9.5, FL+0.31, IN-0.4, "#c8ccd0", 8); C(0.14, 0.04, 9.5, FL+0.64, IN-0.4, "#c8ccd0", 14); C(0.15, 0.02, 9.5, FL+0.01, IN-0.4, "#2a2a2c", 14); }
      pend(5.4, -1477.1, 0.32); pend(8.6, -1477.1, 0.32);
      lamp(7.0, CEIL-0.8, -1477.1, 0.7, V); lamp(9.05, CEIL-0.8, -1478.8, 0.35, V, 0xffd8a8);
      RADIO_ST.radios.push({x:9.6, y:FL+2.2, z:-1479.8, station:3, house:"FRENCH CREEK BROADCASTING", zone:"FRENCH CREEK BROADCASTING · THE LOBBY", vol:0.45, reach:20});
      RB(0.3, 0.3, 0.14, 9.6, FL+2.95, -1479.86, "#5a3a22", 0, 0.03); B(0.24, 0.24, 0.01, 9.6, FL+2.95, -1479.785, "#c8b48a"); }

    /* -- Studio A: acoustic tile on its walls, the grand piano, the announcer's table and its two microphones, a microphone on a stand
       for the singer, chairs and music stands, the studio clock and its own ON AIR lamp, the window to the control room -- */
    { const V=VB(X0+TW, 12, BK, -1480);
      const tile=signTex(256, 256, (c, W, H)=>{ c.fillStyle="#e8e2d0"; c.fillRect(0, 0, W, H); c.strokeStyle="#c8c0aa"; c.lineWidth=2; for(let i=0;i<=4;i++){ c.beginPath(); c.moveTo(i*W/4, 0); c.lineTo(i*W/4, H); c.moveTo(0, i*H/4); c.lineTo(W, i*H/4); c.stroke(); }
        c.fillStyle="#9a927e"; for(let i=0;i<4;i++) for(let j=0;j<4;j++) for(let a=0;a<6;a++) for(let b=0;b<6;b++){ c.beginPath(); c.arc(i*64+8+a*9.5, j*64+8+b*9.5, 1.6, 0, 7); c.fill(); } });
      tile.wrapS=tile.wrapT=T.RepeatWrapping; const tm=new T.MeshStandardMaterial({map:tile, roughness:0.9});
      const tl=(w, h, x, y, z, ry)=>{ const gg=new T.PlaneGeometry(w, h), U=gg.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w/1.2, U.getY(i)*h/1.2);
        const m=new T.Mesh(gg, tm); m.position.set(x, y, z); m.rotation.y=ry; m.receiveShadow=true; scene.add(m); };
      tl(12-PT/2-X0-TW, PH-FL-0.4, (X0+TW+12-PT/2)/2, FL+0.2+(PH-FL-0.4)/2+0.02, BK+0.012, 0);                    // (the back wall)
      tl(-1480-PT/2-BK, PH-FL-0.4, X0+TW+0.012, FL+0.2+(PH-FL-0.4)/2+0.02, (BK-1480-PT/2)/2, Math.PI/2);           // (the west wall)
      // the piano: a grand, its lid up on the stick, the keys, three legs, the bench
      { const px=4.6, pz=-1483.7, sh=new T.Shape(); sh.moveTo(-0.75, 0); sh.lineTo(0.75, 0); sh.lineTo(0.75, 0.9); sh.bezierCurveTo(0.75, 1.5, 0.2, 1.4, 0.05, 1.75); sh.lineTo(-0.75, 1.8); sh.closePath();
        // (the case's outline extruded up from its underside, the keyboard's straight side toward the bench; the lid hinged on the long
        //  straight side and propped up on its stick)
        const pg=new T.ExtrudeGeometry(sh, {depth:0.3, bevelEnabled:true, bevelThickness:0.02, bevelSize:0.02, bevelSegments:2, curveSegments:12}); pg.rotateX(-Math.PI/2); ent(pg, px, FL+0.7, pz+0.85, "#141414");
        const lg=new T.ExtrudeGeometry(sh, {depth:0.025, bevelEnabled:false, curveSegments:12}); lg.rotateX(-Math.PI/2); lg.translate(0.75, 0, 0);
        ent(lg, px-0.75, FL+1.045, pz+0.85, "#1a1a1a", 0, 0, 0.55); tube(V3(px+0.45, FL+1.03, pz-0.25), V3(px+0.45, FL+1.6, pz-0.25), 0.012, "#2a2a2a", 4);
        B(1.42, 0.03, 0.16, px, FL+0.73, pz+0.93, "#f2eee2"); for(let k=0;k<36;k++) if([1,3,6,8,10].includes(k%12)) B(0.022, 0.02, 0.09, px-0.7+k*0.04, FL+0.75, pz+0.9, "#141414");
        for(const [lx, lz] of [[-0.62, 0.75],[0.62, 0.75],[0.0, -0.75]]) RB(0.1, 0.7, 0.1, px+lx, FL+0.35, pz+lz, "#141414", 0, 0.02);
        addCol(px-0.8, px+0.8, pz-0.97, pz+0.9, FL-0.5, FL+1.05);
        RB(0.8, 0.06, 0.36, px, FL+0.48, pz+1.38, "#141414", 0, 0.02); for(const e of [-0.34, 0.34]) RB(0.05, 0.45, 0.3, px+e, FL+0.23, pz+1.38, "#141414", 0, 0.01);
        addCol(px-0.42, px+0.42, pz+1.18, pz+1.58, FL-0.5, FL+0.52); addSeat(px, pz+1.38, FL, 0, "THE PIANO BENCH"); }
      // a ribbon microphone: the capsule in its rounded grille, the yoke, the stand (on a table or on the floor)
      const mic=(x, y, z, ry, floor)=>{ if(floor){ C(0.18, 0.03, x, y+0.015, z, "#2a2a2c", 16); C(0.012, 1.45, x, y+0.75, z, "#c8ccd0", 8); y+=1.5; } else { C(0.07, 0.03, x, y+0.015, z, "#2a2a2c", 14); C(0.01, 0.28, x, y+0.17, z, "#c8ccd0", 6); y+=0.32; }
        RB(0.1, 0.16, 0.06, x, y+0.08, z, "#9a9da0", ry, 0.03); for(let k=0;k<5;k++) B(0.102, 0.004, 0.062, x, y+0.02+k*0.03, z, "#5a5d60", ry);
        tube(V3(x-0.065*Math.cos(ry), y+0.08, z+0.065*Math.sin(ry)), V3(x-0.065*Math.cos(ry), y, z+0.065*Math.sin(ry)), 0.006, "#5a5d60", 4); tube(V3(x+0.065*Math.cos(ry), y+0.08, z-0.065*Math.sin(ry)), V3(x+0.065*Math.cos(ry), y, z-0.065*Math.sin(ry)), 0.006, "#5a5d60", 4); };
      // the announcer's table: walnut, the two microphones facing each other across it, a script, a glass of water; two chairs
      { const tx=8.6, tz=-1483.0; RB(1.4, 0.05, 0.8, tx, FL+0.75, tz, "#5a3a22", 0, 0.015); for(const a of [-0.62, 0.62]) for(const b of [-0.32, 0.32]) RB(0.05, 0.72, 0.05, tx+a, FL+0.36, tz+b, "#4a3020", 0, 0.01);
        B(1.3, 0.02, 0.7, tx, FL+0.785, tz, "#3a5a3a"); addCol(tx-0.72, tx+0.72, tz-0.42, tz+0.42, FL-0.5, FL+0.78);
        mic(tx, FL+0.795, tz-0.08, 0, false); mic(tx+0.3, FL+0.795, tz+0.1, 0.5, false);
        B(0.21, 0.004, 0.29, tx-0.4, FL+0.799, tz+0.12, "#f2eee2"); C(0.03, 0.1, tx+0.5, FL+0.85, tz-0.2, "#d8e8f0", 10);
        for(const [dz, ry] of [[-0.75, 0],[0.75, Math.PI]]){ const cz=tz+dz, f=XF(tx, cz, ry); RB(0.44, 0.06, 0.44, tx, FL+0.46, cz, "#5a3a22", ry, 0.02); RB(0.42, 0.5, 0.05, f.x(0, -0.2), FL+0.74, f.z(0, -0.2), "#5a3a22", ry, 0.02);
          for(const a of [-0.18, 0.18]) for(const b of [-0.18, 0.18]) RB(0.04, 0.44, 0.04, f.x(a, b), FL+0.22, f.z(a, b), "#4a3020", ry, 0.01);
          addCol(tx-0.24, tx+0.24, cz-0.24, cz+0.24, FL-0.5, FL+0.5); addSeat(tx, cz, FL, ry+Math.PI, "A CHAIR AT THE ANNOUNCER'S TABLE"); } }
      mic(6.6, FL, -1482.2, 0.3, true); addCol(6.4, 6.8, -1482.4, -1482.0, FL-0.5, FL+1.7);
      for(const [x, z] of [[2.9, -1481.0],[3.6, -1481.0]]){ C(0.01, 1.1, x, FL+0.55, z, "#2a2a2c", 6); B(0.36, 0.26, 0.02, x, FL+1.18, z, "#2a2a2c"); C(0.13, 0.015, x, FL+0.01, z, "#2a2a2c", 10); addCol(x-0.15, x+0.15, z-0.15, z+0.15, FL-0.5, FL+1.2); }
      // the studio's clock and its ON AIR lamp on the back wall, the speaker box in the corner
      C(0.2, 0.05, 8.6, FL+2.7, BK+0.04, "#1a1a1a", 24, Math.PI/2); sign(0.34, 0.34, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.beginPath(); c.arc(W/2, H/2, W*0.48, 0, 7); c.fill(); c.strokeStyle="#c8281e"; c.lineWidth=4;
          c.beginPath(); c.moveTo(W/2, H/2); c.lineTo(W/2, H*0.12); c.stroke(); c.strokeStyle="#1a1a1a"; for(let k=0;k<60;k++){ const a=k/60*Math.PI*2, r0=k%5 ? 0.42 : 0.36; c.lineWidth=k%5 ? 1 : 3; c.beginPath(); c.moveTo(W/2+Math.cos(a)*W*r0, H/2+Math.sin(a)*H*r0); c.lineTo(W/2+Math.cos(a)*W*0.46, H/2+Math.sin(a)*H*0.46); c.stroke(); } },
        8.6, FL+2.7, BK+0.07, 0, false, 200);
      RB(0.6, 0.2, 0.1, 6.6, FL+2.9, BK+0.06, "#2a2a30", 0, 0.02); sign(0.52, 0.15, (c, W, H)=>{ c.fillStyle="#3a0606"; c.fillRect(0, 0, W, H); c.shadowColor="#ff3a2a"; c.shadowBlur=10; say(c, "ON AIR", W/2, H/2, W*0.78, H*0.6, "#ff5a3a", "900", "'Arial Black', Arial"); c.shadowBlur=0; },
        6.6, FL+2.9, BK+0.115, 0, true, 300);
      RB(0.5, 0.6, 0.3, X0+TW+0.4, CEIL-0.5, BK+0.3, "#5a3a22", 0, 0.03); B(0.4, 0.46, 0.01, X0+TW+0.4, CEIL-0.5, BK+0.455, "#c8b48a");
      pend(4.6, -1483.2, 0.36); pend(8.6, -1483.2, 0.36);
      lamp(4.6, CEIL-0.8, -1483.0, 0.6, V); lamp(8.6, CEIL-0.8, -1483.0, 0.6, V); }

    /* -- the control room: the board under the window to the studio (its knobs, its keys, its VU meters lit), the operator's chair,
       two transcription turntables in their cabinets on the back wall, the rack of amplifiers by the door to the transmitter -- */
    { const V=VB(12, 16, BK, -1480);
      const bx=12+PT/2+0.42; RB(0.84, 0.8, 3.4, bx, FL+0.4, -1482.9, "#5a5d5a", 0, 0.03);
      // (the board's face sloped up toward the window, its meters and knobs a lit panel laid on it)
      const tilt=0.35, nx=Math.sin(tilt), ny=Math.cos(tilt), pc=V3(bx+0.02, FL+0.9, -1482.9);
      ent(boxGeo(0.62, 0.05, 3.3), pc.x, pc.y, pc.z, "#3a3d3a", 0, 0, -tilt);
      signPanel(3.1, 0.54, signTex(1200, 210, (c, W, H)=>{ c.fillStyle="#2a2d2a"; c.fillRect(0, 0, W, H);
          for(let k=0;k<4;k++){ const x=W*(0.13+k*0.245); c.fillStyle="#f2e2a8"; c.fillRect(x-W*0.08, H*0.1, W*0.16, H*0.42); c.strokeStyle="#1a1a1a"; c.lineWidth=3;
            c.beginPath(); c.arc(x, H*0.62, H*0.42, Math.PI*1.28, Math.PI*1.72); c.stroke(); c.beginPath(); c.moveTo(x, H*0.6); c.lineTo(x+W*(-0.03+k*0.02), H*0.2); c.stroke();
            for(let j=0;j<3;j++){ c.fillStyle="#141414"; c.beginPath(); c.arc(x+(j-1)*W*0.05, H*0.75, H*0.08, 0, 7); c.fill(); c.fillStyle="#c8ccd0"; c.fillRect(x+(j-1)*W*0.05-1, H*0.68, 2, H*0.06); } } }),
        pc.x+nx*0.03, pc.y+ny*0.03, pc.z, Math.PI/2, true, -(Math.PI/2-tilt));
      addCol(12+PT/2, bx+0.42, -1484.6, -1481.2, FL-0.5, FL+0.92);
      { const cx=13.55, cz=-1482.9, ry=-Math.PI/2, f=XF(cx, cz, ry); RB(0.48, 0.08, 0.46, cx, FL+0.46, cz, "#2a2a2c", ry, 0.03); RB(0.46, 0.5, 0.07, f.x(0, -0.2), FL+0.76, f.z(0, -0.2), "#2a2a2c", ry, 0.03);
        C(0.025, 0.4, cx, FL+0.22, cz, "#c8ccd0", 8); C(0.24, 0.03, cx, FL+0.02, cz, "#c8ccd0", 14); addCol(cx-0.26, cx+0.26, cz-0.26, cz+0.26, FL-0.5, FL+0.5);
        RADIO_ST.dj={x:cx, z:cz, y:FL, yaw:ry}; }                                   // (the night man's, 14q: never empty)
      for(const tx of [13.35, 14.75]){ RB(1.0, 0.82, 0.86, tx, FL+0.41, BK+0.45, "#4a4a46", 0, 0.03); C(0.4, 0.03, tx, FL+0.835, BK+0.45, "#1a1a1a", 28); C(0.38, 0.006, tx, FL+0.855, BK+0.45, "#3a2a2a", 28);
        C(0.05, 0.02, tx, FL+0.865, BK+0.45, "#c8b48a", 12); tube(V3(tx+0.4, FL+0.9, BK+0.2), V3(tx+0.1, FL+0.88, BK+0.5), 0.012, "#c8ccd0", 4);
        addCol(tx-0.5, tx+0.5, BK, BK+0.88, FL-0.5, FL+0.9); }
      { const rx=16-PT/2-0.32, rz=-1481.2; RB(0.6, 2.0, 0.55, rx, FL+1.0, rz, "#3a3d3a", 0, 0.02);
        for(let k=0;k<6;k++){ B(0.02, 0.26, 0.5, rx-0.31, FL+0.3+k*0.3, rz, "#5a5d5a"); push("rn_glow", planeGeo(0.06, 0.04, 0), rx-0.325, FL+0.35+k*0.3, rz-0.15, -Math.PI/2, "#ffffff");
          for(let j=0;j<3;j++) C(0.02, 0.03, rx-0.33, FL+0.3+k*0.3, rz+0.05+j*0.08, "#141414", 8, 0, 0, Math.PI/2); }
        addCol(rx-0.31, 16-PT/2, rz-0.3, rz+0.3, FL-0.5, FL+2.0); }
      pend(14.1, -1482.9, 0.28); lamp(14.1, CEIL-0.8, -1482.9, 0.55, V); }

    /* -- the office: the manager's desk by the window with its typewriter and telephone, a filing cabinet, the record library on the
       studio wall (shelves of transcription discs and records in their sleeves), the program log on a clipboard -- */
    { const V=VB(10, 16, -1480, IN);
      { const dx=13.1, dz=IN-0.62; RB(1.5, 0.05, 0.75, dx, FL+0.76, dz, "#5a3a22", 0, 0.02); RB(0.44, 0.7, 0.7, dx-0.5, FL+0.37, dz, "#4a3020", 0, 0.02); RB(0.44, 0.7, 0.7, dx+0.5, FL+0.37, dz, "#4a3020", 0, 0.02);
        addCol(dx-0.77, dx+0.77, dz-0.4, dz+0.4, FL-0.5, FL+0.79);
        RB(0.38, 0.12, 0.3, dx-0.2, FL+0.85, dz-0.05, "#1a1a1a", 0, 0.03); B(0.3, 0.02, 0.08, dx-0.2, FL+0.92, dz-0.1, "#2a2a2c"); B(0.22, 0.12, 0.004, dx-0.2, FL+0.98, dz+0.06, "#f2eee2");
        RB(0.2, 0.08, 0.22, dx+0.45, FL+0.825, dz, "#141414", 0, 0.02); B(0.24, 0.03, 0.32, dx+0.15, FL+0.8, dz+0.18, "#c8b48a");
        CT_(0.07, 0.11, 0.16, dx+0.6, FL+1.0, dz-0.2, "#2f6a48"); C(0.012, 0.2, dx+0.6, FL+0.88, dz-0.2, "#b8902a", 6);
        const f=XF(dx, dz-0.75, 0); RB(0.5, 0.08, 0.48, dx, FL+0.46, dz-0.75, "#6a3420", 0, 0.04); RB(0.5, 0.6, 0.1, f.x(0, -0.2), FL+0.8, f.z(0, -0.2), "#6a3420", 0, 0.04);
        C(0.025, 0.4, dx, FL+0.22, dz-0.75, "#2a2a2c", 8); addCol(dx-0.27, dx+0.27, dz-1.02, dz-0.48, FL-0.5, FL+0.5); addSeat(dx, dz-0.75, FL, Math.PI, "THE MANAGER'S CHAIR");
        lamp(dx+0.6, FL+1.2, dz-0.2, 0.3, V, 0xffd8a0); }
      RB(0.5, 1.35, 0.62, 16-PT/2-0.27, FL+0.675, IN-0.45, "#7a7d78", 0, 0.02); for(let k=0;k<4;k++){ B(0.02, 0.28, 0.5, 16-PT/2-0.53, FL+0.2+k*0.32, IN-0.45, "#8a8d88"); C(0.012, 0.12, 16-PT/2-0.545, FL+0.3+k*0.32, IN-0.45, "#c8ccd0", 6, 0, 0, Math.PI/2); }
      addCol(16-PT/2-0.53, 16-PT/2, IN-0.77, IN-0.13, FL-0.5, FL+1.35);
      // the record library on the studio wall, either side of the control room's door: shelves of discs in their brown sleeves
      for(const [x0, x1] of [[10.3, 12.95],[14.35, 15.85]]){ const sx=(x0+x1)/2, sz=-1480+PT/2+0.2; B(x1-x0, 2.2, 0.36, sx, FL+1.1, sz, "#5a3a22");
        for(let k=0;k<5;k++){ B(x1-x0-0.04, 0.02, 0.34, sx, FL+0.08+k*0.44, sz+0.01, "#4a3020"); const q=_trng(k*13+x0*7|0); for(let x=x0+0.06; x<x1-0.06; x+=0.02+q()*0.012)
            B(0.008+q()*0.008, 0.31+q()*0.04, 0.31, x, FL+0.26+k*0.44, sz+0.02, ["#8a6a42","#a88a5a","#6a4a2a","#1a1a1a","#c8b48a"][(q()*5)|0]); }
        addCol(x0, x1, -1480+PT/2, sz+0.19, FL-0.5, FL+2.2); }
      { const cx=11.0, cz=-1476.2; RB(0.6, 0.7, 0.45, cx, FL+0.35, IN-0.25, "#4a3020", 0, 0.02); addCol(cx-0.3, cx+0.3, IN-0.48, IN, FL-0.5, FL+0.72);
        for(let k=0;k<8;k++) B(0.012, 0.3, 0.3, cx-0.24+k*0.06, FL+0.86, IN-0.25, ["#c8281e","#2a4a8a","#e8c030","#1a1a1a"][k%4]); void cz; }
      sign(0.9, 0.6, (c, W, H)=>{ c.fillStyle="#f2ecd8"; c.fillRect(0, 0, W, H); c.strokeStyle="#1a1a1a"; c.lineWidth=3; c.strokeRect(6, 6, W-12, H-12);
          say(c, "PROGRAM LOG", W/2, H*0.14, W*0.70, H*0.12, "#1a1a1a", "800", "'Courier New', monospace");
          c.fillStyle="#3a3a3a"; for(let k=0;k<10;k++){ c.fillRect(W*0.1, H*(0.26+k*0.065), W*0.14, 2); c.fillRect(W*0.3, H*(0.26+k*0.065), W*(0.3+((k*7)%5)*0.06), 2); } },
        16-PT/2-0.012, FL+1.7, -1475.9, -Math.PI/2, false, 300);
      pend(13.0, -1477.1, 0.3); lamp(13.0, CEIL-0.8, -1477.1, 0.55, V); }

    /* -- the transmitter room, in the round end: the transmitter in three tall cabinets on the back wall (its meters, its tubes glowing
       through their windows), the phasing and the antenna tuning panel, the engineer's desk in the round with the log, the coax going
       up and out to the tower's feed line -- */
    { const V=VB(16, XR+R, BK, IN);
      for(let k=0;k<3;k++){ const cx=16.9+k*0.98, cz=BK+0.45; RB(0.94, 1.95, 0.8, cx, FL+0.975, cz, "#5a6a62", 0, 0.03); B(0.8, 0.5, 0.02, cx, FL+1.55, cz+0.405, "#2a2d2a");
        for(let j=0;j<2;j++){ C(0.09, 0.02, cx-0.2+j*0.4, FL+1.6, cz+0.42, "#f2e2a8", 18, Math.PI/2); }
        push("rn_lamp", new T.CircleGeometry(0.16, 18), cx, FL+1.05, cz+0.414, 0, "#ff9a3a"); C(0.18, 0.02, cx, FL+1.05, cz+0.41, "#2a2a2c", 20, Math.PI/2);
        B(0.84, 0.03, 0.02, cx, FL+0.55, cz+0.405, "#c8ccd0"); for(let j=0;j<4;j++) C(0.025, 0.03, cx-0.3+j*0.2, FL+0.75, cz+0.42, "#141414", 10, Math.PI/2); }
      sign(2.7, 0.18, (c, W, H)=>{ c.fillStyle="#2a2d2a"; c.fillRect(0, 0, W, H); say(c, "1 KW · 1340 KC · FRENCH CREEK BROADCASTING", W/2, H/2, W*0.84, H*0.6, "#d8dce0", "700", "Arial"); }, 17.88, FL+1.88, BK+0.858, 0, false, 900);
      addCol(16.4, 19.4, BK, BK+0.86, FL-0.5, FL+1.95);
      tube(V3(18.86, FL+1.95, BK+0.45), V3(18.86, CEIL-0.1, BK+0.45), 0.06, "#b87a3a", 8); tube(V3(18.86, CEIL-0.1, BK+0.45), V3(XR+R*0.9, CEIL-0.1, BK+2.0), 0.06, "#b87a3a", 8);
      // the tuning panel on the partition, a big knife switch on it
      RB(0.04, 1.2, 0.9, 16+PT/2+0.02, FL+1.5, -1483.6, "#2a2d2a", 0, 0.01); B(0.06, 0.04, 0.5, 16+PT/2+0.06, FL+1.7, -1483.6, "#b87a3a"); tube(V3(16+PT/2+0.08, FL+1.7, -1483.4), V3(16+PT/2+0.3, FL+1.4, -1483.4), 0.012, "#c8ccd0", 4);
      // the engineer's desk in the round, the log open on it, a lamp, his chair
      { const dx=XR+2.3, dz=ZC-0.2; RB(0.7, 0.05, 1.5, dx, FL+0.76, dz, "#6a5a42", 0, 0.02); RB(0.6, 0.7, 0.4, dx, FL+0.37, dz-0.5, "#5a4a32", 0, 0.02); for(const b of [0.65]) RB(0.05, 0.72, 0.05, dx-0.3, FL+0.36, dz+b, "#5a4a32", 0, 0.01);
        addCol(dx-0.37, dx+0.37, dz-0.77, dz+0.77, FL-0.5, FL+0.8); B(0.5, 0.01, 0.36, dx, FL+0.79, dz+0.2, "#f2eee2"); CT_(0.06, 0.1, 0.14, dx+0.2, FL+0.98, dz-0.4, "#2f6a48");
        C(0.012, 0.18, dx+0.2, FL+0.87, dz-0.4, "#b8902a", 6); lamp(dx+0.2, FL+1.15, dz-0.4, 0.3, V, 0xffd8a0);
        const cx=dx-0.75, f=XF(cx, dz+0.1, Math.PI/2); RB(0.46, 0.08, 0.46, cx, FL+0.46, dz+0.1, "#3a3d3a", 0, 0.03); RB(0.07, 0.5, 0.44, f.x(0, -0.2), FL+0.76, f.z(0, -0.2), "#3a3d3a", 0, 0.03);
        C(0.025, 0.4, cx, FL+0.22, dz+0.1, "#c8ccd0", 8); addCol(cx-0.25, cx+0.25, dz-0.15, dz+0.35, FL-0.5, FL+0.5); addSeat(cx, dz+0.1, FL, -Math.PI/2, "THE ENGINEER'S CHAIR"); }
      // a fan on a stand, the fire extinguisher by the door
      C(0.012, 1.2, 17.0, FL+0.6, IN-0.6, "#2a2a2c", 6); C(0.18, 0.02, 17.0, FL+0.01, IN-0.6, "#2a2a2c", 14); C(0.22, 0.12, 17.0, FL+1.3, IN-0.6, "#5a6a62", 18, Math.PI/2); addCol(16.8, 17.2, IN-0.8, IN-0.4, FL-0.5, FL+1.4);
      C(0.08, 0.5, 16+PT/2+0.12, FL+0.6, -1476.5, "#c8281e", 12);
      pend(18.0, -1481.2, 0.3); pend(XR+1.5, ZC, 0.3); lamp(18.0, CEIL-0.8, -1481.2, 0.55, V); lamp(XR+1.5, CEIL-0.8, ZC, 0.5, V); }

    // the rooms, each its own zone (indoor), after the lot's
    for(const [x0, x1, z0, z1, n] of [[X0, 10, -1480, FZ, "THE LOBBY"],[X0, 12, ZC-R, -1480, "STUDIO A"],[12, 16, ZC-R, -1480, "THE CONTROL ROOM"],[10, 16, -1480, FZ, "THE OFFICE"],[16, XR+R, ZC-R, FZ, "THE TRANSMITTER ROOM"]])
      addZone(x0, x1, z0, z1, Y-1, Y+3.9, "FRENCH CREEK BROADCASTING · "+n, true);
  }

  /* ---- the feed line: short poles from the station's west... east end to the tuning house, two wires on each crossarm ---- */
  const T0=RADIO.tower, TY=Terrain.groundAt(T0.x, T0.z);
  { const a=V3(XR+R+1.0, 0, ZC-1.5), b=V3(85.0, 0, -1511.6), n=6,                 // (the last pole off the tuning house's south-west corner, 14s3)
       dx=b.x-a.x, dz=b.z-a.z, L=Math.hypot(dx, dz), ox=-dz/L, oz=dx/L, pts=[];
    for(let k=0;k<=n;k++){ const t=k/n, x=a.x+dx*t, z=a.z+dz*t, gy=g(x, z), top=gy+3.2;
      C(0.11, top-gy+0.6, x, gy+(top-gy-0.6)/2, z, "#5a4a3a", 8); addCol(x-0.13, x+0.13, z-0.13, z+0.13, gy-1, top);
      B(0.09, 0.09, 1.0, x, top, z, "#4a3a2a", Math.atan2(ox, oz)); pts.push([V3(x+ox*0.38, top+0.1, z+oz*0.38), V3(x-ox*0.38, top+0.1, z-oz*0.38)]);
      for(const sd of [-1,1]) C(0.035, 0.12, x+sd*ox*0.38, top+0.08, z+sd*oz*0.38, "#e8e4dc", 8); }
    for(let k=0;k<n;k++) for(const sd of [0,1]){ const p=pts[k][sd], q=pts[k+1][sd], m=p.clone().lerp(q, 0.5); m.y-=0.25;
      tube(p, m, 0.008, "#3a3a3c", 4); tube(m, q, 0.008, "#3a3a3c", 4); } }

  /* ---- at the tower's foot: the pier and its insulator, the tuning house, a fence round the square ---- */
  { const x=T0.x, z=T0.z;
    B(3.2, 1.6, 3.2, x, TY+0.5, z, "#a8a49a"); ent(new T.CylinderGeometry(0.25, 0.9, 1.4, 16), x, TY+2.0, z, "#e8e2d4"); for(let k=0;k<5;k++) C(1.0-k*0.13, 0.08, x, TY+1.45+k*0.26, z, "#d8d2c4", 18);
    addCol(x-1.7, x+1.7, z-1.7, z+1.7, TY-1, TY+3);
    // (the tuning house is 14s3's: a hut you can go into, its cellar and the shelter under that)
    // the fence: chain link on galvanized posts round the tower's square, its west side clear of the tuning house, a gate on the south
    const FX0=x-5, F=9.5, FH=2.1; const run=(x0, z0, x1, z1)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/3)), ry=Math.atan2(x1-x0, z1-z0);
      for(let k=0;k<=n;k++){ const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, gy=g(px, pz); C(0.04, FH+0.5, px, gy+FH/2-0.2, pz, "#a8acb0", 8); }
      const mx=(x0+x1)/2, mz=(z0+z1)/2, gy=g(mx, mz); push("chainlink", planeGeo(L, FH-0.05, 3.2), mx, gy+(FH-0.05)/2+0.05, mz, ry+Math.PI/2, "#ffffff");
      addCol(Math.min(x0, x1)-0.05, Math.max(x0, x1)+0.05, Math.min(z0, z1)-0.05, Math.max(z0, z1)+0.05, gy-1, gy+FH); };
    run(FX0, z-F, x+F, z-F); run(x+F, z-F, x+F, z+F); run(FX0, z-F, FX0, z+F); run(FX0, z+F, x-1.5, z+F); run(x+1.5, z+F, x+F, z+F);
    sign(0.6, 0.4, (c, W, H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0, 0, W, H); c.fillStyle="#b3151b"; c.fillRect(0, 0, W, H*0.34); say(c, "DANGER", W/2, H*0.17, W*0.72, H*0.24, "#f2f0e8", "800", "Arial");
      say(c, "HIGH VOLTAGE · RF", W/2, H*0.52, W*0.80, H*0.16, "#1a1a1a", "800", "Arial"); say(c, "KEEP OUT", W/2, H*0.78, W*0.66, H*0.16, "#1a1a1a", "800", "Arial"); },
      x-3.5, g(x-3.5, z+F)+1.4, z+F+0.03, 0, false, 240);
    addZone(x-F, x+F, z-F, z+F, TY-3, TY+140, "THE TOWER · 1340 KC"); }

  /* ---- the tower: a guyed mast, the kind nearly every AM station put up: a triangle of lattice the same width all the way up,
     1.8 m a face, the three legs tapered in over the bottom three metres to stand on the base insulator (the whole steel mast is the
     aerial, so it must not touch the ground); zig-zag bracing up every face, a horizontal at every panel; painted in seven bands,
     aviation orange and white, orange at the foot and at the top. Guyed in three directions at four heights, each guy broken every
     twenty-odd metres by a strain insulator so that no length of it rings at the station's frequency, all of a side's guys to one
     anchor.
     LIT AS THE RULES HAVE IT for a mast of four hundred feet: a flashing red beacon on top and a pair of them half way up, on
     opposite sides so one is seen from anywhere; and between, at a quarter and at three quarters of the height, steady red
     obstruction lights, one on each leg. The beacons flash together, thirty times a minute; the side lights do not flash. All of
     them are out by day, when the paint is the marking. The conduit that feeds them runs up one leg from the choke at the foot.
     FROM A LONG WAY OFF a lattice mast is a thin banded line, not a column of dots: its braces are finer than a pixel at a couple
     of hundred metres and would come and go. So each face also has a plain sheet in the bands' colours that is not there close to
     and fills in with distance (TOWER_FAR), and the guys, a centimetre and a half of steel, fade as real ones do into the sky. ---- */
  const H=124, FW=1.8, RI=FW/Math.sqrt(3), x=T0.x, z=T0.z, y0=TY+2.7, PAN=1.5, BASE=3.0;
  const ORANGE="#d9501e", WHITE="#d8d0c0";
  const band=y=>Math.min(6, Math.floor(y/(H/7)))%2 ? WHITE : ORANGE;
  const TL=[], GL=[], FL2=[], GB=RADIO.guys;                           // (the guys' bearings from north, clockwise: 04)
  // leg k points out toward guy k
  const leg=(k, y)=>{ const a=GB[k], r=y<BASE ? RI*y/BASE : RI; return V3(x+Math.sin(a)*r, y0+y, z-Math.cos(a)*r); };
  for(let k=0;k<3;k++) tube(V3(x, y0, z), leg(k, BASE), 0.08, band(1), 6, TL);
  for(let k=0;k<3;k++) tube(leg(k, BASE*0.5), leg((k+1)%3, BASE*0.5), 0.03, band(1), 4, TL);
  const NP=Math.floor((H-BASE)/PAN);
  for(let i=0;i<NP;i++){ const ya=BASE+i*PAN, yb=ya+PAN, col=band((ya+yb)/2);
    for(let k=0;k<3;k++){ const k2=(k+1)%3;
      tube(leg(k, ya), leg(k, yb), 0.07, col, 6, TL);                                   // (the leg)
      tube(leg(k, yb), leg(k2, yb), 0.028, col, 4, TL);                                 // (the panel's horizontal)
      i%2 ? tube(leg(k, ya), leg(k2, yb), 0.024, col, 4, TL) : tube(leg(k2, ya), leg(k, yb), 0.024, col, 4, TL); } }   // (the zig-zag)
  const yTop=BASE+NP*PAN;
  tube(V3(x, y0+yTop, z), V3(x, y0+yTop+3.4, z), 0.03, "#2a2a2c", 6, TL);           // (the lightning rod, over the beacon)
  for(let k=0;k<3;k++) tube(leg(k, yTop), V3(x, y0+yTop+0.6, z), 0.03, band(H-1), 4, TL);
  { const c=leg(0, BASE), d=leg(0, yTop); c.x+=0.09; d.x+=0.09; tube(c, d, 0.022, "#8a8d90", 4, TL); }     // (the lights' conduit, up one leg)
  // the far sheets: one to a face and a band, a hair inside the lattice
  { const yb=[BASE]; for(let i=1;i<7;i++) yb.push(H*i/7); yb.push(yTop);
    const P=[], C2=[], I=[], cc=new T.Color();
    for(let i=0;i<yb.length-1;i++){ cc.set(band((yb[i]+yb[i+1])/2));
      for(let k=0;k<3;k++){ const a=leg(k, yb[i]), b2=leg((k+1)%3, yb[i]), c=leg((k+1)%3, yb[i+1]), d=leg(k, yb[i+1]), n=P.length/3;
        for(const q of [a, b2, c, d]){ P.push(x+(q.x-x)*0.97, q.y, z+(q.z-z)*0.97); C2.push(cc.r, cc.g, cc.b); }
        I.push(n, n+1, n+2, n, n+2, n+3); } }
    const fg=new T.BufferGeometry(); fg.setAttribute("position", new T.Float32BufferAttribute(P, 3)); fg.setAttribute("color", new T.Float32BufferAttribute(C2, 3)); fg.setIndex(I); fg.computeVertexNormals();
    const fm=new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, side:T.DoubleSide, transparent:true, depthWrite:false});
    fm.onBeforeCompile=(sh)=>{ sh.fragmentShader=sh.fragmentShader.replace("#include <alphatest_fragment>",
      "diffuseColor.a *= 0.72 * smoothstep( 70.0, 320.0, length( vViewPosition ) );\n#include <alphatest_fragment>"); };
    fm.customProgramCacheKey=()=>"tower-far";
    const far=new T.Mesh(fg, fm); far.name="radio-tower-far"; far.userData.noCull=true; scene.add(far); }
  /* the lamps: each a red lens close to and a point of a few pixels far off. `flash`: a beacon; the rest burn steady */
  const bg=new T.SphereGeometry(1, 14, 10), mk=()=>new T.MeshBasicMaterial({color:0x3a0806, toneMapped:false});
  const BM=mk(), SM=mk(), bp=[], sp=[];
  const lampAt=(p, r, flash)=>{ const m=new T.Mesh(bg, flash ? BM : SM); m.position.copy(p); m.scale.set(r, r*(flash ? 1.5 : 1.1), r); m.userData.noCull=true; scene.add(m);
    (flash ? bp : sp).push(p.x, p.y, p.z);
    ent(new T.CylinderGeometry(r*0.8, r*0.8, r*0.7, 10), p.x, p.y-r*(flash ? 1.75 : 1.3), p.z, "#2a2a2c"); };
  lampAt(V3(x, y0+yTop+1.15, z), 0.30, true);                                              // the top beacon, a 300 mm code beacon
  for(const sd of [0, Math.PI]){ const a=GB[0]+sd+Math.PI/6, p=V3(x+Math.sin(a)*(RI+0.55), y0+yTop*0.5, z-Math.cos(a)*(RI+0.55));
    tube(V3(x+Math.sin(a)*RI*0.5, p.y-0.5, z-Math.cos(a)*RI*0.5), V3(p.x, p.y-0.5, p.z), 0.03, "#2a2a2c", 4, TL); lampAt(p, 0.27, true); }   // the pair half way up, on their arms
  for(const f of [0.25, 0.75]) for(let k=0;k<3;k++){ const p=leg(k, yTop*f), a=GB[k]; p.x+=Math.sin(a)*0.28; p.z-=Math.cos(a)*0.28; lampAt(p, 0.12, false); }   // the side lights
  const dots=(arr, size)=>{ const gg=new T.BufferGeometry(); gg.setAttribute("position", new T.Float32BufferAttribute(arr, 3));
    const pm=new T.PointsMaterial({color:0x000000, size:size, sizeAttenuation:false, toneMapped:false, depthWrite:false, transparent:true, opacity:0});
    const pts=new T.Points(gg, pm); pts.frustumCulled=false; pts.renderOrder=5; scene.add(pts); return pm; };
  RADIO_ST.pmat=dots(bp, 6); RADIO_ST.smat2=dots(sp, 3.5);
  RADIO_ST.bmat=BM; RADIO_ST.smat=SM;
  // the guys: four to a side, from the leg at 27, 52, 76 and 97 per cent of the height down to the side's anchor; each broken by
  // strain insulators (a white egg every twenty-two metres or so, the first close in by the mast); the anchor a block of
  // concrete, the guys' turnbuckles on it
  for(let k=0;k<3;k++){ const a=GB[k], ax=x+Math.sin(a)*RADIO.gr, az=z-Math.cos(a)*RADIO.gr, ag=g(ax, az), A=V3(ax, ag+0.9, az);
    for(const f of [0.27, 0.52, 0.76, 0.97]){ const from=leg(k, yTop*f), L=from.distanceTo(A), n=Math.max(2, Math.round(L/22)); tube(from, A, 0.016, "#3e3e40", 4, GL);
      for(let j=0;j<n;j++){ const t=j===0 ? 2.5/L : j/n, p=from.clone().lerp(A, t), q=from.clone().lerp(A, t+0.42/L); tube(p, q, 0.075, "#e8e2d4", 8, GL); } }
    B(2.2, 1.4, 2.2, ax, ag+0.2, az, "#9a968c"); addCol(ax-1.1, ax+1.1, az-1.1, az+1.1, ag-1, ag+1.0);
    for(let j=0;j<4;j++){ const d=V3(x-ax, 0, z-az).normalize(); C(0.03, 0.5, ax+d.x*0.9+(j-1.5)*0.12*d.z, ag+1.0, az+d.z*0.9-(j-1.5)*0.12*d.x, "#6a6d70", 6); } }
  { const gm=new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2, transparent:true});
    gm.onBeforeCompile=(sh)=>{ sh.fragmentShader=sh.fragmentShader.replace("#include <alphatest_fragment>",
      "diffuseColor.a *= 1.0 - 0.8 * smoothstep( 60.0, 380.0, length( vViewPosition ) );\n#include <alphatest_fragment>"); };
    gm.customProgramCacheKey=()=>"tower-guys";
    const guys=new T.Mesh(mergeEntries(GL), gm); guys.name="radio-guys"; guys.userData.noCull=true; scene.add(guys); }
  // across the base insulator, the ball gap a lightning stroke jumps instead of going through the porcelain
  for(const sd of [-1, 1]){ ent(new T.SphereGeometry(0.07, 12, 9), x+0.62, TY+2.0+sd*0.16, z+0.55, "#b8902a"); tube(V3(x+0.62, TY+2.0+sd*0.16, z+0.55), V3(x+0.30, TY+2.0+sd*0.62, z+0.27), 0.012, "#b8902a", 4, TL); }
  // at the foot, the lighting choke: a grey box the lamps' power crosses the insulator by, on a stand
  B(0.6, 0.8, 0.5, x+2.6, TY+1.0, z-1.5, "#8a8d90"); for(const sd of [-0.22, 0.22]) C(0.03, 0.6, x+2.6+sd, TY+0.3, z-1.5, "#5a5d60", 6);
  addCol(x+2.25, x+2.95, z-1.8, z-1.2, TY-1, TY+1.4);
  // (the tower and its guys one plain mesh: a landmark, seen from miles off, never tiled or culled with the detail)
  const tower=new T.Mesh(mergeEntries(TL), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2})); tower.name="radio-tower"; scene.add(tower);
  // the woods round it all: real trees several rows deep out from the clearing's edge (07 keeps the shell low under them),
  // none on the guys' anchors, each with a trunk you cannot walk through
  if(typeof FOREST!=="undefined"){ const q=_trng(1340), anchors=[];
    for(let k=0;k<3;k++){ const a=GB[k]; anchors.push([x+Math.sin(a)*RADIO.gr, z-Math.cos(a)*RADIO.gr]); }
    for(let gz=-1622; gz<-1452; gz+=6.6) for(let gx=-66; gx<182; gx+=6.6){ const tx=gx+(q()-0.5)*5, tz=gz+(q()-0.5)*5, cd=Terrain.clearDist(tx, tz);
      if(cd<2 || cd>34 || q()<0.18 || anchors.some(([ax, az])=>Math.hypot(tx-ax, tz-az)<4)) continue;
      if(tz>-1462 && tx<52) continue;                                                       // (not on the plain by the drive)
      const sp=cd<8 ? (q()<0.2 ? "hemlock" : "edge") : (q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard"), sc=0.85+q()*0.4;
      FOREST.plant(sp, tx, tz, {scale:sc}); const gy=g(tx, tz), rr=0.22*sc; addCol(tx-rr, tx+rr, tz-rr, tz+rr, gy-0.5, gy+6); } }
  // the walking test's routes (tools/walk.js takes them from here): up the drive and in, round every room; and up the hill to the tower
  RADIO_ST.routes={
    "the radio station: the drive, the lobby, the office, the transmitter":[[11.5, -1371.5],[40, -1372],[40, -1462],[26, -1463],[17, -1464.6],[7.55, -1470],[7.55, -1472.6],[7.55, -1475.4],[8.0, -1477.15],
      [11.2, -1477.15],[14.5, -1477.3],[17.2, -1477.45],[18.6, -1479.6],[21.8, -1482.6],[18.6, -1479.6],[17.2, -1477.45],[11.2, -1477.15],[8.0, -1477.15],[4.65, -1478.0]],
    "the radio station: the studio and the control room":[[7.55, -1472.6],[7.55, -1475.4],[4.65, -1477.6],[4.65, -1480.9],[6.0, -1481.2],[9.8, -1481.4],[6.0, -1481.2],[4.65, -1480.9],[4.65, -1477.6],
      [8.0, -1477.15],[11.2, -1477.15],[13.65, -1478.4],[13.65, -1481.1],[14.6, -1481.5]],
    "the radio station: up to the tower":[[24, -1467],[34, -1468],[60, -1482],[88, -1503],[100, -1509],[100, -1516],[96, -1518]]};
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.72, metalness:0.05});
  detailMesh(ME, mat, "radio", true);
})();
/* the tower's beacons flash after dark and its side lights burn; the glass block glows warm from inside, the door's lamp comes on */
function updateRadioStation(dt, dark){
  const R=RADIO_ST; if(!R.bmat) return; R.t+=dt;
  // (the beacons flash thirty times a minute, on a little longer than off; the side lights burn steady; all out by day)
  const night=dark>0.3, on=night && R.t%2<1.1;
  R.bmat.color.setHex(on ? 0xff2a1a : 0x3a0806);
  R.pmat.color.setHex(on ? 0xff3a22 : 0x000000); R.pmat.opacity=on ? 0.95 : 0;
  R.smat.color.setHex(night ? 0xe02416 : 0x3a0806);
  R.smat2.color.setHex(night ? 0xe0301c : 0x000000); R.smat2.opacity=night ? 0.9 : 0;
  R.glow.emissiveIntensity=0.85*smoothstep(0.25, 0.6, dark); if(R.glowIn) R.glowIn.emissiveIntensity=0.25;
  R.lamp.intensity=1.1*smoothstep(0.3, 0.6, dark);
}
/* ---- the radio station (here: 14q's crowd is built before this file): the night man at the board, day and night; the receptionist at her desk by day ---- */
(function radioFolk(){
  if(typeof RADIO_ST==="undefined" || !RADIO_ST.dj) return;
  const G=crowdGroup("the radio station", 14, -1480, 120), D=RADIO_ST.dj;
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#e8e4d8", pants:"#3b4a66", shoes:"#2a2a2a"}, o);
  crowdAdd(G, {look:look({skin:SKINS[0], hair:HAIRS[4], shirt:"#d8d4c8", pants:"#4a4a52", long:true}), x:D.x, z:D.z, y:D.y, yaw:D.yaw, mode:"sit", sitY:0.515});
  crowdAdd(G, {look:look({female:true, h:0.95, skin:SKINS[2], hair:HAIRS[3], shirt:"#8a2a3a", pants:"#2c3446", long:true}), x:9.05, z:-1479.4, y:D.y, yaw:0, mode:"sit", sitY:0.515, dayOnly:true});
})();
