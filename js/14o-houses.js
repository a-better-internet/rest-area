"use strict";
/* REST AREA · 14o-houses.js
   the houses on Lake Street (14n) from the inside: their walls, built round
   real openings, and the rooms behind them
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14o · INSIDE THE HOUSES ON LAKE STREET

   14n builds each house's outside — its foundation, roof, trim, porch or
   deck or stoop — and notes every window and door as an opening in its
   wall. This file builds the walls round those openings, glazes them, hangs
   the doors, and lays out rooms behind them that agree with what the
   outside shows:

   THE CAPE COD, a storey and a half: a centre hall from the front door with
   the stair up its east side; the living room the whole depth of the west
   side, with the fireplace on its end wall where the chimney stands outside;
   the kitchen the whole depth of the east side, the table at the front by
   the windows; a bathroom across the back of the hall under its window.
   Upstairs, under the slopes, a bedroom at each end lit by the gable
   windows, and the two dormers on the front slope are alcoves let into
   them, their windows at the end; a short hall between, round the well.

   THE RANCH, one storey, the garage at one end: in at the front door to the
   living room behind the picture window; the kitchen beside it under the
   small front window, open to the dining room behind; a hall across the
   house to the bedrooms at the far end (the front one, and the main one
   behind it) and the bathroom; and from the dining room a door, a landing
   and two steps down into the garage, the inside of its door, the opener on
   the ceiling, the bench and the shelves, the back window.

   THE BUNGALOW, gable to the road: in off the porch to a living room across
   the front; a hall back the middle with the stair to the attic up its east
   side, a bedroom each side of it on the west, the dining room and the
   kitchen on the east, the bathroom at its end. Upstairs, the front gable's
   window lights a bedroom under the roof; the rest is the attic room.

   THE TWO-STOREY: a centre hall and stair; the living room down the side
   away from the carport, the dining room and kitchen down the carport side,
   and the kitchen's side door out under the carport onto its landing and
   steps; upstairs a bedroom in each front corner, the back bedroom, the
   bathroom, and the hall with the little window over the front door.

   The glass in every window is real, and from inside you see out through
   it; from outside the curtains and the lamp behind them that 14n always
   showed are a panel just inside the glass that faces out only, so the
   street looks as it did. Every room is its own zone, has its light, its
   floor (boards, carpet, lino, tile or the garage's slab) and furniture;
   the doors open as you come to them.
   ---------------------------------------------------------------------- */
const LAKE_HOUSES={routes:{}, stairs:[]};
(function lakeHouses(){
  const Hs=(typeof LAKESIDE!=="undefined" && LAKESIDE.houses) || []; if(!Hs.length) return;
  const Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw, r=_trng(4343);
  const ME=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry,rx,rz)=>ent(boxGeo(w,h,d),x,y,z,c,rx,ry,rz);
  const C=(rad,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(rad,rad,h,seg||roundSegs(rad)),x,y,z,c,rx,ry,rz);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,10), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const _rr=(w,h,d,rad)=>Math.min(rad||0.03, Math.min(w,h,d)*0.32);
  // rounded: wood in a grain, upholstery in a weave (14k's buckets), anything else plain
  const RW=(w,h,d,x,y,z,c,ry,rad)=>push("fh_grain", rboxGeo(w,h,d,_rr(w,h,d,rad),Math.min(w,h,d)<0.12?1:2), x,y,z, ry||0, c);
  const RF=(w,h,d,x,y,z,c,ry,rad)=>push("fh_fabric", rboxGeo(w,h,d,_rr(w,h,d,rad||0.06),2), x,y,z, ry||0, c);
  const RP=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,_rr(w,h,d,rad),2), x,y,z, c, 0, ry||0, 0);
  const PT=0.196;                    // a partition: just under the 19.5 cm the bake grows boxes from, so a liner 6 mm off it is clear
  const TRM="#f4f2ec", PLASTER="#f4f2ec";
  bucketOf("lk_carpet", ()=>new T.MeshStandardMaterial({roughness:1.0, map:(()=>{ const t=signTex(128,128,(c,W,H)=>{ const q=_trng(919);
      c.fillStyle="#e4e0d8"; c.fillRect(0,0,W,H);
      for(let k=0;k<2600;k++){ const v=q(); c.fillStyle=v<0.5 ? "rgba(0,0,0,"+(0.03+q()*0.05).toFixed(3)+")" : "rgba(255,255,255,"+(0.03+q()*0.06).toFixed(3)+")"; c.fillRect(q()*W, q()*H, 1+q()*2, 1+q()*2); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; return t; })()}));
  bucketOf("lk_fixture", ()=>emitMat(0xfff0d8, 0.9, "indoor", null));
  bucketOf("lk_tv", ()=>new T.MeshStandardMaterial({color:0x0c0e10, roughness:0.18, metalness:0.4}));

  /* ---- geometry: convex polygons in a wall's plane, with holes cut for its openings --------------------------
     A wall's outline (s along it, y up) less its openings, as convex pieces: cut in bands at every corner's and
     opening's height, and across at every opening's sides, so the pieces make a grid in which no corner lands
     partway along another piece's edge. (Out here, a kilometre from the origin, a vertex in a float has a tenth of
     a millimetre's play, and a T-junction opens as a line of sparkle down the wall.) Everything below is built
     in world coordinates from these, not as planes centred and turned into place, for the same reason. */
  const clip=(P, k, v, keepHi)=>{ const out=[];
    for(let i=0;i<P.length;i++){ const A=P[i], Bq=P[(i+1)%P.length], ia=keepHi ? A[k]>=v-1e-9 : A[k]<=v+1e-9, ib=keepHi ? Bq[k]>=v-1e-9 : Bq[k]<=v+1e-9;
      if(ia) out.push(A);
      if(ia!==ib){ const t=(v-A[k])/(Bq[k]-A[k]); out.push([A[0]+(Bq[0]-A[0])*t, A[1]+(Bq[1]-A[1])*t]); } }
    return out; };
  const clean=P=>{ let Q=P.filter((p,i)=>{ const q=P[(i+P.length-1)%P.length]; return Math.hypot(p[0]-q[0], p[1]-q[1])>1e-5; });
    for(let pass=0; pass<2; pass++) Q=Q.filter((p,i)=>{ const a=Q[(i+Q.length-1)%Q.length], b=Q[(i+1)%Q.length];
      return Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))>1e-7; });
    return Q; };
  const area=P=>{ let s=0; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; s+=a[0]*b[1]-b[0]*a[1]; } return s/2; };
  // (extraS: more places to cut across, so a piece built separately on top of this one meets it corner to corner)
  function pieces(poly, holes, extraS){ const H=holes||[];
    const ys=[...new Set(poly.map(p=>+p[1].toFixed(5)).concat(H.flatMap(o=>[+o.sill.toFixed(5), +o.head.toFixed(5)])))].sort((a,b)=>a-b);
    const ss=[-1e9].concat([...new Set(H.flatMap(o=>[+o.a.toFixed(5), +o.b.toFixed(5)]).concat((extraS||[]).map(v=>+v.toFixed(5))))].sort((a,b)=>a-b), [1e9]), out=[];
    for(let i=0;i<ys.length-1;i++){ const ya=ys[i], yb=ys[i+1]; if(yb-ya<0.003) continue;
      const band=clip(clip(poly, 1, ya, true), 1, yb, false); if(band.length<3) continue;
      for(let j=0;j<ss.length-1;j++){ const s0=ss[j], s1=ss[j+1]; if(s1-s0<0.003) continue;
        if(H.some(o=>o.a<=s0+1e-4 && o.b>=s1-1e-4 && o.sill<=ya+1e-4 && o.head>=yb-1e-4)) continue;
        const pc=clean(clip(clip(band, 0, s0, true), 0, s1, false)); if(pc.length>=3 && Math.abs(area(pc))>1e-5) out.push(pc); } }
    return out; }
  // a convex face from world points, wound to face n, with uvs from uvf
  const newell=P=>{ const n=V3(0,0,0); for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length];
      n.x+=(a.y-b.y)*(a.z+b.z); n.y+=(a.z-b.z)*(a.x+b.x); n.z+=(a.x-b.x)*(a.y+b.y); } return n; };
  function addFace(G, P, n, uvf){ const Q=newell(P).dot(n)<0 ? P.slice().reverse() : P;
    for(let i=1;i<Q.length-1;i++) for(const q of [Q[0],Q[i],Q[i+1]]){ G.P.push(q.x,q.y,q.z); G.N.push(n.x,n.y,n.z); const u=uvf(q); G.U.push(u[0],u[1]); } }
  function flush(G, bk, col){ if(!G.P.length) return; const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(G.P,3)); g.setAttribute("normal", new T.Float32BufferAttribute(G.N,3)); g.setAttribute("uv", new T.Float32BufferAttribute(G.U,2));
    push(bk, g, 0,0,0, 0, col); }
  // a plane in a wall: ax "x", the plane z=c (s is x); ax "z", the plane x=c (s is z)
  const P3=(ax, c, s, y)=>ax==="x" ? V3(s, y, c) : V3(c, y, s);
  const NRM=ax=>ax==="x" ? V3(0,0,1) : V3(1,0,0);
  // a slab from the plane at c, t thick toward dir, over each piece; uvs anchored to the world, so siding and
  // brick run on from one piece to the next
  function vslab(bk, ax, c, pcs, t, dir, col, uvs){
    const G={P:[],N:[],U:[]}, Nn=NRM(ax), s=uvs||0.5, key=(a,b)=>a[0].toFixed(4)+","+a[1].toFixed(4)+">"+b[0].toFixed(4)+","+b[1].toFixed(4);
    const edges=new Set(); for(const pc of pcs) for(let i=0;i<pc.length;i++) edges.add(key(pc[i], pc[(i+1)%pc.length]));
    for(const pc of pcs){ const front=pc.map(q=>P3(ax, c, q[0], q[1])), back=pc.map(q=>P3(ax, c+dir*t, q[0], q[1]));
      addFace(G, front, Nn.clone().multiplyScalar(-dir), q=>[(ax==="x" ? q.x : q.z)*s*-dir, q.y*s]);
      addFace(G, back, Nn.clone().multiplyScalar(dir), q=>[(ax==="x" ? q.x : q.z)*s*dir, q.y*s]);
      const cx=pc.reduce((a,q)=>a+q[0],0)/pc.length, cy=pc.reduce((a,q)=>a+q[1],0)/pc.length;
      for(let i=0;i<pc.length;i++){ const a=pc[i], b=pc[(i+1)%pc.length], es=b[0]-a[0], ey=b[1]-a[1], L=Math.hypot(es,ey); if(L<1e-5 || edges.has(key(b, a))) continue;
        let ns=ey/L, ny=-es/L; if((a[0]-cx)*ns+(a[1]-cy)*ny<0){ ns=-ns; ny=-ny; }
        const n=ax==="x" ? V3(ns, ny, 0) : V3(0, ny, ns);
        const dq=q=>ax==="x" ? q.z : q.x, sq=q=>ax==="x" ? q.x : q.z;
        addFace(G, [front[i], front[(i+1)%pc.length], back[(i+1)%pc.length], back[i]], n,
          Math.abs(ns)>Math.abs(ny) ? q=>[dq(q)*s, q.y*s] : q=>[sq(q)*s, dq(q)*s]); } }
    flush(G, bk, col); }
  // a wall's colliders, as runX / runZ would give it: full height between its openings, and under and over them
  function wallCols(ax, c, t, a, b, y0, y1, ops, floorY){
    const sunk=y0<=floorY+0.02 ? y0-0.5 : y0, col=(p0, p1, q0, q1)=>ax==="x" ? addCol(p0, p1, c-t/2, c+t/2, q0, q1) : addCol(c-t/2, c+t/2, p0, p1, q0, q1);
    for(const sp of _spans(a, b, ops)){ if(!sp.o){ col(sp.a, sp.b, sunk, y1); continue; }
      if(sp.o.sill>y0+0.01) col(sp.a, sp.b, sunk, sp.o.sill); if(sp.o.head<y1-0.01) col(sp.a, sp.b, sp.o.head, y1); } }
  // a wall, its liner: a rectangle less its openings
  const rect=(a, b, y0, y1)=>[[a, y0],[b, y0],[b, y1],[a, y1]];
  const holesIn=(ops, a, b, y0, y1)=>ops.filter(o=>o.b>a+1e-4 && o.a<b-1e-4 && o.head>y0+1e-4 && o.sill<y1-1e-4)
    .map(o=>({a:Math.max(o.a, a), b:Math.min(o.b, b), sill:Math.max(o.sill, y0), head:Math.min(o.head, y1)}));
  function wall(bk, ax, c, t, a, b, y0, y1, ops, col, uvs, floorY){
    vslab(bk, ax, c-t/2, pieces(rect(a, b, y0, y1), holesIn(ops, a, b, y0, y1)), t, 1, col, uvs); wallCols(ax, c, t, a, b, y0, y1, ops, floorY); }
  function liner(ax, fc, dir, a, b, y0, y1, ops, col){ vliner("plaster", ax, fc, pieces(rect(a, b, y0, y1), holesIn(ops, a, b, y0, y1)), dir, col, 0.5); }
  // a liner: the pieces as one face 6 mm off the plane at c, facing dir
  function vliner(bk, ax, c, pcs, dir, col, uvs){
    const G={P:[],N:[],U:[]}, n=NRM(ax).multiplyScalar(dir), s=uvs||0.5;
    for(const pc of pcs) addFace(G, pc.map(q=>P3(ax, c+dir*0.006, q[0], q[1])), n, q=>[(ax==="x" ? q.x : q.z)*s*(ax==="x" ? dir : -dir), q.y*s]);
    flush(G, bk, col); }
  // any planar convex face (a ceiling under a slope), uvs off its plan
  function face(bk, P, n, col, uvs){ const G={P:[],N:[],U:[]}, s=uvs||0.5; addFace(G, P, n.clone().normalize(), q=>[q.x*s, q.z*s]); flush(G, bk, col); }

  /* ---- furniture: each piece in its own frame, +z out of its front; F(x,z,ry) places it ---------------------- */
  const F=(x, z, ry, y)=>{ const xf=XF(x, z, ry), at=(lx,lz)=>[xf.x(lx,lz), xf.z(lx,lz)];
    return {x:x, z:z, ry:ry, y:y, at:at,
      b:(w,h,d,lx,ly,lz,c)=>{ const [px,pz]=at(lx,lz); B(w,h,d,px,y+ly,pz,c,ry); },
      w:(w,h,d,lx,ly,lz,c,rad)=>{ const [px,pz]=at(lx,lz); RW(w,h,d,px,y+ly,pz,c,ry,rad); },
      f:(w,h,d,lx,ly,lz,c,rad)=>{ const [px,pz]=at(lx,lz); RF(w,h,d,px,y+ly,pz,c,ry,rad); },
      p:(w,h,d,lx,ly,lz,c,rad)=>{ const [px,pz]=at(lx,lz); RP(w,h,d,px,y+ly,pz,c,ry,rad); },
      k:(bk,w,h,d,lx,ly,lz,c)=>{ const [px,pz]=at(lx,lz); push(bk, boxGeo(w,h,d,0.5), px,y+ly,pz, ry, c); },
      g:(geo,lx,ly,lz,c,rx,rz)=>{ const [px,pz]=at(lx,lz); ent(geo, px,y+ly,pz, c, rx||0, ry, rz||0); },
      // a collider round the piece's own w x d at (lx,lz), turned with it
      // (from just under its floor: upstairs, sunk any deeper, it would catch heads on the stair beneath)
      col:(w,d,lx,lz,h)=>{ const [px,pz]=at(lx,lz), sw=Math.abs(Math.sin(ry))>0.5; addCol(px-(sw?d:w)/2, px+(sw?d:w)/2, pz-(sw?w:d)/2, pz+(sw?w:d)/2, y-0.06, y+(h||1.0)); },
      seat:(lx,lz,label,dy)=>{ const [px,pz]=at(lx,lz); addSeat(px, pz, y+(dy||0), ry+Math.PI, label); } }; };
  const LEG=(o, lx, lz, h, rad, c)=>o.g(new T.CylinderGeometry(rad*0.75, rad, h, 10), lx, h/2, lz, c);
  // the pieces
  const sofa=(o, len, col)=>{ const L=len||2.0;
    o.f(L, 0.42, 0.86, 0, 0.25, 0, col, 0.06); o.f(L, 0.48, 0.22, 0, 0.66, -0.32, col, 0.09);
    for(const sd of [-1,1]) o.f(0.20, 0.24, 0.87, sd*(L/2-0.09), 0.56, 0.013, col, 0.07);       // (a centimetre proud of the base and the back)
    const n=L>1.6 ? 3 : 2, cw=(L-0.44)/n; for(let i=0;i<n;i++) o.f(cw-0.02, 0.14, 0.62, -L/2+0.22+cw*(i+0.5), 0.52, 0.08, col, 0.06);
    for(const sd of [-1,1]) o.f(0.40, 0.36, 0.12, sd*(L/2-0.45), 0.72, -0.18, "#e8dcc0", 0.05);
    for(const sx of [-1,1]) for(const sz of [-1,1]) LEG(o, sx*(L/2-0.08), sz*0.36, 0.05, 0.025, "#3a2418");
    o.col(L, 0.86, 0, 0, 0.9); for(let i=0;i<n;i++) o.seat(-L/2+0.22+cw*(i+0.5), 0.08, "THE SOFA"); };
  const chair=(o, col, label)=>{ o.f(0.82, 0.40, 0.84, 0, 0.24, 0, col, 0.06); o.f(0.82, 0.50, 0.20, 0, 0.66, -0.32, col, 0.09);
    for(const sd of [-1,1]) o.f(0.16, 0.24, 0.85, sd*0.34, 0.56, 0.013, col, 0.07); o.f(0.50, 0.12, 0.60, 0, 0.50, 0.08, col, 0.05);
    o.col(0.82, 0.84, 0, 0, 0.9); o.seat(0, 0.08, label||"THE ARMCHAIR"); };
  const table=(o, w, d, h, col, legC)=>{ o.w(w, 0.04, d, 0, h-0.02, 0, col, 0.012);
    for(const sx of [-1,1]) for(const sz of [-1,1]) LEG(o, sx*(w/2-0.07), sz*(d/2-0.07), h-0.04, 0.025, legC||col); o.col(w, d, 0, 0, h); };
  const rug=(o, w, d, col, edge)=>{ o.k("lk_carpet", w, 0.010, d, 0, 0.0155, 0, col); o.k("lk_carpet", w+0.06, 0.008, d+0.06, 0, 0.009, 0, edge||"#5a3a2a"); };
  const lampStand=(o, lx, lz, base, col)=>{ o.g(new T.CylinderGeometry(0.07, 0.09, 0.04, 14), lx, base+0.02, lz, "#2a2a2a");
    o.g(new T.CylinderGeometry(0.012, 0.012, 0.36, 8), lx, base+0.22, lz, "#c9b26a");
    const [px,pz]=o.at(lx,lz); push("lk_fixture", new T.CylinderGeometry(0.10, 0.16, 0.20, 18, 1, true), px, o.y+base+0.46, pz, 0, col||"#f4ead0"); };
  const endTable=(o, col, lamp)=>{ o.w(0.50, 0.03, 0.50, 0, 0.58, 0, col, 0.01); o.w(0.44, 0.03, 0.44, 0, 0.18, 0, col, 0.01);
    for(const sx of [-1,1]) for(const sz of [-1,1]) LEG(o, sx*0.21, sz*0.21, 0.57, 0.018, col);
    if(lamp) lampStand(o, 0, 0, 0.595, lamp); o.col(0.5, 0.5, 0, 0, 0.6); };
  const tvStand=(o, col)=>{ o.w(1.40, 0.50, 0.42, 0, 0.27, 0, col, 0.02); for(const sd of [-1,1]) o.b(0.62, 0.40, 0.012, sd*0.34, 0.27, 0.212, "#5a4030");
    o.b(1.10, 0.64, 0.05, 0, 0.88, -0.04, "#141618"); const [px,pz]=o.at(0, -0.012); push("lk_tv", planeGeo(1.04, 0.58, 0), px, o.y+0.88, pz, o.ry, "#ffffff");
    o.b(0.30, 0.03, 0.18, 0, 0.535, -0.04, "#141618"); o.col(1.4, 0.42, 0, 0, 1.2); };
  const shelves=(o, w, h, col, books)=>{ const t=0.022, D=0.32, n=Math.max(2, Math.round(h/0.36)), gap=(h-0.08)/n;
    for(const sd of [-1,1]) o.w(t, h, D, sd*(w/2-t/2), h/2, 0, col, 0.006);
    o.w(w+0.01, t, D+0.01, 0, h-t/2+0.002, 0.004, col, 0.006); o.b(w-2*t, 0.06, D-0.02, 0, 0.03, 0.005, col);
    o.b(w-2*t, h-0.07, 0.012, 0, (h+0.06)/2, -D/2+0.012, "#3a2c20");
    for(let i=0;i<n;i++){ const y=0.06+i*gap; if(i) o.b(w-2*t-0.004, 0.018, D-0.03, 0, y, 0.004, col);
      if(books!==false) for(let x=-w/2+t+0.03; x<w/2-t-0.04; x+=0.045+r()*0.03){ const bh=Math.min(gap-0.05, 0.17+r()*0.09), bw=0.028+r()*0.018; if(r()<0.12) continue;
        o.b(bw, bh, 0.19+r()*0.04, x+bw/2, y+0.009+bh/2+0.003, -0.02, ["#7a2a22","#2a4a6a","#3a5a2a","#c9a34a","#5a3a6a","#e8dcc0","#2a2a2c"][(r()*7)|0]); } }
    o.col(w, D, 0, 0, h); };
  const bed=(o, w, L, quilt, frame)=>{ o.w(w+0.08, 0.30, L+0.06, 0, 0.17, 0, frame, 0.02); o.w(w+0.10, 0.95, 0.06, 0, 0.48, -L/2-0.02, frame, 0.02);
    o.f(w, 0.22, L-0.04, 0, 0.42, 0.01, "#f2f0ea", 0.06); o.f(w+0.04, 0.06, L*0.70, 0, 0.55, L*0.15, quilt, 0.03);
    for(const sd of (w>1.2 ? [-1,1] : [0])) o.f(w>1.2 ? w/2-0.10 : w-0.16, 0.13, 0.36, sd*(w/4), 0.60, -L/2+0.26, "#f4f2ec", 0.05);
    o.col(w+0.1, L+0.08, 0, 0, 0.7); o.seat(0, 0.10, "THE BED", 0.12); };
  const nightstand=(o, col, lamp)=>{ o.w(0.46, 0.56, 0.40, 0, 0.28, 0, col, 0.02); o.b(0.40, 0.16, 0.012, 0, 0.40, 0.202, "#5a4030");
    o.b(0.08, 0.02, 0.02, 0, 0.40, 0.215, "#c9b26a"); if(lamp) lampStand(o, 0, -0.02, 0.56, lamp); o.col(0.46, 0.40, 0, 0, 0.6); };
  const dresser=(o, w, col)=>{ o.w(w, 0.84, 0.48, 0, 0.42, 0, col, 0.02);
    for(let i=0;i<3;i++) for(const sd of (w>1.0 ? [-1,1] : [0])){ o.b(w>1.0 ? w/2-0.06 : w-0.08, 0.22, 0.012, sd*w/4, 0.14+i*0.25, 0.242, "#5a4030"); o.b(0.10, 0.02, 0.025, sd*w/4, 0.16+i*0.25, 0.255, "#c9b26a"); }
    o.col(w, 0.48, 0, 0, 0.9); };
  // the kitchen: base cabinets with the counter on them, the uppers, the sink, the range, the fridge
  const counterRun=(o, len, opts)=>{ const c=opts.cab||"#e8e2d0", top=opts.top||"#5a5450";
    o.w(len, 0.86, 0.60, 0, 0.43, 0, c, 0.01); o.b(len+0.02, 0.04, 0.63, 0, 0.88, 0.01, top);
    for(let x=-len/2+0.30; x<len/2-0.1; x+=0.60){ o.b(0.56, 0.62, 0.012, x, 0.42, 0.302, opts.door||c); o.b(0.10, 0.015, 0.025, x+0.18, 0.66, 0.315, "#8a8d90"); }
    if(opts.uppers!==false) o.w(len, 0.72, 0.34, 0, 1.86, -0.13, c, 0.01);
    if(opts.sink!==undefined){ const sx=opts.sink; o.b(0.62, 0.006, 0.42, sx, 0.902, 0.04, "#c8ccd0"); o.b(0.56, 0.004, 0.36, sx, 0.906, 0.04, "#7a7e82");
      o.g(new T.CylinderGeometry(0.015, 0.015, 0.26, 8), sx, 1.03, -0.20, "#c8ccd0"); o.g(new T.CylinderGeometry(0.012, 0.012, 0.20, 8), sx, 1.15, -0.10, "#c8ccd0", Math.PI/2); }
    if(opts.range!==undefined){ const rx=opts.range; o.p(0.76, 0.92, 0.60, rx, 0.464, 0.02, "#ece9e2", 0.01); o.b(0.70, 0.012, 0.56, rx, 0.926, 0.01, "#1a1a1c");
      for(const [dx,dz] of [[-0.18,-0.12],[0.18,-0.12],[-0.18,0.14],[0.18,0.14]]) o.g(new T.CylinderGeometry(0.09, 0.09, 0.012, 16), rx+dx, 0.938, dz, "#2a2a2c");
      o.b(0.60, 0.40, 0.012, rx, 0.42, 0.322, "#1e1e20"); o.b(0.72, 0.16, 0.10, rx, 1.02, -0.27, "#ece9e2"); o.b(0.76, 0.30, 0.32, rx, 1.58, -0.10, "#ece9e2"); }
    o.col(len, 0.63, 0, 0.01, 0.95); };
  const fridge=(o, col)=>{ o.p(0.80, 1.76, 0.72, 0, 0.88, 0, col||"#ece9e2", 0.03); o.b(0.76, 0.012, 0.012, 0, 1.18, 0.365, "#c8c4ba");
    for(const y of [0.70, 1.45]) o.b(0.03, 0.30, 0.04, 0.32, y, 0.38, "#b8bab6"); o.col(0.8, 0.72, 0, 0, 1.8); };
  const diningSet=(o, w, d, col, n)=>{ table(o, w, d, 0.76, col);
    const ch=(lx, lz, ry)=>{ const xf=XF(0,0,ry), q=(ww,hh,dd,ax,ay,az,c)=>o.w(ww,hh,dd, lx+xf.x(ax,az), ay, lz+xf.z(ax,az), c, 0.012);
      q(0.44, 0.04, 0.42, 0, 0.45, 0, col); q(0.42, 0.50, 0.04, 0, 0.72, -0.20, col);
      for(const sx of [-1,1]) for(const sz of [-1,1]) q(0.035, 0.45, 0.035, sx*0.19, 0.225, sz*0.18, col); };
    const side=n>4 ? [-w/4, w/4] : [0];
    for(const x of side){ ch(x, d/2+0.30, Math.PI); ch(x, -d/2-0.30, 0); }
    if(n!==4 || w>1.4){ ch(w/2+0.30, 0, -Math.PI/2); ch(-w/2-0.30, 0, Math.PI/2); } };
  // the bathroom: a tub along the wall, the toilet, the vanity with its basin and the mirror over it
  const tub=(o, L)=>{ o.p(L, 0.52, 0.76, 0, 0.26, 0, "#f4f2ee", 0.04); o.b(L-0.16, 0.02, 0.56, 0, 0.515, 0.02, "#d8dde0");
    o.g(new T.CylinderGeometry(0.02, 0.02, 0.18, 8), -L/2+0.12, 0.76, -0.32, "#c8ccd0", Math.PI/2); o.col(L, 0.76, 0, 0, 0.55); };
  const toilet=(o)=>{ push("porcelain", rboxGeo(0.40, 0.38, 0.18, 0.04, 2), ...o.at(0, -0.24).reduce((a,v,i)=>i?[a[0],o.y+0.80,v]:[v],[]), o.ry, "#ffffff");
    const [bx2,bz2]=o.at(0, 0.02); push("porcelain", new T.CylinderGeometry(0.20, 0.15, 0.40, 18).scale(1, 1, 1.25), bx2, o.y+0.20, bz2, o.ry, "#ffffff");
    const [sx2,sz2]=o.at(0, 0.04); push("porcelain", new T.CylinderGeometry(0.21, 0.21, 0.03, 18).scale(1, 1, 1.22), sx2, o.y+0.415, sz2, o.ry, "#ffffff");
    o.col(0.44, 0.66, 0, -0.06, 0.5); };
  const vanity=(o, w, col)=>{ o.w(w, 0.82, 0.52, 0, 0.41, 0, col, 0.01); o.b(w+0.02, 0.04, 0.55, 0, 0.84, 0.01, "#ece8e0");
    const [px,pz]=o.at(0, 0.04); push("porcelain", new T.CylinderGeometry(0.20, 0.16, 0.05, 18).scale(1,1,0.8), px, o.y+0.84, pz, o.ry, "#ffffff");
    o.g(new T.CylinderGeometry(0.014, 0.014, 0.16, 8), 0, 0.93, -0.18, "#c8ccd0");
    const [mx,mz]=o.at(0, -0.241); push("mirror", planeGeo(w-0.10, 0.80, 0), mx, o.y+1.48, mz, o.ry, "#ffffff"); o.b(w-0.04, 0.86, 0.02, 0, 1.48, -0.255, TRM);
    for(const sd of [-1,1]) o.b(0.10, 0.12, 0.10, sd*(w/2-0.18), 1.98, -0.20, "#f4ead0");
    o.col(w, 0.55, 0, 0.01, 0.9); };

  /* ---- a house: the walls round its openings, the gables, the dormers, the glass and the doors ---------------- */
  function shell(h){
    const f=h.f, x0=h.x0, x1=h.x1, zf=h.zf, zb=h.zb, z0=h.z0, z1=h.z1, zm=h.zm, T0=h.T0, FF=h.FF, EAV=h.EAV, RID=h.RID;
    const yB=FF-0.09, yG=Y-0.03, G=h.garage, two=h.kind==="twoStorey", yMid=FF+2.9;
    const OPS=h.ops;
    // each outside wall as one outline less its openings: the gable ends take their gables, and run the full length
    // so the outline is one convex shape; under a garage the wall goes down to its slab, elsewhere the house's floor
    const gx=h.along==="x" ? ["L","R"] : ["F","K"];
    for(const face of ["F","K","L","R"]){ const ax=face==="F"||face==="K" ? "x" : "z", gab=gx.includes(face);
      const c=face==="F" ? zf-f*T0/2 : face==="K" ? zb+f*T0/2 : face==="L" ? x0+T0/2 : x1-T0/2;
      const lo=ax==="x" ? (gab ? x0 : x0+T0) : (gab ? z0 : z0+T0), hi=ax==="x" ? (gab ? x1 : x1-T0) : (gab ? z1 : z1-T0);
      let y0=yB; const holes=OPS[face].map(o=>({a:o.a, b:o.b, sill:o.sill, head:o.head}));
      if(G){ const ga=Math.max(G[0], x0), gb=Math.min(G[1], x1);
        if(ax==="x"){ y0=yG; if(ga>lo+0.01) holes.push({a:lo-0.01, b:ga-0.01, sill:yG-0.01, head:yB}); if(gb<hi-0.01) holes.push({a:gb+0.01, b:hi+0.01, sill:yG-0.01, head:yB}); }
        else if((face==="L" && ga<=x0+0.05) || (face==="R" && gb>=x1-0.05)) y0=yG; }
      const apex=[ax==="x" ? h.x : zm, RID-0.10];
      if(gab && h.bk==="brick"){                          // (brick to the eaves, the gable over them in siding of its own colour)
        vslab("brick", ax, c-T0/2, pieces(rect(lo, hi, y0, EAV), holes.filter(o=>o.head<=EAV+0.01)), T0, 1, h.siding, h.uv);
        vslab("lk_lap", ax, c-T0/2, pieces([[lo, EAV],[hi, EAV], apex], holes.filter(o=>o.sill>=EAV-0.01), holes.flatMap(o=>[o.a, o.b])), T0, 1, h.gable, 1/1.28); }
      else vslab(gab ? "lk_lap" : h.bk, ax, c-T0/2, pieces(gab ? [[lo, y0],[hi, y0],[hi, EAV], apex,[lo, EAV]] : rect(lo, hi, y0, EAV), holes), T0, 1, gab ? h.gable : h.siding, gab ? 1/1.28 : h.uv);
      const cols=OPS[face].filter(o=>o.head<=EAV+0.01);
      if(G && ax==="x"){ const ga=Math.max(G[0], x0), gb=Math.min(G[1], x1);
        for(const [a2, b2, yy] of [[lo, ga, yB],[ga, gb, yG],[gb, hi, yB]]) if(b2-a2>0.01) wallCols(ax, c, T0, a2, b2, yy, EAV, cols, yy); }
      else if(two){ wallCols(ax, c, T0, lo, hi, y0, yMid, cols.filter(o=>o.head<=yMid), y0); wallCols(ax, c, T0, lo, hi, yMid, EAV, cols.filter(o=>o.sill>=yMid), y0); }
      else wallCols(ax, c, T0, lo, hi, y0, EAV, cols, y0); }
    // the glass in every window, the curtains-and-lamp panel facing out behind it, the jambs and stool and casing inside
    const glaze=(ax, cOut, inDir, o, t)=>{ const w=o.b-o.a, hh=o.head-o.sill, cm=(o.a+o.b)/2, cy=(o.sill+o.head)/2, tt=t||T0;
      const at=(dd)=>cOut+inDir*dd, pl=(bk, geo, dd, ry)=>ax==="x" ? push(bk, geo, cm, cy, at(dd), ry, "#ffffff") : push(bk, geo, at(dd), cy, cm, ry, "#ffffff");
      const ryOut=ax==="x" ? (inDir<0 ? 0 : Math.PI) : (inDir<0 ? Math.PI/2 : -Math.PI/2);
      if(!o.door){ pl("glass", planeGeo(w, hh, 0), tt*0.5, ax==="x" ? 0 : Math.PI/2);
        pl(o.lit ? "lk_win" : "lk_wind", planeGeo(w-0.05, hh-0.05, 0), tt*0.5+0.03, ryOut); }
      const bxA=(sw, sh, sd, ds, y, dd)=>ax==="x" ? B(sw, sh, sd, cm+ds, y, at(dd), TRM) : B(sd, sh, sw, at(dd), y, cm+ds, TRM);
      // the jambs: a window's from just inside the glass, a door's from behind its leaf, to 12 mm past the liner
      const jt=o.door ? 0.012 : 0.025, jd=o.door ? tt*0.5+0.03 : tt*0.5+0.005, jl=tt-jd+0.012;
      for(const sd of [-1,1]) bxA(jt, hh, jl, sd*(w/2-jt/2), cy, jd+jl/2);
      bxA(w-2*jt, jt, jl, 0, o.head-jt/2, jd+jl/2);
      // the casing round it on the liner (the head 2 mm prouder than the sides it sits on), and a window's stool and apron
      const y0=o.door ? FF : o.sill+0.03, top=o.head+0.07;
      for(const sd of [-1,1]) bxA(0.07, top-y0, 0.018, sd*(w/2+0.035), (top+y0)/2, tt+0.015);
      bxA(w+0.14, 0.07, 0.020, 0, o.head+0.035, tt+0.016);
      if(o.door) return;
      bxA(w+0.14, 0.03, jl+0.046, 0, o.sill+0.015, jd+0.004+(jl+0.046)/2);    // (4 mm behind the jambs' outer ends)
      bxA(w+0.10, 0.08, 0.02, 0, o.sill-0.04, tt+0.016); };
    const faceInfo={F:["x", zf, -f], K:["x", zb, f], L:["z", x0, 1], R:["z", x1, -1]};
    for(const face of ["F","K","L","R"]){ const [ax, cOut, inDir]=faceInfo[face];
      for(const o of OPS[face]){ if(o.garage) continue; glaze(ax, cOut, inDir, o);
        if(!o.door) continue;
        // the leaf, opening in; a threshold across the wall
        const into=inDir, a=o.a, b=o.b, cc=cOut+inDir*T0/2;
        if(ax==="x") makeDoor(into>0 ? XF(a+0.02, cc, 0) : XF(b-0.02, cc, Math.PI), 0, FF+0.01, 0, o.label, true, 0, "closet", new T.Color(o.col).getHex());
        else makeDoor(into>0 ? XF(cc, b-0.02, Math.PI/2) : XF(cc, a+0.02, -Math.PI/2), 0, FF+0.01, 0, o.label, true, 0, "closet", new T.Color(o.col).getHex());
        if(ax==="x") addFlat(a, b, Math.min(cOut, cOut+inDir*T0)-0.01, Math.max(cOut, cOut+inDir*T0)+0.01, FF);
        else addFlat(Math.min(cOut, cOut+inDir*T0)-0.01, Math.max(cOut, cOut+inDir*T0)+0.01, a, b, FF);
        if(ax==="x") B(b-a, 0.02, T0+0.02, (a+b)/2, FF+0.004, cc, "#8a6a44"); else B(T0+0.02, 0.02, b-a, cc, FF+0.004, (a+b)/2, "#8a6a44"); } }
    // the dormers (a cape's): the front wall with its window, the cheeks, from the attic floor up through the roof's hole
    for(const q of h.dormers||[]){ const FF2=h.FF2, dF=q.setb, Zd=d=>zf-f*d, xc=q.xc, hw=q.wd/2;
      const fw=hw+0.005;                                                // (the front 5 mm proud of the cheeks either side)
      const fr=pieces([[xc-fw, FF2-0.05],[xc+fw, FF2-0.05],[xc+fw, q.yde],[xc, q.ydr-0.08],[xc-fw, q.yde]], [q.win]);
      vslab("lk_lap", "x", Zd(dF), fr, 0.12, -f, h.siding, 1/1.28);
      const cheek=[[dF+0.02, FF2-0.06],[h.dK, FF2-0.06],[h.dK, h.slope(h.dK)],[h.slopeAt(q.yde), q.yde],[dF+0.02, q.yde]].map(([d,y])=>[Zd(d), y]);        // (their fronts inside the front's)
      for(const sd of [-1,1]) vslab("lk_lap", "z", xc+sd*hw, [cheek], 0.12, -sd, h.siding, 1/1.28);
      glaze("x", Zd(dF), -f, q.win, 0.12); }
  }

  /* ---- the rooms of a storey -------------------------------------------------------------------------------
     A plan is in the house's own terms: p across it (world x = x + sx*p, so a ranch's garage end and a two-storey's
     carport side can be either), d back from the front wall's face. A room runs to the inner face of an outside wall
     or to the middle of a partition; a partition is a line {ax:"d" (at a depth, across) or "p" (at an offset, back),
     at, from, to, doors:[{c, w, leaf, into, ajar}]}. Every room is lined with its colour on all four sides, cut round
     the openings in them, floored, ceiled, lit and named. */
  const FLOOR={wood:["fh_floor","#ffffff",0.9], oak:["fh_floor","#e0d0b8",0.9], carpet:["lk_carpet",null,0.7], lino:["fh_lino","#ffffff",0.7],
               tile:["fh_check","#ffffff",2.5], conc:["concrete","#c8c4ba",0.5]};
  function plan(h, sx){ const X=p=>h.x+sx*p, Zd=d=>h.zf-h.f*d;
    const rectW=(p0,p1,d0,d1)=>({x0:Math.min(X(p0),X(p1)), x1:Math.max(X(p0),X(p1)), z0:Math.min(Zd(d0),Zd(d1)), z1:Math.max(Zd(d0),Zd(d1))});
    // a direction in the plan (dp, dd) as a world yaw for a piece whose front is its +z
    const yaw=(dp, dd)=>Math.atan2(sx*dp, -h.f*dd);
    // (o.u(dq): a plan offset along the piece's own width, as its local x)
    const at=(p, d, dp, dd, y)=>{ const o=F(X(p), Zd(d), yaw(dp, dd), y), m=h.f*sx; o.u=dq=>dq*(dd!==0 ? -m*dd : m*dp); return o; };
    return {X, Zd, rectW, yaw, at, sx}; }
  const doorOps=(pl, pt, y)=>(pt.doors||[]).map(dr=>{ const w=dr.w||0.92, c=pt.ax==="d" ? pl.X(dr.c) : pl.Zd(dr.c);
    return {a:c-w/2, b:c+w/2, sill:y-0.08, head:y+(dr.leaf ? 2.08 : 2.12), dr:dr}; });              // (the sill under the wall's foot: no lip across the doorway)
  function storey(h, pl, S){
    const y=S.y, cl=S.cl, house="No. "+h.no+" · ";
    // the partitions, each run 5 cm on into what it meets; a frame and a threshold in each doorway; the leaves
    const lines=[];
    for(const pt of S.parts){ const ops=doorOps(pl, pt, y), ax=pt.ax==="d" ? "x" : "z";
      const c=pt.ax==="d" ? pl.Zd(pt.at) : pl.X(pt.at), e0=pt.ax==="d" ? pl.X(pt.from) : pl.Zd(pt.from), e1=pt.ax==="d" ? pl.X(pt.to) : pl.Zd(pt.to);
      const a=Math.min(e0,e1), b=Math.max(e0,e1);
      lines.push({ax:ax, c:c, a:a, b:b, ops:ops});
      const sy=ax==="x" ? 0 : 0.015;                                   // (the two ways stand a centimetre and a half apart under and over)
      if(!pt.noWall) wall("plaster", ax, c, PT, a-0.05, b+0.05, y-0.05-sy, cl+0.03+sy, ops, PLASTER, 0.5, S.upper ? y-1 : y);
      for(const o of ops){ (ax==="x" ? frX : frZ)(c, PT, o.a, o.b, y, o.head, TRM);
        if(ax==="x") B(o.b-o.a, 0.016, PT+0.03, (o.a+o.b)/2, y+0.006, c, "#8a6a44"); else B(PT+0.03, 0.016, o.b-o.a, c, y+0.006, (o.a+o.b)/2, "#8a6a44");
        const dr=o.dr; if(!dr.leaf) continue;
        // into: +1 toward +d (or +p); as a world direction along the wall's normal
        const into=pt.ax==="d" ? -h.f*dr.into : pl.sx*dr.into, label=dr.label||"A DOOR";
        if(ax==="x") makeDoor(into>0 ? XF(o.a+0.02, c, 0) : XF(o.b-0.02, c, Math.PI), 0, y+0.01, 0, label, true, dr.ajar||0, "closet", 0xf0ece2);
        else makeDoor(into>0 ? XF(c, o.b-0.02, Math.PI/2) : XF(c, o.a+0.02, -Math.PI/2), 0, y+0.01, 0, label, true, dr.ajar||0, "closet", 0xf0ece2); } }
    // the outside walls' inner faces, and the openings in each that are this storey's
    const T0=h.T0, mine=L=>L.filter(o=>o.sill<cl && o.head>y-0.1);
    const ext=[{ax:"x", c:h.zf-h.f*T0, ops:mine(h.ops.F)}, {ax:"x", c:h.zb+h.f*T0, ops:mine(h.ops.K)},
               {ax:"z", c:h.x0+T0, ops:mine(h.ops.L)}, {ax:"z", c:h.x1-T0, ops:mine(h.ops.R)}];
    for(const R of S.rooms){ const W=pl.rectW(R.p[0], R.p[1], R.d[0], R.d[1]), fy=R.y===undefined ? y : R.y, rcl=R.cl||cl;
      R.W=W; R.fy=fy;
      if(!S.custom){
        for(const [ax, s, dir] of [["x", W.z0, 1],["x", W.z1, -1],["z", W.x0, 1],["z", W.x1, -1]]){
          const lo=ax==="x" ? W.x0 : W.z0, hi=ax==="x" ? W.x1 : W.z1;
          const e=ext.find(l=>l.ax===ax && Math.abs(l.c-s)<0.02), p=e ? null : lines.find(l=>l.ax===ax && Math.abs(l.c-s)<0.02 && l.a<hi-0.05 && l.b>lo+0.05);
          if(!e && !p){ console.warn("14o: no wall for "+house+R.n+" at "+ax+"="+s.toFixed(2)); continue; }
          const fc=e ? e.c : p.c+dir*PT/2, ops=(e ? e.ops : p.ops).filter(o=>o.b>lo && o.a<hi);
          for(const o of ops) if(!o.dr && (o.a<lo+0.02 || o.b>hi-0.02)) console.warn("14o: "+house+R.n+": an opening runs into a corner");
          liner(ax, fc, dir, lo, hi, fy, rcl+0.01, ops, R.wall||"#ece6da"); }
        if(!R.noFloor){ const [bk, col, uv]=FLOOR[R.fl||"wood"];
          for(const q of cutWell(W, R.well)) floorAt(bk, q.x0, q.x1, q.z0, q.z1, fy+0.006, col||R.carpet||"#c8bca8", uv); }
        for(const q of cutWell(W, R.well)) addFlat(q.x0-0.01, q.x1+0.01, q.z0-0.01, q.z1+0.01, fy);         // (each a centimetre into the next)
        if(!R.noCeil) for(const q of cutWell(W, R.hole)) ceilAt("plaster", q.x0, q.x1, q.z0, q.z1, rcl, PLASTER, 0.5); }
      // the light in the middle of its ceiling, and its name
      if(!R.noLamp){ const cx=(W.x0+W.x1)/2+(R.lampAt ? R.lampAt[0] : 0), cz=(W.z0+W.z1)/2+(R.lampAt ? R.lampAt[1] : 0), ly=R.lampY||rcl;
        push("lk_fixture", new T.SphereGeometry(0.17, 18, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2), cx, ly-0.012, cz, 0, "#ffffff");
        LAMPS.push({x:cx, y:ly-0.30, z:cz, color:0xffe6c0, intensity:R.lamp||0.62, dist:Math.max(6, Math.hypot(W.x1-W.x0, W.z1-W.z0)*1.2), decay:1.4, indoor:true,
                    vol:[W.x0-0.15, W.x1+0.15, W.z0-0.15, W.z1+0.15, fy-0.5, (R.zoneTop||rcl)+0.2]}); }
      if(!R.noZone) addZone(W.x0, W.x1, W.z0, W.z1, fy-0.5, (R.zoneTop||rcl)+0.3, house+R.n, true); }
    return lines; }
  // a rectangle less a well cut out of it (the stair's), as up to four
  function cutWell(W, H){ if(!H || H.x1<=W.x0 || H.x0>=W.x1 || H.z1<=W.z0 || H.z0>=W.z1) return [W];
    const out=[], x0=Math.max(W.x0,H.x0), x1=Math.min(W.x1,H.x1);
    if(H.z0>W.z0) out.push({x0:W.x0, x1:W.x1, z0:W.z0, z1:H.z0}); if(H.z1<W.z1) out.push({x0:W.x0, x1:W.x1, z0:H.z1, z1:W.z1});
    const za=Math.max(W.z0,H.z0), zb=Math.min(W.z1,H.z1);
    if(x0>W.x0) out.push({x0:W.x0, x1:x0, z0:za, z1:zb}); if(x1<W.x1) out.push({x0:x1, x1:W.x1, z0:za, z1:zb});
    return out.filter(q=>q.x1-q.x0>0.01 && q.z1-q.z0>0.01); }

  /* ---- a stair up the side of a hall: oak treads on white risers, solid under, a runner, the newel, the rail;
     open on its p0 side, against a wall on its p1 side; the well over it in the floor above, railed round ---------- */
  function stair(h, pl, st, y0, y1, cl0, railEast){
    const R=(y1-y0)/st.n, dTop=st.d0+(st.n-1)*st.run, xa=Math.min(pl.X(st.p0),pl.X(st.p1)), xb=Math.max(pl.X(st.p0),pl.X(st.p1));
    const xo=pl.X(st.p0), xin=pl.X(st.p0)+pl.sx*0.03;                    // (the open side, and just in from it)
    for(let k=1;k<st.n;k++){ const da=st.d0+(k-1)*st.run, db=da+st.run, top=y0+k*R, za=Math.min(pl.Zd(da),pl.Zd(db)), zb=Math.max(pl.Zd(da),pl.Zd(db));
      B(xb-xa-0.04, top-0.025-y0, zb-za, (xa+xb)/2, y0+(top-0.025-y0)/2, (za+zb)/2, "#f0ece2");
      B(xb-xa, 0.025, zb-za+0.025, (xa+xb)/2, top-0.0125, (za+zb)/2+h.f*0.0125, "#9a6a3c");
      B(0.56, 0.006, zb-za-0.03, (xa+xb)/2, top+0.003, (za+zb)/2+h.f*0.0125, st.runner||"#7a2a22");
      addFlat(xa, xb, za-0.005, zb+0.005, top); }
    // the string up its open side, the newel at the foot, the rail on balusters
    { const a=V3(xo-pl.sx*0.028, y0-0.12, pl.Zd(st.d0-st.run)), b=V3(xo-pl.sx*0.028, y1-0.12, pl.Zd(dTop)), d=new T.Vector3().subVectors(b,a), L=d.length();
      ME.push({geo:boxGeo(0.045, L, 0.30), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color("#e8e2d4")}); }
    const nose=d=>y0+R+(d-st.d0)*R/st.run, railY=d=>nose(d)+0.86, RX=xin, NZ=pl.Zd(st.d0-0.10);
    B(0.11, 1.10, 0.11, RX, y0+0.55, NZ, "#7a5230"); ent(new T.SphereGeometry(0.07, 16, 12), RX, y0+1.16, NZ, "#7a5230"); B(0.13, 0.06, 0.13, RX, y0+1.07, NZ, "#7a5230");
    tubeE(V3(RX, railY(st.d0-0.06), pl.Zd(st.d0-0.06)), V3(RX, railY(dTop), pl.Zd(dTop+0.02)), 0.028, "#7a5230");
    for(let k=1;k<st.n;k++){ const dc=st.d0+(k-0.5)*st.run; tubeE(V3(RX, y0+k*R, pl.Zd(dc)), V3(RX, railY(dc)-0.01, pl.Zd(dc)), 0.014, "#f4f0e6"); }
    // the well: its edges boxed in between the ceiling below and the floor above, and railed round upstairs
    const W=pl.rectW(st.p0, st.p1, st.dw0, dTop), sideZ=(z)=>[W.z0, W.z1].indexOf(z);
    const eb=(x0,x1,z0,z1)=>bx("plaster", x1-x0, y1-0.004-(cl0-0.02), z1-z0, (x0+x1)/2, (y1-0.004+cl0-0.02)/2, (z0+z1)/2, 0.5, 0, PLASTER);
    const front=pl.Zd(st.dw0), fz0=h.f>0 ? front : front-0.06, wx0=W.x0, wx1=W.x1;
    eb(wx0-0.06, wx1+0.06, fz0, fz0+0.06);                                 // (across its front end)
    const eb2=(x0,x1,z0,z1)=>bx("plaster", x1-x0, y1-0.007-(cl0-0.023), z1-z0, (x0+x1)/2, (y1-0.007+cl0-0.023)/2, (z0+z1)/2, 0.5, 0, PLASTER);
    eb2(xo<(wx0+wx1)/2 ? wx0-0.05 : wx1, xo<(wx0+wx1)/2 ? wx0 : wx1+0.05, W.z0, W.z1);   // (and down its open side, a little inside that one's ends)
    if(railEast) eb2(xo<(wx0+wx1)/2 ? wx1 : wx0-0.05, xo<(wx0+wx1)/2 ? wx1+0.05 : wx0, W.z0, W.z1);
    const uy=y1+0.92, zf2=pl.Zd(st.dw0-0.05), zb2=pl.Zd(dTop+0.05), XE=pl.X(st.p1)-pl.sx*0.03;
    for(const z of [zf2, zb2]){ B(0.09, 1.00, 0.09, RX, y1+0.50, z, "#7a5230"); ent(new T.SphereGeometry(0.055, 14, 10), RX, y1+1.04, z, "#7a5230"); }
    tubeE(V3(RX, uy, zf2), V3(RX, uy, zb2), 0.028, "#7a5230"); tubeE(V3(RX, uy, zf2), V3(XE, uy, zf2), 0.028, "#7a5230");
    for(let t=0.13; t<Math.abs(zb2-zf2)-0.06; t+=0.13){ const z=zf2+Math.sign(zb2-zf2)*t; tubeE(V3(RX, y1+0.05, z), V3(RX, uy-0.01, z), 0.012, "#f4f0e6"); }
    for(let t=0.13; t<Math.abs(XE-RX)-0.06; t+=0.13){ const x=RX+Math.sign(XE-RX)*t; tubeE(V3(x, y1+0.05, zf2), V3(x, uy-0.01, zf2), 0.012, "#f4f0e6"); }
    B(0.06, 0.05, Math.abs(zb2-zf2), RX, y1+0.03, (zf2+zb2)/2, "#7a5230"); B(Math.abs(XE-RX), 0.05, 0.06, (RX+XE)/2, y1+0.03, zf2, "#7a5230");
    if(railEast){ for(const z of [zf2, zb2]){ B(0.09, 1.00, 0.09, XE, y1+0.50, z, "#7a5230"); ent(new T.SphereGeometry(0.055, 14, 10), XE, y1+1.04, z, "#7a5230"); }
      tubeE(V3(XE, uy, zf2), V3(XE, uy, zb2), 0.028, "#7a5230"); B(0.06, 0.05, Math.abs(zb2-zf2), XE, y1+0.03, (zf2+zb2)/2, "#7a5230");
      for(let t=0.13; t<Math.abs(zb2-zf2)-0.06; t+=0.13){ const z=zf2+Math.sign(zb2-zf2)*t; tubeE(V3(XE, y1+0.05, z), V3(XE, uy-0.01, z), 0.012, "#f4f0e6"); }
      addCol(XE-0.04, XE+0.04, Math.min(zf2,zb2), Math.max(zf2,zb2), y1-0.2, y1+1.0); }
    // the open side is the rail, from the foot all the way up and round the well; across the well's front upstairs
    addCol(RX-0.04, RX+0.04, Math.min(NZ+h.f*0.06, zb2), Math.max(NZ+h.f*0.06, zb2), y0-0.5, y1+1.0);
    addCol(Math.min(RX, XE), Math.max(RX, XE), Math.min(zf2, zf2-h.f*0.04)-0.02, Math.max(zf2, zf2-h.f*0.04)+0.02, y1+0.02, y1+1.0);
    return {well:{x0:W.x0, x1:W.x1, z0:W.z0, z1:W.z1}, dTop:dTop, foot:[pl.X((st.p0+st.p1)/2), pl.Zd(st.d0-0.6)], top:[pl.X((st.p0+st.p1)/2), pl.Zd(dTop+0.4)]}; }

  /* ---- a storey and a half: the rooms under the roof ----------------------------------------------------------
     Knee walls where the slope comes down to 1.15 m, the slopes plastered up from them to the flat over the collar
     ties at 2.4, the gables at the ends with their windows. The walls between the rooms follow the same outline.
     Across: "d" (a cape's ridge along x: its slopes fall front and back, d is the depth) or "p" (a bungalow's ridge
     back from the road: its slopes fall to the sides, and the across-coordinate is p). */
  function attic(h, pl, S, across, lines0){
    const FF2=S.y, yC=S.cl, T0=h.T0, f=h.f, house="No. "+h.no+" · ";
    const sl=h.slope, kA=h.kA, kB=h.kB, cA=h.slopeAt(yC), cB=h.span-cA;      // knees and collar in the across-coordinate
    // the outline across, and a point of it in the world's plane for a given along-coordinate
    const prof=(lo, hi, y0, up)=>[[lo, y0],[hi, y0],[hi, sl(hi)+up],[cB, yC+up],[cA, yC+up],[lo, sl(lo)+up]];
    const xAcross=across==="d" ? (a=>pl.Zd(a)) : (a=>pl.X(a));
    const wallPlane=across==="d" ? "z" : "x";              // a wall across the house lies in this plane...
    const toS=P=>P.map(([a,y])=>[xAcross(a), y]);           // ...and its outline runs in the world along that plane
    // the knee walls: boxes the length of the house, their tops cut to the slope, broken at a cape's dormers
    const gaps=(h.dormers||[]).map(q=>[q.xc-0.84, q.xc+0.84]).sort((p,q)=>p[0]-q[0]);
    const runs=(a,b,G)=>{ const out=[]; let x=a; for(const [g0,g1] of G){ if(g0>x) out.push([x,g0]); x=g1; } if(b>x) out.push([x,b]); return out; };
    const alongLo=across==="d" ? h.x0+T0 : Math.min(pl.Zd(T0), pl.Zd(h.D-T0)), alongHi=across==="d" ? h.x1-T0 : Math.max(pl.Zd(T0), pl.Zd(h.D-T0));
    for(const [k, out, G] of [[kA, -1, gaps],[kB, 1, []]]){ const P=[[k, FF2-0.05],[k-out*-PT, FF2-0.05],[k-out*-PT, sl(k+out*PT)+0.035],[k, sl(k)+0.035]];
      for(const [a, b] of runs(alongLo-0.05, alongHi+0.05, G)){
        if(across==="d"){ vslab("plaster", "z", a, [toS(P)], b-a, 1, PLASTER, 0.5);
          const za=xAcross(k), zb=xAcross(k+out*PT); addCol(a, b, Math.min(za,zb), Math.max(za,zb), FF2-0.5, sl(k)); }
        else { vslab("plaster", "x", a, [toS(P)], b-a, 1, PLASTER, 0.5);
          const xa=xAcross(k), xb=xAcross(k+out*PT); addCol(Math.min(xa,xb), Math.max(xa,xb), a, b, FF2-0.5, sl(k)); } } }
    // the walls between the rooms, to the same outline, with their doorways
    const lines=[];
    for(const pt of S.parts){ const ops=doorOps(pl, pt, FF2), c=pt.ax==="d" ? pl.Zd(pt.at) : pl.X(pt.at), ax=pt.ax==="d" ? "x" : "z";
      lines.push({ax:ax, c:c, ops:ops});
      const P=toS(prof(kA-0.05, kB+0.05, FF2-0.05, 0.03));
      vslab("plaster", ax, c-PT/2, pieces(P.map(([a2,y2])=>[a2, y2<FF2 ? FF2-0.065 : y2]), ops), PT, 1, PLASTER, 0.5);
      const lo=Math.min(xAcross(kA), xAcross(kB)), hi=Math.max(xAcross(kA), xAcross(kB)); let q=lo;
      for(const o of ops.slice().sort((p,q2)=>p.a-q2.a).concat([{a:hi, b:hi}])){ if(o.a>q+0.01){ if(ax==="x") addCol(q, o.a, c-PT/2, c+PT/2, FF2-0.05, FF2+2.3); else addCol(c-PT/2, c+PT/2, q, o.a, FF2-0.05, FF2+2.3); } q=o.b; }
      for(const o of ops){ (ax==="x" ? frX : frZ)(c, PT, o.a, o.b, FF2, o.head, TRM);
        if(ax==="x") B(o.b-o.a, 0.016, PT+0.03, (o.a+o.b)/2, FF2+0.006, c, "#8a6a44"); else B(PT+0.03, 0.016, o.b-o.a, c, FF2+0.006, (o.a+o.b)/2, "#8a6a44");
        const dr=o.dr; if(!dr.leaf) continue; const into=pt.ax==="d" ? -f*dr.into : pl.sx*dr.into;
        if(ax==="x") makeDoor(into>0 ? XF(o.a+0.02, c, 0) : XF(o.b-0.02, c, Math.PI), 0, FF2+0.01, 0, dr.label||"A DOOR", true, dr.ajar||0, "closet", 0xf0ece2);
        else makeDoor(into>0 ? XF(c, o.b-0.02, Math.PI/2) : XF(c, o.a+0.02, -Math.PI/2), 0, FF2+0.01, 0, dr.label||"A DOOR", true, dr.ajar||0, "closet", 0xf0ece2); } }
    // each room: floor, the knee walls' faces, the ends or the walls between, the slopes and the flat
    const ends=across==="d" ? [{c:h.x0+T0, dir:1, ops:h.ops.L},{c:h.x1-T0, dir:-1, ops:h.ops.R}]
                            : [{c:pl.Zd(T0), dir:-f, ops:h.ops.F},{c:pl.Zd(h.D-T0), dir:f, ops:h.ops.K}];
    const mineUp=L=>L.filter(o=>o.sill>FF2-0.1).map(o=>({a:o.a, b:o.b, sill:o.sill, head:o.head}));
    for(const R of S.rooms){
      const W=across==="d" ? pl.rectW(R.p[0], R.p[1], kA, kB) : pl.rectW(kA, kB, R.d[0], R.d[1]);
      R.W=W; R.fy=FF2; R.lampY=yC; R.zoneTop=yC;
      const aLo=across==="d" ? W.x0 : W.z0, aHi=across==="d" ? W.x1 : W.z1;      // along the house
      const [bk, col, uv]=FLOOR[R.fl||"carpet"];
      for(const q of cutWell(W, R.well)){ floorAt(bk, q.x0, q.x1, q.z0, q.z1, FF2+0.006, col||R.carpet||"#c8bca8", uv); addFlat(q.x0-0.01, q.x1+0.01, q.z0-0.01, q.z1+0.01, FF2); }
      // the knee walls' faces (round a cape's alcoves)
      const al=(h.dormers||[]).filter(q=>q.xc>aLo && q.xc<aHi).map(q=>({a:q.xc-0.78, b:q.xc+0.78, sill:FF2-1, head:FF2+6}));
      for(const [k, dir, ops] of [[kA, 1, al],[kB, -1, []]]){
        if(across==="d") liner("x", pl.Zd(k), -f*dir, aLo, aHi, FF2, sl(k)+0.006, ops, R.wall);
        else liner("z", pl.X(k), pl.sx*dir, aLo, aHi, FF2, sl(k)+0.006, ops, R.wall); }
      // the ends (a gable) and the walls between rooms
      for(const [s, dir] of [[aLo, 1],[aHi, -1]]){
        const e=ends.find(q=>Math.abs(q.c-s)<0.02), p=e ? null : lines.find(q=>Math.abs(q.c-s)<0.02);
        if(!e && !p){ console.warn("14o: no wall for "+house+R.n); continue; }
        const P=toS(prof(kA+0.006, kB-0.006, FF2, 0));
        const holes=e ? mineUp(e.ops) : p.ops.map(o=>({a:o.a, b:o.b, sill:o.sill, head:o.head}));
        vliner("plaster", wallPlane, e ? e.c : p.c+dir*PT/2, pieces(P, holes), dir, R.wall, 0.5); }
      // the slopes and the flat; over a cape's alcove the slope starts where the alcove's ceiling meets it
      const PW=(al2, a)=>across==="d" ? V3(al2, sl(a), pl.Zd(a)) : V3(pl.X(a), sl(a), al2);
      const nA=across==="d" ? V3(0, -1, -f*h.pitch) : V3(pl.sx*h.pitch, -1, 0), nB=across==="d" ? V3(0, -1, f*h.pitch) : V3(-pl.sx*h.pitch, -1, 0);
      const slab2=(a0, a1, b0, b1, n)=>face("plaster", [PW(a0, b0), PW(a1, b0), PW(a1, b1), PW(a0, b1)], n, PLASTER, 0.5);
      let q0=aLo; for(const o of al.concat([{a:aHi, b:aHi}])){ if(o.a>q0+0.005) slab2(q0, o.a, kA+0.006, cA, nA); q0=o.b; }
      slab2(aLo, aHi, cB, kB-0.006, nB);
      if(across==="d") face("plaster", [V3(aLo, yC, pl.Zd(cA)), V3(aHi, yC, pl.Zd(cA)), V3(aHi, yC, pl.Zd(cB)), V3(aLo, yC, pl.Zd(cB))], V3(0,-1,0), PLASTER, 0.5);
      else face("plaster", [V3(pl.X(cA), yC, aLo), V3(pl.X(cB), yC, aLo), V3(pl.X(cB), yC, aHi), V3(pl.X(cA), yC, aHi)], V3(0,-1,0), PLASTER, 0.5);
      // a cape's alcove under its dormer: floor, its front with the window, the cheeks, the little ceiling, the slope above it
      for(const q of (h.dormers||[]).filter(q=>q.xc>aLo && q.xc<aHi)){ const dIn=q.setb+0.12, yA=q.yde-0.06, dJ=h.slopeAt(yA), Zd=pl.Zd;
        floorAt(FLOOR[R.fl||"carpet"][0], q.xc-0.78, q.xc+0.78, Math.min(Zd(dIn),Zd(kA)), Math.max(Zd(dIn),Zd(kA)), FF2+0.006, R.carpet||"#c8bca8", 0.7);
        addFlat(q.xc-0.78, q.xc+0.78, Math.min(Zd(dIn),Zd(kA))-0.01, Math.max(Zd(dIn),Zd(kA))+0.01, FF2);
        vliner("plaster", "x", Zd(dIn), pieces([[q.xc-0.78, FF2],[q.xc+0.78, FF2],[q.xc+0.78, yA],[q.xc-0.78, yA]], [q.win]), -f, R.wall, 0.5);
        const ch=toS([[dIn, FF2],[kA, FF2],[kA, sl(kA)],[dJ, yA],[dIn, yA]]);
        vliner("plaster", "z", q.xc-0.78, [ch], 1, R.wall, 0.5); vliner("plaster", "z", q.xc+0.78, [ch], -1, R.wall, 0.5);
        face("plaster", [V3(q.xc-0.78, yA, Zd(dIn)), V3(q.xc+0.78, yA, Zd(dIn)), V3(q.xc+0.78, yA, Zd(dJ)), V3(q.xc-0.78, yA, Zd(dJ))], V3(0,-1,0), PLASTER, 0.5);
        slab2(q.xc-0.78, q.xc+0.78, dJ, cA, nA); }
      // its light, and its name
      const cx=(W.x0+W.x1)/2, cz=(W.z0+W.z1)/2;
      push("lk_fixture", new T.SphereGeometry(0.17, 18, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2), cx, yC-0.012, cz, 0, "#ffffff");
      LAMPS.push({x:cx, y:yC-0.30, z:cz, color:0xffe6c0, intensity:0.62, dist:8, decay:1.4, indoor:true, vol:[W.x0-0.15, W.x1+0.15, W.z0-0.15, W.z1+0.15, FF2-0.5, yC+0.3]});
      addZone(W.x0, W.x1, W.z0, W.z1, FF2-0.5, yC+0.3, house+R.n, true); }
    return lines; }

  /* ---- a few more pieces the houses want ------------------------------------------------------------------- */
  // the fireplace on a cape's end wall, under the chimney: a brick surround on a hearth, the firebox, the mantel
  const fireplace=(o)=>{ o.k("brick", 1.60, 1.30, 0.42, 0, 0.65, 0.21, "#8a4a36"); o.k("brick", 1.80, 0.06, 0.92, 0, 0.03, 0.46, "#7a4434");
    o.b(0.80, 0.70, 0.02, 0, 0.43, 0.425, "#141210"); o.w(1.90, 0.07, 0.30, 0, 1.335, 0.24, "#6a4a2e", 0.01);
    for(let k=0;k<3;k++) o.g(new T.CylinderGeometry(0.05, 0.05, 0.50, 8), -0.12+k*0.12, 0.13+(k%2)*0.08, 0.26, "#5a3a22", 0, 0, Math.PI/2);
    o.b(0.24, 0.30, 0.03, -0.55, 1.52, 0.10, "#c9a34a"); o.g(new T.CylinderGeometry(0.06, 0.08, 0.26, 12), 0.6, 1.50, 0.22, "#2e5a3a");
    o.col(1.8, 0.92, 0, 0.46, 1.3); };
  const desk=(o, w, col)=>{ o.w(w, 0.04, 0.58, 0, 0.74, 0, col, 0.01); o.w(0.42, 0.70, 0.54, w/2-0.23, 0.36, 0, col, 0.015);
    for(const sz of [-1,1]) LEG(o, -w/2+0.05, sz*0.24, 0.72, 0.02, col); o.b(0.36, 0.14, 0.012, w/2-0.23, 0.58, 0.276, "#5a4030");
    o.col(w, 0.58, 0, 0, 0.8); };
  const deskChair=(o, col)=>{ o.w(0.44, 0.05, 0.42, 0, 0.46, 0, col, 0.015); o.w(0.42, 0.44, 0.04, 0, 0.72, -0.20, col, 0.015);
    for(const sx of [-1,1]) for(const sz of [-1,1]) LEG(o, sx*0.18, sz*0.17, 0.44, 0.016, col); o.col(0.46, 0.46, 0, 0, 0.5); o.seat(0, 0.02, "A CHAIR"); };
  const boxes=(o, n, seed)=>{ const q=_trng(seed||7); for(let i=0;i<n;i++){ const w=0.38+q()*0.22, hh=0.28+q()*0.18, d=0.32+q()*0.16;
      o.b(w, hh, d, (i-(n-1)/2)*0.62+(q()-0.5)*0.08, hh/2+(i%3===2 ? 0.0 : 0), (q()-0.5)*0.1, ["#b8996a","#c8a878","#a8865a"][i%3]);
      if(i%3===1) o.b(w*0.9, hh*0.8, d*0.9, (i-(n-1)/2)*0.62, hh+hh*0.4+0.001, 0, "#c0a070"); }
    o.col(n*0.62, 0.5, 0, 0, 0.7); };
  const plant=(o, s)=>{ o.g(new T.CylinderGeometry(0.14*s, 0.10*s, 0.26*s, 14), 0, 0.13*s, 0, "#8a4a2a");
    for(let k=0;k<7;k++){ const a=k*0.9; o.g(new T.SphereGeometry(0.15*s, 10, 8).scale(1.4, 0.6, 0.8), Math.cos(a)*0.10*s, (0.40+(k%3)*0.10)*s, Math.sin(a)*0.10*s, k%2 ? "#3e6a2e" : "#4e7a34", 0.4); } };
  const piano=(o, col)=>{ o.w(1.48, 1.18, 0.58, 0, 0.59, 0, col, 0.02); o.w(1.40, 0.05, 0.32, 0, 0.74, 0.40, col, 0.01);
    o.b(1.22, 0.025, 0.16, 0, 0.775, 0.42, "#f4f2ea"); for(let k=0;k<25;k++) o.b(0.012, 0.012, 0.09, -0.57+k*0.0475, 0.792, 0.385, "#141414");
    o.b(0.06, 0.70, 0.40, -0.70, 0.354, 0.40, col); o.b(0.06, 0.70, 0.40, 0.70, 0.354, 0.40, col); o.col(1.5, 0.95, 0, 0.2, 1.2); };
  const coveredCar=(o)=>{ o.f(1.86, 0.80, 4.40, 0, 0.62, 0, "#7a7e78", 0.36); o.f(1.50, 0.50, 2.20, 0, 1.18, -0.25, "#7a7e78", 0.24);
    for(const sx of [-1,1]) for(const sz of [-1.35, 1.35]) o.g(new T.CylinderGeometry(0.31, 0.31, 0.22, 16), sx*0.80, 0.31, sz, "#1a1a1a", 0, Math.PI/2);
    o.col(1.9, 4.4, 0, 0, 1.4); };
  const PALS=[{sofa:"#6a7a5a", q:"#7a2a2a", wood:"#8a6a44", liv:"#e8dcc4", kit:"#f2ecd0", bed:"#dfe6d8", bed2:"#e6dcea", carpet:"#b8ad98"},
              {sofa:"#7a4a3a", q:"#2a4a7a", wood:"#6a4a2e", liv:"#e4e0d2", kit:"#eef0dc", bed:"#d8e2ec", bed2:"#f0e0d0", carpet:"#a8a8a0"},
              {sofa:"#3a4a6a", q:"#c8a86a", wood:"#a8845a", liv:"#ece2cc", kit:"#f4ead4", bed:"#e8dcc8", bed2:"#dce8dc", carpet:"#c0b49c"},
              {sofa:"#8a7a5a", q:"#4a6a3a", wood:"#5a3a22", liv:"#e0d8c8", kit:"#ecf0e4", bed:"#e4d8e4", bed2:"#d8e4ec", carpet:"#9c9488"},
              {sofa:"#5a3a4a", q:"#8a5a7a", wood:"#8a6a44", liv:"#efe4d0", kit:"#f2ead8", bed:"#dde4e8", bed2:"#f0d8d8", carpet:"#b4a890"}];
  const palOf=h=>PALS[(h.no*7)%PALS.length];
  const HALL="#ece6da";
  // the routes the walk test takes (tools/walk.js): plan points, through a house's own transform, from the lawn
  const route=(h, pl, name, P)=>{ LAKE_HOUSES.routes["No. "+h.no+", "+name]=P.map(([p,d])=>[+pl.X(p).toFixed(2), +pl.Zd(d).toFixed(2)]); };

  /* ---- THE CAPE COD ---- */
  function cape(h){
    const pl=plan(h, 1), FF=h.FF, CL1=FF+2.38, FF2=FF+2.52, rT=0.14*Math.sqrt(1+h.pitch*h.pitch)+0.02, P=palOf(h);
    h.FF2=FF2; h.slope=d=>h.EAV+h.pitch*Math.min(d, h.D-d)-rT; h.slopeAt=y=>(y-h.EAV+rT)/h.pitch; h.span=h.D;
    h.dK=h.slopeAt(FF2+1.14); h.kA=h.dK; h.kB=h.D-h.dK;
    shell(h);
    const st={p0:0.0, p1:0.902, d0:1.9, n:14, run:0.25, dw0:2.3}, well=pl.rectW(st.p0, st.p1, st.dw0, st.d0+(st.n-1)*st.run);
    storey(h, pl, {y:FF, cl:CL1, rooms:[
        {n:"THE LIVING ROOM", p:[-5.2,-1.0], d:[0.2,8.2], fl:"wood", wall:P.liv},
        {n:"THE KITCHEN", p:[1.0,5.2], d:[0.2,8.2], fl:"lino", wall:P.kit},
        {n:"THE FRONT HALL", p:[-1.0,1.0], d:[0.2,6.4], fl:"wood", wall:HALL, hole:well},
        {n:"THE BATHROOM", p:[-1.0,1.0], d:[6.4,8.2], fl:"tile", wall:"#cfe0e6", lamp:0.5}],
      parts:[{ax:"p", at:-1.0, from:0.2, to:8.2, doors:[{c:1.1, w:1.2}]},
             {ax:"p", at:1.0, from:0.2, to:8.2, doors:[{c:1.1, w:1.2},{c:5.7, w:1.0}]},
             {ax:"d", at:6.4, from:-1.0, to:1.0, doors:[{c:-0.4, leaf:true, into:1, ajar:0.35, label:"THE BATHROOM"}]}]});
    stair(h, pl, st, FF, FF2, CL1, false);
    attic(h, pl, {y:FF2, cl:FF2+2.40, rooms:[
        {n:"THE WEST BEDROOM", p:[-5.2,-1.0], fl:"carpet", carpet:P.carpet, wall:P.bed},
        {n:"THE UPSTAIRS HALL", p:[-1.0,1.0], fl:"wood", wall:HALL, well:well},
        {n:"THE EAST BEDROOM", p:[1.0,5.2], fl:"carpet", carpet:P.carpet, wall:P.bed2}],
      parts:[{ax:"p", at:-1.0, doors:[{c:5.81, leaf:true, into:-1, ajar:0.55, label:"THE WEST BEDROOM"}]},
             {ax:"p", at:1.0, doors:[{c:5.81, leaf:true, into:1, ajar:0.55, label:"THE EAST BEDROOM"}]}]}, "d");
    // the living room: the fire and the chairs round it at the back, the set and the loveseat at the front
    const A=(p,d,dp,dd,y)=>pl.at(p, d, dp, dd, y===undefined ? FF : y);
    fireplace(A(-5.2+0.006, 6.0, 1, 0));
    rug(A(-3.1, 6.0, 1, 0), 2.0, 2.4, "#8a4a3a", "#5a2a22");
    sofa(A(-1.56, 6.0, -1, 0), 2.0, P.sofa); table(A(-2.75, 6.0, -1, 0), 1.10, 0.55, 0.44, P.wood);
    chair(A(-3.4, 4.45, 0, 1), P.sofa); chair(A(-3.4, 7.55, 0, -1), P.sofa);
    endTable(A(-1.55, 4.65, -1, 0), P.wood, "#f4e6c8");
    tvStand(A(-4.96, 2.55, 1, 0), P.wood); sofa(A(-2.35, 2.55, -1, 0), 1.6, P.sofa);
    shelves(A(-5.2+0.17, 0.95, 1, 0), 0.9, 1.9, P.wood); plant(A(-4.6, 0.55, 0, 1), 1.1);
    // the kitchen: the table by the front windows, the counters along the back under its window, the fridge
    diningSet(A(3.3, 2.1, 0, 1), 1.5, 0.9, P.wood, 6);
    { const o=A(2.75, 8.2-0.31, 0, -1); counterRun(o, 3.1, {sink:o.u(-0.15), range:o.u(1.15), uppers:false, cab:"#e8e2d0"});
      o.w(0.9, 0.72, 0.34, o.u(1.15), 1.86, -0.13, "#e8e2d0", 0.01); }
    fridge(A(4.75, 8.2-0.37, 0, -1)); dresser(A(5.2-0.25, 6.2, -1, 0), 1.2, P.wood);
    rug(A(2.75, 6.6, 0, 1), 1.6, 0.8, "#4a6a8a", "#2a3a5a");
    // the hall: a runner up the passage; the half bath at its end: the toilet under the window, the basin beside it
    rug(A(-0.45, 3.6, 0, 1), 0.6, 3.0, "#7a2a22", "#4a1a14");
    toilet(A(0.45, 8.2-0.36, 0, -1)); vanity(A(1.0-0.098-0.27, 7.05, -1, 0), 0.6, "#ece6d8");
    // upstairs: the beds under the back slope, a dresser between the gable windows, a desk in each dormer's alcove
    const U=(p,d,dp,dd)=>pl.at(p, d, dp, dd, FF2);
    bed(U(-3.2, h.kB-1.062, 0, -1), 1.4, 2.0, P.q, P.wood); nightstand(U(-4.25, h.kB-0.23, 0, -1), P.wood, "#f4e6c8"); nightstand(U(-2.15, h.kB-0.23, 0, -1), P.wood, null);
    dresser(U(-5.2+0.25, 4.2, 1, 0), 1.08, P.wood); desk(U(-2.9, h.dormers.length ? 1.12 : 1.4, 0, -1), 1.2, P.wood); deskChair(U(-2.9, 1.75, 0, -1), P.wood);
    rug(U(-3.2, 4.2, 0, 1), 1.8, 1.3, "#c8b8a0", "#8a7a64");
    bed(U(4.35, h.kB-1.062, 0, -1), 1.0, 2.0, "#4a7aa8", P.wood); nightstand(U(3.55, h.kB-0.23, 0, -1), P.wood, "#d8e8f4");
    dresser(U(5.2-0.25, 4.2, -1, 0), 1.0, P.wood); desk(U(2.9, 1.12, 0, -1), 1.2, P.wood); deskChair(U(2.9, 1.75, 0, -1), P.wood);
    boxes(U(1.9, h.kB-0.32, 0, -1), 2, h.no); rug(U(3.4, 4.2, 0, 1), 1.4, 1.0, "#e8a040", "#a86a20");
    // the walks: in at the door to every room, and up the stair to both bedrooms
    const IN=[[0,-12],[0,-3.4],[0,-2.4],[0,-1.0],[0,-0.1],[0,0.25],[0,0.8]];
    route(h, pl, "in at the door", IN);
    route(h, pl, "the living room", IN.concat([[-0.45,1.1],[-1.0,1.1],[-1.6,1.1],[-3.7,1.1],[-3.7,3.5]]));
    route(h, pl, "the kitchen", IN.concat([[0.45,1.1],[1.0,1.1],[1.6,1.1],[1.6,4.0],[2.8,5.0],[2.8,6.6]]));
    route(h, pl, "the bathroom", IN.concat([[-0.45,1.2],[-0.45,5.6],[-0.4,6.0],[-0.4,6.4],[-0.4,7.2]]));
    const UP=IN.concat([[0.45,1.3],[0.45,1.6],[0.45,2.2],[0.45,4.0],[0.45,5.3],[0.45,5.65]]);
    route(h, pl, "upstairs, the west bedroom", UP.concat([[-0.6,5.81],[-1.0,5.81],[-1.6,5.81],[-1.8,4.8],[-2.9,3.0],[-2.9,2.45]]));
    route(h, pl, "upstairs, the east bedroom", UP.concat([[0.6,5.81],[1.0,5.81],[1.6,5.81],[1.8,4.8],[2.9,3.0],[2.9,2.45]]));
    LAKE_HOUSES.stairs.push({name:"No. "+h.no+" stair", up:[[0.45,1.6],[0.45,2.2],[0.45,4.0],[0.45,5.4]].map(([p,d])=>[pl.X(p), pl.Zd(d)]), lo:FF, hi:FF2}); }

  /* ---- THE RANCH ---- */
  function ranch(h){
    const pl=plan(h, h.gSide), FF=h.FF, CL=FF+2.40, P=palOf(h), GY=Y+0.03;
    shell(h);
    storey(h, pl, {y:FF, cl:CL, rooms:[
        {n:"THE LIVING ROOM", p:[-5.4,0.0], d:[0.2,4.4], fl:"wood", wall:P.liv},
        {n:"THE FRONT BEDROOM", p:[-7.8,-5.4], d:[0.2,4.4], fl:"carpet", carpet:P.carpet, wall:P.bed2},
        {n:"THE HALL", p:[-7.8,-1.2], d:[4.4,5.6], fl:"wood", wall:HALL, lamp:0.5},
        {n:"THE MAIN BEDROOM", p:[-7.8,-3.6], d:[5.6,8.8], fl:"carpet", carpet:P.carpet, wall:P.bed},
        {n:"THE BATHROOM", p:[-3.6,-1.2], d:[5.6,8.8], fl:"tile", wall:"#d6e6ea", lamp:0.5},
        {n:"THE KITCHEN", p:[0.0,2.2], d:[0.2,4.4], fl:"lino", wall:P.kit},
        {n:"THE DINING ROOM", p:[-1.2,2.2], d:[4.4,8.8], fl:"wood", wall:P.liv},
        {n:"THE GARAGE", p:[2.2,7.8], d:[0.2,8.8], fl:"conc", wall:"#d8d6d0", y:GY, lamp:0.7}],
      parts:[{ax:"p", at:-5.4, from:0.2, to:4.4},
             {ax:"d", at:4.4, from:-7.8, to:2.2, doors:[{c:-7.0, leaf:true, into:-1, ajar:0.5, label:"THE FRONT BEDROOM"},{c:-2.2, w:1.2},{c:1.1, w:1.6}]},
             {ax:"p", at:0.0, from:0.2, to:4.4, doors:[{c:2.4, w:1.4}]},
             {ax:"d", at:5.6, from:-7.8, to:-1.2, doors:[{c:-4.4, leaf:true, into:1, ajar:0.5, label:"THE MAIN BEDROOM"},{c:-2.5, leaf:true, into:1, ajar:0.4, label:"THE BATHROOM"}]},
             {ax:"p", at:-3.6, from:5.6, to:8.8},
             {ax:"p", at:-1.2, from:4.4, to:8.8, doors:[{c:5.0, w:0.95}]},
             {ax:"p", at:2.2, from:0.2, to:8.8, doors:[{c:6.6, leaf:true, into:-1, ajar:0, label:"THE GARAGE"}]}]});
    const A=(p,d,dp,dd,y)=>pl.at(p, d, dp, dd, y===undefined ? FF : y), m=h.f*pl.sx;
    // the living room: the set on the bedroom wall, the sofa facing it, the armchair at the back
    tvStand(A(-5.4+0.098+0.24, 2.3, 1, 0), P.wood); sofa(A(-2.75, 2.3, -1, 0), 2.0, P.sofa); table(A(-3.9, 2.3, -1, 0), 1.0, 0.5, 0.44, P.wood);
    rug(A(-3.9, 2.3, 1, 0), 2.2, 1.8, "#6a5a4a", "#3a2a1e"); endTable(A(-2.9, 3.75, -1, 0), P.wood, "#f4e6c8"); chair(A(-4.1, 3.85, 0, -1), P.sofa);
    plant(A(-4.9, 0.6, 0, 1), 1.0);
    // the kitchen: counters under the front window and down the garage wall, the range, the fridge
    { const o=A(1.1, 0.2+0.31, 0, 1); counterRun(o, 2.0, {sink:o.u(0.3), uppers:false}); o.w(0.8, 0.72, 0.34, o.u(-0.6), 1.86, -0.13, "#e8e2d0", 0.01); }
    { const o=A(2.2-0.098-0.31, 2.15, -1, 0); counterRun(o, 2.5, {range:0}); }
    fridge(A(2.2-0.098-0.37, 3.9, -1, 0));
    // the dining room: the table, the hutch on the back wall
    diningSet(A(0.0, 6.9, 1, 0), 1.4, 0.9, P.wood, 6); shelves(A(-0.4, 8.8-0.17, 0, -1), 1.2, 1.8, P.wood, false);
    // the bedrooms; the bathroom
    bed(A(-7.8+1.062, 1.0, 1, 0), 1.0, 2.0, P.q, P.wood); nightstand(A(-7.55, 1.85, 1, 0), P.wood, "#f4e6c8"); dresser(A(-5.4-0.098-0.25, 2.9, -1, 0), 1.0, P.wood);
    bed(A(-5.5, 8.8-1.062, 0, -1), 1.5, 2.0, P.q, P.wood); nightstand(A(-6.55, 8.8-0.23, 0, -1), P.wood, "#f4e6c8"); nightstand(A(-4.45, 8.8-0.23, 0, -1), P.wood, "#f4e6c8");
    dresser(A(-3.6-0.098-0.25, 7.35, -1, 0), 1.1, P.wood); rug(A(-5.5, 6.3, 0, 1), 1.6, 1.0, "#c8b8a0", "#8a7a64");
    tub(A(-2.4, 8.8-0.39, 0, -1), 1.6); toilet(A(-3.6+0.098+0.35, 7.0, 1, 0)); vanity(A(-1.2-0.098-0.27, 6.9, -1, 0), 0.9, "#ece6d8");
    // the garage: down two steps from the house; the opener and its rail, the tracks; the bench, the shelves, the car under its cover
    { const o=A(2.2+0.098+0.40, 6.6, 1, 0, GY), H1=FF-0.03-GY, H2=FF-0.19-GY;
      o.k("concrete", 1.2, H1, 0.8, 0, H1/2, 0, "#b8b4aa"); o.k("concrete", 1.2, H2, 0.30, 0, H2/2, 0.55, "#b8b4aa");
      const fl=(lx0, lx1, lz0, lz1, y)=>{ const [ax,az]=o.at(lx0, lz0), [bx2,bz]=o.at(lx1, lz1); addFlat(Math.min(ax,bx2), Math.max(ax,bx2), Math.min(az,bz), Math.max(az,bz), y); };
      fl(-0.6, 0.6, -0.51, 0.4, FF-0.03); fl(-0.6, 0.6, 0.4, 0.7, FF-0.19); }                       // (the landing's floor from the doorway's middle)
    { const G=(p,d,dp,dd)=>A(p, d, dp, dd, GY), top=CL-GY;
      // the opener on the ceiling, its rail to the door's head; the door's tracks up its sides and back along the ceiling
      const op=G(5.0, 3.4, 0, -1); op.p(0.40, 0.18, 0.30, 0, top-0.40, 0, "#e8e8e4", 0.03); op.b(0.05, 0.05, 3.0, 0, top-0.30, 1.6, "#7a7e82");
      for(const sd of [-2.48, 2.48]){ G(5.0+sd, 0.27, 0, -1).b(0.06, 2.24, 0.06, 0, 1.12, 0, "#9aa0a4"); G(5.0+sd, 1.56, 0, -1).b(0.06, 0.06, 2.6, 0, 2.33, 0, "#9aa0a4"); }
      // the bench on the back wall, the pegboard and its tools
      const wb=G(6.6, 8.8-0.33, 0, -1); wb.w(1.8, 0.06, 0.62, 0, 0.90, 0, "#a8845a", 0.01); for(const sx of [-1,1]) for(const sz of [-1,1]) wb.b(0.06, 0.87, 0.06, sx*0.84, 0.435, sz*0.27, "#5a5e60");
      wb.b(1.8, 0.04, 0.62, 0, 0.18, 0, "#7a6a54"); wb.b(1.6, 0.9, 0.02, 0, 1.55, -0.30, "#b8a070");
      for(let k=0;k<7;k++) wb.b(0.04, 0.16+((k*37)%5)*0.03, 0.03, -0.66+k*0.22, 1.50, -0.27, ["#c42a1a","#2a4a8a","#5a5e60","#e8c21c"][k%4]); wb.col(1.8, 0.62, 0, 0, 1.0);
      // steel shelves on the end wall, boxes on them
      const sh=G(7.8-0.25, 4.0, -1, 0); for(let k=0;k<4;k++) sh.b(1.8, 0.03, 0.46, 0, 0.12+k*0.52, 0, "#7a7e82");
      for(const sx of [-1,1]) for(const sz of [-1,1]) sh.b(0.04, 1.75, 0.04, sx*0.88, 0.875, sz*0.21, "#5a5e60"); sh.col(1.8, 0.46, 0, 0, 1.8);
      for(let k=0;k<3;k++) for(let i=0;i<3;i++){ const bw=0.40+((k*3+i)*0.37%1)*0.12, bh=0.24+((k+i*2)*0.29%1)*0.14; sh.b(bw, bh, 0.36, -0.58+i*0.58, 0.135+k*0.52+bh/2, 0, ["#b8996a","#c8a878","#a8865a"][(k+i)%3]); }
      // the water heater in the back corner, a chest freezer on the house's wall, the cans, the mower; the car under its cover
      const wh=G(2.85, 8.8-0.45, 0, -1); wh.g(new T.CylinderGeometry(0.28, 0.28, 1.45, 20), 0, 0.73, 0, "#d8dad6"); wh.g(new T.CylinderGeometry(0.04, 0.04, 0.5, 8), 0, 1.7, 0, "#8a6a44"); wh.col(0.6, 0.6, 0, 0, 1.5);
      const fz=G(2.2+0.098+0.40, 2.6, 1, 0); fz.p(1.20, 0.86, 0.70, 0, 0.43, 0, "#ecebe6", 0.03); fz.col(1.2, 0.7, 0, 0, 0.9);
      const cn=G(7.8-0.40, 1.0, -1, 0); for(const [dx,col] of [[-0.34,"#2a3a2a"],[0.34,"#2a4a8a"]]) cn.p(0.56, 1.0, 0.62, dx, 0.5, 0, col, 0.05); cn.col(1.3, 0.7, 0, 0, 1.1);
      const mw=G(4.3, 7.7, 0, -1); mw.p(0.52, 0.30, 0.70, 0, 0.30, 0, "#2a6a3a", 0.04); mw.b(0.04, 0.04, 0.9, 0, 0.70, -0.70, "#2a2a2a");
      for(const sx of [-1,1]) for(const sz of [-1,1]) mw.g(new T.CylinderGeometry(0.10, 0.10, 0.06, 12), sx*0.26, 0.10, sz*0.26, "#1a1a1a", 0, 0, Math.PI/2); mw.col(0.6, 0.8, 0, 0, 0.8);
      coveredCar(G(5.0, 4.0, 0, -1)); }
    // the walks: in at the door, to each room, through to the garage
    const IN=[[-0.6,-11],[-0.6,-2.4],[-0.6,-1.0],[-0.6,-0.1],[-0.6,0.25],[-0.6,0.9]];
    route(h, pl, "in at the door", IN);
    route(h, pl, "the kitchen", IN.concat([[-0.6,2.4],[0.0,2.4],[0.8,2.4]]));
    route(h, pl, "the front bedroom", IN.concat([[-1.6,1.2],[-1.75,3.7],[-2.2,4.1],[-2.2,4.4],[-2.2,5.0],[-7.0,5.0],[-7.0,4.4],[-7.0,3.7]]));
    route(h, pl, "the main bedroom", IN.concat([[-1.6,1.2],[-1.75,3.7],[-2.2,4.1],[-2.2,4.4],[-2.2,5.0],[-4.4,5.0],[-4.4,5.6],[-4.4,6.3]]));
    route(h, pl, "the bathroom", IN.concat([[-1.6,1.2],[-1.75,3.7],[-2.2,4.1],[-2.2,4.4],[-2.2,5.0],[-2.5,5.0],[-2.5,5.6],[-2.5,6.1]]));
    route(h, pl, "the dining room and the garage", IN.concat([[-0.6,2.4],[0.0,2.4],[0.8,2.4],[0.7,3.6],[0.7,4.4],[1.5,5.2],[1.5,6.6],[1.9,6.6],[2.2,6.6],[2.55,6.6],[3.05,6.6],[3.6,6.6],[3.6,7.3]]));
    route(h, pl, "the hall end to the dining room", IN.concat([[-1.6,1.2],[-1.75,3.7],[-2.2,4.1],[-2.2,4.4],[-2.2,5.0],[-1.2,5.0],[-0.4,5.0]])); }

  /* ---- THE BUNGALOW ---- */
  function bungalow(h){
    const pl=plan(h, 1), FF=h.FF, CL1=FF+2.40, FF2=FF+2.55, rT=0.14*Math.sqrt(1+h.pitch*h.pitch)+0.02, P=palOf(h), hw=h.W/2;
    h.FF2=FF2; h.slope=p=>h.EAV+h.pitch*(hw-Math.abs(p))-rT; h.slopeAt=y=>-(hw-(y-h.EAV+rT)/h.pitch); h.span=0;
    const uK=-h.slopeAt(FF2+1.15); h.kA=-uK; h.kB=uK;
    shell(h);
    const st={p0:0.0, p1:0.902, d0:5.0, n:14, run:0.25, dw0:5.5}, well=pl.rectW(st.p0, st.p1, st.dw0, st.d0+(st.n-1)*st.run);
    storey(h, pl, {y:FF, cl:CL1, rooms:[
        {n:"THE LIVING ROOM", p:[-4.3,4.3], d:[0.2,4.4], fl:"wood", wall:P.liv, lamp:0.75},
        {n:"THE HALL", p:[-1.0,1.0], d:[4.4,9.0], fl:"wood", wall:HALL, hole:well, lamp:0.5},
        {n:"THE BATHROOM", p:[-1.0,1.0], d:[9.0,10.8], fl:"tile", wall:"#d4e4e0", lamp:0.5},
        {n:"THE FRONT BEDROOM", p:[-4.3,-1.0], d:[4.4,7.4], fl:"carpet", carpet:P.carpet, wall:P.bed},
        {n:"THE BACK BEDROOM", p:[-4.3,-1.0], d:[7.4,10.8], fl:"carpet", carpet:P.carpet, wall:P.bed2},
        {n:"THE DINING ROOM", p:[1.0,4.3], d:[4.4,7.0], fl:"oak", wall:P.liv},
        {n:"THE KITCHEN", p:[1.0,4.3], d:[7.0,10.8], fl:"lino", wall:P.kit}],
      parts:[{ax:"d", at:4.4, from:-4.3, to:4.3, doors:[{c:0, w:1.6},{c:2.65, w:1.6}]},
             {ax:"p", at:-1.0, from:4.4, to:10.8, doors:[{c:5.95, leaf:true, into:-1, ajar:0.5, label:"THE FRONT BEDROOM"},{c:8.15, leaf:true, into:-1, ajar:0.5, label:"THE BACK BEDROOM"}]},
             {ax:"p", at:1.0, from:4.4, to:10.8},
             {ax:"d", at:7.4, from:-4.3, to:-1.0},
             {ax:"d", at:7.0, from:1.0, to:4.3, doors:[{c:2.65, w:1.6}]},
             {ax:"d", at:9.0, from:-1.0, to:1.0, doors:[{c:-0.4, leaf:true, into:1, ajar:0.4, label:"THE BATHROOM"}]}]});
    stair(h, pl, st, FF, FF2, CL1, true);
    attic(h, pl, {y:FF2, cl:FF2+2.40, rooms:[
        {n:"THE ATTIC BEDROOM", d:[0.2,5.2], fl:"carpet", carpet:P.carpet, wall:P.bed2},
        {n:"THE ATTIC", d:[5.2,10.8], fl:"wood", wall:"#ece8dc", well:well}],
      parts:[{ax:"d", at:5.2, doors:[{c:-0.54, leaf:true, into:-1, ajar:0.5, label:"THE ATTIC BEDROOM"}]}]}, "p");
    const A=(p,d,dp,dd,y)=>pl.at(p, d, dp, dd, y===undefined ? FF : y);
    // the living room: the set on the hall wall, the sofa with its back to the front windows, a reading chair by the other
    tvStand(A(-2.6, 4.4-0.098-0.24, 0, -1), P.wood); sofa(A(-2.6, 1.35, 0, 1), 2.1, P.sofa); table(A(-2.6, 2.55, 0, 1), 1.1, 0.55, 0.44, P.wood);
    rug(A(-2.6, 2.6, 0, 1), 2.6, 2.0, "#7a5a3a", "#4a3020"); chair(A(-1.2, 2.6, -1, 0), P.sofa);
    chair(A(3.5, 1.2, -1, 0), P.sofa); endTable(A(3.6, 2.1, -1, 0), P.wood, "#f4e6c8"); shelves(A(4.3-0.17, 3.5, -1, 0), 1.0, 1.8, P.wood);
    plant(A(0.95, 0.6, 0, 1), 1.0);
    rug(A(-0.45, 6.6, 0, 1), 0.6, 3.6, "#2a4a6a", "#1a2a3a");
    // the bedrooms
    bed(A(-2.7, 4.4+0.098+1.062, 0, 1), 1.35, 1.95, P.q, P.wood); nightstand(A(-3.75, 4.75, 0, 1), P.wood, "#f4e6c8"); nightstand(A(-1.65, 4.75, 0, 1), P.wood, null);
    dresser(A(-2.7, 7.4-0.098-0.25, 0, -1), 1.0, P.wood);
    bed(A(-3.4, 10.8-1.062, 0, -1), 1.0, 2.0, "#a8c8a0", P.wood); nightstand(A(-2.55, 10.8-0.23, 0, -1), P.wood, null); dresser(A(-3.2, 7.4+0.098+0.25, 0, 1), 0.9, P.wood);
    // the dining room, the kitchen
    diningSet(A(3.4, 5.7, 0, 1), 1.2, 0.8, P.wood, 4); dresser(A(4.3-0.25, 6.5, -1, 0), 0.8, P.wood);
    { const o=A(2.3, 10.8-0.31, 0, -1); counterRun(o, 2.3, {sink:o.u(-0.3), uppers:false}); o.w(0.85, 0.72, 0.34, o.u(0.725), 1.86, -0.13, "#e8e2d0", 0.01); }
    fridge(A(3.88, 10.8-0.37, 0, -1)); counterRun(A(4.3-0.31, 7.8, -1, 0), 1.0, {range:0, uppers:false});
    // the bathroom
    toilet(A(-0.45, 10.8-0.36, 0, -1)); vanity(A(0.5, 10.8-0.27, 0, -1), 0.7, "#ece6d8");
    // upstairs: the bed under the flat with the gable window over the dresser; the attic room's futon, shelves and boxes
    const U=(p,d,dp,dd)=>pl.at(p, d, dp, dd, FF2);
    bed(U(1.3, 5.2-0.098-1.062, 0, -1), 1.5, 2.0, P.q, P.wood); nightstand(U(0.25, 4.88, 0, -1), P.wood, "#f4e6c8"); nightstand(U(2.35, 4.88, 0, -1), P.wood, null);
    dresser(U(-1.6, 0.462, 0, 1), 1.0, P.wood); rug(U(1.3, 2.4, 0, 1), 1.8, 1.2, "#c8b8a0", "#8a7a64");
    sofa(U(0, 10.8-0.03-0.43, 0, -1), 1.8, "#5a6a7a"); rug(U(-0.9, 9.4, 0, 1), 1.6, 1.2, "#8a3a2a", "#5a2014");
    shelves(U(uK-0.17, 9.5, -1, 0), 1.2, 1.0, P.wood); boxes(U(-uK+0.30, 8.6, 1, 0), 3, h.no+5); boxes(U(-uK+0.30, 6.6, 1, 0), 2, h.no+9);
    const IN=[[0,-13],[0,-3.4],[0,-1.2],[0,-0.1],[0,0.25],[0,0.9]];
    route(h, pl, "in at the door", IN);
    route(h, pl, "the living room", IN.concat([[1.2,1.8],[2.6,3.2]]));
    const HL=IN.concat([[0,3.6],[0,4.4],[-0.45,4.5],[-0.45,5.0]]);
    route(h, pl, "the front bedroom", HL.concat([[-0.45,5.95],[-1.0,5.95],[-1.6,5.95]]));
    route(h, pl, "the back bedroom", HL.concat([[-0.45,8.15],[-1.0,8.15],[-1.6,8.15]]));
    route(h, pl, "the bathroom", HL.concat([[-0.45,8.7],[-0.4,9.0],[-0.4,9.5]]));
    route(h, pl, "the dining room and the kitchen", IN.concat([[1.2,2.0],[2.65,3.6],[2.65,4.4],[2.65,4.9],[2.3,4.9],[2.0,5.2],[2.0,6.3],[2.65,6.55],[2.65,7.0],[2.65,8.4]]));
    const UP=IN.concat([[0,3.6],[0.45,4.4],[0.45,4.6],[0.45,5.0],[0.45,6.5],[0.45,8.0],[0.45,8.8]]);
    route(h, pl, "upstairs, the attic", UP.concat([[0.0,9.2]]));
    route(h, pl, "upstairs, the attic bedroom", UP.concat([[-0.5,8.8],[-0.54,5.8],[-0.54,5.2],[-0.54,4.4],[-1.0,3.0]]));
    LAKE_HOUSES.stairs.push({name:"No. "+h.no+" stair", up:[[0.45,4.6],[0.45,5.0],[0.45,6.5],[0.45,8.5]].map(([p,d])=>[pl.X(p), pl.Zd(d)]), lo:FF, hi:FF2}); }

  /* ---- THE TWO-STOREY ---- */
  function twoStorey(h){
    const pl=plan(h, h.cSide), FF=h.FF, CL1=FF+2.45, FF2=FF+2.62, CL2=h.EAV-0.12, P=palOf(h);
    h.FF2=FF2; shell(h);
    const st={p0:0.0, p1:0.902, d0:1.6, n:15, run:0.25, dw0:2.2}, well=pl.rectW(st.p0, st.p1, st.dw0, st.d0+(st.n-1)*st.run);
    storey(h, pl, {y:FF, cl:CL1, rooms:[
        {n:"THE LIVING ROOM", p:[-4.5,-1.0], d:[0.2,8.0], fl:"wood", wall:P.liv, lamp:0.75},
        {n:"THE DINING ROOM", p:[1.0,4.5], d:[0.2,3.3], fl:"oak", wall:P.liv},
        {n:"THE KITCHEN", p:[1.0,4.5], d:[3.3,8.0], fl:"lino", wall:P.kit},
        {n:"THE FRONT HALL", p:[-1.0,1.0], d:[0.2,8.0], fl:"wood", wall:HALL, hole:well}],
      parts:[{ax:"p", at:-1.0, from:0.2, to:8.0, doors:[{c:1.1, w:1.2},{c:6.4, w:1.2}]},
             {ax:"p", at:1.0, from:0.2, to:8.0, doors:[{c:1.0, w:1.0},{c:6.2, w:1.0}]},
             {ax:"d", at:3.3, from:1.0, to:4.5, doors:[{c:1.95, w:1.4}]}]});
    storey(h, pl, {y:FF2, cl:CL2, upper:true, rooms:[
        {n:"THE FRONT BEDROOM", p:[-4.5,-1.0], d:[0.2,4.1], fl:"carpet", carpet:P.carpet, wall:P.bed},
        {n:"THE BACK BEDROOM", p:[-4.5,-1.0], d:[4.1,8.0], fl:"carpet", carpet:P.carpet, wall:P.bed2},
        {n:"THE KIDS' ROOM", p:[1.0,4.5], d:[0.2,4.1], fl:"carpet", carpet:"#a8b8c8", wall:"#f0e0d0"},
        {n:"THE BATHROOM", p:[1.0,4.5], d:[4.1,8.0], fl:"tile", wall:"#d8ecec", lamp:0.55},
        {n:"THE UPSTAIRS HALL", p:[-1.0,1.0], d:[0.2,8.0], fl:"wood", wall:HALL, well:well}],
      parts:[{ax:"p", at:-1.0, from:0.2, to:8.0, doors:[{c:3.0, leaf:true, into:-1, ajar:0.5, label:"THE FRONT BEDROOM"},{c:5.8, leaf:true, into:-1, ajar:0.5, label:"THE BACK BEDROOM"}]},
             {ax:"p", at:1.0, from:0.2, to:8.0, doors:[{c:1.3, leaf:true, into:1, ajar:0.5, label:"THE KIDS' ROOM"},{c:6.0, leaf:true, into:1, ajar:0.4, label:"THE BATHROOM"}]},
             {ax:"d", at:4.1, from:-4.5, to:-1.0}, {ax:"d", at:4.1, from:1.0, to:4.5}]});
    stair(h, pl, st, FF, FF2, CL1, false);
    const A=(p,d,dp,dd,y)=>pl.at(p, d, dp, dd, y===undefined ? FF : y);
    // the living room: the sofa between the side windows, the set on the hall wall, a piano at the front
    sofa(A(-4.5+0.03+0.43, 4.1, 1, 0), 2.0, P.sofa); tvStand(A(-1.0-0.098-0.24, 4.1, -1, 0), P.wood); table(A(-2.6, 4.1, 1, 0), 1.0, 0.5, 0.44, P.wood);
    rug(A(-2.8, 4.1, 1, 0), 2.4, 1.9, "#5a4a6a", "#3a2a4a"); chair(A(-2.6, 2.3, 0, 1), P.sofa); chair(A(-2.6, 6.2, 0, -1), P.sofa);
    piano(A(-4.5+0.03+0.29, 1.1, 1, 0), "#2a1a12"); plant(A(-1.5, 0.6, 0, 1), 1.0); shelves(A(-3.6, 8.0-0.17, 0, -1), 1.1, 1.9, P.wood);
    // the dining room; the kitchen with its side door out to the carport
    diningSet(A(2.75, 1.6, 0, 1), 1.1, 0.8, P.wood, 4); dresser(A(4.5-0.25, 1.0, -1, 0), 1.0, P.wood);
    { const o=A(2.35, 8.0-0.31, 0, -1); counterRun(o, 2.4, {sink:o.u(0.05), uppers:false}); o.w(0.6, 0.72, 0.34, o.u(0.9), 1.86, -0.13, "#e8e2d0", 0.01); o.w(0.7, 0.72, 0.34, o.u(-0.85), 1.86, -0.13, "#e8e2d0", 0.01); }
    fridge(A(4.05, 8.0-0.37, 0, -1)); counterRun(A(4.5-0.31, 6.75, -1, 0), 0.9, {range:0, uppers:false});
    rug(A(4.0, 4.36, -1, 0), 0.9, 0.6, "#8a6a3a", "#5a4020");
    // upstairs: the bedrooms, the kids' room, the bathroom
    const U=(p,d,dp,dd)=>pl.at(p, d, dp, dd, FF2);
    bed(U(-2.9, 4.1-0.098-1.062, 0, -1), 1.5, 2.0, P.q, P.wood); nightstand(U(-3.95, 3.85, 0, -1), P.wood, "#f4e6c8"); nightstand(U(-1.85, 3.85, 0, -1), P.wood, "#f4e6c8");
    dresser(U(-4.5+0.25, 1.0, 1, 0), 1.0, P.wood);
    bed(U(-3.0, 4.1+0.098+1.062, 0, 1), 1.5, 2.0, P.q, P.wood); nightstand(U(-4.05, 4.45, 0, 1), P.wood, "#f4e6c8"); nightstand(U(-1.95, 4.45, 0, 1), P.wood, null);
    dresser(U(-3.6, 8.0-0.25, 0, -1), 1.0, P.wood);
    bed(U(3.6, 4.1-0.098-1.062, 0, -1), 1.0, 2.0, "#e86a4a", P.wood); desk(U(4.5-0.29-0.006, 0.95, -1, 0), 1.0, "#e8e2d0"); deskChair(U(3.62, 0.95, 1, 0), "#c42a1a");
    boxes(U(2.0, 3.75, 0, -1), 1, h.no+3); rug(U(2.6, 2.2, 0, 1), 1.4, 1.0, "#4aa8c8", "#2a6a8a");
    tub(U(3.6, 8.0-0.39, 0, -1), 1.6); toilet(U(4.5-0.35, 4.7, -1, 0)); vanity(U(2.6, 4.1+0.098+0.27, 0, 1), 1.0, "#ece6d8");
    const IN=[[0,-11.5],[0,-2.4],[0,-0.8],[0,-0.1],[0,0.25],[0,0.9]];
    route(h, pl, "in at the door", IN);
    route(h, pl, "the living room", IN.concat([[-0.45,1.1],[-1.0,1.1],[-1.6,1.1],[-2.6,1.2]]));
    route(h, pl, "the dining room", IN.concat([[0.45,1.0],[1.0,1.0],[1.6,1.0]]));
    route(h, pl, "the kitchen and out the side door", IN.concat([[0.45,1.0],[1.0,1.0],[1.6,1.0],[1.6,2.8],[1.95,3.3],[2.0,4.4],[3.6,4.36],[4.5,4.36],[5.15,4.36],[5.15,3.0],[5.15,2.4]]));
    const UP=IN.concat([[0.45,1.0],[0.45,1.6],[0.45,3.0],[0.45,5.0],[0.45,5.6]]);
    route(h, pl, "upstairs, the front bedroom", UP.concat([[-0.45,5.6],[-0.45,3.0],[-1.0,3.0],[-1.6,3.0]]));
    route(h, pl, "upstairs, the back bedroom", UP.concat([[-0.45,5.8],[-1.0,5.8],[-1.6,5.8]]));
    route(h, pl, "upstairs, the kids' room", UP.concat([[-0.45,5.6],[-0.45,0.9],[0.45,0.9],[0.45,1.3],[1.0,1.3],[1.6,1.3]]));
    route(h, pl, "upstairs, the bathroom", UP.concat([[0.45,6.0],[1.0,6.0],[1.6,6.0]]));
    LAKE_HOUSES.stairs.push({name:"No. "+h.no+" stair", up:[[0.45,1.0],[0.45,1.6],[0.45,3.0],[0.45,5.3]].map(([p,d])=>[pl.X(p), pl.Zd(d)]), lo:FF, hi:FF2}); }

  for(const h of Hs){ if(h.kind==="cape") cape(h); else if(h.kind==="ranch") ranch(h); else if(h.kind==="bungalow") bungalow(h); else if(h.kind==="twoStorey") twoStorey(h); }
  const mesh=new T.Mesh(mergeEntries(ME), new T.MeshStandardMaterial({vertexColors:true, roughness:0.62, metalness:0.06}));
  mesh.castShadow=true; mesh.receiveShadow=true; mesh.name="lake-houses"; scene.add(mesh);
})();
