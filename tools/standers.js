/* REST AREA · tools/standers.js
   Everyone put down standing still (14q's crowd: not sitting, not walking a
   path, not driving) must stand on open floor: not in a chair or on a bench
   (a seat within 0.45 m at their height: the porch's watering woman stood in
   a rocking chair), and not inside anything solid (a collider through their
   middle, 0.5 to 1.4 m over their feet, within 0.15 m of where they stand).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/standers.js
   It fails on anyone in a seat or inside something.                         */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname, "..");
(async()=>{ const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const p=await b.newPage();
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")})); await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000}); await p.waitForFunction(()=>window.REST,null,{timeout:240000});
  const out=await p.evaluate(()=>{ const inSeat=[], inside=[]; let n=0; const R=0.15;
    for(const G of CROWD.groups) for(const q of G.people){ if(q.mode==="sit" || q.mode==="walk" || q.path || q.job==="drive" || q.x===undefined) continue; n++; const skipIn=!!q.inside;      // (inside: a cook in a truck, a clerk in a booth, whose collider is all of it)
      const fy=q.y!==undefined ? q.y : Terrain.groundAt(q.x, q.z), tag=[G.name, q.job||q.mode, +q.x.toFixed(2), +q.z.toFixed(2)];
      for(const s of SEATS){ if(s.lie) continue; if(Math.hypot(s.x-q.x, s.z-q.z)<0.45 && Math.abs((s.y||0)-fy)<0.6){ inSeat.push(tag.concat([s.label])); break; } }
      const lo=fy+0.5, hi=fy+1.4;
      if(!skipIn) for(const c of REST.cols){ if(c.y1-c.y0>200) continue; if(q.x>c.x0-R && q.x<c.x1+R && q.z>c.z0-R && q.z<c.z1+R && hi>c.y0 && lo<c.y1 && (!c.ob || obNear(c.ob, q.x, q.z, R))){
        inside.push(tag.concat([[+c.x0.toFixed(2), +c.x1.toFixed(2), +c.z0.toFixed(2), +c.z1.toFixed(2), +c.y0.toFixed(2), +c.y1.toFixed(2)]])); break; } } }
    return {n:n, inSeat:inSeat, inside:inside}; });
  console.log(out.n+" standing · "+out.inSeat.length+" standing in a seat · "+out.inside.length+" standing inside something solid");
  for(const r of out.inSeat) console.log("  IN A SEAT  ", JSON.stringify(r));
  for(const r of out.inside) console.log("  INSIDE     ", JSON.stringify(r));
  if(out.inSeat.length || out.inside.length) process.exitCode=1;
  await b.close(); })();
