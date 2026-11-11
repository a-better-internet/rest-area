"use strict";
/* REST AREA · 18p-slots.js
   the slot machines in the Pine Knot, under French Creek Pines' hall (14z)
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18p · LUCKY PINES and GOLD CREEK
   Four machines along the lounge's south wall, two of each, played the way
   the arcade's cabinets are (18g): ENTER at one stands you at it, its
   screen under your eyes and your hand on the handle, and Esc or E steps
   away. Five reels, three symbols showing on each, nine lines.
   The mechanics follow SynKrown Games' slots-js (MIT): a five-by-three
   window, paylines through it, the reels let go one after another from
   the left, a win paid for three, four or five alike from the first reel
   along a line (two cherries pay back the bet; the machine returns about 94 in the hundred over a long night). The symbols, the strips, the pay table and the pictures
   are this game's own. The pine is wild: it stands in for anything, and a
   line of pines pays the most of all.
   Space (or the handle: Down / S) spins. Up and Down (W / S) set the bet
   per line, one to five; Left and Right (A / D) how many lines, one to
   nine; M bets the most. The credits are shared by all four machines and
   kept between visits (localStorage, read and written in try/catch). Run
   dry and the bartender stakes you a hundred: Space takes it.
   ---------------------------------------------------------------------- */
const SLOTS={credits:200, key:"restarea.slots.credits", sim:null};
(function slots(){
  try{ const v=parseInt(localStorage.getItem(SLOTS.key), 10); if(isFinite(v) && v>=0) SLOTS.credits=v; }catch(e){}
  const save=()=>{ try{ localStorage.setItem(SLOTS.key, String(SLOTS.credits)); }catch(e){} };
  const W=_CB.W, H=_CB.H;
  // the symbols: weight on the strip, and the pay for 3, 4 and 5 alike (times the bet per line)
  const SYM=[
    {k:"cherry",    w:22, pay:[0,0,1,4,12,30]},
    {k:"bell",      w:18, pay:[0,0,0,6,18,50]},
    {k:"horseshoe", w:14, pay:[0,0,0,9,25,75]},
    {k:"bar",       w:12, pay:[0,0,0,12,35,100]},
    {k:"bar2",      w:8,  pay:[0,0,0,15,50,150]},
    {k:"seven",     w:5,  pay:[0,0,0,30,100,500]},
    {k:"pine",      w:4,  pay:[0,0,0,50,200,1000]}];
  const WILD=6, NR=5, ROWS=3;
  const LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1]];
  const LCOL=["#ff4a3a","#ffd23a","#3ad8ff","#7aff5a","#ff7ae0","#ffa03a","#a07aff","#5affc8","#ffffff"];
  // the strips: each reel its own shuffle of the weighted symbols, no symbol twice in a row
  const STRIPS=[];
  for(let r=0;r<NR;r++){ const q=_trng(4100+r*37), a=[];
    SYM.forEach((s, k)=>{ for(let n=0;n<s.w;n++) a.push(k); });
    for(let i=a.length-1;i>0;i--){ const j=(q()*(i+1))|0; [a[i], a[j]]=[a[j], a[i]]; }
    for(let pass=0;pass<4;pass++) for(let i=0;i<a.length;i++){ const n=(i+1)%a.length; if(a[i]===a[n]){ const j=(i+2+((q()*(a.length-3))|0))%a.length; [a[n], a[j]]=[a[j], a[n]]; } }
    STRIPS.push(a); }
  const symAt=(r, p)=>{ const s=STRIPS[r], L=s.length; return s[((Math.floor(p)%L)+L)%L]; };
  // what a window pays: each line, the first symbol that is not wild sets it; a run of wilds pays as pines if that is more
  function evaluate(grid, lines, bet){
    const wins=[]; let total=0;
    for(let l=0;l<lines;l++){ const row=LINES[l], s=row.map((rr, c)=>grid[c][rr]);
      let base=s.find(v=>v!==WILD); if(base===undefined) base=WILD;
      let n=0; while(n<NR && (s[n]===base || s[n]===WILD)) n++;
      let nw=0; while(nw<NR && s[nw]===WILD) nw++;
      let pay=SYM[base].pay[n]*bet, sym=base, cnt=n;
      const pw=SYM[WILD].pay[nw]*bet; if(pw>pay){ pay=pw; sym=WILD; cnt=nw; }
      if(pay>0){ wins.push({l:l, n:cnt, sym:sym, pay:pay}); total+=pay; } }
    return {wins:wins, total:total}; }
  const gridOf=offs=>offs.map((o, r)=>[symAt(r, o), symAt(r, o+1), symAt(r, o+2)]);
  // (for checking the return: node, SLOTS.sim(1e6) → what comes back per credit bet, all nine lines)
  SLOTS.sim=function(n){ let bet=0, won=0; const q=_trng(77);
    for(let i=0;i<n;i++){ const offs=STRIPS.map(s=>(q()*s.length)|0); bet+=9; won+=evaluate(gridOf(offs), 9, 1).total; } return won/bet; };

  /* ---- the pictures ---- */
  function sym(x, k, cx, cy, s){
    x.save(); x.translate(cx, cy); const u=s/56; x.scale(u, u);
    x.lineJoin="round"; x.lineCap="round";
    if(k===0){ // cherries: two on their stems, a leaf
      x.strokeStyle="#3a7a2a"; x.lineWidth=3; x.beginPath(); x.moveTo(-9, 8); x.quadraticCurveTo(-4, -10, 6, -18); x.moveTo(9, 10); x.quadraticCurveTo(8, -6, 6, -18); x.stroke();
      x.fillStyle="#4aa03a"; x.beginPath(); x.ellipse(13, -17, 8, 4, -0.4, 0, 7); x.fill();
      for(const [px, py] of [[-10, 12],[10, 14]]){ const g=x.createRadialGradient(px-4, py-4, 1, px, py, 11); g.addColorStop(0, "#ff8a8a"); g.addColorStop(1, "#b0101a");
        x.fillStyle=g; x.beginPath(); x.arc(px, py, 10, 0, 7); x.fill(); } }
    else if(k===1){ // a bell, gold, its clapper
      const g=x.createLinearGradient(-18, 0, 18, 0); g.addColorStop(0, "#a86a10"); g.addColorStop(0.45, "#ffe27a"); g.addColorStop(1, "#b07a18");
      x.fillStyle=g; x.beginPath(); x.moveTo(0, -20); x.bezierCurveTo(13, -20, 13, -2, 16, 10); x.lineTo(20, 15); x.lineTo(-20, 15); x.lineTo(-16, 10); x.bezierCurveTo(-13, -2, -13, -20, 0, -20); x.fill();
      x.fillStyle="#7a4a08"; x.fillRect(-20, 13, 40, 3); x.beginPath(); x.arc(0, 19, 4.5, 0, 7); x.fill(); x.fillStyle="#ffe27a"; x.beginPath(); x.arc(0, -22, 3, 0, 7); x.fill(); }
    else if(k===2){ // a horseshoe, the open end up, its nail holes
      x.strokeStyle="#b8bcc4"; x.lineWidth=9; x.beginPath(); x.arc(0, 2, 15, Math.PI*0.95, Math.PI*2.05, true); x.stroke();
      x.strokeStyle="#6a6e76"; x.lineWidth=2; x.beginPath(); x.arc(0, 2, 15, Math.PI*0.95, Math.PI*2.05, true); x.stroke();
      x.fillStyle="#2a2a2e"; for(let a=0.15;a<=0.86;a+=0.14){ const t=Math.PI*(1-a)+Math.PI; void t; }
      for(let j=0;j<6;j++){ const t=Math.PI*(0.1+j*0.16); x.beginPath(); x.arc(Math.cos(t)*15, 2+Math.sin(t)*15, 1.6, 0, 7); x.fill(); } }
    else if(k===3 || k===4){ // BAR, one or two
      const n=k===3 ? 1 : 2, hh=n===1 ? 16 : 12;
      for(let j=0;j<n;j++){ const yy=n===1 ? -hh/2 : -hh-1+j*(hh+2);
        x.fillStyle="#1a1a1e"; x.fillRect(-22, yy, 44, hh); x.strokeStyle=k===3 ? "#ff5a3a" : "#3aa8ff"; x.lineWidth=2.5; x.strokeRect(-22, yy, 44, hh);
        x.fillStyle="#f2f0ea"; x.font="900 "+(hh-3)+"px 'Arial Black', Arial"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("BAR", 0, yy+hh/2+1); } }
    else if(k===5){ // a seven, red with a gold edge
      x.font="900 44px 'Arial Black', Arial"; x.textAlign="center"; x.textBaseline="middle";
      x.lineWidth=5; x.strokeStyle="#ffd23a"; x.strokeText("7", 0, 2); x.fillStyle="#e01a22"; x.fillText("7", 0, 2); }
    else { // the pine: wild
      x.fillStyle="#5a3a1e"; x.fillRect(-3, 12, 6, 9);
      const g=x.createLinearGradient(0, -24, 0, 14); g.addColorStop(0, "#5ad06a"); g.addColorStop(1, "#1a6a2a"); x.fillStyle=g;
      for(const [y0, w] of [[-24, 9],[-15, 14],[-5, 19]]){ x.beginPath(); x.moveTo(0, y0); x.lineTo(w, y0+16); x.lineTo(-w, y0+16); x.closePath(); x.fill(); }
      x.fillStyle="#ffe27a"; x.font="900 9px Arial"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("WILD", 0, 25); }
    x.restore(); }
  const RX=28, RY=46, CW=56, CH=52;                                   // the window: five reels by three
  function drawWindow(x, G, t){
    const bg=x.createLinearGradient(0, RY, 0, RY+CH*ROWS); bg.addColorStop(0, "#d8d2c0"); bg.addColorStop(0.5, "#fffcf2"); bg.addColorStop(1, "#d8d2c0");
    for(let r=0;r<NR;r++){ const X=RX+r*CW;
      x.save(); x.beginPath(); x.rect(X+2, RY, CW-4, CH*ROWS); x.clip(); x.fillStyle=bg; x.fillRect(X+2, RY, CW-4, CH*ROWS);
      const p=G.pos[r], f=p-Math.floor(p), blur=G.spin[r] ? 1 : 0;
      for(let j=-1;j<=ROWS;j++){ const k=symAt(r, Math.floor(p)+j), cy=RY+(j-f+0.5)*CH;
        if(blur){ x.globalAlpha=0.55; sym(x, k, X+CW/2, cy-6, 40); x.globalAlpha=0.35; sym(x, k, X+CW/2, cy+6, 40); x.globalAlpha=1; }
        else { const hit=G.show && G.hits && G.hits[r] && G.hits[r][j] && ((t*3)|0)%2; if(hit){ x.fillStyle="rgba(255,226,90,0.55)"; x.fillRect(X+3, cy-CH/2+1, CW-6, CH-2); } sym(x, k, X+CW/2, cy, 40); } }
      const sh=x.createLinearGradient(0, RY, 0, RY+CH*ROWS); sh.addColorStop(0, "rgba(0,0,0,0.35)"); sh.addColorStop(0.18, "rgba(0,0,0,0)"); sh.addColorStop(0.82, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.35)");
      x.fillStyle=sh; x.fillRect(X+2, RY, CW-4, CH*ROWS); x.restore();
      x.strokeStyle="#6a5a2a"; x.lineWidth=2; x.strokeRect(X+2, RY, CW-4, CH*ROWS); }
    // the lines being played, numbered down the sides; the winning ones drawn through the window
    x.font="bold 9px 'Courier New', monospace"; x.textAlign="center"; x.textBaseline="middle";
    for(let l=0;l<9;l++){ const on=l<G.lines, yy=RY+(LINES[l][0]+0.5)*CH+(l>2 ? (l%2 ? -9 : 9) : 0);
      x.fillStyle=on ? LCOL[l] : "#3a3a3e"; x.fillRect(6, yy-6, 16, 12); x.fillRect(W-22, yy-6, 16, 12); x.fillStyle="#000"; x.fillText(String(l+1), 14, yy); x.fillText(String(l+1), W-14, yy); }
    if(G.show && G.wins.length){ const w=G.wins[((t*1.2)|0)%G.wins.length], row=LINES[w.l];
      x.strokeStyle=LCOL[w.l]; x.lineWidth=3; x.globalAlpha=0.9; x.beginPath();
      for(let c=0;c<NR;c++){ const px=RX+c*CW+CW/2, py=RY+(row[c]+0.5)*CH; c ? x.lineTo(px, py) : x.moveTo(RX-4, py), c||x.lineTo(px, py); }
      x.lineTo(RX+NR*CW+4, RY+(row[NR-1]+0.5)*CH); x.stroke(); x.globalAlpha=1; } }
  function frame(x, name, col){
    const g=x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); x.fillStyle=g; x.fillRect(0, 0, W, H);
    x.fillStyle="rgba(0,0,0,0.35)"; x.fillRect(0, 0, W, 36);
    x.textAlign="center"; x.textBaseline="middle"; x.font="900 22px 'Arial Black', Arial"; x.lineWidth=4; x.strokeStyle="#3a1a08"; x.strokeText(name, W/2, 20);
    x.fillStyle="#ffd23a"; x.fillText(name, W/2, 20);
    for(let k=0;k<14;k++){ x.fillStyle=k%2 ? "#ffe27a" : "#ff8a3a"; x.beginPath(); x.arc(12+k*(W-24)/13, 39, 1.8, 0, 7); x.fill(); } }
  function meters(x, G){
    const y=RY+CH*ROWS+10;
    const box=(lab, val, x0, w, c)=>{ x.fillStyle="#0a0a0c"; x.fillRect(x0, y, w, 34); x.strokeStyle="#6a5a2a"; x.lineWidth=1.5; x.strokeRect(x0, y, w, 34);
      x.font="bold 9px 'Courier New', monospace"; x.textAlign="center"; x.textBaseline="middle"; x.fillStyle="#b8a878"; x.fillText(lab, x0+w/2, y+9);
      x.font="bold 15px 'Courier New', monospace"; x.fillStyle=c; x.fillText(String(val), x0+w/2, y+24); };
    box("CREDIT", G.shown|0, 12, 96, "#ff5a3a"); box("LINES", G.lines, 114, 46, "#ffd23a"); box("BET/LN", G.bet, 166, 50, "#ffd23a"); box("WIN", G.win, 222, 102, "#5aff7a");
    x.font="bold 10px 'Courier New', monospace"; x.textAlign="center"; x.fillStyle="#f2e6c8";
    x.fillText(G.msg || "SPACE SPIN · ↑↓ BET · ←→ LINES · M MAX", W/2, H-12); }
  const COLS={8:["#5a0e10","#2a0608"], 9:["#0e2a5a","#06122a"], 10:["#5a0e10","#2a0608"], 11:["#0e2a5a","#06122a"]};
  const NAME=i=>(i%2 ? "GOLD CREEK" : "LUCKY PINES");

  function spin(G, i){
    if(G.spinning) return; const cost=G.lines*G.bet;
    if(SLOTS.credits<cost){ if(SLOTS.credits<=0){ G.over=true; G.msg="BROKE · SPACE: THE BARTENDER STAKES YOU 100"; } else { G.msg="NOT ENOUGH · LOWER THE BET"; _cbSnd(i, "clunk"); } return; }
    SLOTS.credits-=cost; save(); G.shown=SLOTS.credits; G.win=0; G.show=false; G.wins=[]; G.hits=null; G.msg="GOOD LUCK";
    G.spinning=true; G.t=0; G.pull=1;
    for(let r=0;r<NR;r++){ G.spin[r]=true; G.stopAt[r]=0.7+r*0.32+(Math.random()<0.15 && r>=3 ? 0.5 : 0);
      G.target[r]=(Math.random()*STRIPS[r].length)|0; G.vel[r]=26+r*1.5; }
    _cbSnd(i, "pull"); }
  function settle(G, i){
    const grid=gridOf(G.target), res=evaluate(grid, G.lines, G.bet);
    G.wins=res.wins; G.win=res.total; G.show=true; G.spinning=false;
    G.hits=Array.from({length:NR}, ()=>[false,false,false]);
    for(const w of res.wins) for(let c=0;c<w.n;c++) G.hits[c][LINES[w.l][c]]=true;
    if(res.total>0){ SLOTS.credits+=res.total; save(); G.score=Math.max(G.score, res.total);
      const big=res.total>=G.lines*G.bet*10; G.msg=big ? "BIG WIN!  "+res.total+" CREDITS" : "WINNER · "+res.total; _cbSnd(i, big ? "jingle" : "coins"); }
    else { G.msg="NO WIN · SPACE TO SPIN"; }
    if(SLOTS.credits<=0){ G.over=true; G.msg="BROKE · SPACE: THE BARTENDER STAKES YOU 100"; } }

  const GAME={name:"SLOTS", col:"#ffd23a",
    help:"SPACE SPINS · ↑↓ BET PER LINE · ←→ LINES · M MAX BET · ESC STEPS AWAY",
    newGame(i){
      let msg="";
      if(SLOTS.credits<=0){ SLOTS.credits=100; save(); msg="THE BARTENDER STAKES YOU 100"; }
      const G={score:0, over:false, won:false, lines:9, bet:1, win:0, shown:SLOTS.credits, msg:msg, spinning:false, show:false, wins:[], hits:null,
               t:0, pull:0, pos:[], spin:[], stopAt:[], target:[], vel:[]};
      for(let r=0;r<NR;r++){ G.pos[r]=(Math.random()*STRIPS[r].length)|0; G.target[r]=G.pos[r]; G.spin[r]=false; }
      return G; },
    key(G, e){
      if(e.repeat) return; const c=e.code, i=CABS.i;
      if(G.over) return;
      if(c==="Space" || c==="Enter" || ((c==="ArrowDown" || c==="KeyS") && e.shiftKey)){ spin(G, i); return; }
      if(G.spinning) return;
      if(c==="ArrowUp" || c==="KeyW"){ G.bet=G.bet%5+1; _cbSnd(i, "tick"); }
      else if(c==="ArrowDown" || c==="KeyS"){ G.bet=(G.bet+3)%5+1; _cbSnd(i, "tick"); }
      else if(c==="ArrowRight" || c==="KeyD"){ G.lines=G.lines%9+1; _cbSnd(i, "tick"); }
      else if(c==="ArrowLeft" || c==="KeyA"){ G.lines=(G.lines+7)%9+1; _cbSnd(i, "tick"); }
      else if(c==="KeyM"){ G.lines=9; G.bet=5; _cbSnd(i, "tick"); while(G.bet>1 && G.lines*G.bet>SLOTS.credits) G.bet--; } },
    step(G, dt, K, i){
      G.pull=Math.max(0, G.pull-dt*2.2);
      if(!G.spinning){ G.shown+=(SLOTS.credits-G.shown)*Math.min(1, dt*6); if(Math.abs(SLOTS.credits-G.shown)<0.5) G.shown=SLOTS.credits; return; }
      G.t+=dt;
      for(let r=0;r<NR;r++){ if(!G.spin[r]) continue;
        const L=STRIPS[r].length;
        if(G.t<G.stopAt[r]){ G.pos[r]=(G.pos[r]+G.vel[r]*dt)%L; continue; }
        // let go: run on to the target and settle with a little bounce
        let d=((G.target[r]-G.pos[r])%L+L)%L; if(d>6 && G.t<G.stopAt[r]+0.6){ G.pos[r]=(G.pos[r]+G.vel[r]*dt)%L; continue; }
        const v=Math.max(3, Math.min(G.vel[r], d*9)); const s=v*dt;
        if(s>=d){ G.pos[r]=G.target[r]; G.spin[r]=false; _cbSnd(i, "clunk"); } else G.pos[r]=(G.pos[r]+s)%L; }
      if(G.spin.every(v=>!v)) settle(G, i); },
    draw(x, G, t){ const i=CABS.i;
      frame(x, NAME(i), COLS[i]||COLS[8]); drawWindow(x, G, t); meters(x, G);
      if(G.over) _cbMid(x, "BROKE", "SPACE · THE BARTENDER STAKES YOU 100"); _cbTube(x); },
    attract(x, t, i){
      const G=this._a||(this._a={}), A=G[i]||(G[i]=this.newGame(i));
      A.lines=9; A.bet=1; A.msg=""; A.shown=SLOTS.credits;
      // the reels drift round slowly, and every few seconds a line lights
      for(let r=0;r<NR;r++) A.pos[r]=(t*0.6*(1+r*0.13)+r*7)%STRIPS[r].length;
      frame(x, NAME(i), COLS[i]||COLS[8]); drawWindow(x, A, t);
      x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(12, RY+CH*ROWS+10, W-24, 34);
      x.textAlign="center"; x.textBaseline="middle"; x.font="bold 11px 'Courier New', monospace"; x.fillStyle="#ffd23a";
      x.fillText("5 PINES PAY 1000 × BET · PINE IS WILD", W/2, RY+CH*ROWS+20); x.fillStyle="#f2e6c8"; x.fillText("9 LINES · 1–5 A LINE", W/2, RY+CH*ROWS+34);
      if(((t*2)|0)%2){ x.fillStyle="#f2e23a"; x.font="bold 12px 'Courier New', monospace"; x.fillText("ENTER TO PLAY", W/2, H-12); }
      _cbTube(x); },
    lean(G){ return [0, -G.pull]; }
  };
  for(const i of [8, 9, 10, 11]){ _CBG[i]=GAME; const R=ARCADE.cabs && ARCADE.cabs[i]; if(R){ GAME.attract(R.x, 0, i); R.tex.needsUpdate=true; } }
  SLOTS.evaluate=evaluate; SLOTS.strips=STRIPS; SLOTS.lines=LINES;
})();
