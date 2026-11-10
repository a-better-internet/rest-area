"use strict";
/* REST AREA · 18o-racer.js
   the arcade's eighth cabinet (12c): Route 6 Rally
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18o · ROUTE 6 RALLY
   Played the way 18g's are (the cabinet's own screen, the stick under
   your hand, N to start again, Esc or E to step away), registered into
   18g's _CBG as cabinet 7, on the back wall by the hoops. Its best five
   scores are kept in the browser and shown in its attract mode.

   A behind-the-car road racer drawn the old pseudo-3D way: the road is a
   string of short flat segments, each with its own bend and rise,
   projected one after another out to the horizon, with what stands by it
   (silos, barns, maples, billboards, the lake) scaled in after. You
   drive a little rally hatchback three laps of a loop of US 6 through
   farm country and along the lake against seven others, starting at the
   back. UP (or W) is the gas, DOWN (or S) the brake, LEFT and RIGHT
   steer, SPACE shifts between LOW and HIGH: low pulls hard and tops out
   early, high is slow off the mark and fast at the top. Off the road the
   grass drags at you; hit a sign or a car at speed and you spin out.
   The clock runs down: each lap done puts time back on it, and it
   running out ends the race. Points for the distance, for every car
   passed, and for where you finish.
   Its road, its cars and its pictures are its own, drawn here.
   ---------------------------------------------------------------------- */
const _RR=(function(){
  const W=_CB.W, H=_CB.H, HUD=22, SEG=200, RW=2000, LANES=3, CAMH=1000, FOV=100, DEPTH=1/Math.tan(FOV/2*Math.PI/180), DRAW=140;
  const MAXV=SEG*60, LOWMAX=MAXV*0.55, CENTRI=0.3, LAPS=3, NCARS=7;
  const snd=(i, k)=>_cbSnd(i, k);
  // the loop: [length in segments, bend, rise], eased in and out; then what stands where along it
  const PLAN=[[60,0,0],[80,2,0],[60,0,20],[100,-3,0],[60,0,-30],[80,4,10],[50,0,0],[120,-2,-20],[70,3,30],[60,0,0],[90,-4,0],[80,2,-20],[60,0,10]];
  const road=(function(){
    const S=[]; let y=0;
    const add=(curve, dy)=>{ const n=S.length; S.push({i:n, z0:n*SEG, z1:(n+1)*SEG, y0:y, y1:y+dy, curve:curve, sprites:[], color:Math.floor(n/3)%2}); y+=dy; };
    // (a bend eased in and out over a quarter of its stretch; a rise of h half-segments over the stretch, steepest in its middle)
    for(const [n, c, h] of PLAN){ const ease=Math.floor(n/4), tot=h*SEG*0.5;
      for(let k=0;k<n;k++){ const u=k<ease ? k/ease : k>n-ease ? (n-k)/ease : 1; add(c*u, tot/n*(1-Math.cos(2*Math.PI*(k+0.5)/n))); } }
    // the last segments bring it back to level
    const drop=-y, tail=40; for(let k=0;k<tail;k++) add(0, drop/tail);
    // the roadside: maples and spruce all along, now and then a barn, a silo, a billboard; the lake on the far stretch
    let r=917; const rnd=()=>{ r=(r*1103515245+12345)&0x7fffffff; return r/0x7fffffff; };
    const BOARDS=["PIEROGI 2 MI","FIREWORKS · NEXT RIGHT","REST AREA 1 MILE","FRESH CIDER","ERIE 31","LAKE EDINBORO"];
    for(const s of S){
      if(s.i%5===0) s.sprites.push({k:rnd()<0.5 ? "maple" : "spruce", x:-1.4-rnd()*1.6});
      if(s.i%5===2) s.sprites.push({k:rnd()<0.5 ? "maple" : "spruce", x:1.4+rnd()*1.6});
      if(s.i%60===30) s.sprites.push({k:"barn", x:(rnd()<0.5 ? -1 : 1)*(2.6+rnd())});
      if(s.i%60===10) s.sprites.push({k:"silo", x:(rnd()<0.5 ? -1 : 1)*(2.2+rnd())});
      if(s.i%45===20) s.sprites.push({k:"board", x:(rnd()<0.5 ? -1.25 : 1.25), t:BOARDS[(s.i/45|0)%BOARDS.length], hit:true});
      if(s.i%8===4) s.sprites.push({k:"post", x:1.12, hit:true}), s.sprites.push({k:"post", x:-1.12, hit:true});
    }
    S[2].sprites.push({k:"gantry", x:0});
    return S;
  })();
  const N=road.length, LEN=N*SEG;
  const segAt=z=>road[Math.floor(((z%LEN)+LEN)%LEN/SEG)%N];
  const lake=s=>s.i>N*0.45 && s.i<N*0.7;
  const COLS={grass:["#3e7a2e","#357028"], rumble:["#d8d8d0","#c42a1a"], road:["#5a5a5e","#55555a"], lane:"#e8e2c8", lake:["#3a6a9a","#356090"]};
  const CARCOL=["#c42a1a","#2a6ab8","#e8c030","#2a8a4a","#e8862a","#7a4ad8","#d8d8d0"];

  /* ---- the pictures ---- */
  function quad(x, x1, y1, w1, x2, y2, w2, col){ x.fillStyle=col; x.beginPath(); x.moveTo(x1-w1, y1); x.lineTo(x2-w2, y2); x.lineTo(x2+w2, y2); x.lineTo(x1+w1, y1); x.closePath(); x.fill(); }
  function hatch(x, cx, by, s, col, lean, brake){                      // a rally hatchback from behind, by its bottom middle
    const w=60*s, h=40*s; x.save(); x.translate(cx, by); x.rotate(lean*0.03);
    x.fillStyle="#141414"; x.fillRect(-w*0.48, -h*0.28, w*0.2, h*0.28); x.fillRect(w*0.28, -h*0.28, w*0.2, h*0.28);   // tyres
    x.fillStyle=col; x.beginPath(); x.moveTo(-w/2, -h*0.18); x.lineTo(-w*0.46, -h*0.62); x.lineTo(-w*0.32, -h); x.lineTo(w*0.32, -h); x.lineTo(w*0.46, -h*0.62); x.lineTo(w/2, -h*0.18); x.closePath(); x.fill();
    x.fillStyle="#1e2a36"; x.beginPath(); x.moveTo(-w*0.38, -h*0.64); x.lineTo(-w*0.28, -h*0.94); x.lineTo(w*0.28, -h*0.94); x.lineTo(w*0.38, -h*0.64); x.closePath(); x.fill();
    x.fillStyle="#f2f2ea"; x.fillRect(-w*0.06, -h*0.98, w*0.12, h*0.05);
    x.fillStyle=brake ? "#ff3a2a" : "#a81a10"; x.fillRect(-w*0.46, -h*0.5, w*0.14, h*0.1); x.fillRect(w*0.32, -h*0.5, w*0.14, h*0.1);
    x.fillStyle="#d8d8d0"; x.fillRect(-w*0.12, -h*0.36, w*0.24, h*0.08);
    x.fillStyle="#222"; x.fillRect(-w*0.5, -h*0.2, w, h*0.06);
    x.restore();
  }
  function sprite(x, sp, cx, by, s, clip){
    const sc=s*W/2;                                                    // world units to pixels
    x.save(); x.beginPath(); x.rect(0, HUD, W, clip-HUD); x.clip();
    if(sp.k==="maple"){ const h=1600*sc, w=900*sc; x.fillStyle="#4a3420"; x.fillRect(cx-w*0.06, by-h*0.45, w*0.12, h*0.45);
      x.fillStyle="#2e6a24"; x.beginPath(); x.arc(cx, by-h*0.66, w*0.5, 0, Math.PI*2); x.fill(); x.fillStyle="#3e8030"; x.beginPath(); x.arc(cx-w*0.15, by-h*0.75, w*0.3, 0, Math.PI*2); x.fill(); }
    else if(sp.k==="spruce"){ const h=1900*sc, w=800*sc; x.fillStyle="#3a2a1a"; x.fillRect(cx-w*0.05, by-h*0.2, w*0.1, h*0.2);
      x.fillStyle="#1e4a2a"; x.beginPath(); x.moveTo(cx, by-h); x.lineTo(cx+w/2, by-h*0.15); x.lineTo(cx-w/2, by-h*0.15); x.closePath(); x.fill(); }
    else if(sp.k==="barn"){ const h=1800*sc, w=2600*sc; x.fillStyle="#9a2a1a"; x.fillRect(cx-w/2, by-h*0.6, w, h*0.6);
      x.fillStyle="#5a5a5a"; x.beginPath(); x.moveTo(cx-w*0.56, by-h*0.6); x.lineTo(cx, by-h); x.lineTo(cx+w*0.56, by-h*0.6); x.closePath(); x.fill();
      x.strokeStyle="#f2e8d0"; x.lineWidth=Math.max(1, w*0.02); x.strokeRect(cx-w*0.15, by-h*0.45, w*0.3, h*0.45); }
    else if(sp.k==="silo"){ const h=2600*sc, w=700*sc; x.fillStyle="#b8b4a8"; x.fillRect(cx-w/2, by-h*0.9, w, h*0.9);
      x.fillStyle="#6a6a70"; x.beginPath(); x.arc(cx, by-h*0.9, w/2, Math.PI, 0); x.fill(); x.fillStyle="rgba(0,0,0,0.15)"; x.fillRect(cx+w*0.15, by-h*0.9, w*0.35, h*0.9); }
    else if(sp.k==="board"){ const h=1200*sc, w=1600*sc; x.fillStyle="#3a3a3a"; x.fillRect(cx-w*0.35, by-h*0.5, w*0.06, h*0.5); x.fillRect(cx+w*0.29, by-h*0.5, w*0.06, h*0.5);
      x.fillStyle="#f2e8d0"; x.fillRect(cx-w/2, by-h, w, h*0.5); x.fillStyle="#1e4a7a"; x.fillRect(cx-w*0.46, by-h*0.95, w*0.92, h*0.4);
      if(w>30 && cx-w*0.46>=4 && cx+w*0.46<=W-4 && by-h*0.95>=HUD && by-h*0.55<=H-4){ x.fillStyle="#f2e8d0"; x.textAlign="center"; x.textBaseline="middle"; let f=Math.min(h*0.22, 14); x.font="bold "+f+"px Arial";
        while(f>4 && x.measureText(sp.t).width>w*0.84){ f-=1; x.font="bold "+f+"px Arial"; } x.fillText(sp.t, cx, by-h*0.75); } }
    else if(sp.k==="post"){ const h=500*sc, w=60*sc; x.fillStyle="#e8e8e0"; x.fillRect(cx-w/2, by-h, w, h); x.fillStyle="#c42a1a"; x.fillRect(cx-w/2, by-h, w, h*0.18); }
    else if(sp.k==="gantry"){ const h=2400*sc, w=RW*2.6*sc; x.fillStyle="#6a6a70"; x.fillRect(cx-w/2, by-h, w*0.03, h); x.fillRect(cx+w/2-w*0.03, by-h, w*0.03, h);
      x.fillStyle="#1a1a1a"; x.fillRect(cx-w/2, by-h, w, h*0.14);
      for(let k=0;k<12;k++){ x.fillStyle=k%2 ? "#f2f2ea" : "#1a1a1a"; x.fillRect(cx-w/2+k*w/12, by-h*0.86, w/12, h*0.04); } }
    else if(sp.k==="car") hatch(x, cx, by, sc*700/60, sp.col, 0, false);
    x.restore();
  }
  function sky(x, G){
    const g=x.createLinearGradient(0, HUD, 0, H*0.55); g.addColorStop(0, "#5a8ad0"); g.addColorStop(1, "#c8dcf0"); x.fillStyle=g; x.fillRect(0, HUD, W, H);
    // the hills far off, sliding against the bends
    const off=(G ? G.skyX : 0);
    for(const [col, amp, base, sp] of [["#7a9ab0", 26, 0.52, 0.3], ["#4a7a4a", 16, 0.58, 0.6]]){
      x.fillStyle=col; x.beginPath(); x.moveTo(0, H);
      for(let px=0;px<=W;px+=6){ const u=(px+off*sp*W)/W; x.lineTo(px, H*base-amp*(0.5+0.5*Math.sin(u*5.1))*(0.6+0.4*Math.sin(u*13.7))); }
      x.lineTo(W, H); x.closePath(); x.fill(); }
  }

  /* ---- the race ---- */
  function newRace(){
    const G={score:0, over:false, won:false, z:0, x:0, v:0, gear:0, lap:1, time:75, cars:[], skyX:0, spin:0, msgT:3.2, pos:NCARS+1, passed:0, done:0, lapT:0, best:0, acc:0, t:0, steer:0, brake:false, fin:0};
    // the grid: them ahead of you, two by two
    for(let k=0;k<NCARS;k++) G.cars.push({z:(NCARS-k)*SEG*3+SEG*2, x:k%2 ? -0.45 : 0.45, v:MAXV*(0.47+0.035*k+Math.random()*0.04), col:CARCOL[k], lap:1, lane:k%2 ? -0.45 : 0.45});
    return G;
  }
  function progress(z, lap){ return (lap-1)*LEN+((z%LEN)+LEN)%LEN; }
  function frame(G, dt, K, i){
    if(G.over || G.won) return;
    G.t+=dt;
    if(G.msgT>0){ const was=Math.ceil(G.msgT); G.msgT-=dt; if(Math.ceil(G.msgT)<was && G.msgT>0) snd(i, "tick"); if(G.msgT<=0) snd(i, "jingle"); return; }
    const gas=K.ArrowUp||K.KeyW, brk=K.ArrowDown||K.KeyS, L=K.ArrowLeft||K.KeyA, R=K.ArrowRight||K.KeyD;
    const seg=segAt(G.z), pct=G.v/MAXV;
    G.brake=!!brk; G.steer=(R?1:0)-(L?1:0);
    if(G.spin>0){ G.spin-=dt; G.v=Math.max(0, G.v-MAXV*dt*1.2); }
    else {
      // the gears: low pulls hard to its limit, high pulls slowly all the way up
      const top=G.gear ? MAXV : LOWMAX, pull=G.gear ? (G.v<LOWMAX*0.7 ? 0.35 : 0.75) : 1.3;
      if(gas) G.v=G.v<top ? G.v+MAXV*pull*0.42*dt : Math.max(top, G.v-MAXV*0.4*dt);
      else if(brk) G.v=Math.max(0, G.v-MAXV*1.1*dt);
      else G.v=Math.max(0, G.v-MAXV*0.22*dt);
      G.x+=G.steer*dt*2.2*Math.min(1, pct*1.6);
      G.x-=dt*2*pct*seg.curve*CENTRI;                                          // (thrown out on a bend)
    }
    // off the road the grass drags; a post or a sign there stops you dead
    if(Math.abs(G.x)>1){ if(G.v>MAXV*0.25) G.v=Math.max(MAXV*0.25, G.v-MAXV*1.0*dt);
      for(const sp of seg.sprites) if(sp.hit && Math.abs(G.x-sp.x)<0.18 && G.v>MAXV*0.2){ G.spin=1.2; G.v*=0.15; snd(i, "boom"); break; } }
    G.x=clamp(G.x, -2.4, 2.4);
    // them: each keeps to its lane and its pace, easing out round anyone slower in front
    for(const c of G.cars){ const was=progress(c.z, c.lap); c.z+=c.v*dt; if(c.z>=LEN){ c.z-=LEN; c.lap++; }
      const ahead=G.cars.find(o=>o!==c && Math.abs(o.x-c.x)<0.4 && ((o.z-c.z+LEN)%LEN)<SEG*4 && o.v<c.v);
      c.x+=((ahead ? -c.lane : c.lane)-c.x)*Math.min(1, dt*1.2);
      // and you, if you are in one: a bump, and your speed gone
      const dz=((c.z-G.z)%LEN+LEN)%LEN; if(G.spin<=0 && (dz<SEG*0.7 || dz>LEN-SEG*0.2) && Math.abs(c.x-G.x)<0.42 && G.v>c.v){ G.v=c.v*0.6; G.spin=G.v>MAXV*0.5 ? 0.9 : 0; G.z=c.z-SEG*0.8; snd(i, "wall"); }
      c.p=was; }
    const before=progress(G.z, G.lap);
    G.z+=G.v*dt; if(G.z>=LEN){ G.z-=LEN; G.lap++; G.lapT=0; if(G.lap>LAPS){ G.fin=G.pos; G.won=true; G.score+=[0,20000,12000,8000,5000,3000,2000,1000,500][G.pos]||0; snd(i, "jingle"); return; }
      G.time+=45; snd(i, "pellet"); }
    G.lapT+=dt;
    // where you stand, and the points for the way gone
    const me=progress(G.z, G.lap); G.score+=Math.round((me-before)/40);
    const pos=1+G.cars.filter(c=>progress(c.z, c.lap)>me).length; if(pos<G.pos){ G.score+=500*(G.pos-pos); G.passed+=G.pos-pos; } G.pos=pos;
    G.skyX+=seg.curve*pct*dt*0.08;
    G.time-=dt; if(G.time<=0){ G.time=0; G.over=true; snd(i, "die"); }
  }
  function render(x, G, t){
    sky(x, G);
    const base=segAt(G.z), bp=(G.z%SEG)/SEG, camY=CAMH+lerp(base.y0, base.y1, bp);
    let dx=-base.curve*bp, cx=0, maxy=H;
    const proj=[];
    for(let n=0;n<DRAW;n++){
      const s=road[(base.i+n)%N], loop=(base.i+n)>=N ? LEN : 0, cz=G.z-loop;
      const p=k=>{ const wx=(k ? cx+dx : cx)-G.x*RW, wy=(k ? s.y1 : s.y0)-camY, wz=(k ? s.z1 : s.z0)-cz; if(wz<=0) return null;
        const sc=DEPTH/wz; return {x:Math.round(W/2+sc*wx*W/2), y:Math.round(H/2-sc*wy*H/2), w:Math.round(sc*RW*W/2), sc:sc}; };
      const a=p(0), b=p(1); cx+=dx; dx+=s.curve;
      proj.push({s:s, a:a, b:b, clip:maxy});
      if(!a || !b || b.y>=maxy || b.y>=a.y) continue;
      const fog=Math.min(1, n/DRAW), lk=lake(s);
      x.fillStyle=lk && n>3 ? COLS.lake[s.color] : COLS.grass[s.color]; x.fillRect(0, b.y, W, a.y-b.y);
      if(lk){ x.fillStyle=COLS.grass[s.color]; x.fillRect(0, b.y, Math.max(0, b.x+b.w*1.6), a.y-b.y); }
      quad(x, a.x, a.y, a.w*1.12, b.x, b.y, b.w*1.12, COLS.rumble[s.color]);
      quad(x, a.x, a.y, a.w, b.x, b.y, b.w, COLS.road[s.color]);
      if(s.color) for(let l=1;l<LANES;l++){ const u=-1+2*l/LANES; quad(x, a.x+a.w*u, a.y, a.w*0.02, b.x+b.w*u, b.y, b.w*0.02, COLS.lane); }
      if(fog>0.4){ x.fillStyle="rgba(200,220,240,"+((fog-0.4)*0.9).toFixed(2)+")"; x.fillRect(0, b.y, W, a.y-b.y); }
      maxy=b.y;
    }
    // what stands by the road, and them, far to near
    for(let n=proj.length-1;n>0;n--){ const P=proj[n]; if(!P.a) continue;
      for(const sp of P.s.sprites){ const sx=P.a.x+P.a.w*sp.x; sprite(x, sp, sx, P.a.y, P.a.sc, P.clip); }
      for(const c of G.cars){ const sz=Math.floor((((c.z-G.z)%LEN)+LEN)%LEN/SEG); if(sz!==n) continue;
        sprite(x, {k:"car", col:c.col}, P.a.x+P.a.w*c.x, P.a.y, P.a.sc, P.clip); } }
    // you
    const bounce=G.v>0 ? Math.sin(t*30)*G.v/MAXV*1.2 : 0;
    x.save(); if(G.spin>0){ x.translate(W/2, H-12); x.rotate(Math.sin(G.spin*14)*0.4); x.translate(-W/2, -(H-12)); }
    hatch(x, W/2, H-10+bounce, 1.15, "#e8e8f0", G.steer, G.brake); x.restore();
    if(Math.abs(G.x)>1 && G.v>MAXV*0.1){ x.fillStyle="rgba(120,90,50,0.5)"; for(let k=0;k<5;k++) x.fillRect(W/2-30+Math.random()*60, H-14-Math.random()*10, 3, 3); }
  }
  const mmss=s=>Math.floor(s/60)+"'"+String(Math.floor(s%60)).padStart(2, "0")+'"'+String(Math.floor(s%1*10));

  return {
    name:"ROUTE 6 RALLY", col:"#ffb070",
    help:"ROUTE 6 RALLY · UP/W GAS · DOWN/S BRAKE · LEFT/RIGHT STEER · SPACE SHIFTS · ESC TO STEP AWAY",
    newGame(){ return newRace(); },
    key(G, e){ if(e.repeat || G.over || G.won) return; if(e.code==="Space" || e.code==="ShiftLeft" || e.code==="KeyJ"){ G.gear=1-G.gear; } },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over || G.won) return; G.acc+=dt; while(G.acc>=1/60){ G.acc-=1/60; frame(G, 1/60, K, i); if(G.over || G.won){ G.acc=0; break; } } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("rally", G.score, G.won ? "P"+G.fin : "LAP "+Math.min(G.lap, LAPS)); } },
    draw(x, G, t){
      render(x, G, t);
      x.fillStyle="#000"; x.fillRect(0, 0, W, HUD); x.textBaseline="middle"; _cbFont(x, 12);
      x.textAlign="left"; x.fillStyle="#ffb070"; x.fillText(String(G.score).padStart(6, "0"), 8, 11);
      x.textAlign="center"; x.fillStyle=G.time<10 && ((t*4)|0)%2 ? "#ff4a3a" : "#f2e23a"; x.fillText("TIME "+Math.ceil(G.time), W/2-14, 11);
      x.textAlign="right"; x.fillStyle="#d8d8e0"; x.fillText("LAP "+Math.min(G.lap, LAPS)+"/"+LAPS+"  P"+G.pos, W-8, 11);
      // the dash: speed and gear
      x.fillStyle="rgba(0,0,0,0.55)"; x.fillRect(W-86, H-30, 80, 24); _cbFont(x, 13); x.textAlign="right"; x.fillStyle="#ffffff";
      x.fillText(Math.round(G.v/MAXV*124)+" MPH", W-12, H-22); _cbFont(x, 10); x.fillStyle=G.gear ? "#7ad08a" : "#ffb070"; x.fillText(G.gear ? "HIGH" : "LOW", W-12, H-11);
      x.textAlign="left"; x.fillStyle="#d8d8e0"; x.fillText("LAP "+mmss(G.lapT), 8, H-11);
      if(G.won) _cbMid(x, "FINISHED P"+G.fin, "SPACE TO RACE AGAIN");
      else if(G.over) _cbMid(x, "TIME UP", "SPACE TO RACE AGAIN");
      else if(G.msgT>0) _cbMid(x, G.msgT>3 ? "ROUTE 6 RALLY" : String(Math.ceil(G.msgT)), G.msgT>3 ? "THREE LAPS · START AT THE BACK" : "SPACE SHIFTS LOW / HIGH");
      else if(G.lapT<2 && G.lap>1) _cbMid(x, "LAP "+G.lap, "+45 SECONDS");
      _cbTube(x); },
    // the attract mode: a car driving itself round, the name over it; then the best scores
    attract(x, t, i){
      if(!this._demo){ this._demo=newRace(); this._demo.msgT=0; this._demo.gear=1; this._demo.time=1e9; }
      const D=this._demo, dt=Math.min(0.1, Math.max(0, t-(this._t||t))); this._t=t;
      const seg=segAt(D.z+SEG*6), K={ArrowUp:true, ArrowLeft:seg.curve<-0.5 || D.x>0.3, ArrowRight:seg.curve>0.5 || D.x<-0.3};
      for(let k=0;k<Math.round(dt*60);k++) frame(D, 1/60, K, -1);
      if(D.over || D.won){ this._demo=null; }
      render(x, D, t);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.55)"; x.fillRect(40, 40, W-80, 64);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28); x.fillStyle="#ffb070"; x.fillText("ROUTE 6", W/2, 60); x.fillStyle="#f2e23a"; x.fillText("RALLY", W/2, 88); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 40, W-80, 110); _cbTopDraw(x, "rally", 56, "#ffb070"); }
      _cbFoot(x, i, t); _cbTube(x); },
    _debug:{road:road, frame:frame}
  };
})();

/* ---- into 18g's cabinets: cabinet 7 (12c) ---- */
_CBG[7]=_RR;
{ const L=_cbTop("rally"); if(L.length) CABS.hi[7]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[7]; if(R){ _RR.attract(R.x, 0, 7); R.tex.needsUpdate=true; } }
