"use strict";
/* REST AREA · 18z3-well.js
   the arcade's fifteenth cabinet (12c): Deep Well
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18z3 · DEEP WELL
   Played the way 18g's are, registered into 18g's _CBG as cabinet 19.

   A shooter of the kind played round the rim of a tube seen end on, in
   glowing lines. Here the tube is a well, sixteen lanes of it going
   down, a different shape each level (round, square, a clover, a star,
   a V, a straight flume). You are the Bucket, on the rim: step from lane
   to lane and fire straight down yours. Up out of the dark come Jumpers,
   which climb a lane and at the top hop along the rim at you; Sparks,
   which wriggle up from lane to lane and go off at the rim; and
   Bindweed, which grows a vine up a lane and spits from its head (shoot
   the head off, then shoot the vine back). B is the zapper, once a
   level: everything in the well at once. When the last of a level is
   gone you dive down the well to the next; a vine still standing in your
   lane catches you on the way.
   ---------------------------------------------------------------------- */
const _DW=(function(){
  const W=_CB.W, H=_CB.H, TOP=24, DT=1/120, N=16;
  // the shapes: sixteen rim points in -1..1 (closed shapes wrap, open ones have seventeen points)
  const SHAPES=[
    {name:"THE ROUND WELL", closed:true, col:"#3a8aff", pts:Array.from({length:N}, (_, k)=>{ const a=k/N*Math.PI*2-Math.PI/2; return [Math.cos(a), Math.sin(a)]; })},
    {name:"THE SQUARE CRIB", closed:true, col:"#ff4a8a", pts:Array.from({length:N}, (_, k)=>{ const s=k/4|0, u=(k%4)/4; return [[-1+2*u,-1],[1,-1+2*u],[1-2*u,1],[-1,1-2*u]][s]; })},
    {name:"THE CLOVER", closed:true, col:"#3aff8a", pts:Array.from({length:N}, (_, k)=>{ const a=k/N*Math.PI*2, r=0.62+0.38*Math.abs(Math.cos(a*2)); return [Math.cos(a)*r, Math.sin(a)*r]; })},
    {name:"THE STAR", closed:true, col:"#ffd84a", pts:Array.from({length:N}, (_, k)=>{ const a=k/N*Math.PI*2-Math.PI/2, r=k%2 ? 0.55 : 1; return [Math.cos(a)*r, Math.sin(a)*r]; })},
    {name:"THE V", closed:false, col:"#c84aff", pts:Array.from({length:N+1}, (_, k)=>{ const u=k/N; return [-1+2*u, -0.1+Math.abs(u-0.5)*-1.6+0.7]; })},
    {name:"THE FLUME", closed:false, col:"#ff8a3a", pts:Array.from({length:N+1}, (_, k)=>[-1+2*k/N, 0.35])}];
  const CX=W/2, CY=TOP+(H-TOP)/2+6, R=118, DEEP=0.16;
  // a point on the rim at depth z (0 the rim, 1 the bottom): drawn smaller and toward the middle the deeper it is
  const sc=(z)=>1/(1+((1/DEEP)-1)*z);
  function P(G, k, z){ const S=G.S, p=S.pts[((k%S.pts.length)+S.pts.length)%S.pts.length], s=sc(z); return [CX+p[0]*R*s, CY+p[1]*R*s-(1-s)*10]; }
  const lanes=(G)=>G.S.closed ? N : N;
  const laneMid=(G, l, z)=>{ const a=P(G, l, z), b=P(G, l+1, z); return [(a[0]+b[0])/2, (a[1]+b[1])/2]; };
  const wrapL=(G, l)=>G.S.closed ? ((l%N)+N)%N : clamp(l, 0, N-1);
  function newLevel(G){ G.level++; G.S=SHAPES[(G.level-1)%SHAPES.length]; G.foes=[]; G.shots=[]; G.spits=[]; G.boom=[]; G.vines=[];
    G.todo=8+G.level*2; G.spawnT=1.2; G.dive=0; G.zap=1; G.msgT=2.2; }
  function newGame(){ const G={score:0, lives:3, level:0, over:false, saved:false, acc:0, t:0, fire:false, zapK:false, p:{l:0, dead:0, stepT:0}}; newLevel(G); return G; }
  function burst(G, x, y, c, n){ for(let k=0;k<(n||12);k++){ const a=Math.random()*6.28, s=20+Math.random()*90; G.boom.push({x:x, y:y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, t:0.5+Math.random()*0.4, c:c}); } }
  function die(G, i){ if(G.p.dead>0) return; G.p.dead=2.0; const [x, y]=laneMid(G, G.p.l, G.dive); burst(G, x, y, "#ffff8a", 40); _cbSnd(i, "die"); }
  function frame(G, K, i, dt){
    G.t+=dt; const p=G.p, ai=i<0; if(G.msgT>0) G.msgT-=dt;
    if(p.dead>0){ p.dead-=dt; if(p.dead<=0){ G.lives--; if(G.lives<0){ G.over=true; return; } G.foes=G.foes.filter(f=>f.kind==="weed"); G.spits=[]; G.dive=0; G.diving=false; } return; }
    // the Bucket: a lane at a time, quick when held
    let ix=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0);
    if(ai){ const f=G.foes.find(o=>o.kind!=="weed") || G.foes[0]; if(f){ const d=((f.l-p.l)%N+N)%N; ix=d===0 ? 0 : d<N/2 ? 1 : -1; } if(((G.t*7)|0)%2) G.fire=true; }
    p.stepT-=dt; if(ix && p.stepT<=0){ p.l=wrapL(G, p.l+ix); p.stepT=0.075; if(!ai) _cbSnd(i, "tick"); } if(!ix) p.stepT=0;
    if(G.fire){ G.fire=false; if(G.shots.length<6){ G.shots.push({l:p.l, z:G.dive}); if(!ai) _cbSnd(i, "zap"); } }
    if(G.zapK){ G.zapK=false; if(G.zap>0 && !G.diving){ G.zap--; G.flash=0.3; _cbSnd(i, "boom"); for(const f of G.foes){ const [x, y]=laneMid(G, f.l, f.z); burst(G, x, y, G.S.col, 10); G.score+=f.kind==="weed" ? 250 : 150; } G.foes=[]; G.spits=[]; } }
    // the dive: down the well, the vines in the way
    if(G.diving){ G.dive+=dt*0.45; for(const v of G.vines) if(v.l===p.l && v.top<G.dive && G.dive<1){ die(G, i); return; }
      if(G.dive>=1.15){ newLevel(G); G.diving=false; _cbSnd(i, "jingle"); } }
    // the shots: down the lane, against whatever is in it
    for(let k=G.shots.length-1;k>=0;k--){ const s=G.shots[k]; s.z+=dt*1.9; if(s.z>1){ G.shots.splice(k, 1); continue; }
      let hit=false;
      for(let j=G.foes.length-1;j>=0;j--){ const f=G.foes[j]; if(f.l===s.l && Math.abs(f.z-s.z)<0.06){ f.hp=(f.hp||1)-1;
          if(f.hp<=0){ const [x, y]=laneMid(G, f.l, f.z); burst(G, x, y, f.kind==="spark" ? "#ffff6a" : f.kind==="weed" ? "#6aff6a" : "#ff6a6a"); G.score+=f.kind==="weed" ? 250 : f.kind==="spark" ? 200 : 150; G.foes.splice(j, 1); _cbSnd(i, "invkill"); }
          else _cbSnd(i, "tick");
          hit=true; break; } }
      if(!hit) for(let j=G.spits.length-1;j>=0;j--){ const q=G.spits[j]; if(q.l===s.l && Math.abs(q.z-s.z)<0.05){ G.spits.splice(j, 1); hit=true; G.score+=10; break; } }
      if(!hit) for(const v of G.vines) if(v.l===s.l && s.z>=v.top && !G.foes.some(f=>f.kind==="weed" && f.l===v.l)){ v.top=Math.min(1.01, v.top+0.08); hit=true; G.score+=5; break; }
      if(hit) G.shots.splice(k, 1); }
    G.vines=G.vines.filter(v=>v.top<1);
    // the things coming up: spawned at the bottom, a few at a time
    G.spawnT-=dt;
    if(!G.diving && G.todo>0 && G.spawnT<=0 && G.foes.length<4+G.level){ G.todo--; G.spawnT=Math.max(0.5, 1.6-G.level*0.08);
      const r=Math.random(), kind=r<0.55 ? "jumper" : r<0.8 ? "spark" : "weed", l=(Math.random()*N)|0;
      G.foes.push({kind:kind, l:l, z:1, t:0, v:(kind==="spark" ? 0.16 : kind==="weed" ? 0.09 : 0.12)+G.level*0.008, hop:0, dir:Math.random()<0.5 ? -1 : 1, top:0.25+Math.random()*0.4, hp:kind==="weed" ? 3 : 1, spitT:1.5}); }
    for(let k=G.foes.length-1;k>=0;k--){ const f=G.foes[k]; f.t+=dt;
      if(f.kind==="jumper"){
        if(f.z>0){ f.z=Math.max(0, f.z-f.v*dt); if(Math.random()<dt*0.3) f.l=wrapL(G, f.l+f.dir); }
        else { f.hop-=dt; if(f.hop<=0){ f.hop=0.55-Math.min(0.3, G.level*0.02); const d=((p.l-f.l)%N+N)%N; f.dir=G.S.closed ? (d<N/2 ? 1 : -1) : Math.sign(p.l-f.l)||1; f.l=wrapL(G, f.l+f.dir); } }
        if(f.z<=0.02 && f.l===p.l){ die(G, i); return; } }
      else if(f.kind==="spark"){ f.z-=f.v*dt; if(Math.sin(f.t*5+k)>0.96) f.l=wrapL(G, f.l+(Math.random()<0.5 ? -1 : 1));
        if(f.z<=0){ const [x, y]=laneMid(G, f.l, 0); burst(G, x, y, "#ffff6a", 10); if(f.l===p.l){ die(G, i); return; } G.foes.splice(k, 1); continue; } }
      else { // a weed: up to its height, its vine behind it, spitting
        if(f.z>f.top) f.z-=f.v*dt; let v=G.vines.find(o=>o.l===f.l); if(!v){ v={l:f.l, top:1}; G.vines.push(v); } v.top=Math.min(v.top, f.z);
        f.spitT-=dt; if(f.z<=f.top+0.01 && f.spitT<=0){ f.spitT=1.8-Math.min(0.9, G.level*0.08); G.spits.push({l:f.l, z:f.z}); } } }
    for(let k=G.spits.length-1;k>=0;k--){ const q=G.spits[k]; q.z-=dt*0.5; if(q.z<=0){ G.spits.splice(k, 1); if(q.l===p.l){ die(G, i); return; } } }
    for(let k=G.boom.length-1;k>=0;k--){ const b=G.boom[k]; b.x+=b.vx*dt; b.y+=b.vy*dt; b.t-=dt; if(b.t<=0) G.boom.splice(k, 1); }
    if(G.flash>0) G.flash-=dt;
    // the level is done when nothing is left to come and nothing moves but the weeds' vines: then the dive
    if(!G.diving && G.todo<=0 && !G.foes.some(f=>f.kind!=="weed") && !G.foes.length){ G.diving=true; G.score+=1000; _cbSnd(i, "whoosh"); }
  }
  /* ---- drawing: glowing lines on black ---- */
  function line(x, a, b){ x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); }
  function scene(x, G, t){
    x.fillStyle="#000"; x.fillRect(0, 0, W, H);
    const S=G.S, zoom=G.diving ? 1+G.dive*G.dive*3 : 1;
    x.save(); x.translate(CX, CY); x.scale(zoom, zoom); x.translate(-CX, -CY);
    x.lineWidth=1.2/zoom; x.shadowBlur=6; x.shadowColor=S.col; x.strokeStyle=S.col;
    const n=S.closed ? N : N+1;
    for(let k=0;k<n;k++) line(x, P(G, k, 0), P(G, k, 1));
    x.beginPath(); for(let k=0;k<=(S.closed ? N : N);k++){ const q=P(G, k, 0); if(k) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); } x.stroke();
    x.beginPath(); for(let k=0;k<=(S.closed ? N : N);k++){ const q=P(G, k, 1); if(k) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); } x.stroke();
    // your lane lit
    x.strokeStyle="#ffff8a"; x.shadowColor="#ffff8a"; line(x, P(G, G.p.l, 0), P(G, G.p.l, 1)); line(x, P(G, G.p.l+1, 0), P(G, G.p.l+1, 1));
    // the vines, green and jagged
    x.strokeStyle="#5aff5a"; x.shadowColor="#5aff5a";
    for(const v of G.vines){ x.beginPath(); for(let z=1;z>=v.top;z-=0.04){ const [mx, my]=laneMid(G, v.l, z); const j=((z*25)|0)%2 ? 2 : -2; if(z===1) x.moveTo(mx+j, my); else x.lineTo(mx+j, my); } x.stroke(); }
    // the things in the well
    for(const f of G.foes){ const a=P(G, f.l, f.z), b=P(G, f.l+1, f.z), [mx, my]=laneMid(G, f.l, f.z), s=sc(f.z);
      if(f.kind==="jumper"){ x.strokeStyle="#ff4a4a"; x.shadowColor="#ff4a4a"; const up=f.z<=0 ? Math.abs(Math.sin(f.t*12))*6 : 0;
        x.beginPath(); x.moveTo(a[0], a[1]-up); x.lineTo(mx, my-6*s-up); x.lineTo(b[0], b[1]-up); x.lineTo(mx, my+5*s-up); x.closePath(); x.stroke(); }
      else if(f.kind==="spark"){ x.strokeStyle="#ffff6a"; x.shadowColor="#ffff6a"; for(let k=0;k<4;k++){ const an=f.t*9+k*Math.PI/2; line(x, [mx, my], [mx+Math.cos(an)*7*s, my+Math.sin(an)*7*s]); } }
      else { x.strokeStyle="#6aff6a"; x.shadowColor="#6aff6a"; x.beginPath(); x.arc(mx, my, 5*s, 0, 7); x.stroke(); line(x, [mx-6*s, my-6*s], [mx+6*s, my+6*s]); line(x, [mx-6*s, my+6*s], [mx+6*s, my-6*s]); } }
    x.strokeStyle="#ff8aff"; x.shadowColor="#ff8aff"; for(const q of G.spits){ const [mx, my]=laneMid(G, q.l, q.z); x.strokeRect(mx-2, my-2, 4, 4); }
    x.strokeStyle="#ffffff"; x.shadowColor="#ffffff"; for(const s of G.shots){ const [mx, my]=laneMid(G, s.l, s.z), [nx, ny]=laneMid(G, s.l, s.z+0.04); line(x, [mx, my], [nx, ny]); }
    // the Bucket on the rim (at the dive's depth as you go down)
    if(G.p.dead<=0){ const z=G.diving ? Math.min(1, G.dive) : 0, a=P(G, G.p.l, z), b=P(G, G.p.l+1, z), [mx, my]=laneMid(G, G.p.l, z), dxl=b[0]-a[0], dyl=b[1]-a[1], L=Math.hypot(dxl, dyl)||1;
      const nx=-dyl/L, ny=dxl/L, o=((CX-mx)*nx+(CY-my)*ny)>0 ? -1 : 1;
      x.strokeStyle="#ffff4a"; x.shadowColor="#ffff4a"; x.lineWidth=1.8/zoom; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(mx+nx*o*10, my+ny*o*10); x.lineTo(b[0], b[1]); x.lineTo(mx+nx*o*4, my+ny*o*4); x.closePath(); x.stroke(); }
    x.shadowBlur=0;
    for(const b of G.boom){ x.globalAlpha=clamp(b.t*2, 0, 1); x.fillStyle=b.c; x.fillRect(b.x, b.y, 2, 2); } x.globalAlpha=1;
    x.restore();
    if(G.flash>0){ x.fillStyle="rgba(255,255,255,"+(G.flash*2).toFixed(2)+")"; x.fillRect(0, 0, W, H); }
    x.fillStyle="#000"; x.fillRect(0, 0, W, TOP); x.textBaseline="middle"; _cbFont(x, 11);
    x.textAlign="left"; x.fillStyle="#ffff8a"; x.fillText(String(G.score).padStart(6, "0"), 6, 12);
    x.textAlign="center"; x.fillStyle=S.col; x.fillText("LEVEL "+G.level+(G.zap ? "  · ZAP" : ""), W/2, 12);
    x.textAlign="right"; x.fillStyle="#ffff8a"; x.fillText("◆".repeat(Math.max(0, G.lives)), W-6, 12); }
  let D=null;
  function demo(){ if(!D){ D=newGame(); } return D; }
  return {
    name:"DEEP WELL", col:"#3a8aff", help:"LEFT RIGHT · ROUND THE RIM   SPACE · FIRE   B · ZAPPER   N · NEW GAME   ESC · STEP AWAY",
    newGame:newGame,
    key(G, e){ if(e.repeat) return; if(e.code==="Space" || e.code==="KeyJ" || e.code==="KeyZ") G.fire=true; if(e.code==="KeyB" || e.code==="KeyX") G.zapK=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), 0]; },
    step(G, dt, K, i){ if(G.over) return; if(K.Space && ((G.t*10)|0)!==G._f){ G._f=(G.t*10)|0; G.fire=true; }
      G.acc+=Math.min(dt, 0.1); while(G.acc>=DT){ G.acc-=DT; frame(G, K, i, DT); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("deepwell", G.score, "LEVEL "+G.level); } },
    draw(x, G, t){ scene(x, G, t);
      if(G.over) _cbMid(x, "GAME OVER", "LEVEL "+G.level+" · SPACE TO PLAY AGAIN");
      else if(G.msgT>0) _cbMid(x, G.S.name, "LEVEL "+G.level);
      else if(G.diving && G.dive<0.3) _cbMid(x, "DOWN THE WELL", "MIND THE VINES");
      _cbTube(x); },
    attract(x, t, i){ const G=demo(); G.acc=(G.acc||0)+1/12; let n=0; while(G.acc>=DT && n++<12){ G.acc-=DT; frame(G, {}, -1, DT); }
      if(G.over) D=null;
      scene(x, G, t);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(40, 102, W-80, 60);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 30); x.fillStyle="#3a8aff"; x.fillText("DEEP WELL", W/2, 132); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 70, W-80, 110); _cbTopDraw(x, "deepwell", 86, "#3a8aff"); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();
_CBG[19]=_DW;
{ const L=_cbTop("deepwell"); if(L.length) CABS.hi[19]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[19]; if(R){ _DW.attract(R.x, 0, 19); R.tex.needsUpdate=true; } }
