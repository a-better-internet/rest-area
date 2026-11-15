"use strict";
/* REST AREA · 18q-poker.js
   the video poker machine set into the Pine Knot's bar (14z)
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18q · PINE KNOT POKER: Jacks or Better, five-card draw
   A bar-top machine, played the way the arcade's cabinets are (18g):
   ENTER at it stands you at the bar over its screen, Esc or E steps away.
   A hand: bet one to five credits, deal five cards from a fresh deck, hold
   any of them, draw new ones for the rest, and the hand is paid off the
   table. The table is the full-pay one (9 for a full house, 6 for a
   flush), which comes back about 99.5 in the hundred played well; a royal
   flush on five credits pays 4000 rather than 1250.
   1–5 (or the arrows and Up) hold and release the cards; Space or Enter
   deals, then draws; - and + (or Down / W) set the bet; M bets five and
   deals. The credits are the slots' wallet (18p's SLOTS.credits), so what
   you win here you can lose on Lucky Pines. Run dry and the bartender
   stakes you a hundred: Space takes it.
   ---------------------------------------------------------------------- */
const POKER={sim:null, evaluate:null};
(function poker(){
  const W=_CB.W, H=_CB.H;
  const save=()=>{ try{ localStorage.setItem(SLOTS.key, String(SLOTS.credits)); }catch(e){} };
  // the table, best first: name, pay per credit bet (a royal on five credits pays 800 a credit)
  const PAY=[["ROYAL FLUSH", 250],["STRAIGHT FLUSH", 50],["FOUR OF A KIND", 25],["FULL HOUSE", 9],["FLUSH", 6],["STRAIGHT", 4],
             ["THREE OF A KIND", 3],["TWO PAIR", 2],["JACKS OR BETTER", 1]];
  const payFor=(k, bet)=>k<0 ? 0 : (k===0 && bet===5 ? 4000 : PAY[k][1]*bet);
  // a card is rank 2..14 (ace high) times four plus its suit 0..3 (spades, hearts, clubs, diamonds)
  const rank=c=>(c>>2), suit=c=>c&3;
  // which line of the table a hand makes, or -1
  function evaluate(h){
    const r=h.map(rank).sort((a, b)=>a-b), fl=h.every(c=>suit(c)===suit(h[0]));
    const cnt={}; for(const v of r) cnt[v]=(cnt[v]||0)+1; const n=Object.values(cnt).sort((a, b)=>b-a);
    const uniq=n.length===5, wheel=r.join()==="2,3,4,5,14", st=uniq && (r[4]-r[0]===4 || wheel);
    if(st && fl) return r[0]===10 ? 0 : 1;
    if(n[0]===4) return 2;
    if(n[0]===3 && n[1]===2) return 3;
    if(fl) return 4;
    if(st) return 5;
    if(n[0]===3) return 6;
    if(n[0]===2 && n[1]===2) return 7;
    if(n[0]===2){ const p=+Object.keys(cnt).find(k=>cnt[k]===2); return p>=11 ? 8 : -1; }
    return -1; }
  POKER.evaluate=evaluate;
  const fresh=()=>{ const d=[]; for(let v=2;v<=14;v++) for(let s=0;s<4;s++) d.push(v*4+s);
    for(let i=d.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [d[i], d[j]]=[d[j], d[i]]; } return d; };
  // (node: POKER.sim(n) deals n hands, holds whatever already pays or four to a flush, and returns what comes back per credit)
  POKER.sim=function(n){ let won=0;
    for(let i=0;i<n;i++){ const d=fresh(), h=d.splice(0, 5); let keep=[];
      if(evaluate(h)>=0){ const r=h.map(rank), c={}; r.forEach(v=>c[v]=(c[v]||0)+1); const e=evaluate(h);
        keep=e<=5 && e!==2 ? [0,1,2,3,4] : h.map((x, k)=>c[rank(x)]>1 ? k : -1).filter(k=>k>=0); }
      else { const s=[0,0,0,0]; h.forEach(x=>s[suit(x)]++); const fs=s.findIndex(v=>v>=4);
        if(fs>=0) keep=h.map((x, k)=>suit(x)===fs ? k : -1).filter(k=>k>=0);
        else keep=h.map((x, k)=>rank(x)>=11 ? k : -1).filter(k=>k>=0).slice(0, 2); }
      for(let k=0;k<5;k++) if(!keep.includes(k)) h[k]=d.shift();
      won+=payFor(evaluate(h), 1); }
    return won/n; };

  /* ---- the pictures ---- */
  const RK=v=>v<=10 ? String(v) : "JQKA"[v-11], SU=["♠","♥","♣","♦"], RED=s=>s===1 || s===3;
  const CWD=54, CG=8, CX=Math.round((W-5*CWD-4*CG)/2), CY=118, CHT=80;
  function card(x, c, X, Y, up, held, sel){
    x.save();
    const rr=(a, b, w, h, r)=>{ x.beginPath(); x.moveTo(a+r, b); x.arcTo(a+w, b, a+w, b+h, r); x.arcTo(a+w, b+h, a, b+h, r); x.arcTo(a, b+h, a, b, r); x.arcTo(a, b, a+w, b, r); x.closePath(); };
    if(!up){ rr(X, Y, CWD, CHT, 6); x.fillStyle="#8a1a1a"; x.fill(); x.strokeStyle="#f2e6c8"; x.lineWidth=2; x.stroke();
      rr(X+3, Y+3, CWD-6, CHT-6, 4); x.clip(); x.strokeStyle="rgba(242,230,200,0.35)"; x.lineWidth=1; for(let k=-80;k<80;k+=8){ x.beginPath(); x.moveTo(X+k, Y); x.lineTo(X+k+CHT, Y+CHT); x.stroke(); }
      x.restore(); return; }
    rr(X, Y, CWD, CHT, 6); x.fillStyle="#fbf8f0"; x.fill(); x.strokeStyle=sel ? "#ffd23a" : "#3a3a40"; x.lineWidth=sel ? 3 : 1.5; x.stroke();
    const s=suit(c), v=rank(c); x.fillStyle=RED(s) ? "#c8141a" : "#141418";
    x.textAlign="center"; x.textBaseline="middle";
    x.font="bold 17px Georgia, 'Times New Roman', serif"; x.fillText(RK(v), X+12, Y+13);
    x.font="13px 'Segoe UI Symbol', 'DejaVu Sans', Arial"; x.fillText(SU[s], X+12, Y+28);
    x.font=(v>10 && v<14 ? "bold 26px Georgia, serif" : "34px 'Segoe UI Symbol', 'DejaVu Sans', Arial"); x.fillText(v>10 && v<14 ? RK(v) : SU[s], X+CWD/2+4, Y+CHT/2+6);
    if(v>10 && v<14){ x.font="16px 'Segoe UI Symbol', 'DejaVu Sans', Arial"; x.fillText(SU[s], X+CWD/2+4, Y+CHT-14); }
    x.restore(); }
  function table(x, G){
    x.fillStyle="#0a1a6a"; x.fillRect(8, 8, W-16, 96); x.strokeStyle="#ffd23a"; x.lineWidth=1.5; x.strokeRect(8, 8, W-16, 96);
    const cw=(W-16-118)/5; x.fillStyle="rgba(255,210,58,0.22)"; x.fillRect(8+118+(G.bet-1)*cw, 9, cw, 94);
    x.font="bold 9px 'Courier New', monospace"; x.textBaseline="middle";
    PAY.forEach((p, k)=>{ const y=17+k*10, hit=G.show && G.hand===k && ((G.t*3)|0)%2;
      x.fillStyle=hit ? "#ffffff" : "#ffd23a"; x.textAlign="left"; x.fillText(p[0], 14, y);
      x.textAlign="right"; for(let b=1;b<=5;b++){ x.fillStyle=hit && b===G.bet ? "#ffffff" : "#ffd23a"; x.fillText(String(payFor(k, b)), 8+118+b*cw-4, y); } }); }
  function meters(x, G){
    const y=CY+CHT+28;
    x.font="bold 13px 'Courier New', monospace"; x.textBaseline="middle";
    x.textAlign="left"; x.fillStyle="#ff5a3a"; x.fillText("CREDIT "+(G.shown|0), 14, y);
    x.textAlign="center"; x.fillStyle="#ffd23a"; x.fillText("BET "+G.bet, W/2, y);
    x.textAlign="right"; x.fillStyle="#5aff7a"; x.fillText("WIN "+G.win, W-14, y);
    x.font="bold 10px 'Courier New', monospace"; x.textAlign="center"; x.fillStyle="#f2e6c8";
    x.fillText(G.msg || (G.stage==="hold" ? "1–5 HOLD · SPACE DRAWS" : "SPACE DEALS · −/+ BET · M MAX"), W/2, H-14); }
  function draw(x, G, t){
    const g=x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0c2a8a"); g.addColorStop(1, "#06124a"); x.fillStyle=g; x.fillRect(0, 0, W, H);
    table(x, G);
    for(let k=0;k<5;k++){ const X=CX+k*(CWD+CG), shown=G.flip[k]<=0;
      card(x, G.cards[k], X, CY, shown && G.cards[k]!==undefined, G.held[k], G.stage==="hold" && G.cur===k);
      if(G.held[k] && G.stage==="hold" || (G.held[k] && G.show)){ x.fillStyle="#ffd23a"; x.font="bold 11px 'Courier New', monospace"; x.textAlign="center"; x.fillText("HELD", X+CWD/2, CY-8); } }
    if(G.show && G.hand>=0){ x.fillStyle="#ffffff"; x.font="900 15px 'Arial Black', Arial"; x.textAlign="center"; x.fillText(PAY[G.hand][0], W/2, CY+CHT+11); }
    else if(G.show){ x.fillStyle="#b8c4ff"; x.font="bold 12px 'Courier New', monospace"; x.textAlign="center"; x.fillText("GAME OVER", W/2, CY+CHT+11); }
    meters(x, G);
    if(G.over) _cbMid(x, "BROKE", "SPACE · THE BARTENDER STAKES YOU 100");
    _cbTube(x); }

  function deal(G, i){
    if(G.stage!=="deal" || G.dealing) return;
    if(SLOTS.credits<G.bet){ if(SLOTS.credits<=0){ G.over=true; G.msg="BROKE · SPACE: THE BARTENDER STAKES YOU 100"; } else { G.bet=Math.max(1, SLOTS.credits); G.msg="BET LOWERED TO "+G.bet; _cbSnd(i, "clunk"); } return; }
    SLOTS.credits-=G.bet; save(); G.shown=SLOTS.credits; G.win=0; G.show=false; G.hand=-1; G.msg="";
    G.deck=fresh(); G.cards=G.deck.splice(0, 5); G.held=[false,false,false,false,false]; G.cur=0;
    for(let k=0;k<5;k++) G.flip[k]=0.06+k*0.09; G.dealing=true; G.stage="hold"; _cbSnd(i, "coin"); }
  function drawCards(G, i){
    for(let k=0;k<5;k++) if(!G.held[k]){ G.cards[k]=G.deck.shift(); G.flip[k]=0.06+k*0.09; }
    G.dealing=true; G.stage="done"; _cbSnd(i, "tick"); }
  function settle(G, i){
    if(G.stage==="hold"){ G.dealing=false; const e=evaluate(G.cards); G.msg=e>=0 ? PAY[e][0]+" · HOLD AND DRAW" : ""; return; }
    const e=evaluate(G.cards), p=payFor(e, G.bet); G.hand=e; G.win=p; G.show=true; G.dealing=false; G.stage="deal";
    if(p>0){ SLOTS.credits+=p; save(); G.score=Math.max(G.score, p); G.msg=p>=G.bet*25 ? "BIG WINNER!  "+p+" CREDITS" : "WINNER · "+p; _cbSnd(i, p>=G.bet*25 ? "jingle" : "coins"); }
    else G.msg="SPACE DEALS AGAIN";
    if(SLOTS.credits<=0){ G.over=true; G.msg="BROKE · SPACE: THE BARTENDER STAKES YOU 100"; } }

  const GAME={name:"POKER", col:"#ffd23a",
    help:"SPACE DEALS AND DRAWS · 1–5 HOLD · −/+ BET · M MAX BET · ESC STEPS AWAY",
    newGame(i){
      let msg="";
      if(SLOTS.credits<=0){ SLOTS.credits=100; save(); msg="THE BARTENDER STAKES YOU 100"; }
      return {score:0, over:false, won:false, bet:5, win:0, shown:SLOTS.credits, msg:msg, stage:"deal", dealing:false, show:false, hand:-1,
              cards:[], held:[false,false,false,false,false], flip:[1,1,1,1,1], deck:[], cur:0, t:0, press:0}; },
    key(G, e){
      if(e.repeat || G.over) return; const c=e.code, i=CABS.i;
      if(c==="Space" || c==="Enter"){ if(G.dealing) return; if(G.stage==="hold") drawCards(G, i); else deal(G, i); G.press=1; return; }
      if(G.dealing) return;
      if(G.stage==="hold"){
        const n=/^Digit([1-5])$/.exec(c) || /^Numpad([1-5])$/.exec(c);
        if(n){ const k=+n[1]-1; G.held[k]=!G.held[k]; G.cur=k; _cbSnd(i, "tick"); return; }
        if(c==="ArrowLeft" || c==="KeyA"){ G.cur=(G.cur+4)%5; _cbSnd(i, "tick"); return; }
        if(c==="ArrowRight" || c==="KeyD"){ G.cur=(G.cur+1)%5; _cbSnd(i, "tick"); return; }
        if(c==="ArrowUp" || c==="KeyW" || c==="KeyH"){ G.held[G.cur]=!G.held[G.cur]; _cbSnd(i, "tick"); return; }
        return; }
      if(c==="Equal" || c==="NumpadAdd" || c==="ArrowUp" || c==="KeyW"){ G.bet=G.bet%5+1; _cbSnd(i, "tick"); }
      else if(c==="Minus" || c==="NumpadSubtract" || c==="ArrowDown" || c==="KeyS"){ G.bet=(G.bet+3)%5+1; _cbSnd(i, "tick"); }
      else if(c==="KeyM"){ G.bet=Math.max(1, Math.min(5, SLOTS.credits)); deal(G, i); } },
    step(G, dt, K, i){
      G.t+=dt; G.press=Math.max(0, G.press-dt*4);
      if(G.dealing){ let all=true; for(let k=0;k<5;k++){ if(G.flip[k]>0){ G.flip[k]-=dt; if(G.flip[k]<=0) _cbSnd(i, "tick"); all=false; } } if(all) settle(G, i); }
      G.shown+=(SLOTS.credits-G.shown)*Math.min(1, dt*6); if(Math.abs(SLOTS.credits-G.shown)<0.5) G.shown=SLOTS.credits; },
    draw(x, G, t){ draw(x, G, t); },
    attract(x, t, i){
      const A=this._a||(this._a=this.newGame(i)); A.t=t; A.shown=SLOTS.credits; A.msg="";
      // a royal flush in spades, turning over card by card, round and round
      const ph=(t*0.5)%1, roy=[14*4, 13*4, 12*4, 11*4, 10*4]; A.cards=roy; A.stage="deal";
      for(let k=0;k<5;k++) A.flip[k]=ph*6>k+0.5 ? 0 : 1; A.show=ph>0.75; A.hand=0; A.bet=5; A.win=0;
      draw(x, A, t);
      x.fillStyle="rgba(0,0,0,0.6)"; x.fillRect(10, H-30, W-20, 22);
      if(((t*2)|0)%2){ x.fillStyle="#f2e23a"; x.font="bold 12px 'Courier New', monospace"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("ENTER TO PLAY · ROYAL PAYS 4000", W/2, H-19); }
      _cbTube(x); },
    lean(G){ return [0, -G.press*0.4]; }
  };
  POKER.game=GAME; POKER.idx=12;
  _CBG[12]=GAME; const R=ARCADE.cabs && ARCADE.cabs[12]; if(R){ GAME.attract(R.x, 0, 12); R.tex.needsUpdate=true; }
})();
