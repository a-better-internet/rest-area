"use strict";
/* REST AREA · 04b-vehicles.js
   every vehicle's shell and wheels, and the materials that make paint read
   as paint: reflections, a finish per part, the trailers' painted sides
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   4b · VEHICLES
   Modelled in the vehicle's own space: x right, y up from the ground, z
   forward. A car is lofted, not extruded: a run of cross-sections along
   its length, each a rounded box (a superellipse) whose width, top and
   bottom follow the side and plan profiles, with the wheel arches cut by
   lifting the bottom over each axle and the ends turned under on a radius.
   The greenhouse is a second loft sitting on the first, all glass, with
   the roof, the pillars and the window seals laid over it as strips of the
   same rings pushed out a few millimetres.
   kinds: 0 sedan · 1 SUV · 2 pickup · 3 minivan · 4 box truck ·
          5 tractor-trailer · 6 reefer · 7 flatbed with lumber
   ---------------------------------------------------------------------- */

/* ---- reflections -------------------------------------------------------
   Two little painted worlds, prefiltered once: the outdoors (sky, a line of
   trees, grey ground) for paint, glass and chrome outside, and a lit room
   for the stainless and porcelain indoors. Without them a metal is black. */
const ENV=(function(){
  const pm=new T.PMREMGenerator(renderer);
  const equi=(draw)=>{ const c=cvs(512,256), x=c.getContext("2d"); draw(x,512,256);
    const t=new T.CanvasTexture(c); t.mapping=T.EquirectangularReflectionMapping; return t; };
  const out=equi((x,W,H)=>{
    let g=x.createLinearGradient(0,0,0,H/2);
    g.addColorStop(0,"#4a78b0"); g.addColorStop(0.65,"#9fbad2"); g.addColorStop(1,"#dce4e8");
    x.fillStyle=g; x.fillRect(0,0,W,H/2);
    for(let i=0;i<16;i++){
      const cx=rnd()*W, cy=H*(0.10+rnd()*0.28), r=24+rnd()*34;
      const rg=x.createRadialGradient(cx,cy,0,cx,cy,r);
      rg.addColorStop(0,"rgba(255,255,255,0.8)"); rg.addColorStop(1,"rgba(255,255,255,0)");
      x.fillStyle=rg; x.fillRect(cx-r*1.6,cy-r,r*3.2,r*2);
    }
    g=x.createLinearGradient(0,H/2,0,H);
    g.addColorStop(0,"#5d6352"); g.addColorStop(0.12,"#76756d"); g.addColorStop(1,"#4b4a46");
    x.fillStyle=g; x.fillRect(0,H/2,W,H/2);
    x.fillStyle="#26321f";
    for(let i=0;i<W;i+=2){ const h=3+Math.abs(Math.sin(i*0.045))*5+rnd()*4; x.fillRect(i,H/2-h,2,h+1); }
  });
  const inn=equi((x,W,H)=>{
    x.fillStyle="#cdc6b6"; x.fillRect(0,0,W,H);
    x.fillStyle="#e9e8e2"; x.fillRect(0,0,W,H*0.30);
    x.fillStyle="#fffef6"; for(let i=0;i<6;i++) x.fillRect(i*W/6+18,H*0.07,46,H*0.07);
    x.fillStyle="#e6d58a"; x.fillRect(0,H*0.40,W,H*0.24);           // the yellow tile
    x.fillStyle="#8c8274"; x.fillRect(0,H*0.64,W,H*0.36);
    x.fillStyle="#b9ab8c"; for(let i=0;i<8;i++) x.fillRect(i*W/8,H*0.32,W/18,H*0.32);
  });
  const r={out:pm.fromEquirectangular(out).texture, in:pm.fromEquirectangular(inn).texture};
  pm.dispose(); out.dispose(); inn.dispose();
  return r;
})();
// the outdoor ones go dark with the sky; 19-loop scales them each frame
const ENV_OUT_MATS=[];
function envOut(m, k){ m.envMap=ENV.out; m.envMapIntensity=k; ENV_OUT_MATS.push({m:m, k:k}); return m; }
function envIn(m, k){ m.envMap=ENV.in; m.envMapIntensity=k; return m; }

/* ---- a finish per part, by uv ------------------------------------------
   One material for a whole vehicle and still rubber that is not glossy and
   chrome that is: every part's uvs point at one texel of an 8×1 table whose
   green is roughness and blue is metalness. */
const FIN={paint:0, trim:1, rubber:2, chrome:3, alloy:4, lens:5, metal:6, panel:7};
const VEH_LUT=(function(){
  const F=[[0.28,0.32],[0.70,0.0],[0.92,0.0],[0.10,1.0],[0.26,0.85],[0.08,0.05],[0.52,0.40],[0.62,0.05]];
  const d=new Uint8Array(8*4);
  F.forEach(([r,m],i)=>{ d[i*4]=255; d[i*4+1]=Math.round(r*255); d[i*4+2]=Math.round(m*255); d[i*4+3]=255; });
  const t=new T.DataTexture(d,8,1,T.RGBAFormat);
  t.magFilter=t.minFilter=T.NearestFilter; t.generateMipmaps=false; t.needsUpdate=true;
  return t;
})();
function finUV(geo, id){
  const n=geo.attributes.position.count, a=new Float32Array(n*2), u=(id+0.5)/8;
  for(let i=0;i<n;i++){ a[i*2]=u; a[i*2+1]=0.5; }
  geo.setAttribute("uv", new T.BufferAttribute(a,2));
  return geo;
}
const VEH_MAT=envOut(new T.MeshStandardMaterial({vertexColors:true, roughness:1, metalness:1,
                       roughnessMap:VEH_LUT, metalnessMap:VEH_LUT}), 1.0);
const VEH_GLASS=envOut(new T.MeshStandardMaterial({vertexColors:true, roughness:0.05, metalness:0.45}), 1.1);
// a car's own, close to: you see in through it to the seats and out through the far side's (a truck's cab
// and any car far off keep the dark one, having nothing inside)
const VEH_GLASS_CAR=envOut(new T.MeshStandardMaterial({vertexColors:true, roughness:0.03, metalness:0.50,
                     transparent:true, opacity:0.80, depthWrite:false, side:T.DoubleSide}), 1.6);

// paint people actually buy, now: mostly greyscale, then blue and red
const CAR_PAINTS=["#e9e9e6","#1c1d20","#9fa3a8","#5b5f64","#273a5c","#7c1c1c","#d6d6d2",
                  "#3b3f44","#4d5b3e","#6b4a33","#2d4b6b","#a8a9aa"];
const TRUCK_PAINTS=["#c9c9c4","#7a1e1a","#1d3b6e","#262626","#e7e5df","#356b3a","#d9a522","#5d6168"];

const VEH_SPEC={
  0:{len:4.86, nose:2.44, tail:-2.42, hw:0.93, ht:1.45, wr:0.34, axles:[1.42,-1.42], track:0.80, tw:0.22},
  1:{len:4.76, nose:2.38, tail:-2.38, hw:0.97, ht:1.76, wr:0.37, axles:[1.45,-1.45], track:0.84, tw:0.24},
  2:{len:5.90, nose:2.92, tail:-2.98, hw:1.00, ht:1.90, wr:0.38, axles:[1.86,-1.80], track:0.86, tw:0.26},
  3:{len:5.02, nose:2.52, tail:-2.50, hw:0.99, ht:1.76, wr:0.35, axles:[1.52,-1.52], track:0.84, tw:0.23},
  4:{len:8.2,  nose:3.86, tail:-4.40, hw:1.24, ht:3.58, wr:0.48, axles:[2.70,-2.60], track:0.98, tw:0.24, duals:[1]},
  5:{len:23.5, nose:10.96,tail:-12.6, hw:1.30, ht:4.08, wr:0.52, axles:[9.35,5.0,3.72,-10.3,-11.6], track:1.02, tw:0.28, duals:[1,2,3,4]},
  6:{len:23.5, nose:10.96,tail:-12.6, hw:1.30, ht:4.08, wr:0.52, axles:[9.35,5.0,3.72,-10.3,-11.6], track:1.02, tw:0.28, duals:[1,2,3,4]},
  7:{len:21.7, nose:10.96,tail:-10.8, hw:1.30, ht:3.30, wr:0.52, axles:[9.35,5.0,3.72,-8.6,-9.9],   track:1.02, tw:0.28, duals:[1,2,3,4]},
};
// where each wheel of a kind sits: [x, z, dual]; duals are two tyres a side
function wheelSlots(S){
  const out=[];
  S.axles.forEach((az,i)=>{
    const dual=S.duals && S.duals.indexOf(i)>=0;
    for(const s of [-1,1]){
      if(dual){ out.push([s*(S.hw-0.17), az]); out.push([s*(S.hw-0.47), az]); }
      else out.push([s*S.track, az]);
    }
  });
  return out;
}

/* ---- curves and skins ---------------------------------------------------- */
// a smooth function through [z, value] pairs (Catmull-Rom, clamped at the ends)
function crv(P){
  return z=>{
    if(z<=P[0][0]) return P[0][1];
    if(z>=P[P.length-1][0]) return P[P.length-1][1];
    let i=0; while(z>P[i+1][0]) i++;
    const p0=P[Math.max(0,i-1)], p1=P[i], p2=P[i+1], p3=P[Math.min(P.length-1,i+2)];
    const h=p2[0]-p1[0], t=(z-p1[0])/h;
    const m1=(p2[1]-p0[1])/(p2[0]-p0[0]||1)*h, m2=(p3[1]-p1[1])/(p3[0]-p1[0]||1)*h;
    const t2=t*t, t3=t2*t;
    return (2*t3-3*t2+1)*p1[1]+(t3-2*t2+t)*m1+(-2*t3+3*t2)*p2[1]+(t3-t2)*m2;
  };
}
// a surface through rings of [x,y] at successive z; ring order runs
// anticlockwise seen from the front (+z), so the faces point outward
function skin(zs, rings, closed, col, fin){
  const nS=zs.length, M=rings[0].length, P=new Float32Array(nS*M*3), C=new Float32Array(nS*M*3), idx=[];
  for(let i=0;i<nS;i++) for(let j=0;j<M;j++){
    const k=(i*M+j)*3, p=rings[i][j], c=col(i,j,p);
    P[k]=p[0]; P[k+1]=p[1]; P[k+2]=zs[i]; C[k]=c.r; C[k+1]=c.g; C[k+2]=c.b;
  }
  const J=closed?M:M-1;
  for(let i=0;i<nS-1;i++) for(let j=0;j<J;j++){
    const j1=(j+1)%M, a=i*M+j, b=i*M+j1, c=(i+1)*M+j1, d=(i+1)*M+j;
    idx.push(a,b,c, a,c,d);
  }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.BufferAttribute(P,3));
  g.setAttribute("color", new T.BufferAttribute(C,3));
  g.setIndex(idx); g.computeVertexNormals();
  return finUV(g, fin||0);
}
// a flat fan closing a ring: front (+z) or back
function capGeo(ring, z, front, color, fin){
  let cx=0, cy=0; for(const p of ring){ cx+=p[0]; cy+=p[1]; } cx/=ring.length; cy/=ring.length;
  const P=[cx,cy,z], idx=[];
  for(const p of ring) P.push(p[0],p[1],z);
  const M=ring.length;
  for(let j=0;j<M;j++){ const a=1+j, b=1+(j+1)%M; if(front) idx.push(0,a,b); else idx.push(0,b,a); }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P,3));
  g.setIndex(idx); g.computeVertexNormals();
  return finUV(g, fin||0);
}
// a rounded box section: superellipse, flatter underneath, a little tumblehome
function bodyRing(w, top, bot, n, tum, M){
  const yc=(top+bot)/2, hh=Math.max(0.005,(top-bot)/2), out=[];
  for(let j=0;j<M;j++){
    const a=j/M*Math.PI*2, c=Math.cos(a), s=Math.sin(a), ne=s>0?n:n*1.7;
    const px=Math.sign(c)*Math.pow(Math.abs(c),2/ne), py=Math.sign(s)*Math.pow(Math.abs(s),2/ne);
    out.push([w*px*(1-tum*Math.max(0,py)), yc+hh*py]);
  }
  return out;
}
const _bx=new T.Vector3(), _by=new T.Vector3(), _bz=new T.Vector3(), _UP=new T.Vector3(0,1,0);
// an entry for a box laid on a surface at p, facing n
function onSurf(L, w, h, d, p, n, color, fin, out, roll){
  _bz.copy(n).normalize();
  _bx.crossVectors(_UP, _bz); if(_bx.lengthSq()<1e-6) _bx.set(1,0,0); _bx.normalize();
  _by.crossVectors(_bz, _bx);
  const m=new T.Matrix4().makeBasis(_bx, _by, _bz);
  if(roll) m.multiply(new T.Matrix4().makeRotationZ(roll));
  m.setPosition(p.x+_bz.x*(d/2+(out||0)), p.y+_bz.y*(d/2+(out||0)), p.z+_bz.z*(d/2+(out||0)));
  L.push({geo:finUV(boxGeo(w,h,d), fin||0), matrix:m, color:new T.Color(color)});
}
// a thin bar from a to b, its flat side facing n
function bar(L, a, b, w, t, n, color, fin){
  const d=new T.Vector3().subVectors(b,a), len=d.length(); if(len<1e-4) return;
  _by.copy(d).normalize();
  _bz.copy(n).addScaledVector(_by, -n.dot(_by)).normalize();
  _bx.crossVectors(_by, _bz);
  const m=new T.Matrix4().makeBasis(_bx, _by, _bz);
  m.setPosition((a.x+b.x)/2, (a.y+b.y)/2, (a.z+b.z)/2);
  L.push({geo:finUV(boxGeo(w,len,t), fin||0), matrix:m, color:new T.Color(color)});
}
// a plain entry: geometry at a place, turned YXZ
const _eu=new T.Euler(), _qq=new T.Quaternion(), _one=new T.Vector3(1,1,1);
function vAdd(L, geo, x,y,z, color, fin, rx,ry,rz){
  _eu.set(rx||0,ry||0,rz||0,"YXZ"); _qq.setFromEuler(_eu);
  L.push({geo:finUV(geo, fin||0), matrix:new T.Matrix4().compose(new T.Vector3(x,y,z),_qq,_one), color:new T.Color(color)});
}
const vBox=(L,w,h,d,x,y,z,c,fin,rx,ry,rz)=>vAdd(L, boxGeo(w,h,d), x,y,z, c, fin, rx,ry,rz);
const vCylX=(L,r,len,x,y,z,c,fin,seg)=>vAdd(L, new T.CylinderGeometry(r,r,len,seg||14), x,y,z, c, fin, 0,0,Math.PI/2);
const vCylZ=(L,r,len,x,y,z,c,fin,seg)=>vAdd(L, new T.CylinderGeometry(r,r,len,seg||14), x,y,z, c, fin, Math.PI/2,0,0);
const vCylY=(L,r,len,x,y,z,c,fin,seg)=>vAdd(L, new T.CylinderGeometry(r,r,len,seg||12), x,y,z, c, fin);

/* ---- a lofted body --------------------------------------------------------
   D: {nose, tail, top, bot, wid (curves), n, tum, rN, rT ([plan, top,
   bottom] radii at the nose and tail), arch, archY}. Returns the sampler
   for decals as well as the geometry. */
function loftBody(D, S, paint, trim, coarse){
  const top=crv(D.top), bot=crv(D.bot), wid=crv(D.wid), nf=D.nz?crv(D.nz):()=>D.n;
  const sec=(z)=>{
    let w=wid(z), t=top(z), b=bot(z);
    for(const a of S.axles){ const dz=z-a, R=D.arch; if(Math.abs(dz)<R) b=Math.max(b, D.archY+Math.sqrt(R*R-dz*dz)); }
    if(z>D.nose-D.rN[0]){ const u=Math.min(1,(z-(D.nose-D.rN[0]))/D.rN[0]), s=1-Math.sqrt(Math.max(0,1-u*u));
      w-=D.rN[0]*s; t-=D.rN[1]*s; b+=D.rN[2]*s; }
    if(z<D.tail+D.rT[0]){ const u=Math.min(1,(D.tail+D.rT[0]-z)/D.rT[0]), s=1-Math.sqrt(Math.max(0,1-u*u));
      w-=D.rT[0]*s; t-=D.rT[1]*s; b+=D.rT[2]*s; }
    return {w:w, t:t, b:b, n:nf(z)};
  };
  const zs=[], NE=coarse?2:5;
  for(let k=0;k<=NE;k++) zs.push(D.tail+D.rT[0]*(1-Math.cos(k/NE*Math.PI/2)));
  let z=D.tail+D.rT[0];
  while(z<D.nose-D.rN[0]-0.02){
    let near=false; for(const a of S.axles) if(Math.abs(z-a)<D.arch+0.06) near=true;
    z+=coarse?(near?0.18:0.6):(near?0.07:0.24);
    if(z<D.nose-D.rN[0]-0.02) zs.push(z);
  }
  for(let k=0;k<=NE;k++) zs.push(D.nose-D.rN[0]*(1-Math.sin(k/NE*Math.PI/2)));
  if(!coarse && D.extraZ) for(const e of D.extraZ) zs.push(e);
  zs.sort((a,b)=>a-b);
  for(let i=zs.length-1;i>0;i--) if(zs[i]-zs[i-1]<0.004) zs.splice(i,1);
  const M=coarse?12:(D.M||24), rings=[], secs=[];
  for(const zz of zs){ const s=sec(zz); secs.push(s); rings.push(bodyRing(s.w, s.t, s.b, s.n, D.tum, M)); }
  const P=new T.Color(paint), TR=new T.Color(trim||0x1b1c1e);
  // (under the glass, the top of the loft is the cabin's floor and door tops, in the trim's colour, not paint)
  const IN=D.inside && !coarse ? D.inside : null, IC=IN ? new T.Color(IN.col) : null;
  const g=skin(zs, rings, true, (i,j,p)=>(p[1]<secs[i].b+0.045 ? TR :
                IN && zs[i]>IN.z0 && zs[i]<IN.z1 && p[1]>IN.y ? IC : P), FIN.paint);
  const OP=[{geo:g, matrix:new T.Matrix4(), color:null}];
  OP.push({geo:capGeo(rings[rings.length-1], zs[zs.length-1], true), matrix:new T.Matrix4(), color:P});
  OP.push({geo:capGeo(rings[0], zs[0], false), matrix:new T.Matrix4(), color:P});
  // the sampler: a point on the skin at (z, angle) and its outward normal
  const pt=(z,a)=>{
    const s=sec(z), yc=(s.t+s.b)/2, hh=(s.t-s.b)/2, c=Math.cos(a), sn=Math.sin(a), ne=sn>0?s.n:s.n*1.7;
    const px=Math.sign(c)*Math.pow(Math.abs(c),2/ne), py=Math.sign(sn)*Math.pow(Math.abs(sn),2/ne);
    return new T.Vector3(s.w*px*(1-D.tum*Math.max(0,py)), yc+hh*py, z);
  };
  const nrm=(z,a)=>{
    const e=0.004, p=pt(z,a), dz=new T.Vector3().subVectors(pt(z+e,a), pt(z-e,a)),
          da=new T.Vector3().subVectors(pt(z,a+e), pt(z,a-e));
    const n=new T.Vector3().crossVectors(da, dz).normalize();
    // outward, whatever the parametrisation did
    const s=sec(z); if(n.x*p.x+n.y*(p.y-(s.t+s.b)/2)<0) n.negate();
    return n;
  };
  // the angle on the right-hand side at which the skin is at height y
  const angAt=(z,y)=>{ let lo=-Math.PI/2+0.02, hi=Math.PI/2-0.02;
    for(let k=0;k<24;k++){ const m=(lo+hi)/2; if(pt(z,m).y<y) lo=m; else hi=m; } return (lo+hi)/2; };
  // a patch of the skin itself, pushed out: glass, panels, anything that
  // has to sit on the curve rather than across it
  // (out along the normal in z too, a ring at a time: on a windshield the
  // normal is mostly z, and pushed out in x and y alone the glass lay a
  // millimetre off the paint, which is no distance at all at forty metres)
  const patch=(L, z0,z1,a0,a1,out,color,fin,nz,na)=>{
    const zz=[], rr=[], C=new T.Color(color);
    for(let i=0;i<=nz;i++){ const z=lerp(z0,z1,i/nz); const r=[]; let nzs=0;
      for(let j=0;j<=na;j++){ const a=lerp(a0,a1,j/na), p=pt(z,a), n=nrm(z,a); r.push([p.x+n.x*out, p.y+n.y*out]); nzs+=n.z; }
      zz.push(z+nzs/(na+1)*out); rr.push(r); }
    L.push({geo:skin(zz, rr, false, ()=>C, fin), matrix:new T.Matrix4(), color:null});
  };
  return {OP:OP, sec:sec, pt:pt, nrm:nrm, angAt:angAt, patch:patch, zN:zs[zs.length-1], zT:zs[0]};
}

/* ---- a lamp laid on the skin where it turns the corner --------------------
   A patch of the body itself between z0 and z1 and a band of height either
   side of y, pushed a few millimetres out: it follows the curve in plan
   and in section, so it never stands off the corner at an angle the way a
   flat box set on one normal did. sd picks the side (the left one is the
   right one's angles mirrored). Returns where its light comes from. */
function cornerLamp(B, OP, sd, z0, z1, y, hh, color, fin, out){
  const zc=(z0+z1)/2, a0=B.angAt(zc, y-hh), a1=B.angAt(zc, y+hh);
  if(sd>0) B.patch(OP, z0, z1, a0, a1, out, color, fin, 5, 2);
  else B.patch(OP, z0, z1, Math.PI-a1, Math.PI-a0, out, color, fin, 5, 2);
  const ac=B.angAt(zc, y), p=B.pt(zc, ac), n=B.nrm(zc, ac);
  if(sd<0){ p.x=-p.x; n.x=-n.x; }
  return {p:p.addScaledVector(n, out+0.04), n:n};
}

/* ---- the greenhouse: glass, with the roof and pillars laid over it -------- */
function greenhouse(G, OP, GL, paint){
  const fA=t=>1-Math.pow(1-t,1.7);
  const roofY=z=>{
    if(z>=G.zRF) return G.belt+(G.roof-G.belt)*fA(clamp((G.zA-z)/(G.zA-G.zRF),0,1));
    if(z<=G.zRR) return G.belt+(G.roof-G.belt)*fA(clamp((z-G.zB)/(G.zRR-G.zB),0,1));
    return G.roof;
  };
  const yb=G.belt-0.13;
  const ring=(z, out)=>{
    const yr=roofY(z), h=Math.max(0.002, yr-yb), rise=Math.max(0, yr-G.belt);
    const ends=Math.min(clamp((G.zA-z)/0.6,0,1), clamp((z-G.zB)/0.6,0,1));
    const wb=G.wb*(0.95+0.05*ends), wt=Math.max(0.05, wb-rise*G.tum);
    const rc=Math.min(0.14, h*0.45, wt*0.5), pts=[];
    for(let k=0;k<5;k++){ const t=k/5; pts.push([lerp(wb,wt,t), lerp(yb,yr-rc,t)]); }
    for(let k=0;k<4;k++){ const a=k/4*Math.PI/2; pts.push([wt-rc+rc*Math.cos(a), yr-rc+rc*Math.sin(a)]); }
    for(let k=0;k<=6;k++){ const t=k/6; pts.push([lerp(wt-rc,-(wt-rc),t), yr+(G.crown||0)*Math.sin(t*Math.PI)*Math.min(1,rise/0.3)]); }
    for(let k=1;k<=4;k++){ const a=Math.PI/2+k/4*Math.PI/2; pts.push([-(wt-rc)+rc*Math.cos(a), yr-rc+rc*Math.sin(a)]); }
    for(let k=1;k<=5;k++){ const t=k/5; pts.push([lerp(-wt,-wb,t), lerp(yr-rc,yb,t)]); }
    if(out){ const cy=yb+h*0.4; for(const p of pts){ p[0]*=1+out; p[1]=cy+(p[1]-cy)*(1+out*1.8); } }
    return pts;
  };
  const span=(z0,z1,n)=>{ const a=[]; for(let k=0;k<=n;k++) a.push(lerp(z0,z1,k/n)); return a; };
  const zs=span(G.zB, G.zA, G.coarse?6:18);
  const glassC=new T.Color(G.glass||0x1c252c);
  GL.push({geo:skin(zs, zs.map(z=>ring(z)), false, ()=>glassC, FIN.lens), matrix:new T.Matrix4(), color:null});
  // strips: a range of ring indices over a range of z, pushed out
  // (inner: the same band a little inside the glass and turned to face in, for the lining seen from inside)
  const strip=(i0,i1,z0,z1,color,fin,out,n,inner)=>{
    const C=new T.Color(color), zz=span(z0,z1,n||Math.max(2,Math.ceil((z1-z0)/0.12)));
    for(const [a,b] of [[i0,i1],[24-i1,24-i0]]){
      const rings=zz.map(z=>{ const r=ring(z, out||0.012).slice(a,b+1); return inner ? r.reverse() : r; });
      OP.push({geo:skin(zz, rings, false, ()=>C, fin), matrix:new T.Matrix4(), color:null});
    }
  };
  const P=paint, BLK=0x16171a;
  if(G.coarse) return {roofY:roofY, ring:ring};
  // the roof panel
  {
    // ring points 7..17, symmetric; the pillars below stop at 7 and 17, so
    // the two never lie one on the other
    const C=new T.Color(P), zz=span(G.zRR+0.04, G.zRF-0.04, 16);
    OP.push({geo:skin(zz, zz.map(z=>ring(z,0.014).slice(7,18)), false, ()=>C, FIN.paint), matrix:new T.Matrix4(), color:null});
  }
  strip(4, 7, G.zRF-0.06, G.zA, G.aPillar||P, FIN.paint, 0.016, 10);            // A pillars
  for(const [z0,z1,c] of (G.pillars||[])) strip(0, 7, z0, z1, c==="paint"?P:c, c==="paint"?FIN.paint:FIN.trim, 0.016, 3);
  // and seen through the glass from the other side, their linings and the headliner, a couple of centimetres in
  if(G.lining!==undefined){
    const C=new T.Color(G.lining), zz=span(G.zRR+0.04, G.zRF-0.04, 16);
    OP.push({geo:skin(zz, zz.map(z=>ring(z,-0.022).slice(7,18).reverse()), false, ()=>C, FIN.trim), matrix:new T.Matrix4(), color:null});
    strip(4, 7, G.zRF-0.06, G.zA, G.lining, FIN.trim, -0.022, 10, true);
    for(const [z0,z1] of (G.pillars||[])) strip(0, 7, z0, z1, G.lining, FIN.trim, -0.022, 3, true);
  }
  return {roofY:roofY, ring:ring};
}

/* ---- cars ------------------------------------------------------------------ */
const CAR_DEF={
  0:{ top:[[-2.42,0.95],[-2.30,0.98],[-2.0,0.99],[-1.6,0.99],[0.9,0.97],[1.5,0.93],[2.05,0.84],[2.44,0.76]],
      bot:[[-2.42,0.36],[-2.1,0.28],[2.1,0.27],[2.44,0.31]],
      wid:[[-2.42,0.89],[-1.8,0.93],[1.8,0.93],[2.44,0.89]],
      n:5.0, tum:0.05, rN:[0.24,0.10,0.05], rT:[0.13,0.06,0.05], arch:0.45,
      gh:{belt:0.975, zA:1.00, zRF:0.08, zRR:-1.10, zB:-1.98, roof:1.44, wb:0.82, tum:0.36, crown:0.02,
          pillars:[[-0.50,-0.41,0x16171a],[-1.98,-1.30,"paint"]]},
      seams:[0.98,-0.46,-1.32], handles:[0.30,-0.92], grille:[0.48,0.15], intake:[0.33,0.08], headY:0.66, tailY:0.80, plateY:0.54,
      rows:[[-0.30,2],[-1.18,3]], tailIn:[0.27,0.055] },
  1:{ top:[[-2.38,1.02],[-2.3,1.08],[-2.1,1.10],[1.1,1.08],[1.7,1.03],[2.15,0.95],[2.38,0.88]],
      bot:[[-2.38,0.46],[-2.1,0.37],[2.1,0.36],[2.38,0.42]],
      wid:[[-2.38,0.93],[-1.9,0.97],[1.9,0.97],[2.38,0.92]],
      n:6.0, tum:0.04, rN:[0.24,0.12,0.05], rT:[0.12,0.06,0.04], arch:0.50,
      gh:{belt:1.09, zA:1.14, zRF:0.28, zRR:-2.02, zB:-2.30, roof:1.74, wb:0.87, tum:0.30, crown:0.02,
          pillars:[[-0.40,-0.31,0x16171a],[-1.38,-1.28,0x16171a],[-2.30,-2.06,"paint"]]},
      seams:[1.02,-0.36,-1.33], handles:[0.40,-0.88], grille:[0.70,0.20], intake:[0.50,0.10], headY:0.86, tailY:1.02, plateY:0.70,
      rails:true, flare:true, hatch:true, rows:[[-0.12,2],[-1.10,3]] },
  2:{ top:[[-2.98,1.10],[-2.9,1.15],[-0.86,1.16],[-0.76,1.19],[1.30,1.19],[1.9,1.14],[2.5,1.06],[2.92,0.97]],
      bot:[[-2.98,0.54],[-2.7,0.44],[2.6,0.43],[2.92,0.48]],
      wid:[[-2.98,0.98],[2.5,1.00],[2.92,0.95]],
      n:6.0, nz:[[-3,10],[-0.9,10],[-0.7,6],[3,6]], tum:0.03, rN:[0.22,0.12,0.05], rT:[0.08,0.04,0.04], arch:0.53,
      gh:{belt:1.19, zA:1.36, zRF:0.52, zRR:-0.66, zB:-0.80, roof:1.88, wb:0.90, tum:0.22, crown:0.02,
          pillars:[[-0.04,0.05,0x16171a],[-0.80,-0.58,"paint"]]},
      seams:[1.30,0.02,-0.70], handles:[0.70,-0.30], grille:[0.80,0.30,true], intake:[0.52,0.08], headY:0.96, tailY:0.92, plateY:0.66,
      bed:true, flare:true, rows:[[0.20,2],[-0.56,3]], tailIn:[0.10,0.09] },
  3:{ top:[[-2.50,0.98],[-2.42,1.04],[-2.2,1.05],[1.30,1.05],[1.85,0.99],[2.3,0.86],[2.52,0.76]],
      bot:[[-2.50,0.38],[-2.2,0.32],[2.2,0.31],[2.52,0.34]],
      wid:[[-2.50,0.95],[-2.0,0.99],[2.0,0.99],[2.52,0.92]],
      n:5.0, tum:0.05, rN:[0.28,0.12,0.05], rT:[0.12,0.06,0.04], arch:0.46,
      gh:{belt:1.045, zA:1.42, zRF:0.30, zRR:-2.25, zB:-2.47, roof:1.76, wb:0.90, tum:0.30, crown:0.03,
          pillars:[[-0.20,-0.11,0x16171a],[-1.42,-1.32,0x16171a],[-2.47,-2.20,"paint"]]},
      seams:[1.28,-0.15,-1.36], handles:[0.55,-0.30], grille:[0.52,0.12], intake:[0.36,0.10], headY:0.72, tailY:0.95, plateY:0.60,
      slider:true, hatch:true, rows:[[0.06,2],[-0.92,2],[-1.82,3]] },
};
function carParts(kind, paintHex, coarse){
  const S=VEH_SPEC[kind], D=Object.assign({nose:S.nose, tail:S.tail, archY:S.wr-0.06}, CAR_DEF[kind]);
  // the cabin's trim, charcoal or grey or tan by the paint; under the glass the loft's top is in it, with rings
  // either side of where the glass meets the body, so the paint does not shade into it out on the hood
  const PC=new T.Color(paintHex), TONE=[0x2a2a2c,0x3e3d3b,0x6c604e][Math.floor((PC.r*7+PC.g*11+PC.b*5)*10)%3];
  D.inside={z0:D.gh.zB+0.015, z1:D.gh.zA-0.025, y:D.gh.belt-0.004, col:TONE};
  D.extraZ=[D.gh.zA-0.03, D.gh.zA+0.01, D.gh.zB+0.02, D.gh.zB-0.02];
  const B=loftBody(D, S, paintHex, null, coarse), OP=B.OP, GL=[];
  const P=new T.Color(paintHex), BLK=0x16171a, CHR=0xc9ccce, LAMPS={head:[], tail:[]};
  const G=Object.assign({coarse:coarse}, D.gh), zMid=(G.zA+G.zB)/2;
  G.lining=new T.Color(TONE).lerp(new T.Color(0xb4b0a8), 0.35).getHex();
  G.wb=B.pt(zMid, B.angAt(zMid, G.belt-0.035)).x-0.006;
  const gh=greenhouse(G, OP, GL, paintHex);
  if(coarse){
    for(const a of S.axles) vBox(OP, 2*(S.track-0.17), 0.46, 2*D.arch-0.06, 0, S.wr+0.13, a, 0x16171a, FIN.trim);
    return {OP:OP, GL:GL, spec:S, lamps:null};
  }
  /* ---- the cabin, seen through the glass: the dash, the wheel on the left, a seat back and headrest for
     each place, all standing up out of the loft's top (the floor of it) and clear of the glass ---- */
  {
    const yb=G.belt, R=G.roof-yb, wS=G.wb/0.9, DK=0x1c1c1e;
    vBox(OP, 2*(G.wb-0.17), 0.13, 0.42, 0, yb-0.005, G.zA-0.40, DK, FIN.trim);
    const xd=-0.40*wS, zW=G.zA-0.66, yW=yb+0.075;
    vAdd(OP, new T.TorusGeometry(0.175, 0.018, 6, 22), xd, yW, zW, DK, FIN.trim, 0.55, 0, 0);
    vBox(OP, 0.05, 0.05, 0.30, xd, yW-0.078, zW+0.128, DK, FIN.trim, 0.55, 0, 0);
    vBox(OP, 0.07, 0.07, 0.035, xd, yW, zW, 0x2c2c2e, FIN.trim, 0.55, 0, 0);
    const head=(x, z)=>vBox(OP, 0.25, 0.26*R, 0.09, x, yb+0.65*R, z-0.065, TONE, FIN.trim, -0.10, 0, 0);
    for(const [z, n] of D.rows){
      if(n===2) for(const sd of [-1,1]){ vBox(OP, 0.50, 0.48*R+0.12, 0.11, sd*0.40*wS, yb+0.24*R-0.06, z, TONE, FIN.trim, -0.16, 0, 0);
        head(sd*0.40*wS, z); }
      else{ vBox(OP, 2*(G.wb-0.20), 0.48*R+0.12, 0.12, 0, yb+0.24*R-0.06, z, TONE, FIN.trim, -0.16, 0, 0);
        for(const x of [-0.44*wS, 0, 0.44*wS]) head(x, z); }
    }
  }
  // wheel wells: dark, so the arches do not show daylight through the car
  for(const a of S.axles) vBox(OP, 2*(S.track-0.17), 0.46, 2*D.arch-0.06, 0, S.wr+0.13, a, BLK, FIN.trim);
  const mir=v=>new T.Vector3(-v.x, v.y, v.z), mirN=n=>new T.Vector3(-n.x, n.y, n.z);
  const both=(fn)=>{ fn(1); fn(-1); };
  // lamps on the corners, where the skin turns
  both(sd=>{
    // a dark bezel, the lens inside it, a chrome reflector band across its foot
    cornerLamp(B, OP, sd, B.zN-0.208, B.zN-0.024, D.headY+0.002, 0.060, 0x3a3e42, FIN.trim, 0.0025);
    const h=cornerLamp(B, OP, sd, B.zN-0.20, B.zN-0.03, D.headY+0.004, 0.052, 0xdfe4e6, FIN.lens, 0.0055);
    cornerLamp(B, OP, sd, B.zN-0.17, B.zN-0.05, D.headY-0.022, 0.012, 0x9aa3a8, FIN.chrome, 0.0080);
    LAMPS.head.push(h);
    cornerLamp(B, OP, sd, B.zT+0.02, B.zT+0.21, D.tailY, 0.068, 0x2a1414, FIN.trim, 0.0025);
    const t=cornerLamp(B, OP, sd, B.zT+0.035, B.zT+0.195, D.tailY, 0.055, 0x8a1410, FIN.lens, 0.0055);
    cornerLamp(B, OP, sd, B.zT+0.05, B.zT+0.12, D.tailY-0.03, 0.014, 0xd8d4cc, FIN.lens, 0.0080);   // the reversing lamp
    LAMPS.tail.push(t);
  });
  // the front: grille and lower intake on the nose cap
  {
    const zf=B.zN, s=B.sec(zf), w=Math.min(s.w*1.3, 0.9);
    const [gy,gh2,chrome]=D.grille;
    vBox(OP, w, gh2, 0.03, 0, gy, zf+0.004, chrome?CHR:0x202226, chrome?FIN.chrome:FIN.trim);
    if(chrome) for(let k=0;k<3;k++) vBox(OP, w*0.92, 0.025, 0.03, 0, gy-gh2*0.3+k*gh2*0.3, zf+0.02, 0x2a2c2e, FIN.trim);
    else for(let k=0;k<4;k++) vBox(OP, w*0.94, 0.012, 0.02, 0, gy-gh2*0.36+k*gh2*0.24, zf+0.02, 0x3b3e42, FIN.trim);
    vBox(OP, Math.min(s.w*1.5,1.0), D.intake[1], 0.03, 0, D.intake[0], zf+0.003, 0x141516, FIN.trim);
  }
  // the back: plate (Pennsylvania: white, a blue band and a yellow one), and a tailgate/trunk seam
  {
    const zt=B.zT-0.004, y=D.plateY;
    vBox(OP, 0.32, 0.165, 0.012, 0, y, zt, 0xf2f0e6, FIN.lens);
    vBox(OP, 0.312, 0.03, 0.020, 0, y+0.064, zt, 0x24408e, FIN.lens);
    vBox(OP, 0.312, 0.025, 0.020, 0, y-0.067, zt, 0xe2b43a, FIN.lens);
    for(let k=0;k<6;k++) vBox(OP, 0.028, 0.06, 0.024, -0.09+k*0.036, y, zt, 0x24408e, FIN.lens);
  }
  // door seams and handles, both sides, following the skin
  for(const zSeam of D.seams){
    const s=B.sec(zSeam);
    const a0=B.angAt(zSeam, s.b+0.07), a1=B.angAt(zSeam, D.gh.belt-0.03);
    both(sd=>{
      let prev=null;
      for(let k=0;k<=6;k++){
        const a=lerp(a0,a1,k/6), p=B.pt(zSeam,a), n=B.nrm(zSeam,a);
        const q=sd>0?p:mir(p), m=sd>0?n:mirN(n);
        q.addScaledVector(m, 0.002);
        if(prev) bar(OP, prev.q, q, 0.009, 0.004, m, 0x0e0f10, FIN.trim);
        prev={q:q};
      }
    });
  }
  for(const zH of D.handles){
    const a=B.angAt(zH, D.gh.belt-0.10), p=B.pt(zH,a), n=B.nrm(zH,a);
    both(sd=>onSurf(OP, 0.16, 0.03, 0.02, sd>0?p:mir(p), sd>0?n:mirN(n), paintHex, FIN.paint, 0.0));
  }
  // mirrors on stalks at the base of the A pillar
  both(sd=>{
    const z=D.gh.zA-0.22, s=B.sec(z), y=D.gh.belt+0.10;
    vAdd(OP, new T.SphereGeometry(0.5,10,8), sd*(s.w+0.07), y, z, paintHex, FIN.paint);
    OP[OP.length-1].matrix.scale(new T.Vector3(0.10,0.12,0.18));
    vBox(OP, 0.012, 0.09, 0.13, sd*(s.w+0.115), y, z-0.02, 0x30373c, FIN.chrome);
    vBox(OP, 0.10, 0.03, 0.06, sd*(s.w+0.02), y-0.04, z+0.02, BLK, FIN.trim);
  });
  /* ---- the rest of the outside ---- */
  const halfW=(z,y)=>B.pt(z, B.angAt(z,y)).x;                     // the skin's half width at height y
  // a line in the skin (a shut line, a seam) through [z, y] points, both sides
  const skinLine=(pts, w, color, fin, out)=>both(sd=>{
    let prev=null;
    for(let i=0;i<pts.length;i++){
      const n=i ? Math.max(1, Math.ceil(Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1])/0.05)) : 1;
      for(let k=i?1:0;k<=n;k++){
        const t=i ? k/n : 0, z=i ? lerp(pts[i-1][0], pts[i][0], t) : pts[0][0], y=i ? lerp(pts[i-1][1], pts[i][1], t) : pts[0][1];
        const a=B.angAt(z,y), p=B.pt(z,a), m=B.nrm(z,a), q=sd>0?p:mir(p), mm=sd>0?m:mirN(m);
        q.addScaledVector(mm, out||0.002);
        if(prev) bar(OP, prev.q, q, w, 0.004, mm, color, fin);
        prev={q:q}; if(!i) break; } } });
  const aF=S.axles[0], aR=S.axles[S.axles.length-1];
  // the bumpers' shut lines: the front one from behind the headlamp down to the wheel arch, the back one
  // across under the tail lamps, round the corner and down to its arch
  skinLine([[B.zN-0.24, D.headY-0.07], [aF+D.arch*0.72, D.archY+D.arch*0.70]], 0.008, 0x0e0f10, FIN.trim);
  { const yR=Math.min(D.plateY+0.12, D.tailY-0.10);
    skinLine([[B.zT+0.03, yR], [B.zT+0.30, yR], [aR-D.arch*0.74, D.archY+D.arch*0.68]], 0.008, 0x0e0f10, FIN.trim);
    vBox(OP, 2*(halfW(B.zT, yR)-0.012), 0.008, 0.004, 0, yR, B.zT-0.003, 0x0e0f10, FIN.trim);
    // the black diffuser along its foot (its face behind the plate's), and the exhaust out under it on the left
    if(!D.bed){ const yd=B.sec(B.zT).b+0.06, xe=-0.46*halfW(B.zT, yd);
      vBox(OP, 2*(halfW(B.zT, yd)-0.05), 0.09, 0.010, 0, yd, B.zT-0.001, 0x161718, FIN.trim);
      vCylZ(OP, 0.034, 0.11, xe, yd-0.035, B.zT+0.02, CHR, FIN.chrome, 14);
      vCylZ(OP, 0.024, 0.118, xe, yd-0.035, B.zT+0.02, 0x0b0b0c, FIN.trim, 12); } }
  // the hood's shut lines down either side, and the trunk's or the hatch's
  { const top=z=>B.sec(z).t-0.035, n=6, hood=[], deck=[];
    for(let k=0;k<=n;k++){ const z=lerp(G.zA+0.04, B.zN-0.16, k/n); hood.push([z, top(z)]); }
    skinLine(hood, 0.007, 0x101112, FIN.trim);
    if(!D.hatch && !D.bed){ for(let k=0;k<=n;k++){ const z=lerp(G.zB-0.05, B.zT+0.12, k/n); deck.push([z, top(z)]); }
      skinLine(deck, 0.007, 0x101112, FIN.trim); } }
  // a black seal along the foot of the side glass
  { const pts=[]; for(let k=0;k<=12;k++){ const z=lerp(G.zB+0.06, G.zA-0.06, k/12); pts.push([z, G.belt-0.028]); }
    skinLine(pts, 0.026, BLK, FIN.trim, 0.005); }
  // the tail lamps carried in across the back where there is room for them (a housing, the lens, a reversing lamp)
  if(D.tailIn){
    const [wl, hh]=D.tailIn, zt=B.zT, y=D.tailY, xe=Math.min(halfW(zt, y+hh+0.012), halfW(zt, y-hh-0.012))-0.03;
    both(sd=>{ const xo=sd*(xe-wl/2);
      vBox(OP, wl+0.024, 2*hh+0.024, 0.012, xo, y, zt-0.005, 0x2a1414, FIN.trim);
      vBox(OP, wl, 2*hh, 0.012, xo, y, zt-0.012, 0x8a1410, FIN.lens);
      vBox(OP, wl*0.30, hh*0.7, 0.012, sd*(xe-wl*0.74), y-hh*0.30, zt-0.017, 0xd8d4cc, FIN.lens); });
  }
  // side markers: amber at the front, red at the back
  both(sd=>{ cornerLamp(B, OP, sd, B.zN-0.44, B.zN-0.36, D.headY-0.05, 0.016, 0xd08a1c, FIN.lens, 0.003);
             cornerLamp(B, OP, sd, B.zT+0.34, B.zT+0.42, D.tailY-0.07, 0.016, 0x8a1410, FIN.lens, 0.003); });
  // badges, front and back
  vBox(OP, 0.10, 0.05, 0.008, 0, D.grille[0], B.zN+0.044, CHR, FIN.chrome);
  vBox(OP, 0.12, 0.034, 0.008, 0, D.tailIn ? D.tailY : D.plateY+0.17, B.zT-0.010, CHR, FIN.chrome);
  // wipers parked at the windshield's foot; on a hatch one more on the back glass
  { const gl=(z)=>gh.roofY(z)+(G.crown||0)*Math.min(1, Math.max(0, gh.roofY(z)-G.belt)/0.3);
    const nAt=(z)=>new T.Vector3(0, 1, -(gl(z+0.01)-gl(z-0.01))/0.02).normalize();
    const wipe=(z, x0, x1)=>{ const n=nAt(z), a=new T.Vector3(x0, gl(z), z).addScaledVector(n, 0.014),
                                b=new T.Vector3(x1, gl(z), z).addScaledVector(n, 0.014); bar(OP, a, b, 0.018, 0.012, n, BLK, FIN.trim); };
    wipe(G.zA-0.09, -0.60*G.wb, -0.05); wipe(G.zA-0.11, 0.0, 0.52*G.wb);
    if(D.hatch) wipe(G.zB+0.07, 0.02, 0.38*G.wb);
    // the third brake lamp over the back glass, and a fin aerial on the roof
    // (its front edge where the roof begins to fall away, so the whole of it is over the glass)
    vBox(OP, 0.34, 0.028, 0.05, 0, gl(G.zRR-0.035)+0.02, G.zRR-0.06, 0x8a1410, FIN.lens);
    vBox(OP, 0.045, 0.07, 0.15, 0, G.roof+(G.crown||0)+0.03, G.zRR+0.22, BLK, FIN.trim); }
  // per kind
  if(D.rails){
    const z0=D.gh.zRR+0.15, z1=D.gh.zRF-0.12, rr0=gh.ring((z0+z1)/2);
    for(const sd of [-1,1]){
      const x=sd*Math.abs(rr0[10][0])*0.9, y=D.gh.roof+0.05;
      vBox(OP, 0.04, 0.035, z1-z0, x, y, (z0+z1)/2, 0x2a2c2e, FIN.trim);
      for(const zz of [z0+0.05, z1-0.05]) vBox(OP, 0.05, 0.05, 0.10, x, y-0.025, zz, 0x2a2c2e, FIN.trim);
    }
  }
  if(D.flare) for(const a of S.axles) both(sd=>{
    // black arch mouldings, round the top of each wheel from behind it to in front
    let prev=null;
    for(let k=0;k<=12;k++){
      const ang=-Math.PI/2+k/12*Math.PI, z=a+Math.sin(ang)*(D.arch+0.03), yy=D.archY+Math.cos(ang)*(D.arch+0.03);
      const s=B.sec(z), p=new T.Vector3(sd*(s.w*0.99+0.01), Math.max(yy, s.b+0.03), z);
      if(prev) bar(OP, prev, p, 0.07, 0.03, new T.Vector3(sd,0,0), 0x1a1b1d, FIN.trim);
      prev=p;
    }
  });
  if(D.bed){
    // a hard tonneau cover over the bed, and a chrome step bumper
    const z0=S.tail+0.10, z1=-0.86, s=B.sec((z0+z1)/2);
    vBox(OP, s.w*2-0.12, 0.03, z1-z0, 0, s.t+0.012, (z0+z1)/2, 0x1c1d1f, FIN.trim);
    vBox(OP, s.w*2+0.02, 0.05, 0.05, 0, s.t-0.02, S.tail+0.04, BLK, FIN.trim);
    vBox(OP, 2.02, 0.20, 0.18, 0, 0.56, S.tail-0.05, CHR, FIN.chrome);
    vBox(OP, 0.30, 0.06, 0.03, 0, s.t-0.16, S.tail-0.01, BLK, FIN.trim);          // tailgate handle
  }
  if(D.slider) both(sd=>{
    const z0=-1.70, z1=-0.40, y=D.gh.belt-0.06;
    const p0=B.pt(z0,B.angAt(z0,y)), p1=B.pt(z1,B.angAt(z1,y)), n=B.nrm(-1,B.angAt(-1,y));
    bar(OP, sd>0?p0:mir(p0), sd>0?p1:mir(p1), 0.025, 0.012, sd>0?n:mirN(n), 0x1c1d1f, FIN.trim);
  });
  return {OP:OP, GL:GL, spec:S, lamps:LAMPS, glassMat:VEH_GLASS_CAR};
}

/* ---- trucks ---------------------------------------------------------------
   The trailers' sides are painted: a canvas, four liveries deep, each a
   1600-pixel band of aluminium sheet between the posts, rivet lines, the
   top and bottom rails, DOT tape and the road on the lower third; the rear
   doors in the last 400 pixels of the same band. */
const TRAILER_LIV={plain:0, freight:1, reefer:2, rental:3};
const TRAILER_TEX=(function(){
  const W=2048, H=1024, c=cvs(W,H), x=c.getContext("2d");
  const band=(row, opts)=>{
    const y0=row*256, SW=1600;
    x.save(); x.beginPath(); x.rect(0,y0,W,256); x.clip();
    // the sheet
    x.fillStyle=opts.base; x.fillRect(0,y0,SW,256);
    for(let i=0;i<SW;i+=opts.post){
      x.fillStyle="rgba(0,0,0,"+(0.02+rnd()*0.03)+")"; x.fillRect(i+4,y0+16,opts.post-8,226);
    }
    if(opts.posts){
      for(let i=0;i<SW;i+=opts.post){
        x.fillStyle="rgba(120,120,116,0.35)"; x.fillRect(i,y0+14,5,228);
        x.fillStyle="rgba(255,255,255,0.5)"; x.fillRect(i+5,y0+14,2,228);
        x.fillStyle="rgba(70,70,66,0.55)";
        for(let r=y0+22;r<y0+238;r+=9) x.fillRect(i+1,r,3,3);
      }
    }
    // rails, top and bottom, riveted
    const rail=(ry,h)=>{ const g=x.createLinearGradient(0,ry,0,ry+h); g.addColorStop(0,"#d9dbdb"); g.addColorStop(0.5,"#b9bcbd"); g.addColorStop(1,"#8d9091");
      x.fillStyle=g; x.fillRect(0,ry,SW,h); x.fillStyle="rgba(60,60,58,0.6)"; for(let i=6;i<SW;i+=11) x.fillRect(i,ry+h/2-1,3,3); };
    rail(y0, 14); rail(y0+238, 18);
    // DOT conspicuity tape along the bottom rail, red and white
    for(let i=20;i<SW-20;i+=64){ x.fillStyle="#c41a1a"; x.fillRect(i,y0+226,30,10); x.fillStyle="#f1f1ec"; x.fillRect(i+30,y0+226,30,10); }
    // the livery
    if(opts.draw) opts.draw(x, y0, SW);
    // grime: streaks from the roof rail, road spray up from the bottom
    for(let i=0;i<180;i++){ const sx=rnd()*SW, sl=20+rnd()*90; const g=x.createLinearGradient(0,y0+14,0,y0+14+sl);
      g.addColorStop(0,"rgba(70,62,50,"+(0.10+rnd()*0.14)+")"); g.addColorStop(1,"rgba(70,62,50,0)");
      x.fillStyle=g; x.fillRect(sx,y0+14,2+rnd()*4,sl); }
    let g=x.createLinearGradient(0,y0+150,0,y0+238); g.addColorStop(0,"rgba(96,84,64,0)"); g.addColorStop(1,"rgba(96,84,64,0.38)");
    x.fillStyle=g; x.fillRect(0,y0+150,SW,88);
    // the rear doors: two leaves, four lock rods, hinges, a placard
    const RX=1632, RW=400;
    x.fillStyle=opts.door; x.fillRect(RX,y0,RW,256);
    x.fillStyle="#8d9091"; x.fillRect(RX,y0,RW,12); x.fillRect(RX,y0+242,RW,14); x.fillRect(RX,y0,10,256); x.fillRect(RX+RW-10,y0,10,256);
    x.fillStyle="#6c6f70"; x.fillRect(RX+RW/2-2,y0+10,4,236);
    for(const k of [0.14,0.36,0.64,0.86]){ x.fillStyle="#c6c9ca"; x.fillRect(RX+RW*k-3,y0+14,6,228);
      x.fillStyle="#7c7f80"; x.fillRect(RX+RW*k-7,y0+120,14,26); }
    for(const k of [0.02,0.98]) for(const hy of [40,128,216]){ x.fillStyle="#5f6263"; x.fillRect(RX+RW*k-8,y0+hy,16,14); }
    for(let i=0;i<10;i++){ x.fillStyle=i%2?"#f1f1ec":"#c41a1a"; x.fillRect(RX+14+i*37,y0+230,37,8); }
    x.fillStyle="#f1f1ec"; x.fillRect(RX+RW*0.70,y0+60,52,34); x.fillStyle="#222"; x.font="bold 13px Arial"; x.fillText("NO",RX+RW*0.70+16,y0+75); x.fillText("STEP",RX+RW*0.70+9,y0+90);
    g=x.createLinearGradient(0,y0+150,0,y0+256); g.addColorStop(0,"rgba(96,84,64,0)"); g.addColorStop(1,"rgba(96,84,64,0.45)");
    x.fillStyle=g; x.fillRect(RX,y0+150,RW,106);
    x.restore();
  };
  band(0, {base:"#e7e6e0", door:"#dcdbd4", post:40, posts:true});
  band(1, {base:"#e9e8e3", door:"#dddcd5", post:40, posts:true, draw:(x,y0,SW)=>{
    x.fillStyle="#2f5a35"; x.fillRect(0,y0+150,SW,22); x.fillStyle="#c9a54a"; x.fillRect(0,y0+174,SW,6);
    x.fillStyle="#2f5a35";
    x.beginPath(); x.moveTo(470,y0+142); x.lineTo(560,y0+52); x.lineTo(610,y0+100); x.lineTo(660,y0+66); x.lineTo(760,y0+142); x.fill();
    x.font="bold 64px Oswald, Impact, Arial Black, sans-serif"; x.textBaseline="middle";
    x.fillText("NORTHERN TIER", 790, y0+86);
    x.font="600 30px Oswald, Arial, sans-serif"; x.fillText("F R E I G H T   ·   W I L L I A M S P O R T ,  P A", 794, y0+128); }});
  band(2, {base:"#eeeeea", door:"#e2e2dc", post:400, posts:false, draw:(x,y0,SW)=>{
    const g=x.createLinearGradient(0,0,SW,0); g.addColorStop(0,"#1d4f91"); g.addColorStop(1,"#3a86c8");
    x.fillStyle=g; x.beginPath(); x.moveTo(0,y0+200); x.bezierCurveTo(500,y0+130,900,y0+215,SW,y0+150); x.lineTo(SW,y0+224); x.lineTo(0,y0+224); x.fill();
    x.fillStyle="#1d4f91"; x.font="bold 70px Oswald, Impact, Arial Black, sans-serif"; x.textBaseline="middle";
    x.fillText("KEYSTONE COLD CHAIN", 120, y0+80);
    x.font="600 26px Oswald, Arial, sans-serif"; x.fillText("FRESH · FROZEN · ON TIME", 126, y0+124); }});
  band(3, {base:"#efefe9", door:"#d6d6d0", post:400, posts:false, draw:(x,y0,SW)=>{
    x.fillStyle="#d2671f"; x.fillRect(60,y0+40,480,150);
    x.fillStyle="#f6f4ee";
    fitText(x, "KEY STATE", 400, 44, 300, y0+88, "bold", "Oswald, Impact, 'Arial Black', sans-serif");
    fitText(x, "RENTALS", 400, 44, 300, y0+140, "bold", "Oswald, Impact, 'Arial Black', sans-serif");
    x.fillStyle="#1f1f1f"; fitText(x, "ONE WAY OR LOCAL · 1-800-555-0179", 440, 22, 300, y0+210, "600", "Oswald, Arial, sans-serif"); }});
  const t=new T.CanvasTexture(c); t.anisotropy=8;
  return t;
})();
const TRAILER_MAT=envOut(new T.MeshStandardMaterial({map:TRAILER_TEX, vertexColors:true, roughness:0.55, metalness:0.15}), 0.55);
/* a box whose four long faces take a livery: sides from the band's first
   1600 px (the left side mirrored so it reads), the back from the doors,
   the front and the roof from a plain patch of the same sheet */
function liveryBox(L, x0,x1,y0,y1,z0,z1, row, uSide, noBack){
  const v0=1-(row+1)/4+0.002, v1=1-row/4-0.002, us=uSide||0.78, P=[], U=[], idx=[];
  const quad=(a,b,c,d,ua,ub,va,vb)=>{ const o=P.length/3; P.push(...a,...b,...c,...d);
    U.push(ua,va, ub,va, ub,vb, ua,vb); idx.push(o,o+1,o+2, o,o+2,o+3); };
  const vv=t=>lerp(v0,v1,t);
  quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1], 0, us, vv(0), vv(1));          // right side, front at u=0
  quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0], 0, us, vv(0), vv(1));          // left side, read from the back
  if(!noBack) quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0], 0.797, 0.995, vv(0), vv(1));   // the back: the doors (unless they swing: 10-cars)
  quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1], 0.30, 0.34, vv(0.2), vv(0.8)); // the front
  quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0], 0.30, 0.34, vv(0.3), vv(0.5)); // the roof
  quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1], 0.30, 0.31, vv(0.9), vv(0.95));// underneath
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(P,3));
  g.setAttribute("uv", new T.Float32BufferAttribute(U,2));
  g.setIndex(idx); g.computeVertexNormals();
  L.push({geo:g, matrix:new T.Matrix4(), color:new T.Color(0xffffff)});
}
function truckOut(OP, GL, LV, S, LAMPS, coarse){
  if(!coarse) return {OP:OP, GL:GL, LV:LV, spec:S, lamps:LAMPS};
  // far away only the big pieces count
  const keep=e=>{ const g=e.geo; if(!g.boundingBox) g.computeBoundingBox(); const s=g.boundingBox.getSize(new T.Vector3());
    return Math.max(s.x,s.y,s.z)>0.9 && (s.x*s.y+s.y*s.z+s.x*s.z)>0.25; };
  return {OP:OP.filter(keep), GL:GL, LV:[], spec:S, lamps:null};
}
function truckParts(kind, paintHex, trailerHex, livery, coarse, opts){
  const S=VEH_SPEC[kind], OP=[], GL=[], LV=[], LAMPS={head:[], tail:[], amber:[]};
  const P=new T.Color(paintHex), BLK=0x17181a, CHR=0xcfd2d4, GLC=new T.Color(0x1a2329);
  const mud=(z, x)=>{ vBox(OP, 0.56, 0.62, 0.02, x, 0.52, z, 0x111214, FIN.rubber);
    vBox(OP, 0.60, 0.05, 0.06, x, 0.86, z+0.02, CHR, FIN.chrome); };
  if(kind===4){
    /* a medium-duty box truck: a conventional cab, a 15-foot box */
    const D={nose:S.nose, tail:0.30, n:5.0, tum:0.04, arch:0.66, archY:S.wr-0.04, M:28,
      top:[[0.30,2.46],[1.05,2.50],[1.40,2.30],[1.66,1.56],[2.4,1.48],[3.4,1.36],[3.86,1.20]],
      bot:[[0.30,0.62],[3.86,0.56]], wid:[[0.30,1.12],[1.66,1.12],[2.2,1.04],[3.86,0.98]],
      rN:[0.24,0.22,0.06], rT:[0.10,0.10,0.04]};
    const B=loftBody(D, {axles:[S.axles[0]]}, paintHex, null, coarse); OP.push(...B.OP);
    B.patch(GL, 1.30, 1.60, Math.PI/2-0.64, Math.PI/2+0.64, 0.008, 0x1a2329, FIN.lens, 4, 10);   // windshield
    {
      const a0=B.angAt(0.9,1.72), a1=B.angAt(0.9,2.26);
      B.patch(GL, 0.55, 1.22, a0, a1, 0.008, 0x1a2329, FIN.lens, 3, 3);
      B.patch(GL, 0.55, 1.22, Math.PI-a1, Math.PI-a0, 0.008, 0x1a2329, FIN.lens, 3, 3);
    }
    for(const sd of [-1,1]){
      vBox(OP, 0.06, 0.40, 0.18, sd*1.28, 2.05, 1.30, BLK, FIN.trim);                   // mirrors
      vBox(OP, 0.30, 0.05, 0.36, sd*0.85, 0.72, 0.85, 0x2a2b2d, FIN.metal);              // step
    }
    vBox(OP, 1.30, 0.42, 0.03, 0, 1.00, S.nose+0.004, 0xbfc2c4, FIN.chrome);             // grille
    for(let k=0;k<5;k++) vBox(OP, 1.22, 0.02, 0.03, 0, 0.84+k*0.08, S.nose+0.02, 0x2a2c2e, FIN.trim);
    vBox(OP, 2.24, 0.26, 0.20, 0, 0.62, S.nose+0.04, 0x2b2c2e, FIN.metal);               // bumper
    for(const sd of [-1,1]){ onSurf(OP, 0.30, 0.18, 0.03, new T.Vector3(sd*0.76,1.08,S.nose-0.06), new T.Vector3(sd*0.35,0,1), 0xdfe4e6, FIN.lens, 0);
      LAMPS.head.push({p:new T.Vector3(sd*0.76,1.08,S.nose+0.02), n:new T.Vector3(0,0,1)}); }
    // the box, its frame, the roll-up door and the lift's bumper
    liveryBox(LV, -1.24,1.24, 0.98,3.58, S.tail,0.24, TRAILER_LIV.rental, 0.29);
    vBox(OP, 2.50, 0.08, 4.70, 0, 0.94, (S.tail+0.24)/2, 0x8d9091, FIN.alloy);
    vBox(OP, 0.86, 0.24, 7.6, 0, 0.78, -0.30, BLK, FIN.metal);
    vBox(OP, 2.36, 0.16, 0.16, 0, 0.62, S.tail-0.02, 0x2b2c2e, FIN.metal);
    vBox(OP, 0.60, 0.40, 0.62, 0.86, 0.80, -0.90, 0x9a9da0, FIN.alloy);                  // the fuel tank
    mud(-3.26, 0.98); mud(-3.26, -0.98);
    for(const sd of [-1,1]){ LAMPS.tail.push({p:new T.Vector3(sd*1.05,1.12,S.tail-0.05), n:new T.Vector3(0,0,-1)});
      vBox(OP, 0.22, 0.30, 0.04, sd*1.05, 1.15, S.tail-0.02, 0x8a1410, FIN.lens);
      LAMPS.amber.push({p:new T.Vector3(sd*1.18,3.52,0.27), n:new T.Vector3(0,0,1)}); }
    vBox(OP, 0.32, 0.16, 0.012, 0, 0.82, S.tail-0.10, 0xf2f0e6, FIN.lens);
    return truckOut(OP, GL, LV, S, LAMPS, coarse);
  }
  /* ---- a long-nose tractor with a sleeper ---- */
  const H={nose:S.nose, tail:8.20, n:4.6, tum:0.08, arch:0.70, archY:S.wr-0.05, M:26,
    top:[[8.2,2.24],[9.2,2.18],[10.2,2.04],[10.7,1.86],[10.96,1.64]],
    bot:[[8.2,0.78],[10.96,0.70]], wid:[[8.2,1.18],[9.6,1.12],[10.96,0.98]],
    rN:[0.34,0.26,0.06], rT:[0.05,0.05,0.02]};
  const HB=loftBody(H, {axles:[S.axles[0]]}, paintHex, null, coarse); OP.push(...HB.OP);
  const C={nose:8.36, tail:3.90, n:9.0, tum:0.04, arch:0.01, archY:0, M:24,
    top:[[3.9,3.96],[4.3,4.04],[6.5,4.04],[7.05,3.92],[7.55,3.58],[7.9,3.30],[8.36,2.30]],
    bot:[[3.9,1.12],[8.36,1.12]], wid:[[3.9,1.24],[8.36,1.22]],
    rN:[0.10,0.08,0.03], rT:[0.16,0.14,0.04]};
  const CB=loftBody(C, {axles:[]}, paintHex, null, coarse); OP.push(...CB.OP);
  // two-piece windshield on the slope, door glass, a sleeper window, a visor
  CB.patch(GL, 7.96, 8.30, Math.PI/2-0.66, Math.PI/2+0.66, 0.012, 0x1a2329, FIN.lens, 5, 12);
  bar(OP, CB.pt(7.96,Math.PI/2), CB.pt(8.30,Math.PI/2), 0.05, 0.03, CB.nrm(8.1,Math.PI/2), BLK, FIN.trim);
  {
    const a0=CB.angAt(7.4,2.42), a1=CB.angAt(7.4,3.22), s0=CB.angAt(4.85,2.80), s1=CB.angAt(4.85,3.10);
    for(const [b0,b1] of [[a0,a1],[Math.PI-a1,Math.PI-a0]]) CB.patch(GL, 6.95, 7.86, b0, b1, 0.022, 0x1a2329, FIN.lens, 3, 4);
    for(const [b0,b1] of [[s0,s1],[Math.PI-s1,Math.PI-s0]]) CB.patch(GL, 4.55, 5.15, b0, b1, 0.012, 0x1a2329, FIN.lens, 2, 2);
  }
  for(const sd of [-1,1]){
    // west-coast mirrors on their arms, and a hood mirror
    vBox(OP, 0.06, 0.52, 0.20, sd*1.62, 2.85, 7.98, 0x1d1e20, FIN.trim);
    vBox(OP, 0.36, 0.03, 0.03, sd*1.44, 3.08, 7.98, CHR, FIN.chrome);
    vBox(OP, 0.36, 0.03, 0.03, sd*1.44, 2.62, 7.98, CHR, FIN.chrome);
    vBox(OP, 0.05, 0.14, 0.12, sd*1.20, 2.28, 10.30, 0x1d1e20, FIN.trim);
    // steps, a chrome air cleaner, the fuel tank on its straps
    for(const [y,zz] of [[0.78,7.45],[1.08,7.45]]) vBox(OP, 0.30, 0.04, 0.58, sd*1.22, y, zz, CHR, FIN.chrome);
    vCylY(OP, 0.17, 0.90, sd*1.30, 1.95, 8.50, CHR, FIN.chrome, 14);
    vCylZ(OP, 0.33, 1.65, sd*1.06, 0.98, 6.25, CHR, FIN.chrome, 20);
    for(const zz of [5.6, 6.9]) vCylZ(OP, 0.345, 0.06, sd*1.06, 0.98, zz, 0x2a2b2d, FIN.metal, 20);
    // the stacks, with heat shields and rain caps
    vCylY(OP, 0.085, 3.20, sd*1.13, 2.95, 5.55, CHR, FIN.chrome, 14);
    vCylY(OP, 0.10, 1.00, sd*1.13, 2.30, 5.55, 0x9da1a3, FIN.alloy, 14);
    vBox(OP, 0.20, 0.02, 0.22, sd*1.13, 4.58, 5.60, CHR, FIN.chrome, 0.5, 0, 0);
    // a cab fairing down the side, between the steps and the sleeper
    vBox(OP, 0.05, 0.78, 1.50, sd*1.25, 1.52, 5.05, paintHex, FIN.paint);
    // drive-axle mud flaps
    mud(3.02, sd*0.92);
  }
  vBox(OP, 2.12, 0.10, 0.36, 0, 3.36, 7.96, BLK, FIN.trim, -0.35, 0, 0);               // visor
  for(let k=0;k<5;k++){ const x=-0.6+k*0.3; vBox(OP, 0.10, 0.05, 0.06, x, 3.43, 7.84, 0xd08a1c, FIN.lens);
    LAMPS.amber.push({p:new T.Vector3(x,3.45,7.88), n:new T.Vector3(0,0.3,1)}); }
  // the grille, the bumper, the headlamps in the corners of the hood
  vBox(OP, 1.16, 1.06, 0.04, 0, 1.36, S.nose+0.006, CHR, FIN.chrome);
  for(let k=0;k<11;k++) vBox(OP, 0.025, 0.96, 0.05, -0.50+k*0.10, 1.36, S.nose+0.014, 0x24262a, FIN.trim);
  vBox(OP, 2.54, 0.42, 0.32, 0, 0.74, S.nose+0.04, CHR, FIN.chrome);
  for(const sd of [-1,1]){
    cornerLamp(HB, OP, sd, S.nose-0.36, S.nose-0.07, 1.62, 0.12, 0x2a2d30, FIN.trim, 0.003);
    LAMPS.head.push(cornerLamp(HB, OP, sd, S.nose-0.34, S.nose-0.09, 1.62, 0.095, 0xdfe4e6, FIN.lens, 0.007));
  }
  // the frame, the deck plate, the fifth wheel, the air and power lines
  vBox(OP, 0.92, 0.30, 7.4, 0, 1.00, 6.0, BLK, FIN.metal);
  vBox(OP, 2.10, 0.06, 0.90, 0, 1.18, 3.20, 0x3a3b3d, FIN.metal);
  vBox(OP, 1.60, 0.12, 1.30, 0, 1.22, 4.36, 0x202122, FIN.metal);
  [[0x2856c8,-0.12],[0xc42020,0.0],[0xd0b020,0.12]].forEach(([c,dx])=>{
    const tor=new T.TorusGeometry(0.26, 0.018, 6, 16, Math.PI*1.1);
    vAdd(OP, tor, dx, 2.00, 3.80, c, FIN.trim, 0, Math.PI/2, 0);
  });
  if(kind===7){
    /* a flatbed: a wood deck on steel, bundles of lumber in their wraps, the
       straps and winches that hold them down */
    const z0=S.tail, z1=3.60;
    vBox(OP, 2.58, 0.20, z1-z0, 0, 1.40, (z0+z1)/2, 0x3d3f42, FIN.metal);
    vBox(OP, 2.50, 0.05, z1-z0-0.06, 0, 1.525, (z0+z1)/2, 0x7a5a3a, FIN.trim);
    for(let k=0;k<14;k++) vBox(OP, 2.60, 0.06, 0.06, 0, 1.42, z0+0.5+k*1.0, 0x2c2d2f, FIN.metal);
    for(let k=0;k<4;k++){
      const zc=2.4-k*3.35;
      vBox(OP, 2.32, 0.92, 3.10, 0, 2.02, zc, 0xc8ab78, FIN.panel);
      vBox(OP, 2.34, 0.70, 3.12, 0, 2.12, zc, 0xf0efe8, FIN.panel);       // the wrap
      vBox(OP, 2.36, 0.04, 3.14, 0, 2.48, zc, 0x2c5e9e, FIN.panel);
      vBox(OP, 2.33, 0.20, 3.11, 0, 1.645, zc, 0xb89a68, FIN.panel);
      for(const dz of [-1.0,0.0,1.0]){
        vBox(OP, 2.40, 0.012, 0.05, 0, 2.50, zc+dz, 0xe2b31c, FIN.trim);
        for(const sd of [-1,1]){ vBox(OP, 0.012, 0.98, 0.05, sd*1.19, 2.00, zc+dz, 0xe2b31c, FIN.trim);
          vCylZ(OP, 0.045, 0.12, sd*1.24, 1.36, zc+dz, 0x2a2b2d, FIN.metal, 8); }
      }
    }
  }else{
    /* a 53-foot van: its painted box, rails proud of the sheet, the
       landing gear, the sliding tandem, the underride guard */
    const z0=S.tail, z1=3.60, y0=1.30, y1=4.06, hw=1.295;
    const row = kind===6 ? TRAILER_LIV.reefer : (livery===undefined ? 0 : livery);
    liveryBox(LV, -hw,hw, y0,y1, z0,z1, row, undefined, !!(opts && opts.open));
    for(const sd of [-1,1]){
      // rails and corner posts held a few millimetres off the box's top and underside
      vBox(OP, 0.03, 0.14, z1-z0-0.012, sd*(hw+0.01), y0+0.075, (z0+z1)/2, 0xb9bcbd, FIN.alloy);
      vBox(OP, 0.025, 0.08, z1-z0-0.012, sd*(hw+0.008), y1-0.045, (z0+z1)/2, 0xc9cbcc, FIN.alloy);
      for(const zz of [z0+0.03, z1-0.03]) vBox(OP, 0.05, y1-y0-0.032, 0.072, sd*(hw-0.01), (y0+y1)/2, zz, 0xb9bcbd, FIN.alloy);   // proud of both ends
      vBox(OP, 0.10, 0.92, 0.12, sd*0.86, 0.80, 1.40, 0x2b2c2e, FIN.metal);                 // landing gear legs
      vBox(OP, 0.24, 0.05, 0.30, sd*0.86, 0.36, 1.40, 0x2b2c2e, FIN.metal);
      if(row!==2) vBox(OP, 0.03, 0.78, 7.4, sd*(hw-0.06), 0.88, -3.9, 0x4a4d50, FIN.panel);  // side skirts
      vBox(OP, 0.10, 0.14, 3.2, sd*0.52, 1.14, -10.95, 0x2b2c2e, FIN.metal);                // the slider rails
      mud(-12.20, sd*0.92);
      LAMPS.tail.push({p:new T.Vector3(sd*1.05,1.18,z0-0.06), n:new T.Vector3(0,0,-1)});
      vBox(OP, 0.26, 0.12, 0.04, sd*1.05, 1.18, z0-0.04, 0x8a1410, FIN.lens);
      LAMPS.amber.push({p:new T.Vector3(sd*1.20,y1-0.06,z1+0.03), n:new T.Vector3(0,0,1)});
      for(let k=0;k<4;k++) vBox(OP, 0.03, 0.05, 0.10, sd*(hw+0.025), y0+0.07, z0+2+k*4.0, 0xd08a1c, FIN.lens);
    }
    vCylX(OP, 0.05, 1.9, 0, 0.95, 1.40, 0x2b2c2e, FIN.metal, 8);
    vBox(OP, 2.40, 0.16, 0.16, 0, 0.62, z0+0.25, 0x2b2c2e, FIN.metal);                      // ICC bar
    for(const sd of [-1,1]) vBox(OP, 0.12, 0.60, 0.12, sd*0.9, 0.92, z0+0.30, 0x2b2c2e, FIN.metal);
    vBox(OP, 0.32, 0.16, 0.012, 0.6, 1.02, z0-0.012, 0xf2f0e6, FIN.lens);
    if(kind===6){                                         // the refrigeration unit on the nose
      vBox(OP, 2.06, 1.50, 0.46, 0, 3.24, z1+0.24, 0xe8e8e4, FIN.panel);
      vBox(OP, 1.70, 1.00, 0.03, 0, 3.26, z1+0.48, 0x2c2f32, FIN.trim);
      for(let k=0;k<8;k++) vBox(OP, 1.64, 0.02, 0.03, 0, 2.84+k*0.12, z1+0.50, 0x4a4e52, FIN.trim);
      vBox(OP, 0.80, 0.18, 0.02, 0, 3.86, z1+0.48, 0x1d4f91, FIN.panel);
      vBox(OP, 0.60, 0.40, 0.50, 0.75, 0.94, z1-1.4, 0xd9d9d3, FIN.panel);                // its fuel tank
    }
  }
  if(!LAMPS.tail.length) for(const sd of [-1,1]){
    LAMPS.tail.push({p:new T.Vector3(sd*1.05,1.20,S.tail-0.06), n:new T.Vector3(0,0,-1)});
    vBox(OP, 0.26, 0.12, 0.04, sd*1.05, 1.20, S.tail-0.02, 0x8a1410, FIN.lens);
  }
  return truckOut(OP, GL, LV, S, LAMPS, coarse);
}
function vehicleParts(kind, paintHex, trailerHex, livery, coarse, opts){
  if(kind>=4) return truckParts(kind, paintHex, trailerHex, livery, coarse, opts);
  const p=carParts(kind, paintHex, coarse); p.LV=[]; return p;
}

/* ---- wheels ---------------------------------------------------------------
   A tyre turned on a lathe — bead, sidewall, shoulder, a tread with two
   grooves — and a rim in it: on a car a dark dish under five bright spokes,
   on a truck a painted steel disc with its hand holes and a chrome hub.
   Both faces are finished, so a wheel needs no mirroring for either side.
   The axle is along x. */
function lathe(pts, seg, color, fin){
  const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])), seg);
  return {geo:finUV(g,fin), matrix:new T.Matrix4(), color:new T.Color(color)};
}
function wheelGeo(r, w, truck){
  const L=[], h=w/2, ri=r*(truck?0.60:0.66);
  L.push(lathe([[ri,-h+0.012],[r*0.84,-h],[r*0.96,-h+0.015],[r,-h+0.05],[r,-0.03],[r-0.009,-0.022],[r-0.009,0.022],[r,0.03],
                [r,h-0.05],[r*0.96,h-0.015],[r*0.84,h],[ri,h-0.012]], 20, 0x1a1a1b, FIN.rubber));
  const face=(sd)=>{
    const f=h-0.012, pts=truck ? [[ri,f],[ri*0.92,f-0.01],[ri*0.70,f-0.045],[ri*0.34,f-0.05],[ri*0.30,f-0.02],[ri*0.16,f-0.01],[ri*0.10,f+0.03],[0,f+0.035]]
                               : [[ri,f],[ri*0.95,f-0.012],[ri*0.88,f-0.035],[ri*0.30,f-0.05],[ri*0.24,f-0.03],[ri*0.18,f-0.02],[0,f-0.02]];
    const P=pts.map(p=>[p[0], sd*p[1]]);
    if(sd<0) P.reverse();
    L.push(lathe(P, 16, truck?0xd4d2cb:0x2c2e30, truck?FIN.metal:FIN.alloy));
    if(truck){
      // hand holes, a chrome hub, ten studs
      for(let k=0;k<6;k++){ const a=k/6*Math.PI*2+0.3;
        L.push({geo:finUV(new T.CylinderGeometry(ri*0.12,ri*0.12,0.02,6,1,true),FIN.trim),
                matrix:new T.Matrix4().makeTranslation(Math.cos(a)*ri*0.58, sd*(f-0.042), Math.sin(a)*ri*0.58), color:new T.Color(0x151516)}); }
      L.push({geo:finUV(new T.CylinderGeometry(ri*0.26,ri*0.30,0.05,10),FIN.chrome), matrix:new T.Matrix4().makeTranslation(0, sd*(f-0.01), 0), color:new T.Color(0xd8dadb)});
    }else{
      for(let k=0;k<5;k++){
        const a=k/5*Math.PI*2;
        const sp=new T.Matrix4().makeRotationY(-a).multiply(new T.Matrix4().makeTranslation(ri*0.55, sd*(f-0.028), 0));
        L.push({geo:finUV(boxGeo(ri*0.80, 0.03, ri*0.17),FIN.alloy), matrix:sp, color:new T.Color(0xc5c8ca)});
      }
      L.push({geo:finUV(new T.CylinderGeometry(ri*0.20,ri*0.22,0.03,10),FIN.alloy), matrix:new T.Matrix4().makeTranslation(0, sd*(f-0.02), 0), color:new T.Color(0xb9bcbe)});
    }
  };
  face(1); face(-1);
  const g=mergeEntries(L);
  g.rotateZ(-Math.PI/2);                       // lathe axis (y) onto x
  return g;
}
function wheelFarGeo(r, w, truck){
  const L=[];
  L.push({geo:finUV(new T.CylinderGeometry(r,r,w,12,1),FIN.rubber), matrix:new T.Matrix4(), color:new T.Color(0x1a1a1b)});
  L.push({geo:finUV(new T.CylinderGeometry(r*0.62,r*0.62,w+0.01,10,1),truck?FIN.metal:FIN.alloy), matrix:new T.Matrix4(), color:new T.Color(truck?0xc8c6bf:0x8d9093)});
  const g=mergeEntries(L); g.rotateZ(-Math.PI/2); return g;
}
const _WHEEL_CACHE={};
function wheelGeoCached(r, w, truck){
  const k=r.toFixed(3)+":"+w.toFixed(3)+(truck?"T":"");
  return _WHEEL_CACHE[k] || (_WHEEL_CACHE[k]=wheelGeo(r, w, truck));
}

/* ---- rolling wheels for everything on the road ----------------------------
   Instanced, two levels of detail, one draw each: every traffic vehicle
   registers its wheel slots and the pool writes their matrices each frame
   from the vehicle's own transform and how far its wheels have turned. */
const WHEEL_POOL=(function(){
  const types={car:{r:0.36, w:0.23, truck:false}, truck:{r:0.52, w:0.28, truck:true}};
  const slots=[];
  let built=false;
  function register(v, S){
    const truck=S.wr>0.45, type=truck?"truck":"car", T0=types[type];
    v.wheelSlots=wheelSlots(S).map(([x,z])=>({x:x, z:z, y:S.wr, s:S.wr/T0.r, type:type}));
    v.spin=v.spin||0;
    slots.push(v);
  }
  function build(){
    for(const k in types){
      const t=types[k], n=slots.reduce((a,v)=>a+v.wheelSlots.filter(s=>s.type===k).length, 0);
      t.near=new T.InstancedMesh(wheelGeo(t.r, t.w, t.truck), VEH_MAT, Math.max(1,n));
      t.far =new T.InstancedMesh(wheelFarGeo(t.r, t.w, t.truck), VEH_MAT, Math.max(1,n));
      for(const m of [t.near, t.far]){ m.frustumCulled=false; m.castShadow=false; m.instanceMatrix.setUsage(T.DynamicDrawUsage); scene.add(m); }
    }
    built=true;
  }
  const _m=new T.Matrix4(), _r=new T.Matrix4(), _s=new T.Matrix4();
  // only the wheels that are drawn are written, packed from the front; the
  // instance count is cut to them, so hidden ones cost nothing
  function update(cam){
    if(!built) build();
    const nN={car:0, truck:0}, nF={car:0, truck:0};
    for(const v of slots){
      const g=v.g;
      const dx=g.position.x-cam.x, dz=g.position.z-cam.z, d2=dx*dx+dz*dz;
      const cull=Math.min(900, DRAW_LEVELS[GFX.draw].cull);
      if(v.lod){ const bodyNear=d2<130*130; v.lod.near.visible=bodyNear; v.lod.far.visible=!bodyNear && d2<cull*cull; }
      if(d2>cull*cull || !g.visible) continue;
      const near=d2<110*110;
      g.updateMatrixWorld();
      _r.makeRotationX(v.spin||0);
      for(const s of v.wheelSlots){
        const t=types[s.type];
        _s.makeScale(s.s,s.s,s.s);
        _m.makeTranslation(s.x, s.y, s.z).premultiply(g.matrixWorld).multiply(_r).multiply(_s);
        if(near) t.near.setMatrixAt(nN[s.type]++, _m); else t.far.setMatrixAt(nF[s.type]++, _m);
      }
    }
    for(const k in types){ const t=types[k];
      t.near.count=nN[k]; t.far.count=nF[k];
      t.near.instanceMatrix.needsUpdate=true; t.far.instanceMatrix.needsUpdate=true; }
  }
  return {register:register, update:update, slots:slots};
})();
