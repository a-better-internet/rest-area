"use strict";
/* REST AREA · 18s-hornworm.js
   the arcade's ninth cabinet (12c): Hornworm Havoc
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18s · HORNWORM HAVOC
   Played the way 18g's are (the cabinet's own screen, the stick under
   your hand, N to start again, Esc or E to step away), registered into
   18g's _CBG as cabinet 13, the first of the two in the arcade's new end.
   Its best five scores are kept in the browser and shown in its attract
   mode.

   A shooter of the kind where something long and segmented winds down
   the screen at you through a field of things in its way. Here the field
   is a tomato patch seen from above, the long thing is a tomato hornworm
   (green, striped, a red horn on its tail, as long as your hand in life
   and the length of the bed in this), and you are the garden gnome at the
   bottom of the bed with a pea shooter.

   The worm crawls along a row until a plant or the bed's edge turns it
   down a row and back the other way. Shoot a segment and the worm parts
   there: the piece behind grows a head of its own, and where the segment
   fell a seedling comes up. At the bottom it turns and climbs again, and
   it stays in your end of the bed until you finish it.
   The plants are the game's own twist. A seedling grows into a plant and
   a plant, left alone, sets a tomato that RIPENS, green to red. Three
   peas strip a plant; but one pea into a ripe tomato BURSTS it, and the
   burst takes everything in the eight squares round it: worm, moth, crow,
   and any other ripe tomato, which bursts in its turn. A bed left to
   ripen is a bed full of mines, yours if you can wait for the worm to
   wander in among them.
   A cabbage moth flutters down the bed now and then and drops seedlings
   behind it. A crow comes in over the fence, low across your end of the
   bed, and takes a ripe tomato or two as it goes: it will take you with
   it if it touches you. Clear the worm for the next bed, with a longer
   wait for nothing: each bed is quicker, and sends lone heads after the
   worm.
   Arrows or WASD move the gnome about his end of the bed; SPACE (or J)
   shoots, two peas in the air at a time. Three gnomes, another at 12,000.
   Its bed, its creatures and its pictures are its own, drawn here.
   ---------------------------------------------------------------------- */
const _HW=(function(){
  const W=_CB.W, H=_CB.H, CS=12, NC=28, NR=21, Y0=26, ZONE=5;        // the bed: 28 squares by 21 under the score; the gnome's end, 5 rows
  const BOT=Y0+NR*CS, PR=5, SPD=96, PEA=330;
  const SOIL="#3b2a1c", SOIL2="#33241a", LEAF="#3f8a34", LEAF2="#2c6a28", STAKE="#b89a62";
  const snd=(i, k)=>_cbSnd(i, k);
  const rnd=(G)=>{ G.seed=(G.seed*1664525+1013904223)>>>0; return G.seed/4294967296; };
  const at=(G, c, r)=>(c<0 || r<0 || c>=NC || r>=NR) ? null : G.bed[r*NC+c];
  const cx=(c)=>c*CS+CS/2, cy=(r)=>Y0+r*CS+CS/2;

  /* ---- the bed ---- */
  // a plant is {hp 1..3, grow, ripe 0..1 (0: no fruit yet), rt}: a seedling, a small plant, a full one; a full one sets fruit
  const plantAt=(G, c, r, hp)=>{ if(c<0 || r<1 || c>=NC || r>=NR) return; if(G.bed[r*NC+c]) return;
    G.bed[r*NC+c]={hp:hp||1, grow:6+rnd(G)*8, ripe:0, rt:8+rnd(G)*16}; };
  function newBed(G){
    G.bed=new Array(NC*NR).fill(null);
    const n=30+Math.min(14, G.wave*2);
    for(let k=0;k<n*4 && G.bed.filter(Boolean).length<n;k++){ const c=(rnd(G)*NC)|0, r=1+((rnd(G)*(NR-ZONE-1))|0); plantAt(G, c, r, 3); }
    for(let k=0;k<3;k++) plantAt(G, (rnd(G)*NC)|0, NR-ZONE+((rnd(G)*(ZONE-1))|0), 2);
    // a few already ripe, so the first worm meets one
    let ripe=0; for(const p of G.bed) if(p && p.hp===3 && ripe<4 && rnd(G)<0.2){ p.ripe=1; ripe++; }
  }
  /* ---- the worm: every segment follows the one rule, so a line of them keeps to one path ---- */
  function newWorm(G, len, c0, dir){
    let prev=null;
    for(let k=0;k<len;k++){ const s={c:c0-dir*k, r:0, pc:c0-dir*k, pr:0, dx:dir, dy:1, head:k===0, next:null, lone:false}; if(prev) prev.next=s; G.segs.push(s); prev=s; }
  }
  function stepSeg(G, s){
    s.pc=s.c; s.pr=s.r;
    if(s.c<0 || s.c>=NC){ s.c+=s.dx; return; }                        // (still coming in over the edge)
    const nc=s.c+s.dx, blocked=nc<0 || nc>=NC || !!at(G, nc, s.r);
    if(!blocked){ s.c=nc; return; }
    let nr=s.r+s.dy;
    if(nr>=NR){ s.dy=-1; nr=s.r-1; }
    else if(s.dy<0 && nr<NR-ZONE){ s.dy=1; nr=s.r+1; }
    s.r=nr; s.dx=-s.dx;
  }
  const segXY=(G, s)=>[cx(s.pc)+(cx(s.c)-cx(s.pc))*G.u, cy(s.pr)+(cy(s.r)-cy(s.pr))*G.u];
  function killSeg(G, s, i, mult){
    const k=G.segs.indexOf(s); if(k<0) return;
    for(const q of G.segs) if(q.next===s) q.next=null;
    if(s.next) s.next.head=true;
    G.segs.splice(k, 1);
    const v=(s.head ? 100 : 10)*(mult||1); G.score+=v;
    const [x, y]=segXY(G, s); G.fx.push({k:"squish", x:x, y:y, t:0}); if(s.head) G.pops.push({x:x, y:y, txt:String(v), t:0, col:"#f2e23a"});
    if(!mult) plantAt(G, clamp(s.c, 0, NC-1), s.r, 1);                 // (a seedling where it fell; not out of a burst)
  }
  /* ---- a ripe tomato bursts: everything in the eight squares round it goes, and any ripe one among them bursts too ---- */
  function burst(G, c, r, i, depth){
    const p=at(G, c, r); if(!p) return;
    G.bed[r*NC+c]=null; G.fx.push({k:"burst", x:cx(c), y:cy(r), t:0}); G.shake=0.18;
    let got=0; const R=CS*1.75, x0=cx(c), y0=cy(r);
    for(const s of G.segs.slice()){ const [x, y]=segXY(G, s); if(Math.hypot(x-x0, y-y0)<R){ killSeg(G, s, i, 2); got++; } }
    if(G.moth && Math.hypot(G.moth.x-x0, G.moth.y-y0)<R){ G.score+=400; G.pops.push({x:G.moth.x, y:G.moth.y, txt:"400", t:0, col:"#ffffff"}); G.moth=null; got++; }
    if(G.crow && G.crow.st==="fly" && Math.hypot(G.crow.x-x0, G.crow.y-y0)<R+4){ G.score+=1000; G.pops.push({x:G.crow.x, y:G.crow.y, txt:"1000", t:0, col:"#ffffff"}); G.crow.st="hit"; G.crow.t=0; got++; }
    const v=50*(depth+1); G.score+=v;
    G.pops.push({x:x0, y:y0-6, txt:got ? "SPLAT ×"+got : String(v), t:0, col:"#ff6a4a"});
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ const q=at(G, c+dc, r+dr); if(q && q.ripe>=1) G.chain.push({c:c+dc, r:r+dr, t:0.07, d:depth+1}); }
    snd(i, depth ? "pop" : "boom");
  }
  function wave(G){
    G.segs=[]; G.peas=[]; G.moth=null; G.crow=null; G.chain=[];
    const len=Math.max(7, 12-Math.floor((G.wave-1)/2)), dir=rnd(G)<0.5 ? 1 : -1;
    newWorm(G, len, dir>0 ? -1 : NC, dir);
    G.lone=Math.min(5, Math.floor(G.wave/2)); G.loneT=5;
    G.tick=1/(7.5+Math.min(9, G.wave*0.9)); G.u=0; G.mothT=7+rnd(G)*5; G.crowT=9+rnd(G)*6;
    G.msgT=1.6;
  }
  function frame(G, K, i, dt){
    G.t+=dt;
    for(const o of G.fx) o.t+=dt; G.fx=G.fx.filter(o=>o.t<0.45);
    for(const o of G.pops) o.t+=dt; G.pops=G.pops.filter(o=>o.t<1.1);
    if(G.shake>0) G.shake=Math.max(0, G.shake-dt);
    if(G.msgT>0){ G.msgT-=dt; return; }
    const p=G.p;
    if(p.dead>0){ p.dead-=dt;
      if(p.dead<=0){ G.lives--; if(G.lives<=0){ G.over=true; return; }
        p.x=W/2; p.y=BOT-CS; p.inv=1.6; wave(G); G.msgT=0.9; }
      return; }
    if(G.clearT>0){ G.clearT-=dt; if(G.clearT<=0){ G.wave++; wave(G); } return; }
    // the plants: seedlings grow, full plants set fruit and it ripens
    for(const q of G.bed){ if(!q) continue;
      if(q.hp<3){ q.grow-=dt; if(q.grow<=0){ q.hp++; q.grow=7+rnd(G)*7; } }
      else if(q.ripe<1){ q.rt-=dt; if(q.rt<=0) q.ripe=Math.min(1, q.ripe+dt/5); } }
    // one burst sets off the next a moment later
    for(const c of G.chain) c.t-=dt;
    for(const c of G.chain.filter(c=>c.t<=0)) burst(G, c.c, c.r, i, c.d);
    G.chain=G.chain.filter(c=>c.t>0);
    // the gnome
    const mx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), my=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
    const tryMove=(nx, ny)=>{ nx=clamp(nx, PR+1, W-PR-1); ny=clamp(ny, Y0+(NR-ZONE)*CS+PR, BOT-PR-1);
      for(const [ox, oy] of [[-PR+1,-PR+1],[PR-1,-PR+1],[-PR+1,PR-1],[PR-1,PR-1]]){ if(at(G, Math.floor((nx+ox)/CS), Math.floor((ny+oy-Y0)/CS))) return false; }
      p.x=nx; p.y=ny; return true; };
    if(mx) tryMove(p.x+mx*SPD*dt, p.y); if(my) tryMove(p.x, p.y+my*SPD*dt);
    p.walk=(mx || my) ? p.walk+dt*10 : 0; if(mx) p.dir=mx;
    if(p.inv>0) p.inv-=dt;
    p.cool-=dt;
    if((K.Space || K.KeyJ) && p.cool<=0 && G.peas.length<2){ G.peas.push({x:p.x, y:p.y-PR-2}); p.cool=0.16; p.shot=0.12; snd(i, "zap"); }
    if(p.shot>0) p.shot-=dt;
    // the peas
    for(const b of G.peas){ b.y-=PEA*dt;
      const c=Math.floor(b.x/CS), r=Math.floor((b.y-Y0)/CS), q=at(G, c, r);
      if(q){ b.dead=true;
        if(q.ripe>=1) burst(G, c, r, i, 0);
        else { q.hp--; q.ripe=0; q.rt=10+rnd(G)*14; G.fx.push({k:"leaf", x:cx(c), y:cy(r), t:0});
          if(q.hp<=0){ G.bed[r*NC+c]=null; G.score+=1; } snd(i, "invhit"); }
        continue; }
      for(const s of G.segs){ const [x, y]=segXY(G, s); if(Math.abs(b.x-x)<CS*0.55 && Math.abs(b.y-y)<CS*0.55){ b.dead=true; killSeg(G, s, i); snd(i, "invkill"); break; } }
      if(b.dead) continue;
      if(G.moth && Math.abs(b.x-G.moth.x)<7 && Math.abs(b.y-G.moth.y)<7){ b.dead=true; G.score+=200; G.pops.push({x:G.moth.x, y:G.moth.y, txt:"200", t:0, col:"#ffffff"}); G.fx.push({k:"squish", x:G.moth.x, y:G.moth.y, t:0}); G.moth=null; snd(i, "invkill"); continue; }
      if(G.crow && G.crow.st==="fly" && Math.abs(b.x-G.crow.x)<10 && Math.abs(b.y-G.crow.y)<7){ b.dead=true; const v=Math.abs(G.crow.x-p.x)<40 ? 900 : 500; G.score+=v;
        G.pops.push({x:G.crow.x, y:G.crow.y, txt:String(v), t:0, col:"#ffffff"}); G.crow.st="hit"; G.crow.t=0; snd(i, "boom"); }
    }
    G.peas=G.peas.filter(b=>!b.dead && b.y>Y0-4);
    // the worm, a square at a time, all of it at once
    G.u+=dt/G.tick;
    while(G.u>=1){ G.u-=1; for(const s of G.segs) stepSeg(G, s); }
    // lone heads after it, in from the top
    if(G.lone>0){ G.loneT-=dt; if(G.loneT<=0){ G.lone--; G.loneT=4+rnd(G)*3; const d=rnd(G)<0.5 ? 1 : -1;
      G.segs.push({c:d>0 ? -1 : NC, r:0, pc:d>0 ? -1 : NC, pr:0, dx:d, dy:1, head:true, next:null, lone:true}); } }
    // the cabbage moth: down the bed in a flutter, a seedling behind it now and then
    if(!G.moth){ G.mothT-=dt; if(G.mothT<=0){ G.mothT=8+rnd(G)*7; G.moth={x0:CS*2+rnd(G)*(W-CS*4), y:Y0-6, ph:rnd(G)*6, sp:42+G.wave*5, row:-1}; G.moth.x=G.moth.x0; } }
    else { const m=G.moth; m.y+=m.sp*dt; m.ph+=dt*5; m.x=clamp(m.x0+Math.sin(m.ph)*16, 6, W-6);
      const r=Math.floor((m.y-Y0)/CS); if(r!==m.row){ m.row=r; if(r>0 && r<NR-1 && rnd(G)<0.34) plantAt(G, Math.floor(m.x/CS), r, 1); }
      if(m.y>BOT+8) G.moth=null; }
    // the crow: its shadow first, then in low across the gnome's end of the bed, a ripe tomato or two as it goes
    if(!G.crow){ G.crowT-=dt; if(G.crowT<=0){ G.crowT=11+rnd(G)*8-Math.min(5, G.wave*0.5); const d=rnd(G)<0.5 ? 1 : -1;
      G.crow={st:"warn", t:0, d:d, x:d>0 ? -16 : W+16, y:0, ty:clamp(p.y-4+(rnd(G)-0.5)*20, Y0+(NR-ZONE)*CS+4, BOT-10), sp:150+G.wave*8}; } }
    else { const c=G.crow; c.t+=dt;
      if(c.st==="warn"){ if(c.t>0.9){ c.st="fly"; c.t=0; snd(i, "hop"); } }
      else if(c.st==="fly"){ c.x+=c.d*c.sp*dt; const u=clamp((c.d>0 ? c.x : W-c.x)/W, 0, 1); c.y=c.ty-Math.pow(Math.abs(u-0.5)*2, 2)*70;
        const q=at(G, Math.floor(c.x/CS), Math.floor((c.y-Y0)/CS)); if(q && q.ripe>=1){ q.ripe=0; q.rt=12+rnd(G)*10; G.fx.push({k:"leaf", x:c.x, y:c.y, t:0}); }
        if(c.x<-24 || c.x>W+24) G.crow=null; }
      else { c.y+=120*dt; c.x+=c.d*40*dt; if(c.t>0.5) G.crow=null; } }
    // what gets the gnome
    if(!(p.inv>0)){
      let hit=false;
      for(const s of G.segs){ const [x, y]=segXY(G, s); if(Math.abs(p.x-x)<PR+4 && Math.abs(p.y-y)<PR+4){ hit=true; break; } }
      if(G.moth && Math.abs(p.x-G.moth.x)<PR+5 && Math.abs(p.y-G.moth.y)<PR+5) hit=true;
      if(G.crow && G.crow.st==="fly" && Math.abs(p.x-G.crow.x)<PR+9 && Math.abs(p.y-G.crow.y)<PR+5) hit=true;
      if(hit){ p.dead=1.5; snd(i, "die"); return; }
    }
    if(G.score>=G.extra){ G.lives++; G.extra+=12000; G.pops.push({x:W/2, y:BOT-30, txt:"ANOTHER GNOME", t:0, col:"#7ad08a"}); snd(i, "jingle"); }
    if(!G.segs.length && G.lone<=0){ G.clearT=1.8; G.score+=100*G.wave; G.pops.push({x:W/2, y:Y0+90, txt:"BED CLEAR  +"+100*G.wave, t:0, col:"#f2e23a"}); snd(i, "jingle"); }
  }

  /* ---- the pictures ---- */
  let BG=null;
  function ground(){
    if(BG) return BG;
    const c=cvs(W, H), x=c.getContext("2d"); let s=977; const r=()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; };
    x.fillStyle=SOIL; x.fillRect(0, 0, W, H);
    for(let j=0;j<NR;j++){ x.fillStyle=j%2 ? SOIL2 : SOIL; x.fillRect(0, Y0+j*CS, W, CS); x.fillStyle="rgba(0,0,0,0.16)"; x.fillRect(0, Y0+j*CS+CS-1, W, 1); }
    for(let k=0;k<700;k++){ x.fillStyle=r()<0.5 ? "rgba(96,72,48,0.5)" : "rgba(20,12,8,0.4)"; x.fillRect((r()*W)|0, Y0+((r()*NR*CS)|0), 1+((r()*2)|0), 1); }
    // the gnome's end: mulched, a board along the top of it
    x.fillStyle="rgba(150,112,62,0.20)"; x.fillRect(0, Y0+(NR-ZONE)*CS, W, ZONE*CS);
    x.fillStyle="#6a5236"; x.fillRect(0, Y0+(NR-ZONE)*CS-1, W, 2);
    BG=c; return c;
  }
  function plant(x, c, r, q, t){
    const px=cx(c), py=cy(r);
    if(q.hp===1){ x.fillStyle=LEAF; x.fillRect(px-1, py-1, 2, 5); x.fillRect(px-4, py-2, 3, 2); x.fillRect(px+1, py-3, 3, 2); return; }
    x.fillStyle=STAKE; x.fillRect(px-1, py-5, 1, 10);
    x.fillStyle=LEAF2; x.beginPath(); x.arc(px, py, q.hp===3 ? 5.2 : 3.8, 0, 7); x.fill();
    x.fillStyle=LEAF; for(const [dx, dy, rr] of (q.hp===3 ? [[-2,-2,2.6],[2.5,-1,2.4],[-1,2.5,2.4],[2,2.5,2.0]] : [[-1.5,-1,2.0],[1.5,1,1.9]])){ x.beginPath(); x.arc(px+dx, py+dy, rr, 0, 7); x.fill(); }
    if(q.ripe>0){ const k=q.ripe, R=Math.round(96+159*k), Gc=Math.round(170-110*k), B=Math.round(56-20*k);
      x.fillStyle="rgb("+R+","+Gc+","+B+")"; x.beginPath(); x.arc(px+0.5, py+0.5, 2.2+1.2*k+(k>=1 ? Math.sin(t*5+c)*0.3 : 0), 0, 7); x.fill();
      if(k>=1){ x.fillStyle="#ffd0c0"; x.fillRect(px-1, py-1, 1, 1); } }
  }
  function seg(x, sx, sy, s, t, k){
    x.fillStyle="#1e4a1c"; x.beginPath(); x.arc(sx, sy+1, 5.4, 0, 7); x.fill();
    x.fillStyle=s.lone ? "#b8d83a" : "#6cc83a"; x.beginPath(); x.arc(sx, sy, 5.0, 0, 7); x.fill();
    x.strokeStyle="#f2f4e0"; x.lineWidth=1.4; x.beginPath(); x.moveTo(sx-3, sy+3); x.lineTo(sx+2, sy-3.5); x.stroke();   // its white slash
    x.fillStyle="#12240f"; x.fillRect(sx+2, sy+1, 1, 1);
    if(s.head){ x.fillStyle="#12240f"; x.fillRect(sx+s.dx*2-2, sy-2, 2, 2); x.fillRect(sx+s.dx*2+1, sy-2, 2, 2); x.fillStyle="#e8f4d0"; x.fillRect(sx+s.dx*2-2, sy-2, 1, 1); x.fillRect(sx+s.dx*2+1, sy-2, 1, 1); }
    if(!s.next){ x.strokeStyle="#e8402a"; x.lineWidth=1.6; x.beginPath(); x.moveTo(sx-s.dx*4, sy-1); x.lineTo(sx-s.dx*7, sy-5); x.stroke(); }   // the horn, on its tail
    else { x.fillStyle="#3f8a26"; for(const o of [-3, 3]) x.fillRect(sx+o-1, sy+4+(((t*10+k)|0)%2), 2, 2); }
  }
  function gnome(x, px, py, t, walk, shot, dead){
    if(dead>0){ x.save(); x.translate(px, py); x.rotate((1.5-dead)*5); x.translate(-px, -py); }
    x.fillStyle="rgba(0,0,0,0.3)"; x.beginPath(); x.ellipse(px, py+5, 5, 2, 0, 0, 7); x.fill();
    const b=walk ? Math.sin(walk)*1 : 0;
    x.fillStyle="#2a4a9a"; x.fillRect(px-4, py-1+b*0.3, 8, 6);                              // his coat
    x.fillStyle="#f2f0e8"; x.beginPath(); x.moveTo(px-3, py-1); x.lineTo(px+3, py-1); x.lineTo(px, py+4); x.closePath(); x.fill();   // his beard
    x.fillStyle="#e8b890"; x.fillRect(px-2, py-3, 4, 2);
    x.fillStyle="#d8281e"; x.beginPath(); x.moveTo(px-4, py-3); x.lineTo(px+4, py-3); x.lineTo(px, py-10-(shot>0 ? 1 : 0)); x.closePath(); x.fill();   // the hat
    x.fillStyle="#8a6a3a"; x.fillRect(px-1, py-12+(shot>0 ? 2 : 0), 2, 4);                 // the pea shooter, up past the hat
    if(dead>0) x.restore();
  }
  function moth(x, m, t){ const f=Math.sin(t*26)>0 ? 1 : 0.35;
    x.fillStyle="#f4f2e4"; x.beginPath(); x.ellipse(m.x-3, m.y, 3.4*f, 4, 0, 0, 7); x.ellipse(m.x+3, m.y, 3.4*f, 4, 0, 0, 7); x.fill();
    x.fillStyle="#3a3a34"; x.fillRect(m.x-1, m.y-3, 2, 6); x.fillRect(m.x-3, m.y-1, 1, 1); x.fillRect(m.x+2, m.y-1, 1, 1); }
  function crow(x, c, t){
    if(c.st==="warn"){ const sx=c.d>0 ? 10 : W-10; if(((t*10)|0)%2){ x.fillStyle="#f2e23a"; x.beginPath(); x.moveTo(sx, c.ty-5); x.lineTo(sx+c.d*7, c.ty); x.lineTo(sx, c.ty+5); x.closePath(); x.fill(); } return; }
    x.save(); x.translate(c.x, c.y); if(c.st==="hit") x.rotate(c.t*9); x.scale(c.d, 1);
    const f=Math.sin(t*18)*4;
    x.fillStyle="rgba(0,0,0,0.25)"; x.beginPath(); x.ellipse(0, 12, 8, 2.5, 0, 0, 7); x.fill();
    x.fillStyle="#14141a"; x.beginPath(); x.ellipse(0, 0, 8, 3.6, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(-3, -1); x.lineTo(-9, -4-f); x.lineTo(3, -1); x.closePath(); x.fill(); x.beginPath(); x.moveTo(-3, 1); x.lineTo(-9, 4+f); x.lineTo(3, 1); x.closePath(); x.fill();
    x.fillStyle="#e8b030"; x.fillRect(8, -1, 4, 2); x.fillStyle="#f2f0e8"; x.fillRect(5, -2, 1, 1);
    x.restore(); }
  function effects(x, G){
    for(const o of G.fx){ const u=o.t/0.45;
      if(o.k==="burst"){ x.fillStyle="rgba(232,64,42,"+(0.85*(1-u)).toFixed(2)+")"; x.beginPath(); x.arc(o.x, o.y, 4+u*CS*1.7, 0, 7); x.fill();
        x.fillStyle="rgba(255,190,150,"+(1-u).toFixed(2)+")"; for(let k=0;k<10;k++){ const a=k*0.63+o.x, d=3+u*20; x.fillRect(o.x+Math.cos(a)*d-1, o.y+Math.sin(a)*d-1, 2, 2); } }
      else if(o.k==="squish"){ x.fillStyle="rgba(168,224,90,"+(1-u).toFixed(2)+")"; for(let k=0;k<6;k++){ const a=k*1.05, d=2+u*9; x.fillRect(o.x+Math.cos(a)*d-1, o.y+Math.sin(a)*d-1, 2, 2); } }
      else { x.fillStyle="rgba(90,170,70,"+(1-u).toFixed(2)+")"; for(let k=0;k<4;k++){ const a=k*1.6+0.5, d=2+u*7; x.fillRect(o.x+Math.cos(a)*d, o.y+Math.sin(a)*d+u*4, 2, 1); } } }
  }
  function hud(x, G, i){
    x.fillStyle="#000"; x.fillRect(0, 0, W, Y0-2); x.textBaseline="middle"; _cbFont(x, 12);
    x.textAlign="left"; x.fillStyle="#9ad85a"; x.fillText(String(G.score).padStart(6, "0"), 12, 12);
    for(let k=0;k<Math.min(5, G.lives-1);k++) gnome(x, 74+k*12, 15, 0, 0, 0, 0);
    x.textAlign="center"; x.fillStyle="#9a9aaa"; x.fillText("HI "+String(Math.max(G.score, CABS.hi[i]||0)).padStart(6, "0"), W/2+26, 12);
    x.textAlign="right"; x.fillStyle="#f2e23a"; x.fillText("BED "+G.wave, W-12, 12);
  }
  // an attract screen's own little bed: built once, with a worm that goes round and round it
  let DEMO=null;
  function demo(){
    if(DEMO) return DEMO;
    const G={seed:4321, wave:3, score:0, lives:3, segs:[], fx:[], pops:[], peas:[], chain:[], u:0, tick:0.11, t:0};
    newBed(G); for(const q of G.bed) if(q && q.hp===3 && rnd(G)<0.3) q.ripe=1;
    newWorm(G, 11, -1, 1); DEMO=G; return G;
  }

  return {
    name:"HORNWORM HAVOC", col:"#9ad85a",
    help:"HORNWORM HAVOC · ARROWS OR WASD MOVE · SPACE SHOOTS · A RIPE RED TOMATO BURSTS · ESC TO STEP AWAY",
    newGame(){ const G={seed:(Date.now()>>>0)||7, score:0, lives:3, wave:1, over:false, won:false, t:0, acc:0, extra:12000, fx:[], pops:[], shake:0, clearT:0,
        p:{x:W/2, y:BOT-CS, dir:1, cool:0, walk:0, shot:0, inv:1.2, dead:0}};
      newBed(G); wave(G); return G; },
    key(G, e){},
    lean(G, K){ return [(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0), (K.ArrowUp||K.KeyW?1:0)-(K.ArrowDown||K.KeyS?1:0)]; },
    step(G, dt, K, i){ if(G.over) return; G.acc+=dt; while(G.acc>=1/120){ G.acc-=1/120; frame(G, K, i, 1/120); if(G.over) break; } },
    done(G){ if(!G.saved){ G.saved=true; _cbAddTop("hornworm", G.score, "BED "+G.wave); } },
    draw(x, G, t){
      x.save(); if(G.shake>0) x.translate(Math.round(Math.sin(t*90)*G.shake*10), Math.round(Math.cos(t*70)*G.shake*8));
      x.drawImage(ground(), 0, 0);
      for(let r=0;r<NR;r++) for(let c=0;c<NC;c++){ const q=G.bed[r*NC+c]; if(q) plant(x, c, r, q, t); }
      G.segs.forEach((s, k)=>{ const [sx, sy]=segXY(G, s); seg(x, sx, sy, s, t, k); });
      if(G.moth) moth(x, G.moth, t);
      x.fillStyle="#d8f08a"; for(const b of G.peas){ x.beginPath(); x.arc(b.x, b.y, 2, 0, 7); x.fill(); }
      const p=G.p; if(p.dead>0 || !(p.inv>0 && ((t*14)|0)%2)) gnome(x, p.x, p.y, t, p.walk, p.shot, p.dead);
      if(G.crow) crow(x, G.crow, t);
      effects(x, G);
      x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 9);
      for(const o of G.pops){ x.fillStyle=o.col; x.globalAlpha=Math.max(0, 1-o.t/1.1); x.fillText(o.txt, clamp(o.x, 50, W-50), o.y-o.t*14); x.globalAlpha=1; }
      x.restore();
      hud(x, G, 13);
      if(G.over) _cbMid(x, "GAME OVER", "BED "+G.wave+" · SPACE TO PLAY AGAIN");
      else if(G.msgT>0 && !(G.p.dead>0)) _cbMid(x, "BED "+G.wave, G.wave===1 ? "A RIPE TOMATO BURSTS" : "HERE IT COMES");
      _cbTube(x); },
    // the attract mode: a bed with the worm winding down it, the name; then the best scores
    attract(x, t, i){
      const G=demo(); G.u+=(1/12)/G.tick; while(G.u>=1){ G.u-=1; for(const s of G.segs) stepSeg(G, s); }
      x.drawImage(ground(), 0, 0);
      for(let r=0;r<NR;r++) for(let c=0;c<NC;c++){ const q=G.bed[r*NC+c]; if(q) plant(x, c, r, q, t); }
      G.segs.forEach((s, k)=>{ const [sx, sy]=segXY(G, s); seg(x, sx, sy, s, t, k); });
      gnome(x, W/2+Math.sin(t*0.8)*70, BOT-CS*2, t, t*8, (t*2)%1<0.2 ? 1 : 0, 0);
      x.fillStyle="#000"; x.fillRect(0, 0, W, Y0-2);
      if(((t/7)|0)%2===0){
        x.fillStyle="rgba(0,0,0,0.62)"; x.fillRect(36, 70, W-72, 66);
        x.textAlign="center"; x.textBaseline="middle"; _cbFont(x, 28);
        x.fillStyle="#9ad85a"; x.fillText("HORNWORM", W/2, 90); x.fillStyle="#e8402a"; x.fillText("HAVOC", W/2, 118); }
      else { x.fillStyle="rgba(0,0,0,0.75)"; x.fillRect(40, 50, W-80, 110); _cbTopDraw(x, "hornworm", 66, "#9ad85a"); }
      _cbFoot(x, i, t); _cbTube(x); },
    // for tools and testing
    _debug:{NC:NC, NR:NR, CS:CS, Y0:Y0, ZONE:ZONE, segXY:segXY, at:at, frame:frame}
  };
})();

/* ---- into 18g's cabinets: cabinet 13 (12c: the first of the two in the new end) ---- */
_CBG[13]=_HW;
{ const L=_cbTop("hornworm"); if(L.length) CABS.hi[13]=L[0].s;
  const R=ARCADE.cabs && ARCADE.cabs[13]; if(R){ _HW.attract(R.x, 0, 13); R.tex.needsUpdate=true; } }
