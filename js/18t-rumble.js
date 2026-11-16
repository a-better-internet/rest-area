"use strict";
/* REST AREA · 18t-rumble.js
   the arcade's tenth cabinet (12c): Exit 166 Rumble
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18t · EXIT 166 RUMBLE
   Played the way 18g's are (the cabinet's own screen, the stick under
   your hand, N to start again, Esc or E to step away), registered into
   18g's _CBG as cabinet 14, the last one in the arcade's new end. Its
   best five scores are kept in the browser and shown in its attract mode.

   A walk-along brawler of the kind where the street scrolls sideways and
   you can step up and down it as well as along. You are Dale (the one
   the house rules tell not to hang on the rim), a trucker who has come
   out of the rest area at two in the morning to find the cap off his
   tank and his diesel gone, and a trail of it leading up the ramp to
   Exit 166. Nine stages, walked left to right, each a place in the world
   outside the cabinet: THE TRUCK LOT, THE RAMP up to I-79, THE FUEL STOP,
   WEIR'S FARM, FRENCH CREEK PINES, LAKE STREET, LAKESHORE BREWING's deck,
   THE FIREWORKS OUTLET and, under the mast, THE RADIO TOWER, where Big
   Earl of the Gravel Kings is sitting on forty gallons of it. His little
   brother Dutch is waiting at the Pines and again at the outlet. A Dale is
   added after every third stage.

   The street stops scrolling wherever the Gravel Kings come at you, and
   lets you on (GO) when they are all down. Punks come straight in;
   the ones with a chain reach further and take longer to swing; the big
   ones do not flinch at a jab, only at a kick or the end of a combo; and
   Big Earl puts his head down and runs the width of the screen, which is
   the time to be somewhere else, and the moment after is the time to hit
   him. No more than two of them swing at once; the rest hang back and
   wait their turn, as they always have.
   SPACE (or J) punches: three in a row is a combo, and the third puts a
   man on his back. K kicks: slower, longer, harder. L jumps, and a punch
   or a kick in the air is a flying kick that floors what it lands on.
   Oil drums and crates break, and there is a soft pretzel in some of
   them, which is what a trucker's health is made of. Three Dales.
   WEAPONS. A crate may have a ball bat in it, or a roll of throwing
   knives, and the Kings who carry them (the Sluggers, and Slim, who
   throws from across the street) drop them when they go down. Walk over
   one to take it, and the punch button uses it: the bat reaches further
   and floors whatever it meets, and is good for a handful of hits; a
   knife flies the width of the screen at whoever is in your row. Get
   knocked down and you drop what you were carrying.
   The street is two pictures: the sky, hills and whatever is far off
   (the water tower, the radio mast, the lake) slide by at a third of the
   speed of the street in front of them. A stage may also have a `live`
   that draws what moves: the mast's beacons, the traffic on I-79, a
   campfire, a rocket over the outlet.
   Arrows or WASD walk, along the street and up and down it.
   Its story, its people, its stages and its pictures are its own, drawn
   here.
   ---------------------------------------------------------------------- */
const _RB=(function(){
  const W=_CB.W, H=_CB.H, Y0=26, GY0=182, ZD=84, GRAV=640;           // the street: its far edge on the screen, how deep it is
  const snd=(i, k)=>_cbSnd(i, k);
  const rnd=(G)=>{ G.seed=(G.seed*1664525+1013904223)>>>0; return G.seed/4294967296; };

  /* ---- who is who ---- */
  const KIND={
    dale:   {name:"DALE",      hp:100, sp:74, s:1.0,  reach:19, pal:{skin:"#e2b48c", shirt:"#b8302a", pants:"#34466e", hair:"#5a3a22", cap:"#1f4e8c", plaid:"#6a1a18"}},
    punk:   {name:"PUNK",      hp:26,  sp:46, s:0.98, reach:18, dmg:6,  wind:0.34, pal:{skin:"#d8a880", shirt:"#e8e4d8", pants:"#2a2a30", hair:"#1a1a1a", vest:"#3a5a8a", band:"#c8281e"}},
    chain:  {name:"CHAINS",    hp:34,  sp:40, s:1.02, reach:30, dmg:9,  wind:0.50, pal:{skin:"#c89870", shirt:"#2a2a2e", pants:"#4a3a2a", hair:"#c8b03a", vest:"#5a5a60", chain:"#c8ccd0"}},
    bruiser:{name:"BRUISER",   hp:60,  sp:32, s:1.20, reach:21, dmg:13, wind:0.52, armor:true, pal:{skin:"#d8a078", shirt:"#e8e8e0", pants:"#3a4a3a", hair:null, vest:"#2a2a2e"}},
    earl:   {name:"BIG EARL",  hp:190, sp:36, s:1.42, reach:24, dmg:16, wind:0.50, armor:true, boss:true, pal:{skin:"#d09870", shirt:"#1a1a1e", pants:"#2a3046", hair:"#8a4a22", vest:"#1a1a1e", beard:"#8a4a22", band:"#f2c418"}},
    batter: {name:"SLUGGER",   hp:40,  sp:42, s:1.06, reach:31, dmg:10, wind:0.62, floor:true, drop:"bat", wpn:"bat", pal:{skin:"#d8a880", shirt:"#d8d4c8", pants:"#3a3a52", hair:"#3a2a1a", cap:"#8a1a1a"}},
    knifer: {name:"SLIM",      hp:24,  sp:52, s:0.96, reach:16, dmg:5,  wind:0.30, thrower:true, drop:"knife", wpn:"knife", pal:{skin:"#e0b890", shirt:"#4a2a5a", pants:"#1a1a1e", hair:"#e8e0c8", band:"#3fe0ff"}},
    dutch:  {name:"DUTCH",     hp:120, sp:40, s:1.30, reach:23, dmg:13, wind:0.50, armor:true, boss:true, sub:"EARL'S LITTLE BROTHER", pal:{skin:"#d8a078", shirt:"#7a3a1a", pants:"#2a2a30", hair:"#d8d0c0", vest:"#3a2a1e", band:"#c8281e"}}};
  KIND.earl.sub="OF THE GRAVEL KINGS";
  const SCORE={punk:200, chain:300, bruiser:500, batter:350, knifer:300, dutch:1500, earl:3000};

  /* ---- the stages: how long, what stands on them, and where the Gravel Kings come at you ---- */
  // a wave: x0 where the street stops, and who comes: [kind, side (-1 from the left, 1 from the right), how deep, how long after]
  // a prop: [x, depth, kind, what is in it ("pretzel", "bat", "knife" or nothing)]
  const STAGES=[
    {n:"THE TRUCK LOT", sub:"SOMEBODY SIPHONED YOUR DIESEL", len:1060, paint:lot, sky:["#0a0e22","#1c2440","#141c2c"], far:farLot, beacons:[[0.86, 62]],
     props:[[330,60,"drum","pretzel"],[640,22,"crate","bat"],[910,58,"drum"]],
     waves:[{x0:90,  f:[["punk",1,40,0],["punk",1,64,0.9]]},
            {x0:400, f:[["punk",1,30,0],["punk",-1,60,0.6],["punk",1,70,1.8]]},
            {x0:710, f:[["chain",1,44,0],["punk",1,20,0.8],["punk",-1,66,1.6]]}]},
    {n:"THE RAMP", sub:"THE TRAIL GOES UP TO I-79", len:1060, paint:ramp, sky:["#080c1e","#1a223c","#121a2a"], far:farMast, beacons:[[0.80, 58]], live:liveRamp,
     props:[[280,64,"drum","knife"],[590,20,"crate","pretzel"],[880,60,"drum"]],
     waves:[{x0:90,  f:[["punk",1,34,0],["chain",1,60,0.8],["punk",-1,46,1.6]]},
            {x0:400, f:[["knifer",1,44,0],["punk",-1,28,0.8],["punk",1,68,2.0]]},
            {x0:710, f:[["chain",1,30,0],["chain",-1,62,0.8],["knifer",1,48,1.8],["punk",-1,40,3.0]]}]},
    {n:"THE FUEL STOP", sub:"THEY FILLED UP AND KEPT GOING", len:1060, paint:fuel, sky:["#0c1024","#222a48","#161e30"], far:farMast, beacons:[[0.74, 56]],
     props:[[250,66,"crate","pretzel"],[560,18,"drum"],[600,26,"drum","pretzel"],[900,64,"crate","bat"]],
     waves:[{x0:90,  f:[["chain",1,36,0],["punk",1,62,0.7],["punk",-1,48,1.5]]},
            {x0:400, f:[["bruiser",1,46,0],["punk",-1,26,1.0],["punk",1,70,2.2]]},
            {x0:710, f:[["chain",1,30,0],["chain",-1,64,0.8],["bruiser",1,50,2.0],["punk",-1,40,3.4]]}]},
    {n:"WEIR'S FARM", sub:"THEY CUT THROUGH THE WEIR PLACE", len:1060, paint:farm, sky:["#0a1020","#1e2a40","#16202c"], far:farMast, beacons:[[0.66, 52]],
     props:[[230,62,"bale","pretzel"],[540,20,"bale"],[575,26,"bale","knife"],[870,64,"crate","pretzel"]],
     waves:[{x0:90,  f:[["batter",1,42,0],["punk",1,66,0.8],["punk",-1,30,1.8]]},
            {x0:400, f:[["bruiser",1,40,0],["knifer",-1,62,0.8],["punk",1,24,2.0],["punk",-1,48,3.2]]},
            {x0:710, f:[["batter",1,30,0],["batter",-1,60,1.0],["chain",1,48,2.2]]}]},
    {n:"FRENCH CREEK PINES", sub:"WHERE THE GRAVEL KINGS WINTER", len:1060, paint:pines, sky:["#0a0c1a","#1c2034","#101826"], far:farMast, beacons:[[0.58, 48]], live:livePines,
     props:[[240,20,"crate","pretzel"],[520,66,"drum","bat"],[860,22,"crate","pretzel"],[900,30,"drum"]],
     waves:[{x0:90,  f:[["chain",1,34,0],["chain",-1,60,0.7],["knifer",1,48,1.6]]},
            {x0:400, f:[["bruiser",1,44,0],["batter",-1,26,1.0],["punk",1,68,2.0],["punk",-1,52,3.0]]},
            {x0:716, f:[["dutch",1,46,0.4],["punk",-1,30,7],["knifer",1,64,14]]}]},
    {n:"LAKE STREET", sub:"PORCH LIGHTS COME ON BEHIND YOU", len:1060, paint:street, sky:["#0c0e22","#22284a","#161c30"], far:farMast, beacons:[[0.50, 44]],
     props:[[260,64,"can","pretzel"],[560,20,"can"],[600,66,"crate","knife"],[890,22,"can","pretzel"]],
     waves:[{x0:90,  f:[["knifer",1,36,0],["knifer",-1,62,0.9],["punk",1,48,1.6]]},
            {x0:400, f:[["batter",1,44,0],["bruiser",-1,28,1.0],["chain",1,66,2.2]]},
            {x0:710, f:[["bruiser",1,32,0],["bruiser",-1,60,1.2],["knifer",1,46,2.4],["punk",-1,70,3.4]]}]},
    {n:"LAKESHORE BREWING", sub:"LAST CALL WAS AN HOUR AGO", len:1060, paint:brew, sky:["#0a1024","#1c2c50","#141e34"], far:farLake, water:true, beacons:[[0.42, 92]],
     props:[[250,22,"keg","pretzel"],[280,30,"keg"],[560,64,"crate","bat"],[880,20,"keg","pretzel"]],
     waves:[{x0:90,  f:[["batter",1,40,0],["chain",1,64,0.7],["knifer",-1,30,1.4],["punk",-1,54,2.4]]},
            {x0:400, f:[["bruiser",1,46,0],["batter",-1,24,1.0],["batter",1,68,2.2]]},
            {x0:710, f:[["chain",1,30,0],["chain",-1,62,0.6],["knifer",1,46,1.4],["knifer",-1,36,2.4],["bruiser",1,56,3.6]]}]},
    {n:"THE FIREWORKS OUTLET", sub:"BUY ONE, GET JUMPED BY TWO", len:1060, paint:outlet, sky:["#100a22","#2c2244","#1a1630"], far:farMast, beacons:[[0.34, 34]], live:liveOutlet,
     props:[[210,20,"crate","pretzel"],[240,28,"crate","knife"],[540,64,"drum","pretzel"],[860,22,"drum"]],
     waves:[{x0:90,  f:[["punk",1,30,0],["punk",1,60,0.5],["chain",-1,46,1.2],["batter",-1,70,2.4]]},
            {x0:400, f:[["bruiser",1,40,0],["bruiser",-1,60,1.2],["knifer",1,24,2.6]]},
            {x0:716, f:[["dutch",1,46,0.4],["batter",-1,30,5],["chain",1,66,10],["knifer",-1,50,16]]}]},
    {n:"THE RADIO TOWER", sub:"FORTY GALLONS OF IT, AND BIG EARL", len:1060, paint:tower, sky:["#0c0a1e","#241e3e","#18142a"], far:null, live:liveTower,
     props:[[230,62,"crate","pretzel"],[520,20,"drum","bat"],[560,66,"crate","pretzel"],[850,22,"drum","knife"]],
     waves:[{x0:90,  f:[["punk",1,30,0],["punk",-1,60,0.5],["chain",1,46,1.2],["batter",-1,70,2.2]]},
            {x0:400, f:[["bruiser",1,40,0],["bruiser",-1,62,1.0],["knifer",1,24,2.0],["knifer",-1,50,3.0]]},
            {x0:716, f:[["earl",1,46,0.4],["punk",-1,30,6],["batter",1,66,12],["chain",-1,50,20]]}]}];

  /* ---- a body ---- */
  function body(kind, x, z, dir){ const Kd=KIND[kind];
    return {kind:kind, K:Kd, x:x, z:z, y:0, vx:0, vy:0, dir:dir, hp:Kd.hp, st:"idle", t:0, walk:0, cool:0.6, flash:0, inv:0, combo:0, comboT:0, hitDone:false, armorN:0, foe:kind!=="dale", wpn:null}; }
  const live=(e)=>e.st!=="dead" && e.st!=="gone";
  const busy=(e)=>e.st==="hurt" || e.st==="fall" || e.st==="down" || e.st==="getup" || e.st==="dead";
  // a blow lands on `o`: dmg, and power 1 (a flinch) or 2 (off his feet)
  function land(G, a, o, dmg, power, i){
    if(o.inv>0 || o.st==="down" || o.st==="fall" || o.st==="dead" || o.st==="getup") return false;
    o.hp-=dmg; o.flash=0.10; o.dir=a.x<o.x ? -1 : 1;
    G.fx.push({x:(a.x+o.x)/2+a.dir*6, z:o.z, y:o.y+26*o.K.s+(power>1 ? 4 : 0), t:0, big:power>1});
    if(o.foe){ G.score+=power>1 ? 30 : 10; G.tgt=o; G.tgtT=2.5; }
    // (Big Earl takes it and keeps coming: only while he is winded after a run does a blow move him, or when he is finished)
    if(o.K.boss && o.hp>0 && o.st!=="winded"){ snd(i, "invhit"); return true; }
    const down=power>1 || o.hp<=0 || o.y>2;
    if(o.K.armor && !down){ o.armorN++; if(o.st==="charge" || o.armorN%4) { snd(i, "invhit"); return true; } }   // (the big ones shrug off three jabs in four)
    if(down && o.wpn){ G.loot.push({x:o.x, z:o.z, t:0, kind:o.wpn.kind, n:o.wpn.n}); o.wpn=null; }      // (what he was carrying, dropped)
    if(down){ o.st="fall"; o.t=0; o.vx=a.dir*(o.K.boss ? 60 : 120); o.vy=o.K.boss ? 150 : 210; o.y=Math.max(o.y, 1); snd(i, "thump"); }
    else { o.st="hurt"; o.t=0.26; o.vx=a.dir*46; snd(i, "invhit"); }
    return true;
  }
  // what `a` reaches in front of him: the other side's bodies, and (for Dale) whatever breaks
  function swing(G, a, reach, dmg, power, i){
    let hit=false;
    for(const o of G.ents){ if(o===a || o.foe===a.foe || !live(o)) continue;
      const dx=(o.x-a.x)*a.dir; if(dx<-4 || dx>reach+6*o.K.s || Math.abs(o.z-a.z)>9 || Math.abs(o.y-a.y)>30) continue;
      if(land(G, a, o, dmg, power, i)) hit=true; }
    if(!a.foe) for(const p of G.props){ if(p.hp<=0) continue; const dx=(p.x-a.x)*a.dir; if(dx<0 || dx>reach+8 || Math.abs(p.z-a.z)>11 || a.y>24) continue;
      p.hp-=power>1 ? 2 : 1; p.shake=0.2; hit=true; G.fx.push({x:p.x, z:p.z, y:14, t:0, big:false});
      if(p.hp<=0){ G.score+=50; snd(i, "brick"); if(p.loot) G.loot.push({x:p.x, z:p.z, t:0, kind:p.loot}); } else snd(i, "wall"); }
    return hit;
  }

  /* ---- Dale ---- */
  function dale(G, K, i, dt){
    const p=G.p, Kd=p.K;
    if(p.inv>0) p.inv-=dt; if(p.comboT>0){ p.comboT-=dt; if(p.comboT<=0) p.combo=0; }
    if(G.in.punchT>0) G.in.punchT-=dt; if(G.in.kickT>0) G.in.kickT-=dt; if(G.in.jumpT>0) G.in.jumpT-=dt;
    const mx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), mz=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
    const wantP=G.in.punchT>0, wantK=G.in.kickT>0, wantJ=G.in.jumpT>0;
    if(p.st==="idle" || p.st==="walk"){
      if(wantJ){ G.in.jumpT=0; p.st="jump"; p.t=0; p.vy=255; p.vx=mx*Kd.sp*1.15; p.y=0.5; snd(i, "hop"); }
      else if(wantK){ G.in.kickT=0; p.st="kick"; p.t=0; p.hitDone=false; p.combo=0; }
      else if(wantP && p.wpn){ G.in.punchT=0; p.st=p.wpn.kind==="bat" ? "bat" : "throw"; p.t=0; p.hitDone=false; p.combo=0; }
      else if(wantP){ G.in.punchT=0; p.combo=p.comboT>0 ? Math.min(3, p.combo+1) : 1; p.st="punch"; p.t=0; p.hitDone=false; }
      else { if(mx) p.dir=mx; p.x+=mx*Kd.sp*dt; p.z+=mz*Kd.sp*0.62*dt; p.st=(mx || mz) ? "walk" : "idle"; if(mx || mz) p.walk+=dt*9; }
    }else if(p.st==="punch"){ p.t+=dt; const last=p.combo===3, at=last ? 0.12 : 0.07, len=last ? 0.34 : 0.20;
      if(!p.hitDone && p.t>=at){ p.hitDone=true;
        const hit=swing(G, p, Kd.reach+(last ? 3 : 0), last ? 14 : 8, last ? 2 : 1, i); if(hit) p.comboT=0.55; else { p.combo=0; snd(i, "whoosh"); } }
      if(p.t>=len){ p.st="idle"; if(p.combo>=3) p.combo=0; }
    }else if(p.st==="bat"){ p.t+=dt;                                   // the bat: further, harder, and only so many hits in it
      if(!p.hitDone && p.t>=0.11){ p.hitDone=true;
        if(swing(G, p, Kd.reach+13, 17, 2, i)){ if(p.wpn && --p.wpn.n<=0){ p.wpn=null; G.pops.push({x:p.x, z:p.z, txt:"THE BAT'S DONE", t:0}); snd(i, "brick"); } } else snd(i, "whoosh"); }
      if(p.t>=0.36) p.st="idle";
    }else if(p.st==="throw"){ p.t+=dt;                                 // a knife, along his row
      if(!p.hitDone && p.t>=0.08){ p.hitDone=true; G.shots.push({x:p.x+p.dir*10, z:p.z, y:25, dir:p.dir, v:270, foe:false, dmg:15, t:0}); snd(i, "whoosh"); if(p.wpn && --p.wpn.n<=0) p.wpn=null; }
      if(p.t>=0.24) p.st="idle";
    }else if(p.st==="kick"){ p.t+=dt;
      if(!p.hitDone && p.t>=0.13){ p.hitDone=true; if(!swing(G, p, Kd.reach+8, 12, 2, i)) snd(i, "whoosh"); }
      if(p.t>=0.36) p.st="idle";
    }else if(p.st==="jump" || p.st==="jkick"){
      p.x+=p.vx*dt; p.vy-=GRAV*dt; p.y+=p.vy*dt;
      if(p.st==="jump" && (wantP || wantK)){ G.in.punchT=G.in.kickT=0; p.st="jkick"; p.hitDone=false; if(!p.vx) p.vx=p.dir*40; }
      if(p.st==="jkick" && !p.hitDone && p.y>4){ if(swing(G, p, Kd.reach+6, 14, 2, i)) p.hitDone=true; }
      if(p.y<=0){ p.y=0; p.st="idle"; p.vx=0; }
    }else if(p.st==="hurt"){ p.t-=dt; p.x+=p.vx*dt; p.vx*=Math.pow(0.02, dt); if(p.t<=0) p.st="idle";
    }else if(p.st==="fall"){ p.x+=p.vx*dt; p.vy-=GRAV*dt; p.y+=p.vy*dt; if(p.y<=0){ p.y=0; p.st="down"; p.t=p.hp<=0 ? 1.5 : 0.7; snd(i, "thump"); }
    }else if(p.st==="down"){ p.t-=dt;
      if(p.t<=0){ if(p.hp<=0){ G.lives--; if(G.lives<=0){ G.over=true; return; } p.hp=Kd.hp; p.inv=2.2; } p.st="getup"; p.t=0.3; }
    }else if(p.st==="getup"){ p.t-=dt; if(p.t<=0){ p.st="idle"; p.inv=Math.max(p.inv, 0.7); } }
    p.z=clamp(p.z, 3, ZD-3); p.x=clamp(p.x, G.limL+10, G.limR-10);
    // what lies on the street: a pretzel, a bat, a roll of knives
    for(const l of G.loot){ l.t+=dt; if(l.got || l.t<0.3 || Math.abs(l.x-p.x)>13 || Math.abs(l.z-p.z)>10 || p.y>8 || p.st==="down" || p.st==="fall") continue;
      l.got=true; const k=l.kind||"pretzel";
      if(k==="pretzel"){ p.hp=Math.min(Kd.hp, p.hp+35); G.score+=100; snd(i, "snack"); }
      else if(k==="bat"){ p.wpn={kind:"bat", n:l.n||7}; snd(i, "coin"); }
      else { p.wpn={kind:"knife", n:(p.wpn && p.wpn.kind==="knife" ? p.wpn.n : 0)+(l.n||4)}; snd(i, "coin"); }
      G.pops.push({x:l.x, z:l.z, txt:k==="pretzel" ? "PRETZEL" : k==="bat" ? "A BALL BAT" : "KNIVES", t:0}); }
    G.loot=G.loot.filter(l=>!l.got);
  }

  /* ---- the Gravel Kings ---- */
  function foe(G, e, i, dt){
    const p=G.p, Kd=e.K;
    if(e.flash>0) e.flash-=dt; if(e.inv>0) e.inv-=dt; if(e.cool>0) e.cool-=dt;
    if(e.wait>0){ e.wait-=dt; return; }                                // (not on the street yet)
    const dx=p.x-e.x, dz=p.z-e.z, adx=Math.abs(dx), pOut=p.st==="down" || p.st==="fall" || p.st==="getup" || p.inv>0;
    if(e.st==="idle" || e.st==="walk"){
      e.dir=dx>=0 ? 1 : -1;
      // Big Earl's run: from a way off, when he has his wind back
      if(Kd.boss && e.cool<=0 && adx>70 && !pOut && e.rage<=0){ e.st="tell"; e.t=0.75; e.rage=4.2+rnd(G)*2.5; snd(i, "wall"); return; }
      if(Kd.boss && e.rage>0) e.rage-=dt;
      const inReach=adx<Kd.reach+2 && adx>6 && Math.abs(dz)<6;
      if(inReach && e.cool<=0 && !pOut && e.turn){ e.st="windup"; e.t=Kd.wind; e.throwing=false; return; }
      // Slim throws from across the street, when he has a line along Dale's row
      if(Kd.thrower && e.turn && e.cool<=0 && !pOut && e.onscreen && adx>52 && adx<200 && Math.abs(dz)<7){ e.st="windup"; e.t=0.48; e.throwing=true; return; }
      // where he wants to be: beside Dale if it is his turn, hanging back if it is not
      const side=e.x>=p.x ? 1 : -1, tx=e.turn ? p.x+side*(Kd.thrower && adx>34 ? 112 : Kd.reach-3) : p.x+side*(62+e.slot*16), tz=e.turn ? p.z : clamp(p.z+(e.slot%2 ? 26 : -26), 6, ZD-6);
      const ex=tx-e.x, ez=tz-e.z, d=Math.hypot(ex, ez), sp=Kd.sp*(e.turn ? 1 : 0.7)*G.fast;
      if(d>2){ e.x+=ex/d*sp*dt; e.z+=ez/d*sp*0.7*dt; e.st="walk"; e.walk+=dt*8; } else e.st="idle";
    }else if(e.st==="windup"){ e.t-=dt; if(e.t<=0){ e.st="strike"; e.t=0.2; e.hitDone=false; }
    }else if(e.st==="strike"){ e.t-=dt;
      if(!e.hitDone){ e.hitDone=true;
        if(e.throwing){ G.shots.push({x:e.x+e.dir*10, z:e.z, y:25, dir:e.dir, v:150*G.fast, foe:true, dmg:8, t:0}); snd(i, "whoosh"); }
        else if(!swing(G, e, Kd.reach, Kd.dmg, Kd.boss || Kd.floor || e.kind==="bruiser" ? 2 : 1, i)) snd(i, "whoosh"); }
      if(e.t<=0){ e.st="idle"; e.cool=(e.throwing ? 1.5+rnd(G) : 0.7+rnd(G)*0.9)/G.fast; }
    }else if(e.st==="tell"){ e.t-=dt; if(e.t<=0){ e.st="charge"; e.t=1.25; e.hitDone=false; e.dir=dx>=0 ? 1 : -1; }
    }else if(e.st==="charge"){ e.t-=dt; e.x+=e.dir*205*dt; e.walk+=dt*16;
      if(!e.hitDone && Math.abs(p.x-e.x)<18 && Math.abs(p.z-e.z)<11 && p.y<16 && land(G, e, p, 18, 2, i)) e.hitDone=true;
      if(e.t<=0 || e.x<G.limL+14 || e.x>G.limR-14){ e.st="winded"; e.t=1.1; e.cool=1.4; }
    }else if(e.st==="winded"){ e.t-=dt; if(e.t<=0) e.st="idle";
    }else if(e.st==="hurt"){ e.t-=dt; e.x+=e.vx*dt; e.vx*=Math.pow(0.02, dt); if(e.t<=0) e.st="idle";
    }else if(e.st==="fall"){ e.x+=e.vx*dt; e.vy-=GRAV*dt; e.y+=e.vy*dt;
      if(e.y<=0){ e.y=0; snd(i, "thump");
        if(e.hp<=0){ e.st="dead"; e.t=1.1; const v=SCORE[e.kind]||200; G.score+=v; G.pops.push({x:e.x, z:e.z, txt:String(v), t:0}); if(Kd.boss){ G.bossDown=true; snd(i, "boom"); }
          if(Kd.drop && rnd(G)<0.7) G.loot.push({x:e.x, z:e.z, t:0, kind:Kd.drop, n:Kd.drop==="bat" ? 5 : 3}); }
        else { e.st="down"; e.t=Kd.boss ? 0.9 : 0.8; } }
    }else if(e.st==="down"){ e.t-=dt; if(e.t<=0){ e.st="getup"; e.t=0.35; }
    }else if(e.st==="getup"){ e.t-=dt; if(e.t<=0){ e.st="idle"; e.inv=0.25; e.cool=0.5; }
    }else if(e.st==="dead"){ e.t-=dt; if(e.t<=0) e.st="gone"; }
    e.z=clamp(e.z, 3, ZD-3);
    if(e.onscreen) e.x=clamp(e.x, G.limL+8, G.limR-8); else if(e.x>G.limL+10 && e.x<G.limR-10) e.onscreen=true;
  }
  /* whose turn it is: the two nearest to Dale who are on their feet (one, on the first stage's first wave) */
  function turns(G){
    const L=G.ents.filter(e=>e.foe && live(e) && !(e.wait>0)), p=G.p;
    L.sort((a, b)=>Math.hypot(a.x-p.x, (a.z-p.z)*2)-Math.hypot(b.x-p.x, (b.z-p.z)*2));
    const n=G.stage===0 && G.wave===0 ? 1 : 2; let k=0, slot=0;
    for(const e of L){ if(e.K.boss){ e.turn=true; continue; } if(k<n && !busy(e)){ e.turn=true; k++; } else if(e.st==="windup" || e.st==="strike") e.turn=true; else { e.turn=false; e.slot=slot++; } }
  }

  function startStage(G, k){
    G.stage=k; const S=STAGES[k];
    G.p.x=30; G.p.z=ZD*0.55; G.p.y=0; G.p.st="idle"; G.p.dir=1; G.p.vx=0; G.p.combo=0;
    G.ents=[G.p]; G.wave=0; G.lock=null; G.cam=0; G.limL=0; G.limR=S.waves[0].x0+W; G.go=0; G.msgT=2.4; G.clearT=0; G.bossDown=false;
    G.props=S.props.map(([x, z, kind, loot])=>({x:x, z:z, kind:kind, hp:kind==="drum" || kind==="keg" ? 3 : 2, shake:0, loot:loot||null}));
    G.fast=1+k*0.03; G.shots=[]; G.extra=false;
    G.loot=[]; G.fx=[]; G.pops=[]; G.tgt=null; G.tgtT=0;
  }
  function frame(G, K, i, dt){
    G.t+=dt;
    for(const o of G.fx) o.t+=dt; G.fx=G.fx.filter(o=>o.t<0.22);
    for(const o of G.pops) o.t+=dt; G.pops=G.pops.filter(o=>o.t<1.1);
    for(const q of G.props) if(q.shake>0) q.shake-=dt;
    if(G.tgtT>0) G.tgtT-=dt; if(G.go>0) G.go-=dt;
    if(G.msgT>0){ G.msgT-=dt; if(G.msgT>1.2) return; }                  // (the stage's name holds everything a moment)
    const S=STAGES[G.stage], p=G.p;
    if(G.clearT>0){ G.clearT-=dt; p.st="walk"; p.dir=1; p.x+=60*dt; p.walk+=dt*9;
      if(G.clearT<=0){ if(G.stage>=STAGES.length-1){ G.won=true; return; } startStage(G, G.stage+1); }
      return; }
    dale(G, K, i, dt); if(G.over) return;
    turns(G);
    for(const e of G.ents) if(e.foe) foe(G, e, i, dt);
    G.ents=G.ents.filter(e=>e.st!=="gone");
    // what is in the air: a knife goes along its row until it meets somebody on the other side, or a drum, or the edge of the screen
    for(const q of G.shots){ q.t+=dt; q.x+=q.dir*q.v*dt;
      for(const o of G.ents){ if(o.foe===q.foe || !live(o) || o.wait>0 || Math.abs(o.x-q.x)>7*o.K.s || Math.abs(o.z-q.z)>8 || o.y>26) continue;
        if(land(G, {x:q.x-q.dir*12, dir:q.dir, foe:q.foe}, o, q.dmg, 1, i)){ q.gone=true; break; } }
      if(!q.gone && !q.foe) for(const b of G.props){ if(b.hp<=0 || Math.abs(b.x-q.x)>9 || Math.abs(b.z-q.z)>10) continue;
        b.hp--; b.shake=0.2; q.gone=true; if(b.hp<=0){ G.score+=50; snd(i, "brick"); if(b.loot) G.loot.push({x:b.x, z:b.z, t:0, kind:b.loot}); } else snd(i, "wall"); break; }
      if(q.x<G.cam-30 || q.x>G.cam+W+30) q.gone=true; }
    G.shots=G.shots.filter(q=>!q.gone);
    // the street stops where they come at you, and lets you on when they are down
    const wv=S.waves[G.wave];
    if(!G.lock && wv && p.x>wv.x0+W*0.42){
      G.lock=wv; G.limL=wv.x0; G.limR=wv.x0+W;
      wv.f.forEach(([kind, side, z, late], n)=>{ const e=body(kind, side<0 ? wv.x0-24-n*6 : wv.x0+W+24+n*6, z, -side); e.wait=late; e.slot=n; e.rage=1.5; e.onscreen=false; if(G.loop){ e.hp=Math.round(e.hp*1.3); } G.ents.push(e); });
      { const bk=wv.f.find(f=>KIND[f[0]].boss); if(bk){ G.msgT=1.19; G.boss=KIND[bk[0]]; snd(i, "jingle"); } }
    }
    if(G.lock){ const left=G.ents.some(e=>e.foe && live(e));
      // (with Earl down the rest of them have had enough: the ones on the street go over, the ones not yet on it never come)
      if(!left || G.bossDown){ if(G.bossDown) for(const e of G.ents) if(e.foe && e.hp>0){ if(e.wait>0){ e.st="gone"; continue; } e.hp=0; e.st="fall"; e.vy=120; e.vx=-e.dir*60; e.y=1; }
        if(!G.ents.some(e=>e.foe && live(e))){ G.lock=null; G.boss=null; G.bossDown=false; G.wave++; const nx=S.waves[G.wave]; G.limR=nx ? nx.x0+W : S.len; G.go=2.6;
          if(!nx){ G.limR=S.len+60; } } } }
    // off the end of the street: the stage is done
    if(!G.lock && !S.waves[G.wave] && p.x>S.len-14 && p.st!=="fall" && p.st!=="down"){ const bonus=Math.round(p.hp)*10; G.score+=bonus; G.bonus=bonus; G.clearT=2.2; snd(i, "jingle");
      if((G.stage+1)%3===0 && G.stage<STAGES.length-1 && G.lives<5){ G.lives++; G.extra=true; } }
    const want=clamp(p.x-W*0.40, G.limL, Math.max(G.limL, Math.min(G.limR, S.len)-W));
    G.cam+=(want-G.cam)*Math.min(1, dt*6);
  }

  /* ---- the pictures ---- */
  // a figure on its feet at (X, Y), facing d, in a pose: limbs as round-ended strokes from the hip and the shoulder
  const POSES={
    idle:  {lean:0.06, aF:[0.9,2.3],   aB:[0.45,2.0],  lF:[0.26,0.04],  lB:[-0.26,-0.12]},
    punch1:{lean:0.20, aF:[1.50,1.55], aB:[0.2,2.2],   lF:[0.46,0.16],  lB:[-0.42,-0.30]},
    punch2:{lean:0.22, aF:[0.1,2.3],   aB:[1.52,1.56], lF:[0.46,0.16],  lB:[-0.42,-0.30]},
    upper: {lean:-0.04,aF:[2.35,2.95], aB:[0.3,1.9],   lF:[0.30,0.10],  lB:[-0.30,-0.20]},
    kick:  {lean:-0.32,aF:[-0.5,0.7],  aB:[0.9,1.9],   lF:[1.46,1.52],  lB:[-0.10,-0.04]},
    jump:  {lean:0.10, aF:[2.2,2.6],   aB:[1.8,2.4],   lF:[1.0,-0.5],   lB:[0.5,-0.9]},
    jkick: {lean:0.24, aF:[-0.4,0.9],  aB:[1.2,2.2],   lF:[1.22,1.28],  lB:[0.3,-1.1]},
    hurt:  {lean:-0.36,aF:[-0.7,-0.2], aB:[-1.0,-0.5], lF:[0.22,0.0],   lB:[-0.30,-0.22]},
    windup:{lean:-0.16,aF:[-1.0,0.7],  aB:[0.8,2.0],   lF:[0.30,0.06],  lB:[-0.34,-0.2]},
    tell:  {lean:-0.10,aF:[2.7,3.0],   aB:[2.5,2.9],   lF:[0.36,0.1],   lB:[-0.36,-0.2]},
    charge:{lean:0.55, aF:[1.2,1.35],  aB:[1.0,1.2],   lF:[0.5,0.0],    lB:[-0.5,-0.9]},
    swing: {lean:0.28, aF:[1.75,1.50], aB:[0.6,1.9],   lF:[0.50,0.16],  lB:[-0.44,-0.30]},
    winded:{lean:0.50, aF:[0.3,0.5],   aB:[0.2,0.4],   lF:[0.3,0.0],    lB:[-0.3,-0.2]}};
  function figure(x, X, Y, d, pose, pal, s, ph, flash, kind, wpn){
    let A=POSES[pose]||POSES.idle, lF=A.lF, lB=A.lB;
    if(pose==="walk" || pose==="charge"){ const a=Math.sin(ph), b=Math.cos(ph), k=pose==="charge" ? 0.9 : 0.55;
      lF=[a*k, a*k-Math.max(0, -b)*0.8]; lB=[-a*k, -a*k-Math.max(0, b)*0.8]; if(pose==="walk") A=POSES.idle; }
    const TH=9*s, SH=9*s, TO=13*s, UA=7*s, FA=7*s, HR=4.3*s, col=(c)=>flash ? "#ffffff" : c;
    const hipX=X, hipY=Y-(TH+SH)*Math.cos(Math.min(Math.abs(lF[0]), Math.abs(lB[0])))*0.98-1, shX=hipX+Math.sin(A.lean)*TO*d, shY=hipY-Math.cos(A.lean)*TO;
    const limb=(x0, y0, a1, a2, L1, L2, w, c1, c2)=>{ const x1=x0+Math.sin(a1)*L1*d, y1=y0+Math.cos(a1)*L1, x2=x1+Math.sin(a2)*L2*d, y2=y1+Math.cos(a2)*L2;
      x.lineCap="round"; x.strokeStyle=col(c1); x.lineWidth=w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
      x.strokeStyle=col(c2||c1); x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); return [x2, y2]; };
    const sleeve=pal.vest && kind!=="earl" ? pal.skin : pal.shirt;
    limb(shX, shY+1, A.aB[0], A.aB[1], UA, FA, 3.4*s, sleeve, pal.skin);                       // the far arm
    const fb=limb(hipX, hipY, lB[0], lB[1], TH, SH, 4.2*s, pal.pants); x.fillStyle=col("#1a1a1c"); x.fillRect(fb[0]-2*s+d*1.5*s, fb[1]-1.5*s, 4.5*s, 3*s);   // the far leg, its boot
    x.lineCap="round"; x.strokeStyle=col(pal.shirt); x.lineWidth=8.2*s; x.beginPath(); x.moveTo(hipX, hipY-2*s); x.lineTo(shX, shY+2*s); x.stroke();        // the trunk
    if(pal.plaid){ x.strokeStyle=col(pal.plaid); x.lineWidth=1.2; for(const k of [0.3, 0.6]){ x.beginPath(); x.moveTo(hipX+(shX-hipX)*k-4*s, hipY+(shY-hipY)*k); x.lineTo(hipX+(shX-hipX)*k+4*s, hipY+(shY-hipY)*k); x.stroke(); } }
    if(pal.vest){ x.strokeStyle=col(pal.vest); x.lineWidth=8.6*s; x.lineCap="butt"; x.beginPath(); x.moveTo(hipX+(shX-hipX)*0.25-d*1.6*s, hipY+(shY-hipY)*0.25); x.lineTo(shX-d*1.6*s, shY+1*s); x.stroke(); x.lineCap="round"; }
    x.fillStyle=col("#1a1a1c"); x.fillRect(hipX-4.2*s, hipY-3*s, 8.4*s, 2*s);                                                                 // his belt
    const ff=limb(hipX, hipY, lF[0], lF[1], TH, SH, 4.4*s, pal.pants); x.fillStyle=col("#1a1a1c"); x.fillRect(ff[0]-2*s+d*1.5*s, ff[1]-1.5*s, 4.5*s, 3*s);
    const hx=shX+Math.sin(A.lean)*(HR+1.5*s)*d, hy=shY-Math.cos(A.lean)*(HR+1.5*s);
    x.fillStyle=col(pal.skin); x.beginPath(); x.arc(hx, hy, HR, 0, 7); x.fill();
    if(pal.hair){ x.fillStyle=col(pal.hair); x.beginPath(); x.arc(hx-d*0.8*s, hy-0.8*s, HR, Math.PI*1.05, Math.PI*2.05); x.fill(); x.fillRect(hx-d*HR-(d>0 ? 0 : 1.5*s), hy-1*s, 1.5*s, 3*s); }
    if(pal.cap){ x.fillStyle=col(pal.cap); x.beginPath(); x.arc(hx, hy-0.6*s, HR+0.4, Math.PI, Math.PI*2); x.fill(); x.fillRect(d>0 ? hx : hx-HR-3*s, hy-1.6*s, HR+3*s, 1.6*s); }
    if(pal.band){ x.fillStyle=col(pal.band); x.fillRect(hx-HR, hy-2.4*s, HR*2, 1.8*s); }
    if(pal.beard){ x.fillStyle=col(pal.beard); x.beginPath(); x.arc(hx+d*1.2*s, hy+1.6*s, HR*0.9, 0.1, Math.PI-0.1); x.fill(); }
    x.fillStyle=col("#1a1a1c"); x.fillRect(hx+d*1.6*s-0.5, hy-0.8*s, 1.2*s, 1.2*s);                                                           // an eye
    const fa=limb(shX, shY+1, A.aF[0], A.aF[1], UA, FA, 3.8*s, sleeve, pal.skin);                                                             // the near arm, and its fist
    // what is in his hand: a bat (over the shoulder, drawn back, or through the swing) or a knife
    if(wpn){ const hit=pose==="swing" || pose==="punch1" || pose==="upper", a=pose==="windup" ? -2.2 : hit ? A.aF[1] : 2.75, L=(wpn==="bat" ? 15 : 6)*s;
      x.lineCap="round"; x.strokeStyle=col(wpn==="bat" ? "#c8a060" : "#d8dce0"); x.lineWidth=wpn==="bat" ? 2.6*s : 1.6;
      x.beginPath(); x.moveTo(fa[0], fa[1]); x.lineTo(fa[0]+Math.sin(a)*L*d, fa[1]+Math.cos(a)*L); x.stroke();
      if(wpn==="bat"){ x.strokeStyle=col("#e0bc7c"); x.lineWidth=3.4*s; x.beginPath(); x.moveTo(fa[0]+Math.sin(a)*L*0.55*d, fa[1]+Math.cos(a)*L*0.55); x.lineTo(fa[0]+Math.sin(a)*L*d, fa[1]+Math.cos(a)*L); x.stroke(); } }
    x.fillStyle=col(pal.skin); x.beginPath(); x.arc(fa[0], fa[1], 2.3*s, 0, 7); x.fill();
    if(pal.chain){ x.strokeStyle=col(pal.chain); x.lineWidth=1.4; x.setLineDash([2, 1.5]); x.beginPath(); x.moveTo(fa[0], fa[1]);
      if(pose==="punch1") x.lineTo(fa[0]+d*13*s, fa[1]+1); else if(pose==="windup") x.quadraticCurveTo(fa[0]-d*8, fa[1]-10, fa[0]-d*13, fa[1]-2); else x.quadraticCurveTo(fa[0]+d*2, fa[1]+8, fa[0]-d*2, fa[1]+13); x.stroke(); x.setLineDash([]); }
  }
  function drawBody(x, e, cam, t){
    const X=Math.round(e.x-cam), Y=GY0+e.z, s=e.K.s;
    if(e.wait>0) return;
    if(e.st==="dead" && ((t*14)|0)%2) return;
    if(e.inv>0 && !e.foe && ((t*14)|0)%2 && e.st!=="down") return;
    x.fillStyle="rgba(0,0,0,0.32)"; x.beginPath(); x.ellipse(X, Y+1, 9*s*(1-Math.min(0.5, e.y/90)), 2.6*s, 0, 0, 7); x.fill();
    let pose=e.st;
    if(e.st==="punch") pose=e.combo===3 ? "upper" : e.combo===2 ? "punch2" : "punch1"; else if(e.st==="strike" || e.st==="throw") pose="punch1"; else if(e.st==="bat") pose="swing";
    else if(e.st==="fall") pose="hurt"; else if(e.st==="getup") pose="winded";
    const wpn=e.foe ? e.K.wpn : e.wpn && (e.st==="throw" && e.hitDone ? null : e.wpn.kind);
    const lying=e.st==="down" || e.st==="dead" || (e.st==="fall" && e.vy<0 && e.y<14);
    x.save(); x.translate(X, Y-e.y);
    if(lying){ x.rotate(-e.dir*Math.PI/2*0.94); x.translate(0, -3*s); figure(x, 0, 0, e.dir, "hurt", e.K.pal, s, 0, e.flash>0, e.kind); }
    else { if(e.st==="tell") x.translate(Math.sin(t*50)*1.2, 0); figure(x, 0, 0, e.dir, pose, e.K.pal, s, e.walk, e.flash>0, e.kind, wpn); }
    x.restore();
  }
  function drawProp(x, q, cam){
    const X=Math.round(q.x-cam)+(q.shake>0 ? Math.round(Math.sin(q.shake*90)*1.5) : 0), Y=GY0+q.z;
    if(q.hp<=0){ x.fillStyle="rgba(20,16,12,0.5)"; x.beginPath(); x.ellipse(X, Y, 11, 3.5, 0, 0, 7); x.fill();
      x.fillStyle=q.kind==="drum" ? "#3a5a8a" : q.kind==="bale" ? "#b89a3a" : q.kind==="keg" || q.kind==="can" ? "#8a8e94" : "#8a6a3c"; x.fillRect(X-9, Y-3, 7, 3); x.fillRect(X+2, Y-2, 6, 2); return; }
    x.fillStyle="rgba(0,0,0,0.3)"; x.beginPath(); x.ellipse(X, Y+1, 10, 3, 0, 0, 7); x.fill();
    if(q.kind==="drum"){ x.fillStyle="#2f5a96"; x.fillRect(X-7, Y-21, 14, 21); x.fillStyle="#4a7ac0"; x.fillRect(X-7, Y-21, 3, 21); x.fillStyle="#1e3c66"; x.fillRect(X-7, Y-15, 14, 1.5); x.fillRect(X-7, Y-8, 14, 1.5);
      x.fillStyle="#22406e"; x.beginPath(); x.ellipse(X, Y-21, 7, 2.2, 0, 0, 7); x.fill(); }
    else if(q.kind==="bale"){ x.fillStyle="#c0a040"; x.fillRect(X-11, Y-14, 22, 14); x.fillStyle="#d8bc5c"; x.fillRect(X-11, Y-14, 22, 3); x.strokeStyle="#7a6420"; x.lineWidth=1; for(const o of [-5, 5]){ x.beginPath(); x.moveTo(X+o, Y-14); x.lineTo(X+o, Y); x.stroke(); }
      x.strokeStyle="rgba(120,96,30,0.6)"; for(let k=0;k<5;k++){ x.beginPath(); x.moveTo(X-10+k*4.4, Y-11+(k%2)*3); x.lineTo(X-7+k*4.4, Y-4-(k%2)*2); x.stroke(); } }
    else if(q.kind==="keg"){ x.fillStyle="#a8acb2"; x.fillRect(X-7, Y-19, 14, 19); x.fillStyle="#d0d4d8"; x.fillRect(X-7, Y-19, 3, 19); x.fillStyle="#7a7e84"; x.fillRect(X-8, Y-20, 16, 2.5); x.fillRect(X-8, Y-11, 16, 2); x.fillRect(X-8, Y-2.5, 16, 2.5); }
    else if(q.kind==="can"){ x.fillStyle="#6a7078"; x.beginPath(); x.moveTo(X-7, Y-18); x.lineTo(X+7, Y-18); x.lineTo(X+6, Y); x.lineTo(X-6, Y); x.closePath(); x.fill(); x.strokeStyle="#4a5058"; x.lineWidth=1; for(const o of [-3, 0, 3]){ x.beginPath(); x.moveTo(X+o, Y-17); x.lineTo(X+o*0.9, Y-1); x.stroke(); }
      x.fillStyle="#8a9098"; x.beginPath(); x.ellipse(X, Y-18, 8, 2.4, 0, 0, 7); x.fill(); x.fillRect(X-2, Y-21.5, 4, 1.5); }
    else { x.fillStyle="#a8824a"; x.fillRect(X-9, Y-16, 18, 16); x.strokeStyle="#6a4e28"; x.lineWidth=1.5; x.strokeRect(X-8.2, Y-15.2, 16.4, 14.4); x.beginPath(); x.moveTo(X-8, Y-15); x.lineTo(X+8, Y-1); x.stroke(); }
  }
  function pretzel(x, X, Y, t){ const b=Math.sin(t*6)*1.5;
    x.strokeStyle="#b8742a"; x.lineWidth=2.2; x.beginPath(); x.arc(X-2.6, Y-6+b, 2.6, 0, 7); x.stroke(); x.beginPath(); x.arc(X+2.6, Y-6+b, 2.6, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(X-4, Y-2+b); x.lineTo(X+4, Y-9+b); x.moveTo(X+4, Y-2+b); x.lineTo(X-4, Y-9+b); x.stroke();
    x.fillStyle="#fff6e0"; x.fillRect(X-3, Y-7+b, 1, 1); x.fillRect(X+2, Y-5+b, 1, 1); x.fillRect(X, Y-9+b, 1, 1); }

  function lootPic(x, X, Y, l, t){ const k=l.kind||"pretzel"; if(k==="pretzel") return pretzel(x, X, Y, t);
    const b=Math.sin(t*6)*1.2; x.lineCap="round";
    if(k==="bat"){ x.strokeStyle="#c8a060"; x.lineWidth=2.4; x.beginPath(); x.moveTo(X-8, Y-3+b); x.lineTo(X+8, Y-8+b); x.stroke(); x.strokeStyle="#e0bc7c"; x.lineWidth=3.6; x.beginPath(); x.moveTo(X+1, Y-5.8+b); x.lineTo(X+8, Y-8+b); x.stroke(); }
    else for(const o of [-5, 0, 5]){ x.strokeStyle="#d8dce0"; x.lineWidth=1.6; x.beginPath(); x.moveTo(X+o, Y-3+b); x.lineTo(X+o+3, Y-10+b); x.stroke(); x.strokeStyle="#5a3a22"; x.beginPath(); x.moveTo(X+o, Y-3+b); x.lineTo(X+o-1, Y-0.5+b); x.stroke(); } }

  /* ---- the nine streets: each a far picture (sky, hills, what is on them) and a near one, painted once ---- */
  const BGS=[];
  const say=(x, s, cx, cy, w, h, col, weight)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"900", "'Arial Black', Arial"); };
  const PX=0.3;                                                      // how fast the far picture slides, against the street
  function skyPaint(x, Lf, S){
    const g=x.createLinearGradient(0, Y0, 0, GY0); g.addColorStop(0, S.sky[0]); g.addColorStop(1, S.sky[1]); x.fillStyle=g; x.fillRect(0, 0, Lf, H);
    let s=31; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let k=0;k<Lf/3;k++){ x.fillStyle="rgba(255,255,240,"+(0.25+r()*0.65).toFixed(2)+")"; x.fillRect((r()*Lf)|0, Y0+((r()*78)|0), 1, 1); }
    // the moon, three-quarters, and a little cloud across the sky
    const mx=Lf*0.60, my=52; { const h=x.createRadialGradient(mx, my, 4, mx, my, 34); h.addColorStop(0, "rgba(220,226,255,0.22)"); h.addColorStop(1, "rgba(220,226,255,0)"); x.fillStyle=h; x.fillRect(mx-36, my-36, 72, 72); }
    x.fillStyle="#e8e6d4"; x.beginPath(); x.arc(mx, my, 7, 0, 7); x.fill(); x.fillStyle=S.sky[0]; x.globalAlpha=0.55; x.beginPath(); x.arc(mx+3.5, my-1.5, 6, 0, 7); x.fill(); x.globalAlpha=1;
    for(let k=0;k<7;k++){ const cx=r()*Lf, cy=44+r()*46, w=40+r()*70; x.fillStyle="rgba(150,160,200,0.07)"; for(let q=0;q<4;q++){ x.beginPath(); x.ellipse(cx+q*w*0.2, cy+(q%2)*3, w*0.4, 3+r()*3, 0, 0, 7); x.fill(); } }
    // two ridges, the far one paler
    const ridge=(base, a, col)=>{ x.fillStyle=col; x.beginPath(); x.moveTo(0, H); for(let px=0;px<=Lf;px+=8) x.lineTo(px, base-a*Math.sin(px*0.018+1)-a*0.5*Math.sin(px*0.047+base)); x.lineTo(Lf, H); x.closePath(); x.fill(); };
    x.globalAlpha=0.55; ridge(116, 12, S.sky[2]); x.globalAlpha=1; if(S.far) S.far(x, Lf, S); if(!S.water) ridge(134, 16, S.sky[2]);
  }
  // far off: the rest area's water tower on its hill, and the radio mast, a little nearer every stage
  function mastFar(x, px, y0, y1){ for(let y=y0, k=0; y<y1; y+=6, k++){ x.fillStyle=k%2 ? "#c8c8c0" : "#b03a2a"; x.fillRect(px, y, 1.5, 6); }
    x.strokeStyle="rgba(170,176,190,0.28)"; x.lineWidth=0.6; for(const d of [-1, 1]) for(const f of [0.1, 0.45]){ x.beginPath(); x.moveTo(px+0.7, y0+(y1-y0)*f); x.lineTo(px+d*(y1-y0)*0.55, y1+6); x.stroke(); } }
  function farMast(x, Lf, S){ const b=S.beacons[0]; mastFar(x, b[0]*Lf, b[1], 132); }
  function farLot(x, Lf, S){ farMast(x, Lf, S); const px=Lf*0.22, y=104;
    x.strokeStyle="#5a6478"; x.lineWidth=1.2; for(const o of [-7, -2.5, 2.5, 7]){ x.beginPath(); x.moveTo(px+o*0.8, y); x.lineTo(px+o, 132); x.stroke(); } x.beginPath(); x.moveTo(px-6, 120); x.lineTo(px+6, 126); x.moveTo(px+6, 120); x.lineTo(px-6, 126); x.stroke();
    x.fillStyle="#8a96aa"; x.beginPath(); x.ellipse(px, y-6, 13, 8, 0, 0, 7); x.fill(); x.fillStyle="#a8b4c8"; x.beginPath(); x.ellipse(px-3, y-8, 7, 4, 0, 0, 7); x.fill(); x.fillStyle="#b03a2a"; x.fillRect(px-0.5, y-17, 1, 3); }
  // the lake: water to the far shore, the moon laid down it, a few lights across
  function farLake(x, Lf, S){ mastFar(x, S.beacons[0][0]*Lf, S.beacons[0][1], 126);
    const g=x.createLinearGradient(0, 128, 0, GY0); g.addColorStop(0, "#182a4c"); g.addColorStop(1, "#0c1630"); x.fillStyle=g; x.fillRect(0, 128, Lf, H-128);
    x.fillStyle=S.sky[2]; x.fillRect(0, 124, Lf, 5); let s=7; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let k=0;k<26;k++){ x.fillStyle=["#ffd890","#ffe8c0","#ff9a70"][k%3]; x.fillRect((r()*Lf)|0, 126, 1, 1); }
    const mx=Lf*0.60; for(let k=0;k<70;k++){ const y=130+r()*50, w=(2+r()*9)*(1+(y-130)/40); x.fillStyle="rgba(232,230,212,"+(0.10+r()*0.3).toFixed(2)+")"; x.fillRect(mx-w/2+(r()-0.5)*8, y, w, 1); }
    for(let k=0;k<90;k++){ x.fillStyle="rgba(150,180,230,0.10)"; x.fillRect((r()*Lf)|0, 132+((r()*48)|0), 6+r()*14, 1); } }
  function woods(x, L, col){ let s=31; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let px=-8;px<L+8;px+=9+((r()*6)|0)){ const h=20+r()*18; x.fillStyle=col||(r()<0.5 ? "#0e1a12" : "#101e16"); x.beginPath(); x.ellipse(px, GY0-22, 9, h, 0, 0, 7); x.fill(); } }
  function pineRow(x, L, y0, col, step, seed){ let s=seed||5; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let px=-10;px<L+10;px+=step*(0.6+r()*0.8)){ const h=58+r()*52, w=10+r()*6; x.fillStyle=col;
      for(let k=0;k<5;k++){ const yt=y0-h+k*h*0.17, yb=yt+h*0.30, hw=w*(0.35+k*0.17); x.beginPath(); x.moveTo(px, yt); x.lineTo(px+hw, yb); x.lineTo(px-hw, yb); x.closePath(); x.fill(); }
      x.fillRect(px-1.5, y0-h*0.2, 3, h*0.2); } }
  function trail(x, r, L, y, a){ x.fillStyle="rgba(70,40,90,0.55)"; for(let px=10;px<L;px+=24+r()*18){ x.beginPath(); x.ellipse(px, y+Math.sin(px*0.018)*a, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } }
  function gsign(x, px, y, w, h, lines, col){ x.fillStyle="#3a3e44"; x.fillRect(px-w*0.32, y+h, 3, GY0-y-h); x.fillRect(px+w*0.32-3, y+h, 3, GY0-y-h);
    x.fillStyle=col||"#14563a"; x.fillRect(px-w/2, y, w, h); x.strokeStyle="#f1f1ea"; x.lineWidth=1.5; x.strokeRect(px-w/2+2, y+2, w-4, h-4);
    lines.forEach((t, k)=>say(x, t, px, y+h*(k+0.5)/lines.length+(k ? -1 : 1), w*0.78, h/lines.length*0.6, "#f1f1ea")); }
  function pickup(x, px){ x.fillStyle="#4a5a3a"; x.fillRect(px, 138, 120, 26); x.fillRect(px+70, 118, 44, 22); x.fillStyle="#1a2230"; x.fillRect(px+76, 122, 32, 14);
    x.fillStyle="#2f5a96"; for(const dx of [8, 26, 44]){ x.fillRect(px+dx, 116, 15, 24); } x.fillStyle="#1e3c66"; for(const dx of [8, 26, 44]){ x.fillRect(px+dx, 123, 15, 1.5); x.fillRect(px+dx, 131, 15, 1.5); }
    x.fillStyle="#e8e4d0"; x.fillRect(px+116, 144, 4, 5); x.fillStyle="#141416"; for(const wx of [22, 96]){ x.beginPath(); x.arc(px+wx, 166, 10, 0, 7); x.fill(); } x.fillStyle="#8a8d90"; for(const wx of [22, 96]){ x.beginPath(); x.arc(px+wx, 166, 4, 0, 7); x.fill(); } }
  function ground(x, L, c0, c1, lines){
    const g=x.createLinearGradient(0, GY0-6, 0, H); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle=g; x.fillRect(0, GY0-6, L, H-GY0+6);
    let s=77; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let k=0;k<L*1.2;k++){ x.fillStyle=r()<0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.12)"; x.fillRect((r()*L)|0, GY0-6+((r()*(H-GY0+6))|0), 1+((r()*2)|0), 1); }
    if(lines) lines(x, r);
  }
  function lamp(x, px, glow){ x.fillStyle="#3a3e44"; x.fillRect(px-1, 66, 3, GY0-70); x.fillRect(px-9, 64, 20, 3);
    const g=x.createRadialGradient(px, 72, 2, px, 110, 90); g.addColorStop(0, glow); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle=g; x.fillRect(px-90, 60, 180, 150);
    x.fillStyle="#fff0c0"; x.fillRect(px-7, 67, 16, 2); }
  function lot(x, L){
    woods(x, L);
    // the rigs asleep along the back of the lot, marker lamps lit
    for(let k=0;k<5;k++){ const px=40+k*212+(k%2)*30, col=["#c8c8c2","#d8d2c0","#b8bcc0","#d0d0cc","#c0c4b8"][k];
      x.fillStyle=col; x.fillRect(px, 96, 150, 62); x.fillStyle="rgba(0,0,0,0.25)"; x.fillRect(px, 150, 150, 8); for(let j=1;j<10;j++){ x.fillStyle="rgba(0,0,0,0.10)"; x.fillRect(px+j*15, 96, 1, 62); }
      x.fillStyle=["#8a2a22","#2a4a8a","#2a6a3a","#8a6a22","#4a4a52"][k]; x.fillRect(px+154, 118, 34, 42); x.fillRect(px+188, 136, 14, 24); x.fillStyle="#1a2230"; x.fillRect(px+166, 122, 18, 14);
      x.fillStyle="#141416"; for(const wx of [16, 34, 118, 136, 166, 192]){ x.beginPath(); x.arc(px+wx, 164, 8, 0, 7); x.fill(); }
      x.fillStyle="#ffa21c"; for(const mx of [4, 74, 144]) x.fillRect(px+mx, 98, 3, 2); x.fillStyle="#e02a1a"; x.fillRect(px+1, 150, 3, 3); }
    lamp(x, 300, "rgba(255,190,110,0.30)"); lamp(x, 760, "rgba(255,190,110,0.30)");
    ground(x, L, "#3a3c42", "#2a2c32", (x, r)=>{ x.strokeStyle="rgba(232,232,220,0.55)"; x.lineWidth=2; for(let px=20;px<L;px+=62){ x.beginPath(); x.moveTo(px, GY0-4); x.lineTo(px-34, GY0+34); x.stroke(); }
      x.fillStyle="rgba(10,10,12,0.5)"; for(let k=0;k<9;k++){ x.beginPath(); x.ellipse(60+k*118+r()*30, GY0+46+r()*30, 14+r()*10, 4+r()*3, 0, 0, 7); x.fill(); }
      // the trail: drips of diesel, on up the lot
      x.fillStyle="rgba(70,40,90,0.55)"; for(let px=30;px<L;px+=26+r()*18){ x.beginPath(); x.ellipse(px, GY0+50+Math.sin(px*0.02)*14, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } });
    // the way out: the sign at the top of the lot
    { const sx=L-200; x.fillStyle="#3a3e44"; x.fillRect(sx+10, 96, 3, 84); x.fillRect(sx+54, 96, 3, 84); x.fillStyle="#14563a"; x.fillRect(sx, 76, 68, 38); x.strokeStyle="#f1f1ea"; x.lineWidth=1.5; x.strokeRect(sx+2, 78, 64, 34);
      say(x, "EXIT 166", sx+34, 88, 52, 12, "#f1f1ea"); say(x, "EDINBORO", sx+34, 102, 52, 10, "#f1f1ea"); }
  }
  function fuel(x, L){
    woods(x, L);
    // the store along the back, lit; the canopy over the pumps in the middle of it
    x.fillStyle="#c8c2b0"; x.fillRect(60, 104, 300, 64); x.fillStyle="#8a2a22"; x.fillRect(56, 96, 308, 12);
    say(x, "FRENCH CREEK FUEL & MART", 210, 102, 250, 9, "#f4f0e2");
    x.fillStyle="#ffe8b0"; for(const [wx, ww] of [[76, 70],[156, 36],[204, 140]]) x.fillRect(wx, 118, ww, 34); x.fillStyle="#6a5a44"; x.fillRect(156, 118, 36, 50);
    x.fillStyle="rgba(40,30,20,0.5)"; for(let k=0;k<9;k++) x.fillRect(80+k*8, 130, 5, 20); for(let k=0;k<14;k++) x.fillRect(210+k*9, 126+(k%3)*4, 6, 22);
    x.fillStyle="#e8e8ec"; x.fillRect(372, 128, 34, 40); say(x, "ICE", 389, 140, 26, 12, "#2a5aa8");
    const cx0=470, cx1=820; x.fillStyle="#d8d8d2"; x.fillRect(cx0, 70, cx1-cx0, 14); x.fillStyle="#b8302a"; x.fillRect(cx0, 80, cx1-cx0, 4);
    for(const px of [cx0+30, cx0+175, cx1-30]){ x.fillStyle="#b8bcc0"; x.fillRect(px-3, 84, 6, 92); }
    { const g=x.createLinearGradient(0, 84, 0, GY0); g.addColorStop(0, "rgba(255,244,210,0.34)"); g.addColorStop(1, "rgba(255,244,210,0.02)"); x.fillStyle=g; x.fillRect(cx0, 84, cx1-cx0, GY0-84); }
    for(const px of [cx0+70, cx0+120, cx0+240, cx0+290]){ x.fillStyle="#e8e4d8"; x.fillRect(px-9, 128, 18, 44); x.fillStyle="#b8302a"; x.fillRect(px-9, 128, 18, 9); x.fillStyle="#1a1a1e"; x.fillRect(px-6, 141, 12, 9);
      x.fillStyle="#5ad86a"; x.fillRect(px-4, 143, 5, 2); x.strokeStyle="#1a1a1e"; x.lineWidth=1.5; x.beginPath(); x.moveTo(px+9, 150); x.quadraticCurveTo(px+16, 166, px+10, 140); x.stroke(); x.fillStyle="#8a8d90"; x.fillRect(px-11, 172, 22, 4); }
    x.fillStyle="#2a5aa8"; x.fillRect(880, 60, 60, 44); x.fillStyle="#3a3e44"; x.fillRect(908, 104, 4, 76);
    say(x, "DIESEL", 910, 72, 48, 10, "#f4f0e2"); say(x, "3.89", 910, 90, 44, 16, "#f2e23a");
    ground(x, L, "#5a5a56", "#3c3c3a", (x, r)=>{ x.fillStyle="rgba(232,200,60,0.5)"; x.fillRect(cx0, GY0+8, cx1-cx0, 2); x.fillRect(cx0, GY0+60, cx1-cx0, 2);
      x.fillStyle="rgba(10,10,12,0.4)"; for(let k=0;k<8;k++){ x.beginPath(); x.ellipse(cx0+30+k*44+r()*20, GY0+24+r()*30, 12+r()*8, 3+r()*3, 0, 0, 7); x.fill(); }
      x.fillStyle="rgba(70,40,90,0.55)"; for(let px=10;px<L;px+=24+r()*18){ x.beginPath(); x.ellipse(px, GY0+44+Math.sin(px*0.015)*20, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } });
  }
  function outlet(x, L){
    woods(x, L);
    // the outlet: a long tin barn painted red and yellow, its sign bigger than it is; banners; a tent of bargains
    x.fillStyle="#c8281e"; x.fillRect(300, 92, 520, 78); x.fillStyle="#f2c418"; for(let px=300;px<820;px+=52) x.fillRect(px, 92, 26, 78); x.fillStyle="rgba(0,0,0,0.18)"; for(let px=300;px<820;px+=13) x.fillRect(px, 92, 1, 78);
    x.fillStyle="#141416"; x.fillRect(380, 48, 360, 48); x.strokeStyle="#f2c418"; x.lineWidth=2; x.strokeRect(383, 51, 354, 42);
    say(x, "FRENCH CREEK FIREWORKS", 560, 64, 320, 16, "#f2e23a"); say(x, "BUY ONE · GET TWO · OPEN ALL NIGHT", 560, 83, 300, 9, "#ff7a4a");
    x.fillStyle="#2a1a12"; x.fillRect(536, 122, 48, 48); x.fillStyle="#ffe0a0"; x.fillRect(540, 126, 40, 44);
    for(const [bx, col] of [[330,"#3fe0ff"],[440,"#ff4fbf"],[640,"#7aff7a"],[750,"#f2e23a"]]){ x.fillStyle=col; x.beginPath(); x.moveTo(bx, 100); x.lineTo(bx+30, 100); x.lineTo(bx+15, 122); x.closePath(); x.fill(); }
    x.fillStyle="#e8e4d8"; x.beginPath(); x.moveTo(60, 120); x.lineTo(150, 96); x.lineTo(240, 120); x.closePath(); x.fill(); x.fillStyle="#c8281e"; for(let k=0;k<4;k++){ x.beginPath(); x.moveTo(60+k*45, 120); x.lineTo(150, 96); x.lineTo(82+k*45, 120); x.closePath(); x.fill(); }
    x.fillStyle="#8a8d90"; for(const px of [62, 150, 238]) x.fillRect(px-1, 120, 2, 58);
    x.fillStyle="#a8824a"; for(let k=0;k<5;k++) x.fillRect(84+k*26, 154-(k%2)*10, 22, 22+(k%2)*10);
    // the outlet's box truck at the far end, a rocket painted down the side of it
    { const px=L-250; x.fillStyle="#e8e4d8"; x.fillRect(px, 112, 110, 52); x.fillStyle="#c8281e"; x.fillRect(px, 152, 110, 5); x.fillRect(px+112, 130, 34, 34); x.fillStyle="#1a2230"; x.fillRect(px+120, 134, 22, 13);
      x.fillStyle="#f2c418"; x.beginPath(); x.moveTo(px+18, 140); x.lineTo(px+70, 128); x.lineTo(px+80, 134); x.lineTo(px+72, 142); x.closePath(); x.fill(); x.fillStyle="#c8281e"; x.beginPath(); x.moveTo(px+70, 128); x.lineTo(px+92, 126); x.lineTo(px+80, 134); x.closePath(); x.fill();
      x.fillStyle="#141416"; for(const wx of [22, 88, 130]){ x.beginPath(); x.arc(px+wx, 166, 9, 0, 7); x.fill(); } }
    lamp(x, 270, "rgba(255,150,200,0.26)"); lamp(x, 860, "rgba(150,220,255,0.26)");
    ground(x, L, "#6a6458", "#464238", (x, r)=>{ for(let k=0;k<L*0.9;k++){ x.fillStyle=r()<0.5 ? "rgba(200,196,180,0.25)" : "rgba(40,36,30,0.3)"; x.fillRect((r()*L)|0, GY0-4+((r()*(H-GY0))|0), 2, 1); }
      x.fillStyle="rgba(70,40,90,0.55)"; for(let px=10;px<L-150;px+=22+r()*16){ x.beginPath(); x.ellipse(px, GY0+40+Math.sin(px*0.02)*16, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } });
  }
  function ramp(x, L){
    woods(x, L);
    // I-79 behind the rail: the far lanes, their lines; the big green signs over the shoulder
    x.fillStyle="#24262c"; x.fillRect(0, 144, L, 34); x.fillStyle="rgba(232,200,60,0.55)"; x.fillRect(0, 146, L, 1.2); x.fillStyle="rgba(232,232,220,0.55)"; for(let px=0;px<L;px+=44) x.fillRect(px, 158, 18, 1.5);
    gsign(x, 250, 62, 104, 50, ["79 NORTH", "Erie"]); gsign(x, 770, 66, 118, 46, ["EXIT 166", "US 6N   Edinboro"]);
    gsign(x, 520, 122, 30, 26, ["MILE", "165"]); gsign(x, 1010, 104, 62, 30, ["WEIGH STATION", "1 MILE"]);
    // the guardrail, post after post
    x.fillStyle="#5a5e64"; for(let px=6;px<L;px+=22) x.fillRect(px, 164, 3, 16); x.fillStyle="#b4b8bc"; x.fillRect(0, 165, L, 6); x.fillStyle="#8a8e94"; x.fillRect(0, 167.5, L, 1.2); x.fillStyle="#d8dce0"; x.fillRect(0, 165, L, 1);
    x.fillStyle="#e8a020"; for(let px=17;px<L;px+=88) x.fillRect(px, 162, 2, 3);
    ground(x, L, "#3c3e44", "#2c2e34", (x, r)=>{ x.fillStyle="rgba(232,232,220,0.75)"; x.fillRect(0, GY0+3, L, 2);
      x.fillStyle="rgba(0,0,0,0.28)"; for(let px=0;px<L;px+=6) x.fillRect(px, GY0+9, 3, 4);
      for(let k=0;k<L*1.4;k++){ x.fillStyle=r()<0.5 ? "rgba(190,186,170,0.22)" : "rgba(30,28,24,0.3)"; x.fillRect((r()*L)|0, GY0+66+((r()*(H-GY0-66))|0), 2, 1); }
      x.fillStyle="rgba(20,20,22,0.55)"; for(let k=0;k<5;k++){ x.beginPath(); x.ellipse(120+k*210+r()*40, GY0+30+r()*24, 22+r()*14, 2.5, 0, 0, 7); x.fill(); }       // (rubber, where somebody stood on the brakes)
      trail(x, r, L, GY0+42, 12); });
  }
  function liveRamp(x, cam, t, layer){ if(!layer) return;                 // the traffic, both ways, behind the rail
    for(let k=0;k<4;k++){ const v=150+k*37, u=((t*v+k*311)%(W+260))-130, px=k%2 ? W-u : u, y=k%2 ? 151 : 160, d=k%2 ? -1 : 1;
      x.fillStyle="rgba(20,22,28,0.9)"; x.fillRect(px-13, y-5, 26, 6); x.fillRect(px-7, y-9, 13, 5);
      x.fillStyle="#fff6d0"; x.fillRect(px+d*12, y-3, 2, 2); x.fillStyle="rgba(255,246,208,0.16)"; x.fillRect(d>0 ? px+13 : px-43, y-4, 30, 4); x.fillStyle="#e02a1a"; x.fillRect(px-d*13, y-3, 2, 2); } }
  function farm(x, L){
    // the corn across the back, tasselled; the barn and its silos; the board fence; a tractor, the cows, bales
    let s=11; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let px=0;px<L;px+=3){ const h=30+r()*10; x.fillStyle=["#36421e","#44501f","#2c381a"][(r()*3)|0]; x.fillRect(px, GY0-h, 2, h); if(r()<0.5){ x.fillStyle="#a89448"; x.fillRect(px, GY0-h-2, 1, 3); } }
    { const px=250; x.fillStyle="#7e2018"; x.fillRect(px, 104, 150, 72); x.fillStyle="rgba(0,0,0,0.16)"; for(let q=px;q<px+150;q+=6) x.fillRect(q, 104, 1, 72);
      x.fillStyle="#34343a"; x.beginPath(); x.moveTo(px-6, 106); x.lineTo(px+22, 76); x.lineTo(px+56, 60); x.lineTo(px+94, 60); x.lineTo(px+128, 76); x.lineTo(px+156, 106); x.closePath(); x.fill();
      x.fillStyle="#7e2018"; x.beginPath(); x.moveTo(px+4, 106); x.lineTo(px+26, 82); x.lineTo(px+58, 67); x.lineTo(px+92, 67); x.lineTo(px+124, 82); x.lineTo(px+146, 106); x.closePath(); x.fill();
      x.strokeStyle="#e8e4d8"; x.lineWidth=2; x.strokeRect(px+50, 128, 50, 48); x.beginPath(); x.moveTo(px+50, 128); x.lineTo(px+100, 176); x.moveTo(px+100, 128); x.lineTo(px+50, 176); x.stroke(); x.strokeRect(px+64, 80, 22, 18);
      x.fillStyle="#1a1210"; x.fillRect(px+66, 82, 18, 14); x.fillStyle="#c0a040"; x.fillRect(px+66, 90, 18, 6); say(x, "WEIR", px+75, 113, 60, 12, "#e8e4d8"); }
    { const px=430; x.fillStyle="#9aa2ac"; x.fillRect(px, 62, 36, 114); x.fillStyle="#c0c8d0"; x.fillRect(px, 62, 8, 114); x.fillStyle="#6a727c"; for(let y=74;y<176;y+=12) x.fillRect(px, y, 36, 1.5);
      x.fillStyle="#b8c0c8"; x.beginPath(); x.ellipse(px+18, 62, 18, 11, 0, Math.PI, 0); x.fill(); x.fillStyle="#5a626c"; x.fillRect(px+30, 66, 3, 110);
      x.fillStyle="#223c66"; x.fillRect(px+44, 88, 28, 88); x.fillStyle="#2f5088"; x.fillRect(px+44, 88, 6, 88); x.beginPath(); x.ellipse(px+58, 88, 14, 7, 0, Math.PI, 0); x.fill(); }
    x.fillStyle="#6a5a44"; for(let px=4;px<L;px+=34){ if(px>240 && px<520) continue; x.fillRect(px, 156, 3, 24); } x.fillStyle="#8a7a60"; for(const y of [160, 168]){ x.fillRect(0, y, 244, 2); x.fillRect(516, y, L, 2); }
    { const px=610; x.fillStyle="#2f6a34"; x.fillRect(px, 138, 44, 20); x.fillRect(px+30, 120, 20, 20); x.fillStyle="#1a2230"; x.fillRect(px+33, 123, 14, 12); x.fillStyle="#3a3a3e"; x.fillRect(px+8, 122, 3, 16);
      x.fillStyle="#141416"; x.beginPath(); x.arc(px+40, 162, 15, 0, 7); x.fill(); x.beginPath(); x.arc(px+6, 168, 9, 0, 7); x.fill(); x.fillStyle="#f2c418"; x.beginPath(); x.arc(px+40, 162, 6, 0, 7); x.fill(); x.beginPath(); x.arc(px+6, 168, 3.5, 0, 7); x.fill(); }
    for(const [px, f] of [[800, 1], [866, -1], [960, 1]]){ x.fillStyle="#e8e6de"; x.beginPath(); x.ellipse(px, 164, 17, 9, 0, 0, 7); x.fill(); x.fillRect(px-12, 168, 3, 11); x.fillRect(px+9, 168, 3, 11);
      x.fillStyle="#1a1a1c"; x.beginPath(); x.ellipse(px-4*f, 161, 6, 4, 0.4, 0, 7); x.fill(); x.beginPath(); x.ellipse(px+8*f, 167, 4, 3, 0, 0, 7); x.fill();
      x.fillStyle="#e8e6de"; x.beginPath(); x.ellipse(px+19*f, 158, 6, 4.5, 0, 0, 7); x.fill(); x.fillStyle="#1a1a1c"; x.fillRect(px+21*f, 156, 2, 2); x.fillStyle="#e0a8a0"; x.fillRect(px+23*f-1, 159, 3, 2); }
    for(const [px, y] of [[1040, 166], [1066, 166], [1053, 150]]){ x.fillStyle="#c0a040"; x.beginPath(); x.arc(px, y, 12, 0, 7); x.fill(); x.strokeStyle="#8a6a18"; x.lineWidth=1; x.beginPath(); x.arc(px, y, 7, 0, 7); x.stroke(); x.beginPath(); x.arc(px, y, 3, 0, 7); x.stroke(); }
    ground(x, L, "#5c4c36", "#3e3424", (x, r)=>{ x.fillStyle="rgba(30,22,14,0.35)"; x.fillRect(0, GY0+34, L, 5); x.fillRect(0, GY0+58, L, 5);
      for(let px=0;px<L;px+=5){ x.fillStyle=r()<0.5 ? "#3a5a2a" : "#2c4a22"; x.fillRect(px, GY0-6-r()*3, 2, 5+r()*3); }
      x.fillStyle="rgba(190,170,90,0.4)"; for(let k=0;k<160;k++) x.fillRect((r()*L)|0, GY0+((r()*(H-GY0))|0), 4, 1);
      trail(x, r, L, GY0+46, 8); });
  }
  function pines(x, L){
    pineRow(x, L, GY0-6, "#0a1410", 13, 3); pineRow(x, L, GY0-2, "#11201a", 23, 9);
    // the lane's trailers, each with its awning and its deck; a canned-ham camper; the lights strung down the lane
    const trailer=(px, col, aw)=>{ x.fillStyle="#3a3a3e"; x.fillRect(px+4, 166, 132, 10); x.fillStyle=col; x.fillRect(px, 122, 140, 46); x.fillStyle="rgba(0,0,0,0.12)"; for(let y=128;y<168;y+=5) x.fillRect(px, y, 140, 1);
      x.fillStyle="#d8d4c8"; x.fillRect(px-2, 119, 144, 4); x.fillStyle="#ffe8b0"; x.fillRect(px+14, 132, 30, 16); x.fillRect(px+104, 132, 22, 16); x.fillStyle="rgba(60,40,20,0.5)"; x.fillRect(px+28, 132, 2, 16); x.fillRect(px+14, 139, 30, 1.5);
      x.fillStyle="#5a4a3a"; x.fillRect(px+64, 130, 20, 38); x.fillStyle="#f2c418"; x.fillRect(px+80, 148, 2, 2);
      for(let k=0;k<6;k++){ x.fillStyle=k%2 ? "#e8e4d8" : aw; x.beginPath(); x.moveTo(px+52+k*8, 124); x.lineTo(px+60+k*8, 124); x.lineTo(px+58+k*9.5, 136); x.lineTo(px+48+k*9.5, 136); x.closePath(); x.fill(); }
      x.fillStyle="#7a6248"; x.fillRect(px+50, 168, 52, 4); x.fillRect(px+52, 172, 3, 8); x.fillRect(px+97, 172, 3, 8); };
    trailer(96, "#c8d0c8", "#2f6a34"); trailer(452, "#d8ccb0", "#8a2a22"); trailer(806, "#b8c4d0", "#2a4a8a");
    { const px=660; x.fillStyle="#e8e2cc"; x.beginPath(); x.moveTo(px, 172); x.lineTo(px, 150); x.quadraticCurveTo(px+4, 128, px+30, 126); x.lineTo(px+62, 126); x.quadraticCurveTo(px+86, 130, px+90, 152); x.lineTo(px+90, 172); x.closePath(); x.fill();
      x.fillStyle="#3aa8a0"; x.fillRect(px, 156, 90, 16); x.fillStyle="#ffe8b0"; x.fillRect(px+14, 136, 22, 14); x.fillStyle="#5a4a3a"; x.fillRect(px+52, 134, 16, 38); x.fillStyle="#141416"; x.beginPath(); x.arc(px+34, 174, 7, 0, 7); x.fill(); x.fillStyle="#8a8d90"; x.fillRect(px-12, 168, 12, 2); }
    for(let px=40;px<L;px+=180){ x.fillStyle="#4a3a2a"; x.fillRect(px, 96, 2.5, 84); if(px+180<L+60){ x.strokeStyle="rgba(20,20,20,0.8)"; x.lineWidth=1; x.beginPath(); x.moveTo(px+1, 98); x.quadraticCurveTo(px+90, 124, px+181, 98); x.stroke();
        for(let k=1;k<12;k++){ const u=k/12, bx=px+1+180*u, by=98+52*u*(1-u); x.fillStyle=["#ffd860","#ff7a5a","#7ad8ff","#9aff8a"][k%4]; x.fillRect(bx-1, by, 2.5, 3); x.fillStyle="rgba(255,230,160,0.10)"; x.beginPath(); x.arc(bx, by+1, 6, 0, 7); x.fill(); } } }
    // two fire rings by the lane (their flames are the stage's `live`), a picnic table
    for(const px of FIRES){ x.fillStyle="#6a6a6e"; x.beginPath(); x.ellipse(px, GY0-1, 13, 4, 0, 0, 7); x.fill(); x.fillStyle="#1a1410"; x.beginPath(); x.ellipse(px, GY0-1.5, 10, 2.8, 0, 0, 7); x.fill(); x.fillStyle="#4a3220"; x.fillRect(px-8, GY0-5, 16, 3); }
    { const px=372; x.fillStyle="#8a6a44"; x.fillRect(px, 162, 40, 3); x.fillRect(px-4, 170, 48, 2.5); x.fillRect(px+6, 165, 3, 14); x.fillRect(px+31, 165, 3, 14); }
    ground(x, L, "#4c463a", "#343028", (x, r)=>{ for(let k=0;k<L*1.2;k++){ x.fillStyle=r()<0.5 ? "rgba(180,170,150,0.20)" : "rgba(120,70,30,0.30)"; x.fillRect((r()*L)|0, GY0-4+((r()*(H-GY0))|0), 3, 1); }
      trail(x, r, L, GY0+40, 14); });
  }
  const FIRES=[330, 940];
  function livePines(x, cam, t, layer){ if(!layer) return;
    for(const fx of FIRES){ const X=fx-cam; if(X<-80 || X>W+80) continue; const f=0.8+0.2*Math.sin(t*13+fx)+0.1*Math.sin(t*29);
      const g=x.createRadialGradient(X, GY0-8, 2, X, GY0-8, 62*f); g.addColorStop(0, "rgba(255,170,70,0.34)"); g.addColorStop(1, "rgba(255,120,40,0)"); x.fillStyle=g; x.fillRect(X-70, GY0-78, 140, 110);
      for(let k=0;k<3;k++){ const w=5-k*1.4, h=(15-k*4)*f*(1+0.2*Math.sin(t*17+k*2)); x.fillStyle=["#e8501a","#ffa028","#ffe890"][k]; x.beginPath(); x.moveTo(X-w, GY0-3); x.quadraticCurveTo(X+Math.sin(t*9+k)*3, GY0-3-h*1.5, X+w, GY0-3); x.closePath(); x.fill(); }
      for(let k=0;k<4;k++){ const u=(t*0.5+k*0.27)%1; x.fillStyle="rgba(255,190,90,"+(0.8*(1-u)).toFixed(2)+")"; x.fillRect(X+Math.sin(u*7+k*3)*7, GY0-12-u*44, 1.5, 1.5); } } }
  function street(x, L){
    woods(x, L, "#0e1814");
    // Lake Street's houses: a Cape Cod, a ranch with its garage, a two-storey, a bungalow; mail boxes, a hoop over a drive, a car at the kerb
    const win=(wx, wy, w, h, on)=>{ x.fillStyle=on ? "#ffe2a0" : "#1a2234"; x.fillRect(wx, wy, w, h); x.fillStyle="rgba(40,30,20,0.6)"; x.fillRect(wx+w/2-0.5, wy, 1, h); x.fillRect(wx, wy+h/2-0.5, w, 1); x.strokeStyle="#e8e4d8"; x.lineWidth=1; x.strokeRect(wx-0.5, wy-0.5, w+1, h+1); };
    const door=(dx, col)=>{ x.fillStyle=col; x.fillRect(dx, 148, 12, 24); x.fillStyle="#ffe8a0"; x.fillRect(dx+14, 146, 2, 3); x.fillStyle="rgba(255,232,160,0.14)"; x.beginPath(); x.arc(dx+15, 148, 12, 0, 7); x.fill(); x.fillStyle="#8a8880"; x.fillRect(dx-3, 172, 18, 3); };
    { const px=40; x.fillStyle="#c8c0a8"; x.fillRect(px, 132, 120, 42); x.fillStyle="#3a3238"; x.beginPath(); x.moveTo(px-6, 134); x.lineTo(px+60, 92); x.lineTo(px+126, 134); x.closePath(); x.fill();
      for(const dx of [28, 78]){ x.fillStyle="#c8c0a8"; x.fillRect(px+dx, 108, 16, 16); x.fillStyle="#3a3238"; x.beginPath(); x.moveTo(px+dx-2, 109); x.lineTo(px+dx+8, 100); x.lineTo(px+dx+18, 109); x.closePath(); x.fill(); win(px+dx+4, 112, 8, 9, dx<50); }
      win(px+14, 144, 20, 16, true); win(px+88, 144, 20, 16, false); door(px+54, "#7a2a22"); x.fillStyle="#7a3a2a"; x.fillRect(px+96, 84, 10, 22); }
    { const px=250; x.fillStyle="#a8b0a0"; x.fillRect(px, 138, 200, 36); x.fillStyle="#4a4038"; x.beginPath(); x.moveTo(px-8, 140); x.lineTo(px+20, 120); x.lineTo(px+180, 120); x.lineTo(px+208, 140); x.closePath(); x.fill();
      win(px+16, 148, 26, 14, true); win(px+84, 148, 18, 14, true); door(px+56, "#2a4a6a"); x.fillStyle="#e8e4d8"; x.fillRect(px+124, 146, 62, 28); x.fillStyle="rgba(0,0,0,0.14)"; for(let y=152;y<174;y+=6) x.fillRect(px+124, y, 62, 1); }
    { const px=540; x.fillStyle="#d0c8b8"; x.fillRect(px, 100, 110, 74); x.fillStyle="#2e3440"; x.beginPath(); x.moveTo(px-8, 102); x.lineTo(px+55, 70); x.lineTo(px+118, 102); x.closePath(); x.fill();
      win(px+14, 112, 18, 18, false); win(px+78, 112, 18, 18, true); win(px+14, 146, 18, 18, true); win(px+78, 146, 18, 18, true); door(px+48, "#3a5a3a"); x.fillStyle="#b8b0a0"; x.fillRect(px+36, 140, 38, 3); x.fillRect(px+38, 143, 2, 30); x.fillRect(px+70, 143, 2, 30); }
    { const px=830; x.fillStyle="#b0a890"; x.fillRect(px, 130, 130, 44); x.fillStyle="#463a30"; x.beginPath(); x.moveTo(px-8, 132); x.lineTo(px+10, 104); x.lineTo(px+120, 104); x.lineTo(px+138, 132); x.closePath(); x.fill();
      x.fillStyle="#b0a890"; x.fillRect(px+48, 108, 34, 16); win(px+54, 111, 22, 10, true); win(px+12, 144, 22, 16, true); win(px+96, 144, 22, 16, false); door(px+58, "#6a3a22"); for(const dx of [40, 86]){ x.fillStyle="#e8e4d8"; x.fillRect(px+dx, 134, 3, 40); } }
    for(const px of [190, 480, 700, 1000]){ x.fillStyle="#5a5048"; x.fillRect(px, 162, 2, 16); x.fillStyle="#2a2a30"; x.fillRect(px-4, 157, 10, 6); x.fillStyle="#c8281e"; x.fillRect(px+5, 155, 1.5, 4); }
    { const px=494; x.fillStyle="#6a6e74"; x.fillRect(px, 104, 3, 74); x.fillRect(px, 104, 14, 2.5); x.fillStyle="#e8e4d8"; x.fillRect(px+12, 96, 3, 24); x.fillRect(px+13, 96, 20, 22); x.strokeStyle="#c8281e"; x.lineWidth=1; x.strokeRect(px+18, 105, 10, 8); x.fillStyle="#e8602a"; x.fillRect(px+16, 117, 14, 1.5); x.strokeStyle="rgba(240,240,240,0.6)"; x.beginPath(); x.moveTo(px+17, 119); x.lineTo(px+20, 127); x.lineTo(px+26, 127); x.lineTo(px+29, 119); x.stroke(); }
    { const px=706; x.fillStyle="#3a5a7a"; x.beginPath(); x.moveTo(px, 172); x.lineTo(px+2, 160); x.lineTo(px+20, 158); x.lineTo(px+30, 148); x.lineTo(px+62, 148); x.lineTo(px+74, 158); x.lineTo(px+92, 161); x.lineTo(px+94, 172); x.closePath(); x.fill();
      x.fillStyle="#1a2230"; x.beginPath(); x.moveTo(px+24, 158); x.lineTo(px+32, 150); x.lineTo(px+60, 150); x.lineTo(px+70, 158); x.closePath(); x.fill(); x.fillStyle="#141416"; for(const wx of [20, 74]){ x.beginPath(); x.arc(px+wx, 173, 7, 0, 7); x.fill(); } x.fillStyle="#e02a1a"; x.fillRect(px, 162, 2, 3); }
    x.fillStyle="#8a8880"; x.fillRect(0, 174, L, 7); x.fillStyle="#a8a69c"; x.fillRect(0, 174, L, 1.5); x.fillStyle="rgba(0,0,0,0.25)"; for(let px=0;px<L;px+=26) x.fillRect(px, 174, 1, 7);
    lamp(x, 222, "rgba(255,200,130,0.26)"); lamp(x, 786, "rgba(255,200,130,0.26)");
    ground(x, L, "#36383e", "#26282e", (x, r)=>{ x.fillStyle="rgba(232,200,60,0.6)"; for(let px=0;px<L;px+=40){ x.fillRect(px, GY0+42, 22, 1.5); x.fillRect(px, GY0+46, 22, 1.5); }
      x.fillStyle="rgba(10,10,12,0.4)"; for(let k=0;k<6;k++){ x.beginPath(); x.ellipse(90+k*180+r()*40, GY0+18+r()*50, 16+r()*10, 3+r()*3, 0, 0, 7); x.fill(); }
      x.fillStyle="#4a4c52"; for(const px of [300, 850]){ x.beginPath(); x.ellipse(px, GY0+70, 9, 3, 0, 0, 7); x.fill(); }
      trail(x, r, L, GY0+30, 10); });
  }
  function brew(x, L){
    // the brewery's lake end: the taproom, its windows on the kettles; the deck's rail and its lights; a pontoon tied up, chairs
    { const px=24; x.fillStyle="#46301e"; x.fillRect(px, 92, 268, 86); x.fillStyle="rgba(0,0,0,0.20)"; for(let q=px;q<px+268;q+=9) x.fillRect(q, 92, 1, 86); x.fillStyle="#6a727a"; x.beginPath(); x.moveTo(px-8, 94); x.lineTo(px+134, 62); x.lineTo(px+276, 94); x.closePath(); x.fill();
      x.fillStyle="rgba(0,0,0,0.2)"; for(let q=0;q<14;q++){ x.beginPath(); x.moveTo(px+134, 62); x.lineTo(px-8+q*21.8, 94); x.lineTo(px-6+q*21.8, 94); x.closePath(); x.fill(); }
      x.fillStyle="#1a1410"; x.fillRect(px+44, 98, 180, 22); x.strokeStyle="#d8a040"; x.lineWidth=1.5; x.strokeRect(px+46, 100, 176, 18); say(x, "LAKESHORE BREWING CO.", px+134, 109, 150, 10, "#f2d890");
      for(const wx of [18, 98, 178]){ x.fillStyle="#ffcf80"; x.fillRect(px+wx, 128, 62, 40); x.fillStyle="#b8703a"; x.fillRect(px+wx+8, 136, 16, 32); x.beginPath(); x.ellipse(px+wx+16, 136, 8, 4, 0, Math.PI, 0); x.fill(); x.fillStyle="#c8c8cc"; x.fillRect(px+wx+34, 140, 14, 28); x.beginPath(); x.ellipse(px+wx+41, 140, 7, 3.5, 0, Math.PI, 0); x.fill();
        x.strokeStyle="#2a1c10"; x.lineWidth=2; x.strokeRect(px+wx, 128, 62, 40); x.beginPath(); x.moveTo(px+wx+31, 128); x.lineTo(px+wx+31, 168); x.stroke(); } }
    { const px=720, y=158; x.fillStyle="#c8ccd0"; x.fillRect(px, y, 96, 5); x.beginPath(); x.ellipse(px+96, y+2.5, 6, 2.5, 0, 0, 7); x.fill(); x.fillStyle="#e8e4d8"; x.fillRect(px+6, y-9, 80, 9); x.fillStyle="#2a5a8a"; x.fillRect(px+6, y-4, 80, 2); x.fillStyle="#3a3a3e"; for(const dx of [10, 82]) x.fillRect(px+dx, y-28, 1.5, 20); x.fillStyle="#2a5a8a"; x.fillRect(px+4, y-31, 86, 4); x.fillStyle="#1a1a1e"; x.fillRect(px-4, y-10, 6, 12);
      x.fillStyle="rgba(232,230,212,0.16)"; x.fillRect(px-4, y+6, 108, 1.5); }
    // the rail along the water side, and the lights over it
    x.fillStyle="#5a4630"; for(let px=300;px<L;px+=40) x.fillRect(px, 150, 4, 30); x.fillRect(296, 150, L, 3); x.fillRect(296, 162, L, 2); x.fillStyle="rgba(90,70,48,0.8)"; for(let px=306;px<L;px+=6) x.fillRect(px, 152, 1, 28);
    for(let px=296;px<L;px+=150){ x.fillStyle="#4a3a2a"; x.fillRect(px, 92, 3, 88); x.strokeStyle="rgba(20,20,20,0.8)"; x.lineWidth=1; x.beginPath(); x.moveTo(px+1, 94); x.quadraticCurveTo(px+75, 116, px+151, 94); x.stroke();
      for(let k=1;k<12;k++){ const u=k/12, bx=px+1+150*u, by=94+44*u*(1-u); x.fillStyle="#ffe090"; x.fillRect(bx-1, by, 2.5, 3); x.fillStyle="rgba(255,224,144,0.10)"; x.beginPath(); x.arc(bx, by+1, 7, 0, 7); x.fill(); } }
    for(const px of [900, 940]){ x.fillStyle="#c8281e"; x.beginPath(); x.moveTo(px, 180); x.lineTo(px+3, 158); x.lineTo(px+8, 158); x.lineTo(px+9, 172); x.lineTo(px+22, 172); x.lineTo(px+22, 180); x.closePath(); x.fill(); x.fillRect(px+7, 166, 16, 2); }
    ground(x, L, "#6c5038", "#4a3626", (x, r)=>{ x.fillStyle="rgba(20,12,6,0.35)"; for(let y=GY0+3;y<H;y+=9) x.fillRect(0, y, L, 1); for(let y=GY0-6, k=0;y<H;y+=9, k++) for(let px=(k%3)*47;px<L;px+=140) x.fillRect(px, y, 1, 9);
      // a pair of cornhole boards, and the bags that missed
      for(const px of [470, 640]){ x.fillStyle="#d8ccb0"; x.beginPath(); x.moveTo(px, GY0+72); x.lineTo(px+30, GY0+72); x.lineTo(px+26, GY0+58); x.lineTo(px+4, GY0+58); x.closePath(); x.fill(); x.fillStyle="#1a1410"; x.beginPath(); x.ellipse(px+15, GY0+62, 3.5, 1.6, 0, 0, 7); x.fill(); }
      x.fillStyle="#c8281e"; x.fillRect(520, GY0+70, 6, 4); x.fillStyle="#2a5a8a"; x.fillRect(600, GY0+64, 6, 4);
      trail(x, r, L, GY0+36, 12); });
  }
  const MAST=640;
  function tower(x, L){
    woods(x, L, "#0c1612");
    // French Creek Broadcasting: the cream block with its round end and glass brick; then the mast, its guys and its fence
    { const px=70; x.fillStyle="#d8d0b8"; x.fillRect(px, 116, 220, 60); x.beginPath(); x.ellipse(px+220, 146, 34, 30, 0, -Math.PI/2, Math.PI/2); x.fill(); x.fillStyle="#b8b098"; x.fillRect(px-3, 112, 226, 5); x.beginPath(); x.ellipse(px+220, 116, 37, 5, 0, -Math.PI/2, Math.PI/2); x.fill();
      x.fillStyle="#8a2a22"; for(const y of [126, 131, 136]) x.fillRect(px, y, 250, 1.5);
      x.fillStyle="#bfe8d8"; x.fillRect(px+206, 142, 40, 30); x.fillStyle="rgba(40,70,60,0.5)"; for(let q=0;q<8;q++) x.fillRect(px+206+q*5, 142, 1, 30); for(let q=0;q<6;q++) x.fillRect(px+206, 142+q*5, 40, 1);
      { const g=x.createRadialGradient(px+226, 157, 4, px+226, 157, 60); g.addColorStop(0, "rgba(190,240,220,0.22)"); g.addColorStop(1, "rgba(190,240,220,0)"); x.fillStyle=g; x.fillRect(px+160, 100, 140, 110); }
      x.fillStyle="#ffe2a0"; x.fillRect(px+20, 144, 46, 18); x.fillRect(px+120, 144, 46, 18); x.fillStyle="rgba(40,30,20,0.6)"; for(const wx of [43, 143]) x.fillRect(px+wx-0.5, 144, 1, 18); x.fillStyle="#3a2a20"; x.fillRect(px+84, 142, 18, 34);
      x.fillStyle="#3a3a3e"; x.fillRect(px+40, 106, 2, 8); x.fillRect(px+178, 106, 2, 8); x.fillStyle="#14101a"; x.fillRect(px+16, 92, 188, 15); say(x, "FRENCH CREEK BROADCASTING", px+110, 100, 172, 9, "#ffd890"); x.fillStyle="#1a0a0a"; x.fillRect(px+78, 132, 30, 8); say(x, "ON AIR", px+93, 136, 24, 5, "#ff3a2a"); }
    for(const [f, w] of [[0.16, 170], [0.42, 150], [0.70, 124]]) for(const d of [-1, 1]){ x.strokeStyle="rgba(190,196,208,0.45)"; x.lineWidth=0.8; x.beginPath(); x.moveTo(MAST, Y0+(170-Y0)*f); x.lineTo(MAST+d*w, 178); x.stroke(); }
    for(const d of [-1, 1]) for(const w of [170, 150, 124]){ x.fillStyle="#6a6a6e"; x.fillRect(MAST+d*w-3, 175, 6, 5); }
    for(let y=Y0-4, k=0; y<166; y+=18, k++){ x.fillStyle=k%2 ? "#d8d8d0" : "#b8301e"; x.fillRect(MAST-4, y, 1.6, 18); x.fillRect(MAST+2.4, y, 1.6, 18); x.strokeStyle=k%2 ? "rgba(216,216,208,0.8)" : "rgba(184,48,30,0.8)"; x.lineWidth=0.8;
      x.beginPath(); x.moveTo(MAST-3, y); x.lineTo(MAST+3, y+6); x.lineTo(MAST-3, y+12); x.lineTo(MAST+3, y+18); x.stroke(); }
    x.fillStyle="#e8e4d8"; x.beginPath(); x.moveTo(MAST-3, 166); x.lineTo(MAST+3, 166); x.lineTo(MAST+1, 172); x.lineTo(MAST-1, 172); x.closePath(); x.fill(); x.fillStyle="#8a8a8e"; x.fillRect(MAST-6, 172, 12, 6);
    x.fillStyle="#b8b8b0"; x.fillRect(MAST+26, 156, 30, 22); x.fillStyle="#8a8a84"; x.fillRect(MAST+24, 154, 34, 3); x.fillStyle="#3a3a3e"; x.fillRect(MAST+36, 162, 9, 16);
    x.strokeStyle="rgba(170,176,184,0.55)"; x.lineWidth=0.6; for(let q=-52;q<=72;q+=4){ x.beginPath(); x.moveTo(MAST+q, 152); x.lineTo(MAST+q+14, 180); x.moveTo(MAST+q, 152); x.lineTo(MAST+q-14, 180); x.stroke(); }
    x.fillStyle="#9aa0a8"; x.fillRect(MAST-56, 151, 132, 1.5); for(let q=-56;q<=76;q+=22) x.fillRect(MAST+q, 150, 2, 30);
    x.fillStyle="#f2c418"; x.fillRect(MAST-30, 160, 20, 10); say(x, "DANGER", MAST-20, 163, 16, 3.5, "#1a1a1a"); say(x, "RF", MAST-20, 167.5, 10, 3.5, "#1a1a1a");
    pickup(x, L-236);
    ground(x, L, "#5a564c", "#3c3a34", (x, r)=>{ for(let px=0;px<L;px+=5){ x.fillStyle=r()<0.5 ? "#34522a" : "#2a4422"; x.fillRect(px, GY0-6-r()*2, 2, 4+r()*3); }
      for(let k=0;k<L;k++){ x.fillStyle=r()<0.5 ? "rgba(200,196,180,0.22)" : "rgba(40,36,30,0.3)"; x.fillRect((r()*L)|0, GY0+((r()*(H-GY0))|0), 2, 1); }
      x.fillStyle="rgba(70,40,90,0.55)"; for(let px=10;px<L-150;px+=22+r()*16){ x.beginPath(); x.ellipse(px, GY0+40+Math.sin(px*0.02)*16, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } });
  }
  // a red lamp that comes and goes, with its glow
  function beacon(x, X, Y, on, r){ if(X<-20 || X>W+20) return; x.fillStyle=on ? "#ff4030" : "#5a1a14"; x.fillRect(X-1, Y-1, r>1 ? 3 : 2, r>1 ? 3 : 2);
    if(on){ const g=x.createRadialGradient(X, Y, 0, X, Y, 9*r); g.addColorStop(0, "rgba(255,70,50,0.5)"); g.addColorStop(1, "rgba(255,70,50,0)"); x.fillStyle=g; x.fillRect(X-9*r, Y-9*r, 18*r, 18*r); } }
  function liveTower(x, cam, t, layer){ if(!layer) return; const on=(t%1.6)<0.8; beacon(x, MAST-cam, Y0+3, on, 1.6); beacon(x, MAST-cam, Y0+(170-Y0)*0.42, true, 1.1); beacon(x, MAST-cam, Y0+(170-Y0)*0.70, on, 1.6); }
  // a rocket from behind the outlet, now and then
  function liveOutlet(x, cam, t, layer){ if(layer) return; const T=5.2, n=Math.floor(t/T), u=(t-n*T), sx=((n*97)%200)+60, sy=44+((n*53)%34), col=["#ff5fb0","#7ad8ff","#f2e23a","#9aff8a"][n%4];
    if(u<0.9){ const k=u/0.9; x.fillStyle="#ffe8a0"; x.fillRect(sx, GY0-40-(GY0-40-sy)*k, 1.5, 4); }
    else if(u<2.4){ const k=(u-0.9)/1.5, R=8+34*Math.sqrt(k); x.fillStyle=col; x.globalAlpha=1-k; for(let q=0;q<18;q++){ const a=q*0.349+n; x.fillRect(sx+Math.cos(a)*R, sy+Math.sin(a)*R+k*k*10, 2, 2); x.fillRect(sx+Math.cos(a+0.17)*R*0.6, sy+Math.sin(a+0.17)*R*0.6+k*k*10, 1, 1); } x.globalAlpha=1; } }
  function backdrop(k){ if(BGS[k]) return BGS[k]; const S=STAGES[k], L=S.len+80, Lf=W+Math.ceil(L*PX)+4;
    const far=cvs(Lf, H), near=cvs(L, H); skyPaint(far.getContext("2d"), Lf, S); S.paint(near.getContext("2d"), L); return BGS[k]={far:far, near:near, Lf:Lf}; }
  // the street behind everybody: the far picture at a third of the camera's pace, what moves on it, the near one, what moves on that
  function back(x, k, cam, t){ const S=STAGES[k], B=backdrop(k), cf=Math.round(cam*PX);
    x.drawImage(B.far, cf, 0, W, H, 0, 0, W, H);
    if(S.beacons) for(const b of S.beacons) beacon(x, b[0]*B.Lf-cf, b[1], (t%1.6)<0.8, 1);
    if(S.live) S.live(x, cam, t, 0);
    x.drawImage(B.near, cam, 0, W, H, 0, 0, W, H);
    if(S.live) S.live(x, cam, t, 1); }

  function scene(x, G, t){
    const cam=Math.round(G.cam);
    back(x, G.stage, cam, t);
    const L=[]; for(const q of G.props) L.push({z:q.z, q:q}); for(const e of G.ents) L.push({z:e.z+(e.st==="down" || e.st==="dead" ? -3 : 0), e:e}); for(const l of G.loot) L.push({z:l.z-1, l:l});
    L.sort((a, b)=>a.z-b.z);
    for(const o of L){ if(o.q) drawProp(x, o.q, cam); else if(o.e) drawBody(x, o.e, cam, t); else lootPic(x, Math.round(o.l.x-cam), GY0+o.l.z, o.l, t); }
    // a knife in the air, turning
    for(const q of G.shots){ const X=q.x-cam, Y=GY0+q.z-q.y, a=q.t*26*q.dir; x.lineCap="round"; x.strokeStyle="#e8ecf0"; x.lineWidth=1.8; x.beginPath(); x.moveTo(X-Math.cos(a)*5, Y-Math.sin(a)*5); x.lineTo(X+Math.cos(a)*5, Y+Math.sin(a)*5); x.stroke();
      x.strokeStyle="#5a3a22"; x.beginPath(); x.moveTo(X-Math.cos(a)*5, Y-Math.sin(a)*5); x.lineTo(X-Math.cos(a)*2, Y-Math.sin(a)*2); x.stroke(); x.fillStyle="rgba(0,0,0,0.3)"; x.fillRect(X-4, GY0+q.z, 8, 1.5); }
    for(const o of G.fx){ const X=o.x-cam, Y=GY0+o.z-o.y, u=o.t/0.22, r=(o.big ? 9 : 6)*(0.5+u);
      x.strokeStyle="rgba(255,240,170,"+(1-u).toFixed(2)+")"; x.lineWidth=2; for(let k=0;k<6;k++){ const a=k*1.05+0.3; x.beginPath(); x.moveTo(X+Math.cos(a)*r*0.4, Y+Math.sin(a)*r*0.4); x.lineTo(X+Math.cos(a)*r, Y+Math.sin(a)*r); x.stroke(); } }
    x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 9);
    for(const o of G.pops){ x.fillStyle="#f2e23a"; x.globalAlpha=Math.max(0, 1-o.t/1.1); x.fillText(o.txt, clamp(o.x-cam, 40, W-40), GY0+o.z-44-o.t*16); x.globalAlpha=1; }
  }
  function bar(x, X, Y, w, v, col){ x.fillStyle="#2a0c0c"; x.fillRect(X, Y, w, 6); x.fillStyle=col; x.fillRect(X, Y, Math.max(0, Math.round(w*clamp(v, 0, 1))), 6); x.strokeStyle="#e8e8e0"; x.lineWidth=1; x.strokeRect(X-0.5, Y-0.5, w+1, 7); }
  function hud(x, G, i, t){
    x.fillStyle="#000"; x.fillRect(0, 0, W, Y0-2); x.textBaseline="middle"; _cbFont(x, 10);
    x.textAlign="left"; x.fillStyle="#ff8a6a"; x.fillText("DALE", 12, 9); bar(x, 12, 15, 78, G.p.hp/KIND.dale.hp, G.p.hp>30 ? "#f2c418" : "#e8402a");
    x.fillStyle="#1f4e8c"; for(let k=0;k<Math.min(4, G.lives-1);k++){ x.fillRect(46+k*11, 6, 7, 4); x.fillRect(46+k*11+4, 9, 5, 1.5); }
    if(G.p.wpn){ x.textAlign="left"; x.fillStyle=G.p.wpn.kind==="bat" ? "#e0bc7c" : "#d8dce0"; x.fillText((G.p.wpn.kind==="bat" ? "BAT " : "KNIFE ")+G.p.wpn.n, 96, 9); }
    x.textAlign="center"; x.fillStyle="#e8e8e0"; x.fillText(String(G.score).padStart(6, "0"), W/2, 9); x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[i]||0)).padStart(6, "0"), W/2, 19);
    if(G.tgt && G.tgtT>0 && G.tgt.hp>0){ x.textAlign="right"; x.fillStyle="#8ad0ff"; x.fillText(G.tgt.K.name, W-12, 9); bar(x, W-90, 15, 78, G.tgt.hp/G.tgt.K.hp, "#5ac8ff"); }
    if(G.go>0 && ((t*5)|0)%2){ x.fillStyle="#f2e23a"; _cbFont(x, 16); x.textAlign="right"; x.fillText("GO", W-34, 52); x.beginPath(); x.moveTo(W-30, 44); x.lineTo(W-14, 52); x.lineTo(W-30, 60); x.closePath(); x.fill(); }
  }
  // the attract mode's own little fight: Dale and a punk on the first street, going through the moves
  function demoFight(x, t){
    const cam=((t*14)%300)|0; back(x, 0, 60+cam, t);
    const u=(t*1.4)%4, k=Math.floor(u), f=u-k, P=KIND.dale.pal, Q=KIND.punk.pal, gy=GY0+52;
    const shadow=(X)=>{ x.fillStyle="rgba(0,0,0,0.32)"; x.beginPath(); x.ellipse(X, gy+1, 9, 2.6, 0, 0, 7); x.fill(); };
    shadow(138); shadow(k===3 ? 196 : 164);
    figure(x, 138, gy, 1, k===0 ? (f<0.5 ? "punch1" : "idle") : k===1 ? (f<0.5 ? "punch2" : "idle") : k===2 ? (f<0.6 ? "upper" : "idle") : "idle", P, 1, t*9, false, "dale");
    if(k===3){ x.save(); x.translate(196, gy-Math.sin(Math.min(1, f*1.6)*Math.PI)*16); if(f>0.55){ x.rotate(Math.PI/2*0.94); x.translate(0, -3); } figure(x, 0, 0, -1, "hurt", Q, 0.98, 0, false, "punk"); x.restore(); }
    else figure(x, 164, gy, -1, f<0.3 ? "hurt" : "idle", Q, 0.98, t*8, f<0.08, "punk");
  }

  return {
    name:"EXIT 166 RUMBLE", col:"#ff8a6a",
    help:"EXIT 166 RUMBLE · ARROWS OR WASD WALK · SPACE PUNCHES, OR USES WHAT YOU PICKED UP · K KICKS · L JUMPS · ESC TO STEP AWAY",
    newGame(){ const G={seed:(Date.now()>>>0)||9, score:0, lives:3, over:false, won:false, t:0, acc:0, loop:0, fast:1, in:{punchT:0, kickT:0, jumpT:0}, p:body("dale", 30, 46, 1), ents:[], props:[], loot:[], fx:[], pops:[], shots:[]};
      startStage(G, 0); return G; },
    key(G, e){ if(e.repeat) return;
      if(e.code==="Space" || e.code==="KeyJ" || e.code==="KeyZ") G.in.punchT=0.16;
      else if(e.code==="KeyK" || e.code==="KeyX") G.in.kickT=0.16;
      else if(e.code==="KeyL" || e.code==="KeyC" || e.code==="ShiftLeft" || e.code==="ShiftRight") G.in.jumpT=0.16; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over || G.won) return; G.acc+=dt; while(G.acc>=1/120){ G.acc-=1/120; frame(G, K, i, 1/120); if(G.over || G.won) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("rumble", G.score, G.won ? "GOT IT BACK" : "STAGE "+(G.stage+1)); } },
    draw(x, G, t){
      scene(x, G, t); hud(x, G, 14, t);
      const S=STAGES[G.stage];
      if(G.won) _cbMid(x, "YOU GOT YOUR DIESEL BACK", "FORTY GALLONS · "+G.score+" · SPACE TO PLAY AGAIN");
      else if(G.over) _cbMid(x, "GAME OVER", S.n+" · SPACE TO PLAY AGAIN");
      else if(G.clearT>0) _cbMid(x, "STAGE CLEAR", "HEALTH BONUS  +"+(G.bonus||0)+(G.extra ? " · AND ANOTHER DALE" : ""));
      else if(G.msgT>0 && G.boss) _cbMid(x, G.boss.name, G.boss.sub);
      else if(G.msgT>0){ _cbMid(x, S.n, S.sub); x.fillStyle="#f2e23a"; _cbFont(x, 10); x.fillText("STAGE "+(G.stage+1)+" OF "+STAGES.length, W/2, H/2-34); }
      _cbTube(x); },
    // the attract mode: Dale and a punk on the truck lot, the name; then the best scores
    attract(x, t, i){
      demoFight(x, t);
      x.fillStyle="#000"; x.fillRect(0, 0, W, Y0-2);
      if(((t/7)|0)%2===0){
        x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(36, 44, W-72, 66);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28);
        x.fillStyle="#f2e23a"; x.fillText("EXIT 166", W/2, 64); x.fillStyle="#ff6a4a"; x.fillText("RUMBLE", W/2, 92); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 36, W-80, 110); _cbTopDraw(x, "rumble", 52, "#ff8a6a"); }
      _cbFoot(x, i, t); _cbTube(x); },
    // for tools and testing
    _debug:{STAGES:STAGES, KIND:KIND, frame:frame, startStage:startStage, ZD:ZD, back:back}
  };
})();

/* ---- into 18g's cabinets: cabinet 14 (12c: the last one, in the new end) ---- */
_CBG[14]=_RB;
{ const L=_cbTop("rumble"); if(L.length) CABS.hi[14]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[14]; if(R){ _RB.attract(R.x, 0, 14); R.tex.needsUpdate=true; } }
