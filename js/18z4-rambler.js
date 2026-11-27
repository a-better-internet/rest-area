"use strict";
/* REST AREA · 18z4-rambler.js
   the arcade's sixteenth cabinet (12c): Ridge Rambler
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18z4 · RIDGE RAMBLER
   Played the way 18g's are (the cabinet's own screen, the stick under your
   hand, N to start again, Esc or E to step away), registered into 18g's
   _CBG as cabinet 20, on the front wall past Alley Roll.

   A side-scrolling run-and-jump game. You are Ranger Rosie, walking the
   Hollow Ridge country from the meadow to the summit: five worlds of four
   stages (the Meadow, the Deep Woods, the Lakeshore, the Old Mine and the
   Snowy Ridge), each world's fourth stage ending at Old Grizzly, who has
   to be stomped three times before the cabin's door opens. Bump crates
   from below for pinecones (a hundred is a life), trail mix (taller, one
   hit more, and you can break log crates), a slingshot (J or F throws
   pinecones that bounce along the ground) and honey (nothing hurts you
   for a while). A canteen is a life. Ticks, beetles (two stomps), hornets,
   skunks, bats and leaping fish can be stomped; porcupines cannot: go
   round them, or sling them. A trail marker half way is where you start
   again. Reach the cabin's door before the clock runs out.
   Arrows or A/D walk, SHIFT (or holding J) runs, SPACE / W / up / K jumps
   (hold it to go higher). After a game over SPACE carries on from the
   start of the world you reached, with the score back at nothing.

   The stages are put together from hand-made pieces (CHUNKS), chosen and
   ordered by a seed of the stage's own, so each stage is the same every
   time. Its tiles are drawn once onto a canvas of the whole stage (and a
   crate redrawn there when it changes), the backdrops once per world, and
   every figure is a sprite drawn once at load: a frame is a handful of
   drawImage calls. Its stages, its people and its pictures are its own,
   drawn here; nothing comes from an image file.
   ---------------------------------------------------------------------- */
const _RRM=(function(){
  const W=_CB.W, H=_CB.H, TS=16, NR=16, Y0=24;                          // 16 rows of 16 px under a 24 px score line
  const GRAV=0.26, GRAV_UP=0.2, FALLMAX=6.2, PWALK=1.45, PRUN=2.45, ACC=0.09, DEC=0.11, JUMP=5.15, JUMPRUN=5.75;
  const rng=(s)=>()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
  // (its sounds, as 20's blips)
  const SND={blip:"pellet", extra:"jingle", power:"pop", jump:"hop", stomp:"thump", bump:"knock", break:"brick", hurt:"invhit", die:"die", throw:"swish", tick:"tick", hurry:"ding", win:"jingle"};
  const snd=(i, k)=>{ if(i>=0) window._cbSnd(i, SND[k]||k); };
  const mk=(w, h)=>{ const c=cvs(w, h); return [c, c.getContext("2d")]; };

  /* ======================================================================
     THE WORLDS
     ====================================================================== */
  const WORLDS=[
    {n:"THE MEADOW",    sky:["#5a9ad8","#bfe0f0"], far:"#7ab0a0", mid:"#4a8a4a", top:"#5ab03a", topL:"#8ad04a", dirt:"#8a5a2a", dirtD:"#6a4220", stone:"#9a8a70",
     E:"tick", F:"hornet", X:"porc", fric:1},
    {n:"THE DEEP WOODS",sky:["#2a4a3a","#6a8a5a"], far:"#3a5a3a", mid:"#22402a", top:"#3a7a2a", topL:"#5a9a3a", dirt:"#5a3a20", dirtD:"#40281a", stone:"#7a7060",
     E:"beetle", F:"hornet", X:"skunk", fric:1},
    {n:"THE LAKESHORE", sky:["#6aa8d8","#d8e8e0"], far:"#5a8ab0", mid:"#3a7a5a", top:"#7ab84a", topL:"#a8d06a", dirt:"#a88a5a", dirtD:"#806a40", stone:"#a89a80",
     E:"tick", F:"hornet", X:"porc", fric:1, water:true},
    {n:"THE OLD MINE",  sky:["#140e0a","#2a1e14"], far:"#2a2018", mid:"#3a2a1e", top:"#6a5a48", topL:"#8a7a60", dirt:"#4a3a2a", dirtD:"#32261a", stone:"#6a6058",
     E:"beetle", F:"bat", X:"porc", fric:1, cave:true},
    {n:"THE SNOWY RIDGE",sky:["#8aa0c0","#d0d8e0"], far:"#a8b8c8", mid:"#6a8090", top:"#d0d6d8", topL:"#d8dcd8", dirt:"#7a8088", dirtD:"#5a6068", stone:"#9aa0a8",
     E:"beetle", F:"bat", X:"skunk", fric:0.32}];

  /* THE PIECES a stage is made of: twelve rows each, the screen's rows 4 to 15 (the ground is the last two). Every piece starts
     and ends on ground, so any two meet. A gap is never wider than a running jump clears (seven tiles), and nothing to land on
     is more than four tiles above where you jump from.
       #  ground    S stone (solid)   = log crate (breaks when you are tall)   ?  crate with a pinecone   M crate with a power
       L  crate with a canteen   -  a ledge you jump up through   ^ thorns   o pinecone   P spring   C trail marker
       E  walker   F  flyer   X  the world's odd one (porcupine, skunk)   r  raft, moving side to side   e  lift, up and down   */
  const CH=[
    {t:0, r:["..............","..............","..............","..............",".......o.o....","..............",
             "...?..=M=?=...","..............","..............",".........E....","##############","##############"]},
    {t:0, r:["............","............","............","............","............","............",
             "............","....ooo.....","............","............","####...#####","####...#####"]},
    {t:0, r:["................","................","................","................","................","..........o.....",
             ".....S....S.....","....SS....SS....","...SSS....SSS...","..SSSS....SSSS..","################","################"]},
    {t:0, r:["..............","..............","..............","..............","..............","..............",
             "..............","..........SS..","...SS.....SS..","...SS..E..SS..","##############","##############"]},
    {t:0, r:["................","................","................","................","..o.o.o.........","................",
             "..?=?=?.........","................","................","....E......E....","################","################"]},
    {t:1, r:[".................",".................",".................",".................",".................",".................",
             ".......ooo.......","......-----......",".................",".................","####.........####","####.........####"]},
    {t:1, r:["..............","..............","..............",".......F......","..............","....o..o..o...",
             "..............","..............","..............","..............","##############","##############"]},
    {t:1, r:["................","................","................","................","................","................",
             "......ooooo.....","...---------....","................","....^^^^^^^.....","################","################"]},
    {t:1, r:["..............","..............","..............","..............","..............","..............",
             "..............","..............","..............","......X.......","##############","##############"]},
    {t:1, r:["..................","..................","..................","..................","..................","...=?===?==.......",
             "..................","..................","..................","....E....E........","##################","##################"]},
    {t:2, r:["..................","..................","..................","..................","..........ooo.....","..................",
             "..................","..................","..................","...P..............","#####......#######","#####......#######"]},
    {t:2, r:["....................","....................","....................","....................","........ooo.........","....................",
             "....................","....................","........r...........","....................","####............####","####............####"]},
    {t:2, r:["..................","..................","..................","...........ooo....","..........SSSSSSSS","..........S.......",
             "..........S.......","..........S.......","..........S.......","......e...S.......","####......S#######","####......S#######"]},
    {t:1, r:["..................","..................","..................","..................","..................","..........o.......",
             "....-----.-----...","..................","..................","..................","###....##....#####","###....##....#####"]},
    {t:2, r:["....................","....................","....................",".......o.o.o........","......-------.......","....................",
             "...-----.....-----..","....................","....................","...X..........E.....","####################","####################"]},
    {t:1, r:["..............","..............","..............","..............","..............","..............",
             "..........L...","..............","..............","...E..........","##############","##############"]},
    {t:2, r:["..................","..................","..................","..................","........F.........","..................",
             "..................","...ooo......ooo....","..................","..................","###.....##.....###","###.....##.....###"]},
    {t:3, r:["......................","......................","......................","..................ooo.","..................---.","......................",
             "............---.......","......................","......---.............","......................","###...............####","###...............####"]},
    {t:2, r:["................","................","................","................","................",".....?....?.....",
             "................","................","................","..E..X....X..E..","################","################"]},
    {t:3, r:["....................","....................","....................","....................","....................","....................",
             "..........S.........",".........SS.........","........SSS..F......",".......SSSS.........","###...#############","###...#############"]}];
  const MARK=["..........","..........","..........","..........","..........","..........","..........","..........","..........","....C.....","##########","##########"];
  const START=["..........","..........","..........","..........","..........","..........","..........","..........","..........","..........","##########","##########"];
  const END=["..................","..................","..................","..................","..................","..................",
             "..................","..................","..................","..........G.......","##################","##################"];
  const ARENA=["............................","............................","............................","............................",
               "............................","............................","............................","............................",
               "............................","............................","############################","############################"];

  // a stage: its tiles, its things, drawn once onto its own canvas
  function build(L){
    const wi=(L/4)|0, si=L%4, Wd=WORLDS[wi], R=rng(L*7919+1301);
    const parts=[START];
    const tier=Math.min(3, wi*0.75+si*0.5), n=6+wi+si*2, pool=CH.filter(c=>c.t<=tier+0.01);
    for(let k=0;k<n;k++){ if(k===((n/2)|0)) parts.push(MARK);
      let c=pool[(R()*pool.length)|0]; if(k===0) c=CH[0]; parts.push(c.r); }
    parts.push(si===3 ? ARENA : END);
    const cols=parts.reduce((a, p)=>a+p[0].length, 0);
    const g=new Uint8Array(cols*NR), it=new Map(), things=[];
    // tile codes: 0 air 1 ground 2 stone 3 log crate 4 crate 5 used crate 6 ledge 7 thorns 8 water (the lake's pits)
    let ox=0;
    for(const p of parts){ const w=p[0].length;
      for(let r=0;r<12;r++){ const row=p[r]; for(let c=0;c<w;c++){ const ch=row[c], x=ox+c, y=r+4, i=y*cols+x;
        if(ch==="#") g[i]=1; else if(ch==="S") g[i]=2; else if(ch==="=") g[i]=3; else if(ch==="-") g[i]=6; else if(ch==="^") g[i]=7;
        else if(ch==="?" || ch==="M" || ch==="L"){ g[i]=4; it.set(i, ch==="?" ? "cone" : ch==="L" ? "life" : "power"); }
        else if(ch==="o") things.push({k:"cone", x:x*TS+4, y:y*TS+3});
        else if(ch==="E" || ch==="F" || ch==="X") things.push({k:"foe", kind:ch==="E" ? Wd.E : ch==="F" ? Wd.F : Wd.X, x:x*TS, y:y*TS});
        else if(ch==="P") things.push({k:"spring", x:x*TS, y:y*TS});
        else if(ch==="C") things.push({k:"mark", x:x*TS, y:y*TS});
        else if(ch==="G") things.push({k:"goal", x:x*TS, y:y*TS});
        else if(ch==="r") things.push({k:"raft", x:x*TS, y:y*TS, ax:"x", span:6*TS});
        else if(ch==="e") things.push({k:"raft", x:x*TS, y:y*TS, ax:"y", span:5*TS}); } }
      ox+=w; }
    // the arena: Old Grizzly, and walls behind you once you are in
    if(si===3){ const ax=cols-28; things.push({k:"foe", kind:"bear", x:(ax+20)*TS, y:12*TS}); things.push({k:"arena", x:ax*TS}); }
    // the mine has a roof; the lake fills its pits with water, and a fish in each wide one
    if(Wd.cave) for(let x=0;x<cols;x++){ g[x]=2; g[cols+x]=2; if(R()<0.5) g[2*cols+x]=2; }
    if(Wd.water){ for(let x=1;x<cols-1;x++) if(!g[15*cols+x]){ g[15*cols+x]=8; g[14*cols+x]=8; }
      for(let x=2;x<cols-2;x++) if(g[15*cols+x]===8 && g[15*cols+x-1]===8 && g[15*cols+x+1]===8 && g[15*cols+x-2]===1 && R()<0.7) things.push({k:"foe", kind:"fish", x:x*TS, y:15*TS}); }
    return {L:L, wi:wi, si:si, Wd:Wd, cols:cols, g:g, it:it, things:things, can:null};
  }

  /* ======================================================================
     PICTURES: tiles per world, backdrops per world, sprites once
     ====================================================================== */
  function tile(x, Wd, k, px, py, cols, g, c, r){
    const up=(r>0 && g[(r-1)*cols+c]);
    if(k===1){ x.fillStyle=Wd.dirt; x.fillRect(px, py, TS, TS);
      x.fillStyle=Wd.dirtD; for(let i=0;i<5;i++){ const h=((c*7+r*13+i*29)%97)/97, v=((c*11+r*5+i*17)%89)/89; x.fillRect(px+(h*14|0), py+(v*14|0), 2, 2); }
      if(!up || up===8){ x.fillStyle=Wd.top; x.fillRect(px, py, TS, 5); x.fillStyle=Wd.topL; x.fillRect(px, py, TS, 2);
        x.fillStyle=Wd.top; for(let i=0;i<4;i++) x.fillRect(px+i*4+((c*3)%3), py+5, 2, 2); } }
    else if(k===2){ x.fillStyle=Wd.stone; x.fillRect(px, py, TS, TS); x.fillStyle="rgba(255,255,255,0.18)"; x.fillRect(px, py, TS, 1); x.fillRect(px, py, 1, TS);
      x.fillStyle="rgba(0,0,0,0.28)"; x.fillRect(px, py+TS-1, TS, 1); x.fillRect(px+TS-1, py, 1, TS); x.fillRect(px+5, py+7, 6, 1); }
    else if(k===3){ x.fillStyle="#8a5a2a"; x.fillRect(px, py, TS, TS); x.fillStyle="#6a4018"; for(let i=0;i<3;i++) x.fillRect(px, py+2+i*5, TS, 1);
      x.fillStyle="#a8743a"; x.fillRect(px, py, TS, 1); x.fillStyle="#3a2410"; x.fillRect(px, py+TS-1, TS, 1); x.fillRect(px+TS-1, py, 1, TS); }
    else if(k===4 || k===5){ x.fillStyle=k===4 ? "#c8902a" : "#7a6a52"; x.fillRect(px, py, TS, TS); x.fillStyle=k===4 ? "#e8b84a" : "#8a7a62"; x.fillRect(px, py, TS, 2); x.fillRect(px, py, 2, TS);
      x.fillStyle="#3a2410"; x.fillRect(px, py+TS-1, TS, 1); x.fillRect(px+TS-1, py, 1, TS);
      for(const [a, b] of [[2, 2],[12, 2],[2, 12],[12, 12]]){ x.fillStyle="#3a2410"; x.fillRect(px+a, py+b, 2, 2); }
      if(k===4){ x.fillStyle="#5a3010"; x.fillRect(px+6, py+5, 4, 6); x.fillRect(px+5, py+6, 6, 3); x.fillStyle="#8a5a20"; x.fillRect(px+7, py+3, 2, 2); } }
    else if(k===6){ x.fillStyle="#7a5028"; x.fillRect(px, py, TS, 5); x.fillStyle="#a8743a"; x.fillRect(px, py, TS, 1); x.fillStyle="#4a2e14"; x.fillRect(px+3, py+5, 2, 3); x.fillRect(px+11, py+5, 2, 3); }
    else if(k===7){ x.fillStyle="#2a4a1e"; for(let i=0;i<4;i++){ x.beginPath(); x.moveTo(px+i*4, py+TS); x.lineTo(px+i*4+2, py+4); x.lineTo(px+i*4+4, py+TS); x.fill(); }
      x.fillStyle="#c8c0a0"; for(let i=0;i<4;i++) x.fillRect(px+i*4+1, py+4, 2, 2); }
    else if(k===8){ x.fillStyle="rgba(40,90,140,0.85)"; x.fillRect(px, py+(up===8 ? 0 : 5), TS, TS); if(up!==8){ x.fillStyle="#8ac0e0"; x.fillRect(px, py+5, TS, 1); } }
  }
  function paintStage(S){
    const [c, x]=mk(S.cols*TS, NR*TS); S.can=c; S.cx=x;
    for(let r=0;r<NR;r++) for(let col=0;col<S.cols;col++){ const k=S.g[r*S.cols+col]; if(k) tile(x, S.Wd, k, col*TS, r*TS, S.cols, S.g, col, r); }
  }
  function retile(S, col, r){ S.cx.clearRect(col*TS, r*TS, TS, TS); const k=S.g[r*S.cols+col]; if(k) tile(S.cx, S.Wd, k, col*TS, r*TS, S.cols, S.g, col, r);
    // (the tile under it may have lost its grass)
    if(r<NR-1){ S.cx.clearRect(col*TS, (r+1)*TS, TS, TS); const k2=S.g[(r+1)*S.cols+col]; if(k2) tile(S.cx, S.Wd, k2, col*TS, (r+1)*TS, S.cols, S.g, col, r+1); } }
  // two layers of backdrop per world, each W wide and seamless, slid at their own pace
  const BD=WORLDS.map((Wd, wi)=>{ const R=rng(wi*97+5);
    const [a, ax]=mk(W, NR*TS), [b, bx]=mk(W, NR*TS);
    const gr=ax.createLinearGradient(0, 0, 0, NR*TS); gr.addColorStop(0, Wd.sky[0]); gr.addColorStop(1, Wd.sky[1]); ax.fillStyle=gr; ax.fillRect(0, 0, W, NR*TS);
    if(!Wd.cave){ ax.fillStyle="rgba(255,255,255,0.55)"; for(let i=0;i<4;i++){ const cx=R()*W, cy=20+R()*60; for(let k=0;k<4;k++){ ax.beginPath(); ax.arc(cx+k*9, cy+(k%2)*3, 9+R()*4, 0, 7); ax.fill(); } } }
    else { ax.fillStyle="rgba(255,220,160,0.10)"; for(let i=0;i<30;i++) ax.fillRect(R()*W, R()*NR*TS, 2, 2); }
    // far ridges: a line of hills (snow on the ridge's), seamless across the width
    ax.fillStyle=Wd.far; ax.beginPath(); ax.moveTo(0, NR*TS);
    for(let i=0;i<=W;i+=4){ const y=140+Math.sin(i/W*Math.PI*2*2)*26+Math.sin(i/W*Math.PI*2*5+1)*10; ax.lineTo(i, Wd.cave ? 60+Math.sin(i/W*Math.PI*6)*20 : y); }
    ax.lineTo(W, NR*TS); ax.fill();
    if(wi===4){ ax.fillStyle="#d0d6dc"; ax.beginPath(); for(let i=0;i<=W;i+=4){ const y=140+Math.sin(i/W*Math.PI*4)*26+Math.sin(i/W*Math.PI*10+1)*10; if(i===0) ax.moveTo(i, y); else ax.lineTo(i, y); }
      for(let i=W;i>=0;i-=4){ const y=148+Math.sin(i/W*Math.PI*4)*26+Math.sin(i/W*Math.PI*10+1)*10; ax.lineTo(i, y+6); } ax.fill(); }
    // the middle: trees (or posts and timbers underground), seamless
    bx.fillStyle=Wd.mid;
    if(Wd.cave){ for(let i=0;i<4;i++){ const px=i*W/4+10; bx.fillRect(px, 40, 8, NR*TS); bx.fillRect(px-12, 40, 32, 8); } }
    else for(let i=0;i<9;i++){ const px=(i+0.3*R())*W/9, h=wi===1 ? 160+R()*60 : 70+R()*50, base=NR*TS-28;
      bx.fillRect(px-2, base-h*0.4, 4, h*0.4);
      if(wi===4 || wi===1){ for(let k=0;k<4;k++){ bx.beginPath(); bx.moveTo(px-14+k*2, base-h*0.3-k*h*0.17); bx.lineTo(px, base-h-k*4+k*h*0.05); bx.lineTo(px+14-k*2, base-h*0.3-k*h*0.17); bx.fill(); } }
      else { bx.beginPath(); bx.arc(px, base-h*0.6, 16+R()*8, 0, 7); bx.fill(); bx.beginPath(); bx.arc(px+10, base-h*0.5, 12, 0, 7); bx.fill(); } }
    if(wi===2){ bx.fillStyle="rgba(60,110,150,0.6)"; bx.fillRect(0, NR*TS-40, W, 40); bx.fillStyle="rgba(200,230,240,0.35)"; for(let i=0;i<20;i++) bx.fillRect(R()*W, NR*TS-38+R()*30, 10, 1); }
    return [a, b]; });

  // a sprite from pixel rows and a palette, drawn once
  function pix(rows, pal, flip){ const h=rows.length, w=rows[0].length, [c, x]=mk(w, h);
    for(let r=0;r<h;r++) for(let k=0;k<w;k++){ const ch=rows[r][flip ? w-1-k : k], col=pal[ch]; if(col){ x.fillStyle=col; x.fillRect(k, r, 1, 1); } } return c; }
  const ROSE_PAL={G:"#3a6a2a", g:"#2a4a1e", S:"#e0b088", K:"#1a1410", H:"#6a3a1e", T:"#c8a870", B:"#d8b030", N:"#3a4a2a", O:"#5a3a1e", R:"#b83a2a"};
  const ROSE_HEAD=["....GGGG....","...GGGGGG...",".gGGGGGGGGg.","...HSSSSH...","...SKSSKS...","...SSSSSS...","....SRRS...."];
  const ROSE_BODY=["...TTTTTT...","..TTTBTTTT..","..STTTTTTS..","...TTTTTT..."];
  const ROSE_LEGS={stand:["...NNNNNN...","...NN..NN...","...NN..NN...","...NN..NN...","..OOO..OOO.."],
                   w1:["...NNNNNN...","..NN....NN..",".NN......NN.",".NN.......N.","OOO......OOO"],
                   w2:["...NNNNNN...","....NNNN....","....NNNN....","....NN.N....","...OOO.OO..."],
                   jump:["...NNNNNN...","..NN...NN...",".NN....NN...",".OO.....NN..",".......OOO.."]};
  const ROSE={};
  for(const pw of ["small","big","sling","star"]){ const pal=Object.assign({}, ROSE_PAL); if(pw==="sling"){ pal.T="#d8743a"; pal.B="#e8d8a0"; } if(pw==="star"){ pal.T="#e8c84a"; pal.N="#8a5a1a"; }
    for(const fr of ["stand","w1","w2","jump"]){
      let rows=ROSE_HEAD.concat(ROSE_BODY, ROSE_LEGS[fr]);
      if(pw!=="small"){ const head=ROSE_HEAD, body=[], legs=[]; for(const l of ROSE_BODY){ body.push(l, l); } const L2=ROSE_LEGS[fr]; legs.push(L2[0], L2[1], L2[1], L2[2], L2[2], L2[3], L2[3], L2[4]); rows=head.concat(["...TTTTTT..."], body, legs); }
      if(fr==="jump"){ rows=rows.slice(); rows[7]="S.TTTTTT.S.."; }
      ROSE[pw+fr]=[pix(rows, pal, false), pix(rows, pal, true)]; } }
  ROSE.dead=pix(["....GGGG....","...GGGGGG...",".gGGGGGGGGg.","...HSSSSH...","...SKSSKS...","...SSRRSS...","S..SSSSSS..S","STTTTTTTTTTS","..TTTBTTTT..","...TTTTTT...","...NNNNNN...","...NN..NN...","...NN..NN...","..OOO..OOO.."], ROSE_PAL);
  // the critters, drawn with shapes onto their own little canvases
  const SPR={};
  const draw=(w, h, f)=>{ const [c, x]=mk(w, h); f(x); return c; };
  const both=(w, h, f)=>{ const a=draw(w, h, x=>f(x)); const b=draw(w, h, x=>{ x.translate(w, 0); x.scale(-1, 1); f(x); }); return [a, b]; };   // [facing right, facing left]
  for(const ph of [0, 1]){
    SPR["tick"+ph]=both(14, 10, x=>{ x.fillStyle="#5a1a12"; x.beginPath(); x.ellipse(7, 5, 6, 4.2, 0, 0, 7); x.fill(); x.fillStyle="#8a2a1a"; x.beginPath(); x.ellipse(6, 4, 3, 2, 0, 0, 7); x.fill();
      x.fillStyle="#1a0a06"; for(let i=0;i<3;i++){ x.fillRect(2+i*4, 8, 1, 2+((i+ph)%2)); x.fillRect(3+i*4, 8, 1, 2-((i+ph)%2)); } x.fillStyle="#e8e0c8"; x.fillRect(11, 3, 2, 2); x.fillStyle="#000"; x.fillRect(12, 3, 1, 1); });
    SPR["beetle"+ph]=both(16, 12, x=>{ x.fillStyle="#1a2a4a"; x.beginPath(); x.ellipse(8, 6, 7, 5, 0, Math.PI, 0); x.fill(); x.fillRect(1, 6, 14, 2);
      x.fillStyle="#4a6aa8"; x.fillRect(4, 2, 4, 2); x.fillStyle="#2a1a10"; x.fillRect(14, 4, 2, 2); x.fillRect(15, 2, 1, 2);
      x.fillStyle="#0a0a0a"; for(let i=0;i<3;i++) x.fillRect(3+i*4+ph, 8, 1, 4-ph); });
    SPR["hornet"+ph]=both(14, 12, x=>{ x.fillStyle="#e8c020"; x.beginPath(); x.ellipse(7, 7, 6, 4, 0, 0, 7); x.fill(); x.fillStyle="#1a1410"; x.fillRect(4, 3, 2, 8); x.fillRect(8, 3, 2, 8);
      x.fillStyle="rgba(220,235,255,0.75)"; x.beginPath(); x.ellipse(6, ph ? 2 : 4, 4, 2, ph ? -0.4 : 0.2, 0, 7); x.fill(); x.fillStyle="#1a1410"; x.fillRect(12, 6, 2, 2); x.fillRect(0, 7, 1, 1); });
    SPR["porc"+ph]=both(18, 14, x=>{ x.fillStyle="#3a2a1a"; for(let i=0;i<7;i++){ x.beginPath(); x.moveTo(2+i*2, 7); x.lineTo(1+i*2+ph, 0+(i%2)*2); x.lineTo(4+i*2, 7); x.fill(); }
      x.fillStyle="#6a4a2a"; x.beginPath(); x.ellipse(9, 9, 8, 5, 0, 0, 7); x.fill(); x.fillStyle="#c8a878"; x.beginPath(); x.ellipse(15, 10, 3, 2.4, 0, 0, 7); x.fill();
      x.fillStyle="#000"; x.fillRect(16, 9, 1, 1); x.fillRect(17, 11, 1, 1); x.fillStyle="#2a1a0a"; x.fillRect(4+ph, 13, 2, 1); x.fillRect(12-ph, 13, 2, 1); });
    SPR["skunk"+ph]=both(18, 14, x=>{ x.fillStyle="#1a1a1e"; x.beginPath(); x.ellipse(8, 9, 7, 4.5, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(3, 4, 3, 5, -0.5, 0, 7); x.fill();
      x.fillStyle="#d0d0c8"; x.fillRect(3, 6, 10, 2); x.fillRect(1, 1, 2, 4); x.fillStyle="#1a1a1e"; x.beginPath(); x.ellipse(15, 9, 3, 3, 0, 0, 7); x.fill(); x.fillStyle="#d0d0c8"; x.fillRect(14, 7, 3, 1);
      x.fillStyle="#e8e0c8"; x.fillRect(16, 8, 1, 1); x.fillStyle="#1a1a1e"; x.fillRect(4+ph, 12, 2, 2); x.fillRect(11-ph, 12, 2, 2); });
    SPR["bat"+ph]=both(16, 10, x=>{ x.fillStyle="#3a2a3a"; x.beginPath(); x.ellipse(8, 5, 3, 3, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(6, 4);
      if(ph){ x.lineTo(0, 1); x.lineTo(2, 6); x.lineTo(6, 6); x.moveTo(10, 4); x.lineTo(16, 1); x.lineTo(14, 6); x.lineTo(10, 6); }
      else { x.lineTo(0, 9); x.lineTo(3, 6); x.lineTo(6, 7); x.moveTo(10, 4); x.lineTo(16, 9); x.lineTo(13, 6); x.lineTo(10, 7); } x.fill(); x.fillStyle="#e83a2a"; x.fillRect(7, 4, 1, 1); x.fillRect(9, 4, 1, 1); });
    SPR["fish"+ph]=both(14, 10, x=>{ x.fillStyle="#6a8a6a"; x.beginPath(); x.ellipse(6, 5, 6, 3.5, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(11, 5); x.lineTo(14, 1+ph); x.lineTo(14, 9-ph); x.fill();
      x.fillStyle="#c8d0b8"; x.fillRect(1, 5, 9, 2); x.fillStyle="#000"; x.fillRect(2, 3, 1, 1); });
  }
  SPR.beetleFlip=both(16, 12, x=>{ x.fillStyle="#1a2a4a"; x.beginPath(); x.ellipse(8, 6, 7, 5, 0, 0, Math.PI); x.fill(); x.fillRect(1, 4, 14, 2); x.fillStyle="#0a0a0a"; for(let i=0;i<3;i++) x.fillRect(3+i*4, 0, 1, 4); });
  for(const ph of [0, 1, 2]) SPR["bear"+ph]=both(32, 28, x=>{ x.fillStyle="#5a3a1e"; x.beginPath(); x.ellipse(14, 16, 13, 9, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(26, 9, 6, 6, 0, 0, 7); x.fill(); x.fillStyle="#3a2412"; x.beginPath(); x.arc(24, 3, 2.5, 0, 7); x.fill(); x.beginPath(); x.arc(29, 4, 2.5, 0, 7); x.fill();
    x.fillStyle="#c8a070"; x.beginPath(); x.ellipse(30, 11, 3, 2.4, 0, 0, 7); x.fill(); x.fillStyle="#000"; x.fillRect(31, 10, 2, 2); x.fillRect(27, 7, 2, 2);
    x.fillStyle="#4a2e16"; const s=ph===1 ? 3 : ph===2 ? -3 : 0; x.fillRect(4+s, 22, 6, 6); x.fillRect(19-s, 22, 6, 6); x.fillStyle="#e8d8b8"; x.fillRect(4+s, 27, 6, 1); x.fillRect(19-s, 27, 6, 1); });
  SPR.cone=draw(8, 10, x=>{ x.fillStyle="#8a5a2a"; x.beginPath(); x.ellipse(4, 5.5, 3.6, 4.4, 0, 0, 7); x.fill(); x.fillStyle="#5a3814"; for(let r=0;r<4;r++) for(let k=0;k<2;k++) x.fillRect(2+k*3+(r%2), 2+r*2, 2, 1); x.fillStyle="#3a6a2a"; x.fillRect(3, 0, 2, 2); });
  SPR.mix=draw(12, 12, x=>{ x.fillStyle="#c84a2a"; x.fillRect(1, 2, 10, 10); x.fillStyle="#e8d8a0"; x.fillRect(2, 5, 8, 4); x.fillStyle="#6a3a1a"; x.fillRect(3, 6, 2, 2); x.fillRect(6, 7, 2, 1); x.fillStyle="#8a2a1a"; x.fillRect(1, 0, 10, 2); });
  SPR.sling=draw(12, 12, x=>{ x.strokeStyle="#8a5a2a"; x.lineWidth=2; x.beginPath(); x.moveTo(6, 12); x.lineTo(6, 6); x.lineTo(2, 1); x.moveTo(6, 6); x.lineTo(10, 1); x.stroke(); x.strokeStyle="#c84a2a"; x.lineWidth=1; x.beginPath(); x.moveTo(2, 2); x.quadraticCurveTo(6, 7, 10, 2); x.stroke(); });
  SPR.honey=draw(12, 12, x=>{ x.fillStyle="#e8a020"; x.fillRect(2, 3, 8, 9); x.fillStyle="#f8d060"; x.fillRect(3, 5, 3, 4); x.fillStyle="#7a5a3a"; x.fillRect(1, 1, 10, 3); });
  SPR.can=draw(12, 12, x=>{ x.fillStyle="#3a5a3a"; x.beginPath(); x.ellipse(6, 7, 5, 5, 0, 0, 7); x.fill(); x.fillStyle="#8a9a8a"; x.fillRect(5, 0, 2, 3); x.fillStyle="#c8a870"; x.fillRect(1, 6, 10, 2); });
  SPR.pebble=draw(6, 6, x=>{ x.fillStyle="#8a5a2a"; x.beginPath(); x.arc(3, 3, 3, 0, 7); x.fill(); x.fillStyle="#5a3814"; x.fillRect(2, 2, 2, 1); });
  SPR.spring=[0, 1].map(k=>draw(16, 16, x=>{ x.fillStyle="#7a7e82"; x.fillRect(1, 15-2, 14, 3); x.strokeStyle="#c8a020"; x.lineWidth=2; x.beginPath(); for(let i=0;i<4;i++){ const y=13-i*(k ? 1.5 : 2.5); x.moveTo(3, y); x.lineTo(13, y-1); } x.stroke(); x.fillStyle="#c83a2a"; x.fillRect(1, k ? 6 : 2, 14, 3); }));
  SPR.mark=[0, 1].map(k=>draw(16, 32, x=>{ x.fillStyle="#6a4a2a"; x.fillRect(7, 4, 3, 28); x.fillStyle=k ? "#e8a020" : "#7a7a70"; x.fillRect(3, 2, 11, 7); x.fillStyle="#2a1a0a"; x.fillRect(5, 4, 7, 1); x.fillRect(5, 6, 5, 1); }));
  SPR.raft=draw(48, 8, x=>{ x.fillStyle="#7a5028"; for(let i=0;i<6;i++){ x.fillRect(i*8, 1, 7, 7); } x.fillStyle="#a8743a"; for(let i=0;i<6;i++) x.fillRect(i*8, 1, 7, 1); x.fillStyle="#3a2410"; x.fillRect(0, 4, 48, 1); });
  // the cabin at a stage's end: its door is the goal
  SPR.cabin=draw(64, 64, x=>{ x.fillStyle="#6a4220"; x.fillRect(4, 24, 56, 40); x.fillStyle="#4a2e14"; for(let i=0;i<8;i++) x.fillRect(4, 26+i*5, 56, 1);
    x.fillStyle="#3a2a20"; x.beginPath(); x.moveTo(0, 26); x.lineTo(32, 2); x.lineTo(64, 26); x.fill(); x.fillStyle="#5a4a3a"; x.fillRect(44, 6, 6, 14);
    x.fillStyle="#2a1a0a"; x.fillRect(24, 38, 16, 26); x.fillStyle="#c8a020"; x.fillRect(36, 51, 2, 2); x.fillStyle="#e8c060"; x.fillRect(8, 34, 10, 9); x.fillRect(46, 34, 10, 9);
    x.fillStyle="#2a1a0a"; x.fillRect(12, 34, 1, 9); x.fillRect(50, 34, 1, 9); });

  /* ======================================================================
     PLAYING
     ====================================================================== */
  const solid=(k)=>k===1 || k===2 || k===3 || k===4 || k===5;
  const tAt=(S, c, r)=>(c<0 || c>=S.cols) ? 1 : (r<0 ? 0 : r>=NR ? 0 : S.g[r*S.cols+c]);
  function enter(G, L, fromMark){
    const S=build(L); paintStage(S); G.S=S; G.L=L;
    G.foes=[]; G.items=[]; G.cones=[]; G.shots=[]; G.fx=[]; G.rafts=[]; G.springs=[]; G.marks=[]; G.goal=null; G.arena=null; G.bossDead=false;
    for(const t of S.things){
      if(t.k==="cone") G.cones.push({x:t.x, y:t.y, t:0});
      else if(t.k==="foe") G.foes.push(foe(t.kind, t.x, t.y, L));
      else if(t.k==="raft") G.rafts.push({x:t.x-16, y:t.y+4, x0:t.x-16, y0:t.y+4, ax:t.ax, span:t.span, ph:0, dx:0, dy:0});
      else if(t.k==="spring") G.springs.push({x:t.x, y:t.y, sq:0});
      else if(t.k==="mark") G.marks.push({x:t.x, y:t.y-16, on:false});
      else if(t.k==="goal") G.goal={x:t.x, y:t.y+TS-64};
      else if(t.k==="arena") G.arena={x:t.x, shut:false}; }
    const p=G.p; p.x=fromMark ? fromMark+4 : 3*TS; p.y=12*TS; p.vx=0; p.vy=0; p.dir=1; p.ground=false; p.dead=0; p.inv=0; p.cool=0; p.wf=0; p.squash=0; p.honey=0;
    G.camX=Math.max(0, p.x-100); G.time=G.S.si===3 ? 400 : 300; G.tAcc=0; G.msgT=150; G.clearT=0; G.markAt=fromMark||0;
  }
  function foe(kind, x, y, L){ const f={kind:kind, x:x, y:y, vx:-0.5-Math.min(0.6, L*0.03), vy:0, w:14, h:10, hp:1, st:"walk", t:Math.random()*100, dead:0, active:false};
    if(kind==="beetle"){ f.w=16; f.h=12; f.hp=2; }
    if(kind==="porc"){ f.w=18; f.h=13; f.vx*=0.7; }
    if(kind==="skunk"){ f.w=18; f.h=13; f.vx*=0.9; f.spray=0; }
    if(kind==="hornet"){ f.w=14; f.h=12; f.fly=true; f.y0=y; f.vx=-0.7; }
    if(kind==="bat"){ f.w=16; f.h=10; f.fly=true; f.y0=y; f.vx=-0.9; }
    if(kind==="fish"){ f.w=14; f.h=10; f.fish=true; f.y0=y; f.vx=0; f.wait=60+Math.random()*90; }
    if(kind==="bear"){ f.w=30; f.h=26; f.hp=3; f.vx=-0.8; f.boss=true; f.y-=16; f.jumpT=120; }
    f.y+=TS-f.h; return f; }
  // the body against the tiles, one axis at a time; head bumps reported
  function move(G, b, dx, dy, onBump){
    const S=G.S;
    b.x+=dx;
    { const r0=Math.floor(b.y/TS), r1=Math.floor((b.y+b.h-1)/TS);
      if(dx>0){ const c=Math.floor((b.x+b.w)/TS); for(let r=r0;r<=r1;r++) if(solid(tAt(S, c, r))){ b.x=c*TS-b.w; b.hitX=1; break; } }
      else if(dx<0){ const c=Math.floor(b.x/TS); for(let r=r0;r<=r1;r++) if(solid(tAt(S, c, r))){ b.x=(c+1)*TS; b.hitX=-1; break; } } }
    const wasBot=b.y+b.h; b.y+=dy; b.ground=false;
    { const c0=Math.floor(b.x/TS), c1=Math.floor((b.x+b.w-1)/TS);
      if(dy>0){ const r=Math.floor((b.y+b.h)/TS);
        for(let c=c0;c<=c1;c++){ const k=tAt(S, c, r); if(solid(k) || (k===6 && wasBot<=r*TS+0.5)){ b.y=r*TS-b.h; b.vy=0; b.ground=true; break; } } }
      else if(dy<0){ const r=Math.floor(b.y/TS); let hit=-1, best=1e9;
        for(let c=c0;c<=c1;c++) if(solid(tAt(S, c, r))){ const d=Math.abs((c+0.5)*TS-(b.x+b.w/2)); if(d<best){ best=d; hit=c; } }
        if(hit>=0){ b.y=(r+1)*TS; b.vy=0.5; if(onBump) onBump(hit, r); } } }
  }
  const pop=(G, x, y, txt, col)=>G.fx.push({k:"txt", x:x, y:y, txt:txt, col:col||"#f2e23a", t:0});
  function score(G, n, x, y){ G.score+=n; if(x!==undefined) pop(G, x, y, String(n)); }
  function getCone(G, i){ G.coins++; G.score+=200; if(G.coins>=100){ G.coins-=100; G.lives++; pop(G, G.p.x, G.p.y-10, "1 UP", "#8aff8a"); snd(i, "extra"); } else snd(i, "blip"); }
  function bump(G, c, r, i){
    const S=G.S, k=S.g[r*S.cols+c], p=G.p;
    for(const f of G.foes) if(!f.dead && f.ground && Math.abs(f.y+f.h-r*TS)<2 && f.x+f.w>c*TS && f.x<(c+1)*TS){ f.dead=1; f.vy=-3; score(G, 100, f.x, f.y); }
    if(k===4){ const what=S.it.get(r*S.cols+c); S.g[r*S.cols+c]=5; retile(S, c, r); G.fx.push({k:"bump", c:c, r:r, t:0});
      if(what==="cone"){ getCone(G, i); G.fx.push({k:"cone", x:c*TS+4, y:r*TS-10, t:0}); }
      else { let kind=what==="life" ? "can" : p.pw==="small" ? "mix" : "sling"; if(what==="power" && G.L>=4 && ((c*31+r*7+G.L)%7)===0) kind="honey";
        G.items.push({k:kind, x:c*TS+2, y:r*TS, w:12, h:12, vx:0, vy:0, rise:16, dir:1}); snd(i, "power"); } }
    else if(k===3){ if(p.pw!=="small"){ S.g[r*S.cols+c]=0; retile(S, c, r); score(G, 50);
        for(let q=0;q<4;q++) G.fx.push({k:"chip", x:c*TS+8, y:r*TS+8, vx:(q%2 ? 1 : -1)*(1+q*0.3), vy:-3-(q>>1)*1.5, t:0}); snd(i, "break"); }
      else { G.fx.push({k:"bump", c:c, r:r, t:0}); snd(i, "bump"); } }
    else snd(i, "bump");
  }
  function hurt(G, i){ const p=G.p; if(p.inv>0 || p.honey>0 || p.dead) return;
    if(p.pw!=="small"){ const was=p.pw; p.pw=was==="sling" ? "big" : "small"; if(p.pw==="small"){ p.y+=p.h-14; p.h=14; } p.inv=110; snd(i, "hurt"); }
    else die(G, i); }
  function die(G, i){ const p=G.p; if(p.dead) return; p.dead=1; p.vy=-5; p.vx=0; snd(i, "die"); }
  function grow(G, pw){ const p=G.p; if(p.pw==="small"){ p.y-=24-p.h; p.h=24; } p.pw=pw; }

  function frame(G, K, i){
    const p=G.p, S=G.S;
    G.t++;
    if(G.msgT>0) G.msgT--;
    // the stage done: count the clock into the score, then the next
    if(G.clearT>0){ G.clearT++; if(G.time>0 && G.clearT>40){ const n=Math.min(G.time, 4); G.time-=n; G.score+=n*50; if(G.t%4===0) snd(i, "tick"); }
      else if(G.clearT>40 && G.time<=0 && G.clearT>140){ if(G.L>=19){ G.won=true; G.over=true; _RRM._world=0; snd(i, "win"); return; } G.reached=Math.max(G.reached, ((G.L+1)/4)|0); _RRM._world=((G.L+1)/4)|0; enter(G, G.L+1, 0); }
      return; }
    // dying: up, then down off the screen, then again from the last marker
    if(p.dead){ p.dead++; if(p.dead>30){ p.vy+=0.3; p.y+=p.vy; }
      if(p.dead>150){ G.lives--; if(G.lives<=0){ G.over=true; _RRM._world=(G.L/4)|0; return; } p.pw="small"; p.h=14; enter(G, G.L, G.markAt); }
      return; }
    // the clock
    G.tAcc++; if(G.tAcc>=24){ G.tAcc=0; G.time--; if(G.time===100) snd(i, "hurry"); if(G.time<=0){ G.time=0; die(G, i); return; } }
    // walking, running, jumping
    const L=(K.ArrowLeft||K.KeyA ? 1 : 0), Rr=(K.ArrowRight||K.KeyD ? 1 : 0), run=K.ShiftLeft||K.ShiftRight||K.KeyJ, hold=K.Space||K.ArrowUp||K.KeyW||K.KeyK;
    const fr=p.ground ? S.Wd.fric : 0.6, top=run ? PRUN : PWALK, dir=Rr-L;
    if(dir){ p.vx+=dir*ACC*(p.ground ? Math.max(0.35, fr) : 0.7); if(Math.abs(p.vx)>top) p.vx-=Math.sign(p.vx)*Math.min(Math.abs(p.vx)-top, 0.06); p.dir=dir; }
    else if(p.ground){ const d=DEC*fr; p.vx=Math.abs(p.vx)<=d ? 0 : p.vx-Math.sign(p.vx)*d; }
    if(G.jump){ G.jump=false; if(p.ground || p.coyote>0){ p.vy=-(Math.abs(p.vx)>1.9 ? JUMPRUN : JUMP); p.ground=false; p.coyote=0; snd(i, "jump"); } else p.buffer=8; }
    if(p.buffer>0){ p.buffer--; if(p.ground){ p.vy=-(Math.abs(p.vx)>1.9 ? JUMPRUN : JUMP); p.ground=false; p.buffer=0; snd(i, "jump"); } }
    p.vy+=(hold && p.vy<0) ? GRAV_UP : GRAV; if(p.vy>FALLMAX) p.vy=FALLMAX;
    const wasG=p.ground;
    move(G, p, p.vx, 0); if(p.hitX){ p.vx=0; p.hitX=0; }
    // (on a raft: carried, and stood on)
    let onRaft=null;
    for(const r of G.rafts){ if(p.vy>=0 && p.x+p.w>r.x+1 && p.x<r.x+47 && p.y+p.h<=r.y+2 && p.y+p.h+p.vy>=r.y-1){ onRaft=r; } }
    if(onRaft){ p.y=onRaft.y-p.h; p.vy=0; p.ground=true; move(G, p, onRaft.dx, 0); p.hitX=0; }
    else move(G, p, 0, p.vy, (c, r)=>bump(G, c, r, i));
    p.coyote=p.ground ? 6 : Math.max(0, (p.coyote||0)-1);
    if(p.x<G.camX) p.x=G.camX;
    if(G.arena && G.arena.shut && p.x<G.arena.x+2*TS) p.x=G.arena.x+2*TS;
    if(p.x>S.cols*TS-p.w) p.x=S.cols*TS-p.w;
    p.wf=p.ground && Math.abs(p.vx)>0.1 ? p.wf+Math.abs(p.vx)*0.12 : 0;
    if(p.inv>0) p.inv--; if(p.honey>0) p.honey--; if(p.cool>0) p.cool--;
    if(p.y>NR*TS+8){ die(G, i); p.y=NR*TS; return; }
    // thorns and water
    { const c0=Math.floor((p.x+2)/TS), c1=Math.floor((p.x+p.w-3)/TS), r=Math.floor((p.y+p.h)/TS);
      for(let c=c0;c<=c1;c++){ const k=tAt(S, c, r), k2=tAt(S, c, r-1); if(k===7 || k2===7) hurt(G, i); if(k2===8 || tAt(S, c, Math.floor((p.y+p.h-4)/TS))===8){ die(G, i); return; } } }
    // throwing
    if(G.fire){ G.fire=false; if(p.pw==="sling" && G.shots.length<2 && p.cool<=0){ G.shots.push({x:p.x+(p.dir>0 ? p.w : -6), y:p.y+6, vx:p.dir*4.2, vy:1, t:0}); p.cool=12; snd(i, "throw"); } }
    // the camera: never back
    G.camX=Math.max(G.camX, Math.min(p.x-W*0.42, S.cols*TS-W));
    if(G.arena && !G.arena.shut && p.x>G.arena.x+3*TS){ G.arena.shut=true; G.camX=Math.max(G.camX, Math.min(G.arena.x, S.cols*TS-W)); G.msgT=0; G.boss=true; }
    // markers
    for(const m of G.marks) if(!m.on && p.x>m.x){ m.on=true; G.markAt=m.x; snd(i, "blip"); }
    // springs
    for(const s of G.springs){ if(s.sq>0) s.sq--; if(p.vy>0 && p.x+p.w>s.x+2 && p.x<s.x+14 && p.y+p.h>=s.y+6 && p.y+p.h<=s.y+16){ p.y=s.y+6-p.h; p.vy=hold ? -8.6 : -6.4; s.sq=10; snd(i, "jump"); } }
    // rafts
    for(const r of G.rafts){ r.ph+=0.012; const o=(Math.sin(r.ph)*0.5+0.5)*r.span, nx=r.ax==="x" ? r.x0+o : r.x0, ny=r.ax==="y" ? r.y0-o : r.y0; r.dx=nx-r.x; r.dy=ny-r.y; r.x=nx; r.y=ny; }
    // pinecones lying about
    for(let k=G.cones.length-1;k>=0;k--){ const c=G.cones[k]; c.t++; if(p.x+p.w>c.x && p.x<c.x+8 && p.y+p.h>c.y && p.y<c.y+10){ G.cones.splice(k, 1); getCone(G, i); } }
    // the things out of crates
    for(let k=G.items.length-1;k>=0;k--){ const o=G.items[k];
      if(o.rise>0){ o.rise--; o.y-=1; if(o.rise===0 && o.k!=="sling") o.vx=o.k==="honey" ? 1.4 : 1.0; }
      else if(o.k!=="sling"){ o.vy=Math.min(5, o.vy+GRAV); move(G, o, o.vx, 0); if(o.hitX){ o.vx=-o.vx; o.hitX=0; } move(G, o, 0, o.vy); if(o.k==="honey" && o.ground) o.vy=-3.6; }
      if(o.y>NR*TS){ G.items.splice(k, 1); continue; }
      if(p.x+p.w>o.x && p.x<o.x+o.w && p.y+p.h>o.y && p.y<o.y+o.h){ G.items.splice(k, 1); snd(i, "power");
        if(o.k==="mix"){ grow(G, p.pw==="small" ? "big" : p.pw); score(G, 1000, o.x, o.y); }
        else if(o.k==="sling"){ grow(G, "sling"); score(G, 1000, o.x, o.y); }
        else if(o.k==="honey"){ p.honey=600; score(G, 1000, o.x, o.y); }
        else if(o.k==="can"){ G.lives++; pop(G, o.x, o.y, "1 UP", "#8aff8a"); } } }
    // the pinecones you throw: they bounce along, and knock over what they hit
    for(let k=G.shots.length-1;k>=0;k--){ const s=G.shots[k]; s.t++; s.vy=Math.min(5, s.vy+0.35); const b={x:s.x, y:s.y, w:6, h:6, vy:s.vy};
      move(G, b, s.vx, 0); if(b.hitX || s.t>140){ G.shots.splice(k, 1); continue; } move(G, b, 0, s.vy); s.x=b.x; s.y=b.y; if(b.ground) s.vy=-3.2; else s.vy=b.vy;
      if(s.x<G.camX-10 || s.x>G.camX+W+10){ G.shots.splice(k, 1); continue; }
      for(const f of G.foes) if(!f.dead && f.active && s.x+6>f.x && s.x<f.x+f.w && s.y+6>f.y && s.y<f.y+f.h){ G.shots.splice(k, 1);
        if(f.boss){ f.hp-=0.5; f.hit=40; if(f.hp<=0) bossDown(G, f, i); else snd(i, "bump"); }
        else { f.dead=1; f.vy=-3; score(G, 200, f.x, f.y); snd(i, "stomp"); } break; } }
    // the critters
    let chain=0;
    for(const f of G.foes){
      if(f.dead){ f.dead++; if(f.flat){ continue; } f.vy+=0.3; f.y+=f.vy; continue; }
      if(!f.active){ if(f.x<G.camX+W+24) f.active=true; else continue; }
      if(f.x<G.camX-64 && !f.boss){ f.dead=999; continue; }
      f.t++;
      if(f.fish){ if(f.wait>0){ f.wait--; f.y=f.y0+40; continue; } if(f.vy===0 && f.y>=f.y0+39){ f.vy=-6.2; } f.vy+=0.18; f.y+=f.vy; if(f.y>f.y0+40){ f.y=f.y0+40; f.vy=0; f.wait=80+(f.t%60); } }
      else if(f.fly){ f.x+=f.vx; f.y=f.y0+Math.sin(f.t*0.05)*(f.kind==="bat" ? 26 : 18)-(f.kind==="bat" ? 8 : 20);
        if(f.kind==="bat" && Math.abs(p.x-f.x)<70 && p.y>f.y) f.y+=Math.min(24, (70-Math.abs(p.x-f.x))*0.5);
        if(f.t%240===0) f.vx=-f.vx; }
      else if(f.boss){ const toward=Math.sign(p.x-f.x)||1; if(f.hit>0) f.hit--;
        f.vx+=(toward*(1.1+(G.L/4)*0.12)-f.vx)*0.02; f.vy=Math.min(6, f.vy+GRAV); move(G, f, f.vx, 0); if(f.hitX){ f.vx=-f.vx; f.hitX=0; } move(G, f, 0, f.vy);
        if(--f.jumpT<=0 && f.ground){ f.vy=-5.5; f.jumpT=90+((f.t*7)%60); } }
      else { if(f.flipT>0){ f.flipT--; if(f.flipT===0){ f.flip=false; } }
        if(f.kind==="skunk"){ f.spray=Math.max(0, f.spray-1); if(Math.abs(p.x-f.x)<56 && Math.abs(p.y-f.y)<20 && f.spray===0 && f.t%90===0){ f.spray=50; G.fx.push({k:"spray", x:f.x+(f.vx>0 ? f.w : -24), y:f.y-4, t:0}); } }
        f.vy=Math.min(6, f.vy+GRAV);
        if(!f.flip){ move(G, f, f.vx, 0); if(f.hitX){ f.vx=-f.vx; f.hitX=0; } }
        move(G, f, 0, f.vy); if(f.y>NR*TS){ f.dead=999; continue; }
        // (beetles and porcupines turn at a ledge's edge; ticks and skunks walk off it)
        if((f.kind==="beetle" || f.kind==="porc") && f.ground){ const ahead=f.vx>0 ? f.x+f.w+1 : f.x-1, r=Math.floor((f.y+f.h+2)/TS); if(!solid(tAt(S, Math.floor(ahead/TS), r)) && tAt(S, Math.floor(ahead/TS), r)!==6) f.vx=-f.vx; } }
      // against you
      if(p.x+p.w>f.x+1 && p.x<f.x+f.w-1 && p.y+p.h>f.y+1 && p.y<f.y+f.h){
        const stomp=p.vy>0.5 && p.y+p.h-p.vy<=f.y+6 && f.kind!=="porc" && !(f.kind==="fish" && false);
        if(p.honey>0 && !f.boss){ f.dead=1; f.vy=-3; score(G, 200, f.x, f.y); snd(i, "stomp"); }
        else if(stomp){ p.vy=hold ? -5.6 : -3.8; chain++; const pts=[100, 200, 400, 800, 1000, 2000][Math.min(5, chain-1)];
          if(f.boss){ if(!f.hit){ f.hp--; f.hit=60; snd(i, "stomp"); if(f.hp<=0) bossDown(G, f, i); else { f.vx=-f.vx*1.5; f.vy=-4; } } }
          else if(f.kind==="beetle" && !f.flip){ f.flip=true; f.flipT=240; f.hp--; score(G, pts, f.x, f.y); snd(i, "stomp"); }
          else { f.dead=1; f.flat=f.kind==="tick" || f.kind==="beetle"; if(!f.flat) f.vy=-2; score(G, pts, f.x, f.y); snd(i, "stomp"); } }
        else if(f.flip){ f.dead=1; f.vy=-3; score(G, 200, f.x, f.y); snd(i, "stomp"); }
        else hurt(G, i); } }
    if(p.ground) chain=0;
    for(const o of G.fx) if(o.k==="spray" && o.t<50 && p.x+p.w>o.x && p.x<o.x+24 && p.y+p.h>o.y && p.y<o.y+18) hurt(G, i);
    G.foes=G.foes.filter(f=>!(f.dead>200 || (f.flat && f.dead>30)));
    // effects
    for(let k=G.fx.length-1;k>=0;k--){ const o=G.fx[k]; o.t++; if(o.k==="chip"){ o.vy+=0.3; o.x+=o.vx; o.y+=o.vy; }
      if(o.t>(o.k==="txt" ? 60 : o.k==="cone" ? 24 : o.k==="bump" ? 8 : o.k==="spray" ? 60 : 50)) G.fx.splice(k, 1); }
    // the cabin's door
    if(G.goal && p.x+p.w>G.goal.x+26 && p.x<G.goal.x+38 && p.ground){ G.clearT=1; p.vx=0; snd(i, "win"); score(G, 2000+(G.L%4)*500); }
  }
  function bossDown(G, f, i){ f.dead=1; f.vy=-4; score(G, 5000, f.x, f.y); G.bossDead=true; snd(i, "extra");
    const S=G.S; G.goal={x:(S.cols-6)*TS, y:12*TS+TS-64}; }

  /* ======================================================================
     DRAWING
     ====================================================================== */
  function paint(x, G, t){
    const S=G.S, cam=Math.round(G.camX), p=G.p;
    const [a, b]=BD[S.wi], fa=Math.round(cam*0.15)%W, fb=Math.round(cam*0.45)%W;
    x.drawImage(a, -fa, Y0); x.drawImage(a, W-fa, Y0); x.drawImage(b, -fb, Y0); x.drawImage(b, W-fb, Y0);
    x.drawImage(S.can, cam, 0, W, NR*TS, 0, Y0, W, NR*TS);
    const X=(v)=>Math.round(v-cam), Y=(v)=>Math.round(v+Y0);
    // the crates you bumped jump a little: drawn over the stage's canvas for a moment
    for(const o of G.fx) if(o.k==="bump"){ const u=o.t<4 ? o.t : 8-o.t; x.drawImage(S.can, o.c*TS, o.r*TS, TS, TS, X(o.c*TS), Y(o.r*TS-u*1.5), TS, TS); }
    if(G.goal) x.drawImage(SPR.cabin, X(G.goal.x), Y(G.goal.y));
    for(const m of G.marks) x.drawImage(SPR.mark[m.on ? 1 : 0], X(m.x), Y(m.y));
    for(const s of G.springs) x.drawImage(SPR.spring[s.sq>0 ? 1 : 0], X(s.x), Y(s.y));
    for(const r of G.rafts) x.drawImage(SPR.raft, X(r.x), Y(r.y));
    for(const c of G.cones){ const bob=Math.sin((t*3+c.x*0.1))*1.5; x.drawImage(SPR.cone, X(c.x), Y(c.y+bob)); }
    for(const o of G.items) x.drawImage(SPR[o.k], X(o.x), Y(o.y));
    for(const f of G.foes){ if(!f.active) continue; const ph=((f.t/10)|0)%2, d=f.vx>0 ? 0 : 1;
      if(f.boss){ if(f.hit>0 && (f.hit>>2)%2) continue; x.drawImage(SPR["bear"+(f.ground ? 1+(((f.t/8)|0)%2) : 0)][f.vx>0 ? 0 : 1], X(f.x-1), Y(f.y-2)); continue; }
      let s=f.flip ? SPR.beetleFlip[d] : SPR[f.kind+ph][d];
      if(f.flat && f.dead){ x.drawImage(s, 0, 0, s.width, s.height, X(f.x), Y(f.y+f.h-4), s.width, 4); continue; }
      if(f.dead){ x.save(); x.translate(X(f.x+f.w/2), Y(f.y+f.h/2)); x.scale(1, -1); x.drawImage(s, -s.width/2, -s.height/2); x.restore(); continue; }
      x.drawImage(s, X(f.x+(f.w-s.width)/2), Y(f.y+f.h-s.height)); }
    for(const s of G.shots) x.drawImage(SPR.pebble, X(s.x), Y(s.y));
    for(const o of G.fx){
      if(o.k==="chip"){ x.fillStyle="#8a5a2a"; x.fillRect(X(o.x), Y(o.y), 4, 4); }
      else if(o.k==="cone"){ x.drawImage(SPR.cone, X(o.x), Y(o.y-o.t*1.2)); }
      else if(o.k==="spray"){ x.fillStyle="rgba(150,170,90,"+(0.55*(1-o.t/60)).toFixed(2)+")"; for(let q=0;q<4;q++){ x.beginPath(); x.arc(X(o.x+6+q*5), Y(o.y+8+Math.sin(o.t*0.2+q)*3), 6+o.t*0.08, 0, 7); x.fill(); } } }
    // Rosie
    if(p.dead){ x.drawImage(ROSE.dead, X(p.x), Y(p.y)); }
    else if(!(p.inv>0 && ((G.t>>2)%2))){
      const pw=p.honey>0 && ((G.t>>2)%2) ? "star" : p.pw, fr=!p.ground ? "jump" : Math.abs(p.vx)>0.1 ? (((p.wf|0)%2) ? "w1" : "w2") : "stand";
      x.drawImage(ROSE[pw+fr][p.dir>0 ? 0 : 1], X(p.x), Y(p.y+p.h-(pw==="small" ? 16 : 24)-0)); }
    x.textAlign="center"; x.textBaseline="middle";
    for(const o of G.fx) if(o.k==="txt"){ _cbFont(x, 9); x.fillStyle=o.col; x.globalAlpha=Math.max(0, 1-o.t/60); x.fillText(o.txt, clamp(X(o.x), 20, W-20), Y(o.y-o.t*0.5)); x.globalAlpha=1; }
    // the top line: score, pinecones, world, time, lives
    x.fillStyle="#000"; x.fillRect(0, 0, W, Y0); _cbFont(x, 11); x.textBaseline="middle";
    // (the line sits clear of the tube's edge: 14 px down, 12 in from either side)
    x.textAlign="left"; x.fillStyle="#f2c84a"; x.fillText(String(G.score).padStart(6, "0"), 12, 14);
    x.drawImage(SPR.cone, 64, 9); x.fillStyle="#e8d8b0"; x.fillText("×"+String(G.coins).padStart(2, "0"), 74, 14);
    x.drawImage(ROSE.smallstand[0], 0, 0, 12, 7, 110, 10, 12, 7); x.fillText("×"+G.lives, 123, 14);
    x.textAlign="center"; x.fillStyle="#9ad87a"; x.fillText("WORLD "+(S.wi+1)+"-"+(S.si+1), 204, 14);
    x.textAlign="right"; x.fillStyle=G.time<=100 && ((G.t>>3)%2) ? "#ff6a4a" : "#e8d8b0"; x.fillText("TIME "+G.time, W-12, 14);
  }

  function newGame(){ const w=Math.max(0, Math.min(4, _RRM._world||0));
    const G={score:0, coins:0, lives:3, over:false, won:false, t:0, acc:0, reached:w, p:{w:12, h:14, pw:"small", dir:1}, jump:false, fire:false};
    enter(G, w*4, 0); return G; }
  let D=null;
  // the attract mode: a stage of the meadow played by itself, Rosie running and hopping
  function demo(){ if(!D){ D={score:0, coins:0, lives:9, over:false, won:false, t:0, acc:0, reached:0, p:{w:12, h:14, pw:"small", dir:1}, jump:false, fire:false}; enter(D, ((Date.now()/60000)|0)%5*4, 0); D.msgT=0; } return D; }
  const AK={};
  return {
    name:"RIDGE RAMBLER", col:"#9ad87a", _world:0,
    help:"RIDGE RAMBLER · A/D OR ARROWS PWALK · SHIFT RUNS · SPACE OR W JUMPS · J THROWS · N NEW GAME · ESC STEPS AWAY",
    newGame:newGame,
    key(G, e){ if(e.repeat) return;
      if(e.code==="Space" || e.code==="ArrowUp" || e.code==="KeyW" || e.code==="KeyK") G.jump=true;
      if(e.code==="KeyJ" || e.code==="KeyF" || e.code==="KeyX") G.fire=true; },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.Space||K.ArrowUp||K.KeyW||K.KeyK) ? 1 : 0]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=Math.min(dt, 0.1); while(G.acc>=1/60){ G.acc-=1/60; frame(G, K, i); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("rambler", G.score, "WORLD "+(((G.L/4)|0)+1)+"-"+(G.L%4+1)); } },
    draw(x, G, t){ paint(x, G, t);
      if(G.won) _cbMid(x, "THE SUMMIT!", "EVERY TRAIL WALKED · SPACE TO PLAY AGAIN");
      else if(G.over) _cbMid(x, "GAME OVER", "SPACE CARRIES ON FROM WORLD "+(((G.L/4)|0)+1));
      else if(G.clearT>0) _cbMid(x, G.L%4===3 ? "WORLD CLEAR" : "STAGE CLEAR", "TIME BONUS");
      else if(G.msgT>0) _cbMid(x, "WORLD "+(G.S.wi+1)+"-"+(G.S.si+1), G.S.Wd.n+(G.S.si===3 ? " · OLD GRIZZLY" : "")+" · ×"+G.lives);
      _cbTube(x); },
    attract(x, t, i){ const G=demo();
      // (a little pilot: run right, hop at walls, gaps and critters)
      const p=G.p, S=G.S; AK.ArrowRight=true; AK.ShiftLeft=((t*0.3)|0)%2===0;
      const c=Math.floor((p.x+p.w+6)/TS), r=Math.floor((p.y+p.h-1)/TS);
      if(solid(tAt(S, c, r)) || !tAt(S, c, r+1) || tAt(S, c, r+1)===8 || tAt(S, c, r+1)===7 || G.foes.some(f=>f.active && !f.dead && f.x-p.x>0 && f.x-p.x<34 && Math.abs(f.y-p.y)<28)) G.jump=true;
      AK.Space=true;
      let n=0; G.acc=(G.acc||0)+1/12; while(G.acc>=1/60 && n++<8){ G.acc-=1/60; frame(G, AK, -1); }
      if(G.over || G.p.dead>100 || G.clearT>60 || G.t>60*90) D=null;
      paint(x, G, t);
      if(((t/7)|0)%2===0){ x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(40, 92, W-80, 76);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28); x.fillStyle="#9ad87a"; x.fillText("RIDGE", W/2, 114); x.fillStyle="#f2c84a"; x.fillText("RAMBLER", W/2, 146); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 70, W-80, 110); _cbTopDraw(x, "rambler", 86, "#9ad87a"); }
      _cbFoot(x, i, t); _cbTube(x); },
    // for tools and testing
    _debug:{build:build, CH:CH, WORLDS:WORLDS, frame:frame, enter:enter}
  };
})();
/* ---- into 18g's cabinets: cabinet 20 (12c's sixteenth) ---- */
_CBG[20]=_RRM;
{ const L=_cbTop("rambler"); if(L.length) CABS.hi[20]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[20]; if(R){ _RRM.attract(R.x, 0, 20); R.tex.needsUpdate=true; } }
