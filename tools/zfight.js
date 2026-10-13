/* REST AREA · tools/zfight.js
   Lists faces that lie in one plane and overlap: what the depth buffer
   cannot sort, and draws as flicker. Loads the world with ?zdebug, which
   keeps every baked box's final matrix (after 01's growth), takes every
   triangle in a box of the world, and reports the pairs within `near`
   metres of one plane that share more than `amin` square metres, grouped
   by bucket. Faces turned into a wall still count; read the normals.
     node tools/zfight.js '{"x0":-10,"x1":17,"z0":-21,"z1":21,"y0":-0.6,"y1":10,"near":0.0011}' [examples]  */
const path=require("path"); const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname,"..");
const box=JSON.parse(process.argv[2]||'{"x0":-10,"x1":10,"z0":-16,"z1":16,"y0":-0.6,"y1":10}');
(async()=>{
  const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const p=await b.newPage({viewport:{width:320,height:200}});
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")}));
  await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html")+"?zdebug");
  await p.waitForFunction(()=>window.REST,null,{timeout:180000});
  const res=await p.evaluate((box)=>{
    const T=THREE, srcs=[];
    for(const e of (window.ZDBG||[])) srcs.push({name:"bk:"+e.bucket, geo:e.geo, m:e.matrix});
    REST.scene.traverse(o=>{
      if(!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.visible) return;
      if(o.name && o.name.startsWith("bucket:")) return;
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
    const overlap=(A,B)=>{ let poly=ccw(A); const C=ccw(B); for(let i=0;i<3 && poly.length;i++) poly=clip(poly, C[i], C[(i+1)%3]); return poly.length>2?area(poly):0; };
    const pairs=new Map();
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
        if(A.n[1]<-0.9 && A.c[1]<0.17) continue;                 // undersides resting on the floor or ground
        if(A.c[1]<-0.05) continue;                                // buried
        const pk=Math.min(A.s,B.s)+"|"+Math.max(A.s,B.s);
        let r=pairs.get(pk); if(!r){ const bbx=s=>{ const g=srcs[s].geo; if(!g.boundingBox) g.computeBoundingBox(); const q=g.boundingBox.clone().applyMatrix4(srcs[s].m); return [q.min.x,q.min.y,q.min.z,q.max.x,q.max.y,q.max.z].map(v=>+v.toFixed(2)); };
          r={a:srcs[Math.min(A.s,B.s)].name, b:srcs[Math.max(A.s,B.s)].name, at:A.c.map(v=>+v.toFixed(2)), n:A.n.map(v=>+v.toFixed(2)), dd:+(A.d-B.d).toFixed(5), cnt:0,
             ba:bbx(Math.min(A.s,B.s)), bb:bbx(Math.max(A.s,B.s))}; pairs.set(pk,r); }
        r.cnt++;
      }
    }
    return {srcs:srcs.length, tris:tris.length, pairs:[...pairs.values()]};
  }, box);
  console.log("sources", res.srcs, "triangles", res.tris, "overlapping pairs", res.pairs.length);
  const byName={}; for(const r of res.pairs){ const k=r.a+" ~ "+r.b; (byName[k]=byName[k]||[]).push(r); }
  for(const k of Object.keys(byName).sort((x,y)=>byName[y].length-byName[x].length)){
    const L=byName[k]; console.log(String(L.length).padStart(4), k);
    for(const r of L.slice(0, +process.argv[3]||4)) console.log("        at", JSON.stringify(r.at), "n", JSON.stringify(r.n), "dd", r.dd, " A", JSON.stringify(r.ba), " B", JSON.stringify(r.bb));
  }
  await b.close();
})();
