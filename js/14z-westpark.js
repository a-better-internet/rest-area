"use strict";
/* REST AREA · 14z-westpark.js
   French Creek Pines: a campground and trailer park west along US 6N
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14z · FRENCH CREEK PINES
   Past the west farms US 6N runs on into the woods, and on the south side
   a sign by a drive says FRENCH CREEK PINES · CAMPGROUND & MOBILE HOME
   PARK. A gravel lane runs east and west through a clearing under tall
   trees (WEST.park, 04), the single-wides on their lots either side of
   it, end on to the lane: each up on its skirting, a deck and steps to its
   door, an awning, a fire ring and chairs, a picnic table, string lights,
   flowers, a car or a truck on the gravel. Out the back, tent pads and a
   vintage camper, a horseshoe pit, a swing set, the common fire.
   Every trailer can be walked into: a living room at the lane end, the
   kitchen by the door, a bathroom and the bedroom at the back.
   By the way in, the community hall: a meeting room with its rows of
   folding chairs and the officers' table, the kitchen's pass-through, the
   bulletin board; and through a door at the back, the stair down to THE
   PINE KNOT, the members' lounge in the basement (21 and over): wood
   panelling and a drop ceiling, the long bar, the tip boards and the meat
   raffle wheel, the honour roll, the jukebox, and four slot machines you
   can play (18p). It is underground and lit the same at every hour.
   Everything out here, a kilometre from the origin, is built in world
   coordinates: walls as outlines less their openings, cut into a grid at
   every opening (pieces / vslab, as 14o builds Lake Street).
   ---------------------------------------------------------------------- */
const WESTPARK={trailers:[], slots:[], routes:{}, hall:null};
(function westPark(){
  const W=WEST, Y=EDIN.y, Z=EDIN.z, HW=EDIN.hw, P=W.park, LZ=W.lane, GX=W.gate;
  const q=_trng(6868);
  const groups={}; let ME=null;
  const use=(k)=>{ ME=groups[k]||(groups[k]=[]); };
  const ent=(geo,x,y,z,c,rx,ry,rz)=>ME.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,ry)=>ent(boxGeo(w,h,d),x,y,z,c,0,ry||0,0);
  const C=(r,h,x,y,z,c,seg,rx,ry,rz)=>ent(new T.CylinderGeometry(r,r,h,seg||roundSegs(r)),x,y,z,c,rx,ry,rz);
  const CT=(r0,r1,h,x,y,z,c,seg)=>ent(new T.CylinderGeometry(r0,r1,h,seg||16),x,y,z,c);
  const RB=(w,h,d,x,y,z,c,ry,rad)=>ent(rboxGeo(w,h,d,Math.min(rad||0.03,Math.min(w,h,d)*0.32),2),x,y,z,c,0,ry||0,0);
  const S=(r,x,y,z,c)=>ent(new T.SphereGeometry(r, 12, 8),x,y,z,c);
  const tubeE=(a,b,rad,c)=>{ const d=new T.Vector3().subVectors(b,a), L=d.length();
    ME.push({geo:new T.CylinderGeometry(rad,rad,L,8), matrix:new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5),
      new T.Quaternion().setFromUnitVectors(V3(0,1,0), d.normalize()), V3(1,1,1)), color:new T.Color(c)}); };
  const say=(c, s, cx, cy, w, h, col, weight, family)=>{ c.fillStyle=col; fitText(c, s, w, h, cx, cy, weight||"700", family); };
  const sign=(w,h,draw,px,py,pz,ry,lit,cw)=>signPanel(w,h, signTex(cw||Math.round(w*420), Math.round((cw||w*420)*h/w), draw), px,py,pz,ry,lit);
  const gy=(x,z)=>Terrain.groundAt(x,z);

  /* ---- the textures: ribbed metal siding, the hall's lap siding, panelling, the lounge's floor, the drop ceiling ---- */
  const tx=(k, w, h, draw, rough, rep)=>bucketOf(k, ()=>{ const t=signTex(w, h, draw); t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial({map:t, roughness:rough||0.8}); });
  tx("wp_rib", 128, 128, (c,Wd,Hh)=>{ c.fillStyle="#e8e6e0"; c.fillRect(0,0,Wd,Hh); for(let x=0;x<Wd;x+=16){ c.fillStyle="#c8c6c0"; c.fillRect(x, 0, 3, Hh); c.fillStyle="#f6f4ee"; c.fillRect(x+4, 0, 2, Hh); } }, 0.6);
  tx("wp_lap", 128, 128, (c,Wd,Hh)=>{ c.fillStyle="#ece6d8"; c.fillRect(0,0,Wd,Hh); for(let y=0;y<Hh;y+=16){ c.fillStyle="#c8c2b2"; c.fillRect(0, y+13, Wd, 3); c.fillStyle="#f8f4ea"; c.fillRect(0, y, Wd, 2); } }, 0.7);
  tx("wp_panel", 256, 128, (c,Wd,Hh)=>{ const r=_trng(313); c.fillStyle="#7a5232"; c.fillRect(0,0,Wd,Hh);
    for(let k=0;k<300;k++){ c.fillStyle="rgba(40,20,8,"+(0.08+r()*0.12).toFixed(2)+")"; c.fillRect(r()*Wd, 0, 1+r()*2, Hh); }
    for(let x=0;x<Wd;x+=32){ c.fillStyle="#3a2414"; c.fillRect(x, 0, 2, Hh); } }, 0.7);
  tx("wp_wall", 64, 64, (c,Wd,Hh)=>{ const r=_trng(41); c.fillStyle="#f2eee4"; c.fillRect(0,0,Wd,Hh); for(let k=0;k<200;k++){ c.fillStyle="rgba(0,0,0,0.03)"; c.fillRect(r()*Wd, r()*Hh, 2, 2); } }, 0.9);
  tx("wp_tile", 128, 128, (c,Wd,Hh)=>{ for(let i=0;i<4;i++) for(let j=0;j<4;j++){ c.fillStyle=(i+j)%2 ? "#2a2a2c" : "#c8c2b0"; c.fillRect(i*32, j*32, 32, 32); }
    c.strokeStyle="rgba(0,0,0,0.2)"; for(let i=0;i<=4;i++){ c.beginPath(); c.moveTo(i*32,0); c.lineTo(i*32,Hh); c.stroke(); c.beginPath(); c.moveTo(0,i*32); c.lineTo(Wd,i*32); c.stroke(); } }, 0.5);
  tx("wp_ceil", 128, 128, (c,Wd,Hh)=>{ const r=_trng(17); c.fillStyle="#e8e4d8"; c.fillRect(0,0,Wd,Hh); for(let k=0;k<500;k++){ c.fillStyle="rgba(90,80,60,0.12)"; c.fillRect(r()*Wd, r()*Hh, 1, 1); }
    c.fillStyle="#b8b4a8"; c.fillRect(0, 0, Wd, 3); c.fillRect(0, 0, 3, Hh); }, 0.95);
  tx("wp_carpet", 64, 64, (c,Wd,Hh)=>{ const r=_trng(99); c.fillStyle="#8a8478"; c.fillRect(0,0,Wd,Hh); for(let k=0;k<600;k++){ c.fillStyle=r()<0.5 ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)"; c.fillRect(r()*Wd, r()*Hh, 1, 1); } }, 1.0);
  tx("wp_vinyl", 128, 128, (c,Wd,Hh)=>{ const r=_trng(61); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ c.fillStyle=(i+j)%2 ? "#d8d0bc" : "#e8e2d0"; c.fillRect(i*32, j*32, 32, 32); }
    for(let k=0;k<900;k++){ c.fillStyle=["rgba(90,80,60,0.25)","rgba(255,255,255,0.35)","rgba(140,120,90,0.2)"][k%3]; c.fillRect(r()*Wd, r()*Hh, 1+r()*1.5, 1+r()*1.5); }
    c.fillStyle="rgba(0,0,0,0.08)"; for(let i=0;i<=4;i++){ c.fillRect(i*32, 0, 1, Hh); c.fillRect(0, i*32, Wd, 1); } }, 0.6);
  tx("wp_gravel", 128, 128, (c,Wd,Hh)=>{ const r=_trng(7); c.fillStyle="#8e887a"; c.fillRect(0,0,Wd,Hh);
    for(let k=0;k<1400;k++){ c.fillStyle=["#a8a294","#6e6a60","#9a8e78","#c0baa8","#5e5a50"][(r()*5)|0]; c.fillRect(r()*Wd, r()*Hh, 1+r()*2.5, 1+r()*2); } }, 1.0);
  tx("wp_skirt", 128, 128, (c,Wd,Hh)=>{ c.fillStyle="#ece8de"; c.fillRect(0,0,Wd,Hh); for(let x=0;x<Wd;x+=21){ c.fillStyle="#c8c4b8"; c.fillRect(x, 0, 2, Hh); c.fillStyle="#fbf8f0"; c.fillRect(x+3, 0, 2, Hh); }
    c.fillStyle="#3a3a38"; c.fillRect(40, 52, 46, 26); c.fillStyle="#8a8a86"; for(let y=55;y<76;y+=5) c.fillRect(42, y, 42, 2);
    c.fillStyle="rgba(90,80,60,0.25)"; c.fillRect(0, Hh-14, Wd, 14); }, 0.8);
  tx("wp_deck", 128, 128, (c,Wd,Hh)=>{ const r=_trng(55); for(let y=0;y<Hh;y+=16){ c.fillStyle=["#b08a62","#a8825a","#b8926a","#a07a54"][(y/16)%4]; c.fillRect(0, y, Wd, 16);
      for(let k=0;k<26;k++){ c.fillStyle="rgba(60,36,16,"+(0.06+r()*0.1).toFixed(2)+")"; c.fillRect(r()*Wd, y+1+r()*13, 10+r()*30, 1); }
      c.fillStyle="#4a3420"; c.fillRect(0, y+14, Wd, 2); c.fillStyle="#2a2018"; c.fillRect((y*7)%Wd, y+5, 2, 2); c.fillRect(((y*7)+64)%Wd, y+5, 2, 2); } }, 0.85);
  tx("wp_wood", 256, 64, (c,Wd,Hh)=>{ const r=_trng(808); c.fillStyle="#5a3a22"; c.fillRect(0,0,Wd,Hh);
    for(let k=0;k<90;k++){ const y=r()*Hh; c.strokeStyle="rgba("+(30+r()*40|0)+",18,6,"+(0.15+r()*0.25).toFixed(2)+")"; c.lineWidth=0.6+r()*1.4; c.beginPath(); c.moveTo(0, y);
      for(let x=0;x<=Wd;x+=16) c.lineTo(x, y+Math.sin(x*0.03+k)*2.5); c.stroke(); } }, 0.45);
  tx("wp_vinylpad", 64, 64, (c,Wd,Hh)=>{ c.fillStyle="#7a2018"; c.fillRect(0,0,Wd,Hh); const g=c.createRadialGradient(32,32,2,32,32,30); g.addColorStop(0,"rgba(255,200,180,0.18)"); g.addColorStop(1,"rgba(0,0,0,0.25)");
    c.fillStyle=g; c.fillRect(0,0,Wd,Hh); c.fillStyle="#d8c070"; c.beginPath(); c.arc(0,0,2.5,0,7); c.arc(Wd,0,2.5,0,7); c.arc(0,Hh,2.5,0,7); c.arc(Wd,Hh,2.5,0,7); c.fill(); }, 0.35);
  bucketOf("wp_rug", ()=>{ const t=signTex(256, 256, (c,Wd,Hh)=>{ const cols=["#8a2a1e","#c89a4a","#2a4a5a","#e8d8b0","#5a6a3a"];
      for(let k=0;k<14;k++){ c.fillStyle=cols[k%cols.length]; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd/2-k*8.5, Hh/2-k*8.5, 0, 0, 7); c.fill(); }
      const r=_trng(4); for(let k=0;k<1500;k++){ c.fillStyle="rgba(0,0,0,"+(r()*0.12).toFixed(2)+")"; c.fillRect(r()*Wd, r()*Hh, 2, 1); } });
    return new T.MeshStandardMaterial({map:t, roughness:1.0}); });
  bucketOf("wp_xmas", ()=>new T.MeshBasicMaterial({vertexColors:true, toneMapped:false}));
  bucketOf("wp_glowbox", ()=>emitMat(0xfff2d8, 0.9, "indoor"));
  bucketOf("wp_popcorn", ()=>emitMat(0xffb830, 0.9, "indoor"));
  bucketOf("wp_road", ()=>{ const t=signTex(128, 128, (c,Wd,Hh)=>{ const r=_trng(8); c.fillStyle="#8e887a"; c.fillRect(0,0,Wd,Hh);
      for(let k=0;k<1400;k++){ c.fillStyle=["#a8a294","#6e6a60","#9a8e78","#c0baa8","#5e5a50"][(r()*5)|0]; c.fillRect(r()*Wd, r()*Hh, 1+r()*2.5, 1+r()*2); } });
    t.wrapS=t.wrapT=T.RepeatWrapping; return new T.MeshStandardMaterial(Object.assign({map:t, roughness:1.0}, _po(-2))); });

  /* ---- walls: outlines less their openings, in a grid (14o's pieces / vslab / vliner, built in world terms) ---- */
  const clip=(Pp, k, v, keepHi)=>{ const out=[];
    for(let i=0;i<Pp.length;i++){ const A=Pp[i], Bq=Pp[(i+1)%Pp.length], ia=keepHi ? A[k]>=v-1e-9 : A[k]<=v+1e-9, ib=keepHi ? Bq[k]>=v-1e-9 : Bq[k]<=v+1e-9;
      if(ia) out.push(A); if(ia!==ib){ const t=(v-A[k])/(Bq[k]-A[k]); out.push([A[0]+(Bq[0]-A[0])*t, A[1]+(Bq[1]-A[1])*t]); } }
    return out; };
  const area=Pp=>{ let s=0; for(let i=0;i<Pp.length;i++){ const a=Pp[i], b=Pp[(i+1)%Pp.length]; s+=a[0]*b[1]-b[0]*a[1]; } return s/2; };
  function pieces(a, b, y0, y1, holes){ const H=holes||[], poly=[[a,y0],[b,y0],[b,y1],[a,y1]];
    const ys=[...new Set([y0,y1].concat(H.flatMap(o=>[o.sill, o.head])).map(v=>+v.toFixed(5)))].sort((p,r)=>p-r);
    const ss=[-1e9].concat([...new Set(H.flatMap(o=>[o.a, o.b]).map(v=>+v.toFixed(5)))].sort((p,r)=>p-r), [1e9]), out=[];
    for(let i=0;i<ys.length-1;i++){ const ya=ys[i], yb=ys[i+1]; if(yb-ya<0.003) continue;
      const band=clip(clip(poly, 1, ya, true), 1, yb, false); if(band.length<3) continue;
      for(let j=0;j<ss.length-1;j++){ const s0=ss[j], s1=ss[j+1]; if(s1-s0<0.003) continue;
        if(H.some(o=>o.a<=s0+1e-4 && o.b>=s1-1e-4 && o.sill<=ya+1e-4 && o.head>=yb-1e-4)) continue;
        const pc=clip(clip(band, 0, s0, true), 0, s1, false); if(pc.length>=3 && Math.abs(area(pc))>1e-5) out.push(pc); } }
    return out; }
  const newell=Pp=>{ const n=V3(0,0,0); for(let i=0;i<Pp.length;i++){ const a=Pp[i], b=Pp[(i+1)%Pp.length];
      n.x+=(a.y-b.y)*(a.z+b.z); n.y+=(a.z-b.z)*(a.x+b.x); n.z+=(a.x-b.x)*(a.y+b.y); } return n; };
  function addFace(Gm, Pp, n, uvf){ const Q=newell(Pp).dot(n)<0 ? Pp.slice().reverse() : Pp;
    for(let i=1;i<Q.length-1;i++) for(const p of [Q[0],Q[i],Q[i+1]]){ Gm.P.push(p.x,p.y,p.z); Gm.N.push(n.x,n.y,n.z); const u=uvf(p); Gm.U.push(u[0],u[1]); } }
  function flush(Gm, bk, col){ if(!Gm.P.length) return; const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(Gm.P,3)); g.setAttribute("normal", new T.Float32BufferAttribute(Gm.N,3)); g.setAttribute("uv", new T.Float32BufferAttribute(Gm.U,2));
    push(bk, g, 0,0,0, 0, col); }
  const P3=(ax, c, s, y)=>ax==="x" ? V3(s, y, c) : V3(c, y, s);
  const NRM=ax=>ax==="x" ? V3(0,0,1) : V3(1,0,0);
  function vslab(bk, ax, c, pcs, t, dir, col, uvs){
    const Gm={P:[],N:[],U:[]}, Nn=NRM(ax), s=uvs||0.5, key=(a,b)=>a[0].toFixed(4)+","+a[1].toFixed(4)+">"+b[0].toFixed(4)+","+b[1].toFixed(4);
    const edges=new Set(); for(const pc of pcs) for(let i=0;i<pc.length;i++) edges.add(key(pc[i], pc[(i+1)%pc.length]));
    for(const pc of pcs){ const front=pc.map(p=>P3(ax, c, p[0], p[1])), back=pc.map(p=>P3(ax, c+dir*t, p[0], p[1]));
      addFace(Gm, front, Nn.clone().multiplyScalar(-dir), p=>[(ax==="x" ? p.x : p.z)*s*-dir, p.y*s]);
      addFace(Gm, back, Nn.clone().multiplyScalar(dir), p=>[(ax==="x" ? p.x : p.z)*s*dir, p.y*s]);
      const cx=pc.reduce((a,p)=>a+p[0],0)/pc.length, cy=pc.reduce((a,p)=>a+p[1],0)/pc.length;
      for(let i=0;i<pc.length;i++){ const a=pc[i], b=pc[(i+1)%pc.length], es=b[0]-a[0], ey=b[1]-a[1], L=Math.hypot(es,ey); if(L<1e-5 || edges.has(key(b, a))) continue;
        let ns=ey/L, ny=-es/L; if((a[0]-cx)*ns+(a[1]-cy)*ny<0){ ns=-ns; ny=-ny; }
        const n=ax==="x" ? V3(ns, ny, 0) : V3(0, ny, ns), dq=p=>ax==="x" ? p.z : p.x, sq=p=>ax==="x" ? p.x : p.z;
        addFace(Gm, [front[i], front[(i+1)%pc.length], back[(i+1)%pc.length], back[i]], n, Math.abs(ns)>Math.abs(ny) ? p=>[dq(p)*s, p.y*s] : p=>[sq(p)*s, dq(p)*s]); } }
    flush(Gm, bk, col); }
  function vliner(bk, ax, c, pcs, dir, col, uvs){ const Gm={P:[],N:[],U:[]}, n=NRM(ax).multiplyScalar(dir), s=uvs||0.5;
    for(const pc of pcs) addFace(Gm, pc.map(p=>P3(ax, c+dir*0.006, p[0], p[1])), n, p=>[(ax==="x" ? p.x : p.z)*s*(ax==="x" ? dir : -dir), p.y*s]);
    flush(Gm, bk, col); }
  function face(bk, Pp, n, col, uvs){ const Gm={P:[],N:[],U:[]}, s=uvs||0.5; addFace(Gm, Pp, n.clone().normalize(), p=>[p.x*s, p.z*s]); flush(Gm, bk, col); }
  const holesIn=(ops, a, b, y0, y1)=>ops.filter(o=>o.b>a+1e-4 && o.a<b-1e-4 && o.head>y0+1e-4 && o.sill<y1-1e-4)
    .map(o=>({a:Math.max(o.a, a), b:Math.min(o.b, b), sill:Math.max(o.sill, y0), head:Math.min(o.head, y1)}));
  // a wall t thick, its centre on the plane at c: the slab, its colliders round the openings; and a liner on either face
  function wall(bk, ax, c, t, a, b, y0, y1, ops, col, uvs, floorY){
    vslab(bk, ax, c-t/2, pieces(a, b, y0, y1, holesIn(ops, a, b, y0, y1)), t, 1, col, uvs);
    const sunk=floorY!==undefined && y0<=floorY+0.3 ? y0-0.5 : y0, cl=(p0, p1, q0, q1)=>ax==="x" ? addCol(p0, p1, c-t/2, c+t/2, q0, q1) : addCol(c-t/2, c+t/2, p0, p1, q0, q1);
    for(const sp of _spans(a, b, ops)){ if(!sp.o){ cl(sp.a, sp.b, sunk, y1); continue; }
      if(sp.o.sill>y0+0.01) cl(sp.a, sp.b, sunk, sp.o.sill); if(sp.o.head<y1-0.01) cl(sp.a, sp.b, sp.o.head, y1); } }
  const liner=(bk, ax, fc, dir, a, b, y0, y1, ops, col, uvs)=>vliner(bk, ax, fc, pieces(a, b, y0, y1, holesIn(ops, a, b, y0, y1)), dir, col, uvs||0.5);
  // a window's glass, its trim outside, its sill and a curtain inside (ax: the wall's axis; c its centre plane; out: +1/-1 the outside)
  function windowAt(ax, c, t, o, out, trim, curtain){
    const w=o.b-o.a, h=o.head-o.sill, m=(o.a+o.b)/2, ym=(o.sill+o.head)/2;
    push("glass", planeGeo(w-0.02, h-0.02, 0), ax==="x" ? m : c, ym, ax==="x" ? c : m, ax==="x" ? 0 : Math.PI/2, "#ffffff");
    const fo=c+out*(t/2+0.032), fi=c-out*(t/2+0.02);
    for(const [ww, hh, ds, dy] of [[w+0.16, 0.07, 0, h/2+0.035],[w+0.16, 0.07, 0, -h/2-0.035],[0.07, h, -w/2-0.035, 0],[0.07, h, w/2+0.035, 0]]){
      if(ax==="x") B(ww, hh, 0.04, m+ds, ym+dy, fo, trim); else B(0.04, hh, ww, fo, ym+dy, m+ds, trim); }
    if(ax==="x") B(w+0.06, 0.03, 0.10, m, o.sill-0.015, fi-out*0.03, "#e8e4d8"); else B(0.10, 0.03, w+0.06, fi-out*0.03, o.sill-0.015, m, "#e8e4d8");
    if(curtain) for(const sd of [-1,1]){ const cx2=m+sd*(w/2-0.05);
      if(ax==="x") B(0.22, h+0.12, 0.02, cx2, ym+0.02, fi-out*0.05, curtain); else B(0.02, h+0.12, 0.22, fi-out*0.05, ym+0.02, cx2, curtain); }
  }
  const lampIn=(o)=>{ o.indoor=true; LAMPS.push(o); return o; };

  /* ======================================================================
     THE LANE, THE DRIVE, THE ENTRANCE
     ====================================================================== */
  use("site");
  const gravel=(x0, x1, z0, z1)=>{ const w=x1-x0, d=z1-z0, g=new T.PlaneGeometry(w, d), U=g.attributes.uv;
    for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*w*0.25, U.getY(i)*d*0.25);
    push("wp_road", g, (x0+x1)/2, Y+0.035, (z0+z1)/2, 0, "#ffffff", -Math.PI/2, 0); addFlat(x0, x1, z0, z1, Y+0.02); };
  const LX0=P.x0+14, LX1=P.x1-14;
  gravel(LX0, LX1, LZ-2.8, LZ+2.8);                                              // the lane
  gravel(GX-2.6, GX+2.6, Z+HW-0.4, LZ-2.8);                                      // the drive in, from the road's edge
  for(const xe of [LX0, LX1]){ const g=new T.CircleGeometry(8, 28), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*4, U.getY(i)*4);
    push("wp_road", g, xe, Y+0.036, LZ, 0, "#ffffff", -Math.PI/2, 0); }           // the turnarounds at the ends
  gravel(-1140, -1104, Z+HW+0.2, -1186.2);                                       // the hall's lot, between it and the road
  addZone(P.x0, P.x1, P.z0-3, P.z1, Y-1, Y+12, "FRENCH CREEK PINES");
  // the sign at the way in: routed wood on two log posts, the pines cut out on it
  { const sx=GX+7.5, sz=Z+HW+3.0;
    for(const dx of [-1.6, 1.6]) C(0.11, 2.6, sx+dx, Y+1.3, sz, "#6a4a2e", 10);
    B(3.6, 1.30, 0.10, sx, Y+1.75, sz+0.02, "#5a3a22");
    sign(3.4, 1.18, (c,Wd,Hh)=>{ c.fillStyle="#6a4428"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#e8d8b0"; c.lineWidth=6; c.strokeRect(8,8,Wd-16,Hh-16);
      c.fillStyle="#2e5a32"; for(const px of [0.12, 0.88]){ c.beginPath(); c.moveTo(Wd*px, Hh*0.18); c.lineTo(Wd*px+30, Hh*0.66); c.lineTo(Wd*px-30, Hh*0.66); c.closePath(); c.fill(); }
      say(c, "FRENCH CREEK PINES", Wd/2, Hh*0.30, Wd*0.62, Hh*0.26, "#f2e6c8", "800", "Georgia, serif");
      say(c, "CAMPGROUND & MOBILE HOME PARK", Wd/2, Hh*0.55, Wd*0.62, Hh*0.12, "#f2e6c8", "700", "Arial");
      say(c, "EST. 1968 · WELCOME CAMPERS · OFFICE IN THE HALL", Wd/2, Hh*0.76, Wd*0.66, Hh*0.09, "#e8d8b0", "600", "Arial"); }, sx, Y+1.75, sz-0.035, Math.PI, false, 680);
    addCol(sx-1.8, sx+1.8, sz-0.12, sz+0.12, Y-0.5, Y+2.5);
    for(let k=0;k<7;k++) S(0.18, sx-1.4+k*0.47, Y+0.12, sz-0.5, ["#c84a8a","#e8b030","#e85a3a","#f2f0ea"][k%4]); }
  // the mailboxes, a row on a plank by the drive; the speed sign; the street sign
  { const mx=GX-4.4, mz=Z+HW+4.0; B(0.10, 1.0, 0.10, mx-0.9, Y+0.5, mz, "#6a4a2e"); B(0.10, 1.0, 0.10, mx+0.9, Y+0.5, mz, "#6a4a2e"); B(2.1, 0.06, 0.4, mx, Y+1.03, mz, "#6a4a2e");
    for(let k=0;k<6;k++) RB(0.22, 0.24, 0.42, mx-0.75+k*0.30, Y+1.18, mz, ["#2a2a2c","#2a2a2c","#c84a2a","#2a2a2c","#e8e2d0","#2a4a6a"][k], 0, 0.08);
    addCol(mx-1.1, mx+1.1, mz-0.25, mz+0.25, Y-0.5, Y+1.3);
    const ssx=GX+3.2, ssz=Z+HW+6.0; C(0.035, 2.4, ssx, Y+1.2, ssz, "#a3a8aa", 8);
    sign(0.6, 0.75, (c,Wd,Hh)=>{ c.fillStyle="#f2f0ea"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#1a1a1a"; c.lineWidth=6; c.strokeRect(8,8,Wd-16,Hh-16);
      say(c, "SPEED", Wd/2, Hh*0.24, Wd*0.76, Hh*0.16, "#1a1a1a", "800", "Arial"); say(c, "LIMIT", Wd/2, Hh*0.42, Wd*0.76, Hh*0.16, "#1a1a1a", "800", "Arial");
      say(c, "5", Wd/2, Hh*0.70, Wd*0.6, Hh*0.34, "#1a1a1a", "900", "Arial"); }, ssx, Y+1.9, ssz-0.03, Math.PI, false, 240);
    sign(0.9, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#f2c41c"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#1a1a1a"; c.lineWidth=5; c.strokeRect(6,6,Wd-12,Hh-12);
      say(c, "KIDS & DOGS", Wd/2, Hh*0.36, Wd*0.78, Hh*0.26, "#1a1a1a", "800", "Arial"); say(c, "AT PLAY", Wd/2, Hh*0.68, Wd*0.78, Hh*0.24, "#1a1a1a", "800", "Arial"); }, ssx, Y+1.25, ssz-0.03, Math.PI, false, 300);
    addCol(ssx-0.1, ssx+0.1, ssz-0.1, ssz+0.1, Y-0.5, Y+2.4);
    const px=GX-3.2, pz=LZ-4.2; C(0.03, 2.6, px, Y+1.3, pz, "#a3a8aa", 8);
    for(const [ry, txt, dy] of [[0, "PINE LN", 2.45],[Math.PI/2, "HEMLOCK CT", 2.25]]) sign(0.95, 0.18, (c,Wd,Hh)=>{ c.fillStyle="#2a6a3a"; c.fillRect(0,0,Wd,Hh);
      say(c, txt, Wd/2, Hh/2, Wd*0.80, Hh*0.60, "#f2f0ea", "700", "Arial"); }, px, Y+dy, pz, ry, false, 380);
    addCol(px-0.08, px+0.08, pz-0.08, pz+0.08, Y-0.5, Y+2.6); }

  /* ======================================================================
     THE TRAILERS
     A single-wide, end on to the lane, up on its skirting: a living room at the lane end, the kitchen by the door, the
     bathroom and a hall, the bedroom at the back. x across it, d back from the lane end.
     ====================================================================== */
  const TW=4.3, TL=14.5, FYo=0.72, WT=0.10, CLH=2.2;
  const SIDINGS=["#e8e4da","#cfd8dc","#e0d4b8","#c8dcc8","#f0e4c8","#d8c8b8","#b8cad8","#e8dccc"];
  const TRIMS=["#2a4a6a","#5a2a22","#2e4a2e","#3a3a3c","#7a5a2a","#1f3f6a"];
  const QUILTS=["#7a2a22","#2a4a6a","#3a5a3a","#c8a050","#6a3a6a","#e8dcc0"];
  const SOFAS=["#5a4a3a","#4a5a6a","#6a3a2a","#3a4a3a","#7a6a5a","#2a3a5a"];
  let tno=0;
  function trailer(cx, za, dir, opt){
    const no=++tno; use("tr"+no);
    const x0=cx-TW/2, x1=cx+TW/2, zB=za+dir*TL, z0=Math.min(za, zB), z1=Math.max(za, zB), zc=(z0+z1)/2;
    const FY=Y+FYo, CL=FY+CLH, sd=d=>za+dir*d, rng=(d0, d1)=>[Math.min(sd(d0), sd(d1)), Math.max(sd(d0), sd(d1))];
    const sid=opt.siding||SIDINGS[no%SIDINGS.length], trim=opt.trim||TRIMS[no%TRIMS.length], r=_trng(no*131+7);
    const op=(d0, d1, sill, head)=>{ const [a, b]=rng(d0, d1); return {a:a, b:b, sill:FY+sill, head:FY+head}; };
    // openings: the door on the east side by the kitchen, windows down both sides, one in each end
    const DR=op(2.6, 3.52, -0.01, 2.0), E_OPS=[DR, op(4.6, 5.5, 1.0, 1.75), op(9.2, 9.8, 1.35, 1.8), op(11.6, 12.8, 0.85, 1.75)];
    const W_OPS=[op(0.9, 2.3, 0.85, 1.8), op(4.4, 5.4, 1.05, 1.75), op(11.6, 12.8, 0.85, 1.75)];
    const LE={a:cx-0.8, b:cx+0.8, sill:FY+0.85, head:FY+1.8}, BE={a:cx-0.5, b:cx+0.5, sill:FY+1.0, head:FY+1.7};
    // the shell: the long walls the full length, the ends between them; ribbed metal outside, panelling or plaster in
    const yb=FY-0.14, yt=CL+0.06;
    wall("wp_rib", "z", x1-WT/2, WT, z0, z1, yb, yt, E_OPS, sid, 0.5, FY);
    wall("wp_rib", "z", x0+WT/2, WT, z0, z1, yb, yt, W_OPS, sid, 0.5, FY);
    wall("wp_rib", "x", za, WT*dir*0 + WT, x0+WT, x1-WT, yb, yt, [LE], sid, 0.5, FY);
    wall("wp_rib", "x", zB, WT, x0+WT, x1-WT, yb, yt, [BE], sid, 0.5, FY);
    // (the end walls' planes are their centres at za and zB: inside they reach in WT/2, as the long walls do)
    const inZ0=z0+WT/2, inZ1=z1-WT/2, inX0=x0+WT, inX1=x1-WT;
    const wood=opt.panel!==false, lb=wood ? "wp_panel" : "wp_wall", lc=wood ? "#ffffff" : "#f2eee4";
    liner(lb, "z", inX1, -1, inZ0, inZ1, FY, CL, E_OPS, lc); liner(lb, "z", inX0, 1, inZ0, inZ1, FY, CL, W_OPS, lc);
    liner(lb, "x", za-dir*0+(dir>0 ? WT/2 : -WT/2), dir, inX0, inX1, FY, CL, [LE], lc);
    liner(lb, "x", zB+(dir>0 ? -WT/2 : WT/2), -dir, inX0, inX1, FY, CL, [BE], lc);
    // the floor, the ceiling, the roof with its crown; the skirting round the bottom, a band of trim along the top
    B(TW-2*WT, 0.14, TL-WT, cx, FY-0.07, zc, "#5a4a3a");
    push(opt.carpet===false ? "wp_vinyl" : "wp_carpet", planeGeo(TW-2*WT-0.02, TL-WT-0.02, 0), cx, FY+0.004, zc, 0, opt.carpet===false ? "#ffffff" : opt.carpetCol||"#9a9284", -Math.PI/2, 0);
    B(TW-2*WT, 0.04, TL-WT, cx, CL+0.02, zc, "#f2eee4");
    RB(TW+0.16, 0.10, TL+0.16, cx, CL+0.10, zc, "#c8c6c0", 0, 0.045);
    { const g=new T.CylinderGeometry(1, 1, TL+0.10, 28, 1, false, -Math.PI/2, Math.PI); g.rotateX(-Math.PI/2); g.scale(TW/2+0.04, 0.17, 1); ent(g, cx, CL+0.148, zc, "#dcdad4"); }
    for(const [xx, zz] of [[x0, z0],[x1, z0],[x0, z1],[x1, z1]]) RB(0.075, yt-yb+0.04, 0.075, xx, (yb+yt)/2, zz, "#d4d6d8", 0, 0.03);
    for(const [w, d, xx, zz, dt] of [[0.03, TL-0.1, x0+0.04, zc, 0],[0.03, TL-0.1, x1-0.04, zc, 0],[TW-0.1, 0.03, cx, z0+0.04, 0.012],[TW-0.1, 0.03, cx, z1-0.04, 0.012]])
      push("wp_skirt", boxGeo(w, FY-0.16-(Y-0.08), d, 0.5), xx, (FY-0.16+Y-0.08)/2-dt, zz, 0, opt.skirt||"#ffffff");
    { const ys=FY+0.32, sc=trim; B(0.012, 0.07, TL-0.12, x0-0.007, ys, zc, sc);
      const [ga, gb]=[DR.a-0.12, DR.b+0.12]; B(0.012, 0.07, ga-(z0+0.06), x1+0.007, ys, (z0+0.06+ga)/2, sc); B(0.012, 0.07, z1-0.06-gb, x1+0.007, ys, (gb+z1-0.06)/2, sc); }
    for(const xx of [x0-0.005, x1+0.005]) B(0.03, 0.10, TL+0.02, xx, CL+0.0, zc, trim);
    // the windows, the door's frame and the door; an awning over the door, the deck and its steps
    for(const o of E_OPS.slice(1)) windowAt("z", x1-WT/2, WT, o, 1, trim, ["#e8d8b0","#8a3a3a","#4a6a8a","#d8c8a8"][(r()*4)|0]);
    for(const o of W_OPS) windowAt("z", x0+WT/2, WT, o, -1, trim, ["#e8d8b0","#8a3a3a","#4a6a8a","#d8c8a8"][(r()*4)|0]);
    windowAt("x", za, WT, LE, -dir, trim, "#e8d8b0"); windowAt("x", zB, WT, BE, dir, trim, "#d8c8a8");
    const da=DR.a, db=DR.b;
    for(const [hh, ds, dy] of [[0.07, 0, DR.head+0.035]]) B(0.05, hh, db-da+0.16, x1+0.03, dy, (da+db)/2, trim);
    for(const zz of [da-0.035, db+0.035]) B(0.05, DR.head-FY, 0.07, x1+0.03, (FY+DR.head)/2, zz, trim);
    makeDoor(dir>0 ? XF(x1-WT/2, da+0.02, -Math.PI/2) : XF(x1-WT/2, db-0.02, Math.PI/2), 0, FY+0.01, 0, "LOT "+no, true, 0, null, new T.Color(opt.door||"#e8e4d8").getHex());
    // (the deck: a landing the height of the floor, rails, and the steps down the lane end's way)
    const dk={x0:x1, x1:x1+1.8, z0:Math.min(da, db)-0.9, z1:Math.max(da, db)+0.9};
    push("wp_deck", boxGeo(dk.x1-dk.x0-0.02, 0.06, dk.z1-dk.z0, 0.5), (dk.x0+dk.x1)/2+0.02, FY-0.03, (dk.z0+dk.z1)/2, 0, "#ffffff");
    for(const [xx, zz] of [[dk.x1-0.06, dk.z0+0.06],[dk.x1-0.06, dk.z1-0.06],[dk.x0+0.3, dk.z0+0.06],[dk.x0+0.3, dk.z1-0.06]]) B(0.10, FY-Y+0.96, 0.10, xx, (FY+Y+0.96)/2, zz, "#7a5a3a");
    const stepEnd=dir>0 ? dk.z0 : dk.z1, rz=dir>0 ? [dk.z1-0.06] : [dk.z0+0.06];
    B(0.05, 0.06, dk.z1-dk.z0, dk.x1-0.06, FY+0.92, (dk.z0+dk.z1)/2, "#7a5a3a"); for(const zz of rz) B(dk.x1-dk.x0-0.3, 0.06, 0.05, (dk.x0+dk.x1)/2+0.15, FY+0.92, zz, "#7a5a3a");
    addCol(dk.x1-0.1, dk.x1, dk.z0, dk.z1, Y-0.5, FY+0.96); for(const zz of rz) addCol(dk.x0+0.25, dk.x1, zz-0.04, zz+0.04, Y-0.5, FY+0.96);
    for(let zz=dk.z0+0.18; zz<dk.z1-0.1; zz+=0.13) B(0.035, 0.86, 0.035, dk.x1-0.06, FY+0.46, zz, "#8a6a4a");
    for(const zz of rz) for(let xx=dk.x0+0.45; xx<dk.x1-0.12; xx+=0.13) B(0.035, 0.86, 0.035, xx, FY+0.46, zz, "#8a6a4a");
    // the steps: four, toward the lane, beside the deck
    const nS=4, rise=(FY-Y)/nS, sx0=dk.x0+0.35, sx1=dk.x1-0.15;
    for(let k=0;k<nS;k++){ const zz=stepEnd-dir*(k+0.5)*0.28; push("wp_deck", boxGeo(sx1-sx0, 0.05, 0.28, 0.5), (sx0+sx1)/2, FY-(k+1)*rise, zz, 0, "#ffffff");
      B(sx1-sx0, FY-(k+1)*rise-Y+0.02, 0.04, (sx0+sx1)/2, (FY-(k+1)*rise+Y)/2, zz-dir*0.12, "#6a4a32"); }
    const sz0=Math.min(stepEnd, stepEnd-dir*nS*0.28), sz1=Math.max(stepEnd, stepEnd-dir*nS*0.28);
    addRamp(sx0, sx1, sz0, sz1, "z", stepEnd-dir*nS*0.28, stepEnd, Y+0.02, FY);
    addFlat(inX0, dk.x1, inZ0, inZ1, FY); addFlat(dk.x0-0.05, dk.x1, dk.z0, dk.z1, FY);
    // the awning, striped canvas on two poles over the deck
    { const ac=["#2a6a9a","#c84a2a","#3a7a3a","#c8a030"][no%4], ax0=x1+0.02, ax1=x1+2.0, ay0=FY+2.1, ay1=FY+1.85;
      for(let k=0;k<8;k++){ const z0a=dk.z0+(dk.z1-dk.z0)*k/8, z1a=dk.z0+(dk.z1-dk.z0)*(k+1)/8;
        face("paintm", [V3(ax0, ay0, z0a), V3(ax1, ay1, z0a), V3(ax1, ay1, z1a), V3(ax0, ay0, z1a)], V3(0.12, 1, 0), k%2 ? ac : "#f2f0ea"); }
      for(const zz of [dk.z0+0.05, dk.z1-0.05]) C(0.025, ay1-FY+0.02, ax1-0.03, (ay1+FY)/2, zz, "#a8acb0", 8);
      addRoof(ax0, ax1, dk.z0, dk.z1, ay1); }
    // the porch light by the door
    { const lz=dir>0 ? db+0.25 : da-0.25; B(0.10, 0.16, 0.06, x1+0.06, FY+1.95, lz, "#2a2a2c"); push("cafe_string", new T.SphereGeometry(0.04, 8, 6), x1+0.12, FY+1.92, lz, 0, "#ffffff");
      LAMPS.push({x:x1+0.5, y:FY+1.9, z:lz, color:0xffd8a0, intensity:0.45, dist:7, decay:1.5}); }
    // the partitions: across at d 8.4 (into the hall at the west side) and d 10.8 (the bedroom's door), the bathroom's
    // side along the hall
    const dA=8.4, dBd=10.8, xb=cx-0.75, PT=0.08;
    const zA=sd(dA), zBb=sd(dBd);
    const hallDoor={a:inX0+0.08, b:inX0+1.0, sill:FY-0.01, head:FY+2.0};
    wall("wp_wall", "x", zA, PT, inX0, inX1, FY, CL, [hallDoor], "#f2eee4", 0.5, FY);
    wall("wp_wall", "x", zBb, PT, inX0, inX1, FY, CL, [{a:inX0+0.08, b:inX0+1.0, sill:FY-0.01, head:FY+2.0}], "#f2eee4", 0.5, FY);
    { const [a, b]=rng(dA, dBd), bd={a:(a+b)/2-0.38, b:(a+b)/2+0.38, sill:FY-0.01, head:FY+2.0};
      wall("wp_wall", "z", xb, PT, a+PT/2, b-PT/2, FY, CL, [bd], "#f2eee4", 0.5, FY);
      makeDoor(XF(xb, bd.a+0.02, -Math.PI/2), 0, FY+0.01, 0, "THE BATHROOM", true, 0.3, "closet", 0xf0ece2); }
    makeDoor(XF(hallDoor.a+0.02, zBb, dir>0 ? 0 : Math.PI), 0, FY+0.01, 0, "THE BEDROOM", true, 0.35, "closet", 0xf0ece2);
    // the rooms
    const at=(x, d)=>[x, sd(d)], fy=FY;
    const F=(x, d, ry)=>{ const xf=XF(x, sd(d), ry); return { b:(w,h,dd,lx,ly,lz,c)=>B(w,h,dd, xf.x(lx,lz), fy+ly, xf.z(lx,lz), c, ry), f:(w,h,dd,lx,ly,lz,c,rad)=>RB(w,h,dd, xf.x(lx,lz), fy+ly, xf.z(lx,lz), c, ry, rad||0.05),
      col:(w,dd,lx,lz,h)=>{ const px=xf.x(lx,lz), pz=xf.z(lx,lz), sw=Math.abs(Math.sin(ry))>0.5; addCol(px-(sw?dd:w)/2, px+(sw?dd:w)/2, pz-(sw?w:dd)/2, pz+(sw?w:dd)/2, fy-0.06, fy+(h||0.9)); },
      seat:(lx,lz,label,drop)=>{ addSeat(xf.x(lx,lz), xf.z(lx,lz), fy, ry+Math.PI, label, false, drop); }, x:(lx,lz)=>xf.x(lx,lz), z:(lx,lz)=>xf.z(lx,lz) }; };
    const faceE=-Math.PI/2, faceW=Math.PI/2, faceLane=dir>0 ? Math.PI : 0, faceBack=dir>0 ? 0 : Math.PI;
    // living room: the sofa along the west wall facing east, the coffee table, the TV on the east wall, a recliner in the corner
    { const so=F(inX0+0.46, 2.2, faceW), sc=SOFAS[(r()*SOFAS.length)|0];
      so.f(1.9, 0.42, 0.84, 0, 0.21, 0, sc); so.f(1.9, 0.48, 0.20, 0, 0.62, -0.32, sc); for(const s2 of [-1,1]) so.f(0.18, 0.26, 0.84, s2*0.86, 0.52, 0, sc);
      so.col(1.9, 0.84, 0, 0, 0.9); for(const lx of [-0.45, 0.45]) so.seat(lx, 0.08, "THE SOFA");
      so.f(0.42, 0.36, 0.12, -0.55, 0.62, -0.18, ["#c8b088","#8a3a3a","#e0d8c8"][(r()*3)|0], 0.05);
      const ct=F(cx-0.1, 2.2, faceW); ct.b(0.9, 0.04, 0.5, 0, 0.42, 0, "#6a4a2e"); for(const a2 of [-0.38, 0.38]) for(const b2 of [-0.2, 0.2]) ct.b(0.04, 0.40, 0.04, a2, 0.2, b2, "#5a3a22"); ct.col(0.9, 0.5, 0, 0, 0.44);
      ct.b(0.2, 0.03, 0.14, 0.2, 0.455, 0, "#2a4a6a"); ct.b(0.08, 0.10, 0.08, -0.2, 0.49, 0.05, "#e8e4da");
      const tv=F(inX1-0.24, 1.6, faceE); tv.b(1.1, 0.5, 0.40, 0, 0.25, 0, "#4a3020"); tv.b(0.95, 0.56, 0.05, 0, 0.82, -0.04, "#141618");
      push("lk_tv", planeGeo(0.88, 0.49, 0), tv.x(0, -0.012), fy+0.82, tv.z(0, -0.012), faceE, "#ffffff"); tv.col(1.1, 0.4, 0, 0, 1.1);
      const rc=F(inX0+0.5, 0.65, faceBack+0.5), rcol=SOFAS[(r()*SOFAS.length)|0];
      rc.f(0.82, 0.42, 0.82, 0, 0.21, 0, rcol); rc.f(0.82, 0.55, 0.2, 0, 0.66, -0.31, rcol); for(const s2 of [-1,1]) rc.f(0.16, 0.24, 0.82, s2*0.33, 0.52, 0, rcol);
      rc.col(0.82, 0.82, 0, 0, 0.9); rc.seat(0, 0.08, "THE RECLINER");
      // a picture or two, a clock, a lamp on a table by the recliner
      for(const [d2, c2] of [[3.6, "#4a7a9a"],[1.2, "#c8a050"]]){ B(0.03, 0.42, 0.56, inX0+0.025, fy+1.45, sd(d2), "#3a2a1a"); B(0.02, 0.36, 0.50, inX0+0.04, fy+1.45, sd(d2), c2); }
      C(0.14, 0.03, inX1-0.02, fy+1.6, sd(3.9), "#f2f0ea", 18, 0, 0, Math.PI/2); C(0.15, 0.02, inX1-0.012, fy+1.6, sd(3.9), "#5a3a22", 18, 0, 0, Math.PI/2);
      B(0.006, 0.09, 0.012, inX1-0.039, fy+1.635, sd(3.9), "#1a1a1a"); B(0.006, 0.012, 0.11, inX1-0.039, fy+1.6, sd(3.9)+0.05, "#1a1a1a"); }
    // the kitchen: the counter along the west wall under its window, the range, the fridge, the dinette by the door
    { const kc=F(inX0+0.31, 6.05, faceW), cab=["#e8e2d0","#8a6a4a","#c8d0c8","#e8dcc0"][(r()*4)|0];
      kc.b(2.7, 0.86, 0.60, 0, 0.43, 0, cab); kc.b(2.72, 0.04, 0.63, 0, 0.88, 0.01, "#5a5450");
      for(const x2 of [-1.05, -0.45, 0.15]) kc.b(0.56, 0.62, 0.012, x2, 0.42, 0.302, cab);
      kc.b(0.62, 0.006, 0.42, -0.95, 0.902, 0.04, "#c8ccd0"); { const [ua, ub]=rng(5.55, 7.4); B(0.34, 0.70, ub-ua, inX0+0.18, fy+1.86, (ua+ub)/2, cab); B(0.012, 0.49, ub-ua, inX0+0.018, fy+1.153, (ua+ub)/2, "#c8d8d0");
        for(let k=0;k<3;k++) B(0.012, 0.6, (ub-ua)/3-0.04, inX0+0.358, fy+1.86, ua+(k+0.5)*(ub-ua)/3, cab); push("wp_glowbox", boxGeo(0.06, 0.02, ub-ua-0.2), inX0+0.3, fy+1.495, (ua+ub)/2, 0, "#ffffff"); }
      kc.b(0.72, 0.90, 0.6, 0.9, 0.45, 0.01, "#ece9e2"); kc.b(0.70, 0.012, 0.56, 0.9, 0.912, 0.01, "#1a1a1c");
      kc.col(2.7, 0.63, 0, 0.01, 0.95);
      const fr=F(inX1-0.40, 8.0, faceE); fr.f(0.78, 1.72, 0.70, 0, 0.86, 0, "#ece9e2", 0.03); fr.b(0.74, 0.012, 0.012, 0, 1.16, 0.355, "#c8c4ba"); fr.col(0.78, 0.7, 0, 0, 1.75);
      const dn=F(inX1-0.45, 5.2, faceE), tc=["#e8e2d0","#6a4a2e","#c8c0b0"][(r()*3)|0];
      dn.b(0.75, 0.04, 1.0, 0, 0.74, 0, tc); dn.b(0.06, 0.72, 0.06, 0, 0.36, 0, "#8a8d90"); dn.col(0.75, 1.0, 0, 0, 0.76);
      for(const s2 of [-1,1]){ const ch=F(dn.x(0, s2*0.0)+0, 5.2+s2*0.75*dir*0, faceE); }
      for(const s2 of [-1,1]){ const xx=inX1-0.45, d2=5.2+s2*0.78, chf=F(xx, d2, s2*dir>0 ? faceBack : faceLane);
        chf.b(0.42, 0.05, 0.42, 0, 0.45, 0, "#8a3a2a"); chf.b(0.40, 0.42, 0.04, 0, 0.70, -0.19, "#8a8d90"); for(const a2 of [-0.18, 0.18]) for(const b2 of [-0.18, 0.18]) chf.b(0.025, 0.44, 0.025, a2, 0.22, b2, "#8a8d90");
        chf.col(0.44, 0.44, 0, 0, 0.5); chf.seat(0, 0.05, "A CHAIR AT THE TABLE"); }
      LAMPS.push({x:cx, y:CL-0.2, z:sd(5.5), color:0xfff0d8, intensity:0.55, dist:5, decay:1.5, indoor:true, vol:[x0, x1, z0, z1, FY-0.5, CL+0.2]}); }
    // the bathroom: the tub across the back, the toilet, the vanity
    { const [a, b]=rng(dA, dBd), bx2=(xb+inX1)/2;
      B(inX1-xb-0.1, 0.52, 0.72, bx2, fy+0.26, dir>0 ? b-0.42 : a+0.42, "#f4f2ee"); addCol(xb+0.05, inX1, dir>0 ? b-0.8 : a, dir>0 ? b : a+0.8, fy-0.06, fy+0.55);
      push("porcelain", new T.CylinderGeometry(0.19, 0.15, 0.40, 16).scale(1, 1, 1.2), inX1-0.32, fy+0.20, (a+b)/2, 0, "#ffffff"); addCol(inX1-0.6, inX1, (a+b)/2-0.25, (a+b)/2+0.25, fy-0.06, fy+0.45);
      B(0.5, 0.80, 0.6, inX1-0.30, fy+0.40, dir>0 ? a+0.38 : b-0.38, "#e8e2d0"); push("mirror", planeGeo(0.5, 0.6, 0), inX1-0.012, fy+1.45, dir>0 ? a+0.38 : b-0.38, -Math.PI/2, "#ffffff");
      addCol(inX1-0.55, inX1, dir>0 ? a+0.05 : b-0.7, dir>0 ? a+0.7 : b-0.05, fy-0.06, fy+0.85);
      LAMPS.push({x:bx2, y:CL-0.2, z:(a+b)/2, color:0xfff4e0, intensity:0.4, dist:3.5, decay:1.6, indoor:true, vol:[xb, x1, a, b, FY-0.5, CL+0.2]}); }
    // the bedroom: the bed against the back wall, a dresser, a nightstand with a lamp
    { const bd2=F(cx+0.3, 13.3, faceLane), qc=QUILTS[(r()*QUILTS.length)|0];
      bd2.b(1.5, 0.30, 2.0, 0, 0.17, 0, "#5a3a22"); bd2.f(1.42, 0.22, 1.96, 0, 0.42, 0.01, "#f2f0ea", 0.06); bd2.f(1.46, 0.06, 1.4, 0, 0.55, 0.3, qc, 0.03);
      for(const s2 of [-1,1]) bd2.f(0.6, 0.13, 0.34, s2*0.36, 0.60, -0.72, "#f4f2ec", 0.05); bd2.b(1.56, 0.9, 0.06, 0, 0.45, -1.02, "#5a3a22");
      bd2.col(1.56, 2.05, 0, 0, 0.7); bd2.seat(0, 0.2, "THE BED");
      const dr=F(inX0+0.27, 12.95, faceW); dr.b(1.0, 0.84, 0.48, 0, 0.42, 0, "#6a4a2e"); for(let k=0;k<3;k++) dr.b(0.9, 0.22, 0.012, 0, 0.14+k*0.25, 0.242, "#4a3020"); dr.col(1.0, 0.48, 0, 0, 0.9);
      const ns=F(cx+1.35, 13.9, faceLane); ns.b(0.42, 0.52, 0.38, 0, 0.26, 0, "#6a4a2e"); ns.col(0.42, 0.38, 0, 0, 0.6);
      CT(0.08, 0.13, 0.18, ns.x(0,0), fy+0.70, ns.z(0,0), "#e8d8b0");
      LAMPS.push({x:cx, y:CL-0.2, z:sd(12.6), color:0xffe2b0, intensity:0.5, dist:4.5, decay:1.6, indoor:true, vol:[x0, x1, z0, z1, FY-0.5, CL+0.2]}); }
    LAMPS.push({x:cx, y:CL-0.2, z:sd(2.0), color:0xffe6c0, intensity:0.55, dist:5, decay:1.5, indoor:true, vol:[x0, x1, z0, z1, FY-0.5, CL+0.2]});
    addZone(x0, x1, z0, z1, FY-0.5, CL+0.1, "LOT "+no+" · THE TRAILER", true);
    // the lot: the gravel pad by the deck, a car on it, the fire ring and chairs, a picnic table, string lights, flowers
    use("site");
    const px0=dk.x1+0.6, px1=px0+5.2, pza=sd(0.2), pzb=sd(9.0);
    gravel(px0, px1, Math.min(pza, pzb), Math.max(pza, pzb));
    if(opt.car) parked(opt.car[0], opt.car[1], (px0+px1)/2, sd(4.2), dir>0 ? 0 : Math.PI, Y);
    // fire ring and chairs out by the lane end
    { const fx=x0-2.4, fz=sd(-1.2+0*dir)+dir*0; const frz=sd(3.0);
      for(let k=0;k<10;k++){ const a=k/10*6.283; push("rock", rockGeo(0.13, 400+no*10+k), fx+Math.cos(a)*0.55, Y+0.06, frz+Math.sin(a)*0.55, a, "#8d887e"); }
      C(0.42, 0.03, fx, Y+0.02, frz, "#2a2624", 18); addCol(fx-0.65, fx+0.65, frz-0.65, frz+0.65, Y-0.5, Y+0.3);
      for(const [a, ch] of [[0.6, "#2a6a9a"],[2.4, "#c84a2a"],[4.2, "#3a7a3a"]]){ const sx=fx+Math.cos(a)*1.5, sz=frz+Math.sin(a)*1.5, ry=Math.atan2(fx-sx, frz-sz);
        const f=XF(sx, sz, ry), qq=(w,h,d,lx,ly,lz,c,rd)=>RB(w,h,d, f.x(lx,lz), Y+ly, f.z(lx,lz), c, ry, rd||0.012);
        // a folding camp chair: the canvas seat sagging between its arms, the back leaning, a cup holder in one arm, the X of its legs
        qq(0.48, 0.05, 0.44, 0, 0.35, 0, ch, 0.02); qq(0.48, 0.55, 0.05, 0, 0.68, -0.25, ch, 0.02);
        for(const s2 of [-1,1]){ qq(0.06, 0.03, 0.46, s2*0.27, 0.58, -0.01, "#2a2a2c"); tubeE(V3(f.x(s2*0.26, 0.22), Y, f.z(s2*0.26, 0.22)), V3(f.x(s2*0.26, -0.24), Y+0.58, f.z(s2*0.26, -0.24)), 0.011, "#5a5e60");
          tubeE(V3(f.x(s2*0.26, -0.24), Y, f.z(s2*0.26, -0.24)), V3(f.x(s2*0.26, 0.22), Y+0.58, f.z(s2*0.26, 0.22)), 0.011, "#5a5e60"); }
        C(0.04, 0.06, f.x(0.27, 0.16), Y+0.57, f.z(0.27, 0.16), "#2a2a2c", 10);
        addCol(sx-0.3, sx+0.3, sz-0.3, sz+0.3, Y-0.5, Y+0.5); addSeat(sx, sz, Y, ry+Math.PI, "A CAMP CHAIR BY THE FIRE"); } }
    // the picnic table behind the fire, toward the back
    { const tx2=x0-2.2, tz=sd(7.2), f=XF(tx2, tz, 0);
      for(let k=0;k<5;k++) RB(0.152, 0.05, 1.8, tx2-0.32+k*0.16, Y+0.74, tz, ["#8a6a4a","#84644a","#8e6e4c"][k%3], 0, 0.015);
      for(const s2 of [-1,1]){ for(let k=0;k<2;k++) RB(0.125, 0.04, 1.8, tx2+s2*(0.55+k*0.135), Y+0.44, tz, "#8a6a4a", 0, 0.012);
        for(const e of [-0.7, 0.7]){ tubeE(V3(tx2+s2*0.72, Y, tz+e), V3(tx2+s2*0.06, Y+0.72, tz+e), 0.035, "#6a4a32"); } }
      for(const e of [-0.7, 0.7]) RB(1.5, 0.06, 0.08, tx2, Y+0.40, tz+e, "#6a4a32", 0, 0.015);
      addCol(tx2-0.4, tx2+0.4, tz-0.9, tz+0.9, Y-0.5, Y+0.76); for(const s2 of [-1,1]) addSeat(tx2+s2*0.62, tz, Y, s2>0 ? -Math.PI/2 : Math.PI/2, "THE PICNIC TABLE", false, 0.72);
      const cl=["#c84a2a","#e8e2d0","#2a6a9a"][(r()*3)|0]; B(0.72, 0.004, 1.2, tx2, Y+0.768, tz, cl); }
    // string lights from a hook under the west eave out over the fire ring to a post at its far side
    { const a=V3(x0-0.06, CL-0.05, sd(0.8)), b=V3(x0-3.8, Y+2.4, sd(5.4)); B(0.04, 0.04, 0.10, x0-0.03, CL-0.05, sd(0.8), "#3a3a3c");
      C(0.05, 2.5, b.x, Y+1.25, b.z, "#6a4a2e", 8); addCol(b.x-0.08, b.x+0.08, b.z-0.08, b.z+0.08, Y-0.5, Y+2.5);
      const n=14; for(let k=1;k<n;k++){ const t=k/n, sag=Math.sin(t*Math.PI)*0.45, p=a.clone().lerp(b, t); p.y-=sag;
        push("cafe_string", new T.SphereGeometry(0.035, 8, 6), p.x, p.y, p.z, 0, "#ffffff"); }
      for(let k=0;k<n;k++){ const t0=k/n, t1=(k+1)/n, p0=a.clone().lerp(b, t0), p1=a.clone().lerp(b, t1); p0.y-=Math.sin(t0*Math.PI)*0.45; p1.y-=Math.sin(t1*Math.PI)*0.45; tubeE(p0, p1, 0.004, "#1a1a1a"); } }
    // flowers along the skirting by the lane end, and a flag on the deck post now and then
    for(let k=0;k<6;k++) S(0.13+r()*0.06, x0+0.4+k*0.6, Y+0.12, za-dir*0.5, ["#e85a3a","#f2c41c","#c84a8a","#f2f0ea","#e8862a"][(r()*5)|0]);
    for(let k=0;k<6;k++) S(0.1, x0+0.4+k*0.6, Y+0.06, za-dir*0.62, "#3e6a2a");
    if(opt.flag) { C(0.015, 1.5, dk.x1-0.06, FY+1.6, dk.z0+0.06, "#c8c8c8", 6);
      sign(0.6, 0.38, opt.flag, dk.x1+0.24, FY+2.1, dk.z0+0.06, 0, false, 240); }
    addCol(x0, x1, z0, z1, Y-0.5, FY-0.02);                                       // (the skirting: solid under the floor)
    WESTPARK.trailers.push({no:no, sid:sid, trim:trim, dk:dk, CL:CL, inX0:inX0, inX1:inX1, xb:xb, sd:sd, rng:rng, stepEnd:stepEnd, rz:rz[0], px0:px0, px1:px1, car:!!opt.car, da:da, db:db,
      x:cx, za:za, dir:dir, x0:x0, x1:x1, z0:z0, z1:z1, FY:FY, door:{x:x1+0.9, z:(da+db)/2}, steps:{x:(sx0+sx1)/2, z:stepEnd-dir*(nS*0.28+0.6)}});
  }
  const flagUS=(c,Wd,Hh)=>{ for(let k=0;k<13;k++){ c.fillStyle=k%2 ? "#f2f0ea" : "#b22234"; c.fillRect(0, k*Hh/13, Wd, Hh/13+1); }
    c.fillStyle="#3c3b6e"; c.fillRect(0, 0, Wd*0.4, Hh*7/13); c.fillStyle="#f2f0ea"; for(let i=0;i<5;i++) for(let j=0;j<4;j++){ c.beginPath(); c.arc(8+i*18, 8+j*16, 2.2, 0, 7); c.fill(); } };
  const flagPSU=(c,Wd,Hh)=>{ c.fillStyle="#1e407c"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#f2f0ea"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.16, Hh*0.30, 0, 0, 7); c.fill(); };
  const flagSteel=(c,Wd,Hh)=>{ c.fillStyle="#1a1a1a"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#f2c41c"; c.fillRect(0, Hh*0.42, Wd, Hh*0.16); };
  // the lots: north of the lane, end on to it from the north; south of it, from the south
  const L_N=LZ-3.8, L_S=LZ+3.8;
  const CARS=[[0,"#9aa0a6"],[2,"#7a1a1a"],[3,"#2a4a6a"],[0,"#e8e2d0"],[2,"#2e4a2e"],[0,"#4a4a4e"]];
  [[-1214, L_N, -1, {car:CARS[0], flag:flagUS}], [-1182, L_N, -1, {panel:false, carpet:false}], [-1150, L_N, -1, {car:CARS[1]}],
   [-1076, L_N, -1, {car:CARS[2], flag:flagPSU}], [-1044, L_N, -1, {panel:false}], [-1010, L_N, -1, {car:CARS[3]}],
   [-1214, L_S, 1, {car:CARS[4]}], [-1182, L_S, 1, {flag:flagSteel, panel:false}], [-1150, L_S, 1, {car:CARS[5]}],
   [-1118, L_S, 1, {carpet:false}], [-1076, L_S, 1, {car:[3,"#c84a2a"], flag:flagUS}], [-1040, L_S, 1, {panel:false, car:[2,"#d8d0c0"]}]]
    .forEach(([x, za, dir, o])=>trailer(x, za, dir, o));

  /* ======================================================================
     OUT THE BACK: tent pads and a camper, the common fire, the horseshoe pit, the swing set; trees between the lots
     ====================================================================== */
  use("site");
  { // the tent pads in the south-west: a tent, a fire ring, a table each
    for(const [tx2, tz] of [[-1220, -1100],[-1196, -1088],[-1172, -1100]]){
      const tc=["#2e6a3a","#c8641a","#2a5a8a"][((tx2+tz)|0)%3>=0 ? ((-tx2)|0)%3 : 0];
      const g=new T.SphereGeometry(1.4, 16, 8, 0, Math.PI*2, 0, Math.PI/2); g.scale(1.1, 0.85, 0.95); ent(g, tx2, Y+0.01, tz, tc);
      B(0.6, 0.9, 0.02, tx2, Y+0.45, tz-1.32, "#1a2a1a"); addCol(tx2-1.5, tx2+1.5, tz-1.3, tz+1.3, Y-0.5, Y+1.2);
      for(let k=0;k<8;k++){ const a=k/8*6.283; push("rock", rockGeo(0.12, 900+k+Math.abs(tx2|0)%97), tx2+3.0+Math.cos(a)*0.5, Y+0.05, tz+Math.sin(a)*0.5, a, "#8d887e"); }
      addCol(tx2+2.4, tx2+3.6, tz-0.6, tz+0.6, Y-0.5, Y+0.3); }
    // the camper: a canned-ham trailer, two-tone, rounded, its door and its windows
    { const cx2=-1140, cz2=-1092, L=4.6, Wd=2.1, H=2.2, f=XF(cx2, cz2, 0.3);
      ent(rboxGeo(Wd, H-0.4, L, 0.5, 3), f.x(0,0), Y+0.45+(H-0.4)/2, f.z(0,0), "#e8e2d0", 0, 0.3, 0);
      ent(rboxGeo(Wd+0.02, 0.62, L+0.02, 0.28, 3), f.x(0,0), Y+0.75, f.z(0,0), "#2a8a8a", 0, 0.3, 0);
      for(const lz of [-1.2, 1.2]) C(0.3, 0.2, f.x(Wd/2+0.05, lz), Y+0.3, f.z(Wd/2+0.05, lz), "#1a1a1a", 16, 0, 0.3, Math.PI/2);
      B(0.04, 0.5, 0.9, f.x(Wd/2+0.01, -0.6), Y+1.6, f.z(Wd/2+0.01, -0.6), "#1e2a36", 0.3); B(0.04, 1.5, 0.6, f.x(Wd/2+0.01, 1.0), Y+1.25, f.z(Wd/2+0.01, 1.0), "#c8c4b8", 0.3);
      addCol(cx2-1.8, cx2+1.8, cz2-2.6, cz2+2.6, Y-0.5, Y+H); }
    // the common fire in the south-east: a big ring, log benches round it
    { const fx=-1000, fz=-1100;
      for(let k=0;k<16;k++){ const a=k/16*6.283; push("rock", rockGeo(0.16, 700+k), fx+Math.cos(a)*1.0, Y+0.07, fz+Math.sin(a)*1.0, a, "#7a766d"); }
      C(0.85, 0.03, fx, Y+0.02, fz, "#2a2624", 22); addCol(fx-1.1, fx+1.1, fz-1.1, fz+1.1, Y-0.5, Y+0.3);
      for(let k=0;k<5;k++){ const a=k/5*6.283+0.3, bx3=fx+Math.cos(a)*3.0, bz=fz+Math.sin(a)*3.0, ry=Math.atan2(fx-bx3, fz-bz);
        push("logbark", FOREST.barkCyl(0.2, 0.2, 2.2, 9), bx3, Y+0.2, bz, ry, "#5a4a3a", 0, Math.PI/2);
        const sx=Math.cos(ry), sz=-Math.sin(ry); addCol(bx3-Math.abs(sx)*1.1-0.25, bx3+Math.abs(sx)*1.1+0.25, bz-Math.abs(sz)*1.1-0.25, bz+Math.abs(sz)*1.1+0.25, Y-0.5, Y+0.42);
        addSeat(bx3, bz, Y+0.0, Math.atan2(fx-bx3, fz-bz)+Math.PI, "THE LOG BENCH", false, 0.86); } }
    // the horseshoe pit: two stakes in sand boxes forty feet apart
    { const hx=-1040, hz=-1088; for(const dz of [-6.1, 6.1]){ B(1.2, 0.12, 1.4, hx, Y+0.04, hz+dz, "#c8b48a"); C(0.015, 0.4, hx, Y+0.25, hz+dz, "#5a5e60", 6); }
      for(let k=0;k<4;k++) ent(new T.TorusGeometry(0.09, 0.012, 6, 14, 5.2), hx+0.3+k*0.2, Y+0.11+0.012, hz+6.4, k%2 ? "#8a8d90" : "#c8a050", Math.PI/2, k, 0); }
    // the swing set: an A-frame, three swings
    { const sx=-1070, sz=-1080, Wd=4.2, Hh=2.4;
      for(const dx of [-Wd/2, Wd/2]) for(const dz of [-0.8, 0.8]) tubeE(V3(sx+dx, Y, sz+dz), V3(sx+dx, Y+Hh, sz), 0.04, "#2a6a3a");
      tubeE(V3(sx-Wd/2, Y+Hh, sz), V3(sx+Wd/2, Y+Hh, sz), 0.045, "#2a6a3a");
      for(const dx of [-1.2, 0, 1.2]){ for(const e of [-0.22, 0.22]) tubeE(V3(sx+dx+e, Y+Hh, sz), V3(sx+dx+e, Y+0.5, sz), 0.006, "#8a8d90"); B(0.5, 0.03, 0.2, sx+dx, Y+0.5, sz, ["#c84a2a","#2a6a9a","#e8c030"][(dx+1.2)/1.2]); }
      addCol(sx-Wd/2-0.1, sx+Wd/2+0.1, sz-0.9, sz+0.9, Y-0.5, Y+0.3); for(const dx of [-Wd/2, Wd/2]) addCol(sx+dx-0.12, sx+dx+0.12, sz-0.9, sz+0.9, Y-0.5, Y+Hh); }
    // a few pole lights along the lane
    for(const lx of [-1200, -1130, -1060, -995]){ const lz=LZ-3.4; C(0.07, 4.2, lx, Y+2.1, lz, "#5a4a36", 10); B(0.6, 0.06, 0.06, lx+0.3, Y+4.0, lz, "#5a4a36");
      CT(0.05, 0.16, 0.12, lx+0.58, Y+3.9, lz, "#3a3a3c"); push("cafe_string", new T.SphereGeometry(0.05, 8, 6), lx+0.58, Y+3.82, lz, 0, "#ffffff");
      addCol(lx-0.1, lx+0.1, lz-0.1, lz+0.1, Y-0.5, Y+4.2); LAMPS.push({x:lx+0.58, y:Y+3.8, z:lz, color:0xffd8a0, intensity:0.9, dist:16, decay:1.5}); }
    // the dumpster by the hall's lot
    { const dx=-1144, dz=-1188.5; B(1.8, 1.25, 1.2, dx, Y+0.63, dz, "#2a5a3a"); B(1.84, 0.06, 1.24, dx, Y+1.29, dz, "#1a3a2a"); addCol(dx-0.92, dx+0.92, dz-0.62, dz+0.62, Y-0.5, Y+1.3); } }
  // the trees: tall white pines and hemlocks and maples between the lots and round the back, and the woods' edge real
  // several rows deep all the way round (07's shell stays low under it), each with a trunk you cannot walk through
  { const tree=(sp, x, z, s)=>{ if(typeof FOREST==="undefined") return; FOREST.plant(sp, x, z, {scale:s}); const g=Terrain.groundAt(x,z), rr=0.22*s; addCol(x-rr, x+rr, z-rr, z+rr, g-0.5, g+6); };
    const clear=(x, z)=>{ for(const t of WESTPARK.trailers) if(x>t.x0-4.8 && x<t.x1+8.8 && z>t.z0-2.5 && z<t.z1+2.5) return false;
      if(Math.abs(z-LZ)<6 || (Math.abs(x-GX)<5 && z<LZ)) return false;
      if(x>W.hall.x0-6 && x<W.hall.x1+6 && z<W.hall.z1+6) return false;
      if(z<P.z0+3) return false;
      for(const [cx3, cz3, rr] of [[-1220,-1100,5],[-1196,-1088,5],[-1172,-1100,5],[-1140,-1092,4],[-1000,-1100,6],[-1040,-1088,8],[-1070,-1080,4]]) if(Math.hypot(x-cx3, z-cz3)<rr) return false;
      return true; };
    const qt=_trng(9393);
    for(let x=P.x0+2; x<P.x1-2; x+=7) for(let z=P.z0+3; z<P.z1-2; z+=7){ const xx=x+(qt()-0.5)*4, zz=z+(qt()-0.5)*4; if(qt()<0.45 || !clear(xx, zz)) continue;
      tree(qt()<0.4 ? "hemlock" : "hard", xx, zz, 0.85+qt()*0.5); }
    // the belt round the clearing and along the road's clearing to it, forty metres deep
    for(let x=P.x0-40; x<P.x1+40; x+=6.5) for(let z=P.z0-50; z<P.z1+44; z+=6.5){
      const xx=x+(qt()-0.5)*3, zz=z+(qt()-0.5)*3, inP=xx>P.x0-1 && xx<P.x1+1 && zz>P.z0-4 && zz<P.z1+1, inR=Math.abs(zz-Z)<HW+7;
      if(inP || inR || qt()<0.18) continue; tree(qt()<0.35 ? "hemlock" : "hard", xx, zz, 0.9+qt()*0.5); } }

  /* ======================================================================
     THE COMMUNITY HALL
     ====================================================================== */
  use("hall");
  const H=W.hall, HFY=Y+0.45, HCL=HFY+2.9, HWT=0.2, hx0=H.x0, hx1=H.x1, hz0=H.z0, hz1=H.z1;
  const RIDGE=HCL+1.7, EAVE=HCL+0.2;
  const ND={a:-1123.0, b:-1122.0, sill:HFY-0.01, head:HFY+2.1};                                     // the front door, on the north side
  const NW=[{a:-1130.0, b:-1128.4, sill:HFY+0.9, head:HFY+2.1},{a:-1126.6, b:-1125.0, sill:HFY+0.9, head:HFY+2.1},
            {a:-1119.8, b:-1118.2, sill:HFY+0.9, head:HFY+2.1},{a:-1115.4, b:-1113.8, sill:HFY+0.9, head:HFY+2.1}];
  const SW=[{a:-1130.0, b:-1128.4, sill:HFY+0.9, head:HFY+2.1},{a:-1126.0, b:-1124.4, sill:HFY+0.9, head:HFY+2.1},{a:-1121.6, b:-1120.0, sill:HFY+0.9, head:HFY+2.1}];
  const WWn=[{a:-1180.6, b:-1179.0, sill:HFY+0.9, head:HFY+2.1},{a:-1177.0, b:-1175.4, sill:HFY+0.9, head:HFY+2.1}];
  // the foundation: block from the basement floor up to the floor, all round the hole in the ground (04's WEST_HOLES)
  const BF=Y-3.0, BCL=BF+2.55;
  wall("block", "x", hz0+HWT/2, HWT, hx0, hx1, BF-0.1, HFY-0.12, [], "#8a8478", 0.5, BF);
  wall("block", "x", hz1-HWT/2, HWT, hx0, hx1, BF-0.1, HFY-0.12, [], "#8a8478", 0.5, BF);
  wall("block", "z", hx0+HWT/2, HWT, hz0+HWT, hz1-HWT, BF-0.1, HFY-0.12, [], "#8a8478", 0.5, BF);
  wall("block", "z", hx1-HWT/2, HWT, hz0+HWT, hz1-HWT, BF-0.1, HFY-0.12, [], "#8a8478", 0.5, BF);
  // the walls: lap siding outside, plaster in
  const iz0=hz0+HWT, iz1=hz1-HWT, ix0=hx0+HWT, ix1=hx1-HWT;
  wall("wp_lap", "x", hz0+HWT/2, HWT, hx0, hx1, HFY-0.12, EAVE, [ND, ...NW], "#e0d4b8", 0.5, HFY);
  wall("wp_lap", "x", hz1-HWT/2, HWT, hx0, hx1, HFY-0.12, EAVE, SW, "#e0d4b8", 0.5, HFY);
  wall("wp_lap", "z", hx0+HWT/2, HWT, iz0, iz1, HFY-0.12, EAVE, WWn, "#e0d4b8", 0.5, HFY);
  wall("wp_lap", "z", hx1-HWT/2, HWT, iz0, iz1, HFY-0.12, EAVE, [], "#e0d4b8", 0.5, HFY);
  for(const o of [...NW]) windowAt("x", hz0+HWT/2, HWT, o, -1, "#f2f0ea", "#c8b888");
  for(const o of SW) windowAt("x", hz1-HWT/2, HWT, o, 1, "#f2f0ea", "#c8b888");
  for(const o of WWn) windowAt("z", hx0+HWT/2, HWT, o, -1, "#f2f0ea", "#c8b888");
  // the gables, east and west, and the roof: two slopes of shingle with an overhang, ridge along x
  for(const [xg, dir] of [[hx0+HWT/2, -1],[hx1-HWT/2, 1]]){
    const pts=[[iz0-HWT, EAVE],[iz1+HWT, EAVE],[(hz0+hz1)/2, RIDGE-0.08]].map(p=>[p[0], p[1]]);
    const Gm={P:[],N:[],U:[]}; for(const sx of [xg-HWT/2, xg+HWT/2]) addFace(Gm, pts.map(p=>V3(sx, p[1], p[0])), V3(sx<xg ? -1 : 1, 0, 0), p=>[p.z*0.5, p.y*0.5]);
    flush(Gm, "wp_lap", "#e0d4b8"); }
  { const ov=0.5, zm=(hz0+hz1)/2, run=(hz1-hz0)/2+ov, drop=(RIDGE-EAVE)*(run/((hz1-hz0)/2)), th=0.12;
    for(const s2 of [-1,1]){ const ze=zm+s2*run, pts=[V3(hx0-ov, RIDGE, zm), V3(hx1+ov, RIDGE, zm), V3(hx1+ov, RIDGE-drop, ze), V3(hx0-ov, RIDGE-drop, ze)];
      face("shingle", pts, V3(0, 1, s2*(drop/run)), "#5a4a42", 0.6);
      face("paintm", pts.map(p=>V3(p.x, p.y-th, p.z)), V3(0, -1, -s2*(drop/run)), "#e8e4d8", 0.6);
      B(hx1-hx0+2*ov, th, 0.04, (hx0+hx1)/2, RIDGE-drop-th/2, ze+s2*0.02, "#e8e4d8"); }
    B(hx1-hx0+2*ov+0.04, 0.10, 0.24, (hx0+hx1)/2, RIDGE+0.02, zm, "#4a3e38"); }
  // the ceiling inside, flat at HCL; the floor, round the stair's well
  const SWX0=-1115.7, SWX1=-1114.3, SWZ0=-1178.4, SWZ1=-1173.2;                          // the stair's well, in the stair room
  for(const [a, b, c, d] of [[ix0, ix1, iz0, SWZ0],[ix0, SWX0, SWZ0, SWZ1],[SWX1, ix1, SWZ0, SWZ1],[ix0, ix1, SWZ1, iz1]]){
    B(b-a, 0.14, d-c, (a+b)/2, HFY-0.07, (c+d)/2, "#6a5a4a"); addFlat(a, b, c, d, HFY); }
  push("wp_vinyl", planeGeo(ix1-ix0-0.02, SWZ0-iz0-0.02, 0), (ix0+ix1)/2, HFY+0.004, (iz0+SWZ0)/2, 0, "#ffffff", -Math.PI/2, 0);
  push("wp_vinyl", planeGeo(ix1-ix0-0.02, iz1-SWZ1-0.02, 0), (ix0+ix1)/2, HFY+0.004, (SWZ1+iz1)/2, 0, "#ffffff", -Math.PI/2, 0);
  push("wp_vinyl", planeGeo(SWX0-ix0-0.02, SWZ1-SWZ0, 0), (ix0+SWX0)/2, HFY+0.004, (SWZ0+SWZ1)/2, 0, "#ffffff", -Math.PI/2, 0);
  push("wp_vinyl", planeGeo(ix1-SWX1-0.02, SWZ1-SWZ0, 0), (SWX1+ix1)/2, HFY+0.004, (SWZ0+SWZ1)/2, 0, "#ffffff", -Math.PI/2, 0);
  push("wp_ceil", planeGeo(ix1-ix0, iz1-iz0, 0), (ix0+ix1)/2, HCL, (iz0+iz1)/2, 0, "#ffffff", Math.PI/2, 0);
  for(const [ax, c, dir, a, b, ops] of [["x", iz0, 1, ix0, ix1, [ND, ...NW]],["x", iz1, -1, ix0, ix1, SW],["z", ix0, 1, iz0, iz1, WWn],["z", ix1, -1, iz0, iz1, []]])
    liner("wp_wall", ax, c, dir, a, b, HFY, HCL, ops, "#ece4d0");
  // the partitions: the meeting room's east wall at x = -1117 with the kitchen's pass-through and the stair room's door;
  // between the kitchen and the stair room at z = -1180
  const PX=-1117.0, PZ=-1180.0, PT=0.12;
  const KD={a:-1183.2, b:-1182.2, sill:HFY-0.01, head:HFY+2.05}, PASS={a:-1181.8, b:-1180.6, sill:HFY+0.95, head:HFY+1.95}, SD={a:-1176.8, b:-1175.8, sill:HFY-0.01, head:HFY+2.05};
  wall("wp_wall", "z", PX, PT, iz0, iz1, HFY, HCL, [KD, PASS, SD], "#ece4d0", 0.5, HFY);
  wall("wp_wall", "x", PZ, PT, PX+PT/2, ix1, HFY, HCL, [], "#ece4d0", 0.5, HFY);
  B(0.42, 0.04, PASS.b-PASS.a+0.1, PX, PASS.sill+0.02, (PASS.a+PASS.b)/2, "#7a5a3a");
  makeDoor(XF(PX, KD.a+0.02, -Math.PI/2), 0, HFY+0.01, 0, "THE KITCHEN", true, 0.2, "closet", 0xe8e0d0);
  makeDoor(XF(PX, SD.a+0.02, -Math.PI/2), 0, HFY+0.01, 0, "THE PINE KNOT ↓", true, 0, "closet", 0x6a4a2e);
  sign(0.62, 0.40, (c,Wd,Hh)=>{ c.fillStyle="#2a1a10"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#c8a050"; c.lineWidth=5; c.strokeRect(6,6,Wd-12,Hh-12);
    say(c, "THE PINE KNOT", Wd/2, Hh*0.30, Wd*0.80, Hh*0.22, "#e8c878", "800", "Georgia, serif");
    say(c, "LOUNGE · DOWNSTAIRS", Wd/2, Hh*0.55, Wd*0.80, Hh*0.13, "#e8d8b0", "700", "Arial");
    say(c, "MEMBERS & GUESTS · 21 AND OVER", Wd/2, Hh*0.76, Wd*0.80, Hh*0.11, "#e8a050", "700", "Arial"); }, PX-PT/2-0.02, HFY+2.38, (SD.a+SD.b)/2, -Math.PI/2, false, 330);
  addFlat(PX-PT/2-0.01, PX+PT/2+0.01, KD.a, KD.b, HFY); addFlat(PX-PT/2-0.01, PX+PT/2+0.01, SD.a, SD.b, HFY);
  // the front: a concrete stoop and steps to the road's side, a ramp beside them; the door; the sign; the flagpole
  { const sz0=hz0-1.8, sz1=hz0;
    B(3.0, HFY-Y+0.04, 1.8, (ND.a+ND.b)/2, (HFY+Y)/2-0.02, (sz0+sz1)/2, "#b8b4a8"); addFlat((ND.a+ND.b)/2-1.5, (ND.a+ND.b)/2+1.5, sz0, sz1+HWT, HFY);
    for(let k=0;k<2;k++) B(3.0, (HFY-Y)/3*(2-k), 0.3, (ND.a+ND.b)/2, Y+(HFY-Y)/3*(2-k)/2, sz0-0.15-k*0.3, "#b8b4a8");
    addRamp((ND.a+ND.b)/2-1.5, (ND.a+ND.b)/2+1.5, sz0-0.6, sz0, "z", sz0-0.6, sz0, Y+0.02, HFY);
    makeDoor(XF(ND.a+0.02, hz0+HWT/2, 0), 0, HFY+0.01, 0, "THE COMMUNITY HALL", true, 0, "vision", 0x2a4a3a);
    addFlat(ND.a, ND.b, hz0-0.01, iz0+0.01, HFY);
    B(0.05, 0.08, ND.b-ND.a+0.16, (ND.a+ND.b)/2, ND.head+0.05, hz0-0.037, "#f2f0ea");
    sign(5.2, 0.62, (c,Wd,Hh)=>{ c.fillStyle="#2e4a32"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#e8d8b0"; c.lineWidth=5; c.strokeRect(7,7,Wd-14,Hh-14);
      say(c, "FRENCH CREEK PINES · COMMUNITY HALL", Wd/2, Hh*0.52, Wd*0.80, Hh*0.50, "#f2e6c8", "800", "Georgia, serif"); }, (hx0+hx1)/2, EAVE-0.42, hz0-0.13, Math.PI, false, 900);
    bx("wood", 5.3, 0.70, 0.04, (hx0+hx1)/2, EAVE-0.42, hz0-0.085, 0.4, 0, "#5a3a22");
    const fpx=-1127.5, fpz=hz0-4.0; C(0.05, 7.0, fpx, Y+3.5, fpz, "#c8ccd0", 10); S(0.07, fpx, Y+7.05, fpz, "#c8a050");
    sign(1.5, 0.95, flagUS, fpx+0.76, Y+6.4, fpz, 0, false, 360); addCol(fpx-0.1, fpx+0.1, fpz-0.1, fpz+0.1, Y-0.5, Y+7); }
  addZone(hx0, hx1, hz0, hz1, HFY-0.5, RIDGE, "THE COMMUNITY HALL", true);
  addZone(PX, hx1, iz0, PZ, HFY-0.5, HCL, "THE HALL · KITCHEN", true);
  // the meeting room: rows of folding chairs facing the officers' table at the west end, the podium, the flags,
  // the bulletin board, a coffee urn on a table by the pass-through, a piano, the euchre tables pushed back
  { const rx0=ix0+2.6;
    // the officers' table and its chairs, the podium
    B(0.76, 0.04, 3.6, ix0+1.0, HFY+0.74, (iz0+iz1)/2, "#7a5a3a"); for(const dz of [-1.7, 1.7]) for(const dx of [-0.32, 0.32]) B(0.04, 0.72, 0.04, ix0+1.0+dx, HFY+0.36, (iz0+iz1)/2+dz, "#5a3a22");
    B(0.78, 0.6, 3.62, ix0+1.0, HFY+0.42, (iz0+iz1)/2, "#2e4a32"); addCol(ix0+0.6, ix0+1.4, (iz0+iz1)/2-1.82, (iz0+iz1)/2+1.82, HFY-0.06, HFY+0.76);
    for(const dz of [-1.2, 0, 1.2]){ const sx=ix0+0.4, sz=(iz0+iz1)/2+dz; B(0.42, 0.04, 0.42, sx, HFY+0.46, sz, "#5a3a22"); B(0.04, 0.5, 0.42, sx-0.2, HFY+0.72, sz, "#5a3a22");
      addCol(sx-0.22, sx+0.22, sz-0.22, sz+0.22, HFY-0.06, HFY+0.5); }
    B(0.5, 1.15, 0.5, ix0+1.9, HFY+0.575, iz1-2.0, "#6a4a2e"); B(0.56, 0.05, 0.56, ix0+1.9, HFY+1.17, iz1-2.0, "#5a3a22"); addCol(ix0+1.64, ix0+2.16, iz1-2.26, iz1-1.74, HFY-0.06, HFY+1.2);
    // the banner over the table
    sign(3.4, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#f2ece0"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#2e4a32"; c.lineWidth=5; c.strokeRect(6,6,Wd-12,Hh-12);
      say(c, "MONTHLY MEETING · SECOND TUESDAY · 7 PM", Wd/2, Hh*0.52, Wd*0.80, Hh*0.42, "#2e4a32", "800", "Arial"); }, ix0+0.02, HFY+2.25, (iz0+iz1)/2, Math.PI/2, false, 720);
    // the rows of folding chairs, an aisle down the middle
    for(let rr=0; rr<5; rr++) for(const side of [-1,1]) for(let k=0;k<4;k++){
      const sx=rx0+rr*1.25, sz=(iz0+iz1)/2+side*(0.9+k*0.62);
      B(0.40, 0.03, 0.40, sx, HFY+0.45, sz, "#5a5e62"); B(0.03, 0.36, 0.40, sx+0.19, HFY+0.68, sz, "#5a5e62");
      for(const dz of [-0.18, 0.18]){ tubeE(V3(sx-0.18, HFY, sz+dz), V3(sx+0.18, HFY+0.45, sz+dz), 0.008, "#3a3e42"); tubeE(V3(sx+0.18, HFY, sz+dz), V3(sx-0.1, HFY+0.45, sz+dz), 0.008, "#3a3e42"); }
      addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, HFY-0.06, HFY+0.48); addSeat(sx, sz, HFY, -Math.PI/2, "A FOLDING CHAIR"); }
    // the bulletin board on the south wall, its notices
    { const bx3=-1124.2, bz=iz1-0.03; B(2.4, 1.2, 0.03, bx3, HFY+1.55, bz, "#6a4a2e"); B(2.3, 1.1, 0.02, bx3, HFY+1.55, bz-0.02, "#b89a6a");
      const NOTES=[["POTLUCK","SAT 5PM · BRING A DISH","#f2f0ea"],["EUCHRE NIGHT","EVERY THURS · 7PM","#f2e88a"],["BINGO","FRI · DOORS 6PM","#c8e8f2"],["LOST CAT","GREY · ANSWERS TO 'BEANS'","#f2d8d8"],
                   ["POOL OPENS","MEMORIAL DAY","#d8f2d8"],["QUIET HOURS","10PM – 7AM","#f2f0ea"],["FIREWOOD","$6 A BUNDLE · LOT 3","#f2e0c8"]];
      NOTES.forEach(([h1, h2, bg], k)=>{ const nx=bx3-0.9+(k%4)*0.6, ny=HFY+1.85-Math.floor(k/4)*0.55;
        sign(0.46, 0.36, (c,Wd,Hh)=>{ c.fillStyle=bg; c.fillRect(0,0,Wd,Hh); say(c, h1, Wd/2, Hh*0.34, Wd*0.80, Hh*0.24, "#1a1a1a", "800", "Arial"); say(c, h2, Wd/2, Hh*0.68, Wd*0.80, Hh*0.14, "#2a2a2a", "600", "Arial"); },
          nx, ny, bz-0.035, Math.PI, false, 200); C(0.012, 0.01, nx, ny+0.15, bz-0.04, "#c41a1a", 8, Math.PI/2); }); }
    // the coffee table by the pass-through: an urn, cups, a plate of cookies under wrap
    { const cx3=PX-0.6, cz3=(PASS.a+PASS.b)/2; B(0.7, 0.04, 1.6, cx3, HFY+0.74, cz3, "#e8e2d0"); for(const dz of [-0.7, 0.7]) B(0.04, 0.72, 0.04, cx3, HFY+0.36, cz3+dz, "#8a8d90");
      addCol(cx3-0.36, cx3+0.36, cz3-0.82, cz3+0.82, HFY-0.06, HFY+0.76);
      C(0.14, 0.46, cx3, HFY+0.99, cz3-0.4, "#c8ccd0", 16); for(let k=0;k<6;k++) CT(0.035, 0.028, 0.10, cx3-0.15+(k%3)*0.08, HFY+0.81, cz3+0.1+(k>2?0.08:0), "#f2f0ea", 10);
      C(0.16, 0.02, cx3, HFY+0.77, cz3+0.5, "#e8e2d0", 16); for(let k=0;k<7;k++) C(0.03, 0.012, cx3+Math.cos(k)*0.08, HFY+0.79, cz3+0.5+Math.sin(k)*0.08, "#a8743a", 10); }
    // the euchre tables, folded, and a stack of chairs by the west wall; the piano in the corner
    for(let k=0;k<3;k++) B(0.06, 0.76, 1.6, ix0+0.05+k*0.07+0.03, HFY+0.38, iz0+1.4, "#7a5a3a");
    addCol(ix0, ix0+0.3, iz0+0.6, iz0+2.2, HFY-0.06, HFY+0.8);
    B(1.48, 1.18, 0.58, ix0+3.2, HFY+0.59, iz0+0.3, "#3a2414"); B(1.40, 0.05, 0.30, ix0+3.2, HFY+0.74, iz0+0.72, "#3a2414"); addCol(ix0+2.45, ix0+3.95, iz0, iz0+0.9, HFY-0.06, HFY+1.2);
    addUse(ix0+3.2, iz0+1.4, HFY, "PLAY THE PIANO", ()=>{ if(typeof AUDIO!=="undefined") AUDIO.blip("rim", ix0+3.2, iz0);
      toast(["'HAPPY BIRTHDAY', FOR WHOEVER'S IT IS","CHOPSTICKS. SOMEBODY CLAPS FROM THE KITCHEN","THE MIDDLE C IS GONE"][(Math.random()*3)|0], "#e8d8b0"); }, 1.2);
    // the lights: fluorescent panels in the ceiling
    for(const lx of [-1129.5, -1125.5, -1121.0]) for(const lz of [-1181.5, -1174.5]){ push("tube", boxGeo(1.2, 0.02, 0.6, 0), lx, HCL-0.012, lz, 0, "#ffffff");
      LAMPS.push({x:lx, y:HCL-0.3, z:lz, color:0xf2f6f2, intensity:0.55, dist:7, decay:1.4, indoor:true, vol:[ix0, PX, iz0, iz1, HFY-0.5, HCL+0.3]}); } }
  // the kitchen: counters round it, the range, the fridge, the big coffee maker, the sink under the pass-through
  { const kx=ix1-0.32; B(0.6, 0.86, 3.4, kx, HFY+0.43, (iz0+PZ)/2, "#e8e2d0"); B(0.63, 0.04, 3.42, kx-0.01, HFY+0.88, (iz0+PZ)/2, "#5a5450");
    B(0.6, 0.86, 1.4, PX+0.38, HFY+0.43, (PASS.a+PASS.b)/2, "#e8e2d0"); B(0.63, 0.04, 1.42, PX+0.39, HFY+0.88, (PASS.a+PASS.b)/2, "#5a5450");
    B(0.5, 0.006, 0.4, PX+0.4, HFY+0.902, (PASS.a+PASS.b)/2, "#c8ccd0");
    B(0.78, 1.76, 0.72, kx-0.08, HFY+0.88, PZ-0.5, "#ece9e2"); addCol(kx-0.5, ix1, PZ-0.9, PZ-0.1, HFY-0.06, HFY+1.8);
    addCol(kx-0.32, ix1, iz0, PZ-0.9, HFY-0.06, HFY+0.92); addCol(PX+PT/2, PX+0.7, (PASS.a+PASS.b)/2-0.72, (PASS.a+PASS.b)/2+0.72, HFY-0.06, HFY+0.92);
    C(0.18, 0.5, kx, HFY+1.15, iz0+0.6, "#c8ccd0", 16);
    LAMPS.push({x:(PX+ix1)/2, y:HCL-0.3, z:(iz0+PZ)/2, color:0xf2f6f2, intensity:0.5, dist:5, decay:1.4, indoor:true, vol:[PX, ix1, iz0, PZ, HFY-0.5, HCL+0.3]}); }
  // the stair room: the railing round the well, the stair itself down along z to the lounge
  const NR=18, RS=(HFY-BF)/NR, RUN=(SWZ0-SWZ1)/NR;                                // (RUN negative: down toward -z)
  { for(let k=0;k<NR;k++){ const y=HFY-(k+1)*RS, za2=SWZ1+k*RUN, zb2=za2+RUN;
      B(SWX1-SWX0-0.004, y-(BF-0.05), Math.abs(RUN)-0.002, (SWX0+SWX1)/2, (y+BF-0.05)/2, (za2+zb2)/2, k%2 ? "#5a3a24" : "#55361f"); }
    addRamp(SWX0, SWX1, SWZ0, SWZ1, "z", SWZ0, SWZ1, BF, HFY);
    addVoid(SWX0, SWX1, SWZ0, SWZ1, BF-1, HFY+0.6, BF);
    // the rail round the well on the stair room's side, open at the top step
    for(const [a, b, c2] of [[SWZ0, SWZ1, SWX0-0.03],[SWZ0, SWZ1, SWX1+0.03]]){ B(0.05, 0.05, b-a, c2, HFY+0.92, (a+b)/2, "#5a3a24");
      for(let z=a+0.1; z<b; z+=0.4) B(0.03, 0.9, 0.03, c2, HFY+0.45, z, "#5a3a24"); addCol(c2-0.04, c2+0.04, a, b, HFY-0.2, HFY+0.95); }
    B(SWX1-SWX0+0.1, 0.05, 0.05, (SWX0+SWX1)/2, HFY+0.92, SWZ0-0.03, "#5a3a24"); addCol(SWX0, SWX1, SWZ0-0.06, SWZ0, HFY-0.2, HFY+0.95);
    LAMPS.push({x:(SWX0+SWX1)/2, y:HCL-0.3, z:-1176, color:0xffd8a0, intensity:0.4, dist:5, decay:1.6, indoor:true, vol:[PX, ix1, PZ, iz1, BF-0.5, HCL+0.3]});
    addZone(PX, ix1, PZ, iz1, BF+1.0, HCL, "THE STAIRS DOWN", true); }

  /* ======================================================================
     THE PINE KNOT: the lounge in the basement
     ====================================================================== */
  use("lounge");
  const QX0=ix0, QX1=ix1, QZ0=iz0, QZ1=iz1;
  const lampU=(o)=>{ o.under=true; o.indoor=true; LAMPS.push(o); return o; };
  // the room: block walls panelled to the ceiling, a drop ceiling of tiles, the floor in black and cream tiles
  for(const [ax, c, dir, a, b] of [["x", QZ0, 1, QX0, QX1],["x", QZ1, -1, QX0, QX1],["z", QX0, 1, QZ0, QZ1],["z", QX1, -1, QZ0, QZ1]]) liner("wp_panel", ax, c, dir, a, b, BF, BCL, [], "#ffffff", 0.5);
  { const g=new T.PlaneGeometry(QX1-QX0, QZ1-QZ0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i, U.getX(i)*(QX1-QX0)/1.2, U.getY(i)*(QZ1-QZ0)/1.2);
    push("wp_tile", g, (QX0+QX1)/2, BF+0.004, (QZ0+QZ1)/2, 0, "#ffffff", -Math.PI/2, 0);
    // the drop ceiling, all but over the stair's well
    for(const [a0, a1, c0, c1] of [[QX0, QX1, QZ0, SWZ0],[QX0, SWX0, SWZ0, QZ1],[SWX1, QX1, SWZ0, QZ1]]){ const g2=planeGeo(a1-a0, c1-c0, 0), U2=g2.attributes.uv;
      for(let i=0;i<U2.count;i++) U2.setXY(i, U2.getX(i)*(a1-a0)/1.2, U2.getY(i)*(c1-c0)/0.6);
      push("wp_ceil", g2, (a0+a1)/2, BCL, (c0+c1)/2, 0, "#ffffff", Math.PI/2, 0); } }
  B(QX1-QX0, 0.2, QZ1-QZ0, (QX0+QX1)/2, BF-0.1, (QZ0+QZ1)/2, "#6a6460");
  for(const [a, b, c, d] of [[QX0, QX1, QZ0, SWZ0],[QX0, SWX0, SWZ0, QZ1],[SWX1, QX1, SWZ0, QZ1]]) addFlat(a, b, c, d, BF);
  addVoid(QX0, QX1, QZ0, QZ1, BF-3, HFY-0.4, BF);
  addBuried(QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.6, 0.55, 0x6a4a2a);
  addZone(QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.2, "THE PINE KNOT", true);
  // the stair's enclosure down here: its side walls, panelled
  for(const xs of [SWX0-0.06, SWX1+0.06]){ B(0.12, HFY-0.15-BF, SWZ1-SWZ0+0.4, xs, (BF+HFY-0.15)/2, (SWZ0+SWZ1)/2+0.2, "#7a5232"); addCol(xs-0.06, xs+0.06, SWZ0, QZ1, BF-0.5, BCL); }
  addCol(SWX0-0.12, SWX1+0.12, SWZ1-0.4, QZ1, BF-0.5, BCL);
  B(SWX1-SWX0+0.24, HFY-0.15-BCL+0.02, 0.10, (SWX0+SWX1)/2, (BCL-0.02+HFY-0.15)/2, SWZ0-0.05, "#7a5232");   // (the header over the stair's foot)
  // the wainscot rail and the base, all round
  for(const [x, z, w, d] of [[(QX0+QX1)/2, QZ0+0.03, QX1-QX0, 0.04],[(QX0+QX1)/2, QZ1-0.03, QX1-QX0, 0.04],[QX0+0.03, (QZ0+QZ1)/2, 0.04, QZ1-QZ0],[QX1-0.03, (QZ0+QZ1)/2, 0.04, QZ1-QZ0]]){
    B(w, 0.06, d, x, BF+0.95, z, "#3a2414"); B(w, 0.12, d, x, BF+0.06, z, "#2a1a0e"); }
  // the bar: along the north wall, a padded rail, stools; the back bar with the mirror, the bottles, the taps
  const BX0=-1130.6, BX1=-1120.4, BZ=QZ0+1.55;
  { B(BX1-BX0, 1.04, 0.6, (BX0+BX1)/2, BF+0.52, BZ, "#4a2e1a"); push("wp_wood", boxGeo(BX1-BX0+0.1, 0.06, 0.74, 0.8), (BX0+BX1)/2, BF+1.07, BZ+0.04, 0, "#c8a890");
    RB(BX1-BX0, 0.10, 0.12, (BX0+BX1)/2, BF+1.12, BZ+0.34, "#5a1e14", 0, 0.04);
    B(BX1-BX0, 0.03, 0.03, (BX0+BX1)/2, BF+0.18, BZ+0.34, "#c8a050");
    addCol(BX0, BX1, BZ-0.3, BZ+0.42, BF-0.5, BF+1.1);
    for(let k=0;k<8;k++){ const sx=BX0+0.6+k*1.25, sz=BZ+0.82; C(0.19, 0.07, sx, BF+0.76, sz, "#5a1e14", 18); C(0.025, 0.72, sx, BF+0.37, sz, "#c8ccd0", 8); C(0.17, 0.02, sx, BF+0.012, sz, "#c8ccd0", 16);
      addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, BF-0.5, BF+0.8); addSeat(sx, sz, BF, Math.PI, "A STOOL AT THE BAR", false, 0.34); WESTPARK.stools=(WESTPARK.stools||[]).concat([[sx, sz]]); }
    // the back bar
    B(BX1-BX0, 0.9, 0.5, (BX0+BX1)/2, BF+0.45, QZ0+0.25, "#3a2414"); B(BX1-BX0, 0.04, 0.54, (BX0+BX1)/2, BF+0.92, QZ0+0.27, "#2a1a0e");
    push("mirror", planeGeo(BX1-BX0-1.2, 0.8, 0), (BX0+BX1)/2, BF+1.6, QZ0+0.012, 0, "#ffffff");
    for(const y of [1.3, 1.72]) B(BX1-BX0-1.0, 0.03, 0.22, (BX0+BX1)/2, BF+y, QZ0+0.13, "#2a1a0e");
    const qb=_trng(2626); for(const y of [0.942, 1.316, 1.736]) for(let x=BX0+0.6; x<BX1-0.6; x+=0.16+qb()*0.10){ const h=0.22+qb()*0.12;
      const bc=["#3a5a2a","#6a3a12","#2a2018","#c8b088","#7a1a1a","#e8e2d0","#2a3a6a"][(qb()*7)|0], hb=h*0.58, sq=qb()<0.3;
      if(sq) RB(0.075, hb, 0.05, x, BF+y+hb/2, QZ0+0.14, bc, 0, 0.012); else ent(new T.CylinderGeometry(0.034, 0.036, hb, 10), x, BF+y+hb/2, QZ0+0.14, bc);
      CT(0.012, 0.034, h*0.14, x, BF+y+hb+h*0.07, QZ0+0.14, bc, 10); C(0.012, h*0.22, x, BF+y+hb+h*0.14+h*0.11, QZ0+0.14, bc, 8);
      C(0.014, 0.02, x, BF+y+h*0.94+0.008, QZ0+0.14, ["#c8a050","#1a1a1a","#b82a22"][(qb()*3)|0], 8);
      B(sq ? 0.06 : 0.05, hb*0.4, 0.004, x, BF+y+hb*0.5, QZ0+0.14+(sq ? 0.027 : 0.036), ["#f2e8d0","#e8d8a0","#1a1a1a","#c82a1a"][(qb()*4)|0]); }
    addCol(BX0, BX1, QZ0, QZ0+0.52, BF-0.5, BF+2.0);
    // the taps on the bar, a row of handles
    for(let k=0;k<6;k++){ const tx3=(BX0+BX1)/2-0.75+k*0.3; C(0.012, 0.12, tx3, BF+1.17, BZ-0.12, "#c8ccd0", 8); C(0.018, 0.16, tx3, BF+1.31, BZ-0.12, ["#c8a050","#1a1a1a","#7a1a1a","#2a4a6a","#2e6a3a","#e8e2d0"][k], 8); }
    // the TV over the end of the bar, the game on
    B(1.1, 0.64, 0.06, BX1-0.6, BF+2.05, QZ0+0.05, "#141618"); push("lk_tvon", planeGeo(1.02, 0.56, 0), BX1-0.6, BF+2.05, QZ0+0.082, 0, "#ffffff");
    for(const lx of [-1129, -1125.5, -1122]){ lampU({x:lx, y:BCL-0.3, z:BZ, color:0xffc070, intensity:0.55, dist:5.5, decay:1.5, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
      CT(0.12, 0.18, 0.18, lx, BCL-0.25, BZ, "#5a1e14", 16); push("cafe_bulb", new T.SphereGeometry(0.04, 8, 6), lx, BCL-0.33, BZ, 0, "#ffffff"); } }
  // the tables: four-tops with red-check cloths down the middle, their chairs
  for(const [tx3, tz] of [[-1129.0, -1178.0],[-1126.0, -1178.0],[-1123.0, -1178.0],[-1120.0, -1178.0]]){
    B(0.9, 0.04, 0.9, tx3, BF+0.74, tz, "#7a1a1a"); B(0.92, 0.006, 0.92, tx3, BF+0.763, tz, "#e8e2d0"); for(let k=0;k<4;k++) B(0.9, 0.0062, 0.11, tx3, BF+0.7665, tz-0.39+k*0.26, "#b82a22");
    C(0.05, 0.72, tx3, BF+0.36, tz, "#2a2a2c", 8); C(0.3, 0.02, tx3, BF+0.01, tz, "#2a2a2c", 16); addCol(tx3-0.46, tx3+0.46, tz-0.46, tz+0.46, BF-0.5, BF+0.76);
    for(const [dx, dz, ry] of [[0, -0.72, 0],[0, 0.72, Math.PI],[-0.72, 0, Math.PI/2],[0.72, 0, -Math.PI/2]]){ const sx=tx3+dx, sz=tz+dz, f=XF(sx, sz, ry);
      const qq=(w,h,d,lx,ly,lz,c)=>B(w,h,d, f.x(lx,lz), BF+ly, f.z(lx,lz), c, ry);
      qq(0.42, 0.05, 0.42, 0, 0.46, 0, "#5a1e14"); qq(0.40, 0.40, 0.04, 0, 0.70, -0.19, "#3a2414"); for(const a2 of [-0.18, 0.18]) for(const b2 of [-0.18, 0.18]) qq(0.03, 0.44, 0.03, a2, 0.22, b2, "#3a2414");
      addCol(sx-0.22, sx+0.22, sz-0.22, sz+0.22, BF-0.5, BF+0.5); addSeat(sx, sz, BF, ry+Math.PI, "A CHAIR AT A TABLE"); }
    C(0.04, 0.1, tx3+0.2, BF+0.82, tz+0.1, "#c41a1a", 10); C(0.03, 0.12, tx3-0.2, BF+0.83, tz-0.1, "#f2f0ea", 10); }
  for(const lx of [-1129.0, -1124.0]) lampU({x:lx, y:BCL-0.3, z:-1174.6, color:0xffd8a8, intensity:0.45, dist:5, decay:1.5, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
  for(const lx of [-1127.5, -1121.5]) lampU({x:lx, y:BCL-0.3, z:-1178, color:0xffd8a8, intensity:0.5, dist:6, decay:1.5, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
  // the walls: the honour roll, the plaques, the photos, the flags, the meat raffle wheel, the tip boards, the bingo board,
  // the jukebox, the dartboard, the beer signs
  { // the honour roll on the west wall: names in gold on brown
    sign(1.6, 1.1, (c,Wd,Hh)=>{ c.fillStyle="#3a2414"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#c8a050"; c.lineWidth=6; c.strokeRect(8,8,Wd-16,Hh-16);
      say(c, "HONOUR ROLL", Wd/2, Hh*0.13, Wd*0.70, Hh*0.10, "#e8c878", "800", "Georgia, serif");
      const names=["R. KOWALSKI","D. HOLLOWAY","J. MARINO","T. BRENNAN","M. SZYMANSKI","L. PETERS","H. GRUBER","W. OKAFOR","C. LINDQVIST","E. DUBOIS","S. NAKAMURA","F. RUIZ"];
      names.forEach((n, k)=>say(c, n, Wd*(k<6 ? 0.30 : 0.70), Hh*(0.28+(k%6)*0.11), Wd*0.36, Hh*0.07, "#e8d8b0", "600", "Georgia, serif")); }, QX0+0.03, BF+1.6, -1175.5, Math.PI/2, false, 480);
    for(const [z, col] of [[-1182.6, "#c8a050"],[-1181.6, "#a8a8ac"],[-1173.4, "#c8a050"]]){ B(0.03, 0.34, 0.26, QX0+0.02, BF+1.6, z, "#3a2414"); B(0.02, 0.18, 0.16, QX0+0.035, BF+1.62, z, col); }
    // photos along the south wall, the club over the years
    const qp=_trng(3737); for(let k=0;k<6;k++){ const x=-1131.0+k*0.75; B(0.5, 0.36, 0.03, x, BF+1.65, QZ1-0.02, "#1a1410");
      B(0.44, 0.30, 0.02, x, BF+1.65, QZ1-0.035, ["#8a7a5a","#6a6a6a","#9a8a6a","#5a5a5a"][(qp()*4)|0]); }
    // the meat raffle wheel and the queen of hearts board on the east wall
    { const wx=QX1-0.06, wz=-1182.0, g=new T.CylinderGeometry(0.42, 0.42, 0.05, 32); g.rotateZ(Math.PI/2);
      ent(g, wx, BF+1.55, wz, "#e8e2d0"); for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; B(0.012, 0.38, 0.03, wx-0.03, BF+1.55+Math.cos(a)*0.2, wz+Math.sin(a)*0.2, k%2 ? "#b82a22" : "#2a4a6a"); }
      B(0.04, 0.12, 0.06, wx-0.03, BF+2.02, wz, "#c8a050");
      sign(0.8, 0.22, (c,Wd,Hh)=>{ c.fillStyle="#b82a22"; c.fillRect(0,0,Wd,Hh); say(c, "MEAT RAFFLE · SATURDAYS 3PM", Wd/2, Hh/2, Wd*0.80, Hh*0.55, "#f2f0ea", "800", "Arial"); }, QX1-0.03, BF+1.0, wz, -Math.PI/2, false, 320);
      sign(1.2, 0.9, (c,Wd,Hh)=>{ c.fillStyle="#1a3a2a"; c.fillRect(0,0,Wd,Hh); say(c, "QUEEN OF HEARTS", Wd/2, Hh*0.12, Wd*0.78, Hh*0.11, "#e8c878", "800", "Georgia, serif");
        for(let i=0;i<8;i++) for(let j=0;j<5;j++){ const open=((i*5+j)*7)%11<4; c.fillStyle=open ? "#f2f0ea" : "#b82a22"; c.fillRect(Wd*0.1+i*Wd*0.1, Hh*0.24+j*Hh*0.115, Wd*0.085, Hh*0.10);
          if(open){ c.fillStyle="#b82a22"; c.font="bold 14px Arial"; c.textAlign="center"; c.fillText("♥", Wd*0.1+i*Wd*0.1+Wd*0.042, Hh*0.24+j*Hh*0.115+Hh*0.065); } }
        say(c, "JACKPOT $3,140", Wd/2, Hh*0.87, Wd*0.70, Hh*0.07, "#f2c41c", "800", "Arial"); }, QX1-0.03, BF+1.6, -1179.6, -Math.PI/2, false, 400); }
    // the tip board shelf by the bar's end
    { const tz=-1182.3, tx3=-1119.6; B(0.8, 0.9, 0.4, tx3+0.3, BF+0.45, tz, "#3a2414"); addCol(tx3-0.1, tx3+0.7, tz-0.2, tz+0.2, BF-0.5, BF+0.9);
      sign(0.7, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#f2e88a"; c.fillRect(0,0,Wd,Hh); say(c, "TIP BOARDS", Wd/2, Hh*0.15, Wd*0.78, Hh*0.13, "#1a1a1a", "800", "Arial");
        for(let i=0;i<10;i++) for(let j=0;j<6;j++){ c.fillStyle=((i+j*3)%7)<2 ? "#c8c0a0" : "#e85a3a"; c.fillRect(Wd*0.06+i*Wd*0.088, Hh*0.30+j*Hh*0.11, Wd*0.075, Hh*0.09); } }, tx3+0.3, BF+1.15, tz+0.21, 0, false, 280); }
    // the jukebox in the south-east corner, lit
    { const jx=QX1-0.6, jz=QZ1-0.5; RB(0.9, 1.5, 0.6, jx, BF+0.75, jz, "#6a3a1a", 0, 0.12); B(0.7, 0.4, 0.02, jx, BF+1.15, jz-0.31, "#f2c41c");
      ent(new T.CylinderGeometry(0.45, 0.45, 0.6, 18, 1, false, -Math.PI/2, Math.PI), jx, BF+1.5, jz, "#e88a2a", 0, 0, Math.PI/2);
      addCol(jx-0.46, jx+0.46, jz-0.31, QZ1, BF-0.5, BF+1.9);
      lampU({x:jx, y:BF+1.2, z:jz-0.6, color:0xff9a3a, intensity:0.4, dist:3.5, decay:1.6, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
      addUse(jx, jz-1.0, BF, "THE JUKEBOX", ()=>toast(["YOU PUT IN A QUARTER. SOMETHING WITH A STEEL GUITAR","D-4: 'THE REGULARS' FAVOURITE', SAYS A NOTE TAPED ON","THREE PLAYS FOR A DOLLAR. YOU PICK THE SAME ONE THREE TIMES"][(Math.random()*3)|0], "#ffb070"), 1.2); }
    // the dartboard on the west wall by the honour roll, the line on the floor
    { const dz=-1180.6; const g=new T.CylinderGeometry(0.23, 0.23, 0.04, 28); g.rotateZ(Math.PI/2); ent(g, QX0+0.04, BF+1.73, dz, "#1a1a1a");
      const g2=new T.CylinderGeometry(0.16, 0.16, 0.042, 20); g2.rotateZ(Math.PI/2); ent(g2, QX0+0.043, BF+1.73, dz, "#e8d8b0");
      const g3=new T.CylinderGeometry(0.03, 0.03, 0.044, 12); g3.rotateZ(Math.PI/2); ent(g3, QX0+0.046, BF+1.73, dz, "#b82a22");
      B(0.03, 0.006, 0.6, QX0+2.37, BF+0.008, dz, "#c8a050"); }
    // beer signs: neon-ish, generic
    for(const [txt, col, x] of [["COLD BEER", "#ff4a3a", -1130.1],["ON TAP", "#4ad8ff", -1122.6]])
      sign(0.9, 0.32, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0,0,Wd,Hh); c.shadowColor=col; c.shadowBlur=14; say(c, txt, Wd/2, Hh/2, Wd*0.80, Hh*0.55, col, "800", "'Arial Black', Arial"); c.shadowBlur=0; },
        x, BF+2.15, QZ0+0.02, 0, true, 300);
    // the club's own sign over the back bar
    sign(2.6, 0.5, (c,Wd,Hh)=>{ c.fillStyle="#2a1a10"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#c8a050"; c.lineWidth=5; c.strokeRect(6,6,Wd-12,Hh-12);
      say(c, "THE PINE KNOT · MEMBERS & GUESTS", Wd/2, Hh*0.52, Wd*0.80, Hh*0.45, "#e8c878", "800", "Georgia, serif"); }, (BX0+BX1)/2-0.1, BF+2.24, QZ0+0.025, 0, false, 640);
    sign(0.9, 0.32, (c,Wd,Hh)=>{ c.fillStyle="#0a0a0c"; c.fillRect(0,0,Wd,Hh); c.shadowColor="#3aff7a"; c.shadowBlur=14; say(c, "OPEN", Wd/2, Hh/2, Wd*0.80, Hh*0.55, "#3aff7a", "800", "'Arial Black', Arial"); c.shadowBlur=0; },
      QX1-0.02, BF+1.9, -1175.0, -Math.PI/2, true, 300); }
  // the slot machines: four along the south wall, facing the room (18p plays them, through 18g's cabinets)
  { const NAMES=["LUCKY PINES","GOLD CREEK","LUCKY PINES","GOLD CREEK"];
    for(let k=0;k<4;k++){ const mx=-1130.6+k*1.05, mz=QZ1-0.42, i=8+k;
      const body=k%2 ? "#1f3f6a" : "#7a1a1a";
      RB(0.72, 1.3, 0.62, mx, BF+0.65, mz, body, 0, 0.06); RB(0.72, 0.5, 0.42, mx, BF+1.52, mz+0.08, body, 0, 0.08);
      B(0.66, 0.18, 0.04, mx, BF+1.84, mz-0.13, "#c8a050");
      sign(0.62, 0.16, (c,Wd,Hh)=>{ c.fillStyle="#1a1a1c"; c.fillRect(0,0,Wd,Hh); c.shadowColor="#f2c41c"; c.shadowBlur=8; say(c, NAMES[k], Wd/2, Hh/2, Wd*0.80, Hh*0.60, "#f2c41c", "900", "'Arial Black', Arial"); c.shadowBlur=0; },
        mx, BF+1.84, mz-0.155, Math.PI, true, 300);
      B(0.7, 0.12, 0.26, mx, BF+0.98, mz-0.40, "#2a2a2c"); for(let b=0;b<3;b++) C(0.025, 0.02, mx-0.18+b*0.18, BF+1.045, mz-0.42, ["#e83a2a","#f2c41c","#3ac84a"][b], 12);
      B(0.5, 0.08, 0.06, mx, BF+0.42, mz-0.32, "#c8ccd0");
      const c=cvs(336, 280), tex=setSRGB(new T.CanvasTexture(c)); tex.minFilter=T.LinearFilter;
      const scr=new T.Mesh(new T.PlaneGeometry(0.56, 0.47), new T.MeshBasicMaterial({map:tex, toneMapped:false})); scr.position.set(mx, BF+1.34, mz-0.33); scr.rotation.y=Math.PI; scene.add(scr);
      // the handle on the right side, a part of its own (it leans as you pull, 18g's stick)
      const st=new T.Group(); st.position.set(mx-0.40, BF+1.15, mz-0.05); st.rotation.order="YXZ"; st.rotation.y=Math.PI; scene.add(st);
      const arm=new T.Mesh(new T.CylinderGeometry(0.014, 0.014, 0.42, 8), new T.MeshStandardMaterial({color:0xc8ccd0, metalness:0.6, roughness:0.3})); arm.position.y=0.21; st.add(arm);
      const knob=new T.Mesh(new T.SphereGeometry(0.045, 14, 10), new T.MeshStandardMaterial({color:0xc41a1a, roughness:0.35})); knob.position.y=0.44; st.add(knob);
      addCol(mx-0.38, mx+0.38, mz-0.42, QZ1, BF-0.5, BF+1.9);
      ARCADE.cabs[i]={name:"SLOTS · "+NAMES[k], c:c, x:c.getContext("2d"), tex:tex, mesh:scr, stick:st, stand:{x:mx, z:mz-1.05}, ry:Math.PI,
                      screenY:BF+1.34, screen:{x:mx, z:mz-0.33}, floor:BF, slot:true};
      addUse(mx, mz-1.1, BF, "PLAY THE SLOTS · "+NAMES[k], ()=>{ if(typeof CABS!=="undefined") CABS.start(i); }, 0.6).game=true;
      WESTPARK.slots.push(i);
      lampU({x:mx, y:BF+1.6, z:mz-0.7, color:k%2 ? 0x6a9aff : 0xff6a5a, intensity:0.25, dist:2.5, decay:1.8, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]}); } }

  /* ======================================================================
     DRESSING: what people have put out and put up. Each lot gets its own run of things (its welcome mat and its
     pots, a grill and a cooler, flamingos and a gnome, solar lights along the gravel, and by turns a hammock, a
     clothesline, a kiddie pool, bikes against the skirting, tiki torches), the trailers their window units,
     propane, a dish or an aerial; inside, rugs, a fan turning, a sign on the wall, the bathroom's curtain. The
     common fire burns day and night, and a few of the lots' fire rings are lit once it gets dark.
     ====================================================================== */
  WESTPARK.fires=[]; WESTPARK.fans=[]; WESTPARK.radios=[]; WESTPARK.nightCrowd=false;
  const COALS_TEX=(function(){ const c=cvs(128,128), x=c.getContext("2d"), r=_trng(77);
    for(let i=0;i<170;i++){ const a=r()*7, d=Math.pow(r(),0.7)*44, s=2+r()*7, px=64+Math.cos(a)*d, py=64+Math.sin(a)*d, g=x.createRadialGradient(px,py,0,px,py,s);
      g.addColorStop(0,"rgba(255,"+(120+r()*90|0)+",40,0.95)"); g.addColorStop(1,"rgba(255,60,10,0)"); x.fillStyle=g; x.fillRect(px-s,py-s,s*2,s*2); }
    return new T.CanvasTexture(c); })();
  // a fire in a ring: logs leaned in, coals, flame cards that turn to you (14d's flame), a halo, a light; always, or after dark
  function campfire(fx, fz, sc, always){ const g0=Y+0.04, fy=g0+0.03, flames=[];
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+0.4+fx; push("logbark", FOREST.barkCyl(0.055*sc, 0.045*sc, 0.6*sc, 7), fx+Math.cos(a)*0.15*sc, fy+0.18*sc, fz+Math.sin(a)*0.15*sc, -a, "#4a3e34", 0, 0.95); }
    for(const a of [0.3, 1.8]) push("logbark", FOREST.barkCyl(0.065*sc, 0.06*sc, 0.7*sc, 7), fx, fy+0.065*sc, fz, a+fz, "#3a312a", 0, Math.PI/2);
    const coals=new T.Mesh(new T.CircleGeometry(0.36*sc, 20), new T.MeshBasicMaterial({map:COALS_TEX, transparent:true, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false,
      polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-12}));
    coals.rotation.x=-Math.PI/2; coals.position.set(fx, Y+0.045, fz); scene.add(coals);
    for(const [w,h,dx,dz,sd] of [[0.74,1.08,0,0,2.3+fx%3],[0.56,0.84,0.08,-0.05,5.1],[0.44,0.66,-0.09,0.07,8.7]]){
      const gg=new T.PlaneGeometry(w*sc, h*sc); gg.translate(0, h*sc/2, 0);
      const m=new T.Mesh(gg, fireFlameMat(sd)); m.position.set(fx+dx*sc, fy+0.05, fz+dz*sc); m.renderOrder=4; m.frustumCulled=false; scene.add(m); flames.push(m); }
    const halo=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff7a2a, transparent:true, depthWrite:false, blending:T.AdditiveBlending, opacity:0.4, toneMapped:false}));
    halo.scale.set(2.4*sc, 1.9*sc, 1); halo.position.set(fx, fy+0.55*sc, fz); scene.add(halo);
    const F={flames:flames, halo:halo, coals:coals, x:fx, y:fy, z:fz, sc:sc, always:always, on:true, sparkT:0, smokeT:0, pop:3+Math.random()*5,
             l:{x:fx, y:g0+0.9, z:fz, color:0xff8a3c, intensity:0.0, dist:10*sc, decay:1.5, fire:true}};
    LAMPS.push(F.l); WESTPARK.fires.push(F); return F; }
  // the signs people hang on their walls, one atlas, a cell each, baked into one bucket
  const HOMESIGNS=["HOME SWEET HOME","GONE FISHIN'","BLESS THIS MESS","CAMP RULES: RELAX","THE LAKE IS CALLING","HAPPY CAMPER","EAT · SLEEP · CAMP",
                   "PAPAW'S PLACE","S'MORES & MORE","WELCOME TO OUR CAMP","LIFE IS BETTER BY THE FIRE","STEELERS COUNTRY"];
  const HS_W=256, HS_H=112, HS_C=2, HS_R=Math.ceil(HOMESIGNS.length/HS_C);
  bucketOf("wp_homesign", ()=>{ const t=signTex(HS_W*HS_C, HS_H*HS_R, (c)=>{
      HOMESIGNS.forEach((txt, k)=>{ const ox=(k%HS_C)*HS_W, oy=Math.floor(k/HS_C)*HS_H, bg=["#e8dcc0","#6a4a2e","#2e4a32","#f2f0ea","#2a3a5a","#c8a070"][k%6], light=k%6===0 || k%6===3 || k%6===5;
        c.fillStyle=bg; c.fillRect(ox, oy, HS_W, HS_H); c.strokeStyle=light ? "#5a3a22" : "#e8d8b0"; c.lineWidth=4; c.strokeRect(ox+8, oy+8, HS_W-16, HS_H-16);
        c.fillStyle=light ? "#3a2414" : "#f2e6c8"; fitText(c, txt, HS_W*0.74, HS_H*0.30, ox+HS_W/2, oy+HS_H/2, "700", "Georgia, serif"); }); });
    return new T.MeshStandardMaterial(Object.assign({map:t, roughness:0.75}, {polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-4})); });
  const homeSign=(k, w, h, x, y, z, ry)=>{ const g=planeGeo(w, h, 0), U=g.attributes.uv, i=k%HOMESIGNS.length, u0=(i%HS_C)/HS_C, v1=1-Math.floor(i/HS_C)/HS_R;
    for(let j=0;j<U.count;j++) U.setXY(j, u0+U.getX(j)/HS_C, v1-(1-U.getY(j))/HS_R); push("wp_homesign", g, x, y, z, ry, "#ffffff"); };
  // a ceiling fan: a hub, a light bowl, five blades on a part of its own that turns (WESTPARK.update)
  const FAN_MAT=new T.MeshStandardMaterial({color:0x6a4a2e, roughness:0.6}), FAN_GEO=(function(){ const g=new T.BoxGeometry(0.46, 0.012, 0.11); g.translate(0.30, 0, 0); return g; })();
  function fan(x, y, z){ C(0.012, 0.27, x, y+0.135, z, "#c8b48a", 8); CT(0.07, 0.09, 0.1, x, y-0.02, z, "#c8b48a", 14);
    const bowl=new T.SphereGeometry(0.09, 14, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2); push("wp_glowbox", bowl, x, y-0.07, z, 0, "#ffffff");
    const gr=new T.Group(); gr.position.set(x, y+0.01, z); for(let k=0;k<5;k++){ const m=new T.Mesh(FAN_GEO, FAN_MAT); m.rotation.y=k*Math.PI*2/5; m.rotation.x=0.12; gr.add(m); }
    scene.add(gr); WESTPARK.fans.push(gr); }

  for(const t of WESTPARK.trailers){
    const r=_trng(t.no*977+3), {x0, x1, cx=t.x, dk, sd, dir, za, FY, CL, inX0, inX1, xb, rng}=t, zB=za+dir*14.5, no=t.no;
    /* ---- inside ---- */
    use("tr"+no);
    // the living room's rug, a throw on the sofa, a lamp on a table by the recliner, coats by the door, a sign over the TV
    { const [ra, rb]=rng(1.25, 3.15); push("wp_rug", boxGeo(2.1, 0.010, rb-ra), cx+0.05, FY+0.017, (ra+rb)/2, 0, ["#ffffff","#e8d8c8","#d8e0e8"][no%3]);
      const qc=QUILTS[(r()*QUILTS.length)|0]; RB(0.25, 0.03, 0.62, inX0+0.14, FY+0.875, sd(1.85), qc, 0, 0.012); RB(0.035, 0.34, 0.62, inX0+0.262, FY+0.72, sd(1.85), qc, 0, 0.012);
      const lt=[inX0+1.12, sd(0.42)]; C(0.2, 0.03, lt[0], FY+0.58, lt[1], "#6a4a2e", 18); C(0.025, 0.56, lt[0], FY+0.28, lt[1], "#5a3a22", 8); addCol(lt[0]-0.22, lt[0]+0.22, lt[1]-0.22, lt[1]+0.22, FY-0.06, FY+0.6);
      CT(0.05, 0.08, 0.22, lt[0], FY+0.71, lt[1], "#c8a050", 12); CT(0.11, 0.17, 0.2, lt[0], FY+0.92, lt[1], "#efe2c4", 16);
      LAMPS.push({x:lt[0]+0.3, y:FY+0.95, z:lt[1], color:0xffcf90, intensity:0.35, dist:3.2, decay:1.8, indoor:true, vol:[x0, x1, Math.min(za, zB), Math.max(za, zB), FY-0.5, CL+0.2]});
      for(let k=0;k<3;k++){ const hz=sd(2.30+0)+(k-1)*0.17; C(0.008, 0.07, inX1-0.04, FY+1.62, hz, "#c8a050", 6, 0, 0, Math.PI/2);
        if(k!==1){ const cc=["#2a3a5a","#7a2a22","#3a4a2a","#c8a050"][(r()*4)|0]; RB(0.13, 0.64, 0.34, inX1-0.09, FY+1.26, hz, cc, 0, 0.055); S(0.09, inX1-0.09, FY+1.55, hz, cc); } }
      B(0.02, 0.36, 0.84, inX1-0.018, FY+1.66, sd(1.6), "#4a3020"); homeSign(no*5+7, 0.80, 0.32, inX1-0.036, FY+1.66, sd(1.6), -Math.PI/2);
      fan(cx, CL-0.26, sd(2.4)); }
    // the kitchen counter: a coffee maker, a toaster, a dish rack by the sink, a bowl of fruit on the dinette
    { const cd=d=>sd(6.05+d*dir), cxk=inX0+0.32, top=FY+0.902;
      RB(0.22, 0.34, 0.26, cxk, top+0.17, cd(-0.25), "#1a1a1c", 0, 0.03); C(0.06, 0.12, cxk+0.06, top+0.06, cd(-0.25), "#2a2420", 12);
      RB(0.18, 0.16, 0.28, cxk, top+0.08, cd(0.05), ["#c8ccd0","#b82a22","#e8e2d0"][no%3], 0, 0.03);
      B(0.30, 0.10, 0.36, cxk, top+0.05, cd(0.45), "#c8ccd0"); for(let k=0;k<4;k++) C(0.1, 0.012, cxk, top+0.12, cd(0.33+k*0.08), ["#f2f0ea","#2a4a6a","#f2f0ea","#c8a050"][k], 16, Math.PI/2);
      const dx=inX1-0.45, dz=sd(5.2); C(0.13, 0.05, dx, FY+0.79, dz, "#e8e2d0", 16); for(const [ox, oz, col] of [[0.04,0.02,"#c82a1a"],[-0.05,0.03,"#e8b030"],[0,-0.05,"#7ab02a"],[0.01,0.0,"#e85a1a"]]) S(0.04, dx+ox, FY+0.84, dz+oz, col); }
    // the bathroom: a shower curtain on its rod in front of the tub, the toilet's tank
    { const [a, b]=rng(8.4, 10.8), fz=dir>0 ? b-0.80 : a+0.80, mz=(a+b)/2;
      C(0.012, inX1-xb-0.06, (xb+inX1)/2, FY+1.95, fz, "#c8ccd0", 8, 0, 0, Math.PI/2);
      B(inX1-xb-0.16, 1.32, 0.012, (xb+inX1)/2, FY+1.27, fz+dir*0.02, ["#8ac8d8","#e8d8a8","#c8d8b8","#f2e0e8"][no%4]);
      B(0.20, 0.36, 0.44, inX1-0.11, FY+0.60, mz, "#ffffff"); B(0.21, 0.025, 0.45, inX1-0.11, FY+0.79, mz, "#f4f2ee");
      C(0.01, 0.5, inX1-0.04, FY+1.35, dir>0 ? a+0.85 : b-0.85, "#c8ccd0", 6, Math.PI/2); B(0.025, 0.42, 0.34, inX1-0.06, FY+1.12, dir>0 ? a+0.85 : b-0.85, ["#f2f0ea","#8ab0c8","#c87a5a"][no%3]); }
    // the bedroom: a rug by the bed, books and a glass on the nightstand
    { const [ra, rb]=rng(11.15, 12.2); push("wp_rug", boxGeo(1.4, 0.010, rb-ra), cx+0.3, FY+0.017, (ra+rb)/2, 0, "#f2e8e0");
      const nx=cx+1.35, nz=sd(13.9); C(0.05, 0.09, nx, FY+0.57, nz, "#c8b890", 10); C(0.03, 0.09, nx+0.15, FY+0.57, nz-0.1, "#d8e8f0", 10); }
    /* ---- outside: the shell's extras ---- */
    // propane, two tanks at the back end; the electric pedestal; a window unit on some; a dish or an aerial on the roof
    { const pz=zB+dir*0.45; for(const dx of [0.95, 1.45]){ C(0.19, 0.78, cx+dx, Y+0.43, pz, "#e8e8e4", 14); S(0.19, cx+dx, Y+0.82, pz, "#e8e8e4"); C(0.05, 0.08, cx+dx, Y+1.03, pz, "#7a7e80", 8); }
      B(1.0, 0.06, 0.55, cx+1.2, Y+0.03, pz, "#a8a49c"); addCol(cx+0.7, cx+1.7, pz-0.3, pz+0.3, Y-0.5, Y+1.1);
      const ex=x1+0.65, ez=zB-dir*1.2; B(0.12, 1.1, 0.12, ex, Y+0.55, ez, "#7a7e80"); B(0.28, 0.4, 0.16, ex, Y+1.1, ez, "#9a9ea0"); C(0.07, 0.03, ex, Y+1.18, ez-0.0, "#d8e0e0", 14, Math.PI/2); addCol(ex-0.15, ex+0.15, ez-0.1, ez+0.1, Y-0.5, Y+1.3);
      if(no%2===0){ const az=sd(8.9); B(0.30, 0.42, 0.62, x0-0.155, FY+0.55, az, "#d8d8d4"); for(let k=0;k<6;k++) B(0.012, 0.03, 0.56, x0-0.31, FY+0.40+k*0.055, az, "#8a8a86"); addCol(x0-0.32, x0, az-0.32, az+0.32, Y-0.5, FY+0.8); }
      if(no%3===2){ const sx=x1-0.7, sz=sd(1.2); C(0.02, 0.4, sx, CL+0.42, sz, "#c8ccd0", 6); const g=new T.SphereGeometry(0.32, 16, 6, 0, Math.PI*2, 0, 0.7); g.rotateZ(-1.2); ent(g, sx-0.12, CL+0.62, sz, "#e8e8e4"); C(0.035, 0.08, sx+0.2, CL+0.64, sz, "#3a3a3c", 8); }
      if(no%3===0){ const ax=x0+0.35, az=sd(12.8); C(0.02, 1.8, ax, CL+0.95, az, "#a8acb0", 6); for(let k=0;k<5;k++) C(0.008, 0.9-k*0.14, ax, CL+1.2+k*0.17, az, "#a8acb0", 5, Math.PI/2); } }
    /* ---- the deck and the yard ---- */
    use("site");
    const ri=k=>(r()*k)|0;
    // the deck: a welcome mat at the door, a pot of geraniums in the corner, a chair by the rail, a basket from the awning's pole
    { RB(0.48, 0.014, 0.82, x1+0.36, FY+0.016, (t.da+t.db)/2, ["#6a4a2e","#2a4a3a","#7a2a22"][no%3], 0, 0.006);
      const pcz=t.rz-dir*0.32, pcx=x1+0.32; CT(0.17, 0.13, 0.30, pcx, FY+0.15, pcz, "#b8643a", 14); S(0.2, pcx, FY+0.40, pcz, "#3e6a2a");
      for(let k=0;k<5;k++) S(0.06, pcx+Math.cos(k*1.3)*0.13, FY+0.50, pcz+Math.sin(k*1.3)*0.13, ["#e8282a","#f05a8a","#e8282a"][k%3]); addCol(pcx-0.2, pcx+0.2, pcz-0.2, pcz+0.2, FY-0.1, FY+0.5);
      const chx=dk.x1-0.45, chz=t.rz-dir*0.42, ry=-Math.PI/2+(dir>0 ? 0.35 : -0.35), f=XF(chx, chz, ry), cc=["#2a6a5a","#c84a2a","#e8c030","#2a4a8a"][no%4];
      const qq=(w,h,d,lx,ly,lz,c)=>RB(w,h,d, f.x(lx,lz), FY+ly, f.z(lx,lz), c, ry, 0.012);
      qq(0.5, 0.05, 0.48, 0, 0.42, 0, cc); qq(0.5, 0.58, 0.05, 0, 0.72, -0.24, cc); for(const s2 of [-1,1]){ qq(0.05, 0.42, 0.05, s2*0.22, 0.21, 0.2, cc); qq(0.05, 0.42, 0.05, s2*0.22, 0.21, -0.2, cc); qq(0.06, 0.04, 0.5, s2*0.25, 0.62, 0, cc); }
      addCol(chx-0.3, chx+0.3, chz-0.3, chz+0.3, FY-0.1, FY+0.6); addSeat(chx, chz, FY, ry+Math.PI, "A CHAIR ON THE DECK");
      const hb=[x1+1.75, dir>0 ? dk.z1-0.05 : dk.z0+0.05]; C(0.004, 0.32, hb[0], FY+1.67, hb[1], "#2a2a2c", 4); CT(0.17, 0.10, 0.14, hb[0], FY+1.45, hb[1], "#4a3e30", 12);
      for(let k=0;k<7;k++) S(0.07, hb[0]+Math.cos(k*0.9)*0.13, FY+1.52+(k%2)*0.04, hb[1]+Math.sin(k*0.9)*0.13, k%3 ? "#3e7a2a" : ["#c84a8a","#f2f0ea","#8a5ac8"][no%3]); }
    // a kettle grill and a cooler on the gravel behind the deck
    { const gx=dk.x1+0.75, gz=sd(6.1), gc=["#1a1a1c","#7a1a14","#1a2a4a"][no%3];
      const bowl=new T.SphereGeometry(0.29, 16, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2); ent(bowl, gx, Y+0.72, gz, gc);
      const lid=new T.SphereGeometry(0.29, 16, 8, 0, Math.PI*2, 0, Math.PI/2); lid.scale(1, 0.8, 1); ent(lid, gx, Y+0.735, gz, gc); C(0.04, 0.03, gx, Y+0.98, gz, "#3a3a3c", 8);
      for(let k=0;k<3;k++){ const a=k*2.094; tubeE(V3(gx+Math.cos(a)*0.2, Y+0.5, gz+Math.sin(a)*0.2), V3(gx+Math.cos(a)*0.3, Y, gz+Math.sin(a)*0.3), 0.012, "#3a3a3c"); }
      addCol(gx-0.32, gx+0.32, gz-0.32, gz+0.32, Y-0.5, Y+1.0);
      const kx=gx, kz=sd(7.0); RB(0.62, 0.38, 0.38, kx, Y+0.21, kz, ["#2a5a9a","#c82a1a","#e8e2d0"][no%3], 0, 0.04); RB(0.64, 0.06, 0.40, kx, Y+0.42, kz, "#f2f0ea", 0, 0.025); addCol(kx-0.33, kx+0.33, kz-0.2, kz+0.2, Y-0.5, Y+0.46); }
    // solar lights along the gravel's lane-side edge; a pink flamingo or two and a gnome by the flowers
    for(let k=0;k<4;k++){ const lx=t.px0-0.2, lz=sd(1.0+k*2.0); C(0.012, 0.32, lx, Y+0.16, lz, "#2a2a2c", 6); C(0.045, 0.05, lx, Y+0.35, lz, "#2a2a2c", 10); push("cafe_string", new T.SphereGeometry(0.03, 8, 6), lx, Y+0.39, lz, 0, "#ffffff"); }
    for(const [fx, fd, ry] of [[x0-0.8, -0.65, 0.4],[x0-1.25, -0.45, -0.6]].slice(0, 1+no%2)){ const fz=sd(fd);
      C(0.006, 0.55, fx, Y+0.27, fz, "#2a2a2c", 4); const b=new T.SphereGeometry(0.12, 12, 8); b.scale(1.5, 0.8, 0.8); ent(b, fx, Y+0.62, fz, "#f070a8", 0, ry, 0);
      tubeE(V3(fx+0.1*Math.cos(ry), Y+0.66, fz-0.1*Math.sin(ry)), V3(fx+0.16*Math.cos(ry), Y+0.86, fz-0.16*Math.sin(ry)), 0.018, "#f070a8"); S(0.04, fx+0.17*Math.cos(ry), Y+0.88, fz-0.17*Math.sin(ry), "#f070a8"); }
    { const gx=x0+3.75, gz=za-dir*0.45; CT(0.07, 0.10, 0.18, gx, Y+0.09, gz, "#2a5aa8", 10); S(0.065, gx, Y+0.24, gz, "#f2c8a0"); CT(0.0, 0.07, 0.2, gx, Y+0.38, gz, "#c82a1a", 10); S(0.05, gx, Y+0.20, gz-0.04*dir, "#f2f0ea"); }
    // by turns: a hammock, a clothesline, a kiddie pool, bikes against the skirting, tiki torches
    const kind=no%5;
    if(kind===0){ const hx=x0-3.3, hz0=sd(10.2), hz1=sd(13.8);
      for(const hz of [hz0, hz1]){ B(0.12, 1.6, 0.12, hx, Y+0.8, hz, "#6a4a2e"); addCol(hx-0.08, hx+0.08, hz-0.08, hz+0.08, Y-0.5, Y+1.6); }
      const n=10, col=["#c84a2a","#2a6a9a","#e8c030"][no%3]; for(let k=0;k<n;k++){ const ta=k/n, tb=(k+1)/n, ya=Y+1.35-Math.sin(ta*Math.PI)*0.75, yb=Y+1.35-Math.sin(tb*Math.PI)*0.75;
        const p0=V3(hx, ya, hz0+(hz1-hz0)*ta), p1=V3(hx, yb, hz0+(hz1-hz0)*tb); for(const ox of [-0.32, -0.16, 0, 0.16, 0.32]){ tubeE(p0.clone().setX(hx+ox*Math.sin(ta*Math.PI+0.2)), p1.clone().setX(hx+ox*Math.sin(tb*Math.PI+0.2)), 0.02, k%2 ? col : "#f2f0ea"); } }
      addCol(hx-0.4, hx+0.4, Math.min(hz0, hz1)+0.2, Math.max(hz0, hz1)-0.2, Y-0.5, Y+0.8); addSeat(hx, (hz0+hz1)/2, Y+0.15, Math.PI/2, "THE HAMMOCK", true); }
    else if(kind===1){ const lx=x0-3.0, lz0=sd(10.0), lz1=sd(14.0);
      for(const lz of [lz0, lz1]){ C(0.035, 1.9, lx, Y+0.95, lz, "#8a8d90", 8); B(0.9, 0.04, 0.04, lx, Y+1.85, lz, "#8a8d90"); addCol(lx-0.07, lx+0.07, lz-0.07, lz+0.07, Y-0.5, Y+1.9); }
      for(const ox of [-0.35, 0.35]) tubeE(V3(lx+ox, Y+1.85, lz0), V3(lx+ox, Y+1.83, lz1), 0.004, "#e8e8e4");
      for(let k=0;k<5;k++){ const cz=lz0+(lz1-lz0)*(0.15+k*0.17), ox=k%2 ? 0.35 : -0.35, w=0.4+r()*0.3, h=0.35+r()*0.4;
        B(0.015, h, w, lx+ox, Y+1.84-h/2, cz, ["#f2f0ea","#2a4a8a","#c84a2a","#e8c030","#8ac8a8","#f070a8"][ri(6)]); } }
    else if(kind===2){ const px=x0-2.4, pz=sd(11.2); C(0.85, 0.24, px, Y+0.12, pz, "#3a8ad8", 26); C(0.80, 0.02, px, Y+0.20, pz, "#8ad0e8", 26); C(0.86, 0.04, px, Y+0.25, pz, "#5aa8e8", 26);
      ent(new T.TorusGeometry(0.22, 0.06, 8, 18), px+0.3, Y+0.24, pz-0.2, "#f2c41c", Math.PI/2, 0, 0); S(0.11, px-0.4, Y+0.32, pz+0.3, "#e83a3a"); addCol(px-0.86, px+0.86, pz-0.86, pz+0.86, Y-0.5, Y+0.26); }
    else if(kind===3){ for(const [bz, bc] of [[11.7, "#c82a1a"],[12.5, "#2a6ad8"]]){ const bx2=x0-0.3, z=sd(bz);
        for(const dz of [-0.52, 0.52]) ent(new T.TorusGeometry(0.31, 0.025, 6, 24), bx2, Y+0.33, z+dz, "#1a1a1a", 0, Math.PI/2, 0);
        tubeE(V3(bx2, Y+0.33, z-0.52), V3(bx2, Y+0.68, z+0.05), 0.018, bc); tubeE(V3(bx2, Y+0.68, z+0.05), V3(bx2, Y+0.33, z+0.52), 0.018, bc); tubeE(V3(bx2, Y+0.68, z+0.05), V3(bx2, Y+0.72, z-0.40), 0.018, bc);
        RB(0.10, 0.04, 0.24, bx2, Y+0.80, z+0.05, "#1a1a1a", 0, 0.015); C(0.012, 0.5, bx2, Y+0.95, z-0.42, "#2a2a2c", 6, Math.PI/2); addCol(bx2-0.15, bx2+0.15, z-0.85, z+0.85, Y-0.5, Y+1.0); } }
    else { for(const tz of [1.4, 4.6]){ const tx2=x0-4.3, z=sd(tz); C(0.025, 1.7, tx2, Y+0.85, z, "#8a6a3a", 6); CT(0.06, 0.04, 0.16, tx2, Y+1.75, z, "#5a4a2e", 10);
        push("cafe_string", new T.SphereGeometry(0.045, 8, 6), tx2, Y+1.86, z, 0, "#ffffff"); addCol(tx2-0.06, tx2+0.06, z-0.06, z+0.06, Y-0.5, Y+1.8); } }
    // the lot's fire, lit after dark at every third lot
    if(no%3===1) campfire(x0-2.4, sd(3.0), 0.75, false);
  }
  // a radio on a deck, the ballgame on; the Pine Knot's jukebox
  { const T4=WESTPARK.trailers[3], rx=T4.dk.x1-0.06, rz=(T4.da+T4.db)/2-T4.dir*0.3; WESTPARK.radios.push({x:rx, y:T4.FY+1.0, z:rz, station:2, open:true, vol:0.4, reach:26});
    RB(0.11, 0.17, 0.30, rx, T4.FY+1.035, rz, "#3a3a3c", 0, 0.03); C(0.04, 0.012, rx-0.058, T4.FY+1.04, rz+0.07, "#8a8d90", 12, 0, 0, Math.PI/2); }

  /* ---- the common fire burns; people round the lots' fires after dark (decided while you are away) ---- */
  campfire(-1000, -1100, 1.25, true);

  /* ---- the farms on the way: a scarecrow and bales in the pumpkin patch, the farm signs ---- */
  { const sx=-402, sz=Z+HW+15.5;
    B(0.08, 2.4, 0.08, sx, Y+1.2, sz, "#6a4a2e"); B(1.3, 0.07, 0.07, sx, Y+1.75, sz, "#6a4a2e");
    RB(0.5, 0.62, 0.26, sx, Y+1.55, sz, "#7a3a2a", 0, 0.08); for(const s2 of [-1,1]) RB(0.56, 0.14, 0.14, sx+s2*0.42, Y+1.76, sz, "#7a3a2a", 0, 0.05);
    RB(0.42, 0.6, 0.24, sx, Y+0.98, sz, "#3a4a6a", 0, 0.06); S(0.17, sx, Y+2.02, sz, "#e8c890"); CT(0.0, 0.34, 0.12, sx, Y+2.22, sz, "#c8a050", 18); C(0.3, 0.02, sx, Y+2.16, sz, "#c8a050", 18);
    for(let k=0;k<6;k++) B(0.012, 0.16, 0.012, sx+(k-2.5)*0.08, Y+1.18, sz+0.13, "#e8c860"); addCol(sx-0.2, sx+0.2, sz-0.2, sz+0.2, Y-0.5, Y+2.4);
    for(const [bx2, bz, ry] of [[-428, Z+HW+13.8, 0.2],[-431, Z+HW+14.4, 1.0],[-429.5, Z+HW+15.6, 0.6]]){ ent(new T.CylinderGeometry(0.62, 0.62, 1.2, 20), bx2, Y+0.62, bz, "#c8a860", 0, ry, Math.PI/2); addCol(bx2-0.7, bx2+0.7, bz-0.7, bz+0.7, Y-0.5, Y+1.2); }
    const farmSign=(x, z, ry, l1, l2, bg)=>{ for(const dx of [-0.75, 0.75]) B(0.1, 1.5, 0.1, x+dx*Math.cos(ry), Y+0.75, z-dx*Math.sin(ry), "#6a4a2e");
      sign(1.8, 0.9, (c,Wd,Hh)=>{ c.fillStyle=bg; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#f2f0ea"; c.lineWidth=6; c.strokeRect(8,8,Wd-16,Hh-16);
        say(c, l1, Wd/2, Hh*0.40, Wd*0.78, Hh*0.30, "#f2f0ea", "800", "Georgia, serif"); say(c, l2, Wd/2, Hh*0.70, Wd*0.78, Hh*0.15, "#f2e6c8", "700", "Arial"); }, x+0.06*Math.sin(ry), Y+1.3, z+0.06*Math.cos(ry), ry, false, 480);
      B(1.9, 1.0, 0.05, x, Y+1.3, z, "#5a3a22", ry); addCol(x-1.0, x+1.0, z-0.2, z+0.2, Y-0.5, Y+1.8); };
    farmSign(-372, Z+HW+5.2, Math.PI, "U-PICK PUMPKINS", "WAGON RIDES · WEEKENDS IN OCTOBER", "#c8641a");
    farmSign(-700, Z-HW-5.2, 0, "CHOOSE & CUT", "CHRISTMAS TREES · SAWS LOANED", "#2e5a32");
    farmSign(-560, Z-HW-5.2, 0, "SUNFLOWER MAZE", "OPEN DAILY · BRING A CAMERA", "#c8961a");
    farmSign(-398, Z-HW-5.2, 0, "HOLLOWAY VINEYARD", "TASTINGS SAT & SUN · NOON TO SIX", "#5a2a4a"); }

  /* ---- the hall, outside: gutters and downspouts, beds along the front, coach lamps by the door, the lot's cars ---- */
  use("hall");
  { const zm=(hz0+hz1)/2, run=(hz1-hz0)/2+0.5, gy2=RIDGE-1.5*run/((hz1-hz0)/2)-0.08;
    for(const s2 of [-1,1]){ const gz=zm+s2*(run+0.07); C(0.065, hx1-hx0+1.0, (hx0+hx1)/2, gy2, gz, "#e8e4d8", 10, 0, 0, Math.PI/2);
      for(const dx of [hx0+0.15, hx1-0.15]){ const wz=s2<0 ? hz0-0.06 : hz1+0.06; tubeE(V3(dx, gy2-0.04, gz), V3(dx, gy2-0.42, wz), 0.035, "#e8e4d8");
        tubeE(V3(dx, gy2-0.42, wz), V3(dx, Y+0.25, wz), 0.035, "#e8e4d8"); tubeE(V3(dx, Y+0.25, wz), V3(dx, Y+0.05, wz+s2*0.35), 0.035, "#e8e4d8"); } }
    // the beds: mulch, round shrubs and orange daylilies either side of the stoop
    for(const [a, b] of [[hx0+0.4, ND.a-1.7],[ND.b+1.7, hx1-0.4]]){ B(b-a, 0.08, 0.9, (a+b)/2, Y+0.04, hz0-0.5, "#4a3424");
      for(let x=a+0.5; x<b-0.3; x+=1.3) S(0.38, x, Y+0.34, hz0-0.48, "#3a5a2a");
      for(let x=a+1.15; x<b-0.4; x+=1.3){ for(let k=0;k<5;k++) S(0.07, x+Math.cos(k*1.26)*0.18, Y+0.62+((k*7)%3)*0.04, hz0-0.62+Math.sin(k*1.26)*0.14, "#f07a1a"); S(0.2, x, Y+0.3, hz0-0.6, "#4a7a2a"); }
      addCol(a, b, hz0-0.95, hz0, Y-0.5, Y+0.7); }
    for(const lx of [ND.a-0.4, ND.b+0.4]){ B(0.14, 0.30, 0.10, lx, HFY+1.95, hz0-0.06, "#1a1a1c"); push("cafe_string", new T.SphereGeometry(0.05, 10, 8), lx, HFY+1.93, hz0-0.12, 0, "#ffffff");
      LAMPS.push({x:lx, y:HFY+1.9, z:hz0-0.5, color:0xffd8a0, intensity:0.5, dist:8, decay:1.5}); }
    for(const x of [-1137, -1133.5, -1110.5, -1107]) RB(1.6, 0.13, 0.22, x, Y+0.085, -1187.0, "#b8b4a8", 0, 0.04);
    parked(0, "#8a2a22", -1137, -1189.6, Math.PI, Y); parked(2, "#e8e2d0", -1107, -1189.6, Math.PI, Y); }

  /* ---- the hall, inside: a chair rail and baseboard round the meeting room, the flags, a trophy case, the coat rack ---- */
  { const railX=(z, side, a, b, gaps)=>{ let p=a; for(const g of gaps.concat([[b, b]])){ if(g[0]-p>0.05){ B(g[0]-p, 0.05, 0.03, (p+g[0])/2, HFY+0.82, z+side*0.022, "#8a6a4a"); B(g[0]-p, 0.12, 0.02, (p+g[0])/2, HFY+0.065, z+side*0.017, "#6a4a2e"); } p=g[1]; } };
    const railZ=(x, side, a, b, gaps)=>{ let p=a; for(const g of gaps.concat([[b, b]])){ if(g[0]-p>0.05){ B(0.03, 0.05, g[0]-p, x+side*0.022, HFY+0.82, (p+g[0])/2, "#8a6a4a"); B(0.02, 0.12, g[0]-p, x+side*0.017, HFY+0.065, (p+g[0])/2, "#6a4a2e"); } p=g[1]; } };
    railX(iz0, 1, ix0+0.05, PX-PT/2-0.05, [[ND.a-0.06, ND.b+0.06]]); railX(iz1, -1, ix0+0.05, PX-PT/2-0.05, []);
    railZ(ix0, 1, iz0+0.05, iz1-0.05, []); railZ(PX-PT/2, -1, iz0+0.05, iz1-0.05, [[KD.a-0.06, KD.b+0.06],[SD.a-0.06, SD.b+0.06]]);
    const flagPA=(c,Wd,Hh)=>{ c.fillStyle="#1f3f7a"; c.fillRect(0,0,Wd,Hh); c.fillStyle="#d8b040"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.14, Hh*0.26, 0, 0, 7); c.fill();
      c.fillStyle="#1f3f7a"; c.beginPath(); c.ellipse(Wd/2, Hh/2, Wd*0.10, Hh*0.19, 0, 0, 7); c.fill(); c.fillStyle="#d8b040"; c.fillRect(Wd*0.47, Hh*0.40, Wd*0.06, Hh*0.2); };
    for(const [fz, fl] of [[-1181.4, flagUS],[-1174.6, flagPA]]){ const fx=ix0+0.45; C(0.016, 2.2, fx, HFY+1.1, fz, "#c8a050", 8); S(0.04, fx, HFY+2.24, fz, "#d8b040"); CT(0.14, 0.18, 0.08, fx, HFY+0.04, fz, "#3a3a3c", 14);
      B(0.04, 0.03, 0.62, fx+0.03, HFY+2.04, fz, "#c8a050"); sign(0.6, 0.95, fl, fx+0.06, HFY+1.55, fz, Math.PI/2, false, 200); addCol(fx-0.18, fx+0.18, fz-0.18, fz+0.18, HFY-0.06, HFY+2.2); }
    // the trophy case between the north windows: glass doors, shelves, cups and plaques
    { const tcx=-1127.5, tcz=iz0+0.25, w=1.4, h=1.85, d=0.42;
      B(w, 0.12, d, tcx, HFY+0.06+0.005, tcz, "#5a3a22"); B(w, 0.06, d, tcx, HFY+h-0.03, tcz, "#5a3a22"); for(const s2 of [-1,1]) B(0.05, h, d, tcx+s2*(w/2-0.025), HFY+h/2, tcz, "#5a3a22"); B(w-0.1, h-0.18, 0.02, tcx, HFY+h/2+0.03, iz0+0.05, "#3a2414");
      for(const sy of [0.6, 1.05, 1.5]){ push("glass", boxGeo(w-0.12, 0.012, d-0.08), tcx, HFY+sy, tcz-0.02, 0, "#ffffff");
        for(let k=0;k<5;k++){ const x=tcx-0.5+k*0.25, hh=0.16+((k*3+sy*10)%4)*0.05; CT(0.035, 0.05, 0.05, x, HFY+sy+0.03, tcz, "#3a3a3c", 10); CT(0.07, 0.03, hh, x, HFY+sy+0.06+hh/2, tcz, k%2 ? "#d8b040" : "#c8ccd0", 12); } }
      push("glass", planeGeo(w-0.12, h-0.2, 0), tcx, HFY+h/2+0.02, tcz+d/2+0.004, 0, "#ffffff"); addCol(tcx-w/2, tcx+w/2, iz0, tcz+d/2+0.02, HFY-0.06, HFY+h); }
    // the coat rack by the door: a rail of hooks, a few coats, a hat
    { const cx3=-1120.9; B(1.6, 0.08, 0.03, cx3, HFY+1.65, iz0+0.022, "#6a4a2e");
      for(let k=0;k<6;k++){ const x=cx3-0.65+k*0.26; C(0.01, 0.08, x, HFY+1.66, iz0+0.07, "#c8a050", 6, Math.PI/2); if(k%2===0) RB(0.36, 0.78, 0.12, x, HFY+1.25, iz0+0.13, ["#2a3a5a","#5a3a22","#7a2a22"][k/2], 0, 0.05); }
      S(0.12, cx3+0.39, HFY+1.72, iz0+0.13, "#3a5a2a"); }
    // a clock over the pass-through
    C(0.17, 0.035, PX-PT/2-0.03, HFY+2.38, (PASS.a+PASS.b)/2, "#f2f0ea", 22, 0, 0, Math.PI/2); C(0.18, 0.025, PX-PT/2-0.015, HFY+2.38, (PASS.a+PASS.b)/2, "#2a2a2c", 22, 0, 0, Math.PI/2); }

  /* ---- the Pine Knot: the bar's padded front, the lights behind the bar, the cooler, the popcorn, the pool table ---- */
  use("lounge");
  { const n=8, pw=(BX1-BX0)/n; for(let k=0;k<n;k++) push("wp_vinylpad", boxGeo(pw-0.04, 0.62, 0.04, 4), BX0+(k+0.5)*pw, BF+0.62, BZ+0.32, 0, "#ffffff");
    // christmas lights swagged along the back bar, all year round
    const cols=["#ff3a2a","#3aff5a","#3a7aff","#ffd23a","#ff7af0"], xa=BX0+1.0, xb2=BX1-1.3, m=36;
    for(let k=0;k<m;k++){ const t=k/(m-1), x=xa+(xb2-xa)*t, sag=Math.abs(Math.sin(t*Math.PI*6))*0.12; push("wp_xmas", new T.SphereGeometry(0.022, 6, 5), x, BF+2.06-0.12+sag, QZ0+0.27, 0, cols[k%cols.length]); }
    for(let k=0;k<m-1;k++){ const t0=k/(m-1), t1=(k+1)/(m-1), y0=BF+1.94+Math.abs(Math.sin(t0*Math.PI*6))*0.12+0.015, y1=BF+1.94+Math.abs(Math.sin(t1*Math.PI*6))*0.12+0.015;
      tubeE(V3(xa+(xb2-xa)*t0, y0, QZ0+0.27), V3(xa+(xb2-xa)*t1, y1, QZ0+0.27), 0.003, "#1a2a1a"); }
    lampU({x:(xa+xb2)/2, y:BF+1.9, z:QZ0+0.6, color:0xff9ac0, intensity:0.25, dist:4, decay:1.8, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
    // on the bar: a jar of pickled eggs, a cash register at the back, bowls of pretzels, coasters and a pint or two, ashtrays
    const bt=BF+1.10; C(0.10, 0.24, BX0+0.5, bt+0.12, BZ-0.1, "#e8e0b0", 16); C(0.105, 0.03, BX0+0.5, bt+0.255, BZ-0.1, "#c82a1a", 16);
        RB(0.40, 0.22, 0.36, -1126.4, BF+1.05, QZ0+0.30, "#2a2a2c", 0, 0.03); B(0.3, 0.1, 0.02, -1126.4, BF+1.2, QZ0+0.475, "#1a3a2a");
    for(const x of [-1128.6, -1124.2, -1121.6]){ C(0.11, 0.05, x, bt+0.025, BZ+0.05, "#c8b890", 14); for(let k=0;k<5;k++) S(0.022, x+Math.cos(k*1.3)*0.05, bt+0.055, BZ+0.05+Math.sin(k*1.3)*0.05, "#8a5a2a"); }
    for(const x of [-1129.35, -1127.1, -1123.35]){ C(0.05, 0.006, x, bt+0.004, BZ+0.18, "#f2f0ea", 12); CT(0.042, 0.034, 0.15, x, bt+0.082, BZ+0.18, "#d8a040", 12); C(0.043, 0.02, x, bt+0.168, BZ+0.18, "#f2f0e0", 12); }
    for(const x of [-1125.6, -1122.4]) C(0.06, 0.025, x, bt+0.0125, BZ+0.1, "#3a5a7a", 12);
    // the popcorn machine at the end of the bar, lit from inside
    { const px=BX1-0.38, pz=BZ-0.08; RB(0.44, 0.22, 0.34, px, bt+0.11, pz, "#b81a14", 0, 0.03); push("wp_popcorn", boxGeo(0.38, 0.30, 0.28), px, bt+0.38, pz, 0, "#ffffff");
      RB(0.44, 0.08, 0.34, px, bt+0.60, pz, "#b81a14", 0, 0.03);
      lampU({x:px, y:bt+0.5, z:pz+0.4, color:0xffc860, intensity:0.2, dist:2.2, decay:1.8, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]}); }
    // the beer cooler by the east wall: glass doors, its shelves lit, cans and bottles on them
    { const cx3=-1116.9, cz0=QZ0+0.01, cw=1.4, ch=2.0, cd=0.68, cz1=cz0+cd;
      B(cw, 0.12, cd, cx3, BF+0.06+0.005, cz0+cd/2, "#2a2a2c"); B(cw, 0.14, cd, cx3, BF+ch-0.07, cz0+cd/2, "#2a2a2c"); for(const s2 of [-1,1]) B(0.05, ch, cd, cx3+s2*(cw/2-0.025), BF+ch/2, cz0+cd/2, "#2a2a2c");
      push("wp_glowbox", boxGeo(cw-0.12, ch-0.3, 0.02), cx3, BF+ch/2, cz0+0.04, 0, "#ffffff");
      for(const sy of [0.45, 0.85, 1.25, 1.62]){ B(cw-0.1, 0.02, cd-0.12, cx3, BF+sy, cz0+cd/2-0.02, "#c8ccd0");
        for(let k=0;k<12;k++) C(0.032, 0.12, cx3-0.6+k*0.11, BF+sy+0.07, cz0+0.30+((k*7)%3)*0.08, ["#c82a1a","#2a4ac8","#e8c030","#f2f0ea","#2a8a3a","#7a3a1a"][(k+Math.round(sy*10))%6], 10); }
      push("glass", planeGeo(cw/2-0.06, ch-0.28, 0), cx3-cw/4, BF+ch/2+0.01, cz1+0.004, 0, "#ffffff"); push("glass", planeGeo(cw/2-0.06, ch-0.28, 0), cx3+cw/4, BF+ch/2+0.01, cz1+0.004, 0, "#ffffff");
      B(0.03, ch-0.2, 0.03, cx3, BF+ch/2, cz1+0.01, "#3a3a3c"); for(const s2 of [-1,1]) B(0.02, 0.5, 0.03, cx3+s2*0.07, BF+1.1, cz1+0.03, "#c8ccd0");
      addCol(cx3-cw/2, cx3+cw/2, QZ0, cz1+0.04, BF-0.5, BF+ch);
      lampU({x:cx3, y:BF+1.2, z:cz1+0.5, color:0xe8f4ff, intensity:0.3, dist:3, decay:1.8, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]}); }
    // the pool table in the south-east corner, its lamp over it
    { const px=-1121.5, pz=-1174.85, L=2.36, Wd=1.32;
      RB(L, 0.16, Wd, px, BF+0.70, pz, "#4a2814", 0, 0.05); B(L-0.24, 0.03, Wd-0.24, px, BF+0.785, pz, "#1e6a3a"); for(const s2 of [-1,1]){ RB(L-0.1, 0.06, 0.13, px, BF+0.82, pz+s2*(Wd/2-0.065), "#5a3018", 0, 0.025); RB(0.13, 0.06, Wd-0.1, px+s2*(L/2-0.065), BF+0.82, pz, "#5a3018", 0, 0.025); }
      for(const [lx, lz] of [[-1,-1],[1,-1],[-1,1],[1,1]]) RB(0.14, 0.62, 0.14, px+lx*(L/2-0.15), BF+0.31, pz+lz*(Wd/2-0.15), "#3a2010", 0, 0.03);
      const balls=["#f2f0ea","#e8c030","#2a4ac8","#c82a1a","#5a2a8a","#e86a1a","#2a8a3a","#7a1a1a","#1a1a1a"];
      balls.forEach((bc, k)=>S(0.028, px-0.6+(k%5)*0.24+(k>4 ? 0.12 : 0), BF+0.83, pz-0.25+(k>4 ? 0.3 : 0)+((k*3)%2)*0.1, bc));
      tubeE(V3(px+0.2, BF+0.83, pz+0.4), V3(px+1.3, BF+0.85, pz+0.48), 0.009, "#c8a070");
      addCol(px-L/2, px+L/2, pz-Wd/2, pz+Wd/2, BF-0.5, BF+0.86);
      RB(1.4, 0.16, 0.36, px, BCL-0.55, pz, "#1e4a2a", 0, 0.05); push("wp_glowbox", boxGeo(1.3, 0.02, 0.3), px, BCL-0.635, pz, 0, "#ffffff");
      for(const s2 of [-1,1]) tubeE(V3(px+s2*0.6, BCL-0.47, pz), V3(px+s2*0.6, BCL-0.005, pz), 0.004, "#2a2a2c");
      lampU({x:px, y:BCL-0.7, z:pz, color:0xfff0d0, intensity:0.6, dist:3.6, decay:1.6, vol:[QX0, QX1, QZ0, QZ1, BF-0.5, BCL+0.3]});
      const cr=QX1-0.03; for(let k=0;k<4;k++) tubeE(V3(cr-0.03, BF+0.25, -1176.8+k*0.1), V3(cr-0.03, BF+1.55, -1176.8+k*0.1), 0.011, "#c8a070"); B(0.04, 0.06, 0.5, cr-0.02, BF+1.2, -1176.65, "#3a2414"); }
    // troffers in the drop ceiling over the tables, a fan turning, the dart scores on a chalkboard
    for(const [x, z] of [[-1129.2, -1176.2],[-1125.0, -1176.2],[-1118.5, -1180.6]]) push("tube", boxGeo(1.2, 0.02, 0.6, 0), x, BCL-0.012, z, 0, "#ffffff");
    fan(-1124.5, BCL-0.3, -1178.6);
    sign(0.62, 0.46, (c,Wd,Hh)=>{ c.fillStyle="#1e2a24"; c.fillRect(0,0,Wd,Hh); c.strokeStyle="#7a5232"; c.lineWidth=10; c.strokeRect(0,0,Wd,Hh);
      say(c, "CRICKET", Wd/2, Hh*0.18, Wd*0.7, Hh*0.12, "#e8e8e0", "700", "'Marker Felt', 'Comic Sans MS', cursive");
      c.strokeStyle="rgba(232,232,224,0.85)"; c.lineWidth=2;
      for(let k=0;k<7;k++){ const y=Hh*(0.32+k*0.085); c.beginPath(); c.moveTo(Wd*0.48, y-5); c.lineTo(Wd*0.52, y+5); c.stroke();
        c.fillStyle="#e8e8e0"; c.font="bold 13px Arial"; c.textAlign="center"; c.textBaseline="middle"; c.fillText(["20","19","18","17","16","15","B"][k], Wd*0.5, y);
        for(let j=0;j<(k*5)%4;j++){ c.beginPath(); c.moveTo(Wd*(0.22+j*0.05), y-5); c.lineTo(Wd*(0.25+j*0.05), y+5); c.stroke(); }
        for(let j=0;j<(k*3)%3;j++){ c.beginPath(); c.moveTo(Wd*(0.70+j*0.05), y-5); c.lineTo(Wd*(0.73+j*0.05), y+5); c.stroke(); } } }, QX0+0.03, BF+1.62, -1178.9, Math.PI/2, false, 240); }
  WESTPARK.radios.push({x:QX1-0.6, y:BF+1.2, z:QZ1-0.6, station:0, house:"THE PINE KNOT", zone:"THE PINE KNOT", vol:0.7, reach:30});

  /* ---- the people: a bartender, a few at the bar and at a table; someone at the fire out back, kids on the swings ---- */
  if(typeof crowdGroup==="function"){
    const G=crowdGroup("the pine knot", (QX0+QX1)/2, (QZ0+QZ1)/2, 60), qn=_trng(5353), pick=a=>a[(qn()*a.length)|0];
    G.bounds={x0:QX0+0.3, x1:QX1-0.3, z0:QZ0+0.3, z1:QZ1-0.3};
    const guest=(o)=>Object.assign({h:0.95+qn()*0.1, skin:pick(SKINS), hair:pick(HAIRS), shirt:pick(["#2f5f8f","#b33a3a","#5d6a73","#3d6e44","#7a4f8a","#c99a2a","#2b3d63"]), pants:pick(PANTS),
      shoes:pick(["#1d1d1f","#6b4a2b"]), cap:qn()<0.4 ? pick(["#b3151b","#1f3b6e","#2f5a35","#c8b890"]) : null}, o);
    crowdAdd(G, {look:guest({shirt:"#1d1f22", h:1.0}), x:(BX0+BX1)/2, z:QZ0+0.85, y:BF, yaw:0, mode:"stand", job:"pour"});
    const ST=WESTPARK.stools||[]; for(const k of [1, 2, 5]) if(ST[k]) crowdAdd(G, {look:guest({}), x:ST[k][0], z:ST[k][1], y:BF+0.30, yaw:Math.PI, mode:"sit", sitY:0.545, held:k===2 ? "can" : "pint", drink:true});
    crowdAdd(G, {look:guest({female:true}), x:-1126.0, z:-1178.72, y:BF, yaw:0, mode:"sit", sitY:0.515, held:"rocks", drink:true});
    crowdAdd(G, {look:guest({}), x:-1126.0, z:-1177.28, y:BF, yaw:Math.PI, mode:"sit", sitY:0.515});
    const G2=crowdGroup("french creek pines", -1100, -1120, 170); G2.bounds={x0:P.x0+1, x1:P.x1-1, z0:P.z0+2, z1:P.z1-1};
    crowdAdd(G2, {look:guest({}), x:-1000+3.0*Math.cos(0.3), z:-1100+3.0*Math.sin(0.3), yaw:Math.atan2(-Math.cos(0.3), -Math.sin(0.3)), mode:"sit", sitY:0.45, held:"can", drink:true});
    crowdAdd(G2, {look:guest({female:true}), x:-1000+3.0*Math.cos(0.3+2.513), z:-1100+3.0*Math.sin(0.3+2.513), yaw:Math.atan2(-Math.cos(2.813), -Math.sin(2.813)), mode:"sit", sitY:0.45});
    for(const t of WESTPARK.trailers){ if(t.no%3!==1) continue; const fx=t.x0-2.4, frz=t.sd(3.0);
      [0.6, 2.4].forEach((a, k)=>{ const sx=fx+Math.cos(a)*1.5, sz=frz+Math.sin(a)*1.5, ry=Math.atan2(fx-sx, frz-sz);
        crowdAdd(G2, {look:guest({female:(t.no+k)%2===0}), x:sx, z:sz, y:Y, yaw:ry, mode:"sit", sitY:0.44, held:(t.no+k)%3 ? "can" : null, drink:(t.no+k)%3!==0, when:()=>WESTPARK.nightCrowd}); }); }
    { const t=WESTPARK.trailers[1]; crowdAdd(G2, {look:guest({cap:"#1f3b6e"}), x:t.dk.x1+0.75-0.62, z:t.sd(6.1), y:Y, yaw:Math.PI/2, mode:"stand", held:"can", drink:true, dayOnly:true}); }
    { const t=WESTPARK.trailers[5], chx=t.dk.x1-0.45, chz=t.rz-t.dir*0.42; crowdAdd(G2, {look:guest({female:true}), x:chx, z:chz, y:t.FY, yaw:-Math.PI/2+(t.dir>0 ? 0.35 : -0.35), mode:"sit", sitY:0.50, held:"cup", drink:true, dayOnly:true}); }
    crowdAdd(G2, {look:guest({}), path:crowdRound ? crowdRound([[-1210, LZ-1.2],[-990, LZ-1.2],[-990, LZ+1.2],[-1210, LZ+1.2],[-1210, LZ-1.2]], 2) : [[-1210, LZ-1.2],[-990, LZ-1.2]], mode:"walk", loop:true, speed:1.0, dog:"#c9a066"});
  }

  /* ---- the walls round it all: the road's clearing from the fields to the end of the road, and round the park ---- */
  { const C0=W.corr, wallz=(z, a, b, msg)=>{ const c=addCol(a, b, z-0.4, z+0.4, -40, 300); if(msg) c.msg=msg; return c; };
    wallz(C0.z0, C0.x0, C0.x1);                                                  // north side of the road, all the way
    wallz(C0.z1, P.x1, C0.x1); wallz(C0.z1, C0.x0, P.x0);                          // south side, either side of the park
    addCol(P.x0-0.4, P.x0+0.4, C0.z1, P.z1, -40, 300); addCol(P.x1-0.4, P.x1+0.4, C0.z1, P.z1, -40, 300); addCol(P.x0, P.x1, P.z1-0.4, P.z1+0.4, -40, 300);
    addCol(C0.x0-0.4, C0.x0+0.4, C0.z0, C0.z1, -40, 300).msg="US 6N RUNS ON WEST FROM HERE. THIS IS AS FAR AS THE MAP GOES"; }

  // the routes the walking test takes: the lane, into a trailer and through it, into the hall and down to the lounge
  { const T1=WESTPARK.trailers[0], sdT=d=>T1.za+T1.dir*d;
    WESTPARK.routes={"french creek pines: the lane":[[GX, Z+HW+1],[GX, LZ],[-1205, LZ],[-990, LZ]],
      "french creek pines: a trailer":[[T1.x1+4.2, LZ],[T1.steps.x, T1.steps.z],[T1.door.x, T1.door.z],[T1.x+0.6, T1.door.z],[T1.x+0.6, sdT(7.95)],[T1.x-1.51, sdT(7.95)],[T1.x-1.51, sdT(10.0)],[T1.x-1.51, sdT(11.1)],[T1.x-1.0, sdT(11.8)]],
      "french creek pines: the hall and the lounge":[[(ND.a+ND.b)/2, Z+HW+1.5],[(ND.a+ND.b)/2, hz0-2.0],[(ND.a+ND.b)/2, hz0+1.5],[-1118.5, (SD.a+SD.b)/2],[-1116.35, (SD.a+SD.b)/2],[-1116.35, SWZ1+0.45],
        [(SWX0+SWX1)/2, SWZ1+0.45],[(SWX0+SWX1)/2, SWZ1-0.3],[(SWX0+SWX1)/2, SWZ0-0.6],[-1118.0, -1180.6],[-1125.5, -1180.6]]}; }

  // the merged meshes: the site, each trailer, the hall, the lounge
  for(const k in groups){ if(!groups[k].length) continue; const m=new T.Mesh(mergeEntries(groups[k]), new T.MeshStandardMaterial({vertexColors:true, roughness:0.7, metalness:0.05}));
    m.castShadow=k!=="lounge"; m.receiveShadow=true; m.name="westpark-"+k; scene.add(m); }
  WESTPARK.hall={x0:hx0, x1:hx1, z0:hz0, z1:hz1, FY:HFY, BF:BF, door:ND};
})();
/* the park's frame: the fires flicker (the common one always, the lots' after dark), the fans turn, and whether the lots'
   people are out by their fires is decided only while you are well away */
function updateWestPark(dt, dark){
  const W=WESTPARK; if(!W.fires) return;
  const cam=camera.position, t=typeof CROWD!=="undefined" ? CROWD.t : performance.now()/1000;
  const near=Math.abs(cam.x+1100)<280 && Math.abs(cam.z+1130)<220;
  if(!near) W.nightCrowd=dark>0.5;
  if(!near && !W._parked){ W._parked=true; for(const F of W.fires){ F.vis=false; for(const m of F.flames) m.visible=false; F.halo.visible=false; F.coals.visible=false; F.l.intensity=0; } return; }
  if(!near) return; W._parked=false;
  for(const F of W.fires){
    const on=F.always || dark>0.3, d=Math.hypot(cam.x-F.x, cam.z-F.z), vis=on && d<150;
    if(vis!==F.vis){ F.vis=vis; for(const m of F.flames) m.visible=vis; F.halo.visible=vis; F.coals.visible=vis; }
    if(!on){ F.l.intensity=0; continue; }
    const n=0.5+0.5*Math.sin(t*7.3+F.x)*Math.sin(t*3.1+1.3)+0.25*Math.sin(t*17.9+F.z), fl=0.78+0.22*clamp(n, 0, 1);
    F.l.intensity=(F.always ? 1.3 : 0.9)*fl*(0.4+0.6*smoothstep(0.1, 0.6, dark));
    F.halo.material.opacity=(0.12+0.40*dark)*fl; F.coals.material.opacity=0.65+0.35*Math.sin(t*2.1+F.x)*Math.sin(t*0.7);
    if(!vis) continue;
    for(let i=0;i<F.flames.length;i++){ const m=F.flames[i];
      m.rotation.y=Math.atan2(cam.x-m.position.x, cam.z-m.position.z)+(i-1)*0.5; m.material.uniforms.time.value=t+i*3.7+F.x; m.material.uniforms.k.value=0.85+0.15*fl; }
    if(d>60) continue;
    F.sparkT-=dt; F.pop-=dt; F.smokeT-=dt; const s=F.sc;
    if(F.sparkT<=0 && typeof SPARKS!=="undefined"){ F.sparkT=(0.08+Math.random()*0.14)/s;
      SPARKS.emit(F.x+(Math.random()-0.5)*0.3*s, F.y+0.3*s, F.z+(Math.random()-0.5)*0.3*s, (Math.random()-0.5)*0.4, 1.2+Math.random()*1.4, (Math.random()-0.5)*0.4, 0.03+Math.random()*0.02, 0.8+Math.random()*1.2); }
    if(F.pop<=0 && typeof SPARKS!=="undefined"){ F.pop=3+Math.random()*8;
      for(let k=0;k<5+Math.random()*6;k++) SPARKS.emit(F.x+(Math.random()-0.5)*0.25*s, F.y+0.25*s, F.z+(Math.random()-0.5)*0.25*s, (Math.random()-0.5)*1.2, 1.8+Math.random()*2.0, (Math.random()-0.5)*1.2, 0.035+Math.random()*0.025, 0.9+Math.random()*1.0); }
    if(F.smokeT<=0 && typeof PUFFS!=="undefined"){ F.smokeT=(0.14+Math.random()*0.08)/s;
      PUFFS.emit(F.x+(Math.random()-0.5)*0.25*s, F.y+0.85*s, F.z+(Math.random()-0.5)*0.25*s, (Math.random()-0.5)*0.1, 0.6+Math.random()*0.3, (Math.random()-0.5)*0.1, 0.18*s, 1.3+Math.random()*0.7, 4.5+Math.random()*2, 0.20, 0.62, 0.9*dark+0.2); } }
  for(const g of W.fans){ if(Math.hypot(cam.x-g.position.x, cam.z-g.position.z)<25) g.rotation.y+=dt*4.2; }
}
