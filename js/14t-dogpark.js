"use strict";
/* REST AREA · 14t-dogpark.js
   the dog park at the west end of Lake Street, on the slope down to the
   shore behind No. 1: its fence and its double gate, the agility things,
   the benches and the water; the dogs and their people
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14t · LAKE STREET BARK PARK
   The township fenced the empty corner where the street's back lawns run
   down to the water at its west end: a gravel path in off the street
   between the woods and No. 1, the sign, and a double gate (through the
   first, it swings shut behind you, then the second) into a run of grass
   going down toward the lake. Chain-link round it on galvanised posts.
   Inside, by the gate: wood chips, a fountain with a bowl at its foot, the
   bag dispenser and a can, a bucket of balls to borrow. Along the west
   side the agility things: an A-frame, a tunnel, two jumps, a tyre, the
   weave poles. In the east corner a maple, a bench in its shade.
   The dogs (14b's): a yellow lab whose man throws a ball down the middle
   for her, over and over, and she runs it down, brings it back and drops
   it at his feet; a black lab and a brindle mutt chasing each other round
   the east end, stopping now and then to square up; a little white one
   nosing about, who trots over to see you if you come in; a husky flat out
   in the shade. Their people: the thrower, two at the fence with coffees,
   one on the bench. By day; after dark the park is empty. The whole of it
   runs off the thrower's tick (14q), so it is only worked while you are
   near enough to see it.
   ---------------------------------------------------------------------- */
const DOGPARK={x0:1063.6, x1:1101.0, z0:-1293.4, z1:-1272.0, gx0:1080.5, gx1:1083.5, vz:-1268.8};
(function dogPark(){
  const P=DOGPARK, Z=EDIN.z, HW=EDIN.hw, gy=(x,z)=>Terrain.groundAt(x,z), r=_trng(2828);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c,seg)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,seg||8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(x,s,cx,cy,w,h,col,weight,family)=>{ x.fillStyle=col; fitText(x,s,w,h,cx,cy,weight||"700",family); };
  const sign=(w,h,draw,px,py,pz,ry,cw)=>signPanel(w,h, signTex(cw||Math.round(w*400), Math.round((cw||w*400)*h/w), draw), px,py,pz,ry,false);
  const GALV="#a8aeb2", FH=1.22, LS=0.32;                            // (the fence's height; a tile of its mesh is 32 cm)
  const {x0, x1, z0, z1, gx0, gx1, vz}=P, gm=(gx0+gx1)/2, gw=1.3;      // (the two gates 1.3 m wide, in the middle of the vestibule's ends)

  /* ---- the fence: chain-link on posts, a top rail, the mesh following the ground ----------------------------------- */
  const linkTex=(()=>{ const c=cvs(64,64), x=c.getContext("2d"); x.strokeStyle="#c8ced2"; x.lineWidth=3.2;
    for(let i=-64;i<=128;i+=16){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+64,64); x.stroke(); x.beginPath(); x.moveTo(i,64); x.lineTo(i+64,0); x.stroke(); }
    const t=new T.CanvasTexture(c); t.wrapS=t.wrapT=T.RepeatWrapping; t.anisotropy=4; return t; })();
  const linkMat=new T.MeshStandardMaterial({map:linkTex, alphaTest:0.45, side:T.DoubleSide, roughness:0.5, metalness:0.45});
  const LP=[], LU=[], LI=[], posts=new Set();
  // a run from a to b (along x or along z): a post at each end (one only, where two runs meet) and every 2.4 m between,
  // the mesh from five centimetres off the grass to the rail, the rail over the posts' tops; solid along its length
  const run=(ax, az, bx, bz)=>{ const L=Math.hypot(bx-ax, bz-az), n=Math.max(1, Math.ceil(L/2.4));
    let gmin=1e9, gmax=-1e9;
    for(let k=0;k<=n;k++){ const t=k/n, x=ax+(bx-ax)*t, z=az+(bz-az)*t, g=gy(x,z), key=x.toFixed(2)+","+z.toFixed(2);
      gmin=Math.min(gmin, g); gmax=Math.max(gmax, g);
      if(!posts.has(key)){ posts.add(key); const big=k===0 || k===n;
        C(big ? 0.036 : 0.026, FH+0.38, x, g+(FH+0.08-0.30)/2, z, GALV, 10); C(big ? 0.044 : 0.032, 0.03, x, g+FH+0.09, z, "#8a9094", 10); }
      if(k<n){ const t1=(k+1)/n, xb=ax+(bx-ax)*t1, zb=az+(bz-az)*t1, g1=gy(xb,zb), u0=L*t/LS, u1=L*t1/LS, o=LP.length/3;
        LP.push(x, g+0.05, z,  xb, g1+0.05, zb,  xb, g1+FH, zb,  x, g+FH, z);
        LU.push(u0, 0.05/LS,  u1, 0.05/LS,  u1, FH/LS,  u0, FH/LS);
        LI.push(o, o+1, o+2, o, o+2, o+3);
        tubeE(V3(x, g+FH+0.02, z), V3(xb, g1+FH+0.02, zb), 0.018, GALV, 8); } }
    addCol(Math.min(ax,bx)-0.06, Math.max(ax,bx)+0.06, Math.min(az,bz)-0.06, Math.max(az,bz)+0.06, gmin-0.5, gmax+FH+0.1); };
  run(x0, z0, x1, z0); run(x1, z0, x1, z1); run(x0, z1, x0, z0);
  run(x1, z1, gx1, z1); run(gx1, z1, gm+gw/2, z1); run(gm-gw/2, z1, gx0, z1); run(gx0, z1, x0, z1);
  run(gx0, z1, gx0, vz); run(gx1, z1, gx1, vz); run(gx0, vz, gm-gw/2, vz); run(gm+gw/2, vz, gx1, vz);
  { const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(LP, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(LU, 2));
    g.setIndex(LI); g.computeVertexNormals(); const m=new T.Mesh(g, linkMat); m.castShadow=true; scene.add(m); }
  // the gates: a galvanised frame round the same mesh, on the post at its west side; each swings in (north) as you come
  // up to it and falls shut behind you, the way a dog park's spring hinges shut them
  const gate=(z, label)=>{ const hx=gm-gw/2+0.04, w=gw-0.08, g0=gy(gm, z), G=new T.Group(); G.position.set(hx, g0+0.06, z); scene.add(G);
    const E=[], m4=(x,y,zz)=>new T.Matrix4().makeTranslation(x,y,zz), gc=new T.Color(GALV), H=FH-0.1;
    for(const q of [0.022, w-0.022]) E.push({geo:boxGeo(0.04, H, 0.04), matrix:m4(q, H/2, 0), color:gc});
    for(const y of [0.022, H-0.022, H/2]) E.push({geo:boxGeo(w-0.08, 0.034, 0.034), matrix:m4(w/2, y, 0), color:gc});
    E.push({geo:boxGeo(0.10, 0.05, 0.05), matrix:m4(w-0.02, H*0.62, 0.045), color:new T.Color("#2a2a2c")});            // (the latch)
    G.add(new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.45, metalness:0.35})));
    const lg=new T.PlaneGeometry(w-0.06, H-0.05), U=lg.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(w-0.06)/LS, U.getY(i)*(H-0.05)/LS);
    const lm=new T.Mesh(lg, linkMat); lm.position.set(w/2, H/2, 0); G.add(lm);
    G.children.forEach(m=>{ m.castShadow=true; });
    DOORS.push({g:G, open:0, target:0, x:hx+w/2, z:z, y:g0, base:0, manual:0, ajar:0, swing:1.45, label:label, reach:1.9, rate:3.0}); };
  gate(z1, "THE GATE INTO THE RUN"); gate(vz, "THE DOG PARK GATE");
  addZone(x0, x1, z0, z1, gy(x1, z0)-3, gy(x0, z1)+10, "LAKE STREET BARK PARK");
  addZone(gx0, gx1, z1, vz, gy(gm, vz)-2, gy(gm, vz)+6, "THE DOG PARK'S GATES");

  /* ---- the way in: a gravel path off the street between the woods and No. 1; the signs -------------------------------- */
  { const pts=[[1068.4, Z-HW-0.1],[1068.4, -1232],[1069.4, -1251],[1073.2, -1263.0],[1079.6, -1267.4],[gm, -1268.5]];
    const PP=smoothPath(pts.map(([x,z])=>({x:x, z:z})), 0.8); for(const p of PP) p.y=gy(p.x, p.z);
    layRibbon("gravelbed", PP, -0.7, 0.7, 0.03, 0.5, "#c8beae");
    EAST.noPole.push([1066.0, 1070.8]); }
  // at the street: a little arrow sign at the path's mouth
  { const sx=1066.5, sz=Z-HW-1.6, g=gy(sx, sz);
    B(0.09, 1.3, 0.09, sx, g+0.6, sz, "#5a4430"); addCol(sx-0.06, sx+0.06, sz-0.06, sz+0.06, g-0.5, g+1.3);
    B(0.66, 0.40, 0.04, sx, g+1.05, sz+0.062, "#5a4430");
    sign(0.6, 0.34, (c,W,H)=>{ c.fillStyle="#2e5a3a"; c.fillRect(0,0,W,H); c.strokeStyle="#efe6cc"; c.lineWidth=5; c.strokeRect(7,7,W-14,H-14);
        say(c, "BARK PARK", W/2, H*0.36, W*0.74, H*0.26, "#efe6cc", "800", "Georgia, serif");
        c.fillStyle="#efe6cc"; c.beginPath(); c.moveTo(W/2, H*0.56); c.lineTo(W/2-18, H*0.72); c.lineTo(W/2+18, H*0.72); c.fill(); c.fillRect(W/2-6, H*0.70, 12, H*0.13); },
      sx, g+1.05, sz+0.094, 0, 240); }
  // at the gate: the park's name on a board between two posts, a paw print either side; and the rules
  const paw=(c, x, y, s, col)=>{ c.fillStyle=col; c.beginPath(); c.ellipse(x, y+s*0.3, s*0.55, s*0.45, 0, 0, Math.PI*2); c.fill();
    for(const [dx,dy] of [[-0.62,-0.28],[-0.22,-0.62],[0.22,-0.62],[0.62,-0.28]]){ c.beginPath(); c.ellipse(x+dx*s, y+dy*s, s*0.2, s*0.25, dx*0.4, 0, Math.PI*2); c.fill(); } };
  { const sx=1078.2, sz=vz+0.3, g=gy(sx, sz);
    for(const dx of [-0.85, 0.85]){ B(0.11, 1.75, 0.11, sx+dx, g+0.8, sz, "#6a4a2e"); addCol(sx+dx-0.07, sx+dx+0.07, sz-0.07, sz+0.07, g-0.5, g+1.7); }
    B(1.82, 0.66, 0.05, sx, g+1.32, sz, "#6a4a2e");
    sign(1.7, 0.56, (c,W,H)=>{ c.fillStyle="#2e5a3a"; c.fillRect(0,0,W,H); c.strokeStyle="#efe6cc"; c.lineWidth=6; c.strokeRect(9,9,W-18,H-18);
        say(c, "LAKE STREET", W/2, H*0.32, W*0.56, H*0.16, "#efe6cc", "800", "Georgia, serif");
        say(c, "BARK PARK", W/2, H*0.62, W*0.56, H*0.3, "#f4c430", "900", "Georgia, serif");
        paw(c, W*0.13, H*0.5, H*0.17, "#efe6cc"); paw(c, W*0.87, H*0.5, H*0.17, "#efe6cc"); }, sx, g+1.32, sz+0.037, 0, 680); }
  { const sx=gx1+1.25, sz=vz+0.25, g=gy(sx, sz);
    for(const dx of [-0.42, 0.42]){ B(0.08, 1.5, 0.08, sx+dx, g+0.7, sz, "#4a4c50"); addCol(sx+dx-0.05, sx+dx+0.05, sz-0.05, sz+0.05, g-0.5, g+1.45); }
    B(0.92, 1.0, 0.03, sx, g+1.0, sz, "#e8e4d8");
    sign(0.86, 0.94, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); c.fillStyle="#2e5a3a"; c.fillRect(0,0,W,H*0.17);
        say(c, "PARK RULES", W/2, H*0.085, W*0.76, H*0.1, "#f4f2ec", "800", "Arial");
        const L=["SHUT EACH GATE BEHIND YOU","PICK UP AFTER YOUR DOG","DOGS ON LEASH TILL INSIDE","NO FOOD IN THE RUN","PUPPIES 4 MONTHS & UP","OPEN DAWN TO DUSK","BE NICE. THEY ARE."];
        let s=99; c.font="700 30px Arial"; for(const t of L){ for(s=Math.min(s, H*0.065);;){ c.font="700 "+s+"px Arial"; if(c.measureText(t).width<=W*0.78 || s<=7) break; s-=1; } }
        L.forEach((t,k)=>say(c, t, W/2, H*(0.27+k*0.105), W*0.78, s, k===6 ? "#2e5a3a" : "#1a1a1a", "700", "Arial")); }, sx, g+1.0, sz+0.027, 0, 340); }

  /* ---- inside: by the gate ------------------------------------------------------------------------------------------- */
  // wood chips inside the gate, laid on the slope as it is
  { const cx=gm, cz=z1-1.4, w=9.0, d=2.4, g=new T.PlaneGeometry(w, d, 18, 5), PA=g.attributes.position;
    for(let i=0;i<PA.count;i++){ const x=cx+PA.getX(i), z=cz-PA.getY(i); PA.setZ(i, gy(x,z)+0.03); } g.computeVertexNormals();
    { const U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w*0.5, U.getY(i)*d*0.5); }
    push("mulch", g.rotateX(-Math.PI/2), cx, 0, cz, 0, "#7a5a3a"); }
  // the fountain, a bowl at its foot that it keeps topped up
  { const fx=gm+4.0, fz=z1-1.0, g=gy(fx, fz);
    C(0.24, 0.08, fx, g+0.04, fz, "#8a8a84", 18); C(0.11, 0.86, fx, g+0.47, fz, "#2e5a3a", 16); C(0.20, 0.08, fx, g+0.93, fz, "#2e5a3a", 18);
    C(0.16, 0.012, fx, g+0.975, fz, "#9ab8c8", 18); C(0.015, 0.06, fx+0.08, g+1.0, fz, "#c8ccd0", 8); B(0.06, 0.05, 0.04, fx+0.12, g+0.75, fz, "#c8ccd0");
    C(0.17, 0.07, fx+0.52, g+0.04, fz, "#c8ccd0", 18); C(0.145, 0.012, fx+0.52, g+0.078, fz, "#7aa0b8", 18);
    tubeE(V3(fx+0.12, g+0.73, fz), V3(fx+0.46, g+0.10, fz), 0.008, "#c8ccd0", 6);
    addCol(fx-0.25, fx+0.7, fz-0.25, fz+0.25, g-0.5, g+1.0); }
  // the bags and the can, west of the gate; the bucket of balls to borrow, east of it
  { const sx=gx0-1.6, sz=z1-0.5, g=gy(sx, sz);
    B(0.08, 1.45, 0.08, sx, g+0.66, sz, "#2e5a3a"); B(0.22, 0.30, 0.14, sx, g+1.18, sz-0.09, "#2e5a3a"); B(0.08, 0.05, 0.02, sx, g+1.06, sz-0.162, "#1d1d1e");
    sign(0.2, 0.12, (c,W,H)=>{ c.fillStyle="#efe6cc"; c.fillRect(0,0,W,H); say(c, "BAGS", W/2, H/2, W*0.8, H*0.6, "#2e5a3a", "900", "Arial"); }, sx, g+1.25, sz-0.172, Math.PI, 120);
    C(0.24, 0.78, sx+0.6, g+0.395, sz-0.05, "#2e5a3a", 18); C(0.26, 0.05, sx+0.6, g+0.81, sz-0.05, "#245a30", 18);
    addCol(sx-0.08, sx+0.86, sz-0.32, sz+0.2, g-0.5, g+1.45); }
  { const bx=gm+1.7, bz=z1-0.45, g=gy(bx, bz);
    C(0.16, 0.30, bx, g+0.155, bz, "#e8642a", 16); C(0.165, 0.03, bx, g+0.30, bz, "#c8501e", 16);
    for(let k=0;k<6;k++){ const a=k*1.05, rr=k ? 0.09 : 0; ent(new T.SphereGeometry(0.033, 10, 8), bx+Math.cos(a)*rr, g+0.315+0.03+(k ? 0 : 0.03), bz+Math.sin(a)*rr, "#d8f040"); }
    B(0.06, 0.62, 0.06, bx+0.32, g+0.31, bz, "#5a4430");
    B(0.34, 0.20, 0.03, bx+0.32, g+0.66, bz, "#5a4430");
    sign(0.3, 0.16, (c,W,H)=>{ c.fillStyle="#f4f2ec"; c.fillRect(0,0,W,H); say(c, "TAKE A BALL", W/2, H*0.34, W*0.8, H*0.26, "#1a1a1a", "800", "Arial");
        say(c, "LEAVE A BALL", W/2, H*0.68, W*0.8, H*0.26, "#1a1a1a", "800", "Arial"); }, bx+0.32, g+0.66, bz-0.027, Math.PI, 200);
    addCol(bx-0.17, bx+0.38, bz-0.17, bz+0.17, g-0.5, g+0.75); }

  /* ---- the agility things, along the west side -------------------------------------------------------------------------- */
  // a plank from (xa, ya) to (xb, yb) at z, its width across z, in bands of colour (the yellow ends are the contact zones)
  const plank=(xa, ya, xb, yb, z, w, cols)=>{ const L=Math.hypot(xb-xa, yb-ya), a=Math.atan2(yb-ya, xb-xa), n=cols.length;
    cols.forEach((c, k)=>{ const t=(k+0.5)/n; B(L/n+0.004, k%2 ? 0.045 : 0.055, w, xa+(xb-xa)*t, ya+(yb-ya)*t, z, c, 0, 0, a); }); };       // (each band 5 mm proud of the next where they overlap)
  // the A-frame, over a dog's height, its two ramps meeting at the top
  { const ax=1069.6, az=-1289.4, g=gy(ax, az), top=g+1.45;
    plank(ax-2.05, gy(ax-2.05, az)-0.03, ax, top, az, 0.95, ["#f4c430","#2a5a9a","#2a5a9a","#f4c430"]);
    plank(ax, top, ax+2.05, gy(ax+2.05, az)-0.03, az, 0.95, ["#f4c430","#2a5a9a","#2a5a9a","#f4c430"]);
    for(const dz of [-0.4, 0.4]) tubeE(V3(ax-1.0, g+0.0, az+dz), V3(ax+1.0, g+0.0, az+dz), 0.03, "#8a8d90", 6);
    addCol(ax-2.1, ax+2.1, az-0.5, az+0.5, g-0.5, top+0.05); }
  // the tunnel: a blue tube half sunk in a cradle of sandbags, its ribs round it, open both ends
  { const tx=1073.2, tz=-1281.0, g=gy(tx, tz), L=3.2, R=0.34;
    const tm=new T.Mesh(new T.CylinderGeometry(R, R, L, 22, 1, true), new T.MeshStandardMaterial({color:0x2a7ac8, roughness:0.6, side:T.DoubleSide}));
    tm.rotation.x=Math.PI/2; tm.position.set(tx, g+R+0.02, tz); tm.castShadow=true; scene.add(tm);
    for(let k=0;k<9;k++) ent(new T.TorusGeometry(R+0.006, 0.012, 6, 22), tx, g+R+0.02, tz-L/2+0.12+k*(L-0.24)/8, "#1f5a9a");
    for(const dz of [-1.0, 0, 1.0]) for(const sd of [-1,1]) B(0.22, 0.14, 0.38, tx+sd*(R+0.08), g+0.07, tz+dz, "#a8946a", 0, 0, sd*0.25);
    addCol(tx-R-0.2, tx+R+0.2, tz-L/2, tz+L/2, g-0.5, g+2*R+0.05); }
  // the jumps: two posts, a striped bar across at a lab's knee; the tyre in its frame
  const jump=(x, z, h)=>{ const g=gy(x, z);
    for(const sd of [-1,1]){ for(let k=0;k<4;k++) C(0.025, 0.25, x+sd*0.6, g+0.125+k*0.25, z, k%2 ? "#f4f2ec" : "#c42a1a", 10); C(0.16, 0.03, x+sd*0.6, g+0.015, z, "#8a8d90", 12); }
    for(let k=0;k<6;k++) C(0.018, 0.2, x-0.5+k*0.2, g+h, z, k%2 ? "#f4f2ec" : "#2a5a9a", 8, 0, 0, Math.PI/2);
    addCol(x-0.66, x-0.54, z-0.06, z+0.06, g-0.5, g+1.0); addCol(x+0.54, x+0.66, z-0.06, z+0.06, g-0.5, g+1.0); };
  jump(1067.6, -1279.2, 0.45); jump(1067.6, -1283.6, 0.55);
  { const tx=1074.6, tz=-1287.2, g=gy(tx, tz);
    for(const sd of [-1,1]) B(0.08, 1.55, 0.08, tx+sd*0.65, g+0.75, tz, "#e8e4d8"); B(1.38, 0.08, 0.08, tx, g+1.55, tz, "#e8e4d8");
    ent(new T.TorusGeometry(0.30, 0.085, 10, 22), tx, g+0.78, tz, "#1d1d1e");
    for(const sd of [-1,1]){ tubeE(V3(tx+sd*0.24, g+0.95, tz), V3(tx+sd*0.62, g+1.51, tz), 0.008, "#8a8d90", 4); tubeE(V3(tx+sd*0.37, g+0.78, tz), V3(tx+sd*0.61, g+0.78, tz), 0.008, "#8a8d90", 4); }
    addCol(tx-0.7, tx-0.6, tz-0.05, tz+0.05, g-0.5, g+1.6); addCol(tx+0.6, tx+0.7, tz-0.05, tz+0.05, g-0.5, g+1.6); }
  // the weave poles: six in a line on a rail
  { const wx=1065.6, wz0=-1291.2, n=6, g=gy(wx, wz0+1.5);
    B(0.06, 0.04, (n-1)*0.6+0.3, wx, gy(wx, wz0+1.5)+0.02, wz0+(n-1)*0.3, "#8a8d90");
    for(let k=0;k<n;k++){ const z=wz0+k*0.6, gk=gy(wx, z); C(0.02, 1.0, wx, gk+0.5, z, k%2 ? "#f4f2ec" : "#2a8a3a", 8); }
    addCol(wx-0.05, wx+0.05, wz0-0.1, wz0+(n-1)*0.6+0.1, g-0.5, g+1.0); }

  /* ---- the east corner: the maple, the bench in its shade; another bench by the gate ------------------------------------- */
  { const tx=1099.2, tz=-1274.4; FOREST.plant("hard", tx, tz, {scale:1.25}); addCol(tx-0.35, tx+0.35, tz-0.35, tz+0.35, gy(tx,tz)-0.5, gy(tx,tz)+6); }
  P.benches=[];
  const bench=(x, z, ry)=>{ const f=XF(x, z, ry), g=gy(x, z), q=(w,h,d,lx,ly,lz,c,rx)=>ent(boxGeo(w,h,d), f.x(lx,lz), g+ly, f.z(lx,lz), c, rx||0, ry, 0);
    for(let k=0;k<3;k++) q(1.6, 0.04, 0.11, 0, 0.44, -0.13+k*0.13, "#8a6a48");
    for(let k=0;k<2;k++) q(1.6, 0.10, 0.03, 0, 0.62+k*0.14, -0.23, "#8a6a48", -0.12);
    for(const sd of [-1,1]){ q(0.05, 0.42, 0.05, sd*0.68, 0.21, 0.08, "#2a2a2c"); q(0.05, 0.82, 0.05, sd*0.68, 0.41, -0.22, "#2a2a2c"); q(0.05, 0.04, 0.38, sd*0.68, 0.40, -0.06, "#2a2a2c"); }
    const hx=Math.abs(Math.cos(ry))*0.82+Math.abs(Math.sin(ry))*0.28, hz=Math.abs(Math.sin(ry))*0.82+Math.abs(Math.cos(ry))*0.28;
    addCol(x-hx, x+hx, z-hz, z+hz, g-0.5, g+0.5); P.benches.push([x, z, ry, g]); };
  bench(1096.6, z1-0.75, Math.PI); bench(1076.2, z1-0.75, Math.PI);
  // a few toys lying about: tennis balls gone grey, a frisbee, a rope
  for(const [x, z] of [[1071.2,-1276.4],[1087.6,-1290.2],[1094.1,-1283.3],[1066.8,-1287.9]]) ent(new T.SphereGeometry(0.033, 10, 8), x, gy(x,z)+0.03, z, "#c8d070");
  { const x=1078.9, z=-1284.6, g=gy(x, z); C(0.12, 0.022, x, g+0.016, z, "#e8642a", 18, 0.06, 0, 0.04); }
  { const x=1091.2, z=-1278.2, g=gy(x, z); tubeE(V3(x-0.18, g+0.03, z+0.02), V3(x+0.16, g+0.03, z-0.04), 0.022, "#c8b090", 8);
    for(const sd of [-1,1]) ent(new T.SphereGeometry(0.036, 8, 6), x+sd*0.18, g+0.033, z-(sd>0 ? 0.045 : -0.02), sd>0 ? "#c42a1a" : "#2a5a9a"); }

  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.6, metalness:0.15}));
  mesh.castShadow=true; mesh.receiveShadow=true; scene.add(mesh);
})();

/* ---- the dogs and their people ------------------------------------------------------------------------------------------ */
(function dogParkLife(){
  if(typeof crowdGroup!=="function") return;
  const P=DOGPARK, gy=(x,z)=>Terrain.groundAt(x,z), q=_trng(4747), rnd=()=>Math.random();
  const G=crowdGroup("the dog park", 1082, -1282, 150);
  const look=(o)=>Object.assign({h:1.0, skin:SKINS[1], hair:HAIRS[1], shirt:"#4a6a8a", pants:"#3b4a66", shoes:"#f2f0ea"}, o);
  const bark=(D, k)=>{ if(typeof AUDIO!=="undefined") AUDIO.blip(k||"bark", D.x, D.z); };
  // the man with the ball, a little in from the gate, throwing down the middle
  const OX=1083.4, OZ=P.z1-3.4;
  const thrower=crowdAdd(G, {look:look({skin:SKINS[2], hair:HAIRS[5], shirt:"#3d6e44", pants:"#5c5a52", cap:"#1f3b6e", beard:"#3a2a1a"}), x:OX, z:OZ, yaw:Math.PI, mode:"stand", job:"throw", dayOnly:true});
  // two at the fence with coffees from the Perky Loon (14u), and one on the bench in the shade
  crowdAdd(G, {look:look({female:true, h:0.95, skin:SKINS[0], hair:HAIRS[3], shirt:"#c86a8a", pants:"#2c3446", long:true}), x:1091.4, z:-1276.2, yaw:Math.PI/2, mode:"stand", job:"talk", held:"cup", dayOnly:true});
  crowdAdd(G, {look:look({skin:SKINS[4], hair:HAIRS[0], shirt:"#e8c8a0", pants:"#3b4a66", beanie:"#c42a1a"}), x:1092.6, z:-1276.0, yaw:-Math.PI/2, mode:"stand", job:"talk", held:"cup", dayOnly:true});
  { const [bx, bz, bry, bg]=P.benches[0]; crowdAdd(G, {look:look({female:true, h:0.96, skin:SKINS[3], hair:HAIRS[0], shirt:"#7a4f8a", pants:"#1d1f22", long:true}),
      x:bx+0.4, z:bz+0.02, y:bg, yaw:bry, mode:"sit", sitY:0.515, held:"cup", drink:true, dayOnly:true, sway:0.35});
    addSeat(bx-0.4, bz, bg, bry+Math.PI, "A BENCH AT THE DOG PARK"); }
  { const [bx, bz, bry, bg]=P.benches[1]; for(const dx of [-0.4, 0.4]) addSeat(bx+dx, bz, bg, bry+Math.PI, "A BENCH AT THE DOG PARK"); }

  /* the dogs: 14b's lab, in other coats and sizes. Each has where it is, which way it faces, how fast it is going and
     a stride phase; poseDog sets its bones for a gait, its head and its tail every frame */
  const mk=(coat, s, x, z)=>{ const D=buildDog(coat); D.g.scale.setScalar(s); D.s=s; D.x=x; D.z=z; D.yaw=q()*6.28; D.sp=0; D.ph=q(); D.t=q()*10;
    D.hx=0; D.hy=0; D.wf=6; D.wa=0.35; D.gait="stand"; return D; };
  const poseDog=(D, gait)=>{ const Bn=D.B, root=Bn[0], a=D.ph*Math.PI*2;
    root.position.set(0, 0.44, 0); root.rotation.set(0, 0, 0);
    D.legs.forEach(b=>{ Bn[b].rotation.set(0, 0, 0); Bn[b].scale.set(1, 1, 1); });
    if(gait==="run"){ D.legs.forEach((b,k)=>{ Bn[b].rotation.x=Math.sin(a+(k<2 ? 0 : 2.5)+(k%2)*0.4)*0.9; });
      root.position.y=0.44+Math.abs(Math.sin(a))*0.05; root.rotation.x=Math.sin(a+0.7)*0.09; }
    else if(gait==="trot"){ D.legs.forEach((b,k)=>{ Bn[b].rotation.x=Math.sin(a+(k===0||k===3 ? 0 : Math.PI))*0.5; }); root.position.y=0.44+Math.abs(Math.sin(a*2))*0.012; }
    else if(gait==="bow"){ root.rotation.x=0.26; root.position.y=0.38; Bn[D.legs[0]].rotation.x=Bn[D.legs[1]].rotation.x=-0.55; Bn[D.legs[2]].rotation.x=Bn[D.legs[3]].rotation.x=-0.2; }
    else if(gait==="lie"){ root.position.y=0.18;
      D.legs.forEach((b,k)=>{ Bn[b].rotation.set(k<2 ? -1.38 : -1.42, 0, k<2 ? 0 : (k===2 ? -0.22 : 0.22)); Bn[b].scale.set(1, k<2 ? 1 : 0.55, k<2 ? 1 : 1.25); }); }
    Bn[D.head].rotation.set(D.hx, D.hy, 0);
    Bn[D.tail].rotation.set(gait==="lie" ? -0.62 : 0.25, Math.sin(D.t*D.wf)*D.wa, 0);
    D.g.position.set(D.x, gy(D.x, D.z), D.z); D.g.rotation.y=D.yaw; };
  const ang=(a)=>{ while(a>Math.PI) a-=Math.PI*2; while(a<-Math.PI) a+=Math.PI*2; return a; };
  // steer for a point: turn toward it (no faster than a dog turns), slow into a sharp turn and to a stop at it; kept
  // inside the fence. Returns how far it still is
  const IN={x0:P.x0+0.7, x1:P.x1-0.7, z0:P.z0+0.7, z1:P.z1-0.7};
  const steer=(D, tx, tz, vmax, dt, stopAt)=>{ const dx=tx-D.x, dz=tz-D.z, d=Math.hypot(dx,dz);
    const dy=ang((d>0.05 ? Math.atan2(dx,dz) : D.yaw)-D.yaw); D.yaw+=clamp(dy, -dt*5.0, dt*5.0);
    const v=Math.max(0, Math.min(vmax, (d-(stopAt||0))*2.4))*Math.max(0, Math.cos(dy));
    D.sp+=(v-D.sp)*Math.min(1, dt*3.2);
    D.x=clamp(D.x+Math.sin(D.yaw)*D.sp*dt, IN.x0, IN.x1); D.z=clamp(D.z+Math.cos(D.yaw)*D.sp*dt, IN.z0, IN.z1);
    D.ph=(D.ph+dt*D.sp/(D.sp>3.2 ? 1.9 : 0.85)*(1/D.s))%1;
    return d; };
  const gaitOf=(D)=>D.sp>3.2 ? "run" : D.sp>0.15 ? "trot" : "stand";
  const lookAt=(D, x, z, up)=>{ D.hy=clamp(ang(Math.atan2(x-D.x, z-D.z)-D.yaw), -0.9, 0.9); D.hx=-(up||0); };

  const lab=mk("#d8b070", 1.0, OX+0.9, OZ-1.3), blk=mk("#2a2622", 1.0, 1095, -1287), brn=mk("#7a4a2a", 0.95, 1093, -1283),
        wee=mk("#f2ece0", 0.58, 1080, -1282), hus=mk("#9a9a9a", 1.05, 1098.4, -1276.8);
  const DOGS=[lab, blk, brn, wee, hus];
  hus.yaw=-Math.PI/2-0.4;

  // the ball: in his hand, in the air, rolling, in her mouth, at his feet
  const ball=new T.Mesh(new T.SphereGeometry(0.033, 12, 8), new T.MeshStandardMaterial({color:0xd8f040, roughness:0.85}));
  ball.castShadow=true; scene.add(ball);
  const BV=new T.Vector3(), _bw=new T.Vector3();
  let ballFree=false;
  const toHand=()=>{ const Pp=thrower.P; Pp.B[Pp.j.elR].add(ball); ball.position.set(0, -0.31*Pp.h, 0.03); ballFree=false; };
  const toMouth=()=>{ lab.B[lab.head].add(ball); ball.position.set(0, -0.012, 0.215); ballFree=false; };
  const letGo=(v)=>{ ball.getWorldPosition(_bw); scene.add(ball); ball.position.copy(_bw); BV.copy(v); ballFree=true; };
  toHand();
  const stepBall=(dt)=>{ if(!ballFree) return; const b=ball.position;
    BV.y-=9.8*dt; b.addScaledVector(BV, dt);
    if(b.x<IN.x0-0.4 || b.x>IN.x1+0.4){ b.x=clamp(b.x, IN.x0-0.4, IN.x1+0.4); BV.x*=-0.35; }       // (off the chain-link)
    if(b.z<IN.z0-0.4 || b.z>IN.z1+0.4){ b.z=clamp(b.z, IN.z0-0.4, IN.z1+0.4); BV.z*=-0.35; }
    const g=gy(b.x, b.z)+0.033;
    if(b.y<g){ b.y=g; if(BV.y<-1.0){ BV.y*=-0.42; BV.x*=0.72; BV.z*=0.72; } else { BV.y=0; const f=Math.max(0, 1-dt*2.6); BV.x*=f; BV.z*=f; } } };

  /* fetch: he holds it a moment, she waits by him looking up, tail going; he winds up and throws it down the middle,
     and she is off before it leaves his hand; she runs it down, carries it back and drops it at his feet; he bends
     for it; again */
  const F={st:"hold", t:1.5, k:0};
  const ready=()=>[OX+0.75, OZ-1.25];
  const fetch=(dt)=>{ const p=thrower; F.t-=dt; p.throwK=undefined; p.bendK=undefined;
    if(F.st==="hold"){ const [rx, rz]=ready(); steer(lab, rx, rz, 2.2, dt, 0.05); lab.gait=gaitOf(lab); if(lab.sp<0.3) lab.yaw+=ang(Math.PI-lab.yaw)*Math.min(1, dt*3);
      lookAt(lab, OX, OZ, 0.35); lab.wf=11; lab.wa=0.5;
      if(F.t<0 && Math.random()<dt*0.12) bark(lab);
      if(F.t<=0){ F.st="throw"; F.k=0; } }
    else if(F.st==="throw"){ F.k+=dt/1.1; p.throwK=F.k;
      if(F.k>0.42){ const a=thrower.aim; steer(lab, OX+Math.sin(a)*8, OZ+Math.cos(a)*8, 7.5, dt); } else { lookAt(lab, OX, OZ, 0.4); }
      lab.gait=gaitOf(lab);
      if(F.k>=0.56 && !ballFree){ const a=thrower.aim, dist=9+Math.random()*8;
        const tx=clamp(OX+Math.sin(a)*dist, 1076.5, 1092.5), tz=clamp(OZ+Math.cos(a)*dist, IN.z0+0.8, OZ-5), T2=1.05+dist*0.025;
        ball.getWorldPosition(_bw); const ty=gy(tx, tz)+0.033;
        letGo(V3((tx-_bw.x)/T2, 9.8*T2/2+(ty-_bw.y)/T2, (tz-_bw.z)/T2)); F.st="chase"; } }
    else if(F.st==="chase"){ const b=ball.position, d=steer(lab, b.x, b.z, 7.6, dt); lab.gait=gaitOf(lab); lab.wf=9; lab.wa=0.3;
      if(F.k<1.2){ F.k+=dt/1.1; p.throwK=Math.min(1, F.k); }
      if(d<0.5 && b.y<gy(b.x, b.z)+0.12 && BV.length()<3.5){ toMouth(); F.st="carry"; } }
    else if(F.st==="carry"){ const d=steer(lab, OX, OZ-0.95, 4.6, dt, 0.05); lab.gait=gaitOf(lab); lab.hx=0.05; lab.hy=0; lab.wf=12; lab.wa=0.45;
      if(d<0.25){ letGo(V3(0, 0, 0)); F.st="drop"; F.t=0.7; } }
    else if(F.st==="drop"){ const [rx, rz]=ready(); if(F.t<0.3) steer(lab, rx, rz, 1.4, dt, 0.05); lab.gait=gaitOf(lab); lookAt(lab, OX, OZ, 0.3); lab.wf=12; lab.wa=0.55;
      if(F.t<=0){ F.st="pick"; F.k=0; } }
    else if(F.st==="pick"){ F.k+=dt/1.3; p.bendK=Math.sin(Math.min(1, F.k)*Math.PI); const [rx, rz]=ready(); steer(lab, rx, rz, 1.6, dt, 0.05); lab.gait=gaitOf(lab); lookAt(lab, OX, OZ, 0.3);
      if(F.k>0.5 && ballFree) toHand();
      if(F.k>=1){ F.st="hold"; F.t=0.8+Math.random()*2.4; thrower.aim=Math.PI+(Math.random()-0.5)*0.9; } } };
  thrower.aim=Math.PI;

  /* the chase: the one in front makes for somewhere in the east end, the other goes after it; now and then they swap,
     and now and then they stop and square up, one down on her elbows (a play bow), tails going */
  const CZ={x0:1089.6, x1:P.x1-1.0, z0:P.z0+1.0, z1:-1279.6};
  const CH={lead:0, t:0, pause:0, tgt:[1095, -1286]};
  const chase=(dt)=>{ const L=CH.lead ? brn : blk, Fo=CH.lead ? blk : brn;
    if(CH.pause>0){ CH.pause-=dt; for(const D of [L, Fo]){ const O=D===L ? Fo : L; steer(D, D.x, D.z, 0, dt); D.yaw+=clamp(ang(Math.atan2(O.x-D.x, O.z-D.z)-D.yaw), -dt*4, dt*4); D.wf=14; D.wa=0.5; D.hx=-0.15; D.hy=0; }
      L.gait=CH.pause>0.6 ? "bow" : "stand"; Fo.gait="stand"; if(CH.pause<=0) bark(Fo); return; }
    CH.t+=dt;
    if(Math.hypot(L.x-CH.tgt[0], L.z-CH.tgt[1])<1.6) CH.tgt=[CZ.x0+Math.random()*(CZ.x1-CZ.x0), CZ.z0+Math.random()*(CZ.z1-CZ.z0)];
    steer(L, CH.tgt[0], CH.tgt[1], 5.8, dt); steer(Fo, L.x-Math.sin(L.yaw)*1.1, L.z-Math.cos(L.yaw)*1.1, 6.4, dt);
    for(const D of [L, Fo]){ D.x=clamp(D.x, CZ.x0-1.5, CZ.x1); D.z=clamp(D.z, CZ.z0, CZ.z1+1.0); D.hx=0; D.hy=0; D.wf=7; D.wa=0.3; D.gait=gaitOf(D); }
    if(CH.t>8+Math.random()*30){ CH.t=0; if(Math.random()<0.45){ CH.pause=2.8; } else CH.lead=1-CH.lead; } };

  /* the little white one: nosing about the middle of the run, nose down at whatever she finds; come in and she trots
     over to see you, stands up at your feet with her tail going and yips, then goes back to it */
  const W={st:"go", t:0, tgt:[1082, -1283], cool:0};
  const inside=()=>!driving && player.pos.x>P.x0 && player.pos.x<P.x1 && player.pos.z>P.z0 && player.pos.z<P.z1;
  const wee_=(dt)=>{ W.cool-=dt; W.t-=dt; const px=player.pos.x, pz=player.pos.z, pd=Math.hypot(px-wee.x, pz-wee.z);
    if(W.st!=="greet" && W.cool<=0 && inside() && pd<11){ W.st="greet"; W.t=10; bark(wee, "yip"); }
    if(W.st==="greet"){ const d=steer(wee, px, pz, 2.8, dt, 0.85); wee.gait=gaitOf(wee); wee.wf=16; wee.wa=0.6;
      if(d<1.3){ lookAt(wee, px, pz, 0.55); if(Math.random()<dt*0.35) bark(wee, "yip"); } else { wee.hx=0; wee.hy=0; }
      if(W.t<=0 || pd>13 || !inside()){ W.st="go"; W.cool=30; W.tgt=[1077+Math.random()*12, IN.z0+1+Math.random()*12]; } return; }
    if(W.st==="go"){ const d=steer(wee, W.tgt[0], W.tgt[1], 1.0, dt, 0.05); wee.gait=gaitOf(wee); wee.hx=0.25; wee.hy=Math.sin(wee.t*1.3)*0.25; wee.wf=6; wee.wa=0.25;
      if(d<0.3){ W.st="sniff"; W.t=2+Math.random()*4; } }
    else { steer(wee, wee.x, wee.z, 0, dt); wee.gait="stand"; wee.hx=0.75; wee.hy=Math.sin(wee.t*2.1)*0.3; wee.wf=5; wee.wa=0.2;
      if(W.t<=0){ W.st="go"; W.tgt=[1076.5+Math.random()*13, IN.z0+1+Math.random()*13]; } } };

  // the husky in the shade: flat out, the head up now and then to see what the others are at
  const husky=(dt)=>{ hus.sp=0; const t=hus.t, rest=smoothstep(0.55, 0.85, _noise1(t*0.06+2.2));
    hus.hx=0.38*rest; hus.hy=_noise1(t*0.15+0.4)*0.8*(1-rest*0.6); hus.wf=1.6; hus.wa=0.18; hus.gait="lie"; };

  thrower.onShow=(p, on)=>{ for(const D of DOGS) D.g.visible=on; ball.visible=on; };
  thrower.tick=(p, dt)=>{
    for(const D of DOGS) D.t+=dt;
    stepBall(dt); fetch(dt); chase(dt); wee_(dt); husky(dt);
    for(const D of DOGS) poseDog(D, D.gait); };
})();
