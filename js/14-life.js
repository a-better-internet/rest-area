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
function _legFwd(pts, speed, opts){ return Object.assign({P:smoothPath(pts,1.0), speed:speed, rev:false}, opts||{}); }
function _carRoute(v){
  // a free stall, likelier near the door
  const C=CARLOT, n=Math.floor((C.stallZ1-C.stallZ0)/C.stallW), opts=[];
  for(let k=0;k<n;k++) for(const sd of ["E","W"]){
    if(LOT_TAKEN.has(sd+k)) continue;
    const zc=C.stallZ0+(k+0.5)*C.stallW;
    if(sd==="E" && zc>-7 && zc<7) continue;                  // the accessible stalls
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
    _legFwd(RAMP_EXIT.map(p=>({x:p.x,z:p.z})), 13, {ramp:true}),
    _legFwd([{x:-75,z:104},{x:-71,z:97},{x:-61,z:93},{x:-50,z:91},{x:-41,z:87},{x:ax,z:78},
             {x:ax,z:Math.min(70,zs+16)},{x:ax,z:zs+7},{x:ax+s1*1.9,z:zs+3.2},{x:px-s1*2.4,z:zs+0.6},{x:px,z:zs}],
            5.5, {stop:true, dwell:35+Math.random()*80}),
    {P:smoothPath([{x:px,z:zs},{x:px-s1*2.8,z:zs+0.3},{x:ax+s1*1.6,z:zs+1.8},{x:ax,z:zs+4.2}],0.5), speed:1.4, rev:true, stop:true, dwell:0.6},
    _legFwd([{x:ax,z:zs+4.2},{x:ax,z:zs-2},{x:ax,z:-126},{x:ax-1,z:-138},{x:-46,z:-144},{x:-60,z:-146.5},{x:-70,z:-147},{x:-75,z:-146}], 6),
    _legFwd(RAMP_ENTRY.map(p=>({x:p.x,z:p.z})), 27, {ramp:true, merge:true}),
  ];
  return {legs:legs, li:0, s:0, release:()=>LOT_TAKEN.delete(st.sd+st.k)};
}
function _truckRoute(v){
  const free=TRUCK_STALLS.filter(s=>!s.taken);
  if(!free.length) return null;
  const st=free[(Math.random()*free.length)|0]; st.taken=true;
  const S=v.spec, back=1.2-S.tail, ax=-65;
  const cx=st.x0+st.dx*back, cz=st.z0+st.dz*back;
  const legs=[
    _legFwd(RAMP_EXIT.map(p=>({x:p.x,z:p.z})), 11, {ramp:true}),
    _legFwd([{x:-75,z:104},{x:-71,z:97},{x:-66.5,z:89},{x:ax,z:Math.min(80,st.z0+26)},{x:ax,z:st.z0+14},
             {x:-66.6,z:st.z0+6},{x:st.x0+st.dx*2,z:st.z0+st.dz*2},{x:cx,z:cz}], 4.5, {stop:true, dwell:80+Math.random()*160}),
    {P:smoothPath([{x:cx,z:cz},{x:st.x0+st.dx*3,z:st.z0+st.dz*3},{x:-66.4,z:st.z0+6},{x:ax,z:st.z0+16}],0.5),
     speed:1.3, rev:true, stop:true, dwell:1.0},
    _legFwd([{x:ax,z:st.z0+16},{x:ax,z:st.z0},{x:ax,z:-128},{x:-67,z:-140},{x:-72,z:-145},{x:-75,z:-146}], 5),
    _legFwd(RAMP_ENTRY.map(p=>({x:p.x,z:p.z})), 24, {ramp:true, merge:true}),
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
  const ahead=(px,pz,reach,wide)=>{ const dx=px-here.x, dz=pz-here.z, a=dx*fx+dz*fz, l=Math.abs(dx*fz-dz*fx);
    return a>0 && a<reach && l<wide; };
  const noseReach=(L.rev?-v.tail:v.nose)+6;
  let blockedBy=null;
  if(!driving && ahead(player.pos.x, player.pos.z, noseReach, v.hw+1.2) && Math.abs(player.feetY-here.y)<3) blockedBy="you";
  if(driving){ const p=driving.g.position; if(ahead(p.x,p.z,noseReach+2,v.hw+1.8)) blockedBy="car"; }
  let blk=null;
  for(const o of TRAFFIC){
    if(o===v || !o.route || o.route.dwell>0) continue;      // parked ones are in their stalls, not the aisle
    if(!ahead(o.g.position.x, o.g.position.z, noseReach+4, v.hw+1.5)) continue;
    if(o.route.blk===v && !_yieldsTo(v, o)) continue;       // it is waiting on us: go
    if(R.waited>25 && (o.route.waited||0)>25 && R.seq<o.route.seq) continue;   // a knot: the first one in is waved through
    blk=o; blockedBy="traffic";
  }
  R.blk=blk;
  if(blockedBy){ target=0; R.waited=(R.waited||0)+dt;
    if(blockedBy==="you" && R.waited>3.5 && !R.honked){ R.honked=true;
      if(typeof AUDIO!=="undefined") AUDIO.blip(v.big?"airhorn":"horn", here.x, here.z); } }
  else R.waited=0;
  v.braking = target < v.speed-0.2;
  v.speed += clamp(target-v.speed, -4.5*dt, (L.ramp?2.6:1.6)*dt);
  R.s=Math.min(len, R.s+v.speed*dt);
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
      if(R.li===1){ R.parked=true; COL_DYN.push(v.col); }
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
  const coat=new T.Color(0x8a6646), belly=new T.Color(0xcbbba0), dark=new T.Color(0x3a2c22), white=new T.Color(0xf0ece2);
  function build(scale, spotted){
    const parts={}, g=new T.Group();
    const mat2=new T.MeshStandardMaterial({vertexColors:true, roughness:0.92});
    const mk=(list)=>{ const m=new T.Mesh(mergeEntries(list), mat2); m.castShadow=true; return m; };
    const E=(geo,x,y,z,c,rx,ry,rz,sx,sy,sz)=>({geo:geo, matrix:new T.Matrix4().compose(V3(x,y,z),
      new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)), V3(sx||1,sy||1,sz||1)), color:c});
    const body=[E(new T.SphereGeometry(0.5,14,10),0,1.0,0,coat,0,0,0,0.42,0.48,1.0),
                E(new T.SphereGeometry(0.5,12,8),0,0.86,0.05,belly,0,0,0,0.36,0.30,0.82),
                E(new T.SphereGeometry(0.12,8,6),0,1.12,-0.50,white,0,0,0,1,0.9,0.6)];
    if(spotted) for(let k=0;k<10;k++) body.push(E(new T.SphereGeometry(0.035,6,4),(k%2?1:-1)*0.19,1.08+((k*7)%3)*0.04,-0.3+k*0.07,white));
    g.add(mk(body));
    // neck and head on a pivot at the shoulders, so it can graze
    const neck=new T.Group(); neck.position.set(0,1.15,0.38); g.add(neck);
    neck.add(mk([E(new T.CylinderGeometry(0.09,0.13,0.6,8),0,0.24,0.10,coat,0.55),
                 E(new T.SphereGeometry(0.13,10,8),0,0.50,0.25,coat,0,0,0,0.8,0.8,1.3),
                 E(new T.ConeGeometry(0.07,0.22,8),0,0.47,0.44,coat,Math.PI/2),
                 E(new T.SphereGeometry(0.035,6,4),0,0.47,0.55,dark),
                 E(new T.ConeGeometry(0.05,0.16,6),-0.09,0.64,0.18,coat,0,0,0.5),
                 E(new T.ConeGeometry(0.05,0.16,6), 0.09,0.64,0.18,coat,0,0,-0.5)]));
    // tail on its own pivot: down while grazing, up like a flag when it runs
    const tail=new T.Group(); tail.position.set(0,1.14,-0.52); g.add(tail);
    tail.add(mk([E(new T.SphereGeometry(0.07,8,6),0,-0.07,-0.02,coat,0,0,0,0.9,1.4,0.6),
                 E(new T.SphereGeometry(0.06,8,6),0,-0.07,-0.06,white,0,0,0,0.8,1.3,0.5)]));
    const legs=[];
    for(const [lx,lz] of [[-0.13,0.36],[0.13,0.36],[-0.13,-0.36],[0.13,-0.36]]){
      const L=new T.Group(); L.position.set(lx,0.92,lz); g.add(L);
      L.add(mk([E(new T.CylinderGeometry(0.045,0.035,0.5,6),0,-0.25,0,coat),
                E(new T.CylinderGeometry(0.03,0.022,0.44,6),0,-0.68,0,coat),
                E(new T.SphereGeometry(0.03,6,4),0,-0.9,0.01,dark)]));
      legs.push(L);
    }
    g.scale.setScalar(scale);
    return {g:g, neck:neck, tail:tail, legs:legs};
  }
  const SPOTS=[[29,-56],[31,-82],[30,-28],[32,46],[27,92],[-99,-150],[24,-124],[-96,92]];
  for(let i=0;i<3;i++){
    const b=build(i===0?1.0:0.82, false);
    const sp=SPOTS[i*2];
    const d={...b, x:sp[0], z:sp[1], yaw:Math.random()*6.28, mode:"graze", t:Math.random()*5, run:0,
             vx:0, vz:0, ph:Math.random()*6, home:i*2, gone:0};
    d.g.position.set(d.x, Terrain.groundAt(d.x,d.z), d.z);
    scene.add(d.g);
    DEER.push(d);
  }
  DEER.spots=SPOTS;
})();
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
      const g1=Terrain.clearDist(d.x+ax*10,d.z+az*10);
      for(let k=0;k<8;k++){ const a=Math.atan2(az,ax)+(k-4)*0.25, tx=Math.cos(a), tz=Math.sin(a);
        if(Terrain.clearDist(d.x+tx*10,d.z+tz*10)>g1+2){ ax=tx; az=tz; break; } }
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
      d.neck.rotation.x=-0.4; d.tail.rotation.x=2.2;           // the flag
      for(let k=0;k<4;k++) d.legs[k].rotation.x=Math.sin(d.run*10.4+(k<2?0:Math.PI))*0.9;
      if(d.run>4.5 || Terrain.clearDist(d.x,d.z)>45){ d.mode="gone"; d.gone=50+Math.random()*60; d.g.visible=false; }
      continue;
    }
    // grazing: step a little now and then, head down, look up, an ear flick
    d.t-=dt;
    if(d.t<=0){ d.t=2+Math.random()*6; d.walk=Math.random()<0.4 ? 1.2+Math.random()*1.5 : 0; d.yaw+=(Math.random()-0.5)*1.2; }
    if(d.walk>0){
      d.walk-=dt; const sp=0.7;
      const nx=d.x+Math.sin(d.yaw)*sp*dt, nz=d.z+Math.cos(d.yaw)*sp*dt;
      if(Terrain.clearDist(nx,nz)>-6 && Terrain.clearDist(nx,nz)<14){ d.x=nx; d.z=nz; } else d.yaw+=Math.PI*0.7;
      for(let k=0;k<4;k++) d.legs[k].rotation.x=Math.sin(now*6+(k%3)*1.5)*0.25;
    }else for(let k=0;k<4;k++) d.legs[k].rotation.x*=0.9;
    const alert=dist<38;
    const want=alert ? -0.2 : (Math.sin(now*0.4+d.ph)>-0.3 ? 1.25 : 0.0);
    d.neck.rotation.x += (want-d.neck.rotation.x)*Math.min(1,dt*3);
    d.tail.rotation.x += ((alert?0.6:-0.1)-d.tail.rotation.x)*Math.min(1,dt*4);
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
  updateFireflies(dt, now, dark);
  updateLeaves(dt, now);
  updateSmoke(dt);
}
