"use strict";
/* REST AREA · 18v-skee.js
   the arcade's alley roller
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   18v · ALLEY ROLL
   A lane you stand at the foot of, against the arcade's front wall (12c):
   two metres of maple, a hump at the end that throws the ball up, and a
   sloped board of rings behind it under a cage. Nine balls. The big ring
   is 10; inside it 20 and 30; above it 40 and 50, each a ring the size of
   the ball and a bit; and a 100 in each top corner. The ball bounces and
   rolls on the board as a ball would: it drops into a cup it comes over
   slowly, glances off a cup's lip it strikes (RIMMED), rolls down into
   the 10's open top, and once in a ring of the bullseye rolls down it and
   out through its slot. A ball that misses everything runs off the foot
   of the board for nothing, and one that falls short comes back to you.
   Two 40s or better in
   a row is a HOT HAND (ten more for each after the first), and the ninth
   ball scores double. The ring a ball drops into lights, the bulbs round
   the readout chase (and flash together on a big one), and when the
   game is done the tickets feed out of the slot, one for every ten.

   A and D (or the mouse) set where the ball starts across the lane, and
   Q and R turn your hand a little left and right. Hold SPACE (or the
   mouse button) and the gauge runs up and back; let go to roll. N starts
   again, Esc or E steps away, ENTER plays it (17).

   The ball is worked out step by step (SKEE.sim, 1/240 s) and the game
   plays back that path, so the score is where you saw it go in.
   SKEE.land(x, a, s) is the same roll as far as its first touch on the
   board: the mark you see while you hold the gauge. Built here the way 18h's dozer is; the best nine
   balls are kept in the browser.
   ---------------------------------------------------------------------- */
const SKEE={on:false, t:0, g:null, cab:null, hi:0, acc:0, keys:{}};
const SK={BALLS:9, LY:0.80, Z0:1.30, ZR:-0.50, ZL:-0.80, HUMP:0.10, HW:0.31, R:0.040, LIFT:58*Math.PI/180, TILT:38*Math.PI/180, ZB:-0.86, YB:0.84, BL:1.22, S0:1.3, S1:4.9,
  // the rings, in the board's own terms: u across it, v up it from its foot
  RINGS:[{p:100, u:-0.225, v:1.10, r:0.062}, {p:100, u:0.225, v:1.10, r:0.062}, {p:50, u:0, v:1.02, r:0.066}, {p:40, u:0, v:0.82, r:0.072},
         {p:30, u:0, v:0.40, r:0.115}, {p:20, u:0, v:0.375, r:0.195}, {p:10, u:0, v:0.345, r:0.285}]};
// THE ROLL, worked out step by step (1/240 s) and played back as it was worked out: up the lane, over the hump, through the air;
// then on the board, which is tilted: it bounces, rolls under gravity, glances off the cups' lips and the walls, and ends one of
// four ways. Into a cup (the 100s, the 50, the 40) if it comes over one slowly enough. Into the bullseye's rings: the 10's top is
// open, so a ball rolling down the board drops into it, but the 20 and the 30 are walled and taken only from the air; a ball
// trapped in a ring rolls down it and goes out through its slot (the 30 into its hole). Off the bottom of the board, for nothing.
// Or short of the board, back to you. The score is wherever the ball actually goes in.
SKEE.sim=function(x, a, s, landOnly){
  const R=SK.R, G=9.81, sn=Math.sin(SK.TILT), cs=Math.cos(SK.TILT), H=1/240, N0=0.006+R, W=SK.HW-R;
  const RG=SK.RINGS, CUPS=[0, 1, 2, 3], BULL={30:4, 20:5, 10:6};
  const out={path:[], ev:[], p:0, ri:-1, short:false, land:null, rim:-1, gutter:false};
  let n=0; const put=(X, Y, Z)=>{ if((n++)%4===0) out.path.push([X, Y, Z]); };
  const ev=(k)=>out.ev.push([out.path.length, k]);
  const ob=(u, v, h)=>[u, SK.YB+v*sn+h*cs, SK.ZB-v*cs+h*sn];
  // the lane, and the hump
  let px=x, vx=Math.sin(a)*s; const cz=s*Math.cos(a);
  for(let z=SK.Z0; z>SK.ZL; z-=cz*H){ px+=vx*H; if(Math.abs(px)>W){ px=Math.sign(px)*W*2-px; vx=-vx; }
    const f=clamp((SK.ZR-z)/(SK.ZR-SK.ZL), 0, 1); put(px, SK.LY+R+SK.HUMP*f*f, z); }
  ev("hop");
  // the air: off the hump at LIFT, until it meets the board (or falls short of it)
  let X=px, Y=SK.LY+SK.HUMP+R, Z=SK.ZL, VY=Math.sin(SK.LIFT)*s, VZ=-Math.cos(SK.LIFT)*s*Math.cos(a), VX=vx;
  for(let k=0;k<2400;k++){ VY-=G*H; X+=VX*H; Y+=VY*H; Z+=VZ*H; if(Math.abs(X)>W){ X=Math.sign(X)*W*2-X; VX=-VX; }
    const hn=(Y-SK.YB)*cs+(Z-SK.ZB)*sn, hv=(Y-SK.YB)*sn-(Z-SK.ZB)*cs;
    if(hv>SK.BL-R && VY*sn-VZ*cs>0){ const wv=VY*sn-VZ*cs, wn=VY*cs+VZ*sn, nv=-0.25*wv; VY=nv*sn+wn*cs; VZ=-nv*cs+wn*sn; ev("net"); }   // (the net at the back)
    if(hn<=N0 && hv>=0){ out.land={u:X, v:hv, wu:VX, wv:VY*sn-VZ*cs, wn:VY*cs+VZ*sn}; break; }
    if(hv<0 && Y<SK.YB+R){ out.short=true; out.land={u:X, v:hv}; break; }
    put(X, Y, Z); }
  if(landOnly || !out.land) return out;
  if(out.short){ ev("tick"); for(let k=1;k<=54;k++){ const q=k/54; put(X, SK.LY+R+SK.HUMP*(1-q)*(1-q), SK.ZL+q*0.9); put(X, SK.LY+R+SK.HUMP*(1-q)*(1-q), SK.ZL+q*0.9); put(X, SK.LY+R, SK.ZL+q*0.9); put(X, SK.LY+R, SK.ZL+q*0.9); } return out; }
  // the board
  let u=out.land.u, v=out.land.v, h=0, wu=out.land.wu*0.85, wv=out.land.wv*0.85, wn=-out.land.wn*0.28, zone=0, end=null;
  ev("thump");
  const inner=(pu, pv)=>{ for(const p of [30, 20, 10]){ const r=RG[BULL[p]]; if(Math.hypot(pu-r.u, pv-r.v)<r.r-0.3*R) return p; } return 0; };
  const bounce=(r, sign, e)=>{ const d=Math.hypot(u-r.u, v-r.v)||1e-6, nu=(u-r.u)/d*sign, nv=(v-r.v)/d*sign, dot=wu*nu+wv*nv;
    if(dot<0){ wu-=(1+e)*dot*nu; wv-=(1+e)*dot*nv; return -dot; } return 0; };
  for(let k=0;k<240*8 && !end;k++){
    wn-=G*cs*H; wv-=G*sn*H*(h<=0 ? 5/7 : 1);
    u+=wu*H; v+=wv*H; h+=wn*H;
    if(h<=0){ h=0; if(wn<-0.35){ wn=-wn*0.3; ev("tap"); } else wn=0; const f=Math.max(0, 1-0.4*H); wu*=f; wv*=f; }
    if(Math.abs(u)>W){ u=Math.sign(u)*W; wu=-wu*0.5; ev("wall"); }
    if(v>SK.BL-R){ v=SK.BL-R; wv=-Math.abs(wv)*0.4; }
    const low=h<0.03, sp=Math.hypot(wu, wv);
    // the cups up the board: over one slowly and low, in; on its lip, glanced off
    for(const i of CUPS){ const r=RG[i], d=Math.hypot(u-r.u, v-r.v);
      if(!low) continue;
      if(d<r.r-0.35*R){ if(sp<2.4){ end={kind:"cup", i:i}; break; } }
      else if(d<r.r+0.5*R){ const hit=bounce(r, 1, 0.45); if(!hit) continue;
        if(hit<0.35 && v>r.v){ end={kind:"cup", i:i}; break; }                       // (slow on its upper lip: it tips in)
        const q=(r.r+0.5*R)/d; u=r.u+(u-r.u)*q; v=r.v+(v-r.v)*q; if(hit>0.3){ if(out.rim<0 || RG[i].p>RG[out.rim].p) out.rim=i; ev("rim"); } } }
    if(end) break;
    // the bullseye: the 10 open at its top to a ball rolling down; the 20 and 30 taken only from the air; nothing climbs out of a ring
    const c=inner(u, v);
    if(c!==zone){
      if(c>zone){ const r=RG[BULL[c]]; if(h>0.005 || (zone===0 && c===10 && v>r.v)) zone=c;
        else if(bounce(r, 1, 0.35)>0.3) ev("lip"); }
      else { const r=RG[BULL[zone]]; if(bounce(r, -1, 0.35)>0.3) ev("lip"); const d=Math.hypot(u-r.u, v-r.v), q=(r.r-0.3*R-0.002)/d; if(q<1){ u=r.u+(u-r.u)*q; v=r.v+(v-r.v)*q; } } }
    if(zone && h===0 && Math.hypot(wu, wv)<0.15) end={kind:"ring", p:zone};
    if(v<R*0.5 && !zone){ end={kind:"gutter"}; }
    put(...ob(u, v, N0+h)); }
  if(!end) end=zone ? {kind:"ring", p:zone} : {kind:"gutter"};
  // where it goes in, and how
  if(end.kind==="cup"){ out.p=RG[end.i].p; out.ri=end.i; ev("drop"); const r=RG[end.i];
    for(let k=1;k<=60;k++){ const q=k/60; put(...ob(u+(r.u-u)*Math.min(1, q*2), v+(r.v-v)*Math.min(1, q*2), N0-q*0.12)); } }
  else if(end.kind==="ring"){ out.p=end.p; out.ri=BULL[end.p]; const t=SKEE.slot(end.p); ev("drop");
    for(let k=1;k<=80;k++){ const q=k/80, e=Math.min(1, q*1.6); put(...ob(u+(t.u-u)*e, v+(t.v-v)*e, N0-Math.max(0, q-0.6)*0.3)); } }
  else { out.gutter=true; ev("tick"); for(let k=1;k<=40;k++){ const q=k/40; put(...ob(u, v-q*0.12, N0-q*0.15)); } }
  return out; };
// where the bullseye's rings go out: a slot at the foot of the 10 and of the 20; the 30's own hole
SKEE.slot=(p)=>p===30 ? {u:0, v:SK.RINGS[4].v} : p===20 ? {u:0, v:0.225} : {u:0, v:0.11};
// where a roll first comes down (the mark while you hold the gauge)
SKEE.land=function(x, a, s){ const o=SKEE.sim(x, a, s, true); return o.land ? {u:o.land.u, v:o.land.v, short:o.short} : {u:0, v:0, short:true}; };
(function skeeBuild(){
  const A=ARCADE.room; if(!A) return;
  const P={x:80.6, z:A.z1-2.02, y:A.y};                    // the lane's own origin; its far end stops just short of the front wall
  const G=new T.Group(); G.position.set(P.x, P.y, P.z); G.rotation.y=Math.PI; scene.add(G);   // local +z: toward you
  const E=[];
  const ent=(geo,x,y,z,c,rx,ry,rz)=>E.push({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0,"YXZ")), V3(1,1,1)), color:new T.Color(c)});
  const B=(w,h,d,x,y,z,c,rx)=>ent(boxGeo(w,h,d),x,y,z,c,rx);
  const BLUE="#1e3a6a", MAPLE="#c89858", RAIL="#b8b0a0", DARK="#141418", CORK="#b07a48";
  const LY=SK.LY, HW=SK.HW, OW=HW+0.05, cs=Math.cos(SK.TILT), sn=Math.sin(SK.TILT), zEnd=SK.ZB-SK.BL*cs, yEnd=SK.YB+SK.BL*sn;
  // the body under the lane, the lane, its rails; the hump; the box under the board
  B(OW*2, LY-0.06, SK.Z0-SK.ZL+0.10, 0, (LY-0.06)/2, (SK.Z0+SK.ZL)/2+0.05, BLUE);
  B(HW*2, 0.04, SK.Z0-SK.ZR, 0, LY-0.02, (SK.Z0+SK.ZR)/2, MAPLE);
  for(const sx of [-1,1]){ B(0.05, 0.14, SK.Z0-SK.ZL+0.10, sx*(HW+0.025), LY+0.012, (SK.Z0+SK.ZL)/2+0.05, RAIL);
  }
  { const n=6; for(let k=0;k<n;k++){ const f0=k/n, f1=(k+1)/n, e=(f)=>SK.HUMP*f*f, z0=SK.ZR+(SK.ZL-SK.ZR)*f0, z1=SK.ZR+(SK.ZL-SK.ZR)*f1, L=Math.hypot(z1-z0, e(f1)-e(f0))+0.004;
      B(HW*2-0.002*k, 0.04, L, 0, LY-0.02+(e(f0)+e(f1))/2, (z0+z1)/2, MAPLE, Math.atan2(e(f1)-e(f0), z0-z1)); } }
  B(OW*2, 0.20, 0.05, 0, LY-0.10, SK.Z0+0.125, DARK);                              // the end toward you, and the ball trough in it
  B(0.10, 0.014, 0.016, 0.16, LY-0.055, SK.Z0+0.156, "#3a3a40");                    // the ticket slot's lip
  B(OW*2+0.06, SK.YB-0.02, SK.ZL-zEnd+0.04, 0, (SK.YB-0.02)/2, (SK.ZL+zEnd)/2-0.02, BLUE);   // under the board
  // the board's backing (cork), sloped; its sides and the cage over it
  B(HW*2+0.10, 0.04, SK.BL+0.06, 0, SK.YB+(SK.BL/2)*sn-0.030*cs, SK.ZB-(SK.BL/2)*cs-0.030*sn, CORK, SK.TILT);
  for(const sx of [-1,1]) B(0.04, yEnd+0.26-LY, SK.ZL-zEnd+0.02, sx*(OW+0.03), (yEnd+0.26+LY)/2, (SK.ZL+zEnd)/2-0.01, BLUE);
  for(let k=0;k<9;k++) B(OW*2, 0.012, 0.012, 0, yEnd+0.24, zEnd+0.06+k*(SK.ZL-zEnd-0.10)/8, RAIL);   // the cage's top, bars across
  B(OW*2+0.10, 0.76, 0.06, 0, yEnd+0.38, zEnd-0.012, BLUE);                        // the back, the readout on it over the cage
  B(OW*2+0.14, 0.06, 0.20, 0, yEnd+0.79, zEnd+0.06, DARK);
  const body=new T.Mesh(mergeEntries(E), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:0.12}));
  // the lane's face: maple boards with their grain, the inlay and the arrows, varnished
  { const Ln=SK.Z0-SK.ZR, tex=signTex(256, 1024, (c, Wc, Hc)=>{ let q=11; const r=()=>{ q=(q*1664525+1013904223)>>>0; return q/4294967296; };
      const n=9, bw=Wc/n; for(let k=0;k<n;k++){ const base=[200,152,90].map(v=>v+(r()-0.5)*26); c.fillStyle="rgb("+base.map(Math.round)+")"; c.fillRect(k*bw, 0, bw, Hc);
        for(let i=0;i<60;i++){ const x=k*bw+r()*bw, a=0.05+r()*0.10; c.strokeStyle="rgba(110,64,24,"+a.toFixed(2)+")"; c.lineWidth=0.6+r()*1.2; c.beginPath(); c.moveTo(x, 0);
          for(let y=0;y<=Hc;y+=64) c.lineTo(x+Math.sin(y*0.01+i)*2.2, y); c.stroke(); }
        c.fillStyle="rgba(60,30,10,0.55)"; c.fillRect(k*bw, 0, 1.5, Hc); for(let y=r()*300;y<Hc;y+=280+r()*260) c.fillRect(k*bw, y, bw, 1.5); }
      c.fillStyle="#6a3a16"; for(const u of [-0.10, 0.10]) c.fillRect((u/(HW*2)+0.5)*Wc-2, 60, 4, Hc-120);
      c.fillStyle="#3a1e0a"; for(const [u, y] of [[0, 0.30], [-0.12, 0.36], [0.12, 0.36], [-0.22, 0.42], [0.22, 0.42]]){ const X=(u/(HW*2)+0.5)*Wc, Y=y*Hc;
        c.beginPath(); c.moveTo(X, Y-26); c.lineTo(X+9, Y+6); c.lineTo(X-9, Y+6); c.closePath(); c.fill(); }
      c.fillStyle="#fff6d8"; c.globalAlpha=0.9; for(const u of [-0.16, 0, 0.16]){ c.beginPath(); c.arc((u/(HW*2)+0.5)*Wc, Hc*0.82, 5, 0, 7); c.fill(); } c.globalAlpha=1; });
    tex.anisotropy=4;
    const m=new T.Mesh(new T.PlaneGeometry(HW*2-0.004, Ln), new T.MeshStandardMaterial({map:tex, roughness:0.28, metalness:0.0})); m.rotation.x=-Math.PI/2;
    m.position.set(0, LY+0.005, (SK.Z0+SK.ZR)/2); m.receiveShadow=true; G.add(m); }
  // the sides: a sunburst and the name, a centimetre off the blue; neon along the cage's top edges
  { const art=signTex(512, 256, (c, Wc, Hc)=>{ c.fillStyle="#1e3a6a"; c.fillRect(0,0,Wc,Hc);
      for(let k=0;k<18;k++){ c.fillStyle=k%2 ? "#24467e" : "#1a325c"; c.beginPath(); c.moveTo(Wc*0.18, Hc); c.arc(Wc*0.18, Hc, Wc*1.2, -Math.PI+k*Math.PI/18, -Math.PI+(k+1)*Math.PI/18); c.closePath(); c.fill(); }
      c.fillStyle="#f2c81e"; c.fillRect(0, Hc*0.70, Wc, Hc*0.05); c.fillStyle="#e8402a"; c.fillRect(0, Hc*0.78, Wc, Hc*0.05);
      c.fillStyle="#fff6d8"; for(let k=0;k<14;k++){ const x=(k*97)%Wc, y=(k*53)%(Hc*0.6)+12; c.beginPath(); for(let q=0;q<10;q++){ const a=-Math.PI/2+q*Math.PI/5, rr=q%2 ? 2.5 : 6; c.lineTo(x+Math.cos(a)*rr, y+Math.sin(a)*rr); } c.fill(); }
      c.lineJoin="round"; c.lineWidth=10; c.strokeStyle="#0c1830"; c.fillStyle="#f2c81e"; fitText(c, "ALLEY ROLL", Wc*0.72, Hc*0.30, Wc*0.56, Hc*0.42, "900", "'Arial Black', Arial");
      c.strokeText("ALLEY ROLL", Wc*0.56, Hc*0.42); c.fillText("ALLEY ROLL", Wc*0.56, Hc*0.42); });
    const aw=SK.Z0-SK.ZL+0.06, ah=LY-0.16, am=new T.MeshStandardMaterial({map:art, roughness:0.5});
    for(const sx of [-1, 1]){ const m=new T.Mesh(new T.PlaneGeometry(aw, ah), am); m.rotation.y=sx*Math.PI/2; m.position.set(sx*(OW+0.012), 0.06+ah/2, (SK.Z0+SK.ZL)/2+0.04); G.add(m); }
    const neon=(col)=>new T.MeshBasicMaterial({color:col, toneMapped:false}), nP=neon(0xff3ecb), nC=neon(0x3df3ff), L=SK.ZL-zEnd+0.02;
    for(const sx of [-1, 1]){ const t=new T.Mesh(new T.CylinderGeometry(0.008, 0.008, L, 8).rotateX(Math.PI/2), sx<0 ? nP : nC); t.position.set(sx*(OW+0.03), yEnd+0.26+0.012, (SK.ZL+zEnd)/2-0.01); G.add(t); } }
  body.castShadow=true; body.receiveShadow=true; G.add(body);
  // the board's face: the rings and their numbers drawn, each ring's hole dark; the rims real, standing off it
  const onBoard=(u, v, lift)=>V3(u, SK.YB+v*sn+(lift||0)*cs, SK.ZB-v*cs+(lift||0)*sn);
  { const tex=signTex(512, 1008, (c, Wc, Hc)=>{ const X=(u)=>(u/(HW*2)+0.5)*Wc, Y=(v)=>(1-v/SK.BL)*Hc, S=Wc/(HW*2);
      const g=c.createLinearGradient(0, 0, 0, Hc); g.addColorStop(0, "#1a2c58"); g.addColorStop(1, "#0e1a38"); c.fillStyle=g; c.fillRect(0,0,Wc,Hc);
      for(let i=0;i<220;i++){ c.fillStyle="rgba(255,246,216,"+(0.05+((i*37)%10)/60).toFixed(2)+")"; c.fillRect((i*131.7)%Wc, (i*71.3)%Hc, 2, 2); }
      // the bullseye's bands, then the small rings' collars
      const band=(r, w, col)=>{ c.strokeStyle=col; c.lineWidth=w*S; c.beginPath(); c.arc(X(r.u), Y(r.v), (r.r+w/2)*S, 0, 7); c.stroke(); };
      for(const r of SK.RINGS.slice().reverse()){ if(r.p<=30){ c.fillStyle=r.p===10 ? "#e8402a" : r.p===20 ? "#f2c81e" : "#2a8a4a"; c.beginPath(); c.arc(X(r.u), Y(r.v), r.r*S, 0, 7); c.fill(); }
        else { band(r, 0.030, r.p>=100 ? "#f2c81e" : "#e8402a"); band(r, 0.010, "#fff6d8"); c.fillStyle="#050404"; c.beginPath(); c.arc(X(r.u), Y(r.v), r.r*S, 0, 7); c.fill(); } }
      // the 30's hole in its own disc; the slots the 20 and the 10 empty through, at the foot of each
      c.fillStyle="#050404"; c.beginPath(); c.arc(X(0), Y(SK.RINGS[4].v), 0.068*S, 0, 7); c.fill();
      for(const [p, w, hh] of [[20, 0.10, 0.034],[10, 0.14, 0.042]]){ const t=SKEE.slot(p); c.beginPath(); c.ellipse(X(t.u), Y(t.v), w/2*S, hh/2*S, 0, 0, 7); c.fill(); }
      c.textAlign="center"; c.textBaseline="middle"; c.lineJoin="round";
      const num=(t, u, v, f)=>{ c.font="900 "+f+"px 'Arial Black', Arial"; c.lineWidth=7; c.strokeStyle="#0c1830"; c.strokeText(t, X(u), Y(v)); c.fillStyle="#fff6d8"; c.fillText(t, X(u), Y(v)); };
      num("10", -0.205, 0.22, 34); num("10", 0.205, 0.22, 34); num("20", -0.12, 0.30, 30); num("20", 0.12, 0.30, 30); num("30", 0, 0.488, 22); num("40", -0.15, 0.82, 32); num("50", 0.15, 1.02, 32); num("100", -0.225, 0.975, 24); num("100", 0.225, 0.975, 24); });
    tex.anisotropy=4;
    const m=new T.Mesh(new T.PlaneGeometry(HW*2, SK.BL), new T.MeshStandardMaterial({map:tex, roughness:0.8})); m.rotation.x=-(Math.PI/2-SK.TILT);
    m.position.copy(onBoard(0, SK.BL/2, 0.006)); m.receiveShadow=true; G.add(m);
    const rg=[]; for(const r of SK.RINGS){ const q=new T.Quaternion().setFromEuler(new T.Euler(-(Math.PI/2-SK.TILT), 0, 0));
      rg.push({geo:new T.TorusGeometry(r.r, 0.011, 8, 32), matrix:new T.Matrix4().compose(onBoard(r.u, r.v, 0.024), q, V3(1,1,1)), color:new T.Color(r.p>=100 ? "#f2c81e" : r.p>=40 ? "#e8402a" : "#e8e4d8")}); }
    const rm=new T.Mesh(mergeEntries(rg), new T.MeshStandardMaterial({vertexColors:true, roughness:0.45})); rm.castShadow=true; G.add(rm);
    // each ring's light, round its rim, lit when a ball drops in (one material each, turned up and down, never hidden)
    var glows=SK.RINGS.map(r=>{ const q=new T.Quaternion().setFromEuler(new T.Euler(-(Math.PI/2-SK.TILT), 0, 0));
      const m=new T.Mesh(new T.TorusGeometry(r.r, 0.0145, 8, 32), new T.MeshBasicMaterial({color:0x000000, toneMapped:false})); m.position.copy(onBoard(r.u, r.v, 0.024)); m.quaternion.copy(q); G.add(m); return m; }); }       // (round the rim on its own centre, 3.5 mm out from it all round and clear of the board)
  // the balls: one in play, the rest waiting in the trough at the right
  const ballM=new T.MeshStandardMaterial({color:0xb86a3a, roughness:0.45}), ballG=new T.SphereGeometry(SK.R, 18, 12);
  const ball=new T.Mesh(ballG, ballM); ball.castShadow=true; G.add(ball);
  const spare=[]; for(let k=0;k<SK.BALLS;k++){ const m=new T.Mesh(ballG, ballM); m.position.set(OW+0.10, LY-0.13, SK.Z0-0.06-k*0.085); G.add(m); spare.push(m); }
  { const e2=[]; const q=(w,h,d,x,y,z,c)=>e2.push({geo:boxGeo(w,h,d), matrix:new T.Matrix4().makeTranslation(x,y,z), color:new T.Color(c)});
    q(0.012, 0.05, 0.80, OW+0.052, LY-0.16, SK.Z0-0.40, RAIL); q(0.012, 0.05, 0.80, OW+0.148, LY-0.16, SK.Z0-0.40, RAIL); q(0.10, 0.012, 0.80, OW+0.10, LY-0.181, SK.Z0-0.40, DARK);
    G.add(new T.Mesh(mergeEntries(e2), new T.MeshStandardMaterial({vertexColors:true, roughness:0.5, metalness:0.3}))); }
  // the aiming line on the lane, and the gauge on the near end
  const aim=new T.Mesh(new T.PlaneGeometry(0.012, 1), new T.MeshBasicMaterial({color:0xfff3b0, transparent:true, opacity:0.55, depthWrite:false})); aim.rotation.x=-Math.PI/2; G.add(aim);
  const mark=new T.Mesh(new T.RingGeometry(SK.R*0.9, SK.R*1.25, 20), new T.MeshBasicMaterial({color:0xfff3b0, transparent:true, opacity:0.8, depthWrite:false})); mark.rotation.x=-(Math.PI/2-SK.TILT); G.add(mark);
  // the gauge again where you can see it as you roll: a strip along the top of the left rail that runs up with the power
  const gauge=new T.Mesh(new T.PlaneGeometry(0.034, 1), new T.MeshBasicMaterial({color:0xffd247, toneMapped:false})); gauge.rotation.x=-Math.PI/2; gauge.visible=false; G.add(gauge);
  // the readout on the back, under the cage's hood
  const rc=cvs(512, 300), rtex=setSRGB(new T.CanvasTexture(rc)); rtex.minFilter=T.LinearFilter;
  { const m=new T.Mesh(new T.PlaneGeometry(OW*2+0.02, 0.43), new T.MeshBasicMaterial({map:rtex, toneMapped:false})); m.position.set(0, yEnd+0.51, zEnd+0.032); G.add(m); }
  const bulbs=[0,1,2].map(()=>new T.MeshBasicMaterial({color:0xffd890, toneMapped:false}));
  { const bg=new T.SphereGeometry(0.012, 8, 6), w=OW*2+0.06, h=0.47, y0=yEnd+0.51, z=zEnd+0.040, n=Math.round(2*(w+h)/0.06); let k=0;
    for(let i=0;i<n;i++){ const d=i/n*2*(w+h); let x, y; if(d<w){ x=-w/2+d; y=y0+h/2; } else if(d<w+h){ x=w/2; y=y0+h/2-(d-w); } else if(d<2*w+h){ x=w/2-(d-w-h); y=y0-h/2; } else { x=-w/2; y=y0-h/2+(d-2*w-h); }
      const m=new T.Mesh(bg, bulbs[k++%3]); m.position.set(x, y, z); G.add(m); } }
  // the tickets, out of the slot in the near end as the game is done
  const tk=(()=>{ const t=signTex(128, 64, (c, Wc, Hc)=>{ c.fillStyle="#f2a8c0"; c.fillRect(0,0,Wc,Hc); c.fillStyle="#b8406a"; c.fillRect(0, Hc-3, Wc, 3);
      c.fillStyle="#7a1e3a"; fitText(c, "ALLEY ROLL", Wc*0.84, Hc*0.40, Wc/2, Hc*0.36, "900", "'Arial Black', Arial"); fitText(c, "1 TICKET", Wc*0.6, Hc*0.3, Wc/2, Hc*0.72, "700", "Arial"); });
    t.wrapS=t.wrapT=T.RepeatWrapping; const m=new T.Mesh(new T.PlaneGeometry(0.07, 1), new T.MeshStandardMaterial({map:t, roughness:0.7, side:T.DoubleSide})); m.scale.y=0.001; G.add(m);
    return m; })();
  G.updateMatrixWorld(true); body.matrixAutoUpdate=false;
  LAMPS.push({x:P.x, y:P.y+2.3, z:P.z-0.5, color:0xfff0d8, intensity:0.75, dist:5, decay:1.5, under:true, indoor:true, circ:"bldg"});
  addCol(P.x-OW-0.18, P.x+OW+0.06, P.z-SK.Z0-0.16, A.z1, A.y-0.5, A.y+2.4);
  const st={x:P.x, z:P.z-SK.Z0-0.95};
  addUse(st.x, st.z+0.15, A.y, "PLAY ALLEY ROLL", ()=>SKEE.start(), 0.9).game=true;
  ARCADE.games.push({name:"ALLEY ROLL", x:st.x, z:st.z});
  SKEE.cab={G:G, P:P, glows:glows, bulbs:bulbs, tk:tk, ball:ball, spare:spare, aim:aim, mark:mark, gauge:gauge, onBoard:onBoard, read:{c:rc, x:rc.getContext("2d"), tex:rtex}, stand:st, floor:A.y, OW:OW};
})();

/* ---- the game ------------------------------------------------------------ */
function _skSnd(k){ const C=SKEE.cab; if(typeof AUDIO!=="undefined" && C) AUDIO.blip(k, C.P.x, C.P.z+1.5); }
try{ SKEE.hi=+(localStorage.getItem("restarea.arcade.alleyroll")||0)||0; }catch(e){}
SKEE.newGame=function(){ return {score:0, left:SK.BALLS, x:0, a:0, pow:0, charge:false, ph:0, roll:null, last:"", lastT:0, over:false, overT:0, tally:[], streak:0, lit:-1, litT:0, tix:0, tixShown:0, flashT:0}; };
SKEE.release=function(){
  const g=SKEE.g; if(!g || !g.charge || g.roll) return; g.charge=false;
  const s=SK.S0+(SK.S1-SK.S0)*g.pow, a=g.a+(Math.random()-0.5)*0.016, x=g.x+(Math.random()-0.5)*0.008;
  g.roll={x:x, a:a, s:s, t:0, S:SKEE.sim(x, a, s), ei:0}; g.left--; _skSnd("whoosh"); };
SKEE.start=function(){
  const C=SKEE.cab; if(!C || SKEE.on) return;
  for(const o of [typeof DARTS!=="undefined" && DARTS, typeof HOCKEY!=="undefined" && HOCKEY, typeof HOOPS!=="undefined" && HOOPS, typeof RAIDERS!=="undefined" && RAIDERS,
                  typeof CABS!=="undefined" && CABS, typeof DOZER!=="undefined" && DOZER, typeof WHACK!=="undefined" && WHACK]) if(o && o.on) o.stop();
  if(seated) standUp();
  SKEE.on=true; SKEE.keys={}; clearKeys(); SKEE.g=SKEE.newGame(); _skSnd("coin");
  toast("A D · ACROSS THE LANE   Q R · TURN YOUR HAND   HOLD SPACE · POWER, LET GO TO ROLL   N · AGAIN   ESC · STEP AWAY","#ffd247");
};
SKEE.stop=function(){ SKEE.on=false; SKEE.keys={}; player.pitch=-0.1; SKEE.g=null; };
SKEE.key=function(e){
  if(e.code==="Escape" || e.code==="KeyE" || e.code==="Tab"){ if(!e.repeat) SKEE.stop(); return; }
  const g=SKEE.g; if(!g) return;
  if(!e.repeat && (e.code==="KeyN" || (g.over && g.overT>0.8 && (e.code==="Space" || e.code==="Enter")))){ SKEE.g=SKEE.newGame(); _skSnd("coin"); return; }
  if(e.code==="Space" && !e.repeat && !g.roll && !g.over){ g.charge=true; g.ph=0; g.pow=0; }
  SKEE.keys[e.code]=true;
};
addEventListener("keyup", e=>{ SKEE.keys[e.code]=false; if(SKEE.on && e.code==="Space") SKEE.release(); });
SKEE.mouse=function(dx){ const g=SKEE.g; if(!g || g.roll) return; g.x=clamp(g.x+dx*0.0010, -(SK.HW-SK.R-0.01), SK.HW-SK.R-0.01); };
renderer.domElement.addEventListener("mousedown", e=>{ const g=SKEE.g; if(!SKEE.on || e.button!==0 || !g || g.roll || g.over) return; g.charge=true; g.ph=0; g.pow=0; });
addEventListener("mouseup", e=>{ if(SKEE.on && e.button===0) SKEE.release(); });
function _skReadout(g){
  const R=SKEE.cab.read, x=R.x, W=512, H=300, t=SKEE.t;
  x.fillStyle="#0c1830"; x.fillRect(0,0,W,H); x.strokeStyle="#f2c81e"; x.lineWidth=6; x.strokeRect(8,8,W-16,H-16);
  x.textAlign="center"; x.textBaseline="middle"; x.lineJoin="round";
  const put=(s, px, py, f, col, w, fam)=>{ const F=(n)=>fam ? "900 "+n+"px 'Arial Black', Arial" : "bold "+n+"px 'Courier New', monospace"; x.font=F(f); while(f>12 && x.measureText(s).width>w){ f-=2; x.font=F(f); } x.fillStyle=col; x.fillText(s, px, py); };
  put("ALLEY ROLL", W/2, 62, 58, "#f2c81e", 400, 1);
  x.fillStyle="#04080f"; x.fillRect(36, 110, W-72, 158);
  if(g && !g.over){ put(("000"+g.score).slice(-3), 150, 170, 76, "#ffd247", 190); put(g.left===1 && !g.roll ? "LAST BALL ×2" : "BALLS "+g.left, 372, 150, 34, g.left===1 && !g.roll && ((t*3)|0)%2 ? "#ff3ecb" : "#3df3ff", 180);
    put(g.lastT>0 ? g.last : "BEST "+SKEE.hi, 372, 196, 28, g.lastT>0 ? "#7aff7a" : "#8a8aa0", 190);
    // the gauge
    x.fillStyle="#1a2438"; x.fillRect(60, 230, W-120, 22); const k=g.charge ? g.pow : 0;
    const gr=x.createLinearGradient(60, 0, W-60, 0); gr.addColorStop(0, "#3df36a"); gr.addColorStop(0.6, "#ffd247"); gr.addColorStop(1, "#ff5a3a"); x.fillStyle=gr; x.fillRect(60, 230, (W-120)*k, 22); }
  else if(g){ put(g.score+" POINTS · "+Math.round(g.tixShown)+" TICKETS", W/2, 156, 46, "#ffd247", 420); put(g.score>=SKEE.hi && g.score>0 ? "THE BEST YET" : "BEST "+SKEE.hi, W/2, 208, 30, "#3df3ff", 400);
    put("SPACE TO ROLL AGAIN", W/2, 246, 22, ((t*2)|0)%2 ? "#ff3ecb" : "#8a8aa0", 400); }
  else { put("ENTER TO PLAY", W/2, 162, 46, ((t*2)|0)%2 ? "#ffd247" : "#ff3ecb", 400); put("NINE BALLS · BEST "+SKEE.hi, W/2, 222, 28, "#3df3ff", 400); }
  R.tex.needsUpdate=true;
}
function updateSkee(dt){
  const C=SKEE.cab; if(!C) return;
  SKEE.t+=dt;
  const cam=camera.position, near=Math.hypot(cam.x-C.P.x, cam.z-C.P.z)<12 && Math.abs(cam.y-(C.floor+1.5))<3;
  if(!SKEE.on && !near) return;
  const g=SKEE.g, K=SKEE.keys, LY=SK.LY;
  if(g){ g.lastT=Math.max(0, g.lastT-dt); g.litT=Math.max(0, g.litT-dt); g.flashT=Math.max(0, g.flashT-dt); if(g.over) g.overT+=dt;
    if(!g.roll && !g.over){
      g.x=clamp(g.x+((K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0))*0.22*dt, -(SK.HW-SK.R-0.01), SK.HW-SK.R-0.01);
      g.a=clamp(g.a+((K.KeyR?1:0)-(K.KeyQ?1:0))*0.10*dt, -0.10, 0.10);
      if(g.charge){ g.ph+=dt*0.85; g.pow=1-Math.abs(1-(g.ph%2)); } }
    // the ball on its way: its worked-out path, a point every sixtieth of a second, its sounds where they fell; then what it scored
    const r=g.roll; if(r){ r.t+=dt; const S=r.S, i=r.t*60;
      while(r.ei<S.ev.length && S.ev[r.ei][0]<=i){ const k=S.ev[r.ei][1]; if(k!=="lip" && k!=="wall" || r.ei%2===0) _skSnd(k==="drop" ? "thump" : k==="lip" || k==="wall" || k==="net" ? "rim" : k); r.ei++; }
      if(i>=S.path.length){ g.roll=null; let p=S.p, msg=S.short ? "SHORT" : S.gutter ? "IN THE GUTTER" : S.rim>=0 && SK.RINGS[S.rim].p>p ? "RIMMED · +"+p : "+"+p;
          if(p>=40){ g.streak++; if(g.streak>=2){ p+=10*(g.streak-1); msg="HOT HAND · +"+p; } } else g.streak=0;
          if(g.left===0 && p>0){ p*=2; msg="LAST BALL DOUBLE · +"+p; }
          g.score+=p; g.tally.push(p); g.last=msg; g.lastT=1.8;
          if(S.ri>=0){ g.lit=S.ri; g.litT=1.0; if(p>=40) g.flashT=1.2; }
          if(p>=40) _skSnd("jingle"); else if(p>0) _skSnd("coin");
          if(g.left<=0){ g.over=true; g.overT=0; g.tix=Math.max(1, Math.round(g.score/10)); if(g.score>SKEE.hi){ SKEE.hi=g.score; try{ localStorage.setItem("restarea.arcade.alleyroll", String(g.score)); }catch(e){} } } } } }
  // where everything is: the ball, the ones waiting, the line and the mark
  { const b=C.ball, r=g && g.roll;
    if(r){ const P=r.S.path, i=Math.min(P.length-1, r.t*60), i0=Math.floor(i), i1=Math.min(P.length-1, i0+1), f=i-i0, A=P[i0], Bp=P[i1];
      b.position.set(A[0]+(Bp[0]-A[0])*f, A[1]+(Bp[1]-A[1])*f, A[2]+(Bp[2]-A[2])*f);
      const sp=Math.hypot(Bp[0]-A[0], Bp[1]-A[1], Bp[2]-A[2])*60; b.rotation.x-=dt*sp/SK.R; b.visible=true; }
    else if(g && !g.over && SKEE.on){ b.visible=true; b.position.set(g.x, LY+SK.R+0.10+(g.charge ? -0.06*g.pow : 0), SK.Z0+0.04); }
    else b.visible=false;
    const left=g ? g.left-(g.roll || g.over || !SKEE.on ? 0 : 1) : SK.BALLS; C.spare.forEach((m, k)=>{ m.visible=k<left; });
    const show=SKEE.on && g && !g.roll && !g.over; C.aim.visible=!!show; C.mark.visible=!!(show && g.charge);
    C.gauge.visible=!!(show && g.charge && g.pow>0.01);
    if(C.gauge.visible){ const L=0.9*g.pow; C.gauge.scale.set(1, L, 1); C.gauge.position.set(-(SK.HW+0.025), LY+0.090, SK.Z0-0.02-L/2); C.gauge.material.color.setHSL(0.33*(1-g.pow), 0.9, 0.55); }
    if(show){ const z1=SK.ZR, x0=g.x, x1=g.x+Math.tan(g.a)*(SK.Z0-z1), L=Math.hypot(SK.Z0-z1, x1-x0);
      C.aim.position.set((x0+x1)/2, LY+0.012, (SK.Z0+z1)/2); C.aim.scale.set(1, L, 1); C.aim.rotation.order="YXZ"; C.aim.rotation.y=-Math.atan2(x1-x0, SK.Z0-z1);
      if(g.charge){ const Ld=SKEE.land(g.x, g.a, SK.S0+(SK.S1-SK.S0)*g.pow); if(Ld.short) C.mark.visible=false; else C.mark.position.copy(C.onBoard(Ld.u, Ld.v, 0.03)); } } }
  // the ring that took the ball lights and blinks; the bulbs chase, faster and all together when you score big; the tickets feed out
  { const lit=g && g.litT>0 ? g.lit : -1;
    C.glows.forEach((m, i)=>{ const on=i===lit && ((g.litT*10)|0)%2===0; m.material.color.setHex(on ? (SK.RINGS[i].p>=40 ? 0xffe060 : 0xfff6d8) : 0x000000); });
    const fl=g && g.flashT>0, ph=Math.floor(SKEE.t*(fl ? 14 : 5));
    C.bulbs.forEach((m, i)=>{ const on=fl ? ph%2===0 : (ph%3)===i; m.color.setHex(on ? 0xffe8a0 : 0x5a4020); });
    const want=g && g.over ? g.tix : 0; if(g){ g.tixShown=want>g.tixShown ? Math.min(want, g.tixShown+dt*14) : want; }
    const n=g ? g.tixShown : 0, Lt=Math.min(0.62, n*0.035);
    C.tk.scale.y=Math.max(0.001, Lt); C.tk.material.map.repeat.set(1, Math.max(1, n)); C.tk.position.set(0.16, LY-0.06-Lt/2, SK.Z0+0.168);
    if(g && g.over && n<want && ((SKEE.t*14)|0)!==((SKEE.t*14-dt*14)|0)) _skSnd("tick"); }
  SKEE.acc+=dt; if(SKEE.acc>1/12){ SKEE.acc=0; _skReadout(g); }
  if(SKEE.on){ player.pos.set(C.stand.x, 0, C.stand.z); player.feetY=C.floor; player.yaw=Math.PI; player.pitch=-0.20; }
}
if(SKEE.cab){ updateSkee(0); _skReadout(null); }
