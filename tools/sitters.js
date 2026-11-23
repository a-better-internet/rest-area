/* REST AREA · tools/sitters.js
   Every seated person in the world (14q's crowd, mode "sit") must face the
   way their seat faces. A person turned by yaw faces (sin yaw, cos yaw); a
   seat (06's addSeat) faces (−sin yaw, −cos yaw). For each seated person it
   finds the nearest seat within 0.7 m and lists anyone turned more than 60°
   from it (backwards on a bench, sideways on a stool), and anyone sitting
   where there is no seat at all (on air, or on a seat with no addSeat).
   A driver (job "drive") and anyone on a lying seat are left out.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/sitters.js
   It fails if anyone is turned the wrong way.                                */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname, "..");
(async()=>{ const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const p=await b.newPage();
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")})); await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000}); await p.waitForFunction(()=>window.REST,null,{timeout:240000});
  const out=await p.evaluate(()=>{ const wrong=[], lone=[], backTo=[]; let n=0; const T=THREE;
    // (the world's meshes, less the people: a ray from a sitter at table height, forward and back, finds a table behind)
    const skip=new Set(); for(const G of CROWD.groups) for(const q of G.people) if(q.P && q.P.g) q.P.g.traverse(o=>skip.add(o));
    const ms=[]; scene.updateMatrixWorld(true); scene.traverse(o=>{ if(o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !skip.has(o) && o.geometry && !/terrain|ground|canopy|tree|forest/i.test(o.name||"")){ if(!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); ms.push(o); } });
    const rc=new T.Raycaster(); rc.far=1.0; const hit=(o, d)=>{ rc.set(o, d); const h=rc.intersectObjects(ms, false); return h.length ? h[0].distance : 9; };
    for(const G of CROWD.groups) for(const q of G.people){ if(q.mode!=="sit" || q.job==="drive" || q.x===undefined) continue; n++;
      const fx=Math.sin(q.yaw||0), fz=Math.cos(q.yaw||0); let best=null, bd=0.7;
      for(const s of SEATS){ if(s.lie) continue; const d=Math.hypot(s.x-q.x, s.z-q.z); if(d<bd && Math.abs((s.y||0)-(q.y||0))<1.2){ bd=d; best=s; } }
      const tag=[G.name, +q.x.toFixed(2), +q.z.toFixed(2), +(q.yaw||0).toFixed(2)];
      { const fy=q.y!==undefined ? q.y : Terrain.groundAt(q.x, q.z), f=new T.Vector3(fx, 0, fz), o=new T.Vector3(q.x, fy+0.74, q.z);
        const F=hit(o, f), Bk=hit(o.clone().addScaledVector(f, -0.5), f.clone().negate());
        const Bw=hit(o.clone().addScaledVector(f, -0.5).add(new T.Vector3(0, 0.6, 0)), f.clone().negate());      // (a wall reaches on up past a table's top: that is not a table)
        if(Bk<0.45 && F>0.8 && Bw>Bk+0.25 && q.job!=="recline" && q.job!=="lounge") backTo.push(tag.concat(["a table behind, nothing in front", +Bk.toFixed(2)])); }
      if(!best){ lone.push(tag); continue; }
      const dot=fx*(-Math.sin(best.yaw))+fz*(-Math.cos(best.yaw)); if(dot<0.5) wrong.push(tag.concat([best.label, +best.yaw.toFixed(2), +dot.toFixed(2)])); }
    return {n:n, wrong:wrong, lone:lone, backTo:backTo}; });
  console.log(out.n+" seated · "+out.wrong.length+" turned the wrong way on their seat · "+out.lone.length+" with no seat under them");
  for(const r of out.wrong) console.log("  WRONG WAY  ", JSON.stringify(r));
  for(const r of out.backTo) console.log("  BACK TO IT ", JSON.stringify(r));
  for(const r of out.lone) console.log("  no seat    ", JSON.stringify(r));
  console.log(out.backTo.length+" with a table behind them and nothing in front");
  if(out.wrong.length || out.backTo.length) process.exitCode=1;
  await b.close(); })();
