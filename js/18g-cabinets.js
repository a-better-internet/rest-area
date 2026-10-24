"use strict";
/* REST AREA · 18g-cabinets.js
   the arcade's other three cabinets (12c), played the way Astro Raiders is (18f)
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18g · MAZE MUNCHER, BRICKYARD BREAKOUT, BLOCK DROP

   Each plays as Astro Raiders does. E at the cabinet stands you at it,
   the screen in front of you and the stick under your hand, and you play
   on the cabinet's own screen with no window over the world. The arrows
   or WASD work the stick (it leans with them), N (or Space, when it is
   over) starts again, and Esc or E steps away. Nobody playing, each runs
   its attract mode.

   MAZE MUNCHER follows Ania Kubów's pac-man (MIT), the reference it was
   built from: her 28-by-28 maze, a dot a point, a power pellet ten and
   the ghosts scared for ten seconds, a scared ghost a hundred and back to
   its start. Blinky, Pinky, Inky and Clyde wander a step every quarter,
   two fifths, three tenths and half a second, turning at random when a
   wall or another ghost is in their way, and the tunnel runs across the
   middle. Here, as in the arcade, the muncher keeps going the way you
   last pushed him, you have three of him, and you win when the dots are
   gone (her 274).
   BRICKYARD BREAKOUT (the old Turnpike Racer, its marquee repainted)
   follows Sara Sánchez's 2D breakout game (MIT, after MDN's tutorial):
   a wall of five bricks by three, a point a brick, three lives, the ball
   faster once you have lost one, and the bat moved by the stick or the
   mouse, all at her canvas's speeds scaled to this screen.
   BLOCK DROP follows Jake Gordon's javascript-tetris (MIT): a well ten by
   twenty, the seven pieces drawn from a bag of four of each, left, right,
   rotate and drop (the keys repeat as you hold them), ten for a piece set
   down and a hundred for a row, doubling for each more cleared at once;
   the drop quickens as the rows go, and the score spins up to what it is.
   The pictures are drawn here, not taken from the references.
   ---------------------------------------------------------------------- */
const CABS={on:false, i:-1, keys:{}, t:0, acc:[0,0,0,0], hi:[0,0,0,0], state:[]};
const _CB={W:336, H:280};
function _cbSnd(i, k){ const R=ARCADE.cabs && ARCADE.cabs[i]; if(typeof AUDIO!=="undefined" && R) AUDIO.blip(k, R.screen.x, R.screen.z); }
const _cbFont=(x, px)=>{ x.font="bold "+px+"px 'Courier New', monospace"; };
// the tube: scan lines, and the corners darker
function _cbTube(x){
  const W=_CB.W, H=_CB.H;
  x.fillStyle="rgba(0,0,0,0.22)"; for(let y=0;y<H;y+=3) x.fillRect(0,y,W,1);
  const vg=x.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.85); vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,0.55)");
  x.fillStyle=vg; x.fillRect(0,0,W,H);
}
// the words in the middle, on a dark band so they read over the play
function _cbMid(x, a, b){
  const W=_CB.W, H=_CB.H;
  x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(0, H/2-26, W, b?56:36);
  x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#ffffff";
  _cbFont(x, 22); x.fillText(a, W/2, H/2-8);
  if(b){ _cbFont(x, 12); x.fillText(b, W/2, H/2+18); }
}
// the foot of every attract screen: INSERT COIN flashing, the high score
function _cbFoot(x, i, t){
  const W=_CB.W, H=_CB.H; x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 13);
  if(((t*2)|0)%2){ x.fillStyle="#f2e23a"; x.fillText("INSERT COIN · E TO PLAY", W/2, H-40); }
  x.fillStyle="#9a9aaa"; x.fillText("HI SCORE "+String(CABS.hi[i]||0).padStart(5,"0"), W/2, H-20);
}

/* ======================================================================
   BRICKYARD BREAKOUT
   ====================================================================== */
const _BO=(function(){
  const S=0.7, W=_CB.W, H=_CB.H, TOP=26;                             // her 480-wide canvas, scaled to this one
  const R=10*S, PH=10*S, PW=75*S, BW=75*S, BH=20*S, BP=10*S, ROWS=3, COLS=5;
  const BX0=(W-(COLS*BW+(COLS-1)*BP))/2, BY0=TOP+30*S;
  const ROWC=[["#e8402a","#ff8a6a","#8a1a10"],["#f08a24","#ffc070","#8a4a10"],["#f2c430","#fff090","#8a6a10"]];
  // the ball from just over the bat, up and to the right: two pixels a frame, three once you have lost one
  const serve=(G, fast)=>{ const v=(fast?3:2)*S*60; G.x=W/2; G.y=H-30*S; G.dx=v; G.dy=-v; G.px=(W-PW)/2; };
  const brick=(x, b, a)=>{ const c=ROWC[b.r]; x.globalAlpha=a===undefined?1:a;
    x.fillStyle=c[0]; x.fillRect(b.x, b.y, BW, BH); x.fillStyle=c[1]; x.fillRect(b.x, b.y, BW, 2); x.fillStyle=c[2]; x.fillRect(b.x, b.y+BH-2, BW, 2);
    x.fillStyle="rgba(0,0,0,0.25)"; x.fillRect(b.x+BW/2-1, b.y+2, 1, BH/2-2); x.fillRect(b.x+BW/4, b.y+BH/2, 1, BH/2-2); x.fillRect(b.x+BW*3/4, b.y+BH/2, 1, BH/2-2);
    x.fillRect(b.x, b.y+BH/2, BW, 1); x.globalAlpha=1; };
  const ball=(x, bx, by)=>{ x.fillStyle="#bfe8ff"; x.beginPath(); x.arc(bx, by, R, 0, Math.PI*2); x.fill();
    x.fillStyle="#0095dd"; x.beginPath(); x.arc(bx+1, by+1, R*0.7, 0, Math.PI*2); x.fill(); x.fillStyle="#ffffff"; x.fillRect(bx-3, by-3, 2, 2); };
  const bat=(x, px)=>{ x.fillStyle="#0095dd"; x.fillRect(px, H-PH, PW, PH); x.fillStyle="#6ad0ff"; x.fillRect(px, H-PH, PW, 2); };
  // one of her frames: the bricks, the walls, the floor (the bat or a life), the bat, the ball
  function frame(G, K, i){
    const f=1/60;
    for(const b of G.bricks){
      if(!b.on || !(G.x>b.x && G.x<b.x+BW && G.y>b.y && G.y<b.y+BH)) continue;
      G.dy=-G.dy; b.on=0; G.score++; _cbSnd(i, "brick");
      if(G.score===ROWS*COLS){ G.won=true; _cbSnd(i, "jingle"); return; } }
    if(G.x+G.dx*f>W-R || G.x+G.dx*f<R){ G.dx=-G.dx; _cbSnd(i, "wall"); }
    if(G.y+G.dy*f<TOP+R){ G.dy=-G.dy; _cbSnd(i, "wall"); }
    else if(G.y+G.dy*f>H-R){
      if(G.x>G.px && G.x<G.px+PW){ G.dy=-G.dy; _cbSnd(i, "paddle"); }
      else { G.lives--; _cbSnd(i, "boom"); if(!G.lives){ G.over=true; return; } serve(G, true); G.pause=1.4; return; } }
    const mv=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0);
    if(mv>0 && G.px<W-PW) G.px+=7*S; else if(mv<0 && G.px>0) G.px-=7*S;
    G.px=clamp(G.px, 0, W-PW);
    G.x+=G.dx*f; G.y+=G.dy*f;
  }
  return {
    name:"BRICKYARD BREAKOUT", col:"#ffb070",
    help:"BRICKYARD BREAKOUT · A/D, ARROWS OR THE MOUSE MOVE THE BAT · ESC TO STEP AWAY",
    newGame(){ const G={score:0, lives:3, over:false, won:false, pause:0, acc:0, bricks:[]};
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) G.bricks.push({x:BX0+c*(BW+BP), y:BY0+r*(BH+BP), r:r, on:1});
      serve(G, false); return G; },
    mouse(G, dx){ if(!G.over && !G.won) G.px=clamp(G.px+dx*0.5, 0, W-PW); },
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), 0]; },
    step(G, dt, K, i){
      if(G.over || G.won) return;
      if(G.pause>0){ G.pause-=dt; return; }
      G.acc+=dt;
      while(G.acc>=1/60){ G.acc-=1/60; frame(G, K, i); if(G.over || G.won || G.pause>0){ G.acc=0; break; } } },
    draw(x, G, t){
      x.fillStyle="#04060c"; x.fillRect(0,0,W,H);
      x.textBaseline="middle"; _cbFont(x, 13); x.fillStyle="#6ad0ff";
      x.textAlign="left"; x.fillText("SCORE "+G.score, 14, 14); x.textAlign="right"; x.fillText("LIVES "+G.lives, W-14, 14);
      x.fillStyle="rgba(106,208,255,0.5)"; x.fillRect(8, TOP-3, W-16, 1);
      for(const b of G.bricks) if(b.on) brick(x, b);
      if(!(G.pause>0 && ((t*8)|0)%2)) ball(x, G.x, G.y);
      bat(x, G.px);
      if(G.won) _cbMid(x, "YOU WIN, CONGRATS!", "SPACE TO PLAY AGAIN");
      else if(G.over) _cbMid(x, "GAME OVER", "SPACE TO PLAY AGAIN");
      else if(G.pause>0) _cbMid(x, "LIVES: "+G.lives);
      _cbTube(x); },
    // the attract mode: the wall, a ball working at it, a bat after the ball
    attract(x, t, i){
      x.fillStyle="#04060c"; x.fillRect(0,0,W,H);
      x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28);
      x.fillStyle="#e8402a"; x.fillText("BRICKYARD", W/2, 34); x.fillStyle="#3ab8ff"; x.fillText("BREAKOUT", W/2, 64);
      const gone=((t*0.6)|0)%16;
      for(let k=0;k<ROWS*COLS;k++){ const r=(k/COLS)|0, c=k%COLS; if((k*7)%15<gone) continue;
        brick(x, {x:BX0+c*(BW+BP), y:96+r*(BH+BP*0.6), r:r}, 0.9); }
      const u=(t*0.37)%2, v=(t*0.53)%2, bx=R+(W-2*R)*(u<1?u:2-u), by=150+(H-60-150)*(v<1?v:2-v);
      ball(x, bx, by); bat(x, clamp(bx-PW/2, 0, W-PW));
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ======================================================================
   MAZE MUNCHER
   ====================================================================== */
const _MM=(function(){
  const N=28, CS=9, W=_CB.W, H=_CB.H, OX=(W-N*CS)/2, OY=25;
  // her maze: 0 a dot, 1 wall, 2 the ghosts' lair, 3 a power pellet, 4 empty
  const MAZE=["1111111111111111111111111111","1000000000000110000000000001","1011110111110110111110111101","1311110111110110111110111131",
              "1011110111110110111110111101","1000000000000000000000000001","1011110111111111111110111101","1011110111111111111110111101",
              "1000000000000110000000000001","1111110111110110111110111111","1111110114444444444110111111","1111110114111221114110111111",
              "1111110114122222214110111111","4444440004122222214000444444","1111110114122222214110111111","1111110114111111114110111111",
              "1111110114111111114110111111","1000000004444444444000000001","1011110111110110111110111101","1011110111110110111110111101",
              "1300110000000000000000110031","1110110110111111110110110111","1110110110111111110110110111","1000000110000110000110000001",
              "1011111111110110111111111101","1011111111110110111111111101","1000000000000000000000000001","1111111111111111111111111111"].join("").split("").map(Number);
  const GH=[{n:"BLINKY", start:348, iv:0.25, col:"#ff2a2a"}, {n:"PINKY", start:376, iv:0.40, col:"#ffb0dc"},
            {n:"INKY", start:351, iv:0.30, col:"#3ae8ff"}, {n:"CLYDE", start:379, iv:0.50, col:"#ffb04a"}];
  const PSTART=490, PSTEP=0.15, SCARED=10;
  const DIR={left:-1, right:1, up:-N, down:N};
  const cx=k=>OX+(k%N)*CS+CS/2, cy=k=>OY+((k/N)|0)*CS+CS/2;
  // the walls drawn once: each wall cell's sides that face open floor, in the arcade's blue
  let wallC=null;
  function walls(){
    if(wallC) return wallC;
    wallC=cvs(W, H); const x=wallC.getContext("2d"), wall=k=>k>=0 && k<N*N && MAZE[k]===1;
    for(let k=0;k<N*N;k++){ if(MAZE[k]!==1) continue;
      const px=OX+(k%N)*CS, py=OY+((k/N)|0)*CS, c=k%N;
      x.fillStyle="#06063a"; x.fillRect(px, py, CS, CS);
      x.fillStyle="#3a5aff";
      if(c>0 && !wall(k-1)) x.fillRect(px+1, py, 1.5, CS);
      if(c<N-1 && !wall(k+1)) x.fillRect(px+CS-2.5, py, 1.5, CS);
      if(!wall(k-N) && k>=N) x.fillRect(px, py+1, CS, 1.5);
      if(!wall(k+N) && k<N*N-N) x.fillRect(px, py+CS-2.5, CS, 1.5); }
    // the lair's door
    x.fillStyle="#ffb0dc"; for(const k of [11*N+13, 11*N+14]) x.fillRect(OX+(k%N)*CS, OY+((k/N)|0)*CS+CS/2-1, CS, 2);
    return wallC;
  }
  // where a step from k takes you, or -1; the tunnel across row 13 joins its two ends (her 363/391, 392/364)
  const next=(k, d, ghost)=>{
    let n=k+d;
    if(d===-1 && k%N===0) n=k+N-1; else if(d===1 && k%N===N-1) n=k-N+1;
    if(n<0 || n>=N*N || MAZE[n]===1) return -1;
    if(!ghost && MAZE[n]===2) return -1;
    return n; };
  const muncher=(x, px, py, a, m, r)=>{ x.fillStyle="#f2e23a"; x.beginPath(); x.moveTo(px, py); x.arc(px, py, r, a+m, a-m+Math.PI*2); x.closePath(); x.fill(); };
  function ghost(x, px, py, col, d, scared, flash, t){
    const r=CS*0.5;
    x.fillStyle=scared ? (flash ? "#f4f4f4" : "#2a3aff") : col;
    x.beginPath(); x.arc(px, py-0.5, r, Math.PI, 0); x.lineTo(px+r, py+r);
    for(let k=0;k<3;k++){ const a=px+r-(k+0.5)*(2*r/3), w=((t*8)|0)%2 ? 1.5 : 0; x.lineTo(a, py+r-2+w); x.lineTo(a-r/3, py+r); }
    x.closePath(); x.fill();
    if(scared){ x.fillStyle=flash ? "#ff2a2a" : "#ffd8b0"; x.fillRect(px-2.5, py-1.5, 1.5, 1.5); x.fillRect(px+1, py-1.5, 1.5, 1.5); return; }
    const ex=d===-1?-1:d===1?1:0, ey=d===-N?-1:d===N?1:0;
    for(const s of [-1,1]){ x.fillStyle="#ffffff"; x.fillRect(px+s*2-1.2, py-2.2, 2.4, 2.8); x.fillStyle="#1a2aff"; x.fillRect(px+s*2-0.6+ex*0.7, py-1.4+ey*0.7, 1.2, 1.2); }
  }
  // a mover's place between its last cell and this one (a jump through the tunnel is not drawn across)
  const at=(m)=>{ const f=Math.min(1, m.t/m.iv), a=m.prev, b=m.k;
    if(Math.abs((a%N)-(b%N))>1) return [cx(b), cy(b)];
    return [cx(a)+(cx(b)-cx(a))*f, cy(a)+(cy(b)-cy(a))*f]; };
  function place(G){
    G.p={k:PSTART, prev:PSTART, t:0, iv:PSTEP, d:-1, want:-1, mouth:0};
    G.gh=GH.map(h=>({h:h, k:h.start, prev:h.start, t:0, iv:h.iv, d:[-1,1,N,-N][(Math.random()*4)|0], scared:false}));
    G.ready=1.6; G.dying=0; }
  function caught(G, i){ if(G.dying>0) return; G.dying=1.7; _cbSnd(i, "die"); }
  // whoever is on the muncher's cell: a scared ghost eaten and home, any other the end of him
  function meet(G, i){
    for(const g of G.gh){
      const same=g.k===G.p.k || (g.k===G.p.prev && g.prev===G.p.k);
      if(!same) continue;
      if(g.scared){ g.scared=false; g.prev=g.k=g.h.start; g.t=0; G.score+=100; G.pop={x:cx(G.p.k), y:cy(G.p.k), t:1}; _cbSnd(i, "eatghost"); }
      else { caught(G, i); return; } } }
  return {
    name:"MAZE MUNCHER", col:"#f2e23a",
    help:"MAZE MUNCHER · A/D/W/S OR ARROWS STEER · ESC TO STEP AWAY",
    newGame(i){ const G={score:0, lives:3, over:false, won:false, cells:MAZE.slice(), scared:0, chomp:0, pop:null};
      G.left=G.cells.filter(v=>v===0||v===3).length; place(G); _cbSnd(i, "jingle"); return G; },
    key(G, e){ const d={ArrowLeft:-1, KeyA:-1, ArrowRight:1, KeyD:1, ArrowUp:-N, KeyW:-N, ArrowDown:N, KeyS:N}[e.code]; if(d!==undefined) G.p.want=d; },
    lean(G){ const d=G.p.want; return [d===1?1:d===-1?-1:0, d===-N?1:d===N?-1:0]; },
    step(G, dt, K, i){
      if(G.over || G.won) return;
      if(G.pop){ G.pop.t-=dt; if(G.pop.t<=0) G.pop=null; }
      if(G.dying>0){ G.dying-=dt; if(G.dying<=0){ G.lives--; if(G.lives<=0) G.over=true; else place(G); } return; }
      if(G.ready>0){ G.ready-=dt; return; }
      if(G.scared>0){ G.scared-=dt; if(G.scared<=0) for(const g of G.gh) g.scared=false; }
      // the muncher: a step every PSTEP, the way you last pushed if that way is open, else on as he was going
      const p=G.p; p.t+=dt;
      if(p.t>=p.iv){
        p.t=0; p.prev=p.k;
        if(p.want!==p.d && next(p.k, p.want)>=0) p.d=p.want;
        const n=next(p.k, p.d);
        if(n>=0){ p.k=n; p.mouth++;
          const v=G.cells[n];
          if(v===0){ G.cells[n]=4; G.score++; G.left--; _cbSnd(i, "chomp"+(G.chomp^=1)); }
          else if(v===3){ G.cells[n]=4; G.score+=10; G.left--; G.scared=SCARED; for(const g of G.gh) g.scared=true; _cbSnd(i, "pellet"); }
          if(G.left<=0){ G.won=true; _cbSnd(i, "jingle"); return; } }
        meet(G, i); }
      // the ghosts, each on its own clock: on the way it is going while that is open, a new way at random when not
      for(const g of G.gh){ g.t+=dt; if(g.t<g.iv) continue; g.t=0; g.prev=g.k;
        const n=next(g.k, g.d, true);
        if(n>=0 && !G.gh.some(o=>o!==g && o.k===n)) g.k=n;
        else g.d=[-1,1,N,-N][(Math.random()*4)|0];
        meet(G, i); if(G.dying>0) return; } },
    draw(x, G, t){
      x.fillStyle="#000"; x.fillRect(0,0,W,H);
      x.drawImage(walls(), 0, 0);
      // the dots, and the pellets blinking
      x.fillStyle="#ffd8b0";
      for(let k=0;k<N*N;k++){ const v=G.cells[k];
        if(v===0) x.fillRect(cx(k)-1, cy(k)-1, 2, 2);
        else if(v===3 && ((t*4)|0)%2){ x.beginPath(); x.arc(cx(k), cy(k), 3.4, 0, Math.PI*2); x.fill(); } }
      const p=G.p, [px, py]=at(p), a={"-1":Math.PI, "1":0}[p.d] ?? (p.d===N?Math.PI/2:-Math.PI/2);
      if(G.dying>0){ const f=1-G.dying/1.7; if(f<0.85) muncher(x, px, py, -Math.PI/2, Math.min(Math.PI*0.999, 0.2+f*Math.PI*1.2), CS*0.55); }
      else muncher(x, px, py, a, (G.ready>0 ? 0.6 : 0.08+0.55*Math.abs(Math.sin((p.mouth+p.t/p.iv)*Math.PI/2))), CS*0.55);
      if(!(G.dying>0 && G.dying<1.2)) for(const g of G.gh){ const [gx, gy]=at(g); ghost(x, gx, gy, g.h.col, g.d, g.scared, g.scared && G.scared<2 && ((t*5)|0)%2, t); }
      if(G.pop){ x.fillStyle="#3ae8ff"; _cbFont(x, 9); x.textAlign="center"; x.textBaseline="middle"; x.fillText("100", G.pop.x, G.pop.y); }
      // the score line, the lives down the side
      x.textBaseline="middle"; _cbFont(x, 13); x.fillStyle="#f4f4f4";
      x.textAlign="left"; x.fillText("SCORE "+String(G.score).padStart(4,"0"), 14, 13);
      x.textAlign="right"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[1]||0)).padStart(4,"0"), W-14, 13);
      for(let k=0;k<G.lives-1;k++) muncher(x, W-OX/2, OY+20+k*16, Math.PI, 0.6, 5.5);
      if(G.won) _cbMid(x, "YOU HAVE WON!", "SPACE TO PLAY AGAIN");
      else if(G.over) _cbMid(x, "GAME OVER", "SPACE TO PLAY AGAIN");
      else if(G.ready>0){ x.fillStyle="#f2e23a"; _cbFont(x, 11); x.textAlign="center"; x.fillText("READY!", cx(PSTART), cy(PSTART+N)); }
      _cbTube(x); },
    // the attract mode: the four of them by name, and the chase across the foot, one way and back
    attract(x, t, i){
      x.fillStyle="#000"; x.fillRect(0,0,W,H);
      x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28);
      x.fillStyle="#f2e23a"; x.fillText("MAZE", W/2, 30); x.fillStyle="#3a5aff"; x.fillText("MUNCHER", W/2, 60);
      _cbFont(x, 12); x.fillStyle="#9a9aaa"; x.fillText("CHARACTER / NICKNAME", W/2, 90);
      GH.forEach((h, k)=>{ if(t%8<1+k*0.6) return; ghost(x, 96, 110+k*20, h.col, 1, false, false, t);
        x.fillStyle=h.col; x.textAlign="left"; x.fillText("- "+h.n, 116, 110+k*20); });
      const u=(t*0.18)%2, y=H-64;
      if(u<1){ const px=W+20-u*(W+80); muncher(x, px, y, Math.PI, 0.1+0.6*Math.abs(Math.sin(t*9)), 7);
        GH.forEach((h, k)=>ghost(x, px+26+k*16, y, h.col, -1, false, false, t)); }
      else { const px=-60+(u-1)*(W+80); muncher(x, px+60, y, 0, 0.1+0.6*Math.abs(Math.sin(t*9)), 7);
        GH.forEach((h, k)=>ghost(x, px+k*14, y, h.col, 1, true, false, t)); }
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ======================================================================
   BLOCK DROP
   ====================================================================== */
const _BD=(function(){
  const NX=10, NY=20, NU=5, BS=12, W=_CB.W, H=_CB.H, CX=108, CY=24;
  const SPEED={start:0.6, decrement:0.005, min:0.1};                 // seconds a row: at first, less each row cleared, never under
  const LEFT=3, RIGHT=1, UP=0, DOWN=2;
  // his pieces: a 4x4 bitmask for each of the four turns
  const P={
    i:{size:4, blocks:[0x0F00,0x2222,0x00F0,0x4444], color:"#3ae8ff"}, j:{size:3, blocks:[0x44C0,0x8E00,0x6440,0x0E20], color:"#3a6aff"},
    l:{size:3, blocks:[0x4460,0x0E80,0xC440,0x2E00], color:"#ff9a2a"}, o:{size:2, blocks:[0xCC00,0xCC00,0xCC00,0xCC00], color:"#f2e23a"},
    s:{size:3, blocks:[0x06C0,0x8C40,0x6C00,0x4620], color:"#4aff6a"}, t:{size:3, blocks:[0x0E40,0x4C40,0x4E00,0x4640], color:"#c06aff"},
    z:{size:3, blocks:[0x0C60,0x4C80,0xC600,0x2640], color:"#ff3a3a"} };
  const eachblock=(type, x, y, dir, fn)=>{ let row=0, col=0; const b=type.blocks[dir];
    for(let bit=0x8000; bit>0; bit>>=1){ if(b&bit) fn(x+col, y+row); if(++col===4){ col=0; ++row; } } };
  const get=(G, x, y)=>(G.blocks[x] ? G.blocks[x][y] : null);
  const occupied=(G, type, x, y, dir)=>{ let r=false; eachblock(type, x, y, dir, (x2, y2)=>{ if(x2<0 || x2>=NX || y2<0 || y2>=NY || get(G, x2, y2)) r=true; }); return r; };
  // four of each in the bag, drawn at random until it is empty
  function randomPiece(G){
    if(!G.bag.length) for(const k of "ijlostz") for(let n=0;n<4;n++) G.bag.push(P[k]);
    const type=G.bag.splice((Math.random()*G.bag.length)|0, 1)[0];
    return {type:type, dir:UP, x:Math.round(Math.random()*(NX-type.size)), y:0}; }
  function move(G, dir){
    let x=G.cur.x, y=G.cur.y; if(dir===RIGHT) x++; else if(dir===LEFT) x--; else if(dir===DOWN) y++;
    if(occupied(G, G.cur.type, x, y, G.cur.dir)) return false;
    G.cur.x=x; G.cur.y=y; return true; }
  function rotate(G, i){ const d=G.cur.dir===3 ? 0 : G.cur.dir+1; if(!occupied(G, G.cur.type, G.cur.x, G.cur.y, d)){ G.cur.dir=d; _cbSnd(i, "rotate"); } }
  function removeLines(G){
    let n=0;
    for(let y=NY-1; y>=0; --y){
      let full=true; for(let x=0;x<NX;x++) if(!get(G, x, y)) full=false;
      if(!full) continue;
      for(let yy=y; yy>=0; --yy) for(let x=0;x<NX;x++){ G.blocks[x]=G.blocks[x]||[]; G.blocks[x][yy]=yy===0 ? null : get(G, x, yy-1); }
      y++; n++; }
    if(n>0){ G.rows+=n; G.score+=100*Math.pow(2, n-1); G.step=Math.max(SPEED.min, SPEED.start-SPEED.decrement*G.rows); G.flash=0.25; }
    return n; }
  function drop(G, i){
    if(move(G, DOWN)) return;
    G.score+=10;
    eachblock(G.cur.type, G.cur.x, G.cur.y, G.cur.dir, (x, y)=>{ G.blocks[x]=G.blocks[x]||[]; G.blocks[x][y]=G.cur.type; });
    _cbSnd(i, removeLines(G) ? "line" : "lock");
    G.cur=G.next; G.next=randomPiece(G); G.actions=[];
    if(occupied(G, G.cur.type, G.cur.x, G.cur.y, G.cur.dir)){ G.over=true; _cbSnd(i, "boom"); } }
  function block(x, px, py, col, s){ s=s||BS;
    x.fillStyle=col; x.fillRect(px, py, s, s);
    x.fillStyle="rgba(255,255,255,0.35)"; x.fillRect(px, py, s, 2); x.fillRect(px, py, 2, s);
    x.fillStyle="rgba(0,0,0,0.35)"; x.fillRect(px, py+s-2, s, 2); x.fillRect(px+s-2, py, 2, s);
    x.strokeStyle="#000"; x.lineWidth=1; x.strokeRect(px+0.5, py+0.5, s-1, s-1); }
  return {
    name:"BLOCK DROP", col:"#7aff7a",
    help:"BLOCK DROP · A/D OR ARROWS MOVE · W/UP TURNS · S/DOWN DROPS · ESC TO STEP AWAY",
    newGame(i){ const G={blocks:[], bag:[], actions:[], dt:0, acc:0, score:0, vscore:0, rows:0, step:SPEED.start, over:false, won:false, flash:0, lean:[0,0], leanT:0};
      G.cur=randomPiece(G); G.next=randomPiece(G); return G; },
    // his keys go into a queue, one handled a frame; held, they repeat as the keyboard repeats them
    key(G, e){ if(G.over) return;
      const a={ArrowLeft:LEFT, KeyA:LEFT, ArrowRight:RIGHT, KeyD:RIGHT, ArrowUp:UP, KeyW:UP, ArrowDown:DOWN, KeyS:DOWN}[e.code];
      if(a===undefined) return;
      G.actions.push(a); G.lean=[a===RIGHT?1:a===LEFT?-1:0, a===UP?1:a===DOWN?-1:0]; G.leanT=0.15; },
    lean(G){ return G.leanT>0 ? G.lean : [0,0]; },
    step(G, dt, K, i){
      if(G.leanT>0) G.leanT-=dt;
      if(G.flash>0) G.flash-=dt;
      if(G.over) return;
      G.acc+=dt;
      while(G.acc>=1/60){ G.acc-=1/60;
        if(G.vscore<G.score) G.vscore++;
        const a=G.actions.shift();
        if(a===LEFT || a===RIGHT) move(G, a); else if(a===UP) rotate(G, i); else if(a===DOWN) drop(G, i);
        G.dt+=1/60; if(G.dt>G.step){ G.dt-=G.step; drop(G, i); }
        if(G.over){ G.acc=0; break; } } },
    draw(x, G, t){
      x.fillStyle="#05040a"; x.fillRect(0,0,W,H);
      // the well
      x.fillStyle="#0c0a18"; x.fillRect(CX, CY, NX*BS, NY*BS);
      x.fillStyle="rgba(255,255,255,0.04)"; for(let k=1;k<NX;k++) x.fillRect(CX+k*BS, CY, 1, NY*BS);
      for(let y=0;y<NY;y++) for(let xx=0;xx<NX;xx++){ const b=get(G, xx, y); if(b) block(x, CX+xx*BS, CY+y*BS, b.color); }
      if(!G.over) eachblock(G.cur.type, G.cur.x, G.cur.y, G.cur.dir, (bx, by)=>block(x, CX+bx*BS, CY+by*BS, G.cur.type.color));
      x.strokeStyle=G.flash>0 ? "#ffffff" : "#8a8aa0"; x.lineWidth=2; x.strokeRect(CX-1, CY-1, NX*BS+2, NY*BS+2);
      // the side: the score and the rows on the left, the next piece on the right
      x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 13);
      x.fillStyle="#9a9aaa"; x.fillText("SCORE", CX/2, 44); x.fillText("ROWS", CX/2, 104); x.fillText("NEXT", CX+NX*BS+(W-CX-NX*BS)/2, 34);
      x.fillStyle="#f4f4f4"; x.fillText(("00000"+Math.floor(G.vscore)).slice(-5), CX/2, 64); x.fillText(String(G.rows), CX/2, 124);
      const ux=CX+NX*BS+(W-CX-NX*BS-NU*BS)/2, uy=48, pad=(NU-G.next.type.size)/2;
      x.fillStyle="#0c0a18"; x.fillRect(ux, uy, NU*BS, NU*BS); x.strokeStyle="#8a8aa0"; x.lineWidth=1; x.strokeRect(ux-0.5, uy-0.5, NU*BS+1, NU*BS+1);
      eachblock(G.next.type, pad, pad, G.next.dir, (bx, by)=>block(x, ux+bx*BS, uy+by*BS, G.next.type.color));
      if(G.over) _cbMid(x, "GAME OVER", "SPACE TO PLAY AGAIN");
      _cbTube(x); },
    // the attract mode: the name in blocks, a few pieces coming down onto a stack
    attract(x, t, i){
      x.fillStyle="#05040a"; x.fillRect(0,0,W,H);
      x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28);
      x.fillStyle="#3ae8ff"; x.fillText("BLOCK", W/2, 30); x.fillStyle="#ff3a3a"; x.fillText("DROP", W/2, 60);
      const s=10, ox=W/2-NX*s/2, oy=84, rowsN=12;
      x.fillStyle="#0c0a18"; x.fillRect(ox, oy, NX*s, rowsN*s); x.strokeStyle="#8a8aa0"; x.lineWidth=1; x.strokeRect(ox-0.5, oy-0.5, NX*s+1, rowsN*s+1);
      const cols="ijlostz";
      for(let y=0;y<4;y++) for(let k=0;k<NX;k++) if((k*3+y*7)%5) block(x, ox+k*s, oy+(rowsN-1-y)*s, P[cols[(k+y)%7]].color, s);
      const ph=t*1.5, piece=P[cols[((ph/8)|0)%7]], fy=(ph%8);
      eachblock(piece, 3, Math.min(Math.floor(fy), rowsN-6), ((ph/2)|0)%4, (bx, by)=>block(x, ox+bx*s, oy+by*s, piece.color, s));
      _cbFoot(x, i, t); _cbTube(x); }
  };
})();

/* ======================================================================
   THE CABINETS: standing at one, playing, stepping away
   ====================================================================== */
const _CBG={1:_MM, 2:_BO, 3:_BD};                                    // by cabinet (12c): 0 is Astro Raiders, 18f's
CABS.start=function(i){
  const R=ARCADE.cabs && ARCADE.cabs[i], G=_CBG[i]; if(!R || !G || CABS.on) return;
  if(typeof DARTS!=="undefined" && DARTS.on) DARTS.stop();
  if(typeof HOCKEY!=="undefined" && HOCKEY.on) HOCKEY.stop();
  if(typeof HOOPS!=="undefined" && HOOPS.on) HOOPS.stop();
  if(typeof RAIDERS!=="undefined" && RAIDERS.on) RAIDERS.stop();
  CABS.on=true; CABS.i=i; CABS.keys={}; clearKeys();
  if(seated) standUp();
  const S=CABS.state[i]; if(!S || S.over || S.won) CABS.state[i]=G.newGame(i);
  _cbSnd(i, "coin");
  toast(G.help, G.col);
};
CABS.stop=function(){
  const R=ARCADE.cabs && ARCADE.cabs[CABS.i]; if(R && R.stick){ R.stick.rotation.x=0; R.stick.rotation.z=0; }
  CABS.on=false; CABS.i=-1; CABS.keys={}; player.pitch=-0.1;
};
CABS.key=function(e){
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ if(!e.repeat) CABS.stop(); return; }
  const i=CABS.i, G=_CBG[i], S=CABS.state[i];
  if((e.code==="KeyN" || e.code==="Enter") && !e.repeat){ CABS.state[i]=G.newGame(i); return; }
  if(e.code==="Space" && !e.repeat && S && (S.over || S.won)){ CABS.state[i]=G.newGame(i); return; }
  if(S && G.key) G.key(S, e);
  CABS.keys[e.code]=true;
};
// the mouse, where a game takes it (the bat)
CABS.mouse=function(dx, dy){ const G=_CBG[CABS.i], S=CABS.state[CABS.i]; if(G && S && G.mouse) G.mouse(S, dx, dy); };
addEventListener("keyup", e=>{ CABS.keys[e.code]=false; });
function updateCabs(dt){
  if(!ARCADE.cabs) return;
  CABS.t+=dt;
  const cam=camera.position;
  for(let i=1;i<4;i++){
    const R=ARCADE.cabs[i], G=_CBG[i]; if(!R || !G) continue;
    if(CABS.on && CABS.i===i){
      const S=CABS.state[i], n=Math.max(1, Math.ceil(dt*120)), h=dt/n;
      for(let k=0;k<n;k++) G.step(S, h, CABS.keys, i);
      CABS.hi[i]=Math.max(CABS.hi[i]||0, S.score);
      G.draw(R.x, S, CABS.t); R.tex.needsUpdate=true;
      const L=G.lean(S, CABS.keys); R.stick.rotation.z=-L[0]*0.35; R.stick.rotation.x=-L[1]*0.35;
      // you, at the cabinet, looking down at its screen
      player.pos.set(R.stand.x, 0, R.stand.z); player.feetY=R.floor; player.yaw=R.ry;
      const d=Math.hypot(R.stand.x-R.screen.x, R.stand.z-R.screen.z);
      player.pitch=Math.atan2(R.screenY-(R.floor+EYE), d);
      continue;
    }
    // its attract mode, a dozen frames a second while anyone is near enough to see it
    if(Math.hypot(cam.x-R.screen.x, cam.z-R.screen.z)>14 || Math.abs(cam.y-R.screenY)>4) continue;
    CABS.acc[i]+=dt; if(CABS.acc[i]<1/12) continue; CABS.acc[i]=0;
    G.attract(R.x, CABS.t, i); R.tex.needsUpdate=true;
  }
}
for(let i=1;i<4;i++){ const R=ARCADE.cabs && ARCADE.cabs[i]; if(R && _CBG[i]){ _CBG[i].attract(R.x, 0, i); R.tex.needsUpdate=true; } }
