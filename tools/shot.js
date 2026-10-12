/* REST AREA · tools/shot.js
   Headless screenshots, rendered by the game itself.

     node tools/shot.js shots.json [outDir] [width] [height]

   shots.json is a list of
     {name, go:[x,z,yaw,y,pitch], hour, autumn, drone:[x,y,z,yaw,pitch],
      view:"plan", frames, eval:"js to run first"}
   three.js is loaded from THREE_JS (a local r128 three.min.js) instead of the
   CDN, and the web fonts are skipped; everything else is the page as shipped.
   Console errors and page errors are printed, and fail the run. */
const fs=require("fs"), path=require("path");
const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname, "..");
const list=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
const OUT=path.resolve(process.argv[3]||"shots");
const W=+(process.argv[4]||1280), H=+(process.argv[5]||720);
const THREE_JS=process.env.THREE_JS || path.join(ROOT, "tools", "three.min.js");
fs.mkdirSync(OUT,{recursive:true});
(async()=>{
  const browser=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader",
    "--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
  const page=await browser.newPage({viewport:{width:W,height:H}});
  let errors=0;
  page.on("console", m=>{ if(m.type()==="error"||m.type()==="warning"){ console.log("[console."+m.type()+"]", m.text()); if(m.type()==="error") errors++; } });
  page.on("pageerror", e=>{ console.log("[pageerror]", e.message); errors++; });
  await page.route("**/three.min.js", r=>r.fulfill({path:THREE_JS, contentType:"application/javascript"}));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  const t0=Date.now();
  await page.goto("file://"+path.join(ROOT,"index.html"));
  await page.waitForFunction(()=>window.REST, null, {timeout:240000});
  console.log("built in", ((Date.now()-t0)/1000).toFixed(1)+"s");
  const info=await page.evaluate(()=>{
    const r=REST.renderer.info;
    return {meshes:(()=>{ let n=0; REST.scene.traverse(o=>{ if(o.isMesh) n++; }); return n; })(),
            inst:REST.forest.inst.length, chunks:REST.forest.chunks.length, cols:REST.cols.length};
  });
  console.log(JSON.stringify(info));
  await page.evaluate(()=>{ REST.start(); REST.pause(true); });
  await page.waitForTimeout(1200);              // the boot card fades over 0.8 s
  // the HUD is for players; a shot is for looking at the world
  if(!process.env.HUD) await page.addStyleTag({content:"#mast,#keys,#cluster,#plan,#toast,#prompt,#dot{display:none!important}"});
  for(const s of list){
    const t1=Date.now();
    await page.evaluate((s)=>{
      if(s.eval) (0,eval)(s.eval);
      REST.season(!!s.autumn);
      if(s.hour!==undefined) REST.hour(s.hour);
      if(s.drone){ if(!document.__drone){ REST.drone(true); document.__drone=1; }
        REST.droneSet(...s.drone); }
      else { if(document.__drone){ REST.drone(false); document.__drone=0; } }
      if(s.go) REST.go(...s.go);
      REST.view(s.view||"fp");
    }, s);
    // let a few frames draw: LOD, lights, the camera follow
    await page.evaluate((n)=>new Promise(res=>{ let k=0; const f=()=>{ if(++k>=n) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); }), s.frames||4);
    const stats=await page.evaluate(()=>{ const i=REST.renderer.info; return i.render.calls+" calls, "+(i.render.triangles/1000|0)+"k tris"; });
    await page.screenshot({path:path.join(OUT, s.name+".png"), timeout:180000});
    console.log(s.name, stats, ((Date.now()-t1)/1000).toFixed(1)+"s");
  }
  await browser.close();
  if(errors){ console.log(errors+" error(s)"); process.exit(1); }
})().catch(e=>{ console.error(e); process.exit(1); });
