"use strict";
/* REST AREA · 18f-raiders.js
   ASTRO RAIDERS, the cabinet in the arcade (12c) you can play
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18f · ASTRO RAIDERS

   E at the cabinet stands you at it, the screen in front of you and the
   stick under your hand; you play on the cabinet's own screen, with no
   window over the world. A/D or the arrows move the cannon (the stick
   leans with them), Space or a click fires, N (or Space, when it is
   over) starts again, Esc or E steps away.

   The game follows the rules of yojoecool's Space Invaders (MIT, 2018),
   the reference it was built from: five columns of five invaders, the
   rows a squid (one hit), an octopus (three) and a crab (two) in turn,
   each taking no more hits than the level's number; the block marches
   sideways and steps down at the edges, each invader firing on its own
   slow clock; two shots of yours on the screen at once; five lives, a
   pause when you are hit, a hundred a hit (and, as in the arcade game,
   nothing taken off for being hit); three levels, faster each time, and
   the game over if they reach you. The sprites are drawn here
   as pixel art, not taken from a sheet, and the march is the four-note
   bass, quickening as their numbers thin.
   ---------------------------------------------------------------------- */
const RAIDERS={on:false, g:null, keys:{}, t:0, acc:0, stars:null, fire:false, march:0, marchT:0};
const _RD={W:336, H:280, top:30, pw:26, ph:16, pspeed:150, shot:230, eshot:115, step:7, lives:5, levels:[40, 62, 84]};
// the sprites, two frames each, a character a pixel ('#' lit)
const _RS={
  squid:[["...##...","..####..",".######.","##.##.##","########","..#..#..",".#.##.#.","#.#..#.#"],
         ["...##...","..####..",".######.","##.##.##","########",".#.##.#.","#......#",".#....#."]],
  crab:[["..#.....#..","...#...#...","..#######..",".##.###.##.","###########","#.#######.#","#.#.....#.#","...##.##..."],
        ["..#.....#..","#..#...#..#","#.#######.#","###.###.###","###########",".#########.","..#.....#..",".#.......#."]],
  octo:[["....####....",".##########.","############","###..##..###","############","...##..##...","..##.##.##..","##........##"],
        ["....####....",".##########.","############","###..##..###","############","..###..###..",".##..##..##.","..##....##.."]],
  ship:[["......#......",".....###.....",".....###.....",".###########.","#############","#############","#############","#############"]],
  boom:[["#...#..#...#.",".#..#..#..#..","..#.....#....","##.........##","..#.....#....",".#..#..#..#..","#...#..#...#.","............."]]
};
// (the reference's three: one hit, three, two; a row's kind is its number mod three)
const _RK=[{sp:"squid", hits:1, col:"#ff6ad8", anim:0.58}, {sp:"octo", hits:3, col:"#7affb0", anim:1.6}, {sp:"crab", hits:2, col:"#6ad8ff", anim:1.15}];
function _rdSprite(x, rows, px, py, s, col){
  x.fillStyle=col;
  for(let r=0;r<rows.length;r++){ const row=rows[r]; for(let c=0;c<row.length;c++) if(row[c]==="#") x.fillRect(px+c*s, py+r*s, s, s); }
}
function _rdLevel(n){
  const G=RAIDERS.g; G.level=n; G.dir=1; G.down=false; G.eshots=[]; G.shots=[]; G.wait=0; G.msg="";
  G.en=[];
  for(let i=0;i<5;i++) for(let j=0;j<5;j++){
    const K=_RK[j%3], w=_RS[K.sp][0][0].length*2;
    G.en.push({x:12+i*40+(24-w)/2, y:_RD.top+16+j*22, w:w, h:16, k:j%3, lives:Math.min(K.hits, n),
               fire:3.3+Math.random()*16.7, frame:0, at:Math.random()*K.anim, hitT:0, dead:0});
  }
  G.left=25;
}
RAIDERS.newGame=function(){
  RAIDERS.g={score:0, lives:_RD.lives, x:_RD.W/2-_RD.pw/2, level:1, over:false, won:false, pause:0, between:0, boomT:0};
  _rdLevel(1);
};
RAIDERS.start=function(){
  const R=ARCADE.raiders; if(!R || RAIDERS.on) return;
  if(typeof DARTS!=="undefined" && DARTS.on) DARTS.stop();
  if(typeof HOCKEY!=="undefined" && HOCKEY.on) HOCKEY.stop();
  if(typeof HOOPS!=="undefined" && HOOPS.on) HOOPS.stop();
  RAIDERS.on=true; RAIDERS.keys={}; clearKeys();
  if(seated) standUp();
  if(!RAIDERS.g || RAIDERS.g.over || RAIDERS.g.won) RAIDERS.newGame();
  if(typeof AUDIO!=="undefined") AUDIO.blip("coin", R.screen.x, R.screen.z);
  toast("ASTRO RAIDERS · A/D OR ARROWS MOVE · SPACE FIRES · ESC TO STEP AWAY","#ff8ae0");
};
RAIDERS.stop=function(){ RAIDERS.on=false; RAIDERS.keys={}; player.pitch=-0.1; if(ARCADE.stick) ARCADE.stick.rotation.z=0; };
RAIDERS.key=function(e){
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ if(!e.repeat) RAIDERS.stop(); return; }
  const G=RAIDERS.g;
  if((e.code==="KeyN" || e.code==="Enter") && !e.repeat){ RAIDERS.newGame(); return; }
  if(e.code==="Space" && !e.repeat){ if(G && (G.over || G.won)) RAIDERS.newGame(); else RAIDERS.fire=true; return; }
  RAIDERS.keys[e.code]=true;
};
addEventListener("keyup", e=>{ RAIDERS.keys[e.code]=false; });
renderer.domElement.addEventListener("mousedown", e=>{ if(RAIDERS.on && e.button===0 && document.pointerLockElement===renderer.domElement) RAIDERS.fire=true; });
function _rdSnd(k){ const R=ARCADE.raiders; if(typeof AUDIO!=="undefined" && R) AUDIO.blip(k, R.screen.x, R.screen.z); }
// one step of the game, dt in seconds
function _rdStep(dt){
  const G=RAIDERS.g, W=_RD.W, H=_RD.H, py=H-6-_RD.ph;
  if(G.over || G.won) return;
  if(G.between>0){ G.between-=dt; if(G.between<=0) _rdLevel(G.level+1); return; }
  if(G.pause>0){ G.pause-=dt; G.shots=[]; G.eshots=[]; if(G.pause<=0) G.x=W/2-_RD.pw/2; return; }
  // the cannon, and your shots (two at a time)
  const K=RAIDERS.keys, mv=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0);
  G.x=clamp(G.x+mv*_RD.pspeed*dt, 2, W-_RD.pw-2);
  if(ARCADE.stick) ARCADE.stick.rotation.z=-mv*0.35;
  if(RAIDERS.fire){ RAIDERS.fire=false; if(G.shots.length<2){ G.shots.push({x:G.x+_RD.pw/2-1, y:py-4}); _rdSnd("zap"); } }
  for(const s of G.shots) s.y-=_RD.shot*dt;
  G.shots=G.shots.filter(s=>s.y>_RD.top && !s.gone);
  // the block: across, and down a step when any of it reaches a side
  const sp=_RD.levels[G.level-1];
  let edge=false;
  for(const e of G.en){ if(e.dead>0) continue; e.x+=G.dir*sp*dt; if(e.x<=2 || e.x+e.w>=W-2) edge=true; }
  if(edge){ G.dir=-G.dir; for(const e of G.en) if(!e.dead){ e.y+=_RD.step; e.x+=G.dir*2; } }
  for(const e of G.en){
    if(e.dead>0){ e.dead+=dt; continue; }
    const k=_RK[e.k]; e.at+=dt; if(e.at>=k.anim){ e.at=0; e.frame^=1; }
    if(e.hitT>0) e.hitT-=dt;
    e.fire-=dt; if(e.fire<=0){ e.fire=3.3+Math.random()*16.7; if(G.eshots.length<12) G.eshots.push({x:e.x+e.w/2-1, y:e.y+e.h}); }
    if(e.y+e.h>py-2){ G.over=true; G.boomT=1.2; _rdSnd("boom"); }
  }
  // their shots, and what yours hit
  for(const s of G.eshots) s.y+=_RD.eshot*dt;
  for(const s of G.shots) for(const e of G.en){
    if(s.gone || e.dead || s.x+2<e.x || s.x>e.x+e.w || s.y+6<e.y || s.y>e.y+e.h) continue;
    s.gone=true; G.score+=100; e.lives--;
    if(e.lives<=0){ e.dead=0.0001; G.left--; _rdSnd("invkill"); } else { e.hitT=0.12; _rdSnd("invhit"); }
  }
  G.shots=G.shots.filter(s=>!s.gone);
  for(const s of G.eshots){
    if(s.x+2>=G.x+2 && s.x<=G.x+_RD.pw-2 && s.y+6>=py+3 && s.y<=py+_RD.ph){
      s.gone=true; G.lives--; G.boomT=1.2; _rdSnd("boom");
      if(G.lives<=0) G.over=true; else G.pause=2.5;
    }
  }
  G.eshots=G.eshots.filter(s=>!s.gone && s.y<H);
  if(G.boomT>0) G.boomT-=dt;
  // the march: four notes round, the gap between them closing as the block thins and the levels go
  if(!G.over){ RAIDERS.marchT-=dt; if(RAIDERS.marchT<=0){ RAIDERS.marchT=(15+50/G.level)/60*(0.35+0.65*G.left/25); _rdSnd("march"+RAIDERS.march); RAIDERS.march=(RAIDERS.march+1)%4; } }
  // the last of them gone: the next level, or the win
  if(G.left<=0 && G.between<=0){ if(G.level<3){ G.between=4.0; G.msg="LEVEL "+(G.level+1); } else { G.won=true; } }
}
// the picture: a starfield, the score line, the block, the cannon, the shots, the words
function _rdDraw(x, t){
  const W=_RD.W, H=_RD.H, G=RAIDERS.g, py=H-6-_RD.ph;
  x.fillStyle="#020208"; x.fillRect(0,0,W,H);
  if(!RAIDERS.stars){ RAIDERS.stars=[]; for(let i=0;i<46;i++) RAIDERS.stars.push({x:Math.random()*W, y:Math.random()*H, v:3+Math.random()*12, r:Math.random()<0.2?2:1}); }
  for(const s of RAIDERS.stars){ s.y=(s.y+s.v*0.016)%H; x.fillStyle=s.r>1?"rgba(255,255,255,0.75)":"rgba(190,200,255,0.5)"; x.fillRect(s.x, s.y, s.r, s.r); }
  x.textBaseline="middle"; x.font="bold 13px 'Courier New', monospace";
  x.fillStyle="#f4f4f4"; x.textAlign="left"; x.fillText("SCORE "+String(G.score).padStart(5,"0"), 14, 15);
  x.textAlign="right"; x.fillText("LV "+G.level, W-118, 15);
  for(let i=0;i<G.lives;i++) _rdSprite(x, _RS.ship[0], W-104+i*18, 9, 1, "#7aff7a");
  x.fillStyle="rgba(255,255,255,0.6)"; x.fillRect(10, _RD.top-3, W-20, 1);
  // the invaders
  for(const e of G.en){
    if(e.dead>0){ if(e.dead<0.25) _rdSprite(x, _RS.boom[0], e.x, e.y+2, 2, "#ffffff"); continue; }
    if(e.hitT>0 && ((e.hitT*30)|0)%2) continue;
    const k=_RK[e.k]; _rdSprite(x, _RS[k.sp][e.frame], e.x, e.y, 2, k.col);
  }
  // the cannon (an explosion while it is down), the shots
  if(G.pause>0 || (G.over && G.boomT>0)){ if(((t*12)|0)%2) _rdSprite(x, _RS.boom[0], G.x, py, 2, "#7aff7a"); }
  else if(!G.over) _rdSprite(x, _RS.ship[0], G.x, py, 2, "#7aff7a");
  x.fillStyle="#ffffff"; for(const s of G.shots) x.fillRect(s.x, s.y, 2, 6);
  x.fillStyle="#ff5a3a"; for(const s of G.eshots){ x.fillRect(s.x, s.y, 2, 6); x.fillRect(s.x+((s.y/4|0)%2?1:-1), s.y+2, 2, 2); }
  // the words in the middle
  x.textAlign="center"; x.fillStyle="#ffffff";
  const mid=(a, b)=>{ x.font="bold 22px 'Courier New', monospace"; x.fillText(a, W/2, H/2-8); if(b){ x.font="bold 12px 'Courier New', monospace"; x.fillText(b, W/2, H/2+18); } };
  if(G.won) mid("YOU WIN!!!", "SPACE TO PLAY AGAIN");
  else if(G.over) mid("GAME OVER", "SPACE TO PLAY AGAIN");
  else if(G.between>0) mid(G.msg);
  else if(G.pause>0) mid("LIVES: "+G.lives);
  // the tube: scan lines, and the corners darker
  x.fillStyle="rgba(0,0,0,0.22)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);
  const vg=x.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.85); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,0.55)"); x.fillStyle=vg; x.fillRect(0,0,W,H);
}
// when nobody is playing: the title, the score table, a few of them marching, INSERT COIN flashing
function _rdAttract(x, t){
  const W=_RD.W, H=_RD.H;
  x.fillStyle="#020208"; x.fillRect(0,0,W,H);
  x.textAlign="center"; x.textBaseline="middle";
  x.font="bold 30px 'Courier New', monospace"; x.fillStyle="#ff6ad8"; x.fillText("ASTRO", W/2, 46); x.fillStyle="#6ad8ff"; x.fillText("RAIDERS", W/2, 78);
  x.font="bold 13px 'Courier New', monospace";
  const rows=[[0,"= 100 · 1 HIT"],[2,"= 100 · 2 HITS"],[1,"= 100 · 3 HITS"]];
  rows.forEach(([k,s],i)=>{ const K=_RK[k], f=((t*1.6)|0)%2; _rdSprite(x, _RS[K.sp][f], W/2-92, 112+i*26, 2, K.col); x.fillStyle="#f4f4f4"; x.textAlign="left"; x.fillText(s, W/2-58, 120+i*26); });
  x.textAlign="center";
  if(((t*2)|0)%2){ x.fillStyle="#f2e23a"; x.fillText("INSERT COIN · E TO PLAY", W/2, H-46); }
  x.fillStyle="#9a9aaa"; x.fillText("HI SCORE "+String(RAIDERS.hi||0).padStart(5,"0"), W/2, H-22);
  x.fillStyle="rgba(0,0,0,0.22)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);
}
function updateRaiders(dt){
  const R=ARCADE.raiders; if(!R) return;
  RAIDERS.t+=dt;
  if(RAIDERS.on){
    const n=Math.max(1, Math.ceil(dt*120)), h=dt/n;
    for(let i=0;i<n;i++) _rdStep(h);
    const G=RAIDERS.g; RAIDERS.hi=Math.max(RAIDERS.hi||0, G.score);
    _rdDraw(R.x, RAIDERS.t); R.tex.needsUpdate=true;
    // you, at the cabinet, looking down at its screen
    player.pos.set(R.stand.x, 0, R.stand.z); player.feetY=R.floor; player.yaw=R.ry;
    const d=Math.hypot(R.stand.x-R.screen.x, R.stand.z-R.screen.z);
    player.pitch=Math.atan2(R.screenY-(R.floor+EYE), d);
    return;
  }
  // its attract mode, a dozen frames a second while anyone is near enough to see it
  const cam=camera.position; if(Math.hypot(cam.x-R.screen.x, cam.z-R.screen.z)>14 || Math.abs(cam.y-R.screenY)>4) return;
  RAIDERS.acc+=dt; if(RAIDERS.acc<1/12) return; RAIDERS.acc=0;
  _rdAttract(R.x, RAIDERS.t); R.tex.needsUpdate=true;
}
if(ARCADE.raiders){ _rdAttract(ARCADE.raiders.x, 0); ARCADE.raiders.tex.needsUpdate=true; }
