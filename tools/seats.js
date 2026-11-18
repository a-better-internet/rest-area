/* REST AREA · tools/seats.js
   Finds seats that face the wrong way. A seat (06's addSeat) faces along
   (−sin yaw, −cos yaw), the way you look sitting in it and the way you
   step when you get up. Two tests, by short rays against the world's
   meshes:
     · its back in front of it: something at backrest height (0.9 m over
       its floor) within 0.42 m in front and nothing within 0.6 m behind;
     · its table behind it (a seat whose label says TABLE, DESK, COUNTER,
       ISLAND, BAR, BOOTH or PICNIC): a table top (0.72 m) within 0.6 m
       behind its own backrest and nothing within 0.7 m in front.
   A stool at a counter or a chair at a desk with a screen on it can trip
   the first; look at what it lists before changing anything.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/seats.js        */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname,"..");
(async()=>{ const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const p=await b.newPage();
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")})); await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000}); await p.waitForFunction(()=>window.REST,null,{timeout:240000});
  const out=await p.evaluate(()=>{ const T=THREE, ms=[]; scene.updateMatrixWorld(true);
    scene.traverse(o=>{ if(o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && o.geometry && !/terrain|ground|canopy|tree|forest/i.test(o.name||"")){ if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); ms.push(o); } });
    const rc=new T.Raycaster(); rc.far=0.8; const back=[], table=[];
    const hit=(o, d)=>{ rc.set(o, d); const h=rc.intersectObjects(ms, false); return h.length ? h[0].distance : 9; };
    for(const s of SEATS){ if(s.lie) continue; const f=new T.Vector3(-Math.sin(s.yaw), 0, -Math.cos(s.yaw)), bk=f.clone().negate();
      { const o=new T.Vector3(s.x, s.y+0.9, s.z), F=hit(o, f), Bk=hit(o, bk); if(F<0.42 && Bk>0.6) back.push([s.label, +s.x.toFixed(2), +s.z.toFixed(2), +s.y.toFixed(2), +s.yaw.toFixed(2)]); }
      if(/TABLE|DESK|COUNTER|ISLAND|BAR|BOOTH|PICNIC/.test(s.label||"")){ const o=new T.Vector3(s.x, s.y+0.72, s.z), F=hit(o, f), Bk=hit(o.clone().addScaledVector(bk, 0.32), bk);
        if(Bk<0.6 && F>0.7) table.push([s.label, +s.x.toFixed(2), +s.z.toFixed(2), +s.y.toFixed(2), +s.yaw.toFixed(2)]); } }
    return {n:SEATS.length, back:back, table:table}; });
  console.log(out.n+" seats · "+out.back.length+" with something at back height in front · "+out.table.length+" with a table behind");
  for(const r of out.back) console.log("  back in front  ", JSON.stringify(r)); for(const r of out.table) console.log("  table behind   ", JSON.stringify(r));
  await b.close(); })();
