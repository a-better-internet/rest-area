"use strict";
/* REST AREA · 15-bake.js
   materials for the glowing buckets, then plant the woods, merge everything
   and build the collider grid
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   15 · GLOW, THEN BAKE
   ---------------------------------------------------------------------- */
// circ: which of the rest area's circuits it is on ("bldg" or "site"), so a
// power cut can put it out (16b-weather); battery-backed ("always") are on none
function glowMat(opts, kind, circ){
  const m=new T.MeshStandardMaterial(Object.assign({roughness:0.5, metalness:0.0}, opts));
  GLOW.push({m:m, base:m.emissive?m.emissive.clone():new T.Color(0), kind:kind, baseInt:m.emissiveIntensity||1,
             circ:circ!==undefined ? circ : (kind==="always" ? null : "bldg")});
  return m;
}
/* A SURFACE THAT IS A LAMP: near-black diffuse, so the point light a few
   centimetres away cannot add its own light on top of the emissive and
   push the face past white. */
function emitMat(emissive, intensity, kind, circ){
  return glowMat({color:0x241f1a, emissive:emissive, emissiveIntensity:intensity,
                  roughness:0.9, metalness:0.0}, kind, circ);
}
function basicGlowMat(color, kind, blend){
  const m=new T.MeshBasicMaterial({color:color, transparent:true, opacity:0.0, toneMapped:false,
    depthWrite:false, blending:blend||T.NormalBlending});
  GLOW.push({m:m, kind:kind, basic:true, circ:kind==="always"?null:"bldg"});
  return m;
}
bucketOf("glass",  ()=>envOut(new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.30,
                          roughness:0.05, metalness:0.35, side:T.DoubleSide, depthWrite:false}), 0.8));
// the dark tinted glass of the big gable window: from outside, by day,
// it reads as a dark reflective sheet with the sky in it, not as a hole
bucketOf("tint",   ()=>envOut(new T.MeshStandardMaterial({color:0xffffff, transparent:true, opacity:0.55,
                          roughness:0.04, metalness:0.50, side:T.DoubleSide, depthWrite:false}), 0.9));
bucketOf("mirror", ()=>new T.MeshStandardMaterial({color:0xffffff, metalness:0.62, roughness:0.06,
                          emissive:0x303a40, emissiveIntensity:0.35}));
bucketOf("ceilfix",()=>glowMat({color:0x9c968c, emissive:0xf4f2ea, emissiveIntensity:0.30}, "indoor"));
bucketOf("tube",   ()=>emitMat(0xeef2f0, 0.85, "indoor"));
bucketOf("vendglow",()=>glowMat({color:0xffffff, emissive:0xdfe9ff, emissiveIntensity:0.30}, "indoor"));
bucketOf("cctv", ()=>{
  const c=cvs(256,160), x=c.getContext("2d");
  const view=(ox,oy,draw)=>{ x.save(); x.beginPath(); x.rect(ox,oy,127,79); x.clip(); x.translate(ox,oy); draw(); x.restore(); };
  x.fillStyle="#0d0f10"; x.fillRect(0,0,256,160);
  view(0,0,()=>{ x.fillStyle="#6c7276"; x.fillRect(0,0,128,80); x.fillStyle="#9aa0a2"; x.fillRect(0,50,128,30);
    for(let i=0;i<6;i++){ x.fillStyle=["#3a3c40","#7a7e82","#2c2e30"][i%3]; x.fillRect(8+i*20,40,15,9); } });           // the lot
  view(128,0,()=>{ x.fillStyle="#8a6a58"; x.fillRect(0,0,128,80); x.fillStyle="#b5654a"; x.fillRect(0,45,128,35);
    x.fillStyle="#2a2a2c"; x.fillRect(90,20,16,40); x.fillRect(18,26,30,30); });                                         // the lobby
  view(0,80,()=>{ x.fillStyle="#7f8486"; x.fillRect(0,0,128,80); x.fillStyle="#5a5e60"; x.fillRect(0,30,128,14);
    x.fillStyle="#d8d8d4"; x.fillRect(30,28,26,10); });                                                                 // the ramp
  view(128,80,()=>{ x.fillStyle="#5d6a5a"; x.fillRect(0,0,128,80); x.fillStyle="#8a8e88"; x.fillRect(30,30,60,40); }); // the sub
  x.fillStyle="#e8e8e0"; x.font="9px monospace"; ["CAM 1 LOT","CAM 2 LOBBY","CAM 3 RAMP","CAM 4 SUBSTA"].forEach((s,i)=>x.fillText(s,8+(i%2)*128,14+((i/2)|0)*80));
  x.fillStyle="#0d0f10"; x.fillRect(127,0,2,160); x.fillRect(0,79,256,2);
  const tex=setSRGB(new T.CanvasTexture(c));
  return glowMat({color:0x111111, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:0.55}, "indoor");
});
bucketOf("winglow",()=>glowMat({color:0xffffff, emissive:0xffe6b8, emissiveIntensity:0.18}, "warm"));
bucketOf("exitsign",()=>emitMat(0xff2a1a, 0.9, "always"));
bucketOf("ledgreen",()=>emitMat(0x3cff6a, 0.9, "always"));
bucketOf("ledamber",()=>emitMat(0xffaa22, 0.9, "always"));

// the woods are planted; now they become meshes, and their trunks colliders
FOREST.finish();
/* SOFT EDGES. Paving laid on the ground stops at a hard line where the grass starts. So before the bake every paved surface is
   looked at as it was laid (its own triangles, the ones that face up), and along each edge that is its outside (an edge only one of
   its triangles has, with no more paving, no room and no water just past it) a strip is laid: a few centimetres in over the paving's
   edge and out over the grass, grit and worn ground in a ragged band that fades into the lawn. A road's verge is widest, a lot's and
   a drive's less, gravel's least (it spills anyway). One bucket, tiled with the rest, transparent, over the ground's own offset. */
const VERGES={};
(function verges(){
  const SRC={road:[1.1, "#ffffff"], asphalt:[0.95, "#ffffff"], lotpave:[0.8, "#ffffff"], wp_road:[0.8, "#ffffff"], rn_drive:[0.7, "#ffffff"],
             gravelbed:[0.6, "#f2eee6"], wp_gravel:[0.6, "#f2eee6"]};
  const tris=[], edges=[], CELL=4, H=new Map(), P=new T.Vector3(), Q=new T.Vector3(), R=new T.Vector3();
  const key=(x, z)=>Math.floor(x/CELL)+":"+Math.floor(z/CELL);
  for(const name in SRC){ const b=BUCKETS.get(name); if(!b) continue;
    for(const e of b.entries){ const g=e.geo, pos=g.attributes.position, ix=g.index ? g.index.array : null, n=ix ? ix.length : pos.count;
      if(n>60000) continue;
      const vk=new Map(), ek=new Map(), wv=[];
      const vid=(i)=>{ P.fromBufferAttribute(pos, i).applyMatrix4(e.matrix); const k=Math.round(P.x*100)+","+Math.round(P.z*100); let id=vk.get(k);
        if(id===undefined){ id=wv.length; vk.set(k, id); wv.push(P.clone()); } return id; };
      for(let t=0;t<n;t+=3){ const i0=ix ? ix[t] : t, i1=ix ? ix[t+1] : t+1, i2=ix ? ix[t+2] : t+2, a=vid(i0), b2=vid(i1), c=vid(i2);
        if(a===b2 || b2===c || a===c) continue;
        const A=wv[a], B=wv[b2], C2=wv[c]; Q.subVectors(B, A); R.subVectors(C2, A); const ny=Q.z*R.x-Q.x*R.z, nl=Q.clone().cross(R).length();
        if(nl<1e-6 || Math.abs(ny)/nl<0.8) continue;                                     // (up-facing only: not a curb's side)
        const tri=[A, B, C2]; tris.push(tri);
        const x0=Math.min(A.x, B.x, C2.x), x1=Math.max(A.x, B.x, C2.x), z0=Math.min(A.z, B.z, C2.z), z1=Math.max(A.z, B.z, C2.z);
        for(let gx=Math.floor(x0/CELL); gx<=Math.floor(x1/CELL); gx++) for(let gz=Math.floor(z0/CELL); gz<=Math.floor(z1/CELL); gz++){ const k=gx+":"+gz; let L=H.get(k); if(!L) H.set(k, L=[]); L.push(tri); }
        for(const [u, v, w] of [[a, b2, c],[b2, c, a],[c, a, b2]]){ const k=u<v ? u+"_"+v : v+"_"+u, o=ek.get(k); if(o) o.n++; else ek.set(k, {u:u, v:v, w:w, n:1}); } }
      for(const E of ek.values()) if(E.n===1) edges.push({A:wv[E.u], B:wv[E.v], W:wv[E.w], src:name}); } }
  const inTri=(x, z, t)=>{ const [a, b, c]=t, d1=(x-b.x)*(a.z-b.z)-(a.x-b.x)*(z-b.z), d2=(x-c.x)*(b.z-c.z)-(b.x-c.x)*(z-c.z), d3=(x-a.x)*(c.z-a.z)-(c.x-a.x)*(z-a.z);
    return !((d1<0 || d2<0 || d3<0) && (d1>0 || d2>0 || d3>0)); };
  // (paving the ground has grown over, a shoulder laid under the grass, is not paving you can see: it does not count)
  const paved=(x, z, y)=>{ const L=H.get(key(x, z)); if(!L) return false; const gy=Terrain.groundAt(x, z);
    for(const t of L) if(Math.abs(t[0].y-y)<1.2 && inTri(x, z, t) && (t[0].y+t[1].y+t[2].y)/3>gy-0.02) return true; return false; };
  const indoor=(x, z, y)=>{ for(const Z of ZONES) if(Z.indoor && x>Z.x0 && x<Z.x1 && z>Z.z0 && z<Z.z1 && y>Z.y0-0.5 && y<Z.y1) return true; return false; };
  const water=(x, z)=>typeof EAST!=="undefined" && Terrain.lakeSD && Terrain.lakeSD(x, z)<0.5;
  // the band: ragged grit, densest just past the edge, gone by its far side; its alpha in the texture, its colour the bucket's
  const tex=(()=>{ const W=512, Hh=128, c=cvs(W, Hh), x=c.getContext("2d"), r=_trng(707);
    // worn ground in soft patches: dirt and trodden grass, thickest at the paving's edge and breaking up into the lawn (tiled along u)
    for(let i=0;i<900;i++){ const v=Math.pow(r(), 1.7), px=r()*W, py=(0.1+v*0.85)*Hh, rad=(6+r()*22)*(1-v*0.5), a=(0.22+0.3*r())*(1-v*0.7);
      const col=r()<0.55 ? [92, 80, 58] : r()<0.5 ? [104, 100, 70] : [78, 74, 62];
      for(const dx of [-W, 0, W]){ const g=x.createRadialGradient(px+dx, py, 0, px+dx, py, rad); g.addColorStop(0, "rgba("+col+","+a.toFixed(2)+")"); g.addColorStop(1, "rgba("+col+",0)");
        x.fillStyle=g; x.fillRect(px+dx-rad, py-rad, rad*2, rad*2); } }
    for(let i=0;i<5000;i++){ const v=Math.pow(r(), 1.4); x.fillStyle="rgba("+(r()<0.5 ? "70,64,52" : "150,142,120")+","+(0.35*(1-v)).toFixed(2)+")"; x.fillRect(r()*W, (0.08+v*0.8)*Hh, 1+r()*2, 1+r()*2); }
    // and the whole of it faded in over the paving's last few centimetres and out toward the grass
    x.globalCompositeOperation="destination-in"; const m=x.createLinearGradient(0, 0, 0, Hh);
    m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(0.1, "rgba(0,0,0,0.7)"); m.addColorStop(0.3, "rgba(0,0,0,0.6)"); m.addColorStop(0.7, "rgba(0,0,0,0.25)"); m.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle=m; x.fillRect(0, 0, W, Hh); x.globalCompositeOperation="source-over";
    // (its rows as drawn, top down: v 0 is the paving's side, so the canvas is not turned over)
    const t=setSRGB(new T.CanvasTexture(c)); t.flipY=false; t.wrapS=T.RepeatWrapping; t.wrapT=T.ClampToEdgeWrapping; t.anisotropy=4; return t; })();
  bucketOf("verge", ()=>new T.MeshStandardMaterial({map:tex, transparent:true, depthWrite:false, roughness:1.0, polygonOffset:true, polygonOffsetFactor:-1.5, polygonOffsetUnits:-3}));
  const tiles=new Map(); let kept=0;
  for(const E of edges){ const A=E.A, B=E.B, ex=B.x-A.x, ez=B.z-A.z, L=Math.hypot(ex, ez); if(L<0.04) continue;
    let ox=ez/L, oz=-ex/L; const mx=(A.x+B.x)/2, mz=(A.z+B.z)/2; if((E.W.x-mx)*ox+(E.W.z-mz)*oz>0){ ox=-ox; oz=-oz; }      // (out: away from its own triangle)
    const my=(A.y+B.y)/2, Wd=SRC[E.src][0];
    // (not where more paving, a room, or the water is just past it; not off a deck or a bridge high over the ground)
    if(paved(mx+ox*0.3, mz+oz*0.3, my) || paved(mx+ox*0.75, mz+oz*0.75, my) || indoor(mx+ox*0.4, mz+oz*0.4, my) || water(mx+ox*0.6, mz+oz*0.6)) continue;
    const gA=Terrain.groundAt(A.x, A.z), gB=Terrain.groundAt(B.x, B.z); if(A.y-gA>0.5 && B.y-gB>0.5) continue; if(A.y-gA<-0.05 && B.y-gB<-0.05) continue;
    // four rows across it: just inside the edge, the edge, part way out, all the way out; the outer ones on the ground
    // (where the ground stands over the paving's own edge, the edge you see is where the grass cuts it: start the strip from there)
    let din=0; for(let d=0; d<=1.4; d+=0.1){ const qx=mx-ox*d, qz=mz-oz*d; if(Terrain.groundAt(qx, qz)<=my-0.01){ din=d; break; } din=d; }
    const rows=[[-0.06-din, 0],[-din, 0.1],[Wd*0.45, 0.5],[Wd, 1]], pos=[], uv=[], col=new T.Color(SRC[E.src][1]), cols=[];
    for(const [d, v] of rows) for(const p of [A, B]){ const x=p.x+ox*d, z=p.z+oz*d, gy=Terrain.groundAt(x, z), on=gy+0.03, y=d<=0.001 ? Math.max(p.y+0.006, on) : d<Wd*0.9 ? Math.max(on, lerp(p.y+0.006, on, 0.65)) : on;
      pos.push(x, y, z); uv.push((p===A ? 0 : L)/6+(A.x*0.37+A.z*0.11)%1, v); cols.push(col.r, col.g, col.b); }
    const k=Math.floor(mx/96)+":"+Math.floor(mz/96); let T2=tiles.get(k); if(!T2) tiles.set(k, T2={pos:[], uv:[], col:[], idx:[]});
    const b0=T2.pos.length/3; T2.pos.push(...pos); T2.uv.push(...uv); T2.col.push(...cols);
    for(let r=0;r<3;r++){ const a=b0+r*2, b=a+1, c=a+2, d=a+3; T2.idx.push(a, c, b, b, c, d); }
    kept++; }
  for(const T2 of tiles.values()){ const g=new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(T2.pos, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(T2.uv, 2));
    g.setAttribute("color", new T.Float32BufferAttribute(T2.col, 3)); g.setIndex(T2.idx); g.computeVertexNormals();
    // (face them up whichever way the edge ran)
    const nr=g.attributes.normal; let up=0; for(let i=0;i<nr.count;i++) up+=nr.getY(i);
    if(up<0){ const ix=g.index.array; for(let i=0;i<ix.length;i+=3){ const t=ix[i+1]; ix[i+1]=ix[i+2]; ix[i+2]=t; } g.computeVertexNormals(); }
    g.computeBoundingBox(); const c=new T.Vector3(); g.boundingBox.getCenter(c); g.translate(-c.x, -c.y, -c.z);
    push("verge", g, c.x, c.y, c.z, 0, null); }
  VERGES.kept=kept; VERGES.edges=edges.length;
})();
const BAKED=bakeBuckets(scene);
buildColGrid();                     // everything solid is in place by now
if(typeof _igBuild==="function") _igBuild();   // the building's floor grid for the people inside (14b), now, not at the first visitor
if(typeof _ogBuild==="function") _ogBuild();   // and the custodian's grid over the lawns and the yard (14h)
