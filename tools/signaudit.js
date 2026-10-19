/* REST AREA · tools/signaudit.js
   Every piece of lettering drawn into a canvas while the world builds, checked
   against the edges of its canvas.

     node tools/signaudit.js [pad]

   Wraps CanvasRenderingContext2D.fillText and strokeText before any script
   runs. For each call it measures the text as drawn (font, align, baseline,
   and the canvas transform), and reports any whose box comes nearer an edge
   of its canvas than `pad` (a fraction of the canvas's smaller side, default
   0.03), or runs off it. Each report gives the canvas size, the text, how
   far over it is, and the line of the game that drew it. A sign's text
   should go through fitText / fitHwy (02), which fit it with room to spare;
   this finds the places that do not, or that ask for more than fits. It
   checks what is drawn while the world builds, and then what is drawn in a
   few seconds of play in the lobby, the arcade and by the dartboard. */
const path=require("path");
const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname, "..");
const PAD=+(process.argv[2]||0.03);
const THREE_JS=process.env.THREE_JS || path.join(ROOT, "tools", "three.min.js");
(async()=>{
  const browser=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]});
  const page=await browser.newPage({viewport:{width:320,height:200}});
  page.on("pageerror", e=>console.log("[pageerror]", e.message));
  await page.route("**/three.min.js", r=>r.fulfill({path:THREE_JS, contentType:"application/javascript"}));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await page.addInitScript((PAD)=>{
    window.__SIGNS=[];
    const P=CanvasRenderingContext2D.prototype;
    for(const fn of ["fillText","strokeText"]){
      const orig=P[fn];
      P[fn]=function(str, x, y){
        try{
          const m=this.measureText(String(str)), c=this.canvas, W=c.width, H=c.height;
          const t=this.getTransform();
          const pts=[[x-m.actualBoundingBoxLeft, y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight, y-m.actualBoundingBoxAscent],
                     [x-m.actualBoundingBoxLeft, y+m.actualBoundingBoxDescent],[x+m.actualBoundingBoxRight, y+m.actualBoundingBoxDescent]]
                     .map(([px,py])=>[t.a*px+t.c*py+t.e, t.b*px+t.d*py+t.f]);
          const x0=Math.min(...pts.map(p=>p[0])), x1=Math.max(...pts.map(p=>p[0])), y0=Math.min(...pts.map(p=>p[1])), y1=Math.max(...pts.map(p=>p[1]));
          const pad=Math.min(W,H)*PAD, over=Math.max(pad-x0, x1-(W-pad), pad-y0, y1-(H-pad));
          if(over>0.5 && String(str).trim().length>0){
            const st=(new Error().stack||"").split("\n").slice(2).find(l=>/\/js\//.test(l))||"";
            const at=(st.match(/js\/([^:]+:\d+)/)||[])[1]||"?";
            window.__SIGNS.push({W, H, str:String(str).slice(0,40), over:+over.toFixed(1), off:+Math.max(-x0, x1-W, -y0, y1-H).toFixed(1), at, font:this.font});
          }
        }catch(e){}
        return orig.apply(this, arguments);
      };
    }
  }, PAD);
  await page.goto("file://"+path.join(ROOT,"index.html"));
  await page.waitForFunction(()=>window.REST, null, {timeout:240000});
  // and what is drawn while it runs: the lobby's screens, the arcade's, the chalkboard by the dartboard
  await page.evaluate(()=>{ REST.start(); });
  const frames=n=>page.evaluate(n=>new Promise(res=>{ let k=0; const f=()=>{ if(++k>=n) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); }), n);
  for(const [x,z,y] of [[2,0,0.5],[72,-216,-1.0],[74,-179.6,0.2]]){
    await page.evaluate(([x,z,y])=>REST.go(x,z,0,y), [x,z,y]); await frames(30); }
  await page.evaluate(()=>{ if(typeof DARTS!=="undefined" && DARTS.draw){ DARTS.newGame&&DARTS.newGame(); DARTS.draw(); } });
  const list=await page.evaluate(()=>window.__SIGNS);
  // one line per distinct (place, text)
  const seen=new Map();
  for(const s of list){ const k=s.at+"|"+s.str; if(!seen.has(k) || seen.get(k).over<s.over) seen.set(k, s); }
  const rows=[...seen.values()].sort((a,b)=>a.at.localeCompare(b.at, undefined, {numeric:true}));
  for(const s of rows) console.log(`${s.at.padEnd(26)} ${String(s.W+"x"+s.H).padEnd(9)} over ${String(s.over).padStart(5)}px${s.off>0?" (OFF "+s.off+")":""}  "${s.str}"  ${s.font}`);
  console.log(rows.length+" too close to an edge (pad "+PAD+")");
  await browser.close();
})();
