"use strict";
/* REST AREA · 18w-marble.js
   the arcade's eleventh cabinet (12c): Slippery Rock
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18w · SLIPPERY ROCK
   Played the way 18g's are, registered into 18g's _CBG as cabinet 15.

   A game of the kind where you roll a ball down a course seen from above
   and to one side, against the clock. Here the ball is a glass marble (a
   blue cat's-eye) and the courses are cut stone in western Pennsylvania:
   a limestone quarry, a coal breaker's chutes, an ice house, and a gorge
   at dusk. The stick pushes the marble; the stone does the rest. Slopes
   run it away from you, ice gives you almost nothing to push against, a
   tilted ledge slides it toward the drop, snapping turtles walk their
   beats and knock it aside. Off the edge, or down too far onto stone, and
   it is gone, and a new one is put down at the last corner you turned,
   with the clock still running. Time left at the bottom is carried to
   the next course.

   A course is not drawn by hand. It is a run of stretches, each
   [way, cells, width, drop, {…}], laid end to end by `build`: `way` is
   "x" or "y" (both run down the screen, one to the right and one to the
   left), `drop` is how far it falls along its middle (its first and last
   three cells are level, so corners are), and the last item may carry
   `ice`, `rail` (a kerb either side), `tilt` (a cross fall), `gap:[at, n]`
   (n cells missing, the far side lower), `turtles`. Every cell keeps the
   height of each of its corners, the ground under the marble is the
   bilinear patch between them, and the slope of that is what pushes it.
   ---------------------------------------------------------------------- */
const _SR=(function(){
  const W=336, H=280, HX=14, HY=7, ZH=7, R=0.30;
  const PAL={
    quarry:{sky:["#1c2430","#3a4450"], a:"#c0b8a6", b:"#b0a896", l:"#6a6356", r:"#8c8474", rail:"#d8d0bc", line:"rgba(60,54,44,0.35)"},
    coal:  {sky:["#0c0c12","#2a2420"], a:"#6a6e78", b:"#5e626c", l:"#2c2e36", r:"#42454e", rail:"#c8782a", line:"rgba(10,10,14,0.4)"},
    ice:   {sky:["#0e1c2c","#2c4a5e"], a:"#a8b8c0", b:"#98a8b2", l:"#4e6070", r:"#6c8090", rail:"#e8f0f4", line:"rgba(30,50,70,0.3)"},
    gorge: {sky:["#2a1826","#5e3a2e"], a:"#8a9a6a", b:"#7c8c5e", l:"#4a4032", r:"#66583e", rail:"#c8b890", line:"rgba(30,34,20,0.35)"}};
  const COURSES=[
    {n:"THE QUARRY", pal:"quarry", time:34, segs:[["x",9,4,0,{rail:1}], ["y",10,3,2,{rail:1}], ["x",10,3,2], ["y",9,2,1], ["x",10,3,2,{ice:1}], ["y",7,3,0]]},
    {n:"THE BREAKER", pal:"coal", time:38, segs:[["x",8,3,0], ["y",13,2,5,{rail:1}], ["x",10,3,1,{turtles:1}], ["y",9,1,0], ["x",11,3,2,{gap:[6,1]}], ["y",9,3,1,{tilt:0.10}], ["x",7,3,0]]},
    {n:"THE ICE HOUSE", pal:"ice", time:44, segs:[["x",8,3,0], ["y",10,3,2,{ice:1, rail:1}], ["x",10,2,1,{ice:1}], ["y",10,3,2,{tilt:-0.12}], ["x",11,3,1,{ice:1, turtles:1}], ["y",10,3,2,{gap:[6,1]}], ["x",9,1,0,{ice:1}], ["y",7,3,0]]},
    {n:"THE GORGE", pal:"gorge", time:48, segs:[["x",8,3,0], ["y",11,1,2], ["x",11,3,3,{gap:[6,2]}], ["y",10,2,1,{tilt:0.14}], ["x",10,2,2,{turtles:2}], ["y",12,1,1,{ice:1}], ["x",11,3,3,{gap:[5,1], tilt:-0.08}], ["y",10,2,2,{turtles:1}], ["x",7,3,0]]}];
  // a course from its stretches: the cells (each its four corner heights), the middle line, the corners, the turtles
  function build(n){
    const S=COURSES[n], C={n:n, name:S.n, pal:PAL[S.pal], time:S.time, cells:new Map(), list:[], path:[], cps:[], turtles:[], lo:99};
    const h0=4+S.segs.reduce((a, s)=>a+s[3]+((s[4]||{}).gap ? s[4].gap[1] : 0), 0); let cx=0, cy=0, h=h0;
    const put=(i, j, hs, type)=>{ const k=i+","+j; if(C.cells.has(k)) return; const c={i:i, j:j, h:hs, type:type}; C.cells.set(k, c); C.list.push(c); C.lo=Math.min(C.lo, hs[0], hs[1], hs[2], hs[3]); };
    // (twice over: the stone first, then the kerbs, so a kerb never stands across the next stretch's way in)
    for(const kerbs of [false, true]){ cx=0; cy=0; h=h0;
    S.segs.forEach((sg, si)=>{
      const way=sg[0], len=sg[1], w=sg[2], drop=sg[3], F=sg[4]||{}, o0=-((w-1)>>1), o1=w>>1, gap=F.gap||[99,0], last=si===S.segs.length-1;
      // the height along its middle, s cells in: level, the fall, level; and down again past a gap
      const Hs=(s)=>h-drop*clamp((s-3)/Math.max(1, len-6), 0, 1)-(s>=gap[0]+gap[1] ? gap[1] : s>gap[0] ? (s-gap[0]) : 0);
      if(!kerbs) C.cps.push({x:(way==="x" ? cx+1.5 : cx+0.5), y:(way==="x" ? cy+0.5 : cy+1.5), z:h, s:si});
      for(let k=0;k<len;k++){
        const i0=way==="x" ? cx+k : cx, j0=way==="x" ? cy : cy+k;
        if(!kerbs) C.path.push({x:i0+0.5, y:j0+0.5, z:(Hs(k)+Hs(k+1))/2, gap:k>=gap[0] && k<gap[0]+gap[1]});
        if(k>=gap[0] && k<gap[0]+gap[1]) continue;
        for(let o=o0-(F.rail?1:0); o<=o1+(F.rail?1:0); o++){
          const rail=o<o0 || o>o1; if(rail!==kerbs) continue; const i=way==="x" ? i0 : i0+o, j=way==="x" ? j0+o : j0, hs=[];
          for(const [ci, cj] of [[0,0],[1,0],[0,1],[1,1]]){ const s=way==="x" ? k+ci : k+cj, l=(way==="x" ? o+cj : o+ci)-0.5;
            hs.push(Hs(s)+(F.tilt||0)*l*clamp(Math.min(s-2, len-2-s)/2, 0, 1)+(rail ? 0.9 : 0)); }
          put(i, j, hs, rail ? "rail" : last && k>=len-3 ? "goal" : F.ice && k>=2 && k<len-2 ? "ice" : "stone"); } }
      for(let q=0;q<(kerbs ? 0 : F.turtles||0);q++){ const k=4+q*3, a=way==="x" ? {x:cx+k+0.5, y:cy+o0+0.5} : {x:cx+o0+0.5, y:cy+k+0.5}, b=way==="x" ? {x:cx+k+0.5, y:cy+o1+0.5} : {x:cx+o1+0.5, y:cy+k+0.5};
        C.turtles.push({a:a, b:b, ph:q*1.7, sp:0.9+0.25*q, x:a.x, y:a.y}); }
      if(way==="x") cx+=len-1; else cy+=len-1;
      h=Hs(len); }); }
    C.list.sort((a, b)=>(a.i+a.j)-(b.i+b.j) || a.i-b.i);
    C.base=C.lo-5;
    return C; }
  const cellAt=(C, x, y)=>C.cells.get(Math.floor(x)+","+Math.floor(y));
  // the ground at (x, y): its height, and its fall each way; or nothing there
  function ground(C, x, y, out){ const c=cellAt(C, x, y); if(!c) return null; const fx=x-c.i, fy=y-c.j, h=c.h;
    out.z=h[0]*(1-fx)*(1-fy)+h[1]*fx*(1-fy)+h[2]*(1-fx)*fy+h[3]*fx*fy; out.gx=(h[1]-h[0])*(1-fy)+(h[3]-h[2])*fy; out.gy=(h[2]-h[0])*(1-fx)+(h[3]-h[1])*fx; out.c=c; return out; }
  const _g={}, _g2={};
  function startCourse(G, n, carry){ const C=G.C=build(n); G.t=C.time+(carry||0); G.cp=0; G.msgT=2.2; G.doneT=0; spawn(G, C.cps[0]); G.cam=null; }
  function spawn(G, p){ G.m={x:p.x, y:p.y, z:p.z, vx:0, vy:0, vz:0, air:false, dead:0, how:"", roll:0, ax:1, ay:0}; G.lastZ=p.z; }
  function lose(G, how, i){ const m=G.m; if(m.dead) return; m.dead=0.001; m.how=how; G.lost++; _cbSnd(i, how==="crack" ? "die" : "whoosh"); }
  function frame(G, K, i, dt){
    const C=G.C, m=G.m;
    G.time+=dt; if(G.msgT>0) G.msgT-=dt;
    for(const u of C.turtles){ u.ph+=dt*u.sp; const k=0.5-0.5*Math.cos(u.ph); u.x=u.a.x+(u.b.x-u.a.x)*k; u.y=u.a.y+(u.b.y-u.a.y)*k; u.dir=Math.sin(u.ph)>=0 ? 1 : -1; }
    if(G.doneT>0){ G.doneT+=dt; if(G.doneT>2.6){ if(C.n+1>=COURSES.length){ G.won=true; G.over=true; } else startCourse(G, C.n+1, Math.min(15, Math.floor(G.t))); } return; }
    G.t-=dt; if(G.t<=0){ G.t=0; G.over=true; _cbSnd(i, "die"); return; }
    if(m.dead){ m.dead+=dt; if(m.how==="fall"){ m.vz-=30*dt; m.z+=m.vz*dt; m.x+=m.vx*dt; m.y+=m.vy*dt; }
      if(m.dead>1.3) spawn(G, C.cps[G.cp]); return; }
    // the stick, turned to the screen: up the screen is back up both ways
    const sx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), sy=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
    let ax=(sx+sy)*0.7071, ay=(sy-sx)*0.7071; if(sx && sy){ ax*=0.7071; ay*=0.7071; }
    const g=ground(C, m.x, m.y, _g), on=g && !m.air;
    if(on){ const ice=g.c.type==="ice", push=ice ? 2.4 : 10.5, drag=ice ? 0.10 : 1.05;
      m.vx+=(ax*push-g.gx*15)*dt; m.vy+=(ay*push-g.gy*15)*dt; const f=Math.exp(-drag*dt); m.vx*=f; m.vy*=f; }
    else { m.vx+=ax*1.2*dt; m.vy+=ay*1.2*dt; }
    const sp=Math.hypot(m.vx, m.vy); if(sp>9){ m.vx*=9/sp; m.vy*=9/sp; }
    // across the ground, one way and then the other: a face too high to roll up is a wall
    const wall=(nx, ny, px, py)=>{ const q=ground(C, px, py, _g2); return q && q.z>m.z+0.45; };
    { const nx=m.x+m.vx*dt; if(m.vx && wall(nx, m.y, nx+Math.sign(m.vx)*R, m.y)){ if(Math.abs(m.vx)>1.2) _cbSnd(i, "wall"); m.vx*=-0.5; } else m.x=nx; }
    { const ny=m.y+m.vy*dt; if(m.vy && wall(m.x, ny, m.x, ny+Math.sign(m.vy)*R)){ if(Math.abs(m.vy)>1.2) _cbSnd(i, "wall"); m.vy*=-0.5; } else m.y=ny; }
    const q=ground(C, m.x, m.y, _g);
    if(!m.air){ if(q && q.z>=m.z-0.16){ m.vz=(q.z-m.z)/dt; m.z=q.z; } else { m.air=true; m.vz=Math.min(m.vz, 0); } }
    if(m.air){ m.vz-=30*dt; m.z+=m.vz*dt;
      if(q && m.z<=q.z && m.z>q.z-0.6){ if(m.vz<-11.5){ m.z=q.z; lose(G, "crack", i); return; } m.z=q.z; m.air=false; if(m.vz<-3) _cbSnd(i, "tick"); m.vz=0; }
      else if((!q && m.z<G.lastZ-2.5) || (q && m.z<q.z-0.6)){ lose(G, "fall", i); return; } }
    else G.lastZ=m.z;
    if(sp>0.05){ m.roll+=sp*dt/R; m.ax=m.vx/sp; m.ay=m.vy/sp; }
    // the turtles: a shove, not a death
    for(const u of C.turtles){ const dx=m.x-u.x, dy=m.y-u.y, d=Math.hypot(dx, dy); if(d<R+0.36 && !m.air && d>1e-4){ m.vx=dx/d*6.5; m.vy=dy/d*6.5; _cbSnd(i, "thump"); G.shake=0.2; } }
    // the corners turned (where a new marble is put down), and the bottom
    if(!m.air && q){ for(let k=G.cp+1;k<C.cps.length;k++){ const p=C.cps[k]; if(Math.hypot(m.x-p.x, m.y-p.y)<1.6 && Math.abs(m.z-p.z)<0.6){ G.cp=k; G.score+=100; _cbSnd(i, "coin"); } }
      if(q.c.type==="goal"){ G.doneT=0.001; const bonus=Math.floor(G.t)*20+500; G.bonus=bonus; G.score+=bonus; _cbSnd(i, "jingle"); } }
    if(G.shake>0) G.shake-=dt;
  }
  /* ---- the picture ---- */
  const shade=(hex, k)=>{ const n=parseInt(hex.slice(1), 16), f=(v)=>Math.max(0, Math.min(255, Math.round(v*k))); return "rgb("+f(n>>16)+","+f((n>>8)&255)+","+f(n&255)+")"; };
  const _shade={}; const sh=(hex, k)=>{ const q=Math.round(k*20), key=hex+q; return _shade[key] || (_shade[key]=shade(hex, q/20)); };
  function view(x, C, cam, t, things){
    const P=C.pal, ox=W/2-(cam.x-cam.y)*HX, oy=150-((cam.x+cam.y)*HY-cam.z*ZH);
    const gr=x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, P.sky[0]); gr.addColorStop(1, P.sky[1]); x.fillStyle=gr; x.fillRect(0, 0, W, H);
    const X=(a, b)=>ox+(a-b)*HX, Y=(a, b, z)=>oy+(a+b)*HY-z*ZH;
    things.sort((a, b)=>a.k-b.k); let ti=0;
    x.lineWidth=1; x.lineJoin="round";
    for(const c of C.list){
      const key=c.i+c.j; while(ti<things.length && things[ti].k<key) things[ti++].draw(X, Y);
      const px=X(c.i, c.j); if(px<-30 || px>W+30) continue;
      const h=c.h, yT=Y(c.i, c.j, h[0]); if(yT>H+20) continue;
      const yB=Y(c.i+1, c.j+1, C.base); if(yB<0) continue;
      // its two faces toward you, down to the next cell's edge or to the dark
      const nl=C.cells.get(c.i+","+(c.j+1)), nr=C.cells.get((c.i+1)+","+c.j);
      const face=(a, b, za, zb, na, nb, col)=>{ if(na>=za-0.01 && nb>=zb-0.01) return;
        const x0=X(a[0], a[1]), x1=X(b[0], b[1]);
        x.fillStyle=col; x.beginPath(); x.moveTo(x0, Y(a[0], a[1], za)); x.lineTo(x1, Y(b[0], b[1], zb)); x.lineTo(x1, Y(b[0], b[1], nb)); x.lineTo(x0, Y(a[0], a[1], na)); x.closePath(); x.fill();
        if(za-na>1.2){ x.fillStyle="rgba(0,0,0,0.22)"; x.beginPath(); x.moveTo(x0, Y(a[0], a[1], za-1)); x.lineTo(x1, Y(b[0], b[1], zb-1)); x.lineTo(x1, Y(b[0], b[1], nb)); x.lineTo(x0, Y(a[0], a[1], na)); x.closePath(); x.fill(); } };
      const rail=c.type==="rail";
      face([c.i, c.j+1], [c.i+1, c.j+1], h[2], h[3], nl ? nl.h[0] : C.base, nl ? nl.h[1] : C.base, rail ? sh(P.rail, 0.6) : P.l);
      face([c.i+1, c.j+1], [c.i+1, c.j], h[3], h[1], nr ? nr.h[2] : C.base, nr ? nr.h[0] : C.base, rail ? sh(P.rail, 0.8) : P.r);
      // its top: lighter where it leans to the light (from up and to the left)
      const lit=clamp(1+((h[1]-h[0])+(h[3]-h[2]))*0.10+((h[2]-h[0])+(h[3]-h[1]))*0.22, 0.6, 1.3);
      let col=rail ? P.rail : c.type==="ice" ? ((c.i+c.j)&1 ? "#cfeaf6" : "#bfe0f0") : c.type==="goal" ? (((c.i+c.j)&1) ? "#f4f0e2" : "#2a2a2e") : ((c.i+c.j)&1 ? P.a : P.b);
      x.fillStyle=sh(col, lit); x.beginPath(); x.moveTo(px, yT); x.lineTo(X(c.i+1, c.j), Y(c.i+1, c.j, h[1])); x.lineTo(X(c.i+1, c.j+1), Y(c.i+1, c.j+1, h[3])); x.lineTo(X(c.i, c.j+1), Y(c.i, c.j+1, h[2])); x.closePath(); x.fill();
      x.strokeStyle=P.line; x.stroke();
      if(c.type==="ice"){ x.strokeStyle="rgba(255,255,255,0.55)"; x.beginPath(); const mx=X(c.i+0.3, c.j+0.5), my=Y(c.i+0.3, c.j+0.5, (h[0]+h[2])/2); x.moveTo(mx, my); x.lineTo(mx+7, my-2); x.stroke(); }
    }
    while(ti<things.length) things[ti++].draw(X, Y);
  }
  function marble(x, px, py, m, t){
    const r=6.2;
    if(m.dead && m.how==="crack"){ const k=m.dead; x.fillStyle="#bfe6ff"; for(let q=0;q<9;q++){ const a=q*0.7, d=k*26*(0.5+((q*37)%10)/14); x.fillRect(px+Math.cos(a)*d-1.5, py-4+Math.sin(a)*d*0.5-k*10+k*k*30, 3, 3); } return; }
    const g=x.createRadialGradient(px-2, py-r-2, 1, px, py-r, r); g.addColorStop(0, "#ffffff"); g.addColorStop(0.25, "#bfe6ff"); g.addColorStop(1, "#2a5a9a");
    x.fillStyle=g; x.beginPath(); x.arc(px, py-r, r, 0, 7); x.fill();
    // the cat's eye: a twist of colour that turns as it rolls
    const a=m.roll, c=Math.cos(a), s=Math.sin(a), dx=(m.ax-m.ay)*0.7, dy=(m.ax+m.ay)*0.35;
    x.strokeStyle="#f2c81e"; x.lineWidth=2; x.beginPath(); x.moveTo(px-dx*c*4-dy*s*2, py-r-dy*c*4+s*2); x.lineTo(px+dx*c*4+dy*s*2, py-r+dy*c*4-s*2); x.stroke();
    x.strokeStyle="#e8402a"; x.lineWidth=1; x.beginPath(); x.moveTo(px-s*3, py-r-c*3); x.lineTo(px+s*3, py-r+c*3); x.stroke();
    x.fillStyle="rgba(255,255,255,0.9)"; x.fillRect(px-3, py-r-4, 2, 2);
  }
  function turtle(x, px, py, u, t){
    x.fillStyle="rgba(0,0,0,0.3)"; x.beginPath(); x.ellipse(px, py, 8, 4, 0, 0, 7); x.fill();
    const w=Math.sin(t*9+u.ph)*1.5;
    x.fillStyle="#7a9a3a"; for(const [ax, ay] of [[-6,-1],[6,-1],[-5,2],[5,2]]) x.fillRect(px+ax-1.5+(ax<0?w:-w)*0.4, py+ay-3, 3, 3);
    x.fillStyle="#3e5a22"; x.beginPath(); x.ellipse(px, py-5, 7, 5, 0, 0, 7); x.fill();
    x.strokeStyle="#6a8a3a"; x.lineWidth=1; x.beginPath(); x.ellipse(px, py-5, 4, 2.6, 0, 0, 7); x.moveTo(px-7, py-5); x.lineTo(px-4, py-5); x.moveTo(px+4, py-5); x.lineTo(px+7, py-5); x.stroke();
    x.fillStyle="#8aa84a"; x.fillRect(px-2, py-2, 4, 4); x.fillStyle="#111"; x.fillRect(px-1, py, 1, 1); x.fillRect(px+1, py, 1, 1);
  }
  function scene(x, G, t){
    const C=G.C, m=G.m, cam=G.cam || (G.cam={x:m.x, y:m.y, z:m.z});
    const k=m.dead && m.how==="fall" ? 0 : 0.14; cam.x+=(m.x-cam.x)*k; cam.y+=(m.y-cam.y)*k; cam.z+=(m.z-cam.z)*k;
    const things=[];
    for(const u of C.turtles){ const g=ground(C, u.x, u.y, {}); if(g) things.push({k:Math.floor(u.x)+Math.floor(u.y)+0.5, draw:(X, Y)=>turtle(x, X(u.x, u.y), Y(u.x, u.y, g.z), u, t)}); }
    // the marble: its shadow on the ground under it, then itself
    things.push({k:Math.floor(m.x+m.y+0.55)+0.6, draw:(X, Y)=>{ const g=ground(C, m.x, m.y, {});
      if(g && m.z>=g.z-0.05 && !(m.dead && m.how==="crack")){ x.fillStyle="rgba(0,0,0,0.35)"; x.beginPath(); x.ellipse(X(m.x, m.y), Y(m.x, m.y, g.z), 6, 3, 0, 0, 7); x.fill(); }
      marble(x, X(m.x, m.y), Y(m.x, m.y, m.z), m, t); }});
    view(x, C, cam, t, things);
  }
  function hud(x, G, t){
    x.fillStyle="#000"; x.fillRect(0, 0, W, 24); x.textBaseline="middle"; _cbFont(x, 10);
    x.textAlign="left"; x.fillStyle="#bfe6ff"; x.fillText("SCORE "+("00000"+G.score).slice(-5), 12, 14);
    x.textAlign="right"; x.fillStyle="#c0b8a6"; x.fillText((G.C.n+1)+" · "+G.C.name, W-12, 14);
    x.textAlign="center"; _cbFont(x, 14); x.fillStyle=G.t<10 && ((t*4)|0)%2 ? "#ff5a3a" : "#f2e23a"; x.fillText(String(Math.ceil(G.t)), W/2, 15);
  }
  // nobody at it: a marble that keeps to the middle of the first course, over and over
  let D=null;
  function demo(t){ if(!D){ D={C:build(0), m:{x:0, y:0, z:0, roll:0, ax:1, ay:0, dead:0}, cam:null, u:0}; }
    const P=D.C.path; D.u=(t*3.2)%(P.length-1); const a=P[Math.floor(D.u)], b=P[Math.floor(D.u)+1], f=D.u%1, m=D.m;
    m.ax=b.x-a.x; m.ay=b.y-a.y; m.x=a.x+(b.x-a.x)*f; m.y=a.y+(b.y-a.y)*f; const g=ground(D.C, m.x, m.y, {}); m.z=g ? g.z : a.z; m.roll=t*9; m.air=false;
    for(const u of D.C.turtles){ u.x=u.a.x; u.y=u.a.y; u.dir=1; }
    if(D.u<0.1) D.cam=null; return D; }
  return {
    name:"SLIPPERY ROCK", col:"#bfe6ff", help:"ARROWS · ROLL   N · NEW GAME   ESC · STEP AWAY",
    newGame(){ const G={score:0, lost:0, time:0, acc:0, over:false, won:false, shake:0, bonus:0, saved:false}; startCourse(G, 0, 0); return G; },
    key(G, e){},
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=Math.min(dt, 0.1); while(G.acc>=1/120){ G.acc-=1/120; frame(G, K, i, 1/120); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("slipperyrock", G.score, G.won ? "ALL FOUR" : G.C.name); } },
    draw(x, G, t){
      x.save(); if(G.shake>0) x.translate(Math.round(Math.sin(t*90)*G.shake*8), Math.round(Math.cos(t*70)*G.shake*6));
      scene(x, G, t); x.restore(); hud(x, G, t);
      if(G.over) _cbMid(x, G.won ? "DOWN ALL FOUR" : "OUT OF TIME", G.score+" · SPACE TO PLAY AGAIN");
      else if(G.doneT>0) _cbMid(x, "THE BOTTOM", "+"+G.bonus+" · "+Math.floor(G.t)+" SECONDS IN HAND");
      else if(G.msgT>0) _cbMid(x, G.C.name, G.C.n ? "THE CLOCK IS RUNNING" : "GET TO THE CHEQUERS");
      _cbTube(x); },
    attract(x, t, i){
      const d=demo(t); scene(x, d, t); x.fillStyle="#000"; x.fillRect(0, 0, W, 24);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(36, 40, W-72, 62);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28); x.fillStyle="#bfe6ff"; x.fillText("SLIPPERY", W/2, 58); x.fillStyle="#c0b8a6"; x.fillText("ROCK", W/2, 86); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 36, W-80, 110); _cbTopDraw(x, "slipperyrock", 52, "#bfe6ff"); }
      _cbFoot(x, i, t); _cbTube(x); },
    _debug:{build:build, ground:ground, frame:frame, COURSES:COURSES, startCourse:startCourse}
  };
})();

/* ---- into 18g's cabinets: cabinet 15 ---- */
_CBG[15]=_SR;
{ const L=_cbTop("slipperyrock"); if(L.length) CABS.hi[15]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[15]; if(R){ _SR.attract(R.x, 0, 15); R.tex.needsUpdate=true; } }
