"use strict";
/* REST AREA · 18z2-duster.js
   the arcade's fourteenth cabinet (12c): Cropduster Ace
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18z2 · CROPDUSTER ACE
   Played the way 18g's are, registered into 18g's _CBG as cabinet 18.

   A shooter of the kind where the ground scrolls down the screen under
   you and the enemy comes at you in squadrons. You fly Peg, a yellow
   biplane, north up Erie County: the farms first, fields in their rows,
   roads, barns and a creek, then the lake shore and out over the water.
   The Sky Hogs' red planes come in fives, swooping down and round; down
   all five of one squadron and its leader drops a POW (a twin gun, then
   two wingmen). Their bombers lumber through and take some hitting. Z
   is the loop: Peg goes up and over, out of reach of everything, three
   to a life. At the end of each stage the Hogs' airship comes over the
   horizon with guns along its gondola and has to be shot to pieces.
   ---------------------------------------------------------------------- */
const _DU=(function(){
  const W=_CB.W, H=_CB.H, TOP=24, DT=1/120, STAGE_T=70;
  // the ground: a strip at a time, from a seed: fields in rows and colours, a road, a creek, a barn; the lake later on
  const FIELD=["#5a7a2a","#7a8a3a","#a89a4a","#6a5a32","#4a6a2a","#8a7a3a","#3a5a2a"];
  function strip(n, stage){ const r=_trng(n*7919+stage*131), S=[]; const lake=stage%2===0 && n>40; const shore=stage%2===0 && n===40;
    if(lake){ S.push({k:"water"}); if(r()<0.3) S.push({k:"boat", x:20+r()*(W-40)}); return S; }
    if(shore){ S.push({k:"shore"}); return S; }
    let x=0; while(x<W){ const w=60+r()*100; S.push({k:"field", x:x, w:w, c:FIELD[(r()*FIELD.length)|0], rows:r()<0.7, dir:r()<0.5}); x+=w; }
    if(r()<0.25) S.push({k:"road", x:r()*W}); if(r()<0.18) S.push({k:"barn", x:20+r()*(W-40)}); if(r()<0.12) S.push({k:"silo", x:20+r()*(W-40)});
    return S; }
  const SH=48;                                                    // (a strip's height)
  function newStage(G){ G.stage++; G.dist=0; G.T=0; G.boss=null; G.foes=[]; G.shots=[]; G.bolts=[]; G.pows=[]; G.boom=[]; G.sq=0; G.msgT=2.5; G.strips={};
    G.plan=[]; for(let k=0;k<26+G.stage*4;k++) G.plan.push({at:2+k*(STAGE_T-6)/(26+G.stage*4), kind:k%7===6 ? "bomber" : "sq"}); }
  function newGame(){ const G={score:0, lives:3, stage:0, over:false, saved:false, acc:0, t:0, fire:false, loop:false,
      p:{x:W/2, y:H-50, dead:0, inv:2, loops:3, loopT:0, gun:1}}; newStage(G); return G; }
  function burst(G, x, y, n, c){ for(let k=0;k<n;k++){ const a=Math.random()*6.28, s=20+Math.random()*80; G.boom.push({x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, t:0.5+Math.random()*0.5, c:c||"#ffb84a"}); } }
  function die(G, i){ const p=G.p; if(p.dead>0 || p.inv>0 || p.loopT>0) return; p.dead=2.0; burst(G, p.x, p.y, 40, "#ffe08a"); _cbSnd(i, "die"); }
  function squadron(G){ G.sq++; const id=G.sq, side=Math.random()<0.5 ? -1 : 1, shape=(G.sq+G.stage)%3;
    for(let k=0;k<5;k++) G.foes.push({kind:"fighter", sq:id, lead:k===0, hp:1, t:-k*0.28, side:side, shape:shape, x:-50, y:-50, fireT:1.5+Math.random()*2}); }
  function frame(G, K, i, dt){
    G.t+=dt; G.T+=dt; G.dist+=dt*30; const p=G.p, ai=i<0;
    if(G.msgT>0) G.msgT-=dt;
    // Peg: anywhere on the screen; the loop takes her out of it for a moment
    if(p.dead>0){ p.dead-=dt; if(p.dead<=0){ G.lives--; if(G.lives<0){ G.over=true; return; } p.x=W/2; p.y=H-50; p.inv=2.5; p.loops=3; p.gun=1; } }
    else {
      let ix=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), iy=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
      if(ai){ const f=G.foes[0]||G.boss; if(f){ ix=Math.sign(f.x-p.x)*(Math.abs(f.x-p.x)>8 ? 1 : 0); } iy=Math.sign((H-70)-p.y); if(((G.t*6)|0)%2) G.fire=true; }
      p.x=clamp(p.x+ix*140*dt, 12, W-12); p.y=clamp(p.y+iy*120*dt, TOP+30, H-16); if(p.inv>0) p.inv-=dt;
      if(p.loopT>0) p.loopT-=dt;
      if(G.loop){ G.loop=false; if(p.loops>0 && p.loopT<=0){ p.loops--; p.loopT=1.4; _cbSnd(i, "whoosh"); } }
      if(G.fire){ G.fire=false; if(p.loopT<=0 && G.shots.length<12){ const sp=p.gun>=2 ? [-5, 5] : [0];
          for(const o of sp) G.shots.push({x:p.x+o, y:p.y-10}); if(p.gun>=3) for(const s of [-1, 1]) G.shots.push({x:p.x+s*20, y:p.y-4});
          if(!ai) _cbSnd(i, "zap"); } } }
    for(let k=G.shots.length-1;k>=0;k--){ const s=G.shots[k]; s.y-=360*dt; if(s.y<TOP) G.shots.splice(k, 1); }
    // the plan: a squadron, or a bomber, at its time; the airship at the end
    while(G.plan.length && G.plan[0].at<=G.T){ const e=G.plan.shift(); if(e.kind==="sq") squadron(G); else G.foes.push({kind:"bomber", hp:10+G.stage*2, x:30+Math.random()*(W-60), y:TOP-20, t:0, fireT:1.0}); }
    if(!G.plan.length && !G.boss && G.T>STAGE_T && !G.foes.length){ G.boss={x:W/2, y:-40, hp:110+G.stage*30, hp0:110+G.stage*30, t:0, guns:[-46, -24, 0, 24, 46].map(o=>({o:o, hp:8, t:Math.random()*2}))}; G.msgT=2.0; }
    // the red planes: each squadron down a curve of its own, firing now and then; the bombers straight on, spraying
    for(let k=G.foes.length-1;k>=0;k--){ const f=G.foes[k]; f.t+=dt; f.fireT-=dt;
      if(f.kind==="fighter"){ if(f.t<0) continue; const u=f.t;
        if(f.shape===0){ f.x=W/2+f.side*(W*0.42)*Math.cos(u*1.3); f.y=TOP-10+u*70; }
        else if(f.shape===1){ f.x=(f.side>0 ? -10 : W+10)+f.side*u*120; f.y=TOP+30+50*Math.sin(u*2)+u*25; }
        else { f.x=W/2+f.side*(80-u*10)*Math.sin(u*2.2); f.y=TOP-10+(u<1.6 ? u*80 : 128-(u-1.6)*30+(u>3.4 ? (u-3.4)*120 : 0)); }
        if(f.y>H+20 || f.x<-40 || f.x>W+40 && f.t>2){ G.foes.splice(k, 1); continue; } }
      else { f.y+=22*dt; f.x+=Math.sin(f.t*0.8)*10*dt; if(f.y>H+30){ G.foes.splice(k, 1); continue; } }
      if(f.fireT<=0 && f.y>TOP && f.y<H-60){ f.fireT=(f.kind==="bomber" ? 1.3 : 2.4+Math.random()*2)-Math.min(0.8, G.stage*0.1);
        const a=Math.atan2(p.y-f.y, p.x-f.x), n=f.kind==="bomber" ? 3 : 1; for(let j=0;j<n;j++){ const aa=a+(j-(n-1)/2)*0.25; G.bolts.push({x:f.x, y:f.y, vx:Math.cos(aa)*100, vy:Math.sin(aa)*100}); } }
      if(p.dead<=0 && p.loopT<=0 && Math.abs(f.x-p.x)<(f.kind==="bomber" ? 18 : 10) && Math.abs(f.y-p.y)<10) die(G, i);
      for(let j=G.shots.length-1;j>=0;j--){ const s=G.shots[j]; if(Math.abs(s.x-f.x)<(f.kind==="bomber" ? 18 : 8) && Math.abs(s.y-f.y)<(f.kind==="bomber" ? 12 : 8)){ G.shots.splice(j, 1); f.hp--;
          if(f.hp<=0){ burst(G, f.x, f.y, f.kind==="bomber" ? 30 : 14); _cbSnd(i, "invkill"); G.score+=f.kind==="bomber" ? 500 : 100;
            if(f.kind==="fighter"){ const left=G.foes.filter(o=>o.sq===f.sq && o!==f).length; if(!left){ G.pows.push({x:f.x, y:f.y}); G.score+=300; } }
            G.foes.splice(k, 1); } else _cbSnd(i, "tick"); break; } } }
    // the airship: across the top, its guns firing down; each gun knocked out, then the envelope itself
    if(G.boss){ const b=G.boss; b.t+=dt; b.y=Math.min(TOP+46, b.y+20*dt); b.x=W/2+Math.sin(b.t*0.4)*60;
      for(const g of b.guns){ if(g.hp<=0) continue; g.t-=dt; if(g.t<=0 && b.y>TOP){ g.t=1.6+Math.random()-Math.min(0.6, G.stage*0.08); const gx=b.x+g.o, gy=b.y+26, a=Math.atan2(p.y-gy, p.x-gx); G.bolts.push({x:gx, y:gy, vx:Math.cos(a)*95, vy:Math.sin(a)*95}); } }
      for(let j=G.shots.length-1;j>=0;j--){ const s=G.shots[j];
        const gun=b.guns.find(g=>g.hp>0 && Math.abs(s.x-(b.x+g.o))<7 && Math.abs(s.y-(b.y+26))<7);
        if(gun){ gun.hp--; G.shots.splice(j, 1); if(gun.hp<=0){ burst(G, b.x+gun.o, b.y+26, 16); G.score+=250; _cbSnd(i, "invkill"); } continue; }
        if(Math.abs(s.x-b.x)<70 && Math.abs(s.y-b.y)<20){ G.shots.splice(j, 1); b.hp--; if(b.guns.every(g=>g.hp<=0)) b.hp--; _cbSnd(i, "tick");
          if(b.hp<=0){ for(let n=0;n<6;n++) burst(G, b.x+(n-2.5)*22, b.y, 20); G.score+=5000; G.boss=null; _cbSnd(i, "boom"); G.clearT=3; break; } } } }
    if(G.clearT>0){ G.clearT-=dt; if(G.clearT<=0){ newStage(G); _cbSnd(i, "jingle"); } }
    for(let k=G.bolts.length-1;k>=0;k--){ const b=G.bolts[k]; b.x+=b.vx*dt; b.y+=b.vy*dt; if(b.y>H+5 || b.y<TOP-5 || b.x<-5 || b.x>W+5){ G.bolts.splice(k, 1); continue; }
      if(p.dead<=0 && Math.abs(b.x-p.x)<5 && Math.abs(b.y-p.y)<6){ G.bolts.splice(k, 1); die(G, i); } }
    for(let k=G.pows.length-1;k>=0;k--){ const w=G.pows[k]; w.y+=40*dt; if(w.y>H+10){ G.pows.splice(k, 1); continue; }
      if(p.dead<=0 && Math.abs(w.x-p.x)<12 && Math.abs(w.y-p.y)<12){ G.pows.splice(k, 1); p.gun=Math.min(3, p.gun+1); G.score+=1000; _cbSnd(i, "jingle"); } }
    for(let k=G.boom.length-1;k>=0;k--){ const b=G.boom[k]; b.x+=b.vx*dt; b.y+=b.vy*dt+30*dt; b.t-=dt; if(b.t<=0) G.boom.splice(k, 1); }
  }
  /* ---- drawing ---- */
  function plane(x, X, Y, s, body, wing, t, flip){ x.save(); x.translate(X, Y); x.scale(s, flip ? -s : s);
    x.fillStyle=wing; x.fillRect(-14, -3, 28, 5); x.fillRect(-12, -9, 24, 3);
    x.fillStyle=body; x.fillRect(-2.5, -12, 5, 22); x.fillRect(-7, 7, 14, 3);
    x.fillStyle="#2a2a2a"; x.fillRect(-1, -6, 2, 3); x.fillStyle="rgba(200,200,200,0.6)"; x.fillRect(-7+((t*40)|0)%2*2, -14, 12, 1.5); x.restore(); }
  function scene(x, G, t){
    const off=G.dist%SH, base=Math.floor(G.dist/SH);
    for(let r0=-1;r0<Math.ceil(H/SH)+1;r0++){ const n=base+r0, y=H-(r0+1)*SH+off;
      let S=G.strips[n]; if(!S){ S=G.strips[n]=strip(n, G.stage); }
      for(const e of S){
        if(e.k==="water"){ x.fillStyle="#2a5a7a"; x.fillRect(0, y, W, SH+1); x.fillStyle="rgba(200,230,255,0.15)"; for(let k=0;k<6;k++) x.fillRect(((n*37+k*61)%W), y+k*8, 18, 1); }
        else if(e.k==="shore"){ x.fillStyle="#3a6a2a"; x.fillRect(0, y+SH*0.6, W, SH*0.4+1); x.fillStyle="#d8c89a"; x.fillRect(0, y+SH*0.35, W, SH*0.25); x.fillStyle="#2a5a7a"; x.fillRect(0, y, W, SH*0.35); }
        else if(e.k==="field"){ x.fillStyle=e.c; x.fillRect(e.x, y, e.w+1, SH+1); if(e.rows){ x.fillStyle="rgba(0,0,0,0.12)"; if(e.dir) for(let k=e.x+3;k<e.x+e.w;k+=6) x.fillRect(k, y, 2, SH); else for(let k=0;k<SH;k+=6) x.fillRect(e.x, y+k, e.w, 2); }
          x.fillStyle="#2a3a1a"; x.fillRect(e.x, y, 1, SH); }
        else if(e.k==="road"){ x.fillStyle="#6a6a66"; x.fillRect(e.x-5, y, 10, SH+1); x.fillStyle="#d8c84a"; for(let k=0;k<SH;k+=12) x.fillRect(e.x-0.5, y+k, 1, 6); }
        else if(e.k==="barn"){ x.fillStyle="#8a2a1a"; x.fillRect(e.x-10, y+14, 20, 16); x.fillStyle="#5a5a5a"; x.fillRect(e.x-11, y+12, 22, 4); }
        else if(e.k==="silo"){ x.fillStyle="#b8b8b0"; x.beginPath(); x.arc(e.x, y+24, 7, 0, 7); x.fill(); x.fillStyle="#8a8a88"; x.beginPath(); x.arc(e.x, y+24, 4, 0, 7); x.fill(); }
        else if(e.k==="boat"){ x.fillStyle="#f2f0ea"; x.fillRect(e.x-6, y+20, 12, 4); x.fillStyle="rgba(255,255,255,0.4)"; x.fillRect(e.x-1, y+24, 2, 14); } } }
    // the clouds' shadows drifting over
    x.fillStyle="rgba(0,0,0,0.12)"; for(let k=0;k<3;k++){ const cy=((G.dist*1.3+k*140)%(H+120))-60, cx=((k*131+G.t*6)%(W+100))-50; x.beginPath(); x.ellipse(cx, cy, 40, 16, 0, 0, 7); x.fill(); }
    for(const w of G.pows){ x.fillStyle=((t*6)|0)%2 ? "#ff3a3a" : "#ffe84a"; x.fillRect(w.x-8, w.y-6, 16, 12); x.fillStyle="#1a1a1a"; _cbFont(x, 9); x.textAlign="center"; x.textBaseline="middle"; x.fillText("POW", w.x, w.y+0.5); }
    for(const f of G.foes){ if(f.kind==="fighter"){ if(f.t>=0) plane(x, f.x, f.y, 0.7, f.lead ? "#ffd84a" : "#c82a2a", "#8a1a1a", t, true); }
      else { x.save(); x.translate(f.x, f.y); x.fillStyle="#5a2a2a"; x.fillRect(-26, -4, 52, 8); x.fillStyle="#7a3a3a"; x.fillRect(-5, -14, 10, 30); x.fillRect(-12, 12, 24, 4);
        x.fillStyle="#1a1a1a"; for(const o of [-16, 16]) x.fillRect(o-2, -7, 4, 4); x.restore(); } }
    if(G.boss){ const b=G.boss; x.fillStyle="#7a7a74"; x.beginPath(); x.ellipse(b.x, b.y, 74, 20, 0, 0, 7); x.fill(); x.fillStyle="#5a5a54"; x.fillRect(b.x-74, b.y-2, 148, 4);
      x.fillStyle="#c82a2a"; _cbFont(x, 10); x.textAlign="center"; x.textBaseline="middle"; x.fillText("SKY HOGS", b.x, b.y-9);
      x.fillStyle="#3a3a36"; x.fillRect(b.x-56, b.y+18, 112, 10);
      for(const g of b.guns){ x.fillStyle=g.hp>0 ? "#1a1a1a" : "#5a3a1a"; x.fillRect(b.x+g.o-4, b.y+22, 8, 8); }
      x.fillStyle="#3a3a36"; x.beginPath(); x.moveTo(b.x+74, b.y); x.lineTo(b.x+86, b.y-12); x.lineTo(b.x+86, b.y+12); x.fill();
      x.fillStyle="#ff4a3a"; x.fillRect(W/2-60, TOP+4, 120*Math.max(0, b.hp/b.hp0), 3); }
    x.fillStyle="#fff09a"; for(const s of G.shots) x.fillRect(s.x-1, s.y-4, 2, 6);
    x.fillStyle="#ff6a4a"; for(const b of G.bolts){ x.beginPath(); x.arc(b.x, b.y, 2, 0, 7); x.fill(); }
    for(const b of G.boom){ x.globalAlpha=clamp(b.t*2, 0, 1); x.fillStyle=b.c; x.fillRect(b.x, b.y, 2, 2); } x.globalAlpha=1;
    const p=G.p;
    if(p.dead<=0 && !(p.inv>0 && ((t*12)|0)%2)){
      if(p.loopT>0){ const u=1-p.loopT/1.4, s=1+0.5*Math.sin(u*Math.PI); x.fillStyle="rgba(0,0,0,0.25)"; x.beginPath(); x.ellipse(p.x+10, p.y+14, 10, 4, 0, 0, 7); x.fill();
        plane(x, p.x, p.y-Math.sin(u*Math.PI)*24, s, "#f2c41c", "#e8a01a", t, u>0.25 && u<0.75); }
      else { x.fillStyle="rgba(0,0,0,0.25)"; x.beginPath(); x.ellipse(p.x+8, p.y+12, 9, 3, 0, 0, 7); x.fill(); plane(x, p.x, p.y, 1, "#f2c41c", "#e8a01a", t, false);
        if(p.gun>=3) for(const s of [-1, 1]) plane(x, p.x+s*20, p.y+6, 0.55, "#f2c41c", "#e8a01a", t, false); } }
    x.fillStyle="#000"; x.fillRect(0, 0, W, TOP); x.textBaseline="middle"; _cbFont(x, 11);
    x.textAlign="left"; x.fillStyle="#f2c41c"; x.fillText(String(G.score).padStart(6, "0"), 6, 12);
    x.textAlign="center"; x.fillStyle="#c8d8f0"; x.fillText("LOOPS "+"R".repeat(Math.max(0, p.loops)), W/2, 12);
    x.textAlign="right"; x.fillStyle="#f2f0ea"; x.fillText("STAGE "+G.stage+"  "+"▲".repeat(Math.max(0, G.lives)), W-6, 12); }
  let D=null;
  function demo(){ if(!D){ D=newGame(); } return D; }
  return {
    name:"CROPDUSTER ACE", col:"#f2c41c", help:"ARROWS · FLY   SPACE · FIRE   Z · LOOP   N · NEW GAME   ESC · STEP AWAY",
    newGame:newGame,
    key(G, e){ if(e.repeat) return; if(e.code==="Space" || e.code==="KeyJ") G.fire=true; if(e.code==="KeyZ" || e.code==="KeyB" || e.code==="KeyX") G.loop=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; if(K.Space && ((G.t*9)|0)!==G._f){ G._f=(G.t*9)|0; G.fire=true; }
      G.acc+=Math.min(dt, 0.1); while(G.acc>=DT){ G.acc-=DT; frame(G, K, i, DT); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("cropdusterace", G.score, "STAGE "+G.stage); } },
    draw(x, G, t){ scene(x, G, t);
      if(G.over) _cbMid(x, "GAME OVER", "STAGE "+G.stage+" · SPACE TO PLAY AGAIN");
      else if(G.clearT>0) _cbMid(x, "AIRSHIP DOWN", "+5000 · ON NORTH");
      else if(G.msgT>0) _cbMid(x, G.boss ? "THE AIRSHIP" : "STAGE "+G.stage, G.boss ? "SHOOT OUT ITS GUNS" : (G.stage%2===0 ? "OUT OVER THE LAKE" : "UP OVER THE FARMS"));
      _cbTube(x); },
    attract(x, t, i){ const G=demo(); G.acc=(G.acc||0)+1/12; let n=0; while(G.acc>=DT && n++<12){ G.acc-=DT; frame(G, {}, -1, DT); }
      if(G.over) D=null;
      scene(x, G, t);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(30, 96, W-60, 70);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 26); x.fillStyle="#f2c41c"; x.fillText("CROPDUSTER", W/2, 116); x.fillStyle="#c82a2a"; x.fillText("ACE", W/2, 146); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 70, W-80, 110); _cbTopDraw(x, "cropdusterace", 86, "#f2c41c"); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();
_CBG[18]=_DU;
{ const L=_cbTop("cropdusterace"); if(L.length) CABS.hi[18]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[18]; if(R){ _DU.attract(R.x, 0, 18); R.tex.needsUpdate=true; } }
