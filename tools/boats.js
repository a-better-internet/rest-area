/* REST AREA · tools/boats.js
   Every boat on the lake must be able to leave the dock it is tied to. For the rig (14p's BOAT) and every pontoon or
   fishing boat in LAKESIDE.boats: take it (BOAT.takeOver), then try to get away from where it lay, flat out ahead,
   astern, each with the motor swung either way, and backing off before turning out, run on 17's own fixed step. It lists, for each, whether it starts
   touching anything (_boatHits) and how far the best try took it. Anything that can't get 8 m clear fails. Then it
   brings the boat back in to a dock (BOAT.leave's berth) and checks that the berth is clear too.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tools/boats.js        (ONLY=regex on the boat's place) */
const path=require("path"), { chromium } = require("playwright"); const ROOT=path.resolve(__dirname, "..");
(async()=>{ const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]}); const p=await b.newPage({viewport:{width:320,height:180}});
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")})); await p.route(/fonts\./, r=>r.fulfill({status:200, body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"), {timeout:400000}); await p.waitForFunction(()=>window.REST,null,{timeout:400000});
  const out=await p.evaluate((only)=>{ REST.renderer.render=()=>{}; REST.start(); REST.pause(true);
    const K=REST.keys, res=[], B=BOAT, keys=(o)=>{ for(const k of ["KeyW","KeyS","KeyA","KeyD"]) K[k]=!!o[k]; };
    const list=[null].concat(LAKESIDE.boats.filter(S=>S.pont));
    for(let i=0;i<list.length;i++){ const S=list[i];
      const name=S ? ((S.kind==="skiff"?"skiff ":"pontoon ")+i)+" @"+S.x.toFixed(0)+","+S.z.toFixed(0) : "the rig @"+B.x.toFixed(0)+","+B.z.toFixed(0);
      if(only && !new RegExp(only).test(name)) continue;
      // take it where it lies
      if(B.on){ B.on=false; B.running=false; B.cap.g.visible=false; }
      if(S) B.takeOver(S); else B.board();
      const x0=B.x, z0=B.z, y0=B.yaw, hit0=_boatHits(x0, z0, y0); let best=0, how="";
      const A={KeyW:1}, AL={KeyW:1,KeyA:1}, AR={KeyW:1,KeyD:1}, S_={KeyS:1}, SL={KeyS:1,KeyA:1}, SR={KeyS:1,KeyD:1};
      for(const [nm, seq] of [["ahead",[[A,8]]],["ahead, left",[[AL,8]]],["ahead, right",[[AR,8]]],["astern",[[S_,8]]],["astern, left",[[SL,8]]],["astern, right",[[SR,8]]],
                              ["back off, then out left",[[S_,2.5],[AL,6]]],["back off, then out right",[[S_,2.5],[AR,6]]],["back and swing, then out",[[SL,3],[AR,6]]],["back and swing the other way, then out",[[SR,3],[AL,6]]]]){
        B.x=x0; B.z=z0; B.yaw=y0; B.u=B.v=B.r=0; B.thr=0; B.steer=0; B.running=true; B.tie=null;
        for(const [o, sec] of seq){ keys(o); for(let n=0;n<60*sec;n++) REST.sim(1); } keys({});
        const d=Math.hypot(B.x-x0, B.z-z0); if(d>best){ best=d; how=nm; } }
      // and in to a dock again, from 10 m off where it was: the berth it would come in to, and whether that touches
      const brt=_dockBerth(x0, z0, y0, 7, B.H), bc=_dockBerth(x0, z0, y0, 7, B.H, _berthClear), bh=brt ? !bc : null;
      B.x=x0; B.z=z0; B.yaw=y0; B.u=B.v=B.r=0; B.thr=0; B.place();
      res.push({name:name, hit0:hit0, best:+best.toFixed(1), how:how, berth:!!brt, berthHits:bh}); }
    if(B.on){ B.on=false; } return res; }, process.env.ONLY||"");
  let bad=0; for(const r of out){ const ok=r.best>=8 && !r.berthHits; if(!ok) bad++;
    console.log((ok?"  ok   ":"  FAIL ")+r.name.padEnd(34)+" starts touching: "+(r.hit0?"YES":"no ")+"  got "+String(r.best).padStart(5)+" m clear ("+r.how+")  berth "+(r.berth?(r.berthHits?"TOUCHES":"clear"):"none")); }
  console.log(out.length+" boats · "+bad+" can't get away or berth against something"); if(bad) process.exitCode=1;
  await b.close(); })();
