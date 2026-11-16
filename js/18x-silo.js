"use strict";
/* REST AREA · 18x-silo.js
   the arcade's twelfth cabinet (12c): Silo Scramble
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18x · SILO SCRAMBLE
   Played the way 18g's are, registered into 18g's _CBG as cabinet 16.

   A climbing game of the kind where something at the top sends things
   rolling down at you and you go up the ladders through them. Here it is
   the Weir farm at night. Bandit, a raccoon the size of a calf, has the
   blue-ribbon pie from the county fair and is up in the haymow with it,
   and June, the hired hand, is going up after him: tan coveralls, green
   cap, a ponytail. He rolls round bales down the beams, and now and then
   lobs a pumpkin that comes straight down through the floors.

   The haymow's beams slope, each open at its low end, so a bale runs down
   one, drops to the next and comes back the other way; some take a ladder
   down instead. The silo's catwalks are level, each with a gap you must
   jump and a bale will drop through. Up to the shelf with the pie on it
   ends a floor; the two take turns, quicker each time. A pitchfork, where
   one hangs, breaks bales for a few seconds, and you can neither jump nor
   climb while you carry it. A hundred for a bale jumped, three hundred for
   one forked, and what is left of the clock at the top.

   A floor is its `segs` (x0, x1, the height at each end, the way a bale
   rolls on it, a wall at an end or not), its `lads` (x, the seg above, the
   seg below, broken or not), its forks, and where Bandit and the pie are.
   ---------------------------------------------------------------------- */
const _SS=(function(){
  const W=336, H=280, BR=6, WALK=48, CLIMB=36, GRAV=520, JUMP=129;
  const yOf=(s, x)=>s.y0+(s.y1-s.y0)*clamp((x-s.x0)/(s.x1-s.x0), 0, 1);
  function layout(kind){
    const L={kind:kind, segs:[], lads:[], forks:[], top:70, gap:38};
    const lad=(x, up, lo, broken)=>L.lads.push({x:x, up:up, lo:lo, broken:!!broken});
    if(kind===0){                                                        // the haymow: six sloped beams, the shelf over the top one
      for(let f=0;f<6;f++){ const yb=L.top+f*L.gap, even=f%2===0;
        L.segs.push(f===5 ? {x0:8, x1:328, y0:yb+4, y1:yb-4, dir:-1} : even ? {x0:8, x1:300, y0:yb-5, y1:yb+5, dir:1} : {x0:36, x1:328, y0:yb+5, y1:yb-5, dir:-1}); }
      L.segs.push({x0:232, x1:296, y0:L.top-29, y1:L.top-29, dir:0, shelf:true});
      lad(266, 4, 5); lad(120, 4, 5, 1); lad(70, 3, 4); lad(190, 3, 4); lad(252, 2, 3); lad(140, 2, 3, 1); lad(60, 1, 2); lad(204, 1, 2); lad(274, 0, 1); lad(126, 0, 1); lad(262, 6, 0);
      L.forks=[{x:300, seg:3}, {x:40, seg:2}]; L.bandit={x:34, seg:0}; L.pie={x:280, seg:6}; L.start={x:40, seg:5}; }
    else {                                                               // the silo: level catwalks, a gap in each, walls at the ends
      const gaps=[204, 92, 240, 120, 222, 0];
      for(let f=0;f<6;f++){ const y=L.top+f*L.gap, g=gaps[f], d=f%2===0 ? 1 : -1;
        if(g){ L.segs.push({x0:8, x1:g, y0:y, y1:y, dir:d, wl:true, f:f}); L.segs.push({x0:g+14, x1:328, y0:y, y1:y, dir:d, wr:true, f:f}); }
        else L.segs.push({x0:8, x1:328, y0:y, y1:y, dir:d, wr:true, f:f}); }
      const at=(f, x)=>L.segs.findIndex(s=>s.f===f && x>=s.x0 && x<=s.x1);
      L.segs.push({x0:262, x1:324, y0:L.top-29, y1:L.top-29, dir:0, shelf:true});
      const sh=L.segs.length-1;
      for(const [x, f, b] of [[304,4],[58,4,1],[40,3],[180,3],[304,2],[196,2,1],[30,1],[168,1],[312,0],[140,0]]) lad(x, at(f, x), at(f+1, x), b);
      lad(292, sh, at(0, 292));
      L.forks=[{x:150, seg:at(3, 150)}, {x:280, seg:at(1, 280)}]; L.bandit={x:34, seg:at(0, 34)}; L.pie={x:308, seg:sh}; L.start={x:150, seg:at(5, 150)}; }
    return L; }
  const LAY=[layout(0), layout(1)];
  // the seg under a point coming down from yp to y, or -1
  function under(L, x, yp, y, pad){ let best=-1, by=1e9; L.segs.forEach((s, k)=>{ if(x<s.x0-(pad||0) || x>s.x1+(pad||0)) return; const sy=yOf(s, x); if(sy>=yp-0.5 && sy<=y+0.5 && sy<by){ by=sy; best=k; } }); return best; }
  function startStage(G, fresh){
    const L=G.L=LAY[(G.level-1)%2]; G.bales=[]; G.pumps=[]; G.pops=[]; G.bits=[];
    G.forks=L.forks.map(f=>({x:f.x, seg:f.seg, got:false}));
    const s=L.segs[L.start.seg]; G.p={x:L.start.x, y:yOf(s, L.start.x), seg:L.start.seg, mode:"walk", dir:1, vx:0, vy:0, lad:-1, walk:0, fork:0, y0:0, dead:0, jumped:[]};
    G.throwT=1.4; G.lift=0; if(fresh){ G.bonus=5000; G.bonusT=0; } G.msgT=fresh ? 2.0 : 1.0; G.clearT=0;
    G.sp=Math.min(98, 56+G.level*6); G.every=Math.max(1.25, 2.8-G.level*0.2); G.ladP=Math.min(0.6, 0.18+G.level*0.06); }
  function die(G, i){ const p=G.p; if(p.mode==="dead") return; p.mode="dead"; p.dead=0; _cbSnd(i, "die"); }
  function frame(G, K, i, dt){
    const L=G.L, p=G.p; G.t+=dt; if(G.msgT>0) G.msgT-=dt;
    for(const o of G.pops) o.t+=dt; G.pops=G.pops.filter(o=>o.t<1); for(const b of G.bits){ b.t+=dt; b.x+=b.vx*dt; b.y+=b.vy*dt; b.vy+=300*dt; } G.bits=G.bits.filter(b=>b.t<0.6);
    if(G.clearT>0){ G.clearT+=dt; if(G.clearT>2.8){ G.level++; startStage(G, true); } return; }
    if(p.mode==="dead"){ p.dead+=dt; if(p.dead>1.8){ G.lives--; if(G.lives<0){ G.lives=0; G.over=true; } else startStage(G, false); } return; }
    // the clock
    G.bonusT+=dt; if(G.bonusT>=1.8){ G.bonusT=0; G.bonus=Math.max(0, G.bonus-100); if(G.bonus<=0){ die(G, i); return; } }
    /* June */
    const mv=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), ud=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
    if(p.fork>0) p.fork-=dt;
    if(p.mode==="walk"){ const s=L.segs[p.seg];
      if(mv){ p.dir=mv; p.x+=mv*WALK*dt; p.walk+=dt*9; }
      p.x=clamp(p.x, 6, W-6);
      if(p.x<s.x0-1 || p.x>s.x1+1){ const k=under(L, p.x, p.y-3, p.y+3, 0); if(k>=0) p.seg=k; else { p.mode="fall"; p.vx=0; p.vy=0; p.y0=p.y; } }
      if(p.mode==="walk"){ p.y=yOf(L.segs[p.seg], p.x);
        if(ud && !(p.fork>0)){ for(let k=0;k<L.lads.length;k++){ const l=L.lads[k]; if(l.broken || Math.abs(p.x-l.x)>5) continue;
            if((ud<0 && l.lo===p.seg) || (ud>0 && l.up===p.seg)){ p.mode="climb"; p.lad=k; p.x=l.x; break; } } }
        if(G.jump && !(p.fork>0) && p.mode==="walk"){ p.mode="jump"; p.vx=mv*WALK; p.vy=-JUMP; p.y0=p.y; p.jumped=[]; _cbSnd(i, "hop"); } } }
    else if(p.mode==="climb"){ const l=L.lads[p.lad], yt=yOf(L.segs[l.up], l.x), yb=yOf(L.segs[l.lo], l.x);
      p.y+=ud*CLIMB*dt; if(ud) p.walk+=dt*8;
      if(p.y<=yt){ p.y=yt; p.mode="walk"; p.seg=l.up; } else if(p.y>=yb){ p.y=yb; p.mode="walk"; p.seg=l.lo; } }
    else if(p.mode==="jump" || p.mode==="fall"){ const yp=p.y; p.vy+=GRAV*dt; p.y+=p.vy*dt; p.x=clamp(p.x+p.vx*dt, 6, W-6);
      if(p.vy>0){ const k=under(L, p.x, yp, p.y, 0); if(k>=0){ p.y=yOf(L.segs[k], p.x); p.seg=k;
          if(p.y-p.y0>15){ die(G, i); return; } p.mode="walk";
          if(p.jumped.length){ G.score+=100*p.jumped.length; G.pops.push({x:p.x, y:p.y-22, txt:String(100*p.jumped.length), t:0}); _cbSnd(i, "coin"); p.jumped=[]; } } }
      if(p.y>H+20){ die(G, i); return; } }
    G.jump=false;
    // a pitchfork picked up; the pie reached
    for(const f of G.forks) if(!f.got && p.mode!=="climb" && Math.abs(p.x-f.x)<8 && Math.abs(p.y-yOf(L.segs[f.seg], f.x))<22){ f.got=true; p.fork=9; _cbSnd(i, "jingle"); }
    if(p.mode==="walk" && L.segs[p.seg].shelf){ G.clearT=0.001; G.score+=G.bonus; G.pops.push({x:p.x, y:p.y-26, txt:"+"+G.bonus, t:-1.2}); _cbSnd(i, "jingle"); return; }
    /* Bandit: lifts one, lets it go */
    G.throwT-=dt; if(G.throwT<0.45) G.lift=1-G.throwT/0.45; else G.lift=0;
    if(G.throwT<=0){ G.throwT=G.every*(0.8+Math.random()*0.4); const b=L.bandit, s=L.segs[b.seg];
      if(Math.random()<(L.kind ? 0.34 : G.level>2 ? 0.2 : 0)) G.pumps.push({x:b.x+10, y:yOf(s, b.x)-26, vx:clamp((p.x-b.x)/2.6, -70, 70), vy:-60, rot:0, hop:b.seg});
      else G.bales.push({x:b.x+18, y:yOf(s, b.x+18)-BR, seg:b.seg, dir:1, mode:"roll", vy:0, rot:0, lad:-1});
      _cbSnd(i, "thump"); }
    /* the bales */
    for(const b of G.bales){
      if(b.mode==="roll"){ const s=L.segs[b.seg], x0=b.x; b.x+=b.dir*G.sp*dt; b.rot+=b.dir*G.sp*dt/BR; b.y=yOf(s, b.x)-BR;
        if(b.x>s.x1+1){ if(s.wr){ b.x=s.x1; b.dir=-1; } else { b.mode="fall"; b.vy=0; } }
        else if(b.x<s.x0-1){ if(s.wl){ b.x=s.x0; b.dir=1; } else { b.mode="fall"; b.vy=0; } }
        else for(let k=0;k<L.lads.length;k++){ const l=L.lads[k]; if(l.up!==b.seg || l.broken || L.segs[l.up].shelf) continue;
          if((x0-l.x)*(b.x-l.x)<=0 && x0!==b.x && Math.random()<G.ladP*(p.y>b.y+20 ? 1 : 0.4)){ b.mode="ladder"; b.lad=k; b.x=l.x; break; } } }
      else if(b.mode==="fall"){ const yp=b.y+BR; b.vy+=GRAV*dt; b.y+=b.vy*dt; b.x+=b.dir*14*dt; b.rot+=b.dir*dt*5;
        const k=under(L, b.x, yp+1, b.y+BR, 0); if(k>=0 && k!==b.seg){ b.seg=k; b.mode="roll"; b.dir=L.segs[k].dir||b.dir; b.y=yOf(L.segs[k], b.x)-BR; if(Math.abs(b.x-p.x)<90) _cbSnd(i, "tick"); }
        if(b.y>H+20) b.gone=true; }
      else { const l=L.lads[b.lad], yb=yOf(L.segs[l.lo], l.x)-BR; b.y+=G.sp*0.8*dt; b.rot+=dt*4; if(b.y>=yb){ b.y=yb; b.seg=l.lo; b.mode="roll"; b.dir=L.segs[l.lo].dir||1; } }
      if(b.x<-10 || b.x>W+10) b.gone=true;
      // June and it: forked, jumped, or hit
      const dx=b.x-p.x, base=b.y+BR;
      if(p.fork>0 && p.mode==="walk" && dx*p.dir>-4 && Math.abs(dx)<17 && Math.abs(base-p.y)<14){ b.gone=true; G.score+=300; G.pops.push({x:b.x, y:b.y-10, txt:"300", t:0}); _cbSnd(i, "pop");
        for(let q=0;q<8;q++) G.bits.push({x:b.x, y:b.y, vx:(Math.random()-0.5)*120, vy:-40-Math.random()*90, t:0}); continue; }
      if(Math.abs(dx)<6.5 && p.y>base-8 && p.y-20<base){ die(G, i); return; }
      if(p.mode==="jump" && Math.abs(dx)<7 && p.y<=base-8 && p.y>base-30 && b.mode==="roll" && p.jumped.indexOf(b)<0) p.jumped.push(b);
    }
    G.bales=G.bales.filter(b=>!b.gone);
    /* the pumpkins: down through every floor, a hop on each */
    for(const q of G.pumps){ const yp=q.y+5; q.vy+=GRAV*0.8*dt; q.y+=q.vy*dt; q.x+=q.vx*dt; q.rot+=dt*6;
      if(q.x<12 || q.x>W-12) q.vx=-q.vx;
      if(q.vy>0){ const k=under(L, q.x, yp, q.y+5, 0); if(k>=0 && k!==q.hop && !L.segs[k].shelf){ q.hop=k; q.vy=-95; if(Math.abs(q.x-p.x)<110) _cbSnd(i, "tick"); } }
      if(q.y>H+12) q.gone=true;
      if(Math.abs(q.x-p.x)<8 && q.y+5>p.y-20 && q.y-5<p.y){ die(G, i); return; } }
    G.pumps=G.pumps.filter(q=>!q.gone);
  }
  /* ---- the picture ---- */
  const BG=[null, null];
  function backdrop(kind){ if(BG[kind]) return BG[kind];
    const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d"), L=LAY[kind];
    if(kind===0){                                                        // the barn's end wall from inside: boards, a loft door on the night, hay
      x.fillStyle="#2a1810"; x.fillRect(0, 0, W, H);
      for(let bx=0;bx<W;bx+=14){ x.fillStyle=["#33201a","#2e1c14","#3a2418"][(bx/14|0)%3]; x.fillRect(bx, 24, 13, H); }
      x.fillStyle="#0c1428"; x.fillRect(132, 30, 72, 30); x.fillStyle="#e8e4c8"; x.beginPath(); x.arc(186, 40, 5, 0, 7); x.fill();
      x.fillStyle="#f4f0d8"; for(const [sx, sy] of [[140,36],[152,50],[166,34],[174,52]]) x.fillRect(sx, sy, 1, 1);
      x.strokeStyle="#4a3020"; x.lineWidth=3; x.strokeRect(132, 30, 72, 30);
      x.fillStyle="#6a5420"; for(const [hx, hw] of [[250,70],[20,50]]){ x.beginPath(); x.ellipse(hx+hw/2, H-6, hw/2, 12, 0, Math.PI, 0); x.fill(); } }
    else {                                                               // the silo from inside: staves and hoops, the hatch at the top
      x.fillStyle="#141a20"; x.fillRect(0, 0, W, H);
      for(let bx=0;bx<W;bx+=12){ const k=Math.abs(bx-W/2)/(W/2); x.fillStyle="rgb("+Math.round(44-20*k)+","+Math.round(52-22*k)+","+Math.round(60-24*k)+")"; x.fillRect(bx, 24, 11, H); }
      x.strokeStyle="rgba(150,160,170,0.35)"; x.lineWidth=2; for(let y=52;y<H;y+=38){ x.beginPath(); x.moveTo(0, y); x.quadraticCurveTo(W/2, y+10, W, y); x.stroke(); }
      x.fillStyle="#0c1428"; x.fillRect(150, 28, 36, 22); x.fillStyle="#e8e4c8"; x.beginPath(); x.arc(176, 36, 4, 0, 7); x.fill(); x.strokeStyle="#5a646e"; x.strokeRect(150, 28, 36, 22); }
    // the beams, with a brace under each run; then the ladders
    for(const s of L.segs){ const n=Math.max(1, Math.round((s.x1-s.x0)/24));
      x.strokeStyle=kind ? "rgba(120,130,140,0.5)" : "rgba(90,60,34,0.7)"; x.lineWidth=1;
      if(!s.shelf) for(let k=0;k<n;k++){ const a=s.x0+(s.x1-s.x0)*k/n, b=s.x0+(s.x1-s.x0)*(k+1)/n; x.beginPath(); x.moveTo(a, yOf(s, a)+2); x.lineTo((a+b)/2, yOf(s, (a+b)/2)+9); x.lineTo(b, yOf(s, b)+2); x.stroke(); }
      x.lineWidth=5; x.strokeStyle=kind ? "#7a8690" : "#8a5a30"; x.beginPath(); x.moveTo(s.x0, s.y0+2.5); x.lineTo(s.x1, s.y1+2.5); x.stroke();
      x.lineWidth=1; x.strokeStyle=kind ? "#b4c0c8" : "#c08a50"; x.beginPath(); x.moveTo(s.x0, s.y0+0.5); x.lineTo(s.x1, s.y1+0.5); x.stroke();
      if(s.wl){ x.fillStyle="#5a646e"; x.fillRect(4, s.y0-10, 4, 14); } if(s.wr){ x.fillStyle="#5a646e"; x.fillRect(W-8, s.y0-10, 4, 14); } }
    for(const l of L.lads){ const yt=yOf(L.segs[l.up], l.x), yb=yOf(L.segs[l.lo], l.x); x.strokeStyle="#d8c090"; x.lineWidth=1.5;
      const seg=(a, b)=>{ x.beginPath(); x.moveTo(l.x-4, a); x.lineTo(l.x-4, b); x.moveTo(l.x+4, a); x.lineTo(l.x+4, b); x.stroke(); for(let y=a+3;y<b-1;y+=5){ x.beginPath(); x.moveTo(l.x-4, y); x.lineTo(l.x+4, y); x.stroke(); } };
      if(l.broken){ seg(yt, yt+10); seg(yb-12, yb); } else seg(yt, yb); }
    return BG[kind]=c; }
  function june(x, px, py, p, t){
    const d=p.dir, st=p.mode==="walk" ? Math.sin(p.walk) : 0, cl=p.mode==="climb";
    if(p.mode==="dead"){ const k=Math.min(1, p.dead/0.5); x.save(); x.translate(px, py-8); x.rotate(k*Math.PI/2*d); px=0; py=8; }
    x.fillStyle="#3a2a1e"; x.fillRect(px-4+st*2, py-3, 3, 3); x.fillRect(px+1-st*2, py-3, 3, 3);                 // boots
    x.fillStyle="#c8a868"; x.fillRect(px-4+st*1.5, py-8, 3, 5); x.fillRect(px+1-st*1.5, py-8, 3, 5); x.fillRect(px-4, py-15, 8, 8);   // coveralls
    x.fillStyle="#a88848"; x.fillRect(px-1, py-15, 1, 7);
    const ar=cl ? Math.sin(p.walk)*3 : 0;
    x.fillStyle="#c8a868"; if(cl){ x.fillRect(px-6, py-17+ar, 2, 5); x.fillRect(px+4, py-17-ar, 2, 5); } else if(p.mode==="jump"){ x.fillRect(px-6, py-18, 2, 5); x.fillRect(px+4, py-18, 2, 5); } else { x.fillRect(px-6, py-14+st, 2, 5); x.fillRect(px+4, py-14-st, 2, 5); }
    x.fillStyle="#e8b890"; x.fillRect(px-3, py-20, 6, 5);                                                         // her face
    x.fillStyle="#2f6a34"; x.fillRect(px-4, py-22, 8, 3); x.fillRect(cl ? px-4 : px+(d>0 ? 2 : -6), py-20, 4, 1); // the cap and its bill
    x.fillStyle="#7a4a22"; x.fillRect(cl ? px-1 : px-d*5, py-19, 2, 5);                                           // the ponytail
    if(!cl){ x.fillStyle="#1a1210"; x.fillRect(px+d*1, py-18, 1, 1); }
    if(p.fork>0 && (p.fork>2 || ((t*8)|0)%2)){ const jab=Math.sin(t*14)*2; x.strokeStyle="#c8a060"; x.lineWidth=1.5; x.beginPath(); x.moveTo(px+d*3, py-9); x.lineTo(px+d*(13+jab), py-11); x.stroke();
      x.strokeStyle="#d8dce0"; x.lineWidth=1; for(const o of [-3, 0, 3]){ x.beginPath(); x.moveTo(px+d*(13+jab), py-11+o); x.lineTo(px+d*(18+jab), py-11+o); x.stroke(); } x.beginPath(); x.moveTo(px+d*(13+jab), py-14); x.lineTo(px+d*(13+jab), py-8); x.stroke(); }
    if(p.mode==="dead") x.restore();
  }
  function bandit(x, px, py, lift, t, flee){
    const b=Math.sin(t*3)*1;
    // the tail, ringed
    for(let k=0;k<5;k++){ x.fillStyle=k%2 ? "#2a2a2e" : "#8a8a90"; x.beginPath(); x.arc(px-14-k*3.2, py-8-k*2.4+Math.sin(t*4+k)*1.2, 4.2-k*0.3, 0, 7); x.fill(); }
    x.fillStyle="#7a7a82"; x.beginPath(); x.ellipse(px, py-11+b*0.3, 11, 11, 0, 0, 7); x.fill();                 // the body
    x.fillStyle="#b0b0b6"; x.beginPath(); x.ellipse(px+1, py-8, 6, 7, 0, 0, 7); x.fill();
    x.fillStyle="#2a2a2e"; x.fillRect(px-8, py-3, 6, 3); x.fillRect(px+3, py-3, 6, 3);                           // feet
    const hy=py-25+b;
    x.fillStyle="#8a8a90"; x.beginPath(); x.ellipse(px+2, hy, 9, 7, 0, 0, 7); x.fill();                          // the head
    x.beginPath(); x.moveTo(px-5, hy-5); x.lineTo(px-4, hy-11); x.lineTo(px, hy-6); x.moveTo(px+5, hy-6); x.lineTo(px+9, hy-11); x.lineTo(px+10, hy-4); x.fill();
    x.fillStyle="#1a1a1e"; x.beginPath(); x.ellipse(px+3, hy-1, 8, 2.8, 0, 0, 7); x.fill();                      // the mask
    x.fillStyle="#f4f0e2"; x.fillRect(px-1, hy-2, 2, 2); x.fillRect(px+6, hy-2, 2, 2); x.fillStyle="#d8d8dc"; x.beginPath(); x.ellipse(px+5, hy+3, 4, 2.5, 0, 0, 7); x.fill();
    x.fillStyle="#1a1a1e"; x.fillRect(px+7, hy+2, 2, 2);
    // his arms: down, or up with a bale over his head
    x.strokeStyle="#6a6a72"; x.lineWidth=3; x.beginPath();
    if(lift>0){ x.moveTo(px-7, py-16); x.lineTo(px-6, py-30-lift*6); x.moveTo(px+8, py-16); x.lineTo(px+9, py-30-lift*6); x.stroke(); bale(x, px+2, py-38-lift*6, 0); }
    else { x.moveTo(px-8, py-15); x.lineTo(px-11, py-8); x.moveTo(px+9, py-15); x.lineTo(px+13, py-9); x.stroke(); }
  }
  function bale(x, px, py, rot){
    x.fillStyle="#c8a030"; x.beginPath(); x.arc(px, py, BR, 0, 7); x.fill();
    x.strokeStyle="#8a6a18"; x.lineWidth=1; x.beginPath(); for(let a=0;a<9;a+=0.5){ const r=a*0.62; x.lineTo(px+Math.cos(a+rot)*r, py+Math.sin(a+rot)*r); } x.stroke();
    x.strokeStyle="#e8c858"; x.beginPath(); x.arc(px, py, BR-0.5, rot, rot+1.2); x.stroke();
  }
  function pumpkin(x, px, py, rot){
    x.save(); x.translate(px, py); x.rotate(rot); x.fillStyle="#e07a1a"; x.beginPath(); x.ellipse(0, 0, 6, 5, 0, 0, 7); x.fill();
    x.strokeStyle="#a8500c"; x.lineWidth=1; x.beginPath(); x.ellipse(0, 0, 2.5, 5, 0, 0, 7); x.stroke(); x.fillStyle="#3a6a22"; x.fillRect(-1, -7, 2, 3); x.restore();
  }
  function pie(x, px, py, t){
    x.fillStyle="#b0b4b8"; x.beginPath(); x.moveTo(px-9, py-4); x.lineTo(px+9, py-4); x.lineTo(px+6, py); x.lineTo(px-6, py); x.fill();
    x.fillStyle="#d8a050"; x.beginPath(); x.ellipse(px, py-5, 8, 3.5, 0, Math.PI, 0); x.fill(); x.fillStyle="#8a2a3a"; x.fillRect(px-3, py-7, 1, 1); x.fillRect(px+2, py-6, 1, 1);
    x.fillStyle="#2a5ac8"; x.beginPath(); x.arc(px+12, py-8, 3, 0, 7); x.fill(); x.fillRect(px+10, py-6, 2, 6); x.fillRect(px+13, py-6, 2, 6);
    x.strokeStyle="rgba(255,255,255,0.5)"; x.lineWidth=1; for(const o of [-3, 2]){ x.beginPath(); x.moveTo(px+o, py-10); x.quadraticCurveTo(px+o+2*Math.sin(t*3+o), py-14, px+o, py-18); x.stroke(); }
  }
  function scene(x, G, t){
    const L=G.L, p=G.p; x.drawImage(backdrop(L.kind), 0, 0);
    pie(x, L.pie.x, yOf(L.segs[L.pie.seg], L.pie.x), t);
    for(const f of G.forks) if(!f.got){ const fy=yOf(L.segs[f.seg], f.x); x.strokeStyle="#c8a060"; x.lineWidth=1.5; x.beginPath(); x.moveTo(f.x, fy-2); x.lineTo(f.x, fy-15); x.stroke();
      x.strokeStyle="#d8dce0"; x.lineWidth=1; x.beginPath(); for(const o of [-3, 0, 3]){ x.moveTo(f.x+o, fy-15); x.lineTo(f.x+o, fy-21); } x.moveTo(f.x-3, fy-15); x.lineTo(f.x+3, fy-15); x.stroke(); }
    const b=L.bandit, bx=G.clearT>0 ? b.x-G.clearT*40 : b.x; bandit(x, bx, yOf(L.segs[b.seg], b.x), G.clearT>0 ? 0 : G.lift, t);
    for(const q of G.bales) bale(x, q.x, q.y, q.rot);
    for(const q of G.pumps) pumpkin(x, q.x, q.y, q.rot);
    x.fillStyle="#e8c858"; for(const q of G.bits) x.fillRect(q.x, q.y, 2, 1);
    if(p.mode!=="none") june(x, Math.round(p.x), Math.round(p.y), p, t);
    x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 9); x.fillStyle="#fff6d0"; for(const o of G.pops) x.fillText(o.txt, clamp(o.x, 20, W-20), o.y-Math.max(0, o.t)*14);
    // the top band
    x.fillStyle="#000"; x.fillRect(0, 0, W, 24); x.textBaseline="middle"; _cbFont(x, 10);
    x.textAlign="left"; x.fillStyle="#e8c858"; x.fillText("SCORE "+String(G.score).padStart(5, "0"), 12, 14);
    x.textAlign="center"; x.fillStyle=G.bonus<=1000 && ((t*4)|0)%2 ? "#ff5a3a" : "#7ad8ff"; x.fillText("BONUS "+G.bonus, W/2, 14);
    x.textAlign="right"; x.fillStyle="#c8a868"; x.fillText("L"+G.level+"  "+"♥".repeat(Math.max(0, G.lives)), W-12, 14);
  }
  let D=null;
  function demo(){ if(!D){ D={level:1, lives:3, score:0, t:0, over:false}; startStage(D, true); D.p.mode="none"; D.p.y=-100; D.p.x=-100; } return D; }
  return {
    name:"SILO SCRAMBLE", col:"#e8c858", help:"ARROWS · WALK, CLIMB   SPACE · JUMP   N · NEW GAME   ESC · STEP AWAY",
    newGame(){ const G={level:1, lives:3, score:0, t:0, acc:0, over:false, saved:false, jump:false}; startStage(G, true); return G; },
    key(G, e){ if(!e.repeat && (e.code==="Space" || e.code==="KeyJ" || e.code==="KeyZ")) G.jump=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=Math.min(dt, 0.1); while(G.acc>=1/120){ G.acc-=1/120; frame(G, K, i, 1/120); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("siloscramble", G.score, "FLOOR "+G.level); } },
    draw(x, G, t){ scene(x, G, t);
      if(G.over) _cbMid(x, "GAME OVER", "FLOOR "+G.level+" · SPACE TO PLAY AGAIN");
      else if(G.clearT>0) _cbMid(x, "THE PIE!", "BANDIT IS OFF WITH IT AGAIN");
      else if(G.msgT>0 && G.p.mode!=="dead") _cbMid(x, G.L.kind ? "THE SILO" : "THE HAYMOW", "FLOOR "+G.level+" · GET UP TO THE PIE");
      _cbTube(x); },
    attract(x, t, i){ const G=demo(); G.acc=(G.acc||0)+1/12; let n=0; while(G.acc>=1/120 && n++<12){ G.acc-=1/120; G.bonusT=0; frame(G, {}, -1, 1/120); }
      scene(x, G, t); x.fillStyle="#000"; x.fillRect(0, 0, W, 24);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(36, 96, W-72, 66);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28); x.fillStyle="#e8c858"; x.fillText("SILO", W/2, 116); x.fillStyle="#7ad8ff"; x.fillText("SCRAMBLE", W/2, 144); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 70, W-80, 110); _cbTopDraw(x, "siloscramble", 86, "#e8c858"); }
      _cbFoot(x, i, t); _cbTube(x); },
    _debug:{LAY:LAY, frame:frame, yOf:yOf, startStage:startStage}
  };
})();

/* ---- into 18g's cabinets: cabinet 16 ---- */
_CBG[16]=_SS;
{ const L=_cbTop("siloscramble"); if(L.length) CABS.hi[16]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[16]; if(R){ _SS.attract(R.x, 0, 16); R.tex.needsUpdate=true; } }
