"use strict";
/* REST AREA · 14i-trucker.js
   the driver who comes over from his rig in the night for a coffee
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14i · THE TRUCKER IN SLIPPERS
   Between half past ten at night and five in the morning, once in a while,
   the door of a cab a few stalls down from the crosswalk opens and a
   driver climbs down in sweatpants, a flannel shirt, a cap and his
   slippers, with his own steel mug, because the machine has been out of
   cups since July. He shuffles down the side of his rig, across the aisle
   on the stripes and into the vending room, sets the mug in the bay,
   punches his button, waits through the brewing, looks at the board,
   takes his coffee, sometimes stands at the sandwiches a while, and goes
   back the way he came and up into his cab. If you are in the room he
   tells you about the cups.
   ---------------------------------------------------------------------- */
const SLIPPERS={p:null, told:false};
(function trucker(){
  if(typeof VENDHUT_RT==="undefined" || !VENDHUT_RT.coffee) return;
  // his rig: a taken stall south of the crosswalk with nobody parked on its driver's side
  const cand=TRUCK_STALLS.filter(s=>s.taken && s.k!==WALKIN.stall && s.z0>3);
  cand.sort((a,b)=>{ const fa=(TRUCK_STALLS[a.k-1]&&TRUCK_STALLS[a.k-1].taken)?1:0, fb=(TRUCK_STALLS[b.k-1]&&TRUCK_STALLS[b.k-1].taken)?1:0;
    return (fa-fb)*100 + (a.z0-b.z0); });
  const st=cand[0]; if(!st) return;
  const S=VEH_SPEC[[5,6,5,7,6,5][st.k%6]], back=1.2-S.tail, cx=st.x0+st.dx*back, cz=st.z0+st.dz*back;
  const xf=XF(cx, cz, st.yaw), L=(lx,lz)=>({x:xf.x(lx,lz), z:xf.z(lx,lz)});
  const C=VENDHUT_RT.coffee, V=VENDHUT;
  // the way over: off the step, down the driver's side, along the aisle to the stripes, across, in
  const door=L(1.55, 7.3), out=[door, L(2.15, 7.3), L(2.15, S.tail-0.9), {x:TRUCKLOT.aisle0+0.6, z:0.5}, {x:V.x0-2.2, z:0.5},
    {x:V.x0-0.5, z:0.5}, {x:V.x0+0.7, z:0.35}, {x:C.x-0.06, z:C.z+0.48}];
  const SAND={x:C.x+0.98, z:C.z+0.50};
  const P=buildPerson({h:1.05, skin:SKINS[1], hair:HAIRS[4], shirt:"#7a2a22", pants:"#7f8184", shoes:"#6b5440", long:true, cap:"#2f4a6e"});
  P.g.visible=false;
  // the flannel's checks are too fine to see from across a lot; the mug is not
  const mug=new T.Group();
  const mb=new T.Mesh(new T.CylinderGeometry(0.042,0.036,0.17,12), new T.MeshStandardMaterial({color:0x9aa0a4, roughness:0.3, metalness:0.7}));
  const ml=new T.Mesh(new T.CylinderGeometry(0.044,0.044,0.03,12), new T.MeshStandardMaterial({color:0x1d1d1f, roughness:0.5}));
  ml.position.y=0.10; mug.add(mb); mug.add(ml); mug.visible=false; scene.add(mug);
  const p={kind:"custom", P:P, x:door.x, z:door.z, y:PAVE_T, yaw:0, ph:0, seed:3.7, cust:true, walking:false,
           state:"cab", t:0, path:null, pi:0, nextM:5.0+Math.random()*1.5, sand:false, mugIn:true};
  SLIPPERS.p=p;
  const nightM=()=>(DayNight.state.hour-18+24)%24;                // hours since six in the evening
  const go=(pts, then)=>{ p.path=pts; p.pi=1; p.state="walk"; p.then=then; p.walking=true; };
  const _hw=new T.Vector3();
  p.upd=(p, dt, now, dark, cd)=>{
    const m=nightM();
    if(m<1){ p.nextM=4.5+Math.random()*1.5; SLIPPERS.told=false; }  // a new evening: his first trip some time after half ten
    if(p.state==="cab"){
      P.g.visible=false; mug.visible=false; p.walking=false;
      if(m>=p.nextM && m<11 && dark>0.5){ p.x=door.x; p.z=door.z; p.sand=Math.random()<0.45; P.g.visible=true; go(out, "coffee"); }
      return;
    }
    // walking: a shuffle, slippers that do not leave the ground, the mug carried in front
    if(p.state==="walk"){
      const tgt=p.path[p.pi], dx=tgt.x-p.x, dz=tgt.z-p.z, d=Math.hypot(dx,dz);
      // he stops for you, as anybody would
      const px=player.pos.x-p.x, pz=player.pos.z-p.z, ahead=(px*dx+pz*dz)/(d||1);
      const sp=(!driving && Math.hypot(px,pz)<1.2 && ahead>0) ? 0 : 0.74;
      if(d<0.06){ p.pi++; if(p.pi>=p.path.length){ p.walking=false;
          if(p.then==="coffee"){ p.state="place"; p.t=0; }
          else if(p.then==="sand"){ p.state="sand"; p.t=0; }
          else if(p.then==="home"){ p.state="cab"; p.nextM=nightM()+1.3+Math.random()*1.4; P.g.visible=false; mug.visible=false; return; } } }
      else{
        let dy=Math.atan2(dx,dz)-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2;
        p.yaw+=dy*Math.min(1,dt*5);
        const step=Math.min(d, sp*dt);
        p.x+=dx/d*step; p.z+=dz/d*step; p.ph=(p.ph+step/0.78)%1;
        p.y=surfaceY(p.x, p.z, p.y+0.3);
      }
    }
    const tStand=p.state!=="walk";
    p.t+=dt;
    // at the machine: the mug into the bay, his button, the wait, the mug back out
    const H=VENDHUT_RT;
    if(p.state==="place"){ let dy=Math.PI-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; p.yaw+=dy*Math.min(1,dt*4);
      if(p.t>1.3 && p.mugIn){ p.mugIn=false; H.mugUnder=true; }
      if(p.t>2.6){ p.state="brew"; p.t=0; H.brew=10; if(typeof AUDIO!=="undefined"){ AUDIO.blip("tick", C.x, C.z); AUDIO.blip("gurgle", C.x, C.z); } } }
    else if(p.state==="brew"){
      if(p.t>3.2 && p.t<3.3){ H.pour=4.5; if(typeof AUDIO!=="undefined") AUDIO.blip("pour", C.x, C.z); }
      if(p.t>9.5){ p.state="take"; p.t=0; } }
    else if(p.state==="take"){ if(p.t>1.0 && !p.mugIn){ p.mugIn=true; H.mugUnder=false; }
      if(p.t>2.4){ const back=out.slice().reverse(); back[0]={x:p.x, z:p.z};
        if(p.sand){ p.sand=false; go([{x:p.x,z:p.z}, SAND], "sand"); }
        else go(back, "home"); } }
    else if(p.state==="sand"){ let dy=Math.PI-p.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; p.yaw+=dy*Math.min(1,dt*4);
      if(p.t>7){ const back=out.slice(0,-1).reverse(); back.unshift({x:p.x, z:p.z}); go(back, "home"); } }
    // a word, if you are in the room while he is at the machine
    if(tStand && p.state!=="cab" && !SLIPPERS.told && Math.hypot(player.pos.x-p.x, player.pos.z-p.z)<3.2){
      SLIPPERS.told=true;
      toast(["“OUT OF CUPS SINCE JULY. YOU BRING YOUR OWN.”","“DON'T PUT MONEY IN THAT. IT'LL TAKE IT.”"][(Math.random()*2)|0], "#cfe0d4"); }
    // the pose
    if(cd<110){
      if(p.state==="walk"){
        poseP(P, "walk", p.ph, now); const B=P.B, J=P.j;
        B[J.hpL].rotation.x*=0.42; B[J.hpR].rotation.x*=0.42;                  // short steps
        B[J.knL].rotation.x=0.10+(B[J.knL].rotation.x-0.08)*0.30; B[J.knR].rotation.x=0.10+(B[J.knR].rotation.x-0.08)*0.30;
        B[J.root].position.y=P.HIP-0.02+Math.abs(Math.cos(p.ph*Math.PI*2))*0.008;
        B[J.spine].rotation.x=0.12;                                            // a bit of a stoop
        B[J.shL].rotation.x*=0.4;
        B[J.shR].rotation.set(-0.30, 0, 0.05); B[J.elR].rotation.x=-1.25;      // the mug held in front
        B[J.head].rotation.x=0.10;
      }else{
        poseP(P, "stand", 0, now); const B=P.B, J=P.j;
        B[J.spine].rotation.x=0.10;
        if(p.state==="place"){ const r=smoothstep(0,1.2,p.t)*(1-smoothstep(1.6,2.4,p.t));
          B[J.spine].rotation.x=0.10+r*0.45; B[J.shR].rotation.set(-0.30-r*0.55, 0, 0.05); B[J.elR].rotation.x=-1.25+r*0.75; B[J.head].rotation.x=0.3*r;
          if(p.t>1.6){ const k=smoothstep(1.6,2.2,p.t)*(1-smoothstep(2.3,2.6,p.t)); B[J.shL].rotation.set(-0.95*k, 0, -0.05); B[J.elL].rotation.x=-0.6*k; } }
        else if(p.state==="brew"){ B[J.head].rotation.y=0.9*smoothstep(2,4,p.t)*(1-smoothstep(7,8.5,p.t));   // a look over at the board
          const sc=smoothstep(4.5,5,p.t)*(1-smoothstep(6,6.5,p.t)); B[J.shL].rotation.set(-2.4*sc, 0, -0.3*sc); B[J.elL].rotation.x=-1.6*sc; }   // scratches his head
        else if(p.state==="take"){ const r=smoothstep(0,0.9,p.t)*(1-smoothstep(1.2,2.0,p.t));
          B[J.spine].rotation.x=0.10+r*0.45; B[J.shR].rotation.set(-0.30-r*0.55, 0, 0.05); B[J.elR].rotation.x=-1.25+r*0.75;
          if(p.t>1.6){ const s=smoothstep(1.6,2.0,p.t); B[J.shR].rotation.set(-0.30-s*0.6, -0.4*s, 0.05); B[J.elR].rotation.x=-1.25-s*0.9; } }   // and a sip
        else { B[J.shR].rotation.set(-0.30, 0, 0.05); B[J.elR].rotation.x=-1.25; B[J.head].rotation.x=0.18; }
      }
    }
    P.g.position.set(p.x, p.y, p.z); P.g.rotation.y=p.yaw;
    // the mug rides in his right hand, upright, whenever it is not in the bay
    mug.visible=P.g.visible && p.mugIn;
    if(mug.visible){ P.g.updateMatrixWorld(true); _hw.set(0, -0.30*P.h, 0.03).applyMatrix4(P.B[P.j.elR].matrixWorld); mug.position.copy(_hw); mug.position.y+=0.02; mug.rotation.y=p.yaw; }
  };
  PEOPLE.push(p);
})();
