"use strict";
/* REST AREA · 18z1-acres.js
   the arcade's thirteenth cabinet (12c): Abduction Acres
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18z1 · ABDUCTION ACRES
   Played the way 18g's are, registered into 18g's _CBG as cabinet 17.

   A shooter of the kind where you fly back and forth over a ground that
   wraps round, with a scanner across the top showing all of it. Here the
   ground is a stretch of Erie County farm country at night, barns and
   silos on the hills, and the cows out in the fields. Saucers (the
   Tippers) come down out of the clouds, hang over a cow and beam her up.
   Shoot one carrying a cow and she floats down again; catch her on the
   way and she is set down gently. Let one get her to the top of the sky
   and she comes back down a Moo-tant, horns and red eyes, and hunts you.
   Hay-pods drift about and burst into a swarm of chaff when hit. You fly
   the Night Owl: thrust either way (it turns about), climb and dive,
   fire straight ahead. B is the barn-burner, three a game, which clears
   everything on the screen. A wave is done when every Tipper is down,
   and each cow still standing pays.
   ---------------------------------------------------------------------- */
const _AA=(function(){
  const W=_CB.W, H=_CB.H, WW=2400, TOP=50, GY=246, DT=1/120;
  const wrap=(x)=>((x%WW)+WW)%WW, dx=(a, b)=>{ let d=wrap(a-b); if(d>WW/2) d-=WW; return d; };
  // the hills: a skyline over the whole width, barns and silos on it; where the cows can stand
  const hill=(x)=>GY+6*Math.sin(x*0.011)+4*Math.sin(x*0.027+1.3)+3*Math.sin(x*0.061+2.1);
  const PROPS=[]; for(let k=0;k<14;k++) PROPS.push({x:k*WW/14+((k*97)%60), kind:k%3});
  function newWave(G){
    G.wave++; G.tip=[]; G.pods=[]; G.mut=[]; G.shots=[]; G.bolts=[]; G.boom=[]; G.left=6+G.wave*2; G.spawnT=1.2; G.msgT=2.4;
    if(G.wave===1 || (G.wave-1)%4===0){ G.cows=[]; for(let k=0;k<10;k++){ const x=wrap(k*WW/10+((k*131)%90)); G.cows.push({x:x, y:hill(x)-5, st:"graze", vy:0, t:Math.random()*5}); } }
    for(let k=0;k<Math.min(5, 1+G.wave);k++) G.pods.push({x:Math.random()*WW, y:TOP+30+Math.random()*120, vx:(Math.random()-0.5)*20, t:Math.random()*6}); }
  function newGame(){ const G={score:0, lives:3, bombs:3, wave:0, over:false, saved:false, acc:0, t:0, fire:false, bomb:false,
      p:{x:200, y:150, vx:0, f:1, dead:0, inv:2}, cam:0}; newWave(G); return G; }
  function kill(G, x, y, col, n){ for(let k=0;k<(n||14);k++){ const a=Math.random()*6.28, s=30+Math.random()*90; G.boom.push({x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, t:0.6+Math.random()*0.4, c:col}); } }
  function die(G, i){ const p=G.p; if(p.dead>0 || p.inv>0) return; p.dead=2.2; kill(G, p.x, p.y, "#ffe8a0", 40); _cbSnd(i, "die"); }
  function frame(G, K, i, dt){
    G.t+=dt; const p=G.p, ai=i<0;
    if(G.msgT>0) G.msgT-=dt;
    // the Night Owl: thrust and drag along x, straight up and down; the camera leads it
    if(p.dead>0){ p.dead-=dt; if(p.dead<=0){ G.lives--; if(G.lives<0){ G.over=true; return; } p.vx=0; p.inv=2.5; p.y=150; } }
    else {
      let ix=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), iy=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
      if(ai){ const tg=G.tip[0]; if(tg){ const d=dx(tg.x, p.x); ix=Math.sign(d)*(Math.abs(d)>60 ? 1 : 0); iy=Math.sign(tg.y-p.y)*(Math.abs(tg.y-p.y)>6 ? 1 : 0); if(Math.abs(d)<200 && ((G.t*5)|0)%2) G.fire=true; } }
      if(ix) p.f=ix; p.vx+=ix*360*dt; p.vx*=Math.pow(0.35, dt); p.vx=clamp(p.vx, -280, 280);
      p.x=wrap(p.x+p.vx*dt); p.y=clamp(p.y+iy*150*dt, TOP+8, GY-14); if(p.inv>0) p.inv-=dt;
      if(G.fire){ G.fire=false; if(G.shots.length<4){ G.shots.push({x:p.x+p.f*12, y:p.y+1, f:p.f, L:4, t:0.7}); if(!ai) _cbSnd(i, "zap"); } }
      if(G.bomb){ G.bomb=false; if(G.bombs>0){ G.bombs--; G.flash=0.25; _cbSnd(i, "boom");
        for(const L of [G.tip, G.mut, G.pods]) for(let k=L.length-1;k>=0;k--){ const e=L[k]; if(Math.abs(dx(e.x, G.cam+W/2))<W/2+10){ kill(G, e.x, e.y, "#ff8a3a"); G.score+=150; if(e.cow){ e.cow.st="fall"; e.cow.vy=0; } L.splice(k, 1); if(L===G.tip) G.left=Math.max(0, G.left); } } } } }
    const want=wrap(p.x-W/2+p.f*60), d=dx(want, G.cam); G.cam=wrap(G.cam+d*Math.min(1, dt*3));
    // the shots: a streak growing as it goes
    for(let k=G.shots.length-1;k>=0;k--){ const s=G.shots[k]; s.x=wrap(s.x+s.f*620*dt); s.L=Math.min(60, s.L+500*dt); s.t-=dt; if(s.t<=0){ G.shots.splice(k, 1); continue; }
      let hit=false;
      for(const L of [G.tip, G.mut, G.pods]){ for(let j=L.length-1;j>=0;j--){ const e=L[j], ex=dx(e.x, s.x);
          if(Math.abs(e.y-s.y)<8 && ex*s.f<=4 && ex*s.f>=-s.L){ hit=true; kill(G, e.x, e.y, L===G.tip ? "#7aff7a" : L===G.mut ? "#ff5a5a" : "#e8c858");
            G.score+=L===G.tip ? 150 : L===G.mut ? 150 : 100; _cbSnd(i, "invkill");
            if(e.cow){ e.cow.st="fall"; e.cow.vy=0; e.cow.carried=null; }
            if(L===G.pods) for(let n=0;n<4;n++) G.mut.push({x:e.x, y:e.y, vx:(Math.random()-0.5)*160, vy:(Math.random()-0.5)*160, chaff:true, t:0});
            L.splice(j, 1); break; } } if(hit) break; }
      if(hit) G.shots.splice(k, 1); }
    // the Tippers: come down, find a cow, hang over her, beam her up; now and then a pellet at you
    G.spawnT-=dt;
    if(G.spawnT<=0 && G.left>0 && G.tip.length<4+G.wave){ G.spawnT=2.4-Math.min(1.4, G.wave*0.15); G.left--;
      G.tip.push({x:wrap(G.cam+W/2+(Math.random()<0.5 ? -1 : 1)*(W*0.7+Math.random()*600)), y:TOP+4, st:"seek", t:0, fireT:2+Math.random()*2}); }
    for(let k=G.tip.length-1;k>=0;k--){ const e=G.tip[k]; e.t+=dt; e.fireT-=dt;
      if(e.st==="seek"){ let best=null, bd=1e9; for(const c of G.cows){ if(c.st!=="graze" || c.taken) continue; const dd=Math.abs(dx(c.x, e.x)); if(dd<bd){ bd=dd; best=c; } }
        if(best){ const d=dx(best.x, e.x); e.x=wrap(e.x+Math.sign(d)*Math.min(Math.abs(d), 70*dt)); e.y+=((best.y-46)-e.y)*Math.min(1, dt*1.2)+Math.sin(e.t*3)*0.3;
          if(Math.abs(d)<3 && Math.abs(e.y-(best.y-46))<3){ e.st="beam"; e.cow=best; best.taken=true; best.st="lift"; best.carried=e; } }
        else { e.x=wrap(e.x+Math.sin(e.t*0.7)*60*dt); e.y=TOP+30+Math.sin(e.t)*20; } }
      else if(e.st==="beam" || e.st==="lift"){ e.st="lift"; e.y-=24*dt; if(e.cow){ e.cow.x=e.x; e.cow.y=e.y+22; }
        if(e.y<TOP+2){ if(e.cow){ e.cow.st="gone"; e.cow.taken=false; } G.mut.push({x:e.x, y:e.y+10, vx:0, vy:0, t:0}); G.tip.splice(k, 1); _cbSnd(i, "pop"); continue; } }
      if(e.fireT<=0 && Math.abs(dx(e.x, G.cam+W/2))<W/2){ e.fireT=2.5+Math.random()*2-Math.min(1.2, G.wave*0.12); const a=Math.atan2(p.y-e.y, dx(p.x, e.x)); G.bolts.push({x:e.x, y:e.y, vx:Math.cos(a)*110, vy:Math.sin(a)*110, t:3}); }
      if(p.dead<=0 && Math.abs(dx(e.x, p.x))<12 && Math.abs(e.y-p.y)<9) die(G, i); }
    // the Moo-tants and the chaff: straight for you, wobbling
    for(const e of G.mut){ e.t+=dt; const d=dx(p.x, e.x), sp=e.chaff ? 120 : 95+G.wave*6;
      e.vx+=(Math.sign(d)*sp-e.vx)*dt*(e.chaff ? 2 : 1.4); e.vy+=(Math.sign(p.y-e.y)*sp*0.7-e.vy)*dt*1.4+Math.sin(e.t*7)*10*dt;
      e.x=wrap(e.x+e.vx*dt); e.y=clamp(e.y+e.vy*dt, TOP+4, GY-8);
      if(p.dead<=0 && Math.abs(d)<10 && Math.abs(e.y-p.y)<9) die(G, i); }
    for(const e of G.pods){ e.t+=dt; e.x=wrap(e.x+e.vx*dt); e.y+=Math.sin(e.t)*10*dt; if(p.dead<=0 && Math.abs(dx(e.x, p.x))<10 && Math.abs(e.y-p.y)<10) die(G, i); }
    for(let k=G.bolts.length-1;k>=0;k--){ const b=G.bolts[k]; b.x=wrap(b.x+b.vx*dt); b.y+=b.vy*dt; b.t-=dt;
      if(b.t<=0 || b.y<TOP || b.y>GY+10){ G.bolts.splice(k, 1); continue; } if(p.dead<=0 && Math.abs(dx(b.x, p.x))<7 && Math.abs(b.y-p.y)<5){ G.bolts.splice(k, 1); die(G, i); } }
    // the cows: graze and wander; a dropped cow floats down, and pays if you catch her or she lands
    for(const c of G.cows){ c.t+=dt;
      if(c.st==="graze"){ c.x=wrap(c.x+Math.sin(c.t*0.3)*3*dt); c.y=hill(c.x)-5; }
      else if(c.st==="fall"){ c.vy=Math.min(40, c.vy+30*dt); c.y+=c.vy*dt;
        if(p.dead<=0 && Math.abs(dx(c.x, p.x))<12 && Math.abs(c.y-p.y)<10){ c.st="caught"; G.score+=500; _cbSnd(i, "jingle"); }
        else if(c.y>=hill(c.x)-5){ c.st="graze"; c.taken=false; G.score+=250; } }
      else if(c.st==="caught"){ c.x=p.x; c.y=p.y+10; if(c.y>=hill(c.x)-12 || p.dead>0){ c.st="graze"; c.taken=false; } } }
    if(G.cows.every(c=>c.st==="gone") && !G.herdGone){ G.herdGone=true; for(const e of G.tip) G.mut.push({x:e.x, y:e.y, vx:0, vy:0, t:0}); G.tip.length=0; G.msgT=2.4; }
    for(let k=G.boom.length-1;k>=0;k--){ const b=G.boom[k]; b.x+=b.vx*dt; b.y+=b.vy*dt; b.t-=dt; if(b.t<=0) G.boom.splice(k, 1); }
    if(G.flash>0) G.flash-=dt;
    // the wave is done when every Tipper is down and nothing is left hunting
    if(G.left<=0 && !G.tip.length && !G.mut.length && G.msgT<=0){ const n=G.cows.filter(c=>c.st!=="gone").length; G.score+=n*100; G.bonus=n*100; G.herdGone=false; newWave(G); _cbSnd(i, "jingle"); }
  }
  /* ---- drawing ---- */
  const STARS=[]; for(let k=0;k<90;k++) STARS.push([(k*197)%WW, TOP+((k*53)%150), (k%3)+1]);
  function cow(x, X, Y, lift){ x.fillStyle="#f2f0ea"; x.fillRect(X-6, Y-3, 12, 6); x.fillRect(X+5, Y-5, 4, 4); x.fillStyle="#1a1a1a"; x.fillRect(X-4, Y-3, 3, 3); x.fillRect(X+1, Y, 3, 3); x.fillRect(X+8, Y-5, 1, 1);
    x.fillStyle="#e8a0a8"; x.fillRect(X+7, Y-2, 2, 1); x.fillStyle="#f2f0ea"; if(!lift){ for(const lx of [-5, -2, 2, 4]) x.fillRect(X+lx, Y+3, 1, 3); } else for(const lx of [-5, 4]) x.fillRect(X+lx, Y+3, 1, 2); }
  function tipper(x, X, Y, t, beam){
    if(beam){ const g=x.createLinearGradient(0, Y, 0, Y+40); g.addColorStop(0, "rgba(140,255,160,0.55)"); g.addColorStop(1, "rgba(140,255,160,0.05)"); x.fillStyle=g; x.beginPath(); x.moveTo(X-4, Y+3); x.lineTo(X+4, Y+3); x.lineTo(X+11, Y+40); x.lineTo(X-11, Y+40); x.fill(); }
    x.fillStyle="#8affa0"; x.beginPath(); x.ellipse(X, Y-3, 5, 4, 0, Math.PI, 0); x.fill(); x.fillStyle="#5a8a6a"; x.beginPath(); x.ellipse(X, Y, 12, 3.5, 0, 0, 7); x.fill();
    for(let k=0;k<4;k++){ x.fillStyle=((t*8+k)|0)%4===0 ? "#ffff6a" : "#3a5a4a"; x.fillRect(X-9+k*6, Y-1, 2, 2); } }
  function mootant(x, X, Y, t, chaff){
    if(chaff){ x.fillStyle=((t*10)|0)%2 ? "#e8c858" : "#b89a3a"; x.fillRect(X-3, Y-3, 6, 6); x.fillStyle="#7a5a1a"; x.fillRect(X-1, Y-1, 2, 2); return; }
    x.fillStyle="#c8c4b8"; x.fillRect(X-7, Y-4, 14, 8); x.fillStyle="#6a1a1a"; x.fillRect(X-4, Y-4, 4, 4); x.fillRect(X+2, Y, 3, 3);
    x.fillStyle="#f2f0ea"; x.fillRect(X-9, Y-7, 2, 3); x.fillRect(X+7, Y-7, 2, 3); x.fillStyle=((t*6)|0)%2 ? "#ff2a2a" : "#ff8a3a"; x.fillRect(X-4, Y-1, 2, 2); x.fillRect(X+2, Y-1, 2, 2); }
  function owl(x, X, Y, f, t){ x.save(); x.translate(X, Y); x.scale(f, 1);
    x.fillStyle="#c8d8f0"; x.beginPath(); x.moveTo(14, 0); x.lineTo(-6, -5); x.lineTo(-10, -5); x.lineTo(-10, 4); x.lineTo(-4, 4); x.closePath(); x.fill();
    x.fillStyle="#3a6ab8"; x.fillRect(-10, -9, 5, 5); x.fillRect(-4, 1, 9, 3); x.fillStyle="#8af0ff"; x.fillRect(2, -3, 5, 2);
    x.fillStyle=((t*20)|0)%2 ? "#ffd84a" : "#ff6a2a"; x.fillRect(-15, -2, 5, 4); x.restore(); }
  function scene(x, G, t){
    const g=x.createLinearGradient(0, TOP, 0, H); g.addColorStop(0, "#04030c"); g.addColorStop(0.7, "#101a34"); g.addColorStop(1, "#1a2a3a"); x.fillStyle=g; x.fillRect(0, 0, W, H);
    for(const s of STARS){ const X=wrap(s[0]-G.cam*0.2), xx=X<W ? X : -10; if(xx>=0){ x.fillStyle=s[2]===3 ? "#f2f0ff" : "#8a8aaa"; x.fillRect(xx, s[1], 1, 1); } }
    x.fillStyle="#f2ecd0"; x.beginPath(); x.arc(W-60, TOP+40, 12, 0, 7); x.fill(); x.fillStyle="#101a34"; x.beginPath(); x.arc(W-55, TOP+36, 11, 0, 7); x.fill();
    // the far ridge, slower; the near hills, the barns and silos, the fields
    x.fillStyle="#0e1828"; x.beginPath(); x.moveTo(0, H); for(let X=0;X<=W;X+=6) x.lineTo(X, GY-26+10*Math.sin((X+G.cam*0.5)*0.009)); x.lineTo(W, H); x.fill();
    for(const pr of PROPS){ const X=dx(pr.x, G.cam); if(X<-30 || X>W+30) continue; const Y=hill(pr.x);
      x.fillStyle="#1a1210"; if(pr.kind===0){ x.fillRect(X-12, Y-16, 24, 16); x.beginPath(); x.moveTo(X-14, Y-16); x.lineTo(X, Y-26); x.lineTo(X+14, Y-16); x.fill(); x.fillStyle="#e8c858"; x.fillRect(X-2, Y-10, 4, 4); }
      else if(pr.kind===1){ x.fillRect(X-5, Y-34, 10, 34); x.beginPath(); x.arc(X, Y-34, 5, Math.PI, 0); x.fill(); }
      else { x.fillRect(X-1, Y-24, 2, 24); x.fillRect(X-8, Y-24, 16, 2); } }
    x.fillStyle="#1a2a1a"; x.beginPath(); x.moveTo(0, H); for(let X=0;X<=W;X+=3) x.lineTo(X, hill(wrap(G.cam+X))); x.lineTo(W, H); x.fill();
    x.fillStyle="#24341e"; for(let X=0;X<W;X+=7) x.fillRect(X, hill(wrap(G.cam+X))+6+((X*3)%5), 3, 1);
    for(const c of G.cows){ if(c.st==="gone") continue; const X=dx(c.x, G.cam); if(X>-12 && X<W+12) cow(x, X, c.y, c.st!=="graze"); }
    for(const e of G.pods){ const X=dx(e.x, G.cam); if(X<-12 || X>W+12) continue; x.fillStyle="#c8a040"; x.beginPath(); x.arc(X, e.y, 6, 0, 7); x.fill(); x.strokeStyle="#7a5a1a"; x.beginPath(); x.moveTo(X-6, e.y); x.lineTo(X+6, e.y); x.stroke(); }
    for(const e of G.tip){ const X=dx(e.x, G.cam); if(X>-20 && X<W+20) tipper(x, X, e.y, t, e.st==="lift"); }
    for(const e of G.mut){ const X=dx(e.x, G.cam); if(X>-12 && X<W+12) mootant(x, X, e.y, t, e.chaff); }
    x.fillStyle="#ff8aff"; for(const b of G.bolts){ const X=dx(b.x, G.cam); x.fillRect(X-1, b.y-1, 3, 3); }
    for(const s of G.shots){ const X=dx(s.x, G.cam), g2=x.createLinearGradient(X-s.f*s.L, 0, X, 0); g2.addColorStop(0, "rgba(255,255,255,0)"); g2.addColorStop(1, "#ffffff");
      x.fillStyle=g2; x.fillRect(Math.min(X, X-s.f*s.L), s.y, s.L, 1.5); }
    for(const b of G.boom){ const X=dx(b.x, G.cam); x.fillStyle=b.c; x.globalAlpha=clamp(b.t*1.6, 0, 1); x.fillRect(X, b.y, 2, 2); } x.globalAlpha=1;
    const p=G.p; if(p.dead<=0 && !(p.inv>0 && ((t*12)|0)%2)) owl(x, dx(p.x, G.cam), p.y, p.f, t);
    if(G.flash>0){ x.fillStyle="rgba(255,240,200,"+(G.flash*3).toFixed(2)+")"; x.fillRect(0, 0, W, H); }
    // the band at the top: score and lives; the scanner under it with all the ground in it
    x.fillStyle="#000"; x.fillRect(0, 0, W, TOP); x.strokeStyle="#3a6ab8"; x.strokeRect(84.5, 25.5, 168, 22);
    const sx=(wx)=>84+wrap(wx-G.cam+W/2-WW/2)/WW*168;
    x.fillStyle="#3a5a3a"; for(let k=0;k<168;k+=2) x.fillRect(84+k, 44+((k*7)%3)*0.5, 2, 1);
    x.strokeStyle="#8a8aaa"; x.strokeRect(sx(G.cam)+0.5, 26.5, W/WW*168, 20);
    for(const c of G.cows) if(c.st!=="gone"){ x.fillStyle="#f2f0ea"; x.fillRect(sx(c.x), 42, 1, 2); }
    for(const e of G.tip){ x.fillStyle="#7aff7a"; x.fillRect(sx(e.x), 26+(e.y-TOP)/(GY-TOP)*18, 2, 2); }
    for(const e of G.mut){ x.fillStyle="#ff5a5a"; x.fillRect(sx(e.x), 26+(e.y-TOP)/(GY-TOP)*18, 2, 2); }
    x.fillStyle="#ffffff"; x.fillRect(sx(p.x), 26+(p.y-TOP)/(GY-TOP)*18, 2, 2);
    x.textBaseline="middle"; _cbFont(x, 11); x.textAlign="left"; x.fillStyle="#8affa0"; x.fillText(String(G.score).padStart(6, "0"), 6, 12);
    x.fillStyle="#c8d8f0"; for(let k=0;k<Math.max(0, G.lives);k++) x.fillRect(6+k*10, 30, 7, 4);
    x.fillStyle="#ff8a3a"; for(let k=0;k<G.bombs;k++) x.fillRect(6+k*8, 40, 5, 5);
    x.textAlign="right"; x.fillStyle="#e8c858"; x.fillText("WAVE "+G.wave, W-6, 12);
    x.fillStyle="#f2f0ea"; x.fillText("COWS "+G.cows.filter(c=>c.st!=="gone").length, W-6, 36); }
  let D=null;
  function demo(){ if(!D){ D=newGame(); D.p.inv=0; } return D; }
  return {
    name:"ABDUCTION ACRES", col:"#8affa0", help:"ARROWS · FLY   SPACE · FIRE   B · BARN-BURNER   N · NEW GAME   ESC · STEP AWAY",
    newGame:newGame,
    key(G, e){ if(e.repeat) return; if(e.code==="Space" || e.code==="KeyJ" || e.code==="KeyZ") G.fire=true; if(e.code==="KeyB" || e.code==="KeyX") G.bomb=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; if(K.Space && ((G.t*8)|0)!==G._f){ G._f=(G.t*8)|0; G.fire=true; }
      G.acc+=Math.min(dt, 0.1); while(G.acc>=DT){ G.acc-=DT; frame(G, K, i, DT); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("abductionacres", G.score, "WAVE "+G.wave); } },
    draw(x, G, t){ scene(x, G, t);
      if(G.over) _cbMid(x, "GAME OVER", "WAVE "+G.wave+" · SPACE TO PLAY AGAIN");
      else if(G.msgT>0) _cbMid(x, G.herdGone ? "THE HERD IS GONE" : "WAVE "+G.wave, G.herdGone ? "THEY ALL COME FOR YOU NOW" : (G.bonus ? "COWS SAVED · "+G.bonus+"  ·  " : "")+"SAVE THE COWS");
      _cbTube(x); },
    attract(x, t, i){ const G=demo(); G.acc=(G.acc||0)+1/12; let n=0; while(G.acc>=DT && n++<12){ G.acc-=DT; frame(G, {}, -1, DT); }
      if(G.over || G.lives<1){ D=null; }
      scene(x, G, t);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(30, 96, W-60, 70);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 26); x.fillStyle="#8affa0"; x.fillText("ABDUCTION", W/2, 116); x.fillStyle="#f2f0ea"; x.fillText("ACRES", W/2, 146); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 70, W-80, 110); _cbTopDraw(x, "abductionacres", 86, "#8affa0"); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();
_CBG[17]=_AA;
{ const L=_cbTop("abductionacres"); if(L.length) CABS.hi[17]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[17]; if(R){ _AA.attract(R.x, 0, 17); R.tex.needsUpdate=true; } }
