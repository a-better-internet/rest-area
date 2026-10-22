"use strict";
/* REST AREA · 14z-grass.js
   grass that stands up off the ground: tufts on the lawns, the verges and
   round the farm
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14z · GRASS
   The terrain's own colour and grain (04) read as grass from a distance;
   close to, a lawn is blades standing up. So tufts are scattered over the
   grass: three crossed cards of blades each, a little taller on the
   verges and round the farm where the mower goes less often. They are
   placed last of everything that stands on the ground (they need every
   collider, walk and slab already laid, 06), on a jittered grid, and only
   where it is grass: in the site's clearing or along the interstate's
   verges, never on paving, a walk, a floor, a field's crop or a gravel
   yard, nor under anything standing. They are drawn in 48 m chunks, each
   shown only while the camera is within a hundred and ten metres. The
   blades are drawn in light and shade only and take their colour from
   the ground's own at the spot (04's tint), so a tuft is the lawn it
   stands in, stood up. Every card is there twice, back to back, with its
   normal up, so both faces light the way the ground does.
   ---------------------------------------------------------------------- */
const GRASS={chunks:[], far:110};
(function grass(){
  const r=_trng(4040);
  // the blades: a card of them, alpha-cut, light and shade only (the colour is the ground's), darker at the root
  const tex=signTex(128,128,(c,W,H)=>{ c.clearRect(0,0,W,H);
    for(let i=0;i<30;i++){
      const x0=8+r()*(W-16), h=H*(0.45+r()*0.52), lean=(r()-0.5)*W*0.32, w=2.0+r()*2.4;
      const g=c.createLinearGradient(0,H,0,H-h), l=0.78+r()*0.2, L=(v)=>"rgb("+((v*255)|0)+","+((v*255)|0)+","+((v*244)|0)+")";
      g.addColorStop(0,L(l*0.62)); g.addColorStop(0.4,L(l*0.88)); g.addColorStop(1, L(Math.min(1,l*1.08)));
      c.fillStyle=g; c.beginPath(); c.moveTo(x0-w,H); c.quadraticCurveTo(x0+lean*0.3, H-h*0.55, x0+lean, H-h);
      c.quadraticCurveTo(x0+lean*0.3+w*0.4, H-h*0.55, x0+w,H); c.closePath(); c.fill(); } });
  tex.wrapS=tex.wrapT=T.ClampToEdgeWrapping;
  const mat=new T.MeshStandardMaterial({map:tex, alphaTest:0.42, side:T.FrontSide, roughness:1.0, metalness:0});
  // three crossed cards, each back to back with its twin, their normals all up so they light like the ground
  const card=(a)=>{ const g=new T.PlaneGeometry(0.46, 0.30); g.translate(0, 0.15, 0); g.rotateY(a); return g; };
  const parts=[card(0), card(Math.PI/3), card(2*Math.PI/3), card(Math.PI), card(Math.PI*4/3), card(Math.PI*5/3)];
  const P=[], U=[], I=[]; let base=0;
  for(const g of parts){ const p=g.attributes.position, u=g.attributes.uv, ix=g.index;
    for(let k=0;k<p.count;k++){ P.push(p.getX(k),p.getY(k),p.getZ(k)); U.push(u.getX(k),u.getY(k)); }
    for(let k=0;k<ix.count;k++) I.push(ix.getX(k)+base); base+=p.count; }
  const geo=new T.BufferGeometry();
  geo.setAttribute("position", new T.Float32BufferAttribute(P,3)); geo.setAttribute("uv", new T.Float32BufferAttribute(U,2));
  geo.setAttribute("normal", new T.Float32BufferAttribute(P.map((v,k)=>k%3===1?1:0),3)); geo.setIndex(I);

  // where it can't grow: anything standing on the ground, a slab or walk or floor, a field, a gravel yard
  const B={x0:-272, x1:448, z0:-1330, z1:568}, nx=Math.ceil(B.x1-B.x0), nz=Math.ceil(B.z1-B.z0);
  const blk=new Uint8Array(nx*nz);
  const mark=(x0,x1,z0,z1)=>{ const i0=Math.max(0,Math.floor(x0-B.x0)), i1=Math.min(nx-1,Math.floor(x1-B.x0)), j0=Math.max(0,Math.floor(z0-B.z0)), j1=Math.min(nz-1,Math.floor(z1-B.z0));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++) blk[j*nx+i]=1; };
  for(const c of COL){ if(c.x1-c.x0>60 || c.z1-c.z0>60) continue; const gy=Terrain.groundAt((c.x0+c.x1)/2, (c.z0+c.z1)/2); if(c.y0<gy+0.4 && c.y1>gy) mark(c.x0-0.2, c.x1+0.2, c.z0-0.2, c.z1+0.2); }
  for(const s of SURF){ if(!s.flat || s.x1-s.x0>200 || s.z1-s.z0>200) continue; mark(s.x0-0.2, s.x1+0.2, s.z0-0.2, s.z1+0.2); }
  for(const F of EDIN.fields) mark(F.x0-0.5, F.x1+0.5, F.z0-0.5, F.z1+0.5);
  // and whatever is laid flat on the ground: walks, beds, slabs, gravel, lots, the asphalt (each triangle, rasterised)
  for(const name of ["walkflat","bed","mulchbed","gravelbed","concrete","padflat","lotpave","asphalt","soot"]){
    const b=BUCKETS.get(name); if(!b) continue;
    const va=new T.Vector3(), vb=new T.Vector3(), vc=new T.Vector3();
    for(const e of b.entries){ const g=e.geo, Pp=g.attributes.position, Ix=g.index, n=Ix?Ix.count:Pp.count;
      for(let t=0;t<n;t+=3){
        va.fromBufferAttribute(Pp, Ix?Ix.getX(t):t).applyMatrix4(e.matrix); vb.fromBufferAttribute(Pp, Ix?Ix.getX(t+1):t+1).applyMatrix4(e.matrix);
        vc.fromBufferAttribute(Pp, Ix?Ix.getX(t+2):t+2).applyMatrix4(e.matrix);
        const x0=Math.min(va.x,vb.x,vc.x)-0.6, x1=Math.max(va.x,vb.x,vc.x)+0.6, z0=Math.min(va.z,vb.z,vc.z)-0.6, z1=Math.max(va.z,vb.z,vc.z)+0.6;
        if(x1<B.x0 || x0>B.x1 || z1<B.z0 || z0>B.z1 || (x1-x0)*(z1-z0)>40000) continue;
        const ed=(ax,az,bx,bz,px,pz)=>{ const L=Math.hypot(bx-ax,bz-az)||1; return ((bx-ax)*(pz-az)-(bz-az)*(px-ax))/L; };
        const sgn=Math.sign(ed(va.x,va.z,vb.x,vb.z,vc.x,vc.z))||1;
        for(let z=Math.floor(z0); z<=z1; z++) for(let x=Math.floor(x0); x<=x1; x++){ const px=x+0.5, pz=z+0.5;
          if(sgn*ed(va.x,va.z,vb.x,vb.z,px,pz)>-0.6 && sgn*ed(vb.x,vb.z,vc.x,vc.z,px,pz)>-0.6 && sgn*ed(vc.x,vc.z,va.x,va.z,px,pz)>-0.6) mark(px,px,pz,pz); } } } }
  const yards=[GARAGE.yard, WWTP, {x0:SITE.sub.x0-3, x1:SITE.sub.x1+3, z0:SITE.sub.z0-3, z1:SITE.sub.z1+3}, EDIN.station,
               {x0:136, x1:204, z0:EDIN.z+42, z1:EDIN.z+76}, {x0:147.5, x1:152.5, z0:EDIN.z+EDIN.hw, z1:EDIN.z+46}, {x0:118.5, x1:148.6, z0:EDIN.z+24.2, z1:EDIN.z+27.8}];
  for(const y of yards) mark(y.x0, y.x1, y.z0, y.z1);
  const free=(x,z)=>{ const i=Math.floor(x-B.x0), j=Math.floor(z-B.z0); return i>=0 && j>=0 && i<nx && j<nz && !blk[j*nx+i]; };
  // where it is grass: the site's clearing, the verges, the farm's lawns and the fuel stop's edges
  const E=EDIN, farm=E.farm;
  const grassy=(x,z)=>{
    if(pavedY(x,z)!==null || !free(x,z)) return 0;
    if(x>farm.x0 && x<farm.x1 && z>farm.z0 && z<farm.z1) return 1.4;
    if(x>-70 && x<46 && z>E.z-80 && z<E.z-E.hw-0.6) return 1.3;
    if(Terrain.siteDist(x,z)>0.5) return 0;                     // (signed: below nought is inside the clearing)
    const hd=Math.min(Math.abs(x-HWY.nb), Math.abs(x-HWY.sb));
    if(hd<7.6) return 0;                                         // (the gravel at the pavement's edge)
    return hd<22 ? 1.25 : 1; };
  // a jittered grid, chunked
  const S=1.2, CH=48, byChunk=new Map(), tc=new T.Color();
  const scan=(x0,x1,z0,z1)=>{ for(let z=z0; z<z1; z+=S) for(let x=x0; x<x1; x+=S){
    const px=x+r()*S, pz=z+r()*S, k=grassy(px,pz); if(!k) continue;
    const key=Math.floor(px/CH)+","+Math.floor(pz/CH); let L=byChunk.get(key); if(!L){ L=[]; byChunk.set(key,L); }
    const gy=Terrain.groundAt(px,pz); TERRAIN_TINT(px, pz, gy, 0, tc);
    // (a mown lawn short; the verges and the farm let go longer)
    L.push([px, gy-0.01, pz, r()*6.28, (k>1 ? 0.75+r()*0.55 : 0.45+r()*0.35)*k, r(), tc.r, tc.g, tc.b]); } };
  scan(-256, 448, -336, 344);                       // the near ground: the site, its lawns, the verges by it
  scan(-272, -48, -1328, -336); scan(-272, -48, 344, 568);   // the verges north and south
  scan(farm.x0, farm.x1, farm.z0, farm.z1);         // the farm
  scan(-70, 46, E.z-80, E.z-E.hw);                  // round the fuel stop
  const m4=new T.Matrix4(), q=new T.Quaternion(), sc=new T.Vector3(), col=new T.Color();
  for(const [key, L] of byChunk){
    const g=geo.clone(), im=new T.InstancedMesh(g, mat, L.length);
    let cx=0, cz=0, cy=0; for(const t of L){ cx+=t[0]; cy+=t[1]; cz+=t[2]; } cx/=L.length; cy/=L.length; cz/=L.length;
    L.forEach((t,i)=>{ q.setFromAxisAngle(_UPV, t[3]); sc.set(t[4]*(0.8+t[5]*0.4), t[4], t[4]*(0.8+t[5]*0.4));
      m4.compose(V3(t[0],t[1],t[2]), q, sc); im.setMatrixAt(i, m4);
      // the ground's colour where it stands (the blades' map is about the ground's own mean), a little either way
      const v=(0.92+t[5]*0.16)*0.88; col.setRGB(t[6]*v*1.02, t[7]*v, t[8]*v*0.96); if(t[5]>0.9) col.setRGB(t[6]*1.25, t[7]*1.12, t[8]*0.85); im.setColorAt(i, col); });
    g.boundingSphere=new T.Sphere(V3(cx,cy,cz), CH*0.75); g.boundingBox=null;
    im.receiveShadow=true; im.castShadow=false; im.visible=false; im.name="grass";
    scene.add(im); GRASS.chunks.push({m:im, x:cx, z:cz});
  }
  GRASS.count=[...byChunk.values()].reduce((a,L)=>a+L.length, 0);
})();
// only the chunks near enough to see a blade in
function updateGrass(cam){
  const F=GRASS.far*GRASS.far;
  for(const c of GRASS.chunks){ const dx=c.x-cam.x, dz=c.z-cam.z; c.m.visible=dx*dx+dz*dz<F; }
}
