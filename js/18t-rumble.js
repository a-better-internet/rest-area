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
   Exit 166. Three stages, walked left to right: THE TRUCK LOT, THE FUEL
   STOP at the top of the ramp, and the lot of THE FIREWORKS OUTLET, where
   Big Earl of the Gravel Kings is sitting on forty gallons of it.

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
    earl:   {name:"BIG EARL",  hp:190, sp:36, s:1.42, reach:24, dmg:16, wind:0.50, armor:true, boss:true, pal:{skin:"#d09870", shirt:"#1a1a1e", pants:"#2a3046", hair:"#8a4a22", vest:"#1a1a1e", beard:"#8a4a22", band:"#f2c418"}}};
  const SCORE={punk:200, chain:300, bruiser:500, earl:3000};

  /* ---- the stages: how long, what stands on them, and where the Gravel Kings come at you ---- */
  // a wave: x0 where the street stops, and who comes: [kind, side (-1 from the left, 1 from the right), how deep, how long after]
  const STAGES=[
    {n:"THE TRUCK LOT", sub:"SOMEBODY SIPHONED YOUR DIESEL", len:1060, paint:lot,
     props:[[330,60,"drum"],[640,22,"crate"],[910,58,"drum"]],
     waves:[{x0:90,  f:[["punk",1,40,0],["punk",1,64,0.9]]},
            {x0:400, f:[["punk",1,30,0],["punk",-1,60,0.6],["punk",1,70,1.8]]},
            {x0:710, f:[["chain",1,44,0],["punk",1,20,0.8],["punk",-1,66,1.6]]}]},
    {n:"THE FUEL STOP", sub:"THE TRAIL GOES UP THE RAMP", len:1060, paint:fuel,
     props:[[250,66,"crate"],[560,18,"drum"],[600,26,"drum"],[900,64,"crate"]],
     waves:[{x0:90,  f:[["chain",1,36,0],["punk",1,62,0.7],["punk",-1,48,1.5]]},
            {x0:400, f:[["bruiser",1,46,0],["punk",-1,26,1.0],["punk",1,70,2.2]]},
            {x0:710, f:[["chain",1,30,0],["chain",-1,64,0.8],["bruiser",1,50,2.0],["punk",-1,40,3.4]]}]},
    {n:"THE FIREWORKS OUTLET", sub:"FORTY GALLONS OF IT, AND BIG EARL", len:1060, paint:outlet,
     props:[[210,20,"crate"],[240,28,"crate"],[540,64,"drum"],[860,22,"drum"]],
     waves:[{x0:90,  f:[["punk",1,30,0],["punk",1,60,0.5],["chain",-1,46,1.2],["punk",-1,70,2.4]]},
            {x0:400, f:[["bruiser",1,40,0],["bruiser",-1,60,1.2],["chain",1,24,2.6]]},
            {x0:716, f:[["earl",1,46,0.4],["punk",-1,30,6],["punk",1,66,12],["chain",-1,50,20]]}]}];

  /* ---- a body ---- */
  function body(kind, x, z, dir){ const Kd=KIND[kind];
    return {kind:kind, K:Kd, x:x, z:z, y:0, vx:0, vy:0, dir:dir, hp:Kd.hp, st:"idle", t:0, walk:0, cool:0.6, flash:0, inv:0, combo:0, comboT:0, hitDone:false, armorN:0, foe:kind!=="dale"}; }
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
      if(p.hp<=0){ G.score+=50; snd(i, "brick"); if(p.loot) G.loot.push({x:p.x, z:p.z, t:0}); } else snd(i, "wall"); }
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
      else if(wantP){ G.in.punchT=0; p.combo=p.comboT>0 ? Math.min(3, p.combo+1) : 1; p.st="punch"; p.t=0; p.hitDone=false; }
      else { if(mx) p.dir=mx; p.x+=mx*Kd.sp*dt; p.z+=mz*Kd.sp*0.62*dt; p.st=(mx || mz) ? "walk" : "idle"; if(mx || mz) p.walk+=dt*9; }
    }else if(p.st==="punch"){ p.t+=dt; const last=p.combo===3, at=last ? 0.12 : 0.07, len=last ? 0.34 : 0.20;
      if(!p.hitDone && p.t>=at){ p.hitDone=true;
        const hit=swing(G, p, Kd.reach+(last ? 3 : 0), last ? 14 : 8, last ? 2 : 1, i); if(hit) p.comboT=0.55; else { p.combo=0; snd(i, "whoosh"); } }
      if(p.t>=len){ p.st="idle"; if(p.combo>=3) p.combo=0; }
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
    // a pretzel
    for(const l of G.loot){ l.t+=dt; if(!l.got && l.t>0.3 && Math.abs(l.x-p.x)<13 && Math.abs(l.z-p.z)<10 && p.y<8){ l.got=true; p.hp=Math.min(Kd.hp, p.hp+35); G.score+=100; G.pops.push({x:l.x, z:l.z, txt:"PRETZEL", t:0}); snd(i, "snack"); } }
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
      if(inReach && e.cool<=0 && !pOut && e.turn){ e.st="windup"; e.t=Kd.wind; return; }
      // where he wants to be: beside Dale if it is his turn, hanging back if it is not
      const side=e.x>=p.x ? 1 : -1, tx=e.turn ? p.x+side*(Kd.reach-3) : p.x+side*(62+e.slot*16), tz=e.turn ? p.z : clamp(p.z+(e.slot%2 ? 26 : -26), 6, ZD-6);
      const ex=tx-e.x, ez=tz-e.z, d=Math.hypot(ex, ez), sp=Kd.sp*(e.turn ? 1 : 0.7)*G.fast;
      if(d>2){ e.x+=ex/d*sp*dt; e.z+=ez/d*sp*0.7*dt; e.st="walk"; e.walk+=dt*8; } else e.st="idle";
    }else if(e.st==="windup"){ e.t-=dt; if(e.t<=0){ e.st="strike"; e.t=0.2; e.hitDone=false; }
    }else if(e.st==="strike"){ e.t-=dt;
      if(!e.hitDone){ e.hitDone=true; if(!swing(G, e, Kd.reach, Kd.dmg, Kd.boss || e.kind==="bruiser" ? 2 : 1, i)) snd(i, "whoosh"); }
      if(e.t<=0){ e.st="idle"; e.cool=(0.7+rnd(G)*0.9)/G.fast; }
    }else if(e.st==="tell"){ e.t-=dt; if(e.t<=0){ e.st="charge"; e.t=1.25; e.hitDone=false; e.dir=dx>=0 ? 1 : -1; }
    }else if(e.st==="charge"){ e.t-=dt; e.x+=e.dir*205*dt; e.walk+=dt*16;
      if(!e.hitDone && Math.abs(p.x-e.x)<18 && Math.abs(p.z-e.z)<11 && p.y<16 && land(G, e, p, 18, 2, i)) e.hitDone=true;
      if(e.t<=0 || e.x<G.limL+14 || e.x>G.limR-14){ e.st="winded"; e.t=1.1; e.cool=1.4; }
    }else if(e.st==="winded"){ e.t-=dt; if(e.t<=0) e.st="idle";
    }else if(e.st==="hurt"){ e.t-=dt; e.x+=e.vx*dt; e.vx*=Math.pow(0.02, dt); if(e.t<=0) e.st="idle";
    }else if(e.st==="fall"){ e.x+=e.vx*dt; e.vy-=GRAV*dt; e.y+=e.vy*dt;
      if(e.y<=0){ e.y=0; snd(i, "thump");
        if(e.hp<=0){ e.st="dead"; e.t=1.1; const v=SCORE[e.kind]||200; G.score+=v; G.pops.push({x:e.x, z:e.z, txt:String(v), t:0}); if(Kd.boss){ G.bossDown=true; snd(i, "boom"); } }
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
    G.props=S.props.map(([x, z, kind], n)=>({x:x, z:z, kind:kind, hp:kind==="drum" ? 3 : 2, shake:0, loot:n%2===0 || kind==="crate"}));
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
    // the street stops where they come at you, and lets you on when they are down
    const wv=S.waves[G.wave];
    if(!G.lock && wv && p.x>wv.x0+W*0.42){
      G.lock=wv; G.limL=wv.x0; G.limR=wv.x0+W;
      wv.f.forEach(([kind, side, z, late], n)=>{ const e=body(kind, side<0 ? wv.x0-24-n*6 : wv.x0+W+24+n*6, z, -side); e.wait=late; e.slot=n; e.rage=1.5; e.onscreen=false; if(G.loop){ e.hp=Math.round(e.hp*1.3); } G.ents.push(e); });
      if(wv.f.some(f=>KIND[f[0]].boss)){ G.msgT=1.19; G.boss=true; snd(i, "jingle"); }
    }
    if(G.lock){ const left=G.ents.some(e=>e.foe && live(e));
      // (with Earl down the rest of them have had enough: the ones on the street go over, the ones not yet on it never come)
      if(!left || G.bossDown){ if(G.bossDown) for(const e of G.ents) if(e.foe && e.hp>0){ if(e.wait>0){ e.st="gone"; continue; } e.hp=0; e.st="fall"; e.vy=120; e.vx=-e.dir*60; e.y=1; }
        if(!G.ents.some(e=>e.foe && live(e))){ G.lock=null; G.boss=false; G.wave++; const nx=S.waves[G.wave]; G.limR=nx ? nx.x0+W : S.len; G.go=2.6;
          if(!nx){ G.limR=S.len+60; } } } }
    // off the end of the street: the stage is done
    if(!G.lock && !S.waves[G.wave] && p.x>S.len-14 && p.st!=="fall" && p.st!=="down"){ const bonus=Math.round(p.hp)*10; G.score+=bonus; G.bonus=bonus; G.clearT=2.2; snd(i, "jingle"); }
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
    winded:{lean:0.50, aF:[0.3,0.5],   aB:[0.2,0.4],   lF:[0.3,0.0],    lB:[-0.3,-0.2]}};
  function figure(x, X, Y, d, pose, pal, s, ph, flash, kind){
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
    if(e.st==="punch") pose=e.combo===3 ? "upper" : e.combo===2 ? "punch2" : "punch1"; else if(e.st==="strike") pose="punch1";
    else if(e.st==="fall") pose="hurt"; else if(e.st==="getup") pose="winded";
    const lying=e.st==="down" || e.st==="dead" || (e.st==="fall" && e.vy<0 && e.y<14);
    x.save(); x.translate(X, Y-e.y);
    if(lying){ x.rotate(-e.dir*Math.PI/2*0.94); x.translate(0, -3*s); figure(x, 0, 0, e.dir, "hurt", e.K.pal, s, 0, e.flash>0, e.kind); }
    else { if(e.st==="tell") x.translate(Math.sin(t*50)*1.2, 0); figure(x, 0, 0, e.dir, pose, e.K.pal, s, e.walk, e.flash>0, e.kind); }
    x.restore();
  }
  function drawProp(x, q, cam){
    const X=Math.round(q.x-cam)+(q.shake>0 ? Math.round(Math.sin(q.shake*90)*1.5) : 0), Y=GY0+q.z;
    if(q.hp<=0){ x.fillStyle="rgba(20,16,12,0.5)"; x.beginPath(); x.ellipse(X, Y, 11, 3.5, 0, 0, 7); x.fill();
      x.fillStyle=q.kind==="drum" ? "#3a5a8a" : "#8a6a3c"; x.fillRect(X-9, Y-3, 7, 3); x.fillRect(X+2, Y-2, 6, 2); return; }
    x.fillStyle="rgba(0,0,0,0.3)"; x.beginPath(); x.ellipse(X, Y+1, 10, 3, 0, 0, 7); x.fill();
    if(q.kind==="drum"){ x.fillStyle="#2f5a96"; x.fillRect(X-7, Y-21, 14, 21); x.fillStyle="#4a7ac0"; x.fillRect(X-7, Y-21, 3, 21); x.fillStyle="#1e3c66"; x.fillRect(X-7, Y-15, 14, 1.5); x.fillRect(X-7, Y-8, 14, 1.5);
      x.fillStyle="#22406e"; x.beginPath(); x.ellipse(X, Y-21, 7, 2.2, 0, 0, 7); x.fill(); }
    else { x.fillStyle="#a8824a"; x.fillRect(X-9, Y-16, 18, 16); x.strokeStyle="#6a4e28"; x.lineWidth=1.5; x.strokeRect(X-8.2, Y-15.2, 16.4, 14.4); x.beginPath(); x.moveTo(X-8, Y-15); x.lineTo(X+8, Y-1); x.stroke(); }
  }
  function pretzel(x, X, Y, t){ const b=Math.sin(t*6)*1.5;
    x.strokeStyle="#b8742a"; x.lineWidth=2.2; x.beginPath(); x.arc(X-2.6, Y-6+b, 2.6, 0, 7); x.stroke(); x.beginPath(); x.arc(X+2.6, Y-6+b, 2.6, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(X-4, Y-2+b); x.lineTo(X+4, Y-9+b); x.moveTo(X+4, Y-2+b); x.lineTo(X-4, Y-9+b); x.stroke();
    x.fillStyle="#fff6e0"; x.fillRect(X-3, Y-7+b, 1, 1); x.fillRect(X+2, Y-5+b, 1, 1); x.fillRect(X, Y-9+b, 1, 1); }

  /* ---- the three streets, each painted once ---- */
  const BGS=[];
  const say=(x, s, cx, cy, w, h, col, weight)=>{ x.fillStyle=col; fitText(x, s, w, h, cx, cy, weight||"900", "'Arial Black', Arial"); };
  function night(x, L, top, bot, hills){
    const g=x.createLinearGradient(0, Y0, 0, GY0); g.addColorStop(0, top); g.addColorStop(1, bot); x.fillStyle=g; x.fillRect(0, Y0, L, GY0-Y0);
    let s=31; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    for(let k=0;k<L/5;k++){ x.fillStyle="rgba(255,255,240,"+(0.3+r()*0.6).toFixed(2)+")"; x.fillRect((r()*L)|0, Y0+((r()*70)|0), 1, 1); }
    x.fillStyle=hills; x.beginPath(); x.moveTo(0, GY0); for(let px=0;px<=L;px+=20) x.lineTo(px, 122-18*Math.sin(px*0.006+1)-9*Math.sin(px*0.017)); x.lineTo(L, GY0); x.closePath(); x.fill();
    // the woods along the back of it
    x.fillStyle="#0e1a12"; for(let px=-8;px<L+8;px+=9+((r()*6)|0)){ const h=20+r()*18; x.beginPath(); x.ellipse(px, GY0-22, 9, h, 0, 0, 7); x.fill(); }
  }
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
    night(x, L, "#0a0e22", "#1c2440", "#141c2c");
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
    night(x, L, "#0c1024", "#222a48", "#161e30");
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
    night(x, L, "#100a22", "#2c2244", "#1a1630");
    // the outlet: a long tin barn painted red and yellow, its sign bigger than it is; banners; a tent of bargains
    x.fillStyle="#c8281e"; x.fillRect(300, 92, 520, 78); x.fillStyle="#f2c418"; for(let px=300;px<820;px+=52) x.fillRect(px, 92, 26, 78); x.fillStyle="rgba(0,0,0,0.18)"; for(let px=300;px<820;px+=13) x.fillRect(px, 92, 1, 78);
    x.fillStyle="#141416"; x.fillRect(380, 48, 360, 48); x.strokeStyle="#f2c418"; x.lineWidth=2; x.strokeRect(383, 51, 354, 42);
    say(x, "FRENCH CREEK FIREWORKS", 560, 64, 320, 16, "#f2e23a"); say(x, "BUY ONE · GET TWO · OPEN ALL NIGHT", 560, 83, 300, 9, "#ff7a4a");
    x.fillStyle="#2a1a12"; x.fillRect(536, 122, 48, 48); x.fillStyle="#ffe0a0"; x.fillRect(540, 126, 40, 44);
    for(const [bx, col] of [[330,"#3fe0ff"],[440,"#ff4fbf"],[640,"#7aff7a"],[750,"#f2e23a"]]){ x.fillStyle=col; x.beginPath(); x.moveTo(bx, 100); x.lineTo(bx+30, 100); x.lineTo(bx+15, 122); x.closePath(); x.fill(); }
    x.fillStyle="#e8e4d8"; x.beginPath(); x.moveTo(60, 120); x.lineTo(150, 96); x.lineTo(240, 120); x.closePath(); x.fill(); x.fillStyle="#c8281e"; for(let k=0;k<4;k++){ x.beginPath(); x.moveTo(60+k*45, 120); x.lineTo(150, 96); x.lineTo(82+k*45, 120); x.closePath(); x.fill(); }
    x.fillStyle="#8a8d90"; for(const px of [62, 150, 238]) x.fillRect(px-1, 120, 2, 58);
    x.fillStyle="#a8824a"; for(let k=0;k<5;k++) x.fillRect(84+k*26, 154-(k%2)*10, 22, 22+(k%2)*10);
    // Earl's pickup at the far end, the drums in the bed of it
    { const px=L-236; x.fillStyle="#4a5a3a"; x.fillRect(px, 138, 120, 26); x.fillRect(px+70, 118, 44, 22); x.fillStyle="#1a2230"; x.fillRect(px+76, 122, 32, 14);
      x.fillStyle="#2f5a96"; for(const dx of [8, 26, 44]) x.fillRect(px+dx, 116, 15, 24); x.fillStyle="#141416"; for(const wx of [22, 96]){ x.beginPath(); x.arc(px+wx, 166, 10, 0, 7); x.fill(); } }
    lamp(x, 270, "rgba(255,150,200,0.26)"); lamp(x, 860, "rgba(150,220,255,0.26)");
    ground(x, L, "#6a6458", "#464238", (x, r)=>{ for(let k=0;k<L*0.9;k++){ x.fillStyle=r()<0.5 ? "rgba(200,196,180,0.25)" : "rgba(40,36,30,0.3)"; x.fillRect((r()*L)|0, GY0-4+((r()*(H-GY0))|0), 2, 1); }
      x.fillStyle="rgba(70,40,90,0.55)"; for(let px=10;px<L-150;px+=22+r()*16){ x.beginPath(); x.ellipse(px, GY0+40+Math.sin(px*0.02)*16, 3+r()*3, 1.4, 0, 0, 7); x.fill(); } });
  }
  function backdrop(k){ if(BGS[k]) return BGS[k]; const S=STAGES[k], c=cvs(S.len+80, H), x=c.getContext("2d"); S.paint(x, S.len+80); BGS[k]=c; return c; }

  function scene(x, G, t){
    const cam=Math.round(G.cam);
    x.drawImage(backdrop(G.stage), cam, 0, W, H, 0, 0, W, H);
    const L=[]; for(const q of G.props) L.push({z:q.z, q:q}); for(const e of G.ents) L.push({z:e.z+(e.st==="down" || e.st==="dead" ? -3 : 0), e:e}); for(const l of G.loot) L.push({z:l.z-1, l:l});
    L.sort((a, b)=>a.z-b.z);
    for(const o of L){ if(o.q) drawProp(x, o.q, cam); else if(o.e) drawBody(x, o.e, cam, t); else pretzel(x, Math.round(o.l.x-cam), GY0+o.l.z, t); }
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
    x.textAlign="center"; x.fillStyle="#e8e8e0"; x.fillText(String(G.score).padStart(6, "0"), W/2, 9); x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[i]||0)).padStart(6, "0"), W/2, 19);
    if(G.tgt && G.tgtT>0 && G.tgt.hp>0){ x.textAlign="right"; x.fillStyle="#8ad0ff"; x.fillText(G.tgt.K.name, W-12, 9); bar(x, W-90, 15, 78, G.tgt.hp/G.tgt.K.hp, "#5ac8ff"); }
    if(G.go>0 && ((t*5)|0)%2){ x.fillStyle="#f2e23a"; _cbFont(x, 16); x.textAlign="right"; x.fillText("GO", W-34, 52); x.beginPath(); x.moveTo(W-30, 44); x.lineTo(W-14, 52); x.lineTo(W-30, 60); x.closePath(); x.fill(); }
  }
  // the attract mode's own little fight: Dale and a punk on the first street, going through the moves
  function demoFight(x, t){
    const cam=((t*14)%300)|0; x.drawImage(backdrop(0), 60+cam, 0, W, H, 0, 0, W, H);
    const u=(t*1.4)%4, k=Math.floor(u), f=u-k, P=KIND.dale.pal, Q=KIND.punk.pal, gy=GY0+52;
    const shadow=(X)=>{ x.fillStyle="rgba(0,0,0,0.32)"; x.beginPath(); x.ellipse(X, gy+1, 9, 2.6, 0, 0, 7); x.fill(); };
    shadow(138); shadow(k===3 ? 196 : 164);
    figure(x, 138, gy, 1, k===0 ? (f<0.5 ? "punch1" : "idle") : k===1 ? (f<0.5 ? "punch2" : "idle") : k===2 ? (f<0.6 ? "upper" : "idle") : "idle", P, 1, t*9, false, "dale");
    if(k===3){ x.save(); x.translate(196, gy-Math.sin(Math.min(1, f*1.6)*Math.PI)*16); if(f>0.55){ x.rotate(Math.PI/2*0.94); x.translate(0, -3); } figure(x, 0, 0, -1, "hurt", Q, 0.98, 0, false, "punk"); x.restore(); }
    else figure(x, 164, gy, -1, f<0.3 ? "hurt" : "idle", Q, 0.98, t*8, f<0.08, "punk");
  }

  return {
    name:"EXIT 166 RUMBLE", col:"#ff8a6a",
    help:"EXIT 166 RUMBLE · ARROWS OR WASD WALK · SPACE PUNCHES (THREE IS A COMBO) · K KICKS · L JUMPS · ESC TO STEP AWAY",
    newGame(){ const G={seed:(Date.now()>>>0)||9, score:0, lives:3, over:false, won:false, t:0, acc:0, loop:0, fast:1, in:{punchT:0, kickT:0, jumpT:0}, p:body("dale", 30, 46, 1), ents:[], props:[], loot:[], fx:[], pops:[]};
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
      else if(G.clearT>0) _cbMid(x, "STAGE CLEAR", "HEALTH BONUS  +"+(G.bonus||0));
      else if(G.msgT>0 && G.boss) _cbMid(x, "BIG EARL", "OF THE GRAVEL KINGS");
      else if(G.msgT>0) _cbMid(x, "STAGE "+(G.stage+1)+" · "+S.n, S.sub);
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
    _debug:{STAGES:STAGES, KIND:KIND, frame:frame, startStage:startStage, ZD:ZD}
  };
})();

/* ---- into 18g's cabinets: cabinet 14 (12c: the last one, in the new end) ---- */
_CBG[14]=_RB;
{ const L=_cbTop("rumble"); if(L.length) CABS.hi[14]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[14]; if(R){ _RB.attract(R.x, 0, 14); R.tex.needsUpdate=true; } }
