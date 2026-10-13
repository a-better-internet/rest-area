/* REST AREA · tools/walk.js
   Walks polylines the way the player does — surface height carried along,
   the body tested against every collider — and names the first thing that
   stops it. Every doorway in the world is on one of these routes.
     node tools/walk.js            */
const path=require("path"); const { chromium } = require("playwright");
const ROOT=path.resolve(__dirname,"..");
const ROUTES={
  "plaza to lobby":      [[-14,0],[-7,0],[-2,0.4]],
  "lobby to men's":      [[-0.4,-2],[-0.4,-6.6],[-2.6,-6.7],[-3.3,-9.0],[-3.3,-11.5],[1.5,-11.6]],
  "men's accessible":    [[2.67,-11.6],[2.67,-13.0],[2.0,-13.1]],
  "lobby to women's":    [[-0.4,2],[-0.4,6.6],[-2.6,6.7],[-3.3,9.0],[-3.3,11.5],[2.67,11.6],[2.67,13.0],[2.0,13.1]],
  "lobby to family":     [[3.4,-2.5],[4.6,-4.6],[4.68,-6.4],[5.0,-7.0]],
  "lobby to office":     [[4.68,2.5],[4.68,6.3],[5.9,6.6]],
  "lobby out the back":  [[2,1.7],[5.2,1.7],[6.5,1.7],[6.5,0],[15,0],[18,0]],
  "janitor's door":      [[9,-11.5],[7.2,-11.5],[5.0,-11.5],[4.8,-10.0]],
  "mechanical door":     [[9,11.5],[7.2,11.5],[5.2,11.5]],
  "lot to walk":         [[-36,30],[-27,30],[-23,30],[-23,-30]],
  "grove":               [[-14,-20],[-13,-30],[-2,-48],[12,-78]],
  "to the shelter":      [[10,-58],[17.5,-56.2]],
  "drive to gate":       [[-25,-142],[0,-150],[40,-158],[57,-169]],
  "through the gate":    [[57,-169],[64,-169],[70,-170.5],[80,-174.2],[80,-178.5]],
  "the path out back":   "TRAIL",
  "into the camp":       [[278,49.6],[281,47.6],[285.5,47.6],[289.5,48.6]],
  "the tape to the house":{seek:[[293,61],[312,151.5]], then:[[312,153.7],[312,155.3]]},
  "into the old house":   [[312,155.3],[311.9,157.4],[311.9,158.6],[309.5,159.6],[308.3,158.6]],
  "parlour to kitchen":   [[311.9,158.6],[311.6,160.15],[313.4,160.15],[314.85,161.2],[314.85,162.8],[314.85,163.9],[314.85,164.8]],
};
(async()=>{
  const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const p=await b.newPage({viewport:{width:320,height:200}});
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")}));
  await p.route(/fonts\./, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"));
  await p.waitForFunction(()=>window.REST,null,{timeout:120000});
  const out=await p.evaluate((ROUTES)=>{
    const res={};
    const hit=(x,z,f)=>{
      const lo=f+0.12, hi=f+1.72, r=0.34, all=REST.cols.concat(REST.colsDyn);
      return all.filter(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r&&hi>c.y0&&lo<c.y1)
                .map(c=>"["+[c.x0,c.x1,c.z0,c.z1,c.y0,c.y1].map(v=>v.toFixed(2)).join(",")+"]");
    };
    for(const name in ROUTES){
      // the gate stands open for its own route, the way you would leave it
      for(const d of REST.doors) if(d.manualOnly){ d.manual = name==="through the gate" ? 1 : 0; d.open = name==="through the gate" ? 1 : 0;
        if(d.blockCol) d.blockCol.y1 = name==="through the gate" ? d.blockCol.y0-1 : d.blockTop; }
      let P=ROUTES[name]==="TRAIL" ? TRAIL.map(q=>[q.x,q.z]) : ROUTES[name];
      // off the paths there is no fixed line: find one through the trunks on
      // a quarter-metre grid (breadth first, eight ways), then walk it
      if(P.seek){ const [A,G]=P.seek, S=0.25, pad=12;
        const gx0=Math.min(A[0],G[0])-pad, gz0=Math.min(A[1],G[1])-pad;
        const NX=Math.ceil((Math.abs(G[0]-A[0])+2*pad)/S), NZ=Math.ceil((Math.abs(G[1]-A[1])+2*pad)/S);
        const idx=(i,j)=>j*NX+i, prev=new Int32Array(NX*NZ).fill(-1), seen=new Uint8Array(NX*NZ), fl=new Float32Array(NX*NZ);
        const cell=p=>[Math.round((p[0]-gx0)/S), Math.round((p[1]-gz0)/S)];
        const [si,sj]=cell(A), [ti,tj]=cell(G); const q=[idx(si,sj)]; seen[q[0]]=1; fl[q[0]]=REST.surf(A[0],A[1],5);
        let found=false;
        for(let h=0; h<q.length && !found; h++){ const c=q[h], ci=c%NX, cj=(c/NX)|0;
          for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
            const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=NX||nj>=NZ) continue; const n=idx(ni,nj); if(seen[n]) continue; seen[n]=1;
            const x=gx0+ni*S, z=gz0+nj*S, f=REST.surf(x,z,fl[c]);
            if(f-fl[c]>0.5 || REST.probe(x,z,f)) continue;
            fl[n]=f; prev[n]=c; q.push(n); if(ni===ti && nj===tj){ found=true; break; } } }
        if(!found){ res[name]="NO WAY THROUGH"; continue; }
        const out=[]; for(let c=idx(ti,tj); c>=0; c=prev[c]) out.push([gx0+(c%NX)*S, gz0+((c/NX)|0)*S]);
        out.reverse(); out[0]=A.slice();
        P=out.concat([G], P.then||[]); }
      let f=REST.surf(P[0][0],P[0][1],0.2), msg="ok", minY=1e9, maxY=-1e9;
      outer: for(let i=1;i<P.length;i++){
        const [x0,z0]=P[i-1], [x1,z1]=P[i], L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.ceil(L/0.08));
        for(let k=0;k<=n;k++){
          const x=x0+(x1-x0)*k/n, z=z0+(z1-z0)*k/n;
          const t=REST.surf(x,z,f);
          if(t-f>0.62){ msg="step too high at "+x.toFixed(2)+","+z.toFixed(2)+" ("+f.toFixed(2)+"→"+t.toFixed(2)+")"; break outer; }
          f=t; minY=Math.min(minY,f); maxY=Math.max(maxY,f);
          if(REST.probe(x,z,f)){ msg="BLOCKED at "+x.toFixed(2)+","+z.toFixed(2)+" y "+f.toFixed(2)+" by "+hit(x,z,f).join(" "); break outer; }
        }
      }
      res[name]=msg+"   (floor "+minY.toFixed(2)+".."+maxY.toFixed(2)+")";
    }
    // and every seat: can you sit, and get up again somewhere free?
    let bad=[];
    REST.seats.forEach((s,i)=>{ REST.go(s.x+Math.sin(s.yaw)*0.9, s.z+Math.cos(s.yaw)*0.9, s.yaw, s.y);
      REST.sit(); REST.sim(40); REST.keys.KeyW=false; REST.sit(); REST.sim(5);
      if(REST.probe(REST.player.pos.x, REST.player.pos.z, REST.player.feetY)) bad.push(s.label+" @"+s.x.toFixed(1)+","+s.z.toFixed(1)); });
    res["seats ("+REST.seats.length+")"]= bad.length ? "stuck after: "+bad.join("; ") : "ok";
    return res;
  }, ROUTES);
  let fail=0;
  for(const k in out){ console.log((out[k].startsWith("ok")?"  ok   ":"  FAIL ")+k.padEnd(22)+out[k]); if(!out[k].startsWith("ok")) fail++; }
  await b.close(); process.exit(fail?1:0);
})();
