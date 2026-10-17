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
  "the tape to the house":{seek:[[293,61],[312,150.8]], then:[[312,152.3],[312,153.9],[312,155.2]]},
  "into the old house":   [[312,155.2],[311.9,156.6],[311.0,158.0],[309.0,159.5],[308.6,160.6]],
  "parlour to kitchen":   [[311.9,156.6],[312.4,160.6],[314.0,160.6],[316.3,161.9],[316.65,163.6],[316.65,165.35]],
  // the maintenance garage: across the lawn to the yard, in at the man door, round the shop
  "to the garage yard":    [[17,0],[19.5,12],[22,24],[27.5,30.5],[30.6,33.7]],
  "into the garage":       [[30.6,33.7],[32.0,33.68],[33.6,33.68],[36.0,34.9],[37.6,35.6],[39.9,34.6],[40.2,31.4],[39.9,29.6],[36.0,29.45],[33.6,29.45]],
  "garage to the cot":     [[33.6,33.68],[34.0,36.1]],
  "out a bay door":        [[33.6,29.45],[31.8,29.45],[29.0,29.45],[26.0,26.0]],
  "the yard and the bin":  [[26.0,26.0],[28.8,24.4],[24.6,24.0],[23.9,40.0],[24.4,43.9],[28.4,44.0],[38.4,43.0]],
  "the track to the gate": [[38.4,43.0],[41.5,44.2],[44.6,46.0]],
  "round the gate":        {seek:[[44.6,46.0],[52.5,50.0]], then:[]},
  // the stair, from its landing inside the front wall, and every room off the hall
  "up the old stairs":     [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4],[313.0,160.4],[309.05,160.4],[309.05,159.0],[308.9,158.3]],
  "upstairs sewing room":  [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4],[313.45,160.4],[313.45,159.4],[312.5,158.7]],
  "upstairs child's room": [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4],[309.05,160.4],[309.05,161.8],[307.9,162.3]],
  "upstairs box room":     [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4],[311.75,160.4],[311.75,161.4]],
  "upstairs bathroom":     [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4],[314.05,160.4],[314.0,162.0],[315.8,162.5]],
  "back down the stairs":  [[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.3],[317.45,156.15],[316.0,156.3]],
  // the generator house's basement (12b): in at its door, through the grey door, down the stair, round into the room
  "down to the basement":  [[80,-174.2],[80,-177.4],[81.5,-176.8],[82.6,-176.8],[83.0,-176.8],[85.5,-176.8],[86.2,-176.8],[86.2,-178.5],[83.5,-178.5],[82.2,-178.3],[79.6,-178.3]],
  // the walk-in trailer (10b), its doors swung open first: up the step, past the jack, up the aisle to the load bar
  "into the trailer":      {pre:"TRAILER_RT.target=1; TRAILER_RT.open=1; updateTrailer(0.01,0,0);",
                            pts:[[-69.55,-1.71],[-70.94,-4.14],[-71.59,-5.38],[-72.4,-6.18],[-73.94,-8.87],[-73.88,-9.37],[-76.76,-14.4]]},
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
      if(P.pre){ (0,eval)(P.pre); P=P.pts; }
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
    // the stair once more with the real controller and the keys held down, at
    // every pace: the eased feet must not lose the treads on the way up
    const drive=(P, mod, y0)=>{
      REST.go(P[0][0],P[0][1],0,y0); for(const k in REST.keys) REST.keys[k]=false; if(mod) REST.keys[mod]=true;
      let top=-1e9;
      for(let i=1;i<P.length;i++){ let t=0, last=1e9;
        for(;;){ const dx=P[i][0]-REST.player.pos.x, dz=P[i][1]-REST.player.pos.z, d=Math.hypot(dx,dz);
          if(d<0.12) break;
          REST.player.yaw=Math.atan2(-dx,-dz); REST.keys.KeyW=true; REST.sim(1); t++;
          top=Math.max(top, REST.player.feetY);
          if(t%30===0){ if(last-d<0.02 || t>1200){ for(const k in REST.keys) REST.keys[k]=false;
            return "stuck at "+REST.player.pos.x.toFixed(2)+","+REST.player.pos.z.toFixed(2)+" y "+REST.player.feetY.toFixed(2); } last=d; } } }
      for(const k in REST.keys) REST.keys[k]=false;
      return top;
    };
    const UP=[[311.9,156.6],[313.2,156.8],[316.0,156.3],[317.45,156.15],[317.45,160.4]], DOWN=[[317.45,160.4],[317.45,156.15],[316.0,156.3],[313.2,156.8],[311.9,156.6]];
    const upF=REST.surf(317.45,160.4,5);
    for(const [m,lab] of [[null,"walk"],["ShiftLeft","run"],["KeyQ","sprint"]]){
      const u=drive(UP,m,0.2), d=drive(DOWN,m,upF+0.05);
      res["stairs, keys held ("+lab+")"] = typeof u==="string" ? "up: "+u : u<upF-0.2 ? "up: never reached the hall ("+u.toFixed(2)+")"
                                     : typeof d==="string" ? "down: "+d : "ok"; }
    // the basement stair the same way, down and back up
    { const TOP=[[82.6,-176.8],[83.0,-176.8],[85.5,-176.8],[86.3,-176.8]], BOT=TOP.slice().reverse(), fy=REST.surf(82.6,-176.8,3.0);
      for(const [m,lab] of [[null,"walk"],["ShiftLeft","run"],["KeyQ","sprint"]]){
        const d=drive(TOP,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT,m,lo); REST.sim(40);
        res["basement stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>0.3 ? "down: never reached the floor ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and the trailer's step the same way, at every pace, then back down it
    { (0,eval)("TRAILER_RT.target=1; TRAILER_RT.open=1; updateTrailer(0.01,0,0);");
      const IN=ROUTES["into the trailer"].pts.slice(0,4), OUT=IN.slice().reverse(), fl=REST.surf(IN[3][0],IN[3][1],2);
      for(const [m,lab] of [[null,"walk"],["ShiftLeft","run"],["KeyQ","sprint"]]){
        const u=drive(IN,m,0.2), d=drive(OUT,m,fl+0.05); REST.sim(40);        // (and let the feet settle)
        res["trailer step, keys held ("+lab+")"] = typeof u==="string" ? "in: "+u : u<fl-0.05 ? "in: never reached the floor ("+u.toFixed(2)+")"
                                         : typeof d==="string" ? "out: "+d : REST.player.feetY>0.2 ? "out: still up at "+REST.player.feetY.toFixed(2) : "ok"; } }
    return res;
  }, ROUTES);
  let fail=0;
  for(const k in out){ console.log((out[k].startsWith("ok")?"  ok   ":"  FAIL ")+k.padEnd(28)+out[k]); if(!out[k].startsWith("ok")) fail++; }
  await b.close(); process.exit(fail?1:0);
})();
