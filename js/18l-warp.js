"use strict";
/* REST AREA · 18l-warp.js
   the warp list, for testing: a key to put you straight down anywhere that matters
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18l · WARP
   ` (the key left of 1) opens a list of places; a digit or a letter puts you
   there, standing, looking at it. ` or Esc shuts it. You are got out of a
   car, off the boat, out of the drone, up out of a seat and off a ladder
   first. It is not on the controls card: it is for checking things, not
   for playing. Each place gives its floor from what built it (the arcade's
   room, the sub-basement, the tower's catwalk) or finds it under a height.
   Keys come through 17's keydown chain (WARP.key) ahead of everything.
   ---------------------------------------------------------------------- */
const WARP=(function(){
  const W={open:false};
  const g=(x, z, h)=>surfaceY(x, z, groundY(x, z)+(h===undefined ? 1.0 : h));
  // name, x, z, which way you face (0 is north, -z; PI/2 west), and the floor under you
  const P=[
    ["THE LOBBY",                 0.0,     2.0,    0.0,        x=>g(x[1], x[2])],
    ["THE CAR LOT",             -36.0,    22.0,    0.0,        x=>g(x[1], x[2])],
    ["THE VENDING ROOM",        -66.0,     0.5,   -Math.PI/2,  x=>g(x[1], x[2])],
    ["THE GARAGE",   30.6,    33.7,    0.0,        x=>g(x[1], x[2])],
    ["THE DUG-OUT (DARTS)",      73.6,  -179.6,    Math.PI/2,  x=>surfaceY(x[1], x[2], SUB_G-2.2)],
    ["THE ARCADE",               72.0,  -212.4,    0.0,        x=>ARCADE.room ? ARCADE.room.y : g(x[1], x[2], -3)],
    ["THE SUB-BASEMENT",         80.0,  -232.0,    0.0,        x=>SUBBASE.y],
    ["THE BOILER HALL",          99.0,  -268.0,    0.0,        x=>SUBBASE.y-5.0],
    ["THE TREATMENT PLANT",      86.4,   121.6,   -Math.PI/2,  x=>g(x[1], x[2])],
    ["THE CAMP",   278.0,    49.6,   -Math.PI/2,  x=>g(x[1], x[2])],
    ["THE OLD HOUSE",           312.0,   153.0,    Math.PI,    x=>g(x[1], x[2])],
    ["I-79 CROSSOVER",-104.5, -250.0,  0.0,        x=>g(x[1], x[2])],
    ["THE US 6N BRIDGE", -8.0, -1201.8, -Math.PI/2,  x=>g(x[1], x[2], 9)],
    ["THE FUEL STOP",           -26.0, -1238.0,    0.0,        x=>g(x[1], x[2])],
    ["THE TOWER CATWALK", -25.6, -1318.0,   -Math.PI/2,  x=>WATERTOWER.catwalk],
    ["EDINBORO SUBSTATION",  11.5, -1372.0,    0.0,        x=>g(x[1], x[2])],
    ["THE WEIR FARM",           150.0, -1192.0,    0.0,        x=>g(x[1], x[2])],
    ["THE CHAPEL",               88.5, -1204.0,    Math.PI,    x=>g(x[1], x[2])],
    ["THE FIREWORKS STORE",     901.6, -1250.0,    0.0,        x=>g(x[1], x[2])],
    ["LAKE STREET",            1270.0, -1190.0,    0.0,        x=>g(x[1], x[2])],
    ["THE DRIVEWAY HOOP",    0.0,     0.0,    0.0,        null],
    ["THE PARK DOCKS", 1300.0, -1240.0,    0.0,        x=>g(x[1], x[2])],
    ["THE DOG PARK",           1068.4, -1203.0,    0.0,        x=>g(x[1], x[2])],
    ["THE BREWERY",            1447.0, -1215.0,    0.0,        x=>g(x[1], x[2])],
    ["THE PERKY LOON",         1437.5, -1197.0,    Math.PI,    x=>g(x[1], x[2])],
    ["THE ROASTERY",           1437.5, -1183.0,    0.0,        x=>surfaceY(x[1], x[2], groundY(x[1], x[2])-2.2)],
    ["THE WEIGH STATION",       -42.0, -2970.0,    Math.PI/2,  x=>g(x[1], x[2])],
    ["THE LISTENING ROOM",      -57.2, -2916.1,    0.0,        x=>surfaceY(x[1], x[2], groundY(x[1], x[2])-2.3), true],
    ["THE FUEL STOP ROOF",      -30.0, -1257.0,    Math.PI/2,  x=>g(x[1], x[2], 6)],
    ["THE FIREWORKS ROOF",      909.0, -1266.0,    0.0,        x=>g(x[1], x[2], 7)],
    ["FRENCH CREEK PINES",    -1100.0, -1150.0,   Math.PI/2,   x=>g(x[1], x[2])],
    ["A TRAILER (LOT 1)",     -1213.6, -1157.6,   Math.PI,     x=>surfaceY(x[1], x[2], EDIN.y+0.72)],
    ["THE COMMUNITY HALL",    -1124.0, -1178.0,   Math.PI/2,   x=>surfaceY(x[1], x[2], WESTPARK.hall.FY)],
    ["THE PINE KNOT",         -1125.0, -1180.6,   Math.PI,     x=>surfaceY(x[1], x[2], WESTPARK.hall.BF), true],
    ["THE STONE HOUSE",       -1427.1, -1170.0,   Math.PI,     x=>g(x[1], x[2])],
    ["THE STONE HOUSE'S KITCHEN", -1426.0, -1156.3, Math.PI,   x=>surfaceY(x[1], x[2], RANCH.box.FY)],
    ["THE STONE HOUSE'S BASEMENT", -1426.0, -1157.6, Math.PI/2, x=>surfaceY(x[1], x[2], RANCH.box.BF), true],
    ["THE STONE HOUSE'S POOL", -1425.0, -1144.0,  Math.PI/2,   x=>surfaceY(x[1], x[2], EDIN.y+0.06)]];
  const KEYS="1234567890ABCDFGHIJKLMNOPQRTUV";            // (E and S left out: E is your hand, S is a step back)
  // the hoop: in front of the first one there is, facing it
  const hoopAt=()=>{ const H=(typeof YARD_HOOPS!=="undefined" && YARD_HOOPS[0]) || null; if(!H) return null;
    const x=H.rim.x, z=H.rim.z+H.f*4.5; return [x, z, Math.atan2(-(H.rim.x-x), -(H.rim.z-z)), surfaceY(x, z, H.y+1)]; };
  // the list
  const box=document.createElement("div"); box.id="warp";
  const st=document.createElement("style"); st.textContent=`
    #warp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);display:none;z-index:40;pointer-events:none;
      background:rgba(14,20,18,.92);border:1px solid rgba(220,232,214,.35);border-radius:6px;padding:16px 22px 14px;
      font-family:"Oswald",Arial,sans-serif;color:#e4ecdf;letter-spacing:.08em;max-width:calc(100vw - 32px);box-sizing:border-box}
    #warp h4{margin:0 0 10px;font-size:15px;letter-spacing:.3em;color:#9fd36a;font-weight:600}
    #warp .g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px 26px;font-size:13px;white-space:nowrap}
    #warp .g b{display:inline-block;width:1.6em;color:#f2d27a}
    #warp p{margin:10px 0 0;font-size:11px;opacity:.6;letter-spacing:.2em}`;
  document.head.appendChild(st); document.body.appendChild(box);
  box.innerHTML="<h4>WARP</h4><div class='g'>"+P.map((p, i)=>"<div><b>"+KEYS[i]+"</b>"+p[0]+"</div>").join("")+"</div><p>` OR ESC TO SHUT IT</p>";
  const show=(on)=>{ W.open=on; box.style.display=on ? "block" : "none"; };
  function go(i){
    const p=P[i]; if(!p) return;
    // out of whatever you are in
    if(driving) exitCar();
    if(typeof BOAT!=="undefined" && BOAT.on){ const B=BOAT; B.on=false; B.running=false; B.thr=0; B.rpm=0; if(B.cap) B.cap.g.visible=false; B.u=0; B.v=0; B.r=0;
      if(B.col) B.col.y1=B.col.y0+3.7; if(B.place) B.place(); }
    if(droneMode) setDrone(false);
    if(seated) standUp();
    player.ladder=null;
    let x=p[1], z=p[2], yaw=p[3], y;
    if(!p[4]){ const h=hoopAt(); if(!h){ toast("NO HOOP", "#e8b8a0"); return; } [x, z, yaw, y]=h; }
    else y=p[4](p);
    // (a room full of furniture: the clear spot on its floor nearest the middle)
    if(p[5] && blocked(x, z, y)){ let best=null, bd=1e9;
      for(let dx=-3;dx<=3;dx+=0.25) for(let dz=-3;dz<=3;dz+=0.25){ const qx=p[1]+dx, qz=p[2]+dz, qy=surfaceY(qx, qz, y+0.3);
        if(Math.abs(qy-y)<0.3 && !blocked(qx, qz, qy) && Math.hypot(dx, dz)<bd){ bd=Math.hypot(dx, dz); best=[qx, qz, qy]; } }
      if(best) [x, z, y]=best; }
    player.pos.set(x, 0, z); player.feetY=y; player.yaw=yaw; player.pitch=0; player.moving=0;
    if(typeof _handT!=="undefined") _handT=0;
    toast("WARP · "+p[0], "#9fd36a");
  }
  // (from 17's keydown chain, first of all)
  W.key=(e)=>{
    if(e.code==="Backquote" && !e.repeat){ show(!W.open); return true; }
    if(!W.open) return false;
    if(e.code==="Escape"){ show(false); return true; }
    const k=e.code.startsWith("Digit") ? e.code.slice(5) : e.code.startsWith("Key") ? e.code.slice(3) : "";
    const i=k ? KEYS.indexOf(k) : -1;
    if(i>=0){ show(false); go(i); }
    return true;                                                  // (anything else, while it is open, does nothing)
  };
  W.places=P; W.go=go;
  return W;
})();
