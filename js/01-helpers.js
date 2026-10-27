"use strict";
/* REST AREA · 01-helpers.js
   rng, geometry makers, merge buckets, push(), local frames, doors
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   1 · HELPERS
   ---------------------------------------------------------------------- */
const T = THREE;
const V3 = (x,y,z)=>new T.Vector3(x||0,y||0,z||0);
const clamp = (v,a,b)=>v<a?a:v>b?b:v;
const lerp  = (a,b,t)=>a+(b-a)*t;
const smoothstep=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};

function mat(color, opts){
  return new T.MeshStandardMaterial(Object.assign({color:color, roughness:0.92, metalness:0.0}, opts||{}));
}
function cvs(w,h){ const c=document.createElement("canvas"); c.width=w; c.height=h; return c; }
function setSRGB(t){ try{ t.colorSpace=T.SRGBColorSpace; }catch(e){ t.encoding=T.sRGBEncoding; } return t; }
function rep(t,x,y){ t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(x,y); return t; }

/* Registries that several files push into. They are declared here, before
   any of them, because a registry declared in a later file throws the
   moment an earlier one reaches for it (the GLOW lesson, paid for once). */
const ANIM=[];           // textures redrawn on a timer
const GLOW=[];           // materials that ramp with the clock (see 19-loop)
const DOORS=[];          // swinging leaves (see makeDoor)
const LAMPS=[];          // fixtures the light pool may drive (see 16-lighting)
const NEON=[];           // lit sign faces that brighten after dark
const IMG_STATUS={};

// draw a slot's fallback art at exactly the slot's aspect ratio
function artTex(key, long, draw){
  const a=SLOT[key.split(":")[0]], W=a[0]>=a[1]?long:Math.round(long*a[0]/a[1]),
        H=a[1]>=a[0]?long:Math.round(long*a[1]/a[0]);
  const c=cvs(W,H), x=c.getContext("2d");
  x.fillStyle="#ffffff"; x.fillRect(0,0,W,H);
  draw(x,W,H);
  return hosted(key, setSRGB(new T.CanvasTexture(c)), {aspect:a[0]/a[1]});
}
// swap in the hosted picture for this slot, if one has been named; the
// canvas art stays up until it arrives, and for good if it never does
function hosted(key, tex, opt){
  opt=opt||{};
  const url=IMAGES[key];
  if(!url) return tex;
  new T.TextureLoader().load(IMAGE_PROXY ? IMAGE_PROXY+encodeURIComponent(url) : url, t=>{
    IMG_STATUS[key]="loaded";
    tex.image=t.image; setSRGB(tex);
    const iw=t.image.naturalWidth||t.image.width, ih=t.image.naturalHeight||t.image.height;
    if(opt.aspect && iw && ih){
      const want=opt.aspect, have=iw/ih;
      if(have>want){ const r=want/have; tex.repeat.set(r,1); tex.offset.set((1-r)/2,0); }
      else         { const r=have/want; tex.repeat.set(1,r); tex.offset.set(0,(1-r)/2); }
    }
    tex.needsUpdate=true;
  }, undefined, ()=>{ IMG_STATUS[key]="failed"; });
  return tex;
}
function tickAnim(now){
  for(let i=0;i<ANIM.length;i++){ const a=ANIM[i]; a.draw(a.c, now); a.tex.needsUpdate=true; }
}

// deterministic little PRNG so the scene is identical every load
let _seed = 1979;
function rnd(){ _seed = (_seed*1664525 + 1013904223) & 0x7fffffff; return _seed/0x7fffffff; }
function rr(a,b){ return a + rnd()*(b-a); }
function pick(a){ return a[(rnd()*a.length)|0]; }
// a hash of a position, for things that must not change when the order of
// construction does (which tree is which species, which stall is taken)
function hash2(x,z){ const s=Math.sin(x*127.1+z*311.7)*43758.5453; return s-Math.floor(s); }

/* --- box geometry with world-scaled UVs -------------------------------
   BoxGeometry lays its 24 verts out as +X,-X,+Y,-Y,+Z,-Z (4 verts each), so
   each face's 0..1 UV can be rescaled by that face's real dimensions. This is
   what lets many differently-sized boxes merge into one mesh and still share a
   tiling texture at a consistent scale.                                  */
function boxGeo(w,h,d,uvScale){
  const g=new T.BoxGeometry(w,h,d);
  if(uvScale){
    const a=g.attributes.uv, s=uvScale;
    const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
    for(let f=0;f<6;f++) for(let i=0;i<4;i++){
      const k=f*4+i;
      a.setXY(k, a.getX(k)*dims[f][0]*s, a.getY(k)*dims[f][1]*s);
    }
    a.needsUpdate=true;
  }
  return g;
}
// A box with its edges and corners rounded off, r in metres (seg steps round each
// edge), its normals bent round them so it shades soft. UVs are box-projected in
// metres, so a tiling map (grain, cloth) lies on it at a steady scale. Cached by size.
const _RBOX=new Map();
function rboxGeo(w,h,d,r,seg){
  seg=seg||2; r=Math.min(r, w/2-1e-4, h/2-1e-4, d/2-1e-4);
  const key=[w,h,d,r,seg].map(v=>+v.toFixed(4)).join(",");
  let g=_RBOX.get(key); if(g) return g;
  const n=seg*2+1;
  g=new T.BoxGeometry(1,1,1,n,n,n).toNonIndexed();
  const P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv, half=0.5/n;
  const bx=w/2-r, by=h/2-r, bz=d/2-r, nv=new T.Vector3();
  for(let i=0;i<P.count;i++){
    const x=P.getX(i), y=P.getY(i), z=P.getZ(i);
    nv.set(x-Math.sign(x)*half, y-Math.sign(y)*half, z-Math.sign(z)*half).normalize();
    const px=bx*Math.sign(x)+nv.x*r, py=by*Math.sign(y)+nv.y*r, pz=bz*Math.sign(z)+nv.z*r;
    P.setXYZ(i, px, py, pz); N.setXYZ(i, nv.x, nv.y, nv.z);
    const ax=Math.abs(nv.x), ay=Math.abs(nv.y), az=Math.abs(nv.z);
    if(ay>=ax && ay>=az) U.setXY(i, px, pz); else if(ax>=az) U.setXY(i, pz, py); else U.setXY(i, px, py);
  }
  P.needsUpdate=N.needsUpdate=U.needsUpdate=true;
  _RBOX.set(key, g); return g;
}
// An icosahedron with every normal pointed straight out from its centre:
// twenty triangles that shade as a soft ball. Cached by radius.
const _BLOBS=new Map();
function blobGeo(r){
  const k=r.toFixed(3);
  let g=_BLOBS.get(k);
  if(g) return g;
  g=new T.IcosahedronGeometry(r,0);
  const pos=g.attributes.position, nrm=new Float32Array(pos.count*3);
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i), L=Math.hypot(x,y,z)||1;
    nrm[i*3]=x/L; nrm[i*3+1]=y/L; nrm[i*3+2]=z/L;
  }
  g.setAttribute("normal", new T.BufferAttribute(nrm,3));
  _BLOBS.set(k,g);
  return g;
}
// A rock: an icosahedron with every corner pushed in or out. The radial
// factor is shared per corner or the rock comes apart into shards.
// a rock: a subdivided ball pushed in and out by a few smooth lumps, squashed, its vertices shared so
// it shades round, not in facets (the big ones finer: you sit against those)
function rockGeo(s, seed){
  const det=s>=0.9 ? 3 : s>=0.45 ? 2 : 1;
  const src=new T.IcosahedronGeometry(1, det), sp=src.attributes.position;
  let sd2=seed*9301+4;
  const r3=()=>{ sd2=(sd2*9301+49297)%233280; return sd2/233280; };
  const squash=0.55+r3()*0.34;
  // lumps: a handful of waves through the ball at random headings, long and short
  const L=[]; for(let k=0;k<6;k++){ const th=r3()*6.283, ph=Math.acos(2*r3()-1), f=k<2?1.3+r3()*0.8 : k<4?2.6+r3()*1.6 : 5+r3()*3;
    L.push({x:Math.sin(ph)*Math.cos(th)*f, y:Math.cos(ph)*f, z:Math.sin(ph)*Math.sin(th)*f, p:r3()*6.283, a:k<2?0.11:k<4?0.06:0.025}); }
  const pos=[], idx=[], seen=new Map();
  for(let i=0;i<sp.count;i++){
    const x=sp.getX(i), y=sp.getY(i), z=sp.getZ(i), key=x.toFixed(4)+","+y.toFixed(4)+","+z.toFixed(4);
    let v=seen.get(key);
    if(v===undefined){ let f=0.86; for(const w of L) f+=w.a*Math.sin(w.x*x+w.y*y+w.z*z+w.p);
      v=pos.length/3; seen.set(key,v); pos.push(x*f*s, y*f*s*squash, z*f*s); }
    idx.push(v);
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos,3)); g.setIndex(idx);
  // (spherical UVs, for the maps that want them)
  const uv=[]; for(let i=0;i<pos.length;i+=3){ const x=pos[i], y=pos[i+1], z=pos[i+2], r=Math.hypot(x,y,z)||1; uv.push(0.5+Math.atan2(z,x)/6.283, 0.5+Math.asin(y/r)/3.1416); }
  g.setAttribute("uv", new T.Float32BufferAttribute(uv,2));
  g.computeVertexNormals();
  return g;
}
// flat panel with world-scaled UVs
function planeGeo(w,h,uvScale){
  const g=new T.PlaneGeometry(w,h);
  if(uvScale){ const a=g.attributes.uv;
    for(let i=0;i<a.count;i++) a.setXY(i, a.getX(i)*w*uvScale, a.getY(i)*h*uvScale);
    a.needsUpdate=true; }
  return g;
}
/* A decal is one whole cell of a 2x2 sheet, never a free crop: a crop out of
   the middle of a map has a hard edge where the window cuts it. */
let _cellN=0;
function cellGeo(w,h,cols,rows,seed){
  const g=new T.PlaneGeometry(w,h), a=g.attributes.uv;
  let sd=((seed===undefined||seed===0) ? (++_cellN)*2654435761 : seed*9781)&0x7fffffff;
  const r=()=>{ sd=(sd*1103515245+12345)&0x7fffffff; return sd/0x7fffffff; };
  const ci=Math.min(cols-1, Math.floor(r()*cols)), ri=Math.min(rows-1, Math.floor(r()*rows));
  const su=1/cols, sv=1/rows, ins=0.004, flip=r()<0.5;
  for(let i=0;i<a.count;i++){
    let u=a.getX(i); if(flip) u=1-u;
    a.setXY(i, (ci+ins)*su+u*su*(1-ins*2), (ri+ins)*sv+a.getY(i)*sv*(1-ins*2));
  }
  a.needsUpdate=true;
  return g;
}
function streakGeo(w,h,seed){ return cellGeo(w,h,2,2,seed); }
function puddleGeo(rx, rz, seed){
  const N=30, g=new T.CircleGeometry(1, N), p=g.attributes.position;
  const ph=[1,2,3].map(k=>(((Math.sin((seed||1)*12.9898+k*78.233)*43758.5)%1+1)%1)*6.283);
  for(let i=1;i<p.count;i++){
    const x=p.getX(i), y=p.getY(i), t=Math.atan2(y,x);
    const k=1+0.20*Math.sin(2*t+ph[0])+0.11*Math.sin(3*t+ph[1])+0.06*Math.sin(5*t+ph[2]);
    p.setXY(i, x*k*rx, y*k*rz);
  }
  g.rotateX(-Math.PI/2);
  return g;
}
// a disc lying flat in xz with world-scaled UVs (picnic pads, manhole lids)
function discGeo(r, seg, uvScale){
  const g=new T.CircleGeometry(r, seg||28), a=g.attributes.uv, p=g.attributes.position;
  for(let i=0;i<a.count;i++) a.setXY(i, p.getX(i)*(uvScale||0.5), p.getY(i)*(uvScale||0.5));
  a.needsUpdate=true;
  g.rotateX(-Math.PI/2);
  return g;
}

/* --- polylines --------------------------------------------------------
   Ramps, the service drive, the paths across the lawn: anything that
   curves is a centre line, smoothed, and a ribbon laid along it.        */
// Catmull-Rom through the control points, resampled every `step` metres;
// carries y if the points have it
/* chord: tangents scaled by the neighbouring chords, so a short leg next to
   a long one does not overshoot and double back (uniform Catmull-Rom does:
   six metres then a hundred and ten, and the curve starts out backwards) */
function smoothPath(pts, step, chord){
  const out=[], P=pts;
  const at=(i)=>P[Math.max(0, Math.min(P.length-1, i))];
  const len=(a,b)=>Math.hypot(b.x-a.x, b.z-a.z);
  for(let i=0;i<P.length-1;i++){
    const p0=at(i-1), p1=at(i), p2=at(i+1), p3=at(i+2);
    const L=Math.hypot(p2.x-p1.x, p2.z-p1.z), n=Math.max(1, Math.ceil(L/(step||2)));
    const k1=chord ? L/Math.max(1e-6, len(p0,p1)+L) : 0.5, k2=chord ? L/Math.max(1e-6, L+len(p2,p3)) : 0.5;
    for(let k=0;k<n;k++){
      const t=k/n, t2=t*t, t3=t2*t;
      const he=(a,b,c,d,f)=>(2*t3-3*t2+1)*b+(t3-2*t2+t)*(c-a)*k1+(-2*t3+3*t2)*c+(t3-t2)*(d-b)*k2;
      out.push({x:he(p0.x,p1.x,p2.x,p3.x), z:he(p0.z,p1.z,p2.z,p3.z),
                y:he(p0.y||0,p1.y||0,p2.y||0,p3.y||0)});
    }
  }
  const e=P[P.length-1]; out.push({x:e.x, z:e.z, y:e.y||0});
  let s=0; out[0].s=0;
  for(let i=1;i<out.length;i++){ s+=Math.hypot(out[i].x-out[i-1].x, out[i].z-out[i-1].z); out[i].s=s; }
  return out;
}
// unit left-hand normal of the path at i (x right, z south: left of travel)
function pathSide(P,i){
  const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)];
  const dx=b.x-a.x, dz=b.z-a.z, L=Math.hypot(dx,dz)||1;
  return {x:dz/L, z:-dx/L};
}
// a flat strip along a path, from offset o0 to o1 across it (left positive),
// at the path's own y plus yOff; u across, v along, both in metres*uv
function ribbonGeo(P, o0, o1, yOff, uv){
  const pos=[], uvs=[], idx=[], s=uv||0.35;
  for(let i=0;i<P.length;i++){
    const n=pathSide(P,i), p=P[i];
    pos.push(p.x+n.x*o0, (p.y||0)+yOff, p.z+n.z*o0,  p.x+n.x*o1, (p.y||0)+yOff, p.z+n.z*o1);
    uvs.push(o0*s, p.s*s,  o1*s, p.s*s);
    if(i){ const a=(i-1)*2, b=a+1, c=a+2, d=a+3;
      // both windings tested against +y: whichever faces up is kept
      idx.push(a,c,b, b,c,d); }
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos,3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uvs,2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // make sure it faces up whichever way the offsets ran
  const nr=g.attributes.normal;
  if(nr.count && nr.getY(0)<0){
    const ix=g.index.array;
    for(let k=0;k<ix.length;k+=3){ const t=ix[k+1]; ix[k+1]=ix[k+2]; ix[k+2]=t; }
    g.computeVertexNormals();
  }
  return g;
}
// dashes along a path: [start, length] pairs every `period` metres
function dashesAlong(P, off, w, dash, period, cb){
  const total=P[P.length-1].s;
  for(let s=period*0.5; s+dash<total; s+=period){
    const seg=[]; for(const q of P) if(q.s>=s && q.s<=s+dash) seg.push(q);
    if(seg.length<2) continue;
    cb(seg);
  }
}
function pathAt(P, s){                      // position and heading at distance s
  if(s<=0) s=0;
  let i=1; while(i<P.length-1 && P[i].s<s) i++;
  const a=P[i-1], b=P[i], L=(b.s-a.s)||1, t=clamp((s-a.s)/L,0,1);
  return {x:lerp(a.x,b.x,t), z:lerp(a.z,b.z,t), y:lerp(a.y||0,b.y||0,t),
          hx:(b.x-a.x)/L, hz:(b.z-a.z)/L};
}
function distToPath(P, x, z){
  let best=1e9, bi=0, bt=0;
  for(let i=1;i<P.length;i++){
    const a=P[i-1], b=P[i];
    const ex=b.x-a.x, ez=b.z-a.z, L2=ex*ex+ez*ez;
    const t=L2>0 ? clamp(((x-a.x)*ex+(z-a.z)*ez)/L2,0,1) : 0;
    const d=Math.hypot(x-(a.x+ex*t), z-(a.z+ez*t));
    if(d<best){ best=d; bi=i; bt=t; }
  }
  const a=P[bi-1]||P[0], b=P[bi]||P[0];
  return {d:best, y:lerp(a.y||0,b.y||0,bt), s:lerp(a.s||0,b.s||0,bt), x:lerp(a.x,b.x,bt), z:lerp(a.z,b.z,bt)};
}

/* --- faces built by hand: roofs, gables, anything that is not a box ----
   A quad is four corners in order; its normal is worked out from them and
   then checked against a point known to be INSIDE the solid, so it always
   faces out whichever way the corners were listed. UVs are planar in the
   face's own plane, in metres. */
class FaceGeo{
  constructor(){ this.P=[]; this.N=[]; this.U=[]; }
  _push(p,n,u){ this.P.push(p.x,p.y,p.z); this.N.push(n.x,n.y,n.z); this.U.push(u[0],u[1]); }
  poly(pts, inside, uv, uaxis){
    const a=pts[0], b=pts[1], c=pts[2];
    const n=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();
    let P=pts;
    if(inside){
      const ctr=new T.Vector3(); for(const q of pts) ctr.add(q); ctr.multiplyScalar(1/pts.length);
      if(n.dot(ctr.sub(inside))<0){ n.negate(); P=pts.slice().reverse(); }
    }
    const ua=(uaxis ? uaxis.clone() : new T.Vector3().subVectors(P[1],P[0])).normalize();
    // keep u horizontal where the face allows it, so bricks and siding run level
    if(!uaxis && Math.abs(n.y)<0.98){ ua.set(-n.z,0,n.x).normalize(); }
    const va=new T.Vector3().crossVectors(n,ua).normalize();
    const s=uv||0.35;
    const u0=P[0];
    const uvOf=(p)=>[ (p.x-u0.x)*ua.x*s+(p.y-u0.y)*ua.y*s+(p.z-u0.z)*ua.z*s,
                      (p.x-u0.x)*va.x*s+(p.y-u0.y)*va.y*s+(p.z-u0.z)*va.z*s ];
    for(let i=1;i<P.length-1;i++){
      this._push(P[0],n,uvOf(P[0])); this._push(P[i],n,uvOf(P[i])); this._push(P[i+1],n,uvOf(P[i+1]));
    }
    return this;
  }
  // a slab under a quad (or triangle) of top corners, `t` thick
  slab(top, t, uv){
    const a=top[0], b=top[1], c=top[2];
    const n=new T.Vector3().subVectors(b,a).cross(new T.Vector3().subVectors(c,a)).normalize();
    if(n.y<0) n.negate();
    const bot=top.map(p=>p.clone().addScaledVector(n,-t));
    const ctr=new T.Vector3(); for(const q of top) ctr.add(q); ctr.multiplyScalar(1/top.length);
    ctr.addScaledVector(n,-t/2);
    this.poly(top, ctr, uv);
    this.poly(bot, ctr, uv);
    for(let i=0;i<top.length;i++){
      const j=(i+1)%top.length;
      this.poly([top[i], top[j], bot[j], bot[i]], ctr, uv);
    }
    return this;
  }
  geo(){
    const g=new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(this.P,3));
    g.setAttribute("normal",   new T.Float32BufferAttribute(this.N,3));
    g.setAttribute("uv",       new T.Float32BufferAttribute(this.U,2));
    return g;
  }
}
// an extruded 2-D outline: pts in a vertical plane (x along, y up), depth
// along +z, UVs in metres. A gable end is one of these.
function prismGeo(pts, depth, uv){
  const sh=new T.Shape(); sh.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length;i++) sh.lineTo(pts[i][0], pts[i][1]);
  const g=new T.ExtrudeGeometry(sh, {depth:depth, bevelEnabled:false});
  const a=g.attributes.uv, s=uv||0.35;
  for(let i=0;i<a.count;i++) a.setXY(i, a.getX(i)*s, a.getY(i)*s);
  a.needsUpdate=true;
  g.translate(0,0,-depth/2);
  return g;
}

/* --- geometry merging: position + normal + uv + vertex colour ---------- */
function mergeEntries(entries){
  let vtot=0, itot=0;
  for(const e of entries){
    const p=e.geo.attributes.position;
    vtot+=p.count; itot += e.geo.index ? e.geo.index.count : p.count;
  }
  const P=new Float32Array(vtot*3), N=new Float32Array(vtot*3),
        U=new Float32Array(vtot*2), C=new Float32Array(vtot*3);
  const IDX = vtot>65535 ? new Uint32Array(itot) : new Uint16Array(itot);
  const v=new T.Vector3(), n=new T.Vector3(), nm=new T.Matrix3();
  const white=new T.Color(0xffffff);
  let vo=0, io=0;
  for(const e of entries){
    const g=e.geo, pos=g.attributes.position, nor=g.attributes.normal, uv=g.attributes.uv;
    const col=e.color||white, vc=g.attributes.color;
    nm.getNormalMatrix(e.matrix);
    for(let i=0;i<pos.count;i++){
      v.set(pos.getX(i),pos.getY(i),pos.getZ(i)).applyMatrix4(e.matrix);
      P[(vo+i)*3]=v.x; P[(vo+i)*3+1]=v.y; P[(vo+i)*3+2]=v.z;
      if(nor){ n.set(nor.getX(i),nor.getY(i),nor.getZ(i)).applyMatrix3(nm).normalize(); }
      else n.set(0,1,0);
      N[(vo+i)*3]=n.x; N[(vo+i)*3+1]=n.y; N[(vo+i)*3+2]=n.z;
      if(uv){ U[(vo+i)*2]=uv.getX(i); U[(vo+i)*2+1]=uv.getY(i); }
      if(vc){ C[(vo+i)*3]=vc.getX(i)*col.r; C[(vo+i)*3+1]=vc.getY(i)*col.g; C[(vo+i)*3+2]=vc.getZ(i)*col.b; }
      else  { C[(vo+i)*3]=col.r; C[(vo+i)*3+1]=col.g; C[(vo+i)*3+2]=col.b; }
    }
    if(g.index){ for(let k=0;k<g.index.count;k++) IDX[io++]=vo+g.index.getX(k); }
    else       { for(let k=0;k<pos.count;k++)    IDX[io++]=vo+k; }
    vo+=pos.count;
  }
  const bg=new T.BufferGeometry();
  bg.setAttribute("position", new T.BufferAttribute(P,3));
  bg.setAttribute("normal",   new T.BufferAttribute(N,3));
  bg.setAttribute("uv",       new T.BufferAttribute(U,2));
  bg.setAttribute("color",    new T.BufferAttribute(C,3));
  bg.setIndex(new T.BufferAttribute(IDX,1));
  bg.computeBoundingSphere();
  return bg;
}

/* --- named merge buckets ---------------------------------------------
   Everything static is pushed into a bucket keyed by material; at the end
   each bucket bakes down to one mesh — per region, here, because this
   world is a kilometre across and one mesh per material would never be
   frustum-culled. A bucket is split into 96 m tiles at bake time. */
const BUCKETS = new Map();
const NO_SHADOW_IN = new Set([]);
function bucketOf(name, makeMat){
  let b=BUCKETS.get(name);
  if(!b){ b={entries:[], makeMat:makeMat, mat:null}; BUCKETS.set(name,b); }
  if(makeMat && !b.makeMat) b.makeMat=makeMat;
  return b;
}
const _q=new T.Quaternion(), _s=new T.Vector3(1,1,1), _e=new T.Euler();
// Euler order YXZ so a local tilt (rx) is applied *before* the turn (ry)
function push(name, geo, x,y,z, ry, color, rx, rz){
  if(typeof ry==="string"){ color=ry; ry=0; }
  _e.set(rx||0, ry||0, rz||0, "YXZ");
  _q.setFromEuler(_e);
  const m=new T.Matrix4().compose(new T.Vector3(x,y,z), _q, _s);
  bucketOf(name).entries.push({geo:geo, matrix:m, color:color?new T.Color(color):null});
}
function bx(name, w,h,d, x,y,z, uvScale, ry, color){
  push(name, boxGeo(w,h,d,uvScale===undefined?0.35:uvScale), x,y,z, ry||0, color);
}
// enough sides that a round thing reads round at the size it is: thin ones few, a post or a tank many
function roundSegs(r, seg){ return Math.max(seg||0, r>=0.3?32 : r>=0.12?24 : r>=0.05?16 : r>=0.025?10 : 0) || 8; }
function cyl(name, rt,rb,h,seg, x,y,z, color, rx,ry,rz){
  push(name, new T.CylinderGeometry(rt,rb,h,roundSegs(Math.max(rt,rb), seg||14)), x,y,z, ry||0, color, rx||0, rz||0);
}
// a cylinder from one point to another (posts, pipes, rails, branches)
const _UPV=new T.Vector3(0,1,0);
function tube(name, a, b, r, seg, color, r2){
  const d=new T.Vector3().subVectors(b,a), L=d.length();
  if(L<1e-4) return;
  const q=new T.Quaternion().setFromUnitVectors(_UPV, d.clone().normalize());
  const m=new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, _s);
  bucketOf(name).entries.push({geo:new T.CylinderGeometry(r2===undefined?r:r2, r, L, roundSegs(Math.max(r, r2||0), seg||8)),
    matrix:m, color:color?new T.Color(color):null});
}
/* WHAT IS ALLOWED TO CAST A SHADOW. Anything flat shadows itself (a plane in
   the depth map sits exactly on the surface it shades), and anything
   transparent prints a solid shadow. Entries thinner than FLAT_T go into a
   second mesh that receives but does not cast. */
const FLAT_T=0.012;
const noCast=m=> !!(m.transparent || m.blending===T.AdditiveBlending || m.depthWrite===false);
function isFlat(geo){
  if(!geo.boundingBox) geo.computeBoundingBox();
  const b=geo.boundingBox;
  return Math.min(b.max.x-b.min.x, b.max.y-b.min.y, b.max.z-b.min.z) < FLAT_T;
}
function shadeGeo(rt, rb, h, seg){ return new T.CylinderGeometry(rt, rb, h, seg||14, 1, true); }
function domeGeo(r, drop, seg){
  const g=new T.SphereGeometry(r, seg||18, 7, 0, Math.PI*2, Math.PI/2, Math.PI/2);
  g.scale(1, drop/r, 1);
  return g;
}
const BAKE_TILE=96;
/* NO TWO FACES IN ONE PLANE. Boxes that overlap and share a face plane —
   a wall's end and the next wall's face at a corner, a door post against the
   end of the wall it lines, a mullion on its sill, trim on trim — z-fight,
   worst along edges. Walls and slabs are butted where they meet (09); every
   thinner box — trim, frames, glass, mullions, fittings — is grown by 1 to
   3.5 mm before it is merged, so it always sits proud of any wall face it
   shares a plane with, and a step of an eighth of a millimetre by entry
   keeps two equal pieces from tying. */
function _inflateBox(e, i){
  const P=e.geo.parameters;
  if(!P || P.width===undefined || P.depth===undefined) return;
  const m=e.matrix.elements, sx=Math.hypot(m[0],m[1],m[2]), sy=Math.hypot(m[4],m[5],m[6]), sz=Math.hypot(m[8],m[9],m[10]);
  const w=P.width*sx, h=P.height*sy, d=P.depth*sz, lo=Math.min(w,h,d);
  if(lo<=0) return;
  if(lo>=0.195) return;                    // walls and slabs: their joints are butted, not grown
  let eps=0.0012+0.0022*(1-smoothstep(0.02,0.20,lo));
  eps=Math.min(eps, lo*0.15)+((i*2654435761>>>0)%16)*0.00012;
  e.matrix=e.matrix.clone().multiply(new T.Matrix4().makeScale((w+2*eps)/w, (h+2*eps)/h, (d+2*eps)/d));
}
function bakeBuckets(scene){
  const out=[], _c=new T.Vector3();
  let _ei=0;
  for(const [name,b] of BUCKETS){
    if(!b.entries.length) continue;
    for(const e of b.entries) _inflateBox(e, _ei++);
    const m=b.makeMat ? b.makeMat() : mat(0xffffff);
    m.vertexColors=true; b.mat=m;
    // tile by where each entry sits, so a bucket that spans the site is
    // a handful of meshes the camera can cull, not one it never can
    const tiles=new Map();
    for(const e of b.entries){
      _c.setFromMatrixPosition(e.matrix);
      const k=Math.floor(_c.x/BAKE_TILE)+":"+Math.floor(_c.z/BAKE_TILE);
      let t=tiles.get(k); if(!t){ t={solid:[], flat:[]}; tiles.set(k,t); }
      if(noCast(m) || isFlat(e.geo)) t.flat.push(e); else t.solid.push(e);
    }
    for(const [k,t] of tiles){
      for(const [ents, cast] of [[t.solid,true],[t.flat,false]]){
        if(!ents.length) continue;
        // one tile can still outgrow a 16-bit index; mergeEntries copes
        const mesh=new T.Mesh(mergeEntries(ents), m);
        mesh.castShadow=cast;
        mesh.receiveShadow = !NO_SHADOW_IN.has(name);
        mesh.name="bucket:"+name+":"+k+(cast?"":":flat");
        scene.add(mesh); out.push(mesh);
      }
    }
    // ?zdebug keeps the entries, named, for tools that hunt coplanar faces
    if(typeof location!=="undefined" && /zdebug/.test(location.search))
      (window.ZDBG=window.ZDBG||[]).push(...b.entries.map(e=>({bucket:name, geo:e.geo, matrix:e.matrix})));
    b.entries.length=0;
  }
  return out;
}

/* --- local frames ------------------------------------------------------
   three.js's rotation.y = t sends a local offset (dx, dz) to
   (dx·cos t + dz·sin t, −dx·sin t + dz·cos t). Written the other way round
   out of habit, every piece is oriented by +t and positioned by −t, which
   at t = 0 passes every test there is. This is the right way round.     */
function XF(ox,oz,ry){
  const c=Math.cos(ry), s=Math.sin(ry);
  return { ry:ry, swap:Math.abs(s)>0.5,
           x:(lx,lz)=>ox+lx*c+lz*s,
           z:(lx,lz)=>oz-lx*s+lz*c };
}
function lbx(xf, name, w,h,d, lx,ly,lz, uv, color){
  push(name, boxGeo(w,h,d,uv===undefined?0.35:uv), xf.x(lx,lz), ly, xf.z(lx,lz), xf.ry, color);
}
function lcol(xf, w,d, lx,lz, y0,y1){
  const wx=xf.x(lx,lz), wz=xf.z(lx,lz);
  const ww=xf.swap?d:w, dd=xf.swap?w:d;
  addCol(wx-ww/2, wx+ww/2, wz-dd/2, wz+dd/2, y0, y1);
}
function lwall(xf, name, w,h,d, lx,ly,lz, uv, color){
  lbx(xf,name,w,h,d,lx,ly,lz,uv,color);
  lcol(xf,w,d,lx,lz, ly-h/2, ly+h/2);
}
/* A wall in world coordinates, by its extents, drawn and made solid in one
   call. A wall that starts on the floor gets a collider sunk half a metre
   under it, so there is no seam to slip under; a wall that starts higher up
   is a lintel, and its collider starts exactly where it does — sunk, a
   2.14 m lintel is a bar across the doorway at head height. Its UVs come
   from world position, face by face, so the courses of brick or block run
   straight on from one piece of a wall to the next, past a door head and
   round a window, instead of starting over at each box. */
function wallBox(bk, x0,x1, z0,z1, y0,y1, color, uv, floorY){
  const s=uv===undefined?0.35:uv, cx=(x0+x1)/2, cy=(y0+y1)/2, cz=(z0+z1)/2;
  const g=new T.BoxGeometry(x1-x0, y1-y0, z1-z0), P=g.attributes.position, N=g.attributes.normal, U=g.attributes.uv;
  for(let i=0;i<P.count;i++){
    const x=P.getX(i)+cx, y=P.getY(i)+cy, z=P.getZ(i)+cz, nx=N.getX(i), nz=N.getZ(i);
    if(Math.abs(nx)>0.5)      U.setXY(i, (nx>0?-z:z)*s, y*s);
    else if(Math.abs(nz)>0.5) U.setXY(i, (nz>0?x:-x)*s, y*s);
    else                      U.setXY(i, x*s, z*s);
  }
  U.needsUpdate=true;
  push(bk, g, cx, cy, cz, 0, color);
  const f=floorY===undefined?0:floorY;
  addCol(x0,x1, z0,z1, (y0<=f+0.02 ? y0-0.5 : y0), y1);
}

/* --- door leaves: each its own small merged mesh so it can swing ------- */
const DOOR_GLASS_MAT=new T.MeshStandardMaterial({color:0x6f8a92, transparent:true, opacity:0.38,
  roughness:0.06, metalness:0.3, side:T.DoubleSide, depthWrite:false});
// The leaf hangs from a hinge at local (lx,lz) in frame xf and extends along
// +x. `style` picks the leaf; the sizes come off the style.
//   store   aluminium storefront door, dark bronze, full glass, push bar
//   vision  the brown steel door with the narrow vision lite (photo 11)
//   steel   flush grey slab, foot louvre, warning plate
//   gate    galvanised frame, chain-link, barbed wire, padlock
//   stall   a toilet-partition door, raised off the floor
//   closet  painted flush door, lever, no glass
function makeDoor(xf, lx, ly, lz, label, opensIn, ajar, style, tint){
  const SZ={store:[0.96,2.10,0.05], vision:[0.94,2.06,0.05], steel:[0.96,2.04,0.065],
            gate:[1.42,1.94,0.045], stall:[0.64,1.46,0.026], stallw:[0.90,1.46,0.026],
            closet:[0.88,2.04,0.045]}[style]
            || [0.92,2.04,0.05];
  const leafW=SZ[0], leafH=SZ[1], leafT=SZ[2];
  const ent=[], gl=[];
  const m4=(x,y,z)=>new T.Matrix4().makeTranslation(x,y,z);
  const rot=(x,y,z,rx,ry,rz)=>new T.Matrix4().compose(new T.Vector3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)), new T.Vector3(1,1,1));
  const C=h=>new T.Color(h);
  const chrome=C(0xb8bcbc), dk=C(0x3a3a38);
  if(style==="store"){
    const fr=C(0x3b3029), bar=C(0x9a9a94);
    const stile=0.11, rail=0.12, kick=0.26;
    ent.push({geo:boxGeo(stile,leafH,leafT,0), matrix:m4(stile/2, leafH/2, 0), color:fr});
    ent.push({geo:boxGeo(stile,leafH,leafT,0), matrix:m4(leafW-stile/2, leafH/2, 0), color:fr});
    ent.push({geo:boxGeo(leafW,rail,leafT,0), matrix:m4(leafW/2, leafH-rail/2, 0), color:fr});
    ent.push({geo:boxGeo(leafW,kick,leafT,0), matrix:m4(leafW/2, kick/2, 0), color:fr});
    gl.push({geo:boxGeo(leafW-stile*2+0.02, leafH-rail-kick+0.02, 0.01,0),
             matrix:m4(leafW/2, kick+(leafH-rail-kick)/2, 0), color:C(0xffffff)});
    for(const sd of [1,-1]){
      ent.push({geo:boxGeo(leafW-0.30,0.04,0.04,0), matrix:m4(leafW/2, 1.02, sd*(leafT/2+0.05)), color:bar});
      for(const q of [0.20, leafW-0.20])
        ent.push({geo:boxGeo(0.04,0.04,0.06,0), matrix:m4(q, 1.02, sd*(leafT/2+0.028)), color:bar});
      ent.push({geo:boxGeo(0.22,0.05,0.008,0), matrix:m4(leafW/2, 1.34, sd*(leafT/2+0.0045)),
                color:C(0xd8d4c6)});                               // PUSH / PULL decal
    }
  }else if(style==="vision"){
    const br=C(tint||0x4a3d33), brd=C(0x3d322a), brass=C(0xc9b26a);
    ent.push({geo:boxGeo(leafW,leafH,leafT,0.5), matrix:m4(leafW/2, leafH/2, 0), color:br});
    for(const sd of [1,-1]){
      const f=sd*(leafT/2);
      // the lite's frame, then the glass in it, each at its own depth
      ent.push({geo:boxGeo(0.16,1.06,0.012,0), matrix:m4(0.40, 1.30, f+sd*0.004), color:brd});
      ent.push({geo:boxGeo(0.20,0.30,0.006,0), matrix:m4(0.38, 1.02, f+sd*0.003), color:brass});
      ent.push({geo:boxGeo(0.05,0.05,0.05,0),  matrix:m4(leafW-0.10, 1.02, f+sd*0.025), color:brass});
      ent.push({geo:boxGeo(0.14,0.03,0.03,0),  matrix:m4(leafW-0.16, 1.02, f+sd*0.05), color:brass});
      ent.push({geo:boxGeo(leafW-0.06,0.22,0.006,0), matrix:m4(leafW/2, 0.13, f+sd*0.003), color:brd});
    }
    gl.push({geo:boxGeo(0.10,0.98,0.012,0), matrix:m4(0.40, 1.30, 0), color:C(0xffffff)});
  }else if(style==="steel"){
    const grey=C(tint||0x8d9490), gd=C(0x6a7170), d2=C(0x4a4f4c);
    ent.push({geo:boxGeo(leafW,leafH,leafT,0.5), matrix:m4(leafW/2, leafH/2, 0), color:grey});
    for(const sd of [1,-1]){
      ent.push({geo:boxGeo(leafW-0.06,leafH-0.06,0.012,0.5), matrix:m4(leafW/2, leafH/2, sd*(leafT/2+0.004)), color:gd});
      for(let i=0;i<5;i++)
        ent.push({geo:boxGeo(0.44,0.028,0.022,0.5), matrix:rot(leafW/2, 0.30+i*0.055, sd*(leafT/2+0.012), -0.42*sd), color:d2});
      ent.push({geo:boxGeo(0.24,0.16,0.008,0.5), matrix:m4(leafW/2, 1.46, sd*(leafT/2+0.017)), color:C(0xd9b234)});
      ent.push({geo:boxGeo(0.055,0.19,0.03,0.5), matrix:m4(leafW-0.13, 1.02, sd*(leafT/2+0.021)), color:d2});
      ent.push({geo:boxGeo(0.16,0.034,0.034,0.5), matrix:m4(leafW-0.20, 0.98, sd*(leafT/2+0.048)), color:chrome});
    }
  }else if(style==="gate"){
    const galv=C(0x9aa1a6), wire=C(0xb9c0c2), d3=C(0x6e7478);
    for(const q of [0,1])
      ent.push({geo:boxGeo(0.055,leafH,0.055,0.5), matrix:m4(0.03+q*(leafW-0.06), leafH/2, 0), color:galv});
    for(const yy of [0.03, leafH-0.03, leafH*0.52])
      ent.push({geo:boxGeo(leafW,0.052,0.052,0.5), matrix:m4(leafW/2, yy, 0), color:galv});
    ent.push({geo:boxGeo(Math.hypot(leafW,leafH*0.49)-0.08,0.038,0.038,0.5),
              matrix:rot(leafW/2, leafH*0.27, 0, 0, 0, Math.atan2(leafH*0.49, leafW)), color:d3});
    // the link mesh, as the wire it is: two sets of diagonals, each one
    // clipped to the frame so none of it hangs out past the stiles
    for(let d=0;d<2;d++)
      for(let c=-leafH; c<leafW; c+=0.11){
        let x0,x1,y0,y1;
        if(d===0){ x0=Math.max(0,c); x1=Math.min(leafW,leafH+c); y0=x0-c; y1=x1-c; }
        else     { const k=c+leafH; x0=Math.max(0,k-leafH); x1=Math.min(leafW,k); y0=k-x0; y1=k-x1; }
        const L=Math.hypot(x1-x0,y1-y0); if(L<0.05) continue;
        ent.push({geo:boxGeo(L,0.012,0.012,0.5), matrix:rot((x0+x1)/2, (y0+y1)/2, (d?0.009:-0.009), 0, 0, Math.atan2(y1-y0,x1-x0)), color:wire});
      }
    for(let i=0;i<3;i++)
      ent.push({geo:boxGeo(leafW,0.016,0.016,0.5), matrix:m4(leafW/2, leafH+0.12+i*0.14, -0.08-i*0.08), color:d3});
    for(const q of [0.06, leafW-0.06])
      ent.push({geo:boxGeo(0.034,0.50,0.034,0.5), matrix:rot(q, leafH+0.24, -0.16, -0.5, 0, 0), color:galv});
    ent.push({geo:boxGeo(0.10,0.17,0.05,0.5), matrix:m4(leafW-0.02, leafH*0.52+0.10, 0.045), color:d3});
    ent.push({geo:new T.TorusGeometry(0.038,0.011,5,10), matrix:rot(leafW-0.02, leafH*0.52+0.21, 0.045, 0, 0, 0), color:chrome});
  }else if(style==="stall"||style==="stallw"){
    const bg=C(tint||0xb9ab8c), d4=C(0x8a8a86), edge=C(0x9a8e72), chr=C(0xc9cbcc);
    ent.push({geo:boxGeo(leafW,leafH,leafT,0.5), matrix:m4(leafW/2, leafH/2, 0), color:bg});
    // the laminate's edge banding, a shade darker all round
    ent.push({geo:boxGeo(leafW,0.012,leafT+0.002,0), matrix:m4(leafW/2, 0.006, 0), color:edge});
    ent.push({geo:boxGeo(leafW,0.012,leafT+0.002,0), matrix:m4(leafW/2, leafH-0.006, 0), color:edge});
    ent.push({geo:boxGeo(0.012,leafH,leafT+0.002,0), matrix:m4(leafW-0.006, leafH/2, 0), color:edge});
    // wrap-around hinges on the hinge edge, top and bottom
    for(const y of [0.16, leafH-0.16]) ent.push({geo:boxGeo(0.045,0.13,leafT+0.012,0), matrix:m4(0.012, y, 0), color:chr});
    for(const sd of [1,-1]){
      // the slide latch inside, the indicator and the pull outside
      ent.push({geo:boxGeo(0.09,0.045,0.016,0), matrix:m4(leafW-0.07, 0.95, sd*(leafT/2+0.008)), color:chr});
      ent.push({geo:boxGeo(0.11,0.05,0.010,0), matrix:m4(leafW-0.10, 1.10, sd*(leafT/2+0.005)), color:chr});
      ent.push({geo:boxGeo(0.07,0.022,0.006,0), matrix:m4(leafW-0.10, 1.10, sd*(leafT/2+0.012)), color:C(0x2f8a3c)});
    }
    ent.push({geo:boxGeo(0.03,0.13,0.03,0), matrix:m4(leafW-0.13, 0.95, -(leafT/2+0.025)), color:chr});   // pull
    ent.push({geo:boxGeo(0.05,0.05,0.04,0), matrix:m4(leafW/2, 1.32, leafT/2+0.02), color:chr});         // coat hook
    ent.push({geo:boxGeo(0.02,0.07,0.06,0), matrix:m4(leafW/2, 1.36, leafT/2+0.045), color:chr});
    ent.push({geo:new T.CylinderGeometry(0.022,0.022,0.04,10), matrix:new T.Matrix4().makeRotationX(Math.PI/2).setPosition(leafW/2, 1.20, leafT/2+0.02), color:C(0x2a2a2a)});  // bumper
  }else{                                         // closet: painted flush
    const pc=C(tint||0x7f7466), ln=tint ? C(tint).multiplyScalar(0.9) : C(0x6c6256);      // (its panel a shade under the leaf's paint)
    ent.push({geo:boxGeo(leafW,leafH,leafT,0.5), matrix:m4(leafW/2, leafH/2, 0), color:pc});
    for(const sd of [1,-1]){
      ent.push({geo:boxGeo(leafW-0.10,leafH-0.10,0.006,0), matrix:m4(leafW/2, leafH/2, sd*(leafT/2+0.003)), color:ln});
      ent.push({geo:boxGeo(0.05,0.12,0.02,0), matrix:m4(leafW-0.10, 1.02, sd*(leafT/2+0.012)), color:chrome});
      ent.push({geo:boxGeo(0.13,0.026,0.026,0), matrix:m4(leafW-0.15, 0.99, sd*(leafT/2+0.035)), color:chrome});
    }
  }
  const mesh=new T.Mesh(mergeEntries(ent), new T.MeshStandardMaterial({vertexColors:true,
    roughness: style==="gate" ? 0.45 : 0.6, metalness: (style==="gate"||style==="store") ? 0.3 : 0.12}));
  mesh.castShadow=true; mesh.receiveShadow=true;
  const g=new T.Group();
  g.position.set(xf.x(lx,lz), ly, xf.z(lx,lz));
  g.rotation.y=xf.ry;
  g.add(mesh);
  if(gl.length) g.add(new T.Mesh(mergeEntries(gl), DOOR_GLASS_MAT));
  scene.add(g);
  const wx=xf.x(lx+leafW/2, lz), wz=xf.z(lx+leafW/2, lz);
  DOORS.push({g:g, open:0, target:0, x:wx, z:wz, y:ly, base:xf.ry, manual:0,
              ajar:ajar||0, swing:(opensIn?-1:1)*(style==="stall"||style==="stallw"?1.40:1.52), label:label,
              reach: (style==="stall"||style==="stallw") ? 1.1 : 2.5});
  return g;
}
/* AN OVERHEAD DOOR, the kind a house's garage has: four sections that run up
   the tracks either side, round the bend under the head and back along the
   ceiling. xf's origin is the middle of the opening's foot, its +z out of the
   building; w and h are the opening's. E raises it and lowers it (a DOORS
   entry, manual and sticky, solid while it is down: col is the box to block,
   in world terms). kind "roll" is a commercial roll-up instead, whose
   curtain winds up into its drum over the head. */
function makeLiftDoor(xf, y0, w, h, col, label, colBox, kind){
  const g=new T.Group(); g.position.set(xf.x(0,0), y0, xf.z(0,0)); g.rotation.y=xf.ry; scene.add(g);
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:kind==="roll" ? 0.35 : 0.1});
  const D={g:g, open:0, target:0, x:xf.x(0,0), z:xf.z(0,0), y:y0, base:xf.ry, manual:0, ajar:0, swing:0, label:label||"THE GARAGE DOOR",
           reach:2.5, manualOnly:true, sticky:true, rate:0.45, openMsg:kind==="roll" ? "THE MOTOR WINDS IT UP" : "THE OPENER HUMS AND THE DOOR GOES UP"};
  if(kind==="roll"){
    // the curtain: ribbed slats, one box scaled to however much of it is down, the bottom bar under it
    const E2=[], c=new T.Color(col||"#eeeee8"), dk=new T.Color(col||"#eeeee8").multiplyScalar(0.86);
    E2.push({geo:boxGeo(w+0.04, 1, 0.05), matrix:new T.Matrix4().makeTranslation(0, -0.5, 0), color:c});
    const cur=new T.Mesh(mergeEntries(E2), mat); g.add(cur);
    const rib=new T.Group(); g.add(rib);
    const n=Math.round(h/0.19); for(let k=0;k<n;k++) for(const sd of [-1,1]){ const m=new T.Mesh(boxGeo(w, 0.018, 0.012), new T.MeshStandardMaterial({color:dk, roughness:0.5})); m.position.set(0, -(k+0.5)*0.19, sd*0.031); rib.add(m); }
    const bar=new T.Mesh(boxGeo(w+0.02, 0.06, 0.07), new T.MeshStandardMaterial({color:0x3a3a3a, roughness:0.7})); g.add(bar);
    D.lift=(t)=>{ const down=Math.max(0.12, h*(1-t)); cur.position.y=h; cur.scale.y=down; bar.position.y=h-down;
      rib.position.y=h; rib.children.forEach((m)=>{ m.visible=-m.position.y<down-0.04; }); };
  }else{
    // four sections, raised panels on their outer faces; the track's bend a quarter circle under the head
    const n=4, sh=h/n, E2=[], c=new T.Color(col||"#f4f2ec"), pc=new T.Color(col||"#f4f2ec").multiplyScalar(0.94);
    E2.push({geo:boxGeo(w, sh-0.006, 0.045), matrix:new T.Matrix4(), color:c});
    for(let i=0;i<4;i++) E2.push({geo:boxGeo(w/4-0.14, sh-0.17, 0.012), matrix:new T.Matrix4().makeTranslation(-w/2+w/8+i*w/4, 0, 0.028), color:pc});
    const geo=mergeEntries(E2), secs=[];
    for(let k=0;k<n;k++){ const m=new T.Mesh(geo, mat); m.castShadow=true; g.add(m); secs.push(m); }
    const R=0.16, u0=h-0.05-R, arc=Math.PI*R/2;
    D.lift=(t)=>{ const s=t*(h+0.04);
      for(let k=0;k<n;k++){ const c2=k*sh+sh/2+s; let y, z, a;
        if(c2<=u0){ y=c2; z=0; a=0; }
        else if(c2<=u0+arc){ a=(c2-u0)/R; y=u0+R*Math.sin(a); z=-(R-R*Math.cos(a)); }
        else { a=Math.PI/2; y=u0+R; z=-(R+(c2-u0-arc)); }
        secs[k].position.set(0, y, z); secs[k].rotation.x=-a; } };
  }
  D.lift(0);
  if(colBox){ const bc=Object.assign({}, colBox); COL_DYN.push(bc); D.blockCol=bc; D.blockTop=bc.y1; }
  D.onUse=(d)=>{ d.manual=d.target>0.5 ? -1 : 1; if(typeof AUDIO!=="undefined") AUDIO.blip("whirr", d.x, d.z);
    if(d.manual>0 && !d.told){ d.told=true; toast(d.openMsg, "#cfe0d4"); } };
  DOORS.push(D);
  return D;
}
