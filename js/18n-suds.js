"use strict";
/* REST AREA · 18n-suds.js
   the arcade's seventh cabinet (12c): Suds Patrol
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18n · SUDS PATROL
   Played the way 18g's are (the cabinet's own screen, the stick under
   your hand, N to start again, Esc or E to step away), registered into
   18g's _CBG as cabinet 6, the one in the back corner. Its best five
   scores are kept in the browser and shown in its attract mode.

   A one-screen platform game of the bubble-trapping kind. You are the
   rest area's night custodian with a soap wand, and the place is crawling:
   stink bugs walking the shelves, spotted lanternflies hopping between
   them, dust bunnies drifting through it all. SPACE (or J) blows a bubble
   out in front of you; one that catches a bug while it is still being
   blown out carries it up and away, and touching a bubble pops it. Pop
   one with a bug in it and the bug is done for, and comes down as a
   snack (a soft pretzel up to a sticky bun, better as the stages go and
   better again for each bug in one chain of bubbles popped together:
   bubbles touching pop together). Leave a caught bug too long and it
   gets out, red and quicker. Hold jump as you come down on a bubble and
   you bounce off it instead. Fall through the gap in the floor and you
   come in again at the top. Clear every bug for the next stage: eight of
   them (the lobby, vending row, the truck lot, the picnic grove, the
   loading dock, the boiler room, the arcade, the roof), then round again
   quicker. Dawdle and they all turn red (HURRY UP), and a while after
   that a stink cloud comes for you through everything.
   Arrows or A/D walk, W or up (or K) jumps.
   Its stages, its people and its pictures are its own, drawn here.
   ---------------------------------------------------------------------- */
const _SP=(function(){
  const W=_CB.W, H=_CB.H, TS=8, NC=42, NR=32, Y0=24, G0=17, G1=24;     // 42 tiles by 32 under the score; the gap in the floor and the ceiling
  const LEFT=2*TS, RIGHT=W-2*TS, TOP=Y0+TS, BOT=Y0+NR*TS;
  const GRAV=0.22, FALL=2.6, JUMP=4.4, WALK=1.25, BR=7;
  // the stages: platforms as [row, first column, last column], the bugs as [kind, column, row stood on], and the colours
  const STAGES=[
    {n:"THE LOBBY", bg:"#0d1424", tile:["#4a86c8","#a8d4ff","#1e3c6a"], wall:["#2c3e5c","#3e5478"],
     p:[[26,4,13],[26,28,37],[21,9,32],[16,4,13],[16,28,37],[11,9,32],[6,4,15],[6,26,37]],
     e:[["bug",20,21],["bug",8,16],["bug",33,16],["bug",20,11]]},
    {n:"VENDING ROW", bg:"#160c1c", tile:["#c84a6a","#ffa8c0","#6a1e34"], wall:["#4a2a40","#62385a"],
     p:[[26,6,11],[26,18,23],[26,30,35],[21,2,8],[21,14,27],[21,33,39],[16,6,11],[16,18,23],[16,30,35],[11,2,8],[11,14,27],[11,33,39],[6,10,31]],
     e:[["bug",20,21],["fly",8,16],["fly",32,16],["bug",20,6],["bug",5,11]]},
    {n:"THE TRUCK LOT", bg:"#101210", tile:["#d8c040","#fff0a0","#6a5a10"], wall:["#3a3c38","#52544e"],
     p:[[26,2,16],[26,25,39],[21,8,33],[16,2,12],[16,18,23],[16,29,39],[11,8,33],[6,2,16],[6,25,39]],
     e:[["fly",10,26],["fly",30,26],["bug",20,21],["fly",20,11],["bug",8,6],["bug",32,6]]},
    {n:"PICNIC GROVE", bg:"#0a160c", tile:["#9a6a3a","#d8a870","#4a2e14"], wall:["#2a4a2a","#3a603a"],
     p:[[26,4,11],[26,18,23],[26,30,37],[21,2,6],[21,13,28],[21,35,39],[16,4,11],[16,18,23],[16,30,37],[11,2,6],[11,13,28],[11,35,39],[6,7,34]],
     e:[["bug",7,26],["bug",33,26],["fly",20,21],["fly",20,11],["puff",20,6]]},
    {n:"LOADING DOCK", bg:"#14100c", tile:["#c87a2a","#ffc080","#5a3410"], wall:["#4a3e30","#605040"],
     p:[[26,2,13],[26,18,23],[26,28,39],[21,2,8],[21,12,29],[21,33,39],[16,2,13],[16,18,23],[16,28,39],[11,6,35],[6,2,10],[6,31,39]],
     e:[["bug",8,26],["bug",34,26],["bug",20,21],["fly",8,16],["fly",33,16],["puff",20,11]]},
    {n:"BOILER ROOM", bg:"#1a0806", tile:["#c83a2a","#ff9070","#5a1008"], wall:["#4a1e18","#622a22"],
     p:[[26,2,26],[21,15,39],[16,2,26],[11,15,39],[6,2,26]],
     e:[["fly",10,26],["fly",30,21],["fly",10,16],["puff",25,11],["puff",12,6],["bug",30,11]]},
    {n:"THE ARCADE", bg:"#0c0818", tile:["#7a4ad8","#c8a8ff","#2e1a68"], wall:["#2a2050","#3a2e6c"],
     p:[[26,4,8],[26,12,16],[26,25,29],[26,33,37],[21,8,12],[21,18,23],[21,29,33],[16,4,8],[16,12,16],[16,25,29],[16,33,37],[11,8,12],[11,18,23],[11,29,33],[6,4,37]],
     e:[["bug",6,26],["bug",35,26],["fly",10,21],["fly",31,21],["puff",14,16],["puff",27,16],["bug",20,6]]},
    {n:"THE ROOF", bg:"#060a18", tile:["#7a8a9a","#d0dae4","#2e3a46"], wall:["#2a3240","#3a4454"],
     p:[[26,2,10],[26,31,39],[22,14,27],[18,2,10],[18,31,39],[14,14,27],[10,2,10],[10,31,39],[6,16,25]],
     e:[["bug",5,26],["bug",35,26],["fly",20,22],["fly",6,18],["fly",34,18],["puff",20,14],["puff",8,10],["puff",33,10]]}];
  const SNACKS=[["SOFT PRETZEL",500],["WHOOPIE PIE",700],["PIEROGI",1000],["FUNNEL CAKE",1500],["SHOOFLY PIE",2000],["BIRCH BEER",3000],["APPLE BUTTER",4000],["STICKY BUN",5000]];
  const snd=(i, k)=>_cbSnd(i, k);

  /* ---- the level: walls down both sides, the ceiling and the floor with a gap in the middle, the platforms one-way ---- */
  function grid(st){
    const g=new Uint8Array(NC*NR);
    for(let r=0;r<NR;r++){ g[r*NC]=g[r*NC+1]=g[r*NC+NC-2]=g[r*NC+NC-1]=2; }
    for(let c=2;c<NC-2;c++) if(c<G0 || c>G1){ g[c]=2; g[(NR-1)*NC+c]=1; }
    for(const [r, c0, c1] of st.p) for(let c=c0;c<=c1;c++) g[r*NC+c]=1;
    return g;
  }
  const _bgs={};
  function backdrop(k){
    if(_bgs[k]) return _bgs[k];
    const st=STAGES[k], c=cvs(W, H), x=c.getContext("2d"), g=grid(st);
    x.fillStyle=st.bg; x.fillRect(0, 0, W, H);
    // a faint pattern behind: tall panels, and a few things of the place
    x.fillStyle="rgba(255,255,255,0.025)"; for(let px=LEFT+12;px<RIGHT;px+=40) x.fillRect(px, TOP, 18, BOT-TOP);
    x.fillStyle="rgba(255,255,255,0.04)";
    for(let k2=0;k2<7;k2++){ const bx=40+((k*97+k2*53)%240), by=Y0+30+((k*61+k2*37)%180); x.beginPath(); x.arc(bx, by, 3+(k2%3)*2, 0, Math.PI*2); x.fill(); }
    for(let r=0;r<NR;r++) for(let cc=0;cc<NC;cc++){ const v=g[r*NC+cc]; if(!v) continue; const px=cc*TS, py=Y0+r*TS;
      if(v===2){ const C=st.wall; x.fillStyle=C[(r+cc)%2]; x.fillRect(px, py, TS, TS); x.fillStyle="rgba(0,0,0,0.25)"; x.fillRect(px, py+TS-1, TS, 1); x.fillRect(px+((r%2)?0:4), py, 1, TS); }
      else { const C=st.tile; x.fillStyle=C[0]; x.fillRect(px, py, TS, TS); x.fillStyle=C[1]; x.fillRect(px, py, TS, 2); x.fillStyle=C[2]; x.fillRect(px, py+TS-2, TS, 2);
        x.fillStyle="rgba(0,0,0,0.18)"; x.fillRect(px+TS-1, py+2, 1, TS-4); } }
    return (_bgs[k]=c);
  }

  /* ---- the pictures ---- */
  function custodian(x, cx, cy, dir, t, walk, blow, alpha){
    x.save(); x.translate(cx, cy); x.scale(dir, 1); if(alpha!==undefined) x.globalAlpha=alpha;
    const st=walk ? Math.sin(t*14)*2 : 0;
    x.fillStyle="#1a2440"; x.fillRect(-4+st*0.5, 3, 3, 4); x.fillRect(1-st*0.5, 3, 3, 4);           // the legs
    x.fillStyle="#2a2a2a"; x.fillRect(-5+st*0.5, 6, 4, 1.5); x.fillRect(1-st*0.5, 6, 4, 1.5);       // the boots
    x.fillStyle="#3a6ab8"; x.fillRect(-4, -3, 8, 7); x.fillStyle="#6a9ae0"; x.fillRect(-4, -3, 8, 1.5); // the coverall
    x.fillStyle="#f2c838"; x.fillRect(-1, -1, 2, 2);                                                   // the badge
    x.fillStyle="#e8b890"; x.beginPath(); x.arc(0, -6, 3.2, 0, Math.PI*2); x.fill();                    // the head
    x.fillStyle="#2a8a4a"; x.fillRect(-3.4, -9.6, 6.8, 2.6); x.fillRect(1.5, -7.6, 3.6, 1.2);           // the cap and its peak
    x.fillStyle="#1a1a1a"; x.fillRect(1.2, -6.4, 1, 1);                                                 // an eye
    // the arm out with the wand, the ring bigger as it blows
    x.strokeStyle="#3a6ab8"; x.lineWidth=2; x.beginPath(); x.moveTo(1, -1); x.lineTo(5, 0); x.stroke();
    x.strokeStyle="#c8c8d0"; x.lineWidth=1; x.beginPath(); x.moveTo(5, 0); x.lineTo(7, -2); x.stroke();
    x.strokeStyle="#dff6ff"; x.beginPath(); x.arc(8.5, -3.5, 1.8+blow*1.6, 0, Math.PI*2); x.stroke();
    x.restore();
  }
  function bug(x, cx, cy, dir, t, angry, s){
    x.save(); x.translate(cx, cy); x.scale(dir*(s||1), s||1);
    const lg=Math.sin(t*16)*1.2; x.strokeStyle="#2a1a10"; x.lineWidth=1;
    for(const k of [-3, 0, 3]){ x.beginPath(); x.moveTo(k, 2); x.lineTo(k-1+lg*(k===0?-1:1), 6); x.stroke(); }
    x.fillStyle=angry ? "#c8402a" : "#7a5a3a";
    x.beginPath(); x.moveTo(5, -1); x.lineTo(2, -5); x.lineTo(-5, -4); x.lineTo(-6, 1); x.lineTo(-2, 4); x.lineTo(3, 3); x.closePath(); x.fill();
    x.fillStyle=angry ? "#ff8a6a" : "#c8a070"; for(const k of [-4, -1, 2]) x.fillRect(k, -4.6, 1.2, 1);
    x.fillStyle="#3a2a1a"; x.fillRect(4, -2, 3, 3);
    x.strokeStyle="#3a2a1a"; x.beginPath(); x.moveTo(6, -2); x.lineTo(8, -5); x.moveTo(6, -1); x.lineTo(9, -3); x.stroke();
    x.restore();
  }
  function fly(x, cx, cy, dir, t, air, angry, s){
    x.save(); x.translate(cx, cy); x.scale(dir*(s||1), s||1);
    if(air){ x.fillStyle=angry ? "#ff4040" : "#d8303a"; x.beginPath(); x.ellipse(-2, -3, 5, 3, -0.5, 0, Math.PI*2); x.fill();
      x.fillStyle="#1a1a1a"; x.fillRect(-4, -4, 1.5, 1.5); }
    x.fillStyle="#1a1a1a"; x.beginPath(); x.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI*2); x.fill();
    x.fillStyle=angry ? "#e0a0a0" : "#c8b4a8"; x.beginPath(); x.moveTo(3, -1); x.lineTo(-6, -3); x.lineTo(-7, 1); x.lineTo(2, 1); x.closePath(); x.fill();
    x.fillStyle="#1a1a1a"; for(const [a, b] of [[-1, -1], [-3, -2], [-5, 0], [-2, 0]]) x.fillRect(a, b, 1, 1);
    x.strokeStyle="#1a1a1a"; x.lineWidth=1; x.beginPath(); x.moveTo(4, 1); x.lineTo(5, 4); x.moveTo(1, 1); x.lineTo(0, 4); x.stroke();
    x.restore();
  }
  function puff(x, cx, cy, t, angry, s){
    x.save(); x.translate(cx, cy); x.scale(s||1, s||1);
    x.fillStyle=angry ? "#d89090" : "#b8b8c4";
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+t*2; x.beginPath(); x.arc(Math.cos(a)*3.4, Math.sin(a)*3.4, 3, 0, Math.PI*2); x.fill(); }
    x.beginPath(); x.arc(0, 0, 4, 0, Math.PI*2); x.fill();
    x.fillStyle="#ffffff"; x.fillRect(-3, -2, 2.4, 2.4); x.fillRect(1, -2, 2.4, 2.4);
    x.fillStyle="#1a1a1a"; x.fillRect(-2.2, -1.2, 1.2, 1.2); x.fillRect(1.8, -1.2, 1.2, 1.2);
    x.restore();
  }
  function foe(x, f, t, s){ const cx=f.x+f.w/2, cy=f.y+f.h/2;
    if(f.k==="bug") bug(x, cx, cy, f.dir, f.st==="walk" && f.ground ? t : 0, f.angry, s);
    else if(f.k==="fly") fly(x, cx, cy, f.dir, t, !f.ground, f.angry, s);
    else puff(x, cx, cy, t, f.angry, s); }
  function snack(x, k, cx, cy){
    x.save(); x.translate(cx, cy);
    if(k===0){ x.strokeStyle="#a8642a"; x.lineWidth=2; x.beginPath(); x.arc(-2, 0, 2.6, 0, Math.PI*2); x.arc(2, 0, 2.6, Math.PI, Math.PI*3); x.stroke();
      x.fillStyle="#ffffff"; x.fillRect(-3, -2, 1, 1); x.fillRect(2, 1, 1, 1); }
    else if(k===1){ x.fillStyle="#4a2a1a"; x.beginPath(); x.ellipse(0, -2, 5, 2.4, 0, 0, Math.PI*2); x.fill(); x.beginPath(); x.ellipse(0, 2, 5, 2.4, 0, 0, Math.PI*2); x.fill();
      x.fillStyle="#f8f4ec"; x.fillRect(-4.5, -0.6, 9, 1.4); }
    else if(k===2){ x.fillStyle="#f0e0b8"; x.beginPath(); x.arc(0, 2, 5, Math.PI, 0); x.fill(); x.fillStyle="#d0b080"; for(let a=0;a<5;a++) x.fillRect(-4.5+a*2, 1.4, 1, 1); }
    else if(k===3){ x.strokeStyle="#e0b070"; x.lineWidth=1.6; x.beginPath(); for(let a=0;a<14;a++){ const r=1+a*0.28; x.lineTo(Math.cos(a*1.3)*r, Math.sin(a*1.3)*r); } x.stroke();
      x.fillStyle="#ffffff"; x.fillRect(-2, -2, 1, 1); x.fillRect(1, 1, 1, 1); x.fillRect(2, -3, 1, 1); }
    else if(k===4){ x.fillStyle="#5a3418"; x.beginPath(); x.moveTo(-5, 4); x.lineTo(5, 4); x.lineTo(0, -5); x.closePath(); x.fill(); x.fillStyle="#c89050"; x.fillRect(-3, -1, 6, 1.6); }
    else if(k===5){ x.fillStyle="#7a2a1a"; x.fillRect(-2, -2, 4, 7); x.fillRect(-1, -5, 2, 3); x.fillStyle="#f2e8d0"; x.fillRect(-2, 0, 4, 2); }
    else if(k===6){ x.fillStyle="#6a3a1a"; x.fillRect(-3.5, -2, 7, 6); x.fillStyle="#d84040"; x.fillRect(-4, -4, 8, 2); x.fillStyle="#ffffff"; x.fillRect(-3, -4, 1, 1); x.fillRect(1, -4, 1, 1); }
    else { x.fillStyle="#c8843a"; x.beginPath(); x.arc(0, 0, 5, 0, Math.PI*2); x.fill(); x.strokeStyle="#6a3a14"; x.lineWidth=1; x.beginPath();
      for(let a=0;a<16;a++){ const r=a*0.3; x.lineTo(Math.cos(a*0.9)*r, Math.sin(a*0.9)*r); } x.stroke(); x.fillStyle="#f8f0e0"; x.fillRect(-3, -4, 2, 1); }
    x.restore();
  }
  function bubble(x, b, t){
    const warn=b.foe && b.life<120 && ((t*10)|0)%2;
    x.fillStyle=warn ? "rgba(255,120,120,0.30)" : b.ph==="push" ? "rgba(200,255,230,0.22)" : "rgba(150,225,255,0.20)";
    x.beginPath(); x.arc(b.x, b.y, BR, 0, Math.PI*2); x.fill();
    if(b.foe){ x.save(); x.beginPath(); x.arc(b.x, b.y, BR-0.5, 0, Math.PI*2); x.clip(); const f=b.foe; f.x=b.x-f.w/2; f.y=b.y-f.h/2; foe(x, f, t*0.3, 0.8); x.restore(); }
    x.strokeStyle=warn ? "#ff7a7a" : "#dff6ff"; x.lineWidth=1; x.beginPath(); x.arc(b.x, b.y, BR, 0, Math.PI*2); x.stroke();
    x.fillStyle="rgba(255,255,255,0.85)"; x.fillRect(b.x-4, b.y-4, 2, 2);
  }
  function cloud(x, c, t){
    for(let k=0;k<6;k++){ const a=k/6*Math.PI*2+t*1.5; x.fillStyle="rgba(150,190,60,0.75)"; x.beginPath(); x.arc(c.x+8+Math.cos(a)*5, c.y+7+Math.sin(a)*4, 5, 0, Math.PI*2); x.fill(); }
    x.fillStyle="#c8e060"; x.beginPath(); x.arc(c.x+8, c.y+7, 5, 0, Math.PI*2); x.fill();
    x.fillStyle="#1a1a1a"; x.fillRect(c.x+4, c.y+5, 2.5, 2); x.fillRect(c.x+9.5, c.y+5, 2.5, 2); x.fillRect(c.x+5, c.y+9.5, 6, 1);
  }

  /* ---- moving on the platforms: one-way (you land on them from above, and go up through them), the walls solid ---- */
  function tileAt(G, c, r){ if(c<0 || c>=NC || r<0 || r>=NR) return 0; return G.g[r*NC+c]; }
  function standing(G, x, w, feet){
    const fr=(feet-Y0)/TS, r=Math.round(fr); if(Math.abs(fr-r)>0.02) return false;
    for(let c=Math.floor((x+2)/TS); c<=Math.floor((x+w-3)/TS); c++) if(tileAt(G, c, r)===1) return true;
    return false;
  }
  // down through a frame: the first platform top crossed under this body's columns, or null
  function landOn(G, x, w, f0, f1){
    for(let r=Math.ceil((f0-Y0)/TS-0.001); Y0+r*TS<=f1; r++){
      if(Y0+r*TS<f0-0.001) continue;
      for(let c=Math.floor((x+2)/TS); c<=Math.floor((x+w-3)/TS); c++) if(tileAt(G, c, r)===1) return Y0+r*TS;
    }
    return null;
  }
  // gravity, the platforms, the walls, the ceiling, the gap: what bodies (you, the bugs, the snacks) all do
  function body(G, b){
    b.vy=Math.min(FALL, b.vy+GRAV);
    const f0=b.y+b.h; b.y+=b.vy;
    if(b.vy>=0){ const top=landOn(G, b.x, b.w, f0, b.y+b.h); if(top!==null){ b.y=top-b.h; b.vy=0; b.ground=true; } else b.ground=false; }
    else { b.ground=false; if(b.y<TOP){ b.y=TOP; b.vy=0; } }                     // (the ceiling: nobody jumps out through its gap)
    if(b.y>BOT+2) b.y=Y0-b.h-2;                                                    // (through the gap and in at the top)
    b.x+=b.vx;
    if(b.x<LEFT){ b.x=LEFT; return -1; } if(b.x+b.w>RIGHT){ b.x=RIGHT-b.w; return 1; }
    return 0;
  }
  const hit=(a, b, m)=>a.x+m<b.x+b.w && b.x+m<a.x+a.w && a.y+m<b.y+b.h && b.y+m<a.y+a.h;
  const hitC=(b, r, cx, cy)=>{ const nx=clamp(cx, b.x, b.x+b.w), ny=clamp(cy, b.y, b.y+b.h); return (nx-cx)*(nx-cx)+(ny-cy)*(ny-cy)<r*r; };

  /* ---- a stage ---- */
  function stage(G){
    const k=(G.lvl-1)%STAGES.length, st=STAGES[k];
    G.k=k; G.g=grid(st); G.bg=backdrop(k); G.loop=Math.floor((G.lvl-1)/STAGES.length);
    G.foes=st.e.map(([kd, c, r])=>({k:kd, x:c*TS-2, y:Y0+r*TS-12, w:12, h:12, vx:0, vy:0, dir:c<NC/2 ? 1 : -1, ground:kd!=="puff", st:"walk", angry:false,
      wait:30+Math.random()*60, think:60+Math.random()*60, edge:false, off:false}));
    for(const f of G.foes) if(f.k==="puff"){ f.vx=(f.dir)*0.6; f.vy=-0.5; }
    G.bubs=[]; G.snacks=[]; G.cloud=null; G.lt=0; G.hurry=0; G.clearT=0; G.msgT=150;
    spawn(G);
  }
  function spawn(G){ const p=G.p; p.x=4*TS; p.y=BOT-TS-14; p.vx=0; p.vy=0; p.dir=1; p.ground=true; p.dead=0; p.inv=120; p.cool=0; p.blow=0; }
  function kill(G, f, n, i){
    f.st="dead"; f.vx=(Math.random()<0.5 ? -1 : 1)*(0.9+Math.random()*1.1); f.vy=-3.6; f.ground=false;
    f.snack=Math.min(SNACKS.length-1, G.k%4+n+G.loop); G.score+=100; snd(i, "eatghost");
  }
  // one bubble touched: it and every bubble touching it, and every one touching those, go together
  function popChain(G, b0, i){
    const out=new Set([b0]), q=[b0];
    while(q.length){ const a=q.pop(); for(const b of G.bubs) if(!out.has(b) && b.ph!=="push" && Math.hypot(a.x-b.x, a.y-b.y)<BR*2+3){ out.add(b); q.push(b); } }
    let n=0;
    for(const b of out){ G.bubs.splice(G.bubs.indexOf(b), 1); G.fx.push({x:b.x, y:b.y, t:0});
      if(b.foe){ kill(G, b.foe, n, i); n++; } else G.score+=10; }
    if(n>=2){ const bonus=500*Math.pow(2, n-1); G.score+=bonus; G.pops.push({x:b0.x, y:b0.y-10, txt:n+" AT ONCE  +"+bonus, t:0, col:"#f2e23a"}); }
    snd(i, "pop");
  }
  function blow(G, i){
    const p=G.p; if(p.cool>0 || p.dead>0) return;
    const bx=p.x+p.w/2+p.dir*9, by=p.y+6;
    p.cool=13; p.blow=8;
    if(bx-BR<LEFT || bx+BR>RIGHT){ G.fx.push({x:clamp(bx, LEFT+BR, RIGHT-BR), y:by, t:0}); return; }
    G.bubs.push({x:bx, y:by, vx:p.dir*4.2, vy:0, ph:"push", t:0, life:600, foe:null});
    snd(i, "suds");
  }
  function frame(G, K, i){
    if(G.over) return;
    G.t++;
    if(G.msgT>0){ G.msgT--; return; }                                             // (READY: everything still)
    const p=G.p, sp=1+0.18*G.loop;
    // you
    if(p.dead>0){ p.dead--; if(p.dead===0){ if(G.lives<=0){ G.over=true; return; } spawn(G); G.cloud=null; G.lt=Math.min(G.lt, 1500); } }
    else {
      const L=K.ArrowLeft||K.KeyA, R=K.ArrowRight||K.KeyD, jh=K.ArrowUp||K.KeyW||K.KeyK;
      p.vx=(R?1:0)-(L?1:0); if(p.vx) p.dir=p.vx; p.vx*=WALK; p.walk=p.vx!==0 && p.ground;
      if(G.jump && p.ground){ p.vy=-JUMP; p.ground=false; snd(i, "hop"); } G.jump=false;
      if(G.fire){ blow(G, i); } G.fire=false;
      if(p.ground && !standing(G, p.x, p.w, p.y+p.h)) p.ground=false;
      body(G, p);
      p.cool=Math.max(0, p.cool-1); p.blow=Math.max(0, p.blow-1); p.inv=Math.max(0, p.inv-1);
      // the bubbles you touch: bounce off one coming down with jump held, or pop it (and what touches it)
      for(const b of G.bubs.slice()){ if(b.t<12 || !G.bubs.includes(b)) continue;
        if(!hitC(p, BR, b.x, b.y)) continue;
        if(p.vy>0 && jh && p.y+p.h<b.y+2){ p.vy=-3.9; p.ground=false; snd(i, "hop"); continue; }
        popChain(G, b, i); }
    }
    // the bubbles: blown out, then up to the ceiling and along it toward the middle; a caught bug gets out in the end
    const trapLife=Math.max(270, 420-15*(G.lvl-1));
    for(let k=G.bubs.length-1;k>=0;k--){ const b=G.bubs[k]; b.t++;
      if(b.ph==="push"){ b.x+=b.vx; b.vx*=0.9;
        if(b.x-BR<LEFT){ b.x=LEFT+BR; b.ph="float"; } else if(b.x+BR>RIGHT){ b.x=RIGHT-BR; b.ph="float"; }
        if(Math.abs(b.vx)<0.7) b.ph="float";
        for(const f of G.foes) if(f.st==="walk" && hitC(f, BR-1, b.x, b.y)){ f.st="trap"; b.foe=f; b.life=trapLife; b.ph="float"; snd(i, "nab"); break; } }
      else { if(b.y-BR>TOP+1) b.y-=b.foe ? 0.38 : 0.48; else { b.y=TOP+1+BR; const tx=W/2+Math.sin(b.t*0.02+k)*30; b.x+=clamp(tx-b.x, -0.3, 0.3); }
        b.x+=Math.sin(b.t*0.07+k)*0.12; }
      if(b.foe){ b.foe.x=b.x-b.foe.w/2; b.foe.y=b.y-b.foe.h/2; }
      b.life--;
      if(b.life<=0){ G.bubs.splice(k, 1); G.fx.push({x:b.x, y:b.y, t:0});
        if(b.foe){ const f=b.foe; f.st="walk"; f.angry=true; f.x=b.x-f.w/2; f.y=b.y-f.h/2; f.vy=0; f.ground=false; if(f.k==="puff"){ f.vx=0.6; f.vy=0.6; } } }
    }
    // floating ones keep off each other, in a cluster under the ceiling
    for(let a=0;a<G.bubs.length;a++) for(let c=a+1;c<G.bubs.length;c++){ const A=G.bubs[a], B=G.bubs[c]; if(A.ph==="push" || B.ph==="push") continue;
      const dx=B.x-A.x, dy=B.y-A.y, d=Math.hypot(dx, dy); if(d<BR*2-1 && d>0.01){ const m=(BR*2-1-d)*0.25; A.x-=dx/d*m; B.x+=dx/d*m; A.y-=dy/d*m*0.5; B.y+=dy/d*m*0.5; } }
    for(const b of G.bubs){ b.x=clamp(b.x, LEFT+BR, RIGHT-BR); b.y=Math.min(b.y, BOT-BR); }
    // them
    G.lt++;
    if(G.lt===1800){ G.hurry=120; for(const f of G.foes) f.angry=true; snd(i, "pellet"); }
    if(G.lt===2700 && !G.cloud){ G.cloud={x:W/2-8, y:Y0-14, w:16, h:14}; }
    for(let k=G.foes.length-1;k>=0;k--){ const f=G.foes[k], s=sp*(f.angry ? 1.7 : 1);
      if(f.st==="trap") continue;
      if(f.st==="dead"){ f.vy=Math.min(FALL, f.vy+GRAV); const f0=f.y+f.h; f.y+=f.vy; f.x+=f.vx;
        if(f.x<LEFT || f.x+f.w>RIGHT){ f.vx=-f.vx; f.x=clamp(f.x, LEFT, RIGHT-f.w); }
        if(f.y>BOT+2) f.y=Y0-f.h-2;
        if(f.vy>0){ const top=landOn(G, f.x, f.w, f0, f.y+f.h); if(top!==null){ G.snacks.push({x:f.x+1, y:top-10, w:10, h:10, vx:0, vy:0, k:f.snack, t:0, ground:true}); G.foes.splice(k, 1); } }
        continue; }
      if(f.k==="puff"){ f.x+=f.vx*s; f.y+=f.vy*s;
        if(f.x<LEFT){ f.x=LEFT; f.vx=Math.abs(f.vx); } if(f.x+f.w>RIGHT){ f.x=RIGHT-f.w; f.vx=-Math.abs(f.vx); }
        if(f.y<TOP){ f.y=TOP; f.vy=Math.abs(f.vy); } if(f.y+f.h>BOT-TS){ f.y=BOT-TS-f.h; f.vy=-Math.abs(f.vy); }
        if(--f.think<=0){ f.think=90+Math.random()*90; if(Math.random()<0.5) f.vx=Math.sign(p.x-f.x||1)*Math.abs(f.vx||0.6); }
        f.dir=f.vx<0 ? -1 : 1; }
      else if(f.k==="bug"){
        if(f.ground){
          if(--f.think<=0){ f.think=60+Math.random()*70; if(Math.random()<0.65 && p.dead===0) f.dir=Math.sign(p.x-f.x)||f.dir;
            // a jump up, when you are above it and there is a platform to land on
            if(p.dead===0 && p.y+p.h<f.y-6 && Math.abs(p.x-f.x)<90 && Math.random()<0.6){
              let up=false; for(let r=Math.round((f.y+f.h-Y0)/TS)-6; r<=Math.round((f.y+f.h-Y0)/TS)-2 && !up; r++) for(let c=Math.floor(f.x/TS); c<=Math.floor((f.x+f.w)/TS); c++) if(tileAt(G, c, r)===1){ up=true; break; }
              if(up){ f.vy=-JUMP; f.ground=false; } } }
          // the edge of a platform: off it, or back
          const ahead=standing(G, f.x+f.dir*(f.w*0.6), f.w, f.y+f.h);
          if(!ahead){ if(!f.edge){ f.edge=true; f.off=(p.y>f.y+8 && Math.random()<0.75) || Math.random()<0.3; } if(!f.off) f.dir=-f.dir; } else f.edge=false;
          f.vx=f.dir*0.6*s; }
        if(f.ground && !standing(G, f.x, f.w, f.y+f.h)) f.ground=false;
        const w=body(G, f); if(w) f.dir=-w; }
      else {                                                                       // a lanternfly: it sits, then hops
        if(f.ground){ f.vx=0;
          if(--f.wait<=0){ f.wait=(f.angry ? 18 : 34)+Math.random()*40; if(Math.random()<0.6 && p.dead===0) f.dir=Math.sign(p.x-f.x)||f.dir;
            f.vx=f.dir*1.05*s; f.vy=(p.y+p.h<f.y-6 && Math.random()<0.7) ? -JUMP : -2.8; f.ground=false; } }
        if(f.ground && !standing(G, f.x, f.w, f.y+f.h)) f.ground=false;
        const w=body(G, f); if(w){ f.dir=-w; f.vx=-f.vx; } }
      // and you, if it touches you
      if(p.dead===0 && p.inv===0 && hit(p, f, 2)){ p.dead=100; G.lives--; snd(i, "die"); }
    }
    // the stink cloud: through everything, straight for you
    if(G.cloud && p.dead===0){ const c=G.cloud, dx=p.x-c.x, dy=p.y-c.y, d=Math.hypot(dx, dy)||1; c.x+=dx/d*0.55*sp; c.y+=dy/d*0.55*sp;
      if(p.inv===0 && hit(p, c, 3)){ p.dead=100; G.lives--; snd(i, "die"); } }
    // the snacks: picked up, or gone after a while
    for(let k=G.snacks.length-1;k>=0;k--){ const s=G.snacks[k]; s.t++;
      if(!s.ground || !standing(G, s.x, s.w, s.y+s.h)){ s.ground=false; body(G, s); }
      if(p.dead===0 && hit(p, s, 0)){ const v=SNACKS[s.k][1]; G.score+=v; G.pops.push({x:s.x+5, y:s.y, txt:String(v), t:0, col:"#ffffff"}); G.snacks.splice(k, 1); snd(i, "snack"); continue; }
      if(s.t>540) G.snacks.splice(k, 1); }
    for(let k=G.pops.length-1;k>=0;k--) if((G.pops[k].t+=1/60)>1.2) G.pops.splice(k, 1);
    for(let k=G.fx.length-1;k>=0;k--) if((G.fx[k].t+=1/60)>0.35) G.fx.splice(k, 1);
    if(G.hurry>0) G.hurry--;
    // an extra one, now and then
    if(G.score>=G.extra){ G.lives++; G.extra+=30000; G.pops.push({x:W/2, y:BOT-40, txt:"EXTRA CUSTODIAN", t:0, col:"#7ad08a"}); snd(i, "jingle"); }
    // every bug done: a moment for the snacks, then the next stage
    if(!G.foes.length && p.dead===0){ if(!G.clearT){ G.clearT=240; snd(i, "jingle"); } else if(--G.clearT===0){ G.lvl++; stage(G); } }
  }

  return {
    name:"SUDS PATROL", col:"#8ad0ff",
    help:"SUDS PATROL · A/D OR ARROWS WALK · W OR UP JUMPS · SPACE BLOWS A BUBBLE · ESC TO STEP AWAY",
    newGame(){ const G={score:0, lives:3, lvl:1, over:false, won:false, t:0, acc:0, extra:20000, p:{w:12, h:14, dir:1}, pops:[], fx:[], jump:false, fire:false};
      stage(G); return G; },
    key(G, e){ if(e.repeat) return;
      if(e.code==="Space" || e.code==="KeyJ" || e.code==="KeyF" || e.code==="KeyX") G.fire=true;
      if(e.code==="ArrowUp" || e.code==="KeyW" || e.code==="KeyK") G.jump=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW||K.KeyK) ? 1 : 0]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=dt; while(G.acc>=1/60){ G.acc-=1/60; frame(G, K, i); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("suds", G.score, "STAGE "+G.lvl); } },
    draw(x, G, t){
      x.drawImage(G.bg, 0, 0);
      for(const s of G.snacks) if(s.t<420 || ((t*8)|0)%2) snack(x, s.k, s.x+5, s.y+5);
      for(const f of G.foes) if(f.st!=="trap"){ if(f.st==="dead"){ x.save(); x.translate(f.x+6, f.y+6); x.rotate(G.t*0.3); x.translate(-f.x-6, -f.y-6); foe(x, f, t, 1); x.restore(); } else foe(x, f, t, 1); }
      for(const b of G.bubs) bubble(x, b, t);
      for(const o of G.fx){ x.strokeStyle="rgba(220,245,255,"+(1-o.t/0.35).toFixed(2)+")"; x.lineWidth=1;
        for(let k=0;k<8;k++){ const a=k/8*Math.PI*2, r=BR+o.t*24; x.beginPath(); x.moveTo(o.x+Math.cos(a)*r*0.6, o.y+Math.sin(a)*r*0.6); x.lineTo(o.x+Math.cos(a)*r, o.y+Math.sin(a)*r); x.stroke(); } }
      const p=G.p;
      if(p.dead>0){ x.save(); x.translate(p.x+6, p.y+7); x.rotate(p.dead*0.2); x.translate(-p.x-6, -p.y-7); custodian(x, p.x+6, p.y+7, p.dir, 0, false, 0); x.restore(); }
      else if(!(p.inv>0 && ((t*12)|0)%2)) custodian(x, p.x+6, p.y+7, p.dir, t, p.walk, p.blow/8);
      if(G.cloud) cloud(x, G.cloud, t);
      x.textAlign="center"; x.textBaseline="middle";
      for(const o of G.pops){ _cbFont(x, 9); x.fillStyle=o.col; x.globalAlpha=Math.max(0, 1-o.t/1.2); x.fillText(o.txt, clamp(o.x, 60, W-60), o.y-o.t*14); x.globalAlpha=1; }
      // the top: the score and the custodians left, the best, the stage
      x.fillStyle="#000"; x.fillRect(0, 0, W, Y0); x.textBaseline="middle"; _cbFont(x, 12);
      x.textAlign="left"; x.fillStyle="#8ad0ff"; x.fillText(String(G.score).padStart(6, "0"), 8, 11);
      for(let k=0;k<Math.min(5, G.lives-1);k++) custodian(x, 64+k*11, 12, 1, 0, false, 0, 0.9);
      x.textAlign="center"; x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[6]||0)).padStart(6, "0"), W/2+24, 11);
      x.textAlign="right"; x.fillStyle="#f2e23a"; x.fillText("STAGE "+G.lvl, W-8, 11);
      if(G.over) _cbMid(x, "GAME OVER", "STAGE "+G.lvl+" · SPACE TO PLAY AGAIN");
      else if(G.msgT>0) _cbMid(x, "STAGE "+G.lvl, STAGES[G.k].n+(G.loop ? " · ROUND "+(G.loop+1) : ""));
      else if(G.clearT>0 && G.clearT<200) _cbMid(x, "STAGE CLEAR");
      else if(G.hurry>0 && ((t*6)|0)%2) _cbMid(x, "HURRY UP!");
      _cbTube(x); },
    // the attract mode: the lobby, the custodian blowing bubbles at a stink bug and a lanternfly; then the best scores
    attract(x, t, i){
      x.drawImage(backdrop(0), 0, 0);
      if(((t/7)|0)%2===0){
        const u=(t%7)/7, cx=40+u*120, gy=BOT-TS;
        custodian(x, cx, gy-7, 1, t, true, (t*2)%1<0.3 ? 1 : 0);
        for(let k=0;k<4;k++){ const bt=(t*0.9+k*0.25)%1, bx=cx+14+bt*60, by=gy-12-bt*bt*150; if(by>TOP+BR) bubble(x, {x:bx, y:by, ph:"float", foe:null}, t); }
        const caught={k:"bug", x:0, y:0, w:12, h:12, dir:-1, st:"trap", angry:false, ground:true};
        bubble(x, {x:250+Math.sin(t)*6, y:TOP+BR+20+Math.sin(t*1.3)*4, ph:"float", foe:caught, life:600}, t);
        fly(x, 270+Math.sin(t*2)*20, Y0+21*TS-6-Math.abs(Math.sin(t*3))*14, -1, t, Math.abs(Math.sin(t*3))>0.2, false, 1);
        x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(40, 68, W-80, 64);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 30);
        x.fillStyle="#8ad0ff"; x.fillText("SUDS", W/2, 88); x.fillStyle="#f2e23a"; x.fillText("PATROL", W/2, 116); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 50, W-80, 110); _cbTopDraw(x, "suds", 66, "#8ad0ff"); }
      _cbFoot(x, i, t); _cbTube(x); },
    // for tools and testing
    _debug:{STAGES:STAGES, grid:grid, frame:frame, stage:stage}
  };
})();

/* ---- into 18g's cabinets: cabinet 6 (12c) ---- */
_CBG[6]=_SP;
{ const L=_cbTop("suds"); if(L.length) CABS.hi[6]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[6]; if(R){ _SP.attract(R.x, 0, 6); R.tex.needsUpdate=true; } }
