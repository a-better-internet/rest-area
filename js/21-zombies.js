"use strict";
/* REST AREA · 21-zombies.js
   zombie mode: the dead walking the whole map, and you with a gun
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   21 · ZOMBIE MODE
   A mode of its own: the start card's second button, or Z at any time (Z
   again leaves it). The world empties of the living: nobody in it but the
   dead, no traffic on the road, the birds and the dogs gone quiet. The sky
   comes down grey and the fog in close, green-grey by day and all but black
   by night, and the colour goes out of everything (a filter on the canvas,
   the gloom in 19's light by atmos, the "dread" weather held, 16b). It
   starts late in the afternoon, and the night comes on as it goes.
   THE DEAD are the townsfolk (14q's looks), green and bloodied, built on
   14b's people (buildPerson's mat, eyes and extra). They shamble with their
   arms up after you, heads lolling, some dragging a leg or an arm; they
   wander till they see you or hear a shot, then come; in reach they claw.
   Runners come later, and brutes. They come from where you have been (the
   trail of your steps, so they follow you down a stair and through the door
   you used) or out of the woods round you, never in front of your eyes. The
   longer you last the more there are and the faster they come: THREAT goes
   up a level every seventy-five seconds.
   THE GUNS: a pistol to start; a pump shotgun, a carbine and a hunting rifle
   to find. A shot is a ray along the view (with the gun's spread), stopped
   by the colliders and the ground; a head shot is worth three, and the rifle
   goes through three of them. The gun is drawn over the view in its own
   scene with its own light (19 hands it the frame): it bobs, sways, kicks,
   is racked, reloaded, lowered to change, and shoved with (V). The flash
   lights the world through 16's lamp pool (FLASH, a lamp at the gun).
   PICKUPS turn on the spot over a glow and are taken by walking into them:
   ammunition by calibre, first aid, the guns themselves. Caches at places
   you know (CACHES) come back a while after you take them; more turns up
   round you as you go; the dead drop some.
   BLOOD: a spray of drops and a mist on every hit, a pool where they fall
   (soft decals on the ground); a head shot takes the head. You take damage
   too: the edges of the screen go red, from the side it came; at nothing you
   are down. ENTER to go again, Z to leave.
   Keys in the mode: click to fire (hold it for the carbine), the right
   button to aim, 1-4 or the wheel for the guns, R to reload, V to shove.
   ---------------------------------------------------------------------- */
const ZOMBIE=(function(){
  const Z={on:false, dead:false, hp:100, t:0, kills:0, level:1, fade:0, freeze:false, ts:1, score:0};
  const MAXZ=48, MAXBUILT=60;
  const GUNS=[
    {id:"pistol",  slot:1, name:"PISTOL",        ammo:"9MM",      mag:15, dmg:34,  head:3.0, pellets:1, spread:0.012, ads:0.004,  rate:0.16, auto:false, reload:1.35, range:150, climb:0.012, kick:1.0, snd:"pistol",
     hip:[0.13,-0.145,-0.33], adsP:[0,-0.060,-0.31]},
    {id:"shotgun", slot:2, name:"PUMP SHOTGUN",  ammo:"12 GAUGE", mag:6,  dmg:16,  head:2.0, pellets:9, spread:0.065, ads:0.050,  rate:0.95, auto:false, reload:0.55, shells:true, range:60, climb:0.035, kick:2.2, snd:"shotgun",
     hip:[0.14,-0.16,-0.30], adsP:[0,-0.036,-0.30]},
    {id:"carbine", slot:3, name:"CARBINE",       ammo:"5.56",     mag:30, dmg:27,  head:2.6, pellets:1, spread:0.018, ads:0.006,  rate:0.092, auto:true, reload:2.1, range:240, climb:0.009, kick:0.8, snd:"carbine",
     hip:[0.13,-0.15,-0.28], adsP:[0,-0.058,-0.32]},
    {id:"rifle",   slot:4, name:"HUNTING RIFLE", ammo:".30-06",   mag:5,  dmg:150, head:3.0, pellets:1, pierce:3, spread:0.004, ads:0.0005, rate:1.2, auto:false, reload:2.6, range:420, climb:0.045, kick:2.6, snd:"rifle",
     hip:[0.14,-0.16,-0.30], adsP:[0,-0.075,-0.16], zoom:0.40},
  ];
  const GUN=id=>GUNS.find(g=>g.id===id);
  const AMMO_MAX={"9MM":180, "12 GAUGE":48, "5.56":240, ".30-06":30};
  const AMMO_BOX={"9MM":24, "12 GAUGE":8, "5.56":30, ".30-06":5};
  const S={have:{}, mag:{}, ammo:{}, cur:"pistol", next:null, cool:0, reloadT:0, reloading:false, switchT:0, fired:false,
           fireHeld:false, aimHeld:false, ads:0, kick:0, kickR:0, bloom:0, melee:0, meleeHit:false, sprint:0, cycle:0,
           flashT:0, dmgFlash:0, dmgDir:0, dmgDirT:0, shake:0, hitT:0, hitKill:false, bobA:0, swX:0, swY:0, rl:0,
           lastYaw:0, lastPitch:0, spawnT:6, supplyT:20, levelShown:1, deadT:0, heartT:0, groanT:4, rehideT:0, trailAt:null,
           bombs:0, throwT:0, streak:0, streakT:0, splat:0, tsT:0, horde:null, crowdT:0};
  Z.trail=[];
  const _v1=new T.Vector3(), _v2=new T.Vector3(), _v3=new T.Vector3(), _o=new T.Vector3(), _d=new T.Vector3();
  const wrapA=a=>Math.atan2(Math.sin(a), Math.cos(a));

  /* ======================================================================
     THE WORLD'S GEOMETRY, AS A SHOT OR A ZOMBIE SEES IT
     ====================================================================== */
  // a ray and a box: the distance in, or Infinity (and a box the ray starts inside is not in the way: you, sat in a chair)
  function rayAABB(ox,oy,oz, dx,dy,dz, x0,x1,y0,y1,z0,z1, tmax){
    if(ox>x0 && ox<x1 && oy>y0 && oy<y1 && oz>z0 && oz<z1) return Infinity;
    let t0=0, t1=tmax;
    const ax=(o,d,a,b)=>{ if(Math.abs(d)<1e-9){ if(o<a || o>b){ t0=Infinity; } return; }
      let ta=(a-o)/d, tb=(b-o)/d; if(ta>tb){ const q=ta; ta=tb; tb=q; } if(ta>t0) t0=ta; if(tb<t1) t1=tb; };
    ax(ox,dx,x0,x1); if(t0>t1) return Infinity; ax(oy,dy,y0,y1); if(t0>t1) return Infinity; ax(oz,dz,z0,z1);
    return t0<=t1 ? t0 : Infinity;
  }
  function rayCol(o, d, c, tmax){
    if(c.y1<=c.y0) return Infinity;                                       // (a door's block, open)
    if(c.ob){ const O=c.ob, rx=o.x-O.cx, rz=o.z-O.cz;
      return rayAABB(rx*O.c-rz*O.s, o.y, rx*O.s+rz*O.c, d.x*O.c-d.z*O.s, d.y, d.x*O.s+d.z*O.c, -O.hx, O.hx, c.y0, c.y1, -O.hz, O.hz, tmax); }
    return rayAABB(o.x,o.y,o.z, d.x,d.y,d.z, c.x0,c.x1,c.y0,c.y1,c.z0,c.z1, tmax);
  }
  const _seen=new Set();
  // where a ray first meets something solid: the colliders (not the world's edge, which is woods, not a wall) and the
  // ground, but the ground only for a ray that starts above it (under it, in a basement, the walls are what stop it)
  function rayWorld(o, d, tmax, noGround){
    let best=tmax, what=null; _seen.clear();
    const test=c=>{ if(_seen.has(c)) return; _seen.add(c); if(c.y1>=250) return; const t=rayCol(o,d,c,best); if(t<best){ best=t; what=c; } };
    for(let t=0; t<=best+4; t+=4){ const L=colsNear(o.x+d.x*t, o.z+d.z*t); for(let i=0;i<L.length;i++) test(L[i]); }
    for(let i=0;i<COL_BIG.length;i++) test(COL_BIG[i]);
    for(let i=0;i<COL_DYN.length;i++) test(COL_DYN[i]);
    if(!noGround && o.y>groundY(o.x, o.z)-0.25){
      for(let t=0.6; t<best; t+=0.6){
        if(o.y+d.y*t<groundY(o.x+d.x*t, o.z+d.z*t)){
          let a=t-0.6, b=t; for(let k=0;k<6;k++){ const m=(a+b)/2; if(o.y+d.y*m<groundY(o.x+d.x*m, o.z+d.z*m)) b=m; else a=m; }
          best=b; what="ground"; break; } } }
    return {t:best, what:what};
  }
  function clearLine(ax,ay,az, bx,by,bz){
    _o.set(ax,ay,az); _d.set(bx-ax, by-ay, bz-az); const L=_d.length(); if(L<0.01) return true; _d.multiplyScalar(1/L);
    return rayWorld(_o, _d, L, false).t>=L-0.3;
  }
  // the world's edge between two points (the walls along the woods, y up to 300): nothing comes through those
  function segBox2(ax,az,bx,bz,c){
    let ox=ax, oz=az, dx=bx-ax, dz=bz-az, x0=c.x0, x1=c.x1, z0=c.z0, z1=c.z1;
    if(c.ob){ const O=c.ob, rx=ax-O.cx, rz=az-O.cz; ox=rx*O.c-rz*O.s; oz=rx*O.s+rz*O.c; const qx=dx*O.c-dz*O.s, qz=dx*O.s+dz*O.c; dx=qx; dz=qz; x0=-O.hx; x1=O.hx; z0=-O.hz; z1=O.hz; }
    let t0=0, t1=1;
    for(const [o,dd,a,b] of [[ox,dx,x0,x1],[oz,dz,z0,z1]]){
      if(Math.abs(dd)<1e-9){ if(o<a || o>b) return false; continue; }
      let ta=(a-o)/dd, tb=(b-o)/dd; if(ta>tb){ const q=ta; ta=tb; tb=q; } t0=Math.max(t0,ta); t1=Math.min(t1,tb); if(t0>t1) return false; }
    return true;
  }
  function edgeBetween(ax,az,bx,bz){
    const L=Math.hypot(bx-ax, bz-az), n=Math.ceil(L/4)+1; _seen.clear();
    for(let k=0;k<=n;k++){ const t=k/n, C=colsNear(lerp(ax,bx,t), lerp(az,bz,t));
      for(let i=0;i<C.length;i++){ const c=C[i]; if(c.y1<250 || _seen.has(c)) continue; _seen.add(c); if(segBox2(ax,az,bx,bz,c)) return true; } }
    for(const c of COL_BIG) if(c.y1>=250 && segBox2(ax,az,bx,bz,c)) return true;
    return false;
  }
  // in the way of a zombie: what is in the way of anyone (not the people: there are none), and the lake, which they will not wade
  function zHit(x, z, y, r){
    const lo=y+0.3, hi=y+1.7;
    const t=c=>{ if(c.y1<lo || c.y0>hi) return false; if(c.ob) return obNear(c.ob,x,z,r);
      const qx=clamp(x,c.x0,c.x1), qz=clamp(z,c.z0,c.z1), dx=x-qx, dz=z-qz; return dx*dx+dz*dz<r*r; };
    const L=colsNear(x,z); for(let i=0;i<L.length;i++) if(t(L[i])) return true;
    for(let i=0;i<COL_BIG.length;i++) if(t(COL_BIG[i])) return true;
    for(let i=0;i<COL_DYN.length;i++) if(t(COL_DYN[i])) return true;
    if(x>900 && typeof EAST!=="undefined" && Terrain.lakeSD(x,z)<0.8 && y<EAST.wy+0.6) return true;
    return false;
  }
  // somewhere to stand: the floor under (x,z) near the height given, clear of everything
  function okSpot(x, z, yh){
    const y=surfaceY(x, z, (yh===undefined ? groundY(x,z) : yh)+0.6);
    if(!isFinite(y) || zHit(x, z, y, 0.42)) return null;
    return y;
  }
  function freeSpot(x, z, yh, R){
    for(let r=0; r<=(R||4); r+=0.4) for(let k=0, n=Math.max(1, Math.round(r*10)); k<n; k++){
      const a=k/n*Math.PI*2+r, cx=x+Math.sin(a)*r, cz=z+Math.cos(a)*r, y=okSpot(cx, cz, yh);
      if(y!==null && (yh===undefined || Math.abs(y-yh)<2.5)) return {x:cx, z:cz, y:y}; }
    return null;
  }

  /* ======================================================================
     THE DEAD
     ====================================================================== */
  const ZMAT=new T.MeshStandardMaterial({vertexColors:true, roughness:0.9, skinning:true});
  let LOOKS=null;
  // the people of the place, as they were: every look 14q's crowds were given, and some like 14b's visitors
  function looks(){
    if(LOOKS) return LOOKS; LOOKS=[];
    if(typeof CROWD!=="undefined") for(const G of CROWD.groups) for(const p of G.people) if(p.look && p.look.skin) LOOKS.push(p.look);
    const r=_trng(4040), pick=a=>a[(r()*a.length)|0];
    for(let k=0;k<24;k++){ const female=r()<0.45;
      LOOKS.push({female:female, h:female?0.95+r()*0.06:1.0+r()*0.07, skin:pick(SKINS), hair:pick(HAIRS), shirt:pick(SHIRTS), pants:pick(PANTS),
                  shoes:pick(["#f2f0ea","#1d1d1f","#6b4a2b","#8d9196"]), shorts:r()<0.25, long:r()<0.3, cap:r()<0.2?pick(["#b3151b","#1f3b6e","#2f5a35"]):null,
                  beard:!female && r()<0.3 ? pick(HAIRS) : null, belly:!female && r()<0.2}); }
    return LOOKS;
  }
  const mixC=(a,b,k)=>"#"+new T.Color(a||"#555555").lerp(new T.Color(b),k).getHexString();
  // the same person, dead: the skin gone green (a darker green for a darker skin), the clothes dirtied, the eyes milky
  function zombify(L, r, kind){
    const sk=new T.Color(L.skin||"#d8b090"), lum=(sk.r+sk.g+sk.b)/3;
    const G=["#7f9a5e","#6d8a53","#8ba16a","#627c4a","#76895b","#8a9a6a"];
    const o=Object.assign({}, L);
    o.skin=mixC(G[(r()*G.length)|0], "#1e2a16", clamp((0.72-lum)*0.9, 0, 0.45));
    o.shirt=mixC(L.shirt, "#3a3326", 0.42); o.pants=mixC(L.pants, "#2c281f", 0.38);
    o.hair=mixC(L.hair||"#2b1e14", "#3a3a30", 0.3); o.shoes=mixC(L.shoes||"#1d1d1e", "#241f18", 0.3);
    for(const k of ["cap","capFront","vest","beanie","pocket","beard"]) if(o[k]) o[k]=mixC(o[k], "#2a2a22", 0.4);
    o.shades=false; o.hoodUp=false; o.eyes="#e2dcaa"; o.mat=ZMAT; o.extra=zExtra(r);
    if(kind==="brute"){ o.h=1.12+r()*0.06; o.belly=true; o.female=false; }
    else o.h=(o.h||1)*(0.97+r()*0.05);
    return o;
  }
  // the blood on them: down the front from the mouth, a bite at the neck or an arm, a dark stain on a leg, the mouth open
  function zExtra(r){
    const a=[r(),r(),r(),r(),r(),r()];
    return (add, Y, h, J, sw)=>{
      const RED="#4e0805", DK="#2e0403";
      const blob=(x,y,z,sx,sy,sz,c,b)=>add(new T.SphereGeometry(0.5,10,7), _pm(x,Y(y),z, sx,sy,sz), c, b);
      // down the front from the mouth: a smear across the top of the chest, and runs off it, the longest in the middle
      const dx=(a[0]-0.5)*0.05*h;
      blob(dx, 0.47, 0.091*h, 0.075*h, 0.11*h, 0.03*h, RED, J.spine);
      blob(dx+0.012*h, 0.35, 0.093*h, 0.034*h, 0.17*h, 0.026*h, RED, J.spine);
      blob(dx-0.032*h, 0.39, 0.092*h, 0.024*h, 0.11*h, 0.024*h, DK, J.spine);
      if(a[1]<0.7){ blob((a[1]-0.35)*0.2*h, 0.18, 0.094*h, 0.06*h, 0.045*h, 0.026*h, DK, J.spine);
                    blob((a[1]-0.33)*0.2*h, 0.13, 0.094*h, 0.022*h, 0.06*h, 0.024*h, DK, J.spine); }
      add(new T.BoxGeometry(0.052*h, 0.026*h, 0.022*h), _pm(0, Y(0.693), 0.097*h), "#160302", J.head);
      blob(0, 0.672, 0.090*h, 0.055*h, 0.045*h, 0.03*h, RED, J.head);
      if(a[2]<0.5) blob(sw*0.55, 0.60, 0.05*h, 0.065*h, 0.055*h, 0.06*h, DK, J.spine);
      else { const s=a[3]<0.5?-1:1; blob(s*sw, 0.15, 0.036*h, 0.055*h, 0.075*h, 0.05*h, RED, s<0?J.elL:J.elR); }
      if(a[4]<0.55){ const s=a[5]<0.5?-1:1; blob(s*0.095*h, -0.26, 0.064*h, 0.075*h, 0.13*h, 0.03*h, DK, s<0?J.hpL:J.hpR); }
    };
  }
  const ZS=[]; let _zseed=7001;
  function buildZombie(kind){
    const r=_trng(_zseed++), L=looks(), base=L[(r()*L.length)|0];
    const P=buildPerson(zombify(base, r, kind)); P.seed=r()*10; P.g.rotation.order="YXZ"; P.g.visible=false;
    return {P:P, kind:kind, h:P.h, live:false, limp:r()<0.35, limpArm:r()<0.22, tilt:(r()-0.5)*0.6};
  }
  const KIND={walker:{hp:100, sp:[0.95,1.35], turn:2.3, dmg:[11,17], reach:1.15},
              runner:{hp:70,  sp:[3.7,4.5],   turn:5.0, dmg:[8,12],  reach:1.1},
              brute: {hp:320, sp:[0.85,1.05], turn:1.6, dmg:[26,34], reach:1.5}};
  function spawnZombie(x, z, y, kind, yaw){
    let zb=ZS.find(q=>!q.live && q.kind===kind);
    if(!zb && ZS.length<MAXBUILT){ zb=buildZombie(kind); ZS.push(zb); }
    if(!zb) zb=ZS.find(q=>!q.live);
    if(!zb) return null;
    const K=KIND[zb.kind];
    Object.assign(zb, {live:true, state:"alive", x:x, z:z, y:y, yaw:yaw===undefined ? Math.random()*Math.PI*2 : yaw, hp:K.hp*(1+Z.level*0.03),
      speed:(K.sp[0]+Math.random()*(K.sp[1]-K.sp[0]))*(1+Math.min(0.3, Z.level*0.025)), alert:false, ph:Math.random(), t:Math.random()*10,
      atk:0, hit:false, cd:0, hitT:0, losT:Math.random()*0.4, los:false, ti:-1, tiT:0, wT:0, wA:0, wS:0, stuck:0, side:0, kx:0, kz:0,
      dieT:0, fall:-1, roll:0, pooled:false, corpseT:0, groanT:2+Math.random()*8, down:null, fly:null, flung:false, tumble:0});
    const P=zb.P; P.B[P.j.head].scale.set(1,1,1); P.g.rotation.set(0, zb.yaw, 0); P.g.position.set(x, y, z); P.g.visible=true;
    return zb;
  }
  function recycle(zb){ zb.live=false; zb.P.g.visible=false; }
  const alive=()=>ZS.filter(q=>q.live && q.state!=="dead");
  // a handful to start (six at the first level), three more at every level after, coming quicker
  const wantAlive=()=>Math.min(MAXZ, 3+Z.level*3);
  const spawnEvery=()=>Math.max(0.8, 6-Z.level*0.45);
  function pickKind(){ const L=Z.level, r=Math.random(), pb=L<5?0:Math.min(0.10, 0.025*(L-4)),
      pr=(L<3?0:Math.min(0.32, 0.07*(L-2)))+(L>=2 && DayNight.state.dark>0.6 ? 0.08 : 0);       // (and at night they come running sooner)
    return r<pb ? "brute" : r<pb+pr ? "runner" : "walker"; }
  // where the next one comes from: back along the way you came, or out of the woods round you; never in front of your eyes,
  // never the far side of the world's edge from you, never in the lake
  function spawnPoint(){
    const px=player.pos.x, pz=player.pos.z, py=player.feetY;
    camera.getWorldDirection(_v1); const fl=Math.hypot(_v1.x,_v1.z)||1, fx=_v1.x/fl, fz=_v1.z/fl;
    for(let k=0;k<16;k++){
      let x, z, yh=py;
      if(Z.trail.length>8 && k%2===0){
        const q=Z.trail[(Math.random()*Z.trail.length)|0], d=Math.hypot(q[0]-px, q[2]-pz);
        if(d<22 || d>80) continue;
        x=q[0]+(Math.random()-0.5)*2; z=q[2]+(Math.random()-0.5)*2; yh=q[1];
      }else{ const a=Math.random()*Math.PI*2, r=26+Math.random()*38; x=px+Math.sin(a)*r; z=pz+Math.cos(a)*r; }
      const dx=x-px, dz=z-pz, d=Math.hypot(dx,dz);
      if((dx*fx+dz*fz)/d>0.4 && k<12) continue;
      const y=okSpot(x, z, yh); if(y===null || Math.abs(y-py)>14) continue;
      if(edgeBetween(px, pz, x, z)) continue;
      return {x:x, z:z, y:y};
    }
    return null;
  }
  // the newest point of your trail it can see from where it is, to follow on from (the way you went, door and all)
  function findTrail(zb){
    const T_=Z.trail, cand=[];
    for(let i=T_.length-1;i>=0 && cand.length<40;i--){ const q=T_[i], d=Math.hypot(q[0]-zb.x, q[2]-zb.z); if(d<26 && Math.abs(q[1]-zb.y)<4) cand.push([i,d]); }
    cand.sort((a,b)=>b[0]-a[0]);
    let tests=0;
    for(const [i] of cand){ if(tests++>5) break; const q=T_[i]; if(clearLine(zb.x, zb.y+1.2, zb.z, q[0], q[1]+1.2, q[2])) return i; }
    return -1;
  }
  // thrown back by a hit: slid along, never into anything
  function knock(zb, dt){
    if(Math.abs(zb.kx)+Math.abs(zb.kz)<=0.002) return;
    const nx=zb.x+zb.kx*dt*6, nz=zb.z+zb.kz*dt*6;
    if(!zHit(nx, nz, zb.y, 0.28)){ zb.x=nx; zb.z=nz; } const f=Math.max(0, 1-dt*6); zb.kx*=f; zb.kz*=f;
  }
  // a pipe bomb beeping within thirty metres: they go to it, and leave you be
  function lureFor(zb){ for(const b of BOMBS) if(b.live && Math.abs(b.y-zb.y)<5 && Math.hypot(b.x-zb.x, b.z-zb.z)<30) return b; return null; }
  function stepZombie(zb, dt){
    zb.t+=dt; zb.cd=Math.max(0, zb.cd-dt); zb.hitT=Math.max(0, zb.hitT-dt);
    // on the ground, knocked flat: slid along by the blow, and up again after a while
    if(zb.down){ zb.down.t+=dt; knock(zb, dt); if(zb.down.t>=zb.down.dur){ zb.down=null; zb.alert=true; } return false; }
    const lure=lureFor(zb); if(lure) zb.alert=true;
    const K=KIND[zb.kind], px=player.pos.x, pz=player.pos.z, py=player.feetY;
    const dx=px-zb.x, dz=pz-zb.z, d=Math.hypot(dx,dz), dy=py-zb.y;
    const inCar=!!driving, onBoat=typeof BOAT!=="undefined" && BOAT.on;
    if(!zb.alert && !Z.dead){ const sense=10+Z.level*2.2+(zb.kind==="runner"?8:0);
      if(d<sense && Math.abs(dy)<4){ zb.alert=true; if(zb.kind==="runner") snd.shriek(zb.x, zb.z); } }
    // reach and claw: the arms go up and come down; if you are still there when they do, it lands
    const reach=K.reach+(inCar?1.2:0);
    if(zb.atk>0){
      zb.atk+=dt/0.85;
      if(zb.atk>=0.52 && !zb.hit){ zb.hit=true;
        if(d<reach+0.5 && Math.abs(dy)<1.4 && !Z.dead && !onBoat){
          const n=K.dmg[0]+Math.random()*(K.dmg[1]-K.dmg[0]); hurtPlayer(inCar ? n*0.4 : n, zb.x, zb.z); } }
      if(zb.atk>=1){ zb.atk=0; zb.cd=0.9+Math.random()*0.5; }
    }else if(zb.alert && !Z.dead && !onBoat && d<reach && Math.abs(dy)<1.4 && zb.cd<=0){ zb.atk=0.001; zb.hit=false; snd.snarl(zb.x, zb.z, zb.kind); }
    let tx=zb.x, tz=zb.z, speed=0;
    if(zb.atk>0){ tx=px; tz=pz; speed=0; }
    else if(lure){ tx=lure.x; tz=lure.z; speed=Math.hypot(lure.x-zb.x, lure.z-zb.z)<0.9 ? 0 : zb.speed; }
    else if(zb.alert && !Z.dead){
      zb.losT-=dt;
      if(zb.losT<=0){ zb.losT=0.35+Math.random()*0.35; zb.los=d<40 && clearLine(zb.x, zb.y+1.5, zb.z, px, py+1.4, pz); if(zb.los) zb.ti=-1; }
      if(zb.los || d<2.5){ tx=px; tz=pz; }
      else{
        zb.tiT-=dt;
        if(zb.ti<0 && zb.tiT<=0){ zb.ti=findTrail(zb); zb.tiT=1.5; }
        if(zb.ti>=0 && zb.ti<Z.trail.length){ const q=Z.trail[zb.ti]; tx=q[0]; tz=q[2]; if(Math.hypot(tx-zb.x, tz-zb.z)<1.3) zb.ti=Math.min(Z.trail.length-1, zb.ti+1); }
        else { tx=px; tz=pz; }
      }
      speed=d<reach*0.9 ? 0 : zb.speed*(zb.hitT>0 ? 0.25 : 1);
    }else{
      zb.wT-=dt; if(zb.wT<=0){ zb.wA=zb.yaw+(Math.random()-0.5)*2.4; zb.wT=3+Math.random()*5; zb.wS=Math.random()<0.35 ? 0 : 0.32; }
      tx=zb.x+Math.sin(zb.wA)*5; tz=zb.z+Math.cos(zb.wA)*5; speed=zb.wS;
    }
    let moving=false;
    let want=Math.atan2(tx-zb.x, tz-zb.z);
    if(speed>0){
      // a stride ahead: if that is blocked, bend the line a little at a time, the side already taken first
      const look=0.7, free=a=>!zHit(zb.x+Math.sin(a)*look, zb.z+Math.cos(a)*look, zb.y, 0.3);
      if(!free(want)){ let found=false;
        for(let k=1;k<=6 && !found;k++) for(const s of [zb.side||1, -(zb.side||1)]){ const a=want+s*k*0.3; if(free(a)){ want=a; zb.side=s; found=true; break; } }
        if(!found){ speed=0; zb.stuck+=dt; } }
      else if(zb.side && Math.random()<dt*0.3) zb.side=0;
    }
    zb.yaw+=clamp(wrapA(want-zb.yaw), -K.turn*dt, K.turn*dt);
    if(speed>0){
      const step=speed*dt, nx=zb.x+Math.sin(zb.yaw)*step, nz=zb.z+Math.cos(zb.yaw)*step;
      if(!zHit(nx, nz, zb.y, 0.28)){ const ny=surfaceY(nx, nz, zb.y+0.45);
        if(ny-zb.y<0.5 && zb.y-ny<3.5){ zb.x=nx; zb.z=nz; moving=true; zb.stuck=Math.max(0, zb.stuck-dt); } else zb.stuck+=dt; }
      else zb.stuck+=dt;
      zb.ph=(zb.ph+step/(zb.kind==="runner" ? 1.9 : 1.2))%1;
    }
    if(zb.stuck>2.5){ zb.stuck=0; zb.side=-(zb.side||1); zb.ti=-1; zb.tiT=0; }
    knock(zb, dt);
    const gy=surfaceY(zb.x, zb.z, zb.y+0.45); zb.y+=(gy-zb.y)*Math.min(1, dt*(gy>zb.y ? 12 : 8));
    // and now and then a groan
    zb.groanT-=dt; if(zb.groanT<=0){ zb.groanT=(zb.alert?3:6)+Math.random()*8; if(d<45) snd.groan(zb.x, zb.z, zb.kind); }
    return moving;
  }
  function poseZombie(zb, moving){
    const P=zb.P, B=P.B, J=P.j, t=zb.t, sd=P.seed;
    if(zb.state==="dead" || zb.down){
      // flat on the ground: falling over (or thrown and tumbling), and a knocked-down one getting up again, arms going
      let e, fall=zb.fall;
      if(zb.down){ const D=zb.down, u=D.t; fall=D.fall; e=u<0.4 ? (u/0.4)*(u/0.4) : u>D.dur-0.7 ? smoothstep(0, 1, (D.dur-u)/0.7) : 1; }
      else { const k=Math.min(1, zb.dieT/0.75); e=k*k; }
      poseP(P, "stand", 0, t);
      const fl=zb.down ? Math.sin(t*9)*0.5 : 0;
      B[J.shL].rotation.set(-0.4*e+fl, 0, -0.9*e); B[J.shR].rotation.set(-0.3*e-fl, 0, 0.9*e);
      B[J.knL].rotation.x=0.5*(1-e)+0.15+(zb.down ? Math.max(0, fl) : 0); B[J.knR].rotation.x=0.3*(1-e)+0.25; B[J.head].rotation.set(0, 0.4*e*(zb.roll>0?1:-1), 0);
      if(zb.flung && zb.fq){ P.g.quaternion.copy(zb.fq); P.g.position.copy(zb.fpos); P.g.position.y-=zb.sink||0; return; }
      P.g.rotation.set(fall*e*Math.PI*0.49, zb.yaw, zb.roll*e);
      P.g.position.set(zb.x, zb.y+0.10*e-(zb.sink||0), zb.z);
      return;
    }
    poseP(P, moving ? "walk" : "stand", zb.ph, t);
    if(zb.kind==="runner" && moving && zb.speed>2){
      const s=Math.sin(zb.ph*Math.PI*2);
      B[J.shL].rotation.x=s*1.0-0.5; B[J.shR].rotation.x=-s*1.0-0.5; B[J.elL].rotation.x=B[J.elR].rotation.x=-1.2;
      B[J.spine].rotation.x=0.42; B[J.head].rotation.x=-0.2; B[J.head].rotation.z=zb.tilt*0.5;
      B[J.hpL].rotation.x*=1.5; B[J.hpR].rotation.x*=1.5; B[J.knL].rotation.x*=1.4; B[J.knR].rotation.x*=1.4;
    }else{
      const lift=zb.alert ? 1 : 0.6;
      B[J.shL].rotation.x=(-1.32+Math.sin(t*1.3+sd)*0.12)*lift; B[J.shL].rotation.z=-0.14;
      if(zb.limpArm){ B[J.shR].rotation.set(0.06+Math.sin(t*2.1+sd)*0.05, 0, 0.1); B[J.elR].rotation.x=-0.05; }
      else { B[J.shR].rotation.x=(-1.22+Math.sin(t*1.1+sd*2)*0.14)*lift; B[J.shR].rotation.z=0.14; B[J.elR].rotation.x=-0.3; }
      B[J.elL].rotation.x=-0.22;
      B[J.spine].rotation.x+=0.24; B[J.spine].rotation.z=Math.sin(t*0.9+sd)*0.07;
      B[J.head].rotation.set(0.22, Math.sin(t*0.5+sd*3)*0.25, zb.tilt+Math.sin(t*0.7+sd)*0.06);
      if(((t*0.31+sd)%1)<0.05) B[J.head].rotation.y+=Math.sin(t*55)*0.22;                   // a twitch
      if(moving && zb.limp){ B[J.hpR].rotation.x*=0.45; B[J.knR].rotation.x=0.1; B[J.root].position.y-=Math.abs(Math.sin(zb.ph*Math.PI*2))*0.035; }
    }
    if(zb.atk>0){ const a=zb.atk, up=smoothstep(0,0.4,a)*(1-smoothstep(0.45,0.7,a)), sw=smoothstep(0.42,0.6,a)*(1-smoothstep(0.8,1,a));
      B[J.shL].rotation.x=B[J.shR].rotation.x=-1.3-up*1.0+sw*1.0; B[J.elL].rotation.x=B[J.elR].rotation.x=-0.2-up*0.6;
      B[J.spine].rotation.x=0.2+sw*0.35; B[J.head].rotation.x=0.1+sw*0.3; }
    if(zb.hitT>0){ B[J.spine].rotation.x-=zb.hitT*1.5; B[J.head].rotation.x-=zb.hitT*1.3; }
    P.g.rotation.set(0, zb.yaw, 0); P.g.position.set(zb.x, zb.y, zb.z);
  }

  /* ======================================================================
     HITS, DEATHS, AND YOU
     ====================================================================== */
  function raySphere(o, d, cx, cy, cz, r){
    const ox=o.x-cx, oy=o.y-cy, oz=o.z-cz, b=ox*d.x+oy*d.y+oz*d.z, c=ox*ox+oy*oy+oz*oz-r*r, D=b*b-c;
    if(D<0) return Infinity; const t=-b-Math.sqrt(D); return t>0 ? t : Infinity;
  }
  function rayCyl(o, d, cx, cz, r, y0, y1){
    const ox=o.x-cx, oz=o.z-cz, a=d.x*d.x+d.z*d.z; if(a<1e-9) return Infinity;
    const b=ox*d.x+oz*d.z, c=ox*ox+oz*oz-r*r, D=b*b-a*c; if(D<0) return Infinity;
    for(const t of [(-b-Math.sqrt(D))/a, (-b+Math.sqrt(D))/a]){ if(t<=0) continue; const y=o.y+d.y*t; if(y>=y0 && y<=y1) return t; }
    return Infinity;
  }
  function rayZombie(o, d, zb, tmax){
    const h=zb.h, fx=Math.sin(zb.yaw), fz=Math.cos(zb.yaw);
    if(zb.down){ const f=zb.down.fall*0.8*h, t=raySphere(o, d, zb.x+fx*f, zb.y+0.25, zb.z+fz*f, 0.5); return t<tmax ? {t:t, head:false} : null; }
    const th=zb.P.B[zb.P.j.head].scale.x>0.5 ? raySphere(o, d, zb.x+fx*0.13*h, zb.y+1.57*h, zb.z+fz*0.13*h, 0.15*h) : Infinity;
    const tb=rayCyl(o, d, zb.x+fx*0.06, zb.z+fz*0.06, 0.25*h, zb.y+0.05, zb.y+1.42*h);
    if(Math.min(th, tb)>=tmax) return null;
    return th<tb ? {t:th, head:true} : {t:tb, head:false};
  }
  function hurtZombie(zb, dmg, head, at, dir){
    if(zb.state==="dead") return;
    zb.hp-=dmg; zb.alert=true; zb.hitT=Math.min(0.3, 0.12+dmg/400); zb.atk=0; zb.cd=Math.max(zb.cd, 0.25);
    const kb=zb.down ? 0 : Math.min(0.45, dmg/110)*(zb.kind==="brute" ? 0.3 : 1); zb.kx+=dir.x*kb; zb.kz+=dir.z*kb;
    blood.burst(at, dir, head ? 22 : 12, head ? 1.4 : 1);
    snd.flesh(at.x, at.z);
    if(zb.hp<=0) killZombie(zb, head, dir);
  }
  function killZombie(zb, head, dir, how){
    const wasDown=!!zb.down;
    zb.state="dead"; zb.dieT=0; zb.atk=0; zb.corpseT=0; zb.sink=0;
    zb.fall=wasDown ? zb.down.fall : (Math.sin(zb.yaw)*dir.x+Math.cos(zb.yaw)*dir.z)>0 ? 1 : -1;
    if(wasDown) zb.dieT=0.75; zb.down=null;
    zb.roll=(Math.random()-0.5)*0.5;
    // thrown: by a car or a blast, up and over, end over end, the way it was hit
    if(how && how.fly){ const F=zb.fly=how.fly; zb.flung=true; zb.dieT=0; F.hc=0.95*zb.h; F.x=zb.x; F.y=zb.y+F.hc; F.z=zb.z; F.yaw=zb.yaw;
      if(!zb.fq){ zb.fq=new T.Quaternion(); zb.fpos=new T.Vector3(); } flingPose(zb); } else zb.flung=false;
    addScore(zb, head, how);
    if(head){ zb.P.B[zb.P.j.head].scale.setScalar(0.001);
      _v3.set(zb.x, zb.y+1.6*zb.h, zb.z); blood.burst(_v3, dir, 46, 2.2); blood.mist(_v3, 1.6); }
    Z.kills++; S.hitKill=true; snd.die(zb.x, zb.z);
    // what they had on them
    const r=Math.random(), owned=GUNS.filter(g=>S.have[g.id]);
    if(r<0.18){ const g=owned[(Math.random()*owned.length)|0]; dropPickup("ammo:"+g.ammo, zb.x, zb.z, zb.y); }
    else if(r<0.24) dropPickup("health", zb.x, zb.z, zb.y);
  }
  /* ---- thrown ----
     What a car or a blast does to a body: it goes the way it was sent, turning about a level axis across that way, the
     legs swept out from under it and the head going back toward what hit it, about half a turn to a turn and a half
     over the whole flight by how hard it was hit, and a little twist about its own length if it was struck off-centre.
     It turns about its middle, not its feet. It lands, maybe bounces once, and slides to a stop on its back or its
     face. (ux, uz) the way, hs and vy how fast along it and up, k 0..1 how hard, tw the twist.) */
  function fling(ux, uz, hs, vy, k, tw){
    // it comes down near flat: a quarter turn hit slowly, three quarters at road speed, now and then one and a quarter
    const T_=(vy+Math.sqrt(vy*vy+2*9.8*0.8))/9.8, m=clamp(Math.round(k*1.5+Math.random()*0.7-0.35), 0, 2),
          turns=0.25+0.5*m+(Math.random()-0.5)*0.12;
    return {vx:ux*hs, vy:vy, vz:uz*hs, ax:uz, az:-ux, ang:0, w:-turns*Math.PI*2/T_, wy:tw||0, b:0, slide:false, tgt:0};
  }
  const _fqT=new T.Quaternion(), _fqY=new T.Quaternion(), _fAx=new T.Vector3(), _fUp=new T.Vector3(0,1,0);
  function flingPose(zb){
    const F=zb.fly; _fAx.set(F.ax, 0, F.az);
    zb.fq.copy(_fqT.setFromAxisAngle(_fAx, F.ang)).multiply(_fqY.setFromAxisAngle(_fUp, F.yaw));
    zb.fpos.set(0, F.hc, 0).applyQuaternion(zb.fq); zb.fpos.set(F.x-zb.fpos.x, F.y-zb.fpos.y, F.z-zb.fpos.z);
  }
  // how high its middle sits over the ground at this angle: on its feet 0.95 of its height, lying 0.14
  const _lie=(F)=>Math.max(0.14, 0.88*F.hc*Math.abs(Math.cos(F.ang)));
  function flyStep(zb, dt){
    const F=zb.fly;
    if(!F.slide){
      F.vy-=9.8*dt; F.ang+=F.w*dt; F.yaw+=F.wy*dt;
      const nx=F.x+F.vx*dt, nz=F.z+F.vz*dt;
      if(!zHit(nx, nz, F.y-0.5, 0.25)){ F.x=nx; F.z=nz; } else { F.vx*=-0.25; F.vz*=-0.25; }
      F.y+=F.vy*dt;
      const g=surfaceY(F.x, F.z, F.y), lo=g+_lie(F);
      if(F.y<=lo && F.vy<0){ F.y=lo; snd.thud(); _v3.set(F.x, g+0.1, F.z); blood.mist(_v3, 0.8);
        if(F.vy<-3.2 && F.b<1){ F.vy*=-0.22; F.vx*=0.62; F.vz*=0.62; F.w*=0.35; F.wy*=0.5; F.b++; }
        else { F.slide=true; F.vy=0;
          // flat on its back or its face: the next way flat it was turning toward, or back to the one it has only just passed
          const q=Math.PI/2, lo=q*(2*Math.floor((F.ang/q-1)/2)+1), hi=lo+2*q;
          F.tgt=F.w<=0 ? (hi-F.ang<0.9 ? hi : lo) : (F.ang-lo<0.9 ? lo : hi); F.vx*=0.8; F.vz*=0.8;
          blood.decal(F.x, F.z, g, 0.5+Math.random()*0.3); } }
    }else{
      // on the ground: it slides and slows, and comes down flat on its back or its face
      const sp=Math.hypot(F.vx, F.vz), ns=Math.max(0, sp-7.5*dt), f=sp>0 ? ns/sp : 0; F.vx*=f; F.vz*=f;
      const nx=F.x+F.vx*dt, nz=F.z+F.vz*dt; if(!zHit(nx, nz, F.y-0.1, 0.25)){ F.x=nx; F.z=nz; } else { F.vx=F.vz=0; }
      F.ang+=(F.tgt-F.ang)*Math.min(1, dt*7); F.yaw+=F.wy*dt; F.wy*=Math.max(0, 1-dt*4);
      F.y=surfaceY(F.x, F.z, F.y+0.3)+_lie(F);
      if(ns<0.05 && Math.abs(F.tgt-F.ang)<0.02){ F.ang=F.tgt; flingPose(zb); zb.x=F.x; zb.z=F.z; zb.y=F.y-_lie(F);
        zb.fly=null; zb.dieT=0.76; zb.pooled=false; return; }
    }
    zb.x=F.x; zb.z=F.z; zb.dieT+=dt; flingPose(zb);
  }
  /* ---- a car and the dead ----
     Fast, it goes through them: each one struck is thrown, tumbling, the way the car was going, and the car loses a little
     (a brute a lot); the moment holds still for a beat, the view jolts, the screen takes the blood. Slower, under a jog, it
     knocks them flat and they get up again. Slower still they are in the way: every one against the car drags at it, and
     enough of them stop it dead, clawing at the doors. */
  function carVsDead(dt, L){
    const b=driving.veh.body, c=b.position, yaw=carYaw(b.quaternion), fx=Math.sin(yaw), fz=Math.cos(yaw);
    const vx=b.velocity.x, vz=b.velocity.z, sp=Math.hypot(vx, vz), vf=vx*fx+vz*fz;
    let n=0, hit=0;
    for(const zb of L){
      if(zb.state==="dead" || zb.down) continue;
      const dx=zb.x-c.x, dz=zb.z-c.z; if(Math.abs(zb.y-(c.y-0.6))>2) continue;
      const lz=dx*fx+dz*fz, lx=dx*fz-dz*fx;
      if(Math.abs(lx)>1.32 || Math.abs(lz)>2.55) continue;
      const ahead=sp<0.3 || (lz>=0)===(vf>=0);
      if(sp>=5.5 && ahead){
        _v2.set(vx/sp, 0, vz/sp); _v3.set(zb.x, zb.y+1.0, zb.z);
        blood.burst(_v3, _v2, 30, 1.9); blood.mist(_v3, 1.5); snd.flesh(zb.x, zb.z);
        { const k=clamp((sp-5.5)/16, 0, 1), side=(Math.random()-0.5)*0.22+lx*0.06, ux=vx/sp+fz*side, uz=vz/sp-fx*side, ul=Math.hypot(ux, uz);
          killZombie(zb, false, _v2, {bonus:5, fly:fling(ux/ul, uz/ul, sp*(0.72+Math.random()*0.16), 1.1+sp*0.13, k, -lx*0.9+(Math.random()-0.5)*0.6)}); }
        const slow=zb.kind==="brute" ? 0.24 : 0.07; b.velocity.x*=1-slow; b.velocity.z*=1-slow; hit++;
      }else if(sp>=2.2 && ahead){
        _v2.set(vx/sp, 0, vz/sp); _v3.set(zb.x, zb.y+1.0, zb.z);
        const fall=(Math.sin(zb.yaw)*vx+Math.cos(zb.yaw)*vz)>0 ? 1 : -1;
        hurtZombie(zb, 30+sp*4, false, _v3, _v2);
        if(zb.state!=="dead"){ zb.down={t:0, dur:2.0+Math.random()*1.4, fall:fall}; zb.atk=0;
          const side=lx>=0 ? 1 : -1; zb.kx+=fz*side*0.9+vx*0.12; zb.kz+=-fx*side*0.9+vz*0.12; }
        b.velocity.x*=0.93; b.velocity.z*=0.93; S.shake=Math.min(1, S.shake+0.3); snd.thud();
      }else{ n+=zb.kind==="brute" ? 3 : 1;
        if(sp>0.3){ const side=lx>=0 ? 1 : -1; zb.kx+=fz*side*0.06; zb.kz+=-fx*side*0.06; } }   // (shoved along by the bumper)
    }
    if(hit){ Z.ts=0.15; S.tsT=0.08; S.shake=Math.min(1, S.shake+0.5+0.15*hit); S.splat=Math.min(1, S.splat+0.55); snd.crunch(); }
    if(n>0 && sp<5.5){ const k=Math.exp(-dt*(0.75*n+(n>=4 ? 7 : 0))); b.velocity.x*=k; b.velocity.z*=k; S.crowdT=0.4; }
  }

  /* ---- points: by what it was, more for the head, and a streak of kills close together multiplies them ---- */
  function addScore(zb, head, how){
    const base=({walker:10, runner:20, brute:60}[zb.kind]||10)*(head ? 1.5 : 1)+((how && how.bonus)||0);
    S.streak=S.streakT>0 ? S.streak+1 : 1; S.streakT=2.8;
    const mult=Math.min(5, 1+Math.floor((S.streak-1)/3));
    Z.score+=Math.round(base*mult);
    if(mult>1 && (S.streak-1)%3===0) feed("STREAK  ×"+mult, "#e8c860");
  }

  /* ---- pipe bombs: F throws one. It beeps faster and faster for three and a half seconds, a red light winking, and every
     one of them within thirty metres goes to it instead of you; then it goes off. ---- */
  const BOMBS=[];
  let _bombGeo=null, _bombMat=null, _bombLight=null;
  function throwBomb(){
    if(Z.dead || S.throwT>0 || driving || player.ladder) return;                  // (not from behind the wheel, or off a ladder)
    if(S.bombs<=0){ feed("NO PIPE BOMBS", "#8a8a7a"); return; }
    S.bombs--; S.throwT=0.45;
    if(!_bombGeo){ _bombGeo=new T.CylinderGeometry(0.035, 0.035, 0.22, 10); _bombMat=new T.MeshStandardMaterial({color:0x5a5e60, metalness:0.4, roughness:0.5});
      _bombLight=new T.MeshBasicMaterial({color:0xff2010}); }
    const g=new T.Group(); g.add(new T.Mesh(_bombGeo, _bombMat));
    for(const y of [-0.115, 0.115]) part(g, new T.CylinderGeometry(0.042, 0.042, 0.03, 10), _bombMat, 0, y, 0);
    part(g, new T.BoxGeometry(0.074, 0.06, 0.074), new T.MeshStandardMaterial({color:0x6a6a2a, roughness:0.9}), 0, 0.02, 0);
    const lt=new T.Mesh(new T.SphereGeometry(0.014, 8, 6), _bombLight); lt.position.set(0.04, 0.02, 0); g.add(lt);
    scene.add(g);
    camera.getWorldDirection(_v1);
    const b={g:g, lt:lt, x:camera.position.x+_v1.x*0.5, y:camera.position.y+_v1.y*0.5-0.1, z:camera.position.z+_v1.z*0.5,
             vx:_v1.x*13, vy:_v1.y*13+3.2, vz:_v1.z*13, t:0, fuse:3.5, beepT:0, live:true, rest:false, spin:6};
    BOMBS.push(b); snd.swish();
  }
  function updateBombs(dt){
    S.throwT=Math.max(0, S.throwT-dt);
    for(let i=BOMBS.length-1;i>=0;i--){ const b=BOMBS[i];
      b.t+=dt;
      if(!b.rest){
        b.vy-=9.8*dt; const nx=b.x+b.vx*dt, nz=b.z+b.vz*dt, ny=b.y+b.vy*dt;
        if(zHit(nx, nz, ny-1.0, 0.08)){ b.vx*=-0.35; b.vz*=-0.35; } else { b.x=nx; b.z=nz; }
        b.y=ny; const g=surfaceY(b.x, b.z, b.y+0.3)+0.04;
        if(b.y<g){ b.y=g; if(b.vy<-1.5){ b.vy*=-0.32; b.vx*=0.55; b.vz*=0.55; snd.tink(b.x, b.z); } else { b.vy=0; b.vx*=0.5; b.vz*=0.5; if(Math.hypot(b.vx, b.vz)<0.4) b.rest=true; } }
        b.g.rotation.x+=b.spin*dt; b.spin*=b.rest ? 0 : 0.995; }
      b.g.position.set(b.x, b.y, b.z);
      // the beep, closer and closer together, and the light with it
      const per=Math.max(0.09, 0.55*(1-b.t/b.fuse)); b.beepT-=dt;
      if(b.beepT<=0){ b.beepT=per; snd.beep(b.x, b.z); b.flashT=0.06; }
      b.flashT=(b.flashT||0)-dt; b.lt.visible=b.flashT>0;
      if(b.t>=b.fuse){ explode(b); scene.remove(b.g); BOMBS.splice(i,1); }
    }
  }
  const BOOM={x:0, y:0, z:0, color:0xffa040, intensity:9, dist:45, decay:1.2, fire:true, mod:{v:0}, under:false};
  LAMPS.push(BOOM);
  function explode(b){
    b.live=false;
    const R=7.5, at=new T.Vector3(b.x, b.y+0.5, b.z);
    for(const zb of ZS){ if(!zb.live || zb.state==="dead") continue;
      const dx=zb.x-b.x, dz=zb.z-b.z, d=Math.hypot(dx, dz, (zb.y+0.9)-b.y); if(d>R) continue;
      const k=1-d/R, ux=d>0.01 ? dx/Math.hypot(dx,dz) : 1, uz=d>0.01 ? dz/Math.hypot(dx,dz) : 0, dmg=40+320*k;
      _v2.set(ux, 0, uz); _v1.set(zb.x, zb.y+1.0, zb.z);
      if(dmg>=zb.hp){ blood.burst(_v1, _v2, 26, 2.0); blood.mist(_v1, 1.6);
        killZombie(zb, false, _v2, {bonus:5, fly:fling(ux, uz, 2.5+8*k, 3.2+5*k, k, (Math.random()-0.5)*2.5)}); }
      else { hurtZombie(zb, dmg, false, _v1, _v2); if(zb.state!=="dead"){ zb.down={t:0, dur:2.2+Math.random(), fall:(Math.sin(zb.yaw)*ux+Math.cos(zb.yaw)*uz)>0 ? 1 : -1}; zb.kx+=ux*1.4; zb.kz+=uz*1.4; } }
    }
    // you, if you are too close
    const pd=Math.hypot(player.pos.x-b.x, player.pos.z-b.z, (player.feetY+0.9)-b.y);
    if(pd<6.5) hurtPlayer(75*(1-pd/6.5), b.x, b.z);
    S.shake=Math.min(1, S.shake+Math.max(0, 1.2*(1-pd/45)));
    for(let k=0;k<5;k++){ _v1.set(b.x+(Math.random()-0.5)*2.5, b.y+Math.random()*1.5, b.z+(Math.random()-0.5)*2.5); dust.puff(_v1, true); }
    fx.fire(at); fx.boomSmoke(at); BOOM.x=b.x; BOOM.y=b.y+1.5; BOOM.z=b.z; BOOM.under=buriedAt(b.x, b.z, b.y+0.5); BOOM.mod.v=1;
    blood.scorch(b.x, b.z, surfaceY(b.x, b.z, b.y+0.3));
    snd.boom(b.x, b.z);
    for(const zb of ZS) if(zb.live && zb.state!=="dead" && Math.hypot(zb.x-b.x, zb.z-b.z)<90) zb.alert=true;
    if(pd<4) S.splat=Math.min(1, S.splat+0.5);
  }

  /* ---- a horde: at each new threat level from the second, a pack of them all from one way, with warning ---- */
  function compass(a){ const h=Math.atan2(Math.sin(a), -Math.cos(a)), k=Math.round(((h+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8;
    return ["NORTH","NORTH-EAST","EAST","SOUTH-EAST","SOUTH","SOUTH-WEST","WEST","NORTH-WEST"][k]; }
  function startHorde(lv){
    const a=Math.random()*Math.PI*2; S.horde={a:a, n:4+lv*2, t:2.5, tries:0};
    banner("A HORDE", "COMING FROM THE "+compass(a)); snd.horde(a);
  }
  function updateHorde(dt){
    const H=S.horde; if(!H || Z.dead) return;
    H.t-=dt; if(H.t>0) return; H.t=0.45;
    const px=player.pos.x, pz=player.pos.z, py=player.feetY;
    for(let k=0;k<8;k++){ const a=H.a+(Math.random()-0.5)*0.9, r=42+Math.random()*22, x=px+Math.sin(a)*r, z=pz+Math.cos(a)*r, y=okSpot(x, z, py);
      if(y===null || Math.abs(y-py)>8 || edgeBetween(px, pz, x, z)) continue;
      const zb=spawnZombie(x, z, y, pickKind(), a+Math.PI); if(zb) zb.alert=true; H.n--; break; }
    if(H.n<=0 || ++H.tries>80) S.horde=null;
  }

  function hurtPlayer(n, fx, fz){
    if(Z.dead) return;
    Z.hp=Math.max(0, Z.hp-n); S.dmgFlash=Math.min(1, S.dmgFlash+n/28); S.shake=Math.min(1, S.shake+n/25);
    // from which side, on the screen
    const a=Math.atan2(fx-player.pos.x, fz-player.pos.z), view=Math.atan2(-Math.sin(player.yaw), -Math.cos(player.yaw));
    S.dmgDir=-wrapA(a-view); S.dmgDirT=1.4;
    _v3.set(player.pos.x, player.feetY+1.2, player.pos.z); _v2.set(player.pos.x-fx, 0, player.pos.z-fz).normalize(); blood.burst(_v3, _v2, 6, 0.6);
    snd.hurt();
    if(Z.hp<=0) die();
  }
  function loadBest(){ try{ return JSON.parse(localStorage.getItem("restarea.zombies.best")||"null"); }catch(e){ return null; } }
  function saveBest(b){ try{ localStorage.setItem("restarea.zombies.best", JSON.stringify(b)); }catch(e){} }
  function die(){
    Z.dead=true; S.deadT=0; S.fireHeld=false; S.aimHeld=false; S.horde=null;
    const best=loadBest(); Z.newBest=!best || Z.score>best.score; if(Z.newBest) saveBest({score:Z.score, t:Z.t, kills:Z.kills}); Z.best=Z.newBest ? null : best;
    if(driving) exitCar(); if(seated) standUp();
    hud.dead(true); snd.die(player.pos.x, player.pos.z, true);
  }

  /* ======================================================================
     THE GUNS
     ====================================================================== */
  const G=()=>GUN(S.cur);
  function spreadNow(){
    const g=G(), mv=player.moving ? (keys.KeyQ ? 0.06 : (keys.ShiftLeft||keys.ShiftRight) ? 0.025 : 0.01) : 0;
    return lerp(g.spread, g.ads, S.ads)+mv*(1-S.ads*0.7)+S.bloom;
  }
  function fire(){
    const g=G();
    if(S.mag[g.id]<=0){ snd.click(); S.cool=0.25; S.fired=true; if(S.ammo[g.ammo]>0) startReload(); return; }
    if(S.reloading){ if(g.shells && S.mag[g.id]>0){ S.reloading=false; S.reloadT=0; } else return; }
    S.mag[g.id]--; S.cool=g.rate; S.cycle=g.rate; S.flashT=0.055; S.kick=g.kick; S.kickR=g.kick;
    if(!g.auto) S.fired=true;
    S.bloom=Math.min(0.05, S.bloom+(g.auto ? 0.004 : g.spread*0.4));
    player.pitch=clamp(player.pitch+g.climb*(0.7+Math.random()*0.6)*(1-S.ads*0.4), -1.15, 1.15);
    player.yaw+=(Math.random()-0.5)*g.climb*0.5;
    snd.gun(g.snd);
    camera.getWorldDirection(_v1); _o.copy(camera.position);
    const hits=new Map(), sp=spreadNow();
    // a pair of axes across the view, for the spread
    _v2.set(0,1,0).cross(_v1).normalize(); _v3.copy(_v1).cross(_v2).normalize();
    let tracerEnd=null;
    for(let p=0;p<g.pellets;p++){
      const th=sp*Math.sqrt(Math.random()), ph=Math.random()*Math.PI*2, tt=Math.tan(th);
      _d.copy(_v1).addScaledVector(_v2, tt*Math.cos(ph)).addScaledVector(_v3, tt*Math.sin(ph)).normalize();
      const W=rayWorld(_o, _d, g.range);
      const L=[];
      for(const zb of ZS){ if(!zb.live || zb.state==="dead") continue;
        if(Math.abs(zb.x-_o.x)>g.range+2 || Math.abs(zb.z-_o.z)>g.range+2) continue;
        const h=rayZombie(_o, _d, zb, W.t); if(h) L.push({zb:zb, t:h.t, head:h.head}); }
      L.sort((a,b)=>a.t-b.t);
      let n=0, endT=W.t;
      for(const h of L){ if(n>=(g.pierce||1)) break;
        const e=hits.get(h.zb)||{dmg:0, head:false, at:new T.Vector3(), dir:_d.clone()};
        e.dmg+=g.dmg*(h.head ? g.head : 1)*(1-n*0.25); e.head=e.head||h.head; e.at.copy(_o).addScaledVector(_d, h.t);
        hits.set(h.zb, e); n++; if(n>=(g.pierce||1)) endT=h.t; }
      if(n<(g.pierce||1) && W.what){ _v1.copy(_o).addScaledVector(_d, W.t-0.04); dust.puff(_v1, W.what==="ground"); }
      if(p===0) tracerEnd=_o.clone().addScaledVector(_d, Math.min(endT, g.range));
      camera.getWorldDirection(_v1);
    }
    for(const [zb, e] of hits) hurtZombie(zb, e.dmg, e.head, e.at, e.dir);
    if(hits.size){ S.hitT=0.14; }
    if(tracerEnd && (g.id==="carbine" || g.id==="rifle")) fx.tracer(tracerEnd);
    // and every one of them for a long way round hears it
    const ear=g.id==="pistol" ? 55 : 85;
    for(const zb of ZS) if(zb.live && zb.state!=="dead" && Math.hypot(zb.x-player.pos.x, zb.z-player.pos.z)<ear) zb.alert=true;
    vm.eject(g.id);
  }
  function startReload(){
    const g=G(); if(S.reloading || S.switchT>0 || Z.dead) return;
    if(S.mag[g.id]>=g.mag || S.ammo[g.ammo]<=0) return;
    S.reloading=true; S.reloadT=g.reload; snd.reload(g, 0);
  }
  function select(slot){
    const g=GUNS.find(q=>q.slot===slot); if(!g || Z.dead) return;
    if(!S.have[g.id]){ feed("NO "+g.name+" YET", "#8a8a7a"); return; }
    if(g.id===S.cur && !S.next) return;
    S.next=g.id; S.switchT=0.45; S.reloading=false; S.reloadT=0;
  }
  function cycleGun(dir){
    const owned=GUNS.filter(g=>S.have[g.id]); if(owned.length<2) return;
    const i=owned.findIndex(g=>g.id===(S.next||S.cur)); select(owned[(i+dir+owned.length)%owned.length].slot);
  }
  function melee(){
    if(S.melee>0 || Z.dead || S.switchT>0) return;
    S.melee=0.55; S.meleeHit=false; snd.swish();
  }
  function meleeHit(){
    camera.getWorldDirection(_v1); const fl=Math.hypot(_v1.x,_v1.z)||1, fx=_v1.x/fl, fz=_v1.z/fl;
    let any=false;
    for(const zb of ZS){ if(!zb.live || zb.state==="dead") continue;
      const dx=zb.x-player.pos.x, dz=zb.z-player.pos.z, d=Math.hypot(dx,dz);
      if(d>1.9 || Math.abs(zb.y-player.feetY)>1.2 || (dx*fx+dz*fz)/(d||1)<0.55) continue;
      _v2.set(fx, 0, fz); _v3.set(zb.x, zb.y+1.3*zb.h, zb.z);
      hurtZombie(zb, 22, false, _v3, _v2); zb.kx+=fx*1.1; zb.kz+=fz*1.1; zb.hitT=0.6; zb.atk=0; any=true; }
    if(any){ snd.thud(); S.hitT=0.1; }
  }
  function updateGun(dt){
    const g=G();
    S.cool=Math.max(0, S.cool-dt); S.cycle=Math.max(0, S.cycle-dt); S.flashT=Math.max(0, S.flashT-dt);
    S.bloom=Math.max(0, S.bloom-dt*(g.auto ? 0.05 : 0.08));
    S.ads=approach(S.ads, (S.aimHeld && !Z.dead && S.switchT<=0 && !S.reloading && S.sprint<0.5) ? 1 : 0, dt*(g.zoom ? 5 : 8));
    const sprinting=keys.KeyQ && player.moving && !S.aimHeld;
    S.sprint=approach(S.sprint, sprinting ? 1 : 0, dt*6);
    if(S.switchT>0){ const was=S.switchT; S.switchT-=dt;
      if(was>0.225 && S.switchT<=0.225 && S.next){ S.cur=S.next; S.next=null; vm.show(S.cur); hud.gun(); }
      if(S.switchT<=0){ S.switchT=0; } }
    if(S.melee>0){ const was=S.melee; S.melee=Math.max(0, S.melee-dt); if(was>0.37 && S.melee<=0.37 && !S.meleeHit){ S.meleeHit=true; meleeHit(); } }
    if(S.reloading){
      S.reloadT-=dt;
      if(S.reloadT<=0){
        if(g.shells){ if(S.ammo[g.ammo]>0 && S.mag[g.id]<g.mag){ S.mag[g.id]++; S.ammo[g.ammo]--; snd.shell(); }
          if(S.mag[g.id]<g.mag && S.ammo[g.ammo]>0 && !S.fireHeld) S.reloadT=g.reload; else { S.reloading=false; snd.pump(); } }
        else { const take=Math.min(g.mag-S.mag[g.id], S.ammo[g.ammo]); S.mag[g.id]+=take; S.ammo[g.ammo]-=take; S.reloading=false; snd.reload(g, 1); }
      }
    }
    const canFire=!Z.dead && S.switchT<=0 && S.melee<=0 && S.sprint<0.35 && !droneMode && !driving && !(typeof BOAT!=="undefined" && BOAT.on) && !seated;
    if(S.fireHeld && canFire && S.cool<=0 && (g.auto || !S.fired)) fire();
    if(!S.fireHeld) S.fired=false;
    if(g.shells && S.cycle>0 && S.cycle<g.rate-0.2 && !S.pumped){ S.pumped=true; snd.pump(); }
    if(S.cycle<=0) S.pumped=false;
  }
  const approach=(v,t,r)=>v+clamp(t-v,-r,r);
  Z.lookScale=()=>1-S.ads*(G().zoom ? 0.62 : 0.3);

  /* ======================================================================
     THE GUN IN YOUR HANDS: its own scene, drawn over the view
     ====================================================================== */
  const MAT={metal:new T.MeshStandardMaterial({color:0x4a4e52, metalness:0.3, roughness:0.4}),
             dark:new T.MeshStandardMaterial({color:0x2e3032, metalness:0.12, roughness:0.62}),
             wood:new T.MeshStandardMaterial({color:0x6b4226, roughness:0.6}),
             glove:new T.MeshStandardMaterial({color:0x2c3125, roughness:0.88}),
             sleeve:new T.MeshStandardMaterial({color:0x3b4233, roughness:0.92}),
             brass:new T.MeshStandardMaterial({color:0xb48c3c, metalness:0.6, roughness:0.35}),
             lens:new T.MeshStandardMaterial({color:0x1a2a3a, metalness:0.4, roughness:0.12})};
  const BOX=(w,h,d)=>new T.BoxGeometry(w,h,d);
  const CYLZ=(r0,r1,L,s)=>{ const g=new T.CylinderGeometry(r0,r1,L,s||14); g.rotateX(Math.PI/2); return g; };
  function part(Gp, geo, mat, x,y,z, rx,ry,rz){ const m=new T.Mesh(geo, mat); m.position.set(x,y,z); m.rotation.set(rx||0,ry||0,rz||0); Gp.add(m); return m; }
  function arm(Gp, h, e, rot){
    const a=V3(h[0],h[1],h[2]), b=V3(e[0],e[1],e[2]), L=a.distanceTo(b);
    const m=new T.Mesh(new T.CylinderGeometry(0.034,0.042,L,12), MAT.sleeve); m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V3(0,1,0), b.clone().sub(a).normalize()); Gp.add(m);
    part(Gp, BOX(0.052,0.075,0.085), MAT.glove, h[0],h[1],h[2], rot||0.2, 0, 0);
  }
  // each gun points down -z from its grip; hands and forearms for the one in your hands, none for one on the ground
  function makeGun(id, hands){
    const Gp=new T.Group(); Gp.userData.muzzle=new T.Object3D(); Gp.userData.port=new T.Object3D(); Gp.add(Gp.userData.muzzle, Gp.userData.port);
    const M=MAT, mz=(x,y,z)=>Gp.userData.muzzle.position.set(x,y,z), pt=(x,y,z)=>Gp.userData.port.position.set(x,y,z);
    if(id==="pistol"){
      part(Gp, BOX(0.03,0.032,0.19), M.metal, 0,0.036,-0.06); part(Gp, BOX(0.028,0.024,0.16), M.dark, 0,0.009,-0.05);
      part(Gp, BOX(0.03,0.11,0.046), M.dark, 0,-0.048,0.024, 0.24); part(Gp, BOX(0.006,0.005,0.042), M.dark, 0,-0.017,-0.018);
      part(Gp, CYLZ(0.0065,0.0065,0.012,10), M.dark, 0,0.036,-0.152); part(Gp, BOX(0.004,0.008,0.005), M.dark, 0,0.056,-0.14);
      for(const s of [-1,1]) part(Gp, BOX(0.006,0.008,0.006), M.dark, s*0.0075,0.056,0.022);
      mz(0,0.036,-0.165); pt(0.016,0.046,-0.04);
      if(hands){ arm(Gp, [0.004,-0.055,0.034], [0.05,-0.24,0.36], 0.24); arm(Gp, [-0.026,-0.062,0.022], [-0.15,-0.25,0.33], 0.3); }
    }else if(id==="shotgun"){
      part(Gp, BOX(0.042,0.058,0.17), M.metal, 0,0.004,-0.02); part(Gp, CYLZ(0.011,0.011,0.50), M.metal, 0,0.022,-0.34);
      part(Gp, CYLZ(0.010,0.010,0.38), M.metal, 0,-0.004,-0.30);
      const pump=new T.Group(); pump.position.set(0,-0.006,-0.25); Gp.add(pump); Gp.userData.pump=pump;
      part(pump, BOX(0.046,0.042,0.15), M.wood, 0,0,0);
      part(Gp, BOX(0.038,0.07,0.28), M.wood, 0,-0.042,0.21, -0.12).userData.stock=true; part(Gp, BOX(0.034,0.05,0.07), M.wood, 0,-0.03,0.07, 0.3);
      part(Gp, BOX(0.006,0.005,0.05), M.dark, 0,-0.03,-0.01); part(Gp, new T.SphereGeometry(0.0045,8,6), M.brass, 0,0.036,-0.585);
      mz(0,0.022,-0.6); pt(0.022,0.012,-0.04);
      if(hands){ arm(Gp, [0.004,-0.055,0.075], [0.06,-0.22,0.38], 0.3); arm(pump, [-0.006,-0.034,0], [-0.15,-0.22,0.27], 0.1); }
    }else if(id==="carbine"){
      part(Gp, BOX(0.034,0.044,0.21), M.dark, 0,0.012,-0.02); part(Gp, BOX(0.03,0.036,0.14), M.dark, 0,-0.026,-0.01);
      part(Gp, BOX(0.042,0.046,0.19), M.dark, 0,0.008,-0.22); part(Gp, CYLZ(0.0085,0.0085,0.13), M.metal, 0,0.008,-0.38);
      part(Gp, CYLZ(0.011,0.011,0.04), M.metal, 0,0.008,-0.46);
      part(Gp, BOX(0.026,0.13,0.062), M.dark, 0,-0.1,-0.06, 0.18); part(Gp, BOX(0.028,0.085,0.036), M.dark, 0,-0.072,0.07, 0.35);
      part(Gp, BOX(0.032,0.065,0.2), M.dark, 0,-0.004,0.22).userData.stock=true;
      // the rear sight: a ring you look through, on a low block, so down the sights the front post stands in it
      part(Gp, BOX(0.018,0.01,0.03), M.dark, 0,0.039,0.03); part(Gp, new T.TorusGeometry(0.0062,0.0016,8,16), M.dark, 0,0.058,0.03);
      for(const s of [-1,1]) part(Gp, BOX(0.003,0.016,0.006), M.dark, s*0.0078,0.05,0.03);
      part(Gp, BOX(0.012,0.03,0.012), M.dark, 0,0.03,-0.30); part(Gp, BOX(0.003,0.018,0.003), M.dark, 0,0.054,-0.30);
      mz(0,0.008,-0.49); pt(0.02,0.018,-0.03);
      if(hands){ arm(Gp, [0.004,-0.075,0.075], [0.06,-0.25,0.38], 0.35); arm(Gp, [0,-0.035,-0.22], [-0.16,-0.25,0.04], 0.05); }
    }else{
      part(Gp, BOX(0.04,0.05,0.5), M.wood, 0,-0.012,-0.17); part(Gp, BOX(0.04,0.10,0.24), M.wood, 0,-0.045,0.21, -0.1).userData.stock=true;
      part(Gp, CYLZ(0.016,0.016,0.2), M.metal, 0,0.02,-0.03); part(Gp, CYLZ(0.0095,0.011,0.5), M.metal, 0,0.024,-0.46);
      part(Gp, CYLZ(0.016,0.016,0.28), M.dark, 0,0.075,-0.03); part(Gp, CYLZ(0.017,0.025,0.07), M.dark, 0,0.075,-0.19);
      part(Gp, CYLZ(0.022,0.017,0.06), M.dark, 0,0.075,0.13); part(Gp, new T.CircleGeometry(0.021,16), M.lens, 0,0.075,-0.2251, Math.PI);
      for(const z of [-0.09, 0.03]) part(Gp, BOX(0.012,0.04,0.02), M.metal, 0,0.048,z);
      part(Gp, new T.CylinderGeometry(0.005,0.005,0.05,8), M.metal, 0.03,0.02,0.04, 0,0,Math.PI/2); part(Gp, new T.SphereGeometry(0.009,8,6), M.metal, 0.056,0.02,0.04);
      part(Gp, BOX(0.006,0.005,0.05), M.dark, 0,-0.04,0.0);
      mz(0,0.024,-0.72); pt(0.03,0.03,0.0);
      if(hands){ arm(Gp, [0.004,-0.055,0.10], [0.06,-0.22,0.40], 0.3); arm(Gp, [0,-0.05,-0.26], [-0.16,-0.25,0.0], 0.05); }
    }
    return Gp;
  }
  const vm={};
  function buildVM(){
    vm.scene=new T.Scene(); vm.cam=new T.PerspectiveCamera(54, innerWidth/innerHeight, 0.01, 10);
    vm.amb=new T.AmbientLight(0xffffff, 0.4); vm.dir=new T.DirectionalLight(0xffffff, 0.6); vm.dir.position.set(-0.5, 1, 0.4);
    vm.pt=new T.PointLight(0xffb060, 0, 1.6, 2); vm.scene.add(vm.amb, vm.dir, vm.pt);
    vm.root=new T.Group(); vm.scene.add(vm.root); vm.guns={};
    for(const g of GUNS){ const m=makeGun(g.id, true); m.visible=false; vm.root.add(m); vm.guns[g.id]=m;
      m.userData.stocks=[]; m.traverse(o=>{ if(o.userData.stock) m.userData.stocks.push(o); }); }
    const ft=signTex(64, 64, (c,W,H)=>{ const gr=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2); gr.addColorStop(0,"rgba(255,250,220,1)"); gr.addColorStop(0.25,"rgba(255,200,90,0.9)");
      gr.addColorStop(0.6,"rgba(255,120,30,0.35)"); gr.addColorStop(1,"rgba(255,80,0,0)"); c.fillStyle=gr; c.fillRect(0,0,W,H);
      c.strokeStyle="rgba(255,230,160,0.9)"; c.lineWidth=3; for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; c.beginPath(); c.moveTo(W/2,H/2); c.lineTo(W/2+Math.cos(a)*W*0.48, H/2+Math.sin(a)*H*0.48); c.stroke(); } });
    vm.flash=new T.Sprite(new T.SpriteMaterial({map:ft, blending:T.AdditiveBlending, depthWrite:false, transparent:true})); vm.flash.visible=false; vm.scene.add(vm.flash);
    vm.shells=[]; for(let k=0;k<10;k++){ const m=new T.Mesh(new T.CylinderGeometry(0.0045,0.0045,0.02,8), MAT.brass); m.visible=false; vm.scene.add(m); vm.shells.push({m:m, v:new T.Vector3(), t:0}); }
    vm.show=id=>{ for(const k in vm.guns) vm.guns[k].visible=k===id; };
    vm.eject=id=>{ if(id==="shotgun" || id==="rifle") return; const s=vm.shells.find(q=>q.t<=0)||vm.shells[0], g=vm.guns[S.cur];
      g.userData.port.getWorldPosition(s.m.position); s.v.set(0.9+Math.random()*0.4, 0.9+Math.random()*0.5, 0.2); s.t=0.7; s.m.visible=true; s.m.rotation.set(Math.random()*3, 0, Math.random()*3); };
    vm.show(S.cur);
  }
  function updateVM(dt){
    const g=G(), m=vm.guns[S.cur];
    for(const k in vm.guns) if(k!==S.cur && vm.guns[k].visible) vm.guns[k].visible=false;      // (only ever the one in your hands)
    for(const st of m.userData.stocks) st.visible=S.ads<0.4;                                     // (down the sights the stock is at your cheek)
    const mv=player.moving ? 1 : 0, k=1-S.ads*0.85;
    S.bobA+=dt*(mv ? (keys.KeyQ ? 11 : (keys.ShiftLeft||keys.ShiftRight) ? 9 : 7) : 1.2);
    const bx=Math.sin(S.bobA)*(mv ? 0.009 : 0.0015)*k, by=-Math.abs(Math.cos(S.bobA))*(mv ? 0.008 : 0.0012)*k;
    const dyaw=wrapA(player.yaw-S.lastYaw), dp=player.pitch-S.lastPitch; S.lastYaw=player.yaw; S.lastPitch=player.pitch;
    S.swX=clamp(S.swX*Math.exp(-dt*9)+dyaw*0.22*k, -0.05, 0.05); S.swY=clamp(S.swY*Math.exp(-dt*9)-dp*0.22*k, -0.04, 0.04);
    S.kick*=Math.exp(-dt*13); S.kickR*=Math.exp(-dt*11);
    const rl=S.reloading ? (g.shells ? 1 : Math.sin(clamp(1-S.reloadT/g.reload, 0, 1)*Math.PI)) : 0; S.rl=approach(S.rl, rl, dt*7);
    const sw=S.switchT>0 ? Math.sin(clamp(1-S.switchT/0.45, 0, 1)*Math.PI) : 0;
    const ml=S.melee>0 ? Math.sin((1-S.melee/0.55)*Math.PI) : 0, th=S.throwT>0 ? Math.sin((1-S.throwT/0.45)*Math.PI) : 0;
    const H=g.hip, A=g.adsP, a=S.ads;
    m.position.set(lerp(H[0],A[0],a)+bx+S.swX-ml*0.05+S.sprint*0.03+th*0.06, lerp(H[1],A[1],a)+by+S.swY-S.rl*0.06-sw*0.3-S.sprint*0.06+ml*0.02-th*0.16, lerp(H[2],A[2],a)+S.kick*0.035-ml*0.12);
    m.rotation.set(S.kickR*0.09-S.rl*0.55-S.sprint*0.35+ml*0.25, S.swX*1.4+S.sprint*0.6+ml*0.5, S.sprint*0.3-S.rl*0.35);
    if(m.userData.pump){ const c=g.rate>0 && S.cycle>0 ? Math.sin(clamp((g.rate-S.cycle-0.2)/0.45, 0, 1)*Math.PI) : 0; m.userData.pump.position.z=-0.25+c*0.075; }
    m.visible=!(g.zoom && S.ads>0.85);
    // the flash, the light it throws, the brass flying out
    vm.flash.visible=S.flashT>0 && m.visible;
    if(vm.flash.visible){ m.userData.muzzle.getWorldPosition(vm.flash.position); const s=(g.id==="shotgun" ? 0.2 : g.id==="pistol" ? 0.12 : 0.16)*(0.8+Math.random()*0.4);
      vm.flash.scale.set(s, s, s); vm.flash.material.rotation=Math.random()*6.28; }
    vm.pt.intensity=S.flashT>0 ? 2.6 : 0; m.userData.muzzle.getWorldPosition(vm.pt.position);
    for(const s of vm.shells){ if(s.t<=0) continue; s.t-=dt; s.v.y-=9.8*dt*0.5; s.m.position.addScaledVector(s.v, dt); s.m.rotation.x+=dt*14; if(s.t<=0) s.m.visible=false; }
    // lit as you are: the sky's light, the sun's, the flashlight's, a lamp's if you are under one
    let lampI=0; if(LIGHT_POOL[0] && LIGHT_POOL[0].intensity>0){ const L=LIGHT_POOL[0], d=L.position.distanceTo(camera.position); lampI=L.intensity*Math.max(0, 1-d/(L.distance||10))*0.5; }
    vm.amb.intensity=clamp(hemi.intensity*0.75+amb.intensity*1.2+lampI*0.25, 0.5, 1.0); vm.amb.color.copy(hemi.color).lerp(_c3.setHex(0xffffff), 0.6);
    vm.dir.intensity=Math.max(0.7, key.intensity*0.6)+torchLvl*0.6+lampI*0.4; vm.dir.color.copy(key.color).lerp(_c3.setHex(0xffffff), 0.6);
    vm.cam.aspect=camera.aspect; vm.cam.updateProjectionMatrix();
  }
  Z.render=function(){
    if(!vm.scene || Z.dead || droneMode || driving || (typeof BOAT!=="undefined" && BOAT.on) || seated) return;
    const ac=renderer.autoClear; renderer.autoClear=false; renderer.clearDepth(); renderer.render(vm.scene, vm.cam); renderer.autoClear=ac;
  };

  /* ======================================================================
     BLOOD, DUST, POOLS
     ====================================================================== */
  function blotTex(seed, soft){
    return signTex(128, 128, (c,W,H)=>{ const r=_trng(seed); c.clearRect(0,0,W,H);
      for(let k=0;k<(soft ? 1 : 9);k++){ const x=W/2+(k ? (r()-0.5)*W*0.45 : 0), y=H/2+(k ? (r()-0.5)*H*0.45 : 0), rr=(k ? 0.12+r()*0.16 : 0.32)*W;
        const g=c.createRadialGradient(x,y,0,x,y,rr); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(0.55,"rgba(255,255,255,0.85)"); g.addColorStop(1,"rgba(255,255,255,0)");
        c.fillStyle=g; c.beginPath(); c.arc(x,y,rr,0,7); c.fill(); }
      if(!soft) for(let k=0;k<26;k++){ const a=r()*Math.PI*2, d=(0.3+r()*0.18)*W, s=1.5+r()*4; c.fillStyle="rgba(255,255,255,"+(0.5+r()*0.5).toFixed(2)+")";
        c.beginPath(); c.arc(W/2+Math.cos(a)*d, H/2+Math.sin(a)*d, s, 0, 7); c.fill(); } });
  }
  function particles(n, color, size){
    const P={n:0, max:n, pos:new Float32Array(n*3), vel:new Float32Array(n*3), life:new Float32Array(n), gy:new Float32Array(n), pool:new Uint8Array(n)};
    const geo=new T.BufferGeometry(); P.attr=new T.BufferAttribute(P.pos, 3); P.attr.setUsage(T.DynamicDrawUsage); geo.setAttribute("position", P.attr); geo.setDrawRange(0, 0);
    P.mat=new T.PointsMaterial({color:color, size:size, sizeAttenuation:true, transparent:true, opacity:0.95, depthWrite:false});
    P.base=new T.Color(color); P.pts=new T.Points(geo, P.mat); P.pts.frustumCulled=false; P.pts.visible=false; scene.add(P.pts);
    P.add=(x,y,z, vx,vy,vz, life, gy, pool)=>{ if(P.n>=P.max) return; const i=P.n++;
      P.pos[i*3]=x; P.pos[i*3+1]=y; P.pos[i*3+2]=z; P.vel[i*3]=vx; P.vel[i*3+1]=vy; P.vel[i*3+2]=vz; P.life[i]=life; P.gy[i]=gy; P.pool[i]=pool?1:0; };
    P.step=(dt, onLand)=>{
      for(let i=0;i<P.n;i++){
        P.vel[i*3+1]-=9.8*dt; const f=Math.max(0,1-dt*1.2); P.vel[i*3]*=f; P.vel[i*3+2]*=f;
        P.pos[i*3]+=P.vel[i*3]*dt; P.pos[i*3+1]+=P.vel[i*3+1]*dt; P.pos[i*3+2]+=P.vel[i*3+2]*dt; P.life[i]-=dt;
        const landed=P.pos[i*3+1]<P.gy[i];
        if(landed && onLand && P.pool[i]) onLand(P.pos[i*3], P.gy[i], P.pos[i*3+2]);
        if(P.life[i]<=0 || landed){ const j=--P.n;
          for(let k=0;k<3;k++){ P.pos[i*3+k]=P.pos[j*3+k]; P.vel[i*3+k]=P.vel[j*3+k]; } P.life[i]=P.life[j]; P.gy[i]=P.gy[j]; P.pool[i]=P.pool[j]; i--; }
      }
      P.attr.needsUpdate=true; P.pts.geometry.setDrawRange(0, P.n); P.pts.visible=P.n>0;
    };
    return P;
  }
  const blood={}, dust={}, fx={};
  function buildFX(){
    blood.P=particles(900, 0x6a0704, 0.05); dust.P=particles(300, 0x8a8270, 0.04);
    const mistT=blotTex(91, true);
    const sprites=(n, col)=>{ const L=[]; for(let k=0;k<n;k++){ const s=new T.Sprite(new T.SpriteMaterial({map:mistT, color:col, transparent:true, depthWrite:false, opacity:0}));
      s.visible=false; scene.add(s); L.push({s:s, t:0, life:0.5, g:1}); } return L; };
    blood.mists=sprites(24, 0x5a0604); dust.puffs=sprites(16, 0x8a8478);
    const pop=(L, at, size, life, op)=>{ const m=L.find(q=>q.t<=0)||L[0]; m.s.position.copy(at); m.t=life; m.life=life; m.size=size; m.op=op; m.s.visible=true; m.s.material.rotation=Math.random()*6.28; };
    blood.mist=(at, k)=>pop(blood.mists, at, 0.5*(k||1), 0.45, 0.75);
    dust.mist=(at)=>pop(dust.puffs, at, 0.35, 0.5, 0.55);
    // the pools and the spatter on the ground: soft-edged, dark, laid a centimetre and a half over whatever is there
    blood.decMat=new T.MeshStandardMaterial({map:blotTex(77, false), color:0x4a0603, transparent:true, depthWrite:false, roughness:0.35,
      polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-6});
    blood.decals=[]; blood.di=0;
    for(let k=0;k<110;k++){ const m=new T.Mesh(new T.PlaneGeometry(1,1), blood.decMat); m.rotation.x=-Math.PI/2; m.visible=false; m.receiveShadow=true; scene.add(m); blood.decals.push(m); }
    blood.decal=(x, z, y, s)=>{ const m=blood.decals[blood.di++%blood.decals.length]; m.position.set(x, y+0.014, z); m.rotation.z=Math.random()*6.28; m.scale.set(s, s*(0.7+Math.random()*0.5), 1); m.visible=true; };
    blood.burst=(at, dir, n, k)=>{
      const gy=surfaceY(at.x, at.z, at.y)+0.01;
      for(let i=0;i<n;i++){ const sp=(1.2+Math.random()*3.2)*(k||1);
        blood.P.add(at.x, at.y, at.z, dir.x*sp*0.8+(Math.random()-0.5)*2.4, (Math.random()*0.9+0.2)*sp*0.7, dir.z*sp*0.8+(Math.random()-0.5)*2.4, 1.6, gy, i<2); }
      blood.mist(at, k);
    };
    dust.puff=(at, ground)=>{ const gy=(ground ? at.y : surfaceY(at.x, at.z, at.y))-0.02;
      for(let i=0;i<8;i++) dust.P.add(at.x, at.y, at.z, (Math.random()-0.5)*2, Math.random()*2.2, (Math.random()-0.5)*2, 0.6, gy, false);
      dust.mist(at); };
    // a tracer: a streak from the gun to where it went, for a frame or two
    const tg=new T.BufferGeometry(); tg.setAttribute("position", new T.BufferAttribute(new Float32Array(6), 3));
    fx.line=new T.Line(tg, new T.LineBasicMaterial({color:0xffe2a0, transparent:true, opacity:0.55, depthWrite:false})); fx.line.visible=false; fx.line.frustumCulled=false; scene.add(fx.line); fx.lt=0;
    // a bomb's fire: a ball of it, gone in a third of a second
    { const ft=blotTex(31, true); fx.ball=new T.Sprite(new T.SpriteMaterial({map:ft, color:0xffa040, blending:T.AdditiveBlending, transparent:true, depthWrite:false, opacity:0}));
      fx.ball.visible=false; scene.add(fx.ball); fx.bt=0; }
    fx.fire=(at)=>{ fx.ball.position.copy(at); fx.bt=0.5; fx.ball.visible=true; };
    // and its smoke: a column of dark lumps that rise and spread and thin over three seconds or so
    { const smTex=blotTex(91, false); fx.smoke=[];
      for(let k=0;k<9;k++){ const s=new T.Sprite(new T.SpriteMaterial({map:smTex, color:0x3c3b36, transparent:true, depthWrite:false, opacity:0}));
        s.visible=false; scene.add(s); fx.smoke.push({s:s, t:0, life:1, vx:0, vy:0, vz:0, sz:1}); } }
    fx.boomSmoke=(at)=>{ for(const m of fx.smoke){ m.s.position.set(at.x+(Math.random()-0.5)*1.8, at.y+Math.random()*1.4, at.z+(Math.random()-0.5)*1.8);
        m.vx=(Math.random()-0.5)*1.4; m.vy=1.4+Math.random()*2.2; m.vz=(Math.random()-0.5)*1.4; m.t=m.life=2.4+Math.random()*1.6; m.sz=2.2+Math.random()*2.4;
        m.s.material.rotation=Math.random()*6.28; m.s.visible=true; }
      // and what it throws: grit and bits of whatever was there, out and up
      const gy=surfaceY(at.x, at.z, at.y)-0.02;
      for(let i=0;i<28;i++){ const a=Math.random()*6.28, sp=3+Math.random()*7; dust.P.add(at.x, at.y, at.z, Math.sin(a)*sp, 2.5+Math.random()*7, Math.cos(a)*sp, 1.4, gy, false); } };
    blood.scMat=new T.MeshStandardMaterial({map:blotTex(78, false), color:0x14110e, transparent:true, depthWrite:false, roughness:0.9,
      polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-6});
    blood.scs=[]; blood.si=0; for(let k=0;k<10;k++){ const m=new T.Mesh(new T.PlaneGeometry(1,1), blood.scMat); m.rotation.x=-Math.PI/2; m.visible=false; scene.add(m); blood.scs.push(m); }
    blood.scorch=(x, z, y)=>{ const m=blood.scs[blood.si++%blood.scs.length]; m.position.set(x, y+0.012, z); m.rotation.z=Math.random()*6.28; m.scale.set(4.2, 4.2, 1); m.visible=true; };
    fx.tracer=(end)=>{ const a=fx.line.geometry.attributes.position; camera.getWorldDirection(_v1); _v2.set(0,1,0).cross(_v1).normalize();
      const sx=camera.position.x+_v1.x*0.8-_v2.x*0.12, sy=camera.position.y+_v1.y*0.8-0.1, sz=camera.position.z+_v1.z*0.8-_v2.z*0.12;
      a.setXYZ(0, sx, sy, sz); a.setXYZ(1, end.x, end.y, end.z); a.needsUpdate=true; fx.line.visible=true; fx.lt=0.05; };
  }
  function updateFX(dt, light){
    let pooled=0;
    blood.P.step(dt, (x,y,z)=>{ if(pooled++<3) blood.decal(x, z, y-0.01, 0.12+Math.random()*0.22); }); dust.P.step(dt, null);
    blood.P.mat.color.copy(blood.P.base).multiplyScalar(0.35+0.65*light); dust.P.mat.color.copy(dust.P.base).multiplyScalar(0.3+0.7*light);
    for(const L of [blood.mists, dust.puffs]) for(const m of L){ if(m.t<=0) continue; m.t-=dt; const u=1-m.t/m.life;
      m.s.scale.setScalar(m.size*(0.4+u*1.2)); m.s.material.opacity=m.op*(1-u)*(0.4+0.6*light); if(m.t<=0) m.s.visible=false; }
    if(fx.lt>0){ fx.lt-=dt; if(fx.lt<=0) fx.line.visible=false; }
    // the fire: white-hot and small, then a big orange ball going out
    if(fx.bt>0){ fx.bt-=dt; const u=Math.min(1, 1-fx.bt/0.5); fx.ball.scale.setScalar(2.5+u*10); fx.ball.material.opacity=Math.pow(Math.max(0, 1-u), 0.7)*0.95;
      fx.ball.material.color.setHex(0xfff2c8).lerp(_c8.setHex(0xff5a14), Math.min(1, u*1.6)); if(fx.bt<=0) fx.ball.visible=false; }
    for(const m of fx.smoke){ if(m.t<=0) continue; m.t-=dt; const u=1-m.t/m.life;
      m.s.position.x+=m.vx*dt; m.s.position.y+=m.vy*dt; m.s.position.z+=m.vz*dt; m.vy*=1-dt*0.5;
      m.s.scale.setScalar(m.sz*(0.6+u*2.2)); m.s.material.opacity=0.8*Math.min(1, u*10)*Math.pow(1-u, 1.3);
      m.s.material.color.setHex(0x3c3b36).multiplyScalar(0.35+0.65*light); if(m.t<=0) m.s.visible=false; }
    BOOM.mod.v=Math.max(0, BOOM.mod.v-dt*3.5);
  }

  /* ======================================================================
     PICKUPS
     ====================================================================== */
  const PK=[];
  const LABEL={"9MM":["9MM","#c8a040","#2a1a0a"], "12 GAUGE":["12 GA","#a8281c","#f2e8d0"], "5.56":["5.56","#4a5a32","#e8e4c8"], ".30-06":[".30-06","#2e4a2e","#e8dca8"]};
  const PMAT={};
  function labelMat(txt, bg, fg){ return new T.MeshStandardMaterial({roughness:0.7, map:signTex(128, 64, (c,W,H)=>{ c.fillStyle=bg; c.fillRect(0,0,W,H);
    c.strokeStyle=fg; c.lineWidth=4; c.strokeRect(6,6,W-12,H-12); c.fillStyle=fg; fitText(c, txt, W*0.8, H*0.6, W/2, H/2, "700", "Oswald, Arial"); })}); }
  function crossMat(bg, fg){ return new T.MeshStandardMaterial({roughness:0.6, map:signTex(64, 64, (c,W,H)=>{ c.fillStyle=bg; c.fillRect(0,0,W,H); c.fillStyle=fg;
    c.fillRect(W*0.38, H*0.16, W*0.24, H*0.68); c.fillRect(W*0.16, H*0.38, W*0.68, H*0.24); })}); }
  const GLOWT={};
  function pickupMesh(kind){
    const g=new T.Group(), item=new T.Group(); g.add(item);
    const [type, sub]=kind.split(":");
    let col=0xe8c050;
    if(type==="ammo"){
      const L=LABEL[sub], key="a"+sub; if(!PMAT[key]) PMAT[key]=labelMat(L[0], L[1], L[2]);
      const side=new T.MeshStandardMaterial({color:L[1], roughness:0.7}), mats=[side, side, PMAT[key], side, side, side];
      const w=sub==="5.56" ? 0.28 : 0.22, h=sub==="5.56" ? 0.16 : 0.11, d=sub==="5.56" ? 0.13 : 0.14;
      item.add(new T.Mesh(new T.BoxGeometry(w,h,d), mats));
      if(sub==="5.56") part(item, BOX(0.1,0.02,0.02), MAT.dark, 0, h/2+0.012, 0);
    }else if(type==="bomb"){
      col=0xe86a2a; const mt=new T.MeshStandardMaterial({color:0x5a5e60, metalness:0.4, roughness:0.5});
      for(const dz of [-0.05, 0.05]){ part(item, new T.CylinderGeometry(0.035, 0.035, 0.22, 10), mt, 0, 0.035, dz, 0, 0, Math.PI/2);
        for(const x of [-0.115, 0.115]) part(item, new T.CylinderGeometry(0.042, 0.042, 0.03, 10), mt, x, 0.035, dz, 0, 0, Math.PI/2); }
      part(item, BOX(0.08, 0.085, 0.17), new T.MeshStandardMaterial({color:0x6a6a2a, roughness:0.9}), 0, 0.04, 0);
    }else if(type==="health" || type==="medkit"){
      col=0xe04040;
      if(type==="medkit"){ if(!PMAT.kit) PMAT.kit=crossMat("#c8281c", "#f2efe6"); const s=new T.MeshStandardMaterial({color:0xc8281c, roughness:0.6});
        item.add(new T.Mesh(new T.BoxGeometry(0.32,0.12,0.22), [s,s,PMAT.kit,s,s,s])); part(item, BOX(0.12,0.025,0.025), MAT.dark, 0, 0.075, 0); }
      else { if(!PMAT.aid) PMAT.aid=crossMat("#f2efe6", "#c8281c"); const s=new T.MeshStandardMaterial({color:0xf2efe6, roughness:0.6});
        item.add(new T.Mesh(new T.BoxGeometry(0.16,0.06,0.11), [s,s,PMAT.aid,s,s,s])); }
    }else{
      col=0xf0eccc; const m=makeGun(sub, false); m.rotation.set(0, 0, Math.PI/2); item.add(m);
    }
    if(!GLOWT.t) GLOWT.t=blotTex(55, true);
    const glow=new T.Mesh(new T.PlaneGeometry(1.3,1.3), new T.MeshBasicMaterial({map:GLOWT.t, color:col, transparent:true, opacity:0.35, depthWrite:false,
      blending:T.AdditiveBlending, polygonOffset:true, polygonOffsetFactor:-7, polygonOffsetUnits:-7}));
    glow.rotation.x=-Math.PI/2; glow.scale.setScalar(1.25); g.add(glow); g.userData={item:item, glow:glow};
    item.scale.setScalar(1.6);                                            // (bigger than life, to be seen across a lot in the gloom)
    item.traverse(o=>{ if(o.isMesh) o.castShadow=true; });
    return g;
  }
  function placePickup(kind, x, z, y, o){
    const g=pickupMesh(kind); g.position.set(x, y, z); g.userData.glow.position.y=0.03; scene.add(g);
    const p=Object.assign({kind:kind, x:x, z:z, y:y, g:g, t:Math.random()*6}, o||{}); PK.push(p); return p;
  }
  function dropPickup(kind, x, z, y){ const s=freeSpot(x, z, y, 1.6); if(s) placePickup(kind, s.x, s.z, s.y, {dyn:true, life:90}); }
  // the caches: at places you know, they come back a while after you have them
  const CACHES=[
    [-3.5, 2.5, 0, "ammo:9MM"], [-72, 30, 0, "health"], [4, -58, 0, "ammo:9MM"], [37, 31, 0, "gun:shotgun"], [30, 42, 0, "ammo:12 GAUGE"],
    [82, -179, 2.7, "ammo:5.56"], [286, 49, undefined, "medkit"], [312, 156, undefined, "ammo:12 GAUGE"], [18, 80, undefined, "health"],
    [139, 109, undefined, "gun:carbine"], [88, -1230, undefined, "medkit"], [150, -1114, undefined, "gun:rifle"], [909, -1250, undefined, "ammo:5.56"],
    [1300, -1250, undefined, "ammo:9MM"], [1445, -1236, undefined, "medkit"], [1437, -1189, undefined, "ammo:12 GAUGE"], [-61.5, -2940, undefined, "ammo:5.56"],
    [-56.2, -2918.4, -8.8, "gun:rifle"], [1200, -1180, undefined, "health"], [-10, -1385, undefined, "ammo:5.56"], [-45, -2975, undefined, "health"],
    // the pipe bombs: the garage's bench, the fireworks outlet (of course), the farm's machine shed, the weigh station's apron
    [34, 34, 0, "bomb"], [912, -1262, undefined, "bomb"], [152, -1112, undefined, "bomb"], [-48, -2968, undefined, "bomb"],
    // and up the water tower, for whoever gets up there
    [WATERTOWER.x+6.5, WATERTOWER.z+1.6, WATERTOWER.catwalk, "ammo:.30-06"]];
  let cachesBuilt=false;
  function buildCaches(){
    if(cachesBuilt) return; cachesBuilt=true;
    for(const [x, z, yh, kind] of CACHES){ const s=freeSpot(x, z, yh, 5); if(s) placePickup(kind, s.x, s.z, s.y, {cache:true, kind0:kind}); }
  }
  function take(p){
    const [type, sub]=p.kind.split(":");
    if(type==="bomb"){ if(S.bombs>=4) return false; S.bombs++; feed("+1 PIPE BOMB  ·  F TO THROW", "#e8a060"); snd.pick(0); return true; }
    if(type==="ammo"){ if(S.ammo[sub]>=AMMO_MAX[sub]) return false; const n=Math.min(AMMO_BOX[sub], AMMO_MAX[sub]-S.ammo[sub]); S.ammo[sub]+=n; feed("+"+n+" "+sub, "#e8c860"); snd.pick(0); }
    else if(type==="health" || type==="medkit"){ if(Z.hp>=100) return false; const n=type==="medkit" ? 60 : 25; Z.hp=Math.min(100, Z.hp+n); feed(type==="medkit" ? "FIRST AID KIT  +"+n : "BANDAGES  +"+n, "#f08080"); snd.pick(1); }
    else { const g=GUN(sub), had=S.have[sub]; S.have[sub]=true; if(!had) S.mag[sub]=g.mag;
      S.ammo[g.ammo]=Math.min(AMMO_MAX[g.ammo], S.ammo[g.ammo]+AMMO_BOX[g.ammo]*2);
      feed(had ? g.name+" AMMO" : g.name+"  ·  "+g.slot, "#f2efd8"); snd.pick(2); if(!had){ select(g.slot); banner(g.name, "PRESS "+g.slot+" FOR IT"); } }
    return true;
  }
  function updatePickups(dt){
    const px=player.pos.x, pz=player.pos.z, py=player.feetY;
    for(let i=PK.length-1;i>=0;i--){ const p=PK[i];
      p.t+=dt;
      if(p.gone){ p.respawn-=dt; if(p.respawn<=0){ p.gone=false; p.g.visible=true; } continue; }
      const it=p.g.userData.item; it.position.y=0.38+Math.sin(p.t*2.2)*0.06; it.rotation.y+=dt*1.3;
      p.g.userData.glow.material.opacity=0.34+0.16*Math.sin(p.t*3);
      if(p.dyn){ p.life-=dt; if(p.life<=0 || Math.hypot(p.x-px, p.z-pz)>160){ scene.remove(p.g); PK.splice(i,1); continue; } }
      if(Z.dead) continue;
      if(Math.hypot(p.x-px, p.z-pz)<1.2 && Math.abs(p.y-py)<1.6 && take(p)){
        if(p.cache){ p.gone=true; p.g.visible=false; p.respawn=120+Math.random()*60;
          if(p.kind.startsWith("gun:")){ const g=GUN(p.kind.slice(4)); scene.remove(p.g); p.kind="ammo:"+g.ammo; p.g=pickupMesh(p.kind); p.g.position.set(p.x, p.y, p.z); p.g.userData.glow.position.y=0.03; p.g.visible=false; scene.add(p.g); } }
        else { scene.remove(p.g); PK.splice(i,1); } }
    }
    // more turns up round you as you go: what you are short of most
    S.supplyT-=dt;
    if(S.supplyT<=0){ S.supplyT=22+Math.random()*16;
      const near=PK.filter(p=>!p.gone && Math.hypot(p.x-px, p.z-pz)<45).length;
      if(near<3){ const kind=wantKind();
        for(let k=0;k<10;k++){ const a=Math.random()*Math.PI*2, r=10+Math.random()*24, x=px+Math.sin(a)*r, z=pz+Math.cos(a)*r, y=okSpot(x, z, py);
          if(y===null || Math.abs(y-py)>4 || edgeBetween(px, pz, x, z)) continue; placePickup(kind, x, z, y, {dyn:true, life:150}); break; } } }
  }
  function wantKind(){
    if(Z.hp<50 && Math.random()<0.55) return Math.random()<0.4 ? "medkit" : "health";
    if(!S.have.shotgun && Z.t>70) return "gun:shotgun";
    if(!S.have.carbine && Z.t>190) return "gun:carbine";
    if(!S.have.rifle && Z.t>320) return "gun:rifle";
    const owned=GUNS.filter(g=>S.have[g.id]); let best=owned[0], low=1e9;
    for(const g of owned){ const f=S.ammo[g.ammo]/AMMO_MAX[g.ammo]; if(f<low){ low=f; best=g; } }
    if(S.bombs<2 && Math.random()<0.18) return "bomb";
    return Math.random()<0.15 ? "health" : "ammo:"+best.ammo;
  }

  /* ======================================================================
     SOUND: made on 20's context
     ====================================================================== */
  const snd={}; let NB=null, drone=null;
  const AC=()=>(typeof AUDIO!=="undefined" && AUDIO.ctx && AUDIO.on()) ? AUDIO.ctx() : null;
  function nb(){ if(!NB){ NB={white:AUDIO.noise(2,"white"), pink:AUDIO.noise(2,"pink"), brown:AUDIO.noise(3,"brown")}; } return NB; }
  function pv(x, z, k){ const c=camera.position, dx=x-c.x, dz=z-c.z, d=Math.hypot(dx,dz); camera.getWorldDirection(_v1);
    const rx=-_v1.z, rz=_v1.x; return {v:1/(1+d*d/(k||60)), pan:clamp((dx*rx+dz*rz)/(d+1), -0.9, 0.9)}; }
  function out(c, g, pan, outdoor){ let n=g; if(c.createStereoPanner && pan!==undefined){ const p=c.createStereoPanner(); p.pan.value=pan; g.connect(p); n=p; } n.connect(outdoor ? AUDIO.outLP() : AUDIO.master()); }
  function noiseHit(c, t, dur, type, f, q, peak, pan, outdoor, buf){
    const s=c.createBufferSource(); s.buffer=buf||nb().white; const fl=c.createBiquadFilter(); fl.type=type; fl.frequency.value=f; if(q) fl.Q.value=q;
    const g=c.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0008, t+dur);
    s.connect(fl); fl.connect(g); out(c, g, pan, outdoor); s.start(t, Math.random()*1.2, dur+0.05); return fl;
  }
  function osc(c, t, type, f0, f1, dur, peak, pan, outdoor, dest){
    const o=c.createOscillator(); o.type=type; o.frequency.setValueAtTime(f0, t); if(f1) o.frequency.exponentialRampToValueAtTime(f1, t+dur);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t+0.01); g.gain.exponentialRampToValueAtTime(0.0008, t+dur);
    o.connect(g); if(dest) g.connect(dest); else out(c, g, pan, outdoor); o.start(t); o.stop(t+dur+0.05); return o;
  }
  snd.gun=(kind)=>{ const c=AC(); if(!c) return; const t=c.currentTime+0.003;
    const P={pistol:[0.42,2600,0.14,150], shotgun:[0.62,1700,0.30,95], carbine:[0.36,3000,0.11,170], rifle:[0.7,2100,0.42,85]}[kind];
    const fl=noiseHit(c, t, P[2], "lowpass", P[1]*2, 0.7, P[0]); fl.frequency.exponentialRampToValueAtTime(P[1]*0.25, t+P[2]);
    osc(c, t, "sine", P[3], 34, 0.2, P[0]*0.9);
    const inside=indoorsAt(camera.position.x, camera.position.z, camera.position.y) || buriedAt(camera.position.x, camera.position.z, camera.position.y);
    // the woods give it back: a long low echo outdoors, a short hard ring in a room
    if(!inside){ for(const [dl, a] of [[0.24, 0.16],[0.55, 0.09],[1.1, 0.05]]) noiseHit(c, t+dl, 0.5, "lowpass", 600, 0.5, P[0]*a, (Math.random()-0.5)*1.2, false, nb().brown); }
    else noiseHit(c, t+0.03, 0.18, "bandpass", 900, 1.2, P[0]*0.25);
  };
  snd.click=()=>{ const c=AC(); if(!c) return; const t=c.currentTime; noiseHit(c, t, 0.03, "highpass", 3000, 0.7, 0.12); };
  snd.reload=(g, end)=>{ const c=AC(); if(!c) return; const t=c.currentTime;
    if(!end){ noiseHit(c, t+0.15, 0.05, "bandpass", 1800, 3, 0.16); noiseHit(c, t+g.reload*0.55, 0.06, "bandpass", 1400, 3, 0.18); }
    else { noiseHit(c, t, 0.05, "bandpass", 2200, 3, 0.2); noiseHit(c, t+0.08, 0.04, "bandpass", 2600, 4, 0.14); } };
  snd.shell=()=>{ const c=AC(); if(!c) return; noiseHit(c, c.currentTime, 0.05, "bandpass", 1600, 2.5, 0.14); };
  snd.pump=()=>{ const c=AC(); if(!c) return; const t=c.currentTime; noiseHit(c, t, 0.06, "bandpass", 1100, 2, 0.22); noiseHit(c, t+0.16, 0.06, "bandpass", 1500, 2, 0.2); };
  snd.swish=()=>{ const c=AC(); if(!c) return; const fl=noiseHit(c, c.currentTime, 0.22, "bandpass", 500, 1.2, 0.08); fl.frequency.exponentialRampToValueAtTime(1800, c.currentTime+0.2); };
  snd.thud=()=>{ const c=AC(); if(!c) return; const t=c.currentTime; osc(c, t, "sine", 110, 50, 0.16, 0.3); noiseHit(c, t, 0.08, "lowpass", 500, 0.7, 0.2); };
  snd.flesh=(x,z)=>{ const c=AC(); if(!c) return; const q=pv(x,z,200), t=c.currentTime+0.01; noiseHit(c, t, 0.09, "lowpass", 520, 0.8, 0.28*q.v, q.pan, true); osc(c, t, "sine", 85, 45, 0.12, 0.16*q.v, q.pan, true); };
  // a groan: a rough low voice through two formants, sliding down, with a breath under it
  function voice(x, z, f0, dur, peak, rough, k){
    const c=AC(); if(!c) return; const q=pv(x, z, k||60); if(q.v<0.015) return;
    const t=c.currentTime+0.02, o=c.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0*(0.72+Math.random()*0.15), t+dur);
    const lfo=c.createOscillator(), lg=c.createGain(); lfo.frequency.value=4.5+Math.random()*3; lg.gain.value=f0*0.06; lfo.connect(lg); lg.connect(o.frequency);
    const g=c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak*q.v, t+dur*0.25); g.gain.setValueAtTime(peak*q.v, t+dur*0.6); g.gain.exponentialRampToValueAtTime(0.0008, t+dur);
    for(const [f, Q] of [[420+Math.random()*160, 5],[900+Math.random()*300, 7]]){ const b=c.createBiquadFilter(); b.type="bandpass"; b.frequency.value=f; b.Q.value=Q; o.connect(b); b.connect(g); }
    out(c, g, q.pan, true); o.start(t); lfo.start(t); o.stop(t+dur+0.1); lfo.stop(t+dur+0.1);
    const s=c.createBufferSource(); s.buffer=nb().pink; const bf=c.createBiquadFilter(); bf.type="bandpass"; bf.frequency.value=700; bf.Q.value=1;
    const ng=c.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(peak*q.v*rough, t+dur*0.3); ng.gain.exponentialRampToValueAtTime(0.0008, t+dur);
    s.connect(bf); bf.connect(ng); out(c, ng, q.pan, true); s.start(t, Math.random(), dur+0.1);
  }
  snd.groan=(x,z,kind)=>voice(x, z, kind==="brute" ? 62 : kind==="runner" ? 140 : 88+Math.random()*30, 1.1+Math.random()*1.0, kind==="brute" ? 0.32 : 0.22, 0.6);
  snd.snarl=(x,z,kind)=>voice(x, z, kind==="brute" ? 90 : 160, 0.55, 0.32, 1.4, 30);
  snd.shriek=(x,z)=>voice(x, z, 320, 0.9, 0.3, 1.2, 120);
  snd.die=(x,z,you)=>{ if(you){ const c=AC(); if(!c) return; const t=c.currentTime; osc(c, t, "sawtooth", 160, 70, 0.9, 0.12); osc(c, t+0.1, "sine", 55, 30, 1.6, 0.3); return; }
    voice(x, z, 70, 0.8, 0.22, 1.0, 40); };
  snd.hurt=()=>{ const c=AC(); if(!c) return; const t=c.currentTime; osc(c, t, "sawtooth", 210, 130, 0.22, 0.09); noiseHit(c, t, 0.12, "bandpass", 650, 1.5, 0.12); osc(c, t, "sine", 70, 40, 0.18, 0.25); };
  snd.pick=(k)=>{ const c=AC(); if(!c) return; const t=c.currentTime;
    if(k===0){ noiseHit(c, t, 0.04, "bandpass", 2400, 4, 0.14); noiseHit(c, t+0.07, 0.04, "bandpass", 2000, 4, 0.12); }
    else if(k===1){ osc(c, t, "sine", 520, 780, 0.18, 0.08); osc(c, t+0.1, "sine", 780, 1040, 0.22, 0.07); }
    else { noiseHit(c, t, 0.06, "bandpass", 1300, 2, 0.2); osc(c, t+0.05, "triangle", 330, 330, 0.3, 0.06); } };
  // a car through one: a heavy blow, a crack, the body against the glass
  snd.crunch=()=>{ const c=AC(); if(!c) return; const t=c.currentTime;
    osc(c, t, "sine", 95, 32, 0.32, 0.55); noiseHit(c, t, 0.18, "lowpass", 900, 0.8, 0.45); noiseHit(c, t+0.01, 0.04, "highpass", 2400, 0.7, 0.25);
    noiseHit(c, t+0.09, 0.12, "bandpass", 420, 1.6, 0.22); };
  snd.tink=(x,z)=>{ const c=AC(); if(!c) return; const q=pv(x, z, 80); osc(c, c.currentTime, "triangle", 1900, 1700, 0.08, 0.05*q.v, q.pan, true); };
  snd.beep=(x,z)=>{ const c=AC(); if(!c) return; const q=pv(x, z, 140); osc(c, c.currentTime, "square", 1650, 1650, 0.07, 0.06*q.v+0.01, q.pan, true); };
  snd.boom=(x,z)=>{ const c=AC(); if(!c) return; const q=pv(x, z, 1600), t=c.currentTime+0.01, v=0.35+0.55*q.v;
    osc(c, t, "sine", 58, 22, 1.3, 0.8*v); noiseHit(c, t, 1.3, "lowpass", 1400, 0.6, 0.75*v, q.pan, false, nb().brown);
    noiseHit(c, t, 0.12, "lowpass", 4000, 0.5, 0.6*v, q.pan); for(const [dl, a] of [[0.35, 0.22],[0.8, 0.12],[1.5, 0.06]]) noiseHit(c, t+dl, 0.9, "lowpass", 500, 0.5, v*a, (Math.random()-0.5), false, nb().brown); };
  snd.horde=(a)=>{ const px=player.pos.x, pz=player.pos.z; for(let k=0;k<4;k++){ const b=a+(Math.random()-0.5)*0.6;
      setTimeout(()=>voice(px+Math.sin(b)*70, pz+Math.cos(b)*70, 260+Math.random()*120, 1.0, 0.45, 1.2, 1800), k*350+Math.random()*200); } };
  snd.heart=()=>{ const c=AC(); if(!c) return; const t=c.currentTime; osc(c, t, "sine", 58, 40, 0.14, 0.32); osc(c, t+0.24, "sine", 52, 38, 0.16, 0.24); };
  // under it all: a wind that never lets up, a low drone, and far off, now and then, one of them
  snd.ambience=(on)=>{ const c=AC();
    if(on && c && !drone){ const s=c.createBufferSource(); s.buffer=nb().brown; s.loop=true; const b=c.createBiquadFilter(); b.type="bandpass"; b.frequency.value=170; b.Q.value=0.5;
      const g=c.createGain(); g.gain.value=0; g.gain.setTargetAtTime(0.09, c.currentTime, 2); const o=c.createOscillator(); o.type="sine"; o.frequency.value=41; const og=c.createGain(); og.gain.value=0.025;
      s.connect(b); b.connect(g); g.connect(AUDIO.master()); o.connect(og); og.connect(g); s.start(); o.start(); drone={s:s, o:o, g:g, b:b}; }
    if(!on && drone){ try{ drone.s.stop(); drone.o.stop(); }catch(e){} drone=null; } };

  /* ======================================================================
     THE SCREEN: health, ammunition, threat, the red at the edges
     ====================================================================== */
  const hud={}; let FEED=[];
  function buildHUD(){
    const st=document.createElement("style"); st.textContent=`
      #zhud{position:fixed;inset:0;pointer-events:none;z-index:11;display:none;font-family:"Oswald",Arial,sans-serif;color:#e8e2d0;letter-spacing:.06em}
      #zhud.on{display:block}
      #zcross{position:absolute;left:50%;top:50%;width:0;height:0}
      #zcross i{position:absolute;background:rgba(232,226,208,.85);box-shadow:0 0 3px rgba(0,0,0,.8)}
      #zcross i:nth-child(1),#zcross i:nth-child(2){width:2px;height:9px;left:-1px}
      #zcross i:nth-child(3),#zcross i:nth-child(4){width:9px;height:2px;top:-1px}
      #zhit{position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;opacity:0}
      #zhit:before,#zhit:after{content:"";position:absolute;left:10px;top:-2px;width:2px;height:26px;background:#fff;transform:rotate(45deg)}
      #zhit:after{transform:rotate(-45deg)}
      #zhit.kill:before,#zhit.kill:after{background:#e02a1a}
      #zleft{position:absolute;left:26px;bottom:22px;text-shadow:0 2px 6px #000}
      #zleft .k{font-size:11px;letter-spacing:.32em;color:#9fb46a}
      #zhp{font-size:54px;font-weight:700;line-height:1}
      #zbar{width:230px;height:8px;background:rgba(0,0,0,.55);border:1px solid rgba(232,226,208,.35);margin-top:4px}
      #zbar b{display:block;height:100%;background:linear-gradient(90deg,#7a0e08,#c8281c)}
      #zthreat{margin-top:12px;font-size:13px;letter-spacing:.28em;color:#c8b070}
      #zthreat span{color:#e02a1a;letter-spacing:.12em}
      #zstats{margin-top:3px;font-family:"JetBrains Mono",monospace;font-size:11px;color:#a8a294;letter-spacing:.14em}
      #ztop{position:absolute;right:28px;top:22px;text-align:right;text-shadow:0 2px 6px #000}
      #zscore{font-size:30px;font-weight:700;line-height:1;color:#e8e2d0}
      #zscore small{font-size:11px;letter-spacing:.3em;color:#9fb46a;margin-right:8px;font-weight:500}
      #zmult{font-size:15px;letter-spacing:.2em;color:#e8c860;height:18px}
      #zbombs{margin-top:6px;font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.16em;color:#e8a060}
      #zsplat{position:absolute;inset:0;opacity:0}
      #zright{position:absolute;right:28px;bottom:22px;text-align:right;text-shadow:0 2px 6px #000}
      #zgun{font-size:15px;letter-spacing:.3em;color:#9fb46a}
      #zammo{font-size:50px;font-weight:700;line-height:1.05}
      #zammo small{font-size:22px;color:#a8a294;font-weight:500}
      #zatype{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.2em;color:#a8a294}
      #zslots{margin-top:8px;font-family:"JetBrains Mono",monospace;font-size:10px;letter-spacing:.12em}
      #zslots span{display:inline-block;margin-left:8px;padding:2px 6px;border:1px solid rgba(232,226,208,.18);color:rgba(232,226,208,.25)}
      #zslots span.have{color:#cfc9b8;border-color:rgba(232,226,208,.45)}
      #zslots span.cur{color:#14120e;background:#c8b070;border-color:#c8b070}
      #zfeed{position:absolute;right:30px;top:42%;text-align:right;font-size:15px;letter-spacing:.18em;text-shadow:0 2px 5px #000}
      #zfeed div{transition:opacity .6s}
      #zdmg{position:absolute;inset:0;opacity:0;background:radial-gradient(110% 105% at 50% 50%, rgba(120,0,0,0) 52%, rgba(150,8,4,.85) 100%)}
      #zdir{position:absolute;left:50%;top:50%;width:0;height:0;opacity:0}
      #zdir:before{content:"";position:absolute;left:-150px;top:-150px;width:300px;height:300px;border-radius:50%;box-sizing:border-box;
        border:6px solid transparent;border-top-color:rgba(220,30,18,.9);filter:drop-shadow(0 0 6px rgba(0,0,0,.8))}
      #zscope{position:absolute;inset:0;display:none;background:radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 34vh, #000 34.4vh)}
      #zscope:before{content:"";position:absolute;left:50%;top:16vh;bottom:16vh;width:1px;background:rgba(0,0,0,.85)}
      #zscope:after{content:"";position:absolute;top:50%;left:calc(50% - 34vh);right:calc(50% - 34vh);height:1px;background:rgba(0,0,0,.85)}
      #zbanner{position:absolute;left:0;right:0;top:30%;text-align:center;opacity:0;transition:opacity .8s;text-shadow:0 3px 14px #000}
      #zbanner .a{font-size:44px;font-weight:700;letter-spacing:.14em;color:#d8d0b8}
      #zbanner .b{font-size:clamp(10px,1.3vw,14px);letter-spacing:.3em;color:#9fb46a;margin-top:6px;padding:0 16px;line-height:1.8;white-space:pre-line}
      #zdead{position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;
        background:radial-gradient(90% 90% at 50% 50%, rgba(40,0,0,.35), rgba(20,0,0,.85))}
      #zdead h1{font-size:96px;font-weight:700;letter-spacing:.2em;color:#b8180e;text-shadow:0 0 30px #000}
      #zdead p{font-family:"JetBrains Mono",monospace;font-size:13px;letter-spacing:.24em;color:#d8d0b8;margin-top:14px}
      body.zmode #dot{display:none}
      body.zmode #vig{background:radial-gradient(115% 115% at 50% 46%, transparent 42%, rgba(4,10,4,.78) 100%)}`;
    document.head.appendChild(st);
    const d=document.createElement("div"); d.id="zhud";
    d.innerHTML=`<div id="zsplat"></div><div id="zdmg"></div><div id="zdir"></div><div id="zscope"></div>
      <div id="ztop"><div id="zscore"></div><div id="zmult"></div></div>
      <div id="zcross"><i></i><i></i><i></i><i></i></div><div id="zhit"></div>
      <div id="zleft"><div class="k">HEALTH</div><div id="zhp">100</div><div id="zbar"><b></b></div><div id="zthreat">THREAT <span></span></div><div id="zstats"></div></div>
      <div id="zright"><div id="zgun"></div><div id="zammo"></div><div id="zatype"></div><div id="zslots"></div><div id="zbombs"></div></div>
      <div id="zfeed"></div><div id="zbanner"><div class="a"></div><div class="b"></div></div>
      <div id="zdead"><h1>YOU DIED</h1><p id="zdstats"></p><p>ENTER · TRY AGAIN &nbsp;&nbsp; Z · LEAVE ZOMBIE MODE</p></div>`;
    document.body.appendChild(d);
    const $=id=>document.getElementById(id);
    Object.assign(hud, {el:d, hp:$("zhp"), bar:d.querySelector("#zbar b"), threat:d.querySelector("#zthreat span"), stats:$("zstats"), gunEl:$("zgun"), ammo:$("zammo"),
      atype:$("zatype"), slots:$("zslots"), feed:$("zfeed"), dmg:$("zdmg"), dirEl:$("zdir"), scope:$("zscope"), cross:$("zcross"), hit:$("zhit"),
      banner:$("zbanner"), deadEl:$("zdead"), dstats:$("zdstats"), score:$("zscore"), mult:$("zmult"), bombsEl:$("zbombs"), splatEl:$("zsplat"), last:{}});
    // blood on the screen: a few blotches, thrown somewhere new each time it starts
    let _sp=0;
    hud.splat=(v)=>{ if(v>0.3 && _sp<0.05){ const g=[]; for(let k=0;k<7;k++){ const x=(Math.random()*100).toFixed(0), y=(Math.random()*100).toFixed(0), r=(8+Math.random()*16).toFixed(0);
        g.push("radial-gradient(circle at "+x+"% "+y+"%, rgba(90,4,2,.9) 0, rgba(70,2,0,.75) "+(r*0.5).toFixed(0)+"vmin, rgba(60,0,0,0) "+r+"vmin)"); }
      hud.splatEl.style.background=g.join(","); }
      _sp=v; hud.splatEl.style.opacity=Math.min(0.9, v); };
    hud.cross.ch=[...hud.cross.children];
    hud.gun=()=>{ hud.last.g=null; };
    hud.dead=(on)=>{ hud.deadEl.style.display=on ? "flex" : "none";
      if(on) hud.dstats.textContent="SCORE "+Z.score+"  ·  SURVIVED "+clock(Z.t)+"  ·  "+Z.kills+" KILLED  ·  THREAT "+Z.level+
        (Z.newBest ? "  ·  A NEW BEST" : Z.best ? "  ·  BEST "+Z.best.score : ""); };
  }
  const clock=t=>String(Math.floor(t/60)).padStart(2,"0")+":"+String(Math.floor(t%60)).padStart(2,"0");
  function feed(text, col){ const e=document.createElement("div"); e.textContent=text; e.style.color=col||"#e8e2d0"; hud.feed.appendChild(e);
    FEED.push({e:e, t:2.6}); while(FEED.length>5){ FEED.shift().e.remove(); } }
  let bannerT=0;
  function banner(a, b){ hud.banner.querySelector(".a").textContent=a; hud.banner.querySelector(".b").textContent=b||""; hud.banner.style.opacity=1; bannerT=3.2; }
  function updateHUD(dt){
    const g=G(), L=hud.last;
    const hp=Math.ceil(Z.hp); if(L.hp!==hp){ L.hp=hp; hud.hp.textContent=hp; hud.bar.style.width=hp+"%"; hud.hp.style.color=hp<30 ? "#e0402a" : "#e8e2d0"; }
    const ammo=S.mag[g.id]+"|"+S.ammo[g.ammo]+"|"+g.id+"|"+(S.reloading?1:0);
    if(L.ammo!==ammo || L.g!==g.id){ L.ammo=ammo; L.g=g.id; hud.gunEl.textContent=g.name;
      hud.ammo.innerHTML=(S.reloading ? "<small>RELOADING</small>" : S.mag[g.id]+" <small>/ "+S.ammo[g.ammo]+"</small>");
      hud.atype.textContent=g.ammo;
      hud.slots.innerHTML=GUNS.map(q=>"<span class='"+(q.id===S.cur ? "cur" : S.have[q.id] ? "have" : "")+"'>"+q.slot+" "+q.name.split(" ").pop()+"</span>").join(""); }
    const lv=Z.level; if(L.lv!==lv){ L.lv=lv; hud.threat.textContent="■".repeat(Math.min(lv,12))+"□".repeat(Math.max(0,12-lv)); }
    const st=clock(Z.t)+"  ·  "+Z.kills+" KILLED"; if(L.st!==st){ L.st=st; hud.stats.textContent=st; }
    if(L.sc!==Z.score){ L.sc=Z.score; hud.score.innerHTML="<small>SCORE</small>"+Z.score; }
    const mult=S.streakT>0 ? Math.min(5, 1+Math.floor((S.streak-1)/3)) : 1, mt=mult>1 ? "STREAK ×"+mult : ""; if(L.mt!==mt){ L.mt=mt; hud.mult.textContent=mt; }
    const bt=S.bombs>0 ? "F · PIPE BOMB ×"+S.bombs : ""; if(L.bt!==bt){ L.bt=bt; hud.bombsEl.textContent=bt; }
    // the crosshair opens with the spread, and goes when you aim down the sights
    const gap=5+spreadNow()*520, op=(1-S.ads)*(S.sprint>0.5 ? 0.2 : 1);
    const ch=hud.cross.ch; ch[0].style.top=(-gap-9)+"px"; ch[1].style.top=gap+"px"; ch[2].style.left=(-gap-9)+"px"; ch[3].style.left=gap+"px"; hud.cross.style.opacity=op;
    S.hitT=Math.max(0, S.hitT-dt); hud.hit.style.opacity=S.hitT>0 ? 1 : 0; hud.hit.className=S.hitKill && S.hitT>0 ? "kill" : ""; if(S.hitT<=0) S.hitKill=false;
    S.dmgFlash=Math.max(0, S.dmgFlash-dt*1.2);
    const low=Z.hp<30 && !Z.dead ? (0.25+0.2*Math.sin(Z.t*6))*(1-Z.hp/30) : 0;
    hud.dmg.style.opacity=Math.min(1, S.dmgFlash+low+(Z.dead ? 0.7 : 0));
    S.dmgDirT=Math.max(0, S.dmgDirT-dt); hud.dirEl.style.opacity=Math.min(1, S.dmgDirT); hud.dirEl.style.transform="rotate("+S.dmgDir+"rad)";
    hud.scope.style.display=g.zoom && S.ads>0.85 && !Z.dead ? "block" : "none";
    for(let i=FEED.length-1;i>=0;i--){ const f=FEED[i]; f.t-=dt; if(f.t<0.6) f.e.style.opacity=Math.max(0, f.t/0.6); if(f.t<=0){ f.e.remove(); FEED.splice(i,1); } }
    if(bannerT>0){ bannerT-=dt; if(bannerT<=0) hud.banner.style.opacity=0; }
  }

  /* ======================================================================
     THE WORLD WITHOUT THE LIVING
     ====================================================================== */
  let HIDDEN=[];
  function hideLiving(on){
    if(on){ scene.traverse(o=>{ if(o.isSkinnedMesh && o.material===PEOPLE_MAT && o.visible){ o.visible=false; HIDDEN.push(o); } }); }
    else { for(const o of HIDDEN) o.visible=true; HIDDEN=[]; }
  }
  function hideTraffic(on){
    for(const v of TRAFFIC){
      // (and its collider out of the way with it: hidden, it would still stand in the road where it stopped, solid
      // and unseen. Traffic stands still while this lasts, and placeVehicle (05) puts it back when it moves again)
      if(on){ if(!(v.route && v.route.parked) && v.g.visible){ v.g.visible=false; v._zHid=true; v.col.y0=-900; v.col.y1=-899; } }
      else if(v._zHid){ v.g.visible=true; v._zHid=false; }
    }
  }
  let _hudPanels=null;
  Z.atmos=function(dt, dn, under){
    Z.fade=Math.min(1, Z.fade+dt*0.5);
    const k=Z.fade*(1-under), night=dn.nightAmount;
    // (by night not black: the fog a dark moonlit green-grey you can make shapes out against, and further off)
    _c1.setHex(0x4f5646).lerp(_c2.setHex(0x1d251f), Math.min(1, night*1.1));
    scene.fog.color.lerp(_c1, 0.85*k);
    // and the higher you are the further you see: up the water tower (14x) the fog thins to show the country
    const up=Math.max(0, camera.position.y-groundY(camera.position.x, camera.position.z)-4);
    scene.fog.near=lerp(scene.fog.near, 3+up*1.5, k); scene.fog.far=lerp(scene.fog.far, 95+75*(1-night)+40*night+up*9, k);
    _bg.copy(scene.background && scene.background.isColor ? scene.background : _c1).lerp(_c1, 0.8*k); scene.background=_bg;
    HAZE_U.w*=1-k;
    hemi.intensity*=1-0.38*k; hemi.color.lerp(_c3.setHex(0xa9b59a), 0.45*k); hemi.groundColor.lerp(_c4.setHex(0x2a2a1e), 0.4*k);
    key.intensity*=1-0.62*k; key.color.lerp(_c5.setHex(0xb8c0a0), 0.5*k);
    amb.intensity*=1-0.2*k;
    // a fill at night so it is gloom and not blackout: what the moon would give through cloud, cold and green
    hemi.intensity+=0.16*night*k; amb.intensity+=0.07*night*k; hemi.color.lerp(_c3.setHex(0x8fa294), 0.3*night*k);
  };
  const _c8=new T.Color();
  const _c1=new T.Color(), _c2=new T.Color(), _c3=new T.Color(), _c4=new T.Color(), _c5=new T.Color(), _bg=new T.Color(), _c6=new T.Color(), _c7=new T.Color();
  // and the sky itself comes down dark green-grey, all but black at night (16b's skyWeather calls this as it paints)
  Z.sky=function(img, day, set, night){
    if(!Z.on) return; const k=Z.fade, n=Math.min(1, night+set*0.5);
    for(const [kk, d, nn] of [["top",0x30352d,0x0e130f],["mid",0x40463b,0x141a15],["low",0x4d5347,0x19201a],["hz",0x565c4e,0x1d251f]]){
      _c6.setHex(d).lerp(_c7.setHex(nn), n); img[kk].lerp(_c6, 0.82*k); } };
  // the gun's flash lights the world: a lamp in 16's pool, at the gun, as bright as its mod says (and only while it is)
  const FLASH={x:0, y:0, z:0, color:0xffc27a, intensity:3.0, dist:16, decay:1.4, indoor:true, mod:{v:0}, under:false};
  LAMPS.push(FLASH);

  /* ======================================================================
     THE RUN
     ====================================================================== */
  function resetRun(){
    Z.hp=100; Z.t=0; Z.kills=0; Z.level=1; Z.dead=false; Z.score=0; Z.ts=1;
    S.bombs=1; S.throwT=0; S.streak=0; S.streakT=0; S.splat=0; S.tsT=0; S.horde=null;
    for(const b of BOMBS) scene.remove(b.g); BOMBS.length=0; BOOM.mod.v=0;
    S.have={pistol:true}; S.mag={pistol:15, shotgun:0, carbine:0, rifle:0}; S.ammo={"9MM":45, "12 GAUGE":0, "5.56":0, ".30-06":0};
    S.cur="pistol"; S.next=null; S.reloading=false; S.switchT=0; S.cool=0; S.ads=0; S.fired=false; S.melee=0; S.dmgFlash=0; S.spawnT=8; S.supplyT=20; S.levelShown=1;
    for(const zb of ZS) recycle(zb);
    for(let i=PK.length-1;i>=0;i--){ const p=PK[i]; if(p.dyn){ scene.remove(p.g); PK.splice(i,1); }
      else if(p.cache){ if(p.kind!==p.kind0){ scene.remove(p.g); p.kind=p.kind0; p.g=pickupMesh(p.kind); p.g.position.set(p.x, p.y, p.z); p.g.userData.glow.position.y=0.03; scene.add(p.g); }
        p.gone=false; p.g.visible=true; } }
    if(blood.decals) for(const m of blood.decals) m.visible=false;
    if(blood.scs) for(const m of blood.scs) m.visible=false;
    Z.trail.length=0; S.trailAt=null;
    if(vm.show){ vm.show("pistol"); }
    if(hud.dead){ hud.dead(false); hud.last={}; }
  }
  let built=false;
  function build(){
    if(built) return; built=true;
    buildVM(); buildFX(); buildHUD(); buildCaches();
    // a crowd of them made now, while you are looking at the start, not in the middle of a fight (each is a mesh of its own)
    for(const [kind, n] of [["walker", 14], ["runner", 4], ["brute", 2]]) for(let k=0;k<n;k++) ZS.push(buildZombie(kind));
    const dom=renderer.domElement;
    dom.addEventListener("mousedown", e=>{ if(!Z.on || Z.dead) return; if(e.button===0) S.fireHeld=true; else if(e.button===2) S.aimHeld=true; });
    addEventListener("mouseup", e=>{ if(e.button===0){ S.fireHeld=false; } else if(e.button===2) S.aimHeld=false; });
    dom.addEventListener("contextmenu", e=>{ if(Z.on){ e.preventDefault(); e.stopPropagation(); } });
    addEventListener("wheel", e=>{ if(Z.on && !Z.dead) cycleGun(Math.sign(e.deltaY)); }, {passive:true});
  }
  Z.start=function(){
    if(Z.on) return;
    if(!started) begin();
    build();
    if(droneMode) setDrone(false);
    if(seated) standUp();
    Z.on=true; Z.fade=0; resetRun();
    hideLiving(true); hideTraffic(true);
    WEATHER.set("dread", true); WEATHER.hold=1e9;
    { const h=DayNight.state.hour; if(h>6.5 && h<17.2) DayNight.setHour(17.4); }
    renderer.domElement.style.filter="saturate(0.52) contrast(1.08) brightness(0.98)";        // (the colour out of it; the green is in the light and the fog)
    document.body.classList.add("zmode"); hud.el.classList.add("on");
    _hudPanels=["mast","keys","cluster","plan"].map(id=>document.getElementById(id)).filter(Boolean);
    for(const el of _hudPanels) el.style.display="none";
    S.lastYaw=player.yaw; S.lastPitch=player.pitch;
    snd.ambience(true);
    const best=loadBest();
    banner("THEY'RE COMING", "CLICK TO SHOOT  ·  R RELOAD  ·  RIGHT BUTTON AIMS  ·  F PIPE BOMB  ·  L LIGHT"+
           (best ? "\nYOUR BEST  "+best.score+"  ·  "+clock(best.t) : ""));
  };
  Z.stop=function(){
    if(!Z.on) return;
    Z.on=false; Z.dead=false;
    for(const zb of ZS) recycle(zb);
    for(let i=PK.length-1;i>=0;i--){ PK[i].g.visible=false; if(PK[i].dyn){ scene.remove(PK[i].g); PK.splice(i,1); } }
    if(blood.decals) for(const m of blood.decals) m.visible=false;
    if(blood.P){ blood.P.n=0; dust.P.n=0; blood.P.pts.visible=false; dust.P.pts.visible=false; }
    FLASH.mod.v=0; BOOM.mod.v=0; Z.ts=1;
    for(const b of BOMBS) scene.remove(b.g); BOMBS.length=0;
    hideLiving(false); hideTraffic(false);
    WEATHER.hold=0; WEATHER.set("cloudy", true); WEATHER.hold=0;
    renderer.domElement.style.filter="";
    document.body.classList.remove("zmode"); hud.el.classList.remove("on"); hud.dead(false);
    if(_hudPanels) for(const el of _hudPanels) el.style.display=hudOn ? "" : "none";
    camera.fov=fov; camera.updateProjectionMatrix();
    snd.ambience(false);
    toast("ZOMBIE MODE OFF", "#cfe0d4");
  };
  Z.key=function(e){
    if(e.code==="KeyZ" && !e.repeat){ if(!started) return false; if(Z.on) Z.stop(); else Z.start(); return true; }
    if(!Z.on) return false;
    if(Z.dead){ if(e.code==="Enter" || e.code==="Space"){ if(S.deadT>1.2){ resetRun(); banner("AGAIN", "THEY'RE STILL OUT THERE"); } } return e.code!=="KeyH" && e.code!=="KeyG"; }
    const k=e.code;
    if(/^Digit[1-4]$/.test(k)){ select(+k.slice(5)); return true; }
    if(k==="KeyR"){ startReload(); return true; }
    if(k==="KeyV"){ melee(); return true; }
    if(k==="KeyF"){ throwBomb(); return true; }                                  // (a pipe bomb; no drone in this)
    if(k==="KeyX" || k==="KeyP" || k==="KeyT"){ return true; }               // (no wrecks, power cuts or storms on top of it)
    return false;
  };

  /* ---- every frame, after the world has moved and before it is drawn (19) ---- */
  let _poseFrame=0;
  Z.frame=function(dt, now, dark){
    dt=Math.min(dt, 0.05);
    // a hit's moment of stillness (19 slows the world by Z.ts while it lasts), timed in real time
    if(S.tsT>0){ S.tsT-=dt; if(S.tsT<=0) Z.ts=1; }
    dt*=Z.ts;
    const light=clamp(1-dark*0.85, 0.12, 1);
    if(!Z.dead){ Z.t+=dt;
      const lv=Math.min(12, 1+Math.floor(Z.t/75));
      if(lv>Z.level){ Z.level=lv;
        if(lv>=2 && !S.horde) startHorde(lv); else banner("THREAT "+lv, lv===3 ? "RUNNERS" : lv===5 ? "BRUTES" : "MORE OF THEM"); }
    }else S.deadT+=dt;
    // your trail, a point every three metres you walk (they come along it)
    if(!driving && !(typeof BOAT!=="undefined" && BOAT.on) && !Z.dead){ const q=S.trailAt;
      if(!q || Math.hypot(player.pos.x-q[0], player.pos.z-q[2])>3 || Math.abs(player.feetY-q[1])>1.2){
        S.trailAt=[player.pos.x, player.feetY, player.pos.z]; Z.trail.push(S.trailAt); if(Z.trail.length>320) Z.trail.shift(); } }
    // more of them, while there are fewer than the threat wants
    if(!Z.freeze){ S.spawnT-=dt;
      if(S.spawnT<=0 && !Z.dead){ S.spawnT=spawnEvery()*(0.7+Math.random()*0.6);
        if(alive().length<wantAlive()){ const q=spawnPoint(); if(q) spawnZombie(q.x, q.z, q.y, pickKind()); } } }
    // the dead: move, pose, and are seen to
    _poseFrame++;
    const px=player.pos.x, pz=player.pos.z;
    for(const zb of ZS){ if(!zb.live) continue;
      const d=Math.hypot(zb.x-px, zb.z-pz);
      if(zb.state==="dead"){
        if(zb.fly){ flyStep(zb, dt); poseZombie(zb, false); continue; }
        zb.dieT+=dt; zb.corpseT+=dt;
        if(zb.dieT>0.75 && !zb.pooled){ zb.pooled=true;
          const f=zb.flung ? 0 : zb.fall*0.85*zb.h, cx=zb.x+Math.sin(zb.yaw)*f, cz=zb.z+Math.cos(zb.yaw)*f; blood.decal(cx, cz, surfaceY(cx, cz, zb.y+0.5), 0.9+Math.random()*0.6); }
        if(zb.corpseT>26){ zb.sink=(zb.sink||0)+dt*0.25; if(zb.sink>0.6) { recycle(zb); continue; } }
        if(d>170){ recycle(zb); continue; }
        poseZombie(zb, false); continue; }
      if(d>150){ recycle(zb); continue; }
      const moving=Z.freeze ? zb.alert && !zb.down : stepZombie(zb, dt);    // (frozen, for a still picture: in their stride)
      if(Z.freeze && moving) zb.ph=(zb.ph+dt*0.8)%1, zb.t+=dt;
      if(d<70 || ((_poseFrame+zb.P.seed*7)|0)%3===0) poseZombie(zb, moving);
    }
    // they keep out of one another, and out of you
    const L=ZS.filter(q=>q.live && q.state!=="dead");
    for(let i=0;i<L.length;i++){ const a=L[i];
      for(let j=i+1;j<L.length;j++){ const b=L[j], dx=b.x-a.x, dz=b.z-a.z, d2=dx*dx+dz*dz;
        if(d2<0.36 && d2>1e-6 && Math.abs(a.y-b.y)<1.2){ const d=Math.sqrt(d2), p=(0.6-d)*0.5, ux=dx/d, uz=dz/d;
          if(!zHit(a.x-ux*p, a.z-uz*p, a.y, 0.28)){ a.x-=ux*p; a.z-=uz*p; } if(!zHit(b.x+ux*p, b.z+uz*p, b.y, 0.28)){ b.x+=ux*p; b.z+=uz*p; } } }
      const dx=a.x-px, dz=a.z-pz, d=Math.hypot(dx,dz);
      if(d<0.6 && d>1e-4 && Math.abs(a.y-player.feetY)<1.2 && !driving){ const p=0.6-d; if(!zHit(a.x+dx/d*p, a.z+dz/d*p, a.y, 0.28)){ a.x+=dx/d*p; a.z+=dz/d*p; } }
    }
    // a car through them
    if(driving) carVsDead(dt, L);
    // the pipe bombs, and a horde when one is coming
    updateBombs(dt); updateHorde(dt);
    S.streakT=Math.max(0, S.streakT-dt); if(S.streakT<=0) S.streak=0;
    updateGun(dt);
    updateVM(dt);
    updatePickups(dt);
    updateFX(dt, light);
    updateHUD(dt);
    // the flash lamp at the gun
    camera.getWorldDirection(_v1);
    FLASH.x=camera.position.x+_v1.x*0.7; FLASH.y=camera.position.y+_v1.y*0.7; FLASH.z=camera.position.z+_v1.z*0.7;
    FLASH.under=buriedAt(camera.position.x, camera.position.z, camera.position.y); FLASH.mod.v=S.flashT>0 ? 1 : 0;
    // the ADS view: tighter, a lot tighter through the rifle's scope
    { const g=G(), want=fov*(1-S.ads*(g.zoom ? 1-g.zoom : 0.2)); if(Math.abs(camera.fov-want)>0.01){ camera.fov=want; camera.updateProjectionMatrix(); } }
    // the blood on the screen from a hit close to, or a car through them
    S.splat=Math.max(0, S.splat-dt*0.55); hud.splat(S.splat);
    // hit: the view jolts; down: the view goes to the ground
    if(S.shake>0){ S.shake=Math.max(0, S.shake-dt*2.5); const k=S.shake*S.shake*0.06; camera.position.x+=(Math.random()-0.5)*k; camera.position.y+=(Math.random()-0.5)*k; camera.position.z+=(Math.random()-0.5)*k; }
    if(Z.dead){ const k=Math.min(1, S.deadT/0.9); camera.position.y-=k*1.35; camera.rotateZ(k*0.9); camera.rotateX(-k*0.25); }
    // no birds in it, nobody walking (anyone new hidden too)
    for(const b of BIRDS) b.s.visible=false; if(VULTURE) VULTURE.s.visible=false;
    S.rehideT-=dt; if(S.rehideT<=0){ S.rehideT=3; hideLiving(true); }
    // the heart, when it is bad; the far-off groans
    if(Z.hp<30 && !Z.dead){ S.heartT-=dt; if(S.heartT<=0){ S.heartT=0.85; snd.heart(); } }
    S.groanT-=dt; if(S.groanT<=0){ S.groanT=4+Math.random()*7; const a=Math.random()*6.28; voice(px+Math.sin(a)*70, pz+Math.cos(a)*70, 80+Math.random()*40, 1.6, 0.5, 0.5, 900); }
  };
  // for tools and testing: put one down, and see what there is
  Z.debug={ZS:ZS, PK:PK, S:S, place:(kind, x, z)=>{ const y=surfaceY(x, z, groundY(x,z)+0.6); return placePickup(kind, x, z, y, {dyn:true, life:600}); }, clear:()=>{ for(const zb of ZS) recycle(zb); if(blood.decals) for(const m of blood.decals) m.visible=false; }, spawnAt:(x, z, kind, yaw, alert)=>{ const y=surfaceY(x, z, groundY(x,z)+0.6), zb=spawnZombie(x, z, y, kind||"walker", yaw); if(zb && alert) zb.alert=true; return zb; },
           give:(id)=>{ const g=GUN(id); S.have[id]=true; S.mag[id]=g.mag; S.ammo[g.ammo]=AMMO_MAX[g.ammo]; select(g.slot); }, fire:fire, hurt:hurtPlayer, rayWorld:rayWorld, boom:BOOM,
           bomb:(x, z, fuse)=>{ S.bombs++; S.throwT=0; throwBomb(); const b=BOMBS[BOMBS.length-1]; if(!b) return null; b.x=x; b.z=z; b.y=surfaceY(x, z, groundY(x,z)+0.6)+0.05;
             b.vx=b.vy=b.vz=0; b.fuse=fuse||3.5; return b; }, kill:(zb, head)=>{ _v2.set(0,0,-1); killZombie(zb, !!head, _v2); }};
  return Z;
})();
// from the start card: straight into it
{ const zb=document.getElementById("zgo"); if(zb) zb.addEventListener("click", e=>{ e.stopPropagation(); ZOMBIE.start(); }); }
if(window.REST) REST.zombie=ZOMBIE;
