/* REST AREA · tools/zfight.js
   Lists faces that lie in one plane and overlap: what the depth buffer
   cannot sort, and draws as flicker. Loads the world with ?zdebug, which
   keeps every baked box's final matrix (after 01's growth), takes every
   triangle in a box of the world, and reports the pairs within `near`
   metres of one plane that share more than `amin` square metres, grouped
   by bucket. A pair is listed only if its shared patch can be seen: from
   its middle, a ray out along the face's normal meets nothing solid within
   2.5 cm (a face buried in a wall or lying on a floor is counted, not
   listed). ALL=1 lists the buried ones too.
     node tools/zfight.js '{"x0":-10,"x1":17,"z0":-21,"z1":21,"y0":-0.6,"y1":10,"near":0.0011}' [examples]
   or a list of such boxes, each with a "name", to sweep several places in one load.  */
const path=require("path"); const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname,"..");
// one box, or a list of them (each may carry a "name"), all checked in one load of the world
const arg=JSON.parse(process.argv[2]||'{"x0":-10,"x1":10,"z0":-16,"z1":16,"y0":-0.6,"y1":10}');
const boxes=Array.isArray(arg) ? arg : [arg];
(async()=>{
  const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const p=await b.newPage({viewport:{width:320,height:200}});
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")}));
  await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html")+"?zdebug", {timeout:240000});
  await p.waitForFunction(()=>window.REST,null,{timeout:180000});
  for(const box of boxes){
  if(box.name) console.log("\n== "+box.name);
  if(process.env.ALL) box.all=true;
  const res=await p.evaluate((box)=>{
    const T=THREE, srcs=[];
    for(const e of (window.ZDBG||[])) srcs.push({name:"bk:"+e.bucket, geo:e.geo, m:e.matrix, col:e.color===undefined||e.color===null ? null : new T.Color(e.color).getHexString()});
    REST.scene.traverse(o=>{
      if(!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible) return;
      if(o.name && o.name.startsWith("bucket:")) return;
      if(o.userData && o.userData.zdbg) return;                     // (a detail mesh whose pieces ZDBG holds one by one)
      for(let q=o.parent; q; q=q.parent) if(!q.visible) return;
      o.updateMatrixWorld(true);
      srcs.push({name:"mesh:"+(o.name||o.material.type)+(o.parent&&o.parent.name?"<"+o.parent.name:""), geo:o.geometry, m:o.matrixWorld});
    });
    const tris=[]; const a=new T.Vector3(), bb=new T.Vector3(), c=new T.Vector3(), n=new T.Vector3(), e1=new T.Vector3(), e2=new T.Vector3();
    srcs.forEach((s,si)=>{
      const pos=s.geo.attributes.position, idx=s.geo.index; if(!pos) return;
      const cnt=idx?idx.count:pos.count;
      for(let k=0;k<cnt;k+=3){
        const i0=idx?idx.getX(k):k, i1=idx?idx.getX(k+1):k+1, i2=idx?idx.getX(k+2):k+2;
        a.fromBufferAttribute(pos,i0).applyMatrix4(s.m); bb.fromBufferAttribute(pos,i1).applyMatrix4(s.m); c.fromBufferAttribute(pos,i2).applyMatrix4(s.m);
        const cx=(a.x+bb.x+c.x)/3, cy=(a.y+bb.y+c.y)/3, cz=(a.z+bb.z+c.z)/3;
        if(cx<box.x0||cx>box.x1||cz<box.z0||cz>box.z1||cy<box.y0||cy>box.y1) continue;
        e1.subVectors(bb,a); e2.subVectors(c,a); n.crossVectors(e1,e2); const ar=n.length()/2; if(ar<1e-6) continue; n.normalize();
        tris.push({s:si, n:[n.x,n.y,n.z], d:n.dot(a), p:[a.x,a.y,a.z,bb.x,bb.y,bb.z,c.x,c.y,c.z], c:[cx,cy,cz]});
      }
    });
    // group by quantised plane; test overlap in 2D
    const key=(t,dd)=>Math.round(t.n[0]*50)+","+Math.round(t.n[1]*50)+","+Math.round(t.n[2]*50)+","+(Math.round(t.d/0.004)+dd);
    const G=new Map();
    tris.forEach((t,i)=>{ const k=key(t,0); if(!G.has(k)) G.set(k,[]); G.get(k).push(i); });
    const proj=(t)=>{ const ax=Math.abs(t.n[0]), ay=Math.abs(t.n[1]), az=Math.abs(t.n[2]);
      const [u,v]= ax>=ay&&ax>=az ? [1,2] : ay>=az ? [0,2] : [0,1];
      return [[t.p[u],t.p[v]],[t.p[3+u],t.p[3+v]],[t.p[6+u],t.p[6+v]]]; };
    // the area two coplanar triangles share: clip one by the other
    const clip=(poly, a, b)=>{ const out=[]; const side=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      for(let i=0;i<poly.length;i++){ const P=poly[i], Q=poly[(i+1)%poly.length], sp=side(P), sq=side(Q);
        if(sp>=0) out.push(P); if((sp>=0)!==(sq>=0)){ const t2=sp/(sp-sq); out.push([P[0]+(Q[0]-P[0])*t2, P[1]+(Q[1]-P[1])*t2]); } }
      return out; };
    const ccw=P=>{ const s=(P[1][0]-P[0][0])*(P[2][1]-P[0][1])-(P[1][1]-P[0][1])*(P[2][0]-P[0][0]); return s>=0?P:[P[0],P[2],P[1]]; };
    const area=P=>{ let s=0; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; s+=a[0]*b[1]-a[1]*b[0]; } return Math.abs(s)/2; };
    const overlapPoly=(A,B)=>{ let poly=ccw(A); const C=ccw(B); for(let i=0;i<3 && poly.length;i++) poly=clip(poly, C[i], C[(i+1)%3]); return poly; };
    const overlap=(A,B)=>{ const poly=overlapPoly(A,B); return poly.length>2?area(poly):0; };
    // can the shared patch be seen? From its middle, a hair off the face, look out along the face's normal: anything solid
    // within a couple of centimetres (a wall it is buried in, the floor it lies on) hides it. ALL=1 lists the buried ones too
    const vm=[]; REST.scene.traverse(o=>{ if(!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh) return;   // (shown or not: the draw distance hides far tiles)
      if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); const sp=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld);
      if(sp.center.x+sp.radius<box.x0-1 || sp.center.x-sp.radius>box.x1+1 || sp.center.z+sp.radius<box.z0-1 || sp.center.z-sp.radius>box.z1+1) return; vm.push(o); });
    const rc=new T.Raycaster(); rc.far=3; rc.layers.enableAll(); const nm=new T.Matrix3(), wn=new T.Vector3();
    const seen=(A,B)=>{ const poly=overlapPoly(proj(A), proj(B)); if(poly.length<3) return false; let u=0, v=0; for(const q of poly){ u+=q[0]; v+=q[1]; } u/=poly.length; v/=poly.length;
      const ax=Math.abs(A.n[0]), ay=Math.abs(A.n[1]), az=Math.abs(A.n[2]), [iu, iv, iw]=ax>=ay&&ax>=az ? [1,2,0] : ay>=az ? [0,2,1] : [0,1,2];
      const P=[0,0,0]; P[iu]=u; P[iv]=v; P[iw]=(A.d-A.n[iu]*u-A.n[iv]*v)/A.n[iw];
      const o=new T.Vector3(P[0]+A.n[0]*0.002, P[1]+A.n[1]*0.002, P[2]+A.n[2]*0.002), d=new T.Vector3(A.n[0], A.n[1], A.n[2]);
      rc.set(o, d); const h=rc.intersectObjects(vm, false); seen.why=h.length ? [h[0].object.name, +h[0].distance.toFixed(3)] : [P.map(v=>+v.toFixed(3))]; if(!h.length) return true; if(h[0].distance<0.023) return false;
      // further off: if the first face met is one seen from behind, the patch is inside a solid (a liner's foot in a slab)
      if(h[0].face){ nm.getNormalMatrix(h[0].object.matrixWorld); wn.copy(h[0].face.normal).applyMatrix3(nm).normalize(); if(wn.dot(d)>0.05) return false; }
      // an underside on the ground: the ray starts under the terrain and meets nothing
      if(d.y<-0.7 && window.Terrain && Terrain.heightAt && Terrain.heightAt(o.x, o.z)>o.y-0.03) return false;
      // a sealed cavity (between a ceiling and the floor over it, under a wall's foot): it shows only if some ray from it
      // gets half a metre into the open
      const t1=new T.Vector3(), t2=new T.Vector3(); t1.set(Math.abs(d.y)<0.9?0:1, Math.abs(d.y)<0.9?1:0, 0).cross(d).normalize(); t2.copy(d).cross(t1);
      for(let k=-1;k<8;k++){ const dir=k<0 ? d.clone() : d.clone().multiplyScalar(0.7).addScaledVector(t1, Math.cos(k*0.785)*0.7).addScaledVector(t2, Math.sin(k*0.785)*0.7).normalize();
        rc.set(o, dir); const g=rc.intersectObjects(vm, false); if(!g.length || g[0].distance>0.5){ seen.why=[k, g.length?g[0].object.name:"open"]; return true; } }
      return false; };
    const ALLP=box.all;
    // a face buried in a solid looks out through that solid's back face, so the ray must see both sides while it tests
    const sides=new Map(); for(const o of vm) for(const m of [].concat(o.material)) if(m && !sides.has(m)){ sides.set(m, m.side); m.side=T.DoubleSide; }
    const pairs=new Map(); let sameCol=0;
    for(const [k,L] of G){
      // also the neighbouring plane bin: offsets under 4 mm
      const parts=k.split(","), kn=parts.slice(0,3).join(",")+","+(+parts[3]+1);
      const M=L.concat(G.get(kn)||[]);
      if(M.length<2) continue;
      for(let i=0;i<L.length;i++) for(let j=0;j<M.length;j++){
        const A=tris[L[i]], B=tris[M[j]]; if(A===B || A.s===B.s) continue;
        if(Math.abs(A.d-B.d)>(box.near||0.0008)) continue;
        if(A.n[0]*B.n[0]+A.n[1]*B.n[1]+A.n[2]*B.n[2]<0.995) continue;
        const ov=overlap(proj(A), proj(B)); if(ov<(box.amin||3e-5)) continue;
        if(A.n[1]<-0.9 && A.c[1]<(box.floor===undefined?0.17:box.floor)) continue;   // undersides resting on the floor or ground
        if(A.c[1]<(box.buried===undefined?-0.05:box.buried)) continue;               // buried (underground rooms: pass buried and floor)
        // two faces of one plain-coloured detail mesh in the same colour draw the same: their fight cannot be seen
        if(!ALLP && srcs[A.s].col && srcs[A.s].col===srcs[B.s].col && srcs[A.s].name===srcs[B.s].name && srcs[A.s].name.startsWith("bk:detail:")){ sameCol++; continue; }
        const pk=Math.min(A.s,B.s)+"|"+Math.max(A.s,B.s);
        let r=pairs.get(pk); if(!r){ const bbx=s=>{ const g=srcs[s].geo; if(!g.boundingBox) g.computeBoundingBox(); const q=g.boundingBox.clone().applyMatrix4(srcs[s].m); return [q.min.x,q.min.y,q.min.z,q.max.x,q.max.y,q.max.z].map(v=>+v.toFixed(2)); };
          r={a:srcs[Math.min(A.s,B.s)].name, b:srcs[Math.max(A.s,B.s)].name, at:A.c.map(v=>+v.toFixed(2)), n:A.n.map(v=>+v.toFixed(2)), dd:+(A.d-B.d).toFixed(5), cnt:0,
             ba:bbx(Math.min(A.s,B.s)), bb:bbx(Math.max(A.s,B.s))}; pairs.set(pk,r); }
        r.cnt++; if(!r.vis && (r.tested||0)<8){ r.tested=(r.tested||0)+1; if(ALLP || seen(A, B)){ r.vis=true; r.why=seen.why; } }
      }
    }
    for(const [m, sd] of sides) m.side=sd;
    const all=[...pairs.values()]; return {srcs:srcs.length, tris:tris.length, buried:all.filter(r=>!r.vis).length, sameCol, pairs:all.filter(r=>r.vis)};
  }, box);
  console.log("sources", res.srcs, "triangles", res.tris, "overlapping pairs that show", res.pairs.length, "· buried, out of sight", res.buried, "· same colour", res.sameCol);
  const byName={}; for(const r of res.pairs){ const k=r.a+" ~ "+r.b; (byName[k]=byName[k]||[]).push(r); }
  for(const k of Object.keys(byName).sort((x,y)=>byName[y].length-byName[x].length)){
    const L=byName[k]; console.log(String(L.length).padStart(4), k);
    for(const r of L.slice(0, +process.argv[3]||4)) console.log("        at", JSON.stringify(r.at), "n", JSON.stringify(r.n), "dd", r.dd, process.env.WHY ? " why "+JSON.stringify(r.why) : "", " A", JSON.stringify(r.ba), " B", JSON.stringify(r.bb));
  }
  }
  await b.close();
})();
