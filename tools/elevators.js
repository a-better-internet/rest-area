/* REST AREA · tools/elevators.js
   Rides every office park elevator (14md) to every floor, walks out of the
   car onto the landing, and fails any floor where your feet do not end on it.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/elevators.js     */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname, "..");
(async()=>{ const browser=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const page=await browser.newPage();
  page.on("pageerror", e=>console.log("[pageerror]", e.message));
  await page.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js"), contentType:"application/javascript"}));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await page.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000}); await page.waitForFunction(()=>window.REST, null, {timeout:240000});
  const res=await page.evaluate(()=>{ const out=[];
    for(const E of OFFICE.elevs){ for(let f=0;f<E.levels.length;f++){ const P=REST.player, [cx,cz]=E.F.P(4.2,11.1), [ox,oz]=E.F.P(4.2,6.0);
        P.pos.x=cx; P.pos.z=cz; P.feetY=E.y+0.02; REST.sim(5);
        if(f!==E.f){ E.target=f; E.state="closing"; } let t=0; while((E.state!=="idle" || E.f!==f) && t<3000){ REST.sim(1); updateElevators(1/60); t++; }
        P.yaw=Math.atan2(-(ox-cx),-(oz-cz)); REST.keys.KeyW=true; for(let k=0;k<200;k++){ REST.sim(1); updateElevators(1/60); } REST.keys.KeyW=false; REST.sim(30);
        const [ux,uz]=E.F.P(4.2,9.0); out.push((Math.abs(P.feetY-E.levels[f])>0.05 ? "BAD " : "ok  ")+E.name+" floor "+(f+1)+" · feet "+P.feetY.toFixed(2)+" want "+E.levels[f].toFixed(2)); } }
    return out.join("\n"); }); console.log(res); if(/BAD/.test(res)) process.exitCode=1;
  await browser.close(); })();
