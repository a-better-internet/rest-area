"use strict";
/* REST AREA · 14c-critters.js
   the small things that make a place feel lived in: butterflies over the
   beds by day, grey squirrels working the lawn under the grove's trees,
   and the mist that lies on the grass at dawn and comes back at dusk
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14c · CRITTERS AND MIST
   Butterflies are one InstancedMesh of wings: two instances each, hinged
   on the body's line and flapped by rewriting their matrices; they wander
   round a flower bed or the edge of the lawn at knee to head height and go
   to ground when the light does. Squirrels hop from tree to tree in short
   bounds, stop, sit up, flick the tail, and go on. The mist is a few broad
   sheets laid just over the grass, their alpha a field of soft blots that
   drifts; dense an hour after sunrise and again as the light goes.
   ---------------------------------------------------------------------- */
const CRITTERS={bflies:[], squirrels:[], mist:[]};
(function butterflies(){
  const c=cvs(64,64), x=c.getContext("2d");
  // one wing: fore and hind lobes, dusky veins, a dark edge
  x.clearRect(0,0,64,64);
  x.fillStyle="#ffffff";
  x.beginPath(); x.ellipse(30,22,26,18,-0.3,0,7); x.fill();
  x.beginPath(); x.ellipse(24,46,18,14,0.4,0,7); x.fill();
  x.strokeStyle="rgba(40,30,20,0.55)"; x.lineWidth=3; x.stroke();
  x.beginPath(); x.ellipse(30,22,26,18,-0.3,0,7); x.stroke();
  x.fillStyle="rgba(30,20,10,0.6)"; x.beginPath(); x.arc(44,16,4,0,7); x.fill();
  const tex=setSRGB(new T.CanvasTexture(c));
  const geo=new T.PlaneGeometry(0.075,0.075); geo.translate(0.0375,0,0);       // hinged at its root
  geo.rotateX(-Math.PI/2);
  const mat=new T.MeshLambertMaterial({map:tex, transparent:true, alphaTest:0.4, side:T.DoubleSide});
  const N=14, mesh=new T.InstancedMesh(geo, mat, N*2);
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); mesh.frustumCulled=false;
  const cols=[0xf4f2e6,0xf2d84a,0xe8892a,0xf4f2e6,0xe9e3c8];
  const anchors=[[-7.6,-3.8],[-7.6,3.8],[-17.8,-11],[-17.8,11],[-2,-40],[11,-46],[-14,-58],[16,72],[22,84],[-50,-20],[-50,30],[6,-70],[-4,-56],[24,-60]];
  for(let i=0;i<N;i++){
    const a=anchors[i%anchors.length], col=new T.Color(cols[i%cols.length]);
    mesh.setColorAt(i*2, col); mesh.setColorAt(i*2+1, col);
    CRITTERS.bflies.push({ax:a[0], az:a[1], x:a[0], y:0.8, z:a[1], vx:0, vy:0, vz:0, ph:Math.random()*6, t:0, yaw:0, rest:0});
  }
  if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
  scene.add(mesh); CRITTERS.bmesh=mesh;
})();
(function squirrels(){
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.9});
  const E=(geo,x,y,z,c,rx,sx,sy,sz)=>({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z), new T.Quaternion().setFromEuler(new T.Euler(rx||0,0,0)), V3(sx||1,sy||1,sz||1)), color:new T.Color(c)});
  const G="#5f5850", L="#a89f92";
  const trees=[[-2,-40],[11,-45],[-15,-61],[6,-69],[25,-65],[-6,-87],[16,-91],[26,-44],[-17,-36],[-5,-55]];
  for(let i=0;i<3;i++){
    const g=new T.Group();
    const body=new T.Mesh(mergeEntries([
      E(new T.SphereGeometry(0.5,10,8),0,0.09,0,G,0,0.09,0.10,0.20),
      E(new T.SphereGeometry(0.5,8,6),0,0.07,0.02,L,0,0.07,0.07,0.15),
      E(new T.SphereGeometry(0.045,8,6),0,0.15,0.10,G),
      E(new T.ConeGeometry(0.014,0.03,5),-0.02,0.19,0.09,G), E(new T.ConeGeometry(0.014,0.03,5),0.02,0.19,0.09,G),
      E(new T.SphereGeometry(0.008,5,4),-0.028,0.16,0.135,"#141210"), E(new T.SphereGeometry(0.008,5,4),0.028,0.16,0.135,"#141210")]), mat);
    body.castShadow=true; g.add(body);
    const tail=new T.Group(); tail.position.set(0,0.10,-0.09); g.add(tail);
    tail.add(new T.Mesh(mergeEntries([E(new T.SphereGeometry(0.5,8,6),0,0.06,-0.04,G,-0.5,0.08,0.16,0.07),
                                      E(new T.SphereGeometry(0.5,8,6),0,0.17,-0.02,G,0.3,0.08,0.13,0.07),
                                      E(new T.SphereGeometry(0.5,8,6),0,0.23,0.03,L,0.9,0.07,0.08,0.06)]), mat));
    scene.add(g);
    const t0=trees[(i*3)%trees.length];
    CRITTERS.squirrels.push({g:g, tail:tail, body:body, x:t0[0]+0.6, z:t0[1]+0.6, from:t0, to:null, hop:0, wait:1+Math.random()*3, yaw:0, trees:trees, sit:0});
  }
})();
(function mist(){
  const c=cvs(256,256), x=c.getContext("2d"), r=_trng(771);
  x.clearRect(0,0,256,256);
  for(let i=0;i<70;i++){
    const px=r()*256, py=r()*256, rad=20+r()*46;
    for(const [ox,oy] of [[0,0],[256,0],[-256,0],[0,256],[0,-256]]){
      const g=x.createRadialGradient(px+ox,py+oy,0,px+ox,py+oy,rad);
      g.addColorStop(0,"rgba(255,255,255,"+(0.10+r()*0.12).toFixed(2)+")"); g.addColorStop(1,"rgba(255,255,255,0)");
      x.fillStyle=g; x.fillRect(px+ox-rad,py+oy-rad,rad*2,rad*2);
    }
  }
  const tex=new T.CanvasTexture(c); tex.wrapS=tex.wrapT=T.RepeatWrapping; tex.repeat.set(2,2);
  const sheets=[[-2,-60,70,60],[18,75,40,50],[-8,40,40,40],[-128,0,60,600],[-182,0,40,600],[60,-110,60,80],[-95,-20,40,240]];
  for(const [cx,cz,w,d] of sheets) for(const hy of [0.35,1.1]){
    const m=new T.Mesh(new T.PlaneGeometry(w,d), new T.MeshBasicMaterial({map:tex, transparent:true, opacity:0, depthWrite:false, color:0xe8ecee, fog:true}));
    m.rotation.x=-Math.PI/2; m.position.set(cx, Terrain.groundAt(cx,cz)+hy, cz); m.renderOrder=2;
    m.material.map=tex.clone(); m.material.map.needsUpdate=true; m.material.map.repeat.set(w/60, d/60);
    scene.add(m); CRITTERS.mist.push({m:m, hy:hy, sx:(Math.random()-0.5)*0.004, sz:(Math.random()-0.5)*0.004});
  }
})();
const _bm=new T.Matrix4(), _bq=new T.Quaternion(), _be=new T.Euler(), _bs=new T.Vector3(1,1,1), _bp=new T.Vector3();
function updateCritters(dt, now, dark){
  // butterflies: summer days only
  const day=1-dark, on=day>0.6 && !FOREST.isAutumn();
  const BM=CRITTERS.bmesh; BM.visible=on;
  if(on){
    CRITTERS.bflies.forEach((b,i)=>{
      b.t-=dt;
      if(b.rest>0){ b.rest-=dt; }
      else{
        if(b.t<=0){ b.t=0.4+Math.random()*1.2;
          const tx=b.ax+(Math.random()-0.5)*5, tz=b.az+(Math.random()-0.5)*5, ty=0.35+Math.random()*1.3;
          b.vx=(tx-b.x)*0.9; b.vz=(tz-b.z)*0.9; b.vy=(ty-b.y)*1.2;
          if(Math.random()<0.08) b.rest=2+Math.random()*4; }
        b.x+=b.vx*dt; b.z+=b.vz*dt; b.y+=b.vy*dt+Math.sin(now*9+b.ph)*0.012;
        if(Math.abs(b.vx)+Math.abs(b.vz)>0.05) b.yaw=Math.atan2(b.vx,b.vz);
      }
      const gy=groundY(b.x,b.z), y=Math.max(gy+0.15, gy+b.y);
      const flap=b.rest>0 ? 0.25+Math.sin(now*2+b.ph)*0.2 : 0.2+Math.abs(Math.sin(now*16+b.ph))*1.25;
      for(const s of [-1,1]){
        _be.set(0, b.yaw, s*flap, "YXZ"); _bq.setFromEuler(_be);
        _bs.set(s,1,1); _bp.set(b.x, y, b.z);
        _bm.compose(_bp, _bq, _bs);
        BM.setMatrixAt(i*2+(s>0?1:0), _bm);
      }
    });
    BM.instanceMatrix.needsUpdate=true;
  }
  // squirrels: hop to the next tree, sit, look, go on; up the trunk at dusk
  for(const s of CRITTERS.squirrels){
    s.g.visible=day>0.35;
    if(!s.g.visible) continue;
    if(!s.to){
      s.wait-=dt; s.sit=Math.min(1,s.sit+dt*3);
      if(s.wait<=0){ s.to=s.trees[(Math.random()*s.trees.length)|0]; s.wait=2+Math.random()*6; }
    }else{
      s.sit=Math.max(0,s.sit-dt*5);
      const tx=s.to[0]+0.5, tz=s.to[1]+0.5, dx=tx-s.x, dz=tz-s.z, d=Math.hypot(dx,dz);
      if(d<0.3){ s.from=s.to; s.to=null; }
      else{
        // bounds of a metre or so, a pause between some of them
        s.hop+=dt*3.2;
        const sp=(Math.sin(s.hop*Math.PI*2)>-0.6 ? 2.6 : 0);
        s.yaw=Math.atan2(dx,dz); s.x+=dx/d*sp*dt; s.z+=dz/d*sp*dt;
        if(Math.random()<dt*0.25){ s.to=null; s.wait=0.8+Math.random()*2.2; }
      }
    }
    const air=s.to ? Math.abs(Math.sin(s.hop*Math.PI*2))*0.12 : 0;
    s.g.position.set(s.x, Terrain.groundAt(s.x,s.z)+air, s.z);
    s.g.rotation.set(-s.sit*0.9, s.yaw, 0, "YXZ");
    s.tail.rotation.x=0.3+Math.sin(now*(s.to?3:9))*0.25*(s.to?1:0.5)+s.sit*0.6;
  }
  // the mist: an hour after sunrise, and again from dusk into the night
  const h=DayNight.state.hour;
  const morning=smoothstep(4.8,6.4,h)*(1-smoothstep(7.4,9.6,h));
  const evening=smoothstep(18.5,21.0,h)+ (h<4.8 ? 1 : 0);
  const k=Math.max(morning*1.0, Math.min(1,evening)*0.55)*(FOREST.isAutumn()?1.3:1.0);
  for(const M of CRITTERS.mist){
    M.m.visible=k>0.01;
    if(!M.m.visible) continue;
    M.m.material.opacity=k*(M.hy<0.5?0.55:0.32);
    M.m.material.color.setScalar(0.12+0.85*day);
    M.m.material.map.offset.x+=M.sx*dt; M.m.material.map.offset.y+=M.sz*dt;
  }
}
