/* REST AREA · tools/drive.js
   The car, driven by the keys with nobody at the wheel, and what it did.

     NODE_PATH=... node tools/drive.js

   Loads the page as shipped (three.js from THREE_JS, as shot.js does), stops it drawing, takes the first car in the
   lot and puts it through a set of runs with 17's own fixed step (REST.sim): off the line, flat out, the brakes, a
   coast, full lock at a walk and at speed, a lane change, the handbrake, reverse, the lawn, a wall. Each prints its
   figures, and a figure outside what the car is meant to do fails the run: see LIMITS. Change CARC or GRIP (10) or
   the handling model (11) and run this before you believe it. */
const path=require("path");
const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname, "..");
const THREE_JS=process.env.THREE_JS || path.join(ROOT, "tools", "three.min.js");
// what each figure must stay inside: [least, most]
const LIMITS={
  "0-60 mph (s)":[5.0, 8.5], "top speed (mph)":[92, 112], "60-0 (m)":[32, 52], "coast 60-40 mph (s)":[6, 30],
  "lock at a walk: radius (m)":[4.5, 8.5], "40 mph: lateral g":[0.70, 1.08], "70 mph: lateral g":[0.70, 1.08],
  "70 mph: slip angle (deg)":[0, 14], "lane change: heading left over (deg)":[0, 6], "lane change: yaw settles (s)":[0, 1.6],
  "handbrake: swung round (deg)":[35, 400], "reverse: top speed (mph)":[14, 26], "grass: top speed in 200 m (mph)":[45, 80],
  "grass: lateral g":[0.38, 0.72], "wall: free again (m backed off)":[1.5, 99], "wet road: lateral g":[0.52, 0.86]};
(async()=>{
  const browser=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
  const page=await browser.newPage({viewport:{width:320,height:180}});
  let errors=0;
  page.on("console", m=>{ if(m.type()==="error"){ console.log("[console.error]", m.text()); errors++; } });
  page.on("pageerror", e=>{ console.log("[pageerror]", e.message); errors++; });
  await page.route("**/three.min.js", r=>r.fulfill({path:THREE_JS, contentType:"application/javascript"}));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await page.goto("file://"+path.join(ROOT,"index.html"), {timeout:400000});
  await page.waitForFunction(()=>window.REST, null, {timeout:400000});
  const out=await page.evaluate(()=>{
    REST.renderer.render=()=>{};                            // (nothing here needs a picture)
    REST.start(); REST.pause(true);
    TRAFFIC.length=0; COL_TRAF.length=0;                    // an empty road
    const K=REST.keys, car=CARS[0], R={}, MPH=2.237, G=9.81;
    const keys=(o)=>{ for(const k of ["KeyW","KeyS","KeyA","KeyD","Space"]) K[k]=!!o[k]; };
    // put the car down at (x, z), its nose toward `yaw` (0 is north, -z), at rest
    const put=(x, z, yaw)=>{
      if(driving) exitCar();
      const y=REST.surf(x, z, Terrain.groundAt(x, z)+2);
      car.g.position.set(x, y+CAR_RIDE, z); car.g.rotation.set(0, yaw+Math.PI, 0); car.g.updateMatrixWorld(true);
      enterCar(car); keys({}); REST.sim(40); };
    const V=()=>car.veh, B=()=>car.veh.body;
    const mph=()=>V().speed*MPH;
    const head=()=>carYaw(B().quaternion);
    const yawRate=()=>B().angularVel.dot(B().up());
    const slipDeg=()=>{ const b=B(), f=b.forward(), r=b.right(); return Math.abs(Math.atan2(b.velocity.dot(r), Math.abs(b.velocity.dot(f))))*180/Math.PI; };
    const until=(cond, max)=>{ let n=0; while(!cond() && n<max*60){ REST.sim(1); n++; } return n/60; };
    const NB=HWY.nb-1.8;                                    // the northbound right lane
    WEATHER.wet=0;
    R.kinds={interstate:GROUND_KIND.at(NB, 300), lot:GROUND_KIND.at(-36, 22), lawn:GROUND_KIND.at(14, 70), cells:GROUND_KIND.cells};
    // --- off the line, and flat out ---
    put(NB, 1500, 0); keys({KeyW:1});
    R["0-60 mph (s)"]=until(()=>mph()>=60, 30);
    until(()=>false, 45); R["top speed (mph)"]=mph();
    // --- the brakes from sixty, and a coast ---
    put(NB, 1500, 0); keys({KeyW:1}); until(()=>mph()>=60, 30);
    { const z0=B().position.z; keys({KeyS:1}); until(()=>V().speed<0.3, 20); R["60-0 (m)"]=Math.abs(B().position.z-z0); keys({}); }
    put(NB, 1500, 0); keys({KeyW:1}); until(()=>mph()>=60, 30); keys({});
    R["coast 60-40 mph (s)"]=until(()=>mph()<=40, 60);
    // --- full lock at a walk: how tight a circle (on the car lot's paving) ---
    put(-36, 30, 0); keys({KeyW:1}); until(()=>V().speed>=3, 10);
    { keys({KeyA:1}); let n=0, sum=0; for(let i=0;i<150;i++){ K.KeyW=V().speed<3; REST.sim(1); if(i>60){ sum+=V().speed/Math.max(1e-3, Math.abs(yawRate())); n++; } }
      R["lock at a walk: radius (m)"]=sum/n; keys({}); }
    // --- full lock at speed: what the tyres give, and whether the car stays pointing where it is going ---
    const corner=(v, x, z, wet)=>{ WEATHER.wet=wet||0; put(x, z, 0); keys({KeyW:1}); until(()=>V().speed>=v, 40);
      keys({KeyW:1, KeyA:1}); let g=0, sl=0;
      for(let i=0;i<120;i++){ REST.sim(1); if(i>45){ g=Math.max(g, Math.abs(V().speed*yawRate())/G); sl=Math.max(sl, slipDeg()); } }
      keys({}); WEATHER.wet=0; return [g, sl]; };
    { const a=corner(17.9, NB, 1500); R["40 mph: lateral g"]=a[0]; R["40 mph: slip angle (deg)"]=a[1]; }
    { const a=corner(31.3, NB, 1500); R["70 mph: lateral g"]=a[0]; R["70 mph: slip angle (deg)"]=a[1]; }
    { const a=corner(17.9, NB, 1500, 1); R["wet road: lateral g"]=a[0]; }
    // --- a lane change at seventy: left, right, hands off; does it come back straight and stop weaving ---
    put(NB, 1500, 0); keys({KeyW:1}); until(()=>mph()>=70, 40);
    { const h0=head(); keys({KeyW:1, KeyA:1}); REST.sim(24); keys({KeyW:1, KeyD:1}); REST.sim(24); keys({KeyW:1});
      let t=0, quiet=0; while(t<6*60 && quiet<20){ REST.sim(1); t++; quiet=Math.abs(yawRate())<0.02 ? quiet+1 : 0; }
      let d=head()-h0; d=Math.atan2(Math.sin(d), Math.cos(d));
      R["lane change: yaw settles (s)"]=(t-20)/60; R["lane change: heading left over (deg)"]=Math.abs(d)*180/Math.PI; keys({}); }
    // --- the handbrake, with the wheel over, at thirty-five ---
    put(NB, 1500, 0); keys({KeyW:1}); until(()=>mph()>=35, 30);
    { const h0=head(); let tot=0, was=h0; keys({KeyA:1, Space:1});
      for(let i=0;i<150;i++){ REST.sim(1); let d=head()-was; d=Math.atan2(Math.sin(d), Math.cos(d)); tot+=d; was=head(); }
      R["handbrake: swung round (deg)"]=Math.abs(tot)*180/Math.PI; keys({}); }
    // --- reverse ---
    put(NB, 1500, 0); keys({KeyS:1}); until(()=>false, 12); R["reverse: top speed (mph)"]=mph(); keys({});
    // --- grass: slower, looser (the hay field east of Edinboro, 08b: level, and two hundred metres of it) ---
    { const F=EDIN.fields[3], lx=(F.x0+F.x1)/2, lz=F.z1-12;
      put(lx, lz, 0); keys({KeyW:1}); let top=0; for(let i=0;i<60*20;i++){ REST.sim(1); top=Math.max(top, mph()); if(B().position.z<F.z0+25) break; }
      R["grass: kind"]=V().kind; R["grass: top speed in 200 m (mph)"]=top;
      put(lx, lz, 0); keys({KeyW:1}); until(()=>V().speed>=11, 20); keys({KeyW:1, KeyA:1}); let g=0;
      for(let i=0;i<90;i++){ REST.sim(1); if(i>30) g=Math.max(g, Math.abs(V().speed*yawRate())/G); }
      R["grass: lateral g"]=g; keys({}); }
    // --- a wall, met on the slant: it must not hold the car ---
    { // the vending room on the island (13b), its west wall, from the truck lot's side
      const wx=VENDHUT.x0-7, wz=(VENDHUT.z0+VENDHUT.z1)/2-6;
      put(wx, wz, -Math.PI/2+0.7);                          // heading east-north-east into it
      keys({KeyW:1}); let hit=0; for(let i=0;i<60*4;i++){ REST.sim(1); hit=Math.max(hit, V().hit); }
      const p0=B().position.clone(); keys({KeyS:1}); REST.sim(60*3);
      R["wall: hit at (m/s)"]=hit; R["wall: free again (m backed off)"]=B().position.distanceTo(p0); keys({}); }
    exitCar();
    return R;
  });
  let bad=0;
  console.log("what is underfoot:", JSON.stringify(out.kinds));
  if(out.kinds.interstate!==1 || out.kinds.lot!==1 || out.kinds.lawn!==0){ console.log("  FAIL: paving or lawn not told apart"); bad++; }
  for(const k in out){ if(k==="kinds") continue; const v=out[k], L=LIMITS[k];
    const ok=!L || (v>=L[0] && v<=L[1]); if(!ok) bad++;
    console.log((ok ? "  ok   " : "  FAIL ")+k.padEnd(40)+(typeof v==="number" ? v.toFixed(2) : v)+(L ? "   ["+L[0]+" .. "+L[1]+"]" : "")); }
  await browser.close();
  if(bad || errors){ console.log(bad+" figure(s) out of range, "+errors+" error(s)"); process.exit(1); }
  console.log("the car drives as meant");
})().catch(e=>{ console.error(e); process.exit(1); });
