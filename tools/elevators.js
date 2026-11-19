/* REST AREA · tools/elevators.js
   The office park's elevators (14md), every car to every floor:
     · ride it with a number key and walk out onto the landing;
     · ride it again walking hard at its doors the whole way, which must
       keep you in the car and put you down on the floor you asked for;
     · stand in the doorway, and the doors must not shut.
   It fails any floor where your feet do not end where they should.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/elevators.js     */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname, "..");
(async()=>{ const browser=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const page=await browser.newPage();
  page.on("pageerror", e=>console.log("[pageerror]", e.message));
  await page.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js"), contentType:"application/javascript"}));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await page.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000}); await page.waitForFunction(()=>window.REST, null, {timeout:240000});
  const res=await page.evaluate(()=>{ const out=[], P=REST.player, K=REST.keys;
    const face=(E, u, v)=>{ const [x, z]=E.F.P(u, v); P.yaw=Math.atan2(-(x-P.pos.x), -(z-P.pos.z)); };
    const wait=(E, f, n)=>{ let t=0; while(!(E.state==="idle" && E.f===f && E.door>=1) && t<(n||6000)){ REST.sim(1); t++; } return t; };
    const into=(E)=>{ const [x, z]=E.F.P(E.uc, 11.2); P.pos.x=x; P.pos.z=z; P.feetY=E.y; REST.sim(4); };
    const ok=(c, s)=>out.push((c ? "ok   " : "BAD  ")+s);
    for(const E of OFFICE.elevs){ const N=E.levels.length;
      for(let f=0; f<N; f++){
        // ride there, walk out
        into(E); if(E.f!==f){ OFFICE.press(E, f); wait(E, f); } face(E, E.uc, 6.0); K.KeyW=true; REST.sim(160); K.KeyW=false; REST.sim(20);
        ok(Math.abs(P.feetY-E.levels[f])<0.05, E.name+(E.uc<0 ? " (west car)" : "")+" floor "+(f+1)+", out of the car · feet "+P.feetY.toFixed(2)+" want "+E.levels[f].toFixed(2));
        // back in, then ride on to the next floor walking at the doors all the way
        const g=(f+1)%N; into(E); OFFICE.press(E, g); let t=0; while(E.state!=="moving" && t<900){ REST.sim(1); t++; } face(E, E.uc, 6.0); K.KeyW=true;
        let left=false; while(E.state==="moving" && t<8000){ REST.sim(1); t++; if(!(P.feetY>E.y-0.3 && P.feetY<E.y+0.3)) left=true; }
        K.KeyW=false; REST.sim(10);
        ok(!left, E.name+(E.uc<0 ? " (west car)" : "")+" floor "+(f+1)+" to "+(g+1)+", walking at the doors, kept in the car"); }
      // the doors hold for someone in the doorway
      wait(E, E.f); into(E); const [dx, dz]=E.F.P(E.uc, 10.1); P.pos.x=dx; P.pos.z=dz; P.feetY=E.y; OFFICE.press(E, (E.f+1)%N); REST.sim(400);
      ok(E.state!=="moving" && E.door>0.7, E.name+(E.uc<0 ? " (west car)" : "")+", the doors stay open on someone in the doorway ("+E.state+")"); P.pos.z+=0; const [ox, oz]=E.F.P(E.uc, 8.0); P.pos.x=ox; P.pos.z=oz; REST.sim(1200); }
    return out.join("\n"); });
  console.log(res); if(/BAD/.test(res)) process.exitCode=1;
  await browser.close(); })();
