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
   The tower: a diamond cantilever, the shape the 1930s built for the big
   AM stations, 150 m of lattice standing on its point on a single
   porcelain insulator, widest two fifths of the way up where four guys run
   out to anchors in the woods. Painted in seven bands, orange and white,
   red lamps at its top and at its two marks, flashing after dark. At its
   foot the tuning house in a fenced square, and the feed line coming in
   on short poles from the station, two wires on each crossarm.
   PLAN (world): RADIO (04): the pad x -6..48, z -1500..-1458 at EDIN.y; the
   building x 2..26, z -1486..-1474 (the round end centred x 20); the tower
   at (100, -1522), its footing level at RADIO.ty.
   ---------------------------------------------------------------------- */
const RADIO_ST={beacons:[], glow:null, lamp:null, t:0};
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
  const X0=2, XR=20, R=6, ZC=-1480, FZ=ZC+R, HT=5.0, WALL="#ece6d6";
  // its plan (x across, -z up the shape), grown by o: a rectangle with a half round on its east end
  const plan=(o)=>{ const s=new T.Shape(); s.moveTo(X0-o, -(ZC+R+o)+ZC); s.lineTo(XR, -(ZC+R+o)+ZC); s.absarc(XR, 0, R+o, -Math.PI/2, Math.PI/2, false); s.lineTo(X0-o, R+o); s.closePath(); return s; };
  const slab=(o, y0, y1, c)=>{ const gg=new T.ExtrudeGeometry(plan(o), {depth:y1-y0, bevelEnabled:false, curveSegments:28}); gg.rotateX(-Math.PI/2); ent(gg, 0, y0, ZC, c); };
  slab(0, Y-0.3, Y+HT, WALL);                                          // (the walls, solid: the studios are behind the blocks)
  slab(0.06, Y-0.3, Y+0.5, "#1f3a3c");                                 // (the polished base, dark green granite)
  for(const y of [3.92, 4.22, 4.52]) slab(0.035, Y+y, Y+y+0.1, "#2f7a78");  // (the speed lines, in the teal of the day)
  slab(0.16, Y+HT, Y+HT+0.32, "#e4dccb");                              // (the coping)
  slab(-0.25, Y+HT+0.32, Y+HT+0.36, "#5a5a5e");                        // (the roof's membrane, inside the coping)
  addCol(X0, XR, ZC-R, ZC+R, Y-1, Y+HT+0.4);
  for(const [a, b] of [[0, 0.5],[0.5, 1.0],[-0.5, 0],[-1, -0.5]]){ const t0=a*Math.PI/2, t1=b*Math.PI/2, cx=XR+R*0.5*(Math.cos(t0)+Math.cos(t1)), cz=ZC+R*0.5*(Math.sin(t0)+Math.sin(t1)) ;
    const hx=Math.abs(R*Math.cos(t0)-R*Math.cos(t1))/2+0.6, hz=Math.abs(R*Math.sin(t0)-R*Math.sin(t1))/2+0.6; addCol(Math.min(cx-hx, XR), cx+hx, cz-hz, cz+hz, Y-1, Y+HT+0.4); }
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
    B(dw+0.3, dh+0.15, 0.08, dx, Y+(dh+0.15)/2, FZ+0.02, "#2a2a30");
    for(const sd of [-1,1]){ RB(dw/2-0.04, dh-0.06, 0.05, dx+sd*dw/4, Y+0.05+(dh-0.06)/2, FZ+0.075, "#b8bcc0", 0, 0.012);
      B(dw/2-0.24, dh-0.7, 0.02, dx+sd*dw/4, Y+0.05+dh/2+0.1, FZ+0.105, "#1a2830"); C(0.016, 0.5, dx+sd*0.12, Y+1.05, FZ+0.13, "#e8ecef", 8); }
    const cs=new T.Shape(); cs.moveTo(-1.9, 0); cs.lineTo(1.9, 0); cs.lineTo(1.9, 0.4); cs.absarc(0, 0.4, 1.9, 0, Math.PI, false); cs.closePath();
    const cg=new T.ExtrudeGeometry(cs, {depth:0.2, bevelEnabled:true, bevelThickness:0.02, bevelSize:0.02, bevelSegments:1, curveSegments:20}); cg.rotateX(Math.PI/2);
    ent(cg, dx, Y+3.15, FZ-0.05, WALL);
    RB(3.2, 0.03, 0.7, dx, Y+2.9, FZ+1.0, "#f2ecd8", 0, 0.01);
    B(3.4, 0.16, 1.4, dx, Y+0.08, FZ+0.7, "#a8a49a"); addFlat(dx-1.7, dx+1.7, FZ, FZ+1.4, Y+0.16);
    RADIO_ST.lamp={x:dx, y:Y+2.8, z:FZ+1.4, color:0xffe2b0, intensity:0, dist:9, decay:1.6}; LAMPS.push(RADIO_ST.lamp);
    addUse(dx, FZ+1.1, Y, "THE STATION'S DOOR", ()=>toast(["LOCKED. THROUGH THE GLASS, A SIGN: ON THE AIR · QUIET PLEASE","THE NIGHT MAN IS IN THE BOOTH. HE WAVES YOU OFF: HE'S ON THE AIR",
      "A NOTE TAPED UP: STUDIO TOURS SATURDAYS, TEN TO NOON"][(Math.random()*3)|0], "#ffd8a0"), 1.5); }
  // the fin: up past the roof, RADIO down both faces in neon, a ball on its top
  { const fx=10.25, fz=FZ+0.55, fh=9.4;
    B(0.42, fh, 1.9, fx, Y+fh/2, fz-0.4, WALL); B(0.5, 0.2, 2.0, fx, Y+fh+0.1, fz-0.4, "#2f7a78");
    for(const yy of [8.62, 8.92, 9.22]) B(0.5, 0.1, 2.0, fx, Y+yy, fz-0.4, "#2f7a78");                 // (three fins of its own at the top)
    S(0.32, fx, Y+fh+0.52, fz-0.4); C(0.05, 0.6, fx, Y+fh+0.95, fz-0.4, "#b8bcc0", 8);
    for(const sd of [-1,1]) sign(0.92, 5.6, (c, W, H)=>{ c.fillStyle="#1a1e28"; c.fillRect(0, 0, W, H); c.strokeStyle="#ff6a4a"; c.lineWidth=6; c.shadowColor="#ff6a4a"; c.shadowBlur=12; c.strokeRect(10, 10, W-20, H-20);
        const L="RADIO"; for(let k=0;k<5;k++){ c.shadowColor="#ff9a5a"; c.shadowBlur=16; say(c, L[k], W/2, H*(0.12+k*0.19), W*0.72, H*0.15, "#ffd2a0", "900", "'Arial Black', Arial"); } c.shadowBlur=0; },
      fx+sd*0.222, Y+5.6, fz+0.05, sd>0 ? Math.PI/2 : -Math.PI/2, true, 160);
    addCol(fx-0.25, fx+0.25, fz-1.4, fz+0.6, Y-1, Y+fh); }
  function S(r, x, y, z){ ent(new T.SphereGeometry(r, 16, 12), x, y, z, "#d8d0bc"); }
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
  RB(1.2, 0.7, 0.9, 6, Y+HT+0.7, ZC-2, "#b8bcc0", 0, 0.05); C(0.03, 3.2, 15, Y+HT+1.95, ZC-3, "#8a8d90", 6);
  for(let k=0;k<4;k++) tube(V3(15, Y+HT+3.4, ZC-3), V3(15+Math.cos(k*1.57)*2.2, Y+HT+0.36, ZC-3+Math.sin(k*1.57)*2.2), 0.008, "#6a6d70");
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
  addZone(RADIO.pad.x0, RADIO.pad.x1, RADIO.pad.z0, RADIO.pad.z1, Y-3, Y+20, "FRENCH CREEK BROADCASTING");

  /* ---- the feed line: short poles from the station's west... east end to the tuning house, two wires on each crossarm ---- */
  const T0=RADIO.tower, TY=Terrain.groundAt(T0.x, T0.z);
  { const a=V3(XR+R+1.0, 0, ZC-1.5), b=V3(T0.x-7.5-3.2, 0, T0.z+5.6), n=6, dx=b.x-a.x, dz=b.z-a.z, L=Math.hypot(dx, dz), ox=-dz/L, oz=dx/L, pts=[];
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
    const hx=x-7.5, hz=z+5.6; B(4.2, 3.2, 3.2, hx, TY+1.4, hz, "#8a4a36"); B(4.5, 0.2, 3.5, hx, TY+3.1, hz, "#5a5a5e"); B(0.9, 2.0, 0.06, hx+0.8, TY+1.0, hz+1.62, "#5a6a5a");
    for(let k=0;k<6;k++) B(4.22, 0.012, 3.22, hx, TY+0.2+k*0.5, hz, "#7a4232");
    addCol(hx-2.1, hx+2.1, hz-1.6, hz+1.6, TY-1, TY+3.2);
    tube(V3(hx+2.1, TY+2.6, hz-0.6), V3(x-0.2, TY+3.0, z+0.3), 0.03, "#b8bcc0", 6);          // (the feed up to the tower's foot)
    // the fence: a square of chain link on galvanized posts, a gate on the south
    const F=9.5, FH=2.1; const run=(x0, z0, x1, z1)=>{ const L=Math.hypot(x1-x0, z1-z0), n=Math.max(1, Math.round(L/3)), ry=Math.atan2(x1-x0, z1-z0);
      for(let k=0;k<=n;k++){ const px=x0+(x1-x0)*k/n, pz=z0+(z1-z0)*k/n, gy=g(px, pz); C(0.04, FH+0.5, px, gy+FH/2-0.2, pz, "#a8acb0", 8); }
      const mx=(x0+x1)/2, mz=(z0+z1)/2, gy=g(mx, mz); push("chainlink", planeGeo(L, FH-0.05, 3.2), mx, gy+(FH-0.05)/2+0.05, mz, ry+Math.PI/2, "#ffffff");
      addCol(Math.min(x0, x1)-0.05, Math.max(x0, x1)+0.05, Math.min(z0, z1)-0.05, Math.max(z0, z1)+0.05, gy-1, gy+FH); };
    run(x-F, z-F, x+F, z-F); run(x+F, z-F, x+F, z+F); run(x-F, z-F, x-F, z+F); run(x-F, z+F, x-1.5, z+F); run(x+1.5, z+F, x+F, z+F);
    sign(0.6, 0.4, (c, W, H)=>{ c.fillStyle="#f2f0e8"; c.fillRect(0, 0, W, H); c.fillStyle="#b3151b"; c.fillRect(0, 0, W, H*0.34); say(c, "DANGER", W/2, H*0.17, W*0.72, H*0.24, "#f2f0e8", "800", "Arial");
      say(c, "HIGH VOLTAGE · RF", W/2, H*0.52, W*0.80, H*0.16, "#1a1a1a", "800", "Arial"); say(c, "KEEP OUT", W/2, H*0.78, W*0.66, H*0.16, "#1a1a1a", "800", "Arial"); },
      x-3.5, g(x-3.5, z+F)+1.4, z+F+0.03, 0, false, 240);
    addZone(x-F, x+F, z-F, z+F, TY-3, TY+160, "THE TOWER · 1340 KC"); }

  /* ---- the tower: a diamond of lattice on its point, its guys, its lamps ---- */
  const H=150, HM=H*0.40, WM=14, HP=H*0.88, x=T0.x, z=T0.z, y0=TY+2.7;
  // half its width at a height: from the point up to the widest, in again to the mast at the top
  const half=y=>y<HM ? WM/2*Math.pow(y/HM, 0.95) : Math.max(0.35, WM/2*(1-Math.pow((y-HM)/(HP-HM), 1.15))+0.35*Math.pow((y-HM)/(HP-HM), 3));
  const band=y=>Math.min(6, Math.floor(y/(H/7)))%2 ? "#f2eee6" : "#d4542a";
  const TL=[]; const N=34;
  // the corners at each level: turned so they point north, south, east and west (the guys go out that way, clear of the power cut)
  const corner=(k, y)=>{ const r=half(y)*Math.SQRT2, a=k*Math.PI/2; return V3(x+Math.cos(a)*r, y0+y, z+Math.sin(a)*r); };
  const lv=[]; for(let i=0;i<=N;i++){ const y=0.4+(HP-0.4)*i/N; lv.push(y); }
  for(let i=0;i<N;i++){ const ya=lv[i], yb=lv[i+1], col=band((ya+yb)/2);
    for(let k=0;k<4;k++){ const a=corner(k, ya), b=corner(k, yb), a2=corner((k+1)%4, ya), b2=corner((k+1)%4, yb);
      tube(a, b, 0.16, col, 5, TL); tube(a, b2, 0.06, col, 4, TL); tube(a2, b, 0.06, col, 4, TL); tube(b, b2, 0.07, col, 4, TL); } }
  for(let k=0;k<4;k++) tube(V3(x, y0-0.4, z), corner(k, lv[0]), 0.16, band(0), 5, TL);
  // the mast at the top, and the lamps on it; the lamps at the two marks
  tube(V3(x, y0+HP-2, z), V3(x, y0+H, z), 0.3, band(H-1), 8, TL);
  // (each lamp a ball close to, and a point of a few pixels whatever the distance, the way a lamp reads at night miles off)
  const bmat=new T.MeshBasicMaterial({color:0x3a0806, toneMapped:false}), bg=new T.SphereGeometry(0.45, 12, 9), bp=[];
  for(const [by, k0] of [[H+0.4, 0],[HM, 1],[H*0.7, 1]]){
    const n=k0 ? 4 : 1; for(let k=0;k<n;k++){ const p=k0 ? corner(k, by) : V3(x, y0+by, z); if(k0){ p.x+=(p.x-x)*0.04; p.z+=(p.z-z)*0.04; }
      const m=new T.Mesh(bg, bmat); m.position.copy(p); scene.add(m); bp.push(p.x, p.y, p.z); } }
  { const gg=new T.BufferGeometry(); gg.setAttribute("position", new T.Float32BufferAttribute(bp, 3));
    RADIO_ST.pmat=new T.PointsMaterial({color:0x000000, size:5, sizeAttenuation:false, toneMapped:false, depthWrite:false, transparent:true, opacity:0.95});
    const pts=new T.Points(gg, RADIO_ST.pmat); pts.frustumCulled=false; pts.renderOrder=5; scene.add(pts); }
  RADIO_ST.bmat=bmat;
  // the guys: from the widest corners out to anchors in the woods, three to a side, each with its insulators
  for(let k=0;k<4;k++){ const a=k*Math.PI/2, top=corner(k, HM);
    for(const [r, hy] of [[66, HM],[56, HM*0.55]]){ const ax=x+Math.cos(a)*r, az=z+Math.sin(a)*r, ag=g(ax, az), from=hy===HM ? top : corner(k, hy);
      const to=V3(ax, ag+0.6, az), GL=[]; tube(from, to, 0.025, "#4a4a4c", 4, GL);
      for(const t of [0.08, 0.5]){ const p=from.clone().lerp(to, t), q=from.clone().lerp(to, t+0.01); tube(p, q, 0.12, "#e8e2d4", 8, GL); }
      for(const e of GL) TL.push(e); }
    const ax=x+Math.cos(a)*66, az=z+Math.sin(a)*66, ag=g(ax, az); B(1.6, 1.2, 1.6, ax, ag+0.2, az, "#9a968c"); addCol(ax-0.8, ax+0.8, az-0.8, az+0.8, ag-1, ag+0.9);
    const ax2=x+Math.cos(a)*56, az2=z+Math.sin(a)*56, ag2=g(ax2, az2); B(1.2, 1.0, 1.2, ax2, ag2+0.15, az2, "#9a968c"); addCol(ax2-0.6, ax2+0.6, az2-0.6, az2+0.6, ag2-1, ag2+0.8); }

  // (the tower and its guys one plain mesh: a landmark, seen from miles off, never tiled or culled with the detail)
  const tower=new T.Mesh(mergeEntries(TL), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.2})); tower.name="radio-tower"; scene.add(tower);
  // the woods round it all: real trees several rows deep out from the clearing's edge (07 keeps the shell low under them),
  // none on the guys' anchors, each with a trunk you cannot walk through
  if(typeof FOREST!=="undefined"){ const q=_trng(1340), anchors=[];
    for(let k=0;k<4;k++){ const a=k*Math.PI/2; for(const r of [56, 66]) anchors.push([x+Math.cos(a)*r, z+Math.sin(a)*r]); }
    for(let gz=-1622; gz<-1452; gz+=6.6) for(let gx=-66; gx<182; gx+=6.6){ const tx=gx+(q()-0.5)*5, tz=gz+(q()-0.5)*5, cd=Terrain.clearDist(tx, tz);
      if(cd<2 || cd>34 || q()<0.18 || anchors.some(([ax, az])=>Math.hypot(tx-ax, tz-az)<4)) continue;
      if(tz>-1462 && tx<52) continue;                                                       // (not on the plain by the drive)
      const sp=cd<8 ? (q()<0.2 ? "hemlock" : "edge") : (q()<0.3 ? "hemlock" : q()<0.45 ? "pine" : "hard"), sc=0.85+q()*0.4;
      FOREST.plant(sp, tx, tz, {scale:sc}); const gy=g(tx, tz), rr=0.22*sc; addCol(tx-rr, tx+rr, tz-rr, tz+rr, gy-0.5, gy+6); } }
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.72, metalness:0.05});
  detailMesh(ME, mat, "radio", true);
})();
/* the tower's lamps flash after dark, a second on and a second off; the glass block glows warm from inside, the door's lamp comes on */
function updateRadioStation(dt, dark){
  const R=RADIO_ST; if(!R.bmat) return; R.t+=dt;
  const on=dark>0.35 ? (R.t%2<1.1) : (R.t%2<0.15);
  R.bmat.color.setHex(on ? (dark>0.35 ? 0xff2a1a : 0xc82214) : 0x3a0806);
  R.pmat.color.setHex(on && dark>0.25 ? 0xff3a22 : 0x000000); R.pmat.opacity=on && dark>0.25 ? 0.95 : 0;
  R.glow.emissiveIntensity=0.85*smoothstep(0.25, 0.6, dark);
  R.lamp.intensity=1.1*smoothstep(0.3, 0.6, dark);
}
