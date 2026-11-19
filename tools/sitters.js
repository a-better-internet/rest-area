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
  const out=await p.evaluate(()=>{ const wrong=[], lone=[]; let n=0;
    for(const G of CROWD.groups) for(const q of G.people){ if(q.mode!=="sit" || q.job==="drive" || q.x===undefined) continue; n++;
      const fx=Math.sin(q.yaw||0), fz=Math.cos(q.yaw||0); let best=null, bd=0.7;
      for(const s of SEATS){ if(s.lie) continue; const d=Math.hypot(s.x-q.x, s.z-q.z); if(d<bd && Math.abs((s.y||0)-(q.y||0))<1.2){ bd=d; best=s; } }
      const tag=[G.name, +q.x.toFixed(2), +q.z.toFixed(2), +(q.yaw||0).toFixed(2)];
      if(!best){ lone.push(tag); continue; }
      const dot=fx*(-Math.sin(best.yaw))+fz*(-Math.cos(best.yaw)); if(dot<0.5) wrong.push(tag.concat([best.label, +best.yaw.toFixed(2), +dot.toFixed(2)])); }
    return {n:n, wrong:wrong, lone:lone}; });
  console.log(out.n+" seated · "+out.wrong.length+" turned the wrong way on their seat · "+out.lone.length+" with no seat under them");
  for(const r of out.wrong) console.log("  WRONG WAY  ", JSON.stringify(r));
  for(const r of out.lone) console.log("  no seat    ", JSON.stringify(r));
  if(out.wrong.length) process.exitCode=1;
  await b.close(); })();
