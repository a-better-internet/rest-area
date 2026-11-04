"use strict";
/* REST AREA · 18m-cabgames.js
   the arcade's newer games: Brickyard Breakout rebuilt, Groundhog Gulch and Turnpike Turtle
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18m · BRICKYARD BREAKOUT, GROUNDHOG GULCH, TURNPIKE TURTLE
   Played the way 18g's are (the cabinet's own screen, the stick under
   your hand, N to start again, Esc or E to step away), registered into
   18g's _CBG by cabinet (12c): Brickyard Breakout is cabinet 2, Groundhog
   Gulch 4 and Turnpike Turtle 5. Each keeps its best five scores in the
   browser and shows them in its attract mode.

   BRICKYARD BREAKOUT, the bat-and-ball wall game done the way the later
   ones did it: eight rounds of brickwork (a plain wall, a chimney, arches,
   pallets, a kiln, a checker, a rampart, a hard hat), then round again
   harder; silver bricks that take a few hits and gold that take none; the
   ball off the bat at an angle by where it struck, faster the longer it
   lasts; capsules that fall from broken bricks (W wide, S slow, T three
   balls, G glue, Z the zapper, + a life, K the next round); pigeons that
   wander down through the play; a count in before each serve, P to pause.
   GROUNDHOG GULCH: a groundhog digs down through topsoil, clay, shale and
   the coal seam. Beetles and skunks wait in pockets in the ground and come
   along the tunnels it digs, or creep through the dirt as ghosts; a skunk
   sprays a cloud of stink through the dirt ahead of it. The groundhog has
   a garden hose: Space sends the water along the tunnel, and held on or
   pressed again fills whatever it reaches till it bursts. Dig out under a
   rock and it falls on whatever is below. Deeper is worth more.
   TURNPIKE TURTLE: a box turtle crossing I-79's five lanes of cars and
   rigs, the median, and French Creek on logs, inner tubes and canoes, to
   one of five nests in the far bank, against the clock. Fill all five and
   it goes round faster; from the second, a hawk's shadow sweeps the median.
   The pictures and the rounds are drawn here.
   ---------------------------------------------------------------------- */
// best scores, kept in the browser (a private window may not keep them; nothing depends on it)
function _cbTop(key){ try{ const v=JSON.parse(localStorage.getItem("restarea.arcade."+key)||"[]"); return Array.isArray(v) ? v : []; }catch(e){ return []; } }
function _cbAddTop(key, score, note){
  if(!(score>0)) return; const L=_cbTop(key); L.push({s:score, n:note||""}); L.sort((a,b)=>b.s-a.s); L.length=Math.min(L.length, 5);
  try{ localStorage.setItem("restarea.arcade."+key, JSON.stringify(L)); }catch(e){} }
function _cbTopDraw(x, key, y0, col){
  const L=_cbTop(key), W=_CB.W; x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 11);
  x.fillStyle=col||"#9a9aaa"; x.fillText("BEST SCORES", W/2, y0);
  if(!L.length){ x.fillStyle="#5a5a6a"; x.fillText("NONE YET", W/2, y0+16); return; }
  L.forEach((e, k)=>{ x.fillStyle=k===0 ? "#f2e23a" : "#d8d8e0"; x.fillText((k+1)+".  "+String(e.s).padStart(6, " ")+(e.n ? "   "+e.n : ""), W/2, y0+15+k*13); });
}

/* ======================================================================
   BRICKYARD BREAKOUT
   ====================================================================== */
const _BK=(function(){
  const W=_CB.W, H=_CB.H, FX0=12, FX1=240, FY0=24, BW=19, BH=9, COLS=12, BY0=FY0+16;
  const BAT_Y=H-16, BAT_H=6, BAT_W=36, BAT_WW=56, BR=3;
  // each kind: face, top, bottom, points
  const KB={r:["#d8402a","#ff8a6a","#7a1a10",90], o:["#e8862a","#ffc070","#7a4410",80], y:["#e8c030","#fff090","#7a6010",70],
           g:["#3aa84a","#8ae09a","#1a5022",60], c:["#2ab8c8","#9ae8f0",  "#106068",50], b:["#3a62e8","#9ab0ff","#182878",100],
           p:["#b050d8","#e0a0ff","#501a68",110], w:["#ded8cc","#ffffff","#7a766c",50], s:["#a2a6ae","#eef2f8","#4a4e56",0], x:["#c49a2a","#ffe48a","#5a440a",0]};
  // the rounds, twelve bricks across, top row first: '.' none, a letter a brick (s silver, x gold)
  const ROUNDS=[
    {n:"THE WALL", m:["............","ssssssssssss","rrrrrrrrrrrr","oooooooooooo","yyyyyyyyyyyy","gggggggggggg","cccccccccccc","bbbbbbbbbbbb"]},
    {n:"THE CHIMNEY", m:["....ssss....","....rrrr....","....rxxr....","....rrrr....","..oooooooo..",".oyyyyyyyyo.","oyggggggggyo","oyggbbbbggyo","oyggbbbbggyo","oooooooooooo"]},
    {n:"THE ARCHES", m:["............","..xx....xx..",".rrrr..rrrr.","rr..rrrr..rr","oo..oooo..oo","yy..yyyy..yy","gg..gggg..gg","ssssssssssss"]},
    {n:"THE PALLETS", m:["pp.pp..pp.pp","pp.pp..pp.pp","............",".bb.bb.bb.bb",".bb.bb.bb.bb","............","cc.cc..cc.cc","sc.cs..sc.cs","............","xx........xx"]},
    {n:"THE KILN", m:["...ssssss...","..srrrrrrs..","..srrrrrrs..",".soooooooos.",".soyyyyyyos.",".soyggggyos.",".soyyyyyyos.",".soooooooos.","..ssssssss..","....x..x...."]},
    {n:"THE CHECKER", m:["rsrsrsrsrsrs","srsrsrsrsrsr","oyoyoyoyoyoy","yoyoyoyoyoyo","gcgcgcgcgcgc","cgcgcgcgcgcg","bpbpbpbpbpbp","pbpbpbpbpbpb"]},
    {n:"THE RAMPART", m:["x.x.x..x.x.x","s.s.s..s.s.s","rrrrrrrrrrrr","rrrrrrrrrrrr","oooo....oooo","oooo....oooo","yyyyyyyyyyyy","xxx......xxx"]},
    {n:"THE HARD HAT", m:["....yyyy....","..yyyyyyyy..",".yyyyyyyyyy.",".yyyyyyyyyy.","ssssssssssss","..wwwwwwww..","..wbwwwwbw..","..wwwwwwww..","..wwrrrrww..","...wwwwww..."]}];
  // the capsules: what they say, their colour, how often they come
  const CAP={W:["#3a62e8",20], S:["#e8862a",18], T:["#3aa84a",15], G:["#2ab8c8",15], Z:["#d8402a",15], "+":["#b0b4bc",6], K:["#b050d8",5]};
  const CAPN={W:"WIDE", S:"SLOW", T:"THREE BALLS", G:"GLUE", Z:"ZAPPER", "+":"ANOTHER BAT", K:"NEXT ROUND"};
  const pickCap=()=>{ let r=Math.random()*94; for(const k in CAP){ r-=CAP[k][1]; if(r<0) return k; } return "W"; };
  function setRound(G, n){
    const R=ROUNDS[(n-1)%ROUNDS.length], lap=Math.floor((n-1)/ROUNDS.length);
    G.round=n; G.rname=R.n; G.bricks=[]; G.caps=[]; G.bolts=[]; G.birds=[]; G.birdT=14; G.puffs=[];
    R.m.forEach((row, r)=>{ for(let c=0;c<COLS;c++){ const ch=row[c]; if(!ch || ch===".") continue;
      G.bricks.push({c:c, r:r, k:ch, hp:ch==="s" ? 2+Math.floor((n-1)/4)+lap : ch==="x" ? 1e9 : 1, flash:0}); } });
    G.left=G.bricks.filter(b=>b.k!=="x").length;
    G.base=150*(1+0.12*lap); serve(G); }
  function serve(G){ G.balls=[{x:0, y:BAT_Y-BR-0.5, vx:0, vy:0, stuck:BAT_W/2+4, st:true}]; G.power=""; G.bw=BAT_W; G.phase="ready"; G.pt=2.0; G.glueT=0; G.sp=G.base; }
  const batW=G=>G.power==="W" ? BAT_WW : BAT_W;
  function launch(G){ for(const b of G.balls) if(b.st){ const u=clamp(b.stuck/(batW(G)/2)-1, -0.9, 0.9), a=u*1.0;
      b.vx=Math.sin(a)*G.sp; b.vy=-Math.cos(a)*G.sp; b.st=false; } G.glueT=0; }
  const brickAt=(G, c, r)=>G.bricks.find(b=>b.c===c && b.r===r);
  function hitBrick(G, b, i){
    if(b.k==="x"){ b.flash=0.15; _cbSnd(i, "wall"); return; }
    b.hp--; b.flash=0.12;
    if(b.hp>0){ _cbSnd(i, "wall"); return; }
    G.bricks.splice(G.bricks.indexOf(b), 1); G.left--; G.score+=b.k==="s" ? 50*G.round : KB[b.k][3]; _cbSnd(i, "brick");
    G.sp=Math.min(G.base*2.0, G.sp*1.012);
    if(!G.caps.length && G.balls.length===1 && Math.random()<0.17) G.caps.push({x:FX0+b.c*BW+BW/2, y:BY0+b.r*BH+BH/2, k:pickCap()});
    if(G.left<=0){ G.phase="clear"; G.pt=2.2; G.score+=500*G.round; _cbSnd(i, "jingle"); }
  }
  // one small step of a ball: the walls, the bat, the bricks, the birds
  function moveBall(G, b, h, i){
    if(b.st){ b.x=G.px+b.stuck; b.y=BAT_Y-BR-0.5; return true; }
    const ox=b.x, oy=b.y; b.x+=b.vx*h; b.y+=b.vy*h;
    if(b.x<FX0+BR){ b.x=FX0+BR; b.vx=Math.abs(b.vx); _cbSnd(i, "wall"); }
    if(b.x>FX1-BR){ b.x=FX1-BR; b.vx=-Math.abs(b.vx); _cbSnd(i, "wall"); }
    if(b.y<FY0+BR){ b.y=FY0+BR; b.vy=Math.abs(b.vy); _cbSnd(i, "wall"); }
    // the bat: off it at an angle by where it met it, up to sixty degrees either way
    const w=batW(G);
    if(b.vy>0 && b.y+BR>=BAT_Y && oy+BR<=BAT_Y+2 && b.x>G.px-BR && b.x<G.px+w+BR){
      const u=clamp((b.x-G.px)/w*2-1, -1, 1), a=u*1.05, sp=Math.hypot(b.vx, b.vy);
      b.vx=Math.sin(a)*sp; b.vy=-Math.cos(a)*sp; b.y=BAT_Y-BR; _cbSnd(i, "paddle");
      if(G.power==="G"){ b.st=true; b.stuck=b.x-G.px; G.glueT=2.5; } }
    if(b.y>H+6) return false;
    // the bricks: whichever it is in, back out the way it came on the axis it crossed
    const c=Math.floor((b.x-FX0)/BW), r=Math.floor((b.y-BY0)/BH);
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const k=brickAt(G, c+dc, r+dr); if(!k) continue;
      const x0=FX0+k.c*BW, y0=BY0+k.r*BH, x1=x0+BW, y1=y0+BH;
      const nx=clamp(b.x, x0, x1), ny=clamp(b.y, y0, y1); if((b.x-nx)**2+(b.y-ny)**2>BR*BR) continue;
      const inX=ox>x0-BR && ox<x1+BR, inY=oy>y0-BR && oy<y1+BR;
      if(inX && !inY) b.vy=-b.vy; else if(inY && !inX) b.vx=-b.vx; else { b.vx=-b.vx; b.vy=-b.vy; }
      b.x=ox; b.y=oy; hitBrick(G, k, i);
      // (never too flat: it would go on side to side for ever)
      const sp=Math.hypot(b.vx, b.vy); if(Math.abs(b.vy)<sp*0.28){ b.vy=Math.sign(b.vy||-1)*sp*0.28; b.vx=Math.sign(b.vx)*Math.sqrt(sp*sp-b.vy*b.vy); }
      return true; }
    for(const d of G.birds) if(!d.dead && Math.hypot(b.x-d.x, b.y-d.y)<8){ d.dead=true; G.score+=100; b.vy=-b.vy; G.puffs.push({x:d.x, y:d.y, t:0}); _cbSnd(i, "pellet"); }
    // and its speed what the game's is now
    const sp=Math.hypot(b.vx, b.vy); if(sp>0){ const k=G.sp/sp; b.vx*=k; b.vy*=k; }
    return true;
  }
  function frame(G, h, K, i){
    // the bat
    const mv=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), w=batW(G);
    G.px=clamp(G.px+mv*250*h, FX0, FX1-w);
    if(G.phase==="ready"){ for(const b of G.balls) moveBall(G, b, h, i); G.pt-=h; if(G.pt<=0){ G.phase="play"; launch(G); } return; }
    if(G.phase==="clear"){ G.pt-=h; if(G.pt<=0) setRound(G, G.round+1); return; }
    if(G.phase==="lost"){ G.pt-=h; if(G.pt<=0){ if(G.lives<=0){ G.over=true; G.phase="over"; } else serve(G); } return; }
    // the balls
    if(G.glueT>0){ G.glueT-=h; if(G.glueT<=0) launch(G); }
    G.balls=G.balls.filter(b=>moveBall(G, b, h, i));
    if(G.phase!=="play") return;
    if(!G.balls.length){ G.lives--; G.power=""; G.phase="lost"; G.pt=1.4; G.caps=[]; G.bolts=[]; _cbSnd(i, "boom"); return; }
    // the capsules, down to the bat
    for(const p of G.caps) p.y+=55*h;
    G.caps=G.caps.filter(p=>{ if(p.y>BAT_Y-3 && p.y<BAT_Y+BAT_H+3 && p.x>G.px-4 && p.x<G.px+batW(G)+4){ take(G, p.k, i); return false; } return p.y<H+6; });
    // the zapper's bolts
    if(G.zapT>0) G.zapT-=h;
    for(const z of G.bolts){ z.y-=320*h; const c=Math.floor((z.x-FX0)/BW), r=Math.floor((z.y-BY0)/BH), k=brickAt(G, c, r);
      if(k){ z.dead=true; hitBrick(G, k, i); } else if(z.y<FY0) z.dead=true;
      for(const d of G.birds) if(!d.dead && Math.abs(z.x-d.x)<6 && Math.abs(z.y-d.y)<6){ d.dead=true; z.dead=true; G.score+=100; G.puffs.push({x:d.x, y:d.y, t:0}); } }
    G.bolts=G.bolts.filter(z=>!z.dead);
    // the pigeons: in from the top now and then, wandering down, gone past the bat
    G.birdT-=h; if(G.birdT<=0 && G.birds.filter(d=>!d.dead).length<2){ G.birdT=10+Math.random()*8; G.birds.push({x:FX0+30+Math.random()*(FX1-FX0-60), y:FY0+4, t:Math.random()*6, dead:false}); }
    for(const d of G.birds){ d.t+=h; d.y+=11*h; d.x=clamp(d.x+Math.sin(d.t*1.7)*36*h, FX0+6, FX1-6);
      if(d.y>BAT_Y-6 && d.x>G.px-5 && d.x<G.px+batW(G)+5 && !d.dead){ d.dead=true; G.score+=100; G.puffs.push({x:d.x, y:d.y, t:0}); }
      if(d.y>BAT_Y) d.dead=true; }
    G.birds=G.birds.filter(d=>!d.dead);
    for(const p of G.puffs) p.t+=h; G.puffs=G.puffs.filter(p=>p.t<0.5);
    for(const b of G.bricks) if(b.flash>0) b.flash-=h;
  }
  function take(G, k, i){
    G.score+=50; _cbSnd(i, "pellet"); G.say=CAPN[k]; G.sayT=1.4;
    if(k==="+"){ G.lives++; return; }
    if(k==="K"){ G.phase="clear"; G.pt=1.2; G.score+=500*G.round; _cbSnd(i, "jingle"); return; }
    if(k==="S"){ G.sp=G.base*0.8; for(const b of G.balls){ const s=Math.hypot(b.vx, b.vy)||1; b.vx*=G.sp/s; b.vy*=G.sp/s; } return; }
    if(k==="T"){ const b=G.balls[0]; if(b && !b.st){ const s=Math.hypot(b.vx, b.vy), a=Math.atan2(b.vx, -b.vy);
        for(const da of [-0.35, 0.35]) G.balls.push({x:b.x, y:b.y, vx:Math.sin(a+da)*s, vy:-Math.abs(Math.cos(a+da)*s), st:false}); } return; }
    // wide, glue and the zapper: one at a time
    if(G.power==="G") launch(G);
    G.power=k; if(k==="W") G.px=clamp(G.px-(BAT_WW-BAT_W)/2, FX0, FX1-BAT_WW);
  }
  // the pictures
  function brick(x, px, py, k, flash, hp){
    const c=KB[k]; x.fillStyle=flash>0 ? "#ffffff" : c[0]; x.fillRect(px+0.5, py+0.5, BW-1, BH-1);
    if(flash>0) return;
    x.fillStyle=c[1]; x.fillRect(px+0.5, py+0.5, BW-1, 1.5); x.fillStyle=c[2]; x.fillRect(px+0.5, py+BH-2, BW-1, 1.5);
    if(k==="x"){ x.fillStyle=c[2]; x.fillRect(px+3, py+3.5, 2, 2); x.fillRect(px+BW-5, py+3.5, 2, 2); }
    else if(k==="s"){ x.fillStyle="rgba(255,255,255,0.35)"; x.fillRect(px+3, py+2, 4, BH-4); if(hp>1){ x.fillStyle=c[2]; x.fillRect(px+BW-6, py+3, 3, 3); } }
    else { x.fillStyle="rgba(0,0,0,0.18)"; x.fillRect(px+BW/2, py+2, 1, BH-4); } }
  function bat(x, px, w, power, t){
    x.fillStyle="#2a2a30"; x.fillRect(px, BAT_Y, w, BAT_H);
    for(let k=0;k<w;k+=8){ x.fillStyle=((k/8)|0)%2 ? "#f2f2f2" : "#e8662a"; x.fillRect(px+k+1, BAT_Y+1, Math.min(6, w-k-2), BAT_H-2); }
    if(power==="Z"){ x.fillStyle=((t*6)|0)%2 ? "#ff3a2a" : "#ffb0a0"; x.fillRect(px-1, BAT_Y-3, 3, 3); x.fillRect(px+w-2, BAT_Y-3, 3, 3); }
    if(power==="G"){ x.fillStyle="#7ae8f0"; x.fillRect(px+2, BAT_Y-1, w-4, 1); } }
  const ball=(x, bx, by)=>{ x.fillStyle="#e8f6ff"; x.beginPath(); x.arc(bx, by, BR, 0, Math.PI*2); x.fill(); x.fillStyle="#7ac8ff"; x.fillRect(bx-0.5, by, 1.5, 1.5); };
  function bird(x, d, t){ const f=Math.sin(t*14+d.t*3)>0;
    x.fillStyle="#8a8e98"; x.beginPath(); x.ellipse(d.x, d.y, 4, 3, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#5e626c"; x.fillRect(d.x-7, d.y+(f?-3:0), 5, 2); x.fillRect(d.x+2, d.y+(f?-3:0), 5, 2);
    x.fillStyle="#3aa86a"; x.fillRect(d.x-1, d.y-3, 2, 1.5); x.fillStyle="#f2a030"; x.fillRect(d.x-0.5, d.y+2.5, 1, 1.5); }
  function backdrop(x){
    x.fillStyle="#140a08"; x.fillRect(0, 0, W, H);
    x.fillStyle="#1e0f0c"; for(let r=0;r<H/8;r++) for(let c=-1;c<W/16;c++) x.fillRect(c*16+(r%2)*8+1, r*8+1, 14, 6);
    x.fillStyle="#08080c"; x.fillRect(FX0, FY0, FX1-FX0, H-FY0);
    x.fillStyle="#6a6e78"; x.fillRect(FX0-4, FY0-4, 4, H-FY0+4); x.fillRect(FX1, FY0-4, 4, H-FY0+4); x.fillRect(FX0-4, FY0-4, FX1-FX0+8, 4);
    x.fillStyle="#9aa0aa"; x.fillRect(FX0-4, FY0-4, FX1-FX0+8, 1); }
  return {
    name:"BRICKYARD BREAKOUT", col:"#ffb070",
    help:"BRICKYARD BREAKOUT · A/D, ARROWS OR THE MOUSE MOVE THE BAT · SPACE SERVES AND FIRES · P PAUSES · ESC TO STEP AWAY",
    newGame(){ const G={score:0, lives:3, over:false, won:false, acc:0, px:(FX0+FX1-BAT_W)/2, paused:false, zapT:0, say:"", sayT:0, saved:false};
      setRound(G, 1); return G; },
    key(G, e){
      if(e.code==="KeyP" && !e.repeat){ G.paused=!G.paused; return; }
      if(e.code==="Space" && !e.repeat && !G.paused){
        if(G.phase==="ready"){ G.phase="play"; launch(G); return; }
        if(G.balls.some(b=>b.st)){ launch(G); return; }
        if(G.power==="Z" && G.zapT<=0 && G.phase==="play" && G.bolts.length<4){ const w=batW(G); G.bolts.push({x:G.px+1, y:BAT_Y-3}, {x:G.px+w-1, y:BAT_Y-3}); G.zapT=0.28; _cbSnd(2, "zap"); } } },
    mouse(G, dx){ if(!G.over && !G.paused) G.px=clamp(G.px+dx*0.5, FX0, FX1-batW(G)); },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), 0]; },
    step(G, dt, K, i){
      if(G.over || G.paused) return;
      if(G.sayT>0) G.sayT-=dt;
      G.acc+=dt; while(G.acc>=1/240){ G.acc-=1/240; frame(G, 1/240, K, i); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("brickyard", G.score, "RD "+G.round); } },
    draw(x, G, t){
      backdrop(x);
      for(const b of G.bricks) brick(x, FX0+b.c*BW, BY0+b.r*BH, b.k, b.flash, b.hp);
      for(const p of G.caps){ const c=CAP[p.k][0]; x.fillStyle=c; x.fillRect(p.x-7, p.y-3, 14, 7); x.fillStyle="rgba(255,255,255,0.4)"; x.fillRect(p.x-7, p.y-3, 14, 2);
        x.fillStyle="#ffffff"; x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 7); x.fillText(p.k, p.x, p.y+0.5); }
      x.fillStyle="#ff6a4a"; for(const z of G.bolts) x.fillRect(z.x-0.5, z.y-4, 1.5, 6);
      for(const d of G.birds) bird(x, d, t);
      for(const p of G.puffs){ x.fillStyle="rgba(220,220,230,"+(1-p.t*2).toFixed(2)+")"; for(let k=0;k<5;k++) x.fillRect(p.x+Math.cos(k*1.3)*p.t*20, p.y+Math.sin(k*1.3)*p.t*20, 2, 2); }
      bat(x, G.px, batW(G), G.power, t);
      if(!(G.phase==="lost" && ((t*8)|0)%2)) for(const b of G.balls) ball(x, b.x, b.y);
      // the side: the score, the best, the round, the bats left, what you have
      const SX=(FX1+4+W)/2; x.textAlign="center"; x.textBaseline="middle";
      _cbFont(x, 11); x.fillStyle="#d8402a"; x.fillText("SCORE", SX, 32); x.fillText("HIGH", SX, 78); x.fillText("ROUND", SX, 124); x.fillText("BATS", SX, 170);
      _cbFont(x, 13); x.fillStyle="#f4f0e8"; x.fillText(String(G.score).padStart(6, "0"), SX, 50);
      x.fillText(String(Math.max(G.score, CABS.hi[2]||0)).padStart(6, "0"), SX, 96); x.fillText(String(G.round), SX, 142);
      for(let k=0;k<Math.min(G.lives, 5);k++){ x.fillStyle="#e8662a"; x.fillRect(SX-40+k*17, 184, 14, 4); }
      if(G.power){ _cbFont(x, 10); x.fillStyle=CAP[G.power][0]; x.fillText(CAPN[G.power], SX, 214); }
      if(G.sayT>0){ _cbFont(x, 10); x.fillStyle="#f2e23a"; x.fillText(G.say, SX, 236); }
      if(G.over) _cbMid(x, "GAME OVER", "SPACE TO PLAY AGAIN");
      else if(G.paused) _cbMid(x, "PAUSED", "P TO PLAY ON");
      else if(G.phase==="ready") _cbMid(x, "ROUND "+G.round, G.rname+"  ·  "+(G.pt>1.4 ? "READY" : String(Math.ceil(G.pt/0.5))));
      else if(G.phase==="clear") _cbMid(x, "ROUND "+G.round+" CLEARED", "+"+(500*G.round));
      else if(G.phase==="lost") _cbMid(x, G.lives>0 ? "BATS: "+G.lives : "LAST BAT GONE");
      _cbTube(x); },
    // the attract mode: the name in brick, a round being worked at, then the best scores
    attract(x, t, i){
      x.fillStyle="#140a08"; x.fillRect(0, 0, W, H);
      x.fillStyle="#1e0f0c"; for(let r=0;r<H/8;r++) for(let c=-1;c<W/16;c++) x.fillRect(c*16+(r%2)*8+1, r*8+1, 14, 6);
      x.fillStyle="rgba(8,8,12,0.82)"; x.fillRect(24, 20, W-48, H-40);
      const ph=((t/7)|0)%2, AX=(W-COLS*BW)/2;
      if(ph===0){
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 24);
        x.fillStyle="#e8662a"; x.fillText("BRICKYARD", W/2, 52); x.fillStyle="#e8f0ff"; x.fillText("BREAKOUT", W/2, 80);
        const R=ROUNDS[((t/14)|0)%ROUNDS.length], gone=((t*3)|0)%60;
        R.m.forEach((row, r)=>{ for(let c=0;c<COLS;c++){ const ch=row[c]; if(ch && ch!=="." && (c*7+r*5)%60>gone) brick(x, AX+c*BW, 100+r*BH, ch, 0, 1); } });
        const u=(t*0.41)%2, v=(t*0.6)%2, bx=AX+BR+(COLS*BW-2*BR)*(u<1?u:2-u), by=200+30*(v<1?v:2-v);
        ball(x, bx, by); bat(x, clamp(bx-BAT_W/2, AX, AX+COLS*BW-BAT_W), BAT_W, "", t);
      } else _cbTopDraw(x, "brickyard", 60, "#e8662a");
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ======================================================================
   GROUNDHOG GULCH
   ====================================================================== */
const _GG=(function(){
  const W=_CB.W, H=_CB.H, TS=16, NC=18, NR=14, X0=(W-NC*TS)/2, Y0=44;     // tiles; row 0 the surface, 1.. the ground
  const LAYER=[["#8a5a2e","#a06c3a","#6a4422"],["#b8642a","#cc7a3a","#8a4a1e"],["#6a6a6e","#82828a","#4a4a50"],["#26221e","#3a342e","#141210"]];
  const layerOf=r=>r<=3 ? 0 : r<=6 ? 1 : r<=9 ? 2 : 3, PTS=[200, 300, 400, 500];
  const px=c=>X0+c*TS+TS/2, py=r=>Y0+r*TS+TS/2;
  const key=(c, r)=>r*NC+c;
  // the ground, drawn once a level, the tunnels cut out of it as they are dug
  function paintDirt(G){
    const c=G.dirtC=G.dirtC||cvs(NC*TS, NR*TS), x=c.getContext("2d"); x.clearRect(0, 0, c.width, c.height);
    for(let r=1;r<NR;r++){ const L=LAYER[layerOf(r)]; x.fillStyle=L[0]; x.fillRect(0, r*TS, NC*TS, TS);
      for(let k=0;k<26;k++){ x.fillStyle=Math.random()<0.5 ? L[1] : L[2]; x.fillRect(Math.random()*NC*TS, r*TS+Math.random()*TS, 2, 2); } }
    x.fillStyle="#3a8a2a"; x.fillRect(0, TS-3, NC*TS, 3);
  }
  function carve(G, fx, fy){ const x=G.dirtC.getContext("2d"); x.save(); x.globalCompositeOperation="destination-out";
    x.fillStyle="#000"; x.beginPath(); x.arc(fx*TS+TS/2, fy*TS+TS/2, TS*0.48, 0, Math.PI*2); x.fill(); x.restore(); }
  const dug=(G, c, r)=>r===0 || G.dug.has(key(c, r));
  const linked=(G, a, b)=>{ const ra=(a/NC)|0, rb=(b/NC)|0; if(ra===0 && rb===0) return true; return G.link.has(Math.min(a,b)+":"+Math.max(a,b)); };
  function dig(G, c, r){ if(r<=0 || G.dug.has(key(c, r))) return; G.dug.add(key(c, r)); }
  function link(G, c0, r0, c1, r1){ G.link.add(Math.min(key(c0,r0), key(c1,r1))+":"+Math.max(key(c0,r0), key(c1,r1))); }
  function level(G, n){
    G.lvl=n; G.dug=new Set(); G.link=new Set(); G.scored=new Set(); paintDirt(G);
    G.p={fx:1, fy:0, d:[1,0], want:null, hose:0, hoseOut:false, latch:null, pumpT:0, dead:0, walk:0};
    G.foes=[]; G.rocks=[]; G.clouds=[]; G.pops=[]; G.msgT=1.8; G.dropped=0;
    // pockets: a short tunnel each, apart from one another and from where you start, someone in each
    const nb=Math.min(3+n, 7), nk=Math.min(1+((n/2)|0), 3), taken=[];
    for(let k=0;k<nb+nk;k++){
      let c, r, horiz, ok=false;
      for(let tr=0;tr<60 && !ok;tr++){ horiz=Math.random()<0.6; c=2+((Math.random()*(NC-6))|0); r=3+((Math.random()*(NR-5))|0);
        ok=!taken.some(t=>Math.abs(t[0]-c)<5 && Math.abs(t[1]-r)<3) && !(c<5 && r<5); }
      taken.push([c, r]);
      for(let j=0;j<3;j++){ const cc=horiz ? c+j : c, rr=horiz ? r : r+j-1; dig(G, cc, rr);
        if(j) link(G, horiz ? cc-1 : cc, horiz ? rr : rr-1, cc, rr); }
      for(let u=0;u<=2;u+=0.25) carve(G, horiz ? c+u : c, horiz ? r : r-1+u);
      const cc=horiz ? c+1 : c, rr=r;
      G.foes.push({kind:k<nb ? "beetle" : "skunk", fx:cc, fy:rr, hx:cc, hy:rr, tc:cc, tr:rr, d:[horiz?1:0, horiz?0:1], st:"walk", pump:0, defT:0,
        ghostT:6+Math.random()*8-n*0.4, sprayT:4+Math.random()*5, t:Math.random()*5, sp:(k<nb ? 1.9 : 1.6)*(1+n*0.05)});
    }
    // rocks: in solid ground with solid ground under them, not over a pocket
    for(let k=0;k<3+Math.min(n, 3);k++){ for(let tr=0;tr<40;tr++){ const c=1+((Math.random()*(NC-2))|0), r=2+((Math.random()*(NR-5))|0);
      if(dug(G, c, r) || dug(G, c, r+1) || G.rocks.some(q=>Math.abs(q.c-c)<2 && Math.abs(q.r-r)<2) || (c<4 && r<4)) continue;
      G.rocks.push({c:c, r:r, fy:r, st:"still", t:0, kill:0}); break; } }
  }
  function die(G, i, why){ if(G.p.dead>0) return; G.p.dead=1.6; G.why=why; G.p.latch=null; G.p.hose=0; _cbSnd(i, "die"); }
  // the groundhog: along the row or the column it is on, turning only where the lines cross; digging as it goes
  function moveP(G, h, K, i){
    const p=G.p; if(p.dead>0 || p.latch) return;
    const want=K.ArrowLeft||K.KeyA ? [-1,0] : K.ArrowRight||K.KeyD ? [1,0] : K.ArrowUp||K.KeyW ? [0,-1] : K.ArrowDown||K.KeyS ? [0,1] : null;
    if(!want){ p.walk=0; return; }
    const sp=3.0*h; let d=want;
    const onRow=Math.abs(p.fy-Math.round(p.fy))<0.02, onCol=Math.abs(p.fx-Math.round(p.fx))<0.02;
    // a turn: keep on the way it was going till it is on the line it wants
    if(d[0] && !onRow){ d=[0, Math.sign(Math.round(p.fy+p.d[1]*0.49)-p.fy)||p.d[1]||1]; }
    else if(d[1] && !onCol){ d=[Math.sign(Math.round(p.fx+p.d[0]*0.49)-p.fx)||p.d[0]||1, 0]; }
    if(onRow && d[0]) p.fy=Math.round(p.fy); if(onCol && d[1]) p.fx=Math.round(p.fx);
    let nx=clamp(p.fx+d[0]*sp, 0, NC-1), ny=clamp(p.fy+d[1]*sp, 0, NR-1);
    // a rock in the way stops it
    const tc=Math.round(nx+d[0]*0.45), tr=Math.round(ny+d[1]*0.45);
    if(G.rocks.some(q=>q.st!=="gone" && q.c===tc && Math.round(q.fy)===tr && (tc!==Math.round(p.fx) || tr!==Math.round(p.fy)))) return;
    const c0=Math.round(p.fx), r0=Math.round(p.fy);
    p.fx=nx; p.fy=ny; p.d=d; p.walk+=h;
    const c1=Math.round(p.fx), r1=Math.round(p.fy);
    carve(G, p.fx, p.fy); dig(G, c1, r1);
    if(c1!==c0 || r1!==r0){ link(G, c0, r0, c1, r1); if(r1>0 && !G.scored.has(key(c1, r1))){ G.scored.add(key(c1, r1)); G.score+=10; } }
  }
  // the hose: along the tunnel the way it faces, till it meets dirt or one of them
  function hose(G, h, i){
    const p=G.p;
    if(p.latch){ const f=p.latch; if(f.st!=="pumped"){ p.latch=null; p.hose=0; return; } p.pumpT-=h; return; }
    if(!p.hoseOut){ p.hose=Math.max(0, p.hose-h*14); return; }
    p.hose+=h*12;
    const ex=p.fx+p.d[0]*p.hose, ey=p.fy+p.d[1]*p.hose, c=Math.round(ex), r=Math.round(ey);
    const back=key(Math.round(ex-p.d[0]*0.5), Math.round(ey-p.d[1]*0.5)), here=key(c, r);
    if(c<0 || c>=NC || r<0 || r>=NR || !dug(G, c, r) || (back!==here && !linked(G, back, here)) || p.hose>3.6){ p.hoseOut=false; return; }
    for(const f of G.foes) if((f.st==="walk" || f.st==="spray") && Math.hypot(f.fx-ex, f.fy-ey)<0.6){ f.st="pumped"; f.pump=1; f.defT=0.9; p.latch=f; p.hoseOut=false; p.pumpT=0.3; _cbSnd(i, "rotate"); return; }
  }
  function pump(G, i){
    const p=G.p, f=p.latch; if(!f || p.pumpT>0) return;
    f.pump++; f.defT=0.9; p.pumpT=0.28; _cbSnd(i, "rotate");
    if(f.pump>=4){ f.st="gone"; p.latch=null; p.hose=0;
      const pts=PTS[layerOf(Math.round(f.fy))]*(f.kind==="skunk" && Math.abs(f.fy-p.fy)<0.4 ? 2 : 1); G.score+=pts; G.pops.push({x:f.fx, y:f.fy, t:0, pts:pts}); _cbSnd(i, "eatghost"); }
  }
  // the neighbours a walker may go to from (c, r): dug, and the way between them dug
  const ways=(G, c, r)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>{ const c2=c+dx, r2=r+dy;
    return c2>=0 && c2<NC && r2>=0 && r2<NR && dug(G, c2, r2) && linked(G, key(c, r), key(c2, r2)) && !G.rocks.some(q=>q.st!=="gone" && q.c===c2 && Math.round(q.fy)===r2); });
  function moveFoe(G, f, h, i){
    const p=G.p; f.t+=h;
    if(f.st==="pumped"){ f.defT-=h; if(f.defT<=0){ f.pump--; f.defT=0.9; if(f.pump<=0){ f.st="walk"; if(p.latch===f) p.latch=null; } } return; }
    if(f.st==="spray"){ f.sprayT-=h; if(f.sprayT<=0){ f.st="walk"; f.sprayT=5+Math.random()*4; } return; }
    if(f.st==="ghost"){
      // through the dirt toward you; out again into the first tunnel it meets after a while
      const dx=p.fx-f.fx, dy=p.fy-f.fy, d=Math.hypot(dx, dy)||1; f.fx+=dx/d*h*1.25; f.fy+=dy/d*h*1.25; f.gt+=h;
      const c=Math.round(f.fx), r=Math.round(f.fy);
      if(f.gt>2.2 && r>0 && dug(G, c, r) && Math.hypot(f.fx-c, f.fy-r)<0.15){ f.fx=c; f.fy=r; f.tc=c; f.tr=r; f.st="walk"; f.ghostT=7+Math.random()*7-G.lvl*0.4; }
      return; }
    // walking: on to the next tile, then a choice there, more often toward you than not
    const tx=f.tc, ty=f.tr, dx=tx-f.fx, dy=ty-f.fy, d=Math.hypot(dx, dy);
    if(d>0.001){ const s=Math.min(d, f.sp*h); f.fx+=dx/d*s; f.fy+=dy/d*s; return; }
    const W2=ways(G, tx, ty);
    let opts=W2.filter(([a,b])=>!(a===-f.d[0] && b===-f.d[1])); if(!opts.length) opts=W2;
    f.ghostT-=h*4;
    if(!opts.length || f.ghostT<=0){ if(f.ghostT<=0){ f.st="ghost"; f.gt=0; } return; }
    let pick=opts[(Math.random()*opts.length)|0];
    if(Math.random()<0.65){ let best=1e9; for(const o of opts){ const dd=Math.hypot(tx+o[0]-p.fx, ty+o[1]-p.fy); if(dd<best){ best=dd; pick=o; } } }
    f.d=pick; f.tc=tx+pick[0]; f.tr=ty+pick[1];
    // a skunk, level with you and facing you near enough, lets fly
    if(f.kind==="skunk"){ f.sprayT-=h*6;
      if(f.sprayT<=0 || (Math.abs(p.fy-ty)<0.3 && Math.abs(p.fx-tx)<4 && Math.sign(p.fx-tx)===f.d[0] && Math.random()<0.4)){
        f.st="spray"; f.sprayT=1.0; f.tc=tx; f.tr=ty; f.d=[Math.sign(p.fx-tx)||1, 0]; G.clouds.push({c:tx, r:ty, dir:f.d[0], t:0}); _cbSnd(i, "static"); } }
  }
  function frame(G, h, K, i){
    const p=G.p;
    if(G.msgT>0){ G.msgT-=h; return; }
    if(G.clearT>0){ G.clearT-=h; if(G.clearT<=0) level(G, G.lvl+1); return; }
    if(p.dead>0){ p.dead-=h;
      if(p.dead<=0){ G.lives--; if(G.lives<=0){ G.over=true; return; }
        p.fx=1; p.fy=0; p.d=[1,0]; G.msgT=1.0; for(const f of G.foes) if(f.st!=="gone"){ f.fx=f.hx; f.fy=f.hy; f.tc=f.hx; f.tr=f.hy; f.st="walk"; f.pump=0; } G.clouds=[]; }
      return; }
    moveP(G, h, K, i);
    if(K.Space && G.p.latch) pump(G, i);
    hose(G, h, i);
    for(const f of G.foes) if(f.st!=="gone") moveFoe(G, f, h, i);
    // the stink, and anything that touches you
    for(const c of G.clouds){ c.t+=h; const reach=Math.min(3, c.t*6);
      if(Math.abs(p.fy-c.r)<0.5 && (p.fx-c.c)*c.dir>-0.3 && (p.fx-c.c)*c.dir<reach+0.3) die(G, i, "SKUNKED"); }
    G.clouds=G.clouds.filter(c=>c.t<1.0);
    for(const f of G.foes) if((f.st==="walk" || f.st==="ghost" || f.st==="spray") && Math.hypot(f.fx-p.fx, f.fy-p.fy)<0.65) die(G, i, f.kind==="skunk" ? "GOT BY A SKUNK" : "BITTEN");
    // rocks: undermined, they rock a moment and drop; whatever they land on is done for
    for(const q of G.rocks){
      if(q.st==="still" && dug(G, q.c, q.r+1) && !(Math.abs(p.fx-q.c)<0.4 && p.fy>q.r && p.fy<q.r+1.4)){ q.st="wobble"; q.t=0.6; }
      else if(q.st==="wobble"){ q.t-=h; if(q.t<=0){ q.st="fall"; _cbSnd(i, "lock"); } }
      else if(q.st==="fall"){ q.fy+=h*6;
        for(const f of G.foes) if(f.st!=="gone" && Math.abs(f.fx-q.c)<0.6 && Math.abs(f.fy-q.fy)<0.7){ f.st="gone"; q.kill++; G.pops.push({x:f.fx, y:f.fy, t:0, pts:0, rock:true}); if(p.latch===f) p.latch=null; }
        if(Math.abs(p.fx-q.c)<0.6 && Math.abs(p.fy-q.fy)<0.7) die(G, i, "UNDER A ROCK");
        const below=Math.floor(q.fy)+1;
        if(below>=NR || (!dug(G, q.c, below) && q.fy>=Math.floor(q.fy))){ if(below>=NR || q.fy-Math.floor(q.fy)<0.2){ q.st="gone"; q.t=0.5; G.dropped++;
          if(q.kill){ const pts=[0,1000,2500,4000,6000][Math.min(4, q.kill)]; G.score+=pts; G.pops.push({x:q.c, y:q.fy, t:0, pts:pts}); } _cbSnd(i, "boom"); } } }
      else if(q.st==="gone" && q.t>0) q.t-=h; }
    for(const o of G.pops) o.t+=h; G.pops=G.pops.filter(o=>o.t<1.0);
    if(!G.foes.some(f=>f.st!=="gone") && !G.clearT){ G.clearT=2.0; G.score+=1000*G.lvl; _cbSnd(i, "jingle"); }
  }
  // the pictures
  function hog(x, cx, cy, d, t, walk){
    const s=d[0]<0 ? -1 : 1, bob=walk>0 ? Math.sin(t*18)*0.8 : 0;
    x.save(); x.translate(cx, cy+bob); if(d[1]) x.rotate(d[1]*Math.PI/2*s); x.scale(s, 1);
    x.fillStyle="#8a5a2a"; x.beginPath(); x.ellipse(0, 0, 7, 6, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#c8945a"; x.beginPath(); x.ellipse(2, 1.5, 4, 3.5, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#6a4220"; x.fillRect(-2, -6.5, 2.5, 2); x.fillRect(-6, 3, 3, 3); x.fillRect(2, 4.5, 3, 2);
    x.fillStyle="#1a1008"; x.fillRect(3, -2.5, 1.5, 1.5); x.fillRect(6, -0.5, 1.5, 1.2);
    x.fillStyle="#fff6e0"; x.fillRect(5.2, 1.2, 1.4, 2.2); x.restore(); }
  function beetle(x, cx, cy, d, t, sc){
    x.save(); x.translate(cx, cy); x.rotate(Math.atan2(d[1], d[0])); x.scale(sc||1, sc||1);
    x.strokeStyle="#1a0a08"; x.lineWidth=1; for(const k of [-3, 0, 3]){ const w=Math.sin(t*16+k)*1.2; x.beginPath(); x.moveTo(k, -4); x.lineTo(k+w, -7); x.moveTo(k, 4); x.lineTo(k-w, 7); x.stroke(); }
    x.fillStyle="#a8241a"; x.beginPath(); x.ellipse(0, 0, 6, 4.8, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#1a0a08"; x.fillRect(-6, -0.4, 12, 0.8); x.beginPath(); x.arc(6, 0, 2.6, 0, Math.PI*2); x.fill();
    x.fillStyle="#ffd8a0"; x.fillRect(-2, -3, 1.5, 1.5); x.fillRect(1, 2, 1.5, 1.5);
    x.strokeStyle="#1a0a08"; x.beginPath(); x.moveTo(8, -1); x.lineTo(11, -4); x.moveTo(8, 1); x.lineTo(11, 4); x.stroke(); x.restore(); }
  function skunk(x, cx, cy, d, t, sc){
    const s=d[0]<0 ? -1 : 1; x.save(); x.translate(cx, cy); x.scale(s*(sc||1), sc||1);
    x.fillStyle="#14141a"; x.beginPath(); x.ellipse(-6, -3, 4.5, 5, -0.5, 0, Math.PI*2); x.fill();
    x.beginPath(); x.ellipse(0, 1, 6.5, 4.2, 0, 0, Math.PI*2); x.fill(); x.beginPath(); x.arc(6, 0.5, 3, 0, Math.PI*2); x.fill();
    x.fillStyle="#f4f4f4"; x.fillRect(-6, -2.5, 12, 1.6); x.fillRect(-8, -7, 1.6, 6); x.fillRect(7, -1.5, 1.5, 1);
    x.fillStyle="#ff8aa0"; x.fillRect(8.4, 0.6, 1, 1); x.fillStyle="#1a1a1a"; x.fillRect(-4+Math.sin(t*14)*0.8, 4.5, 2, 1.5); x.fillRect(3-Math.sin(t*14)*0.8, 4.5, 2, 1.5);
    x.restore(); }
  function rock(x, cx, cy, wob){
    const o=wob ? Math.sin(wob*60)*1.2 : 0;
    x.fillStyle="#8a8680"; x.beginPath(); x.moveTo(cx-7+o, cy+6); x.lineTo(cx-8+o, cy-1); x.lineTo(cx-4+o, cy-6); x.lineTo(cx+5+o, cy-6); x.lineTo(cx+8+o, cy); x.lineTo(cx+6+o, cy+6); x.closePath(); x.fill();
    x.fillStyle="#b4b0a8"; x.fillRect(cx-4+o, cy-5, 6, 2); x.strokeStyle="#4a4640"; x.beginPath(); x.moveTo(cx-2+o, cy-2); x.lineTo(cx+1+o, cy+2); x.lineTo(cx+4+o, cy+1); x.stroke(); }
  function scene(x, G, t){
    x.fillStyle="#7ab8e8"; x.fillRect(0, 22, W, Y0-22+TS); x.fillStyle="#f8e070"; x.beginPath(); x.arc(W-40, 32, 7, 0, Math.PI*2); x.fill();
    x.fillStyle="#3a7a2a"; for(let k=0;k<12;k++) x.fillRect(X0+k*25, Y0+TS-10-(k%3)*2, 3, 10);
    x.fillStyle="#0a0806"; x.fillRect(X0, Y0+TS, NC*TS, (NR-1)*TS);
    if(G && G.dirtC) x.drawImage(G.dirtC, X0, Y0);
    x.fillStyle="#1a1410"; x.fillRect(0, Y0+NR*TS, W, H-Y0-NR*TS); x.fillRect(0, Y0, X0, NR*TS); x.fillRect(X0+NC*TS, Y0, X0, NR*TS); }
  return {
    name:"GROUNDHOG GULCH", col:"#e0a050",
    help:"GROUNDHOG GULCH · ARROWS OR WASD DIG · SPACE THE HOSE, AGAIN TO FILL THEM · ESC TO STEP AWAY",
    newGame(){ const G={score:0, lives:3, over:false, won:false, acc:0, scored:new Set(), why:"", saved:false}; level(G, 1); return G; },
    key(G, e){ if(e.code==="Space" && !e.repeat && !G.over && G.p.dead<=0){ if(G.p.latch) pump(G, 4); else if(!G.p.hoseOut && G.p.hose<=0.01){ G.p.hoseOut=true; G.p.hose=0; _cbSnd(4, "zap"); } } },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=dt; while(G.acc>=1/120){ G.acc-=1/120; frame(G, 1/120, K, i); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("gulch", G.score, "GULCH "+G.lvl); } },
    draw(x, G, t){
      x.fillStyle="#0a0806"; x.fillRect(0, 0, W, H); scene(x, G, t);
      // the hose, the clouds, the rocks, them, you
      const p=G.p;
      if(p.hose>0.05 || p.latch){ const L=p.latch ? Math.hypot(p.latch.fx-p.fx, p.latch.fy-p.fy) : p.hose;
        x.strokeStyle="#3ab84a"; x.lineWidth=2; x.beginPath(); x.moveTo(px(p.fx), py(p.fy)); x.lineTo(px(p.fx+p.d[0]*L), py(p.fy+p.d[1]*L)); x.stroke();
        x.fillStyle="#9ae8ff"; x.fillRect(px(p.fx+p.d[0]*L)-1.5, py(p.fy+p.d[1]*L)-1.5, 3, 3); }
      for(const c of G.clouds){ const reach=Math.min(3, c.t*6), a=1-c.t;
        for(let k=0;k<6;k++){ const u=k/5*reach; x.fillStyle="rgba(190,210,90,"+(0.55*a).toFixed(2)+")"; x.beginPath(); x.arc(px(c.c+c.dir*u), py(c.r)+Math.sin(t*9+k)*2, 4+u*1.5, 0, Math.PI*2); x.fill(); } }
      for(const q of G.rocks){ if(q.st==="gone"){ if(q.t>0){ x.fillStyle="#8a8680"; for(let k=0;k<5;k++) x.fillRect(px(q.c)-6+k*3, py(q.fy)+4-q.t*6+k%2*3, 2, 2); } continue; }
        rock(x, px(q.c), py(q.fy), q.st==="wobble" ? q.t : 0); }
      for(const f of G.foes){ if(f.st==="gone") continue; const cx=px(f.fx), cy=py(f.fy), sc=f.st==="pumped" ? 1+f.pump*0.22 : 1;
        if(f.st==="ghost"){ const fl=((t*10)|0)%2; x.fillStyle=fl ? "#ffffff" : "#c0c0c8"; x.fillRect(cx-4, cy-2, 3, 3); x.fillRect(cx+1, cy-2, 3, 3);
          x.fillStyle="#1a1a1a"; x.fillRect(cx-3, cy-1, 1.5, 1.5); x.fillRect(cx+2, cy-1, 1.5, 1.5); continue; }
        if(f.kind==="beetle") beetle(x, cx, cy, f.d, t, sc); else skunk(x, cx, cy, f.d, t, sc);
        if(f.st==="pumped"){ x.fillStyle="rgba(150,220,255,0.35)"; x.beginPath(); x.arc(cx, cy, 5*sc, 0, Math.PI*2); x.fill(); } }
      for(const o of G.pops){ const cx=px(o.x), cy=py(o.y);
        if(!o.rock){ x.fillStyle="rgba(150,220,255,"+(1-o.t).toFixed(2)+")"; for(let k=0;k<8;k++) x.fillRect(cx+Math.cos(k*0.8)*o.t*16, cy+Math.sin(k*0.8)*o.t*16, 2, 2); }
        if(o.pts){ x.fillStyle="#ffffff"; x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 9); x.fillText(String(o.pts), cx, cy-6-o.t*8); } }
      if(p.dead>0){ if(((t*10)|0)%2) hog(x, px(p.fx), py(p.fy), [0,1], t, 0); }
      else hog(x, px(p.fx), py(p.fy), p.d, t, p.walk);
      // the top: the score, the best, the gulch, the burrows left
      x.fillStyle="#000"; x.fillRect(0, 0, W, 22); x.textBaseline="middle"; _cbFont(x, 12);
      x.textAlign="left"; x.fillStyle="#e0a050"; x.fillText("SCORE "+String(G.score).padStart(6, "0"), 10, 11);
      x.textAlign="center"; x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[4]||0)).padStart(6, "0"), W/2+4, 11);
      x.textAlign="right"; x.fillStyle="#7ac860"; x.fillText("GULCH "+G.lvl, W-10, 11);
      for(let k=0;k<G.lives-1;k++) hog(x, 14+k*16, H-6, [1,0], 0, 0);
      if(G.over) _cbMid(x, "GAME OVER", (G.why ? G.why+" · " : "")+"SPACE TO PLAY AGAIN");
      else if(G.msgT>0) _cbMid(x, "GULCH "+G.lvl, G.lives<3 && G.why ? G.why : "READY");
      else if(G.clearT>0) _cbMid(x, "GULCH CLEARED", "+"+(1000*G.lvl));
      _cbTube(x); },
    // the attract mode: the name, a groundhog digging its way across, a beetle after it; then the best scores
    attract(x, t, i){
      x.fillStyle="#0a0806"; x.fillRect(0, 0, W, H); scene(x, null, t);
      for(let r=1;r<NR;r++){ const L=LAYER[layerOf(r)]; x.fillStyle=L[0]; x.fillRect(X0, Y0+r*TS, NC*TS, TS); }
      if(((t/7)|0)%2===0){
        const u=(t*0.18)%1, hx=X0+u*NC*TS, ry=Y0+8*TS+TS/2;
        x.fillStyle="#0a0806"; x.fillRect(X0, ry-7, hx-X0, 14);
        hog(x, hx, ry, [1,0], t, 1); if(hx-X0>60) beetle(x, hx-50, ry, [1,0], t, 1);
        x.fillStyle="rgba(10,8,6,0.78)"; x.fillRect(50, 74, W-100, 62);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 24);
        x.fillStyle="#e0a050"; x.fillText("GROUNDHOG", W/2, 92); x.fillStyle="#f4f0e0"; x.fillText("GULCH", W/2, 120);
        rock(x, X0+5*TS, Y0+11*TS, 0); skunk(x, X0+13*TS, Y0+11*TS+TS/2, [-1,0], t, 1);
      } else { x.fillStyle="rgba(0,0,0,0.7)"; x.fillRect(40, 50, W-80, 110); _cbTopDraw(x, "gulch", 66, "#e0a050"); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ======================================================================
   TURNPIKE TURTLE
   ====================================================================== */
const _TT=(function(){
  const W=_CB.W, H=_CB.H, CW=21, NC=16, RH=20, Y0=20;                  // sixteen across, thirteen rows under the score
  const ry=r=>Y0+r*RH, NEST=[1, 4, 7, 10, 13].map(c=>c*CW+CW);         // (each nest across two cells' join)
  // the rows from the top: 0 the far bank and its nests, 1-5 the creek, 6 the median, 7-11 I-79, 12 the near shoulder
  const LANES=[
    null,
    {river:1, dir: 1, sp:22, kinds:[["log",4],["log",3]], gap:[2.5,4]},
    {river:1, dir:-1, sp:30, kinds:[["tubes",3],["tubes",2]], gap:[2,3.5]},
    {river:1, dir: 1, sp:40, kinds:[["log",5]], gap:[3,5]},
    {river:1, dir:-1, sp:26, kinds:[["canoe",3],["tubes",2]], gap:[2.5,4]},
    {river:1, dir: 1, sp:34, kinds:[["log",3],["canoe",3]], gap:[2.5,4.5]},
    null,
    {dir:-1, sp:52, kinds:[["truck",3],["car",1.4]], gap:[3,6]},
    {dir: 1, sp:38, kinds:[["car",1.4],["pickup",1.6]], gap:[2.5,5]},
    {dir:-1, sp:64, kinds:[["car",1.4]], gap:[4,7]},
    {dir: 1, sp:30, kinds:[["truck",3],["car",1.4]], gap:[3,5]},
    {dir:-1, sp:44, kinds:[["pickup",1.6],["car",1.4]], gap:[2.5,5]},
    null];
  const CARCOL=["#c42a1a","#2a5aa8","#e8c030","#e8e4dc","#3a8a4a","#7a3aa8"];
  function fill(G){
    G.things=[];
    LANES.forEach((L, r)=>{ if(!L) return; let x=-Math.random()*CW*3; const span=W+CW*12;
      while(x<span){ const k=L.kinds[(Math.random()*L.kinds.length)|0], len=k[1]*CW;
        G.things.push({r:r, x:x, len:len, kind:k[0], col:CARCOL[(Math.random()*CARCOL.length)|0]}); x+=len+CW*(L.gap[0]+Math.random()*(L.gap[1]-L.gap[0])); }
      G.span[r]=Math.max(span, x); });
  }
  function level(G, n){ G.lvl=n; G.nests=[0,0,0,0,0]; G.span={}; fill(G); G.mul=1+0.16*(n-1); spawn(G); G.hawk={x:-60, t:6}; G.msgT=1.6; }
  function spawn(G){ G.p={c:7, r:12, x:7*CW+CW/2, hop:0, from:null, d:[0,-1], dead:0}; G.best=12; G.time=30; }
  function die(G, i, why){ if(G.p.dead>0) return; G.p.dead=1.4; G.why=why; _cbSnd(i, "die"); }
  // under you on the creek: whatever you are standing on, and how fast it carries you
  const floater=(G, r, x)=>G.things.find(t=>t.r===r && x>t.x+3 && x<t.x+t.len-3);
  function frame(G, h, i){
    if(G.msgT>0){ G.msgT-=h; return; }
    const p=G.p;
    for(const t of G.things){ const L=LANES[t.r]; t.x+=L.dir*L.sp*G.mul*h; const s=G.span[t.r];
      if(L.dir>0 && t.x>W+CW) t.x-=s; else if(L.dir<0 && t.x+t.len<-CW) t.x+=s; }
    // the hawk's shadow over the median, from the second round
    if(G.lvl>=2){ const k=G.hawk; k.t-=h; if(k.t<=0){ k.x+=150*h*G.mul; if(k.x>W+60){ k.x=-60; k.t=5+Math.random()*5; } } }
    if(p.dead>0){ p.dead-=h; if(p.dead<=0){ G.lives--; if(G.lives<=0){ G.over=true; return; } spawn(G); } return; }
    if(G.clearT>0){ G.clearT-=h; if(G.clearT<=0) level(G, G.lvl+1); return; }
    G.time-=h; if(G.time<=0){ die(G, i, "TOO SLOW"); return; }
    if(p.hop>0){ p.hop-=h; if(p.hop<0) p.hop=0; }
    const L=LANES[p.r];
    // riding: carried along; off the edge, or in the water, is the end of it
    if(L && L.river && p.hop<=0){ const f=floater(G, p.r, p.x); if(!f){ die(G, i, "SWEPT AWAY"); return; } p.x+=L.dir*L.sp*G.mul*h; if(p.x<4 || p.x>W-4){ die(G, i, "SWEPT AWAY"); return; } }
    if(L && !L.river){ for(const t of G.things) if(t.r===p.r && p.x>t.x+2 && p.x<t.x+t.len-2){ die(G, i, t.kind==="truck" ? "FLATTENED BY A RIG" : "RUN OVER"); return; } }
    if(p.r===6 && G.lvl>=2 && G.hawk.t<=0 && Math.abs(G.hawk.x-p.x)<14){ die(G, i, "SNATCHED BY THE HAWK"); return; }
    // the far bank: a nest, or the brambles
    if(p.r===0 && p.hop<=0){ const n=NEST.findIndex(x=>Math.abs(x-p.x)<12);
      if(n<0 || G.nests[n]){ die(G, i, n<0 ? "IN THE BRAMBLES" : "THAT NEST IS TAKEN"); return; }
      G.nests[n]=1; G.score+=50+Math.floor(G.time)*10; _cbSnd(i, "pellet");
      if(G.nests.every(v=>v)){ G.score+=1000; G.clearT=2.0; _cbSnd(i, "jingle"); } else spawn(G); }
  }
  function hop(G, d, i){
    const p=G.p; if(p.dead>0 || p.hop>0 || G.msgT>0 || G.clearT>0 || G.over) return;
    const nr=p.r+d[1], nx=p.x+d[0]*CW; if(nr<0 || nr>12 || nx<6 || nx>W-6) return;
    p.d=d; p.r=nr; p.x=nx; p.hop=0.12; _cbSnd(i, "rotate");
    // on land it keeps to the cells
    if(!(LANES[nr] && LANES[nr].river)) p.x=clamp(Math.floor(p.x/CW)*CW+CW/2, CW/2, W-CW/2);
    if(nr<G.best){ G.best=nr; G.score+=10; }
  }
  // the pictures
  function bg(x, t){
    x.fillStyle="#2e5a22"; x.fillRect(0, ry(0), W, RH);                                   // the far bank, brambles between the nests
    x.fillStyle="#1e3a16"; for(let k=0;k<W;k+=7) x.fillRect(k, ry(0)+((k*13)%7), 4, 4);
    for(const nx of NEST){ x.fillStyle="#5a3a1e"; x.beginPath(); x.ellipse(nx, ry(0)+RH/2+1, 11, 8, 0, 0, Math.PI*2); x.fill(); x.fillStyle="#3a2412"; x.beginPath(); x.ellipse(nx, ry(0)+RH/2+2, 8, 5.5, 0, 0, Math.PI*2); x.fill(); }
    x.fillStyle="#2a5a8a"; x.fillRect(0, ry(1), W, RH*5);                                 // French Creek
    x.strokeStyle="rgba(170,210,240,0.35)"; x.lineWidth=1;
    for(let r=1;r<=5;r++) for(let k=0;k<6;k++){ const xx=((k*61+t*(r%2 ? 18 : -14))%(W+40)+W+40)%(W+40)-20; x.beginPath(); x.moveTo(xx, ry(r)+6+(k%3)*4); x.lineTo(xx+9, ry(r)+6+(k%3)*4); x.stroke(); }
    x.fillStyle="#4a7a2e"; x.fillRect(0, ry(6), W, RH); x.fillStyle="#3a6a22"; for(let k=0;k<W;k+=9) x.fillRect(k, ry(6)+12, 2, 6);   // the median
    x.fillStyle="#9aa0a6"; x.fillRect(0, ry(6)+RH-3, W, 2);
    x.fillStyle="#2c2c30"; x.fillRect(0, ry(7), W, RH*5);                                 // I-79
    x.fillStyle="#e8e4d4"; for(let r=8;r<=11;r++) for(let k=0;k<W;k+=28) x.fillRect(k+((r*7)%14), ry(r)-0.5, 14, 1.5);
    x.fillStyle="#e8c030"; x.fillRect(0, ry(7)+1, W, 1.5); x.fillStyle="#e8e4d4"; x.fillRect(0, ry(12)-2, W, 1.5);
    x.fillStyle="#5a8a3a"; x.fillRect(0, ry(12), W, RH);                                  // the near shoulder
  }
  function thing(x, t, k){
    const y=ry(t.r), x0=t.x, L=t.len;
    if(t.kind==="log"){ x.fillStyle="#7a4a22"; x.fillRect(x0, y+4, L, RH-8); x.fillStyle="#9a6a3a"; x.fillRect(x0, y+4, L, 2);
      x.fillStyle="#5a3416"; for(let u=8;u<L-4;u+=13) x.fillRect(x0+u, y+8, 6, 1.5); x.fillStyle="#c89a62"; x.beginPath(); x.ellipse(x0+L, y+RH/2, 2.5, (RH-8)/2, 0, 0, Math.PI*2); x.fill(); return; }
    if(t.kind==="tubes"){ for(let u=0;u+CW<=L+1;u+=CW){ const cx=x0+u+CW/2, cy=y+RH/2; x.fillStyle="#1e1e22"; x.beginPath(); x.arc(cx, cy, 8, 0, Math.PI*2); x.fill();
        x.fillStyle="#2a5a8a"; x.beginPath(); x.arc(cx, cy, 3.5, 0, Math.PI*2); x.fill(); x.fillStyle="rgba(255,255,255,0.3)"; x.fillRect(cx-5, cy-6, 4, 1.5); } return; }
    if(t.kind==="canoe"){ x.fillStyle="#c43a22"; x.beginPath(); x.moveTo(x0, y+RH/2); x.quadraticCurveTo(x0+L/2, y+2, x0+L, y+RH/2); x.quadraticCurveTo(x0+L/2, y+RH-2, x0, y+RH/2); x.fill();
      x.fillStyle="#7a2412"; x.fillRect(x0+L*0.3, y+RH/2-1, L*0.4, 2); return; }
    // the road: cars, pickups and rigs, the way they are going
    const dir=LANES[t.r].dir, nose=dir>0 ? x0+L : x0;
    if(t.kind==="truck"){ x.fillStyle="#d8d8d4"; x.fillRect(x0+(dir>0?0:14), y+3, L-14, RH-6); x.fillStyle="#2a5aa8"; x.fillRect(x0+(dir>0?0:14), y+RH/2-1, L-14, 2);
      x.fillStyle=t.col; x.fillRect(dir>0 ? x0+L-13 : x0, y+4, 13, RH-8); x.fillStyle="#9ad0f0"; x.fillRect(dir>0 ? x0+L-4 : x0+1, y+5, 3, RH-10); }
    else { x.fillStyle=t.col; x.fillRect(x0, y+4, L, RH-8); x.fillStyle="#9ad0f0"; x.fillRect(dir>0 ? x0+L-11 : x0+6, y+5, 5, RH-10);
      if(t.kind==="pickup"){ x.fillStyle="rgba(0,0,0,0.3)"; x.fillRect(dir>0 ? x0+2 : x0+L-14, y+6, 12, RH-12); } }
    x.fillStyle="#fff2b0"; x.fillRect(nose-(dir>0?1.5:0), y+5, 1.5, 2); x.fillRect(nose-(dir>0?1.5:0), y+RH-7, 1.5, 2);
  }
  function turtle(x, cx, cy, d, s){
    x.save(); x.translate(cx, cy); x.rotate(Math.atan2(d[0], -d[1])); x.scale(s||1, s||1);
    x.fillStyle="#8a7a3a"; for(const [lx,ly] of [[-6,-4],[6,-4],[-6,4],[6,4]]) x.fillRect(lx-1.5, ly-1.5, 3, 3);
    x.fillStyle="#8a7a3a"; x.beginPath(); x.ellipse(0, -8, 2.6, 3, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#3a3a1a"; x.beginPath(); x.ellipse(0, 0, 6.5, 7.5, 0, 0, Math.PI*2); x.fill();
    x.fillStyle="#d89a2a"; for(const [sx,sy] of [[0,-3],[-3,1],[3,1],[0,4]]) x.fillRect(sx-1.2, sy-1.2, 2.4, 2.4);
    x.fillStyle="#1a1a10"; x.fillRect(-1.2, -9.5, 1, 1); x.fillRect(0.4, -9.5, 1, 1); x.restore(); }
  return {
    name:"TURNPIKE TURTLE", col:"#7ad08a",
    help:"TURNPIKE TURTLE · ARROWS OR WASD HOP · GET HOME TO THE FAR BANK · ESC TO STEP AWAY",
    newGame(){ const G={score:0, lives:4, over:false, won:false, acc:0, why:"", saved:false, lean:[0,0], leanT:0}; level(G, 1); return G; },
    key(G, e){ const d={ArrowLeft:[-1,0], KeyA:[-1,0], ArrowRight:[1,0], KeyD:[1,0], ArrowUp:[0,-1], KeyW:[0,-1], ArrowDown:[0,1], KeyS:[0,1]}[e.code];
      if(d){ hop(G, d, 5); G.lean=[d[0], -d[1]]; G.leanT=0.15; } },
    lean(G){ return G.leanT>0 ? G.lean : [0,0]; },
    step(G, dt, K, i){ if(G.leanT>0) G.leanT-=dt; if(G.over) return; G.acc+=dt; while(G.acc>=1/120){ G.acc-=1/120; frame(G, 1/120, i); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("turtle", G.score, "ROUND "+G.lvl); } },
    draw(x, G, t){
      x.fillStyle="#000"; x.fillRect(0, 0, W, H); bg(x, t);
      G.nests.forEach((v, k)=>{ if(v) turtle(x, NEST[k], ry(0)+RH/2, [0,1], 0.9); });
      for(const th of G.things) if(LANES[th.r].river) thing(x, th);
      if(G.lvl>=2 && G.hawk.t<=0){ x.fillStyle="rgba(0,0,0,0.38)"; x.beginPath(); x.ellipse(G.hawk.x, ry(6)+RH/2, 16, 6, 0, 0, Math.PI*2); x.fill();
        x.fillRect(G.hawk.x-22, ry(6)+RH/2-1.5, 44, 3); }
      const p=G.p;
      if(p.dead>0){ const L=LANES[p.r]; x.fillStyle=L && L.river ? "rgba(200,230,255,0.7)" : "#c42a1a";
        for(let k=0;k<6;k++) x.fillRect(p.x+Math.cos(k)*(1.4-p.dead)*8, ry(p.r)+RH/2+Math.sin(k)*(1.4-p.dead)*8, 2.5, 2.5); }
      else turtle(x, p.x, ry(p.r)+RH/2, p.d, 1+p.hop*1.6);
      for(const th of G.things) if(!LANES[th.r].river) thing(x, th);
      // the top: the score, the best, the round, the turtles left, the time
      x.fillStyle="#000"; x.fillRect(0, 0, W, Y0); x.textBaseline="middle"; _cbFont(x, 11);
      x.textAlign="left"; x.fillStyle="#7ad08a"; x.fillText(String(G.score).padStart(5, "0"), 6, 10);
      x.textAlign="center"; x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[5]||0)).padStart(5, "0"), 112, 10);
      x.fillStyle="#e8c030"; x.fillText("RD "+G.lvl, 174, 10);
      for(let k=0;k<G.lives-1;k++) turtle(x, 204+k*13, 10, [0,-1], 0.6);
      x.fillStyle="#3a3a3a"; x.fillRect(W-80, 6, 74, 8); x.fillStyle=G.time<8 ? "#e8402a" : "#7ad08a"; x.fillRect(W-80, 6, 74*clamp(G.time/30, 0, 1), 8);
      if(G.over) _cbMid(x, "GAME OVER", (G.why ? G.why+" · " : "")+"SPACE TO PLAY AGAIN");
      else if(G.msgT>0) _cbMid(x, "ROUND "+G.lvl, G.lvl>=2 ? "MIND THE HAWK" : "GET HOME, TURTLE");
      else if(G.clearT>0) _cbMid(x, "ALL HOME", "+1000");
      else if(p.dead>0) _cbMid(x, G.why);
      _cbTube(x); },
    // the attract mode: the road and the creek going, a turtle making its way over; then the best scores
    attract(x, t, i){
      if(!this._demo){ this._demo={score:0, span:{}}; fill(this._demo); this._demo.mul=1; }
      const D=this._demo; for(const th of D.things){ const L=LANES[th.r], s=D.span[th.r]; th.x=((th.x0===undefined ? (th.x0=th.x) : th.x0)+L.dir*L.sp*t)%s; if(th.x<-th.len-CW) th.x+=s; if(th.x>W+CW) th.x-=s; }
      x.fillStyle="#000"; x.fillRect(0, 0, W, H); bg(x, t);
      for(const th of D.things) thing(x, th);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(30, 80, W-60, 72);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 24); x.fillStyle="#e8c030"; x.fillText("TURNPIKE", W/2, 102); x.fillStyle="#7ad08a"; x.fillText("TURTLE", W/2, 130);
        turtle(x, W/2, ry(12)+RH/2-((t*14)%(RH*1.0)), [0,-1], 1.3); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 50, W-80, 110); _cbTopDraw(x, "turtle", 66, "#7ad08a"); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ---- into 18g's cabinets: the new breakout on cabinet 2, the two new games on 4 and 5 (12c) ---- */
_CBG[2]=_BK; _CBG[4]=_GG; _CBG[5]=_TT;
for(const i of [2, 4, 5]){ const L=_cbTop(["","","brickyard","","gulch","turtle"][i]); if(L.length) CABS.hi[i]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[i]; if(R && _CBG[i]){ _CBG[i].attract(R.x, 0, i); R.tex.needsUpdate=true; } }
