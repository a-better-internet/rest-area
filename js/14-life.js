"use strict";
/* REST AREA · 14-life.js
   visitors off the interstate, deer at the edge of the woods, fireflies,
   falling leaves, the smoke off somebody's grill
   Loaded as a classic script, in order, sharing one global scope with
   its siblings — see index.html. */
/* ----------------------------------------------------------------------
   14 · LIFE
   The place is mostly empty, which is the point, and the small movements
   are what make it somewhere: a minivan coming down the exit ramp, slowing,
   picking a stall near the door and sitting there a while before it backs
   out and goes; a truck easing into the truck lot for the night; a doe at
   the edge of the trees that lifts her head when you come out of the
   building and is gone before you are near her.
   ---------------------------------------------------------------------- */

/* ---- visitors: highway vehicles that take the exit ---------------------
   A northbound vehicle in the right lane can be flagged, well south of the
   exit, as one that will stop. It stops passing, takes the ramp, drives
   the lot to a free stall, parks, waits, backs out, leaves by the on-ramp
   and merges back into the right lane as ordinary traffic. Each leg of
   that is a smoothed path and a speed; the vehicle is placed on it by
   distance travelled, and points along it — or against it, reversing. */
const VISIT={active:0, max:3, wait:6};
function _legFwd(pts, speed, opts){ return Object.assign({P:smoothPath(pts,1.0,true), speed:speed, rev:false}, opts||{}); }
// the on-ramp from s0 on, as a path of its own: the lot's exit leg ends on
// the ramp itself, already pointing down it, so there is no corner between
const _ON_S=16;
function _rampFrom(P, s0){
  const a=pathAt(P, s0), out=[{x:a.x, z:a.z, y:a.y, s:0}];
  for(const p of P) if(p.s>s0+0.05) out.push({x:p.x, z:p.z, y:p.y, s:p.s-s0});
  return out;
}
const _ON_PT=pathAt(RAMP_ENTRY, _ON_S), _ON_PATH=_rampFrom(RAMP_ENTRY, _ON_S);
function _carRoute(v){
  // a free stall, likelier near the door
  const C=CARLOT, n=Math.floor((C.stallZ1-C.stallZ0)/C.stallW), opts=[];
  for(let k=0;k<n;k++) for(const sd of ["E","W"]){
    if(LOT_TAKEN.has(sd+k)) continue;
    const zc=C.stallZ0+(k+0.5)*C.stallW;
    if(sd==="E" && CARLOT.ada[k]) continue;                  // the accessible stalls and their aisles
    opts.push({k:k, sd:sd, zc:zc, w:Math.exp(-Math.abs(zc)/30)+0.05});
  }
  if(!opts.length) return null;
  let tot=0; for(const o of opts) tot+=o.w;
  let r=Math.random()*tot, st=opts[0];
  for(const o of opts){ r-=o.w; if(r<=0){ st=o; break; } }
  LOT_TAKEN.add(st.sd+st.k);
  const ax=(C.aisle0+C.aisle1)/2, zs=st.zc, E=st.sd==="E";
  const px=E?-29.2:-43.15, s1=E?1:-1;
  const legs=[
    {P:RAMP_EXIT, speed:13, rev:false, ramp:true},
    _legFwd([{x:-75,z:104},{x:-74.7,z:100},{x:-72.6,z:96},{x:-66,z:93.6},{x:-58,z:92.4},{x:-50,z:91},{x:-41,z:87},{x:ax,z:78},
             {x:ax,z:Math.min(70,zs+16)},{x:ax,z:zs+7},{x:ax+s1*1.9,z:zs+3.2},{x:px-s1*2.4,z:zs+0.6},{x:px,z:zs}],
            5.5, {stop:true, dwell:35+Math.random()*80}),
    {P:smoothPath([{x:px,z:zs},{x:px-s1*2.8,z:zs+0.3},{x:ax+s1*1.5,z:zs+2.0},{x:ax+s1*0.3,z:zs+4.0},{x:ax,z:zs+5.4}],0.5,true), speed:1.4, rev:true, stop:true, dwell:0.6},
    _legFwd([{x:ax,z:zs+5.4},{x:ax,z:zs-2},{x:ax,z:-126},{x:ax-1.5,z:-136},{x:-44,z:-143.5},{x:-58,z:-146.2},{x:-68,z:-147.4},
             {x:-73.2,z:-150.5},{x:-75.1,z:-156},{x:_ON_PT.x,z:_ON_PT.z}], 6),
    {P:_ON_PATH, speed:27, rev:false, ramp:true, merge:true},
  ];
  return {legs:legs, li:0, s:0, stall:{px:px, zs:zs, E:E}, release:()=>LOT_TAKEN.delete(st.sd+st.k)};
}
function _truckRoute(v){
  const free=TRUCK_STALLS.filter(s=>!s.taken);
  if(!free.length) return null;
  const st=free[(Math.random()*free.length)|0]; st.taken=true;
  const S=v.spec, back=1.2-S.tail, ax=-65;
  const cx=st.x0+st.dx*back, cz=st.z0+st.dz*back;
  const legs=[
    {P:RAMP_EXIT, speed:11, rev:false, ramp:true},
    _legFwd([{x:-75,z:104},{x:-74.6,z:99},{x:-72,z:94.5},{x:-68.2,z:91.2},{x:-65.8,z:87.2},{x:ax,z:Math.min(80,st.z0+26)},{x:ax,z:st.z0+14},
             {x:-66.6,z:st.z0+6},{x:st.x0+st.dx*2,z:st.z0+st.dz*2},{x:cx,z:cz}], 4.5, {stop:true, dwell:80+Math.random()*160}),
    {P:smoothPath([{x:cx,z:cz},{x:st.x0+st.dx*3,z:st.z0+st.dz*3},{x:-66.4,z:st.z0+6},{x:ax-0.3,z:st.z0+12},{x:ax,z:st.z0+17}],0.5,true),
     speed:1.3, rev:true, stop:true, dwell:1.0},
    _legFwd([{x:ax,z:st.z0+17},{x:ax,z:st.z0},{x:ax,z:-128},{x:-66.5,z:-138},{x:-70.5,z:-145.5},{x:-74.2,z:-152.5},{x:_ON_PT.x,z:_ON_PT.z}], 5),
    {P:_ON_PATH, speed:24, rev:false, ramp:true, merge:true},
  ];
  return {legs:legs, li:0, s:0, release:()=>{ st.taken=false; }};
}
let _visitT=0, _visitSeq=0;
// nobody backs out into a car that is coming down the aisle
function _aisleBusy(v, N){
  const e=N.P[N.P.length-1];
  for(const o of TRAFFIC){
    if(o===v || !o.route || o.route.dwell>0) continue;
    const p=o.g.position;
    if(Math.hypot(p.x-e.x, p.z-e.z)<16) return true;
  }
  return false;
}
// two that are each waiting on the other: one going backwards has the right
// of way over one going forwards, and otherwise whoever pulled in first
function _yieldsTo(v, o){
  const R=v.route, Q=o.route, vr=R.legs[R.li].rev, or_=Q.legs[Q.li].rev;
  if(vr!==or_) return or_;
  return Q.seq<R.seq;
}
function updateVisitors(dt, dark){
  _visitT+=dt;
  // flag one, now and then, well south of the exit
  if(VISIT.active<VISIT.max && _visitT>VISIT.wait){
    for(const v of TRAFFIC){
      if(v.dir>0 || v.route || v.exiting || v.lane!==0 || v.laneT<1) continue;
      if(v.z<1000 || v.z>1400) continue;
      if(v.kind===4 || v.kind===7) continue;                 // box trucks and flatbeds keep going
      v.exiting=true; VISIT.active++; _visitT=0; VISIT.wait=25+Math.random()*55;
      break;
    }
  }
  for(const v of TRAFFIC){
    if(v.exiting && !v.route && v.dir<0 && v.z<=RAMP_EXIT[0].z+0.5){
      const R=v.big ? _truckRoute(v) : _carRoute(v);
      if(!R){ v.exiting=false; VISIT.active--; continue; }
      v.route=R; R.x0=v.x-RAMP_EXIT[0].x; R.seq=++_visitSeq; v.speed=Math.min(v.speed, 28);
    }
    if(!v.route) continue;
    stepVisitor(v, dt, dark);
  }
}
const _vp={x:0,z:0};
function stepVisitor(v, dt, dark){
  const R=v.route, L=R.legs[R.li], P=L.P, len=P[P.length-1].s;
  if(R.dwell>0){                                           // parked, or paused between legs
    R.dwell-=dt; v.speed=0; v.braking=false;
    if(R.parked && R.ped && !R.ped.done) R.dwell=Math.max(R.dwell, 0.5);   // they are not back yet
    const at=pathAt(P, len), h=Math.atan2(at.hx, at.hz)+(L.rev?Math.PI:0);
    placeVehicle(v, at.x, at.z, h, dark, PAVE_T);
    R.blk=null;
    if(R.dwell<=0){
      const N=R.legs[R.li+1];
      if(N && N.rev && _aisleBusy(v, N)){ R.dwell=0.8; return; }   // look both ways first
      if(R.parked){ const i=COL_DYN.indexOf(v.col); if(i>=0) COL_DYN.splice(i,1); R.parked=false; }
      R.li++; R.s=0;
    }
    return;
  }
  // the speed it wants: its leg's, braking into a stop, and never into you
  let target=L.speed;
  if(L.stop) target=Math.min(target, Math.sqrt(2*1.8*Math.max(0,len-R.s))+0.2);
  const here=pathAt(P, R.s);
  const fx=here.hx*(L.rev?-1:1), fz=here.hz*(L.rev?-1:1);
  // the merge: time the end of the ramp against whoever is coming in lane 0,
  // and drop in behind or get ahead of them, the way people do
  if(L.merge){
    const rem=len-R.s, end=P[P.length-1], tMe=rem/Math.max(5,v.speed);
    if(rem<240) for(const o of TRAFFIC){
      if(o.route || o.dir!==v.dir || o.lane!==0) continue;
      const dO=(end.z-o.z)*o.dir;
      if(dO<-45 || dO>420) continue;
      const tO=dO/Math.max(5,o.speed);
      if(Math.abs(tO-tMe)<2.4){
        if(tO<tMe || rem<60) target=Math.min(target, o.speed*0.85);
        else target=Math.max(target, Math.min(o.speed+4, 33));
        if(rem<160) o.yieldMerge=true;                    // and they move over if they can
      }
    }
  }
  // following: whatever is ahead along the way it is going, kept a speed's
  // length off, bumper to bumper; it eases down to the speed of the thing in
  // front instead of stopping dead at a fixed distance
  const myFront=L.rev?-v.tail:v.nose, reachF=myFront+10+v.speed*2.4;
  let lim=1e9, blk=null, limBy=null;
  const consider=(px,pz,ospeed,olen,wide)=>{
    const dx=px-here.x, dz=pz-here.z, a=dx*fx+dz*fz, l=Math.abs(dx*fz-dz*fx);
    if(a<=0 || a>reachF || l>wide) return false;
    const gap=a-myFront-olen, want=3.2+v.speed*1.3;
    if(gap>=want+6) return false;
    const cap=Math.max(0, ospeed+(gap-want)*0.6);
    if(cap<lim){ lim=cap; return true; }
    return false;
  };
  if(!driving && Math.abs(player.feetY-here.y)<3 && consider(player.pos.x, player.pos.z, 0, 0.4, v.hw+1.0)) limBy="you";
  if(driving){ const p=driving.g.position; if(consider(p.x, p.z, 0, 2.4, v.hw+1.6)) limBy="car"; }
  if(typeof PEOPLE!=="undefined") for(const q of PEOPLE)        // and anyone on foot in the lot
    if(q.kind==="driver" && q.P.g.visible && consider(q.x, q.z, 0, 0.3, v.hw+0.9)) limBy="you";
  for(const o of TRAFFIC){
    if(o===v || !o.route || o.route.dwell>0) continue;      // parked ones are in their stalls, not the aisle
    if(o.route.blk===v && !_yieldsTo(v, o)) continue;       // it is waiting on us: go
    if(R.waited>25 && (o.route.waited||0)>25 && R.seq<o.route.seq) continue;   // a knot: the first one in is waved through
    const OL=o.route.legs[o.route.li], h=o.g.rotation.y, sg=OL.rev?-1:1;
    const os=Math.max(0, o.speed*sg*(Math.sin(h)*fx+Math.cos(h)*fz));
    if(consider(o.g.position.x, o.g.position.z, os, Math.max(o.nose,-o.tail), v.hw+1.4)){ blk=o; limBy="traffic"; }
  }
  if(limBy!=="traffic") blk=null;
  target=Math.min(target, lim);
  const blockedBy = lim<0.3 ? limBy : null;
  R.blk = blockedBy==="traffic" ? blk : null;
  if(blockedBy){ R.waited=(R.waited||0)+dt;
    if(blockedBy==="you" && R.waited>3.5 && !R.honked){ R.honked=true;
      if(typeof AUDIO!=="undefined") AUDIO.blip(v.big?"airhorn":"horn", here.x, here.z); } }
  else R.waited=0;
  v.braking = target < v.speed-0.2;
  v.speed += clamp(target-v.speed, -4.5*dt, (L.ramp?2.6:1.6)*dt);
  R.s=Math.min(len, R.s+v.speed*dt);
  v.spin=(v.spin+v.speed*(L.rev?-1:1)*dt/v.spec.wr)%(Math.PI*2);
  const at=pathAt(P, R.s);
  let x=at.x, z=at.z;
  if(R.li===0 && R.x0){ x+=R.x0*(1-smoothstep(0,60,R.s)); }      // ease off the lane onto the ramp
  const head=Math.atan2(at.hx, at.hz)+(L.rev?Math.PI:0);
  v.x=x; v.z=z;
  placeVehicle(v, x, z, head, dark, PAVE_T);
  if(R.s>=len-0.02){
    if(L.merge){                                           // back into the right lane, as traffic
      R.release && R.release();
      v.route=null; v.exiting=false; VISIT.active--;
      v.lane=0; v.fromLane=0; v.laneT=1; v.z=z;
      v.sway=x-laneX(-1,0); v.swayV=0; v.x=x;
      return;
    }
    if(L.stop){
      R.dwell=L.dwell||0.5;
      if(R.li===1){ R.parked=true; COL_DYN.push(v.col);
        if(!v.big && typeof PEOPLE_API!=="undefined") PEOPLE_API.arrive(v); }
    }else{ R.li++; R.s=0; }
  }
}

/* ---- deer ------------------------------------------------------------------
   Whitetails, a doe and two of last year's, at the edge of the woods where
   the lawn meets the trees. They graze with their heads down, look up every
   so often, and when you come within twenty metres they are gone: three
   bounds, white tails up, into the trees, and back out somewhere else once
   you have been away from them a while. */
const DEER=[];
(function deer(){
  /* A whitetail doe, a metre at the shoulder, lofted like the cars: a torso of
     elliptical rings (deep in the chest, tucked at the flank, broad over the
     haunches), a neck and a long head on their own pivots, ears that turn,
     four legs each in two pieces with a knee or a hock between, and the tail
     that goes up white when she runs. Reddish-brown on top, white beneath,
     white at the throat, round the eyes and under the tail. */
  const C=h=>new T.Color(h);
  const BACK=C(0x4a3524), COAT=C(0x6e5036), FLANK=C(0x7c5d40), BELLY=C(0xe6e0d2), DARK=C(0x2a2018),
        NOSE=C(0x161210), WHITE=C(0xf2eee4), EARIN=C(0xc9b6a2), HOOF=C(0x2b241e);
  const mat=new T.MeshStandardMaterial({vertexColors:true, roughness:0.88});
  const E=(geo,x,y,z,c,rx,ry,rz,sx,sy,sz)=>({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)), V3(sx||1,sy||1,sz||1)), color:c});
  const mk=(list)=>{ const m=new T.Mesh(mergeEntries(list), mat); m.castShadow=true; return m; };
  // a loft of ellipses along +z, coloured by where on the ring a vertex is
  const loft=(zs, sec, colr, M)=>{
    const rings=zs.map(z=>{ const s=sec(z), r=[];
      for(let j=0;j<M;j++){ const a=j/M*Math.PI*2; r.push([s.w*Math.cos(a), s.y+s.h*Math.sin(a)]); } return r; });
    return skin(zs, rings, true, (i,j)=>colr(zs[i], Math.sin(j/M*Math.PI*2)), 0);
  };
  const span=(a,b,n)=>{ const o=[]; for(let k=0;k<=n;k++) o.push(lerp(a,b,k/n)); return o; };
  const torsoGeo=(function(){
    const top=crv([[-0.60,0.80],[-0.54,0.90],[-0.40,0.95],[-0.15,0.925],[0.15,0.95],[0.32,0.985],[0.46,0.93],[0.56,0.82]]);
    const bot=crv([[-0.60,0.74],[-0.52,0.62],[-0.38,0.58],[-0.15,0.565],[0.10,0.52],[0.32,0.50],[0.46,0.55],[0.56,0.70]]);
    const wid=crv([[-0.60,0.03],[-0.52,0.14],[-0.38,0.185],[-0.12,0.19],[0.15,0.18],[0.34,0.165],[0.48,0.12],[0.56,0.04]]);
    const zs=span(-0.60,0.56,22);
    return loft(zs, z=>({w:wid(z), y:(top(z)+bot(z))/2, h:(top(z)-bot(z))/2}), (z,s)=>{
      if(s<-0.45) return BELLY;
      if(z<-0.50 && s>-0.3) return WHITE;                  // the rump patch round the tail
      if(s>0.72) return BACK;
      return s<-0.15 ? FLANK : COAT;
    }, 16);
  })();
  const neckGeo=(function(){
    const g=loft(span(0,0.52,8), z=>({w:lerp(0.095,0.055,z/0.52), y:0, h:lerp(0.15,0.075,z/0.52)}),
                 (z,s)=>(s<-0.55 && z>0.34 ? WHITE : s>0.6 ? BACK : COAT), 12);
    g.rotateX(-0.95);
    return g;
  })();
  const headGeo=(function(){
    const g=loft(span(-0.05,0.26,9), z=>({w:lerp(0.072,0.030,Math.max(0,z)/0.26), y:lerp(0.02,-0.035,Math.max(0,z)/0.26),
                 h:lerp(0.085,0.034,Math.max(0,z)/0.26)}), (z,s)=>(z>0.21 ? NOSE : s<-0.5 && z<0.05 ? WHITE : s>0.5 ? BACK : COAT), 12);
    return g;
  })();
  const earGeo=(function(){ const g=new T.ConeGeometry(0.055,0.17,8,1); g.scale(1,1,0.35); return g; })();
  function build(scale){
    const g=new T.Group();
    g.add(mk([{geo:torsoGeo, matrix:new T.Matrix4(), color:null}]));
    // neck from the withers, the head at its end
    const neck=new T.Group(); neck.position.set(0,0.84,0.40); g.add(neck);
    neck.add(mk([{geo:neckGeo, matrix:new T.Matrix4(), color:null}]));
    const head=new T.Group(); head.position.set(0, 0.52*Math.sin(0.95), 0.52*Math.cos(0.95)); neck.add(head);
    head.add(mk([{geo:headGeo, matrix:new T.Matrix4(), color:null},
                 E(new T.SphereGeometry(0.019,8,6), 0.058,0.035,0.055, DARK),
                 E(new T.SphereGeometry(0.019,8,6),-0.058,0.035,0.055, DARK),
                 E(new T.TorusGeometry(0.024,0.006,4,10), 0.054,0.035,0.055, WHITE, 0, Math.PI/2, 0),
                 E(new T.TorusGeometry(0.024,0.006,4,10),-0.054,0.035,0.055, WHITE, 0, Math.PI/2, 0),
                 E(new T.SphereGeometry(0.03,8,6), 0,-0.07,0.17, WHITE, 0,0,0, 1,0.6,1.2)]));
    const ears=[];
    for(const s of [-1,1]){
      const ear=new T.Group(); ear.position.set(s*0.055,0.085,-0.02); head.add(ear);
      ear.add(mk([E(earGeo, 0,0.075,0, COAT), E(earGeo, 0,0.07,0.012, EARIN, 0,0,0, 0.75,0.8,0.6)]));
      ear.rotation.set(-0.25, s*0.35, -s*0.55); ears.push(ear);
    }
    // the tail: broad, brown on top and white under
    const tail=new T.Group(); tail.position.set(0,0.86,-0.57); g.add(tail);
    tail.add(mk([E(new T.SphereGeometry(0.06,10,6),0,-0.09,-0.022,COAT,0,0,0,0.9,1.7,0.45),
                 E(new T.SphereGeometry(0.058,10,6),0,-0.09,0.002,WHITE,0,0,0,0.85,1.6,0.35)]));
    // legs: hip or shoulder, then knee or hock; hind legs carry a thigh
    const legs=[];
    for(const [lx,ly,lz,front] of [[-0.10,0.66,0.36,true],[0.10,0.66,0.36,true],[-0.11,0.76,-0.40,false],[0.11,0.76,-0.40,false]]){
      const up=new T.Group(); up.position.set(lx,ly,lz); g.add(up);
      const L1=front?0.33:0.36, L2=front?0.30:0.34;
      const ul=[E(new T.CylinderGeometry(front?0.045:0.05, 0.028, L1, 8), 0,-L1/2,0, COAT)];
      if(!front) ul.push(E(new T.SphereGeometry(0.5,10,8), -Math.sign(lx)*0.02,-0.04,0.03, COAT, 0.25,0,0, 0.10,0.34,0.20));
      else ul.push(E(new T.SphereGeometry(0.5,10,8), -Math.sign(lx)*0.015,0.02,0.0, COAT, 0,0,0, 0.085,0.24,0.13));
      up.add(mk(ul));
      const low=new T.Group(); low.position.set(0,-L1,0); up.add(low);
      low.add(mk([E(new T.SphereGeometry(0.03,8,6), 0,0,0, COAT),
                  E(new T.CylinderGeometry(0.021, 0.017, L2, 7), 0,-L2/2,0, front?COAT:FLANK),
                  E(new T.CylinderGeometry(0.022, 0.026, 0.05, 7), 0,-L2-0.01,0.008, HOOF)]));
      legs.push({up:up, low:low, front:front, side:lx<0?-1:1, rest:front?0.0:0.30, restLow:front?0.0:-0.32});
    }
    g.scale.setScalar(scale);
    return {g:g, neck:neck, head:head, ears:ears, tail:tail, legs:legs};
  }
  const SPOTS=[[29,-56],[31,-82],[30,-28],[32,46],[27,92],[-99,-150],[24,-124],[-96,92]];
  for(let i=0;i<3;i++){
    const b=build(i===0?1.0:0.84);
    const sp=SPOTS[i*2];
    const d={...b, x:sp[0], z:sp[1], yaw:Math.random()*6.28, mode:"graze", t:Math.random()*5, run:0,
             vx:0, vz:0, ph:Math.random()*6, home:i*2, gone:0, gait:0, flick:0};
    d.g.position.set(d.x, Terrain.groundAt(d.x,d.z), d.z);
    scene.add(d.g);
    DEER.push(d);
  }
  DEER.spots=SPOTS;
})();
// pose the legs for a gait phase: walk is four-beat, the run a bound
function _deerLegs(d, cyc, amp, bound){
  const P=[0.0,0.5,0.75,0.25];                     // LF RF LH RH, for the walk
  d.legs.forEach((L,k)=>{
    const ph=bound ? (L.front?0:0.45)+(L.side>0?0.06:0) : P[k];
    const a=(cyc+ph)*Math.PI*2, swing=Math.sin(a), lift=Math.max(0, Math.cos(a));
    L.up.rotation.x = L.rest - swing*amp*(L.front?1:0.85);
    L.low.rotation.x = L.restLow + (L.front ? lift*amp*1.4 : -lift*amp*1.1);
  });
}
function updateDeer(dt, now){
  for(const d of DEER){
    const dx=d.x-player.pos.x, dz=d.z-player.pos.z, dist=Math.hypot(dx,dz);
    if(d.mode==="gone"){
      d.gone-=dt;
      if(d.gone<=0){                                    // back out, somewhere you are not
        const cands=DEER.spots.filter(s=>Math.hypot(s[0]-player.pos.x, s[1]-player.pos.z)>70);
        if(cands.length){ const s=cands[(Math.random()*cands.length)|0];
          d.x=s[0]+(Math.random()-0.5)*6; d.z=s[1]+(Math.random()-0.5)*6; d.mode="graze"; d.g.visible=true; }
        else d.gone=20;
      }
      continue;
    }
    const near = dist<(driving?28:20) && !indoorsAt(player.pos.x,player.pos.z,player.feetY+1);
    if(d.mode!=="flee" && near){
      d.mode="flee"; d.run=0;
      // away from you, and into the trees: bias toward the deeper woods
      let ax=dx/dist, az=dz/dist;
      const g1=Terrain.siteDist(d.x+ax*10,d.z+az*10);
      for(let k=0;k<8;k++){ const a=Math.atan2(az,ax)+(k-4)*0.25, tx=Math.cos(a), tz=Math.sin(a);
        if(Terrain.siteDist(d.x+tx*10,d.z+tz*10)>g1+2){ ax=tx; az=tz; break; } }
      d.vx=ax; d.vz=az;
    }
    if(d.mode==="flee"){
      d.run+=dt;
      const sp=11.5*Math.min(1,d.run*2.5);
      d.x+=d.vx*sp*dt; d.z+=d.vz*sp*dt;
      d.yaw=Math.atan2(d.vx,d.vz);
      const hop=Math.abs(Math.sin(d.run*5.2))*0.55;
      d.g.position.set(d.x, Terrain.groundAt(d.x,d.z)+hop, d.z);
      d.g.rotation.set(-Math.cos(d.run*5.2)*0.12, d.yaw, 0, "YXZ");
      d.neck.rotation.x=-0.25; d.head.rotation.x=0.15; d.tail.rotation.x=2.3;    // the flag
      _deerLegs(d, d.run*2.6, 0.95, true);
      if(d.run>4.5 || Terrain.siteDist(d.x,d.z)>45){ d.mode="gone"; d.gone=50+Math.random()*60; d.g.visible=false; }
      continue;
    }
    // grazing: step a little now and then, head down, look up, an ear flick
    d.t-=dt;
    if(d.t<=0){ d.t=2+Math.random()*6; d.walk=Math.random()<0.4 ? 1.2+Math.random()*1.5 : 0; d.yaw+=(Math.random()-0.5)*1.2; }
    if(d.walk>0){
      d.walk-=dt; const sp=0.7;
      const nx=d.x+Math.sin(d.yaw)*sp*dt, nz=d.z+Math.cos(d.yaw)*sp*dt;
      if(Terrain.siteDist(nx,nz)>-6 && Terrain.siteDist(nx,nz)<14){ d.x=nx; d.z=nz; } else d.yaw+=Math.PI*0.7;
      d.gait+=dt*1.6; _deerLegs(d, d.gait, 0.32, false);
    }else{ for(const L of d.legs){ L.up.rotation.x+=(L.rest-L.up.rotation.x)*Math.min(1,dt*6); L.low.rotation.x+=(L.restLow-L.low.rotation.x)*Math.min(1,dt*6); } }
    const alert=dist<38;
    const want=alert ? -0.2 : (Math.sin(now*0.4+d.ph)>-0.3 ? 1.9 : 0.0);
    d.neck.rotation.x += (want-d.neck.rotation.x)*Math.min(1,dt*3);
    d.head.rotation.x += ((want>0.6?0.85:alert?-0.1:0.15)-d.head.rotation.x)*Math.min(1,dt*3);
    // the tail flicks, and the ears turn toward whatever is out there
    d.flick-=dt; if(d.flick<=0) d.flick=1.5+Math.random()*4;
    d.tail.rotation.x += ((alert?0.9:(d.flick<0.25?0.7:-0.05))-d.tail.rotation.x)*Math.min(1,dt*8);
    for(const [i,ear] of d.ears.entries()){ const s=i?1:-1;
      const ey=alert ? s*0.1 : s*(0.35+Math.sin(now*0.7+d.ph+i*2)*0.25);
      ear.rotation.y += (ey-ear.rotation.y)*Math.min(1,dt*5); }
    d.g.position.set(d.x, Terrain.groundAt(d.x,d.z), d.z);
    d.g.rotation.set(0, alert ? Math.atan2(-dx,-dz)*0.0+d.yaw : d.yaw, 0);
  }
}

/* ---- fireflies: July nights over the lawn ------------------------------- */
const FF=(function(){
  const N=160, pos=new Float32Array(N*3), col=new Float32Array(N*3), ph=new Float32Array(N), off=new Float32Array(N);
  for(let i=0;i<N;i++){ pos[i*3]=rr(-38,38); pos[i*3+2]=rr(-38,38); ph[i]=rnd()*60; off[i]=0.3+rnd()*2.2; }
  const g=new T.BufferGeometry();
  g.setAttribute("position", new T.BufferAttribute(pos,3));
  g.setAttribute("color", new T.BufferAttribute(col,3));
  const p=new T.Points(g, new T.PointsMaterial({map:GLOW_TEX, size:0.34, sizeAttenuation:true, vertexColors:true,
    transparent:true, depthWrite:false, blending:T.AdditiveBlending, toneMapped:false}));
  p.frustumCulled=false; p.visible=false; scene.add(p);
  return {p:p, pos:pos, col:col, ph:ph, off:off, N:N, cx:0, cz:0};
})();
function updateFireflies(dt, now, dark){
  const on=dark>0.45 && !FOREST.isAutumn() && !indoorsAt(camera.position.x,camera.position.z,camera.position.y);
  FF.p.visible=on; if(!on) return;
  const k=Math.min(1,(dark-0.45)*3), px=camera.position.x, pz=camera.position.z, half=38;
  for(let i=0;i<FF.N;i++){
    let x=FF.pos[i*3]+Math.sin(now*0.3+FF.ph[i])*0.4*dt, z=FF.pos[i*3+2]+Math.cos(now*0.27+FF.ph[i]*1.3)*0.4*dt;
    x=px+(((x-px+half)%(half*2))+half*2)%(half*2)-half;
    z=pz+(((z-pz+half)%(half*2))+half*2)%(half*2)-half;
    FF.pos[i*3]=x; FF.pos[i*3+2]=z;
    // over grass and the edge of the woods, not over the asphalt or deep in
    const cd=Terrain.clearDist(x,z), paved=pavedY(x,z)!==null;
    FF.pos[i*3+1]=Terrain.heightAt(x,z)+FF.off[i]+Math.sin(now*0.8+FF.ph[i])*0.2;
    const live=(!paved && cd>-30 && cd<14) ? 1 : 0;
    const f=Math.pow(Math.max(0,Math.sin(now*(0.9+(i%7)*0.08)+FF.ph[i])),18)*live*k;
    FF.col[i*3]=0.80*f; FF.col[i*3+1]=1.0*f; FF.col[i*3+2]=0.28*f;
  }
  FF.p.geometry.attributes.position.needsUpdate=true; FF.p.geometry.attributes.color.needsUpdate=true;
}

/* ---- leaves coming down, in October --------------------------------------- */
const LEAVES=(function(){
  const out=[], cols=[0xc2402a,0xe0791f,0xe6b52c,0xa0562a,0xd9a030];
  const geo=new T.PlaneGeometry(0.10,0.08);
  for(let i=0;i<70;i++){
    const m=new T.Mesh(geo, new T.MeshStandardMaterial({color:cols[i%cols.length], side:T.DoubleSide, roughness:0.8}));
    m.visible=false; scene.add(m);
    out.push({m:m, x:0, y:-99, z:0, vy:0.6+Math.random()*0.5, ph:Math.random()*6, sp:1+Math.random()*2});
  }
  return out;
})();
function updateLeaves(dt, now){
  const on=FOREST.isAutumn() && !indoorsAt(camera.position.x,camera.position.z,camera.position.y);
  for(const L of LEAVES){
    if(!on){ L.m.visible=false; continue; }
    const gy=Terrain.heightAt(L.x,L.z);
    if(L.y<gy || Math.hypot(L.x-camera.position.x, L.z-camera.position.z)>34){
      // drop a new one somewhere near you, from about crown height
      const a=Math.random()*6.28, r=4+Math.random()*28;
      L.x=camera.position.x+Math.cos(a)*r; L.z=camera.position.z+Math.sin(a)*r;
      L.y=Terrain.heightAt(L.x,L.z)+6+Math.random()*12;
      if(Terrain.clearDist(L.x,L.z)<-12){ L.y=-99; continue; }
    }
    L.y-=L.vy*dt*(0.7+0.3*Math.sin(now*L.sp+L.ph));
    L.x+=Math.sin(now*0.7+L.ph)*0.6*dt+Wind.gust*1.2*dt; L.z+=Math.cos(now*0.5+L.ph)*0.5*dt;
    L.m.position.set(L.x, L.y, L.z);
    L.m.rotation.set(now*L.sp+L.ph, now*0.7*L.sp, Math.sin(now*L.sp)*1.2);
    L.m.visible=true;
  }
}

/* ---- smoke off the lit grill -------------------------------------------- */
const SMOKE=(function(){
  const c=cvs(64,64), x=c.getContext("2d"), g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,"rgba(220,220,215,0.55)"); g.addColorStop(1,"rgba(220,220,215,0)");
  x.fillStyle=g; x.fillRect(0,0,64,64);
  const tex=setSRGB(new T.CanvasTexture(c)), out=[];
  for(const e of EMBERS){
    e.s=new T.Sprite(new T.SpriteMaterial({map:GLOW_TEX, color:0xff5a18, transparent:true, depthWrite:false,
      blending:T.AdditiveBlending, opacity:0.7})); e.s.scale.set(0.55,0.22,1); e.s.position.set(e.x,e.y+0.02,e.z); scene.add(e.s);
    LAMPS.push({x:e.x, y:e.y+0.3, z:e.z, color:0xff7a30, intensity:0.35, dist:3.5, decay:1.6});
    for(let i=0;i<7;i++){
      const s=new T.Sprite(new T.SpriteMaterial({map:tex, transparent:true, depthWrite:false, opacity:0}));
      scene.add(s); out.push({s:s, e:e, t:i/7*6});
    }
  }
  return out;
})();
function updateSmoke(dt){
  for(const p of SMOKE){
    p.t+=dt; if(p.t>6) p.t-=6;
    const u=p.t/6;
    p.s.position.set(p.e.x+u*1.6+Wind.gust*u*2, p.e.y+0.2+u*3.2, p.e.z+u*0.8);
    const sc=0.4+u*2.0; p.s.scale.set(sc,sc,1);
    p.s.material.opacity=0.30*Math.sin(u*Math.PI);
  }
}

function updateLife(dt, now, dark, dn){
  updateDeer(dt, now);
  if(typeof updatePeople==="function") updatePeople(dt, now, dark);
  if(typeof updateCritters==="function") updateCritters(dt, now, dark);
  updateFireflies(dt, now, dark);
  updateLeaves(dt, now);
  updateSmoke(dt);
  if(typeof updateBackwoods==="function") updateBackwoods(dt, now, dark);
  if(typeof updatePuffs==="function") updatePuffs(dt, now, dark);
}
