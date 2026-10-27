/* REST AREA · tools/walk.js
   Walks polylines the way the player does — surface height carried along,
   the body tested against every collider — and names the first thing that
   stops it. Every doorway in the world is on one of these routes.
     node tools/walk.js
   ONLY=regex walks just the routes, the seats and the stair tests whose names match it. */
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
  // the sidewalks (08): off the plaza's curb ramps north to the shelter and south to the pet area, round the
  // building's back, and off each end of the long walk
  "plaza to the shelter":    [[-14,-17.5],[-14,-20.5],[-13,-26],[-9,-36],[-1,-46],[7,-54],[11.3,-57],[13.6,-57]],
  "plaza to the pet area":   [[-14,17.5],[-14,20.5],[-12,28],[-6,40],[2,52],[7.5,62],[10.8,65.4],[12.6,66.6]],
  "round the building":      [[-4.4,-17.8],[-3.9,-17.8],[4,-20.6],[12,-20],[16,-10],[17,0],[16,10],[12,20],[4,20.6],[-3.9,17.8],[-4.4,17.8]],
  "walk's end to the shelter": [[-23.75,-107],[-23.75,-109.6],[-22.6,-111.6],[-18,-112.6],[-11,-109.5],[-4,-104],[6,-98.5],[13.5,-90],[18.6,-79],[19.2,-70],[15.4,-63.3],[15.4,-61.2]],
  "walk's end to the pets":  [[-23.75,73],[-23.75,75.6],[-21,78.5],[-12,79.5],[-1,76],[7,70.5],[11.2,67.9],[12.6,66.6]],
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
  "down to the basement":  {gate:true, pts:[[80,-174.2],[80,-177.4],[81.5,-176.8],[82.6,-176.8],[83.0,-176.8],[85.5,-176.8],[86.2,-176.8],[86.2,-178.4],[83.5,-178.4],[82.2,-178.3],[79.6,-178.3],[77.8,-179.5],[74.0,-179.5],[72.9,-179.6]]},
  // on through the dug-out, the door and the corridor, to the arcade under the hill
  "down to the arcade":    [[72.9,-179.6],[72.0,-182.6],[72.0,-183.5],[72.0,-184.2],[72.0,-186.5],[72.0,-210.0],[72.0,-212.0],[74.6,-212.8],[75.4,-215.0],[74.4,-216.0],[72.0,-216.2],[69.2,-216.0],[69.8,-217.7],[71.7,-217.7]],
  // the two steel doors in its east wall (12d): MECH 2; and the stores, the stair and the sub-basement under them,
  // the hallways out to the bunk room, the chair, the boiler room and the door at the end
  "into mech 2":           [[72.0,-191.0],[72.6,-191.0],[73.1,-191.0],[73.6,-191.0],[75.0,-190.6],[75.6,-190.0]],
  "down to the sub-basement": [[72.0,-203.5],[72.6,-203.5],[73.1,-203.5],[73.6,-203.5],[74.2,-203.5],[75.0,-203.6],[78.0,-203.6],[80.6,-203.6],[92.0,-203.6],[92.0,-205.0],
                           [92.0,-231.9],[84.0,-232.0],[63.0,-232.0],[62.8,-230.0],[62.8,-214.6],[62.8,-213.0],[63.0,-212.0],[63.0,-210.6]],
  "sub-basement, the chair": {y0:-4.2, pts:[[80.0,-232.0],[75.2,-232.0],[75.2,-229.0],[75.2,-227.4]]},
  "sub-basement, the boiler room": {y0:-4.2, pts:[[92.0,-203.6],[100.0,-203.6],[100.0,-195.0],[100.0,-186.0],[86.0,-186.0],[84.4,-185.6],[82.0,-184.6]]},
  "sub-basement, the door at the end": {y0:-4.2, pts:[[92.0,-230.0],[92.0,-236.0],[92.0,-241.0]]},
  // past the end: through JANITOR, round the corner, the old door, DANGER, to the wheel; and through it (open, as
  // the gate's route leaves every manual door) on to the catwalk, down the stair and along the boilers' fronts
  "sub-basement, the doors to the wheel": {y0:-4.2, pts:[[92.0,-236.0],[92.0,-241.0],[92.0,-242.3],[91.96,-243.0],[91.96,-246.7],[94.0,-246.7],[95.3,-246.7],[97.0,-246.7],
                           [98.6,-246.7],[98.6,-250.0],[98.6,-254.3],[98.6,-257.4]]},
  "the boiler hall":       {gate:true, y0:-4.2, pts:[[98.6,-254.0],[98.6,-257.4],[98.6,-258.3],[98.6,-259.3],[96.2,-259.26],[94.8,-259.26],[93.0,-259.26],[91.0,-259.26],
                           [90.6,-259.6],[90.6,-261.2],[90.6,-263.0],[90.6,-264.9],[94.0,-264.9],[99.0,-264.9],[104.0,-264.9],[108.4,-264.9],[108.4,-262.0],[95.0,-262.0]]},
  // the vending room on the island (13b): across the truck aisle on the stripes, in, round the machines, out the back to the cars
  "to the vending room":   [[-66,0.5],[-60.5,0.5],[-56.6,0.5],[-55.3,0.5],[-54.2,0.5],[-54.4,-1.9],[-52.0,-1.9],[-52.0,2.8],[-53.6,2.8],[-53.0,0.5],[-50.7,0.5],[-49.0,0.5],[-44.0,0.5]],
  // the walk-in trailer (10b), its doors swung open first: up the step, past the jack, up the aisle to the load bar
  "into the trailer":      {pre:"TRAILER_RT.target=1; TRAILER_RT.open=1; updateTrailer(0.01,0,0);",
                            pts:[[-69.55,-1.71],[-70.94,-4.14],[-71.59,-5.38],[-72.4,-6.18],[-73.94,-8.87],[-73.88,-9.37],[-76.76,-14.4]]},
  // the median crossovers (08), on foot from the northbound shoulder to the southbound's
  "crossover, north":      [[-104.5,-250],[-118,-250],[-135,-250],[-152,-250],[-166,-250]],
  "crossover, beyond":     [[-104.5,-520],[-118,-520],[-135,-520],[-152,-520],[-166,-520]],
  "crossover, south":      [[-104.5,470],[-118,470],[-135,470],[-152,470],[-166,470]],
  // Edinboro (08b): up the off-ramp, along US 6N and over the bridge, down the on-ramp to southbound
  "edinboro off-ramp":     "EDIN.off",
  "us 6n over the bridge": [[-8,-1201.8],[-60,-1201.8],[-80,-1201.8],[-112,-1201.8],[-135,-1202.5],[-160,-1201.8],[-192,-1201.8],[-262,-1201.8]],
  "edinboro on-ramp":      "EDIN.on",
  // and the north pair: off US 6N down onto northbound, and up off southbound onto US 6N
  "edinboro on-ramp north":  "EDIN.onN",
  "edinboro off-ramp south": "EDIN.offS",
  // the service track on past the plant, down through the woods to its turnaround and the game lands gate (13c)
  "down the service track":  [[86,122],[89.5,137],[93,152],[96,168],[99,184],[101.5,201],[104,218],[106,235],[108,252],[110,270],[110.5,288],[110.5,300],[110.5,309]],
  // the water and the sewage (13c): down the spur, in at the gate, the control building, up on the tanks
  "down to the plant":     {gate:true, pts:[[86.4,121.6],[96,116],[106,110.6],[113.5,107.2],[117,106.45],[119.5,106.45],[122.7,108.5],[122.7,110.4],[122.7,112.1],[122.7,113.3],[124.8,115.6]]},
  "the aeration catwalk":  [[139,104.2],[139,103.0],[139,101.2],[139,100.4],[139,96.0],[139,92.8]],
  "the clarifier bridge":  [[152.6,104.2],[152.6,103.0],[152.6,101.2],[152.6,99.0],[152.6,97.2]],
  "onto the sand filter":  [[136,104.2],[136,104.86],[136,105.6],[136,108.5],[139.5,111.0]],
  "to the well house":     [[79.6,97.4],[74.5,98.4],[70.2,99.4],[69.4,99.48],[68.7,99.48],[67.9,99.48],[66.6,99.9]],
  // Edinboro's exit (14k): in at the fuel stop's door, round the aisles to the coolers and the coffee;
  // up the farm lane, over the porch, through the front room to the kitchen and out the back
  "into the fuel stop":    [[-26,-1238],[-26,-1247],[-26,-1249.5],[-26,-1251.5],[-24.0,-1252.5],[-24.0,-1258],[-24.0,-1262.05],[-18,-1262.05],[-15,-1258]],
  "into the farmhouse":    [[150,-1192],[150,-1178],[138,-1172.3],[124,-1172.3],[123.5,-1171.8],[123.5,-1170.0],[123.5,-1168.4],[123.5,-1166.5],[123.5,-1165.1],[123.6,-1163.1],[121.6,-1163.1],[123.6,-1163.1],[123.8,-1159.05],[126.2,-1159.05],[127.46,-1157.4],[127.46,-1156.0],[127.46,-1155.0],[127.46,-1153.6]],
  // and up its stair from the hall to each room off the upper hall (the doors stand half open)
  "farmhouse, front bedroom": [[123.5,-1170.0],[123.5,-1168.4],[123.5,-1166.5],[123.5,-1165.1],[123.7,-1165.1],[124.85,-1165.1],[124.85,-1160.1],[123.5,-1160.1],[123.5,-1161.62],[121.75,-1161.62]],
  "farmhouse, kids' room":  [[123.5,-1170.0],[123.5,-1168.4],[123.5,-1166.5],[123.5,-1165.1],[123.7,-1165.1],[124.85,-1165.1],[124.85,-1160.1],[123.5,-1160.1],[123.5,-1159.54],[121.75,-1159.54]],
  "farmhouse, bathroom":    [[123.5,-1170.0],[123.5,-1168.4],[123.5,-1166.5],[123.5,-1165.1],[123.7,-1165.1],[124.85,-1165.1],[124.85,-1160.1],[124.85,-1159.54],[126.4,-1159.54],[127.0,-1158.4]],
  "farmhouse, sewing room": [[123.5,-1170.0],[123.5,-1168.4],[123.5,-1166.5],[123.5,-1165.1],[123.7,-1165.1],[124.85,-1165.1],[124.85,-1160.1],[123.5,-1160.1],[123.7,-1165.14],[126.9,-1165.14],[127.4,-1163.6],[130.66,-1161.7],[130.66,-1160.1],[130.0,-1159.4]],
  // the barn: up the lane, up the bank, in at the big doors, round the floor and the stalls
  "into the barn":          [[150,-1192],[150,-1160],[152,-1150],[156,-1142],[159.5,-1142],[164,-1142],[168.5,-1142],[172.0,-1142],[178,-1142],[181,-1140.6],[181,-1135.6],[186,-1135.6],[186,-1140.6],[192.0,-1141.0]],
  // the chapel (14l): up the walk from US 6N, the steps, in at the red doors, up the aisle to the chancel; and the
  // graveyard, in at the gate in its wall and along between two rows of stones
  "into the chapel":        [[88.5,-1204],[88.5,-1210],[88.5,-1219.6],[88.5,-1220.2],[88.5,-1221.2],[88.5,-1222.1],[88.5,-1222.6],[88.5,-1226],[88.5,-1233.6],[88.5,-1234.2],[88.5,-1235.3]],
  // and round the back of it, down the outside stair, in at the white door to the fellowship hall and through it to
  // the kitchen counter
  "down to the fellowship hall": [[88.5,-1204],[88.5,-1213.5],[80.5,-1216],[80.5,-1244.6],[86.0,-1244.6],[86.0,-1243.0],[86.0,-1242.6],[86.0,-1241.0],
                           [86.0,-1239.6],[86.0,-1238.6],[86.0,-1237.9],[86.0,-1237.2],[86.0,-1234.4],[88.5,-1234.0],[89.0,-1233.4],[89.0,-1226.0],[88.97,-1225.0],[88.97,-1223.6],[86.5,-1223.6]],
  "into the graveyard":     [[100.9,-1204],[100.9,-1215],[100.9,-1219.7],[100.9,-1221],[100.9,-1228.4],[105,-1228.4],[110,-1228.4]],
  // US 6N on east through the woods (14m): in at the fireworks outlet's glass doors and down an aisle
  "east to the fireworks store": [[600,-1201],[700,-1201],[900,-1201],[913.96,-1215],[913.96,-1255],[913.96,-1257.4],[913.96,-1258.6],[913.96,-1260.6],[905.6,-1260.6],[905.6,-1265.4]],
  // the lakeside park (14n): off the street through the lot, down the path to the shore and out to the end of a dock
  "out on the dock":       [[1240,-1201],[1300,-1201],[1300,-1216],[1300,-1219.5],[1300.5,-1232],[1301,-1250],[1300,-1289.5],[1290,-1290],[1289.8,-1292.5],[1289.8,-1293.9],[1289.8,-1305],[1289.8,-1317.2],[1286,-1317.2]],
  // the fuel stop's restroom, through the grey door by the slushies
  "fuel stop restroom":     [[-15,-1258],[-13.5,-1255.85],[-12.6,-1255.85],[-11.6,-1255.85],[-10.4,-1256.6],[-10.4,-1254.5]],
  "to the water tank":     [[88.4,129.0],[81,133.5],[74.6,138.2],[73.2,139.2]],
  // the Weirs' machine shed (14k): from the yard in under the header, past the lawn tractor to the bench; along the bays
  "into the machine shed":  [[150,-1135],[150,-1123],[139.0,-1121.5],[139.0,-1119.0],[139.0,-1109.0]],
  "along the machine shed": [[150,-1123],[150,-1120.6],[158.14,-1120.6],[166.0,-1120.6],[170.0,-1120.6],[170.0,-1112.0]],
  // the substation behind the fuel stop (14s): up the lane from the lot, in at the gate, into the control house; round the yard
  "up to the substation":   {gate:true, pts:[[8,-1250],[11.5,-1268],[11.5,-1372],[11.5,-1376],[11.5,-1379],[-4.4,-1384.4],[-5.6,-1384.4],[-6.0,-1384.4],[-6.4,-1384.4],[-9.0,-1384.4],[-11.5,-1383.0]]},
  "round the substation yard": {gate:true, pts:[[11.5,-1378],[24,-1378],[34,-1378],[34,-1395],[34,-1414],[-14,-1414],[-14,-1392],[-2,-1392],[-2,-1384],[11.5,-1379]]},
  // Lake Street's garages (14n) with their doors up: in past the car in the drive of the ranch by the park
  "into a garage on lake street": {gate:true, pts:[[1270.0,-1190.0],[1269.0,-1183.0],[1268.5,-1181.0],[1268.5,-1177.0]]},
  // the fireworks outlet's middle roll-up door (14m), raised
  "through the roll-up door": {gate:true, pts:[[901.6,-1250],[901.6,-1256],[901.6,-1258.2],[901.6,-1262]]},
  // the brewery (14r): in the front door to the bar, out a garage door to the garden; round the east end down to the deck
  "into the brewery":       [[1447,-1215],[1447,-1224],[1446.0,-1225.0],[1446.0,-1227.6],[1445,-1228.2],[1445,-1229.0],[1445,-1231.5],[1446.0,-1234.9],[1452.6,-1234.9]],
  "out to the beer garden": [[1445,-1231.5],[1446.0,-1234.9],[1446.2,-1239.5],[1448.2,-1240.5],[1448.2,-1243.0],[1448.2,-1245.0],[1462.0,-1246.0]],
  "down to the deck":       [[1461,-1228.4],[1461.8,-1243.5],[1462.6,-1252],[1460.5,-1262],[1459,-1266.5],[1457.5,-1268.5],[1457.5,-1276.5],[1428,-1276.5],[1424.6,-1278],[1424.6,-1296],[1445,-1296.5]],
};
(async()=>{
  const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const p=await b.newPage({viewport:{width:320,height:200}});
  p.on("pageerror", e=>console.log("[pageerror]", e.message));
  await p.route("**/three.min.js", r=>r.fulfill({path:path.join(ROOT,"tools","three.min.js")}));
  await p.route(/fonts\./, r=>r.fulfill({status:200, contentType:"text/css", body:""}));
  await p.goto("file://"+path.join(ROOT,"index.html"), {timeout:240000});
  await p.waitForFunction(()=>window.REST,null,{timeout:120000});
  // the houses on Lake Street (14o) lay out their own routes, through their own transforms, as they build
  Object.assign(ROUTES, await p.evaluate(()=>typeof LAKE_HOUSES!=="undefined" ? LAKE_HOUSES.routes : {}));
  // ONLY=regex runs just the routes, seats and stair tests whose names match it (for working on one place)
  const out=await p.evaluate(([ROUTES, only])=>{
    const res={}, ONLY=only ? new RegExp(only, "i") : null, want=n=>!ONLY || ONLY.test(n);
    const PACES=n=>want(n) ? [[null,"walk"],["ShiftLeft","run"],["KeyQ","sprint"]] : [];
    const hit=(x,z,f)=>{
      const lo=f+0.12, hi=f+1.72, r=0.34, all=REST.cols.concat(REST.colsDyn);
      return all.filter(c=>x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r&&hi>c.y0&&lo<c.y1)
                .map(c=>"["+[c.x0,c.x1,c.z0,c.z1,c.y0,c.y1].map(v=>v.toFixed(2)).join(",")+"]");
    };
    for(const name in ROUTES){ if(!want(name)) continue;
      // the gate stands open for its own route, the way you would leave it
      const og=name==="through the gate" || !!ROUTES[name].gate;
      for(const d of REST.doors) if(d.manualOnly){ d.manual = og ? 1 : 0; d.open = og ? 1 : 0;
        if(d.blockCol) d.blockCol.y1 = og ? d.blockCol.y0-1 : d.blockTop; }
        // and a door that opens itself as you come up to it (the arcade's sliding pair) is open
        else if(d.blockCol){ d.open=1; d.blockCol.y1=d.blockCol.y0-1; }
      const R0=ROUTES[name], named={TRAIL:TRAIL, "EDIN.off":EDIN.off, "EDIN.on":EDIN.on, "EDIN.onN":EDIN.onN, "EDIN.offS":EDIN.offS}[R0];
      let P=named ? named.map(q=>[q.x,q.z]) : (R0.gate || R0.y0!==undefined) ? R0.pts : R0;
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
      let f=REST.surf(P[0][0],P[0][1],R0.y0!==undefined ? R0.y0 : 0.2), msg="ok", minY=1e9, maxY=-1e9;
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
    if(want("seats")) REST.seats.forEach((s,i)=>{ REST.go(s.x+Math.sin(s.yaw)*0.9, s.z+Math.cos(s.yaw)*0.9, s.yaw, s.y);
      REST.sit(); REST.sim(40); REST.keys.KeyW=false; REST.sit(); REST.sim(5);
      if(REST.probe(REST.player.pos.x, REST.player.pos.z, REST.player.feetY)) bad.push(s.label+" @"+s.x.toFixed(1)+","+s.z.toFixed(1)); });
    if(want("seats")) res["seats ("+REST.seats.length+")"]= bad.length ? "stuck after: "+bad.join("; ") : "ok";
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
    for(const [m,lab] of PACES("stairs, keys held")){
      const u=drive(UP,m,0.2), d=drive(DOWN,m,upF+0.05);
      res["stairs, keys held ("+lab+")"] = typeof u==="string" ? "up: "+u : u<upF-0.2 ? "up: never reached the hall ("+u.toFixed(2)+")"
                                     : typeof d==="string" ? "down: "+d : "ok"; }
    // the basement stair the same way, down and back up
    { const TOP=[[82.6,-176.8],[83.0,-176.8],[85.5,-176.8],[86.3,-176.8]], BOT=TOP.slice().reverse(), fy=REST.surf(82.6,-176.8,3.0);
      for(const [m,lab] of PACES("basement stair, keys held")){
        const d=drive(TOP,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT,m,lo); REST.sim(40);
        res["basement stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>0.3 ? "down: never reached the floor ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and the corridor's six steps down from the dug-out
    { const TOP2=[[72.0,-182.6],[72.0,-183.5],[72.0,-184.2],[72.0,-187.0]], BOT2=TOP2.slice().reverse(), fy=REST.surf(72.0,-182.6,0.3);
      for(const [m,lab] of PACES("corridor stair, keys held")){
        const d=drive(TOP2,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT2,m,lo); REST.sim(40);
        res["corridor stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>fy-1.0 ? "down: never reached the corridor ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and the stair down to the sub-basement (12d), all eighteen risers, and back up
    { const TOP3=[[73.6,-203.6],[74.6,-203.6],[75.2,-203.6],[80.9,-203.6]], BOT3=TOP3.slice().reverse(), fy=REST.surf(73.6,-203.6,0.2), sb=SUBBASE.y;
      for(const [m,lab] of PACES("sub-basement stair, keys held")){
        const d=drive(TOP3,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT3,m,lo); REST.sim(40);
        res["sub-basement stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>sb+0.05 ? "down: never reached the bottom ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and the boiler hall's (12e), from the catwalk down both flights to the floor, and back up
    if(typeof BOILERS!=="undefined" && BOILERS.stair){ const TOP4=BOILERS.stair.top, BOT4=TOP4.slice().reverse(), fy=BOILERS.stair.SB, hf=BOILERS.stair.HF;
      for(const [m,lab] of PACES("boiler hall stair, keys held")){
        const d=drive(TOP4,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT4,m,lo); REST.sim(40);
        res["boiler hall stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>hf+0.05 ? "down: never reached the floor ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and the farmhouse stair (14k), up from the hall and back down
    { const UP2=[[123.6,-1165.1],[124.85,-1165.1],[124.85,-1160.1]], DN2=UP2.slice().reverse(), top=REST.surf(124.85,-1160.1,EDIN.y+5), lo0=REST.surf(123.6,-1165.1,EDIN.y+1);
      for(const [m,lab] of PACES("farmhouse stair, keys held")){
        const u=drive(UP2,m,lo0); REST.sim(40); const hi=REST.player.feetY, d=drive(DN2,m,hi); REST.sim(40);
        res["farmhouse stair, keys held ("+lab+")"] = typeof u==="string" ? "up: "+u : hi<top-0.1 ? "up: never reached the hall ("+hi.toFixed(2)+")"
                                         : typeof d==="string" ? "down: "+d : REST.player.feetY>lo0+0.1 ? "down: still up at "+REST.player.feetY.toFixed(2) : "ok"; } }
    // and the chapel's outside stair down to the fellowship hall (14l), in at its door, and back up
    { const TOP4=[[86.0,-1244.0],[86.0,-1242.0],[86.0,-1238.6],[86.0,-1236.6]], BOT4=TOP4.slice().reverse(), fy=REST.surf(86.0,-1244.0,EDIN.y+0.5);
      for(const [m,lab] of PACES("hall stair, keys held")){
        const d=drive(TOP4,m,fy); REST.sim(40); const lo=REST.player.feetY, u=drive(BOT4,m,lo); REST.sim(40);
        res["hall stair, keys held ("+lab+")"] = typeof d==="string" ? "down: "+d : lo>fy-2.0 ? "down: never reached the hall ("+lo.toFixed(2)+")"
                                         : typeof u==="string" ? "up: "+u : REST.player.feetY<fy-0.05 ? "up: never got back up ("+REST.player.feetY.toFixed(2)+")" : "ok"; } }
    // and each house's stair on Lake Street (14o), up from its hall and back down
    for(const S of (typeof LAKE_HOUSES!=="undefined" ? LAKE_HOUSES.stairs : [])){ const UPh=S.up, DNh=UPh.slice().reverse();
      for(const [m,lab] of PACES(S.name)){
        const u=drive(UPh,m,S.lo); REST.sim(40); const hi=REST.player.feetY, d=drive(DNh,m,hi); REST.sim(40);
        res[S.name+", keys held ("+lab+")"] = typeof u==="string" ? "up: "+u : hi<S.hi-0.1 ? "up: never reached the top ("+hi.toFixed(2)+")"
                                         : typeof d==="string" ? "down: "+d : REST.player.feetY>S.lo+0.1 ? "down: still up at "+REST.player.feetY.toFixed(2) : "ok"; } }
    // and the trailer's step the same way, at every pace, then back down it
    if(want("trailer step")){ (0,eval)("TRAILER_RT.target=1; TRAILER_RT.open=1; updateTrailer(0.01,0,0);");
      const IN=ROUTES["into the trailer"].pts.slice(0,4), OUT=IN.slice().reverse(), fl=REST.surf(IN[3][0],IN[3][1],2);
      for(const [m,lab] of PACES("trailer step, keys held")){
        const u=drive(IN,m,0.2), d=drive(OUT,m,fl+0.05); REST.sim(40);        // (and let the feet settle)
        res["trailer step, keys held ("+lab+")"] = typeof u==="string" ? "in: "+u : u<fl-0.05 ? "in: never reached the floor ("+u.toFixed(2)+")"
                                         : typeof d==="string" ? "out: "+d : REST.player.feetY>0.2 ? "out: still up at "+REST.player.feetY.toFixed(2) : "ok"; } }
    return res;
  }, [ROUTES, process.env.ONLY||""]);
  let fail=0;
  for(const k in out){ console.log((out[k].startsWith("ok")?"  ok   ":"  FAIL ")+k.padEnd(28)+out[k]); if(!out[k].startsWith("ok")) fail++; }
  await b.close(); process.exit(fail?1:0);
})();
